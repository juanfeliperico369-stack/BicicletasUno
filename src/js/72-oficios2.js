/* =====================================================================
   OFICIOS NUEVOS: PAUSAS ACTIVAS Y RESCATE DE BICIS
   y minijuegos del técnico: tótem, luces de los anclajes y celular de la estación.
   ===================================================================== */
Object.assign(CAST, {
  pausas: ['Maryi', 'pausas activas', '#c68a5c', '#2b1d14', '', '#0e2d55'],
  rescate: ['Jhon', 'rescate de bicis', '#a86a3d', '#141414', '#ffffff', '#0e2d55']
});
Object.assign(BIOS, {
  pausas: ['Laureles', 'Un cuerpo que se mueve trabaja mejor.', 'Recorre las estaciones a mitad de turno con su parlante y pone a estirar a todo el que encuentre, del anfitrión al supervisor.'],
  rescate: ['Manrique', 'Ninguna bici se queda atrás.', 'Encuentra bicis abandonadas en parques y esquinas y las devuelve pedaleando con una mano y llevando la otra bici con la otra.']
});
Object.assign(HISTORIA, {
  pausas: [{ t: 'A mover el cuerpo', a: 'Hoy recorres las estaciones haciendo pausas activas. Llega, pon la música y que todos estiren: nadie aguanta un turno entero quieto.', d: '¡Así se cuida al equipo! Los anfitriones quedaron como nuevos.' }],
  rescate: [{ t: 'Ninguna bici atrás', a: 'Nos reportaron bicis fuera de las estaciones. Ve por ellas y llévalas con una mano: despacio y derecho, que el equilibrio es todo.', d: 'Todas de vuelta en su anclaje. Buen pulso, compañero.' }]
});
const ROLE_PAUSAS = { id: 'pausas', name: 'Pausas Activas', tier: 'Bienestar', icon: 'pausas', vista: 'Cenital · ritmo', unlock: 8,
  desc: 'En el turno intermedio recorre las estaciones con anfitrión y dirige pausas activas: estiramientos y ejercicios al ritmo de la música.',
  how: ['Ve a cada estación marcada en el mapa.', 'Haz cada movimiento cuando la tarjeta llegue al círculo.', 'Desliza el dedo o toca las flechas; mantén oprimido en «Respira».'],
  shifts: [{ n: 'Turno intermedio', h: '9:00 a. m. – 6:00 p. m.' }] };
const ROLE_RESCATE = { id: 'rescate', name: 'Rescate', tier: 'Operación de campo', icon: 'rescate', vista: 'Cenital · equilibrio', unlock: 11,
  desc: 'Recupera las bicis que quedaron fuera de las estaciones y devuélvelas pedaleando con una mano y llevando la otra bici con la otra.',
  how: ['Ve al punto donde reportaron la bici.', 'Revísala: si está buena, a la estación más cercana; si está dañada, a una estación con anfitrión para que Balance la lleve al taller.', 'Llévala sin caerte: ◀ ▶ para equilibrar, sin curvas bruscas.'],
  shifts: [{ n: 'Turno de rescate', h: '8:00 a. m. – 5:00 p. m.' }] };
ROLES.splice(ROLES.findIndex(r => r.id === 'tecnico'), 0, ROLE_PAUSAS);
ROLES.splice(ROLES.findIndex(r => r.id === 'balance'), 0, ROLE_RESCATE);
ROLES.forEach((r, i) => { r.n = i + 1; ROLE[r.id] = r; });
const _icon72 = Art.icon;
Art.icon = function (name) {
  if (name === 'pausas') return this.get('ic_pausas', 16, 16, x => { pdisc(x, 8, 3, 2, '#f1c9a5'); prect(x, 7, 5, 3, 5, PAL.vd); pline(x, 7, 6, 3, 1, PAL.vd); pline(x, 9, 6, 13, 1, PAL.vd); pline(x, 7, 10, 4, 15, '#d6dde6'); pline(x, 9, 10, 12, 15, '#d6dde6'); });
  if (name === 'rescate') return this.get('ic_rescate', 16, 16, x => { pring(x, 4, 11, 3, '#fff'); pring(x, 12, 11, 3, '#fff'); pline(x, 4, 11, 8, 7, PAL.vd); pline(x, 8, 7, 12, 11, PAL.vd); prect(x, 6, 1, 5, 4, PAL.cor); prect(x, 8, 0, 1, 6, '#fff'); prect(x, 6, 2, 5, 1, '#fff'); });
  return _icon72.call(this, name);
};

/* ---------- figura con poses (pausas activas) ---------- */
const POSE0 = { hip: [0, -10], sh: [0, -18], hd: [0, -21.5], eL: [-3, -14], hL: [-3.5, -10], eR: [3, -14], hR: [3.5, -10], kL: [-1.5, -5], fL: [-2, 0], kR: [1.5, -5], fR: [2, 0] };
const POSES = {
  idle: {},
  up: { eL: [-3, -22], hL: [-3, -26.5], eR: [3, -22], hR: [3, -26.5] },
  down: { hip: [0, -6], sh: [0, -13.5], hd: [0, -17], eL: [-3, -13], hL: [-6.5, -13], eR: [3, -13], hR: [6.5, -13], kL: [-4.5, -4], fL: [-2.5, 0], kR: [4.5, -4], fR: [2.5, 0] },
  left: { sh: [-3.5, -17.5], hd: [-5, -20.5], eL: [-6, -14], hL: [-7, -10.5], eR: [0, -22], hR: [-4, -25] },
  right: { sh: [3.5, -17.5], hd: [5, -20.5], eR: [6, -14], hR: [7, -10.5], eL: [0, -22], hL: [4, -25] },
  tap: { eL: [-3, -15], hL: [-.5, -18], eR: [3, -15], hR: [.5, -18] },
  hold: { sh: [0, -18.5], hd: [0, -22], eL: [-5, -18.5], hL: [-9, -20], eR: [5, -18.5], hR: [9, -20] }
};
const poseOf = (a, b, f) => { const A = Object.assign({}, POSE0, POSES[a] || {}), B = Object.assign({}, POSE0, POSES[b] || {}), o = {}; for (const k in A) o[k] = [lerp(A[k][0], B[k][0], f), lerp(A[k][1], B[k][1], f)]; return o; };
function drawPose(b, x, y, J, p, k) {
  const P = (q) => [Math.round(x + q[0] * k), Math.round(y + q[1] * k)];
  const thick = (a, c, w, col) => { const A = P(a), C = P(c), hz = Math.abs(C[0] - A[0]) > Math.abs(C[1] - A[1]); for (let i = -Math.floor(w / 2); i < Math.ceil(w / 2); i++) pline(b, A[0] + (hz ? 0 : i), A[1] + (hz ? i : 0), C[0] + (hz ? 0 : i), C[1] + (hz ? i : 0), col); };
  const lw = Math.max(1, Math.round(k * 1.4)), tw = Math.max(2, Math.round(k * 3.6));
  thick(J.hip, J.kL, lw + 1, p.pants); thick(J.kL, J.fL, lw + 1, p.pants); thick(J.hip, J.kR, lw + 1, shade(p.pants, -.15)); thick(J.kR, J.fR, lw + 1, shade(p.pants, -.15));
  const fL = P(J.fL), fR = P(J.fR); prect(b, fL[0] - k, fL[1] - k + 1, 2 * k, k, p.shoes || '#111'); prect(b, fR[0] - k, fR[1] - k + 1, 2 * k, k, p.shoes || '#111');
  thick(J.hip, J.sh, tw, p.vest ? PAL.vd : p.shirt);
  thick(J.sh, J.eL, lw, p.shirt); thick(J.eL, J.hL, lw, p.skin); thick(J.sh, J.eR, lw, p.shirt); thick(J.eR, J.hR, lw, p.skin);
  const H = P(J.hd), r = Math.max(2, Math.round(2.6 * k)); pdisc(b, H[0], H[1], r, p.skin); prect(b, H[0] - r, H[1] - r - 1, r * 2 + 1, Math.max(1, r - 1), p.cap || p.hair || '#2a1a10');
  prect(b, H[0] - Math.round(k), H[1], Math.max(1, Math.round(k * .6)), Math.max(1, Math.round(k * .6)), '#141414'); prect(b, H[0] + Math.round(k * .6), H[1], Math.max(1, Math.round(k * .6)), Math.max(1, Math.round(k * .6)), '#141414');
}

