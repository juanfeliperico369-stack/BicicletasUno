#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · F1 · FUSIÓN DEL MUNDO 2.0
   Junta en un solo archivo de datos (contenedor MC4) lo mejor que ya generaron los dos juegos
   sobre el MISMO origen de coordenadas (lon0, latN):
     · Juega EnCicla (casillas de 10 m): suelo, relieve, municipio/comuna/barrio, pisos y lotes (valle.bin),
       calles con nombre y nomenclatura (vias.bin), 1.203 sitios y 5.314 edificios con forma y partes de
       los emblemáticos (sitios.bin), viaducto, puentes y túneles (alturas.json), carriles y semáforos,
       Metroplús, lugares con postal y las 133 estaciones EnCicla.
     · El Metro (metros): TODAS las huellas (639.457 casas y edificios, edificios.js), hitos con su huella
       (hitos.js), 2.176 puentes y deprimidos con ancho y altura (puentes.js), red completa (red.js),
       eje real de los rieles (rieles.js), corredores y andenes del Metroplús, rutas de bus por calles.
   Todo queda en METROS del mapa (x hacia el oriente, y hacia el sur) salvo las capas binarias que
   conservan su formato (el cargador js/10-mundo.js las convierte).

   Uso: node herramientas/fusionar.mjs [--encicla ../BicicletasUno] [--elmetro ../MetroZero] [--ciudad medellin]
   Salida: datos/<ciudad>/mundo.mc4 y datos/<ciudad>/resumen.json
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib'; import vm from 'node:vm'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ENC = path.resolve(arg('--encicla', path.join(RAIZ, '..', 'BicicletasUno')));
const EM = path.resolve(arg('--elmetro', path.join(RAIZ, '..', 'MetroZero')));
const CIUDAD = arg('--ciudad', 'medellin');
const CFG = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades', CIUDAD + '.json'), 'utf8'));
const OUT = path.join(RAIZ, 'datos', CIUDAD); fs.mkdirSync(OUT, { recursive: true });
const t0 = Date.now(), log = (...a) => console.log('·', ...a);

/* ---------- lectores ---------- */
const leeJSON = f => JSON.parse(fs.readFileSync(f, 'utf8'));
/* un archivo de datos .js de El Metro («const NOMBRE = …;»): se evalúa aislado y se devuelven sus constantes */
function leeJS(f, nombres) {
  const src = fs.readFileSync(f, 'utf8').replace(/^const\s+/mg, 'var ').replace(/^let\s+/mg, 'var ');
  const ctx = {}; vm.createContext(ctx); vm.runInContext(src, ctx, { filename: f });
  const o = {}; for (const n of nombres) o[n] = ctx[n]; return o;
}
/* un arreglo literal de un archivo de código de EnCicla (p. ej. «const LUGARES = [ … ];») */
function leeArreglo(f, nombre) {
  const src = fs.readFileSync(f, 'utf8'), i = src.indexOf('const ' + nombre + ' = ['); if (i < 0) throw new Error(nombre + ' no está en ' + f);
  let d = 0, j = src.indexOf('[', i), k = j, enCad = null;
  for (; k < src.length; k++) { const c = src[k]; if (enCad) { if (c === '\\') k++; else if (c === enCad) enCad = null; continue; } if (c === "'" || c === '"' || c === '`') enCad = c; else if (c === '[') d++; else if (c === ']') { d--; if (!d) break; } }
  return vm.runInNewContext('(' + src.slice(j, k + 1) + ')');
}
const b64 = s => Buffer.from(s, 'base64');
const r1 = v => Math.round(v * 10) / 10;

