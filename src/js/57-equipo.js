/* =====================================================================
   TURNO EN EQUIPO (cooperativo en red, 2 a 4 jugadores)
   Quien crea la sala dirige desde MONITOREO; cada invitado maneja un camión
   de BALANCE. El anfitrión manda: lleva la simulación de estaciones, la carga
   de cada camión y la bodega. Los invitados reciben órdenes y fotos del estado.
   Mensajes:  anfitrión → ord (orden), s (estado cada 0,5 s), mv/ld (respuestas), say, end
              invitado  → p (posición), at (llegué a la estación), dep (llegué a la base)
   ===================================================================== */
const ROLE_EQUIPO = {
  id: 'equipo', n: 11, name: 'Turno en equipo', tier: 'Multijugador', icon: 'monitoreo', vista: 'General + cenital · cooperativo', unlock: 0,
  desc: 'Un jugador dirige desde Monitoreo y los demás manejan los camiones de Balance. Ganan o pierden juntos.',
  how: ['Monitoreo toca una estación y manda la orden.', 'Balance recibe la orden y maneja hasta la estación.', 'Si el camión está vacío o lleno, pasa por la BASE.']
};
ROLE.equipo = ROLE_EQUIPO;
const isMulti = id => id === 'carrera' || id === 'equipo' || id === 'libre';
/* la misma zona y base para todos (la de Monitoreo turno 1: centro) */
function coopZone(st) {
  const zl = st.filter(s => s.zone === 'centro'), cx = zl.reduce((a, s) => a + s.x, 0) / zl.length, cy = zl.reduce((a, s) => a + s.y, 0) / zl.length;
  const zs = zl.slice().sort((a, b) => dist(a.x, a.y, cx, cy) - dist(b.x, b.y, cx, cy)).slice(0, 16), n = JE.map.nearestOpen(Math.floor((zs[0].x + 14 * WK) / TS), Math.floor((zs[0].y + 10 * WK) / TS), true);
  return { zs, road: { x: n.x * TS + TS / 2, y: n.y * TS + TS / 2 } };
}

