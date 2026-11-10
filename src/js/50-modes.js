/* =====================================================================
   MODOS DE JUEGO (escalafón EnCicla) + novedades + mejoras
   ===================================================================== */
const ROLES = [
  { id: 'usuario', name: 'Usuario', tier: 'Ciudadanía', icon: 'usuario', vista: 'Cenital · mundo libre', unlock: 0, desc: 'Toma una bici y recorre el valle por las ciclorrutas. Devuélvela antes de 60 minutos.', how: ['Arrastra el dedo para pedalear (o usa las flechas).', 'Sigue la línea punteada y la flecha amarilla.', 'Recoge hojas verdes y postales de la ciudad.'] },
  { id: 'anfitrion', name: 'Anfitrión', tier: 'Operación de estación', icon: 'anfitrion', vista: 'Panorámica · arcade', unlock: 1, desc: 'Atiende la ventanilla: presta, recibe, revisa tarjetas y organiza las bicis.', how: ['Toca al usuario de la fila.', 'Revisa la tarjeta y elige una bici con luz verde.', 'Las bicis dañadas van al TALLER (caja roja).'] },
  { id: 'mecanico', name: 'Mecánico', tier: 'Taller', icon: 'mecanico', vista: 'Lateral · puzzle de rapidez', unlock: 3, desc: 'Repara bicis contra el reloj: cada falla tiene su herramienta.', how: ['Mira la falla que parpadea en la bici.', 'Toca la herramienta del MISMO COLOR.', 'Con la bomba, toca ¡YA! en la zona verde.'] },
  { id: 'bodega', name: 'Bodega', tier: 'Taller', icon: 'bodega', vista: 'Lateral · organización rápida', unlock: 5, desc: 'Clasifica los repuestos y carga las bicis nuevas al camión.', how: ['Espera que la pieza llegue al ESCÁNER.', 'Toca la caja de su mismo color.', 'Llena el camión con 10 bicis nuevas.'] },
  { id: 'apoyo', name: 'Apoyo', tier: 'Operación de campo', icon: 'apoyo', vista: 'Cenital · estrategia', unlock: 8, desc: 'Recorre tu zona: abre estaciones automáticas, haz relevos y verifica estaciones.', how: ['Cada número en el mapa es una tarea.', 'Tú eliges el orden: ¡ojo con las horas límite!', 'Al llegar, resuelve la tarea.'] },
  { id: 'tecnico', name: 'Técnico', tier: 'Operación de campo', icon: 'tecnico', vista: 'Cenital · acción', unlock: 11, desc: 'Las estaciones se dañan: llega rápido y repáralas para mantener la operatividad.', how: ['Las estaciones con marca roja están dañadas.', 'Llega y repara: cables o tótem.', 'Mantén la operatividad alta.'] },
  { id: 'balance', name: 'Balance', tier: 'Operación de campo', icon: 'balance', vista: 'Cenital · conducción', unlock: 14, desc: 'Maneja el camión: lleva bicis a estaciones vacías y recoge de las llenas.', how: ['Monitoreo te envía órdenes numeradas.', 'Conduce por las vías: el camión no cabe en ciclorrutas.', 'Pasa por la BODEGA para cargar o descargar.'] },
  { id: 'monitoreo', name: 'Monitoreo', tier: 'Centro de control', icon: 'monitoreo', vista: 'General · estrategia', unlock: 17, desc: 'Desde la sala de control, envía camiones para que ninguna estación quede vacía o llena.', how: ['Toca una estación para ver sus bicis.', 'Envía un camión: LLEVAR o RECOGER.', 'Antes del cierre, regresa los camiones vacíos a la bodega.'] },
  { id: 'supervisor', name: 'Supervisor', tier: 'Coordinación', icon: 'supervisor', vista: 'Todas las vistas', unlock: 21, desc: 'Abre y cierra el sistema, asigna al personal y resuelve todo lo que pase en el día.', how: ['Asigna cada anfitrión a su zona.', 'Atiende los avisos: viaja y resuélvelos.', 'En la bodega puedes tomar el camión.'] }
];
const ROLE = {}; ROLES.forEach((r, i) => { r.n = i + 1; ROLE[r.id] = r; });
const PERKS = {
  llantas: { name: 'Llantas infladas', desc: '+12% de velocidad en bici', icon: 'llanta' },
  tinto: { name: 'Tinto bien cargado', desc: '+10% de tiempo en cada turno', icon: 'luz' },
  chaleco: { name: 'Chaleco reflectivo', desc: 'El primer choque no cuenta', icon: 'apoyo' },
  sonrisa: { name: 'Sonrisa EnCicla', desc: 'Los usuarios esperan 25% más', icon: 'anfitrion' },
  llave: { name: 'Llave mágica', desc: 'Una falla menos por bici', icon: 'llave' },
  ojo: { name: 'Ojo de bodeguero', desc: 'La banda va 15% más lenta', icon: 'caja' },
  camion: { name: 'Camión ágil', desc: '+15% de velocidad del camión', icon: 'balance' },
  radio: { name: 'Radio de Monitoreo', desc: '+20% de puntos por tareas', icon: 'monitoreo' },
  timbre: { name: 'Timbre sonoro', desc: 'Más puntos por usar el timbre', icon: 'timbre' }
};
const NOVEDADES = [
  { id: 'normal', name: 'Día normal', desc: 'Sin novedades. ¡A rodar!', mods: {} },
  { id: 'lluvia', name: 'Aguacero paisa', desc: 'Piso mojado: frena antes. Salen menos usuarios.', mods: { rain: true, demand: .85 } },
  { id: 'sincarro', name: 'Día sin carro', desc: 'Casi no hay carros y salen más bicis.', mods: { traffic: .2, demand: 1.2 } },
  { id: 'pico', name: 'Hora pico', desc: 'Más tráfico y más usuarios.', mods: { traffic: 1.5, demand: 1.2, pico: true } },
  { id: 'partido', name: 'Partido en el Atanasio', desc: 'Mucha gente pedalea hacia el Estadio.', mods: { demand: 1.1, extra: { id: 'estadio', mult: 3 } } },
  { id: 'flores', name: 'Feria de las Flores', desc: 'Silleteros por las aceras y turistas por toda la ciudad: filas más largas.', mods: { demand: 1.3, flores: true } },
  { id: 'ciclovia', name: 'Ciclovía', desc: 'Avenida El Poblado, Avenida 80 y Las Vegas cerradas a los carros: ¡conos y bicis por todas partes!', mods: { traffic: .5, ciclovia: true } }
];

/* novedades de temporada: no entran en los retos con código para no cambiar sus semillas */
const NOV_EXTRA = [
  { id: 'alumbrados', name: 'Alumbrados navideños', desc: 'El río Medellín se llena de luces de colores y todo el valle sale a verlas: más usuarios.', mods: { demand: 1.25, alumbrados: true } }
];
/* temporada según el mes real: el Valle de Aburrá tiene dos épocas secas y dos de lluvias */
const SEASONS = [
  { id: 'seca1', name: 'Temporada seca', icon: '☀️', desc: 'De diciembre a febrero casi no llueve: días despejados para pedalear.', w: { lluvia: .4 } },
  { id: 'lluvia1', name: 'Primera temporada de lluvias', icon: '🌧️', desc: 'De marzo a mayo los aguaceros llegan sin avisar: puede caer un chubasco en pleno turno.', w: { lluvia: 3 }, wet: true },
  { id: 'seca2', name: 'Veranillo de mitad de año', icon: '🌤️', desc: 'De junio a agosto hay tardes soleadas, viento de cometas y más ciclovías.', w: { lluvia: .5, ciclovia: 1.6 } },
  { id: 'lluvia2', name: 'Segunda temporada de lluvias', icon: '⛈️', desc: 'De septiembre a noviembre es la época más lluviosa: puede caer un chubasco en pleno turno.', w: { lluvia: 3.5 }, wet: true }
];
const Season = JE.season = {
  now(d) { const m = (d || new Date()).getMonth(); return SEASONS[m === 11 || m < 2 ? 0 : m < 5 ? 1 : m < 8 ? 2 : 3]; },
  /* novedad al azar, con pesos según la temporada (agosto: Feria de las Flores; diciembre: Alumbrados) */
  pick(rng, d) {
    const m = (d || new Date()).getMonth(), S = this.now(d), all = NOVEDADES.concat(NOV_EXTRA);
    const w = all.map(n => (S.w[n.id] || 1) * (n.id === 'flores' ? (m === 7 ? 5 : .5) : n.id === 'alumbrados' ? (m === 11 ? 6 : 0) : 1));
    let r = rng.f() * w.reduce((a, b) => a + b, 0); for (let i = 0; i < all.length; i++) { r -= w[i]; if (r <= 0) return all[i]; } return all[0];
  }
};

