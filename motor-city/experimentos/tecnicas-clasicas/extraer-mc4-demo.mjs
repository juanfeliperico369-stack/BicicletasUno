/* =====================================================================
   MOTOR CITY · Extractor y benchmark de técnicas clásicas sobre MC4 reales
   Lee datos/{guatape,medellin,nueva_york}/mundo.mc4 (SRTM real + edificios
   reales Overture/OSM), mide el rendimiento real de CulleoUrbano, PVSRejilla,
   hornearAOUrbano, VoxelTerreno y StreamAnillo, y exporta un snapshot compacto
   (datos-reales-mc4.js) para el laboratorio interactivo offline.
   ===================================================================== */
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const C = require('./mc-clasico.js');

const ROOT = new URL('../../', import.meta.url);
const OUT_JS = new URL('./datos-reales-mc4.js', import.meta.url);
const OUT_JSON = new URL('./benchmark-mc4-real.json', import.meta.url);

/* Cargar MC.Mundo en contexto VM limpio */
const ctx = {
  console, Math, Date, performance,
  Float32Array, Float64Array, Int8Array, Int16Array, Int32Array,
  Uint8Array, Uint16Array, Uint32Array, ArrayBuffer, DataView,
  TextDecoder, TextEncoder, Set, Map, RegExp, JSON, Error,
  Object, Array, Number, String, Boolean, Promise, setTimeout, clearTimeout,
  atob: s => Buffer.from(s, 'base64').toString('binary'),
  btoa: s => Buffer.from(s, 'binary').toString('base64')
};
ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
vm.runInNewContext(fs.readFileSync(new URL('dist/motor.js', ROOT), 'utf8'), ctx);
const { MC } = ctx;

async function cargarMundo(id) {
  const raw = fs.readFileSync(new URL(`datos/${id}/mundo.mc4`, ROOT));
  return MC.Mundo.cargar(raw.toString('base64'));
}

/* Muestrea un mapa 128x128 de alturas SRTM (0..255) y clase de suelo desde un MC4 real */
function extraerRelieveVoxel(M, tam = 128, caja = null) {
  const x0 = caja ? caja.x0 : 0, y0 = caja ? caja.y0 : 0;
  const x1 = caja ? caja.x1 : M.ancho, y1 = caja ? caja.y1 : M.alto;
  const rawH = new Float32Array(tam * tam);
  const suelos = new Uint8Array(tam * tam);
  let minC = Infinity, maxC = -Infinity;

  for (let iy = 0; iy < tam; iy++) {
    const wy = y0 + ((iy + 0.5) / tam) * (y1 - y0);
    for (let ix = 0; ix < tam; ix++) {
      const wx = x0 + ((ix + 0.5) / tam) * (x1 - x0);
      const idx = iy * tam + ix;
      const s = M.suelo(wx, wy);
      suelos[idx] = s;
      const c = M.cota(wx, wy);
      rawH[idx] = c;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    }
  }
  const span = Math.max(1, maxC - minC);
  const hU8 = new Uint8Array(tam * tam);
  for (let i = 0; i < rawH.length; i++) {
    const norm = (rawH[i] - minC) / span;
    hU8[i] = Math.max(14, Math.min(248, Math.round(14 + norm * 234)));
  }
  return {
    tam,
    minCotaM: Math.round(minC),
    maxCotaM: Math.round(maxC),
    anchoM: Math.round(x1 - x0),
    altoM: Math.round(y1 - y0),
    alturasB64: Buffer.from(hU8).toString('base64'),
    suelosB64: Buffer.from(suelos).toString('base64')
  };
}

