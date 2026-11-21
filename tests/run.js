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

  console.log('1b) Mapa: estaciones, lugares y camión alcanzables');
  const mp = await p.evaluate(() => { const M = JE.map, dp = M.depot, D = M.flow(Math.floor(dp.x / TS), Math.floor(dp.y / TS), false, -1), Dt = M.flow(Math.floor(dp.x / TS), Math.floor(dp.y / TS), true, -1);
    const reach = (x, y, DD, rad) => { for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { const tx = Math.floor(x / TS) + dx, ty = Math.floor(y / TS) + dy; if (M.fv(DD, tx, ty) < 1e9) return true; } return false; };
    return { n: M.stations.length, lm: LANDMARKS.length, s: M.stations.filter(s => !reach(s.x, s.y, D, Math.round(MS))).map(s => s.name), t: M.stations.filter(s => !reach(s.x, s.y, Dt, Math.round(5 * MS))).map(s => s.name), l: LANDMARKS.filter(l => l.id !== 'depot').filter(l => !reach((l.x + l.w / 2) * TS, (l.y + l.h) * TS + 6, D, Math.ceil((Math.max(l.w, l.h) * TS / 2 + 8) / TS))).map(l => l.id), muni: [...new Set(M.stations.map(s => s.muni))].length, dropped: M.dropped || [], az: APOYO_ZONAS.map(z => z[2] - M.stations.filter(s => s.az === z[0]).length).join(''), ms: JE.mapMs }; });
  ok(!mp.dropped.length && /^0+$/.test(mp.az), 'estaciones ubicadas y zonas del Apoyo completas ' + mp.dropped.join(',') + ' ' + mp.az + ' · mapa cargado en ' + mp.ms + ' ms');
  ok(mp.n >= 100 && !mp.s.length && !mp.t.length && !mp.l.length, mp.n + ' estaciones en ' + mp.muni + ' municipios y ' + mp.lm + ' lugares alcanzables ' + [mp.s, mp.t, mp.l].flat().join(','));
  console.log('1c) Minijuegos nuevos y Easter eggs (bot)');
  const mgs = await p.evaluate(() => { JE.headless = true; const out = []; const par = () => ({ rng: new RNG(7), has: () => false, mods: { demand: 1 }, patMul: 1, paceRate: 1 });
    for (const [n, mk] of [['Circuito', P => new MGLoop(P, { n: 5 })], ['Láser', P => new MGLaser(P, { n: 5, turns: 3 })], ['Semaforero', P => new MGTraffix(P, { dur: 28, target: 10 })], ['Desvíos', P => new MGRutas(P, { dur: 40 })], ['Maquinista', P => new MGRutas(P, { theme: 'metro', dur: 40 })], ['Laberinto', P => new MGLaberinto(P, { n: 9 })]]) {
      const m = mk(par()); let t = 0, a = 0; while (!m.done && t < 150) { if ((a += 1 / 30) > .3) { a = 0; m.bot(0); } m.update(1 / 30); t += 1 / 30; } out.push({ n, done: m.done, t: Math.round(t), score: m.score, err: m.errors, extra: m.crashes != null ? 'choques ' + m.crashes : m.acc ? 'precisión ' + Math.round(m.acc() * 100) + '%' : '' }); }
    JE.headless = false; return out; });
  for (const g of mgs) console.log('     ' + g.n.padEnd(11) + (g.done ? ' terminado' : ' NO TERMINÓ') + ' en ' + g.t + ' s · pts ' + g.score + ' · errores ' + g.err + (g.extra ? ' · ' + g.extra : ''));
  ok(mgs.every(g => g.done && isFinite(g.score)), 'los 6 minijuegos nuevos se completan con el bot');

  console.log('2) Bot: ' + N + ' partidas simuladas');
  const rep = await p.evaluate(async n => { const r = await JE.bot.run({ n, render: true }); return { okAll: r.okAll, txt: JE.bot.format(r), by: JE.bot.summary(r), ms: r.ms }; }, N);
  console.log(rep.txt.split('\n').map(l => '     ' + l).join('\n'));
  ok(rep.okAll, 'todas las partidas sin fallas (' + (rep.ms / 1000).toFixed(1) + ' s)');
  fs.writeFileSync(path.join(OUT, 'bot.txt'), rep.txt);

  console.log('3) Humo de interfaz');
  await p.reload(); await p.waitForFunction(() => window.JE && JE.ready);
  /* mundo abierto primero (regla del autor, auditoría G-H28): ▶ Jugar entra directo al modo libre, sin bienvenida ni personaje */
  await p.click('#bPlay'); await p.waitForTimeout(800); ok(await p.isVisible('#sGame') && !(await p.isVisible('#modal')) && await p.evaluate(() => !!(Game.meta && Game.meta.free)), 'mundo abierto primero: ▶ Jugar entra directo al modo libre');
  await p.reload(); await p.waitForFunction(() => window.JE && JE.ready);
  await p.click('#bOficios'); ok(await p.isVisible('#modal'), 'introducción ¿Qué es EnCicla? (opcional, desde 🏆 Oficios y modos)');
  for (let k = 0; k < 4 && await p.isVisible('#inNext'); k++) await p.click('#inNext');
  ok(await p.isVisible('#avOk') && await p.isVisible('#avPrev'), 'al empezar se crea el personaje');
  await p.click('.avtabs button[data-tab=ropa]'); await p.click('#mBody [data-k=pants][data-i="2"]'); await p.click('#avOk');
  ok(await p.evaluate(() => Save.data.profile.pants === 2 && Save.data.settings.seen.profile === 1), 'personaje guardado');
  ok(await p.isVisible('#sHome') && !(await p.isVisible('#modal')), '🏆 Oficios y modos → introducción → personaje → escalafón');
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
    if (role === 'anfitrion') await p.evaluate(() => { const S = JE.game.mode.sub; if (S && S.serve) S.serve(); });
    await p.waitForTimeout(300);
    if (SHOTS) await p.screenshot({ path: path.join(OUT, role + '.png') });
  }
  ok(!errs.length, 'modos dibujan sin errores ' + errs.slice(0, 3).join(' | '));
  // fin de turno -> resultados -> mejora -> pestañas y modales
  await p.evaluate(() => { const M = JE.game.mode; M.solved = 99; M.perfectOpen = true; M.cierre = true; M.end(); });
  await p.waitForTimeout(300); ok(await p.isVisible('#sResult'), 'pantalla de resultados');
  if (await p.isVisible('#cineSkip')) await p.click('#cineSkip');
  if (await p.isVisible('[data-perk]')) { await p.click('[data-perk]'); ok(await p.evaluate(() => Save.data.perks.length > 0), 'elegir mejora (roguelite)'); }
  if (SHOTS) await p.screenshot({ path: path.join(OUT, 'resultado.png') });
  ok(await p.evaluate(() => { const c = Art.resultCard({ score: 1234, stars: 2, goals: [{ txt: 'a', ok: true, main: true }, { txt: 'b', ok: false }, { txt: 'c', ok: true }] }, { roleId: 'anfitrion', turno: 2, nov: NOVEDADES[1] }); return c.width === 1080 && c.toDataURL().length > 20000; }), 'tarjeta de resultado para compartir');
  ok(await p.evaluate(() => Save.data.logros.includes('primer')), 'logro "Primer pedalazo" desbloqueado');
  await p.click('#bEsc');
  for (const t of ['album', 'parts', 'mas', 'ruta']) { await p.click(`#tabs button[data-tab=${t}]`); await p.waitForTimeout(150); }
  if (SHOTS) { await p.click('#tabs button[data-tab=album]'); await p.screenshot({ path: path.join(OUT, 'album.png') }); await p.click('#tabs button[data-tab=mas]'); }
  else await p.click('#tabs button[data-tab=mas]');
  await p.click('#tab-mas [data-sw=big]'); ok(await p.evaluate(() => document.body.classList.contains('big') && Save.data.settings.big), 'letra grande'); await p.click('#tab-mas [data-sw=big]');
  for (const act of ['avatar', 'historia', 'personajes', 'ranking', 'multi', 'howto', 'cred', 'intro', 'apoya']) { await p.click(`#tab-mas [data-act=${act}]`); await p.waitForTimeout(120); ok(await p.isVisible('#modal'), 'modal ' + act); await p.evaluate(() => UI.closeModal()); }
  await p.click('#tab-mas [data-act=bot]'); await p.click('#dRun'); await p.waitForFunction(() => /SIN ERRORES|PROBLEMAS/.test(document.querySelector('#dOut').textContent), null, { timeout: 120000 });
  ok(await p.evaluate(() => /SIN ERRORES/.test(document.querySelector('#dOut').textContent)), 'bot desde Ajustes > Diagnóstico'); await p.evaluate(() => UI.closeModal());
  await p.evaluate(() => { const c = UI.code({ roleId: 'anfitrion', turno: 2, seed: 123456 }); const q = UI.parseCode(c); if (!q || q.seed !== 123456 || q.roleId !== 'anfitrion') throw new Error('código'); });
  ok(!errs.length, 'interfaz sin errores ' + errs.slice(0, 3).join(' | '));
  await p.evaluate(() => { if (JE.game.mode) JE.game.stop(); });
  const rt = await p.evaluate(() => { const t = Save.exportText(); Save.importText(t); return Save.valid(Save.data); }); ok(rt, 'exportar/importar partidas');

  console.log('3b) Pantalla sin encimados, caminar, descarga con equilibrio y música');
  const ov = await p.evaluate(async () => {
    const out = [], hit = (a, b) => a && b && a.width > 0 && b.width > 0 && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
    const R = id => { const e = document.querySelector(id); if (!e || getComputedStyle(e).display === 'none' || getComputedStyle(e).opacity === '0') return null; return e.getBoundingClientRect(); };
    const cv = document.querySelector('#cv').getBoundingClientRect(), mm = () => { const r = JE.game.mode && JE.game.mode.ride && JE.game.mode.ride.mmRect; return r ? { left: cv.left + r.x, right: cv.left + r.x + r.w, top: cv.top + r.y, bottom: cv.top + r.y + r.h + 18 } : null; };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    for (const [role, t, ctrl] of [['usuario', 2, 'flotante'], ['balance', 1, 'flechas'], ['apoyo', 1, 'fijo'], ['anfitrion', 1, 'flotante'], ['mecanico', 2, 'flotante']]) {
      Save.data.settings.ctrl = ctrl; if (JE.game.mode) JE.game.stop(); JE.game.start(role, t, { seed: 31, nov: NOVEDADES[0] }); UI.toast('Aviso de prueba para revisar que no tape nada en la pantalla');
      await wait(700);
      const g = R('#goalsMini'), to = R('#toast.on'), co = R('#coach'), ab = R('#actBar'), hud = R('#hud'), m = mm();
      if (hit(g, m)) out.push(role + ': metas sobre el minimapa'); if (hit(to, g)) out.push(role + ': aviso sobre las metas'); if (hit(to, m)) out.push(role + ': aviso sobre el minimapa');
      if (hit(co, ab) && ab.height > 0) out.push(role + ': ayuda sobre los botones'); if (g && hud && g.top < hud.bottom - 1) out.push(role + ': metas debajo del HUD');
      if (ctrl === 'flechas') { for (const [, x, y] of Ctrl.arrows()) { const r = { left: cv.left + x - 26, right: cv.left + x + 26, top: cv.top + y - 26, bottom: cv.top + y + 26 }; if (hit(co, r)) out.push(role + ': ayuda sobre las flechas'); if (hit(ab, r) && ab.height > 0) out.push(role + ': botones sobre las flechas'); } }
    }
    Save.data.settings.ctrl = 'flotante';
    // caminar en el modo libre
    JE.game.stop(); JE.game.start('usuario', 1, { seed: 5, nov: NOVEDADES[0], free: true }); const M = JE.game.mode, Rd = M.ride; Rd.getOff();
    const x0 = Rd.p.x, y0 = Rd.p.y; Input.botDir = { x: 1, y: 0, m: 1 }; for (let i = 0; i < 60; i++) M.update(1 / 30); Input.botDir = { x: -1, y: 0, m: 1 }; for (let i = 0; i < 60; i++) M.update(1 / 30); Input.botDir = null;
    const walked = Rd.p.veh === 'walk' && (Math.abs(Rd.p.x - x0) + Math.abs(Rd.p.y - y0) > 0 || Rd.stats.dist > 10); Rd.p.x = Rd.parked.x; Rd.p.y = Rd.parked.y; const on = Rd.getOn() && Rd.p.veh === 'bike';
    // descarga con equilibrio: el bot la termina sin perder bicis
    JE.headless = true; const D = new MGDescarga({ rng: new RNG(3), has: () => false, mods: { demand: 1 }, patMul: 1, paceRate: 1 }, { type: 'llevar', n: 5, dist: 40 }); let k = 0;
    while (!D.done && k < 30 * 120) { if (k % 3 === 0) D.bot(.05); D.update(1 / 30); k++; } JE.headless = false;
    // música: más velocidad = tempo más rápido
    Snd.init(); Snd.mood = { e: 0, t: 0, k: 0, n: 0, sl: 0 }; Snd.mt = { e: 0, t: 0, k: 0, n: 0, sl: 0 }; Snd.nextT = 1e9; Snd.sched(); const slow = Snd.spb; Snd.setMood({ e: 1, k: 3 }); for (let i = 0; i < 40; i++) Snd.sched(); const fast = Snd.spb;
    JE.game.stop(); UI.go('sHome');
    return { out, walked, on, descarga: D.done && D.moved === 5, drops: D.drops, music: fast < slow };
  });
  ok(!ov.out.length, 'sin textos ni avisos encimados en 5 pantallas ' + ov.out.join(' | '));
  ok(ov.walked && ov.on, 'modo libre: bajarse, caminar y volver a subirse a la bici');
  ok(ov.descarga, 'bajar y organizar bicis con equilibrio (el bot lleva las 5, ' + ov.drops + ' caídas)');
  ok(ov.music, 'la música se acelera con la velocidad y la racha');
  console.log('3c) Calendario real, fiestas, modo libre con misiones y perfil');
  const cal = await p.evaluate(async () => {
    const k = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const fest = Object.keys(Cal.festivos(2026)).sort(), want = ['2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29', '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25'];
    const fi = s => (Cal.fiesta(new Date(s)) || {}).id || '';
    const fiestas = [fi('2026-12-06T10:00'), fi('2027-01-03T10:00'), fi('2026-12-07T20:00'), fi('2026-10-31T10:00'), fi('2026-08-10T10:00'), fi('2026-09-19T10:00'), fi('2026-07-20T10:00'), fi('2026-11-12T10:00')];
    const sv = [Cal.service(new Date('2026-11-12T10:00')).open, Cal.service(new Date('2026-11-15T10:00')).open, Cal.service(new Date('2026-12-08T10:00')).close, Cal.open(new Date('2026-11-12T20:59')), Cal.open(new Date('2026-11-12T21:00')), Cal.service(new Date('2026-11-12T10:00')).close, Cal.open(new Date('2026-11-14T18:59')), Cal.open(new Date('2026-11-14T19:00')), Cal.service(new Date('2026-11-14T10:00')).close, Cal.open(new Date('2026-11-15T14:59')), Cal.open(new Date('2026-11-15T15:00')), Cal.soloAuto(new Date('2026-11-15T10:00')), Cal.soloAuto(new Date('2026-11-16T10:00')), Cal.soloAuto(new Date('2026-11-17T10:00'))];
    // misiones: estudiante un martes, trabajador un viernes, ciclovía un domingo
    const P = Save.data.profile, bak = JSON.stringify(P); Save.data.dia = null;
    Object.assign(P, { uni: 1, trabajo: 0, colegio: 0 }); const m1 = genMisiones(new Date('2026-11-10T07:00')).map(m => m.id);
    Object.assign(P, { uni: 0, trabajo: 2 }); const m2 = genMisiones(new Date('2026-11-13T07:00')).map(m => m.id);
    const m3 = genMisiones(new Date('2026-11-15T08:00')).map(m => m.id);
    // jugar el modo libre un martes a las 7 a. m.: la rutina de la universidad con animación del tiempo
    Object.assign(P, { uni: 1, trabajo: 0 }); JE.fecha = '2026-11-10T07:00'; JE.headless = true;
    JE.game.start('usuario', 1, { seed: 9, nov: NOVEDADES[0], free: true }); const M = JE.game.mode, R = M.ride, ms = M.misiones.find(x => x.id === 'uni');
    const mk = ms.marks[0]; R.p.x = mk.x; R.p.y = mk.y; let n = 0; while (!M.sub && n < 60) { M.update(1 / 30); n++; }
    const sub = M.sub && M.sub.constructor.name; n = 0; while (M.sub && n < 30 * 20) { if (n % 10 === 0) M.sub.bot(); M.update(1 / 30); n++; }
    const rutina = !!ms.done && M.clock > 7 * 60 + 100;
    // energía: pedalear la baja, sentarse la sube
    M.energy = 50; R.p.v = 60; const e0 = M.energy; M.tick(1); const drained = M.energy < e0; M.sitting = true; M.sitT = 0; for (let i = 0; i < 60; i++) M.update(1 / 30); const rest = M.energy > 50; M.sitting = false;
    // foto en un lugar emblemático
    const L = PUBLIC_LM()[0]; R.p.x = (L.x + L.w / 2) * TS; R.p.y = (L.y + L.h / 2) * TS; R.p.v = 0; const f0 = (Save.data.fotos || []).length, fa = M.actions().find(a => a.id === 'foto'); if (fa) fa.fn(); const foto = (Save.data.fotos || []).length === f0 + 1;
    // carrera de la ciclovía un domingo
    JE.game.stop(); JE.fecha = '2026-11-15T08:00'; JE.game.start('usuario', 1, { seed: 4, nov: NOVEDADES[0], free: true }); const M2 = JE.game.mode, R2 = M2.ride, rc = M2.misiones.find(x => x.id === 'carrera');
    let race = 'sin carril';
    if (rc && rc.marks.length) { const s = rc.marks[0]; R2.p.x = s.x; R2.p.y = s.y; for (let i = 0; i < 10; i++) M2.update(1 / 30); const r = M2.race; if (r) { for (let i = 0; i < 3; i++) { const q = r.m; R2.p.x = q.x; R2.p.y = q.y; for (let j = 0; j < 4; j++) M2.update(1 / 30); } race = !M2.race && rc.done ? 'ok' : 'no terminó'; } else race = 'no arrancó'; }
    for (let i = 0; i < 90; i++) M2.update(1 / 30); const cvBikes = R2.cars.filter(c => c.kind === 'bici').length;
    JE.game.stop(); JE.fecha = null; JE.headless = false; Object.assign(Save.data.profile, JSON.parse(bak));
    // colores: trabajadores con uniforme y bici verde; en el modo libre con bici propia, tu color
    JE.game.start('balance', 1, { seed: 3, nov: NOVEDADES[0] }); const uni = JE.game.mode.uniform && bikeCol() === PAL.vd; JE.game.stop();
    Save.data.profile.bike = 3; JE.ownBike = true; JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0], free: true, bici: 'propia' }); const own = !JE.game.mode.uniform && bikeCol() === BIKES[3]; JE.game.stop(); Save.data.profile.bike = 0; JE.ownBike = false;
    // creador: pestaña Tú con preguntas
    UI._avTab = null; UI.avatar(true); const tu = !!document.querySelector('#mBody [data-k=uni]') && !!document.querySelector('#mBody [data-k=trabajo]') && !!document.querySelector('#mBody [data-k=colegio]'); UI.closeModal();
    UI._avTab = 'cuerpo'; UI.avatar(false); const cuerpo = !!document.querySelector('#mBody [data-k=build]') && !!document.querySelector('#mBody [data-k=tall]'); UI.closeModal(); UI._avTab = null;
    UI.go('sHome');
    return { fest, want, easter: k(Cal.easter(2026)), fiestas, sv, m1, m2, m3, sub, rutina, drained, rest, foto, race, cvBikes, uni, own, tu, cuerpo };
  });
  ok(JSON.stringify(cal.fest) === JSON.stringify(cal.want) && cal.easter === '2026-04-05', 'festivos de Colombia 2026 (Ley Emiliani y Semana Santa) ' + (JSON.stringify(cal.fest) === JSON.stringify(cal.want) ? '' : cal.fest.filter(x => !cal.want.includes(x)) + ' / ' + cal.want.filter(x => !cal.fest.includes(x))));
  ok(cal.fiestas.join() === 'navidad,navidad,velitas,halloween,flores,amor,patria,', 'fiestas automáticas por fecha: ' + cal.fiestas.join());
  ok(cal.sv.join() === '330,480,960,true,false,1320,true,false,1200,true,false,true,true,false', 'horario de EnCicla: entre semana hasta las 8:59 p. m. (recibe hasta las 10), sábado hasta las 6:59 p. m. (recibe hasta las 8), domingo y festivo de 8 a 4, último préstamo 2:59 p. m., solo automáticas ' + cal.sv.join());
  ok(cal.m1.includes('uni') && cal.m2.includes('trabajo') && cal.m2.includes('viernes') && cal.m3.includes('carrera'), 'misiones según tu vida y el día: ' + [cal.m1, cal.m2, cal.m3].map(x => x.join('+')).join(' | '));
  ok(cal.sub === 'MGRutina' && cal.rutina, 'llegar a la universidad: animación de clase y el reloj avanza');
  ok(cal.drained && cal.rest && cal.foto, 'energía, banca y foto para el álbum');
  ok(cal.race === 'ok' && cal.cvBikes > 0, 'carrera de la ciclovía contra 3 ciclistas (' + cal.race + ', ' + cal.cvBikes + ' ciclistas en la vía)');
  ok(cal.uni && cal.own, 'uniforme y bici verde de EnCicla para los trabajadores; ropa y bici libres en el modo libre');
  ok(cal.tu && cal.cuerpo, 'creador: preguntas de tu vida, contextura y estatura');
  console.log('3d) Gráficos, vistas, música por estilos, corredores eléctricos, tutorial y oficios nuevos');
  const g3 = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), out = {}, e0 = JE.errors.length, S = Save.data.settings, keep = { gfx: S.gfx, vista: S.vista };
    for (const [gfx, vista] of [['hibrido', 'cenital'], ['2d', 'cenital'], ['pixel', 'pano']]) { Object.assign(S, { gfx, vista }); Art.cache.clear(); CityMap.chunks2.clear(); JE.game.start('usuario', 1, { seed: 4, nov: NOVEDADES[0] }); out[gfx + vista] = { q: View.q, pano: panoOn(JE.game.mode.ride) }; await wait(500); JE.game.stop(); }
    Object.assign(S, keep); Art.cache.clear();
    out.music = [Snd.styleNow()]; JE.game.start('balance', 1, { seed: 3, nov: NOVEDADES[0] }); Snd.mood.n = 0; out.music.push(Snd.styleNow()); Snd.mood.n = 1; out.music.push(Snd.styleNow()); Snd.mood.n = 0; JE.game.stop();
    const st = id => JE.map.stations.find(s => s.id === id); out.e = ['floresta', 'c4ta', 'udea', 'hinfantil', 'sancayetano', 'estrella', 'pascualbravo', 'pablotobon'].map(id => (st(id) || {}).e || 'x').join();
    JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0] }); const M = JE.game.mode; M.clock = 19 * 60 + 30; M.takeBike(st('c4ta')); out.eLate = M.ride.ebike; M.clock = 10 * 60; M.takeBike(st('c4ta')); out.eDay = M.ride.ebike; JE.game.stop();
    UI._tuto = true; JE.game.start('pausas', 1, { seed: 5, nov: NOVEDADES[0] }); UI._tuto = false; for (let i = 0; i < 40; i++) Game.dom(1 / 30); out.tut = Tutor.on && Tutor.showing && /Maryi/.test(document.querySelector('#tutor').textContent); document.querySelector('#tutOk').click(); JE.game.stop();
    JE.headless = true; const P = new MGPausa({ rng: new RNG(2), has: () => false }, { lvl: 1 }); P.bot(0); let k = 0; while (!P.done && k < 30 * 90) { P.update(1 / 30); k++; } out.pausa = P.acc; JE.headless = false;
    out.err = JE.errors.slice(e0); UI.go('sHome'); return out;
  });
  ok(g3.hibridocenital.q > 1 && g3['2dcenital'].q > 1 && g3.pixelpano.pano && !g3.err.length, 'gráficos híbrido y 2D con mapa dibujado, y vista panorámica sin errores ' + g3.err.join(' | '));
  ok(g3.music.join() === 'lofi,rock,jazz', 'música automática: lo-fi en menús, soft rock en turnos y jazz de noche (' + g3.music.join() + ')');
  ok(g3.e === 'mix,solo,mix,solo,mix,solo,mix,solo' && !g3.eLate && g3.eDay, 'corredores eléctricos: 4 pares mixta y solo eléctricas; servicio eléctrico hasta las 7 p. m.');
  ok(g3.tut, 'tutorial opcional con compañero (Maryi en Pausas Activas)');
  ok(g3.pausa >= 80, 'pausa activa: el bot sigue la coreografía (' + g3.pausa + ' %)');
  console.log('3e) Piloto: daltonismo, retos con QR, escenas de la historia y Bluetooth (simulado)');
  const pl = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), out = {}, e0 = JE.errors.length, S = Save.data.settings;
    const run = async (max) => { const M = JE.game.mode; JE.headless = true; let k = 0; while (JE.game.mode === M && !M.done && k < 30 * max) { M.bot(.05); M.update(1 / 30); k++; } JE.headless = false; await wait(350); };
    // colores para daltonismo
    const c0 = PAL.cor, w0 = WCOL[0]; S.cb = true; applyCB(); out.cb = PAL.cor !== c0 && WCOL[0] === OKABE[0] && document.body.classList.contains('cb'); S.cb = false; applyCB(); out.cbOff = PAL.cor === c0 && WCOL[0] === w0;
    // retos: el código lleva la ruta y las reglas
    const c = { k: 'carrera', n: 3, zona: 'sur', lvl: 1, seed: 123456789 }, code = Reto.make(c); out.code = code; out.round = JSON.stringify(Reto.parse(Reto.url(code))) === JSON.stringify(c);
    const h = Reto.parse('rh2-abc'); out.hojas = !!h && h.k === 'hojas' && h.min === 2; out.bad = Reto.parse('hola') === null && UI.parseCode('10-1-ABC') != null;
    UI.retoVer(c, true); out.qr = !!document.querySelector('#rQR canvas');
    Reto.play(c); const M1 = JE.game.mode; out.np = M1.id === 'carrera' && M1.np === 3; const pts1 = M1.pts.map(q => q.name).join('|'); M1.countdown = 0; M1.limit = 200; await run(260);
    out.res1 = !!document.querySelector('#rShareM') && /Tu marca/.test(document.querySelector('#resBody').textContent);
    Reto.play(c); out.same = JE.game.mode.pts.map(q => q.name).join('|') === pts1; JE.game.stop();
    Reto.play(h); const M2 = JE.game.mode; out.lib = M2.id === 'libre' && M2.comp.k === 'hojas'; M2.countdown = 0; M2.sc = 7; M2.left = .2; await run(20); await wait(3600);
    out.res2 = /7 hojas/.test((document.querySelector('#resBody') || {}).textContent || '');
    // escena de la historia: se puede ver y saltar
    S.cine = true; Cine.play('usuario', 1, { unlocks: ['Anfitrión'] }); await wait(200); out.cine = !!document.querySelector('#cine canvas');
    document.querySelector('#cineNext').click(); await wait(250); const txt = document.querySelector('#cine .ctext p').textContent; document.querySelector('#cineNext').click(); await wait(80); out.cineTxt = txt.length > 3 && document.querySelector('#cine .ctext p').textContent.length > txt.length;
    document.querySelector('#cineSkip').click(); out.cineEnd = !document.querySelector('#cine');
    const st0 = JSON.stringify(Save.data.stars.bodega || null); Save.data.stars.bodega = [0]; const pr = Progress.apply({ score: 50, stars: 2, pass: true, goals: [] }, { roleId: 'bodega', turno: 1, seed: 1, nov: NOVEDADES[0], dur: 30 }, { stats: {}, ride: null, id: 'bodega', errors: 0 }); out.cineFlag = pr.cine === true;
    // Bluetooth simulado: el anfitrión acepta un invitado y lo ve en la sala
    const sent = []; window.Capacitor = { isNativePlatform: () => true, nativePromise: (pl, m, o) => { sent.push([m, o]); return Promise.resolve(m === 'host' ? { name: 'Celular de prueba' } : m === 'devices' ? { devices: [] } : {}); } };
    const fire = d => { const ev = new Event('jeBt'); Object.assign(ev, d); window.dispatchEvent(ev); };
    UI.go('sHome'); UI.multi(); document.querySelector('#nBt').click(); document.querySelector('#nHost').click(); await wait(100);
    fire({ k: 'open', id: 1, name: 'Amigo BT' }); await wait(50); const idMsg = sent.find(x => x[0] === 'send'); out.btId = !!idMsg && JSON.parse(idMsg[1].data).t === 'id' && JSON.parse(idMsg[1].data).id === 1;
    fire({ k: 'data', id: 1, d: JSON.stringify({ t: 'hi', name: 'Amigo BT', shirt: '#ff6b5a' }) }); await wait(50); out.btLobby = Object.keys(UI.netPlayers).length === 1 && /Bluetooth/.test(document.querySelector('#nInv').textContent) && !document.querySelector('#nLibre').disabled;
    fire({ k: 'close', id: 1 }); await wait(50); out.btBye = Object.keys(UI.netPlayers).length === 0; Net.reset(); out.btStop = sent.some(x => x[0] === 'stop'); delete window.Capacitor; UI.closeModal();
    out.err = JE.errors.slice(e0); UI.go('sHome'); return out;
  });
  ok(pl.cb && pl.cbOff, 'colores para daltonismo: paleta segura y vuelta a los colores normales');
  ok(pl.round && pl.hojas && pl.bad && pl.qr, 'retos: código ' + pl.code + ' con QR, ida y vuelta por enlace, y códigos de oficios de 2 cifras');
  ok(pl.np && pl.same && pl.res1 && pl.lib && pl.res2, 'retos: misma ruta para todos y marca para compartir (carrera y hojas)');
  ok(pl.cine && pl.cineTxt && pl.cineEnd && pl.cineFlag, 'escena de la historia: se reproduce, avanza y se salta; sale al aprobar un turno por primera vez');
  ok(pl.btId && pl.btLobby && pl.btBye && pl.btStop && !pl.err.length, 'Bluetooth (simulado): el anfitrión acepta, ve al invitado en la sala y cierra ' + pl.err.join(' | '));
  console.log('3f) Controles: siempre disponibles, también después de salir con el mapa grande abierto');
  const probeMove = async () => { const box = await p.locator('#cv').boundingBox(), d0 = await p.evaluate(() => JE.game.mode.ride.stats.dist); await p.mouse.move(box.x + 120, box.y + 560); await p.mouse.down(); await p.mouse.move(box.x + 120, box.y + 470, { steps: 6 }); await p.waitForTimeout(1200); await p.mouse.up(); return p.evaluate(d0 => ({ moved: JE.game.mode.ride.stats.dist - d0 > 5, act: getComputedStyle(document.querySelector('#actBar')).visibility === 'visible' && document.querySelectorAll('#actBar > *').length > 0, map: MapView.open }), d0); };
  await p.evaluate(() => { delete Save.data.settings.ctrl; UI.closeModal(); JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0], free: true }); }); await p.waitForTimeout(700);
  const k1 = await probeMove(); await p.evaluate(() => { JE.game.mode.ride.big = true; }); await p.waitForTimeout(400);
  const mv = await p.evaluate(() => MapView.open && Game.paused); await p.evaluate(() => { Game.pause(); UI.closeModal(); Game.stop(); JE.game.start('usuario', 1, { seed: 4, nov: NOVEDADES[0], free: true }); }); await p.waitForTimeout(700);
  const k2 = await probeMove(); await p.evaluate(() => { JE.game.stop(); UI.go('sHome'); });
  ok(k1.moved && k1.act && mv && k2.moved && k2.act && !k2.map, 'joystick visible por defecto; tras salir con el mapa grande abierto, el ciclista se mueve y los botones se ven ' + JSON.stringify([k1, k2]));
  console.log('3g) Panel de controles: tipo, lado, tamaño e inclinar el celular');
  const cg = await p.evaluate(async () => {
    const S = Save.data.settings, out = {}, keep = { ctrl: S.ctrl, cside: S.cside, csize: S.csize }, click = (k, v) => document.querySelector(`[data-c="${k}"][data-v="${v}"]`).click(), wait = ms => new Promise(r => setTimeout(r, ms));
    JE.game.start('apoyo', 1, { seed: 3, nov: NOVEDADES[0] }); Game.pause(); out.btn = !!document.querySelector('#pCtrl'); document.querySelector('#pCtrl').click(); await wait(50);
    click('ctrl', 'flechas'); await wait(50); click('cside', 'izq'); await wait(50); click('csize', '2'); await wait(50);
    out.left = Ctrl.anchor().x < View.w / 2 && Ctrl.size() > 1 && Ctrl.leftGap() > 100; document.querySelector('#mClose').click(); await wait(400); out.layout = !document.body.classList.contains('ctrlR') && !Game.paused;
    Tilt.start(); const ev = (b, g) => { const e = new Event('deviceorientation'); e.beta = b; e.gamma = g; window.dispatchEvent(e); }; ev(30, 0); Tilt.calib(); S.ctrl = 'inclinar'; ev(30, 20); const d = Input.dir(); out.tilt = d.m > .5 && d.x > .9; ev(30, 0); out.still = Input.dir().m === 0;
    JE.game.stop(); Object.assign(S, keep); if (keep.ctrl == null) delete S.ctrl; UI.go('sHome'); return out;
  });
  ok(cg.btn && cg.left && cg.layout && cg.tilt && cg.still, 'controles: botón en la pausa, flechas a la izquierda en grande, e inclinar el celular mueve al ciclista ' + JSON.stringify(cg));
  console.log('3h) Préstamo EnCicla en el modo libre: renovar cada hora, strikes, suspensión y reporte por abandono');
  const pr = await p.evaluate(() => { const keep = JSON.stringify(Save.data.encicla || null), out = {}; delete Save.data.encicla; JE.fecha = '2026-11-12T10:00'; JE.headless = true;
    JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0], free: true, bici: 'encicla' }); let M = JE.game.mode; out.slow = M.rate < .9;
    M.clock = M.loan0 + 70; const s = JE.map.stations.find(q => stOk(q)); M.ride.p.x = s.x; M.ride.p.y = s.y; out.btn = M.actions().some(a => a.id === 'renovar'); M.renovar(); out.strike = Cuenta.get().strikes === 9 && M.loanMin() === 0;
    Cuenta.get().strikes = 0; M.clock = M.loan0 + 75; M.renovar(); out.susp = Cuenta.get().susp === '2026-11-15';
    M.ride.getOff(); M.ride.p.x += 200; for (let i = 0; i < 30 * 60 && !M.sinBici; i++) { M.ride.p.v = 0; M.tick(1 / 30); } out.rep = Cuenta.get().rep === 1; JE.game.stop();
    JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0], free: true, bici: 'encicla' }); out.own = JE.game.mode.ownBike && JE.game.mode.rate === .9; JE.game.stop();
    JE.fecha = null; JE.headless = false; const k = JSON.parse(keep); if (k) Save.data.encicla = k; else delete Save.data.encicla; UI.go('sHome'); return out; });
  ok(pr.slow && pr.btn && pr.strike && pr.susp && pr.rep && pr.own, 'préstamo: reloj más lento, Renovar, strike por renovar tarde, suspensión sin strikes, reporte por abandono y bici propia si estás suspendido ' + JSON.stringify(pr));
  console.log('3h2) Unido de revolucion-v2: metro sin casas debajo y alto contraste');
  const ac = await p.evaluate(() => { const out = {}, M = JE.map, casa = v => v === TT.BRICK || v === TT.BLDG; let sob = 0;
    for (const P of [M.lineA, M.lineB, M.tram]) for (let s = 0; s <= P.len; s += 6) { const q = M.at(P, s); if (casa(M.get(Math.floor(q.x / TS), Math.floor(q.y / TS)))) sob++; }
    out.corredor = sob === 0 && M.corredorRiel > 0; out.n = M.corredorRiel; const was = Save.data.settings.contraste;
    UI.renderMas(); const sw = document.querySelector('#tab-mas [data-sw="contraste"]'); out.contraste = !!sw;
    if (sw) { sw.click(); out.contraste = document.body.classList.contains('contraste'); sw.click(); out.contraste = out.contraste && !document.body.classList.contains('contraste'); }
    Save.data.settings.contraste = was; return out; });
  ok(ac.corredor, 'metro y tranvía sin casas bajo su trazado (A, B y T; ' + ac.n + ' casillas pasan a andén)');
  ok(ac.contraste, 'opción de alto contraste en Más (se enciende y se apaga)');
  console.log('3h3) Motor City 3.0 en EnCicla: artilugios físicos y calidad automática');
  const ar = await p.evaluate(() => { const A = JE.artilugios, keep = A.L; A.L = []; let i0 = JE.map.t.findIndex(v => v === TT.CICLO); const x = (i0 % MW + .5) * TS, y = (Math.floor(i0 / MW) + .5) * TS;
    const o = A.poner('cono', x + 4, y), ride = { p: { x, y, a: 0, v: 40, veh: 'bike' } }; for (let i = 0; i < 180; i++) { ride.p.x += ride.p.v / 60; A.actualizar(ride, 1 / 60); }
    const out = { movio: +Math.hypot(o.x - x - 4, o.y - y).toFixed(1), vuelco: o.vuelco, sembrados: A.sembrar(x, y, 900, 20, 3), calidad: typeof Calidad.cuadro === 'function' && Calidad.cuadro.toString().includes('prueba') }; A.L = keep; return out; });
  ok(ar.movio > 2 && ar.vuelco === 1 && ar.sembrados > 0 && ar.calidad, 'Motor City 3.0: la bici tumba y empuja los conos, se siembran conos y balones, y la calidad automática solo baja si sirve ' + JSON.stringify(ar));
  console.log('3i) Guion C-99: Un día del valle, ciudad que habla, tutor, fiestas, huevos del Metro y horario especial');
  const gi = await p.evaluate(() => {
    const out = {}, keep = { dia: JSON.stringify(Save.data.diaValle || []), flags: JSON.stringify(Save.data.flags), logros: JSON.stringify(Save.data.logros), cine: Save.data.settings.cine }, T = [], _toast = UI.toast;
    UI.toast = m => { T.push(m); }; Save.data.diaValle = []; Save.data.settings.cine = false; JE.headless = true;
    out.n = DIA.length; out.map = DIA.every(c => ROLE[c.rol] && (!c.turno || c.turno <= nShifts(c.rol)));
    UI.historia(); out.lista = document.querySelectorAll('#mBody .dia-c').length; out.lock = document.querySelectorAll('#mBody .dia-c.lock').length; UI.closeModal();
    Dia.play(DIA[0]); out.brief = /tulas/.test(document.querySelector('#briefBody').textContent) && !!document.querySelector('#briefBody .hist-b .tip');
    document.querySelector('#bGo').click(); out.meta = JE.game.meta.dia === 'dia-01' && JE.game.meta.roleId === 'supervisor';
    JE.game.mode.result = () => ({ pass: true, stars: 2, score: 100, goals: [] }); JE.game.finish();
    const bd = document.querySelector('#bDia');
    out.paso = Dia.done('dia-01') && !!bd && /Capítulo 2/.test(bd.textContent) && /Tulas listas/.test(document.querySelector('#resBody').textContent);
    bd.click(); document.querySelector('#bGo').click(); JE.game.mode.result = () => ({ pass: false, stars: 0, score: 0, goals: [] }); JE.game.finish();
    out.fallo = !Dia.done('dia-02') && !document.querySelector('#bDia') && /verificación/.test(document.querySelector('#resBody').textContent);
    Save.data.diaValle = DIA.slice(0, 15).map(c => c.id); Dia.play(DIA[15]); out.epilogo = Dia.done('dia-16') && Save.data.logros.includes('diavalle');
    UI.brief('mecanico', 1); const tip = document.querySelector('#briefBody .tip'); out.tutor = !!tip && /^💡/.test(tip.textContent);
    JE.fecha = '2026-08-07T10:00'; T.length = 0; JE.game.start('usuario', 1, { seed: 4, nov: NOVEDADES[0], free: true, bici: 'propia' }); out.fiesta = T.some(m => /Feria de las Flores/.test(m));
    let M = JE.game.mode; const R = M.ride; M.clock = 600; R.peds = R.peds || [];
    R.peds.push({ x: R.p.x + 30 * WK, y: R.p.y, dx: 0, dy: 0, spd: 0, col: '#fff', skin: '#e0ac7e', ph: 0 }); R.talkT = 0; R.updLife(1 / 30);
    out.habla = R.fx.some(f => f.k === 't' && /^«/.test(f.txt)); M.mods.rain = true; out.lluvia = Ciudad.ctx(M, R) === 'lluvia'; JE.game.stop();
    JE.fecha = '2026-11-30T10:00'; T.length = 0; JE.game.start('usuario', 1, { seed: 4, nov: NOVEDADES[0], free: true, bici: 'propia' }); out.cumple = T.some(m => /cumple 31 años/.test(m)); JE.game.stop();
    JE.fecha = '2026-11-12T04:10'; JE.game.start('usuario', 1, { seed: 4, nov: NOVEDADES[0], free: true, bici: 'propia' }); M = JE.game.mode;
    const nq = JE.map.metroA.find(s => /niqu/i.test(s.name || '')); if (nq) { M.ride.p.x = nq.px; M.ride.p.y = nq.py; }
    M.tick(1 / 30); out.tren = !!nq && Save.data.flags.primerTren === 1 && Save.data.logros.includes('primertren'); JE.game.stop();
    JE.fecha = '2026-11-12T18:00'; JE.game.start('usuario', 1, { seed: 4, nov: NOVEDADES[0], free: true, bici: 'propia' }); M = JE.game.mode;
    const mu = JE.map.stations.find(s => s.id === 'botero'), otra = JE.map.stations.find(s => s.type === 'a' && !HORARIO_ESP[s.id]);
    out.esp = !!mu && !stOk(mu) && stOk(otra); M.clock = 600; out.esp = out.esp && stOk(mu); JE.game.stop();
    UI.credits(); out.creditos = !!document.querySelector('#mMetro'); UI.closeModal();
    JE.fecha = null; JE.headless = false; UI.toast = _toast; Save.data.diaValle = JSON.parse(keep.dia); Save.data.flags = JSON.parse(keep.flags); Save.data.logros = JSON.parse(keep.logros); Save.data.settings.cine = keep.cine; UI.go('sHome');
    return out;
  });
  ok(gi.n === 16 && gi.map && gi.lista === 16 && gi.lock === 15, 'Un día del valle: 16 capítulos con oficio y turno válidos; solo el primero abierto ' + JSON.stringify({ n: gi.n, lista: gi.lista, lock: gi.lock }));
  ok(gi.brief && gi.meta && gi.paso && gi.fallo && gi.epilogo, 'capítulo: ficha con diálogo y consejo, turno real, al aprobar abre el siguiente, al fallar no, y el epílogo da el logro ' + JSON.stringify(gi));
  ok(gi.tutor && gi.fiesta && gi.habla && gi.lluvia, 'consejo del tutor en la ficha, saludo de la Feria de las Flores y peatones que hablan según el contexto');
  ok(gi.cumple && gi.tren && gi.creditos, 'Metro: cumpleaños el 30 de noviembre, Rosalba en Niquía antes de las 4:30 a. m. con logro secreto y enlace en los créditos');
  ok(gi.esp, 'horario especial: el Museo de Antioquia cierra a las 5:30 p. m.');
  console.log('3j) Mapa reconocible: calles exactas con nombre, barrios, casas en fila; historia y misiones aparte; Ni una gota');
  const mj = await p.evaluate(() => {
    const out = {}, M = JE.map, keepV = JSON.stringify(Save.data.diaValle || []), keepD = JSON.stringify(Save.data.dia || null), keepF = JSON.stringify(Save.data.flags), keepL = JSON.stringify(Save.data.logros), T = [], _toast = UI.toast;
    UI.toast = m => { T.push(m); }; JE.headless = true;
    out.vias = (M.vias || []).length; out.nombres = M.chains.filter(c => c.n && c.k <= 4).length;
    const fl = M.stations.find(s => s.id === 'floresta'); out.barrio = M.barrioAt(fl.x, fl.y); out.zona = M.zonaAt(fl.x, fl.y).sub;
    { const L = M.lotes(Math.floor(fl.x / TS / CH), Math.floor(fl.y / TS / CH)); out.casas = L.casas.length > 20 && L.ed.every(b => b.B && b.z > 0) && L.all.every(q => q.pts && q.pts.length === 8 && Math.abs(Math.hypot(q.ux, q.uy) - 1) < 1e-6); out.nCasas = L.casas.length; out.nEdif = L.ed.length; }   // casas y edificios en lotes girados con su calle
    Save.data.dia = ['dia-01']; delete Save.data.diaValle; out.migra = Dia.count() === 1 && Array.isArray(Save.data.diaValle) && !Array.isArray(Save.data.dia);
    JE.fecha = '2026-11-12T10:00'; JE.game.start('usuario', 1, { seed: 6, nov: NOVEDADES[0], free: true, bici: 'propia' }); const G = JE.game.mode;
    out.juntas = Dia.count() === 1 && !!Save.data.dia && Array.isArray(Save.data.dia.done); UI.historia(); out.hist = document.querySelectorAll('#mBody .dia-c').length === 16; UI.closeModal();
    const ms = G.tinto; out.tinto = !!ms;
    if (ms) { G.onCrash(); out.rego = !ms.ok; const st = M.stations.find(s => stOk(s)); G.ride.p.x = st.x; G.ride.p.y = st.y; G.tick(1 / 30); out.recarga = ms.ok; G.tintoLlega(ms); out.gota = ms.done && Save.data.flags.niUnaGota === 1 && Save.data.logros.includes('nigota'); }
    JE.game.stop(); JE.fecha = null; JE.headless = false; UI.toast = _toast;
    Save.data.diaValle = JSON.parse(keepV); const d = JSON.parse(keepD); if (d) Save.data.dia = d; else delete Save.data.dia; Save.data.flags = JSON.parse(keepF); Save.data.logros = JSON.parse(keepL); UI.go('sHome');
    return out;
  });
  ok(mj.vias > 30000 && mj.nombres > 5000, 'calles exactas de OpenStreetMap: ' + mj.vias + ' vías, ' + mj.nombres + ' tramos con nombre');
  ok(!!mj.barrio && /Laureles-Estadio/.test(mj.zona) && mj.casas, 'barrio en Floresta (' + mj.barrio + ' · ' + mj.zona + ') y casas y edificios en lotes girados con su calle ' + mj.nCasas + '/' + mj.nEdif);
  ok(mj.migra && mj.juntas && mj.hist, 'Un día del valle y las misiones del modo libre guardan aparte: migración y pantalla de Historia sin fallas');
  ok(mj.tinto && mj.rego && mj.recarga && mj.gota, 'Ni una gota: chocar riega el tinto, se recarga en una estación y la entrega da el logro secreto ' + JSON.stringify(mj));
  console.log('3k) v1.7: manejo con peso, velocidad elegible, cámara (pellizco, giro, inclinación, libre), lo que va en alto, Metroplús y paseo guiado');
  const v17 = await p.evaluate(async () => {
    const o = {}; JE.game.stop(); JE.game.start('usuario', 1, { seed: 77, nov: NOVEDADES[0], free: true }); await new Promise(r => setTimeout(r, 900));
    const M = JE.game.mode, R = M.ride, P = R.p, S = R.stats_();
    // manejo: arranque gradual, giro limitado y rodada al soltar (sin muros ni pendiente)
    const bl = R.blocked, mp = R.map, ta = R.tileAt, uc = R.updCars, ul = R.updLife; R.blocked = () => false; R.map = Object.create(JE.map); R.map.slope = () => 0; R.tileAt = () => TT.ROAD; R.updCars = () => {}; R.updLife = () => {};   // sin tráfico ni tranvía: solo la física
    P.v = 0; P.w = 0; P.a = 0; let t = 0, t90 = 0; for (let i = 0; i < 300; i++) { R.update(1 / 60, { x: 1, y: 0, m: 1 }); t += 1 / 60; if (!t90 && P.v > S.max * .9) t90 = t; }
    let tq = 0; for (let i = 0; i < 300 && P.v > 1; i++) { R.update(1 / 60, { x: 0, y: 0, m: 0 }); tq += 1 / 60; }
    R.blocked = bl; R.map = mp; R.tileAt = ta; R.updCars = uc; R.updLife = ul; o.arranque = +t90.toFixed(2); o.parada = +tq.toFixed(2);
    // velocidad elegible: muy rápida es 1,5× y el reloj se ajusta; en carrera, normal
    Save.data.settings.vel = 1.5; o.rapida = +(R.stats_().max / S.max).toFixed(2); o.reloj = +(M.tm() / M.timeMul).toFixed(2); Save.data.settings.vel = 1; o.velBtn = !!document.querySelector('#camBar [data-cam=vel]');
    // cámara: pellizco, giro e inclinación con dos dedos, cámara libre con un dedo
    const cv = document.querySelector('#cv'), rc = cv.getBoundingClientRect(), ev = (ty, id, x, y, pr) => cv.dispatchEvent(new PointerEvent(ty, { pointerId: id, pointerType: 'touch', isPrimary: pr, clientX: rc.left + x, clientY: rc.top + y, bubbles: true, cancelable: true }));
    const C = Cam.cfg(); Object.assign(C, { z: 1, t: 0, r: 0, sigue: 0 });
    ev('pointerdown', 91, 150, 400, true); ev('pointerdown', 92, 240, 400, false); for (let k = 1; k <= 6; k++) { ev('pointermove', 91, 150 - k * 8, 400, true); ev('pointermove', 92, 240 + k * 8, 400, false); } ev('pointerup', 92, 0, 0, false); ev('pointerup', 91, 0, 0, true); o.zoom = +C.z.toFixed(2);
    ev('pointerdown', 93, 150, 400, true); ev('pointerdown', 94, 240, 400, false); for (let k = 1; k <= 6; k++) { const a = k * .09; ev('pointermove', 93, 195 - Math.cos(a) * 45, 400 - Math.sin(a) * 45, true); ev('pointermove', 94, 195 + Math.cos(a) * 45, 400 + Math.sin(a) * 45, false); } ev('pointerup', 94, 0, 0, false); ev('pointerup', 93, 0, 0, true); o.giro = +C.r.toFixed(2);
    C.t = 0; ev('pointerdown', 95, 150, 500, true); ev('pointerdown', 96, 240, 500, false); for (let k = 1; k <= 6; k++) { ev('pointermove', 95, 150, 500 - k * 12, true); ev('pointermove', 96, 240, 500 - k * 12, false); } ev('pointerup', 96, 0, 0, false); ev('pointerup', 95, 0, 0, true); o.incl = +C.t.toFixed(2);
    await new Promise(r => setTimeout(r, 400)); const W = R.w2s(P.x, P.y), Wb = R.s2w(W.x, W.y); o.giroVista = View.giro; o.idaVuelta = Math.round(Math.hypot(Wb.x - P.x, Wb.y - P.y) * 100) / 100;
    Cam.libre(R, true); const cx0 = R.cam.x; ev('pointerdown', 97, 200, 400, true); for (let k = 1; k <= 4; k++) ev('pointermove', 97, 200 - k * 20, 400, true); ev('pointerup', 97, 0, 0, true); o.libre = Math.round(R.cam.x - cx0) > 5 && !Input.joy.on; Cam.libre(R, false);
    Object.assign(C, { z: 1, t: 0, r: 0, sigue: 0 }); await new Promise(r => setTimeout(r, 300));
    // lo que va en alto: viaducto del centro, estaciones elevadas, la B sobre la A en San Antonio, puentes y nivel del jugador
    const A = JE.map.lineA, B = JE.map.lineB, st = (L, n) => L.st.find(x => x.name === n) || {};
    o.viaducto = A.alto.some(a => a.s1 - a.s0 > 7000); o.elevadas = ['Prado', 'Parque Berrío', 'San Antonio', 'Alpujarra'].every(n => st(A, n).alto) && !st(A, 'Poblado').alto; o.bSobreA = st(B, 'San Antonio').z > st(A, 'San Antonio').z;
    o.puentes = JE.map.decks.length; const d = JE.map.decks.find(x => x.agua && x.len > 60 && !x.pe);
    if (d) { const q = JE.map.at(d.P, d.len / 2); P.x = q.x; P.y = q.y; P.a = q.a; P.v = 0; P.deck = null; R.update(1 / 60, { x: 0, y: 0, m: 0 }); o.sobreRio = P.lvl === 1 && P.z > .1; }
    // Metroplús: el trazado va sobre la calzada
    const road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE; o.mp = JE.map.mp.map(L => { let n = 0, k = 0; for (let s2 = 0; s2 < L.len; s2 += 8) { const q = JE.map.at(L, s2); n++; if (road(JE.map.get(Math.floor(q.x / TS), Math.floor(q.y / TS)))) k++; } return Math.round(100 * k / n); });
    // paseo guiado: arranca, pone parada y la bici avanza sola
    const g = geoP(6.2503, -75.5683), nn = JE.map.nearestOpen(Math.floor(g.x / TS), Math.floor(g.y / TS), false); P.x = nn.x * TS + 8; P.y = nn.y * TS + 8; P.deck = null; M.energy = 100;
    JE.game.paused = true; Paseo.iniciar(M); const x0 = P.x, y0 = P.y; for (let i = 0; i < 30 * 40; i++) { M.update(1 / 30); M.energy = 100; } o.paseo = Paseo.on(M) && dist(P.x, P.y, x0, y0) > 100; o.paradas = M.paseo.n; Paseo.parar(M); JE.game.paused = false;
    JE.game.stop(); return o;
  });
  ok(v17.arranque > 1.4 && v17.arranque < 3 && v17.parada > .8 && v17.parada < 2.5, 'manejo con peso: 90 % de la punta en ' + v17.arranque + ' s y se detiene sola en ' + v17.parada + ' s');
  ok(v17.rapida === 1.5 && v17.reloj === 1.33 && v17.velBtn, 'velocidad elegible: «muy rápida» ×' + v17.rapida + ', el reloj se ajusta (' + v17.reloj + ') y el botón 🚲 está en el juego');
  ok(v17.zoom > 1.2 && v17.giro !== 0 && v17.incl > .3 && v17.giroVista && v17.idaVuelta < .05 && v17.libre, 'cámara: pellizco (zoom ' + v17.zoom + '), giro (' + v17.giro + ' rad), inclinación (' + v17.incl + '), giro de la vista ida y vuelta y cámara libre con un dedo');
  ok(v17.viaducto && v17.elevadas && v17.bSobreA && v17.puentes > 1000 && v17.sobreRio, 'en alto: viaducto del centro, estaciones elevadas (no Poblado), la línea B sobre la A en San Antonio, ' + v17.puentes + ' puentes y la bici sobre el puente del río');
  ok(v17.mp.every(x => x >= 96), 'Metroplús sobre la calzada: ' + v17.mp.join(' %, ') + ' %');
  ok(v17.paseo, 'paseo guiado: la bici va sola hacia las paradas (' + v17.paradas + ' en 40 s)');
  console.log('3l) v1.7.1: el sistema metro con los diseños de El Metro y la guía del camino discreta');
  const v171 = await p.evaluate(async () => {
    const o = {}; JE.game.stop(); JE.game.start('usuario', 1, { seed: 77, nov: NOVEDADES[0] }); await new Promise(r => setTimeout(r, 1200));
    const R = JE.game.mode.ride, gfx0 = Save.data.settings.gfx; Save.data.settings.gfx = '3d'; o.sprites = ['metro', 'tram', 'brt', 'cable'].every(k => { const c = SisSpr.img(k, '#1C5C9C', 20, 4, 'front', false); return c && c.width > 20; });
    R.update(1 / 30, { x: 0, y: 0, m: 0 }); o.buses = (R.brts || []).length; Save.data.settings.gfx = gfx0; o.andenes = JE.map.mpRealN | 0; o.corredor = JE.map.mp.filter(L => L.osm).length;
    R.altVagones(); o.vagones = (R._altCars.length + R._lowCars.length) % 3 === 0 || R._altCars.length + R._lowCars.length > 0;
    o.hall = JE.map.lineA.st.filter(st => st.alto).every(st => Array.isArray(JE.map.altHall(JE.map.lineA, st, st.s - 200, st.s + 200)));
    o.giro = typeof R.giro === 'function' && (R.giro() === null || typeof R.giro().m === 'number');
    JE.game.stop(); return o;
  });
  ok(v171.sprites && v171.buses >= 12 && v171.andenes >= 40 && v171.corredor === 2 && v171.vagones && v171.hall && v171.giro, 'El Metro: trenes, tranvía, Metroplús y cabinas con su dibujo, ' + v171.buses + ' buses articulados, ' + v171.andenes + ' andenes reales, corredores de OSM y guía con aviso de giro ' + JSON.stringify(v171));
  console.log('3m) v1.7.2: terreno para lo nuevo · registro de vehículos y de modos, sin cambiar los de siempre');
  const reg = await p.evaluate(async () => {
    const o = {}; JE.game.stop(); JE.game.start('usuario', 1, { seed: 21, nov: NOVEDADES[0], free: true }); await new Promise(r => setTimeout(r, 900));
    const M = JE.game.mode, R = M.ride, P = R.p, f = VEL * velMul(M), c = (v, k) => { P.veh = v; return R.stats_()[k]; };
    // los de siempre conservan sus cifras exactas
    o.cifras = Math.abs(c('bike', 'max') - 60 * WK * f) < 1e-9 && c('bike', 'w1') === 2.7 && Math.abs(c('walk', 'w0') - 7.5) < 1e-9 && Math.abs(c('truck', 'r') - 4.76) < 1e-9 && Math.abs(c('truck', 'max') - 50 * WK * f) < 1e-9;
    P.veh = 'truck'; o.camion = R.solidAt(P.x, P.y) === !TRUCK_OK[R.tileAt()] && vehVia('truck'); P.veh = 'bike';
    // uno nuevo: una patineta eléctrica de prueba, más rápida, sin frenarse en subida y elegible en el modo libre
    const cv = document.createElement('canvas'); cv.width = 8; cv.height = 14; const x = cv.getContext('2d'); x.fillStyle = '#e33'; x.fillRect(2, 0, 4, 14);
    const V = JE.vehiculos.registrar('pruebav', { n: 'Patineta de prueba', corto: 'patineta', icon: '🛹', fis: { max: 90, acc: 60 }, asist: 1, libre: 1, gasto: .05, spr: () => cv });
    o.hereda = V.fis.brk === 72 && V.de === 'bike' && V.timbre === 0 && V.loma.length === 3;
    let er = ''; try { JE.vehiculos.registrar('bike', {}); } catch (e) { er = e.message; } o.protege = /de siempre/.test(er);
    o.boton = typeof vehLista === 'function' ? vehLista().some(v => v.id === 'pruebav') && M.actions().some(a => a.id === 'vehiculo' || a.id === 'taller') : M.actions().some(a => a.id === 'veh'); JE.vehiculos.usar('pruebav', R);   // con el selector de 92-vehiculos.js, sale en su lista
    o.fis = Math.abs(R.stats_().max - 90 * WK * f) < 1e-9 && !M.actions().some(a => a.id === 'bell');
    const lc = R.updCars, ll = R.updLife; R.updCars = () => { }; R.updLife = () => { };   // sin tráfico: que nada choque la medición
    for (let i = 0; i < 40; i++) R.update(1 / 60, { x: Math.cos(P.a), y: Math.sin(P.a), m: 1 }); o.anda = P.v > 0; R.updCars = lc; R.updLife = ll;
    R.getOff(); o.bajar = P.veh === 'walk' && R.parked.veh === 'pruebav'; R.getOn(); o.subir = P.veh === 'pruebav';
    const e0 = JE.errors.length; await new Promise(r => setTimeout(r, 400)); o.dibuja = JE.errors.length === e0;
    R.setVeh('bike'); delete VEHICULOS.pruebav; o.sinBoton = typeof vehLista === 'function' ? !vehLista().some(v => v.id === 'pruebav') : !M.actions().some(a => a.id === 'veh');
    // un juego nuevo en el menú: se juega, gana su estrella y no toca la racha ni las mejoras
    class ModoPrueba extends Mode {
      constructor(role, t, opt) { super(role, t, opt); this.view = { kind: 'px', dw: 200, dh: 150 }; this.goal('Aguanta dos segundos', true, () => this.t >= 2, () => Math.floor(this.t) + ' s'); }
      update(dt) { this.t += dt; this.score = Math.round(this.t * 10); if (this.t >= 2.2) this.end(); }
      render(V) { const b = V.b; b.fillStyle = '#0a2342'; b.fillRect(0, 0, 200, 150); b.fillStyle = '#7ac143'; b.fillRect(20 + (this.t * 60) % 160, 70, 10, 10); }
      hud(V) { this.btns = []; V.text('Prueba ' + this.t.toFixed(1), 12, V.h / 2, { size: 16, color: '#fff' }); }
    }
    JE.game.stop(); const S = Save.data, streak = S.streak, perks = S.perks.slice(), hist = S.history.length;
    JE.modos.registrar({ id: 'pruebam', name: 'Juego de prueba', cls: ModoPrueba, niveles: ['Fácil', 'Turbo'], how: ['Espera dos segundos.'], desc: 'Solo para las pruebas', emoji: '🧪' });
    er = ''; try { JE.modos.registrar({ id: 'usuario', cls: ModoPrueba }); } catch (e) { er = e.message; } o.protegeM = /oficio/.test(er);
    UI.go('sHome'); UI.setTab('ruta'); o.menu = !!document.querySelector('[data-juego="pruebam"][data-lv="2"]');
    UI.brief('pruebam', 2, { nov: NOVEDADES[0] }); o.brief = /NIVEL 2 · TURBO/.test($('#briefBody').textContent) && /Jugar/.test($('#bGo').textContent);
    $('#bGo').click(); await new Promise(r => setTimeout(r, 500)); o.titulo = $('#hudTtl').textContent;
    await new Promise(r => setTimeout(r, 2600)); o.fin = !JE.game.mode; o.estrella = ((S.stars.pruebam || [])[1] | 0) === 1; o.racha = S.streak === streak && S.perks.join() === perks.join();
    JE.modos.quitar('pruebam'); delete S.stars.pruebam; S.history = S.history.filter(h => h.m !== 'pruebam'); o.limpio = !ROLE.pruebam && S.history.length === hist; UI.go('sHome'); return o;
  });
  ok(reg.cifras && reg.camion && reg.hereda && reg.protege && reg.boton && reg.fis && reg.anda && reg.bajar && reg.subir && reg.dibuja && reg.sinBoton, 'vehículos: los de siempre con sus cifras; uno nuevo hereda, anda, se dibuja, se elige y se parquea ' + JSON.stringify(reg).slice(0, 220));
  ok(reg.protegeM && reg.menu && reg.brief && reg.titulo === 'Juego de prueba · Turbo' && reg.fin && reg.estrella && reg.racha && reg.limpio, 'modos: un juego nuevo sale en el menú, se juega, gana su estrella y no toca la racha ni las mejoras · ' + reg.titulo);
  const tra = await p.evaluate(() => {
    const o = {}, S = Save.data, t0 = S.tramaHechas, h0 = S.huevos; S.tramaHechas = []; S.huevos = [];
    const mar = new Date(2026, 10, 17, 8, 0), sab = new Date(2026, 10, 21, 10, 0), noche = new Date(2026, 10, 17, 22, 0);   // el lunes 16 es festivo (Independencia de Cartagena)
    const ms = genMisiones(mar).find(m => m.id === 'g_rosalba-1'); o.sale = !!ms && ms.kind === 'visita' && ms.place[0] === 'botero'; o.hora = !genMisiones(noche).some(m => m.id.startsWith('g_')); o.req = !genMisiones(sab).some(m => m.id === 'g_efrain-1');
    JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0], free: true }); const M = JE.game.mode; M.addMision(ms); o.marca = ms.marks.length === 1;
    M.cumplir(ms); o.guarda = S.tramaHechas.includes('rosalba-1') && S.huevos.includes('metro-rosalba'); o.sigue = genMisiones(sab).some(m => m.id === 'g_efrain-1') && !genMisiones(mar).some(m => m.id === 'g_rosalba-1');
    const tr0 = S.trama; S.trama = ['viejo-1']; S.tramaHechas = []; tramaHechas(); o.migra = S.tramaHechas.includes('viejo-1') && S.trama === null;   // una partida de la v1.7.2
    if (typeof Trama !== 'undefined') { S.trama = ['viejo-2']; const E = Trama.estado(); o.migra = o.migra && !Array.isArray(E) && Array.isArray(E.done) && S.tramaHechas.includes('viejo-2'); }
    S.trama = tr0; JE.game.stop(); S.tramaHechas = t0 || []; S.huevos = h0 || []; return o;
  });
  ok(tra.sale && tra.hora && tra.req && tra.marca && tra.guarda && tra.sigue && tra.migra, 'trama en datos (contenido/guion/misiones.json): sale según el día y la hora, en su lugar, guarda el fragmento, abre la siguiente y pasa las partidas de la v1.7.2 ' + JSON.stringify(tra));
  console.log('3n) v2.0: las dos entregas juntas · dos carreras sin fin, un Taller, 7 vehículos, el boleto de Rosalba y la flecha dibujada');
  const v2 = await p.evaluate(async () => {
    const o = {}, w = ms => new Promise(r => setTimeout(r, ms)), F = Save.data.flags || (Save.data.flags = {}), b0 = F.fragmentosCiclovia, e0 = JE.errors.length;
    JE.game.stop(); UI.go('sHome'); UI.setTab('ruta'); o.menu = ['run3d', 'ciclovia'].every(id => document.querySelectorAll('[data-juego="' + id + '"]').length === 3);
    for (const id of ['run3d', 'ciclovia']) { JE.game.start(id, 1, { seed: 3, nov: NOVEDADES[0] }); await w(300); const G = JE.game.mode; for (let i = 0; i < 15; i++) { if (G.sub.bot) G.sub.bot(.1); await w(80); } o[id] = G.goals.length >= 2 && G.t > .5; G.end(); await w(400); o[id] = o[id] && !JE.game.mode; }
    UI.go('sHome'); JE.game.start('usuario', 1, { seed: 8, nov: NOVEDADES[0], free: true }); await w(600); const M = JE.game.mode, R = M.ride, P = R.p, f = VEL * velMul(M); F.fragmentosCiclovia = 0;
    const ids = M.actions().map(a => a.id); o.taller = ids.includes('taller') && !ids.includes('vehiculo') && !ids.includes('runner3d');
    o.vel = /^×1$/.test(document.querySelector('#camBar [data-cam=vel]').textContent);
    let ok7 = true; for (const v of VEH_CATALOGO) { M.cambiarVehiculo(v.id); for (let i = 0; i < 8; i++) R.update(1 / 60, { x: Math.cos(P.a), y: Math.sin(P.a), m: 1 }); const want = (VSTATS[v.id] || VSTATS.bike).max * WK * f; if (Math.abs(R.stats_().max - want) > 1e-9) ok7 = false; } o.vehiculos = ok7;
    M.cambiarVehiculo('bike'); F.fragmentosCiclovia = 0; JE.taller.abrir(M); await w(120); o.modal = !!document.querySelector('#tlEsc') && document.querySelectorAll('[data-tc]').length >= 6;
    document.querySelector('[data-tv=ebike]').click(); await w(80); o.boleto1 = F.fragmentosCiclovia === 1;
    Boleto.evento(M, 'carrera', 5); o.boleto2 = F.fragmentosCiclovia === 2 && !!M.marcaBoleto; UI.closeModal(); Game.paused = false;
    M.cambiarVehiculo('scooter'); P.x = M.marcaBoleto.x; P.y = M.marcaBoleto.y; for (let i = 0; i < 8; i++) R.update(1 / 30, { x: 0, y: 0, m: 0 }); o.boleto3 = F.fragmentosCiclovia === 3 && !!F.boletoRosalba;
    const c = View.ctx; for (const k of [-1, 1, 'llega']) R.chipGiro(c, 200, 400, k, '70 m'); o.flecha = true;
    JE.game.stop(); F.fragmentosCiclovia = b0 || 0; delete F.boletoRosalba; o.sinErrores = JE.errors.length === e0; return o;
  });
  const niv = (() => { try { return require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'prueba-niveles.mjs')], { encoding: 'utf8' }).trim(); } catch (e) { return 'FALLA ' + e.message; } })();
  ok(v2.menu && v2.run3d && v2.ciclovia, 'las dos carreras sin fin (Run EnCicla 3D y Carrera de la ciclorruta) salen en el menú con 3 niveles, se juegan y terminan');
  ok(v2.taller && v2.modal && v2.vehiculos && v2.vel, 'modo libre: un solo Taller con el arte de TallerValle, los 7 vehículos con sus cifras y la velocidad con su valor (×1)');
  ok(v2.boleto1 && v2.boleto2 && v2.boleto3 && v2.flecha && v2.sinErrores, 'el boleto de Rosalba completo (eléctrica, carrera y scooter en Parque Berrío) y la flecha del giro dibujada ' + JSON.stringify(v2).slice(0, 160));
  ok(/^OK/.test(niv), 'propuesta de niveles del motor (red-niveles.mjs): ' + niv.slice(0, 90));
  const mv12 = await p.evaluate(() => ({ v: typeof Valle !== 'undefined' && Valle.version, alias: typeof MotorValle !== 'undefined' && MotorValle === Valle && JE.valle === Valle, em: typeof Valle.elmetro === 'object' && Valle.elmetro.map === null, suelo: (() => { const q = Valle.decodificar(); return !!q && typeof q.suelo(10, 10) === 'number'; })() }));
  ok(mv12.v === '1.2.0' && mv12.alias && mv12.em && mv12.suelo, 'Motor del Valle 1.2.0 en el juego: Valle (lector de EnCicla) y MotorValle (nombre de El Metro) ' + JSON.stringify(mv12));
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

  console.log('5) Multijugador: sala WebRTC con 3 dispositivos (anfitrión + 2 invitados, reenvío en estrella)');
  const b2 = await chromium.launch({ args: ['--disable-features=WebRtcHideLocalIpsWithMdns'] }), c2 = await b2.newContext({ viewport: { width: 390, height: 900 } });
  const host = await c2.newPage(), g1 = await c2.newPage(), g2 = await c2.newPage(), nerr = [];
  for (const pg of [host, g1, g2]) { pg.on('pageerror', e => nerr.push(e.message)); await pg.goto('file://' + FILE); await pg.waitForFunction(() => window.JE && JE.ready); }
  for (const [pg, n] of [[host, 'Anfitriona'], [g1, 'Invitado1'], [g2, 'Invitado2']]) await pg.evaluate(n => { Save.data.profile.name = n; UI.multi(); }, n);
  await host.click('#nHost');
  for (const [k, g] of [[1, g1], [2, g2]]) {
    await host.click('#nInvite'); await host.waitForSelector('#nCode', { timeout: 15000 }); const offer = await host.inputValue('#nCode');
    if (k === 1) ok(/^JE[01]o/.test(offer) && await host.isVisible('#nQR canvas'), 'invitación con código y QR (' + offer.length + ' caracteres)');
    await g.click('#nJoin'); await g.fill('#nOff', offer); await g.click('#nAnsB'); await g.waitForSelector('#nCode', { timeout: 15000 }); const ans = await g.inputValue('#nCode');
    await host.fill('#nAns', ans); await host.click('#nGo');
    await host.waitForFunction(k => Object.keys(UI.netPlayers).length >= k, k, { timeout: 20000 }).catch(() => { });
  }
  ok(await host.evaluate(() => Object.keys(UI.netPlayers).length === 2), 'la sala tiene 3 jugadores');
  await host.click('#nStart');
  const started = await Promise.all([host, g1, g2].map(pg => pg.waitForFunction(() => JE.game.mode && JE.game.mode.id === 'carrera' && JE.game.mode.net, null, { timeout: 20000 }).then(() => true).catch(() => false)));
  ok(started.every(Boolean), 'carrera en red iniciada en los 3 dispositivos');
  if (started.every(Boolean)) {
    await host.waitForTimeout(3600); await g1.evaluate(() => { JE.game.mode.ride.p.x += 40; }); await host.evaluate(() => { JE.game.mode.ride.p.y += 30; }); await g2.waitForTimeout(900);
    const s2 = await g2.evaluate(() => ({ seed: JE.game.meta.seed, opps: JE.game.mode.opps.map(o => ({ name: o.name, x: Math.round(o.x), y: Math.round(o.y) })) }));
    const h = await host.evaluate(() => ({ seed: JE.game.meta.seed, x: Math.round(JE.game.mode.ride.p.x), y: Math.round(JE.game.mode.ride.p.y) })), a1 = await g1.evaluate(() => ({ x: Math.round(JE.game.mode.ride.p.x), y: Math.round(JE.game.mode.ride.p.y) }));
    const oh = s2.opps.find(o => o.name === 'Anfitriona'), o1 = s2.opps.find(o => o.name === 'Invitado1');
    ok(s2.seed === h.seed && oh && o1 && Math.abs(oh.y - h.y) < 25 && Math.abs(o1.x - a1.x) < 25, 'el invitado 2 ve al anfitrión y al invitado 1 en tiempo real (reenvío)');
    if (SHOTS) await g2.screenshot({ path: path.join(OUT, 'carrera-red.png') });
  }
  // turno en equipo: el anfitrión dirige (Monitoreo) y los invitados manejan camiones (Balance)
  await host.evaluate(() => UI.netStartCoop());
  const coop = await Promise.all([host, g1, g2].map((pg, i) => pg.waitForFunction(i => { const M = JE.game.mode; return M && M.id === 'equipo' && (i ? !!M.orders && Net.myId === i : !!M.trucks && M.trucks.filter(t => t.human).length === 2); }, i, { timeout: 20000 }).then(() => true).catch(() => false)));
  ok(coop.every(Boolean), 'turno en equipo iniciado: 1 en Monitoreo y 2 conductores');
  if (coop.every(Boolean)) {
    await host.evaluate(() => { const M = JE.game.mode, t = M.trucks.find(t => t.pid === 1), s = M.zs.filter(s => Math.hypot(s.x - M.road.x, s.y - M.road.y) > 160 && s.cap - s.bikes >= 3).sort((a, b) => a.bikes / a.cap - b.bikes / b.cap)[0]; M.addJob(t, { type: 'llevar', s, n: 3 }); M.flags.set(s, 'llevar'); });
    const got = await g1.waitForFunction(() => JE.game.mode.orders.length === 1, null, { timeout: 8000 }).then(() => true).catch(() => false);
    ok(got && await g2.evaluate(() => JE.game.mode.orders.length === 0), 'la orden de Monitoreo llega solo al conductor elegido');
    await g1.evaluate(() => { const M = JE.game.mode, o = M.orders[0]; M.ride.p.x = o.s.x; M.ride.p.y = o.s.y + 12; M.ride.p.v = 0; });
    const done = await g1.waitForFunction(() => JE.game.mode.doneN === 1 && JE.game.mode.ride.p.load === 9, null, { timeout: 8000 }).then(() => true).catch(() => false);
    const hs = await host.evaluate(() => { const M = JE.game.mode, t = M.trucks.find(t => t.pid === 1); return { d: M.teamDone, load: t.load, q: t.q.length, bikes: M.sim.count() === M.sim.total }; });
    ok(done && hs.d === 1 && hs.load === 9 && hs.q === 0 && hs.bikes, 'orden cumplida: el camión entrega 3 bicis y el anfitrión las cuenta ' + JSON.stringify(hs));
    await g1.evaluate(() => { const M = JE.game.mode; M.ride.p.x = M.depM.x + 30; M.ride.p.y = M.depM.y; }); await g1.waitForTimeout(250);
    await g1.evaluate(() => { const M = JE.game.mode; M.ride.p.x = M.depM.x; M.ride.p.y = M.depM.y; });
    const ld = await g1.waitForFunction(() => JE.game.mode.ride.p.load === 12, null, { timeout: 8000 }).then(() => true).catch(() => false);
    ok(ld && await host.evaluate(() => JE.game.mode.sim.count() === JE.game.mode.sim.total), 'recarga en la base sin perder bicis');
    const sn = await g2.waitForFunction(() => JE.game.mode.teamDone === 1 && JE.game.mode.clock > 331, null, { timeout: 8000 }).then(() => true).catch(() => false);
    ok(sn, 'el otro conductor recibe el estado del equipo');
    if (SHOTS) { await host.screenshot({ path: path.join(OUT, 'equipo-monitoreo.png') }); await g1.screenshot({ path: path.join(OUT, 'equipo-camion.png') }); }
    await host.evaluate(() => { JE.game.mode.clock = 1319.5; });
    const fin = await Promise.all([host, g1, g2].map(pg => pg.waitForSelector('#sResult', { state: 'visible', timeout: 15000 }).then(() => true).catch(() => false)));
    ok(fin.every(Boolean), 'el turno en equipo termina en los 3 dispositivos');
  }
  // mundo libre en red: «La lleva» (el anfitrión la lleva y toca al invitado 1)
  await host.evaluate(() => { UI.compCfg = { k: 'lleva', n: 3, min: 2, zona: 'centro' }; UI.netStartLibre(); });
  const lib = await Promise.all([host, g1, g2].map(pg => pg.waitForFunction(() => JE.game.mode && JE.game.mode.id === 'libre' && JE.game.mode.comp.k === 'lleva', null, { timeout: 15000 }).then(() => true).catch(() => false)));
  ok(lib.every(Boolean), 'mundo libre en red: «La lleva» iniciada en los 3 dispositivos');
  if (lib.every(Boolean)) {
    await host.waitForTimeout(3800); const p1 = await g1.evaluate(() => ({ x: JE.game.mode.ride.p.x, y: JE.game.mode.ride.p.y }));
    await host.evaluate(p => { const R = JE.game.mode.ride; R.p.x = p.x; R.p.y = p.y; }, p1);
    const tagged = await g2.waitForFunction(() => JE.game.mode.itId === 1, null, { timeout: 8000 }).then(() => true).catch(() => false);
    ok(tagged, 'la lleva: el toque pasa al invitado 1 y los 3 lo ven');
  }
  ok(!nerr.length, 'multijugador sin errores ' + nerr.slice(0, 2).join(' | '));
  await b2.close();
  console.log(fails ? '\n✗ ' + fails + ' prueba(s) fallaron' : '\n✓ TODAS LAS PRUEBAS PASARON'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
