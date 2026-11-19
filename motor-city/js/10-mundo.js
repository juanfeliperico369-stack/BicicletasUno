/* =====================================================================
   MUNDO 2.0 · cargador y consultor del archivo MC4 (una ciudad entera en un solo archivo)
   Unidad: METROS del mapa desde el origen de la ciudad (x hacia el oriente, y hacia el sur).
   Casilla de `tile` m (10 en el valle). Las capas se inflan cuando alguien las pide (perezosas).
   Juega EnCicla dibuja en px (1 m = 1,6 px): MC.Mundo.escala(1.6) le da las mismas consultas en px.
   ===================================================================== */
const TT = { GRASS: 0, MOUNT: 1, BRICK: 2, BLDG: 3, ROAD: 4, AVE: 5, WALK: 6, CICLO: 7, WATER: 8, CANAL: 9, PLAZA: 10, BRIDGE: 11, STATION: 12, LAND: 13, AUTO: 14, DEPOT: 15, STEPS: 16, ARENA: 17, NIEVE: 18, ROCA: 19 };   // 17–19: mundos generados y otros territorios
const TT_NOMBRE = ['pasto', 'monte', 'ladrillo', 'edificio', 'calle', 'avenida', 'andén', 'ciclorruta', 'agua', 'quebrada', 'plaza', 'puente', 'estación', 'pista', 'autopista', 'patio', 'escalas', 'arena', 'nieve', 'roca'];
/* lo que no se atraviesa a pie ni en rueda (los botes sí van por el agua) */
const TT_SOLIDO = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
/* agarre y rodadura de cada suelo (1 = asfalto), como en Juega EnCicla */
const TT_SUPERFICIE = [.55, .25, .3, .3, 1, 1, .62, 1.3, 0, 0, .8, 1, .75, 0, .92, .9, .42, .4, .3, .35];
const TT_CALLE = new Set([TT.ROAD, TT.AVE, TT.AUTO, TT.BRIDGE]);
const TT_URBANO = new Set([TT.BRICK, TT.BLDG, TT.ROAD, TT.AVE, TT.AUTO, TT.WALK, TT.PLAZA, TT.STATION, TT.BRIDGE, TT.CICLO, TT.STEPS, TT.DEPOT]);
/* tipos de vía del archivo de vectores (VIAS3) */
const VIA = { CALLE: 1, AVENIDA: 2, AUTOPISTA: 3, CARRERA: 4, CICLO: 5, PEATONAL: 6, ESCALAS: 7, SENDERO: 8 };
const VIA_ANCHO = [0, 7, 14, 22, 9, 2.6, 4, 2.5, 2];   // metros por defecto si la vía no trae el suyo
/* altura en metros de un nivel (Overture «level»): puente 1 ≈ 4,5 m, viaducto 3 ≈ 13,5 m, deprimido −1 ≈ −4,5 m */
const NIVEL_M = 4.5;
const PISO_M = 3.05;