/* ---------- 1. Base de EnCicla: valle.json + valle.bin (formato v3) ---------- */
const VM = leeJSON(path.join(ENC, 'src/data/valle.json'));
const W = VM.W, H = VM.H, TILE = VM.tile, ES = VM.es, eW = VM.eW, eH = VM.eH, mW = VM.mW, mH = VM.mH;
if (TILE !== CFG.casilla_m) throw new Error('la casilla de EnCicla (' + TILE + ' m) no es la de la ciudad (' + CFG.casilla_m + ' m)');
const nT = W * H, nE = eW * eH, nM = mW * mH;
const raw = zlib.inflateRawSync(fs.readFileSync(path.join(ENC, 'src/data/valle.bin')));
let o = 0; const corta = n => { const b = raw.subarray(o, o + n); o += n; return b; };
const suelo = Buffer.from(corta(nT));
const relD = new Int16Array(Buffer.from(corta(nE * 2)).buffer.slice(0)), relieve = new Int16Array(nE);
for (let j = 0; j < eH; j++) { let a = 0; for (let i = 0; i < eW; i++) { a += relD[j * eW + i]; relieve[j * eW + i] = a; } }   // delta por fila → cota absoluta en metros
const municipio = Buffer.from(corta(nM)), comuna = Buffer.from(corta(nM));
const barrio = VM.barrios ? new Uint16Array(Buffer.from(corta(nM * 2)).buffer.slice(0)) : new Uint16Array(nM);
const pisos = VM.hg ? Buffer.from(corta(nM)) : Buffer.alloc(nM), lotes = VM.lt ? Buffer.from(corta(nM)) : Buffer.alloc(nM);
if (o !== raw.length) log('aviso: valle.bin trae', raw.length - o, 'bytes de más');
const Q4 = TILE / 4;   // las líneas de valle.json van en cuartos de casilla
const lin4 = a => a.map(v => r1(v * Q4));
log('base EnCicla', W + '×' + H, 'casillas de', TILE, 'm · relieve', eW + '×' + eH, '· celdas', mW + '×' + mH);

/* ---------- 2. Niveles: viaducto (EnCicla) + puentes y deprimidos (El Metro, con ancho y altura) ---------- */
const ALT = leeJSON(path.join(ENC, 'src/data/alturas.json')), QA = TILE / (ALT.q || 8);
const { PUENTES } = leeJS(path.join(EM, 'src/data/puentes.js'), ['PUENTES']);
const { RIELES } = leeJS(path.join(EM, 'src/data/rieles.js'), ['RIELES']);
const pasos = [];   // [tipo, nivel, ancho_m, alto_m, peatonal, x0,y0,x1,y1,…] en metros
const TIPO_PASO = { puente: 0, tunel: 1, viaducto: 2 };
for (const b of PUENTES.B) { const [pe, z, w, h] = b, P = b.slice(4); if (P.length < 4) continue; pasos.push([z < 0 ? TIPO_PASO.tunel : TIPO_PASO.puente, z, r1(w), r1(h), pe ? 1 : 0, ...P.map(r1)]); }
/* el viaducto del metro: los tramos que EnCicla marca en alto, recortados del eje real de los rieles de El Metro */
function proyecta(P, x, y) { let best = { d: 1e18, s: 0, i: 0 }, s = 0; for (let i = 0; i + 3 < P.length; i += 2) { const ax = P[i], ay = P[i + 1], dx = P[i + 2] - ax, dy = P[i + 3] - ay, L = Math.hypot(dx, dy) || 1e-9, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (L * L))), d = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (d < best.d) best = { d, s: s + t * L, i }; s += L; } return best; }
function recorta(P, s0, s1) { const R = []; let s = 0; for (let i = 0; i + 3 < P.length; i += 2) { const ax = P[i], ay = P[i + 1], bx = P[i + 2], by = P[i + 3], L = Math.hypot(bx - ax, by - ay); const a = Math.max(s0, s), b = Math.min(s1, s + L); if (b > a) { const ta = (a - s) / (L || 1), tb = (b - s) / (L || 1); if (!R.length) R.push(ax + (bx - ax) * ta, ay + (by - ay) * ta); R.push(ax + (bx - ax) * tb, ay + (by - ay) * tb); } s += L; } return R; }
let nViad = 0; const vistos = new Set();
for (const m of ALT.metro || []) {
  const [lid, lvl, xa, ya, xb, yb] = m, P = RIELES[lid]; if (!P) continue;
  const pa = proyecta(P, xa * QA, ya * QA), pb = proyecta(P, xb * QA, yb * QA); if (pa.d > 160 || pb.d > 160) continue;
  const R = recorta(P, Math.min(pa.s, pb.s), Math.max(pa.s, pb.s)); if (R.length < 4) continue;
  const clave = lid + ':' + Math.round(Math.min(pa.s, pb.s) / 20) + ':' + Math.round(Math.max(pa.s, pb.s) / 20); if (vistos.has(clave)) continue; vistos.add(clave);   // los dos sentidos del mismo tramo
  pasos.push([TIPO_PASO.viaducto, lvl || 3, 9.5, 12, 0, lid, ...R.map(r1)]); nViad++;
}
/* los túneles de EnCicla que El Metro no tenga (a más de 30 m de todo deprimido suyo) */
const tunEM = pasos.filter(p => p[0] === TIPO_PASO.tunel);
let nTunE = 0;
for (const t of ALT.tuneles || []) {
  const P = t.slice(3).map(v => v * QA), mx = P[0], my = P[1];
  if (tunEM.some(q => { for (let i = 5; i + 1 < q.length; i += 2) if (Math.hypot(q[i] - mx, q[i + 1] - my) < 30) return true; return false; })) continue;
  pasos.push([TIPO_PASO.tunel, t[1] || -1, 12, 6, 0, ...P.map(r1)]); nTunE++;
}
/* raster: nivel firmado por casilla (lo que pasa por encima o por debajo de la casilla; 0 = nada) */
const nivel = new Int8Array(nT);
for (const p of pasos) {
  const lvl = p[1], w = p[2], i0 = p[0] === TIPO_PASO.viaducto ? 6 : 5, half = Math.max(TILE * .5, w / 2);
  for (let i = i0; i + 3 < p.length; i += 2) {
    const ax = p[i], ay = p[i + 1], bx = p[i + 2], by = p[i + 3], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / (TILE * .5)));
    for (let k = 0; k <= n; k++) {
      const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n, ux = (by - ay) / (L || 1), uy = -(bx - ax) / (L || 1);
      for (let d = -half; d <= half; d += TILE * .5) {
        const tx = Math.floor((x + ux * d) / TILE), ty = Math.floor((y + uy * d) / TILE); if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
        const q = ty * W + tx; if (Math.abs(lvl) > Math.abs(nivel[q])) nivel[q] = lvl;
      }
    }
  }
}
let nNiv = 0; for (let i = 0; i < nT; i++) if (nivel[i]) nNiv++;
log('pasos:', pasos.length, '(puentes y deprimidos de El Metro', PUENTES.B.length, '· viaducto', nViad, 'tramos · túneles de EnCicla', nTunE, ') ·', nNiv, 'casillas con nivel');