class Mode {
  constructor(role, turno, opt) {
    this.role = role; this.id = role.id; this.turno = turno; this.opt = opt; this.free = !!opt.free;
    this.rng = new RNG(opt.seed); this.t = 0; this.score = 0; this.errors = 0; this.done = false; this.goals = []; this.coach = ''; this.sub = null; this.btns = []; this.pops = [];
    this.nov = opt.nov || NOVEDADES[0]; this.mods = Object.assign({ demand: 1, traffic: 1 }, this.nov.mods); this.perks = opt.perks || [];
    const pace = Save.data.settings.pace; this.timeMul = (pace === 'tranquilo' ? 1.4 : pace === 'arcade' ? .85 : 1) * (this.has('tinto') ? 1.1 : 1);
    this.patMul = pace === 'tranquilo' ? 1.35 : 1; this.paceRate = pace === 'tranquilo' ? .8 : pace === 'arcade' ? 1.1 : 1;
    this.view = { kind: 'map' }; this.stats = {}; this.clock = 360; this.rate = 1;
    // chubasco pasajero en temporada de lluvias (semilla aparte: no altera el resto del turno)
    if (opt.wet && !this.mods.rain) { const r = new RNG((opt.seed ^ 0x51ed27) >>> 0); if (r.f() < .55) this.shower = { at: 22 + r.f() * 40, dur: 20 + r.f() * 12, on: 0 }; }
  }
  has(p) { return this.perks.includes(p); }
  goal(txt, main, ok, prog) { this.goals.push({ txt, main, ok, prog: prog || (() => '') }); }
  runSub(mg, cb) { this.sub = mg; this.subCb = cb; }
  updSub(dt) {
    if (!this.sub) return false; this.sub.update(dt);
    if (this.sub.done) { const s = this.sub; this.sub = null; if (this.subCb) this.subCb(s); }
    return true;
  }
  end() { this.done = true; }
  result() {
    const g = this.goals.map(x => ({ txt: x.txt, main: x.main, ok: !!x.ok() }));
    const pass = g.filter(x => x.main).every(x => x.ok);
    return { score: Math.max(0, Math.round(this.score)), goals: g, stars: pass ? g.filter(x => x.ok).length : 0, pass };
  }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [] }; }
  actions() { return []; }
  pointer(type, vx, vy, cx, cy) {
    if (type === 'down') for (const b of this.btns) if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) { Snd.sfx('tap'); b.fn(); return true; }
    return false;
  }
  key() { }
}
Mode.prototype.button = MG.prototype.button;

/* ---------- base para modos en el mapa ---------- */
class MapMode extends Mode {
  setupRide(o) { this.ride = new Ride(this, Object.assign({ traffic: this.mods.traffic }, o)); }
  tickClock(dt) { this.clock += this.rate * dt / this.timeMul; }
  update(dt) {
    this.t += dt; this.tickClock(dt);
    const sh = this.shower;
    if (sh) {
      if (!sh.on && this.t >= sh.at) { sh.on = 1; this.mods.rain = true; JE.ui && JE.ui.toast('🌧️ ¡Se vino el agua! Piso mojado: frena con tiempo.'); }
      else if (sh.on === 1 && this.t >= sh.at + sh.dur) { sh.on = 2; this.mods.rain = false; JE.ui && JE.ui.toast('🌤️ Escampó. ¡A rodar!'); }
    }
    if (this.updSub(dt)) return;
    this.ride.update(dt, this.botDir || Input.dir());
    this.tick(dt);
  }
  tick() { }
  onRed() { this.score -= 5; }
  onStreak(lv) { this.score += 5 * lv; }
  onPed() { this.score -= 3; }
  /* Easter eggs: minijuegos secretos */
  easter(kind) {
    if (this.sub || this.done) return;
    const metro = kind === 'metro', mg = metro ? new MGRutas(this, { theme: 'metro', dur: 45, clock0: this.clock }) : new MGLaberinto(this, { n: 9, clock0: this.clock });
    JE.ui && JE.ui.toast(metro ? '🚇 ¡Encontraste al Maquinista secreto!' : '🌼 ¡Encontraste el Laberinto secreto de Moravia!');
    this.runSub(mg, s => {
      this.score += Math.round(s.score / 2); Save.data.flags[metro ? 'metroEgg' : 'mazeEgg'] = 1;
      this.ride.stamp = { t: 2.4, title: metro ? 'PRÓXIMAMENTE: JUEGA METRO' : '¡LABERINTO RESUELTO!', sub: metro ? 'El juego 11 de la saga: Metro, Metroplús y buses' : 'Moravia: de basurero a jardín', bg: metro ? PAL.cie : '#ffd84a' };
      Snd.sfx('star');
    });
  }
  onThanks() { this.score += 1; }
  /* mano guía: arrastrar hacia la ruta mientras no se haya movido */
  hint(V) {
    if (this.sub || !this.ride || this.ride.stats.dist > 60 || this.ride.big) return null;
    const R = this.ride, g = R.gps[1] || R.gps[0] || R.target; if (!g) return null;
    const dx = g.x - R.p.x, dy = g.y - R.p.y, l = Math.hypot(dx, dy) || 1;
    return { x: V.w / 2 - dx / l * 30, y: V.h * .62 - dy / l * 30, dx: dx / l * 80, dy: dy / l * 80, drag: true, txt: 'Arrastra' };
  }
  render(V) { this.ride.render(V, this.clock); }
  hud(V) { this.btns = []; this.ride.hud(V); this.hud2(V); }
  hud2() { }
  pointer(type, vx, vy, cx, cy) {
    if (type !== 'down') return false;
    if (this.ride.big) { this.ride.big = false; return true; }
    if (super.pointer(type, vx, vy, cx, cy)) return true;
    if (this.ride.inMini(cx, cy)) { this.ride.big = true; Snd.sfx('tap'); return true; }
    return false;
  }
  key(e) { if (e.code === 'Space' && this.ride && this.ride.p.veh === 'bike') this.ride.bell(); if (e.code === 'KeyM' && this.ride) this.ride.big = !this.ride.big; }
  actions() { return this.ride && this.ride.p.veh === 'bike' ? [{ id: 'bell', icon: 'timbre', label: 'Timbre', fn: () => { this.ride.bell(); if (this.has('timbre')) this.score += 1; } }] : []; }
  stationZone(z) { return JE.map.stations.filter(s => !z || s.zone === z); }
  /* sub-zona: estaciones a menos de rad baldosas de un centro al azar (el mapa es grande: Caldas → Barbosa) */
  subZone(list, rad, cx, cy) {
    if (cx == null) { const c = this.rng.pick(list); cx = c.x; cy = c.y; }
    const r = list.filter(s => dist(s.x, s.y, cx, cy) <= rad * TS * SC); return r.length >= 5 ? r : list.slice().sort((a, b) => dist(a.x, a.y, cx, cy) - dist(b.x, b.y, cx, cy)).slice(0, 8);
  }
  /* bot: sigue el flujo de ruta hacia el objetivo */
  botDrive() {
    const T = this.ride.target; if (!T) { this.botDir = { x: 0, y: 0, m: 0 }; return; }
    const P = this.ride.p, D = JE.map.flow(Math.floor(T.x / TS), Math.floor(T.y / TS), P.veh === 'truck');
    let tx = Math.floor(P.x / TS), ty = Math.floor(P.y / TS);
    if (D[ty * MW + tx] >= 1e9) { const n = JE.map.nearestOpen(tx, ty, P.veh === 'truck'); this.botDir = this.dirTo(n.x * TS + 4, n.y * TS + 4); return; }
    let c = { x: tx, y: ty }; const h0 = this.botHist; const cur = JE.map.lightAt[ty * MW + tx];
    for (let i = 0; i < 2; i++) {
      const n = JE.map.nextStep(D, c.x, c.y); if (!n) break;
      const li = JE.map.lightAt[n.y * MW + n.x];
      if (li >= 0 && li !== cur && JE.map.lightAt[c.y * MW + c.x] !== li) { const ew = Math.abs(n.x - c.x) >= Math.abs(n.y - c.y), st = JE.map.lightState(JE.map.lights[li], this.t)[ew ? 0 : 1]; if (st !== 'g') { this.botDir = { x: 0, y: 0, m: 0 }; if (h0) { h0.t = this.t; h0.x = P.x; h0.y = P.y; } return; } }
      c = n;
    }
    if (c.x === tx && c.y === ty) this.botDir = this.dirTo(T.x, T.y); else this.botDir = this.dirTo(c.x * TS + 4, c.y * TS + 4);
    for (const car of this.ride.cars) { const dx = car.x - P.x, dy = car.y - P.y, al = dx * this.botDir.x + dy * this.botDir.y, lat = Math.abs(-dx * this.botDir.y + dy * this.botDir.x); if (al > 0 && al < (P.veh === 'truck' ? 24 : 16) && lat < 8 && Math.cos(car.ang) * this.botDir.x + Math.sin(car.ang) * this.botDir.y > .5) { this.botDir = { x: 0, y: 0, m: 0 }; if (h0) { h0.t = this.t; h0.x = P.x; h0.y = P.y; } return; } }
    // si no avanza en 1 s, retrocede/gira al azar un momento
    const h = this.botHist || (this.botHist = { x: P.x, y: P.y, t: this.t, esc: 0 });
    if (h.esc > this.t) { this.botDir = h.dir; return; }
    if (this.t - h.t > 1) { if (dist(h.x, h.y, P.x, P.y) < 3) { h.esc = this.t + .7; const a = P.a + Math.PI + (this.rng.f() - .5) * 2.4; h.dir = { x: Math.cos(a), y: Math.sin(a), m: 1 }; } h.x = P.x; h.y = P.y; h.t = this.t; }
  }
  dirTo(x, y) { const dx = x - this.ride.p.x, dy = y - this.ride.p.y, l = Math.hypot(dx, dy) || 1; return { x: dx / l, y: dy / l, m: 1 }; }
}

