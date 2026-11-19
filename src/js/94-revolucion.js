/* =====================================================================
   LA REVOLUCIÓN v2.0: las dos entregas del plan único, en un solo juego
   - De Gemini (código): Run EnCicla 3D (91-runner.js), los 7 vehículos con su física (92-vehiculos.js),
     la trama «Ruedas y Rieles» (93-trama.js), los túneles y el GPS de dos niveles.
   - De ChatGPT (arte): TallerValle (91-taller-arte.js), la carrera de la ciclorruta de 3 carriles (92-ciclovia.js)
     y «El boleto de Rosalba» (contenido/guion/fragmentos.json).
   Aquí se juntan:
   1) las dos carreras sin fin en el menú, con tres niveles cada una (JE.modos, 91-modos.js);
   2) un solo Taller en el modo libre: el vehículo (con el dibujo de TallerValle), las dos carreras y el boleto;
   3) el boleto de Rosalba con los vehículos del registro (ebike, scooter…) y su señal en el mapa.
   ===================================================================== */

/* el dibujo de TallerValle que corresponde a cada vehículo del registro */
const ARTE_VEH = { bike: 'bici', ebike: 'electrica', scooter: 'scooter', emonopatin: 'monopatin', skate: 'skate', patines: 'patines', walk: 'pie', truck: 'balance' };
const vehActual = M => M && M.ride ? (M.ride.p.veh === 'bike' && M.ebike ? 'ebike' : M.ride.p.veh) : 'bike';
const vehNombre = arte => { const id = Object.keys(ARTE_VEH).find(k => ARTE_VEH[k] === arte), v = id && vehLista().find(x => x.id === id); return v ? v.name.toLowerCase() : arte; };
/* la ciclorruta de al menos 100 m más cercana a un punto (o la primera que haya) */
function tramoCerca(x, y) { return TramoCiclista.cercana(JE.map, { x, y }) || TramoCiclista.cercana(JE.map, { x: MW * TS / 2, y: MH * TS / 2 }); }

/* ---------- 1) las dos carreras en el menú ---------- */
class ModoRun3D extends ModeSub {
  constructor(role, turno, opt) {
    super(role, turno, opt); const L = [[3, 450, 45], [0, 750, 60], [1, 1100, 80]][turno - 1] || [3, 450, 45];   // corredor, metros de la meta y segundos: Carabobo, Parques del Río y Las Vegas
    this.clock = [8 * 60, 13 * 60, 18 * 60 + 30][turno - 1] || 480;   // mañana, mediodía y atardecer
    this.sub = new MGRunner3D(this, { corredor: L[0], veh: 'bike', metaM: L[1], dur: L[2] }); this.view = this.sub.view; this.meta = L[1];
    this.goal('Recorre ' + L[1] + ' m', true, () => this.sub.distM >= L[1], () => Math.round(this.sub.distM) + ' m');
    this.goal('Recoge 10 hojas', false, () => (this.sub.hojas | 0) >= 10, () => (this.sub.hojas | 0) + '/10');
  }
}
class ModoCiclovia extends ModeSub {
  constructor(role, turno, opt) {
    super(role, turno, opt); const N = [['botanico', 300], ['pies', 500], ['estadio', 800]][turno - 1] || ['botanico', 300], L = LM[N[0]];
    this.clock = [7 * 60 + 30, 12 * 60, 19 * 60][turno - 1] || 450;
    this.tramo = L ? tramoCerca((L.x + L.w / 2) * TS, (L.y + L.h / 2) * TS) : tramoCerca(MW * TS / 2, MH * TS / 2); this.meta = N[1];
    this.sub = new CarreraCiclovia(this, this.tramo, 'bici'); this.view = this.sub.view;
    this.goal('Rueda ' + N[1] + ' m', true, () => this.sub.metros >= N[1], () => Math.floor(this.sub.metros) + ' m');
    this.goal('Junta 10 hojas', false, () => this.sub.hojas >= 10, () => this.sub.hojas + '/10');
    this.goal('Llega a la meta sin perder vidas', false, () => this.sub.metros >= N[1] && this.sub.vidas === 3, () => this.sub.vidas + ' vidas');
  }
  update(dt) { super.update(dt); if (this.sub.metros >= this.meta * 2.5) this.sub.done = true; }   // el doble y medio de la meta: fin de la carrera, aunque sea sin fin
}
JE.modos.registrar({ id: 'run3d', name: 'Run EnCicla 3D', cls: ModoRun3D, emoji: '🏁', niveles: ['Carabobo', 'Parques del Río', 'Las Vegas'],
  desc: 'Corredores reales en 3D: esquiva, salta y recoge hojas. La cámara cambia entre el manubrio y detrás de la bici.',
  how: ['Desliza o usa las flechas para cambiar de carril.', 'Arriba o la barra para saltar; abajo para agacharte.', 'V cambia la cámara: primera o tercera persona.'] });
