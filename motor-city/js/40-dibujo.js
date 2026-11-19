/* =====================================================================
   DIBUJO 2D COMPARTIDO · paleta del motor, losas del suelo en caché y pinceles de edificios y vehículos
   Las LOSAS (160 × 160 m) son el corazón del «mismo mapa en todas las vistas»: se pintan una vez
   (suelo suave por casillas con sombreado del relieve, calles y ciclorrutas en vectores con su ancho real,
   agua, canchas, piscinas, árboles por zona y techos de las huellas reales) y las usan la vista cenital,
   el pixel, la 3D oblicua, la maqueta 2:1 y el piso de la vista 3D en WebGL.
   Cada juego puede cambiar la paleta (MC.arte.registrar(juego, { suelo: {...}, via: {...} })).
   ===================================================================== */
const PAL_SUELO = ['#78ad55', '#3f7a3c', '#cdbfa5', '#bdb3a2', '#5d636e', '#565c68', '#c9c4b8', '#4caf63', '#4f9fd0', '#5f9fb8', '#d8cfbd', '#6b7180', '#e7e2d6', '#b9b4a8', '#4d525c', '#a9a395', '#b8a98e', '#e6d7a8', '#f2f5f9', '#8d8a86'];
const PAL_VIA = { anden: '#d4cfc3', asfalto: '#4a4f59', avenida: '#444955', autopista: '#3c414b', linea: '#f4f1e6', amarilla: '#f2c400', ciclo: '#3fae5a', cicloBorde: '#e8f5d0', peatonal: '#e3dccb', escalas: '#b8a98e', sendero: '#c9b78f' };
MC.arte.pieles.motor.suelo = PAL_SUELO; MC.arte.pieles.motor.via = PAL_VIA;
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
/* ---------- losas del suelo ---------- */
class Losas {
  constructor(mundo, op = {}) { this.mundo = mundo; this.L = op.lado || 160; this.cache = new Map(); this.max = op.max || 140; this.version = 0; this.pend = []; }
  limpiar() { this.cache.clear(); this.version++; }
  /* borra las losas de una caja (cuando la ciudad crece o cambia) */
  invalidar(x0, y0, x1, y1) { const L = this.L; for (const k of [...this.cache.keys()]) { const [gx, gy] = k.split(',').map(Number); if ((gx + 1) * L >= x0 && gx * L <= x1 && (gy + 1) * L >= y0 && gy * L <= y1) this.cache.delete(k); } this.version++; }
  /* la losa (gx, gy) a res px por metro; se pinta si no está (o se pone en cola si `diferir`) */
  losa(gx, gy, res, diferir, sinTechos) {
    const k = gx + ',' + gy + ',' + res + ',' + (sinTechos ? 1 : 0) + ',' + MC.arte.activa; let c = this.cache.get(k);
    if (c) { this.cache.delete(k); this.cache.set(k, c); return c; }
    if (diferir) { if (!this.pend.includes(k)) this.pend.push(k); return null; }
    c = this.pintar(gx, gy, res, sinTechos); this.cache.set(k, c); while (this.cache.size > this.max) this.cache.delete(this.cache.keys().next().value); return c;
  }
  /* pinta las losas pendientes con un presupuesto de milisegundos */
  trabajar(ms = 6) { const t0 = MC.ahora(); while (this.pend.length && MC.ahora() - t0 < ms) { const k = this.pend.shift(), [gx, gy, res, st] = k.split(',').map(Number); if (!this.cache.has(k)) this.cache.set(k, this.pintar(gx, gy, res, !!st)); } }
  pintar(gx, gy, res, sinTechos) {
    const M = this.mundo, L = this.L, T = M.tile, n = Math.round(L / T), px = Math.max(8, Math.round(L * res)), cv = lienzo(px, px); if (!cv) return null;
    const g = cv.getContext('2d'), x0 = gx * L, y0 = gy * L, S = MC.arte.dato('suelo', PAL_SUELO), V = Object.assign({}, PAL_VIA, MC.arte.dato('via', {}));
    /* 1. suelo suave: una casilla = un píxel, con sombreado del relieve y la zona; se agranda con suavizado */
    const m = n + 2, base = lienzo(m, m), bg = base.getContext('2d'), img = bg.createImageData(m, m), D = img.data;
    const luzX = -.55, luzY = -.65;
    for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) {
      const wx = x0 + (i - .5) * T, wy = y0 + (j - .5) * T, tt = M.suelo(wx, wy); let col = S[tt] || '#888';
      if (tt === TT.BRICK || tt === TT.BLDG) col = M.estilo(wx, wy).suelo || col;
      const c = hex3(col), dzx = (M.cota(wx + T, wy) - M.cota(wx - T, wy)) / (2 * T), dzy = (M.cota(wx, wy + T) - M.cota(wx, wy - T)) / (2 * T), sh = clamp(1 + (dzx * luzX + dzy * luzY) * 1.6, .62, 1.3), rn = .96 + h2(Math.floor(wx / T), Math.floor(wy / T), 3) * .08;
      const o = (j * m + i) * 4; D[o] = clamp(c[0] * sh * rn * 255, 0, 255); D[o + 1] = clamp(c[1] * sh * rn * 255, 0, 255); D[o + 2] = clamp(c[2] * sh * rn * 255, 0, 255); D[o + 3] = 255;
    }
    /* la casilla de borde de cada lado es de la losa vecina: así el suavizado no deja costuras entre losas */
    bg.putImageData(img, 0, 0); g.imageSmoothingEnabled = true; const e = px / n; g.drawImage(base, 0, 0, m, m, -e, -e, px + 2 * e, px + 2 * e);
    g.save(); g.scale(res, res); g.translate(-x0, -y0);
    const lejos = res < .3;   // losas de lejos: sin árboles, sin techos y solo las vías grandes
    /* 2. sitios: canchas, piscinas, plazas y prados de los campus */
    const SI = M.sitios(), dentroL = b => b[2] >= x0 && b[0] <= x0 + L && b[3] >= y0 && b[1] <= y0 + L;
    for (const z of SI.Z) if (dentroL(z.caja)) { g.fillStyle = '#d9d1bd'; this._poly(g, z.R); }
    if (!lejos) for (const c of SI.C) { if (c.x < x0 - 80 || c.x > x0 + L + 80 || c.y < y0 - 80 || c.y > y0 + L + 80) continue; g.save(); g.translate(c.x, c.y); g.rotate(c.ang); const w = c.largo, h = c.ancho; g.fillStyle = c.tipo === 1 ? '#c8643c' : c.tipo === 2 ? '#3c8fc0' : '#4f9a3a'; g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = .35; g.strokeRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2); g.beginPath(); g.moveTo(0, -h / 2 + 1); g.lineTo(0, h / 2 - 1); g.stroke(); g.restore(); }
    for (const p of SI.P) if (dentroL(p.caja)) { g.fillStyle = '#4fb3e3'; this._poly(g, p.R); g.strokeStyle = '#e8f4fa'; g.lineWidth = .6; this._poly(g, p.R, true); }
    /* 3. vías en vectores, del fondo al frente: andén, calzada, rayas; ciclorrutas encima */
    const vias = this._viasEn(x0 - 30, y0 - 30, x0 + L + 30, y0 + L + 30).filter(v => !lejos || v.k <= 3 || v.k === VIA.CICLO), lin = (p, w, col, dash) => { g.strokeStyle = col; g.lineWidth = w; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); if (dash) g.setLineDash([]); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    const carros = vias.filter(v => v.k <= 4), resto = vias.filter(v => v.k > 4);
    for (const v of carros) lin(v.p, v.ancho + 3.2, V.anden);
    for (const v of resto) if (v.k !== VIA.CICLO) lin(v.p, v.ancho + (v.k === VIA.ESCALAS ? .6 : 1), v.k === VIA.ESCALAS ? V.escalas : v.k === VIA.SENDERO ? V.sendero : V.peatonal);
    for (const v of carros) lin(v.p, v.ancho, v.k === VIA.AUTOPISTA ? V.autopista : v.k === VIA.AVENIDA ? V.avenida : V.asfalto);
    for (const v of carros) if (v.ancho >= 8 && res >= .6) { if (v.k === VIA.AVENIDA || v.k === VIA.AUTOPISTA) lin(v.p, .35, V.amarilla); else lin(v.p, .25, V.linea, [3, 4]); }
    for (const v of resto) if (v.k === VIA.ESCALAS && res >= .8) lin(v.p, v.ancho * .7, 'rgba(90,70,50,.35)', [.35, .45]);
    for (const v of resto) if (v.k === VIA.CICLO) { lin(v.p, v.ancho + .7, V.cicloBorde); lin(v.p, v.ancho, V.ciclo); if (res >= .8) lin(v.p, .18, 'rgba(255,255,255,.85)', [1.5, 1.5]); }
    /* 4. árboles por zona (en pasto y a lo largo de las avenidas) */
    const cel = 7;
    if (!lejos) for (let y = Math.floor(y0 / cel) * cel; y < y0 + L; y += cel) for (let x = Math.floor(x0 / cel) * cel; x < x0 + L; x += cel) {
      const hv = h2(x, y, 41), tt = M.suelo(x, y); if (tt !== TT.GRASS && tt !== TT.MOUNT && tt !== TT.PLAZA) continue; const Z = M.estilo(x, y), dens = tt === TT.MOUNT ? .55 : tt === TT.PLAZA ? .18 : (Z.arboles || .4) * .55; if (hv > dens) continue;
      const tx = x + h2(x, y, 42) * cel, ty = y + h2(x, y, 43) * cel, r = 2.2 + h2(x, y, 44) * 2.6; this.arbol(g, tx, ty, r, h2(x, y, 45));
    }
    /* 5. techos de las huellas reales (sombra suave al sureste) y tanques en las laderas */
    const E = lejos ? [] : M.edificiosEn(x0, y0, x0 + L, y0 + L).sort((a, b) => a.h - b.h);
    for (const b of E) { const P = Mundo.esquinas(b), sh = Math.min(1.4, .3 + b.h * .04); g.fillStyle = 'rgba(20,24,40,.2)';   /* solo oclusión de contacto: la sombra del sol la pone MC.Sombras según la hora */ g.beginPath(); g.moveTo(P[0] + sh, P[1] + sh); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i] + sh, P[i + 1] + sh); g.closePath(); g.fill(); }
    if (!sinTechos) for (const b of E) this.techo(g, b, M);
    if (!sinTechos) for (const b of SI.E) if (dentroL(b.caja)) { g.fillStyle = b.techo === 'cupula' ? '#56665f' : b.clase === 'iglesia' ? '#b5542f' : '#bdbcb6'; this._poly(g, b.R); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .4; this._poly(g, b.R, true); }
    g.restore();
    return cv;
  }
  _poly(g, R, borde) { g.beginPath(); for (const P of R) { g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); g.closePath(); } if (borde) g.stroke(); else g.fill('evenodd'); }
  _viasEn(x0, y0, x1, y1) { const { G, C } = this.mundo._rejillaVias(), V = this.mundo.vias(), set = new Set(); for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const a = G.get(gx * 65536 + gy); if (a) for (let q = 0; q < a.length; q += 2) set.add(a[q]); } return [...set].map(i => V[i]).sort((a, b) => b.k - a.k); }
  arbol(g, x, y, r, s) { const cols = ['#3f8a3f', '#4a9444', '#357a38', '#5a9e48', '#468f40']; const c = cols[(s * 5) | 0]; g.fillStyle = 'rgba(10,20,10,.25)'; g.beginPath(); g.arc(x + r * .35, y + r * .4, r, 0, TAU); g.fill(); g.fillStyle = tono(c, -.18); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x - r * .15, y - r * .15, r * .78, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.arc(x - r * .35, y - r * .35, r * .35, 0, TAU); g.fill(); }
  techo(g, b, M) {
    const P = Mundo.esquinas(b), st = estiloEdificio(M, b);
    g.fillStyle = st.techo; g.beginPath(); g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = .35; g.stroke();
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
Object.assign(MC, { Losas, Pincel, lienzo, estiloEdificio, PAL_SUELO, PAL_VIA });
