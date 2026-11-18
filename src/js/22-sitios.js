/* =====================================================================
   SITIOS REALES (v1.5): los lugares importantes del valle con la forma, la altura y el estilo de sus
   edificios reales — universidades, colegios, alcaldías, hospitales, iglesias, bibliotecas, coliseos,
   terminales — y todas las canchas, pistas y piscinas. Datos: src/data/sitios.bin (tools/geo/sitios.py),
   de OpenStreetMap vía Overture (ODbL). Estilos elegidos mirando el valle desde arriba
   (satélite, fotos aéreas y videos de dron: docs/MEDELLIN-DESDE-EL-AIRE.md).
   - Física: dentro de cada sitio lo construido de relleno pasa a prado o plaza y cada edificio real es sólido.
   - Ciudad 3D: los edificios se levantan con su forma (también con patio), su altura y sus colores;
     las canchas con sus líneas, las pistas y las piscinas van en el suelo; los sitios grandes llevan su nombre.
   ===================================================================== */
const SIT_K = ['', 'uni', 'cole', 'salud', 'iglesia', 'gob', 'dep', 'cult', 'trans', 'ofi'];
const SIT_EST = [   // [muro con luz, muro en sombra, techo plano, techo de teja]
  ['#b8673f', '#9a5334', '#b26a4b', '#b85c38'],   // 0 ladrillo a la vista (UPB, EAFIT, U. de Medellín): azoteas de baldosa de barro, como se ven desde el aire
  ['#eceae4', '#d2cfc7', '#dedcd6', '#c4663f'],   // 1 blanco (hospitales, terminales, Plaza Mayor)
  ['#bdbcb6', '#a19f99', '#9c9b95', '#9c9b95'],   // 2 concreto (La Alpujarra, juzgados)
  ['#5e7b97', '#46607a', '#5c6672', '#5c6672'],   // 3 cristal (EPM, torres de oficinas)
  ['#ece3cd', '#d2c7ae', '#b9b3a7', '#c2623b'],   // 4 colegio (muros claros, teja o placa)
  ['#efe8d8', '#d6cbb5', '#b5542f', '#b5542f'],   // 5 iglesia (cal y teja)
  ['#d4d8dd', '#b8bdc5', '#c8cdd5', '#c8cdd5'],   // 6 coliseo (cubierta metálica clara)
  ['#3a3f4a', '#262a32', '#2b2f38', '#2b2f38'],   // 7 oscuro (Parque Biblioteca España, Biblioteca EPM)
  ['#b9714b', '#9b5b3d', '#a39c90', '#bb5f39'],   // 8 teja (Ciudad Universitaria de la UdeA: bloques de teja con patio)
  ['#d8432f', '#b3352a', '#c43a2a', '#c43a2a'],   // 9 rojo (Explora)
  ['#d9d4c9', '#bdb7aa', '#e1dfd9', '#c86a42'],   // 10 claro (Nacional, ITM, Pascual Bravo, Coltejer)
  ['#a86a4c', '#8b5740', '#8f9196', '#9a5232']    // 11 ladrillo y gris (bibliotecas, museos)
];
const SIT_PISCINA = '#4fb3e3';
const SIT_TECHO = ['plano', 'cuatro', 'dos', 'helipuerto', 'aguja', 'cupula', 'ajedrez', 'cubierta'];
const SIT_NOMBRE = {   // cada lugar con postal y el nombre de su edificio o sitio real: si aparece a menos de 600 m, el lugar se ubica sobre él y toma su forma real
  udea: /Universidad de Antioquia/i, unal: /Universidad Nacional de Colombia/i, eafit: /Universidad EAFIT/i, hospbello: /Marco Fidel Su[aá]rez/i,
  coltejer: /Edificio Coltejer/i, palacio: /Palacio de la Cultura/i, catedral: /Bas[ií]lica Metropolitana/i, terminalN: /Terminal de transportes del Norte/i, terminalS: /Terminal.*Sur/i,
  bibespana: /Biblioteca Espa[ñn]a/i, explora: /Explora/i, memoria: /Casa de la Memoria/i, botero: /Museo de Antioquia/i, mamm: /Arte Moderno|MAMM/i, teatro: /Teatro Metropolitano/i
};
const sitArea = P => { let a = 0; for (let i = 0, n = P.length; i < n; i += 2) { const j = (i + 2) % n; a += P[i] * P[j + 1] - P[j] * P[i + 1]; } return a / 2; };
const sitCaja = R => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const P of R) for (let i = 0; i < P.length; i += 2) { if (P[i] < x0) x0 = P[i]; if (P[i] > x1) x1 = P[i]; if (P[i + 1] < y0) y0 = P[i + 1]; if (P[i + 1] > y1) y1 = P[i + 1]; } return [x0, y0, x1, y1]; };
const sitTinte = (hex, k) => k ? shade(hex, k) : hex;

