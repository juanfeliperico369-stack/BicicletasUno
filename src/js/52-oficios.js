/* =====================================================================
   OFICIOS REALES DE ENCICLA (v0.7)
   Cada oficio tiene sus turnos reales. Un turno se juega por FASES: en el mapa (tareas con hora límite)
   o en un minijuego. Entre fases el reloj salta (⏩) para que 8 horas quepan en 2–4 minutos.
   Horarios dados por el equipo; los que faltan están marcados como aproximados en docs/GUIA.md.
   ===================================================================== */
const SHIFTS = {
  usuario: [{ n: 'Primer préstamo', h: 'mañana' }, { n: 'Dos viajes', h: 'día' }, { n: 'Día de ciclista', h: 'día' }],
  anfitrion: [{ n: 'Turno 1 · Apertura', h: '5:00 a. m. – 1:30 p. m.' }, { n: 'Turno 3 · Cierre', h: '1:30 p. m. – 10:30 p. m.' }],
  mecanico: [{ n: 'Equipo de reparación', h: '8:00 a. m. – 5:00 p. m.' }, { n: 'Equipo de ensamble', h: '8:00 a. m. – 5:00 p. m.' }],
  bodega: [{ n: 'Turno intermedio', h: '8:00 a. m. – 5:00 p. m.' }],
  apoyo: [{ n: 'Turno 1 · Apertura y relevos', h: '5:00 a. m. – 1:30 p. m.' }, { n: 'Turno 3 · Relevos y cierre', h: '1:30 p. m. – 10:30 p. m.' }],
  tecnico: [{ n: 'Turno intermedio', h: '8:00 a. m. – 5:00 p. m.' }],
  balance: [{ n: 'Turno de apertura', h: '4:00 a. m. – 1:00 p. m.' }, { n: 'Camión especial (40 bicis)', h: '9:00 a. m. – 6:00 p. m.' }, { n: 'Turno de cierre', h: '2:00 p. m. – 11:00 p. m.' }],
  monitoreo: [{ n: 'Sala de control', h: 'inventario cada hora' }, { n: 'Atención al cliente', h: 'llamadas e inscripciones' }],
  supervisor: [{ n: 'Turno de apertura', h: '4:00 a. m. – 12:00 m.' }, { n: 'Turno intermedio', h: '9:00 a. m. – 6:00 p. m.' }, { n: 'Turno de cierre', h: '2:00 p. m. – 11:00 p. m.' }]
};
const ROLE_TXT = {
  anfitrion: ['Abre las estaciones automáticas de tu sector y la tuya antes de las 5:30, atiende en la ventanilla (saca la bici, entrégala y ajusta el sillín) y, en el cierre, recibe bicis hasta las 10 p. m., haz el inventario y cierra.', ['Abre o cierra cada estación: tótem, anclajes e inventario.', 'En la ventanilla: tarjeta, bici con luz verde y sillín a la medida.', 'Las bicis dañadas van al TALLER.']],
  mecanico: ['En el taller, un equipo repara las bicis que llegan malas y otro ensambla las bicis nuevas con las piezas que manda la bodega.', ['Reparación: diagnostica (?) y usa la herramienta del color de la falla.', 'Ensamble: sigue el manual paso a paso.', 'Las tuercas se aprietan en la zona verde.']],
  bodega: ['Recibe los paquetes con piezas, verifica que todo esté bien, organízalos y carga el camión que lleva el pedido al taller de los mecánicos.', ['Descarga, verifica y organiza cada caja.', 'Carga el pedido EXACTO del taller.', 'Maneja el camión hasta el taller.']],
  apoyo: ['El anfitrión de apoyo abre (o cierra) todas las estaciones automáticas de su zona, hace los relevos en las estaciones con anfitrión y, en todo momento, inventarios de control.', ['Elige tu zona: Poblado, Vegas, AMVA, Laureles, Aeropuerto, Carabobo, Sabaneta, Itagüí, Envigado o Bello.', 'Los relevos tienen hora límite.', 'Los inventarios de control suman: ¡hazlos seguido!']],
  tecnico: ['Repara tótems y luces LED de los anclajes, arregla los celulares de las estaciones con anfitrión y reparte power banks para que ningún celular se apague.', ['Aro rojo: falla en la estación.', 'Batería baja: lleva un power bank.', 'Recarga power banks en Casa EnCicla.']],
  balance: ['Maneja el carro de balance: lleva las tulas de apertura, balancea bicis entre estaciones (14 por carro, 40 en el camión especial), recoge bicis dañadas para el taller y, de noche, guarda el camión en la Terminal del Norte.', ['Sigue las órdenes numeradas de Monitoreo.', 'El carro solo va por las vías.', 'Las bicis dañadas van al taller de Casa EnCicla.']],
  monitoreo: ['En la sala de control mantienes balanceado el sistema, mandas misiones a los carros y verificas los inventarios cada hora. En atención al cliente resuelves sanciones, errores de préstamo e inscripciones.', ['Toca una estación y manda la orden.', 'Cada hora: revisa qué inventario no cuadra.', 'En llamadas: lee el sistema y elige la solución.']],
  supervisor: ['Desde las 4 a. m. arma las tulas en Casa EnCicla y las entrega a las 5. Durante el día resuelve problemas y cuida estaciones y anfitriones. En el cierre recoge las tulas y pone a cargar los celulares.', ['Arma cada tula: llave de su color y celular cargado.', 'Atiende los avisos antes de que venzan.', 'A las 10:30 p. m. recoge las tulas.']]
};
ROLES.forEach(r => { r.shifts = SHIFTS[r.id]; if (ROLE_TXT[r.id]) { r.desc = ROLE_TXT[r.id][0]; r.how = ROLE_TXT[r.id][1]; } });
Object.assign(ROLE.anfitrion, { unlock: 1 }); Object.assign(ROLE.mecanico, { unlock: 3 }); Object.assign(ROLE.bodega, { unlock: 5 }); Object.assign(ROLE.apoyo, { unlock: 7 });
Object.assign(ROLE.tecnico, { unlock: 10 }); Object.assign(ROLE.balance, { unlock: 12 }); Object.assign(ROLE.monitoreo, { unlock: 16 }); Object.assign(ROLE.supervisor, { unlock: 20 });
const nShifts = id => (ROLE[id] && ROLE[id].shifts ? ROLE[id].shifts.length : 3);
const shiftName = (id, t) => { const s = ROLE[id] && ROLE[id].shifts; return s && s[t - 1] ? s[t - 1].n : 'Turno ' + t; };
const MAX_STARS = () => ROLES.reduce((a, r) => a + 3 * nShifts(r.id), 0);

