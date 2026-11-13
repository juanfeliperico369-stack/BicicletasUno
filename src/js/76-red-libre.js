/* =====================================================================
   MUNDO LIBRE EN RED Y COMPETENCIAS PERSONALIZADAS
   Sin servidores: el celular que crea la sala es el servidor (WebRTC en estrella).
   Misma red Wi-Fi o zona Wi-Fi de un celular: funciona sin internet. Por internet: STUN público.
   ===================================================================== */
ROLE.libre = { id: 'libre', n: 11, name: 'Mundo libre', tier: 'Multijugador', icon: 'usuario', vista: 'Cenital · mundo abierto', unlock: 0, desc: 'Pedalea con tus amigos por todo el valle, de día o de noche, o compitan con reglas propias.', how: ['Pedalea donde quieras: tus amigos aparecen con su nombre.', 'Toca el timbre para saludar.', 'En competencia, mira el marcador de abajo.'] };
const COMP = {
  paseo: { name: 'Paseo libre', desc: 'Sin reglas: recorran el valle juntos.' },
  carrera: { name: 'Carrera de postales', desc: 'Pasen por las postales en orden y lleguen a la estación de meta.' },
  hojas: { name: 'Cazadores de hojas', desc: 'Recoge más hojas verdes que los demás antes de que se acabe el tiempo.' },
  lleva: { name: 'La lleva', desc: 'Quien la lleva persigue a los demás; al tocar a alguien, se la pasa. Gana quien la lleve menos tiempo.' }
};
class ModeLibreRed extends ModeUsuario {
  constructor(role, T, opt) {
    super(role, T, Object.assign({}, opt, { free: true }));
    const c = this.comp = Object.assign({ k: 'paseo', min: 3 }, opt.comp || {}); this.net = !!opt.net; this.netT = 0; this.left = c.k === 'paseo' ? 0 : c.min * 60; this.countdown = c.k === 'paseo' ? 0 : 3.2;
    const P = this.ride.p; this.peers = (opt.players || []).map((p, k) => ({ id: p.id | 0, name: String(p.name || 'Amigo').slice(0, 16), shirt: p.shirt || PAL.cor, x: P.x + (k + 1) * 6 * WK, y: P.y, tx: P.x + (k + 1) * 6 * WK, ty: P.y, a: P.a, sc: 0, itT: 0, idx: 0 }));
    this.ride.opps = this.peers; this.sc = 0; this.itId = c.k === 'lleva' ? 0 : null; this.itT = 0; this.immune = 0; this.res = null;
    if (this.net) Net.onmsg = m => this.msg(m);
    this.goals = [];
    if (c.k === 'paseo') this.goal('Pedalea con tus amigos', true, () => true);
    else this.goal('Gana: ' + COMP[c.k].name, true, () => !!this.res && this.res.win, () => this.res ? (this.res.win ? '¡1º!' : this.res.pos + 'º') : 'en juego');
    if (c.k === 'hojas') { this.ride.markers = []; this.ride.target = null; }
    this.coach = c.k === 'lleva' ? (this.itId === Net.myId ? '¡Tú la llevas! Persigue a alguien y tócalo.' : 'Huye de quien la lleva (marcado en rojo).') : COMP[c.k].desc;
  }
  myId() { return this.net ? Net.myId | 0 : 0; }
  msg(m) {
    if (m.t === 'start' && !(m.from | 0)) return UI.netLobbyMsg(m);
    const o = this.peers.find(q => q.id === (m.from | 0)); if (!o) return;
    if (m.t === 'p') { o.tx = +m.x || 0; o.ty = +m.y || 0; o.a = +m.a || 0; o.sc = m.sc | 0; }
    else if (m.t === 'bell') { if (dist(o.x, o.y, this.ride.p.x, this.ride.p.y) < 220 * WK) { Snd.sfx('bell'); this.ride.fx.push({ k: 't', x: o.x, y: o.y - 12, t: 1.2, txt: '🔔 ' + o.name, col: '#fff' }); } }
    else if (m.t === 'tag') { this.itId = m.to | 0; this.immune = 2; if (this.itId === this.myId()) { Snd.sfx('bad'); JE.ui && JE.ui.toast('😱 ¡' + o.name + ' te tocó! Ahora la llevas tú'); } }
    else if (m.t === 'bye') { o.gone = true; JE.ui && JE.ui.toast(o.name + ' salió de la sala'); }
  }
  onLeaf() { super.onLeaf(); if (this.comp.k === 'hojas' && this.countdown <= 0 && this.left > 0) this.sc++; }
  update(dt) { if (this.countdown > 0) { const c0 = Math.ceil(this.countdown); this.countdown -= dt; if (Math.ceil(this.countdown) !== c0 && !JE.headless) Snd.sfx(this.countdown > 0 ? 'tap' : 'win'); this.ride.cam.x = this.ride.p.x; this.ride.cam.y = this.ride.p.y; return; } super.update(dt); }
  tick(dt) {
    super.tick(dt); const P = this.ride.p, c = this.comp, me = this.myId();
    for (const o of this.peers) { const k = Math.min(1, dt * 8); o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; o.it = this.itId === o.id; }
    if (this.net) { this.netT -= dt; if (this.netT <= 0) { this.netT = .1; Net.send({ t: 'p', x: Math.round(P.x), y: Math.round(P.y), a: +P.a.toFixed(2), sc: c.k === 'lleva' ? Math.round(this.itT) : this.sc }); } }
    if (c.k === 'lleva' && this.left > 0) {
      this.immune = Math.max(0, this.immune - dt);
      if (this.itId === me) { this.itT += dt; if (!this.immune) { const v = this.peers.find(o => !o.gone && dist(o.x, o.y, P.x, P.y) < 12 * WK); if (v) { this.itId = v.id; this.immune = 2; Snd.sfx('win'); this.ride.float('¡Te toca, ' + v.name + '!', PAL.vd1); if (this.net) Net.send({ t: 'tag', to: v.id }); } } }
    }
    if (this.left > 0 && !this.res) { this.left -= dt; if (this.left <= 0) this.finish(); }
    this.coach = c.k === 'lleva' ? (this.itId === me ? '🔴 ¡Tú la llevas! Toca a alguien.' : '🏃 Huye de ' + ((this.peers.find(o => o.id === this.itId) || {}).name || 'quien la lleva')) : this.coach;
  }
  finish() {
    const c = this.comp, me = { id: this.myId(), name: Save.data.profile.name, v: c.k === 'lleva' ? -this.itT : this.sc }, L = [me].concat(this.peers.filter(o => !o.gone).map(o => ({ id: o.id, name: o.name, v: c.k === 'lleva' ? -o.sc : o.sc }))).sort((a, b) => b.v - a.v);
    const pos = L.findIndex(x => x === me) + 1; this.res = { pos, win: pos === 1, L }; this.score += pos === 1 ? 120 : Math.max(10, 70 - pos * 15);
    this.ride.stamp = L.length === 1 ? { t: 3, title: '¡RETO TERMINADO!', sub: c.k === 'hojas' ? this.sc + ' hojas verdes' : '', bg: PAL.vd } : { t: 3, title: pos === 1 ? '¡GANASTE!' : 'QUEDASTE ' + pos + 'º', sub: L.map((x, i) => (i + 1) + '. ' + x.name).join('  '), bg: pos === 1 ? PAL.vd : PAL.amb }; Snd.sfx(pos === 1 ? 'win' : 'ok');
    this.endT = 3.2;
  }
  actions() { const a = super.actions(); const b = a.find(x => x.id === 'bell'); if (b) { const f = b.fn; b.fn = () => { f(); if (this.net) Net.send({ t: 'bell' }); }; } return this.comp.k === 'paseo' ? a : a.filter(x => x.id !== 'dock'); }
  hud2(V) {
    if (this.countdown > 0) { const n = Math.ceil(this.countdown); V.text(n > 0 ? String(n) : '¡YA!', V.w / 2, V.h * .42, { size: 110, align: 'center', color: PAL.amb, stroke: PAL.az, sw: 10 }); V.text(COMP[this.comp.k].name, V.w / 2, V.h * .42 + 40, { size: 18, align: 'center', color: '#fff', stroke: PAL.az, sw: 5 }); return; }
    if (this.comp.k === 'paseo') return; const me = this.myId(), m = Math.max(0, Math.ceil(this.left)), tm = Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
    const sc = this.comp.k === 'lleva' ? [Save.data.profile.name + ' ' + Math.round(this.itT) + ' s'].concat(this.peers.map(o => o.name + ' ' + o.sc + ' s')) : ['Tú ' + this.sc].concat(this.peers.map(o => o.name + ' ' + o.sc));
    V.text('⏱ ' + tm + ' · ' + sc.join(' · '), 10, V.h - 20, { size: 13, color: this.itId === me ? PAL.cor : PAL.vd1, bg: '#0a2342dd', pad: 4, body: true });
    if (this.comp.k === 'lleva') for (const o of this.peers) if (o.it) { const s = V.s, x = (o.x - this.ride.cxf) * s, y = (o.y - this.ride.cyf) * s - 26; if (x > 0 && x < V.w && y > 0 && y < V.h) V.text('🔴 LA LLEVA', x, y, { size: 11, align: 'center', color: '#fff', bg: PAL.cor, pad: 3 }); }
  }
  info() { const i = super.info(); if (this.comp.k !== 'paseo') i.chips = [{ t: COMP[this.comp.k].name }]; return i; }
  end() { if (this.net && !this.done) Net.onmsg = m => UI.netLobbyMsg(m); super.end(); }
}
MODE_CLASS.libre = ModeLibreRed;

