/* Pruebas de la revolución v2.1 de Juega EnCicla (Claude, 21‑nov‑2026): lo de Motor City 4.5 adaptado al juego.
   Se llama desde tests/run.js con la página ya abierta: await require('./revolucion-encicla')(p, ok)
   M) manejo: rasante desliza y conserva, de frente frena, se desatasca, la asistencia esquiva la pared y se apaga */
module.exports = async function (p, ok) {
  console.log('V) v2.1 · manejo de Motor City 4.5 en la bici (desliza, frena de frente, se desatasca, asistencia)');
  const m = await p.evaluate(async () => {
    const out = {}, espera = ms => new Promise(s => setTimeout(s, ms));
    JE.game.stop && JE.game.stop(); JE.game.start('usuario', 1, { seed: 21, nov: NOVEDADES[0], free: true }); await espera(400);
    const M = JE.game.mode, R = M.ride, P = R.p, S = R.stats_();
    /* un mundo de prueba: solo la pared que diga cada caso, sin pendiente, sin tráfico ni gente */
    const bak = { bl: R.blocked, mp: R.map, ta: R.tileAt, uc: R.updCars, ul: R.updLife, ut: R.updTrains };
    R.map = Object.create(JE.map); R.map.slope = () => 0; R.tileAt = () => TT.ROAD; R.updCars = () => {}; R.updLife = () => {}; R.updTrains = () => {};
    JE.game.paused = true; const H = JE.headless; JE.headless = true;
    const correr = (seg, dir) => { for (let i = 0; i < seg * 60; i++) { M.t += 1 / 60; R.update(1 / 60, dir); } };
    /* 1) rasante: pared al norte (y < 1000); va al este 15° hacia la pared a toda marcha */
    R.blocked = (x, y, r) => y - r < 1000; P.x = 500; P.y = 1000 + S.r + .5; P.a = -.26; P.v = S.max; P.w = 0; P.stun = 0;
    const x0 = P.x; correr(1, { x: Math.cos(-.26), y: Math.sin(-.26), m: 1 });
    out.rasante = { avanza: Math.round(P.x - x0), vel: +(P.v / S.max).toFixed(2), noAtraviesa: P.y - S.r >= 1000 - 1e-6 };
    /* 2) de frente: hacia el norte, contra la pared */
    P.x = 500; P.y = 1000 + S.r + 6; P.a = -Math.PI / 2; P.v = S.max; P.w = 0; correr(.35, { x: 0, y: -1, m: 1 });
    out.frente = { vel: +(P.v / S.max).toFixed(2), noAtraviesa: P.y - S.r >= 1000 - 1e-6 };
    /* 3) esquina: pared al norte y al este; empuja hacia el noreste (adentro de la esquina) hasta que se desatasca */
    R.blocked = (x, y, r) => y - r < 1000 || x + r > 600; P.x = 600 - S.r - .3; P.y = 1000 + S.r + .3; P.a = -Math.PI / 4; P.v = 0; R.stats.desatascos = 0; R._atasco = 0;
    const e0x = P.x, e0y = P.y; correr(1.6, { x: Math.SQRT1_2, y: -Math.SQRT1_2, m: 1 });
    out.desatasco = { veces: R.stats.desatascos | 0, salio: +Math.hypot(P.x - e0x, P.y - e0y).toFixed(1) };
    /* 4) asistencia: algo adelante (al norte, a 20 px) y el dedo derecho hacia ello: el rumbo pedido se corre a un lado */
    JE.headless = false; R.blocked = (x, y, r) => y - r < 1000 && y + r > 990 && x + r > 490 && x - r < 510;   /* un poste o una esquina, no una pared entera */ P.x = 500; P.y = 1022; P.a = -Math.PI / 2; P.v = S.max * .8; R._tAs = 0;
    const d = JE.manejo.asistir(R, 1 / 60, { x: 0, y: -1, m: 1 }); out.asiste = { corre: +Math.abs(Math.atan2(d.y, d.x) + Math.PI / 2).toFixed(2), recoge: d.m };
    Save.data.settings.asist = false; R._tAs = 0; const d2 = JE.manejo.asistir(R, 1 / 60, { x: 0, y: -1, m: 1 }); out.apagada = d2.x === 0 && d2.y === -1 && d2.m === 1; Save.data.settings.asist = true;
    /* el bot no usa la asistencia */
    M.botDir = { x: 0, y: -1, m: 1 }; R._tAs = 0; const d3 = JE.manejo.asistir(R, 1 / 60, M.botDir); out.bot = d3 === M.botDir; M.botDir = null;
    /* el golpe de frente suena, sacude poco y cuenta; el polvo y el aro salen en JE.efx */
    JE.headless = false; R.blocked = (x, y, r) => y - r < 1000; P.x = 500; P.y = 1000 + S.r + 4; P.a = -Math.PI / 2; P.v = S.max; R._tGolpe = 0; R.stats.golpes = 0; const n0 = JE.efx.k | 0;
    correr(.1, { x: 0, y: -1, m: 1 }); out.golpe = { veces: R.stats.golpes | 0, efx: (JE.efx.k | 0) > n0 };
    JE.headless = H; Object.assign(R, { blocked: bak.bl, map: bak.mp, tileAt: bak.ta, updCars: bak.uc, updLife: bak.ul, updTrains: bak.ut }); JE.game.paused = false;
    /* Más → el interruptor de la asistencia */
    JE.game.stop(); UI.go('sHome'); UI.renderMas(); out.interruptor = !!document.querySelector('#tab-mas [data-asist]');
    return out;
  });
  ok(m.rasante.avanza > 60 && m.rasante.vel > .6 && m.rasante.noAtraviesa, 'rasante contra la pared: desliza y conserva la velocidad ' + JSON.stringify(m.rasante));
  ok(m.frente.vel < .25 && m.frente.noAtraviesa, 'de frente contra la pared: frena y no la atraviesa ' + JSON.stringify(m.frente));
  ok(m.desatasco.veces >= 1 && m.desatasco.salio > 2, 'metida en una esquina: se desatasca sola ' + JSON.stringify(m.desatasco));
  ok(m.asiste.corre >= .2 && m.asiste.recoge <= .6 && m.apagada && m.bot, 'asistencia: corre el rumbo y recoge el acelerador ante la pared; se apaga y el bot no la usa ' + JSON.stringify(m.asiste));
  ok(m.golpe.veces === 1 && m.golpe.efx, 'el golpe de frente cuenta una vez y suelta polvo ' + JSON.stringify(m.golpe));
  ok(m.interruptor, 'Más: interruptor «🛞 Asistencia de manejo»');

  console.log('V2) v2.1 · árboles con lógica, HUD según el contexto, lectura cenital, rostros y charlas');
  const h = await p.evaluate(async () => {
    const out = {}, espera = ms => new Promise(s => setTimeout(s, ms)), M0 = JE.map;
    /* árboles: se dibujan de verdad los trozos donde un árbol de avenida caería sobre una cancha, una pista o una piscina,
       y se cuentan los círculos de copa (r 4,4) que quedan encima de algo así */
    const malos = [], S = CH * TS;
    for (const ch of M0.chains || []) { if (ch.k !== 2) continue; const len = chainLen(ch.p), hw = ch.w / 2 + SWK[ch.k] * .55, step = 24; let j = 0;
      for (let s = 12 + h2(ch.p[0] | 0, ch.p[1] | 0, 70) * step; s < len - 12 && malos.length < 25; s += step, j++) { if (!(j % 3)) continue; const a = M0.chPt(ch, s), b = M0.chPt(ch, s + 2), L = Math.hypot(b.x - a.x, b.y - a.y) || 1, sd = j % 2 ? 1 : -1, X = a.x - (b.y - a.y) / L * hw * sd, Y = a.y + (b.x - a.x) / L * hw * sd; if (!M0.sitLibre(Math.floor(X / S), Math.floor(Y / S), X, Y)) malos.push([X, Y]); } }
    const trozos = new Map(); for (const [X, Y] of malos) trozos.set(Math.floor(X / S) + ',' + Math.floor(Y / S), [Math.floor(X / S), Math.floor(Y / S)]);
    const _arc = CanvasRenderingContext2D.prototype.arc, copas = []; CanvasRenderingContext2D.prototype.arc = function (x, y, r, a0, a1) { if (Math.abs(r - 4.4) < .01 && !/^rgba\(8, 14, 30/.test(String(this.fillStyle))) copas.push([x, y]); return _arc.apply(this, arguments); };   /* la copa (no su sombra, que se corre 1,6 px) */
    try { for (const [cx, cy] of trozos.values()) { const cv = document.createElement('canvas'); cv.width = cv.height = S; M0.drawGround3(cv.getContext('2d'), cx, cy, 1); } } finally { CanvasRenderingContext2D.prototype.arc = _arc; }
    out.arboles = { buscados: malos.length, trozos: trozos.size, encima: copas.filter(([x, y]) => !M0.sitLibre(Math.floor(x / S), Math.floor(y / S), x, y)).length };
    /* HUD: en la estación salen Devolver (abajo), Timbre y ⋯ Más; la bandeja trae el resto y se cierra */
    const _now = Cal.now; Cal.now = () => new Date(2026, 10, 18, 12, 0);   /* a mediodía (EnCicla abierta): la prueba no depende de la hora real */
    JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0], free: true, bici: 'encicla' }); await espera(500); Cal.now = _now;
    const M = JE.game.mode, R = M.ride, st = JE.map.stations[3]; R.p.x = st.x; R.p.y = st.y; R.p.v = 0; await espera(500);
    const bar = [...document.querySelectorAll('#actBar > button')].map(b => b.textContent.trim()), n = M.actions().length;
    document.querySelector('#bMas') && document.querySelector('#bMas').click(); await espera(100);
    const bandeja = [...document.querySelectorAll('#actMas button')].map(b => b.textContent.trim());
    out.hud = { acciones: n, barra: bar, bandeja: bandeja.length, todas: bar.length - 1 + bandeja.length === n, ultima: bar[bar.length - 1] };
    out.hud.indices = [...document.querySelectorAll('#actMas button')].every(b => +b.dataset.i >= 0 && M.actions()[+b.dataset.i]);   /* cada botón de la bandeja apunta a su acción */
    out.hud.iconos = document.querySelectorAll('#actBar .ico21, #actMas .ico21').length >= 3;
    document.querySelector('#cv').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 5, clientX: 100, clientY: 400 })); await espera(50);
    out.hud.cierra = !!document.querySelector('#actMas') && document.querySelector('#actMas').hidden;
    /* tocar «Trama» en la bandeja abre la trama (la acción de verdad, no solo el botón) */
    document.querySelector('#bMas').click(); await espera(60); const bt = [...document.querySelectorAll('#actMas button')].find(b => /Trama/.test(b.textContent)); if (bt) bt.click(); await espera(150); out.hud.toca = !!bt && document.querySelector('#modal') && !document.querySelector('#modal').hidden; UI.closeModal(); if (JE.game.paused) JE.game.resume();
    /* lectura: el cono de luz se corta en un edificio */
    const tapa = Lectura.tapa, P = R.p; P.a = 0; Lectura.tapa = (m, x, y) => x > P.x + 20; const rr = Lectura.rayos(R, 60, .3); Lectura.tapa = tapa;
    out.cono = rr.every(([x]) => x <= P.x + 24);
    /* rostros: cada persona tiene una cara estable; hablarle a un vecino saca su tarjeta con cara */
    out.cara = Caras.url('Rosalba', 64).length > 2000 && Caras.url('Rosalba', 64) === Caras.url('Rosalba', 64) && Historia.face('usuario').length > 2000;
    const vec = Trama.personajes()[0]; Trama.hablar(M, vec); await espera(100); const ch = document.querySelector('#charla');
    out.charla = !!ch && ch.classList.contains('on') && ch.textContent.includes(vec.name) && !!ch.querySelector('img');
    JE.game.stop(); UI.go('sHome'); UI.personajes(); out.vecinos = document.querySelectorAll('#mBody .char').length; UI.closeModal();
    return out;
  });
  ok(h.arboles.buscados > 0 && h.arboles.encima === 0, 'árboles con lógica: ningún árbol de avenida sobre canchas, pistas o piscinas ' + JSON.stringify(h.arboles));
  ok(h.hud.barra.length <= 3 && h.hud.todas && h.hud.ultima === 'Devolver' && h.hud.cierra && h.hud.indices && h.hud.iconos && h.hud.toca, 'HUD según el contexto: ' + h.hud.acciones + ' acciones en 3 botones (' + h.hud.barra.join(', ') + ') y la bandeja con ' + h.hud.bandeja + ' que se cierra al tocar el mapa');
  ok(h.cono, 'el cono de luz del ciclista se corta en los edificios');
  ok(h.cara && h.charla, 'rostros de Motor City: cara estable para cada persona y tarjeta al hablar con un vecino');
  ok(h.vecinos >= 9 + 15, 'Personajes: los 9 mentores y los 15 vecinos de la trama con su cara (' + h.vecinos + ')');
};

