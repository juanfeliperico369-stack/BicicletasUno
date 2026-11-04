/* =====================================================================
   SIMULACIÓN DE ESTACIONES + MOTOR DE RECORRIDO (vista cenital)
   ===================================================================== */
const M_PER_PX = 20 / TS; // 1 baldosa = 20 m
const CICLOVIA_AV = ['Avenida El Poblado', 'Avenida 80', 'Avenida Las Vegas'];
const gauss = (x, m, s) => Math.exp(-((x - m) * (x - m)) / (2 * s * s));

class StationSim {
  constructor(rng, o = {}) {
    this.rng = rng; this.demand = o.demand != null ? o.demand : 1; this.extra = o.extra || null;
    this.st = JE.map.stations.map(s => ({ ...s, bikes: Math.round(s.cap * (o.fill != null ? o.fill : rng.range(.35, .7))), broken: false, open: true, emptyT: 0, fullT: 0, noBike: 0, noDock: 0 }));
    this.trips = []; this.depot = o.depot != null ? o.depot : 40; this.trucks = []; this.held = 0; this.shop = 0; this.elapsed = 0; this.trips_done = 0;
    const n = this.st.length; this.D = new Float32Array(n * n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) this.D[i * n + j] = Math.hypot(this.st[i].x - this.st[j].x, this.st[i].y - this.st[j].y) / TS;
    this.total = this.count();
  }
  count() { let c = this.depot + this.held + this.shop + this.trips.length; for (const s of this.st) c += s.bikes; for (const t of this.trucks) c += t.load; return c; }
  out(k, m) { const a = gauss(m, 450, 60), e = gauss(m, 1080, 70); return k === 'res' ? .25 + 1.6 * a + .5 * e : k === 'work' ? .25 + .4 * a + 1.6 * e : k === 'uni' ? .3 + .6 * a + 1.0 * e + .5 * gauss(m, 780, 90) : .5 + .7 * a + .7 * e; }
  att(k, m) { const a = gauss(m, 450, 60), e = gauss(m, 1080, 70); return k === 'res' ? .3 + .3 * a + 1.5 * e : k === 'work' ? .3 + 1.6 * a + .3 * e : k === 'uni' ? .3 + 1.4 * a + .5 * e : .7; }
  choose(s, m) {
    const n = this.st.length; let tot = 0; const w = this._w || (this._w = new Float32Array(n));
    for (let j = 0; j < n; j++) { const d = this.D[s.i * n + j], t = this.st[j]; let x = 0; if (j !== s.i && t.open && !t.broken && d > 12) x = this.att(t.kind, m) * (d < 110 ? 1 : .25) * (this.extra && this.extra.id === t.id ? this.extra.mult : 1); w[j] = x; tot += x; }
    let r = this.rng.f() * tot; for (let j = 0; j < n; j++) { r -= w[j]; if (r <= 0) return this.st[j]; }
    return this.st[(s.i + 1) % n];
  }
  near(s, need) { const n = this.st.length; let best = null, bd = 1e9; for (let j = 0; j < n; j++) { const t = this.st[j]; if (j === s.i || !t.open || t.broken) continue; if (need === 'dock' && t.bikes >= t.cap) continue; const d = this.D[s.i * n + j]; if (d < bd) { bd = d; best = t; } } return best; }
  step(dm, m) {
    this.elapsed += dm; const open = m >= 330 && m <= 1320;
    for (const s of this.st) {
      if (s.bikes <= 0) s.emptyT += dm; else if (s.bikes >= s.cap) s.fullT += dm;
      if (!open || !s.open || s.broken) continue;
      const lam = .045 * this.demand * this.out(s.kind, m) * dm * (this.extra && this.extra.id === s.id ? this.extra.mult : 1);
      let k = Math.floor(lam) + (this.rng.f() < lam % 1 ? 1 : 0);
      while (k-- > 0) {
        if (s.bikes > 0) { s.bikes--; const d = this.choose(s, m); this.trips.push({ o: s.i, d: d.i, t: m + Math.max(4, this.D[s.i * this.st.length + d.i] * .09) }); }
        else s.noBike++;
      }
    }
    for (let i = this.trips.length - 1; i >= 0; i--) {
      const tr = this.trips[i]; if (tr.t > m) continue;
      const d = this.st[tr.d];
      if (d.open && !d.broken && d.bikes < d.cap) { d.bikes++; this.trips.splice(i, 1); this.trips_done++; }
      else { d.noDock++; const alt = this.near(d, 'dock'); if (alt) { tr.d = alt.i; tr.t = m + 3; } else tr.t = m + 5; }
    }
  }
  service() { const T = Math.max(1, this.elapsed) * this.st.length; let bad = 0; for (const s of this.st) bad += s.emptyT + s.fullT; return clamp(1 - bad / T, 0, 1); }
  ratioCol(s) { const r = s.bikes / s.cap; return s.broken ? '#ff6b5a' : r <= 0 ? '#ff6b5a' : r < .2 ? '#ffc93c' : r >= 1 ? '#56c7ff' : PAL.vd; }
}

