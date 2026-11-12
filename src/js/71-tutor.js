/* =====================================================================
   TUTORIAL OPCIONAL: un compañero del oficio te acompaña en el turno.
   Habla en pausas cortas (el juego se detiene mientras lo lees) y en el mapa pedalea a tu lado.
   ===================================================================== */
const TUT_EXTRA = {
  usuario: 'En bici también se para en rojo. Si un peatón se atraviesa, toca el timbre. El préstamo dura máximo 60 minutos.',
  anfitrion: 'En la ventanilla: toca al usuario, revisa su tarjeta y entrégale una bici con luz verde. Las dañadas van a la caja roja del taller.',
  mecanico: 'Mira la falla que parpadea y usa la herramienta de su mismo color. Con la bomba, toca en la zona verde.',
  bodega: 'Revisa cada caja contra el pedido. El taller necesita el pedido exacto: ni una pieza de más ni de menos.',
  apoyo: 'Los relevos tienen hora límite: míralas en la lista de abajo. Los inventarios de control suman, pero son opcionales.',
  pausas: 'Cuando la tarjeta llegue al círculo, haz el movimiento: desliza el dedo o toca la flecha. En «Respira», mantén oprimido.',
  tecnico: 'Las estaciones con aro rojo están dañadas. Si un celular se queda sin batería, llévale un power bank.',
  rescate: 'Con una bici en la mano no hagas curvas bruscas. Si se inclina, corrige con ◀ ▶ antes de que pase la raya.',
  balance: 'El carro solo va por las vías. Parquea donde te dejen y baja las bicis con cuidado de no tumbarlas.',
  monitoreo: 'Toca una estación para ver cuántas bicis tiene y manda el carro: llevar a las vacías, recoger de las llenas.',
  supervisor: 'Atiende primero los avisos que están por vencer: mira la hora límite de cada uno en la lista.'
};
const Tutor = JE.tutor = {
  on: false,
  start(roleId) {
    const C = CAST[roleId], r = ROLE[roleId]; if (!C || !r) return; const M = Game.mode, map = !!(M && M.ride);
    this.on = true; this.role = roleId; this.C = C; this.trail = []; this.seen = {}; this.q = []; this.t = 0; this.subSeen = false; this.subDone = false;
    const add = (id, txt, when) => this.q.push({ id, txt, when });
    add('hola', '¡Hola, ' + Save.data.profile.name + '! Soy ' + C[0] + ', ' + C[1] + '. ' + r.desc, () => this.t > .6);
    if (map) {
      add('mover', 'Arrastra el dedo en cualquier parte para moverte (o usa las flechas). Yo voy a tu lado.', () => this.t > 1);
      add('ruta', 'La línea punteada te lleva a la siguiente tarea. Cada número del mapa es una tarea.', () => M.ride.stats.dist > 30 * WK || this.t > 14);
    }
    add('extra', TUT_EXTRA[roleId] || r.how[1], () => this.t > (map ? 8 : 3));
    add('mg', 'Esta es la tarea. El título de arriba y el aviso de abajo te dicen qué hacer. ' + (r.how[1] || ''), () => this.subSeen);
    add('bien', '¡Muy bien! ' + (r.how[2] || 'Sigue así.'), () => this.subDone);
    add('chao', 'Ya sabes lo básico: te dejo seguir solo. Si tienes dudas, en la pausa está la ayuda. ¡Éxitos!', () => this.seen.bien && this.t - this.seen.bien > 8);
  },
  stop() { this.on = false; const el = $('#tutor'); if (el) el.classList.remove('on'); },
  update(dt) {
    const M = Game.mode; if (!this.on || !M) return;
    if (!Game.paused) this.t += dt;
    if (M.sub) this.subSeen = true; else if (this.subSeen && !this.subDone && this.seen.mg) this.subDone = true;
    if (M.ride) { const P = M.ride.p; this.trail.push({ x: P.x, y: P.y, a: P.a }); if (this.trail.length > 40) this.trail.shift(); }
    if (this.showing || Game.paused) return;
    const nx = this.q[0]; if (!nx) return this.stop();
    if (nx.id === 'mg' && !M.sub && this.subSeen && !this.seen.mg) { this.q.shift(); return; }
    if (nx.when()) this.say(nx);
  },
  say(item) {
    this.q.shift(); this.seen[item.id] = this.t; this.showing = true; Game.paused = true; Snd.sfx('tap');
    let el = $('#tutor'); if (!el) { el = document.createElement('div'); el.id = 'tutor'; $('#sGame').appendChild(el); }
    el.innerHTML = `<img class="px" src="${Historia.face(this.role)}" alt=""><div><b>${esc(this.C[0])}</b><p>${esc(item.txt)}</p><div class="tb"><button class="btn sm pri" id="tutOk">${this.q.length ? 'Entendido' : '¡Gracias!'}</button>${this.q.length ? '<button class="btn sm gh" id="tutSkip">Saltar tutorial</button>' : ''}</div></div>`;
    el.classList.add('on');
    const go = () => { el.classList.remove('on'); this.showing = false; Game.paused = false; Game.last = performance.now(); if (!this.q.length) this.stop(); };
    $('#tutOk').onclick = go; const sk = $('#tutSkip'); if (sk) sk.onclick = () => { this.q = []; go(); this.stop(); };
  }
};
/* el compañero pedalea a tu lado en el mapa */
const _rt71 = Ride.prototype.renderTop;
Ride.prototype.renderTop = function (V) {
  _rt71.call(this, V); const T = Tutor; if (!T.on || !T.trail || T.trail.length < 14 || this.p.veh === 'truck' || this.mode !== Game.mode || this.mode.sub) return;
  const q = T.trail[T.trail.length - 14], side = q.a + Math.PI / 2, off = 7 * WK, c = V.ctx, k = V.s * V.dpr, C = T.C, uni = T.role !== 'usuario';
  c.save(); c.setTransform(k, 0, 0, k, 0, 0); c.imageSmoothingEnabled = false; c.translate(q.x - Math.cos(side) * off - this.cxf, q.y - Math.sin(side) * off - this.cyf); c.rotate(q.a + Math.PI / 2);
  const sp = Art.riderTop(uni ? '#0e2d55' : C[5], '#ffffff', C[2], PAL.vd); blit(c, sp); c.restore();
};
const _start71 = Game.start;
Game.start = function (roleId, turno, o = {}) { Tutor.stop(); const r = _start71.call(this, roleId, turno, o); if (o.tuto) Tutor.start(roleId); return r; };
const _dom71 = Game.dom;
Game.dom = function (dt) { _dom71.call(this, dt); if (Tutor.on) { Tutor.update(dt); const co = $('#coach'); if (co && Tutor.showing) co.style.opacity = '0'; } };
const _fin71 = Game.finish; Game.finish = function () { Tutor.stop(); return _fin71.apply(this, arguments); };
const _stop71 = Game.stop; Game.stop = function () { Tutor.stop(); return _stop71.apply(this, arguments); };
/* botón del tutorial en la ficha del turno */
const _brief71 = UI.brief;
UI.brief = function (roleId, turno, o = {}) {
  _brief71.call(this, roleId, turno, o); const C = CAST[roleId], go = $('#bGo'); if (!C || !go || o.free || o.reto || isMulti(roleId)) return;
  const first = !Save.data.history.some(e => e.m === roleId), b = document.createElement('button');
  b.className = 'btn ' + (first ? 'amb' : 'gh'); b.id = 'bTuto'; b.style.flex = '1'; b.innerHTML = '🎓 Con ' + esc(C[0]) + ' (tutorial)';
  go.parentNode.appendChild(b); go.parentNode.style.flexWrap = 'wrap';
  const g0 = go.onclick; b.onclick = () => { this._tuto = true; g0(); this._tuto = false; };
};
const _start71b = Game.start;
Game.start = function (roleId, turno, o = {}) { if (UI._tuto) o = Object.assign({}, o, { tuto: true }); return _start71b.call(this, roleId, turno, o); };
