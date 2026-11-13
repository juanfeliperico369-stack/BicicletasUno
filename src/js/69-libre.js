/* =====================================================================
   MODO LIBRE CON VIDA PROPIA (v0.9)
   Tu perfil (edad, dónde vives, colegio, universidad, trabajo) arma misiones distintas cada día de la semana,
   con animaciones de clase, trabajo y colegio; domingos y festivos hay ciclovía con carreras y retos;
   energía, bancas y fotos para el álbum.
   Colores: el verde, azul oscuro y blanco de EnCicla son para sus trabajadores y sus bicis; en el modo libre te vistes como quieras.
   ===================================================================== */
const UNIS = [['udea', 'Universidad de Antioquia', 6.2675, -75.5689], ['unal', 'Universidad Nacional', 6.2618, -75.5770], ['eafit', 'EAFIT', 6.2003, -75.5786], ['upb', 'UPB', 6.2420, -75.5895],
  ['udem', 'Universidad de Medellín', 6.2318, -75.6100], ['itm', 'ITM', 6.2735, -75.5885], ['ces', 'Universidad CES', 6.2085, -75.5640], ['lasallista', 'Unilasallista (Caldas)', 6.0990, -75.6370]];
const TRABAJOS = [['centro', 'el Centro', 6.2490, -75.5680], ['poblado', 'El Poblado', 6.2100, -75.5700], ['ciudadrio', 'Ciudad del Río', 6.2220, -75.5750], ['laureles', 'Laureles', 6.2450, -75.5930], ['guayabal', 'Guayabal', 6.2100, -75.5880],
  ['itagui', 'Itagüí', 6.1720, -75.6110], ['envigado', 'Envigado', 6.1720, -75.5870], ['bello', 'Bello', 6.3370, -75.5580], ['sabaneta', 'Sabaneta', 6.1515, -75.6164], ['encicla', 'Casa EnCicla', 6.2314, -75.5995]];
const EDADES = ['Niño o niña', 'Joven', 'Adulto', 'Adulto mayor'];
const placeP = (lat, lon) => { const p = geoP(lat, lon), o = JE.map.nearestOpen(Math.floor(p.x / TS), Math.floor(p.y / TS), false); return { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2 }; };
function homeStation() {
  const P = Save.data.profile, muni = (VM.munis || [])[P.casaM | 0] || 'Medellín', L = JE.map.stations.filter(s => s.muni === muni && stOk(s));
  return L.length ? L[(h2(P.name.length, 3, 11) * L.length) | 0] : JE.map.stations.filter(stOk)[0];
}

/* ---------- persona con contextura y estatura; uniforme EnCicla para los trabajadores ---------- */
Art.person = function (c, x, y, p, ph = 0, face = -1) {
  c.save(); c.translate(Math.round(x), Math.round(y)); if (face > 0) c.scale(-1, 1);
  const kid = p.kid, tl = p.tall == null ? 1 : p.tall, bd = p.build == null ? 1 : p.build, H = kid ? .72 : 1;
  const legH = Math.round((5 + tl) * H), torso = Math.round((6 + (tl > 0 ? 1 : 0) + (tl > 1 ? 1 : 0)) * H), hy = -legH - torso - 5, st = Math.floor(ph * 4) % 2, hc = p.hair || '#2a1a10';
  const tw = 4 + bd, tx = bd === 2 ? -4 : -3;
  prect(c, -2 + (st ? -1 : 0), -legH, 2, legH, p.pants); prect(c, 0 + (st ? 1 : 0), -legH, 2 + (bd === 2 ? 1 : 0), legH, shade(p.pants, -.18));
  const sh = p.shoes || '#111'; prect(c, -2 + (st ? -1 : 0), -1, 2, 1, sh); prect(c, 0 + (st ? 1 : 0), -1, 2, 1, sh);
  if (p.bag) prect(c, tx + tw, -legH - torso + 1, 2, torso - 2, p.bag);
  prect(c, tx, -legH - torso, tw, torso, p.shirt); prect(c, tx - 1, -legH - torso + 2, 1, torso - 3, p.shirt); prect(c, tx - 1, -legH - 2, 1, 1, p.skin);
  if (!p.sleeve && !kid) prect(c, tx - 1, -legH - torso + 4, 1, 2, p.skin);
  if (p.vest || p.sleeve === 2) { prect(c, tx, -legH - torso, tw, torso, PAL.vd); prect(c, tx, -legH - torso + 3, tw, 1, '#e8f4d0'); prect(c, tx + (tw >> 1), -legH - torso, 1, torso, p.shirt); }
  if (bd === 2) prect(c, tx + tw - 1, -legH - torso + 3, 1, torso - 4, shade(p.vest ? PAL.vd : p.shirt, -.12));
  prect(c, -3, hy, 5, 5, p.skin); prect(c, -3, hy + 2, 1, 1, '#141414');
  switch (p.hairStyle | 0) {
    case 0: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 1, 3, hc); break;
    case 1: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 2, 6, hc); break;
    case 2: prect(c, -3, hy - 1, 6, 2, p.cap || PAL.az2); prect(c, -5, hy, 3, 1, p.cap || PAL.az2); break;
    case 3: prect(c, 0, hy - 1, 3, 1, hc); break;
    case 4: prect(c, -4, hy - 3, 8, 4, hc); prect(c, 1, hy, 3, 3, hc); break;
    case 5: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 2, hy, 2, 2, hc); prect(c, 3, hy + 1, 2, 4, hc); break;
    case 6: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 0, hy - 3, 3, 2, hc); break;
    case 7: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 2, 7, hc); prect(c, 1, hy + 7, 2, 1, '#ff6b5a'); break;
    case 8: prect(c, -3, hy - 2, 6, 2, hc); prect(c, -3, hy, 1, 1, hc); prect(c, 2, hy - 1, 2, 3, hc); break;
  }
  if (p.beard === 1) prect(c, -3, hy + 3, 2, 1, hc); else if (p.beard === 2) { prect(c, -3, hy + 3, 4, 2, hc); prect(c, -3, hy + 2, 1, 1, hc); }
  if (p.glasses === 2) prect(c, -3, hy + 2, 3, 1, '#0a0a0a'); else if (p.glasses) prect(c, -3, hy + 2, 2, 1, '#333');
  if (p.cane) pline(c, -6, 0, -5, -legH - 2, '#7a5230');
  c.restore();
};
const _me69 = Art.me;
Art.me = function (extra) {
  const P = Save.data.profile, base = _me69.call(this, extra), uni = extra && (extra.vest || extra.uniforme);
  base.build = P.build == null ? 1 : P.build; base.tall = P.tall == null ? 1 : P.tall; base.kid = (P.edad | 0) === 0 && P.edad != null;
  if (uni) Object.assign(base, { shirt: '#0e2d55', pants: '#1f2a3a', vest: true, cap: '#ffffff' });   // uniforme EnCicla
  return base;
};
/* trabajadores con uniforme en el mapa; en el modo libre (y como usuario) cada quien con su ropa */
const _setupL = MapMode.prototype.setupRide;
MapMode.prototype.setupRide = function (o) { _setupL.call(this, o); this.uniform = !['usuario', 'carrera'].includes(this.id); };
const _rider69 = Art.rider;
Art.rider = function (shirt) { const M = JE.game && JE.game.mode; return M && M.uniform ? this.riderTop('#0e2d55', '#ffffff', SKINS[Save.data.profile.skin] || SKINS[1], PAL.vd) : _rider69.call(this, shirt); };

