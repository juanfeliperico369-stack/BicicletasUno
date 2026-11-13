/* =====================================================================
   CIUDAD VIVA: ciclistas y peatones que recorren toda la red de calles hacia un destino,
   y el mapa grande: se abre, se mueve, se acerca y se toca para marcar a dónde ir.
   ===================================================================== */
const BIKE_OK = v => v === TT.CICLO || v === TT.ROAD || v === TT.AVE || v === TT.BRIDGE || v === TT.PLAZA;
const FOOT_OK = v => v === TT.WALK || v === TT.PLAZA || v === TT.STEPS || v === TT.CICLO || v === TT.GRASS;
/* siguiente casilla: de frente, hacia el destino y por su tipo de vía preferido; nunca se devuelve si puede seguir */
function npcNext(M, q, ok, pref, R) {
  const cx = q.tx, cy = q.ty, gx = q.gx - cx, gy = q.gy - cy, gl = Math.hypot(gx, gy) || 1, hl = Math.hypot(q.dx, q.dy) || 1; let best = null, bs = -1e9;
  for (const [dx, dy] of N8) {
    const v = M.get(cx + dx, cy + dy); if (!ok(v)) continue;
    if (dx && dy && SOLID[M.get(cx + dx, cy)] && SOLID[M.get(cx, cy + dy)]) continue;
    const l = dx && dy ? .7071 : 1, fw = (dx * q.dx + dy * q.dy) * l / hl; if (fw < -.3) continue;
    const s = fw * 1.1 + (dx * gx + dy * gy) * l / gl * .9 + pref(v) + R.f() * .35; if (s > bs) { bs = s; best = [dx, dy]; }
  }
  return best;
}
function npcGoal(R, q) { const S = R.map.stations, c = R.rng.pick(S), d = Math.hypot(c.tx - q.tx, c.ty - q.ty); const s = d < 90 ? c : R.rng.pick(S); q.gx = s.tx + 2; q.gy = s.ty + 2; }
/* avanza hacia el centro de la siguiente casilla (por la derecha de la vía); al llegar, decide de nuevo */
function npcMove(R, q, dt, ok, pref, off) {
  const M = R.map; if (q.tx == null) { q.tx = Math.floor(q.x / TS); q.ty = Math.floor(q.y / TS); q.nx = q.ny = 0; npcGoal(R, q); }
  if (!q.nx && !q.ny) {
    let d = npcNext(M, q, ok, pref, R.rng);
    if (!d) { d = ok(M.get(q.tx - Math.sign(q.dx), q.ty - Math.sign(q.dy))) ? [-Math.sign(q.dx), -Math.sign(q.dy)] : null; npcGoal(R, q); if (!d || (!d[0] && !d[1])) { q.stuck = (q.stuck || 0) + dt; return; } }
    q.nx = d[0]; q.ny = d[1]; q.dx = d[0]; q.dy = d[1]; if (Math.abs(q.tx - q.gx) + Math.abs(q.ty - q.gy) < 4) npcGoal(R, q);
  }
  const l = Math.hypot(q.nx, q.ny), ux = q.nx / l, uy = q.ny / l, v = M.get(q.tx + q.nx, q.ty + q.ny), o = off(v), tx = (q.tx + q.nx) * TS + TS / 2 - uy * o, ty = (q.ty + q.ny) * TS + TS / 2 + ux * o;
  const ddx = tx - q.x, ddy = ty - q.y, dl = Math.hypot(ddx, ddy), st = q.v * dt;
  if (dl <= st + .5) { q.x = tx; q.y = ty; q.tx += q.nx; q.ty += q.ny; q.nx = q.ny = 0; } else { q.x += ddx / dl * st; q.y += ddy / dl * st; }
  if (dl > .5) q.a += angDiff(q.a, Math.atan2(ddy, ddx)) * Math.min(1, dt * 7);
}
Ride.prototype.updLife = function (dt) {
  _updLife.call(this, dt);
  const B = this.npcB || (this.npcB = []), P = this.p, cam = this.cam, M = this.map, want = JE.headless ? 3 : 10;
  if ((this.npcT = (this.npcT || 0) - dt) <= 0 && B.length < want) {
    this.npcT = .25;
    for (let k = 0; k < 10; k++) {
      const tx = Math.floor(cam.x / TS) + this.rng.i(-16, 16), ty = Math.floor(cam.y / TS) + this.rng.i(-22, 22), v = M.get(tx, ty); if (!(v === TT.CICLO || (v === TT.ROAD && k > 4))) continue;
      const x = tx * TS + TS / 2, y = ty * TS + TS / 2; if (dist(x, y, P.x, P.y) < 70 * WK) continue; const d = this.rng.pick(N8);
      B.push({ x, y, dx: d[0], dy: d[1], a: Math.atan2(d[1], d[0]), v: 0, vmax: this.rng.range(30, 46) * WK, shirt: this.rng.pick(SHIRTS.slice(0, 7)), helmet: this.rng.pick(HELMETS.slice(0, 5)), skin: this.rng.pick(SKINS) }); break;
    }
  }
  for (const q of B) {
    // frena ante el semáforo en rojo, ante el jugador y ante otros ciclistas
    let lim = q.vmax; const ax = Math.cos(q.a), ay = Math.sin(q.a);
    if (q.nx || q.ny) { const li = M.lightIdx((q.ty + q.ny) * MW + q.tx + q.nx); if (li >= 0 && li !== M.lightIdx(q.ty * MW + q.tx) && M.lightState(M.lights[li], this.mode.t)[Math.abs(q.nx) >= Math.abs(q.ny) ? 0 : 1] !== 'g') lim = 0; }
    const near = (x, y) => { const dx = x - q.x, dy = y - q.y, al = dx * ax + dy * ay; return al > 1 && al < 13 * WK && Math.abs(-dx * ay + dy * ax) < 5 * WK; };
    if (near(P.x, P.y)) lim = Math.min(lim, P.v * .8); for (const o of B) if (o !== q && near(o.x, o.y)) { lim = Math.min(lim, o.v * .9); break; }
    q.v += clamp(lim - q.v, -160 * dt, 60 * dt); if (q.v < 0) q.v = 0;
    npcMove(this, q, dt, BIKE_OK, v => v === TT.CICLO ? .7 : v === TT.AVE ? -.25 : v === TT.PLAZA ? -.3 : 0, v => v === TT.CICLO || v === TT.PLAZA ? 0 : 3.2);
    if (P.veh !== 'truck' && dist(q.x, q.y, P.x, P.y) < 5 && P.v > 10) { P.v *= .6; q.v *= .5; if (!this.bTold) { this.bTold = 1; this.float('¡Ojo, ciclista!', PAL.amb); } }
  }
  this.npcB = B.filter(q => (q.stuck || 0) < 3 && Math.abs(q.x - cam.x) < 300 * WK && Math.abs(q.y - cam.y) < 300 * WK);
};
/* peatones: andenes, plazas y parques; cruzan la calle y siguen su camino */
Ride.prototype.pedStep = function (q, dt) {
  if (q.v == null) { q.v = q.spd; q.a = Math.atan2(q.dy, q.dx); q.cross = 0; }
  const M = this.map, on = isRoad(M.get(Math.floor(q.x / TS), Math.floor(q.y / TS))); q.cross = on ? q.cross + dt : 0; q.v = q.spd * (on ? 1.5 : 1);
  npcMove(this, q, dt, v => FOOT_OK(v) || (isRoad(v) && v !== TT.AUTO && q.cross < 3), v => isRoad(v) ? -.9 : v === TT.CICLO ? -.6 : v === TT.GRASS ? -.25 : 0, () => 0);
  if ((q.stuck || 0) > 2) q.x = 1e9;
};

