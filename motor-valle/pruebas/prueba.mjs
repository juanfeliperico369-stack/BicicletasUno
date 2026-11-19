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
const Vs = [...MC.Vehiculos.lista.values()]; ok(Vs.length >= 34 && Vs.every(v => v.vmax > 0 && (v.suelo || []).length === 17), 'registro único de vehículos con sus cifras', Vs.length);
ok(['pie', 'bici', 'ebike', 'patinete', 'skate', 'patines', 'monopatin', 'moto', 'carro', 'camion', 'avioneta', 'lancha', 'metro', 'cable'].every(id => MC.Vehiculos.lista.has(id)), 'a pie, micromovilidad, motor, aire, agua y transporte');
ok(MC.Vehiculos.get('ebike').manubrio && MC.Vehiculos.get('ebike').de === 'bici', 'un vehículo hereda lo que no dice de su base');
ok(['quieto', 'camina', 'corre', 'pedalea', 'impulsa', 'patina', 'tabla', 'sentado', 'salta', 'cae'].every(e => Object.values(MC.Personaje.pose(e, 1.3)).every(v => !Array.isArray(v) || v.every(isFinite))), 'la pose del personaje en todos los estados');
const via = M.viaCercana(col.x, col.y, 80), B = new MC.Cuerpo(M, { x: via.x, y: via.y, a: via.ang, veh: 'bici' }); for (let i = 0; i < 300; i++) B.actualizar(1 / 30, { acel: 1 });
ok(B.v > 3, 'la bici acelera por la calle', B.v.toFixed(1) + ' m/s');
const B2 = new MC.Cuerpo(M, { x: via.x, y: via.y, a: via.ang, veh: 'pie' }); B2.actualizar(1 / 30, { salto: true }); let maxZ = 0; for (let i = 0; i < 60; i++) { B2.actualizar(1 / 30, {}); maxZ = Math.max(maxZ, B2.z); } ok(maxZ > .2 && B2.z === 0 && !B2.enAire, 'saltar y caer', maxZ.toFixed(2) + ' m');
let agua = null; for (let i = 0; i < 4000 && !agua; i++) { const x = col.x + (i % 63) * 10 - 300, y = col.y + Math.floor(i / 63) * 10 - 300; if (M.suelo(x, y) === MC.TT.WATER) agua = { x, y }; }
if (agua) { const B3 = new MC.Cuerpo(M, { x: agua.x - 60, y: agua.y, a: 0, veh: 'carro' }); ok(!B3.puede(agua.x, agua.y) && new MC.Cuerpo(M, { veh: 'lancha' }).puede(agua.x, agua.y), 'el carro no entra al río; la lancha sí'); }

console.log('9) Huevos, guardado y compatibilidad');
MC.huevos.poner({ id: 'prueba', x: col.x, y: col.y, radio: 30 }); const h1 = MC.huevos.revisar({ x: col.x + 5, y: col.y }), h2b = MC.huevos.revisar({ x: col.x + 5, y: col.y }); ok(h1.length === 1 && h2b.length === 0, 'un huevo de pascua se cumple una sola vez');
const sv = MC.guardado.completar({ a: 1, b: { c: 2 } }, { a: 0, b: { c: 0, d: 5 }, e: [1] }); ok(sv.a === 1 && sv.b.c === 2 && sv.b.d === 5 && sv.e[0] === 1, 'guardado sin romper: lo nuevo con su valor por defecto');
const VC = MC.ValleCompat.desdeMundo(M, 16); ok(VC.suelo(1477, 2334) === M.sueloCasilla(1477, 2334) && Math.abs(VC.pxAMetros(16) - 10) < 1e-9, 'consultor 1.x (Valle) sobre el mundo 2.0, en px de EnCicla');
const vjs = fs.readFileSync(path.join(RAIZ, 'js/valle.js'), 'utf8'); ok(/version: '1\.2\.0'/.test(vjs), 'js/valle.js sigue siendo el lector 1.2.0 que incluye Juega EnCicla');
const OR = JSON.parse(fs.readFileSync(path.join(RAIZ, 'run/ORIGEN.json'), 'utf8')); ok(OR.parches.length >= 12 && fs.existsSync(path.join(RAIZ, 'run/run-scooter.js')), 'Run Scooter importado con sus parches', OR.commit);