/* ---------- misiones del día ---------- */
function genMisiones(now) {
  const P = Save.data.profile, wd = now.getDay(), m = Cal.min(now), dt = Cal.dayType(now), f = Cal.fiesta(now), L = [];
  const uni = P.uni ? UNIS[P.uni - 1] : null, tr = P.trabajo ? TRABAJOS[P.trabajo - 1] : null, col = P.colegio === 1, rot = (a, b) => Math.max(a, m + b);
  if (dt === 'semana' && m < 19 * 60) {
    if (uni) { const due = rot([0, 7, 9, 7, 9, 8, 0][wd] * 60, 45); L.push({ id: 'uni', kind: 'rutina', rut: 'uni', place: uni, due, txt: (due > 12 * 60 ? 'Clase de la tarde' : 'Llega a clase') + ' en ' + uni[1] + ' antes de las ' + Cal.hora(due), h: 12, xp: 40 }); }
    if (tr) { const due = rot(8 * 60, 45); L.push({ id: 'trabajo', kind: 'rutina', rut: 'trabajo', place: tr, due, txt: 'Llega a tu trabajo en ' + tr[1] + ' antes de las ' + Cal.hora(due), h: 12, xp: 40 }); }
    if (col) { const due = rot(6 * 60 + 45, 40); L.push({ id: 'colegio', kind: 'rutina', rut: 'colegio', place: null, due, txt: 'Llega al colegio antes de las ' + Cal.hora(due), h: 12, xp: 40 }); }
    if (wd === 5 && tr && m < 18 * 60) L.push({ id: 'viernes', kind: 'visita', place: ['lleras', 'Parque Lleras', 6.2088, -75.5671], txt: 'Viernes: después del trabajo, ve al Parque Lleras', h: 8, xp: 20 });
  } else if (dt === 'sabado') {
    if (uni) L.push({ id: 'grupo', kind: 'rutina', rut: 'uni', place: uni, due: rot(10 * 60, 45), txt: 'Grupo de estudio del sábado en ' + uni[1], h: 10, xp: 30 });
    if (tr) L.push({ id: 'sabado', kind: 'rutina', rut: 'trabajo', place: tr, due: rot(9 * 60, 45), txt: 'Medio turno de sábado en ' + tr[1], h: 10, xp: 30 });
  }
  if (Cal.cicloviaNow(now)) {
    L.push({ id: 'carrera', kind: 'carrera', txt: 'Carrera de la ciclovía: gana a 3 ciclistas', h: 20, xp: 60 });
    L.push({ id: 'km', kind: 'km', txt: 'Rueda 3 km por la ciclovía o las ciclorrutas', h: 10, xp: 25, need: 3000 });
    L.push({ id: 'saludo', kind: 'saludo', txt: 'Saluda con el timbre a 8 ciclistas', h: 8, xp: 20, need: 8 });
  } else if (Cal.ciclovia(now)) L.push({ id: 'saludo', kind: 'saludo', txt: 'Domingo de bici: saluda con el timbre a 5 ciclistas', h: 6, xp: 15, need: 5 });
  if (f) L.push(festMision(f, now));
  L.push({ id: 'foto', kind: 'foto', txt: 'Toma una foto en un lugar emblemático', h: 6, xp: 15 });
  if (L.length < 4) L.push({ id: 'banca', kind: 'banca', txt: 'Descansa en una banca de un parque', h: 4, xp: 10 });
  if (m >= 18 * 60) L.push({ id: 'casa', kind: 'casa', txt: 'Vuelve a tu casa', h: 5, xp: 10 });
  return L.slice(0, 5);
}
function festMision(f, now) {
  const M = { navidad: ['Ve a ver los alumbrados del río Medellín', 'rio'], velitas: ['Prende una velita en el parque de tu barrio', 'casa'], halloween: ['Recoge 5 dulces en tu barrio', 'dulces'], flores: ['Sigue el desfile de silleteros (3 puntos)', 'desfile'],
    libro: ['Compra un libro en la Fiesta del Libro (Jardín Botánico)', 'botanico'], amor: ['Lleva un detalle a un amigo en el Parque de Laureles', 'laureles'], patria: ['Ve al Parque Berrío a ver la bandera', 'berrio'], antioquia: ['Visita el Palacio de la Cultura', 'palacio'],
    semanasanta: ['Visita la Catedral Metropolitana', 'catedral'], nino: ['Lleva a un niño al Parque Norte', 'parquenorte'], madre: ['Lleva flores a casa', 'casa'], padre: ['Visita a tu papá en el Parque de Envigado', 'envigado'], anonuevo: ['Pedalea el primer viaje del año', 'km'] }[f.id] || ['Celebra en el Parque Berrío', 'berrio'];
  return { id: 'fiesta_' + f.id, kind: 'fiesta', fest: f, txt: f.icon + ' ' + M[0], where: M[1], h: 15, xp: 40, need: M[1] === 'km' ? 1500 : 0 };
}

