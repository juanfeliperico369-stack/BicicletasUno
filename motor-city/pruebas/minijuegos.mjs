#!/usr/bin/env node
/* =====================================================================
   PRUEBA G5-04 · Minijuegos táctiles cortos (Turno Cero · Chinatown Wars)
   Verifica en Chromium móvil (412×860 y 860×412):
   1) Registro aditivo en Modos.DEF.minijuegos y G.Minijuegos (separación 18+ vs familia);
   2) Los 4 minijuegos (puentear, chapa, llanta, cadena):
      - abren sobre G.ui sin errores, pausan el mundo (G.pausa === true) y pasan MC.UI.verificar(G.ui);
      - duran entre 10 y 20 s y tienen botón ✕ Salir >= 48×48 px accesible;
      - salida inmediata (✕ Salir / Escape) cierra sin bloquear y restaura G.pausa = false;
      - interacción táctil real (PointerEvents en el canvas) completa cada minijuego,
        entrega recompensa y restaura el juego limpio;
   3) Capturas WebP en reportes/img/gemini-g5-04/ (opcional con MC_CAPTURAS_G504).
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/home/antigravity/.cache/pw-node/node_modules/playwright'); }
const { chromium } = playwright;

const tc = path.join(RAIZ, 'dist/juegos/getaway.html');
if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html'); process.exit(1); }

const dirCap = process.env.MC_CAPTURAS_G504 || '';
if (dirCap) fs.mkdirSync(dirCap, { recursive: true });

const b = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
});
const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true });
const errs = [], red = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message));
p.on('request', r => { if (!r.isNavigationRequest() && !/^(file|data|blob):/.test(r.url())) red.push(r.url()); });

await p.goto(pathToFileURL(tc).href + '?portada');
await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
await p.click('#bAbierto');
await p.waitForFunction(() => window.TURNO && TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) {
  const d = await p.$('.mcui .dialogo button');
  if (!d) break;
  await d.click().catch(() => {});
  await p.waitForTimeout(120);
}
await p.evaluate(() => {
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove();
  TURNO.pausa = false;
});

/* 1. Verificar API, separación 18+ vs familia y registro en Modos.DEF */
const meta = await p.evaluate(() => {
  const M = TURNO.Minijuegos;
  return {
    existe: !!M,
    enModos: !!(TURNO.Modos && TURNO.Modos.DEF && TURNO.Modos.DEF.minijuegos),
    adulto: M ? M.lista('adulto').map(d => d.id) : [],
    familia: M ? M.lista('familia').map(d => d.id) : [],
    dursOk: M ? M.lista().every(d => d.dur >= 10 && d.dur <= 20) : false
  };
});

/* Helper para arrastrar sobre el canvas del minijuego usando eventos de puntero */
async function arrastrarCanvas(pts) {
  await p.evaluate(async puntos => {
    const cv = document.querySelector('.mcui .mc-mini canvas');
    const r = cv.getBoundingClientRect();
    const sx = r.width / cv.width, sy = r.height / cv.height;
    const ev = (tipo, x, y) => cv.dispatchEvent(new PointerEvent(tipo, {
      bubbles: true, cancelable: true, pointerId: 7, isPrimary: true, pointerType: 'touch',
      clientX: r.left + x * sx, clientY: r.top + y * sy
    }));
    ev('pointerdown', puntos[0][0], puntos[0][1]);
    for (let i = 1; i < puntos.length; i++) {
      await new Promise(q => setTimeout(q, 24));
      ev('pointermove', puntos[i][0], puntos[i][1]);
    }
    await new Promise(q => setTimeout(q, 24));
    ev('pointerup', puntos[puntos.length - 1][0], puntos[puntos.length - 1][1]);
  }, pts);
}

