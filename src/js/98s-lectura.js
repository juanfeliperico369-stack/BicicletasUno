/* =====================================================================
   LECTURA CENITAL (v2.1) · la forma de *Hunter Assassin* (Ruby Games) que admira el autor, adaptada a una ciclorruta:
   vista desde arriba limpia y legible, con lo importante resaltado como las linternas de ese juego.
   (Solo la idea de lectura —arriba, cerca, luz y sombra—; ni su arte ni sus niveles. Motor City 4.5 § 7 del informe.)
   - EL CICLISTA: un halo suave debajo y un cono de luz hacia donde va, más largo cuanto más rápido. El cono se CORTA en
     los edificios y la montaña (como en Shadow Tactics: «el cono es información; se corta donde la vista se corta»).
     De noche es el farol de la bici: luz cálida que suma (las bicis de EnCicla tienen luces).
   - LAS ESTACIONES CERCANAS: un aro verde que respira (las 3 más cercanas que se ven), para encontrarlas de un vistazo.
   - LA BICI PARQUEADA: si vas a pie y te alejas, un aro que late sobre ella.
   No se dibuja en la panorámica ni en las pruebas sin pantalla.
   ===================================================================== */
const Lectura = JE.lectura = {
  /* los rayos de luz se cortan en lo que tapa la vista (no en el agua ni el pasto) */
  tapa(map, x, y) { const t = map.get(Math.floor(x / TS), Math.floor(y / TS)); return t === TT.BLDG || t === TT.MOUNT; },
  rayos(R, largo, abre, n = 9) {
    const P = R.p, out = [], paso = 4;
    for (let k = 0; k < n; k++) {
      const a = P.a - abre + (2 * abre * k) / (n - 1), ca = Math.cos(a), sa = Math.sin(a); let d = 3;
      while (d < largo && !this.tapa(R.map, P.x + ca * d, P.y + sa * d)) d += paso;
      d = Math.min(d, largo); out.push([P.x + ca * d, P.y + sa * d]);
    }
    return out;
  },
  cono(b, R, ox, oy, largo, abre, c0, c1) {
    const P = R.p, pts = this.rayos(R, largo, abre), g = b.createRadialGradient(P.x - ox, P.y - oy, 1, P.x - ox, P.y - oy, largo);
    g.addColorStop(0, c0); g.addColorStop(1, c1); b.fillStyle = g; b.beginPath(); b.moveTo(P.x - ox + Math.cos(P.a) * 1.5, P.y - oy + Math.sin(P.a) * 1.5);
    for (const [x, y] of pts) b.lineTo(x - ox, y - oy); b.closePath(); b.fill();
  },
  activa(R) { return !JE.headless && R && R.p && !(typeof panoOn === 'function' && panoOn(R)) && !R.big; }
};
(function () {
  const _dg = Ride.prototype.drawGround;
  Ride.prototype.drawGround = function (b, ox, oy, inV) {
    _dg.call(this, b, ox, oy, inV); if (!Lectura.activa(this)) return;
    try {
      const P = this.p, t = (this.mode && this.mode.t) || 0, S = this.stats_(), fr = clamp(P.v / Math.max(1, S.max), 0, 1.3), d3 = GFX() === '3d';
      b.save();
      /* estaciones cercanas: aro que respira */
      const cerca = []; for (const s of this.map.stations) { if (!inV(s.x, s.y, 10)) continue; cerca.push([dist(s.x, s.y, P.x, P.y), s]); }
      cerca.sort((a, c) => a[0] - c[0]);
      for (const [, s] of cerca.slice(0, 3)) { const r = 9 + Math.sin(t * 2.2 + s.x) * 1.2; b.globalAlpha = .55; b.strokeStyle = PAL.vd; b.lineWidth = 1.2; b.beginPath(); b.arc(s.x - ox, s.y - oy, r, 0, TAU); b.stroke(); b.globalAlpha = .12; b.fillStyle = PAL.vd; b.fill(); }
      /* la bici parqueada, cuando vas a pie y lejos */
      const pk = this.parked; if (pk && P.veh === 'walk' && inV(pk.x, pk.y, 10) && dist(pk.x, pk.y, P.x, P.y) > 20 * WK) { const w = (t * .9) % 1; b.globalAlpha = .7 * (1 - w); b.strokeStyle = '#ffffff'; b.lineWidth = 1.1; b.beginPath(); b.arc(pk.x - ox, pk.y - oy, 4 + w * 9, 0, TAU); b.stroke(); }
      /* el ciclista: cono de luz de día (se corta en los edificios) y halo */
      if (Art.night(this.min || 600) < .45 && P.veh !== 'walk') { b.globalAlpha = 1; Lectura.cono(b, this, ox, oy, 16 + 34 * Math.min(1, fr), .34, 'rgba(255,255,255,.34)', 'rgba(255,255,255,0)'); }
      b.globalAlpha = .9; b.fillStyle = 'rgba(10,35,66,.16)'; b.strokeStyle = 'rgba(255,255,255,.75)'; b.lineWidth = d3 ? 1 : 1.2;
      const hr = P.veh === 'truck' ? 9 : 6 + (P.v < 4 ? Math.sin(t * 3) * .6 : 0); b.beginPath(); b.ellipse(P.x - ox, P.y - oy + .6, hr, hr * .82, 0, 0, TAU); b.fill(); b.stroke();
      b.restore();
    } catch (e) { JE.errors && JE.errors.push('lectura: ' + e.message); }
  };
  /* de noche: el farol de la bici (luz cálida que suma, más larga) */
  const _gl = Ride.prototype.drawGlow;
  Ride.prototype.drawGlow = function (b, ox, oy, inV, n) {
    _gl.call(this, b, ox, oy, inV, n); if (!Lectura.activa(this) || n < .2 || this.p.veh === 'walk') return;
    try { const P = this.p, fr = clamp(P.v / Math.max(1, this.stats_().max), 0, 1); b.save(); b.globalCompositeOperation = 'lighter'; b.globalAlpha = Math.min(1, n * 1.4);
      Lectura.cono(b, this, ox, oy, 34 + 40 * fr, .3, 'rgba(255,236,170,.42)', 'rgba(255,236,170,0)'); b.restore(); } catch (e) { JE.errors && JE.errors.push('farol: ' + e.message); }
  };
})();
