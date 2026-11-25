#!/usr/bin/env node
/* =====================================================================
   PRUEBA · MC.Pista (js/47-pista.js) y las 🏎️ Carreras retro de Turno Cero (renacimiento cenital, Fase 4 · Claude)
   En Chromium de escritorio, con dist/juegos/getaway.html:
     1. LA CRESTA RECORTA: en una pista de prueba con una loma, un rival detrás de la cresta no pinta ningún píxel debajo de
        ella (se recorre de la cresta a 70 segmentos después). Con el recorte apagado sí se asoma por debajo: así se sabe que
        la prueba mide algo. Y en algún punto el techo se asoma por encima (no desaparece de golpe).
     2. LA CURVA ACUMULADA ES CONTINUA: sin saltos de curva entre segmentos (≤ 0,3), sin saltos de altura y la vuelta cierra.
     3. EL BOT COMPLETA LOS DOS CIRCUITOS, con sus 2 vueltas y su posición.
     4. EL P95 DEL CUADRO (paso + dibujo) baja de 16,7 ms, en vertical (412 × 860) y en horizontal (860 × 412), y cada cuadro
        pinta pocas figuras (las franjas van juntas por color).
     5. TURNO CERO: «🏎️ Carreras retro» está en 🎮 Modos; se corre (el mundo se pausa), se termina (premio y récord), se
        sale y vuelves al mismo punto con el mundo andando; también saliendo con ✕ a mitad de carrera.
     6. 0 ERRORES de consola.
   Uso: node motor.mjs construir && node pruebas/pista-retro.mjs [--capturas CARPETA]
   ===================================================================== */
import path from 'node:path'; import fs from 'node:fs'; import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url), { chromium } = require('playwright');
const A = process.argv.slice(2), CAP = A.includes('--capturas') ? path.resolve(A[A.indexOf('--capturas') + 1]) : null;
const tc = path.join(RAIZ, 'dist/juegos/getaway.html'); if (!fs.existsSync(tc)) { console.log('· falta dist/juegos/getaway.html (node motor.mjs construir)'); process.exit(1); }
if (CAP) fs.mkdirSync(CAP, { recursive: true });
const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1, hasTouch: true }), p = await ctx.newPage(), errs = [];
p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
await p.goto(pathToFileURL(tc).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO && window.MC && MC.Pista, null, { timeout: 120000 });
const R = {}, fallas = [];

/* ---------- 1. la cresta recorta (píxeles) ---------- */
R.cresta = await p.evaluate(() => {
  const P = MC.Pista.crearDe({ id: 'prueba-cresta', tramos: [[120, 0, 0], [70, 0, 5200], [70, 0, -5200], [260, 0, 0]] }), SEG = MC.Pista.SEG, W = 412, H = 860;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', { willReadFrequently: true });
  const S = MC.Pista.carrera(P, { rivales: 1, vueltas: 1 }); S.t = 1; S.jug.z = 40 * SEG; S.jug.x = 0; S.jug.v = 0; const r = S.rivales[0]; r.x = 0; r.v = 0;
  const magenta = (clip) => { const d = g.getImageData(0, 0, W, H).data; let abajo = 0, total = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i] - d[i + 1] > 120 && d[i + 2] - d[i + 1] > 120) { total++; if (y > clip + 1) abajo++; } } return { abajo, total }; };
  const out = { posiciones: 0, abajoConRecorte: 0, asomaPorEncima: 0, abajoSinRecorte: 0, antesDeLaCresta: 0 };
  for (let sg = 190; sg <= 260; sg += 2) {
    r.z = sg * SEG + SEG / 2; MC.Pista.dibujar(g, W, H, S, { colorCarros: '#ff00ff', sinHud: true }); const s = P.segs[sg], a = magenta(s.clip); out.posiciones++;
    out.abajoConRecorte += a.abajo; if (a.total > 0 && sg > 192) out.asomaPorEncima++;
    MC.Pista.dibujar(g, W, H, S, { colorCarros: '#ff00ff', sinHud: true, sinRecorte: true }); out.abajoSinRecorte += magenta(P.segs[sg].clip).abajo;
  }
  r.z = 90 * SEG + SEG / 2; MC.Pista.dibujar(g, W, H, S, { colorCarros: '#ff00ff', sinHud: true }); out.antesDeLaCresta = magenta(H).total;   /* antes de la loma, a la vista (30 m adelante) */
  return out;
});
if (R.cresta.abajoConRecorte !== 0) fallas.push('un carro detrás de la cresta pinta ' + R.cresta.abajoConRecorte + ' píxeles debajo de ella');
if (!(R.cresta.abajoSinRecorte > 0)) fallas.push('sin el recorte no se asomó nada por debajo de la cresta: la prueba no mide');
if (!(R.cresta.antesDeLaCresta > 30)) fallas.push('el carro antes de la cresta no se ve');
if (!(R.cresta.asomaPorEncima > 0)) fallas.push('detrás de la cresta el carro desaparece de golpe (nunca se asoma el techo)');