/* ======================= 1. USUARIO ======================= */
class ModeUsuario extends MapMode {
  constructor(role, turno, opt) {
    super(role, turno, opt); const T = turno, R = this.rng;
    this.sim = new StationSim(R, { demand: this.mods.demand }); this.rate = 1.2; this.clock = 390 + R.i(0, 60);
    const starts = this.free ? JE.map.stations : JE.map.stations.filter(s => s.zone === (T === 1 ? 'centro' : R.pick(['norte', 'centro', 'sur'])));
    this.st0 = R.pick(starts); this.setupRide({ sim: this.sim, start: { x: this.st0.x, y: this.st0.y } });
    this.legs = this.free ? 0 : T; this.leg = 0; this.lateLegs = 0; this.okLegs = 0; this.leavesGot = 0; this.newPost = 0; this.loan0 = this.clock; this.phase = 'go';
    this.makeLeaves(); if (!this.free) this.nextLeg(this.st0); else this.freeSetup();
    if (this.free) { this.goal('Paseo libre: explora y colecciona postales', true, () => true); }
    else {
      this.goal(T === 1 ? 'Devuelve la bici a tiempo (≤ 60 min)' : 'Haz ' + T + ' viajes y devuelve a tiempo', true, () => this.okLegs >= T, () => this.okLegs + '/' + T);
      const cic = [0, 50, 55, 60][T]; this.goal('Rueda ≥ ' + cic + '% por ciclorruta', false, () => this.cicPct() >= cic, () => this.cicPct() + '%');
      if (T === 1) this.goal('Recoge 5 hojas verdes', false, () => this.leavesGot >= 5, () => this.leavesGot + '/5');
      else if (T === 2) this.goal('Respeta los semáforos (0 en rojo)', false, () => this.ride.stats.reds === 0, () => this.ride.stats.reds + ' en rojo');
      else this.goal('8 hojas y máximo 2 choques', false, () => this.leavesGot >= 8 && this.ride.stats.crashes <= 2, () => this.leavesGot + ' hojas');
    }
    this.coach = 'Arrastra el dedo para pedalear y sigue la línea punteada.';
    this.takeBike(this.st0);
  }
  takeBike(s) { const st = this.sim.st[s.i]; if (st.bikes > 0) st.bikes--; else this.sim.depot--; this.sim.held++; }
  cicPct() { return Math.round(100 * this.ride.stats.ciclo / Math.max(1, this.ride.stats.dist)); }
  loanMin() { return Math.floor(this.clock - this.loan0); }
  makeLeaves() {
    const L = this.ride.leaves; let n = 0;
    for (let k = 0; k < 4000 && n < 70; k++) { const x = this.rng.i(0, MW - 1), y = this.rng.i(0, MH - 1); if (JE.map.get(x, y) === TT.CICLO) { L.push({ x: x * TS + 4, y: y * TS + 4 }); n++; } }
  }
  onLeaf() { this.leavesGot++; this.score += 5; Save.data.stats.leaves++; }
  nextLeg(from) {
    const R = this.rng, T = this.turno, minD = [0, 35, 50, 60][T] * SC, maxD = [0, 80, 110, 130][T] * SC;
    const cands = PUBLIC_LM().filter(l => { const d = Math.hypot(l.x + l.w / 2 - from.x / TS, l.y + l.h / 2 - from.y / TS); return d >= minD && d <= maxD; });
    const L = R.pick(cands.length ? cands : PUBLIC_LM()); this.lm = L;
    const near = JE.map.stations.filter(s => s !== from).map(s => ({ s, d: Math.hypot(s.x / TS - (L.x + L.w / 2), s.y / TS - (L.y + L.h / 2)) })).sort((a, b) => a.d - b.d).slice(0, 3);
    this.ret = R.pick(near).s; this.phase = 'go';
    this.ride.markers = [];
    const m = this.ride.marker({ x: (L.x + L.w / 2) * TS, y: (L.y + L.h) * TS + 6, r: Math.max(L.w, L.h) * TS / 2 + 10, col: PAL.amb, label: L.name, num: 1, enter: () => this.reachLandmark() });
    this.ride.target = m; this.toast('Viaje ' + (this.leg + 1) + ': ve a ' + L.name);
  }
  reachLandmark() {
    if (this.phase !== 'go') return; this.phase = 'return'; this.score += 20; Snd.sfx('star'); this.ride.float('¡Postal!', PAL.amb);
    this.collect(this.lm);
    this.ride.markers = []; const s = this.ret;
    const m = this.ride.marker({ x: s.x, y: s.y, r: 18, col: PAL.vd, label: s.name, num: 2, enter: () => this.dock() });
    this.ride.target = m; this.toast('Ahora devuelve la bici en EnCicla ' + s.name);
  }
  collect(L) { const nw = !Save.data.postales.includes(L.id); this.ride.stamp = { t: 1.8, title: nw ? '¡NUEVA POSTAL!' : '¡POSTAL!', sub: L.name }; if (nw) { Save.data.postales.push(L.id); this.newPost++; this.score += 15; } }
  dock() {
    if (this.phase !== 'return') return; const lm = this.loanMin(), late = lm > 60;
    if (late) { this.lateLegs++; this.score -= 20; Snd.sfx('lose'); this.toast('Devolviste tarde (' + lm + ' min): sanción'); }
    else { this.okLegs++; this.score += 30 + Math.max(0, 60 - lm); Snd.sfx('win'); this.ride.float('¡A tiempo!', PAL.vd1); }
    Save.data.stats.trips++; const st = this.sim.st[this.ret.i]; this.sim.held--; if (st.bikes < st.cap) st.bikes++; else this.sim.depot++;
    this.leg++;
    if (this.leg >= this.legs) { this.phase = 'done'; this.endT = 1.2; }
    else { const at = this.ret; this.loan0 = this.clock; this.takeBike(at); this.nextLeg(at); this.toast('Nuevo préstamo en ' + at.name + ': ahora ve a ' + this.lm.name); }
  }
  freeSetup() {
    const todo = PUBLIC_LM().filter(l => !Save.data.postales.includes(l.id));
    for (const L of todo) this.ride.marker({ x: (L.x + L.w / 2) * TS, y: (L.y + L.h) * TS + 6, r: Math.max(L.w, L.h) * TS / 2 + 10, col: PAL.amb, label: L.name, enter: (m) => { this.collect(L); this.score += 20; Snd.sfx('star'); this.ride.float('¡Postal!', PAL.amb); this.ride.removeMarker(m); this.pickFreeTarget(); } });
    this.pickFreeTarget();
  }
  pickFreeTarget() { const P = this.ride.p; let best = null, bd = 1e9; for (const m of this.ride.markers) { const d = dist(m.x, m.y, P.x, P.y); if (d < bd) { bd = d; best = m; } } this.ride.target = best; }
  toast(t) { this.toastMsg = t; if (JE.ui) JE.ui.toast(t); }
  nearStation() { const P = this.ride.p; return JE.map.stations.find(s => dist(s.x, s.y, P.x, P.y) < 24); }
  tick(dt) {
    if (this.endT != null) { this.endT -= dt; if (this.endT <= 0) this.end(); return; }
    if (!this.free && this.loanMin() > 100) { this.toast('Pasaron más de 100 minutos: el préstamo se cerró con sanción'); this.end(); }
    if (this.loanMin() > 45 && !this.warned && !this.free) { this.warned = true; this.toast('¡Ojo! Llevas 45 minutos: busca la estación.'); }
    if (this.phase === 'go') this.warned = this.loanMin() > 45 ? this.warned : false;
  }
  info() { const lm = this.loanMin(); return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: 'Préstamo ' + lm + ' min', c: lm > 60 ? 'bad' : lm > 45 ? 'warn' : '' }] }; }
  actions() {
    const a = super.actions();
    if (this.free && this.nearStation()) a.push({ id: 'dock', icon: 'estacion', label: 'Devolver', fn: () => { Save.data.stats.trips++; this.toast('Bici devuelta en ' + this.nearStation().name); this.end(); } });
    return a;
  }
  bot() { this.botDrive(); }
}

/* ======================= 2. ANFITRIÓN ======================= */
class ModeSub extends Mode {
  update(dt) { this.t += dt; this.sub.update(dt); this.clock = this.sub.min || this.clock; this.score = this.sub.score; this.errors = this.sub.errors; this.coach = this.sub.coach; if (this.sub.done) this.end(); }
  render(V) { this.sub.render(V); }
  hud(V) { this.sub.hud(V); }
  pointer(t, vx, vy, cx, cy) { return this.sub.pointer(t, vx, vy, cx, cy); }
  bot(err) { this.sub.bot(err); }
}
class ModeAnfitrion extends ModeSub {
  constructor(role, T, opt) {
    super(role, T, opt);
    const cfg = [null, { c0: 330, target: 12 }, { c0: 690, target: 16 }, { c0: 990, target: 20 }][T];
    this.sub = new MGAnfitrion(this, { turno: T, dur: 150 * this.timeMul, clock0: cfg.c0, rate: 1.6 / this.timeMul });
    this.view = this.sub.view; const S = this.sub;
    this.goal('Atiende ' + cfg.target + ' usuarios', true, () => S.served >= cfg.target, () => S.served + '/' + cfg.target);
    this.goal('Máximo ' + (T === 3 ? 3 : 2) + ' errores', false, () => S.errors <= (T === 3 ? 3 : 2), () => S.errors + ' errores');
    if (T === 1) this.goal('Nadie se va enojado', false, () => S.abandons === 0, () => S.abandons + ' se fueron');
    else if (T === 2) this.goal('Satisfacción ≥ 85%', false, () => this.sat() >= 85, () => this.sat() + '%');
    else this.goal('Orden de la estación ≥ 85%', false, () => this.orden() >= 85, () => this.orden() + '%');
  }
  sat() { const S = this.sub, n = S.happy + S.abandons + S.errors; return n ? Math.round(100 * S.happy / n) : 100; }
  orden() { return Math.round(100 * (1 - this.sub.tiltTime / Math.max(1, this.sub.t))); }
  info() { return { clock: fmtClock(this.sub.min), score: this.sub.score, chips: [{ t: 'Fila ' + this.sub.queue.length }] }; }
}

