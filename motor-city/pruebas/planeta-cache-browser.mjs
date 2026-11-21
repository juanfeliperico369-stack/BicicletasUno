#!/usr/bin/env node
/* C-M34 · integración de la caché con el juego real, Chromium y HTML offline.
   No afirma FPS/RAM de hardware físico. Construir antes: node motor.mjs construir. */
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
  await page.click('#bLibre');
  await page.click('#ciudades [data-c="guatape"]');
  await page.waitForFunction(() => TURNO.id === 'guatape' && !TURNO.transicion &&
    TURNO.M && TURNO.cuerpo && TURNO.vistas, { timeout: 60000 });

  const prueba = await page.evaluate(async () => {
    const p = TURNO.planeta, M = TURNO.M, antes = p.diagnosticoCache();
    const muchos = await Promise.all(Array.from({ length: 8 }, () => p.mundo('medellin')));
    const despues = p.diagnosticoCache();
    const compartido = muchos.every(w => w === muchos[0]);
    const activoConservado = p.cache.get('guatape') === M;
    await p.mundo('nueva_york');
    const tercerMapa = p.diagnosticoCache();
    const protegido = p.cache.get('guatape') === M && !p.cache.has('medellin');
    return { antes, despues, tercerMapa, compartido, activoConservado, protegido };
  });
  assert.equal(prueba.antes.activo, 'guatape');
  assert.equal(prueba.compartido, true, 'las cargas simultáneas no reutilizan el mundo');
  assert.equal(prueba.activoConservado, true);
  assert.equal(prueba.protegido, true, 'la precarga expulsó el mundo del jugador');
  assert(prueba.despues.compartidas >= 7);
  assert.equal(prueba.tercerMapa.residentes.length, 2);
  console.log('✓ Planeta: ocho cargas simultáneas comparten mapa; la ciudad jugada queda residente');

  await page.evaluate(async () => { await TURNO.entrarMundo('medellin'); });
  const fin = await page.evaluate(() => ({
    id: TURNO.id, activo: TURNO.planeta.diagnosticoCache().activo,
    sectores: TURNO.planeta.cache.size, jugador: !!TURNO.cuerpo,
    transicion: TURNO.transicion, mundo: TURNO.M.planetaId
  }));
  assert(fin.id === 'medellin' && fin.activo === 'medellin' &&
    fin.mundo === 'medellin' && !fin.transicion && fin.jugador &&
    fin.sectores <= 2, 'no se pudo cambiar a Medellín: ' + JSON.stringify(fin));
  assert.deepEqual(red, [], 'HTML offline hizo solicitudes externas');
  assert.deepEqual(errors, [], 'Errores JavaScript del navegador: ' + errors.join(' | '));
  await page.close();
  console.log('✓ Planeta: transición real Guatapé → Medellín, LRU acotado, sin red ni errores');
} finally { await browser.close(); }
