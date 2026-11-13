/* =====================================================================
   MINIJUEGOS v0.4 — inspirados en clásicos de puzzle/arcade:
   Circuito (rotar piezas) · Señal láser (espejos) · Semaforero (dirigir el tránsito)
   Desvíos (bandas con cambios) · Maquinista (Easter egg: trenes y cambios) · Laberinto (Easter egg)
   ===================================================================== */
const rotM = m => ((m << 1) | (m >> 3)) & 15; // N=1 E=2 S=4 W=8, giro horario
const DIRS4 = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]]; // dx, dy, bit propio, bit vecino

/* ---------- CIRCUITO: gira las piezas hasta que no quede ningún cable suelto ---------- */
class MGLoop extends MG {
  constructor(parent, o) {
    super(parent, o); const n = o.n || 4; this.W = n; this.H = n; this.min = o.clock0 || 600;
    // árbol que cubre toda la cuadrícula (siempre tiene solución)
    const sol = new Array(n * n).fill(0), seen = new Array(n * n).fill(false), st = [this.rng.i(0, n * n - 1)]; seen[st[0]] = true;
    while (st.length) {
      const c = st[st.length - 1], x = c % n, y = (c / n) | 0, opts = DIRS4.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]; });
      if (!opts.length) { st.pop(); continue; }
      const [dx, dy, b, nb] = this.rng.pick(opts), j = (y + dy) * n + x + dx; sol[c] |= b; sol[j] |= nb; seen[j] = true; st.push(j);
    }
    this.sol = sol; this.m = sol.map(v => { let r = v; for (let k = this.rng.i(1, 3); k > 0; k--) r = rotM(r); return r; });
    this.src = 0; this.spin = new Array(n * n).fill(0); this.moves = 0;
    if (this.solved()) this.m[1] = rotM(this.m[1]);
    this.coach = 'Toca las piezas para girarlas: conecta TODOS los cables sin dejar puntas sueltas.';
  }
  solved() { const n = this.W; for (let i = 0; i < n * n; i++) { const x = i % n, y = (i / n) | 0; for (const [dx, dy, b, nb] of DIRS4) { const has = this.m[i] & b, nx = x + dx, ny = y + dy; const other = nx >= 0 && ny >= 0 && nx < n && ny < n ? this.m[ny * n + nx] & nb : 0; if (!!has !== !!other) return false; } } return true; }
  powered() { const n = this.W, on = new Array(n * n).fill(false), q = [this.src]; on[this.src] = true; while (q.length) { const i = q.pop(), x = i % n, y = (i / n) | 0; for (const [dx, dy, b, nb] of DIRS4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue; const j = ny * n + nx; if (!on[j] && (this.m[i] & b) && (this.m[j] & nb)) { on[j] = true; q.push(j); } } } return on; }
  turn(i) { if (this.done || this.endT) return; this.m[i] = rotM(this.m[i]); this.spin[i] = 1; this.moves++; if (Save.data.settings.sfx && !JE.headless) Snd.tone(520 + (i % 5) * 60, .05, { v: .05 }); if (this.solved()) { this.endT = .7; this.score += Math.max(6, 30 - this.moves); Snd.sfx('win'); } }
  update(dt) { this.tick(dt); for (let i = 0; i < this.spin.length; i++) this.spin[i] = Math.max(0, this.spin[i] - dt * 6); if (this.endT) { this.endT -= dt; if (this.endT <= 0) this.done = true; } }
  geo() { const L = this.L || { vw: 200, vh: 150 }, cs = Math.floor(Math.min((L.vw - 20) / this.W, (L.vh - 50) / this.H)); return { cs, x0: Math.floor((L.vw - cs * this.W) / 2), y0: Math.floor((L.vh - cs * this.H) / 2) + 8 }; }
  render(V) {
    const b = V.b; this.L = { vw: V.vw, vh: V.vh }; prect(b, 0, 0, V.vw, V.vh, '#141c2b');
    const { cs, x0, y0 } = this.geo(), on = this.powered(), solved = this.endT > 0;
    for (let i = 0; i < this.m.length; i++) {
      const x = x0 + (i % this.W) * cs, y = y0 + ((i / this.W) | 0) * cs, m = this.m[i], col = solved ? PAL.vd1 : on[i] ? PAL.vd : '#5d6c9a', h = cs >> 1, t = Math.max(2, cs >> 3);
      prect(b, x + 1, y + 1, cs - 2, cs - 2, '#1d2840'); if (this.spin[i] > 0) prect(b, x + 1, y + 1, cs - 2, cs - 2, '#2a3a5a');
      if (m & 1) prect(b, x + h - (t >> 1), y, t, h, col); if (m & 4) prect(b, x + h - (t >> 1), y + h, t, h, col);
      if (m & 8) prect(b, x, y + h - (t >> 1), h, t, col); if (m & 2) prect(b, x + h, y + h - (t >> 1), h, t, col);
      const deg = [1, 2, 4, 8].filter(k => m & k).length; if (deg === 1) pdisc(b, x + h, y + h, Math.max(2, cs >> 3), i === this.src ? PAL.amb : col); else prect(b, x + h - t, y + h - t, t * 2, t * 2, col);
    }
  }
  hud(V) { this.btns = []; V.text('CIRCUITO DEL TÓTEM', V.w / 2, V.top + 18, { size: 20, align: 'center', color: PAL.vd1 }); V.text('Giros: ' + this.moves, V.w / 2, 92, { size: 13, align: 'center', color: '#c4ec7c', body: true }); this.drawPops(V); }
  tap(vx, vy) { const { cs, x0, y0 } = this.geo(), gx = Math.floor((vx - x0) / cs), gy = Math.floor((vy - y0) / cs); if (gx < 0 || gy < 0 || gx >= this.W || gy >= this.H) return false; this.turn(gy * this.W + gx); return true; }
  hint(V) { const i = this.m.findIndex((m, k) => m !== this.sol[k]); if (i < 0 || this.moves > 3) return null; const { cs, x0, y0 } = this.geo(); return { x: (x0 + (i % this.W) * cs + cs / 2) * V.s, y: (y0 + ((i / this.W) | 0) * cs + cs / 2) * V.s }; }
  bot() { if (this.endT) return; for (let i = 0; i < this.m.length; i++) if (this.m[i] !== this.sol[i]) { const s = this.sol[i]; if (s === 5 || s === 10) { if (this.m[i] === s) continue; } this.turn(i); return; } }
}

