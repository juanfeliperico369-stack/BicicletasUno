#!/usr/bin/env node
/* Mide el mapa de Juega EnCicla (lo mismo que mide El Metro con su tools/auditoria-mapa.mjs), sobre el juego compilado:
   1) estaciones EnCicla: distancia a su punto real y casilla donde quedaron;
   2) río: cortes (tramos del curso que no son agua ni puente) y subidas a lo largo de su cauce de Caldas a Barbosa;
   3) metro y tranvía: porcentaje del trazado sobre casas o edificios;
   4) escaleras sueltas (una casilla sin vecinas);
   5) calles con nombre y casas con barrio, por municipio.
   Uso: node tools/auditoria-mapa.js [--file=dist/juega-encicla.html]   → imprime el resumen y guarda tests/out/auditoria-mapa.json */
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), arg = k => { const a = process.argv.find(x => x.startsWith('--' + k)); return a ? a.split('=')[1] : null; };
const FILE = path.join(ROOT, arg('file') || 'dist/juega-encicla.html');
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 60000 });
  const R = await p.evaluate(() => {
    const M = JE.map, MPX = M_PER_PX, out = {}, T = (x, y) => M.get(Math.floor(x / TS), Math.floor(y / TS)), casa = v => v === TT.BRICK || v === TT.BLDG;
    // 1) estaciones
    const d = M.stations.map(s => { const g = geoP(s.lat, s.lon); return Math.hypot(g.x - s.x, g.y - s.y) * MPX; }).sort((a, b) => a - b);
    out.estaciones = { n: M.stations.length, mediana_m: Math.round(d[d.length >> 1]), p90_m: Math.round(d[Math.floor(d.length * .9)]), max_m: Math.round(d[d.length - 1]), sobre_casa: M.stations.filter(s => casa(T(s.x, s.y))).length };
    // 2) río: muestras cada 10 m por su curso
    const Rv0 = M.river, paso = 10 / MPX, dentroMapa = q => q.x >= 0 && q.y >= 0 && q.x < MW * TS && q.y < MH * TS; let cortes = 0, enCorte = false, seco = 0, n = 0, subidas = 0, maxSub = 0; const el = [];
    // el trazado del río sigue más allá del borde del mapa: se mide solo lo que queda dentro
    let sA = 0, sB = Rv0.len; while (sA < Rv0.len && !dentroMapa(M.at(Rv0, sA))) sA += paso; while (sB > sA && !dentroMapa(M.at(Rv0, sB))) sB -= paso;
    const Rv = { len: sB - sA, at: s => M.at(Rv0, sA + s) };
    // un punto del curso cuenta como agua si hay agua a una casilla (el trazado puede ir corrido 10 m) o si es un puente o una vía que cruza (puente)
    const mojado = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS), v = M.get(tx, ty); if (v === TT.WATER || v === TT.CANAL || v === TT.BRIDGE) return true; let w = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (M.get(tx + dx, ty + dy) === TT.WATER) w = true; return w; };
    for (let s = 0; s <= Rv.len; s += paso) { const q = Rv.at(s), agua = mojado(q.x, q.y); n++; if (!agua) { seco++; if (!enCorte) cortes++; } enCorte = !agua; el.push(M.elev(q.x, q.y)); }
    // el río corre hacia el norte: el cauce debe bajar desde el extremo sur (más alto) hacia el norte
    const sur = el[0] > el[el.length - 1] ? el : el.slice().reverse(); for (let i = 10; i < sur.length; i += 10) { const sub = sur[i] - sur[i - 10]; if (sub > 1) { subidas++; maxSub = Math.max(maxSub, sub); } }
    // continuidad real: ¿se llega por agua (o por un puente o una vía que la cruza) del extremo sur al norte, sin salir de 300 m del cauce?
    const cor = new Uint8Array(MW * MH), RR = 30; for (let s = 0; s <= Rv.len; s += 5 / MPX) { const q = Rv.at(s), tx = Math.floor(q.x / TS), ty = Math.floor(q.y / TS); for (let dy = -RR; dy <= RR; dy++) for (let dx = -RR; dx <= RR; dx++) { const x = tx + dx, y = ty + dy; if (x >= 0 && y >= 0 && x < MW && y < MH) cor[y * MW + x] = 1; } }
    const pasa = i => { const v = M.t[i]; return cor[i] && (v === TT.WATER || v === TT.CANAL || v === TT.BRIDGE || v === TT.AVE || v === TT.ROAD || v === TT.AUTO); };
    const cerca = q => { const tx = Math.floor(q.x / TS), ty = Math.floor(q.y / TS); let b = -1, bd = 1e9; for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) { const i = (ty + dy) * MW + tx + dx; if (M.t[i] === TT.WATER && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; b = i; } } return b; };
    const a0 = cerca(Rv.at(0)), a1 = cerca(Rv.at(Rv.len)), vis = new Uint8Array(MW * MH), cola = [a0]; let llega = false; if (a0 >= 0) vis[a0] = 1;
    while (cola.length && a0 >= 0) { const i = cola.pop(); if (i === a1) { llega = true; break; } const x = i % MW, y = (i / MW) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = (y + dy) * MW + x + dx; if ((dx || dy) && !vis[j] && pasa(j)) { vis[j] = 1; cola.push(j); } } }
    out.rio = { km: +(Rv.len * MPX / 1000).toFixed(1), continuo: llega, tramos_del_trazado_lejos_del_agua: cortes, lejos_pct: +(seco / n * 100).toFixed(1), subidas_100m: subidas, subida_max_m: +maxSub.toFixed(1) };
    // 3) metro y tranvía sobre casas
    const sobre = P => { let c = 0, k = 0; for (let s = 0; s <= P.len; s += paso) { const q = M.at(P, s); k++; if (casa(T(q.x, q.y))) c++; } return +(c / k * 100).toFixed(1); };
    out.lineas_sobre_casas_pct = { A: sobre(M.lineA), B: sobre(M.lineB), T: sobre(M.tram) };
    // 4) escaleras sueltas
    let sueltas = 0, esc = 0; for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) { if (M.t[y * MW + x] !== TT.STEPS) continue; esc++; let v = 0; for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (M.t[(y + c) * MW + x + a] === TT.STEPS) v++; if (!v) sueltas++; }
    out.escaleras = { casillas: esc, sueltas };
    // 5) nombres y barrios por municipio (muestra cada 3 casillas)
    const mun = {}; for (let y = 0; y < MH; y += 3) for (let x = 0; x < MW; x += 3) {
      const v = M.t[y * MW + x], px = (x + .5) * TS, py = (y + .5) * TS; if (!(v === TT.ROAD || v === TT.AVE || v === TT.AUTO || casa(v))) continue; const m = M.muniAt(px, py); if (!m) continue; const o = mun[m] || (mun[m] = { vias: 0, conNombre: 0, casas: 0, conBarrio: 0 });
      if (casa(v)) { o.casas++; if (M.barrioAt(px, py)) o.conBarrio++; } else { o.vias++; if (M.calleAt(px, py)) o.conNombre++; }
    }
    out.municipios = Object.fromEntries(Object.entries(mun).map(([k, o]) => [k, { calles_con_nombre_pct: Math.round(o.conNombre / Math.max(1, o.vias) * 100), casas_con_barrio_pct: Math.round(o.conBarrio / Math.max(1, o.casas) * 100) }]));
    return out;
  });
  await b.close();
  fs.mkdirSync(path.join(ROOT, 'tests', 'out'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'tests', 'out', 'auditoria-mapa.json'), JSON.stringify(R, null, 1));
  const E = R.estaciones, Rv = R.rio, L = R.lineas_sobre_casas_pct;
  console.log(`Estaciones EnCicla: ${E.n} · a ${E.mediana_m} m de su punto (mediana; p90 ${E.p90_m} m, máx ${E.max_m} m) · ${E.sobre_casa} sobre casas`);
  console.log(`Río: ${Rv.km} km · ${Rv.continuo ? 'continuo de Caldas a Barbosa' : 'CORTADO'} · trazado a más de 10 m del agua en ${Rv.lejos_pct} % · ${Rv.subidas_100m} subidas del relieve en tramos de 100 m (máx ${Rv.subida_max_m} m)`);
  console.log(`Metro y tranvía sobre casas: A ${L.A} % · B ${L.B} % · T ${L.T} %`);
  console.log(`Escaleras: ${R.escaleras.casillas} casillas, ${R.escaleras.sueltas} sueltas`);
  console.log('Calles con nombre y casas con barrio por municipio:'); for (const [k, o] of Object.entries(R.municipios)) console.log(`  ${k.padEnd(12)} calles ${String(o.calles_con_nombre_pct).padStart(3)} % · barrios ${String(o.casas_con_barrio_pct).padStart(3)} %`);
  console.log('Detalle: tests/out/auditoria-mapa.json');
})().catch(e => { console.error(e); process.exit(1); });
