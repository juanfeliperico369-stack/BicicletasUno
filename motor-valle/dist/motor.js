/* Motor City · Motor del Valle 2.0 2.0.0 · 2026-11-19 · https://github.com/juanfeliperico369-stack/motorcity
   Un solo motor de mundo abierto para Juega EnCicla, El Metro y los juegos que vienen. Sin librerías ni internet.
   Datos del mundo: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; capas oficiales de Medellín; relieve SRTM/NASA. */
(function (root) {
'use strict';
/* ---- js/00-nucleo.js ---- */
/* =====================================================================
   MOTOR CITY · NÚCLEO (MC)
   El motor de mundo abierto que comparten Juega EnCicla, El Metro y los juegos que vienen.
   Todo el motor vive en un solo cierre y solo publica MC (y, por compatibilidad, Valle/MotorValle).
   Reglas: un solo HTML, sin internet ni librerías; español de Colombia; ningún dato personal.
   ===================================================================== */
const MC = {
  version: '2.0.0',
  nombre: 'Motor City · Motor del Valle 2.0',
  errores: [],
  juego: 'motorcity',          // quién usa el motor: 'encicla', 'elmetro', 'runscooter', 'motorcity'…
  ahora: () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
};
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const suave = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const angDif = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
/* hash entero → [0,1): el mismo de los dos juegos (h2), para que un mismo lugar se vea igual en todos */
function h2(x, y, s = 0) { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function hashTxt(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
class Azar {
  constructor(semilla) { this.r = mulberry32(semilla >>> 0 || 1); }
  f() { return this.r(); }
  e(a, b) { return a + Math.floor(this.r() * (b - a + 1)); }
  r2(a, b) { return a + this.r() * (b - a); }
  uno(L) { return L[Math.floor(this.r() * L.length)]; }
}
/* color: '#rrggbb' ↔ [r,g,b] en 0..1 y mezclas */
const hex3 = h => { if (Array.isArray(h)) return h; if (h[0] !== '#' && /^rgb/.test(h)) { const v = h.match(/[\d.]+/g).map(Number); return [v[0] / 255, v[1] / 255, v[2] / 255]; } h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h.slice(0, 6), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const css3 = (c, a = 1) => 'rgba(' + Math.round(clamp(c[0], 0, 1) * 255) + ',' + Math.round(clamp(c[1], 0, 1) * 255) + ',' + Math.round(clamp(c[2], 0, 1) * 255) + ',' + a + ')';
const mez3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const tono = (h, k) => { const c = hex3(h); return css3(k >= 0 ? mez3(c, [1, 1, 1], k) : mez3(c, [0, 0, 0], -k)); };
Object.assign(MC, { TAU, clamp, lerp, suave, angDif, h2, hashTxt, mulberry32, Azar, hex3, css3, mez3, tono });

/* ---------- eventos: cualquier módulo avisa y cualquier juego escucha ---------- */
const _oyentes = new Map();
MC.on = (ev, fn) => { (_oyentes.get(ev) || _oyentes.set(ev, []).get(ev)).push(fn); return () => MC.off(ev, fn); };
MC.off = (ev, fn) => { const L = _oyentes.get(ev); if (L) { const i = L.indexOf(fn); if (i >= 0) L.splice(i, 1); } };
MC.emit = (ev, dato) => { const L = _oyentes.get(ev); if (!L) return; for (const fn of L.slice()) { try { fn(dato); } catch (e) { MC.falla('evento ' + ev, e); } } };
MC.falla = (donde, e) => { const m = donde + ': ' + (e && e.message || e); if (MC.errores.length < 200) MC.errores.push(m); if (typeof console !== 'undefined') console.error('[Motor City]', m); };

/* ---------- arte: cada juego pone su piel con funciones de dibujo (hooks) ----------
   MC.arte.registrar('encicla', { paleta, suelo, edificio, personaje, vehiculo, cielo, … })
   MC.arte.usar('encicla') → las vistas llaman MC.arte.f('personaje', …) y, si el juego no la trae, usan la del motor. */
MC.arte = {
  pieles: { motor: {} }, activa: 'motor',
  registrar(juego, piel) { this.pieles[juego] = Object.assign(this.pieles[juego] || {}, piel); return this; },
  usar(juego) { if (!this.pieles[juego]) this.pieles[juego] = {}; this.activa = juego; MC.emit('arte', juego); return this; },
  /* la función de dibujo de la piel activa o la del motor */
  f(nombre) { const p = this.pieles[this.activa]; return (p && p[nombre]) || this.pieles.motor[nombre] || null; },
  dato(nombre, def) { const p = this.pieles[this.activa]; return p && p[nombre] !== undefined ? p[nombre] : (this.pieles.motor[nombre] !== undefined ? this.pieles.motor[nombre] : def); }
};

/* ---------- módulos de juego: cada juego (o modo) se conecta al mundo sin tocar el motor ----------
   MC.modulos.registrar({ id, nombre, juego, entra(ctx), sale(ctx), paso(dt, ctx), dibuja(g, ctx), metas: [] }) */
MC.modulos = {
  lista: new Map(),
  registrar(m) { if (!m || !m.id) throw new Error('módulo sin id'); this.lista.set(m.id, m); MC.emit('modulo', m); return m; },
  de(juego) { return [...this.lista.values()].filter(m => !m.juego || m.juego === juego || m.juego === '*'); }
};

/* ---------- huevos de pascua: puntos de enganche en el mundo ----------
   Un juego pone su huevo en un punto (lugar, hora, condición) y el motor avisa cuando el jugador lo cumple. */
MC.huevos = {
  puntos: new Map(), hallados: new Set(),
  poner(h) { if (!h || !h.id) return; this.puntos.set(h.id, Object.assign({ radio: 25, juegos: ['*'] }, h)); },
  /* se llama en cada paso con el estado del jugador; devuelve los huevos que se cumplieron ahora */
  revisar(est) {
    const out = [];
    for (const h of this.puntos.values()) {
      if (this.hallados.has(h.id)) continue;
      if (!h.juegos.includes('*') && !h.juegos.includes(MC.juego)) continue;
      if (h.x != null && Math.hypot(est.x - h.x, est.y - h.y) > h.radio) continue;
      if (h.hora && est.min != null && (est.min < h.hora[0] || est.min > h.hora[1])) continue;
      if (h.vehiculo && est.veh !== h.vehiculo) continue;
      if (h.cond && !h.cond(est)) continue;
      this.hallados.add(h.id); out.push(h); MC.emit('huevo', h);
    }
    return out;
  }
};

/* ---------- guardado sin romper: los campos nuevos llevan su valor por defecto ---------- */
MC.guardado = {
  /* mezcla profunda: lo guardado manda; lo que falta se toma de los valores por defecto */
  completar(guardado, defecto) {
    if (guardado == null || typeof guardado !== typeof defecto || Array.isArray(defecto) !== Array.isArray(guardado)) return JSON.parse(JSON.stringify(defecto));
    if (typeof defecto !== 'object' || Array.isArray(defecto) || defecto === null) return guardado;
    const o = Object.assign({}, guardado); for (const k of Object.keys(defecto)) o[k] = this.completar(guardado[k], defecto[k]); return o;
  },
  leer(clave, defecto) { try { const s = typeof localStorage !== 'undefined' && localStorage.getItem(clave); return this.completar(s ? JSON.parse(s) : null, defecto); } catch (e) { return this.completar(null, defecto); } },
  escribir(clave, dato) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(clave, JSON.stringify(dato)); return true; } catch (e) { return false; } }
};

/* ---- js/01-inflate.js ---- */
/* =====================================================================
   DESCOMPRESIÓN: deflate crudo sin librerías (el mismo inflador de Juega EnCicla y El Metro)
   y DecompressionStream cuando el navegador lo trae (es varias veces más rápido).
   ===================================================================== */
function inflarCrudo(src, size) {
  let out = new Uint8Array(size || src.length * 4), o = 0, p = 0, bb = 0, bc = 0;
  const crece = n => { if (o + n <= out.length) return; const m = new Uint8Array(Math.max(out.length * 2, o + n)); m.set(out); out = m; };
  const bits = n => { while (bc < n) { if (p > src.length + 8) throw new Error('deflate truncado'); bb |= (src[p++] | 0) << bc; bc += 8; } const v = bb & ((1 << n) - 1); bb >>>= n; bc -= n; return v; };
  const mk = (len, n) => { const cnt = new Int32Array(16), off = new Int32Array(16), sym = new Int32Array(n); for (let i = 0; i < n; i++) cnt[len[i]]++; cnt[0] = 0; for (let i = 1; i < 16; i++) off[i] = off[i - 1] + cnt[i - 1]; for (let i = 0; i < n; i++) if (len[i]) sym[off[len[i]]++] = i; return { cnt, sym }; };
  const dec = h => { let code = 0, first = 0, idx = 0; for (let l = 1; l < 16; l++) { code |= bits(1); const c = h.cnt[l]; if (code - c < first) return h.sym[idx + code - first]; idx += c; first += c; first <<= 1; code <<= 1; } return 256; };
  const LB = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], LE = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DB = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], DE = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  let fl = null, fd = null;
  for (let last = 0; !last;) {
    last = bits(1); const type = bits(2);
    if (type === 0) { bb = 0; bc = 0; const len = src[p] | src[p + 1] << 8; p += 4; crece(len); out.set(src.subarray(p, p + len), o); o += len; p += len; continue; }
    let lh, dh;
    if (type === 1) { if (!fl) { const l = new Uint8Array(288); l.fill(8, 0, 144); l.fill(9, 144, 256); l.fill(7, 256, 280); l.fill(8, 280, 288); fl = mk(l, 288); fd = mk(new Uint8Array(30).fill(5), 30); } lh = fl; dh = fd; }
    else {
      const nl = bits(5) + 257, nd = bits(5) + 1, nc = bits(4) + 4, ord = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], cl = new Uint8Array(19);
      for (let i = 0; i < nc; i++) cl[ord[i]] = bits(3);
      const ch = mk(cl, 19), L = new Uint8Array(nl + nd);
      for (let i = 0; i < nl + nd;) { const s = dec(ch); if (s < 16) L[i++] = s; else { let r, v = 0; if (s === 16) { v = L[i - 1]; r = 3 + bits(2); } else if (s === 17) r = 3 + bits(3); else r = 11 + bits(7); while (r--) L[i++] = v; } }
      lh = mk(L.subarray(0, nl), nl); dh = mk(L.subarray(nl), nd);
    }
    for (;;) { let s = dec(lh); if (s < 256) { crece(1); out[o++] = s; } else if (s === 256) break; else { s -= 257; const len = LB[s] + bits(LE[s]), ds = dec(dh), d = DB[ds] + bits(DE[ds]); crece(len); for (let k = 0; k < len; k++, o++) out[o] = out[o - d]; } }
  }
  return o === out.length ? out : out.subarray(0, o);
}
/* base64 → bytes (atob en el navegador, Buffer en Node) */
function deB64(s) {
  if (typeof Buffer !== 'undefined' && typeof window === 'undefined') { const b = Buffer.from(s, 'base64'); return new Uint8Array(b.buffer, b.byteOffset, b.length); }
  const a = atob(s), u = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) u[i] = a.charCodeAt(i); return u;
}
/* inflado síncrono (Node: zlib; navegador: inflarCrudo) */
function inflarSync(u8, size) {
  if (typeof process !== 'undefined' && process.versions && process.versions.node && typeof require === 'function') { try { const z = require('zlib').inflateRawSync(u8); return new Uint8Array(z.buffer, z.byteOffset, z.length); } catch (e) { /* sigue con el propio */ } }
  return inflarCrudo(u8, size);
}
/* inflado asíncrono: DecompressionStream si existe; si no, el propio */
async function inflar(u8, size) {
  if (typeof DecompressionStream !== 'undefined' && typeof Response !== 'undefined') {
    try { const r = new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); if (!size || r.length === size) return r; } catch (e) { /* respaldo */ }
  }
  return inflarSync(u8, size);
}
Object.assign(MC, { inflarCrudo, inflarSync, inflar, deB64 });

/* ---- js/10-mundo.js ---- */
/* =====================================================================
   MUNDO 2.0 · cargador y consultor del archivo MC4 (una ciudad entera en un solo archivo)
   Unidad: METROS del mapa desde el origen de la ciudad (x hacia el oriente, y hacia el sur).
   Casilla de `tile` m (10 en el valle). Las capas se inflan cuando alguien las pide (perezosas).
   Juega EnCicla dibuja en px (1 m = 1,6 px): MC.Mundo.escala(1.6) le da las mismas consultas en px.
   ===================================================================== */
const TT = { GRASS: 0, MOUNT: 1, BRICK: 2, BLDG: 3, ROAD: 4, AVE: 5, WALK: 6, CICLO: 7, WATER: 8, CANAL: 9, PLAZA: 10, BRIDGE: 11, STATION: 12, LAND: 13, AUTO: 14, DEPOT: 15, STEPS: 16 };
const TT_NOMBRE = ['pasto', 'monte', 'ladrillo', 'edificio', 'calle', 'avenida', 'andén', 'ciclorruta', 'agua', 'quebrada', 'plaza', 'puente', 'estación', 'pista', 'autopista', 'patio', 'escalas'];
/* lo que no se atraviesa a pie ni en rueda (los botes sí van por el agua) */
const TT_SOLIDO = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0];
/* agarre y rodadura de cada suelo (1 = asfalto), como en Juega EnCicla */
const TT_SUPERFICIE = [.55, .25, .3, .3, 1, 1, .62, 1.3, 0, 0, .8, 1, .75, 0, .92, .9, .42];
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
    const c = this.capaInfo(nombre); v = this._tipar(c, inflarSync(this._bytes(c), c.raw)); this._c.set(nombre, v); return v;
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
  enciclaCercana(x, y, r = 600) { let best = null, bd = r; for (const s of this.transporte.encicla) { const d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = s; } } return best; }
  /* un punto de partida bonito: la estación o el lugar con ese nombre o id */
  buscar(txt) {
    const t = String(txt).toLowerCase();
    for (const L of this.lugares) if (L.id.toLowerCase() === t || L.nombre.toLowerCase() === t) return { x: L.x, y: L.y, nombre: L.nombre };
    for (const s of this.transporte.encicla) if (s.id === t || s.nombre.toLowerCase() === t) return { x: s.x, y: s.y, nombre: s.nombre };
    for (const l of this.transporte.lineas) for (const s of l.estaciones) if (s[0].toLowerCase() === t) return { x: s[1], y: s[2], nombre: s[0] };
    return null;
  }
  resumen() { return { ciudad: this.meta.ciudad, casillas: this.W + '×' + this.H, tile: this.tile, km: [(this.ancho / 1000).toFixed(1), (this.alto / 1000).toFixed(1)], capas: Object.keys(this.meta.capas) }; }
}
function caja(R) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const P of R) for (let i = 0; i < P.length; i += 2) { if (P[i] < x0) x0 = P[i]; if (P[i] > x1) x1 = P[i]; if (P[i + 1] < y0) y0 = P[i + 1]; if (P[i + 1] > y1) y1 = P[i + 1]; } return [x0, y0, x1, y1]; }
function dentroPol(P, x, y) { let d = false; const n = P.length / 2; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d; } return d; }
Object.assign(MC, { Mundo, TT, TT_NOMBRE, TT_SOLIDO, TT_SUPERFICIE, TT_CALLE, TT_URBANO, VIA, VIA_ANCHO, NIVEL_M, PISO_M, caja, dentroPol });

/* ---------- compatibilidad con el Motor del Valle 1.x (Valle / MotorValle) ----------
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
MC.ValleCompat = ValleCompat;

/* ---- js/11-red.js ---- */
/* =====================================================================
   RED · calles y ciclorrutas como grafo (nodos en los cruces, aristas con su curva real)
   Sirve para: rutas (A*), tráfico, el GPS, la panorámica (que sigue la vía) y Run en la ciclovía
   (que sigue la ciclorruta real y, en cada cruce, la que continúa).
   ===================================================================== */
class Trazo {
  /* p: Float32Array [x0,y0,x1,y1,…] en metros */
  constructor(p) { this.p = p instanceof Float32Array ? p : Float32Array.from(p); const n = this.p.length >> 1; this.cum = new Float32Array(Math.max(1, n)); let L = 0; for (let i = 1; i < n; i++) { L += Math.hypot(this.p[2 * i] - this.p[2 * i - 2], this.p[2 * i + 1] - this.p[2 * i - 1]); this.cum[i] = L; } this.largo = L; }
  /* punto, rumbo (rad, 0 = oriente) y curvatura (rad/m) a s metros del comienzo; lat: corrimiento a la derecha */
  at(s, lat = 0) {
    const P = this.p, C = this.cum, n = C.length; if (n < 2) return { x: P[0] || 0, y: P[1] || 0, a: 0, i: 0 };
    s = clamp(s, 0, this.largo); let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (C[m] <= s) lo = m; else hi = m; }
    const L = C[hi] - C[lo] || 1e-9, t = (s - C[lo]) / L, ax = P[2 * lo], ay = P[2 * lo + 1], bx = P[2 * hi], by = P[2 * hi + 1], a = Math.atan2(by - ay, bx - ax);
    return { x: ax + (bx - ax) * t - Math.sin(a) * lat, y: ay + (by - ay) * t + Math.cos(a) * lat, a, i: lo };
  }
  /* rumbo suavizado (mira ±d metros) y curvatura con signo (positiva = gira a la derecha, en pantalla con y hacia abajo) */
  rumbo(s, d = 8) { const a = this.at(Math.max(0, s - d)), b = this.at(Math.min(this.largo, s + d)); return Math.atan2(b.y - a.y, b.x - a.x); }
  curva(s, d = 12) { const a1 = this.rumbo(s - d, d), a2 = this.rumbo(s + d, d); return angDif(a1, a2) / (2 * d); }
  proyectar(x, y) {
    const P = this.p; let best = { d: 1e18, s: 0 };
    for (let i = 0; i + 3 < P.length; i += 2) { const ax = P[i], ay = P[i + 1], dx = P[i + 2] - ax, dy = P[i + 3] - ay, L2 = dx * dx + dy * dy || 1e-9, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (d < best.d) best = { d, s: this.cum[i >> 1] + t * Math.sqrt(L2) }; }
    return best;
  }
  static unir(trazos) { const o = []; for (const t of trazos) { const P = t.p || t; for (let i = 0; i < P.length; i += 2) { const n = o.length; if (n >= 2 && Math.abs(o[n - 2] - P[i]) < .01 && Math.abs(o[n - 1] - P[i + 1]) < .01) continue; o.push(P[i], P[i + 1]); } } return new Trazo(Float32Array.from(o)); }
}

class Red {
  /* vias: [{ k, nombre, ancho, p: Float32Array }] · op: { tipos: Set|null, junta: m para soldar vértices, une: m para unir puntas sueltas a una vía } */
  constructor(vias, op = {}) {
    const junta = op.junta || 2.5, une = op.une == null ? 7 : op.une, tipos = op.tipos || null;
    const V = vias.filter(v => (!tipos || tipos.has(v.k)) && v.p.length >= 4);
    const clave = (x, y) => Math.round(x / junta) * 1048576 + Math.round(y / junta);
    /* 1. cuántas veces se usa cada vértice: los compartidos y las puntas son nodos */
    const uso = new Map();
    for (const v of V) { const P = v.p, n = P.length >> 1; for (let i = 0; i < n; i++) { const k = clave(P[2 * i], P[2 * i + 1]); uso.set(k, (uso.get(k) || 0) + (i === 0 || i === n - 1 ? 2 : 1)); } }
    this.nodos = []; this.aristas = []; const idx = new Map();
    const nodo = (x, y) => { const k = clave(x, y); let i = idx.get(k); if (i === undefined) { i = this.nodos.length; idx.set(k, i); this.nodos.push({ i, x, y, ar: [] }); } return i; };
    const arista = (v, pts) => { if (pts.length < 4) return; const a = nodo(pts[0], pts[1]), b = nodo(pts[pts.length - 2], pts[pts.length - 1]); if (a === b && pts.length < 8) return; const t = new Trazo(Float32Array.from(pts)); if (t.largo < .5) return; const e = { i: this.aristas.length, a, b, t, largo: t.largo, k: v.k, nombre: v.nom || v.nombre || '', ancho: v.ancho || 6, via: v.i }; this.aristas.push(e); this.nodos[a].ar.push(e.i); if (b !== a) this.nodos[b].ar.push(e.i); };
    /* 2. se parte cada vía en sus nodos */
    for (const v of V) { const P = v.p, n = P.length >> 1; let cur = [P[0], P[1]]; for (let i = 1; i < n; i++) { cur.push(P[2 * i], P[2 * i + 1]); if (i === n - 1 || uso.get(clave(P[2 * i], P[2 * i + 1])) > 1) { arista(v, cur); cur = [P[2 * i], P[2 * i + 1]]; } } }
    /* 3. puntas sueltas que casi tocan otra vía: se unen partiendo esa vía (cruces en T sin vértice común) */
    if (une > 0) {
      this._indexar(); let unidas = 0;
      for (const N of this.nodos.slice()) {
        if (N.ar.length !== 1) continue; const propia = N.ar[0], c = this.cercana(N.x, N.y, une, e => e.i !== propia && e.a !== N.i && e.b !== N.i); if (!c) continue;
        const e = c.arista; if (c.s < 1 || c.s > e.largo - 1) { const otro = c.s < 1 ? e.a : e.b; this._enlazar(N.i, otro); unidas++; continue; }
        this._partir(e, c.s, N.i); unidas++;
      }
      this.unidas = unidas;
    }
    this._indexar();
  }
  /* un tramo corto que une dos nodos (punta suelta → nodo vecino) */
  _enlazar(a, b) { const A = this.nodos[a], B = this.nodos[b], t = new Trazo(Float32Array.of(A.x, A.y, B.x, B.y)), e0 = this.aristas[A.ar[0]] || {}; const e = { i: this.aristas.length, a, b, t, largo: t.largo, k: e0.k, nombre: e0.nombre || '', ancho: e0.ancho || 4, via: -1, union: true }; this.aristas.push(e); A.ar.push(e.i); B.ar.push(e.i); }
  /* parte la arista e en s y cuelga el nodo n (con un tramo corto) del punto de corte */
  _partir(e, s, n) {
    const P = e.t.p, C = e.t.cum, q = e.t.at(s), m = this.nodos.length; this.nodos.push({ i: m, x: q.x, y: q.y, ar: [] });
    const a1 = [], a2 = [q.x, q.y]; for (let i = 0; i < C.length; i++) { if (C[i] < s) a1.push(P[2 * i], P[2 * i + 1]); else a2.push(P[2 * i], P[2 * i + 1]); } a1.push(q.x, q.y);
    const B = this.nodos[e.b]; B.ar.splice(B.ar.indexOf(e.i), 1);
    e.t = new Trazo(Float32Array.from(a1)); e.largo = e.t.largo; e.b = m; this.nodos[m].ar.push(e.i);
    const t2 = new Trazo(Float32Array.from(a2)), e2 = { i: this.aristas.length, a: m, b: B.i, t: t2, largo: t2.largo, k: e.k, nombre: e.nombre, ancho: e.ancho, via: e.via }; this.aristas.push(e2); this.nodos[m].ar.push(e2.i); B.ar.push(e2.i);
    this._enlazar(n, m);
  }
  _indexar() {
    const G = this.G = new Map(), C = this.C = 100;
    for (const e of this.aristas) { const P = e.t.p; for (let j = 0; j + 3 < P.length; j += 2) { const x0 = Math.min(P[j], P[j + 2]), x1 = Math.max(P[j], P[j + 2]), y0 = Math.min(P[j + 1], P[j + 3]), y1 = Math.max(P[j + 1], P[j + 3]); for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const k = gx * 65536 + gy; let a = G.get(k); if (!a) G.set(k, a = []); a.push(e.i, j); } } }
  }
  /* la arista más cercana: { arista, s, d, x, y } */
  cercana(x, y, r = 40, filtro) {
    const G = this.G, C = this.C; let best = null, bd = r;
    for (let gy = Math.floor((y - r) / C); gy <= Math.floor((y + r) / C); gy++) for (let gx = Math.floor((x - r) / C); gx <= Math.floor((x + r) / C); gx++) {
      const a = G.get(gx * 65536 + gy); if (!a) continue;
      for (let q = 0; q < a.length; q += 2) { const e = this.aristas[a[q]]; if (filtro && !filtro(e)) continue; const P = e.t.p, j = a[q + 1], ax = P[j], ay = P[j + 1], dx = P[j + 2] - ax, dy = P[j + 3] - ay, L2 = dx * dx + dy * dy || 1e-9, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), px = ax + dx * t, py = ay + dy * t, d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = { arista: e, s: e.t.cum[j >> 1] + t * Math.sqrt(L2), d, x: px, y: py }; } }
    }
    return best;
  }
  /* rumbo con el que una arista SALE de un nodo */
  salida(e, n) { return n === e.a ? e.t.rumbo(Math.min(6, e.largo / 2), 4) : e.t.rumbo(Math.max(0, e.largo - Math.min(6, e.largo / 2)), 4) + Math.PI; }
  /* las salidas de un nodo vistas desde quien llega con rumbo ang: [{ arista, giro (rad, + derecha), hacia }] ordenadas de izquierda a derecha */
  opciones(n, ang, desde = -1) {
    const N = this.nodos[n], out = [];
    for (const i of N.ar) { if (i === desde && N.ar.length > 1) continue; const e = this.aristas[i]; out.push({ arista: e, giro: angDif(ang, this.salida(e, n)), hacia: e.a === n ? e.b : e.a, adelante: e.a === n }); }
    return out.sort((p, q) => p.giro - q.giro);
  }
  /* la salida que continúa: la de menor giro, prefiriendo el mismo tipo y el mismo nombre */
  continua(n, ang, desde, k, nombre) {
    let best = null, bv = 1e9;
    for (const o of this.opciones(n, ang, desde)) { if (o.arista.i === desde) continue; const v = Math.abs(o.giro) + (o.arista.k !== k ? .5 : 0) + (nombre && o.arista.nombre && o.arista.nombre !== nombre ? .25 : 0); if (v < bv) { bv = v; best = o; } }
    return best && Math.abs(best.giro) < 2.4 ? best : null;
  }
  /* camino más corto (A*) entre dos nodos: lista de { arista, adelante } */
  camino(a, b, filtro) {
    if (a === b) return []; const N = this.nodos, h = i => Math.hypot(N[i].x - N[b].x, N[i].y - N[b].y), g = new Float64Array(N.length).fill(Infinity), de = new Int32Array(N.length).fill(-1), abiertos = [[h(a), a]];
    g[a] = 0; const cerr = new Uint8Array(N.length);
    while (abiertos.length) {
      let mi = 0; for (let i = 1; i < abiertos.length; i++) if (abiertos[i][0] < abiertos[mi][0]) mi = i; const [, u] = abiertos.splice(mi, 1)[0];
      if (u === b) break; if (cerr[u]) continue; cerr[u] = 1;
      for (const ei of N[u].ar) { const e = this.aristas[ei]; if (filtro && !filtro(e)) continue; const v = e.a === u ? e.b : e.a, ng = g[u] + e.largo; if (ng < g[v]) { g[v] = ng; de[v] = ei; abiertos.push([ng + h(v), v]); } }
      if (abiertos.length > 60000) break;
    }
    if (de[b] < 0) return null; const R = []; for (let v = b; v !== a;) { const e = this.aristas[de[v]], u = e.a === v ? e.b : e.a; R.push({ arista: e, adelante: e.a === u }); v = u; } return R.reverse();
  }
  /* componentes conexas (para medir la red) */
  componentes() { const c = new Int32Array(this.nodos.length).fill(-1); let k = 0; const tam = []; for (let s = 0; s < c.length; s++) { if (c[s] >= 0) continue; let n = 0; const pila = [s]; c[s] = k; while (pila.length) { const u = pila.pop(); n++; for (const ei of this.nodos[u].ar) { const e = this.aristas[ei], v = e.a === u ? e.b : e.a; if (c[v] < 0) { c[v] = k; pila.push(v); } } } tam.push(n); k++; } return { n: k, tam: tam.sort((a, b) => b - a) }; }
}

/* ---------- un recorrido que sigue la red sin fin (Run, panorámica, paseo guiado) ----------
   Arranca en la arista más cercana con el rumbo dado y se va alargando: en cada cruce toma la que continúa
   (o la que el jugador elija). Guarda los cruces con sus opciones para que el juego ponga esquinas reales. */
class Recorrido {
  constructor(red, x, y, ang, op = {}) {
    this.red = red; this.op = op; const c = red.cercana(x, y, op.radio || 60, op.filtro); if (!c) throw new Error('no hay vía cerca');
    const e = c.arista, adelante = Math.abs(angDif(ang, e.t.rumbo(c.s))) < Math.PI / 2;
    this.pts = []; this.cruces = []; this.tramos = []; this.largo = 0;
    this._tramo(e, adelante, c.s);
  }
  _tramo(e, adelante, desdeS = null) {
    const P = e.t.p, n = P.length >> 1, C = e.t.cum, o = this.pts, base = this.largo;
    const add = (x, y) => { const m = o.length; if (m >= 2) { const d = Math.hypot(x - o[m - 2], y - o[m - 1]); if (d < .05) return; this.largo += d; } o.push(x, y); };
    if (adelante) { if (desdeS != null) { const q = e.t.at(desdeS); add(q.x, q.y); } for (let i = 0; i < n; i++) if (desdeS == null || C[i] > desdeS) add(P[2 * i], P[2 * i + 1]); }
    else { if (desdeS != null) { const q = e.t.at(desdeS); add(q.x, q.y); } for (let i = n - 1; i >= 0; i--) if (desdeS == null || C[i] < desdeS) add(P[2 * i], P[2 * i + 1]); }
    this.tramos.push({ arista: e, adelante, s0: base, s1: this.largo }); this._t = null;
    this.fin = adelante ? e.b : e.a;
  }
  get trazo() { return this._t || (this._t = new Trazo(Float32Array.from(this.pts))); }
  /* alarga hasta tener al menos `hasta` metros; `elegir(opciones, cruce)` puede escoger la salida (si no, la que continúa) */
  alargar(hasta, elegir) {
    let guard = 0;
    while (this.largo < hasta && guard++ < 400) {
      const T = this.tramos[this.tramos.length - 1], e = T.arista, ang = this.trazo.rumbo(this.largo - 1, 3);
      const ops = this.red.opciones(this.fin, ang, e.i).filter(o => o.arista.i !== e.i && (!this.op.filtro || this.op.filtro(o.arista)));
      let o = null; const cruce = { s: this.largo, nodo: this.fin, opciones: ops.map(q => ({ giro: q.giro, nombre: q.arista.nombre, k: q.arista.k })) };
      if (elegir) o = elegir(ops, cruce);
      if (!o) o = this.red.continua(this.fin, ang, e.i, e.k, e.nombre);
      if (!o || (this.op.filtro && !this.op.filtro(o.arista))) { this.cerrado = true; break; }
      cruce.tomada = { giro: o.giro, nombre: o.arista.nombre, k: o.arista.k }; if (ops.length > 1 || Math.abs(o.giro) > .5) this.cruces.push(cruce);
      this._tramo(o.arista, o.adelante);
    }
    return this;
  }
  /* olvida lo que quedó muy atrás (para correr sin fin sin gastar memoria): conserva desde s - margen */
  podar(s, margen = 300) { const corte = s - margen; if (corte < 600) return 0; const T = this.trazo, q = T.at(corte), i = q.i, quitar = T.cum[i]; this.pts = this.pts.slice(2 * i); this.largo -= quitar; for (const t of this.tramos) { t.s0 -= quitar; t.s1 -= quitar; } this.tramos = this.tramos.filter(t => t.s1 > 0); for (const c of this.cruces) c.s -= quitar; this.cruces = this.cruces.filter(c => c.s > -50); this._t = null; return quitar; }
  tramoEn(s) { for (const t of this.tramos) if (s >= t.s0 && s <= t.s1) return t; return this.tramos[this.tramos.length - 1]; }
}
Object.assign(MC, { Trazo, Red, Recorrido });

/* redes del mundo, hechas una vez y guardadas: 'ciclo' (ciclorrutas), 'calles' (para carros), 'peaton' (todo menos autopista), 'todo' */
Mundo.prototype.red = function (cual = 'calles') {
  this._redes = this._redes || {}; if (this._redes[cual]) return this._redes[cual];
  const T = { ciclo: new Set([VIA.CICLO]), calles: new Set([VIA.CALLE, VIA.AVENIDA, VIA.AUTOPISTA, VIA.CARRERA]), peaton: new Set([VIA.CALLE, VIA.AVENIDA, VIA.CARRERA, VIA.CICLO, VIA.PEATONAL, VIA.ESCALAS, VIA.SENDERO]), rueda: new Set([VIA.CALLE, VIA.AVENIDA, VIA.CARRERA, VIA.CICLO, VIA.PEATONAL]), todo: null }[cual];
  return (this._redes[cual] = new Red(this.vias(), { tipos: T, une: cual === 'ciclo' ? 9 : 6 }));
};

