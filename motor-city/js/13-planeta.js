/* =====================================================================
   PLANETA (4.0) · varias ciudades reales en un mismo planeta, unidas por carreteras largas por «la nada»
   Cada ciudad conserva su mapa nativo (Manhattan a 6 m, Medellín y el Valle, Guatapé a 5 m): juntarlas en una sola
   cuadrícula costaría cientos de MB y perdería detalle. El planeta es un ANILLO: ciudad → tramo de carretera →
   ciudad → tramo… y vuelve al principio (es redondo). Cada tramo es un mundo generado (Generador.carretera) de
   kilómetros de largo, con sus biomas: costa con playa y mar, llanura, desierto, bosque, montaña, nieve y lagos.
   Al cruzar la puerta de una ciudad (una autopista que sale por el borde del mapa) se entra al tramo, y al llegar al
   final del tramo se entra a la siguiente ciudad. Solo hay un mundo cargado a la vez (más el que se acaba de dejar).
   Vista de planeta (globo): la esfera con sus biomas, la carretera del anillo, las ciudades, la atmósfera y el espacio.
   Uso:
     const P = new MC.Planeta({ anillo: MC.Planeta.ANILLO, cargar: id => MC.Mundo.cargar(MC_MUNDOS[id], MC_CIUDADES[id]) });
     const M = await P.mundo('nueva_york'), puerta = P.puertas('nueva_york').siguiente;   // { x, y, a }
     cada cuadro: const c = P.cruce(idActual, x, y, vx, vy); if (c) { const M2 = await P.mundo(c.a); const L = P.llegada(c.a, idActual); … }
     P.globo(g, W, H, { yo: { id, x, y }, lon0 })   // dibuja el planeta
   ===================================================================== */
