#!/usr/bin/env node
/* =====================================================================
   PRUEBA · EL GUARDIÁN DEL SONIDO EN TURNO CERO (js/01-sonido-guardian.js · Motor City 5.4.2 · Claude)
   El autor: «cuando se sale de la app aún sigue sonando la música». En Chromium móvil (412 × 860) con dist/juegos/getaway.html:
     1. el mundo abierto arranca y su sonido queda registrado por el guardián (sus AudioContext);
     2. al salir de la app (pause en document, como lo manda Capacitor en la APK, o app:pausa de la actividad) todo se suspende,
        también el sonido del propio juego, y nada vuelve a sonar aunque el juego lo pida;
     3. al volver (resume o app:sigue), sigue lo que sonaba;
     4. 0 errores de consola.
   Uso: node motor.mjs construir && node pruebas/sonido-guardian.mjs
   ===================================================================== */
import path from 'node:path'; import fs from 'node:fs'; import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node motor.mjs construir)'); process.exit(1); }
const b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: 412, height: 860 }, isMobile: true, hasTouch: true })).newPage(), errs = [], fallas = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
await p.goto(pathToFileURL(tc).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
/* 1. el mundo abierto arranca con un toque (y con él, su sonido) */
await p.click('#bModos'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
await p.evaluate(() => { for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove(); TURNO.pausa = false; });
await p.mouse.click(206, 430); await p.waitForTimeout(600);
const juego = await p.evaluate(() => { const G = window.guardianSonido; return { hay: !!G, motor: !!(window.MC && MC.GuardianSonido === G), contextos: G ? G.contextos : 0 }; });
if (!(juego.hay && juego.motor && juego.contextos >= 1)) fallas.push('el sonido del juego no quedó registrado: ' + JSON.stringify(juego));
/* 2 y 3. salir de la app y volver (también el sonido del propio juego) */
const s = await p.evaluate(async () => {   /* el guardián del sonido (00b-sonido-guardian.js): al salir de la app todo calla, nada vuelve a sonar aunque el juego lo pida y al volver sigue */
  const e = ms => new Promise(r => setTimeout(r, ms)), G = window.guardianSonido; if (!G) return { falta: true };
  const delJuego = G.contextos, A = new AudioContext(); for (let i = 0; i < 20 && A.state !== 'running'; i++) { A.resume(); await e(50); }
  const o = { delJuego, antes: A.state };
  document.dispatchEvent(new Event('pause')); await e(150); o.pausa = A.state; o.fuera = G.fuera;   /* lo que manda Capacitor al pausar la actividad */
  A.resume(); await e(150); o.pideSonar = A.state;
  document.dispatchEvent(new Event('resume')); await e(250); o.vuelve = A.state;
  window.dispatchEvent(new Event('app:pausa')); await e(150); o.appPausa = A.state;   /* lo que manda la actividad nativa */
  window.dispatchEvent(new Event('app:sigue')); await e(250); o.appSigue = A.state;
  A.close(); return o;
});
if (!(s.antes === 'running' && s.pausa === 'suspended' && s.fuera && s.pideSonar === 'suspended' && s.vuelve === 'running' && s.appPausa === 'suspended' && s.appSigue === 'running')) fallas.push('al salir de la app: ' + JSON.stringify(s));
const propio = await p.evaluate(async () => { const e = ms => new Promise(r => setTimeout(r, ms)); window.dispatchEvent(new Event('app:pausa')); await e(200);   /* la música del propio juego (MC.Musica) */
  const C = [MC.Musica && MC.Musica.ctx].filter(Boolean); const antes = C.map(c => c.state); window.dispatchEvent(new Event('app:sigue')); await e(300); return { antes, despues: C.map(c => c.state) }; });
if (propio.antes.some(x => x !== 'suspended')) fallas.push('la música del juego siguió con la app afuera: ' + JSON.stringify(propio));
errs.push(...await p.evaluate(() => (MC.errores || []).map(e => String(e.msg || e))));
await b.close();
if (errs.length) fallas.push(errs.length + ' errores: ' + errs.slice(0, 3).join(' · '));
console.log('juego: ' + JSON.stringify(juego) + '\nsalir y volver: ' + JSON.stringify(s) + '\nmúsica del juego: ' + JSON.stringify(propio));
console.log(fallas.length ? '✗ 🔇 guardián del sonido: ' + fallas.join(' | ') : '✓ 🔇 guardián del sonido: al salir de la app todo calla (también el juego), nada suena aunque se pida y al volver sigue');
process.exit(fallas.length ? 1 : 0);