/* ---------- animación de la rutina: entrar, que pase el tiempo y salir ---------- */
const RUT_TXT = { uni: ['Clase de Cálculo', 'Laboratorio', 'Almuerzo en la cafetería', 'Biblioteca', 'Clase de Inglés'], trabajo: ['Reunión del equipo', 'Correo y llamadas', 'Almuerzo', 'Informe del día'], colegio: ['Matemáticas', 'Recreo', 'Ciencias', 'Educación física'] };
class MGRutina extends MG {
  constructor(parent, o) { super(parent, o); this.kind = o.kind; this.name = o.name || ''; this.min = o.clock0 || 480; this.c0 = this.min; this.dur = o.dur || 120; this.ph = 0; this.k = 0; this.fast = 1; this.coach = 'El tiempo pasa mientras ' + (o.kind === 'uni' ? 'estudias' : o.kind === 'trabajo' ? 'trabajas' : 'estás en clase') + '. Toca para adelantar.'; }
  update(dt) {
    this.tick(dt); this.k += dt * this.fast;
    if (this.ph === 0 && this.k > 1.6) { this.ph = 1; this.k = 0; }
    else if (this.ph === 1) { this.min = this.c0 + this.dur * Math.min(1, this.k / 3.6); if (this.k > 3.6) { this.ph = 2; this.k = 0; this.score += 10; Snd.sfx('win'); } }
    else if (this.ph === 2 && this.k > 1.2) this.done = true;
  }
  skip() { this.fast = 3; Snd.sfx('tap'); }
  render(V) {
    const b = V.b, vw = V.vw, { gy } = this.bgStation(V, this.min), cx = Math.round(vw * .62);
    if (this.kind === 'uni') { prect(b, cx - 40, gy - 50, 80, 50, '#d8d2c4'); prect(b, cx - 44, gy - 56, 88, 8, '#a84f30'); for (let i = 0; i < 6; i++) prect(b, cx - 34 + i * 13, gy - 46, 4, 46, '#f1ece0'); prect(b, cx - 8, gy - 22, 16, 22, '#6e2c00'); }
    else if (this.kind === 'trabajo') { prect(b, cx - 26, gy - 80, 52, 80, '#8fa6bf'); for (let y = gy - 74; y < gy - 10; y += 8) for (let x = cx - 22; x < cx + 22; x += 8) prect(b, x, y, 5, 5, '#d6e4f2'); prect(b, cx - 7, gy - 18, 14, 18, '#1d2c44'); }
    else if (this.kind === 'colegio') { prect(b, cx - 44, gy - 36, 88, 36, '#f1c40f'); prect(b, cx - 44, gy - 40, 88, 5, '#c0392b'); for (let i = 0; i < 5; i++) prect(b, cx - 36 + i * 17, gy - 28, 9, 9, '#d6e4f2'); prect(b, cx - 6, gy - 18, 12, 18, '#6e2c00'); prect(b, cx + 36, gy - 70, 1, 34, '#59606c'); prect(b, cx + 37, gy - 70, 10, 3, '#f4d03f'); prect(b, cx + 37, gy - 67, 10, 2, '#2471a3'); prect(b, cx + 37, gy - 65, 10, 2, '#c0392b'); }
    const px = this.ph === 0 ? lerp(10, cx - 10, this.k / 1.6) : this.ph === 2 ? lerp(cx - 10, 10, this.k / 1.2) : -99;
    if (px > -50) Art.person(b, px, gy, Art.me(), this.t * 2, this.ph === 2 ? -1 : 1);
  }
  hud(V) {
    this.btns = [];
    V.text(this.name, V.w / 2, V.top + 18, { size: 18, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    if (this.ph === 1) {
      const acts = RUT_TXT[this.kind] || [''], a = acts[Math.floor(this.k / 3.6 * acts.length) % acts.length];
      V.text('🕐 ' + fmtClock(this.min), V.w / 2, V.h * .3, { size: 34, align: 'center', color: '#fff', stroke: '#0a2342', sw: 6 });
      V.text(a + '…', V.w / 2, V.h * .3 + 34, { size: 16, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 5, body: true });
      const w = Math.min(260, V.w - 40), c = V.ctx; c.fillStyle = '#0a2342dd'; c.fillRect((V.w - w) / 2, V.h * .3 + 52, w, 10); c.fillStyle = PAL.vd; c.fillRect((V.w - w) / 2, V.h * .3 + 52, w * Math.min(1, this.k / 3.6), 10);
    }
    if (!this.done && this.ph < 2) this.button(V, V.w / 2 - 80, V.h - 90, 160, 56, '⏩ Adelantar', () => this.skip(), { bg: PAL.vd2, size: 18, key: 'go' });
    this.drawPops(V);
  }
  tap() { this.skip(); return true; }
  bot() { this.skip(); }
}

/* ---------- modo libre: misiones, ciclovía, energía, bancas y fotos ---------- */
class ModeUsuarioR extends ModeUsuario {
  constructor(role, T, opt) {
    super(role, T, opt);
    const now = Cal.now(), sv = Cal.service(now), m = Cal.min(now);
    if (!this.free) { this.clock = clamp(m, sv.open + 10, sv.lend - 30); this.loan0 = this.clock; return; }   // préstamo a la hora real (dentro del horario)
    this.libreInit(now);
  }
  libreInit(now) {
    const R = this.ride, home = this.home = homeStation(); this.fecha = now; this.clock = Cal.min(now); this.rate = .9; this.energy = 100; this.greets = 0; this.cvDist = 0; this.misiones = [];
    R.p.x = home.x; R.p.y = home.y + 10 * WK; R.cam.x = R.p.x; R.cam.y = R.p.y; if (R.blocked(R.p.x, R.p.y, 2.5)) { const n = JE.map.nearestOpen(Math.floor(R.p.x / TS), Math.floor(R.p.y / TS), false); R.p.x = n.x * TS + TS / 2; R.p.y = n.y * TS + TS / 2; }
    const open = Cal.open(now); this.ownBike = this.opt.bici === 'propia' || !open; JE.ownBike = this.ownBike;
    if (Cal.cicloviaNow(now)) { this.mods.ciclovia = true; this.mods.traffic = .5; R.traffic = .5; }
    const day = (Save.data.dia && Save.data.dia.k === Cal.key(now)) ? Save.data.dia : (Save.data.dia = { k: Cal.key(now), done: [] });
    for (const ms of genMisiones(now)) if (!day.done.includes(ms.id)) this.addMision(ms);
    this.goals = []; this.misiones.forEach((ms, i) => this.goal(ms.txt, i === 0, () => ms.done, () => ms.prog ? ms.prog() : ms.done ? 'hecha' : ms.due ? 'antes de ' + Cal.hora(ms.due) : '¡vamos!'));
    if (!this.goals.length) this.goal('Ya hiciste las misiones de hoy: explora y colecciona postales', true, () => true);
    this.retarget(); if (JE.ui) JE.ui.toast((open ? '' : '🌙 EnCicla presta de ' + Cal.hora(Cal.service(now).open) + ' a ' + Cal.hora(Cal.service(now).lend - 1) + ': sales en tu bici. ') + (this.misiones.length ? '📋 Tienes ' + this.misiones.length + ' misiones para hoy' : ''));
  }
  addMision(ms) {
    const R = this.ride, M = JE.map; ms.marks = []; this.misiones.push(ms);
    const mk = (x, y, label, enter, col) => { const m = R.marker({ x, y, r: 14, col: col || '#ff2fb3', label, enter }); m.mis = ms; ms.marks.push(m); return m; };
    const at = p => placeP(p[2], p[3]), lm = id => { const L = LM[id]; return L ? { x: (L.x + L.w / 2) * TS, y: (L.y + L.h) * TS + 6 * WK } : null; };
    switch (ms.kind) {
      case 'rutina': { let p = ms.place ? at(ms.place) : null; if (!p) { const h = this.home; p = placeP(h.lat + .0025, h.lon + .002); } mk(p.x, p.y, ms.place ? ms.place[1] : 'Tu colegio', () => this.rutina(ms)); break; }
      case 'visita': { const p = lm(ms.place[0]) || at(ms.place); mk(p.x, p.y, ms.place[1], () => this.cumplir(ms)); break; }
      case 'casa': mk(this.home.x, this.home.y + 10 * WK, 'Tu casa', () => this.cumplir(ms), PAL.vd); break;
      case 'carrera': { const ln = this.cvLane(); if (!ln) { ms.done = true; break; } const s0 = clamp(M.project(ln, this.ride.p.x, this.ride.p.y).s + 40 * WK, 0, ln.len * .5), q = M.at(ln, s0); ms.lane = ln; ms.s0 = s0; mk(q.x, q.y, 'Salida de la carrera', () => this.salida(ms)); break; }
      case 'km': ms.prog = () => (this.cvDist * M_PER_PX / 1000).toFixed(1) + '/' + (ms.need / 1000) + ' km'; break;
      case 'saludo': ms.prog = () => Math.min(this.greets, ms.need) + '/' + ms.need; break;
      case 'banca': ms.prog = () => 'busca un parque'; break;
      case 'foto': ms.prog = () => 'cerca de un lugar con postal'; break;
      case 'fiesta': {
        const w = ms.where;
        if (w === 'dulces') { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU, p = JE.map.nearestOpen(Math.floor(this.home.x / TS + Math.cos(a) * 14), Math.floor(this.home.y / TS + Math.sin(a) * 14), false); mk(p.x * TS + TS / 2, p.y * TS + TS / 2, '🍬 Dulce', mm => { R.removeMarker(mm); ms.marks = ms.marks.filter(x => x !== mm); Snd.note(5 - ms.marks.length); if (!ms.marks.length) this.cumplir(ms); }, '#e67e22'); } ms.prog = () => (5 - ms.marks.length) + '/5 dulces'; }
        else if (w === 'desfile') { const ln = this.cvLane() || M.lanes[0]; for (let k = 1; k <= 3; k++) { const q = M.at(ln, ln.len * k / 4); mk(q.x, q.y, '🌼 Desfile ' + k, mm => { R.removeMarker(mm); ms.marks = ms.marks.filter(x => x !== mm); if (!ms.marks.length) this.cumplir(ms); }, '#f1c40f'); } ms.prog = () => (3 - ms.marks.length) + '/3 puntos'; }
        else if (w === 'rio') { const pr = M.project(M.river, this.ride.p.x, this.ride.p.y), q = M.at(M.river, pr.s), o = M.nearestOpen(Math.floor(q.x / TS) + 3, Math.floor(q.y / TS), false); mk(o.x * TS + TS / 2, o.y * TS + TS / 2, 'Alumbrados del río', () => this.cumplir(ms), '#ffd84a'); }
        else if (w === 'casa') mk(this.home.x, this.home.y + 10 * WK, 'Tu casa', () => this.cumplir(ms), '#ffd84a');
        else if (w === 'km') ms.prog = () => (this.cvDist * M_PER_PX / 1000).toFixed(1) + '/1,5 km';
        else { const p = lm(w) || (M.stations.find(s => s.id === w) || this.home); mk(p.x, p.y, ms.txt.replace(/^\S+ /, '').slice(0, 28), () => this.cumplir(ms), '#ffd84a'); }
        break;
      }
    }
  }
  cvLane() { const P = this.ride.p, L = JE.map.lanes.filter(l => l.cv && l.dir > 0 && l.len > 900 * WK); if (!L.length) return null; return L.sort((a, b) => JE.map.project(a, P.x, P.y).d - JE.map.project(b, P.x, P.y).d)[0]; }
  rutina(ms) { if (ms.done || this.sub) return; const late = this.clock > ms.due; this.runSub(new MGRutina(this, { kind: ms.rut, name: ms.place ? ms.place[1] : 'Tu colegio', clock0: this.clock, dur: ms.rut === 'colegio' ? 360 : 120 }), () => { this.clock += ms.rut === 'colegio' ? 360 : 120; this.cumplir(ms, late); }); }
  cumplir(ms, late) {
    if (ms.done) return; ms.done = true; for (const m of ms.marks || []) this.ride.removeMarker(m); ms.marks = [];
    const k = late ? .5 : 1, h = Math.round(ms.h * k), xp = Math.round(ms.xp * k), S = Save.data;
    S.stats.leaves += h; S.xp += xp; S.stats.misiones = (S.stats.misiones | 0) + 1; if (ms.kind === 'fiesta') S.flags.fiesta = 1; if (ms.id === 'carrera' && ms.won) S.flags.cvWin = 1;
    if (S.dia) S.dia.done.push(ms.id); Save.save(); this.score += 30 * k;
    this.ride.stamp = { t: 2, title: late ? 'MISIÓN (TARDE)' : '¡MISIÓN CUMPLIDA!', sub: '+' + h + ' hojas · +' + xp + ' XP', bg: late ? PAL.amb : PAL.vd };
    const nw = Logros.check(); if (nw.length && JE.ui) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', '));
    this.retarget();
  }
  retarget() {
    const P = this.ride.p, open = this.misiones.filter(m => !m.done && m.marks && m.marks.length).flatMap(m => m.marks);
    if (open.length) { this.ride.target = open.sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y))[0]; return; }
    this.pickFreeTarget();
  }
  pickFreeTarget() { if (this.misiones && this.misiones.some(m => !m.done && m.marks && m.marks.length)) return this.retarget(); super.pickFreeTarget(); }
  /* carrera de la ciclovía contra 3 ciclistas */
  salida(ms) {
    if (this.race || ms.done) return; const ln = ms.lane, M = JE.map, s0 = ms.s0, cps = [1, 2, 3].map(k => Math.min(ln.len - 20, s0 + 420 * WK * k));
    for (const m of ms.marks) this.ride.removeMarker(m); ms.marks = [];
    const names = RIVALES.slice(9, 16).map(r => r[0]); this.race = { ms, ln, cps, i: 0, cd: 3.2, t: 0, opps: [0, 1, 2].map(k => ({ id: k, name: names[k * 2] || 'Ciclista', shirt: ['#ff6b5a', '#56c7ff', '#ffc93c'][k], s: s0 - 8 * WK * (k + 1), v: (88 + k * 7) * WK / 2 * (.95 + this.rng.f() * .1), x: 0, y: 0, a: 0, fin: false })) };
    this.ride.opps = this.race.opps; this.raceMark(); Snd.sfx('tap'); JE.ui && JE.ui.toast('🏁 ¡Prepárate! Sigue la avenida de la ciclovía');
  }
  raceMark() { const r = this.race, q = JE.map.at(r.ln, r.cps[r.i]); r.m = this.ride.marker({ x: q.x, y: q.y, r: 16, col: r.i === 2 ? '#ff2fb3' : PAL.amb, label: r.i === 2 ? 'Meta' : 'Punto ' + (r.i + 1), num: r.i + 1, enter: () => { this.ride.removeMarker(r.m); r.i++; if (r.i >= 3) this.finRace(); else { Snd.sfx('star'); this.raceMark(); } } }); r.ms.marks = [r.m]; this.ride.target = r.m; }
  finRace() { const r = this.race, pos = 1 + r.opps.filter(o => o.fin).length; r.ms.won = pos === 1; this.ride.stamp = { t: 2.2, title: pos === 1 ? '¡GANASTE LA CARRERA!' : 'LLEGASTE DE ' + pos + '°', sub: 'Ciclovía de ' + (r.ln.name || 'la avenida'), bg: pos === 1 ? PAL.vd : PAL.amb }; this.cumplir(r.ms, pos > 2); this.race = null; this.ride.opps = []; }
  tick(dt) {
    super.tick(dt); if (!this.free) return; const R = this.ride, P = R.p, M = JE.map;
    // día y noche de 24 horas: tráfico según la hora, aviso de cierre de EnCicla y cambio de día a medianoche
    if (this.clock >= 1440) { this.clock -= 1440; this.fecha = addD(this.fecha, 1); JE.ui && JE.ui.toast('🌅 Nuevo día: ' + Cal.label(this.fecha)); }
    const hr = this.clock / 60, base = this.mods.ciclovia ? .5 : 1; R.traffic = base * (hr < 5 ? .25 : hr < 6 ? .5 : (hr < 9 || (hr >= 17 && hr < 19.5)) ? 1.3 : hr >= 21 ? .55 : 1);
    if (!this.ownBike) { const sv = Cal.service(this.fecha), m = this.clock; if (m >= sv.lend && m < sv.lend + 2 && !this.lendTold) { this.lendTold = 1; JE.ui && JE.ui.toast('🕘 Ya no se prestan bicis; puedes devolver la tuya hasta las ' + Cal.hora(sv.close)); } if (m >= sv.close - 30 && m < sv.close && !this.closeTold) { this.closeTold = 1; JE.ui && JE.ui.toast('🕘 EnCicla cierra a las ' + Cal.hora(sv.close) + ': devuelve la bici en una estación'); } }
    // energía: las subidas cansan, parar descansa; con poca energía se pedalea más lento
    const sl = Math.max(0, R.sl || 0), drain = P.v > 5 ? (P.veh === 'walk' ? .12 : .35 + sl * 30) : -3;
    this.energy = clamp(this.energy - drain * dt, 0, 100); if (this.energy < 15 && !this.tiredTold) { this.tiredTold = 1; JE.ui && JE.ui.toast('😮‍💨 Poca energía: siéntate en una banca de un parque o para un momento'); } if (this.energy > 40) this.tiredTold = 0;
    // ciclovía y ciclorrutas: distancia
    const v = R.tileAt(); if ((this.mods.ciclovia && (v === TT.AVE || v === TT.AUTO)) || v === TT.CICLO) this.cvDist += P.v * dt;
    for (const ms of this.misiones) if (!ms.done) { if ((ms.kind === 'km' || (ms.kind === 'fiesta' && ms.where === 'km')) && this.cvDist >= (ms.need || 3000) / M_PER_PX) this.cumplir(ms); if (ms.kind === 'saludo' && this.greets >= ms.need) this.cumplir(ms); }
    // carrera
    const r = this.race; if (r) {
      if (r.cd > 0) { r.cd -= dt; if (r.cd <= 0) Snd.sfx('win'); }
      else for (const o of r.opps) { if (o.fin) continue; o.s += o.v * dt; const q = M.at(r.ln, Math.max(0, o.s), (o.id - 1) * 4); o.x = q.x; o.y = q.y; o.a = q.a; if (o.s >= r.cps[2]) { o.fin = true; JE.ui && JE.ui.toast('🚴 ' + o.name + ' llegó a la meta'); } }
      if (r.cd > 0) for (const o of r.opps) { const q = M.at(r.ln, Math.max(0, o.s), (o.id - 1) * 4); o.x = q.x; o.y = q.y; o.a = q.a; }
    }
  }
  speedMul() { return (this.free && this.energy < 15 ? .72 : 1) * (this.race && this.race.cd > 0 ? 0 : 1); }
  update(dt) {
    if (this.sitting) { this.t += dt; this.clock += 3 * dt; this.energy = Math.min(100, this.energy + 18 * dt); this.sitT += dt; this.ride.update(dt, { x: 0, y: 0, m: 0 }); const b = this.misiones && this.misiones.find(m => m.kind === 'banca' && !m.done); if (b && this.sitT > 3) this.cumplir(b); return; }
    super.update(dt);
  }
  nearLM() { const P = this.ride.p; return PUBLIC_LM().find(L => dist((L.x + L.w / 2) * TS, (L.y + L.h / 2) * TS, P.x, P.y) < Math.max(L.w, L.h) * TS / 2 + 30 * WK); }
  foto(L) {
    const S = Save.data; S.fotos = (S.fotos || []).concat([{ id: L.id, k: Cal.key(this.fecha || Cal.now()), f: (Cal.fiesta() || {}).id || '', m: Math.round(this.clock) }]).slice(-60); S.stats.fotos = (S.stats.fotos | 0) + 1; Save.save();
    this.ride.flash = .4; Snd.sfx('star'); JE.ui && JE.ui.toast('📷 Foto guardada en tu álbum: ' + L.name);
    const ms = this.misiones && this.misiones.find(m => m.kind === 'foto' && !m.done); if (ms) this.cumplir(ms);
  }
  actions() {
    const a = super.actions(); if (!this.free || this.sub) return a; const R = this.ride, P = R.p, v = R.tileAt();
    if (this.sitting) return [{ id: 'up', icon: 'usuario', label: 'Levantarse', fn: () => { this.sitting = false; Snd.sfx('tap'); } }];
    if (P.v < 6 && (v === TT.PLAZA || v === TT.GRASS)) a.push({ id: 'sit', icon: 'hoja', label: 'Sentarse', fn: () => { this.sitting = true; this.sitT = 0; P.v = 0; Snd.sfx('tap'); JE.ui && JE.ui.toast('🪑 Descansando: recuperas energía y pasa el tiempo'); } });
    const L = this.nearLM(); if (L) a.push({ id: 'foto', icon: 'estrella', label: 'Foto', fn: () => this.foto(L) });
    return a;
  }
  info() { const i = super.info(); if (this.free) { const n = Art.night(this.clock); i.chips = [{ t: n > .5 ? '🌙 Noche' : n > 0 ? (this.clock < 720 ? '🌅 Amanece' : '🌇 Atardece') : '☀️ Día' }, { t: '⚡ ' + Math.round(this.energy) + '%', c: this.energy < 15 ? 'bad' : this.energy < 35 ? 'warn' : '' }].concat(this.ownBike ? [{ t: '🚲 Mi bici' }] : [{ t: 'EnCicla' }]); if (this.mods.ciclovia) i.chips.push({ t: '🚴 Ciclovía' }); } return i; }
  hud2(V) { if (this.race && this.race.cd > 0) { const n = Math.ceil(this.race.cd); V.text(n > 0 ? String(n) : '¡YA!', V.w / 2, V.h * .42, { size: 100, align: 'center', color: PAL.amb, stroke: PAL.az, sw: 10 }); } if (this.ride.flash > 0) { const c = V.ctx; c.fillStyle = 'rgba(255,255,255,' + (this.ride.flash * 1.5).toFixed(2) + ')'; c.fillRect(0, 0, V.w, V.h); this.ride.flash -= 1 / 60; } }
}
MODE_CLASS.usuario = ModeUsuarioR;
/* el timbre saluda a los ciclistas: se hacen a un lado y responden */
const _bell69 = Ride.prototype.bell;
Ride.prototype.bell = function () {
  const was = this.belT > 0; _bell69.call(this); if (was) return; const P = this.p, M = this.mode;
  const near = (this.npcB || []).concat(this.cars.filter(c => c.kind === 'bici' || c.kind === 'moto')).filter(q => !q.greeted && dist(q.x, q.y, P.x, P.y) < 70 * WK);
  for (const q of near) { q.greeted = true; q.v = (q.v || 30) * .7; if (q.kind !== 'moto') { this.fx.push({ k: 't', x: q.x, y: q.y - 10, t: 1.1, txt: this.rng.pick(['¡Buenas!', '¡Hola!', '¡Buen día!', '¡Eso!']), col: '#fff' }); if (M.greets != null) M.greets++; } }
};
/* en la ciclovía la avenida se llena de ciclistas; si los rozas solo frenas */
const _crash69 = Ride.prototype.crash;
Ride.prototype.crash = function (c) { if (c.kind === 'bici') { c.ghost = 1.5; this.p.v *= .5; this.float('¡Uy!', PAL.amb); return; } _crash69.call(this, c); };
const _carTop69 = Art.carTop;
Art.carTop = function (col, kind) { return kind === 'bici' ? this.riderTop(col, '#ffffff', SKINS[2], PAL.vd) : _carTop69.call(this, col, kind); };
const _uc69 = Ride.prototype.updCars;
Ride.prototype.updCars = function (dt) {
  _uc69.call(this, dt);
  if (!this.mode.mods.ciclovia || this.cars.filter(c => c.kind === 'bici').length >= 14) return;
  const L = this.map.lanesNear(this.cam.x, this.cam.y).filter(l => l.cv); if (!L.length || this.rng.f() > .3) return;
  const ln = this.rng.pick(L), p = clamp(this.map.project(ln, this.cam.x, this.cam.y).s + this.rng.range(-180, 180) * WK, 0, ln.len), q = this.map.at(ln, p, ln.off);
  if (Math.abs(q.x - this.cam.x) > 210 * WK || Math.abs(q.y - this.cam.y) > 210 * WK || dist(q.x, q.y, this.p.x, this.p.y) < 50 * WK) return;
  const c = { L: ln, p, v: 0, spd: this.rng.range(34, 52) * WK, yield: 0, stop: 0, si: q.i, kind: 'bici', col: this.rng.pick(['#ff6b5a', '#56c7ff', '#ffc93c', '#b07cff', '#ff8fc7', '#7fd1b9', '#f08a4b']) }; this.carPos(c); this.cars.push(c);
};
/* banca y fotos en el dibujo */
const _dgL = Ride.prototype.drawGround;
Ride.prototype.drawGround = function (b, ox, oy, inV) { _dgL.call(this, b, ox, oy, inV); if (this.mode.sitting) { const P = this.p; b.fillStyle = '#6e4a2a'; b.fillRect(P.x - ox - 8, P.y - oy + 2, 16, 4); b.fillStyle = '#3d2a18'; b.fillRect(P.x - ox - 7, P.y - oy + 6, 2, 3); b.fillRect(P.x - ox + 5, P.y - oy + 6, 2, 3); } };