/* ---------- turno por fases ---------- */
class ShiftMode extends MapMode {
  begin(phases) { this.phases = phases; this.pi = -1; this.clock = phases[0].from; this.lateN = 0; this.doneN = 0; this.mgErr = 0; this.invErr = 0; this.invOk = 0; this.incOk = 0; this.incLost = 0; this.nextPhase(); }
  get phase() { return this.phases ? this.phases[this.pi] : null; }
  nextPhase() {
    const prev = this.phase; if (prev) { if (prev.end) prev.end(prev); for (const t of prev.tasks || []) if (t.m && !t.keep) this.ride.removeMarker(t.m); }
    this.pi++; const ph = this.phase;
    if (!ph) { this.endT = 1.2; this.ride.target = null; return; }
    if (this.pi > 0 && this.ride) this.ride.stamp = this.clock < ph.from - 1 ? { t: 2.2, title: '⏩ ' + fmtClock(ph.from), sub: ph.name, bg: PAL.cie } : { t: 1.8, title: ph.name.toUpperCase(), sub: fmtClock(Math.max(this.clock, ph.from)), bg: PAL.amb };
    this.clock = Math.max(this.clock, ph.from); ph.tasks = ph.tasks || []; ph.spawnT = 2; ph.t0 = this.t;
    if (ph.start) ph.start(ph);
    if (ph.mg) { this.rate = (ph.to - ph.from) / ph.secs; const mg = ph.mg(ph); this.runSub(mg, s => { ph.result = s; this.mgErr += s.errors || 0; this.errors += s.errors || 0; if (ph.after) ph.after(s); this.nextPhase(); }); }
    else { ph.tasks.forEach(t => this.addTask(t, ph)); this.calRate(ph); this.retarget(); }
    if (ph.toast && JE.ui) JE.ui.toast(ph.toast);
  }
  addTask(t, ph) {
    ph = ph || this.phase; if (!ph.tasks.includes(t)) ph.tasks.push(t);
    t.n = ph.tasks.filter(x => !x.opt).indexOf(t) + 1; t.m = this.ride.marker({ x: t.x, y: t.y, r: t.r || 18, col: t.col || PAL.amb, label: t.label, num: t.opt ? 0 : t.n, enter: () => this.doTask(t) });
    return t;
  }
  /* reloj de la fase: el recorrido estimado (vecino más cercano) cabe en el tiempo de la fase */
  calRate(ph) {
    if (ph.timed) { this.rate = (ph.to - this.clock) / ph.secs; return; }
    let x = this.ride.p.x, y = this.ride.p.y, px = 0; const left = ph.tasks.filter(t => !t.done && !t.opt);
    while (left.length) { left.sort((a, b) => dist(a.x, a.y, x, y) - dist(b.x, b.y, x, y)); const t = left.shift(); px += dist(t.x, t.y, x, y) * 1.35; x = t.x; y = t.y; }
    const secs = px / (this.ride.p.veh === 'truck' ? 40 : 48) + ph.tasks.filter(t => !t.done && !t.opt).length * (ph.mgSecs || 12) + 8;
    this.rate = Math.max(.2, (ph.to - this.clock) / (secs * 1.3));
  }
  doTask(t) {
    const ph = this.phase; if (t.done || this.sub || !ph || !ph.tasks.includes(t)) return;
    if (ph.ordered && ph.tasks.find(x => !x.done) !== t) { JE.ui && JE.ui.toast('Primero: ' + ph.tasks.find(x => !x.done).label); return; }
    if (t.can && !t.can(t)) return;
    const fin = s => {
      t.done = true; t.late = !!(t.due && this.clock > t.due); if (t.late) this.lateN++; this.doneN++;
      if (s) { this.mgErr += s.errors || 0; this.errors += s.errors || 0; this.invErr += s.invErr || 0; }
      const pts = Math.round(((t.pts != null ? t.pts : 25) + (s ? s.score : 0)) * (t.late ? .5 : 1) * (this.has('radio') ? 1.15 : 1)); this.score += pts;
      this.ride.removeMarker(t.m); this.ride.float((t.late ? 'Tarde +' : '+') + pts, t.late ? PAL.amb : PAL.vd1); Snd.sfx('win');
      if (t.after) t.after(s, t); this.retarget();
      if (!ph.timed && ph.tasks.every(x => x.done || x.opt)) this.nextPhase();
    };
    const mg = t.mg ? t.mg(t) : null; if (mg) this.runSub(mg, fin); else fin(null);
  }
  retarget() {
    const ph = this.phase; if (!ph || !this.ride) return; const P = this.ride.p;
    if (ph.ordered) { const f = ph.tasks.find(t => !t.done); this.ride.target = f ? f.m : null; return; }
    const open = ph.tasks.filter(t => !t.done && (!t.can || t.can(t, true))), req = open.filter(t => !t.opt), L = req.length ? req : open;
    L.sort((a, b) => (a.due || 1e9) - (b.due || 1e9) || dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y));
    const near = L.slice(0, 3).sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y))[0];
    this.ride.target = near ? near.m : (this.base && this.baseM) || null;
  }
  /* avisos que aparecen durante la fase (incidentes, fallas, órdenes) */
  spawnTick(dt, ph) {
    if (!ph.spawn || this.clock >= ph.to - 15) return; ph.spawnT -= dt;
    if (ph.spawnT <= 0 && ph.tasks.filter(t => !t.done && t.dyn).length < (ph.maxDyn || 4)) { ph.spawnT = ph.every * this.timeMul * this.rng.range(.7, 1.3); const t = ph.spawn(ph); if (t) { t.dyn = true; this.addTask(t, ph); if (JE.ui && this.t > 2) JE.ui.toast('📻 ' + (t.say || t.label)); this.retarget(); } }
  }
  tick(dt) {
    if (this.sim) this.sim.step(this.rate * dt / this.timeMul, this.clock);
    if (this.endT != null) { this.endT -= dt; if (this.endT <= 0) this.end(); return; }
    const ph = this.phase; if (!ph || ph.mg) return;
    if (ph.tick) ph.tick(dt, ph);
    this.spawnTick(dt, ph);
    for (const t of ph.tasks) if (t.dyn && !t.done && t.due && this.clock > t.due + (t.grace || 0)) { t.done = true; t.lost = true; this.incLost++; this.score -= 8; this.ride.removeMarker(t.m); if (t.onLost) t.onLost(t); Snd.sfx('lose'); JE.ui && JE.ui.toast('⌛ Venció: ' + t.label); this.retarget(); }
    if (ph.timed && this.clock >= ph.to) this.nextPhase();
    else if (!ph.timed && (this.clock > ph.to + 90 || this.t - ph.t0 > (ph.maxSecs || 240))) { for (const t of ph.tasks) if (!t.done && !t.opt) { t.done = true; t.lost = true; this.lateN++; } this.nextPhase(); }   // red de seguridad
    const o = (ph.tasks || []).filter(t => !t.done && !t.opt);
    this.coach = ph.coach ? ph.coach(o) : o.length ? 'Siguiente: ' + o[0].label + (o[0].due ? ' · antes de ' + fmtClock(o[0].due) : '') : '';
  }
  get coachB() { const ph = this.phase; return 30 + Math.min(6, ph && ph.tasks ? ph.tasks.filter(t => !t.done).length : 0) * 22; }
  hud2(V) {
    const ph = this.phase; if (!ph || !ph.tasks) return; const L = ph.tasks.filter(t => !t.done).slice(0, 6); let y = V.h - 24 - L.length * 22;
    for (const t of L) { V.text((t.opt ? '📋 ' : t.n + '. ') + t.label + (t.due ? ' · ' + fmtClock(t.due) : ''), 10, y, { size: 13, color: t.due && this.clock > t.due ? PAL.cor : t.opt ? PAL.vd1 : '#fff', bg: '#0a2342cc', pad: 3, body: true }); y += 22; }
  }
  info() { const ph = this.phase; return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: ph ? ph.short || ph.name.split(':')[0] : '' }].concat(this.chips ? this.chips() : []) }; }
  bot(err) { if (this.sub) return this.sub.bot(err); this.retarget(); this.botDrive(); }
}
/* tareas típicas */
const T_ST = (s, o) => Object.assign({ x: s.x, y: s.y, label: s.name, st: s }, o);
const nearestOf = (list, x, y, n) => list.slice().sort((a, b) => dist(a.x, a.y, x, y) - dist(b.x, b.y, x, y)).slice(0, n);

