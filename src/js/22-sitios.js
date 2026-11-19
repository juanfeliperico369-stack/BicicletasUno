/* =====================================================================
   SITIOS REALES (v1.5): los lugares importantes del valle con la forma, la altura y el estilo de sus
   edificios reales — universidades, colegios, alcaldías, hospitales, iglesias, bibliotecas, coliseos,
   terminales — y todas las canchas, pistas y piscinas. Datos: src/data/sitios.bin (motor-valle/geo/sitios.py),
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
  ['#a86a4c', '#8b5740', '#8f9196', '#9a5232'],   // 11 ladrillo y gris (bibliotecas, museos)
  ['#e9dab3', '#d1bf92', '#c9b98f', '#b85c38'],   // 12 art decó (Museo de Antioquia, edificios Carré y Vásquez, la estación del Ferrocarril)
  ['#2a302d', '#1f2421', '#3a3c41', '#4b5a55'],   // 13 Palacio de la Cultura: ajedrezado en negro y verde grisáceo, cúpula de hierro
  ['#3a3f4a', '#262a32', '#cfd2d4', '#cfd2d4'],   // 14 rocas de la Biblioteca España: pizarra oscura, techo claro
  ['#6a645c', '#55504a', '#4b4f55', '#4b4f55'],   // 15 piedra (Biblioteca EPM)
  ['#a6573a', '#8a4630', '#c9cdd2', '#c9cdd2'],   // 16 Teatro Metropolitano: planos de ladrillo y techo claro
  ['#e3e6ea', '#c3c9d0', '#d8dce0', '#d8dce0'],   // 17 Coltejer: concreto claro
  ['#4b5a55', '#3d4a45', '#56665f', '#56665f']    // 18 hierro (la cúpula del Palacio de la Cultura)
];
const SIT_AJEDREZ = '#8e9c8f', SIT_JARDIN = '#6aa94f', SIT_SUELO = ['#d9d1bd', '#b5694a', '#a39d91'];   // (2: grava del patio de rieles)   // cuadros del Palacio de la Cultura, techos verdes y suelos (1: plaza de ladrillo)
const sitZ = fl => fl > 0 ? .03 + fl * .03 : 0;
const SIT_PISCINA = '#4fb3e3';
const SIT_TECHO = ['plano', 'cuatro', 'dos', 'helipuerto', 'aguja', 'cupula', 'ajedrez', 'cubierta', 'jardin'];
const SIT_NOMBRE = {   // cada lugar con postal y el nombre de su edificio o sitio real: si aparece a menos de 600 m, el lugar se ubica sobre él y toma su forma real
  udea: /Universidad de Antioquia/i, unal: /Universidad Nacional de Colombia/i, eafit: /Universidad EAFIT/i, hospbello: /^Hospital Marco Fidel Su[aá]rez/i,
  coltejer: /Edificio Coltejer/i, palacio: /Palacio de la Cultura/i, catedral: /Bas[ií]lica Metropolitana/i, terminalN: /Terminal de transportes del Norte/i, terminalS: /^Terminal del Sur$/i,
  bibespana: /Biblioteca Espa[ñn]a/i, explora: /Explora/i, memoria: /Casa de la Memoria/i, mamm: /Arte Moderno|MAMM/i, teatro: /^Teatro Metropolitano$/i,
  itagui: /^Iglesia Principal de Itag/i, copacabana: /^Iglesia Cat[oó]lica Copacabana$/i
};
const sitArea = P => { let a = 0; for (let i = 0, n = P.length; i < n; i += 2) { const j = (i + 2) % n; a += P[i] * P[j + 1] - P[j] * P[i + 1]; } return a / 2; };
const sitCaja = R => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const P of R) for (let i = 0; i < P.length; i += 2) { if (P[i] < x0) x0 = P[i]; if (P[i] > x1) x1 = P[i]; if (P[i + 1] < y0) y0 = P[i + 1]; if (P[i + 1] > y1) y1 = P[i + 1]; } return [x0, y0, x1, y1]; };
const sitTinte = (hex, k) => k ? shade(hex, k) : hex;

Object.assign(CityMap, {
  /* lee sitios.bin: sitios (contornos), edificios (anillos, cumbreras), canchas, pistas y piscinas, en px del mundo */
  parseSitios(u8) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), K = TS / (SITIOS_META.u || 8), NM = SITIOS_META.names || [];
    const ver = dv.getUint8(3) - 48; let o = 4; const nS = dv.getUint32(o, true), nE = dv.getUint32(o + 4, true), nC = dv.getUint32(o + 8, true), nP = dv.getUint32(o + 12, true), nW = dv.getUint32(o + 16, true), nZ = ver >= 2 ? dv.getUint32(o + 20, true) : 0, nQ = ver >= 3 ? dv.getUint32(o + 24, true) : 0, nU = ver >= 3 ? dv.getUint32(o + 28, true) : 0; o += ver >= 3 ? 32 : ver >= 2 ? 24 : 20;   /* SIT2: plazas · SIT3: partes y suelos · SIT4: suelos con ángulo */   /* SIT2: plazas · SIT3: partes de los emblemáticos y suelos */
    const ring = () => { const n = dv.getUint16(o, true); let x = dv.getUint16(o + 2, true), y = dv.getUint16(o + 4, true); o += 6; const P = new Float32Array(n * 2); P[0] = x * K; P[1] = y * K; for (let i = 1; i < n; i++) { x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); o += 4; P[i * 2] = x * K; P[i * 2 + 1] = y * K; } return P; };
    const poly = () => { const k = dv.getUint8(o); o++; const R = []; for (let i = 0; i < k; i++) R.push(ring()); return R; };
    const S = [], E = [], C = [], PI = [], W = [], Ef = [];   /* Ef: edificio por su número en el archivo (las partes lo nombran así) */
    for (let i = 0; i < nS; i++) { const kb = dv.getUint8(o), est = dv.getUint8(o + 1), nm = dv.getUint16(o + 2, true); o += 4; const R = poly(); S.push({ i, k: SIT_K[kb & 127], suelto: !!(kb & 128), est: est === 255 ? -1 : est, name: NM[nm] || '', R, bb: R.length ? sitCaja(R) : [0, 0, 0, 0], A: R.length ? Math.abs(sitArea(R[0])) : 0 }); }
    for (let i = 0; i < nE; i++) {
      const s = dv.getUint16(o, true), kb = dv.getUint8(o + 2), fl = dv.getUint8(o + 3), roof = dv.getUint8(o + 4), est = dv.getUint8(o + 5), nm = dv.getUint16(o + 6, true); o += 8;
      const R = poly(), I = poly(); if (!R.length) { Ef.push(null); continue; }
      const bb = sitCaja(R), A = R.map(sitArea), h = h2(bb[0] | 0, bb[1] | 0, 91), ES = SIT_EST[est] || SIT_EST[0], teja = roof === 1 || roof === 2, tn = (h - .5) * .08;
      const b = { s, k: SIT_K[kb] || 'uni', fl, t: SIT_TECHO[roof] || 'plano', est, name: NM[nm] || '', R, A, I: I.length ? I : null, bb, x: (bb[0] + bb[2]) / 2, y: (bb[1] + bb[3]) / 2, z: clamp(.03 + fl * .03, .06, 1.6), sitio: true, B: true, k2: h, pal: [],
        wa: sitTinte(ES[0], tn), wb: sitTinte(ES[1], tn), roof: sitTinte(teja ? ES[3] : ES[2], tn * 1.2), sg: R.map((P, r) => (A[r] > 0 ? 1 : -1) * (r ? -1 : 1)) };
      if (b.I) b.M = R.map(P => { const n = P.length >> 1, m = new Uint16Array(n * 2); for (let v = 0; v < n; v++) { let bd = 1e18; for (let r = 0; r < b.I.length; r++) { const Q = b.I[r]; for (let w = 0; w < Q.length; w += 2) { const d = (Q[w] - P[v * 2]) ** 2 + (Q[w + 1] - P[v * 2 + 1]) ** 2; if (d < bd) { bd = d; m[v * 2] = r; m[v * 2 + 1] = w >> 1; } } } } return m; });   // cada esquina del alero con su cumbrera más cercana
      E.push(b); Ef.push(b);
    }
    for (let i = 0; i < nC; i++) { C.push({ x: dv.getUint16(o, true) * K, y: dv.getUint16(o + 2, true) * K, L: dv.getUint16(o + 4, true) * K, A: dv.getUint16(o + 6, true) * K, an: dv.getInt16(o + 8, true) / 100 * Math.PI / 180, t: dv.getUint8(o + 10) }); o += 11; }
    for (let i = 0; i < nP; i++) { const R = poly(); if (R.length) PI.push({ R, bb: sitCaja(R) }); }
    for (let i = 0; i < nW; i++) { const R = poly(); if (R.length) W.push({ R, bb: sitCaja(R) }); }
    const Z = []; for (let i = 0; i < nZ; i++) { const R = poly(); if (R.length) Z.push({ R, bb: sitCaja(R) }); }
    for (let i = 0; i < nQ; i++) {   // partes: prismas con base elevada y muros que se pueden inclinar (torres, cúpulas, terrazas, la aguja del Coltejer)
      const e = dv.getUint16(o, true), z0 = dv.getUint16(o + 2, true) / 10, z1 = dv.getUint16(o + 4, true) / 10, est = dv.getUint8(o + 6), roof = dv.getUint8(o + 7), fg = dv.getUint8(o + 8); o += 9;
      const B = ring(), T = fg & 1 ? ring() : null, b = Ef[e]; if (!b || (T && T.length !== B.length)) continue;
      const q = { fl0: z0, fl1: z1, z0: sitZ(z0), z1: sitZ(z1), B, T, est, t: SIT_TECHO[roof] || 'plano', sg: sitArea(B) > 0 ? 1 : -1, pal: [] };
      (b.P || (b.P = [])).push(q); b.zt = Math.max(b.zt || b.z, q.z1); const bb = sitCaja([T || B]); b.bb = [Math.min(b.bb[0], bb[0]), Math.min(b.bb[1], bb[1]), Math.max(b.bb[2], bb[2]), Math.max(b.bb[3], bb[3])];
    }
    const U = []; for (let i = 0; i < nU; i++) { const col = dv.getUint8(o); let an = 0; o++; if (ver >= 4) { an = dv.getInt16(o, true) / 100 * Math.PI / 180; o += 2; } const R = poly(); if (R.length) U.push({ col, an, R, bb: sitCaja(R) }); }   /* SIT4: con el ángulo de los rieles */
    for (const b of E) if (b.P) b.P.sort((a, q) => a.z0 - q.z0);
    return { S, E, C, P: PI, W, Z, U };
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
    const D = this.sit; if (!D) return; const t = this.t, sitT = this.sitT = new Map(), sitB = this.sitB = new Set(), sitBE = this.sitBE = new Map();
    const NO = new Set([TT.ROAD, TT.AVE, TT.AUTO, TT.BRIDGE, TT.WATER, TT.CANAL, TT.STATION, TT.CICLO, TT.DEPOT]);
    for (const s of D.S) {
      if (!s.R.length || s.suelto) continue;
      const verde = s.k === 'uni' || s.k === 'dep', base = verde ? TT.GRASS : s.k === 'trans' ? TT.LAND : TT.PLAZA;   // los patios de trenes no se cruzan en bici   // campus verdes y arborizados (así se ven desde el aire); colegios, hospitales y templos con patio de piso
      this.sitLlena(s.R, (i) => { sitT.set(i, s.i); const v = t[i]; if (v === TT.BRICK || v === TT.BLDG || (verde && (v === TT.PLAZA || v === TT.WALK || v === TT.LAND))) t[i] = base; });
    }
    for (const z of D.Z || []) this.sitLlena(z.R, (i) => { if (sitT.has(i) && t[i] === TT.GRASS) t[i] = TT.PLAZA; });   // las plazas de verdad dentro de los campus
    for (let bi0 = 0; bi0 < D.E.length; bi0++) {
      const b = D.E[bi0], s = D.S[b.s]; let n = 0;
      const bi = bi0; this.sitLlena(b.R, (i) => { n++; sitT.set(i, b.s); if (!NO.has(t[i])) { t[i] = TT.BLDG; sitB.add(i); sitBE.set(i, bi); } });
      if (!n) { const i = Math.floor(b.y / TS) * MW + Math.floor(b.x / TS), v = t[i]; if (v === TT.GRASS || v === TT.PLAZA || v === TT.BRICK || v === TT.BLDG) { t[i] = TT.BLDG; sitB.add(i); sitT.set(i, b.s); } }   // muy pequeño: al menos su casilla
    }
    // en los campus, un andén de una casilla alrededor de cada bloque; el resto queda en prado (con muchos árboles)
    const anden = []; for (const i of sitB) { const s = D.S[sitT.get(i)]; if (!s || s.suelto || s.k !== 'uni') continue; for (const d of [1, -1, MW, -MW]) { const j = i + d; if (t[j] === TT.GRASS && sitT.get(j) === s.i) anden.push(j); } }
    for (const j of anden) t[j] = TT.PLAZA;
    // índice por trozo (CH casillas): qué sitios, edificios, canchas, pistas y piscinas tocan cada trozo
    const G = this.sitG = new Map(), S = CH * TS, add = (bb, key, it) => { for (let gy = Math.floor(bb[1] / S); gy <= Math.floor(bb[3] / S); gy++) for (let gx = Math.floor(bb[0] / S); gx <= Math.floor(bb[2] / S); gx++) { const k = gx + ',' + gy; let c = G.get(k); if (!c) G.set(k, c = { s: [], e: [], c: [], p: [], w: [], u: [] }); c[key].push(it); } };
    for (const u of D.U || []) add(u.bb, 'u', u);
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
    for (const u of T.u) { ruta(u.R); c.fillStyle = SIT_SUELO[u.col] || SIT_SUELO[0]; c.fill('evenodd');
      if (u.col === 2) { c.save(); c.clip('evenodd'); c.translate((u.bb[0] + u.bb[2]) / 2, (u.bb[1] + u.bb[3]) / 2); c.rotate(u.an); const R2 = Math.hypot(u.bb[2] - u.bb[0], u.bb[3] - u.bb[1]) / 2 + 4;   // patio de rieles: vías paralelas con sus durmientes
        c.strokeStyle = '#7d766c'; c.lineWidth = 2.2; c.beginPath(); for (let v = -R2; v < R2; v += 7) { c.moveTo(-R2, v); c.lineTo(R2, v); } c.stroke();
        c.strokeStyle = '#5c5f66'; c.lineWidth = .45; c.beginPath(); for (let v = -R2; v < R2; v += 7) { c.moveTo(-R2, v - .7); c.lineTo(R2, v - .7); c.moveTo(-R2, v + .7); c.lineTo(R2, v + .7); } c.stroke(); c.restore(); continue; }
      if (u.col === 1) { c.save(); c.clip('evenodd'); c.strokeStyle = 'rgba(90,40,25,.18)'; c.lineWidth = .35; c.beginPath(); for (let y = u.bb[1]; y < u.bb[3]; y += 2.2) { c.moveTo(u.bb[0], y); c.lineTo(u.bb[2], y); } c.stroke(); c.restore(); } }   // plazas de ladrillo
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
function sitCuerpo3D(c, b, ox, oy, px, py, K, p, nb) {
  const f = 1 + K * b.z, n = b.R.length, BX = [], TX = [];
  for (let r = 0; r < n; r++) { const P = b.R[r], m = P.length, B = new Float32Array(m), Tt = new Float32Array(m); for (let i = 0; i < m; i += 2) { const x = P[i] - ox, y = P[i + 1] - oy; B[i] = x; B[i + 1] = y; Tt[i] = px + (x - px) * f; Tt[i + 1] = py + (y - py) * f; } BX.push(B); TX.push(Tt); }
  const W = [];
  for (let r = 0; r < n; r++) { const B = BX[r], m = B.length, sg = b.sg[r]; for (let i = 0; i < m; i += 2) { const j = (i + 2) % m, dx = B[j] - B[i], dy = B[j + 1] - B[i + 1], nx = dy * sg, ny = -dx * sg, ex = (B[i] + B[j]) / 2, ey = (B[i + 1] + B[j + 1]) / 2; if (nx * (px - ex) + ny * (py - ey) <= 0) continue; W.push([r, i, j, (ex - px) ** 2 + (ey - py) ** 2, Math.abs(nx) > Math.abs(ny)]); } }
  W.sort((a, q) => q[3] - a[3]);
  const nf = Math.max(1, Math.min(14, b.fl));
  for (const [r, i, j, , lado] of W) {
    const B = BX[r], T = TX[r];
    c.fillStyle = lado ? p.wb : p.wa; c.beginPath(); c.moveTo(B[i], B[i + 1]); c.lineTo(B[j], B[j + 1]); c.lineTo(T[j], T[j + 1]); c.lineTo(T[i], T[i + 1]); c.closePath(); c.fill();
    if (b.est === 13) { sitCuadros(c, B[i], B[i + 1], B[j], B[j + 1], T[j], T[j + 1], T[i], T[i + 1], Math.max(2, Math.round(Math.hypot(B[j] - B[i], B[j + 1] - B[i + 1]) / 4)), Math.max(2, b.fl * 2), p.cu || (p.cu = nb ? mixHex(SIT_AJEDREZ, '#0b1430', nb * .17) : SIT_AJEDREZ)); continue; }   // Palacio de la Cultura: ajedrezado
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
    if (b.t === 'jardin') techo(TX, N(SIT_JARDIN));   // techos verdes (Edificio EPM)
    const T = TX[0], ins = .86; c.strokeStyle = SH(b.roof, .14); c.beginPath(); for (let i = 0; i < T.length; i += 2) { const x = cx + (T[i] - cx) * ins, y = cy + (T[i + 1] - cy) * ins; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke();
    const w = Math.min(b.bb[2] - b.bb[0], b.bb[3] - b.bb[1]) * f;
    if (b.t === 'helipuerto' && w > 16) { const r = Math.min(9, w * .28); c.strokeStyle = N('#f2c230'); c.lineWidth = .9; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); c.fillStyle = N('#f4f4f0'); const hh = r * .55, hw = r * .38; c.fillRect(cx - hw, cy - hh, hw * .35, hh * 2); c.fillRect(cx + hw * .65, cy - hh, hw * .35, hh * 2); c.fillRect(cx - hw, cy - hh * .12, hw * 2, hh * .24); c.lineWidth = .5; }
    else if (b.t === 'cupula') { const r = w * .3, A = sube(cx, cy, .1); c.fillStyle = SH(b.roof, -.15); c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); c.fillStyle = N(b.roof); c.beginPath(); c.arc((cx + A[0]) / 2, (cy + A[1]) / 2, r * .85, 0, TAU); c.fill(); c.fillStyle = SH(b.roof, .25); c.beginPath(); c.arc((cx + A[0]) / 2 - r * .25, (cy + A[1]) / 2 - r * .28, r * .35, 0, TAU); c.fill(); }
    else if (b.t === 'ajedrez') { c.save(); c.beginPath(); for (const T2 of TX) { c.moveTo(T2[0], T2[1]); for (let i = 2; i < T2.length; i += 2) c.lineTo(T2[i], T2[i + 1]); c.closePath(); } c.clip('evenodd'); const s = 2.4; for (let y = b.bb[1] - oy; y < b.bb[3] - oy + s; y += s) for (let x = b.bb[0] - ox; x < b.bb[2] - ox + s; x += s) { if (((x / s | 0) + (y / s | 0)) % 2) continue; const q = alto(x, y, 0); c.fillStyle = N('#1d1d1d'); c.fillRect(q[0], q[1], s * f, s * f); } c.restore(); }
    else if (w > 14 && b.k2 < .6) { const q = b.k2; for (let k = 0; k < 2 + (q * 4 | 0); k++) { const ax = cx + (h2(k, b.bb[0] | 0, 93) - .5) * w * .5, ay = cy + (h2(k, b.bb[1] | 0, 94) - .5) * w * .5; c.fillStyle = SH(b.roof, -.2); c.fillRect(ax - 1.4, ay - 1, 2.8, 2); } }   // aires y tanques
  }
}
/* cuadros alternos sobre un muro proyectado (A-B abajo, C-D arriba, D sobre A), por interpolación bilineal */
function sitCuadros(c, ax, ay, bx, by, cx, cy, dx, dy, nu, nv, col) {
  const P = (s2, t) => [ax + (bx - ax) * s2 + (dx - ax) * t + (ax - bx + cx - dx) * s2 * t, ay + (by - ay) * s2 + (dy - ay) * t + (ay - by + cy - dy) * s2 * t];
  c.fillStyle = col; c.beginPath();
  for (let v = 0; v < nv; v++) for (let u = v & 1; u < nu; u += 2) { const a = P(u / nu, v / nv), b = P((u + 1) / nu, v / nv), d = P((u + 1) / nu, (v + 1) / nv), e = P(u / nu, (v + 1) / nv); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(e[0], e[1]); c.closePath(); }
  c.fill();
}
/* edificio real en 3D: su cuerpo (si tiene) y sus partes de abajo hacia arriba (a igual altura, de la más lejana a la más cercana) */
function sitEdif3D(c, b, ox, oy, px, py, K, p, nb) {
  if (b.fl > 0) sitCuerpo3D(c, b, ox, oy, px, py, K, p, nb);
  if (!b.P) return;
  const L = b.P.map(q => { const B = q.B; let x = 0, y = 0; for (let i = 0; i < B.length; i += 2) { x += B[i]; y += B[i + 1]; } const m = B.length / 2; return [q, q.z0, (x / m - ox - px) ** 2 + (y / m - oy - py) ** 2]; });
  L.sort((a, q) => a[1] - q[1] || q[2] - a[2]);
  for (const [q] of L) sitParte3D(c, q, ox, oy, px, py, K, nb);
}
/* una parte: prisma entre z0 y z1; si sus muros se inclinan (anillo de arriba distinto), cada muro se ve solo si la cámara queda de su lado */
function sitParte3D(c, q, ox, oy, px, py, K, nb) {
  const ES = SIT_EST[q.est] || SIT_EST[0], mz = col => nb ? mixHex(col, '#0b1430', nb * .17) : col, teja = q.t === 'cupula';
  const p = q.pal[nb] || (q.pal[nb] = { wa: mz(ES[0]), wb: mz(ES[1]), roof: mz(teja ? ES[3] : ES[2]), ln: nb >= 2 ? '#ffd97a' : shade(ES[1], -.22), cu: mz(SIT_AJEDREZ), ja: mz(SIT_JARDIN), d1: mz(shade(ES[3], -.18)), d2: mz(shade(ES[3], .22)), bo: mz(shade(ES[2], .14)) });
  const B = q.B, T = q.T || q.B, m = B.length, f0 = 1 + K * q.z0, f1 = 1 + K * q.z1, Hc = 1 / K, dz = q.z1 - q.z0, bx = new Float32Array(m), tx = new Float32Array(m);
  for (let i = 0; i < m; i += 2) { const x0 = B[i] - ox, y0 = B[i + 1] - oy, x1 = T[i] - ox, y1 = T[i + 1] - oy; bx[i] = px + (x0 - px) * f0; bx[i + 1] = py + (y0 - py) * f0; tx[i] = px + (x1 - px) * f1; tx[i + 1] = py + (y1 - py) * f1; }
  const W = [];
  for (let i = 0; i < m; i += 2) {
    const j = (i + 2) % m, Px = B[i] - ox, Py = B[i + 1] - oy, ax = B[j] - B[i], ay = B[j + 1] - B[i + 1], cx = T[i] - B[i], cy = T[i + 1] - B[i + 1], s2 = q.sg;
    const nx = ay * dz * s2, ny = -ax * dz * s2, nz = (ax * cy - ay * cx) * s2;   // normal hacia afuera del muro (de abajo al anillo de arriba)
    if ((px - Px) * nx + (py - Py) * ny + (Hc - q.z0) * nz <= 0) continue;
    const ex = (bx[i] + bx[j] + tx[i] + tx[j]) / 4 - px, ey = (bx[i + 1] + bx[j + 1] + tx[i + 1] + tx[j + 1]) / 4 - py; W.push([i, j, ex * ex + ey * ey, Math.abs(ay) > Math.abs(ax)]);
  }
  W.sort((a, w) => w[2] - a[2]);
  const pisos = q.fl1 - q.fl0, lineas = (q.est === 3 || q.est === 2 || q.est === 17) && pisos >= 2 && q.T == null;
  for (const [i, j, , lado] of W) {
    c.fillStyle = lado ? p.wb : p.wa; c.beginPath(); c.moveTo(bx[i], bx[i + 1]); c.lineTo(bx[j], bx[j + 1]); c.lineTo(tx[j], tx[j + 1]); c.lineTo(tx[i], tx[i + 1]); c.closePath(); c.fill();
    if (q.est === 13) sitCuadros(c, bx[i], bx[i + 1], bx[j], bx[j + 1], tx[j], tx[j + 1], tx[i], tx[i + 1], Math.max(2, Math.round(Math.hypot(B[j] - B[i], B[j + 1] - B[i + 1]) / 4)), Math.max(2, Math.round(pisos * 2)), p.cu);
    else if (lineas) { c.strokeStyle = p.ln; c.lineWidth = .5; c.beginPath(); for (let k = 1; k < pisos; k++) { const t = k / pisos; c.moveTo(bx[i] + (tx[i] - bx[i]) * t, bx[i + 1] + (tx[i + 1] - bx[i + 1]) * t); c.lineTo(bx[j] + (tx[j] - bx[j]) * t, bx[j + 1] + (tx[j + 1] - bx[j + 1]) * t); } c.stroke(); }
  }
  let A = 0, cx = 0, cy = 0; for (let i = 0; i < m; i += 2) { const j = (i + 2) % m; A += tx[i] * tx[j + 1] - tx[j] * tx[i + 1]; cx += tx[i]; cy += tx[i + 1]; } cx /= m / 2; cy /= m / 2;
  if (Math.abs(A) < 4) return;   // remate en punta: no hay techo que pintar
  c.fillStyle = q.t === 'jardin' ? p.ja : p.roof; c.beginPath(); c.moveTo(tx[0], tx[1]); for (let i = 2; i < m; i += 2) c.lineTo(tx[i], tx[i + 1]); c.closePath(); c.fill();
  if (q.t === 'cupula') {   // cúpula: base en sombra, casquete corrido hacia arriba y su brillo
    let r = 1e9; for (let i = 0; i < m; i += 2) r = Math.min(r, Math.hypot(tx[i] - cx, tx[i + 1] - cy)); r *= .95; const g = (1 + K * (q.z1 + .07)) / f1, hx = (cx + px + (cx - px) * g) / 2, hy = (cy + py + (cy - py) * g) / 2;
    c.fillStyle = p.d1; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); c.fillStyle = p.roof; c.beginPath(); c.arc(hx, hy, r * .86, 0, TAU); c.fill(); c.fillStyle = p.d2; c.beginPath(); c.arc(hx - r * .25, hy - r * .28, r * .34, 0, TAU); c.fill();
  } else if (q.t !== 'jardin') { c.strokeStyle = p.bo; c.lineWidth = .5; c.beginPath(); for (let i = 0; i < m; i += 2) { const x = cx + (tx[i] - cx) * .86, y = cy + (tx[i + 1] - cy) * .86; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke(); }
}
/* edificio real bajo (1 o 2 pisos) dibujado con el suelo, como las casas: fachadas al sur y techo levantado */
function sitEdifSuelo(c, b) {
  const hz = 1.4 + b.z * 18;
  for (let r = 0; r < b.R.length; r++) { const P = b.R[r], m = P.length, sg = b.sg[r]; for (let i = 0; i < m; i += 2) { const j = (i + 2) % m, dx = P[j] - P[i], dy = P[j + 1] - P[i + 1], ny = -dx * sg, nx = dy * sg; if (ny <= .05 * Math.abs(nx)) continue; c.fillStyle = Math.abs(nx) > Math.abs(ny) ? b.wb : b.wa; c.beginPath(); c.moveTo(P[i], P[i + 1]); c.lineTo(P[j], P[j + 1]); c.lineTo(P[j], P[j + 1] - hz); c.lineTo(P[i], P[i + 1] - hz); c.closePath(); c.fill(); } }
  c.fillStyle = b.roof; c.beginPath(); for (const P of b.R) { c.moveTo(P[0], P[1] - hz); for (let i = 2; i < P.length; i += 2) c.lineTo(P[i], P[i + 1] - hz); c.closePath(); } c.fill('evenodd');
  if (b.I && (b.t === 'cuatro' || b.t === 'dos')) { c.fillStyle = shade(b.roof, .1); c.beginPath(); for (const Q of b.I) { c.moveTo(Q[0], Q[1] - hz - 1); for (let i = 2; i < Q.length; i += 2) c.lineTo(Q[i], Q[i + 1] - hz - 1); c.closePath(); } c.fill('evenodd'); c.strokeStyle = shade(b.roof, -.25); c.lineWidth = .4; c.beginPath(); for (let r = 0; r < b.R.length; r++) { const P = b.R[r], M = b.M[r]; for (let i = 0; i < P.length; i += 2) { const Q = b.I[M[i]]; c.moveTo(P[i], P[i + 1] - hz); c.lineTo(Q[M[i + 1] * 2], Q[M[i + 1] * 2 + 1] - hz - 1); } } c.stroke(); }
  else { c.strokeStyle = 'rgba(20,16,12,.18)'; c.lineWidth = .5; c.beginPath(); for (const P of b.R) { c.moveTo(P[0], P[1] - hz); for (let i = 2; i < P.length; i += 2) c.lineTo(P[i], P[i + 1] - hz); c.closePath(); } c.stroke(); }
}