/* ---------- anfitrión: Monitoreo con camiones humanos ---------- */
class ModeCoopMon extends ModeMonitoreo {
  constructor(role, T, opt) {
    super(role, 1, opt); const Z = coopZone(this.sim.st); this.road = Z.road;
    // un camión automático de respaldo + un camión por cada invitado
    for (const t of this.trucks.splice(1)) this.sim.trucks.splice(this.sim.trucks.indexOf(t), 1);
    (opt.players || []).forEach((p, k) => {
      const t = { x: Z.road.x, y: Z.road.y, tx: Z.road.x, ty: Z.road.y, a: -Math.PI / 2, load: 12, cap: 20, q: [], path: null, id: this.trucks.length + 1, human: true, pid: p.id, name: String(p.name || 'Amigo').slice(0, 16), seen: 0 };
      this.sim.depot -= 12; this.trucks.push(t); this.sim.trucks.push(t);
    });
    this.jobN = 0; this.teamDone = 0; this.snapT = 0; const tg = 3 + 2 * Math.max(1, this.trucks.length - 1);
    this.goals = [];
    this.goal('Nivel de servicio ≥ 70%', true, () => this.serv() * 100 >= 70, () => Math.round(this.serv() * 100) + '%');
    this.goal('El equipo cumple ' + tg + ' órdenes', false, () => this.teamDone >= tg, () => this.teamDone + '/' + tg);
    this.goal('Al cierre, ninguna estación vacía', false, () => this.zs.every(s => s.bikes > 0), () => this.zs.filter(s => s.bikes <= 0).length + ' vacías');
    this.coach = 'Toca una estación y manda la orden: tus amigos manejan los camiones.';
    Net.onmsg = m => this.msg(m);
  }
  best(s) { let b = null, bc = 1e9; for (const t of this.trucks) { const c = (t.q.length * 900 + dist(t.x, t.y, s.x, s.y)) * (t.human ? .55 : 1); if (c < bc) { bc = c; b = t; } } return b; }
  go(t, x, y) { if (!t.human) super.go(t, x, y); }
  addJob(t, job) {
    if (t.human && job.type === 'home') return;
    t.q.push(job);
    if (t.human) { job.id = ++this.jobN; Net.send({ t: 'ord', to: t.pid, id: job.id, si: this.sim.st.indexOf(job.s), ty: job.type, n: job.n }); }
  }
  home() { super.home(); Net.send({ t: 'say', m: '📻 Monitoreo: se acerca el cierre, terminen sus órdenes.' }); }
  say(m) { super.say(m.replace(/Camión (\d+)/, (a, n) => { const t = this.trucks[n - 1]; return t && t.human ? t.name : a; })); }
  msg(m) {
    const t = this.trucks.find(q => q.human && q.pid === (m.from | 0)); if (!t) return;
    if (m.t === 'p') { t.tx = +m.x || 0; t.ty = +m.y || 0; t.a = +m.a || 0; t.seen = this.t; }
    else if (m.t === 'at') {
      const j = t.q.find(q => q.id === (m.id | 0)); if (!j) return Net.send({ t: 'mv', to: t.pid, id: m.id | 0, moved: 0, load: t.load, left: 0, gone: 1 });
      const s = j.s; let moved = 0;
      if (j.type === 'llevar') { moved = Math.min(j.n, t.load, s.cap - s.bikes); t.load -= moved; s.bikes += moved; }
      else { moved = Math.min(j.n, s.bikes, t.cap - t.load); t.load += moved; s.bikes -= moved; }
      j.n -= moved; const full = j.type === 'llevar' ? s.bikes >= s.cap : s.bikes <= 0, fin = j.n <= 0 || full;
      if (fin) { t.q.splice(t.q.indexOf(j), 1); this.flags.delete(s); this.teamDone++; this.score += 30; this.say('✅ ' + t.name + ' cumplió en ' + s.name); Snd.sfx('ok'); }
      this.score += moved * 2; Net.send({ t: 'mv', to: t.pid, id: j.id, moved, load: t.load, left: fin ? 0 : j.n });
    } else if (m.t === 'dep') {
      const d = 12 - t.load; if (d > 0) { const k = Math.min(d, this.sim.depot); t.load += k; this.sim.depot -= k; } else if (d < 0) { t.load += d; this.sim.depot -= d; }
      Net.send({ t: 'ld', to: t.pid, load: t.load });
    } else if (m.t === 'bye') this.drop(t);
  }
  /* si un amigo se va, su camión sigue en automático con las órdenes que tenía */
  drop(t) { if (!t.human) return; t.human = false; t.wait = 0; for (const j of t.q) { j.stage = null; j.loaded = false; } this.say('📻 ' + t.name + ' salió: su camión sigue en automático'); JE.ui && JE.ui.toast(t.name + ' salió del turno'); }
  update(dt) {
    super.update(dt);
    for (const t of this.trucks) if (t.human) { const k = Math.min(1, dt * 8); t.x += (t.tx - t.x) * k; t.y += (t.ty - t.y) * k; if (this.t - t.seen > 12 && !JE.headless) this.drop(t); }
    this.snapT -= dt; if (this.snapT <= 0 && !this.done) { this.snapT = .5; Net.send(this.snap('s')); }
  }
  snap(t) { return { t, c: Math.round(this.clock), b: this.zs.map(s => s.bikes), sc: Math.round(this.score), sv: Math.round(this.serv() * 100), d: this.teamDone, dep: this.sim.depot }; }
  hud(V) {
    super.hud(V); const r = this.rect; if (!r) return;
    for (const t of this.trucks) if (t.human) V.text(t.name, r.x + t.x * r.k, r.y + t.y * r.k - 16, { size: 11, align: 'center', color: '#0a2342', bg: PAL.amb, pad: 2 });
  }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: 'Servicio ' + Math.round(this.serv() * 100) + '%' }, { t: '🤝 ' + this.teamDone }] }; }
  end() { if (!this.done) { Net.send(this.snap('end')); Net.onmsg = m => UI.netLobbyMsg(m); } super.end(); }
}

