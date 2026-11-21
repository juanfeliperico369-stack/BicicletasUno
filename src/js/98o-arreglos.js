/* =====================================================================
   ARREGLOS DE ENCICLA (Claude, 21‑nov‑2026) · los que Codex describió en coord/buzon/20261120-2121-codex-relevo.md
   y nunca llegaron a GitHub. El autor pidió resolverlos. Reproducidos y comprobados en tests/regresion-encicla.js.
   1) Bici prestada: al cambiar de la bici de EnCicla a otro vehículo, la bici quedaba guardada en el modo (M.parked) y no
      en la vía (R.parked): no contaba como abandonada y se podía volver a montar desde cualquier lugar del mapa.
      Ahora queda parqueada en la vía, cuenta para el reporte de abandono y para montarla hay que volver hasta ella.
   2) Acceso sin aparcamiento: a pie y sin bici parqueada, «Ir a la bici» rompía el juego (R.parked era null).
   3) Gasto de la eléctrica (arreglado en 69-libre.js): la eléctrica es 'bike' con R.ebike y gastaba como una bici normal.
   4) Montar: subirse a la bici a pie (Subirse) no avisaba el evento «montar» de los boletos de Rosalba.
   5) Hojas de la trama (arreglado en 93-trama.js): los premios iban a Save.data.leaves y la tienda lee stats.leaves;
      aquí se migran las hojas viejas al cargar o importar la partida.
   Archivo aditivo (rango 98n–98z): ganchos sobre Save, Ride y ModeUsuarioR.
   ===================================================================== */
(function () {
  /* 5) migración de hojas viejas */
  const migrar = d => { if (d && d.leaves > 0 && d.stats) { d.stats.leaves = (d.stats.leaves | 0) + (d.leaves | 0); d.leaves = 0; return true; } return false; };
  const _load = Save.load; Save.load = function () { const r = _load.apply(this, arguments); if (migrar(this.data)) this.save(); return r; };
  const _imp = Save.importText; Save.importText = function () { const r = _imp.apply(this, arguments); if (migrar(this.data)) this.save(); return r; };
  JE.migrarHojas = migrar;

  /* 4) el evento «montar» también al subirse a pie */
  const _on = Ride.prototype.getOn; Ride.prototype.getOn = function () { const ok = _on.apply(this, arguments); if (ok && this.mode && this.mode.free && typeof Boleto !== 'undefined') Boleto.evento(this.mode, 'montar'); return ok; };

  /* 2) sin bici parqueada no hay «Ir a la bici» */
  const _act = ModeUsuarioR.prototype.actions; ModeUsuarioR.prototype.actions = function () { const a = _act.apply(this, arguments), R = this.ride; return R && !R.parked ? a.filter(x => x.id !== 'on') : a; };

  /* 1) la bici de EnCicla queda en la vía y hay que volver por ella */
  const _cv = ModeUsuarioR.prototype.cambiarVehiculo;
  ModeUsuarioR.prototype.cambiarVehiculo = function (id) {
    const R = this.ride, P = R && R.p, aBici = id === 'bike' || id === 'ebike';
    if (R && P && !this.ownBike && aBici && P.veh !== 'bike') {
      const pk = R.parked || this.parked;
      if (pk && dist(pk.x, pk.y, P.x, P.y) > 22 * WK) { if (JE.ui) JE.ui.toast('🚲 Tu bici de EnCicla quedó parqueada: ve hasta ella para montarla'); if (!R.target) R.target = R.marker({ x: pk.x, y: pk.y, r: 12, col: PAL.vd, label: 'Tu bici EnCicla', enter: m => R.removeMarker(m) }); return false; }
    }
    const eraEnCicla = R && P && !this.ownBike && P.veh === 'bike', a0 = P ? P.a : 0, x0 = P ? P.x : 0, y0 = P ? P.y : 0;
    const r = _cv.apply(this, arguments);
    if (R && eraEnCicla && !aBici && id !== 'walk') R.parked = { x: x0, y: y0, a: a0, veh: 'bike' };
    if (R && aBici) R.parked = null;
    return r;
  };
})();
