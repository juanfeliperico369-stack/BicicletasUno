/* =====================================================================
   GPU VIRTUAL · que el juego ande fluido en cualquier aparato, tenga o no tenga tarjeta gráfica
   1. PERFIL: mira qué hay (WebGL 2 o 1, el nombre del procesador gráfico, si es por software como SwiftShader
      o llvmpipe, el tamaño máximo de textura, la memoria, los núcleos y la densidad de la pantalla) y elige un nivel:
      'alta' · 'media' · 'baja' · 'software' (sin GPU: la 3D la dibuja MC.Raster en Canvas 2D).
   2. RESOLUCIÓN DINÁMICA: un controlador PI que sube o baja la escala de dibujo (0,5–1) para cumplir el tiempo de
      cuadro objetivo (16,7 ms a 60 Hz o 33,3 ms a 30 Hz). Es lo que hacen las consolas: bajar píxeles antes que cuadros.
   3. BUCLE DE PASO FIJO: la física avanza en pasos de 1/60 s (determinista e igual en todo aparato), el dibujo
      interpola entre el paso anterior y el actual, y hay tope para que un aparato lento no entre en la «espiral de
      la muerte». Se pausa sola cuando la pestaña no se ve (ahorra batería).
   4. RESORTES: suavizado críticamente amortiguado (el SmoothDamp de los motores grandes), igual a cualquier FPS.
   ===================================================================== */
const GPU = {
  _perfil: null,
  /* lo que tiene el aparato (se mide una vez) */
  perfil(forzar) {
    if (this._perfil && !forzar) return this._perfil;
    const P = { webgl: 0, renderer: '', software: false, maxTex: 0, memoria: 0, nucleos: 1, dpr: 1, movil: false, reducirMovimiento: false, nivel: 'media' };
    if (typeof window === 'undefined' || typeof document === 'undefined') { P.nivel = 'sin-pantalla'; return (this._perfil = P); }
    const nav = window.navigator || {}; P.memoria = nav.deviceMemory || 0; P.nucleos = nav.hardwareConcurrency || 1; P.dpr = window.devicePixelRatio || 1;
    P.movil = /Android|iPhone|iPad|Mobile/i.test(nav.userAgent || '') || (window.matchMedia && matchMedia('(pointer:coarse)').matches);
    P.reducirMovimiento = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    try {
      const cv = document.createElement('canvas'); let gl = cv.getContext('webgl2'); P.webgl = gl ? 2 : 0;
      if (!gl) { gl = cv.getContext('webgl') || cv.getContext('experimental-webgl'); P.webgl = gl ? 1 : 0; }
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info'); P.renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '');
        P.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0; P.software = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(P.renderer);
        const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
      }
    } catch (e) { P.webgl = 0; }
    /* el nivel: sin WebGL o por software → 'software'; poca memoria o pocos núcleos → 'baja' */
    if (!P.webgl || P.software) P.nivel = 'software';
    else if ((P.memoria && P.memoria <= 2) || P.nucleos <= 2 || P.maxTex < 4096) P.nivel = 'baja';
    else if (P.movil && (P.memoria && P.memoria <= 4 || P.nucleos <= 4)) P.nivel = 'media';
    else P.nivel = 'alta';
    return (this._perfil = P);
  },
  /* lo que conviene en cada nivel: escala de dibujo, cuadros por segundo, calidad inicial, si usar WebGL */
  ajustes(nivel = this.perfil().nivel) {
    return ({
      alta: { escala: 1, fps: 60, calidad: 1, gl: true, dprMax: 2 },
      media: { escala: .85, fps: 60, calidad: .8, gl: true, dprMax: 1.5 },
      baja: { escala: .7, fps: 30, calidad: .55, gl: true, dprMax: 1 },
      software: { escala: .6, fps: 30, calidad: .45, gl: false, dprMax: 1 },
      'sin-pantalla': { escala: 1, fps: 60, calidad: 1, gl: false, dprMax: 1 }
    })[nivel] || { escala: .8, fps: 60, calidad: .8, gl: true, dprMax: 1.5 };
  }
};