const BIOMAS_RUTA = {
  costa: { n: 'Costa', base: 6, zona: 'costa', arena: true, mar: true, arboles: .25 },
  llanura: { n: 'Llanura', base: 40, zona: 'llanura', arboles: .2 },
  desierto: { n: 'Desierto', base: 70, zona: 'desierto', arena: true, arboles: .02 },
  bosque: { n: 'Bosque', base: 120, zona: 'bosque', arboles: 1 },
  montana: { n: 'Montaña', base: 320, zona: 'montana', crestas: 950, arboles: .45 },
  nieve: { n: 'Nevado', base: 900, zona: 'nieve', crestas: 1300, nieve: true, arboles: .12 },
  lagos: { n: 'Lagos', base: 60, zona: 'lagos', lagos: true, arboles: .5 }
};
const ZONAS_RUTA = {
  costa: { nombre: 'Costa', muros: ['#f2eee4', '#7fb7c9', '#e8dfcc'], techos: ['#b5542f', '#8e9095'], plancha: .6, tanques: .1, teja: .4, arboles: .25, densidad: .2, pisos: [1, 2], suelo: '#9fbf6a' },
  llanura: { nombre: 'Llanura', muros: ['#e8dfcc', '#c46a40'], techos: ['#b5542f', '#7d7f84'], plancha: .4, tanques: .2, teja: .6, arboles: .2, densidad: .1, pisos: [1, 2], suelo: '#8fb35a' },
  desierto: { nombre: 'Desierto', muros: ['#d9b98a', '#c9a36b', '#e6d2ac'], techos: ['#a88b62', '#7d7f84'], plancha: .9, tanques: .3, teja: .05, arboles: .02, densidad: .05, pisos: [1, 1], suelo: '#d8b878' },
  bosque: { nombre: 'Bosque', muros: ['#7a5a3a', '#e8dfcc'], techos: ['#4d5b3a', '#7d7f84'], plancha: .2, tanques: .1, teja: .7, arboles: 1, densidad: .05, pisos: [1, 2], suelo: '#4f7a3a' },
  montana: { nombre: 'Montaña', muros: ['#e8dfcc', '#9a8f80'], techos: ['#7d7f84', '#b5542f'], plancha: .4, tanques: .2, teja: .5, arboles: .45, densidad: .05, pisos: [1, 2], suelo: '#6d8a4e' },
  nieve: { nombre: 'Nevado', muros: ['#efefef', '#7a5a3a'], techos: ['#5a5f69', '#8e9095'], plancha: .3, tanques: 0, teja: .5, arboles: .12, densidad: .03, pisos: [1, 2], suelo: '#dfe6ea' },
  lagos: { nombre: 'Lagos', muros: ['#e8dfcc', '#3f7fbf'], techos: ['#b5542f', '#7d7f84'], plancha: .4, tanques: .1, teja: .6, arboles: .5, densidad: .05, pisos: [1, 2], suelo: '#7aa65a' }
};
const PARADAS_RUTA = [['Bomba La Última Gota', 'fuel'], ['Motel El Olvido', 'motel'], ['Bar La Nada', 'bar'], ['Taller Sin Nombre', 'car_repair'], ['Mirador del Kilómetro', 'mirador'], ['Peaje Abandonado', 'toll'], ['Paradero de Camioneros', 'restaurant'], ['Iglesia de Paso', 'church']];
/* la carretera larga por la nada: un mundo de `largo` metros de norte (y = 0) a sur, con su autopista en el medio */
Generador.carretera = function (op = {}) {
  const sem = op.semilla ?? 7, r = new Azar(sem), N = new Ruido(sem), T = op.tile || 10, largo = op.largo || 14000, anchoM = op.ancho || 2400, W = Math.ceil(anchoM / T), H = Math.ceil(largo / T);
  const biomas = (op.biomas || ['llanura', 'desierto', 'montana', 'lagos']).map(b => BIOMAS_RUTA[b] ? b : 'llanura'), nb = biomas.length;
  const cx0 = W * T / 2, fase = r.f() * 6, centro = y => cx0 + 260 * Math.sin(y / 1900 + fase) + 110 * Math.sin(y / 640 + fase * 2.3);   // la vía serpentea
  /* peso de cada bioma a lo largo de la vía (transición suave de 6 % del largo) */
  const pesos = y => { const u = clamp(y / largo, 0, 1) * nb, i = Math.min(nb - 1, Math.floor(u)), f = u - i, w = new Float32Array(nb); w[i] = 1; const tr = .12; if (f > 1 - tr && i < nb - 1) { const k = suave((f - (1 - tr)) / tr * .5); w[i] = 1 - k; w[i + 1] = k; } else if (f < tr && i > 0) { const k = suave((tr - f) / tr * .5); w[i] = 1 - k; w[i - 1] = k; } return w; };
  const bioma = y => { const w = pesos(y); let b = 0; for (let i = 1; i < nb; i++) if (w[i] > w[b]) b = i; return b; };
  const altura = (x, y, bi) => { const B = BIOMAS_RUTA[biomas[bi]], d = Math.abs(x - centro(y)), n = N.fbm(x / 900, y / 900, 4) * .5 + .5;
    let h = B.base + 40 * (n - .5) + 30 * N.fbm(y / 4000 + 3, 1.7, 2);
    if (B.crestas) h += N.crestas(x / 1400 + 9, y / 1400, 5) * B.crestas * suave(clamp((d - 70) / 520, 0, 1));
    if (biomas[bi] === 'desierto') h += 18 * Math.abs(Math.sin(x / 90 + N.fbm(x / 400, y / 400, 2) * 4));
    if (B.mar && (x - centro(y)) > 160) h = -6 - (x - centro(y) - 160) * .02;
    return h; };
  const hVia = y => { let s = 0, k = 0; for (let dy = -300; dy <= 300; dy += 100) { const w = pesos(clamp(y + dy, 0, largo)); for (let i = 0; i < nb; i++) if (w[i]) { s += w[i] * (BIOMAS_RUTA[biomas[i]].base + 30 * N.fbm((y + dy) / 4000 + 3, 1.7, 2)); k += w[i]; } } return Math.max(3, s / k); };
  /* 1. relieve (cada 4 casillas) con la vía aplanada en su corredor */
  const es = 4, eW = Math.ceil(W / es) + 2, eH = Math.ceil(H / es) + 2, E = new Float32Array(eW * eH);
  for (let j = 0; j < eH; j++) { const y = j * es * T, w = pesos(y), hv = hVia(y), c = centro(y); for (let i = 0; i < eW; i++) { const x = i * es * T; let h = 0; for (let b = 0; b < nb; b++) if (w[b]) h += w[b] * altura(x, y, b); const d = Math.abs(x - c), k = suave(clamp((d - 26) / 110, 0, 1)); E[j * eW + i] = h * k + hv * (1 - k); } }
  const cotaE = (x, y) => { const gx = clamp(x / (es * T), 0, eW - 1.001), gy = clamp(y / (es * T), 0, eH - 1.001), x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, k = y0 * eW + x0; return (E[k] * (1 - fx) + E[k + 1] * fx) * (1 - fy) + (E[k + eW] * (1 - fx) + E[k + eW + 1] * fx) * fy; };
  /* 2. suelo por bioma, altura y distancia a la vía; lagos a los lados (nunca sobre la vía) */
  const suelo = new Uint8Array(W * H), cel = 8, mW = Math.ceil(W / cel) + 1, mH = Math.ceil(H / cel) + 1, muni = new Uint8Array(mW * mH), pis = new Uint8Array(mW * mH), nivel = new Int8Array(W * H);
  for (let ty = 0; ty < H; ty++) { const y = (ty + .5) * T, bi = bioma(y), B = BIOMAS_RUTA[biomas[bi]], c = centro(y); for (let tx = 0; tx < W; tx++) {
    const x = (tx + .5) * T, d = Math.abs(x - c), h = cotaE(x, y); let t = TT.GRASS;
    if (h < 0) t = TT.WATER; else if (B.mar && x - c > 70) t = TT.ARENA;
    else if (B.lagos && d > 110 && N.fbm(x / 520 + 4, y / 520, 3) > .28) t = TT.WATER;
    else if (B.arena) t = TT.ARENA; else if (B.nieve || h > 1050) t = d > 40 ? TT.NIEVE : TT.GRASS;
    else if (B.crestas && h - hVia(y) > 380) t = TT.ROCA; else if (B.crestas && h - hVia(y) > 120) t = TT.MOUNT;
    suelo[ty * W + tx] = t; } }
  for (let j = 0; j < mH; j++) for (let i = 0; i < mW; i++) muni[j * mW + i] = 1 + bioma((j + .5) * cel * T);
  /* 3. la autopista (y su hombro), con nombre, y las paradas en la vía cada ~3 km */
  const P = []; for (let y = 20; y <= largo - 20; y += 20) P.push(Math.round(centro(y) * 10) / 10, y);
  const nombre = op.nombre || 'Ruta ' + sem, vias = [[VIA.AUTOPISTA, nombre, 16, P]], calles = new Set([nombre]), edJ = [], lugares = [], hitos = [];
  const pon = (x, y, t, rad) => { for (let yy = y - rad; yy <= y + rad; yy += T / 2) for (let xx = x - rad; xx <= x + rad; xx += T / 2) { if (Math.hypot(xx - x, yy - y) > rad) continue; const tx = Math.floor(xx / T), ty = Math.floor(yy / T); if (tx >= 0 && ty >= 0 && tx < W && ty < H) suelo[ty * W + tx] = t; } };
  for (let k = 0; k + 3 < P.length; k += 2) { const ax = P[k], ay = P[k + 1], bx = P[k + 2], by = P[k + 3]; for (let q = 0; q <= 4; q++) { const x = ax + (bx - ax) * q / 4, y = ay + (by - ay) * q / 4; pon(x, y, TT.LAND, 11); } }
  for (let k = 0; k + 3 < P.length; k += 2) { const ax = P[k], ay = P[k + 1], bx = P[k + 2], by = P[k + 3]; for (let q = 0; q <= 4; q++) pon(ax + (bx - ax) * q / 4, ay + (by - ay) * q / 4, TT.AVE, 8); }
  const KIND = ['casa', 'edificio', 'torre', 'nave', 'educativo', 'salud', 'iglesia', 'civico', 'comercio', 'deporte', 'techo', 'invernadero', 'tanque', 'transporte', 'parqueadero', 'rural'];
  for (let y = 1500 + r.f() * 800, n = 0; y < largo - 900; y += 2600 + r.f() * 1400, n++) {
    const c = centro(y), lado = r.f() < .5 ? -1 : 1, px = c + lado * 46, [nomP, tipo] = PARADAS_RUTA[(n + sem) % PARADAS_RUTA.length], km = Math.round(y / 1000);
    if (BIOMAS_RUTA[biomas[bioma(y)]].mar && lado > 0) continue;
    const kind = tipo === 'fuel' || tipo === 'car_repair' ? 3 : tipo === 'church' ? 6 : tipo === 'motel' ? 1 : 8, pisos = tipo === 'motel' ? 2 : 1;
    edJ.push([Math.round(px * 10) / 10, Math.round(y * 10) / 10, tipo === 'motel' ? 14 : 9, 7, Math.PI / 2, pisos, kind, nomP]); pon(px, y, TT.BLDG, 8);
    for (let a = -18; a <= 18; a += 6) pon(c + lado * 24, y + a, TT.AUTO, 4);
    lugares.push({ id: 'parada-' + n, nombre: nomP + (tipo === 'mirador' ? ' ' + km : ''), municipio: '', x: px, y, ancho: 30, alto: 24, dibujo: tipo, dato: 'Kilómetro ' + km + ' de ' + nombre + '.', secreto: false });
  }
  for (const e of edJ) { const i = Math.min(mW - 1, Math.floor(e[0] / T / cel)), j = Math.min(mH - 1, Math.floor(e[1] / T / cel)); pis[j * mW + i] = Math.max(pis[j * mW + i], e[5]); }
  const relieve = new Int16Array(eW * eH); for (let k = 0; k < E.length; k++) relieve[k] = Math.round(Math.max(-8, E[k]));
  const lat = op.lat ?? 20, kx = 111320 * Math.cos(lat * Math.PI / 180) / T, ky = 110574 / T, municipios = biomas.map(b => BIOMAS_RUTA[b].n);
  const cfg = { id: 'ruta-' + sem, nombre, ventana: { lon0: 0, latN: lat + H * T / 2 / 110574, lon1: W * T / (kx * T), latS: lat - H * T / 2 / 110574, lat_ref: lat }, casilla_m: T,
    zonas: Object.assign({}, ZONAS_BASE, ZONAS_RUTA), zona_por_comuna: [null], zona_por_municipio: [null, ...biomas.map(b => BIOMAS_RUTA[b].zona)], clima: op.clima || { temp_media_c: 18, amplitud_c: 8, lluvia_mes: Array(12).fill(.3), hora_lluvia: [15, 19] } };
  const M = Mundo.desdeCapas({
    meta: { W, H, tile: T, lon0: 0, latN: cfg.ventana.latN, kx, ky, ciudad: cfg.id, nombre, generado: { semilla: sem, tipo: 'carretera' }, atribucion: ['Carretera generada por Motor City (semilla ' + sem + ')'] },
    capas: {
      suelo: { datos: suelo, info: { tipo: 'u8', w: W, h: H } }, relieve: { datos: relieve, info: { tipo: 'i16', w: eW, h: eH, paso: es } },
      municipio: { datos: muni, info: { tipo: 'u8', w: mW, h: mH, paso: cel } }, comuna: { datos: new Uint8Array(mW * mH), info: { tipo: 'u8', w: mW, h: mH, paso: cel } }, barrio: { datos: new Uint16Array(mW * mH), info: { tipo: 'u16', w: mW, h: mH, paso: cel } },
      pisos: { datos: pis, info: { tipo: 'u8', w: mW, h: mH, paso: cel } }, lotes: { datos: new Uint8Array(mW * mH), info: { tipo: 'u8', w: mW, h: mH, paso: cel } }, nivel: { datos: nivel, info: { tipo: 'i8', w: W, h: H } },
      vias: { datos: vias, info: { tipo: 'json', formato: 'VIASJ' } }, edificios: { datos: { kinds: KIND, lista: edJ }, info: { tipo: 'json', formato: 'EDJ', R: 320 } },
      info: { datos: { barrios: [], comunas: [], municipios, calles: [...calles], sitios_nombres: [], rio: [], parques: [] } }, pasos: { datos: { tipos: ['puente', 'tunel', 'viaducto'], lista: [] } },
      transporte: { datos: { lineas: [], encicla: [] } }, lugares: { datos: { lugares, hitos } }, trafico: { datos: { carriles: [], semaforos: [] } }
    }
  }, cfg);
  const a0 = Math.atan2(P[3] - P[1], P[2] - P[0]), n2 = P.length, a1 = Math.atan2(P[n2 - 1] - P[n2 - 3], P[n2 - 2] - P[n2 - 4]);
  M.carretera = { largo, biomas, inicio: { x: P[0], y: P[1] + 40, a: a0 }, fin: { x: P[n2 - 2], y: P[n2 - 1] - 40, a: a1 + Math.PI }, centro, bioma: y => biomas[bioma(y)] };
  M.generado = { semilla: sem, carretera: true, edificios: edJ.length, vias: 1, cfg };
  return M;
};
/* el anillo por defecto: Nueva York → costa y desierto → Medellín y el Valle → montaña y lagos → Guatapé → nieve y bosque → Nueva York */
const ANILLO_PLANETA = [
  { tipo: 'ciudad', id: 'nueva_york', nombre: 'Nueva York', lon: 0, lat: 22, lados: { anterior: 'e', siguiente: 'o' }, puertas: { anterior: { lat: 40.7061, lon: -73.9969, n: 'puente de Brooklyn' }, siguiente: { lat: 40.8517, lon: -73.9527, n: 'puente George Washington' } } },
  { tipo: 'tramo', id: 'ruta_atlantico', nombre: 'Ruta del Atlántico', largo: 16000, biomas: ['costa', 'llanura', 'desierto', 'montana'], semilla: 11 },
  { tipo: 'ciudad', id: 'medellin', nombre: 'Medellín y el Valle de Aburrá', lon: 120, lat: 6, lados: { anterior: 'n', siguiente: 'e' }, puertas: { anterior: { lat: 6.345, lon: -75.545, n: 'Autopista Norte' }, siguiente: { lat: 6.315, lon: -75.478, n: 'Autopista Medellín–Bogotá' } } },
  { tipo: 'tramo', id: 'ruta_embalse', nombre: 'Autopista del Embalse', largo: 12000, biomas: ['montana', 'bosque', 'lagos'], semilla: 23 },
  { tipo: 'ciudad', id: 'guatape', nombre: 'Guatapé', lon: 220, lat: 4, lados: { anterior: 'o', siguiente: 'n' } },
  { tipo: 'tramo', id: 'ruta_norte', nombre: 'Carretera del Norte', largo: 15000, biomas: ['lagos', 'bosque', 'nieve', 'llanura'], semilla: 37 }
];
class Planeta {
  constructor(op = {}) { this.anillo = op.anillo || ANILLO_PLANETA; this.cargar = op.cargar; this.cache = new Map(); this._puertas = new Map(); this.radioVisual = op.radioVisual || 60000; this.llegadaT = 0; }
  indice(id) { return this.anillo.findIndex(q => q.id === id); }
  def(id) { return this.anillo[this.indice(id)]; }
  vecino(id, paso) { const n = this.anillo.length, i = this.indice(id); return this.anillo[(i + paso + n) % n]; }
  /* el mundo de una parada del anillo (carga perezosa; se guardan a lo sumo dos en memoria) */
  async mundo(id) {
    if (this.cache.has(id)) return this.cache.get(id); const d = this.def(id); if (!d) throw new Error('el planeta no tiene ' + id);
    const M = d.tipo === 'tramo' ? Generador.carretera({ largo: d.largo, biomas: d.biomas, semilla: d.semilla, nombre: d.nombre }) : await this.cargar(id);
    M.planetaId = id; this.cache.set(id, M); while (this.cache.size > 2) { const k = this.cache.keys().next().value; if (k === id) break; this.cache.delete(k); }
    return M;
  }
  /* puertas de una ciudad: un punto de una vía grande cerca del borde del lado pedido (n, s, e, o), con el rumbo hacia afuera */
  puertas(id, M) {
    if (this._puertas.has(id)) return this._puertas.get(id); M = M || this.cache.get(id); const d = this.def(id); if (!M || !d) return null;
    const busca = lado => {
      const mx = M.ancho, my = M.alto, out = { n: -Math.PI / 2, s: Math.PI / 2, e: 0, o: Math.PI }[lado], borde = (x, y) => lado === 'n' ? y : lado === 's' ? my - y : lado === 'e' ? mx - x : x;
      let mejor = null, bs = -1e9;
      for (const v of M.vias()) { const k = v.k || v.c || v.clase || 0, P = v.p || v.P || v[3]; if (!P || P.length < 4) continue; const peso = k === VIA.AUTOPISTA ? 3 : k === VIA.AVENIDA || k === VIA.CARRERA ? 2 : 1;
        for (let i = 0; i < P.length; i += 2) { const x = P[i], y = P[i + 1], b = borde(x, y); if (x < mx * .04 || y < my * .04 || x > mx * .96 || y > my * .96) continue; const centro = lado === 'n' || lado === 's' ? Math.abs(x - mx / 2) / mx : Math.abs(y - my / 2) / my, s = -b / Math.max(mx, my) * 8 + peso - centro * 4 - (M.suelo(x, y) === TT.WATER ? 9 : 0);   /* cerca del borde, sobre una vía grande y hacia el centro de ese lado */ if (s > bs) { bs = s; mejor = { x, y }; } } }
      if (!mejor) mejor = { x: mx / 2, y: my / 2 };
      const q = M.viaCercana(mejor.x, mejor.y, 60); return { x: q ? q.x : mejor.x, y: q ? q.y : mejor.y, a: out, lado, adentro: { x: (q ? q.x : mejor.x) - Math.cos(out) * 70, y: (q ? q.y : mejor.y) - Math.sin(out) * 70 } };
    };
    /* con coordenadas en el anillo, la puerta es la vía más cercana a ese punto real (el puente, la autopista) */
    const fija = (k, lado) => { const f = d.puertas && d.puertas[k]; if (!f) return busca(lado); const g = M.geoAMetros(f.lat, f.lon), q = M.viaCercana(g.x, g.y, 400), out = { n: -Math.PI / 2, s: Math.PI / 2, e: 0, o: Math.PI }[lado], x = q ? q.x : g.x, y = q ? q.y : g.y; return { x, y, a: out, lado, nombre: f.n, adentro: { x: x - Math.cos(out) * 70, y: y - Math.sin(out) * 70 } }; };
    const P = { anterior: fija('anterior', d.lados.anterior), siguiente: fija('siguiente', d.lados.siguiente) }; this._puertas.set(id, P); return P;
  }
  /* dónde aparece quien llega a `id` viniendo de `desde` */
  llegada(id, desde) {
    const d = this.def(id), M = this.cache.get(id), vieneDeAtras = this.vecino(id, -1).id === desde;
    if (d.tipo === 'tramo') { const c = M.carretera, p = vieneDeAtras ? c.inicio : c.fin; return { x: p.x, y: p.y, a: vieneDeAtras ? Math.PI / 2 + 0 * p.a : -Math.PI / 2 }; }
    const P = this.puertas(id, M), q = vieneDeAtras ? P.anterior : P.siguiente; return { x: q.adentro.x, y: q.adentro.y, a: q.a + Math.PI };
  }
  /* ¿se cruzó una puerta? (con 3 s de gracia después de llegar, para no rebotar) */
  cruce(id, x, y, dt = 0) {
    if ((this.llegadaT -= dt) > 0) return null; const d = this.def(id), M = this.cache.get(id); if (!d || !M) return null;
    if (d.tipo === 'tramo') { if (y < 24) return { a: this.vecino(id, -1).id }; if (y > M.carretera.largo - 24) return { a: this.vecino(id, 1).id }; return null; }
    const P = this.puertas(id, M); for (const [k, q] of Object.entries(P)) { const dx = x - q.x, dy = y - q.y; if (Math.hypot(dx, dy) < 34 && dx * Math.cos(q.a) + dy * Math.sin(q.a) > -6) return { a: this.vecino(id, k === 'siguiente' ? 1 : -1).id }; }
    return null;
  }
  /* metros que faltan para la siguiente parada (para el letrero de la vía) */
  restante(id, x, y) { const d = this.def(id), M = this.cache.get(id); if (!d || !M || d.tipo !== 'tramo') return null; return { siguiente: this.vecino(id, 1).nombre, anterior: this.vecino(id, -1).nombre, faltan: Math.max(0, M.carretera.largo - y), recorrido: y, bioma: BIOMAS_RUTA[M.carretera.bioma(y)].n }; }
  /* posición en el globo (grados) de un punto de una parada del anillo */
  enGlobo(id, x = 0, y = 0) {
    const i = this.indice(id), d = this.anillo[i], n = this.anillo.length, ant = this.anillo[(i - 1 + n) % n], sig = this.anillo[(i + 1) % n];
    const ruta = lon => 14 * Math.sin(lon * Math.PI / 180 * 2);
    if (d.tipo === 'ciudad') { const M = this.cache.get(id), dx = M ? (x / M.ancho - .5) * 4 : 0, dy = M ? (y / M.alto - .5) * 4 : 0; return { lon: d.lon + dx, lat: (d.lat ?? ruta(d.lon)) - dy }; }
    const M = this.cache.get(id), f = M ? clamp(y / M.carretera.largo, 0, 1) : .5, l0 = ant.lon, l1 = sig.lon < l0 ? sig.lon + 360 : sig.lon, lon = l0 + (l1 - l0) * f;
    return { lon, lat: ruta(lon) };
  }
  /* el planeta en un lienzo 2D: esfera iluminada por el sol, biomas, mar, la carretera del anillo, las ciudades, la atmósfera y las estrellas */
  globo(g, W, H, op = {}) {
    const R = Math.min(W, H) * .34, cx = W / 2, cy = H / 2, lon0 = (op.lon0 ?? 0) * Math.PI / 180, tilt = (op.inclinacion ?? 18) * Math.PI / 180, Nz = this._ruido ||= new Ruido(2026), t = op.t || 0;
    g.fillStyle = '#03040a'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { const x = h2(i, 1, 501) * W, y = h2(i, 2, 501) * H, b = h2(i, 3, 501); g.fillStyle = 'rgba(255,255,255,' + (.25 + b * .75).toFixed(2) + ')'; g.fillRect(x, y, b > .9 ? 2 : 1, b > .9 ? 2 : 1); }
    const halo = g.createRadialGradient(cx, cy, R * .96, cx, cy, R * 1.22); halo.addColorStop(0, 'rgba(110,170,255,.55)'); halo.addColorStop(.35, 'rgba(70,130,255,.22)'); halo.addColorStop(1, 'rgba(40,80,200,0)'); g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, R * 1.22, 0, TAU); g.fill();
    const N = Math.max(120, Math.min(260, Math.round(R * 1.1))), c = this._cvG && this._cvG.width === N ? this._cvG : (this._cvG = lienzo(N, N)), q = c.getContext('2d'), img = q.createImageData(N, N), D = img.data, sol = [Math.cos(t * .05) * .8, -.35, Math.sin(t * .05) * .8 + .4], sl = Math.hypot(...sol);
    const ruta = lon => 14 * Math.sin(lon * 2), ciudades = this.anillo.filter(a => a.tipo === 'ciudad'), biomaLon = lonG => { const n = this.anillo.length; let acc = null; for (let i = 0; i < n; i++) { const d = this.anillo[i]; if (d.tipo !== 'tramo') continue; const a = this.anillo[(i - 1 + n) % n].lon, b0 = this.anillo[(i + 1) % n].lon, b = b0 < a ? b0 + 360 : b0; let L = lonG; if (L < a) L += 360; if (L >= a && L <= b) { const f = (L - a) / (b - a); acc = d.biomas[Math.min(d.biomas.length - 1, Math.floor(f * d.biomas.length))]; } } return acc; };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const u = (i + .5) / N * 2 - 1, v = (j + .5) / N * 2 - 1, rr = u * u + v * v, o = (j * N + i) * 4; if (rr > 1) { D[o + 3] = 0; continue; }
      const z = Math.sqrt(1 - rr), y1 = -v * Math.cos(tilt) + z * Math.sin(tilt), z1 = v * Math.sin(tilt) + z * Math.cos(tilt), lat = Math.asin(clamp(y1, -1, 1)), lon = Math.atan2(u, z1) + lon0, latD = lat * 180 / Math.PI, lonD = ((lon * 180 / Math.PI) % 360 + 360) % 360;
      const tierra = Nz.fbm(Math.cos(lon) * 1.6 + 3, Math.sin(lon) * 1.6 + latD / 40, 5) + .25 - Math.abs(latD - ruta(lonD * Math.PI / 180)) / 60, polo = Math.abs(latD) > 68;
      let col = tierra > .08 ? [70, 120, 60] : [20, 60, 130]; if (tierra > .08) { const b = biomaLon(lonD); col = b === 'desierto' ? [205, 175, 110] : b === 'nieve' ? [225, 232, 238] : b === 'bosque' ? [40, 95, 45] : b === 'montana' ? [110, 105, 90] : b === 'costa' ? [120, 160, 90] : col; if (tierra > .45) col = [120, 112, 100]; }
      if (polo) col = [236, 242, 248];
      if (Math.abs(latD - ruta(lonD * Math.PI / 180)) < 1.1 && !polo) col = [235, 200, 90];   // la carretera del anillo
      const nx = u, ny = -v, nz = z, luz = Math.max(.08, (nx * sol[0] + ny * sol[1] + nz * sol[2]) / sl), noche = 1 - clamp(luz * 3, 0, 1);
      let rC = col[0] * luz, gC = col[1] * luz, bC = col[2] * luz; for (const C of ciudades) { if (Math.abs(lonD - C.lon) < 3 && Math.abs(latD - (C.lat ?? ruta(C.lon * Math.PI / 180))) < 3 && noche > .2) { rC += 255 * noche * .9; gC += 200 * noche * .9; bC += 90 * noche * .6; } }
      const borde = Math.pow(1 - z, 3); D[o] = clamp(rC + 90 * borde, 0, 255); D[o + 1] = clamp(gC + 140 * borde, 0, 255); D[o + 2] = clamp(bC + 255 * borde, 0, 255); D[o + 3] = 255;
    }
    q.putImageData(img, 0, 0); g.save(); g.imageSmoothingEnabled = true; g.drawImage(c, cx - R, cy - R, R * 2, R * 2); g.restore();
    /* nombres de las ciudades y el jugador */
    const proy = (latD, lonD) => { const la = latD * Math.PI / 180, lo = lonD * Math.PI / 180 - lon0, x = Math.cos(la) * Math.sin(lo), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo), v = -(y * Math.cos(tilt) - z * Math.sin(tilt)), zz = y * Math.sin(tilt) + z * Math.cos(tilt); return { x: cx + x * R, y: cy + v * R, ve: zz > 0 }; };
    g.font = '700 ' + Math.max(11, R * .07) + 'px system-ui'; g.textAlign = 'left';
    for (const C of ciudades) { const p = proy(C.lat ?? ruta(C.lon * Math.PI / 180), C.lon); if (!p.ve) continue; g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(p.x, p.y, Math.max(3, R * .02), 0, TAU); g.fill(); g.fillStyle = '#fff'; g.shadowColor = '#000'; g.shadowBlur = 4; g.fillText(C.nombre, p.x + 8, p.y + 4); g.shadowBlur = 0; }
    if (op.yo) { const G = this.enGlobo(op.yo.id, op.yo.x, op.yo.y), p = proy(G.lat, G.lon); if (p.ve) { g.fillStyle = '#2ee6a6'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, Math.max(4, R * .028), 0, TAU); g.fill(); g.stroke(); } }
  }
}
Planeta.ANILLO = ANILLO_PLANETA; Planeta.BIOMAS = BIOMAS_RUTA;
MC.Planeta = Planeta;
