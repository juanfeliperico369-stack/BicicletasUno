/* =====================================================================
   GRÁFICOS: pixel, híbrido (mapa dibujado + personajes pixel) y 2D (todo dibujado),
   y dos vistas del mapa: cenital y panorámica de plataformas.
   ===================================================================== */
const GFX = () => (Save.data && Save.data.settings.gfx) || 'pixel';
const panoOn = R => !!(R && Save.data.settings.vista === 'pano' && R.mode && R.mode.ride === R);
/* dibuja un sprite centrado; los sprites dibujados (sc > 1) se escalan con suavizado */
function blit(c, img, sh) {
  const s = img.sc || 1, w = img.width / s, h = img.height / s;
  if (sh) { c.fillStyle = sh; if (s > 1) { c.beginPath(); c.ellipse(1, 1.5, w / 2, h / 2, 0, 0, TAU); c.fill(); } else c.fillRect(-w / 2 + 1, -h / 2 + 1.5, w, h); }
  if (s > 1) { c.imageSmoothingEnabled = true; c.drawImage(img, -w / 2, -h / 2, w, h); c.imageSmoothingEnabled = false; } else c.drawImage(img, -w / 2, -h / 2);
}

/* ---------- mapa dibujado (vectorial) ---------- */
const BASEC = ['#62a04a', '#3f7b3a', '#bba98f', '#aaa49a', '#d3cdc1', '#d3cdc1', '#dbd5c8', '#d3cdc1', '#3f86c8', '#3f86c8', '#e4ddcc', '#d3cdc1', '#dbd5c8', '#c9b78c', '#d3cdc1', '#bab5ab', '#ccc0a9'];
const ROADW = { [TT.ROAD]: .78, [TT.AVE]: .96, [TT.AUTO]: 1.06, [TT.BRIDGE]: .96 }, ASF = { [TT.ROAD]: '#5c616a', [TT.AVE]: '#52575f', [TT.AUTO]: '#484d56', [TT.BRIDGE]: '#5c616a' };
const ROOF = ['#b8644a', '#c4724f', '#a95a43', '#e6e0d4', '#b8644a', '#d2cbbd', '#c97d58', '#cfd5dc'], TEJA = ['#c2623b', '#b55430', '#cf7448', '#a94b2b', '#c8693f'];
Object.assign(CityMap, {
  chunks2: new Map(),
  hasG(cx, cy) { return GFX() === 'pixel' ? this.chunks.has(cx + ',' + cy) : this.chunks2.has(cx + ',' + cy + ':' + this.cq()); },
  cq() { return Math.min(3, View.q || 2); },
  chunkG(cx, cy) {
    if (GFX() === 'pixel') return this.chunk(cx, cy);
    const q = this.cq(), k = cx + ',' + cy + ':' + q; let c = this.chunks2.get(k);
    if (c) { this.chunks2.delete(k); this.chunks2.set(k, c); return c; }
    c = Art.mk(CH * TS * q, CH * TS * q, x => this.drawChunk2(x, cx, cy, q));
    this.chunks2.set(k, c); if (this.chunks2.size > 22) this.chunks2.delete(this.chunks2.keys().next().value);
    return c;
  },
  drawChunk2(c, cx, cy, q) {
    const x0 = cx * CH, y0 = cy * CH, px0 = x0 * TS, py0 = y0 * TS, S = CH * TS, g = (x, y) => this.get(x, y), road = v => ROADW[v] != null, wat = v => v === TT.WATER || v === TT.CANAL;
    c.setTransform(q, 0, 0, q, -px0 * q, -py0 * q); c.lineCap = 'round'; c.lineJoin = 'round';
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) { const v = g(x, y); c.fillStyle = v === TT.GRASS && h2(x, y, 2) < .5 ? '#5d9a46' : BASEC[v] || '#62a04a'; c.fillRect(x * TS, y * TS, TS + .5, TS + .5); }
    // relieve suave (luz del noroeste)
    const RS = CH * 2 + 2, rc = Art.mk(RS, RS, r => { for (let j = 0; j < RS; j++) for (let i = 0; i < RS; i++) { const tx = x0 - .5 + i / 2, ty = y0 - .5 + j / 2, gx = (this.elevT(tx + .5, ty) - this.elevT(tx - .5, ty)) / VM.tile, gy = (this.elevT(tx, ty + .5) - this.elevT(tx, ty - .5)) / VM.tile, f = clamp((gx + gy) * 1.1, -.3, .25); r.fillStyle = f > 0 ? 'rgba(255,250,230,' + (f * .55).toFixed(3) + ')' : 'rgba(10,20,40,' + (-f * .7).toFixed(3) + ')'; r.fillRect(i, j, 1, 1); } });
    c.imageSmoothingEnabled = true; c.drawImage(rc, 0, 0, RS, RS, px0 - TS * .75, py0 - TS * .75, RS * TS / 2, RS * TS / 2);
    const seg = (test, w, col, dash) => {
      c.strokeStyle = col; c.lineWidth = w * TS; if (dash) c.setLineDash(dash); c.beginPath();
      for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
        if (!test(g(x, y))) continue; const ax = x * TS + TS / 2, ay = y * TS + TS / 2; c.moveTo(ax, ay); c.lineTo(ax + .01, ay);
        for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) { if (!test(g(x + dx, y + dy))) continue; if (dx && dy && (test(g(x + dx, y)) || test(g(x, y + dy)))) continue; c.moveTo(ax, ay); c.lineTo(ax + dx * TS, ay + dy * TS); }
      }
      c.stroke(); c.setLineDash([]);
    };
    // agua, vías (andén + asfalto) y ciclorrutas
    seg(wat, 1.25, '#3f86c8'); seg(wat, .5, '#5aa0dc');
    seg(road, 1.22, '#e3ded3'); for (const v of [TT.ROAD, TT.AVE, TT.BRIDGE, TT.AUTO]) seg(u => u === v || (v === TT.ROAD && road(u) && ROADW[u] > ROADW[v]), ROADW[v], ASF[v]);
    seg(u => u === TT.CICLO, .56, '#2f9e57'); seg(u => u === TT.CICLO, .05, '#e8f5d0', [3, 3]);
    // rayas de los carriles (siguen la geometría real)
    const seen = new Set(); c.lineWidth = 1; c.setLineDash([7, 7]);
    for (const ln of this.lanesNear(px0 + S / 2, py0 + S / 2)) { if (seen.has(ln.pts) || ln.dir < 0) continue; seen.add(ln.pts); c.strokeStyle = ln.cls === 't' ? '#ffd166' : '#e4e4dc'; c.beginPath(); ln.pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.stroke(); }
    c.setLineDash([]);
    // edificios y casas
    const bl = v => v === TT.BLDG, R = (x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
    const m = TS * .07, rr = TS * .22;
    for (const pass of [0, 1]) for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
      if (!bl(g(x, y))) continue; const X = x * TS + (pass ? 0 : TS * .16), Y = y * TS + (pass ? 0 : TS * .2), col = pass ? ROOF[(h2(x >> 2, y >> 2, 9) * ROOF.length) | 0] : '#00000030';
      R(X + m, Y + m, TS - 2 * m, TS - 2 * m, rr, col); c.fillStyle = col;
      if (bl(g(x + 1, y))) c.fillRect(X + TS - m - 1, Y + m, 2 * m + 2, TS - 2 * m); if (bl(g(x, y + 1))) c.fillRect(X + m, Y + TS - m - 1, TS - 2 * m, 2 * m + 2);
      if (bl(g(x + 1, y)) && bl(g(x, y + 1)) && bl(g(x + 1, y + 1))) c.fillRect(X + TS - m - 1, Y + TS - m - 1, 2 * m + 2, 2 * m + 2);
    }
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) {
      const v = g(x, y), r = h2(x, y, 3), X = x * TS, Y = y * TS;
      if (v === TT.BLDG) { if (r < .1) R(X + TS * .3, Y + TS * .3, TS * .3, TS * .22, 1, '#b4bcc6'); else if (r < .16) { c.fillStyle = '#25282e'; c.beginPath(); c.arc(X + TS * .5, Y + TS * .5, TS * .16, 0, TAU); c.fill(); } else if (r < .22) R(X + TS * .2, Y + TS * .2, TS * .6, TS * .6, 3, '#7dbb5a'); }
      else if (v === TT.BRICK) { const col = TEJA[(h2(x, y, 4) * TEJA.length) | 0]; R(X + TS * .12 + 2, Y + TS * .14 + 2, TS * .76, TS * .72, 2, '#00000028'); R(X + TS * .12, Y + TS * .14, TS * .76, TS * .72, 2, col); c.fillStyle = shade(col, -.2); c.fillRect(X + TS * .12, Y + TS * .48, TS * .76, 1.2); }
    }
    // lugares emblemáticos (pixel art, como postales sobre el mapa)
    c.imageSmoothingEnabled = false; LANDMARKS.forEach((L, i) => { if (L.x + L.w < x0 || L.x > x0 + CH || L.y + L.h < y0 || L.y > y0 + CH) return; c.drawImage(this.landmarkCanvas(i), L.x * TS, L.y * TS, L.w * TS, L.h * TS); });
    // árboles (copas redondas con sombra)
    for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
      const v = g(x, y), r = h2(x, y, 5); let rad = 0;
      if (v === TT.GRASS && r < .3 && !this.lid.has(this.idx(x, y))) rad = .34 + (r < .1 ? .12 : 0); else if (v === TT.WALK && r < .12) rad = .28; else if (v === TT.MOUNT && r < .55) rad = .4 + r * .3;
      if (!rad) continue; const X = x * TS + TS * (.3 + h2(x, y, 7) * .4), Y = y * TS + TS * (.3 + h2(x, y, 8) * .4), k = h2(x, y, 6), col = k < .05 ? '#f2c230' : k < .09 ? '#e88ab8' : v === TT.MOUNT ? '#2f6a33' : '#3f8a3f';
      c.fillStyle = '#00000033'; c.beginPath(); c.arc(X + TS * .1, Y + TS * .14, rad * TS, 0, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(X, Y, rad * TS, 0, TAU); c.fill();
      c.fillStyle = k < .09 ? '#fff3a066' : '#ffffff26'; c.beginPath(); c.arc(X - rad * TS * .3, Y - rad * TS * .3, rad * TS * .45, 0, TAU); c.fill();
    }
    // tranvía y viaductos del metro
    const path = (L, w, col, dx = 0, dy = 0) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); L.pts.forEach((p, i) => i ? c.lineTo(p.x + dx, p.y + dy) : c.moveTo(p.x + dx, p.y + dy)); c.stroke(); };
    path(this.tram, 7, '#00000018'); path(this.tram, 5, '#9aa0a8'); path(this.tram, 3, '#cfd3d8');
    for (const L of [this.lineA, this.lineB]) { path(L, 13, '#00000026', 3, 4); path(L, 13, '#8d939c'); path(L, 10, '#d3d6db'); path(L, 1, '#7d838c'); for (const st of L.st) { const p = this.at(L, st.s); c.save(); c.translate(p.x, p.y); c.rotate(p.a); R(-21, -11, 42, 22, 4, '#eef0f3'); c.fillStyle = PAL.vd; c.fillRect(-21, -11, 42, 3); c.restore(); } }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
});