/* ---- js/20-tiempo.js ---- */
/* =====================================================================
   TIEMPO DEL MUNDO · reloj, calendario colombiano (festivos de la Ley Emiliani), cielo por hora,
   sol y luna (posición astronómica para la latitud de la ciudad) y clima.
   Las mismas reglas para todos los juegos: a la misma fecha y hora, el mismo cielo y el mismo clima.
   ===================================================================== */
const Calendario = {
  pascua(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mes - 1, dia); },
  _cache: new Map(),
  /* festivos de Colombia del año: { 'aaaa-mm-dd': nombre } */
  festivos(y) {
    if (this._cache.has(y)) return this._cache.get(y);
    const F = {}, f = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const fijo = (m, d, n) => { F[f(new Date(y, m - 1, d))] = n; };
    const lunes = (d, n) => { const w = d.getDay(), k = w === 1 ? 0 : (8 - w) % 7; F[f(new Date(d.getFullYear(), d.getMonth(), d.getDate() + k))] = n; };
    fijo(1, 1, 'Año Nuevo'); fijo(5, 1, 'Día del Trabajo'); fijo(7, 20, 'Día de la Independencia'); fijo(8, 7, 'Batalla de Boyacá'); fijo(12, 8, 'Inmaculada Concepción'); fijo(12, 25, 'Navidad');
    for (const [m, d, n] of [[1, 6, 'Reyes Magos'], [3, 19, 'San José'], [6, 29, 'San Pedro y San Pablo'], [8, 15, 'Asunción de la Virgen'], [10, 12, 'Día de la Raza'], [11, 1, 'Todos los Santos'], [11, 11, 'Independencia de Cartagena']]) lunes(new Date(y, m - 1, d), n);
    const P = this.pascua(y), mas = k => new Date(y, P.getMonth(), P.getDate() + k);
    F[f(mas(-3))] = 'Jueves Santo'; F[f(mas(-2))] = 'Viernes Santo'; F[f(mas(43))] = 'Ascensión del Señor'; F[f(mas(64))] = 'Corpus Christi'; F[f(mas(71))] = 'Sagrado Corazón';
    this._cache.set(y, F); return F;
  },
  festivo(d) { const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); return this.festivos(d.getFullYear())[k] || null; },
  domingoOFestivo(d) { return d.getDay() === 0 || !!this.festivo(d); },
  diaDelAño(d) { return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); },
  /* fiestas de la ciudad (cada juego puede sumar las suyas) */
  fiestas: [
    { id: 'flores', nombre: 'Feria de las Flores', desde: [8, 1], hasta: [8, 10] },
    { id: 'alumbrados', nombre: 'Alumbrados navideños', desde: [12, 1], hasta: [1, 7] },
    { id: 'velitas', nombre: 'Noche de las velitas', desde: [12, 7], hasta: [12, 7] }
  ],
  fiestasEn(d) { const m = d.getMonth() + 1, dd = d.getDate(), v = m * 100 + dd; return this.fiestas.filter(F => { const a = F.desde[0] * 100 + F.desde[1], b = F.hasta[0] * 100 + F.hasta[1]; return a <= b ? v >= a && v <= b : v >= a || v <= b; }); }
};

/* ---------- reloj del juego: minutos del día (0–1440) que avanzan a la velocidad elegida ---------- */
class Reloj {
  constructor(op = {}) { const d = op.fecha ? new Date(op.fecha) : new Date(); this.fecha = new Date(d.getFullYear(), d.getMonth(), d.getDate()); this.min = op.min != null ? op.min : d.getHours() * 60 + d.getMinutes(); this.vel = op.vel != null ? op.vel : 1; this.pausa = false; }
  /* dt en segundos reales; vel = minutos de juego por segundo real (1 = un minuto por segundo) */
  avanzar(dt) { if (this.pausa) return; this.min += dt * this.vel; while (this.min >= 1440) { this.min -= 1440; this.fecha = new Date(this.fecha.getFullYear(), this.fecha.getMonth(), this.fecha.getDate() + 1); MC.emit('dia', this.fecha); } }
  get hora() { return this.min / 60; }
  get dia() { return this.fecha.getDay(); }
  get domingo() { return Calendario.domingoOFestivo(this.fecha); }
  get festivo() { return Calendario.festivo(this.fecha); }
  texto() { const h = Math.floor(this.min / 60) % 24, m = Math.floor(this.min % 60), h12 = ((h + 11) % 12) + 1; return h12 + ':' + String(m).padStart(2, '0') + (h < 12 ? ' a. m.' : ' p. m.'); }
  /* segundos desde la medianoche: la referencia común de horarios (transporte, semáforos) */
  get seg() { return this.min * 60; }
}

/* ---------- cielo: colores por hora, sol y luna ---------- */
const CIELO_KF = [   // hora, cénit, horizonte, bruma (0..1)
  [0, [.03, .05, .13], [.08, .1, .2], [.1, .12, .2]], [4.6, [.05, .07, .17], [.12, .13, .25], [.14, .15, .24]],
  [5.6, [.2, .25, .45], [.85, .55, .45], [.6, .5, .5]], [6.4, [.35, .55, .85], [.98, .8, .6], [.8, .75, .7]],
  [8, [.32, .58, .92], [.72, .84, .95], [.78, .84, .9]], [12, [.27, .55, .93], [.68, .82, .96], [.78, .85, .92]],
  [16.5, [.3, .55, .9], [.75, .82, .92], [.8, .84, .9]], [17.8, [.32, .42, .72], [.98, .66, .42], [.86, .66, .52]],
  [18.4, [.2, .22, .45], [.86, .42, .36], [.55, .36, .38]], [19.2, [.07, .09, .22], [.25, .2, .35], [.2, .18, .28]], [24, [.03, .05, .13], [.08, .1, .2], [.1, .12, .2]]
];
const Cielo = {
  /* la posición del sol: altura y acimut (rad) para la latitud de la ciudad (6,24° N en el valle) */
  sol(fecha, hora, lat = 6.24) {
    const n = Calendario.diaDelAño(fecha), dec = -23.44 * Math.PI / 180 * Math.cos(TAU / 365 * (n + 10)), H = (hora - 12) * 15 * Math.PI / 180, la = lat * Math.PI / 180;
    const alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H));
    const az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(la) - Math.sin(la) * Math.cos(H));   // desde el norte, en sentido horario
    return { alt, az, x: Math.sin(az) * Math.cos(alt), y: -Math.cos(az) * Math.cos(alt), z: Math.sin(alt) };   // x oriente, y sur (como el mapa), z arriba
  },
  /* luna: aproximación (fase por el ciclo sinódico y medio día corrido del sol) */
  luna(fecha, hora) { const ref = Date.UTC(2000, 0, 6, 18, 14), dias = (fecha.getTime() + hora * 36e5 - ref) / 864e5, fase = ((dias / 29.530588) % 1 + 1) % 1, s = this.sol(fecha, (hora - fase * 24 + 48) % 24); return Object.assign(s, { fase }); },
  /* colores y luces a esta hora: { top, hor, bruma, dia (0..1), noche (0..1), sol, luna, ambiente, luzSol } */
  en(fecha, hora, clima) {
    let i = 0; while (i < CIELO_KF.length - 2 && CIELO_KF[i + 1][0] <= hora) i++;
    const a = CIELO_KF[i], b = CIELO_KF[i + 1], t = suave((hora - a[0]) / (b[0] - a[0] || 1));
    let top = mez3(a[1], b[1], t), hor = mez3(a[2], b[2], t), bruma = mez3(a[3], b[3], t);
    const s = this.sol(fecha, hora), dia = clamp((s.alt + .1) / .35, 0, 1), noche = clamp((-s.alt - .02) / .2, 0, 1);
    if (clima) { const nub = clima.nubes * .6 + clima.lluvia * .4, gris = mez3([.55, .58, .62], [.12, .13, .17], noche); top = mez3(top, gris, nub * .7); hor = mez3(hor, mez3(gris, [1, 1, 1], .15), nub * .6); bruma = mez3(bruma, gris, nub * .5 + clima.niebla * .4); }
    const nubes = clima ? clima.nubes : .2;
    return { top, hor, bruma, dia, noche, sol: s, luna: this.luna(fecha, hora), ambiente: .28 + .62 * dia * (1 - nubes * .35), luzSol: dia * (1 - nubes * .6), atardecer: clamp(1 - Math.abs(hora - 18) / .9, 0, 1) + clamp(1 - Math.abs(hora - 6) / .8, 0, 1) };
  }
};

/* ---------- clima: el mismo para todos a la misma fecha y hora ----------
   Se decide por bloques de 3 h con un azar fijo (fecha + bloque) y la probabilidad del mes y de la hora;
   entre bloques se pasa suave. Un juego puede forzarlo (clima.forzar('lluvia')). */
class Clima {
  constructor(cfg) { this.cfg = (cfg && cfg.clima) || { lluvia_mes: Array(12).fill(.35), hora_lluvia: [14, 19], temp_media_c: 22, amplitud_c: 6 }; this.forzado = null; this.lluvia = 0; this.nubes = .2; this.niebla = 0; this.viento = { v: 2, dir: 0 }; this.tormenta = 0; this.rayo = 0; this.temp = 22; this.tipo = 'despejado'; }
  _bloque(fecha, b) {
    const sem = (fecha.getFullYear() * 400 + fecha.getMonth() * 32 + fecha.getDate()) * 8 + b, r = h2(sem, 7, 77), r2 = h2(sem, 9, 78), C = this.cfg;
    const pm = C.lluvia_mes[fecha.getMonth()], hc = (b * 3 + 1.5 >= C.hora_lluvia[0] && b * 3 + 1.5 <= C.hora_lluvia[1] + 1) ? 1.6 : b * 3 < 6 ? .6 : .8, p = clamp(pm * hc * .55, 0, .9);
    if (r < p * .25) return { tipo: 'tormenta', lluvia: .95, nubes: 1, niebla: .2, tormenta: 1, viento: 7 };
    if (r < p) return { tipo: 'lluvia', lluvia: .45 + r2 * .35, nubes: .9, niebla: .1, tormenta: 0, viento: 4 };
    if (r < p + .2) return { tipo: 'nublado', lluvia: 0, nubes: .65 + r2 * .25, niebla: b < 3 ? .35 : .05, tormenta: 0, viento: 3 };
    if (b <= 2 && r2 < .35) return { tipo: 'niebla', lluvia: 0, nubes: .4, niebla: .6, tormenta: 0, viento: 1 };
    return { tipo: 'despejado', lluvia: 0, nubes: .1 + r2 * .25, niebla: 0, tormenta: 0, viento: 2 };
  }
  forzar(tipo) { this.forzado = tipo || null; }
  /* actualiza con la fecha y la hora del reloj; dt para suavizar y para los rayos */
  actualizar(reloj, dt = 0) {
    const h = reloj.hora, b = Math.floor(h / 3) % 8, f = (h % 3) / 3;
    const A = this.forzado ? this._forzado(this.forzado) : this._bloque(reloj.fecha, b), B = this.forzado ? A : this._bloque(b === 7 ? new Date(reloj.fecha.getFullYear(), reloj.fecha.getMonth(), reloj.fecha.getDate() + 1) : reloj.fecha, (b + 1) % 8);
    const k = f > .8 ? suave((f - .8) / .2) : 0, ob = { lluvia: lerp(A.lluvia, B.lluvia, k), nubes: lerp(A.nubes, B.nubes, k), niebla: lerp(A.niebla, B.niebla, k), tormenta: lerp(A.tormenta, B.tormenta, k), viento: lerp(A.viento, B.viento, k) };
    const s = dt > 0 ? Math.min(1, dt * .8) : 1;
    this.lluvia = lerp(this.lluvia, ob.lluvia, s); this.nubes = lerp(this.nubes, ob.nubes, s); this.niebla = lerp(this.niebla, ob.niebla, s); this.tormenta = lerp(this.tormenta, ob.tormenta, s);
    this.viento.v = lerp(this.viento.v, ob.viento + Math.sin(reloj.min * .7) * 1.2, s); this.viento.dir = h2(reloj.fecha.getDate(), b, 5) * TAU;
    this.tipo = k > .5 ? B.tipo : A.tipo;
    this.temp = this.cfg.temp_media_c + this.cfg.amplitud_c * Math.sin((h - 9) / 24 * TAU) * .5 - this.lluvia * 3;
    if (this.tormenta > .5 && dt > 0) { this.rayo = Math.max(0, this.rayo - dt * 4); if (Math.random() < dt * .12 * this.tormenta) { this.rayo = 1; MC.emit('rayo', this); } } else this.rayo = 0;
    return this;
  }
  _forzado(t) { return { despejado: { tipo: t, lluvia: 0, nubes: .15, niebla: 0, tormenta: 0, viento: 2 }, nublado: { tipo: t, lluvia: 0, nubes: .85, niebla: .05, tormenta: 0, viento: 3 }, lluvia: { tipo: t, lluvia: .7, nubes: .95, niebla: .1, tormenta: 0, viento: 4 }, tormenta: { tipo: t, lluvia: 1, nubes: 1, niebla: .2, tormenta: 1, viento: 8 }, niebla: { tipo: t, lluvia: 0, nubes: .5, niebla: .75, tormenta: 0, viento: 1 } }[t] || this._bloque(new Date(), 4); }
  texto() { return { despejado: '☀️ Despejado', nublado: '☁️ Nublado', lluvia: '🌧️ Lluvia', tormenta: '⛈️ Tormenta', niebla: '🌫️ Niebla' }[this.tipo] + ' · ' + Math.round(this.temp) + ' °C'; }
}
Object.assign(MC, { Calendario, Reloj, Cielo, Clima });

/* ---- js/21-trafico.js ---- */
/* =====================================================================
   TRÁFICO Y SEMÁFOROS · carros, taxis amarillos, motos, busetas, ciclistas y peatones alrededor del jugador
   sobre la red real de calles, con semáforos reales (los de la capa de tráfico) que cambian con el reloj del mundo.
   Determinista en los semáforos (la fase sale del segundo del día); los agentes nacen y mueren cerca de la cámara.
   ===================================================================== */
const TRAF_TIPOS = {
  carro: { v: 11, largo: 4.4, ancho: 1.8, colores: ['#e9eef3', '#c9ced6', '#9aa3ad', '#1d1f24', '#c43a26', '#2a5a92', '#3d6b3a', '#d98a3a', '#e9eef3', '#7f8891'] },
  taxi: { v: 12, largo: 4.2, ancho: 1.7, colores: ['#f2c400'] },
  moto: { v: 13, largo: 2.0, ancho: .8, colores: ['#1d1f24', '#c43a26', '#2a5a92', '#e9eef3', '#f07a1a'] },
  buseta: { v: 9, largo: 9.5, ancho: 2.4, colores: ['#e9eef3', '#2e9d55', '#e7b531', '#d8432f', '#3a7bd5'] },
  camion: { v: 8, largo: 8, ancho: 2.4, colores: ['#e9eef3', '#d98a3a', '#3a7bd5'] },
  bici: { v: 5, largo: 1.8, ancho: .6, colores: ['#9bd341', '#29b6f6', '#ff7043', '#ec407a', '#1d1f24'] }
};
const TRAF_MEZCLA = [['carro', 46], ['taxi', 18], ['moto', 24], ['buseta', 6], ['camion', 3], ['bici', 5]];
class Trafico {
  constructor(mundo, op = {}) {
    this.mundo = mundo; this.nombreRed = op.red || 'rueda'; this.n = op.n || 40; this.np = op.peatones || 30; this.radio = op.radio || 380; this.agentes = []; this.peatones = []; this.az = new Azar(op.semilla || 7); this._luces = null; this.ciclo = 60;
  }
  get red() { return this.mundo.red(this.nombreRed); }
  /* semáforos: cada punto de la capa se pega al cruce más cercano; su fase sale del nodo (siempre igual) */
  luces() {
    if (this._luces) return this._luces; const R = this.red, L = this._luces = new Map();
    for (const [x, y] of this.mundo.trafico.semaforos) {
      let best = -1, bd = 30; const c = R.cercana(x, y, 30); if (!c) continue;
      for (const n of [c.arista.a, c.arista.b]) { const N = R.nodos[n], d = Math.hypot(N.x - x, N.y - y); if (d < bd && N.ar.length >= 3) { bd = d; best = n; } }
      if (best < 0 || L.has(best)) continue; const N = R.nodos[best], e0 = R.aristas[N.ar[0]];
      L.set(best, { nodo: best, x: N.x, y: N.y, eje: R.salida(e0, best), fase: h2(best, 3, 11) * this.ciclo });
    }
    return L;
  }
  /* luz que ve quien llega al nodo con rumbo ang: 'verde' | 'amarillo' | 'rojo' | null (sin semáforo) */
  luz(nodo, ang, seg) {
    const S = this.luces().get(nodo); if (!S) return null;
    const p = ((seg + S.fase) % this.ciclo + this.ciclo) % this.ciclo, ejeA = Math.abs(Math.cos(angDif(S.eje, ang))) > .7071, m = this.ciclo / 2;
    const q = ejeA ? p : (p + m) % this.ciclo; return q < m - 4 ? 'verde' : q < m ? 'amarillo' : 'rojo';
  }
  _tipo() { let t = this.az.f() * 102, i = 0; while (i < TRAF_MEZCLA.length - 1 && (t -= TRAF_MEZCLA[i][1]) > 0) i++; return TRAF_MEZCLA[i][0]; }
  _nacer(cx, cy, lejos) {
    const R = this.red, a = this.az.f() * TAU, d = lejos ? this.radio * (.75 + this.az.f() * .25) : this.radio * Math.sqrt(this.az.f()), c = R.cercana(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 120);
    if (!c) return null; const e = c.arista; if (e.k === VIA.CICLO || e.k === VIA.PEATONAL) return null;
    const tipo = e.k === VIA.AUTOPISTA && this.az.f() < .3 ? 'camion' : this._tipo(), T = TRAF_TIPOS[tipo];
    return { tipo, e, s: c.s, dir: this.az.f() < .5 ? 1 : -1, v: T.v * (.6 + this.az.f() * .3), vmax: T.v * (e.k === VIA.AUTOPISTA ? 1.6 : e.k === VIA.AVENIDA ? 1.25 : 1) * (.85 + this.az.f() * .3), color: this.az.uno(T.colores), largo: T.largo, ancho: T.ancho, x: c.x, y: c.y, a: 0, frena: 0, id: this.az.e(1, 1e9) };
  }
  /* un paso de la simulación alrededor de (cx, cy) a la hora seg */
  paso(dt, cx, cy, seg, calidad = 1) {
    const R = this.red, nObj = Math.round(this.n * calidad), A = this.agentes;
    for (let i = A.length - 1; i >= 0; i--) if (Math.hypot(A[i].x - cx, A[i].y - cy) > this.radio * 1.35) A.splice(i, 1);
    let intentos = 0; while (A.length < nObj && intentos++ < 30) { const g = this._nacer(cx, cy, A.length > nObj * .5); if (g) A.push(g); }
    /* el de adelante en la misma arista y el mismo sentido */
    const grupos = new Map(); for (const g of A) { const k = g.e.i * 2 + (g.dir > 0 ? 1 : 0); (grupos.get(k) || grupos.set(k, []).get(k)).push(g); }
    for (const L of grupos.values()) { L.sort((p, q) => (p.s - q.s) * p.dir); for (let i = 0; i < L.length; i++) L[i].delante = L[i + 1] || null; }
    for (const g of A) {
      const e = g.e, finS = g.dir > 0 ? e.largo : 0, falta = Math.abs(finS - g.s), nodo = g.dir > 0 ? e.b : e.a;
      let objetivo = g.vmax;
      if (g.delante) { const hueco = Math.abs(g.delante.s - g.s) - (g.largo + g.delante.largo) / 2; objetivo = Math.min(objetivo, Math.max(0, (hueco - 2.5) * 1.2)); }
      if (falta < 26) { const luz = this.luz(nodo, e.t.rumbo(g.dir > 0 ? e.largo - 1 : 1) + (g.dir > 0 ? 0 : Math.PI), seg); if (luz === 'rojo' || (luz === 'amarillo' && falta > 8)) objetivo = Math.min(objetivo, Math.max(0, (falta - 4) * .8)); }
      g.v += clamp(objetivo - g.v, -7 * dt, 3 * dt); g.v = Math.max(0, g.v); g.frena = objetivo < g.v - .5 ? 1 : 0;
      g.s += g.v * dt * g.dir;
      if ((g.dir > 0 && g.s >= e.largo) || (g.dir < 0 && g.s <= 0)) {
        const ang = e.t.rumbo(g.dir > 0 ? e.largo - .5 : .5) + (g.dir > 0 ? 0 : Math.PI), ops = R.opciones(nodo, ang, e.i).filter(o => o.arista.k !== VIA.CICLO && o.arista.k !== VIA.PEATONAL && Math.abs(o.giro) < 2.3);
        if (!ops.length) { g.dir = -g.dir; g.s = clamp(g.s, 0, e.largo); continue; }
        const rect = ops.filter(o => Math.abs(o.giro) < .5), o = rect.length && this.az.f() < .6 ? rect[0] : this.az.uno(ops), sobra = Math.abs(g.s - finS);
        g.e = o.arista; g.dir = o.adelante ? 1 : -1; g.s = o.adelante ? sobra : o.arista.largo - sobra;
      }
      const q = g.e.t.at(g.s, (g.e.ancho / 4 + .3) * g.dir); g.x = q.x; g.y = q.y; g.a = q.a + (g.dir > 0 ? 0 : Math.PI);
    }
    this._peatones(dt, cx, cy, calidad);
    return A;
  }
  _peatones(dt, cx, cy, calidad) {
    const P = this.peatones, n = Math.round(this.np * calidad), R = this.red;
    for (let i = P.length - 1; i >= 0; i--) if (Math.hypot(P[i].x - cx, P[i].y - cy) > this.radio) P.splice(i, 1);
    let k = 0; while (P.length < n && k++ < 20) { const a = this.az.f() * TAU, d = this.radio * Math.sqrt(this.az.f()), c = R.cercana(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 80); if (!c || c.arista.k === VIA.AUTOPISTA) continue; P.push({ e: c.arista, s: c.s, dir: this.az.f() < .5 ? 1 : -1, lado: this.az.f() < .5 ? 1 : -1, v: 1.1 + this.az.f() * .5, semilla: this.az.e(1, 1e6), x: c.x, y: c.y, a: 0, fase: this.az.f() * 10 }); }
    for (const p of P) {
      p.s += p.v * dt * p.dir; p.fase += dt * p.v * 1.8;
      if (p.s > p.e.largo || p.s < 0) { const nodo = p.s > p.e.largo ? p.e.b : p.e.a, ops = R.opciones(nodo, 0, p.e.i).filter(o => o.arista.k !== VIA.AUTOPISTA); if (!ops.length) { p.dir = -p.dir; p.s = clamp(p.s, 0, p.e.largo); } else { const o = this.az.uno(ops); p.e = o.arista; p.dir = o.adelante ? 1 : -1; p.s = o.adelante ? 0 : o.arista.largo; } }
      const q = p.e.t.at(p.s, (p.e.ancho / 2 + 1.4) * p.lado); p.x = q.x; p.y = q.y; p.a = q.a + (p.dir > 0 ? 0 : Math.PI);
    }
  }
  cercanos(x, y, r) { return this.agentes.filter(g => Math.abs(g.x - x) < r && Math.abs(g.y - y) < r); }
}
Object.assign(MC, { Trafico, TRAF_TIPOS });

/* ---- js/22-transporte.js ---- */
/* =====================================================================
   TRANSPORTE CON HORARIO · metro, tranvía, Metroplús, alimentadores y Metrocables
   Determinista: la posición de cada tren sale solo de la fecha y la hora (segundos desde la medianoche),
   así que El Metro, Juega EnCicla y cualquier juego ven el mismo tren en el mismo lugar a la misma hora.
   Horario real: lunes a sábado 4:30 a. m. – 11 p. m.; domingos y festivos 5 a. m. – 10 p. m.
   ===================================================================== */
class Transporte {
  constructor(mundo, cfg) {
    this.mundo = mundo; this.cfg = (cfg && cfg.transporte) || {}; this.lineas = []; this._dia = null;
    const CL = this.cfg.clases || {};
    for (const l of mundo.transporte.lineas) {
      if (l.estado && !/operativa/i.test(l.estado)) continue; const C = CL[l.clase]; if (!C) continue;
      let eje = l.eje && l.eje.length >= 4 ? l.eje : null;
      if (l.clase === 'cable' || !eje) eje = l.estaciones.flatMap(s => [s[1], s[2]]);   // cables: en línea recta de estación a estación
      if (eje.length < 4) continue;
      const T = new Trazo(Float32Array.from(eje)), est = l.estaciones.map(s => ({ nombre: s[0], s: T.proyectar(s[1], s[2]).s })).sort((a, b) => a.s - b.s);
      const L = { id: l.id, nombre: l.nombre, clase: l.clase, color: l.color, T, est, C };
      if (l.clase !== 'cable') {   // perfil de tiempo de un viaje en cada sentido: marcha de crucero con arranque y frenado, y parada en cada estación
        L.perfil = {};
        for (const dir of [1, -1]) {
          const u = (dir > 0 ? est.map(e => e.s) : est.map(e => T.largo - e.s).reverse()), tiempos = [0], nombres = dir > 0 ? est.map(e => e.nombre) : est.map(e => e.nombre).reverse(); let t = 0;
          for (let i = 1; i < u.length; i++) { t += C.parada_s + (u[i] - u[i - 1]) / C.vel_ms + 12; tiempos.push(t); }
          L.perfil[dir] = { u, tiempos, nombres, viaje: t + C.parada_s };
        }
        L.viaje = Math.max(L.perfil[1].viaje, L.perfil[-1].viaje);
      }
      this.lineas.push(L);
    }
  }
  /* ventana de servicio y frecuencia (segundos) para el día y la hora */
  servicio(fecha) { const dom = Calendario.domingoOFestivo(fecha), V = this.cfg.servicio || { habil: [270, 1380], domingo: [300, 1320] }; return (dom ? V.domingo : V.habil).map(m => m * 60); }
  frecuencia(L, seg, fecha) { const C = L.C, m = seg / 60; if (Calendario.domingoOFestivo(fecha)) return C.frec_domingo_s; return (this.cfg.pico || []).some(([a, b]) => m >= a && m < b) ? C.frec_pico_s : C.frec_valle_s; }
  /* salidas del día desde cada punta (caché por día) */
  _salidas(L, fecha) {
    const k = fecha.toDateString(); if (this._dia !== k) { this._dia = k; this._sal = new Map(); }
    let S = this._sal.get(L.id); if (S) return S; const [a, b] = this.servicio(fecha); S = [];
    for (let t = a; t <= b - L.viaje * .5; t += this.frecuencia(L, t, fecha)) S.push(t);
    this._sal.set(L.id, S); return S;
  }
  /* dónde va un tren t segundos después de salir de su punta: { u (metros desde la punta), parado, i (estación) } */
  _pos(Pf, C, dt) {
    const T = Pf.tiempos, U = Pf.u; if (dt >= Pf.viaje) return null;
    let i = 0; while (i < T.length - 1 && T[i + 1] <= dt) i++;
    const q = dt - T[i]; if (q < C.parada_s || i === U.length - 1) return { u: U[i], parado: true, i };
    const dur = T[i + 1] - T[i] - C.parada_s, f = clamp((q - C.parada_s) / dur, 0, 1), g = f < .15 ? (f * f) / (.15 * 2 * .85) : f > .85 ? 1 - ((1 - f) * (1 - f)) / (.15 * 2 * .85) : (f - .075) / .85;
    return { u: lerp(U[i], U[i + 1], clamp(g, 0, 1)), parado: false, i };
  }
  /* todos los vehículos en servicio ahora (o solo los que caen en la caja [x0,y0,x1,y1]) */
  vehiculos(fecha, seg, caja) {
    const out = [], [a, b] = this.servicio(fecha);
    for (const L of this.lineas) {
      if (caja && (L.T.p.length && !this._toca(L, caja))) continue;
      if (L.clase === 'cable') { if (seg < a || seg > b + 1800) continue; this._cabinas(L, seg, out, caja); continue; }
      const S = this._salidas(L, fecha);
      for (const dir of [1, -1]) for (let k = S.length - 1; k >= 0; k--) {
        const Pf = L.perfil[dir], dep = S[k] + (dir < 0 ? L.C.parada_s * .5 : 0), dt = seg - dep; if (dt < 0) continue; if (dt >= L.viaje) break;
        const p = this._pos(Pf, L.C, dt); if (!p) continue; const s = dir > 0 ? p.u : L.T.largo - p.u, q = L.T.at(s), a2 = dir > 0 ? q.a : q.a + Math.PI;
        if (caja && (q.x < caja[0] || q.x > caja[2] || q.y < caja[1] || q.y > caja[3])) continue;
        const nv = this.mundo.nivel(q.x, q.y);
        out.push({ id: L.id + (dir > 0 ? '+' : '-') + k, linea: L.id, clase: L.clase, color: L.color, x: q.x, y: q.y, a: a2, z: L.clase === 'metro' && nv > 0 ? nv * NIVEL_M + 1 : 0, s, dir, largo: L.C.largo_m || 12, parado: p.parado, estacion: p.parado ? Pf.nombres[p.i] : null });
      }
    }
    return out;
  }
  _toca(L, c) { if (!L._caja) L._caja = caja([L.T.p]); const k = L._caja; return k[2] >= c[0] - 200 && k[0] <= c[2] + 200 && k[3] >= c[1] - 200 && k[1] <= c[3] + 200; }
  /* Metrocable: cabinas cada `cabina_cada_s` en los dos sentidos, a la altura del cable (baja en las estaciones) */
  _cabinas(L, seg, out, cj) {
    const C = L.C, paso = C.vel_ms * C.cabina_cada_s, len = L.T.largo, H = C.altura_m || 28;
    for (const dir of [1, -1]) {
      const fase = (seg * C.vel_ms + (dir < 0 ? paso / 2 : 0)) % paso;
      for (let s0 = fase; s0 < len; s0 += paso) {
        const s = dir > 0 ? s0 : len - s0, q = L.T.at(s, dir * 4); if (cj && (q.x < cj[0] || q.x > cj[2] || q.y < cj[1] || q.y > cj[3])) continue;
        let dEst = 1e9; for (const e of L.est) dEst = Math.min(dEst, Math.abs(e.s - s));
        const z = 6 + (H - 6) * suave(clamp(dEst / 120, 0, 1));
        out.push({ id: L.id + (dir > 0 ? '+' : '-') + Math.round(s0 / paso), linea: L.id, clase: 'cable', color: L.color, x: q.x, y: q.y, a: q.a + (dir < 0 ? Math.PI : 0), z, s, dir, largo: 3, parado: dEst < 6, estacion: null });
      }
    }
  }
  /* segundos para el próximo tren de la línea en la estación (sentido 1 = hacia la última estación) */
  proximo(lineaId, estacion, fecha, seg, dir = 1) {
    const L = this.lineas.find(l => l.id === lineaId); if (!L || !L.perfil) return null; const Pf = L.perfil[dir > 0 ? 1 : -1], i = Pf.nombres.indexOf(estacion); if (i < 0) return null;
    const S = this._salidas(L, fecha);
    for (const dep of S) { const lleg = dep + (dir < 0 ? L.C.parada_s * .5 : 0) + Pf.tiempos[i]; if (lleg >= seg) return lleg - seg; }
    return null;
  }
  enServicio(fecha, seg) { const [a, b] = this.servicio(fecha); return seg >= a && seg <= b; }
}
MC.Transporte = Transporte;

/* ---- js/30-personaje.js ---- */
/* =====================================================================
   PERSONAJE ÚNICO · el mismo cuerpo para todos los juegos; cada juego lo viste a su estilo
   - Aspecto: piel, pelo, ropa, zapatos, casco y accesorios (une el creador de Juega EnCicla y el de El Metro).
   - Esqueleto: una pose (articulaciones en metros) para quieto, caminar, correr, pedalear, impulsarse,
     patinar, ir sobre una tabla o sentado; todas las vistas dibujan a partir de la misma pose.
   - Piel: MC.arte.registrar(juego, { personaje(g, pose, aspecto, vista, o) }) dibuja a su manera;
     si el juego no la trae, el motor dibuja la suya (lado, cenital y la de 3D en WebGL).
   ===================================================================== */
