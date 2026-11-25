#!/usr/bin/env node
/* Fase 1 · capturas «antes y después» del saneamiento en las 6 zonas piloto, con el propio El Metro (Ciudad Libre, 412 × 860):
   3D Cenital y 2D. No cambia el juego. Compila El Metro antes de correrla (node tools/build.mjs).
   Uso: node reportes/fase1-cenital/capturas-elmetro.mjs ../MetroZero CARPETA_SALIDA ETIQUETA   (ETIQUETA: antes o despues) */
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';
const [EM, OUT, ET] = process.argv.slice(2); if (!EM || !OUT || !ET) { console.error('Uso: node capturas-elmetro.mjs RUTA_ELMETRO SALIDA ETIQUETA'); process.exit(1); }
const { chromium } = createRequire(path.join(path.resolve(EM), 'tools', 'test.mjs'))('playwright');
const ZONAS = { 'centro-la-candelaria': [6.2503, -75.5675], 'laureles': [6.2445, -75.5925], 'el-poblado': [6.2087, -75.5677], 'ladera-santo-domingo': [6.2925, -75.5420], 'rio-y-viaducto-industriales': [6.2302, -75.5760], 'rural-santa-elena': [6.2094, -75.4995] };
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 2 })).newPage(), err = [];
page.on('pageerror', e => err.push(e.message));
await page.goto('file://' + path.join(path.resolve(EM), 'dist', 'index.html')); await page.waitForFunction(() => window.EM && EM.ready, null, { timeout: 60000 });
await page.waitForFunction(() => EM.vcity && EM.vcity.on, null, { timeout: 60000 });
for (const [nom, [la, lo]] of Object.entries(ZONAS)) for (const v of ['cen3d', '2d']) {
  await page.evaluate(([la, lo, v]) => { if (!EM.game.mode || EM.game.mode !== EM.modes.libre) EM.game.start('libre', 'lb:San Antonio', { seed: 5 }); const VM = VALLE_META, x = (lo - VM.lon0) * VM.kx * 20, y = (VM.latN - la) * VM.ky * 20; EM.modes.libre.llevar(EM.game.st, x, y, false); EM.modes.libre.vista(EM.game.st, v); EM.game.freeze(false); }, [la, lo, v]);
  await page.waitForTimeout(v === '2d' ? 1800 : 2600); await page.evaluate(() => EM.game.freeze(true)); await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, `${ET}-${nom}-${v}.png`), timeout: 30000 });
}
await browser.close(); console.log('capturas en', OUT, '· errores de consola:', err.length, err.slice(0, 2));
