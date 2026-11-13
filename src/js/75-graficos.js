/* =====================================================================
   GRÁFICOS: ciudad 3D (suelo dibujado, edificios con volumen y perspectiva) o pixel clásico,
   y dos vistas del mapa: cenital y panorámica de plataformas.
   ===================================================================== */
const GFX = () => (Save.data && Save.data.settings.gfx === 'pixel') ? 'pixel' : '3d';
const panoOn = R => !!(R && Save.data.settings.vista === 'pano' && R.mode && R.mode.ride === R);
const SPRK = () => GFX() === '3d' ? .74 : 1;   // en 3D los vehículos se dibujan más pequeños: las calles se sienten anchas
/* dibuja un sprite centrado; los sprites dibujados (sc > 1) se escalan con suavizado */
function blit(c, img, sh) {
  const s = img.sc || 1, k = SPRK(), w = img.width / s * k, h = img.height / s * k;
  if (sh) { c.fillStyle = sh; c.beginPath(); c.ellipse(1, 1.5, w / 2, h / 2, 0, 0, TAU); c.fill(); }
  if (s > 1 || k !== 1) { c.imageSmoothingEnabled = s > 1; c.drawImage(img, -w / 2, -h / 2, w, h); c.imageSmoothingEnabled = false; } else c.drawImage(img, -w / 2, -h / 2);
}

