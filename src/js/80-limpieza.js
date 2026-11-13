/* =====================================================================
   BRIGADA DE LIMPIEZA (una vez al mes): dos supervisores y el anfitrión limpian el habitáculo.
   También: accesos rápidos en el inicio, creador de personaje obligatorio al empezar y horario del sábado.
   ===================================================================== */
Object.assign(CAST, { limpieza: ['Doña Marta', 'brigada de limpieza', '#c68a5c', '#5a2d0c', '#ffffff', '#0e2d55'] });
Object.assign(BIOS, { limpieza: ['Belén', 'Un habitáculo limpio también presta mejor servicio.', 'Cada mes sale con otro supervisor a recorrer las estaciones con anfitrión: vidrio, mostrador, piso y basura, sin dejar nada.'] });
Object.assign(HISTORIA, { limpieza: [{ t: 'Brigada del mes', a: 'Hoy toca brigada: vamos dos supervisores y en cada estación nos ayuda el anfitrión. Escoge bien la herramienta y que brille el habitáculo.', d: '¡Quedaron impecables! Los usuarios lo notan apenas llegan.' }] });
const ROLE_LIMPIEZA = { id: 'limpieza', name: 'Limpieza', tier: 'Brigada mensual', icon: 'limpieza', vista: 'Cenital · orden', unlock: 9,
  desc: 'Una vez al mes, dos supervisores y el anfitrión limpian el habitáculo de cada estación con anfitrión.',
  how: ['Ve a cada estación marcada.', 'Elige la herramienta y toca lo que está sucio.', 'Tus compañeros de brigada también limpian: ¡terminen rápido!'],
  shifts: [{ n: 'Brigada mensual', h: '9:00 a. m. – 5:00 p. m.' }] };
ROLES.splice(ROLES.findIndex(r => r.id === 'tecnico'), 0, ROLE_LIMPIEZA);
ROLES.forEach((r, i) => { r.n = i + 1; ROLE[r.id] = r; });
const _icon80 = Art.icon;
Art.icon = function (name) {
  if (name === 'limpieza') return this.get('ic_limpieza', 16, 16, x => { pline(x, 11, 1, 6, 10, '#c48a52'); pline(x, 12, 1, 7, 10, '#c48a52'); prect(x, 2, 10, 7, 3, PAL.amb); for (let i = 0; i < 4; i++) pline(x, 2 + i * 2, 13, 1 + i * 2, 15, PAL.amb); prect(x, 12, 9, 2, 2, '#fff'); prect(x, 14, 6, 1, 1, '#fff'); });
  return _icon80.call(this, name);
};

