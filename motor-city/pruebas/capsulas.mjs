#!/usr/bin/env node
/* =====================================================================
   PRUEBA · TURNO CERO EN CÁPSULAS Y EN EL CELULAR (renacimiento cenital, Fase 5 · Claude)
   En Chromium móvil (412 × 860, táctil) con dist/juegos/getaway.html:
     1. EL GARAJE SIN CARGAR EL NÚCLEO: desde la portada (🧰) se abre sin cargar ninguna ciudad; trae los 6 carros de Turno Cero
        con su dibujo pixel y las cifras de MC.Taller, la moto con su perfil de MC.Dinamica y la capa aérea (lo que vuela, capa 2).
        Se elige un carro y el mundo abierto empieza en ese carro.
     2. EL GARAJE EN EL MUNDO: desde 🎮 Modos pausa el mundo, cambia el carro y al cerrar el mundo sigue; los kilómetros de la
        colección suben al manejar.
     3. EL PASO ENTRE CÁPSULAS CONSERVA EL ESTADO: del mundo abierto cenital a las 🏎️ Carreras retro y de vuelta, quedan igual la
        posición, el rumbo, el carro, la plata, el nivel de búsqueda, el clima, la cámara y el modo; el reloj del mundo no avanza
        mientras se corre.
     4. 📏 EN LA CÁPSULA RETRO: G.Retro.medir() mide las carreras con el panel de siempre (fps, p50, p95, p99 y tirones).
     5. EL PESO: el módulo retro (47-pista.js + 70-retro.js) y el garaje juntos pesan menos de 150 KB.
     6. 0 ERRORES de consola.
   Uso: node motor.mjs construir && node pruebas/capsulas.mjs [--capturas CARPETA]
   ===================================================================== */