/* ---------- rutas conectadas: une calles y ciclorrutas sueltas al cargar el mapa ---------- */
const isRoad = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE;
const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
CityMap.bridge = function () {
  const t = this.t, W = MW, H = MH, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? TT.MOUNT : t[y * W + x];
  const pass = (ok, maxGap, fillV, keep) => {
    const adds = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (!ok(t[y * W + x])) continue; let n = 0, bx = 0, by = 0;
      for (const [dx, dy] of N8) if (ok(t[(y + dy) * W + x + dx])) { n++; bx = dx; by = dy; }
      if (n !== 1) continue;                                   // solo puntas sueltas
      const d0 = N8.findIndex(d => d[0] === -bx && d[1] === -by);
      search: for (const k of [0, 1, 7]) {                      // de frente y a 45°
        const [dx, dy] = N8[(d0 + k) % 8], path = [];
        for (let s = 1; s <= maxGap + 1; s++) { const v = at(x + dx * s, y + dy * s); if (ok(v)) { if (s > 1) adds.push(path.slice()); break search; } if (v === TT.WATER || v === TT.CANAL || v === TT.STATION || v === TT.DEPOT || v === TT.LAND) break; path.push((y + dy * s) * W + x + dx * s); }
      }
    }
    for (const p of adds) for (const i of p) if (!keep(t[i])) t[i] = fillV;
    return adds.length;
  };
  const r = pass(isRoad, 3, TT.ROAD, v => false), c = pass(v => v === TT.CICLO, 5, TT.CICLO, isRoad);
  // retazos de ciclorruta de 1 o 2 casillas sin conexión: se vuelven andén
  let cut = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (t[y * W + x] !== TT.CICLO) continue; let n = 0, ox = 0, oy = 0;
    for (const [dx, dy] of N8) if (t[(y + dy) * W + x + dx] === TT.CICLO) { n++; ox = x + dx; oy = y + dy; }
    if (n === 0) { t[y * W + x] = TT.WALK; cut++; }
    else if (n === 1) { let m = 0; for (const [dx, dy] of N8) if (t[(oy + dy) * W + ox + dx] === TT.CICLO) m++; if (m === 1) { t[y * W + x] = TT.WALK; t[oy * W + ox] = TT.WALK; cut += 2; } }
  }
  this.bridged = { roads: r, ciclo: c, cut };
};
/* ---------- calles como líneas: la red se rastrea y se simplifica a tramos rectos (sin escalones) ---------- */
const CHW = { 1: .96, 2: 1.3, 3: 1.5, 5: .42 };
CityMap.vectorize = function () {
  const W = MW, H = MH, N = W * H, t = this.t, chains = this.chains = [], kindOf = v => v === TT.ROAD ? 1 : v === TT.AVE || v === TT.BRIDGE ? 2 : v === TT.AUTO ? 3 : v === TT.CICLO ? 5 : 0;
  const rdp = (P, eps) => {   // Ramer-Douglas-Peucker iterativo sobre [x0,y0,x1,y1,...]
    const n = P.length / 2; if (n <= 2) return P; const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1; const st = [[0, n - 1]];
    while (st.length) { const [a, b] = st.pop(), ax = P[a * 2], ay = P[a * 2 + 1], bx = P[b * 2], by = P[b * 2 + 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1; let md = 0, mi = -1;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((P[i * 2] - ax) * dy - (P[i * 2 + 1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
      if (md > eps && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
    const o = []; for (let i = 0; i < n; i++) if (keep[i]) o.push(P[i * 2], P[i * 2 + 1]); return o;
  };
  const trace = (isM, eps) => {
    const m = new Uint8Array(N); for (let i = 0; i < N; i++) if (isM(t[i])) m[i] = 1;
    const nb = (i, f) => { const x = i % W, y = (i / W) | 0; for (let k = 0; k < 8; k++) { const dx = N8[k][0], dy = N8[k][1], nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!m[j]) continue; if (dx && dy && (m[y * W + nx] || m[ny * W + x])) continue; f(j); } };
    const deg = new Uint8Array(N); for (let i = 0; i < N; i++) if (m[i]) { let d = 0; nb(i, () => d++); deg[i] = d; }
    const seen = new Uint8Array(N), pair = new Set();
    const emit = ids => { const P = [], cnt = {}; for (const i of ids) { P.push((i % W) + .5, ((i / W) | 0) + .5); const k = kindOf(t[i]); cnt[k] = (cnt[k] | 0) + 1; } let k = 0, best = -1; for (const q in cnt) if (cnt[q] > best && +q) { best = cnt[q]; k = +q; } const S = rdp(P, eps).map(v => v * TS); chains.push({ k, p: S, j0: deg[ids[0]] > 2, j1: deg[ids[ids.length - 1]] > 2 }); };
    const walk = (a, b) => { const ids = [a]; let prev = a, cur = b; for (;;) { ids.push(cur); if (deg[cur] !== 2 || seen[cur]) break; seen[cur] = 1; let nx = -1; nb(cur, j => { if (j !== prev && nx < 0) nx = j; }); if (nx < 0 || nx === a) { if (nx === a) ids.push(a); break; } prev = cur; cur = nx; } return ids; };
    for (let i = 0; i < N; i++) { if (!m[i] || deg[i] === 2) continue; if (!deg[i]) { emit([i]); continue; } nb(i, j => { if (deg[j] === 2) { if (seen[j]) return; } else { const key = i < j ? i * N + j : j * N + i; if (pair.has(key)) return; pair.add(key); } emit(walk(i, j)); }); }
    for (let i = 0; i < N; i++) if (m[i] && deg[i] === 2 && !seen[i]) { let j0 = -1; nb(i, j => { if (j0 < 0) j0 = j; }); seen[i] = 1; emit(walk(i, j0)); }
  };
  trace(isRoad, .95); trace(v => v === TT.CICLO, .95);
  // la física sigue a la línea: las casillas bajo cada tramo recto pasan a ser vía
  const soft = [TT.GRASS, TT.BRICK, TT.BLDG, TT.WALK, TT.PLAZA, TT.STEPS], code = { 1: TT.ROAD, 2: TT.AVE, 3: TT.AUTO, 5: TT.CICLO };
  for (const ch of chains) { const p = ch.p, r = ch.k === 5 ? .3 : CHW[ch.k] * .42, v = code[ch.k]; if (!v) continue;
    for (let i = 0; i + 3 < p.length; i += 2) { const ax = p[i] / TS, ay = p[i + 1] / TS, bx = p[i + 2] / TS, by = p[i + 3] / TS, L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / .25));
      for (let s = 0; s <= n; s++) { const x = ax + (bx - ax) * s / n, y = ay + (by - ay) * s / n; for (let yy = Math.floor(y - r); yy <= Math.floor(y + r); yy++) for (let xx = Math.floor(x - r); xx <= Math.floor(x + r); xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const q = yy * W + xx, cur = t[q]; if (soft.includes(cur) && (v !== TT.CICLO || cur !== TT.BLDG && cur !== TT.BRICK)) t[q] = v; } } } }
  // índice espacial por celdas de 32 casillas
  const G = this.chainGrid = new Map(), C = 32 * TS;
  chains.forEach((ch, idx) => { const p = ch.p; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const k = gx + ',' + gy; (G.get(k) || G.set(k, []).get(k)).push(idx); } });
};
CityMap.chainsNear = function (x0, y0, w, h) { const C = 32 * TS, out = new Set(); for (let gy = Math.floor(y0 / C); gy <= Math.floor((y0 + h) / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor((x0 + w) / C); gx++) for (const i of this.chainGrid.get(gx + ',' + gy) || []) out.add(this.chains[i]); return [...out]; };
const _build75 = CityMap.build;
CityMap.build = function () { this.bridge(); this.vectorize(); _build75.call(this); };

/* ---------- suelo de la ciudad 3D ---------- */
const GROUND = ['#5f9e46', '#3d7a3a', '#bfb7a6', '#c2beb4', '#c2beb4', '#c2beb4', '#c9c5bb', '#c9c5bb', '#3f86c8', '#5f9e46', '#d9d1bd', '#c2beb4', '#cfcabf', '#c9b78c', '#c2beb4', '#b5b0a6', '#c5b99f'];
const ROADW = { [TT.ROAD]: .96, [TT.AVE]: 1.3, [TT.AUTO]: 1.5, [TT.BRIDGE]: 1.3 };
const ROOF = ['#8a8d93', '#9a9893', '#7d8189', '#a59f95', '#8f9499', '#b1aca2'], TEJA = ['#c2623b', '#b55430', '#cf7448', '#a94b2b', '#c8693f'];
const WALLS = [['#b5653f', '#9a5334'], ['#c0714a', '#a35d3b'], ['#a85a38', '#8d4a2d'], ['#cfc8b8', '#b0a999'], ['#d9d2c2', '#bab3a3'], ['#b9b4a8', '#9c978b'], ['#a9bccd', '#8ba0b3'], ['#c7d0d8', '#a7b1ba']];
const TALL = [[6.2505, -75.5686, 80], [6.2086, -75.5695, 70], [6.2405, -75.5745, 45], [6.1715, -75.5860, 30], [6.1725, -75.6110, 30], [6.3370, -75.5580, 30]];
const mixHex = (a, b, f) => { const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)], A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
Object.assign(CityMap, {
  chunks2: new Map(), blk: new Map(),
  hasG(cx, cy) { return GFX() === 'pixel' ? this.chunks.has(cx + ',' + cy) : this.chunks2.has(cx + ',' + cy + ':' + this.cq()); },
  cq() { return clamp(Math.round((View.s || 2) * (View.dpr || 1) / 2.4), 2, 3); },
  chunkG(cx, cy) {
    if (GFX() === 'pixel') return this.chunk(cx, cy);
    const q = this.cq(), k = cx + ',' + cy + ':' + q; let c = this.chunks2.get(k);
    if (c) { this.chunks2.delete(k); this.chunks2.set(k, c); return c; }
    c = Art.mk(CH * TS * q, CH * TS * q, x => this.drawGround3(x, cx, cy, q));
    this.chunks2.set(k, c); if (this.chunks2.size > 14) this.chunks2.delete(this.chunks2.keys().next().value);
    return c;
  },
  /* bloques con volumen de un sector: rectángulos de edificios (por manzana) y de casas */
  blocks(cx, cy) {
    const key = cx + ',' + cy; let L = this.blk.get(key); if (L) return L; L = [];
    if (!this.tallT) this.tallT = TALL.map(([la, lo, r]) => { const g = geoT(la, lo); return [g.x, g.y, r]; });
    const x0 = cx * CH, y0 = cy * CH, used = new Uint8Array(CH * CH), free = (i, j, v) => !used[j * CH + i] && this.get(x0 + i, y0 + j) === v && !this.lid.has(this.idx(x0 + i, y0 + j));
    for (let j = 0; j < CH; j++) for (let i = 0; i < CH; i++) {
      const x = x0 + i, y = y0 + j, v = this.get(x, y); if ((v !== TT.BLDG && v !== TT.BRICK) || !free(i, j, v)) continue;
      const cell = v === TT.BLDG ? 4 : 2, mx = Math.min(CH, (Math.floor(x / cell) + 1) * cell - x0), my = Math.min(CH, (Math.floor(y / cell) + 1) * cell - y0);
      let w = 1; while (i + w < mx && free(i + w, j, v)) w++;
      let h = 1; grow: while (j + h < my) { for (let k = 0; k < w; k++) if (!free(i + k, j + h, v)) break grow; h++; }
      for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) used[(j + b) * CH + i + a] = 1;
      const r = h2(Math.floor(x / cell), Math.floor(y / cell), 21), r2 = h2(x, y, 22); let boost = 0; for (const [tx, ty, rad] of this.tallT) boost = Math.max(boost, clamp(1.5 - Math.hypot(x - tx, y - ty) / rad, 0, 1));
      const house = v === TT.BRICK, z = house ? .07 + .05 * r : .13 + .26 * r + .6 * r * r * boost, wi = house ? 3 + ((r2 * 2) | 0) : z > .62 ? 6 + ((r2 * 2) | 0) : (r2 * 6) | 0, m = 3;
      L.push({ x: x * TS + m, y: y * TS + m, w: w * TS - 2 * m, h: h * TS - 2 * m, z, house, k: r2, roof: house ? TEJA[(r * TEJA.length) | 0] : ROOF[(r2 * ROOF.length) | 0], wa: WALLS[wi][0], wb: WALLS[wi][1], pal: [] });
    }
    this.blk.set(key, L); if (this.blk.size > 60) this.blk.delete(this.blk.keys().next().value);
    return L;
  },
  drawGround3(c, cx, cy, q) {
    const x0 = cx * CH, y0 = cy * CH, px0 = x0 * TS, py0 = y0 * TS, S = CH * TS, g = (x, y) => this.get(x, y), wat = v => v === TT.WATER || v === TT.CANAL;
    c.setTransform(q, 0, 0, q, -px0 * q, -py0 * q); c.lineCap = 'round'; c.lineJoin = 'round';
    // base: pasto, andenes con losas, plazas y agua
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) {
      const v = g(x, y), X = x * TS, Y = y * TS, r = h2(x, y, 2); c.fillStyle = v === TT.GRASS ? (r < .5 ? '#5f9e46' : '#5a9742') : GROUND[v] || '#5f9e46'; c.fillRect(X, Y, TS + .5, TS + .5);
      if (v === TT.GRASS || v === TT.MOUNT) { c.fillStyle = v === TT.MOUNT ? '#356f35' : '#6aa94f'; for (let k = 0; k < 3; k++) c.fillRect(X + h2(x, y, 30 + k) * 14, Y + h2(x, y, 40 + k) * 14, 1.6, 1.6); }
      else if (v === TT.PLAZA) { c.fillStyle = '#cbc2ab'; c.fillRect(X, Y, TS, .6); c.fillRect(X, Y, .6, TS); c.fillRect(X + 8, Y, .5, TS); c.fillRect(X, Y + 8, TS, .5); }
      else if (v === TT.STEPS) { c.fillStyle = '#a99d84'; for (let k = 2; k < TS; k += 4) c.fillRect(X, Y + k, TS, .8); }
      else if (!wat(v) && v !== TT.LAND) { c.fillStyle = '#b3aea3'; c.fillRect(X, Y, TS, .5); c.fillRect(X, Y, .5, TS); c.fillRect(X + 5.3, Y, .4, TS); c.fillRect(X + 10.6, Y, .4, TS); c.fillRect(X, Y + 5.3, TS, .4); c.fillRect(X, Y + 10.6, TS, .4); }
    }
    // relieve suave (luz del noroeste)
    const RS = CH * 2 + 2, rc = Art.mk(RS, RS, r => { for (let j = 0; j < RS; j++) for (let i = 0; i < RS; i++) { const tx = x0 - .5 + i / 2, ty = y0 - .5 + j / 2, gx = (this.elevT(tx + .5, ty) - this.elevT(tx - .5, ty)) / VM.tile, gy = (this.elevT(tx, ty + .5) - this.elevT(tx, ty - .5)) / VM.tile, f = clamp((gx + gy) * 1.1, -.3, .25); r.fillStyle = f > 0 ? 'rgba(255,250,230,' + (f * .5).toFixed(3) + ')' : 'rgba(10,20,40,' + (-f * .6).toFixed(3) + ')'; r.fillRect(i, j, 1, 1); } });
    c.imageSmoothingEnabled = true; c.drawImage(rc, 0, 0, RS, RS, px0 - TS * .75, py0 - TS * .75, RS * TS / 2, RS * TS / 2);
    const seg = (test, w, col, dash) => {
      c.strokeStyle = col; c.lineWidth = w * TS; c.setLineDash(dash || []); c.beginPath();
      for (let y = y0 - 2; y <= y0 + CH + 1; y++) for (let x = x0 - 2; x <= x0 + CH + 1; x++) {
        if (!test(g(x, y))) continue; const ax = x * TS + TS / 2, ay = y * TS + TS / 2; if (!dash) { c.moveTo(ax, ay); c.lineTo(ax + .01, ay); }
        for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) { if (!test(g(x + dx, y + dy))) continue; if (dx && dy && (test(g(x + dx, y)) || test(g(x, y + dy)))) continue; c.moveTo(ax, ay); c.lineTo(ax + dx * TS, ay + dy * TS); }
      }
      c.stroke(); c.setLineDash([]);
    };
    // agua con orilla
    const riv = v => v === TT.WATER, can = v => v === TT.CANAL; seg(wat, .62, '#7f9c6b'); seg(can, .44, '#3f86c8'); seg(riv, 1.32, '#2f6fae'); seg(riv, 1.1, '#3f86c8'); seg(riv, .4, '#62a6e0');
    // calles y ciclorrutas: tramos rectos con sardinel, asfalto, bordes y línea de centro
    const CHS = this.chainsNear(px0 - 2 * TS, py0 - 2 * TS, S + 4 * TS, S + 4 * TS);
    const run = (f, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); for (const ch of CHS) { if (!f(ch.k)) continue; const p = ch.p; c.moveTo(p[0], p[1]); if (p.length === 2) c.lineTo(p[0] + .01, p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); } c.stroke(); c.setLineDash([]); };
    const RD = k => k > 0 && k < 5, WIDE = k => k === 2 || k === 3;
    for (const k of [1, 2, 3]) run(q => q === k, (CHW[k] + .2) * TS, '#8e8a80');
    for (const k of [1, 2, 3]) run(q => q === k, CHW[k] * TS, k === 3 ? '#4a4e56' : k === 2 ? '#50545c' : '#565a62');
    run(WIDE, (CHW[2] - .14) * TS, '#d9d6cc'); run(WIDE, (CHW[2] - .22) * TS, '#50545c'); run(q => q === 3, (CHW[3] - .16) * TS, '#e8c64a'); run(q => q === 3, (CHW[3] - .24) * TS, '#4a4e56');
    run(q => q === 1, .7, '#e6e4dc', [5, 7]); run(q => q === 2, .8, '#e8c64a', [8, 6]); run(q => q === 3, .8, '#f2f0e8', [9, 6]);
    for (const ch of CHS) { if (!RD(ch.k)) continue; const p = ch.p, w = CHW[ch.k] * TS / 2 - .5; c.fillStyle = ch.k === 3 ? '#4a4e56' : ch.k === 2 ? '#50545c' : '#565a62'; if (ch.j0) { c.beginPath(); c.arc(p[0], p[1], w, 0, TAU); c.fill(); } if (ch.j1) { c.beginPath(); c.arc(p[p.length - 2], p[p.length - 1], w, 0, TAU); c.fill(); } }
    // cebras en los cruces con semáforo
    c.fillStyle = '#eceae2';
    for (const L of this.lights) {
      if (L.x < px0 - 40 || L.y < py0 - 40 || L.x > px0 + S + 40 || L.y > py0 + S + 40) continue;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const ax = L.x + dx * 26, ay = L.y + dy * 26, v = g(Math.floor(ax / TS), Math.floor(ay / TS)); if (!isRoad(v)) continue; const hw = ROADW[v] * TS / 2 - 1; for (let k = -hw + 1; k < hw - 1; k += 3) { if (dx) c.fillRect(ax - 3, ay + k, 6, 1.6); else c.fillRect(ax + k, ay - 3, 1.6, 6); } }
    }
    // ciclorrutas: carril verde con bordes y bicis pintadas
    run(q => q === 5, .52 * TS, '#e9e6dc'); run(q => q === 5, .42 * TS, '#2e9d55'); run(q => q === 5, .55, '#d8f0c8', [3, 4]);
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) if (g(x, y) === TT.CICLO && h2(x, y, 12) < .12) { const X = x * TS + TS / 2, Y = y * TS + TS / 2; c.strokeStyle = '#e6f5da'; c.lineWidth = .6; c.beginPath(); c.arc(X - 1.6, Y, 1.2, 0, TAU); c.moveTo(X + 2.8, Y); c.arc(X + 1.6, Y, 1.2, 0, TAU); c.stroke(); }
    // sombras de los edificios (sol del noroeste)
    c.fillStyle = 'rgba(8,14,30,.26)';
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) for (const b of this.blocks(cx + i, cy + j)) { const d = 3 + b.z * 13; if (b.x + b.w + d < px0 || b.y + b.h + d < py0 || b.x > px0 + S || b.y > py0 + S) continue; c.beginPath(); c.moveTo(b.x + b.w, b.y); c.lineTo(b.x + b.w + d, b.y + d); c.lineTo(b.x + b.w + d, b.y + b.h + d); c.lineTo(b.x + d, b.y + b.h + d); c.lineTo(b.x, b.y + b.h); c.lineTo(b.x + b.w, b.y + b.h); c.closePath(); c.fill(); }
    // lugares emblemáticos
    c.imageSmoothingEnabled = false; LANDMARKS.forEach((L, i) => { if (L.x + L.w < x0 || L.x > x0 + CH || L.y + L.h < y0 || L.y > y0 + CH) return; c.drawImage(this.landmarkCanvas(i), L.x * TS, L.y * TS, L.w * TS, L.h * TS); });
    // árboles con sombra
    for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
      const v = g(x, y), r = h2(x, y, 5); let rad = 0;
      if (v === TT.GRASS && r < .3 && !this.lid.has(this.idx(x, y))) rad = .36 + (r < .1 ? .14 : 0); else if (v === TT.WALK && r < .14) rad = .26; else if (v === TT.MOUNT && r < .6) rad = .42 + r * .3;
      if (!rad) continue; const X = x * TS + TS * (.3 + h2(x, y, 7) * .4), Y = y * TS + TS * (.3 + h2(x, y, 8) * .4), k = h2(x, y, 6), col = k < .05 ? '#f2c230' : k < .09 ? '#e88ab8' : v === TT.MOUNT ? '#2f6a33' : '#3f8a3f', R = rad * TS;
      c.fillStyle = 'rgba(8,14,30,.28)'; c.beginPath(); c.arc(X + R * .35, Y + R * .4, R, 0, TAU); c.fill(); c.fillStyle = shade(col, -.18); c.beginPath(); c.arc(X, Y, R, 0, TAU); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(X - R * .15, Y - R * .15, R * .78, 0, TAU); c.fill(); c.fillStyle = k < .09 ? '#fff3a088' : '#ffffff2e'; c.beginPath(); c.arc(X - R * .35, Y - R * .35, R * .38, 0, TAU); c.fill();
    }
    // tranvía y viaductos del metro
    const path = (L, w, col, dx = 0, dy = 0) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); L.pts.forEach((p, i) => i ? c.lineTo(p.x + dx, p.y + dy) : c.moveTo(p.x + dx, p.y + dy)); c.stroke(); };
    path(this.tram, 6, '#77767a'); path(this.tram, 3.4, '#cfd3d8'); path(this.tram, 1.6, '#77767a');
    for (const L of [this.lineA, this.lineB]) { path(L, 13, 'rgba(8,14,30,.3)', 4, 5); path(L, 13, '#8d939c'); path(L, 10.5, '#d3d6db'); path(L, 4.6, '#9aa0a8'); path(L, 3.4, '#d3d6db'); for (const st of L.st) { const p = this.at(L, st.s); c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillStyle = 'rgba(8,14,30,.3)'; c.fillRect(-18, -8, 44, 24); c.fillStyle = '#eef0f3'; c.beginPath(); c.roundRect(-21, -11, 42, 22, 4); c.fill(); c.fillStyle = PAL.vd; c.fillRect(-21, -11, 42, 3); c.restore(); } }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
});
/* edificios con volumen: se dibujan en cada cuadro con perspectiva desde el jugador (lo lejano primero) */
Ride.prototype.draw3D = function (c, ox, oy, vw, vh) {
  if (GFX() !== '3d') return; const M = this.map, P = this.p, px = P.x - ox, py = P.y - oy, K = .36, S = CH * TS, nb = Math.round(Art.night(this.min) * 3), L = [], mg = 56;
  for (let cy = Math.floor((oy - mg) / S); cy <= Math.floor((oy + vh + mg) / S); cy++) for (let cx = Math.floor((ox - mg) / S); cx <= Math.floor((ox + vw + mg) / S); cx++) {
    if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue;
    for (const b of M.blocks(cx, cy)) { const x = b.x - ox, y = b.y - oy; if (x > vw + mg || y > vh + mg || x + b.w < -mg || y + b.h < -mg) continue; const dx = x + b.w / 2 - px, dy = y + b.h / 2 - py; b.d = dx * dx + dy * dy; L.push(b); }
  }
  L.sort((a, b) => b.d - a.d); c.lineWidth = .5;
  for (const b of L) {
    const p = b.pal[nb] || (b.pal[nb] = { roof: mixHex(b.roof, '#0b1430', nb * .17), wa: mixHex(b.wa, '#0b1430', nb * .17), wb: mixHex(b.wb, '#0b1430', nb * .17), ln: nb >= 2 ? '#ffd97a' : shade(b.wb, -.22), top: mixHex(shade(b.roof, .16), '#0b1430', nb * .17) });
    const x0 = b.x - ox, y0 = b.y - oy, x1 = x0 + b.w, y1 = y0 + b.h, f = 1 + K * b.z, rx0 = px + (x0 - px) * f, ry0 = py + (y0 - py) * f, rx1 = px + (x1 - px) * f, ry1 = py + (y1 - py) * f, nf = b.house ? 0 : Math.max(1, Math.round(b.z * 9));
    const wall = (ax, ay, bx, by, cx2, cy2, dx2, dy2, col) => {
      c.fillStyle = col; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo(cx2, cy2); c.lineTo(dx2, dy2); c.closePath(); c.fill();
      if (nf > 1) { c.strokeStyle = p.ln; if (nb >= 2) c.setLineDash([1.2, 2.2]); c.beginPath(); for (let i = 1; i < nf; i++) { const t = i / nf; c.moveTo(ax + (dx2 - ax) * t, ay + (dy2 - ay) * t); c.lineTo(bx + (cx2 - bx) * t, by + (cy2 - by) * t); } c.stroke(); if (nb >= 2) c.setLineDash([]); }
    };
    if (px < x0) wall(x0, y0, x0, y1, rx0, ry1, rx0, ry0, p.wb); else if (px > x1) wall(x1, y0, x1, y1, rx1, ry1, rx1, ry0, p.wb);
    if (py < y0) wall(x0, y0, x1, y0, rx1, ry0, rx0, ry0, p.wa); else if (py > y1) wall(x0, y1, x1, y1, rx1, ry1, rx0, ry1, p.wa);
    const rw = rx1 - rx0, rh = ry1 - ry0; c.fillStyle = p.roof; c.fillRect(rx0, ry0, rw, rh);
    if (b.house) { c.fillStyle = p.top; if (rw >= rh) { c.fillRect(rx0, ry0 + rh / 2 - .4, rw, .8); for (let x = TS * f; x < rw - 2; x += TS * f) c.fillRect(rx0 + x, ry0, .5, rh); } else { c.fillRect(rx0 + rw / 2 - .4, ry0, .8, rh); for (let y = TS * f; y < rh - 2; y += TS * f) c.fillRect(rx0, ry0 + y, rw, .5); } }
    else {
      c.strokeStyle = p.top; c.strokeRect(rx0 + .8, ry0 + .8, rw - 1.6, rh - 1.6);
      if (rw > 16 && rh > 16) { const k = b.k, ux = rx0 + rw * (.25 + k * .4), uy = ry0 + rh * (.3 + ((k * 7) % 1) * .35); c.fillStyle = p.top; if (k < .35) { c.fillRect(ux, uy, 5, 3.4); c.fillRect(ux + 6.5, uy, 3, 3.4); } else if (k < .6) { c.beginPath(); c.arc(ux, uy, 2.6, 0, TAU); c.fill(); } else if (k < .75 && b.z > .5) { c.strokeStyle = '#e8e6de'; c.beginPath(); c.arc(rx0 + rw / 2, ry0 + rh / 2, 5, 0, TAU); c.stroke(); c.fillStyle = '#e8e6de'; c.fillRect(rx0 + rw / 2 - 2, ry0 + rh / 2 - 2.5, .9, 5); c.fillRect(rx0 + rw / 2 + 1.1, ry0 + rh / 2 - 2.5, .9, 5); c.fillRect(rx0 + rw / 2 - 2, ry0 + rh / 2 - .45, 4, .9); } else if (k > .88) { c.fillStyle = '#6aa94f'; c.fillRect(rx0 + 3, ry0 + 3, rw - 6, rh - 6); } }
    }
  }
};