/* ---------- 2 y 3. la curva continua y el bot en los dos circuitos ---------- */
R.circuitos = await p.evaluate(() => Object.keys(MC.Pista.CIRCUITOS).map(id => {
  const P = MC.Pista.crear(id), f = MC.Pista.perfil(P), t0 = performance.now(), s = MC.Pista.simular(P, { vueltas: 2 });
  let maxC = 0; for (const c of f.curva) maxC = Math.max(maxC, Math.abs(c));
  return { id, segmentos: P.N, largo_m: Math.round(f.largo_m), curvaMax: +maxC.toFixed(2), saltoCurva: +f.saltoCurva.toFixed(3), saltoAlto: f.saltoAlto, cierre: +f.cierreAlto.toFixed(6), terminado: s.terminado, vueltas: s.vueltas.length, posicion: s.posicion, tiempo: s.tiempo && +s.tiempo.toFixed(1), mejorVuelta: s.mejorVuelta && +s.mejorVuelta.toFixed(1), simulacion_ms: Math.round(performance.now() - t0) };
}));
for (const c of R.circuitos) {
  if (c.saltoCurva > .3 || c.saltoAlto > 1e-6 || c.cierre > 1e-3) fallas.push(c.id + ': la curva o la altura no son continuas ' + JSON.stringify(c));
  if (!c.terminado || c.vueltas !== 2 || !(c.posicion >= 1 && c.posicion <= 6)) fallas.push(c.id + ': el bot no completó la carrera ' + JSON.stringify(c));
}

/* ---------- 4. el p95 del cuadro, en vertical y en horizontal ---------- */
R.rendimiento = [];
for (const [W, H] of [[412, 860], [860, 412]]) {
  await p.setViewportSize({ width: W, height: H });
  for (const id of Object.keys(await p.evaluate(() => MC.Pista.CIRCUITOS))) {
    const r = await p.evaluate(async ([id, W, H]) => {
      const P = MC.Pista.crear(id), S = MC.Pista.carrera(P, { vueltas: 2 }), cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.style.cssText = 'position:fixed;inset:0;z-index:999'; document.body.appendChild(cv);
      const g = cv.getContext('2d', { alpha: false }), ms = [], fig = []; S.t = 0;
      for (let k = 0; k < 40; k++) { MC.Pista.paso(S, 1 / 60, MC.Pista.bot(S)); MC.Pista.dibujar(g, W, H, S); }   /* calentar */
      /* un cuadro por requestAnimationFrame, como en el juego: el tiempo de paso + dibujo (JS) y el intervalo entre cuadros */
      const inter = []; let tAnt = 0;
      for (let k = 0; k < 600; k++) { const ts = await new Promise(q => requestAnimationFrame(q)); if (tAnt) inter.push(ts - tAnt); tAnt = ts; const t0 = performance.now(); MC.Pista.paso(S, 1 / 60, MC.Pista.bot(S)); const st = MC.Pista.dibujar(g, W, H, S); ms.push(performance.now() - t0); fig.push(st.figuras); }
      cv.remove(); const q = (L, f) => { const o = L.slice().sort((a, b) => a - b); return +o[Math.min(o.length - 1, Math.floor(o.length * f))].toFixed(2); };
      return { id, W, H, p50: q(ms, .5), p95: q(ms, .95), peor: +Math.max(...ms).toFixed(2), cuadroP95: q(inter, .95), figuras: Math.round(fig.reduce((a, b) => a + b, 0) / fig.length), km: +(S.jug.z * MC.Pista.M_POR_U / 1000).toFixed(2) };
    }, [id, W, H]);
    R.rendimiento.push(r); if (!(r.p95 < 16.7)) fallas.push(`${id} ${W}×${H}: p95 ${r.p95} ms (meta < 16,7)`); if (r.figuras > 80) fallas.push(`${id} ${W}×${H}: ${r.figuras} figuras por cuadro`);
    if (CAP) { await p.evaluate(([id, W, H]) => { const P = MC.Pista.crear(id), S = MC.Pista.carrera(P, { vueltas: 2 }), cv = document.createElement('canvas'); cv.id = 'capPista'; cv.width = W * 2; cv.height = H * 2; cv.style.cssText = 'position:fixed;inset:0;width:' + W + 'px;height:' + H + 'px;z-index:999'; document.body.appendChild(cv); const g = cv.getContext('2d', { alpha: false }); for (let k = 0; k < (id === 'palmas' ? 1500 : 900); k++) MC.Pista.paso(S, 1 / 60, MC.Pista.bot(S)); MC.Pista.dibujar(g, W * 2, H * 2, S); }, [id, W, H]);
      await p.screenshot({ path: path.join(CAP, `pista-${id}-${W}x${H}.png`) }); await p.evaluate(() => document.getElementById('capPista').remove()); }
  }
}
await p.setViewportSize({ width: 412, height: 860 });

