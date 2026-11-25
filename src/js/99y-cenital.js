/* =====================================================================
   99y · EL CENITAL NUEVO EN EL MODO LIBRE (renacimiento cenital, Fase 2 · Claude, 24‑nov‑2026)
   Solo en el paseo libre (Usuario → modo libre, mode.free), detrás de una bandera (decisión 3 del autor). Los 9 oficios
   (incluidos los cenitales: Usuario, Apoyo, Técnico, Balance y Supervisor), los turnos y los minijuegos siguen con el render
   de hoy: este archivo solo envuelve funciones y mira la bandera.
   La bandera: `?cenital` (o `?cenital=0`) en la dirección, Save.data.settings.cenital (1 o 0) o JE.cenital.forzar (pruebas).
   En la Fase 2 viene apagada (PREDETERMINADA = 0); la Fase 3 la enciende. El guardado juegaencicla.v1 no cambia.
   Lo que EnCicla ya tenía y se queda igual: la sombra de contacto del 2D (la elipse de blit bajo cada sprite), la silueta del
   ciclista encima cuando algo lo tapa en la ciudad 3D del 2D, y la cámara 2D con 1 − e^(−k·dt) (Ride.camara y Cam.tick).
   Con la bandera, en el modo libre:
   1. 3D (tercera y primera persona): tu silueta donde un edificio, el viaducto o un puente te tapa. El tablero no se esconde nunca.
   2. 3D: sombra de contacto (elipse oscura) bajo cada carro, bus, bici, persona y bajo ti.
   3. Bruma en el 12 % de arriba (2D y 3D), con el color del horizonte de la hora: una capa CSS que no cuesta por cuadro.
   4. Cámara 3D: el giro y la distancia con 1 − e^(−k·dt) (antes min(1, dt·k)): igual a 60 cuadros por segundo, sin rezagarse a 20.
   No aplican en EnCicla: el anillo lejano (es de El Metro), los zócalos y el terreno facetado (el piso 3D de EnCicla es plano:
   no hay ladera donde una casa flote).
   ===================================================================== */