const PIELES = ['#f6d7c3', '#eac3a2', '#d9a77f', '#c18a63', '#9b6a47', '#74492f', '#4a2c1c', '#fbe3cf'];
const PELOS = ['#1b120c', '#3b2416', '#6b4226', '#a8743a', '#d9b26a', '#8c8c8c', '#e9e4da', '#b5332a', '#2b4f8c'];
const ROPA = ['#7ab800', '#2a5a92', '#c43a26', '#f2c400', '#1d1f24', '#e9eef3', '#743d90', '#e38835', '#1c5c9c', '#3d6b3a', '#ec407a', '#29b6f6'];
const PANTALONES = ['#2b3a55', '#1d1f24', '#5b4a3a', '#7d8696', '#3d6b3a', '#c9b38a'];
const ZAPATOS = ['#1d1f24', '#e9eef3', '#c43a26', '#2a5a92', '#8a5a35'];
const CASCOS = [null, '#ffffff', '#7ab800', '#1d1f24', '#c43a26', '#29b6f6', '#f2c400'];
const ASPECTO_BASE = { piel: 1, pelo: 0, peinado: 1, colPelo: 0, camisa: 0, manga: 0, pantalon: 0, zapatos: 0, casco: 1, gafas: 0, barba: 0, morral: 0, estatura: 1, contextura: 1, chaleco: 0 };
const Personaje = {
  PIELES, PELOS, ROPA, PANTALONES, ZAPATOS, CASCOS, ASPECTO_BASE,
  /* aspecto completo con colores (acepta índices o colores; lo que falta, por defecto) */
  aspecto(a = {}) {
    const A = MC.guardado.completar(a, ASPECTO_BASE), c = (L, v) => typeof v === 'string' ? v : L[v | 0] || L[0];
    return { ...A, cPiel: c(PIELES, A.piel), cPelo: c(PELOS, A.colPelo), cCamisa: c(ROPA, A.camisa), cPantalon: c(PANTALONES, A.pantalon), cZapatos: c(ZAPATOS, A.zapatos), cCasco: A.casco === 0 || A.casco === null ? null : c(CASCOS, A.casco), alto: 1.72 * (A.estatura || 1) };
  },
  /* un aspecto al azar (gente de la ciudad), siempre igual para la misma semilla */
  azar(semilla) { const r = mulberry32(semilla); return this.aspecto({ piel: r() * PIELES.length | 0, colPelo: r() * 6 | 0, peinado: r() * 6 | 0, camisa: r() * ROPA.length | 0, pantalon: r() * PANTALONES.length | 0, zapatos: r() * ZAPATOS.length | 0, casco: 0, gafas: r() < .15 ? 1 : 0, barba: r() < .2 ? 1 : 0, estatura: .9 + r() * .2 }); },
  /* ---------- pose: articulaciones en metros, de lado (x adelante, z arriba), con la cadera sobre el suelo ----------
     estado: 'quieto' | 'camina' | 'corre' | 'pedalea' | 'impulsa' | 'patina' | 'tabla' | 'sentado' | 'salta' | 'cae'
     fase: ciclo del paso (rad) · v: velocidad (m/s) · alto: estatura (m) */
  pose(estado, fase = 0, o = {}) {
    const H = o.alto || 1.72, k = H / 1.72, s = Math.sin(fase), c = Math.cos(fase), J = {};
    const P = (x, z) => [x * k, z * k];
    let cad = [0, .95], inc = 0, pies = null;
    switch (estado) {
      case 'camina': { const a = .32; inc = .04; pies = [[s * a, Math.max(0, -c) * .08], [-s * a, Math.max(0, c) * .08]]; cad = [0, .95 - Math.abs(s) * .02]; break; }
      case 'corre': { const a = .55; inc = .18; pies = [[s * a, Math.max(0, -c) * .28], [-s * a, Math.max(0, c) * .28]]; cad = [.04, .98 + Math.abs(c) * .05]; break; }
      case 'pedalea': { cad = [-.12, 1.02]; inc = .55; const r = .17; pies = [[.12 + Math.cos(fase) * r, .32 + Math.sin(fase) * r], [.12 - Math.cos(fase) * r, .32 - Math.sin(fase) * r]]; break; }
      case 'impulsa': { cad = [0, .98]; inc = .12; const e = Math.max(0, s); pies = [[.05, .12], [-.1 - e * .45, .12 * (1 - e) + (s < 0 ? .06 : 0)]]; break; }
      case 'patina': { cad = [0, .9]; inc = .3; pies = [[s * .3, .06], [-s * .3, .06 + Math.max(0, c) * .05]]; break; }
      case 'tabla': { cad = [0, .88]; inc = .12; pies = [[.22, .1], [-.18, .1]]; break; }
      case 'sentado': { cad = [-.05, .62]; inc = .1; pies = [[.45, .12], [.4, .12]]; break; }
      case 'salta': { cad = [0, 1.0]; inc = .2; pies = [[.2, .55], [-.15, .5]]; break; }
      case 'cae': { cad = [0, .3]; inc = 1.3; pies = [[.6, .05], [.5, .1]]; break; }
      default: { pies = [[.08, 0], [-.08, 0]]; }
    }
    if (o.z) cad = [cad[0], cad[1] + o.z];
    const tronco = .52, cuello = .1, cab = .13;
    const pecho = [cad[0] + Math.sin(inc) * tronco, cad[1] + Math.cos(inc) * tronco], cabeza = [pecho[0] + Math.sin(inc * .7) * (cuello + cab), pecho[1] + Math.cos(inc * .7) * (cuello + cab)];
    const pie = (p) => [p[0], p[1] + (o.z || 0)], rod = (f, sg) => { const mx = (cad[0] + f[0]) / 2, mz = (cad[1] + f[1]) / 2, dx = f[0] - cad[0], dz = f[1] - cad[1], L = Math.hypot(dx, dz), m = .5, h = Math.sqrt(Math.max(0, m * m - (L / 2) ** 2)); return [mx - dz / L * h * sg, mz + dx / L * h * sg]; };
    const pI = pie(pies[0]), pD = pie(pies[1]);
    /* brazos: al manubrio si va en algo con manubrio; si no, se balancean al paso */
    let mI, mD;
    if (o.manubrio) { mI = mD = [o.manubrio[0], o.manubrio[1] + (o.z || 0)]; }
    else { const b = estado === 'corre' ? .5 : estado === 'camina' ? .28 : estado === 'patina' ? .4 : .08; mI = [pecho[0] - s * b, pecho[1] - .5 + Math.abs(s) * .05]; mD = [pecho[0] + s * b, pecho[1] - .5 + Math.abs(c) * .05]; if (estado === 'corre') { mI[1] += .12; mD[1] += .12; } }
    const codo = (m, sg) => { const mx = (pecho[0] + m[0]) / 2, mz = (pecho[1] + m[1]) / 2, dx = m[0] - pecho[0], dz = m[1] - pecho[1], L = Math.hypot(dx, dz) || 1, a = .3, h = Math.sqrt(Math.max(0, a * a - (L / 2) ** 2)); return [mx + dz / L * h * sg, mz - dx / L * h * sg]; };
    Object.assign(J, { cadera: P(...cad), pecho: P(...pecho), cabeza: P(...cabeza), pieI: P(...pI), pieD: P(...pD), rodI: P(...rod(pI, 1)), rodD: P(...rod(pD, 1)), manoI: P(...mI), manoD: P(...mD), codoI: P(...codo(mI, -1)), codoD: P(...codo(mD, -1)), inc, estado, radioCabeza: cab * k });
    return J;
  },
  /* el estado del cuerpo según el vehículo y la velocidad */
  estadoPara(veh, v, enAire) {
    if (enAire) return 'salta'; const C = veh && veh.cuerpo; if (C === 'sentado') return 'sentado';
    if (!veh || veh.id === 'pie') return v > 3.2 ? 'corre' : v > .25 ? 'camina' : 'quieto';
    if (C === 'pedalea') return 'pedalea'; if (C === 'tabla') return v > .5 && v < 3 ? 'impulsa' : 'tabla'; if (C === 'patina') return 'patina'; if (C === 'impulsa') return v < 4 && v > .3 ? 'impulsa' : 'tabla';
    return 'quieto';
  }
};

/* ---------- dibujo de lado (panorámica, plataformas y postales) del motor ----------
   g: Canvas 2D · x,y: punto del suelo en pantalla · esc: px por metro · dir: 1 mira a la derecha */
MC.arte.pieles.motor.personajeLado = function (g, J, A, x, y, esc, dir = 1) {
  const X = p => x + p[0] * esc * dir, Y = p => y - p[1] * esc, lw = Math.max(1.2, esc * .11);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const seg = (a, b, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(X(a), Y(a)); g.lineTo(X(b), Y(b)); g.stroke(); };
  const lejos = tono(A.cPantalon, -.25), cerca = A.cPantalon;
  seg(J.cadera, J.rodD, lejos, lw * 1.25); seg(J.rodD, J.pieD, lejos, lw * 1.1); seg(J.codoD, J.manoD, tono(A.cPiel, -.2), lw * .8); seg(J.pecho, J.codoD, tono(A.cCamisa, -.25), lw);
  g.fillStyle = A.cZapatos; g.fillRect(X(J.pieD) - (dir < 0 ? lw * 1.6 : 0), Y(J.pieD) - lw * .5, lw * 1.6, lw * .9);
  seg(J.cadera, J.pecho, A.cCamisa, lw * 2.3);
  if (A.morral) { g.fillStyle = tono(A.cCamisa, -.35); const mx = (X(J.cadera) + X(J.pecho)) / 2 - dir * lw * 1.4, my = (Y(J.cadera) + Y(J.pecho)) / 2; g.fillRect(mx - lw, my - lw * 1.6, lw * 2, lw * 3); }
  if (A.chaleco) { g.strokeStyle = '#7ab800'; g.lineWidth = lw * 1.4; g.beginPath(); g.moveTo(X(J.cadera), Y(J.cadera) - lw); g.lineTo(X(J.pecho), Y(J.pecho) + lw); g.stroke(); }
  seg(J.cadera, J.rodI, cerca, lw * 1.25); seg(J.rodI, J.pieI, cerca, lw * 1.1);
  g.fillStyle = A.cZapatos; g.fillRect(X(J.pieI) - (dir < 0 ? lw * 1.6 : 0), Y(J.pieI) - lw * .5, lw * 1.6, lw * .9);
  seg(J.pecho, J.codoI, A.cCamisa, lw); seg(J.codoI, J.manoI, A.manga ? A.cCamisa : A.cPiel, lw * .8);
  const r = J.radioCabeza * esc, cx = X(J.cabeza), cy = Y(J.cabeza);
  g.fillStyle = A.cPiel; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  if (A.cCasco) { g.fillStyle = A.cCasco; g.beginPath(); g.arc(cx, cy - r * .1, r * 1.08, Math.PI, 0); g.fill(); g.fillRect(cx - r * 1.08, cy - r * .2, r * 2.16, r * .25); }
  else { g.fillStyle = A.cPelo; g.beginPath(); if (dir > 0) g.arc(cx - r * .1, cy - r * .15, r, Math.PI * .85, Math.PI * 1.95); else g.arc(cx + r * .1, cy - r * .15, r, Math.PI * 1.05, Math.PI * 2.15); g.fill(); }
  g.fillStyle = '#141414'; g.fillRect(cx + dir * r * .45 - .5, cy - r * .15, Math.max(1, r * .18), Math.max(1, r * .18));
  if (A.gafas) { g.strokeStyle = '#141414'; g.lineWidth = Math.max(1, r * .12); g.beginPath(); g.moveTo(cx, cy - r * .1); g.lineTo(cx + dir * r * .95, cy - r * .1); g.stroke(); }
};
/* ---------- dibujo cenital (visto desde arriba) del motor: hombros, cabeza y casco ---------- */
MC.arte.pieles.motor.personajeArriba = function (g, J, A, x, y, esc, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const r = Math.max(1.5, .22 * esc), paso = Math.sin((J.fase || 0)) * .25 * esc;
  if (J.estado === 'camina' || J.estado === 'corre') { g.fillStyle = A.cPantalon; g.fillRect(paso - r * .4, -r * .9, r * .8, r * .55); g.fillRect(-paso - r * .4, r * .35, r * .8, r * .55); }
  g.fillStyle = A.cCamisa; g.beginPath(); g.ellipse(0, 0, r * .75, r * 1.25, 0, 0, TAU); g.fill();
  g.fillStyle = A.cCasco || A.cPelo; g.beginPath(); g.arc(r * .1, 0, r * .62, 0, TAU); g.fill();
  g.restore();
};
Object.assign(MC, { Personaje });

/* ---- js/31-vehiculos.js ---- */
/* =====================================================================
   VEHÍCULOS · un solo registro para todos los juegos (el JE.vehiculos de Juega EnCicla llevado al motor)
   Cifras en unidades reales (m/s, m/s², rad/s, m, kg). Cada juego puede multiplicar la velocidad
   (Juega EnCicla es más arcade: MC.Vehiculos.escala = …) y poner su dibujo con MC.arte.
   clase: 'pie' | 'rueda' (micromovilidad) | 'moto' | 'auto' | 'pesado' | 'riel' | 'cable' | 'aire' | 'agua'
   cuerpo: cómo va el personaje (pedalea, impulsa, tabla, patina, sentado)
   run: 1 si se puede correr Run en la ciclovía con él · futuro: 1 si es de los juegos que vienen (Motor City, Extremo)
   ===================================================================== */
const VEH_SUELO_RUEDA = [.55, .25, .3, .3, 1, 1, .7, 1.15, 0, 0, .85, 1, .75, 0, .95, .9, .35];   // por tipo de casilla (TT)
const VEH_SUELO_PIE = [.85, .6, .7, .7, .95, .95, 1, 1, 0, 0, 1, 1, 1, 0, .9, 1, .8];
const VEH_SUELO_CARRO = [.25, .1, 0, 0, 1, 1, .3, .5, 0, 0, .5, 1, 0, 0, 1, .9, 0];
const VEH_LISTA = [
  /* a pie y micromovilidad (Juega EnCicla, Run Scooter y Gemini) */
  { id: 'pie', n: 'A pie', icon: '🚶', clase: 'pie', cuerpo: 'pie', vmax: 1.6, vcorre: 4.6, acc: 3, freno: 8, giro: [6, 5], largo: .5, ancho: .5, masa: 70, suelo: VEH_SUELO_PIE, loma: [1.1, .6, 1.15], salto: 1, run: 1 },
  { id: 'bici', n: 'Bici EnCicla', icon: '🚲', clase: 'rueda', cuerpo: 'pedalea', vmax: 7.5, acc: 1.6, freno: 4.5, giro: [3.2, 1.4], largo: 1.8, ancho: .6, masa: 95, suelo: VEH_SUELO_RUEDA, loma: [2.2, .5, 1.32], timbre: 1, salto: 1, run: 1, color: '#7ab800', manubrio: [.42, 1.0] },
  { id: 'bici_propia', n: 'Bici propia', icon: '🚴', de: 'bici', color: '#29b6f6' },
  { id: 'ebike', n: 'Bici eléctrica', icon: '⚡', de: 'bici', vmax: 8.3, acc: 2.2, electrico: 1, loma: [.4, .85, 1.15], color: '#2fa8dc' },
  { id: 'bmx', n: 'BMX', icon: '🚲', de: 'bici', vmax: 7, acc: 2, giro: [4, 1.8], salto: 1.6, trucos: 1, color: '#e53935', futuro: 1 },
  { id: 'mtb', n: 'Bici de montaña', icon: '🚵', de: 'bici', vmax: 8, suelo: [.85, .7, .5, .5, .95, .95, .75, 1.05, 0, 0, .85, .95, .75, 0, .9, .9, .55], color: '#43a047', futuro: 1 },
  { id: 'ruta', n: 'Bici de ruta', icon: '🚴', de: 'bici', vmax: 11, acc: 1.8, giro: [2.6, 1.1], color: '#fdd835', futuro: 1 },
  { id: 'patinete', n: 'Patinete clásico', icon: '🛴', clase: 'rueda', cuerpo: 'impulsa', vmax: 5.5, acc: 1.4, freno: 3.5, giro: [3.5, 1.6], largo: 1.1, ancho: .45, masa: 78, suelo: VEH_SUELO_RUEDA, loma: [2.6, .45, 1.4], run: 1, color: '#c9d1db', manubrio: [.38, 1.0] },
  { id: 'scooter', n: 'Scooter eléctrico', icon: '🛵', de: 'patinete', cuerpo: 'tabla', vmax: 7, acc: 2.4, electrico: 1, loma: [.5, .8, 1.15], color: '#29b6f6' },
  { id: 'monopatin', n: 'Monopatín eléctrico', icon: '🔋', de: 'patinete', cuerpo: 'tabla', vmax: 7.5, acc: 2.6, electrico: 1, loma: [.5, .8, 1.15], suelo: [.3, .1, .2, .2, 1, 1, .7, 1.15, 0, 0, .85, 1, .75, 0, .95, .9, .2], color: '#1f242e' },
  { id: 'monociclo', n: 'Monociclo eléctrico', icon: '🛞', de: 'patinete', cuerpo: 'tabla', vmax: 6.5, acc: 2, electrico: 1, giro: [4.5, 2], largo: .5, color: '#7e57c2' },
  { id: 'skate', n: 'Skate', icon: '🛹', clase: 'rueda', cuerpo: 'impulsa', vmax: 5.5, acc: 1.3, freno: 2.5, giro: [4.2, 1.8], largo: .82, ancho: .22, masa: 72, suelo: [.1, .05, .2, .2, 1, 1, .8, 1.1, 0, 0, .95, 1, .8, 0, .9, .9, .1], loma: [3, .4, 1.5], salto: 1.3, trucos: 1, run: 1, color: '#d9a066' },
  { id: 'longboard', n: 'Longboard', icon: '🛹', de: 'skate', vmax: 7, giro: [3, 1.2], largo: 1.05, loma: [3.4, .4, 1.7], color: '#8d6e63' },
  { id: 'patines', n: 'Patines en línea', icon: '🛼', clase: 'rueda', cuerpo: 'patina', vmax: 6, acc: 1.6, freno: 3, giro: [4, 1.9], largo: .4, ancho: .4, masa: 70, suelo: VEH_SUELO_RUEDA, loma: [2.6, .45, 1.4], salto: 1.1, run: 1, color: '#ff5a36' },
  { id: 'quad', n: 'Patines quad', icon: '🛼', de: 'patines', vmax: 5.5, giro: [4.5, 2.1], color: '#f06292' },
  { id: 'triciclo', n: 'Triciclo de carga', icon: '🚲', de: 'bici', vmax: 5.5, acc: 1, giro: [2.2, 1], largo: 2.4, ancho: 1.1, masa: 160, carga: 1, color: '#ffb300' },
  { id: 'jetpack', n: 'Jetpack', icon: '🚀', clase: 'aire', cuerpo: 'pie', vmax: 14, acc: 5, freno: 5, giro: [3, 2], largo: .6, ancho: .6, masa: 90, suelo: VEH_SUELO_PIE, loma: [0, 1, 1], vuela: 1, techo: 60, run: 1, futuro: 1, color: '#ff7043' },
  /* motor (Juega EnCicla: camión de Balance; El Metro: buses; Motor City: carros, motos y lo que viene) */
  { id: 'moto', n: 'Moto', icon: '🏍️', clase: 'moto', cuerpo: 'sentado', vmax: 22, acc: 5, freno: 8, giro: [2.6, .9], largo: 2, ancho: .8, masa: 260, suelo: VEH_SUELO_CARRO, loma: [.3, .85, 1.1], electrico: 0, via: 1, salto: .4, color: '#1d1f24', manubrio: [.5, 1.05] },
  { id: 'carro', n: 'Carro', icon: '🚗', clase: 'auto', cuerpo: 'sentado', vmax: 25, acc: 3.6, freno: 8.5, giro: [1.8, .55], largo: 4.3, ancho: 1.8, masa: 1200, suelo: VEH_SUELO_CARRO, loma: [.2, .9, 1.05], via: 1, color: '#c43a26' },
  { id: 'taxi', n: 'Taxi', icon: '🚕', de: 'carro', color: '#f2c400' },
  { id: 'camion', n: 'Camión de Balance', icon: '🚚', clase: 'pesado', cuerpo: 'sentado', vmax: 14, acc: 1.6, freno: 6, giro: [1.2, .4], largo: 6.5, ancho: 2.3, masa: 6500, suelo: VEH_SUELO_CARRO, loma: [.6, .6, 1.08], via: 1, color: '#7ab800' },
  { id: 'buseta', n: 'Buseta', icon: '🚌', de: 'camion', vmax: 15, largo: 9.5, color: '#e9eef3' },
  { id: 'deportivo', n: 'Deportivo', icon: '🏎️', de: 'carro', vmax: 55, acc: 8.5, freno: 11, giro: [2, .45], color: '#ff1744', futuro: 1 },
  { id: 'formula', n: 'Fórmula', icon: '🏁', de: 'carro', vmax: 90, acc: 14, freno: 30, giro: [2.2, .5], largo: 5.6, ancho: 2, masa: 800, color: '#d50000', futuro: 1 },
  { id: 'nascar', n: 'Óvalo (NASCAR)', icon: '🏁', de: 'carro', vmax: 80, acc: 9, freno: 14, largo: 5.2, masa: 1500, color: '#2962ff', futuro: 1 },
  { id: 'drift', n: 'Carro de drift', icon: '💨', de: 'carro', vmax: 45, acc: 7, deriva: 1, color: '#00e5ff', futuro: 1 },
  { id: 'todoterreno', n: 'Todoterreno', icon: '🚙', de: 'carro', vmax: 30, suelo: [.8, .65, 0, 0, 1, 1, .6, .7, 0, 0, .8, 1, 0, 0, 1, .9, .3], via: 0, color: '#6d4c41', futuro: 1 },
  /* aire y agua (los juegos que vienen) */
  { id: 'avioneta', n: 'Avioneta', icon: '🛩️', clase: 'aire', cuerpo: 'sentado', vmax: 60, vmin: 22, acc: 6, freno: 3, giro: [.9, .7], largo: 8, ancho: 10, masa: 900, suelo: VEH_SUELO_CARRO, loma: [0, 1, 1], vuela: 1, techo: 1200, color: '#eceff1', futuro: 1 },
  { id: 'avion', n: 'Avión de combate', icon: '✈️', de: 'avioneta', vmax: 260, vmin: 70, acc: 30, giro: [1.6, 1.1], techo: 9000, color: '#78909c', futuro: 1 },
  { id: 'lancha', n: 'Lancha', icon: '🚤', clase: 'agua', cuerpo: 'sentado', vmax: 20, acc: 4, freno: 3, giro: [1.4, .7], largo: 5, ancho: 2, masa: 700, suelo: [0, 0, 0, 0, 0, 0, 0, 0, 1, .7, 0, 0, 0, 0, 0, 0, 0], loma: [0, 1, 1], color: '#ffffff', futuro: 1 },
  { id: 'surf', n: 'Tabla de surf', icon: '🏄', de: 'lancha', cuerpo: 'tabla', vmax: 9, largo: 2.2, ancho: .6, masa: 75, color: '#ffca28', futuro: 1 },
  /* transporte público (se aborda; lo maneja el horario o el juego) */
  { id: 'metro', n: 'Tren del metro', icon: '🚇', clase: 'riel', cuerpo: 'sentado', vmax: 22, acc: 1.1, freno: 1.3, giro: [0, 0], largo: 120, ancho: 3.2, masa: 200000, suelo: VEH_SUELO_CARRO, loma: [0, 1, 1], color: '#1c5c9c', publico: 1 },
  { id: 'tranvia', n: 'Tranvía de Ayacucho', icon: '🚋', de: 'metro', vmax: 14, largo: 42, color: '#59ab42' },
  { id: 'cable', n: 'Metrocable', icon: '🚡', clase: 'cable', cuerpo: 'sentado', vmax: 5, acc: 1, freno: 1, giro: [0, 0], largo: 3, ancho: 2.2, masa: 1400, suelo: VEH_SUELO_CARRO, loma: [0, 1, 1], color: '#e38835', publico: 1 },
  { id: 'metroplus', n: 'Metroplús', icon: '🚍', de: 'buseta', largo: 18, color: '#0e6f76', publico: 1 }
];
const Vehiculos = {
  lista: new Map(), escala: 1,
  /* registra (o completa) un vehículo: lo que no diga lo hereda de su base `de` */
  registrar(def) {
    const base = def.de ? this.lista.get(def.de) : null; if (def.de && !base) throw new Error('base desconocida: ' + def.de);
    const v = Object.assign({ juegos: ['*'] }, base || {}, def); if (base) v.de = def.de; this.lista.set(v.id, v); MC.emit('vehiculo', v); return v;
  },
  get(id) { return this.lista.get(id) || this.lista.get('pie'); },
  /* los que se pueden elegir en un juego (filtro opcional) */
  de(juego, filtro) { return [...this.lista.values()].filter(v => (v.juegos.includes('*') || v.juegos.includes(juego)) && (!filtro || filtro(v))); },
  /* cuánto rinde en una casilla (0 = no entra) y en una pendiente */
  suelo(v, tt) { return (v.suelo || VEH_SUELO_RUEDA)[tt] ?? 0; },
  loma(v, p) { const [k, a, b] = v.loma || [1, .6, 1.2]; return clamp(1 - k * p, a, b); }
};
for (const d of VEH_LISTA) Vehiculos.registrar(d);
MC.Vehiculos = Vehiculos;

/* ---- js/32-fisica.js ---- */
/* =====================================================================
   FÍSICA DEL CUERPO · el jugador (o cualquier agente) sobre el mundo real
   - Velocidad según el vehículo, el suelo (casilla), la pendiente real (frena en subida y empuja en bajada;
     las eléctricas no sufren), el turbo y el correr a pie.
   - Choques con lo sólido (montaña, agua, casillas de edificio) y con las huellas reales de los edificios.
   - Niveles: a un puente se sube por sus extremos (rampa); por la mitad se pasa por debajo. En el tablero
     las barandas no dejan caer. El viaducto es solo del metro. Los deprimidos, para los que van por la vía.
   - Saltos con gravedad, vuelo (jetpack y avionetas) y agua (lanchas).
   Entrada: { giro: −1..1, acel: −1..1, dir: {x,y,m}|null (rumbo deseado en el mundo), salto, turbo, correr, sube, baja }
   ===================================================================== */
const GRAV = 19.6;   // gravedad de juego (el doble de la real: saltos cortos y con peso)
class Cuerpo {
  constructor(mundo, op = {}) {
    this.mundo = mundo; this.x = op.x || 0; this.y = op.y || 0; this.a = op.a || 0; this.v = 0; this.z = 0; this.vz = 0; this.enAire = false;
    this.veh = Vehiculos.get(op.veh || 'pie'); this.corriendo = false; this.fase = 0; this.paso = null; this.zPaso = 0; this.giroV = 0; this.choque = 0; this.pend = 0; this.tt = 0;
    this.chocaEdificios = op.chocaEdificios !== false; this.escala = op.escala || 1; this.eventos = [];
  }
  setVeh(id) { this.veh = Vehiculos.get(id); this.v = Math.min(this.v, this.veh.vmax); if (this.veh.clase !== 'aire') { this.enAire = this.z > .05; } MC.emit('cambiaVehiculo', this); }
  /* altura absoluta (m s. n. m.) de los pies: terreno + tablero del puente + salto o vuelo */
  get alturaSuelo() { return this.mundo.cota(this.x, this.y) + this.zPaso; }
  get altura() { return this.alturaSuelo + this.z; }
  vmax() { const V = this.veh, base = V.id === 'pie' ? (this.corriendo ? V.vcorre : V.vmax) : V.vmax; return base * this.escala * (Vehiculos.escala || 1); }
  /* ¿puede este vehículo estar en (x, y)? */
  puede(x, y) {
    const V = this.veh; if (V.clase === 'aire' && this.z > 3) return this.mundo.dentro(x, y);
    if (this.paso) return true;
    const tt = this.mundo.suelo(x, y); if (Vehiculos.suelo(V, tt) <= 0) return false;
    if (this.chocaEdificios && V.clase !== 'agua' && tt !== TT.ROAD && tt !== TT.AVE && tt !== TT.AUTO && tt !== TT.CICLO && this.mundo.edificioEn(x, y, V.clase === 'pie' ? .2 : .4)) return false;
    return true;
  }
  actualizar(dt, E = {}) {
    const V = this.veh, M = this.mundo; this.eventos.length = 0; dt = Math.min(dt, .1);
    this.corriendo = !!E.correr && V.id === 'pie';
    /* rumbo deseado (joystick que apunta en el mundo) o giro (volante) */
    let acel = E.acel || 0, giro = E.giro || 0;
    if (E.dir && E.dir.m > .08) { const des = Math.atan2(E.dir.y, E.dir.x), d = angDif(this.a, des); giro = clamp(d * 2.2, -1, 1); acel = E.dir.m * (Math.abs(d) > 2.2 && V.clase !== 'pie' ? .2 : 1); if (V.clase === 'pie' && Math.abs(d) > .1) this.a += clamp(d, -dt * 9, dt * 9); }
    /* suelo, pendiente y velocidad objetivo */
    this.tt = M.suelo(this.x, this.y); this.pend = this.paso ? 0 : M.pendiente(this.x, this.y, this.a, 12);
    const suelo = this.paso ? 1 : Math.max(.15, Vehiculos.suelo(V, this.tt)), loma = V.electrico ? clamp(1 - this.pend * .4, .85, 1.15) : Vehiculos.loma(V, this.pend);
    const vmax = this.vmax() * suelo * loma * (E.turbo ? 1.25 : 1), objetivo = acel >= 0 ? vmax * acel : -vmax * .35 * -acel;
    const empuje = acel > 0 ? V.acc * (E.turbo ? 1.4 : 1) : V.freno;
    if (this.enAire && V.clase !== 'aire') { /* en el aire no se acelera */ }
    else if (acel === 0) this.v -= Math.sign(this.v) * Math.min(Math.abs(this.v), (V.clase === 'pie' ? 6 : V.clase === 'rueda' ? .35 + Math.max(0, this.pend) * 4 : .8) * dt);
    else this.v += clamp(objetivo - this.v, -V.freno * dt, empuje * dt);
    if (!V.electrico && V.clase === 'rueda' && !this.enAire && this.pend < -.03 && acel <= 0) this.v += -this.pend * 9.8 * .55 * dt;   // la bajada empuja
    /* giro: más ágil quieto que rápido; inercia corta */
    const tg = lerp(V.giro[0], V.giro[1], clamp(Math.abs(this.v) / Math.max(1, vmax), 0, 1)) * giro * (V.clase === 'pie' ? 0 : 1) * (this.v < 0 ? -1 : 1);
    this.giroV = lerp(this.giroV, tg, Math.min(1, dt * 10)); if (V.clase !== 'pie' || !E.dir) this.a += this.giroV * dt * (V.clase === 'pie' ? 1 : Math.min(1, .25 + Math.abs(this.v) / 2.5));
    if (V.clase === 'pie' && !E.dir) this.a += giro * V.giro[0] * dt;
    /* vuelo */
    if (V.clase === 'aire') this._vuelo(dt, E);
    else if (E.salto && !this.enAire && V.salto) { this.vz = Math.sqrt(2 * GRAV * .6 * V.salto); this.enAire = true; this.eventos.push('salto'); MC.emit('salto', this); }
    if (this.enAire && V.clase !== 'aire') { this.z += this.vz * dt; this.vz -= GRAV * dt; if (this.z <= 0) { this.z = 0; this.enAire = false; this.eventos.push(this.vz < -6 ? 'aterrizaFuerte' : 'aterriza'); this.vz = 0; } }
    /* mover con choques (desliza por el eje libre) */
    const dx = Math.cos(this.a) * this.v * dt, dy = Math.sin(this.a) * this.v * dt, nx = this.x + dx, ny = this.y + dy;
    if (this.puede(nx, ny)) { this.x = nx; this.y = ny; }
    else if (this.puede(nx, this.y)) { this.x = nx; this.v *= .7; }
    else if (this.puede(this.x, ny)) { this.y = ny; this.v *= .7; }
    else { if (Math.abs(this.v) > 2.5) { this.eventos.push('choque'); this.choque = .4; MC.emit('choque', this); } this.v *= -.15; }
    this.choque = Math.max(0, this.choque - dt);
    this._niveles(dt);
    this.fase += Math.abs(this.v) * dt * (V.clase === 'pie' ? (this.corriendo ? 2.4 : 3.2) : V.cuerpo === 'pedalea' ? 1.6 : 1.2);
    this.estado = Personaje.estadoPara(V, Math.abs(this.v), this.enAire && V.clase !== 'aire');
    return this;
  }
  _vuelo(dt, E) {
    const V = this.veh, techo = V.techo || 60;
    if (V.vmin) { const sus = clamp((this.v - V.vmin) / V.vmin, 0, 1); this.vz = lerp(this.vz, (E.sube ? 6 : E.baja ? -6 : 0) * sus + (sus < .3 && this.z > 0 ? -4 : 0), Math.min(1, dt * 2)); }
    else this.vz = lerp(this.vz, E.sube || E.salto ? 5 : E.baja ? -6 : (this.z > 0 ? -1.2 : 0), Math.min(1, dt * 3));
    this.z = clamp(this.z + this.vz * dt, 0, techo); this.enAire = this.z > .05;
  }
  /* ---------- puentes, viaducto y deprimidos ---------- */
  _niveles(dt) {
    const V = this.veh, M = this.mundo;
    if (this.paso) {
      const P = this.paso, T = P.trazo || (P.trazo = new Trazo(P.p)), pr = T.proyectar(this.x, this.y), q = T.at(pr.s), lat = (this.x - q.x) * -Math.sin(q.a) + (this.y - q.y) * Math.cos(q.a), med = P.ancho / 2 - .3;
      if (Math.abs(lat) > med && pr.s > 1 && pr.s < P.largo - 1) { const l = clamp(lat, -med, med); this.x = q.x - Math.sin(q.a) * l; this.y = q.y + Math.cos(q.a) * l; }   // baranda
      const rampa = Math.min(P.largo * .4, P.tipo === 'tunel' ? 26 : P.peatonal ? 9 : 22), f = suave(Math.min(pr.s, P.largo - pr.s) / rampa);
      this.zPaso = P.nivel * NIVEL_M * f; this.sPaso = pr.s;
      if (pr.s <= .4 || pr.s >= P.largo - .4) { this.paso = null; this.zPaso = 0; this.eventos.push('salePaso'); }
      return;
    }
    if (!M.nivel(this.x, this.y) && Math.abs(this.v) < .1) return;
    /* entrar por un extremo, mirando hacia el tablero */
    for (const P of M.pasosEn(this.x - 30, this.y - 30, this.x + 30, this.y + 30)) {
      if (P.tipo === 'viaducto') continue; if (P.tipo === 'tunel' && !V.via) continue; if (P.peatonal && (V.clase === 'auto' || V.clase === 'pesado' || V.clase === 'moto')) continue; if (!P.peatonal && V.clase === 'pie' && P.tipo === 'puente' && P.ancho > 12) continue;
      const p = P.p, n = p.length; for (const [ex, ey, ix, iy] of [[p[0], p[1], p[2], p[3]], [p[n - 2], p[n - 1], p[n - 4], p[n - 3]]]) {
        const d = Math.hypot(this.x - ex, this.y - ey); if (d > Math.max(4, P.ancho / 2 + 1)) continue;
        const ang = Math.atan2(iy - ey, ix - ex); if (Math.cos(angDif(this.a, ang)) * Math.sign(this.v || 1) < .5) continue;
        this.paso = P; this.eventos.push('entraPaso'); MC.emit('paso', { cuerpo: this, paso: P }); return;
      }
    }
  }
}
Object.assign(MC, { Cuerpo, GRAV });