class Ride {
  constructor(mode, o) {
    this.mode = mode; this.map = JE.map; this.sim = o.sim || null; this.rng = mode.rng;
    const s = o.start; this.p = { x: s.x, y: s.y, a: o.ang != null ? o.ang : -Math.PI / 2, v: 0, veh: o.veh || 'bike', stun: 0, load: o.load || 0, cap: o.cap || 20 };
    this.cam = { x: s.x, y: s.y }; this.cars = []; this.markers = []; this.target = null; this.fx = []; this.leaves = []; this.drops = [];
    this.traffic = o.traffic != null ? o.traffic : 1; this.zone = o.zone || null;
    this.stats = { dist: 0, ciclo: 0, crashes: 0, bells: 0, reds: 0 }; this.cicT = 0; this.offC = 0; this.cicLv = 0; this.lastLight = -1; this.stamp = null; this.opps = []; this.shake = 0; this.gps = []; this.gpsT = 0; this.big = false; this.spawnT = 0; this.honkT = 0;
    this.trains = [0, .25, .5, .75].map((f, i) => ({ l: 'A', p: f * MH * TS, dir: i % 2 ? 1 : -1, wait: 0 })).concat([{ l: 'B', p: 0, dir: 1, wait: 0 }]);
    if (this.blocked(this.p.x, this.p.y, this.stats_().r)) { const n = this.map.nearestOpen(Math.floor(this.p.x / TS), Math.floor(this.p.y / TS), this.p.veh === 'truck'); this.p.x = n.x * TS + 4; this.p.y = n.y * TS + 4; }
    this.initLife();
    this.bx0 = 12 * TS; this.bx1 = (RX[LINEB_Y] + 9) * TS; this.mmRect = null; this.joyDraw = null; this.ox = 0; this.oy = 0;
  }
  stats_() { return this.p.veh === 'truck' ? { max: 50, acc: 55, dec: 95, turn: 2.7, r: 3.4 } : { max: 60, acc: 120, dec: 150, turn: 5.6, r: 2.5 }; }
  solidAt(x, y) { const v = this.map.get(Math.floor(x / TS), Math.floor(y / TS)); return this.p.veh === 'truck' ? !TRUCK_OK[v] : SOLID[v] === 1; }
  blocked(x, y, r) { return this.solidAt(x - r, y - r) || this.solidAt(x + r, y - r) || this.solidAt(x - r, y + r) || this.solidAt(x + r, y + r); }
  tileAt() { return this.map.get(Math.floor(this.p.x / TS), Math.floor(this.p.y / TS)); }
  setVeh(v) {
    this.p.veh = v; if (this.blocked(this.p.x, this.p.y, this.stats_().r)) { const n = this.map.nearestOpen(Math.floor(this.p.x / TS), Math.floor(this.p.y / TS), v === 'truck'); this.p.x = n.x * TS + 4; this.p.y = n.y * TS + 4; }
  }
  marker(m) { m.inside = false; m.r = m.r || 14; this.markers.push(m); return m; }
  removeMarker(m) { const i = this.markers.indexOf(m); if (i >= 0) this.markers.splice(i, 1); if (this.target === m) this.target = null; }
  bell() {
    if (this.belT > 0) return; this.belT = .6; this.stats.bells++; Snd.sfx('bell'); this.bellPeds(); for (const c of this.cars) if (dist(c.x, c.y, this.p.x, this.p.y) < 50) c.yield = 1.2;
    // Easter eggs: tres timbrazos seguidos bajo una estación del Metro o en Moravia
    const now = this.mode.t; this.bellLog = (this.bellLog || []).filter(t => now - t < 3); this.bellLog.push(now);
    if (this.bellLog.length >= 3 && this.mode.easter) {
      const P = this.p, nearMetro = this.map.metroA.concat(this.map.metroB).some(s => dist(s.px, s.py, P.x, P.y) < 28), mv = LM.moravia;
      if (nearMetro) { this.bellLog = []; this.mode.easter('metro'); }
      else if (mv && dist((mv.x + mv.w / 2) * TS, (mv.y + mv.h / 2) * TS, P.x, P.y) < 70) { this.bellLog = []; this.mode.easter('laberinto'); }
    }
  }
  float(txt, col) { this.fx.push({ k: 't', x: this.p.x, y: this.p.y - 10, t: 1.1, txt, col: col || '#fff' }); }
  burst(x, y, col, n = 10) { for (let i = 0; i < n; i++) { const a = this.rng.f() * TAU, s = 20 + this.rng.f() * 40; this.fx.push({ k: 'p', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: .5 + this.rng.f() * .3, col }); } }

