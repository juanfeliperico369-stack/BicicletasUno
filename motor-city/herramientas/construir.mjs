#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · CONSTRUCCIÓN
     dist/motor.js              el motor (js/*.js en orden) en un solo cierre que publica MC
     dist/mundo-<ciudad>.js     el mundo MC4 en base64 y la configuración de la ciudad (para meter en un HTML)
     dist/motor-city.html       el banco de pruebas jugable (sandbox/): un solo HTML, sin internet
   Uso: node herramientas/construir.mjs [--ciudad medellin] [--sin-sandbox]
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process'; import crypto from 'node:crypto'; import zlib from 'node:zlib'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), DIST = path.join(RAIZ, 'dist');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const CIUDAD = arg('--ciudad', 'medellin'), VER = JSON.parse(fs.readFileSync(path.join(RAIZ, 'VERSION.json'), 'utf8'));
fs.mkdirSync(DIST, { recursive: true });

/* ---------- el motor ---------- */
const dirJS = path.join(RAIZ, 'js'), lista = fs.readdirSync(dirJS).filter(f => /^\d\d-.*\.js$/.test(f)).sort();   // solo los fragmentos numerados (valle.js es el lector 1.x de compatibilidad)
const cuerpo = lista.map(f => `/* ---- js/${f} ---- */\n` + fs.readFileSync(path.join(dirJS, f), 'utf8')).join('\n');
const motor = `/* ${VER.nombre} ${VER.version} · ${VER.fecha} · https://github.com/${VER.fuente_de_verdad}
   Un solo motor de mundo abierto para Juega EnCicla, El Metro y los juegos que vienen. Sin librerías ni internet.
   Datos del mundo: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; capas oficiales de Medellín; relieve SRTM/NASA. */
(function (root) {
'use strict';
${cuerpo}
MC.archivos = ${JSON.stringify(lista)};
root.MC = MC;
if (!root.Valle) root.Valle = MC.ValleCompat;
if (!root.MotorValle) root.MotorValle = MC.ValleCompat;
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(path.join(DIST, 'motor.js'), motor);
try { execSync('node --check ' + JSON.stringify(path.join(DIST, 'motor.js')), { stdio: 'inherit' }); } catch (e) { process.exit(1); }

/* ---------- el mundo de la ciudad ---------- */
const mc4 = path.join(RAIZ, 'datos', CIUDAD, 'mundo.mc4');
if (!fs.existsSync(mc4)) { console.error('Falta ' + path.relative(RAIZ, mc4) + ': corre primero node herramientas/fusionar.mjs'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades', CIUDAD + '.json'), 'utf8')), bin = fs.readFileSync(mc4);
const K = CIUDAD.toUpperCase().replace(/[^A-Z0-9]/g, '_');
const mundoJS = `/* Mundo 2.0 de ${cfg.nombre} (MC4, ${(bin.length / 1048576).toFixed(2)} MB). ${cfg.atribucion.join(' · ')} */\nvar MC_MUNDO_${K} = '${bin.toString('base64')}';\nvar MC_CIUDAD_${K} = ${JSON.stringify(cfg)};\n`;
fs.writeFileSync(path.join(DIST, 'mundo-' + CIUDAD + '.js'), mundoJS);

/* ---------- el banco de pruebas (sandbox) ---------- */
let html = null;
if (!process.argv.includes('--sin-sandbox') && fs.existsSync(path.join(RAIZ, 'sandbox', 'index.html'))) {
  const sb = path.join(RAIZ, 'sandbox'), jsS = fs.readdirSync(sb).filter(f => f.endsWith('.js')).sort().map(f => `/* ---- sandbox/${f} ---- */\n` + fs.readFileSync(path.join(sb, f), 'utf8')).join('\n');
  const run = fs.existsSync(path.join(RAIZ, 'run', 'run-scooter.js')) ? fs.readFileSync(path.join(RAIZ, 'run', 'run-scooter.js'), 'utf8') : '';
  const chequeo = path.join(DIST, '.sandbox.check.js'); fs.writeFileSync(chequeo, jsS); try { execSync('node --check ' + JSON.stringify(chequeo), { stdio: 'inherit' }); } finally { fs.unlinkSync(chequeo); }
  html = fs.readFileSync(path.join(sb, 'index.html'), 'utf8')
    .replace('/*CSS*/', () => fs.existsSync(path.join(sb, 'estilo.css')) ? fs.readFileSync(path.join(sb, 'estilo.css'), 'utf8') : '')
    .replace('/*MUNDO*/', () => mundoJS)
    .replace('/*MOTOR*/', () => motor)
    .replace('/*RUN*/', () => run)
    .replace('/*SANDBOX*/', () => `(function(){'use strict';\n${jsS}\n})();`)
    .replaceAll('%VERSION%', VER.version);
  fs.writeFileSync(path.join(DIST, 'motor-city.html'), html);
}
/* ---------- paquetes de arte (arte/<id>/): también sueltos en dist/arte/<id>.js para que cualquier juego los incluya ---------- */
function paqueteArte(id) {
  const d = path.join(RAIZ, 'arte', id), mf = path.join(d, 'manifiesto.json'); if (!fs.existsSync(mf)) { console.warn('⚠ falta arte/' + id + '/manifiesto.json'); return null; }
  const man = JSON.parse(fs.readFileSync(mf, 'utf8')), atlases = {};
  for (const [aid, m] of Object.entries(man)) { const img = ['webp', 'png'].map(e => path.join(d, aid + '.' + e)).find(f => fs.existsSync(f)); if (!img) continue; atlases[aid] = Object.assign({ imagen: 'data:image/' + path.extname(img).slice(1) + ';base64,' + fs.readFileSync(img).toString('base64') }, m); }
  const extra = {}; for (const k of ['iconos', 'hitos', 'paletas']) { const f = path.join(d, k + '.json'); if (fs.existsSync(f)) extra[k] = JSON.parse(fs.readFileSync(f, 'utf8')); }
  return JSON.stringify(id) + ':' + JSON.stringify(Object.assign({ atlases }, extra));
}
if (fs.existsSync(path.join(RAIZ, 'arte'))) for (const id of fs.readdirSync(path.join(RAIZ, 'arte'))) { const t = fs.existsSync(path.join(RAIZ, 'arte', id, 'manifiesto.json')) && paqueteArte(id); if (t) { fs.mkdirSync(path.join(DIST, 'arte'), { recursive: true }); fs.writeFileSync(path.join(DIST, 'arte', id + '.js'), '/* Paquete de arte «' + id + '» para Motor City: var MC_ARTE.' + id + ' = { atlases, iconos, hitos, paletas }. Se instala con MC.Pieles.instalar(). */\nvar MC_ARTE = window.MC_ARTE || {}; MC_ARTE[' + JSON.stringify(id) + '] = ' + t.slice(t.indexOf(':') + 1) + ';\n'); } }

/* C-M34 · partición opcional del contenedor MC4 en capas comprimidas.
   Cada capa conserva exactamente los bytes deflate del MC4 original: el lector
   puede decodificar solo lo que necesita. Sin peticiones de red ni cambio MC4. */
/* Raster espacial: bloques comprimidos por casillas, ~1 km de lado.
   El HTML contiene un único <script> de texto por raster; los índices
   permiten extraer solo el Base64 de la región solicitada. */
function rasterPorSectores(id, nombre, capa, comprimido, meta) {
  if (!Number.isFinite(meta.tile) || meta.tile <= 0 || !Number.isSafeInteger(capa.w) ||
    !Number.isSafeInteger(capa.h) || capa.w !== meta.W || capa.h !== meta.H ||
    !['u8', 'i8'].includes(capa.tipo) || capa.raw !== capa.w * capa.h) {
    throw new Error('Raster MC4 incompatible: ' + id + '/' + nombre);
  }
  const lado = Math.ceil(1000 / meta.tile), nx = Math.ceil(capa.w / lado), ny = Math.ceil(capa.h / lado);
  const original = zlib.inflateRawSync(comprimido);
  if (original.length !== capa.raw) throw new Error('Raster MC4 comprimido corrupto: ' + id + '/' + nombre);
  const partes = [], indices = [0];
  let offset = 0;
  for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
    const w = Math.min(lado, capa.w - ix * lado), h = Math.min(lado, capa.h - iy * lado);
    const zona = Buffer.allocUnsafe(w * h);
    for (let fila = 0; fila < h; fila++) {
      const desde = (iy * lado + fila) * capa.w + ix * lado;
      original.copy(zona, fila * w, desde, desde + w);
    }
    const b64 = zlib.deflateRawSync(zona, { level: 6 }).toString('base64');
    partes.push(b64); offset += b64.length; indices.push(offset);
  }
  return {
    spec: { w: capa.w, h: capa.h, lado, nx, ny, tipo: capa.tipo, indices },
    html: '<script type="text/plain" id="mc4r-' + id + '-' + nombre + '">' + partes.join('') + '</script>\n'
  };
}

/* El MC4 original NO se modifica. `rasters:true` es opt-in y fragmenta
   suelo/nivel con LRU espacial mientras el resto conserva el formato
   por capas de C-M34. Sin servidor, peticiones de red ni archivos sueltos. */
function mundoPorCapas(id, bin, op = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('ID de mundo no seguro: ' + id);
  if (bin.length < 8 || bin.toString('ascii', 0, 3) !== 'MC4') throw new Error('No es MC4: ' + id);
  const n = bin.readUInt32LE(4), base = 8 + n;
  if (n < 2 || base > bin.length) throw new Error('Cabecera MC4 truncada: ' + id);
  const meta = JSON.parse(bin.subarray(8, base).toString('utf8'));
  if (!meta.capas || meta.formato !== 'MC4') throw new Error('Metadatos MC4 inválidos: ' + id);
  if (op.rasters && meta.rasters) throw new Error('MC4 de origen ya incluye rasters; manifest ambiguo');
  const partes = [], rasters = {};
  for (const [nombre, c] of Object.entries(meta.capas)) {
    if (!/^[a-zA-Z0-9_-]+$/.test(nombre)) throw new Error('Nombre de capa no seguro: ' + nombre);
    if (!Number.isSafeInteger(c.o) || !Number.isSafeInteger(c.n) || c.o < 0 || c.n < 0 || base + c.o + c.n > bin.length) {
      throw new Error('Capa MC4 fuera de límites: ' + id + '/' + nombre);
    }
    const compressed = bin.subarray(base + c.o, base + c.o + c.n);
    if (op.rasters && (nombre === 'suelo' || nombre === 'nivel')) {
      const r = rasterPorSectores(id, nombre, c, compressed, meta);
      rasters[nombre] = r.spec; partes.push(r.html);
    } else {
      partes.push('<script type="text/plain" id="mc4-' + id + '-' + nombre + '">' + compressed.toString('base64') + '</script>\n');
    }
  }
  if (op.rasters) {
    if (!rasters.suelo || !rasters.nivel) throw new Error('El MC4 requiere suelo y nivel para dividir por sectores');
    meta.rasters = rasters;
  }
  /* Escapar '<' en la serialización de metadatos: texto inerte en el HTML. */
  return '<script type="text/plain" id="mc4meta-' + id + '">' +
    JSON.stringify(meta).replaceAll('<', '\\u003c') + '</script>\n' + partes.join('');
}

/* ---------- los juegos de juegos/<id>/ (cada uno con su mundo): dist/juegos/<id>.html ---------- */
const juegos = [];
const dirJ = path.join(RAIZ, 'juegos');
if (fs.existsSync(dirJ) && !process.argv.includes('--sin-juegos')) for (const id of fs.readdirSync(dirJ)) {
  const jd = path.join(dirJ, id), jj = path.join(jd, 'juego.json'); if (!fs.existsSync(jj)) continue;
  const J = JSON.parse(fs.readFileSync(jj, 'utf8')), cId = J.mundo || (J.mundos && J.mundos[0]) || CIUDAD, mc = path.join(RAIZ, 'datos', cId, 'mundo.mc4');
  if (!fs.existsSync(mc)) { console.warn('⚠ ' + id + ': falta datos/' + cId + '/mundo.mc4'); continue; }
  /* 4.0: varios mundos en un juego ("mundos": ["nueva_york", "medellin", "guatape"]): cada MC4 va en un <script type="text/plain">
     (el navegador no lo interpreta como JavaScript: se lee y se descomprime solo el mundo al que se llega) y sus reglas en MC_CIUDADES */
  let mundosHTML = '';
  if (J.mundos) { const C = {}; for (const m of J.mundos) { const f = path.join(RAIZ, 'datos', m, 'mundo.mc4'); if (!fs.existsSync(f)) { console.warn('⚠ ' + id + ': falta datos/' + m + '/mundo.mc4'); continue; } C[m] = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades', m + '.json'), 'utf8')); mundosHTML += J.mundos_capas ? mundoPorCapas(m, fs.readFileSync(f), { rasters: J.mundos_rasters === true }) : `<script type="text/plain" id="mc4-${m}">${fs.readFileSync(f).toString('base64')}</script>\n`; }
    J._ciudades = C; }
  let mundoJ; const cfgJ = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades', cId + '.json'), 'utf8')); mundoJ = J.mundos ? `var MC_CIUDADES = ${JSON.stringify(J._ciudades)};\nvar MC_CIUDAD_BASE = ${JSON.stringify({ zonas: cfg.zonas })};\n` : `var MC_MUNDO = '${fs.readFileSync(mc).toString('base64')}';\nvar MC_CIUDAD = ${JSON.stringify(cfgJ)};\nvar MC_CIUDAD_BASE = ${JSON.stringify({ zonas: cfg.zonas })};\n`;
  /* arte en sprites: "arte": ["gemini"] en juego.json compila arte/<id>/ (atlas WebP + manifiesto + íconos + hitos + paletas) dentro del HTML */
  const arteJ = (J.arte || []).map(a => paqueteArte(a)).filter(Boolean); if (arteJ.length) mundoJ += 'var MC_ARTE = {' + arteJ.join(',') + '};\n';
  /* 4.0: modelos GLB ("modelos": "arte/modelos/turno-cero") → var MC_MODELOS = { id: base64 } (MC.Modelos los lee) */
  if (J.modelos) { const dm = path.join(RAIZ, J.modelos), MOD = {}; if (fs.existsSync(dm)) for (const f of fs.readdirSync(dm).filter(f => f.endsWith('.glb')).sort()) MOD[f.slice(0, -4)] = fs.readFileSync(path.join(dm, f)).toString('base64'); else console.warn('⚠ ' + id + ': falta ' + J.modelos); mundoJ += 'var MC_MODELOS = ' + JSON.stringify(MOD) + ';\n'; }
  const jsJ = fs.readdirSync(jd).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(jd, f), 'utf8')).join('\n');
  const chk = path.join(DIST, '.juego.check.js'); fs.writeFileSync(chk, jsJ); try { execSync('node --check ' + JSON.stringify(chk), { stdio: 'inherit' }); } finally { fs.unlinkSync(chk); }
  const out = fs.readFileSync(path.join(jd, 'index.html'), 'utf8').replace('/*CSS*/', () => fs.existsSync(path.join(jd, 'estilo.css')) ? fs.readFileSync(path.join(jd, 'estilo.css'), 'utf8') : '').replace('/*MUNDO*/', () => mundoJ).replace('/*MOTOR*/', () => motor + (J.run && fs.existsSync(path.join(RAIZ, 'run', 'run-scooter.js')) ? '\n' + fs.readFileSync(path.join(RAIZ, 'run', 'run-scooter.js'), 'utf8') : '')).replace('/*JUEGO*/', () => `(function(){'use strict';\n${jsJ}\n})();`).replace('<!--MUNDOS-->', () => mundosHTML).replaceAll('%VERSION%', VER.version)
    .replace('__PORTADA_BG__', () => {
      if (id !== 'getaway') return 'none';
      const portada = path.join(RAIZ, 'arte/gemini/turno-cero/portada-turno-cero.webp');
      return fs.existsSync(portada) ? 'url("data:image/webp;base64,' + fs.readFileSync(portada).toString('base64') + '")' : 'none';
    });
  fs.mkdirSync(path.join(DIST, 'juegos'), { recursive: true }); fs.writeFileSync(path.join(DIST, 'juegos', id + '.html'), out);
  for (const f of J.extras || []) if (fs.existsSync(path.join(jd, f))) fs.copyFileSync(path.join(jd, f), path.join(DIST, 'juegos', path.basename(f)));   /* 4.0: páginas autónomas que acompañan al juego (la escena 3D de Codex) */ juegos.push(id + ' ' + Math.round(out.length / 1024) + ' KB');
}
const sha = b => crypto.createHash('sha1').update(b).digest('hex').slice(0, 8);
const info = { version: VER.version, motor_kb: Math.round(motor.length / 1024), mundo_kb: Math.round(mundoJS.length / 1024), html_kb: html ? Math.round(html.length / 1024) : null, sha: sha(motor), archivos: lista.length };
fs.writeFileSync(path.join(DIST, 'construccion.json'), JSON.stringify(info, null, 1));
console.log(`✓ Motor City ${VER.version}: motor.js ${info.motor_kb} KB (${lista.length} archivos) · mundo ${info.mundo_kb} KB` + (html ? ` · motor-city.html ${info.html_kb} KB` : '') + (juegos.length ? ' · juegos: ' + juegos.join(', ') : ''));
await import('./documento.mjs');   // el documento único con anexos (dist/MOTOR-CITY-TODO.md) siempre al día
