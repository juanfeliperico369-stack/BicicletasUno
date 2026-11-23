/* =====================================================================
   PRUEBA G5-07 · Fichas de los 30 sitios icónicos de Medellín (para C5-02)
   Verifica:
     - docs/sitios/sitios.json válido con >= 30 sitios sin IDs duplicados;
     - coordenadas WGS84 dentro de datos/medellin/mundo.mc4 y consistentes
       con (mc4.x, mc4.y) y cota_m del relieve real;
     - todos los hito_mc4 referenciados existen en la capa lugares de mundo.mc4;
     - cada sitio tiene ficha Markdown (docs/sitios/<id>.md), paleta HEX válida,
       3 a 6 rasgos reconocibles, materiales, receta de modelado e imagen WebP
       válida (RIFF/WEBP, <= 120 KB);
     - presupuesto agregado de triángulos LOD0 / LOD1 razonable (< 35 000 tris).
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const RAIZ = path.resolve(import.meta.dirname, '..');
const DIR_SITIOS = path.join(RAIZ, 'docs', 'sitios');
const RUTA_JSON = path.join(DIR_SITIOS, 'sitios.json');
const RUTA_README = path.join(DIR_SITIOS, 'README.md');
const RUTA_MC4 = path.join(RAIZ, 'datos', 'medellin', 'mundo.mc4');

let ok = 0, fallos = 0;
function asertar(cond, msg) {
  if (cond) ok++;
  else { fallos++; console.error('✗', msg); }
}

asertar(fs.existsSync(RUTA_JSON), 'existe docs/sitios/sitios.json');
asertar(fs.existsSync(RUTA_README), 'existe docs/sitios/README.md');
asertar(fs.existsSync(RUTA_MC4), 'existe datos/medellin/mundo.mc4');

const datos = JSON.parse(fs.readFileSync(RUTA_JSON, 'utf8'));
const u8 = fs.readFileSync(RUTA_MC4);
const nMeta = u8.readUInt32LE(4);
const meta = JSON.parse(u8.subarray(8, 8 + nMeta).toString('utf8'));
const base = 8 + nMeta;

function leerCapa(nombre) {
  const c = meta.capas[nombre];
  const raw = c.z === 0
    ? u8.subarray(base + c.o, base + c.o + c.n)
    : zlib.inflateRawSync(u8.subarray(base + c.o, base + c.o + c.n));
  if (c.tipo === 'i16') return new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
  if (c.tipo === 'json') return JSON.parse(raw.toString('utf8'));
  return raw;
}

const relieve = leerCapa('relieve');
const rInfo = meta.capas.relieve;
const es = rInfo.paso * meta.tile;
const lugares = leerCapa('lugares');
const hitosValidos = new Set((lugares.hitos || []).map(h => h.id));
const anchoM = meta.W * meta.tile;
const altoM = meta.H * meta.tile;

function cotaReal(x, y) {
  const ix = Math.max(0, Math.min(rInfo.w - 1, Math.round(x / es)));
  const iy = Math.max(0, Math.min(rInfo.h - 1, Math.round(y / es)));
  return relieve[iy * rInfo.w + ix];
}

const sitios = datos.sitios || [];
asertar(sitios.length >= 30, `al menos 30 sitios icónicos (actual: ${sitios.length})`);

const ids = new Set();
const hexRe = /^#[0-9A-Fa-f]{6}$/;
const osmRe = /^(node|way|relation)\/\d+$/;
let totalLod0 = 0, totalLod1 = 0, totalImgBytes = 0;

for (const s of sitios) {
  asertar(typeof s.id === 'string' && /^[a-z0-9_]+$/.test(s.id), `id válido: ${s.id}`);
  asertar(!ids.has(s.id), `id sin duplicar: ${s.id}`);
  ids.add(s.id);

  asertar(typeof s.nombre === 'string' && s.nombre.length >= 4, `nombre válido en ${s.id}`);
  const { lat, lon } = s.coordenadas || {};
  const { x, y, cota_m } = s.mc4 || {};
  asertar(Number.isFinite(lat) && Number.isFinite(lon), `coordenadas WGS84 finitas en ${s.id}`);
  asertar(x >= 0 && x <= anchoM && y >= 0 && y <= altoM, `MC4 (x,y) dentro de mundo.mc4 en ${s.id}`);

  const xEsperado = Math.round((lon - meta.lon0) * meta.kx * meta.tile);
  const yEsperado = Math.round((meta.latN - lat) * meta.ky * meta.tile);
  asertar(Math.abs(x - xEsperado) <= 15 && Math.abs(y - yEsperado) <= 15,
    `proyección WGS84↔MC4 coherente en ${s.id} (dx=${x - xEsperado}, dy=${y - yEsperado})`);

  const cotaEsperada = cotaReal(x, y);
  asertar(Math.abs(cota_m - cotaEsperada) <= 25,
    `cota_m coincide con relieve MC4 en ${s.id} (${cota_m} vs ${cotaEsperada})`);

  for (const hId of (s.mc4.hito_mc4 || [])) {
    asertar(hitosValidos.has(hId), `hito_mc4 "${hId}" existe en mundo.mc4 (${s.id})`);
  }

  if (s.osm_id !== null) {
    asertar(osmRe.test(s.osm_id), `osm_id bien formado en ${s.id}: ${s.osm_id}`);
  }
  asertar(typeof s.osm_consulta === 'string' && s.osm_consulta.length > 8, `osm_consulta presente en ${s.id}`);

  const dim = s.dimensiones || {};
  asertar(dim.altura_m > 0 && dim.altura_m <= 200, `altura_m coherente en ${s.id}: ${dim.altura_m}`);
  asertar(Array.isArray(dim.planta_m) && dim.planta_m.length === 2 && dim.planta_m[0] > 10 && dim.planta_m[1] > 10,
    `planta_m válida en ${s.id}`);

  const colores = Object.values(s.colores_hex || {});
  asertar(colores.length >= 4 && colores.every(c => hexRe.test(c)), `colores HEX válidos en ${s.id}`);
  asertar(Array.isArray(s.materiales) && s.materiales.length >= 3, `materiales completos en ${s.id}`);
  asertar(Array.isArray(s.rasgos) && s.rasgos.length >= 3 && s.rasgos.length <= 6, `3–6 rasgos en ${s.id}`);
  asertar(typeof s.receta_modelado === 'string' && s.receta_modelado.length >= 40, `receta_modelado en ${s.id}`);

  const tris = s.presupuesto_tris || {};
  asertar(tris.lod0 >= 200 && tris.lod0 <= 1200 && tris.lod1 >= 100 && tris.lod1 < tris.lod0,
    `presupuesto LOD0/LOD1 sano en ${s.id}`);
  totalLod0 += tris.lod0 || 0;
  totalLod1 += tris.lod1 || 0;

  /* Ficha Markdown */
  const rutaMd = path.join(RAIZ, s.ficha_md);
  asertar(fs.existsSync(rutaMd), `existe ficha ${s.ficha_md}`);
  if (fs.existsSync(rutaMd)) {
    const txt = fs.readFileSync(rutaMd, 'utf8');
    asertar(txt.includes(`img/${s.id}.webp`), `ficha ${s.id}.md enlaza img/${s.id}.webp`);
  }

  /* Imagen WebP válida */
  const rutaImg = path.join(RAIZ, s.imagen_ref);
  asertar(fs.existsSync(rutaImg), `existe imagen ${s.imagen_ref}`);
  if (fs.existsSync(rutaImg)) {
    const buf = fs.readFileSync(rutaImg);
    const esWebp = buf.length > 16 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
    asertar(esWebp, `cabecera WebP válida en ${s.imagen_ref}`);
    asertar(buf.length <= 120 * 1024, `imagen liviana <= 120 KB en ${s.imagen_ref} (${(buf.length / 1024).toFixed(1)} KB)`);
    totalImgBytes += buf.length;
  }
}

/* Asegurar que los 20 sitios nombrados explícitamente en PEDIDOS-GEMINI-5.0.md estén cubiertos */
const requeridos = [
  'coltejer', 'candelaria', 'palacio_cultura', 'plaza_botero', 'edificio_epm',
  'alpujarra', 'pueblito_paisa', 'parque_explora', 'orquideorama', 'planetario',
  'parque_deseos', 'biblioteca_espana', 'estadio_atanasio', 'catedral_metropolitana',
  'museo_antioquia', 'plaza_mayor', 'teatro_pablo_tobon', 'ruta_n', 'parque_lleras',
  'plaza_libertad'
];
for (const r of requeridos) asertar(ids.has(r), `sitio pedido presente: ${r}`);

asertar(totalLod0 <= 35000 && totalLod1 <= 12000, `presupuesto agregado LOD0=${totalLod0}, LOD1=${totalLod1} dentro de tope`);

console.log(`Sitios verificados: ${sitios.length} · LOD0 total: ${totalLod0} tris · LOD1 total: ${totalLod1} tris · Imágenes: ${(totalImgBytes / 1024).toFixed(1)} KB`);
console.log(`Resultado: ${ok} ok, ${fallos} fallos`);
if (fallos > 0) process.exit(1);