(function () {
  if (typeof Ride === 'undefined' || typeof Mundo3D === 'undefined') return;
  const PREDETERMINADA = 0;   // Fase 3: 1
  const URL_ON = typeof location !== 'undefined' ? (/[?&]cenital=0\b/.test(location.search) ? 0 : /[?&]cenital\b/.test(location.search) ? 1 : null) : null;
  const CEN = JE.cenital = {
    forzar: null, n: { sombras: 0, siluetas: 0 },
    encendida() { if (this.forzar != null) return !!this.forzar; if (URL_ON != null) return !!URL_ON; const s = Save.data && Save.data.settings, v = s && s.cenital; return v == null ? !!PREDETERMINADA : v === 1; },
    activo(R) { return !!(R && R.mode && R.mode.free && this.encendida()); },
    /* bruma: una capa CSS justo después del lienzo (#cv), así queda encima del dibujo y debajo del HUD, que va después en el DOM */
    bruma(on, R) {
      if (JE.headless || typeof document === 'undefined') return; let d = this._bd;
      if (!d) { if (!on) return; const cv = document.getElementById('cv'); if (!cv) return; d = this._bd = document.createElement('div'); d.id = 'cenBruma'; d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;left:0;right:0;top:0;height:12%;pointer-events:none;display:none'; cv.after(d); }
      if (!on) { if (d.style.display !== 'none') d.style.display = 'none'; return; }
      const t = performance.now(); if (t - (this._bt || 0) > 2000 || d.style.display === 'none') { this._bt = t; const h = (Art.sky((R && (R.min || (R.mode && R.mode.clock))) || 600)[1] || '#cfe0ea').replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6), 16), C = [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','), bg = `linear-gradient(rgba(${C},.5),rgba(${C},.18) 50%,rgba(${C},0))`; if (this._bg !== bg) { d.style.background = bg; this._bg = bg; } d.style.display = 'block'; }
    }
  };

  /* ---------- 3 · bruma: la mira cada dibujo del recorrido (2D y 3D), y se va al salir ---------- */
  const r0 = Ride.prototype.render;
  Ride.prototype.render = function () { CEN.bruma(CEN.activo(this), this); return r0.apply(this, arguments); };
  for (const k of ['stop', 'finish']) { const f = Game[k]; if (typeof f === 'function') Game[k] = function () { CEN.bruma(false); return f.apply(this, arguments); }; }

  /* ---------- 4 · cámara 3D: el giro y la distancia de antes daban un paso de min(1, dt·k); aquí ese paso se lleva a 1 − e^(−k·dt) ---------- */
  const cam0 = Mundo3D.camara;
  Mundo3D.camara = function (R) {
    if (!CEN.activo(R)) return cam0.apply(this, arguments);
    const dt = this._dt || .016, ten = this.modo === 'primera', y0 = this.yaw, D0 = this.D, r = cam0.apply(this, arguments);
    const ky = ten ? 9 : 4, my = Math.min(1, dt * ky); if (my > 0 && y0 != null) this.yaw = y0 + (this.yaw - y0) * (1 - Math.exp(-dt * ky)) / my;
    if (D0 != null && this.D != null && this.D !== D0) { const kd = this.D < D0 ? 12 : 3, md = Math.min(1, dt * kd); if (md > 0) this.D = D0 + (this.D - D0) * (1 - Math.exp(-dt * kd)) / md; }
    const d0 = this._dt; this._dt = 1e-9; try { cam0.apply(this, arguments); } finally { this._dt = d0; }   // rehace la vista con el giro y la distancia corregidos (un paso nulo)
    return r;
  };

  /* ---------- 1 y 2 · 3D: sombras de contacto y tu silueta, después del dibujo de siempre ---------- */
  /* dos octágonos planos a ras del piso (h), uno dentro del otro: el centro queda más oscuro (se suman al mezclar), en el formato
     de Mundo3D: [x, h, y, nx, ny, nz, r, g, b, u, v] */
  const elipse = (o, x, y, a, L, W, h) => { for (const f of [1, .6]) elipse1(o, x, y, a, L * f, W * f, h + (1 - f) * .02); };
  const elipse1 = (o, x, y, a, L, W, h) => {
    const ca = Math.cos(a), sa = Math.sin(a), rx = L / 2 * 1.08 + .6, rz = W / 2 * 1.2 + .6, v = (px, py) => o.push(px, h, py, 0, 1, 0, .03, .04, .06, 0, 0);
    for (let j = 0; j < 8; j++) { const t0 = j / 8 * TAU, t1 = (j + 1) / 8 * TAU, p0 = [Math.cos(t0) * rx, Math.sin(t0) * rz], p1 = [Math.cos(t1) * rx, Math.sin(t1) * rz];
      v(x, y); v(x + ca * p1[0] - sa * p1[1], y + sa * p1[0] + ca * p1[1]); v(x + ca * p0[0] - sa * p0[1], y + sa * p0[0] + ca * p0[1]); }
  };
  const dib0 = Mundo3D.dibujar;
  Mundo3D.dibujar = function (R) {
    const r = dib0.apply(this, arguments); if (!CEN.activo(R) || !this.gl || !this.vp || !this.modo) return r;
    const gl = this.gl, P = R.p, ZA = this.ZA, cul = gl.isEnabled(gl.CULL_FACE);
    try {
      /* sombras: todas en un dibujo, translúcidas (0,2 el borde y 0,36 el centro), sin escribir profundidad */
      const o = [], cerca = (x, y, m) => Math.abs(x - P.x) < m && Math.abs(y - P.y) < m;
      for (const c of R.cars || []) { if (!cerca(c.x, c.y, 420)) continue; const Lg = c.kind === 'bus' ? 19 : c.kind === 'bici' ? 3 : 7, Wd = c.kind === 'bus' ? 4 : c.kind === 'bici' ? 1 : 3.1; elipse(o, c.x, c.y, c.ang || 0, Lg, Wd, (c.arriba ? (c.z || 0) * ZA : 0) + .08); }   // la misma altura de su caja (99d)
      for (const q of R.peds || []) if (cerca(q.x, q.y, 300)) elipse(o, q.x, q.y, 0, .9, .9, .08);
      const alto = (P.lvl > 0 ? (P.z || 0) : 0) * ZA, v = P.veh; elipse(o, P.x, P.y, P.a, v === 'truck' ? 12 : v === 'walk' ? .9 : 3, v === 'truck' ? 4 : v === 'walk' ? .9 : 1, alto + .08);
      CEN.n.sombras = o.length / 11 / 48;
      gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendColor(0, 0, 0, .2); gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA); gl.depthMask(false);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.din); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(o), gl.DYNAMIC_DRAW); this.pintar({ b: this.din, n: o.length / 11 });
      /* tu silueta (en primera persona no hace falta): una caja un poco más grande que tú, pintada solo donde algo está delante */
      if (this.modo !== 'primera') {
        const s = []; if (v === 'truck') this.caja(s, P.x, P.y, P.a, 12.6, 4.4, 7.8, alto + .2, [1, .6, .16]); else this.caja(s, P.x, P.y, P.a, v === 'walk' ? 1.5 : 3.4, v === 'walk' ? 1.6 : 1.7, v === 'walk' ? 4.2 : 5.1, alto + .2, [1, .6, .16]);
        gl.enable(gl.CULL_FACE); /* solo las caras de adelante: las de atrás quedan detrás de ti y te pintarían encima */ gl.depthFunc(gl.GREATER); gl.blendColor(0, 0, 0, .58); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(s), gl.DYNAMIC_DRAW); this.pintar({ b: this.din, n: s.length / 11 }); CEN.n.siluetas++;
      }
    } catch (e) { if (!CEN._err) { CEN._err = 1; JE.errors.push('cenital 3D: ' + e.message); } }
    finally { gl.depthFunc(gl.LESS); gl.depthMask(true); gl.disable(gl.BLEND); if (cul) gl.enable(gl.CULL_FACE); }
    return r;
  };
})();