/* ---------- PAUSA ACTIVA: coreografía al ritmo (tarjetas que llegan al círculo) ---------- */
const EJERCICIOS = [
  { name: 'Brazos arriba', k: 'up', pose: 'up', ic: '▲' }, { name: 'Sentadilla', k: 'down', pose: 'down', ic: '▼' },
  { name: 'Inclínate a la izquierda', k: 'left', pose: 'left', ic: '◀' }, { name: 'Inclínate a la derecha', k: 'right', pose: 'right', ic: '▶' },
  { name: 'Aplauso', k: 'tap', pose: 'tap', ic: '●' }, { name: 'Respira profundo', k: 'hold', pose: 'hold', ic: '◉', len: 2 }
];
class MGPausa extends MG {
  constructor(parent, o) {
    super(parent, o); const R = this.rng, lvl = o.lvl | 0; this.min = o.clock0 || 600; this.bpm = 92 + lvl * 6; this.beat = 60 / this.bpm; this.t0 = 2.6;
    // coreografía por frases de 4 que se repiten con variación, como en los juegos de baile
    const pick = () => R.pick(EJERCICIOS.slice(0, 5)), seq = []; let tb = 0;
    for (let f = 0; f < 3 + Math.min(1, lvl); f++) { const ph = [pick(), pick(), pick(), R.f() < .5 ? EJERCICIOS[5] : pick()]; for (let rep = 0; rep < 2; rep++) for (const e of ph) { const v = rep && e.k !== 'hold' && R.f() < .3 ? pick() : e; seq.push({ e: v, at: this.t0 + tb * this.beat, res: null }); tb += v.len ? 4 : 2; } }
    this.seq = seq; this.tEnd = this.t0 + tb * this.beat + 1.2; this.perf = 0; this.goodN = 0; this.miss = 0; this.combo = 0; this.fb = null; this.hold = null; this.sw = null; this.ani = 50; this.lastBeat = -1;
    this.crew = [0, 1, 2].map(i => ({ p: Object.assign({}, Art.me({ uniforme: true }), { shirt: ['#0e2d55', '#1d4a80', '#0e2d55'][i], skin: SKINS[(i * 2 + 1) % SKINS.length], hair: ['#2a1a10', '#141414', '#5a2d0c'][i], cap: null }), lag: .12 + i * .06 }));
    this.coach = 'Cuando cada tarjeta llegue al círculo, haz el movimiento: desliza o toca la flecha. En «Respira», mantén oprimido.';
  }
  cur(t) { return this.seq.find(s => s.res == null && t <= s.at + (s.e.len ? s.e.len * 2 : 1) * this.beat * .5 + .32); }
  judge(s, ok, q) {
    s.res = ok ? q : 'fallo'; if (ok && q === 'perfecto') { this.perf++; this.score += 10; } else if (ok) { this.goodN++; this.score += 6; } else { this.miss++; this.errors++; }
    this.combo = ok ? this.combo + 1 : 0; this.ani = clamp(this.ani + (ok ? (q === 'perfecto' ? 7 : 4) : -9), 0, 100);
    this.fb = { txt: ok ? (q === 'perfecto' ? '¡PERFECTO!' : '¡BIEN!') : 'FALLO', col: ok ? (q === 'perfecto' ? PAL.vd1 : PAL.cie) : PAL.cor, t: .7 };
    if (ok) Snd.note(this.combo % 8); else Snd.sfx('bad');
  }
  input(k) {
    const t = this.t, s = this.cur(t); if (!s || this.done) return; const d = Math.abs(t - s.at);
    if (d > .32) { if (t < s.at) return; }
    if (s.e.k === 'hold') { if (k === 'tap' || k === 'hold') { this.hold = { s, t0: t }; } else this.judge(s, false); return; }
    if (k !== s.e.k) return this.judge(s, false);
    this.judge(s, true, d < .13 ? 'perfecto' : 'bien');
  }
  release() {
    if (this.hold) { const h = this.hold, need = h.s.e.len * 2 * this.beat * .8, held = this.t - h.t0, d = Math.abs(h.t0 - h.s.at); this.hold = null; if (h.s.res != null) return; this.judge(h.s, held >= need * .55 && d < .4, held >= need * .85 && d < .18 ? 'perfecto' : 'bien'); }
    if (this.sw) { const s = this.sw; this.sw = null; const dx = s.ux - s.x, dy = s.uy - s.y; if (Math.hypot(dx, dy) < 6) this.input('tap'); else this.input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); }
  }
  pointer(type, vx, vy, cx, cy) {
    if (type === 'down') { for (const b of this.btns) if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) { b.fn(); return true; } const s = this.cur(this.t); if (s && s.e.k === 'hold' && Math.abs(this.t - s.at) < .4) { this.input('hold'); return true; } this.sw = { x: cx, y: cy, ux: cx, uy: cy }; return true; }
    if (type === 'up') { if (this.sw) { this.sw.ux = cx; this.sw.uy = cy; } this.release(); }
    return false;
  }
  key(e) { const k = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Space: 'tap', Enter: 'tap' }[e.code]; if (k) { const s = this.cur(this.t); if (s && s.e.k === 'hold' && k === 'tap') { this.input('hold'); if (this.hold) this.hold.auto = true; } else this.input(k); } }
  update(dt) {
    this.tick(dt); const t = this.t;
    const b = Math.floor((t - this.t0) / this.beat); if (b !== this.lastBeat && t >= this.t0 - 3 * this.beat && t < this.tEnd - 1) { this.lastBeat = b; if (!JE.headless && Save.data.settings.sfx) Snd.tone(b % 2 ? 220 : 330, .05, { v: .05 }); }
    if (this.hold) { const need = this.hold.s.e.len * 2 * this.beat * .8; if (this.hold.auto || this.auto != null) { if (t - this.hold.t0 >= need * .95) this.release(); } else if (t - this.hold.t0 > need * 1.6) this.release(); }
    for (const s of this.seq) if (s.res == null && !(this.hold && this.hold.s === s) && t > s.at + (s.e.k === 'hold' ? .45 : .34)) this.judge(s, false);
    if (this.auto != null) for (const s of this.seq) if (s.res == null && !this.hold && t >= s.at - .02 && t < s.at + .1) { if (this.rng.f() < this.auto * .5) { this.input(s.e.k === 'up' ? 'down' : 'up'); } else if (s.e.k === 'hold') { this.input('hold'); } else this.input(s.e.k); break; }
    if (this.fb) { this.fb.t -= dt; if (this.fb.t <= 0) this.fb = null; }
    if (t >= this.tEnd && !this.done) { this.done = true; this.acc = Math.round(100 * (this.perf + this.goodN * .6) / this.seq.length); this.score += Math.round(this.ani / 10); Snd.sfx(this.acc >= 60 ? 'win' : 'ok'); }
    this.min = (this.o.clock0 || 600) + t / 6;
  }
  poseAt(t) {
    let best = null, bd = 1e9; for (const s of this.seq) { const d = t - s.at, w = s.e.len ? s.e.len * 2 * this.beat : this.beat * 1.2; if (d > -this.beat * .9 && d < w && Math.abs(d) < bd) { bd = Math.abs(d); best = s; } }
    if (!best) return poseOf('idle', 'idle', 0); const d = t - best.at, w = best.e.len ? best.e.len * 2 * this.beat : this.beat * .7;
    const f = d < 0 ? clamp(1 + d / (this.beat * .9), 0, 1) : d < w ? 1 : clamp(1 - (d - w) / (this.beat * .5), 0, 1);
    const ps = best.e.pose === 'tap' && Math.floor(t / (this.beat / 2)) % 2 ? 'idle' : best.e.pose; return poseOf('idle', ps, f);
  }
  render(V) {
    const b = V.b, vw = V.vw, { gy } = this.bgStation(V, this.min), k = Math.max(1, Math.min(3, Math.floor(V.vh / 60)));
    prect(b, Math.round(vw * .5) - 22 * k, gy - 2, 44 * k, 3, '#7a8a4a');
    this.crew.forEach((c, i) => drawPose(b, Math.round(vw * (.2 + i * .3)), gy - 16, this.poseAt(this.t - c.lag), c.p, Math.max(1, k - 1)));
    drawPose(b, Math.round(vw * .5), gy + 2, this.poseAt(this.t), Art.me({ uniforme: true }), k);
    const sp = Math.round(vw * .5) + 26 * k; prect(b, sp, gy - 14, 8, 12, '#1d1f24'); pdisc(b, sp + 4, gy - 10, 2, '#59606c'); pdisc(b, sp + 4, gy - 5, 2, '#59606c'); if (Math.floor(this.t / this.beat) % 2) prect(b, sp + 9, gy - 12, 1, 6, PAL.amb);
  }
  hud(V) {
    this.btns = []; const c = V.ctx, y0 = V.top + 34, hx = Math.round(V.w * .2), cw = Math.min(54, V.w / 8), pxs = cw * 2.2 / this.beat;
    V.text('PAUSA ACTIVA · ' + (this.o.st || ''), V.w / 2, V.top + 18, { size: 17, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    c.fillStyle = '#0a2342b0'; c.fillRect(0, y0, V.w, cw + 16);
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(hx, y0 + 8 + cw / 2, cw / 2 + 3, 0, TAU); c.stroke();
    for (const s of this.seq) {
      const x = hx + (s.at - this.t) * pxs; if (x < -cw || x > V.w + cw) continue; const w = s.e.len ? cw + (s.e.len * 2 - 1) * this.beat * pxs * .5 : cw;
      c.globalAlpha = s.res ? .35 : 1; c.fillStyle = s.res === 'fallo' ? PAL.cor : s.res ? PAL.vd2 : s.e.k === 'hold' ? PAL.cie : PAL.vd; c.fillRect(x - cw / 2, y0 + 8, w, cw);
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x - cw / 2 + 1, y0 + 9, w - 2, cw - 2); V.text(s.e.ic, x, y0 + 8 + cw * .7, { size: cw * .55, align: 'center', color: '#0a2342' }); c.globalAlpha = 1;
    }
    const nx = this.cur(this.t); if (nx && this.t < this.tEnd - 1) V.text((this.t < nx.at - this.beat * 2.5 ? 'Luego: ' : 'Ahora: ') + nx.e.name, V.w / 2, y0 + cw + 34, { size: 16, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 5, body: true });
    if (this.t < this.t0) V.text(String(Math.max(1, Math.ceil((this.t0 - this.t) / this.beat / 2))), V.w / 2, V.h * .45, { size: 64, align: 'center', color: PAL.amb, stroke: '#0a2342', sw: 8 });
    if (this.fb) V.text(this.fb.txt, hx, y0 + cw + 64, { size: 22, align: 'center', color: this.fb.col, stroke: '#0a2342', sw: 5 });
    const n = 5, bw = Math.min(70, (V.w - 24) / n - 6), bx = (V.w - n * (bw + 6) + 6) / 2, by = V.h - bw - 18, mw = n * (bw + 6) - 6;
    c.fillStyle = '#0a2342cc'; c.fillRect(bx, by - 30, mw, 10); c.fillStyle = this.ani > 60 ? PAL.vd : PAL.amb; c.fillRect(bx, by - 30, mw * this.ani / 100, 10);
    V.text('Ánimo del grupo' + (this.combo > 2 ? ' · combo ' + this.combo : ''), bx, by - 36, { size: 12, color: '#fff', stroke: '#0a2342', sw: 3, body: true });
    [['◀', 'left'], ['▲', 'up'], ['●', 'tap'], ['▼', 'down'], ['▶', 'right']].forEach(([l, k], i) => this.button(V, bx + i * (bw + 6), by, bw, bw, l, () => { const s = this.cur(this.t); if (k === 'tap' && s && s.e.k === 'hold') this.input('hold'); else this.input(k); }, { bg: k === 'tap' ? PAL.cie : PAL.az1, size: 26, key: k }));
    this.drawPops(V);
  }
  bot(err) { this.auto = err || 0; }
}

