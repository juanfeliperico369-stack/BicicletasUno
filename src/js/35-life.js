/* =====================================================================
   VIDA URBANA: Tranvía de Ayacucho, Metrocable, peatones y luces nocturnas
   (amplía Ride sin tocar su núcleo)
   ===================================================================== */
const PED_OK = v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION;
Art.glow = function () { return this.get('glow', 24, 24, x => { const g = x.createRadialGradient(12, 12, 0, 12, 12, 12); g.addColorStop(0, 'rgba(255,220,130,.95)'); g.addColorStop(.35, 'rgba(255,200,100,.35)'); g.addColorStop(1, 'rgba(255,190,90,0)'); x.fillStyle = g; x.fillRect(0, 0, 24, 24); }); };

Ride.prototype.initLife = function () {
  const T = this.map.tram; this.peds = []; this.pedT = 0; this.thanks = 0;
  this.trm = { s: T.len * (.1 + .8 * this.rng.f()), dir: this.rng.f() < .5 ? 1 : -1, wait: 0, stop: 0, ghost: 0, x: 0, y: 0, a: 0 };
};
Ride.prototype.updLife = function (dt) {
  if (!this.peds) this.initLife();
  const T = this.map.tram, tr = this.trm, P = this.p, r = this.stats_().r;
  // postal secreta (Easter egg): Cerro de las Tres Cruces
  const sc = LM.trescruces;
  if (sc && !this.secretGot && Math.abs(P.x - (sc.x + sc.w / 2) * TS) < sc.w * TS / 2 + 16 * WK && Math.abs(P.y - (sc.y + sc.h / 2) * TS) < sc.h * TS / 2 + 16 * WK) {
    this.secretGot = true;
    if (!JE.headless && !Save.data.postales.includes(sc.id)) { Save.data.postales.push(sc.id); this.stamp = { t: 2.4, title: '¡POSTAL SECRETA!', sub: sc.name, bg: '#ff8fc7' }; Snd.sfx('star'); this.mode.score += 50; }
  }
  // tranvía: va y viene, para en sus estaciones
  if (tr.stop > 0) tr.stop -= dt; else if (tr.wait > 0) tr.wait -= dt;
  else {
    const prev = tr.s; tr.s += 26 * WK * tr.dir * dt;
    for (const s of T.st) if ((prev - s.s) * (tr.s - s.s) < 0) { tr.wait = 1.6; tr.s = s.s; }
    if (tr.s > T.len - 44) { tr.s = T.len - 44; tr.dir = -1; tr.wait = 2.5; } if (tr.s < 44) { tr.s = 44; tr.dir = 1; tr.wait = 2.5; }
  }
  const tq = this.map.at(T, tr.s); tr.x = tq.x; tr.y = tq.y; tr.a = tq.a;
  const tdx = P.x - tr.x, tdy = P.y - tr.y, tal = Math.abs(tdx * Math.cos(tr.a) + tdy * Math.sin(tr.a)), tla = Math.abs(-tdx * Math.sin(tr.a) + tdy * Math.cos(tr.a));
  if (tr.ghost > 0) tr.ghost -= dt; else if (tal < 42 + r && tla < 7 + r && P.stun <= 0 && !(this.inv > 0)) { this.crash(tr); if (!this.tramTold) { this.tramTold = 1; JE.ui && JE.ui.toast('🚋 ¡Cuidado con el tranvía! Cruza por detrás o espera.'); } }
  // sonido ambiente por zona (no usa la semilla para no cambiar la simulación)
  if (!JE.headless && (this.ambT = (this.ambT || 2) - dt) <= 0) {
    this.ambT = 2.5 + Math.random() * 3.5;
    const tx = Math.floor(P.x / TS), ty = Math.floor(P.y / TS), night = Art.night(this.mode.clock || 360) > .5; let g = 0, w = 0;
    for (let y = -4; y <= 4; y += 2) for (let x = -4; x <= 4; x += 2) { const v = this.map.get(tx + x, ty + y); if (v === TT.GRASS || v === TT.MOUNT) g++; else if (v === TT.WATER || v === TT.CANAL) w++; }
    const metro = this.map.metroA.concat(this.map.metroB).some(s => dist(s.px, s.py, P.x, P.y) < 70 * WK);
    if (dist(tr.x, tr.y, P.x, P.y) < 90 * WK && Math.random() < .5) Snd.amb('tram');
    else if (metro && Math.random() < .45) Snd.amb('metro');
    else if (w >= 3) Snd.amb('river');
    else if (g >= 8 || night) Snd.amb(night ? 'crickets' : 'birds');
  }
  // peatones en aceras y plazas
  this.pedT -= dt; const want = JE.headless ? 6 : 14, cam = this.cam;
  if (this.pedT <= 0 && this.peds.length < want) {
    this.pedT = .15;
    for (let k = 0; k < 6; k++) {
      const tx = Math.floor(cam.x / TS) + this.rng.i(-18, 18), ty = Math.floor(cam.y / TS) + this.rng.i(-24, 24);
      if (!PED_OK(this.map.get(tx, ty))) continue; const x = tx * TS + TS / 2, y = ty * TS + TS / 2; if (dist(x, y, P.x, P.y) < 50 * WK) continue;
      const d = this.rng.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      this.peds.push({ x, y, dx: d[0], dy: d[1], spd: this.rng.range(9, 16), col: this.rng.pick(['#ff6b5a', '#56c7ff', '#ffc93c', '#ffffff', '#b07cff', '#ff8fc7', '#7fd1b9']), skin: this.rng.pick(SKINS), ph: this.rng.f(), hit: 0, side: 0, sil: !!this.mode.mods.flores && this.rng.f() < .45 });
      break;
    }
  }
  for (const q of this.peds) {
    q.ph += dt * q.spd * .15; if (q.hit > 0) q.hit -= dt;
    if (q.side > 0) { q.side -= dt; continue; }
    this.pedStep(q, dt);
    if (P.veh === 'bike' && !q.hit && Math.abs(q.x - P.x) < 4 && Math.abs(q.y - P.y) < 4 && P.v > 14 * WK) {
      q.hit = 2; this.stats.peds = (this.stats.peds || 0) + 1; P.v *= .35; this.float('¡Ojo, peatón!', PAL.amb); Snd.sfx('bad'); vib(30);
      if (this.mode.onPed) this.mode.onPed(); if (!this.pedTold) { this.pedTold = 1; JE.ui && JE.ui.toast('🚶 En la acera el peatón tiene prioridad: usa el timbre.'); }
    }
  }
  this.peds = this.peds.filter(q => Math.abs(q.x - cam.x) < 320 * WK && Math.abs(q.y - cam.y) < 320 * WK);
};
/* el timbre aparta a los peatones cercanos */
Ride.prototype.bellPeds = function () {
  let n = 0; const P = this.p;
  for (const q of this.peds || []) if (dist(q.x, q.y, P.x, P.y) < 40 * WK) {
    const sx = -q.dy, sy = q.dx; for (const s of [1, -1]) { const nx = q.x + sx * 5 * WK * s, ny = q.y + sy * 5 * WK * s; if (PED_OK(this.map.get(Math.floor(nx / TS), Math.floor(ny / TS)))) { q.x = nx; q.y = ny; break; } }
    q.side = .8; n++;
  }
  if (n && this.thanks < 30) { this.thanks++; this.float('¡Gracias!', PAL.vd1); if (this.mode.onThanks) this.mode.onThanks(n); }
};
Ride.prototype.drawGround = function (b, ox, oy, inV) {
  const tr = this.trm; if (!tr) return; const T = this.map.tram;
  for (let k = -1; k <= 1; k++) {
    const q = this.map.at(T, clamp(tr.s + k * 14 * WK, 0, T.len)); if (!inV(q.x, q.y)) continue;
    b.save(); b.translate(q.x - ox, q.y - oy); b.rotate(q.a); b.scale(WK, WK);
    b.fillStyle = '#0004'; b.fillRect(-6, -2, 13, 6); b.fillStyle = '#f1f4f7'; b.fillRect(-7, -3, 13, 6); b.fillStyle = '#1d2c44'; b.fillRect(-7, -2, 13, 1); b.fillRect(-7, 1, 13, 1); b.fillStyle = PAL.cie; b.fillRect(-7, -3, 13, 1);
    if (k === tr.dir) { b.fillStyle = '#fff3a0'; b.fillRect(tr.dir > 0 ? 6 : -8, -1, 1, 2); }
    b.restore();
  }
  for (const q of this.peds) { if (!inV(q.x, q.y, 6)) continue; const bob = (q.ph * 4 | 0) % 2, x = Math.round(q.x - ox), y = Math.round(q.y - oy); prect(b, x - 1, y - 1 + bob, 3, 2, q.col); prect(b, x - 1, y - 2, 2, 2, q.skin); if (q.sil) { prect(b, x - 3, y + 1, 7, 4, '#7a5230'); prect(b, x - 3, y + 1, 2, 2, '#ff8fc7'); prect(b, x - 1, y + 1, 2, 2, '#ffd84a'); prect(b, x + 1, y + 1, 2, 2, '#ff6b5a'); prect(b, x - 2, y + 3, 2, 1, '#b07cff'); prect(b, x + 1, y + 3, 2, 1, '#fff'); } if (q.hit > 0) prect(b, x, y - 5, 1, 2, PAL.amb); }
};
Ride.prototype.drawSky = function (b, ox, oy) {
  const t = this.mode.t, vw = View.vw + 2, vh = View.vh + 2;
  for (const cb of this.map.cables) {
    if (Math.max(cb.ax, cb.bx) < ox - 10 || Math.min(cb.ax, cb.bx) > ox + vw + 10 || Math.max(cb.ay, cb.by) < oy - 10 || Math.min(cb.ay, cb.by) > oy + vh + 10) continue;
    const ux = (cb.bx - cb.ax) / cb.len, uy = (cb.by - cb.ay) / cb.len, nx = -uy * 1.6, ny = ux * 1.6;
    b.strokeStyle = '#2b2f38cc'; b.lineWidth = .35; b.beginPath(); b.moveTo(cb.ax - ox + nx, cb.ay - oy + ny); b.lineTo(cb.bx - ox + nx, cb.by - oy + ny); b.moveTo(cb.ax - ox - nx, cb.ay - oy - ny); b.lineTo(cb.bx - ox - nx, cb.by - oy - ny); b.stroke();
    for (let s = 40; s < cb.len - 20; s += 56) { const x = cb.ax + ux * s - ox, y = cb.ay + uy * s - oy; b.fillStyle = '#0004'; b.fillRect(x + 1, y + 2, 3, 3); b.fillStyle = '#8d97a5'; b.fillRect(x - 1, y - 1, 3, 4); }
    for (const f of cb.st) { const x = cb.ax + ux * cb.len * f - ox, y = cb.ay + uy * cb.len * f - oy; b.fillStyle = '#0004'; b.fillRect(x - 4, y - 3, 10, 8); b.fillStyle = '#dfe5ec'; b.fillRect(x - 5, y - 4, 10, 8); b.fillStyle = cb.col; b.fillRect(x - 5, y - 4, 10, 2); }
    const n = Math.max(1, Math.floor(cb.len / 30));
    for (let k = 0; k < n; k++) { const s = (k * 30 + t * 10) % cb.len, s2 = cb.len - s; for (const [q, d] of [[s, 1], [s2, -1]]) { const x = cb.ax + ux * q - ox + nx * d, y = cb.ay + uy * q - oy + ny * d; b.fillStyle = '#0003'; b.fillRect(x - .5, y + 1, 3, 3); b.fillStyle = cb.col; b.fillRect(x - 1.5, y - 1.5, 3, 3); b.fillStyle = '#1d2c44'; b.fillRect(x - .5, y - .5, 1, 1); } }
  }
};
const ALUM = ['#ff5a5a', '#ffd84a', '#56c7ff', '#9bd341', '#ff8fc7', '#ffffff'];
Ride.prototype.drawAlum = function (b, ox, oy) {
  const R = this.map.river, k = Math.floor(this.mode.t * 2.5), vw = View.vw + 2, vh = View.vh + 2;
  const pr = this.map.project(R, ox + vw / 2, oy + vh / 2); if (pr.d > vw + vh) return;
  for (let s = Math.max(0, pr.s - vw - vh); s < Math.min(R.len, pr.s + vw + vh); s += 5 * WK) {
    const q = this.map.at(R, s), i = s / (5 * WK) | 0, nx = -Math.sin(q.a), ny = Math.cos(q.a);
    for (const d of [-14 * WK, 14 * WK]) { const x = q.x + nx * d - ox, y = q.y + ny * d - oy; if (x < -4 || y < -4 || x > vw + 4 || y > vh + 4) continue; b.fillStyle = (i + k) % 4 ? ALUM[(i * (d > 0 ? 3 : 1) + k) % ALUM.length] : '#3b4250'; b.fillRect(x - 1, y - 1, 2, 2); }
    if (i % 28 === 14) for (let j = -5; j <= 5; j++) { const x = q.x + nx * j * 2.6 - ox, y = q.y + ny * j * 2.6 - oy - 3 + j * j * .15; b.fillStyle = ALUM[(j + 6 + k) % ALUM.length]; b.fillRect(x - 1, y - 1, 2, 2); }
  }
};
Ride.prototype.drawGlow = function (b, ox, oy, inV, n) {
  if (this.mode.mods.alumbrados && !JE.headless) this.drawAlum(b, ox, oy);
  if (n < .25 || JE.headless) return; const g = Art.glow(), M = this.map;
  b.save(); b.globalCompositeOperation = 'lighter'; b.globalAlpha = Math.min(1, n) * .6;
  for (const s of M.stations) if (inV(s.x, s.y, 60)) b.drawImage(g, s.x - ox - 44, s.y - oy - 44, 88, 88);
  const x0 = Math.floor(ox / TS), y0 = Math.floor(oy / TS), x1 = x0 + Math.ceil(View.vw / TS) + 1, y1 = y0 + Math.ceil(View.vh / TS) + 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if ((x * 3 + y * 5) % 7 !== 0 || M.get(x, y) !== TT.WALK) continue;
    const a = v => v === TT.AVE || v === TT.AUTO; if (!(a(M.get(x - 1, y)) || a(M.get(x + 1, y)) || a(M.get(x, y - 1)) || a(M.get(x, y + 1)))) continue;
    b.drawImage(g, x * TS + TS / 2 - ox - 20, y * TS + TS / 2 - oy - 20, 40, 40);
  }
  for (const c of this.cars) if (inV(c.x, c.y)) b.drawImage(g, c.x + Math.cos(c.ang) * 9 - ox - 6, c.y + Math.sin(c.ang) * 9 - oy - 6, 12, 12);
  b.restore();
};
Ride.prototype.hudLife = function (V, sx, sy) {
  for (const cb of this.map.cables) { if (!cb.name) continue; const x = sx(cb.bx), y = sy(cb.by) - 12; if (x > 20 && x < V.w - 20 && y > 50 && y < V.h - 20 && (!this.lblRoom || this.lblRoom(x, y, cb.name.length * 6 + 8, 16))) V.text(cb.name, x, y, { size: 11, align: 'center', color: '#fff', bg: cb.col, pad: 3 }); }
  const T = this.map.tram; for (const s of T.st) { const x = sx(s.px), y = sy(s.py) - 24; if (x > 0 && x < V.w && y > 50 && y < V.h && (!this.lblRoom || this.lblRoom(x, y, s.name.length * 5.5 + 50, 14))) V.text('Tranvía · ' + s.name, x, y, { size: 10, align: 'center', color: PAL.az, bg: PAL.cie, pad: 2 }); }
};