/* Extrae edificios reales alrededor de una coordenada geografica para CulleoUrbano y AO */
function extraerCanonReal(M, lat, lon, radioM = 360) {
  const p = M.geoAMetros(lat, lon);
  const cx = p.x, cy = p.y;
  const raw = typeof M.edificiosEn === 'function' ? M.edificiosEn(cx - radioM, cy - radioM, cx + radioM, cy + radioM, []) : [];
  const list = [];
  for (const e of raw) {
    const dx = e.x - cx, dy = e.y - cy;
    const d = Math.hypot(dx, dy);
    if (d < 14 || d > radioM) continue; /* despejar punto de camara */
    const r = Math.max(4, Math.hypot(e.hw || 6, e.hd || 6));
    const h = Math.max(4, Math.round(e.h || (e.pis || 3) * 3.2));
    list.push({ x: Math.round(dx), y: Math.round(dy), r: +r.toFixed(1), h, pis: e.pis || Math.round(h / 3.2) });
  }
  return { cx: Math.round(cx), cy: Math.round(cy), calle: M.calle(cx, cy), radioM, totalReales: raw.length, edificios: list };
}

function probarCanon(nombre, canon) {
  const culleo = new C.CulleoUrbano(96);
  const cam = { x: 0, y: 0, a: 0.25, z: 2.4 };
  const t0 = performance.now();
  const sin = culleo.filtrar(cam, canon.edificios, { frustum: false, niebla: false, oclusion: false });
  const con = culleo.filtrar(cam, canon.edificios, { frustum: true, niebla: true, oclusion: true, fogEnd: 220 });
  const msCulleo = +(performance.now() - t0).toFixed(3);
  const ao = C.hornearAOUrbano(canon.edificios, 42);
  let aoMin = 1, aoSum = 0;
  for (let i = 0; i < ao.length; i++) { if (ao[i] < aoMin) aoMin = ao[i]; aoSum += ao[i]; }
  /* PVS en rejilla de 16x16 sobre la manzana */
  const N = 16, blq = new Uint8Array(N * N), paso = (canon.radioM * 2) / N;
  for (const b of canon.edificios) {
    if (b.h < 10) continue;
    const gx = Math.floor((b.x + canon.radioM) / paso), gy = Math.floor((b.y + canon.radioM) / paso);
    if (gx >= 0 && gx < N && gy >= 0 && gy < N) blq[gy * N + gx] = 1;
  }
  blq[8 * N + 8] = 0;
  const pvs = new C.PVSRejilla(N, N).construirDesdeBloqueo(blq, 12);
  const rle = pvs.comprimirFila(8 * N + 8);
  return {
    nombre,
    calle: canon.calle,
    edificiosEnRadio: canon.edificios.length,
    enFrustum: con.enFrustum,
    dibujadosTrasOclusion: con.dibujados,
    descartadosPct: con.descartadosPct,
    msCulleo,
    aoMin: +aoMin.toFixed(2),
    aoProm: +(aoSum / Math.max(1, ao.length)).toFixed(2),
    pvsRawBytes: pvs.palabras * 4,
    pvsRleBytes: rle.length
  };
}

/* Ejecutar sobre los 3 MC4 reales del repositorio */
const [mGu, mMd, mNy] = await Promise.all([
  cargarMundo('guatape'),
  cargarMundo('medellin'),
  cargarMundo('nueva_york')
]);

/* 1. Relieves reales SRTM para Voxel Space (Guatape completo + Valle central Medellin) */
const voxGuatape = extraerRelieveVoxel(mGu, 128);
const pMedC = mMd.geoAMetros(6.245, -75.575);
const voxMedellin = extraerRelieveVoxel(mMd, 128, {
  x0: Math.max(0, pMedC.x - 6500), y0: Math.max(0, pMedC.y - 6500),
  x1: Math.min(mMd.ancho, pMedC.x + 6500), y1: Math.min(mMd.alto, pMedC.y + 6500)
});