/* ======================= 3. MECÁNICO ======================= */
class ModeMecanico extends ModeSub {
  constructor(role, T, opt) {
    super(role, T, opt); this.sub = new MGMecanico(this, { turno: T, dur: 120 * this.timeMul }); this.view = this.sub.view; const S = this.sub;
    const tg = [0, 6, 8, 9][T];
    this.goal('Repara ' + tg + ' bicis', true, () => S.fixed >= tg, () => S.fixed + '/' + tg);
    this.goal('Máximo 3 herramientas equivocadas', false, () => S.errors <= 3, () => S.errors + ' errores');
    if (T === 1) this.goal('2 bicis perfectas (sin errores)', false, () => S.perfect >= 2, () => S.perfect + '/2');
    else if (T === 2) this.goal('Racha de 4 bicis seguidas', false, () => S.best >= 4, () => 'racha ' + S.best);
    else this.goal('Tiempo promedio ≤ 9 s por bici', false, () => S.times.length > 0 && S.times.reduce((a, b) => a + b, 0) / S.times.length <= 9, () => S.times.length ? (S.times.reduce((a, b) => a + b, 0) / S.times.length).toFixed(1) + ' s' : '-');
  }
  info() { return { clock: fmtClock(this.sub.min), score: this.sub.score, chips: [{ t: 'Listas ' + this.sub.fixed }] }; }
}

/* ======================= 4. BODEGA ======================= */
class ModeBodega extends ModeSub {
  constructor(role, T, opt) {
    super(role, T, opt);
    if (T === 3) { // turno 3: bandas con desvíos (estilo Package Inc)
      const S = this.sub = new MGRutas(this, { dur: 120 * this.timeMul }); this.view = S.view; S.min = 420;
      this.goal('Entrega 28 piezas en su bahía', true, () => S.ok >= 28, () => S.ok + '/28');
      this.goal('Precisión ≥ 85%', false, () => S.acc() * 100 >= 85, () => Math.round(S.acc() * 100) + '%');
      this.goal('Combo de 8 seguidas', false, () => S.best >= 8, () => 'combo ' + S.best);
      return;
    }
    this.sub = new MGBodega(this, { turno: T, dur: 120 * this.timeMul }); this.view = this.sub.view; const S = this.sub; S.min = 420;
    const tg = [0, 25, 35, 45][T], acc = [0, 85, 88, 90][T], tr = [0, 1, 2, 1][T];
    this.goal('Clasifica ' + tg + ' piezas', true, () => S.ok >= tg, () => S.ok + '/' + tg);
    this.goal('Precisión ≥ ' + acc + '%', false, () => S.acc() * 100 >= acc, () => Math.round(S.acc() * 100) + '%');
    this.goal('Llena ' + tr + ' camión' + (tr > 1 ? 'es' : ''), false, () => S.trucks >= tr, () => S.trucks + '/' + tr);
  }
  update(dt) { this.sub.min += dt * 3; super.update(dt); }
  info() { return { clock: fmtClock(this.sub.min), score: this.sub.score, chips: [{ t: this.turno === 3 ? 'Combo ' + this.sub.combo : 'Combo x' + Math.min(5, 1 + Math.floor(this.sub.combo / 4)) }] }; }
}

/* ======================= 5. APOYO ======================= */
class ModeApoyo extends MapMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng; this.zone = [null, 'centro', 'sur', 'norte'][T]; this.rate = 2.4; this.clock = 420; this.endClock = 900;
    const zs = this.subZone(this.stationZone(this.zone), 60), autos = R.shuffle(zs.filter(s => s.type === 'a')), mans = R.shuffle(zs.filter(s => s.type === 'm'));
    if (!mans.length) mans.push(R.pick(zs)); if (!autos.length) autos.push(R.pick(zs));
    const plan = [['apertura', autos[0]], ['relevo', mans[0]], ['inspeccion', R.pick(zs)]];
    if (T >= 2) plan.push(['apertura', autos[1] || autos[0]]), plan.push(['cierre', autos[2] || autos[0]]);
    if (T >= 3) plan.push(['relevo', mans[1] || mans[0]]);
    this.tasks = plan.filter(p => p[1]).map(([type, st], i) => ({ type, st, i, done: false, late: false }));
    const span = this.endClock - this.clock; this.tasks.forEach((t, i) => { t.due = Math.round(this.clock + span * (i + 1.4) / (this.tasks.length + .6)); if (t.type === 'apertura') t.due = Math.min(t.due, this.clock + 120 + i * 30); if (t.type === 'cierre') t.due = this.endClock; });
    this.tasks.sort((a, b) => a.due - b.due); this.tasks.forEach((t, i) => t.n = i + 1);
    const home = zs[0]; this.setupRide({ start: { x: home.x, y: home.y } });
    this.tasks.forEach(t => { t.m = this.ride.marker({ x: t.st.x, y: t.st.y, r: 18, col: t.type === 'relevo' ? PAL.cie : t.type === 'inspeccion' ? PAL.vd : PAL.amb, label: t.st.name, num: t.n, enter: () => this.startTask(t) }); });
    this.relErr = 0; this.retarget();
    this.goal('Completa todas las tareas', true, () => this.tasks.every(t => t.done), () => this.tasks.filter(t => t.done).length + '/' + this.tasks.length);
    this.goal('Ninguna tarea tarde', false, () => this.tasks.every(t => t.done && !t.late), () => this.tasks.filter(t => t.late).length + ' tarde');
    this.goal('Relevos sin errores', false, () => this.relErr === 0, () => this.relErr + ' errores');
    this.coach = 'Zona ' + this.zone.toUpperCase() + ': ve a la tarea 1. Puedes cambiar el orden si te conviene.';
  }
  retarget() { const P = this.ride.p, open = this.tasks.filter(t => !t.done); open.sort((a, b) => a.due - b.due); this.ride.target = open.length ? open[0].m : null; }
  startTask(t) {
    if (t.done || this.sub) return; const c0 = this.clock;
    const mg = t.type === 'apertura' ? new MGApertura(this, { clock0: c0 }) : t.type === 'cierre' ? new MGApertura(this, { cierre: true, clock0: c0 }) : t.type === 'relevo' ? new MGAnfitrion(this, { turno: 2, short: true, dur: 32 * this.timeMul, cap: 6, clock0: c0, rate: 1.6 }) : new MGInspeccion(this, { bad: 2, clock0: c0 });
    this.runSub(mg, s => {
      t.done = true; t.late = this.clock > t.due; const pts = Math.round((25 + s.score) * (this.has('radio') ? 1.2 : 1) * (t.late ? .5 : 1)); this.score += pts;
      if (t.type === 'relevo') this.relErr += s.errors + (s.abandons || 0); this.errors += s.errors;
      this.ride.removeMarker(t.m); this.ride.float(t.late ? 'Tarde +' + pts : '+' + pts, t.late ? PAL.amb : PAL.vd1); Snd.sfx('win');
      this.retarget(); if (this.tasks.every(x => x.done)) this.endT = 1;
    });
  }
  tick(dt) { if (this.endT != null) { this.endT -= dt; if (this.endT <= 0) this.end(); } else if (this.clock >= this.endClock + 30) this.end(); const o = this.tasks.find(t => !t.done); this.coach = o ? 'Siguiente: ' + o.n + '. ' + { apertura: 'Abrir', cierre: 'Cerrar', relevo: 'Relevo en', inspeccion: 'Verificar' }[o.type] + ' ' + o.st.name + ' antes de las ' + fmtClock(o.due) : '¡Todo listo!'; }
  get coachB() { return 30 + this.tasks.length * 22; }   // la ayuda va encima de la lista de tareas
  hud2(V) {
    const x = 10; let y = V.h - 24 - this.tasks.length * 22;
    for (const t of this.tasks) { V.text((t.done ? '✓ ' : t.n + '. ') + { apertura: 'Abrir', cierre: 'Cerrar', relevo: 'Relevo', inspeccion: 'Verificar' }[t.type] + ' · ' + t.st.name + ' · ' + fmtClock(t.due), x, y, { size: 13, color: t.done ? PAL.vd1 : this.clock > t.due ? PAL.cor : '#fff', bg: '#0a2342cc', pad: 3, body: true }); y += 22; }
  }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: 'Zona ' + this.zone }] }; }
  bot(err) { if (this.sub) return this.sub.bot(err); this.retarget(); this.botDrive(); }
}

