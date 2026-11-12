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
    return { n: M.stations.length, lm: LANDMARKS.length, s: M.stations.filter(s => !reach(s.x, s.y, D, 1)).map(s => s.name), t: M.stations.filter(s => !reach(s.x, s.y, Dt, 5)).map(s => s.name), l: LANDMARKS.filter(l => l.id !== 'depot').filter(l => !reach((l.x + l.w / 2) * TS, (l.y + l.h) * TS + 6, D, Math.ceil((Math.max(l.w, l.h) * TS / 2 + 8) / TS))).map(l => l.id), muni: [...new Set(M.stations.map(s => s.muni))].length, dropped: M.dropped || [], az: APOYO_ZONAS.map(z => z[2] - M.stations.filter(s => s.az === z[0]).length).join(''), ms: JE.mapMs }; });
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
  await p.click('#bPlay'); ok(await p.isVisible('#modal'), 'introducción ¿Qué es EnCicla?');
  for (let k = 0; k < 4 && await p.isVisible('#inNext'); k++) await p.click('#inNext');
  ok(await p.isVisible('#avOk') && await p.isVisible('#avPrev'), 'al empezar se crea el personaje');
  await p.click('.avtabs button[data-tab=ropa]'); await p.click('#mBody [data-k=pants][data-i="2"]'); await p.click('#avOk');
  ok(await p.evaluate(() => Save.data.profile.pants === 2 && Save.data.settings.seen.profile === 1), 'personaje guardado');
  ok(await p.isVisible('#sHome') && !(await p.isVisible('#modal')), 'portada → introducción → personaje → escalafón');
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
    const sv = [Cal.service(new Date('2026-11-12T10:00')).open, Cal.service(new Date('2026-11-15T10:00')).open, Cal.service(new Date('2026-12-08T10:00')).close];
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
  ok(cal.sv.join() === '330,480,960', 'horario de EnCicla según el día');
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
    const st = id => JE.map.stations.find(s => s.id === id); out.e = ['floresta', 'c4ta', 'udea', 'hinfantil', 'sancayetano', 'estrella'].map(id => (st(id) || {}).e || 'x').join();
    JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0] }); const M = JE.game.mode; M.clock = 19 * 60 + 30; M.takeBike(st('c4ta')); out.eLate = M.ride.ebike; M.clock = 10 * 60; M.takeBike(st('c4ta')); out.eDay = M.ride.ebike; JE.game.stop();
    UI._tuto = true; JE.game.start('pausas', 1, { seed: 5, nov: NOVEDADES[0] }); UI._tuto = false; for (let i = 0; i < 40; i++) Game.dom(1 / 30); out.tut = Tutor.on && Tutor.showing && /Maryi/.test(document.querySelector('#tutor').textContent); document.querySelector('#tutOk').click(); JE.game.stop();
    JE.headless = true; const P = new MGPausa({ rng: new RNG(2), has: () => false }, { lvl: 1 }); P.bot(0); let k = 0; while (!P.done && k < 30 * 90) { P.update(1 / 30); k++; } out.pausa = P.acc; JE.headless = false;
    out.err = JE.errors.slice(e0); UI.go('sHome'); return out;
  });
  ok(g3.hibridocenital.q > 1 && g3['2dcenital'].q > 1 && g3.pixelpano.pano && !g3.err.length, 'gráficos híbrido y 2D con mapa dibujado, y vista panorámica sin errores ' + g3.err.join(' | '));
  ok(g3.music.join() === 'lofi,rock,jazz', 'música automática: lo-fi en menús, soft rock en turnos y jazz de noche (' + g3.music.join() + ')');
  ok(g3.e === 'mix,solo,mix,solo,mix,solo' && !g3.eLate && g3.eDay, 'corredores eléctricos: 3 pares mixta y solo eléctricas; servicio eléctrico hasta las 7 p. m.');
  ok(g3.tut, 'tutorial opcional con compañero (Maryi en Pausas Activas)');
  ok(g3.pausa >= 80, 'pausa activa: el bot sigue la coreografía (' + g3.pausa + ' %)');
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
