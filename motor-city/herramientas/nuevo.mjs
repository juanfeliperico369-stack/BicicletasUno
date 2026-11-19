#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · NUEVO · arma en segundos un juego o un módulo desde plantillas (para personas y para IA)
     node motor.mjs nuevo juego mi-juego [--mundo guatape|medellin]   → juegos/mi-juego/ (index.html, juego.js, juego.json)
     node motor.mjs nuevo modulo mi-mecanica                          → js/9X-mi-mecanica.js + su prueba en pruebas/modulos/
   Después: node motor.mjs construir  → dist/juegos/mi-juego.html (un solo archivo, sin internet).
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), [tipo, nombre] = process.argv.slice(2), arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
if (!['juego', 'modulo'].includes(tipo) || !nombre || !/^[a-z0-9-]+$/.test(nombre)) { console.error('Uso: node motor.mjs nuevo juego|modulo nombre-en-minusculas'); process.exit(1); }
const pon = (de, a, cambios) => { let s = fs.readFileSync(path.join(RAIZ, 'plantillas', de), 'utf8'); for (const [k, v] of Object.entries(cambios)) s = s.replaceAll(k, v); fs.mkdirSync(path.dirname(a), { recursive: true }); if (fs.existsSync(a)) { console.error('✗ ya existe ' + path.relative(RAIZ, a)); process.exit(2); } fs.writeFileSync(a, s); console.log('✓', path.relative(RAIZ, a)); };
const Nombre = nombre.replace(/(^|-)([a-z])/g, (m, a, b) => (a ? ' ' : '') + b.toUpperCase());
if (tipo === 'juego') { const d = path.join(RAIZ, 'juegos', nombre), mundo = arg('--mundo', 'guatape'); for (const f of ['index.html', 'juego.js', 'juego.json']) pon('juego/' + f, path.join(d, f), { '__ID__': nombre, '__NOMBRE__': Nombre, '__MUNDO__': mundo }); console.log('Siguiente: edita juegos/' + nombre + '/juego.js y corre node motor.mjs construir'); }
else { const usados = fs.readdirSync(path.join(RAIZ, 'js')).map(f => +f.slice(0, 2)).filter(n => n >= 90), num = Math.max(89, ...usados) + 1; pon('modulo/modulo.js', path.join(RAIZ, 'js', num + '-' + nombre + '.js'), { '__ID__': nombre, '__NOMBRE__': Nombre, '__CLASE__': Nombre.replace(/ /g, '') }); pon('modulo/prueba.mjs', path.join(RAIZ, 'pruebas', 'modulos', nombre + '.mjs'), { '__ID__': nombre, '__CLASE__': Nombre.replace(/ /g, '') }); console.log('Siguiente: escribe la lógica, corre node pruebas/modulos/' + nombre + '.mjs y abre un reporte: node motor.mjs reporte "Módulo ' + Nombre + '"'); }