/* ---------- 3. Edificios: todas las huellas (El Metro) ---------- */
const { EDIFICIOS } = leeJS(path.join(EM, 'src/data/edificios.js'), ['EDIFICIOS']);
const edRaw = zlib.inflateRawSync(b64(EDIFICIOS.data));
if (edRaw.length !== EDIFICIOS.raw) throw new Error('edificios.js: tamaño inesperado');
const edMeta = { v: EDIFICIOS.v, R: EDIFICIOS.R, nx: EDIFICIOS.nx, ny: EDIFICIOS.ny, cuantos: EDIFICIOS.n, Q: EDIFICIOS.Q, kinds: EDIFICIOS.kinds, len: EDIFICIOS.len };
log('edificios:', EDIFICIOS.n, 'huellas en', EDIFICIOS.nx + '×' + EDIFICIOS.ny, 'regiones de', EDIFICIOS.R, 'm');

/* ---------- 4. Sitios y vías (EnCicla, binarios propios) ---------- */
const sitiosBin = fs.readFileSync(path.join(ENC, 'src/data/sitios.bin')), SM = leeJSON(path.join(ENC, 'src/data/sitios.json'));
const sitiosRaw = (() => { try { return zlib.inflateRawSync(sitiosBin); } catch (e) { return sitiosBin; } })();
const viasBin = fs.readFileSync(path.join(ENC, 'src/data/vias.bin'));
const viasRaw = (() => { try { return zlib.inflateRawSync(viasBin); } catch (e) { return viasBin; } })();
log('sitios', sitiosRaw.length, 'bytes ·', SM.names.length, 'nombres · vías', viasRaw.readUInt32LE(0), 'líneas ·', VM.calles.length, 'calles con nombre');

