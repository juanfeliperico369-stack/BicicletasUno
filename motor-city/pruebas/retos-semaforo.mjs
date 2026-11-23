#!/usr/bin/env node
/* 5.2 · G5-06 · Retos desde cualquier semáforo (Turno Cero, en Chromium a 860 × 412).
   - quieto junto a un semáforo real, el juego cuenta el truco (una vez);
   - 🛑 sostenido + ⏫ a la vez (sin teclado) ofrece la carrera hasta un sitio con nombre, por calles de carro;
   - al aceptar: 🏁 de Modos con UN rival que sale al lado, cuenta 3‑2‑1 y el rival arranca;
   - lejos de un semáforo, con la policía detrás o dentro de otro modo, no se ofrece.
   Uso: node pruebas/retos-semaforo.mjs */
import path from 'node:path'; import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), p = await b.newPage({ viewport: { width: 860, height: 412 } }), errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(path.join(RAIZ, 'dist/juegos/getaway.html')).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(150); }
const r = await p.evaluate(async () => {
  const G = TURNO, M = G.M, C = G.cuerpo, R = G.RetoSemaforo, espera = ms => new Promise(q => setTimeout(q, ms)), texto = () => document.querySelector('.mcui') ? document.querySelector('.mcui').textContent : '';
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove(); G.busq.nivel = 0;
  const ofrecidos = []; MC.on('reto:ofrecido', e => ofrecidos.push(e));
  /* un semáforo con un destino bueno */
  let L = null, D = null; for (const s of [...G.trafico.luces().values()].sort((a, b) => Math.hypot(a.x - C.x, a.y - C.y) - Math.hypot(b.x - C.x, b.y - C.y)).slice(0, 40)) { const q = M.viaCercana(s.x, s.y, 14, v => v.k >= 1 && v.k <= 4); if (!q) continue; const d = R.destino(q.x, q.y); if (d) { L = s; D = d; Object.assign(C, { x: q.x, y: q.y, a: q.ang, v: 0 }); break; } }
  if (!L) return { sinSemaforo: true, luces: G.trafico.luces().size };
  G.camara.x = C.x; G.camara.y = C.y;
  /* 1) quieto: le cuentan el truco */
  await espera(2400); const truco = /Reto: en un semáforo/.test(texto()) || (G.ui._cola || []).some(c => /Reto: en un semáforo/.test(String(c[0])));
  /* 2) el gesto: 🛑 sostenido y ⏫ prendido */
  const v0 = []; G.ctl.boton('freno', true); G.acelFijo = true; for (let i = 0; i < 5; i++) { await espera(220); v0.push(Math.abs(C.v)); } G.ctl.boton('freno', false); G.acelFijo = false; const enSitio = Math.max(...v0) < 1.5;
  const dlg = [...document.querySelectorAll('.mcui .dialogo')].find(d => /Reto del semáforo/.test(d.textContent)), ofrecido = !!dlg && ofrecidos.length === 1;
  /* 3) acepta */
  const bt = dlg && [...dlg.querySelectorAll('button')].find(x => /Dele/.test(x.textContent)); if (bt) bt.click(); await espera(400);
  const Modos = G.Modos, m = Modos.m, inicio = m ? { id: m.id, rivales: m.rivales.length, reto: m.reto, largo: Math.round(m.p.L), alLado: Math.round(Math.hypot(m.rivales[0].cuerpo.x - C.x, m.rivales[0].cuerpo.y - C.y) * 10) / 10 } : null;
  await espera(6500); const avanza = m && m.rivales[0] ? Math.round(m.rivales[0].s) : 0;
  /* 4) dentro de un modo: no se ofrece otro reto */
  const n0 = ofrecidos.length; G.ctl.boton('freno', true); G.acelFijo = true; C.v = 0; await espera(1100); G.ctl.boton('freno', false); G.acelFijo = false; const enModo = ofrecidos.length === n0;
  if (Modos.m) Modos.terminar('fin de la prueba'); for (const d of document.querySelectorAll('.mcui .dialogo')) d.remove(); await espera(300);
  /* 5) con la policía detrás, tampoco */
  const q = M.viaCercana(L.x, L.y, 14, v => v.k >= 1 && v.k <= 4); Object.assign(C, { x: q.x, y: q.y, v: 0 }); G.busq.ponerNivel(2); await espera(300); const nivelPol = G.busq.nivel; R._ofrecido = -99; const n1 = ofrecidos.length;
  G.ctl.boton('freno', true); G.acelFijo = true; await espera(1100); G.ctl.boton('freno', false); G.acelFijo = false; const conPolicia = nivelPol > 0 && ofrecidos.length === n1, dPol = { nivelPol, ofr: ofrecidos.length - n1 }; G.busq.ponerNivel(0);
  /* 6) lejos de cualquier semáforo, tampoco */
  let lejos = null; for (let k = 0; k < 200 && !lejos; k++) { const v = M.viaCercana(C.x + (k % 14 - 7) * 90, C.y + Math.floor(k / 14 - 7) * 90, 30, w => w.k >= 1 && w.k <= 4); if (v && !R.semaforo(v.x, v.y, 60)) lejos = v; }
  let sinLuz = null; if (lejos) { Object.assign(C, { x: lejos.x, y: lejos.y, v: 0 }); R._ofrecido = -99; const n2 = ofrecidos.length; G.ctl.boton('freno', true); G.acelFijo = true; await espera(1100); G.ctl.boton('freno', false); G.acelFijo = false; sinLuz = ofrecidos.length === n2; }
  return { dPol, luces: G.trafico.luces().size, destino: D.nombre, largo: Math.round(D.largo), truco, enSitio, ofrecido, inicio, avanza, enModo, conPolicia, sinLuz };
});
await p.screenshot({ path: path.join(RAIZ, 'reportes/retos-semaforo-5.2.jpg'), type: 'jpeg', quality: 78 });
await b.close();
const ok = !r.sinSemaforo && r.truco && r.enSitio && r.ofrecido && r.inicio && r.inicio.id === 'carrera' && r.inicio.rivales === 1 && r.inicio.reto && r.inicio.alLado < 6 && r.inicio.largo > 300 && r.avanza > 10 && r.enModo && r.conPolicia && r.sinLuz !== false && !errs.length;
console.log((ok ? '✓' : '✗') + ' 🚦 G5-06 · Retos desde cualquier semáforo: el truco, 🛑 + ⏫ quema llanta en el sitio y ofrece la carrera hasta un sitio real, un rival al lado que arranca; no con policía, en otro modo ni lejos de un semáforo · ' + JSON.stringify(r) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