  update(dt, dir) {
    const P = this.p, S = this.stats_(), M = this.mode, rain = M.mods.rain;
    this.belT = Math.max(0, (this.belT || 0) - dt); this.inv = Math.max(0, (this.inv || 0) - dt);
    if (P.stun > 0) { P.stun -= dt; dir = { x: 0, y: 0, m: 0 }; }
    let mult = P.veh === 'truck' ? 1 : (SURF[this.tileAt()] || .5);
    mult *= (M.has('llantas') && P.veh === 'bike' ? 1.12 : 1) * (M.has('camion') && P.veh === 'truck' ? 1.15 : 1) * (rain ? .93 : 1) * (M.mods.ciclovia && P.veh === 'bike' ? 1.06 : 1);
    if (dir.m > 0) {
      const ta = Math.atan2(dir.y, dir.x), da = angDiff(P.a, ta), turn = S.turn * (rain ? .8 : 1) * (P.v < 10 ? 1.7 : 1);
      P.a += clamp(da, -turn * dt, turn * dt);
      const tv = S.max * mult * dir.m * (.3 + .7 * Math.max(0, Math.cos(da))), acc = tv > P.v ? S.acc : S.dec;
      P.v += clamp(tv - P.v, -acc * dt, acc * dt);
    } else P.v = Math.max(0, P.v - S.dec * dt * (rain ? .55 : 1));
    const st = P.v * dt, nx = P.x + Math.cos(P.a) * st, ny = P.y + Math.sin(P.a) * st;
    if (!this.blocked(nx, ny, S.r)) { P.x = nx; P.y = ny; }
    else if (st > 0) {
      let moved = false; // asistencia de esquinas: prueba ángulos cercanos
      for (const da of [.35, -.35, .7, -.7, 1.1, -1.1]) {
        const ax = P.x + Math.cos(P.a + da) * st, ay = P.y + Math.sin(P.a + da) * st;
        if (!this.blocked(ax, ay, S.r)) { P.x = ax; P.y = ay; P.a += da * .25; P.v *= .9; moved = true; break; }
      }
      if (!moved) { if (!this.blocked(nx, P.y, S.r)) { P.x = nx; P.v *= .9; } else if (!this.blocked(P.x, ny, S.r)) { P.y = ny; P.v *= .9; } else P.v *= .25; }
    }
    P.x = clamp(P.x, 4, MW * TS - 4); P.y = clamp(P.y, 4, MH * TS - 4);
    this.stats.dist += st; const onC = this.tileAt() === TT.CICLO; if (onC) this.stats.ciclo += st;
    const ti = Math.floor(P.y / TS) * MW + Math.floor(P.x / TS), li = this.map.lightAt[ti];
    if (li >= 0 && li !== this.lastLight && P.v > 6 && this.mode.t > 2) {
      const ew = Math.abs(Math.cos(P.a)) > Math.abs(Math.sin(P.a)), LT = this.map.lights[li], s = this.map.lightState(LT, this.mode.t)[ew ? 0 : 1] === 'r' && this.map.lightState(LT, this.mode.t - .7)[ew ? 0 : 1] === 'r' ? 'r' : 'ok';
      if (s === 'r') { this.stats.reds++; this.float('¡En rojo!', PAL.cor); Snd.sfx('bad'); vib(40); if (this.mode.onRed) this.mode.onRed(); if (!this.redTold) { this.redTold = 1; JE.ui && JE.ui.toast('🚦 En rojo se espera: ¡respeta el semáforo!'); } }
    }
    this.lastLight = li;
    if (P.veh === 'bike') {
      if (onC && P.v > 20) { this.cicT += dt; this.offC = 0; } else if ((this.offC += dt) > .7) this.cicT = 0;
      const lv = this.cicT >= 15 ? 3 : this.cicT >= 8 ? 2 : this.cicT >= 4 ? 1 : 0;
      if (lv === 3 && !JE.headless) Save.data.flags.cic4 = 1;
      if (lv > this.cicLv) { this.float('¡Racha ciclorruta x' + (lv + 1) + '!', PAL.vd1); Snd.sfx('coin'); if (this.mode.onStreak) this.mode.onStreak(lv); }
      this.cicLv = lv;
      if (lv && P.v > 35 && !JE.headless && this.rng.f() < .5) this.fx.push({ k: 'p', x: P.x - Math.cos(P.a) * 6 + (this.rng.f() - .5) * 4, y: P.y - Math.sin(P.a) * 6 + (this.rng.f() - .5) * 4, vx: -Math.cos(P.a) * 30, vy: -Math.sin(P.a) * 30, t: .3, col: lv > 1 ? '#ffffff' : PAL.vd1 });
    }
    this.updCars(dt); this.updTrains(dt); this.updLife(dt);
    // marcadores
    for (const m of this.markers.slice()) {
      const r = m.r + (P.veh === 'truck' ? 44 : 0), d = dist(P.x, P.y, m.x, m.y);
      if (d < r && !m.inside) { m.inside = true; if (m.enter) m.enter(m); }
      else if (d > r + 6 && m.inside) { m.inside = false; if (m.leave) m.leave(m); }
    }
    // hojas
    for (const l of this.leaves) if (!l.got && Math.abs(l.x - P.x) < 7 && Math.abs(l.y - P.y) < 7) { l.got = true; Snd.sfx('leaf'); this.float('+5', PAL.vd1); if (M.onLeaf) M.onLeaf(l); }
    // efectos
    if (this.stamp && (this.stamp.t -= dt) <= 0) this.stamp = null;
    for (const f of this.fx) { f.t -= dt; if (f.k === 'p') { f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= .9; f.vy *= .9; } else f.y -= 14 * dt; }
    this.fx = this.fx.filter(f => f.t > 0);
    if (rain && !JE.headless) { while (this.drops.length < 70) this.drops.push({ x: this.rng.f() * 400, y: this.rng.f() * 400, s: 160 + this.rng.f() * 80 }); for (const d of this.drops) { d.y += d.s * dt; d.x -= d.s * .2 * dt; if (d.y > 400) { d.y -= 400; d.x = this.rng.f() * 400; } if (d.x < 0) d.x += 400; } }
    // cámara con anticipación
    const la = P.veh === 'truck' ? .55 : .4, tx = P.x + Math.cos(P.a) * P.v * la, ty = P.y + Math.sin(P.a) * P.v * la, k = 1 - Math.exp(-5 * dt);
    this.cam.x += (tx - this.cam.x) * k; this.cam.y += (ty - this.cam.y) * k; this.shake = Math.max(0, this.shake - dt);
    // GPS
    this.gpsT -= dt; if (this.gpsT <= 0) { this.gpsT = .35; this.calcGps(); }
  }
  calcGps() {
    this.gps = []; const T = this.target; if (!T) return;
    const D = this.map.flow(Math.floor(T.x / TS), Math.floor(T.y / TS), this.p.veh === 'truck');
    let c = { x: Math.floor(this.p.x / TS), y: Math.floor(this.p.y / TS) };
    if (D[c.y * MW + c.x] >= 1e9) { const n = this.map.nearestOpen(c.x, c.y, this.p.veh === 'truck'); c = n; }
    for (let i = 0; i < 90; i++) { const n = this.map.nextStep(D, c.x, c.y); if (!n) break; c = n; if (i % 2 === 1) this.gps.push({ x: c.x * TS + 4, y: c.y * TS + 4 }); }
    this.flowD = D;
  }
  /* ---- tráfico ---- */
  updCars(dt) {
    const P = this.p, R = 260, want = Math.round(16 * this.traffic * (this.mode.mods.pico ? 1.4 : 1));
    this.spawnT -= dt;
    if (this.spawnT <= 0 && this.cars.length < want) {
      this.spawnT = .12; const L = this.map.lanes[Math.floor(this.rng.f() * this.map.lanes.length)];
      let lo, hi, cfix;
      if (L.ax === 'x') { cfix = L.c; if (Math.abs(cfix - this.cam.y) < R) { lo = Math.max(L.a, this.cam.x - R); hi = Math.min(L.b, this.cam.x + R); } }
      else if (L.ax === 'y') { cfix = L.c; if (Math.abs(cfix - this.cam.x) < R) { lo = Math.max(L.a, this.cam.y - R); hi = Math.min(L.b, this.cam.y + R); } }
      else { lo = Math.max(0, this.cam.y - R); hi = Math.min(L.b, this.cam.y + R); if (Math.abs((rxf(this.cam.y) + L.d) * TS - this.cam.x) > R) lo = hi = 0; }
      if (hi - lo > 20 && !(this.mode.mods.ciclovia && CICLOVIA_AV.includes(L.name))) {
        const p = lo + this.rng.f() * (hi - lo), c = { L, p, v: 0, spd: L.spd * this.rng.range(.8, 1.15), yield: 0, stop: 0 };
        const r = this.rng.f(); c.kind = L.spd > 30 && r < .1 ? 'bus' : r < .32 ? 'taxi' : 'car';
        c.col = c.kind === 'taxi' ? '#f5c400' : c.kind === 'bus' ? '#3f8f5a' : this.rng.pick(['#e9eef3', '#c43a26', '#2a5a92', '#1d1f24', '#9aa7b8', '#7a3b3b', '#3d6b3a', '#d98a3a']);
        this.carPos(c); if (dist(c.x, c.y, P.x, P.y) > 70) this.cars.push(c);
      }
    }
    for (const c of this.cars) {
      let v = c.spd * (this.mode.mods.rain ? .85 : 1); if (c.stop > 0) { c.stop -= dt; v = 0; } if (c.yield > 0) { c.yield -= dt; v *= .35; }
      const len = c.kind === 'bus' ? 30 : 14;
      for (const o of this.cars) { if (o === c || o.L !== c.L) continue; const ahead = (o.p - c.p) * c.L.dir; if (ahead > 0 && ahead < len + 4) v = Math.min(v, o.v * .9); }
      const LL = c.L.lights; if (LL.length) {
        const front = c.p + len / 2 * c.L.dir, axis = c.L.ax === 'x' ? 0 : 1; let s = null;
        if (c.L.dir > 0) { for (const q of LL) if (q.p0 >= front - 1) { s = q; break; } } else { for (let k = LL.length - 1; k >= 0; k--) if (LL[k].p1 <= front + 1) { s = LL[k]; break; } }
        if (s) { const d = c.L.dir > 0 ? s.p0 - front : front - s.p1, st = this.map.lightState(s.g, this.mode.t)[axis]; if (d < 24 && (st === 'r' || (st === 'a' && d > 6))) v = Math.min(v, Math.max(0, (d - 2) * 3)); }
      }
      const fx = Math.cos(c.ang), fy = Math.sin(c.ang), dx = P.x - c.x, dy = P.y - c.y, along = dx * fx + dy * fy, lat = Math.abs(-dx * fy + dy * fx);
      const pr = this.stats_().r; if (along > 0 && along < 20 + pr * 2 && lat < 4 + pr) { v = along < 12 + pr * 2 ? 0 : Math.min(v, 6); if (this.honkT <= 0 && P.v > 2 && dist(P.x, P.y, c.x, c.y) < 60) { this.honkT = 2.5; Snd.sfx('honk'); } }
      c.v = v; c.p += v * c.L.dir * dt; this.carPos(c);
      // choque con el jugador
      const hw = (c.ax === 'x' ? (c.kind === 'bus' ? 13 : 6) : 3) + this.stats_().r, hh = (c.ax === 'x' ? 3 : (c.kind === 'bus' ? 13 : 6)) + this.stats_().r;
      if (c.ghost > 0) c.ghost -= dt; else if (Math.abs(dx) < hw && Math.abs(dy) < hh && P.stun <= 0 && !(this.inv > 0)) this.crash(c);
    }
    this.honkT -= dt;
    this.cars = this.cars.filter(c => c.p > c.L.a - 12 && c.p < c.L.b + 12 && dist(c.x, c.y, this.cam.x, this.cam.y) < R * 1.5);
  }
  carPos(c) {
    const L = c.L; c.ax = L.ax === 'x' ? 'x' : 'y';
    if (L.ax === 'x') { c.x = c.p; c.y = L.c; c.ang = L.dir > 0 ? 0 : Math.PI; }
    else if (L.ax === 'y') { c.y = c.p; c.x = L.c; c.ang = L.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
    else { c.y = c.p; c.x = (rxf(c.p) + L.d) * TS + 4; c.ang = L.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
  }
  crash(c) {
    const P = this.p;
    c.ghost = 2.5; this.inv = 1.4;
    if (this.mode.has('chaleco') && !this.vestUsed) { this.vestUsed = true; this.float('¡Chaleco!', PAL.amb); return; }
    const a = Math.atan2(P.y - c.y, P.x - c.x); let nx = P.x + Math.cos(a) * 9, ny = P.y + Math.sin(a) * 9;
    if (!this.blocked(nx, ny, this.stats_().r)) { P.x = nx; P.y = ny; }
    P.v = 0; P.stun = .6; c.stop = .5; this.stats.crashes++; this.shake = .35; Snd.sfx('bad'); vib(60);
    this.float('¡Cuidado!', PAL.cor); this.burst(P.x, P.y, '#ffffff', 6);
    if (this.mode.onCrash) this.mode.onCrash();
  }
  updTrains(dt) {
    for (const t of this.trains) {
      if (t.wait > 0) { t.wait -= dt; continue; }
      const prev = t.p; t.p += 70 * t.dir * dt;
      if (t.l === 'A') { const top = this.map.metroA[0].py - 20; if (t.p < top) t.p = MH * TS + 40; if (t.p > MH * TS + 60) t.p = top + 1; for (const s of this.map.metroA) if ((prev - s.py) * (t.p - s.py) < 0) { t.wait = 1.4; t.p = s.py; } }
      else { if (t.p > this.bx1 - this.bx0) { t.dir = -1; t.wait = 2; } if (t.p < 0) { t.dir = 1; t.wait = 2; } }
    }
  }

  /* ---- dibujo en el búfer pixelado ---- */
  render(V, min) {
    const b = V.b, P = this.p, sx = this.shake > 0 ? (this.rng.f() - .5) * 4 : 0, sy = this.shake > 0 ? (this.rng.f() - .5) * 4 : 0;
    const ox = Math.round(clamp(this.cam.x - V.vw / 2, -40, MW * TS - V.vw + 40) + sx), oy = Math.round(clamp(this.cam.y - V.vh / 2, -40, MH * TS - V.vh + 40) + sy);
    this.ox = ox; this.oy = oy; const S = CH * TS;
    b.fillStyle = '#2f6b3a'; b.fillRect(0, 0, V.vw, V.vh);
    let made = 0;
    for (let cy = Math.floor(oy / S); cy <= Math.floor((oy + V.vh) / S); cy++) for (let cx = Math.floor(ox / S); cx <= Math.floor((ox + V.vw) / S); cx++) {
      if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue;
      if (!this.map.chunks.has(cx + ',' + cy)) made++;
      b.drawImage(this.map.chunk(cx, cy), cx * S - ox, cy * S - oy);
    }
    if (!made) { // precalienta un bloque vecino
      const cx = Math.floor(P.x / S) + Math.round(Math.cos(P.a) * 1.4), cy = Math.floor(P.y / S) + Math.round(Math.sin(P.a) * 1.4);
      if (cx >= 0 && cy >= 0 && cx * CH < MW && cy * CH < MH && !this.map.chunks.has(cx + ',' + cy)) this.map.chunk(cx, cy);
    }
    const inV = (x, y, m = 20) => x > ox - m && x < ox + V.vw + m && y > oy - m && y < oy + V.vh + m;
    // estaciones con sus bicis
    const t = performance.now() / 1000;
    for (const s of this.map.stations) {
      if (!inV(s.x, s.y, 30)) continue;
      const ss = this.sim ? this.sim.st[s.i] : null, bikes = ss ? ss.bikes : Math.round(s.cap * .55), x0 = s.tx * TS - ox, y0 = s.ty * TS - oy;
      prect(b, x0 + 1, y0 + 2, 30, 3, PAL.vd2); prect(b, x0 + 1, y0 + 2, 30, 1, PAL.vd1);
      const per = Math.ceil(s.cap / 2);
      for (let k = 0; k < s.cap; k++) { const row = k < per ? 0 : 1, bx = x0 + 3 + (k % per) * Math.min(3, 24 / per), by = y0 + 6 + row * 9; if (k < bikes) b.drawImage(Art.bikeTop(), Math.round(bx), by); else prect(b, Math.round(bx) + 1, by + 3, 1, 2, '#9aa7b8'); }
      if (s.type === 'm') { prect(b, x0 + 26, y0 + 7, 5, 6, '#1d2c44'); prect(b, x0 + 26, y0 + 6, 5, 2, '#e9eef3'); }
      else { prect(b, x0 + 27, y0 + 8, 3, 6, '#2b2f38'); prect(b, x0 + 27, y0 + 9, 3, 2, (t * 2 | 0) % 2 ? PAL.vd : PAL.vd1); }
      if (ss && ss.broken) { if ((t * 3 | 0) % 2) { pline(b, x0 + 10, y0 + 6, x0 + 20, y0 + 18, PAL.cor); pline(b, x0 + 20, y0 + 6, x0 + 10, y0 + 18, PAL.cor); } }
      if (ss && !ss.open) { b.fillStyle = '#0a234299'; b.fillRect(x0, y0, 32, 24); }
    }
    // ruta GPS
    const ph = (t * 4) | 0;
    const gc = this.target && this.target.col || PAL.amb; this.gps.forEach((g, i) => { if (!inV(g.x, g.y)) return; const c = (i + ph) % 3 === 0 ? '#ffffff' : gc; prect(b, g.x - ox - 2, g.y - oy - 2, 4, 4, '#0a2342'); prect(b, g.x - ox - 1, g.y - oy - 1, 2, 2, c); });
    // marcadores (aros que laten)
    for (const m of this.markers) {
      if (!inV(m.x, m.y, 40)) continue; const pr = m.r * .7 + Math.sin(t * 5) * 2, col = m.col || PAL.amb;
      pring(b, m.x - ox, m.y - oy, Math.round(pr), col); pring(b, m.x - ox, m.y - oy, Math.round(pr) + 1, '#0a234288'); if (m === this.target) pring(b, m.x - ox, m.y - oy, Math.round(pr * .6), '#fff');
    }
    // hojas
    for (const l of this.leaves) if (!l.got && inV(l.x, l.y)) { const bob = Math.sin(t * 4 + l.x) * 1; b.drawImage(Art.icon('hoja'), 0, 0, 16, 16, Math.round(l.x - ox - 3), Math.round(l.y - oy - 3 + bob), 7, 7); }
    // carros
    for (const c of this.cars) {
      if (!inV(c.x, c.y)) continue; const sp = Art.carTop(c.col, c.kind);
      b.save(); b.translate(Math.round(c.x - ox), Math.round(c.y - oy)); b.rotate(c.ang + Math.PI / 2); b.fillStyle = '#0004'; b.fillRect(-sp.width / 2 + 1, -sp.height / 2 + 1, sp.width, sp.height); b.drawImage(sp, -sp.width / 2 | 0, -sp.height / 2 | 0); b.restore();
    }
    // ciclovía: conos en las avenidas cerradas a los carros
    if (this.mode.mods.ciclovia) for (const bn of this.map.bandsNS) { if (!CICLOVIA_AV.includes(AVE_NS[bn.r])) continue; const cx = (bn.r + 1.5) * TS; if (cx < ox - 10 || cx > ox + V.vw + 10) continue; for (let py = Math.floor(oy / 40) * 40; py < oy + V.vh; py += 40) { if (this.map.get(bn.r + 1, Math.floor(py / TS)) !== TT.AVE) continue; prect(b, cx - ox - 1, py - oy, 3, 3, '#ff8a3d'); prect(b, cx - ox, py - oy - 1, 1, 1, '#ffffff'); } }
    // semáforos
    const LC = { g: '#4cff6a', a: '#ffc93c', r: '#ff4b3a' };
    for (const L of this.map.lights) {
      if (!inV(L.x0, L.y0, 30)) continue; const s = this.map.lightState(L, this.mode.t);
      const lamp = (x, y, k) => { prect(b, x - ox, y - oy, 3, 3, '#11151d'); prect(b, x - ox + 1, y - oy + 1, 1, 1, LC[k]); };
      lamp(L.x0 - 3, L.y0 - 3, s[0]); lamp(L.x1, L.y1, s[0]); lamp(L.x1, L.y0 - 3, s[1]); lamp(L.x0 - 3, L.y1, s[1]);
    }
    this.drawGround(b, ox, oy, inV);
    // rivales (carrera)
    for (const o of this.opps) { if (!inV(o.x, o.y)) continue; const so = Art.riderTop(o.shirt || PAL.cor, '#ffffff', o.skin || SKINS[2]); b.save(); b.translate(Math.round(o.x - ox), Math.round(o.y - oy)); b.rotate(o.a + Math.PI / 2); b.globalAlpha = .9; b.drawImage(so, -3, -6); b.restore(); }
    // jugador
    const pr = Save.data.profile, sp = P.veh === 'truck' ? Art.truckTop(P.load, P.cap) : Art.riderTop(this.mode.shirt || SHIRTS[pr.shirt] || PAL.vd, HELMETS[pr.helmet] || '#fff', SKINS[pr.skin] || SKINS[1], Save.data.flags.gold ? '#ffd84a' : PAL.vd);
    b.save(); b.translate(Math.round(P.x - ox), Math.round(P.y - oy)); b.rotate(P.a + Math.PI / 2); b.fillStyle = '#0005'; b.fillRect(-sp.width / 2 + 1, -sp.height / 2 + 2, sp.width, sp.height); b.drawImage(sp, -sp.width / 2 | 0, -sp.height / 2 | 0); b.restore();
    // trenes elevados
    const tc = Art.trainCar();
    for (const tr of this.trains) {
      if (tr.l === 'A') { for (let k = -1; k <= 1; k++) { const py = tr.p + k * 17; if (!inV((rxf(py) + 9) * TS, py)) continue; b.drawImage(tc, Math.round((rxf(py) + 9) * TS - 3 - ox), Math.round(py - 8 - oy)); } }
      else { const px = this.bx0 + tr.p; for (let k = -1; k <= 1; k++) { const x = px + k * 17; if (!inV(x, LINEB_Y * TS)) continue; b.save(); b.translate(Math.round(x - ox), Math.round(LINEB_Y * TS + 4 - oy)); b.rotate(Math.PI / 2); b.drawImage(tc, -3, -8); b.restore(); } }
    }
    this.drawSky(b, ox, oy);
    // partículas
    for (const f of this.fx) if (f.k === 'p') prect(b, f.x - ox, f.y - oy, 1, 1, f.col);
    // lluvia
    if (this.mode.mods.rain) { b.fillStyle = '#cfe8ff88'; for (const d of this.drops) { const x = (d.x * V.vw / 400) | 0, y = (d.y * V.vh / 400) | 0; b.fillRect(x, y, 1, 3); } b.fillStyle = '#0a234222'; b.fillRect(0, 0, V.vw, V.vh); }
    // noche
    const n = Art.night(min); if (n > 0) { b.fillStyle = 'rgba(8,18,52,' + (n * .5).toFixed(3) + ')'; b.fillRect(0, 0, V.vw, V.vh); }
    this.drawGlow(b, ox, oy, inV, n);
  }
  /* ---- capa nítida: etiquetas, flecha, minimapa, joystick ---- */
  hud(V, opts = {}) {
    const c = V.ctx, s = V.s, ox = this.ox, oy = this.oy, P = this.p;
    const sx = x => (x - ox) * s, sy = y => (y - oy) * s;
    if (s >= 3 || V.w > 700) {
      for (const st of this.map.stations) { const x = sx(st.x), y = sy(st.y) - 16 * s / 3; if (x > -60 && x < V.w + 60 && y > 40 && y < V.h) V.text(st.name, x, y, { size: 11, align: 'center', bg: '#0a2342dd', color: '#c4ec7c', pad: 3 }); }
      for (const L of LANDMARKS) { const x = sx((L.x + L.w / 2) * TS), y = sy((L.y + L.h / 2) * TS); if (x > -80 && x < V.w + 80 && y > 40 && y < V.h) V.text(L.name, x, y, { size: 12, align: 'center', stroke: '#0a2342', sw: 4, color: '#fff' }); }
    }
    for (const o of this.opps) { const x = sx(o.x), y = sy(o.y) - 14; if (x > 0 && x < V.w && y > 0 && y < V.h) V.text(o.name, x, y, { size: 11, align: 'center', color: '#fff', bg: o.shirt || PAL.cor, pad: 2 }); }
    if (this.stamp) { const k = this.stamp, a = Math.min(1, k.t * 3, (1.8 - k.t) * 8 + .2); c.save(); c.globalAlpha = clamp(a, 0, 1); c.translate(V.w / 2, V.h * .38); c.rotate(-.08); const w = Math.min(V.w - 40, 330); c.fillStyle = '#0008'; c.fillRect(-w / 2 + 6, -38, w, 82); c.fillStyle = k.bg || PAL.amb; c.fillRect(-w / 2, -44, w, 82); c.strokeStyle = PAL.az; c.lineWidth = 4; c.strokeRect(-w / 2 + 2, -42, w - 4, 78); V.text(k.title, 0, -8, { size: 30, align: 'center', color: PAL.az }); V.text(k.sub || '', 0, 20, { size: 15, align: 'center', color: PAL.az, body: true }); c.restore(); }
    this.hudLife(V, sx, sy);
    for (const f of this.fx) if (f.k === 't') V.text(f.txt, sx(f.x), sy(f.y), { size: 16, align: 'center', stroke: '#0a2342', sw: 4, color: f.col });
    for (const m of this.markers) if (m.label && m.num) { const x = sx(m.x), y = sy(m.y); if (x > 0 && x < V.w && y > 0 && y < V.h) V.text(String(m.num), x, y + 5, { size: 14, align: 'center', stroke: '#0a2342', sw: 4, color: m.col || PAL.amb }); }
    // flecha al objetivo
    const T = this.target;
    if (T) {
      const tx = sx(T.x), ty = sy(T.y), d = dist(P.x, P.y, T.x, T.y) * M_PER_PX, L = 30, Rr = V.w - 30 - (V.w > 600 ? 0 : 0), Tt = Math.min(160, V.h * .3), B = V.h - 110;
      if (tx < L || tx > Rr || ty < 60 || ty > V.h - 70) {
        const cx = (L + Rr) / 2, cy = (Tt + B) / 2, dx = tx - cx, dy = ty - cy, a = Math.atan2(dy, dx);
        const k = Math.min(dx > 0 ? (Rr - cx) / dx : dx < 0 ? (L - cx) / dx : 1e9, dy > 0 ? (B - cy) / dy : dy < 0 ? (Tt - cy) / dy : 1e9);
        const ax = cx + dx * k, ay = cy + dy * k;
        c.save(); c.translate(ax, ay); c.rotate(a); c.scale(1.35, 1.35); c.fillStyle = T.col || PAL.amb; c.strokeStyle = '#0a2342'; c.lineWidth = 3; c.beginPath(); c.moveTo(16, 0); c.lineTo(-8, -11); c.lineTo(-3, 0); c.lineTo(-8, 11); c.closePath(); c.stroke(); c.fill(); c.restore();
        V.text(d >= 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d / 10) * 10 + ' m', ax - Math.cos(a) * 26, ay - Math.sin(a) * 26 + 5, { size: 13, align: 'center', bg: '#0a2342ee', color: '#fff', pad: 3 });
      }
    }
    // minimapa
    if (!opts.noMini) {
      // radar: ventana del mapa alrededor del jugador (el valle completo se ve tocándolo)
      const w = Math.round(Math.min(84, V.w * .21)), h = Math.round(w * 1.55), x = V.w - w - 10, y = 58, WT = 96, HT = Math.round(WT * h / w);
      const t0x = clamp(P.x / TS - WT / 2, 0, MW - WT), t0y = clamp(P.y / TS - HT / 2, 0, MH - HT), k = w / (WT * TS), ox0 = t0x * TS, oy0 = t0y * TS;
      this.mmRect = { x, y, w, h };
      c.fillStyle = '#0a2342'; c.fillRect(x - 3, y - 3, w + 6, h + 6); c.imageSmoothingEnabled = false; c.drawImage(this.map.mini, t0x, t0y, WT, HT, x, y, w, h);
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x - 1, y - 1, w + 2, h + 2);
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      const MX = px => x + (px - ox0) * k, MY = py => y + (py - oy0) * k;
      if (this.sim) for (const st of this.sim.st) { c.fillStyle = this.sim.ratioCol(st); c.fillRect(MX(st.x) - 1.5, MY(st.y) - 1.5, 3, 3); }
      else { c.fillStyle = '#fff'; for (const st of this.map.stations) c.fillRect(MX(st.x) - 1, MY(st.y) - 1, 2, 2); }
      const blink = (performance.now() / 300 | 0) % 2;
      for (const o of this.opps) { c.fillStyle = o.shirt || PAL.cor; c.fillRect(MX(o.x) - 2.5, MY(o.y) - 2.5, 5, 5); }
      for (const m of this.markers) { c.fillStyle = m.col || PAL.amb; const r = m === T ? (blink ? 4 : 3) : 2.5; c.fillRect(clamp(MX(m.x), x + 2, x + w - 2) - r, clamp(MY(m.y), y + 2, y + h - 2) - r, r * 2, r * 2); }
      c.fillStyle = '#ff2fb3'; c.beginPath(); c.arc(MX(P.x), MY(P.y), 3, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1; c.stroke();
      c.restore();
      V.text('MAPA', x + w / 2, y + h + 14, { size: 11, align: 'center', color: '#c4ec7c', bg: '#0a2342cc', pad: 2 });
    }
    // joystick
    const j = Input.joy; if (j.on) { c.globalAlpha = .55; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(j.ox, j.oy, 46, 0, TAU); c.stroke(); const dx = j.x - j.ox, dy = j.y - j.oy, l = Math.hypot(dx, dy), k2 = l > 46 ? 46 / l : 1; c.fillStyle = PAL.vd; c.beginPath(); c.arc(j.ox + dx * k2, j.oy + dy * k2, 20, 0, TAU); c.fill(); c.globalAlpha = 1; }
    if (this.big) drawOverview(V, { sim: this.sim, markers: this.markers, player: P, target: T, title: 'VISTA GENERAL · toca para cerrar' });
  }
  inMini(x, y) { const r = this.mmRect; return r && x > r.x - 8 && x < r.x + r.w + 8 && y > r.y - 8 && y < r.y + r.h + 24; }
}

/* vista general de todo el valle (Monitoreo y mapa grande) */
function drawOverview(V, o) {
  const c = V.ctx, top = o.top != null ? o.top : 54, bot = o.bot != null ? o.bot : 10, avail = V.h - top - bot;
  // recorte opcional (Monitoreo por zona): o.crop = {x0, y0, x1, y1} en px del mundo
  const cr = o.crop || { x0: 0, y0: 0, x1: MW * TS, y1: MH * TS }, cw = cr.x1 - cr.x0, chh = cr.y1 - cr.y0;
  const k = Math.min((V.w - 16) / cw, avail / chh), w = cw * k, h = chh * k, x = (V.w - w) / 2, y = top + (avail - h) / 2;
  o.rect = { x: x - cr.x0 * k, y: y - cr.y0 * k, k, w, h };
  if (!o.noBg) { c.fillStyle = '#0a2342f2'; c.fillRect(0, 0, V.w, V.h); }
  c.imageSmoothingEnabled = false; c.drawImage(JE.map.mini, cr.x0 / TS, cr.y0 / TS, cw / TS, chh / TS, x, y, w, h); c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
  const X = px => x + (px - cr.x0) * k, Y = py => y + (py - cr.y0) * k;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  if (o.title) V.text(o.title, V.w / 2, top - 8, { size: 15, align: 'center', color: '#c4ec7c' });
  const lbl = k * TS > 2.4;
  for (const L of LANDMARKS) if (lbl && L.id !== 'depot' && !L.secret) V.text(L.name.split(' · ')[0], X((L.x + L.w / 2) * TS), Y((L.y + L.h / 2) * TS), { size: 9, align: 'center', color: '#ffffffcc', stroke: '#0a2342', sw: 3 });
  const st = o.stations || (o.sim ? o.sim.st : JE.map.stations), rr = Math.max(4, Math.min(11, k * 26));
  for (const s of st) {
    const sx = X(s.x), sy = Y(s.y);
    if (o.sim) {
      const r = s.bikes / s.cap; c.fillStyle = '#0a2342'; c.beginPath(); c.arc(sx, sy, rr + 2, 0, TAU); c.fill();
      c.strokeStyle = '#ffffff33'; c.lineWidth = 3; c.beginPath(); c.arc(sx, sy, rr, 0, TAU); c.stroke();
      c.strokeStyle = o.sim.ratioCol(s); c.beginPath(); c.arc(sx, sy, rr, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(r, .02, 1)); c.stroke();
      if (o.sel === s) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(sx - rr - 4, sy - rr - 4, rr * 2 + 8, rr * 2 + 8); }
      if (rr >= 6) V.text(String(s.bikes), sx, sy + 4, { size: 10, align: 'center', color: '#fff' });
      if (s.broken) V.text('⚠', sx + rr, sy - rr, { size: 12, color: PAL.cor, body: true });
    } else { c.fillStyle = '#fff'; c.fillRect(sx - 2, sy - 2, 4, 4); }
  }
  const dp = o.base || JE.map.depot; c.fillStyle = PAL.cie; c.fillRect(X(dp.x) - 5, Y(dp.y) - 5, 10, 10); V.text(o.base ? 'BASE' : 'BODEGA', X(dp.x), Y(dp.y) + 16, { size: 10, align: 'center', color: PAL.cie, stroke: '#0a2342', sw: 3 });
  if (o.markers) for (const m of o.markers) { c.fillStyle = m.col || PAL.amb; c.beginPath(); c.arc(X(m.x), Y(m.y), m === o.target ? 6 : 4, 0, TAU); c.fill(); if (m.num) V.text(String(m.num), X(m.x), Y(m.y) - 8, { size: 11, align: 'center', color: '#fff', stroke: '#0a2342', sw: 3 }); }
  if (o.trucks) for (const t of o.trucks) { const a = Art.truckTop(t.load, 20); c.save(); c.translate(X(t.x), Y(t.y)); c.rotate(t.a + Math.PI / 2); c.drawImage(a, -6, -12, 12, 24); c.restore(); if (t.sel) { c.strokeStyle = PAL.amb; c.lineWidth = 2; c.strokeRect(X(t.x) - 9, Y(t.y) - 9, 18, 18); } }
  if (o.player) { c.fillStyle = '#ff2fb3'; c.beginPath(); c.arc(X(o.player.x), Y(o.player.y), 5, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
  c.restore();
  return o.rect;
}