/* ---------- 5. Turno Cero: el modo, la pausa del mundo, el premio, el récord y la vuelta al mismo punto ---------- */
await p.click('#bModos'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
await p.evaluate(() => { for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove(); TURNO.pausa = false; window._res = []; MC.on('modo:resultado', r => window._res.push(r)); });
await p.waitForTimeout(800);
R.turnoCero = await p.evaluate(async () => {
  const G = TURNO, C = G.cuerpo, espera = ms => new Promise(q => setTimeout(q, ms)), out = { enModos: !!(G.Modos && G.Modos.DEF.retro) };
  G.Modos.empezar('retro'); await espera(200); const menu = document.querySelector('.mcui .menu'); out.menu = !!menu && menu.textContent.includes('Carreras retro') && menu.textContent.includes('Las Palmas') && menu.textContent.includes('Regional');
  for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove();
  const antes = { x: C.x, y: C.y, a: C.a, veh: C.veh.id, dinero: G.dinero };
  out.corre = G.Retro.correr('palmas', { bot: true }); await espera(4800);
  const A = G.Retro.activo, S = A && A.S; out.pausado = G.pausa === true && !document.getElementById('retro').hidden; out.avanza = !!S && S.t > 1 && S.jug.v > 1000;
  /* la meta: el bot ya va corriendo; se le pone a 60 m de cruzar la última vuelta */
  S.jug.vuelta = S.vueltas - 1; S.jug.z = S.P.L - 100 * MC.Pista.SEG; for (const r of S.rivales) { r.vuelta = 0; }
  let volver = null; for (let k = 0; k < 150 && !volver; k++) { volver = [...document.querySelectorAll('#retro button')].find(b => b.textContent.includes('Volver')); if (!volver) await espera(100); }
  out.resultado = !!volver; const res = window._res.find(r => r.id === 'retro'); out.premio = res ? res.premio : null; out.pos = res ? res.pos : null; out.record = G.Modos.records()['retro:palmas'] != null;
  out.dinero = G.dinero - antes.dinero;
  if (volver) volver.click(); await espera(400);
  out.volvio = G.pausa === false && document.getElementById('retro').hidden && !G.Retro.activo && Math.abs(C.x - antes.x) < .01 && Math.abs(C.y - antes.y) < .01 && C.veh.id === antes.veh;
  /* salir con ✕ a mitad de carrera, en la Regional */
  G.Retro.correr('regional', { bot: true }); await espera(1500); const x = document.querySelector('#retro button[aria-label="Salir"]'); if (x) x.click(); await espera(300);
  out.salirConX = !!x && G.pausa === false && document.getElementById('retro').hidden && !G.Retro.activo && Math.abs(C.x - antes.x) < .01;
  /* el mundo sigue andando */
  const r0 = G.reloj.min; await espera(1500); out.mundoAnda = G.reloj.min !== r0;
  return out;
});
const T = R.turnoCero;
if (!(T.enModos && T.menu && T.corre && T.pausado && T.avanza && T.resultado && T.pos >= 1 && T.record && T.volvio && T.salirConX && T.mundoAnda)) fallas.push('Turno Cero: ' + JSON.stringify(T));
if (T.pos && T.pos <= 3 && T.dinero !== T.premio) fallas.push('Turno Cero: el premio no llegó (' + T.dinero + ' de ' + T.premio + ')');

/* ---------- 6. errores ---------- */
errs.push(...await p.evaluate(() => (MC.errores || []).map(e => String(e.msg || e))));
await b.close();
if (errs.length) fallas.push(errs.length + ' errores: ' + errs.slice(0, 3).join(' · '));
console.log('1. cresta: ' + JSON.stringify(R.cresta));
for (const c of R.circuitos) console.log('2-3. ' + c.id + ': ' + JSON.stringify(c));
for (const r of R.rendimiento) console.log(`4. ${r.id} ${r.W}×${r.H}: paso + dibujo p50 ${r.p50} ms · p95 ${r.p95} ms · peor ${r.peor} ms · entre cuadros p95 ${r.cuadroP95} ms · ${r.figuras} figuras por cuadro · ${r.km} km`);
console.log('5. Turno Cero: ' + JSON.stringify(T));
console.log(fallas.length ? '✗ 🏎️ pista retro: ' + fallas.join(' | ') : '✓ 🏎️ pista retro: la cresta recorta, la curva es continua, el bot termina los dos circuitos, p95 < 16,7 ms y Turno Cero vuelve al mismo punto');
process.exit(fallas.length ? 1 : 0);
