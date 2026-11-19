/* =====================================================================
   CÁMARA · una sola para todas las vistas (junta la cámara libre de Juega EnCicla y VC.camaraLibre de El Metro)
   - 2D (cenital, pixel, 3D oblicua, maqueta): punto mirado (x, y), zoom (px por metro), giro (yaw) e inclinación.
   - 3D en perspectiva (primera y tercera persona, dron y cine): ojo y punto mirado en metros, con su campo visual.
   - Gestos: pellizco = zoom, dos dedos que giran = girar, dos dedos arriba/abajo = inclinar, arrastrar = mirar o mover.
   - Sigue al jugador con resortes críticamente amortiguados (igual a cualquier FPS), zona muerta y mirada adelante.
   - 3D: brazo con choque (edificios, cerros y tableros de puentes), campo visual según la velocidad y sacudida por trauma.
   - Lateral: gira de a 90° (girar90) e inclina hasta ver de lado (inclinarA), con animación.
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
    this.limites = { zoom: [.08, 14], pitch: [0, 1.45] }; this.tr = null; this.sacudida = 0; this.trauma = 0; this.mundo = op.mundo || null;
    this.yawObj = null; this.pitchObj = null; this._vy = { v: 0 }; this._vp = { v: 0 }; this._vx = { v: 0 }; this._vy2 = { v: 0 }; this._vb = { v: 0 }; this._ve = [{ v: 0 }, { v: 0 }, { v: 0 }]; this.brazo = 1; this.zonaMuerta = op.zonaMuerta ?? 18; this.offPantalla = [0, 0];
  }
  /* gesto de la pantalla (de Controles) */
  gesto(g) {
    if (g.tipo === 'zoom') { this.zoom = clamp(this.zoom * g.k, ...this.limites.zoom); this.d.dist = clamp(this.d.dist / g.k, this.perfil === 'primera' ? 0 : 2.5, 2500); }
    else if (g.tipo === 'girar') { this.yawObj = null; this.yaw -= g.da; this.mira -= g.da; }
    else if (g.tipo === 'inclinar') { this.pitchObj = null; this.pitch = clamp(this.pitch + g.dy * .006, ...this.limites.pitch); this.d.pitch = clamp(this.d.pitch + g.dy * .004, -.4, 1.4); }
    else if (g.tipo === 'mirar') { if (this.modo === 'libre') { const c = Math.cos(this.yaw), s = Math.sin(this.yaw); this.x -= (g.dx * c + g.dy * s) / this.zoom; this.y -= (-g.dx * s + g.dy * c) / this.zoom; } else { this.mira += g.dx * .006; this.d.pitch = clamp(this.d.pitch + g.dy * .004, -.4, 1.4); } }
  }
  usarPerfil(p) { if (!CAM_PERFIL[p]) return; this.perfil = p; this.d = Object.assign({}, CAM_PERFIL[p]); this.mira = 0; }
  /* giro y inclinación animados (la vista lateral gira de a 90°, como el mundo de FEZ) */
  girar90(dir = 1) { const base = this.yawObj ?? this.yaw; this.yawObj = Math.round(base / (Math.PI / 2)) * (Math.PI / 2) + dir * Math.PI / 2; return this; }
  girarA(yaw) { this.yawObj = yaw; return this; }
  inclinarA(p) { this.pitchObj = clamp(p, ...this.limites.pitch); return this; }
  /* golpe de cámara por «trauma» (0..1): la sacudida es trauma², con ruido suave, y se apaga sola */
  sacudir(k = .4) { this.trauma = clamp((this.trauma || 0) + k, 0, 1); return this; }
  /* objetivo: { x, y, z (altura de los pies en m), a (rumbo), v, zPaso, mundo } · dt en s */
  actualizar(dt, o) {
    dt = Math.min(dt || 0, .1); this._t = (this._t || 0) + dt;
    if (this.yawObj != null) { this.yaw = resorteAng(this.yaw, this.yawObj, this._vy, .16, dt); if (Math.abs(angDif(this.yaw, this.yawObj)) < 1e-3) { this.yaw = this.yawObj; this.yawObj = null; this._vy.v = 0; } }
    if (this.pitchObj != null) { this.pitch = resorte(this.pitch, this.pitchObj, this._vp, .2, dt); if (Math.abs(this.pitch - this.pitchObj) < 1e-3) { this.pitch = this.pitchObj; this.pitchObj = null; this._vp.v = 0; } }
    if (this.modo === 'sigue' && o) {
      /* mira hacia adelante según la velocidad, con zona muerta (lo pequeño no mueve la cámara: menos mareo) */
      this.adelanto = lerp(this.adelanto, clamp(o.v || 0, -4, 25) * .9, Math.min(1, dt * 1.5));
      const tx = o.x + Math.cos(o.a) * this.adelanto, ty = o.y + Math.sin(o.a) * this.adelanto, zm = this.zonaMuerta / Math.max(.05, this.zoom);
      if (this._fx == null || Math.hypot(tx - this._fx, ty - this._fy) > 400) { this._fx = tx; this._fy = ty; this.x = tx; this.y = ty; }
      const ddx = tx - this._fx, ddy = ty - this._fy, dd = Math.hypot(ddx, ddy); if (dd > zm) { this._fx += ddx * (1 - zm / dd); this._fy += ddy * (1 - zm / dd); }
      this.x = resorte(this.x, this._fx, this._vx, .2, dt); this.y = resorte(this.y, this._fy, this._vy2, .2, dt);
    }
    /* 3D en perspectiva: ojo detrás del rumbo (y lo que el jugador mire con el dedo) */
    if (o) {
      const P = this.d, M = o.mundo || this.mundo; this.orbita += dt * (this.perfil === 'cine' ? .12 : 0);
      if (this.perfil !== 'primera' && Math.abs(this.mira) > .001 && !(this._mirando > 0)) this.mira *= Math.pow(.25, dt);
      const ang = (o.a || 0) + this.mira + this.orbita + (this.perfil === 'cine' ? .8 : 0), z0 = o.z || 0, prim = this.perfil === 'primera';
      /* brazo con choque: si un edificio o el cerro quedan entre el jugador y la cámara, la cámara se acerca rápido
         y vuelve despacio (el «spring arm» de los motores grandes); bajo un puente, la cámara no se mete en el tablero */
      let brazo = 1;
      const aereo = this.perfil === 'dron' || this.perfil === 'aerea';
      if (!prim && !aereo && M && P.dist > 1.5) {
        const hz = z0 + 1.6; for (let i = 1; i <= 8; i++) { const t = i / 8, px = o.x - Math.cos(ang) * P.dist * t, py = o.y - Math.sin(ang) * P.dist * t, pz = hz + (P.alto - 1.6) * t, cz = M.cota(px, py); const e = M.edificioEn ? M.edificioEn(px, py, .6) : null; if (pz < cz + .6 || (e && pz < cz + (e.h || 6) + .5)) { brazo = Math.max(.15, (i - 1) / 8); break; } }
      }
      this.brazo = brazo < this.brazo ? lerp(this.brazo, brazo, Math.min(1, dt * 20)) : resorte(this.brazo, brazo, this._vb, .5, dt);
      const dist = prim ? 0 : P.dist * this.brazo, adel = prim ? .28 : 0;
      let ex = o.x - Math.cos(ang) * (dist - adel), ey = o.y - Math.sin(ang) * (dist - adel), ez = prim ? z0 + P.alto + (o.zCuerpo || 0) : z0 + 1.6 + (P.alto - 1.6) * this.brazo;
      if (M && aereo) { const e = M.edificioEn ? M.edificioEn(ex, ey, 2) : null; if (e) ez = Math.max(ez, M.cota(ex, ey) + (e.h || 6) + 4); }   // el dron pasa por encima de las torres
      if (M && !prim) { ez = Math.max(ez, M.cota(ex, ey) + .8); const nv = M.nivel ? M.nivel(ex, ey) : 0; if (nv > 0 && (o.zPaso || 0) < 1) { const techo = M.cota(ex, ey) + nv * NIVEL_M - 1; if (ez > techo - 1.5 && ez < techo + 3) ez = Math.max(z0 + 1.1, techo - 1.5); } }
      const look = prim ? 30 : Math.max(4, dist), lx = o.x + Math.cos(ang) * (prim ? look : 4), ly = o.y + Math.sin(ang) * (prim ? look : 4);
      const lz = prim ? ez - Math.tan(P.pitch) * look : z0 + 1.2 - Math.tan(P.pitch) * 2;
      if (prim || !isFinite(this.ojo[0]) || Math.hypot(this.ojo[0] - ex, this.ojo[1] - ey) > 500) { this.ojo = [ex, ey, ez]; this._ve.forEach(q => q.v = 0); }
      else this.ojo = [resorte(this.ojo[0], ex, this._ve[0], .12, dt), resorte(this.ojo[1], ey, this._ve[1], .12, dt), resorte(this.ojo[2], ez, this._ve[2], .16, dt)];
      this.blanco = [lx, ly, lz];
      /* sensación de velocidad: el campo visual se abre un poco al ir rápido (como en los juegos de carreras) */
      const fovObj = P.fov * (1 + (prim ? .08 : .16) * clamp((Math.abs(o.v || 0) - 8) / 30, 0, 1)); this.fov = lerp(this.fov, fovObj, Math.min(1, dt * 3));
    }
    /* sacudida: trauma² con ruido suave (no un temblor al azar) */
    if (this.sacudida > 0) this.trauma = Math.max(this.trauma || 0, this.sacudida);
    this.sacudida = Math.max(0, this.sacudida - dt * 2); this.trauma = Math.max(0, (this.trauma || 0) - dt * .9);
    const sh = (this.trauma || 0) ** 2; if (sh > 1e-4 && o) { const t = this._t, n = (a, b) => (Math.sin(t * a + b) + Math.sin(t * a * 1.7 + b * 2.3)) / 2; this.ojo = [this.ojo[0] + n(23, 1) * sh * .35, this.ojo[1] + n(19, 2) * sh * .35, this.ojo[2] + n(29, 3) * sh * .25]; this.offPantalla = [n(17, 4) * sh * 6, n(13, 5) * sh * 6]; } else this.offPantalla = [0, 0];
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