/* ---------- interfaz: fecha de hoy, edición especial, bici del modo libre y álbum de fotos ---------- */
function applyFest() {
  const f = Cal.fiesta(), body = document.body; [...body.classList].filter(c => c.startsWith('fest-')).forEach(c => body.classList.remove(c));
  const old = $('#festBand'); if (old) old.remove(); if (!f) return;
  body.classList.add('fest-' + f.id); document.documentElement.style.setProperty('--fest1', f.cols[0]); document.documentElement.style.setProperty('--fest2', f.cols[1]);
  const band = document.createElement('div'); band.id = 'festBand'; band.className = 'festband'; band.textContent = f.icon + ' Edición especial: ' + f.name + ' · hasta el ' + f.hasta.getDate() + ' de ' + MESES[f.hasta.getMonth()];
  const cb = $('#sCover .cbody'); if (cb) cb.insertBefore(band, cb.querySelector('canvas'));
}
const _init69 = UI.init; UI.init = function () { _init69.call(this); applyFest(); };
const _ruta69 = UI.renderRuta;
UI.renderRuta = function () {
  _ruta69.call(this); const el = $('#tab-ruta'); if (!el) return; const r = Cal.resumen(), d = document.createElement('div'); d.className = 'hoy';
  const gifts = []; for (const k of ['shirt', 'helmet']) for (const i in FEST_REQ[k]) if (festOk(FEST_REQ[k][i][0]) && !Save.data.owned.includes(k + i)) gifts.push(FEST_REQ[k][i][1]);
  d.innerHTML = esc(r.txt) + (r.f ? `<div class="hf">${r.f.icon} <b>${esc(r.f.name)}</b>: el valle se vistió de fiesta${gifts.length ? ' · 🎁 regalo de temporada en Mi ciclista: ' + esc(gifts.join(', ')) : ''}</div>` : '');
  el.insertBefore(d, el.children[1] || null);
};
const _brief69 = UI.brief;
UI.brief = function (roleId, turno, o = {}) {
  if (!o.nov && !o.reto && !isMulti(roleId)) { const now = Cal.now(), f = Cal.fiesta(now), all = NOVEDADES.concat(NOV_EXTRA); const id = Cal.cicloviaNow(now) ? 'ciclovia' : f && f.nov; if (id) o = Object.assign({}, o, { nov: all.find(n => n.id === id) }); }
  _brief69.call(this, roleId, turno, o);
  if (roleId === 'usuario' && o.free) {
    const now = Cal.now(), open = Cal.open(now), bici = o.bici || (open ? 'encicla' : 'propia'), L = genMisiones(now), go = $('#bGo');
    const box = document.createElement('div'); box.className = 'paper libre';
    box.innerHTML = `<div class="t">Hoy en el modo libre</div><p style="margin:4px 0">${esc(Cal.resumen(now).txt)}</p><div class="pag">¿Con qué bici sales?</div><div class="zonas"><button class="chip ${bici === 'encicla' ? 'on' : ''}" data-bici="encicla" ${open ? '' : 'disabled'}>🟢 EnCicla${open ? '' : ' (cerrada)'}</button><button class="chip ${bici === 'propia' ? 'on' : ''}" data-bici="propia">🚲 Mi bici</button></div>
      <div class="pag">Misiones de hoy</div><ul class="goals">${L.map(m => `<li><b>☆</b><span>${esc(m.txt)}</span></li>`).join('') || '<li><span>Explora el valle y colecciona postales</span></li>'}</ul>
      ${Save.data.profile.uni || Save.data.profile.trabajo || Save.data.profile.colegio ? '' : '<p class="m" style="font-size:13px">Cuéntanos de ti en Mi ciclista › Tú para tener misiones de colegio, universidad o trabajo.</p>'}`;
    go.parentNode.parentNode.insertBefore(box, go.parentNode);
    $$('[data-bici]', box).forEach(b => b.onclick = () => { Snd.sfx('tap'); this.brief(roleId, turno, Object.assign({}, o, { bici: b.dataset.bici })); });
    go.onclick = () => { Snd.init(); Snd.resume(); Game.start(roleId, turno, Object.assign({}, o, { seed: (Date.now() >>> 0), nov: o.nov || NOVEDADES[0], bici })); };
  }
};
const _start69 = Game.start;
Game.start = function (roleId, turno, o = {}) { JE.ownBike = false; Snd.fest = (Cal.fiesta() || {}).music || null; return _start69.call(this, roleId, turno, o); };
const _album69 = UI.renderAlbum;
UI.renderAlbum = function () {
  _album69.call(this); const el = $('#tab-album'), F = Save.data.fotos || []; if (!el || !F.length) return;
  const d = document.createElement('div'); d.innerHTML = `<div class="pag" style="margin-top:16px">📷 Tus fotos · ${F.length}</div><div class="fotos">${F.slice().reverse().slice(0, 24).map((f, i) => { const L = LM[f.id]; if (!L) return ''; const fi = FIESTAS.find(x => x[0] === f.f); return `<figure class="foto"><canvas width="96" height="72" data-foto="${LANDMARKS.indexOf(L)}"></canvas><figcaption>${esc(L.name.split(' · ')[0])}<br><small>${esc(f.k)}${fi ? ' ' + fi[2] : ''}</small></figcaption></figure>`; }).join('')}</div>`;
  el.appendChild(d); $$('canvas[data-foto]', d).forEach(c => this.drawPost(c, +c.dataset.foto));
};
/* preguntas del perfil: efectos al elegir */
JE.onProfile = (k, i) => {
  const S = Save.data;
  if (k === 'edad') { if ((i === 0 || i === 3) && S.settings.pace !== 'tranquilo') { S.settings.pace = 'tranquilo'; UI.toast('Ritmo tranquilo activado: más tiempo para todo (se cambia en Más)'); } if (i === 3 && !S.settings.big) { S.settings.big = true; document.body.classList.add('big'); } }
  if (k === 'tall' && S.profile.bikeSize == null) S.profile.bikeSizeAuto = i;
};
LOGROS.push(
  { id: 'misiones10', name: 'Vida sobre ruedas', desc: 'Cumple 10 misiones del modo libre', icon: 'usuario', test: S => (S.stats.misiones | 0) >= 10 },
  { id: 'cvwin', name: 'Rey de la ciclovía', desc: 'Gana una carrera de la ciclovía', icon: 'balance', test: S => !!S.flags.cvWin },
  { id: 'fiesta', name: 'De fiesta en el valle', desc: 'Cumple una misión de una festividad', icon: 'estrella', test: S => !!S.flags.fiesta },
  { id: 'foto10', name: 'Fotógrafo del valle', desc: 'Toma 10 fotos', icon: 'estrella', test: S => (S.stats.fotos | 0) >= 10 }
);
