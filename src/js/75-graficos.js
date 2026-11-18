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
const CHW = { 1: .96, 2: 1.3, 3: 1.5, 4: 1.1, 5: .42, 6: .7, 7: .55, 8: .3, 9: .2 };
const SWK = { 1: 3.5, 2: 6, 3: 0, 4: 4.5, 6: .5, 7: .5, 8: .3 };   // andén a cada lado (px) según el tipo de vía
/* ancho dibujado de cada tramo (px): con el mapa de 10 m sale del dato real (malla vial oficial o ancho típico de su clase), dentro de unos límites jugables */
const WLIM = { 1: [.62, 1.25], 4: [.75, 1.5], 2: [1.05, 2.4], 3: [1.05, 1.8], 5: [.36, .5], 6: [.5, 1], 7: [.45, .7], 8: [.25, .4] };
const chW = (k, m) => Math.round((VM.tile >= 20 || !m || !WLIM[k] ? CHW[k] || 1 : clamp(m / VM.tile, WLIM[k][0], WLIM[k][1])) * 20) / 20 * TS;   // 1 calle, 4 carrera, 2 avenida, 3 autopista, 5 ciclorruta, 6 peatonal, 7 escalas, 8 sendero
CityMap.vectorize = function () {
  const W = MW, H = MH, N = W * H, t = this.t, chains = this.chains = [], kindOf = v => v === TT.ROAD ? 1 : v === TT.AVE || v === TT.BRIDGE ? 2 : v === TT.AUTO ? 3 : v === TT.CICLO ? 5 : 0;
  const rdp = (P, eps) => {   // Ramer-Douglas-Peucker iterativo sobre [x0,y0,x1,y1,...]
    const n = P.length / 2; if (n <= 2) return P; const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1; const st = [[0, n - 1]];
    while (st.length) { const [a, b] = st.pop(), ax = P[a * 2], ay = P[a * 2 + 1], bx = P[b * 2], by = P[b * 2 + 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1; let md = 0, mi = -1;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((P[i * 2] - ax) * dy - (P[i * 2 + 1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
      if (md > eps && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
    const o = []; for (let i = 0; i < n; i++) if (keep[i]) o.push(P[i * 2], P[i * 2 + 1]); return o;
  };
  /* Zhang-Suen: una calle ancha o una plancha de asfalto se reduce a su eje de una casilla (las calles finas no cambian) */
  const thin = m => {
    let idx = []; for (let i = W; i < N - W; i++) if (m[i]) { const x = i % W; if (x > 0 && x < W - 1) idx.push(i); }
    for (let it = 0, ch = 1; ch && it < 30; it++) {
      ch = 0;
      for (const step of [0, 1]) {
        const del = [];
        for (const i of idx) {
          if (!m[i]) continue; const p2 = m[i - W], p3 = m[i - W + 1], p4 = m[i + 1], p5 = m[i + W + 1], p6 = m[i + W], p7 = m[i + W - 1], p8 = m[i - 1], p9 = m[i - W - 1];
          const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if (B < 2 || B > 6) continue;
          const A = (!p2 & p3) + (!p3 & p4) + (!p4 & p5) + (!p5 & p6) + (!p6 & p7) + (!p7 & p8) + (!p8 & p9) + (!p9 & p2); if (A !== 1) continue;
          if (step ? (p2 & p4 & p8) | (p2 & p6 & p8) : (p2 & p4 & p6) | (p4 & p6 & p8)) continue; del.push(i);
        }
        for (const i of del) m[i] = 0; if (del.length) ch = 1;
      }
      idx = idx.filter(i => m[i]);
    }
  };
  const trace = (isM, eps, delgado) => {
    const m = new Uint8Array(N); for (let i = 0; i < N; i++) if (isM(t[i])) m[i] = 1; if (delgado) thin(m);
    const nb = (i, f) => { const x = i % W, y = (i / W) | 0; for (let k = 0; k < 8; k++) { const dx = N8[k][0], dy = N8[k][1], nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!m[j]) continue; if (dx && dy && (m[y * W + nx] || m[ny * W + x])) continue; f(j); } };
    const deg = new Uint8Array(N); for (let i = 0; i < N; i++) if (m[i]) { let d = 0; nb(i, () => d++); deg[i] = d; }
    const seen = new Uint8Array(N), pair = new Set();
    const emit = ids => { const P = [], cnt = {}; for (const i of ids) { P.push((i % W) + .5, ((i / W) | 0) + .5); const k = kindOf(t[i]); cnt[k] = (cnt[k] | 0) + 1; } let k = 0, best = -1; for (const q in cnt) if (cnt[q] > best && +q) { best = cnt[q]; k = +q; } const S = rdp(P, eps).map(v => v * TS); chains.push({ k, p: S, w: chW(k), j0: deg[ids[0]] > 2, j1: deg[ids[ids.length - 1]] > 2 }); };
    const walk = (a, b) => { const ids = [a]; let prev = a, cur = b; for (;;) { ids.push(cur); if (deg[cur] !== 2 || seen[cur]) break; seen[cur] = 1; let nx = -1; nb(cur, j => { if (j !== prev && nx < 0) nx = j; }); if (nx < 0 || nx === a) { if (nx === a) ids.push(a); break; } prev = cur; cur = nx; } return ids; };
    for (let i = 0; i < N; i++) { if (!m[i] || deg[i] === 2) continue; if (!deg[i]) { emit([i]); continue; } nb(i, j => { if (deg[j] === 2) { if (seen[j]) return; } else { const key = i < j ? i * N + j : j * N + i; if (pair.has(key)) return; pair.add(key); } emit(walk(i, j)); }); }
    for (let i = 0; i < N; i++) if (m[i] && deg[i] === 2 && !seen[i]) { let j0 = -1; nb(i, j => { if (j0 < 0) j0 = j; }); seen[i] = 1; emit(walk(i, j0)); }
  };
  if (this.vias) {   // calles exactas de los datos: cada vía con su forma y su nombre
    const ends = new Map(), key = (x, y) => Math.round(x) + ',' + Math.round(y);
    for (const v of this.vias) if (v.k <= 4) { const p = v.p, n = p.length; for (const q of [key(p[0], p[1]), key(p[n - 2], p[n - 1])]) ends.set(q, (ends.get(q) || 0) + 1); }
    for (const v of this.vias) { const p = v.p, n = p.length; chains.push({ k: v.k, p, n: v.n, nom: v.nom, w: chW(v.k, v.w), j0: v.k <= 4 && ends.get(key(p[0], p[1])) > 1, j1: v.k <= 4 && ends.get(key(p[n - 2], p[n - 1])) > 1 }); }
  } else trace(isRoad, .95, true);
  if (!(this.vias && VM.v >= 3)) trace(v => v === TT.CICLO, .95);   // v3: las ciclorrutas ya vienen como vectores
  // la física sigue a la línea: las casillas bajo cada tramo recto pasan a ser vía
  const soft = [TT.GRASS, TT.BRICK, TT.BLDG, TT.WALK, TT.PLAZA, TT.STEPS], code = { 1: TT.ROAD, 2: TT.AVE, 3: TT.AUTO, 4: TT.ROAD, 5: TT.CICLO };
  const cov = this.cov = new Uint8Array(N);
  for (const ch of chains) { const p = ch.p, r = ch.k === 5 ? .3 : ch.w / TS * .42, rp = !this.vias || ch.k === 5 ? r : ch.k === 1 || ch.k === 4 ? 0 : .3, v = code[ch.k]; if (!v) continue;   // con vías exactas, la física solo toma el eje (la cuadrícula ya trae la calle)
    for (let i = 0; i + 3 < p.length; i += 2) { const ax = p[i] / TS, ay = p[i + 1] / TS, bx = p[i + 2] / TS, by = p[i + 3] / TS, L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / .25));
      for (let s = 0; s <= n; s++) { const x = ax + (bx - ax) * s / n, y = ay + (by - ay) * s / n; for (let yy = Math.floor(y - r); yy <= Math.floor(y + r); yy++) for (let xx = Math.floor(x - r); xx <= Math.floor(x + r); xx++) { if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const q = yy * W + xx, cur = t[q]; if (v !== TT.CICLO) cov[q] = 1; if (xx < Math.floor(x - rp) || xx > Math.floor(x + rp) || yy < Math.floor(y - rp) || yy > Math.floor(y + rp)) continue; if (soft.includes(cur) && (v !== TT.CICLO || cur !== TT.BLDG && cur !== TT.BRICK)) t[q] = v; } } } }
  // índice espacial por celdas de 32 casillas
  const G = this.chainGrid = new Map(), C = 32 * TS;
  chains.forEach((ch, idx) => { ch.id = idx; const p = ch.p; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const k = gx + ',' + gy; (G.get(k) || G.set(k, []).get(k)).push(idx); } });
};
const chainLen = p => { let L = 0; for (let i = 2; i < p.length; i += 2) L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); return L; };
/* cebras: en cada semáforo, a cada lado del cruce y sobre cada calle que pasa por él, perpendiculares a ella */
CityMap.zebras = function (x0, y0, w, h) {
  const out = [];
  for (const L of this.lights) {
    if (L.x < x0 || L.y < y0 || L.x > x0 + w || L.y > y0 + h) continue;
    if (!L.zb) {
      L.zb = [];
      for (const ch of this.chainsNear(L.x - 2 * TS, L.y - 2 * TS, 4 * TS, 4 * TS)) {
        if (!(ch.k >= 1 && ch.k <= 4) || ch.p.length < 4) continue; const p = ch.p, hw = ch.w / 2; let bd = 1.4 * TS, bi = -1, bt = 0;
        for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, t = clamp(((L.x - ax) * dx + (L.y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1), d = Math.hypot(ax + dx * t - L.x, ay + dy * t - L.y); if (d < bd) { bd = d; bi = i; bt = t; } }
        if (bi < 0) continue; const ax = p[bi - 2], ay = p[bi - 1], dx = p[bi] - ax, dy = p[bi + 1] - ay, len = Math.hypot(dx, dy); if (len < 1) continue;
        const ux = dx / len, uy = dy / len, cx = ax + dx * bt, cy = ay + dy * bt;
        for (const sg of [-1, 1]) { const zx = cx + ux * 15 * sg, zy = cy + uy * 15 * sg; if (L.zb.some(z => Math.hypot(z.x - zx, z.y - zy) < hw * 2 + 4)) continue; L.zb.push({ x: zx, y: zy, ux, uy, hw }); }
      }
    }
    for (const z of L.zb) out.push(z);
  }
  return out;
};
CityMap.chainsNear = function (x0, y0, w, h) { const C = 32 * TS, out = new Set(); for (let gy = Math.floor(y0 / C); gy <= Math.floor((y0 + h) / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor((x0 + w) / C); gx++) for (const i of this.chainGrid.get(gx + ',' + gy) || []) out.add(this.chains[i]); return [...out]; };
const _build75 = CityMap.build;
CityMap.build = function () { this.bridge(); this.vectorize(); _build75.call(this); };

/* ---------- suelo de la ciudad 3D ---------- */
const GROUND = ['#5f9e46', '#3d7a3a', '#bfb7a6', '#c2beb4', '#c2beb4', '#c2beb4', '#c9c5bb', '#c9c5bb', '#3f86c8', '#5f9e46', '#d9d1bd', '#c2beb4', '#cfcabf', '#c9b78c', '#c2beb4', '#b5b0a6', '#c5b99f'];
const ROADW = { [TT.ROAD]: .96, [TT.AVE]: 1.3, [TT.AUTO]: 1.5, [TT.BRIDGE]: 1.3 };
const LOSA = ['#a7a49c', '#9a9893', '#b5b0a6', '#8f9196', '#a39d92'], PINTA = ['#d9c7a3', '#c9b38a', '#e0cfae'];
const PARK_COL = ['#c0392b', '#ecf0f1', '#2c3e50', '#7f8c8d', '#f1c40f', '#2980b9', '#bdc3c7', '#8e44ad', '#16a085'], ROPA = ['#ff6b5a', '#56c7ff', '#ffc93c', '#ffffff', '#9bd341', '#b07cff'];
const ROOF = ['#8a8d93', '#9a9893', '#7d8189', '#a59f95', '#8f9499', '#b1aca2'], TEJA = ['#c2623b', '#b55430', '#cf7448', '#a94b2b', '#c8693f'];
const WALLS = [['#b5653f', '#9a5334'], ['#c0714a', '#a35d3b'], ['#a85a38', '#8d4a2d'], ['#cfc8b8', '#b0a999'], ['#d9d2c2', '#bab3a3'], ['#b9b4a8', '#9c978b'], ['#a9bccd', '#8ba0b3'], ['#c7d0d8', '#a7b1ba']];
const TALL = [[6.2505, -75.5686, 80], [6.2086, -75.5695, 70], [6.2405, -75.5745, 45], [6.1715, -75.5860, 30], [6.1725, -75.6110, 30], [6.3370, -75.5580, 30]];
const SOMBRA = new Map(), sombra18 = col => SOMBRA.get(col) || (SOMBRA.set(col, shade(col, -.18)), SOMBRA.get(col));   // tono oscuro de cada color de árbol, calculado una vez
const mixHex = (a, b, f) => { const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)], A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
Object.assign(CityMap, {
  chunks2: new Map(), lotC: new Map(),
  hasG(cx, cy) { return GFX() === 'pixel' ? this.chunks.has(cx + ',' + cy) : this.chunks2.has(cx + ',' + cy + ':' + this.cq()); },
  cq() { return clamp(Math.round((View.s || 2) * (View.dpr || 1) / 2.4), 2, 3); },
  chunkG(cx, cy) {
    if (GFX() === 'pixel') return this.chunk(cx, cy);
    const q = this.cq(), k = cx + ',' + cy + ':' + q; let c = this.chunks2.get(k);
    if (c) { this.chunks2.delete(k); this.chunks2.set(k, c); return c; }
    c = Art.mk(CH * TS * q, CH * TS * q, x => this.drawGround3(x, cx, cy, q));
    this.chunks2.set(k, c); if (this.chunks2.size > (navigator.deviceMemory && navigator.deviceMemory <= 2 ? 10 : 14)) this.chunks2.delete(this.chunks2.keys().next().value);
    return c;
  },
  /* ---------- CIUDAD SUAVE: nada de casillas a la vista ----------
     - El suelo de cada trozo sale de máscaras suavizadas (pasto, monte, plaza, parqueadero, manzanas, agua): bordes curvos y esquinas redondas.
     - Andén y sardinel siguen cada calle; las esquinas quedan redondas.
     - Casas y edificios en lotes a lo largo de cada calle, girados con ella (también en las curvas), en hasta 3 filas hacia adentro de la manzana.
       Los lotes se numeran desde el inicio de la calle y se descartan los que pisan a otro de mayor prioridad: cada trozo llega al mismo resultado. */
  chCum(ch) { if (ch.cum) return ch.cum; const p = ch.p, n = p.length >> 1, c = new Float32Array(n); for (let i = 1; i < n; i++) c[i] = c[i - 1] + Math.hypot(p[i * 2] - p[i * 2 - 2], p[i * 2 + 1] - p[i * 2 - 1]); return (ch.cum = c); },
  chPt(ch, s) {
    const p = ch.p, c = this.chCum(ch), n = c.length; s = clamp(s, 0, c[n - 1]); let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
    const L = c[hi] - c[lo] || 1, t = (s - c[lo]) / L; return { x: p[lo * 2] + (p[hi * 2] - p[lo * 2]) * t, y: p[lo * 2 + 1] + (p[hi * 2 + 1] - p[lo * 2 + 1]) * t };
  },
  /* contorno suavizado de una clase de casilla en el trozo, como trazo vectorial (nítido a cualquier zoom, sin costuras):
     rejilla con 2 casillas de margen → suavizado [1 2 1] → rejilla a media casilla (bilineal) → marching squares, todo en una sola ruta */
  contorno(c, x0, y0, test, thr) {
    const M = 2, N = CH + 2 * M, g = this._mg || (this._mg = new Float32Array(N * N)), h = this._mh || (this._mh = new Float32Array(N * N));
    let any = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const v = test(this.get(x0 - M + i, y0 - M + j), x0 - M + i, y0 - M + j) ? 1 : 0; g[j * N + i] = v; any += v; }
    if (!any) return false;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) h[j * N + i] = (g[j * N + Math.max(0, i - 1)] + 2 * g[j * N + i] + g[j * N + Math.min(N - 1, i + 1)]) / 4;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) g[j * N + i] = (h[Math.max(0, j - 1) * N + i] + 2 * h[j * N + i] + h[Math.min(N - 1, j + 1) * N + i]) / 4;
    const N2 = N * 2 - 1, u = this._mu || (this._mu = new Float32Array(N2 * N2));
    for (let J = 0; J < N2; J++) for (let I = 0; I < N2; I++) { const i = I >> 1, j = J >> 1, fx = (I & 1) * .5, fy = (J & 1) * .5, i1 = Math.min(N - 1, i + 1), j1 = Math.min(N - 1, j + 1); u[J * N2 + I] = (g[j * N + i] * (1 - fx) + g[j * N + i1] * fx) * (1 - fy) + (g[j1 * N + i] * (1 - fx) + g[j1 * N + i1] * fx) * fy; }
    const T = thr || .5, ox = (x0 - M + .5) * TS, oy = (y0 - M + .5) * TS, k = TS / 2, cs = [0, 0, 0, 0];
    c.beginPath(); let run = -1;
    const tira = (J, I0, I1) => { const X0 = ox + I0 * k, X1 = ox + I1 * k, Y0 = oy + J * k, Y1 = Y0 + k; c.moveTo(X0, Y0); c.lineTo(X1, Y0); c.lineTo(X1, Y1); c.lineTo(X0, Y1); c.closePath(); };   // celdas llenas seguidas: un rectángulo (menos trazos, mismo dibujo)
    for (let J = 0; J < N2 - 1; J++, run = -1) for (let I = 0; I < N2 - 1; I++) {
      const a = u[J * N2 + I], b = u[J * N2 + I + 1], d = u[(J + 1) * N2 + I], e = u[(J + 1) * N2 + I + 1], lleno = a >= T && b >= T && d >= T && e >= T;
      if (lleno) { if (run < 0) run = I; if (I === N2 - 2) { tira(J, run, I + 1); run = -1; } continue; }
      if (run >= 0) { tira(J, run, I); run = -1; }
      if (a < T && b < T && d < T && e < T) continue;
      cs[0] = a; cs[1] = b; cs[2] = e; cs[3] = d; let first = true;
      for (let q = 0; q < 4; q++) {
        const v1 = cs[q], v2 = cs[(q + 1) & 3], x1 = q === 1 || q === 2 ? 1 : 0, y1 = q >= 2 ? 1 : 0, x2 = q === 0 || q === 1 ? 1 : 0, y2 = q === 1 || q === 2 ? 1 : 0;
        if (v1 >= T) { const X = ox + (I + x1) * k, Y = oy + (J + y1) * k; if (first) { c.moveTo(X, Y); first = false; } else c.lineTo(X, Y); }
        if ((v1 >= T) !== (v2 >= T)) { const t = (T - v1) / (v2 - v1), X = ox + (I + x1 + (x2 - x1) * t) * k, Y = oy + (J + y1 + (y2 - y1) * t) * k; if (first) { c.moveTo(X, Y); first = false; } else c.lineTo(X, Y); }
      }
      c.closePath();
    }
    return true;
  },
  /* lotes del trozo: { all: los que tocan el trozo (para el suelo), ed: los edificios con centro en el trozo (para el volumen) } */
  lotes(cx, cy) {
    const key = cx + ',' + cy, C0 = this.lotC; let R = C0.get(key); if (R) { C0.delete(key); C0.set(key, R); return R; }
    if (!this.tallT) this.tallT = TALL.map(([la, lo, r]) => { const g = geoT(la, lo); return [g.x, g.y, r * MS]; });
    const S = CH * TS, X0 = cx * S, Y0 = cy * S, MG = 120, RANK = { 2: 0, 4: 1, 1: 2, 6: 3, 7: 4, 8: 5 };
    const ok = v => v === TT.BRICK || v === TT.BLDG, atras = v => v === TT.BRICK || v === TT.BLDG || v === TT.GRASS || v === TT.WALK || v === TT.PLAZA, frente = v => !(v === TT.WATER || v === TT.CANAL || v === TT.AUTO || v === TT.STATION || v === TT.LAND || v === TT.BRIDGE || v === TT.DEPOT);   // el frente del lote puede tocar la casilla de la calle (que incluye el andén)
    const T = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return this.lid.has(this.idx(tx, ty)) ? TT.LAND : this.get(tx, ty); };
    const cand = [];
    for (const ch of this.chainsNear(X0 - MG, Y0 - MG, S + 2 * MG, S + 2 * MG)) {
      const rk = RANK[ch.k]; if (rk == null || ch.p.length < 4) continue;
      const cum = this.chCum(ch), len = cum[cum.length - 1], p = ch.p; if (len < 14) continue;
      let sa = 1e9, sb = -1; for (let i = 0; i < cum.length; i++) { const x = p[i * 2], y = p[i * 2 + 1]; if (x > X0 - MG && x < X0 + S + MG && y > Y0 - MG && y < Y0 + S + MG) { sa = Math.min(sa, cum[Math.max(0, i - 1)]); sb = Math.max(sb, cum[Math.min(cum.length - 1, i + 1)]); } }
      if (sb < 0) continue;
      const lt = this.lt ? this.lt[clamp(Math.floor(p[1] / TS / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(p[0] / TS / 8), 0, VM.mW - 1)] * 4 : 0;
      const W = clamp(Math.sqrt((lt || 110) / 2) * TS / VM.tile, 9, 17), base = ch.w / 2 + SWK[ch.k] + 1;   // frente del lote según los lotes catastrales de la zona
      for (const sd of [-1, 1]) {
        const s0 = 2 + h2(ch.id, sd + 2, 31) * W;
        for (let i = Math.max(0, Math.floor((sa - s0) / W) - 1), iN = Math.ceil((sb - s0) / W) + 1; i <= iN; i++) {
          const s = s0 + i * W; if (s < 2 || s + W > len - 2) continue;
          const a = this.chPt(ch, s), b = this.chPt(ch, s + W), m = this.chPt(ch, s + W / 2); let ux = b.x - a.x, uy = b.y - a.y; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
          const nx = -uy * sd, ny = ux * sd; let off = base;
          for (let r = 0; r < 3; r++) {
            const v = T(m.x + nx * (off + 6), m.y + ny * (off + 6)); if (!ok(v)) break;
            const B = v === TT.BLDG, d = B ? 22 : 13, cxl = m.x + nx * (off + d / 2), cyl = m.y + ny * (off + d / 2), hw = W / 2 - .35, hd = d / 2 - .35;
            if (!ok(T(cxl, cyl))) break; let bad = 0; for (const [p1, p2] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const v2 = T(cxl + ux * hw * p1 + nx * hd * p2, cyl + uy * hw * p1 + ny * hd * p2); if (p2 < 0 ? !frente(v2) : !atras(v2)) bad++; }
            if (bad) break;
            cand.push({ x: cxl, y: cyl, ux, uy, nx, ny, w: W - .7, d: d - .7, B, r, rk, id: ch.id, sd, i, pr: [r, rk, ch.id, sd, i] });
            off += d + 1.3;
          }
        }
      }
    }
    // dos lotes vecinos de edificio se vuelven un solo edificio (parejas fijas: 0-1, 2-3…)
    const byK = new Map(); for (const q of cand) byK.set(q.id + ':' + q.sd + ':' + q.r + ':' + q.i, q);
    for (const q of cand) {
      if (!q.B || q.dead || (q.i & 1)) continue; const o = byK.get(q.id + ':' + q.sd + ':' + q.r + ':' + (q.i + 1)); if (!o || !o.B || h2(q.id, q.i, 41) > .72) continue;
      let ux = o.x - q.x, uy = o.y - q.y; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul; q.x = (q.x + o.x) / 2; q.y = (q.y + o.y) / 2; q.ux = ux; q.uy = uy; q.nx = -uy * q.sd; q.ny = ux * q.sd; q.w = q.w + o.w + .7; q.d = Math.max(q.d, o.d); o.dead = true;
    }
    // sin traslapes: un lote se descarta si pisa a otro de mayor prioridad (fila, tipo de calle, calle, lado, número)
    const live = cand.filter(q => !q.dead).sort((a, b) => { for (let k = 0; k < 5; k++) if (a.pr[k] !== b.pr[k]) return a.pr[k] - b.pr[k]; return 0; });
    const G = new Map(), CE = 32, KX = 65536;   // celdas de 32 px con clave numérica (rápido en celulares)
    const proy = (Q, ax, ay) => Math.abs(Q.w / 2 * (Q.ux * ax + Q.uy * ay)) + Math.abs(Q.d / 2 * (Q.nx * ax + Q.ny * ay)), sep = (A, B, ax, ay) => Math.abs((B.x - A.x) * ax + (B.y - A.y) * ay) >= proy(A, ax, ay) + proy(B, ax, ay) - .8;
    const cruza = (A, B) => { const dx = B.x - A.x, dy = B.y - A.y, rr = (A.w + A.d + B.w + B.d) / 2; if (dx * dx + dy * dy > rr * rr) return false; return !(sep(A, B, A.ux, A.uy) || sep(A, B, A.nx, A.ny) || sep(A, B, B.ux, B.uy) || sep(A, B, B.nx, B.ny)); };   // ejes separadores (SAT), sin crear arreglos
    // corredores del metro, del tranvía y del Metroplús: ningún lote los pisa (el viaducto y los rieles van sobre la calle)
    const TR = this._trG || (this._trG = (() => { const G2 = new Map(), C = 64, add = (L, r) => { const P = L.pts; for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], sg = [a.x, a.y, b.x, b.y, r]; for (let gy = Math.floor((Math.min(a.y, b.y) - 24) / C); gy <= Math.floor((Math.max(a.y, b.y) + 24) / C); gy++) for (let gx = Math.floor((Math.min(a.x, b.x) - 24) / C); gx <= Math.floor((Math.max(a.x, b.x) + 24) / C); gx++) { const k = gx * 65536 + gy; (G2.get(k) || G2.set(k, []).get(k)).push(sg); } } }; add(this.lineA, 9); add(this.lineB, 9); add(this.tram, 7); for (const m of this.mp || []) add(m, 5); return G2; })());
    const choca = q => { const L = TR.get(Math.floor(q.x / 64) * KX + Math.floor(q.y / 64)); if (!L) return false; const R = Math.hypot(q.w, q.d) / 2 * .8; for (const sg of L) { const ax = sg[0], ay = sg[1], dx = sg[2] - ax, dy = sg[3] - ay, t = clamp(((q.x - ax) * dx + (q.y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1); if (Math.hypot(ax + dx * t - q.x, ay + dy * t - q.y) < R + sg[4]) return true; } return false; };
    const all = [], ed = [];
    for (const q of live) {
      if (choca(q)) continue; const rq = (q.w + q.d) / 2 + 1, gx0 = Math.floor((q.x - rq) / CE), gx1 = Math.floor((q.x + rq) / CE), gy0 = Math.floor((q.y - rq) / CE), gy1 = Math.floor((q.y + rq) / CE); let hit = false;
      for (let gy = gy0; gy <= gy1 && !hit; gy++) for (let gx = gx0; gx <= gx1 && !hit; gx++) { const L = G.get(gx * KX + gy); if (L) for (const o of L) if (cruza(q, o)) { hit = true; break; } }
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const k = gx * KX + gy, L = G.get(k); if (L) L.push(q); else G.set(k, [q]); }
      if (hit) continue;
      const hw = q.w / 2 - (q.B ? .9 : 0), hd = q.d / 2 - (q.B ? .9 : 0);
      q.pts = [q.x - q.ux * hw - q.nx * hd, q.y - q.uy * hw - q.ny * hd, q.x + q.ux * hw - q.nx * hd, q.y + q.uy * hw - q.ny * hd, q.x + q.ux * hw + q.nx * hd, q.y + q.uy * hw + q.ny * hd, q.x - q.ux * hw + q.nx * hd, q.y - q.uy * hw + q.ny * hd];
      let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (let k = 0; k < 8; k += 2) { bx0 = Math.min(bx0, q.pts[k]); bx1 = Math.max(bx1, q.pts[k]); by0 = Math.min(by0, q.pts[k + 1]); by1 = Math.max(by1, q.pts[k + 1]); }
      q.k = h2(q.id * 7 + q.sd + 3, q.i * 3 + q.r, 43);
      if (q.B) {
        const tx = q.x / TS, ty = q.y / TS, fl = this.hg ? this.hg[clamp(Math.floor(ty / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(tx / 8), 0, VM.mW - 1)] : 0, r = q.k;
        let boost = 0; for (const [ax, ay, rad] of this.tallT) boost = Math.max(boost, clamp(1.5 - Math.hypot(tx - ax, ty - ay) / rad, 0, 1));
        q.z = fl ? clamp(.05 + Math.max(2, fl * (.55 + .45 * r)) * .03, .1, 1.15) : .13 + .26 * r + .6 * r * r * boost;
        const wi = q.z > .62 ? 6 + ((r * 7) | 0) % 2 : ((r * 97) | 0) % 6; q.roof = ROOF[((r * 31) | 0) % ROOF.length]; q.wa = WALLS[wi][0]; q.wb = WALLS[wi][1]; q.pal = [];
        if (q.x >= X0 && q.x < X0 + S && q.y >= Y0 && q.y < Y0 + S) ed.push(q);
      }
      if (bx1 > X0 - 2 && bx0 < X0 + S + 2 && by1 > Y0 - 2 && by0 < Y0 + S + 2) all.push(q);
    }
    // casas del interior de la manzana: en cada casilla de ladrillo que no cubre un lote, una casa girada con la calle más cercana
    const dentro = (x, y) => { for (const o of G.get(Math.floor(x / CE) * KX + Math.floor(y / CE)) || []) { if (o.pts === undefined) continue; const dx = x - o.x, dy = y - o.y; if (Math.abs(dx * o.ux + dy * o.uy) < o.w / 2 + 2 && Math.abs(dx * o.nx + dy * o.ny) < o.d / 2 + 2) return true; } return false; };
    const tx0 = cx * CH - 1, ty0 = cy * CH - 1, SG = new Map(), SC = 32;   // tramos de calle por celda de 32 px: cada casa del interior toma la dirección de la calle más cercana (a menos de 48 px)
    for (const ch of this.chainsNear(X0 - 48, Y0 - 48, S + 96, S + 96)) { if (RANK[ch.k] == null) continue; const p = ch.p;
      for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], bx = p[i], by = p[i + 1]; if ((bx - ax) * (bx - ax) + (by - ay) * (by - ay) < .01) continue;
        const x0 = Math.max(Math.min(ax, bx), X0 - 96), x1 = Math.min(Math.max(ax, bx), X0 + S + 96), y0 = Math.max(Math.min(ay, by), Y0 - 96), y1 = Math.min(Math.max(ay, by), Y0 + S + 96); if (x0 > x1 || y0 > y1) continue;
        const sg = [ax, ay, bx, by]; for (let gy = Math.floor(y0 / SC); gy <= Math.floor(y1 / SC); gy++) for (let gx = Math.floor(x0 / SC); gx <= Math.floor(x1 / SC); gx++) { const k = gx * KX + gy, L = SG.get(k); if (L) L.push(sg); else SG.set(k, [sg]); } } }
    const rumbo = (x, y) => { let bd = 48, ux = 1, uy = 0; for (let gy = Math.floor((y - 48) / SC); gy <= Math.floor((y + 48) / SC); gy++) for (let gx = Math.floor((x - 48) / SC); gx <= Math.floor((x + 48) / SC); gx++) { const L = SG.get(gx * KX + gy); if (L) for (const sg of L) { const ax = sg[0], ay = sg[1], dx = sg[2] - ax, dy = sg[3] - ay, L2 = dx * dx + dy * dy, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (d < bd) { bd = d; const l = Math.sqrt(L2); ux = dx / l; uy = dy / l; } } } return [ux, uy]; };
    for (let ty = ty0; ty <= ty0 + CH + 1; ty++) for (let tx = tx0; tx <= tx0 + CH + 1; tx++) {
      if (this.get(tx, ty) !== TT.BRICK || this.lid.has(this.idx(tx, ty)) || h2(tx, ty, 51) < .08) continue;
      const x = (tx + .5) * TS + (h2(tx, ty, 52) - .5) * 3, y = (ty + .5) * TS + (h2(tx, ty, 53) - .5) * 3; if (dentro(x, y) || choca({ x, y, w: 12, d: 12 })) continue;
      const [ux, uy] = rumbo(x, y);
      const q = { x, y, ux, uy, nx: -uy, ny: ux, w: 11 + h2(tx, ty, 54) * 2, d: 11 + h2(tx, ty, 55) * 2, B: false, int: true, id: tx, i: ty, r: 9, sd: 1 }, hw = q.w / 2, hd = q.d / 2;
      q.pts = [x - ux * hw + uy * hd, y - uy * hw - ux * hd, x + ux * hw + uy * hd, y + uy * hw - ux * hd, x + ux * hw - uy * hd, y + uy * hw + ux * hd, x - ux * hw - uy * hd, y - uy * hw + ux * hd];
      q.k = h2(tx, ty, 56); all.push(q);
    }
    // volumen y colores de cada casa (1 a 3 pisos)
    const casas = [];
    for (const q of all) { if (q.B) continue; const r = q.k; q.z = .045 + ((h2(q.id, q.i, 57) * 3) | 0) * .025; q.roof = r < .55 ? TEJA[(r * 9 | 0) % TEJA.length] : r < .88 ? LOSA[(r * 13 | 0) % LOSA.length] : PINTA[(r * 17 | 0) % PINTA.length]; const wi = r < .6 ? (r * 31 | 0) % 3 : 3 + (r * 37 | 0) % 3; q.wa = WALLS[wi][0]; q.wb = WALLS[wi][1]; if (q.x >= X0 && q.x < X0 + S && q.y >= Y0 && q.y < Y0 + S) casas.push(q); }
    // lugares emblemáticos: sus cuerpos con volumen (edificios) y sus casas de ladera (Comuna 13, Santo Domingo, Pueblito Paisa)
    for (const P of this.lmPartes()) { if (P.x1 < X0 || P.x0 > X0 + S || P.y1 < Y0 || P.y0 > Y0 + S) continue; for (const q of P.ed) { all.push(q); if (q.x >= X0 && q.x < X0 + S && q.y >= Y0 && q.y < Y0 + S) ed.push(q); } for (const q of P.casas) all.push(q); }
    R = { all, ed, casas }; C0.set(key, R); if (C0.size > 64) C0.delete(C0.keys().next().value);
    return R;
  },
  drawGround3(c, cx, cy, q) {
    const x0 = cx * CH, y0 = cy * CH, px0 = x0 * TS, py0 = y0 * TS, S = CH * TS, g = (x, y) => this.get(x, y);
    c.setTransform(q, 0, 0, q, -px0 * q, -py0 * q); c.lineCap = 'round'; c.lineJoin = 'round';
    // 1) suelo: piso de ciudad y capas suavizadas encima (sin casillas a la vista)
    c.fillStyle = '#cfc9bc'; c.fillRect(px0, py0, S, S);
    const cov = this.cov, pk = (x, y) => { const v = g(x, y); return (v === TT.ROAD || v === TT.AVE || v === TT.AUTO) && cov && x >= 0 && y >= 0 && x < MW && y < MH && !cov[y * MW + x]; };
    const capa = (test, col, thr) => { if (this.contorno(c, x0, y0, test, thr)) { c.fillStyle = col; c.fill(); } };
    capa(v => v === TT.MOUNT, '#3f7a3c');
    capa(v => v === TT.GRASS || v === TT.CANAL || v === TT.LAND, '#69a84e');
    capa(v => v === TT.PLAZA, '#ddd3bd');
    capa((v, x, y) => { if (!pk(x, y)) return false; let n = 0; for (const [dx, dy] of N8) if (pk(x + dx, y + dy)) n++; return n >= 5; }, '#8e929a');
    capa(v => v === TT.BRICK, '#a99f91');
    capa(v => v === TT.BLDG, '#9fa2a7');
    capa(v => v === TT.WATER, '#87a872', .3);
    capa(v => v === TT.WATER, '#3f86c8');
    // textura del pasto y del monte: puntos, no cuadros
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) { const v = g(x, y); if (v !== TT.GRASS && v !== TT.MOUNT) continue; c.fillStyle = v === TT.MOUNT ? '#356d34' : '#78b65c'; c.beginPath(); for (let k = 0; k < 3; k++) { const X = x * TS + 2 + h2(x, y, 30 + k) * 12, Y = y * TS + 2 + h2(x, y, 40 + k) * 12; c.moveTo(X + .9, Y); c.arc(X, Y, .9, 0, TAU); } c.fill(); }
    // relieve suave (luz del noroeste)
    const RS = CH + 3, rc = Art.mk(RS, RS, r => { const im = r.createImageData(RS, RS), D = im.data; for (let j = 0; j < RS; j++) for (let i = 0; i < RS; i++) { const tx = x0 - 1 + i, ty = y0 - 1 + j, gx = (this.elevT(tx + .5, ty) - this.elevT(tx - .5, ty)) / VM.tile, gy = (this.elevT(tx, ty + .5) - this.elevT(tx, ty - .5)) / VM.tile, f = clamp((gx + gy) * 1.1, -.3, .25), o = (j * RS + i) * 4; if (f > 0) { D[o] = 255; D[o + 1] = 250; D[o + 2] = 230; D[o + 3] = f * 127.5; } else { D[o] = 10; D[o + 1] = 20; D[o + 2] = 40; D[o + 3] = -f * 153; } } r.putImageData(im, 0, 0); });
    c.imageSmoothingEnabled = true; c.drawImage(rc, 0, 0, RS, RS, px0 - TS * 1.5, py0 - TS * 1.5, RS * TS, RS * TS);   // una muestra por casilla: el relieve es suave (datos de 80 m) y el suavizado lo estira
    const CHS = this.chainsNear(px0 - 2 * TS, py0 - 2 * TS, S + 4 * TS, S + 4 * TS);
    const run = (f, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); for (const ch of CHS) { if (!f(ch.k)) continue; const p = ch.p; c.moveTo(p[0], p[1]); if (p.length === 2) c.lineTo(p[0] + .01, p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); } c.stroke(); c.setLineDash([]); };
    // lugares emblemáticos: su suelo vectorial (prados, caminos, agua, canchas, el estadio, los cerros), bajo las calles que los cruzan
    const LMV = []; LANDMARKS.forEach((L, i) => { if (!(L.x + L.w < x0 - 3 || L.x > x0 + CH + 3 || L.y + L.h < y0 - 3 || L.y > y0 + CH + 3)) LMV.push(i); });
    for (const i of LMV) this.lugar3(c, LANDMARKS[i], i, 0);
    // 2) quebradas: un hilo de agua por su trazo real, dentro de su retiro verde
    run(k => k === 9, 7.5, 'rgba(105,168,78,.9)'); run(k => k === 9, 3.4, '#6f9a7c'); run(k => k === 9, 2.2, '#4f9bd4');
    // 3) andenes con sardinel a lo largo de cada calle (y peatonales, escalas y senderos)
    const RD = k => k > 0 && k < 5, GW = new Map(); for (const ch of CHS) if (RD(ch.k)) { const key = ch.k * 1e4 + Math.round(ch.w * 10); (GW.get(key) || GW.set(key, []).get(key)).push(ch); }
    const KO = { 1: 0, 4: 1, 2: 2, 3: 3 }, GK = [...GW.keys()].sort((a, b) => KO[(a / 1e4) | 0] - KO[(b / 1e4) | 0] || a - b), ASF = { 1: '#565a62', 4: '#565a62', 2: '#50545c', 3: '#4a4e56' };
    const runL = (L, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); for (const ch of L) { const p = ch.p; c.moveTo(p[0], p[1]); if (p.length === 2) c.lineTo(p[0] + .01, p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); } c.stroke(); c.setLineDash([]); };
    for (const key of GK) { const k = (key / 1e4) | 0; if (k !== 3) runL(GW.get(key), (key % 1e4) / 10 + 2 * SWK[k] + 1.4, '#9d978b'); }
    for (const key of GK) { const k = (key / 1e4) | 0; if (k !== 3) runL(GW.get(key), (key % 1e4) / 10 + 2 * SWK[k], '#dcd7cc'); else runL(GW.get(key), (key % 1e4) / 10 + 3, '#8fae74'); }
    run(q => q === 6, (CHW[6] + .14) * TS, '#b3ab98'); run(q => q === 6, CHW[6] * TS, '#e6dfcd');
    run(q => q === 7, CHW[7] * TS, '#cbc1ab'); run(q => q === 7, CHW[7] * TS * .9, '#a99d84', [.8, 1.5]);
    run(q => q === 8, CHW[8] * TS, '#d6c9a8', [3, 2.5]);
    // 4) calles: cada una con su ancho, bordes, separadores y líneas
    for (const key of GK) runL(GW.get(key), (key % 1e4) / 10 + 1, '#7d796f');
    for (const key of GK) runL(GW.get(key), (key % 1e4) / 10, ASF[(key / 1e4) | 0]);
    for (const key of GK) { const k = (key / 1e4) | 0, w = (key % 1e4) / 10, L = GW.get(key); if (k < 2 || k > 3) continue; runL(L, w - .14 * TS, k === 3 ? '#e8c64a' : '#d9d6cc'); runL(L, w - .22 * TS, ASF[k]); if (k === 2 && w >= 1.7 * TS) { runL(L, .22 * TS, '#cfcabf'); runL(L, .13 * TS, '#5f9e46'); } }
    for (const key of GK) { const k = (key / 1e4) | 0, w = (key % 1e4) / 10, L = GW.get(key); if (k === 1) runL(L, .7, '#e6e4dc', [5, 7]); else if (k === 4) runL(L, .75, '#eceae2', [6, 6]); else if (k === 2 && w < 1.7 * TS) runL(L, .8, '#e8c64a', [8, 6]); else if (k === 3) runL(L, .8, '#f2f0e8', [9, 6]); }
    for (const ch of CHS) { if (!RD(ch.k)) continue; const p = ch.p, w = ch.w / 2 - .5; c.fillStyle = ASF[ch.k]; if (ch.j0) { c.beginPath(); c.arc(p[0], p[1], w, 0, TAU); c.fill(); } if (ch.j1) { c.beginPath(); c.arc(p[p.length - 2], p[p.length - 1], w, 0, TAU); c.fill(); } }
    // cebras en los cruces con semáforo
    c.strokeStyle = '#eceae2'; c.lineWidth = 1.6; c.lineCap = 'butt'; c.beginPath();
    for (const z of this.zebras(px0 - 40, py0 - 40, S + 80, S + 80)) { const nx = -z.uy, ny = z.ux; for (let k = -z.hw + 1.5; k <= z.hw - 1.5; k += 3) { const x = z.x + nx * k, y = z.y + ny * k; c.moveTo(x - z.ux * 3, y - z.uy * 3); c.lineTo(x + z.ux * 3, y + z.uy * 3); } }
    c.stroke(); c.lineCap = 'round';
    // ciclorrutas: carril verde con bordes y bicis pintadas
    run(q => q === 5, .52 * TS, '#e9e6dc'); run(q => q === 5, .42 * TS, '#2e9d55'); run(q => q === 5, .55, '#d8f0c8', [3, 4]);
    for (const ch of CHS) { if (ch.k !== 5) continue; const len = chainLen(ch.p); for (let s = 20 + h2(ch.p[0] | 0, ch.p[1] | 0, 12) * 40; s < len - 8; s += 70) { const a = this.chPt(ch, s), b = this.chPt(ch, s + 2); if (a.x < px0 - 4 || a.y < py0 - 4 || a.x > px0 + S + 4 || a.y > py0 + S + 4) continue; const an = Math.atan2(b.y - a.y, b.x - a.x); c.save(); c.translate(a.x, a.y); c.rotate(an); c.strokeStyle = '#e6f5da'; c.lineWidth = .6; c.beginPath(); c.arc(-1.6, 0, 1.2, 0, TAU); c.moveTo(2.8, 0); c.arc(1.6, 0, 1.2, 0, TAU); c.stroke(); c.restore(); } }
    // 5) lotes: sombras, casas con su techo y base de los edificios (el volumen de los edificios va en draw3D)
    const LT = this.lotes(cx, cy), poly = (P, dx, dy) => { c.moveTo(P[0] + dx, P[1] + dy); c.lineTo(P[2] + dx, P[3] + dy); c.lineTo(P[4] + dx, P[5] + dy); c.lineTo(P[6] + dx, P[7] + dy); c.closePath(); };
    c.fillStyle = 'rgba(8,14,30,.24)'; c.beginPath(); for (const L of LT.all) if (!L.B) poly(L.pts, 1.2, 1.5); c.fill();
    c.fillStyle = 'rgba(8,14,30,.26)'; for (const L of LT.all) if (L.B) { const d = 3 + L.z * 13, H = hull8(L.pts, d); c.beginPath(); c.moveTo(H[0], H[1]); for (let k = 2; k < H.length; k += 2) c.lineTo(H[k], H[k + 1]); c.closePath(); c.fill(); }
    c.fillStyle = '#8f9399'; c.beginPath(); for (const L of LT.all) if (L.B) poly(L.pts, 0, 0); c.fill();   // base de los edificios (su volumen va en draw3D)
    // casas con volumen: techo levantado según sus pisos y fachadas hacia el sur (la cámara inclinada de las ciudades de arcade); por color, en pocos trazos
    const muros = new Map(), techos = new Map(), ruta = (m, h) => m.get(h) || m.set(h, new Path2D()).get(h), cumbre = new Path2D(), tanques = new Path2D(), ropa = [];
    for (const L of LT.all) {
      if (L.B) continue; const P = L.pts, hz = 1.4 + L.z * 18, mx = L.x, my = L.y;
      for (let i = 0; i < 4; i++) { const j = (i + 1) & 3, ex = (P[i * 2] + P[j * 2]) / 2, ey = (P[i * 2 + 1] + P[j * 2 + 1]) / 2, ny = ey - my, nx = ex - mx; if (ny <= .05 * Math.abs(nx)) continue; const w = ruta(muros, Math.abs(nx) > Math.abs(ny) ? L.wb : L.wa); w.moveTo(P[i * 2], P[i * 2 + 1]); w.lineTo(P[j * 2], P[j * 2 + 1]); w.lineTo(P[j * 2], P[j * 2 + 1] - hz); w.lineTo(P[i * 2], P[i * 2 + 1] - hz); w.closePath(); }
      const t = ruta(techos, L.roof); t.moveTo(P[0], P[1] - hz); t.lineTo(P[2], P[3] - hz); t.lineTo(P[4], P[5] - hz); t.lineTo(P[6], P[7] - hz); t.closePath();
      if (L.k < .55) { cumbre.moveTo((P[0] + P[6]) / 2, (P[1] + P[7]) / 2 - hz); cumbre.lineTo((P[2] + P[4]) / 2, (P[3] + P[5]) / 2 - hz); }
      else if (L.k < .7) { const X = P[0] + (P[4] - P[0]) * .7, Y = P[1] + (P[5] - P[1]) * .35 - hz; tanques.moveTo(X + 1.4, Y); tanques.arc(X, Y, 1.4, 0, TAU); }
      else if (L.k > .93) ropa.push([L, hz]);
    }
    for (const [h, w] of muros) { c.fillStyle = h; c.fill(w); }
    for (const [h, t] of techos) { c.fillStyle = h; c.fill(t); }
    c.strokeStyle = 'rgba(20,16,12,.22)'; c.lineWidth = .7; c.stroke(cumbre); c.fillStyle = '#1e2126'; c.fill(tanques);
    for (const [L, hz] of ropa) for (let j = -1; j <= 1; j += 2) { const X = L.x + L.ux * j * L.w * .2 + L.nx * L.d * .15, Y = L.y + L.uy * j * L.w * .2 + L.ny * L.d * .15 - hz; c.fillStyle = ROPA[((L.k * 61 | 0) + j + 2) % ROPA.length]; c.fillRect(X - .7, Y - .7, 1.4, 1.5); }
    // nombres de las calles: sobre la calzada y en el sentido de la vía, cada ~550 m (como en los mapas)
    const NOM = VM.calles || []; c.font = '700 6.4px Cuerpo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const ch of CHS) {
      if (!ch.n || !(ch.k <= 4 || ch.k === 6)) continue; const nm = NOM[ch.n - 1]; if (!nm) continue;
      const tw = c.measureText(nm).width + 6, p = ch.p, tot = chainLen(p), gap = 880; let d = tot < gap ? tot / 2 : 300, s0 = 0;
      for (let i = 2; i < p.length && d < tot; i += 2) {
        const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, L = Math.hypot(dx, dy);
        for (; d < s0 + L; d += gap) {
          const t = d - s0; if (t < tw / 2 || L - t < tw / 2) continue; const X = ax + dx * t / L, Y = ay + dy * t / L;
          if (X - tw / 2 < px0 || X + tw / 2 > px0 + S || Y - tw / 2 < py0 || Y + tw / 2 > py0 + S) continue;
          let a = Math.atan2(dy, dx); if (a > Math.PI / 2 || a < -Math.PI / 2) a += Math.PI;
          c.save(); c.translate(X, Y); c.rotate(a); c.lineWidth = 1.8; c.lineJoin = 'round'; c.strokeStyle = 'rgba(28,32,40,.9)'; c.strokeText(nm, 0, 0); c.fillStyle = '#f2efe6'; c.fillText(nm, 0, 0); c.restore();
        }
        s0 += L;
      }
    }
    // parques y plazas con su nombre
    if (VM.parques) { if (!this._pq) { this._pq = new Map(); for (const [n, a, b, k] of VM.parques) { const x = a / 4 * TS, y = b / 4 * TS, key = Math.floor(x / S) + ',' + Math.floor(y / S); (this._pq.get(key) || this._pq.set(key, []).get(key)).push([n, x, y, k]); } }
      c.font = 'italic 700 6.6px Cuerpo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const [n, x, y, k] of this._pq.get(cx + ',' + cy) || []) { const tw = c.measureText(n).width; if (x - tw / 2 < px0 + 2 || x + tw / 2 > px0 + S - 2) continue; c.lineWidth = 2; c.strokeStyle = 'rgba(246,244,236,.92)'; c.strokeText(n, x, y); c.fillStyle = k === 2 ? '#6b5326' : '#2f6b2a'; c.fillText(n, x, y); } }
    // 6) mobiliario: postes de luz en el andén; en las avenidas, árboles (algunos guayacanes). No en las esquinas.
    for (const ch of CHS) {
      if (!(ch.k >= 1 && ch.k <= 4) || ch.k === 3) continue; const len = chainLen(ch.p), hw = ch.w / 2 + SWK[ch.k] * .55, step = ch.k === 2 ? 24 : 38; let j = 0;
      for (let s = 12 + h2(ch.p[0] | 0, ch.p[1] | 0, 70) * step; s < len - 12; s += step, j++) {
        const a = this.chPt(ch, s), b = this.chPt(ch, s + 2), L = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, sd = j % 2 ? 1 : -1, X = a.x - uy * hw * sd, Y = a.y + ux * hw * sd;
        if (X < px0 - 6 || Y < py0 - 6 || X > px0 + S + 6 || Y > py0 + S + 6) continue; const v = g(Math.floor(X / TS), Math.floor(Y / TS)); if (v === TT.WATER || v === TT.AUTO || v === TT.BRIDGE || v === TT.STATION) continue;
        if (ch.k === 2 && j % 3) { const k = h2(X | 0, Y | 0, 71), col = k < .14 ? '#f2c230' : k < .22 ? '#e88ab8' : '#3f8a3f', r = 4.4; c.fillStyle = 'rgba(8,14,30,.28)'; c.beginPath(); c.arc(X + 1.6, Y + 1.8, r, 0, TAU); c.fill(); c.fillStyle = shade(col, -.18); c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(X - .7, Y - .7, r * .76, 0, TAU); c.fill(); c.fillStyle = '#ffffff2e'; c.beginPath(); c.arc(X - 1.5, Y - 1.5, r * .36, 0, TAU); c.fill(); }
        else { const lx = X + uy * sd * 3.4, ly = Y - ux * sd * 3.4; c.strokeStyle = 'rgba(8,14,30,.28)'; c.lineWidth = .9; c.beginPath(); c.moveTo(X + 1.4, Y + 1.4); c.lineTo(lx + 1.4, ly + 1.4); c.stroke(); c.strokeStyle = '#2f3540'; c.lineWidth = .7; c.beginPath(); c.moveTo(X, Y); c.lineTo(lx, ly); c.stroke(); c.fillStyle = '#2f3540'; c.beginPath(); c.arc(X, Y, 1.1, 0, TAU); c.fill(); c.fillStyle = '#fff4cf'; c.beginPath(); c.ellipse(lx, ly, 1.3, .8, Math.atan2(uy, ux), 0, TAU); c.fill(); }
      }
    }
    // bancas en las plazas
    c.fillStyle = '#7a5a3a';
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) if (g(x, y) === TT.PLAZA && h2(x, y, 72) < .07 && !this.lid.has(this.idx(x, y))) { const X = x * TS + 4 + h2(x, y, 73) * 6, Y = y * TS + 5 + h2(x, y, 74) * 6; c.fillRect(X, Y, 5, 1.5); c.fillStyle = '#5c4229'; c.fillRect(X, Y + 1.5, 5, .5); c.fillStyle = '#7a5a3a'; }
    // lugares emblemáticos
    for (const i of LMV) this.lugar3(c, LANDMARKS[i], i, 1);   // árboles, esculturas, postes, buses, aviones, la rueda de Chicago, las cruces
    // árboles con sombra (en parques, monte y andenes anchos)
    for (let y = y0 - 1; y <= y0 + CH; y++) for (let x = x0 - 1; x <= x0 + CH; x++) {
      const v = g(x, y), r = h2(x, y, 5); let rad = 0;
      if (v === TT.GRASS && r < .3 && !this.lid.has(this.idx(x, y))) rad = .36 + (r < .1 ? .14 : 0); else if (v === TT.WALK && r < .14) rad = .26; else if (v === TT.MOUNT && r < .6) rad = .42 + r * .3;
      if (!rad) continue; const X = x * TS + TS * (.3 + h2(x, y, 7) * .4), Y = y * TS + TS * (.3 + h2(x, y, 8) * .4), k = h2(x, y, 6), col = k < .05 ? '#f2c230' : k < .09 ? '#e88ab8' : v === TT.MOUNT ? '#2f6a33' : '#3f8a3f', R = rad * TS;
      c.fillStyle = 'rgba(8,14,30,.28)'; c.beginPath(); c.arc(X + R * .35, Y + R * .4, R, 0, TAU); c.fill(); c.fillStyle = sombra18(col); c.beginPath(); c.arc(X, Y, R, 0, TAU); c.fill();
      c.fillStyle = col; c.beginPath(); c.arc(X - R * .15, Y - R * .15, R * .78, 0, TAU); c.fill(); c.fillStyle = k < .09 ? '#fff3a088' : '#ffffff2e'; c.beginPath(); c.arc(X - R * .35, Y - R * .35, R * .38, 0, TAU); c.fill();
    }
    // 7) tranvía, Metroplús y metro: los andenes van A LO LARGO del trazo (siguen sus curvas), y los rieles mueren en ellos
    const near = (x, y, m) => x > px0 - m && y > py0 - m && x < px0 + S + m && y < py0 + S + m;
    const path = (L, w, col, dx = 0, dy = 0) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); L.pts.forEach((p, i) => i ? c.lineTo(p.x + dx, p.y + dy) : c.moveTo(p.x + dx, p.y + dy)); c.stroke(); };
    const tramo = (L, s0, s1, w, col, dx = 0, dy = 0) => { const n = Math.max(1, Math.ceil((s1 - s0) / 6)); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'butt'; c.beginPath(); for (let k = 0; k <= n; k++) { const p = this.at(L, s0 + (s1 - s0) * k / n); k ? c.lineTo(p.x + dx, p.y + dy) : c.moveTo(p.x + dx, p.y + dy); } c.stroke(); c.lineCap = 'round'; };
    const costillas = (L, s0, s1, w, col) => { c.strokeStyle = col; c.lineWidth = .9; c.beginPath(); for (let s = s0 + 7; s < s1 - 4; s += 14) { const p = this.at(L, s), nx = -Math.sin(p.a), ny = Math.cos(p.a); c.moveTo(p.x - nx * w, p.y - ny * w); c.lineTo(p.x + nx * w, p.y + ny * w); } c.stroke(); };
    path(this.tram, 6, '#77767a'); path(this.tram, 3.4, '#cfd3d8'); path(this.tram, 1.6, '#77767a');
    for (const st of this.tram.st || []) { const p = this.at(this.tram, st.s); if (!near(p.x, p.y, 40)) continue; tramo(this.tram, st.s - 22, st.s + 22, 12, '#9aa0a8'); tramo(this.tram, st.s - 22, st.s + 22, 10, '#e2e5e9'); tramo(this.tram, st.s - 22, st.s + 22, 2, PAL.cie); }
    for (const L of this.mp || []) { path(L, .34 * TS, L.col + 'b0'); path(L, .06 * TS, '#ffffffaa'); }
    for (const L of this.mp || []) for (const st of L.st) { const p = this.at(L, st.s); if (!near(p.x, p.y, 50)) continue; tramo(L, st.s - 30, st.s + 30, 13, 'rgba(8,14,30,.3)', 1.5, 2); tramo(L, st.s - 30, st.s + 30, 12, '#eef0f3'); tramo(L, st.s - 30, st.s + 30, 3.2, L.col); }
    const SL = 21 * MS * 1.55, SW = 11 * MS * .9;
    for (const L of [this.lineA, this.lineB]) {
      path(L, 13, 'rgba(8,14,30,.3)', 4, 5); path(L, 13, '#8d939c'); path(L, 10.5, '#d3d6db'); path(L, 4.6, '#9aa0a8'); path(L, 3.4, '#d3d6db');
      for (const st of L.st) { const p = this.at(L, st.s); if (!near(p.x, p.y, SL + 20)) continue; const s0 = Math.max(0, st.s - SL), s1 = Math.min(L.len, st.s + SL), col = L === this.lineA ? '#1C5C9C' : '#E38835';
        tramo(L, s0, s1, SW * 2, 'rgba(8,14,30,.3)', 3, 4); tramo(L, s0, s1, SW * 2, col); tramo(L, s0, s1, SW * 2 - 6.8, '#eef0f3'); costillas(L, s0, s1, SW - 4, '#c3c8cf'); }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
});
/* casco convexo de un rectángulo y su sombra corrida d px (sol del noroeste) */
function hull8(P, d) {
  const q = []; for (let k = 0; k < 8; k += 2) { q.push([P[k], P[k + 1]], [P[k] + d, P[k + 1] + d]); }
  q.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of q) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = q.length - 1; i >= 0; i--) { const p = q[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  const h = lo.slice(0, -1).concat(up.slice(0, -1)), out = []; for (const p of h) out.push(p[0], p[1]); return out;
}
/* edificios con volumen: cada lote de edificio se levanta con perspectiva desde el jugador (lo lejano primero), girado con su calle */
Ride.prototype.draw3D = function (c, ox, oy, vw, vh) {
  if (GFX() !== '3d') return; const M = this.map, P = this.p, px = P.x - ox, py = P.y - oy, K = .36, S = CH * TS, nb = Math.round(Art.night(this.min) * 3), L = [], mg = 70;
  for (let cy = Math.floor((oy - mg) / S); cy <= Math.floor((oy + vh + mg) / S); cy++) for (let cx = Math.floor((ox - mg) / S); cx <= Math.floor((ox + vw + mg) / S); cx++) {
    if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue;
    for (const b of M.lotes(cx, cy).ed) { const x = b.x - ox, y = b.y - oy, m2 = b.z > .6 ? mg + 200 : mg; if (x > vw + m2 || y > vh + m2 || x < -m2 || y < -m2) continue; if (b.gx != null) { const gx = b.gx - ox - px, gy = b.gy - oy - py; b.dd = gx * gx + gy * gy + (2 - b.z); } else b.dd = (x - px) * (x - px) + (y - py) * (y - py); L.push(b); }   /* las partes de un lugar van juntas: primero las bajas, luego las torres */
  }
  L.sort((a, b) => b.dd - a.dd); c.lineWidth = .5; const bx = [0, 0, 0, 0], by = [0, 0, 0, 0], rx = [0, 0, 0, 0], ry = [0, 0, 0, 0];
  for (const b of L) {
    const p = b.pal[nb] || (b.pal[nb] = { roof: mixHex(b.roof, '#0b1430', nb * .17), wa: mixHex(b.wa, '#0b1430', nb * .17), wb: mixHex(b.wb, '#0b1430', nb * .17), ln: nb >= 2 ? '#ffd97a' : shade(b.wb, -.22), top: mixHex(shade(b.roof, .16), '#0b1430', nb * .17) });
    const f = 1 + K * b.z, Q = b.pts, nf = b.nf || Math.max(1, Math.round(b.z * 9));
    for (let i = 0; i < 4; i++) { const x = Q[i * 2] - ox, y = Q[i * 2 + 1] - oy; bx[i] = x; by[i] = y; rx[i] = px + (x - px) * f; ry[i] = py + (y - py) * f; }
    const mx = (bx[0] + bx[2]) / 2, my = (by[0] + by[2]) / 2;
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) & 3, ex = (bx[i] + bx[j]) / 2, ey = (by[i] + by[j]) / 2, nx = ex - mx, ny = ey - my;
      if (nx * (px - ex) + ny * (py - ey) <= 0) continue;   // esa pared mira hacia el otro lado
      c.fillStyle = Math.abs(nx) > Math.abs(ny) ? p.wb : p.wa; c.beginPath(); c.moveTo(bx[i], by[i]); c.lineTo(bx[j], by[j]); c.lineTo(rx[j], ry[j]); c.lineTo(rx[i], ry[i]); c.closePath(); c.fill();
      if (nf > 1) { c.strokeStyle = b.lnc ? (p.lnc || (p.lnc = mixHex(b.lnc, '#0b1430', nb * .17))) : p.ln; if (nb >= 2) c.setLineDash([1.2, 2.2]); c.beginPath(); for (let k = 1; k < nf; k++) { const t = k / nf; c.moveTo(bx[i] + (rx[i] - bx[i]) * t, by[i] + (ry[i] - by[i]) * t); c.lineTo(bx[j] + (rx[j] - bx[j]) * t, by[j] + (ry[j] - by[j]) * t); } c.stroke(); if (nb >= 2) c.setLineDash([]); }
    }
    c.fillStyle = p.roof; c.beginPath(); c.moveTo(rx[0], ry[0]); c.lineTo(rx[1], ry[1]); c.lineTo(rx[2], ry[2]); c.lineTo(rx[3], ry[3]); c.closePath(); c.fill();
    const cxr = (rx[0] + rx[2]) / 2, cyr = (ry[0] + ry[2]) / 2; if (!(b.t === 'dos' || b.t === 'cuatro' || b.t === 'aguja')) { c.strokeStyle = p.top; c.beginPath(); for (let i = 0; i < 4; i++) { const x = cxr + (rx[i] - cxr) * .84, y = cyr + (ry[i] - cyr) * .84; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke(); }
    if (b.t) techoLM(c, b, rx, ry, p, nb, px, py, f, K); else techoL(c, b, rx, ry, p);
  }
};
/* techos de los edificios, en el sentido del lote: aires, tanques, helipuerto, jardín o paneles */
function techoL(c, b, rx, ry, p) {
  const ux = rx[1] - rx[0], uy = ry[1] - ry[0], vx = rx[3] - rx[0], vy = ry[3] - ry[0], w = Math.hypot(ux, uy), h = Math.hypot(vx, vy); if (w < 12 || h < 12) return;
  const at = (a, d) => [rx[0] + ux * a + vx * d, ry[0] + uy * a + vy * d], quad = (a0, d0, a1, d1, col) => { const A = at(a0, d0), B = at(a1, d0), C = at(a1, d1), D = at(a0, d1); c.fillStyle = col; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(C[0], C[1]); c.lineTo(D[0], D[1]); c.closePath(); c.fill(); }, k = b.k;
  if (k < .3) { quad(.22, .3, .34, .44, p.top); quad(.4, .3, .5, .44, p.top); }
  else if (k < .5) { const C = at(.7, .38); c.fillStyle = p.top; c.beginPath(); c.arc(C[0], C[1], 2.4, 0, TAU); c.fill(); }
  else if (k < .64 && b.z > .5) { const C = at(.5, .5); c.strokeStyle = '#e8e6de'; c.lineWidth = .8; c.beginPath(); c.arc(C[0], C[1], Math.min(w, h) * .22, 0, TAU); c.stroke(); quad(.44, .4, .47, .6, '#e8e6de'); quad(.53, .4, .56, .6, '#e8e6de'); quad(.44, .49, .56, .52, '#e8e6de'); c.lineWidth = .5; }
  else if (k > .86) quad(.1, .55, .55, .88, '#6aa94f');
  else if (k > .74) { quad(.12, .5, .5, .82, '#22365e'); c.strokeStyle = '#5b7db0'; c.lineWidth = .3; c.beginPath(); for (let a = .18; a < .5; a += .07) { const A = at(a, .5), B = at(a, .82); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); } c.stroke(); c.lineWidth = .5; }
}

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
  walker: (base, a) => vsprite('wk' + a.join() + Save.data.profile.shirt + Save.data.profile.skin, base, (x, w, h) => { const P = Save.data.profile, f = a[0] | 0; ell(x, w / 2 - .9, h / 2 + (f ? 1.4 : -1.4), .6, 1, '#2a3550'); ell(x, w / 2 + .9, h / 2 + (f ? -1.4 : 1.4), .6, 1, '#2a3550'); ell(x, w / 2, h / 2, w * .42, h * .2, SHIRTS[P.shirt] || PAL.vd); ell(x, w / 2, h / 2, w * .22, w * .22, PELO[P.hairCol | 0] || '#2a1a10'); }),
  trainCar: (base) => vsprite('tc', base, (x, w, h) => { rrect(x, .15, .15, w - .3, h - .3, 1.8, '#e6e9ee'); rrect(x, .9, 1.4, w - 1.8, h - 2.8, 1.1, '#c9cfd8'); for (let i = 0; i < 3; i++) rrect(x, w / 2 - 1.2, 3 + i * 4, 2.4, 2, .6, '#8e98a6'); rrect(x, .15, .15, w - .3, 1.2, .6, PAL.vd); rrect(x, .15, h - 1.35, w - .3, 1.2, .6, PAL.vd); x.fillStyle = '#ffffff66'; x.fillRect(.6, 1.6, .5, h - 3.2); })
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
