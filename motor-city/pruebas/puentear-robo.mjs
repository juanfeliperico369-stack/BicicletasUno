#!/usr/bin/env node
/* 5.3 · El minijuego de puentear (G5-04 de Gemini) dentro del juego, y el vuelco bien apoyado (C5-01 de ChatGPT).
   En Chromium a 860 × 412, Turno Cero, mundo abierto:
   - a pie junto a un carro del tráfico, 🚗 Robar: el carro es tuyo al instante y aparece «🔌 Puentear» (opcional);
   - si no se toca, se va solo a los 6 s (no frena nada);
   - si se toca y se gana, la búsqueda baja lo que subió el robo;
   - vuelco: el modelo del carro boca arriba queda sobre el piso (no enterrado) y, volcado, no acelera ni gira.
   Uso: node pruebas/puentear-robo.mjs */
import path from 'node:path'; import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), p = await b.newPage({ viewport: { width: 860, height: 412 } }), errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(path.join(RAIZ, 'dist/juegos/getaway.html')).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(150); }
const robar = async () => p.evaluate(async () => { const G = TURNO, C = G.cuerpo, espera = ms => new Promise(q => setTimeout(q, ms));
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove(); G.pausa = false; if (G.busq.ponerNivel) G.busq.ponerNivel(0);
  for (let i = 0; i < 40 && !G.trafico.agentes.some(a => a.tipo !== 'buseta' && a.tipo !== 'bici'); i++) await espera(250);
  const a = G.trafico.agentes.find(a => a.tipo !== 'buseta' && a.tipo !== 'bici'); if (!a) return { sinCarro: true };
  if (C.veh.clase !== 'pie') C.bajarse('prueba'); C.estacionado = null; Object.assign(C, { x: a.x + 2, y: a.y, v: 0 }); a.v = 0;
  const calor0 = G.busq.heat, bt = document.querySelector('.mcui button[aria-label="Robar"]'); bt.click(); await espera(150);
  return { veh: C.veh.id, clase: C.veh.clase, chip: !!document.querySelector('.mcui .mc-chip'), subio: Math.round((G.busq.heat - calor0) * 10) / 10 }; });
const r1 = await robar(); await p.waitForTimeout(6800);
const seFue = await p.evaluate(() => !document.querySelector('.mcui .mc-chip'));
const r2 = await robar();
const gana = await p.evaluate(async () => { const G = TURNO, espera = ms => new Promise(q => setTimeout(q, ms)), calor1 = G.busq.heat;
  document.querySelector('.mcui .mc-chip').click(); await espera(200); const abierto = G.Minijuegos.activo && G.Minijuegos.activo.def.id;
  G.Minijuegos.cerrar('ganado'); await espera(200); return { abierto, antes: Math.round(calor1 * 10) / 10, despues: Math.round(G.busq.heat * 10) / 10, pausa: G.pausa }; });
/* el vuelco: boca arriba, la carrocería queda sobre el piso; volcado no acelera */
const vuelco = await p.evaluate(async () => { const G = TURNO, C = G.cuerpo, espera = ms => new Promise(q => setTimeout(q, ms));
  MC.opciones.manejo = 'real'; MC.opciones.graficos = 'realistas'; G.vistas.motor3d = 'gl'; G.vistas.reiniciarGL(); G.vistaId = 'tercera'; G.vistas.usar('tercera', G.E);
  if (C.veh.clase !== 'auto') { C.setVeh('tc_vega'); G.veh = 'tc_vega'; } C.v = 18; if (!C._din) C.actualizar(1 / 60, {}); C._din.ay = 40; C.eventos.length = 0;
  let empezo = false; for (let i = 0; i < 20 && !empezo; i++) { MC.Vuelcos.paso(C, 1 / 60); empezo = C._vuelco && C._vuelco.t >= 0; C._din.ay = 40; }
  let boca = null; for (let i = 0; i < 120; i++) { await espera(16); if (Math.abs(Math.abs(C.vuelco || 0) - Math.PI) < .05) { boca = C.vuelco; break; } }
  /* la malla: el punto más bajo del carro volcado (la dinámica del jugador) no queda bajo el piso */
  const g = G.vistas.gl; let minY = 1e9, zb = null; if (g && g._dinamico) { const D = g._dinamico(G.E), O = g.O; zb = G.M.cota(C.x, C.y) - O[2]; for (let i = 0; i < D.length; i += 10) { const dx = D[i] - (C.x - O[0]), dz = D[i + 2] - (C.y - O[1]); if (dx * dx + dz * dz < 9) minY = Math.min(minY, D[i + 1]); } }
  const v0 = Math.abs(C.v), U = C._din && C._din.U; await espera(500); const v1 = Math.abs(C.v);
  return { empezo, boca: boca && Math.round(boca * 100) / 100, bajo: zb === null ? null : Math.round((minY - zb) * 100) / 100, frena: v1 <= v0 + .05, thr: U ? U.thr : null }; });
await p.screenshot({ path: path.join(RAIZ, 'reportes/vuelco-5.3.jpg'), type: 'jpeg', quality: 78 });
await b.close();
const ok = r1.clase === 'auto' && r1.chip && r1.subio > 0 && seFue && r2.chip && gana.abierto === 'puentear' && gana.despues < gana.antes && !gana.pausa
  && vuelco.empezo && vuelco.boca !== null && vuelco.bajo !== null && vuelco.bajo > -.1 && vuelco.frena && !errs.length;
console.log((ok ? '✓' : '✗') + ' 🔌 Puentear después de robar (opcional, baja la búsqueda) y 🚗 vuelco apoyado sobre el piso · ' + JSON.stringify({ r1, seFue, r2, gana, vuelco }) + (errs.length ? ' · errores: ' + errs.slice(0, 3).join(' | ') : ''));
process.exit(ok ? 0 : 1);
