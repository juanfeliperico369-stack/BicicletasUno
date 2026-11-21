/* =====================================================================
   MOTORES CLÁSICOS (4.1) · lo que hicieron motores viejos, livianos y potentes, rehecho desde cero para Motor City
   Pedido del autor: investigar motores ya descontinuados que hoy son livianos pero que en su época hicieron «locuras»,
   ver cómo los usaron los mejores juegos y traer sus partes al motor. Investigación y fuentes: docs/INVESTIGACION-MOTORES-CLASICOS.md
   SALA LIMPIA: no se copió ni una línea de su código (Doom y Quake son GPL; Build y Wolfenstein tienen licencias propias;
   RenderWare/GTA III es privado y sus fuentes filtradas o «reversadas» NO se usan). Solo las ideas publicadas por sus autores,
   libros y artículos, escritas otra vez para Canvas 2D y el mundo MC4.
   - MC.DDA         · Wolfenstein 3D (id, 1992): recorrido exacto de las casillas que cruza un rayo (línea de visión).
   - MC.Semilla     · Elite (Braben y Bell, 1984): un mundo entero desde tres números de 16 bits que se «tuercen»
                      (nombres de veredas y pueblos de carretera, siempre los mismos, sin guardar nada).
   - MC.Sigilo      · Thief (Looking Glass, 1998): la «gema» de luz (sol, sombra de los edificios, postes, faros) y el
                      sonido que viaja por caminos y dobla las esquinas (no atraviesa muros como una burbuja).
   - MC.Arcade      · Pole Position (1982), OutRun (1986), Lotus, Chase H.Q.: la carretera pseudo-3D por segmentos,
                      con curvas, lomas, franjas, letreros y carros; aquí sobre la vía real del mundo (vista «arcade»).
   - MC.VoxelSpace  · Comanche (NovaLogic, 1992): terreno por columnas con un búfer de alturas (y-buffer), de adelante
                      hacia atrás, con pasos más largos a lo lejos y la luz ya pintada en el mapa de color (vista «vuelo»).
   ===================================================================== */

/* ---------- Wolfenstein 3D · DDA: las casillas que cruza el segmento, en orden y sin saltarse ninguna ---------- */
const DDA = {
  /* fn(tx, ty, t) con t = fracción del segmento al entrar a la casilla; si fn devuelve true, se detiene y la devuelve */
  recorrer(x0, y0, x1, y1, T, fn) {
    let tx = Math.floor(x0 / T), ty = Math.floor(y0 / T); const ex = Math.floor(x1 / T), ey = Math.floor(y1 / T), dx = x1 - x0, dy = y1 - y0;
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, adx = Math.abs(dx), ady = Math.abs(dy);
    const pdx = adx ? T / adx : Infinity, pdy = ady ? T / ady : Infinity;
    let mx = adx ? (sx > 0 ? (tx + 1) * T - x0 : x0 - tx * T) / adx : Infinity, my = ady ? (sy > 0 ? (ty + 1) * T - y0 : y0 - ty * T) / ady : Infinity, t = 0;
    for (let n = Math.abs(ex - tx) + Math.abs(ey - ty) + 1; n > 0; n--) {
      if (fn(tx, ty, t)) return { tx, ty, t };
      if (mx < my) { t = mx; mx += pdx; tx += sx; } else { t = my; my += pdy; ty += sy; }
    }
    return null;
  },
  /* ¿hay suelo sólido (edificio, montaña, roca) entre dos puntos? exacto por casillas del mundo */
  bloqueado(M, x0, y0, x1, y1) { return !!DDA.recorrer(x0, y0, x1, y1, M.tile, (tx, ty) => TT_SOLIDO[M.sueloCasilla(tx, ty)] === 1); }
};

