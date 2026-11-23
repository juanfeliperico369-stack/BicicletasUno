#!/usr/bin/env node
/* 5.2 · G5-12 · 📏 Medir el rendimiento (Turno Cero ?medir), en Chromium a 860 × 412.
   - ?medir=4 abre el mundo abierto solo y el bot maneja 4 s en cada cámara (cenital, tercera persona y ciudad 3D);
   - al final: el panel con fps, p50/p95/p99, tirones, memoria y GPU; el bot se movió de verdad;
   - «📋 Copiar resultados» deja el texto y el JSON en el portapapeles;
   - también está en ⏸ Menú → 📏 Medir el rendimiento.
   Uso: node pruebas/medir.mjs */
import path from 'node:path'; import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), ctx = await b.newContext({ viewport: { width: 860, height: 412 } }), p = await ctx.newPage(), errs = [];
await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(path.join(RAIZ, 'dist/juegos/getaway.html')).href + '?medir=4');
await p.waitForFunction(() => window.TURNO && TURNO.Medir && TURNO.Medir.res, null, { timeout: 180000 });
const R = await p.evaluate(() => TURNO.Medir.res), dlg = await p.evaluate(() => [...document.querySelectorAll('.mcui .dialogo')].map(d => d.textContent).find(t => /Resultados de la medición/.test(t)) || '');
await p.screenshot({ path: path.join(RAIZ, 'reportes/medir-5.2.jpg'), type: 'jpeg', quality: 78 });
for (const x of await p.$$('.mcui .dialogo button')) if (/Copiar/.test(await x.textContent())) { await x.click(); break; }
await p.waitForTimeout(600);
const copiado = await p.evaluate(async () => { try { return await navigator.clipboard.readText(); } catch (e) { return 'ERR ' + e.message; } });
await b.close();
const T = R.total || {}, ok = R.tramos && R.tramos.length === 3 && new Set(R.tramos.map(t => t.camara)).size === 3 && R.tramos.every(t => t.cuadros > 20) && T.cuadros > 60 && T.p50 > 0 && T.p95 >= T.p50 && T.p99 >= T.p95 && R.recorrido_m > 25 && R.gpu && R.gpu.nivel && R.pantalla && /Resultados de la medición/.test(dlg) && /fps/.test(dlg) && /Total/.test(dlg) && /📏 Turno Cero/.test(copiado) && /"total"/.test(copiado) && !errs.length;
console.log((ok ? '✓' : '✗') + ' 📏 G5-12 · Medir el rendimiento: ?medir abre solo, el bot maneja en 3 cámaras, panel con fps/p50/p95/p99/tirones/memoria/GPU y 📋 copiar · ' + JSON.stringify({ total: T, tramos: (R.tramos || []).map(t => t.camara + ' ' + t.fps + ' fps p95 ' + t.p95), recorrido_m: R.recorrido_m, memoria: R.memoria, gpu: R.gpu && R.gpu.nivel, copiado: copiado.slice(0, 80) }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
