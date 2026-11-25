#!/usr/bin/env node
/* =====================================================================
   PRUEBA DEL CENITAL NUEVO EN EL MODO LIBRE (99y-cenital.js · renacimiento cenital, Fase 2)
   En Chromium (SwiftShader) a 412 × 860:
     1. en el modo libre con la bandera: bruma visible, y en 3D (tercera persona) sombras de contacto y tu silueta;
     2. en un oficio (Balance) con la bandera encendida: nada cambia (sin bruma, sin sombras nuevas): la bandera es solo del modo libre;
     3. con la bandera apagada: nada cambia;
     4. 0 errores.
   Con --capturas CARPETA deja «antes» (apagada) y «después» (encendida) en 2D y en 3D.
   Uso: node tools/build.js && node tests/cenital-libre.mjs [--capturas CARPETA]
   ===================================================================== */
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), A = process.argv.slice(2), CAP = A.includes('--capturas') ? A[A.indexOf('--capturas') + 1] : null;
const FILE = path.join(root, 'dist', 'juega-encicla.html'), errores = [], R = [];
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const p = await (await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: CAP ? 2 : 1, isMobile: true, hasTouch: true })).newPage();
p.on('pageerror', e => errores.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 60000 });
if (CAP) fs.mkdirSync(CAP, { recursive: true });
async function caso(nombre, rol, libre, flag, modo3d) {
  await p.evaluate(([rol, libre, flag, modo3d]) => {
    JE.cenital.forzar = flag; JE.cenital.n.sombras = 0; JE.cenital.n.siluetas = 0; if (JE.game.mode) JE.game.stop();
    JE.game.start(rol, 1, Object.assign({ seed: 5, nov: NOVEDADES[0] }, libre ? { free: true } : {})); Mundo3D.poner(modo3d);
  }, [rol, libre, flag, modo3d]);
  await p.waitForTimeout(2600);
  const r = await p.evaluate(() => { const d = document.getElementById('cenBruma'), H = JE.cenital.huellas, reales = [...CityMap.lotC.values()].filter(v => v.real).length; return { bruma: !!(d && d.style.display !== 'none'), sombras: JE.cenital.n.sombras, siluetas: JE.cenital.n.siluetas, modo3d: Mundo3D.modo, gl: !!(Mundo3D.cv && !Mundo3D.cv.hidden), huellas: H ? H.activo : null, trozosReales: reales, trozos: CityMap.lotC.size, errores: JE.errors.slice() }; });
  R.push(Object.assign({ caso: nombre, bandera: flag }, r)); if (r.errores.length) errores.push(...r.errores.map(e => nombre + ': ' + e));
  if (CAP) await p.screenshot({ path: path.join(CAP, `${flag ? 'despues' : 'antes'}-${nombre}.png`), timeout: 60000 });
  return r;
}
const falta = [];
for (const flag of [false, true]) {
  const l2 = await caso('libre-2d', 'usuario', true, flag, null), l3 = await caso('libre-3p', 'usuario', true, flag, 'tercera'), of = await caso('balance-3p', 'balance', false, flag, 'tercera');
  if (flag) { if (!l2.bruma) falta.push('modo libre 2D: sin bruma'); if (!l3.bruma || !(l3.sombras > 0) || !(l3.siluetas > 0)) falta.push('modo libre 3D: bruma ' + l3.bruma + ', sombras ' + l3.sombras + ', siluetas ' + l3.siluetas);
    if (l2.huellas !== null && (!l2.huellas || !(l2.trozosReales > 0) || l2.trozosReales !== l2.trozos)) falta.push('modo libre: los trozos no salen de las huellas reales (' + l2.trozosReales + ' de ' + l2.trozos + ')'); }
  else if (l2.bruma || l3.sombras || l3.siluetas || l2.huellas || l2.trozosReales) falta.push('con la bandera apagada cambió el modo libre');
  if (of.bruma || of.sombras || of.siluetas || of.huellas || of.trozosReales) falta.push('el oficio Balance cambió (' + JSON.stringify(of) + ')');
}
await b.close();
if (errores.length) falta.push(errores.length + ' errores: ' + errores.slice(0, 3).join(' · '));
console.log('caso          bandera  bruma  sombras  siluetas  huellas reales  3D');
for (const r of R) console.log(r.caso.padEnd(13), (r.bandera ? 'sí' : 'no').padEnd(8), (r.bruma ? 'sí' : 'no').padEnd(6), String(r.sombras).padStart(7), String(r.siluetas).padStart(9), String(r.trozosReales + '/' + r.trozos).padStart(14), ' ', r.modo3d || '2D');
console.log(falta.length ? 'FALLA · ' + falta.join(' | ') : 'BIEN · el cenital nuevo solo cambia el modo libre, y solo con la bandera');
process.exit(falta.length ? 1 : 0);
