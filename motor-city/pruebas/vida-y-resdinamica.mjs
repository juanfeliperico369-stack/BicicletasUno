/* =====================================================================
   Pruebas unitarias y benchmark de los módulos 4.2 solicitados a Antigravity:
   1. MC.Vida (js/88-vida.js): pool circular sin basura (Burnout 3 / RenderWare)
   2. MC.ResDinamica (js/05-gpu.js + js/46-vistas.js): escalador EMA con histéresis y niebla (Shadow of the Colossus)
   Uso: node pruebas/vida-y-resdinamica.mjs
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';

const RAIZ = path.resolve(import.meta.dirname, '..');
const codigo = fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8');
const ctx = { console, Math, Date, performance, setTimeout, clearTimeout, URL, TextDecoder, TextEncoder, ArrayBuffer, DataView, Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, Int16Array, Int32Array, Float32Array, Float64Array, Map, Set, WeakMap, Promise };
ctx.globalThis = ctx;
vm.runInNewContext(codigo, ctx);
const MC = ctx.MC;

let bien = 0, mal = 0;
function ok(cond, msg, extra) {
  if (cond) { bien++; console.log('  ✓', msg, extra ? JSON.stringify(extra) : ''); }
  else { mal++; console.error('  ✗', msg, extra ? JSON.stringify(extra) : ''); }
}

console.log('=== 1) MC.Vida · Pool circular sin basura (Burnout 3) ===');
{
  const V = MC.Vida;
  V.P.length = 0;
  V._t = null;
  const d0 = V.poolDiagnostico();
  const rec0 = d0.reciclados;
  const E = { t: 0, mundo: { suelo: () => MC.TT.ASPHALT, edificioEn: () => null }, jugador: { cuerpo: { x: 0, y: 0, a: 0, v: 0, vz: 0, enAire: false } } };
  const t0 = performance.now();
  for (let f = 0; f < 500; f++) {
    V.emitir(f % 2 ? 'polvo' : 'chispa', f * .2, 0, 40, { vida: .25 });
    E.t += 1 / 60;
    V.actualizar(E);
  }
  const ms = +(performance.now() - t0).toFixed(2);
  const d1 = V.poolDiagnostico();
  const emitidas = d1.reciclados - rec0;
  ok(d1.creados === V.MAX && emitidas === 20000 && d1.activas <= V.MAX && d1.activas + d1.libres === V.MAX && d1.descartados > 0,
    '20.000 emisiones en 500 cuadros sin asignar objetos extra (0 GC, sin fuga de ranuras)',
    { creados: d1.creados, emitidas, activas: d1.activas, libres: d1.libres, descartados: d1.descartados, ms });

  /* Compatibilidad con limpieza externa V.P.length = 0 */
  V.P.length = 0;
  V.emitir('agua', 10, 10, 15, { vida: .5 });
  const d2 = V.poolDiagnostico();
  ok(d2.creados === V.MAX && d2.activas === 15 && d2.libres === V.MAX - 15,
    'recupera ranuras tras V.P.length = 0 externo sin crear nuevos objetos',
    { creados: d2.creados, activas: d2.activas, libres: d2.libres });

  /* Accesibilidad: MC.opciones.particulas = 0 */
  const antes = MC.opciones.particulas;
  MC.opciones.particulas = 0;
  V.P.length = 0;
  V.emitir('polvo', 0, 0, 50);
  MC.opciones.particulas = antes;
  ok(V.P.length === 0, 'respeta MC.opciones.particulas = 0');
}

console.log('=== 2) MC.ResDinamica · Lazo cerrado EMA con histéresis y niebla (Shadow of the Colossus) ===');
{
  const rd = new MC.ResDinamica({ objetivo: 16.7 });
  for (let i = 0; i < 200; i++) rd.medir(40);
  const lento = rd.diagnostico();
  ok(lento.escala < .6 && lento.escalaPaso === .5 && lento.factorNiebla < .8 && lento.factorNiebla >= .62,
    'bajo sobrecarga (40 ms) baja escala al piso (0,50) y acorta factorNiebla', lento);

  for (let i = 0; i < 600; i++) rd.medir(5);
  const rapido = rd.diagnostico();
  ok(rapido.escala > .95 && rapido.escalaPaso === 1 && rapido.factorNiebla === 1,
    'con holgura (5 ms) recupera escalaPaso = 1,00 y factorNiebla = 1,00', rapido);

  /* Zona muerta (histéresis): 300 cuadros oscilando dentro de [12,02..15,36 ms] → 0 cambios de tamaño */
  const rd2 = new MC.ResDinamica({ objetivo: 16.7, escala: .85 });
  const cambiosAntes = rd2.cambiosRes;
  for (let i = 0; i < 300; i++) rd2.medir(13.6 + Math.sin(i * .7) * 1.1);
  const est = rd2.diagnostico();
  ok(est.cambiosRes === cambiosAntes && est.estable === true,
    'zona muerta evita redimensionar el lienzo dentro del presupuesto (0 cambios en 300 cuadros)', est);

  /* Entradas inválidas no corrompen el estado */
  const eAntes = rd2.escala;
  rd2.medir(NaN); rd2.medir(-10); rd2.medir(5000);
  ok(rd2.escala === eAntes && Number.isFinite(rd2.ms), 'ignora NaN, negativos y picos de pausa (>1000 ms)');
}

console.log(`Resumen: ${bien} bien, ${mal} mal`);
if (mal > 0) process.exit(1);
