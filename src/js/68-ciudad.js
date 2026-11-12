/* =====================================================================
   CIUDAD VIVA (v0.8): motos, camiones, ciclistas en las ciclorrutas, caminar en el modo libre
   y el minijuego de bajar y organizar bicis con equilibrio (Balance y Anfitrión).
   ===================================================================== */
/* ---------- vehículos nuevos: moto y camión ---------- */
const _carTop = Art.carTop;
Art.carTop = function (col, kind) {
  if (kind !== 'moto' && kind !== 'camion') return _carTop.call(this, col, kind);
  const k = 'ct' + col + kind; let c = this.cache.get(k); if (c) return c;
  c = kind === 'moto' ? this.mk(3, 7, x => { prect(x, 1, 0, 1, 2, '#151a22'); prect(x, 0, 2, 3, 3, col); prect(x, 1, 3, 1, 2, '#1d2c44'); prect(x, 1, 5, 1, 2, '#151a22'); prect(x, 1, 0, 1, 1, '#fff6c0'); })
    : this.mk(8, 22, x => { prect(x, 0, 0, 8, 6, col); prect(x, 1, 1, 6, 2, '#1d2c44'); prect(x, 0, 7, 8, 15, '#d8dde3'); prect(x, 0, 7, 8, 1, '#9aa7b8'); for (let i = 9; i < 21; i += 3) prect(x, 1, i, 6, 1, '#c3cad2'); prect(x, 0, 21, 1, 1, PAL.cor); prect(x, 7, 21, 1, 1, PAL.cor); prect(x, 0, 0, 1, 1, '#fff6c0'); prect(x, 7, 0, 1, 1, '#fff6c0'); });
  this.cache.set(k, c); return c;
};
/* persona caminando vista desde arriba (2 cuadros) */
Art.walker = function (f) {
  const P = Save.data.profile, k = 'wk' + f + P.skin + P.hair + P.hairCol + P.shirt + P.pants; let c = this.cache.get(k); if (c) return c;
  const me = Art.me();
  c = this.mk(7, 8, x => {
    prect(x, 1, 2, 5, 3, me.shirt); prect(x, 0, 3, 1, 2, me.skin); prect(x, 6, 3, 1, 2, me.skin);
    prect(x, 2, f ? 5 : 6, 1, 2, me.pants); prect(x, 4, f ? 6 : 5, 1, 2, me.pants);
    prect(x, 2, 0, 3, 3, me.skin); if (me.hairStyle !== 3) prect(x, 2, 0, 3, me.hairStyle === 2 ? 2 : 1, me.hairStyle === 2 ? me.cap : me.hair); if ([1, 5, 7].includes(me.hairStyle)) prect(x, 3, 2, 1, 2, me.hair);
  });
  this.cache.set(k, c); return c;
};
const WSURF = [.85, 0, 0, 0, .95, .95, 1, 1, 0, 0, 1, .95, 1, 0, .9, 1, .85];   // caminando
/* ---------- tráfico más variado y ciclistas en las ciclorrutas ---------- */
const _updCars = Ride.prototype.updCars;
Ride.prototype.updCars = function (dt) {
  const n0 = this.cars.length; _updCars.call(this, dt);
  for (let i = n0; i < this.cars.length; i++) {   // carros recién creados: algunos son motos o camiones
    const c = this.cars[i], r = this.rng.f(); if (c.kind !== 'car') continue;
    if (r < .38) { c.kind = 'moto'; c.spd *= 1.12; c.col = this.rng.pick(['#c43a26', '#1d1f24', '#2a5a92', '#e9eef3', '#ffc93c']); }
    else if (r < .5 && c.L.cls !== 's') { c.kind = 'camion'; c.spd *= .82; c.col = this.rng.pick(['#e9eef3', '#2a5a92', '#c43a26', '#3d6b3a']); }
  }
};
const _updLife = Ride.prototype.updLife;
Ride.prototype.updLife = function (dt) {
  _updLife.call(this, dt);
  const B = this.npcB || (this.npcB = []), P = this.p, cam = this.cam, M = this.map, want = JE.headless ? 3 : 8;
  if ((this.npcT = (this.npcT || 0) - dt) <= 0 && B.length < want) {
    this.npcT = .3;
    for (let k = 0; k < 8; k++) {
      const tx = Math.floor(cam.x / TS) + this.rng.i(-14, 14), ty = Math.floor(cam.y / TS) + this.rng.i(-20, 20); if (M.get(tx, ty) !== TT.CICLO) continue;
      const x = tx * TS + TS / 2, y = ty * TS + TS / 2; if (dist(x, y, P.x, P.y) < 60 * WK) continue;
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(d => M.get(tx + d[0], ty + d[1]) === TT.CICLO); if (!dirs.length) continue;
      const d = this.rng.pick(dirs); B.push({ x, y, dx: d[0], dy: d[1], a: Math.atan2(d[1], d[0]), v: this.rng.range(34, 50) * WK, shirt: this.rng.pick(SHIRTS.slice(0, 7)), helmet: this.rng.pick(HELMETS.slice(0, 5)), skin: this.rng.pick(SKINS) }); break;
    }
  }
  for (const q of B) {
    const nx = q.x + q.dx * q.v * dt, ny = q.y + q.dy * q.v * dt, tx = Math.floor(nx / TS), ty = Math.floor(ny / TS);
    const cx = Math.floor(q.x / TS), cy = Math.floor(q.y / TS), cxc = cx * TS + TS / 2, cyc = cy * TS + TS / 2;
    if (M.get(Math.floor((nx + q.dx * TS / 2) / TS), Math.floor((ny + q.dy * TS / 2) / TS)) === TT.CICLO) { q.x = nx; q.y = ny; if (q.dx) q.y += (cyc - q.y) * Math.min(1, dt * 4); else q.x += (cxc - q.x) * Math.min(1, dt * 4); }
    else { const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(d => !(d[0] === -q.dx && d[1] === -q.dy) && M.get(cx + d[0], cy + d[1]) === TT.CICLO); const d = opts.length ? this.rng.pick(opts) : [-q.dx, -q.dy]; q.dx = d[0]; q.dy = d[1]; q.x = cxc; q.y = cyc; }
    q.a += angDiff(q.a, Math.atan2(q.dy, q.dx)) * Math.min(1, dt * 8);
    if (P.veh !== 'truck' && dist(q.x, q.y, P.x, P.y) < 6 && P.v > 10) { P.v *= .6; q.v *= .5; if (!this.bTold) { this.bTold = 1; this.float('¡Ojo, ciclista!', PAL.amb); } }
    q.v = Math.min(q.v + dt * 10, 50 * WK);
  }
  this.npcB = B.filter(q => Math.abs(q.x - cam.x) < 300 * WK && Math.abs(q.y - cam.y) < 300 * WK);
};
const _drawGround = Ride.prototype.drawGround;
Ride.prototype.drawGround = function (b, ox, oy, inV) {
  _drawGround.call(this, b, ox, oy, inV);
  for (const q of this.npcB || []) { if (!inV(q.x, q.y)) continue; const sp = Art.riderTop(q.shirt, q.helmet, q.skin); b.save(); b.translate(q.x - ox, q.y - oy); b.rotate(q.a + Math.PI / 2); b.fillStyle = '#0004'; b.fillRect(-sp.width / 2 + 1, -sp.height / 2 + 1.5, sp.width, sp.height); b.drawImage(sp, -sp.width / 2, -sp.height / 2); b.restore(); }
  if (this.parked) { const pk = this.parked; if (inV(pk.x, pk.y)) { b.save(); b.translate(pk.x - ox, pk.y - oy); b.rotate(pk.a + Math.PI / 2); b.drawImage(Art.bikeTop(), -1.5, -4); b.restore(); } }
};
/* ---------- caminar (modo libre): bajarse de la bici y recorrer la ciudad a pie ---------- */
const _rideUpdate = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) {
  if (this.p.veh === 'walk') { this.stepT = (this.stepT || 0) + dt * this.p.v * .12; }
  _rideUpdate.call(this, dt, dir);
};
Ride.prototype.getOff = function () { const P = this.p; this.parked = { x: P.x, y: P.y, a: P.a }; P.veh = 'walk'; P.v = 0; Snd.sfx('tap'); this.float('A pie', PAL.vd1); };
Ride.prototype.getOn = function () { const P = this.p, pk = this.parked; if (!pk || dist(pk.x, pk.y, P.x, P.y) > 22 * WK) return false; P.x = pk.x; P.y = pk.y; P.a = pk.a; this.parked = null; P.veh = 'bike'; Snd.sfx('coin'); this.float('¡A pedalear!', PAL.vd1); return true; };
const _uActions = ModeUsuario.prototype.actions;
ModeUsuario.prototype.actions = function () {
  const a = _uActions.call(this); if (!this.free || this.sub) return a; const R = this.ride, P = R.p;
  if (P.veh === 'bike') a.push({ id: 'off', icon: 'usuario', label: 'Bajarse', fn: () => R.getOff() });
  else if (P.veh === 'walk') a.push({ id: 'on', icon: 'estacion', label: R.parked && dist(R.parked.x, R.parked.y, P.x, P.y) < 22 * WK ? 'Subirse' : 'Ir a la bici', fn: () => { if (!R.getOn()) { R.target = R.marker({ x: R.parked.x, y: R.parked.y, r: 12, col: PAL.vd, label: 'Tu bici', enter: m => R.removeMarker(m) }); JE.ui && JE.ui.toast('🚲 Sigue la línea hasta tu bici'); } } });
  return a;
};