/* ======================= 6. TÉCNICO ======================= */
class ModeTecnico extends MapMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng; this.zone = [null, 'centro', 'norte', 'sur'][T]; this.rate = 2; this.clock = 420; this.endClock = 780;
    this.sim = new StationSim(R, { demand: this.mods.demand }); this.zs = this.subZone(this.sim.st.filter(s => s.zone === this.zone), 55).slice(0, 12);
    const home = this.zs[0]; this.setupRide({ sim: this.sim, start: { x: home.x, y: home.y } });
    this.breakEvery = [0, 22, 17, 13][T] * this.timeMul; this.breakT = 3; this.fixed = 0; this.opSum = 0; this.opT = 0; this.mgErr = 0; this.brk = new Map();
    this.breakOne();
    const tg = [0, 4, 6, 8][T], op = [0, 90, 92, 94][T];
    this.goal('Repara ' + tg + ' estaciones', true, () => this.fixed >= tg, () => this.fixed + '/' + tg);
    this.goal('Operatividad ≥ ' + op + '%', false, () => this.oper() >= op, () => this.oper() + '%');
    this.goal('Máximo ' + (T === 3 ? 3 : 2) + ' errores en reparaciones', false, () => this.mgErr <= (T === 3 ? 3 : 2), () => this.mgErr + ' errores');
    this.coach = 'Zona ' + this.zone.toUpperCase() + ': las estaciones con aro ROJO están dañadas.';
  }
  oper() { return this.opT ? Math.round(100 * this.opSum / this.opT) : 100; }
  breakOne() {
    const ok = this.zs.filter(s => !s.broken); if (!ok.length) return; const s = this.rng.pick(ok); s.broken = true;
    const kind = s.type === 'a' && this.rng.f() < .5 ? 'totem' : 'anclaje';
    const m = this.ride.marker({ x: s.x, y: s.y, r: 18, col: PAL.cor, label: s.name, enter: () => this.repair(s, kind, m) }); this.brk.set(s, m); this.retarget();
    if (JE.ui && this.t > 1) JE.ui.toast('📻 Se dañó ' + s.name + (kind === 'totem' ? ' (tótem)' : ' (anclajes)'));
  }
  retarget() { const P = this.ride.p; let best = null, bd = 1e9; for (const m of this.brk.values()) { const d = dist(m.x, m.y, P.x, P.y); if (d < bd) { bd = d; best = m; } } this.ride.target = best; }
  repair(s, kind, m) {
    if (this.sub || !s.broken) return; const T = this.turno, R = this.rng;
    // variedad de reparaciones según el turno: cables, memoria del tótem, circuito (piezas) y señal láser (espejos)
    let mgN;
    if (kind === 'totem') mgN = T === 3 && R.f() < .5 ? new MGLaser(this, { n: 5, turns: 3 }) : T >= 2 && R.f() < .35 ? new MGLaser(this, { n: 4, turns: 2 }) : new MGSimon(this, { len: 2 + T });
    else mgN = T >= 2 && R.f() < .5 ? new MGLoop(this, { n: T === 3 ? 5 : 4 }) : new MGCables(this, { n: 2 + T });
    this.runSub(mgN, mg => {
      s.broken = false; this.fixed++; this.mgErr += mg.errors; this.errors += mg.errors; const pts = Math.round((30 + mg.score) * (this.has('radio') ? 1.2 : 1)); this.score += pts;
      this.ride.removeMarker(m); this.brk.delete(s); this.ride.float('+' + pts + ' ¡Reparada!', PAL.vd1); Snd.sfx('win'); this.retarget();
    });
  }
  tick(dt) {
    this.sim.step(this.rate * dt / this.timeMul, this.clock);
    const up = this.zs.filter(s => !s.broken).length / this.zs.length; this.opSum += up * dt; this.opT += dt;
    this.breakT -= dt; if (this.breakT <= 0) { this.breakT = this.breakEvery * this.rng.range(.7, 1.3); this.breakOne(); }
    if (this.clock >= this.endClock) this.end();
  }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: 'Operatividad ' + this.oper() + '%', c: this.oper() < 90 ? 'warn' : '' }] }; }
  bot(err) { if (this.sub) return this.sub.bot(err); this.retarget(); this.botDrive(); }
}

/* ======================= 7. BALANCE ======================= */
class ModeBalance extends MapMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng; this.rate = 2; this.clock = 360; this.endClock = 720;
    this.sim = new StationSim(R, { demand: this.mods.demand * 1.1, depot: 200 }); const dp = JE.map.depot;
    this.setupRide({ sim: this.sim, start: { x: dp.x, y: dp.y + 6 }, veh: 'truck', load: 12, cap: 20 });
    this.sim.depot -= 12; this.sim.trucks.push(this.ride.p);
    this.orders = []; this.doneN = 0; this.expired = 0; this.ordT = 0; this.maxOrd = T === 3 ? 3 : 2; this.ordN = 0;
    this.depM = this.ride.marker({ x: dp.x, y: dp.y, r: 20, col: PAL.cie, label: 'Bodega', enter: () => this.atDepot() });
    this.newOrder(); this.newOrder();
    const tg = [0, 4, 5, 6][T];
    this.goal('Cumple ' + tg + ' órdenes de Monitoreo', true, () => this.doneN >= tg, () => this.doneN + '/' + tg);
    this.goal(T === 1 ? 'Ninguna orden vencida' : 'Máximo 1 orden vencida', false, () => this.expired <= (T === 1 ? 0 : 1), () => this.expired + ' vencidas');
    this.goal('Máximo ' + (T === 3 ? 1 : 2) + ' choques', false, () => this.ride.stats.crashes <= (T === 3 ? 1 : 2), () => this.ride.stats.crashes + ' choques');
    this.coach = 'Sigue la ruta hasta la orden 1. El camión solo va por calles y autopistas.';
  }
  newOrder() {
    const used = new Set(this.orders.map(o => o.s)); const st = this.sim.st.filter(s => !used.has(s) && s.open);
    st.sort((a, b) => a.bikes / a.cap - b.bikes / b.cap);
    const P = this.ride.p, far = s => { const d = dist(s.x, s.y, P.x, P.y); return d > 120 && d < 900 * SC; };
    const low = st.filter(far).slice(0, 4), high = st.filter(far).slice(-4);
    const takeLow = this.rng.f() < .55; const s = this.rng.pick(takeLow ? low : high) || st[0]; if (!s) return;
    const type = s.bikes / s.cap < .5 ? 'llevar' : 'recoger', n = Math.max(3, Math.round(Math.abs(s.bikes - s.cap * .55)));
    const o = { s, type, n, due: this.clock + [0, 130, 110, 90][this.turno] * SC * (this.timeMul > 1 ? 1.2 : 1), id: ++this.ordN };
    o.m = this.ride.marker({ x: s.x, y: s.y, r: 20, col: type === 'llevar' ? PAL.vd : PAL.amb, label: s.name, num: o.id, enter: () => this.atStation(o) });
    this.orders.push(o); this.retarget(); if (JE.ui && this.t > 1) JE.ui.toast('📻 Orden ' + o.id + ': ' + (type === 'llevar' ? 'LLEVA ' : 'RECOGE ') + n + ' bicis · ' + s.name);
  }
  retarget() { const P = this.ride.p; if (!this.orders.length) { this.ride.target = this.depM; return; } const o = this.orders.slice().sort((a, b) => (a.type === 'llevar' && P.load < 3 ? 1 : 0) - (b.type === 'llevar' && P.load < 3 ? 1 : 0) || dist(a.s.x, a.s.y, P.x, P.y) - dist(b.s.x, b.s.y, P.x, P.y))[0]; this.ride.target = (o.type === 'llevar' && P.load === 0) || (o.type === 'recoger' && P.load >= P.cap) ? this.depM : o.m; }
  atStation(o) {
    if (!this.orders.includes(o)) return; const P = this.ride.p, s = o.s;
    let moved = 0;
    if (o.type === 'llevar') { moved = Math.min(o.n, P.load, s.cap - s.bikes); P.load -= moved; s.bikes += moved; }
    else { moved = Math.min(o.n, s.bikes, P.cap - P.load); P.load += moved; s.bikes -= moved; }
    if (!moved) { JE.ui && JE.ui.toast(o.type === 'llevar' ? 'Camión vacío: ve a la BODEGA a cargar' : 'Camión lleno: descarga en la BODEGA'); return; }
    o.n -= moved; Snd.sfx('truck'); this.ride.burst(s.x, s.y, PAL.vd1, 12);
    if (o.n <= 0) { this.finishOrder(o, true); } else { this.ride.float('Faltan ' + o.n, PAL.amb); this.retarget(); }
  }
  finishOrder(o, ok) {
    this.ride.removeMarker(o.m); this.orders.splice(this.orders.indexOf(o), 1);
    if (ok) { this.doneN++; const late = this.clock > o.due, pts = Math.round((late ? 20 : 40) * (this.has('radio') ? 1.2 : 1)); this.score += pts; this.ride.float('+' + pts + ' ¡Orden cumplida!', PAL.vd1); Snd.sfx('win'); }
    else { this.expired++; this.score -= 10; JE.ui && JE.ui.toast('Orden ' + o.id + ' vencida'); Snd.sfx('lose'); }
    this.retarget();
  }
  atDepot() {
    const P = this.ride.p, want = 12, d = want - P.load;
    if (d > 0) { const k = Math.min(d, this.sim.depot); P.load += k; this.sim.depot -= k; } else if (d < 0) { P.load += d; this.sim.depot -= d; }
    Snd.sfx('truck'); this.ride.float('Carga: ' + P.load + ' bicis', PAL.cie); this.retarget();
  }
  tick(dt) {
    this.sim.step(this.rate * dt / this.timeMul, this.clock);
    for (const o of this.orders.slice()) if (this.clock > o.due + 60) this.finishOrder(o, false);
    this.ordT -= dt; if ((this.orders.length < this.maxOrd && this.ordT <= 0) || !this.orders.length) { this.ordT = 8; this.newOrder(); }
    if (this.clock >= this.endClock) this.end();
  }
  get coachB() { return 30 + this.orders.length * 22; }
  hud2(V) { let y = V.h - 24 - this.orders.length * 22; for (const o of this.orders) { V.text(o.id + '. ' + (o.type === 'llevar' ? 'LLEVAR ' : 'RECOGER ') + o.n + ' · ' + o.s.name + ' · ' + fmtClock(o.due), 10, y, { size: 13, color: this.clock > o.due ? PAL.cor : o.type === 'llevar' ? PAL.vd1 : PAL.amb, bg: '#0a2342cc', pad: 3, body: true }); y += 22; } }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: '🚚 ' + this.ride.p.load + '/20' }] }; }
  bot(err) { this.retarget(); this.botDrive(); }
}

