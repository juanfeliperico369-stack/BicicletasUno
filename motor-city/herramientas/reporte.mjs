#!/usr/bin/env node
/* MOTOR CITY · REPORTE · cada cambio que haga una IA (o una persona) en el motor queda escrito para que la IA del motor lo pula.
   node motor.mjs reporte "Título corto" [--juego encicla|elmetro|runscooter|otro] [--autor "IA de El Metro"]
   Crea reportes/AAAA-MM-DD-titulo.md desde reportes/PLANTILLA.md y lo suma al índice reportes/README.md. */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), args = process.argv.slice(2), titulo = args.find(a => !a.startsWith('--') && !['encicla', 'elmetro', 'runscooter', 'otro'].includes(a)) || 'Cambio sin título', arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const fecha = new Date().toISOString().slice(0, 10), slug = titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50), f = path.join(RAIZ, 'reportes', fecha + '-' + slug + '.md');
const P = fs.readFileSync(path.join(RAIZ, 'reportes', 'PLANTILLA.md'), 'utf8').replace('__TITULO__', titulo).replace('__FECHA__', fecha).replace('__JUEGO__', arg('--juego', 'motor')).replace('__AUTOR__', arg('--autor', 'sin nombre')).replace('__VERSION__', JSON.parse(fs.readFileSync(path.join(RAIZ, 'VERSION.json'))).version);
if (!fs.existsSync(f)) fs.writeFileSync(f, P); const idx = path.join(RAIZ, 'reportes', 'README.md'); fs.appendFileSync(idx, `| ${fecha} | [${titulo}](${path.basename(f)}) | ${arg('--juego', 'motor')} | ${arg('--autor', 'sin nombre')} | abierto |\n`);
console.log('✓ ' + path.relative(RAIZ, f) + ' (llénalo y súbelo con tu cambio)');