/* ---------- minijuego: limpiar el habitáculo ---------- */
const HERR = [['escoba', '🧹', 'Escoba', 'Polvo y hojas'], ['trapero', '🪣', 'Trapero', 'Manchas del piso'], ['pano', '🧽', 'Paño', 'Vidrio y mostrador'], ['bolsa', '🗑️', 'Bolsa', 'Basura']];
class MGLimpieza extends MG {
  constructor(parent, o) {
    super(parent, o); const R = this.rng; this.min = o.clock0 || 600; this.tool = null; this.k = 0; this.helpT = 3; this.items = []; this.tLim = (o.secs || 45) * (parent.timeMul || 1);
    const add = (kind, n, zone) => { for (let i = 0; i < n; i++) this.items.push({ kind, hp: kind === 'trapero' || kind === 'pano' ? 2 : 1, z: zone, u: R.f(), v: R.f(), s: .7 + R.f() * .5, sp: 0 }); };
    add('pano', 3, 'vidrio'); add('pano', 2, 'mesa'); add('trapero', 3, 'piso'); add('escoba', 2, 'piso'); add('bolsa', 2, 'piso');
    this.total = this.items.length; this.coach = 'Elige la herramienta y toca lo que está sucio.';
  }
  pos(it) { const L = this.L || { vw: 200, vh: 150 }, w = L.vw, h = L.vh; if (it.z === 'vidrio') return { x: w * (.18 + it.u * .64), y: h * (.16 + it.v * .2) }; if (it.z === 'mesa') return { x: w * (.15 + it.u * .7), y: h * .5 }; return { x: w * (.1 + it.u * .8), y: h * (.7 + it.v * .2) }; }
  left() { return this.items.filter(i => i.hp > 0); }
  clean(it, who) {
    if (it.hp <= 0) return; it.hp--; it.sp = .5; const p = this.pos(it);
    if (it.hp <= 0) { if (who === 'yo') this.good(4, p.x, p.y - 8, '✨'); Snd.note(this.total - this.left().length); }
    if (!this.left().length && !this.endT) { this.endT = 1.2; this.score += Math.max(0, Math.round(this.tLim - this.k)); Snd.sfx('win'); }
  }
  tap(vx, vy) {
    let best = null, bd = 16; for (const it of this.left()) { const p = this.pos(it), d = dist(vx, vy, p.x, p.y); if (d < bd) { bd = d; best = it; } }
    if (!best) return false; if (!this.tool) { this.pop('Elige una herramienta', vx, vy - 10, PAL.amb); return true; }
    if (this.tool !== best.kind) { this.bad(HERR.find(h => h[0] === best.kind)[2] + ', no ' + HERR.find(h => h[0] === this.tool)[2].toLowerCase(), vx, vy - 10); return true; }
    this.clean(best, 'yo'); return true;
  }
  update(dt) {
    this.tick(dt); this.k += dt; for (const it of this.items) it.sp = Math.max(0, it.sp - dt);
    if (this.endT) { this.endT -= dt; if (this.endT <= 0) this.done = true; return; }
    this.helpT -= dt; if (this.helpT <= 0) { this.helpT = 4.5; const L = this.left(); if (L.length > 2) this.clean(this.rng.pick(L), 'brigada'); }   // la brigada también limpia
    if (this.k >= this.tLim) { this.endT = .8; JE.ui && JE.ui.toast('⏱ Se acabó el tiempo: quedó algo sucio'); }
    this.min = (this.o.clock0 || 600) + this.k / 2;
  }
  render(V) {
    const b = V.b, w = V.vw, h = V.vh; this.L = { vw: w, vh: h };
    prect(b, 0, 0, w, h, '#d9d2c2'); prect(b, 0, Math.round(h * .62), w, h, '#9a9488'); for (let x = 0; x < w; x += 16) prect(b, x, Math.round(h * .62), 1, h, '#8a8478'); for (let y = Math.round(h * .62); y < h; y += 12) prect(b, 0, y, w, 1, '#8a8478');
    const wy = Math.round(h * .1), wh = Math.round(h * .32); prect(b, Math.round(w * .1), wy, Math.round(w * .8), wh, '#2b2f38'); prect(b, Math.round(w * .1) + 3, wy + 3, Math.round(w * .8) - 6, wh - 6, '#9fd0f0'); prect(b, Math.round(w * .5) - 1, wy, 2, wh, '#2b2f38');
    prect(b, Math.round(w * .08), Math.round(h * .46), Math.round(w * .84), 8, '#7a5230'); prect(b, Math.round(w * .08), Math.round(h * .46) + 8, Math.round(w * .84), 4, '#5a3a1e');
    for (let i = 0; i < 6; i++) { prect(b, Math.round(w * .12) + i * 9, Math.round(h * .55), 2, 5, '#59606c'); prect(b, Math.round(w * .12) + i * 9 - 1, Math.round(h * .55) + 5, 4, 3, ['#ff6b5a', '#56c7ff', '#ffc93c', '#b07cff', '#ff8fc7', '#9bd341'][i]); }
    for (const it of this.items) {
      const p = this.pos(it), x = Math.round(p.x), y = Math.round(p.y), a = it.hp > 0;
      if (a) { if (it.kind === 'pano') { b.globalAlpha = .45 + .25 * it.hp; pdisc(b, x, y, Math.round(5 * it.s), it.z === 'vidrio' ? '#8a9a8a' : '#6e5a3e'); b.globalAlpha = 1; }
        else if (it.kind === 'trapero') { b.globalAlpha = .4 + .25 * it.hp; pdisc(b, x, y, Math.round(6 * it.s), '#5a4630'); b.globalAlpha = 1; }
        else if (it.kind === 'escoba') { for (let k = 0; k < 6; k++) prect(b, x - 5 + ((k * 7) % 11), y - 2 + ((k * 5) % 5), 2, 1, k % 2 ? '#6aa94f' : '#8a7a5a'); }
        else { prect(b, x - 3, y - 3, 6, 5, '#e8e4dc'); prect(b, x - 2, y - 2, 2, 2, '#c0392b'); prect(b, x + 2, y - 6, 3, 8, '#56c7ff'); } }
      if (it.sp > 0) { const r = Math.round(8 * (1 - it.sp)); b.fillStyle = '#ffffff'; b.fillRect(x - r, y, r * 2 + 1, 1); b.fillRect(x, y - r, 1, r * 2 + 1); }
    }
    const ph = this.t * 3, me = Art.me({ uniforme: true });
    [[.12, -1], [.88, 1]].forEach(([fx, f], i) => { const p = Object.assign({}, me, { skin: SKINS[(i * 3 + 2) % SKINS.length], hair: '#2a1a10', cap: null }); Art.person(b, Math.round(w * fx), Math.round(h * .66), p, ph + i, f); pline(b, Math.round(w * fx) - 4 * f, Math.round(h * .66) - 10, Math.round(w * fx) - 8 * f, Math.round(h * .66) - 2 + Math.round(Math.sin(ph * 2) * 2), '#c48a52'); });
  }
  hud(V) {
    this.btns = []; const left = this.left().length, tl = Math.max(0, Math.ceil(this.tLim - this.k));
    V.text('LIMPIEZA · ' + (this.o.st || 'habitáculo'), V.w / 2, V.top + 18, { size: 17, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    V.text('Falta limpiar ' + left + ' de ' + this.total + ' · ⏱ ' + tl + ' s', V.w / 2, V.top + 42, { size: 14, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 5, body: true });
    const n = HERR.length, bw = Math.min(84, (V.w - 24) / n - 6), bx = (V.w - n * (bw + 6) + 6) / 2, by = V.h - bw - 26;
    HERR.forEach(([k, ic, nm], i) => this.button(V, bx + i * (bw + 6), by, bw, bw + 8, ic + ' ' + nm, () => { this.tool = k; Snd.sfx('tap'); }, { bg: this.tool === k ? PAL.vd2 : PAL.az1, size: 12, key: 't_' + k }));
    if (this.endT && !left) V.text('¡Habitáculo impecable!', V.w / 2, V.h * .4, { size: 26, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 6 });
    this.drawPops(V);
  }
  bot(err) { const L = this.left(); if (!L.length) return; const it = L[0]; if (this.tool !== it.kind || this.rng.f() < err * .3) this.tool = this.rng.f() < err * .3 ? this.rng.pick(HERR)[0] : it.kind; const p = this.pos(it); this.tap(p.x, p.y); }
}
coachAt(MGLimpieza, () => 0);
class ModeLimpieza extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng, M = JE.map, casa = M.poi.casa;
    this.sim = new StationSim(R, { demand: this.mods.demand }); this.setupRide({ sim: this.sim, start: { x: casa.x, y: casa.y + 6 * WK } });
    const mans = M.stations.filter(s => s.type === 'm'), c = R.pick(nearestOf(mans, casa.x, casa.y, 6)); let L = nearestOf(mans, c.x, c.y, 3), at = casa; const route = [];
    while (L.length) { L.sort((a, b) => dist(a.x, a.y, at.x, at.y) - dist(b.x, b.y, at.x, at.y)); at = L.shift(); route.push(at); }
    this.clean = 0; const due = [660, 840, 990];
    const tasks = route.map((s, i) => T_ST(s, { label: 'Limpiar el habitáculo · ' + s.name, due: due[i], mg: () => new MGLimpieza(this, { clock0: this.clock, st: s.name, secs: 45 - i * 4 }), after: sc => { if (!sc.left().length) this.clean++; } }));
    this.begin([{ name: 'Brigada de limpieza del mes', short: 'Brigada', from: 540, to: 1020, mgSecs: 40, toast: '🧽 Brigada del mes: ' + route.length + ' habitáculos por limpiar.', tasks }]);
    const req = () => this.phases[0].tasks;
    this.goal('Limpia los ' + route.length + ' habitáculos', true, () => req().every(t => t.done && !t.lost), () => req().filter(t => t.done).length + '/' + route.length);
    this.goal('Todos quedan impecables', false, () => this.clean >= route.length, () => this.clean + '/' + route.length);
    this.goal('Máximo 2 herramientas equivocadas', false, () => this.mgErr <= 2, () => this.mgErr + ' errores');
  }
  chips() { return [{ t: '🧽 ' + this.clean + ' impecables' }]; }
}
MODE_CLASS.limpieza = ModeLimpieza;
TUT_EXTRA.limpieza = 'Cada mancha tiene su herramienta: el paño para vidrio y mostrador, el trapero para el piso, la escoba para el polvo y la bolsa para la basura.';

