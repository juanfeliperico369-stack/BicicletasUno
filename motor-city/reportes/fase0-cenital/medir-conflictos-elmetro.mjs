#!/usr/bin/env node
/* Fase 0 · medición de solo lectura: ¿cuántas huellas de edificio de El Metro (src/data/edificios.js) pisan los corredores
   viales (src/data/vias.js)? Decodifica los datos igual que el juego (11-ciudad2.js · init y 11-edificios.js · edifDe) y mide
   con dos reglas de corredor:
     A) la del juego hoy (11-edificios.js · segsCelda): radio = max(1, w/2 + 1,3) en calles de carros (k 1-4) y w/2 + 0,3 en
        peatonales y escalas (k 6-7); las ciclorrutas (k 5) no se despejan;
     B) la del prompt maestro: radio = w/2 + andén con los anchos «jugables» por jerarquía.
   Además estima el «relleno por casillas» del anillo lejano 3D (22-gl.js · buildNear): casillas BLDG/BRICK de 20 m cuya caja
   máxima (21 × 19 m con zócalo) toca un corredor A. No modifica nada.
   Uso: node reportes/fase0-cenital/medir-conflictos-elmetro.mjs ../MetroZero > conflictos-elmetro.json   (34 s, Node 22, sin dependencias) */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import zlib from 'node:zlib';
const RAIZ = path.resolve(process.argv[2] || '.');
const carga = (f, nombres) => { const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(RAIZ, 'src/data', f), 'utf8') + '\n;' + nombres.map(n => `this.${n}=${n};`).join(''), ctx); return ctx; };
const inflar = (b64) => zlib.inflateRawSync(Buffer.from(b64, 'base64'));
const t0 = Date.now();
/* ---------- vías ---------- */
const { VIAS } = carga('vias.js', ['VIAS']);
const DEFW = { 1: 7, 2: 15, 3: 12, 4: 10, 5: 2.5, 6: 5, 7: 3 };
const vb = inflar(VIAS.d); let o = 0, px = 0, py = 0;
const rv = () => { let v = 0, sh = 0, c; do { c = vb[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; }, uz = v => v % 2 ? -(v + 1) / 2 : v / 2;
const vias = [];
for (let i = 0; i < VIAS.n; i++) { const k = rv(), nm = rv(), w2 = rv(), np = rv(), P = new Float32Array(np * 2); for (let j = 0; j < np; j++) { px += uz(rv()); py += uz(rv()); P[2 * j] = px * VIAS.u; P[2 * j + 1] = py * VIAS.u; } vias.push({ k, w: w2 / 2 || DEFW[k] || 6, P }); }
/* reglas de corredor */
const radioA = v => (v.k <= 4 ? Math.max(1, v.w / 2 + 1.3) : (v.k === 6 || v.k === 7) ? Math.max(1, v.w / 2 + .3) : 0);
const JER = { 3: [22, 3], 2: [15, 2.5], 4: [11, 2], 1: [8.5, 1.5], 5: [3.5, .8], 6: [null, 0], 7: [null, 0] };   // autopista, avenida, carrera, calle, ciclorruta, peatonal, escalas
const radioB = v => { const [w, m] = JER[v.k] || [null, 0]; return (w == null ? v.w : Math.max(w, v.w)) / 2 + m; };   // nunca más angosta que la real
const cuentaK = {}; for (const v of vias) cuentaK[v.k] = (cuentaK[v.k] || 0) + 1;
/* ---------- edificios ---------- */
const { EDIFICIOS: E } = carga('edificios.js', ['EDIFICIOS']);
const b = inflar(E.data); if (b.length < E.raw) throw new Error('edificios: inflado corto');
const nR = E.nx * E.ny, cnt = new Int32Array(nR), i0 = new Int32Array(nR), p0 = new Int32Array(nR), q0 = new Int32Array(nR); o = 0; let ci = 0, cp = 0, cq = 0;
const rvb = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
for (let r = 0; r < nR; r++) { cnt[r] = rvb(); const pb = rvb(), qb = rvb(); i0[r] = ci; p0[r] = cp; q0[r] = cq; ci += cnt[r]; cp += pb; cq += qb; }
const Ls = E.len, oPos = Ls[0], oDim = oPos + Ls[1], oAng = oDim + Ls[2], oPis = oAng + Ls[3], oKin = oPis + Ls[4], oPol = oKin + Ls[5];
const enPol = (P, x, y) => { const n = P.length / 2; let d = false; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d; } return d; };
const R = E.R, Q = E.Q, PASO = .5, MG = 64, RES = .5, NB = Math.round((R + 2 * MG) / RES);
/* tramos por región (con margen) para cada regla */
const porRegion = (radio) => { const G = new Map(); for (const v of vias) { const r = radio(v); if (!r) continue; const P = v.P; for (let j = 2; j < P.length; j += 2) { const ax = P[j - 2], ay = P[j - 1], bx = P[j], by = P[j + 1]; for (let gy = Math.floor((Math.min(ay, by) - r - MG) / R); gy <= Math.floor((Math.max(ay, by) + r + MG) / R); gy++) for (let gx = Math.floor((Math.min(ax, bx) - r - MG) / R); gx <= Math.floor((Math.max(ax, bx) + r + MG) / R); gx++) { const key = gx * 65536 + gy; let L = G.get(key); if (!L) G.set(key, L = []); L.push(ax, ay, bx, by, r, v.k); } } } return G; };
const RA = porRegion(radioA), RB = porRegion(radioB), bmA = new Uint8Array(NB * NB), bmB = new Uint8Array(NB * NB);
const rasteriza = (bm, L, X0, Y0) => { bm.fill(0); if (!L) return; for (let i = 0; i < L.length; i += 6) { const ax = L[i], ay = L[i + 1], bx = L[i + 2], by = L[i + 3], r = L[i + 4], k = L[i + 5], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, r2 = r * r;
  const gx0 = Math.max(0, Math.floor((Math.min(ax, bx) - r - X0) / RES)), gx1 = Math.min(NB - 1, Math.floor((Math.max(ax, bx) + r - X0) / RES)), gy0 = Math.max(0, Math.floor((Math.min(ay, by) - r - Y0) / RES)), gy1 = Math.min(NB - 1, Math.floor((Math.max(ay, by) + r - Y0) / RES));
  for (let gy = gy0; gy <= gy1; gy++) { const py = Y0 + (gy + .5) * RES; for (let gx = gx0; gx <= gx1; gx++) { const j = gy * NB + gx; if (bm[j]) continue; const px = X0 + (gx + .5) * RES, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)), qx = ax + dx * t - px, qy = ay + dy * t - py; if (qx * qx + qy * qy < r2) bm[j] = k; } } } };