/* ---- js/33-controles.js ---- */
/* =====================================================================
   CONTROLES · teclado, pantalla táctil (joystick virtual y gestos) y control de juegos (gamepad)
   Entrega cada cuadro una entrada única: { stick:{x,y,m}, acel, giro, salto, turbo, correr, sube, baja, accion }
   y avisa los gestos de cámara (pellizco = zoom, giro con dos dedos = girar, dos dedos arriba/abajo = inclinar,
   un dedo en la mitad derecha = mirar alrededor). Los botones de la interfaz llaman controles.boton(id, true|false).
   ===================================================================== */
class Controles {
  constructor(el, op = {}) {
    this.el = el; this.teclas = new Set(); this.botones = new Set(); this.pulsos = new Set(); this.stick = { x: 0, y: 0, m: 0, activo: false, ox: 0, oy: 0, px: 0, py: 0, id: null }; this.dedos = new Map(); this.gesto = null; this.op = op;
    this.alGesto = op.alGesto || (() => {}); this.alTecla = op.alTecla || (() => {});
    if (typeof window === 'undefined' || !el) return;
    const kd = e => { if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; this.teclas.add(e.code); if (!e.repeat) { this.pulsos.add(e.code); this.alTecla(e.code, e); } if (/Arrow|Space/.test(e.code)) e.preventDefault(); };
    const ku = e => this.teclas.delete(e.code);
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', () => { this.teclas.clear(); this.botones.clear(); });
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', e => this._abajo(e)); el.addEventListener('pointermove', e => this._mueve(e));
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(t, e => this._arriba(e));
    el.addEventListener('wheel', e => { e.preventDefault(); this.alGesto({ tipo: 'zoom', k: Math.exp(-e.deltaY * .0015) }); }, { passive: false });
  }
  _abajo(e) {
    const r = this.el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; this.dedos.set(e.pointerId, { x, y, x0: x, y0: y });
    try { this.el.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ }
    if (this.dedos.size === 2) { this._gesto0(); if (this.stick.id !== null) this._soltarStick(); return; }
    if (x < r.width * .55 && this.stick.id === null && !this.op.sinStick) Object.assign(this.stick, { id: e.pointerId, ox: x, oy: y, px: x, py: y, activo: true });
    else this.gesto = { tipo: 'mirar', x, y };
  }
  _mueve(e) {
    const d = this.dedos.get(e.pointerId); if (!d) return; const r = this.el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, ddx = x - d.x, ddy = y - d.y; d.x = x; d.y = y;
    if (this.dedos.size >= 2 && this.gesto && this.gesto.tipo === 'dos') { this._gesto(); return; }
    if (e.pointerId === this.stick.id) { const R = 52, dx = x - this.stick.ox, dy = y - this.stick.oy, L = Math.hypot(dx, dy); if (L > R) { this.stick.ox += dx * (1 - R / L); this.stick.oy += dy * (1 - R / L); } this.stick.px = x; this.stick.py = y; const ex = (x - this.stick.ox) / R, ey = (y - this.stick.oy) / R; this.stick.x = ex; this.stick.y = ey; this.stick.m = Math.min(1, Math.hypot(ex, ey)); return; }
    if (this.gesto && this.gesto.tipo === 'mirar') this.alGesto({ tipo: 'mirar', dx: ddx, dy: ddy });
  }
  _arriba(e) { if (!this.dedos.has(e.pointerId)) return; const d = this.dedos.get(e.pointerId); this.dedos.delete(e.pointerId); if (e.pointerId === this.stick.id) this._soltarStick(); if (this.dedos.size < 2 && this.gesto && this.gesto.tipo === 'dos') this.gesto = null; if (!this.dedos.size) { if (this.gesto && this.gesto.tipo === 'mirar' && Math.hypot(d.x - d.x0, d.y - d.y0) < 8) this.alGesto({ tipo: 'toque', x: d.x, y: d.y }); this.gesto = null; } }
  _soltarStick() { Object.assign(this.stick, { id: null, activo: false, x: 0, y: 0, m: 0 }); }
  _par() { const [a, b] = [...this.dedos.values()]; return { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, d: Math.hypot(b.x - a.x, b.y - a.y), ang: Math.atan2(b.y - a.y, b.x - a.x) }; }
  _gesto0() { this.gesto = Object.assign({ tipo: 'dos' }, this._par()); }
  _gesto() { const p = this._par(), g = this.gesto; this.alGesto({ tipo: 'zoom', k: p.d / (g.d || p.d) }); this.alGesto({ tipo: 'girar', da: angDif(g.ang, p.ang) }); this.alGesto({ tipo: 'inclinar', dy: p.cy - g.cy }); Object.assign(g, p); }
  boton(id, on) { if (on) { this.botones.add(id); this.pulsos.add('btn:' + id); } else this.botones.delete(id); }
  /* la entrada de este cuadro (los pulsos se gastan al leerla) */
  leer() {
    const T = this.teclas, B = this.botones, k = c => T.has(c), pad = this._pad();
    let ax = (k('ArrowRight') || k('KeyD') ? 1 : 0) - (k('ArrowLeft') || k('KeyA') ? 1 : 0), ay = (k('ArrowDown') || k('KeyS') ? 1 : 0) - (k('ArrowUp') || k('KeyW') ? 1 : 0);
    let sx = this.stick.x, sy = this.stick.y, sm = this.stick.m;
    if (pad && Math.hypot(pad.x, pad.y) > .15) { sx = pad.x; sy = pad.y; sm = Math.min(1, Math.hypot(pad.x, pad.y)); }
    if (ax || ay) { const L = Math.hypot(ax, ay); sx = ax / L; sy = ay / L; sm = 1; }
    const p = this.pulsos, pulso = c => p.has(c);
    const E = {
      stick: { x: sx, y: sy, m: sm }, teclado: !!(ax || ay),
      acel: clamp(-ay || (pad ? pad.rt - pad.lt : 0) || (B.has('acel') ? 1 : 0) - (B.has('freno') ? 1 : 0), -1, 1), giro: ax || (pad ? pad.x : 0),
      salto: pulso('Space') || pulso('btn:salto') || (pad && pad.a), turbo: k('ShiftLeft') || k('ShiftRight') || B.has('turbo') || (pad && pad.rb), correr: k('ShiftLeft') || k('ShiftRight') || B.has('correr') || (pad && pad.rb),
      sube: k('Space') || B.has('sube'), baja: k('ControlLeft') || k('KeyZ') || B.has('baja'), accion: pulso('KeyE') || pulso('Enter') || pulso('btn:accion'), pulsos: new Set(p)
    };
    p.clear(); return E;
  }
  _pad() { if (typeof navigator === 'undefined' || !navigator.getGamepads) return null; for (const g of navigator.getGamepads()) if (g && g.connected) { const b = i => g.buttons[i] && g.buttons[i].pressed, v = i => g.buttons[i] ? g.buttons[i].value : 0; const a = b(0); if (a && !this._a) this.pulsos.add('btn:salto'); this._a = a; return { x: g.axes[0] || 0, y: g.axes[1] || 0, a: false, rt: v(7), lt: v(6), rb: b(5) }; } return null; }
}
MC.Controles = Controles;

/* ---- js/34-camara.js ---- */
/* =====================================================================
   CÁMARA · una sola para todas las vistas (junta la cámara libre de Juega EnCicla y VC.camaraLibre de El Metro)
   - 2D (cenital, pixel, 3D oblicua, maqueta): punto mirado (x, y), zoom (px por metro), giro (yaw) e inclinación.
   - 3D en perspectiva (primera y tercera persona, dron y cine): ojo y punto mirado en metros, con su campo visual.
   - Gestos: pellizco = zoom, dos dedos que giran = girar, dos dedos arriba/abajo = inclinar, arrastrar = mirar o mover.
   - Sigue al jugador con suavidad (mira un poco hacia adelante) o queda libre; cambia de vista con transición.
   ===================================================================== */
const CAM_PERFIL = {
  primera: { dist: 0, alto: 1.62, pitch: .08, fov: 1.15 },
  tercera: { dist: 7, alto: 2.6, pitch: .22, fov: 1.0 },
  dron: { dist: 70, alto: 55, pitch: .62, fov: .95 },
  cine: { dist: 28, alto: 9, pitch: .18, fov: .8 },
  aerea: { dist: 900, alto: 650, pitch: .78, fov: .85 }
};
class Camara {
  constructor(op = {}) {
    this.x = op.x || 0; this.y = op.y || 0; this.zoom = op.zoom || 3; this.yaw = 0; this.pitch = .55; this.modo = 'sigue'; this.adelanto = 0;
    this.perfil = 'tercera'; this.d = Object.assign({}, CAM_PERFIL.tercera); this.mira = 0; this.mirarV = 0; this.ojo = [0, 0, 0]; this.blanco = [0, 0, 0]; this.fov = 1; this.orbita = 0;
    this.limites = { zoom: [.08, 14], pitch: [0, 1.25] }; this.tr = null; this.sacudida = 0;
  }
  /* gesto de la pantalla (de Controles) */
  gesto(g) {
    if (g.tipo === 'zoom') { this.zoom = clamp(this.zoom * g.k, ...this.limites.zoom); this.d.dist = clamp(this.d.dist / g.k, this.perfil === 'primera' ? 0 : 2.5, 2500); }
    else if (g.tipo === 'girar') { this.yaw -= g.da; this.mira -= g.da; }
    else if (g.tipo === 'inclinar') { this.pitch = clamp(this.pitch + g.dy * .006, ...this.limites.pitch); this.d.pitch = clamp(this.d.pitch + g.dy * .004, -.4, 1.4); }
    else if (g.tipo === 'mirar') { if (this.modo === 'libre') { const c = Math.cos(this.yaw), s = Math.sin(this.yaw); this.x -= (g.dx * c + g.dy * s) / this.zoom; this.y -= (-g.dx * s + g.dy * c) / this.zoom; } else { this.mira += g.dx * .006; this.d.pitch = clamp(this.d.pitch + g.dy * .004, -.4, 1.4); } }
  }
  usarPerfil(p) { if (!CAM_PERFIL[p]) return; this.perfil = p; this.d = Object.assign({}, CAM_PERFIL[p]); this.mira = 0; }
  /* objetivo: { x, y, z (altura del suelo en m), a (rumbo), v } · dt en s */
  actualizar(dt, o) {
    if (this.modo === 'sigue' && o) {
      this.adelanto = lerp(this.adelanto, clamp(o.v || 0, -4, 25) * .9, Math.min(1, dt * 1.5));
      const tx = o.x + Math.cos(o.a) * this.adelanto, ty = o.y + Math.sin(o.a) * this.adelanto, k = Math.min(1, dt * 6);
      this.x = lerp(this.x, tx, k); this.y = lerp(this.y, ty, k);
    }
    /* 3D en perspectiva: ojo detrás del rumbo (y lo que el jugador mire con el dedo) */
    if (o) {
      const P = this.d; this.orbita += dt * (this.perfil === 'cine' ? .12 : 0);
      if (this.perfil !== 'primera' && Math.abs(this.mira) > .001 && !(this._mirando > 0)) this.mira *= Math.pow(.25, dt);
      const ang = (o.a || 0) + this.mira + this.orbita + (this.perfil === 'cine' ? .8 : 0), z0 = o.z || 0;
      const adel = this.perfil === 'primera' ? .28 : 0, ex = o.x - Math.cos(ang) * (P.dist - adel), ey = o.y - Math.sin(ang) * (P.dist - adel), ez = z0 + P.alto + (this.perfil === 'primera' ? (o.zCuerpo || 0) : 0);
      const look = this.perfil === 'primera' ? 30 : Math.max(4, P.dist), lx = o.x + Math.cos(ang) * (this.perfil === 'primera' ? look : 4), ly = o.y + Math.sin(ang) * (this.perfil === 'primera' ? look : 4);
      const lz = this.perfil === 'primera' ? ez - Math.tan(P.pitch) * look : z0 + 1.2 - Math.tan(P.pitch) * 2;
      const k = this.perfil === 'primera' ? 1 : Math.min(1, dt * 5);
      this.ojo = [lerp(this.ojo[0], ex, k), lerp(this.ojo[1], ey, k), lerp(this.ojo[2], ez, k)]; this.blanco = [lx, ly, lz]; this.fov = P.fov;
      if (!isFinite(this.ojo[0]) || Math.hypot(this.ojo[0] - ex, this.ojo[1] - ey) > 500) this.ojo = [ex, ey, ez];
    }
    this.sacudida = Math.max(0, this.sacudida - dt * 2);
    if (this.tr) { this.tr.t += dt / this.tr.dur; if (this.tr.t >= 1) this.tr = null; }
  }
  /* transición entre vistas: 0..1 (la usa el gestor de vistas para mezclar) */
  transicion(dur = .6) { this.tr = { t: 0, dur }; }
  get mezcla() { return this.tr ? suave(this.tr.t) : 1; }
  /* metros → pantalla en 2D (con giro) y al revés */
  aPantalla(x, y, W, H) { const dx = x - this.x, dy = y - this.y, c = Math.cos(this.yaw), s = Math.sin(this.yaw); return [W / 2 + (dx * c - dy * s) * this.zoom, H / 2 + (dx * s + dy * c) * this.zoom]; }
  aMundo(px, py, W, H) { const dx = (px - W / 2) / this.zoom, dy = (py - H / 2) / this.zoom, c = Math.cos(-this.yaw), s = Math.sin(-this.yaw); return [this.x + dx * c - dy * s, this.y + dx * s + dy * c]; }
  /* caja de metros que se ve (con margen) */
  caja(W, H, m = 0) { const r = Math.hypot(W, H) / 2 / this.zoom + m; return [this.x - r, this.y - r, this.x + r, this.y + r]; }
}
Object.assign(MC, { Camara, CAM_PERFIL });

/* ---- js/40-dibujo.js ---- */
/* =====================================================================
   DIBUJO 2D COMPARTIDO · paleta del motor, losas del suelo en caché y pinceles de edificios y vehículos
   Las LOSAS (160 × 160 m) son el corazón del «mismo mapa en todas las vistas»: se pintan una vez
   (suelo suave por casillas con sombreado del relieve, calles y ciclorrutas en vectores con su ancho real,
   agua, canchas, piscinas, árboles por zona y techos de las huellas reales) y las usan la vista cenital,
   el pixel, la 3D oblicua, la maqueta 2:1 y el piso de la vista 3D en WebGL.
   Cada juego puede cambiar la paleta (MC.arte.registrar(juego, { suelo: {...}, via: {...} })).
   ===================================================================== */
const PAL_SUELO = ['#78ad55', '#3f7a3c', '#cdbfa5', '#bdb3a2', '#5d636e', '#565c68', '#c9c4b8', '#4caf63', '#4f9fd0', '#5f9fb8', '#d8cfbd', '#6b7180', '#e7e2d6', '#b9b4a8', '#4d525c', '#a9a395', '#b8a98e'];
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
    for (const b of E) { const P = Mundo.esquinas(b), sh = Math.min(6, b.h * .25); g.fillStyle = 'rgba(20,24,40,.22)'; g.beginPath(); g.moveTo(P[0] + sh, P[1] + sh); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i] + sh, P[i + 1] + sh); g.closePath(); g.fill(); }
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

/* ---- js/41-vista2d.js ---- */
/* =====================================================================
   VISTA 2D ÚNICA · cenital, 3D oblicua y maqueta dimétrica 2:1 con una sola proyección:
     pantalla = centro + Aplasta(k) · Gira(yaw) · (punto − cámara) · zoom  −  altura · zoom · hk
   - cenital: k = 1, hk = 0 (los techos van en las losas) · oblicua: k = cos(incl), hk = sin(incl)
   - maqueta 2:1: yaw en múltiplos de 90° + 45°, k = 0,5, hk = 0,82 (la proyección de la maqueta de El Metro)
   El suelo sale de las losas; los edificios se levantan con su huella y su altura reales; puentes y viaducto
   a su nivel; tráfico, transporte y gente encima. El pixel es la misma vista en un búfer pequeño (vistas.js).
   ===================================================================== */
