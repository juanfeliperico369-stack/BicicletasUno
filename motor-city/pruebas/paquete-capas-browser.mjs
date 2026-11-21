#!/usr/bin/env node
/* C-M34: navegador real (Chromium) abre el HTML final desconectado,
   inicia Calle libre en Guatapé y carga las otras dos ciudades del planeta.
   No equivale a medir un teléfono real con GPU. */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'dist/juegos/getaway.html')).href;
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true });
  const errors = [], red = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/^https?:/.test(r.url())) red.push(r.url()); });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.TURNO_LISTO && !!window.TURNO?.planeta, { timeout: 30000 });
  const paquete = await page.evaluate(() => ['guatape', 'medellin', 'nueva_york'].every(id =>
    !!document.getElementById('mc4meta-' + id) && !document.getElementById('mc4-' + id)));
  assert(paquete, 'El HTML no está usando el paquete offline por capas');
  await page.click('#bLibre');
  await page.click('#ciudades [data-c="guatape"]');
  await page.waitForFunction(() => window.TURNO?.id === 'guatape' && !TURNO.transicion &&
    TURNO.cuerpo && TURNO.vistas, { timeout: 60000 });
  const vivo = await page.evaluate(() => ({
    id: TURNO.id, x: TURNO.cuerpo.x, y: TURNO.cuerpo.y,
    suelo: TURNO.M.suelo(TURNO.cuerpo.x, TURNO.cuerpo.y),
    paquete: !TURNO.M.u8, n: TURNO.M._c.size
  }));
  assert(vivo.id === 'guatape' && Number.isFinite(vivo.x) && Number.isFinite(vivo.y) && vivo.paquete && vivo.n > 0);
  console.log('✓ Guatapé: partida real desde portada en HTML offline, capas diferidas', vivo.n);
  for (const id of ['medellin', 'nueva_york']) {
    const dato = await page.evaluate(async id => {
      const M = await TURNO.planeta.mundo(id);
      return { id, w: M.W, h: M.H, capa: M._c.has('suelo'), paquete: !M.u8 };
    }, id);
    assert(dato.w > 0 && dato.h > 0 && dato.capa && dato.paquete, 'Mundo inválido: ' + id);
    console.log('✓', id, 'cargado desde capas comprimidas offline');
  }
  assert.deepEqual(red, [], 'No debe haber solicitudes a Internet');
  assert.deepEqual(errors, [], 'Errores de ejecución: ' + errors.join(' | '));
  await page.close();
  console.log('✓ C-M34 Chromium 412×860: partida + tres ciudades offline, sin errores JS ni red');
} finally { await browser.close(); }