/* ---------- sala: conexión, mundo libre y competencias ---------- */
const _multi76 = UI.multi;
UI.multi = function () {
  _multi76.call(this); const h = $('#nHost'); if (!h) return; Net.lan = Net.lan !== false;
  const d = document.createElement('div'); d.innerHTML = `<p class="pag" style="margin-top:4px">Conexión</p><div class="seg wrap" id="nLan"><button data-lan="1" class="${Net.lan ? 'on' : ''}">📶 Misma red o zona Wi-Fi (sin internet)</button><button data-lan="0" class="${Net.lan ? '' : 'on'}">🌐 Por internet</button></div>
    <p class="m" style="font-size:12px;margin:6px 0 10px">El celular que crea la sala es el servidor: no se usan servidores externos. Sin internet, un celular comparte su zona Wi-Fi y los demás se conectan a ella. Bluetooth funciona en la app de Android, con los celulares emparejados.</p>`;
  h.parentNode.parentNode.insertBefore(d, h.parentNode);
  $$('[data-lan]', d).forEach(b => b.onclick = () => { Net.lan = b.dataset.lan === '1'; $$('[data-lan]', d).forEach(x => x.classList.toggle('on', x === b)); Snd.sfx('tap'); });
};
const _lobby76 = UI.renderLobby;
UI.renderLobby = function () {
  _lobby76.call(this); const st = $('#nStart'); if (!st || this._lobbyBusy) return; const ready = Object.keys(this.netPlayers).length > 0, C = this.compCfg || (this.compCfg = { k: 'paseo', n: 3, min: 3, zona: 'centro' });
  const d = document.createElement('div'); d.className = 'paper'; d.style.margin = '10px 0';
  d.innerHTML = `<div class="t">Mundo libre</div><p class="pag" style="margin-top:6px">Modo</p><div class="seg wrap">${Object.entries(COMP).map(([k, c]) => `<button data-ck="${k}" class="${C.k === k ? 'on' : ''}">${c.name}</button>`).join('')}</div><p style="margin:6px 0;font-size:13px">${esc(COMP[C.k].desc)}</p>
    ${C.k === 'carrera' ? `<p class="pag">Postales</p><div class="seg">${[1, 3, 5].map(n => `<button data-cn="${n}" class="${C.n === n ? 'on' : ''}">${n}</button>`).join('')}</div><p class="pag">Zona</p><div class="seg">${['norte', 'centro', 'sur'].map(z => `<button data-cz="${z}" class="${C.zona === z ? 'on' : ''}">${z}</button>`).join('')}</div>` : ''}
    ${C.k === 'hojas' || C.k === 'lleva' ? `<p class="pag">Duración</p><div class="seg">${[2, 3, 5].map(n => `<button data-cm="${n}" class="${C.min === n ? 'on' : ''}">${n} min</button>`).join('')}</div>` : ''}
    <div class="col" style="margin-top:10px"><button class="btn pri" id="nLibre" ${ready ? '' : 'disabled'}>🌎 Empezar</button></div>`;
  st.parentNode.parentNode.insertBefore(d, st.parentNode);
  const re = () => { Snd.sfx('tap'); this.renderLobby(); };
  $$('[data-ck]', d).forEach(b => b.onclick = () => { C.k = b.dataset.ck; re(); }); $$('[data-cn]', d).forEach(b => b.onclick = () => { C.n = +b.dataset.cn; re(); });
  $$('[data-cz]', d).forEach(b => b.onclick = () => { C.zona = b.dataset.cz; re(); }); $$('[data-cm]', d).forEach(b => b.onclick = () => { C.min = +b.dataset.cm; re(); });
  $('#nLibre').onclick = () => this.netStartLibre();
};
UI.netStartLibre = function () {
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, players = this.roster(), C = Object.assign({}, this.compCfg);
  Net.send({ t: 'start', kind: 'libre', seed, players, comp: C }); this.netLibre(seed, players, C);
};
UI.netLibre = function (seed, players, C) {
  this.closeModal(); if (Game.mode) Game.stop(); const others = (players || []).filter(p => p.id !== Net.myId), comp = { k: COMP[C.k] ? C.k : 'paseo', n: clamp(C.n | 0 || 3, 1, 5), min: clamp(C.min | 0 || 3, 1, 10), zona: ['norte', 'centro', 'sur'].includes(C.zona) ? C.zona : 'centro' };
  if (comp.k === 'carrera') return Game.start('carrera', 2, { seed, nov: NOVEDADES[0], net: true, n: comp.n, zona: comp.zona, players: others.length ? others : [{ id: 0, name: 'Amigo', shirt: PAL.cor }] });
  Game.start('libre', 1, { seed, nov: NOVEDADES[0], net: true, players: others, comp });
};
const _lmsg76 = UI.netLobbyMsg;
UI.netLobbyMsg = function (m) {
  if (m.t === 'start' && m.kind === 'libre' && Net.role === 'guest') { const clean = p => ({ id: p.id | 0, name: String(p.name || 'Amigo').slice(0, 16), shirt: /^#[0-9a-f]{6}$/i.test(p.shirt) ? p.shirt : PAL.cor }); return this.netLibre(m.seed >>> 0, (m.players || []).map(clean), m.comp || {}); }
  return _lmsg76.call(this, m);
};