/* ---------- personajes y vehículos dibujados (modo 2D) ---------- */
const SPR4 = 4;
function vsprite(key, base, draw) { const k = 'v' + key; let c = Art.cache.get(k); if (c) return c; c = Art.mk(base.width * SPR4, base.height * SPR4, x => { x.scale(SPR4, SPR4); x.lineCap = 'round'; x.lineJoin = 'round'; draw(x, base.width, base.height); }); c.sc = SPR4; Art.cache.set(k, c); return c; }
const ell = (x, cx, cy, rx, ry, col) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill(); };
const rrect = (x, a, b, w, h, r, col) => { x.fillStyle = col; x.beginPath(); x.roundRect(a, b, w, h, r); x.fill(); };
const line = (x, a, b, c2, d, w, col) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); };
for (const [name, fn] of Object.entries({
  riderTop: (base, a) => vsprite('rt' + a.join(), base, (x, w, h) => { const [shirt, helmet, skin, frame = PAL.vd] = a; ell(x, w / 2, 1.3, .7, 1.3, '#1b1f27'); ell(x, w / 2, h - 1.4, .7, 1.4, '#1b1f27'); line(x, w / 2, 2.6, w / 2, h - 2.6, .9, frame); line(x, .6, 3.4, w - .6, 3.4, .7, '#30343c'); line(x, 1.9, 5.6, .9, 3.5, .9, skin); line(x, w - 1.9, 5.6, w - .9, 3.5, .9, skin); ell(x, w / 2, 6.4, 2.4, 1.9, shirt); ell(x, w / 2, 6.3, 1.5, 1.7, helmet); x.fillStyle = '#ffffff55'; x.fillRect(w / 2 - .25, 4.8, .5, 3); }),
  bikeTop: (base) => vsprite('bt', base, (x, w, h) => { ell(x, w / 2, 1.2, .55, 1.2, '#1b1f27'); ell(x, w / 2, h - 1.2, .55, 1.2, '#1b1f27'); line(x, w / 2, 2, w / 2, h - 2, .8, PAL.vd); line(x, 0, 2.4, w, 2.4, .6, '#30343c'); }),
  carTop: (base, a) => vsprite('ct' + a.join(), base, (x, w, h) => {
    const [col, kind] = a; if (kind === 'moto') { ell(x, w / 2, h / 2, w * .3, h * .45, '#1b1f27'); ell(x, w / 2, h * .45, w * .32, h * .22, col); ell(x, w / 2, h * .55, w * .26, w * .26, '#e8e8e8'); return; }
    rrect(x, .3, .3, w - .6, h - .6, Math.min(w, h) * .28, col); const glass = '#1f2f45';
    if (kind === 'bus') { rrect(x, .9, .9, w - 1.8, h * .1, 1, glass); for (let i = 0; i < 5; i++) { x.fillStyle = glass; x.fillRect(.5, h * (.2 + i * .14), .7, h * .1); x.fillRect(w - 1.2, h * (.2 + i * .14), .7, h * .1); } rrect(x, w * .25, h * .3, w * .5, h * .5, 1, shade(col, .12)); return; }
    if (kind === 'camion') { rrect(x, .4, .4, w - .8, h * .3, 1.2, col); rrect(x, .9, .9, w - 1.8, h * .1, .6, glass); rrect(x, .2, h * .33, w - .4, h * .66, .6, '#c9ccd1'); return; }
    rrect(x, .9, h * .2, w - 1.8, h * .17, 1, glass); rrect(x, .9, h * .68, w - 1.8, h * .12, 1, glass); rrect(x, 1, h * .39, w - 2, h * .27, 1, shade(col, .1)); x.fillStyle = '#fff6b0'; x.fillRect(.6, .4, 1, .5); x.fillRect(w - 1.6, .4, 1, .5);
    if (kind === 'taxi') rrect(x, w / 2 - 1, h * .46, 2, 1, .4, '#1d1f24');
  }),
  truckTop: (base, a) => vsprite('tt' + a.join(), base, (x, w, h) => { const [load = 0, cap = 14] = a; rrect(x, .4, .4, w - .8, h * .26, 1.4, '#e9eef3'); rrect(x, 1, .9, w - 2, h * .09, .6, '#1f2f45'); rrect(x, .2, h * .3, w - .4, h * .68, .8, PAL.vd); const n = Math.min(8, Math.round(8 * load / Math.max(1, cap))); for (let i = 0; i < n; i++) line(x, 1.2, h * .34 + i * h * .075, w - 1.2, h * .34 + i * h * .075, .7, '#1b1f27'); }),
  walker: (base, a) => vsprite('wk' + a.join() + Save.data.profile.shirt + Save.data.profile.skin, base, (x, w, h) => { const P = Save.data.profile, f = a[0] | 0; ell(x, w / 2 - .9, h / 2 + (f ? 1.4 : -1.4), .6, 1, '#2a3550'); ell(x, w / 2 + .9, h / 2 + (f ? -1.4 : 1.4), .6, 1, '#2a3550'); ell(x, w / 2, h / 2, w * .42, h * .2, SHIRTS[P.shirt] || PAL.vd); ell(x, w / 2, h / 2, w * .22, w * .22, PELO[P.hairCol | 0] || '#2a1a10'); })
})) { const orig = Art[name]; Art[name] = function (...a) { const base = orig.apply(this, a); return GFX() === '2d' && !base.sc ? fn(base, a) : base; }; }

