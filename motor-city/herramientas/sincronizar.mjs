#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · SINCRONIZAR · copia el motor (este paquete) a la carpeta motor-city/ de un juego, o solo compara.
     node herramientas/sincronizar.mjs ../BicicletasUno            copia a ../BicicletasUno/motor-city
     node herramientas/sincronizar.mjs ../MetroZero --verificar    solo compara (versión, fuente de verdad y archivos)
   La fuente de verdad es juanfeliperico369-stack/motorcity. Si el destino tiene una versión más nueva, no copia.
   No viajan: .git, la caché de fuentes (geo/cache), las salidas de prueba, el banco de pruebas compilado
   (dist/*.html) ni el mundo en base64 (dist/mundo-*.js): cada juego los rehace con node motor-city/motor.mjs construir.
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const AQUI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), args = process.argv.slice(2), soloVer = args.includes('--verificar'), otro = args.find(a => !a.startsWith('--'));
if (!otro) { console.error('Uso: node herramientas/sincronizar.mjs RUTA_AL_JUEGO [--verificar]'); process.exit(1); }
const R = path.resolve(otro), DEST = fs.existsSync(path.join(R, 'VERSION.json')) && fs.existsSync(path.join(R, 'js', '00-nucleo.js')) ? R : path.join(R, 'motor-city');
const NO = new Set(['.git', '.github', 'cache', 'salida', '__pycache__', 'node_modules', '.DS_Store', 'web']), NO_RUTA = [/^index\.html$/, /^\.nojekyll$/, /^dist\/.*\.html$/, /^dist\/mundo-.*\.js$/, /^dist\/\.sandbox/];
const vj = p => { try { return JSON.parse(fs.readFileSync(path.join(p, 'VERSION.json'), 'utf8')); } catch (e) { return { version: '0.0.0' }; } };
const cmp = (a, b) => { const A = a.split('.').map(Number), B = b.split('.').map(Number); for (let i = 0; i < 3; i++) if ((A[i] || 0) !== (B[i] || 0)) return (A[i] || 0) - (B[i] || 0); return 0; };
const lista = (b, r = '') => { const o = []; if (!fs.existsSync(b)) return o; for (const e of fs.readdirSync(b, { withFileTypes: true })) { if (NO.has(e.name)) continue; const q = r ? r + '/' + e.name : e.name; if (e.isDirectory()) o.push(...lista(path.join(b, e.name), q)); else if (!NO_RUTA.some(x => x.test(q))) o.push(q); } return o; };
const va = vj(AQUI), vb = vj(DEST);
if (vb.fuente_de_verdad && va.fuente_de_verdad && vb.fuente_de_verdad !== va.fuente_de_verdad) console.warn('⚠ Allá dice que la fuente de verdad es «' + vb.fuente_de_verdad + '»; aquí, «' + va.fuente_de_verdad + '». Desde la 2.0 es juanfeliperico369-stack/motorcity.');
const A = lista(AQUI), B = lista(DEST), dif = A.filter(f => !fs.existsSync(path.join(DEST, f)) || !fs.readFileSync(path.join(AQUI, f)).equals(fs.readFileSync(path.join(DEST, f)))), sobra = B.filter(f => !A.includes(f));
if (soloVer) {
  console.log('Motor City: aquí ' + va.version + ' · allá ' + vb.version + ' · ' + (dif.length ? dif.length + ' archivos distintos o que faltan allá: ' + dif.slice(0, 12).join(', ') + (dif.length > 12 ? '…' : '') : 'los archivos son iguales') + (sobra.length ? ' · solo allá: ' + sobra.join(', ') : ''));
  process.exit(dif.length || va.version !== vb.version ? 1 : 0);
}
if (cmp(vb.version, va.version) > 0) { console.error('✗ El destino tiene el motor ' + vb.version + ' (más nuevo que ' + va.version + '): trae primero sus cambios a motorcity.'); process.exit(2); }
let n = 0; for (const f of A) { const d = path.join(DEST, f); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(path.join(AQUI, f), d); n++; }
console.log('✓ Motor City ' + va.version + ' copiado a ' + DEST + ' (' + n + ' archivos; antes tenía ' + vb.version + ')' + (sobra.length ? ' · quedaron allá (no son del motor 2.0): ' + sobra.join(', ') : ''));
