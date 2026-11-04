/* =====================================================================
   VIDA URBANA: Tranvía de Ayacucho, Metrocable, peatones y luces nocturnas
   (amplía Ride sin tocar su núcleo)
   ===================================================================== */
const PED_OK = v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION;
Art.glow = function () { return this.get('glow', 24, 24, x => { const g = x.createRadialGradient(12, 12, 0, 12, 12, 12); g.addColorStop(0, 'rgba(255,220,130,.95)'); g.addColorStop(.35, 'rgba(255,200,100,.35)'); g.addColorStop(1, 'rgba(255,190,90,0)'); x.fillStyle = g; x.fillRect(0, 0, 24, 24); }); };

Ride.prototype.initLife = function () {
  const T = this.map.tram; this.peds = []; this.pedT = 0; this.thanks = 0;
  this.trm = { p: lerp(T.x0, T.x1, this.rng.f()), dir: this.rng.f() < .5 ? 1 : -1, wait: 0, stop: 0, ghost: 0, x: 0, y: T.y };
};
Ride.prototype.updLife = function (dt) {
  if (!this.peds) this.initLife();
  const T = this.map.tram, tr = this.trm, P = this.p, r = this.stats_().r;
  // tranvía: va y viene, para en sus estaciones
  if (tr.stop > 0) tr.stop -= dt; else if (tr.wait > 0) tr.wait -= dt;
  else {
    const prev = tr.p; tr.p += 26 * tr.dir * dt;
    for (const s of T.st) if ((prev - s.px) * (tr.p - s.px) < 0) { tr.wait = 1.6; tr.p = s.px; }
    if (tr.p > T.x1 - 22) { tr.p = T.x1 - 22; tr.dir = -1; tr.wait = 2.5; } if (tr.p < T.x0 + 22) { tr.p = T.x0 + 22; tr.dir = 1; tr.wait = 2.5; }
  }
  tr.x = tr.p; tr.y = T.y;
  if (tr.ghost > 0) tr.ghost -= dt; else if (Math.abs(P.x - tr.x) < 21 + r && Math.abs(P.y - tr.y) < 4 + r && P.stun <= 0 && !(this.inv > 0)) { this.crash(tr); if (!this.tramTold) { this.tramTold = 1; JE.ui && JE.ui.toast('🚋 ¡Cuidado con el tranvía! Cruza por detrás o espera.'); } }
  // peatones en aceras y plazas
  this.pedT -= dt; const want = JE.headless ? 6 : 14, cam = this.cam;
  if (this.pedT <= 0 && this.peds.length < want) {
    this.pedT = .15;
    for (let k = 0; k < 6; k++) {
      const tx = Math.floor(cam.x / TS) + this.rng.i(-18, 18), ty = Math.floor(cam.y / TS) + this.rng.i(-24, 24);
      if (!PED_OK(this.map.get(tx, ty))) continue; const x = tx * TS + 4, y = ty * TS + 4; if (dist(x, y, P.x, P.y) < 50) continue;
      const d = this.rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      this.peds.push({ x, y, dx: d[0], dy: d[1], spd: this.rng.range(6, 11), col: this.rng.pick(['#ff6b5a', '#56c7ff', '#ffc93c', '#ffffff', '#b07cff', '#ff8fc7', '#7fd1b9']), skin: this.rng.pick(SKINS), ph: this.rng.f(), hit: 0, side: 0 });
      break;
    }
  }
  for (const q of this.peds) {
    q.ph += dt * q.spd * .15; if (q.hit > 0) q.hit -= dt;
    if (q.side > 0) { q.side -= dt; continue; }
    const nx = q.x + q.dx * q.spd * dt, ny = q.y + q.dy * q.spd * dt, ahead = this.map.get(Math.floor((nx + q.dx * 3) / TS), Math.floor((ny + q.dy * 3) / TS));
    if (PED_OK(ahead) && this.rng.f() > .002) { q.x = nx; q.y = ny; }
    else { const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(d => PED_OK(this.map.get(Math.floor(q.x / TS) + d[0], Math.floor(q.y / TS) + d[1]))); if (opts.length) { const d = this.rng.pick(opts); q.dx = d[0]; q.dy = d[1]; } }
    if (P.veh === 'bike' && !q.hit && Math.abs(q.x - P.x) < 4 && Math.abs(q.y - P.y) < 4 && P.v > 14) {
      q.hit = 2; this.stats.peds = (this.stats.peds || 0) + 1; P.v *= .35; this.float('¡Ojo, peatón!', PAL.amb); Snd.sfx('bad'); vib(30);
      if (this.mode.onPed) this.mode.onPed(); if (!this.pedTold) { this.pedTold = 1; JE.ui && JE.ui.toast('🚶 En la acera el peatón tiene prioridad: usa el timbre.'); }
    }
  }
  this.peds = this.peds.filter(q => Math.abs(q.x - cam.x) < 320 && Math.abs(q.y - cam.y) < 320);
};
/* el timbre aparta a los peatones cercanos */
Ride.prototype.bellPeds = function () {
  let n = 0; const P = this.p;
  for (const q of this.peds || []) if (dist(q.x, q.y, P.x, P.y) < 40) {
    const sx = -q.dy, sy = q.dx; for (const s of [1, -1]) { const nx = q.x + sx * 5 * s, ny = q.y + sy * 5 * s; if (PED_OK(this.map.get(Math.floor(nx / TS), Math.floor(ny / TS)))) { q.x = nx; q.y = ny; break; } }
    q.side = .8; n++;
  }
  if (n && this.thanks < 30) { this.thanks++; this.float('¡Gracias!', PAL.vd1); if (this.mode.onThanks) this.mode.onThanks(n); }
};
Ride.prototype.drawGround = function (b, ox, oy, inV) {
  const tr = this.trm; if (!tr) return;
  for (let k = -1; k <= 1; k++) { const x = tr.x + k * 14; if (!inV(x, tr.y)) continue; prect(b, x - ox - 6, tr.y - oy - 2, 13, 6, '#0004'); prect(b, x - ox - 7, tr.y - oy - 3, 13, 6, '#f1f4f7'); prect(b, x - ox - 7, tr.y - oy - 2, 13, 1, '#1d2c44'); prect(b, x - ox - 7, tr.y - oy + 2, 13, 1, PAL.cie); }
  prect(b, tr.x - ox + (tr.dir > 0 ? 19 : -22), tr.y - oy - 1, 1, 2, '#fff3a0');
  for (const q of this.peds) { if (!inV(q.x, q.y, 6)) continue; const bob = (q.ph * 4 | 0) % 2, x = Math.round(q.x - ox), y = Math.round(q.y - oy); prect(b, x - 1, y - 1 + bob, 3, 2, q.col); prect(b, x - 1, y - 2, 2, 2, q.skin); if (q.hit > 0) prect(b, x, y - 5, 1, 2, PAL.amb); }
};
Ride.prototype.drawSky = function (b, ox, oy) {
  const t = this.mode.t, vw = View.vw, vh = View.vh;
  for (const cb of this.map.cables) {
    if (Math.max(cb.ax, cb.bx) < ox - 10 || Math.min(cb.ax, cb.bx) > ox + vw + 10 || Math.max(cb.ay, cb.by) < oy - 10 || Math.min(cb.ay, cb.by) > oy + vh + 10) continue;
    const ux = (cb.bx - cb.ax) / cb.len, uy = (cb.by - cb.ay) / cb.len;
    b.strokeStyle = '#2b2f38'; b.lineWidth = 1; b.beginPath(); b.moveTo(cb.ax - ox + .5, cb.ay - oy + .5); b.lineTo(cb.bx - ox + .5, cb.by - oy + .5); b.moveTo(cb.ax - ox + 2.5, cb.ay - oy + 2.5); b.lineTo(cb.bx - ox + 2.5, cb.by - oy + 2.5); b.stroke();
    for (let s = 40; s < cb.len - 20; s += 56) { const x = cb.ax + ux * s - ox, y = cb.ay + uy * s - oy; prect(b, x + 1, y + 2, 3, 3, '#0004'); prect(b, x - 1, y - 1, 3, 4, '#8d97a5'); }
    for (const f of cb.st) { const x = cb.ax + ux * cb.len * f - ox, y = cb.ay + uy * cb.len * f - oy; prect(b, x - 4, y - 3, 10, 8, '#0004'); prect(b, x - 5, y - 4, 10, 8, '#dfe5ec'); prect(b, x - 5, y - 4, 10, 2, cb.col); }
    const n = Math.floor(cb.len / 30);
    for (let k = 0; k < n; k++) { const s = (k * 30 + t * 10) % cb.len, s2 = cb.len - s; prect(b, cb.ax + ux * s - ox - 1, cb.ay + uy * s - oy - 1, 3, 3, cb.col); prect(b, cb.ax + ux * s - ox, cb.ay + uy * s - oy, 1, 1, '#1d2c44'); prect(b, cb.ax + ux * s2 - ox + 1, cb.ay + uy * s2 - oy + 1, 3, 3, cb.col); }
  }
};
Ride.prototype.drawGlow = function (b, ox, oy, inV, n) {
  if (n < .25 || JE.headless) return; const g = Art.glow(), M = this.map;
  b.save(); b.globalCompositeOperation = 'lighter'; b.globalAlpha = Math.min(1, n) * .6;
  for (const s of M.stations) if (inV(s.x, s.y, 40)) b.drawImage(g, s.x - ox - 26, s.y - oy - 26, 52, 52);
  const x0 = Math.floor(ox / TS), y0 = Math.floor(oy / TS), x1 = x0 + Math.ceil(View.vw / TS) + 1, y1 = y0 + Math.ceil(View.vh / TS) + 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if ((x * 3 + y * 5) % 7 !== 0 || M.get(x, y) !== TT.WALK) continue;
    const a = v => v === TT.AVE || v === TT.AUTO; if (!(a(M.get(x - 1, y)) || a(M.get(x + 1, y)) || a(M.get(x, y - 1)) || a(M.get(x, y + 1)))) continue;
    b.drawImage(g, x * TS + 4 - ox - 12, y * TS + 4 - oy - 12, 24, 24);
  }
  for (const c of this.cars) if (inV(c.x, c.y)) b.drawImage(g, c.x + Math.cos(c.ang) * 9 - ox - 6, c.y + Math.sin(c.ang) * 9 - oy - 6, 12, 12);
  b.restore();
};
Ride.prototype.hudLife = function (V, sx, sy) {
  if (V.s < 3 && V.w < 700) return;
  for (const cb of this.map.cables) { const x = sx(cb.bx), y = sy(cb.by) - 12; if (x > 20 && x < V.w - 20 && y > 50 && y < V.h - 20) V.text(cb.name, x, y, { size: 11, align: 'center', color: '#fff', bg: cb.col, pad: 3 }); }
  const T = this.map.tram; for (const s of T.st) { const x = sx(s.px), y = sy(T.y) - 24; if (x > 0 && x < V.w && y > 50 && y < V.h) V.text('Tranvía · ' + s.name, x, y, { size: 10, align: 'center', color: PAL.az, bg: PAL.cie, pad: 2 }); }
};
