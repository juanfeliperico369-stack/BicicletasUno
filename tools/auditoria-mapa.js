/* AUDITORÍA DEL MAPA (idea de la auditoría de El Metro: «medir siempre igual»).
   Carga el juego construido en un navegador sin pantalla y mide el mapa real que se juega (JE.map):
   río, agua, escaleras, andenes, estaciones, sitios reales y seguridad. Uso:
     node tools/auditoria-mapa.js [dist/juega-encicla.html] [--json salida.json]
   Las mismas cifras de la tabla de docs/AUDITORIA-MAPA.md; se corre antes y después de cada cambio del mapa. */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const args = process.argv.slice(2), jI = args.indexOf('--json'), outJ = jI >= 0 ? args[jI + 1] : null;
const file = path.resolve(args.find((a, i) => !a.startsWith('--') && (jI < 0 || i !== jI + 1)) || path.join(__dirname, '..', 'dist', 'juega-encicla.html'));
(async () => {
  const html = fs.readFileSync(file, 'utf8');
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('file://' + file); await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 120000 });
  const r = await p.evaluate(() => {
    const M = JE.map, t = M.t, W = MW, H = MH, T = TT, out = {};
    // río: su curso (VM.river) casilla a casilla, de Caldas a Barbosa
    const R = M.river, pts = R && R.pts ? R.pts : []; let cortes = 0, enCorte = false, sube = 0, maxSube = 0, n = 0;
    const paso = 200 / VM.tile * TS, alt = []; let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], c = pts[i], L = Math.hypot(c.x - a.x, c.y - a.y);
      for (let s = 0; s < L; s += TS / 2) {
        const x = a.x + (c.x - a.x) * s / L, y = a.y + (c.y - a.y) * s / L, v = M.get(Math.floor(x / TS), Math.floor(y / TS)); n++;
        const agua = v === T.WATER || v === T.BRIDGE || v === T.CANAL; if (!agua && !enCorte) cortes++; enCorte = !agua;
        acc += TS / 2; if (acc >= paso) { acc = 0; alt.push(M.elev(x, y)); }
      }
    }
    for (let i = 1; i < alt.length; i++) { const d = alt[i] - alt[i - 1]; if (d > 3) { sube++; maxSube = Math.max(maxSube, d); } }   // el río corre de sur a norte: debe bajar
    if (alt.length && alt[0] < alt[alt.length - 1]) out.rioSentido = 'al revés';
    out.rio = { muestras: n, cortes, tramosQueSuben: sube, maxSubida: Math.round(maxSube) };
    // manchones de agua (1 a 4 casillas sueltas), escaleras sueltas y casillas de andén
    const vis = new Uint8Array(W * H); let manch = 0, manchCiudad = 0, agua = 0, esc = 0, sueltas = 0, anden = 0, edif = 0, casa = 0;
    for (let i = 0; i < W * H; i++) {
      const v = t[i]; if (v === T.WALK) anden++; else if (v === T.BLDG) edif++; else if (v === T.BRICK) casa++;
      if (v === T.STEPS) { esc++; const x = i % W, y = (i / W) | 0; let k = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (M.get(x + dx, y + dy) === T.STEPS) k++; if (!k) sueltas++; }
      if (v !== T.WATER || vis[i]) continue; agua++; const q = [i]; vis[i] = 1; let sz = 0;
      const comp = []; while (q.length && sz < 6) { const k = q.pop(); sz++; comp.push(k); const x = k % W, y = (k / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!vis[j] && t[j] === T.WATER) { vis[j] = 1; q.push(j); } } }
      if (sz <= 4 && !q.length) { manch++; let verde = false; for (const k of comp) for (const d of [1, -1, W, -W, W + 1, W - 1, -W + 1, -W - 1]) { const v = t[k + d]; if (v === T.GRASS || v === T.MOUNT || v === T.PLAZA || v === T.LAND || v === T.CANAL || v === T.BRIDGE) verde = true; } if (!verde) manchCiudad++; }   // en plena ciudad (sin parque, monte, retiro ni puente al lado) son restos
    }
    out.agua = { cuerposDeAgua: agua, manchonesDe1a4: manch, enPlenaCiudad: manchCiudad };
    out.escaleras = { casillas: esc, sueltas };
    out.suelo = { anden, edificios: edif, casas: casa, casilla_m: VM.tile };
    // estaciones EnCicla, lugares con postal y sitios reales
    out.estaciones = { encicla: M.stations.length, descartadas: (M.dropped || []).length, metroA: (M.metroA || []).length };
    const D = M.sit; out.lugares = { total: LANDMARKS.length, conFormaReal: LANDMARKS.filter(L => L.real).length };
    if (D) out.sitios = { sitios: D.S.length, edificios: D.E.length, emblematicos: D.E.filter(e => e.P).length, partes: D.E.reduce((a, e) => a + (e.P ? e.P.length : 0), 0), canchas: D.C.length, pistas: D.P.length, piscinas: D.W.length, ocultos: D.E.filter(e => e.oculto).length };
    out.version = JE.version;
    return out;
  });
  r.seguridad = { csp: /http-equiv="Content-Security-Policy"/.test(html), referrer: /name="referrer" content="no-referrer"/.test(html), tamanoMB: +(html.length / 1048576).toFixed(2) };
  await b.close();
  const filas = [
    ['Versión', r.version], ['Río: cortes del agua de Caldas a Barbosa', r.rio.cortes], ['Río: tramos de 200 m que suben más de 3 m', r.rio.tramosQueSuben + ' (máx. ' + r.rio.maxSubida + ' m)'],
    ['Manchones de agua de 1 a 4 casillas (en plena ciudad)', r.agua.manchonesDe1a4 + ' (' + r.agua.enPlenaCiudad + ')'], ['Escaleras de una sola casilla', r.escaleras.sueltas + ' de ' + r.escaleras.casillas], ['Casillas de andén', r.suelo.anden],
    ['Estaciones EnCicla en el mapa', r.estaciones.encicla + (r.estaciones.descartadas ? ' (' + r.estaciones.descartadas + ' sin lugar)' : '')], ['Lugares con postal con su forma real', r.lugares.conFormaReal + ' de ' + r.lugares.total],
    ['Sitios reales · edificios · emblemáticos', r.sitios ? r.sitios.sitios + ' · ' + r.sitios.edificios + ' · ' + r.sitios.emblematicos + ' (' + r.sitios.partes + ' partes)' : '—'],
    ['Canchas · pistas · piscinas', r.sitios ? r.sitios.canchas + ' · ' + r.sitios.pistas + ' · ' + r.sitios.piscinas : '—'],
    ['Content-Security-Policy · sin referrer', (r.seguridad.csp ? 'sí' : 'no') + ' · ' + (r.seguridad.referrer ? 'sí' : 'no')], ['Tamaño del HTML', r.seguridad.tamanoMB + ' MB']];
  console.log('| Medida | Valor |\n|---|---|\n' + filas.map(([a, v]) => '| ' + a + ' | ' + v + ' |').join('\n'));
  if (outJ) fs.writeFileSync(outJ, JSON.stringify(r, null, 1));
})();