/* V3) la Ruta a Guatapé, la red completa de El Metro y los cuatro tamaños (se llama aparte desde tests/run.js) */
module.exports.v3 = async function (p, ok) {
  console.log('V3) v2.1 · Ruta a Guatapé en bici, la red de El Metro (alimentadores y líneas futuras) y los cuatro tamaños');
  const g = await p.evaluate(async () => {
    const out = {}, espera = ms => new Promise(s => setTimeout(s, ms));
    /* física de verdad: 30 km/h en plano a fondo y ~11 km/h en una subida del 6 % (180 W, 85 kg, Crr 0,006, CdA 0,4) */
    JE.game.stop && JE.game.stop(); JE.game.start('guatape', 1, { seed: 1, nov: NOVEDADES[0] }); await espera(300); JE.game.paused = true;
    const m = JE.game.mode.sub, fis = sl => { m.pend = () => sl; m.paradasZ = []; m.tCarro = m.tOpuesto = 1e9; m.carros = []; m.v = 5; for (let i = 0; i < 60 * 90; i++) { m.x = 3.9; m.agua = 100; m.botM = { gx: 0, arriba: 1, abajo: 0 }; m.pos = 100; m.update(1 / 60); } return +(m.v * 3.6).toFixed(1); };
    out.plano = fis(0); out.subida6 = fis(.06); out.bajada6 = fis(-.06);
    /* el tramo 1 de punta a punta con el bot: llega, para en las 2 fondas, va por la orilla y aprende 2 datos */
    JE.game.stop(); JE.game.start('guatape', 1, { seed: 1, nov: NOVEDADES[0] }); await espera(200); JE.game.paused = true;
    const M = JE.game.mode, s = M.sub; let k = 0; while (!s.done && k < 60 * 400) { if (k % 6 === 0) s.bot(); M.update(1 / 60); if (s.parado && s.parado.t > 1) s.parado.seguir = true; k++; }
    const res = M.result(); out.tramo = { llego: s.llego, segundos: Math.round(k / 60), paradas: s.paradas.length, pitos: s.pitos, sustos: s.sustos, hojas: s.hojas, estrellas: res.stars, datos: (Save.data.guatape && Save.data.guatape.datos || []).length };
    out.curso = { letreros: s.segs.reduce((a, q) => a + q.spr.filter(o => o.k === 'letrero').length, 0), fondas: s.segs.reduce((a, q) => a + q.spr.filter(o => o.k === 'fonda').length, 0), lago: s.segs.filter(q => q.lago).length };
    /* se dibuja sin errores (tramo 2: con la Piedra) y el Taller del modo libre lleva a la ruta */
    JE.game.stop(); JE.game.start('guatape', 2, { seed: 1, nov: NOVEDADES[0] }); await espera(400); JE.game.mode.sub.pos = 3500; await espera(300); out.dibuja = !(JE.errors || []).some(e => /guatape|Guatap|piedra/i.test(e));
    JE.game.stop(); JE.game.start('usuario', 1, { seed: 3, nov: NOVEDADES[0], free: true }); await espera(300); Taller.abrir(JE.game.mode); out.taller = !!document.querySelector('#tlGua'); UI.closeModal(); JE.game.paused = false;
    /* la red de El Metro: 15 alimentadores con sus paraderos en orden, 3 líneas futuras, buses que andan y datos de las estaciones */
    const R = JE.game.mode.ride, A = JE.map.alim || [];
    out.red = { alim: A.length, paraderos: A.reduce((a, L) => a + L.st.length, 0), enOrden: A.every(L => L.st.every((q, i) => !i || q.s >= L.st[i - 1].s)), largos: A.every(L => L.len > 300), futuras: (JE.map.futuras || []).map(f => f.id + ':' + f.estado), estaciones: JE.redM.est.length, dato: !!JE.redM.dato('San Antonio') };
    if (GFX() === '3d') { R.updAlim(.1); const s0 = R.alims.map(b => b.s); for (let i = 0; i < 300; i++) R.updAlim(1 / 30); out.red.buses = R.alims.length; out.red.andan = R.alims.filter((b, i) => b.s !== s0[i]).length; }
    R.big = true; await espera(400); out.red.mapa = !(JE.errors || []).some(e => /mapa extra|red:/.test(e)); R.big = false;
    /* los cuatro tamaños: botones, minimapa y la letra grande de antes */
    const ancho = () => { const b = document.querySelector('#actBar .abtn:not(.mas)'); return b ? Math.round(b.getBoundingClientRect().width) : 0; };
    JE.tam.poner(0); await espera(250); const w0 = ancho(), mm0 = R.mmRect && R.mmRect.w; JE.tam.poner(3); await espera(250); const w3 = ancho(), mm3 = R.mmRect && R.mmRect.w;
    out.tam = { pequeno: w0, grande: w3, mm: [mm0, mm3], big: document.body.classList.contains('big') }; JE.tam.poner(1);
    /* lo que dice una persona va a su tarjeta con cara (no al aviso grande del centro) */
    UI.toast('🚇 Silbato de bronce de La Quiebra (Rosalba): El silbato con que los guardagujas daban salida a los vagones.'); await espera(80);
    const ch = document.querySelector('#charla'); out.tarjeta = !!ch && ch.classList.contains('on') && /Rosalba/.test(ch.textContent);
    JE.game.stop(); UI.go('sHome'); return out;
  });
  ok(g.plano >= 27 && g.plano <= 33 && g.subida6 >= 9 && g.subida6 <= 13.5 && g.bajada6 >= 48 && g.bajada6 <= 62, 'Guatapé · física con unidades reales: plano ' + g.plano + ' km/h, subida del 6 % ' + g.subida6 + ' km/h, bajada ' + g.bajada6 + ' km/h');
  ok(g.tramo.llego && g.tramo.paradas === 2 && g.tramo.pitos <= 2 && g.tramo.estrellas === 3 && g.tramo.datos >= 2, 'Guatapé · el bot llega al Mirador, para en las 2 fondas, va por la orilla y aprende 2 datos ' + JSON.stringify(g.tramo));
  ok(g.curso.letreros === 4 && g.curso.fondas === 2 && g.curso.lago > 100 && g.dibuja && g.taller, 'Guatapé · 4 letreros de km, 2 fondas, el embalse a los lados, la Piedra se dibuja y el Taller lleva a la ruta ' + JSON.stringify(g.curso));
  ok(g.red.alim === 15 && g.red.paraderos >= 70 && g.red.enOrden && g.red.largos && g.red.futuras.length === 3 && g.red.estaciones > 80 && g.red.dato && (g.red.buses == null || g.red.andan > 20) && g.red.mapa, 'red de El Metro: 15 alimentadores con ' + g.red.paraderos + ' paraderos y sus buses, ' + g.red.futuras.join(', ') + ' y datos de ' + g.red.estaciones + ' estaciones');
  ok(g.tam.pequeno > 0 && g.tam.grande > g.tam.pequeno * 1.3 && g.tam.mm[1] > g.tam.mm[0] && g.tam.big, 'cuatro tamaños: el botón mide ' + g.tam.pequeno + ' px en Pequeño y ' + g.tam.grande + ' px en Grande; el minimapa ' + g.tam.mm.join(' → ') + ' px');
  ok(g.tarjeta, 'lo que dice un personaje va a su tarjeta con cara, no al aviso del centro');
};