/* ======================= 2. ANFITRIÓN ======================= */
class ModeAnfitrionR extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng, M = JE.map, tm = this.timeMul;
    this.sim = new StationSim(R, { demand: this.mods.demand });
    const mans = M.stations.filter(s => s.type === 'm' && M.stations.some(a => a.type === 'a' && dist(a.x, a.y, s.x, s.y) < 120 * TS));
    const home = this.home = R.pick(mans.length ? mans : M.stations.filter(s => s.type === 'm'));
    this.setupRide({ sim: this.sim, start: { x: home.x, y: home.y + 10 } });
    const n = 2 + R.i(0, 3), autos = this.autos = nearestOf(M.stations.filter(s => s.type === 'a'), home.x, home.y, n);
    const ap = s => new MGApertura(this, { inv: true, docks: 5 + R.i(0, 2), clock0: this.clock }), ci = s => new MGApertura(this, { cierre: true, docks: 5 + R.i(0, 2), clock0: this.clock });
    if (T === 1) {
      this.begin([
        { name: 'Apertura e inventario', short: 'Apertura', from: 300, to: 330, mgSecs: 13, toast: '🎒 5:00 a. m.: el supervisor te entregó la tula (llaves y celular). Abre ' + n + ' estaciones automáticas y la tuya antes de las 5:30.',
          tasks: autos.map(s => T_ST(s, { label: 'Abrir ' + s.name, due: 330, mg: () => ap(s) })).concat([T_ST(home, { label: 'Abrir tu estación: ' + home.name, due: 330, col: PAL.vd, mg: () => new MGApertura(this, { inv: true, docks: 8, clock0: this.clock }) })]) },
        { name: 'Sistema abierto: atención en ' + home.name, short: 'Ventanilla', from: 330, to: 810, secs: 110, mg: () => new MGAnfitrion(this, { turno: 2, dur: 110 * tm, clock0: 330, rate: 480 / (110 * tm), cap: Math.min(12, home.cap) }), after: s => { this.svc = s; } },
        { name: 'Relevo de turno: entregas la estación', from: 810, to: 811, timed: true, secs: 1 }
      ]);
      this.goal('Abre las ' + n + ' automáticas y la tuya', true, () => this.phases[0].tasks.every(t => t.done && !t.lost), () => this.phases[0].tasks.filter(t => t.done).length + '/' + (n + 1));
      this.goal('Todo abierto antes de las 5:30 a. m.', false, () => this.phases[0].tasks.every(t => t.done && !t.late), () => this.lateN + ' tarde');
      this.goal('Atiende 14 usuarios con máximo 2 errores', false, () => this.svc && this.svc.served >= 14 && this.svc.errors <= 2, () => this.svc ? this.svc.served + ' atendidos' : 'pendiente');
    } else {
      this.begin([
        { name: 'Turno de cierre: atención en ' + home.name, short: 'Ventanilla', from: 810, to: 1260, secs: 100, mg: () => new MGAnfitrion(this, { turno: 3, dur: 100 * tm, clock0: 810, rate: 450 / (100 * tm), cap: Math.min(12, home.cap) }), after: s => { this.svc = s; } },
        { name: 'El sistema cerró: recibe bicis hasta las 10 p. m.', short: 'Devoluciones', from: 1260, to: 1320, secs: 30, mg: () => new MGAnfitrion(this, { turno: 2, returnsOnly: true, seats: false, dur: 30 * tm, clock0: 1260, rate: 60 / (30 * tm), cap: Math.min(12, home.cap) }), after: s => { this.ret = s; } },
        { name: 'Inventario y cierre de tu estación', short: 'Inventario', from: 1320, to: 1325, secs: 14, mg: () => new MGApertura(this, { cierre: true, docks: 8, clock0: 1320 }), after: s => { this.invErr += s.invErr || 0; } },
        { name: 'Cierre de las estaciones automáticas', short: 'Cierre', from: 1325, to: 1350, mgSecs: 12, tasks: autos.map(s => T_ST(s, { label: 'Cerrar ' + s.name, due: 1350, mg: () => ci(s) })) }
      ]);
      this.goal('Cierra tu estación y las ' + n + ' automáticas', true, () => this.pi >= 3 && this.phases[3].tasks.every(t => t.done && !t.lost), () => this.pi >= 3 ? this.phases[3].tasks.filter(t => t.done).length + '/' + n : 'pendiente');
      this.goal('Inventarios exactos', false, () => this.pi >= 3 && this.invErr === 0, () => this.invErr + ' errores');
      this.goal('Atiende 12 usuarios', false, () => this.svc && this.svc.served + (this.ret ? this.ret.served : 0) >= 12, () => (this.svc ? this.svc.served + (this.ret ? this.ret.served : 0) : 0) + ' atendidos');
    }
  }
}

