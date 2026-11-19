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
const ctx = { console, require, process, Buffer, TextDecoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
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
let agua = null; for (let i = 0; i < 4000 && !agua; i++) { const x = col.x + (i % 63) * 10 - 300, y = col.y + Math.floor(i / 63) * 10 - 300; if (M.suelo(x, y) === MC.TT.WATER) agua = { x, y }; }
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

if (process.argv.includes('--navegador')) {
  console.log('15) Banco de pruebas en Chromium');
  const html = path.join(RAIZ, 'dist/motor-city.html'); let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.log('  (sin playwright: se salta)'); }
  if (chromium && fs.existsSync(html)) {
    const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }), p = await b.newPage({ viewport: { width: 412, height: 860 } }), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + html); await p.waitForFunction(() => window.MCS && MCS.listo, null, { timeout: 120000 });
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
  if (chromium && fs.existsSync(mh)) {
    const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 412, height: 860 } }), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + mh); await p.click('#jugar'); await p.waitForFunction(() => window.MANDADOS, null, { timeout: 120000 }); await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => { const G = window.MANDADOS, tapa = MC.UI.verificar(G.ui), R = G.ponHogar('Calle 31 # 28-15'); G.cuerpo.x = G.hogar.d.x; G.cuerpo.y = G.hogar.d.y + 3; G.abrirCasa(); await new Promise(q => setTimeout(q, 600)); const barra = !document.querySelector('#barraCasa').hidden;
      document.querySelector('#bcEstilo').click(); const est = G.hogar.plano().estilo; document.querySelector('#bcSalir').click(); await new Promise(q => setTimeout(q, 400)); G.ponVista('lateral'); await new Promise(q => setTimeout(q, 800));
      const amb = document.querySelector('#bcInfo').textContent; const U = G.darUrbe(), zon = U.zonificar('R', G.cuerpo.x, G.cuerpo.y, 200); G.ponCapa('valor'); await new Promise(q => setTimeout(q, 700)); const crec = U.avanzar(4).nuevos; G.ponCapa('zonas'); await new Promise(q => setTimeout(q, 500)); G.ponCapa(null);
      return { tapa, tapaDespues: MC.UI.verificar(G.ui), calidad: R.ubicacion.calidad, barra, estilo: est, ambiente: amb.slice(0, 40), lugares: MC.Lugares.en(G.mundo, 0, 0, G.mundo.ancho, G.mundo.alto).length, vista: G.vistas.actual.id, zonas: zon, crecen: crec, ocurrencias: G.ocu.resumen() }; });
    ok(r.tapa.length === 0 && r.tapaDespues.length === 0 && r.calidad === 'exacta' && r.barra && r.estilo && /Ambiente/.test(r.ambiente) && r.lugares > 20 && ['cenital', 'lateral'].includes(r.vista) && r.zonas > 0 && !errs.length, 'Mandados: la interfaz no tapa el centro; mi casa con alguien que vive ahí; modo alcalde con capas de datos y crecimiento', r);
    await b.close();
  }
}
console.log((mal ? '✗ ' + mal + ' pruebas fallaron' : '✓ TODAS LAS PRUEBAS PASARON') + ' · ' + bien + ' bien · ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
process.exit(mal ? 1 : 0);
