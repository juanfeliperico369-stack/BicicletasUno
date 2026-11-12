/* =====================================================================
   MAPA REAL DEL VALLE DE ABURRÁ (de Caldas a Barbosa)
   Casillas de 20 m hechas con datos abiertos (tools/geo/build.py): calles, ciclorrutas, río, quebradas,
   parques, municipios, Metro, tranvía y relieve. Fila 0 = norte. Ver docs/GUIA.md §4.
   ===================================================================== */
const VM = VALLE_META, MW = VM.W, MH = VM.H, TS = 16, CH = 16, SC = 1.35, ES = VM.es, WK = TS / 8;   // WK: escala del mundo frente al diseño original de 8 px
const TT = { GRASS: 0, MOUNT: 1, BRICK: 2, BLDG: 3, ROAD: 4, AVE: 5, WALK: 6, CICLO: 7, WATER: 8, CANAL: 9, PLAZA: 10, BRIDGE: 11, STATION: 12, LAND: 13, AUTO: 14, DEPOT: 15, STEPS: 16 };
const SOLID = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0];
const TRUCK_OK = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0];
const SURF = [.55, 0, 0, 0, 1, 1, .62, 1.3, 0, 0, .8, 1, .75, 0, .92, .9, .42];
const PATHC = [6, 0, 0, 0, 3, 3, 4, 2, 0, 0, 3, 3, 3, 0, 6, 3, 8];
const MINI_COL = ['#4f8f45', '#24502c', '#8a4a30', '#56657c', '#2b3240', '#384257', '#7d8696', '#9bd341', '#3d8cb0', '#5f7f8a', '#cfc4a6', '#384257', '#ffffff', '#c8c8c8', '#14141c', '#56c7ff', '#9a8a70'];
/* lat/lon -> casillas (float) y -> px del mundo */
const geoT = (lat, lon) => ({ x: (lon - VM.lon0) * VM.kx, y: (VM.latN - lat) * VM.ky });
const geoP = (lat, lon) => { const t = geoT(lat, lon); return { x: t.x * TS, y: t.y * TS }; };
const q4 = a => { const r = []; for (let i = 0; i < a.length; i += 2) r.push({ x: a[i] / 4 * TS, y: a[i + 1] / 4 * TS }); return r; };   // líneas del JSON (casillas ×4) -> px
/* lugares con postal (de 19-lugares.js), en casillas */
const LANDMARKS = LUGARES.map(([id, name, muni, lat, lon, w, h, k, fact, secret]) => { const t = geoT(lat, lon); return { id, name, muni, lat, lon, x: Math.round(t.x - w / 2), y: Math.round(t.y - h / 2), w, h, k, fact, secret: !!secret }; });
const LM = {}; LANDMARKS.forEach(l => LM[l.id] = l);
const PUBLIC_LM = () => LANDMARKS.filter(l => l.id !== 'depot' && !l.secret);
const CICLOVIA_AV = ['Avenida 80', 'Carrera 43A', 'Avenida El Poblado', 'Avenida Las Vegas'];
const M_PER_PX = VM.tile / TS;

/* inflate (deflate crudo) para navegadores sin DecompressionStream */
function inflateRaw(src, size) {
  const out = new Uint8Array(size); let o = 0, p = 0, bb = 0, bc = 0;
  const bits = n => { while (bc < n) { bb |= (src[p++] | 0) << bc; bc += 8; } const v = bb & ((1 << n) - 1); bb >>>= n; bc -= n; return v; };
  const mk = (len, n) => { const cnt = new Int32Array(16), off = new Int32Array(16), sym = new Int32Array(n); for (let i = 0; i < n; i++) cnt[len[i]]++; cnt[0] = 0; for (let i = 1; i < 16; i++) off[i] = off[i - 1] + cnt[i - 1]; for (let i = 0; i < n; i++) if (len[i]) sym[off[len[i]]++] = i; return { cnt, sym }; };
  const dec = h => { let code = 0, first = 0, idx = 0; for (let l = 1; l < 16; l++) { code |= bits(1); const c = h.cnt[l]; if (code - c < first) return h.sym[idx + code - first]; idx += c; first += c; first <<= 1; code <<= 1; } return 256; };
  const LB = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], LE = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DB = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], DE = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  let fl = null, fd = null;
  for (let last = 0; !last && o < size;) {
    last = bits(1); const type = bits(2);
    if (type === 0) { bb = 0; bc = 0; const len = src[p] | src[p + 1] << 8; p += 4; out.set(src.subarray(p, p + len), o); o += len; p += len; continue; }
    let lh, dh;
    if (type === 1) { if (!fl) { const l = new Uint8Array(288); l.fill(8, 0, 144); l.fill(9, 144, 256); l.fill(7, 256, 280); l.fill(8, 280, 288); fl = mk(l, 288); fd = mk(new Uint8Array(30).fill(5), 30); } lh = fl; dh = fd; }
    else {
      const nl = bits(5) + 257, nd = bits(5) + 1, nc = bits(4) + 4, ord = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], cl = new Uint8Array(19);
      for (let i = 0; i < nc; i++) cl[ord[i]] = bits(3);
      const ch = mk(cl, 19), L = new Uint8Array(nl + nd);
      for (let i = 0; i < nl + nd;) { const s = dec(ch); if (s < 16) L[i++] = s; else { let r, v = 0; if (s === 16) { v = L[i - 1]; r = 3 + bits(2); } else if (s === 17) r = 3 + bits(3); else r = 11 + bits(7); while (r--) L[i++] = v; } }
      lh = mk(L.subarray(0, nl), nl); dh = mk(L.subarray(nl), nd);
    }
    for (;;) { let s = dec(lh); if (s < 256) out[o++] = s; else if (s === 256) break; else { s -= 257; const len = LB[s] + bits(LE[s]), ds = dec(dh), d = DB[ds] + bits(DE[ds]); for (let k = 0; k < len; k++, o++) out[o] = out[o - d]; } }
  }
  return out;
}