/* ======================= 5. APOYO (10 zonas) ======================= */
class ModeApoyoR extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng, M = JE.map, tm = this.timeMul;
    const z = APOYO_ZONAS.find(z => z[0] === opt.zona) || R.pick(APOYO_ZONAS); this.zona = z;
    this.sim = new StationSim(R, { demand: this.mods.demand });
    const autos = M.stations.filter(s => s.az === z[0]), cx = autos.reduce((a, s) => a + s.x, 0) / autos.length, cy = autos.reduce((a, s) => a + s.y, 0) / autos.length;
    const nr = 2 + R.i(0, 3), mans = nearestOf(M.stations.filter(s => s.type === 'm'), cx, cy, nr), start = nearestOf(autos, cx, cy, 1)[0];
    this.setupRide({ sim: this.sim, start: { x: start.x, y: start.y + 10 } });
    const relevo = s => new MGAnfitrion(this, { turno: 2, short: true, dur: 24 * tm, cap: 6, clock0: this.clock, rate: 2 });
    const invs = () => nearestOf(autos, cx, cy, Math.min(4, autos.length)).map(s => T_ST(s, { label: 'Inventario de control · ' + s.name, opt: true, col: PAL.vd, pts: 12, mg: () => new MGConteo(this, { docks: 6, clock0: this.clock, title: 'INVENTARIO DE CONTROL' }), after: () => { this.invOk++; } }));
    const rel = (a, b) => mans.map((s, i) => T_ST(s, { label: 'Relevo en ' + s.name, due: Math.round(a + (b - a) * (i + 1) / mans.length), col: PAL.cie, mg: () => relevo(s) }));
    this.zTxt = z[1] + ' (' + autos.length + ' estaciones)';
    if (T === 1) {
      this.begin([
        { name: 'Apertura de la zona ' + z[1], short: 'Apertura ' + z[1], from: 300, to: 330, mgSecs: 11, toast: '🗝️ Zona ' + z[1] + ': abre sus ' + autos.length + ' estaciones automáticas antes de las 5:30 a. m.', tasks: autos.map(s => T_ST(s, { label: 'Abrir ' + s.name, due: 330, mg: () => new MGApertura(this, { inv: true, docks: 4 + R.i(0, 2), clock0: this.clock }) })) },
        { name: 'Relevos e inventarios de control', short: 'Relevos', from: 480, to: 720, mgSecs: 16, tasks: rel(480, 720).concat(invs()) },
        { name: 'Fin del turno 1', from: 810, to: 811, timed: true, secs: 1 }
      ]);
    } else {
      this.begin([
        { name: 'Relevos e inventarios de control', short: 'Relevos', from: 960, to: 1230, mgSecs: 16, toast: '🔄 Zona ' + z[1] + ': haz ' + nr + ' relevos antes de las 8:30 p. m. y los inventarios de control que puedas.', tasks: rel(960, 1230).concat(invs()) },
        { name: 'Cierre de la zona ' + z[1], short: 'Cierre ' + z[1], from: 1320, to: 1350, mgSecs: 11, tasks: autos.map(s => T_ST(s, { label: 'Cerrar ' + s.name, due: 1350, mg: () => new MGApertura(this, { cierre: true, docks: 4 + R.i(0, 2), clock0: this.clock }) })) }
      ]);
    }
    const req = () => this.phases.flatMap(p => (p.tasks || []).filter(t => !t.opt)), rels = () => req().filter(t => /^Relevo/.test(t.label));
    this.goal(T === 1 ? 'Apertura de ' + z[1] + ' y ' + nr + ' relevos' : nr + ' relevos y cierre de ' + z[1], true, () => this.pi >= this.phases.length - (T === 1 ? 1 : 1) && req().every(t => t.done && !t.lost), () => req().filter(t => t.done && !t.lost).length + '/' + req().length);
    this.goal('Relevos a tiempo', false, () => rels().length > 0 && rels().every(t => t.done && !t.late), () => rels().filter(t => t.late).length + ' tarde');
    this.goal('3 inventarios de control', false, () => this.invOk >= 3, () => this.invOk + '/3');
  }
  chips() { return [{ t: '📍 ' + this.zona[1] }]; }
}

