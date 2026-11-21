#!/usr/bin/env node
/* 4.6 · 🎮 Los modos de Turno Cero (el único juego de prueba) en Chromium móvil, en Medellín: Carreras, Extremo, Mandados,
   EnCicla y manejar el Metro, cada uno de punta a punta (un bot hace lo mínimo), con resultado, récord y sin errores.
   También abre el mapa grande con el juego corriendo. Uso: node pruebas/modos.mjs  (tarda unos 2 minutos) */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node herramientas/construir.mjs)'); process.exit(0); }
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 860, height: 412 }, hasTouch: true }), errs = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
await p.goto(pathToFileURL(tc).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO);
await p.click('#bModos'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
await p.waitForSelector('.mcui .menu', { timeout: 20000 }); const menuAbre = await p.evaluate(() => document.querySelector('.mcui .menu').textContent.includes('Modos'));
await p.evaluate(() => { for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove(); window._res = []; MC.on('modo:resultado', r => window._res.push(r)); });
const cerrar = () => p.evaluate(() => { for (const m of document.querySelectorAll('.mcui .dialogo, .mcui .menu')) m.remove(); TURNO.pausa = false; });
const R = { menuAbre };
/* carreras y extremo: se corre la pista poniendo al jugador adelante; los rivales deben avanzar solos */
for (const id of ['carrera', 'extremo']) {
  R[id] = await p.evaluate(async id => { const G = TURNO, M = G.Modos, espera = ms => new Promise(q => setTimeout(q, ms)); const ok = M.empezar(id); if (!ok) return { ok }; const c = M.m; await espera(6200); const avanzan = c.rivales.filter(r => r.s > 3).length;
    for (let k = 0; k < 900 && M.m === c; k++) { const q = c.p.punto(c.yo.s + 22); Object.assign(G.cuerpo, { x: q.x, y: q.y, a: q.a }); if (id === 'extremo' && k % 40 === 5) G.cuerpo.z = (G.cuerpo.alturaSuelo || 0) + 2; await espera(25); }
    await espera(300); const r = window._res.find(x => x.id === id); return { ok, largo: Math.round(c.p.L), rivales: c.rivales.length, avanzan, fin: r && +r.t.toFixed(1), pos: r && r.pos, dialogo: !!document.querySelector('.mcui .dialogo') }; }, id);
  await cerrar();
}
/* mandados: tres entregas (llegar, parar y esperar) */
R.mandados = await p.evaluate(async () => { const G = TURNO, M = G.Modos, espera = ms => new Promise(q => setTimeout(q, ms)); if (!M.empezar('mandados')) return { ok: false };
  for (let k = 0; k < 8 && M.m && M.m.id === 'mandados'; k++) { const m = M.m, P = m.fase ? m.d : m.o; Object.assign(G.cuerpo, { x: P.x, y: P.y, v: 0 }); await espera(1700); }
  const r = window._res.find(x => x.id === 'mandados'); return { ok: true, hechos: r && r.hechos, ganado: r && r.ganado }; });
await cerrar();
/* EnCicla: tomar la cicla y devolverla tres veces donde la necesitan */
R.encicla = await p.evaluate(async () => { const G = TURNO, M = G.Modos, espera = ms => new Promise(q => setTimeout(q, ms)); if (!M.empezar('encicla')) return { ok: false }; let bici = false;
  for (let k = 0; k < 8 && M.m && M.m.id === 'encicla'; k++) { const m = M.m, P = m.fase ? m.d : m.o; Object.assign(G.cuerpo, { x: P.x, y: P.y, v: 0 }); await espera(1300); if (G.cuerpo.veh.id === 'bici') bici = true; }
  const r = window._res.find(x => x.id === 'encicla'); return { ok: true, bici, puntos: r && Math.round(r.puntos), luces: M.luces() ? M.luces().size : 0 }; });
await cerrar();
/* el metro: ⚡ hasta cerca de la estación y 🛑 para dentro del andén; dos paradas bastan */
R.tren = await p.evaluate(async () => { const G = TURNO, M = G.Modos, espera = ms => new Promise(q => setTimeout(q, ms)); const L = G.transporte.lineas.find(L => L.clase === 'metro' && L.est.length >= 5); if (!L) return { ok: false }; M.armarTren(L); const m = M.m;
  for (let k = 0; k < 2400 && M.m === m && m.paradas < 2; k++) { const E = m.L.est[m.sig]; if (!E) break; let falta = (E.s - m.s) * m.dir; if (falta > 320 && m.puertas <= 0) { m.s = E.s - m.dir * 240; m.v = 12; falta = 240; } const frenar = m.v * m.v / (2 * 1.5) + 6; G.ctl.boton('turbo', m.puertas <= 0 && falta > frenar && m.v < 18); G.ctl.boton('freno', falta <= frenar || m.v >= 18); await espera(30); }
  G.ctl.boton('turbo', false); G.ctl.boton('freno', false); const out = { ok: true, linea: L.nombre, paradas: m.paradas, puntos: Math.round(m.puntos), vis: !!(G.E.vehiculos || []).find(v => v.id === 'yo-tren'), sinJugador: !!G.E._sinJugador }; M.terminar('fin de la prueba'); out.libre = !G.controlExterno && !G.E._sinJugador; return out; });
await cerrar();
/* el mapa grande con el juego corriendo: abre, pausa, acerca, cierra y el juego sigue */
R.mapa = await p.evaluate(async () => { const G = TURNO, espera = ms => new Promise(q => setTimeout(q, ms)); G.abrirMapaTC(); await espera(400); const abierto = !!G.ui._mapa && G.pausa; for (let i = 0; i < 4; i++) document.querySelector('.mapaB button[aria-label="Acercar"]').click(); await espera(800); G.ui._mapa.cerrar(); await espera(300); return { abierto, cerrado: !G.ui._mapa && !G.pausa }; });
const res = await p.evaluate(() => window._res.map(r => r.id)); errs.push(...await p.evaluate(() => MC.errores.map(e => String(e.msg || e))));
await b.close();
const ok = R.menuAbre && ['carrera', 'extremo'].every(k => R[k].ok && R[k].avanzan >= 1 && R[k].fin > 0 && R[k].dialogo) && R.mandados.hechos === 3 && R.mandados.ganado > 0 && R.encicla.bici && R.encicla.puntos > 0 && R.tren.paradas >= 2 && R.tren.vis && R.tren.libre && R.mapa.abierto && R.mapa.cerrado && !errs.length;
console.log((ok ? '✓' : '✗') + ' 🎮 modos de Turno Cero: carreras, extremo, mandados, EnCicla y metro de punta a punta, y el mapa · ' + JSON.stringify(R) + ' · resultados ' + res.join(',') + (errs.length ? ' · errores: ' + errs.slice(0, 4).join(' | ') : ''));
process.exit(ok ? 0 : 1);