Object.assign(CityMap, {
  /* lee sitios.bin: sitios (contornos), edificios (anillos, cumbreras), canchas, pistas y piscinas, en px del mundo */
  parseSitios(u8) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), K = TS / (SITIOS_META.u || 8), NM = SITIOS_META.names || [];
    const v2 = dv.getUint8(3) === 50; let o = 4; const nS = dv.getUint32(o, true), nE = dv.getUint32(o + 4, true), nC = dv.getUint32(o + 8, true), nP = dv.getUint32(o + 12, true), nW = dv.getUint32(o + 16, true), nZ = v2 ? dv.getUint32(o + 20, true) : 0; o += v2 ? 24 : 20;   /* SIT2 trae además las plazas */
    const ring = () => { const n = dv.getUint16(o, true); let x = dv.getUint16(o + 2, true), y = dv.getUint16(o + 4, true); o += 6; const P = new Float32Array(n * 2); P[0] = x * K; P[1] = y * K; for (let i = 1; i < n; i++) { x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); o += 4; P[i * 2] = x * K; P[i * 2 + 1] = y * K; } return P; };
    const poly = () => { const k = dv.getUint8(o); o++; const R = []; for (let i = 0; i < k; i++) R.push(ring()); return R; };
    const S = [], E = [], C = [], PI = [], W = [];
    for (let i = 0; i < nS; i++) { const kb = dv.getUint8(o), est = dv.getUint8(o + 1), nm = dv.getUint16(o + 2, true); o += 4; const R = poly(); S.push({ i, k: SIT_K[kb & 127], suelto: !!(kb & 128), est: est === 255 ? -1 : est, name: NM[nm] || '', R, bb: R.length ? sitCaja(R) : [0, 0, 0, 0], A: R.length ? Math.abs(sitArea(R[0])) : 0 }); }
    for (let i = 0; i < nE; i++) {
      const s = dv.getUint16(o, true), kb = dv.getUint8(o + 2), fl = dv.getUint8(o + 3), roof = dv.getUint8(o + 4), est = dv.getUint8(o + 5), nm = dv.getUint16(o + 6, true); o += 8;
      const R = poly(), I = poly(); if (!R.length) continue;
      const bb = sitCaja(R), A = R.map(sitArea), h = h2(bb[0] | 0, bb[1] | 0, 91), ES = SIT_EST[est] || SIT_EST[0], teja = roof === 1 || roof === 2, tn = (h - .5) * .08;
      const b = { s, k: SIT_K[kb] || 'uni', fl, t: SIT_TECHO[roof] || 'plano', est, name: NM[nm] || '', R, A, I: I.length ? I : null, bb, x: (bb[0] + bb[2]) / 2, y: (bb[1] + bb[3]) / 2, z: clamp(.03 + fl * .03, .06, 1.6), sitio: true, B: true, k2: h, pal: [],
        wa: sitTinte(ES[0], tn), wb: sitTinte(ES[1], tn), roof: sitTinte(teja ? ES[3] : ES[2], tn * 1.2), sg: R.map((P, r) => (A[r] > 0 ? 1 : -1) * (r ? -1 : 1)) };
      if (b.I) b.M = R.map(P => { const n = P.length >> 1, m = new Uint16Array(n * 2); for (let v = 0; v < n; v++) { let bd = 1e18; for (let r = 0; r < b.I.length; r++) { const Q = b.I[r]; for (let w = 0; w < Q.length; w += 2) { const d = (Q[w] - P[v * 2]) ** 2 + (Q[w + 1] - P[v * 2 + 1]) ** 2; if (d < bd) { bd = d; m[v * 2] = r; m[v * 2 + 1] = w >> 1; } } } } return m; });   // cada esquina del alero con su cumbrera más cercana
      E.push(b);
    }
    for (let i = 0; i < nC; i++) { C.push({ x: dv.getUint16(o, true) * K, y: dv.getUint16(o + 2, true) * K, L: dv.getUint16(o + 4, true) * K, A: dv.getUint16(o + 6, true) * K, an: dv.getInt16(o + 8, true) / 100 * Math.PI / 180, t: dv.getUint8(o + 10) }); o += 11; }
    for (let i = 0; i < nP; i++) { const R = poly(); if (R.length) PI.push({ R, bb: sitCaja(R) }); }
    for (let i = 0; i < nW; i++) { const R = poly(); if (R.length) W.push({ R, bb: sitCaja(R) }); }
    const Z = []; for (let i = 0; i < nZ; i++) { const R = poly(); if (R.length) Z.push({ R, bb: sitCaja(R) }); }
    return { S, E, C, P: PI, W, Z };
  },
  /* recorre las casillas cuyo centro cae dentro de los anillos (par-impar: los patios quedan fuera) */
  sitLlena(R, f) {
    const bb = sitCaja(R);
    for (let ty = Math.max(0, Math.floor(bb[1] / TS)); ty <= Math.min(MH - 1, Math.floor(bb[3] / TS)); ty++) {
      const yc = (ty + .5) * TS, xs = [];
      for (const P of R) for (let i = 0, n = P.length; i < n; i += 2) { const j = (i + 2) % n, ay = P[i + 1], by = P[j + 1]; if ((ay > yc) !== (by > yc)) xs.push(P[i] + (yc - ay) / (by - ay) * (P[j] - P[i])); }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let tx = Math.max(0, Math.ceil(xs[k] / TS - .5)); tx <= Math.min(MW - 1, Math.floor(xs[k + 1] / TS - .5)); tx++) f(ty * MW + tx, tx, ty);
    }
  },
  /* física: los sitios en la cuadrícula (antes de colocar estaciones y lugares) y el índice por trozo para dibujarlos */
  rasterSitios() {
    const D = this.sit; if (!D) return; const t = this.t, sitT = this.sitT = new Map(), sitB = this.sitB = new Set();
    const NO = new Set([TT.ROAD, TT.AVE, TT.AUTO, TT.BRIDGE, TT.WATER, TT.CANAL, TT.STATION, TT.CICLO, TT.DEPOT]);
    for (const s of D.S) {
      if (!s.R.length || s.suelto) continue;
      const verde = s.k === 'uni' || s.k === 'dep', base = verde ? TT.GRASS : TT.PLAZA;   // campus verdes y arborizados (así se ven desde el aire); colegios, hospitales y templos con patio de piso
      this.sitLlena(s.R, (i) => { sitT.set(i, s.i); const v = t[i]; if (v === TT.BRICK || v === TT.BLDG || (verde && (v === TT.PLAZA || v === TT.WALK || v === TT.LAND))) t[i] = base; });
    }
    for (const z of D.Z || []) this.sitLlena(z.R, (i) => { if (sitT.has(i) && t[i] === TT.GRASS) t[i] = TT.PLAZA; });   // las plazas de verdad dentro de los campus
    for (const b of D.E) {
      const s = D.S[b.s]; let n = 0;
      this.sitLlena(b.R, (i) => { n++; sitT.set(i, b.s); if (!NO.has(t[i])) { t[i] = TT.BLDG; sitB.add(i); } });
      if (!n) { const i = Math.floor(b.y / TS) * MW + Math.floor(b.x / TS), v = t[i]; if (v === TT.GRASS || v === TT.PLAZA || v === TT.BRICK || v === TT.BLDG) { t[i] = TT.BLDG; sitB.add(i); sitT.set(i, b.s); } }   // muy pequeño: al menos su casilla
    }
    // en los campus, un andén de una casilla alrededor de cada bloque; el resto queda en prado (con muchos árboles)
    const anden = []; for (const i of sitB) { const s = D.S[sitT.get(i)]; if (!s || s.suelto || s.k !== 'uni') continue; for (const d of [1, -1, MW, -MW]) { const j = i + d; if (t[j] === TT.GRASS && sitT.get(j) === s.i) anden.push(j); } }
    for (const j of anden) t[j] = TT.PLAZA;
    // índice por trozo (CH casillas): qué sitios, edificios, canchas, pistas y piscinas tocan cada trozo
    const G = this.sitG = new Map(), S = CH * TS, add = (bb, key, it) => { for (let gy = Math.floor(bb[1] / S); gy <= Math.floor(bb[3] / S); gy++) for (let gx = Math.floor(bb[0] / S); gx <= Math.floor(bb[2] / S); gx++) { const k = gx + ',' + gy; let c = G.get(k); if (!c) G.set(k, c = { s: [], e: [], c: [], p: [], w: [] }); c[key].push(it); } };
    for (const s of D.S) if (s.R.length) add(s.bb, 's', s);
    for (const b of D.E) add([b.bb[0] - 20, b.bb[1] - 40, b.bb[2] + 20, b.bb[3] + 8], 'e', b);
    for (const c of D.C) { const r = Math.hypot(c.L, c.A) / 2; add([c.x - r, c.y - r, c.x + r, c.y + r], 'c', c); }
    for (const p of D.P) add(p.bb, 'p', p);
    for (const w of D.W) add(w.bb, 'w', w);
  },
  sitTrozo(cx, cy) { return (this.sitG && this.sitG.get(cx + ',' + cy)) || null; },
  sitLibre(cx, cy, X, Y) {   // ¿un árbol aquí no cae sobre una cancha, una pista o una piscina?
    const T = this.sitTrozo(cx, cy); if (!T) return true;
    for (const k of T.c) { const dx = X - k.x, dy = Y - k.y, ca = Math.cos(k.an), sa = Math.sin(k.an), u = dx * ca + dy * sa, v = -dx * sa + dy * ca; if (Math.abs(u) < k.L / 2 + 3 && Math.abs(v) < k.A / 2 + 3) return false; }
    for (const w of T.w) if (X > w.bb[0] - 3 && X < w.bb[2] + 3 && Y > w.bb[1] - 3 && Y < w.bb[3] + 3) return false;
    for (const q of T.p) if (X > q.bb[0] && X < q.bb[2] && Y > q.bb[1] && Y < q.bb[3]) return false;
    return true;
  },
  /* casilla dentro de un sitio (para que los lotes de relleno no se monten encima) */
  enSitio(x, y) { return !!this.sitT && this.sitT.has(Math.floor(y / TS) * MW + Math.floor(x / TS)); },
  /* los lugares con postal que tienen su forma real en los datos pasan a «reales»; los demás esconden los edificios reales que caen en su rectángulo */
  sitLugares() {
    const D = this.sit; if (!D) return;
    for (const L of LANDMARKS) {
      const cx = (L.x + L.w / 2) * TS, cy = (L.y + L.h / 2) * TS, re = SIT_NOMBRE[L.id]; L.real = false;
      if (re) {   // por nombre: el sitio (su contorno) o el edificio más cercano que se llame así
        let best = null, bd = 60 * TS;
        for (const s of D.S) if (s.R.length && re.test(s.name)) { const x = (s.bb[0] + s.bb[2]) / 2, y = (s.bb[1] + s.bb[3]) / 2, d = Math.hypot(x - cx, y - cy); if (d < bd) { bd = d; best = [x, y]; } }
        if (!best) for (const b of D.E) if (re.test(b.name)) { const d = Math.hypot(b.x - cx, b.y - cy); if (d < bd) { bd = d; best = [b.x, b.y]; } }
        if (best) { L.x = Math.round(best[0] / TS - L.w / 2); L.y = Math.round(best[1] / TS - L.h / 2); L.real = true; }
      } else if (L.k === 'iglesia') {   // el templo principal del pueblo: la iglesia real más cercana al parque (a menos de 250 m)
        let bd = 25 * TS; for (const b of D.E) if (b.k === 'iglesia' && Math.abs(b.A[0]) > 250) { const d = Math.hypot(b.x - cx, b.y - cy) - (/parroquia|catedral|bas[ií]lica|iglesia/i.test(b.name) ? 4 * TS : 0); if (d < bd) { bd = d; L.real = true; } }
      }
    }
  },
  sitOcultar() {   // tras pintar los lugares: lo real que cae bajo un lugar dibujado a mano no se dibuja (edificios, canchas, pistas y piscinas)
    const D = this.sit; if (!D) return;
    for (const L of LANDMARKS) {
      if (L.real) continue; const x0 = L.x * TS, y0 = L.y * TS, x1 = (L.x + L.w) * TS, y1 = (L.y + L.h) * TS, en = (x, y) => x > x0 && x < x1 && y > y0 && y < y1;
      for (const b of D.E) if (en(b.x, b.y)) b.oculto = true;
      for (const k of D.C) if (en(k.x, k.y)) k.oculto = true;
      for (const q of D.P.concat(D.W)) if (en((q.bb[0] + q.bb[2]) / 2, (q.bb[1] + q.bb[3]) / 2)) q.oculto = true;
    }
  },
  /* suelo de los sitios en el trozo: pistas atléticas, canchas con sus líneas y piscinas (bajo las calles) */
  sitSuelo(c, cx, cy) {
    const T = this.sitTrozo(cx, cy); if (!T) return;
    const ruta = (R, dx, dy) => { c.beginPath(); for (const P of R) { c.moveTo(P[0] + (dx || 0), P[1] + (dy || 0)); for (let i = 2; i < P.length; i += 2) c.lineTo(P[i] + (dx || 0), P[i + 1] + (dy || 0)); c.closePath(); } };
    for (const p of T.p) { if (p.oculto) continue; ruta(p.R); c.fillStyle = '#9a5240'; c.fill('evenodd'); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .5; c.stroke(); }
    for (const k of T.c) {
      if (k.oculto) continue; c.save(); c.translate(k.x, k.y); c.rotate(k.an); const L = k.L, A = k.A;
      if (k.t === 3) {   // placa polideportiva: concreto pintado con líneas de baloncesto y microfútbol
        c.fillStyle = '#4f86ad'; c.beginPath(); c.roundRect(-L / 2, -A / 2, L, A, 1.2); c.fill(); c.fillStyle = '#c4573f'; c.fillRect(-L * .42, -A * .38, L * .84, A * .76);
        c.strokeStyle = '#f4f4f4'; c.lineWidth = .5; c.strokeRect(-L * .42, -A * .38, L * .84, A * .76); c.beginPath(); c.moveTo(0, -A * .38); c.lineTo(0, A * .38); c.moveTo(A * .14, 0); c.arc(0, 0, A * .14, 0, TAU);
        for (const sx of [-1, 1]) { c.moveTo(sx * L * .42, -A * .17); c.arc(sx * L * .42, 0, A * .17, -Math.PI / 2, Math.PI / 2, sx > 0); } c.stroke();
      } else { canchaP(c, -L / 2, -A / 2, L, A); if (k.t === 2) { c.fillStyle = 'rgba(10,40,20,.22)'; c.fillRect(-L / 2, -A / 2, L, A); } }   // sintética: más oscura
      c.restore();
    }
    for (const w of T.w) { if (w.oculto) continue; ruta(w.R, .5, .7); c.fillStyle = 'rgba(8,14,30,.18)'; c.fill('evenodd'); ruta(w.R); c.fillStyle = '#e9eef0'; c.fill('evenodd'); c.lineWidth = 1.4; c.strokeStyle = '#e9eef0'; c.stroke(); c.fillStyle = SIT_PISCINA; c.fill('evenodd'); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = .4; c.stroke(); }
  },
  /* nombres de los sitios grandes (universidades, alcaldías, hospitales, coliseos, bibliotecas), como los de los parques */
  sitNombres(c, cx, cy) {
    const T = this.sitTrozo(cx, cy); if (!T) return; const S = CH * TS, px0 = cx * S;
    c.font = '800 6.4px Cuerpo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const s of T.s) {
      if (!s.name || s.oculto) continue; const m2 = s.A * (VM.tile / TS) ** 2, big = s.k === 'gob' || (s.k === 'uni' && m2 > 20000) || (s.k === 'salud' && m2 > 8000) || (s.k === 'dep' && m2 > 5000) || ((s.k === 'cult' || s.k === 'trans' || s.k === 'ofi') && m2 > 1500); if (!big) continue;   // solo los sitios grandes llevan nombre
      const x = (s.bb[0] + s.bb[2]) / 2, y = s.bb[3] - 3; if (Math.floor(x / S) !== cx || Math.floor(y / S) !== cy) continue;
      const nm = s.name.length > 34 ? s.name.slice(0, 32) + '…' : s.name, tw = c.measureText(nm).width; if (x - tw / 2 < px0 + 2 || x + tw / 2 > px0 + S - 2) continue;
      c.lineWidth = 2.2; c.strokeStyle = 'rgba(246,244,236,.94)'; c.strokeText(nm, x, y); c.fillStyle = s.k === 'gob' ? '#1f3f73' : s.k === 'salud' ? '#a3262c' : s.k === 'iglesia' ? '#6b3a1f' : '#3a3550'; c.fillText(nm, x, y);
    }
  }
});

