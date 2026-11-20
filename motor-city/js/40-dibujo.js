/* =====================================================================
   DIBUJO 2D COMPARTIDO · paleta del motor, losas del suelo en caché y pinceles de edificios y vehículos
   Las LOSAS (160 × 160 m) son el corazón del «mismo mapa en todas las vistas»: se pintan una vez
   (suelo suave por casillas con sombreado del relieve, calles y ciclorrutas en vectores con su ancho real,
   agua, canchas, piscinas, árboles por zona y techos de las huellas reales) y las usan la vista cenital,
   el pixel, la 3D oblicua, la maqueta 2:1 y el piso de la vista 3D en WebGL.
   Cada juego puede cambiar la paleta (MC.arte.registrar(juego, { suelo: {...}, via: {...} })).
   ===================================================================== */
/* agua por tipo: [somero, hondo, profundidad a la que ya es «hondo» (m)] · roca de los acantilados */
const AGUA_COL = { mar: [[.36, .74, .80], [.05, .24, .44], 22], lago: [[.40, .64, .62], [.10, .30, .42], 12], rio: [[.47, .58, .52], [.24, .38, .40], 3.5], quebrada: [[.48, .64, .66], [.30, .48, .55], .8] }, ROCA_COL = [.55, .53, .49];
const PAL_SUELO = ['#78ad55', '#3f7a3c', '#cdbfa5', '#bdb3a2', '#5d636e', '#565c68', '#c9c4b8', '#4caf63', '#4f9fd0', '#5f9fb8', '#d8cfbd', '#6b7180', '#e7e2d6', '#b9b4a8', '#4d525c', '#a9a395', '#b8a98e', '#e6d7a8', '#f2f5f9', '#8d8a86'];
const PAL_VIA = { anden: '#d4cfc3', asfalto: '#4a4f59', avenida: '#444955', autopista: '#3c414b', linea: '#f4f1e6', amarilla: '#f2c400', ciclo: '#3fae5a', cicloBorde: '#e8f5d0', peatonal: '#e3dccb', escalas: '#b8a98e', sendero: '#c9b78f' };
MC.arte.pieles.motor.suelo = PAL_SUELO; MC.arte.pieles.motor.via = PAL_VIA;
const PAL_SUELO_REAL = PAL_SUELO.map((c, i) => { const v = hex3(c), gr = (v[0] + v[1] + v[2]) / 3, k = i === 8 || i === 9 ? .1 : .3; return css3([v[0] + (gr - v[0]) * k, v[1] + (gr - v[1]) * k, v[2] + (gr - v[2]) * k].map(x => x * .94)); });   // 2.6: 30 % menos saturado y un poco más oscuro (el agua casi igual)
/* lienzo fuera de pantalla (navegador u OffscreenCanvas; en Node, null) */
function lienzo(w, h) { if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(Math.max(1, w | 0), Math.max(1, h | 0)); if (typeof document !== 'undefined') { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; } return null; }
/* color de techo y de muro de un edificio según su zona, su clase y su semilla (las reglas de la ciudad) */
function estiloEdificio(mundo, e) {
  if (e._est) return e._est; const Z = mundo.estilo(e.x, e.y), s = e.s, k = e.clase;
  let muro = Z.muros[(s * 997 | 0) % Z.muros.length], techo = Z.techos[(s * 131 | 0) % Z.techos.length], plano = s * 7 % 1 < (Z.plancha ?? .5), tanque = h2(e.x | 0, e.y | 0, 31) < (Z.tanques || 0) && plano && e.h < 14;
  if (k === 'nave' || k === 'techo' || k === 'parqueadero') { muro = '#b8c0c8'; techo = '#9aa3ad'; plano = true; }
  else if (k === 'iglesia') { muro = '#efe8d8'; techo = '#b5542f'; plano = false; }
  else if (k === 'invernadero') { muro = '#dfe8ea'; techo = '#e8f0f2'; plano = true; }
  else if (k === 'torre' && Z.nombre !== 'Ladera') { plano = true; techo = '#8d9096'; }
  else if (!plano) techo = s * 13 % 1 < (Z.teja || .3) / Math.max(.05, 1 - (Z.plancha || .5)) ? '#b5542f' : techo;
  return (e._est = { muro, techo, plano, tanque });
}
/* ---------- RUDEZA (2.6, estilo realista): grano, manchas, baldosas, desgaste de las vías y techos con textura ----------
   Todo se hornea en las losas (una vez por losa), así que no cuesta nada por cuadro. Familiar, pero con la ciudad
   como es: asfalto parcheado y con grietas, alcantarillas, manchas de aceite, rayas gastadas, andenes de baldosa con
   bordillo, pasto con parches secos, tejas de barro con hileras y planchas de concreto con humedad. */