/* ---------- mapa grande interactivo ---------- */
const MUNIS = [['Medellín', 6.2476, -75.5709], ['Bello', 6.3373, -75.5579], ['Itagüí', 6.1719, -75.6114], ['Envigado', 6.1715, -75.5860], ['Sabaneta', 6.1515, -75.6164], ['La Estrella', 6.1577, -75.6434], ['Caldas', 6.0911, -75.6357], ['Copacabana', 6.3463, -75.5089], ['Girardota', 6.3772, -75.4461], ['Barbosa', 6.4390, -75.3320]];
const MapView = JE.mapView = {
  open: false, ride: null, cx: 0, cy: 0, z: .12, pts: new Map(), route: null, btns: [],
  init() {
    if (this._on) return; this._on = true; const st = $('#sGame'), cv = $('#cv'), pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    st.addEventListener('pointerdown', e => { if (!this.open || e.target !== cv) return; e.stopPropagation(); e.preventDefault(); const p = pos(e); this.pts.set(e.pointerId, { x: p.x, y: p.y, x0: p.x, y0: p.y, t: performance.now() }); if (this.pts.size === 2) this.pinch0 = this.span(); }, true);
    st.addEventListener('pointermove', e => {
      const q = this.pts.get(e.pointerId); if (!this.open || !q) return; e.stopPropagation(); const p = pos(e);
      if (this.pts.size === 1) { this.cx -= (p.x - q.x) / this.z; this.cy -= (p.y - q.y) / this.z; }
      q.x = p.x; q.y = p.y; if (this.pts.size === 2 && this.pinch0) { const s = this.span(); this.zoom(s / this.pinch0); this.pinch0 = s; }
      this.clampC();
    }, true);
    const up = e => { const q = this.pts.get(e.pointerId); if (!q) return; this.pts.delete(e.pointerId); if (!this.open) return; e.stopPropagation(); if (this.pts.size === 0 && Math.hypot(q.x - q.x0, q.y - q.y0) < 9 && performance.now() - q.t < 450) this.tap(q.x, q.y); };
    st.addEventListener('pointerup', up, true); st.addEventListener('pointercancel', up, true);
    st.addEventListener('wheel', e => { if (!this.open) return; e.preventDefault(); this.zoom(e.deltaY < 0 ? 1.2 : 1 / 1.2); }, { passive: false });
  },
  span() { const a = [...this.pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1; },
  zoom(f) { this.z = clamp(this.z * f, this.zMin(), 2.2); this.clampC(); },
  zMin() { return Math.min(View.w / (MW * TS), View.h / (MH * TS)) * .95; },
  clampC() { this.cx = clamp(this.cx, 0, MW * TS); this.cy = clamp(this.cy, 0, MH * TS); },
  show(ride) { this.init(); this.ride = ride; this.open = true; ride.big = true; this.cx = ride.p.x; this.cy = ride.p.y; this.z = clamp(View.w / (150 * TS), this.zMin(), 2.2); this.pts.clear(); this.route = null; this.wasPaused = Game.paused; if (!(Game.meta && Game.meta.net)) Game.paused = true; Snd.sfx('tap'); },
  hide() { if (!this.open) return; this.open = false; if (this.ride) this.ride.big = false; this.pts.clear(); if (!(Game.meta && Game.meta.net)) { Game.paused = !!this.wasPaused; Game.last = performance.now(); } Snd.sfx('tap'); },
  W(x, y) { return { x: this.cx + (x - View.w / 2) / this.z, y: this.cy + (y - View.h / 2) / this.z }; },
  tap(x, y) {
    for (const b of this.btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.fn();
    const w = this.W(x, y), R = this.ride, M = JE.map, r = 16 / this.z; let name = '', px = w.x, py = w.y, bd = r;
    for (const s of M.stations) { const d = dist(s.x, s.y, w.x, w.y); if (d < bd) { bd = d; name = 'EnCicla ' + s.name; px = s.x; py = s.y + 12 * WK; } }
    for (const L of LANDMARKS) { if (L.secret) continue; const lx = (L.x + L.w / 2) * TS, ly = (L.y + L.h) * TS + 6 * WK, d = dist(lx, (L.y + L.h / 2) * TS, w.x, w.y); if (d < bd) { bd = d; name = L.name; px = lx; py = ly; } }
    const o = M.nearestOpen(Math.floor(px / TS), Math.floor(py / TS), R.p.veh === 'truck'); if (!o) return;
    R.way = { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2, label: name || 'Tu destino', col: '#ff2fb3' }; R.gpsT = 0; this.route = null; Snd.sfx('star'); vib(20);
  },
  /* ruta completa del jugador al destino (o a la tarea actual) */
  calcRoute() {
    const R = this.ride, T = R.way || R.target, M = JE.map, out = []; this.routeFor = T; if (!T) return (this.route = out);
    let c = { x: Math.floor(R.p.x / TS), y: Math.floor(R.p.y / TS) }; const D = M.flow(Math.floor(T.x / TS), Math.floor(T.y / TS), R.p.veh === 'truck', c.x, c.y);
    if (M.fv(D, c.x, c.y) >= 1e9) c = M.nearestOpen(c.x, c.y, R.p.veh === 'truck');
    for (let i = 0; i < 1500; i++) { const n = M.nextStep(D, c.x, c.y); if (!n) break; c = n; if (i % 2 === 0) out.push(c.x * TS + TS / 2, c.y * TS + TS / 2); }
    return (this.route = out);
  },
  draw(V, ready) {
    const c = V.ctx, R = this.ride, M = JE.map, z = this.z, top = (View.hudB || 50) + 6, X = x => (x - this.cx) * z + V.w / 2, Y = y => (y - this.cy) * z + V.h / 2;
    c.fillStyle = '#0b1a30'; c.fillRect(0, 0, V.w, V.h);
    // base: plano general suavizado o, de cerca, la ciudad real
    const x0 = this.cx - V.w / 2 / z, y0 = this.cy - V.h / 2 / z, x1 = this.cx + V.w / 2 / z, y1 = this.cy + V.h / 2 / z, S = CH * TS;
    if (z < .95 || ready) { const mk = M.miniK * TS; c.imageSmoothingEnabled = true; c.globalAlpha = .9; c.drawImage(M.mini, X(0), Y(0), M.mini.width * mk * z, M.mini.height * mk * z); c.globalAlpha = 1; }
    if (z >= .95 || ready) { c.imageSmoothingEnabled = true; const L = ready || []; if (!ready) for (let cy = Math.max(0, Math.floor(y0 / S)); cy <= Math.floor(y1 / S); cy++) for (let cx = Math.max(0, Math.floor(x0 / S)); cx <= Math.floor(x1 / S); cx++) if (cx * CH < MW && cy * CH < MH) L.push([cx, cy]); for (const [cx, cy] of L) c.drawImage(M.chunkG(cx, cy), X(cx * S), Y(cy * S), S * z + .5, S * z + .5); }
    const vis = (x, y, m = 20) => x > x0 - m / z && x < x1 + m / z && y > y0 - m / z && y < y1 + m / z, line = (pts, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineJoin = c.lineCap = 'round'; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(X(p.x), Y(p.y)) : c.moveTo(X(p.x), Y(p.y))); c.stroke(); };
    if (z < .5) {   // vías principales y río, nítidos de lejos
      line(M.river.pts, Math.max(2, 22 * z), '#3f86c8');
      const seen = new Set(); for (const ln of M.lanes) { if (seen.has(ln.pts)) continue; seen.add(ln.pts); const a = ln.pts[0], b = ln.pts[ln.pts.length - 1]; if (!vis(a.x, a.y, 4000) && !vis(b.x, b.y, 4000)) continue; line(ln.pts, Math.max(1, (ln.cls === 't' ? 20 : 13) * z), ln.cls === 't' ? '#f0d27a' : '#e6e2d6'); }
    }
    for (const L of [M.lineA, M.lineB]) { line(L.pts, Math.max(2.5, 9 * z), '#0a2342'); line(L.pts, Math.max(1.5, 6 * z), L === M.lineA ? '#4a90d9' : '#f08a2b'); if (z > .1) for (const s of L.st) { const p = M.at(L, s.s), sx = X(p.x), sy = Y(p.y); if (sx < 0 || sy < 0 || sx > V.w || sy > V.h) continue; c.fillStyle = '#fff'; c.beginPath(); c.arc(sx, sy, 3.2, 0, TAU); c.fill(); c.strokeStyle = '#0a2342'; c.lineWidth = 1.5; c.stroke(); if (z > .3) V.text('Ⓜ ' + s.name, sx, sy - 7, { size: 10, align: 'center', color: '#fff', stroke: '#0a2342', sw: 3, body: true }); } }
    // ruta al destino
    const T = R.way || R.target; if (!this.route || this.routeFor !== T) this.calcRoute();
    if (this.route.length > 2) { c.strokeStyle = '#ff2fb3'; c.lineWidth = 4; c.lineJoin = c.lineCap = 'round'; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(X(R.p.x), Y(R.p.y)); for (let i = 0; i < this.route.length; i += 2) c.lineTo(X(this.route[i]), Y(this.route[i + 1])); c.stroke(); c.setLineDash([]); }
    // referencias: municipios, lugares y estaciones
    const lab = [], room = (x, y, w, h) => { if (x - w / 2 < 2 || x + w / 2 > V.w - 2 || y - h < top || y > V.h - 70) return false; for (const r of lab) if (Math.abs(r.x - x) < (r.w + w) / 2 + 4 && Math.abs(r.y - y) < (r.h + h) / 2 + 2) return false; lab.push({ x, y, w, h }); return true; };
    if (z < .22) for (const [n, la, lo] of MUNIS) { const g = geoP(la, lo), sx = X(g.x), sy = Y(g.y); if (room(sx, sy, n.length * 9, 18)) V.text(n.toUpperCase(), sx, sy, { size: 14, align: 'center', color: '#fff', stroke: '#0a2342', sw: 4 }); }
    for (const s of M.stations) { const sx = X(s.x), sy = Y(s.y); if (sx < -5 || sy < top || sx > V.w + 5 || sy > V.h) continue; const r = z > .3 ? 5 : 3; c.fillStyle = '#0a2342'; c.fillRect(sx - r - 1, sy - r - 1, r * 2 + 2, r * 2 + 2); c.fillStyle = s.e ? '#ffd84a' : PAL.vd; c.fillRect(sx - r, sy - r, r * 2, r * 2); }
    if (z > .1) for (const L of LANDMARKS) { if (L.secret || L.id === 'depot') continue; const sx = X((L.x + L.w / 2) * TS), sy = Y((L.y + L.h / 2) * TS); if (sx < 0 || sy < top || sx > V.w || sy > V.h) continue; const nm = L.name.split(' · ')[0]; c.fillStyle = PAL.amb; c.beginPath(); c.arc(sx, sy, 4, 0, TAU); c.fill(); c.strokeStyle = '#0a2342'; c.lineWidth = 2; c.stroke(); if (room(sx, sy - 8, nm.length * 6.4 + 8, 15)) V.text(nm, sx, sy - 8, { size: 11, align: 'center', color: '#fff', stroke: '#0a2342', sw: 3, body: true }); }
    if (z > .34) for (const s of M.stations) { const sx = X(s.x), sy = Y(s.y); if (sx < 0 || sy < top || sx > V.w || sy > V.h) continue; if (room(sx, sy + 17, s.name.length * 6 + 8, 14)) V.text(s.name, sx, sy + 17, { size: 10, align: 'center', color: '#c4ec7c', stroke: '#0a2342', sw: 3, body: true }); }
    // tareas, destino y tú
    for (const m of R.markers) { const sx = X(m.x), sy = Y(m.y); if (sx < 0 || sy < top || sx > V.w || sy > V.h) continue; c.fillStyle = m.col || PAL.amb; c.strokeStyle = '#0a2342'; c.lineWidth = 2; c.beginPath(); c.arc(sx, sy, m === R.target ? 7 : 5, 0, TAU); c.fill(); c.stroke(); if (m.num) V.text(String(m.num), sx, sy + 4, { size: 10, align: 'center', color: '#0a2342' }); }
    if (R.way) { const sx = X(R.way.x), sy = Y(R.way.y); c.fillStyle = '#ff2fb3'; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(sx, sy - 14, 8, Math.PI * .85, Math.PI * .15); c.lineTo(sx, sy); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(sx, sy - 14, 3, 0, TAU); c.fill(); }
    { const sx = X(R.p.x), sy = Y(R.p.y); c.save(); c.translate(sx, sy); c.rotate(R.p.a); c.fillStyle = '#fff'; c.strokeStyle = '#0a2342'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(11, 0); c.lineTo(-7, -7); c.lineTo(-3, 0); c.lineTo(-7, 7); c.closePath(); c.fill(); c.stroke(); c.restore(); }
    // botones
    this.btns = []; const B = (x, y, w, h, t, fn, bg) => { c.fillStyle = bg || '#0e2d55ee'; c.beginPath(); c.roundRect(x, y, w, h, 12); c.fill(); c.strokeStyle = '#ffffff55'; c.lineWidth = 1.5; c.stroke(); V.text(t, x + w / 2, y + h / 2 + 6, { size: 17, align: 'center', color: '#fff' }); this.btns.push({ x, y, w, h, fn }); };
    B(V.w - 58, top + 4, 48, 44, '✕', () => this.hide(), '#d6409fee'); B(V.w - 58, top + 56, 48, 44, '+', () => this.zoom(1.5)); B(V.w - 58, top + 104, 48, 44, '−', () => this.zoom(1 / 1.5)); B(V.w - 58, top + 156, 48, 44, '◎', () => { this.cx = R.p.x; this.cy = R.p.y; });
    const d = T ? Math.round(dist(R.p.x, R.p.y, T.x, T.y) * M_PER_PX) : 0, dt = d >= 1000 ? (d / 1000).toFixed(1) + ' km' : d + ' m';
    if (R.way) { V.text('📍 ' + R.way.label.slice(0, 26) + ' · ' + dt, 12, V.h - 76, { size: 14, color: '#fff', bg: '#0a2342ee', pad: 6, body: true }); B(12, V.h - 60, 150, 44, 'Quitar destino', () => { R.way = null; R.gpsT = 0; this.route = null; }); B(V.w - 132, V.h - 60, 120, 44, '▶ Ir', () => this.hide(), '#5e9a1eee'); }
    else V.text('Toca el mapa para marcar a dónde ir', V.w / 2, V.h - 30, { size: 14, align: 'center', color: '#fff', bg: '#0a2342ee', pad: 6, body: true });
  }
};
/* el destino marcado guía la flecha y la línea; al llegar se borra */
const _upd78 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) { _upd78.call(this, dt, dir); const w = this.way; if (w && dist(w.x, w.y, this.p.x, this.p.y) < 16 * WK) { this.way = null; this.gpsT = 0; Snd.sfx('star'); JE.ui && JE.ui.toast('📍 Llegaste a ' + w.label); } };
const _dg78 = Ride.prototype.drawGround;
Ride.prototype.drawGround = function (b, ox, oy, inV) { _dg78.call(this, b, ox, oy, inV); const w = this.way; if (w && inV(w.x, w.y)) { const t = performance.now() / 300, r = 7 + Math.sin(t) * 1.5; b.strokeStyle = '#ff2fb3'; b.lineWidth = 2; b.beginPath(); b.arc(w.x - ox, w.y - oy, r, 0, TAU); b.stroke(); b.fillStyle = '#ff2fb3'; b.beginPath(); b.arc(w.x - ox, w.y - oy, 2.5, 0, TAU); b.fill(); } };