/* ======================= 9. SUPERVISOR (3 turnos) ======================= */
class ModeSupervisorR extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng, M = JE.map, tm = this.timeMul, casa = M.poi.casa;
    this.sim = new StationSim(R, { demand: this.mods.demand });
    // zona de supervisión: 3–4 estaciones con anfitrión cercanas entre sí (un recorrido de madrugada razonable)
    const ms = M.stations.filter(s => s.type === 'm'), dense = ms.filter(s => ms.filter(q => dist(q.x, q.y, s.x, s.y) < 110 * TS).length >= 4), seed = R.pick(dense.length ? dense : ms);
    const area = nearestOf(M.stations, seed.x, seed.y, 14), hosts = nearestOf(ms, seed.x, seed.y, 3 + R.i(0, 1));
    this.area = area; this.hosts = hosts; this.setupRide({ sim: this.sim, start: { x: casa.x, y: casa.y }, veh: 'truck', load: 0, cap: 14 });
    const inc = (ph) => this.incident(ph);
    if (T === 1) {
      this.begin([
        { name: '4:00 a. m. · Armar las tulas en Casa EnCicla', short: 'Tulas', from: 240, to: 265, secs: 35, mg: () => new MGTulas(this, { mode: 'armar', names: hosts.map(s => s.name), clock0: 240 }) },
        { name: 'Entregar las tulas a las 5:00 a. m.', short: 'Entrega', from: 265, to: 310, mgSecs: 3, toast: '🚐 Sales en el carro de balance hacia la zona: entrega cada tula a su anfitrión.', tasks: hosts.map(s => T_ST(s, { label: 'Tula para ' + s.name, due: 315, pts: 15 })) },
        { name: 'Control del sistema', short: 'Control', from: 330, to: 720, timed: true, secs: 120, spawn: inc, every: 15, maxDyn: 4 }
      ]);
      this.goal('Arma y entrega todas las tulas', true, () => this.pi >= 2 && this.phases[1].tasks.every(t => t.done && !t.lost), () => this.pi >= 2 ? 'listas' : 'pendiente');
      this.goal('Tulas entregadas a tiempo', false, () => this.pi >= 2 && this.phases[1].tasks.every(t => !t.late), () => this.lateN + ' tarde');
      this.goal('Resuelve 4 avisos', false, () => this.incOk >= 4, () => this.incOk + '/4');
    } else if (T === 2) {
      this.begin([{ name: 'Turno intermedio: control, inventarios y cuidado de los anfitriones', short: 'Intermedio', from: 540, to: 1080, timed: true, secs: 170, spawn: inc, every: 10, maxDyn: 4,
        start: ph => nearestOf(area.filter(s => s.type === 'a'), seed.x, seed.y, 3).forEach(s => ph.tasks.push(T_ST(s, { label: 'Inventario · ' + s.name, opt: true, col: PAL.vd, pts: 12, mg: () => new MGConteo(this, { clock0: this.clock }), after: () => this.invOk++ }))) }]);
      this.goal('Resuelve 4 avisos', true, () => this.incOk >= 4, () => this.incOk + '/4');
      this.goal('2 inventarios exactos', false, () => this.invOk >= 2, () => this.invOk + '/2');
      this.goal('Ningún aviso vencido', false, () => this.incLost === 0, () => this.incLost + ' vencidos');
    } else {
      this.begin([
        { name: 'Turno de cierre: control del sistema', short: 'Control', from: 840, to: 1350, timed: true, secs: 120, spawn: inc, every: 15, maxDyn: 4 },
        { name: '10:30 p. m. · Recoger las tulas', short: 'Tulas', from: 1350, to: 1372, mgSecs: 3, toast: '🎒 Recoge la tula (celular y llaves) de cada estación.', tasks: hosts.map(s => T_ST(s, { label: 'Recoger tula · ' + s.name, due: 1372, pts: 12 })) },
        { name: 'Casa EnCicla: poner a cargar los celulares', short: 'Cargar', from: 1372, to: 1380, mgSecs: 20, tasks: [{ x: casa.x, y: casa.y, r: 22, label: 'Casa EnCicla · cargar celulares', col: PAL.cie, mg: () => new MGTulas(this, { mode: 'cargar', names: hosts.map(s => s.name), clock0: this.clock }) }] }
      ]);
      this.goal('Recoge las tulas y carga los celulares', true, () => this.pi >= 3 || (this.pi === 2 && this.phases[2].tasks.every(t => t.done)), () => this.pi >= 2 ? 'en casa' : 'pendiente');
      this.goal('Resuelve 4 avisos', false, () => this.incOk >= 4, () => this.incOk + '/4');
      this.goal('Ningún aviso vencido', false, () => this.incLost === 0, () => this.incLost + ' vencidos');
    }
  }
  incident(ph) {
    const R = this.rng, k = R.pick(['relevo', 'bicis', 'conflicto', 'semaforo', 'celular', 'anfitrion']), s = R.pick(k === 'relevo' || k === 'celular' || k === 'anfitrion' ? this.area.filter(x => x.type === 'm') : this.area), tm = this.timeMul, due = Math.round(this.clock + this.rate * 60);   // ~60 s reales para llegar
    const done = () => { this.incOk++; };
    switch (k) {
      case 'relevo': return T_ST(s, { label: 'Relevo de almuerzo · ' + s.name, due, col: PAL.cie, mg: () => new MGAnfitrion(this, { turno: 2, short: true, dur: 22 * tm, cap: 6, clock0: this.clock, rate: 2 }), after: done });
      case 'bicis': return T_ST(s, { label: 'Bicis con falla · ' + s.name, due, col: PAL.cor, mg: () => new MGInspeccion(this, { bad: 2, clock0: this.clock }), after: done });
      case 'conflicto': return T_ST(s, { label: 'Usuario inconforme · ' + s.name, due, col: '#ff8fc7', mg: () => new MGLlamadas(this, { dur: 14, clock0: this.clock }), after: done });
      case 'semaforo': { const L = R.pick(JE.map.lights.filter(g => dist(g.x, g.y, s.x, s.y) < 140 * TS)) || JE.map.lights[0]; return { x: L.x, y: L.y, r: 20, label: 'Semáforo dañado (cruce)', due, col: '#ff8a3d', mg: () => new MGTraffix(this, { dur: 24, target: 8 }), after: done }; }
      case 'celular': return T_ST(s, { label: 'Celular descargado · ' + s.name, due, col: PAL.amb, pts: 15, say: 'El celular de ' + s.name + ' se está descargando: llévale un power bank', after: done });
      default: return T_ST(s, { label: 'Visita al anfitrión · ' + s.name, due: due + 30, col: PAL.vd, pts: 15, say: 'Pasa por ' + s.name + ': el anfitrión necesita apoyo', after: done });
    }
  }
  chips() { return [{ t: '🚐 Carro de supervisión' }]; }
}

/* ======================= 6. TÉCNICO (intermedio) ======================= */
class ModeTecnicoR extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng, M = JE.map, casa = M.poi.casa;
    this.sim = new StationSim(R, { demand: this.mods.demand });
    const seed = R.pick(M.stations.filter(s => s.zone === R.pick(['centro', 'sur', 'centro']))); this.zs = nearestOf(this.sim.st, seed.x, seed.y, 14);
    this.setupRide({ sim: this.sim, start: { x: casa.x, y: casa.y + 6 } });
    this.banks = 2; this.fixed = 0; this.dead = 0; this.opSum = 0; this.opT = 0;
    this.phones = this.zs.filter(s => s.type === 'm').map(s => ({ s, bat: R.i(45, 90), weak: R.f() < .35, task: null }));
    this.baseM = this.ride.marker({ x: casa.x, y: casa.y, r: 22, col: PAL.cie, label: 'Casa EnCicla · power banks', enter: () => { if (this.banks < 3) { this.banks = 3; this.ride.float('Power banks: 3', PAL.cie); Snd.sfx('coin'); } } });
    this.base = true;
    this.begin([{ name: 'Turno intermedio: estaciones, celulares y power banks', short: 'Intermedio', from: 480, to: 1020, timed: true, secs: 170, spawn: ph => this.falla(ph), every: 16, maxDyn: 3, tick: (dt) => this.batTick(dt) }]);
    this.goal('Repara 4 fallas', true, () => this.fixed >= 4, () => this.fixed + '/4');
    this.goal('Ningún celular se apaga', false, () => this.dead === 0, () => this.dead + ' apagados');
    this.goal('Operatividad ≥ 90%', false, () => this.oper() >= 90, () => this.oper() + '%');
  }
  oper() { return this.opT ? Math.round(100 * this.opSum / this.opT) : 100; }
  falla() {
    const R = this.rng, ok = this.zs.filter(s => !s.broken), s = R.pick(ok); if (!s) return null; s.broken = true;
    const k = s.type === 'm' && R.f() < .35 ? 'cel' : R.f() < .5 ? 'totem' : 'led', fin = () => { s.broken = false; this.fixed++; };
    const mg = k === 'totem' ? () => (R.f() < .5 ? new MGLaser(this, { n: 4, turns: 2 }) : new MGSimon(this, { len: 3 })) : k === 'led' ? () => (R.f() < .5 ? new MGLoop(this, { n: 4 }) : new MGSimon(this, { len: 3 })) : () => new MGCables(this, { n: 3 });
    return T_ST(s, { label: { totem: 'Tótem apagado', led: 'LED de anclajes', cel: 'Celular de la estación' }[k] + ' · ' + s.name, due: Math.round(this.clock + this.rate * 50), grace: this.rate * 20, col: PAL.cor, mg, after: fin, onLost: () => { s.broken = false; } });
  }
  batTick(dt) {
    const dm = this.rate * dt / this.timeMul, ph = this.phase;
    const up = this.zs.filter(s => !s.broken).length / this.zs.length; this.opSum += up * dt; this.opT += dt;
    for (const p of this.phones) {
      if (p.bat > 0) p.bat -= dm * (p.weak ? .2 : .1); if (p.bat <= 0 && !p.off) { p.off = true; this.dead++; JE.ui && JE.ui.toast('📵 Se apagó el celular de ' + p.s.name); }
      if (p.bat < 30 && !p.task && !p.off) {
        p.task = this.addTask(T_ST(p.s, { label: 'Power bank · ' + p.s.name + ' (' + Math.round(p.bat) + '%)', col: PAL.amb, pts: 12, can: (t, quiet) => { if (this.banks > 0) return true; if (!quiet) JE.ui && JE.ui.toast('Sin power banks: recárgalos en Casa EnCicla'); return false; }, after: () => { this.banks--; p.bat = 100; p.off = false; p.task = null; } }), ph);
      }
    }
  }
  retarget() { super.retarget(); if (this.banks === 0 && this.phase && this.phase.tasks.some(t => !t.done && /^Power/.test(t.label))) this.ride.target = this.baseM; }
  chips() { return [{ t: '🔋 ' + this.banks + ' power banks' }, { t: 'Operatividad ' + this.oper() + '%' }]; }
}