class Mundo {
  /* u8: bytes del archivo MC4 (o base64) · cfg: la ciudad (ciudades/<id>.json), opcional */
  constructor(u8, cfg) {
    if (typeof u8 === 'string') u8 = deB64(u8);
    if (String.fromCharCode(u8[0], u8[1], u8[2]) !== 'MC4') throw new Error('no es un archivo de mundo MC4');
    const n = u8[4] | u8[5] << 8 | u8[6] << 16 | u8[7] << 24;
    const meta = this.meta = JSON.parse(new TextDecoder().decode(u8.subarray(8, 8 + n)));
    this.u8 = u8; this.base = 8 + n; this.cfg = cfg || null; this._c = new Map();
    this.W = meta.W; this.H = meta.H; this.tile = meta.tile; this.ancho = meta.W * meta.tile; this.alto = meta.H * meta.tile;
    this.kx = meta.kx * meta.tile; this.ky = meta.ky * meta.tile;   // metros por grado (meta.kx es casillas por grado)
    const r = this.capaInfo('relieve'); this.eW = r.w; this.eH = r.h; this.es = r.paso * this.tile;
    const c = this.capaInfo('municipio'); this.mW = c.w; this.mH = c.h; this.ms = c.paso * this.tile;
  }
  static async cargar(fuente, cfg) {
    const m = new Mundo(fuente, cfg);
    await m.precargar(['suelo', 'relieve', 'municipio', 'comuna', 'barrio', 'pisos', 'nivel', 'info']);
    return m;
  }
  capaInfo(nombre) { const c = this.meta.capas[nombre]; if (!c) throw new Error('el mundo no trae la capa «' + nombre + '»'); return c; }
  tiene(nombre) { return !!this.meta.capas[nombre]; }
  _tipar(c, raw) {
    const ab = raw.byteOffset % 2 ? raw.slice().buffer : raw.buffer, o = raw.byteOffset % 2 ? 0 : raw.byteOffset;
    switch (c.tipo) {
      case 'u8': return raw; case 'i8': return new Int8Array(raw.buffer, raw.byteOffset, raw.length);
      case 'u16': return new Uint16Array(ab, o, raw.length >> 1); case 'i16': return new Int16Array(ab, o, raw.length >> 1);
      case 'json': return JSON.parse(new TextDecoder().decode(raw));
      default: return raw;
    }
  }
  _bytes(c) { return this.u8.subarray(this.base + c.o, this.base + c.o + c.n); }
  /* la capa ya inflada (síncrona) */
  capa(nombre) {
    let v = this._c.get(nombre); if (v !== undefined) return v;
    const c = this.capaInfo(nombre), b = this._bytes(c); v = this._tipar(c, c.z === 0 ? b : inflarSync(b, c.raw)); this._c.set(nombre, v); return v;
  }
  /* un mundo armado en memoria (generador procedural, editor o herramientas): capas ya tipadas, sin comprimir.
     d = { meta: { W, H, tile, lon0, latN, kx, ky, nombre, … }, capas: { suelo: Uint8Array, relieve: {datos: Int16Array, w, h, paso}, … } } */
  static desdeCapas(d, cfg) {
    const M = Object.create(Mundo.prototype), meta = Object.assign({ formato: 'MC4', v: 4, unidad: 'm', atribucion: [], capas: {} }, d.meta);
    M.meta = meta; M.cfg = cfg || null; M._c = new Map(); M.u8 = new Uint8Array(0); M.base = 0;
    for (const [n, c] of Object.entries(d.capas)) { const info = Object.assign({ o: 0, n: 0, raw: 0, z: 0, tipo: c.tipo || 'json' }, c.info || {}); meta.capas[n] = info; M._c.set(n, c.datos !== undefined ? c.datos : c); }
    M.W = meta.W; M.H = meta.H; M.tile = meta.tile; M.ancho = meta.W * meta.tile; M.alto = meta.H * meta.tile; M.kx = meta.kx * meta.tile; M.ky = meta.ky * meta.tile;
    const r = M.capaInfo('relieve'); M.eW = r.w; M.eH = r.h; M.es = r.paso * M.tile; const c2 = M.capaInfo('municipio'); M.mW = c2.w; M.mH = c2.h; M.ms = c2.paso * M.tile;
    return M;
  }
  async precargar(nombres) { await Promise.all(nombres.filter(n => this.tiene(n) && !this._c.has(n)).map(async n => { const c = this.capaInfo(n); this._c.set(n, this._tipar(c, await inflar(this._bytes(c), c.raw))); })); return this; }

  /* ---------- coordenadas ---------- */
  geoAMetros(lat, lon) { return { x: (lon - this.meta.lon0) * this.kx, y: (this.meta.latN - lat) * this.ky }; }
  metrosAGeo(x, y) { return { lat: this.meta.latN - y / this.ky, lon: this.meta.lon0 + x / this.kx }; }
  dentro(x, y) { return x >= 0 && y >= 0 && x < this.ancho && y < this.alto; }