/* ---------- Elite · tres semillas de 16 bits que se tuercen (como una sucesión de Tribonacci) ---------- */
const SILABAS_SEMILLA = ['la', 'ma', 'ri', 'to', 'sa', 've', 'ca', 'ra', 'do', 'ne', 'gu', 'ta', 'pe', 'ño', 'li', 'mo', 'bo', 'ce', 'ji', 'ru', 'ga', 'na', 'co', 'vi', 'fu', 'te', 'que', 'lo', 'pa', 're', 'ña', 'zo'];
const ANTES_SEMILLA = ['', '', '', 'San ', 'Santa ', 'La ', 'El ', 'Alto de ', 'Vereda ', 'Puerto '];
class Semilla {
  constructor(a = 0x1d2b, b = 0x0a61, c = 0x7c35) { this.a = a & 0xffff; this.b = b & 0xffff; this.c = c & 0xffff; }
  static desde(texto) { let h = 2166136261; for (const ch of String(texto)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return new Semilla(h & 0xffff, (h >>> 16) & 0xffff, (h * 7 + 12345) & 0xffff); }
  copia() { return new Semilla(this.a, this.b, this.c); }
  /* la «torsión»: c ← a + b + c (en 16 bits) y se corren; cuatro torsiones = el siguiente lugar */
  torcer() { const s = (this.a + this.b + this.c) & 0xffff; this.a = this.b; this.b = this.c; this.c = s; return this; }
  siguiente() { for (let k = 0; k < 4; k++) this.torcer(); return this; }
  /* un nombre corto con sílabas del español, siempre el mismo para la misma semilla */
  nombre() {
    const s = this.copia(), n = 2 + ((s.a >> 3) & 1) + ((s.b >> 9) & 1); let t = '';
    for (let k = 0; k < n; k++) { t += SILABAS_SEMILLA[(s.c >> 8) & 31]; s.torcer(); }
    const pre = ANTES_SEMILLA[(this.b >> 4) % ANTES_SEMILLA.length]; t = t[0].toUpperCase() + t.slice(1);
    if (pre === 'Santa ' && !/a$/.test(t)) return 'San ' + t;
    return pre + t;
  }
  /* un número de 0 a 1 (para tamaño, riqueza, peligro…) */
  valor() { return ((this.a ^ (this.c << 3)) & 0xffff) / 65536; }
  /* «galaxia»: n lugares desde una sola semilla (Elite: 8 galaxias × 256 sistemas en 6 bytes) */
  lugares(n) { const s = this.copia(), L = []; for (let i = 0; i < n; i++) { L.push({ i, nombre: s.nombre(), valor: s.valor() }); s.siguiente(); } return L; }
}

/* ---------- Thief · la gema de luz y el sonido que se propaga por caminos ---------- */
const Sigilo = {
  /* luz en un punto, de 0 (negro) a 1 (pleno sol): cielo a esa hora, sombra de los edificios hacia el sol, postes de noche y fuentes */
  luz(M, x, y, op = {}) {
    let dia = .8, noche = 0, sol = null, nub = op.clima ? op.clima.nubes || 0 : 0;
    if (op.reloj && typeof Cielo !== 'undefined') { const c = Cielo.en(op.reloj.fecha, op.reloj.hora, op.clima); dia = c.dia; noche = c.noche; sol = c.sol; }
    let L = .06 + .3 * dia;
    if (sol && sol.alt > .04 && dia > .05) {
      let sombra = false; const ta = Math.tan(sol.alt), ux = sol.x, uy = sol.y, l = Math.hypot(ux, uy) || 1;
      for (let d = 2; d <= 70 && !sombra; d += 3) { const e = M.edificioEn(x + ux / l * d, y + uy / l * d, 0); if (e && (e.h || 6) > d * ta) sombra = true; }
      L += (sombra ? .12 : .6) * dia * (1 - nub * .45);
    }
    if (noche > .05 && typeof Mobiliario !== 'undefined') { let p = 0; for (const q of Mobiliario.en(M, x - 16, y - 16, x + 16, y + 16, 60)) if (q.t === 'poste') { const d = Math.hypot(q.x - x, q.y - y); p += Math.max(0, 1 - d / 14) ** 2; } L += Math.min(.55, p * .5) * noche; }
    for (const f of op.fuentes || []) { const d = Math.hypot(f.x - x, f.y - y), r = f.r || 10; if (d < r) L += (f.k ?? .6) * (1 - d / r) ** 2; }
    return clamp(L, 0, 1);
  },
  /* la gema: qué tan visible estás (luz, si te mueves rápido y si vas agachada) */
  gema(luz, op = {}) { const v = Math.abs(op.vel || 0); return clamp(luz * (op.agachado ? .62 : 1) * (1 + (v > 3.2 ? .3 : v > 1.5 ? .12 : 0)), 0, 1); },
  /* distancia a la que te ve un guardia: en lo oscuro solo de cerca (en Thief, a un tercio) y alerta ve mejor */
  alcance(base, vis, alerta = false) { const a = base * (.3 + .7 * clamp(vis, 0, 1)); return alerta ? Math.max(a, base * .75) : a; },
  /* el sonido viaja por caminos libres (Dijkstra en una rejilla de `celda` m): rodea los edificios y entra por los callejones;
     a través de un muro llega muy apagado. Devuelve { oye(x, y) → 0..1 } */
  ruido(M, x, y, fuerza, op = {}) {
    const c = op.celda || 4, R = Math.max(1, Math.ceil(fuerza / c)), N = 2 * R + 1, x0 = x - R * c, y0 = y - R * c, d = new Float32Array(N * N).fill(Infinity), muro = new Uint8Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const wx = x0 + (i + .5) * c, wy = y0 + (j + .5) * c; muro[j * N + i] = (M.edificioEn(wx, wy, -.5) || TT_SOLIDO[M.suelo(wx, wy)] === 1) ? 1 : 0; }
    const H = [], push = (k, v) => { H.push([v, k]); let i = H.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (H[p][0] <= H[i][0]) break; [H[p], H[i]] = [H[i], H[p]]; i = p; } }, pop = () => { const r = H[0], u = H.pop(); if (H.length) { H[0] = u; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < H.length && H[a][0] < H[m][0]) m = a; if (b < H.length && H[b][0] < H[m][0]) m = b; if (m === i) break; [H[m], H[i]] = [H[i], H[m]]; i = m; } } return r; };
    const k0 = R * N + R; d[k0] = 0; muro[k0] = 0; push(k0, 0);
    while (H.length) { const [v, k] = pop(); if (v > d[k] || v > fuerza) continue; const i = k % N, j = (k / N) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue; const kk = jj * N + ii; if (muro[kk]) continue; if (di && dj && (muro[j * N + ii] || muro[jj * N + i])) continue; const nv = v + (di && dj ? 1.414 : 1) * c; if (nv < d[kk]) { d[kk] = nv; push(kk, nv); } } }
    return { x, y, fuerza, celda: c, d, N,
      camino(px, py) { const i = Math.floor((px - x0) / c), j = Math.floor((py - y0) / c); return i < 0 || j < 0 || i >= N || j >= N ? Infinity : d[j * N + i]; },
      oye(px, py) { const p = this.camino(px, py), recto = Math.hypot(px - x, py - y); return Math.max(isFinite(p) ? clamp(1 - p / fuerza, 0, 1) : 0, clamp(1 - recto / fuerza, 0, 1) * .22); } };
  }
};

/* ---------- utilidades de color para las vistas retro ---------- */
const rgbHex = c => { const v = hex3(c); return [v[0] * 255, v[1] * 255, v[2] * 255]; };
const rgbCss = (v, k = 1) => 'rgb(' + Math.round(clamp(v[0] * k, 0, 255)) + ',' + Math.round(clamp(v[1] * k, 0, 255)) + ',' + Math.round(clamp(v[2] * k, 0, 255)) + ')';
const rgbMez = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cieloRetro = E => { if (E.reloj && typeof Cielo !== 'undefined') { const c = Cielo.en(E.reloj.fecha, E.reloj.hora, E.clima); return { top: c.top.map(x => x * 255), hor: c.hor.map(x => x * 255), bruma: c.bruma.map(x => x * 255), noche: c.noche, sol: c.sol }; } return { top: [70, 140, 235], hor: [175, 210, 245], bruma: [200, 214, 230], noche: 0, sol: null }; };
const cuerpoRetro = E => (E.jugador && E.jugador.cuerpo) || { x: E.camara ? E.camara.x : 0, y: E.camara ? E.camara.y : 0, a: E.camara ? E.camara.yaw || 0 : 0, v: 0, veh: { clase: 'auto' } };
/* un carro visto de atrás (como el de OutRun): carrocería, vidrio, stops y llantas; giro = -1..1 para inclinarlo */
function carroAtras(g, x, y, w, color, op = {}) {
  const h = w * .52, k = op.giro || 0, fr = op.freno; g.save(); g.translate(x, y); g.transform(1, 0, -k * .18, 1, 0, 0);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w * .55, -h * .08, w * 1.1, h * .16);
  g.fillStyle = '#16181c'; g.fillRect(-w * .5, -h * .32, w * .2, h * .32); g.fillRect(w * .3, -h * .32, w * .2, h * .32);
  g.fillStyle = color; g.fillRect(-w * .48, -h * .78, w * .96, h * .5); g.fillRect(-w * .36, -h, w * .72, h * .26);
  g.fillStyle = 'rgba(30,40,55,.9)'; g.fillRect(-w * .3, -h * .95, w * .6, h * .18);
  g.fillStyle = fr ? '#ff3b30' : '#b3201b'; g.fillRect(-w * .44, -h * .62, w * .16, h * .1); g.fillRect(w * .28, -h * .62, w * .16, h * .1);
  if (fr) { g.fillStyle = 'rgba(255,60,40,.35)'; g.fillRect(-w * .5, -h * .7, w * .26, h * .26); g.fillRect(w * .24, -h * .7, w * .26, h * .26); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-w * .48, -h * .78, w * .96, h * .05);
  if (op.sirena) { const on = (op.t * 6 | 0) % 2; g.fillStyle = on ? '#2f6bff' : '#ff2e2e'; g.fillRect(-w * .24, -h * 1.08, w * .2, h * .1); g.fillStyle = on ? '#ff2e2e' : '#2f6bff'; g.fillRect(w * .04, -h * 1.08, w * .2, h * .1); }
  g.restore();
}