/* ---------- SEÑAL LÁSER: gira los espejos para llevar la señal al receptor ---------- */
class MGLaser extends MG {
  constructor(parent, o) {
    super(parent, o); const n = o.n || 5; this.n = n; this.min = o.clock0 || 600; this.turns = o.turns || 3;
    for (let tries = 0; tries < 80 && !this.ok; tries++) this.gen();
    this.coach = 'Toca los espejos para girarlos: lleva el rayo desde la antena hasta el receptor de la estación.';
  }
  gen() {
    const n = this.n, R = this.rng, cell = new Array(n * n).fill(0); // 0 vacío, 1 '/', 2 '\', 3 bloque
    let x = 0, y = R.i(0, n - 1), d = 1; this.sy = y; const used = new Set([y * n]), sol = [];
    for (let t = 0; t < this.turns; t++) {
      const steps = R.i(1, 2); for (let s = 0; s < steps; s++) { x += DIRS4[d][0]; y += DIRS4[d][1]; if (x < 0 || y < 0 || x >= n || y >= n || used.has(y * n + x)) return; used.add(y * n + x); }
      const nd = R.f() < .5 ? (d + 1) % 4 : (d + 3) % 4, m = ((d === 1 || d === 3) ? (nd === 0 ? 1 : 2) : (nd === 1 ? 1 : 2)) ;
      // con '/' : E->N, N->E, W->S, S->W ; con '\' : E->S, S->E, W->N, N->W
      const slash = (d === 1 && nd === 0) || (d === 0 && nd === 1) || (d === 3 && nd === 2) || (d === 2 && nd === 3);
      cell[y * n + x] = slash ? 1 : 2; sol.push(y * n + x); d = nd; void m;
    }
    for (let s = 0; s < 2; s++) { x += DIRS4[d][0]; y += DIRS4[d][1]; if (x < 0 || y < 0 || x >= n || y >= n || used.has(y * n + x)) return; used.add(y * n + x); }
    this.tx = x; this.ty = y; this.sol = cell.slice();
    for (let k = 0; k < 3; k++) { const c = R.i(0, n * n - 1); if (!used.has(c)) cell[c] = R.f() < .7 ? R.i(1, 2) : 3; }
    for (const c of sol) if (R.f() < .8) cell[c] = cell[c] === 1 ? 2 : 1;
    this.cell = cell; this.ok = true; if (this.trace().hit) { const c = sol[0]; this.cell[c] = this.cell[c] === 1 ? 2 : 1; }
  }
  trace() {
    const n = this.n, pts = []; let x = 0, y = this.sy, d = 1, hit = false; pts.push([-1, y]);
    for (let k = 0; k < 60; k++) {
      if (x < 0 || y < 0 || x >= n || y >= n) break; pts.push([x, y]);
      if (x === this.tx && y === this.ty) { hit = true; break; }
      const c = this.cell[y * n + x]; if (c === 3) break;
      if (c === 1) d = [1, 0, 3, 2][d]; else if (c === 2) d = [3, 2, 1, 0][d];
      x += DIRS4[d][0]; y += DIRS4[d][1];
    }
    if (!hit) pts.push([x, y]); return { pts, hit };
  }
  flip(i) { if (this.endT || !this.cell || this.cell[i] === 0 || this.cell[i] === 3) return; this.cell[i] = this.cell[i] === 1 ? 2 : 1; Snd.sfx('tap'); if (this.trace().hit) { this.endT = .8; this.score += 20; Snd.sfx('win'); } }
  update(dt) { this.tick(dt); if (this.endT) { this.endT -= dt; if (this.endT <= 0) this.done = true; } if (!this.ok) this.done = true; }
  geo() { const L = this.L || { vw: 200, vh: 150 }, cs = Math.floor(Math.min((L.vw - 40) / this.n, (L.vh - 50) / this.n)); return { cs, x0: Math.floor((L.vw - cs * this.n) / 2), y0: Math.floor((L.vh - cs * this.n) / 2) + 8 }; }
  render(V) {
    const b = V.b; this.L = { vw: V.vw, vh: V.vh }; prect(b, 0, 0, V.vw, V.vh, '#10172a'); if (!this.cell) return;
    const { cs, x0, y0 } = this.geo(), n = this.n, cx = (gx) => x0 + gx * cs + cs / 2, cy = gy => y0 + gy * cs + cs / 2;
    for (let i = 0; i < n * n; i++) { const x = x0 + (i % n) * cs, y = y0 + ((i / n) | 0) * cs, c = this.cell[i]; prect(b, x + 1, y + 1, cs - 2, cs - 2, '#1a2440'); if (c === 3) prect(b, x + 3, y + 3, cs - 6, cs - 6, '#59606c'); if (c === 1) pline(b, x + 3, y + cs - 4, x + cs - 4, y + 3, '#dfe5ec'); if (c === 2) pline(b, x + 3, y + 3, x + cs - 4, y + cs - 4, '#dfe5ec'); }
    prect(b, x0 - 10, cy(this.sy) - 5, 8, 10, '#2b2f38'); prect(b, x0 - 8, cy(this.sy) - 3, 4, 6, PAL.cor);
    prect(b, cx(this.tx) - 5, cy(this.ty) - 5, 10, 10, PAL.vd2); prect(b, cx(this.tx) - 3, cy(this.ty) - 3, 6, 6, PAL.vd1);
    const tr = this.trace(), col = tr.hit ? PAL.vd1 : '#ff4b6a';
    for (let k = 0; k < tr.pts.length - 1; k++) { const [ax, ay] = tr.pts[k], [bx, by] = tr.pts[k + 1]; pline(b, cx(ax), cy(ay), cx(bx), cy(by), col); pline(b, cx(ax) + 1, cy(ay), cx(bx) + 1, cy(by), col); }
  }
  hud(V) { this.btns = []; V.text('SEÑAL DE LA ESTACIÓN', V.w / 2, V.top + 18, { size: 20, align: 'center', color: PAL.vd1 }); this.drawPops(V); }
  tap(vx, vy) { const { cs, x0, y0 } = this.geo(), gx = Math.floor((vx - x0) / cs), gy = Math.floor((vy - y0) / cs); if (gx < 0 || gy < 0 || gx >= this.n || gy >= this.n) return false; this.flip(gy * this.n + gx); return true; }
  bot() { if (this.endT || !this.cell) return; for (let i = 0; i < this.cell.length; i++) if ((this.sol[i] === 1 || this.sol[i] === 2) && this.cell[i] !== this.sol[i]) return this.flip(i); }
}

