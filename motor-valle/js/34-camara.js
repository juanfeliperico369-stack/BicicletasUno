/* =====================================================================
   CÁMARA · una sola para todas las vistas (junta la cámara libre de Juega EnCicla y VC.camaraLibre de El Metro)
   - 2D (cenital, pixel, 3D oblicua, maqueta): punto mirado (x, y), zoom (px por metro), giro (yaw) e inclinación.
   - 3D en perspectiva (primera y tercera persona, dron y cine): ojo y punto mirado en metros, con su campo visual.
   - Gestos: pellizco = zoom, dos dedos que giran = girar, dos dedos arriba/abajo = inclinar, arrastrar = mirar o mover.
   - Sigue al jugador con suavidad (mira un poco hacia adelante) o queda libre; cambia de vista con transición.
   ===================================================================== */
const CAM_PERFIL = {
  primera: { dist: 0, alto: 1.62, pitch: .08, fov: 1.15 },
  tercera: { dist: 7, alto: 2.6, pitch: .22, fov: 1.0 },
  dron: { dist: 70, alto: 55, pitch: .62, fov: .95 },
  cine: { dist: 28, alto: 9, pitch: .18, fov: .8 },
  aerea: { dist: 900, alto: 650, pitch: .78, fov: .85 }
};
class Camara {
  constructor(op = {}) {
    this.x = op.x || 0; this.y = op.y || 0; this.zoom = op.zoom || 3; this.yaw = 0; this.pitch = .55; this.modo = 'sigue'; this.adelanto = 0;
    this.perfil = 'tercera'; this.d = Object.assign({}, CAM_PERFIL.tercera); this.mira = 0; this.mirarV = 0; this.ojo = [0, 0, 0]; this.blanco = [0, 0, 0]; this.fov = 1; this.orbita = 0;
    this.limites = { zoom: [.08, 14], pitch: [0, 1.25] }; this.tr = null; this.sacudida = 0;
  }
  /* gesto de la pantalla (de Controles) */
  gesto(g) {
    if (g.tipo === 'zoom') { this.zoom = clamp(this.zoom * g.k, ...this.limites.zoom); this.d.dist = clamp(this.d.dist / g.k, this.perfil === 'primera' ? 0 : 2.5, 2500); }
    else if (g.tipo === 'girar') { this.yaw -= g.da; this.mira -= g.da; }
    else if (g.tipo === 'inclinar') { this.pitch = clamp(this.pitch + g.dy * .006, ...this.limites.pitch); this.d.pitch = clamp(this.d.pitch + g.dy * .004, -.4, 1.4); }
    else if (g.tipo === 'mirar') { if (this.modo === 'libre') { const c = Math.cos(this.yaw), s = Math.sin(this.yaw); this.x -= (g.dx * c + g.dy * s) / this.zoom; this.y -= (-g.dx * s + g.dy * c) / this.zoom; } else { this.mira += g.dx * .006; this.d.pitch = clamp(this.d.pitch + g.dy * .004, -.4, 1.4); } }
  }
  usarPerfil(p) { if (!CAM_PERFIL[p]) return; this.perfil = p; this.d = Object.assign({}, CAM_PERFIL[p]); this.mira = 0; }
  /* objetivo: { x, y, z (altura del suelo en m), a (rumbo), v } · dt en s */
  actualizar(dt, o) {
    if (this.modo === 'sigue' && o) {
      this.adelanto = lerp(this.adelanto, clamp(o.v || 0, -4, 25) * .9, Math.min(1, dt * 1.5));
      const tx = o.x + Math.cos(o.a) * this.adelanto, ty = o.y + Math.sin(o.a) * this.adelanto, k = Math.min(1, dt * 6);
      this.x = lerp(this.x, tx, k); this.y = lerp(this.y, ty, k);
    }
    /* 3D en perspectiva: ojo detrás del rumbo (y lo que el jugador mire con el dedo) */
    if (o) {
      const P = this.d; this.orbita += dt * (this.perfil === 'cine' ? .12 : 0);
      if (this.perfil !== 'primera' && Math.abs(this.mira) > .001 && !(this._mirando > 0)) this.mira *= Math.pow(.25, dt);
      const ang = (o.a || 0) + this.mira + this.orbita + (this.perfil === 'cine' ? .8 : 0), z0 = o.z || 0;
      const adel = this.perfil === 'primera' ? .28 : 0, ex = o.x - Math.cos(ang) * (P.dist - adel), ey = o.y - Math.sin(ang) * (P.dist - adel), ez = z0 + P.alto + (this.perfil === 'primera' ? (o.zCuerpo || 0) : 0);
      const look = this.perfil === 'primera' ? 30 : Math.max(4, P.dist), lx = o.x + Math.cos(ang) * (this.perfil === 'primera' ? look : 4), ly = o.y + Math.sin(ang) * (this.perfil === 'primera' ? look : 4);
      const lz = this.perfil === 'primera' ? ez - Math.tan(P.pitch) * look : z0 + 1.2 - Math.tan(P.pitch) * 2;
      const k = this.perfil === 'primera' ? 1 : Math.min(1, dt * 5);
      this.ojo = [lerp(this.ojo[0], ex, k), lerp(this.ojo[1], ey, k), lerp(this.ojo[2], ez, k)]; this.blanco = [lx, ly, lz]; this.fov = P.fov;
      if (!isFinite(this.ojo[0]) || Math.hypot(this.ojo[0] - ex, this.ojo[1] - ey) > 500) this.ojo = [ex, ey, ez];
    }
    this.sacudida = Math.max(0, this.sacudida - dt * 2);
    if (this.tr) { this.tr.t += dt / this.tr.dur; if (this.tr.t >= 1) this.tr = null; }
  }
  /* transición entre vistas: 0..1 (la usa el gestor de vistas para mezclar) */
  transicion(dur = .6) { this.tr = { t: 0, dur }; }
  get mezcla() { return this.tr ? suave(this.tr.t) : 1; }
  /* metros → pantalla en 2D (con giro) y al revés */
  aPantalla(x, y, W, H) { const dx = x - this.x, dy = y - this.y, c = Math.cos(this.yaw), s = Math.sin(this.yaw); return [W / 2 + (dx * c - dy * s) * this.zoom, H / 2 + (dx * s + dy * c) * this.zoom]; }
  aMundo(px, py, W, H) { const dx = (px - W / 2) / this.zoom, dy = (py - H / 2) / this.zoom, c = Math.cos(-this.yaw), s = Math.sin(-this.yaw); return [this.x + dx * c - dy * s, this.y + dx * s + dy * c]; }
  /* caja de metros que se ve (con margen) */
  caja(W, H, m = 0) { const r = Math.hypot(W, H) / 2 / this.zoom + m; return [this.x - r, this.y - r, this.x + r, this.y + r]; }
}
Object.assign(MC, { Camara, CAM_PERFIL });