/* Benchmark de render CPU Voxel Space sobre SRTM real de Guatape */
const vt = new C.VoxelTerreno(128);
const hBufGu = Buffer.from(voxGuatape.alturasB64, 'base64');
const sBufGu = Buffer.from(voxGuatape.suelosB64, 'base64');
for (let i = 0; i < 128 * 128; i++) {
  vt.alturas[i] = hBufGu[i];
  const s = sBufGu[i], h = hBufGu[i];
  const r = s === 8 ? 22 : s === 4 || s === 5 ? 74 : s === 2 || s === 3 ? 168 : h > 160 ? 96 : 46;
  const g = s === 8 ? 72 : s === 4 || s === 5 ? 76 : s === 2 || s === 3 ? 116 : h > 160 ? 98 : 96;
  const b = s === 8 ? 84 : s === 4 || s === 5 ? 82 : s === 2 || s === 3 ? 98 : h > 160 ? 94 : 52;
  vt.colores[i] = (255 << 24) | (b << 16) | (g << 8) | r;
}
const fb = new Uint32Array(320 * 200);
const tv0 = performance.now();
for (let k = 0; k < 20; k++) vt.renderizar(fb, 320, 200, { x: 40 + k * 0.5, y: 64, z: 160, a: 0.4 });
const voxMsProm = +((performance.now() - tv0) / 20).toFixed(2);

/* 2. Canones urbanos reales: Manhattan (West 17th / Chelsea + Midtown) y Medellin (El Poblado + Centro) */
const nyChelsea = extraerCanonReal(mNy, 40.7432, -74.0055, 340);
const nyMidtown = extraerCanonReal(mNy, 40.7549, -73.9840, 340);
const mdPoblado = extraerCanonReal(mMd, 6.2087, -75.5677, 340);
const mdCentro = extraerCanonReal(mMd, 6.2492, -75.5650, 340);

const benchmarks = {
  fecha: '2026-11-21',
  nota: 'Medido directamente sobre datos/{guatape,medellin,nueva_york}/mundo.mc4 de Motor City 4.0.3',
  voxelSRTM: {
    guatape: { minCotaM: voxGuatape.minCotaM, maxCotaM: voxGuatape.maxCotaM, anchoM: voxGuatape.anchoM, msPorCuadro320x200: voxMsProm },
    medellin: { minCotaM: voxMedellin.minCotaM, maxCotaM: voxMedellin.maxCotaM, anchoM: voxMedellin.anchoM }
  },
  canonesReales: [
    probarCanon('Manhattan · Chelsea (West 17th St)', nyChelsea),
    probarCanon('Manhattan · Midtown (42nd St)', nyMidtown),
    probarCanon('Medellín · El Poblado (Parque Lleras)', mdPoblado),
    probarCanon('Medellín · Centro (Av. La Playa)', mdCentro)
  ]
};

/* Empaquetar subset ligero (~380 edificios mas cercanos) por ciudad para el laboratorio offline */
const recortar = (c, maxN = 320) => ({
  calle: c.calle,
  totalEn340m: c.edificios.length,
  edificios: c.edificios
    .slice()
    .sort((a, b) => (a.x * a.x + a.y * a.y) - (b.x * b.x + b.y * b.y))
    .slice(0, maxN)
    .map(e => [e.x, e.y, e.r, e.h])
});

const payload = {
  version: '4.0.3-mc4-real',
  relieves: { guatape: voxGuatape, medellin: voxMedellin },
  canones: {
    ny_chelsea: recortar(nyChelsea, 320),
    ny_midtown: recortar(nyMidtown, 320),
    md_poblado: recortar(mdPoblado, 320)
  },
  benchmarks
};

fs.writeFileSync(OUT_JSON, JSON.stringify(benchmarks, null, 2), 'utf8');
fs.writeFileSync(OUT_JS, '/* Snapshot compacto de relieve SRTM y edificios reales extraidos de datos/<ciudad>/mundo.mc4 */\nwindow.MC_DATOS_REALES = ' + JSON.stringify(payload) + ';\n', 'utf8');

console.log('=== BENCHMARK REAL SOBRE MC4 (4.0.3) ===');
console.log(JSON.stringify(benchmarks, null, 2));
console.log('Archivo snapshot:', (fs.statSync(OUT_JS).size / 1024).toFixed(1), 'KB');
