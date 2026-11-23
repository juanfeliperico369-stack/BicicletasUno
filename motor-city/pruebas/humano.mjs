#!/usr/bin/env node
/* 4.7 · Pruebas «humanas» (auditoría de ChatGPT TC-P0-01): solo ENTRADAS, nunca se escribe posición ni estado del juego.
   - 🚇 Metro: ⏫ (tocar el botón) para acelerar; al acercarse a la próxima estación, tocar ⏫ otra vez para frenar; debe parar
     dentro del andén y contar la parada, en menos de 120 s.
   - 🏁 Carrera: el «dedo» sigue la flecha (la pista de adelante) con el joystick durante 20 s: debe avanzar por la pista sin
     salirse y sin quedar trabado.
   Uso: node pruebas/humano.mjs */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node herramientas/construir.mjs)'); process.exit(0); }
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 860, height: 412 }, hasTouch: true }), errs = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message));
await p.goto((process.env.MC_PRUEBAS_URL ? new URL('dist/juegos/getaway.html', process.env.MC_PRUEBAS_URL).href : pathToFileURL(tc).href) + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO);
await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(200); }
/* 🚇 el metro con el botón ⏫ */
await p.evaluate(() => { const L = TURNO.transporte.lineas.find(L => L.clase === 'metro' && L.est.length >= 5); TURNO.Modos.armarTren(L); });
const boton = await p.$('.mcui .acciones button.alt'); let prendido = false; const t0 = Date.now(); let tren = null;
for (let k = 0; k < 400 && Date.now() - t0 < 120000; k++) {
  const s = await p.evaluate(() => { const m = TURNO.Modos.m; if (!m || m.id !== 'tren') return null; const E = m.L.est[m.sig]; return { falta: E ? (E.s - m.s) * m.dir : null, v: m.v, paradas: m.paradas, puertas: m.puertas, rapido: m.rapido }; });
  if (!s) break; tren = s; if (s.paradas >= 1) break;
  /* como una persona: ⏫ hasta que la distancia de frenado alcance (al apagarlo frena a 0,6 de la potencia); si queda corto y quieto, un toque para acercarse */
  const necesita = s.v * s.v / (2 * 3.2 * .6) + 5, quiere = s.puertas <= 0 && s.falta != null && (s.falta > necesita || (s.v < .5 && s.falta > 9));
  if (quiere !== prendido) { await boton.tap(); prendido = !prendido; }
  await p.waitForTimeout(250);
}
const metro = await p.evaluate(() => { const m = TURNO.Modos.m; const r = { paradas: m ? m.paradas : 0, puntos: m ? Math.round(m.puntos) : 0 }; if (m) TURNO.Modos.terminar(null); return r; });
metro.seg = Math.round((Date.now() - t0) / 1000); if (prendido) await boton.tap();
/* 🏁 una carrera manejada con el joystick siguiendo la pista */
await p.evaluate(() => { for (const m of document.querySelectorAll('.mcui .dialogo')) m.remove(); TURNO.Modos.empezar('carrera'); });
/* 4.8: si la salida queda lejos, la persona toca «⚡ Llevarme ya» */
const llevar = await p.$('.mcui .dialogo button:has-text("Llevarme")'); if (llevar) await llevar.click();
await p.waitForTimeout(4200);
const carrera = await p.evaluate(async () => { const G = TURNO, c = G.Modos.m, espera = ms => new Promise(q => setTimeout(q, ms)); if (!c || !c.p) return { ok: false }; const s0 = c.yo.s; let fuera = 0, vmax = 0;
  for (let k = 0; k < 100 && G.Modos.m === c; k++) { const q = c.p.punto(c.yo.s + 12), C = G.cuerpo, dx = q.x - C.x, dy = q.y - C.y, L = Math.hypot(dx, dy) || 1, yaw = G.camara.yaw || 0, cs = Math.cos(yaw), sn = Math.sin(yaw), wx = dx / L, wy = dy / L;
    Object.assign(G.ctl.stick, { activo: true, x: wx * cs - wy * sn, y: wx * sn + wy * cs, m: 1 }); await espera(200);  vmax = Math.max(vmax, Math.abs(C.v)); if (c.p.proyectar(C.x, C.y, c.yo.s % c.p.L).d > 40) fuera++; }
  Object.assign(G.ctl.stick, { activo: false, x: 0, y: 0, m: 0 }); const r = { ok: true, avance: Math.round(c.yo.s - s0), vmax: +vmax.toFixed(1), fuera, sigue: G.Modos.m === c }; if (G.Modos.m) G.Modos.terminar(null); return r; });
errs.push(...await p.evaluate(() => MC.errores.map(e => String(e.msg || e)))); await b.close();
const ok = metro.paradas >= 1 && carrera.ok && carrera.avance > 150 && carrera.vmax > 12 && carrera.fuera < 20 && !errs.length;
console.log((ok ? '✓' : '✗') + ' pruebas humanas (solo entradas): 🚇 con ⏫ para en la estación en ' + metro.seg + ' s; 🏁 con el joystick avanza ' + carrera.avance + ' m a ' + carrera.vmax + ' m/s · ' + JSON.stringify({ metro, carrera, tren }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