/* V4) ronda 3.0: fluidez con subpasos, ⏫ acelerador fijo, todo liberado, oficios en el mundo abierto, zonas de trucos,
   la carrera por la ciclovía con giros y el mundo 3D único (si hay WebGL) */
module.exports.v4 = async function (p, ok) {
  console.log('V4) ronda 3.0 · fluidez, acelerador fijo, todo liberado, oficios en el valle, trucos, carrera con giros y mundo 3D');
  const r = await p.evaluate(async () => {
    const out = {}, espera = ms => new Promise(s => setTimeout(s, ms)), _now = Cal.now; Cal.now = () => new Date(2026, 10, 18, 12, 0);
    JE.game.stop && JE.game.stop(); JE.game.start('usuario', 1, { seed: 4, nov: NOVEDADES[0], free: true, bici: 'encicla' }); await espera(400); Cal.now = _now;
    const M = JE.game.mode, R = M.ride;
    /* 1) subpasos: un cuadro lento de 200 ms hace avanzar el juego 200 ms (antes, 50 ms: cámara lenta) */
    cancelAnimationFrame(JE.game.raf); const t0 = M.t; JE.game.last = 1000; JE.game.loop(1200); cancelAnimationFrame(JE.game.raf); out.subpasos = +(M.t - t0).toFixed(3); JE.game.last = performance.now(); JE.game.raf = requestAnimationFrame(t => JE.game.loop(t));
    /* 2) acelerador fijo: sin tocar nada, la bici acelera; al soltarlo frena */
    R.p.v = 0; JE.crucero.poner(true); for (let i = 0; i < 60; i++) M.update(1 / 30); const vOn = R.p.v; JE.crucero.poner(false); for (let i = 0; i < 90; i++) M.update(1 / 30);
    out.crucero = { acelera: vOn > R.stats_().max * .5, frena: R.p.v < vOn * .2, boton: !!document.querySelector('#bCrucero') };
    /* 3) todo liberado */
    out.liberado = ROLES.every(rr => UI.unlocked(rr) && UI.turnoOk(rr, nShifts(rr.id)));
    /* 4) oficios en el valle: en una estación y en Casa EnCicla, el mismo módulo y el regreso */
    const s = JE.map.stations[11]; R.p.x = s.x; R.p.y = s.y; R.p.v = 0; await espera(100); out.enEstacion = M.actions().some(a => a.id === 'oficios');
    const dp = JE.map.depot; R.p.x = dp.x; R.p.y = dp.y; await espera(100); M.actions().find(a => a.id === 'oficios').fn(); await espera(150); out.oficios = document.querySelectorAll('[data-of]').length;
    document.querySelector('[data-of="bodega"][data-t="1"]').click(); await espera(400); out.mismo = JE.game.mode && JE.game.mode.constructor === MODE_CLASS.bodega && !!JE.game.meta.volver;
    JE.game.mode.end(); await espera(400); const bv = document.querySelector('#bVolverValle'); if (bv) bv.click(); await espera(500); out.volvio = !!(JE.game.mode && JE.game.mode.free && Math.abs(JE.game.mode.ride.p.x - dp.x) < 2);
    /* 5) zonas de trucos en el valle */
    const M2 = JE.game.mode, R2 = M2.ride, z = Trucos.zonas()[0]; R2.p.x = z.x; R2.p.y = z.y; R2.p.v = 0; await espera(80); const tr = M2.actions().find(a => a.id === 'truco'); const s0 = M2.score; if (tr) tr.fn(); out.trucos = { zonas: Trucos.zonas().length, accion: !!tr, puntos: M2.score > s0 };
    /* 6) la carrera de la ciclorruta: rápida, con giros, tramos estrechos y sin trampas */
    JE.game.stop(); JE.game.start('ciclovia', 1, { seed: 1, nov: NOVEDADES[0] }); await espera(200); JE.game.paused = true; const C = JE.game.mode, cs = C.sub; let k = 0;
    while (!cs.done && k < 60 * 200) { if (k % 4 === 0) cs.bot(); C.update(1 / 60); k++; } JE.game.paused = false;
    out.carrera = { metros: Math.round(cs.metros), seg: Math.round(k / 60), giros: (cs.giros || []).length, bien: cs.giroOk, vidas: cs.vidas, vel: Math.round(cs.rapidez() * 3.6) };
    /* 7) el mundo 3D único */
    JE.game.stop(); JE.game.start('usuario', 1, { seed: 5, nov: NOVEDADES[0], free: true }); await espera(300); out.gl = JE.mundo3d.ok();
    if (out.gl) { const R3 = JE.game.mode.ride; JE.mundo3d.poner('tercera'); await espera(700); const q = R3.w2s(R3.p.x + Math.cos(R3.p.a) * 60, R3.p.y + Math.sin(R3.p.a) * 60), dd = R3.girarDir({ x: 0, y: -1, m: 1 });
      out.gl3 = { dibuja: !!JE.mundo3d.vp && !(JE.errors || []).some(e => /3d:/.test(e)), proyecta: q.x > 0 && q.x < View.w && q.y > 0 && q.y < View.h, adelante: Math.cos(Math.atan2(dd.y, dd.x) - JE.mundo3d.yaw) > .99, mallas: JE.mundo3d.mallas.size };
      JE.mundo3d.poner('primera'); await espera(300); out.gl3.primera = !(JE.errors || []).some(e => /3d:/.test(e)); JE.mundo3d.poner(null); }
    JE.game.stop(); UI.go('sHome'); return out;
  });
  ok(r.subpasos > .19 && r.subpasos < .21, 'subpasos: un cuadro lento de 200 ms hace avanzar el juego ' + r.subpasos + ' s (antes 0,05: cámara lenta)');
  ok(r.crucero.acelera && r.crucero.frena && r.crucero.boton, '⏫ acelerador fijo: va a fondo sin tocar nada y al soltarlo frena ' + JSON.stringify(r.crucero));
  ok(r.liberado, 'todo liberado desde el principio: los oficios y sus turnos');
  ok(r.enEstacion && r.oficios >= 7 && r.mismo && r.volvio, 'oficios en el valle: en la estación y en Casa EnCicla (' + r.oficios + ' botones), el mismo módulo del menú y el regreso al mismo punto');
  ok(r.trucos.zonas >= 5 && r.trucos.accion && r.trucos.puntos, 'zonas de trucos en el valle ' + JSON.stringify(r.trucos));
  ok(r.carrera.metros >= 700 && r.carrera.giros >= 2 && r.carrera.bien >= 1 && r.carrera.vidas > 0 && r.carrera.vel >= 55, 'carrera de la ciclorruta con giros, tramos estrechos y zonas de trucos ' + JSON.stringify(r.carrera));
  ok(!r.gl || (r.gl3.dibuja && r.gl3.proyecta && r.gl3.adelante && r.gl3.primera && r.gl3.mallas > 3), 'mundo 3D único: tercera y primera persona sobre el mismo mapa, nombres proyectados y joystick según la cámara ' + JSON.stringify(r.gl3 || 'sin WebGL'));
};