/* ---------- SEMAFORERO: semáforo dañado, dirige el tránsito a mano ---------- */
class MGTraffix extends MG {
  constructor(parent, o) {
    super(parent, o); this.dur = o.dur || 30; this.target = o.target || 12; this.go = [true, true, false, false]; // N, S, E, O (los que llegan desde allí)
    this.cars = []; this.spawnT = .6; this.passed = 0; this.crashes = 0; this.min = o.clock0 || 700;
    this.coach = 'Semáforo dañado: toca cada calle para darle PARE o SIGA. ¡Que no choquen en el cruce!';
  }
  path(a, p) { const L = this.L || { vw: 200, vh: 150 }, cx = L.vw / 2, cy = L.vh / 2 + 6; switch (a) { case 0: return [cx - 4, -10 + p]; case 1: return [cx + 4, L.vh + 10 - p]; case 2: return [L.vw + 10 - p, cy - 4]; default: return [-10 + p, cy + 4]; } }
  len(a) { const L = this.L || { vw: 200, vh: 150 }; return (a < 2 ? L.vh : L.vw) + 20; }
  stopAt(a) { const L = this.L || { vw: 200, vh: 150 }, cx = L.vw / 2, cy = L.vh / 2 + 6; return [cy - 11, L.vh - cy - 11, L.vw - cx - 11, cx - 11][a]; }
  inBox(c) { const L = this.L || { vw: 200, vh: 150 }, [x, y] = this.path(c.a, c.p); return Math.abs(x - L.vw / 2) < 13 && Math.abs(y - (L.vh / 2 + 6)) < 13; }
  update(dt) {
    this.tick(dt); this.spawnT -= dt * (1 + this.t / this.dur);
    if (this.spawnT <= 0) { this.spawnT = this.rng.range(.7, 1.3); const a = this.rng.i(0, 3); if (!this.cars.some(c => c.a === a && c.p < 18)) this.cars.push({ a, p: 0, v: 0, col: this.rng.pick(['#e9eef3', '#c43a26', '#2a5a92', '#f5c400', '#3f8f5a']) }); }
    for (const c of this.cars) {
      let v = 34; const stop = this.stopAt(c.a);
      if (!this.go[c.a] && c.p < stop && c.p > stop - 6) v = 0;
      for (const o of this.cars) if (o !== c && o.a === c.a && o.p > c.p && o.p - c.p < 15) v = Math.min(v, o.v);
      c.v = v; c.p += v * dt;
    }
    // choques en el cruce
    const box = this.cars.filter(c => this.inBox(c));
    for (const c of box) for (const o of box) if (c !== o && (c.a < 2) !== (o.a < 2) && !c.dead && !o.dead) {
      const [ax, ay] = this.path(c.a, c.p), [bx, by] = this.path(o.a, o.p);
      if (Math.abs(ax - bx) < 7 && Math.abs(ay - by) < 7) { c.dead = o.dead = true; this.crashes++; this.bad('¡Choque!', ax, ay - 8); }
    }
    this.cars = this.cars.filter(c => { if (c.dead) return false; if (c.p > this.len(c.a)) { this.passed++; this.score += 3; return false; } return true; });
    if (this.t >= this.dur || this.passed >= this.target) { if (!this.done) { this.done = true; Snd.sfx(this.crashes ? 'ok' : 'win'); } }
  }
  toggle(a) { const pair = a < 2 ? [0, 1] : [2, 3]; const v = !this.go[a]; pair.forEach(k => this.go[k] = v); Snd.sfx('tap'); }
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh; this.L = { vw, vh }; const cx = vw / 2, cy = vh / 2 + 6;
    prect(b, 0, 0, vw, vh, '#5d9c4b'); prect(b, 0, cy - 12, vw, 24, '#3d4454'); prect(b, cx - 12, 0, 24, vh, '#3d4454');
    for (let x = 0; x < vw; x += 8) if (Math.abs(x - cx) > 14) prect(b, x, cy, 4, 1, '#e8e8e0'); for (let y = 0; y < vh; y += 8) if (Math.abs(y - cy) > 14) prect(b, cx, y, 1, 4, '#e8e8e0');
    prect(b, cx - 14, cy - 14, 2, 2, '#11151d'); prect(b, cx + 12, cy + 12, 2, 2, '#11151d');
    const lamp = (x, y, on) => { prect(b, x - 2, y - 2, 5, 5, '#11151d'); prect(b, x - 1, y - 1, 3, 3, on ? '#4cff6a' : '#ff4b3a'); };
    lamp(cx - 18, cy - 22, this.go[0]); lamp(cx + 18, cy + 22, this.go[1]); lamp(cx + 22, cy - 18, this.go[2]); lamp(cx - 22, cy + 18, this.go[3]);
    for (const c of this.cars) { const [x, y] = this.path(c.a, c.p), sp = Art.carTop(c.col, 'car'), ang = [Math.PI / 2, -Math.PI / 2, Math.PI, 0][c.a]; b.save(); b.translate(Math.round(x), Math.round(y)); b.rotate(ang + Math.PI / 2); b.drawImage(sp, -3, -5); b.restore(); }
  }
  hud(V) {
    this.btns = []; const s = V.s, L = this.L; if (!L) return; const cx = L.vw / 2 * s, cy = (L.vh / 2 + 6) * s;
    V.text('Pasaron ' + this.passed + '/' + this.target + ' · choques ' + this.crashes, V.w / 2, V.top + 18, { size: 16, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 4 });
    const bt = (a, x, y) => this.button(V, x - 34, y - 22, 68, 44, this.go[a] ? 'SIGA' : 'PARE', () => this.toggle(a), { bg: this.go[a] ? PAL.vd2 : '#7a2a24', size: 17, key: 'a' + a });
    bt(0, cx, cy - 70); bt(2, cx + 80, cy - 40); this.drawPops(V);
  }
  tap(vx, vy) { const L = this.L; if (!L) return false; const cx = L.vw / 2, cy = L.vh / 2 + 6; this.toggle(Math.abs(vx - cx) < 14 ? 0 : Math.abs(vy - cy) < 14 ? 2 : (Math.abs(vx - cx) < Math.abs(vy - cy) ? 0 : 2)); return true; }
  /* bot: un solo eje en verde; para cambiar, primero todo en rojo y espera a que el cruce quede libre */
  bot() {
    if (this.bs === 'clear') { if (!this.cars.some(c => this.inBox(c))) { this.toggle(this.bsTo); this.bs = null; } return; }
    const ns = this.go[0]; if (!ns && !this.go[2]) { this.toggle(0); return; }
    const wait = this.cars.filter(c => (c.a < 2) !== ns && c.v === 0).length, mine = this.cars.filter(c => (c.a < 2) === ns && !this.inBox(c) && c.p < this.stopAt(c.a) + 2).length;
    if (wait >= 2 || (wait >= 1 && mine === 0)) { this.toggle(ns ? 0 : 2); this.bs = 'clear'; this.bsTo = ns ? 2 : 0; }
  }
}