class ModePausas extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng, M = JE.map, casa = M.poi.casa;
    this.sim = new StationSim(R, { demand: this.mods.demand });
    this.setupRide({ sim: this.sim, start: { x: casa.x, y: casa.y + 6 * WK } });
    const mans = M.stations.filter(s => s.type === 'm'), c0 = nearestOf(mans, casa.x, casa.y, 6), c = R.pick(c0);
    let L = nearestOf(mans, c.x, c.y, 4), at = casa; const route = []; while (L.length) { L.sort((a, b) => dist(a.x, a.y, at.x, at.y) - dist(b.x, b.y, at.x, at.y)); at = L.shift(); route.push(at); }
    this.accs = []; const hours = [630, 720, 870, 960];
    const tasks = route.map((s, i) => T_ST(s, { label: 'Pausa activa · ' + s.name, due: hours[i] + 25, mg: () => new MGPausa(this, { lvl: i, clock0: this.clock, st: s.name }), after: sc => { this.accs.push(sc.acc | 0); } }));
    this.begin([{ name: 'Turno intermedio: pausas activas', short: 'Pausas activas', from: 540, to: 1080, mgSecs: 34, toast: '🤸 Hoy te esperan ' + route.length + ' estaciones para la pausa activa.', tasks }]);
    const req = () => this.phases[0].tasks;
    this.goal('Haz las ' + route.length + ' pausas activas', true, () => req().every(t => t.done && !t.lost), () => req().filter(t => t.done).length + '/' + route.length);
    this.goal('Todas a tiempo', false, () => req().every(t => t.done && !t.late), () => req().filter(t => t.late).length + ' tarde');
    this.goal('Precisión del grupo ≥ 75 %', false, () => this.accs.length > 0 && this.acc() >= 75, () => this.acc() + '%');
  }
  acc() { return this.accs.length ? Math.round(this.accs.reduce((a, b) => a + b, 0) / this.accs.length) : 0; }
  chips() { return [{ t: '🎵 ' + this.acc() + '%' }]; }
}