/* ---------- personajes y vehículos dibujados (ciudad 3D) ---------- */
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
})) { const orig = Art[name]; Art[name] = function (...a) { const base = orig.apply(this, a); return GFX() === '3d' && !base.sc ? fn(base, a) : base; }; }

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
  const d = document.createElement('div'); d.innerHTML = `<div class="opt"><span>Gráficos</span><div class="seg">${[['3d', 'Ciudad 3D'], ['pixel', 'Pixel clásico']].map(([k, n]) => `<button data-gfx="${k}" class="${GFX() === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="opt"><span>Vista del mapa<br><small class="m">Panorámica: de lado, estilo plataformas (tecla V)</small></span><div class="seg">${[['cenital', 'Cenital'], ['pano', 'Panorámica']].map(([k, n]) => `<button data-vista="${k}" class="${(S.vista || 'cenital') === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>`;
  while (d.firstChild) row.parentNode.insertBefore(d.lastChild, row.nextSibling);
  $$('[data-gfx]').forEach(b => b.onclick = () => { S.gfx = b.dataset.gfx; Save.save(); Art.cache.clear(); CityMap.chunks2.clear(); CityMap.chunks.clear(); Snd.sfx('tap'); this.renderMas(); });
  $$('[data-vista]').forEach(b => b.onclick = () => { S.vista = b.dataset.vista; Save.save(); Snd.sfx('tap'); this.renderMas(); });
};
