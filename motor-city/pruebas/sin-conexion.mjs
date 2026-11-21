#!/usr/bin/env node
/* 4.5 · prueba del modo sin conexión (sw.js): se sirve el repositorio bajo /motorcity/ como en GitHub Pages, se abre la
   portada y un juego con red, se corta la red y se vuelven a abrir. Deben abrir desde lo guardado.
   En http://localhost el navegador permite el trabajador (contexto seguro); la página solo lo registra sola en https,
   así que aquí se registra a mano con la misma ruta. Uso: node pruebas/sin-conexion.mjs */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (!u.startsWith('/motorcity/')) { r.writeHead(404); return r.end(); }
  const f = path.join(RAIZ, u.slice('/motorcity/'.length) || 'index.html'); if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const base = 'http://localhost:' + srv.address().port + '/motorcity/';
const b = await chromium.launch(), ctx = await b.newContext(), p = await ctx.newPage(); let ok = true;
try {
  await p.goto(base + 'index.html');
  await p.evaluate(async () => { await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; });
  await p.reload(); await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
  await p.goto(base + 'dist/juegos/mandados.html', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(500);
  const guardados = await p.evaluate(async () => (await (await caches.open('motorcity-v1')).keys()).map(k => new URL(k.url).pathname));
  await ctx.setOffline(true);
  const r1 = await p.goto(base + 'index.html'), t1 = await p.title();
  const r2 = await p.goto(base + 'dist/juegos/mandados.html', { waitUntil: 'domcontentloaded', timeout: 60000 }), t2 = await p.title();
  const res = { guardados: guardados.length, portada: r1 && r1.status(), titulo: t1, juego: r2 && r2.status(), tituloJuego: t2 };
  ok = guardados.some(x => x.endsWith('mandados.html')) && res.portada === 200 && res.juego === 200 && /Motor City/i.test(t1);
  console.log((ok ? '✓' : '✗') + ' sin conexión: la portada y Mandados abren desde lo guardado ' + JSON.stringify(res));
} catch (e) { ok = false; console.log('✗ sin conexión: ' + e.message); }
await b.close(); srv.close(); process.exit(ok ? 0 : 1);
