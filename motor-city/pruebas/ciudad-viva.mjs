#!/usr/bin/env node
/* 5.2 · La ciudad viva (MC.CiudadViva y el despacho de Turno Cero).
   En Node, con el mundo real de Medellín:
   - las frases (datos/frases/ciudad.json) son válidas: texto, eventos conocidos, horas dentro del día, sin repetidas; 'adulto' no
     se cuela en 'familia';
   - la frase más específica gana (paradero > calle; lluvia; hora) y no se repite en 90 s;
   - un atropello: los que están cerca reaccionan (mira, llama, ayuda), la rutina se pausa, quien llama avisa a los 3 s
     ('ciudad:testigo') y todos vuelven a su sitio cuando se les pasa; nadie se mete a un edificio;
   - un disparo: casi todos huyen (lejos del disparo);
   - las escenas salen de las bancas y paraderos reales, son estables (misma semilla, mismo sitio) y de noche hay menos.
   En el navegador (Turno Cero, 3D realista):
   - hay gente en las escenas, la gente reacciona a un atropello, alguien llama, la búsqueda sube por el testigo y llega una
     ambulancia por una ruta real que atiende y se va;
   - los globos y los íconos caen DENTRO de la pantalla (la proyección suma la cota del terreno; antes quedaban abajo en las lomas).
   Uso: node pruebas/ciudad-viva.mjs [--sin-navegador] */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { createRequire } from 'node:module'; import { fileURLToPath, pathToFileURL } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url);