/* ronda 3.2 (Claude): los modos a medias pulidos, el transporte en el mundo 3D, el freerun de la Comuna 13 con gestos y
   el valle que recuerda (radares, habilidades, diario y miradores) */
module.exports.v5 = async function (p, ok) {
  console.log('V5) ronda 3.2 · Run 3D y turnos con puntos, transporte 3D, freerun y gestos, radares, habilidades, diario y miradores');
  const r = await p.evaluate(async () => {
    const out = {}, espera = ms => new Promise(s => setTimeout(s, ms)), _now = Cal.now; Cal.now = () => new Date(2026, 10, 18, 12, 0);
    /* 1) Run 3D del menú: puntos desde el primer segundo y teclas que funcionan */
    JE.game.stop && JE.game.stop(); JE.game.start('run3d', 1, { seed: 9, nov: NOVEDADES[0] }); await espera(1500); const R3 = JE.game.mode.sub;
    out.run3d = { puntos: JE.game.mode.score, hojas: R3.hojas }; const l0 = R3.lane; JE.game.key({ code: 'ArrowRight', repeat: false, preventDefault() { } }); out.run3d.tecla = R3.lane !== l0 || l0 === 1;
    /* 2) Bodega: los puntos del minijuego de la fase llegan al turno */
    JE.game.stop(); JE.game.start('bodega', 1, { seed: 9, nov: NOVEDADES[0] }); await espera(300); const B = JE.game.mode; let enJuego = 0;
    for (let i = 0; i < 60 && B.sub; i++) { B.sub.bot(0); B.update(1 / 30); enJuego = Math.max(enJuego, B.info().score); }
    out.bodega = { enJuego, alFinal: B.score, errores: (JE.errors || []).filter(e => /loop|bodega/i.test(e)).length };
    /* 3) el freerun de la Comuna 13: el piloto llega al mirador saltando, deslizándose y con trucos */
    JE.game.stop(); JE.game.start('freerun', 1, { seed: 3, nov: NOVEDADES[0] }); await espera(200); JE.game.paused = true; const F = JE.game.mode, fs = F.sub; let k = 0;
    while (!fs.done && k < 60 * 150) { if (k % 3 === 0) fs.bot(); F.update(1 / 60); k++; } JE.game.paused = false;
    out.freerun = { llego: !!fs.llego, seg: Math.round(k / 60), estrellas: fs.estrellas, trucos: fs.trucos, tropiezos: fs.tropiezos, caidas: fs.caidas, puntos: F.score };
    /* 4) los gestos */
    const G = JE.gesto, linea = (dx, dy) => Array.from({ length: 8 }, (_, i) => [200 + dx * i / 7, 500 + dy * i / 7]), circulo = Array.from({ length: 26 }, (_, i) => [200 + Math.cos(i / 25 * 6.6) * 40, 500 + Math.sin(i / 25 * 6.6) * 40]);
    out.gestos = [G.leer(linea(0, -80)), G.leer(linea(90, 0)), G.leer(linea(-90, 5)), G.leer(linea(0, 70)), G.leer(circulo), G.leer([[200, 500], [203, 502]])].join(',');
    JE.game.stop(); JE.game.start('ciclovia', 1, { seed: 1, nov: NOVEDADES[0] }); await espera(200); const cs = JE.game.mode.sub, c0 = cs.carril;
    cs.pointer('down', 0, 0, 150, 500); cs._traz = linea(90, 0).map(([x, y]) => [x - 50, y]); cs.pointer('up', 0, 0, 240, 500); out.gestoCarril = cs.carril === Math.min(1, c0 + 1);
    /* 5) el valle: la Comuna 13 con su freerun, un radar con récord, el mirador y el diario */
    JE.game.stop(); JE.game.start('usuario', 1, { seed: 5, nov: NOVEDADES[0], free: true, bici: 'propia' }); await espera(400); Cal.now = _now; const M = JE.game.mode, R = M.ride;
    const zc = Trucos.zonas().find(z => z.id === 'comuna13'); R.p.x = zc.x; R.p.y = zc.y; R.p.v = 0; await espera(60); const af = M.actions().find(a => a.id === 'freerun'); out.valleFreerun = !!af; if (af) { af.fn(); out.valleFreerun = M.sub instanceof JE.MGFreerun; M.sub.done = true; M.update(1 / 30); }
    const rd = Radares.lista()[0]; R.p.x = rd.x - Math.cos(rd.a) * 60; R.p.y = rd.y - Math.sin(rd.a) * 60; R.p.a = rd.a; R.p.v = R.stats_().max * .9;
    Object.assign(Input.joy, { on: true, id: 99, ox: 200, oy: 600, x: 200 + Math.cos(rd.a) * 46, y: 600 + Math.sin(rd.a) * 46 }); await espera(1500); Input.joy.on = false;
    out.radar = { radares: Radares.lista().length, record: Habil.d().radares[rd.id] | 0, km: +Habil.d().km.toFixed(2) };
    const mi = Mirador.lista()[0]; R.p.x = mi.x; R.p.y = mi.y; R.p.v = 0; await espera(80); const am = M.actions().find(a => a.id === 'mirador'); out.mirador = { accion: !!am, miradores: Mirador.lista().length };
    if (am && JE.mundo3d.ok()) { am.fn(); await espera(900); out.mirador.gira = !!JE.mundo3d.mirador && JE.mundo3d.activo(R) && !(JE.errors || []).some(e => /3d/.test(e)); const up = M.actions().find(a => a.id === 'up'); if (up) up.fn(); await espera(100); out.mirador.sale = !JE.mundo3d.mirador && !M.sitting; }
    /* 6) el transporte en 3D: viaducto, estaciones y cables construidos sin errores */
    if (JE.mundo3d.ok()) { const st = JE.map.lineA.st.find(s => s.alto), q = JE.map.at(JE.map.lineA, st.s); R.p.x = q.x + 40; R.p.y = q.y; JE.mundo3d.poner('tercera'); await espera(900);
      out.t3d = { piezas: JE.map.altG.size, cables: (JE.mundo3d._cables || {}).n | 0, sinError: !(JE.errors || []).some(e => /3d/.test(e)) }; JE.mundo3d.poner(null); }
    out.diario = Diario.lista().length; UI.diario(); out.modal = document.querySelectorAll('#mBody .opt').length; UI.closeModal();
    JE.game.stop(); UI.go('sHome'); return out;
  });
  ok(r.run3d.puntos > 0 && r.run3d.hojas >= 3 && r.run3d.tecla, 'Run 3D: puntos desde el primer segundo (fila de salida) y las teclas funcionan ' + JSON.stringify(r.run3d));
  ok(r.bodega.enJuego > 0 && r.bodega.alFinal > 0 && !r.bodega.errores, 'turnos: los puntos del minijuego de la fase llegan a la ★ (Bodega) ' + JSON.stringify(r.bodega));
  ok(r.freerun.llego && r.freerun.estrellas >= 10 && r.freerun.trucos >= 2 && r.freerun.caidas <= 1, 'freerun de la Comuna 13: el piloto llega al mirador ' + JSON.stringify(r.freerun));
  ok(r.gestos === 'arriba,der,izq,abajo,giro,' && r.gestoCarril, 'gestos: ↑ → ← ↓ y el círculo, y en la ciclorruta deslizar cambia de carril (' + r.gestos + ')');
  ok(r.valleFreerun, 'en el valle: la Comuna 13 es zona de trucos y abre el freerun');
  ok(r.radar.radares >= 6 && r.radar.record > 10 && r.radar.km > 0, '📸 radares en las ciclorrutas con récord y 💪 Pedaleo que suma km ' + JSON.stringify(r.radar));
  ok(r.mirador.accion && r.mirador.miradores >= 4 && (r.mirador.gira === undefined || (r.mirador.gira && r.mirador.sale)), '🔭 miradores: la cámara gira sobre la ciudad y se sale bien ' + JSON.stringify(r.mirador));
  ok(!r.t3d || (r.t3d.piezas > 50 && r.t3d.cables > 0 && r.t3d.sinError), 'mundo 3D: viaducto, estaciones, puentes y metrocables ' + JSON.stringify(r.t3d || 'sin WebGL'));
  ok(r.diario >= 2 && r.modal === 4, '📔 el diario anota solo y muestra las 4 habilidades (' + r.diario + ' notas)');
};
