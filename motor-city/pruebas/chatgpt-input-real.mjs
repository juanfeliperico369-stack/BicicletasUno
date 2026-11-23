#!/usr/bin/env node
/**
 * CHATGPT · E2E de control REAL, Turno Cero 4.7.
 * Se diferencia expresamente de pruebas/modos.mjs:
 * NO escribe posición, velocidad, m.s, s o progreso de rivales.
 * Solo controla teclado/botón de pantalla y lee el estado del juego.
 *
 * Antes: node motor.mjs construir
 * Ejecutar: node pruebas/chatgpt-input-real.mjs
 * Por HTTP: MC_PRUEBAS_URL=http://127.0.0.1:8080/ node pruebas/chatgpt-input-real.mjs
 * Opcional: MC_DIAG_ESTRICTO=1 para devolver exit 1 ante fallos de movimiento.
 *
 * Instrumentación de escritorio y touch emulados en Chromium. No es un
 * sustituto de correr en un dispositivo Android/iOS físico.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch {
  console.error('Playwright no instalado. Instálalo en un entorno de QA adecuado; no se modifica el juego.');
  process.exit(2);
}
const target = path.join(RAIZ, 'dist/juegos/getaway.html');
if (!fs.existsSync(target) && !process.env.MC_PRUEBAS_URL) {
  console.error('Primero compila: node motor.mjs construir');
  process.exit(2);
}
const URL_ = (process.env.MC_PRUEBAS_URL
  ? new URL('dist/juegos/getaway.html', process.env.MC_PRUEBAS_URL).href
  : pathToFileURL(target).href) + '?portada';

const resultados = [];
const browser = await chromium.launch({ headless: true });
async function iniciar(viewport, touch) {
  const page = await browser.newPage({ viewport, hasTouch: touch });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL_);
  await page.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 30000 });
  await page.click('#bAbierto');
  await page.waitForFunction(() => window.TURNO && TURNO.M && TURNO.cuerpo && TURNO.modo === 'libre' && !TURNO.transicion,
    null, { timeout: 120000 });
  return { page, errors };
}
async function foto(page) {
  return page.evaluate(() => {
    const G = TURNO, C = G.cuerpo, m = G.Modos.m;
    return { t: +G.t.toFixed(2), x: +C.x.toFixed(3), y: +C.y.toFixed(3),
      a: +C.a.toFixed(4), v: +C.v.toFixed(3), modo: m && m.id,
      progreso: m && m.yo ? +m.yo.s.toFixed(2) : null,
      tren: m && m.tren ? { s: +m.s.toFixed(3), v: +m.v.toFixed(3),
        paradas: m.paradas, puertas: +m.puertas.toFixed(2) } : null };
  });
}
const dif = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const esperar = ms => new Promise(r => setTimeout(r, ms));
try {
  {
    const { page, errors } = await iniciar({ width: 860, height: 412 }, false);
    const ok = await page.evaluate(() => TURNO.Modos.empezar('carrera') === true);
    let carrera = { inicio: ok };
    if (ok) {
      await page.waitForTimeout(4200); // cuenta atrás del modo, NO atajo por estado
      const antes = await foto(page);
      await page.keyboard.down('ArrowUp'); // acelerar de forma real
      await page.waitForTimeout(4200);
      const despues = await foto(page);
      await page.keyboard.down('ArrowRight'); // intentar giro
      await page.waitForTimeout(900);
      const girado = await foto(page);
      await page.keyboard.up('ArrowRight');
      await page.keyboard.up('ArrowUp');
      await page.keyboard.down('ArrowDown'); // frenar con tecla
      await page.waitForTimeout(2000);
      const frenado = await foto(page);
      await page.keyboard.up('ArrowDown');
      carrera = { inicio: true, antes, despues, girado, frenado,
        distancia_con_teclado_m: +dif(antes, despues).toFixed(2),
        incremento_ruta_m: antes.progreso != null && despues.progreso != null
          ? +(despues.progreso - antes.progreso).toFixed(2) : null,
        velocidad_fin_acelerar: Math.abs(despues.v),
        reaccion_giro_rad: +Math.atan2(Math.sin(girado.a - despues.a),
          Math.cos(girado.a - despues.a)).toFixed(3),
        paso: dif(antes, despues) > 8 && Math.abs(despues.v) > 2 };
    }
    resultados.push({ escenario: 'carrera-teclado-no-teletransporte', ...carrera, errores: errors });
    await page.close();
  }
  {
    const { page, errors } = await iniciar({ width: 412, height: 860 }, true);
    // Acelerador fijo por un toque de interfaz; ningún cambio manual del cuerpo.
    const btn = page.locator('.mcui .acciones button.alt').first();
    const visible = await btn.isVisible().catch(() => false);
    let tactil = { disponible: visible };
    if (visible) {
      const antes = await foto(page);
      await btn.tap();
      await page.waitForTimeout(4000);
      const despues = await foto(page);
      await btn.tap();
      await page.waitForTimeout(4500);
      const parada = await foto(page);
      tactil = { disponible: true, antes, despues, parada,
        distancia_m: +dif(antes, despues).toFixed(2),
        velocidad_tras_soltar: Math.abs(parada.v),
        paso: dif(antes, despues) > 6 && Math.abs(parada.v) < 2 };
    }
    resultados.push({ escenario: 'mundo-libre-⏫-tactil-no-teletransporte',
      ...tactil, errores: errors });
    await page.close();
  }
  {
    const { page, errors } = await iniciar({ width: 860, height: 412 }, false);
    const linea = await page.evaluate(() => {
      const G = TURNO, L = G.transporte &&
        G.transporte.lineas.find(L => L.clase === 'metro' && L.est.length >= 5);
      if (!L) return null;
      G.Modos.armarTren(L); return L.nombre;
    });
    let tren = { disponible: !!linea, linea };
    if (linea) {
      await page.waitForTimeout(4200); // puertas iniciales reales
      const antes = await foto(page);
      await page.keyboard.down('Shift'); // acelerador teclado existente
      await page.waitForTimeout(6000);
      await page.keyboard.up('Shift');
      const despues = await foto(page);
      await page.keyboard.down('ArrowDown'); // probar freno teclado estándar
      await page.waitForTimeout(4000);
      await page.keyboard.up('ArrowDown');
      const frenado = await foto(page);
      tren = { disponible: true, linea, antes, despues, frenado,
        distancia_lineal_m: +dif(antes, despues).toFixed(2),
        acelero: (despues.tren?.v || 0) > (antes.tren?.v || 0) + 2,
        redujo_velocidad_tecla_freno: (frenado.tren?.v || 0) <
          (despues.tren?.v || 0) - .5 };
    }
    resultados.push({ escenario: 'metro-teclado-acel-freno-sin-m-s-forzada',
      ...tren, errores: errors });
    await page.close();
  }
  {
    const { page, errors } = await iniciar({ width: 860, height: 412 }, false);
    // Caso aislado de infraestructura ausente, sin alterar el mundo guardado:
    // se reemplaza el array SOLO durante esta llamada y se restaura en finally.
    const guardia = await page.evaluate(() => {
      const G = TURNO, T = G.M.transporte, original = T.encicla;
      let sinEstaciones, origenInvalido;
      try {
        T.encicla = [];
        try {
          sinEstaciones = { retorno: G.Modos.armarEnCicla() };
        } catch (e) { sinEstaciones = { error: String(e) }; }
        T.encicla = original;
        try {
          origenInvalido = { retorno: G.Modos.armarEnCicla({ x: NaN, y: Infinity }) };
        } catch (e) { origenInvalido = { error: String(e) }; }
      } finally { T.encicla = original; }
      return { previo: original.length, sinEstaciones, origenInvalido,
        restaurado: T.encicla === original, sinModoActivo: !G.Modos.m };
    });
    resultados.push({ escenario: 'encicla-sin-estaciones-guardia-real',
      ...guardia, paso: guardia.sinEstaciones?.retorno === false &&
        guardia.origenInvalido?.retorno === false && guardia.restaurado &&
        guardia.sinModoActivo, errores: errors });
    await page.close();
  }
} catch (error) {
  resultados.push({ escenario: 'error-instrumentacion', error: String(error.stack || error) });
} finally {
  await browser.close();
}
console.log(JSON.stringify({ autor: 'ChatGPT', version: '4.7',
  advertencia: 'Chromium emulado; NO es test en Android/iOS real; no completa todas las misiones',
  prohibido_en_test: 'mutar x,y,velocidad o progreso',
  resultados }, null, 2));
if (process.env.MC_DIAG_ESTRICTO === '1' && resultados.some(r =>
  r.errores?.length || r.error || (r.paso === false) ||
  (r.escenario.includes('metro') && r.disponible && (!r.acelero || !r.redujo_velocidad_tecla_freno))))
  process.exitCode = 1;
