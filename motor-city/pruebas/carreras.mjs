#!/usr/bin/env node
/* 4.5 · Motor City · Carreras y Extremo en Chromium móvil: mundo abierto primero, banderas con pista, cuenta regresiva,
   rivales que avanzan, llegada con posición y récord guardado, sin errores. Uso: node pruebas/carreras.mjs */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
let fallo = false;
for (const id of ['carreras', 'extremo']) {
  const f = path.join(RAIZ, 'dist/juegos', id + '.html'); if (!fs.existsSync(f)) { console.log('· falta ' + f); continue; }
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true }), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(pathToFileURL(f).href); await p.waitForFunction(() => document.querySelector('#estado').textContent === 'Listo', null, { timeout: 60000 });
  await p.click('#jugar'); await p.waitForFunction(() => window.CARRERAS, null, { timeout: 90000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => { const C = window.CARRERAS, espera = ms => new Promise(q => setTimeout(q, ms)), libre = !C.carrera, ban = C.banderas.map(b => Math.round(b.pista.L));
    C.empezar(C.banderas[0]); const c = C.carrera; await espera(6500); const avanzan = c.rivales.filter(r => r.s > 3).length;
    for (let k = 0; k < 500 && C.carrera; k++) { const q = c.p.punto(c.yo.s + 25); Object.assign(C.cuerpo, { x: q.x, y: q.y, a: q.a }); await espera(25); }
    await espera(300); return { libre, ban, avanzan, rivales: c.rivales.length, fin: c.yo.fin, dialogo: !!document.querySelector('.dialogo'), record: Object.keys(JSON.parse(localStorage.getItem('motorcity.' + (window.MODO_JUEGO || 'carreras') + '.v1') || '{}').records || {}).length };
  });
  const ok = r.libre && r.ban.length >= 2 && r.ban.every(L => L > 300) && r.avanzan >= 1 && r.fin > 0 && r.dialogo && r.record >= 1 && !errs.length;
  console.log((ok ? '✓' : '✗') + ' ' + id + ': mundo abierto primero, ' + r.ban.length + ' banderas, rivales que corren, llegada y récord ' + JSON.stringify(r) + (errs.length ? ' errores: ' + errs.slice(0, 3).join(' | ') : ''));
  if (!ok) fallo = true; await b.close();
}
process.exit(fallo ? 1 : 0);