/* ---------- OutRun / Pole Position · la carretera pseudo-3D por segmentos, sobre la vía real ---------- */
const TRAF_COLOR = ['#c62828', '#f5f5f5', '#1e88e5', '#fdd835', '#2e7d32', '#424242', '#8e24aa', '#ef6c00'];
class Arcade {
  constructor(M) { this.M = M; this.h = null; this.paso = 6; this.n = 200; this._q = null; this.sem = Semilla.desde(M.meta && M.meta.nombre || 'mundo'); }
  /* el camino de adelante: puntos {x, y, z, w} cada `paso` m (la autopista del tramo, la calle o el rumbo) */
  camino(x, y, a) {
    const M = this.M, P = [], paso = this.paso, n = this.n, z = (px, py) => M.cota(px, py);
    if (M.carretera && M.carretera.centro) { const dir = Math.sin(a) >= 0 ? 1 : -1, y0 = (dir > 0 ? Math.floor(y / paso) : Math.ceil(y / paso)) * paso - dir * 3 * paso; for (let i = 0; i < n; i++) { const yy = y0 + dir * i * paso; if (yy < 2 || yy > M.alto - 2) break; const xx = M.carretera.centro(yy); P.push({ x: xx, y: yy, z: z(xx, yy), w: 15, u: Math.round(yy / paso) }); } if (P.length > 8) return P; }
    let q = M.viaCercana(x, y, 50, v => v.k !== VIA.SENDERO && v.k !== VIA.ESCALAS);
    let cx = x, cy = y, h = a, resto = 0, u = 0, w = q ? Math.max(6, q.via.ancho || 8) : 8; const ax0 = q ? q.ang + (Math.cos(q.ang - a) >= 0 ? 0 : Math.PI) : a; P.push({ x: x - Math.cos(ax0) * 14, y: y - Math.sin(ax0) * 14, z: z(x - Math.cos(ax0) * 14, y - Math.sin(ax0) * 14), w, u: -3 }, { x, y, z: z(x, y), w, u: 0 });
    const empujar = (tx, ty) => { let dx = tx - cx, dy = ty - cy, L = Math.hypot(dx, dy); if (L < 1e-3) return; h = Math.atan2(dy, dx); while (resto + L >= paso && P.length < n) { const f = (paso - resto) / L; cx += dx * f; cy += dy * f; P.push({ x: cx, y: cy, z: z(cx, cy), w, u: ++u }); dx = tx - cx; dy = ty - cy; L = Math.hypot(dx, dy); resto = 0; } resto += L; cx = tx; cy = ty; };
    const vistas = new Set(); let guarda = 0;
    while (q && P.length < n && guarda++ < 60) {
      const v = q.via, V = v.p, nv = V.length / 2, dir = Math.cos(q.ang - h) >= 0 ? 1 : -1; vistas.add(v.i); w = Math.max(6, v.ancho || 8);
      if (guarda === 1) { /* las franjas quedan fijas al mundo: el primer punto cae en un múltiplo de `paso` a lo largo de la calle */ let s0 = 0; for (let k = 0; k < q.j; k++) s0 += Math.hypot(V[2 * k + 2] - V[2 * k], V[2 * k + 3] - V[2 * k + 1]); s0 += Math.hypot(q.x - V[2 * q.j], q.y - V[2 * q.j + 1]); const m = ((s0 % paso) + paso) % paso; resto = dir > 0 ? m : paso - m; u = dir > 0 ? Math.floor(s0 / paso) : -Math.ceil(s0 / paso); resto = Math.min(resto + Math.hypot(q.x - x, q.y - y) * 0, paso - 1e-3); cx = q.x; cy = q.y; }
      empujar(q.x, q.y);
      for (let k = dir > 0 ? q.j + 1 : q.j; k >= 0 && k < nv && P.length < n; k += dir) empujar(V[2 * k], V[2 * k + 1]);
      const ax = cx + Math.cos(h) * 4, ay = cy + Math.sin(h) * 4; q = M.viaCercana(ax, ay, 16, u => !vistas.has(u.i) && u.k !== VIA.SENDERO && u.k !== VIA.ESCALAS);
      if (q && Math.cos(q.ang - h) < 0) q = Object.assign({}, q, { ang: q.ang + Math.PI });
    }
    while (P.length < n) { cx += Math.cos(h) * paso; cy += Math.sin(h) * paso; if (!M.dentro(cx, cy)) break; P.push({ x: cx, y: cy, z: z(cx, cy), w, u: ++u }); }
    return P;
  }
  aPantalla(x, y, z = 0) { const q = this._q; if (!q) return null; const p = q.proy(x, y, z); return p ? [p.X, p.Y] : null; }
  dibujar(g, W, H, E, op = {}) {
    const M = this.M, C = cuerpoRetro(E), t = E.t || 0, cielo = cieloRetro(E), noche = cielo.noche;
    /* rumbo de la cámara: el del camino justo adelante, suavizado (la cámara de OutRun mira por la carretera) */
    const P = this.camino(C.x, C.y, C.a), k2 = Math.min(5, P.length - 1), ha = k2 > 0 ? Math.atan2(P[k2].y - P[0].y, P[k2].x - P[0].x) : C.a;
    if (this.h == null) this.h = ha; let dh = ha - this.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); this.h += dh * clamp((E.dt || 1 / 60) * 4, 0, 1);
    const a = this.h, ca = Math.cos(a), sa = Math.sin(a), atras = 8, cx = C.x - ca * atras, cy = C.y - sa * atras, cz = M.cota(C.x, C.y) + (C.z || 0) + 3.2, hor = H * .5, foc = Math.max(W, H * .62) * .5 / Math.tan(.62), lejos = this.paso * this.n, CERCA = 1.2;
    /* proyección de verdad (los «segmentos proyectados» de la página de Lou): cámara detrás del carro, mirando por la vía */
    const proy = (x, y, z) => { const dx = x - cx, dy = y - cy, f = dx * ca + dy * sa; if (f < CERCA) return null; const l = -dx * sa + dy * ca, s = foc / f; return { X: W / 2 + l * s, Y: hor - (z - cz) * s, s, f }; };
    /* recorte contra el plano cercano: el tramo que pasa por detrás de la cámara se corta en f = CERCA (sin huecos abajo) */
    const fDe = q => (q.x - cx) * ca + (q.y - cy) * sa, recorte = (q, r) => { const fq = fDe(q), fr = fDe(r), t = (CERCA + .01 - fq) / ((fr - fq) || 1e-6); return proy(q.x + (r.x - q.x) * t, q.y + (r.y - q.y) * t, q.z + (r.z - q.z) * t); };
    this._q = { proy, cx, cy };
    /* cielo con degradado y montañas lejanas en paralaje (se corren con el rumbo) */
    const gr = g.createLinearGradient(0, 0, 0, hor); gr.addColorStop(0, rgbCss(cielo.top)); gr.addColorStop(1, rgbCss(cielo.hor)); g.fillStyle = gr; g.fillRect(0, 0, W, hor + 2);
    if (cielo.sol && cielo.sol.alt > -.05) { let ds = Math.atan2(cielo.sol.y, cielo.sol.x) - a; ds = Math.atan2(Math.sin(ds), Math.cos(ds)); if (Math.abs(ds) < 1) { const sx = W / 2 + Math.tan(ds) * foc, sy = hor - Math.tan(cielo.sol.alt) * foc; g.fillStyle = 'rgba(255,236,170,.9)'; g.beginPath(); g.arc(sx, sy, W * .035, 0, TAU); g.fill(); } }
    const capas = [[.55, .2, rgbMez(cielo.hor, [70, 90, 120], .45)], [.9, .12, rgbMez(cielo.hor, [40, 60, 70], .7)]];
    for (const [par, alto, col] of capas) { g.fillStyle = rgbCss(col); g.beginPath(); g.moveTo(0, hor + 1); for (let x = 0; x <= W; x += 6) { const u = x / W * 3 - a * par * 3; const m = Math.sin(u * 2.1) * .5 + Math.sin(u * 5.3 + 1) * .3 + Math.sin(u * 11.7 + 2) * .15; g.lineTo(x, hor - (m * .5 + .55) * alto * H); } g.lineTo(W, hor + 1); g.fill(); }
    /* bioma (en la carretera) para los colores del pasto y lo que hay a los lados */
    const bioma = M.carretera && M.carretera.bioma ? M.carretera.bioma(C.y) : null, BIO = { costa: [[214, 196, 140], [200, 182, 128]], desierto: [[214, 170, 110], [200, 156, 98]], nieve: [[236, 240, 246], [222, 228, 238]], lagos: [[104, 160, 90], [92, 146, 80]] }, ciudad = !M.carretera, pasto = ciudad ? [[178, 172, 160], [168, 162, 150]] : BIO[bioma] || [[96, 150, 70], [84, 136, 62]], berma = ciudad ? [[222, 220, 214], [150, 150, 150]] : [[235, 235, 235], [200, 40, 40]];
    const bruma = cielo.bruma, oscuro = 1 - noche * .62;
    const col = (rgb, f) => rgbCss(rgbMez(rgb, bruma, clamp(f / lejos, 0, 1) ** 1.6 * .9), oscuro);
    /* objetos a los lados y en la vía, con su distancia (para mezclarlos con los segmentos de lejos a cerca) */
    const objs = [], hs = (i, s) => h2(Math.round(P[i].x / 3), Math.round(P[i].y / 3), s);
    for (let i = 2; i < P.length; i++) {
      const p = P[i], q = P[i - 1], nx = -(p.y - q.y) / this.paso, ny = (p.x - q.x) / this.paso;
      if (M.carretera) {
        if (i % 6 === 0) for (const ld of [-1, 1]) objs.push({ k: 'poste', x: p.x + nx * ld * (p.w / 2 + 3), y: p.y + ny * ld * (p.w / 2 + 3), z: p.z });
        for (const ld of [-1, 1]) if (hs(i, ld + 5) < .5) { const off = p.w / 2 + 6 + hs(i, ld + 9) * 26; objs.push({ k: bioma === 'desierto' ? 'cactus' : bioma === 'costa' ? 'palma' : bioma === 'llanura' ? 'arbusto' : 'pino', x: p.x + nx * ld * off, y: p.y + ny * ld * off, z: M.cota(p.x + nx * ld * off, p.y + ny * ld * off), s: hs(i, 3) }); }
        const km = Math.floor(p.y / 1000), km0 = Math.floor(q.y / 1000); if (km !== km0) { const S = this.sem.copia(); for (let r = 0; r < km % 64; r++) S.siguiente(); objs.push({ k: 'letrero', x: p.x + nx * (p.w / 2 + 4), y: p.y + ny * (p.w / 2 + 4), z: p.z, txt: S.nombre(), km }); }
      } else if (i % 4 === 0) for (const ld of [-1, 1]) objs.push({ k: 'poste', x: p.x + nx * ld * (p.w / 2 + 1.5), y: p.y + ny * ld * (p.w / 2 + 1.5), z: p.z });
    }
    /* ciudad: los edificios de verdad, como cajas (Chase H.Q. y Driver los ponían de cartón; aquí son los del mapa) */
    if (!M.carretera && M.edificiosEn) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (let i = 0; i < Math.min(P.length, 80); i++) { x0 = Math.min(x0, P[i].x); y0 = Math.min(y0, P[i].y); x1 = Math.max(x1, P[i].x); y1 = Math.max(y1, P[i].y); }
      const L = M.edificiosEn(x0 - 60, y0 - 60, x1 + 60, y1 + 60).filter(e => { const f = (e.x - cx) * ca + (e.y - cy) * sa; return f > 4 && f < 480; }); L.sort((u, v) => ((u.x - cx) * ca + (u.y - cy) * sa) - ((v.x - cx) * ca + (v.y - cy) * sa)); for (const e of L.slice(0, 160)) objs.push({ k: 'edificio', e, x: e.x, y: e.y, z: M.cota(e.x, e.y) }); }
    for (const v of E.trafico || []) objs.push({ k: 'carro', x: v.x, y: v.y, z: M.cota(v.x, v.y), v });
    for (const o of objs) { const dx = o.x - cx, dy = o.y - cy; o.f = dx * ca + dy * sa; }
    const vis = objs.filter(o => o.f > 1.5 && o.f < lejos).sort((u, v) => v.f - u.f); let io = 0;
    const PP = P.map(p => proy(p.x, p.y, p.z));
    const dibObj = o => this._obj(g, o, proy, col, cielo, t, W, H);
    /* los segmentos de lejos a cerca (pintor): pasto, berma con franjas, asfalto y líneas; los objetos se intercalan por distancia */
    for (let i = P.length - 1; i > 0; i--) {
      let A = PP[i - 1], B = PP[i]; if (!B) continue; if (!A) A = recorte(P[i - 1], P[i]); if (!A) continue; const f = (P[i].x - cx) * ca + (P[i].y - cy) * sa;
      while (io < vis.length && vis[io].f > f) dibObj(vis[io++]);
      const alt = ((Math.floor((P[i].u || 0) / 3) % 2) + 2) % 2, wa = P[i - 1].w / 2, wb = P[i].w / 2;
      const yA = A.Y, yB = B.Y; g.fillStyle = col(pasto[alt], f); g.fillRect(0, Math.min(yA, yB) - 1, W, Math.abs(yA - yB) + 2);
      const trap = (ka, kb, color) => { g.fillStyle = color; g.beginPath(); g.moveTo(A.X - wa * ka * A.s, yA); g.lineTo(A.X + wa * ka * A.s, yA); g.lineTo(B.X + wb * kb * B.s, yB); g.lineTo(B.X - wb * kb * B.s, yB); g.fill(); };
      trap(ciudad ? 1.12 : 1.18, ciudad ? 1.12 : 1.18, col(berma[alt], f));
      trap(1, 1, col(alt ? [92, 96, 104] : [84, 88, 96], f));
      if (alt) { if (M.carretera) { trap(.04, .04, col([245, 245, 235], f)); } else { g.fillStyle = col([240, 200, 40], f); g.fillRect(A.X - Math.max(.6, .12 * A.s), yB, Math.max(1.2, .24 * A.s), Math.max(.5, yA - yB)); } }
    }
    while (io < vis.length) dibObj(vis[io++]);
    /* el carro de uno, de espaldas, abajo en el centro (o la persona a pie) */
    const pc = proy(C.x, C.y, M.cota(C.x, C.y) + (C.z || 0));
    if (pc) { const giro = clamp(Math.sin((C.a - a)) * 2.5, -1, 1); if (C.veh && C.veh.clase === 'pie') { g.fillStyle = '#2b2b33'; g.fillRect(pc.X - .3 * pc.s, pc.Y - 1.7 * pc.s, .6 * pc.s, 1.7 * pc.s); g.fillStyle = '#e0b48c'; g.beginPath(); g.arc(pc.X, pc.Y - 1.85 * pc.s, .2 * pc.s, 0, TAU); g.fill(); } else carroAtras(g, pc.X, pc.Y, 1.9 * pc.s, (C.veh && C.veh.color) || '#a3202a', { giro, freno: C.v > 1 && (C.frenando || C._frenoT > 0), t }); }
    /* de noche: luz de los faros sobre la vía */
    if (noche > .3 && pc) { g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(pc.X, pc.Y - pc.s * 2, 2, pc.X, hor + (pc.Y - hor) * .35, W * .45); gl.addColorStop(0, 'rgba(255,230,170,' + (.22 * noche).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = gl; g.beginPath(); g.moveTo(pc.X - pc.s * .8, pc.Y - pc.s); g.lineTo(W * .1, hor + 4); g.lineTo(W * .9, hor + 4); g.lineTo(pc.X + pc.s * .8, pc.Y - pc.s); g.fill(); g.restore(); }
    if (op.pixel) { const k = op.escala || 3, w = Math.max(80, W / k | 0), h = Math.max(60, H / k | 0); this._px ||= lienzo(w, h); if (this._px.width !== w || this._px.height !== h) { this._px.width = w; this._px.height = h; } const q = this._px.getContext('2d'); q.drawImage(g.canvas, 0, 0, w, h); g.save(); g.imageSmoothingEnabled = false; g.drawImage(this._px, 0, 0, W, H); g.restore(); }
  }
  _obj(g, o, proy, col, cielo, t, W, H) {
    const p = proy(o.x, o.y, o.z); if (!p) return; const s = p.s;
    if (o.k === 'poste') { const h = 8 * s; g.fillStyle = col([70, 70, 74], o.f); g.fillRect(p.X - .12 * s, p.Y - h, Math.max(1, .24 * s), h); if (cielo.noche > .3) { g.fillStyle = 'rgba(255,214,140,.85)'; g.beginPath(); g.arc(p.X, p.Y - h, Math.max(1.2, .35 * s), 0, TAU); g.fill(); } return; }
    if (o.k === 'pino') { const h = (6 + o.s * 6) * s, w = h * .42; g.fillStyle = col([70, 50, 34], o.f); g.fillRect(p.X - w * .06, p.Y - h * .25, w * .12, h * .25); g.fillStyle = col(cielo.noche > .5 ? [24, 50, 34] : [40, 96, 56], o.f); g.beginPath(); g.moveTo(p.X, p.Y - h); g.lineTo(p.X + w / 2, p.Y - h * .2); g.lineTo(p.X - w / 2, p.Y - h * .2); g.fill(); return; }
    if (o.k === 'palma') { const h = (7 + o.s * 4) * s; g.strokeStyle = col([120, 90, 60], o.f); g.lineWidth = Math.max(1, .3 * s); g.beginPath(); g.moveTo(p.X, p.Y); g.quadraticCurveTo(p.X + h * .15, p.Y - h * .5, p.X + h * .05, p.Y - h); g.stroke(); g.strokeStyle = col([50, 130, 60], o.f); g.lineWidth = Math.max(1, .45 * s); for (let k = 0; k < 6; k++) { const an = k / 6 * TAU; g.beginPath(); g.moveTo(p.X + h * .05, p.Y - h); g.quadraticCurveTo(p.X + h * .05 + Math.cos(an) * h * .3, p.Y - h - h * .12, p.X + h * .05 + Math.cos(an) * h * .42, p.Y - h + Math.abs(Math.sin(an)) * h * .2 + h * .1); g.stroke(); } return; }
    if (o.k === 'cactus') { const h = (2.5 + o.s * 3) * s; g.fillStyle = col([60, 120, 70], o.f); g.fillRect(p.X - .25 * s, p.Y - h, .5 * s, h); g.fillRect(p.X - .9 * s, p.Y - h * .7, .4 * s, h * .35); g.fillRect(p.X + .5 * s, p.Y - h * .8, .4 * s, h * .4); return; }
    if (o.k === 'arbusto') { const r = (1 + o.s) * s; g.fillStyle = col([86, 120, 60], o.f); g.beginPath(); g.ellipse(p.X, p.Y - r * .6, r * 1.3, r * .7, 0, 0, TAU); g.fill(); return; }
    if (o.k === 'letrero') { const w = 7 * s, h = 2.4 * s; g.fillStyle = col([60, 60, 60], o.f); g.fillRect(p.X - .1 * s, p.Y - 5 * s, .2 * s, 5 * s); g.fillStyle = '#1f6b3a'; g.fillRect(p.X - w / 2, p.Y - 5 * s - h, w, h); if (h > 9) { g.fillStyle = '#fff'; g.font = '700 ' + Math.round(h * .36) + 'px system-ui'; g.textAlign = 'center'; g.fillText(o.txt, p.X, p.Y - 5 * s - h * .52); g.font = Math.round(h * .3) + 'px system-ui'; g.fillText('km ' + o.km, p.X, p.Y - 5 * s - h * .14); } return; }
    if (o.k === 'carro') { const v = o.v, pol = /patrulla|policia/.test(v.tipo || '') || v.sirena || /patrulla/.test(String(v.id || '')); let hs = 7; for (const ch of String(v.id ?? v.tipo ?? '')) hs = (hs * 31 + ch.charCodeAt(0)) & 1023; carroAtras(g, p.X, p.Y, (v.ancho || 1.85) * s, v.color || (pol ? '#e8e8ee' : TRAF_COLOR[hs % 8]), { sirena: pol, t, freno: v.v < 2 }); return; }
    if (o.k === 'edificio') { this._caja(g, o, proy, col, cielo); }
  }
  /* la caja de un edificio: sus paredes que miran a la cámara y el techo, con su sombreado según el sol */
  _caja(g, o, proy, col, cielo) {
    const e = o.e, Q = Mundo.esquinas(e), n = Q.length / 2, z0 = o.z, z1 = o.z + (e.h || 6), cam = this._q; const pb = [], pt = [];
    for (let k = 0; k < n; k++) { const b = proy(Q[2 * k], Q[2 * k + 1], z0), u = proy(Q[2 * k], Q[2 * k + 1], z1); if (!b || !u) return; pb.push(b); pt.push(u); }
    const base = rgbHex(['#c9a27e', '#b9b2a6', '#d8d0c0', '#a8644a', '#9aa4ae', '#e3d6bd'][(e.s * 6) | 0] || '#c0b8a8'), sol = cielo.sol;
    let gx = 0, gy = 0; for (let k = 0; k < n; k++) { gx += Q[2 * k] / n; gy += Q[2 * k + 1] / n; }
    for (let k = 0; k < n; k++) { const j = (k + 1) % n, ex = Q[2 * j] - Q[2 * k], ey = Q[2 * j + 1] - Q[2 * k + 1], mx = (Q[2 * k] + Q[2 * j]) / 2, my = (Q[2 * k + 1] + Q[2 * j + 1]) / 2; let nx = ey, ny = -ex; if (nx * (mx - gx) + ny * (my - gy) < 0) { nx = -nx; ny = -ny; }
      if (nx * (cam.cx - mx) + ny * (cam.cy - my) <= 0) continue;   /* la pared da la espalda a la cámara */
      const luz = sol && sol.alt > 0 ? clamp(.62 + .38 * (nx * sol.x + ny * sol.y) / (Math.hypot(nx, ny) || 1), .45, 1) : .6;
      g.fillStyle = col(base.map(c => c * luz), o.f); g.beginPath(); g.moveTo(pb[k].X, pb[k].Y); g.lineTo(pb[j].X, pb[j].Y); g.lineTo(pt[j].X, pt[j].Y); g.lineTo(pt[k].X, pt[k].Y); g.fill();
      if (cielo.noche > .4 && e.pis > 1) { g.fillStyle = 'rgba(255,214,130,' + (.5 * cielo.noche).toFixed(2) + ')'; for (let p = 1; p < Math.min(e.pis, 12); p++) { const f = p / e.pis, ax = pb[k].X + (pt[k].X - pb[k].X) * f, ay = pb[k].Y + (pt[k].Y - pb[k].Y) * f, bx = pb[j].X + (pt[j].X - pb[j].X) * f, by = pb[j].Y + (pt[j].Y - pb[j].Y) * f; if (h2(k, p, e.s * 999 | 0) < .45) g.fillRect(Math.min(ax, bx) + Math.abs(bx - ax) * .3, Math.min(ay, by) - 1, Math.max(1, Math.abs(bx - ax) * .3), Math.max(1, Math.abs(pb[k].Y - pt[k].Y) / e.pis * .35)); } }
    }
    g.fillStyle = col(base.map(c => c * .82), o.f); g.beginPath(); g.moveTo(pt[0].X, pt[0].Y); for (let k = 1; k < n; k++) g.lineTo(pt[k].X, pt[k].Y); g.fill();
  }
}

