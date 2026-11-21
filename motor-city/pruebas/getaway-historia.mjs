#!/usr/bin/env node
/* Turno Cero · la historia entera de punta a punta (4.5): un bot hace lo mínimo de cada paso (llegar, foto, dron, perder a la
   policía, destruir, seguir, viajar por la carretera) hasta un final. Pasa si llega a un final sin errores de la página.
   Tarda unos 3 minutos. Uso: node pruebas/getaway-historia.mjs   (o node motor.mjs prueba --historia) */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url);
const { chromium } = require('playwright'); const tc = path.join(RAIZ, 'dist/juegos/getaway.html');
if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node herramientas/construir.mjs)'); process.exit(0); }
let final = null, errores = [];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 412, height: 860 }, hasTouch: true });
  const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  await p.goto(pathToFileURL(tc).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO);
  await p.click('#bHistoria'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion, null, { timeout: 120000 });
  const dialogos = async () => { let n = 0; for (let i = 0; i < 60; i++) { const d = await p.$('.dialogo button'); if (!d) { if (n && i > n + 3) break; await p.waitForTimeout(150); continue; } await d.click({ timeout: 4000 }).catch(async () => { const T = await p.evaluate(() => [...document.querySelectorAll(".dialogo")].map(x => x.textContent.slice(0, 90))); console.log("  DIALOGOS APILADOS", JSON.stringify(T)); await p.evaluate(() => document.querySelectorAll(".dialogo button").forEach(x => x.click())); }); n++; await p.waitForTimeout(60); } return n; };
  const est = () => p.evaluate(() => { const G = TURNO, H = G.hist; return { id: G.id, cap: H && H.cap, i: H && H.i, tipo: H && H.p && H.p.tipo, ocupado: H && H.ocupado, nivel: G.busq.nivel, ev: G.evidencia, final: !document.querySelector('#final').hidden, trans: G.transicion, err: MC.errores.length }; });
  const visto = new Set(); let fotos = 0, t0 = Date.now();
  for (let vuelta = 0; vuelta < 140; vuelta++) {
    await dialogos(); const e = await est(); if (e.final) { final = await p.textContent('#fH'); console.log('FINAL', final); break; }
    if (e.trans) { await p.waitForTimeout(800); continue; }
    const clave = e.cap + '.' + e.i + '.' + e.tipo + '.' + e.id; if (!visto.has(clave)) { visto.add(clave); console.log(((Date.now() - t0) / 1000).toFixed(0) + ' s', JSON.stringify(e)); }
    if (e.ocupado && e.tipo !== 'acceso') { await p.waitForTimeout(500); continue; }
    if (e.tipo === 'acceso') { for (let k = 0; k < 8 && await p.$('#acB'); k++) { await p.click('#acB'); await p.waitForTimeout(120); } continue; }
    await p.evaluate(async () => {
      const G = TURNO, H = G.hist, P = H.p, C = G.cuerpo, B = G.busq; if (!P) return;
      const a = (x, y) => { C.x = x; C.y = y; C.v = 0; G.camara.x = x; G.camara.y = y; };
      if (P.tipo === 'ir' || P.tipo === 'foto' || P.tipo === 'sigilo') { if (P.maxNivel != null) B.limpiar(); const m = H.est.meta; if (m) a(m.x, m.y); else if (G.objetivo) a(G.objetivo.x, G.objetivo.y); }
      if (P.tipo === 'foto') { await new Promise(r => setTimeout(r, 300)); G.Historia.foto(); }
      if (P.tipo === 'dron') { const m = H.est.meta; a(m.x + 30, m.y); if (!G.dron) { G.recarga.dron = 0; G.Artefactos.dron(); } G.dron.x = m.x; G.dron.y = m.y; }
      if (P.tipo === 'perder') { B.limpiar(); }
      if (P.tipo === 'destruir') { for (const r of B.rivales) if (r.bando === 'banda' && !r.roto) { r.salud = 0; r.roto = true; B._ev('fuera', { id: r.id, bando: 'banda', x: r.cuerpo.x, y: r.cuerpo.y }); } if (!B.rivales.some(r => r.bando === 'banda')) B.banda(2); }
      if (P.tipo === 'seguir' && G.seguido) { const S = G.seguido; a(S.cuerpo.x + 3, S.cuerpo.y); await new Promise(r => setTimeout(r, 400)); S.cuerpo.x = S.dest.x; S.cuerpo.y = S.dest.y; }
      if (P.tipo === 'viajar') { B.limpiar(); if (G.M.esCiudad) { const Q = G.planeta.puertas(G.id, G.M).siguiente; G.planeta.llegadaT = 0; a(Q.x + Math.cos(Q.a) * 3, Q.y + Math.sin(Q.a) * 3); } else { G.planeta.llegadaT = 0; a(G.M.carretera.centro(G.M.carretera.largo - 12), G.M.carretera.largo - 12); } }
    });
    await p.waitForTimeout(e.tipo === 'viajar' ? 2500 : 1200);
  }
  errores = errs.concat(await p.evaluate(() => MC.errores.map(e => String(e.msg || e)))); console.log('tiempo', ((Date.now() - t0) / 1000).toFixed(0) + ' s', 'errores', errores.length, errores.slice(0, 6));
  await b.close();
  const ok = !!final && !errores.length; console.log((ok ? '✓' : '✗') + ' Turno Cero: la historia entera llega a un final' + (final ? ' («' + final.trim() + '»)' : '') + ' sin errores'); process.exit(ok ? 0 : 1);
})();