/* ---------- sábado: horario de anfitriones y supervisores ----------
   Anfitriones: T1 6:00 a. m.–1:30 p. m. y T3 1:00–8:30 p. m. (7 h 30 min). Supervisores: una hora antes y media hora después. */
const esSabado = () => Cal.dayType(Cal.now()) === 'sabado';
const SAB_H = { anfitrion: ['6:00 a. m. – 1:30 p. m.', '1:00 p. m. – 8:30 p. m.'], apoyo: ['6:00 a. m. – 1:30 p. m.', '1:00 p. m. – 8:30 p. m.'], supervisor: ['5:00 a. m. – 1:00 p. m.', '9:00 a. m. – 6:00 p. m.', '1:00 p. m. – 9:00 p. m.'] };
function horasDelDia() { const sab = esSabado(); for (const id in SAB_H) { const r = ROLE[id]; if (!r || !r.shifts) continue; r.shifts.forEach((s, i) => { if (s.h0 == null) s.h0 = s.h; s.h = sab && SAB_H[id][i] ? SAB_H[id][i] : s.h0; }); } }
const SAB_MAP = { 1: [[300, 360], [330, 390], [810, 810]], 2: [[810, 780], [1260, 1140], [1320, 1200], [1350, 1230]] };
const remap = (m, A) => { if (m <= A[0][0]) return m - A[0][0] + A[0][1]; for (let i = 1; i < A.length; i++) if (m <= A[i][0]) { const [a, b] = A[i - 1], [c, d] = A[i]; return b + (m - a) * (d - b) / (c - a); } const L = A[A.length - 1]; return m - L[0] + L[1]; };
ModeAnfitrionR.prototype.begin = function (phases) {
  if (esSabado() && !JE.briefing) {
    const A = SAB_MAP[this.turno === 1 ? 1 : 2], f = m => Math.round(remap(m, A));
    for (const ph of phases) { ph.from = f(ph.from); ph.to = Math.max(f(ph.to), ph.from + 1); ph.name = ph.name.replace('10 p. m.', '8 p. m.'); if (ph.toast) ph.toast = ph.toast.replace('5:00 a. m.', '6:00 a. m.').replace('5:30', '6:30'); for (const t of ph.tasks || []) if (t.due) t.due = f(t.due); }
  }
  return ShiftMode.prototype.begin.call(this, phases);
};