const Rudeza = {
  _src: {},
  /* lienzos fuente de ruido (256 px), hechos una sola vez */
  fuente(tipo) {
    if (this._src[tipo] !== undefined) return this._src[tipo]; const S = tipo === 'baldosa' ? 64 : 256, c = lienzo(S, S); if (!c) return (this._src[tipo] = null); const g = c.getContext('2d');
    if (tipo === 'baldosa') { g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(40,36,30,.32)'; g.fillRect(0, 0, S, 2); g.fillRect(0, 0, 2, S); g.fillStyle = 'rgba(255,255,255,.10)'; g.fillRect(2, 2, S - 4, 2); }
    else { const img = g.createImageData(S, S), d = img.data, rnd = mulberry32(tipo === 'grano' ? 11 : 23), cel = tipo === 'grano' ? 4 : 32, n = S / cel, V = []; for (let i = 0; i < n * n; i++) V.push(rnd());
      const vn = (x, y) => { const fx = x / cel, fy = y / cel, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty), a = V[(iy % n) * n + ix % n], b = V[(iy % n) * n + (ix + 1) % n], c2 = V[((iy + 1) % n) * n + ix % n], e = V[((iy + 1) % n) * n + (ix + 1) % n]; return a + (b - a) * sx + (c2 - a) * sy + (a - b - c2 + e) * sx * sy; };
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const v = rnd() * .55 + vn(x, y) * .45, o = (y * S + x) * 4, cl = v > .5; d[o] = d[o + 1] = d[o + 2] = cl ? 255 : 0; d[o + 3] = Math.round(Math.abs(v - .5) * 2 * (cl ? 34 : 60)); }   // motas claras y oscuras con su transparencia
      g.putImageData(img, 0, 0); }
    return (this._src[tipo] = c);
  },
  /* un patrón en metros del mundo: m metros por píxel de la fuente */
  patron(g, tipo, m) { const f = this.fuente(tipo); if (!f) return null; const p = g.createPattern(f, 'repeat'); if (p && p.setTransform && typeof DOMMatrix !== 'undefined') p.setTransform(new DOMMatrix([m, 0, 0, m, 0, 0])); return p; },
  /* textura final de la losa: grano fino (un pase con mezcla normal; las manchas grandes ya van en el color de cada casilla) */
  textura(g, x0, y0, L) { const p = this.patron(g, 'grano', .2); if (!p) return; g.fillStyle = p; g.fillRect(x0, y0, L, L); },
  /* baldosas del andén: se repinta el trazo del andén con la cuadrícula */
  anden(g, vias, lin) { const p = this.patron(g, 'baldosa', .6 / 64); if (!p) return; for (const v of vias) lin(v.p, v.ancho + 3.2, p); },
  /* el asfalto como es: parches, grietas, manchas de aceite y alcantarillas, con azar fijo por tramo */
  asfalto(g, v, res = 6) {
    const P = v.p, w = v.ancho, fino = res >= 4; g.save(); g.lineCap = 'round';   // lo fino (grietas, alcantarillas) solo se ve de cerca
    for (let i = 0; i + 3 < P.length; i += 2) {
      const ax = P[i], ay = P[i + 1], bx = P[i + 2], by = P[i + 3], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy); if (l < 1) continue; const ux = dx / l, uy = dy / l, nx = -uy, ny = ux, rnd = mulberry32((ax * 73 | 0) ^ (ay * 151 | 0) ^ (v.k * 977));
      for (let s = rnd() * 6; s < l; s += 5 + rnd() * 8) {
        const u = rnd(), lat = (rnd() - .5) * w * .7, cx = ax + ux * s + nx * lat, cy = ay + uy * s + ny * lat;
        if (u < .22) { const L2 = 1.5 + rnd() * 5, W2 = w * (.25 + rnd() * .3); g.fillStyle = rnd() < .5 ? 'rgba(98,98,96,.3)' : 'rgba(16,16,18,.24)'; g.save(); g.translate(cx, cy); g.rotate(Math.atan2(uy, ux)); g.fillRect(-L2 / 2, -W2 / 2, L2, W2); g.restore(); }   // parche de asfalto nuevo o viejo
        else if (u < .42) { if (!fino) continue; g.strokeStyle = 'rgba(10,10,10,.42)'; g.lineWidth = .06 + rnd() * .05; g.beginPath(); let px = cx, py = cy; g.moveTo(px, py); for (let q = 0; q < 4 + rnd() * 4; q++) { const a = Math.atan2(uy, ux) + (rnd() - .5) * 2.2; px += Math.cos(a) * (.5 + rnd()); py += Math.sin(a) * (.5 + rnd()); g.lineTo(px, py); } g.stroke(); }   // grieta
        else if (u < .6) { const r = .4 + rnd() * .8; g.fillStyle = 'rgba(8,8,10,.12)'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.beginPath(); g.arc(cx + r * .1, cy, r * .55, 0, TAU); g.fill(); }   // mancha de aceite
        else if (u < .66 && w >= 5 && fino) { g.fillStyle = '#3b3c3e'; g.beginPath(); g.arc(cx, cy, .34, 0, TAU); g.fill(); g.strokeStyle = 'rgba(160,160,155,.4)'; g.lineWidth = .06; g.stroke(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .03; for (const o of [-.15, 0, .15]) { g.beginPath(); g.moveTo(cx - .25, cy + o); g.lineTo(cx + .25, cy + o); g.stroke(); } }   // alcantarilla
      }
    }
    g.restore();
  },
  /* techos: hileras de teja de barro, o plancha de concreto con humedad y su pretil */
  techo(g, b, P, st) {
    const rnd = mulberry32((b.x * 31 | 0) ^ (b.y * 17 | 0)); g.save(); g.beginPath(); g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); g.closePath(); g.clip();
    const R = Math.max(b.hw, b.hd) + 1;
    if (!st.plano) { const L = b.hw > b.hd, ax = L ? -b.uy : b.ux, ay = L ? b.ux : b.uy; g.strokeStyle = 'rgba(70,24,12,.28)'; g.lineWidth = .07; g.beginPath(); for (let t = -R; t <= R; t += .32) { const cx = b.x + ax * t, cy = b.y + ay * t; g.moveTo(cx - ay * R, cy + ax * R); g.lineTo(cx + ay * R, cy - ax * R); } g.stroke(); }   // hileras perpendiculares al caballete
    g.fillStyle = st.plano ? 'rgba(40,42,40,.1)' : 'rgba(50,40,20,.1)'; for (let i = 0; i < 2 + rnd() * 4; i++) { const cx = b.x + (rnd() - .5) * b.hw * 1.6, cy = b.y + (rnd() - .5) * b.hd * 1.6, r = .8 + rnd() * 2.2; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.arc(cx, cy, r * .6, 0, TAU); g.fill(); }   // humedad, musgo y hollín
    g.restore(); if (st.plano) { g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = .22; g.beginPath(); g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); g.closePath(); g.stroke(); }
  },
  /* la paleta del suelo y de las vías, menos de caricatura */
  SUELO: null, VIA: { anden: '#c4bdb0', asfalto: '#46484c', avenida: '#414347', autopista: '#3a3c40', linea: 'rgba(236,232,220,.82)', amarilla: 'rgba(226,182,20,.85)', ciclo: '#3c8f4f', cicloBorde: '#d9e3c6', peatonal: '#d2cab8', escalas: '#a99a80', sendero: '#b8a47c', bordillo: '#a19c92' }
};
/* ---------- losas del suelo ---------- */
class Losas {
  constructor(mundo, op = {}) { this.mundo = mundo; this.L = op.lado || 160; this.cache = new Map(); this.max = op.max || 140; this.version = 0; this.pend = []; this.px = 0; this.maxPx = op.maxPx || (GPU.perfil().nivel === 'alta' ? 40e6 : 22e6); }   // presupuesto de píxeles: las losas nítidas de cerca pesan más
  limpiar() { this.cache.clear(); this.pend.length = 0; this.px = 0; this.version++; }
  _poner(k, c) { this.cache.set(k, c); if (c) this.px += c.width * c.height; while (this.cache.size > this.max || this.px > this.maxPx) { const k0 = this.cache.keys().next().value, c0 = this.cache.get(k0); if (c0) this.px -= c0.width * c0.height; this.cache.delete(k0); if (k0 === k) break; } }
  /* borra las losas de una caja (cuando la ciudad crece o cambia) */
  invalidar(x0, y0, x1, y1) { const L = this.L; for (const k of [...this.cache.keys()]) { const [gx, gy] = k.split(',').map(Number); if ((gx + 1) * L >= x0 && gx * L <= x1 && (gy + 1) * L >= y0 && gy * L <= y1) { const c0 = this.cache.get(k); if (c0) this.px -= c0.width * c0.height; this.cache.delete(k); } } this.version++; }
  /* la losa (gx, gy) a res px por metro; se pinta si no está (o se pone en cola si `diferir`) */
  losa(gx, gy, res, diferir, sinTechos) {
    const fl = typeof sinTechos === 'number' ? sinTechos : (sinTechos ? 1 : 0), k = gx + ',' + gy + ',' + res + ',' + fl + ',' + MC.arte.activa + ',' + MC.estilo; let c = this.cache.get(k);
    if (c) { this.cache.delete(k); this.cache.set(k, c); return c; }
    if (diferir) { if (!this.pend.includes(k)) this.pend.push(k); return null; }
    c = this.pintar(gx, gy, res, fl); this._poner(k, c); return c;
  }
  /* pinta las losas pendientes con un presupuesto de milisegundos */
  trabajar(ms = 6) {
    const inicio = MC.ahora();
    while (this.pend.length && MC.ahora() - inicio < ms) {
      const clave = this.pend.shift();
      const [gx, gy, res, flags, piel, estilo] = clave.split(',');
      if (piel !== MC.arte.activa || estilo !== MC.estilo || this.cache.has(clave)) continue;
      this._poner(clave, this.pintar(+gx, +gy, +res, +flags));
    }
  }
  pintar(gx, gy, res, fl) {
    const ES = Estilo.p, sinTechos = (fl & 1) !== 0, sinArboles = (fl & 2) !== 0, real = !!ES.rudeza, mapa = !ES.rudeza && MC.estilo !== 'clasico', tw = ES.tinta ? clamp(ES.tinta * .9 / Math.max(.8, res), .1, .7) : 0;   /* 2.7: el estilo (mapa de color, tinta y trama) */
    const M = this.mundo, L = this.L, T = M.tile, n = Math.round(L / T), px = Math.max(8, Math.round(L * res)), cv = lienzo(px, px); if (!cv) return null;
    const g = cv.getContext('2d'), x0 = gx * L, y0 = gy * L, S = MC.arte.dato('suelo', real ? PAL_SUELO_REAL : PAL_SUELO), V = Object.assign({}, PAL_VIA, real ? Rudeza.VIA : {}, MC.arte.dato('via', {})); if (mapa) for (const k in V) V[k] = Estilo.col(V[k]);
    /* 1. suelo suave: una casilla = un píxel, con sombreado del relieve y la zona; se agranda con suavizado */
    const m = n + 2, base = lienzo(m, m), bg = base.getContext('2d'), img = bg.createImageData(m, m), D = img.data;
    const luzX = -.55, luzY = -.65;
    for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) {
      const wx = x0 + (i - .5) * T, wy = y0 + (j - .5) * T, tt = M.suelo(wx, wy); let col = S[tt] || '#888';
      if (tt === TT.BRICK || tt === TT.BLDG) col = M.estilo(wx, wy).suelo || col;
      let c = hex3(col); const dzx = (M.cota(wx + T, wy) - M.cota(wx - T, wy)) / (2 * T), dzy = (M.cota(wx, wy + T) - M.cota(wx, wy - T)) / (2 * T); let sh = clamp(1 + (dzx * luzX + dzy * luzY) * 1.6, .62, 1.3); const rn = .96 + h2(Math.floor(wx / T), Math.floor(wy / T), 3) * .08; if (real) c = c.map(v => v * (.93 + h2(Math.floor(wx / 60), Math.floor(wy / 60), 8) * .1)); if (real && (tt === TT.GRASS || tt === TT.MOUNT)) { const q = h2(Math.floor(wx / 30), Math.floor(wy / 30), 5) * .6 + h2(Math.floor(wx / 11), Math.floor(wy / 11), 6) * .4; if (q > .62) c = mez3(c, [.62, .58, .4], (q - .62) * 1.4); else if (q < .2) c = mez3(c, [.2, .3, .16], (.2 - q) * 1.2); }
      /* agua: color según el tipo y la profundidad (turquesa en la orilla del mar, oscuro en lo hondo) y espuma en la orilla */
      if (tt === TT.WATER || tt === TT.CANAL) { const ag = Terreno.aguaEn(M, wx, wy); if (ag) { const A = AGUA_COL[ag.tipo] || AGUA_COL.lago, k = clamp(ag.prof / A[2], 0, 1); c = mez3(A[0], A[1], k); if (ag.orilla < T * 1.3 + 2) c = mez3(c, [.88, .94, .96], .3); sh = 1; } }
      /* laderas muy empinadas: la roca asoma (acantilados y barrancos), y la playa se aclara junto al agua */
      else if (tt !== TT.ROAD && tt !== TT.AVE && tt !== TT.AUTO && tt !== TT.WALK && tt !== TT.CICLO && tt !== TT.BLDG && tt !== TT.BRICK) { const m2 = Math.hypot(dzx, dzy); if (m2 > .65) c = mez3(c, ROCA_COL, clamp((m2 - .65) / .7, 0, .85)); }
      const o = (j * m + i) * 4; let cf = [c[0] * sh * rn, c[1] * sh * rn, c[2] * sh * rn]; if (mapa) cf = Estilo.rgb(cf, ES); D[o] = clamp(cf[0] * 255, 0, 255); D[o + 1] = clamp(cf[1] * 255, 0, 255); D[o + 2] = clamp(cf[2] * 255, 0, 255); D[o + 3] = 255;
    }
    /* la casilla de borde de cada lado es de la losa vecina: así el suavizado no deja costuras entre losas */
    bg.putImageData(img, 0, 0); g.imageSmoothingEnabled = true; const e = px / n; g.drawImage(base, 0, 0, m, m, -e, -e, px + 2 * e, px + 2 * e);
    g.save(); g.scale(res, res); g.translate(-x0, -y0);
    const lejos = res < .3;
    const textura = real && res >= .9 && MC.arte.f('textura');
    const patrones = new Map();
    function patron(material) {
      if (!textura) return null;
      if (!patrones.has(material)) {
        const tile = textura(material);
        let p = null;
        if (tile && tile.metros > 0 && tile.imagen && tile.imagen.width && tile.imagen.height) {
          p = g.createPattern(tile.imagen, 'repeat');
          if (p) p.setTransform(new DOMMatrix().scale(tile.metros / tile.imagen.width, tile.metros / tile.imagen.height));
        }
        patrones.set(material, p);
      }
      return patrones.get(material);
    }
    if (textura) {
      g.save();
      g.globalAlpha = .55;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const x = x0 + i * T, y = y0 + j * T;
        const tipo = M.suelo(x + T / 2, y + T / 2);
        const mat = tipo === TT.GRASS ? 'pasto' : tipo === TT.ROCA ? 'grava' : null;
        const p = mat && patron(mat);
        if (p) { g.fillStyle = p; g.fillRect(x, y, T, T); }
      }
      g.restore();
    }
    /* 2. sitios: canchas, piscinas, plazas y prados de los campus */
    const SI = M.sitios(), dentroL = b => b[2] >= x0 && b[0] <= x0 + L && b[3] >= y0 && b[1] <= y0 + L;
    for (const z of SI.Z) if (dentroL(z.caja)) { g.fillStyle = mapa ? Estilo.col('#d9d1bd') : '#d9d1bd'; this._poly(g, z.R); }
    if (!lejos) for (const c of SI.C) { if (c.x < x0 - 80 || c.x > x0 + L + 80 || c.y < y0 - 80 || c.y > y0 + L + 80) continue; g.save(); g.translate(c.x, c.y); g.rotate(c.ang); const w = c.largo, h = c.ancho; g.fillStyle = c.tipo === 1 ? '#c8643c' : c.tipo === 2 ? '#3c8fc0' : '#4f9a3a'; g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = .35; g.strokeRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2); g.beginPath(); g.moveTo(0, -h / 2 + 1); g.lineTo(0, h / 2 - 1); g.stroke(); g.restore(); }
    for (const p of SI.P) if (dentroL(p.caja)) { g.fillStyle = mapa ? Estilo.col('#4fb3e3') : '#4fb3e3'; this._poly(g, p.R); g.strokeStyle = '#e8f4fa'; g.lineWidth = .6; this._poly(g, p.R, true); }
    /* 3. vías en vectores, del fondo al frente: andén, calzada, rayas; ciclorrutas encima */
    const vias = this._viasEn(x0 - 30, y0 - 30, x0 + L + 30, y0 + L + 30).filter(v => !lejos || v.k <= 3 || v.k === VIA.CICLO), lin = (p, w, col, dash) => { g.strokeStyle = col; g.lineWidth = w; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); if (dash) g.setLineDash([]); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    const carros = vias.filter(v => v.k <= 4), resto = vias.filter(v => v.k > 4);
    if (tw) for (const v of carros) lin(v.p, v.ancho + 3.2 + tw * 2, ES.tintaColor);
    for (const v of carros) lin(v.p, v.ancho + 3.2, V.anden);
    if (tw) for (const v of carros) lin(v.p, v.ancho + tw * 2, ES.tintaColor);
    if (real && res >= .9) {
      const baldosa = patron('anden');
      if (baldosa) for (const v of carros) lin(v.p, v.ancho + 3.2, baldosa);
      else Rudeza.anden(g, carros, lin);
      for (const v of carros) lin(v.p, v.ancho + .5, V.bordillo);
    }
    for (const v of resto) if (v.k !== VIA.CICLO) lin(v.p, v.ancho + (v.k === VIA.ESCALAS ? .6 : 1), v.k === VIA.ESCALAS ? V.escalas : v.k === VIA.SENDERO ? V.sendero : V.peatonal);
    for (const v of carros) lin(v.p, v.ancho, patron(v.k === VIA.CALLE ? 'asfalto_parchado' : 'asfalto') || (v.k === VIA.AUTOPISTA ? V.autopista : v.k === VIA.AVENIDA ? V.avenida : V.asfalto));
    if (fl & 4) for (const v of carros) lin(v.p, v.ancho, 'rgba(15,29,42,.38)');
    if (textura) for (const v of resto) {
      const mat = v.k === VIA.PEATONAL ? 'adoquin' : v.k === VIA.SENDERO ? 'barro' : null;
      const p = mat && patron(mat);
      if (p) lin(v.p, v.ancho, p);
    }
    if (real && res >= .9) for (const v of carros) { lin(v.p, v.ancho * .5, 'rgba(14,14,16,.10)'); Rudeza.asfalto(g, v, res); }   // el centro de los carriles, más gastado y oscuro
    for (const v of carros) if (v.ancho >= 8 && res >= .6) { if (v.k === VIA.AVENIDA || v.k === VIA.AUTOPISTA) lin(v.p, .35, V.amarilla); else lin(v.p, .25, V.linea, [3, 4]); }
    for (const v of resto) if (v.k === VIA.ESCALAS && res >= .8) lin(v.p, v.ancho * .7, 'rgba(90,70,50,.35)', [.35, .45]);
    for (const v of resto) if (v.k === VIA.CICLO) { lin(v.p, v.ancho + .7, V.cicloBorde); lin(v.p, v.ancho, V.ciclo); if (res >= .8) lin(v.p, .18, 'rgba(255,255,255,.85)', [1.5, 1.5]); }
    /* 4. árboles por zona (en pasto y a lo largo de las avenidas) */
    /*    2.6: los mismos árboles de MC.Arboleda (también los del borde de las losas vecinas: ya no quedan cortados).
          En las vistas inclinadas de cerca no se pintan en el piso: se levantan (antes parecían tapetes). */
    if (!lejos && !sinArboles) for (const t of Arboleda.en(M, x0 - 7, y0 - 7, x0 + L + 7, y0 + L + 7, 5000)) { if (MC.estilo !== 'clasico') Arboleda.arriba(g, t); else this.arbol(g, t.x, t.y, t.r, t.s); }
    else if (!lejos && sinArboles) { g.fillStyle = 'rgba(10,16,12,.15)'; g.beginPath(); for (const t of Arboleda.en(M, x0 - 7, y0 - 7, x0 + L + 7, y0 + L + 7, 5000)) { const rM = t.r * (Arboleda.ESPECIES[t.e] || Arboleda.ESPECIES.urapan).ancho; g.moveTo(t.x + rM * .95, t.y + rM * .2); g.ellipse(t.x + rM * .25, t.y + rM * .2, rM * .7, rM * .66, 0, 0, TAU); } g.fill(); }   // la sombra bajo la copa, horneada en el piso (gratis por cuadro)
    /* 5. techos de las huellas reales (sombra suave al sureste) y tanques en las laderas */
    const E = lejos ? [] : M.edificiosEn(x0, y0, x0 + L, y0 + L).sort((a, b) => a.h - b.h);
    for (const b of E) { const P = Mundo.esquinas(b), sh = Math.min(1.4, .3 + b.h * .04); g.fillStyle = 'rgba(20,24,40,.2)';   /* solo oclusión de contacto: la sombra del sol la pone MC.Sombras según la hora */ g.beginPath(); g.moveTo(P[0] + sh, P[1] + sh); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i] + sh, P[i + 1] + sh); g.closePath(); g.fill(); }
    if (!sinTechos) for (const b of E) {
      this.techo(g, b, M, mapa, tw, ES);
      if (real && res >= 1.5) {
        const huella = Mundo.esquinas(b), estilo = estiloEdificio(M, b);
        const p = patron(b.clase === 'nave' || b.clase === 'techo' ? 'zinc' : estilo.plano ? 'concreto' : 'teja');
        if (p) {
          g.save(); g.globalAlpha = .72; g.fillStyle = p; this._poly(g, [huella]); g.restore();
        }
        Rudeza.techo(g, b, huella, estilo);
      }
    }
    if (!sinTechos) for (const b of SI.E) if (dentroL(b.caja)) { g.fillStyle = b.techo === 'cupula' ? '#56665f' : b.clase === 'iglesia' ? '#b5542f' : '#bdbcb6'; this._poly(g, b.R); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .4; this._poly(g, b.R, true); }
    if (real && res >= .9) Rudeza.textura(g, x0, y0, L);   // grano y manchas sobre todo
    else if (mapa && res >= .5) Estilo.trama(g, x0, y0, L, res);   // semitono, tramado de manga, rayado o papel
    g.restore();
    return cv;
  }
  _poly(g, R, borde) { g.beginPath(); for (const P of R) { g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); g.closePath(); } if (borde) g.stroke(); else g.fill('evenodd'); }
  _viasEn(x0, y0, x1, y1) { const { G, C } = this.mundo._rejillaVias(), V = this.mundo.vias(), set = new Set(); for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const a = G.get(gx * 65536 + gy); if (a) for (let q = 0; q < a.length; q += 2) set.add(a[q]); } return [...set].map(i => V[i]).sort((a, b) => b.k - a.k); }
  arbol(g, x, y, r, s) { const cols = ['#3f8a3f', '#4a9444', '#357a38', '#5a9e48', '#468f40']; const c = cols[(s * 5) | 0]; g.fillStyle = 'rgba(10,20,10,.25)'; g.beginPath(); g.arc(x + r * .35, y + r * .4, r, 0, TAU); g.fill(); g.fillStyle = tono(c, -.18); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x - r * .15, y - r * .15, r * .78, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.arc(x - r * .35, y - r * .35, r * .35, 0, TAU); g.fill(); }
  techo(g, b, M, mapa, tw, ES) {
    const P = Mundo.esquinas(b), st = estiloEdificio(M, b);
    g.fillStyle = mapa ? Estilo.col(st.techo) : st.techo; g.beginPath(); g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); g.closePath(); g.fill();
    if (tw) { g.strokeStyle = ES.tintaColor; g.lineWidth = tw; } else { g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = .35; } g.stroke();
    if (!st.plano && !b.P) { g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .3; g.beginPath(); const L = b.hw > b.hd, ax = L ? b.ux : -b.uy, ay = L ? b.uy : b.ux, m = (L ? b.hw : b.hd) - Math.min(b.hw, b.hd) * .6; g.moveTo(b.x - ax * m, b.y - ay * m); g.lineTo(b.x + ax * m, b.y + ay * m); g.stroke(); }
    if (st.tanque) { g.fillStyle = '#1d1f24'; g.beginPath(); g.arc(b.x + b.ux * b.hw * .4, b.y + b.uy * b.hw * .4, .75, 0, TAU); g.fill(); }
  }
}
/* ---------- pinceles de vehículos y gente vistos desde arriba (metros, centrados, mirando a +x) ---------- */
const Pincel = {
  vehiculoArriba(g, tipo, color, largo, ancho, frena, noche) {
    const L = largo, W = ancho; g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-L / 2 + .25, -W / 2 + .3, L, W);
    if (tipo === 'moto' || tipo === 'bici') { g.fillStyle = '#1d1f24'; g.fillRect(-L / 2, -.12, L, .24); g.fillStyle = color; g.fillRect(-L * .2, -W / 2, L * .45, W); g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(-L * .05, 0, .28, 0, TAU); g.fill(); return; }
    g.fillStyle = color; g.beginPath(); g.roundRect ? g.roundRect(-L / 2, -W / 2, L, W, Math.min(.5, W * .25)) : g.rect(-L / 2, -W / 2, L, W); g.fill();
    g.fillStyle = 'rgba(30,45,65,.85)'; g.fillRect(L * .1, -W / 2 + .2, L * .16, W - .4); if (L > 6) for (let x = -L / 2 + 1; x < L * .05; x += 1.6) g.fillRect(x, -W / 2 + .12, 1, .3), g.fillRect(x, W / 2 - .42, 1, .3); else g.fillRect(-L * .32, -W / 2 + .25, L * .12, W - .5);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-L * .1, -W / 2 + .2, L * .18, W - .4);
    if (frena) { g.fillStyle = '#ff3b30'; g.fillRect(-L / 2 - .05, -W / 2 + .1, .2, .35); g.fillRect(-L / 2 - .05, W / 2 - .45, .2, .35); }
    if (noche) { g.fillStyle = 'rgba(255,240,180,.25)'; g.beginPath(); g.moveTo(L / 2, -W / 2); g.lineTo(L / 2 + 9, -W * 1.4); g.lineTo(L / 2 + 9, W * 1.4); g.lineTo(L / 2, W / 2); g.fill(); }
  },
  /* tren articulado que sigue la curva del riel: coches de `coche` m a lo largo del trazo */
  trenArriba(g, T, s, dir, n, coche, color, aPx) {
    for (let i = 0; i < n; i++) { const sc = s - dir * (i + .5) * coche, a = T.at(sc - dir * coche * .45), b = T.at(sc + dir * coche * .45), [ax, ay] = aPx(a.x, a.y), [bx, by] = aPx(b.x, b.y), L = Math.hypot(bx - ax, by - ay); if (L < .5) continue; g.save(); g.translate((ax + bx) / 2, (ay + by) / 2); g.rotate(Math.atan2(by - ay, bx - ax)); const w = Math.max(2, L * .14); g.fillStyle = '#e6e9ee'; g.fillRect(-L / 2 + .5, -w / 2, L - 1, w); g.fillStyle = color; g.fillRect(-L / 2 + .5, -w / 2, L - 1, w * .22); g.fillRect(-L / 2 + .5, w / 2 - w * .22, L - 1, w * .22); g.fillStyle = 'rgba(30,45,65,.6)'; g.fillRect(-L / 2 + 2, -w * .12, L - 4, w * .24); g.restore(); }
  }
};
Object.assign(MC, { Losas, Pincel, lienzo, estiloEdificio, PAL_SUELO, PAL_VIA, Rudeza });
