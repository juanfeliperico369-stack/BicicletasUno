/* =====================================================================
   GENERADOR DE MUNDOS · mapas nuevos que no existen, con las mismas leyes que los reales
   Lo que sale es un MC.Mundo como el de Medellín: sirve en todas las vistas, con la física, el tráfico, la IA y Run.
   1. Relieve con ruido (fbm + crestas + deformación) y una forma: isla, valle (como el de Aburrá), costa, montaña o llanura.
   2. Ríos que bajan por la pendiente más fuerte desde los nacimientos altos hasta el mar o el borde.
   3. Biomas por temperatura (gradiente de 6,5 °C/km y latitud) y humedad: mar, playa, pasto, bosque, roca y nieve.
   4. Pueblos donde es plano y hay agua cerca: cuadrícula orientada, plaza con iglesia, lotes con casas cuya altura
      baja del centro a la orilla. Carreteras entre pueblos por A* sobre el costo de la pendiente, con puentes.
   5. Nombres, municipios, lugares (plazas, miradores) y un cable al cerro más alto si queda cerca.
   Determinista: la misma semilla da el mismo mundo.
   ===================================================================== */
const NOMBRES_PUEBLO = { pre: ['San', 'Santa', 'Villa', 'Puerto', 'Alto de', 'La', 'El', 'Valle de', 'Cerro', 'Llano'], raiz: ['Ánimas', 'Rosario', 'Guayacán', 'Ceibas', 'Pinos', 'Brisa', 'Cascada', 'Robles', 'Arenal', 'Laurel', 'Mirador', 'Esperanza', 'Palmas', 'Niebla', 'Cumbre', 'Orquídeas', 'Piedras', 'Garzas', 'Colibrí', 'Aurora'], santo: ['José', 'Rafael', 'Lucía', 'Antonio', 'Isidro', 'Bárbara', 'Vicente', 'Pedro', 'Elena', 'Jerónimo'] };
/* estilos por defecto para mundos sin ciudad configurada (los mismos nombres de zona que Medellín) */
const ZONAS_BASE = {
  pueblo: { nombre: 'Pueblo', muros: ['#f2eee4', '#ece6d8', '#e8dfcc', '#c46a40', '#3f7fbf', '#d9534f', '#f0c419'], techos: ['#b5542f', '#a8492a', '#c8653b'], plancha: .15, tanques: .1, teja: .85, arboles: .6, densidad: .55, pisos: [1, 3], suelo: '#c9bea6' },
  rural: { nombre: 'Rural', muros: ['#f2eee4', '#e8dfcc', '#c46a40'], techos: ['#b5542f', '#7d7f84'], plancha: .3, tanques: .2, teja: .6, arboles: 1, densidad: .15, pisos: [1, 2], suelo: '#6f9a52' },
  mixto: { nombre: 'Ciudad mixta', muros: ['#c25f37', '#d9cdb7', '#b4552f', '#e6dccb', '#a9b1bc'], techos: ['#7d7f84', '#b5542f', '#9c9d9f'], plancha: .45, tanques: .3, teja: .4, arboles: .45, densidad: .85, pisos: [1, 8], suelo: '#c4b79f' }
};
const Generador = {
  nombre(r) { const p = r.uno(NOMBRES_PUEBLO.pre); return p === 'San' || p === 'Santa' ? p + ' ' + (p === 'Santa' ? r.uno(['Lucía', 'Bárbara', 'Elena', 'Rosa', 'Ana']) : r.uno(NOMBRES_PUEBLO.santo)) : p + ' ' + r.uno(NOMBRES_PUEBLO.raiz); },
  /* op: { semilla, ancho, alto (casillas), tile (m), tipo, pueblos, lat, altMax, nombre } */
  mundo(op = {}) {
    const sem = op.semilla ?? 1, r = new Azar(sem), N = new Ruido(sem), W = op.ancho || 512, H = op.alto || 512, T = op.tile || 10, tipo = op.tipo || 'isla', altMax = op.altMax || Math.min(2400, W * T * (tipo === 'montaña' ? .35 : .2)), lat = op.lat ?? 6.2;
    const es = 4, eW = Math.ceil(W / es) + 2, eH = Math.ceil(H / es) + 2, E = new Float32Array(eW * eH), esc = 1 / (W * T / 3.2);
    /* 1. relieve */
    for (let j = 0; j < eH; j++) for (let i = 0; i < eW; i++) {
      const x = i * es * T, y = j * es * T, u = i / (eW - 1), v = j / (eH - 1), n = N.torcido(x * esc, y * esc, 1.2) * .5 + .5, cr = N.crestas(x * esc * 1.6 + 7, y * esc * 1.6 + 3, 5);
      let h;
      if (tipo === 'isla') { const d = Math.hypot(u - .5, v - .5) * 2; h = (n * .7 + cr * .3) * (1 - d * d * 1.15) - .06; }
      else if (tipo === 'valle') { const c = Math.abs(u - .5 - .06 * Math.sin(v * 5 + sem)) * 2; h = .08 + .1 * n + Math.pow(c, 1.6) * (.55 + .45 * cr) + .02 * (1 - v); }
      else if (tipo === 'costa') { h = (n * .6 + cr * .45) * clamp(u * 1.6 - .25, 0, 1.2) - .06; }
      else if (tipo === 'montaña') { h = .15 + cr * .85 + n * .25; }
      else { h = .08 + n * .18 + cr * .08; }
      E[j * eW + i] = h * altMax;
    }
    const cotaE = (x, y) => { const gx = clamp(x / (es * T), 0, eW - 1.001), gy = clamp(y / (es * T), 0, eH - 1.001), x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, k = y0 * eW + x0; return (E[k] * (1 - fx) + E[k + 1] * fx) * (1 - fy) + (E[k + eW] * (1 - fx) + E[k + eW + 1] * fx) * fy; };
    /* 2. ríos: de los nacimientos (altos y húmedos) por la pendiente más fuerte */
    const rios = [], flujo = new Float32Array(eW * eH), nac = [];
    for (let k = 0; k < 400; k++) { const i = 2 + r.e(0, eW - 5), j = 2 + r.e(0, eH - 5), h = E[j * eW + i]; if (h > altMax * .35) nac.push([i, j, h]); }
    nac.sort((a, b) => b[2] - a[2]);
    for (const [i0, j0] of nac.slice(0, op.rios ?? 6)) {
      let i = i0, j = j0; const P = [];
      for (let paso = 0; paso < eW * 3; paso++) { P.push((i + .5) * es * T, (j + .5) * es * T); flujo[j * eW + i] += 1; const h = E[j * eW + i]; if (h <= 0 || i <= 0 || j <= 0 || i >= eW - 1 || j >= eH - 1) break;
        let bi = i, bj = j, bh = h; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const q = E[(j + dj) * eW + i + di]; if (q < bh) { bh = q; bi = i + di; bj = j + dj; } }
        if (bi === i && bj === j) { E[j * eW + i] = Math.min(...[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => E[(j + b) * eW + i + a])) + .5; const o = r.uno([[1, 0], [-1, 0], [0, 1], [0, -1]]); bi = i + o[0]; bj = j + o[1]; }   // hoyo: se rellena y sigue
        else E[bj * eW + bi] = Math.min(E[bj * eW + bi], h - .3);   // el río talla su cauce
        i = bi; j = bj; }
      if (P.length > 8) rios.push(P);
    }
    /* 3. suelo por casilla: biomas */
    const suelo = new Uint8Array(W * H), T0 = 27 - Math.abs(lat) * .45;   // temperatura a nivel del mar según la latitud (aprox.)
    for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      const x = (tx + .5) * T, y = (ty + .5) * T, h = cotaE(x, y), temp = T0 - .0065 * h, hum = N.fbm(x * esc * 2 + 40, y * esc * 2 + 11, 3) * .5 + .5, pend = Math.hypot(cotaE(x + T, y) - cotaE(x - T, y), cotaE(x, y + T) - cotaE(x, y - T)) / (2 * T);
      let t = TT.GRASS; if (h <= 0) t = TT.WATER; else if (h < 4 && tipo !== 'valle') t = TT.ARENA; else if (temp < -1) t = TT.NIEVE; else if (pend > 1.1 || (temp < 4 && pend > .5)) t = TT.ROCA; else if (hum > .55 || (pend > .35 && hum > .4)) t = TT.MOUNT;
      suelo[ty * W + tx] = t;
    }
    const pon = (x, y, t, R = T / 2) => { for (let yy = y - R; yy <= y + R; yy += T / 2) for (let xx = x - R; xx <= x + R; xx += T / 2) { const tx = Math.floor(xx / T), ty = Math.floor(yy / T); if (tx >= 0 && ty >= 0 && tx < W && ty < H && (xx - x) ** 2 + (yy - y) ** 2 <= R * R + 1) suelo[ty * W + tx] = t; } };
    const linea = (P, ancho, t) => { for (let k = 0; k + 3 < P.length; k += 2) { const ax = P[k], ay = P[k + 1], bx = P[k + 2], by = P[k + 3], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / (T / 2))); for (let q = 0; q <= n; q++) pon(ax + (bx - ax) * q / n, ay + (by - ay) * q / n, t, ancho / 2); } };
    for (const P of rios) { const i = Math.floor(P[1] / (es * T)) * eW + Math.floor(P[0] / (es * T)); linea(P, 6 + Math.min(18, (flujo[i] || 1) * 2), TT.CANAL); }
    /* 4. pueblos: plano, sin agua y con un río cerca */
    const plano = (x, y, lim = .14) => { const h = cotaE(x, y); return h > 3 && Math.hypot(cotaE(x + 30, y) - cotaE(x - 30, y), cotaE(x, y + 30) - cotaE(x, y - 30)) / 60 < lim; };
    let cand = poissonDisco(W * T, H * T, Math.min(W, H) * T / 7, sem + 3, 20, (x, y) => x > 300 && y > 300 && x < W * T - 300 && y < H * T - 300 && plano(x, y));
    if (cand.length < (op.pueblos ?? 4)) cand = cand.concat(poissonDisco(W * T, H * T, Math.min(W, H) * T / 8, sem + 5, 20, (x, y) => x > 250 && y > 250 && x < W * T - 250 && y < H * T - 250 && plano(x, y, .22)));
    const dRio = (x, y) => { let b = 1e9; for (const P of rios) for (let k = 0; k < P.length; k += 6) b = Math.min(b, Math.hypot(P[k] - x, P[k + 1] - y)); return b; };
    const pueblos = cand.map(([x, y]) => ({ x, y, p: -dRio(x, y) / 400 - cotaE(x, y) / altMax })).sort((a, b) => b.p - a.p).slice(0, op.pueblos ?? 4).map((q, i) => Object.assign(q, { id: i + 1, nombre: this.nombre(r), radio: [420, 320, 260, 220, 200, 180][i] || 160, ang: r.r2(0, Math.PI / 2) }));
    const vias = [], edif = [], lugares = [], calles = new Set(), pasos = [];
    const valida = (x, y) => x > 0 && y > 0 && x < W * T && y < H * T && cotaE(x, y) > 2 && suelo[Math.floor(y / T) * W + Math.floor(x / T)] !== TT.CANAL;
    for (const Pb of pueblos) {
      const ca = Math.cos(Pb.ang), sa = Math.sin(Pb.ang), cuad = 70, n = Math.ceil(Pb.radio / cuad);
      for (const eje of [0, 1]) for (let k = -n; k <= n; k++) {
        const nom = (eje ? 'Calle ' : 'Carrera ') + (k + n + 1); let P = [];
        const cierra = () => { if (P.length >= 4) { vias.push([k === 0 ? VIA.AVENIDA : VIA.CALLE, nom, k === 0 ? 10 : 7, P]); calles.add(nom); } P = []; };
        for (let s = -Pb.radio; s <= Pb.radio; s += 10) { const lx = eje ? s : k * cuad, ly = eje ? k * cuad : s, x = Pb.x + lx * ca - ly * sa, y = Pb.y + lx * sa + ly * ca; if (Math.hypot(lx, ly) <= Pb.radio && valida(x, y) && plano(x, y) || (Math.hypot(lx, ly) <= Pb.radio * .5 && valida(x, y))) P.push(Math.round(x * 10) / 10, Math.round(y * 10) / 10); else cierra(); }
        cierra();
      }
      /* plaza central con iglesia y casas en lotes a lo largo de cada cuadra */
      for (let dy = -28; dy <= 28; dy += 4) for (let dx = -28; dx <= 28; dx += 4) pon(Pb.x + dx * ca - dy * sa, Pb.y + dx * sa + dy * ca, TT.PLAZA, 3);
      const ix = Pb.x + 0 * ca - (-45) * sa, iy = Pb.y + 0 * sa + (-45) * ca; edif.push([ix, iy, 16, 9, Pb.ang + Math.PI / 2, 4, 6, null]);
      lugares.push({ id: 'plaza' + Pb.id, nombre: 'Parque principal de ' + Pb.nombre, municipio: Pb.nombre, x: Pb.x, y: Pb.y, ancho: 60, alto: 60, dibujo: 'iglesia', dato: 'La plaza de ' + Pb.nombre + ', con su iglesia mirando al parque.', secreto: false });
      for (let bi = -n; bi < n; bi++) for (let bj = -n; bj < n; bj++) {
        const cx = (bi + .5) * cuad, cy = (bj + .5) * cuad, dc = Math.hypot(cx, cy); if (dc > Pb.radio || dc < 40) continue;
        for (const [lado, sgn] of [[0, 1], [0, -1], [1, 1], [1, -1]]) for (let s = -cuad / 2 + 9; s <= cuad / 2 - 9; s += 9 + r.f() * 3) {
          const fondo = 6 + r.f() * 4, lx = lado ? cx + sgn * (cuad / 2 - 5 - fondo / 2) : cx + s, ly = lado ? cy + s : cy + sgn * (cuad / 2 - 5 - fondo / 2), x = Pb.x + lx * ca - ly * sa, y = Pb.y + lx * sa + ly * ca;
          if (!valida(x, y) || !plano(x, y, .25)) continue; const pis = Math.max(1, Math.round((4 - 3 * dc / Pb.radio) * (.6 + r.f() * .7))), an = Pb.ang + (lado ? 0 : Math.PI / 2);
          edif.push([x, y, 4 + r.f() * 1.2, fondo / 2, an, pis, pis > 3 ? 1 : r.f() < .12 ? 8 : 0, null]);
        }
      }
    }
    /* 5. carreteras entre pueblos (A* en la malla del relieve: cuesta subir y cruzar agua) */
    const camino = (a, b) => {
      const ia = Math.round(a.x / (es * T)), ja = Math.round(a.y / (es * T)), ib = Math.round(b.x / (es * T)), jb = Math.round(b.y / (es * T)), g = new Float64Array(eW * eH).fill(Infinity), de = new Int32Array(eW * eH).fill(-1), abiertos = [[0, ja * eW + ia]]; g[ja * eW + ia] = 0;
      while (abiertos.length) { let m = 0; for (let k = 1; k < abiertos.length; k++) if (abiertos[k][0] < abiertos[m][0]) m = k; const [, u] = abiertos.splice(m, 1)[0]; if (u === jb * eW + ib) break; const ui = u % eW, uj = (u / eW) | 0;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const vi = ui + di, vj = uj + dj; if (vi < 1 || vj < 1 || vi >= eW - 1 || vj >= eH - 1) continue; const v = vj * eW + vi, hv = E[v]; if (hv <= 0) continue; const L = Math.hypot(di, dj) * es * T, pend = Math.abs(hv - E[u]) / L, c = g[u] + L * (1 + pend * pend * 400 + (flujo[v] > 0 ? 8 : 0)); if (c < g[v]) { g[v] = c; de[v] = u; abiertos.push([c + Math.hypot(vi - ib, vj - jb) * es * T, v]); } }
        if (abiertos.length > 40000) break; }
      if (de[jb * eW + ib] < 0) return null; const R = []; for (let v = jb * eW + ib; v !== -1 && v !== ja * eW + ia; v = de[v]) R.push(((v % eW) + .5) * es * T, (((v / eW) | 0) + .5) * es * T); R.push(a.x, a.y);
      let P = []; for (let k = R.length - 2; k >= 0; k -= 2) P.push(R[k], R[k + 1]);
      for (let it = 0; it < 2; it++) { const Q = [P[0], P[1]]; for (let k = 0; k + 3 < P.length; k += 2) Q.push(P[k] * .75 + P[k + 2] * .25, P[k + 1] * .75 + P[k + 3] * .25, P[k] * .25 + P[k + 2] * .75, P[k + 1] * .25 + P[k + 3] * .75); Q.push(P[P.length - 2], P[P.length - 1]); P = Q; }   // curvas suaves (Chaikin)
      return P.map(v => Math.round(v * 10) / 10);
    };
    for (let i = 1; i < pueblos.length; i++) { const a = pueblos[i], b = pueblos.slice(0, i).sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y))[0], P = camino(a, b); if (!P) continue; const nom = 'Vía ' + a.nombre + ' – ' + b.nombre; vias.push([VIA.AVENIDA, nom, 9, P]); calles.add(nom);
      /* puentes: donde la vía cruza un río */
      let ini = -1; for (let k = 0; k < P.length; k += 2) { const t = suelo[Math.floor(P[k + 1] / T) * W + Math.floor(P[k] / T)], agua = t === TT.CANAL || t === TT.WATER; if (agua && ini < 0) ini = Math.max(0, k - 4); if (!agua && ini >= 0) { const seg = P.slice(ini, Math.min(P.length, k + 6)); if (seg.length >= 4) pasos.push([0, 1, 10, 6, 0, ...seg]); ini = -1; } } }
    for (const [k, , ancho, P] of vias) linea(P, ancho, k === VIA.AVENIDA ? TT.AVE : TT.ROAD);
    /* casas sobre el suelo (después de las vías para no taparlas) */
    const edJ = [];
    for (const e of edif) { const [x, y, hw, hd, an] = e, ux = Math.cos(an), uy = Math.sin(an); let libre = true; for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0]]) { const px = x + ux * hw * a - uy * hd * b, py = y + uy * hw * a + ux * hd * b, t = suelo[Math.floor(py / T) * W + Math.floor(px / T)]; if (t === TT.ROAD || t === TT.AVE || t === TT.CANAL || t === TT.WATER || t === undefined) libre = false; } if (!libre) continue; edJ.push(e.map((v, i) => i < 4 ? Math.round(v * 10) / 10 : v)); for (let a = -hw; a <= hw; a += T / 2) for (let b = -hd; b <= hd; b += T / 2) { const tx = Math.floor((x + ux * a - uy * b) / T), ty = Math.floor((y + uy * a + ux * b) / T); if (tx >= 0 && ty >= 0 && tx < W && ty < H) suelo[ty * W + tx] = TT.BLDG; } }
    for (const q of pasos) { const P = q.slice(5); for (let k = 0; k < P.length; k += 2) { const tx = Math.floor(P[k] / T), ty = Math.floor(P[k + 1] / T); if (tx >= 0 && ty >= 0 && tx < W && ty < H) suelo[ty * W + tx] = TT.BRIDGE; } }
    /* 6. municipios (el pueblo más cercano, hasta 3 radios), miradores y un cable al cerro más alto */
    const cel = 8, mW = Math.ceil(W / cel) + 1, mH = Math.ceil(H / cel) + 1, muni = new Uint8Array(mW * mH), pis = new Uint8Array(mW * mH), nivel = new Int8Array(W * H);
    for (let j = 0; j < mH; j++) for (let i = 0; i < mW; i++) { const x = (i + .5) * cel * T, y = (j + .5) * cel * T; let best = 0, bd = 1e18; for (const Pb of pueblos) { const d = Math.hypot(Pb.x - x, Pb.y - y) / Pb.radio; if (d < bd && d < 3) { bd = d; best = Pb.id; } } muni[j * mW + i] = best; }
    for (const e of edJ) { const i = Math.min(mW - 1, Math.floor(e[0] / T / cel)), j = Math.min(mH - 1, Math.floor(e[1] / T / cel)); pis[j * mW + i] = Math.max(pis[j * mW + i], e[5]); }
    for (const q of pasos) { const P = q.slice(5); for (let k = 0; k < P.length; k += 2) { const tx = Math.floor(P[k] / T), ty = Math.floor(P[k + 1] / T); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (tx + a >= 0 && ty + b >= 0 && tx + a < W && ty + b < H) nivel[(ty + b) * W + tx + a] = 1; } }
    let cima = null; for (let j = 2; j < eH - 2; j++) for (let i = 2; i < eW - 2; i++) { const h = E[j * eW + i]; if (!cima || h > cima.h) cima = { h, x: (i + .5) * es * T, y: (j + .5) * es * T }; }
    if (cima) lugares.push({ id: 'cima', nombre: 'Mirador del cerro más alto', municipio: '', x: cima.x, y: cima.y, ancho: 40, alto: 40, dibujo: 'cerro', dato: 'A ' + Math.round(cima.h) + ' m sobre el mar.', secreto: false });
    const lineas = []; if (cima && pueblos[0] && Math.hypot(cima.x - pueblos[0].x, cima.y - pueblos[0].y) < 4500) lineas.push({ id: 'CG', nombre: 'Cable ' + pueblos[0].nombre, clase: 'cable', color: '#e38835', estado: 'operativa', estaciones: [[pueblos[0].nombre, pueblos[0].x + 60, pueblos[0].y + 60], ['Mirador', cima.x, cima.y]], eje: null });
    /* 7. el mundo */
    const relieve = new Int16Array(eW * eH); for (let k = 0; k < E.length; k++) relieve[k] = Math.round(E[k]);
    const nombre = op.nombre || 'Mundo ' + sem, kx = 111320 * Math.cos(lat * Math.PI / 180) / T, ky = 110574 / T;
    const cfg = { id: 'gen-' + sem, nombre, ventana: { lon0: -75, latN: lat + H * T / 2 / 110574, lon1: -75 + W * T / (kx * T), latS: lat - H * T / 2 / 110574, lat_ref: lat }, casilla_m: T, zonas: Object.assign({}, ZONAS_BASE, (MC.ciudadBase && MC.ciudadBase.zonas) || {}), zona_por_comuna: [null], zona_por_municipio: [null, ...pueblos.map(() => 'pueblo')], clima: op.clima || null, transporte: { servicio: { habil: [300, 1320], domingo: [360, 1260] }, pico: [], clases: { cable: { vel_ms: 5, cabina_cada_s: 15, altura_m: 30 } } } };
    const M = Mundo.desdeCapas({
      meta: { W, H, tile: T, lon0: cfg.ventana.lon0, latN: cfg.ventana.latN, kx, ky, ciudad: cfg.id, nombre, generado: { semilla: sem, tipo }, atribucion: ['Mundo generado por Motor City (semilla ' + sem + ')'] },
      capas: {
        suelo: { datos: suelo, info: { tipo: 'u8', w: W, h: H } }, relieve: { datos: relieve, info: { tipo: 'i16', w: eW, h: eH, paso: es } },
        municipio: { datos: muni, info: { tipo: 'u8', w: mW, h: mH, paso: cel } }, comuna: { datos: new Uint8Array(mW * mH), info: { tipo: 'u8', w: mW, h: mH, paso: cel } }, barrio: { datos: new Uint16Array(mW * mH), info: { tipo: 'u16', w: mW, h: mH, paso: cel } },
        pisos: { datos: pis, info: { tipo: 'u8', w: mW, h: mH, paso: cel } }, lotes: { datos: new Uint8Array(mW * mH), info: { tipo: 'u8', w: mW, h: mH, paso: cel } }, nivel: { datos: nivel, info: { tipo: 'i8', w: W, h: H } },
        vias: { datos: vias, info: { tipo: 'json', formato: 'VIASJ' } }, edificios: { datos: { kinds: ['casa', 'edificio', 'torre', 'nave', 'educativo', 'salud', 'iglesia', 'civico', 'comercio', 'deporte', 'techo', 'invernadero', 'tanque', 'transporte', 'parqueadero', 'rural'], lista: edJ }, info: { tipo: 'json', formato: 'EDJ', R: 320 } },
        info: { datos: { barrios: [], comunas: [], municipios: pueblos.map(p => p.nombre), calles: [...calles], sitios_nombres: [], rio: [], parques: [] } }, pasos: { datos: { tipos: ['puente', 'tunel', 'viaducto'], lista: pasos } },
        transporte: { datos: { lineas, encicla: [] } }, lugares: { datos: { lugares, hitos: [] } }, trafico: { datos: { carriles: [], semaforos: [] } }
      }
    }, cfg);
    M.generado = { pueblos, rios: rios.length, edificios: edJ.length, vias: vias.length, puentes: pasos.length, cfg };
    return M;
  }
};
MC.Generador = Generador; MC.ZONAS_BASE = ZONAS_BASE;
