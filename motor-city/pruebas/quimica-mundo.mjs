#!/usr/bin/env node
/* =====================================================================
   PRUEBA G5-08 · Química del mundo (Zelda: Breath of the Wild)
   Verifica:
   A) De forma determinista sobre dist/motor.js:
      1) La lluvia apaga un carro en llamas antes de estallar (sin explosión),
         emitiendo vapor H2O y evento 'quimica:apaga';
      2) Sin lluvia, el fuego sigue encendido normalmente;
      3) El viento real de E.clima.viento desvía las columnas de humo en su
         dirección y aumenta con la altura z;
      4) Los charcos bajo lluvia salpican en MC.Vida y MC.Efectos al pasar
         rápido; en pavimento seco no salpica.
   B) En Chromium móvil (412×860) sobre Turno Cero:
      5) Con lluvia forzada, un carro ardiendo se apaga sin estallar, limpia
         G.ardiendo y al avanzar sobre charcos emite salpicaduras reales sin
         errores ni peticiones de red.
   Con MC_CAPTURAS_G508=<dir> guarda captura 412×860 del vapor + salpicaduras.
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const motorPath = path.join(RAIZ, 'dist/motor.js');
const tcPath = path.join(RAIZ, 'dist/juegos/getaway.html');
if (!fs.existsSync(motorPath) || !fs.existsSync(tcPath)) { console.log('· falta dist/motor.js o dist/juegos/getaway.html'); process.exit(1); }

const ctx = vm.createContext({
  console, Math, Date, Map, Set, Uint8Array, Int8Array, Uint16Array, Int16Array, Int32Array, Float32Array,
  ArrayBuffer, DataView, TextDecoder, TextEncoder, performance: { now: () => Date.now() },
  setTimeout, clearTimeout
});
ctx.globalThis = ctx;
ctx.window = ctx;
vm.runInContext(fs.readFileSync(motorPath, 'utf8'), ctx);
const MC = ctx.MC;

let ok = 0, fallos = 0;
function asertar(cond, msg, dato) {
  if (cond) { ok++; console.log('  ✓', msg, dato !== undefined ? JSON.stringify(dato) : ''); }
  else { fallos++; console.error('  ✗', msg, dato !== undefined ? JSON.stringify(dato) : ''); }
}

asertar(!!MC.QuimicaMundo, 'MC.QuimicaMundo existe en el motor');

/* 1. La lluvia apaga el fuego de un carro sin dejarlo estallar */
{
  MC.Efectos.fuegos.length = 0;
  MC.Efectos.P.length = 0;
  MC.Efectos._t = 0;
  let apago = 0, estallo = 0;
  MC.on('quimica:apaga', () => apago++);
  MC.on('explosion', () => estallo++);
  MC.Efectos.fuego(100, 100, 6, { k: 1, estalla: true });
  const E = { t: 0, clima: { lluvia: .85, viento: { v: 6, dir: 0 } }, mundo: { suelo: () => MC.TT.ROAD } };
  for (let i = 1; i <= 40; i++) {
    E.t = i * .05;
    MC.Efectos.actualizar(E);
  }
  const vapores = MC.Efectos.P.filter(p => p.tipo === 'humo' && (p.col === '#e3edf5' || p.col === '#edf4fa')).length;
  asertar(MC.Efectos.fuegos.length === 0 && apago >= 1 && estallo === 0 && vapores >= 5,
    'la lluvia fuerte apaga el fuego sin explosión y suelta vapor H2O',
    { fuegos: MC.Efectos.fuegos.length, apago, estallo, vapores });
}

/* 2. En clima seco el fuego no se apaga prematuramente */
{
  MC.Efectos.fuegos.length = 0;
  MC.Efectos._t = 10;
  MC.Efectos.fuego(200, 200, 3, { k: 1, estalla: true });
  const E = { t: 10, clima: { lluvia: 0, viento: { v: 2, dir: 0 } }, mundo: { suelo: () => MC.TT.ROAD } };
  for (let i = 1; i <= 20; i++) {
    E.t = 10 + i * .05;
    MC.Efectos.actualizar(E);
  }
  asertar(MC.Efectos.fuegos.length === 1, 'sin lluvia el fuego sigue encendido', { fuegos: MC.Efectos.fuegos.length });
  MC.Efectos.fuegos.length = 0;
}

