/* =====================================================================
   INTERFAZ DEL JUEGO: los avisos aparecen al frente y por poco tiempo,
   nunca encima del mapa grande ni de otro aviso; el mapa grande se carga por partes.
   ===================================================================== */
const _dom79 = Game.dom;
Game.dom = function (dt) {
  _dom79.call(this, dt);
  const co = $('#coach'), to = $('#toast'), map = MapView.live();
  if (co && (map || (to && to.classList.contains('on')) || Tutor.showing)) co.style.opacity = '0';
  if (co && this.mode) co.classList.toggle('mg', !!this.mode.sub || !this.mode.ride);
  const gm = $('#goalsMini'), ab = $('#actBar'); if (gm) gm.style.visibility = map ? 'hidden' : ''; if (ab) ab.style.visibility = map ? 'hidden' : '';
  if (map && to) to.classList.remove('on');
};
/* mapa grande: los bloques de la ciudad se dibujan poco a poco (2 por cuadro) sobre el plano general */
MapView.draw = (function (orig) {
  return function (V) {
    const M = JE.map, z = this.z; if (z < .5 || z >= .95) return orig.call(this, V);
    const S = CH * TS, x0 = this.cx - V.w / 2 / z, y0 = this.cy - V.h / 2 / z, x1 = this.cx + V.w / 2 / z, y1 = this.cy + V.h / 2 / z;
    let budget = 2; const draws = [];
    for (let cy = Math.max(0, Math.floor(y0 / S)); cy <= Math.floor(y1 / S); cy++) for (let cx = Math.max(0, Math.floor(x0 / S)); cx <= Math.floor(x1 / S); cx++) { if (cx * CH >= MW || cy * CH >= MH) continue; if (M.hasG(cx, cy) || budget-- > 0) draws.push([cx, cy]); }
    orig.call(this, V, draws);
  };
})(MapView.draw);
/* vista panorámica: se juega mejor con el celular de lado (se avisa una vez) */
const _start79 = Game.start;
Game.start = function (roleId, turno, o = {}) {
  const r = _start79.call(this, roleId, turno, o);
  if (Save.data.settings.vista === 'pano' && this.mode && this.mode.ride && innerHeight > innerWidth && !UI._giro) { UI._giro = 1; setTimeout(() => UI.toast('📱 Gira el celular: la vista panorámica se ve mejor de lado'), 1200); }
  return r;
};
/* el mapa grande nunca queda abierto al salir, reiniciar o terminar un turno */
for (const k of ['start', 'stop', 'finish']) { const f = Game[k]; Game[k] = function () { MapView.reset(); return f.apply(this, arguments); }; }
