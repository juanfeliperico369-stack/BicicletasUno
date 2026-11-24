#!/usr/bin/env node
/* PRUEBA DE GEOMETRÍA EN EL JUEGO (Motor del Valle 1.3.0) · Node, sin dependencias.
   Lee los datos EXPORTADOS tal como los lee el juego y comprueba la ley de soberanía vial:
     · 0 edificios que pisen un corredor de capa 0: regla A del autor (ancho / 2 + 1,3 m en calles de carros; + 0,3 m en peatonales,
       escalas y ciclorrutas), y el carril del Metroplús y la vía del tranvía si están los corredores del juego (tools/cache/corredores.json);
       geometría exacta: la distancia de cada borde del edificio a cada tramo del eje, con 2 cm de tolerancia;
     · 0 restos: ningún edificio recortado (bit 128) de menos de 12 m² (el mínimo de El Metro);
     · 0 casas en el agua (salida/sanear/agua.json, el agua a cielo abierto del saneamiento), con más de 0,05 m² adentro;
     · el peso: edificios.js ≤ 4,6 MB y el HTML de El Metro ≤ 9,5 MB (MB = 1.000.000 bytes, lo más estricto).
   El Metro: node motor-valle/pruebas/geometria.mjs --elmetro RUTA_ELMETRO [--agua salida/sanear/agua.json] [--html RUTA/dist/index.html]
   EnCicla:  node motor-valle/pruebas/geometria.mjs --encicla RUTA_ENCICLA [--agua …]   (edificios.bin + vias.bin; las casas confiables
             marcadas, que no se recortan, se cuentan aparte)
   Sale con 1 si algo falla. Imprime un JSON con las cifras. */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import zlib from 'node:zlib';
const A = process.argv.slice(2), opt = k => { const i = A.indexOf(k); return i >= 0 ? A[i + 1] : null; };
const AQUI = path.dirname(new URL(import.meta.url).pathname), SAN = path.join(AQUI, '..', 'salida', 'sanear');
const EM = opt('--elmetro'), EC = opt('--encicla'); if (!EM && !EC) { console.error('Uso: node motor-valle/pruebas/geometria.mjs --elmetro RUTA | --encicla RUTA'); process.exit(2); }
const AGUA = opt('--agua') || path.join(SAN, 'agua.json'), TOL = .02, MB = 1e6, t0 = Date.now();
const uz = v => v % 2 ? -(v + 1) / 2 : v / 2;
const lector = b => { let o = 0; const f = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; }; f.pos = () => o; f.ir = p => { o = p; }; return f; };
const DEFW = { 1: 7, 2: 15, 3: 12, 4: 10, 5: 2.5, 6: 5, 7: 3 }, radioA = (k, w) => Math.max(1, w / 2 + (k <= 4 ? 1.3 : .3));
const fallos = [], res = { regla: 'A (el real; con ciclorrutas)', tolerancia_m: TOL };