  /* ---------- suelo, relieve y niveles ---------- */
  suelo(x, y) { const tx = Math.floor(x / this.tile), ty = Math.floor(y / this.tile); return (tx < 0 || ty < 0 || tx >= this.W || ty >= this.H) ? TT.MOUNT : this.capa('suelo')[ty * this.W + tx]; }
  sueloCasilla(tx, ty) { return (tx < 0 || ty < 0 || tx >= this.W || ty >= this.H) ? TT.MOUNT : this.capa('suelo')[ty * this.W + tx]; }
  /* cota del terreno en metros sobre el nivel del mar (bilineal en la malla de 80 m) */
  cota(x, y) {
    const E = this.capa('relieve'), w = this.eW, gx = clamp(x / this.es, 0, w - 1.001), gy = clamp(y / this.es, 0, this.eH - 1.001), x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, i = y0 * w + x0;
    return (E[i] * (1 - fx) + E[i + 1] * fx) * (1 - fy) + (E[i + w] * (1 - fx) + E[i + w + 1] * fx) * fy;
  }
  /* pendiente (subida positiva) en la dirección ang, en tanto por uno */
  pendiente(x, y, ang, d = 20) { const c = Math.cos(ang) * d, s = Math.sin(ang) * d; return (this.cota(x + c, y + s) - this.cota(x - c, y - s)) / (2 * d); }
  normal(x, y, d = 20) { const gx = (this.cota(x + d, y) - this.cota(x - d, y)) / (2 * d), gy = (this.cota(x, y + d) - this.cota(x, y - d)) / (2 * d), l = Math.hypot(gx, gy, 1); return [-gx / l, 1 / l, -gy / l]; }
  /* nivel firmado de lo que pasa por la casilla (puente, viaducto o deprimido); 0 = nada */
  nivel(x, y) { const tx = Math.floor(x / this.tile), ty = Math.floor(y / this.tile); return (tx < 0 || ty < 0 || tx >= this.W || ty >= this.H) ? 0 : this.capa('nivel')[ty * this.W + tx]; }
  solido(x, y) { return TT_SOLIDO[this.suelo(x, y)] === 1; }
  superficie(x, y) { return TT_SUPERFICIE[this.suelo(x, y)]; }
  esCiclovia(x, y, r = 6) { if (this.suelo(x, y) === TT.CICLO) return true; const c = this.viaCercana(x, y, r, v => v.k === VIA.CICLO); return !!c; }

  /* ---------- municipio, comuna, barrio, pisos y zona ---------- */
  _celda(x, y) { return clamp(Math.floor(y / this.ms), 0, this.mH - 1) * this.mW + clamp(Math.floor(x / this.ms), 0, this.mW - 1); }
  municipio(x, y) { const i = this.capa('municipio')[this._celda(x, y)]; return i ? this.capa('info').municipios[i - 1] || '' : ''; }
  comuna(x, y) { const i = this.capa('comuna')[this._celda(x, y)]; return i ? this.capa('info').comunas[i - 1] || '' : ''; }
  barrio(x, y) { const i = this.capa('barrio')[this._celda(x, y)]; return i ? this.capa('info').barrios[i - 1] || '' : ''; }
  pisos(x, y) { return this.capa('pisos')[this._celda(x, y)]; }
  lotes(x, y) { return this.tiene('lotes') ? this.capa('lotes')[this._celda(x, y)] * 4 : 0; }
  /* zona de estilo (reglas de la ciudad: ladera, centro, laureles, poblado, mixto, pueblo, rural…) */
  zona(x, y) {
    const i = this._celda(x, y), co = this.capa('comuna')[i], mu = this.capa('municipio')[i], C = this.cfg;
    if (!mu) return 'rural';
    const t = this.suelo(x, y); if (t === TT.MOUNT) return 'rural';
    if (C) { const z = co ? (C.zona_por_comuna || [])[co] : (C.zona_por_municipio || [])[mu]; if (z) return z; }
    return co ? 'mixto' : 'pueblo';
  }
  estilo(x, y) { const z = this.zona(x, y); return (this.cfg && this.cfg.zonas && this.cfg.zonas[z]) || { nombre: z, muros: ['#c25f37'], techos: ['#7d7f84'], arboles: .4, densidad: .7, pisos: [1, 4] }; }
  lugarTexto(x, y) { const b = this.barrio(x, y), m = this.municipio(x, y); return [b, m].filter(Boolean).join(' · ') || 'Valle'; }

