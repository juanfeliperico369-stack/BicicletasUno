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