/* ---------- BAJAR Y ORGANIZAR BICIS (con equilibrio) ----------
   El carro no puede parquear pegado a la estación: hay que llevar las bicis a pie, una o dos a la vez, sin que se caigan. */
class MGDescarga extends MG {
  constructor(parent, o) {
    super(parent, o); this.type = o.type || 'llevar'; this.n = clamp(o.n || 4, 1, 6); this.dist = o.dist || 30; this.min = o.clock0 || 600;
    this.moved = 0; this.drops = 0; this.doubles = 0; this.state = 'pick'; this.carry = 0; this.wx = 0; this.th = 0; this.tv = 0; this.push = 0; this.fallT = 0;
    this.docks = []; const cap = 10; for (let i = 0; i < cap; i++) this.docks.push(this.type === 'recoger' ? i < this.n + 2 : i < 2);
    this.coach = this.type === 'llevar' ? 'Toma 1 o 2 bicis del camión. Mientras caminas, usa ◀ ▶ para no dejarlas caer.' : 'Toma bicis de la estación y llévalas al camión. ◀ ▶ para mantener el equilibrio.';
  }
  srcX() { return this.type === 'llevar' ? 0 : 1; }
  update(dt) {
    this.tick(dt); this.min += dt * 1.5;
    if (this.fallT > 0) { this.fallT -= dt; if (this.fallT <= 0) { this.th = 0; this.tv = 0; } return; }
    if (this.state === 'walk' || this.state === 'back') {
      const to = this.state === 'walk' ? 1 - this.srcX() : this.srcX(), sp = (this.carry === 2 ? .3 : .36) * (this.p.paceRate || 1) * (this.state === 'back' ? 1.6 : 1);
      this.wx += Math.sign(to - this.wx) * sp * dt;
      if (this.state === 'walk') {
        const k = this.carry === 2 ? 1.9 : 1;   // dos bicis: el doble de difícil
        this.tv += ((this.rng.f() - .5) * 3.2 * k + this.th * 1.6 * k + this.push * 4.5) * dt; this.tv *= Math.pow(.35, dt); this.th += this.tv * dt;
        if (Math.abs(this.th) > 1) { this.drops++; this.errors++; this.fallT = 1.4; this.score = Math.max(0, this.score - 2); Snd.sfx('bad'); vib(50); this.pop('¡Se cayeron!', 100, 40, PAL.cor); this.wx = this.srcX(); this.state = 'pick'; this.carry = 0; return; }
      }
      if ((to === 1 && this.wx >= 1) || (to === 0 && this.wx <= 0)) { this.wx = to; if (this.state === 'walk') this.state = 'drop'; else this.state = this.moved >= this.n ? 'end' : 'pick'; this.th = 0; this.tv = 0; }
    }
    if (this.state === 'drop') this.place();
    if (this.state === 'end' && !this.endT) { this.endT = .6; this.good(8 + (this.drops ? 0 : 10), 100, 30, this.drops ? '¡Listo!' : '¡Sin una caída!'); }
    if (this.endT && (this.endT -= dt) <= 0) this.done = true;
  }
  take(k) { if (this.state !== 'pick' || this.fallT > 0) return; k = Math.min(k, this.n - this.moved); if (k < 1) return; this.carry = k; if (k === 2) this.doubles++; this.state = 'walk'; Snd.sfx('tap'); }
  hold(d) { this.push = d; }
  place() {
    const k = this.carry; if (this.type === 'llevar') { let put = 0; for (let i = 0; i < this.docks.length && put < k; i++) if (!this.docks[i]) { this.docks[i] = true; put++; } }
    else { let took = 0; for (let i = this.docks.length - 1; i >= 0 && took < k; i--) if (this.docks[i]) { this.docks[i] = false; took++; } }
    this.moved += k; this.score += 5 * k + (k === 2 ? 3 : 0); Snd.sfx('coin'); this.pop('+' + (5 * k), 100, 40, PAL.vd1); this.carry = 0; this.state = 'back';
  }
  render(V) {
    const b = V.b, vw = V.vw, { gy } = this.bgStation(V, this.min), x0 = 34, x1 = vw * .62; this.L = { gy, x0, x1 };
    Art.truckSide(b, 22, gy + 2, this.type === 'llevar' ? this.n - this.moved : this.moved, 1);
    prect(b, x1 - 6, gy - 46, vw - x1, 5, PAL.vd); prect(b, x1 - 4, gy - 28, vw - x1 - 4, 30, '#eef2f5');
    const sp = (vw - x1 - 10) / this.docks.length;
    this.docks.forEach((d, i) => { const x = Math.round(x1 + i * sp + sp / 2); prect(b, x, gy - 10, 2, 10, '#59606c'); prect(b, x, gy - 12, 2, 2, d ? PAL.vd : '#9aa7b8'); if (d) Art.bikeFront(b, x + 4, gy, 'ok'); });
    // camino con la distancia
    for (let x = x0 + 4; x < x1 - 8; x += 6) prect(b, x, gy + 4, 3, 1, '#ffffff88');
    const px = lerp(x0 + 6, x1 - 10, this.wx), fall = this.fallT > 0;
    b.save(); b.translate(Math.round(px), gy); b.rotate(fall ? 1.2 : this.th * .55);
    if (this.carry || fall) for (let j = 0; j < Math.max(1, this.carry); j++) Art.bikeSide(b, 4 + j * 3, -6 - j * 3, { r: 4, face: 1 });
    b.restore();
    Art.person(b, px, gy, Art.me({ vest: true }), (this.state === 'walk' || this.state === 'back') ? this.t * 2 : 0, this.wx < (this.state === 'back' ? 1 - this.srcX() : this.srcX()) ? 1 : -1);
  }
  hud(V) {
    this.btns = []; const s = V.s, L = this.L; if (!L) return;
    V.text((this.type === 'llevar' ? 'BAJAR Y ORGANIZAR BICIS' : 'RECOGER BICIS') + ' · ' + this.moved + '/' + this.n, V.w / 2, V.top + 18, { size: 18, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    V.text('El camión quedó a ' + this.dist + ' m: la estación no deja parquear más cerca', V.w / 2, V.top + 40, { size: 12, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 3, body: true });
    // barra de equilibrio
    if (this.state === 'walk') { const w = Math.min(260, V.w - 40), x = (V.w - w) / 2, y = V.top + 56, c = V.ctx; c.fillStyle = '#0a2342dd'; c.fillRect(x, y, w, 14); c.fillStyle = PAL.vd2; c.fillRect(x + w * .35, y, w * .3, 14); c.fillStyle = Math.abs(this.th) > .7 ? PAL.cor : '#fff'; c.fillRect(x + w / 2 + this.th * w / 2 - 3, y - 3, 6, 20); }
    const bh = 66, y = V.h - bh - 14, half = (V.w - 36) / 2;
    if (this.state === 'pick') { this.button(V, 12, y, half, bh, 'Llevar 1', () => this.take(1), { bg: PAL.vd2, size: 18, key: 'one' }); if (this.n - this.moved >= 2) this.button(V, 24 + half, y, half, bh, 'Llevar 2 (difícil)', () => this.take(2), { bg: '#b0651a', size: 15, key: 'two' }); }
    else if (this.state === 'walk') { this.button(V, 12, y, half, bh, '◀', () => this.hold(-1), { size: 30, key: 'l' }); this.button(V, 24 + half, y, half, bh, '▶', () => this.hold(1), { size: 30, key: 'r' }); this.coachB = bh + 26; }
    this.drawPops(V); void s;
  }
  release() { this.push = 0; }
  key(e) { if (e.code === 'ArrowLeft') this.hold(-1); if (e.code === 'ArrowRight') this.hold(1); }
  hint() { const R = this.rects || {}; if (this.moved >= 2) return null; if (this.state === 'pick') return R.one || null; if (this.state === 'walk' && Math.abs(this.th) > .3) return R[this.th > 0 ? 'l' : 'r'] || null; return null; }
  bot(err) {
    if (this.state === 'pick') return this.take(!this.drops && this.n - this.moved >= 2 && this.rng.f() > err ? 2 : 1);
    if (this.state === 'walk') this.hold(this.th > .12 ? -1 : this.th < -.12 ? 1 : 0);
  }
}