if (process.argv.includes('--navegador')) {
  console.log('10) Banco de pruebas en Chromium');
  const html = path.join(RAIZ, 'dist/motor-city.html'); let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.log('  (sin playwright: se salta)'); }
  if (chromium && fs.existsSync(html)) {
    const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }), p = await b.newPage({ viewport: { width: 412, height: 860 } }), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + html); await p.waitForFunction(() => window.MCS && MCS.listo, null, { timeout: 120000 });
    const vistas = await p.evaluate(async () => { const out = {}; for (const [i, v] of MC.VISTAS.entries()) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit' + (i + 1) })); await new Promise(r => setTimeout(r, 900)); out[v.id] = MCS.vistas.actual.id; } MCS.vistas.pixel = true; await new Promise(r => setTimeout(r, 600)); MCS.vistas.pixel = false; return out; });
    ok(Object.keys(vistas).length === 8 && !errs.length, 'las 8 vistas y el pixel sin errores', vistas);
    const run = await p.evaluate(async () => { const r = MCS.mundo.red('rueda'), e = r.aristas.filter(a => a.k === MC.VIA.CICLO && a.largo > 300)[2], q = e.t.at(e.largo / 2); Object.assign(MCS.cuerpo, { x: q.x, y: q.y, a: q.a }); MCS.cuerpo.setVeh('bici'); const ant = { x: MCS.cuerpo.x, y: MCS.cuerpo.y, min: MCS.reloj.min };
      document.querySelector('#bRun').hidden = false; document.querySelector('#bRun').click(); await new Promise(r => setTimeout(r, 2500)); const dentro = MC.Run.activo, s = MC.Run.g.p.s; MC.Run.salir(); await new Promise(r => setTimeout(r, 400));
      return { dentro, s: Math.round(s), lejos: Math.round(Math.hypot(MCS.cuerpo.x - ant.x, MCS.cuerpo.y - ant.y)), enCiclo: MCS.mundo.esCiclovia(MCS.cuerpo.x, MCS.cuerpo.y, 25) || MCS.mundo.red('rueda').cercana(MCS.cuerpo.x, MCS.cuerpo.y, 10) != null, dmin: MCS.reloj.min - ant.min, clima: MCS.clima.tipo }; });
    ok(run.dentro && run.s > 5 && run.enCiclo && run.dmin >= 0 && run.dmin < 10, 'Run en la ciclovía: entra, corre y vuelve al mundo en el punto donde iba, a la misma hora', run);
    /* rendimiento: CPU 4× más lenta, tiempo de dibujo (mediana) por vista */
    const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const med = await p.evaluate(async () => { const out = {}; MCS.vistas.auto = false; MCS.vistas.calidad = .8; for (const v of ['cenital', 'ciudad3d', 'maqueta', 'pano']) { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit' + (MC.VISTAS.findIndex(q => q.id === v) + 1) })); await new Promise(r => setTimeout(r, 1500)); const L = []; const t = performance.now(); while (performance.now() - t < 2500) { await new Promise(r => requestAnimationFrame(r)); L.push(MCS.vistas.ms); } L.sort((a, b) => a - b); out[v] = +L[L.length >> 1].toFixed(1); if (MCS.vistas.actual.id !== v || !L[L.length >> 1]) out[v] = 99; } return out; });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    ok(Object.values(med).every(m => m < 40), 'CPU 4× más lenta: mediana del dibujo menor a 40 ms en las vistas 2D y la panorámica', med);
    ok(!errs.length, 'sin errores en la consola', errs.slice(0, 3)); await b.close();
  }
}
console.log((mal ? '✗ ' + mal + ' pruebas fallaron' : '✓ TODAS LAS PRUEBAS PASARON') + ' · ' + bien + ' bien · ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
process.exit(mal ? 1 : 0);