/* ======================= 8. MONITOREO ======================= */
class ModeMonitoreo extends Mode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng; this.clock = 330; this.endClock = 1320; this.rate = (this.endClock - this.clock) / (220 * this.timeMul);
    this.sim = new StationSim(R, { demand: this.mods.demand * (1 + .1 * (T - 1)), depot: 60, extra: this.mods.extra });
    // sala de monitoreo por zona (el sistema va de Caldas a Barbosa): T1 centro, T2 sur, T3 norte
    this.zone = [null, 'centro', 'sur', 'norte'][T]; const zl = this.sim.st.filter(s => s.zone === this.zone), cx = zl.reduce((a, s) => a + s.x, 0) / zl.length, cy = zl.reduce((a, s) => a + s.y, 0) / zl.length;
    this.zs = zl.slice().sort((a, b) => dist(a.x, a.y, cx, cy) - dist(b.x, b.y, cx, cy)).slice(0, 16);
    const bs = this.zs[0]; this.base = { x: bs.x + 14, y: bs.y + 10 };
    const xs = this.zs.map(s => s.x), ys = this.zs.map(s => s.y), m = 10 * TS; this.crop = { x0: Math.max(0, Math.min(...xs) - m), y0: Math.max(0, Math.min(...ys) - m), x1: Math.min(MW * TS, Math.max(...xs) + m), y1: Math.min(MH * TS, Math.max(...ys) + m) };
    const dp = this.base; this.trucks = []; for (let i = 0; i < (T === 1 ? 2 : 3); i++) { const t = { x: dp.x + i * 6, y: dp.y, a: -Math.PI / 2, load: 0, cap: 20, q: [], path: null, id: i + 1 }; this.trucks.push(t); this.sim.trucks.push(t); }
    this.sel = null; this.radio = []; this.flags = new Map(); this.view = { kind: 'map' };
    const sv = [0, 70, 80, 85][T];
    this.goal('Nivel de servicio ≥ ' + sv + '%', true, () => this.serv() * 100 >= sv, () => Math.round(this.serv() * 100) + '%');
    this.goal('Al cierre, ninguna estación vacía', false, () => this.zs.every(s => s.bikes > 0), () => this.zs.filter(s => s.bikes <= 0).length + ' vacías');
    this.goal('Camiones descargados en la bodega', false, () => this.trucks.every(t => t.load === 0 && !t.path && dist(t.x, t.y, dp.x, dp.y) < 30), () => this.trucks.filter(t => t.load === 0 && !t.path).length + '/' + this.trucks.length);
    this.coach = 'Toca una estación: si está vacía (rojo) LLEVA bicis; si está llena (azul) RECÓGELAS.';
  }
  serv() { const T = Math.max(1, this.sim.elapsed) * this.zs.length; let bad = 0; for (const s of this.zs) bad += s.emptyT + s.fullT; return clamp(1 - bad / T, 0, 1); }
  addJob(t, job) { t.q.push(job); }
  best(s) { let b = null, bc = 1e9; for (const t of this.trucks) { const c = t.q.length * 900 + dist(t.x, t.y, s.x, s.y); if (c < bc) { bc = c; b = t; } } return b; }
  order(s, type) {
    const n = Math.max(2, Math.round(Math.abs(s.bikes - s.cap * .5))), t = this.best(s);
    this.addJob(t, { type, s, n }); this.flags.set(s, type); this.ordered = (this.ordered || 0) + 1; Snd.sfx('truck'); this.say('🚚 Camión ' + t.id + ' → ' + (type === 'llevar' ? 'lleva ' : 'recoge ') + n + ' · ' + s.name);
    this.sel = null;
  }
  home() { for (const t of this.trucks) this.addJob(t, { type: 'home' }); this.say('🏠 Todos los camiones regresan a la bodega'); Snd.sfx('tap'); }
  say(m) { this.radio.unshift({ m, t: this.clock }); if (this.radio.length > 3) this.radio.length = 3; }
  go(t, x, y) { t.path = [{ x, y: t.y }, { x, y }]; }
  update(dt) {
    this.t += dt; const dm = this.rate * dt; this.clock += dm; this.sim.step(dm, this.clock);
    const dp = this.base, spd = 60 * dm * (this.has('camion') ? 1.15 : 1);
    for (const t of this.trucks) {
      if (t.path) {
        const p = t.path[0], d = dist(t.x, t.y, p.x, p.y);
        if (d <= spd) { t.x = p.x; t.y = p.y; t.path.shift(); if (!t.path.length) { t.path = null; this.arrive(t); } }
        else { t.a = Math.atan2(p.y - t.y, p.x - t.x); t.x += Math.cos(t.a) * spd; t.y += Math.sin(t.a) * spd; }
      } else if (t.wait > 0) t.wait -= dm;
      else if (t.q.length) {
        const j = t.q[0];
        if (j.type === 'home') this.go(t, dp.x, dp.y), j.stage = 'home';
        else if (j.type === 'llevar' && t.load < Math.min(j.n, 6) && !j.loaded) { j.stage = 'depot'; this.go(t, dp.x, dp.y); }
        else { j.stage = 'st'; this.go(t, j.s.x, j.s.y); }
      }
    }
    // radio: avisos de estaciones críticas
    for (const s of this.zs) { const st = s.bikes <= 0 ? 'vacía' : s.bikes >= s.cap ? 'llena' : ''; if (st && s._r !== st) this.say('📻 ' + s.name + ' está ' + st); s._r = st; }
    if (this.clock > 1260 && !this.warn) { this.warn = 1; this.say('⏰ ¡Se acerca el cierre! Regresa los camiones vacíos.'); JE.ui && JE.ui.toast('¡Se acerca el cierre! Usa "Regresar camiones".'); }
    if (this.clock >= this.endClock) this.end();
  }
  arrive(t) {
    const j = t.q[0]; if (!j) return;
    if (j.stage === 'home') { this.sim.depot += t.load; t.load = 0; t.q.shift(); return; }
    if (j.stage === 'depot') { const k = Math.min(t.cap - t.load, Math.max(j.n - t.load, 0) + 2, this.sim.depot); t.load += k; this.sim.depot -= k; j.loaded = true; t.wait = 8; return; }
    const s = j.s; let moved = 0;
    if (j.type === 'llevar') { moved = Math.min(j.n, t.load, s.cap - s.bikes); t.load -= moved; s.bikes += moved; }
    else { moved = Math.min(j.n, s.bikes, t.cap - t.load); t.load += moved; s.bikes -= moved; }
    this.score += 10 + moved * 2; t.wait = 10; t.q.shift(); this.flags.delete(s);
  }
  render(V) { V.b.fillStyle = PAL.az; V.b.fillRect(0, 0, V.vw, V.vh); }
  hud(V) {
    this.btns = []; const o = { sim: this.sim, stations: this.zs, base: this.base, crop: this.crop, trucks: this.trucks, sel: this.sel, top: 58, bot: this.sel ? 150 : 90, noBg: true };
    const r = drawOverview(V, o); this.rect = r; const c = V.ctx;
    for (const [s, ty] of this.flags) { c.fillStyle = ty === 'llevar' ? PAL.vd : PAL.amb; c.fillRect(r.x + s.x * r.k + 7, r.y + s.y * r.k - 12, 6, 6); }
    // radio
    let y = 74; for (const m of this.radio) { V.text(m.m, 10, y, { size: 12, color: '#fff', bg: '#0a2342dd', pad: 3, body: true }); y += 20; }
    const bw = Math.min(200, V.w * .45);
    if (this.sel) {
      const s = this.sel, w = Math.min(420, V.w - 16), x = (V.w - w) / 2, yy = V.h - 140;
      c.fillStyle = PAL.crema; c.fillRect(x, yy, w, 130); c.strokeStyle = PAL.az; c.lineWidth = 3; c.strokeRect(x + 1.5, yy + 1.5, w - 3, 127);
      V.text(s.name + ' · ' + s.muni, x + 12, yy + 24, { size: 17, color: PAL.az });
      V.text(s.bikes + ' de ' + s.cap + ' bicis' + (s.broken ? ' · DAÑADA' : ''), x + 12, yy + 46, { size: 15, color: s.bikes <= 0 ? '#c0392b' : PAL.az2, body: true });
      const half = (w - 36) / 2;
      this.button(V, x + 12, yy + 62, half, 54, 'LLEVAR +' + Math.max(2, Math.round(s.cap * .5 - s.bikes)), () => this.order(s, 'llevar'), { bg: PAL.vd2, size: 18, key: 'lle' });
      this.button(V, x + 24 + half, yy + 62, half, 54, 'RECOGER −' + Math.max(2, Math.round(s.bikes - s.cap * .5)), () => this.order(s, 'recoger'), { bg: '#b0651a', size: 18, key: 'rec' });
    } else {
      this.button(V, 10, V.h - 74, bw, 58, '🏠 Regresar camiones', () => this.home(), { size: 16 });
      V.text('Zona ' + this.zone + ' · Base: ' + this.sim.depot + ' bicis · ' + this.trucks.map(t => '🚚' + t.id + ':' + t.load).join('  '), V.w - 10, V.h - 40, { size: 13, align: 'right', color: '#c4ec7c', body: true });
    }
  }
  pointer(type, vx, vy, cx, cy) {
    if (type !== 'down') return false; if (super.pointer(type, vx, vy, cx, cy)) return true;
    const r = this.rect; if (!r) return false; let best = null, bd = 30;
    for (const s of this.zs) { const d = dist(cx, cy, r.x + s.x * r.k, r.y + s.y * r.k); if (d < bd) { bd = d; best = s; } }
    this.sel = best === this.sel ? null : best; if (best) Snd.sfx('tap'); return true;
  }
  hint() {
    if (this.ordered >= 2 || !this.rect) return null; const R = this.rects || {};
    if (this.sel) return R[this.sel.bikes / this.sel.cap < .5 ? 'lle' : 'rec'] || null;
    const s = this.zs.slice().sort((a, b) => Math.abs(b.bikes / b.cap - .5) - Math.abs(a.bikes / a.cap - .5))[0], r = this.rect;
    return { x: r.x + s.x * r.k, y: r.y + s.y * r.k, txt: s.name };
  }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: 'Servicio ' + Math.round(this.serv() * 100) + '%' }] }; }
  bot() {
    if (this.t < (this.botNext || 0)) return; this.botNext = this.t + .9;
    if (this.clock > 1240) { if (!this.sentHome) { this.sentHome = 1; this.home(); } return; }
    const busy = new Set(this.flags.keys());
    const cand = this.zs.filter(s => !busy.has(s)).map(s => ({ s, r: s.bikes / s.cap })).sort((a, b) => Math.abs(b.r - .5) - Math.abs(a.r - .5))[0];
    if (cand && Math.abs(cand.r - .5) > .3 && this.trucks.some(t => t.q.length < 2)) this.order(cand.s, cand.r < .5 ? 'llevar' : 'recoger');
  }
}

