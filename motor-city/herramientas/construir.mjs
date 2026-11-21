#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · CONSTRUCCIÓN
     dist/motor.js              el motor (js/*.js en orden) en un solo cierre que publica MC
     dist/mundo-<ciudad>.js     el mundo MC4 en base64 y la configuración de la ciudad (para meter en un HTML)
     dist/motor-city.html       el banco de pruebas jugable (sandbox/): un solo HTML, sin internet
   Uso: node herramientas/construir.mjs [--ciudad medellin] [--sin-sandbox]
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
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
  if (J.mundos) { const C = {}; for (const m of J.mundos) { const f = path.join(RAIZ, 'datos', m, 'mundo.mc4'); if (!fs.existsSync(f)) { console.warn('⚠ ' + id + ': falta datos/' + m + '/mundo.mc4'); continue; } C[m] = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades', m + '.json'), 'utf8')); mundosHTML += `<script type="text/plain" id="mc4-${m}">${fs.readFileSync(f).toString('base64')}</script>\n`; }
    J._ciudades = C; }
  let mundoJ; const cfgJ = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades', cId + '.json'), 'utf8')); mundoJ = J.mundos ? `var MC_CIUDADES = ${JSON.stringify(J._ciudades)};\nvar MC_CIUDAD_BASE = ${JSON.stringify({ zonas: cfg.zonas })};\n` : `var MC_MUNDO = '${fs.readFileSync(mc).toString('base64')}';\nvar MC_CIUDAD = ${JSON.stringify(cfgJ)};\nvar MC_CIUDAD_BASE = ${JSON.stringify({ zonas: cfg.zonas })};\n`;
  /* arte en sprites: "arte": ["gemini"] en juego.json compila arte/<id>/ (atlas WebP + manifiesto + íconos + hitos + paletas) dentro del HTML */
  const arteJ = (J.arte || []).map(a => paqueteArte(a)).filter(Boolean); if (arteJ.length) mundoJ += 'var MC_ARTE = {' + arteJ.join(',') + '};\n';
  /* 4.0: modelos GLB ("modelos": "arte/modelos/turno-cero") → var MC_MODELOS = { id: base64 } (MC.Modelos los lee) */
  if (J.modelos) { const dm = path.join(RAIZ, J.modelos), MOD = {}; if (fs.existsSync(dm)) for (const f of fs.readdirSync(dm).filter(f => f.endsWith('.glb')).sort()) MOD[f.slice(0, -4)] = fs.readFileSync(path.join(dm, f)).toString('base64'); else console.warn('⚠ ' + id + ': falta ' + J.modelos); mundoJ += 'var MC_MODELOS = ' + JSON.stringify(MOD) + ';\n'; }
  const jsJ = fs.readdirSync(jd).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(jd, f), 'utf8')).join('\n');
  const chk = path.join(DIST, '.juego.check.js'); fs.writeFileSync(chk, jsJ); try { execSync('node --check ' + JSON.stringify(chk), { stdio: 'inherit' }); } finally { fs.unlinkSync(chk); }
  const out = fs.readFileSync(path.join(jd, 'index.html'), 'utf8').replace('/*CSS*/', () => fs.existsSync(path.join(jd, 'estilo.css')) ? fs.readFileSync(path.join(jd, 'estilo.css'), 'utf8') : '').replace('/*MUNDO*/', () => mundoJ).replace('/*MOTOR*/', () => motor + (J.run && fs.existsSync(path.join(RAIZ, 'run', 'run-scooter.js')) ? '\n' + fs.readFileSync(path.join(RAIZ, 'run', 'run-scooter.js'), 'utf8') : '')).replace('/*JUEGO*/', () => `(function(){'use strict';\n${jsJ}\n})();`).replace('<!--MUNDOS-->', () => mundosHTML).replaceAll('%VERSION%', VER.version);
  fs.mkdirSync(path.join(DIST, 'juegos'), { recursive: true }); fs.writeFileSync(path.join(DIST, 'juegos', id + '.html'), out);
  for (const f of J.extras || []) if (fs.existsSync(path.join(jd, f))) fs.copyFileSync(path.join(jd, f), path.join(DIST, 'juegos', path.basename(f)));   /* 4.0: páginas autónomas que acompañan al juego (la escena 3D de Codex) */ juegos.push(id + ' ' + Math.round(out.length / 1024) + ' KB');
}
const sha = b => crypto.createHash('sha1').update(b).digest('hex').slice(0, 8);
const info = { version: VER.version, motor_kb: Math.round(motor.length / 1024), mundo_kb: Math.round(mundoJS.length / 1024), html_kb: html ? Math.round(html.length / 1024) : null, sha: sha(motor), archivos: lista.length };
fs.writeFileSync(path.join(DIST, 'construccion.json'), JSON.stringify(info, null, 1));
console.log(`✓ Motor City ${VER.version}: motor.js ${info.motor_kb} KB (${lista.length} archivos) · mundo ${info.mundo_kb} KB` + (html ? ` · motor-city.html ${info.html_kb} KB` : '') + (juegos.length ? ' · juegos: ' + juegos.join(', ') : ''));
await import('./documento.mjs');   // el documento único con anexos (dist/MOTOR-CITY-TODO.md) siempre al día