/* ---------- vías (como 11-ciudad2.js · init de El Metro, o 20-map.js · parseVias de EnCicla), en metros ---------- */
const vias = [];
if (EM) {
  const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(EM, 'src/data/vias.js'), 'utf8') + ';this.VIAS=VIAS;', ctx); const V = ctx.VIAS;
  const b = zlib.inflateRawSync(Buffer.from(V.d, 'base64')), rv = lector(b); let px = 0, py = 0;
  for (let i = 0; i < V.n; i++) { const k = rv(), nm = rv(), w2 = rv(), np = rv(), P = new Float64Array(np * 2); for (let j = 0; j < np; j++) { px += uz(rv()); py += uz(rv()); P[2 * j] = px * V.u; P[2 * j + 1] = py * V.u; } vias.push({ k, w: w2 / 2 || DEFW[k] || 6, P }); }
  res.vias = { n: V.n, v: V.v || 1, unidad_m: V.u, cota_bytes: V.cota || 0 };
} else {
  const M = JSON.parse(fs.readFileSync(path.join(EC, 'src/data/valle.json'), 'utf8')), vb = zlib.inflateRawSync(fs.readFileSync(path.join(EC, 'src/data/vias.bin'))), dv = new DataView(vb.buffer, vb.byteOffset, vb.byteLength);
  const U = M.tile / M.vq; let o = 4; const n = dv.getUint32(0, true);
  for (let i = 0; i < n; i++) { const k = dv.getUint8(o), w = dv.getUint8(o + 5) / 2, np = dv.getUint16(o + 6, true); o += 8; const P = new Float64Array(np * 2); let x = 0, y = 0; for (let j = 0; j < np; j++, o += 4) { x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); P[2 * j] = x * U; P[2 * j + 1] = y * U; } if (k >= 1 && k <= 7) vias.push({ k, w: w || DEFW[k], P }); }
  res.vias = { n, unidad_m: U, cota_bytes: vb.length - o };
}
/* tramos con su radio, en una rejilla de 32 m */
const CEL = 32, rej = new Map(), segs = [];
const pon = (ax, ay, bx, by, r, k) => { const i = segs.length; segs.push([ax, ay, bx, by, r, k]); for (let gy = Math.floor((Math.min(ay, by) - r) / CEL); gy <= Math.floor((Math.max(ay, by) + r) / CEL); gy++) for (let gx = Math.floor((Math.min(ax, bx) - r) / CEL); gx <= Math.floor((Math.max(ax, bx) + r) / CEL); gx++) { const key = gx * 65536 + gy; let L = rej.get(key); if (!L) rej.set(key, L = []); L.push(i); } };
for (const v of vias) { if (v.k < 1 || v.k > 7) continue; const r = radioA(v.k, v.w); for (let j = 2; j < v.P.length; j += 2) pon(v.P[j - 2], v.P[j - 1], v.P[j], v.P[j + 1], r, v.k); }
const cor = EM && fs.existsSync(path.join(EM, 'tools/cache/corredores.json')) ? JSON.parse(fs.readFileSync(path.join(EM, 'tools/cache/corredores.json'), 'utf8')) : null;
if (cor) for (const l of cor.lineas) for (let j = 1; j < l.pts.length; j++) pon(l.pts[j - 1][0], l.pts[j - 1][1], l.pts[j][0], l.pts[j][1], l.r, l.kind === 'brt' ? 20 : 21);
res.corredores = { tramos: segs.length, metroplus_y_tranvia: !!cor };

/* ---------- geometría exacta ---------- */
const dSegSeg = (a, b, c, d, e, f, g, h) => {   // distancia entre los segmentos (a,b)-(c,d) y (e,f)-(g,h)
  const x = (p, q, r, s, t, u) => (r - p) * (u - q) - (s - q) * (t - p);
  const d1 = x(e, f, g, h, a, b), d2 = x(e, f, g, h, c, d), d3 = x(a, b, c, d, e, f), d4 = x(a, b, c, d, g, h);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return 0;
  const pt = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(ax + dx * t - px, ay + dy * t - py); };
  return Math.min(pt(a, b, e, f, g, h), pt(c, d, e, f, g, h), pt(e, f, a, b, c, d), pt(g, h, a, b, c, d));
};
const dentro = (P, x, y) => { const n = P.length / 2; let d = false; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d; } return d; };
const area = P => { let s = 0; const n = P.length / 2; for (let i = 0; i < n; i++) { const j = (i + 1) % n; s += P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; } return Math.abs(s) / 2; };
/* ¿el polígono P pisa algún corredor? -> la penetración máxima (m) o 0 */
const pisa = P => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < P.length; i += 2) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]); }
  const vistos = new Set(); let peor = 0, kk = 0;
  for (let gy = Math.floor((y0 - 1) / CEL); gy <= Math.floor((y1 + 1) / CEL); gy++) for (let gx = Math.floor((x0 - 1) / CEL); gx <= Math.floor((x1 + 1) / CEL); gx++) for (const s of rej.get(gx * 65536 + gy) || []) {
    if (vistos.has(s)) continue; vistos.add(s); const [ax, ay, bx, by, r, k] = segs[s];
    if (Math.max(ax, bx) + r < x0 || Math.min(ax, bx) - r > x1 || Math.max(ay, by) + r < y0 || Math.min(ay, by) - r > y1) continue;
    let d = dentro(P, ax, ay) || dentro(P, bx, by) ? 0 : 1e9; const n = P.length / 2;
    for (let i = 0; i < n && d > 0; i++) { const j = (i + 1) % n; d = Math.min(d, dSegSeg(P[2 * i], P[2 * i + 1], P[2 * j], P[2 * j + 1], ax, ay, bx, by)); }
    const pen = r - d; if (pen > peor) { peor = pen; kk = k; }
  }
  return [peor > TOL ? peor : 0, kk];
};