let bien = 0, mal = 0; const ok = (c, msg, extra) => { (c ? bien++ : mal++); console.log((c ? '  ✓ ' : '  ✗ ') + msg + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); };
const ctx = { console, require, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8'), ctx);
const MC = ctx.MC, CV = MC.CiudadViva, cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/medellin.json'), 'utf8')), M = new MC.Mundo(new Uint8Array(fs.readFileSync(path.join(RAIZ, 'datos/medellin/mundo.mc4'))), cfg);

console.log('1) Las frases');
const F = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos/frases/ciudad.json'), 'utf8')), EVS = new Set(['choque', 'derrape', 'bocina', 'atropello', 'explosion', 'disparo', 'sirena', 'servicio', 'llamada', 'ambiente', 'mirar']);
const todas = [...F.familia, ...F.adulto], malas = todas.filter(f => !f.t || !Array.isArray(f.ev) || !f.ev.length || f.ev.some(e => !EVS.has(e)) || (f.hora && !(f.hora[0] >= 0 && f.hora[1] <= 1440 && f.hora[0] < f.hora[1])) || (f.lugar && !['banca', 'paradero', 'calle'].includes(f.lugar)));
ok(malas.length === 0 && F.familia.length >= 50 && F.adulto.length >= 12, 'todas válidas (texto, eventos conocidos, horas del día)', { familia: F.familia.length, adulto: F.adulto.length, malas: malas.map(f => f.t) });
ok(new Set(todas.map(f => f.t)).size === todas.length, 'sin frases repetidas');
ok(!F.familia.some(f => /disparo/.test(f.ev.join()) && !/explosion/.test(f.ev.join())) && !F.familia.some(f => /tombo|balacera|man está loco/i.test(f.t)), 'las de familia no hablan de balas ni con groserías');
ok(CV.frases().familia.length === F.familia.length, 'el motor trae las frases incrustadas al construir (MC_FRASES)');
for (const e of EVS) if (e !== 'bocina') ok(F.familia.some(f => f.ev.includes(e)) || e === 'disparo', 'hay frase de familia para «' + e + '»');

console.log('2) Reglas de respuesta: gana la más específica y no se repite');
CV.reiniciar(); CV.t = 1000;
const fp = CV.frase({ evento: 'ambiente', lugar: 'paradero', min: 720 }); ok(F.familia.some(f => f.t === fp && f.lugar === 'paradero'), 'en el paradero, una de paradero', fp);
const fl = CV.frase({ evento: 'ambiente', lugar: 'calle', min: 720, lluvia: true }); ok(F.familia.some(f => f.t === fl && f.lluvia === true), 'con lluvia, una de lluvia', fl);
const fn = CV.frase({ evento: 'ambiente', lugar: 'calle', min: 1300 }); ok(F.familia.some(f => f.t === fn && f.hora && 1300 >= f.hora[0] && 1300 < f.hora[1]), 'de noche, una de esa hora', fn);
const vistos = new Set(); let rep = false; for (let i = 0; i < 4; i++) { const t = CV.frase({ evento: 'atropello', min: 720 }); if (t && vistos.has(t)) rep = true; if (t) vistos.add(t); CV.t += 2; }
ok(!rep && vistos.size === 4, 'cuatro atropellos seguidos, cuatro frases distintas', [...vistos]);
const ad = new Set(); CV.t += 200; for (let i = 0; i < 30; i++) { const t = CV.frase({ evento: 'disparo', min: 720, tono: 'adulto' }); if (t) ad.add(t); CV.t += 100; }
ok([...ad].every(t => F.adulto.some(f => f.t === t) || F.familia.some(f => f.t === t)) && [...ad].some(t => F.adulto.some(f => f.t === t)), 'el tono adulto (Turno Cero) suma las suyas', [...ad].slice(0, 3));
CV.t += 200; ok(!F.adulto.some(f => f.t === CV.frase({ evento: 'disparo', min: 720, tono: 'familia' })), 'el tono familia nunca dice las de adultos');

console.log('3) Un atropello en una calle real');
const o = M.buscar('parque berrio') || M.buscar('coltejer'), via = M.viaCercana(o.x, o.y, 150); CV.reiniciar();
const gente = []; for (let i = 0, k = 0; gente.length < 16 && k < 400; k++) { const a = k * 2.399, r = 3 + (k % 5) * 6; const x = via.x + Math.cos(a) * r, y = via.y + Math.sin(a) * r; if (M.edificioEn(x, y, .4)) continue; i = gente.length; gente.push({ id: 100 + i, semilla: 7 + i * 13, x, y, a: 0, v: i % 2 ? 1.3 : 0, fase: 0 }); }
const inicio = gente.map(p => [p.x, p.y]); let testigos = 0; MC.on('ciudad:testigo', () => testigos++);
ok(gente.length === 16, '16 personas en la calle, ninguna dentro de un edificio');
CV.emitir('atropello', via.x, via.y, { grave: true });
const op = { dt: 1 / 30, reloj: { min: 720 }, mundo: M, tono: 'familia' }; CV.paso(gente, op);
const tipos = gente.map(p => p.reac && p.reac.tipo).filter(Boolean), cuenta = t => tipos.filter(x => x === t).length;
ok(tipos.length >= 10, 'casi todos los que lo oyeron reaccionan', tipos.length + '/16');
ok(cuenta('llama') >= 1 && cuenta('mira') + cuenta('ayuda') >= 1, 'unos llaman, otros miran o ayudan', { mira: cuenta('mira'), llama: cuenta('llama'), ayuda: cuenta('ayuda') });
ok(gente.filter(p => p.reac).every(p => p.v === 0), 'la rutina se pausa (se quedan quietos o actúan)');
ok(CV.dichos.length >= 1 && CV.dichos.length <= 2, 'alguien lo comenta (no todos a la vez)', CV.dichos.map(d => d.texto));
let enEdificio = false; for (let i = 0; i < 30 * 4; i++) { CV.paso(gente, op); for (const p of gente) if (M.edificioEn(p.x, p.y, .05)) enEdificio = true; }
ok(testigos >= 1, 'quien llama avisa a los 3 s (ciudad:testigo)', testigos);
const ayudan = gente.filter(p => p.reac && p.reac.tipo === 'ayuda'); ok(ayudan.every(p => Math.hypot(p.x - via.x, p.y - via.y) < 26), 'los que ayudan se acercan al herido');
for (let i = 0; i < 30 * 40; i++) CV.paso(gente, op);
const lejos = Math.max(...gente.map((p, i) => Math.hypot(p.x - inicio[i][0], p.y - inicio[i][1])));
ok(gente.every(p => !p.reac) && lejos < .3, 'se les pasa y vuelven caminando a su sitio', { lejos: Math.round(lejos * 100) / 100 });
ok(gente.filter((p, i) => i % 2).every(p => p.v > 0), 'y retoman la marcha');
ok(!enEdificio, 'nadie se mete a un edificio');

console.log('4) Un disparo (Turno Cero)');
CV.reiniciar(); const g2 = gente.map(p => ({ ...p, reac: null, _car: null, _ox: 0, _oy: 0, _oxA: 0, _oyA: 0 })); CV.emitir('disparo', via.x, via.y, { quien: 'rival' }); CV.paso(g2, op);
const huyen = g2.filter(p => p.reac && p.reac.tipo === 'huye'); const d0 = huyen.map(p => Math.hypot(p.x - via.x, p.y - via.y));
for (let i = 0; i < 30 * 3; i++) CV.paso(g2, op);
ok(huyen.length >= 10, 'casi todos huyen', huyen.length + '/16');
ok(huyen.filter((p, i) => Math.hypot(p.x - via.x, p.y - via.y) > d0[i] + 3).length >= huyen.length * .7, 'y se alejan del disparo');

console.log('5) Escenas de la calle (bancas y paraderos reales)');
CV.reiniciar(); let ex = null, dia = [];
for (const q of ['parque berrio', 'parque de bolivar', 'plaza botero', 'parque lleras', 'estadio', 'parque del poblado', 'san antonio']) { const lu = M.buscar(q); if (!lu) continue; const e = CV.escenas(M, lu.x, lu.y, { reloj: { min: 660 }, radio: 160, max: 40 }); if (e.length > dia.length) { dia = e; ex = lu; } }
ok(dia.length >= 3, 'de día hay gente en las bancas y los paraderos', { n: dia.length, sentados: dia.filter(p => p.pose === 'sentado').length, paradero: dia.filter(p => p.escena === 'paradero').length });
const props = MC.Mobiliario.en(M, ex.x - 160, ex.y - 160, ex.x + 160, ex.y + 160, 400).filter(q => q.t === 'banca' || q.t === 'paradero');
ok(dia.every(p => props.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 2.5)), 'cada uno está en una banca o un paradero del mobiliario');
CV.reiniciar(); const otra = CV.escenas(M, ex.x, ex.y, { reloj: { min: 660 }, radio: 160, max: 40 });
ok(otra.length === dia.length && otra.every((p, i) => p.x === dia[i].x && p.y === dia[i].y && p.pose === dia[i].pose), 'estables: la misma gente en el mismo sitio (sale de la semilla)');
CV.reiniciar(); const noche = CV.escenas(M, ex.x, ex.y, { reloj: { min: 120 }, radio: 160, max: 40 });
ok(noche.length < dia.length, 'de noche hay menos', { dia: dia.length, noche: noche.length });
CV.reiniciar(); const rp = { ...op, reloj: { min: 660 } }, esc = CV.escenas(M, ex.x, ex.y, { reloj: { min: 660 }, radio: 160, max: 40 }); CV.emitir('choque', esc[0].x + 2, esc[0].y, { fuerza: 9 }); CV.paso(esc, rp);
ok(esc.some(p => p.reac), 'la gente de las escenas también reacciona');