/* ---------- 5. Transporte ---------- */
const { RED } = leeJS(path.join(EM, 'src/data/red.js'), ['RED']);
const { METROPLUS } = leeJS(path.join(EM, 'src/data/metroplus.js'), ['METROPLUS']);
const { MP_ANDENES } = leeJS(path.join(EM, 'src/data/metroplus_andenes.js'), ['MP_ANDENES']);
const { RUTAS_CALLES } = leeJS(path.join(EM, 'src/data/rutas_calles.js'), ['RUTAS_CALLES']);
const kx = 111320 * Math.cos(CFG.ventana.lat_ref * Math.PI / 180), ky = 110574;
const geoM = (lat, lon) => [r1((lon - CFG.ventana.lon0) * kx), r1((CFG.ventana.latN - lat) * ky)];
const transporte = {
  version: RED.version,
  lineas: RED.lines.map(l => ({
    id: l.id, nombre: l.name, clase: l.kind, color: l.color, desde: l.from, hasta: l.to, abre: l.open, km: l.km, estado: l.status, tec: l.tech,
    estaciones: l.stations.map(s => { const [x, y] = geoM(s[1], s[2]); return [s[0], x, y]; }),
    eje: RIELES[l.id] ? RIELES[l.id].map(r1) : METROPLUS[l.id] ? METROPLUS[l.id].p.map(r1) : RUTAS_CALLES[l.id] ? RUTAS_CALLES[l.id].map(r1) : null,
    andenes: MP_ANDENES[l.id] ? Object.entries(MP_ANDENES[l.id]).map(([n, p]) => [n, r1(p[0]), r1(p[1])]) : undefined,
    datos: l.facts || undefined
  })),
  datos_estaciones: RED.stationFacts, trivia: RED.trivia
};
/* estaciones EnCicla (las 133 del juego, con su tipo y su zona del Apoyo) */
const EST = leeArreglo(path.join(ENC, 'src/js/19-lugares.js'), 'ESTACIONES');
transporte.encicla = EST.map(([id, n, mu, lat, lon, tipo, dem, zona]) => { const [x, y] = geoM(lat, lon); return { id, nombre: n, municipio: mu, x, y, tipo, demanda: dem, zona: zona || null }; });
log('transporte:', transporte.lineas.length, 'líneas,', transporte.lineas.reduce((a, l) => a + l.estaciones.length, 0), 'estaciones ·', transporte.lineas.filter(l => l.eje).length, 'con eje real ·', transporte.encicla.length, 'estaciones EnCicla');

/* ---------- 6. Lugares: postales de EnCicla + hitos con huella de El Metro ---------- */
const LUG = leeArreglo(path.join(ENC, 'src/js/19-lugares.js'), 'LUGARES');
const { HITOS } = leeJS(path.join(EM, 'src/data/hitos.js'), ['HITOS']);
const lugares = LUG.map(([id, n, mu, lat, lon, w, h, dib, dato, secreto]) => { const [x, y] = geoM(lat, lon); return { id, nombre: n, municipio: mu, x, y, ancho: w * 20, alto: h * 20, dibujo: dib, dato, secreto: !!secreto }; });
const hitos = HITOS.map(h => ({ id: h.id, nombre: h.n, clase: h.k, alto: h.h, corona: h.corona || 0, huella: h.P.map(r => r.map(r1)), ...Object.fromEntries(Object.entries(h).filter(([k]) => !['id', 'n', 'k', 'h', 'P', 'corona'].includes(k))) }));
/* enlace lugar ↔ hito: el hito cuya huella queda más cerca del lugar (≤ 250 m) */
for (const L of lugares) { let best = null, bd = 250; for (const h of hitos) { const P = h.huella[0]; let cx = 0, cy = 0; for (let i = 0; i < P.length; i += 2) { cx += P[i]; cy += P[i + 1]; } cx /= P.length / 2; cy /= P.length / 2; const d = Math.hypot(cx - L.x, cy - L.y); if (d < bd) { bd = d; best = h; } } if (best) { L.hito = best.id; best.lugar = best.lugar || L.id; } }
log('lugares:', lugares.length, 'con postal ·', hitos.length, 'hitos con huella ·', lugares.filter(l => l.hito).length, 'enlazados');

/* ---------- 7. Vida de la calle y nombres ---------- */
const trafico = { carriles: VM.lanes.map(l => ({ c: l.c, n: l.n, o: l.o, p: lin4(l.p) })), semaforos: VM.lights.map(p => [r1(p[0] * Q4), r1(p[1] * Q4)]) };
const metroEnc = Object.fromEntries(Object.entries(VM.metro).map(([k, v]) => [k, { p: lin4(v.p), st: v.st.map(s => [s[0], r1(s[1] * Q4), r1(s[2] * Q4)]) }]));
const info = {
  barrios: VM.barrios, comunas: VM.comunas, municipios: VM.munis, calles: VM.calles, sitios_nombres: SM.names,
  rio: lin4(VM.river), parques: VM.parques.map(p => [p[0], r1(p[1] * Q4), r1(p[2] * Q4), p[3]]),
  metro_encicla: metroEnc, metroplus_encicla: VM.mp.map(m => ({ id: m.id, nombre: m.n, color: m.c, p: lin4(m.p), st: (m.st || []).map(s => [s[0], r1(s[1] * Q4), r1(s[2] * Q4)]) }))
};

