#!/usr/bin/env node
/* MOTOR DEL VALLE · copia el motor de este repositorio al otro juego (o al revés), sin la caché de fuentes ni las salidas.
   node motor-valle/sincronizar.mjs RUTA_AL_OTRO_REPO      (p. ej. ../metrozero o ../BicicletasUno)
   Compara VERSION.json: si el otro tiene una versión más nueva, avisa y no copia (primero hay que traer sus cambios). */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const AQUI = path.dirname(fileURLToPath(import.meta.url)), otro = process.argv[2];
if (!otro) { console.error('Uso: node motor-valle/sincronizar.mjs RUTA_AL_OTRO_REPO'); process.exit(1); }
const DEST = path.join(path.resolve(otro), 'motor-valle'), v = p => { try { return JSON.parse(fs.readFileSync(path.join(p, 'VERSION.json'), 'utf8')).version; } catch (e) { return '0.0.0'; } };
const cmp = (a, b) => { const A = a.split('.').map(Number), B = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (A[i] !== B[i]) return A[i] - B[i]; return 0; };
const va = v(AQUI), vb = v(DEST);
if (cmp(vb, va) > 0) { console.error('✗ El otro repositorio tiene el motor ' + vb + ' (más nuevo que ' + va + '): trae primero sus cambios a este.'); process.exit(2); }
const NO = new Set(['cache', 'salida', '__pycache__']); let n = 0;
const copia = (a, b) => { fs.mkdirSync(b, { recursive: true }); for (const e of fs.readdirSync(a, { withFileTypes: true })) { if (NO.has(e.name)) continue; const pa = path.join(a, e.name), pb = path.join(b, e.name); if (e.isDirectory()) copia(pa, pb); else { fs.copyFileSync(pa, pb); n++; } } };
copia(AQUI, DEST);
console.log('✓ Motor del Valle ' + va + ' copiado a ' + DEST + ' (' + n + ' archivos; antes tenía ' + vb + ')');