const lee = (bm, X0, Y0, x, y) => { const gx = Math.floor((x - X0) / RES), gy = Math.floor((y - Y0) / RES); return gx < 0 || gy < 0 || gx >= NB || gy >= NB ? 0 : bm[gy * NB + gx]; };
const est = () => ({ tocan: 0, centroEnVia: 0, area: 0, cubos: { '<0,3 m²': 0, '0,3–2 m²': 0, '2–10 m²': 0, '10–50 m²': 0, '>50 m²': 0 }, porTipoVia: {}, fraccionMediaTocados: 0 });
const SA = est(), SB = est(); let total = 0, conPol = 0, areaTotal = 0;
const cubo = (S, a) => { S.cubos[a < .3 ? '<0,3 m²' : a < 2 ? '0,3–2 m²' : a < 10 ? '2–10 m²' : a < 50 ? '10–50 m²' : '>50 m²']++; };
const muestraA = [], muestraB = [];
/* casillas de 20 m (para el relleno del anillo lejano) */
const VC = {}; vm.createContext(VC); vm.runInContext(fs.readFileSync(path.join(RAIZ, 'src/data/valle.js'), 'utf8') + '\n;this.VALLE_META=VALLE_META;this.VALLE_BIN=VALLE_BIN;', VC);
const W = VC.VALLE_META.W, H = VC.VALLE_META.H, T = inflar(VC.VALLE_BIN).subarray(0, W * H), TM = 20;
let celdasEd = 0, celdasToca = 0;
for (let ry = 0; ry < E.ny; ry++) for (let rx = 0; rx < E.nx; rx++) {
  const r = ry * E.nx + rx, n = cnt[r], X0 = rx * R, Y0 = ry * R, BX = X0 - MG, BY = Y0 - MG, key = rx * 65536 + ry;
  const LA = RA.get(key), LB = RB.get(key); rasteriza(bmA, LA, BX, BY); rasteriza(bmB, LB, BX, BY);
  /* relleno por casillas: casillas BLDG (3) o BRICK (2) con centro en la región */
  for (let ty = Math.floor(Y0 / TM); ty < Math.min(H, Math.floor((Y0 + R) / TM)); ty++) for (let tx = Math.floor(X0 / TM); tx < Math.min(W, Math.floor((X0 + R) / TM)); tx++) { const v = T[ty * W + tx]; if (v !== 2 && v !== 3) continue; celdasEd++; const cx = tx * TM + 10, cy = ty * TM + 10; let toca = false; for (let dy = -9.5; dy <= 9.5 && !toca; dy += 1) for (let dx = -10.5; dx <= 10.5; dx += 1) if (lee(bmA, BX, BY, cx + dx, cy + dy)) { toca = true; break; } if (toca) celdasToca++; }
  if (!n) continue;
  o = oPos + p0[r]; let q = oPol + q0[r], pa = 0; px = 0; py = 0;
  const rq = () => { let v = 0, sh = 0, c; do { c = b[q++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
  for (let j = 0; j < n; j++) {
    const i = i0[r] + j; px += uz(rvb()); py += uz(rvb());
    const hw = Math.max(.5, b[oDim + 2 * i] / Q), hd = Math.max(.5, b[oDim + 2 * i + 1] / Q); pa = (pa + b[oAng + i]) % 128;
    const an = (pa + .5) * Math.PI / 128, ux = Math.cos(an), uy = Math.sin(an), kf = b[oKin + i], x = X0 + px / Q, y = Y0 + py / Q;
    let P = null; if (kf & 16) { const nv = rq(); P = new Float32Array(nv * 2); let qx = px, qy = py; for (let v = 0; v < nv; v++) { qx += uz(rq()); qy += uz(rq()); P[2 * v] = X0 + qx / Q; P[2 * v + 1] = Y0 + qy / Q; } conPol++; }
    if ((kf & 15) === 10) continue;   // «techo» (cubiertas ligeras): el juego no las cuenta como sólidas
    total++;
    const na = Math.max(1, Math.round(2 * hw / PASO)), nd = Math.max(1, Math.round(2 * hd / PASO)); let nIn = 0, nA = 0, nB = 0, kA = 0, kB = 0;
    for (let ia = 0; ia < na; ia++) for (let id = 0; id < nd; id++) {
      const a = -hw + (ia + .5) * 2 * hw / na, d = -hd + (id + .5) * 2 * hd / nd, sx = x + ux * a - uy * d, sy = y + uy * a + ux * d;
      if (P && !enPol(P, sx, sy)) continue; nIn++;
      const ka = lee(bmA, BX, BY, sx, sy), kb = lee(bmB, BX, BY, sx, sy); if (ka) { nA++; kA = kA || ka; } if (kb) { nB++; kB = kB || kb; }
    }
    const cel = (2 * hw / na) * (2 * hd / nd), area = nIn * cel; areaTotal += area;
    for (const [S, nX, kX, bm, M] of [[SA, nA, kA, bmA, muestraA], [SB, nB, kB, bmB, muestraB]]) {
      if (!nX) continue; const ai = nX * cel; S.tocan++; S.area += ai; cubo(S, ai); S.porTipoVia[kX] = (S.porTipoVia[kX] || 0) + 1; S.fraccionMediaTocados += area ? ai / area : 0;
      if (lee(bm, BX, BY, x, y)) S.centroEnVia++;
      if (ai > 10 && M.length < 12 && ((i * 2654435761) >>> 0) % 997 === 0) M.push({ x: +x.toFixed(1), y: +y.toFixed(1), area_m2: +area.toFixed(1), invade_m2: +ai.toFixed(1), tipoVia: kX, poligono: !!P });
    }
  }
}
for (const S of [SA, SB]) { S.fraccionMediaTocados = +(S.fraccionMediaTocados / Math.max(1, S.tocan)).toFixed(3); S.area = Math.round(S.area); }
const salida = {
  fuente: { repo: 'MetroZero', vias: VIAS.n, viasPorTipo: cuentaK, edificios: E.n, conPoligono: conPol, sinTechoLigero: total, areaEdificiosM2: Math.round(areaTotal) },
  reglaA_juegoHoy: SA, reglaB_promptMaestro: SB,
  rellenoCasillasAnilloLejano: { casillasBLDGoBRICK: celdasEd, conCajaQueTocaCorredorA: celdasToca, nota: 'cajas de 21 × 19 m como máximo (l+4, w+4 de 22-gl.js); sin el parche de ciudad.js; solo se dibujan entre 700 y 1100 m de la cámara' },
  muestras: { A: muestraA, B: muestraB }, segundos: (Date.now() - t0) / 1000
};
console.log(JSON.stringify(salida, null, 1));