JE.modos.registrar({ id: 'ciclovia', name: 'Carrera de la ciclorruta', cls: ModoCiclovia, emoji: '🛣️', niveles: ['Jardín Botánico', 'Pies Descalzos', 'Estadio'],
  desc: 'Tres carriles sobre una ciclorruta real: hojas, regalos, huecos, conos, motos y perros.',
  how: ['Izq. y Der. para cambiar de carril; Salta para los huecos y los charcos.', 'A motos, perros y chazas hay que esquivarlos.', 'Tres errores terminan la carrera. Vista cambia entre la canasta y el ciclista.'] });

/* ---------- 3) el boleto de Rosalba (contenido/guion/fragmentos.json) ---------- */
const Boleto = JE.boleto = {
  K: 'fragmentosCiclovia',
  lista() { return Array.isArray(GUION.fragmentos) ? GUION.fragmentos : []; },
  paso() { const F = Save.data.flags || (Save.data.flags = {}); return clamp(F[this.K] | 0, 0, this.lista().length); },
  actual() { return this.lista()[this.paso()] || null; },
  vehOk(M, q) { return !q.vehiculo || ARTE_VEH[vehActual(M)] === q.vehiculo; },
  evento(M, ev, dato) {
    const q = this.actual(); if (!q || q.evento !== ev || !M || !M.free || !M.ride) return false;
    if (!this.vehOk(M, q)) { if (ev === 'visitar' && JE.ui) JE.ui.toast('🎟️ ' + q.quien + ': ven en ' + vehNombre(q.vehiculo) + ' (en el Taller)'); return false; }
    if (q.hojas && (dato | 0) < q.hojas) { if (JE.ui) JE.ui.toast('🎟️ ' + q.quien + ': te faltaron hojas, junta ' + q.hojas + ' en una sola carrera'); return false; }
    Save.data.flags[this.K] = this.paso() + 1; Snd.sfx('star'); if (JE.ui) JE.ui.toast('🎟️ ' + q.quien + ': ' + q.despues);
    if (this.paso() >= this.lista().length) { Save.data.flags.boletoRosalba = 1; const nw = Logros.check(); if (nw.length && JE.ui) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', ')); }
    Save.save(); this.marca(M); return true;
  },
  /* la señal del destino cuando toca visitar: en la estación del boleto, o junto a la Plaza Botero si no está */
  marca(M) {
    const q = this.actual(), R = M && M.ride; if (!R) return null;
    if (!q || q.evento !== 'visitar') { if (M.marcaBoleto) { R.removeMarker(M.marcaBoleto); M.marcaBoleto = null; } return null; }
    if (M.marcaBoleto) return M.marcaBoleto;
    const st = (JE.map.stations || []).find(s => s.id === q.lugar), L = LM.botero, x = st ? st.x : L ? (L.x + L.w / 2) * TS : R.p.x, y = st ? st.y : L ? (L.y + L.h) * TS : R.p.y;
    const t = JE.map.nearestOpen(Math.floor(x / TS), Math.floor(y / TS), false);
    M.marcaBoleto = R.marker({ x: t.x * TS + TS / 2, y: t.y * TS + TS / 2, r: 16, col: '#efd096', label: '🎟️ ' + q.titulo, enter: () => this.evento(M, 'visitar') });
    return M.marcaBoleto;
  }
};
LOGROS.push({ id: 'boleto', name: 'El boleto de Rosalba', desc: 'Junta las dos mitades del boleto con Cata y Rosalba', icon: 'estrella', test: S => !!(S.flags && S.flags.boletoRosalba) });
const _drawG94 = Ride.prototype.drawGround;
Ride.prototype.drawGround = function (c, ox, oy, inV) { _drawG94.call(this, c, ox, oy, inV); const p = this.mode && this.mode.marcaBoleto; if (p && inV(p.x, p.y)) TallerValle.pieza(c, 'senal', p.x - ox, p.y - oy, 5); };
const _init94 = ModeUsuarioR.prototype.libreInit;
ModeUsuarioR.prototype.libreInit = function () { const r = _init94.apply(this, arguments); if (this.free && this.ride) Boleto.marca(this); return r; };
const _cv94 = ModeUsuarioR.prototype.cambiarVehiculo;
ModeUsuarioR.prototype.cambiarVehiculo = function (id) { _cv94.call(this, id); Boleto.evento(this, 'montar'); };
/* al terminar cualquiera de las dos carreras en el modo libre, cuenta para el boleto */
const _runSub94 = Mode.prototype.runSub;
Mode.prototype.runSub = function (mg, cb) {
  if ((typeof MGRunner3D !== 'undefined' && mg instanceof MGRunner3D) || mg instanceof CarreraCiclovia) { const f = cb; cb = s => { if (f) f(s); Boleto.evento(this, 'carrera', s.hojas | 0); }; }
  return _runSub94.call(this, mg, cb);
};

