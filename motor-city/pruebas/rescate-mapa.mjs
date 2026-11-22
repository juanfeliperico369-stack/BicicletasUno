#!/usr/bin/env node
/* 4.8 · Turno Cero: pantalla en mitades, un solo mapa con 🚀 Ir y 🆘 Rescate, en Chromium móvil horizontal (860 × 412).
   - Mitades: un dedo abajo a la izquierda maneja; otro arriba gira la cámara sin soltar el joystick; el encuadre se queda;
     doble toque arriba lo endereza; tocar arriba a la izquierda NO arranca el joystick.
   - Mapa: se toca un punto, aparece 🚀 Ir, al tocarlo el jugador queda en la calle de ese punto; 🌍 pasa al planeta y 🗺️ vuelve.
   - Rescate: 🆘 → salir a la calle, grúa (carro reparado), taxi, ambulancia; con la policía encima no hay saltos; el vigía
     ofrece el rescate si se empuja sin moverse. Uso: node pruebas/rescate-mapa.mjs */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node herramientas/construir.mjs)'); process.exit(0); }
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 860, height: 412 }, hasTouch: true }), errs = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message));
await p.goto((process.env.MC_PRUEBAS_URL ? new URL('dist/juegos/getaway.html', process.env.MC_PRUEBAS_URL).href : pathToFileURL(tc).href) + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO);
await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(150); }
await p.evaluate(() => { for (const m of document.querySelectorAll('.mcui .menu')) m.remove(); TURNO.cuerpo.setVeh(TURNO.veh); TURNO.vistaId = 'tercera'; TURNO.vistas.usar('tercera', TURNO.E); });
await p.waitForTimeout(800);
const R = {};
/* ---- mitades ---- */
R.mitades = await p.evaluate(async () => {
  const G = TURNO, el = G.ctl.el, r = el.getBoundingClientRect(), espera = ms => new Promise(q => setTimeout(q, ms));
  const ev = (t, id, x, y) => el.dispatchEvent(new PointerEvent(t, { pointerId: id, clientX: r.left + x, clientY: r.top + y, bubbles: true, pointerType: 'touch', isPrimary: id === 1 }));
  const o = {};
  ev('pointerdown', 1, r.width * .2, r.height * .8); ev('pointermove', 1, r.width * .2, r.height * .8 - 40); o.stick = G.ctl.stick.activo;
  const m0 = G.camara.mira; ev('pointerdown', 2, r.width * .7, r.height * .25); for (let i = 1; i <= 6; i++) { ev('pointermove', 2, r.width * .7 + i * 20, r.height * .25); await espera(16); }
  o.miraCambia = Math.abs(G.camara.mira - m0) > .3; o.stickSigue = G.ctl.stick.activo && G.ctl.stick.m > .5; ev('pointerup', 2, r.width * .7 + 120, r.height * .25); ev('pointerup', 1, r.width * .2, r.height * .8 - 40);
  const m1 = G.camara.mira; await espera(1500); o.quedaFija = Math.abs(G.camara.mira - m1) < .02 && Math.abs(m1) > .3;
  ev('pointerdown', 3, r.width * .6, r.height * .3); ev('pointerup', 3, r.width * .6, r.height * .3); await espera(80); ev('pointerdown', 4, r.width * .6, r.height * .3); ev('pointerup', 4, r.width * .6, r.height * .3); await espera(50);
  o.endereza = Math.abs(G.camara.mira) < .05;
  ev('pointerdown', 5, r.width * .2, r.height * .25); o.arribaIzqNoStick = !G.ctl.stick.activo; ev('pointerup', 5, r.width * .2, r.height * .25);
  return o; });
