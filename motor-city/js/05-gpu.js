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

/* DENSIDAD DINÁMICA DEL LIENZO (2.11). En 2D lo caro es pintar píxeles (el reloj de JS no lo ve: el cuadro tarda 2 ms en JS
   y 27 ms en total en la maqueta con densidad 2). Se mide el tiempo REAL entre cuadros y se elige la densidad del lienzo
   (píxeles del lienzo por píxel CSS). El juego redimensiona su lienzo y multiplica el zoom de la cámara por la razón.
   Medido en Chromium sin GPU, celular 412×860: maqueta con densidad 2 → 1,5 pasa de 21–27 ms a 16,7 ms; el cómic, de 35 a 19.
   Reglas: escalones fijos; baja tras ~0,8 s por encima de 21 ms; solo se queda abajo si de verdad mejoró (si no, el cuello
   no es pintar o la pantalla va a 30 Hz, y vuelve con un «piso» de 60 s); sube tras 4 s holgados; si al subir se pone lento
   enseguida, ese escalón queda de «techo» 30 s. Un estado por clave (vista), porque cada vista cuesta distinto.
   Uso: const D = new MC.DensidadLienzo({ max: Math.min(2, devicePixelRatio) });  cada cuadro: const d = D.medir(dt, vista.id); */
class DensidadLienzo {
  constructor(op = {}) { this.max = op.max || 1; this.min = op.min ?? .75; this.activa = op.activa !== false; this.pasos = this._pasos(); this.R = {}; this.d = this.max; }
  _pasos() { const L = []; for (const m of DensidadLienzo.FACTORES) { const d = Math.max(this.min, Math.round(this.max * m * 100) / 100); if (!L.includes(d)) L.push(d); } return L; }
  ponerMax(max) { if (Math.abs(max - this.max) < 1e-6) return; this.max = max; this.pasos = this._pasos(); this.R = {}; }
  medir(dt, clave = 'v') {
    const P = this.pasos; if (!this.activa) return (this.d = P[0]);
    const R = this.R[clave] ||= { i: 0, techo: 0, techoT: 0, piso: 99, pisoT: 0, ema: null, lento: 0, holgado: 0, prueba: null, subio: 99 }, ms = dt * 1000;
    if (!(ms > 0) || ms > 250) return (this.d = P[R.i]);   // pestaña en pausa o cuadro perdido: no cuenta
    R.ema = R.ema == null ? ms : R.ema * .9 + ms * .1; R.subio += dt;
    if (R.techo > 0 && (R.techoT -= dt) <= 0) { R.techo--; R.techoT = 30; } if (R.piso < 99 && (R.pisoT -= dt) <= 0) R.piso = 99;
    if (R.prueba && (R.prueba.t += dt) > .6) {   // el primer medio segundo se hornean las losas nuevas: no cuenta
      const Q = R.prueba; Q.m = Q.m == null ? ms : Q.m * .9 + ms * .1;
      if (Q.t > 2.2) { if (Q.m > Q.antes * .93) { R.i = Q.i0; R.piso = R.i; R.pisoT = 60; } R.ema = Q.m; R.prueba = null; }
    }
    if (R.ema > 21) { R.lento += dt; R.holgado = 0; } else if (R.ema < 18.2) { R.holgado += dt; R.lento = Math.max(0, R.lento - dt); } else { R.lento = Math.max(0, R.lento - dt * .5); R.holgado = 0; }
    if (!R.prueba && R.lento > .8 && R.i < Math.min(P.length - 1, R.piso)) { if (R.subio < 2.5) { R.techo = R.i + 1; R.techoT = 30; } R.prueba = { i0: R.i, antes: R.ema, t: 0, m: null }; R.i++; R.lento = 0; }
    else if (!R.prueba && R.holgado > 4 && R.i > R.techo) { R.i--; R.holgado = 0; R.subio = 0; }
    return (this.d = P[R.i]);
  }
}
DensidadLienzo.FACTORES = [1, .75, .62, .5];

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
Object.assign(MC, { GPU, ResDinamica, DensidadLienzo, Bucle, resorte, resorteAng });