/* ---------- DESVÍOS: bandas con cambios (Bodega T3) y trenes (Easter egg del Metro) ---------- */
class MGRutas extends MG {
  constructor(parent, o) {
    super(parent, o); this.theme = o.theme || 'bodega'; this.dur = o.dur || 120; this.min = o.clock0 || 480;
    this.sw = [0, 0]; // 0 = arriba, 1 = abajo
    this.kinds = this.theme === 'metro' ? [{ col: '#56c7ff', name: 'Azul' }, { col: '#ffc93c', name: 'Amarilla' }, { col: '#ff6b5a', name: 'Roja' }] : [{ col: '#56c7ff', name: 'Llantas', ic: 'llanta' }, { col: '#f08a4b', name: 'Cadenas', ic: 'cadena' }, { col: '#9bd341', name: 'Sillines', ic: 'sillin' }];
    this.items = []; this.spawnT = .5; this.ok = 0; this.wrong = 0; this.combo = 0; this.best = 0;
    this.coach = this.theme === 'metro' ? 'Toca los cambios de vía: cada tren debe llegar al andén de SU color.' : 'Toca los desvíos (flechas) para mandar cada pieza a la bahía de SU color.';
  }
  geo() { const L = this.L || { vw: 200, vh: 150 }; const x0 = 8, xj1 = L.vw * .38, xj2 = L.vw * .62, xe = L.vw - 22, ym = L.vh * .52, dy = Math.min(34, L.vh * .24); return { x0, xj1, xj2, xe, ym, dy, yA: ym - dy, yB: ym, yC: ym + dy }; }
  /* recorrido: banda -> cambio 1 (arriba: bahía A, abajo: cambio 2) -> cambio 2 (arriba: B, abajo: C) */
  posOf(it) {
    const g = this.geo(), s = it.s;
    const seg = [[g.x0, g.ym, g.xj1, g.ym]];
    if (it.r1 === 0) seg.push([g.xj1, g.ym, g.xj1 + 10, g.yA], [g.xj1 + 10, g.yA, g.xe, g.yA]);
    else if (it.r1 === 1) { seg.push([g.xj1, g.ym, g.xj2, g.ym]); if (it.r2 === 0) seg.push([g.xj2, g.ym, g.xj2 + 10, g.yB - g.dy * .0 - 0], [g.xj2 + 10, g.yB, g.xe, g.yB]); else if (it.r2 === 1) seg.push([g.xj2, g.ym, g.xj2 + 10, g.yC], [g.xj2 + 10, g.yC, g.xe, g.yC]); }
    let d = s; for (const [ax, ay, bx, by] of seg) { const l = Math.hypot(bx - ax, by - ay); if (d <= l) return { x: ax + (bx - ax) * d / l, y: ay + (by - ay) * d / l, end: false }; d -= l; }
    const last = seg[seg.length - 1]; return { x: last[2], y: last[3], end: it.r1 !== undefined && (it.r1 === 0 || it.r2 !== undefined) };
  }
  update(dt) {
    this.tick(dt); const g = this.geo(), prog = clamp(this.t / this.dur, 0, 1), v = (this.theme === 'metro' ? 26 : 20) + 16 * prog;
    this.spawnT -= dt; if (this.spawnT <= 0) { this.spawnT = lerp(this.theme === 'metro' ? 3 : 2.2, 1.2, prog); this.items.push({ k: this.rng.i(0, 2), s: 0 }); }
    for (const it of this.items) {
      it.s += v * dt;
      if (it.r1 === undefined && it.s >= g.xj1 - g.x0) it.r1 = this.sw[0];
      if (it.r1 === 1 && it.r2 === undefined && it.s >= g.xj2 - g.x0) it.r2 = this.sw[1];
      const p = this.posOf(it);
      if (p.end) { it.gone = true; const bay = it.r1 === 0 ? 0 : it.r2 === 0 ? 1 : 2;
        if (bay === it.k) { this.ok++; this.combo++; this.best = Math.max(this.best, this.combo); const pts = 6 + Math.min(10, this.combo); this.score += pts; Snd.sfx('coin'); this.pop('+' + pts, p.x - 6, p.y - 8, PAL.vd1); }
        else { this.wrong++; this.combo = 0; this.bad(this.theme === 'metro' ? 'Andén equivocado' : 'Bahía equivocada', p.x - 10, p.y - 8); } }
    }
    this.items = this.items.filter(i => !i.gone);
    if (this.t >= this.dur) this.done = true;
  }
  toggle(k) { this.sw[k] ^= 1; Snd.sfx('tap'); }
  acc() { const n = this.ok + this.wrong; return n ? this.ok / n : 1; }
  render(V) {
    const b = V.b; this.L = { vw: V.vw, vh: V.vh }; const g = this.geo(), metro = this.theme === 'metro';
    if (metro) { b.drawImage(Art.panorama(V.vw, V.vh, 1080, Math.round(V.vh * .3)), 0, 0); prect(b, 0, Math.round(V.vh * .3), V.vw, V.vh, '#2b2f38'); }
    else { prect(b, 0, 0, V.vw, V.vh, '#22314f'); for (let x = 0; x < V.vw; x += 20) prect(b, x, 0, 10, 16, '#26385c'); }
    const rail = (ax, ay, bx, by) => { if (metro) { pline(b, ax, ay - 2, bx, by - 2, '#a7adb5'); pline(b, ax, ay + 2, bx, by + 2, '#a7adb5'); } else { pline(b, ax, ay - 2, bx, by - 2, '#59606c'); pline(b, ax, ay, bx, by, '#3b4250'); pline(b, ax, ay + 2, bx, by + 2, '#59606c'); } };
    rail(g.x0, g.ym, g.xj2, g.ym); rail(g.xj1, g.ym, g.xj1 + 10, g.yA); rail(g.xj1 + 10, g.yA, g.xe, g.yA); rail(g.xj2, g.ym, g.xj2 + 10, g.yB); rail(g.xj2 + 10, g.yB, g.xe, g.yB); rail(g.xj2, g.ym, g.xj2 + 10, g.yC); rail(g.xj2 + 10, g.yC, g.xe, g.yC);
    [g.yA, g.yB, g.yC].forEach((y, k) => { prect(b, g.xe, y - 9, 18, 18, '#0a2342'); prect(b, g.xe + 1, y - 8, 16, 16, this.kinds[k].col); if (!metro) b.drawImage(Art.icon(this.kinds[k].ic), g.xe + 1, y - 8); else prect(b, g.xe + 3, y - 2, 12, 4, '#ffffff88'); });
    const sw = (x, y, k) => { const up = this.sw[k] === 0; pdisc(b, x, y, 6, '#0a2342'); pdisc(b, x, y, 5, PAL.amb); pline(b, x - 3, y, x + 3, up ? y - 4 : y + 4, PAL.az); };
    sw(g.xj1, g.ym, 0); sw(g.xj2, g.ym, 1);
    for (const it of this.items) { const p = this.posOf(it), col = this.kinds[it.k].col;
      if (metro) { for (let c = 0; c < 3; c++) { const q = this.posOf({ ...it, s: Math.max(0, it.s - c * 9) }); prect(b, q.x - 4, q.y - 3, 8, 6, c ? '#e6e9ee' : col); prect(b, q.x - 3, q.y - 2, 6, 1, '#1d2c44'); } }
      else { prect(b, p.x - 5, p.y - 5, 10, 10, col); b.drawImage(Art.icon(this.kinds[it.k].ic), 0, 0, 16, 16, Math.round(p.x - 4), Math.round(p.y - 4), 8, 8); } }
  }
  hud(V) {
    this.btns = []; const s = V.s, g = this.geo();
    if (this.p.ride) V.text(this.theme === 'metro' ? 'MAQUINISTA SECRETO' : 'BODEGA · DESVÍOS', V.w / 2, V.top + 18, { size: 20, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 4 });
    V.text('Bien ' + this.ok + ' · combo ' + this.combo + ' · precisión ' + Math.round(this.acc() * 100) + '%', V.w / 2, 92, { size: 13, align: 'center', color: '#fff', body: true, stroke: '#0a2342', sw: 3 });
    this.button(V, g.xj1 * s - 34, (g.ym + g.dy * .5) * s + 8, 68, 46, this.sw[0] ? '↘ 1' : '↗ 1', () => this.toggle(0), { bg: PAL.az1, size: 20, key: 'j0' });
    this.button(V, g.xj2 * s - 34, (g.ym + g.dy * .5) * s + 8, 68, 46, this.sw[1] ? '↘ 2' : '↗ 2', () => this.toggle(1), { bg: PAL.az1, size: 20, key: 'j1' });
    this.coachB = 12; this.drawPops(V);
  }
  need(it) { return it.k === 0 ? [0, null] : it.k === 1 ? [1, 0] : [1, 1]; }
  hint() { const R = this.rects || {}; if (this.ok >= 3) return null; const g = this.geo(); const it = this.items.find(i => i.r1 === undefined) || this.items.find(i => i.r1 === 1 && i.r2 === undefined); if (!it) return null; const [a, bb] = this.need(it); if (it.r1 === undefined && this.sw[0] !== a) return R.j0; if (it.r1 === 1 && bb !== null && this.sw[1] !== bb) return R.j1; return null; }
  bot(err) {
    const g = this.geo(), next1 = this.items.filter(i => i.r1 === undefined).sort((a, b) => b.s - a.s)[0], next2 = this.items.filter(i => i.r1 === 1 && i.r2 === undefined).sort((a, b) => b.s - a.s)[0];
    if (next1) { const want = this.rng.f() < err ? 1 - this.need(next1)[0] : this.need(next1)[0]; if (this.sw[0] !== want) this.toggle(0); }
    if (next2) { const want = this.need(next2)[1]; if (want !== null && this.sw[1] !== want) this.toggle(1); }
    void g;
  }
}