if (!process.argv.includes('--sin-navegador')) {
  console.log('6) En el navegador: Turno Cero, despacho y globos');
  const { chromium } = require('playwright');
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), p = await b.newPage({ viewport: { width: 860, height: 412 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(RAIZ, 'dist/juegos/getaway.html')).href + '?portada'); await p.waitForFunction(() => window.TURNO_LISTO, null, { timeout: 120000 });
  await p.click('#bAbierto'); await p.waitForFunction(() => TURNO.M && !TURNO.transicion && TURNO.cuerpo, null, { timeout: 120000 });
  for (let i = 0; i < 8; i++) { const d = await p.$('.mcui .dialogo button'); if (!d) break; await d.click().catch(() => {}); await p.waitForTimeout(150); }
  await p.evaluate(async () => { const G = TURNO, M = G.M, C = G.cuerpo, espera = ms => new Promise(q => setTimeout(q, ms)), CV = MC.CiudadViva;
    for (const m of document.querySelectorAll('.mcui .menu, .mcui .dialogo')) m.remove();
    const o = M.buscar('parque berrio') || M.buscar('coltejer'), q = M.viaCercana(o.x, o.y, 150); Object.assign(C, { x: q.x, y: q.y, a: q.ang, v: 0 }); G.reloj.min = 11 * 60; G.reloj.vel = 0;
    MC.opciones.graficos = 'realistas'; G.vistas.motor3d = 'gl'; G.vistas.reiniciarGL(); G.vistaId = 'ciudad3d'; G.vistas.usar('ciudad3d', G.E); G.camara.zoom = 22;
    await espera(2500); const e0 = G.Viva._esc[0]; if (e0) { const qv = M.viaCercana(e0.x, e0.y, 30); if (qv) Object.assign(C, { x: qv.x, y: qv.y, a: qv.ang, v: 0 }); } await espera(1500);
    /* Un cambio a VistaTres puede tardar varios cuadros en inicializar su
       matriz de proyección bajo Chromium/SwiftShader. Exigir que esté lista,
       con espera limitada, sin relajar la comprobación de visibilidad. */
    for (let i = 0; i < 24; i++) {
      const carPr = G.vistas.aPantalla(G.E, C.x, C.y, 0);
      if (carPr && Number.isFinite(carPr[0]) && Number.isFinite(carPr[1]) &&
          carPr[0] > 0 && carPr[0] < G.W && carPr[1] > 0 && carPr[1] < G.H) break;
      await espera(250);
    }
    const esc = G.Viva._esc.length, sentados = G.Viva._esc.filter(p => p.pose === 'sentado').length, pr = (x, y, z) => G.vistas.aPantalla(G.E, x, y, z), enPantalla = s => s && s[0] > 0 && s[0] < G.W && s[1] > 0 && s[1] < G.H;
    /* la proyección: el carro cae en la pantalla (en una loma) */
    const car = G.vistas.aPantalla(G.E, C.x, C.y, 0), cota = M.cota(C.x, C.y);
    /* un atropello delante del carro: alguien de la escena a 3 m */
    const cerca = G.E.peatones.slice().sort((a, b) => Math.hypot(a.x - C.x, a.y - C.y) - Math.hypot(b.x - C.x, b.y - C.y))[0];
    const n0 = G.busq.nivel, h0 = G.busq.heat; window._h0 = h0; CV.emitir('atropello', cerca.x + 2, cerca.y, { grave: true }); G.caidos.push({ x: cerca.x + 2, y: cerca.y, a: 0 });
    await espera(600); const reac = G.E.peatones.filter(p => p.reac).map(p => p.reac.tipo); CV._ultDicho = -99; const R0 = G.E.peatones.find(p => p.reac && enPantalla(pr(p.x, p.y, 2.7))) || G.E.peatones.find(p => enPantalla(pr(p.x, p.y, 2.7))) || cerca; CV.decir(R0, 'atropello', { reloj: G.reloj, tono: 'adulto' });
    await espera(200); const dib = G.Viva.dibujados, dentro = CV.dichos.filter(D => enPantalla(pr(D.p.x, D.p.y, 2.7))).length;
    window._cv = { esc, sentados, car, cota, reac, dib, dentro, n0 }; return 1; });
  await p.screenshot({ path: path.join(RAIZ, 'reportes/ciudad-viva-5.2.jpg'), type: 'jpeg', quality: 80 });
  const r = await p.evaluate(async () => { const G = TURNO, espera = ms => new Promise(q => setTimeout(q, ms)), { esc, sentados, car, cota, reac, dib, dentro, n0 } = window._cv;
    /* el testigo (3 s) y la ambulancia */
    let serv = null; for (let i = 0; i < 40 && !G.Viva.servicios.length; i++) await espera(250); serv = G.Viva.servicios[0];
    const ruta = serv ? Math.round(serv.T.largo) : 0, nivel = G.busq.nivel, calor = G.busq.heat, h0 = window._h0;
    /* la ambulancia llega, atiende y se lleva al herido (se acelera el tiempo del servicio) */
    let fases = new Set(); if (serv) { serv.s = Math.max(serv.s, serv.T.largo - 40); for (let i = 0; i < 80 && G.Viva.servicios.includes(serv) && serv.fase !== 'sale'; i++) { fases.add(serv.fase); if (serv.fase === 'atiende') serv.t = Math.max(serv.t, 10.5); await espera(150); } fases.add(serv.fase); }
    const enTrafico = G.E.trafico.some(v => v.servicio === 'ambulancia');
    return { esc, sentados, car, cota, W: G.W, H: G.H, reac, dib, dentro, ruta, n0, nivel, calor, h0, fases: [...fases], caidos: G.caidos.length, enTrafico, err: (MC.fallas || []).slice(0, 3) }; });
  await b.close();
  ok(r.esc >= 3, 'hay gente en las bancas y los paraderos junto al Parque Berrío', { escenas: r.esc, sentados: r.sentados });
  ok(r.car && r.car[1] > 0 && r.car[1] < r.H && r.car[0] > 0 && r.car[0] < r.W, 'el carro se proyecta dentro de la pantalla en 3D (cota ' + Math.round(r.cota) + ' m)', r.car && r.car.map(Math.round));
  ok(r.reac.length >= 2 && r.reac.some(t => t === 'llama'), 'la gente reacciona al atropello y alguien llama', r.reac);
  ok(r.dib >= 1 && r.dentro >= 1, 'los globos y los íconos se dibujan dentro de la pantalla', { dibujados: r.dib, dentro: r.dentro });
  ok(r.ruta > 100, 'el testigo pidió una ambulancia que viene por una ruta real', r.ruta + ' m');
  /* 5.3.2: lo que sube una llamada es el calor de la búsqueda (8 por un atropello); el nivel 1 pide 15, o sea dos testigos, y cuántos llaman depende de quién quedó cerca */
  ok(r.calor > r.h0, 'y la búsqueda subió («un vecino llamó a la policía»)', { calorAntes: r.h0, calorDespues: +r.calor.toFixed(1), nivelAntes: r.n0, nivel: r.nivel });
  ok(r.fases.includes('atiende') && r.fases.includes('sale') && r.caidos === 0, 'la ambulancia llega, atiende, se lleva al herido y se va', { fases: r.fases, caidos: r.caidos });
  ok(errs.length === 0, 'sin errores en la página', errs.slice(0, 3));
}
console.log(`\n${mal ? '✗' : '✓'} Ciudad viva: ${bien} bien, ${mal} mal`); process.exit(mal ? 1 : 0);
