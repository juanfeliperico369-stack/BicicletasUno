#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · EXPORTAR · un pedazo de un mundo a formatos de motores más potentes (Godot, Unity, Unreal, Blender, three.js)
     node motor.mjs exportar guatape                     → 600 × 600 m alrededor del centro del pueblo
     node motor.mjs exportar medellin --centro 3200,4100 --lado 800 --paso 4
   Sale en dist/exportar/<mundo>/: mundo.glb (glTF 2.0), alturas.r16 + alturas.json (terreno RAW 16 bits), escena.json y LEEME.md.
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), A = process.argv.slice(2), id = A.find(a => !a.startsWith('--')) || 'guatape', opt = k => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : null; };
const ctx = { console, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8'), ctx); const MC = ctx.MC;
const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades', id + '.json'), 'utf8')), M = new MC.Mundo(new Uint8Array(fs.readFileSync(path.join(RAIZ, 'datos', id, 'mundo.mc4'))), cfg); M.cfg = M.cfg || cfg;
let [cx, cy] = opt('centro') ? opt('centro').split(',').map(Number) : [NaN, NaN]; if (!(cx >= 0 && cy >= 0)) { const L = M.lugares || []; cx = L.reduce((s, l) => s + l.x, 0) / (L.length || 1) || M.ancho / 2; cy = L.reduce((s, l) => s + l.y, 0) / (L.length || 1) || M.alto / 2; }
const lado = +(opt('lado') || 600), paso = +(opt('paso') || 4), caja = [cx - lado / 2, cy - lado / 2, cx + lado / 2, cy + lado / 2].map(Math.round), out = path.join(RAIZ, 'dist/exportar', id); fs.mkdirSync(out, { recursive: true });
const t0 = Date.now(), glb = MC.Exportar.glb(M, caja, { paso }), Al = MC.Exportar.alturas(M, caja, paso), esc = MC.Exportar.escena(M, caja);
fs.writeFileSync(path.join(out, 'mundo.glb'), glb); fs.writeFileSync(path.join(out, 'alturas.r16'), MC.Exportar.r16(Al));
fs.writeFileSync(path.join(out, 'alturas.json'), JSON.stringify({ ancho: Al.w, alto: Al.h, paso_m: Al.paso, min_m: +Al.min.toFixed(2), max_m: +Al.max.toFixed(2), caja: Al.caja, formato: 'RAW 16 bits sin signo, little endian; altura = min + valor / 65535 × (max − min)' }, null, 1));
fs.writeFileSync(path.join(out, 'escena.json'), JSON.stringify(esc));
fs.writeFileSync(path.join(out, 'LEEME.md'), `# ${cfg.nombre} · exportado de Motor City ${MC.version}

Caja: ${caja.join(', ')} (metros del mundo; ${lado} × ${lado} m alrededor de ${Math.round(cx)}, ${Math.round(cy)}).
- \`mundo.glb\`: glTF 2.0, con terreno, ${esc.edificios.length} edificios, ${esc.vias.length} vías y ${esc.arboles.length} árboles. Un material con colores por vértice; +Y arriba, en metros, y el origen en el centro de la caja.
- \`alturas.r16\` y \`alturas.json\`: ${Al.w} × ${Al.h} muestras cada ${paso} m, de ${Al.min.toFixed(1)} a ${Al.max.toFixed(1)} m.
- \`escena.json\`: edificios, vías, árboles y lugares, para poner la lógica y el arte propios.

## Cómo se abre
- **Godot 4:** arrastra \`mundo.glb\` a la carpeta del proyecto y luego a la escena. Para la lógica, lee \`escena.json\` con \`JSON.parse_string\`.
- **Unity:** importa \`mundo.glb\` con el paquete *glTFast* (Unity). Para un *Terrain*: Import Raw → \`alturas.r16\` (16 bits, Windows/little endian, ${Al.w} × ${Al.h}). El alto es ${(Al.max - Al.min).toFixed(1)} m.
- **Unreal 5:** File → Import → \`mundo.glb\` (Interchange). O un *Landscape* desde \`alturas.r16\`, con la escala Z = (max − min) / 512 × 100.
- **Blender:** Archivo → Importar → glTF 2.0.
- **three.js y Babylon:** \`GLTFLoader\` y \`SceneLoader\` cargan \`mundo.glb\` tal cual.

Atribución: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; relieve SRTM/NASA (AWS Terrain Tiles).
`);
console.log('✓ ' + id + ' exportado en dist/exportar/' + id + '/ · glb ' + Math.round(glb.length / 1024) + ' KB · ' + esc.edificios.length + ' edificios · ' + esc.vias.length + ' vías · ' + esc.arboles.length + ' árboles · ' + Al.w + '×' + Al.h + ' alturas · ' + (Date.now() - t0) + ' ms');
