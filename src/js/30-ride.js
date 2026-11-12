/* =====================================================================
   SIMULACIÓN DE ESTACIONES + MOTOR DE RECORRIDO (vista cenital)
   ===================================================================== */
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
    const LA = this.map.lineA, LB = this.map.lineB;
    this.trains = [0, .25, .5, .75].map((f, i) => ({ L: LA, s: f * LA.len, dir: i % 2 ? 1 : -1, wait: 0 })).concat([{ L: LB, s: 0, dir: 1, wait: 0 }, { L: LB, s: LB.len, dir: -1, wait: 0 }]);
    if (this.blocked(this.p.x, this.p.y, this.stats_().r)) { const n = this.map.nearestOpen(Math.floor(this.p.x / TS), Math.floor(this.p.y / TS), this.p.veh === 'truck'); this.p.x = n.x * TS + 4; this.p.y = n.y * TS + 4; }
    this.initLife();
    this.mmRect = null; this.sl = 0; this.over = 0; this.cxf = s.x; this.cyf = s.y; this.joyDraw = null; this.ox = 0; this.oy = 0;
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
    // relieve real: en subida se pedalea más lento y en bajada se va más rápido (el camión lo siente menos; la bici eléctrica no sufre en subida)
    const sl = this.sl = this.map.slope(P.x, P.y, P.a), eb = P.veh === 'bike' && !!(M.ebike || this.ebike);
    mult *= P.veh === 'truck' ? clamp(1 - .9 * sl, .7, 1.12) : eb && sl > 0 ? 1 : clamp(1 - 2.2 * sl, .5, 1.32);
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
    // bajada fuerte a toda velocidad: hay que soltar un poco o la bici se desboca
    if (P.veh === 'bike' && sl < -.07 && P.v > S.max * 1.12 && P.stun <= 0) {
      this.over += dt; if (this.over > 1.2 && !this.overTold) { this.overTold = 1; this.float('¡Frena en la bajada!', PAL.amb); JE.ui && JE.ui.toast('⛰️ En las bajadas fuertes suelta un poco el dedo para frenar.'); }
      if (this.over > 3.2) { this.over = 0; P.stun = .5; P.v *= .3; this.stats.wobbles = (this.stats.wobbles || 0) + 1; this.float('¡Uy, casi!', PAL.cor); Snd.sfx('bad'); vib(40); }
    } else this.over = Math.max(0, this.over - dt * 1.5);
    this.stats.dist += st; const onC = this.tileAt() === TT.CICLO; if (onC) this.stats.ciclo += st;
    const ti = Math.floor(P.y / TS) * MW + Math.floor(P.x / TS), li = this.map.lightIdx(ti);
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
    let c = { x: Math.floor(this.p.x / TS), y: Math.floor(this.p.y / TS) };
    const D = this.map.flow(Math.floor(T.x / TS), Math.floor(T.y / TS), this.p.veh === 'truck', c.x, c.y);
    if (this.map.fv(D, c.x, c.y) >= 1e9) { const n = this.map.nearestOpen(c.x, c.y, this.p.veh === 'truck'); c = n; }
    for (let i = 0; i < 90; i++) { const n = this.map.nextStep(D, c.x, c.y); if (!n) break; c = n; if (i % 2 === 1) this.gps.push({ x: c.x * TS + 4, y: c.y * TS + 4 }); }
    this.flowD = D;
  }
  /* ---- tráfico: carros por las vías principales reales ---- */
  updCars(dt) {
    const P = this.p, R = 260, want = Math.round(16 * this.traffic * (this.mode.mods.pico ? 1.4 : 1)), M = this.map;
    this.spawnT -= dt;
    if (this.spawnT <= 0 && this.cars.length < want) {
      this.spawnT = .12; const near = M.lanesNear(this.cam.x, this.cam.y), L = near.length ? near[Math.floor(this.rng.f() * near.length)] : null;
      if (L && !(this.mode.mods.ciclovia && L.cv)) for (let k = 0; k < 4; k++) {
        const p = this.rng.f() * L.len, q = M.at(L, p, L.off);
        if (Math.abs(q.x - this.cam.x) > R || Math.abs(q.y - this.cam.y) > R || dist(q.x, q.y, P.x, P.y) < 70) continue;
        const c = { L, p, v: 0, spd: L.spd * this.rng.range(.8, 1.15), yield: 0, stop: 0, si: q.i }, r = this.rng.f();
        c.kind = L.spd > 30 && r < .1 ? 'bus' : r < .32 ? 'taxi' : 'car';
        c.col = c.kind === 'taxi' ? '#f5c400' : c.kind === 'bus' ? '#3f8f5a' : this.rng.pick(['#e9eef3', '#c43a26', '#2a5a92', '#1d1f24', '#9aa7b8', '#7a3b3b', '#3d6b3a', '#d98a3a']);
        this.carPos(c); this.cars.push(c); break;
      }
    }
    for (const c of this.cars) {
      let v = c.spd * (this.mode.mods.rain ? .85 : 1); if (c.stop > 0) { c.stop -= dt; v = 0; } if (c.yield > 0) { c.yield -= dt; v *= .35; }
      const len = c.kind === 'bus' ? 30 : 14;
      for (const o of this.cars) { if (o === c || o.L !== c.L) continue; const ahead = (o.p - c.p) * c.L.dir; if (ahead > 0 && ahead < len + 4) v = Math.min(v, o.v * .9); }
      const LL = c.L.lights; if (LL.length) {
        const front = c.p + len / 2 * c.L.dir; let s = null;
        if (c.L.dir > 0) { for (const q of LL) if (q.p0 >= front - 1) { s = q; break; } } else { for (let k = LL.length - 1; k >= 0; k--) if (LL[k].p1 <= front + 1) { s = LL[k]; break; } }
        if (s) { const d = c.L.dir > 0 ? s.p0 - front : front - s.p1, st = M.lightState(s.g, this.mode.t)[s.ax]; if (d < 24 && (st === 'r' || (st === 'a' && d > 6))) v = Math.min(v, Math.max(0, (d - 2) * 3)); }
      }
      const fx = Math.cos(c.ang), fy = Math.sin(c.ang), dx = P.x - c.x, dy = P.y - c.y, along = dx * fx + dy * fy, lat = Math.abs(-dx * fy + dy * fx);
      const pr = this.stats_().r; if (along > 0 && along < 20 + pr * 2 && lat < 4 + pr) { v = along < 12 + pr * 2 ? 0 : Math.min(v, 6); if (this.honkT <= 0 && P.v > 2 && dist(P.x, P.y, c.x, c.y) < 60) { this.honkT = 2.5; Snd.sfx('honk'); } }
      c.v = v; c.p += v * c.L.dir * dt; this.carPos(c);
      // choque con el jugador (rectángulo orientado con el carro)
      if (c.ghost > 0) c.ghost -= dt; else if (Math.abs(along) < (c.kind === 'bus' ? 13 : 6) + pr && lat < 3 + pr && P.stun <= 0 && !(this.inv > 0)) this.crash(c);
    }
    this.honkT -= dt;
    this.cars = this.cars.filter(c => c.p > -12 && c.p < c.L.len + 12 && dist(c.x, c.y, this.cam.x, this.cam.y) < R * 1.5);
  }
  carPos(c) { const q = this.map.at(c.L, c.p, c.L.off, c.si); c.si = q.i; c.x = q.x; c.y = q.y; c.ang = c.L.dir > 0 ? q.a : q.a + Math.PI; }
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
      const prev = t.s; t.s += 70 * t.dir * dt;
      for (const st of t.L.st) if ((prev - st.s) * (t.s - st.s) < 0) { t.wait = 1.4; t.s = st.s; }
      if (t.s > t.L.len) { t.s = t.L.len; t.dir = -1; t.wait = 2; } if (t.s < 0) { t.s = 0; t.dir = 1; t.wait = 2; }
    }
  }

  /* ---- dibujo en el búfer pixelado: suelo y cosas quietas. La cámara es continua: el búfer se corre por fracciones de pixel ---- */
  render(V, min) {
    const b = V.b, P = this.p, sk = this.shake > 0;
    const cxf = clamp(this.cam.x - V.vw / 2, -40, MW * TS - V.vw + 40) + (sk ? (this.rng.f() - .5) * 4 : 0), cyf = clamp(this.cam.y - V.vh / 2, -40, MH * TS - V.vh + 40) + (sk ? (this.rng.f() - .5) * 4 : 0);
    const ox = Math.floor(cxf), oy = Math.floor(cyf); this.ox = ox; this.oy = oy; this.cxf = cxf; this.cyf = cyf; V.subX = cxf - ox; V.subY = cyf - oy; this.min = min;
    const S = CH * TS, BW = V.vw + 1, BH = V.vh + 1;
    b.fillStyle = '#2f6b3a'; b.fillRect(0, 0, BW, BH);
    let made = 0;
    for (let cy = Math.floor(oy / S); cy <= Math.floor((oy + BH) / S); cy++) for (let cx = Math.floor(ox / S); cx <= Math.floor((ox + BW) / S); cx++) {
      if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue;
      if (!this.map.chunks.has(cx + ',' + cy)) made++;
      b.drawImage(this.map.chunk(cx, cy), cx * S - ox, cy * S - oy);
    }
    if (!made) { // precalienta un bloque vecino en la dirección de avance
      const cx = Math.floor(P.x / S) + Math.round(Math.cos(P.a) * 1.4), cy = Math.floor(P.y / S) + Math.round(Math.sin(P.a) * 1.4);
      if (cx >= 0 && cy >= 0 && cx * CH < MW && cy * CH < MH && !this.map.chunks.has(cx + ',' + cy)) this.map.chunk(cx, cy);
    }
    const inV = (x, y, m = 20) => x > ox - m && x < ox + BW + m && y > oy - m && y < oy + BH + m;
    // estaciones con sus bicis
    const t = performance.now() / 1000;
    for (const s of this.map.stations) {
      if (!inV(s.x, s.y, 30)) continue;
      const ss = this.sim ? this.sim.st[s.i] : null, bikes = ss ? ss.bikes : Math.round(s.cap * .55), x0 = s.tx * TS - ox, y0 = s.ty * TS - oy;
      prect(b, x0 + 1, y0 + 7, 24, 2, PAL.vd2); prect(b, x0 + 1, y0 + 7, 24, 1, PAL.vd1);
      const per = Math.ceil(s.cap / 2), sp = Math.min(3, 22 / per);
      for (let k = 0; k < s.cap; k++) { const row = k < per ? 0 : 1, bx = x0 + 2 + (k % per) * sp, by = y0 + (row ? 8 : 0); if (k < bikes) b.drawImage(Art.bikeTop(), Math.round(bx), by); else prect(b, Math.round(bx) + 1, by + 3, 1, 2, '#9aa7b8'); }
      if (s.type === 'm') { prect(b, x0 + 26, y0 + 4, 5, 8, '#1d2c44'); prect(b, x0 + 26, y0 + 3, 5, 2, '#e9eef3'); prect(b, x0 + 27, y0 + 6, 3, 2, '#9fb8cf'); }
      else { prect(b, x0 + 27, y0 + 4, 3, 7, '#2b2f38'); prect(b, x0 + 27, y0 + 5, 3, 2, (t * 2 | 0) % 2 ? PAL.vd : PAL.vd1); }
      if (ss && ss.broken) { if ((t * 3 | 0) % 2) { pline(b, x0 + 8, y0 + 2, x0 + 18, y0 + 14, PAL.cor); pline(b, x0 + 18, y0 + 2, x0 + 8, y0 + 14, PAL.cor); } }
      if (ss && !ss.open) { b.fillStyle = '#0a234299'; b.fillRect(x0, y0, 32, 16); }
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
    // ciclovía: conos en las avenidas cerradas a los carros
    if (this.mode.mods.ciclovia) for (const ln of this.map.lanesNear(this.cam.x, this.cam.y)) { if (!ln.cv || ln.dir < 0) continue; for (let s = 0; s < ln.len; s += 40) { const q = this.map.at(ln, s); if (!inV(q.x, q.y)) continue; prect(b, q.x - ox - 1, q.y - oy, 3, 3, '#ff8a3d'); prect(b, q.x - ox, q.y - oy - 1, 1, 1, '#ffffff'); } }
    // semáforos
    const LC = { g: '#4cff6a', a: '#ffc93c', r: '#ff4b3a' };
    for (const L of this.map.lights) {
      if (!inV(L.x, L.y, 30)) continue; const s = this.map.lightState(L, this.mode.t);
      const lamp = (x, y, k) => { prect(b, x - ox, y - oy, 3, 3, '#11151d'); prect(b, x - ox + 1, y - oy + 1, 1, 1, LC[k]); };
      lamp(L.x0 - 3, L.y0 - 3, s[0]); lamp(L.x1, L.y1, s[0]); lamp(L.x1, L.y0 - 3, s[1]); lamp(L.x0 - 3, L.y1, s[1]);
    }
  }
  /* ---- capa de objetos que se mueven: se dibujan a resolución de pantalla (giran suave, sin temblar) ---- */
  renderTop(V) {
    const c = V.ctx, k = V.s * V.dpr, ox = this.cxf, oy = this.cyf, P = this.p, vw = V.vw + 2, vh = V.vh + 2;
    const inV = (x, y, m = 20) => x > ox - m && x < ox + vw + m && y > oy - m && y < oy + vh + m;
    const spr = (img, x, y, a, sh) => { c.save(); c.translate(x - ox, y - oy); c.rotate(a + Math.PI / 2); if (sh) { c.fillStyle = sh; c.fillRect(-img.width / 2 + 1, -img.height / 2 + 1.5, img.width, img.height); } c.drawImage(img, -img.width / 2, -img.height / 2); c.restore(); };
    c.save(); c.setTransform(k, 0, 0, k, 0, 0); c.imageSmoothingEnabled = false;
    this.drawGround(c, ox, oy, inV);
    for (const cr of this.cars) if (inV(cr.x, cr.y)) spr(Art.carTop(cr.col, cr.kind), cr.x, cr.y, cr.ang, '#0004');
    for (const o of this.opps) if (inV(o.x, o.y)) { c.globalAlpha = .9; spr(Art.riderTop(o.shirt || PAL.cor, '#ffffff', o.skin || SKINS[2]), o.x, o.y, o.a); c.globalAlpha = 1; }
    const pr = Save.data.profile, sp = P.veh === 'truck' ? Art.truckTop(P.load, P.cap) : Art.rider(this.mode.shirt);
    spr(sp, P.x, P.y, P.a, '#0005');
    // trenes del metro sobre el viaducto
    const tc = Art.trainCar();
    for (const tr of this.trains) for (let j = -1; j <= 1; j++) { const s = tr.s + j * 17; if (s < 0 || s > tr.L.len) continue; const q = this.map.at(tr.L, s); if (inV(q.x, q.y)) spr(tc, q.x, q.y, q.a); }
    this.drawSky(c, ox, oy);
    for (const f of this.fx) if (f.k === 'p') { c.fillStyle = f.col; c.fillRect(f.x - ox, f.y - oy, 1, 1); }
    c.restore();
    // pantalla completa: lluvia, noche y luces
    c.save(); c.setTransform(k, 0, 0, k, 0, 0);
    if (this.mode.mods.rain) { c.fillStyle = '#cfe8ff88'; for (const d of this.drops) c.fillRect(d.x * vw / 400, d.y * vh / 400, .6, 3); c.fillStyle = '#0a234222'; c.fillRect(0, 0, vw, vh); }
    const n = Art.night(this.min); if (n > 0) { c.fillStyle = 'rgba(8,18,52,' + (n * .5).toFixed(3) + ')'; c.fillRect(0, 0, vw, vh); }
    this.drawGlow(c, ox, oy, inV, n);
    c.restore();
  }
  /* ---- capa nítida: etiquetas, flecha, minimapa, joystick ---- */
  hud(V, opts = {}) {
    const c = V.ctx, s = V.s, ox = this.cxf, oy = this.cyf, P = this.p;
    const sx = x => (x - ox) * s, sy = y => (y - oy) * s;
    if (s >= 3 || V.w > 700) {
      for (const st of this.map.stations) { const x = sx(st.x), y = sy(st.y) - 16 * s / 3; if (x > -60 && x < V.w + 60 && y > 40 && y < V.h) V.text(st.name, x, y, { size: 11, align: 'center', bg: '#0a2342dd', color: '#c4ec7c', pad: 3 }); }
      for (const L of LANDMARKS) { const x = sx((L.x + L.w / 2) * TS), y = sy((L.y + L.h / 2) * TS); if (x > -80 && x < V.w + 80 && y > 40 && y < V.h) V.text(L.name, x, y, { size: 12, align: 'center', stroke: '#0a2342', sw: 4, color: '#fff' }); }
    }
    for (const o of this.opps) { const x = sx(o.x), y = sy(o.y) - 14; if (x > 0 && x < V.w && y > 0 && y < V.h) V.text(o.name, x, y, { size: 11, align: 'center', color: '#fff', bg: o.shirt || PAL.cor, pad: 2 }); }
    if (this.stamp) { const k = this.stamp, a = Math.min(1, k.t * 3, (1.8 - k.t) * 8 + .2); c.save(); c.globalAlpha = clamp(a, 0, 1); c.translate(V.w / 2, V.h * .38); c.rotate(-.08); const w = Math.min(V.w - 40, 330); c.fillStyle = '#0008'; c.fillRect(-w / 2 + 6, -38, w, 82); c.fillStyle = k.bg || PAL.amb; c.fillRect(-w / 2, -44, w, 82); c.strokeStyle = PAL.az; c.lineWidth = 4; c.strokeRect(-w / 2 + 2, -42, w - 4, 78); V.text(k.title, 0, -8, { size: 30, align: 'center', color: PAL.az }); V.text(k.sub || '', 0, 20, { size: 15, align: 'center', color: PAL.az, body: true }); c.restore(); }
    this.hudLife(V, sx, sy);
    // subida / bajada (como en Run Scooter): aviso sobre el ciclista
    const pct = Math.round(this.sl * 100); if (Math.abs(pct) >= 3 && !this.big) { const up = pct > 0, eb = up && this.ebike && P.veh === 'bike'; V.text((up ? '▲ SUBIDA ' : '▼ BAJADA ') + Math.abs(pct) + ' %' + (eb ? ' ⚡' : ''), sx(P.x), sy(P.y) - 34, { size: 12, align: 'center', color: up ? '#0a2342' : '#fff', bg: up ? '#f4efe1' : (this.over > 1 ? '#c0392b' : '#e0533f'), pad: 3, border: '#0a2342' }); }
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
      const w = Math.round(Math.min(84, V.w * .21)), h = Math.round(w * 1.55), x = V.w - w - 10, y = 58, WT = 160, HT = Math.round(WT * h / w), MK = this.map.miniK;
      const t0x = clamp(P.x / TS - WT / 2, 0, MW - WT), t0y = clamp(P.y / TS - HT / 2, 0, MH - HT), k = w / (WT * TS), ox0 = t0x * TS, oy0 = t0y * TS;
      this.mmRect = { x, y, w, h };
      c.fillStyle = '#0a2342'; c.fillRect(x - 3, y - 3, w + 6, h + 6); c.imageSmoothingEnabled = false; c.drawImage(this.map.mini, t0x / MK, t0y / MK, WT / MK, HT / MK, x, y, w, h);
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
  const MK = JE.map.miniK; c.imageSmoothingEnabled = k * TS < 3; c.drawImage(JE.map.mini, cr.x0 / TS / MK, cr.y0 / TS / MK, cw / TS / MK, chh / TS / MK, x, y, w, h); c.imageSmoothingEnabled = false; c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
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
