/* =====================================================================
   EL PERDÓN EN LOS SALTOS (ronda 3.3, Claude) · como en Celeste («Celeste & Forgiveness», Maddy Thorson): el juego hace lo que
   quisiste, no lo que tu dedo alcanzó a hacer. Si tocas «saltar» un instante ANTES de caer, el salto se guarda y sale justo al
   tocar el piso (antes ese toque se perdía en Run 3D y en la carrera de la ciclorruta, y en el freerun se volvía un truco).
   - Run 3D: guardado 0,16 s si vas cayendo.
   - Carrera de la ciclorruta: guardado 0,16 s si vas cayendo y ya estás bajo (arriba, el toque sigue siendo un truco).
   - Freerun: guardado 0,18 s si vas cayendo y el piso está a menos de 0,8 m; si tropiezas al caer, no sale.
   El bot y las pruebas no cambian: el guardado solo actúa cuando alguien toca en el aire.
   ===================================================================== */
(function () {
  if (typeof MGRunner3D !== 'undefined') {
    const R3 = MGRunner3D.prototype, _j = R3.jump, _u = R3.update;
    R3.jump = function () { if (this.z > .05) { if (this.vz < 0) this._buf = .16; return; } this._buf = 0; return _j.call(this); };
    R3.update = function (dt) { const r = _u.call(this, dt); if (this._buf > 0) { this._buf -= dt; if (this.z <= .05 && !this.done) { this._buf = 0; _j.call(this); this.perdon = (this.perdon | 0) + 1; } } return r; };
  }
  if (typeof CarreraCiclovia !== 'undefined') {
    const C = CarreraCiclovia.prototype, _s = C.saltar, _u = C.update;
    C.saltar = function () { if (this.altura > 0 && this.altura <= .25 && this.vertical <= 0) { this._buf = .16; return; } return _s.call(this); };
    C.update = function (dt) { const r = _u.call(this, dt); if (this._buf > 0) { this._buf -= dt; if (this.altura === 0 && !this.done) { this._buf = 0; _s.call(this); this.perdon = (this.perdon | 0) + 1; } } return r; };
  }
  if (typeof MGFreerun !== 'undefined') {
    const F = MGFreerun.prototype, _s = F.saltar, _a = F.aterrizar, _u = F.update;
    F.saltar = function () {
      if (!this.suelo && !(this.coyote > 0) && this.vy < 0 && !this.llego) { const g = this.alto(this.x + this.v * .12); if (g != null && this.y - g < .8) { this._buf = .18; return; } }
      return _s.call(this);
    };
    F.aterrizar = function (g) { const r = _a.call(this, g); if (this._buf > 0 && !(this.tropT > 0)) { this._buf = 0; _s.call(this); this.perdon = (this.perdon | 0) + 1; } return r; };
    F.update = function (dt) { if (this._buf > 0) this._buf = Math.max(0, this._buf - dt); return _u.call(this, dt); };
  }
})();