/* ---------- inicio: accesos rápidos ---------- */
const _ruta80 = UI.renderRuta;
UI.renderRuta = function () {
  horasDelDia(); _ruta80.call(this); const el = $('#tab-ruta'); if (!el) return; const ref = el.querySelector('.hoy') || el.querySelector('.hhead'); if (!ref) return;
  const d = document.createElement('div'); d.className = 'quick';
  d.innerHTML = [['avatar', '🚲', 'Mi ciclista'], ['historia', '📖', 'Historia'], ['personajes', '👥', 'Personajes'], ['ranking', '🏆', 'Ranking'], ['multi', '🤝', 'Amigos'], ['retos', '🎟️', 'Retos']].map(([k, i, n]) => `<button data-q="${k}"><b>${i}</b><span>${n}</span></button>`).join('');
  ref.after(d);
  $$('[data-q]', d).forEach(b => b.onclick = () => { Snd.sfx('tap'); const k = b.dataset.q; if (k === 'retos') this.retoCrear(); else this[k](); });
};
const _brief80 = UI.brief; UI.brief = function () { horasDelDia(); return _brief80.apply(this, arguments); };

/* ---------- creador de personaje: siempre al empezar; y opción de empezar de cero ---------- */
const _go80 = UI.go;
UI.go = function (id) {
  const r = _go80.apply(this, arguments);
  if ((id === 'sHome' || id === 'sBrief') && Save.data && !Save.data.settings.seen.profile) setTimeout(() => { if ($('#modal').hidden && !Save.data.settings.seen.profile) this.avatar(true); }, 60);
  return r;
};
const _av80 = UI.avatar;
UI.avatar = function (first) {
  _av80.call(this, first); if (first) return; const ok = $('#avOk'); if (!ok) return;
  const b = document.createElement('button'); b.className = 'btn gh sm'; b.textContent = 'Empezar con un personaje nuevo'; ok.parentNode.appendChild(b);
  b.onclick = () => this.confirm('Se borra tu progreso y creas un personaje desde cero. ¿Seguro?', () => { Save.reset(); this.go('sHome'); this.renderHome(); this.avatar(true); });
};