/* ---------- 8. Contenedor MC4 ---------- */
const capas = [];
const capa = (nombre, tipo, buf, extra = {}) => capas.push({ nombre, tipo, buf: Buffer.isBuffer(buf) ? buf : Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength), extra });
const capaJ = (nombre, obj) => capa(nombre, 'json', Buffer.from(JSON.stringify(obj)));
capa('suelo', 'u8', suelo, { w: W, h: H });
capa('relieve', 'i16', relieve, { w: eW, h: eH, paso: ES });
capa('municipio', 'u8', municipio, { w: mW, h: mH, paso: 8 });
capa('comuna', 'u8', comuna, { w: mW, h: mH, paso: 8 });
capa('barrio', 'u16', barrio, { w: mW, h: mH, paso: 8 });
capa('pisos', 'u8', pisos, { w: mW, h: mH, paso: 8 });
capa('lotes', 'u8', lotes, { w: mW, h: mH, paso: 8, unidad_m2: 4 });
capa('nivel', 'i8', nivel, { w: W, h: H });
capa('vias', 'bin', viasRaw, { formato: 'VIAS3', vq: VM.vq || 4, v: VM.v });
capa('sitios', 'bin', sitiosRaw, { formato: 'SIT', u: SM.u || 8 });
capa('edificios', 'bin', edRaw, { formato: 'ED1', ...edMeta });
capaJ('info', info);
capaJ('pasos', { tipos: Object.keys(TIPO_PASO), lista: pasos });
capaJ('transporte', transporte);
capaJ('lugares', { lugares, hitos });
capaJ('trafico', trafico);

const blobs = []; let off = 0; const tabla = {};
for (const c of capas) { const z = zlib.deflateRawSync(c.buf, { level: 9 }); tabla[c.nombre] = { ...c.extra, o: off, n: z.length, raw: c.buf.length, tipo: c.tipo, sha1: crypto.createHash('sha1').update(c.buf).digest('hex').slice(0, 12) }; blobs.push(z); off += z.length; }
const meta = {
  formato: 'MC4', v: 4, motor: JSON.parse(fs.readFileSync(path.join(RAIZ, 'VERSION.json'), 'utf8')).version, ciudad: CFG.id, nombre: CFG.nombre,
  W, H, tile: TILE, lon0: VM.lon0, latN: VM.latN, lon1: CFG.ventana.lon1, latS: CFG.ventana.latS, kx: VM.kx, ky: VM.ky, unidad: 'm',
  fuentes: { encicla: JSON.parse(fs.readFileSync(path.join(ENC, 'src/data/valle.json'), 'utf8')).src ? 'Juega EnCicla ' + (fs.readFileSync(path.join(ENC, 'src/js/00-core.js'), 'utf8').match(/version: '([^']+)'/) || [])[1] : '', elmetro: 'El Metro ' + ((fs.readFileSync(path.join(EM, 'src/js/00-core.js'), 'utf8').match(/version: '([^']+)'|VERSION = '([^']+)'/) || [])[1] || '') },
  atribucion: CFG.atribucion, capas: tabla
};
const mj = Buffer.from(JSON.stringify(meta)), cab = Buffer.alloc(8); cab.write('MC4\0', 0, 'latin1'); cab.writeUInt32LE(mj.length, 4);
const archivo = Buffer.concat([cab, mj, ...blobs]);
fs.writeFileSync(path.join(OUT, 'mundo.mc4'), archivo);
const resumen = { ciudad: CFG.id, bytes: archivo.length, sha1: crypto.createHash('sha1').update(archivo).digest('hex').slice(0, 12), capas: Object.fromEntries(Object.entries(tabla).map(([k, v]) => [k, { kb: Math.round(v.n / 1024), raw_kb: Math.round(v.raw / 1024), tipo: v.tipo, sha1: v.sha1 }])), cuentas: { casillas: nT, pasos: pasos.length, casillas_con_nivel: nNiv, edificios: EDIFICIOS.n, vias: viasRaw.readUInt32LE(0), lineas: transporte.lineas.length, estaciones_encicla: transporte.encicla.length, lugares: lugares.length, hitos: hitos.length, carriles: trafico.carriles.length, semaforos: trafico.semaforos.length } };
fs.writeFileSync(path.join(OUT, 'resumen.json'), JSON.stringify(resumen, null, 1));
log('✓ mundo', path.relative(RAIZ, path.join(OUT, 'mundo.mc4')), (archivo.length / 1048576).toFixed(2), 'MB ·', Object.keys(tabla).length, 'capas ·', ((Date.now() - t0) / 1000).toFixed(1), 's');
