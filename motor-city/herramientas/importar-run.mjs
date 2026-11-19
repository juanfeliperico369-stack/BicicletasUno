#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · F4 · IMPORTAR RUN SCOOTER
   Copia casi idéntico el motor de dibujo y de juego de RunRunZero (WebGL propio, modelos, escena, reglas
   del corredor y audio sintetizado) a run/run-scooter.js, con unos pocos parches con nombre, cada uno
   comprobado (si el original cambió y el parche ya no calza, se avisa y no se escribe nada):
     · relieve real: el sombreador lee 64 alturas reales del camino (uHR) en vez de las lomas inventadas
     · curvas reales: la curvatura de la vía real dobla la carretera (uBend)
     · esquinas reales: las esquinas salen en los cruces reales; al doblar, el mundo abierto dobla también
     · cielo y lluvia del mundo: la hora y el clima del motor mandan
   No se copian su interfaz (ui.js), su arranque (main.js) ni su guardado: cada juego pone los suyos.
   Uso: node herramientas/importar-run.mjs [--run ../RunRunZero]
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const i = process.argv.indexOf('--run'), RUN = path.resolve(i > 0 ? process.argv[i + 1] : path.join(RAIZ, '..', 'RunRunZero'));
const ORDEN = ['engine', 'data', 'story', 'game', 'models', 'models2', 'render', 'audio'];
let rev = '?'; try { rev = execSync('git -C ' + JSON.stringify(RUN) + ' rev-parse --short HEAD').toString().trim(); } catch (e) { /* sin git */ }
const src = Object.fromEntries(ORDEN.map(f => [f, fs.readFileSync(path.join(RUN, 'src', f + '.js'), 'utf8')]));
const PARCHES = [
  ['engine', 'relieve real: uniformes', 'uniform vec2 uBend;uniform vec4 uHill;uniform float uH0;', 'uniform vec2 uBend;uniform vec4 uHill;uniform float uH0;uniform float uHR[64];uniform vec2 uHR0;'],
  ['engine', 'relieve real: sombreador', 'if(uHill.w>0.5){float sa=uHill.z-w.z;w.y+=clamp((sa-150.0)/250.0,0.0,1.0)*(6.0*sin(uHill.x-w.z*0.0105)+2.2*sin(uHill.y-w.z*0.027))-uH0;}',
    'if(uHill.w>1.5){float sa=uHill.z-w.z;float f=clamp((sa-uHR0.x)/uHR0.y,0.0,62.99);int i=int(f);w.y+=mix(uHR[i],uHR[i+1],f-float(i))-uH0;}else if(uHill.w>0.5){float sa=uHill.z-w.z;w.y+=clamp((sa-150.0)/250.0,0.0,1.0)*(6.0*sin(uHill.x-w.z*0.0105)+2.2*sin(uHill.y-w.z*0.027))-uH0;}'],
  ['engine', 'relieve real: subir las alturas', 'gl.uniform1f(U.uH0, env.h0);', "gl.uniform1f(U.uH0, env.h0); if (env.hr && U['uHR[0]']) { gl.uniform1fv(U['uHR[0]'], env.hr); gl.uniform2f(U.uHR0, env.hr0[0], env.hr0[1]); }"],
  ['game', 'relieve real: HILL reemplazable', 'const HILL = s => {', 'let HILL = s => {'],
  ['game', 'relieve real: enganche', 'const HILLD = s => HILL(s + 0.5) - HILL(s - 0.5);', 'const HILLD = s => HILL(s + 0.5) - HILL(s - 0.5);\nRUNV.ponHill = f => { HILL = f; };'],
  ['game', 'esquinas reales: sin esquinas inventadas', "  if (k === 'corner') {", "  if (k === 'corner' && !RUNV.esquina) {"],
  ['game', 'esquinas reales: en los cruces del camino', '  const r = g.rng, s = g.genS;\n', "  const r = g.rng, s = g.genS;\n  if (RUNV.esquina && !g.free) { const c = RUNV.esquina(g, s); if (c) { g.corners.push(c); g.sideBusy[0] = g.sideBusy[1] = c.s + 12; coinLine(g, 0, c.s - 40, 6, 0.8, 3); coinLine(g, 3, c.s - 40, 6, 0.8, 3); g.genS = c.s + 14; g.nextSeg = g.genS + 90; g.segI++; return; } }\n"],
  ['game', 'esquinas reales: el mundo dobla', "  g.turns++; g.score += 50 * g.mult; style(g, 0.25); ev(g, 'turn', { dir, z: B.z, n: B.n });", "  g.turns++; g.score += 50 * g.mult; style(g, 0.25); ev(g, 'turn', { dir, z: B.z, n: B.n });\n  if (RUNV.gira) RUNV.gira(c, dir);"],
  ['render', 'curvas reales', 'E.bend[0] = mode === \'garage\' ? 0 : 0.0017 * Math.sin(P.s / 520) * Math.sin(P.s / 190 + 0.7) * (1 - Math.min(1, Math.abs(this.turnA || 0)));', 'E.bend[0] = mode === \'garage\' ? 0 : (RUNV.bend ? RUNV.bend(P.s) : 0.0017 * Math.sin(P.s / 520) * Math.sin(P.s / 190 + 0.7)) * (1 - Math.min(1, Math.abs(this.turnA || 0)));'],
  ['render', 'relieve real: alturas al sombreador', 'E.hill[3] = hOn; E.h0 = HILL(P.s); this.sl = hOn ? HILLD(P.s) : 0;', 'E.hill[3] = hOn; E.h0 = HILL(P.s); this.sl = hOn ? HILLD(P.s) : 0; if (RUNV.hr && hOn) { const q = RUNV.hr(P.s); E.hill[3] = 2; E.hr = q.h; E.hr0 = q.o; } else E.hr = null;'],
  ['render', 'cielo del mundo', '    this.zoneEnv(g, P.s);\n', '    this.zoneEnv(g, P.s); if (RUNV.cielo && mode !== \'garage\') RUNV.cielo(this.env, g);\n'],
  ['render', 'lluvia del mundo', "rt = mode === 'garage' ? 0 : RAINY(ed) ?", "rt = mode === 'garage' ? 0 : RUNV.lluvia != null ? RUNV.lluvia : RAINY(ed) ?"]
];
let mal = 0;
for (const [f, nombre, viejo, nuevo] of PARCHES) {
  const n = src[f].split(viejo).length - 1;
  if (n !== 1) { console.error('✗ parche «' + nombre + '» (' + f + '.js): el texto aparece ' + n + ' veces'); mal++; continue; }
  src[f] = src[f].replace(viejo, () => nuevo); console.log('✓', nombre);
}
if (mal) { console.error('No se escribió run/run-scooter.js: ' + mal + ' parches no calzan con RunRunZero ' + rev + '. Revísalos en herramientas/importar-run.mjs.'); process.exit(1); }
const cuerpo = ORDEN.map(f => `/* ---- RunRunZero/src/${f}.js ---- */\n` + src[f]).join('\n');
const salida = `/* RUN SCOOTER dentro de Motor City · copia casi idéntica de RunRunZero ${rev} (motor WebGL propio, modelos, escena, reglas y audio)
   con ${PARCHES.length} parches con nombre (herramientas/importar-run.mjs). Generado: no editar a mano.
   © Run Scooter (juanfeliperico369-stack/RunRunZero), mismo autor. */
(function (MC) {
'use strict';
if (!MC) return;
const RUNV = {};
${cuerpo}
MC.RunScooter = { version: ${JSON.stringify(rev)}, RUNV, R, RN, AU, MOD, VEH, VEHI, ZONES, newGame, step, input, aiThink, revive, makeAtlas, LX, NL, DT, HILLD: s => HILLD(s), GRAV };
})(typeof window !== 'undefined' ? window.MC : globalThis.MC);
`;
fs.mkdirSync(path.join(RAIZ, 'run'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'run', 'run-scooter.js'), salida);
execSync('node --check ' + JSON.stringify(path.join(RAIZ, 'run', 'run-scooter.js')), { stdio: 'inherit' });
fs.writeFileSync(path.join(RAIZ, 'run', 'ORIGEN.json'), JSON.stringify({ repositorio: 'juanfeliperico369-stack/RunRunZero', commit: rev, archivos: ORDEN.map(f => 'src/' + f + '.js'), parches: PARCHES.map(p => p[0] + ': ' + p[1]), fecha: new Date().toISOString().slice(0, 10) }, null, 1));
console.log('✓ run/run-scooter.js', (salida.length / 1024).toFixed(0), 'KB de RunRunZero', rev);