/* ---------- Comanche · Voxel Space: el terreno por columnas, con y-buffer y la luz pintada en el mapa de color ---------- */
class VoxelSpace {
  constructor(M, op = {}) { this.M = M; this.c = op.celda || 4; this.N = op.N || 512; this.alt = null; this.col = null; this.x0 = null; this.y0 = null; this.h = null; this.ms = 0; this._job = null; }
  /* el mapa de alturas y de color de una ventana de N × N celdas alrededor de (x, y): suelo, relieve, agua y edificios.
     Se arma por franjas de filas (_trabajar) para no trabar el juego al moverse: mientras tanto se dibuja con la ventana anterior. */
  _iniciar(x, y) {
    const M = this.M, c = this.c, N = this.N, half = N * c / 2, x0 = Math.round((x - half) / 64) * 64, y0 = Math.round((y - half) / 64) * 64;
    return { x0, y0, j: 0, s: 0, A: new Float32Array(N * N), K: new Uint32Array(N * N), B: new Uint8ClampedArray(N * N * 3), L: M.edificiosEn ? M.edificiosEn(x0, y0, x0 + N * c, y0 + N * c).map(e => { const Q = Mundo.esquinas(e); let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity; for (let k = 0; k < Q.length; k += 2) { bx0 = Math.min(bx0, Q[k]); bx1 = Math.max(bx1, Q[k]); by0 = Math.min(by0, Q[k + 1]); by1 = Math.max(by1, Q[k + 1]); } return { Q, bx0, by0, bx1, by1, z: M.cota(e.x, e.y) + (e.h || 6), t: rgbHex(['#a8644a', '#b5542f', '#8e9095', '#c9b8a0', '#6f7a84', '#d0c6b4'][(e.s * 6) | 0] || '#a0a0a0') }; }) : [], pal: (typeof PAL_SUELO_REAL !== 'undefined' ? PAL_SUELO_REAL : PAL_SUELO).map(rgbHex) };
  }
  /* filas de la ventana nueva: primero suelo y alturas (con los edificios de esa franja), luego la luz «horneada» */
  _trabajar(J, filas) {
    const M = this.M, c = this.c, N = this.N, { x0, y0, A, K, B, pal } = J, sol = [-.55, -.45, .7];
    if (J.j < N) { const j1 = Math.min(N, J.j + filas);
      for (let j = J.j; j < j1; j++) for (let i = 0; i < N; i++) { const wx = x0 + (i + .5) * c, wy = y0 + (j + .5) * c, k = j * N + i, den = M.dentro(wx, wy), p = pal[den ? M.suelo(wx, wy) : TT.MOUNT] || pal[0]; A[k] = den ? M.cota(wx, wy) : M.cota(clamp(wx, 0, M.ancho - 1), clamp(wy, 0, M.alto - 1)); B[3 * k] = p[0]; B[3 * k + 1] = p[1]; B[3 * k + 2] = p[2]; }
      const ya = y0 + J.j * c, yb = y0 + j1 * c;
      for (const e of J.L) { if (e.by1 < ya || e.by0 > yb) continue;
        for (let j = Math.max(J.j, Math.floor((e.by0 - y0) / c)); j <= Math.min(j1 - 1, Math.floor((e.by1 - y0) / c)); j++) for (let i = Math.max(0, Math.floor((e.bx0 - x0) / c)); i <= Math.min(N - 1, Math.floor((e.bx1 - x0) / c)); i++) {
          if (!dentroPol(e.Q, x0 + (i + .5) * c, y0 + (j + .5) * c)) continue; const k = j * N + i; if (e.z > A[k]) A[k] = e.z; B[3 * k] = e.t[0]; B[3 * k + 1] = e.t[1]; B[3 * k + 2] = e.t[2]; } }
      J.j = j1; return false; }
    const s1 = Math.min(N, J.s + filas);
    for (let j = J.s; j < s1; j++) for (let i = 0; i < N; i++) { const k = j * N + i, hx = A[j * N + Math.min(N - 1, i + 1)] - A[j * N + Math.max(0, i - 1)], hy = A[Math.min(N - 1, j + 1) * N + i] - A[Math.max(0, j - 1) * N + i], nx = -hx / (2 * c), ny = -hy / (2 * c), l = Math.sqrt(nx * nx + ny * ny + 1), lz = Math.min(1.15, Math.max(.35, .55 + .6 * (nx * sol[0] + ny * sol[1] + sol[2]) / l));
      K[k] = (255 << 24) | (Math.min(255, B[3 * k + 2] * lz) << 16) | (Math.min(255, B[3 * k + 1] * lz) << 8) | Math.min(255, B[3 * k] * lz); }
    J.s = s1; return J.s >= N;
  }
  _usar(J) { this.x0 = J.x0; this.y0 = J.y0; this.alt = J.A; this.col = J.K; this._job = null; }
  preparar(x, y) { const t0 = MC.ahora(), J = this._iniciar(x, y); while (!this._trabajar(J, 64)); this._usar(J); this.ms = MC.ahora() - t0; return this; }
  aPantalla(x, y, z = 0) { const q = this._q; if (!q) return null; const dx = x - q.cx, dy = y - q.cy, f = dx * q.ca + dy * q.sa; if (f < 1) return null; const l = -dx * q.sa + dy * q.ca; return [(q.w / 2 + l / f * q.foc) * q.kx, ((q.camH - (z || this.M.cota(x, y))) / f * q.esc + q.hor) * q.ky]; }
  dibujar(g, W, H, E) {
    const M = this.M, C = cuerpoRetro(E), N = this.N, c = this.c, cielo = cieloRetro(E), oscuro = 1 - cielo.noche * .6;
    if (this.h == null) this.h = C.a; let dh = C.a - this.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); this.h += dh * clamp((E.dt || 1 / 60) * 2.2, 0, 1);
    const a = this.h, ca = Math.cos(a), sa = Math.sin(a), cx = C.x - ca * 90, cy = C.y - sa * 90;
    if (this.x0 == null) { /* 4.2: la primera ventana también se arma por franjas (antes trababa ~0,3 s): mientras, el cielo y un aviso */
      if (!this._job) this._job = this._iniciar(cx + ca * 300, cy + sa * 300);
      const t0 = MC.ahora(); let listo = false; while (!listo && MC.ahora() - t0 < 12) listo = this._trabajar(this._job, 24);
      if (listo) this._usar(this._job);
      else { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, rgbCss(cielo.top, oscuro)); gr.addColorStop(1, rgbCss(cielo.hor, oscuro)); g.fillStyle = gr; g.fillRect(0, 0, W, H); const J = this._job, f = (J.j + J.s) / (2 * N); g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 ' + Math.round(W / 26) + 'px system-ui'; g.textAlign = 'center'; g.fillText('⛰️ Armando el vuelo… ' + Math.round(f * 100) + ' %', W / 2, H * .45); return; } }
    else if (this._job) { if (this._trabajar(this._job, Math.max(8, this.N >> 4))) this._usar(this._job); }
    else if (Math.abs(cx + ca * 300 - (this.x0 + N * c / 2)) > N * c * .2 || Math.abs(cy + sa * 300 - (this.y0 + N * c / 2)) > N * c * .2) this._job = this._iniciar(cx + ca * 400, cy + sa * 400);
    const w = Math.round(clamp(W / 2.2, 180, 380)), h = Math.max(100, Math.round(w * H / W)); if (!this._cv || this._cv.width !== w || this._cv.height !== h) { this._cv = lienzo(w, h); this._img = this._cv.getContext('2d').createImageData(w, h); this._u = new Uint32Array(this._img.data.buffer); this._yb = new Int32Array(w); }
    const U = this._u, yb = this._yb, A = this.alt, K = this.col, x0 = this.x0, y0 = this.y0;
    const suelo = M.cota(C.x, C.y), camH = Math.max(suelo + 62, M.cota(cx, cy) + 40), hor = h * .3, foc = w / 2 / Math.tan(.68), esc = foc, D = Math.min(1100, N * c * .62);
    /* el cielo, fila por fila */
    for (let y = 0; y < h; y++) { const f = clamp(y / (hor * 1.1), 0, 1), r = cielo.top[0] + (cielo.hor[0] - cielo.top[0]) * f, gg = cielo.top[1] + (cielo.hor[1] - cielo.top[1]) * f, b = cielo.top[2] + (cielo.hor[2] - cielo.top[2]) * f, v = (255 << 24) | ((b * oscuro) << 16) | ((gg * oscuro) << 8) | (r * oscuro); U.fill(v, y * w, y * w + w); }
    yb.fill(h); const fr = cielo.bruma[0], fg = cielo.bruma[1], fb = cielo.bruma[2];
    /* de adelante hacia atrás: cada distancia z es una línea del suelo; cada columna sube hasta donde llegó la anterior */
    for (let z = 2, dz = 1; z < D; z += dz, dz = Math.min(dz * 1.02 + .01, 12)) {
      const lx = cx + ca * z + sa * z * (w / 2 / foc), ly = cy + sa * z - ca * z * (w / 2 / foc), rx = cx + ca * z - sa * z * (w / 2 / foc), ry = cy + sa * z + ca * z * (w / 2 / foc), ddx = (rx - lx) / w, ddy = (ry - ly) / w, niebla = clamp((z / D) ** 1.5, 0, 1), inv = esc / z;
      let px = (lx - x0) / c, py = (ly - y0) / c; const sx = ddx / c, sy = ddy / c;
      for (let i = 0; i < w; i++, px += sx, py += sy) {
        const ii = px | 0, jj = py | 0; if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue; const k = jj * N + ii, ys = ((camH - A[k]) * inv + hor) | 0; if (ys >= yb[i]) continue;
        const v = K[k], r = ((v & 255) * (1 - niebla) + fr * niebla) * oscuro, gg = (((v >> 8) & 255) * (1 - niebla) + fg * niebla) * oscuro, b = (((v >> 16) & 255) * (1 - niebla) + fb * niebla) * oscuro, px32 = (255 << 24) | (b << 16) | (gg << 8) | r;
        for (let y = Math.max(0, ys); y < yb[i]; y++) U[y * w + i] = px32; yb[i] = ys;
      }
    }
    this._cv.getContext('2d').putImageData(this._img, 0, 0);
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(this._cv, 0, 0, W, H); g.restore();
    this._q = { cx, cy, ca, sa, foc, w, camH, esc, hor, kx: W / w, ky: H / h };
    /* el jugador y los carros cercanos encima (sprites, como los helicópteros de Comanche) */
    const pj = this.aPantalla(C.x, C.y, suelo + (C.z || 0)); if (pj) { const s = W / w * foc / Math.max(10, (C.x - cx) * ca + (C.y - cy) * sa); if (C.veh && C.veh.clase === 'pie') { g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(pj[0], pj[1] - 3, Math.max(3, s * .8), 0, TAU); g.fill(); } else carroAtras(g, pj[0], pj[1], Math.max(10, 1.9 * s), (C.veh && C.veh.color) || '#a3202a', { giro: 0, t: E.t || 0 }); }
    let nc = 0; for (const v of E.trafico || []) { if (nc > 30) break; const q = this.aPantalla(v.x, v.y, M.cota(v.x, v.y)); if (!q || q[0] < 0 || q[0] > W || q[1] < 0 || q[1] > H) continue; const f = (v.x - cx) * ca + (v.y - cy) * sa; if (f > 700) continue; nc++; carroAtras(g, q[0], q[1], Math.max(3, 1.85 * W / w * foc / f), v.color || '#d8d8d8', { t: E.t || 0, sirena: /patrulla|policia/.test(v.tipo || '') }); }
  }
}