const Vista2D = {
  parametros(cam, modo) {
    if (modo === 'cenital') return { yaw: cam.yaw, k: 1, hk: 0 };
    if (modo === 'maqueta') { const q = Math.round((cam.yaw - Math.PI / 4) / (Math.PI / 2)); return { yaw: Math.PI / 4 + q * Math.PI / 2, k: .5, hk: .82 }; }
    const p = clamp(cam.pitch, .15, 1.15); return { yaw: cam.yaw, k: Math.cos(p), hk: Math.sin(p) };
  },
  dibujar(g, W, H, E, op = {}) {
    const C = E.camara, modo = op.modo || 'cenital', P = this.parametros(C, modo), z = C.zoom, cs = Math.cos(P.yaw), sn = Math.sin(P.yaw);
    /* matriz mundo → pantalla (sin altura) */
    const a = z * cs, b = z * sn * P.k, c = -z * sn, d = z * cs * P.k, e = W / 2 - a * C.x - c * C.y, f = H / 2 - b * C.x - d * C.y;
    const pr = (x, y, h = 0) => [a * x + c * y + e, b * x + d * y + f - h * z * P.hk];
    const inv = (sx, sy) => { const det = a * d - b * c, X = sx - e, Y = sy - f; return [(d * X - c * Y) / det, (-b * X + a * Y) / det]; };
    E._pr = pr; E._vista = { modo, P, W, H, z };
    /* caja del mundo visible (con margen para lo alto) */
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [sx, sy] of [[0, -H * .6 * P.hk], [W, -H * .6 * P.hk], [0, H], [W, H]]) { const [wx, wy] = inv(sx, sy); x0 = Math.min(x0, wx); x1 = Math.max(x1, wx); y0 = Math.min(y0, wy); y1 = Math.max(y1, wy); }
    E._caja = [x0, y0, x1, y1];
    /* ---------- suelo ---------- */
    const sinTechos = modo !== 'cenital', pixel = !!op.pixel, Ls = z < .22 ? E.losasLejos : E.losas, Ld = Ls.L;
    let res = z * (op.dpr || 1); const RES = [.0625, .125, .25, .5, 1, 2, 3]; res = RES.find(r => r >= res * (pixel ? .9 : .8)) || 3; if (Ls === E.losasLejos) res = Math.min(res, .25);
    g.save(); g.fillStyle = '#5e8c4a'; g.fillRect(0, 0, W, H); g.setTransform(a, b, c, d, e, f); g.imageSmoothingEnabled = !pixel;
    const gx0 = Math.floor(x0 / Ld), gx1 = Math.floor(x1 / Ld), gy0 = Math.floor(y0 / Ld), gy1 = Math.floor(y1 / Ld); let faltan = 0;
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      let L = Ls.losa(gx, gy, res, faltan > (op.presupuesto ?? 2), sinTechos);
      if (!L) { faltan++; L = Ls.losa(gx, gy, Math.max(.0625, res / 4), false, sinTechos); }   // mientras llega la buena, una borrosa
      if (L) g.drawImage(L, gx * Ld, gy * Ld, Ld + .05, Ld + .05); else faltan++;
    }
    g.restore();
    const noche0 = E.cielo ? E.cielo.noche : 0; if (noche0 > .02) { g.fillStyle = 'rgba(8,18,52,' + (noche0 * .5).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    /* ---------- lo que se levanta: edificios, pasos elevados, vehículos y gente, en orden de profundidad ---------- */
    const objs = [], noche = E.cielo ? E.cielo.noche : 0, dy = (x, y) => b * x + d * y + f;
    if (modo !== 'cenital') {
      const minH = z < .5 ? 9 : z < 1 ? 5 : 0, maxN = Math.round(1800 * (E.calidad ?? 1));
      const lista = E.mundo.edificiosEn(x0, y0, x1, y1).filter(q => q.h >= minH); if (lista.length > maxN) lista.sort((p, q) => q.h * q.hw * q.hd - p.h * p.hw * p.hd).length = maxN;
      for (const q of lista) objs.push({ y: dy(q.x, q.y) + Math.max(q.hw, q.hd) * z * P.k * .5, t: 0, q });
      for (const q of E.mundo.sitios().E) { const k2 = q.caja; if (k2[2] < x0 || k2[0] > x1 || k2[3] < y0 || k2[1] > y1) continue; objs.push({ y: dy(q.x, q.y), t: 4, q }); }
    }
    for (const q of E.mundo.pasosEn(x0, y0, x1, y1)) if (q.nivel > 0) objs.push({ y: dy((q.caja[0] + q.caja[2]) / 2, (q.caja[1] + q.caja[3]) / 2) + 1e4 * 0, t: 1, q, cen: modo === 'cenital' });
    for (const v of E.vehiculos || []) objs.push({ y: dy(v.x, v.y) + (v.z || 0) * .001, t: 2, q: v });
    for (const p of E.peatones || []) objs.push({ y: dy(p.x, p.y), t: 3, q: p });
    if (E.jugador) objs.push({ y: dy(E.jugador.x, E.jugador.y) + .5, t: 5, q: E.jugador });
    for (const x of E.extras || []) objs.push({ y: dy(x.x, x.y), t: 6, q: x });
    objs.sort((p, q) => p.y - q.y);
    const luzX = Math.cos(P.yaw + 2.4), dibCtx = { g, pr, z, P, noche, E, luzX, modo, W, H };
    for (const o of objs) {
      if (o.t === 0) this.edificio(dibCtx, o.q); else if (o.t === 1) this.pasoElevado(dibCtx, o.q); else if (o.t === 2) this.vehiculo(dibCtx, o.q);
      else if (o.t === 3) this.peaton(dibCtx, o.q); else if (o.t === 4) this.sitio(dibCtx, o.q); else if (o.t === 5) this.jugador(dibCtx, o.q); else if (o.t === 6 && o.q.dibujar) o.q.dibujar(g, pr, z, P);
    }
    /* cables del Metrocable: el cable entre torres por encima de todo */
    if (E.cables) this.cables(dibCtx, E.cables);
    /* etiquetas (estaciones, lugares) */
    if (op.etiquetas !== false) this.etiquetas(dibCtx);
    return faltan;
  },
  /* prisma con techo: muros que miran a la cámara, sombreados por la luz, y el techo */
  prisma(D, P, z0, z1, muro, techo, ventanas) {
    const { g, pr, z, noche } = D, n = P.length >> 1; if (n < 3) return; const B = [], T = [];
    for (let i = 0; i < n; i++) { B.push(pr(P[2 * i], P[2 * i + 1], z0)); T.push(pr(P[2 * i], P[2 * i + 1], z1)); }
    let area = 0; for (let i = 0; i < n; i++) { const j = (i + 1) % n; area += B[i][0] * B[j][1] - B[j][0] * B[i][1]; } const sg = area > 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, ex = B[j][0] - B[i][0], ey = B[j][1] - B[i][1], ny = ex * sg; if (ny <= 0) continue;   // el muro mira hacia abajo de la pantalla: se ve
      const lz = clamp(.72 + .28 * (ey * sg / (Math.hypot(ex, ey) || 1)) * D.luzX + .1, .55, 1.05) - noche * .45;
      g.fillStyle = tono(muro, lz - 1); g.beginPath(); g.moveTo(B[i][0], B[i][1]); g.lineTo(B[j][0], B[j][1]); g.lineTo(T[j][0], T[j][1]); g.lineTo(T[i][0], T[i][1]); g.closePath(); g.fill();
      if (ventanas && z > 1.8 && D.ventanas !== false) { const alto = (z1 - z0), pisos = Math.min(14, Math.floor(alto / 3)), L = Math.hypot(ex, ey), cols = Math.min(6, Math.floor(L / (z * 3.2))); if (pisos >= 1 && cols >= 1) { for (let p = 0; p < pisos; p++) for (let q = 0; q < cols; q++) { const lit = noche > .3 && h2(i * 31 + q, p, ventanas) < .4; const u = (q + .3) / cols, v = (p + .35) / pisos, x = B[i][0] + ex * u, y = B[i][1] + ey * u - (T[i][1] - B[i][1]) * -v; g.fillStyle = lit ? 'rgba(255,214,120,' + (.55 + noche * .4) + ')' : 'rgba(25,35,50,.32)'; g.fillRect(x, y, Math.max(1, ex / cols * .45), Math.max(1, z * 1.2)); } } }
    }
    g.fillStyle = noche > .05 ? tono(techo, -noche * .5) : techo; g.beginPath(); g.moveTo(T[0][0], T[0][1]); for (let i = 1; i < n; i++) g.lineTo(T[i][0], T[i][1]); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = Math.max(.5, z * .15); g.stroke();
  },
  edificio(D, q) { const st = estiloEdificio(D.E.mundo, q), P = Mundo.esquinas(q); this.prisma(D, P, 0, q.h, st.muro, st.techo, q.h > 7 ? (q.s * 1e4 | 0) : 0); if (st.tanque && D.z > 1.5) { const [x, y] = D.pr(q.x, q.y, q.h + 1.2); D.g.fillStyle = '#1d1f24'; D.g.fillRect(x - D.z * .7, y - D.z * .4, D.z * 1.4, D.z * 1.2); } },
  sitio(D, q) {
    const ES = ['#b8673f', '#eceae4', '#bdbcb6', '#5e7b97', '#ece3cd', '#efe8d8', '#d4d8dd', '#3a3f4a', '#b9714b', '#d8432f', '#d9d4c9', '#a86a4c', '#e9dab3', '#2a302d', '#3a3f4a', '#6a645c', '#a6573a', '#e3e6ea', '#4b5a55'], m = ES[q.est] || '#d9d4c9', t = q.techo === 'dos' || q.techo === 'cuatro' ? '#b5542f' : q.techo === 'cupula' ? '#56665f' : tono(m, -.12);
    for (const R of q.R.slice(0, 1)) this.prisma(D, R, 0, q.partes ? q.partes[0].z0 || Math.min(q.h, 12) : q.h, m, t, 7);
    if (q.partes) for (const p of q.partes) this.prisma(D, p.B, p.z0, p.z1, ES[p.est] || m, p.techo === 'aguja' ? '#e3e6ea' : tono(ES[p.est] || m, -.15), 0);
  },
  pasoElevado(D, q) {
    const { g, pr, z } = D, h = q.nivel * NIVEL_M, p = q.p, n = p.length >> 1, L = q.ancho / 2, vi = q.tipo === 'viaducto', T = q.trazo || (q.trazo = new Trazo(p));
    const rampa = vi ? 0 : Math.min(q.largo * .4, q.peatonal ? 9 : 22), alt = s => h * (vi ? 1 : suave(Math.min(s, q.largo - s) / rampa));
    if (!D.cen) { g.fillStyle = vi ? '#9aa3ad' : '#a9a49a'; for (let s = 12; s < q.largo - 6; s += vi ? 30 : 24) { const c = T.at(s), [x, y] = pr(c.x, c.y, 0), [, y2] = pr(c.x, c.y, alt(s)); const w = Math.max(1, z * 1.4); g.fillRect(x - w / 2, y2, w, y - y2); } }
    const izq = [], der = []; for (let s = 0; s <= q.largo; s += Math.max(2, 8 / Math.max(.3, z))) { const c = T.at(s), nx = -Math.sin(c.a), ny = Math.cos(c.a), hh = D.cen ? 0 : alt(s); izq.push(pr(c.x + nx * L, c.y + ny * L, hh)); der.push(pr(c.x - nx * L, c.y - ny * L, hh)); }
    if (D.cen) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); izq.forEach(([x, y], i) => i ? g.lineTo(x + z * 2, y + z * 3) : g.moveTo(x + z * 2, y + z * 3)); der.slice().reverse().forEach(([x, y]) => g.lineTo(x + z * 2, y + z * 3)); g.fill(); }
    if (!D.cen) { g.fillStyle = vi ? '#7f8891' : '#8e8a80'; g.beginPath(); der.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); der.slice().reverse().forEach(([x, y]) => g.lineTo(x, y + z * 1.1)); g.fill(); }
    g.fillStyle = vi ? '#c9cfd8' : q.peatonal ? '#d8cfbd' : '#5a5f69'; g.beginPath(); izq.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); der.slice().reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fill();
    if (vi) { g.strokeStyle = '#6f7177'; g.lineWidth = Math.max(.5, z * .25); for (const lado of [-1.3, 1.3]) { g.beginPath(); for (let s = 0; s <= q.largo; s += 6) { const c = T.at(s, lado), [x, y] = pr(c.x, c.y, h + .1); s ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(.4, z * .2); for (const B of [izq, der]) { g.beginPath(); B.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
  },
  vehiculo(D, v) {
    const { g, pr, z, P, noche } = D;
    if (v.clase === 'metro' || v.clase === 'tram') { const L = D.E.transporte && D.E.transporte.lineas.find(l => l.id === v.linea); if (L) { const n = v.clase === 'metro' ? 6 : 2, coche = v.largo / n; if (D.modo === 'cenital') Pincel.trenArriba(g, L.T, v.s, v.dir, n, coche, v.color, (x, y) => pr(x, y, v.z)); else for (let i = n - 1; i >= 0; i--) { const sc = v.s - v.dir * (i + .5) * coche, c = L.T.at(sc), ux = Math.cos(c.a) * coche * .48, uy = Math.sin(c.a) * coche * .48, nx = -Math.sin(c.a) * 1.5, ny = Math.cos(c.a) * 1.5; this.prisma(D, [c.x - ux + nx, c.y - uy + ny, c.x + ux + nx, c.y + uy + ny, c.x + ux - nx, c.y + uy - ny, c.x - ux - nx, c.y - uy - ny], v.z + .4, v.z + 3.6, '#e6e9ee', '#c9cfd8', 0); } return; } }
    if (v.clase === 'cable') { const [x, y] = pr(v.x, v.y, v.z), s = Math.max(2, z * 2.2), sw = Math.sin((D.E.t || 0) * 1.3 + v.s * .1) * (D.E.clima ? D.E.clima.viento.v * .25 : .5); g.save(); g.translate(x, y); g.rotate(sw * .05); g.fillStyle = '#2d3138'; g.fillRect(-.15 * s, -1.2 * s, .3 * s, 1.2 * s); g.fillStyle = v.color || '#e38835'; g.fillRect(-s * .8, 0, s * 1.6, s * 1.3); g.fillStyle = 'rgba(200,225,240,.85)'; g.fillRect(-s * .6, s * .2, s * 1.2, s * .5); g.restore(); return; }
    const T = TRAF_TIPOS[v.tipo] || TRAF_TIPOS.carro, L = v.largo || T.largo, Wd = v.ancho || T.ancho;
    if (D.modo === 'cenital') { const [x, y] = pr(v.x, v.y, v.z || 0); g.save(); g.translate(x, y); g.rotate(v.a + P.yaw); g.scale(z, z); Pincel.vehiculoArriba(g, v.tipo, v.color, L, Wd, v.frena, noche > .4); g.restore(); return; }
    const ux = Math.cos(v.a) * L / 2, uy = Math.sin(v.a) * L / 2, nx = -Math.sin(v.a) * Wd / 2, ny = Math.cos(v.a) * Wd / 2, h = v.tipo === 'buseta' || v.tipo === 'camion' ? 3 : v.tipo === 'moto' || v.tipo === 'bici' ? 1.2 : 1.45;
    this.prisma(D, [v.x - ux + nx, v.y - uy + ny, v.x + ux + nx, v.y + uy + ny, v.x + ux - nx, v.y + uy - ny, v.x - ux - nx, v.y - uy - ny], (v.z || 0) + .3, (v.z || 0) + h, v.color, tono(v.color, .12), 0);
    if (noche > .4) { const [x, y] = D.pr(v.x + ux * 1.05, v.y + uy * 1.05, .8); g.fillStyle = 'rgba(255,240,190,.9)'; g.fillRect(x - 1, y - 1, 2.5, 2.5); }
  },
  peaton(D, p) {
    const { g, pr, z, P } = D, A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)), [x, y] = pr(p.x, p.y, 0);
    if (z < .8) { g.fillStyle = A.cCamisa; g.fillRect(x - 1, y - 2, 2, 2); return; }
    if (D.modo === 'cenital') { const J = Personaje.pose('camina', p.fase); J.fase = p.fase; MC.arte.f('personajeArriba')(g, J, A, x, y, z, p.a + P.yaw); return; }
    const J = Personaje.pose('camina', p.fase, { alto: A.alto }), dir = Math.cos(p.a + P.yaw) >= 0 ? 1 : -1; (MC.arte.f('personajeLado'))(g, J, A, x, y, z * P.hk, dir);
  },
  jugador(D, j) {
    const { g, pr, z, P } = D, C = j.cuerpo, A = j.aspecto, V = C.veh, [x, y] = pr(C.x, C.y, C.zPaso + C.z), fn = MC.arte.f('jugador');
    if (fn && fn(g, j, x, y, z, P, D) !== false) return;
    g.fillStyle = 'rgba(0,0,0,.3)'; const [sx, sy] = pr(C.x, C.y, C.zPaso); g.beginPath(); g.ellipse(sx, sy, Math.max(2, z * .7), Math.max(1.2, z * .4 * P.k), 0, 0, TAU); g.fill();
    if (D.modo === 'cenital') {
      g.save(); g.translate(x, y); g.rotate(C.a + P.yaw); g.scale(z, z);
      if (V.clase !== 'pie') { if (V.clase === 'auto' || V.clase === 'pesado' || V.clase === 'moto') { Pincel.vehiculoArriba(g, V.clase === 'moto' ? 'moto' : 'carro', V.color, V.largo, V.ancho, false, false); g.restore(); return; } g.fillStyle = '#1d1f24'; g.fillRect(-V.largo / 2, -.08, V.largo, .16); g.fillStyle = V.color || '#7ab800'; g.fillRect(-V.largo * .3, -.25, V.largo * .6, .5); }
      g.restore(); const J = Personaje.pose(C.estado || 'quieto', C.fase); J.fase = C.fase; MC.arte.f('personajeArriba')(g, J, A, x, y, z, C.a + P.yaw); return;
    }
    const dir = Math.cos(C.a + P.yaw) >= 0 ? 1 : -1, esc = Math.max(4, z * P.hk * 1.1);
    const vl = MC.arte.f('vehiculoLado'); if (vl && V.clase !== 'pie') vl(g, V, x, y, esc, dir, C);
    const J = Personaje.pose(C.estado || 'quieto', C.fase, { alto: A.alto, manubrio: V.manubrio }); MC.arte.f('personajeLado')(g, J, A, x, y, esc, dir);
  },
  cables(D, cables) { const { g, pr, z } = D; g.strokeStyle = 'rgba(30,32,38,.8)'; g.lineWidth = Math.max(.6, z * .12); for (const L of cables) { g.beginPath(); for (let s = 0; s <= L.T.largo; s += 20) { let dE = 1e9; for (const e of L.est) dE = Math.min(dE, Math.abs(e.s - s)); const c = L.T.at(s), h = 6 + 22 * suave(clamp(dE / 120, 0, 1)), [x, y] = pr(c.x, c.y, h); s ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } },
  etiquetas(D) {
    const { g, pr, z, W, H, E } = D; if (z < .35) return; g.font = '700 ' + Math.round(clamp(z * 4, 10, 14)) + 'px system-ui, sans-serif'; g.textAlign = 'center';
    const pon = (t, x, y, col) => { const [sx, sy] = pr(x, y, 8); if (sx < -60 || sx > W + 60 || sy < -20 || sy > H + 20) return; const w = g.measureText(t).width + 10; g.fillStyle = 'rgba(10,35,66,.82)'; g.fillRect(sx - w / 2, sy - 16, w, 18); g.fillStyle = col; g.fillText(t, sx, sy - 3); };
    for (const l of E.transporte ? E.transporte.lineas : []) if (l.clase === 'metro' || l.clase === 'cable' || l.clase === 'tram') for (const s of l.est) { const q = l.T.at(s.s); pon(s.nombre, q.x, q.y, '#ffffff'); }
    if (z > .9) for (const s of E.mundo.transporte.encicla) pon('🚲 ' + s.nombre, s.x, s.y, '#c4ec7c');
    for (const L of E.mundo.lugares) if (!L.secreto) pon(L.nombre, L.x, L.y, '#ffd84a');
  }
};
MC.Vista2D = Vista2D;

/* ---- js/42-vehiculos-lado.js ---- */
/* =====================================================================
   VEHÍCULOS DE PERFIL (piel del motor) · para la panorámica, las plataformas, la 3D oblicua y las postales
   (g, V, x, y, esc, dir, cuerpo): y es el suelo; esc, px por metro; dir 1 mira a la derecha.
   Cada juego pone los suyos con MC.arte.registrar(juego, { vehiculoLado(g, V, …) }).
   ===================================================================== */
MC.arte.pieles.motor.vehiculoLado = function (g, V, x, y, esc, dir = 1, C) {
  const k = esc, f = C ? C.fase : 0, col = V.color || '#7ab800', X = u => x + u * k * dir, Y = v => y - v * k;
  const rueda = (u, r, rayos = 4) => { g.fillStyle = '#1b1f27'; g.beginPath(); g.arc(X(u), Y(r), r * k, 0, TAU); g.fill(); g.fillStyle = '#9aa3ad'; g.beginPath(); g.arc(X(u), Y(r), r * k * .55, 0, TAU); g.fill(); g.strokeStyle = '#1b1f27'; g.lineWidth = Math.max(1, k * .04); for (let i = 0; i < rayos; i++) { const a = f * 2 * dir + i * Math.PI / rayos; g.beginPath(); g.moveTo(X(u) - Math.cos(a) * r * k * .5, Y(r) - Math.sin(a) * r * k * .5); g.lineTo(X(u) + Math.cos(a) * r * k * .5, Y(r) + Math.sin(a) * r * k * .5); g.stroke(); } };
  const tubo = (u1, v1, u2, v2, c, w = .06) => { g.strokeStyle = c; g.lineWidth = Math.max(1, w * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(X(u1), Y(v1)); g.lineTo(X(u2), Y(v2)); g.stroke(); };
  const caja = (u, v, w, h, c) => { g.fillStyle = c; g.fillRect(Math.min(X(u), X(u + w)), Y(v + h), Math.abs(w * k), h * k); };
  const base = V.de && !['bici', 'patinete', 'skate', 'patines', 'carro', 'camion', 'metro', 'buseta', 'avioneta', 'lancha'].includes(V.id) ? V.de : V.id;
  switch (V.clase === 'auto' ? 'carro' : V.clase === 'pesado' ? 'camion' : V.clase === 'riel' ? 'metro' : V.clase === 'aire' && V.id !== 'jetpack' ? 'avioneta' : V.clase === 'agua' ? (V.cuerpo === 'tabla' ? 'surf' : 'lancha') : base) {
    case 'bici': case 'bici_propia': case 'ebike': case 'bmx': case 'mtb': case 'ruta': case 'triciclo': {
      const r = V.id === 'bmx' ? .26 : .34; rueda(-.52, r, 6); rueda(.55, r, 6); if (V.id === 'triciclo') { caja(.35, .35, .7, .45, '#ffb300'); }
      tubo(-.52, r, -.05, r, col, .08); tubo(-.05, r, .32, .82, col, .08); tubo(-.52, r, -.12, .82, col, .08); tubo(-.12, .82, .32, .82, col, .07); tubo(.55, r, .36, 1.0, '#2b2f38', .06); tubo(.3, 1.0, .46, 1.02, '#2b2f38', .07); tubo(-.12, .82, -.16, .95, '#2b2f38', .06); tubo(-.25, .96, -.04, .96, '#1d1f24', .1);
      if (V.id === 'bici') { caja(.48, .7, .32, .22, '#7ab800'); }   // la canasta verde de EnCicla
      if (V.electrico) caja(-.36, .5, .32, .14, '#1d1f24');
      break;
    }
    case 'patinete': case 'scooter': case 'monopatin': { rueda(-.42, .1, 2); rueda(.42, .1, 2); caja(-.48, .1, .96, .07, col); tubo(.42, .14, .36, 1.0, '#2b2f38', .06); tubo(.26, 1.0, .46, 1.0, '#2b2f38', .07); break; }
    case 'monociclo': { rueda(0, .22, 3); caja(-.18, .3, .36, .06, col); break; }
    case 'skate': case 'longboard': { const L = V.largo / 2; rueda(-L * .7, .05, 1); rueda(L * .7, .05, 1); g.fillStyle = col; g.beginPath(); g.moveTo(X(-L), Y(.16)); g.lineTo(X(-L * .85), Y(.1)); g.lineTo(X(L * .85), Y(.1)); g.lineTo(X(L), Y(.16)); g.lineTo(X(L * .85), Y(.13)); g.lineTo(X(-L * .85), Y(.13)); g.fill(); break; }
    case 'patines': case 'quad': { for (const u of [-.12, .12]) { caja(u - .12, .02, .24, .1, col); for (const w of [-.08, 0, .08]) rueda(u + w, .03, 1); } break; }
    case 'jetpack': { caja(-.35, 1.0, .22, .45, '#ff7043'); if (C && C.z > .2) { g.fillStyle = 'rgba(255,170,60,.85)'; g.beginPath(); g.moveTo(X(-.3), Y(1.0)); g.lineTo(X(-.24 - Math.random() * .08), Y(.45)); g.lineTo(X(-.18), Y(1.0)); g.fill(); } break; }
    case 'moto': { rueda(-.65, .3, 5); rueda(.68, .3, 5); g.fillStyle = col; g.beginPath(); g.moveTo(X(-.6), Y(.55)); g.lineTo(X(.2), Y(.75)); g.lineTo(X(.6), Y(.6)); g.lineTo(X(.3), Y(.4)); g.lineTo(X(-.5), Y(.4)); g.fill(); tubo(.68, .3, .5, .95, '#2b2f38', .07); caja(-.6, .62, .5, .12, '#1d1f24'); break; }
    case 'carro': {
      const L = V.largo, Hc = 1.45; rueda(-L * .32, .32, 5); rueda(L * .32, .32, 5);
      g.fillStyle = col; g.beginPath(); g.moveTo(X(-L / 2), Y(.3)); g.lineTo(X(-L / 2), Y(.85)); g.lineTo(X(-L * .3), Y(.9)); g.lineTo(X(-L * .18), Y(Hc)); g.lineTo(X(L * .2), Y(Hc)); g.lineTo(X(L * .36), Y(.92)); g.lineTo(X(L / 2), Y(.8)); g.lineTo(X(L / 2), Y(.3)); g.fill();
      g.fillStyle = 'rgba(140,190,220,.9)'; g.beginPath(); g.moveTo(X(-L * .15), Y(Hc - .07)); g.lineTo(X(L * .17), Y(Hc - .07)); g.lineTo(X(L * .3), Y(.95)); g.lineTo(X(-L * .26), Y(.95)); g.fill();
      if (V.id === 'formula') { caja(-L / 2, .9, .3, .35, '#1d1f24'); } if (V.id === 'taxi') caja(-.3, Hc, .6, .15, '#1d1f24');
      break;
    }
    case 'camion': case 'buseta': case 'metroplus': { const L = V.largo; rueda(-L * .32, .45, 5); rueda(L * .33, .45, 5); caja(-L / 2, .45, L, 2.6, col); g.fillStyle = 'rgba(40,60,80,.85)'; for (let i = 0; i < Math.floor(L / 1.6); i++) caja(-L / 2 + .3 + i * 1.6, 1.8, 1, .8, 'rgba(40,60,80,.85)'); break; }
    case 'metro': case 'tranvia': { const n = V.id === 'tranvia' ? 2 : 3, Lc = Math.min(22, V.largo / n); for (let i = 0; i < n; i++) { const u = -i * (Lc + .6) - Lc / 2; caja(u - Lc / 2, .5, Lc, 3.1, '#e6e9ee'); caja(u - Lc / 2, 1.2, Lc, .35, V.color); for (let w = 0; w < 5; w++) caja(u - Lc / 2 + .8 + w * Lc / 5.4, 2.1, Lc / 8, .9, 'rgba(40,55,75,.85)'); rueda(u - Lc * .35, .35, 4); rueda(u + Lc * .35, .35, 4); } break; }
    case 'avioneta': case 'avion': { const L = V.largo; g.fillStyle = col; g.beginPath(); g.ellipse(X(0), Y(1.2), L / 2 * k, .55 * k, 0, 0, TAU); g.fill(); caja(-.6, 1.1, 1.6, .18, tono(col, -.15)); g.beginPath(); g.moveTo(X(-L / 2), Y(1.2)); g.lineTo(X(-L / 2 - .2), Y(2.4)); g.lineTo(X(-L / 2 + .8), Y(1.3)); g.fill(); g.fillStyle = 'rgba(140,190,220,.9)'; g.fillRect(Math.min(X(L * .15), X(L * .3)), Y(1.6), Math.abs(L * .15 * k), .3 * k); if (!C || C.z < .3) { rueda(-.4, .2, 2); rueda(L * .3, .2, 2); } break; }
    case 'lancha': { const L = V.largo; g.fillStyle = col; g.beginPath(); g.moveTo(X(-L / 2), Y(.9)); g.lineTo(X(L / 2), Y(.9)); g.lineTo(X(L / 2 - .6), Y(.1)); g.lineTo(X(-L / 2), Y(.2)); g.fill(); caja(-L * .1, .9, L * .25, .5, 'rgba(140,190,220,.9)'); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(Math.min(X(-L / 2 - 1.5), X(-L / 2)), Y(.15), 1.5 * k, .12 * k); break; }
    case 'surf': { caja(-1.1, .02, 2.2, .1, col); break; }
    default: break;
  }
};

/* ---- js/43-panoramica.js ---- */
/* =====================================================================
   PANORÁMICA 2D HÍBRIDA (de perfil) · la vista que pidió el autor con cuidado especial
   Junta y mejora las dos:
   - El Metro (23-lado.js, «estilo odisea»): el recorrido de perfil sobre el relieve real, montañas en capas con
     perspectiva atmosférica, cielo por hora con sol y luna, nubes, gallinazos, lluvia, niebla y relámpagos, las
     luces de los barrios que se encienden de noche, el tren en el viaducto y el Metrocable con su balanceo.
   - Juega EnCicla (renderPano): plataformas; la bici sigue la ruta sola (→ pedalea, ← frena, ↑ salta).
   Mejoras: la fila de edificios del frente sale del mundo real (su huella, su altura, el color de su zona y las
   ventanas de noche); los emblemáticos con su silueta al pasar; capas con paralaje por distancia real
   (cordillera, laderas con sus barrios, ciudad media y calle); subidas y bajadas reales; puentes, viaducto y
   deprimidos a su altura; cruces con su nombre; tráfico y gente de perfil; sirve para TODOS los vehículos y el
   personaje (y el tren, el tranvía y el cable); se ve bien con el celular vertical y acostado; y entra y sale
   de la cenital con una transición suave en el mismo punto.
   ===================================================================== */
const PANO_ST = 4, PANO_BLOQUE = 64;
class Panoramica {
  constructor(mundo) { this.mundo = mundo; this.bloques = new Map(); this.id = 0; this._bc = {}; this.lado = -1; this.ex = 1.35; }
  /* un recorrido nuevo (o el lado cambia): se olvida lo calculado */
  reiniciar(id) { this.bloques.clear(); this.id = id; this._bc = {}; }
  par(d) { return 140 / (140 + Math.max(0, d - 10)); }
  /* punto del trazo; más allá de sus puntas sigue derecho (así las montañas lejanas no se aplanan) */
  _pt(T, s) { if (s >= 0 && s <= T.largo) return T.at(s); const fin = s > T.largo, e = T.at(fin ? T.largo : 0), a = T.rumbo(fin ? T.largo - 3 : 3, 3), d = fin ? s - T.largo : s; return { x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, a, i: e.i }; }
  /* ---------- perfil por bloques de 64 m a lo largo del trazo ---------- */
  bloque(T, i) {
    const k = i; let B = this.bloques.get(k); if (B) return B;
    const M = this.mundo, s0 = i * PANO_BLOQUE, n = PANO_BLOQUE / PANO_ST + 1, L = this.lado;
    B = { s0, cerca: new Float32Array(n), medio: new Float32Array(n), lejos: new Float32Array(n), urbM: new Float32Array(n), urbL: new Float32Array(n), tt: new Uint8Array(n), alzado: new Float32Array(n), frente: [], ciudad: [], primer: [], hitos: [], cruces: [], estaciones: [], pasos: [], arboles: [] };
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; const Q = [];
    for (let j = 0; j < n; j++) {
      const s = s0 + j * PANO_ST, q = this._pt(T, s), bx = -Math.sin(q.a) * L, by = Math.cos(q.a) * L; Q.push({ s, x: q.x, y: q.y, a: q.a, bx, by });
      B.cerca[j] = M.cota(q.x, q.y); B.tt[j] = M.suelo(q.x + bx * 9, q.y + by * 9);
      let m = 0, f = 0, um = 0, ul = 0; for (const d of [400, 700, 1000, 1300, 1600]) { const x = q.x + bx * d, y = q.y + by * d; m = Math.max(m, M.cota(x, y)); um += TT_URBANO.has(M.suelo(x, y)) ? .2 : 0; }
      for (const d of [2000, 3000, 4200, 5600, 7000]) { const x = q.x + bx * d, y = q.y + by * d; f = Math.max(f, M.cota(x, y)); ul += TT_URBANO.has(M.suelo(x, y)) ? .2 : 0; }
      B.medio[j] = m; B.lejos[j] = f; B.urbM[j] = um; B.urbL[j] = ul;
      bx0 = Math.min(bx0, q.x); bx1 = Math.max(bx1, q.x); by0 = Math.min(by0, q.y); by1 = Math.max(by1, q.y);
    }
    const proyecta = (x, y) => { let bj = 0, bd = 1e18; for (let j = 0; j < Q.length; j++) { const d = (Q[j].x - x) ** 2 + (Q[j].y - y) ** 2; if (d < bd) { bd = d; bj = j; } } const q = Q[bj], ux = Math.cos(q.a), uy = Math.sin(q.a), dx = x - q.x, dy = y - q.y; return { s: q.s + dx * ux + dy * uy, d: dx * q.bx + dy * q.by, j: bj, a: q.a }; };
    /* edificios reales: frente (6–60 m al fondo), ciudad media (60–500 m), primer plano (al lado de la cámara) */
    for (const e of M.edificiosEn(bx0 - 500, by0 - 500, bx1 + 500, by1 + 500)) {
      const p = proyecta(e.x, e.y); if (p.s < s0 - 20 || p.s > s0 + PANO_BLOQUE + 20) continue; const st = estiloEdificio(M, e), ca = Math.cos(p.a), sa = Math.sin(p.a), ext = Math.abs(e.ux * ca + e.uy * sa) * e.hw + Math.abs(-e.uy * ca + e.ux * sa) * e.hd + .5, ob = { s: p.s, a: p.s - ext, b: p.s + ext, h: e.h, d: p.d, muro: st.muro, techo: st.techo, plano: st.plano, sem: e.s, cota: M.cota(e.x, e.y), clase: e.clase };
      if (p.d > 5 && p.d <= 60) B.frente.push(ob); else if (p.d > 60 && p.d < 500 && e.h > 6) B.ciudad.push(ob); else if (p.d < -5 && p.d > -40) B.primer.push(ob);
    }
    B.frente.sort((a, b) => b.d - a.d); B.ciudad.sort((a, b) => b.d - a.d);
    /* emblemáticos: hitos con huella y altura (la aguja del Coltejer, la basílica…) */
    for (const h of M.hitos) { const P = h.huella[0]; let cx = 0, cy = 0; for (let t = 0; t < P.length; t += 2) { cx += P[t]; cy += P[t + 1]; } cx /= P.length / 2; cy /= P.length / 2; if (cx < bx0 - 900 || cx > bx1 + 900 || cy < by0 - 900 || cy > by1 + 900) continue; const p = proyecta(cx, cy); if (p.s < s0 || p.s >= s0 + PANO_BLOQUE || p.d < 0 || p.d > 900) continue; let w = 0; for (let t = 0; t < P.length; t += 2) w = Math.max(w, Math.hypot(P[t] - cx, P[t + 1] - cy)); B.hitos.push({ s: p.s, d: p.d, h: h.alto + (h.corona || 0), w: w * 1.6, clase: h.clase, nombre: h.nombre, cota: M.cota(cx, cy) }); }
    /* estaciones EnCicla y del sistema cerca de la vía */
    for (const e of M.transporte.encicla) { if (e.x < bx0 - 40 || e.x > bx1 + 40 || e.y < by0 - 40 || e.y > by1 + 40) continue; const p = proyecta(e.x, e.y); if (Math.abs(p.d) < 40 && p.s >= s0 && p.s < s0 + PANO_BLOQUE) B.estaciones.push({ s: p.s, d: p.d, tipo: 'encicla', nombre: e.nombre }); }
    for (const l of M.transporte.lineas) if (l.clase === 'metro' || l.clase === 'tram' || l.clase === 'cable' || l.clase === 'brt') for (const e of l.estaciones) { if (e[1] < bx0 - 250 || e[1] > bx1 + 250 || e[2] < by0 - 250 || e[2] > by1 + 250) continue; const p = proyecta(e[1], e[2]); if (p.d > -30 && p.d < 250 && p.s >= s0 && p.s < s0 + PANO_BLOQUE) B.estaciones.push({ s: p.s, d: p.d, tipo: l.clase, color: l.color, nombre: e[0], linea: l.id, nivel: l.clase === 'metro' ? Math.max(0, M.nivel(e[1], e[2])) : 0, cota: M.cota(e[1], e[2]) }); }
    /* puentes, viaducto y deprimidos: el trazo va encima (alineado) o pasa por debajo (cruce) */
    for (const P of M.pasosEn(bx0 - 60, by0 - 60, bx1 + 60, by1 + 60)) {
      const Tp = P.trazo || (P.trazo = new Trazo(P.p));
      for (let j = 0; j < Q.length; j++) { const q = Q[j], pr = Tp.proyectar(q.x, q.y); if (pr.d > P.ancho / 2 + 6) continue; const c = Tp.at(pr.s), al = Math.abs(Math.cos(angDif(q.a, c.a))); const rampa = P.tipo === 'viaducto' ? 1e-6 : Math.min(P.largo * .4, P.tipo === 'tunel' ? 26 : P.peatonal ? 9 : 22), h = P.nivel * NIVEL_M * (P.tipo === 'viaducto' ? 1 : suave(Math.min(pr.s, P.largo - pr.s) / rampa));
        if (al > .9 && P.tipo !== 'viaducto' && !this.sinPasos) B.alzado[j] = Math.abs(h) > Math.abs(B.alzado[j]) ? h : B.alzado[j];
        else if (al < .75 && P.nivel > 0 && !B.pasos.some(o => o.P === P)) B.pasos.push({ P, s: q.s, h, ancho: P.ancho / Math.max(.35, Math.sqrt(1 - al * al)), tipo: P.tipo }); }
      if (P.tipo === 'viaducto') { for (let t = 0; t < P.largo; t += 30) { const c = Tp.at(t); if (c.x < bx0 - 300 || c.x > bx1 + 300 || c.y < by0 - 300 || c.y > by1 + 300) continue; const p = proyecta(c.x, c.y); if (p.s >= s0 && p.s < s0 + PANO_BLOQUE && p.d > 8 && p.d < 300) B.pasos.push({ P, s: p.s, d: p.d, h: P.nivel * NIVEL_M, tipo: 'viaducto_lado', cota: M.cota(c.x, c.y) }); } }
    }
    /* cruces de calles (con su nombre) */
    const Rc = M.red('calles'); let ultimo = -1e9;
    for (const q of Q) { if (q.s - ultimo < 18) continue; const c = Rc.cercana(q.x, q.y, 9, e => Math.abs(Math.cos(angDif(q.a, e.t.rumbo(e.t.proyectar(q.x, q.y).s)))) < .55); if (c) { B.cruces.push({ s: q.s, nombre: c.arista.nombre, ancho: c.arista.ancho }); ultimo = q.s; } }
    /* árboles por zona en las orillas */
    for (let s = s0; s < s0 + PANO_BLOQUE; s += 6) { const hv = h2(s | 0, 7, 3), q = this._pt(T, s), Z = M.estilo(q.x, q.y); if (hv < (Z.arboles || .4) * .6) B.arboles.push({ s: s + hv * 5, r: 2.4 + hv * 3, lado: h2(s | 0, 8, 3) < .65 ? 1 : -1, col: hv }); }
    this.bloques.set(k, B); while (this.bloques.size > 90) this.bloques.delete(this.bloques.keys().next().value);
    return B;
  }
  /* el fondo (cordillera, cerros y laderas) se mira por un eje recto y suavizado que pasa por el jugador:
     así una esquina del camino no hace saltar las montañas */
  fondo(T, s0) {
    const q = T.at(clamp(s0, 0, T.largo)), a0 = Math.atan2(T.at(clamp(s0 + 150, 0, T.largo)).y - T.at(clamp(s0 - 150, 0, T.largo)).y, T.at(clamp(s0 + 150, 0, T.largo)).x - T.at(clamp(s0 - 150, 0, T.largo)).x), F = this._fondo;
    if (F && F.id === this.id && Math.hypot(q.x - F.x, q.y - F.y) < 350 && Math.abs(angDif(F.a, a0)) < .35) return F;
    const M = this.mundo, a = F && F.id === this.id && Math.abs(angDif(F.a, a0)) < .6 ? F.a + angDif(F.a, a0) * .5 : a0, st = 30, n = 241, ux = Math.cos(a), uy = Math.sin(a), bx = -uy * this.lado, by = ux * this.lado, R = { id: this.id, x: q.x, y: q.y, a, s0, st, n, lejos: new Float32Array(n), medio: new Float32Array(n), urbM: new Float32Array(n), urbL: new Float32Array(n) };
    for (let i = 0; i < n; i++) { const d = (i - (n >> 1)) * st, x = q.x + ux * d, y = q.y + uy * d; let m = 0, f = 0, um = 0, ul = 0; for (const e of [400, 700, 1000, 1300, 1600]) { const X = x + bx * e, Y = y + by * e; m = Math.max(m, M.cota(X, Y)); um += TT_URBANO.has(M.suelo(X, Y)) ? .2 : 0; } for (const e of [2000, 3000, 4200, 5600, 7000]) { const X = x + bx * e, Y = y + by * e; f = Math.max(f, M.cota(X, Y)); ul += TT_URBANO.has(M.suelo(X, Y)) ? .2 : 0; } R.lejos[i] = f; R.medio[i] = m; R.urbM[i] = um; R.urbL[i] = ul; }
    const sm = (A, r) => { const o = new Float32Array(A.length); for (let i = 0; i < A.length; i++) { let t = 0, c = 0; for (let j = Math.max(0, i - r); j <= Math.min(A.length - 1, i + r); j++) { t += A[j]; c++; } o[i] = t / c; } return o; };
    R.lejos = sm(R.lejos, 3); R.medio = sm(R.medio, 1);
    /* cerros intermedios (de El Metro: el escalonado de siluetas) y un poco de detalle en la cresta */
    R.inter = new Float32Array(n); for (let i = 0; i < n; i++) { const u = (i - (n >> 1)) * st; R.inter[i] = R.lejos[i] * .6 + R.medio[i] * .4 + Math.sin(u * .0032 + 1) * 45 + Math.sin(u * .011) * 22; R.lejos[i] += Math.sin(u * .0021) * 30 + Math.sin(u * .0067 + 2) * 16 + (h2(i, 3, 17) - .5) * 10; }
    R.inter = sm(R.inter, 2); R.urbI = R.urbM.map((v, i) => (v + R.urbL[i]) / 2); return (this._fondo = R);
  }
  mf(campo, s) { const F = this._fondo, f = clamp((s - F.s0) / F.st + (F.n >> 1), 0, F.n - 1.001), i = f | 0, t = f - i; return F[campo][i] * (1 - t) + F[campo][i + 1] * t; }
  muestra(T, campo, s) { const i = Math.floor(s / PANO_BLOQUE), B = this.bloque(T, i), f = clamp((s - B.s0) / PANO_ST, 0, PANO_BLOQUE / PANO_ST - .001), j = f | 0, t = f - j; return B[campo][j] * (1 - t) + B[campo][j + 1] * t; }
  /* ---------- dibujo ----------
     E.pano = { trazo, s, id } (el camino que se sigue y dónde va el jugador) · op: { k (px por metro), sinJugador } */
  dibujar(g, W, H, E, op = {}) {
    const pn = E.pano; if (!pn || !pn.trazo) return; if (pn.id !== this.id) this.reiniciar(pn.id);
    const T = pn.trazo, s0 = pn.s, M = this.mundo, sky = E.cielo, t = E.t || 0, dir = -this.lado, vertical = H > W * 1.15;
    const k = op.k || clamp(Math.min(W, H * 1.4) / 70, 4, 40) * (E.camara.zoom / 3.2), cx = dir > 0 ? W * (vertical ? .3 : .36) : W * (vertical ? .7 : .64), base = H * (vertical ? .6 : .66), ex = this.ex, kj = k * 1.45;
    const z0 = this.muestra(T, 'cerca', s0) + this.muestra(T, 'alzado', s0), X = s => cx + (s - s0) * k * dir, sMin = s0 - (dir > 0 ? cx : W - cx) / k - 20, sMax = s0 + (dir > 0 ? W - cx : cx) / k + 20;
    const Ysuelo = s => base - (this.muestra(T, 'cerca', s) - z0) * k * ex - this.muestra(T, 'alzado', s) * k;
    const ink = [.05, .07, .12], C = (c, a = 1) => css3(c, a), noche = sky.noche, dia = sky.dia;
    /* 1. cielo, estrellas, sol y luna donde de verdad están (mirando hacia el fondo) */
    const gr = g.createLinearGradient(0, 0, 0, base); gr.addColorStop(0, C(sky.top)); gr.addColorStop(.75, C(sky.hor)); gr.addColorStop(1, C(sky.bruma)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (noche > .3) for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(255,245,220,' + (noche * (.3 + .5 * Math.abs(Math.sin(t * .6 + i)))) + ')'; g.fillRect(h2(i, 3, 1) * W, h2(i, 4, 1) * base * .7, 1.5, 1.5); }
    const qv = T.at(s0), mira = Math.atan2(-Math.sin(qv.a) * this.lado, -Math.cos(qv.a) * this.lado);   // acimut hacia el fondo (desde el norte, horario)
    const astro = (A, r, col, halo) => { const dA = angDif(mira, A.az), sx = W / 2 + dA / 1.25 * (W / 2), sy = base - Math.sin(A.alt) / Math.sin(1.2) * base * .9; if (A.alt < -.05 || Math.abs(dA) > 1.5) return; if (halo) { g.fillStyle = halo; g.beginPath(); g.arc(sx, sy, r * 3, 0, TAU); g.fill(); } g.fillStyle = col; g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill(); return [sx, sy]; };
    const rr = Math.min(W, H) * .04; astro(sky.sol, rr, 'rgba(255,240,205,.95)', 'rgba(255,215,150,.18)');
    const lu = astro(sky.luna, rr * .7, 'rgba(240,240,225,.92)'); if (lu && sky.luna.fase) { g.fillStyle = C(sky.top); g.beginPath(); g.arc(lu[0] + rr * .7 * (sky.luna.fase < .5 ? .6 : -.6) * (1 - Math.abs(sky.luna.fase - .5) * 2), lu[1], rr * .65, 0, TAU); g.fill(); }
    /* nubes con paralaje 0,08 (más y más grises si llueve) */
    const nN = 4 + Math.round((E.clima ? E.clima.nubes : .2) * 8); for (let i = 0; i < nN; i++) { const x = ((h2(i, 1, 9) * W * 2 - s0 * k * .08 * dir - t * 5 * (1 + i % 3)) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = base * (.08 + h2(i, 2, 9) * .35), r = 26 + h2(i, 3, 9) * 50; g.fillStyle = C(mez3(sky.hor, E.clima && E.clima.lluvia > .2 ? [.5, .52, .56] : [1, 1, 1], .45 * dia + .1), .3 + .25 * dia); for (let q = 0; q < 4; q++) { g.beginPath(); g.ellipse(x + q * r * .55, y + (q % 2) * r * .12, r * .55, r * .26, 0, 0, TAU); g.fill(); } }
    /* 2. montañas en capas: cordillera, cerros intermedios y laderas con sus barrios */
    this.fondo(T, s0); let lo = 1e9, hi = -1e9; for (let s = s0 - W / (k * .16); s < s0 + W / (k * .16); s += 60) { lo = Math.min(lo, this.mf('medio', s)); hi = Math.max(hi, this.mf('lejos', s)); }
    const span = Math.max(300, hi - lo), warm = clamp((sky.hor[0] - sky.hor[2]) * 2.2, 0, 1) * (1 - noche);
    const oFar = mez3(mez3(sky.hor, sky.top, .45), ink, .26 + .22 * noche), dFar = mez3(mez3(sky.top, [.5, .62, .76], .5), sky.hor, .18), dd = clamp((dia - .55) / .35, 0, 1) * (1 - warm * .8);
    let cFar = mez3(oFar, dFar, dd), cMid = mez3(mez3(oFar, [.2, .4, .24], .55 * dia), ink, .3), cNear = mez3(mez3(cMid, [.36, .52, .32], .4 * dia), ink, .22 + .3 * noche);
    if (E.clima && E.clima.lluvia > .2) { cFar = mez3(cFar, sky.bruma, .3); cMid = mez3(cMid, [.4, .45, .45], .15); }
    const capa = (campo, urb, par, vs, off, col, haze, barrio) => {
      const yAt = s => base - off - (this.mf(campo, s) - lo) / span * vs, pts = []; let top = H;
      for (let x = 0; x <= W + 4; x += 4) { const s = s0 + (x - cx) / (k * par) * dir, y = yAt(s); pts.push([x, y]); if (y < top) top = y; }
      const gf = g.createLinearGradient(0, top, 0, base + 30); gf.addColorStop(0, C(col)); gf.addColorStop(1, C(mez3(col, sky.bruma, haze))); g.fillStyle = gf;
      g.beginPath(); g.moveTo(0, H); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(W, H); g.closePath(); g.fill();
      g.strokeStyle = C(mez3(col, [1, .96, .88], .16 * dia + .05), .8); g.lineWidth = 1.2; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + .5) : g.moveTo(x, y + .5)); g.stroke();
      if (barrio) this.barrios(g, W, H, s0, T, urb, par, yAt, col, sky, base, cx, k, dir, barrio);
    };
    capa('lejos', 'urbL', .16, H * .34, H * .06, mez3(cFar, ink, .08 * dia), .4, 'lejos');
    capa('inter', 'urbI', .26, H * .29, H * .03, mez3(cFar, cMid, .42), .34, 'inter');
    if (E.clima && (E.clima.niebla > .2 || dia < .6)) { const fg = g.createLinearGradient(0, base - H * .3, 0, base); fg.addColorStop(0, C(sky.bruma, 0)); fg.addColorStop(1, C(sky.bruma, Math.min(.75, .25 + E.clima.niebla * .6))); g.fillStyle = fg; g.fillRect(0, base - H * .3, W, H * .3); }
    capa('medio', 'urbM', .38, H * .24, -H * .015, cMid, .22, 'medio');
    /* gallinazos planeando */
    for (let i = 0; i < 4; i++) { const bx = ((h2(i, 7, 1) * W + t * (14 + i * 3) - s0 * k * .3 * dir) % (W + 80) + W + 80) % (W + 80) - 40, by = base * (.2 + .15 * h2(i, 8, 1)) + Math.sin(t * .8 + i) * 8, wv = Math.sin(t * 3 + i) * 3; g.strokeStyle = C(ink, .65); g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx - 7, by - 2 + wv); g.lineTo(bx, by); g.lineTo(bx + 7, by - 2 + wv); g.stroke(); }
    /* 3. ciudad media y emblemáticos (paralaje por su distancia real), viaducto y trenes, cables */
    const bloques = []; for (let i = Math.floor((sMin - 300) / PANO_BLOQUE); i <= Math.floor((sMax + 300) / PANO_BLOQUE); i++) bloques.push(this.bloque(T, i));
    const Xd = (s, d) => cx + (s - s0) * k * dir * this.par(d), Yd = (cota, d) => base - (cota - z0) * k * ex * this.par(d) * .55 - d * k * this.par(d) * .06;
    const lejanos = []; for (const B of bloques) { for (const o of B.ciudad) lejanos.push(o); for (const h of B.hitos) lejanos.push(Object.assign({ hito: 1 }, h)); for (const p of B.pasos) if (p.tipo === 'viaducto_lado') lejanos.push(Object.assign({ via: 1 }, p)); }
    lejanos.sort((a, b) => b.d - a.d);
    for (const o of lejanos) {
      const pa = this.par(o.d), x = Xd(o.s, o.d), y = Yd(o.cota ?? z0, o.d); if (x < -200 || x > W + 200) continue;
      if (o.via) { const hh = o.h * k * pa; g.fillStyle = C(mez3(mez3([.62, .64, .68], cMid, .35), ink, noche * .5)); g.fillRect(x - 15 * k * pa, y - hh - 1.6 * k * pa, 30 * k * pa + 1, 1.6 * k * pa); g.fillRect(x - .7 * k * pa, y - hh, 1.4 * k * pa, hh); continue; }
      if (o.hito) { this.silueta(g, o, x, y, k * pa, mez3(mez3([.55, .57, .62], cMid, .5), ink, noche * .55), noche); if (pa > .35 && Math.abs(x - cx) < W * .25) (E._etq || (E._etq = [])).push({ t: o.nombre, x, y: y - o.h * k * pa - 10 }); continue; }
      const hh = o.h * k * pa, ww = (o.b - o.a) * k * pa, col = mez3(mez3(hex3(o.muro), cMid, .55 - pa * .4), ink, noche * .55);
      g.fillStyle = C(col); g.fillRect(x - ww / 2, y - hh, ww, hh + 2);
      if (noche <= .25 && pa > .3 && hh > 10) { g.fillStyle = C(mez3(col, [.08, .12, .18], .35), .55); const pis = Math.min(20, o.h / 3 | 0); for (let p = 0; p < pis; p++) g.fillRect(x - ww / 2 + ww * .08, y - hh + (p + .4) * hh / Math.max(1, pis), ww * .84, Math.max(1, hh / Math.max(1, pis) * .3)); }
      if (noche > .25) { g.fillStyle = 'rgba(255,214,120,' + (noche * .7) + ')'; const pis = Math.min(20, o.h / 3 | 0); for (let p = 0; p < pis; p++) for (let q = 0; q < 3; q++) if (h2(o.sem * 1e4 | 0, p * 3 + q, 5) < .35) g.fillRect(x - ww / 2 + ww * (.2 + q * .28), y - hh + (p + .4) * hh / Math.max(1, pis), Math.max(1, ww * .1), Math.max(1, hh / Math.max(1, pis) * .35)); }
    }
    /* trenes del sistema que van cerca (en su viaducto o a ras) y cabinas del cable */
    for (const v of E.vehiculos || []) {
      if (v.clase !== 'metro' && v.clase !== 'tram' && v.clase !== 'cable') continue; const p = this._proy(T, s0, v.x, v.y); if (!p || p.d < -20 || p.d > 400) continue;
      const pa = this.par(Math.max(0, p.d)), x = Xd(p.s, p.d), y = Yd(M.cota(v.x, v.y), p.d) - (v.z || 0) * k * pa; if (x < -300 || x > W + 300) continue;
      if (v.clase === 'cable') { const sw = Math.sin(t * 1.3 + v.s * .1) * (E.clima ? E.clima.viento.v * .02 : .03); g.save(); g.translate(x, y); g.rotate(sw); const s = 2.4 * k * pa; g.fillStyle = '#2d3138'; g.fillRect(-.1 * s, -1.4 * s, .2 * s, 1.4 * s); g.fillStyle = v.color; g.fillRect(-s * .8, 0, s * 1.6, s * 1.25); g.fillStyle = noche > .3 ? 'rgba(255,230,160,.9)' : 'rgba(190,220,240,.9)'; g.fillRect(-s * .6, s * .2, s * 1.2, s * .45); g.restore(); continue; }
      const largo = v.largo * k * pa, alto = 3.6 * k * pa, lado = Math.cos(angDif(T.at(p.s).a, v.a)) >= 0 ? 1 : -1; g.fillStyle = '#e6e9ee'; g.fillRect(x - largo / 2, y - alto, largo, alto); g.fillStyle = v.color; g.fillRect(x - largo / 2, y - alto * .35, largo, alto * .12);
      g.fillStyle = noche > .3 ? 'rgba(255,236,170,.95)' : 'rgba(40,55,75,.8)'; const nv = Math.max(4, largo / (3 * k * pa) | 0); for (let q = 0; q < nv; q++) g.fillRect(x - largo / 2 + (q + .2) * largo / nv, y - alto * .82, largo / nv * .55, alto * .3);
      if (lado * dir > 0) { g.fillStyle = '#ffe7a0'; g.fillRect(x + largo / 2 - 2, y - alto * .3, 2, 2); }
    }
    /* 4. fila de edificios del frente (reales) con cruces que abren hueco */
    const huecos = []; for (const B of bloques) for (const c of B.cruces) huecos.push(c);
    const enCruce = (a, b) => huecos.some(c => b > c.s - c.ancho / 2 - 2 && a < c.s + c.ancho / 2 + 2);
    for (const B of bloques) for (const o of B.frente) {
      if (enCruce(o.a, o.b)) continue; const pa = this.par(o.d), xa = Xd(o.a, o.d), xb = Xd(o.b, o.d); if (Math.max(xa, xb) < -20 || Math.min(xa, xb) > W + 20) continue;
      const yb = Ysuelo(o.s) - o.d * k * pa * .06, hh = o.h * k * pa, x0 = Math.min(xa, xb), ww = Math.abs(xb - xa), col = mez3(mez3(hex3(o.muro), [0, 0, 0], .08 + noche * .5), cNear, .12 + (1 - pa) * .3);
      g.fillStyle = C(col); g.fillRect(x0, yb - hh, ww + .5, hh + 3);
      g.fillStyle = C(mez3(hex3(o.techo), ink, noche * .5)); if (o.plano) g.fillRect(x0 - 1, yb - hh - 1.4 * pa * k * .3, ww + 2, 1.4 * pa * k * .3); else { g.beginPath(); g.moveTo(x0 - 1.5, yb - hh); g.lineTo(x0 + ww / 2, yb - hh - Math.min(ww * .3, 3 * k * pa)); g.lineTo(x0 + ww + 1.5, yb - hh); g.fill(); }
      const pis = Math.max(1, Math.min(24, Math.round(o.h / 3))), cols = Math.max(1, Math.min(8, Math.round((o.b - o.a) / 3.5))), wh = hh / pis;
      for (let p = 0; p < pis; p++) for (let q = 0; q < cols; q++) { const lit = noche > .25 && h2(o.sem * 1e4 | 0, p * 9 + q, 5) < .42; g.fillStyle = lit ? 'rgba(255,214,120,' + (.5 + noche * .45) + ')' : C(mez3(col, [.1, .14, .2], .45), .7); g.fillRect(x0 + (q + .25) * ww / cols, yb - hh + (p + .3) * wh, ww / cols * .5, wh * .42); }
      if (o.h < 12 && h2(o.sem * 1e4 | 0, 77, 1) < .5) { g.fillStyle = ['#c43a26', '#1C5C9C', '#59AB42', '#E38835', '#743D90'][(o.sem * 50 | 0) % 5]; g.globalAlpha = .7; g.fillRect(x0 + 1, yb - wh * .9, ww - 2, Math.max(1.5, k * .3)); g.globalAlpha = 1; }   // toldos de los locales
    }
    /* letreros de los cruces */
    for (const c of huecos) { const x = X(c.s), y = Ysuelo(c.s); if (x < -40 || x > W + 40 || !c.nombre) continue; g.fillStyle = '#2b2f38'; g.fillRect(x - .5, y - 3.2 * k, Math.max(1, .14 * k), 3.2 * k); g.fillStyle = '#1C5C9C'; const tw = Math.max(40, c.nombre.length * 5.5); g.fillRect(x - tw / 2, y - 3.6 * k - 12, tw, 13); g.fillStyle = '#fff'; g.font = '700 10px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(c.nombre.slice(0, 26), x, y - 3.6 * k - 2); }
    /* 5. el suelo de la vía con su perfil real: andén, calzada o ciclorruta, rayas; puentes con sus pilas */
    const tt0 = M.suelo(qv.x, qv.y), esCiclo = tt0 === TT.CICLO || (E.pano.ciclo), via = esCiclo ? '#2f9e57' : '#4a4f59', paso = Math.max(2, Math.round(3 / Math.max(.2, k / 4)));
    { const capaS = (off, col) => { g.fillStyle = C(mez3(col, ink, noche * .55)); g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W + paso; x += paso) { const s = s0 + (x - cx) / k * dir; g.lineTo(x, Ysuelo(s) + off * k); } g.lineTo(W, H); g.fill(); };
      capaS(1.6, [.78, .75, .68]); capaS(2.4, esCiclo ? [.36, .55, .3] : [.62, .6, .55]); capaS(3.4, [.34, .5, .3]); capaS(5.2, [.42, .46, .4]); capaS(7.5, [.3, .36, .28]); capaS(10.5, [.22, .26, .2]);
      const gr2 = g.createLinearGradient(0, base + 4 * k, 0, H); gr2.addColorStop(0, 'rgba(0,0,0,0)'); gr2.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = gr2; g.fillRect(0, base + 4 * k, W, H); }
    for (let x = 0; x <= W + paso; x += paso) { const s = s0 + (x - cx) / k * dir, y = Ysuelo(s), al = this.muestra(T, 'alzado', s); if (al > .5) { const yt = y + al * k; g.fillStyle = C(mez3([.42, .36, .28], ink, noche * .5)); g.fillRect(x, yt + 1.6 * k, paso + .5, H - yt); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y + 1.6 * k, paso + .5, al * k); if ((Math.floor(s / 24) & 1) && (s % 24) < 2) { g.fillStyle = '#9aa3ad'; g.fillRect(x, y + 1.6 * k, Math.max(2, k * .8), al * k); } } g.fillStyle = '#d4cfc3'; g.fillRect(x, y - .25 * k, paso + .5, .35 * k); g.fillStyle = via; g.fillRect(x, y + .1 * k, paso + .5, 1.5 * k); if (((s / 3 | 0) & 1) && k > 2) { g.fillStyle = esCiclo ? '#e8f5d0' : '#e4e4dc'; g.fillRect(x, y + .8 * k, paso + .5, Math.max(1, .12 * k)); } }
    /* pasos elevados que cruzan por encima */
    for (const B of bloques) for (const p of B.pasos) { if (p.tipo === 'viaducto_lado') continue; const x = X(p.s), y = Ysuelo(p.s), hh = Math.max(4.5, p.h) * k, ww = p.ancho * k; if (x < -ww || x > W + ww) continue; g.fillStyle = p.tipo === 'viaducto' ? '#9aa3ad' : '#8e8a80'; g.fillRect(x - ww / 2, y - hh - 1.4 * k, ww, 1.4 * k); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - ww / 2, y - hh, ww, hh * .15); g.fillStyle = tono('#9aa3ad', -.1); g.fillRect(x - ww / 2 - .6 * k, y - hh, 1.2 * k, hh); g.fillRect(x + ww / 2 - .6 * k, y - hh, 1.2 * k, hh); }
    /* 6. mobiliario: árboles, faroles y estaciones */
    for (const B of bloques) for (const a of B.arboles) { const x = X(a.s), y = Ysuelo(a.s) - (a.lado > 0 ? 1.2 * k : -2.2 * k); if (x < -30 || x > W + 30) continue; const r = a.r * k * (a.lado > 0 ? .9 : 1.05), gc = mez3(mez3([.2, .45, .22], [.32, .55, .3], a.col), ink, noche * .55); g.fillStyle = C(mez3(gc, [.3, .2, .1], .6)); g.fillRect(x - .15 * k, y - r * 1.2, .3 * k, r * 1.2); g.fillStyle = C(gc); g.beginPath(); g.arc(x, y - r * 1.5, r, 0, TAU); g.arc(x - r * .5, y - r * 1.2, r * .7, 0, TAU); g.arc(x + r * .5, y - r * 1.25, r * .75, 0, TAU); g.fill(); }
    for (let s = Math.floor(sMin / 30) * 30; s < sMax; s += 30) { const x = X(s), y = Ysuelo(s); g.fillStyle = '#2b2f38'; g.fillRect(x, y - 6 * k, Math.max(1, .15 * k), 6 * k); g.fillRect(x - .8 * k * dir, y - 6 * k, k * .9, Math.max(1, .14 * k)); if (noche > .3) { g.fillStyle = 'rgba(255,220,140,.95)'; g.fillRect(x - .8 * k * dir, y - 5.9 * k, k * .5, .3 * k); g.fillStyle = 'rgba(255,210,130,' + noche * .12 + ')'; g.beginPath(); g.moveTo(x - .6 * k * dir, y - 5.8 * k); g.lineTo(x - 3.5 * k, y); g.lineTo(x + 2.5 * k, y); g.fill(); } }
    for (const B of bloques) for (const e of B.estaciones) {
      const x = X(e.s), y = Ysuelo(e.s); if (x < -80 || x > W + 80) continue;
      if (e.tipo === 'encicla') { g.fillStyle = '#7ab800'; g.fillRect(x - 3 * k, y - 3.2 * k, 6 * k, .45 * k); g.fillStyle = '#9aa7b8'; g.fillRect(x - 2.8 * k, y - 3 * k, .2 * k, 3 * k); for (let i = 0; i < 5; i++) { g.fillStyle = '#59606c'; g.fillRect(x - 2 * k + i * k, y - 1.2 * k, .1 * k, 1.2 * k); g.fillStyle = '#7ab800'; g.fillRect(x - 2.2 * k + i * k, y - 1.1 * k, .5 * k, .5 * k); } (E._etq || (E._etq = [])).push({ t: '🚲 ' + e.nombre, x, y: y - 4 * k, c: '#c4ec7c' }); }
      else { const pa = this.par(Math.max(0, e.d)), xx = Xd(e.s, e.d), yy = Yd(e.cota ?? z0, e.d) - e.nivel * NIVEL_M * k * pa, w = (e.tipo === 'metro' ? 110 : 30) * k * pa; g.fillStyle = C(mez3(hex3(e.color || '#1C5C9C'), ink, noche * .3)); g.fillRect(xx - w / 2, yy - 6 * k * pa, w, 1.2 * k * pa); g.fillStyle = 'rgba(220,226,232,.85)'; g.fillRect(xx - w / 2, yy - 1.2 * k * pa, w, 1.2 * k * pa); (E._etq || (E._etq = [])).push({ t: e.nombre, x: xx, y: yy - 7 * k * pa, c: '#fff', bg: e.color }); }
    }
    /* 7. tráfico y gente de perfil (los que van por la misma vía) */
    for (const v of E.trafico || []) { const p = this._proy(T, s0, v.x, v.y); if (!p || Math.abs(p.d) > 14) continue; const x = X(p.s), y = Ysuelo(p.s) + (p.d * this.lado > 0 ? .4 : 1.1) * k, L = (v.largo || 4.4) * k, Hh = (v.tipo === 'buseta' || v.tipo === 'camion' ? 3.1 : v.tipo === 'moto' || v.tipo === 'bici' ? 1.3 : 1.5) * k, ld = Math.cos(angDif(T.at(p.s).a, v.a)) * dir >= 0 ? 1 : -1; if (x < -L || x > W + L) continue; this.carroLado(g, x, y, L, Hh, v.color, ld, noche > .4, v.tipo); }
    for (const p of E.peatones || []) { const q = this._proy(T, s0, p.x, p.y); if (!q || Math.abs(q.d) > 14) continue; const x = X(q.s), y = Ysuelo(q.s) - .2 * k; if (x < -10 || x > W + 10) continue; const A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)), J = Personaje.pose('camina', p.fase, { alto: A.alto }); MC.arte.f('personajeLado')(g, J, A, x, y, k * .95, Math.cos(angDif(T.at(q.s).a, p.a)) * dir >= 0 ? 1 : -1); }
    if (op.extras) op.extras(g, { X, Y: Ysuelo, k, dir, s0, T, cx, base });
    /* 8. el jugador */
    if (E.jugador && !op.sinJugador) { const C2 = E.jugador.cuerpo, A = E.jugador.aspecto, V = C2.veh, y = Ysuelo(s0) + .5 * k - C2.z * k, esc = kj; const fn = MC.arte.f('jugadorLado'); if (!(fn && fn(g, E.jugador, cx, y, esc, dir) !== false)) { if (V.clase !== 'pie') (MC.arte.f('vehiculoLado'))(g, V, cx, y, esc, dir, C2); const J = Personaje.pose(C2.estado || 'quieto', C2.fase, { alto: A.alto, manubrio: V.manubrio }); MC.arte.f('personajeLado')(g, J, A, cx, y, esc, dir); } if (C2.z > .1) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(cx, Ysuelo(s0) + .2 * k, .9 * k, .2 * k, 0, 0, TAU); g.fill(); } E._jugPano = [cx, y]; }
    /* 9. primer plano: fachadas reales del lado de la cámara y matas (paralaje 1,3) */
    const fp = 1.3; for (const B of bloques) for (const o of B.primer) { const xa = cx + (o.a - s0) * k * fp * dir, xb = cx + (o.b - s0) * k * fp * dir, x0 = Math.min(xa, xb), ww = Math.abs(xb - xa); if (x0 > W || x0 + ww < 0) continue; const yb = Math.min(H + 4, Ysuelo(s0) + Math.max(5 * k * fp, (H - Ysuelo(s0)) * .62) + 4), hh = Math.min(H * .22, o.h * k * .3); g.fillStyle = C(mez3(mez3(hex3(o.muro), ink, .55 + noche * .3), cNear, .15)); g.fillRect(x0, yb - hh, ww + 1, hh + 30); if (noche > .3) { g.fillStyle = 'rgba(255,214,120,' + noche * .55 + ')'; for (let p = 0; p < 3; p++) if (h2(o.sem * 1e4 | 0, p, 9) < .4) g.fillRect(x0 + ww * .3, yb - hh + (p + .5) * hh / 3.5, ww * .25, hh / 9); } }
    { const fw = 9, U = s0 * k * fp, i0 = Math.floor((U - W) / (fw * k * fp)) - 2, i1 = i0 + Math.ceil(2 * W / (fw * k * fp)) + 4, yb0 = Math.min(H - 2, Ysuelo(s0) + Math.max(5 * k * fp, (H - Ysuelo(s0)) * .62));
      for (let i = i0; i <= i1; i++) { const hv = h2(i, 5, 61), x = cx + (i * fw * k * fp - U) * dir; if (x < -60 || x > W + 60) continue; const q = this._pt(T, i * fw), Z = M.estilo(q.x, q.y), sil = mez3(mez3([.12, .2, .14], cNear, .3), ink, .55 + noche * .3);
        g.fillStyle = C(sil);
        if (hv < (Z.arboles || .4) * .55) { const r = (2.2 + h2(i, 6, 61) * 2.4) * k * fp; g.fillRect(x - .15 * k, yb0 - r * 1.6, .3 * k * fp, r * 1.6); g.beginPath(); g.arc(x, yb0 - r * 1.7, r, 0, TAU); g.arc(x - r * .6, yb0 - r * 1.3, r * .7, 0, TAU); g.arc(x + r * .6, yb0 - r * 1.35, r * .75, 0, TAU); g.fill(); }
        else if (hv < .62) { const r = (.8 + h2(i, 7, 61)) * k * fp; g.beginPath(); g.arc(x, yb0 - r * .6, r, Math.PI, 0); g.fill(); }
        else if (hv < .75 && TT_URBANO.has(M.suelo(q.x, q.y))) { const L = 4.2 * k * fp, Hh = 1.4 * k * fp; g.fillRect(x - L / 2, yb0 - Hh, L, Hh * .7); g.fillRect(x - L * .28, yb0 - Hh * 1.25, L * .55, Hh * .5); g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.arc(x - L * .3, yb0 - Hh * .2, Hh * .25, 0, TAU); g.arc(x + L * .3, yb0 - Hh * .2, Hh * .25, 0, TAU); g.fill(); }
        else { g.fillRect(x - fw * k * fp / 2, yb0 - .9 * k * fp, fw * k * fp, .12 * k * fp); for (let b = 0; b < 4; b++) g.fillRect(x - fw * k * fp / 2 + b * fw * k * fp / 4, yb0 - .9 * k * fp, .1 * k * fp, .9 * k * fp); }
      } }
    /* 10. clima encima de todo */
    if (E.clima) this.clima(g, W, H, E.clima, t);
    /* etiquetas (las dos más cercanas al jugador) */
    if (E._etq) { const L = E._etq.sort((a, b) => Math.abs(a.x - cx) - Math.abs(b.x - cx)).slice(0, 3); g.font = '700 12px system-ui,sans-serif'; g.textAlign = 'center'; for (const l of L) { const w = g.measureText(l.t).width + 10; g.fillStyle = l.bg ? l.bg + 'dd' : 'rgba(10,35,66,.85)'; g.fillRect(l.x - w / 2, l.y - 15, w, 18); g.fillStyle = l.c || '#fff'; g.fillText(l.t, l.x, l.y - 2); } E._etq = null; }
    return { X, Y: Ysuelo, k, dir, cx, base };
  }
  /* (s, d) de un punto respecto al trazo cerca del jugador (rápido: mira solo ±400 m) */
  _proy(T, s0, x, y) { const q = T.at(s0); if (Math.abs(x - q.x) > 450 || Math.abs(y - q.y) > 450) return null; let bs = s0, bd = 1e18; for (let s = Math.max(0, s0 - 420); s <= Math.min(T.largo, s0 + 420); s += 12) { const p = T.at(s), d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; bs = s; } } const p = T.at(bs), ux = Math.cos(p.a), uy = Math.sin(p.a), dx = x - p.x, dy = y - p.y; return { s: bs + dx * ux + dy * uy, d: (dx * -uy + dy * ux) * this.lado }; }
  silueta(g, o, x, y, k, col, noche) {
    const h = o.h * k, w = Math.max(4, o.w * k * .5); g.fillStyle = css3(col);
    if (o.clase === 'aguja') { g.fillRect(x - w / 2, y - h * .78, w, h * .78); g.beginPath(); g.moveTo(x - w / 2, y - h * .78); g.lineTo(x, y - h); g.lineTo(x + w / 2, y - h * .78); g.fill(); }
    else if (/basilica|iglesia|catedral/.test(o.clase)) { g.fillRect(x - w / 2, y - h * .55, w, h * .55); g.fillRect(x - w * .12, y - h, w * .24, h * .45); g.beginPath(); g.moveTo(x - w * .14, y - h * .92); g.lineTo(x, y - h * 1.08); g.lineTo(x + w * .14, y - h * .92); g.fill(); }
    else if (/cupula|palacio/.test(o.clase)) { g.fillRect(x - w / 2, y - h * .7, w, h * .7); g.beginPath(); g.arc(x, y - h * .7, w * .25, Math.PI, 0); g.fill(); }
    else { g.fillRect(x - w / 2, y - h, w, h); }
    if (noche > .3) { g.fillStyle = 'rgba(255,90,80,' + (.6 + .4 * Math.sin(Date.now() / 300)) + ')'; g.fillRect(x - 1, y - h - 2, 2, 2); }
  }
  carroLado(g, x, y, L, Hh, col, dir, luz, tipo) {
    g.fillStyle = '#141414'; g.fillRect(x - L / 2 - 1, y - Hh - 1, L + 2, Hh + 1); g.fillStyle = col; g.fillRect(x - L / 2, y - Hh, L, Hh * .62);
    if (tipo === 'buseta' || tipo === 'camion') { g.fillRect(x - L / 2, y - Hh, L, Hh * .9); g.fillStyle = 'rgba(40,60,80,.85)'; for (let i = 0; i < 5; i++) g.fillRect(x - L / 2 + L * (.08 + i * .18), y - Hh * .88, L * .12, Hh * .3); }
    else if (tipo === 'moto' || tipo === 'bici') { g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(x, y - Hh * 1.05, Hh * .2, 0, TAU); g.fill(); }
    else { g.fillStyle = tono(col, .12); g.fillRect(x - L * .28, y - Hh * 1.02, L * .55, Hh * .42); g.fillStyle = luz ? '#ffe7a0' : 'rgba(140,190,220,.9)'; g.fillRect(x - L * .24 + (dir > 0 ? L * .28 : 0), y - Hh * .95, L * .22, Hh * .3); }
    g.fillStyle = '#141414'; const r = Math.max(1.5, Hh * .2); g.beginPath(); g.arc(x - L * .3, y - r * .3, r, 0, TAU); g.arc(x + L * .3, y - r * .3, r, 0, TAU); g.fill();
    if (luz) { g.fillStyle = '#fff6c0'; g.fillRect(dir > 0 ? x + L / 2 - 2 : x - L / 2, y - Hh * .45, 2, 2); g.fillStyle = 'rgba(255,240,180,.15)'; g.beginPath(); const fx = dir > 0 ? x + L / 2 : x - L / 2; g.moveTo(fx, y - Hh * .45); g.lineTo(fx + dir * L * 2, y - Hh * .9); g.lineTo(fx + dir * L * 2, y); g.fill(); }
  }
  /* lluvia, niebla y relámpagos */
  clima(g, W, H, Cl, t) {
    if (Cl.lluvia > .05) { g.strokeStyle = 'rgba(220,235,245,' + (.25 + Cl.lluvia * .3) + ')'; g.lineWidth = 1; g.beginPath(); const n = Math.round(40 + Cl.lluvia * 140), vx = Math.cos(Cl.viento.dir) * Cl.viento.v * .6; for (let i = 0; i < n; i++) { const x = ((h2(i, 3, 3) * W + t * (90 + vx * 30)) % W + W) % W, y = (h2(i, 4, 3) * H + t * 700 * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - 3 - vx, y + 13); } g.stroke(); }
    if (Cl.niebla > .3) { g.fillStyle = 'rgba(200,205,210,' + (Cl.niebla - .3) * .5 + ')'; g.fillRect(0, 0, W, H); }
    if (Cl.rayo > .05) { g.fillStyle = 'rgba(255,255,255,' + Cl.rayo * .55 + ')'; g.fillRect(0, 0, W, H); }
  }
  /* laderas con barrios (de El Metro, 23-lado.js): casas de ladrillo que trepan desde el valle con monte arriba y
     luces de noche; aquí la densidad sale de lo construido de verdad en esa dirección (capa urb*).
     Se pinta en una tira en caché y se repinta solo al salir del margen o al cambiar la luz. */
  barrios(g, W, H, s0, T, urb, par, yAt, col, sky, base, cx, k, dir, id) {
    const far = id === 'lejos' || id === 'inter', hw = Math.max(far ? 2 : 4, Math.round(k * (far ? 1.1 : 2.4) * (par / .38))), rh = Math.max(2, Math.round(hw * .72)), U0 = s0 * k * par, umin = dir > 0 ? U0 - cx : U0 + cx - W;
    const yTop = Math.floor(base - H * (far ? .44 : .3)), yBot = Math.ceil(base + H * .05), bh = yBot - yTop, nq = Math.round(sky.noche * 5), dq = Math.round(sky.dia * 5);
    const key = [this.id, W, H, par, k.toFixed(3), nq, dq, col.map(v => (v * 40) | 0).join('.')].join(':'), C0 = this._bc[id];
    let c = C0 && C0.key === key && umin >= C0.u0 && umin + W <= C0.u0 + C0.w ? C0 : null;
    if (!c) {
      const w = Math.ceil(W * 2), u0 = Math.floor(umin - W * .5), cv = (C0 && C0.cv && C0.cv.width === w && C0.cv.height === bh) ? C0.cv : lienzo(w, bh); if (!cv) return; const q = cv.getContext('2d'); q.clearRect(0, 0, w, bh);
      const vn = (x, y, sd) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a = h2(xi, yi, sd), b2 = h2(xi + 1, yi, sd), c2 = h2(xi, yi + 1, sd), d = h2(xi + 1, yi + 1, sd); return (a * (1 - sx) + b2 * sx) * (1 - sy) + (c2 * (1 - sx) + d * sx) * sy; };
      const BR = [[.7, .34, .22], [.76, .42, .27], [.62, .3, .2], [.8, .52, .34], [.7, .34, .22], [.74, .38, .25], [.93, .9, .83], [.86, .8, .62], [.55, .7, .78], [.9, .7, .72], [.62, .78, .55]], RF = [[.52, .26, .2], [.5, .5, .52], [.62, .6, .58], [.4, .22, .16]];
      const tint = far ? .66 : .3, night = sky.noche, gdk = mez3(mez3(col, [.1, .26, .12], .5 * sky.dia + .1), [0, 0, 0], night * .45), glt = mez3(gdk, [.5, .66, .36], .25 * sky.dia);
      for (let cc = Math.floor(u0 / hw) - 1; cc * hw < u0 + w + hw; cc++) {
        const u = cc * hw, sCol = s0 + (u + hw / 2 - U0) / (k * par), yr = yAt(sCol), x = u - u0;   // la tira va en coordenada u = s·k·par (espejada si dir < 0)
        const urbano = clamp(this.mf(urb, sCol) * 1.3 + .15, 0, 1);
        for (let r = 0, yy = yBot - rh; yy > yr + rh * .4; r++, yy -= rh) {
          const f = (yBot - yy) / Math.max(8, yBot - yr), hv = h2(cc, r, far ? 63 : 43), xo = ((r * 5) % 3) * hw / 3 - hw / 3, yo = (h2(cc, r, 47) - .5) * rh * .4;
          const n = vn(cc / (far ? 16 : 10), r / (far ? 9 : 6), far ? 71 : 73), hf = f < .3 ? 1 : f < .62 ? 1 - (f - .3) / .32 : 0, p = clamp((n - .32) * 2.6, 0, 1) * hf * (far ? .55 : .92) * urbano;
          const X0 = x + xo, Y0 = yy - yTop + yo;
          if (hv < p) {
            const hc = BR[(hv * 997 | 0) % BR.length], cb = mez3(mez3(hc, col, tint), [0, 0, 0], night * .6), tall = h2(cc, r, 44) < .22 ? 1 + (h2(cc, r, 48) * 2 | 0) : 0, hh = rh * (1 + tall * .7);
            if (far) { if (night > .25) { q.fillStyle = css3(cb); q.fillRect(X0, Y0 - (hh - rh), hw - 1, hh); } }
            else { q.fillStyle = css3(cb); q.fillRect(X0, Y0 - (hh - rh), hw - 1.5, hh); q.fillStyle = css3(mez3(mez3(RF[(hv * 31 | 0) % RF.length], col, tint), [0, 0, 0], night * .6)); q.fillRect(X0 - .5, Y0 - (hh - rh) - rh * .18, hw - .5, rh * .36); }
            if (night > .15 && h2(cc, r, 45) < .55) { const lv = h2(cc, r, 46); q.fillStyle = 'rgba(255,' + (190 + (lv * 60 | 0)) + ',' + (100 + (lv * 60 | 0)) + ',' + Math.min(1, night * 1.15) + ')'; const d = Math.max(1, hw * (far ? .5 : .3)); q.fillRect(X0 + hw * .3, Y0 - (hh - rh) + rh * .35, d, d); }
          } else if (!far && f > .12 && hv < p + .55 * Math.min(1, f * 2)) { const rr = hw * (.5 + h2(cc, r, 50) * .35); q.fillStyle = css3(gdk); q.beginPath(); q.arc(X0 + hw / 2, Y0 + rh * .5, rr, 0, TAU); q.fill(); if (sky.dia > .3) { q.fillStyle = css3(glt); q.beginPath(); q.arc(X0 + hw / 2 - rr * .25, Y0 + rh * .5 - rr * .3, rr * .45, 0, TAU); q.fill(); } }
        }
      }
      c = this._bc[id] = { key, u0, w, cv };
    }
    g.save(); if (dir > 0) g.drawImage(c.cv, cx - (U0 - c.u0), yTop); else { g.translate(cx + U0 - c.u0, yTop); g.scale(-1, 1); g.drawImage(c.cv, 0, 0); } g.restore();
  }
}