/* 2. Probar salida limpia con botón ✕ Salir (no bloquea, >= 48x48 px, UI sin choques) */
const salida = await p.evaluate(async () => {
  const pr = TURNO.Minijuegos.abrir('puentear', { determinista: true, callado: true });
  await new Promise(q => setTimeout(q, 120));
  const btn = document.querySelector('.mcui .mc-mini-salir');
  const rect = btn ? btn.getBoundingClientRect() : null;
  const pausaAbierto = !!TURNO.pausa;
  const uiMalos = MC.UI.verificar(TURNO.ui);
  if (btn) btn.click();
  const res = await pr;
  return {
    pausaAbierto,
    pausaDespues: !!TURNO.pausa,
    btnW: rect ? Math.round(rect.width) : 0,
    btnH: rect ? Math.round(rect.height) : 0,
    uiMalos: uiMalos.length,
    cancelado: !!res.cancelado,
    cerrado: !document.querySelector('.mcui .mc-mini')
  };
});

/* 3. Probar los 4 minijuegos hasta ganarlos con interacción táctil real */
const resultados = {};

/* 3a. puentear (18+): conectar los 3 cables por color */
{
  const dineroAntes = await p.evaluate(() => TURNO.dinero);
  const prom = p.evaluate(() => { window._mRes = TURNO.Minijuegos.abrir('puentear', { determinista: true }); });
  await p.waitForSelector('.mcui .mc-mini[data-minijuego="puentear"]');
  await p.waitForTimeout(160);
  if (dirCap) await p.screenshot({ path: path.join(dirCap, 'minijuego_puentear_412x860.png') });
  const cables = await p.evaluate(() => TURNO.Minijuegos.activo.juego.cables.map(c => [c.x0, c.y0, c.x1, c.y1]));
  for (const [x0, y0, x1, y1] of cables) {
    await arrastrarCanvas([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2], [x1, y1]]);
    await p.waitForTimeout(80);
  }
  await prom;
  const res = await p.evaluate(async () => await window._mRes);
  const dineroDespues = await p.evaluate(() => TURNO.dinero);
  resultados.puentear = { ok: res.ok, pausa: !!await p.evaluate(() => TURNO.pausa), deltaPlata: dineroDespues - dineroAntes };
}

/* 3b. chapa (18+): subir los 3 pines a lineaY y sostener 0.35 s */
{
  const dineroAntes = await p.evaluate(() => TURNO.dinero);
  await p.evaluate(() => { window._mRes = TURNO.Minijuegos.abrir('chapa', { determinista: true }); });
  await p.waitForSelector('.mcui .mc-mini[data-minijuego="chapa"]');
  await p.waitForTimeout(160);
  if (dirCap) await p.screenshot({ path: path.join(dirCap, 'minijuego_chapa_412x860.png') });
  const info = await p.evaluate(() => ({ lineaY: TURNO.Minijuegos.activo.juego.lineaY, pines: TURNO.Minijuegos.activo.juego.pines.map(q => [q.x, q.y]) }));
  for (const [px, py] of info.pines) {
    await p.evaluate(async ([x, y0, y1]) => {
      const cv = document.querySelector('.mcui .mc-mini canvas');
      const r = cv.getBoundingClientRect(), sx = r.width / cv.width, sy = r.height / cv.height;
      const ev = (tipo, y) => cv.dispatchEvent(new PointerEvent(tipo, { bubbles: true, cancelable: true, pointerId: 8, isPrimary: true, pointerType: 'touch', clientX: r.left + x * sx, clientY: r.top + y * sy }));
      ev('pointerdown', y0);
      ev('pointermove', y1);
      await new Promise(q => setTimeout(q, 480));
      ev('pointerup', y1);
    }, [px, py, info.lineaY]);
    await p.waitForTimeout(60);
  }
  const res = await p.evaluate(async () => await window._mRes);
  const dineroDespues = await p.evaluate(() => TURNO.dinero);
  resultados.chapa = { ok: res.ok, pausa: !!await p.evaluate(() => TURNO.pausa), deltaPlata: dineroDespues - dineroAntes };
}