/* ---------- RESCATE: llevar una bici con una mano mientras se pedalea ---------- */
class MGHallazgo extends MG {
  constructor(parent, o) { super(parent, o); this.dmg = !!o.dmg; this.min = o.clock0 || 600; this.state = 'ver'; this.fail = this.rng.pick(['Llanta pinchada', 'Cadena rota', 'Freno suelto', 'Sillín partido']); this.coach = 'Revisa la bici y decide a dónde va.'; }
  update(dt) { this.tick(dt); if (this.state === 'ok') { this.k = (this.k || 0) + dt; if (this.k > .5) this.done = true; } }
  pick(to) {
    if (this.state !== 'decide') return; const ok = (to === 'taller') === this.dmg;
    if (ok) { this.good(8, 100, 40, to === 'taller' ? 'Al taller' : 'A la estación'); this.state = 'ok'; this.to = to; } else this.bad(this.dmg ? '¡Está dañada!' : 'Está buena', 100, 40);
  }
  render(V) { const b = V.b, { gy } = this.bgStation(V, this.min), x = Math.round(V.vw * .5); Art.bikeSide(b, x, gy + 6, { r: 5, face: 1, col: PAL.vd }); if (this.state !== 'ver' && this.dmg) { prect(b, x - 14, gy - 2, 3, 3, PAL.cor); } }
  hud(V) {
    this.btns = []; V.text('BICI ENCONTRADA', V.w / 2, V.top + 18, { size: 18, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    const w = Math.min(320, V.w - 30), x = (V.w - w) / 2, y = V.h - 150;
    if (this.state === 'ver') this.button(V, x, y, w, 56, '🔍 Revisar la bici', () => { this.state = 'decide'; }, { bg: PAL.az1, key: 'ver' });
    else if (this.state === 'decide') {
      V.text(this.dmg ? '⚠ ' + this.fail : '✓ Llantas, cadena y frenos bien', V.w / 2, y - 18, { size: 16, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 6, body: true });
      this.button(V, x, y, w / 2 - 4, 56, 'A la estación', () => this.pick('estacion'), { bg: PAL.vd2, size: 15, key: 'est' }); this.button(V, x + w / 2 + 4, y, w / 2 - 4, 56, 'Al taller', () => this.pick('taller'), { bg: PAL.cor, size: 15, key: 'tal' });
    }
    this.drawPops(V);
  }
  bot(err) { if (this.state === 'ver') this.state = 'decide'; else if (this.state === 'decide') this.pick((this.rng.f() < err) !== this.dmg ? 'taller' : 'estacion'); }
}
class ModeRescate extends ShiftMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng, M = JE.map;
    this.sim = new StationSim(R, { demand: this.mods.demand });
    const c = R.pick(M.stations.filter(s => s.zone === R.pick(['centro', 'centro', 'sur', 'norte'])));
    this.zs = nearestOf(M.stations, c.x, c.y, 12); this.setupRide({ sim: this.sim, start: { x: c.x, y: c.y + 10 * WK } });
    this.carry = null; this.th = 0; this.tv = 0; this.push = 0; this.falls = 0; this.saved = 0; this.lastA = this.ride.p.a; this.pushT = 0;
    const first = [0, 1, 2].map(() => this.lost()).filter(Boolean);
    this.begin([{ name: 'Turno de rescate', short: 'Rescate', from: 480, to: 1020, timed: true, secs: 200, tasks: first, spawn: () => this.lost(), every: 26, maxDyn: 2 }]);
    this.goal('Rescata 5 bicis', true, () => this.saved >= 5, () => this.saved + '/5');
    this.goal('Máximo 1 caída', false, () => this.falls <= 1, () => this.falls + ' caídas');
    this.goal('Cada bici a su lugar', false, () => this.saved > 0 && this.mgErr === 0, () => this.mgErr + ' errores');
    this.coach = 'Ve por la bici reportada. Con una mano en el manubrio: ◀ ▶ para no perder el equilibrio.';
  }
  lost() {
    const R = this.rng, M = JE.map, s = R.pick(this.zs), a = R.f() * TAU, o = M.nearestOpen(Math.floor(s.x / TS + Math.cos(a) * R.range(6, 14)), Math.floor(s.y / TS + Math.sin(a) * R.range(6, 14)), false);
    const dmg = R.f() < .4, where = R.pick(['en un parque', 'en una esquina', 'frente a una tienda', 'en un andén', 'reportada por la Policía']);
    return { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2, label: 'Bici ' + where, col: PAL.cor, pts: 10, due: Math.round(this.clock + 140), grace: 60,
      can: (t, quiet) => { if (!this.carry) return true; if (!quiet) JE.ui && JE.ui.toast('Ya llevas una bici: entrégala primero'); return false; },
      mg: () => new MGHallazgo(this, { dmg, clock0: this.clock }), after: s2 => this.pickUp(s2.to || 'estacion') };
  }
  pickUp(to) {
    const M = JE.map, P = this.ride.p; this.th = 0; this.tv = 0;
    const near = L => L.slice().sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y))[0], mz = this.zs.filter(s => s.type === 'm'), dest = to === 'taller' ? near(mz.length ? mz : M.stations.filter(s => s.type === 'm')) : near(this.zs);
    this.carry = { to, dest };
    this.dropT = this.addTask({ x: dest.x, y: dest.y, r: 22, label: to === 'taller' ? 'Dejar dañada en ' + dest.name + ' (va al taller)' : 'Entregar en EnCicla ' + dest.name, col: to === 'taller' ? PAL.cor : PAL.vd, pts: 15, after: () => this.delivered() });
    this.retarget();
  }
  delivered() { const dmg = this.carry && this.carry.to === 'taller'; this.carry = null; this.saved++; Snd.fanfare && Snd.fanfare(); this.ride.stamp = { t: 1.6, title: '¡BICI RESCATADA!', sub: dmg ? 'Queda marcada para que Balance la lleve al taller' : 'De vuelta en su estación', bg: PAL.vd }; }
  fall() {
    const R = this.ride; this.falls++; this.score -= 10; R.p.v = 0; this.th = 0; this.tv = 0; Snd.sfx('lose'); vib(80); R.float('¡Se cayó!', PAL.cor);
    if (this.carry.to !== 'taller') { const t = this.dropT; t.done = true; this.ride.removeMarker(t.m); this.pickUp('taller'); JE.ui && JE.ui.toast('La bici se dañó al caer: déjala en una estación con anfitrión para que vaya al taller'); }
  }
  tick(dt) {
    super.tick(dt); const R = this.ride, P = R.p;
    if (this.carry && P.veh === 'bike') {
      let da = P.a - this.lastA; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; const turn = da / Math.max(dt, 1e-3), vr = clamp(P.v / (60 * WK), 0, 1.4), v = R.tileAt();
      const rough = v === TT.BRICK || v === TT.STEPS || v === TT.GRASS ? 2.2 : 1, sl = Math.min(0, R.sl || 0);
      const noise = (this.rng.f() - .5) * 2 * (.6 + vr) * rough;
      this.pushT -= dt; if (this.pushT <= 0 && this.keyPush) this.keyPush = 0; const push = this.push || this.keyPush || 0;
      this.tv += (noise * 2.4 + turn * .9 * vr - sl * 9 * Math.sign(this.th || 1) + push * 4.2) * dt; this.tv -= this.th * (.6 + 1.2 * clamp(vr, .2, 1)) * dt; this.tv *= .985; this.th += this.tv * dt;
      if (Math.abs(this.th) > 1) this.fall();
    } else { this.th *= .9; this.tv = 0; }
    this.lastA = P.a;
    if (this.auto != null && this.carry) this.push = Math.abs(this.th) > .12 ? -Math.sign(this.th) : (Math.abs(this.tv) > .5 ? -Math.sign(this.tv) : 0);
  }
  speedMul() { return this.carry ? .72 : 1; }
  key(e) { super.key(e); if (!this.carry) return; if (e.code === 'KeyA' || e.code === 'KeyQ') { this.keyPush = -1; this.pushT = .25; } if (e.code === 'KeyD' || e.code === 'KeyE') { this.keyPush = 1; this.pushT = .25; } }
  leanRects(V) { const s = 58, y = Math.round(V.h * .5 - s / 2); return [{ x: 8, y, w: s, h: s, d: -1 }, { x: V.w - s - 8, y, w: s, h: s, d: 1 }]; }
  pointer(type, vx, vy, cx, cy) {
    if (this.carry && !this.sub && this._V) { if (type === 'down') for (const r of this.leanRects(this._V)) if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) { this.push = r.d; return true; } if (type === 'up') this.push = 0; }
    return super.pointer(type, vx, vy, cx, cy);
  }
  hud2(V) {
    super.hud2(V); this._V = V; if (!this.carry || this.sub) return; const c = V.ctx, w = Math.min(150, V.w * .4), x = (V.w - w) / 2, y = Math.round(V.h * .5) - 78;
    c.fillStyle = '#0a2342cc'; c.fillRect(x - 6, y - 6, w + 12, 24); c.fillStyle = '#ff6b5a55'; c.fillRect(x, y, w * .12, 12); c.fillRect(x + w * .88, y, w * .12, 12); c.fillStyle = PAL.vd2; c.fillRect(x + w * .4, y, w * .2, 12);
    c.fillStyle = Math.abs(this.th) > .7 ? PAL.cor : '#fff'; c.fillRect(x + w / 2 + this.th * w / 2 - 3, y - 3, 6, 18); V.text('Equilibrio', V.w / 2, y - 10, { size: 12, align: 'center', color: '#fff', stroke: '#0a2342', sw: 3, body: true });
    for (const r of this.leanRects(V)) this.button(V, r.x, r.y, r.w, r.h, r.d < 0 ? '◀' : '▶', () => { }, { bg: this.push === r.d ? PAL.vd2 : '#0a2342aa', size: 24 });
  }
  chips() { return [{ t: '🚲 ' + this.saved + ' rescatadas' }].concat(this.carry ? [{ t: 'Llevas una bici', c: Math.abs(this.th) > .7 ? 'bad' : 'warn' }] : []); }
  bot(err) { this.auto = err || 0; super.bot(err); }
}
/* la bici que llevas con la otra mano */
const _rt72 = Ride.prototype.renderTop;
Ride.prototype.renderTop = function (V) {
  _rt72.call(this, V); const M = this.mode; if (!M.carry || M.sub || this.p.veh !== 'bike') return;
  const c = V.ctx, k = V.s * V.dpr, P = this.p, a = P.a, ox = this.cxf, oy = this.cyf, off = 5 * WK, side = a + Math.PI / 2;
  c.save(); c.setTransform(k, 0, 0, k, 0, 0); c.imageSmoothingEnabled = false; c.translate(P.x + Math.cos(side) * off - ox, P.y + Math.sin(side) * off - oy); c.rotate(a + Math.PI / 2 + M.th * .5);
  blit(c, Art.bikeTop()); c.restore();
};

