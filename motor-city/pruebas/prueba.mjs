#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · PRUEBAS DEL MOTOR
     node pruebas/prueba.mjs               pruebas de datos, consultas, redes, tiempo, transporte, tráfico, física y vehículos (Node)
     node pruebas/prueba.mjs --navegador   además, el banco de pruebas en Chromium: las 8 vistas y el pixel, Run en la ciclovía
                                           (entrar y salir en el mismo punto) y el tiempo de dibujo con la CPU 4× más lenta
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import crypto from 'node:crypto'; import zlib from 'node:zlib'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url);
let bien = 0, mal = 0; const t0 = Date.now();
const ok = (c, msg, extra) => { if (c) { bien++; console.log('  ✓ ' + msg + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); } else { mal++; console.log('  ✗ ' + msg + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); } };
const ctx = { console, require, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
if (!fs.existsSync(path.join(RAIZ, 'dist/motor.js'))) { console.error('Falta dist/motor.js: node herramientas/construir.mjs'); process.exit(1); }
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8'), ctx);
const MC = ctx.MC, cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/medellin.json'), 'utf8')), bin = fs.readFileSync(path.join(RAIZ, 'datos/medellin/mundo.mc4'));
const M = new MC.Mundo(new Uint8Array(bin), cfg);

console.log('1) Mundo 2.0 (contenedor MC4)');
ok(MC.version === JSON.parse(fs.readFileSync(path.join(RAIZ, 'VERSION.json'))).version, 'la versión del motor es la de VERSION.json', MC.version);
const capas = Object.keys(M.meta.capas); ok(capas.length >= 16, 'trae ' + capas.length + ' capas');
let integras = 0; for (const n of capas) { const c = M.meta.capas[n], raw = zlib.inflateRawSync(bin.subarray(M.base + c.o, M.base + c.o + c.n)); if (raw.length === c.raw && crypto.createHash('sha1').update(raw).digest('hex').slice(0, 12) === c.sha1) integras++; }
ok(integras === capas.length, 'cada capa se infla completa y su huella sha1 coincide', integras + '/' + capas.length);
ok(M.W === 4316 && M.H === 4921 && M.tile === 10, 'casillas de 10 m: 4.316 × 4.921');
ok(M.meta.atribucion.some(a => /OpenStreetMap/.test(a)) && M.meta.atribucion.some(a => /SRTM/.test(a)), 'atribución de OpenStreetMap, capas oficiales y SRTM');

console.log('2) Coordenadas y consultas');
const col = M.buscar('coltejer'), g2 = M.metrosAGeo(col.x, col.y), back = M.geoAMetros(g2.lat, g2.lon);
ok(Math.hypot(back.x - col.x, back.y - col.y) < .01, 'metros → lat/lon → metros vuelve al mismo punto');
ok(Math.abs(g2.lat - 6.2497) < .004 && Math.abs(g2.lon + 75.5665) < .004, 'el Coltejer está donde es (6,25 N, −75,57)', g2);
ok(M.barrio(col.x, col.y) === 'La Candelaria' && /Comuna 10/.test(M.comuna(col.x, col.y)) && M.municipio(col.x, col.y) === 'Medellín', 'barrio, comuna y municipio del Coltejer', M.lugarTexto(col.x, col.y));
ok(M.zona(col.x, col.y) === 'centro', 'zona de estilo del centro: «centro»');
const c0 = M.cota(col.x, col.y); ok(c0 > 1400 && c0 < 1600, 'cota del centro entre 1.400 y 1.600 m', Math.round(c0));
const sd = M.geoAMetros(6.2945, -75.5428); ok(M.cota(sd.x, sd.y) > c0 + 200, 'Santo Domingo (Parque Biblioteca España), en la ladera, más de 200 m por encima del centro', Math.round(M.cota(sd.x, sd.y)));
ok(M.calle(col.x, col.y) !== '', 'la calle más cercana tiene nombre', M.calle(col.x, col.y));

console.log('3) Edificios, sitios, pasos y transporte');
const ED = M._ed(); let tot = 0; for (let r = 0; r < ED.nx * ED.ny; r++) tot += ED.cnt[r];
ok(tot === 639457, 'las 639.457 huellas reales están indexadas', tot);
const cerca = M.edificiosEn(col.x - 150, col.y - 150, col.x + 150, col.y + 150); ok(cerca.length > 40 && cerca.every(e => e.h > 0 && isFinite(e.x)), 'edificios alrededor del Coltejer con altura', cerca.length);
const S = M.sitios(); ok(S.S.length === 1203 && S.E.length === 5314, '1.203 sitios y 5.314 edificios con forma real');
ok(S.E.some(e => /Coltejer/.test(e.nombre) && e.partes && e.h > 100), 'el Coltejer modelado por partes y más de 100 m de alto');
const P = M.pasos(); ok(P.length > 2000 && P.filter(q => q.tipo === 'viaducto').length >= 3 && P.some(q => q.tipo === 'tunel'), 'puentes, deprimidos y viaducto', { pasos: P.length, viaducto: P.filter(q => q.tipo === 'viaducto').length });
const LA = M.transporte.lineas.find(l => l.id === 'A'); let alto = 0; for (let i = 0; i < LA.eje.length; i += 2) if (M.nivel(LA.eje[i], LA.eje[i + 1]) > 0) alto++;
ok(alto > 80, 'la Línea A va en viaducto por el centro (nivel firmado por casilla)', alto);
ok(M.transporte.lineas.length >= 30 && M.transporte.encicla.length === 133 && M.hitos.length >= 25 && M.lugares.length >= 40, 'red de transporte, 133 estaciones EnCicla, hitos y lugares', { lineas: M.transporte.lineas.length, hitos: M.hitos.length, lugares: M.lugares.length });

console.log('4) Redes y recorridos');
const rc = M.red('ciclo'), km = rc.aristas.reduce((a, e) => a + e.largo, 0) / 1000; ok(km > 100, 'red de ciclorrutas', Math.round(km) + ' km');
const rr = M.red('rueda'), comp = rr.componentes(); ok(comp.tam[0] > 30000, 'la red de calles y ciclorrutas está conectada', comp.tam[0] + ' nodos en la mayor');
const pob = M.buscar('Poblado'), a1 = rr.cercana(col.x, col.y, 80), a2 = rr.cercana(pob.x, pob.y, 120), cam = rr.camino(a1.arista.a, a2.arista.a);
const largo = cam ? cam.reduce((a, q) => a + q.arista.largo, 0) : 0; ok(cam && largo > 2000 && largo < 9000, 'ruta (A*) del Coltejer a la estación Poblado', Math.round(largo) + ' m');
const eC = rr.aristas.filter(e => e.k === MC.VIA.CICLO && e.largo > 200)[5], q0 = eC.t.at(eC.largo / 2), Rec = new MC.Recorrido(rr, q0.x, q0.y, q0.a); Rec.alargar(3000);
ok(Rec.largo > 2500 && Rec.trazo.p.every(v => isFinite(v)), 'un recorrido sigue la vía real 3 km desde una ciclorruta', { m: Math.round(Rec.largo), cruces: Rec.cruces.length });
const cu = new MC.Cuerpo(M, { x: q0.x, y: q0.y, a: q0.a, veh: 'bici' }), sg = new MC.SeguirRuta(M, cu, { red: 'rueda' }); let ok2 = true; const x0 = cu.x;
for (let i = 0; i < 1500; i++) { sg.paso(1 / 30, { acel: 1 }); if (!isFinite(cu.x) || !isFinite(sg.s)) { ok2 = false; break; } }
ok(ok2 && Math.hypot(cu.x - x0, cu.y - q0.y) > 50 && sg.trazo.largo < 3000, 'seguir la ruta 50 s: avanza, alarga adelante y olvida atrás', { s: Math.round(sg.s), camino: Math.round(sg.trazo.largo) });

console.log('5) Tiempo, calendario, cielo y clima');
const F = MC.Calendario.festivos(2026); ok(F['2026-12-08'] && F['2026-11-16'] && F['2026-04-03'] && F['2026-01-12'], 'festivos de Colombia 2026 (Inmaculada, Cartagena el lunes 16, Viernes Santo, Reyes el lunes 12)');
const dia = new Date(2026, 10, 24); ok(MC.Cielo.en(dia, 12).dia > .9 && MC.Cielo.en(dia, 0).noche > .9 && MC.Cielo.sol(dia, 12).alt > 1.0, 'mediodía con sol alto y medianoche oscura');
const cl1 = new MC.Clima(cfg), cl2 = new MC.Clima(cfg), rj = new MC.Reloj({ fecha: '2026-10-20T16:00', min: 16 * 60 }); cl1.actualizar(rj); cl2.actualizar(rj); ok(cl1.tipo === cl2.tipo && cl1.lluvia === cl2.lluvia, 'el clima es el mismo para todos a la misma fecha y hora', cl1.texto());
cl1.forzar('tormenta'); cl1.actualizar(rj); ok(cl1.tipo === 'tormenta' && cl1.lluvia > .9, 'un juego puede forzar el clima');

console.log('6) Transporte con horario real');
const Tr = new MC.Transporte(M, cfg), mar = new Date(2026, 10, 24), dom = new Date(2026, 10, 22);
const v8 = Tr.vehiculos(mar, 8 * 3600), v2 = Tr.vehiculos(mar, 2 * 3600), trenesA = v8.filter(v => v.linea === 'A');
ok(trenesA.length >= 8, 'martes 8 a. m.: trenes de la Línea A en servicio', trenesA.length);
ok(v2.filter(v => v.clase === 'metro').length === 0, 'a las 2 a. m. no hay metro');
ok(Tr.vehiculos(dom, 4.75 * 3600).filter(v => v.clase === 'metro').length === 0 && Tr.vehiculos(mar, 4.75 * 3600).filter(v => v.clase === 'metro').length > 0, 'domingo abre a las 5 a. m. y entre semana a las 4:30');
ok(trenesA.every(v => LA && M.nivel(v.x, v.y) <= 0 || v.z > 0), 'los trenes del viaducto van en alto');
const prox = Tr.proximo('A', 'Niquía', mar, 8 * 3600 + 17, 1); ok(prox !== null && prox <= 400, 'próximo tren desde Niquía', Math.round(prox) + ' s');
ok(v8.some(v => v.clase === 'cable') && v8.some(v => v.clase === 'brt') && v8.some(v => v.clase === 'tram'), 'cables, Metroplús y tranvía andando');

console.log('7) Tráfico y semáforos');
const Tf = new MC.Trafico(M, { n: 30, peatones: 20, red: 'rueda' }), L = Tf.luces(); ok(L.size > 100, 'semáforos reales pegados a sus cruces', L.size);
const [n1] = L.keys(), S1 = L.get(n1), est = new Set(); for (let s = 0; s < 60; s += 1) est.add(Tf.luz(n1, S1.eje, s));
ok(est.has('verde') && est.has('amarillo') && est.has('rojo'), 'cada semáforo pasa por verde, amarillo y rojo');
let cruz = 0; for (let s = 0; s < 60; s += 1) if (Tf.luz(n1, S1.eje, s) === 'verde' && Tf.luz(n1, S1.eje + Math.PI / 2, s) === 'verde') cruz++; ok(cruz === 0, 'nunca están en verde las dos calles que se cruzan');
for (let i = 0; i < 300; i++) Tf.paso(1 / 15, col.x, col.y, 8 * 3600 + i / 15); ok(Tf.agentes.length >= 25 && Tf.agentes.every(a => isFinite(a.x) && isFinite(a.v)), 'carros, taxis, motos y busetas andando alrededor', Tf.agentes.length);

console.log('8) Personaje, vehículos y física');
const Vs = [...MC.Vehiculos.lista.values()]; ok(Vs.length >= 34 && Vs.every(v => v.vmax > 0 && (v.suelo || []).length === 20), 'registro único de vehículos con sus cifras', Vs.length);
ok(['pie', 'bici', 'ebike', 'patinete', 'skate', 'patines', 'monopatin', 'moto', 'carro', 'camion', 'avioneta', 'lancha', 'metro', 'cable'].every(id => MC.Vehiculos.lista.has(id)), 'a pie, micromovilidad, motor, aire, agua y transporte');
ok(MC.Vehiculos.get('ebike').manubrio && MC.Vehiculos.get('ebike').de === 'bici', 'un vehículo hereda lo que no dice de su base');
ok(['quieto', 'camina', 'corre', 'pedalea', 'impulsa', 'patina', 'tabla', 'sentado', 'salta', 'cae'].every(e => Object.values(MC.Personaje.pose(e, 1.3)).every(v => !Array.isArray(v) || v.every(isFinite))), 'la pose del personaje en todos los estados');
const via = M.viaCercana(col.x, col.y, 80), B = new MC.Cuerpo(M, { x: via.x, y: via.y, a: via.ang, veh: 'bici' }); for (let i = 0; i < 300; i++) B.actualizar(1 / 30, { acel: 1 });
ok(B.v > 3, 'la bici acelera por la calle', B.v.toFixed(1) + ' m/s');
const B2 = new MC.Cuerpo(M, { x: via.x, y: via.y, a: via.ang, veh: 'pie' }); B2.actualizar(1 / 30, { salto: true }); let maxZ = 0; for (let i = 0; i < 60; i++) { B2.actualizar(1 / 30, {}); maxZ = Math.max(maxZ, B2.z); } ok(maxZ > .2 && B2.z === 0 && !B2.enAire, 'saltar y caer', maxZ.toFixed(2) + ' m');
let agua = null; { const R = M.capa('info').rio; for (let i = 0; i + 1 < R.length && !agua; i += 2) for (const [dx, dy] of [[0, 0], [8, 0], [-8, 0], [0, 8], [0, -8]]) { const x = R[i] + dx, y = R[i + 1] + dy, a = M.suelo(x, y) === MC.TT.WATER && MC.Terreno.aguaEn(M, x, y); if (a && a.prof > 1) { agua = { x, y }; break; } } }   // lo hondo del río Medellín (la orilla se vadea)
if (agua) { const B3 = new MC.Cuerpo(M, { x: agua.x - 60, y: agua.y, a: 0, veh: 'carro' }); ok(!B3.puede(agua.x, agua.y) && new MC.Cuerpo(M, { veh: 'lancha' }).puede(agua.x, agua.y), 'el carro no entra al río; la lancha sí'); }

/* puentes por superficies: se sube por la rampa al tablero y por debajo se pasa sin subir */
{ const Pq = M.pasos().filter(q => q.tipo === 'puente' && !q.peatonal && q.nivel >= 1 && q.largo > 80 && q.largo < 150 && q.ancho > 7 && q.ancho < 14).slice(1, 6); let arriba = 0, debajo = 0;
  for (const q of Pq) { const T = new MC.Trazo(q.p), a = T.at(.5), b = T.at(4), C = new MC.Cuerpo(M, { x: a.x, y: a.y, a: Math.atan2(b.y - a.y, b.x - a.x), veh: 'carro' }); let mx = 0;
    for (let i = 0; i < 900; i++) { const pr = T.proyectar(C.x, C.y), q2 = T.at(Math.min(q.largo, pr.s + 6)); C.actualizar(1 / 60, { acel: .7, dir: { x: q2.x - C.x, y: q2.y - C.y, m: 1 } }); mx = Math.max(mx, C.zPaso); if (pr.s > q.largo - 1) break; }
    if (Math.abs(mx - q.nivel * 4.5) < .05) arriba++;
    const m = T.at(q.largo / 2), nx = -Math.sin(m.a), ny = Math.cos(m.a), D = new MC.Cuerpo(M, { x: m.x + nx * (q.ancho / 2 + 4), y: m.y + ny * (q.ancho / 2 + 4), a: Math.atan2(-ny, -nx), veh: 'pie' }); let md = 0; for (let i = 0; i < 120; i++) { D.actualizar(1 / 60, { acel: 1 }); md = Math.max(md, D.zPaso); } if (md === 0) debajo++; }
  ok(Pq.length === 5 && arriba === 5 && debajo === 5, 'puentes: el carro sube por la rampa al tablero y el peatón pasa por debajo', { arriba, debajo }); }
{ const via2 = M.viaCercana(col.x, col.y, 80), J = new MC.Cuerpo(M, { x: via2.x, y: via2.y, a: via2.ang, veh: 'pie' }); J.actualizar(1 / 60, {}); J.enAire = true; J.z = .01; J.vz = -.1; J.coyote = .1; J.actualizar(1 / 60, { salto: true });
  ok(J.vz > 3, 'salto con tiempo de coyote (justo después de dejar el borde)'); }
{ const st = { v: 0 }; let x = 0; for (let i = 0; i < 120; i++) x = MC.resorte(x, 10, st, .2, 1 / 60); const st2 = { v: 0 }; let y = 0; for (let i = 0; i < 30; i++) y = MC.resorte(y, 10, st2, .2, 1 / 15);
  const rd = new MC.ResDinamica({ objetivo: 16.7 }); for (let i = 0; i < 200; i++) rd.medir(40); const lento = rd.escala; for (let i = 0; i < 600; i++) rd.medir(5);
  let pasos = 0; const bu = new MC.Bucle({ actualizar: () => pasos++, dibujar: () => {} }); bu.corre = true; bu.t0 = 0; bu._cuadro(1000 / 30); bu._cuadro(1000 / 30 + 5000);
  ok(Math.abs(x - 10) < .01 && Math.abs(y - x) < .05 && lento < .6 && rd.escala > .95 && pasos === 2 + 5, 'resortes iguales a 60 y a 15 cuadros por segundo; resolución dinámica; paso fijo con tope', { lento: +lento.toFixed(2), pasos }); }
console.log('9) Huevos, guardado y compatibilidad');
MC.huevos.poner({ id: 'prueba', x: col.x, y: col.y, radio: 30 }); const h1 = MC.huevos.revisar({ x: col.x + 5, y: col.y }), h2b = MC.huevos.revisar({ x: col.x + 5, y: col.y }); ok(h1.length === 1 && h2b.length === 0, 'un huevo de pascua se cumple una sola vez');
const sv = MC.guardado.completar({ a: 1, b: { c: 2 } }, { a: 0, b: { c: 0, d: 5 }, e: [1] }); ok(sv.a === 1 && sv.b.c === 2 && sv.b.d === 5 && sv.e[0] === 1, 'guardado sin romper: lo nuevo con su valor por defecto');
const VC = MC.ValleCompat.desdeMundo(M, 16); ok(VC.suelo(1477, 2334) === M.sueloCasilla(1477, 2334) && Math.abs(VC.pxAMetros(16) - 10) < 1e-9, 'consultor 1.x (Valle) sobre el mundo 2.0, en px de EnCicla');
const vjs = fs.readFileSync(path.join(RAIZ, 'js/valle.js'), 'utf8'); ok(/version: '1\.2\.0'/.test(vjs), 'js/valle.js sigue siendo el lector 1.2.0 que incluye Juega EnCicla');
const OR = JSON.parse(fs.readFileSync(path.join(RAIZ, 'run/ORIGEN.json'), 'utf8')); ok(OR.parches.length >= 12 && fs.existsSync(path.join(RAIZ, 'run/run-scooter.js')), 'Run Scooter importado con sus parches', OR.commit);


console.log('10) Ciencia, química y economía');
const Q = MC.Quim, Fz = MC.Fis;
ok(Math.abs(Q.masaMolar('H2O') - 18.015) < .01 && Math.abs(Q.masaMolar('Ca(OH)2') - 74.09) < .02 && Math.abs(Q.masaMolar('C8H18') - 114.23) < .02, 'masa molar de fórmulas (agua, cal apagada, octano)');
ok(Q.balancear('C8H18 + O2 -> CO2 + H2O').coef.join(',') === '2,25,16,18' && Q.balancear('Fe + O2 -> Fe2O3').coef.join(',') === '4,3,2', 'balanceo exacto de ecuaciones', Q.balancear('C8H18 + O2 -> CO2 + H2O').texto);
const isa = Fz.atmosfera(1500); ok(Math.abs(isa.rho - 1.058) < .01 && Math.abs(isa.p - 84556) < 200, 'atmósfera estándar a 1.500 m (densidad y presión)', { rho: isa.rho.toFixed(3) });
ok(Math.abs(Fz.frenada(27.78, .8) - 49.2) < .5 && Math.abs(Q.gas({ V: .0224, n: 1, T: 273.15 }) - 101382) < 200, 'frenada de 100 km/h con μ 0,8 y gas ideal');
ok(Math.abs(MC.Termo.rocio(25, 60) - 16.7) < .3 && Math.abs(MC.Termo.indiceCalor(32, 70) - 40.6) < 1.5 && MC.Termo.sensacionViento(-5, 30) < -11, 'punto de rocío, índice de calor y sensación térmica');
const ruido3 = new MC.Ruido(3); let mn = 9, mx = -9; for (let i = 0; i < 2000; i++) { const v = ruido3.fbm(i * .37, i * .11); mn = Math.min(mn, v); mx = Math.max(mx, v); } ok(mn > -1 && mx < 1 && ruido3.n2(1.5, 2.5) === new MC.Ruido(3).n2(1.5, 2.5), 'ruido coherente acotado y determinista');
const pd = MC.poissonDisco(200, 200, 10, 4); let minD = 1e9; for (let i = 0; i < pd.length; i++) for (let j = i + 1; j < pd.length; j++) minD = Math.min(minD, Math.hypot(pd[i][0] - pd[j][0], pd[i][1] - pd[j][1])); ok(pd.length > 150 && minD >= 10 - 1e-9, 'muestreo de Poisson sin puntos amontonados', pd.length);
const lib = new MC.Libro(); lib.mover('mundo', 'ana', 500000); lib.mover('ana', 'tienda', 120000); ok(lib.saldo('ana') === 380000 && lib.cuadra() && !lib.mover('ana', 'x', 9e9), 'libro de partida doble: cuadra y no deja sobregiros');
ok(MC.Dinero.repartir(1000, [1, 1, 1]).reduce((a, b) => a + b) === 1000, 'repartir dinero en partes exactas');
const mer = new MC.Mercado({ nombre: 'café', a: 100, b: 2, c: 10, d: 1 }); ok(Math.abs(mer.equilibrio().P - 30) < 1e-9 && Math.abs(MC.Finanzas.cuota(1e6, .01, 12) - 88848.79) < .5, 'equilibrio de mercado y cuota de un préstamo');
const tirv = MC.Finanzas.tir([-1000, 300, 400, 500]); ok(Math.abs(tirv - .0889633947) < 1e-4, 'tasa interna de retorno', tirv.toFixed(4));
console.log('11) Seres, vehículos, IA, interiores y música');
const yo = new MC.Seres.Persona({ sexo: 'f', edad: 30, estatura: 1.65, masa: 60, forma: .5 });
ok(Math.round(yo.tmb) === 1320 && Math.abs(yo.fcMax - 187) < .01 && yo.vCamina > 1.2 && yo.vCamina < 1.7, 'persona: metabolismo (Mifflin), pulso máximo (Tanaka) y paso por Froude', { tmb: Math.round(yo.tmb), camina: yo.vCamina.toFixed(2) });
const az = MC.mulberry32(5), pa = MC.Seres.Genetica.azar(az, 'm'), ma = MC.Seres.Genetica.azar(az, 'f'), hijo = MC.Seres.Genetica.cruzar(pa, ma, az);
ok(Object.keys(MC.Seres.GENES).every(k => hijo[k].every((par, i) => pa[k][i].includes(par[0]) && ma[k][i].includes(par[1]))), 'genética: cada alelo del hijo viene del padre o de la madre');
const perro = MC.Seres.Animal.crear('perro_criollo'), gato = MC.Seres.Animal.crear('gato'); ok(perro.metabolismoW > 20 && perro.metabolismoW < 45 && perro.vmax > gato.vmax && MC.Seres.Animal.marcha(1, .5) === 'paso' && MC.Seres.Animal.marcha(6, .5) === 'galope', 'animales: Kleiber, velocidad por masa y marcha por Froude');
const al1 = MC.Seres.Animal.criatura({ masa: 200, patas: 6, gravedad: 9.8 }), al2 = MC.Seres.Animal.criatura({ masa: 200000, patas: 2, gravedad: 30 }); ok(al1.verosimil && !al2.verosimil, 'criaturas: ley cuadrado‑cubo con la gravedad');
const d1 = MC.Taller.disenar({ id: 'prueba_auto', masa: 1200, potenciaKW: 80, cd: .3, area: 2.1 }); ok(d1.vmax * 3.6 > 170 && d1.vmax * 3.6 < 230 && d1.ceroCien > 6 && d1.ceroCien < 16 && d1.consumo > 3 && d1.consumo < 9, 'taller: un carro de 80 kW con cifras reales', { vmax: Math.round(d1.vmax * 3.6), cien: d1.ceroCien.toFixed(1), l100: d1.consumo.toFixed(1) });
const dA = MC.Taller.disenar({ tipo: 'avion', masa: 750, potenciaKW: 120, alasM2: 16.2, clMax: 1.6, cd: .03, area: 16 }); ok(dA.vPerdida > 18 && dA.vPerdida < 30, 'avioneta: velocidad de pérdida', (dA.vPerdida * 3.6).toFixed(0) + ' km/h');
const vReg = MC.Taller.registrar(d1); const Bc = new MC.Cuerpo(M, { x: via.x, y: via.y, a: via.ang, veh: vReg.id }); for (let i = 0; i < 200; i++) Bc.actualizar(1 / 30, { acel: 1 }); ok(Bc.v > 5 && isFinite(Bc.x), 'el carro diseñado se maneja con el modelo de bicicleta', Bc.v.toFixed(1) + ' m/s');
ok(Math.abs(MC.IA.vCurva(1 / 50, .9) - 21.0) < .2 && MC.IA.selector(() => 'falla', () => 'ok')({}) === 'ok', 'IA: velocidad segura en curva y árbol de comportamiento');
const pobl = new MC.Poblacion(M, { n: 20, centro: col, radio: 500, semilla: 3 }), rel2 = new MC.Reloj({ fecha: '2026-11-24', min: 8 * 60, vel: 1 }); for (let i = 0; i < 120; i++) { pobl.paso(.5, rel2, col.x, col.y); rel2.avanzar(.5); } ok(pobl.gente.length >= 15 && pobl.gente.some(p => p.act === "trabajo" || p.ruta), 'población con rutinas: a las 8 a. m. la gente sale a trabajar', pobl.resumen());
const ed0 = M.edificiosEn(col.x - 100, col.y - 100, col.x + 100, col.y + 100).find(e => e.hw > 5 && e.hd > 4), pl = MC.Interiores.generar(ed0); const area = pl.cuartos.reduce((a, c) => a + c.w * c.h, 0);
ok(Math.abs(area - pl.ancho * pl.fondo) < 1 && pl.puertas.length >= pl.cuartos.length && pl.muebles.length > 3, 'interior procedural: los cuartos llenan la planta y todos tienen puerta', { prog: pl.programa, cuartos: pl.cuartos.length, muebles: pl.muebles.length });
const pz = MC.Musica.componer({ estilo: 'lofi', tema: 'himno_alegria', semilla: 2, compases: 8 }), pz2 = MC.Musica.componer({ estilo: 'lofi', tema: 'himno_alegria', semilla: 2, compases: 8 });
ok(pz.eventos.length > 50 && JSON.stringify(pz.eventos) === JSON.stringify(pz2.eventos) && pz.eventos.every(e => e.n >= 24 && e.n <= 108 && e.t >= 0), 'música: compone determinista y en rango', { eventos: pz.eventos.length, bpm: pz.bpm });
ok(['electronica', 'techno', 'synthwave', 'rock', 'jazz', 'lofi', 'clasica'].every(e => MC.Musica.componer({ estilo: e, compases: 4 }).eventos.length > 10) && Object.keys(MC.Musica.CLASICOS).every(t => MC.Musica.componer({ estilo: 'electronica', tema: t, compases: 4 }).eventos.some(e => e.inst === 'lead')), 'siete estilos y siete clásicos de dominio público');
const ar = MC.Musica.armonizar(MC.Musica.CLASICOS.himno_alegria); ok(ar[0].raiz % 12 === 0 && ar[ar.length - 1].raiz % 12 === 0, 'el arreglista armoniza el Himno a la alegría empezando y terminando en la tónica');
const mi = new MC.Mision({ titulo: 'x', pasos: [{ tipo: 'ir', x: 0, y: 0, radio: 5 }, { tipo: 'esperar', x: 0, y: 0, seg: 1 }], premio: 5000, libro: lib, cuenta: 'ana' }), s0 = lib.saldo('ana'); mi.actualizar(.1, { x: 1, y: 1 }); mi.actualizar(.6, { x: 1, y: 1 }); mi.actualizar(.6, { x: 1, y: 1 });
ok(mi.estado === 'cumplida' && lib.saldo('ana') === s0 + 5000, 'misión con pasos y recompensa en el libro');
console.log('12) Mundos nuevos: generados y craqueados');
const G1 = MC.Generador.mundo({ semilla: 7, ancho: 384, alto: 384, tipo: 'isla', pueblos: 3 }), G2 = MC.Generador.mundo({ semilla: 7, ancho: 384, alto: 384, tipo: 'isla', pueblos: 3 });
ok(G1.generado.edificios > 40 && G1.generado.vias > 5 && G1.edificiosEn(0, 0, G1.ancho, G1.alto).length === G1.generado.edificios && G1.red('rueda').aristas.length > 10, 'generador: isla con pueblos, calles, casas y red', { pueblos: G1.generado.pueblos.map(p => p.nombre), edificios: G1.generado.edificios, puentes: G1.generado.puentes });
ok(G1.capa('suelo').every((v, i) => v === G2.capa('suelo')[i]) && G1.cota(1000, 1000) === G2.cota(1000, 1000), 'la misma semilla da el mismo mundo');
ok(['valle', 'costa', 'montaña', 'llanura'].every(t => { const g = MC.Generador.mundo({ semilla: 3, ancho: 192, alto: 192, tipo: t, pueblos: 2 }); return g.W === 192 && isFinite(g.cota(500, 500)); }), 'cinco formas de mundo (isla, valle, costa, montaña, llanura)');
const gu = path.join(RAIZ, 'datos/guatape/mundo.mc4');
if (fs.existsSync(gu)) { const MG = new MC.Mundo(new Uint8Array(fs.readFileSync(gu))), ce = MG.geoAMetros(6.2338, -75.1590); ok(MG.vias().length > 200 && MG._ed().cuantos > 2000 && MG.cota(ce.x, ce.y) > 1800 && MG.red('rueda').aristas.length > 100 && MG.capa('suelo').filter(v => v === MC.TT.WATER).length > 1e5, 'territorio craqueado: Guatapé con su embalse, sus calles y sus casas', { vias: MG.vias().length, edificios: MG._ed().cuantos, cota: Math.round(MG.cota(ce.x, ce.y)) }); }
const CG = new MC.ClimaGlobal({ lat: 45, alt: 0 }), RJ = new MC.Reloj({ fecha: '2026-01-15', min: 600 }); CG.forzar('nieve'); for (let i = 0; i < 120; i++) { CG.actualizar(RJ, 1); RJ.avanzar(1); }
ok(CG.nieve > 0 && CG.nieveSuelo > 0 && MC.Ambiente.agarre(CG) < .6 && MC.Ambiente.estacion(new Date(2026, 0, 15), 45) === 'invierno' && MC.Ambiente.estacion(new Date(2026, 0, 15), -33) === 'verano' && MC.Ambiente.horasLuz(60, 172) > 18, 'clima global: nieve que se acumula, agarre, estaciones por hemisferio y horas de luz', CG.texto());

console.log('13) Escala, manejo, sprites, mi casa, lugares, historias, ocurrencias y cosmos');
{ const malos = MC.Escala.validar(); ok(malos.length === 0 && Math.abs(MC.Escala.proporcion('auto', 'persona') - .86) < .1 && MC.Escala.pxPorMetro(64, 3, true) === 21, 'escala: los 35 vehículos tienen medidas reales y las proporciones cuadran', malos.slice(0, 3)); }
{ const P = MC.Manejo.PERFIL.auto, c0 = MC.Manejo.curva(.08, P), c1 = MC.Manejo.curva(.5, P), c2 = MC.Manejo.curva(1, P), g0 = MC.Manejo.giroPorVelocidad(1, 0, 40, P), g1 = MC.Manejo.giroPorVelocidad(1, 40, 40, P);
  ok(c0 === 0 && c1 > 0 && c1 < .5 && c2 === 1 && g0 === 1 && g1 < .5 && Math.abs(MC.Manejo.vSegura(1 / 50, .8) - 19.8) < .1, 'manejo: zona muerta, respuesta exponencial, giro según la velocidad y velocidad segura en curva', { medio: +c1.toFixed(2), giroRapido: +g1.toFixed(2) });
  const Cb = new MC.Cuerpo(M, { x: col.x, y: col.y, veh: 'carro' }); Cb.v = 30; const e1 = MC.Manejo.aplicar({ stick: { x: 1, y: -1, m: 1 }, acel: 0, giro: 0 }, Cb, { esquema: 'volante' }); ok(e1.giro > 0 && e1.giro < .6 && e1.acel > .9, 'manejo: el volante a 108 km/h gira menos que quieto'); }
{ /* 3.0: objetos físicos: el que choca empuja según su masa; saltan, caen, ruedan con roce y se duermen quietos */
  const O = new MC.Objetos(M), e0 = rr.aristas.find(q => q.largo > 40), q = e0.t.at(e0.largo / 2), b = O.poner('balon', q.x + 1, q.y), c = O.poner('caja', q.x, q.y + 3); let alto = 0;
  for (let i = 0; i < 600; i++) { O.actualizar(1 / 60, i < 12 ? [{ x: q.x + i / 12 * .95, y: q.y, z: 0, r: .4, masa: 80, vx: 6, vy: 0 }, { x: q.x, y: q.y + 3 - .7 + i / 12 * .4, z: 0, r: .4, masa: 1200, vx: 0, vy: 3 }] : []); alto = Math.max(alto, b.z); }
  const sem = new MC.Objetos(M).sembrar(q.x, q.y, 300, 30);
  ok(Math.hypot(b.x - q.x - 1, b.y - q.y) > 1.5 && alto > .05 && b.dormido && c.dormido && Math.hypot(c.x - q.x, c.y - q.y - 3) > .3 && sem > 0, 'objetos físicos: el golpe los empuja y los levanta, caen, ruedan con roce y se duermen; la siembra pone conos, balones, canecas y cajas', { avanzó: +Math.hypot(b.x - q.x - 1, b.y - q.y).toFixed(1), alto: +alto.toFixed(2), sembrados: sem, duerme: [b.dormido, c.dormido], caja: +Math.hypot(c.x - q.x, c.y - q.y - 3).toFixed(2) }); }
{ /* 2.11: densidad dinámica del lienzo: baja si va lento y bajar sirve; si no sirve vuelve y no insiste; sube con holgura */
  const sim = (D, clave, f, seg) => { let d = D.medir(0, clave); for (let t = 0; t < seg; t += 1 / 60) { const ms = f(d); d = D.medir(ms / 1000, clave); } return d; };
  const A = new MC.DensidadLienzo({ max: 2 }), lento = sim(A, 'maqueta', d => 28 * (d / 2) ** 2 + 4, 6), recupera = sim(A, 'maqueta', () => 16.7, 40);
  const B = new MC.DensidadLienzo({ max: 2 }), terco = sim(B, 'x', () => 33.3, 8), C1 = new MC.DensidadLienzo({ max: 2, activa: false }), fija = sim(C1, 'x', () => 40, 3);
  const pasos = new MC.DensidadLienzo({ max: 2 }).pasos, uno = new MC.DensidadLienzo({ max: 1 }).pasos;
  ok(lento < 2 && recupera === 2 && terco === 2 && fija === 2 && pasos.join() === '2,1.5,1.24,1' && uno.join() === '1,0.75', 'densidad dinámica del lienzo: baja cuando pintar es el cuello, no insiste si no mejora (pantalla a 30 Hz) y vuelve a la nitidez con holgura', { lento, recupera, terco, pasos, uno }); }
{ /* 2.10: el público simulado (MC.Publico) empuja la palanca hacia donde va, relativo a la cámara, y suelta al llegar */
  const C = { x: 0, y: 0, v: 0 }, p = MC.Publico.piloto('gamer', { cuerpo: C, camara: { yaw: 0 }, objetivo: () => ({ x: 100, y: 0, radio: 10 }) }); let e; for (let i = 0; i < 30; i++) e = p.leer(1 / 30);
  const C2 = { x: 0, y: 0, v: 0 }, p2 = MC.Publico.piloto('gamer', { cuerpo: C2, camara: { yaw: Math.PI / 2 }, objetivo: () => ({ x: 100, y: 0, radio: 10 }) }); let e2; for (let i = 0; i < 30; i++) e2 = p2.leer(1 / 30);
  const llego = MC.Publico.piloto('nina', { cuerpo: { x: 99, y: 0, v: 0 }, objetivo: () => ({ x: 100, y: 0, radio: 10 }) }).leer(.1).stick.m === 0;
  const malo = MC.Publico.informe({ perfil: 'abuelo', t: 60, atascado: 30, choques: 0, llegadas: [], metros: 10 }, { fps: 50 }), bueno = MC.Publico.informe({ perfil: 'gamer', t: 60, atascado: 2, choques: 1, llegadas: [8], metros: 300 }, { fps: 58 });
  ok(e.stick.x > .9 && Math.abs(e.stick.y) < .25 && Math.abs(e2.stick.y) > .9 && Math.abs(e2.stick.x) < .25 && llego && malo.veredicto === 'mal' && bueno.veredicto === 'bien' && MC.Publico.lista().length === 4, 'público simulado: cada perfil empuja hacia su meta (también con la cámara girada), suelta al llegar y da su veredicto', { malo: malo.frases[0] });
  p.soltar(); p2.soltar(); }
if (fs.existsSync(gu)) { /* 2.10: rutaA sale por el extremo de la calle que conviene (antes uno fijo: daba la vuelta a la manzana; y si los dos extremos coincidían, cortaba derecho por encima de las casas) */
  const MG = new MC.Mundo(new Uint8Array(fs.readFileSync(gu)), JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/guatape.json'), 'utf8'))), R = MG.red('rueda'), A = R.aristas;
  let sem = 7; const rnd = () => (sem = (sem * 16807) % 2147483647) / 2147483647, largo = P => { let L = 0; for (let k = 2; k < P.length; k += 2) L += Math.hypot(P[k] - P[k - 2], P[k + 1] - P[k - 1]); return L; };
  let n = 0, peor = 0, mejora = 0; const r = [];
  for (let i = 0; i < 3000 && n < 40; i++) { const e = A[(rnd() * A.length) | 0], f = A[(rnd() * A.length) | 0], p1 = e.t.at(rnd() * e.largo), p2 = f.t.at(rnd() * f.largo), d = Math.hypot(p1.x - p2.x, p1.y - p2.y); if (d < 30 || d > 120) continue;
    const a = R.cercana(p1.x, p1.y, 120), b = R.cercana(p2.x, p2.y, 120), C = a && b && R.camino(a.arista.a, b.arista.b); if (!C) continue;
    const V = [p1.x, p1.y]; for (const { arista: q, adelante } of C) { const pp = q.t.p, m = pp.length; if (adelante) for (let j = 0; j < m; j += 2) V.push(pp[j], pp[j + 1]); else for (let j = m - 2; j >= 0; j -= 2) V.push(pp[j], pp[j + 1]); } V.push(p2.x, p2.y);
    const nuevo = largo(MC.Manejo.rutaA(MG, p1, p2, 'rueda')), viejo = largo(V); n++; if (C.length && nuevo > viejo * 1.001 + .5) peor++; if (nuevo < viejo * .9) mejora++; r.push(nuevo / d); }
  r.sort((x, y) => x - y);
  ok(n >= 30 && peor === 0 && mejora > 0 && r[r.length >> 1] < 2, 'rutas por la calle: rutaA nunca es más larga que antes y a veces mucho más corta (mediana ' + (r[r.length >> 1] || 0).toFixed(2) + '× la línea recta)', { muestras: n, mejores: mejora }); }
{ let resp = 0; const r = MC.Sprites.dibujar(null, 'noexiste/bici', 0, 0, 10, { respaldo: () => resp++ }); ok(r === false && resp === 1 && MC.Sprites.faltan.has('noexiste/bici'), 'sprites: si falta el arte, dibuja el respaldo del motor y lo anota'); }
if (fs.existsSync(gu)) {
  const MG = new MC.Mundo(new Uint8Array(fs.readFileSync(gu)), JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/guatape.json'), 'utf8')));
  const L1 = MC.Direccion.leer('Cra 51A No. 52-10 apto 301'), L2 = MC.Direccion.leer('Cl 56 Sur # 48-20'), L3 = MC.Direccion.leer('Avenida 80 #32 - 15');
  ok(L1 && L1.tipo === 'Carrera' && L1.num === '51A' && L1.cruce === '52' && L1.metros === 10 && L2.sur && L2.num === '56' && L3.tipo === 'Avenida' && L3.metros === 15, 'dirección colombiana: se lee tipo, número, letra, sur, cruce y metros');
  const U = MC.Direccion.ubicar(MG, 'Calle 31 # 28-15'), Um = MC.Direccion.ubicar(M, 'Calle 50 # 52-20'), Uc = MC.Direccion.ubicar(M, 'Calle 50 # 52-20, Copacabana');
  ok(U.calidad === 'exacta' && U.edificio && Um.calidad === 'exacta' && M.barrio(Um.x, Um.y) === 'La Candelaria' && M.municipio(Uc.x, Uc.y) === 'Copacabana', 'dirección → casa real: Guatapé y Medellín, y el municipio correcto si se dice', { guatape: MG.lugarTexto(U.x, U.y), medellin: M.lugarTexto(Um.x, Um.y) });
  const R = MC.Hogar.desdeDireccion(MG, 'Calle 31 # 28-15'), H = R.hogar, PL = H.plano(), lib = new MC.Libro(); lib.mover('mundo', 'jugador', 500000000);
  const c1 = H.comprar('matera', lib); let puesto = false; for (const cu of PL.cuartos) for (let i = 0; i < 60 && !puesto; i++) puesto = H.poner('matera', cu.x + .15 + (i % 6) * .4, cu.y + .15 + Math.floor(i / 6) * .4);
  const gd = H.guardar(); ok(R.ok && c1.ok && puesto && lib.saldo('jugador') === 500000000 - 6000000 && lib.cuadra() && !('direccion' in gd) && gd.muebles.some(m => m.usuario), 'mi casa: la compra cuadra en el libro, el mueble cabe y el guardado no lleva la dirección');
  const firmas = new Set(); for (const e of MG.edificiosEn(0, 0, MG.ancho, MG.alto).filter(e => e.hw > 4 && e.hd > 4).slice(0, 12)) { const P2 = MC.Interiores.generar(e, { programa: 'casa' }); firmas.add(P2.estilo + ':' + P2.cuartos.map(c => c.tipo).join(',')); }
  ok(firmas.size >= 10, 'interiores: doce casas genéricas, doce diseños distintos (estilos y cuartos)', firmas.size);
  const LG = MC.Lugares.en(MG, 0, 0, MG.ancho, MG.alto), tipos = new Set(LG.map(q => q.tipo)), ti = LG.find(q => q.tipo === 'tienda_barrio'), per = new MC.Seres.Persona({ edad: 25 }); per.estado.energia = .3;
  const lib2 = new MC.Libro(); lib2.mover('mundo', 'jugador', 1000000); const h1 = MC.Lugares.hacer(ti, 'arepa', { libro: lib2, persona: per, hora: 10 }), h2 = MC.Lugares.hacer(ti, 'arepa', { libro: lib2, persona: per, hora: 3 });
  ok(LG.length > 20 && tipos.has('parque') && tipos.has('taller_bici') && h1.ok && per.estado.energia > .5 && !h2.ok && lib2.cuadra(), 'lugares jugables: parques, talleres y tiendas reales; comer da energía y de madrugada está cerrado', { lugares: LG.length, tipos: [...tipos] });
  const d0 = MC.Desgaste.nuevo(MC.Vehiculos.get('bici')); MC.Desgaste.usar(d0, 80000, 4); const gast = MC.Desgaste.aplicar(MC.Vehiculos.get('bici'), d0), cost = MC.Desgaste.costoReparar(d0, MC.Vehiculos.get('bici')); MC.Desgaste.mejorar(d0, 'frenos'); MC.Desgaste.reparar(d0); const nuevo = MC.Desgaste.aplicar(MC.Vehiculos.get('bici'), d0);
  ok(gast.freno < MC.Vehiculos.get('bici').freno && cost > 0 && nuevo.freno > MC.Vehiculos.get('bici').freno * 1.2, 'taller: el uso gasta, reparar cuesta y los frenos nuevos frenan más');
  const HI = new MC.Historias({ semilla: 3 }), ctx = { hora: 17.8, altura: 1900, clima: { lluvia: 0, temp: 22 }, vehiculo: { clase: 'rueda' }, lugarTipo: 'parque', banderas: {} }; HI.t = 1000; const s1 = HI.elegir(ctx, true);
  for (let i = 0; i < 6; i++) HI.director.sumar('peligro'); HI.director.paso(.1); const fase = HI.director.fase; const enc = HI.encargo(MG, MG.ancho / 2, MG.alto / 2, ctx);
  ok(s1 && MC.PILARES.includes(s1.pilar) && s1.opciones.length && fase === 'respiro' && HI.director.quiere() === 'respiro' && enc && enc.def.pasos.length === 2 && enc.def.premio > 0, 'historias: storylet que encaja, director con respiro después del pico y encargo procedural', { historia: s1 && s1.id, encargo: enc && enc.titulo });
}
{ const O = new MC.Ocurrencias(), Co = new MC.Cuerpo(M, { x: col.x, y: col.y, veh: 'pie' }); const v0 = M.viaCercana(col.x, col.y, 80); Co.x = v0.x; Co.y = v0.y; for (let i = 0; i < 90; i++) O.vigilar(1 / 30, { cuerpo: Co, mundo: M }); Co.x = NaN; O.vigilar(1 / 30, { cuerpo: Co, mundo: M });
  ok(Number.isFinite(Co.x) && O.resumen().numero_invalido === 1 && !JSON.stringify(O.exportar()).includes('direccion'), 'ocurrencias: un número roto se corrige solo (vuelve al último punto seguro) y se anota sin datos personales'); }
{ const sol = MC.Cosmos.estrella(1, 0, 0), Ps = Array.from({ length: 6 }, (_, i) => MC.Cosmos.planeta(sol, i)), E2 = MC.Cosmos.estrella(1, 0, 0);
  let n = { M: 0, G: 0 }; for (let i = 0; i < 2000; i++) { const e = MC.Cosmos.estrella(7, 1, i); if (n[e.clase] != null) n[e.clase]++; }
  const tierra = { u: 0, g: 0, n: 0, masa: 1, luminosidad: 1, zonaHabitable: [.95, 1.37], nombre: 'Sol' }, gT = 6.674e-11 * 5.972e24 / (6.371e6 ** 2), h1 = MC.Cosmos.altura(9, 1000, 2000), h2 = MC.Cosmos.altura(9, 1000, 2000), h3 = MC.Cosmos.altura(9, 1000.5, 2000);
  ok(JSON.stringify(sol) === JSON.stringify(E2) && n.M > n.G * 5 && Math.abs(gT - 9.82) < .02 && Ps.every(p => isFinite(p.g) && p.a > 0) && h1 === h2 && Math.abs(h1 - h3) < 5, 'cosmos: la misma semilla da la misma estrella; abundancias reales; g de la Tierra; relieve infinito y continuo', { estrella: sol.nombre + ' (' + sol.clase + ')', enanasRojas: n.M, comoElSol: n.G });
  const hab = []; for (let i = 0; i < 400 && hab.length < 1; i++) { const e = MC.Cosmos.estrella(3, 2, i); for (let k = 0; k < e.planetas; k++) { const p = MC.Cosmos.planeta(e, k); if (p.habitable) hab.push(p); } }
  const cr = hab[0] && MC.Cosmos.criaturaDe(hab[0]); ok(hab.length && hab[0].temperatura > -10 && hab[0].temperatura < 60 && cr && cr.verosimil && MC.Cosmos.mundoDe(hab[0]).tipo, 'cosmos: un planeta habitable con agua, su mundo jugable y una criatura verosímil a su gravedad', hab[0] && { planeta: hab[0].nombre, g: +hab[0].g.toFixed(1), T: Math.round(hab[0].temperatura), criatura: cr && cr.especie }); }

console.log('14) Ciudad: sombras, mobiliario, urbe, objetos inteligentes, ondas y paisaje sonoro');
{ const f = new Date(2026, 2, 21), cm = MC.Cielo.en(f, 12.2, null), ct = MC.Cielo.en(f, 16.5, null), cn = MC.Cielo.en(f, 23, null), vm = MC.Sombras.vector(cm), vt = MC.Sombras.vector(ct);
  const hull = MC.Sombras.poligono([0, 0, 10, 0, 10, 10, 0, 10], 20, vt);
  ok(vm && vt && vm.L < .5 && vt.L > 1.2 && vt.dx > 0 && !MC.Sombras.vector(cn) && hull.length >= 4, 'sombras del sol: cortas al mediodía, largas hacia el oriente en la tarde, ninguna de noche', { mediodia: +vm.L.toFixed(2), tarde: +vt.L.toFixed(2) }); }
{ const L = MC.Mobiliario.en(M, col.x - 300, col.y - 300, col.x + 300, col.y + 300), t = {}; for (const p of L) t[p.t] = (t[p.t] || 0) + 1; const dentro = L.filter(p => p.t !== 'cebra' && M.edificioEn(p.x, p.y, 0)).length, L2 = MC.Mobiliario.en(M, col.x - 300, col.y - 300, col.x + 300, col.y + 300);
  ok(t.poste > 20 && t.arbol > 20 && t.cebra > 10 && dentro === 0 && JSON.stringify(L) === JSON.stringify(L2), 'mobiliario urbano: postes, árboles, cebras y bancas, nunca dentro de un edificio y siempre igual', t); }
if (fs.existsSync(gu)) {
  const MG = new MC.Mundo(new Uint8Array(fs.readFileSync(gu)), JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/guatape.json'), 'utf8'))), U = new MC.Urbe(MG), par = MG.lugares.find(l => /Parque de Guatape/i.test(l.nombre));
  let vacio = null; for (const v of MG.vias()) { const x = v.p[0], y = v.p[1]; if (MG.edificiosEn(x - 80, y - 80, x + 80, y + 80).length < 3 && U.valorEn(x, y) > 20) { vacio = { x, y }; break; } }
  const v0 = U.valorEn(vacio.x + 20, vacio.y + 20); U.libro.mover('mundo', 'alcaldia', 5e9); const nz = U.zonificar('R', vacio.x, vacio.y, 150), d0 = U.demanda();
  let lotes = 0; for (let i = 0; i < 8; i++) lotes += U.avanzar(1).nuevos; const d1 = U.demanda(), nuevo = U.lotes[0], visto = nuevo && MG.edificiosEn(nuevo.x - 2, nuevo.y - 2, nuevo.x + 2, nuevo.y + 2).includes(nuevo.e);
  U.servicio('parque', vacio.x + 20, vacio.y + 20); const v1 = U.valorEn(vacio.x + 20, vacio.y + 20);
  ok(U.valorEn(par.x, par.y) > 45 && nz > 50 && lotes > 5 && visto && d1.C > d0.C && v1 > v0 + 5 && U.libro.cuadra() && U.capa('valor') && U.capa('zonas'), 'urbe: valor del suelo, zonas junto a las calles, crecimiento mirando a la calle, demanda RCI que responde y parques que valorizan', { zonas: nz, lotes, C: [+d0.C.toFixed(2), +d1.C.toFixed(2)], valor: [Math.round(v0), Math.round(v1)] });
  const H2 = MC.Hogar.desdeDireccion(MG, 'Calle 31 # 28-15').hogar, PL = H2.plano(); PL.muebles = PL.muebles.filter(m => !m.deco); const a0 = H2.ambiente(), sala = PL.cuartos.find(c => c.tipo === 'sala') || PL.cuartos[0]; for (const t of ['matera', 'cuadro', 'lampara']) PL.muebles.push({ tipo: t, x: sala.x + .2, y: sala.y + .2, w: .3, h: .3, deco: true }); const a1 = H2.ambiente();
  const Hb = new MC.Habitante(PL, { semilla: 4 }); Hb.N.hambre = 5; const elegido = Hb.elegir(); let comio = false; for (let i = 0; i < 2400 && !comio; i++) { Hb.paso(1 / 30, 2); if (Hb.accion && MC.Necesidades.ANUNCIOS[Hb.accion.tipo].hambre) comio = true; }
  ok(a1 > a0 && elegido && MC.Necesidades.ANUNCIOS[elegido.tipo].hambre && comio, 'objetos inteligentes: con hambre va a la nevera o la estufa; decorar sube el ambiente de la casa', { ambiente: [a0, a1], va: elegido && elegido.tipo });
}
{ const F = { a: { peso: 1, lados: ['A', 'C', 'B', 'D'] }, b: { peso: 1, lados: ['B', 'D', 'A', 'C'] } }, R = MC.Ondas.resolver({ ancho: 8, alto: 8, fichas: F, semilla: 3 }); let bien = R.ok;
  if (R.ok) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { if (x < 7 && R.celdas[y][x] === R.celdas[y][x + 1]) bien = false; if (y < 7 && R.celdas[y][x] === R.celdas[y + 1][x]) bien = false; }
  const fz = MC.Ondas.fachada(5, 4, 9), abajo = fz[4].every(t => ['local', 'puerta', 'vitrina'].includes(t)) && fz.slice(0, 4).every(f => f.every(t => !['local', 'puerta', 'vitrina'].includes(t)));
  const RI = MC.RejillaIrregular.crear({ anillos: 3, semilla: 5 }), es = (x, y) => x >= 0 && y >= 0 && x < 3 && y < 3;
  ok(bien && abajo && RI.quads.length > 40 && RI.quads.every(q => q.length === 4) && MC.Autotile.mascara4(es, 1, 1) === 15 && MC.Autotile.mascara4(es, 0, 0) === 6 && MC.Autotile.esquinas(1, 0, 0, 0).canonico === 1, 'ondas (WFC), fachadas por reglas, rejilla irregular de Townscaper y autotile', { quads: RI.quads.length, fachada: fz.map(f => f.join(' ')).slice(3) }); }
{ const n = MC.Paisaje.plan({ hora: 23, clima: { lluvia: 0 }, verde: .6 }), m = MC.Paisaje.plan({ hora: 6.3, clima: { lluvia: 0 }, verde: .6, ruido: .2 }), ll = MC.Paisaje.plan({ hora: 14, clima: { lluvia: .8, tormenta: .5 } });
  ok(n.grillos > .3 && n.pajaros < .1 && m.pajaros > .3 && ll.lluvia > .7 && ll.truenos > .3, 'paisaje sonoro: grillos de noche, pájaros al amanecer, lluvia y truenos', { noche: n.grillos, amanecer: m.pajaros }); }

console.log('15) Terreno: agua, montañas, rocas y límites de paso');
{ /* agua real: el embalse de Guatapé es lago y se hace más hondo lejos de la orilla; Medellín tiene su río */
  const MG = new MC.Mundo(new Uint8Array(fs.readFileSync(gu)), JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/guatape.json'), 'utf8'))), AG = MC.Terreno.agua(MG), grande = AG.C.slice().sort((a, b) => b.area - a.area)[0];
  let orilla = null, hondo = null; for (let x = 50; x < MG.ancho && !(orilla && hondo); x += 13) for (let y = 50; y < MG.alto && !(orilla && hondo); y += 17) { const a = MC.Terreno.aguaEn(MG, x, y); if (!a || a.tipo !== 'lago') continue; if (!orilla && a.prof < .5) orilla = { x, y, a }; if (!hondo && a.prof > 5) hondo = { x, y, a }; }
  const AM = MC.Terreno.agua(M), rios = AM.C.filter(c => c.tipo === 'rio');
  ok(grande.tipo === 'lago' && orilla && hondo && rios.length > 0, 'agua real: el embalse de Guatapé es lago (pando en la orilla, hondo adentro) y Medellín tiene su río', { embalse: Math.round(grande.area / 1e4) + ' ha', orilla: orilla && +orilla.a.prof.toFixed(2), hondo: hondo && +hondo.a.prof.toFixed(1), tramosDeRio: rios.length });
  const P = new MC.Cuerpo(MG, { x: orilla.x, y: orilla.y, veh: 'pie' }), pa = MC.Terreno.paso(P, orilla.x, orilla.y), ph = MC.Terreno.paso(P, hondo.x, hondo.y), Bc = new MC.Cuerpo(MG, { x: hondo.x, y: hondo.y, veh: 'bici' }), pb = MC.Terreno.paso(Bc, hondo.x, hondo.y), Ln = new MC.Cuerpo(MG, { x: orilla.x, y: orilla.y, veh: 'lancha' }), pl = MC.Terreno.paso(Ln, orilla.x, orilla.y), pl2 = MC.Terreno.paso(Ln, hondo.x, hondo.y);
  ok(pa.ok && pa.vadea && ph.ok && ph.nada && !pb.ok && /honda/.test(pb.motivo) && !pl.ok && pl2.ok, 'a pie se vadea la orilla y se nada en lo hondo; la bici no entra a lo hondo; la lancha no anda en lo pando', { bici: pb.motivo, lancha: pl.motivo });
  /* caminar hacia el agua: llega nadando; la bici se queda en la orilla y dice por qué */
  let tierra = null; for (let k = 1; k < 80 && !tierra; k++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = orilla.x + dx * k * 4, y = orilla.y + dy * k * 4; if (MG.suelo(x, y) !== MC.TT.WATER && MG.suelo(x, y) !== MC.TT.CANAL && !MG.edificioEn(x, y, 1)) { tierra = { x, y, a: Math.atan2(-dy, -dx) }; break; } }
  const W1 = new MC.Cuerpo(MG, { x: tierra.x, y: tierra.y, a: tierra.a, veh: 'pie' }); let nado = false; for (let i = 0; i < 1800 && !nado; i++) { W1.actualizar(1 / 30, { acel: 1, dir: { x: hondo.x - W1.x, y: hondo.y - W1.y, m: 1 } }); if (W1.nadando) nado = true; }
  ok(nado, 'caminando hacia el embalse, el personaje entra al agua y termina nadando'); }
{ /* ENTRAR AL AGUA: en bici, al empujar hacia el embalse se baja sola y entra nadando; bucea, se queda sin aire y sube;
     sale, vuelve a la bici; y con la lancha se embarca y se desembarca */
  const MG = new MC.Mundo(new Uint8Array(fs.readFileSync(gu)), JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades/guatape.json'), 'utf8')));
  let orilla = null; for (let x = 60; x < MG.ancho && !orilla; x += 11) for (let y = 60; y < MG.alto && !orilla; y += 13) { const a = MC.Terreno.aguaEn(MG, x, y); if (!a || a.tipo !== 'lago' || a.orilla > 6) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const tx = x + dx * 10, ty = y + dy * 10, w2 = MC.Terreno.aguaEn(MG, x - dx * 40, y - dy * 40); if (!MC.Terreno.aguaEn(MG, tx, ty) && MG.suelo(tx, ty) !== MC.TT.BLDG && !MG.edificioEn(tx, ty, 2) && MC.Terreno.pendiente(MG, tx, ty) < .4 && w2 && w2.prof > 3) { orilla = { tx, ty, wx: x - dx * 40, wy: y - dy * 40 }; break; } } }
  const B = new MC.Cuerpo(MG, { x: orilla.tx, y: orilla.ty, a: Math.atan2(orilla.wy - orilla.ty, orilla.wx - orilla.tx), veh: 'bici' }); let bajo = false, nado = false;
  for (let i = 0; i < 2400 && !nado; i++) { B.actualizar(1 / 30, { acel: 1, dir: { x: orilla.wx - B.x, y: orilla.wy - B.y, m: 1 } }); if (B.estacionado) bajo = true; if (B.nadando) nado = true; }
  for (let i = 0; i < 240; i++) B.actualizar(1 / 30, { acel: 1, dir: { x: orilla.wx - B.x, y: orilla.wy - B.y, m: 1 } });   // nada hacia lo hondo
  const est = B.estacionado; let zmin = 0; for (let i = 0; i < 150; i++) { B.actualizar(1 / 30, { baja: true }); zmin = Math.min(zmin, B.z); } const aireBuceo = B.aire, buceo = B.buceando, pose = B.estado;
  for (let i = 0; i < 150; i++) B.actualizar(1 / 30, { sube: true }); const arriba = B.z > -.1 && !B.buceando;
  B.pulmones = 2; let sinAire = false; const quita = MC.on('sinAire', () => sinAire = true); for (let i = 0; i < 300 && !sinAire; i++) B.actualizar(1 / 30, { baja: true }); for (let i = 0; i < 60; i++) B.actualizar(1 / 30, { baja: true }); quita(); const subioSola = B.z > -.3; B.pulmones = 35;   // aunque siga oprimiendo «bajar», sube a respirar
  for (let i = 0; i < 3000 && Math.hypot(B.x - est.x, B.y - est.y) > 2.5; i++) B.actualizar(1 / 30, { acel: 1, dir: { x: est.x - B.x, y: est.y - B.y, m: 1 } });
  const monto = B.montar(3);
  ok(bajo && nado && est.veh === 'bici' && zmin <= -.9 && buceo && aireBuceo < 1 && pose === 'bucea' && arriba && sinAire && subioSola && monto && B.veh.id === 'bici', 'entrar al agua: la bici se queda en la orilla y se entra nadando; se bucea con aire limitado, sin aire se sube sola; se sale y se vuelve a la bici', { bajo, nado, hondoBuceo: +zmin.toFixed(1), aire: +aireBuceo.toFixed(2), buceo, pose, arriba, sinAire, subioSola, monto });
  const L = new MC.Cuerpo(MG, { x: orilla.tx, y: orilla.ty, veh: 'pie' }), emb = L.embarcar('lancha', 60), enAgua = !!MC.Terreno.aguaEn(MG, L.x, L.y); let navego = 0; const x0 = L.x, y0 = L.y; for (let i = 0; i < 120; i++) L.actualizar(1 / 30, { acel: 1, dir: { x: orilla.wx - L.x, y: orilla.wy - L.y, m: 1 } }); navego = Math.hypot(L.x - x0, L.y - y0);
  for (let i = 0; i < 2000 && !MC.Terreno.tierraFirme(MG, L.x, L.y, 14); i++) L.actualizar(1 / 30, { acel: 1, dir: { x: orilla.tx - L.x, y: orilla.ty - L.y, m: 1 } });
  const des = L.desembarcar(16);
  ok(emb && enAgua && L.veh.id === 'pie' && des && !MC.Terreno.aguaEn(MG, L.x, L.y) && L.estacionado && L.estacionado.veh === 'lancha', 'lancha: se embarca en el agua honda, navega, se desembarca en tierra firme y queda amarrada', { navego: Math.round(navego) }); }
{ /* pendientes: fuera de la vía, el carro no sube una ladera muy empinada; a pie sí (si no es un acantilado) */
  let lad = null; for (let i = 0; i < 20000 && !lad; i++) { const x = 2000 + (i * 397) % 38000, y = 2000 + (i * 761) % 44000, tt = M.suelo(x, y); if ((tt === MC.TT.GRASS || tt === MC.TT.MOUNT) && MC.Terreno.pendiente(M, x, y) > .55 && MC.Terreno.pendiente(M, x, y) < .9 && !M.edificioEn(x, y, 3)) lad = { x, y }; }
  const gx = (M.cota(lad.x + 6, lad.y) - M.cota(lad.x - 6, lad.y)) / 12, gy = (M.cota(lad.x, lad.y + 6) - M.cota(lad.x, lad.y - 6)) / 12, gl = Math.hypot(gx, gy), ab = { x: lad.x - gx / gl * 4, y: lad.y - gy / gl * 4 };
  const Ca = new MC.Cuerpo(M, { x: ab.x, y: ab.y, veh: 'carro' }), Pe = new MC.Cuerpo(M, { x: ab.x, y: ab.y, veh: 'pie' }), rc = MC.Terreno.paso(Ca, lad.x, lad.y), rp = MC.Terreno.paso(Pe, lad.x, lad.y);
  ok(!rc.ok && /empinado|barranco/.test(rc.motivo) && rp.ok, 'pendientes: el carro no sube una ladera de más de 50 % fuera de la vía; a pie sí', { pendiente: +MC.Terreno.pendiente(M, lad.x, lad.y).toFixed(2), carro: rc.motivo }); }
{ /* obstáculos: emblemáticos, postes, árboles de las losas y edificios sobre la calle (solo si se mete de verdad) */
  const S = M.sitios().E.find(q => q.R[0] && q.h > 20 && Math.abs(q.caja[2] - q.caja[0]) > 30), R0 = S.R[0]; let cx = 0, cy = 0; for (let x = S.caja[0]; x < S.caja[2] && !cx; x += 2) for (let y = S.caja[1]; y < S.caja[3]; y += 2) if ([[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3]].every(([a, b]) => MC.dentroPol(R0, x + a, y + b))) { cx = x; cy = y; break; }   // un punto bien adentro de la huella
  const Pe = new MC.Cuerpo(M, { x: cx, y: cy - 60, veh: 'pie' }), adentro = MC.Terreno.sitioEn(M, cx, cy) && !Pe.puede(cx, cy);
  const pos = MC.Mobiliario.en(M, col.x - 200, col.y - 200, col.x + 200, col.y + 200).find(p => p.t === 'poste'), Pp = new MC.Cuerpo(M, { x: pos.x + 3, y: pos.y, veh: 'pie' }), poste = !Pp.puede(pos.x + .1, pos.y);
  let arb = null; for (let i = 0; i < 4000 && !arb; i++) { const x = col.x + (i % 60) * 7 - 200, y = col.y + Math.floor(i / 60) * 7 - 200; const a = MC.Terreno.arbolLosaEn(M, x, y, .3); if (a && a.x) arb = a; }
  const Pa = new MC.Cuerpo(M, { x: arb.x + 3, y: arb.y, veh: 'pie' }), arbol = !Pa.puede(arb.x, arb.y) && /árbol/.test(Pa.bloqueo);
  ok(adentro && poste && arbol, 'no se atraviesan los emblemáticos, los postes ni los árboles que se ven en el mapa', { sitio: S.nombre || S.clase, bloqueo: Pa.bloqueo }); }
  /* 2.6: los árboles que se levantan (MC.Arboleda) son los mismos con que se choca (Terreno.arbolLosaEn) */
  { const L = MC.Arboleda.en(M, col.x - 300, col.y - 300, col.x + 300, col.y + 300), mal = L.filter(t => !MC.Terreno.arbolLosaEn(M, t.x, t.y, .1)).length, esp = [...new Set(L.map(t => t.e))];
    ok(L.length > 20 && mal === 0 && L.every(t => t.h > t.r * 1.5 && t.h < 16) && esp.length >= 3, 'árboles de pie: los que se ven son los que chocan, con especies del trópico y alturas reales', { arboles: L.length, distintos: mal, especies: esp }); }
{ /* mundos generados: lagos planos, mar a nivel cero, rocas en la montaña y nada de naturaleza en las vías */
  const Gm = MC.Generador.mundo({ semilla: 1, tipo: 'montaña', ancho: 256, alto: 256, pueblos: 2 }), Gi = MC.Generador.mundo({ semilla: 1, tipo: 'isla', ancho: 256, alto: 256, pueblos: 2 }), Am = MC.Terreno.agua(Gm), Ai = MC.Terreno.agua(Gi), lagoG = Am.C.filter(c => c.tipo === 'lago').sort((a, b) => b.area - a.area)[0];
  let pts = []; for (let x = 20; x < Gm.ancho && pts.length < 2; x += 23) for (let y = 20; y < Gm.alto && pts.length < 2; y += 29) { const a = MC.Terreno.aguaEn(Gm, x, y); if (a && a.cuerpo === lagoG && a.orilla > 25) pts.push(Gm.cota(x, y)); }
  let mar = null; for (let x = 5; x < Gi.ancho && !mar; x += 30) { const a = MC.Terreno.aguaEn(Gi, x, 5); if (a && a.tipo === 'mar') mar = Gi.cota(x, 5); }
  const nat = MC.Naturaleza.en(Gm, 0, 0, Gm.ancho, Gm.alto), rocas = nat.filter(p => p.t === 'roca').length, enVia = nat.filter(p => p.t !== 'junco' && [4, 5, 6, 7, 14].includes(Gm.suelo(p.x, p.y))).length;
  ok(Gm.generado.lagos > 0 && pts.length === 2 && Math.abs(pts[0] - pts[1]) < 1.5 && Ai.C.some(c => c.tipo === 'mar') && Math.abs(mar) < .5 && rocas > 30 && enVia === 0 && JSON.stringify(nat) === JSON.stringify(MC.Naturaleza.en(Gm, 0, 0, Gm.ancho, Gm.alto)), 'mundos generados: lagos de superficie plana, mar a nivel cero, rocas en la montaña y nada sobre las vías', { lagos: Gm.generado.lagos, rocas, naturaleza: nat.length }); }

console.log('17) Estilos gráficos, vida y exportación a motores potentes (2.7)');
{ /* estilos: el mismo mundo pasa por el mapa de color de cada estilo */
  const E = MC.Estilo, verde = MC.hex3('#4caf63'), rojo = MC.hex3('#b5542f'), r = {}; const antes = MC.estilo;
  MC.estilo = 'manga'; const m = E.rgb(verde); r.manga = Math.abs(m[0] - m[1]) < 1e-6 && Math.abs(m[1] - m[2]) < 1e-6;
  MC.estilo = 'novela'; const nr = E.rgb(rojo), ng = E.rgb(verde); r.novelaAcento = MC.css3(nr) === MC.css3(MC.hex3(E.p.acento)); r.novelaTonos = E.p.tonos.map(t => MC.css3(MC.hex3(t))).includes(MC.css3(ng));
  MC.estilo = 'ukiyoe'; const u = E.rgb(verde); r.ukiyoe = E.paleta('hokusai').some(q => Math.hypot(q[0] - u[0], q[1] - u[1], q[2] - u[2]) < .25);
  MC.estilo = 'comic'; r.alfa = /,0\.5\)$/.test(E.col('rgba(10,20,30,0.5)')); r.estilos = E.lista().length; MC.estilo = antes; r.realistaIgual = E.col('#123456') === '#123456';
  ok(r.manga && r.novelaAcento && r.novelaTonos && r.ukiyoe && r.alfa && r.estilos >= 10 && r.realistaIgual, 'estilos: manga en grises, novela con tres tonos y un rojo de acento, ukiyo-e con la paleta de Hokusai, y la transparencia se respeta', r); }
{ /* vida: partículas que nacen y se apagan, bandadas cerca de la cámara, aterrizaje con peso */
  const V = MC.Vida, E = { t: 0, camara: { x: 500, y: 500, sacudir() { this.s = 1; } }, mundo: M, jugador: { cuerpo: { x: 500, y: 500, a: 0, v: 0, vz: -7, enAire: true } } };
  V.P.length = 0; V.aves.length = 0; V._t = null; V._pv = null; V.actualizar(E); E.t = .05; V.actualizar(E); E.jugador.cuerpo.enAire = false; E.jugador.cuerpo.vz = 0; E.t = .1; V.actualizar(E);
  const nacen = V.P.length, aves = V.aves.length, squash = !!E.jugador.cuerpo._squash, sacude = E.camara.s === 1; for (let i = 0; i < 40; i++) { E.t += .1; V.actualizar(E); }
  ok(nacen > 5 && aves === 3 && squash && sacude && V.P.length < nacen, 'vida: al aterrizar levanta polvo, se aplasta y sacude la cámara; las partículas se apagan; hay bandadas', { nacen, quedan: V.P.length, aves, squash }); }
{ /* exportar: GLB válido (cabecera, trozos, accesores e índices), alturas RAW 16 y escena */
  const Lx = M.lugares[0], c0 = [Lx.x - 150, Lx.y - 150, Lx.x + 150, Lx.y + 150].map(Math.round), glb = MC.Exportar.glb(M, c0, { paso: 8 }), dv = new DataView(glb.buffer, glb.byteOffset, glb.byteLength), jl = dv.getUint32(12, true), J = JSON.parse(Buffer.from(glb.subarray(20, 20 + jl)).toString('utf8').trim()), binL = dv.getUint32(20 + jl, true);
  let idxOk = true; const bin = glb.subarray(28 + jl); for (const me of J.meshes) { const pr = me.primitives[0], ai = J.accessors[pr.indices], ap = J.accessors[pr.attributes.POSITION], bv = J.bufferViews[ai.bufferView], I = new Uint32Array(bin.buffer.slice(bin.byteOffset + bv.byteOffset, bin.byteOffset + bv.byteOffset + bv.byteLength)); for (const k of I) if (k >= ap.count) { idxOk = false; break; } }
  const A = MC.Exportar.alturas(M, c0, 8), r16 = MC.Exportar.r16(A), esc = MC.Exportar.escena(M, c0);
  ok(dv.getUint32(0, true) === 0x46546C67 && dv.getUint32(4, true) === 2 && dv.getUint32(8, true) === glb.length && binL === J.buffers[0].byteLength && J.meshes.length >= 3 && idxOk && r16.length === A.w * A.h * 2 && esc.edificios.length > 10 && esc.vias.length > 0, 'exportar: un GLB (glTF 2.0) bien formado, con terreno, edificios, vías y árboles; alturas RAW 16 y escena en JSON', { kb: Math.round(glb.length / 1024), mallas: J.meshes.map(m => m.name), edificios: esc.edificios.length, alturas: A.w + '×' + A.h }); }

console.log('18) Entrega maestra de referencias: fauna, huellas, telemetría y contratos (2.8)');
{ /* huellas en suelo blando y palomas que huyen; las partículas respetan la accesibilidad */
  const V = MC.Vida, mundoArena = { suelo: () => MC.TT.ARENA, edificioEn: () => null }, C = { x: 0, y: 0, a: 0, v: 3, veh: { clase: 'auto', ancho: 1.8 } }, E = { t: 0, mundo: mundoArena, jugador: { cuerpo: C } };
  V.marcas.length = 0; for (let i = 0; i < 12; i++) { C.x += .7; E.t += .1; V._huellas(E, C); } const llantas = V.marcas.length; C.veh = { clase: 'pie' }; for (let i = 0; i < 6; i++) { C.x += .7; V._huellas(E, C); } const pisadas = V.marcas.filter(m => m.pie).length;
  const llueve = V.suelo({ mundo: { suelo: () => MC.TT.GRASS }, clima: { estado: 'lluvia' } }, 0, 0), seco = V.suelo({ mundo: { suelo: () => MC.TT.GRASS }, clima: { estado: 'despejado' } }, 0, 0);
  V.palomas.length = 0; V.aves.length = 0; V.palomas.push({ x: 4, y: 0, m: [{ dx: 0, dy: 0, a: 0, f: 0 }, { dx: 1, dy: 1, a: 0, f: 0 }], t0: 0 }); const Cp = { x: 0, y: 0, v: 5 }; V._palomas({ t: 1, mundo: { suelo: () => MC.TT.PLAZA }, jugador: { cuerpo: Cp } }, .016); const huyen = V.aves.filter(b => b.asustada).length;
  const antes = MC.opciones.particulas; MC.opciones.particulas = 0; V.P.length = 0; V.emitir('polvo', 0, 0, 20); const sinParticulas = V.P.length === 0; MC.opciones.particulas = antes;
  ok(llantas >= 20 && pisadas >= 5 && llueve === 'barro' && seco === null && huyen === 1 && V.palomas.length === 0 && sinParticulas, 'vida 2.8: surcos de llantas y pisadas en suelo blando (barro con lluvia), palomas que alzan vuelo y partículas que se apagan por accesibilidad', { llantas, pisadas, llueve, huyen }); }
{ /* telemetría en percentiles y contratos de datos versionados */
  const T = MC.Telemetria; T.limpiar(); for (let i = 0; i < 100; i++) T.registro(5, i < 95 ? 1 / 60 : .1); const R = T.resumen();
  const esq = n => JSON.parse(fs.readFileSync(path.join(RAIZ, 'schemas', n + '.schema.json'), 'utf8')), L0 = M.lugares[0], esc = MC.Exportar.escena(M, [L0.x - 120, L0.y - 120, L0.x + 120, L0.y + 120].map(Math.round));
  const eEsc = MC.Contratos.validar(esc, esq('escena')), eMal = MC.Contratos.validar({ schema_version: 2, motor: 1 }, esq('escena')), ins = MC.Puente.instantanea({ t: 3, jugador: { cuerpo: { x: 1, y: 2, a: 0, v: 3, veh: { id: 'bici' } } }, vehiculos: [], peatones: [] }), ePuente = MC.Contratos.validar(ins, esq('puente'));
  const ent = { schema_version: 1, entity_id: 'vehiculo_0001', arquetipo: 'carro', transform: { posicion_m: [0, 0, 0], rumbo_rad: 0 }, superficie: 'asfalto', persistente: true }, eEnt = MC.Contratos.validar(ent, esq('entidad'));
  ok(R.fps === 60 && R.cuadro_p95 >= 16 && R.cuadro_p99 === 100 && eEsc.length === 0 && eMal.length >= 3 && ePuente.length === 0 && eEnt.length === 0 && esc.schema_version === 1, 'telemetría con percentiles (p95, p99) y contratos versionados: la escena, el puente y la entidad pasan su esquema; uno roto no', { fps: R.fps, p95: R.cuadro_p95, p99: R.cuadro_p99, errorDelRoto: eMal[0] }); }
{
  const azul = MC.Estilo.ruidoAzul(), tramo = MC.Exportar.viasEn({vias:()=>[{p:[-2,5,12,5],ancho:2}]},[0,0,10,10]);
  ok(new Set(azul).size===256 && MC.Estilo.ruidoAzul()===azul, 'El ruido azul usa una vez cada umbral y mantiene la misma fase');
  ok(tramo.length===1 && String(tramo[0].p)==='0,5,10,5', 'Una vía que atraviesa la exportación conserva sus dos intersecciones');
  ok(String(MC.Exportar.r16({min:0,max:2,datos:[0,1,2]}))==='0,0,0,128,255,255', 'RAW16 escribe ambos bytes en little endian');
  const agua=MC.Terreno.agua(M);
  ok(M.tiene('agua') && agua.C.some(x=>x.tipo==='rio') && agua.D.length===agua.w*agua.h, 'El MC4 de Medellín carga la capa de agua');
  const L=new MC.Losas(M), original=MC.estilo;
  L.losa(1,2,2,true,0); MC.estilo='manga'; L.pintar=()=>{throw Error('Se horneó una losa obsoleta');}; L.trabajar(20);
  MC.estilo=original; ok(!L.cache.size && !L.pend.length,'Cambiar de estilo descarta peticiones de losas antiguas');
  const cuerpo={v:0,enAire:true,vz:-10,x:0,y:0};
  MC.Vida._jugador({jugador:{cuerpo}},.016);
  const otro={v:0,enAire:false,x:0,y:0}; MC.Vida._jugador({jugador:{cuerpo:otro}},.016);
  ok(!otro._squash,'Cambiar de personaje no produce un aterrizaje del anterior');
}

{
  const S = new MC.GuardadoSectores({ mundo: 'guatape', lado: 100 });
  const id = MC.GuardadoSectores.id('guatape', 'valla', 'cruce/1');
  S.cambiar(-1, 20, id, { rota: true, huellas: [1, 2] });
  const primera = S.actualizar(-1, 20, 0), segunda = S.actualizar(101, 20, 0);
  const valores = new Map(), storage = { setItem: (k, v) => valores.set(k, v), getItem: k => valores.get(k) ?? null };
  const escrito = S.guardar('partida', storage), restaurado = MC.GuardadoSectores.leer('partida', storage);
  const dato = restaurado.obtener(-1, 20, id); dato.huellas.push(3);
  const migrado = MC.GuardadoSectores.restaurar({ mundo: 'guatape', cambios: {} }, {
    0: d => ({ schema_version: 1, mundo: d.mundo, lado: 100, sectores: d.cambios })
  });
  let versionRechazada = false;
  try { MC.GuardadoSectores.restaurar({ schema_version: 2 }); } catch (e) { versionRechazada = true; }
  const fallo = S.guardar('partida', { setItem() { throw new Error('cuota'); } });
  ok(escrito && primera.despiertan.includes('-1,0') && segunda.duermen.includes('-1,0') &&
     restaurado.obtener(-1, 20, id).huellas.length === 2 && migrado.mundo === 'guatape' &&
     versionRechazada && fallo === false && valores.has('partida'),
     'sectores: identidad, sueño y retorno, migración, copias y fallo de almacenamiento');
}

if (process.argv.includes('--navegador')) {
  console.log('16) Banco de pruebas en Chromium');
  const html = path.join(RAIZ, 'dist/motor-city.html'); let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.log('  (sin playwright: se salta)'); }
  const urlPrueba = archivo => process.env.MC_PRUEBAS_URL ? new URL(path.relative(RAIZ, archivo), process.env.MC_PRUEBAS_URL).href : "file://" + archivo;
  /* 2.5.1 (auditoría de Codex): si Playwright no trae su navegador (red cerrada), se usa el Chromium del sistema; o se elige con MC_CHROMIUM=/ruta */
  if (chromium) { const L = chromium.launch.bind(chromium), cand = [process.env.MC_CHROMIUM, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome'].filter(Boolean); let avisado = false;
    chromium = { launch: async (op = {}) => { if (process.env.MC_CHROMIUM) return L({ ...op, executablePath: process.env.MC_CHROMIUM }); try { return await L(op); } catch (e) { for (const x of cand) if (fs.existsSync(x)) { if (!avisado) { console.log('  (Playwright sin su navegador: se usa ' + x + ')'); avisado = true; } return L({ ...op, executablePath: x }); } throw e; } } }; }
  if (chromium && fs.existsSync(html)) {
    const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }), p = await b.newPage({ viewport: { width: 412, height: 860 } }), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(urlPrueba(html)); await p.waitForFunction(() => window.MCS && MCS.listo, null, { timeout: 120000 });
    const vistas = await p.evaluate(async () => { const out = {}; for (const [i, v] of MC.VISTAS.entries()) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit' + (i + 1) })); await new Promise(r => setTimeout(r, 900)); out[v.id] = MCS.vistas.actual.id; } MCS.vistas.pixel = true; await new Promise(r => setTimeout(r, 600)); MCS.vistas.pixel = false; return out; });
    ok(Object.keys(vistas).length === 9 && Object.entries(vistas).every(([k, v]) => k === v) && !errs.length, 'las 9 vistas (con la lateral) y el pixel sin errores', vistas);
    const ras = await p.evaluate(async () => { MCS.vistas.motor3d = 'raster'; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit' + (MC.VISTAS.findIndex(q => q.id === 'tercera') + 1) })); await new Promise(r => setTimeout(r, 1500)); const n = MCS.vistas.raster ? MCS.vistas.raster.n : 0, gpu = MC.GPU.perfil(); MCS.vistas.motor3d = 'auto'; return { poligonos: n, nivel: gpu.nivel, webgl: gpu.webgl, software: gpu.software, escala: +MCS.vistas.res.escala.toFixed(2) }; });
    ok(ras.poligonos > 200 && !errs.length, 'GPU virtual: la 3D por software (MC.Raster) dibuja la ciudad sin WebGL', ras);
    const run = await p.evaluate(async () => { const r = MCS.mundo.red('rueda'), e = r.aristas.filter(a => a.k === MC.VIA.CICLO && a.largo > 300)[2], q = e.t.at(e.largo / 2); Object.assign(MCS.cuerpo, { x: q.x, y: q.y, a: q.a }); MCS.cuerpo.setVeh('bici'); const ant = { x: MCS.cuerpo.x, y: MCS.cuerpo.y, min: MCS.reloj.min };
      document.querySelector('#bRun').hidden = false; document.querySelector('#bRun').click(); await new Promise(r => setTimeout(r, 2500)); const dentro = MC.Run.activo, s = MC.Run.g.p.s; MC.Run.salir(); await new Promise(r => setTimeout(r, 400));
      return { dentro, s: Math.round(s), lejos: Math.round(Math.hypot(MCS.cuerpo.x - ant.x, MCS.cuerpo.y - ant.y)), enCiclo: MCS.mundo.esCiclovia(MCS.cuerpo.x, MCS.cuerpo.y, 25) || MCS.mundo.red('rueda').cercana(MCS.cuerpo.x, MCS.cuerpo.y, 10) != null, dmin: MCS.reloj.min - ant.min, clima: MCS.clima.tipo }; });
    ok(run.dentro && run.s > 5 && run.enCiclo && run.dmin >= 0 && run.dmin < 10, 'Run en la ciclovía: entra, corre y vuelve al mundo en el punto donde iba, a la misma hora', run);
    /* rendimiento: CPU 4× más lenta, tiempo de dibujo (mediana) por vista */
    const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const med = await p.evaluate(async () => { const out = {}; MCS.vistas.auto = false; MCS.vistas.calidad = .8; for (const v of ['cenital', 'ciudad3d', 'maqueta', 'lateral', 'pano']) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit' + (MC.VISTAS.findIndex(q => q.id === v) + 1) })); await new Promise(r => setTimeout(r, 1500)); const L = []; const t = performance.now(); while (performance.now() - t < 2500) { await new Promise(r => requestAnimationFrame(r)); L.push(MCS.vistas.ms); } L.sort((a, b) => a - b); out[v] = +L[L.length >> 1].toFixed(1); if (MCS.vistas.actual.id !== v || !L[L.length >> 1]) out[v] = 99; } return out; });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    ok(Object.values(med).every(m => m < 40), 'CPU 4× más lenta: mediana del dibujo menor a 40 ms en las vistas 2D, la lateral y la panorámica', med);
    ok(!errs.length, 'sin errores en la consola', errs.slice(0, 3)); await b.close();
  }
  /* el minijuego Mandados: mi casa, diseño, lugares, historias y que la interfaz no tape el centro */
  const mh = path.join(RAIZ, 'dist/juegos/mandados.html');
  /* 2.5.1: jugable en un celular de verdad (táctil): joystick visible que mueve, cámara legible, todo libre y el primer mandado cerca; 2.6: el tutorial es opcional y los árboles se levantan */
  if (chromium && fs.existsSync(mh)) {
    const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(urlPrueba(mh)); await p.tap('#jugar'); await p.waitForFunction(() => window.MANDADOS && window.MANDADOS.mision, null, { timeout: 120000 }); await p.waitForTimeout(1200);
    const tuto = await p.$('.dialogo button'), opcional = !!(await p.$('#comoSe')); if (tuto) await tuto.tap(); await p.waitForTimeout(300);
    const a = await p.evaluate(() => { const G = window.MANDADOS, P = G.mision.actual, j = document.querySelector('.joy'); return { x: G.cuerpo.x, y: G.cuerpo.y, libre: G.libre, vehiculos: G.vehiculos, pxPorMetro: +(G.camara.zoom / (G.vistas.dpr || Math.min(2, devicePixelRatio))).toFixed(1), joystick: !!j && j.getBoundingClientRect().width > 80, primerMandado: Math.round(Math.hypot(P.x - G.cuerpo.x, P.y - G.cuerpo.y)) }; });
    const cdp = await ctx.newCDPSession(p), sx = 412 * .25, sy = 860 * .8;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy, id: 1 }] });
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx, y: sy - i * 6, id: 1 }] }); await p.waitForTimeout(30); }
    await p.waitForTimeout(2000); const movio = await p.evaluate(c => +Math.hypot(MANDADOS.cuerpo.x - c.x, MANDADOS.cuerpo.y - c.y).toFixed(1), a); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const arte = await p.evaluate(async () => { for (let i = 0; i < 100 && !MC.Sprites.atlases.get('gemini_u_noche'); i++) await new Promise(q => setTimeout(q, 50)); MANDADOS.ponVista('maqueta'); MANDADOS.reloj.min = 20.5 * 60; await new Promise(q => setTimeout(q, 700)); const arboles = MC.Arboleda._sp.size; MANDADOS.ponVista('cenital'); const L = [...MC.Sprites.atlases.values()]; return { arboles, piel: MC.arte.activa, atlas: L.filter(A => A.listo && A.id.startsWith('gemini')).length, faltan: MC.Pieles.faltan().length, icono: MC.Pieles.icono('vista_cenital').startsWith('<svg') }; });
    const r = { tutorialOpcional: !tuto && opcional, libre: a.libre, vehiculos: a.vehiculos, pxPorMetro: a.pxPorMetro, joystick: a.joystick, primerMandado: a.primerMandado, movio, arte };
    const est = await p.evaluate(async () => { const out = {}; for (const e of MC.Estilo.lista().map(q => q.id)) { MANDADOS.ponEstilo(e); for (const v of ['maqueta', 'cenital']) { MANDADOS.ponVista(v); await new Promise(q => setTimeout(q, 350)); } out[e] = +MANDADOS.vistas.ms.toFixed(1); } MANDADOS.ponEstilo('realista'); return out; });
    r.estilos = est;
    const artes = await p.evaluate(async () => {
      MC.arte.usar('chatgpt');
      try {
        const g=document.createElement('canvas').getContext('2d'), tex=MC.arte.f('textura');
        const t=tex('asfalto'), origen=g.getImageData(0,0,1,1);
        const pixels=t.imagen.getContext('2d').getImageData(0,0,128,128).data;
        const junta = Array.from({length:128},(_,i)=>[0,1,2].every(c=>pixels[(i*128)*4+c]===pixels[(i*128+127)*4+c])).every(Boolean);
        const S=MC.Sprites, ref='chatgpt_p/persona0_camina';
        const pose=MC.Personaje.pose('camina',Math.PI);
        const fase=S.cuadro(ref,{fase:pose.fase}), cero=S.cuadro(ref,{fase:0});
        const V={z:1,a:1,b:0,c:0,d:1,e:0,f:0};
        function trama(e){g.fillStyle='#777';g.fillRect(0,0,33,2);MC.Estilo.imprimir(g,33,2,{...V,e},true);return g.getImageData(0,0,33,2).data;}
        const b0=trama(0), b1=trama(1);
        const estable=Array.from({length:32},(_,i)=>b0[i*4]===b1[(i+1)*4] && [0,255].includes(b0[i*4])).every(Boolean);
        const D={g,E:{t:1,camara:{x:0,y:0},mundo:{suelo:()=>MC.TT.ROAD}},z:4,P:{k:.5},pr:(x,y)=>[x+50,y+50],noche:0};
        const mediciones=[];let cuantos=0;
        for(let j=0;j<15;j++){const t0=performance.now();for(let i=0;i<30;i++)cuantos=MC.Vista2D.charcos(D,1);mediciones.push((performance.now()-t0)/30);}
        mediciones.sort((a,b)=>a-b);
        return {metros:t.metros,junta,estable,fase:!!fase && fase.c!==cero.c,respaldo:tex('material_ausente')===null,charcos:cuantos,ms:+mediciones[7].toFixed(3)};
      } finally { MC.arte.usar('gemini'); }
    });
    ok(artes.metros===4 && artes.junta && artes.respaldo && artes.fase && artes.estable && artes.charcos>0 && artes.charcos<=20 && artes.ms<2,'Arte ChatGPT, loseta periódica, animación por fase, trama estable y coste de charcos',artes);
    ok(Object.keys(est).length >= 12 && Object.values(est).every(x => x >= 0 && x < 60) && !errs.length, 'Mandados: los 12 estilos gráficos (realista, clásico, cómic, 1 bit, manga, anime, novela gráfica, ukiyo-e, vintage, CRT, térmico y acuarela) dibujan sin errores', est);
    ok(r.tutorialOpcional && arte.arboles > 0 && r.libre && r.vehiculos >= 30 && r.pxPorMetro >= 8 && r.joystick && r.primerMandado < 900 && r.movio > 2 && arte.piel === 'gemini' && arte.atlas >= 10 && arte.faltan === 0 && arte.icono && !errs.length, 'Mandados en un celular táctil: el tutorial es opcional, todo libre y gratis, árboles de pie, joystick visible que mueve, cámara legible, el primer mandado cerca y el arte de Gemini cargado (de día y de noche)', r);
    await b.close();
  }
  if (chromium && fs.existsSync(mh)) {
    const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 412, height: 860 } }), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(urlPrueba(mh)); await p.click('#jugar'); await p.waitForFunction(() => window.MANDADOS, null, { timeout: 120000 }); await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => { const G = window.MANDADOS, tapa = MC.UI.verificar(G.ui), R = G.ponHogar('Calle 31 # 28-15'); G.cuerpo.x = G.hogar.d.x; G.cuerpo.y = G.hogar.d.y + 3; G.abrirCasa(); await new Promise(q => setTimeout(q, 600)); const barra = !document.querySelector('#barraCasa').hidden;
      document.querySelector('#bcEstilo').click(); const est = G.hogar.plano().estilo; document.querySelector('#bcSalir').click(); await new Promise(q => setTimeout(q, 400)); G.ponVista('lateral'); await new Promise(q => setTimeout(q, 800));
      G.ui.ficha('lugar', '📍 Guatapé y la Piedra del Peñol · un nombre de lugar muy largo para probar'); G.ui.aviso('🏊 Nadando: cansa rápido'); G.ui.aviso('📦 Mandado nuevo: un texto largo de prueba que ocupa varias líneas en la columna de arriba'); await new Promise(q => setTimeout(q, 400)); const tapaLargo = MC.UI.verificar(G.ui);
      const amb = document.querySelector('#bcInfo').textContent;
      /* entrar al agua desde la bici con el botón «Al agua» y bucear con «Bucear» */
      const MGd = G.mundo; let o2 = null; for (let x = 60; x < MGd.ancho && !o2; x += 11) for (let y = 60; y < MGd.alto && !o2; y += 13) { const a = MC.Terreno.aguaEn(MGd, x, y); if (!a || a.tipo !== 'lago' || a.orilla > 5) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const tx = x + dx * 6, ty = y + dy * 6; if (!MC.Terreno.aguaEn(MGd, tx, ty) && !MGd.edificioEn(tx, ty, 2) && MC.Terreno.pendiente(MGd, tx, ty) < .4) { o2 = { tx, ty, x, y }; break; } } }
      G.cuerpo.setVeh('bici'); G.cuerpo.x = o2.tx; G.cuerpo.y = o2.ty; await new Promise(q => setTimeout(q, 700)); const vioBoton = !G.botones.bAgua.hidden; G.botones.bAgua.click(); G.cuerpo.x = o2.x; G.cuerpo.y = o2.y; await new Promise(q => setTimeout(q, 900));
      const agua = { vioBoton, aPie: G.cuerpo.veh.id === 'pie', parqueada: !!G.cuerpo.estacionado, vadea: G.cuerpo.vadeando || G.cuerpo.nadando }; const U = G.darUrbe(), zon = U.zonificar('R', G.cuerpo.x, G.cuerpo.y, 200); G.ponCapa('valor'); await new Promise(q => setTimeout(q, 700)); const crec = U.avanzar(4).nuevos; G.ponCapa('zonas'); await new Promise(q => setTimeout(q, 500)); G.ponCapa(null);
      return { tapa, tapaLargo, agua, tapaDespues: MC.UI.verificar(G.ui), calidad: R.ubicacion.calidad, barra, estilo: est, ambiente: amb.slice(0, 40), lugares: MC.Lugares.en(G.mundo, 0, 0, G.mundo.ancho, G.mundo.alto).length, vista: G.vistas.actual.id, zonas: zon, crecen: crec, ocurrencias: G.ocu.resumen() }; });
    ok(r.tapa.length === 0 && r.tapaLargo.length === 0 && r.tapaDespues.length === 0 && r.agua.vioBoton && r.agua.aPie && r.agua.parqueada && r.agua.vadea && r.calidad === 'exacta' && r.barra && r.estilo && /Ambiente/.test(r.ambiente) && r.lugares > 20 && ['cenital', 'lateral'].includes(r.vista) && r.zonas > 0 && !errs.length, 'Mandados: la interfaz no tapa el centro; al agua desde la bici; mi casa con alguien que vive ahí; modo alcalde con capas de datos y crecimiento', r);
    await b.close();
  }
}
console.log((mal ? '✗ ' + mal + ' pruebas fallaron' : '✓ TODAS LAS PRUEBAS PASARON') + ' · ' + bien + ' bien · ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
process.exit(mal ? 1 : 0);