/* 3c. llanta (familia/bici): bombear hasta entrar en 50–62 PSI y sostener 1.4 s */
{
  await p.evaluate(() => { window._mRes = TURNO.Minijuegos.abrir('llanta'); });
  await p.waitForSelector('.mcui .mc-mini[data-minijuego="llanta"]');
  await p.waitForTimeout(160);
  for (let i = 0; i < 5; i++) {
    await p.click('.mcui .mc-mini-accion');
    await p.waitForTimeout(90);
  }
  if (dirCap) await p.screenshot({ path: path.join(dirCap, 'minijuego_llanta_412x860.png') });
  await p.waitForTimeout(1700);
  const res = await p.evaluate(async () => await window._mRes);
  resultados.llanta = { ok: res.ok, pausa: !!await p.evaluate(() => TURNO.pausa), biciAfinada: (await p.evaluate(() => TURNO._biciAfinadaT || 0)) > 0 };
}

/* 3d. cadena (familia/bici): arrastrar la guía por los 3 puntos del piñón */
{
  await p.evaluate(() => { window._mRes = TURNO.Minijuegos.abrir('cadena'); });
  await p.waitForSelector('.mcui .mc-mini[data-minijuego="cadena"]');
  await p.waitForTimeout(160);
  if (dirCap) await p.screenshot({ path: path.join(dirCap, 'minijuego_cadena_412x860.png') });
  const ruta = await p.evaluate(() => {
    const J = TURNO.Minijuegos.activo.juego;
    return [[J.guia.x, J.guia.y]].concat(J.puntos.map(q => [q.x, q.y]));
  });
  await arrastrarCanvas(ruta);
  const res = await p.evaluate(async () => await window._mRes);
  resultados.cadena = { ok: res.ok, pausa: !!await p.evaluate(() => TURNO.pausa) };
}

/* 4. Verificar también vista horizontal 860×412 sin desborde y cierre con Escape */
await p.setViewportSize({ width: 860, height: 412 });
const horiz = await p.evaluate(async () => {
  const pr = TURNO.Minijuegos.abrir('chapa', { callado: true });
  await new Promise(q => setTimeout(q, 140));
  const box = document.querySelector('.mcui .mc-mini')?.getBoundingClientRect();
  return {
    cabeEn860x412: !!(box && box.top >= 0 && box.bottom <= 412 && box.left >= 0 && box.right <= 860),
    prOk: !!pr
  };
});
if (dirCap) await p.screenshot({ path: path.join(dirCap, 'minijuego_chapa_860x412.png') });
await p.keyboard.press('Escape');
await p.waitForTimeout(120);
const escCerrado = await p.evaluate(() => !document.querySelector('.mcui .mc-mini') && !TURNO.pausa);

errs.push(...await p.evaluate(() => (MC.errores || []).map(e => String(e.msg || e))));
await b.close();

const ok = meta.existe && meta.enModos && meta.dursOk
  && meta.adulto.length === 2 && meta.familia.length === 2
  && salida.pausaAbierto && !salida.pausaDespues && salida.btnW >= 48 && salida.btnH >= 48 && salida.uiMalos === 0 && salida.cancelado && salida.cerrado
  && resultados.puentear.ok && !resultados.puentear.pausa && resultados.puentear.deltaPlata === 120
  && resultados.chapa.ok && !resultados.chapa.pausa && resultados.chapa.deltaPlata === 150
  && resultados.llanta.ok && !resultados.llanta.pausa && resultados.llanta.biciAfinada
  && resultados.cadena.ok && !resultados.cadena.pausa
  && horiz.cabeEn860x412 && escCerrado
  && !red.length && !errs.length;

console.log((ok ? '✓' : '✗') + ' 🔧 G5-04 Minijuegos táctiles cortos (Chinatown Wars): puentear, chapa, llanta y cadena en 412×860 y 860×412, salida sin bloqueo · ' + JSON.stringify({ meta, salida, resultados, horiz, escCerrado, red: red.length }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