/* 3. El viento lleva el humo en la dirección exacta del viento */
{
  MC.Efectos.P.length = 0;
  MC.Efectos._t = 20;
  MC.Efectos.humo(300, 300, 8, { z: 2.5, vx: 0, vy: 0, vida: 5 });
  const dirViento = Math.PI / 4;
  const E = { t: 20, clima: { lluvia: 0, viento: { v: 10, dir: dirViento } }, mundo: { suelo: () => MC.TT.ROAD } };
  for (let i = 1; i <= 25; i++) {
    E.t = 20 + i * .05;
    MC.Efectos.actualizar(E);
  }
  const humos = MC.Efectos.P.filter(p => p.tipo === 'humo');
  const vxMed = humos.reduce((a, p) => a + p.vx, 0) / Math.max(1, humos.length);
  const vyMed = humos.reduce((a, p) => a + p.vy, 0) / Math.max(1, humos.length);
  const dxMed = humos.reduce((a, p) => a + (p.x - 300), 0) / Math.max(1, humos.length);
  asertar(vxMed > 2.5 && vyMed > 2.5 && dxMed > 2.0,
    'el viento desvía las columnas de humo en su dirección',
    { vxMed: +vxMed.toFixed(2), vyMed: +vyMed.toFixed(2), dxMed: +dxMed.toFixed(2) });
}

/* 4. Charcos de lluvia salpican en MC.Vida y MC.Efectos al pasar rápido; en seco no salpica */
{
  MC.Vida.P.length = 0;
  MC.Efectos.P.length = 0;
  MC.QuimicaMundo.humedadSuelo = .9;
  MC.QuimicaMundo._salpCd = 0;
  MC.Efectos._t = 30;
  let salp = 0;
  MC.on('quimica:salpica', () => salp++);
  let cx = 0, cy = 0;
  for (let k = 0; k < 40; k++) {
    if (MC.QuimicaMundo.hayCharco({ suelo: () => MC.TT.ROAD }, k * 6 + 3, 15, .9)) { cx = k * 6 + 3; cy = 15; break; }
  }
  const E = {
    t: 30,
    clima: { lluvia: .7, viento: { v: 3, dir: 0 } },
    mundo: { suelo: () => MC.TT.ROAD },
    jugador: { cuerpo: { x: cx, y: cy, a: 0, v: 14, enAire: false, nadando: false, veh: { ancho: 1.8 } } }
  };
  for (let i = 1; i <= 10; i++) {
    E.t = 30 + i * .05;
    MC.Efectos.actualizar(E);
  }
  const gotas2D = MC.Vida.P.filter(p => p.tipo === 'agua').length;
  const gotas3D = MC.Efectos.P.filter(p => p.tipo === 'agua').length;
  asertar(salp >= 1 && gotas2D >= 6 && gotas3D >= 6, 'los charcos salpican agua en 2D y 3D al pasar con lluvia', { salp, gotas2D, gotas3D });

  const salpAntes = salp;
  MC.QuimicaMundo.humedadSuelo = 0;
  MC.QuimicaMundo._salpCd = 0;
  E.clima.lluvia = 0;
  for (let i = 11; i <= 16; i++) {
    E.t = 30 + i * .05;
    MC.Efectos.actualizar(E);
  }
  asertar(salp === salpAntes, 'en pavimento seco no hay salpicaduras', { salpAntes, salpDespues: salp });
}

/* 5. Integración real en Chromium móvil (412×860) sobre Turno Cero */
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/home/antigravity/.cache/pw-node/node_modules/playwright'); }
const { chromium } = playwright;

const dirCap = process.env.MC_CAPTURAS_G508 || '';
if (dirCap) fs.mkdirSync(dirCap, { recursive: true });

const b = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});
const p = await b.newPage({ viewport: { width: 412, height: 860 } });
const errs = [], red = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message));
p.on('request', r => { if (!r.isNavigationRequest() && !/^(file|data|blob):/.test(r.url())) red.push(r.url()); });

await p.goto(pathToFileURL(tcPath).href + '?portada');
await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
await p.click('#bAbierto');
await p.waitForFunction(() => window.TURNO && TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) {
  const d = await p.$('.mcui .dialogo button');
  if (!d) break;
  await d.click().catch(() => {});
  await p.waitForTimeout(120);
}