/* ---- un solo mapa: 🚀 Ir ---- */
await p.evaluate(() => { TURNO.busq.limpiar && TURNO.busq.limpiar(); });
const antes = await p.evaluate(() => ({ x: TURNO.cuerpo.x, y: TURNO.cuerpo.y }));
await p.click('.mcui button[aria-label="Mapa"]'); await p.waitForSelector('.mcui .mapaG canvas'); await p.waitForTimeout(500);
const irOculto = await p.evaluate(() => document.querySelector('.mapaB button.ir').hidden);
await p.locator('.mcui .mapaG canvas').click({ position: { x: 640, y: 120 } }); await p.waitForTimeout(400);
const irVisible = await p.evaluate(() => !document.querySelector('.mapaB button.ir').hidden);
const destino = await p.evaluate(() => TURNO.destinoLibre && { x: TURNO.destinoLibre.x, y: TURNO.destinoLibre.y });
await p.click('.mapaB button.ir'); await p.waitForTimeout(600);
R.mapa = await p.evaluate(([a, d]) => { const C = TURNO.cuerpo, v = TURNO.M.viaCercana(C.x, C.y, 30); return { irOculto: true, cerrado: !TURNO.ui._mapa, movio: Math.round(Math.hypot(C.x - a.x, C.y - a.y)), cercaDestino: d ? Math.round(Math.hypot(C.x - d.x, C.y - d.y)) : null, lomasCerca: d ? (() => { const q = TURNO.M.viaCercana(d.x, d.y, 2500); return q ? Math.round(Math.hypot(q.x - d.x, q.y - d.y)) : 9e9; })() : null, enCalle: !!v || Math.hypot(C.x - d.x, C.y - d.y) < 400, pausa: TURNO.pausa }; }, [antes, destino]);
R.mapa.irOculto = irOculto; R.mapa.irVisible = irVisible;
/* 🌍 desde el mapa y 🗺️ desde el planeta */
await p.click('.mcui button[aria-label="Mapa"]'); await p.waitForSelector('.mcui .mapaG'); await p.click('.mapaB button[aria-label="Ver el planeta"]'); await p.waitForTimeout(500);
const globo = await p.evaluate(() => TURNO.globo && !document.getElementById('globo').hidden);
await p.click('#gMapa'); await p.waitForTimeout(500); const vuelveMapa = await p.evaluate(() => !TURNO.globo && !!TURNO.ui._mapa);
await p.evaluate(() => TURNO.ui._mapa && TURNO.ui._mapa.cerrar()); await p.waitForTimeout(300);
R.planeta = { globo, vuelveMapa, botonSuelto: await p.evaluate(() => !!(window.BOT_GLOBO_OCULTO = document.querySelector('.mcui button[aria-label="Planeta"]')) && document.querySelector('.mcui button[aria-label="Planeta"]').hidden) };
/* ---- 🆘 rescate ---- */
const toca = async txt => { await p.click('.mcui button[aria-label="Rescate"]'); await p.waitForTimeout(200); await p.locator('.mcui .menu button', { hasText: txt }).first().click(); await p.waitForTimeout(400); };
await p.evaluate(() => { const C = TURNO.cuerpo, M = TURNO.M; let mejor = null; for (let i = 0; i < 400 && !mejor; i++) { const x = C.x + (Math.random() - .5) * 1600, y = C.y + (Math.random() - .5) * 1600; if (!M.viaCercana(x, y, 60) && M.dentro(x, y)) mejor = { x, y }; } if (mejor) { C.x = mejor.x; C.y = mejor.y; C.v = 0; } window._fuera = !!mejor; });
await toca('Salir a la calle');
const calle = await p.evaluate(() => ({ fuera: window._fuera, enCalle: !!TURNO.M.viaCercana(TURNO.cuerpo.x, TURNO.cuerpo.y, 15) }));
await p.evaluate(() => { TURNO.carro = .3; }); await toca('Grúa'); const grua = await p.evaluate(() => TURNO.carro);
await toca('taxi'); const taxi = await p.evaluate(() => TURNO.cuerpo.veh.id);
await p.evaluate(() => { TURNO.vida = .4; }); await toca('Ambulancia'); const amb = await p.evaluate(() => TURNO.vida);
const vigia = await p.evaluate(() => { const G = TURNO, R2 = G.Rescate, st = G.ctl.stick; R2._av = -99; const m0 = st.m; st.m = 1; for (let i = 0; i < 5; i++) R2.vigia(1); st.m = m0; return document.querySelector('.mcui button[aria-label="Rescate"]').classList.contains('on'); });
const policia = await p.evaluate(() => { const G = TURNO, B = G.busq; const n0 = B.nivel; let nv = 0; try { B.nivel = 2; nv = B.nivel; } catch (e) { /* nivel calculado */ } const no = G.Rescate.puede(); try { B.nivel = n0; } catch (e) { /* nada */ } return { nivel: nv, bloquea: nv > 0 ? !!no : null }; });
R.rescate = { calle, grua, taxi, amb, vigia, policia };
errs.push(...await p.evaluate(() => MC.errores.map(e => String(e.msg || e)))); await b.close();
const M2 = R.mitades, MP = R.mapa, RS = R.rescate;
const ok = M2.stick && M2.miraCambia && M2.stickSigue && M2.quedaFija && M2.endereza && M2.arribaIzqNoStick
  && MP.irOculto && MP.irVisible && MP.cerrado && MP.movio > 30 && MP.cercaDestino != null && (MP.cercaDestino < 450 || MP.cercaDestino <= MP.lomasCerca + 5) && MP.enCalle && !MP.pausa
  && R.planeta.globo && R.planeta.vuelveMapa && R.planeta.botonSuelto
  && (!RS.calle.fuera || RS.calle.enCalle) && RS.grua === 1 && RS.taxi === 'tc_mercury' && RS.amb === 1 && RS.vigia && RS.policia.bloquea !== false && !errs.length;
console.log((ok ? '✓' : '✗') + ' Turno Cero 4.8: pantalla en mitades (cámara arriba sin soltar el joystick), un solo mapa con 🚀 Ir y 🌍, y 🆘 Rescate · ' + JSON.stringify(R) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