/* ======================= 4. BODEGA (intermedio) ======================= */
class ModeBodegaR extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const M = JE.map, tm = this.timeMul, b = geoP(PUNTO_BODEGA[0], PUNTO_BODEGA[1]), bo = M.nearestOpen(Math.floor(b.x / TS), Math.floor(b.y / TS), true), taller = M.poi.taller;
    this.setupRide({ start: { x: bo.x * TS + 4, y: bo.y * TS + 4 }, veh: 'truck', load: 0, cap: 14 });
    this.begin([
      { name: 'Recepción en la bodega', short: 'Bodega', from: 480, to: 720, secs: 100, mg: () => new MGBodega2(this, { boxes: 7, clock0: 480 }), after: s => { this.bod = s; this.ride.p.load = Math.min(14, PARTES.reduce((a, k) => a + s.loaded[k], 0)); } },
      { name: 'Llevar el pedido al taller', short: 'Entrega', from: 720, to: 780, mgSecs: 3, toast: '🚚 El pedido va en el camión: llévalo al taller de los mecánicos (Casa EnCicla).', tasks: [{ x: taller.x, y: taller.y, r: 22, label: 'Taller de mecánicos', due: 780, col: PAL.cie, pts: 30, after: () => { this.entregado = true; this.ride.p.load = 0; } }] }
    ]);
    this.goal('Entrega el pedido completo al taller', true, () => this.entregado && this.bod && this.bod.pedidoOk, () => this.entregado ? 'entregado' : 'pendiente');
    this.goal('Verificación con máximo 1 error', false, () => this.bod && this.bod.errors <= 1, () => this.bod ? this.bod.errors + ' errores' : '-');
    this.goal('Entrega antes de la 1:00 p. m.', false, () => this.entregado && this.lateN === 0, () => this.lateN ? 'tarde' : this.entregado ? 'a tiempo' : 'pendiente');
  }
}
const PUNTO_BODEGA = [6.2045, -75.5868];   // aproximado (Guayabal): confirmar con el equipo

/* ======================= 3. MECÁNICO (reparación / ensamble) ======================= */
class ModeMecanicoR extends ModeSub {
  constructor(role, T, opt) {
    super(role, T, opt); const tm = this.timeMul;
    if (T === 1) {
      const S = this.sub = new MGMecanico(this, { turno: 2, diag: true, dur: 120 * tm, clock0: 480 }); this.view = S.view;
      this.goal('Repara 7 bicis que llegaron malas', true, () => S.fixed >= 7, () => S.fixed + '/7');
      this.goal('Máximo 3 herramientas equivocadas', false, () => S.errors <= 3, () => S.errors + ' errores');
      this.goal('3 bicis perfectas', false, () => S.perfect >= 3, () => S.perfect + '/3');
    } else {
      const S = this.sub = new MGEnsamble(this, { dur: 120 * tm, clock0: 480 }); this.view = S.view;
      this.goal('Arma 3 bicis nuevas', true, () => S.built >= 3, () => S.built + '/3');
      this.goal('2 bicis perfectas', false, () => S.perfect >= 2, () => S.perfect + '/2');
      this.goal('Máximo 4 errores', false, () => S.errors <= 4, () => S.errors + ' errores');
    }
  }
  info() { const S = this.sub; return { clock: fmtClock(S.min), score: S.score, chips: [{ t: this.turno === 1 ? 'Reparadas ' + S.fixed : 'Armadas ' + S.built }] }; }
}

