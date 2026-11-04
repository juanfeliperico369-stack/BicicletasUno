#!/usr/bin/env node
/* Pruebas de Juega EnCicla
   node tests/run.js [--n=100] [--shots] [--file=dist/juega-encicla.html]
   1) sintaxis del JS embebido  2) bot: N partidas simuladas  3) humo de interfaz  4) rendimiento con CPU 4x lenta */
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), vm = require('vm');
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k)); return a ? (a.split('=')[1] || true) : null; };
const ROOT = path.join(__dirname, '..'), FILE = path.join(ROOT, arg('file') || 'dist/juega-encicla.html'), N = +(arg('n') || 54), SHOTS = !!arg('shots');
const OUT = path.join(ROOT, 'tests', 'out'); fs.mkdirSync(OUT, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
(async () => {
  console.log('1) Sintaxis');
  const html = fs.readFileSync(FILE, 'utf8'), js = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
  try { new vm.Script(js, { filename: 'juego.js' }); ok(true, 'JS compila (' + (js.length / 1024).toFixed(0) + ' KB)'); } catch (e) { ok(false, 'Error de sintaxis: ' + e.message); }
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }), p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 30000 });
  ok(!errs.length, 'carga sin errores ' + errs.join(' | '));

  console.log('2) Bot: ' + N + ' partidas simuladas');
  const rep = await p.evaluate(async n => { const r = await JE.bot.run({ n, render: true }); return { okAll: r.okAll, txt: JE.bot.format(r), by: JE.bot.summary(r), ms: r.ms }; }, N);
  console.log(rep.txt.split('\n').map(l => '     ' + l).join('\n'));
  ok(rep.okAll, 'todas las partidas sin fallas (' + (rep.ms / 1000).toFixed(1) + ' s)');
  fs.writeFileSync(path.join(OUT, 'bot.txt'), rep.txt);

  console.log('3) Humo de interfaz');
  await p.reload(); await p.waitForFunction(() => window.JE && JE.ready);
  await p.click('#bPlay'); ok(await p.isVisible('#modal'), 'introducción ¿Qué es EnCicla?');
  for (let k = 0; k < 4 && await p.isVisible('#inNext'); k++) await p.click('#inNext');
  ok(await p.isVisible('#sHome') && !(await p.isVisible('#modal')), 'portada → introducción → escalafón');
  if (SHOTS) await p.screenshot({ path: path.join(OUT, 'escalafon.png') });
  await p.click('button[data-role=usuario][data-t="1"]'); ok(await p.isVisible('#sBrief'), 'briefing de Usuario');
  await p.click('#bGo'); await p.waitForTimeout(400); ok(await p.isVisible('#sGame'), 'juego iniciado');
  const box = await p.locator('#cv').boundingBox();
  await p.mouse.move(box.x + 200, box.y + 500); await p.mouse.down(); await p.mouse.move(box.x + 200, box.y + 420, { steps: 5 }); await p.waitForTimeout(1500); await p.mouse.up();
  const moved = await p.evaluate(() => JE.game.mode && JE.game.mode.ride.stats.dist > 5); ok(moved, 'el ciclista se mueve con el dedo');
  if (SHOTS) await p.screenshot({ path: path.join(OUT, 'usuario.png') });
  for (const [role, t] of [['anfitrion', 1], ['mecanico', 1], ['bodega', 1], ['monitoreo', 1], ['supervisor', 1], ['balance', 1]]) {
    await p.evaluate(([r, t]) => { JE.game.stop(); JE.game.start(r, t, { seed: 77, nov: NOVEDADES[0] }); }, [role, t]);
    await p.waitForTimeout(role === 'anfitrion' ? 4000 : 1200);
    if (role === 'anfitrion') await p.evaluate(() => { const S = JE.game.mode.sub; S.serve(); });
    await p.waitForTimeout(300);
    if (SHOTS) await p.screenshot({ path: path.join(OUT, role + '.png') });
  }
  ok(!errs.length, 'modos dibujan sin errores ' + errs.slice(0, 3).join(' | '));
  // fin de turno -> resultados -> mejora -> pestañas y modales
  await p.evaluate(() => { const M = JE.game.mode; M.solved = 99; M.perfectOpen = true; M.cierre = true; M.end(); });
  await p.waitForTimeout(300); ok(await p.isVisible('#sResult'), 'pantalla de resultados');
  if (await p.isVisible('[data-perk]')) { await p.click('[data-perk]'); ok(await p.evaluate(() => Save.data.perks.length > 0), 'elegir mejora (roguelite)'); }
  if (SHOTS) await p.screenshot({ path: path.join(OUT, 'resultado.png') });
  ok(await p.evaluate(() => { const c = Art.resultCard({ score: 1234, stars: 2, goals: [{ txt: 'a', ok: true, main: true }, { txt: 'b', ok: false }, { txt: 'c', ok: true }] }, { roleId: 'anfitrion', turno: 2, nov: NOVEDADES[1] }); return c.width === 1080 && c.toDataURL().length > 20000; }), 'tarjeta de resultado para compartir');
  ok(await p.evaluate(() => Save.data.logros.includes('primer')), 'logro "Primer pedalazo" desbloqueado');
  await p.click('#bEsc');
  for (const t of ['album', 'parts', 'mas', 'ruta']) { await p.click(`#tabs button[data-tab=${t}]`); await p.waitForTimeout(150); }
  if (SHOTS) { await p.click('#tabs button[data-tab=album]'); await p.screenshot({ path: path.join(OUT, 'album.png') }); await p.click('#tabs button[data-tab=mas]'); }
  else await p.click('#tabs button[data-tab=mas]');
  await p.click('#tab-mas [data-sw=big]'); ok(await p.evaluate(() => document.body.classList.contains('big') && Save.data.settings.big), 'letra grande'); await p.click('#tab-mas [data-sw=big]');
  for (const act of ['avatar', 'multi', 'howto', 'cred', 'intro', 'apoya']) { await p.click(`#tab-mas [data-act=${act}]`); await p.waitForTimeout(120); ok(await p.isVisible('#modal'), 'modal ' + act); await p.evaluate(() => UI.closeModal()); }
  await p.click('#tab-mas [data-act=bot]'); await p.click('#dRun'); await p.waitForFunction(() => /SIN ERRORES|PROBLEMAS/.test(document.querySelector('#dOut').textContent), null, { timeout: 120000 });
  ok(await p.evaluate(() => /SIN ERRORES/.test(document.querySelector('#dOut').textContent)), 'bot desde Ajustes > Diagnóstico'); await p.evaluate(() => UI.closeModal());
  await p.evaluate(() => { const c = UI.code({ roleId: 'anfitrion', turno: 2, seed: 123456 }); const q = UI.parseCode(c); if (!q || q.seed !== 123456 || q.roleId !== 'anfitrion') throw new Error('código'); });
  ok(!errs.length, 'interfaz sin errores ' + errs.slice(0, 3).join(' | '));
  await p.evaluate(() => { if (JE.game.mode) JE.game.stop(); });
  const rt = await p.evaluate(() => { const t = Save.exportText(); Save.importText(t); return Save.valid(Save.data); }); ok(rt, 'exportar/importar partidas');

  console.log('4) Rendimiento (CPU 4x más lenta, como celular modesto)');
  const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const perf = {};
  for (const role of ['usuario', 'anfitrion', 'monitoreo']) {
    perf[role] = await p.evaluate(async r => { JE.game.start(r, 2, { seed: 9, nov: NOVEDADES[3] }); await new Promise(s => setTimeout(s, 800)); const ts = []; let last = performance.now(); await new Promise(res => { const f = t => { ts.push(t - last); last = t; if (ts.length < 120) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); JE.game.stop(); ts.sort((a, b) => a - b); return { med: ts[60].toFixed(1), p95: ts[114].toFixed(1) }; }, role);
    console.log('     ' + role.padEnd(10) + ' mediana ' + perf[role].med + ' ms · p95 ' + perf[role].p95 + ' ms');
  }
  ok(+perf.usuario.med < 40, 'mapa fluido en CPU lenta (mediana < 40 ms)');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  ok(!errs.length, 'sin errores de consola al final ' + errs.slice(0, 3).join(' | '));
  await b.close();

  console.log('5) Multijugador: sala WebRTC entre dos dispositivos');
  const b2 = await chromium.launch({ args: ['--disable-features=WebRtcHideLocalIpsWithMdns'] }), c2 = await b2.newContext({ viewport: { width: 390, height: 780 } });
  const host = await c2.newPage(), guest = await c2.newPage(), nerr = [];
  for (const pg of [host, guest]) { pg.on('pageerror', e => nerr.push(e.message)); await pg.goto('file://' + FILE); await pg.waitForFunction(() => window.JE && JE.ready); }
  await host.evaluate(() => { Save.data.profile.name = 'Anfitriona'; UI.multi(); });
  await guest.evaluate(() => { Save.data.profile.name = 'Invitado'; UI.multi(); });
  await host.click('#nHost'); await host.waitForSelector('#nCode', { timeout: 15000 }); const offer = await host.inputValue('#nCode');
  ok(/^JE[01]o/.test(offer), 'código de sala generado (' + offer.length + ' caracteres)');
  await guest.click('#nJoin'); await guest.fill('#nOff', offer); await guest.click('#nAnsB'); await guest.waitForSelector('#nCode', { timeout: 15000 }); const ans = await guest.inputValue('#nCode');
  ok(/^JE[01]a/.test(ans), 'código de respuesta generado');
  await host.fill('#nAns', ans); await host.click('#nGo');
  const started = await Promise.all([host, guest].map(pg => pg.waitForFunction(() => JE.game.mode && JE.game.mode.id === 'carrera' && JE.game.mode.net, null, { timeout: 20000 }).then(() => true).catch(() => false)));
  ok(started.every(Boolean), 'carrera en red iniciada en ambos dispositivos');
  if (started.every(Boolean)) {
    await host.waitForTimeout(3600); await host.evaluate(() => { JE.game.mode.ride.p.x += 40; }); await guest.waitForTimeout(800);
    const seen = await guest.evaluate(() => { const o = JE.game.mode.opp; return { name: o.name, x: Math.round(o.x), hostSeed: JE.game.meta.seed }; });
    const hseed = await host.evaluate(() => ({ x: Math.round(JE.game.mode.ride.p.x), seed: JE.game.meta.seed }));
    ok(seen.name === 'Anfitriona' && Math.abs(seen.x - hseed.x) < 25 && seen.hostSeed === hseed.seed, 'el invitado ve al anfitrión en tiempo real (misma semilla)');
    if (SHOTS) await guest.screenshot({ path: path.join(OUT, 'carrera-red.png') });
  }
  ok(!nerr.length, 'multijugador sin errores ' + nerr.slice(0, 2).join(' | '));
  await b2.close();
  console.log(fails ? '\n✗ ' + fails + ' prueba(s) fallaron' : '\n✓ TODAS LAS PRUEBAS PASARON'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