  /* ---------- vías con nombre (vectores) ---------- */
  vias() {
    if (this._vias) return this._vias;
    if (this.capaInfo('vias').formato === 'VIASJ') return (this._vias = this.capa('vias').map((v, i) => ({ i, k: v[0], nombre: v[1] || '', nom: '', ancho: v[2] || VIA_ANCHO[v[0]] || 6, p: Float32Array.from(v[3]) })));   // [tipo, nombre, ancho, [x,y,…] metros]
    const c = this.capaInfo('vias'), u8 = this.capa('vias'), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), n = dv.getUint32(0, true), L = new Array(n), v3 = (c.v || 3) >= 3, K = this.tile / (c.vq || 4), NOM = this.capa('info').calles;
    let o = 4;
    for (let i = 0; i < n; i++) {
      const k = dv.getUint8(o), nm = dv.getUint16(o + 1, true); let nom = 0, w = 0, np;
      if (v3) { nom = dv.getUint16(o + 3, true); w = dv.getUint8(o + 5) / 2; np = dv.getUint16(o + 6, true); o += 8; } else { np = dv.getUint16(o + 3, true); o += 5; }
      const p = new Float32Array(np * 2); let x = 0, y = 0;
      for (let j = 0; j < np; j++) { x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); o += 4; p[j * 2] = x * K; p[j * 2 + 1] = y * K; }
      L[i] = { i, k, nombre: nm ? NOM[nm - 1] || '' : '', nom: nom ? NOM[nom - 1] || '' : '', ancho: w || VIA_ANCHO[k] || 6, p };
    }
    return (this._vias = L);
  }
  /* rejilla de 160 m con los tramos de vía que la tocan (para buscar la calle más cercana) */
  _rejillaVias() {
    if (this._rv) return this._rv; const G = new Map(), C = 160;
    for (const v of this.vias()) { const p = v.p; for (let j = 0; j + 3 < p.length; j += 2) { const x0 = Math.min(p[j], p[j + 2]), x1 = Math.max(p[j], p[j + 2]), y0 = Math.min(p[j + 1], p[j + 3]), y1 = Math.max(p[j + 1], p[j + 3]); for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const k = gx * 65536 + gy; let a = G.get(k); if (!a) G.set(k, a = []); a.push(v.i, j); } } }
    return (this._rv = { G, C });
  }
  /* la vía más cercana (a menos de r metros) que cumpla el filtro: { via, j, t, x, y, d, ang } */
  viaCercana(x, y, r = 40, filtro) {
    const { G, C } = this._rejillaVias(), V = this.vias(); let best = null, bd = r;
    for (let gy = Math.floor((y - r) / C); gy <= Math.floor((y + r) / C); gy++) for (let gx = Math.floor((x - r) / C); gx <= Math.floor((x + r) / C); gx++) {
      const a = G.get(gx * 65536 + gy); if (!a) continue;
      for (let q = 0; q < a.length; q += 2) {
        const v = V[a[q]], j = a[q + 1]; if (filtro && !filtro(v)) continue; const p = v.p, ax = p[j], ay = p[j + 1], dx = p[j + 2] - ax, dy = p[j + 3] - ay, L2 = dx * dx + dy * dy || 1e-9;
        const t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), px = ax + dx * t, py = ay + dy * t, d = Math.hypot(px - x, py - y);
        if (d < bd) { bd = d; best = { via: v, j, t, x: px, y: py, d, ang: Math.atan2(dy, dx) }; }
      }
    }
    return best;
  }
  calle(x, y) { const c = this.viaCercana(x, y, 60, v => v.nombre || v.nom); return c ? (c.via.nom || c.via.nombre) : ''; }

  /* ---------- casas y edificios: todas las huellas (formato ED1 de El Metro, regiones de 640 m) ---------- */
  _ed() {
    if (this._ED !== undefined) return this._ED;
    if (!this.tiene('edificios')) return (this._ED = null);
    if (this.capaInfo('edificios').formato === 'EDJ') {   // [x, y, medio largo, medio ancho, ángulo, pisos, clase, polígono|null] en metros
      const J = this.capa('edificios'), R = this.capaInfo('edificios').R || 320, nx = Math.ceil(this.ancho / R) + 1, ny = Math.ceil(this.alto / R) + 1, reg = new Map();
      for (const q of J.lista) { const [x, y, hw, hd, an, pis, k, ring] = q, ux = Math.cos(an), uy = Math.sin(an), r = Math.floor(y / R) * nx + Math.floor(x / R); let P = ring ? Float32Array.from(ring) : null;
        if (P) { let A = 0; const n = P.length / 2; for (let v = 0; v < n; v++) { const w = (v + 1) % n; A += P[2 * v] * P[2 * w + 1] - P[2 * w] * P[2 * v + 1]; } if (A < 0) { const P2 = new Float32Array(P.length); for (let v = 0; v < n; v++) { P2[2 * v] = P[2 * (n - 1 - v)]; P2[2 * v + 1] = P[2 * (n - 1 - v) + 1]; } P = P2; } }
        (reg.get(r) || reg.set(r, []).get(r)).push({ x, y, hw, hd, ux, uy, h: Mundo.altoEdificio(k, pis), pis, k, clase: J.kinds[k], P, of: 0, s: h2(x * 2 | 0, y * 2 | 0, 9) }); }
      return (this._ED = { json: true, R, nx, ny, reg, kinds: J.kinds, cuantos: J.lista.length });
    }
    const E = this.capaInfo('edificios'), b = this.capa('edificios'), nR = E.nx * E.ny, cnt = new Int32Array(nR), i0 = new Int32Array(nR), p0 = new Int32Array(nR), q0 = new Int32Array(nR);
    let o = 0, ci = 0, cp = 0, cq = 0; const rv = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
    for (let r = 0; r < nR; r++) { cnt[r] = rv(); const pb = rv(), qb = rv(); i0[r] = ci; p0[r] = cp; q0[r] = cq; ci += cnt[r]; cp += pb; cq += qb; }
    const Ls = E.len, oPos = Ls[0], oDim = oPos + Ls[1], oAng = oDim + Ls[2], oPis = oAng + Ls[3], oKin = oPis + Ls[4], oPol = oKin + Ls[5];
    if (ci !== E.cuantos || o !== Ls[0]) throw new Error('índice de edificios inconsistente');
    return (this._ED = { b, nx: E.nx, ny: E.ny, R: E.R, Q: E.Q, kinds: E.kinds, cnt, i0, p0, q0, oPos, oDim, oAng, oPis, oKin, oPol, cache: new Map() });
  }
  static altoEdificio(k, pis) {
    switch (k) {
      case 3: return 4.5 + pis * 2.6; case 9: return 7 + pis * 2.2; case 10: return 3.2; case 11: return 3; case 6: return Math.max(8, pis * 3.4);
      case 0: case 15: return pis * 2.7 + .5; default: return pis * PISO_M + .6;
    }
  }
  /* los edificios de una región: { x, y, hw, hd, ux, uy, h, pis, k, clase, P (polígono o null), s (semilla) } */
  edificiosRegion(rx, ry) {
    const E = this._ed(); if (!E || rx < 0 || ry < 0 || rx >= E.nx || ry >= E.ny) return [];
    const X = this._extra && this._extra.get(ry * E.nx + rx); if (X && X.length) { const B = this._edRegionBase(E, rx, ry); return B.concat(X); }
    return this._edRegionBase(E, rx, ry);
  }
  /* edificios agregados en el juego (la ciudad crece: MC.Urbe) */
  agregarEdificio({ x, y, hw = 4, hd = 4, ang = 0, pis = 1, clase = 'casa', k = 0, urbe = null }) {
    const E = this._ed(); if (!E) return null; const R = E.R, r = Math.floor(y / R) * E.nx + Math.floor(x / R), ux = Math.cos(ang), uy = Math.sin(ang);
    const e = { x, y, hw, hd, ux, uy, h: Mundo.altoEdificio(k, pis), pis, k, clase, P: null, of: 0, s: h2(x * 2 | 0, y * 2 | 0, 9), agregado: true, urbe };
    this._extra = this._extra || new Map(); (this._extra.get(r) || this._extra.set(r, []).get(r)).push(e); MC.emit('edificio', e); return e;
  }
  quitarEdificio(e) { if (!this._extra) return false; for (const L of this._extra.values()) { const i = L.indexOf(e); if (i >= 0) { L.splice(i, 1); return true; } } return false; }
  _edRegionBase(E, rx, ry) {
    if (E.json) return E.reg.get(ry * E.nx + rx) || [];
    const r = ry * E.nx + rx; let L = E.cache.get(r); if (L) { E.cache.delete(r); E.cache.set(r, L); return L; }
    const b = E.b, n = E.cnt[r], R = E.R, Q = E.Q, X0 = rx * R, Y0 = ry * R; L = [];
    let o = E.oPos + E.p0[r], q = E.oPol + E.q0[r], px = 0, py = 0, pa = 0;
    const rv = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
    const rq = () => { let v = 0, sh = 0, c; do { c = b[q++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
    const uz = v => v % 2 ? -(v + 1) / 2 : v / 2;
    for (let j = 0; j < n; j++) {
      const i = E.i0[r] + j; px += uz(rv()); py += uz(rv());
      const hw = Math.max(.5, b[E.oDim + 2 * i] / Q), hd = Math.max(.5, b[E.oDim + 2 * i + 1] / Q); pa = (pa + b[E.oAng + i]) % 128;
      const an = (pa + .5) * Math.PI / 128, ux = Math.cos(an), uy = Math.sin(an), pis = b[E.oPis + i] || 1, kf = b[E.oKin + i], k = kf & 15, x = X0 + px / Q, y = Y0 + py / Q;
      let P = null;
      if (kf & 16) {
        const nv = rq(); P = new Float32Array(nv * 2); let qx = px, qy = py, A = 0;
        for (let v = 0; v < nv; v++) { qx += uz(rq()); qy += uz(rq()); P[2 * v] = X0 + qx / Q; P[2 * v + 1] = Y0 + qy / Q; }
        for (let v = 0; v < nv; v++) { const w = (v + 1) % nv; A += P[2 * v] * P[2 * w + 1] - P[2 * w] * P[2 * v + 1]; }
        if (A < 0) { const P2 = new Float32Array(nv * 2); for (let v = 0; v < nv; v++) { P2[2 * v] = P[2 * (nv - 1 - v)]; P2[2 * v + 1] = P[2 * (nv - 1 - v) + 1]; } P = P2; }
      }
      L.push({ x, y, hw, hd, ux, uy, h: Mundo.altoEdificio(k, pis), pis, k, clase: E.kinds[k], P, of: kf & 96, s: h2(x * 2 | 0, y * 2 | 0, 9) });
    }
    E.cache.set(r, L); while (E.cache.size > 90) E.cache.delete(E.cache.keys().next().value);
    return L;
  }
  /* los edificios cuyo centro cae en el rectángulo (metros) */
  edificiosEn(x0, y0, x1, y1, out = []) {
    const E = this._ed(); if (!E) return out; const R = E.R;
    for (let ry = Math.floor((y0 - 60) / R); ry <= Math.floor((y1 + 60) / R); ry++) for (let rx = Math.floor((x0 - 60) / R); rx <= Math.floor((x1 + 60) / R); rx++) for (const e of this.edificiosRegion(rx, ry)) if (e.x >= x0 - e.hw - e.hd && e.x <= x1 + e.hw + e.hd && e.y >= y0 - e.hw - e.hd && e.y <= y1 + e.hw + e.hd) out.push(e);
    return out;
  }
  /* esquinas del edificio (su polígono real o su rectángulo orientado) */
  static esquinas(e) { if (e.P) return e.P; const { x, y, hw, hd, ux, uy } = e; return new Float32Array([x - ux * hw + uy * hd, y - uy * hw - ux * hd, x + ux * hw + uy * hd, y + uy * hw - ux * hd, x + ux * hw - uy * hd, y + uy * hw + ux * hd, x - ux * hw - uy * hd, y - uy * hw + ux * hd]); }
  /* ¿hay un edificio en (x, y)? (para la física de la ciudad) */
  edificioEn(x, y, r = 0) {
    const E = this._ed(); if (!E) return null; const rx = Math.floor(x / E.R), ry = Math.floor(y / E.R);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) for (const e of this.edificiosRegion(rx + dx, ry + dy)) {
      if (Math.abs(e.x - x) > e.hw + e.hd + r + 1 || Math.abs(e.y - y) > e.hw + e.hd + r + 1) continue;
      if (e.P) { if (dentroPol(e.P, x, y)) return e; }
      else { const lx = (x - e.x) * e.ux + (y - e.y) * e.uy, ly = -(x - e.x) * e.uy + (y - e.y) * e.ux; if (Math.abs(lx) < e.hw + r && Math.abs(ly) < e.hd + r) return e; }
    }
    return null;
  }

  /* ---------- sitios reales (EnCicla: universidades, iglesias, canchas, partes de los emblemáticos) ---------- */
  sitios() {
    if (this._sit) return this._sit; if (!this.tiene('sitios')) return (this._sit = { S: [], E: [], C: [], P: [], W: [], Z: [], U: [] });
    const c = this.capaInfo('sitios'), u8 = this.capa('sitios'), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), K = this.tile / (c.u || 8), NM = this.capa('info').sitios_nombres || [];
    const KS = ['', 'uni', 'cole', 'salud', 'iglesia', 'gob', 'dep', 'cult', 'trans', 'ofi'], TE = ['plano', 'cuatro', 'dos', 'helipuerto', 'aguja', 'cupula', 'ajedrez', 'cubierta', 'jardin'];
    const ver = dv.getUint8(3) - 48; let o = 4;
    const nS = dv.getUint32(o, true), nE = dv.getUint32(o + 4, true), nC = dv.getUint32(o + 8, true), nP = dv.getUint32(o + 12, true), nW = dv.getUint32(o + 16, true), nZ = ver >= 2 ? dv.getUint32(o + 20, true) : 0, nQ = ver >= 3 ? dv.getUint32(o + 24, true) : 0, nU = ver >= 3 ? dv.getUint32(o + 28, true) : 0; o += ver >= 3 ? 32 : ver >= 2 ? 24 : 20;
    const ring = () => { const n = dv.getUint16(o, true); let x = dv.getUint16(o + 2, true), y = dv.getUint16(o + 4, true); o += 6; const P = new Float32Array(n * 2); P[0] = x * K; P[1] = y * K; for (let i = 1; i < n; i++) { x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); o += 4; P[i * 2] = x * K; P[i * 2 + 1] = y * K; } return P; };
    const poly = () => { const k = dv.getUint8(o); o++; const R = []; for (let i = 0; i < k; i++) R.push(ring()); return R; };
    const S = [], E = [], C = [], PI = [], W = [], Ef = [];
    for (let i = 0; i < nS; i++) { const kb = dv.getUint8(o), est = dv.getUint8(o + 1), nm = dv.getUint16(o + 2, true); o += 4; const R = poly(); S.push({ i, clase: KS[kb & 127], suelto: !!(kb & 128), est: est === 255 ? -1 : est, nombre: NM[nm] || '', R, caja: caja(R) }); }
    for (let i = 0; i < nE; i++) {
      const s = dv.getUint16(o, true), kb = dv.getUint8(o + 2), fl = dv.getUint8(o + 3), roof = dv.getUint8(o + 4), est = dv.getUint8(o + 5), nm = dv.getUint16(o + 6, true); o += 8;
      const R = poly(), I = poly(); if (!R.length) { Ef.push(null); continue; }
      const b = { sitio: s, clase: KS[kb] || 'uni', pisos: fl, h: Math.max(4, fl * PISO_M + .6), techo: TE[roof] || 'plano', est, nombre: NM[nm] || '', R, I: I.length ? I : null, caja: caja(R), partes: null };
      b.x = (b.caja[0] + b.caja[2]) / 2; b.y = (b.caja[1] + b.caja[3]) / 2; E.push(b); Ef.push(b);
    }
    for (let i = 0; i < nC; i++) { C.push({ x: dv.getUint16(o, true) * K, y: dv.getUint16(o + 2, true) * K, largo: dv.getUint16(o + 4, true) * K, ancho: dv.getUint16(o + 6, true) * K, ang: dv.getInt16(o + 8, true) / 100 * Math.PI / 180, tipo: dv.getUint8(o + 10) }); o += 11; }
    for (let i = 0; i < nP; i++) { const R = poly(); if (R.length) PI.push({ R, caja: caja(R) }); }
    for (let i = 0; i < nW; i++) { const R = poly(); if (R.length) W.push({ R, caja: caja(R) }); }
    const Z = []; for (let i = 0; i < nZ; i++) { const R = poly(); if (R.length) Z.push({ R, caja: caja(R) }); }
    for (let i = 0; i < nQ; i++) {   // partes de los emblemáticos: prismas con base elevada y muros que se pueden inclinar
      const e = dv.getUint16(o, true), z0 = dv.getUint16(o + 2, true) / 10, z1 = dv.getUint16(o + 4, true) / 10, est = dv.getUint8(o + 6), roof = dv.getUint8(o + 7), fg = dv.getUint8(o + 8); o += 9;
      const B = ring(), T = fg & 1 ? ring() : null, b = Ef[e]; if (!b || (T && T.length !== B.length)) continue;
      (b.partes || (b.partes = [])).push({ z0: z0 * PISO_M, z1: z1 * PISO_M, B, T, est, techo: TE[roof] || 'plano' }); b.h = Math.max(b.h, z1 * PISO_M);
    }
    const U = []; for (let i = 0; i < nU; i++) { const col = dv.getUint8(o); let an = 0; o++; if (ver >= 4) { an = dv.getInt16(o, true) / 100 * Math.PI / 180; o += 2; } const R = poly(); if (R.length) U.push({ col, ang: an, R, caja: caja(R) }); }
    for (const b of E) if (b.partes) b.partes.sort((a, q) => a.z0 - q.z0);
    return (this._sit = { S, E, C, P: PI, W, Z, U });
  }

  /* ---------- capas de datos ---------- */
  get info() { return this.capa('info'); }
  get transporte() { return this.capa('transporte'); }
  get lugares() { return this.capa('lugares').lugares; }
  get hitos() { return this.capa('lugares').hitos; }
  get trafico() { return this.capa('trafico'); }
  /* puentes, deprimidos y viaducto como vectores: { tipo, nivel, ancho, alto, peatonal, linea, p, largo } */
  pasos() {
    if (this._pasos) return this._pasos; const J = this.capa('pasos'), out = [];
    for (const q of J.lista) { const tipo = J.tipos[q[0]], vi = tipo === 'viaducto', i0 = vi ? 6 : 5, p = new Float32Array(q.slice(i0)); let L = 0; for (let i = 2; i < p.length; i += 2) L += Math.hypot(p[i] - p[i - 2], p[i + 1] - p[i - 1]); out.push({ tipo, nivel: q[1], ancho: q[2], alto: q[3], peatonal: !!q[4], linea: vi ? q[5] : null, p, largo: L, caja: caja([p]) }); }
    return (this._pasos = out);
  }
  pasosEn(x0, y0, x1, y1) { return this.pasos().filter(q => q.caja[2] >= x0 && q.caja[0] <= x1 && q.caja[3] >= y0 && q.caja[1] <= y1); }
  /* lugar con postal más cercano */
  lugarCercano(x, y, r = 400) { let best = null, bd = r; for (const L of this.lugares) { const d = Math.hypot(L.x - x, L.y - y); if (d < bd) { bd = d; best = L; } } return best; }
  estacionCercana(x, y, r = 600, clase) { let best = null, bd = r; for (const l of this.transporte.lineas) { if (clase && l.clase !== clase) continue; for (const s of l.estaciones) { const d = Math.hypot(s[1] - x, s[2] - y); if (d < bd) { bd = d; best = { linea: l, nombre: s[0], x: s[1], y: s[2], d }; } } } return best; }
  enciclaCercana(x, y, r = 600) { let best = null, bd = r; for (const s of this.transporte.encicla || []) { const d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = s; } } return best; }
  /* un punto de partida bonito: la estación o el lugar con ese nombre o id */
  buscar(txt) {
    const t = String(txt).toLowerCase();
    for (const L of this.lugares) if (L.id.toLowerCase() === t || L.nombre.toLowerCase() === t) return { x: L.x, y: L.y, nombre: L.nombre };
    for (const s of this.transporte.encicla || []) if (s.id === t || s.nombre.toLowerCase() === t) return { x: s.x, y: s.y, nombre: s.nombre };
    for (const l of this.transporte.lineas) for (const s of l.estaciones) if (s[0].toLowerCase() === t) return { x: s[1], y: s[2], nombre: s[0] };
    return null;
  }
  resumen() { return { ciudad: this.meta.ciudad, casillas: this.W + '×' + this.H, tile: this.tile, km: [(this.ancho / 1000).toFixed(1), (this.alto / 1000).toFixed(1)], capas: Object.keys(this.meta.capas) }; }
}
function caja(R) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const P of R) for (let i = 0; i < P.length; i += 2) { if (P[i] < x0) x0 = P[i]; if (P[i] > x1) x1 = P[i]; if (P[i + 1] < y0) y0 = P[i + 1]; if (P[i + 1] > y1) y1 = P[i + 1]; } return [x0, y0, x1, y1]; }
function dentroPol(P, x, y) { let d = false; const n = P.length / 2; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d; } return d; }
Object.assign(MC, { Mundo, TT, TT_NOMBRE, TT_SOLIDO, TT_SUPERFICIE, TT_CALLE, TT_URBANO, VIA, VIA_ANCHO, NIVEL_M, PISO_M, caja, dentroPol });