/* ---------- TÉCNICO: tótem (medir, cambiar la pieza y reiniciar) ---------- */
const TOTEM_P = [['Fuente 12 V', '12.1 V', '0.0 V', 'Fuente nueva'], ['Fusible', 'Continuidad ✓', 'Sin continuidad', 'Fusible de 5 A'], ['Tarjeta 5 V', '5.0 V', '0.3 V', 'Tarjeta de control'], ['Pantalla', 'Señal ✓', 'Sin señal', 'Cable de pantalla']];
class MGTotem extends MG {
  constructor(parent, o) { super(parent, o); this.f = this.rng.i(0, 3); this.meas = []; this.state = 'medir'; this.pp = 0; this.holding = false; this.min = o.clock0 || 600; this.parts = this.rng.shuffle([this.f, (this.f + 1 + this.rng.i(0, 2)) % 4].concat([(this.f + 2) % 4]).filter((v, i, a) => a.indexOf(v) === i)); this.coach = 'Mide cada punto con el multímetro hasta encontrar la falla.'; }
  measure(i) { if (this.state !== 'medir' || this.meas.includes(i)) return; this.meas.push(i); Snd.sfx('tap'); if (i === this.f) { this.state = 'pieza'; this.coach = 'Encontraste la falla: elige el repuesto correcto.'; Snd.sfx('spark'); } else this.score += 1; }
  part(j) { if (this.state !== 'pieza') return; if (j === this.f) { this.good(6, 100, 40, 'Pieza cambiada'); this.state = 'reinicio'; this.coach = 'Mantén oprimido el botón de encendido y suéltalo en la zona verde.'; } else this.bad('No es esa pieza', 100, 40); }
  release() { if (this.state !== 'reinicio' || !this.holding) return; this.holding = false; if (this.pp >= .62 && this.pp <= .86) { this.state = 'ok'; this.k = 0; this.good(8, 100, 40, '¡Encendió!'); } else { this.bad(this.pp < .62 ? 'Muy pronto' : 'Muy tarde', 100, 40); this.pp = 0; } }
  update(dt) {
    this.tick(dt); if (this.state === 'reinicio') { if (this.holding) { this.pp = Math.min(1.05, this.pp + dt / 2.2); if (this.auto != null && this.pp >= this.autoAt) this.release(); else if (this.pp >= 1.05) this.release(); } else this.pp = Math.max(0, this.pp - dt); }
    if (this.state === 'ok') { this.k += dt; if (this.k > .9) { this.done = true; Snd.sfx('win'); } }
  }
  render(V) {
    const b = V.b, { gy } = this.bgStation(V, this.min), x = Math.round(V.vw * .5) - 14, h = 52;
    prect(b, x, gy - h, 28, h, '#2b2f38'); prect(b, x + 2, gy - h + 2, 24, 14, this.state === 'ok' ? PAL.vd : '#0e1726'); if (this.state === 'ok') { prect(b, x + 6, gy - h + 7, 16, 3, '#fff'); }
    prect(b, x + 3, gy - h + 20, 22, 26, '#11161f'); const cols = ['#e8b93f', '#d6dde6', PAL.vd, PAL.cie]; for (let i = 0; i < 4; i++) { prect(b, x + 5 + (i % 2) * 10, gy - h + 22 + (i >> 1) * 12, 8, 9, this.meas.includes(i) && i === this.f ? PAL.cor : cols[i]); }
    prect(b, x + 30, gy - 24, 12, 16, '#e8b93f'); prect(b, x + 32, gy - 22, 8, 5, '#9ec2a0'); pline(b, x + 36, gy - 8, x + 20, gy - h + 30, PAL.cor);
  }
  hud(V) {
    this.btns = []; V.text('REPARA EL TÓTEM', V.w / 2, V.top + 18, { size: 19, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    const w = Math.min(360, V.w - 24), x = (V.w - w) / 2, y = V.h - 190;
    if (this.state === 'medir') {
      TOTEM_P.forEach((q, i) => { const m = this.meas.includes(i); this.button(V, x + (i % 2) * (w / 2 + 4), y + (i >> 1) * 62, w / 2 - 4, 56, q[0] + (m ? ' · ' + (i === this.f ? q[2] : q[1]) : ''), () => this.measure(i), { bg: m ? (i === this.f ? PAL.cor : PAL.vd2) : PAL.az1, size: 13, key: 'm' + i }); });
    } else if (this.state === 'pieza') {
      V.text('Falla: ' + TOTEM_P[this.f][0] + ' (' + TOTEM_P[this.f][2] + ')', V.w / 2, V.top + 46, { size: 15, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 5, body: true });
      this.parts.forEach((j, i) => this.button(V, x, y + i * 60, w, 54, TOTEM_P[j][3], () => this.part(j), { bg: PAL.az1, size: 15, key: 'p' + j }));
    } else if (this.state === 'reinicio') {
      const bw = w, c = V.ctx; c.fillStyle = '#0a2342cc'; c.fillRect(x, y, bw, 18); c.fillStyle = PAL.vd2; c.fillRect(x + bw * .62, y, bw * .24, 18); c.fillStyle = '#fff'; c.fillRect(x + bw * Math.min(1, this.pp) - 2, y - 4, 4, 26);
      this.button(V, x + w / 2 - 70, y + 40, 140, 70, '⏻ Mantener', () => { this.holding = true; }, { bg: this.holding ? PAL.vd2 : PAL.az1, size: 18, key: 'pw' });
    }
    this.drawPops(V);
  }
  bot(err) { this.auto = err || 0; if (this.state === 'medir') this.measure(this.rng.f() < err ? this.rng.i(0, 3) : this.f); else if (this.state === 'pieza') this.part(this.rng.f() < err ? this.rng.pick(this.parts) : this.f); else if (this.state === 'reinicio' && !this.holding) { this.holding = true; this.autoAt = this.rng.f() < err ? .5 : .74; } }
}
/* ---------- TÉCNICO: luces de los anclajes (prueba, marca, suelda) ---------- */
class MGLeds extends MG {
  constructor(parent, o) { super(parent, o); this.n = 8; const R = this.rng; this.badSet = R.shuffle([...Array(this.n).keys()]).slice(0, 2 + R.i(0, 1)); this.marked = []; this.state = 'prueba'; this.k = 0; this.cur = 0; this.min = o.clock0 || 600; this.coach = 'Mira la prueba de luces: ¿qué anclajes no encienden?'; }
  update(dt) {
    this.tick(dt); this.k += dt;
    if (this.state === 'prueba' && this.k > this.n * .28 + .4) { this.state = 'marcar'; this.coach = 'Toca los anclajes que no encendieron.'; }
    if (this.state === 'soldar') { this.ph = (this.ph || 0) + dt * (2.2 + this.cur * .3); if (this.auto != null && Math.abs(Math.sin(this.ph)) < .1) this.solder(this.rng.f() < this.auto * .5); }
    if (this.state === 'final' && this.k > this.n * .2 + .5) { this.done = true; Snd.sfx('win'); }
  }
  mark(i) { if (this.state !== 'marcar' || this.marked.includes(i)) return; if (this.badSet.includes(i)) { this.marked.push(i); this.score += 3; Snd.sfx('coin'); if (this.marked.length === this.badSet.length) { this.state = 'soldar'; this.cur = 0; this.ph = 0; this.coach = 'Suelda cada módulo nuevo: toca «Soldar» cuando la aguja esté en el centro.'; } } else this.bad('Ese sí enciende', 100, 40); }
  solder(force) { if (this.state !== 'soldar') return; const d = Math.abs(Math.sin(this.ph)); if (!force && d < .22) { this.good(5, 100, 40, 'Soldado'); this.cur++; this.ph = Math.PI / 2; if (this.cur >= this.badSet.length) { this.state = 'final'; this.k = 0; this.coach = 'Prueba final: ¡todas en verde!'; } } else { this.bad('Soldadura fría', 100, 40); this.ph = Math.PI / 2; } }
  lit(i) { if (this.state === 'prueba') return i <= Math.floor(this.k / .28) && !this.badSet.includes(i); if (this.state === 'final') return i <= Math.floor(this.k / .2); return !this.badSet.includes(i) || (this.state === 'soldar' && this.badSet.indexOf(i) < this.cur); }
  dock(V, i) { const vw = V.vw, gap = Math.floor((vw - 20) / this.n); return { x: 10 + i * gap + Math.floor(gap / 2), gap }; }
  render(V) {
    const b = V.b, { gy } = this.bgStation(V, this.min);
    for (let i = 0; i < this.n; i++) { const { x } = this.dock(V, i); prect(b, x - 2, gy - 22, 5, 22, '#9aa7b8'); prect(b, x - 3, gy - 24, 7, 3, '#59606c'); const on = this.lit(i); prect(b, x - 1, gy - 19, 3, 3, on ? PAL.vd1 : this.badSet.includes(i) && this.state === 'prueba' && Math.floor(this.t * 8) % 3 === 0 ? PAL.cor : '#1d1f24'); if (this.marked.includes(i)) prect(b, x - 3, gy + 2, 7, 2, PAL.amb); }
  }
  hud(V) {
    this.btns = []; V.text('LUCES DE LOS ANCLAJES', V.w / 2, V.top + 18, { size: 18, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    if (this.state === 'marcar') for (let i = 0; i < this.n; i++) { const { x, gap } = this.dock(V, i), bw = Math.max(26, gap * V.s - 6); this.button(V, x * V.s - bw / 2, V.h * .7, bw, 46, String(i + 1), () => this.mark(i), { bg: this.marked.includes(i) ? PAL.amb : PAL.az1, size: 15, key: 'd' + i }); }
    if (this.state === 'soldar') {
      const w = Math.min(300, V.w - 40), x = (V.w - w) / 2, y = V.h * .62, c = V.ctx; c.fillStyle = '#0a2342cc'; c.fillRect(x, y, w, 18); c.fillStyle = PAL.vd2; c.fillRect(x + w * .39, y, w * .22, 18); c.fillStyle = '#fff'; c.fillRect(x + w / 2 + Math.sin(this.ph) * w / 2 - 2, y - 4, 4, 26);
      V.text('Módulo ' + (this.cur + 1) + ' de ' + this.badSet.length, V.w / 2, y - 12, { size: 14, align: 'center', color: '#fff', body: true });
      this.button(V, V.w / 2 - 80, y + 36, 160, 60, '🔥 Soldar', () => this.solder(), { bg: PAL.cor, size: 18, key: 'sol' });
    }
    this.drawPops(V);
  }
  bot(err) { this.auto = err || 0; if (this.state === 'marcar') { const L = this.badSet.filter(i => !this.marked.includes(i)); this.mark(this.rng.f() < err * .5 ? this.rng.i(0, this.n - 1) : L[0]); } }
}
/* ---------- TÉCNICO: celular de la estación (cargar, reiniciar, PIN y sincronizar) ---------- */
class MGCelular extends MG {
  constructor(parent, o) { super(parent, o); this.state = 'cargar'; this.bat = 3; this.k = 0; this.hp = 0; this.holding = false; this.pin = String(this.rng.i(1000, 9999)); this.inp = ''; this.min = o.clock0 || 600; this.coach = 'El celular de la estación se apagó: conéctale el power bank.'; }
  update(dt) {
    this.tick(dt); this.k += dt;
    if (this.state === 'carga') { this.bat = Math.min(40, this.bat + dt * 40); if (this.bat >= 40) { this.state = 'reiniciar'; this.coach = 'Mantén oprimido el botón de encendido hasta que vibre.'; } }
    if (this.state === 'reiniciar') { if (this.holding) { this.hp += dt / 1.4; if (this.hp >= 1) { this.holding = false; this.state = 'pin'; this.k = 0; vib(60); this.coach = 'Memoriza el PIN de la tula y escríbelo.'; } } else this.hp = Math.max(0, this.hp - dt * 2); }
    if (this.state === 'sync' && this.k > 1) { this.done = true; Snd.sfx('win'); }
  }
  showPin() { return this.state === 'pin' && this.k < 2.2; }
  digit(d) { if (this.state !== 'pin' || this.showPin()) return; this.inp += d; Snd.sfx('tap'); if (this.pin.startsWith(this.inp)) { if (this.inp === this.pin) { this.good(8, 100, 40, 'Sesión iniciada'); this.state = 'sync0'; this.coach = 'Sincroniza el inventario de la estación.'; } } else { this.bad('PIN incorrecto', 100, 40); this.inp = ''; this.k = 0; } }
  release() { this.holding = false; }
  render(V) {
    const b = V.b; prect(b, 0, 0, V.vw, V.vh, '#1b2433'); const w = 40, h = 70, x = Math.round(V.vw / 2 - w / 2), y = Math.round(V.vh * .5 - h / 2) - 4;
    prect(b, x, y, w, h, '#11161f'); prect(b, x + 3, y + 6, w - 6, h - 14, this.state === 'cargar' || this.state === 'carga' || this.state === 'reiniciar' ? '#05080d' : '#e8f4d0');
    prect(b, x + w - 12, y + 9, 7, 4, '#fff'); prect(b, x + w - 11, y + 10, Math.max(1, Math.round(5 * this.bat / 100)), 2, this.bat < 20 ? PAL.cor : PAL.vd);
    if (this.state === 'sync0' || this.state === 'sync') { prect(b, x + 6, y + 18, w - 12, 4, PAL.vd); for (let i = 0; i < 4; i++) prect(b, x + 6, y + 26 + i * 6, (w - 12) * (this.state === 'sync' ? Math.min(1, this.k) : .3), 3, PAL.az3); }
    if (this.state === 'carga' || this.bat > 3) { prect(b, x + w / 2 - 2, y + h, 4, 10, '#d6dde6'); prect(b, x + w / 2 - 9, y + h + 10, 18, 9, '#2b2f38'); }
  }
  hud(V) {
    this.btns = []; V.text('CELULAR DE LA ESTACIÓN', V.w / 2, V.top + 18, { size: 18, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    const w = Math.min(300, V.w - 30), x = (V.w - w) / 2, y = V.h - 140;
    if (this.state === 'cargar') this.button(V, x, y, w, 60, '🔌 Conectar power bank', () => { this.state = 'carga'; Snd.sfx('coin'); }, { bg: PAL.az1, size: 16, key: 'pb' });
    else if (this.state === 'reiniciar') { const c = V.ctx; c.fillStyle = '#0a2342cc'; c.fillRect(x, y - 26, w, 12); c.fillStyle = PAL.vd; c.fillRect(x, y - 26, w * this.hp, 12); this.button(V, x + w / 2 - 70, y, 140, 64, '⏻ Mantener', () => { this.holding = true; }, { bg: this.holding ? PAL.vd2 : PAL.az1, size: 18, key: 'pw' }); }
    else if (this.state === 'pin') {
      const py = Math.max(V.h * .26, V.top + 56); if (this.showPin()) V.text('PIN de la tula: ' + this.pin.split('').join(' '), V.w / 2, py, { size: 22, align: 'center', color: PAL.amb, bg: '#0a2342ee', pad: 8 });
      else { V.text('PIN: ' + (this.inp.padEnd(4, '·')), V.w / 2, py, { size: 22, align: 'center', color: '#fff', bg: '#0a2342ee', pad: 8 }); const kw = Math.min(64, (V.w - 40) / 5), ky = V.h - kw * 2 - 30; '1234567890'.split('').forEach((d, i) => this.button(V, V.w / 2 - kw * 2.5 + (i % 5) * kw, ky + Math.floor(i / 5) * (kw + 4), kw - 4, kw, d, () => this.digit(d), { bg: PAL.az1, size: 20, key: 'k' + d })); }
    } else if (this.state === 'sync0') this.button(V, x, y, w, 60, '🔄 Sincronizar inventario', () => { this.state = 'sync'; this.k = 0; this.score += 4; }, { bg: PAL.vd2, size: 16, key: 'sy' });
    this.drawPops(V);
  }
  bot(err) {
    if (this.state === 'cargar') { this.state = 'carga'; } else if (this.state === 'reiniciar') this.holding = true;
    else if (this.state === 'pin' && !this.showPin()) this.digit(this.rng.f() < err * .4 ? String((+this.pin[this.inp.length] + 1) % 10) : this.pin[this.inp.length]);
    else if (this.state === 'sync0') { this.state = 'sync'; this.k = 0; }
  }
}
/* el aviso de ayuda va encima de los botones de cada minijuego */
const coachAt = (C, f) => Object.defineProperty(C.prototype, 'coachB', { get: f, configurable: true });
coachAt(MGPausa, () => Math.min(70, (View.w - 24) / 5 - 6) + 62);
coachAt(MGTotem, function () { return this.state === 'pieza' ? 200 : this.state === 'medir' ? 200 : 130; });
coachAt(MGCelular, function () { return this.state === 'pin' ? Math.min(64, (View.w - 40) / 5) * 2 + 44 : 150; });
coachAt(MGHallazgo, () => 160);
coachAt(MGRutina, () => 104);
/* fallas del técnico con los minijuegos nuevos */
ModeTecnicoR.prototype.falla = function () {
  const R = this.rng, ok = this.zs.filter(s => !s.broken), s = R.pick(ok); if (!s) return null; s.broken = true;
  const k = s.type === 'm' && R.f() < .35 ? 'cel' : R.f() < .5 ? 'totem' : 'led', fin = () => { s.broken = false; this.fixed++; };
  const mg = k === 'totem' ? () => new MGTotem(this, { clock0: this.clock }) : k === 'led' ? () => new MGLeds(this, { clock0: this.clock }) : () => new MGCelular(this, { clock0: this.clock });
  return T_ST(s, { label: { totem: 'Tótem apagado', led: 'Luces de los anclajes', cel: 'Celular de la estación' }[k] + ' · ' + s.name, due: Math.round(this.clock + this.rate * 50), grace: this.rate * 20, col: PAL.cor, mg, after: fin, onLost: () => { s.broken = false; } });
};
Object.assign(MODE_CLASS, { pausas: ModePausas, rescate: ModeRescate });