/* ---- js/45-gl.js ---- */
/* =====================================================================
   VISTA 3D EN PERSPECTIVA (WebGL 1, sin librerías) · primera y tercera persona, dron y cine
   Parte del G3 de El Metro (WebGL como mejora, con respaldo en Canvas 2D):
   - Relieve real (malla de 20 m cerca, 240 m lejos: las montañas que rodean el valle) con el suelo pintado
     por las MISMAS losas de las vistas 2D (es el mismo mapa).
   - Edificios reales levantados con su huella y su altura, colores de su zona y ventanas que se encienden de noche;
     sitios y partes de los emblemáticos; puentes y viaducto a su nivel con sus pilas; árboles por zona.
   - Personaje (la misma pose de todas las vistas), vehículos, trenes, cabinas, tráfico y gente.
   - Luz del sol según la hora, cielo, niebla según el clima y la calidad; detalle por distancia (LOD).
   Coordenadas GL: x = oriente, y = arriba, z = sur (metros), relativas a un origen O para no perder precisión.
   ===================================================================== */
const M4 = {
  persp(o, fy, asp, n, f) { const t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); o.fill(0); o[0] = t / asp; o[5] = t; o[10] = (f + n) * nf; o[11] = -1; o[14] = 2 * f * n * nf; return o; },
  mirar(o, e, c, u = [0, 1, 0]) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0; o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0; o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
    o[12] = -(xx * e[0] + xy * e[1] + xz * e[2]); o[13] = -(yx * e[0] + yy * e[1] + yz * e[2]); o[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); o[15] = 1; return o;
  },
  mul(o, a, b) { const t = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) t[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; o.set(t); return o; }
};
/* constructor de mallas: x, y, z, nx, ny, nz, r, g, b, e (emisivo) */
class Malla {
  constructor() { this.d = []; }
  tri(a, b, c, col, e = 0) { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l; for (const p of [a, b, c]) this.d.push(p[0], p[1], p[2], nx, ny, nz, col[0], col[1], col[2], e); }
  quad(a, b, c, d, col, e) { this.tri(a, b, c, col, e); this.tri(a, c, d, col, e); }
  /* prisma: polígono P (metros del mundo, relativos a O) de y0 a y1, con techo plano o a dos aguas */
  prisma(P, O, y0, y1, muro, techo, op = {}) {
    const n = P.length >> 1; if (n < 3) return; const V = []; let A = 0;
    for (let i = 0; i < n; i++) V.push([P[2 * i] - O[0], P[2 * i + 1] - O[1]]);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; A += V[i][0] * V[j][1] - V[j][0] * V[i][1]; }
    const cw = A > 0;   // en GL z = sur: un polígono «antihorario» del mapa se ve horario desde arriba
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, a = V[i], b = V[j], p0 = [a[0], y0, a[1]], p1 = [b[0], y0, b[1]], p2 = [b[0], y1, b[1]], p3 = [a[0], y1, a[1]]; if (cw) this.quad(p0, p3, p2, p1, muro); else this.quad(p0, p1, p2, p3, muro);
      if (op.ventanas && y1 - y0 > 5) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), cols = Math.min(8, Math.floor(L / 3.4)), pisos = Math.min(20, Math.floor((y1 - y0 - 1) / 3)); if (cols > 0) { const nx = (b[1] - a[1]) / L * (cw ? -1 : 1) * .06, nz = -(b[0] - a[0]) / L * (cw ? -1 : 1) * .06; for (let p = 0; p < pisos; p++) for (let q = 0; q < cols; q++) { if (h2(op.ventanas + i * 31 + q, p, 5) > .35) continue; const u0 = (q + .3) / cols, u1 = (q + .7) / cols, yA = y0 + 1.2 + p * 3, yB = yA + 1.3, x0 = a[0] + (b[0] - a[0]) * u0 + nx, z0 = a[1] + (b[1] - a[1]) * u0 + nz, x1 = a[0] + (b[0] - a[0]) * u1 + nx, z1 = a[1] + (b[1] - a[1]) * u1 + nz; const w = [x0, yA, z0], x = [x1, yA, z1], yy = [x1, yB, z1], zz = [x0, yB, z0]; if (cw) this.quad(w, zz, yy, x, [1, .84, .5], 1); else this.quad(w, x, yy, zz, [1, .84, .5], 1); } } }
    }
    /* techo: abanico (los polígonos de huella son casi convexos) o a dos aguas en casas rectangulares */
    if (op.dosAguas && n === 4) { const c = op.dosAguas, h = Math.min(2.4, c.ancho * .45), m = [(V[0][0] + V[1][0]) / 2, y1 + h, (V[0][1] + V[1][1]) / 2], m2 = [(V[2][0] + V[3][0]) / 2, y1 + h, (V[2][1] + V[3][1]) / 2], p = V.map(v => [v[0], y1, v[1]]); if (cw) { this.quad(p[0], m, m2, p[3], techo); this.quad(p[2], m2, m, p[1], techo); this.tri(p[0], p[1], m, muro); this.tri(p[2], p[3], m2, muro); } else { this.quad(p[0], p[3], m2, m, techo); this.quad(p[2], p[1], m, m2, techo); this.tri(p[0], m, p[1], muro); this.tri(p[2], m2, p[3], muro); } return; }
    const top = V.map(v => [v[0], y1, v[1]]); for (let i = 1; i < n - 1; i++) { if (cw) this.tri(top[0], top[i + 1], top[i], techo); else this.tri(top[0], top[i], top[i + 1], techo); }
  }
  /* caja orientada: centro (x, y, z), largo en el rumbo a, ancho y alto */
  caja(x, y, z, a, L, W, Hh, col, e = 0) { const c = Math.cos(a), s = Math.sin(a), hx = L / 2, hz = W / 2, P = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([u, v]) => [x + u * c - v * s, z + u * s + v * c]), b = P.map(p => [p[0], y, p[1]]), t = P.map(p => [p[0], y + Hh, p[1]]); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; this.quad(b[i], b[j], t[j], t[i], col, e); } this.quad(t[0], t[1], t[2], t[3], col, e); }
  /* segmento grueso entre dos puntos (huesos del personaje, tubos de la bici) */
  hueso(p, q, r, col) { const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2], L = Math.hypot(dx, dy, dz) || 1e-6; let ax = 0, ay = 1, az = 0; if (Math.abs(dy / L) > .9) { ax = 1; ay = 0; } let ux = dy * az - dz * ay, uy = dz * ax - dx * az, uz = dx * ay - dy * ax, l = Math.hypot(ux, uy, uz) || 1; ux = ux / l * r; uy = uy / l * r; uz = uz / l * r; let vx = (dy * uz - dz * uy) / L, vy = (dz * ux - dx * uz) / L, vz = (dx * uy - dy * ux) / L; const A = [], B = []; for (const [i, j] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) { A.push([p[0] + ux * i + vx * j, p[1] + uy * i + vy * j, p[2] + uz * i + vz * j]); B.push([q[0] + ux * i + vx * j, q[1] + uy * i + vy * j, q[2] + uz * i + vz * j]); } for (let k = 0; k < 4; k++) { const m = (k + 1) % 4; this.quad(A[k], A[m], B[m], B[k], col); } }
}
const VS = 'attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;attribute float aE;uniform mat4 uM;uniform vec3 uL;uniform float uAmb;uniform float uSol;uniform vec3 uO;uniform float uNoche;varying vec3 vC;varying float vD;void main(){float d=max(dot(normalize(aN),uL),0.);vec3 c=aC*(uAmb+uSol*d);vC=mix(c,aC*(0.55+0.6*uNoche),aE*uNoche)+aE*uNoche*vec3(0.25,0.18,0.05);vD=length(aP-uO);gl_Position=uM*vec4(aP,1.);}';
const VT = 'attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;uniform mat4 uM;uniform vec3 uL;uniform float uAmb;uniform float uSol;uniform vec3 uO;varying vec2 vT;varying float vL;varying float vD;void main(){vL=uAmb+uSol*max(dot(normalize(aN),uL),0.);vT=aT;vD=length(aP-uO);gl_Position=uM*vec4(aP,1.);}';
const FS = 'precision mediump float;uniform vec3 uF;uniform vec2 uFR;varying vec3 vC;varying float vD;void main(){float f=clamp((vD-uFR.x)/(uFR.y-uFR.x),0.,1.);gl_FragColor=vec4(mix(vC,uF,f),1.);}';
const FT = 'precision mediump float;uniform sampler2D uS;uniform vec3 uF;uniform vec2 uFR;varying vec2 vT;varying float vL;varying float vD;void main(){float f=clamp((vD-uFR.x)/(uFR.y-uFR.x),0.,1.);gl_FragColor=vec4(mix(texture2D(uS,vT).rgb*vL,uF,f),1.);}';
const FC = 'precision mediump float;varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.);}';
const VC = 'attribute vec2 aP;attribute vec3 aC;varying vec3 vC;void main(){vC=aC;gl_Position=vec4(aP,0.999,1.);}';
class VistaGL {
  constructor(mundo, losas) {
    this.mundo = mundo; this.losas = losas; this.cv = lienzo(4, 4); this.ok = false; this.regiones = new Map(); this.O = null; this.R = 160; this.cola = [];
    try { this.gl = this.cv && this.cv.getContext && (this.cv.getContext('webgl', { antialias: true, alpha: false }) || this.cv.getContext('experimental-webgl')); } catch (e) { this.gl = null; }
    if (!this.gl) return; const gl = this.gl;
    const prog = (v, f) => { const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }; const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u = {}, a = {}; const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS), na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); for (let i = 0; i < nu; i++) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n); } for (let i = 0; i < na; i++) { const n = gl.getActiveAttrib(p, i).name; a[n] = gl.getAttribLocation(p, n); } return { p, u, a }; };
    try { this.pC = prog(VS, FS); this.pT = prog(VT, FT); this.pS = prog(VC, FC); this.ok = true; } catch (e) { MC.falla('WebGL', e); this.ok = false; }
    this.dyn = gl.createBuffer(); this.cielo = gl.createBuffer(); this.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  }
  _vbo(arr) { const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return { b, n: arr.length }; }
  liberar() { const gl = this.gl; for (const r of this.regiones.values()) this._borrar(r); this.regiones.clear(); if (this.lejos) { for (const b of this.lejos) gl.deleteBuffer(b.b); this.lejos = null; } }
  _borrar(r) { const gl = this.gl; if (r.suelo) gl.deleteBuffer(r.suelo.b); if (r.cosas) gl.deleteBuffer(r.cosas.b); if (r.tex) gl.deleteTexture(r.tex); }
  /* relieve lejano: bloques de 8 × 8 celdas de 240 m con colores por suelo (las montañas que rodean el valle) */
  _lejos() {
    const M = this.mundo, st = 240, O = this.O, B = [], Sx = Math.ceil(M.ancho / st), Sy = Math.ceil(M.alto / st), S = MC.arte.dato('suelo', PAL_SUELO);
    const col = (x, y) => { const t = M.suelo(x, y); let c = hex3(TT_URBANO.has(t) ? '#a8998a' : t === TT.WATER ? '#4f9fd0' : t === TT.MOUNT ? '#3f6e3a' : S[t] || '#5e8c4a'); return c; };
    for (let by = 0; by < Sy; by += 8) for (let bx = 0; bx < Sx; bx += 8) {
      const m = new Malla(); for (let j = by; j < Math.min(Sy, by + 8); j++) for (let i = bx; i < Math.min(Sx, bx + 8); i++) {
        const P = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([u, v]) => [u * st - O[0], M.cota(u * st, v * st) - O[2] - 14, v * st - O[1]]), c = col((i + .5) * st, (j + .5) * st); m.quad(P[0], P[3], P[2], P[1], c);
      }
      B.push(Object.assign(this._vbo(m.d), { cx: (bx + 4) * st, cy: (by + 4) * st }));
    }
    this.lejos = B;
  }
  /* una región de 160 m: suelo con textura de la losa y las cosas con volumen */
  _region(gx, gy, detalle) {
    const M = this.mundo, gl = this.gl, R = this.R, O = this.O, x0 = gx * R, y0 = gy * R, n = 8, st = R / n, suelo = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const P = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([u, v]) => { const x = x0 + u * st, y = y0 + v * st, nn = M.normal(x, y, 10); return [x - O[0], M.cota(x, y) - O[2], y - O[1], nn[0], nn[1], nn[2], u / n, v / n]; }); for (const q of [P[0], P[2], P[1], P[0], P[3], P[2]]) suelo.push(...q); }
    /* texturas de lado potencia de 2 (512, 256 o 128 px por losa de 160 m) para tener mipmaps y filtro anisótropo: el piso se ve nítido a lo lejos */
    const res = (detalle > 3 ? 1024 : detalle > 2 ? 512 : detalle > 1 ? 256 : 128) / R, L = this.losas.losa(gx, gy, res, false, false), tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    if (L) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, L); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([94, 140, 74]));
    const pot = L && (L.width & (L.width - 1)) === 0; if (pot) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, pot ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (pot && this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const m = new Malla(), minH = detalle >= 2 ? 0 : detalle === 1 ? 10 : 24;
    for (const e of M.edificiosEn(x0, y0, x0 + R, y0 + R)) { if (e.x < x0 || e.x >= x0 + R || e.y < y0 || e.y >= y0 + R || e.h < minH) continue; const st2 = estiloEdificio(M, e), P = Mundo.esquinas(e); let zb = 1e9; for (let i = 0; i < P.length; i += 2) zb = Math.min(zb, M.cota(P[i], P[i + 1])); zb -= O[2] + .3; m.prisma(P, O, zb, zb + e.h + .3, hex3(st2.muro), hex3(st2.techo), { ventanas: detalle >= 2 && e.h > 6 ? (e.s * 1e4 | 0) + 1 : 0, dosAguas: !st2.plano && !e.P && detalle >= 2 ? { ancho: Math.min(e.hw, e.hd) * 2 } : null }); }
    for (const q of M.sitios().E) { if (q.x < x0 || q.x >= x0 + R || q.y < y0 || q.y >= y0 + R) continue; const zb = M.cota(q.x, q.y) - O[2] - .3, mu = hex3(q.clase === 'iglesia' ? '#efe8d8' : '#d9d4c9'), te = hex3(q.techo === 'dos' || q.techo === 'cuatro' ? '#b5542f' : '#bdbcb6'); const h0 = q.partes ? Math.max(3, q.partes[0].z0) : q.h; m.prisma(q.R[0], O, zb, zb + h0, mu, te, { ventanas: detalle >= 2 ? 7 : 0 }); if (q.partes) for (const p of q.partes) m.prisma(p.B, O, zb + p.z0, zb + p.z1, mu, p.techo === 'aguja' ? hex3('#e3e6ea') : te); }
    for (const P of M.pasosEn(x0, y0, x0 + R, y0 + R)) { if (P.nivel <= 0) continue; const T = P.trazo || (P.trazo = new Trazo(P.p)), vi = P.tipo === 'viaducto', rampa = vi ? 0 : Math.min(P.largo * .4, P.peatonal ? 9 : 22), h = s => P.nivel * NIVEL_M * (vi ? 1 : suave(Math.min(s, P.largo - s) / rampa)), paso = 6;
      for (let s = 0; s < P.largo; s += paso) { const a = T.at(s), b = T.at(Math.min(P.largo, s + paso)); if (a.x < x0 || a.x >= x0 + R || a.y < y0 || a.y >= y0 + R) continue; const ha = M.cota(a.x, a.y) + h(s) - O[2], hb = M.cota(b.x, b.y) + h(Math.min(P.largo, s + paso)) - O[2], w = P.ancho / 2, nx = -Math.sin(a.a) * w, ny = Math.cos(a.a) * w, A = [a.x - O[0], a.y - O[1]], Bq = [b.x - O[0], b.y - O[1]], c = hex3(vi ? '#c9cfd8' : P.peatonal ? '#d8cfbd' : '#6a6f79'); m.quad([A[0] + nx, ha, A[1] + ny], [Bq[0] + nx, hb, Bq[1] + ny], [Bq[0] - nx, hb, Bq[1] - ny], [A[0] - nx, ha, A[1] - ny], c); m.quad([A[0] - nx, ha - 1, A[1] - ny], [A[0] - nx, ha, A[1] - ny], [Bq[0] - nx, hb, Bq[1] - ny], [Bq[0] - nx, hb - 1, Bq[1] - ny], hex3('#8e8a80')); m.quad([A[0] + nx, ha - 1, A[1] + ny], [Bq[0] + nx, hb - 1, Bq[1] + ny], [Bq[0] + nx, hb, Bq[1] + ny], [A[0] + nx, ha, A[1] + ny], hex3('#8e8a80'));
        if ((s % (vi ? 30 : 24)) < paso && h(s) > 3) m.caja(A[0], M.cota(a.x, a.y) - O[2], A[1], a.a, 1.4, vi ? 2.2 : 1, h(s) - 1, hex3('#9aa3ad')); } }
    if (detalle >= 1) for (let y = Math.ceil(y0 / 9) * 9; y < y0 + R; y += 9) for (let x = Math.ceil(x0 / 9) * 9; x < x0 + R; x += 9) { const tt = M.suelo(x, y); if (tt !== TT.GRASS && tt !== TT.MOUNT && tt !== TT.PLAZA) continue; const hv = h2(x, y, 41), Z = M.estilo(x, y); if (hv > (tt === TT.MOUNT ? .45 : (Z.arboles || .4) * .5)) continue; const tx = x + h2(x, y, 42) * 6 - O[0], ty = y + h2(x, y, 43) * 6 - O[1], zb = M.cota(x, y) - O[2], r = 2 + h2(x, y, 44) * 2.4, c = hex3(['#3f8a3f', '#4a9444', '#357a38', '#5a9e48'][(hv * 40 | 0) % 4]); m.caja(tx, zb, ty, 0, .5, .5, r, hex3('#6e4a2a')); m.caja(tx, zb + r * .8, ty, hv * 6, r * 1.7, r * 1.7, r * 1.5, c); }
    return { gx, gy, suelo: this._vbo(suelo), tex, cosas: m.d.length ? this._vbo(m.d) : null, detalle };
  }
  /* las cosas que se mueven, en una sola malla por cuadro */
  _dinamico(E) {
    const m = new Malla(), M = this.mundo, O = this.O, rel = (x, y, z) => [x - O[0], z - O[2], y - O[1]];
    const pj = E.jugador; if (pj && !E._sinJugador) { const C = pj.cuerpo, A = pj.aspecto, zb = M.cota(C.x, C.y) + C.zPaso + C.z, J = Personaje.pose(C.estado || 'quieto', C.fase, { alto: A.alto, manubrio: C.veh.manubrio }), ca = Math.cos(C.a), sa = Math.sin(C.a), P = j => rel(C.x + ca * j[0], C.y + sa * j[0], zb + j[1]), Lp = (j, l) => { const p = P(j); return [p[0] - sa * l, p[1], p[2] + ca * l]; };
      const piel = hex3(A.cPiel), cam = hex3(A.cCamisa), pan = hex3(A.cPantalon);
      if (C.veh.clase !== 'pie') { const V = C.veh; if (V.clase === 'auto' || V.clase === 'pesado') { const r = rel(C.x, C.y, zb); m.caja(r[0], r[1] + .3, r[2], C.a, V.largo, V.ancho, V.clase === 'pesado' ? 2.8 : 1.1, hex3(V.color)); m.caja(r[0] - ca * V.largo * .05, r[1] + 1.3, r[2] - sa * V.largo * .05, C.a, V.largo * .5, V.ancho * .9, .55, hex3('#8cbedc')); } else { m.hueso(P([-.5, .35]), P([.55, .35]), .04, hex3('#1b1f27')); m.hueso(P([-.05, .4]), P([.3, .85]), .035, hex3(V.color || '#7ab800')); m.hueso(P([.55, .35]), P([.38, 1.0]), .03, hex3('#2b2f38')); for (const u of [-.52, .55]) m.caja(...rel(C.x + ca * u, C.y + sa * u, zb), C.a, .68, .06, .68, hex3('#1b1f27')); } }
      if (!(C.veh.clase === 'auto' || C.veh.clase === 'pesado')) { m.hueso(Lp(J.cadera, .12), Lp(J.rodI, .12), .07, pan); m.hueso(Lp(J.rodI, .12), Lp(J.pieI, .12), .06, pan); m.hueso(Lp(J.cadera, -.12), Lp(J.rodD, -.12), .07, pan); m.hueso(Lp(J.rodD, -.12), Lp(J.pieD, -.12), .06, pan); if (!this._sinCabeza) m.hueso(P(J.cadera), P(J.pecho), .17, cam); m.hueso(Lp(J.pecho, .2), Lp(J.codoI, .22), .05, cam); m.hueso(Lp(J.codoI, .22), Lp(J.manoI, .2), .045, A.manga ? cam : piel); m.hueso(Lp(J.pecho, -.2), Lp(J.codoD, -.22), .05, cam); m.hueso(Lp(J.codoD, -.22), Lp(J.manoD, -.2), .045, A.manga ? cam : piel); const h = P(J.cabeza); if (!this._sinCabeza) m.caja(h[0], h[1] - .13, h[2], C.a, .24, .22, .26, piel); if (this._sinCabeza) { /* en primera persona se ven las manos y el manubrio */ } else if (A.cCasco) m.caja(h[0], h[1] + .06, h[2], C.a, .3, .27, .12, hex3(A.cCasco)); else m.caja(h[0] - ca * .03, h[1] + .07, h[2] - sa * .03, C.a, .26, .24, .08, hex3(A.cPelo)); }
    }
    for (const v of E.trafico || []) { const T2 = TRAF_TIPOS[v.tipo] || TRAF_TIPOS.carro, r = rel(v.x, v.y, M.cota(v.x, v.y)), h = v.tipo === 'buseta' || v.tipo === 'camion' ? 2.9 : v.tipo === 'moto' || v.tipo === 'bici' ? 1.2 : 1.1; m.caja(r[0], r[1] + .25, r[2], v.a, T2.largo, T2.ancho, h, hex3(v.color), E.cielo && E.cielo.noche > .4 ? .25 : 0); if (h < 2 && v.tipo !== 'moto' && v.tipo !== 'bici') m.caja(r[0], r[1] + 1.35, r[2], v.a, T2.largo * .55, T2.ancho * .92, .5, hex3('#8cbedc')); }
    for (const p of E.peatones || []) { const r = rel(p.x, p.y, M.cota(p.x, p.y)), A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)), sw = Math.sin(p.fase) * .25; m.caja(r[0], r[1], r[2], p.a, .25 + Math.abs(sw) * .3, .3, .9, hex3(A.cPantalon)); m.caja(r[0], r[1] + .9, r[2], p.a, .3, .42, .62, hex3(A.cCamisa)); m.caja(r[0], r[1] + 1.52, r[2], p.a, .22, .2, .24, hex3(A.cPiel)); }
    for (const v of E.vehiculos || []) { const zt = M.cota(v.x, v.y) + (v.z || 0); if (v.clase === 'cable') { const r = rel(v.x, v.y, zt); m.caja(r[0], r[1] - 2.2, r[2], v.a, 2.2, 2, 2, hex3(v.color), .5); m.caja(r[0], r[1] - .2, r[2], v.a, .15, .15, .4, hex3('#2d3138')); continue; } const L = E.transporte && E.transporte.lineas.find(l => l.id === v.linea); if (!L) continue; const n = v.clase === 'metro' ? 6 : v.clase === 'tram' ? 2 : 1, coche = v.largo / n; for (let i = 0; i < n; i++) { const sc = v.s - v.dir * (i + .5) * coche, c = L.T.at(sc), r = rel(c.x, c.y, M.cota(c.x, c.y) + (v.z || 0)); m.caja(r[0], r[1] + .4, r[2], c.a, coche - .6, v.clase === 'brt' || v.clase === 'feeder' ? 2.5 : 3, 3.2, hex3('#e6e9ee'), .35); m.caja(r[0], r[1] + 1.4, r[2], c.a, coche - .5, (v.clase === 'brt' ? 2.5 : 3) + .04, .5, hex3(v.color)); } }
    return m.d;
  }
  /* dibuja en su propio lienzo; devuelve el lienzo (o null si no hay WebGL) */
  dibujar(W, H, E, op = {}) {
    if (!this.ok) return null; const gl = this.gl, C = E.camara, M = this.mundo, cal = E.calidad ?? 1;
    if (this.cv.width !== W || this.cv.height !== H) { this.cv.width = W; this.cv.height = H; }
    const ox = Math.round(C.ojo[0] / 2000) * 2000, oy = Math.round(C.ojo[1] / 2000) * 2000;
    if (!this.O || Math.abs(this.O[0] - ox) > 2500 || Math.abs(this.O[1] - oy) > 2500) { this.liberar(); this.O = [ox, oy, M.cota(ox, oy)]; }
    if (!this.lejos) this._lejos();
    /* regiones a la vista por distancia, con presupuesto de tiempo para construir */
    this._sinCabeza = C.perfil === 'primera'; const R = this.R, radio = 380 + 520 * cal, cx = C.ojo[0], cy = C.ojo[1], quiero = new Map();
    for (let gy = Math.floor((cy - radio) / R); gy <= Math.floor((cy + radio) / R); gy++) for (let gx = Math.floor((cx - radio) / R); gx <= Math.floor((cx + radio) / R); gx++) { const d = Math.hypot((gx + .5) * R - cx, (gy + .5) * R - cy); if (d > radio + R) continue; quiero.set(gx + ',' + gy, d < 100 && cal > .7 ? 4 : d < 170 && cal > .5 ? 3 : d < 300 ? 2 : d < 600 ? 1 : 0); }
    for (const [k, r] of this.regiones) if (!quiero.has(k)) { this._borrar(r); this.regiones.delete(k); }
    const t0 = MC.ahora(), faltan = [...quiero].filter(([k, d]) => { const r = this.regiones.get(k); return !r || r.detalle < d; }).sort((a, b) => { const [ax, ay] = a[0].split(',').map(Number), [bx, by] = b[0].split(',').map(Number); return Math.hypot((ax + .5) * R - cx, (ay + .5) * R - cy) - Math.hypot((bx + .5) * R - cx, (by + .5) * R - cy); });
    for (const [k, d] of faltan) { if (MC.ahora() - t0 > (op.presupuesto || 8) && this.regiones.size) break; const [gx, gy] = k.split(',').map(Number), viejo = this.regiones.get(k); if (viejo) this._borrar(viejo); this.regiones.set(k, this._region(gx, gy, d)); }
    this.pendientes = faltan.length;
    /* cámara y luz */
    const O = this.O, e = [C.ojo[0] - O[0], C.ojo[2] - O[2], C.ojo[1] - O[1]], b = [C.blanco[0] - O[0], C.blanco[2] - O[2], C.blanco[1] - O[1]];
    const P = M4.persp(new Float32Array(16), C.fov, W / H, .3, 9000), V = M4.mirar(new Float32Array(16), e, b), MVP = M4.mul(new Float32Array(16), P, V);
    const S = E.cielo, sol = S.sol, luz = sol.alt > -.05 ? [sol.x, Math.max(.15, sol.z), sol.y] : [.3, .8, .2], ll = Math.hypot(...luz), L = luz.map(v => v / ll), niebla = E.clima ? E.clima.niebla : 0, lluvia = E.clima ? E.clima.lluvia : 0;
    const fog = S.bruma, fr = [radio * (.45 - niebla * .35), radio * (1.05 - niebla * .5) + 1500 * (1 - niebla) * (1 - lluvia * .5)];
    gl.viewport(0, 0, W, H); gl.clearColor(fog[0], fog[1], fog[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* cielo: degradado de pantalla del cénit al horizonte (el horizonte sigue la inclinación de la cámara) */
    gl.disable(gl.DEPTH_TEST); gl.useProgram(this.pS.p); const dy = b[1] - e[1], dh = Math.hypot(b[0] - e[0], b[2] - e[2]) || 1, hz = clamp(-Math.atan2(dy, dh) / (C.fov / 2), -1, 1), t = S.top, hc = S.hor;
    const cielo = [-1, 1, ...t, 1, 1, ...t, -1, hz, ...hc, 1, hz, ...hc, -1, -1, ...fog, 1, -1, ...fog]; const qd = [0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4].flatMap(i => cielo.slice(i * 5, i * 5 + 5));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cielo); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(qd), gl.DYNAMIC_DRAW); this._attr(this.pS, [['aP', 2], ['aC', 3]], 5); gl.drawArrays(gl.TRIANGLES, 0, 12);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
    const uni = (p) => { gl.uniformMatrix4fv(p.u.uM, false, MVP); gl.uniform3fv(p.u.uL, L); gl.uniform1f(p.u.uAmb, S.ambiente * .9); gl.uniform1f(p.u.uSol, S.luzSol * .75); gl.uniform3fv(p.u.uO, e); gl.uniform3fv(p.u.uF, fog); gl.uniform2fv(p.u.uFR, fr); if (p.u.uNoche) gl.uniform1f(p.u.uNoche, S.noche); };
    /* relieve lejano (sin los bloques que caen bajo el detalle) */
    gl.useProgram(this.pC.p); uni(this.pC); gl.disable(gl.CULL_FACE);
    for (const B of this.lejos) { if (Math.hypot(B.cx - cx, B.cy - cy) < radio - 1100) continue; gl.bindBuffer(gl.ARRAY_BUFFER, B.b); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, B.n / 10); }
    /* regiones: suelo con su losa */
    gl.useProgram(this.pT.p); uni(this.pT); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(this.pT.u.uS, 0);
    for (const r of this.regiones.values()) { gl.bindTexture(gl.TEXTURE_2D, r.tex); gl.bindBuffer(gl.ARRAY_BUFFER, r.suelo.b); this._attr(this.pT, [['aP', 3], ['aN', 3], ['aT', 2]], 8); gl.drawArrays(gl.TRIANGLES, 0, r.suelo.n / 8); }
    gl.useProgram(this.pC.p); uni(this.pC);
    for (const r of this.regiones.values()) if (r.cosas) { gl.bindBuffer(gl.ARRAY_BUFFER, r.cosas.b); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, r.cosas.n / 10); }
    const D = this._dinamico(E); if (D.length) { gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(D), gl.DYNAMIC_DRAW); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, D.length / 10); }
    this.mvp = MVP; return this.cv;
  }
  _attr(p, L, paso) { const gl = this.gl; let o = 0; for (const [n, k] of L) { const a = p.a[n]; if (a !== undefined && a >= 0) { gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, k, gl.FLOAT, false, paso * 4, o * 4); } o += k; } }
  /* metros del mundo → píxel de la pantalla (para etiquetas encima de la 3D) */
  aPantalla(x, y, z, W, H) { if (!this.mvp || !this.O) return null; const m = this.mvp, X = x - this.O[0], Y = z - this.O[2], Z = y - this.O[1], cw = m[3] * X + m[7] * Y + m[11] * Z + m[15]; if (cw <= .1) return null; return [(m[0] * X + m[4] * Y + m[8] * Z + m[12]) / cw * W / 2 + W / 2, -(m[1] * X + m[5] * Y + m[9] * Z + m[13]) / cw * H / 2 + H / 2]; }
}
Object.assign(MC, { VistaGL, Malla, M4 });