/* ======================= 7. BALANCE (3 turnos) ======================= */
class ModeBalanceR extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng, M = JE.map, casa = M.poi.casa, park = M.poi.parqueadero, cap = T === 2 ? 40 : 14; this.capT = cap;
    this.sim = new StationSim(R, { demand: this.mods.demand * 1.1, depot: 200 });
    this.setupRide({ sim: this.sim, start: T === 3 ? { x: casa.x, y: casa.y } : { x: park.x, y: park.y }, veh: 'truck', load: T === 3 ? 6 : 0, cap }); this.sim.depot -= this.ride.p.load; this.sim.trucks.push(this.ride.p);
    this.dmg = 0; this.ordOk = 0; this.ordLost = 0; this.dmgOk = 0; this.tanteo = 0;
    this.baseM = this.ride.marker({ x: casa.x, y: casa.y, r: 22, col: PAL.cie, label: 'Casa EnCicla · bodega y taller', enter: () => this.atBase() }); this.base = true;
    const st = id => M.stations.find(s => s.id === id), stIn = ids => ids.map(st).filter(Boolean);
    const pick = (s, o) => T_ST(s, Object.assign({ col: PAL.amb, pts: 15 }, o));
    if (T === 1) {
      const v = this.variant = R.pick(['principal', 'universidad', 'envigado', 'sabaneta']), first = { x: casa.x, y: casa.y, r: 22, label: v === 'principal' ? 'Casa EnCicla · recoger al supervisor jefe' : 'Casa EnCicla · recoger las tulas', col: PAL.cie, pts: 10 };
      const dest = v === 'principal' ? [Object.assign({ label: 'Estación Suramericana · dejar al supervisor' }, M.poi.suramericana, { r: 22 })] : v === 'envigado' ? [Object.assign({ label: 'Puente Pandequeso · tulas de Envigado e Itagüí' }, M.poi.pandequeso, { r: 22 })]
        : (v === 'universidad' ? stIn(['udea', 'unal', 'universidad']) : stIn(['sabaneta', 'callelarga', 'estrella'])).map(s => T_ST(s, { label: 'Tula · ' + s.name }));
      this.begin([
        { name: 'Ruta de apertura: ' + { principal: 'supervisor jefe a Suramericana', universidad: 'tulas de la zona universitaria', envigado: 'tulas de Envigado e Itagüí', sabaneta: 'tulas de Sabaneta y La Estrella' }[v], short: 'Tulas', from: 240, to: 300, ordered: true, mgSecs: 2, toast: '🚐 4:00 a. m. · Sales del parqueadero de la Terminal del Norte.', tasks: [first].concat(dest.map(d => Object.assign({ due: 300, pts: 15, col: PAL.amb }, d))) },
        { name: 'Balanceo del día', short: 'Balanceo', from: 330, to: 780, timed: true, secs: 170, spawn: ph => this.orden(ph), every: 9, maxDyn: 3 }
      ]);
      this.goal('Ruta de apertura y 3 órdenes', true, () => this.pi >= 1 && this.phases[0].tasks.every(t => t.done) && this.ordOk >= 3, () => this.ordOk + '/3 órdenes');
      this.goal('Ninguna orden vencida', false, () => this.ordLost === 0, () => this.ordLost + ' vencidas');
      this.goal('Lleva 2 bicis dañadas al taller', false, () => this.dmgOk >= 2, () => this.dmgOk + '/2');
    } else if (T === 2) {
      this.corr = stIn(['unal', 'carlose', 'suramericana', 'estadio', 'unidad', 'floresta', 'udea', 'calasanz']); this.south = M.stations.filter(s => ['Sabaneta', 'La Estrella', 'Envigado', 'Itagüí'].includes(s.muni));
      this.begin([{ name: 'Camión especial: Campus Nacional, Suramericana, Estadio y tanteo del sur', short: 'Camión 40', from: 540, to: 1080, timed: true, secs: 180, spawn: ph => this.orden(ph, this.corr), every: 10, maxDyn: 3,
        start: ph => R.shuffle(this.south.slice()).slice(0, 3).forEach(s => ph.tasks.push(T_ST(s, { label: 'Tanteo del sur · ' + s.name, opt: true, col: PAL.vd, pts: 15, mg: () => new MGConteo(this, { clock0: this.clock, title: 'TANTEO DE LA ESTACIÓN' }), after: () => this.tanteo++ }))) }]);
      this.goal('Cumple 5 órdenes del corredor', true, () => this.ordOk >= 5, () => this.ordOk + '/5');
      this.goal('Tanteo de 2 estaciones del sur', false, () => this.tanteo >= 2, () => this.tanteo + '/2');
      this.goal('Máximo 2 choques', false, () => this.ride.stats.crashes <= 2, () => this.ride.stats.crashes + ' choques');
    } else {
      const zone = nearestOf(M.stations.filter(s => s.type === 'm'), casa.x, casa.y, 3);
      this.begin([
        { name: 'Balanceo nocturno (incluye corredores eléctricos)', short: 'Balanceo', from: 1080, to: 1320, timed: true, secs: 120, spawn: ph => this.orden(ph), every: 11, maxDyn: 3 },
        { name: '10:00 p. m. · Recoger las tulas de la zona', short: 'Tulas', from: 1320, to: 1350, mgSecs: 2, tasks: zone.map(s => T_ST(s, { label: 'Recoger tula · ' + s.name, due: 1350, pts: 12 })) },
        { name: 'Entregar las tulas en Casa EnCicla', short: 'Casa EnCicla', from: 1350, to: 1360, mgSecs: 2, tasks: [{ x: casa.x, y: casa.y, r: 24, label: 'Casa EnCicla · entregar tulas', col: PAL.cie, pts: 15 }] },
        { name: 'Guardar el camión en la Terminal del Norte', short: 'Parqueadero', from: 1360, to: 1380, mgSecs: 2, tasks: [{ x: park.x, y: park.y, r: 24, label: 'Parqueadero Terminal del Norte', due: 1380, col: PAL.cie, pts: 20, after: () => { this.parked = true; } }] }
      ]);
      this.goal('Tulas en Casa EnCicla y camión parqueado', true, () => !!this.parked, () => this.parked ? 'listo' : 'pendiente');
      this.goal('Cumple 3 órdenes nocturnas', false, () => this.ordOk >= 3, () => this.ordOk + '/3');
      this.goal('Ninguna orden vencida', false, () => this.ordLost === 0, () => this.ordLost + ' vencidas');
    }
  }
  /* orden de Monitoreo: llevar o recoger bicis; a veces recoger una bici dañada para el taller */
  orden(ph, pool) {
    const R = this.rng, P = this.ride.p, used = new Set(ph.tasks.filter(t => !t.done).map(t => t.st));
    const st = (pool ? this.sim.st.filter(s => pool.some(p => p.i === s.i)) : this.sim.st).filter(s => !used.has(s) && s.open && dist(s.x, s.y, P.x, P.y) > 120 && dist(s.x, s.y, P.x, P.y) < 900 * SC);
    if (!st.length) return null;
    if (R.f() < .22) { const s = R.pick(st); return T_ST(s, { label: '🔧 Bici dañada · ' + s.name, say: 'Hay una bici dañada en ' + s.name + ': recógela para el taller', due: Math.round(this.clock + this.rate * 60), col: PAL.cor, pts: 12, can: (t, q) => { if (P.load < P.cap && s.bikes > 0) return true; if (!q) JE.ui && JE.ui.toast('El camión está lleno: descarga en Casa EnCicla'); return false; }, after: () => { s.bikes--; P.load++; this.dmg++; } }); }
    st.sort((a, b) => a.bikes / a.cap - b.bikes / b.cap); const low = R.f() < .55, s = R.pick(low ? st.slice(0, 5) : st.slice(-5)), type = s.bikes / s.cap < .5 ? 'llevar' : 'recoger', n = Math.max(3, Math.round(Math.abs(s.bikes - s.cap * .55)));
    const t = T_ST(s, { label: (type === 'llevar' ? 'LLEVAR ' : 'RECOGER ') + n + ' · ' + s.name + (s.e ? ' ⚡' : ''), say: 'Orden de Monitoreo: ' + (type === 'llevar' ? 'lleva ' : 'recoge ') + n + ' bicis a ' + s.name, due: Math.round(this.clock + this.rate * 55), col: type === 'llevar' ? PAL.vd : PAL.amb, pts: 30 });
    t.can = (tt, q) => { const ok = type === 'llevar' ? P.load > 0 : P.load < P.cap; if (!ok && !q) JE.ui && JE.ui.toast(type === 'llevar' ? 'Camión vacío: carga en Casa EnCicla' : 'Camión lleno: descarga en Casa EnCicla'); return ok; };
    t.after = () => { let m; if (type === 'llevar') { m = Math.min(n, P.load - this.dmg > 0 ? P.load - this.dmg : 0, s.cap - s.bikes); P.load -= m; s.bikes += m; } else { m = Math.min(n, s.bikes, P.cap - P.load); P.load += m; s.bikes -= m; } this.ordOk++; Snd.sfx('truck'); };
    t.onLost = () => { this.ordLost++; };
    return t;
  }
  atBase() {
    const P = this.ride.p; if (this.dmg) { this.sim.shop += this.dmg; P.load -= this.dmg; this.dmgOk += this.dmg; this.ride.float('+' + this.dmg + ' al taller', PAL.cie); this.score += 10 * this.dmg; this.dmg = 0; }
    const want = Math.round(P.cap * .6), d = want - P.load;
    if (d > 0) { const k = Math.min(d, this.sim.depot); P.load += k; this.sim.depot -= k; } else if (d < 0) { P.load += d; this.sim.depot -= d; }
    Snd.sfx('truck'); this.ride.float('Carga: ' + P.load + '/' + P.cap, PAL.cie); this.retarget();
  }
  retarget() { super.retarget(); const P = this.ride.p, ph = this.phase; if (!ph || !ph.timed) return; const o = ph.tasks.filter(t => !t.done && !t.opt); if (!o.length) return; if (this.dmg && P.load >= P.cap) this.ride.target = this.baseM; else if (o.every(t => t.can && !t.can(t, true))) this.ride.target = this.baseM; }
  chips() { return [{ t: '🚚 ' + this.ride.p.load + '/' + this.capT + (this.dmg ? ' · 🔧' + this.dmg : '') }]; }
}

