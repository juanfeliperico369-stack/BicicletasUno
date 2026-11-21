/* =====================================================================
   TURNO CERO · 4.4 · lo que dejó pendiente Codex (C‑M40 y C‑M32), hecho por Claude
   - 🎬 MODO CINE (C‑M40, idea de *The Getaway*, 2002: sin minimapa ni flecha, las direccionales del carro indican el giro):
       la flecha al objetivo y el minimapa se esconden; el carro pone la direccional del lado de la próxima esquina de la ruta
       (cuando faltan menos de 90 m) y las estacionarias al llegar. Se prende en ⏸ Menú.
   - A PIE (C‑M32):
       · 🧱 CUBIERTA: quieta y pegada a un muro, los guardias ven a menos de la mitad de la distancia (se suma a la gema de luz);
       · 💨 ESQUIVAR (botón o tecla Q): un quiebre rápido de 3 m con 0,4 s en que los guardias no alcanzan a golpear.
   ===================================================================== */
const Cine = {
  ruta: null, tRuta: 0, giro: 0, dGiro: 1e9, llegando: false, _t: null,
  /* la próxima esquina de la ruta al objetivo: lado (-1 izquierda, 1 derecha) y distancia */
  calcular() {
    const C = G.cuerpo, O = G.objetivo; this.giro = 0; this.dGiro = 1e9; this.llegando = false; if (!O || !G.M) return;
    const dO = Math.hypot(O.x - C.x, O.y - C.y); if (dO < 35) { this.llegando = true; return; }
    let R = null; try { R = MC.Manejo.rutaA(G.M, C, O, 'rueda'); } catch (e) { R = null; } if (!Array.isArray(R) || R.length < 6) return;
    let i0 = 0, md = 1e9; for (let j = 0; j < R.length; j += 2) { const d = Math.hypot(R[j] - C.x, R[j + 1] - C.y); if (d < md) { md = d; i0 = j; } }
    let acum = 0, a0 = null; for (let j = i0; j + 3 < R.length && acum < 140; j += 2) {
      const dx = R[j + 2] - R[j], dy = R[j + 3] - R[j + 1], L = Math.hypot(dx, dy); if (L < .5) continue; const a = Math.atan2(dy, dx);
      if (a0 == null) a0 = a; else { const da = Math.atan2(Math.sin(a - a0), Math.cos(a - a0)); if (Math.abs(da) > .5) { this.giro = Math.sign(da); this.dGiro = acum + Math.hypot(R[j] - C.x, R[j + 1] - C.y) * 0; return; } a0 = a; }
      acum += L;
    }
  },
  /* las direccionales: dos luces ámbar a cada lado del carro, que titilan */
  dibujar(g, pr, d, t) {
    const C = G.cuerpo; if (!G.cine || !C || C.veh.clase === 'pie' || !G.objetivo) return;
    const on = Math.floor(t * 3) % 2 === 0; if (!on) return; const lados = this.llegando ? [-1, 1] : this.giro && this.dGiro < 90 ? [this.giro] : []; if (!lados.length) return;
    const L = (C.veh.largo || 4.4) / 2, W = (C.veh.ancho || 1.8) / 2, ca = Math.cos(C.a), sa = Math.sin(C.a), rx = -sa, ry = ca;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const s of lados) for (const f of [1, -1]) { const x = C.x + ca * L * f + rx * W * s, y = C.y + sa * L * f + ry * W * s, p = pr(x, y, .7); if (!p) continue; const k = Math.max(4, escalaEn(x, y) * .55);
      const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], k * 2.4); gr.addColorStop(0, 'rgba(255,190,60,.95)'); gr.addColorStop(.35, 'rgba(255,150,30,.55)'); gr.addColorStop(1, 'rgba(255,120,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], k * 2.4, 0, TAU); g.fill(); }
    g.restore();
  },
  /* ---- a pie: cubierta y esquivar ---- */
  cubierta() { const C = G.cuerpo, M = G.M; if (!C || !M || C.veh.clase !== 'pie' || Math.abs(C.v) > .6) return false; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; if (M.edificioEn(C.x + Math.cos(a) * 1.3, C.y + Math.sin(a) * 1.3, 0)) return true; } return false; },
  esquivar() {
    const C = G.cuerpo; if (!C || C.veh.clase !== 'pie' || G.pausa || (G.esquivaCD || 0) > 0) return false;
    G.esquivaT = .4; G.esquivaCD = 1.6; G.esquivaA = C.a; Snd.golpe(.08); G.ui.aviso('💨', 400, 'esquiva'); return true;
  },
  /* cada cuadro (desde la capa de dibujo): el quiebre del esquive y los tiempos */
  cuadro(t) {
    const dt = this._t == null ? 1 / 60 : clamp(t - this._t, 0, .1); this._t = t; G.esquivaCD = Math.max(0, (G.esquivaCD || 0) - dt);
    if ((G.esquivaT || 0) > 0) { G.esquivaT -= dt; const C = G.cuerpo, nx = C.x + Math.cos(G.esquivaA) * 7.5 * dt, ny = C.y + Math.sin(G.esquivaA) * 7.5 * dt; if (!G.M.edificioEn(nx, ny, 0)) { C.x = nx; C.y = ny; } }
    if (G.cine && G.objetivo && G.cuerpo && G.cuerpo.veh.clase !== 'pie' && (this.tRuta -= dt) <= 0) { this.tRuta = 1; this.calcular(); }
  }
};
(function () {
  G.cine = !!leerG().cine; document.body.classList.toggle('cine', G.cine); G.retro = !!leerG().retro;
  EXTRAS.hud.push(() => { if (G.retro && G.vistas && !G.vistas.colormap) { G.vistas.pixel = true; G.vistas.colormap = true; } });   /* 🕹️ Retro 1993 guardado: se reaplica al cambiar de mundo */
  const css = document.createElement('style'); css.textContent = 'body.cine .mcui canvas.mini{visibility:hidden}#gema.cubierta{outline:3px solid #9fd3ff;outline-offset:4px}'; document.head.appendChild(css);
  EXTRAS.capas.push((g, pr, d, t) => { Cine.cuadro(t); Cine.dibujar(g, pr, d, t); });
  EXTRAS.ui.push(b => { b('esquivar', '💨', 'Esquivar', () => Cine.esquivar()); BOT.esquivar.hidden = true; });
  EXTRAS.hud.push(() => {
    const C = G.cuerpo, pie = C && C.veh.clase === 'pie', peligro = (G.guardias || []).some(q => !q.fuera && Math.hypot(q.x - C.x, q.y - C.y) < 25) || (G.busq && G.busq.nivel > 0);
    if (BOT.esquivar) BOT.esquivar.hidden = !(pie && peligro);
    const cub = G.cubierta = Cine.cubierta(); const el = document.getElementById('gema'); if (el) el.classList.toggle('cubierta', cub);
    if (cub && peligro && !leerG().cubiertaVista) { escribirG({ cubiertaVista: true }); G.ui.aviso('🧱 Cubierta: quieta y pegada al muro, los guardias te ven mucho menos', 3000, 'cubierta'); }
  });
  window.addEventListener('keydown', e => { if (e.code === 'KeyQ' && G.M) Cine.esquivar(); });
  /* durante el esquive, los guardias no alcanzan a golpear */
  const _gp = Extras.guardiasPersiguen; Extras.guardiasPersiguen = function (dt) { if ((G.esquivaT || 0) > 0) for (const q of G.guardias) q.golpeT = Math.max(q.golpeT || 0, .3); return _gp.call(this, dt); };
  G.Cine = Cine;
})();
