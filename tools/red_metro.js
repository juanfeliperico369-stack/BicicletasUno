#!/usr/bin/env node
/* Trae de El Metro (repositorio hermano MetroZero) lo que le faltaba a la red de transporte de Juega EnCicla y lo deja en
   src/data/red_metro.json (lo lee tools/build.js como RED_M; lo usa src/js/98x-red.js):
   - los 12 ALIMENTADORES (buses integrados del Metro) con su recorrido por las calles y sus paraderos;
   - las LÍNEAS FUTURAS: Metro de la 80 (en obra, por su recorrido de calles), Tren del Río y Metrocable San Antonio de Prado
     (proyectos, de estación a estación);
   - las ESCALERAS ELÉCTRICAS de la Comuna 13;
   - los DATOS de cada estación y de cada línea (lo que se sabe y lo poco conocido), con la versión de los datos.
   Fuentes: MetroZero/src/data/red.js (RED, datos 2026-11; fuentes en MetroZero/docs/FUENTES.md) y rutas_calles.js
   (© colaboradores de OpenStreetMap, ODbL, vía Overture Maps). Los dos juegos salen del mismo Motor del Valle:
   metros del mapa de El Metro × 1,6 = px de EnCicla (1 m = 1,6 px). Las estaciones van con geoP del juego (lat, lon).
   Uso: node tools/red_metro.js [../MetroZero]   (los recorridos se simplifican a 1 m: Ramer–Douglas–Peucker) */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), MZ = path.resolve(ROOT, process.argv[2] || '../MetroZero'), D = f => fs.readFileSync(path.join(MZ, 'src', 'data', f), 'utf8');
const RED = new Function(D('red.js') + ';return RED;')(), RC = new Function(D('rutas_calles.js') + ';return RUTAS_CALLES;')(), K = 1.6;
/* Ramer–Douglas–Peucker sobre [x, y, x, y…] (tolerancia en metros) */
function rdp(a, tol) {
  const n = a.length / 2; if (n < 3) return a.slice(); const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1; const st = [[0, n - 1]];
  while (st.length) { const [i, j] = st.pop(); let mx = -1, mi = -1; const ax = a[2 * i], ay = a[2 * i + 1], bx = a[2 * j], by = a[2 * j + 1], L = Math.hypot(bx - ax, by - ay) || 1e-9;
    for (let k = i + 1; k < j; k++) { const d = Math.abs((bx - ax) * (ay - a[2 * k + 1]) - (ax - a[2 * k]) * (by - ay)) / L; if (d > mx) { mx = d; mi = k; } }
    if (mx > tol) { keep[mi] = 1; st.push([i, mi], [mi, j]); } }
  const r = []; for (let k = 0; k < n; k++) if (keep[k]) r.push(a[2 * k], a[2 * k + 1]); return r;
}
const px = a => rdp(a, 1).map(v => Math.round(v * K));
const est = L => L.stations.map(([n, la, lo]) => [n, la, lo]);
const out = { fuente: 'El Metro (MetroZero/src/data/red.js ' + RED.version + ' y rutas_calles.js) · © colaboradores de OpenStreetMap (ODbL)', version: RED.version, alim: [], fut: [], esc: null, datos: RED.stationFacts || {}, hechos: {} };
for (const L of RED.lines) {
  if (L.facts && L.facts.length) out.hechos[L.id] = L.facts;
  if (L.kind === 'feeder') { const p = RC[L.id]; if (!p) { console.warn('sin recorrido:', L.id); continue; } out.alim.push({ id: L.id.replace(/^AL-/, ''), n: L.name.replace(/^Alimentador\s+\S+\s+/, ''), c: L.color, st: est(L), p: px(p) }); }
  else if (L.kind === 'future') out.fut.push({ id: L.id, n: L.name, c: L.color, estado: L.status, st: est(L), p: RC[L.id] ? px(RC[L.id]) : null });
  else if (L.kind === 'escalator') out.esc = { id: L.id, n: L.name, c: L.color, st: est(L), hechos: L.facts || [] };
}
const f = path.join(ROOT, 'src', 'data', 'red_metro.json'); fs.writeFileSync(f, JSON.stringify(out));
console.log('red_metro.json:', (fs.statSync(f).size / 1024).toFixed(1) + ' KB ·', out.alim.length, 'alimentadores ·', out.fut.length, 'futuras ·', Object.keys(out.datos).length, 'datos de estaciones ·', out.alim.reduce((a, l) => a + l.p.length / 2, 0), 'puntos de recorrido');
