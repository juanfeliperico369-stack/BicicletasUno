#!/usr/bin/env node
/* 4.8 · ⚙️ Flexibilidad en Turno Cero: desde ⏸ Menú se abre el panel, se tocan sus filas (como una persona) y cada
   ajuste se aplica y se guarda: mano zurda (los botones pasan a la izquierda y el joystick a la mitad derecha), tamaño de
   la interfaz, velocidad de los vehículos, giro, distancia de cámara, calidad fija y control de volante. Al recargar
   la página los ajustes siguen. Uso: node pruebas/flexibilidad.mjs */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node herramientas/construir.mjs)'); process.exit(0); }
const url = (process.env.MC_PRUEBAS_URL ? new URL('dist/juegos/getaway.html', process.env.MC_PRUEBAS_URL).href : pathToFileURL(tc).href) + '?portada';
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 860, height: 412 }, hasTouch: true }), errs = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message));
const entrar = async () => { await p.goto(url); await p.waitForFunction(() => window.TURNO_LISTO); await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo && TURNO.flex, null, { timeout: 120000 });
  for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(150); } };
await entrar();
await p.evaluate(() => { try { localStorage.removeItem('flexProbada'); } catch (e) { /* nada */ } });
const antes = await p.evaluate(() => ({ vmax: TURNO.cuerpo.vmax(), acc: document.querySelector('.mcui .acciones').getBoundingClientRect().left }));
/* tocar una fila del panel: abre ⏸ → ⚙️ y toca la fila que empieza por el ícono (n veces) */
const fila = async (ico, n = 1) => { for (let i = 0; i < n; i++) { const abierto = await p.evaluate(() => !![...document.querySelectorAll('.mcui .menu')].find(m => m.textContent.includes('Flexibilidad') && m.textContent.includes('Como venía')));
  if (!abierto) { await p.click('.mcui button[aria-label="Menú"]').catch(() => p.evaluate(() => document.querySelector('.mcui .botones button').click())); await p.waitForTimeout(250); await p.locator('.mcui .menu button', { hasText: 'Flexibilidad' }).first().click(); await p.waitForTimeout(250); }
  await p.locator('.mcui .menu button', { hasText: ico }).first().click(); await p.waitForTimeout(200); } };
await fila('✋'); await fila('🔠'); await fila('🚗'); await fila('🎯'); await fila('🎥'); await fila('🎨', 2); await fila('🕹️', 2);
await p.locator('.mcui .menu button', { hasText: 'Listo' }).first().click().catch(() => {}); await p.waitForTimeout(400);
const despues = await p.evaluate(() => { const A = document.querySelector('.mcui .acciones').getBoundingClientRect(), O = MC.opciones; return { flex: TURNO.flex, zurdo: document.body.classList.contains('mc-zurdo'), accIzq: A.left < innerWidth / 2, ui: getComputedStyle(document.documentElement).getPropertyValue('--mc-ui').trim(), vmax: TURNO.cuerpo.vmax(), giro: O.giro, cam: O.camDist, auto: TURNO.vistas.auto, calidad: TURNO.vistas.calidad, control: O.control, guardado: JSON.parse(localStorage.getItem('motorcity.turnocero-v1') || '{}').flex || null }; });
/* joystick zurdo: un dedo en la mitad derecha mueve el stick */
await p.touchscreen.tap(700, 300); const st = await p.evaluate(async () => { const el = TURNO.ctl.el, r = el.getBoundingClientRect(), id = 77, ev = (t, x, y) => el.dispatchEvent(new PointerEvent(t, { pointerId: id, clientX: x, clientY: y, bubbles: true, pointerType: 'touch' }));
  ev('pointerdown', r.left + r.width * .8, r.top + r.height * .7); ev('pointermove', r.left + r.width * .8 + 40, r.top + r.height * .7); const s = { activo: TURNO.ctl.stick.activo, x: +TURNO.ctl.stick.x.toFixed(2) }; ev('pointerup', r.left + r.width * .8 + 40, r.top + r.height * .7); return s; });
/* recargar: los ajustes siguen */
await entrar(); const recarga = await p.evaluate(() => ({ flex: TURNO.flex, zurdo: document.body.classList.contains('mc-zurdo') }));
/* volver a fábrica */
await fila('↺'); const fabrica = await p.evaluate(() => ({ flex: TURNO.flex, zurdo: document.body.classList.contains('mc-zurdo') }));
errs.push(...await p.evaluate(() => MC.errores.map(e => String(e.msg || e)))); await b.close();
const F = despues.flex || {}, ok = despues.zurdo && despues.accIzq && F.mano === 'zurda' && F.ui === 1.15 && despues.ui === '1.15' && F.velocidad === 1.25 && Math.abs(despues.vmax / antes.vmax - 1.25) < .02 && despues.giro === 1.3 && despues.cam === 1.3 && !despues.auto && despues.calidad === .7 && despues.control === 'volante' && despues.guardado && despues.guardado.mano === 'zurda'
  && st.activo && recarga.zurdo && recarga.flex.velocidad === 1.25 && !fabrica.zurdo && fabrica.flex.velocidad === 1 && !errs.length;
console.log((ok ? '✓' : '✗') + ' ⚙️ Flexibilidad: el panel de ⏸ Menú cambia mano, tamaño, velocidad, giro, cámara, calidad y control; se aplica, se guarda, sigue al recargar y vuelve a fábrica · ' + JSON.stringify({ antes, despues, st, recarga: recarga.flex.mano, fabrica: fabrica.flex.mano }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