/* ======================= 8. MONITOREO (sala de control / atención al cliente) ======================= */
class ModeMonitoreoR extends ModeMonitoreo {
  constructor(role, T, opt) {
    super(role, 1, opt); this.turno = T; this.invChk = null; this.invRight = 0; this.invN = 0; this.nextInv = 360; this.tSpd = 1.8;   // en el mapa real las estaciones quedan más lejos
    this.goals.shift(); this.goals.pop(); this.goals.unshift({ txt: 'Nivel de servicio ≥ 65%', main: true, ok: () => this.serv() * 100 >= 65, prog: () => Math.round(this.serv() * 100) + '%' });
    this.goal('Inventarios de cada hora bien revisados (≥ 80%)', false, () => this.invN > 0 && this.invRight / this.invN >= .8, () => this.invRight + '/' + this.invN);
  }
  update(dt) {
    if (this.invChk) { this.t += dt; this.invChk.t -= dt; if (this.invChk.t <= 0) this.invAns(-2); return; }   // la sala espera la verificación
    super.update(dt);
    if (this.clock >= this.nextInv && this.clock < 1250) { this.nextInv += 60; this.newInv(); }
  }
  newInv() {
    const R = this.rng, L = R.shuffle(this.zs.slice()).slice(0, 3), bad = R.f() < .6 ? R.i(0, 2) : -1;
    this.invChk = { L: L.map((s, i) => ({ s, rep: s.bikes + (i === bad ? R.pick([-2, -1, 1, 2]) : 0) })), bad, t: 12 * this.timeMul, hour: fmtClock(this.clock) };
    Snd.sfx('bell');
  }
  invAns(i) { const c = this.invChk; if (!c) return; this.invN++; if (i === c.bad) { this.invRight++; this.score += 15; Snd.sfx('ok'); if (i >= 0) this.say('📋 Inventario corregido en ' + c.L[i].s.name); } else { Snd.sfx('bad'); this.errors++; this.say(i === -2 ? '📋 Inventario sin revisar' : '📋 La verificación no cuadró'); } this.invChk = null; }
  hud(V) {
    super.hud(V); const c = this.invChk; if (!c) return; this.btns = [];
    const w = Math.min(420, V.w - 16), h = 84 + c.L.length * 46 + 54, x = (V.w - w) / 2, y = 70, X = V.ctx;
    X.fillStyle = PAL.crema; X.fillRect(x, y, w, h); X.strokeStyle = PAL.az; X.lineWidth = 4; X.strokeRect(x + 2, y + 2, w - 4, h - 4); X.fillStyle = PAL.az; X.fillRect(x, y, w, 26);
    V.text('INVENTARIO DE LAS ' + c.hour + ' · ¿cuál no cuadra?', x + 10, y + 18, { size: 14, color: PAL.vd1 });
    V.text('Reportado por el anfitrión vs. sistema (' + Math.ceil(c.t / this.timeMul) + ' s)', x + 10, y + 46, { size: 13, color: PAL.az, body: true });
    c.L.forEach((q, i) => this.button(V, x + 10, y + 60 + i * 46, w - 20, 40, q.s.name + ': reporta ' + q.rep + ' · sistema ' + q.s.bikes, () => this.invAns(i), { size: 13, key: 'iv' + i }));
    this.button(V, x + 10, y + 60 + c.L.length * 46, w - 20, 44, '✓ Todo cuadra', () => this.invAns(-1), { bg: PAL.vd2, size: 15, key: 'ivok' });
  }
  pointer(type, vx, vy, cx, cy) { if (this.invChk) { Mode.prototype.pointer.call(this, type, vx, vy, cx, cy); return true; } return super.pointer(type, vx, vy, cx, cy); }
  hint() { if (this.invChk) { const R = this.rects || {}; return this.invN < 1 ? R[this.invChk.bad >= 0 ? 'iv' + this.invChk.bad : 'ivok'] || null : null; } return super.hint(); }
  get hideGoals() { return !!this.invChk; }
  bot(err) { if (this.invChk) { if (this.t > (this.invAt || 0)) { this.invAt = this.t + .6; this.invAns(this.rng.f() < err ? this.rng.i(-1, 2) : this.invChk.bad); } return; } super.bot(err); }
}
class ModeAtencion extends ModeSub {
  constructor(role, T, opt) {
    super(role, T, opt); const S = this.sub = new MGLlamadas(this, { dur: 120 * this.timeMul, clock0: 420, rate: 480 / (120 * this.timeMul) }); this.view = S.view;
    this.goal('Resuelve 8 llamadas', true, () => S.solved >= 8, () => S.solved + '/8');
    this.goal('Máximo 2 respuestas equivocadas', false, () => S.wrongs <= 2, () => S.wrongs + ' errores');
    this.goal('Máximo 1 usuario cuelga', false, () => S.lost <= 1, () => S.lost + ' colgaron');
  }
  info() { return { clock: fmtClock(this.sub.min), score: this.sub.score, chips: [{ t: '📞 En espera ' + this.sub.queue.length }] }; }
}

Object.assign(MODE_CLASS, {
  anfitrion: ModeAnfitrionR, apoyo: ModeApoyoR, supervisor: ModeSupervisorR, tecnico: ModeTecnicoR, bodega: ModeBodegaR, mecanico: ModeMecanicoR, balance: ModeBalanceR,
  monitoreo: function (role, T, opt) { return T === 2 ? new ModeAtencion(role, T, opt) : new ModeMonitoreoR(role, T, opt); }
});