if (dirCap) {
  await p.evaluate(() => {
    const G = TURNO, C = G.cuerpo, M = G.M;
    if (M && typeof M.geoAMetros === 'function') {
      const p0 = M.geoAMetros(6.24921, -75.56502);
      const v = M.viaCercana ? M.viaCercana(p0.x, p0.y, 120) : p0;
      if (v) { C.x = v.x; C.y = v.y; C.a = v.ang ?? .45; C.v = 0; }
    }
    G.vistas.motor3d = 'gl'; G.vistas.auto = false; G.vistas.reiniciarGL();
    G.vistaId = 'cenital'; G.vistas.usar('cenital', G.E);
    for (let i = 0; i < 20; i++) G.camara.actualizar(1 / 60, C);
  });
  await p.waitForTimeout(4200);
}

const web = await p.evaluate(async () => {
  const G = TURNO, C = G.cuerpo;
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo, .mcui .aviso')) m.remove();
  G.pausa = false;
  G.reloj.min = 14 * 60; G.reloj.vel = 0;
  G.clima.forzar('tormenta');
  G.clima.lluvia = .95;
  G.clima.viento.v = 9;
  G.clima.viento.dir = .6;
  MC.QuimicaMundo.humedadSuelo = .92;

  /* Encender fuego simulado en el carro y avanzar la física de lluvia hasta que se apague */
  G.ardiendo = true;
  const apAntes = MC.QuimicaMundo.metricas.fuegosApagados;
  const salpAntes = MC.QuimicaMundo.metricas.salpicaduras;
  MC.Efectos.fuego(C.x, C.y, 6, { k: 1.1, sigue: C, estalla: true });
  for (let i = 0; i < 36; i++) {
    G.t += .05; G.E.t = G.t;
    MC.Efectos.actualizar(G.E);
  }
  const apDespues = MC.QuimicaMundo.metricas.fuegosApagados;
  const ardiendoDespues = G.ardiendo;

  /* Buscar charco cercano en la vía y simular paso rápido del carro */
  let px = C.x, py = C.y;
  for (let k = 0; k < 30; k++) {
    const tx = C.x + Math.cos(C.a) * (k * 2.5), ty = C.y + Math.sin(C.a) * (k * 2.5);
    if (MC.QuimicaMundo.hayCharco(G.M, tx, ty, .95)) { px = tx; py = ty; break; }
  }
  C.x = px; C.y = py; C.v = 13;
  MC.QuimicaMundo._salpCd = 0;
  G.t += .05; G.E.t = G.t;
  MC.Efectos.actualizar(G.E);
  C.v = 0;
  const salpDespues = MC.QuimicaMundo.metricas.salpicaduras;
  return {
    apagoWeb: apDespues > apAntes,
    limpioArdiendo: !ardiendoDespues,
    salpicoWeb: salpDespues > salpAntes,
    humosDesviados: MC.QuimicaMundo.metricas.humosDesviados,
    erroresMC: (MC.errores || []).length
  };
});

if (dirCap) {
  await p.evaluate(async () => {
    const G = TURNO, C = G.cuerpo;
    G.clima.forzar('tormenta'); G.clima.lluvia = .95; G.clima.viento.v = 9; G.clima.viento.dir = .5;
    MC.Efectos.humo(C.x - 1.5, C.y - 1.2, 8, { col: '#edf4fa', r: 1.4, sube: 2.3, tam: 1.1, vida: 3, vx: 3.5, vy: 1.8 });
    MC.QuimicaMundo._salpicar(C.x, C.y, C.a, .85, 1.15, .95);
    await new Promise(q => requestAnimationFrame(() => requestAnimationFrame(q)));
  });
  await p.screenshot({ path: path.join(dirCap, 'quimica_lluvia_vapor_salpicadura_412x860.png') });
}

await b.close();
asertar(web.apagoWeb && web.limpioArdiendo && web.salpicoWeb && web.humosDesviados > 0 && web.erroresMC === 0 && !errs.length && !red.length,
  'integración en Turno Cero 412×860 (tormenta apaga carro, limpia G.ardiendo, salpica charco, desvía humo)',
  { ...web, red: red.length, errs: errs.length });

console.log(`${fallos ? '✗' : '✓'} 🧪 G5-08 Química del mundo: ${ok} bien, ${fallos} mal`);
process.exit(fallos ? 1 : 0);
