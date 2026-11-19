#!/usr/bin/env node
/* MOTOR DEL VALLE · copia el motor de este repositorio al otro juego (o al revés), sin la caché de fuentes ni las salidas.
   node motor-valle/sincronizar.mjs RUTA_AL_OTRO_REPO      (p. ej. ../metrozero o ../BicicletasUno)
   Compara VERSION.json: si el otro tiene una versión más nueva, avisa y no copia (primero hay que traer sus cambios).
   node motor-valle/sincronizar.mjs RUTA --verificar     solo compara las dos copias (versión, fuente de verdad y archivos), sin copiar */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const AQUI = path.dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2), soloVer = args.includes('--verificar'), otro = args.find(a => !a.startsWith('--'));
if (!otro) { console.error('Uso: node motor-valle/sincronizar.mjs RUTA_AL_OTRO_REPO'); process.exit(1); }
const DEST = path.join(path.resolve(otro), 'motor-valle'), v = p => { try { return JSON.parse(fs.readFileSync(path.join(p, 'VERSION.json'), 'utf8')).version; } catch (e) { return '0.0.0'; } };
const cmp = (a, b) => { const A = a.split('.').map(Number), B = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (A[i] !== B[i]) return A[i] - B[i]; return 0; };
const va = v(AQUI), vb = v(DEST), fv = p => { try { return JSON.parse(fs.readFileSync(path.join(p, 'VERSION.json'), 'utf8')).fuente_de_verdad || ''; } catch (e) { return ''; } };
if (fv(DEST) && fv(AQUI) && fv(DEST) !== fv(AQUI)) console.warn('⚠ La otra copia dice que la fuente de verdad es «' + fv(DEST) + '»; aquí dice «' + fv(AQUI) + '». Se acordó una sola: la de VERSION.json de BicicletasUno.');
if (soloVer) {
  const NOV = new Set(['cache', 'salida', '__pycache__']), lista = (b, r = '') => { const o = []; if (!fs.existsSync(b)) return o; for (const e of fs.readdirSync(b, { withFileTypes: true })) { if (NOV.has(e.name)) continue; const q = path.join(r, e.name); if (e.isDirectory()) o.push(...lista(path.join(b, e.name), q)); else o.push(q); } return o; };
  const A = lista(AQUI), B = new Set(lista(DEST)), dif = A.filter(f => !B.has(f) || !fs.readFileSync(path.join(AQUI, f)).equals(fs.readFileSync(path.join(DEST, f)))), sob = [...B].filter(f => !A.includes(f));
  console.log('Motor del Valle: aquí ' + va + ' · allá ' + vb + ' · ' + (dif.length ? dif.length + ' archivos distintos o que faltan allá: ' + dif.join(', ') : 'los archivos son iguales') + (sob.length ? ' · solo allá: ' + sob.join(', ') : ''));
  process.exit(dif.length || va !== vb ? 1 : 0);
}
if (cmp(vb, va) > 0) { console.error('✗ El otro repositorio tiene el motor ' + vb + ' (más nuevo que ' + va + '): trae primero sus cambios a este.'); process.exit(2); }
const NO = new Set(['cache', 'salida', '__pycache__']); let n = 0;
const copia = (a, b) => { fs.mkdirSync(b, { recursive: true }); for (const e of fs.readdirSync(a, { withFileTypes: true })) { if (NO.has(e.name)) continue; const pa = path.join(a, e.name), pb = path.join(b, e.name); if (e.isDirectory()) copia(pa, pb); else { fs.copyFileSync(pa, pb); n++; } } };
copia(AQUI, DEST);
console.log('✓ Motor del Valle ' + va + ' copiado a ' + DEST + ' (' + n + ' archivos; antes tenía ' + vb + ')');