const CityMap = JE.map = {
  t: null, lid: null, stations: [], depot: null, chunks: new Map(), lmCanvas: {}, mini: null, miniK: 2, flows: new Map(), lanes: [], lights: [], lightAt: new Map(), metroA: [], metroB: [], cables: [],
  idx(x, y) { return y * MW + x; },
  get(x, y) { return (x < 0 || y < 0 || x >= MW || y >= MH) ? TT.MOUNT : this.t[y * MW + x]; },
  set(x, y, v) { if (x >= 0 && y >= 0 && x < MW && y < MH) this.t[y * MW + x] = v; },
  lightIdx(i) { const v = this.lightAt.get(i); return v == null ? -1 : v; },
  /* ---------- carga ---------- */
  async load() {
    const bin = atob(VALLE_BIN), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const nT = MW * MH, nE = VM.eW * VM.eH, nM = VM.mW * VM.mH, size = nT + nE * 2 + nM * 2;
    let raw = null;
    if (window.DecompressionStream) { try { raw = new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); } catch (e) { raw = null; } }
    if (!raw || raw.length < size) raw = inflateRaw(u8, size);
    this.t = raw.slice(0, nT);
    const ed = new Int16Array(raw.slice(nT, nT + nE * 2).buffer), E = this.E = new Int16Array(nE);
    for (let j = 0; j < VM.eH; j++) { let a = 0; for (let i = 0; i < VM.eW; i++) { a += ed[j * VM.eW + i]; E[j * VM.eW + i] = a; } }
    this.mu = raw.slice(nT + nE * 2, nT + nE * 2 + nM); this.co = raw.slice(nT + nE * 2 + nM, nT + nE * 2 + nM * 2);
    this.lid = new Map();
    this.build();
    const ci = []; for (let i = 0; i < this.t.length; i++) if (this.t[i] === TT.CICLO) ci.push(i); this.cicloIdx = Int32Array.from(ci);
  },
  build() {
    LANDMARKS.forEach((L, i) => this.paintLandmark(L, i));
    this.stations = ESTACIONES.map((s, i) => this.carveStation(s, i)).filter(Boolean); this.stations.forEach((s, i) => s.i = i);
    this.buildLights(); this.buildLanes(); this.buildRail(); this.buildMini();
    const dp = LM.depot; this.depot = { x: (dp.x + dp.w / 2) * TS, y: (dp.y + dp.h + .5) * TS, name: 'Casa EnCicla' };
    this.poi = {}; for (const k in PUNTOS) { const [la, lo, n] = PUNTOS[k], p = geoP(la, lo), o = this.nearestOpen(Math.floor(p.x / TS), Math.floor(p.y / TS), k !== 'campus'); this.poi[k] = { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2, name: n }; }
    this.poi.casa = Object.assign({}, this.depot, { name: PUNTOS.casa[2] });
  },
  /* ---------- relieve ---------- */
  elevT(tx, ty) { // en casillas (float) -> metros
    const W = VM.eW, gx = clamp(tx / ES, 0, W - 1.001), gy = clamp(ty / ES, 0, VM.eH - 1.001), i = gx | 0, j = gy | 0, fx = gx - i, fy = gy - j, E = this.E, k = j * W + i;
    return (E[k] * (1 - fx) + E[k + 1] * fx) * (1 - fy) + (E[k + W] * (1 - fx) + E[k + W + 1] * fx) * fy;
  },
  elev(px, py) { return this.elevT(px / TS, py / TS); },
  /* pendiente (subida > 0) en la dirección a, medida en ±16 px (40 m) */
  slope(px, py, a) { const dx = Math.cos(a) * 16, dy = Math.sin(a) * 16; return (this.elev(px + dx, py + dy) - this.elev(px - dx, py - dy)) / (32 * M_PER_PX); },
  muniAt(px, py) { const i = clamp(Math.floor(py / TS / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(px / TS / 8), 0, VM.mW - 1), v = this.mu[i]; return v ? VM.munis[v - 1] : ''; },
  comunaAt(px, py) { const i = clamp(Math.floor(py / TS / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(px / TS / 8), 0, VM.mW - 1), v = this.co[i]; return v ? VM.comunas[v - 1] : ''; },
  district(x, y) { const c = this.comunaAt(x * TS, y * TS); return /Candelaria/.test(c) ? 'centro' : /Poblado/.test(c) ? 'poblado' : /Laureles|América/.test(c) ? 'laureles' : 'barrio'; },
  /* ---------- lugares y estaciones ---------- */
  paintLandmark(L, i) {
    // corre el lugar unas casillas si tapa avenidas, autopistas, agua u otro lugar
    const bad = v => v === TT.AVE || v === TT.AUTO || v === TT.WATER || v === TT.BRIDGE ? 6 : v === TT.ROAD ? 1 : 0;
    let best = null, bs = 1e9;
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
      let s = Math.abs(dx) + Math.abs(dy);
      for (let y = L.y + dy; y < L.y + dy + L.h && s < bs; y++) for (let x = L.x + dx; x < L.x + dx + L.w; x++) { s += bad(this.get(x, y)); if (this.lid.has(this.idx(x, y))) s += 50; }
      if (s < bs) { bs = s; best = { dx, dy }; }
    }
    L.x += best.dx; L.y += best.dy;
    const keep = [TT.WATER, TT.CANAL, TT.AUTO, TT.AVE, TT.BRIDGE];
    const base = { comuna13: TT.LAND, bibespana: TT.LAND, palacio: TT.PLAZA, catedral: TT.PLAZA, parquenorte: TT.GRASS, deporte: TT.GRASS, memoria: TT.GRASS, cruces: TT.LAND, iglesia: TT.PLAZA, terminal: TT.PLAZA, volador: TT.LAND, campus: TT.GRASS, moravia: TT.LAND, botanico: TT.GRASS, explora: TT.PLAZA, estadio: TT.LAND, botero: TT.PLAZA, coltejer: TT.LAND, teatro: TT.PLAZA, lleras: TT.PLAZA, pies: TT.PLAZA, luces: TT.PLAZA, depot: TT.DEPOT, cerro: TT.LAND, mamm: TT.GRASS, aeropuerto: TT.LAND }[L.k];
    for (let y = L.y; y < L.y + L.h; y++) for (let x = L.x; x < L.x + L.w; x++) { if (keep.includes(this.get(x, y))) continue; this.set(x, y, base); this.lid.set(this.idx(x, y), i); }
    const solid = (x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (this.lid.get(this.idx(L.x + xx, L.y + yy)) === i) this.set(L.x + xx, L.y + yy, TT.LAND); };
    const W = L.w, H = L.h;
    switch (L.k) {
      case 'iglesia': solid((W >> 1) - 2, 1, 4, 4); break;
      case 'terminal': solid(1, 1, W - 2, 3); break;
      case 'campus': solid(1, 1, 3, 3); solid(W - 4, 1, 3, 3); solid(1, H - 4, 3, 3); solid(W - 4, H - 4, 3, 3); break;
      case 'botanico': solid(3, 2, 5, 4); break;
      case 'explora': solid(1, 1, 3, 3); solid(5, 1, 3, 2); solid(5, 4, 3, 2); break;
      case 'botero': solid(0, 0, W, 2); break;
      case 'teatro': solid(1, 1, 5, 4); break;
      case 'mamm': solid(1, 1, 5, 3); break;
      case 'palacio': solid(1, 1, W - 2, 4); break;
      case 'catedral': solid(2, 1, 6, 5); break;
      case 'parquenorte': solid(1, 1, 4, 4); break;
      case 'memoria': solid(1, 1, 5, 3); break;
      case 'depot': solid(0, 0, W, 2); break;
    }
    // perímetro transitable y salida a la calle
    for (let y = L.y - 1; y <= L.y + L.h; y++) for (let x = L.x - 1; x <= L.x + L.w; x++) {
      if (y >= L.y && y < L.y + L.h && x >= L.x && x < L.x + L.w) continue;
      const v = this.get(x, y); if (v === TT.BLDG || v === TT.BRICK || v === TT.MOUNT) this.set(x, y, TT.WALK);
    }
    if (L.k === 'depot') { const cx = L.x + (W >> 1); for (let y = L.y + H; y < L.y + H + 6; y++) { const v = this.get(cx, y); if (TRUCK_OK[v]) break; this.set(cx, y, TT.DEPOT); this.set(cx + 1, y, TT.DEPOT); } }
  },
  /* la estación ocupa 4×2 casillas (80×40 m) en la acera o el lote más cercano a su lat/lon, con salida a una vía */
  carveStation(s, i) {
    const [id, name, muni, lat, lon, type, kind, az] = s, g = geoT(lat, lon), tx = Math.round(g.x), ty = Math.round(g.y), ok = [TT.BLDG, TT.BRICK, TT.GRASS, TT.PLAZA, TT.WALK];
    const acc = v => v === TT.WALK || v === TT.CICLO || v === TT.PLAZA || v === TT.ROAD || v === TT.AVE;
    let best = null, bd = 1e9;
    for (let y = ty - 16; y <= ty + 16; y++) for (let x = tx - 16; x <= tx + 16; x++) {
      const d = Math.abs(x + 2 - tx) + Math.abs(y + 1 - ty); if (d >= bd) continue;
      let good = true;
      for (let yy = y; yy < y + 2 && good; yy++) for (let xx = x; xx < x + 4; xx++) if (!ok.includes(this.get(xx, yy)) || this.lid.has(this.idx(xx, yy))) { good = false; break; }
      for (let yy = y - 2; yy <= y + 3 && good; yy++) for (let xx = x - 2; xx <= x + 5; xx++) if (this.get(xx, yy) === TT.STATION) { good = false; break; }
      if (!good) continue;
      let a = false; for (let xx = x; xx < x + 4 && !a; xx++) if (acc(this.get(xx, y - 1)) || acc(this.get(xx, y + 2))) a = true;
      for (let yy = y; yy < y + 2 && !a; yy++) if (acc(this.get(x - 1, yy)) || acc(this.get(x + 4, yy))) a = true;
      if (!a) continue;
      bd = d; best = { x, y };
    }
    if (!best) { (this.dropped || (this.dropped = [])).push(name); return null; }
    for (let yy = best.y; yy < best.y + 2; yy++) for (let xx = best.x; xx < best.x + 4; xx++) this.set(xx, yy, TT.STATION);
    const cap = type === 'm' ? 14 + Math.floor(h2(i, 3) * 3) * 2 : 10 + Math.floor(h2(i, 4) * 2) * 2;
    const zone = lat > 6.272 ? 'norte' : lat > 6.205 ? 'centro' : 'sur';
    return { i, id, name, muni, type, kind, cap, zone, az: az || null, e: CORREDOR_E.includes(id), lat, lon, tx: best.x, ty: best.y, x: (best.x + 2) * TS, y: (best.y + 1) * TS };
  },
  /* ---------- semáforos, carriles de carros, metro, tranvía, cables ---------- */
  buildLights() {
    const road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE;
    for (const [a, b] of VM.lights) {
      const tx = Math.floor(a / 4), ty = Math.floor(b / 4); if (!road(this.get(tx, ty))) continue;
      const id = this.lights.length, L = { id, x: (a / 4) * TS, y: (b / 4) * TS, off: h2(tx, ty, 77) * 10 };
      L.x0 = L.x - 12 * WK; L.x1 = L.x + 12 * WK; L.y0 = L.y - 12 * WK; L.y1 = L.y + 12 * WK; this.lights.push(L);
      for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) if (road(this.get(x, y))) this.lightAt.set(this.idx(x, y), id);
    }
  },
  /* ciclo de 10 s: [estado este-oeste, estado norte-sur]  g=verde a=amarillo r=rojo */
  lightState(L, t) { const p = ((t + L.off) % 10 + 10) % 10; return p < 4.2 ? 'gr' : p < 5 ? 'ar' : p < 9.2 ? 'rg' : 'ra'; },
  /* polilínea en px -> {pts, cum, len} */
  poly(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y)); return { pts, cum, len: cum[cum.length - 1] }; },
  /* punto a la distancia s de la polilínea (con desfase lateral off): {x, y, a, i} */
  at(P, s, off, hint) {
    const c = P.cum; s = clamp(s, 0, P.len); let i = hint != null ? clamp(hint, 0, c.length - 2) : 0;
    while (i < c.length - 2 && c[i + 1] < s) i++; while (i > 0 && c[i] > s) i--;
    const a = P.pts[i], b = P.pts[i + 1] || a, L = (c[i + 1] - c[i]) || 1, k = (s - c[i]) / L, ang = Math.atan2(b.y - a.y, b.x - a.x);
    return { x: a.x + (b.x - a.x) * k - Math.sin(ang) * (off || 0), y: a.y + (b.y - a.y) * k + Math.cos(ang) * (off || 0), a: ang, i };
  },
  /* distancia más corta de un punto a la polilínea: {d, s} */
  project(P, x, y) {
    let bd = 1e9, bs = 0;
    for (let i = 0; i < P.pts.length - 1; i++) { const a = P.pts[i], b = P.pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1, t = clamp(((x - a.x) * dx + (y - a.y) * dy) / L2, 0, 1), px = a.x + dx * t, py = a.y + dy * t, d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; bs = P.cum[i] + Math.sqrt(L2) * t; } }
    return { d: bd, s: bs };
  },
  buildLanes() {
    const G = 64, cells = this.laneGrid = new Map(), SPD = { t: 46 * WK, p: 36 * WK, s: 30 * WK };
    const add = (ln) => { this.lanes.push(ln); const seen = new Set(); for (const p of ln.pts) { const k = Math.floor(p.x / TS / G) + ',' + Math.floor(p.y / TS / G); if (seen.has(k)) continue; seen.add(k); (cells.get(k) || cells.set(k, []).get(k)).push(ln); } };
    for (const l of VM.lanes) {
      const P = this.poly(q4(l.p)), base = { pts: P.pts, cum: P.cum, len: P.len, spd: SPD[l.c] || 30 * WK, name: l.n, cv: CICLOVIA_AV.includes(l.n), cls: l.c };
      if (l.o) add(Object.assign({ dir: 1, off: 0 }, base)); else { add(Object.assign({ dir: 1, off: 3 * WK }, base)); add(Object.assign({ dir: -1, off: -3 * WK }, base)); }
    }
    // semáforos sobre cada carril
    for (const ln of this.lanes) {
      ln.lights = [];
      for (const g of this.lightsNear(ln)) { const pr = this.project(ln, g.x, g.y); if (pr.d < 14 * WK) { const q = this.at(ln, pr.s), ax = Math.abs(Math.cos(q.a)) > Math.abs(Math.sin(q.a)) ? 0 : 1; ln.lights.push({ p0: pr.s - 12 * WK, p1: pr.s + 12 * WK, g, ax }); } }
      ln.lights.sort((a, b) => a.p0 - b.p0);
    }
  },
  lightsNear(ln) { if (!this._lg) { this._lg = new Map(); for (const g of this.lights) { const k = Math.floor(g.x / TS / 64) + ',' + Math.floor(g.y / TS / 64); (this._lg.get(k) || this._lg.set(k, []).get(k)).push(g); } } const r = new Set(); for (const p of ln.pts) { const L = this._lg.get(Math.floor(p.x / TS / 64) + ',' + Math.floor(p.y / TS / 64)); if (L) L.forEach(g => r.add(g)); } return r; },
  lanesNear(x, y) { const G = 64 * TS, r = []; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const L = this.laneGrid.get((Math.floor(x / G) + i) + ',' + (Math.floor(y / G) + j)); if (L) r.push(...L); } return r; },
  buildRail() {
    const mk = (k) => { const m = VM.metro[k], P = this.poly(q4(m.p)); P.st = m.st.map(([name, a, b]) => { const x = a / 4 * TS, y = b / 4 * TS, pr = this.project(P, x, y); return { name, px: x, py: y, s: pr.s }; }); return P; };
    this.lineA = mk('A'); this.lineB = mk('B'); this.tram = mk('T');
    this.metroA = this.lineA.st; this.metroB = this.lineB.st;
    this.river = this.poly(q4(VM.river));
    this.cables = [];
    for (const [name, col, st] of CABLES) for (let i = 0; i < st.length - 1; i++) {
      const a = geoP(st[i][0], st[i][1]), b = geoP(st[i + 1][0], st[i + 1][1]);
      this.cables.push({ name: i === 0 ? name : '', col, ax: a.x, ay: a.y, bx: b.x, by: b.y, len: Math.hypot(b.x - a.x, b.y - a.y), st: [0, 1], sn: [st[i][2], st[i + 1][2]] });
    }
  },
  buildMini() {
    const K = this.miniK, w = Math.ceil(MW / K), h = Math.ceil(MH / K), rank = [1, 0, 2, 3, 6, 7, 5, 8, 4, 3, 2, 6, 9, 2, 8, 7, 4];   // qué gana al reducir 2x2
    const cols = MINI_COL.map(c => parseInt(c.slice(1), 16));
    this.mini = Art.mk(w, h, c => {
      const img = c.createImageData(w, h), d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = this.get(x * K, y * K), r = rank[v];
        for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) { const u = this.get(x * K + i, y * K + j); if (rank[u] > r) { r = rank[u]; v = u; } }
        const col = cols[v], e = this.elevT(x * K, y * K), sh = clamp(1 + (this.elevT(x * K - 4, y * K - 4) - e) * .006, .7, 1.25), o = (y * w + x) * 4;
        d[o] = clamp((col >> 16) * sh, 0, 255); d[o + 1] = clamp((col >> 8 & 255) * sh, 0, 255); d[o + 2] = clamp((col & 255) * sh, 0, 255); d[o + 3] = 255;
      }
      c.putImageData(img, 0, 0);
      const line = (P, col, wd) => { c.strokeStyle = col; c.lineWidth = wd; c.beginPath(); P.pts.forEach((p, i) => i ? c.lineTo(p.x / TS / K, p.y / TS / K) : c.moveTo(p.x / TS / K, p.y / TS / K)); c.stroke(); };
      line(this.lineA, '#d6dde6', 1.5); line(this.lineB, '#d6dde6', 1.5); line(this.tram, PAL.cie, 1);
      c.lineWidth = 1; for (const cb of this.cables) { c.strokeStyle = cb.col; c.beginPath(); c.moveTo(cb.ax / TS / K, cb.ay / TS / K); c.lineTo(cb.bx / TS / K, cb.by / TS / K); c.stroke(); }
    });
  },

  /* ---------- rutas (Dial) en una ventana alrededor del destino y del que pregunta ---------- */
  flow(tx, ty, truck, fx, fy) {
    tx = clamp(tx | 0, 0, MW - 1); ty = clamp(ty | 0, 0, MH - 1);
    const ok0 = v => truck ? TRUCK_OK[v] : !SOLID[v];
    if (!ok0(this.get(tx, ty))) { const n = this.nearestOpen(tx, ty, truck); tx = n.x; ty = n.y; }
    const full = fx === -1; fx = fx == null || full ? tx : clamp(fx | 0, 0, MW - 1); fy = fy == null || full ? ty : clamp(fy | 0, 0, MH - 1);   // fx = -1: todo el mapa (pruebas)
    // si ya hay un campo que cubre al que pregunta, se reutiliza
    const kb = tx + ',' + ty + (truck ? 't' : 'b');
    for (const [k, F] of this.flows) if (k.startsWith(kb + '|') && fx > F.x0 + 4 && fy > F.y0 + 4 && fx < F.x0 + F.w - 5 && fy < F.y0 + F.h - 5) { this.flows.delete(k); this.flows.set(k, F); return F; }
    const m = full ? 1e5 : 90, x0 = clamp(Math.min(tx, fx) - m, 0, MW - 1), y0 = clamp(Math.min(ty, fy) - m, 0, MH - 1), x1 = clamp(Math.max(tx, fx) + m, 0, MW - 1), y1 = clamp(Math.max(ty, fy) + m, 0, MH - 1);
    const w = x1 - x0 + 1, h = y1 - y0 + 1, N = w * h, D = new Int32Array(N).fill(1e9), buckets = []; let cur = 0, maxB = 0;
    const cost = v => truck ? (TRUCK_OK[v] ? (v === TT.AUTO ? 2 : 3) : 0) : PATHC[v];
    const push = (i, d) => { (buckets[d] || (buckets[d] = [])).push(i); };
    const s = (ty - y0) * w + (tx - x0); D[s] = 0; push(s, 0);
    const T = this.t;
    while (cur <= maxB + 8) {
      const B = buckets[cur]; if (!B || !B.length) { cur++; continue; }
      const i = B.pop(); if (D[i] !== cur) continue;
      const x = i % w, y = (i / w) | 0;
      for (let k = 0; k < 4; k++) {
        const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0); if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx, c = cost(T[(ny + y0) * MW + nx + x0]); if (!c) continue;
        const nd = cur + c; if (nd < D[j]) { D[j] = nd; push(j, nd); if (nd > maxB) maxB = nd; }
      }
    }
    const F = { D, x0, y0, w, h };
    this.flows.set(kb + '|' + x0 + ',' + y0 + ',' + w + ',' + h, F); if (this.flows.size > 10) this.flows.delete(this.flows.keys().next().value);
    return F;
  },
  /* valor del campo en la casilla (1e9 = fuera / sin camino) */
  fv(F, x, y) { x -= F.x0; y -= F.y0; return (x < 0 || y < 0 || x >= F.w || y >= F.h) ? 1e9 : F.D[y * F.w + x]; },
  nextStep(F, x, y) {
    let best = null, bv = this.fv(F, x, y);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = x + dx, ny = y + dy; let v = this.fv(F, nx, ny);
      if (dx && dy) { if (this.fv(F, nx, y) >= 1e9 || this.fv(F, x, ny) >= 1e9) continue; v += .5; }
      if (v < bv) { bv = v; best = { x: nx, y: ny }; }
    }
    return best;
  },
  nearestOpen(x, y, truck) {
    const ok = v => truck ? TRUCK_OK[v] : !SOLID[v];
    for (let r = 0; r < 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if ((Math.abs(dx) === r || Math.abs(dy) === r) && ok(this.get(x + dx, y + dy))) return { x: x + dx, y: y + dy };
    return { x, y };
  },

  /* ---------- dibujo por bloques (caché): pixel + sombras del relieve ---------- */
  chunk(cx, cy) {
    const k = cx + ',' + cy; let c = this.chunks.get(k);
    if (c) { this.chunks.delete(k); this.chunks.set(k, c); return c; }
    c = Art.mk(CH * TS, CH * TS, x => this.drawChunk(x, cx, cy));
    this.chunks.set(k, c); if (this.chunks.size > 36) this.chunks.delete(this.chunks.keys().next().value);
    return c;
  },
  drawChunk(c, cx, cy) {
    const x0 = cx * CH, y0 = cy * CH, px0 = x0 * TS, py0 = y0 * TS, S = CH * TS;
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) this.drawTile(c, x, y, (x - x0) * TS, (y - y0) * TS);
    // rayas de las vías principales (siguen la geometría real)
    const seen = new Set();
    for (const ln of this.lanesNear(px0 + S / 2, py0 + S / 2)) {
      if (seen.has(ln.pts) || ln.dir < 0) continue; seen.add(ln.pts);
      const col = ln.cls === 't' ? '#ffd166' : '#d8d8d0';
      let hint = 0; for (let s = 0; s < ln.len; s += 1) { if (s % 14 >= 7) continue; const q = this.at(ln, s, 0, hint); hint = q.i; if (q.x < px0 - 2 || q.y < py0 - 2 || q.x > px0 + S + 2 || q.y > py0 + S + 2) continue; prect(c, q.x - px0, q.y - py0, 1, 1, col); }
    }
    // cebras junto a los semáforos
    for (const g of this.lights) {
      if (g.x < px0 - 20 || g.y < py0 - 20 || g.x > px0 + S + 20 || g.y > py0 + S + 20) continue;
      for (const [dx, dy] of [[-15 * WK, 0], [15 * WK, 0], [0, -15 * WK], [0, 15 * WK]]) { const x = g.x + dx - px0, y = g.y + dy - py0; if (!TRUCK_OK[this.get(Math.floor((g.x + dx) / TS), Math.floor((g.y + dy) / TS))]) continue; for (let k = -6; k <= 6; k += 3) dx ? prect(c, x - 2, y + k, 5, 2, '#e8e8e0') : prect(c, x + k, y - 2, 2, 5, '#e8e8e0'); }
    }
    c.imageSmoothingEnabled = false; LANDMARKS.forEach((L, i) => { if (L.x + L.w < x0 || L.x > x0 + CH || L.y + L.h < y0 || L.y > y0 + CH) return; c.drawImage(this.landmarkCanvas(i), (L.x - x0) * TS, (L.y - y0) * TS, L.w * TS, L.h * TS); });
    // árboles
    for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CH; x++) {
      const v = this.get(x, y), r = h2(x, y, 5); let rad = 0;
      if (v === TT.GRASS && r < .3 && !this.lid.has(this.idx(x, y))) rad = 5 + (r < .1 ? 2 : 0);
      else if (v === TT.WALK && r < .12) rad = 4;
      if (!rad) continue;
      const px = (x - x0) * TS + TS / 2, py = (y - y0) * TS + TS / 2, g = h2(x, y, 6), col = g < .05 ? '#f2c230' : g < .09 ? '#e88ab8' : '#3f8a3f';
      pdisc(c, px + 1, py + 1, rad, '#0003'); pdisc(c, px, py, rad, col); pdisc(c, px - 1, py - 1, Math.max(1, rad - 2), g < .09 ? '#fff3a066' : '#5fae4f');
    }
    // tranvía (rieles) y viaductos del metro
    const inC = q => q.x > px0 - 12 && q.y > py0 - 12 && q.x < px0 + S + 12 && q.y < py0 + S + 12;
    const T = this.tram; for (let s = 0; s < T.len; s += 1) { const q = this.at(T, s); if (!inC(q)) continue; const nx = -Math.sin(q.a), ny = Math.cos(q.a); if (s % 5 === 0) for (let k = -5; k <= 5; k++) prect(c, q.x - px0 + nx * k, q.y - py0 + ny * k, 1, 1, '#5d5446'); prect(c, q.x - px0 + nx * 3, q.y - py0 + ny * 3, 1, 1, '#a7adb5'); prect(c, q.x - px0 - nx * 3, q.y - py0 - ny * 3, 1, 1, '#a7adb5'); }
    for (const L of [this.lineA, this.lineB]) {
      for (let s = 0; s < L.len; s += 1) {
        const q = this.at(L, s); if (!inC(q)) continue; const nx = -Math.sin(q.a), ny = Math.cos(q.a), x = q.x - px0, y = q.y - py0;
        for (let k = -6; k <= 6; k++) prect(c, x + nx * k + 3, y + ny * k + 4, 1, 1, '#00000022');
        for (let k = -6; k <= 6; k++) prect(c, x + nx * k, y + ny * k, 1, 1, Math.abs(k) === 6 ? '#8d939c' : Math.abs(k) === 3 ? '#7d838c' : '#c9ccd1');
        if (s % 64 === 0) prect(c, x - 2, y - 2, 5, 5, '#00000044');
      }
      for (const st of L.st) { const q = this.at(L, st.s); if (!inC(q)) continue; c.save(); c.translate(Math.round(q.x - px0), Math.round(q.y - py0)); c.rotate(Math.round(q.a / (Math.PI / 4)) * Math.PI / 4); prect(c, -20, -11, 40, 22, '#e8ebef'); prect(c, -20, -11, 40, 3, L === this.lineA ? PAL.vd : PAL.cie); prect(c, -20, 8, 40, 3, L === this.lineA ? PAL.vd : PAL.cie); prect(c, -16, -3, 32, 6, '#7d838c'); prect(c, -18, -8, 4, 4, '#f4f4f4'); prect(c, 14, 4, 4, 4, '#f4f4f4'); c.restore(); }
    }
    this.relief(c, x0, y0);
  },
  /* sombras del relieve (luz del noroeste) y curvas de nivel suaves en el campo: el "dibujo 2D" sobre el pixel */
  relief(c, x0, y0) {
    const S = CH * TS, img = c.getImageData(0, 0, S, S), d = img.data;
    for (let j = 0; j < S; j += 2) for (let i = 0; i < S; i += 2) {
      const tx = x0 + i / TS, ty = y0 + j / TS, e = this.elevT(tx, ty), gx = (this.elevT(tx + .5, ty) - this.elevT(tx - .5, ty)) / VM.tile, gy = (this.elevT(tx, ty + .5) - this.elevT(tx, ty - .5)) / VM.tile;
      let f = 1 + clamp((gx + gy) * 1.1, -.32, .26) - Math.min(.12, Math.hypot(gx, gy) * .15);
      const v = this.get(x0 + (i >> 3), y0 + (j >> 3));
      if (v === TT.GRASS || v === TT.MOUNT) { const b = Math.floor(e / 25), bx = Math.floor(this.elevT(tx + .25, ty) / 25), by = Math.floor(this.elevT(tx, ty + .25) / 25); if (b !== bx || b !== by) f *= (b % 4 === 0 ? .8 : .9); }
      if (f === 1) continue;
      for (let k = 0; k < 4; k++) { const o = ((j + (k >> 1)) * S + i + (k & 1)) * 4; d[o] = Math.min(255, d[o] * f); d[o + 1] = Math.min(255, d[o + 1] * f); d[o + 2] = Math.min(255, d[o + 2] * f); }
    }
    c.putImageData(img, 0, 0);
  },
  drawTile(c, x, y, px, py) {
    // casilla de 16 px = 20 m. Calles con andén y sardinel, esquinas redondeadas; edificios por manzana.
    const v = this.get(x, y), r = h2(x, y), R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(px + a, py + b, w, h); };
    const rd = vv => vv === TT.ROAD || vv === TT.AVE || vv === TT.AUTO || vv === TT.BRIDGE || vv === TT.DEPOT;
    switch (v) {
      case TT.GRASS: {
        R(0, 0, 16, 16, r < .5 ? '#5d9c4b' : '#62a350');
        for (let i = 0; i < 4; i++) R((h2(x, y, 2 + i) * 14) | 0, (h2(x, y, 9 + i) * 14) | 0, 2, 1, '#78b862');
        if (h2(x, y, 4) < .06) { R(5, 6, 1, 1, h2(x, y, 7) < .5 ? '#ffd84a' : '#ff8fc7'); R(10, 11, 1, 1, '#fff3a0'); }
        break;
      }
      case TT.MOUNT: {
        R(0, 0, 16, 16, '#2f6b3a');
        for (let i = 0; i < 3; i++) { const a = 3 + ((h2(x, y, 10 + i) * 10) | 0), b = 3 + ((h2(x, y, 20 + i) * 10) | 0); pdisc(c, px + a + 1, py + b + 1, 3, '#245530'); pdisc(c, px + a, py + b, 3, i ? '#3a7d44' : '#34763f'); R(a - 1, b - 2, 2, 1, '#4a8f4f'); }
        if (r < .015) R(7, 6, 3, 3, '#c9683f');
        break;
      }
      case TT.BRICK: {   // casas de ladrillo de las laderas, con terraza y tanque de agua
        const cols = ['#b45a36', '#c9683f', '#a84f30', '#9c6b4e', '#d8d2c4', '#8e959c'];
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
          const k = h2(x * 2 + i, y * 2 + j, 3), col = cols[(k * cols.length) | 0], X0 = i * 8, Y0 = j * 8;
          R(X0, Y0, 8, 8, col); R(X0, Y0 + 7, 8, 1, shade(col, -.3)); R(X0 + 7, Y0, 1, 8, shade(col, -.25)); R(X0, Y0, 8, 1, shade(col, .18));
          if (k < .35) R(X0 + 1, Y0 + 3, 6, 1, shade(col, -.15));
          if (h2(x * 2 + i, y * 2 + j, 4) < .25) { R(X0 + 2, Y0 + 2, 3, 3, '#3f6fd8'); R(X0 + 2, Y0 + 2, 3, 1, '#7aa0ef'); }
          else if (h2(x * 2 + i, y * 2 + j, 5) < .2) R(X0 + 4, Y0 + 4, 2, 2, '#2b2f38');
        }
        break;
      }
      case TT.BLDG: {
        const d = this.district(x, y), lk = (xx, yy) => (Math.floor((xx + ((h2(Math.floor(yy / 3), 9) * 2) | 0)) / 3)) * 1000 + Math.floor(yy / 3);
        const my = lk(x, y), pal = d === 'centro' ? ['#c9c5bd', '#b3b7bd', '#8fa6bf', '#d8d4cb', '#a5aab2', '#c0623b'] : d === 'poblado' ? ['#e6e6e1', '#9fb8cf', '#c9ced6', '#7f9cb8', '#d9d4c8'] : d === 'laureles' ? ['#c0623b', '#b4552f', '#cf7a4f', '#d9d2c4', '#a85b3c'] : ['#b9653f', '#c9683f', '#9aa0a6', '#d8d2c4', '#a84f30', '#c4b49a'];
        const hh = h2(my, 7, 1), col = pal[(hh * pal.length) | 0], tall = (d === 'centro' || d === 'poblado') && h2(my, 8, 2) < .4;
        R(0, 0, 16, 16, col);
        if (tall) { for (let i = 2; i < 16; i += 4) R(i, 2, 2, 12, shade(col, -.12)); }
        else { const k = h2(x, y, 9); if (k < .15) { R(4, 4, 4, 4, '#3f6fd8'); R(4, 4, 4, 1, '#7aa0ef'); } else if (k < .3) { R(9, 5, 3, 2, '#8e959c'); R(9, 5, 3, 1, '#c9ced6'); } else if (k < .36) R(3, 9, 6, 4, '#4f8f45'); }
        const n = (xx, yy) => this.get(xx, yy) === TT.BLDG && lk(xx, yy) === my;
        if (!n(x, y - 1)) R(0, 0, 16, 2, shade(col, .25)); if (!n(x - 1, y)) R(0, 0, 2, 16, shade(col, .15));
        if (!n(x, y + 1)) { R(0, 14, 16, 2, shade(col, tall ? -.5 : -.3)); } if (!n(x + 1, y)) R(14, 0, 2, 16, shade(col, tall ? -.45 : -.25));
        break;
      }
      case TT.ROAD: case TT.AVE: case TT.AUTO: case TT.BRIDGE: case TT.DEPOT: {
        const base = v === TT.AUTO ? '#30364a' : v === TT.DEPOT ? '#8d97a5' : v === TT.AVE ? '#3a4152' : '#3d4454';
        if (v === TT.DEPOT) { R(0, 0, 16, 16, base); if ((x + y) % 2 === 0) R(2, 7, 12, 1, '#ffd166'); break; }
        const n = [this.get(x, y - 1), this.get(x + 1, y), this.get(x, y + 1), this.get(x - 1, y)].map(rd), d = [rd(this.get(x + 1, y - 1)), rd(this.get(x + 1, y + 1)), rd(this.get(x - 1, y + 1)), rd(this.get(x - 1, y - 1))];
        const a0 = v === TT.ROAD ? 4 : v === TT.AVE ? 2 : 1, a1 = 16 - a0, side = v === TT.BRIDGE ? '#c9ccd1' : '#bab6a8', curb = v === TT.BRIDGE ? '#9aa0a8' : '#8d897c';
        if (v === TT.BRIDGE) R(0, 0, 16, 16, '#3d7c8c'); else R(0, 0, 16, 16, side);
        // asfalto: núcleo + brazos hacia las vías vecinas + rellenos de esquina
        const rects = [[a0, a0, a1 - a0, a1 - a0]];
        if (n[0]) rects.push([a0, 0, a1 - a0, a0]); if (n[2]) rects.push([a0, a1, a1 - a0, 16 - a1]); if (n[3]) rects.push([0, a0, a0, a1 - a0]); if (n[1]) rects.push([a1, a0, 16 - a1, a1 - a0]);
        if (n[0] && n[1] && d[0]) rects.push([a1, 0, 16 - a1, a0]); if (n[1] && n[2] && d[1]) rects.push([a1, a1, 16 - a1, 16 - a1]); if (n[2] && n[3] && d[2]) rects.push([0, a1, a0, 16 - a1]); if (n[3] && n[0] && d[3]) rects.push([0, 0, a0, a0]);
        if (v !== TT.BRIDGE) for (const [a, b, w, h] of rects) { const X0 = Math.max(0, a - 1), Y0 = Math.max(0, b - 1); R(X0, Y0, Math.min(16, a + w + 1) - X0, Math.min(16, b + h + 1) - Y0, curb); }
        for (const [a, b, w, h] of rects) R(a, b, w, h, base);
        // esquinas redondeadas: el andén se curva donde dos calles doblan
        if (a0 > 1) {
          const fil = (cx, cy) => { R(cx, cy, 1, 1, base); };
          if (n[0] && n[1] && !d[0]) { fil(a1, a0 - 1); fil(a1, a0 - 2); fil(a1 + 1, a0 - 1); }
          if (n[1] && n[2] && !d[1]) { fil(a1, a1); fil(a1, a1 + 1); fil(a1 + 1, a1); }
          if (n[2] && n[3] && !d[2]) { fil(a0 - 1, a1); fil(a0 - 1, a1 + 1); fil(a0 - 2, a1); }
          if (n[3] && n[0] && !d[3]) { fil(a0 - 1, a0 - 1); fil(a0 - 1, a0 - 2); fil(a0 - 2, a0 - 1); }
          // núcleo sin salida por dos lados: la esquina exterior del asfalto se redondea
          if (!n[0] && !n[3]) R(a0, a0, 1, 1, curb); if (!n[0] && !n[1]) R(a1 - 1, a0, 1, 1, curb); if (!n[2] && !n[1]) R(a1 - 1, a1 - 1, 1, 1, curb); if (!n[2] && !n[3]) R(a0, a1 - 1, 1, 1, curb);
        }
        if (r < .35) R(5 + ((h2(x, y, 2) * 6) | 0), 5 + ((h2(x, y, 3) * 6) | 0), 1, 1, shade(base, .1));
        if (r > .93) R(4 + ((h2(x, y, 6) * 7) | 0), 6, 2, 1, shade(base, -.15));   // parche
        if (v === TT.AUTO) { const yl = '#ffd166'; if (!n[0]) R(a0, a0, a1 - a0, 1, yl); if (!n[2]) R(a0, a1 - 1, a1 - a0, 1, yl); if (!n[3]) R(a0, a0, 1, a1 - a0, yl); if (!n[1]) R(a1 - 1, a0, 1, a1 - a0, yl); }
        if (v === TT.BRIDGE) { const w = '#dfe3e8'; if (!n[0] && !n[2]) { R(0, a0 - 1, 16, 1, w); R(0, a1, 16, 1, w); } if (!n[1] && !n[3]) { R(a0 - 1, 0, 1, 16, w); R(a1, 0, 1, 16, w); } }
        break;
      }
      case TT.WALK: {
        R(0, 0, 16, 16, '#c2beb0'); for (let i = 0; i < 16; i += 4) { R(0, i, 16, 1, '#b4b0a2'); R(((i / 4) & 1) * 2 + i % 8, 0, 1, 16, '#b8b4a6'); }
        if (rd(this.get(x, y - 1))) R(0, 0, 16, 2, '#8d897c'); if (rd(this.get(x, y + 1))) R(0, 14, 16, 2, '#8d897c');
        if (rd(this.get(x - 1, y))) R(0, 0, 2, 16, '#8d897c'); if (rd(this.get(x + 1, y))) R(14, 0, 2, 16, '#8d897c');
        break;
      }
      case TT.STEPS: R(0, 0, 16, 16, '#a8a396'); for (let i = 1; i < 16; i += 3) R(1, i, 14, 1, '#8c877a'); R(0, 0, 1, 16, '#6f6a5e'); R(15, 0, 1, 16, '#6f6a5e'); R(2, 0, 1, 16, '#c9c4b6'); break;
      case TT.CICLO: {
        R(0, 0, 16, 16, '#4a9a2c'); if (r < .4) R(3 + ((h2(x, y, 2) * 10) | 0), 3 + ((h2(x, y, 3) * 10) | 0), 1, 1, '#55a634');
        const cc = vv => vv === TT.CICLO, N = cc(this.get(x, y - 1)), S = cc(this.get(x, y + 1)), W = cc(this.get(x - 1, y)), E = cc(this.get(x + 1, y));
        if (!N) R(0, 0, 16, 2, '#9bd341'); if (!S) R(0, 14, 16, 2, '#9bd341'); if (!W) R(0, 0, 2, 16, '#9bd341'); if (!E) R(14, 0, 2, 16, '#9bd341');
        if ((N || S) && !(W || E)) { if ((y & 1) === 0) R(7, 3, 2, 6, '#eaf7d4'); } else if ((W || E) && !(N || S)) { if ((x & 1) === 0) R(3, 7, 6, 2, '#eaf7d4'); }
        if (h2(x, y, 31) < .05) { pring(c, px + 5, py + 9, 2, '#eaf7d4'); pring(c, px + 11, py + 9, 2, '#eaf7d4'); R(6, 6, 5, 1, '#eaf7d4'); }
        break;
      }
      case TT.WATER: {
        R(0, 0, 16, 16, '#3d7c8c'); if (r < .6) R((h2(x, y, 2) * 10) | 0, (h2(x, y, 3) * 14) | 0, 5, 1, '#5b9aa8'); if (r > .8) R(3, 10, 3, 1, '#7fb6c0');
        const wa = vv => vv === TT.WATER || vv === TT.BRIDGE || vv === TT.CANAL;
        if (!wa(this.get(x, y - 1))) R(0, 0, 16, 2, '#2f6370'); if (!wa(this.get(x, y + 1))) R(0, 14, 16, 2, '#2f6370'); if (!wa(this.get(x - 1, y))) R(0, 0, 2, 16, '#2f6370'); if (!wa(this.get(x + 1, y))) R(14, 0, 2, 16, '#2f6370');
        break;
      }
      case TT.CANAL: R(0, 0, 16, 16, '#9a9a92'); R(3, 3, 10, 10, '#4f8796'); R(3, 3, 10, 1, '#3d6f7c'); if (r < .5) R(5, 7, 4, 1, '#6aa3b0'); break;
      case TT.PLAZA: R(0, 0, 16, 16, '#ddd3b8'); R(0, 0, 8, 8, '#d3c8aa'); R(8, 8, 8, 8, '#d3c8aa'); R(0, 7, 16, 1, '#cbbf9f'); R(7, 0, 1, 16, '#cbbf9f'); break;
      case TT.STATION: {
        R(0, 0, 16, 16, '#eef2f5'); R(0, 14, 16, 2, '#dde3e8');
        if (this.get(x, y - 1) !== TT.STATION) R(0, 0, 16, 3, PAL.vd); if (this.get(x, y + 1) !== TT.STATION) R(0, 14, 16, 2, PAL.vd2);
        if (this.get(x - 1, y) !== TT.STATION) R(0, 0, 2, 16, PAL.vd); if (this.get(x + 1, y) !== TT.STATION) R(14, 0, 2, 16, PAL.vd);
        break;
      }
      case TT.LAND: R(0, 0, 16, 16, '#7e8a99'); break;
    }
  },
  landmarkCanvas: null   // en 21-map-art.js
};