/* edificio real con volumen en perspectiva (como los demás edificios): paredes que miran a la cámara, de la más lejana
   a la más cercana; techo con sus patios; techo de teja con faldones y cumbreras, helipuerto, aguja, cúpula o ajedrez */
function sitEdif3D(c, b, ox, oy, px, py, K, p, nb) {
  const f = 1 + K * b.z, n = b.R.length, BX = [], TX = [];
  for (let r = 0; r < n; r++) { const P = b.R[r], m = P.length, B = new Float32Array(m), Tt = new Float32Array(m); for (let i = 0; i < m; i += 2) { const x = P[i] - ox, y = P[i + 1] - oy; B[i] = x; B[i + 1] = y; Tt[i] = px + (x - px) * f; Tt[i + 1] = py + (y - py) * f; } BX.push(B); TX.push(Tt); }
  const W = [];
  for (let r = 0; r < n; r++) { const B = BX[r], m = B.length, sg = b.sg[r]; for (let i = 0; i < m; i += 2) { const j = (i + 2) % m, dx = B[j] - B[i], dy = B[j + 1] - B[i + 1], nx = dy * sg, ny = -dx * sg, ex = (B[i] + B[j]) / 2, ey = (B[i + 1] + B[j + 1]) / 2; if (nx * (px - ex) + ny * (py - ey) <= 0) continue; W.push([r, i, j, (ex - px) ** 2 + (ey - py) ** 2, Math.abs(nx) > Math.abs(ny)]); } }
  W.sort((a, q) => q[3] - a[3]);
  const nf = Math.max(1, Math.min(14, b.fl));
  for (const [r, i, j, , lado] of W) {
    const B = BX[r], T = TX[r];
    c.fillStyle = lado ? p.wb : p.wa; c.beginPath(); c.moveTo(B[i], B[i + 1]); c.lineTo(B[j], B[j + 1]); c.lineTo(T[j], T[j + 1]); c.lineTo(T[i], T[i + 1]); c.closePath(); c.fill();
    if (nf > 1) { c.strokeStyle = p.ln; if (nb >= 2) c.setLineDash([1.2, 2.2]); c.beginPath(); for (let k = 1; k < nf; k++) { const q = k / nf; c.moveTo(B[i] + (T[i] - B[i]) * q, B[i + 1] + (T[i + 1] - B[i + 1]) * q); c.lineTo(B[j] + (T[j] - B[j]) * q, B[j + 1] + (T[j + 1] - B[j + 1]) * q); } c.stroke(); if (nb >= 2) c.setLineDash([]); }
  }
  const techo = (L, col) => { c.fillStyle = col; c.beginPath(); for (const T of L) { c.moveTo(T[0], T[1]); for (let i = 2; i < T.length; i += 2) c.lineTo(T[i], T[i + 1]); c.closePath(); } c.fill('evenodd'); };
  techo(TX, p.roof);
  const N = col => p[col] || (p[col] = nb ? mixHex(col, '#0b1430', nb * .17) : col), SH = (col, k) => N(shade(col, k));
  let cx = 0, cy = 0; { const T = TX[0], m = T.length >> 1; for (let i = 0; i < T.length; i += 2) { cx += T[i]; cy += T[i + 1]; } cx /= m; cy /= m; }
  const sube = (x, y, dz) => { const g = (1 + K * (b.z + dz)) / f; return [px + (x - px) * g, py + (y - py) * g]; };   // un punto del techo, más arriba
  const alto = (x, y, dz) => { const g = 1 + K * (b.z + dz); return [px + (x - px) * g, py + (y - py) * g]; };          // un punto del suelo (en pantalla), llevado a la altura del techo
  if ((b.t === 'cuatro' || b.t === 'dos') && b.I) {   // teja: un faldón por alero (luz del noroeste) y las cumbreras más arriba
    const IT = b.I.map(Q => { const R = new Float32Array(Q.length); for (let i = 0; i < Q.length; i += 2) { const s2 = alto(Q[i] - ox, Q[i + 1] - oy, .035); R[i] = s2[0]; R[i + 1] = s2[1]; } return R; });
    for (let r = 0; r < n; r++) { const T = TX[r], m = T.length, M = b.M[r], sg = b.sg[r]; for (let i = 0; i < m; i += 2) { const j = (i + 2) % m, QA = IT[M[i]], QE = IT[M[j]], a = [QA[M[i + 1] * 2], QA[M[i + 1] * 2 + 1]], e = [QE[M[j + 1] * 2], QE[M[j + 1] * 2 + 1]];   /* M: por cada esquina, su anillo y su vértice de cumbrera */
      const dx = T[j] - T[i], dy = T[j + 1] - T[i + 1], L = Math.hypot(dx, dy) || 1, nx = dy / L * sg, ny = -dx / L * sg, luz = -(nx * .6 + ny * .8);   // la cara que mira al noroeste se ilumina
      c.fillStyle = SH(b.roof, clamp(luz * .16, -.18, .12)); c.beginPath(); c.moveTo(T[i], T[i + 1]); c.lineTo(T[j], T[j + 1]); c.lineTo(e[0], e[1]); c.lineTo(a[0], a[1]); c.closePath(); c.fill(); } }
    techo(IT, SH(b.roof, .1));
    c.strokeStyle = SH(b.roof, -.25); c.lineWidth = .45; c.beginPath(); for (let r = 0; r < n; r++) { const T = TX[r], M = b.M[r]; for (let i = 0; i < T.length; i += 2) { const Q = IT[M[i]]; c.moveTo(T[i], T[i + 1]); c.lineTo(Q[M[i + 1] * 2], Q[M[i + 1] * 2 + 1]); } } c.stroke(); c.lineWidth = .5;
  } else if (b.t === 'aguja') {   // el Coltejer: la aguja sobre la torre
    const apex = sube(cx, cy, .42), T0 = TX[0], T = new Float32Array(T0.length); for (let i = 0; i < T0.length; i += 2) { T[i] = cx + (T0[i] - cx) * .42; T[i + 1] = cy + (T0[i + 1] - cy) * .42; }   // la aguja nace del centro del techo
    const caras = []; for (let i = 0; i < T.length; i += 2) { const j = (i + 2) % T.length, ex = (T[i] + T[j]) / 2, ey = (T[i + 1] + T[j + 1]) / 2; caras.push([i, j, (ex - px) ** 2 + (ey - py) ** 2]); }
    caras.sort((a, q) => q[2] - a[2]); for (const [i, j] of caras) { const dx = T[j] - T[i], dy = T[j + 1] - T[i + 1]; c.fillStyle = SH(b.roof, clamp((dy - dx) / (Math.hypot(dx, dy) || 1) * -.12, -.2, .1)); c.beginPath(); c.moveTo(T[i], T[i + 1]); c.lineTo(T[j], T[j + 1]); c.lineTo(apex[0], apex[1]); c.closePath(); c.fill(); }
  } else {   // techo plano: borde, y según el edificio helipuerto, cúpula, ajedrez o equipos
    const T = TX[0], ins = .86; c.strokeStyle = SH(b.roof, .14); c.beginPath(); for (let i = 0; i < T.length; i += 2) { const x = cx + (T[i] - cx) * ins, y = cy + (T[i + 1] - cy) * ins; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke();
    const w = Math.min(b.bb[2] - b.bb[0], b.bb[3] - b.bb[1]) * f;
    if (b.t === 'helipuerto' && w > 16) { const r = Math.min(9, w * .28); c.strokeStyle = N('#f2c230'); c.lineWidth = .9; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); c.fillStyle = N('#f4f4f0'); const hh = r * .55, hw = r * .38; c.fillRect(cx - hw, cy - hh, hw * .35, hh * 2); c.fillRect(cx + hw * .65, cy - hh, hw * .35, hh * 2); c.fillRect(cx - hw, cy - hh * .12, hw * 2, hh * .24); c.lineWidth = .5; }
    else if (b.t === 'cupula') { const r = w * .3, A = sube(cx, cy, .1); c.fillStyle = SH(b.roof, -.15); c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); c.fillStyle = N(b.roof); c.beginPath(); c.arc((cx + A[0]) / 2, (cy + A[1]) / 2, r * .85, 0, TAU); c.fill(); c.fillStyle = SH(b.roof, .25); c.beginPath(); c.arc((cx + A[0]) / 2 - r * .25, (cy + A[1]) / 2 - r * .28, r * .35, 0, TAU); c.fill(); }
    else if (b.t === 'ajedrez') { c.save(); c.beginPath(); for (const T2 of TX) { c.moveTo(T2[0], T2[1]); for (let i = 2; i < T2.length; i += 2) c.lineTo(T2[i], T2[i + 1]); c.closePath(); } c.clip('evenodd'); const s = 2.4; for (let y = b.bb[1] - oy; y < b.bb[3] - oy + s; y += s) for (let x = b.bb[0] - ox; x < b.bb[2] - ox + s; x += s) { if (((x / s | 0) + (y / s | 0)) % 2) continue; const q = alto(x, y, 0); c.fillStyle = N('#1d1d1d'); c.fillRect(q[0], q[1], s * f, s * f); } c.restore(); }
    else if (w > 14 && b.k2 < .6) { const q = b.k2; for (let k = 0; k < 2 + (q * 4 | 0); k++) { const ax = cx + (h2(k, b.bb[0] | 0, 93) - .5) * w * .5, ay = cy + (h2(k, b.bb[1] | 0, 94) - .5) * w * .5; c.fillStyle = SH(b.roof, -.2); c.fillRect(ax - 1.4, ay - 1, 2.8, 2); } }   // aires y tanques
  }
}
/* edificio real bajo (1 o 2 pisos) dibujado con el suelo, como las casas: fachadas al sur y techo levantado */
function sitEdifSuelo(c, b) {
  const hz = 1.4 + b.z * 18;
  for (let r = 0; r < b.R.length; r++) { const P = b.R[r], m = P.length, sg = b.sg[r]; for (let i = 0; i < m; i += 2) { const j = (i + 2) % m, dx = P[j] - P[i], dy = P[j + 1] - P[i + 1], ny = -dx * sg, nx = dy * sg; if (ny <= .05 * Math.abs(nx)) continue; c.fillStyle = Math.abs(nx) > Math.abs(ny) ? b.wb : b.wa; c.beginPath(); c.moveTo(P[i], P[i + 1]); c.lineTo(P[j], P[j + 1]); c.lineTo(P[j], P[j + 1] - hz); c.lineTo(P[i], P[i + 1] - hz); c.closePath(); c.fill(); } }
  c.fillStyle = b.roof; c.beginPath(); for (const P of b.R) { c.moveTo(P[0], P[1] - hz); for (let i = 2; i < P.length; i += 2) c.lineTo(P[i], P[i + 1] - hz); c.closePath(); } c.fill('evenodd');
  if (b.I && (b.t === 'cuatro' || b.t === 'dos')) { c.fillStyle = shade(b.roof, .1); c.beginPath(); for (const Q of b.I) { c.moveTo(Q[0], Q[1] - hz - 1); for (let i = 2; i < Q.length; i += 2) c.lineTo(Q[i], Q[i + 1] - hz - 1); c.closePath(); } c.fill('evenodd'); c.strokeStyle = shade(b.roof, -.25); c.lineWidth = .4; c.beginPath(); for (let r = 0; r < b.R.length; r++) { const P = b.R[r], M = b.M[r]; for (let i = 0; i < P.length; i += 2) { const Q = b.I[M[i]]; c.moveTo(P[i], P[i + 1] - hz); c.lineTo(Q[M[i + 1] * 2], Q[M[i + 1] * 2 + 1] - hz - 1); } } c.stroke(); }
  else { c.strokeStyle = 'rgba(20,16,12,.18)'; c.lineWidth = .5; c.beginPath(); for (const P of b.R) { c.moveTo(P[0], P[1] - hz); for (let i = 2; i < P.length; i += 2) c.lineTo(P[i], P[i + 1] - hz); c.closePath(); } c.stroke(); }
}