/* controlador de resolución dinámica: medir() cada cuadro con los ms de dibujo; escala va de min a max */
class ResDinamica {
  constructor(op = {}) { this.objetivo = op.objetivo || 1000 / 60; this.min = op.min ?? .5; this.max = op.max ?? 1; this.escala = op.escala ?? 1; this.integral = 0; this.ms = this.objetivo; this.kp = op.kp ?? .012; this.ki = op.ki ?? .002; }
  medir(ms) {
    if (!(ms >= 0) || ms > 1000) return this.escala; this.ms = this.ms * .85 + ms * .15;
    const err = (this.objetivo * .85 - this.ms) / this.objetivo;   // margen del 15 %: el navegador también necesita su tiempo
    this.integral = clamp(this.integral + err, -20, 20);
    /* el costo del dibujo crece con el área (escala²): se corrige en raíz para no oscilar */
    this.escala = clamp(this.escala + this.kp * err + this.ki * this.integral * .1, this.min, this.max);
    return this.escala;
  }
}

/* bucle de juego de paso fijo con interpolación: actualizar(dt fijo) y dibujar(alfa, dtReal) */
class Bucle {
  constructor({ actualizar, dibujar, paso = 1 / 60, maxPasos = 5 } = {}) { this.actualizar = actualizar; this.dibujar = dibujar; this.paso = paso; this.maxPasos = maxPasos; this.acum = 0; this.t0 = 0; this.corre = false; this.fps = 60; this.pasos = 0; this._f = t => this._cuadro(t); this.limiteFps = 0; this._ultDib = 0; }
  iniciar() { if (this.corre) return this; this.corre = true; this.t0 = MC.ahora(); if (typeof document !== 'undefined' && !this._vis) { this._vis = () => { if (document.hidden) this.pausar(); else this.iniciar(); }; document.addEventListener('visibilitychange', this._vis); } if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(this._f); return this; }
  pausar() { this.corre = false; }
  /* un cuadro (también se puede llamar a mano en pruebas con t en ms) */
  _cuadro(t) {
    if (!this.corre) return; let dt = (t - this.t0) / 1000; this.t0 = t; if (!(dt > 0)) dt = 0; dt = Math.min(dt, .25);   // tope: nunca más de 1/4 s de golpe
    this.acum += dt; let n = 0;
    if (MC._pausaImpacto > 0) { MC._pausaImpacto -= dt; this.acum = 0; }   /* 2.7 · hitstop: tras un golpe, el mundo se congela un instante (se sigue dibujando) */
    else while (this.acum >= this.paso && n < this.maxPasos) { this.actualizar && this.actualizar(this.paso); this.acum -= this.paso; n++; this.pasos++; }
    if (n === this.maxPasos) this.acum = 0;   // espiral de la muerte: se suelta el atraso
    this.fps = this.fps * .95 + (dt > 0 ? 1 / dt : 60) * .05;
    const espera = this.limiteFps ? 1000 / this.limiteFps - 1 : 0;
    if (!espera || t - this._ultDib >= espera) { this._ultDib = t; this.dibujar && this.dibujar(this.acum / this.paso, dt); }
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(this._f);
  }
}

/* resorte críticamente amortiguado (SmoothDamp): llega sin pasarse, igual a 30 o a 144 cuadros por segundo.
   estado = { v } (velocidad); t = tiempo de llegada aproximado (s) */
function resorte(actual, objetivo, estado, t, dt) {
  const w = 2 / Math.max(1e-4, t), x = w * dt, ex = 1 / (1 + x + .48 * x * x + .235 * x * x * x), d = actual - objetivo, tmp = (estado.v + w * d) * dt;
  estado.v = (estado.v - w * tmp) * ex; let r = objetivo + (d + tmp) * ex;
  if ((objetivo - actual > 0) === (r > objetivo)) { r = objetivo; estado.v = 0; }   // no se pasa del objetivo
  return r;
}
function resorteAng(actual, objetivo, estado, t, dt) { return resorte(actual, actual + angDif(actual, objetivo), estado, t, dt); }
Object.assign(MC, { GPU, ResDinamica, Bucle, resorte, resorteAng });