/* ---------- vista panorámica de plataformas ---------- */
Object.assign(Ride.prototype, {
  jump() { if (!panoOn(this) || (this.z | 0) > 0 || this.p.veh !== 'bike') return; this.vz = 150; this.z = .01; Snd.sfx('tap'); },
  panoTick(dt) {
    const P = this.p; this.trav = (this.trav || 0) + P.v * dt;
    if (this.z > 0) { this.z += this.vz * dt; this.vz -= 420 * dt; if (this.z <= 0) { this.z = 0; this.vz = 0; } }
    const O = this.obs || (this.obs = []); while (O.length < 4) { const last = O.length ? O[O.length - 1].d : this.trav + 220; O.push({ d: last + 260 + this.rng.f() * 380, k: this.rng.pick(['hueco', 'cono', 'charco', 'hueco']) }); }
    for (const o of O) if (!o.done && this.trav >= o.d) { o.done = true; if (this.z > 5) { this.mode.score += 2; Snd.note(4); this.float('¡Salto!', PAL.vd1); } else if (P.veh === 'bike') { P.v *= .35; this.shake = .25; Snd.sfx('bad'); this.float({ hueco: '¡Hueco!', cono: '¡Cono!', charco: '¡Charco!' }[o.k], PAL.amb); } }
    while (O.length && O[0].done && O[0].d < this.trav - 200) O.shift();
  },
  renderPano(V, min) {
    const b = V.b, q = V.q || 1, vw = V.vw, vh = V.vh, P = this.p, M = this.map; b.setTransform(q, 0, 0, q, 0, 0); V.subX = V.subY = 0; this.min = min;
    if (this.pa == null) this.pa = P.a; if (P.v > 3) { let d = P.a - this.pa; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; this.pa += d * .06; }
    const ax = Math.cos(this.pa), ay = Math.sin(this.pa), xr = Math.round(vw * .38), sc = .6, ex = .9, e0 = M.elev(P.x, P.y), base = Math.round(vh * .7), tr = this.trav || 0;
    const prof = x => { const d = (x - xr) / sc; return base - (M.elev(P.x + ax * d, P.y + ay * d) - e0) * ex; };
    const hor = Math.round(vh * .52); b.drawImage(Art.panorama(vw, vh, min, hor), 0, 0);
    // capa media: ciudad real alrededor (edificios altos, casas en ladera, árboles), con paralaje
    const par = .45, step = 22;
    for (let i = -1; i <= Math.ceil(vw / step) + 1; i++) {
      const sx = i * step - ((tr * sc * par) % step), k0 = Math.floor((tr * sc * par) / step) + i, d = (sx - xr) / sc / par, wx = P.x + ax * d - ay * 90, wy = P.y + ay * d + ax * 90, v = M.get(Math.floor(wx / TS), Math.floor(wy / TS)), hh = h2(k0, 3, 7), gy = prof(sx) - 6;
      if (v === TT.BLDG) { const H = 22 + Math.round(hh * 46), W = 14 + Math.round(hh * 8), col = ROOF[(hh * ROOF.length) | 0]; prect(b, sx, gy - H, W, H, shade(col, -.12)); for (let yy = gy - H + 3; yy < gy - 4; yy += 5) for (let xx = sx + 2; xx < sx + W - 2; xx += 4) prect(b, xx, yy, 2, 2, Art.night(min) > .4 && h2(xx, yy, k0) < .5 ? '#ffe9a0' : '#9fb4c8'); }
      else if (v === TT.BRICK || v === TT.MOUNT && hh < .4) { const col = TEJA[(hh * TEJA.length) | 0]; prect(b, sx, gy - 12, 14, 12, '#d8c8b0'); prect(b, sx - 1, gy - 15, 16, 4, col); prect(b, sx + 5, gy - 7, 4, 7, '#6e4a2a'); }
      else if (v === TT.GRASS || v === TT.MOUNT) { pdisc(b, sx + 6, gy - 12, 7, '#3f8a3f'); prect(b, sx + 5, gy - 6, 2, 6, '#6e4a2a'); }
    }
    // suelo con el perfil real de la vía (subidas y bajadas exageradas para verlas)
    const tile = M.get(Math.floor(P.x / TS), Math.floor(P.y / TS)), cic = tile === TT.CICLO;
    for (let x = 0; x <= vw; x += 2) { const y = Math.round(prof(x)); prect(b, x, y, 2, 3, '#e3ded3'); prect(b, x, y + 3, 2, 10, cic ? '#2f9e57' : '#52575f'); prect(b, x, y + 13, 2, vh - y, '#6b5a43'); if (((x + Math.floor(tr * sc)) & 15) < 7) prect(b, x, y + 8, 2, 1, cic ? '#e8f5d0' : '#e4e4dc'); }
    // vehículos cercanos en la misma vía, vistos de lado
    for (const cr of this.cars) { const dx = cr.x - P.x, dy = cr.y - P.y, al = dx * ax + dy * ay, lat = -dx * ay + dy * ax; if (Math.abs(lat) > 40 * WK || Math.abs(al) > vw / sc) continue; const x = xr + al * sc, y = prof(x) + 5, L = cr.kind === 'bus' ? 30 : cr.kind === 'moto' ? 9 : cr.kind === 'camion' ? 26 : 16, H = cr.kind === 'bus' || cr.kind === 'camion' ? 14 : cr.kind === 'moto' ? 6 : 8;
      prect(b, x - L / 2, y - H, L, H, cr.col); prect(b, x - L / 2 + 2, y - H + 2, L - 4, 3, '#1f2f45'); pdisc(b, x - L / 2 + 3, y, 2, '#1b1f27'); pdisc(b, x + L / 2 - 3, y, 2, '#1b1f27'); }
    // estaciones EnCicla al pasar
    for (const s of M.stations) { const dx = s.x - P.x, dy = s.y - P.y, al = dx * ax + dy * ay, lat = Math.abs(-dx * ay + dy * ax); if (lat > 50 * WK || Math.abs(al) > vw / sc) continue; const x = Math.round(xr + al * sc), y = Math.round(prof(x)); prect(b, x - 16, y - 18, 32, 4, PAL.vd); prect(b, x - 14, y - 14, 2, 14, '#9aa7b8'); for (let i = 0; i < 5; i++) { prect(b, x - 9 + i * 5, y - 7, 1, 7, '#59606c'); prect(b, x - 10 + i * 5, y - 6, 3, 3, PAL.vd); } (this.pLab || (this.pLab = [])).push({ t: s.name, x, y: y - 22 }); }
    // obstáculos para saltar
    for (const o of this.obs || []) { if (o.done) continue; const x = Math.round(xr + (o.d - tr) * sc); if (x < -10 || x > vw + 10) continue; const y = Math.round(prof(x)) + 3; if (o.k === 'hueco') { prect(b, x - 5, y, 10, 3, '#1d1f24'); } else if (o.k === 'cono') { prect(b, x - 1, y - 7, 3, 7, '#f07a1a'); prect(b, x - 1, y - 5, 3, 1, '#fff'); prect(b, x - 3, y, 7, 1, '#f07a1a'); } else { prect(b, x - 7, y, 14, 2, '#7fb6e6'); prect(b, x - 4, y, 6, 1, '#cfe6fa'); } }
    // el jugador, de lado
    const y = Math.round(prof(xr)) + 3 - Math.round(this.z || 0), ph = this.trav ? this.trav / 18 : 0, me = this.mode.uniform ? Art.me({ uniforme: true }) : Art.me();
    if (P.veh === 'truck') { prect(b, xr - 18, y - 16, 36, 13, PAL.vd); prect(b, xr + 10, y - 22, 9, 10, '#e9eef3'); prect(b, xr + 12, y - 20, 5, 4, '#1f2f45'); pdisc(b, xr - 11, y - 2, 3, '#1b1f27'); pdisc(b, xr + 12, y - 2, 3, '#1b1f27'); }
    else if (P.veh === 'walk') Art.person(b, xr, y, me, ph, 1);
    else { Art.bikeSide(b, xr, y - 6, { r: 5, face: 1, col: bikeCol() }); const lx = Math.round(Math.sin(ph * 3) * 2); prect(b, xr - 1 + lx, y - 15, 2, 5, me.pants); prect(b, xr - 1 - lx, y - 15, 2, 5, shade(me.pants, -.2)); prect(b, xr - 2, y - 23, 5, 8, me.vest ? PAL.vd : me.shirt); pline(b, xr + 2, y - 21, xr + 5, y - 18, me.skin); prect(b, xr - 1, y - 28, 5, 5, me.skin); prect(b, xr - 2, y - 30, 7, 3, me.cap || HELMETS[Save.data.profile.helmet] || '#fff'); prect(b, xr + 3, y - 26, 1, 1, '#141414'); }
    if (this.z > 0) { b.fillStyle = '#0004'; b.fillRect(xr - 6, Math.round(prof(xr)) + 4, 12, 2); }
    this.panoXY = { x: xr, y: y - 30 };
  }
});
const _render75 = Ride.prototype.render;
Ride.prototype.render = function (V, min) { this.pLab = []; if (panoOn(this)) return this.renderPano(V, min); this.z = 0; return _render75.call(this, V, min); };
const _rtop75 = Ride.prototype.renderTop;
Ride.prototype.renderTop = function (V) {
  if (!panoOn(this)) return _rtop75.call(this, V);
  const c = V.ctx, n = Art.night(this.min); if (n > 0) { c.fillStyle = 'rgba(8,18,52,' + (n * .45).toFixed(3) + ')'; c.fillRect(0, 0, V.w, V.h); }
  if (this.mode.mods.rain) { c.strokeStyle = '#cfe0ff55'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 60; i++) { const x = (i * 97 + performance.now() * .3) % V.w, y = (i * 53 + performance.now() * .6) % V.h; c.moveTo(x, y); c.lineTo(x - 3, y + 9); } c.stroke(); }
};
const _hud75 = Ride.prototype.hud;
Ride.prototype.hud = function (V, opts) {
  if (!panoOn(this)) return _hud75.call(this, V, opts);
  const cx = this.cxf, cy = this.cyf, T = this.target, fx = this.fx; this.cxf = -1e7; this.cyf = -1e7; this.target = null; this.fx = [];
  try { _hud75.call(this, V, opts); } finally { this.cxf = cx; this.cyf = cy; this.target = T; this.fx = fx; }
  const s = V.s, pp = this.panoXY || { x: 0, y: 0 };
  for (const l of (this.pLab || []).slice(0, 2)) V.text(l.t, l.x * s, l.y * s, { size: 11, align: 'center', bg: '#0a2342dd', color: '#c4ec7c', pad: 3 });
  for (const f of fx) if (f.k === 't') V.text(f.txt, pp.x * s, pp.y * s - 10, { size: 16, align: 'center', stroke: '#0a2342', sw: 4, color: f.col });
  const pct = Math.round((this.sl || 0) * 100); if (Math.abs(pct) >= 3) V.text((pct > 0 ? '▲ SUBIDA ' : '▼ BAJADA ') + Math.abs(pct) + ' %', pp.x * s, pp.y * s - 30, { size: 13, align: 'center', color: pct > 0 ? PAL.amb : PAL.cie, stroke: '#0a2342', sw: 4 });
  if (T) { const d = Math.round(dist(T.x, T.y, this.p.x, this.p.y) * M_PER_PX), lb = (T.label || 'Destino').slice(0, 30); V.text('➜ ' + lb + ' · ' + (d >= 1000 ? (d / 1000).toFixed(1) + ' km' : d + ' m'), V.w / 2, (View.top || 60) + 46, { size: 14, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 5, body: true }); }
};
const _upd75 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) { _upd75.call(this, dt, dir); if (panoOn(this)) this.panoTick(dt); };
/* control en panorámica: la bici sigue la ruta sola; tú pedaleas (→), frenas (←) y saltas (↑ o botón) */
const _mupd75 = MapMode.prototype.update;
MapMode.prototype.update = function (dt) {
  const R = this.ride; if (!R || this.sub || this.botDir || !panoOn(R) || R.big) return _mupd75.call(this, dt);
  const inp = Input.dir(); let d;
  if (R.target) { this.botDrive(); d = this.botDir; } else d = { x: Math.cos(R.p.a), y: Math.sin(R.p.a), m: 1 };
  const thr = inp.m > .2 ? (inp.x < -.4 ? 0 : clamp(.6 + .5 * Math.max(inp.x, 0), .6, 1)) : .6;
  if (inp.m > .5 && inp.y < -.65) R.jump();
  this.botDir = { x: d.x, y: d.y, m: d.m === 0 ? 0 : thr };
  try { _mupd75.call(this, dt); } finally { this.botDir = null; }
};
const _act75 = MapMode.prototype.actions;
MapMode.prototype.actions = function () { const a = _act75.call(this); if (this.ride && !this.sub) { if (panoOn(this.ride) && this.ride.p.veh === 'bike') a.unshift({ id: 'jump', icon: 'llanta', label: 'Saltar', fn: () => this.ride.jump() }); } return a; };
const _key75 = MapMode.prototype.key;
MapMode.prototype.key = function (e) { if (e.code === 'KeyV') return toggleVista(); if (panoOn(this.ride) && (e.code === 'Space' || e.code === 'ArrowUp')) return this.ride.jump(); return _key75.call(this, e); };
function toggleVista() { const S = Save.data.settings; S.vista = S.vista === 'pano' ? 'cenital' : 'pano'; Save.save(); Snd.sfx('tap'); JE.ui && JE.ui.toast(S.vista === 'pano' ? '🎬 Vista panorámica: la bici sigue la ruta; tú pedaleas, frenas y saltas' : '🗺️ Vista cenital'); }
/* pausa: cambiar de vista */
const _pause75 = Game.pause;
Game.pause = function () { _pause75.call(this); const m = $('#pMap'); if (!m || !this.mode || !this.mode.ride) return; const b = document.createElement('button'); b.className = 'btn'; b.id = 'pVista'; b.textContent = Save.data.settings.vista === 'pano' ? '🗺️ Vista cenital' : '🎬 Vista panorámica'; m.parentNode.insertBefore(b, m.nextSibling); b.onclick = () => { toggleVista(); this.resume(); }; };
/* Más: gráficos y vista */
const _mas75 = UI.renderMas;
UI.renderMas = function () {
  _mas75.call(this); const z = $('#tab-mas [data-zoom]'); if (!z) return; const row = z.closest('.opt'), S = Save.data.settings;
  const d = document.createElement('div'); d.innerHTML = `<div class="opt"><span>Gráficos<br><small class="m">Híbrido: mapa dibujado con personajes en pixel</small></span><div class="seg">${[['pixel', 'Pixel'], ['hibrido', 'Híbrido'], ['2d', 'Dibujado 2D']].map(([k, n]) => `<button data-gfx="${k}" class="${GFX() === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="opt"><span>Vista del mapa<br><small class="m">Panorámica: de lado, estilo plataformas (tecla V)</small></span><div class="seg">${[['cenital', 'Cenital'], ['pano', 'Panorámica']].map(([k, n]) => `<button data-vista="${k}" class="${(S.vista || 'cenital') === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>`;
  while (d.firstChild) row.parentNode.insertBefore(d.lastChild, row.nextSibling);
  $$('[data-gfx]').forEach(b => b.onclick = () => { S.gfx = b.dataset.gfx; Save.save(); Art.cache.clear(); CityMap.chunks2.clear(); Snd.sfx('tap'); this.renderMas(); });
  $$('[data-vista]').forEach(b => b.onclick = () => { S.vista = b.dataset.vista; Save.save(); Snd.sfx('tap'); this.renderMas(); });
};
