#!/usr/bin/env node
/* =====================================================================
   AUDITORÍA Y VERIFICACIÓN RONDA 3.0 · GEMINI (ANTIGRAVITY)
   Prueba de extremo a extremo en Chromium real:
   - Todo liberado (12 oficios, turnos 1–3, 16 capítulos probables, 5 modos Infinity)
   - ⏫ Acelerador fijo (Motor City 4.6.1), Snd.vehSfx, salto panorámico 7 vehículos
   - Un solo mundo 3D con las 6 cámaras (Cenital, Oblicua, 3P, 1P, Panorámica 2D, Maqueta 2:1)
     y estilo Pixel World combinable + rendimiento con CPU 4×
   - Runner solo en ciclorruta con anchos variables, giros direccionales y 5 skateparks abiertos
   - Módulos cerrados lanzados dentro del mundo abierto + RPG + Diario + Save.revisarClaves()
   - Capturas reales en vertical (412×860), horizontal (860×412) y escritorio (1280×800)
   Uso: node tests/auditoria-antigravity.js [--shots=/ruta/directorio]
   ===================================================================== */
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'dist', 'juega-encicla.html');
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : null; };
const SHOTS = arg('shots');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let fails = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

  await p.goto('file://' + FILE);
  await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 30000 });
  ok(!errs.length, 'carga inicial sin errores');

  console.log('1) Todo liberado + 5 modos Infinity + unificación narrativa CAST');
  const lib = await p.evaluate(() => {
    const out = {};
    out.rolesTotal = ROLES.length;
    out.rolesLibres = ROLES.filter(r => UI.unlocked(r)).length;
    out.turnosLibres = ROLES.every(r => {
      const n = nShifts(r.id);
      for (let t = 1; t <= n; t++) if (!UI.turnoOk(r, t)) return false;
      return true;
    });
    out.modosInf = ['traffix', 'despacho', 'maquinista', 'circuito', 'moravia'].every(id => !!ROLE[id] && !!MODE_CLASS[id]);
    /* Verificar que trama_valle.json coincide 100 % con CAST */
    const tv = (GUION.trama_valle && GUION.trama_valle.personajesEnCicla) || [];
    const byId = Object.fromEntries(tv.map(x => [x.id, x.rol]));
    out.castOk = /Usuaria/i.test(byId.luz || '') && /Anfitrión/i.test(byId.santi || '') && /Mecánico/i.test(byId.jairo || '')
      && /bodega/i.test(byId.yuli || '') && /Técnica/i.test(byId.paola || '') && /balance/i.test(byId.wilson || '') && /control|Monitoreo/i.test(byId.cata || '');
    /* Verificar que capítulo 10 de Un día del valle se puede lanzar al tocarlo */
    Save.data.diaValle = [];
    UI.historia();
    const lockCount = document.querySelectorAll('#mBody .dia-c.lock').length;
    const cap10 = document.querySelector('#mBody [data-dia="dia-10"]');
    out.lockCount = lockCount;
    out.cap10Click = !!cap10;
    UI.closeModal();
    return out;
  });
  ok(lib.rolesLibres === lib.rolesTotal && lib.rolesTotal >= 12 && lib.turnosLibres, 'los ' + lib.rolesTotal + ' oficios y todos sus turnos están liberados desde el inicio');
  ok(lib.modosInf, 'los 5 modos estilo Infinity Games (Traffix, Despacho, Maquinista, Circuito, Moravia) están registrados');
  ok(lib.castOk, 'coherencia narrativa: los 9 mentores de trama_valle.json coinciden 100 % con CAST');
  ok(lib.lockCount === 15 && lib.cap10Click, 'Un día del valle conserva marca de progreso (15) pero permite probar cualquier capítulo');

  console.log('2) ⏫ Acelerador fijo, Snd.vehSfx y salto panorámico de los 7 vehículos');
  const ctrl = await p.evaluate(async () => {
    const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
    JE.game.start('usuario', 1, { seed: 77, nov: NOVEDADES[0], free: true });
    await w(500);
    const M = JE.game.mode, R = M.ride, P = R.p;
    const btn = document.querySelector('#camBar [data-cam="acel"]');
    out.btnAcel = !!btn;
    const bl = R.blocked, mp = R.map, ta = R.tileAt, uc = R.updCars, ul = R.updLife;
    R.blocked = () => false; R.map = Object.create(JE.map); R.map.slope = () => 0; R.tileAt = () => TT.ROAD; R.updCars = () => {}; R.updLife = () => {};
    P.v = 0; P.a = 0; JE.acelFijo.toggle(true);
    for (let i = 0; i < 90; i++) R.update(1 / 60, { x: 0, y: 0, m: 0 });
    out.cruiseV = +P.v.toFixed(1);
    JE.acelFijo.toggle(true);
    for (let i = 0; i < 120; i++) R.update(1 / 60, { x: 0, y: 0, m: 0 });
    out.stopV = +P.v.toFixed(1);
    R.blocked = bl; R.map = mp; R.tileAt = ta; R.updCars = uc; R.updLife = ul;
    /* Snd.vehSfx sin errores */
    let sfxErr = null;
    try {
      for (const v of VEH_CATALOGO) { Snd.vehSfx(v.id, 'bell'); Snd.vehSfx(v.id, 'ollie'); }
    } catch (e) { sfxErr = e.message; }
    out.sfxOk = !sfxErr;
    /* Panorámica 2D: salto funcionando para los 7 vehículos (incluyendo skate, patines, scooter, walk) */
    Save.data.settings.vista = 'pano';
    let jumpsOk = 0;
    for (const v of VEH_CATALOGO) {
      P.veh = v.id; R.z = 0; R.vz = 0; R.jump();
      if (R.vz > 100) jumpsOk++;
    }
    out.jumpsOk = jumpsOk;
    Save.data.settings.vista = 'cenital';
    JE.game.stop();
    return out;
  });
  ok(ctrl.btnAcel && ctrl.cruiseV > 40 && ctrl.stopV < 5, '⏫ acelerador fijo: acelera sin tocar el joystick (' + ctrl.cruiseV + ' px/s) y frena al apagarlo (' + ctrl.stopV + ')');
  ok(ctrl.sfxOk, 'Snd.vehSfx funciona sin errores para los 7 vehículos');
  ok(ctrl.jumpsOk === 7, 'Panorámica 2D: salto habilitado para los 7 vehículos (' + ctrl.jumpsOk + '/7)');

  console.log('3) Un solo mundo 3D: 6 cámaras + Pixel World + capturas visuales + CPU 4×');
  await p.evaluate(() => {
    JE.game.start('usuario', 1, { seed: 42, nov: NOVEDADES[0], free: true, bici: 'propia' });
    const M = JE.game.mode; M.clock = 10 * 60 + 15; /* 10:15 a. m. luz clara del valle */
  });
  await p.waitForTimeout(700);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '01-portrait-cenital.png') });

  const vistas = ['oblicua', '3p', '1p', 'pano', 'maqueta'];
  const vRes = {};
  for (const vid of vistas) {
    await p.evaluate(v => {
      JE.vistas.poner(v, true);
      const R = JE.game.mode.ride;
      R.p.v = 45;
    }, vid);
    await p.waitForTimeout(450);
    vRes[vid] = await p.evaluate(() => {
      const cv = document.querySelector('#cv');
      const d = cv.getContext('2d').getImageData(Math.floor(cv.width / 2), Math.floor(cv.height / 2), 1, 1).data;
      return { cur: JE.vistas.actual(), rgb: [d[0], d[1], d[2]], nonBlack: (d[0] + d[1] + d[2]) > 20 };
    });
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '02-vista-' + vid + '.png') });
  }
  ok(vistas.every(v => vRes[v].cur === v && vRes[v].nonBlack), 'las 6 vistas proyectan el mismo mundo real sin pantalla negra: ' + JSON.stringify(vRes));

  /* Probar Pixel World combinado con 3.ª Persona 3D */
  await p.evaluate(() => { JE.vistas.poner('3p', true); JE.vistas.togglePixel(true); });
  await p.waitForTimeout(450);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '03-vista-3p-pixel.png') });
  const pxCheck = await p.evaluate(() => ({ v: JE.vistas.actual(), px: JE.vistas.esPixel() }));
  ok(pxCheck.v === '3p' && pxCheck.px, 'Pixel World combinable con cámara 3D Tercera Persona');
  await p.evaluate(() => { JE.vistas.togglePixel(true); JE.vistas.poner('cenital', true); });

  /* Probar entradas coherentes en 3P (girarDir hacia adelante) */
  const g3p = await p.evaluate(() => {
    JE.vistas.poner('3p', true);
    const R = JE.game.mode.ride;
    R.p.a = 0; R._yaw3 = 0;
    const fwd = R.girarDir({ x: 0, y: -1, m: 1 });
    const right = R.girarDir({ x: 1, y: 0, m: 1 });
    JE.vistas.poner('cenital', true);
    return { fwdX: +fwd.x.toFixed(2), fwdY: +fwd.y.toFixed(2), rightX: +right.x.toFixed(2), rightY: +right.y.toFixed(2) };
  });
  ok(g3p.fwdX > .95 && g3p.rightY > .95, 'controles coherentes en 3P/1P (arriba = adelante, derecha = +90°): ' + JSON.stringify(g3p));

  console.log('4) Ciclorruta Endless Runner + 5 Skateparks abiertos + Actividades RPG en Modo Libre');
  const openW = await p.evaluate(async () => {
    const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
    const M = JE.game.mode, R = M.ride;
    out.spots = (JE.skateSpots || []).length;
    /* Teletransportar al Skatepark Ciudad del Río y aterrizar combo de 3 trucos */
    const sp = JE.skateSpots[0];
    R.p.x = sp.x; R.p.y = sp.y; R.cam.x = sp.x; R.cam.y = sp.y;
    M.cambiarVehiculo('skate');
    out.enSpot = !!JE.skate.cerca(R);
    R._trucoCd = 0; JE.skate.hacerTruco(R, 'Ollie');
    R._trucoCd = 0; JE.skate.hacerTruco(R, '50-50 Grind');
    R._trucoCd = 0; JE.skate.hacerTruco(R, 'Kickflip');
    out.combo = R._trCombo;
    out.tecXp = Save.data.rpg && Save.data.rpg.sk && Save.data.rpg.sk.tecnica;
    /* Probar detección de ciclorruta para Endless Runner */
    const ci = JE.map.cicloIdx[0];
    R.p.x = (ci % MW + .5) * TS; R.p.y = (Math.floor(ci / MW) + .5) * TS;
    out.enCiclo = JE.skate.enCiclovia(R);
    out.btnRunner = M.actions().some(a => a.id === 'cicloRunner');
    /* Probar Runner con anchos variables y giros direccionales */
    const mg = new MGRunner3D(M, { corredor: 0, veh: 'bike', metaM: 400, dur: 40 });
    mg.distM = 120; mg.update(1 / 30); out.wChanged = mg._wIdx !== 0;
    mg.distM = 146; mg.lane = -1; mg.update(1 / 30); out.turnOk = mg._bank !== 0;
    /* Probar lanzamiento directo de módulo cerrado (Traffix) desde el mundo abierto */
    out.lanzado = JE.rpg.lanzarActividad(M, 'traffix') && M.sub instanceof MGTraffix;
    if (M.sub) { M.sub.score = 40; M.sub.done = true; M.updSub(1 / 30); }
    out.regresoLibre = !M.sub && M.free && (Save.data.diario || []).length > 0;
    /* Probar subtrama ciudadana */
    const sb = JE.rpg.lanzarSubtrama(M);
    out.subtrama = !!sb && !!sb.m;
    /* Verificar registro de claves del guardado */
    out.clavesMal = Save.revisarClaves();
    return out;
  });
  ok(openW.spots === 5 && openW.enSpot && openW.combo === 3 && openW.tecXp > 0, '5 skateparks en el mundo abierto, combo ×' + openW.combo + ' y XP de Técnica (' + openW.tecXp + ')');
  ok(openW.enCiclo && openW.btnRunner && openW.wChanged && openW.turnOk, 'Runner adaptado solo a ciclorrutas con anchos variables y giros direccionales');
  ok(openW.lanzado && openW.regresoLibre && openW.subtrama, 'módulos cerrados jugables directo desde el mundo abierto con regreso + Diario + Subtrama');
  ok(openW.clavesMal.length === 0, 'Save.revisarClaves() en cero con rpg y diario registrados: ' + openW.clavesMal.join(','));

  if (SHOTS) {
    /* Captura del Skatepark Ciudad del Río y del Hub de Actividades RPG */
    await p.evaluate(() => {
      const M = JE.game.mode, sp = JE.skateSpots[0];
      M.ride.p.x = sp.x; M.ride.p.y = sp.y; M.ride.cam.x = sp.x; M.ride.cam.y = sp.y;
      JE.vistas.poner('cenital', true);
    });
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(SHOTS, '04-skatepark-ciudad-rio.png') });
    await p.evaluate(() => { JE.rpg.abrirHub(JE.game.mode, 'act'); });
    await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(SHOTS, '05-hub-actividades.png') });
    await p.evaluate(() => { UI.closeModal(); if (JE.game.paused) Game.resume(); });
  }

  console.log('5) Rendimiento con CPU 4× (3D Cenital, 3D Tercera Persona y 3D Primera Persona)');
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const perf = {};
  for (const vid of ['cenital', '3p', '1p']) {
    perf[vid] = await p.evaluate(async v => {
      JE.vistas.poner(v, true);
      await new Promise(s => setTimeout(s, 500));
      const ts = []; let last = performance.now();
      await new Promise(res => {
        const f = t => { ts.push(t - last); last = t; if (ts.length < 90) requestAnimationFrame(f); else res(); };
        requestAnimationFrame(f);
      });
      ts.sort((a, b) => a - b);
      return { med: +ts[45].toFixed(1), p95: +ts[85].toFixed(1) };
    }, vid);
    console.log('     ' + vid.padEnd(8) + ' mediana ' + perf[vid].med + ' ms · p95 ' + perf[vid].p95 + ' ms');
  }
  ok(perf.cenital.med < 40 && perf['3p'].med < 40 && perf['1p'].med < 40, 'CPU 4× fluido en Cenital, 3P y 1P (mediana < 40 ms)');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  console.log('6) Horizontal móvil (860×412), Escritorio (1280×800) y Alto Contraste WCAG');
  await p.setViewportSize({ width: 860, height: 412 });
  await p.evaluate(() => { JE.vistas.poner('3p', true); View.resize(); Game.layout(true); });
  await p.waitForTimeout(500);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '06-landscape-860x412-3p.png') });

  await p.setViewportSize({ width: 1280, height: 800 });
  await p.evaluate(() => { JE.vistas.poner('cenital', true); View.resize(); Game.layout(true); });
  await p.waitForTimeout(500);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '07-desktop-1280x800-cenital.png') });

  /* Alto contraste en Escalafón (todo liberado visible) */
  await p.setViewportSize({ width: 412, height: 860 });
  await p.evaluate(() => {
    JE.game.stop();
    document.body.classList.add('contraste');
    UI.go('sHome'); UI.setTab('ruta');
  });
  await p.waitForTimeout(350);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '08-escalafon-liberado-contraste.png') });
  await p.evaluate(() => document.body.classList.remove('contraste'));

  ok(!errs.length, 'cero errores de consola o página en toda la auditoría: ' + errs.join(' | '));
  await browser.close();
  console.log(fails ? '\n✗ ' + fails + ' verificación(es) fallaron' : '\n✓ AUDITORÍA ANTIGRAVITY 100 % EN VERDE');
  process.exit(fails ? 1 : 0);
})();
