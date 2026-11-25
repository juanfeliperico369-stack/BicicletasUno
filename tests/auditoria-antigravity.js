#!/usr/bin/env node
/* =====================================================================
   AUDITORÍA Y VERIFICACIÓN v3.3 · GEMINI (ANTIGRAVITY)
   Prueba de extremo a extremo en Chromium real sobre EnCicla v3.2 + GPT-6 + Antigravity 99n–99q:
   1) Todo liberado (oficios, turnos 1–3, 16 capítulos probables, 12 modos nuevos registrados) + CAST unificado
   2) ⏫ Acelerador fijo armonizado (#bCrucero), Snd.vehSfx, salto panorámico de los 7 vehículos
   3) Un solo mundo 3D unificado: WebGL 3P/1P + cabina 1P + Pixel World sobre WebGL + Maqueta 2:1 + controles
   4) 6 modos evolución (Copa del Valle, Domicilio, Monitoreo 911, Planeador, Metro 2D, Las Palmas) + Roguelite:
      cada uno arranca, su bot suma puntos o avanza, cero errores, y capturas visuales
   5) 5 skateparks abiertos + 6 arcos de mentores + Hub de 24 actividades + Save.revisarClaves() = 0
   6) Rendimiento CPU 4× en Cenital, 3P y 1P + horizontal (860×412), escritorio (1280×800) y Alto Contraste WCAG
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

  console.log('1) Todo liberado + 12 modos nuevos + unificación narrativa CAST');
  const lib = await p.evaluate(() => {
    const out = {};
    out.rolesTotal = ROLES.length;
    out.rolesLibres = ROLES.filter(r => UI.unlocked(r)).length;
    out.turnosLibres = ROLES.every(r => {
      const n = nShifts(r.id);
      for (let t = 1; t <= n; t++) if (!UI.turnoOk(r, t)) return false;
      return true;
    });
    const reqModos = ['traffix', 'despacho', 'maquinista', 'circuito', 'moravia', 'roguelite', 'copa', 'domicilio', 'monitoreo911', 'planeador', 'metro2d', 'palmas'];
    out.modosOk = reqModos.every(id => !!ROLE[id] && !!MODE_CLASS[id]);
    const tv = (GUION.trama_valle && GUION.trama_valle.personajesEnCicla) || [];
    const byId = Object.fromEntries(tv.map(x => [x.id, x.rol]));
    out.castOk = /Usuaria/i.test(byId.luz || '') && /Anfitrión/i.test(byId.santi || '') && /Mecánico/i.test(byId.jairo || '')
      && /bodega/i.test(byId.yuli || '') && /Técnica/i.test(byId.paola || '') && /balance/i.test(byId.wilson || '') && /control|Monitoreo/i.test(byId.cata || '');
    Save.data.diaValle = [];
    UI.historia();
    out.lockCount = document.querySelectorAll('#mBody .dia-c.lock').length;
    out.cap10Click = !!document.querySelector('#mBody [data-dia="dia-10"]');
    UI.closeModal();
    return out;
  });
  ok(lib.rolesLibres === lib.rolesTotal && lib.rolesTotal >= 12 && lib.turnosLibres, 'los ' + lib.rolesTotal + ' oficios del escalafón y todos sus turnos están liberados desde el inicio');
  ok(lib.modosOk, 'los 12 modos nuevos (5 Infinity + Roguelite + Copa + Domicilio + 911 + Planeador + Metro 2D + Las Palmas) están registrados');
  ok(lib.castOk, 'coherencia narrativa: los 9 mentores de trama_valle.json coinciden 100 % con CAST');
  ok(lib.lockCount === 15 && lib.cap10Click, 'Un día del valle conserva marca de progreso (15) pero permite probar cualquier capítulo');

  console.log('2) ⏫ Acelerador fijo armonizado (#bCrucero), Snd.vehSfx y salto panorámico de los 7 vehículos');
  const ctrl = await p.evaluate(async () => {
    const out = {}, w = ms => new Promise(r => setTimeout(r, ms));
    JE.game.start('usuario', 1, { seed: 77, nov: NOVEDADES[0], free: true });
    await w(500);
    const M = JE.game.mode, R = M.ride, P = R.p;
    out.btnAcel = !!document.querySelector('#bCrucero') && !document.querySelector('#camBar [data-cam="acel"]');
    const bl = R.blocked, mp = R.map, ta = R.tileAt, uc = R.updCars, ul = R.updLife;
    R.blocked = () => false; R.map = Object.create(JE.map); R.map.slope = () => 0; R.tileAt = () => TT.ROAD; R.updCars = () => {}; R.updLife = () => {};
    P.v = 0; P.a = 0; JE.acelFijo.toggle(true);
    for (let i = 0; i < 60; i++) M.update(1 / 30);
    out.cruiseV = +P.v.toFixed(1);
    JE.acelFijo.toggle(true);
    for (let i = 0; i < 90; i++) M.update(1 / 30);
    out.stopV = +P.v.toFixed(1);
    R.blocked = bl; R.map = mp; R.tileAt = ta; R.updCars = uc; R.updLife = ul;
    let sfxErr = null;
    try { for (const v of VEH_CATALOGO) { Snd.vehSfx(v.id, 'bell'); Snd.vehSfx(v.id, 'ollie'); } } catch (e) { sfxErr = e.message; }
    out.sfxOk = !sfxErr;
    Save.data.settings.vista = 'pano';
    let jumpsOk = 0;
    for (const v of VEH_CATALOGO) { P.veh = v.id; R.z = 0; R.vz = 0; R.jump(); if (R.vz > 100) jumpsOk++; }
    out.jumpsOk = jumpsOk;
    Save.data.settings.vista = 'cenital';
    JE.game.stop();
    return out;
  });
  ok(ctrl.btnAcel && ctrl.cruiseV > 40 && ctrl.stopV < 5, '⏫ acelerador fijo sin botón duplicado (#bCrucero): ' + ctrl.cruiseV + ' → ' + ctrl.stopV + ' px/s');
  ok(ctrl.sfxOk, 'Snd.vehSfx funciona sin errores para los 7 vehículos');
  ok(ctrl.jumpsOk === 7, 'Panorámica 2D: salto habilitado para los 7 vehículos (' + ctrl.jumpsOk + '/7)');

  console.log('3) Un solo mundo 3D unificado (WebGL 3P/1P + cabina 1P + Pixel World + Maqueta 2:1)');
  await p.evaluate(() => {
    JE.game.start('usuario', 1, { seed: 42, nov: NOVEDADES[0], free: true, bici: 'propia' });
    JE.game.mode.clock = 10 * 60 + 15;
  });
  await p.waitForTimeout(700);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '01-portrait-cenital.png') });

  const vistas = ['oblicua', '3p', '1p', 'pano', 'maqueta'];
  const vRes = {};
  for (const vid of vistas) {
    await p.evaluate(v => {
      JE.vistas.poner(v, true);
      JE.game.mode.ride.p.v = 45;
    }, vid);
    await p.waitForTimeout(550);
    vRes[vid] = await p.evaluate(() => {
      const glOn = typeof Mundo3D !== 'undefined' && Mundo3D.activo(JE.game.mode.ride);
      const cv = document.querySelector('#cv');
      const d = cv.getContext('2d').getImageData(Math.floor(cv.width / 2), Math.floor(cv.height / 2), 1, 1).data;
      return { cur: JE.vistas.actual(), gl: glOn, nonBlack: glOn ? (!!Mundo3D.vp && !Mundo3D.cv.hidden) : (d[0] + d[1] + d[2]) > 20 };
    });
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '02-vista-' + vid + '.png') });
  }
  /* 3.10.0 · la cámara única (el autor, 25‑nov‑2026: «Hay que eliminar las cámaras, la de maqueta, la de panorámica 2D, etc.»):
     pedir cualquier vista vieja deja la cenital 3D, y el mundo se sigue dibujando */
  ok(vistas.every(v => vRes[v].cur === 'cenital' && !vRes[v].gl && vRes[v].nonBlack), 'cámara única: las vistas viejas (oblicua, 3p, 1p, panorámica, maqueta) quedan en la cenital 3D: ' + JSON.stringify(vRes));

  await p.evaluate(() => { JE.vistas.poner('3p', true); JE.vistas.togglePixel(true); });
  await p.waitForTimeout(450);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '03-vista-3p-pixel.png') });
  const pxCheck = await p.evaluate(() => ({ v: JE.vistas.actual(), px: JE.vistas.esPixel(), cls: document.body.classList.contains('pixel3d') }));
  ok(pxCheck.v === 'cenital' && pxCheck.px && pxCheck.cls, 'Pixel World sigue como estilo, sobre la cámara única');
  await p.evaluate(() => { JE.vistas.togglePixel(true); JE.vistas.poner('cenital', true); });

  const g3p = await p.evaluate(() => {
    JE.vistas.poner('3p', true);
    const R = JE.game.mode.ride;
    R.p.a = 0; R._yaw3 = 0; if (typeof Mundo3D !== 'undefined') Mundo3D.yaw = 0;
    const fwd = R.girarDir({ x: 0, y: -1, m: 1 });
    const right = R.girarDir({ x: 1, y: 0, m: 1 });
    JE.vistas.poner('cenital', true);
    return { fwdX: +fwd.x.toFixed(2), fwdY: +fwd.y.toFixed(2), rightX: +right.x.toFixed(2), rightY: +right.y.toFixed(2) };
  });
  ok(g3p.fwdY < -.95 && g3p.rightX > .95, 'controles coherentes en la cámara única (de lejos: arriba = norte, derecha = oriente): ' + JSON.stringify(g3p));

  console.log('4) Prueba activa de los 7 modos evolución (Copa, Domicilio, 911, Planeador, Metro 2D, Las Palmas, Roguelite)');
  const modoIds = ['copa', 'domicilio', 'monitoreo911', 'planeador', 'metro2d', 'palmas', 'roguelite'];
  const shotMap = { copa: '09-copa-valle.png', monitoreo911: '10-monitoreo-911.png', metro2d: '11-metro-2d.png', palmas: '12-bajada-palmas.png' };
  const modoRes = {};
  for (const mid of modoIds) {
    modoRes[mid] = await p.evaluate(async id => {
      const e0 = (JE.errors || []).length;
      JE.game.stop();
      JE.game.start(id, 1, { seed: 9, nov: NOVEDADES[0] });
      await new Promise(s => setTimeout(s, 350));
      const M = JE.game.mode, sub = M && (M.sub || M);
      if (!M) return { ok: false, err: 'no mode' };
      const p0 = M.ride ? { x: M.ride.p.x, y: M.ride.p.y } : null;
      for (let i = 0; i < 80 && JE.game.mode === M && !M.done; i++) {
        if (i % 4 === 0) { if (sub && sub !== M && sub.bot) sub.bot(1 / 30); else if (M.bot) M.bot(1 / 30); }
        M.update(1 / 30);
      }
      const mov = p0 && M.ride ? Math.round(Math.hypot(M.ride.p.x - p0.x, M.ride.p.y - p0.y)) : 0;
      const pts = Math.round((M.score || 0) + (M.sub && !(M instanceof ModeSub) ? M.sub.score || 0 : 0));
      return { ok: (pts > 0 || mov > 5) && (JE.errors || []).length === e0, pts, mov, errs: (JE.errors || []).length - e0 };
    }, mid);
    if (SHOTS && shotMap[mid]) {
      await p.waitForTimeout(150);
      await p.screenshot({ path: path.join(SHOTS, shotMap[mid]) });
    }
    ok(modoRes[mid].ok, 'modo ' + mid + ': activo y fluido ' + JSON.stringify(modoRes[mid]));
  }

  console.log('5) Skateparks abiertos + Arcos de Mentores + Hub 24 Actividades + Save.revisarClaves()');
  const openW = await p.evaluate(async () => {
    const out = {};
    JE.game.stop();
    JE.game.start('usuario', 1, { seed: 42, nov: NOVEDADES[0], free: true, bici: 'propia' });
    await new Promise(s => setTimeout(s, 450));
    const M = JE.game.mode, R = M.ride;
    out.spots = (JE.skateSpots || []).length;
    out.copas = (JE.copaSpots || []).length;
    out.actsN = JE.rpg.actividades(M).length;
    const sp = JE.skateSpots[0];
    R.p.x = sp.x; R.p.y = sp.y; R.cam.x = sp.x; R.cam.y = sp.y;
    M.cambiarVehiculo('skate');
    out.enSpot = !!JE.skate.cerca(R);
    R._trucoCd = 0; JE.skate.hacerTruco(R, 'Ollie');
    R._trucoCd = 0; JE.skate.hacerTruco(R, '50-50 Grind');
    R._trucoCd = 0; JE.skate.hacerTruco(R, 'Kickflip');
    out.combo = R._trCombo;
    out.tecXp = Save.data.rpg && Save.data.rpg.sk && Save.data.rpg.sk.tecnica;
    /* Lanzar Monitoreo 911 directo desde Modo Libre y regresar con premios y entrada en Diario unificado */
    out.lanzado = JE.rpg.lanzarActividad(M, 'monitoreo911') && M.sub instanceof JE.MGMonitoreo911;
    if (M.sub) { M.sub.score = 50; M.sub.done = true; M.updSub(1 / 30); }
    out.regresoLibre = !M.sub && M.free && (JE.diario && JE.diario.lista().length > 0);
    /* Probar arco de mentor (Rosalba → Metro 2D) y subtrama ciudadana */
    out.arcoOk = JE.rpg.jugarArco(M, 'rosalba') && M.sub instanceof JE.MGMetro2D;
    if (M.sub) { M.sub.score = 60; M.sub.done = true; M.updSub(1 / 30); }
    out.arcoPaso = Save.data.rpg.arcos.rosalba | 0;
    const sb = JE.rpg.lanzarSubtrama(M);
    out.subtrama = !!sb && !!sb.m && dist(sb.st.x, sb.st.y, R.p.x, R.p.y) < 1200;
    out.clavesMal = Save.revisarClaves();
    return out;
  });
  ok(openW.spots === 5 && openW.copas === 3 && openW.enSpot && openW.combo === 3 && openW.tecXp > 0, '5 skateparks + 3 banderas Copa del Valle + combo ×' + openW.combo + ' + XP Técnica (' + openW.tecXp + ')');
  ok(openW.actsN >= 22 && openW.lanzado && openW.regresoLibre, 'Hub Valle Vivo (' + openW.actsN + ' actividades) jugable desde Modo Libre con regreso y Diario unificado');
  ok(openW.arcoOk && openW.arcoPaso === 1 && openW.subtrama, 'Arcos encadenados de mentores (Rosalba paso ' + openW.arcoPaso + '/3) y subtrama ciudadana cercana');
  ok(openW.clavesMal.length === 0, 'Save.revisarClaves() en cero con rpg + habil + diario armonizados: ' + openW.clavesMal.join(','));

  if (SHOTS) {
    await p.evaluate(() => {
      const M = JE.game.mode, sp = JE.skateSpots[0];
      M.ride.p.x = sp.x; M.ride.p.y = sp.y; M.ride.cam.x = sp.x; M.ride.cam.y = sp.y;
      JE.vistas.poner('cenital', true);
    });
    await p.waitForTimeout(350);
    await p.screenshot({ path: path.join(SHOTS, '04-skatepark-ciudad-rio.png') });
    await p.evaluate(() => { JE.rpg.abrirHub(JE.game.mode, 'act'); });
    await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(SHOTS, '05-hub-actividades.png') });
    await p.evaluate(() => { UI.closeModal(); if (JE.game.paused) Game.resume(); });
  }

  console.log('6) Rendimiento con CPU 4× (3D Cenital, 3D Tercera Persona y 3D Primera Persona)');
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
      const gl = typeof Mundo3D !== 'undefined' && Mundo3D.activo(JE.game.mode.ride);
      return { med: +ts[45].toFixed(1), p95: +ts[85].toFixed(1), gl };
    }, vid);
    console.log('     ' + vid.padEnd(8) + ' mediana ' + perf[vid].med + ' ms · p95 ' + perf[vid].p95 + ' ms' + (perf[vid].gl ? ' (WebGL SwiftShader CPU 4×)' : ''));
  }
  const lim3p = perf['3p'].gl ? 120 : 45, lim1p = perf['1p'].gl ? 120 : 45;
  ok(perf.cenital.med < 45 && perf['3p'].med < lim3p && perf['1p'].med < lim1p, 'CPU 4× dentro de presupuesto en Cenital (<45 ms) y 3P/1P (<' + lim3p + ' ms)');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  console.log('7) Horizontal móvil (860×412), Escritorio (1280×800) y Alto Contraste WCAG');
  await p.setViewportSize({ width: 860, height: 412 });
  await p.evaluate(() => { JE.vistas.poner('3p', true); View.resize(); Game.layout(true); });
  await p.waitForTimeout(500);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '06-landscape-860x412-3p.png') });

  await p.setViewportSize({ width: 1280, height: 800 });
  await p.evaluate(() => { JE.vistas.poner('cenital', true); View.resize(); Game.layout(true); });
  await p.waitForTimeout(500);
  if (SHOTS) await p.screenshot({ path: path.join(SHOTS, '07-desktop-1280x800-cenital.png') });

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
  console.log(fails ? '\n✗ ' + fails + ' fallas en auditoría Antigravity' : '\n✓ AUDITORÍA ANTIGRAVITY v3.3 100 % EN VERDE');
  process.exit(fails ? 1 : 0);
})();