import path from 'node:path'; import fs from 'node:fs'; import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const A = process.argv.slice(2), CAP = A.includes('--capturas') ? path.resolve(A[A.indexOf('--capturas') + 1]) : null;
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node motor.mjs construir)'); process.exit(1); }
if (CAP) fs.mkdirSync(CAP, { recursive: true });
const b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: CAP ? 2 : 1, isMobile: true, hasTouch: true })).newPage(), errs = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
await p.goto(pathToFileURL(tc).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
const R = {}, fallas = [], espera = ms => p.waitForTimeout(ms);

/* ---------- 1. el garaje desde la portada, sin cargar ninguna ciudad ---------- */
await p.click('#bGaraje'); await espera(300);
R.portada = await p.evaluate(() => { const d = document.getElementById('garaje'), cards = [...d.querySelectorAll('.gc')], txt = d.textContent;
  return { abierto: !d.hidden, sinCiudad: !TURNO.M, tarjetas: cards.length, dibujos: d.querySelectorAll('.gc canvas').length, cifras: /km\/h/.test(txt) && /0–100/.test(txt) && /Frenada/.test(txt), moto: /se inclina/.test(txt) && /Peso adelante/.test(txt) }; });
if (CAP) await p.screenshot({ path: path.join(CAP, 'garaje-tierra.png') });
await p.click('#garaje .tabs button[data-t="aire"]'); await espera(200);
R.aire = await p.evaluate(() => { const d = document.getElementById('garaje'); return { tarjetas: d.querySelectorAll('.gc').length, techo: /Techo/.test(d.textContent), ganchos: TURNO.Garaje.capaAerea().map(v => v.id) }; });
if (CAP) await p.screenshot({ path: path.join(CAP, 'garaje-aire.png') });
await p.click('#garaje .tabs button[data-t="tierra"]'); await espera(200);
await p.click('#garaje button[data-usar="tc_noir"]'); await espera(200);
R.elegido = await p.evaluate(() => ({ veh: TURNO.veh, cerrado: document.getElementById('garaje').hidden, sinCiudad: !TURNO.M }));
if (!(R.portada.abierto && R.portada.sinCiudad && R.portada.tarjetas === 6 && R.portada.dibujos === 6 && R.portada.cifras && R.portada.moto)) fallas.push('garaje en la portada: ' + JSON.stringify(R.portada));
if (!(R.aire.tarjetas >= 2 && R.aire.techo && R.aire.ganchos.includes('jetpack') && R.aire.ganchos.includes('avioneta'))) fallas.push('capa aérea: ' + JSON.stringify(R.aire));
if (!(R.elegido.veh === 'tc_noir' && R.elegido.cerrado && R.elegido.sinCiudad)) fallas.push('elegir en la portada: ' + JSON.stringify(R.elegido));

/* el mundo abierto empieza en el carro elegido */
await p.click('#bModos'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
await p.evaluate(() => { for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove(); TURNO.pausa = false; });
await espera(600);
R.mundo = await p.evaluate(() => ({ veh: TURNO.cuerpo.veh.id }));
if (R.mundo.veh !== 'tc_noir') fallas.push('el mundo no empezó en el carro elegido: ' + R.mundo.veh);

/* ---------- 2. el garaje en el mundo abierto ---------- */
R.enMundo = await p.evaluate(async () => {
  const G = TURNO, C = G.cuerpo, e = ms => new Promise(q => setTimeout(q, ms)); const out = {};
  out.abre = G.Modos.empezar('garaje') && !document.getElementById('garaje').hidden; out.pausa = G.pausa === true;
  document.querySelector('#garaje button[data-usar="tc_arrow"]').click(); await e(300);
  out.veh = C.veh.id; out.cerrado = document.getElementById('garaje').hidden; out.sigue = G.pausa === false;
  /* los kilómetros: se mueve la moto 40 m varias veces (como si manejara) */
  for (let i = 0; i < 10; i++) { C.x += Math.cos(C.a) * 25; C.y += Math.sin(C.a) * 25; await e(120); }   /* unos 250 m */
  G.Garaje.abrir(); const txt = [...document.querySelectorAll('#garaje .gc')].find(c => c.dataset.id === 'tc_arrow').textContent; out.km = (txt.match(/([\d.]+) km/) || [])[1]; G.Garaje.cerrar();
  return out; });
if (!(R.enMundo.abre && R.enMundo.pausa && R.enMundo.veh === 'tc_arrow' && R.enMundo.cerrado && R.enMundo.sigue && +R.enMundo.km > 0)) fallas.push('garaje en el mundo: ' + JSON.stringify(R.enMundo));

/* ---------- 3. del mundo abierto a las carreras retro y de vuelta: el mismo estado ---------- */
R.capsula = await p.evaluate(async () => {
  const G = TURNO, C = G.cuerpo, e = ms => new Promise(q => setTimeout(q, ms));
  G.vistaId = 'cenital'; G.vistas.usar('cenital', G.E); await e(300);
  const foto = () => ({ x: +C.x.toFixed(2), y: +C.y.toFixed(2), a: +C.a.toFixed(3), veh: C.veh.id, dinero: G.dinero, nivel: G.busq.nivel, clima: G.climaForzado || null, vista: G.vistaId, modo: G.modo });
  C.v = 0; await e(200); const antes = foto();
  G.Retro.correr('regional', { bot: true }); await e(300); const r0 = G.reloj.min; await e(2500); const r1 = G.reloj.min;
  const x = document.querySelector('#retro button[aria-label="Salir"]'); x.click(); await e(400);
  const despues = foto(), distinto = Object.keys(antes).filter(k => antes[k] !== despues[k]);
  return { antes, despues, distinto, relojQuieto: Math.abs(r1 - r0) < 1e-6, pausaFuera: G.pausa === false };
});
if (R.capsula.distinto.length || !R.capsula.relojQuieto || !R.capsula.pausaFuera) fallas.push('el paso entre cápsulas cambió: ' + JSON.stringify(R.capsula));

/* ---------- 4. 📏 en la cápsula retro ---------- */
R.medir = await p.evaluate(async () => {
  const G = TURNO, e = ms => new Promise(q => setTimeout(q, ms)); G.Medir.SEG = 4; const ok = G.Retro.medir(); let r = null;
  for (let i = 0; i < 140 && !r; i++) { await e(100); r = G.Medir.res && G.Medir.res.tramos && G.Medir.res.tramos[0] && G.Medir.res.tramos[0].camara.includes('retro') ? G.Medir.res : null; }
  for (const d of document.querySelectorAll('.mcui .dialogo')) { const b = [...d.querySelectorAll('button')].find(x => x.textContent.includes('Listo')); if (b) b.click(); }
  await e(300); return { ok, tramos: r && r.tramos.length, camara: r && r.tramos[0].camara, cuadros: r && r.total.cuadros, fps: r && r.total.fps, p95: r && r.total.p95, dibujo_p95: r && r.total.dibujo_p95, retroCerrado: !G.Retro.activo, tramosDeSiempre: G.Medir.TRAMOS.length };
});
if (!(R.medir.ok && R.medir.tramos === 1 && /retro/i.test(R.medir.camara || '') && R.medir.cuadros > 20 && R.medir.fps > 0 && R.medir.retroCerrado && R.medir.tramosDeSiempre === 3)) fallas.push('📏 en la cápsula retro: ' + JSON.stringify(R.medir));

/* ---------- 5. el peso ---------- */
const kb = f => fs.statSync(path.join(RAIZ, f)).size / 1024;
R.peso = { pista: +kb('js/47-pista.js').toFixed(1), retro: +kb('juegos/getaway/70-retro.js').toFixed(1), garaje: +kb('juegos/getaway/71-garaje.js').toFixed(1) }; R.peso.total = +(R.peso.pista + R.peso.retro + R.peso.garaje).toFixed(1);
if (R.peso.total > 150) fallas.push('el módulo retro y el garaje pesan ' + R.peso.total + ' KB');

/* ---------- 6. errores ---------- */
errs.push(...await p.evaluate(() => (MC.errores || []).map(e => String(e.msg || e))));
await b.close();
if (errs.length) fallas.push(errs.length + ' errores: ' + errs.slice(0, 3).join(' · '));
for (const k of Object.keys(R)) console.log(k + ': ' + JSON.stringify(R[k]));
console.log(fallas.length ? '✗ 🧰 cápsulas: ' + fallas.join(' | ') : '✓ 🧰 cápsulas: el garaje sin cargar el núcleo, el carro elegido, el paso entre cápsulas sin perder nada, 📏 en las carreras retro y el peso');
process.exit(fallas.length ? 1 : 0);
