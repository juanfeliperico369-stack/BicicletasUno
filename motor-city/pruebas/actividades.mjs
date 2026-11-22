#!/usr/bin/env node
/* 4.7 · Actividades en el mundo abierto de Turno Cero: alrededor del inicio en Medellín hay marcas reales de varios tipos
   (🏁 🚵 📦 🛹 🛴 🚇), los capítulos y vehículos están liberados, y ▶ Jugar desde una marca arranca el mismo modo:
   la zona de trucos suma puntos con saltos y giros, y el tren arranca desde su estación. Uso: node pruebas/actividades.mjs */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node herramientas/construir.mjs)'); process.exit(0); }
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 860, height: 412 } }), errs = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message));
await p.goto((process.env.MC_PRUEBAS_URL ? new URL('dist/juegos/getaway.html', process.env.MC_PRUEBAS_URL).href : pathToFileURL(tc).href) + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO);
const capitulos = await p.evaluate(() => document.querySelectorAll('#capitulos button').length);
await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(200); }
await p.waitForTimeout(2500);
const r = await p.evaluate(async () => { const G = TURNO, A = G.Actividades, espera = ms => new Promise(q => setTimeout(q, ms)); for (let i = 0; i < 14; i++) { A.actualizar(); await espera(40); }
  const cuenta = {}; for (const a of A._lista) cuenta[a.t] = (cuenta[a.t] || 0) + 1; const res = { cuenta, tengo: G.tengo.length, total: TC.VEHICULOS.length };
  const tz = A._lista.find(a => a.t === 'trucos'); if (tz) { Object.assign(G.cuerpo, { x: tz.x, y: tz.y, v: 0 }); G.cuerpo.setVeh('skate'); await espera(900); res.marcaTrucos = A.cerca && A.cerca.t; A.jugar(); res.modo = G.Modos.m && G.Modos.m.id;
    for (let k = 0; k < 3; k++) { G.cuerpo.v = 5; G.ctl.boton('saltar', true); await espera(80); G.ctl.boton('saltar', false); Object.assign(G.ctl.stick, { x: 1, m: 1, activo: true }); await espera(600); Object.assign(G.ctl.stick, { x: 0, m: 0, activo: false }); G.cuerpo.a = G.cuerpo.rumboRodado ?? G.cuerpo.a; await espera(700); }
    res.puntos = G.Modos.m ? Math.round(G.Modos.m.puntos) : 0; G.Modos.terminar(null); }
  const tr = A._lista.find(a => a.t === 'tren'); if (tr) { Object.assign(G.cuerpo, { x: tr.x, y: tr.y, v: 0 }); await espera(900); res.marcaTren = A.cerca && A.cerca.t; A.jugar(); await espera(400); const menu = [...document.querySelectorAll('.mcui .menu')].find(m => m.textContent.includes('línea')); res.tren = !!(G.Modos.m && G.Modos.m.id === 'tren') || !!menu; if (menu) menu.remove(); if (G.Modos.m) G.Modos.terminar(null); }
  return res; });
errs.push(...await p.evaluate(() => MC.errores.map(e => String(e.msg || e)))); await b.close();
const tipos = Object.keys(r.cuenta).length, ok = capitulos >= 5 && r.tengo >= r.total && tipos >= 4 && r.marcaTrucos === 'trucos' && r.modo === 'trucos' && r.puntos > 100 && r.marcaTren === 'tren' && r.tren && !errs.length;
console.log((ok ? '✓' : '✗') + ' actividades en el mundo abierto: ' + tipos + ' tipos de marca cerca del inicio, todo liberado (' + capitulos + ' capítulos, ' + r.tengo + ' vehículos), ▶ desde la marca arranca 🛹 y 🚇 · ' + JSON.stringify(r) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
