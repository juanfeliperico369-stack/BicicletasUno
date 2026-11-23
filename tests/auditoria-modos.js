#!/usr/bin/env node
/* Auditoría medida de los modos de Juega EnCicla (Claude, ronda 3.0): qué está roto, qué es lento, qué se traba.
   node tests/auditoria-modos.js [--cpu=4] [--seg=5]
   Con la CPU N veces más lenta (como un celular modesto) y en tiempo real, para cada cosa mide:
   - VEHÍCULOS del modo libre (y el camión de Balance): sobre una avenida recta, con el joystick a fondo: distancia, velocidad
     punta (km/h del juego), cuadros por segundo y cuánto del tiempo real «se pierde» por el tope del paso de tiempo;
   - OFICIOS y JUEGOS: arrancan, corren unos segundos con el bot, cuadros por segundo, errores y si avanzan. */
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k)); return a ? (a.split('=')[1] || true) : null; };
const CPU = +(arg('cpu') || 4), SEG = +(arg('seg') || 5), FILE = path.resolve(__dirname, '..', arg('file') || 'dist/juega-encicla.html');
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 412, height: 860 }, isMobile: true, hasTouch: true }), p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 30000 });
  const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const out = { cpu: CPU, vehiculos: [], modos: [] };
  /* ---------- vehículos sobre una avenida larga y recta ---------- */
  const lista = await p.evaluate(() => { const v = Object.values(VEHICULOS).filter(x => x.libre || ['bike', 'walk'].includes(x.id)).map(x => x.id); return [...new Set(v.concat(['ebike']))]; });
  for (const veh of lista.concat(['truck'])) {
    const r = await p.evaluate(async ([veh, SEG]) => {
      const espera = ms => new Promise(s => setTimeout(s, ms));
      if (JE.game.mode) JE.game.stop();
      if (veh === 'truck') JE.game.start('balance', 1, { seed: 5, nov: NOVEDADES[0] }); else JE.game.start('usuario', 1, { seed: 5, nov: NOVEDADES[0], free: true, bici: 'propia' });
      await espera(600); const M = JE.game.mode, R = M.ride; if (!R) return { veh, error: 'sin recorrido' };
      if (veh !== 'truck') { if (veh === 'ebike') { M.ebike = R.ebike = 1; R.setVeh('bike'); } else R.setVeh(veh); }
      /* la avenida recta más larga cerca del centro */
      let best = null; for (const L of JE.map.lanes) { if (L.len < 900 || L.cls === 't') continue; const a = L.pts[0], z = L.pts[L.pts.length - 1], rect = Math.hypot(z.x - a.x, z.y - a.y) / L.len; if (rect > .97 && (!best || L.len > best.len)) best = L; }
      const q = JE.map.at(best, 30, 0); R.p.x = q.x; R.p.y = q.y; R.p.a = q.a; R.p.v = 0; R.cam.x = q.x; R.cam.y = q.y; M.energy = 100;
      R.traffic = 0; R.cars = []; const dir = { x: Math.cos(q.a), y: Math.sin(q.a), m: 1 }; Input.botDir = dir;
      const x0 = R.p.x, y0 = R.p.y, d0 = R.stats.dist, mt0 = M.t; let vmax = 0, n = 0; const t0 = performance.now(), cuadros = [];
      let last = performance.now();
      while (performance.now() - t0 < SEG * 1000) { await new Promise(r => requestAnimationFrame(r)); const now = performance.now(); cuadros.push(now - last); last = now; vmax = Math.max(vmax, R.p.v); n++; M.energy = 100; }
      Input.botDir = null; const real = (performance.now() - t0) / 1000, metros = R.stats.dist * M_PER_PX - d0 * M_PER_PX, S = R.stats_();
      cuadros.sort((a, c) => a - c); const med = cuadros[cuadros.length >> 1], p95 = cuadros[Math.floor(cuadros.length * .95)];
      const juego = M.t - mt0, perdido = Math.max(0, real - juego);   /* el reloj del juego contra el real: lo que se pierde es cámara lenta */
      return { veh, metros: Math.round(metros), vmaxKmh: Math.round(vmax * M_PER_PX * 3.6), puntaKmh: Math.round(S.max * M_PER_PX * 3.6), mediana: +med.toFixed(1), p95: +p95.toFixed(1), fps: Math.round(n / real), lentitud: +(perdido / real * 100).toFixed(0) };
    }, [veh, SEG]);
    out.vehiculos.push(r); console.log('VEH', JSON.stringify(r));
  }
  /* ---------- oficios y juegos ---------- */
  const modos = await p.evaluate(() => Object.keys(MODE_CLASS));
  for (const id of modos) {
    const r = await p.evaluate(async ([id, SEG]) => {
      const espera = ms => new Promise(s => setTimeout(s, ms)), e0 = (JE.errors || []).length;
      try { if (JE.game.mode) JE.game.stop(); JE.game.start(id, 1, { seed: 9, nov: NOVEDADES[0], players: [{ name: 'A' }, { name: 'B' }] }); } catch (e) { return { id, error: 'no arranca: ' + e.message }; }
      await espera(500); const M = JE.game.mode; if (!M) return { id, error: 'sin modo' };
      /* 3.2 · la plantilla por modo: el puntaje cuenta el del minijuego en curso (los turnos de varios minijuegos lo suman al
         terminar cada uno) y el avance de las carreras sin fin (distM); «accion» dice si en SEG segundos pasó algo */
      const sub = () => M.sub || M, pts = () => (M.score || 0) + (M.sub && !(M instanceof ModeSub) ? M.sub.score || 0 : 0), a = sub();
      const P0 = M.ride ? { x: M.ride.p.x, y: M.ride.p.y } : null, s0 = pts(), d0 = a.distM != null ? a.distM : a.metros != null ? a.metros : null; let n = 0; const t0 = performance.now(), cuadros = []; let last = t0;
      while (performance.now() - t0 < SEG * 1000) { await new Promise(r => requestAnimationFrame(r)); const now = performance.now(); cuadros.push(now - last); last = now; n++; try { const b = sub(); if (n % 6 === 0) { if (b !== M && b.bot) b.bot(0); else if (M.bot) M.bot(0); } } catch (e) { } if (!JE.game.mode) break; }
      const real = (performance.now() - t0) / 1000; cuadros.sort((x, y) => x - y); const b = sub();
      const mov = P0 && M.ride ? Math.round(Math.hypot(M.ride.p.x - P0.x, M.ride.p.y - P0.y) * M_PER_PX) : d0 != null ? Math.round((b.distM != null ? b.distM : b.metros) - d0) : null, puntos = Math.round(pts() - s0);
      return { id, nombre: (ROLE[id] || {}).name, vista: (b.view || {}).kind, fps: Math.round(n / real), mediana: +cuadros[cuadros.length >> 1].toFixed(1), p95: +cuadros[Math.floor(cuadros.length * .95)].toFixed(1), movio: mov, puntos, accion: puntos !== 0 || mov > 3, errores: (JE.errors || []).length - e0, termino: !!M.done || !JE.game.mode };
    }, [id, SEG]);
    out.modos.push(r); console.log('MODO', JSON.stringify(r));
  }
  out.errores = errs.slice(0, 20);
  fs.writeFileSync(path.join(__dirname, 'out', 'auditoria-modos.json'), JSON.stringify(out, null, 1));
  console.log('errores de página:', errs.length, errs.slice(0, 5).join(' | ')); await b.close();
})();