/* ---------- LABERINTO (Easter egg en Moravia): la bola rueda hasta chocar ---------- */
class MGLaberinto extends MG {
  constructor(parent, o) {
    super(parent, o); const n = o.n || 9; this.n = n; this.min = o.clock0 || 600; this.moves = 0; this.dur = 60;
    const wall = new Array(n * n).fill(15), seen = new Array(n * n).fill(false), st = [0]; seen[0] = true;
    while (st.length) { const c = st[st.length - 1], x = c % n, y = (c / n) | 0, op = DIRS4.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < n && ny < n && !seen[ny * n + nx]; });
      if (!op.length) { st.pop(); continue; } const [dx, dy, b, nb] = this.rng.pick(op), j = (y + dy) * n + x + dx; wall[c] &= ~b; wall[j] &= ~nb; seen[j] = true; st.push(j); }
    for (let k = 0; k < n; k++) { const c = this.rng.i(0, n * n - 1), d = this.rng.pick(DIRS4), x = c % n + d[0], y = ((c / n) | 0) + d[1]; if (x >= 0 && y >= 0 && x < n && y < n) { wall[c] &= ~d[2]; wall[y * n + x] &= ~d[3]; } }
    this.wall = wall; this.bx = 0; this.by = 0; this.gx = n - 1; this.gy = n - 1; this.anim = 0;
    this.coach = '¡Laberinto secreto de Moravia! Desliza o toca hacia un lado: la bola rueda hasta chocar. Llega a la flor.';
  }
  slide(d) {
    if (this.done || this.endT) return; const n = this.n, [dx, dy, b] = DIRS4[d]; let moved = false;
    while (!(this.wall[this.by * n + this.bx] & b)) { this.bx += dx; this.by += dy; moved = true; if (this.bx === this.gx && this.by === this.gy) break; }
    if (moved) { this.moves++; Snd.sfx('tap'); } if (this.bx === this.gx && this.by === this.gy) { this.endT = .8; this.score += Math.max(10, 50 - this.moves * 2); Snd.sfx('win'); }
  }
  update(dt) { this.tick(dt); if (this.endT) { this.endT -= dt; if (this.endT <= 0) this.done = true; } if (this.t > this.dur) this.done = true; }
  geo() { const L = this.L || { vw: 200, vh: 150 }, cs = Math.floor(Math.min((L.vw - 16) / this.n, (L.vh - 46) / this.n)); return { cs, x0: Math.floor((L.vw - cs * this.n) / 2), y0: Math.floor((L.vh - cs * this.n) / 2) + 8 }; }
  render(V) {
    const b = V.b; this.L = { vw: V.vw, vh: V.vh }; prect(b, 0, 0, V.vw, V.vh, '#2f6b3a'); const { cs, x0, y0 } = this.geo(), n = this.n;
    prect(b, x0 - 2, y0 - 2, cs * n + 4, cs * n + 4, '#78b862');
    for (let i = 0; i < n * n; i++) { const x = x0 + (i % n) * cs, y = y0 + ((i / n) | 0) * cs, w = this.wall[i], c = '#275a31'; if (w & 1) prect(b, x, y, cs, 1, c); if (w & 8) prect(b, x, y, 1, cs, c); if (w & 4) prect(b, x, y + cs - 1, cs, 1, c); if (w & 2) prect(b, x + cs - 1, y, 1, cs, c); }
    const fx = x0 + this.gx * cs + cs / 2, fy = y0 + this.gy * cs + cs / 2; for (let k = 0; k < 5; k++) pdisc(b, fx + Math.cos(k * 1.26) * 2, fy + Math.sin(k * 1.26) * 2, 1, ['#ff8fc7', '#ffd84a', '#ff6b5a', '#b07cff', '#fff'][k]); prect(b, fx, fy, 1, 1, PAL.amb);
    pdisc(b, x0 + this.bx * cs + cs / 2, y0 + this.by * cs + cs / 2, Math.max(2, cs / 3), '#fff'); prect(b, x0 + this.bx * cs + cs / 2 - 1, y0 + this.by * cs + cs / 2 - 1, 1, 1, PAL.vd2);
  }
  hud(V) { this.btns = []; V.text('LABERINTO DE MORAVIA', V.w / 2, V.top + 18, { size: 20, align: 'center', color: '#ffd84a', stroke: '#0a2342', sw: 4 }); V.text('Movidas: ' + this.moves, V.w / 2, 92, { size: 13, align: 'center', color: '#fff', body: true }); this.drawPops(V); }
  pointer(type, vx, vy, cx, cy) {
    if (type === 'down') { this.d0 = { cx, cy, vx, vy }; return true; }
    if (type === 'up' && this.d0) { const dx = cx - this.d0.cx, dy = cy - this.d0.cy; let d;
      if (Math.hypot(dx, dy) > 24) d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
      else { const { cs, x0, y0 } = this.geo(), bx = x0 + this.bx * cs + cs / 2, by = y0 + this.by * cs + cs / 2, ex = this.d0.vx - bx, ey = this.d0.vy - by; d = Math.abs(ex) > Math.abs(ey) ? (ex > 0 ? 1 : 3) : (ey > 0 ? 2 : 0); }
      this.d0 = null; this.slide(d); return true; }
    return false;
  }
  key(e) { const k = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, KeyW: 0, KeyD: 1, KeyS: 2, KeyA: 3 }[e.code]; if (k !== undefined) this.slide(k); }
  bot() { // BFS sobre los deslizamientos
    if (this.endT) return; const n = this.n, start = this.by * n + this.bx, prev = new Map([[start, null]]), q = [start];
    const sl = (c, d) => { let x = c % n, y = (c / n) | 0; const [dx, dy, b] = DIRS4[d]; while (!(this.wall[y * n + x] & b)) { x += dx; y += dy; if (x === this.gx && y === this.gy) break; } return y * n + x; };
    while (q.length) { const c = q.shift(); if (c === this.gy * n + this.gx) break; for (let d = 0; d < 4; d++) { const nc = sl(c, d); if (!prev.has(nc)) { prev.set(nc, [c, d]); q.push(nc); } } }
    let c = this.gy * n + this.gx, first = null; if (!prev.has(c)) return this.slide(this.rng.i(0, 3)); while (prev.get(c)) { const [p, d] = prev.get(c); first = d; c = p; }
    if (first !== null) this.slide(first);
  }
}