/* ---------- invitado: conductor de Balance con órdenes por red ---------- */
class ModeCoopDriver extends MapMode {
  constructor(role, T, opt) {
    super(role, 1, opt); this.rate = 0; this.clock = 330;
    this.sim = new StationSim(this.rng, { demand: this.mods.demand, depot: 60 }); const Z = coopZone(this.sim.st); this.zs = Z.zs;
    this.setupRide({ sim: this.sim, start: Z.road, veh: 'truck', load: 12, cap: 20 });
    this.depM = this.ride.marker({ x: Z.road.x, y: Z.road.y, r: 20, col: PAL.cie, label: 'Base', enter: () => Net.send({ t: 'dep' }) });
    this.orders = []; this.doneN = 0; this.sv = 100; this.teamDone = 0; this.teamScore = 0; this.netT = 0; this.lastSnap = 0; this.boss = ((opt.players || [])[0] || {}).name || 'Monitoreo';
    this.goal('Servicio del equipo ≥ 70%', true, () => this.sv >= 70, () => this.sv + '%');
    this.goal('Cumple 3 órdenes', false, () => this.doneN >= 3, () => this.doneN + '/3');
    this.goal('Máximo 2 choques', false, () => this.ride.stats.crashes <= 2, () => this.ride.stats.crashes + ' choques');
    this.coach = 'Espera la orden de ' + this.boss + ' por radio y sigue la ruta. El camión solo va por calles.';
    this.ride.target = null; Net.onmsg = m => this.msg(m);
  }
  tickClock() { }
  msg(m) {
    if (m.t === 'bye' && !(m.from | 0)) return this.lost();
    if (m.from | 0) return;   // solo manda el anfitrión (los demás camiones se ignoran)
    if (m.t === 'start') return UI.netLobbyMsg(m);
    if (m.t === 's' || m.t === 'end') {
      this.clock = +m.c || this.clock; this.sv = m.sv | 0; this.teamDone = m.d | 0; this.teamScore = m.sc | 0; this.lastSnap = this.t;
      (m.b || []).forEach((v, i) => { if (this.zs[i]) this.zs[i].bikes = v | 0; });
      if (m.t === 'end') this.end();
    } else if (m.t === 'say') JE.ui && JE.ui.toast(String(m.m || '').slice(0, 90));
    else if (m.to !== Net.myId) return;
    else if (m.t === 'ord') {
      const s = this.sim.st[m.si | 0]; if (!s || this.orders.some(o => o.id === m.id)) return;
      const o = { id: m.id | 0, s, type: m.ty === 'recoger' ? 'recoger' : 'llevar', n: clamp(m.n | 0, 1, 20) };
      o.m = this.ride.marker({ x: s.x, y: s.y, r: 20, col: o.type === 'llevar' ? PAL.vd : PAL.amb, label: s.name, num: this.orders.length + 1, enter: () => Net.send({ t: 'at', id: o.id }) });
      this.orders.push(o); this.retarget(); Snd.sfx('coin'); JE.ui && JE.ui.toast('📻 ' + this.boss + ': ' + (o.type === 'llevar' ? 'LLEVA ' : 'RECOGE ') + o.n + ' bicis · ' + s.name);
    } else if (m.t === 'mv') {
      const o = this.orders.find(q => q.id === (m.id | 0)), P = this.ride.p; P.load = clamp(m.load | 0, 0, P.cap); if (!o) return;
      if (m.gone) return this.finish(o, false);
      if (!(m.moved > 0) && (m.left | 0) > 0) { JE.ui && JE.ui.toast(o.type === 'llevar' ? 'Camión vacío: ve a la BASE a cargar' : 'Camión lleno: descarga en la BASE'); return this.retarget(); }
      o.n = m.left | 0; Snd.sfx('truck'); this.ride.burst(o.s.x, o.s.y, PAL.vd1, 12);
      if (o.n <= 0) this.finish(o, true); else { this.ride.float('Faltan ' + o.n, PAL.amb); this.retarget(); }
    } else if (m.t === 'ld') { const P = this.ride.p; P.load = clamp(m.load | 0, 0, P.cap); Snd.sfx('truck'); this.ride.float('Carga: ' + P.load + ' bicis', PAL.cie); this.retarget(); }
  }
  finish(o, ok) {
    this.ride.removeMarker(o.m); this.orders.splice(this.orders.indexOf(o), 1);
    if (ok) { this.doneN++; this.score += 30; this.ride.float('+30 ¡Orden cumplida!', PAL.vd1); Snd.sfx('win'); }
    this.retarget();
  }
  retarget() {
    const P = this.ride.p; if (!this.orders.length) { this.ride.target = null; return; }
    const need = o => (o.type === 'llevar' && P.load === 0) || (o.type === 'recoger' && P.load >= P.cap);
    const o = this.orders.slice().sort((a, b) => (need(a) ? 1 : 0) - (need(b) ? 1 : 0) || dist(a.s.x, a.s.y, P.x, P.y) - dist(b.s.x, b.s.y, P.x, P.y))[0];
    this.ride.target = need(o) ? this.depM : o.m;
  }
  lost() { if (this.done) return; JE.ui && JE.ui.toast('Se perdió la conexión con Monitoreo'); this.end(); }
  tick(dt) {
    this.netT -= dt; if (this.netT <= 0) { this.netT = .12; const P = this.ride.p; Net.send({ t: 'p', x: Math.round(P.x), y: Math.round(P.y), a: +P.a.toFixed(2) }); }
    if (!JE.headless && this.t - this.lastSnap > 10) this.lost();
    this.coach = this.orders.length ? '' : 'Sin órdenes: espera el radio de ' + this.boss + '.';
  }
  get coachB() { return 30 + this.orders.length * 22; }
  hud2(V) {
    let y = V.h - 24 - this.orders.length * 22;
    for (const o of this.orders) { V.text((o.type === 'llevar' ? 'LLEVAR ' : 'RECOGER ') + o.n + ' · ' + o.s.name, 10, y, { size: 13, color: o.type === 'llevar' ? PAL.vd1 : PAL.amb, bg: '#0a2342cc', pad: 3, body: true }); y += 22; }
  }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: '🚚 ' + this.ride.p.load + '/20' }, { t: 'Servicio ' + this.sv + '%' }] }; }
  end() { if (!this.done) Net.onmsg = m => UI.netLobbyMsg(m); super.end(); }
  bot() { this.retarget(); this.botDrive(); }
}
MODE_CLASS.equipo = function (role, T, opt) { return opt.driver ? new ModeCoopDriver(role, T, opt) : new ModeCoopMon(role, T, opt); };