/* ---------- las dos vistas nuevas dentro del gestor de vistas ---------- */
VISTAS.push({ id: 'arcade', n: 'Arcade (carretera)', icon: '🏁', tipo: 'arcade', control: 'volante' }, { id: 'vuelo', n: 'Vuelo (Voxel Space)', icon: '⛰️', tipo: 'voxel', control: 'volante' });
{
  const _dibujar = Vistas.prototype.dibujar, _aPantalla = Vistas.prototype.aPantalla, _liberar = Vistas.prototype.liberar;
  Vistas.prototype.dibujar = function (g, W, H, E, dt = 1 / 60) {
    const v = this.actual; if (v.tipo !== 'arcade' && v.tipo !== 'voxel') return _dibujar.call(this, g, W, H, E, dt);
    const t0 = MC.ahora(); this._ef = v; this._W = W; this._H = H; E.dt = dt; if (E.camara) E.camara.pantalla = [W, H];
    try {
      if (v.tipo === 'arcade') { if (!this.arcade || this.arcade.M !== this.mundo) this.arcade = new Arcade(this.mundo); this.arcade.dibujar(g, W, H, E, { pixel: this.pixel, escala: this.escalaPixel }); }
      else { if (!this.voxel || this.voxel.M !== this.mundo) this.voxel = new VoxelSpace(this.mundo); this.voxel.dibujar(g, W, H, E); }
      this._clima2D(g, W, H, E, true);
    } catch (e) { MC.falla('vista ' + v.id, e); }
    if (this.fundido && this.fundido.cv) { this.fundido.t += dt / .55; const al = 1 - suave(this.fundido.t); if (al <= 0) this.fundido = null; else { g.save(); g.globalAlpha = al; g.drawImage(this.fundido.cv, 0, 0, W, H); g.restore(); } }
    this._ultimo = g.canvas; const ms = MC.ahora() - t0; this.ms = this.ms * .92 + ms * .08; return ms;
  };
  Vistas.prototype.aPantalla = function (E, x, y, z = 0) { const v = this.actual; if (v.tipo === 'arcade') return this.arcade ? this.arcade.aPantalla(x, y, z || this.mundo.cota(x, y)) : null; if (v.tipo === 'voxel') return this.voxel ? this.voxel.aPantalla(x, y, z) : null; return _aPantalla.call(this, E, x, y, z); };
  Vistas.prototype.liberar = function () { this.arcade = null; this.voxel = null; return _liberar.call(this); };
}

Object.assign(MC, { DDA, Semilla, Sigilo, Arcade, VoxelSpace });