/* ---------- 2) un solo Taller en el modo libre ---------- */
const Taller = JE.taller = {
  abrir(M, res) {
    if (!M || !M.ride) return; Game.paused = true; const cur = vehActual(M), noche = Art.night(M.clock) > .5, q = Boleto.actual(); Boleto.marca(M);
    const L = vehLista().filter(v => v.id !== 'walk');   // a pie se va con «Bajarse»
    UI.modal(`<h2>🔧 Taller del valle</h2><canvas id="tlEsc" width="480" height="170" style="width:100%;height:auto;border-radius:10px;display:block" aria-label="El taller de EnCicla"></canvas>`
      + (res ? `<p class="m" style="margin:8px 0 0"><b>${esc(res)}</b></p>` : '')
      + (q ? `<p class="m" style="font-size:14px;margin:8px 0 0">🎟️ <b>${esc(q.quien)}:</b> ${esc(q.antes)}</p>` : Boleto.lista().length ? '<p class="m" style="font-size:14px;margin:8px 0 0">🎟️ El boleto de Rosalba está completo.</p>' : '')
      + `<div class="pag" style="margin-top:10px">Tu vehículo</div><div class="tlVeh">${L.map(v => `<button class="btn ${cur === v.id ? 'pri' : ''}" data-tv="${v.id}" aria-label="${esc(v.name)}"><canvas width="96" height="54" data-tc="${v.id}" aria-hidden="true"></canvas><span>${v.icon} ${esc(v.name)}</span></button>`).join('')}</div>`
      + `<div class="pag" style="margin-top:10px">Carreras sin fin</div><div class="col"><button class="btn" id="tlRun3">🏁 Run EnCicla 3D</button><button class="btn" id="tlCic">🛣️ Carrera de la ciclorruta</button>`
      + (M.marcaBoleto ? '<button class="btn" id="tlBol">🎟️ Llévame al boleto</button>' : '') + '<button class="btn gh" id="tlOut">▶ Seguir rodando</button></div>', () => {
      const e = $('#tlEsc'); if (e) TallerValle.escena(e.getContext('2d'), 480, 170, res ? 'resultado' : q && q.evento === 'visitar' ? 'fragmento' : 'taller', noche);
      $$('[data-tc]').forEach(cv => TallerValle.vehiculo(cv.getContext('2d'), ARTE_VEH[cv.dataset.tc] || 'bici', 'lado', 48, 46, cv.dataset.tc === 'patines' ? 24 : 22, { noche: false }));
      const go = () => { UI.closeModal(); if (Game.paused) Game.resume(); };
      $$('[data-tv]').forEach(b => b.onclick = () => { Snd.sfx('tap'); M.cambiarVehiculo(b.dataset.tv); this.abrir(M); });
      $('#tlRun3').onclick = () => { go(); M.iniciarRunner3D(); };
      $('#tlCic').onclick = () => { go(); const P = M.ride.p, t = tramoCerca(P.x, P.y); if (!t) { JE.ui && JE.ui.toast('Aquí cerca no hay una ciclorruta de 100 m'); return; }
        M.runSub(new CarreraCiclovia(M, t, ARTE_VEH[vehActual(M)] || 'bici'), fin => { M.score += fin.score; this.abrir(M, Math.floor(fin.metros) + ' m · ' + fin.hojas + ' hojas · ' + fin.regalos + ' regalos · ' + fin.score + ' puntos'); }); };
      const b = $('#tlBol'); if (b) b.onclick = () => { M.ride.target = M.marcaBoleto; go(); };
      $('#tlOut').onclick = go;
    });
  }
};
const _act94 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act94.call(this); if (!this.free) return a; const out = a.filter(x => x.id !== 'vehiculo' && x.id !== 'runner3d');   // en su lugar, un solo Taller
  if (!this.sub && !this.sitting && !(typeof Paseo !== 'undefined' && Paseo.on(this))) out.push({ id: 'taller', icon: 'llanta', label: 'Taller', fn: () => Taller.abrir(this) });
  return out;
};