/* ---------- compatibilidad con el lector 1.x de los juegos (Valle / MotorValle) ----------
   Los juegos que ya llaman Valle.decodificar() siguen andando; Valle.mundo2() abre el mundo 2.0. */
const ValleCompat = {
  version: MC.version,
  mundo2: (fuente, cfg) => Mundo.cargar(fuente, cfg),
  /* consultor 1.x sobre un mundo 2.0 ya cargado: casillas de `tile` m y px a `tsPx` por casilla */
  desdeMundo(m, tsPx = 16) {
    const pxm = tsPx / m.tile;
    return {
      meta: m.meta, w: m.W, h: m.H, tileM: m.tile, ts: tsPx, pxm, mundo: m,
      geoACasilla: (lat, lon) => { const p = m.geoAMetros(lat, lon); return { x: p.x / m.tile, y: p.y / m.tile }; },
      casillaAGeo: (tx, ty) => m.metrosAGeo(tx * m.tile, ty * m.tile),
      pxAMetros: px => px / pxm, metrosAPx: v => v * pxm,
      suelo: (tx, ty) => m.sueloCasilla(tx | 0, ty | 0),
      cotaCasilla: (tx, ty) => m.cota(tx * m.tile, ty * m.tile),
      cotaPx: (x, y) => m.cota(x / pxm, y / pxm),
      pendientePx: (x, y, ang) => m.pendiente(x / pxm, y / pxm, ang),
      municipioEn: (tx, ty) => m.municipio(tx * m.tile, ty * m.tile),
      barrioEn: (tx, ty) => m.barrio(tx * m.tile, ty * m.tile),
      comunaEn: (tx, ty) => ({ name: m.comuna(tx * m.tile, ty * m.tile) }),
      nivelEn: (tx, ty) => m.nivel(tx * m.tile, ty * m.tile)
    };
  }
};
MC.ValleCompat = ValleCompat; MC.Compat1 = ValleCompat;