/* ======================= 9. SUPERVISOR ======================= */
const STAFF_NAMES = ['Ana', 'Beto', 'Caro', 'Dani', 'Eli', 'Fer', 'Gabo', 'Hilda', 'Iván', 'Juli'];
class ModeSupervisor extends MapMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng; this.clock = 300; this.endClock = 1350; this.rate = (this.endClock - this.clock) / (240);
    this.sim = new StationSim(R, { demand: this.mods.demand }); const dp = JE.map.depot;
    this.setupRide({ sim: this.sim, start: { x: dp.x, y: dp.y + 6 } }); this.sim.trucks.push(this.ride.p);
    this.depM = this.ride.marker({ x: dp.x, y: dp.y, r: 20, col: PAL.cie, label: 'Bodega', enter: () => this.atDepot(), leave: () => { this.inDepot = false; } });
    // personal por asignar
    this.area = this.sim.st.filter(s => dist(s.x, s.y, dp.x, dp.y) < 100 * TS * SC); const mans = R.shuffle(this.area.filter(s => s.type === 'm')).slice(0, 3 + T);
    this.staffSt = mans; this.staff = mans.map((s, i) => ({ name: STAFF_NAMES[i], zone: R.f() < .75 ? s.zone : R.pick(['norte', 'centro', 'sur']) }));
    R.shuffle(this.staff); this.assign = new Array(mans.length).fill(-1); this.phase = 'staff'; this.selStaff = -1;
    this.inc = []; this.incT = 6; this.solved = 0; this.expiredN = 0; this.incN = 0; this.cierre = false;
    const tg = [0, 4, 6, 7][T];
    this.goal('Resuelve ' + tg + ' avisos del día', true, () => this.solved >= tg, () => this.solved + '/' + tg);
    this.goal('Apertura perfecta: cada anfitrión en su zona', false, () => this.perfectOpen === true, () => this.perfectOpen ? 'sí' : '-');
    this.goal('Cierre del sistema a tiempo', false, () => this.cierre === true, () => this.cierre ? 'sí' : 'pendiente');
    this.view = { kind: 'map' };
  }
  confirmStaff() {
    if (this.assign.some(a => a < 0)) { this.autoFill(); }
    let ok = 0; this.assign.forEach((a, i) => { const s = this.staffSt[i]; if (this.staff[a].zone === s.zone) ok++; else { s.open = false; s.lateOpen = true; } });
    this.perfectOpen = ok === this.staffSt.length; this.score += ok * 10; this.phase = 'day'; Snd.sfx(this.perfectOpen ? 'win' : 'ok');
    JE.ui && JE.ui.toast(this.perfectOpen ? '¡Apertura perfecta! Todo el personal en su zona.' : ok + '/' + this.staffSt.length + ' bien ubicados: algunas estaciones abren tarde.');
  }
  autoFill() { const used = new Set(this.assign.filter(a => a >= 0)); this.assign = this.assign.map(a => { if (a >= 0) return a; for (let k = 0; k < this.staff.length; k++) if (!used.has(k)) { used.add(k); return k; } return 0; }); }
  tapStaff(k) { this.selStaff = k; Snd.sfx('tap'); }
  tapSlot(i) { if (this.selStaff < 0) return; const prev = this.assign.indexOf(this.selStaff); if (prev >= 0) this.assign[prev] = -1; this.assign[i] = this.selStaff; this.selStaff = -1; Snd.sfx('coin'); }
  newInc() {
    const R = this.rng, types = ['relevo', 'bici', 'anclaje', 'balance', 'bodega', 'transito']; let type = R.pick(types);
    if (this.inc.some(i => i.type === 'bodega') && type === 'bodega') type = 'bici';
    let s = type === 'bodega' ? null : R.pick(type === 'relevo' ? this.area.filter(x => x.type === 'm') : this.area);
    if (type === 'transito') { const L = R.pick(JE.map.lights), dp0 = JE.map.depot; s = null; const id0 = ++this.incN, it0 = { id: id0, type, s: null, due: this.clock + 150 * SC, txt: 'Semáforo dañado', px: (L.x0 + L.x1) / 2, py: (L.y0 + L.y1) / 2 }; void dp0;
      it0.m = this.ride.marker({ x: it0.px, y: it0.py, r: 20, col: '#ff8a3d', label: 'Semáforo', num: id0, enter: () => this.solve(it0) }); this.inc.push(it0); this.retarget(); JE.ui && JE.ui.toast('📻 Aviso ' + id0 + ': semáforo dañado en un cruce: ¡dirige el tránsito!'); return; }
    if (type === 'balance') { const ex = this.area.slice().sort((a, b) => Math.abs(b.bikes / b.cap - .5) - Math.abs(a.bikes / a.cap - .5))[0]; s = ex; }
    const dp = JE.map.depot, x = s ? s.x : dp.x, y = s ? s.y : dp.y, id = ++this.incN;
    const it = { id, type, s, due: this.clock + 150 * SC, txt: { relevo: 'Relevo de almuerzo', bici: 'Bici dañada', anclaje: 'Anclajes sin señal', balance: s && s.bikes / s.cap < .5 ? 'Estación casi vacía' : 'Estación casi llena', bodega: 'Llegó un lote a bodega' }[type] };
    if (type === 'anclaje' && s) s.broken = true;
    it.m = this.ride.marker({ x, y, r: 18, col: type === 'balance' ? PAL.amb : type === 'bodega' ? PAL.cie : PAL.cor, label: s ? s.name : 'Bodega', num: id, enter: () => this.solve(it) });
    this.inc.push(it); this.retarget(); JE.ui && JE.ui.toast('📻 Aviso ' + id + ': ' + it.txt + (s ? ' · ' + s.name : ''));
  }
  retarget() { const P = this.ride.p; const o = this.inc.slice().sort((a, b) => dist(a.m.x, a.m.y, P.x, P.y) - dist(b.m.x, b.m.y, P.x, P.y))[0]; this.ride.target = this.cierreM || (o ? o.m : null); }
  solve(it) {
    if (this.sub || !this.inc.includes(it)) return;
    const done = (mg) => { this.closeInc(it, true, mg); };
    const c0 = this.clock;
    switch (it.type) {
      case 'relevo': this.runSub(new MGAnfitrion(this, { turno: 2, short: true, dur: 28 * this.timeMul, cap: 6, clock0: c0, rate: 1.6 }), done); break;
      case 'bici': this.runSub(new MGMecanico(this, { turno: 1, short: true, target: 2, maxBikes: 3, dur: 40, faults: [1, 2], timePer: 18 }), done); break;
      case 'anclaje': this.runSub(new MGCables(this, { n: 3 + (this.turno > 2 ? 1 : 0) }), mg => { if (it.s) it.s.broken = false; done(mg); }); break;
      case 'bodega': this.runSub(this.rng.f() < .5 ? new MGBodega(this, { turno: 1, dur: 22 }) : new MGRutas(this, { dur: 25 }), done); break;
      case 'transito': this.runSub(new MGTraffix(this, { dur: 28, target: 8 + this.turno * 2 }), done); break;
      case 'balance':
        if (this.ride.p.veh === 'truck') { const s = it.s, P = this.ride.p, need = Math.round(s.cap * .5 - s.bikes); if (need > 0) { const k = Math.min(need, P.load); P.load -= k; s.bikes += k; } else { const k = Math.min(-need, P.cap - P.load); P.load += k; s.bikes -= k; } done({ score: 10, errors: 0 }); }
        else JE.ui && JE.ui.toast('Toca 🚚 en la lista de avisos para enviar un camión, o ven en camión.');
        break;
    }
  }
  dispatch(it) { if (it.type !== 'balance' || it.sent) return; it.sent = this.clock + 60; Snd.sfx('truck'); JE.ui && JE.ui.toast('🚚 Camión enviado a ' + it.s.name); }
  closeInc(it, ok, mg) {
    this.ride.removeMarker(it.m); this.inc.splice(this.inc.indexOf(it), 1);
    if (ok) { this.solved++; const pts = Math.round((30 + (mg ? mg.score : 0)) * (this.has('radio') ? 1.2 : 1)); this.score += pts; this.errors += mg ? mg.errors || 0 : 0; this.ride.float('+' + pts, PAL.vd1); Snd.sfx('win'); }
    else { this.expiredN++; this.score -= 10; if (it.s && it.type === 'anclaje') it.s.broken = false; Snd.sfx('lose'); }
    this.retarget();
  }
  atDepot() { this.inDepot = true; if (this.cierreM && !this.cierre && !this.sub) this.runSub(new MGApertura(this, { cierre: true, clock0: this.clock }), mg => { this.cierre = this.clock <= this.endClock; this.score += 40 + mg.score; this.ride.removeMarker(this.cierreM); this.cierreM = null; this.endT = 1; }); }
  tick(dt) {
    this.sim.step(this.rate * dt / this.timeMul, this.clock);
    if (this.phase === 'staff') { this.clock = 300; this.coach = ''; return; }
    for (const s of this.sim.st) if (s.lateOpen && this.clock > 420) { s.open = true; s.lateOpen = false; }
    if (this.endT != null) { this.endT -= dt; if (this.endT <= 0) this.end(); return; }
    if (this.clock < 1260) { this.incT -= dt; if (this.incT <= 0 && this.inc.length < 4) { this.incT = [0, 18, 15, 12][this.turno] * this.timeMul * this.rng.range(.7, 1.3); this.newInc(); } }
    for (const it of this.inc.slice()) { if (it.sent && this.clock >= it.sent) { const s = it.s, tg = Math.round(s.cap * .5); this.sim.depot -= tg - s.bikes; s.bikes = tg; this.closeInc(it, true, { score: 5, errors: 0 }); } else if (this.clock > it.due) this.closeInc(it, false); }
    if (this.clock >= 1260 && !this.cierreM && !this.cierre) { const dp = JE.map.depot; this.cierreM = this.ride.marker({ x: dp.x, y: dp.y + 2, r: 22, col: '#ff2fb3', label: 'Cierre', num: 0, enter: () => this.atDepot() }); this.retarget(); JE.ui && JE.ui.toast('🔒 ¡Hora del cierre! Ve a la BODEGA a cuadrar el sistema.'); }
    if (this.clock >= this.endClock + 20) this.end();
    this.coach = this.cierreM ? 'Ve a la bodega para el cierre del sistema.' : this.inc.length ? 'Toca un aviso de la lista para ir hacia él.' : 'Todo en calma… recorre la ciudad.';
  }
  hud2(V) {
    if (this.phase === 'staff') return this.staffPanel(V);
    let y = 112; const w = Math.min(250, V.w * .62), x = 10;
    for (const it of this.inc) {
      const late = it.due - this.clock < 30, act = () => { this.ride.target = it.m; Snd.sfx('tap'); };
      const c = V.ctx; c.fillStyle = '#0a2342e6'; c.fillRect(x, y, w, 34); c.strokeStyle = this.ride.target === it.m ? PAL.amb : late ? PAL.cor : '#ffffff55'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, 32);
      V.text(it.id + '. ' + it.txt, x + 8, y + 15, { size: 12, color: '#fff', body: true }); V.text((it.s ? it.s.name : it.type === 'transito' ? 'Cruce de avenidas' : 'Bodega') + ' · antes de ' + fmtClock(it.due), x + 8, y + 29, { size: 11, color: late ? PAL.cor : '#c4ec7c', body: true });
      this.btns.push({ x, y, w: w - (it.type === 'balance' ? 44 : 0), h: 34, fn: act });
      if (it.type === 'balance') this.button(V, x + w - 40, y + 2, 36, 30, it.sent ? '…' : '🚚', () => this.dispatch(it), { size: 15 });
      y += 40;
    }
  }
  get hideGoals() { return this.phase === 'staff'; }
  hint(V) {
    if (this.phase !== 'staff') return super.hint(V); const R = this.rects || {};
    const i = this.assign.findIndex(a => a < 0); if (i < 0) return null;
    if (this.selStaff < 0) { const z = this.staffSt[i].zone; let k = this.staff.findIndex((p, j) => p.zone === z && !this.assign.includes(j)); if (k < 0) k = this.staff.findIndex((p, j) => !this.assign.includes(j)); return R['st' + k] || null; }
    return R['sl' + i] || null;
  }
  staffPanel(V) {
    const c = V.ctx, w = Math.min(460, V.w - 16), x = (V.w - w) / 2, y = V.h < 500 ? 50 : 60, n = this.staffSt.length, sr = Math.ceil(this.staff.length / 5), rh = clamp(Math.floor((V.h - y - 10 - 56 - sr * 44 - 64) / n), 28, 40), h = 56 + sr * 44 + n * rh + 64;
    c.fillStyle = PAL.crema; c.fillRect(x, y, w, h); c.strokeStyle = PAL.az; c.lineWidth = 4; c.strokeRect(x + 2, y + 2, w - 4, h - 4);
    c.fillStyle = PAL.az; c.fillRect(x, y, w, 26); V.text('5:00 A.M. · APERTURA DEL SISTEMA', x + 10, y + 18, { size: 15, color: PAL.vd1 });
    V.text('1) Toca un anfitrión  2) Toca la estación de SU zona', x + 10, y + 46, { size: 13, color: PAL.az, body: true });
    const cw = (w - 20) / Math.min(5, this.staff.length);
    this.staff.forEach((s, k) => { const bx = x + 10 + (k % 5) * cw, by = y + 56 + Math.floor(k / 5) * 44, used = this.assign.includes(k); this.button(V, bx, by, cw - 6, 38, s.name + ' · ' + s.zone[0].toUpperCase(), () => this.tapStaff(k), { key: 'st' + k, size: 14, bg: this.selStaff === k ? PAL.amb : used ? '#56657c' : PAL.az1, color: this.selStaff === k ? PAL.az : '#fff', border: this.selStaff === k ? PAL.az : '#fff' }); });
    let yy = y + 56 + Math.ceil(this.staff.length / 5) * 44 + 6;
    this.staffSt.forEach((s, i) => { const a = this.assign[i]; this.button(V, x + 10, yy, w - 20, rh - 6, s.name + ' (' + s.zone + ') ← ' + (a >= 0 ? this.staff[a].name + ' (' + this.staff[a].zone + ')' : 'toca para asignar'), () => this.tapSlot(i), { key: 'sl' + i, size: 14, bg: a >= 0 ? (this.staff[a].zone === s.zone ? PAL.vd2 : '#b0651a') : PAL.az2 }); yy += rh; });
    this.button(V, x + w / 2 - 110, yy + 6, 220, 48, 'ABRIR EL SISTEMA ▶', () => this.confirmStaff(), { bg: PAL.vd2, size: 18 });
  }
  pointer(type, vx, vy, cx, cy) { if (this.phase === 'staff') { Mode.prototype.pointer.call(this, type, vx, vy, cx, cy); return true; } return super.pointer(type, vx, vy, cx, cy); }
  update(dt) { if (this.phase === 'staff') { this.t += dt; this.tick(dt); return; } super.update(dt); }
  actions() {
    const a = this.phase === 'staff' ? [] : super.actions();
    if (this.inDepot && !this.sub && this.phase === 'day') a.push({ id: 'veh', icon: this.ride.p.veh === 'bike' ? 'balance' : 'usuario', label: this.ride.p.veh === 'bike' ? 'Camión' : 'Bici', fn: () => { const P = this.ride.p; if (P.veh === 'bike') { this.ride.setVeh('truck'); P.load = Math.min(10, this.sim.depot); this.sim.depot -= P.load; } else { this.sim.depot += P.load; P.load = 0; this.ride.setVeh('bike'); } Snd.sfx('truck'); } });
    return a;
  }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: 'Avisos ' + this.inc.length }] }; }
  bot(err) {
    if (this.phase === 'staff') { this.staffSt.forEach((s, i) => { if (this.assign[i] >= 0) return; let k = this.staff.findIndex((p, j) => p.zone === s.zone && !this.assign.includes(j)); if (k < 0) k = this.staff.findIndex((p, j) => !this.assign.includes(j)); this.tapStaff(k); this.tapSlot(i); }); this.confirmStaff(); return; }
    if (this.sub) return this.sub.bot(err);
    for (const it of this.inc) if (it.type === 'balance' && !it.sent && this.ride.p.veh === 'bike') this.dispatch(it);
    const o = this.inc.filter(i => i.type !== 'balance' || this.ride.p.veh === 'truck'); const P = this.ride.p;
    this.ride.target = this.cierreM || (o.sort((a, b) => dist(a.m.x, a.m.y, P.x, P.y) - dist(b.m.x, b.m.y, P.x, P.y))[0] || {}).m || null;
    this.botDrive();
  }
}

const MODE_CLASS = { usuario: ModeUsuario, anfitrion: ModeAnfitrion, mecanico: ModeMecanico, bodega: ModeBodega, apoyo: ModeApoyo, tecnico: ModeTecnico, balance: ModeBalance, monitoreo: ModeMonitoreo, supervisor: ModeSupervisor };