/* ---- js/46-vistas.js ---- */
/* =====================================================================
   GESTOR DE VISTAS · todas las dimensiones de vista del motor con un solo botón
   cenital · ciudad 3D (oblicua) · maqueta 2:1 · panorámica (de perfil) · tercera persona · primera persona · dron · cine
   + PIXEL en cualquiera de ellas (la misma escena en un búfer pequeño, agrandada sin suavizado).
   - Canvas 2D es la base (anda en todo); WebGL es la mejora (si falta, la 3D cae a la ciudad 3D oblicua).
   - Transición suave entre vistas en el mismo punto (fundido con la vista anterior).
   - Calidad automática: mide el tiempo de cada cuadro y sube o baja el detalle (tráfico, edificios, resolución).
   ===================================================================== */
const VISTAS = [
  { id: 'cenital', n: 'Cenital', icon: '🗺️', tipo: '2d', modo: 'cenital', control: 'mundo' },
  { id: 'ciudad3d', n: 'Ciudad 3D', icon: '🏙️', tipo: '2d', modo: 'oblicua', control: 'mundo' },
  { id: 'maqueta', n: 'Maqueta 2:1', icon: '🧊', tipo: '2d', modo: 'maqueta', control: 'mundo' },
  { id: 'pano', n: 'Panorámica', icon: '🎬', tipo: 'pano', control: 'pano' },
  { id: 'tercera', n: 'Tercera persona', icon: '🎮', tipo: 'gl', perfil: 'tercera', control: 'volante' },
  { id: 'primera', n: 'Primera persona', icon: '👁️', tipo: 'gl', perfil: 'primera', control: 'volante' },
  { id: 'dron', n: 'Dron', icon: '🚁', tipo: 'gl', perfil: 'dron', control: 'volante' },
  { id: 'cine', n: 'Cine', icon: '🎥', tipo: 'gl', perfil: 'cine', control: 'volante' }
];
class Vistas {
  constructor(mundo, op = {}) {
    this.mundo = mundo; this.losas = new Losas(mundo); this.losasLejos = new Losas(mundo, { lado: 1280, max: 40 }); this.pano = new Panoramica(mundo); this.gl = null; this.glIntentado = false;
    this.actual = VISTAS[0]; this.anterior = null; this.pixel = false; this.escalaPixel = op.escalaPixel || 3; this.calidad = op.calidad ?? .85; this.auto = op.auto !== false; this.ms = 16; this.dpr = 1; this.fundido = null; this._buf = null;
  }
  lista() { return VISTAS.map(v => Object.assign({ disponible: v.tipo !== 'gl' || this.hayGL() }, v)); }
  hayGL() { if (!this.glIntentado) { this.glIntentado = true; try { this.gl = new VistaGL(this.mundo, this.losas); if (!this.gl.ok) this.gl = null; } catch (e) { this.gl = null; MC.falla('WebGL', e); } } return !!this.gl; }
  /* cambia de vista (por id) con transición; la cámara toma el perfil de la nueva */
  usar(id, E) {
    let v = VISTAS.find(q => q.id === id) || VISTAS[0]; if (v.tipo === 'gl' && !this.hayGL()) v = VISTAS[1];
    if (v === this.actual) return v; this.anterior = this.actual; this.actual = v;
    if (this._ultimo) { this.fundido = { cv: this._copia(this._ultimo), t: 0 }; }
    if (E && E.camara) { if (v.perfil) E.camara.usarPerfil(v.perfil); if (v.modo === 'oblicua' && E.camara.pitch < .3) E.camara.pitch = .62; if (v.id === 'maqueta') E.camara.zoom = Math.max(E.camara.zoom, 1.2); }
    MC.emit('vista', v); return v;
  }
  siguiente(E, paso = 1) { const L = this.lista().filter(v => v.disponible), i = L.findIndex(v => v.id === this.actual.id); return this.usar(L[(i + paso + L.length) % L.length].id, E); }
  _copia(src) { const c = lienzo(src.width, src.height); if (c) c.getContext('2d').drawImage(src, 0, 0); return c; }
  /* dibuja la escena E en el contexto g (W × H en px de pantalla) */
  dibujar(g, W, H, E, dt = 1 / 60) {
    const t0 = MC.ahora(), v = this.actual, px = this.pixel; E.losas = this.losas; E.losasLejos = this.losasLejos; E.calidad = this.calidad;
    let dst = g, w = W, h = H;
    if (px) { w = Math.max(80, Math.round(W / this.escalaPixel)); h = Math.max(60, Math.round(H / this.escalaPixel)); if (!this._buf || this._buf.width !== w || this._buf.height !== h) this._buf = lienzo(w, h); dst = this._buf.getContext('2d'); }
    const zoomReal = E.camara.zoom; if (px) E.camara.zoom = zoomReal / this.escalaPixel;
    try {
      if (v.tipo === '2d') { Vista2D.dibujar(dst, w, h, E, { modo: v.modo, pixel: px, dpr: this.dpr, presupuesto: this.calidad > .6 ? 3 : 1, etiquetas: !px }); this._clima2D(dst, w, h, E); }
      else if (v.tipo === 'pano') { this.pano.dibujar(dst, w, h, E, px ? { k: clamp(Math.min(w, h * 1.4) / 70, 2, 40) * (zoomReal / 3.2) } : {}); }
      else if (v.tipo === 'gl') { const cv = this.gl && this.gl.dibujar(w, h, E, { presupuesto: 4 + 6 * this.calidad }); if (cv) { dst.drawImage(cv, 0, 0); this._clima2D(dst, w, h, E, true); } else Vista2D.dibujar(dst, w, h, E, { modo: 'oblicua' }); }
    } catch (e) { MC.falla('vista ' + v.id, e); }
    E.camara.zoom = zoomReal;
    if (px) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(this._buf, 0, 0, W, H); g.restore(); }
    /* fundido desde la vista anterior */
    if (this.fundido && this.fundido.cv) { this.fundido.t += dt / .55; const a = 1 - suave(this.fundido.t); if (a <= 0) this.fundido = null; else { g.save(); g.globalAlpha = a; g.drawImage(this.fundido.cv, 0, 0, W, H); g.restore(); } }
    this._ultimo = g.canvas;
    this.losas.trabajar(this.calidad > .6 ? 5 : 3);
    /* calidad automática: media móvil del tiempo de dibujo */
    const ms = MC.ahora() - t0; this.ms = this.ms * .92 + ms * .08;
    if (this.auto) { if (this.ms > 26 && this.calidad > .35) this.calidad = Math.max(.35, this.calidad - .01); else if (this.ms < 11 && this.calidad < 1) this.calidad = Math.min(1, this.calidad + .004); }
    return ms;
  }
  _clima2D(g, W, H, E, gl) {
    const Cl = E.clima; if (!Cl) return; const t = E.t || 0;
    if (Cl.lluvia > .05) { g.strokeStyle = 'rgba(210,228,245,' + (.22 + Cl.lluvia * .3) + ')'; g.lineWidth = 1; g.beginPath(); const n = Math.round((40 + Cl.lluvia * 120) * (W * H / 3e5)), vx = Math.cos(Cl.viento.dir) * Cl.viento.v; for (let i = 0; i < n; i++) { const x = ((h2(i, 3, 3) * W + t * 60 * vx) % W + W) % W, y = (h2(i, 4, 3) * H + t * (gl ? 700 : 260) * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - vx * (gl ? 2 : .6), y + (gl ? 14 : 5)); } g.stroke(); }
    if (!gl && Cl.niebla > .25) { g.fillStyle = 'rgba(205,210,215,' + ((Cl.niebla - .25) * .55).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    if (Cl.rayo > .05) { g.fillStyle = 'rgba(255,255,255,' + (Cl.rayo * .5).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
  }
}
Object.assign(MC, { Vistas, VISTAS });

/* ---- js/47-seguir.js ---- */
/* =====================================================================
   SEGUIR LA RUTA · el cuerpo va solo por la vía real (panorámica de plataformas, Run y paseo guiado)
   - Arma un camino con lo que quedó atrás y lo que viene, y lo alarga al andar: en cada cruce sigue la que
     continúa, o la que el jugador pida (← / → antes del cruce, o lo que diga el GPS).
   - Física sobre el camino: arranque y frenada del vehículo, pendiente real, salto con gravedad.
   - Mantiene el cuerpo (x, y, rumbo) en el mundo: al salir de esta vista se sigue en el mismo punto.
   ===================================================================== */
class SeguirRuta {
  constructor(mundo, cuerpo, op = {}) {
    this.mundo = mundo; this.cuerpo = cuerpo; this.op = op; this.red = mundo.red(op.red || 'rueda'); this.id = (SeguirRuta.n = (SeguirRuta.n || 0) + 1);
    const filtro = op.filtro || null, C = cuerpo;
    let atras = []; try { const R0 = new Recorrido(this.red, C.x, C.y, C.a + Math.PI, { filtro }); R0.alargar(op.atras || 350); atras = R0.pts; } catch (e) { atras = []; }
    this.rec = new Recorrido(this.red, C.x, C.y, C.a, { filtro });
    const rev = []; for (let i = atras.length - 2; i >= 2; i -= 2) rev.push(atras[i], atras[i + 1]);   // al revés y sin el punto de partida (lo trae rec)
    this.atras = rev; this._t = null; this.s = new Trazo(Float32Array.from(rev.length ? [...rev, this.rec.pts[0], this.rec.pts[1]] : [0, 0, 0, 0])).largo * (rev.length ? 1 : 0);
    this.rec.alargar(op.adelante || 500); this.v = Math.abs(C.v); this.pide = 0; this.eventos = [];
  }
  get trazo() { return this._t || (this._t = new Trazo(Float32Array.from([...this.atras, ...this.rec.pts]))); }
  get base() { return this.trazo.largo - this.rec.largo; }   // dónde empieza lo de adelante dentro del camino
  /* el próximo cruce con opciones (para mostrar «↑ izquierda · → derecha») */
  cruceProximo(max = 120) { const sr = this.s - this.base; for (const c of this.rec.cruces) if (c.s > sr - 2 && c.s < sr + max && c.opciones.length > 1) return Object.assign({ falta: c.s - sr }, c); return null; }
  /* el jugador pide girar en el próximo cruce: −1 izquierda, 1 derecha, 0 seguir */
  girar(lado) {
    const c = this.cruceProximo(70); if (!c || lado === this.pide) return false; this.pide = lado;
    const R = this.rec, i = R.tramos.findIndex(t => t.s0 >= c.s - .5); if (i < 1) return false;
    /* se corta el camino en el cruce y se vuelve a alargar con la salida elegida */
    const s0 = R.tramos[i].s0, T = R.trazo; let k = 0; while (k < T.cum.length && T.cum[k] <= s0 + .01) k++;
    R.pts = R.pts.slice(0, 2 * k); R.largo = s0; R.tramos = R.tramos.slice(0, i); R.cruces = R.cruces.filter(q => q.s < c.s - .5); R._t = null; const ult = R.tramos[i - 1]; R.fin = ult.adelante ? ult.arista.b : ult.arista.a; R.cerrado = false;
    R.alargar(R.largo + 1, (ops) => { if (!lado || ops.length < 2) return null; const L = ops.slice().sort((a, b) => a.giro - b.giro), o = lado < 0 ? L[0] : L[L.length - 1]; return Math.abs(o.giro) > .25 ? o : null; });
    R.alargar((this.op.adelante || 500) + (this.s - this.base)); this._t = null; this.eventos.push('gira'); return true;
  }
  /* un paso: E = { acel (−1 frena … 1), salto, turbo } · vel0: acelerador de crucero (la bici sigue sola) */
  paso(dt, E = {}) {
    const C = this.cuerpo, V = C.veh, T0 = this.trazo, q0 = T0.at(this.s), pend = this.mundo.pendiente(q0.x, q0.y, q0.a, 10);
    const crucero = this.op.crucero ?? .6, acel = E.acel > .2 ? crucero + (1 - crucero) * E.acel : E.acel < -.2 ? 0 : crucero, frena = E.acel < -.2;
    const vmax = C.vmax() * (V.electrico ? 1 : Vehiculos.loma(V, pend)) * (E.turbo ? 1.25 : 1) * Math.max(.4, Vehiculos.suelo(V, this.mundo.suelo(q0.x, q0.y)) || .6);
    if (frena) this.v = Math.max(0, this.v - V.freno * dt); else this.v += clamp(vmax * acel - this.v, -V.freno * .5 * dt, V.acc * dt);
    if (!V.electrico && V.clase === 'rueda' && pend < -.03) this.v += -pend * 9.8 * .4 * dt;
    if (E.salto && !C.enAire && V.salto) { C.vz = Math.sqrt(2 * GRAV * .7 * V.salto); C.enAire = true; this.eventos.push('salto'); MC.emit('salto', C); }
    if (C.enAire) { C.z += C.vz * dt; C.vz -= GRAV * dt; if (C.z <= 0) { C.z = 0; C.vz = 0; C.enAire = false; this.eventos.push('aterriza'); } }
    this.avanzar(this.v * dt);
    C.fase += this.v * dt * (V.cuerpo === 'pedalea' ? 1.6 : V.clase === 'pie' ? (this.v > 3.2 ? 2.4 : 3.2) : 1.2);
    C.estado = Personaje.estadoPara(V, this.v, C.enAire); C.pend = pend; C.v = this.v;
    return this;
  }
  /* avanza ds metros por el camino: lo alarga adelante, olvida lo de muy atrás y pone el cuerpo en su punto */
  avanzar(ds) {
    const C = this.cuerpo; this.s += ds;
    const sr = this.s - this.base; if (this.rec.largo - sr < 300 && !this.rec.cerrado) { this.rec.alargar(this.rec.largo + 400); this._t = null; }
    if (this.rec.cerrado && sr > this.rec.largo - 2) { this.s = this.base + this.rec.largo - 2; this.v = 0; this.eventos.push('fin'); }
    if (sr > 900) {   // se olvida lo de muy atrás: quedan 400 m detrás del jugador
      const T = this.trazo, base0 = this.base, quitado = this.rec.podar(sr, 0);
      if (quitado > 0) { const ini = base0 + quitado, desde = this.s - 400, q = T.at(desde), A = [q.x, q.y]; for (let i = q.i + 1; i < T.cum.length; i++) { if (T.cum[i] >= ini - .01) break; A.push(T.p[2 * i], T.p[2 * i + 1]); } this.atras = A; this._t = null; this.s = this.base + (sr - quitado); }
    }
    if (this.pide && !this.cruceProximo(70)) this.pide = 0;
    const T = this.trazo, q = T.at(this.s); C.x = q.x; C.y = q.y; C.a = T.rumbo(this.s, 3);
    const tr = this.rec.tramoEn(this.s - this.base); this.via = tr ? tr.arista : null;
    return this;
  }
  /* metros reales desde el jugador hasta un punto s del camino (y al revés) */
  get alFin() { return this.rec.cerrado ? this.base + this.rec.largo - this.s : Infinity; }
}
MC.SeguirRuta = SeguirRuta;

/* ---- js/50-run.js ---- */
/* =====================================================================
   F4 · RUN EN LA CICLOVÍA · «si vas por una ciclovía y tocas Run, todo cambia al estilo Run Scooter»
   - El corredor es Run Scooter casi idéntico (run/run-scooter.js, importado de RunRunZero), sobre el
     camino REAL desde donde vas: la ciclorruta y, en cada cruce, la que continúa (si se acaba, la calle).
   - Las lomas son el relieve real del camino y las curvas, su curvatura real; las esquinas salen en los
     cruces reales con calles a los dos lados: si doblas allá, doblas en el mundo abierto.
   - Puedes parar (freno), caminar o correr (a pie) y cambiar de vehículo; las metas y los retos siguen.
   - Al salir vuelves al mundo abierto en el mismo punto, a la misma hora y con el mismo clima.
   - Solo se puede en la ciclovía (casilla CICLO o una ciclorruta a menos de 7 m): así el cambio es verosímil.
   Escala: un metro del corredor son ESC metros reales (el corredor es arcade: va más rápido que la vida).
   ===================================================================== */
const RUN_VEH = { pie: 'foot', bici: 'bike', bici_propia: 'bike', bmx: 'bike', mtb: 'bike', ruta: 'bike', ebike: 'ebike', patinete: 'scooter', scooter: 'moped', monopatin: 'escooter', monociclo: 'euc', skate: 'skate', longboard: 'long', patines: 'inline', quad: 'quad', triciclo: 'trike', jetpack: 'jetpack', moto: 'moto', carro: 'auto', camion: 'camion' };
const RUN_SFX = new Set(['coin', 'jump', 'jump2', 'land', 'duck', 'lane', 'smash', 'shield', 'trick', 'stumble', 'crash', 'power', 'zone', 'deliver', 'revive', 'near', 'grind', 'clue', 'gift']);
const Run = {
  ESC: .5, activo: false,
  /* ¿se puede entrar a Run aquí y con este vehículo? */
  puede(mundo, cuerpo) { if (!MC.RunScooter) return { ok: false, razon: 'Run no está en esta compilación' }; if (!cuerpo.veh.run) return { ok: false, razon: 'Ese vehículo no corre Run' }; if (!mundo.esCiclovia(cuerpo.x, cuerpo.y, 7)) return { ok: false, razon: 'Run solo sale en la ciclovía' }; return { ok: true }; },
  /* op: { mundo, cuerpo, reloj, clima, aspecto, lienzo, capa, hud, alSalir(resultado), vehiculos: [ids] } */
  entrar(op) {
    const RS = MC.RunScooter, M = op.mundo, C = op.cuerpo, P0 = Run.puede(M, C); if (!P0.ok) throw new Error(P0.razon);
    const red = M.red('rueda'), cic = red.cercana(C.x, C.y, 12, e => e.k === VIA.CICLO);
    if (cic) { const a = cic.arista.t.rumbo(cic.s); C.x = cic.x; C.y = cic.y; C.a = Math.cos(angDif(C.a, a)) >= 0 ? a : a + Math.PI; }
    const seguir = new SeguirRuta(M, C, { red: 'rueda', atras: 120, adelante: 700 }), ESC = this.ESC, z0 = M.cota(C.x, C.y), cv = op.lienzo, capa = op.capa;
    capa.hidden = false; const dpr = Math.min(1.5, window.devicePixelRatio || 1); cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    if (!Run._gl) { if (!RS.R.init(cv)) throw new Error('Run necesita WebGL'); RS.RN.init(); try { RS.R.texture(RS.makeAtlas()); } catch (e) { MC.falla('Run: atlas', e); } Run._gl = true; }
    RS.R.resize && RS.R.resize(1);
    const A = op.aspecto, cos = { helmet: A.cCasco || '#ffffff', he: false, shirt: A.cCamisa, pants: A.cPantalon, se: false, paint: C.veh.color || '#7ab800', pe: false, pet: 'm0', skin: A.cPiel, hair: ['corto', 'coleta', 'afro', 'corto', 'moño'][(A.peinado | 0) % 5], hc: A.cPelo };
    let vid = RUN_VEH[C.veh.id] || 'bike'; RS.RN.setPlayer(cos, vid);
    /* el mapa entre el corredor (s del juego) y el mundo (s real del camino) */
    let ps = 0; const sReal = s => seguir.s + (s - ps) * ESC, punto = s => { const T = seguir.trazo; return T.at(clamp(sReal(s), 0, T.largo)); };
    const V = RS.RUNV, usados = new Set(); let ultGiro = -1e9;
    V.ponHill(s => (M.cota(punto(s).x, punto(s).y) - z0) * ESC * 1.15);
    V.hr = Ps => { const o = Ps - 60, d = 6, h = this._h || (this._h = new Float32Array(64)); for (let i = 0; i < 64; i++) { const q = punto(o + i * d); h[i] = (M.cota(q.x, q.y) - z0) * ESC * 1.15; } return { h, o: [o, d] }; };
    V.bend = Ps => clamp(seguir.trazo.curva(sReal(Ps + 30), 14) * ESC / 2, -.006, .006);
    V.esquina = (g, s) => {
      for (const c of seguir.rec.cruces) {
        const sg = ps + (seguir.base + c.s - seguir.s) / ESC; if (sg < s + 18 || sg > s + 420 || usados.has(c.nodo)) continue;
        const izq = c.opciones.filter(o => o.giro < -.6), der = c.opciones.filter(o => o.giro > .6); if (!izq.length || !der.length) continue;
        usados.add(c.nodo); const z = g.zt[g.zt.length - 1].z, n = RS.ZONES.length, L = izq[0], R2 = der[der.length - 1];
        return { s: sg, z, L: { z: (z + 1) % n, n: L.k === VIA.CICLO ? 1 : 2 }, R: { z: (z + 2) % n, n: R2.k === VIA.CICLO ? 1 : 2 }, done: 0, ai: null, real: { izq: L.nombre || 'calle', der: R2.nombre || 'calle', nodo: c.nodo } };
      }
      return null;
    };
    V.gira = (c, dir) => { if (seguir.girar(dir)) { ultGiro = seguir.s; this._aviso((dir < 0 ? '↰ ' : '↱ ') + ((c.real && (dir < 0 ? c.real.izq : c.real.der)) || 'Doblaste')); } };
    V.cielo = env => { const S = MC.Cielo.en(op.reloj.fecha, op.reloj.hora, op.clima), k = .65; for (const [a, b] of [['top', 'top'], ['hor', 'hor']]) for (let i = 0; i < 3; i++) env[a][i] = lerp(env[a][i], S[b][i], k); env.amb *= .55 + .45 * S.dia; env.sunI *= .35 + .65 * S.luzSol; env.stars = Math.max(env.stars || 0, S.noche); env.emit = Math.max(env.emit, S.noche * .6); };
    const g = RS.newGame({ seed: hashTxt(op.reloj.fecha.toDateString() + Math.round(C.x) + ',' + Math.round(C.y)), veh: vid, up: {}, mult: 1, cluesLeft: 0, letters: '', tut: false, fit: 60, evt: '' });
    try { RS.AU.init(); RS.AU.music(true); } catch (e) { /* sin audio */ }
    /* ---------- interfaz propia (la del juego que lo use puede reemplazarla) ---------- */
    const hud = op.hud; hud.innerHTML = `<div class="rTop" style="position:absolute;top:10px;left:10px;right:10px;display:flex;gap:6px;flex-wrap:wrap;font:800 13px system-ui;color:#fff;text-shadow:0 1px 3px #000"><span id="rCalle" style="background:#0b1020b0;padding:6px 10px;border-radius:999px"></span><span id="rDist" style="background:#0b1020b0;padding:6px 10px;border-radius:999px"></span><span id="rPts" style="background:#0b1020b0;padding:6px 10px;border-radius:999px"></span></div>
      <div id="rEn" style="position:absolute;top:52px;left:12px;width:150px;height:8px;border-radius:6px;background:#ffffff30;overflow:hidden"><i style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#39ffb3,#ffc23a)"></i></div>
      <div id="rAviso" style="position:absolute;top:24%;left:50%;transform:translateX(-50%);font:900 20px system-ui;color:#fff;text-shadow:0 2px 6px #000;text-align:center;transition:opacity .3s;opacity:0"></div>
      <div id="rEsq" style="position:absolute;top:34%;left:0;right:0;display:flex;justify-content:space-between;padding:0 12px;font:900 15px system-ui;color:#ffc23a;text-shadow:0 2px 4px #000"></div>
      <div style="position:absolute;right:10px;top:48px;display:flex;flex-direction:column;gap:6px">${[['rSalir', '✕', 'Salir'], ['rVeh', '🔁', 'Vehículo'], ['rPie', '🚶', 'A pie']].map(([id, i, t]) => `<button id="${id}" style="width:58px;height:50px;border-radius:14px;border:1px solid #ffffff30;background:#0b1020c0;color:#fff;font:700 18px system-ui">${i}<br><small style="font-size:9px">${t}</small></button>`).join('')}</div>
      <div style="position:absolute;right:12px;bottom:24px;display:flex;gap:10px">${[['rFreno', '■', 'FRENO'], ['rImp', '⚡', 'IMPULSO']].map(([id, i, t]) => `<button id="${id}" style="width:72px;height:72px;border-radius:50%;border:2px solid #39ffb3;background:#0b1020c0;color:#fff;font:900 22px system-ui">${i}<br><small style="font-size:9px">${t}</small></button>`).join('')}</div>
      <div id="rFin" hidden style="position:absolute;inset:0;display:grid;place-content:center;gap:10px;background:#0b1020c8;text-align:center;font:800 18px system-ui;color:#fff"><div id="rFinT"></div><button id="rOtra" style="padding:12px 20px;border-radius:12px;border:2px solid #39ffb3;background:#102a22;color:#39ffb3;font:900 18px system-ui">Seguir corriendo</button><button id="rSalir2" style="padding:12px 20px;border-radius:12px;border:1px solid #ffffff40;background:#0b1020;color:#fff;font:800 16px system-ui">Volver al mundo abierto</button></div>`;
    const $h = id => hud.querySelector('#' + id), cola = [], meter = k => cola.push(k);
    this._aviso = (t, ms = 1600) => { const a = $h('rAviso'); a.textContent = t; a.style.opacity = 1; clearTimeout(this._at); this._at = setTimeout(() => a.style.opacity = 0, ms); };
    $h('rSalir').onclick = $h('rSalir2').onclick = () => salir(); $h('rOtra').onclick = () => { if (RS.revive) RS.revive(g); else { g.p.alive = true; g.p.deadT = 0; g.p.inv = 2; } $h('rFin').hidden = true; };
    const vehs = (op.vehiculos || ['bici', 'ebike', 'patinete', 'scooter', 'monopatin', 'skate', 'longboard', 'patines', 'quad', 'monociclo', 'triciclo', 'pie']).filter(v => RUN_VEH[v]);
    const cambia = id => { const v = RS.VEHI[RUN_VEH[id]]; if (!v) return; C.setVeh(id); vid = v.id; g.veh = v; g.street = v.street ? 1 : 0; g.vs = v.spd; g.hk = v.hnd; g.bmax = v.boost; RS.RN.setPlayer(Object.assign({}, cos, { paint: C.veh.color || cos.paint }), vid); this._aviso(C.veh.icon + ' ' + C.veh.n); };
    $h('rVeh').onclick = () => { const i = vehs.indexOf(C.veh.id); cambia(vehs[(i + 1) % vehs.length]); };
    $h('rPie').onclick = () => cambia('pie');
    const pd = (id, k, k2) => { const b = $h(id); b.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); meter(k); }; if (k2) b.onpointerup = b.onpointerleave = () => meter(k2); };
    pd('rFreno', 'K', 'k'); pd('rImp', 'B');
    /* gestos: deslizar ← → ↑ ↓ (como en Run Scooter) y teclado */
    let t0 = null; const pdn = e => { if (e.target.closest('button')) return; t0 = { x: e.clientX, y: e.clientY }; }, pup = e => { if (!t0) return; const dx = e.clientX - t0.x, dy = e.clientY - t0.y; t0 = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) { meter('U'); return; } meter(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'L' : 'R') : (dy < 0 ? 'U' : 'D')); };
    capa.addEventListener('pointerdown', pdn); capa.addEventListener('pointerup', pup);
    const TK = { ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R', ArrowUp: 'U', KeyW: 'U', Space: 'U', ArrowDown: 'D', KeyS: 'D', ShiftLeft: 'B', KeyF: 'B', KeyX: 'K', KeyQ: 'Q', KeyE: 'E' };
    const kd = e => { if (e.repeat) return; if (e.code === 'Escape') return salir(); if (e.code === 'KeyV') return $h('rVeh').onclick(); const k = TK[e.code]; if (k) { meter(k); e.preventDefault(); e.stopImmediatePropagation(); } }, ku = e => { if (e.code === 'KeyX') meter('k'); };
    addEventListener('keydown', kd, true); addEventListener('keyup', ku, true);
    /* ---------- bucle ---------- */
    let acc = 0, last = performance.now(), raf = 0, metros = 0, hudT = 0;
    this.activo = true; this.g = g; this.seguir = seguir; MC.emit('run', { entra: true });
    this._aviso('🛴 RUN · ' + (seguir.via && seguir.via.nombre || 'ciclorruta'), 2200);
    const cuadro = ts => {
      raf = requestAnimationFrame(cuadro); const dt = Math.min(.1, (ts - last) / 1000); last = ts; op.reloj.avanzar(dt); op.clima.actualizar(op.reloj, dt); V.lluvia = op.clima.lluvia > .15 ? clamp(op.clima.lluvia, 0, 1) : 0;
      if (g.p.alive) { acc += dt; let n = 0; while (acc >= RS.DT && n < 14) { RS.step(g, RS.DT, cola.shift() || null); acc -= RS.DT; n++; const ds = (g.p.s - ps) * ESC; ps = g.p.s; if (ds > 0) { seguir.avanzar(ds); metros += ds; } } if (n >= 14) acc = 0; }
      else { RS.step(g, dt, null); if (g.p.deadT > 1.1 && $h('rFin').hidden) { $h('rFin').hidden = false; $h('rFinT').innerHTML = '¡Uy! ' + (g.cause || 'Te caíste') + '<br><small>' + Math.round(metros) + ' m reales · ' + g.score + ' puntos</small>'; } }
      /* curvas fuertes del camino real (que no son una esquina elegida): la cámara gira como en una esquina */
      const k = seguir.trazo.curva(seguir.s + 6, 6); if (Math.abs(k) > .07 && seguir.s - ultGiro > 25) { ultGiro = seguir.s; RS.RN.events(g, { k: 'turn', a: { dir: Math.sign(k), z: 0, n: 2 } }); }
      for (const e of g.ev) { RS.RN.events(g, e); if (RUN_SFX.has(e.k)) try { RS.AU.sfx(e.k); } catch (er) { /* sin audio */ } if (e.k === 'trick' && e.a) this._aviso('🛹 ' + e.a.name); }
      g.ev.length = 0;
      try { RS.RN.frame(g, 'play', ts / 1000, dt); } catch (e) { MC.falla('Run: dibujo', e); }
      hudT -= dt; if (hudT <= 0) { hudT = .2; $h('rCalle').textContent = '📍 ' + ((seguir.via && seguir.via.nombre) || M.calle(C.x, C.y) || 'ciclorruta') + ' · ' + M.barrio(C.x, C.y); $h('rDist').textContent = (metros / 1000).toFixed(2) + ' km · ' + Math.round(g.p.v * ESC * 3.6) + ' km/h'; $h('rPts').textContent = '★ ' + Math.round(g.score) + ' · ◉ ' + g.coinsRun; $h('rEn').firstChild.style.width = Math.round(100 * g.p.en / g.enMax) + '%';
        const cn = g.corners.find(c => !c.done && c.s - g.p.s < 70 && c.s - g.p.s > -1); $h('rEsq').innerHTML = cn && cn.real ? `<span>↰ ${cn.real.izq}</span><span>${cn.real.der} ↱</span>` : ''; }
    };
    raf = requestAnimationFrame(cuadro);
    const salir = () => {
      if (!this.activo) return; this.activo = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); capa.removeEventListener('pointerdown', pdn); capa.removeEventListener('pointerup', pup);
      try { RS.AU.music(false); } catch (e) { /* sin audio */ }
      for (const k of ['hr', 'bend', 'esquina', 'gira', 'cielo', 'lluvia']) V[k] = undefined;
      C.v = 0; C.z = 0; C.enAire = false; C.paso = null; C.zPaso = 0; hud.innerHTML = ''; capa.hidden = true;
      const r = { metros, puntos: Math.round(g.score), monedas: g.coinsRun, saltos: g.jumps, trucos: g.tricks, calle: M.calle(C.x, C.y), x: C.x, y: C.y };
      MC.emit('run', Object.assign({ entra: false }, r)); if (op.alSalir) op.alSalir(r);
    };
    this.salir = salir; return { g, seguir, salir };
  }
};
MC.Run = Run;

MC.archivos = ["00-nucleo.js","01-inflate.js","10-mundo.js","11-red.js","20-tiempo.js","21-trafico.js","22-transporte.js","30-personaje.js","31-vehiculos.js","32-fisica.js","33-controles.js","34-camara.js","40-dibujo.js","41-vista2d.js","42-vehiculos-lado.js","43-panoramica.js","45-gl.js","46-vistas.js","47-seguir.js","50-run.js"];
root.MC = MC;
if (!root.Valle) root.Valle = MC.ValleCompat;
if (!root.MotorValle) root.MotorValle = MC.ValleCompat;
})(typeof window !== 'undefined' ? window : globalThis);