/* ---------- edificios (como 11-edificios.js · edifDe) ---------- */
let E, b, archivo;
if (EM) { archivo = path.join(EM, 'src/data/edificios.js'); const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(archivo, 'utf8') + ';this.E=EDIFICIOS;', ctx); E = ctx.E; b = zlib.inflateRawSync(Buffer.from(E.data, 'base64')); }
else { archivo = path.join(EC, 'src/data/edificios.bin'); E = JSON.parse(fs.readFileSync(path.join(EC, 'src/data/edificios.json'), 'utf8')); b = zlib.inflateRawSync(fs.readFileSync(archivo)); }
if (b.length < E.raw) throw new Error('edificios: inflado corto');
const nR = E.nx * E.ny, cnt = new Int32Array(nR), i0 = new Int32Array(nR), p0 = new Int32Array(nR), q0 = new Int32Array(nR); const ri = lector(b); let ci = 0, cp = 0, cq = 0;
for (let r = 0; r < nR; r++) { cnt[r] = ri(); const pb = ri(), qb = ri(); i0[r] = ci; p0[r] = cp; q0[r] = cq; ci += cnt[r]; cp += pb; cq += qb; }
const Ls = E.len, oPos = Ls[0], oDim = oPos + Ls[1], oAng = oDim + Ls[2], oPis = oAng + Ls[3], oKin = oPis + Ls[4], oPol = oKin + Ls[5], oMar = E.marcas ? oPol + Ls[6] + (Ls[7] || 0) : -1;
/* agua */
const aguaJ = fs.existsSync(AGUA) ? JSON.parse(fs.readFileSync(AGUA, 'utf8')) : null, ESC = aguaJ && aguaJ.unidad === 'cm' ? 100 : 10;
const agua = aguaJ ? aguaJ.trozos.map(rs => rs.map(r => Float64Array.from(r, v => v / ESC))) : null, rejA = new Map();
if (agua) agua.forEach((rs, i) => { const R = rs[0]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let j = 0; j < R.length; j += 2) { x0 = Math.min(x0, R[j]); x1 = Math.max(x1, R[j]); y0 = Math.min(y0, R[j + 1]); y1 = Math.max(y1, R[j + 1]); } rs.bb = [x0, y0, x1, y1]; for (let gy = Math.floor(y0 / CEL); gy <= Math.floor(y1 / CEL); gy++) for (let gx = Math.floor(x0 / CEL); gx <= Math.floor(x1 / CEL); gx++) { const k = gx * 65536 + gy; let L = rejA.get(k); if (!L) rejA.set(k, L = []); L.push(i); } });
const enAgua = (x, y) => { for (const i of rejA.get(Math.floor(x / CEL) * 65536 + Math.floor(y / CEL)) || []) { const rs = agua[i], bb = rs.bb; if (x < bb[0] || x > bb[2] || y < bb[1] || y > bb[3]) continue; if (dentro(rs[0], x, y) && !rs.slice(1).some(h => dentro(h, x, y))) return true; } return false; };
const aguaDe = (P, hw, hd) => {   // área (m²) del edificio dentro del agua, muestreando cada 0,25 m; solo si algún vértice o el centro cae cerca
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < P.length; i += 2) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]); }
  let cerca = false; for (let gy = Math.floor(y0 / CEL); gy <= Math.floor(y1 / CEL) && !cerca; gy++) for (let gx = Math.floor(x0 / CEL); gx <= Math.floor(x1 / CEL); gx++) if (rejA.has(gx * 65536 + gy)) { cerca = true; break; }
  if (!cerca) return 0; let n = 0; const p = .1;
  for (let y = y0 + p / 2; y < y1; y += p) for (let x = x0 + p / 2; x < x1; x += p) if (dentro(P, x, y) && enAgua(x, y)) n++;
  return n * p * p;
};
const S = { edificios: 0, pisan: 0, marcadas_que_pisan: 0, penetracion_max_m: 0, por_tipo: {}, recortados: 0, restos_menores_de_12: 0, recortados_de_12_a_16: 0, en_agua: 0, area_m2: 0, muestras: [] };
const m = cor ? (k => k) : null;
for (let ry = 0; ry < E.ny; ry++) for (let rx = 0; rx < E.nx; rx++) {
  const r = ry * E.nx + rx, n = cnt[r], X0 = rx * E.R, Y0 = ry * E.R; if (!n) continue;
  ri.ir(oPos + p0[r]); let q = oPol + q0[r], px = 0, py = 0, pa = 0;
  const rq = () => { let v = 0, sh = 0, c; do { c = b[q++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
  for (let j = 0; j < n; j++) {
    const i = i0[r] + j; px += uz(ri()); py += uz(ri());
    const hw = Math.max(.5, b[oDim + 2 * i] / E.Q), hd = Math.max(.5, b[oDim + 2 * i + 1] / E.Q); pa = (pa + b[oAng + i]) % 128;
    const an = (pa + .5) * Math.PI / 128, ux = Math.cos(an), uy = Math.sin(an), kf = b[oKin + i], x = X0 + px / E.Q, y = Y0 + py / E.Q;
    let P;
    if (kf & 16) { const nv = rq(); P = new Float64Array(nv * 2); let qx = px, qy = py; for (let v = 0; v < nv; v++) { qx += uz(rq()); qy += uz(rq()); P[2 * v] = X0 + qx / E.Q; P[2 * v + 1] = Y0 + qy / E.Q; } }
    else P = Float64Array.of(x - ux * hw + uy * hd, y - uy * hw - ux * hd, x + ux * hw + uy * hd, y + uy * hw - ux * hd, x + ux * hw - uy * hd, y + uy * hw + ux * hd, x - ux * hw - uy * hd, y - uy * hw + ux * hd);
    const marcada = oMar >= 0 && b[oMar + i] & 1, a = area(P); S.edificios++; S.area_m2 += a;
    if (kf & 128) { S.recortados++; if (a < 12 - 1e-6) S.restos_menores_de_12++; else if (a < 16) S.recortados_de_12_a_16++; }
    const [pen, k] = pisa(P);
    if (pen > 0) { if (marcada) S.marcadas_que_pisan++; else { S.pisan++; S.por_tipo[k] = (S.por_tipo[k] || 0) + 1; S.penetracion_max_m = Math.max(S.penetracion_max_m, +pen.toFixed(2)); if (S.muestras.length < 12) S.muestras.push({ x: +x.toFixed(1), y: +y.toFixed(1), penetracion_m: +pen.toFixed(2), via: k, poligono: !!(kf & 16), recortado: !!(kf & 128) }); } }
    if (agua) { const w = aguaDe(P, hw, hd); if (w > .05) { S.en_agua++; if (S.muestras.length < 24) S.muestras.push({ x: +x.toFixed(1), y: +y.toFixed(1), agua_m2: +w.toFixed(3), poligono: !!(kf & 16), recortado: !!(kf & 128) }); } }
  }
}
S.area_m2 = Math.round(S.area_m2); res.edificios = S;
if (S.pisan) fallos.push(S.pisan + ' edificios pisan un corredor de capa 0');
if (S.restos_menores_de_12) fallos.push(S.restos_menores_de_12 + ' restos recortados de menos de 12 m²');
if (!agua) fallos.push('falta el agua (' + AGUA + '): corre node motor-valle/motor.mjs sanear'); else if (S.en_agua) fallos.push(S.en_agua + ' casas en el agua');
/* peso */
const peso = { archivo: path.basename(archivo), bytes: fs.statSync(archivo).size };
if (EM) {
  peso.tope = 4.6 * MB; if (peso.bytes > peso.tope) fallos.push(`edificios.js pesa ${peso.bytes} bytes (tope ${peso.tope})`);
  const html = opt('--html') || path.join(EM, 'dist/index.html');
  if (fs.existsSync(html)) { peso.html = fs.statSync(html).size; peso.tope_html = 9.5 * MB; if (peso.html > peso.tope_html) fallos.push(`el HTML pesa ${peso.html} bytes (tope ${peso.tope_html})`); }
  else fallos.push('falta el HTML (' + html + '): node tools/build.mjs en El Metro');
}
res.peso = peso; res.segundos = (Date.now() - t0) / 1000; res.fallos = fallos; res.resultado = fallos.length ? 'FALLA' : 'BIEN';
console.log(JSON.stringify(res, null, 1));
process.exit(fallos.length ? 1 : 0);
