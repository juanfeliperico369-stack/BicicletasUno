/* Motor City 4.1.0 · 2026-11-21 · https://github.com/juanfeliperico369-stack/motorcity
   Un solo motor de mundo abierto para Juega EnCicla, El Metro y los juegos que vienen. Sin librerías ni internet.
   Datos del mundo: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; capas oficiales de Medellín; relieve SRTM/NASA. */
(function (root) {
'use strict';
/* ---- js/00-nucleo.js ---- */
/* =====================================================================
   MOTOR CITY · NÚCLEO (MC)
   El motor de mundo abierto que comparten Juega EnCicla, El Metro y los juegos que vienen.
   Todo el motor vive en un solo cierre y solo publica MC (y, por compatibilidad con los juegos 1.x, Valle/MotorValle).
   Reglas: un solo HTML, sin internet ni librerías; español de Colombia; ningún dato personal.
   ===================================================================== */
/* respaldo para celulares viejos (política de navegadores en CLAUDE.md: Baseline ampliamente disponible y, para lo más nuevo,
   respaldo de pocas líneas sin dependencias). iOS 16 (iPhone 8 y X) no trae Promise.withResolvers; Android 6 no trae toSorted ni toReversed. */
if (!Array.prototype.toSorted) Object.defineProperty(Array.prototype, 'toSorted', { value(f) { return this.slice().sort(f); }, writable: true, configurable: true });
if (!Array.prototype.toReversed) Object.defineProperty(Array.prototype, 'toReversed', { value() { return this.slice().reverse(); }, writable: true, configurable: true });
if (!Promise.withResolvers) Promise.withResolvers = function () { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const MC = {
  version: '4.1.0',
  nombre: 'Motor City',
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
/* estilo de dibujo del motor: 'realista' (2.6, por defecto: texturas, desgaste, árboles con volumen) o 'clasico' (plano y limpio) */
MC.estilo = 'realista';
/* 2.8 · accesibilidad (entrega maestra §10.3 y §13): cuánto se sacude la cámara y cuántas partículas hay, de 0 a 1 */
MC.opciones = { sacudida: 1, particulas: 1 };
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

/* ---- js/02-ciencia.js ---- */
/* =====================================================================
   CIENCIA · matemáticas, física y química fieles a la realidad (unidades del SI)
   Todo es puro y determinista (mismas entradas → mismas salidas) y está probado en pruebas/prueba.mjs.
   - Constantes y unidades · vectores y geometría · ruido (Perlin, fbm, crestas) · muestreo de Poisson
   - Integradores (Euler semiimplícito, RK4) · estadística y distribuciones
   - Física: atmósfera estándar (ISA), arrastre, sustentación, rodadura, pendiente, flotación, choques, proyectiles,
     fricción por superficie y clima · Termodinámica: calor, enfriamiento de Newton, punto de rocío, índice de
     calor y sensación térmica · Química: elementos, masa molar de fórmulas, balanceo exacto de ecuaciones,
     gases ideales, pH, combustibles y baterías, materiales.
   ===================================================================== */
const C = {
  g: 9.80665, G: 6.6743e-11, R: 8.314462618, NA: 6.02214076e23, kB: 1.380649e-23, sigma: 5.670374419e-8, c: 299792458,
  Raire: 287.05, cpAire: 1005, rhoAire: 1.225, rhoAgua: 1000, cpAgua: 4186, Lv: 2.257e6, Lf: 3.34e5, P0: 101325, T0: 288.15, atm: 101325
};
const U = {
  kmh: v => v / 3.6, aKmh: v => v * 3.6, mph: v => v * .44704, nudos: v => v * .514444,
  C_K: t => t + 273.15, K_C: t => t - 273.15, F_C: f => (f - 32) * 5 / 9, C_F: c => c * 9 / 5 + 32,
  kWh: e => e * 3.6e6, aKWh: j => j / 3.6e6, cv: p => p * 735.49875, hp: p => p * 745.699872, aCv: w => w / 735.49875,
  psi: p => p * 6894.757, bar: p => p * 1e5, L: v => v / 1000, cal: c => c * 4.184, kcal: c => c * 4184, aKcal: j => j / 4184, grad: r => r * 180 / Math.PI, rad: d => d * Math.PI / 180
};
/* ---------- vectores (arreglos) y geometría ---------- */
const V2 = { suma: (a, b) => [a[0] + b[0], a[1] + b[1]], resta: (a, b) => [a[0] - b[0], a[1] - b[1]], esc: (a, k) => [a[0] * k, a[1] * k], punto: (a, b) => a[0] * b[0] + a[1] * b[1], cruz: (a, b) => a[0] * b[1] - a[1] * b[0], largo: a => Math.hypot(a[0], a[1]), unit: a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }, rot: (a, t) => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)] };
const V3 = { suma: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], resta: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], esc: (a, k) => [a[0] * k, a[1] * k, a[2] * k], punto: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cruz: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], largo: a => Math.hypot(a[0], a[1], a[2]), unit: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; } };
const Geo = {
  area(P) { let a = 0; const n = P.length >> 1; for (let i = 0; i < n; i++) { const j = (i + 1) % n; a += P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; } return a / 2; },
  centroide(P) { let cx = 0, cy = 0, a = 0; const n = P.length >> 1; for (let i = 0; i < n; i++) { const j = (i + 1) % n, f = P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; a += f; cx += (P[2 * i] + P[2 * j]) * f; cy += (P[2 * i + 1] + P[2 * j + 1]) * f; } a /= 2; return a ? [cx / (6 * a), cy / (6 * a)] : [P[0], P[1]]; },
  /* cruce de los segmentos ab y cd: [t, u] o null */
  cruce(a, b, c, d) { const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-12) return null; const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den; return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [t, u] : null; },
  /* envolvente convexa (cadena monótona de Andrew) de puntos [[x,y],…] */
  envolvente(Pts) { const p = Pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p; const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); } for (const q of p.slice().reverse()) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); } hi.pop(); lo.pop(); return lo.concat(hi); },
  bezier: (p0, p1, p2, p3, t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; },
  catmull: (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3); return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]; }
};
const Suaviza = { entra: t => t * t, sale: t => t * (2 - t), entraSale: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t, cubica: t => t * t * (3 - 2 * t), quintica: t => t * t * t * (t * (t * 6 - 15) + 10), rebote: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; }, elastico: t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1 };
/* ---------- ruido coherente (Perlin con gradientes, sembrado) ---------- */
class Ruido {
  constructor(semilla = 1) { const r = mulberry32(semilla), p = new Uint8Array(256); for (let i = 0; i < 256; i++) p[i] = i; for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)), t = p[i]; p[i] = p[j]; p[j] = t; } this.p = new Uint8Array(512); for (let i = 0; i < 512; i++) this.p[i] = p[i & 255]; }
  /* Perlin 2D en [-1, 1] (aprox.) */
  n2(x, y) {
    const P = this.p, X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y);
    const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10), gr = (h, a, b) => { switch (h & 7) { case 0: return a + b; case 1: return -a + b; case 2: return a - b; case 3: return -a - b; case 4: return a; case 5: return -a; case 6: return b; default: return -b; } };
    const aa = P[P[X] + Y], ab = P[P[X] + Y + 1], ba = P[P[X + 1] + Y], bb = P[P[X + 1] + Y + 1];
    return lerp(lerp(gr(aa, x, y), gr(ba, x - 1, y), u), lerp(gr(ab, x, y - 1), gr(bb, x - 1, y - 1), u), v) * .7071;
  }
  /* movimiento browniano fraccional: octavas que suman detalle */
  fbm(x, y, oct = 5, lac = 2, gan = .5) { let a = 1, f = 1, s = 0, n = 0; for (let i = 0; i < oct; i++) { s += a * this.n2(x * f, y * f); n += a; a *= gan; f *= lac; } return s / n; }
  /* crestas (cordilleras afiladas) en [0, 1] */
  crestas(x, y, oct = 5) { let a = .5, f = 1, s = 0, w = 1; for (let i = 0; i < oct; i++) { let v = 1 - Math.abs(this.n2(x * f, y * f)); v *= v * w; w = clamp(v * 2, 0, 1); s += v * a; a *= .5; f *= 2; } return s; }
  /* deformación del dominio (formas orgánicas) */
  torcido(x, y, k = 1.5) { return this.fbm(x + k * this.fbm(x + 5.2, y + 1.3, 3), y + k * this.fbm(x + 1.7, y + 9.2, 3)); }
}
/* muestreo de Poisson en disco (Bridson): puntos repartidos sin amontonarse, para árboles, casas, NPC… */
function poissonDisco(ancho, alto, r, semilla = 1, k = 24, acepta) {
  const rand = mulberry32(semilla), cel = r / Math.SQRT2, gw = Math.ceil(ancho / cel), gh = Math.ceil(alto / cel), grid = new Int32Array(gw * gh).fill(-1), pts = [], act = [];
  const pon = (x, y) => { pts.push([x, y]); act.push(pts.length - 1); grid[Math.floor(y / cel) * gw + Math.floor(x / cel)] = pts.length - 1; };
  pon(rand() * ancho, rand() * alto);
  while (act.length) { const i = Math.floor(rand() * act.length), [px, py] = pts[act[i]]; let ok = false;
    for (let t = 0; t < k; t++) { const a = rand() * TAU, d = r * (1 + rand()), x = px + Math.cos(a) * d, y = py + Math.sin(a) * d; if (x < 0 || y < 0 || x >= ancho || y >= alto) continue; const gx = Math.floor(x / cel), gy = Math.floor(y / cel); let lejos = true;
      for (let j = Math.max(0, gy - 2); j <= Math.min(gh - 1, gy + 2) && lejos; j++) for (let q = Math.max(0, gx - 2); q <= Math.min(gw - 1, gx + 2); q++) { const o = grid[j * gw + q]; if (o >= 0 && (pts[o][0] - x) ** 2 + (pts[o][1] - y) ** 2 < r * r) { lejos = false; break; } }
      if (lejos && (!acepta || acepta(x, y))) { pon(x, y); ok = true; break; } }
    if (!ok) act.splice(i, 1); }
  return pts;
}
/* ---------- integradores ---------- */
const Integra = {
  /* y' = f(t, y) con y un arreglo de números (RK4 clásico) */
  rk4(f, t, y, h) { const k1 = f(t, y), y2 = y.map((v, i) => v + h / 2 * k1[i]), k2 = f(t + h / 2, y2), y3 = y.map((v, i) => v + h / 2 * k2[i]), k3 = f(t + h / 2, y3), y4 = y.map((v, i) => v + h * k3[i]), k4 = f(t + h, y4); return y.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); },
  /* Euler semiimplícito (estable para juegos): primero la velocidad, luego la posición */
  euler(x, v, a, h) { const v2 = v + a * h; return [x + v2 * h, v2]; }
};
/* ---------- estadística y azar con distribuciones ---------- */
const Est = {
  media: L => L.reduce((a, b) => a + b, 0) / (L.length || 1),
  desv: L => { const m = Est.media(L); return Math.sqrt(L.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, L.length - 1)); },
  percentil: (L, p) => { const s = L.toSorted((a, b) => a - b), i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.min(s.length - 1, lo + 1)] - s[lo]) * (i - lo); },
  normal: (r, m = 0, s = 1) => { const u = Math.max(1e-12, r()), v = r(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); },
  exponencial: (r, lam) => -Math.log(1 - r()) / lam,
  poisson: (r, lam) => { const L = Math.exp(-lam); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; },
  ponderado: (r, items) => { let t = 0; for (const [, w] of items) t += w; let x = r() * t; for (const [v, w] of items) { x -= w; if (x <= 0) return v; } return items[items.length - 1][0]; }
};
/* ---------- física ---------- */
const MU = { asfalto: [.9, .8], asfalto_mojado: [.6, .5], concreto: [.85, .75], adoquin: [.7, .6], grava: [.6, .5], tierra: [.55, .45], barro: [.35, .25], pasto: [.45, .35], arena: [.5, .4], nieve: [.3, .2], hielo: [.12, .08], madera: [.6, .5], caucho_metal: [.8, .6] };   // [estático, dinámico] de caucho sobre…
const Fis = {
  /* atmósfera estándar internacional (troposfera, h < 11 km): { T (K), p (Pa), rho (kg/m³) } */
  atmosfera(h) { const T = C.T0 - .0065 * h, p = C.P0 * Math.pow(1 - 2.25577e-5 * h, 5.25588); return { T, p, rho: p / (C.Raire * T) }; },
  arrastre: (rho, v, Cd, A) => .5 * rho * v * v * Cd * A,                       // N
  sustentacion: (rho, v, Cl, S) => .5 * rho * v * v * Cl * S,                   // N
  rodadura: (Crr, m, pend = 0) => Crr * m * C.g * Math.cos(Math.atan(pend)),  // N
  pendiente: (m, pend) => m * C.g * Math.sin(Math.atan(pend)),                 // N (pend: tanto por uno, subida > 0)
  flotacion: (rhoFluido, V) => rhoFluido * V * C.g,                           // N
  /* velocidad máxima donde la potencia iguala arrastre + rodadura (+ pendiente) [m/s] — bisección */
  vmaxPotencia(P, m, Cd, A, Crr, rho = C.rhoAire, pend = 0) { let lo = 0, hi = 150; for (let i = 0; i < 60; i++) { const v = (lo + hi) / 2, F = Fis.arrastre(rho, v, Cd, A) + Fis.rodadura(Crr, m, pend) + Fis.pendiente(m, pend); if (F * v > P) hi = v; else lo = v; } return (lo + hi) / 2; },
  frenada: (v, mu) => v * v / (2 * mu * C.g),                                  // m hasta detenerse
  /* tiro parabólico sin aire: alcance y tiempo desde altura h0 */
  proyectil(v0, ang, h0 = 0) { const vx = v0 * Math.cos(ang), vy = v0 * Math.sin(ang), t = (vy + Math.sqrt(vy * vy + 2 * C.g * h0)) / C.g; return { t, alcance: vx * t, alturaMax: h0 + vy * vy / (2 * C.g) }; },
  /* choque 1D con coeficiente de restitución e (1 elástico, 0 plástico): velocidades después */
  choque(m1, v1, m2, v2, e = 1) { const P = m1 * v1 + m2 * v2, M = m1 + m2; return [(P + m2 * e * (v2 - v1)) / M, (P + m1 * e * (v1 - v2)) / M]; },
  energiaCinetica: (m, v) => .5 * m * v * v,
  mu: (sup, mojado) => { const b = MU[sup] || MU.asfalto; return mojado && MU[sup + '_mojado'] ? MU[sup + '_mojado'][1] : b[1] * (mojado ? .72 : 1); },
  /* péndulo simple (balanceo de cabinas, columpios): periodo */
  periodoPendulo: L => TAU * Math.sqrt(L / C.g)
};
/* ---------- termodinámica y humedad ---------- */
const Termo = {
  calor: (m, c, dT) => m * c * dT,
  newton: (T, Tamb, k, t) => Tamb + (T - Tamb) * Math.exp(-k * t),
  /* punto de rocío (fórmula de Magnus, °C) */
  rocio(Tc, HR) { const a = 17.625, b = 243.04, g = Math.log(HR / 100) + a * Tc / (b + Tc); return b * g / (a - g); },
  humedad(Tc, Td) { const a = 17.625, b = 243.04; return 100 * Math.exp(a * Td / (b + Td) - a * Tc / (b + Tc)); },
  /* índice de calor (regresión de Rothfusz, NOAA) en °C */
  indiceCalor(Tc, HR) { const T = U.C_F(Tc); if (T < 80) return Tc; const R = HR; let F = -42.379 + 2.04901523 * T + 10.14333127 * R - .22475541 * T * R - 6.83783e-3 * T * T - 5.481717e-2 * R * R + 1.22874e-3 * T * T * R + 8.5282e-4 * T * R * R - 1.99e-6 * T * T * R * R; return U.F_C(F); },
  /* sensación térmica por viento (Environment Canada; T ≤ 10 °C, viento > 4,8 km/h) */
  sensacionViento(Tc, vKmh) { if (Tc > 10 || vKmh <= 4.8) return Tc; const v = Math.pow(vKmh, .16); return 13.12 + .6215 * Tc - 11.37 * v + .3965 * Tc * v; },
  /* temperatura con la altura (gradiente de 6,5 °C por km) */
  conAltura: (T0, h0, h) => T0 - .0065 * (h - h0)
};
/* ---------- química ---------- */
const ELEMENTOS = 'H:1.008:hidrógeno He:4.0026:helio Li:6.94:litio Be:9.0122:berilio B:10.81:boro C:12.011:carbono N:14.007:nitrógeno O:15.999:oxígeno F:18.998:flúor Ne:20.180:neón Na:22.990:sodio Mg:24.305:magnesio Al:26.982:aluminio Si:28.085:silicio P:30.974:fósforo S:32.06:azufre Cl:35.45:cloro Ar:39.948:argón K:39.098:potasio Ca:40.078:calcio Ti:47.867:titanio V:50.942:vanadio Cr:51.996:cromo Mn:54.938:manganeso Fe:55.845:hierro Co:58.933:cobalto Ni:58.693:níquel Cu:63.546:cobre Zn:65.38:zinc Br:79.904:bromo Ag:107.87:plata Sn:118.71:estaño I:126.90:yodo Pt:195.08:platino Au:196.97:oro Hg:200.59:mercurio Pb:207.2:plomo U:238.03:uranio'.split(' ').reduce((o, s, i) => { const [sim, m, n] = s.split(':'); o[sim] = { z: i + 1, masa: +m, nombre: n }; return o; }, {});
const Quim = {
  ELEMENTOS,
  /* «Ca(OH)2» → { Ca: 1, O: 2, H: 2 } (acepta paréntesis anidados e hidratos con ·) */
  atomos(f) {
    const partes = f.split(/[·.*]/); if (partes.length > 1) { const T = {}; for (const p of partes) { const m = p.match(/^(\d+)(.*)$/), k = m ? +m[1] : 1, A = Quim.atomos(m ? m[2] : p); for (const e in A) T[e] = (T[e] || 0) + A[e] * k; } return T; }
    let i = 0; const pila = [{}];
    while (i < f.length) { const ch = f[i];
      if (ch === '(' || ch === '[') { pila.push({}); i++; }
      else if (ch === ')' || ch === ']') { i++; let n = ''; while (/\d/.test(f[i] || '')) n += f[i++]; const g = pila.pop(), top = pila[pila.length - 1]; for (const e in g) top[e] = (top[e] || 0) + g[e] * (+n || 1); }
      else { const m = f.slice(i).match(/^([A-Z][a-z]?)(\d*)/); if (!m) throw new Error('fórmula inválida: ' + f); if (!ELEMENTOS[m[1]]) throw new Error('elemento desconocido: ' + m[1]); const top = pila[pila.length - 1]; top[m[1]] = (top[m[1]] || 0) + (+m[2] || 1); i += m[0].length; } }
    if (pila.length !== 1) throw new Error('paréntesis sin cerrar: ' + f); return pila[0];
  },
  masaMolar(f) { const A = Quim.atomos(f); let m = 0; for (const e in A) m += ELEMENTOS[e].masa * A[e]; return m; },   // g/mol
  /* balancea una ecuación «C8H18 + O2 -> CO2 + H2O» con coeficientes enteros mínimos (eliminación de Gauss exacta) */
  balancear(ec) {
    const [izq, der] = ec.split(/->|=>|→|=/).map(s => s.split('+').map(t => t.trim()).filter(Boolean)), esp = [...izq, ...der], el = [...new Set(esp.flatMap(e => Object.keys(Quim.atomos(e))))];
    const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }, fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
    const sub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => fr(a[0] * b[0], a[1] * b[1]), div = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
    const M = el.map(e => esp.map((s, j) => fr((Quim.atomos(s)[e] || 0) * (j < izq.length ? 1 : -1))));
    const n = esp.length, piv = []; let r = 0;
    for (let c = 0; c < n && r < M.length; c++) { let p = r; while (p < M.length && M[p][c][0] === 0) p++; if (p === M.length) continue; [M[r], M[p]] = [M[p], M[r]]; const pv = M[r][c]; M[r] = M[r].map(v => div(v, pv)); for (let i = 0; i < M.length; i++) if (i !== r && M[i][c][0] !== 0) { const f = M[i][c]; M[i] = M[i].map((v, j) => sub(v, mul(f, M[r][j]))); } piv.push(c); r++; }
    const libre = [...Array(n).keys()].find(c => !piv.includes(c)); if (libre === undefined) throw new Error('la ecuación no tiene solución única');
    const x = Array(n).fill(null).map(() => fr(0)); x[libre] = fr(1); piv.forEach((c, i) => { x[c] = fr(-M[i][libre][0], M[i][libre][1]); });
    const lcm = x.reduce((a, v) => a * v[1] / gcd(a, v[1]), 1), ent = x.map(v => v[0] * lcm / v[1]), g = ent.reduce((a, v) => gcd(a, v)), co = ent.map(v => Math.abs(v / g));
    return { coef: co, texto: izq.map((s, i) => (co[i] > 1 ? co[i] + ' ' : '') + s).join(' + ') + ' → ' + der.map((s, i) => (co[izq.length + i] > 1 ? co[izq.length + i] + ' ' : '') + s).join(' + ') };
  },
  /* gases ideales PV = nRT: pasa tres y devuelve el que falta */
  gas({ P, V, n, T }) { if (P == null) return n * C.R * T / V; if (V == null) return n * C.R * T / P; if (n == null) return P * V / (C.R * T); return P * V / (n * C.R); },
  pH: H => -Math.log10(H),
  /* energía de combustibles y baterías (valores típicos; poder calorífico inferior) */
  COMBUSTIBLES: { gasolina: { MJkg: 43.4, MJL: 32.2, CO2kgL: 2.31 }, diesel: { MJkg: 42.6, MJL: 35.8, CO2kgL: 2.68 }, etanol: { MJkg: 26.8, MJL: 21.2, CO2kgL: 1.51 }, gnv: { MJkg: 47.1, MJL: null, CO2kgL: null }, hidrogeno: { MJkg: 120, MJL: null, CO2kgL: 0 }, bateria_litio: { MJkg: .9, MJL: 2.2, CO2kgL: 0 }, cuerpo_humano: { MJkg: 37.7, MJL: null, CO2kgL: null } },
  MATERIALES: { acero: { rho: 7850, fluencia: 250e6, E: 200e9 }, aluminio: { rho: 2700, fluencia: 276e6, E: 69e9 }, fibra_carbono: { rho: 1600, fluencia: 600e6, E: 70e9 }, titanio: { rho: 4500, fluencia: 880e6, E: 114e9 }, madera: { rho: 600, fluencia: 40e6, E: 11e9 }, concreto: { rho: 2400, fluencia: 3e6, E: 30e9 }, ladrillo: { rho: 1900, fluencia: 7e6, E: 15e9 }, vidrio: { rho: 2500, fluencia: 50e6, E: 70e9 }, caucho: { rho: 1100, fluencia: 15e6, E: .05e9 }, plastico_abs: { rho: 1050, fluencia: 40e6, E: 2.3e9 } }
};
Object.assign(MC, { C, U, V2, V3, Geo, Suaviza, Ruido, poissonDisco, Integra, Est, Fis, MU, Termo, Quim });
MC.Ciencia = { C, U, V2, V3, Geo, Suaviza, Ruido, poissonDisco, Integra, Est, Fis, MU, Termo, Quim };

/* ---- js/03-economia.js ---- */
/* =====================================================================
   ECONOMÍA · números lógicos y verificables para cualquier juego
   - Dinero en enteros (centavos): nunca hay errores de coma flotante en las cuentas.
   - Libro contable de partida doble: toda transacción cuadra (debe = haber) y el sistema no crea dinero de la nada.
   - Mercados con oferta y demanda (equilibrio lineal exacto y ajuste walrasiano en el tiempo), elasticidad y choques.
   - Finanzas: interés compuesto, inflación, cuota de un préstamo (sistema francés), valor presente neto y TIR,
     depreciación. Empleos y salarios por hora de juego.
   Los valores de referencia (salario mínimo, precios) son configurables: actualízalos cada año en la ciudad.
   ===================================================================== */
const Dinero = {
  moneda: 'COP', decimales: 0,
  /* de unidades a centavos (enteros) y al revés */
  aCent: v => Math.round(v * 100), deCent: c => c / 100,
  formato(cent, moneda = Dinero.moneda) { try { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: moneda, maximumFractionDigits: moneda === 'COP' ? 0 : 2 }).format(cent / 100); } catch (e) { return '$' + Math.round(cent / 100).toLocaleString('es-CO'); } },
  /* reparte un monto en partes enteras proporcionales que suman exacto (método del mayor residuo) */
  repartir(cent, pesos) { const T = pesos.reduce((a, b) => a + b, 0), base = pesos.map(p => Math.floor(cent * p / T)); let resto = cent - base.reduce((a, b) => a + b, 0); const ord = pesos.map((p, i) => [cent * p / T - base[i], i]).sort((a, b) => b[0] - a[0]); for (let k = 0; resto > 0; k++, resto--) base[ord[k % ord.length][1]]++; return base; }
};
/* libro de partida doble: cuentas con saldo en centavos; cada asiento mueve de una a otra y la suma total siempre es 0 */
class Libro {
  constructor() { this.cuentas = new Map(); this.asientos = []; this.cuenta('mundo'); }
  cuenta(id, tipo = 'activo') { if (!this.cuentas.has(id)) this.cuentas.set(id, { id, tipo, saldo: 0 }); return this.cuentas.get(id); }
  saldo(id) { return (this.cuentas.get(id) || { saldo: 0 }).saldo; }
  /* mueve `cent` de `de` a `a`; con `estricto`, no deja saldos negativos (salvo el mundo, que emite) */
  mover(de, a, cent, concepto = '', estricto = true) {
    cent = Math.round(cent); if (cent <= 0) return false; const D = this.cuenta(de), A = this.cuenta(a);
    if (estricto && de !== 'mundo' && D.saldo < cent) return false;
    D.saldo -= cent; A.saldo += cent; this.asientos.push({ de, a, cent, concepto, n: this.asientos.length }); if (this.asientos.length > 5000) this.asientos.splice(0, 1000); MC.emit('dinero', { de, a, cent, concepto }); return true;
  }
  cuadra() { let s = 0; for (const c of this.cuentas.values()) s += c.saldo; return s === 0; }
}
/* un mercado: demanda Qd = a − b·P y oferta Qs = c + d·P (P en unidades de moneda) */
class Mercado {
  constructor({ nombre, a, b, c, d, precio }) { Object.assign(this, { nombre, a, b, c, d }); this.precio = precio ?? this.equilibrio().P; this.choque = 0; }
  equilibrio() { const P = (this.a + this.choque - this.c) / (this.b + this.d); return { P, Q: this.a + this.choque - this.b * P }; }
  demanda(P = this.precio) { return Math.max(0, this.a + this.choque - this.b * P); }
  oferta(P = this.precio) { return Math.max(0, this.c + this.d * P); }
  /* elasticidad precio de la demanda en el precio actual */
  elasticidad(P = this.precio) { const Q = this.demanda(P); return Q ? -this.b * P / Q : -Infinity; }
  /* ajuste walrasiano: el precio sube si falta y baja si sobra (k: velocidad por unidad de tiempo) */
  paso(dt, k = .05) { const exceso = this.demanda() - this.oferta(); this.precio = Math.max(0, this.precio + k * exceso * dt); return this.precio; }
}
const Finanzas = {
  compuesto: (P, r, n) => P * Math.pow(1 + r, n),                       // capital con interés r por periodo, n periodos
  inflacion: (precio, anual, anios) => precio * Math.pow(1 + anual, anios),
  tasaPeriodo: (anual, periodos = 12) => Math.pow(1 + anual, 1 / periodos) - 1,   // tasa efectiva anual → por periodo
  /* cuota fija de un préstamo (sistema francés) y su tabla */
  cuota: (P, r, n) => r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)),
  amortizacion(P, r, n) { const q = Finanzas.cuota(P, r, n), T = []; let s = P; for (let i = 1; i <= n; i++) { const int = s * r, ab = q - int; s -= ab; T.push({ n: i, cuota: q, interes: int, abono: ab, saldo: Math.max(0, s) }); } return T; },
  vpn: (r, flujos) => flujos.reduce((a, f, t) => a + f / Math.pow(1 + r, t), 0),
  /* tasa interna de retorno por bisección (flujos con un cambio de signo) */
  tir(flujos) { let lo = -.99, hi = 10; const f = r => Finanzas.vpn(r, flujos); if (f(lo) * f(hi) > 0) return null; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; },
  depreciacionLineal: (costo, residual, vida, t) => Math.max(residual, costo - (costo - residual) * t / vida),
  depreciacionDecreciente: (costo, tasa, t) => costo * Math.pow(1 - tasa, t)
};
/* empleos y salarios: el pago por hora de juego sale del salario mensual de referencia */
const Trabajo = {
  referencia: { salarioMinimo: 1423500, horasMes: 192, nota: 'Salario mínimo de Colombia de 2025 como referencia: actualízalo en la configuración de la ciudad.' },
  porHora: (mensual, horasMes = Trabajo.referencia.horasMes) => mensual / horasMes,
  /* pago de un turno en centavos (con recargo nocturno del 35 % entre las 9 p. m. y las 6 a. m., como en Colombia) */
  turno(mensual, minInicio, minutos) { const h = Trabajo.porHora(mensual) / 60; let pago = 0; for (let m = 0; m < minutos; m++) { const t = (minInicio + m) % 1440, noche = t >= 1260 || t < 360; pago += h * (noche ? 1.35 : 1); } return Math.round(pago * 100); }
};
Object.assign(MC, { Dinero, Libro, Mercado, Finanzas, Trabajo });

/* ---- js/04-escala.js ---- */
/* =====================================================================
   ESCALA · que todo tenga el tamaño y la proporción de la realidad
   Regla de oro: el motor piensa en METROS, SEGUNDOS y KILOGRAMOS. El dibujo solo multiplica por los píxeles por metro
   de cada vista (pxPorMetro). Así una persona, una puerta, una bici, un carro, un bus y un edificio guardan siempre su
   proporción real en todas las vistas y en todos los juegos.
   - MEDIDAS: tamaños de referencia (con su rango) de personas, puertas, pisos, calles, vehículos, árboles y mobiliario.
   - validar(): revisa el registro de vehículos (o cualquier lista) y dice qué se sale de lo real.
   - Ayudas: altura por clase, píxeles por metro enteros para el pixel art, escala de sprites y «arcade» sin deformar.
   ===================================================================== */
const MEDIDAS = {
  /* gente (Colombia: hombres ≈ 1,72 m y mujeres ≈ 1,59 m de estatura media adulta, NCD‑RisC) */
  persona: { alto: [1.45, 1.95], ref: 1.68 }, nino8: { alto: [1.15, 1.40], ref: 1.28 },
  /* arquitectura (NSR‑10 y práctica común) */
  puerta: { alto: [2.0, 2.4], ancho: [.7, 1.2], ref: [2.1, .9] }, piso: { alto: [2.5, 3.6], ref: 3.0 }, escalon: { alto: [.15, .18], fondo: [.28, .30] },
  baranda: { alto: [.9, 1.1] }, ventana: { alto: [1.0, 1.5], antepecho: [.9, 1.1] },
  /* calles */
  carril: { ancho: [2.8, 3.65], ref: 3.25 }, anden: { ancho: [1.2, 4] }, ciclorruta: { ancho: [1.6, 3.0], ref: 2.4 }, poste: { alto: [8, 12] }, semaforo: { alto: [4.5, 6] },
  /* naturaleza */
  arbol: { alto: [4, 30], ref: 10 }, palma: { alto: [8, 25] },
  /* vehículos: largo, ancho, alto (m) y masa (kg) */
  pie: { largo: [.3, .8], ancho: [.3, .8], alto: [1.4, 2], masa: [40, 120] },
  rueda: { largo: [.3, 2.6], ancho: [.15, 1.2], alto: [.1, 1.3], masa: [55, 220] },
  moto: { largo: [1.7, 2.5], ancho: [.6, 1.0], alto: [1, 1.5], masa: [140, 450] },
  auto: { largo: [3.0, 5.6], ancho: [1.5, 2.1], alto: [.95, 2.0], masa: [550, 3000] },
  pesado: { largo: [6, 19], ancho: [2.2, 2.6], alto: [2.6, 4.4], masa: [3500, 52000] },
  riel: { largo: [18, 140], ancho: [2.4, 3.3], alto: [3.2, 4.2], masa: [30000, 250000] },
  cable: { largo: [1.8, 3.5], ancho: [1.6, 2.6], alto: [2, 2.8], masa: [500, 1500] },
  aire: { largo: [.5, 40], ancho: [.5, 40], alto: [1, 12], masa: [80, 80000] },
  agua: { largo: [1.5, 15], ancho: [.5, 4], alto: [.5, 3.5], masa: [5, 12000] }
};
const ALTO_CLASE = { pie: 1.7, rueda: 1.1, moto: 1.2, auto: 1.45, pesado: 3.4, riel: 3.8, cable: 2.4, aire: 2.5, agua: 1.2 };
const Escala = {
  MEDIDAS,
  alto(V) { return V.alto || ALTO_CLASE[V.clase] || 1.5; },
  /* píxeles por metro para que la vista muestre «metros» de alto en «px» de pantalla; con pixel art, entero */
  pxPorMetro(px, metros, entero) { const k = px / Math.max(.01, metros); return entero ? Math.max(1, Math.round(k)) : k; },
  /* cuánto se escala un sprite dibujado con «altoPx» de alto para que mida «altoReal» metros a «pxm» píxeles por metro */
  escalaSprite(altoPx, altoReal, pxm) { return altoReal * pxm / Math.max(1, altoPx); },
  /* ¿está v (un número o [largo, ancho, alto]) dentro del rango real? con tolerancia */
  dentro(v, rango, tol = .05) { return v >= rango[0] * (1 - tol) && v <= rango[1] * (1 + tol); },
  /* revisa una lista de vehículos (por defecto todo el registro) y devuelve lo que no es proporcional */
  validar(lista) {
    const L = lista || (MC.Vehiculos ? [...MC.Vehiculos.lista.values()] : []), malos = [];
    for (const V of L) { const R = MEDIDAS[V.clase]; if (!R) continue; const alto = Escala.alto(V);
      for (const [k, v] of [['largo', V.largo], ['ancho', V.ancho], ['alto', alto], ['masa', V.masa]]) if (v != null && R[k] && !Escala.dentro(v, R[k])) malos.push({ id: V.id, medida: k, valor: v, rango: R[k] }); }
    return malos;
  },
  /* proporción real entre dos cosas (p. ej. Escala.proporcion('auto', 'persona') ≈ 0,86 de alto) */
  proporcion(a, b, medida = 'alto') { const A = MEDIDAS[a], B = MEDIDAS[b], va = A && (Array.isArray(A.ref) ? A.ref[0] : A.ref || (A[medida] && (A[medida][0] + A[medida][1]) / 2)), vb = B && (Array.isArray(B.ref) ? B.ref[0] : B.ref || (B[medida] && (B[medida][0] + B[medida][1]) / 2)); return va && vb ? va / vb : NaN; },
  /* «arcade» sin deformar: un juego puede ir más rápido (tiempo) o comprimir distancias de viaje (mapa), pero los
     cuerpos conservan su tamaño. Devuelve los factores para cada cosa. */
  arcade({ velocidad = 1, distancia = 1 } = {}) { return { velocidad, tiempo: distancia / velocidad, tamano: 1 }; }
};
MC.Escala = Escala;

/* ---- js/05-gpu.js ---- */
/* =====================================================================
   GPU VIRTUAL · que el juego ande fluido en cualquier aparato, tenga o no tenga tarjeta gráfica
   1. PERFIL: mira qué hay (WebGL 2 o 1, el nombre del procesador gráfico, si es por software como SwiftShader
      o llvmpipe, el tamaño máximo de textura, la memoria, los núcleos y la densidad de la pantalla) y elige un nivel:
      'alta' · 'media' · 'baja' · 'software' (sin GPU: la 3D la dibuja MC.Raster en Canvas 2D).
   2. RESOLUCIÓN DINÁMICA: un controlador PI que sube o baja la escala de dibujo (0,5–1) para cumplir el tiempo de
      cuadro objetivo (16,7 ms a 60 Hz o 33,3 ms a 30 Hz). Es lo que hacen las consolas: bajar píxeles antes que cuadros.
   3. BUCLE DE PASO FIJO: la física avanza en pasos de 1/60 s (determinista e igual en todo aparato), el dibujo
      interpola entre el paso anterior y el actual, y hay tope para que un aparato lento no entre en la «espiral de
      la muerte». Se pausa sola cuando la pestaña no se ve (ahorra batería).
   4. RESORTES: suavizado críticamente amortiguado (el SmoothDamp de los motores grandes), igual a cualquier FPS.
   ===================================================================== */
const GPU = {
  _perfil: null,
  /* lo que tiene el aparato (se mide una vez) */
  perfil(forzar) {
    if (this._perfil && !forzar) return this._perfil;
    const P = { webgl: 0, renderer: '', software: false, maxTex: 0, memoria: 0, nucleos: 1, dpr: 1, movil: false, reducirMovimiento: false, nivel: 'media' };
    if (typeof window === 'undefined' || typeof document === 'undefined') { P.nivel = 'sin-pantalla'; return (this._perfil = P); }
    const nav = window.navigator || {}; P.memoria = nav.deviceMemory || 0; P.nucleos = nav.hardwareConcurrency || 1; P.dpr = window.devicePixelRatio || 1;
    P.movil = /Android|iPhone|iPad|Mobile/i.test(nav.userAgent || '') || (window.matchMedia && matchMedia('(pointer:coarse)').matches);
    P.reducirMovimiento = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    try {
      const cv = document.createElement('canvas'); let gl = cv.getContext('webgl2'); P.webgl = gl ? 2 : 0;
      if (!gl) { gl = cv.getContext('webgl') || cv.getContext('experimental-webgl'); P.webgl = gl ? 1 : 0; }
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info'); P.renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '');
        P.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0; P.software = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(P.renderer);
        const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
      }
    } catch (e) { P.webgl = 0; }
    /* el nivel: sin WebGL o por software → 'software'; poca memoria o pocos núcleos → 'baja' */
    if (!P.webgl || P.software) P.nivel = 'software';
    else if ((P.memoria && P.memoria <= 2) || P.nucleos <= 2 || P.maxTex < 4096) P.nivel = 'baja';
    else if (P.movil && (P.memoria && P.memoria <= 4 || P.nucleos <= 4)) P.nivel = 'media';
    else P.nivel = 'alta';
    return (this._perfil = P);
  },
  /* lo que conviene en cada nivel: escala de dibujo, cuadros por segundo, calidad inicial, si usar WebGL */
  ajustes(nivel = this.perfil().nivel) {
    return ({
      alta: { escala: 1, fps: 60, calidad: 1, gl: true, dprMax: 2 },
      media: { escala: .85, fps: 60, calidad: .8, gl: true, dprMax: 1.5 },
      baja: { escala: .7, fps: 30, calidad: .55, gl: true, dprMax: 1 },
      software: { escala: .6, fps: 30, calidad: .45, gl: false, dprMax: 1 },
      'sin-pantalla': { escala: 1, fps: 60, calidad: 1, gl: false, dprMax: 1 }
    })[nivel] || { escala: .8, fps: 60, calidad: .8, gl: true, dprMax: 1.5 };
  }
};

/* controlador de resolución dinámica: medir() cada cuadro con los ms de dibujo; escala va de min a max */
class ResDinamica {
  constructor(op = {}) { this.objetivo = op.objetivo || 1000 / 60; this.min = op.min ?? .5; this.max = op.max ?? 1; this.escala = op.escala ?? 1; this.integral = 0; this.ms = this.objetivo; this.kp = op.kp ?? .012; this.ki = op.ki ?? .002; }
  medir(ms) {
    if (!(ms >= 0) || ms > 1000) return this.escala; this.ms = this.ms * .85 + ms * .15;
    const err = (this.objetivo * .85 - this.ms) / this.objetivo;   // margen del 15 %: el navegador también necesita su tiempo
    this.integral = clamp(this.integral + err, -20, 20);
    /* el costo del dibujo crece con el área (escala²): se corrige en raíz para no oscilar */
    this.escala = clamp(this.escala + this.kp * err + this.ki * this.integral * .1, this.min, this.max);
    return this.escala;
  }
}

/* DENSIDAD DINÁMICA DEL LIENZO (2.11). En 2D lo caro es pintar píxeles (el reloj de JS no lo ve: el cuadro tarda 2 ms en JS
   y 27 ms en total en la maqueta con densidad 2). Se mide el tiempo REAL entre cuadros y se elige la densidad del lienzo
   (píxeles del lienzo por píxel CSS). El juego redimensiona su lienzo y multiplica el zoom de la cámara por la razón.
   Medido en Chromium sin GPU, celular 412×860: maqueta con densidad 2 → 1,5 pasa de 21–27 ms a 16,7 ms; el cómic, de 35 a 19.
   Reglas: escalones fijos; baja tras ~0,8 s por encima de 21 ms; solo se queda abajo si de verdad mejoró (si no, el cuello
   no es pintar o la pantalla va a 30 Hz, y vuelve con un «piso» de 60 s); sube tras 4 s holgados; si al subir se pone lento
   enseguida, ese escalón queda de «techo» 30 s. Un estado por clave (vista), porque cada vista cuesta distinto.
   Uso: const D = new MC.DensidadLienzo({ max: Math.min(2, devicePixelRatio) });  cada cuadro: const d = D.medir(dt, vista.id); */
class DensidadLienzo {
  constructor(op = {}) { this.max = op.max || 1; this.min = op.min ?? .75; this.activa = op.activa !== false; this.pasos = this._pasos(); this.R = {}; this.d = this.max; }
  _pasos() { const L = []; for (const m of DensidadLienzo.FACTORES) { const d = Math.max(this.min, Math.round(this.max * m * 100) / 100); if (!L.includes(d)) L.push(d); } return L; }
  ponerMax(max) { if (Math.abs(max - this.max) < 1e-6) return; this.max = max; this.pasos = this._pasos(); this.R = {}; }
  medir(dt, clave = 'v') {
    const P = this.pasos; if (!this.activa) return (this.d = P[0]);
    const R = this.R[clave] ||= { i: 0, techo: 0, techoT: 0, piso: 99, pisoT: 0, ema: null, lento: 0, holgado: 0, prueba: null, subio: 99 }, ms = dt * 1000;
    if (!(ms > 0) || ms > 250) return (this.d = P[R.i]);   // pestaña en pausa o cuadro perdido: no cuenta
    R.ema = R.ema == null ? ms : R.ema * .9 + ms * .1; R.subio += dt;
    if (R.techo > 0 && (R.techoT -= dt) <= 0) { R.techo--; R.techoT = 30; } if (R.piso < 99 && (R.pisoT -= dt) <= 0) R.piso = 99;
    if (R.prueba && (R.prueba.t += dt) > .6) {   // el primer medio segundo se hornean las losas nuevas: no cuenta
      const Q = R.prueba; Q.m = Q.m == null ? ms : Q.m * .9 + ms * .1;
      if (Q.t > 2.2) { if (Q.m > Q.antes * .93) { R.i = Q.i0; R.piso = R.i; R.pisoT = 60; } R.ema = Q.m; R.prueba = null; }
    }
    if (R.ema > 21) { R.lento += dt; R.holgado = 0; } else if (R.ema < 18.2) { R.holgado += dt; R.lento = Math.max(0, R.lento - dt); } else { R.lento = Math.max(0, R.lento - dt * .5); R.holgado = 0; }
    if (!R.prueba && R.lento > .8 && R.i < Math.min(P.length - 1, R.piso)) { if (R.subio < 2.5) { R.techo = R.i + 1; R.techoT = 30; } R.prueba = { i0: R.i, antes: R.ema, t: 0, m: null }; R.i++; R.lento = 0; }
    else if (!R.prueba && R.holgado > 4 && R.i > R.techo) { R.i--; R.holgado = 0; R.subio = 0; }
    return (this.d = P[R.i]);
  }
}
DensidadLienzo.FACTORES = [1, .75, .62, .5];

/* bucle de juego de paso fijo con interpolación: actualizar(dt fijo) y dibujar(alfa, dtReal) */
class Bucle {
  constructor({ actualizar, dibujar, paso = 1 / 60, maxPasos = 5 } = {}) { this.actualizar = actualizar; this.dibujar = dibujar; this.paso = paso; this.maxPasos = maxPasos; this.acum = 0; this.t0 = 0; this.corre = false; this.fps = 60; this.pasos = 0; this._f = t => this._cuadro(t); this.limiteFps = 0; this._ultDib = 0; }
  iniciar() { if (this.corre) return this; this.corre = true; this.t0 = MC.ahora(); if (typeof document !== 'undefined' && !this._vis) { this._vis = () => { if (document.hidden) this.pausar(); else this.iniciar(); }; document.addEventListener('visibilitychange', this._vis); } if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(this._f); return this; }
  pausar() { this.corre = false; }
  /* un cuadro (también se puede llamar a mano en pruebas con t en ms) */
  _cuadro(t) {
    if (!this.corre) return; let dt = (t - this.t0) / 1000; this.t0 = t; if (!(dt > 0)) dt = 0; dt = Math.min(dt, .25);   // tope: nunca más de 1/4 s de golpe
    this.acum += dt; let n = 0;
    if (MC._pausaImpacto > 0) { MC._pausaImpacto -= dt; this.acum = 0; }   /* 2.7 · hitstop: tras un golpe, el mundo se congela un instante (se sigue dibujando) */
    else while (this.acum >= this.paso && n < this.maxPasos) { this.actualizar && this.actualizar(this.paso); this.acum -= this.paso; n++; this.pasos++; }
    if (n === this.maxPasos) this.acum = 0;   // espiral de la muerte: se suelta el atraso
    this.fps = this.fps * .95 + (dt > 0 ? 1 / dt : 60) * .05;
    const espera = this.limiteFps ? 1000 / this.limiteFps - 1 : 0;
    if (!espera || t - this._ultDib >= espera) { this._ultDib = t; this.dibujar && this.dibujar(this.acum / this.paso, dt); }
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(this._f);
  }
}

/* resorte críticamente amortiguado (SmoothDamp): llega sin pasarse, igual a 30 o a 144 cuadros por segundo.
   estado = { v } (velocidad); t = tiempo de llegada aproximado (s) */
function resorte(actual, objetivo, estado, t, dt) {
  const w = 2 / Math.max(1e-4, t), x = w * dt, ex = 1 / (1 + x + .48 * x * x + .235 * x * x * x), d = actual - objetivo, tmp = (estado.v + w * d) * dt;
  estado.v = (estado.v - w * tmp) * ex; let r = objetivo + (d + tmp) * ex;
  if ((objetivo - actual > 0) === (r > objetivo)) { r = objetivo; estado.v = 0; }   // no se pasa del objetivo
  return r;
}
function resorteAng(actual, objetivo, estado, t, dt) { return resorte(actual, actual + angDif(actual, objetivo), estado, t, dt); }
Object.assign(MC, { GPU, ResDinamica, DensidadLienzo, Bucle, resorte, resorteAng });

/* ---- js/10-mundo.js ---- */
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
      if (e.P) { if (dentroPol(e.P, x, y) && (r >= 0 || [[-r, 0], [r, 0], [0, -r], [0, r]].every(([a, b]) => dentroPol(e.P, x + a, y + b)))) return e; }   // r < 0: solo si está a más de |r| adentro
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
  pasosEn(x0, y0, x1, y1) {
    const pasos = this.pasos(), lado = 128;
    const ix = Math.floor(x0/lado), iy = Math.floor(y0/lado), fx = Math.floor(x1/lado), fy = Math.floor(y1/lado);
    if (this._consultasPasos?.fuente !== pasos) this._consultasPasos = {fuente:pasos, zonas:new Map()};
    const zonas = this._consultasPasos.zonas, clave = [ix,iy,fx,fy].join(',');
    let cerca = zonas.get(clave);
    if (!cerca) {
      cerca = pasos.filter(({caja:b}) => b[2]>=ix*lado && b[0]<=(fx+1)*lado && b[3]>=iy*lado && b[1]<=(fy+1)*lado);
      if (zonas.size >= 96) zonas.delete(zonas.keys().next().value);
      zonas.set(clave,cerca);
    }
    return cerca.filter(({caja:b}) => b[2]>=x0 && b[0]<=x1 && b[3]>=y0 && b[1]<=y1);
  }
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

/* ---- js/10-sectores.js ---- */
/* C-M34 · Primer paso hacia streaming MC4 por sectores de 1 km.
   Reduce la memoria de regiones ED1 de edificios DECODIFICADOS cerca de la cámara;
   el MC4 y las capas de suelo todavía permanecen completos en la memoria de la partida.
   No intercambia ficheros ni descarga datos: funciona offline y no borra mundos. */
class Sectores1km {
  constructor(mundo,op={}){
    this.mundo=mundo;this.lado=Math.max(250,op.lado||1000);
    this.maxSectores=Math.max(1,Math.floor(op.maxSectores||9));
    this.maxRegiones=Math.max(4,Math.floor(op.maxRegiones||36));
    this.radio=Math.max(0,Math.min(3,op.radio??1));
    this.cache=new Map();this.ultimo={sx:0,sy:0,antes:0,despues:0,evictas:0};
  }
  zona(x,y){return {sx:Math.floor(x/this.lado),sy:Math.floor(y/this.lado)};}
  pedir(sx,sy){
    if(!Number.isFinite(sx)||!Number.isFinite(sy))return null;
    sx=Math.floor(sx);sy=Math.floor(sy);
    const clave=sx+','+sy;
    if(this.cache.has(clave)){
      const c=this.cache.get(clave);this.cache.delete(clave);this.cache.set(clave,c);return c;
    }
    const x0=sx*this.lado,y0=sy*this.lado,x1=x0+this.lado,y1=y0+this.lado,m=this.mundo;
    const sector={
      id:clave,sx,sy,x0,y0,x1,y1,
      /* Devuelve geometría de edificios a petición, no mantiene otra copia por sector. */
      edificios:()=> typeof m?.edificiosEn==='function'?m.edificiosEn(x0,y0,x1,y1,[]):[]
    };
    this.cache.set(clave,sector);
    while(this.cache.size>this.maxSectores)this.cache.delete(this.cache.keys().next().value);
    return sector;
  }
  actualizar(x,y){
    const {sx,sy}=this.zona(x,y);
    for(let dy=-this.radio;dy<=this.radio;dy++)for(let dx=-this.radio;dx<=this.radio;dx++)this.pedir(sx+dx,sy+dy);
    const E=this.mundo?._ED;
    if(!E||!E.cache||!Number.isFinite(E.R)||!E.nx)return (this.ultimo={sx,sy,antes:0,despues:0,evictas:0,sectores:this.cache.size});
    const ids=[...E.cache.keys()],antes=ids.length,max=this.maxRegiones;
    ids.sort((a,b)=>{
      const ra=Math.floor(a/E.nx),rb=Math.floor(b/E.nx),
        ax=(a%E.nx+.5)*E.R-x,ay=(ra+.5)*E.R-y,
        bx=(b%E.nx+.5)*E.R-x,by=(rb+.5)*E.R-y;
      return ax*ax+ay*ay-(bx*bx+by*by);
    });
    const distanciaMax=Math.pow((this.radio+1.4)*this.lado,2),conservar=new Set();
    for(const k of ids){
      const rx=k%E.nx,ry=Math.floor(k/E.nx),dx=(rx+.5)*E.R-x,dy=(ry+.5)*E.R-y;
      if(conservar.size<max&&dx*dx+dy*dy<=distanciaMax)conservar.add(k);
    }
    for(const k of ids)if(!conservar.has(k))E.cache.delete(k);
    return (this.ultimo={sx,sy,antes,despues:E.cache.size,evictas:antes-E.cache.size,sectores:this.cache.size});
  }
  limpiar(){this.cache.clear();}
}
MC.Sectores1km=Sectores1km;
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
  /* A* con varios inicios y varias metas (2.10): los dos extremos de la calle donde estoy y los dos de la calle de destino,
     cada uno con lo que cuesta llegar a él. Antes rutaA salía siempre por un extremo fijo y podía dar la vuelta a la manzana
     (62 m en línea recta se volvían 290 m). inicios y metas: [[nodo, costo]]. Devuelve { C, ini, fin } o null. */
  caminoEntre(inicios, metas, filtro) {
    const N = this.nodos, ex = new Map(), h = i => { let m = Infinity; for (const [j] of metas) m = Math.min(m, Math.hypot(N[i].x - N[j].x, N[i].y - N[j].y)); return m; };
    for (const [i, c] of metas) if (!ex.has(i) || c < ex.get(i)) ex.set(i, c);
    const g = new Float64Array(N.length).fill(Infinity), de = new Int32Array(N.length).fill(-1), cerr = new Uint8Array(N.length), ab = [];
    for (const [i, c] of inicios) if (c < g[i]) { g[i] = c; ab.push([c + h(i), i]); }
    let mejor = Infinity, fin = -1;
    while (ab.length) {
      let mi = 0; for (let k = 1; k < ab.length; k++) if (ab[k][0] < ab[mi][0]) mi = k; const [f, u] = ab.splice(mi, 1)[0];
      if (f >= mejor) break; if (cerr[u]) continue; cerr[u] = 1;
      if (ex.has(u) && g[u] + ex.get(u) < mejor) { mejor = g[u] + ex.get(u); fin = u; }
      for (const ei of N[u].ar) { const e = this.aristas[ei]; if (filtro && !filtro(e)) continue; const v = e.a === u ? e.b : e.a, ng = g[u] + e.largo; if (ng < g[v]) { g[v] = ng; de[v] = ei; ab.push([ng + h(v), v]); } }
      if (ab.length > 60000) break;
    }
    if (fin < 0) return null; const R = []; let v = fin;
    while (de[v] >= 0) { const e = this.aristas[de[v]], u = e.a === v ? e.b : e.a; R.push({ arista: e, adelante: e.a === u }); v = u; }
    return { C: R.reverse(), ini: v, fin, largo: mejor };
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

/* ---- js/12-generador.js ---- */
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
    /* 1b. LAGOS: llenado por prioridad (Barnes, 2014): el agua entra desde el borde y el mar, y lo que queda por debajo
       del punto de desborde de su cuenca se llena. Las cuencas grandes quedan como lagos (superficie plana); los
       hoyitos se rellenan. Con un épsilon de pendiente, todo tiene salida: los ríos atraviesan los lagos. */
    const llenar = eps => { const F = Float32Array.from(E), vis = new Uint8Array(eW * eH), hp = [], up = k => { let i = hp.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (F[hp[p]] <= F[hp[i]]) break; [hp[p], hp[i]] = [hp[i], hp[p]]; i = p; } }, down = () => { let i = 0; for (;;) { const l = 2 * i + 1, r2 = l + 1; let m = i; if (l < hp.length && F[hp[l]] < F[hp[m]]) m = l; if (r2 < hp.length && F[hp[r2]] < F[hp[m]]) m = r2; if (m === i) break; [hp[m], hp[i]] = [hp[i], hp[m]]; i = m; } };
      for (let j = 0; j < eH; j++) for (let i = 0; i < eW; i++) if (i === 0 || j === 0 || i === eW - 1 || j === eH - 1 || E[j * eW + i] <= 0) { const k = j * eW + i; vis[k] = 1; hp.push(k); up(); }
      while (hp.length) { const c = hp[0], last = hp.pop(); if (hp.length) { hp[0] = last; down(); } const ci = c % eW, cj = (c / eW) | 0;
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = ci + a, jj = cj + b; if (ii < 0 || jj < 0 || ii >= eW || jj >= eH) continue; const n = jj * eW + ii; if (vis[n]) continue; vis[n] = 1; F[n] = Math.max(E[n], F[c] + eps); hp.push(n); up(); } }
      return F; };
    const F0 = llenar(0), Fe = llenar(.02), lago = new Uint8Array(eW * eH), compL = new Int32Array(eW * eH).fill(-1); let nLagos = 0;
    const cuencas = []; for (let s = 0; s < eW * eH; s++) { if (compL[s] >= 0 || !(F0[s] - E[s] > .8 && E[s] > 0)) continue; const pila = [s], mie = [s]; compL[s] = s; let hondo = 0; while (pila.length) { const k = pila.pop(), i = k % eW, j = (k / eW) | 0; hondo = Math.max(hondo, F0[k] - E[k]); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= eW || jj >= eH) continue; const q = jj * eW + ii; if (compL[q] < 0 && F0[q] - E[q] > .8 && E[q] > 0) { compL[q] = s; pila.push(q); mie.push(q); } } } cuencas.push({ mie, hondo }); }
    /* solo las cuencas grandes y hondas son lagos (las de verdad, pocas); el resto se rellena */
    cuencas.filter(c => c.mie.length >= (op.lagoMin ?? 8) && c.hondo > 2.5).sort((a, b) => b.mie.length * b.hondo - a.mie.length * a.hondo).slice(0, op.lagos ?? (tipo === 'llanura' ? 5 : 3)).forEach(c => { for (const k of c.mie) lago[k] = 1; nLagos++; });
    for (let k = 0; k < eW * eH; k++) E[k] = lago[k] ? Fe[k] : Math.max(E[k], E[k] > 0 ? Fe[k] : E[k]);   // hoyos rellenos; los lagos, con su leve pendiente hacia el desagüe
    const lagoFrac = (x, y) => { const gx = clamp(x / (es * T), 0, eW - 1.001), gy = clamp(y / (es * T), 0, eH - 1.001), x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, k = y0 * eW + x0; return (lago[k] * (1 - fx) + lago[k + 1] * fx) * (1 - fy) + (lago[k + eW] * (1 - fx) + lago[k + eW + 1] * fx) * fy; };
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
      let t = TT.GRASS; if (h <= 0 || lagoFrac(x, y) > .5) t = TT.WATER; else if (h < 4 && tipo !== 'valle') t = TT.ARENA; else if (lagoFrac(x, y) > .2 && hum > .45) t = TT.ARENA; else if (temp < -1) t = TT.NIEVE; else if (pend > 1.1 || (temp < 4 && pend > .5)) t = TT.ROCA; else if (hum > .55 || (pend > .35 && hum > .4)) t = TT.MOUNT;
      suelo[ty * W + tx] = t;
    }
    /* charquitos sueltos (suavizado de la orilla, o lo que dejen calles y casas): menos de 0,6 ha de agua → pasto */
    const limpiarCharcos = () => { const vis = new Uint8Array(W * H); for (let s0 = 0; s0 < W * H; s0++) { if (vis[s0] || suelo[s0] !== TT.WATER) continue; const pila = [s0], mie = [s0]; vis[s0] = 1; while (pila.length) { const k = pila.pop(), i = k % W, j = (k / W) | 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= W || jj >= H) continue; const q = jj * W + ii; if (!vis[q] && suelo[q] === TT.WATER) { vis[q] = 1; pila.push(q); mie.push(q); } } } if (mie.length * T * T < 6000) for (const k of mie) suelo[k] = TT.GRASS; } }; limpiarCharcos();
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
    const valida = (x, y) => x > 0 && y > 0 && x < W * T && y < H * T && cotaE(x, y) > 2 && suelo[Math.floor(y / T) * W + Math.floor(x / T)] !== TT.CANAL && suelo[Math.floor(y / T) * W + Math.floor(x / T)] !== TT.WATER;   /* ni en quebradas ni en lagos */
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
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const vi = ui + di, vj = uj + dj; if (vi < 1 || vj < 1 || vi >= eW - 1 || vj >= eH - 1) continue; const v = vj * eW + vi, hv = E[v]; if (hv <= 0) continue; const L = Math.hypot(di, dj) * es * T, pend = Math.abs(hv - E[u]) / L, c = g[u] + L * (1 + pend * pend * 400 + (flujo[v] > 0 ? 8 : 0) + (lago[v] ? 60 : 0)); /* los lagos se rodean (o se cruzan por un puente) */ if (c < g[v]) { g[v] = c; de[v] = u; abiertos.push([c + Math.hypot(vi - ib, vj - jb) * es * T, v]); } }
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
    limpiarCharcos();
    /* el agua queda a su nivel: el mar en 0 m y cada lago plano en su nivel de desborde (se nada y se navega encima) */
    for (let k = 0; k < E.length; k++) E[k] = lago[k] ? F0[k] : Math.max(0, E[k]);
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
    M.generado = { pueblos, rios: rios.length, lagos: nLagos, edificios: edJ.length, vias: vias.length, puentes: pasos.length, cfg };
    return M;
  }
};
MC.Generador = Generador; MC.ZONAS_BASE = ZONAS_BASE;

/* ---- js/13-cosmos.js ---- */
/* =====================================================================
   COSMOS · universos enteros desde una sola semilla (la idea de No Man's Sky), con leyes reales
   - SEMILLAS EN JERARQUÍA: universo → galaxia → sistema → planeta → región → objeto. Cada nivel saca su semilla de
     la del padre y de su número (hash). Nada se guarda: todo se vuelve a calcular igual cuando se necesita, así que
     caben trillones de mundos en unos pocos kilobytes de código. Solo se guarda lo que el jugador cambia.
   - ESTRELLAS por la abundancia real (función de masa inicial: muchas enanas rojas, pocas estrellas como el Sol)
     y la relación masa–luminosidad (L ≈ M^3,5); zona habitable a √L unidades astronómicas.
   - PLANETAS: órbitas con la tercera ley de Kepler (T² = a³/M), gravedad g = G·M/R², velocidad de escape,
     temperatura de equilibrio T = 278,6 K · L^¼ · (1−albedo)^¼ / √a más el efecto invernadero, atmósfera retenida
     si la velocidad de escape supera ~6 veces la velocidad térmica de las moléculas.
   - DEL PLANETA AL MUNDO JUGABLE: el tipo de planeta da la forma del relieve, el clima, el agua, la nieve y la
     gravedad para MC.Generador, y las criaturas se diseñan y se prueban con la ley cuadrado‑cubo a esa gravedad.
   - RELIEVE CONTINUO E INFINITO: una función de altura por coordenadas (ruido fractal con crestas y deformación de
     dominio) que no tiene bordes: cualquier región se genera sola, en cualquier orden, y siempre empata.
   ===================================================================== */
const G_NEWTON = 6.674e-11, M_SOL = 1.989e30, M_TIERRA = 5.972e24, R_TIERRA = 6.371e6, UA = 1.496e11;
const TIPOS_ESTRELLA = [   // clase, fracción de las estrellas, masa (soles), color, temperatura (K)
  ['M', .765, [.08, .45], '#ffb46b', 3200], ['K', .121, [.45, .8], '#ffd2a1', 4500], ['G', .076, [.8, 1.04], '#fff4ea', 5800],
  ['F', .03, [1.04, 1.4], '#f8f7ff', 6750], ['A', .006, [1.4, 2.1], '#cad7ff', 8500], ['B', .0013, [2.1, 16], '#aabfff', 20000], ['O', .0001, [16, 60], '#9bb0ff', 35000]
];
const semillaDe = (...partes) => hashTxt(partes.join('/'));
const Cosmos = {
  semilla: semillaDe,
  /* estrella del sistema n de la galaxia g del universo u */
  estrella(u, g, n) {
    const r = mulberry32(semillaDe(u, 'g', g, 's', n)); let x = r(), T = TIPOS_ESTRELLA[0]; for (const t of TIPOS_ESTRELLA) { if (x < t[1]) { T = t; break; } x -= t[1]; }
    const masa = T[2][0] + (T[2][1] - T[2][0]) * r(), lum = Math.pow(masa, masa < .43 ? 2.3 : 3.5) * (masa < .43 ? .23 : 1), zh = [Math.sqrt(lum) * .95, Math.sqrt(lum) * 1.37];
    const nombre = Cosmos.nombre(r); return { u, g, n, clase: T[0], masa, luminosidad: lum, color: T[3], temperatura: T[4], zonaHabitable: zh, nombre, planetas: Math.floor(1 + r() * 8) };
  },
  /* planeta i de una estrella: órbita, tamaño, gravedad, temperatura, atmósfera y tipo */
  planeta(E, i) {
    const r = mulberry32(semillaDe(E.u, 'g', E.g, 's', E.n, 'p', i)), a = .25 * Math.pow(1.7, i) * (.85 + r() * .3);   // espaciado tipo Titius–Bode
    const rocoso = a < E.zonaHabitable[1] * 2.2 || r() < .25, masaT = rocoso ? Math.pow(10, -1.3 + r() * 1.8) : Math.pow(10, 1 + r() * 2.5), radioT = rocoso ? Math.pow(masaT, .27) : Math.min(11.2, Math.pow(masaT, .5) * .55 + 2);
    const M = masaT * M_TIERRA, R = radioT * R_TIERRA, g = G_NEWTON * M / (R * R), vEsc = Math.sqrt(2 * G_NEWTON * M / R), periodo = Math.sqrt(a * a * a / E.masa);
    const albedo = rocoso ? .25 + r() * .35 : .35 + r() * .2, Teq = 278.6 * Math.pow(E.luminosidad, .25) * Math.pow(1 - albedo, .25) / Math.sqrt(a) / Math.pow(.7, .25);
    /* atmósfera: se queda si la velocidad de escape supera ~6 veces la térmica del nitrógeno a esa temperatura */
    const vTerm = Math.sqrt(3 * 1.380649e-23 * Teq / (28 * 1.6605e-27)), atm = vEsc > 6 * vTerm ? (rocoso ? +(r() * 2.5).toFixed(2) : 100) : 0;
    const T = Teq + (atm > 0 ? 33 * Math.min(3, atm) : 0) - 273.15, agua = rocoso && T > -10 && T < 60 && atm > .3 && r() < .85;
    const tipo = !rocoso ? 'gaseoso' : atm === 0 ? 'rocoso_sin_aire' : T < -40 ? 'helado' : T > 70 ? 'desierto_ardiente' : !agua ? 'desierto' : r() < .3 ? 'oceano' : r() < .5 ? 'selva' : 'templado';
    return { i, nombre: E.nombre + ' ' + 'bcdefghij'[i], a, periodoAnos: periodo, masaTierras: masaT, radioTierras: radioT, g, vEscape: vEsc, albedo, atmosfera: atm, temperatura: T, agua, tipo, habitable: agua && g > 3 && g < 25, semilla: semillaDe(E.u, E.g, E.n, i) };
  },
  /* del planeta a los parámetros de MC.Generador (forma del relieve, clima) y a la gravedad de juego */
  mundoDe(P, op = {}) {
    const forma = { oceano: 'isla', selva: 'valle', templado: 'costa', desierto: 'llanura', desierto_ardiente: 'llanura', helado: 'montana', rocoso_sin_aire: 'montana', gaseoso: 'llanura' }[P.tipo] || 'valle';
    return Object.assign({ semilla: P.semilla, tipo: forma, gravedad: P.g, temperatura: P.temperatura, nieve: P.temperatura < 2, agua: P.agua ? 1 : 0, nombre: P.nombre, ancho: op.ancho || 4000, alto: op.alto || 4000 }, op);
  },
  /* una criatura que puede existir en ese planeta (prueba de verosimilitud de MC.Seres a su gravedad) */
  criaturaDe(P, i = 0) {
    const r = mulberry32(P.semilla + i * 7919), F = MC.Seres && MC.Seres.Animal && MC.Seres.Animal.criatura; if (!F) return null;
    for (let k = 0; k < 12; k++) { const masa = Math.pow(10, -1 + r() * 3.5) / Math.max(.3, P.g / 9.81), patas = [2, 4, 4, 6, 8][Math.floor(r() * 5)], c = F.call(MC.Seres.Animal, { masa, patas, alas: r() < (P.atmosfera > .5 ? .25 : 0), gravedad: P.g, semilla: P.semilla + i * 31 + k, nombre: Cosmos.nombre(r) }); if (c.verosimil) return c; }
    return null;
  },
  /* relieve infinito y continuo: altura en metros en (x, y) para la semilla del planeta (sin bordes ni cortes) */
  altura(semilla, x, y, op = {}) {
    const R = Cosmos._ruido(semilla), esc = op.escala || 2400, amp = op.amplitud || 900;
    const wx = x / esc + R(x / esc * .5 + 31.7, y / esc * .5 - 7.3) * .8, wy = y / esc + R(x / esc * .5 - 12.1, y / esc * .5 + 41.9) * .8;   // deformación de dominio
    let h = 0, a = .5, f = 1; for (let o = 0; o < 6; o++) { h += a * R(wx * f, wy * f); a *= .5; f *= 2.03; }
    const cresta = 1 - Math.abs(R(wx * .7 + 100, wy * .7 - 100)); return amp * (h * .7 + cresta * cresta * .6 - .25);
  },
  _ruidos: new Map(),
  _ruido(semilla) {
    if (this._ruidos.has(semilla)) return this._ruidos.get(semilla); const r = mulberry32(semilla), p = new Uint8Array(512), g = new Float32Array(512);
    for (let i = 0; i < 256; i++) { p[i] = i; g[i] = r() * TAU; } for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 256; i++) { p[i + 256] = p[i]; g[i + 256] = g[i]; }
    const f = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255, s = t => t * t * t * (t * (t * 6 - 15) + 10), d = (h, dx, dy) => Math.cos(g[h]) * dx + Math.sin(g[h]) * dy;
      const aa = p[p[X] + Y], ab = p[p[X] + Y + 1], ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1], u = s(xf), v = s(yf);
      return lerp(lerp(d(aa, xf, yf), d(ba, xf - 1, yf), u), lerp(d(ab, xf, yf - 1), d(bb, xf - 1, yf - 1), u), v) * 1.4; };
    this._ruidos.set(semilla, f); if (this._ruidos.size > 64) this._ruidos.delete(this._ruidos.keys().next().value); return f;
  },
  /* nombres sonoros y pronunciables en español */
  nombre(r) { const S = ['ka', 'lo', 'mi', 'ra', 'su', 'te', 'va', 'no', 'xi', 'ze', 'qui', 'ta', 'bel', 'dor', 'an', 'el', 'is', 'or', 'un', 'yu'], n = 2 + Math.floor(r() * 2); let s = ''; for (let i = 0; i < n; i++) s += S[Math.floor(r() * S.length)]; return s[0].toUpperCase() + s.slice(1); }
};
Object.assign(MC, { Cosmos });

/* ---- js/13-globo-gpu.js ---- */
/* C-M31 · Globo WebGL2 ligero de Motor City: usa la misma semilla y anillo de MC.Planeta.
   El mundo jugable permanece en su renderizador; esto acelera el planeta en una capa propia.
   Sin WebGL2 se mantiene el respaldo 2D de Planeta.globo. No usa redes ni bibliotecas. */
class GloboGPU {
  constructor(canvas,anillo){
    this.canvas=canvas;this.ok=false;this.error='';
    try{
      const gl=canvas?.getContext('webgl2',{alpha:false,antialias:true,depth:false,preserveDrawingBuffer:false});
      if(!gl)throw new Error('WebGL2 no disponible');
      const vs=String.raw`#version 300 es
      void main(){
        vec2 p=vec2(float((gl_VertexID << 1)&2),float(gl_VertexID&2));
        gl_Position=vec4(p*2.0-1.0,0.0,1.0);
      }`;
      const fs=String.raw`#version 300 es
      precision highp float;
      out vec4 color;
      uniform vec2 uSize;
      uniform float uLon;
      uniform float uInc;
      uniform float uTiempo;
      uniform float uStops[11];
      uniform vec3 uPal[11];
      uniform vec2 uJugador;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 a=floor(p),f=fract(p);
        f=f*f*(3.0-2.0*f);
        return mix(mix(hash(a),hash(a+vec2(1,0)),f.x),mix(hash(a+vec2(0,1)),hash(a+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float s=0.0,k=.52;for(int i=0;i<4;i++){s+=k*noise(p);p=p*2.03+vec2(5.3,1.7);k*=.5;}return s;}
      void main(){
        vec2 p=(gl_FragCoord.xy*2.0-uSize)/uSize.y;
        float r=length(p),R=.68;
        float st=hash(floor(gl_FragCoord.xy/2.0));
        vec3 fondo=vec3(.012,.016,.025)+vec3(.6,.69,.78)*step(.9978,st)*(.22+.7*hash(floor(gl_FragCoord.xy/7.0)));
        if(r>R){
          float a=exp(-pow((r-R)/.095,2.0))* .19;
          color=vec4(fondo+vec3(.16,.29,.49)*a,1.0);return;
        }
        vec2 d=p/R;
        float z=sqrt(max(0.0,1.0-dot(d,d)));
        float y=d.y*cos(uInc)+z*sin(uInc),zz=z*cos(uInc)-d.y*sin(uInc);
        float lat=asin(clamp(y,-1.0,1.0)),lon=atan(d.x,zz)+uLon;
        float deg=mod(degrees(lon)+3600.0,360.0),latD=degrees(lat);
        float ruta=14.0*sin(lon*2.0);
        float tierra=fbm(vec2(cos(lon)*2.5+4.0,sin(lon)*2.5+latD/45.0))+.23-abs(latD-ruta)/70.0;
        vec3 b=vec3(.12,.3,.21);
        for(int i=0;i<11;i++){if(deg<=uStops[i]){b=uPal[i];break;}}
        vec3 mar=vec3(.045,.105,.22);
        vec3 base=tierra>.48?b:mar;
        if(tierra>.74)base=mix(base,vec3(.48,.46,.41),.65);
        if(abs(latD)>68.0)base=vec3(.84,.87,.89);
        if(abs(latD-ruta)<1.2&&abs(latD)<67.0)base=mix(base,vec3(.75,.61,.34),.8);
        vec3 n=normalize(vec3(d.x,d.y,z));
        vec3 sol=normalize(vec3(cos(uTiempo*.035)*.7,-.25,.5+sin(uTiempo*.035)*.6));
        float luz=clamp(dot(n,sol)*.8+.21,.085,1.0);
        base*=luz;
        float borde=pow(1.0-z,3.2);
        base+=vec3(.14,.28,.51)*borde;
        /* Ciudades ubicadas en el planeta narrativo, no en una Tierra geodésica. */
        float ciudad=0.0;
        vec2 c0=vec2(0.0,22.0),c1=vec2(120.0,6.0),c2=vec2(220.0,4.0);
        for(int i=0;i<3;i++){
          vec2 c=i==0?c0:(i==1?c1:c2);
          float dl=abs(mod(deg-c.x+540.0,360.0)-180.0);
          ciudad=max(ciudad,1.0-smoothstep(.5,2.8,length(vec2(dl*cos(lat),latD-c.y))));
        }
        base+=vec3(.9,.63,.35)*ciudad*(.55+.45*(1.0-luz));
        float jLon=abs(mod(lon-uJugador.x+9.424778,6.283185)-3.141593);
        float dj=length(vec2(jLon*cos(lat),lat-uJugador.y));
        base=mix(base,vec3(.15,.86,.7),1.0-smoothstep(.008,.025,dj));
        color=vec4(clamp(base,0.0,1.0),1.0);
      }`;
      const shader=(type,source)=>{const q=gl.createShader(type);gl.shaderSource(q,source);gl.compileShader(q);if(!gl.getShaderParameter(q,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(q)||'Shader no compiló');return q;};
      const v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs),program=gl.createProgram();
      gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'Programa no enlazó');
      gl.deleteShader(v);gl.deleteShader(f);
      this.gl=gl;this.program=program;this.vao=gl.createVertexArray();
      this.u={size:gl.getUniformLocation(program,'uSize'),lon:gl.getUniformLocation(program,'uLon'),
        inc:gl.getUniformLocation(program,'uInc'),time:gl.getUniformLocation(program,'uTiempo'),
        stops:gl.getUniformLocation(program,'uStops[0]'),colors:gl.getUniformLocation(program,'uPal[0]'),
        player:gl.getUniformLocation(program,'uJugador')};
      const pal={costa:[.43,.58,.36],llanura:[.35,.48,.28],desierto:[.69,.53,.31],bosque:[.2,.42,.27],
        montana:[.42,.42,.4],nieve:[.82,.86,.89],lagos:[.34,.48,.35]};
      const stops=[],colors=[];
      const R=anillo||[];
      for(let i=0;i<R.length;i++){
        const q=R[i];if(q.tipo!=='tramo')continue;
        const ant=R[(i-1+R.length)%R.length],sig=R[(i+1)%R.length],inicio=ant.lon||0,fin=sig.lon<=inicio?sig.lon+360:sig.lon;
        for(let j=0;j<q.biomas.length;j++){stops.push(inicio+(fin-inicio)*(j+1)/q.biomas.length);colors.push(...(pal[q.biomas[j]]||pal.llanura));}
      }
      if(stops.length!==11)throw new Error('Planeta debe tener 11 segmentos de bioma');
      this.stops=new Float32Array(stops);this.colors=new Float32Array(colors);this.ok=true;
    }catch(e){this.error=String(e.message||e);this.ok=false;}
  }
  dibujar(W,H,op={}){
    if(!this.ok)return false;
    const gl=this.gl;
    try{
      if(this.canvas.width!==W||this.canvas.height!==H){this.canvas.width=W;this.canvas.height=H;}
      gl.viewport(0,0,W,H);gl.useProgram(this.program);gl.bindVertexArray(this.vao);
      gl.uniform2f(this.u.size,W,H);gl.uniform1f(this.u.lon,(op.lon0||0)*Math.PI/180);
      gl.uniform1f(this.u.inc,(op.inc||0)*Math.PI/180);gl.uniform1f(this.u.time,op.t||0);
      gl.uniform1fv(this.u.stops,this.stops);gl.uniform3fv(this.u.colors,this.colors);
      gl.uniform2f(this.u.player,(op.jugador?.lon||0)*Math.PI/180,(op.jugador?.lat||0)*Math.PI/180);
      gl.drawArrays(gl.TRIANGLES,0,3);
      const err=gl.getError();if(err!==gl.NO_ERROR)throw new Error('WebGL '+err);
      return true;
    }catch(e){this.error=String(e.message||e);this.ok=false;return false;}
  }
}
MC.GloboGPU=GloboGPU;
/* ---- js/13-planeta.js ---- */
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
/* G-H22: 56 paradas de ficción (Antigravity y ChatGPT, unidas); la fuente es contenido/paradas-carretera.json */
const PARADAS_RUTA = {"costa":[{"nombre":"Estación Salitre 99","nombre_en":"Saltwind Gas 99","tipo":"fuel","ambiente":"Tres surtidores oxidados por la brisa marina y un foco amarillo zumbando sobre las conchas trituradas."},{"nombre":"Motel Marea Baja","nombre_en":"Low Tide Motor Inn","tipo":"motel","ambiente":"Puertas celestes despintadas mirando al rompeolas; el neón parpadea con el ritmo del oleaje."},{"nombre":"Paradero El Babor","nombre_en":"Portside Diner & Trucks","tipo":"restaurant","ambiente":"Olor a aceite caliente, café recalentado y tractomulas parqueadas con las luces de emergencia encendidas."},{"nombre":"Mirador del Espigón Viejo","nombre_en":"Old Breakwater Overlook","tipo":"mirador","ambiente":"Un muro bajo de concreto manchado de salitre desde donde se ve el horizonte curvo del mar."},{"nombre":"Bomba Brisa de Sal","nombre_en":"Saltwind Fuel","tipo":"fuel","ambiente":"Lámparas cálidas bajo una brisa de mar."},{"nombre":"Taller La Boya","nombre_en":"The Buoy Garage","tipo":"car_repair","ambiente":"Motores y redes húmedas junto al mar."},{"nombre":"Paradero Faro Viejo","nombre_en":"Old Beacon Diner","tipo":"restaurant","ambiente":"Café junto a los cristales empañados."},{"nombre":"Mirador del Salitre","nombre_en":"Salt Air Lookout","tipo":"mirador","ambiente":"La línea del mar desaparece en la bruma."}],"llanura":[{"nombre":"Taller Recta Larga","nombre_en":"Long Mile Auto & Tire","tipo":"car_repair","ambiente":"Una grúa vieja junto a pilas de llantas gastadas y el eco metálico de una llave de impacto."},{"nombre":"Estadéro Kilómetro Cero","nombre_en":"Milepost Zero Tavern","tipo":"bar","ambiente":"Música de radio AM saliendo por una persiana entreabierta mientras el viento barre el polvo del parqueadero."},{"nombre":"Bomba El Molino Seco","nombre_en":"Dry Mill Fuel Stop","tipo":"fuel","ambiente":"Un techo de zinc que traquea con cada ráfaga y un letrero de precios al que le faltan dos números."},{"nombre":"Caseta Vieja del Llano","nombre_en":"Plains Old Tollbooth","tipo":"toll","ambiente":"Talanqueras levantadas hace años, vidrios rotos y marcas frescas de frenada sobre los carriles vacíos."},{"nombre":"Bomba Horizonte Bajo","nombre_en":"Low Horizon Fuel","tipo":"fuel","ambiente":"Camiones diminutos en la recta interminable."},{"nombre":"Taller Tres Vientos","nombre_en":"Three Winds Garage","tipo":"car_repair","ambiente":"Herramientas en un galpón abierto."},{"nombre":"Paradero La Lumbre","nombre_en":"Lamplight Diner","tipo":"restaurant","ambiente":"Comida caliente bajo una luz amarilla."},{"nombre":"Motel Kilómetro Azul","nombre_en":"Blue Mile Motel","tipo":"motel","ambiente":"Un letrero cansado vibra con el viento."}],"desierto":[{"nombre":"Motel La Calima","nombre_en":"Heat Haze Motel","tipo":"motel","ambiente":"Paredes de adobe agrietado, ventiladores girando lento y ni una sola sombra en tres kilómetros a la redonda."},{"nombre":"Surtidor El Espejismo","nombre_en":"Mirage Diesel & Ice","tipo":"fuel","ambiente":"Un tanque metálico blanco brillando al sol, arena acumulada contra el andén y una nevera de hielo zumbando."},{"nombre":"Montallantas y Radiadores Arena Roja","nombre_en":"Red Sand Radiator & Tire","tipo":"car_repair","ambiente":"Bidones de refrigerante alineados bajo una polisombra y perros dormidos debajo de un chasis sin motor."},{"nombre":"Paradero Paso del Polvo","nombre_en":"Dust Pass Pullout","tipo":"mirador","ambiente":"Un ensanche de gravilla roja donde el motor caliente cruje al enfriarse frente a las dunas."},{"nombre":"Bomba Polvo Rojo","nombre_en":"Red Dust Fuel","tipo":"fuel","ambiente":"La arena golpea las ventanillas."},{"nombre":"Taller La Calima","nombre_en":"Heat Haze Garage","tipo":"car_repair","ambiente":"Metal caliente y una sombra mínima."},{"nombre":"Paradero Las Agujas","nombre_en":"Needles Diner","tipo":"restaurant","ambiente":"Un ventilador antiguo mueve el aire seco."},{"nombre":"Mirador del Mediodía","nombre_en":"High Noon Lookout","tipo":"mirador","ambiente":"La carretera tiembla entre las dunas."}],"bosque":[{"nombre":"Paradero Los Helechos","nombre_en":"Fern Bend Truck Stop","tipo":"restaurant","ambiente":"Humo de leña mezclándose con la humedad de los árboles altos y mesas de madera mojadas por el sereno."},{"nombre":"Taller del Aserradero","nombre_en":"Sawmill Garage","tipo":"car_repair","ambiente":"Olor a resina de pino y grasa de motor bajo un cobertizo de teja verde cubierto de musgo."},{"nombre":"Cabañas La Hojarasca","nombre_en":"Timberline Cabins","tipo":"motel","ambiente":"Luces cálidas filtrándose entre troncos oscuros y el canto constante de grillos a lado y lado del asfalto."},{"nombre":"Gruta del Cedro Alto","nombre_en":"Tall Cedar Wayside","tipo":"church","ambiente":"Un pequeño nicho de piedra junto a la berma con veladoras encendidas y flores frescas de la vereda."},{"nombre":"Bomba Los Helechos","nombre_en":"Fernwood Fuel","tipo":"fuel","ambiente":"Musgo sobre la marquesina."},{"nombre":"Taller Raíz Vieja","nombre_en":"Old Root Workshop","tipo":"car_repair","ambiente":"Ramas mojadas y faros entre los pinos."},{"nombre":"Paradero Sombra Larga","nombre_en":"Long Shade Diner","tipo":"restaurant","ambiente":"La conversación baja cuando cruje el bosque."},{"nombre":"Mirador Copa Alta","nombre_en":"High Canopy Lookout","tipo":"mirador","ambiente":"Una vía estrecha entre las copas."}],"montana":[{"nombre":"Mirador Alto del Viento","nombre_en":"High Wind Overlook","tipo":"mirador","ambiente":"Barandas metálicas golpeadas por la neblina; abajo se ven las luces de los carros serpenteando por la ladera."},{"nombre":"Fonda La Curva Brava","nombre_en":"Switchback Coffee House","tipo":"restaurant","ambiente":"Tinto humeante, arepas al carbón y camioneros revisando los frenos antes de bajar la pendiente."},{"nombre":"Frenos y Engrase La Cumbre","nombre_en":"Summit Brakes & Service","tipo":"car_repair","ambiente":"Una rampa de concreto sobre la berma con olor a balatas calientes y herramientas colgadas en madera."},{"nombre":"Retén Viejo de la Cordillera","nombre_en":"Ridge Old Checkpoint","tipo":"toll","ambiente":"Dos casetas grises desgastadas por la lluvia de altura y reflectores solitarios apuntando al túnel de niebla."},{"nombre":"Bomba Alto de Piedra","nombre_en":"Stonecrest Fuel","tipo":"fuel","ambiente":"Viento frío detrás de la estación."},{"nombre":"Taller Curva Cerrada","nombre_en":"Hairpin Garage","tipo":"car_repair","ambiente":"Frenos calientes y grava en la cuneta."},{"nombre":"Paradero La Cornisa","nombre_en":"Ledge Diner","tipo":"restaurant","ambiente":"La ventana da directamente al barranco."},{"nombre":"Mirador del Cóndor","nombre_en":"Condor Ridge Lookout","tipo":"mirador","ambiente":"Las nubes quedan debajo del camino."}],"nieve":[{"nombre":"Estación Escarcha Blanca","nombre_en":"White Frost Fuel","tipo":"fuel","ambiente":"Carámbanos colgando del techo iluminado con tubos blancos y surcos oscuros de llantas en la nieve apisonada."},{"nombre":"Posada La Ventisca","nombre_en":"Blizzard Pass Lodge","tipo":"motel","ambiente":"Chimenea humeando sin pausa y vidrios empañados que dejan ver siluetas calentándose las manos."},{"nombre":"Refugio Paso Helado","nombre_en":"Frozen Pass Outpost","tipo":"bar","ambiente":"Un quitanieves apagado en la entrada y el silencio sordo de la nieve cayendo bajo los postes de luz."},{"nombre":"Mirador de la Cresta Blanca","nombre_en":"White Crest Turnout","tipo":"mirador","ambiente":"Postes naranjas marcando el borde del abismo blanco y el silbido helado del viento entre las rocas."},{"nombre":"Bomba Último Refugio","nombre_en":"Last Shelter Fuel","tipo":"fuel","ambiente":"Hielo alrededor de los surtidores."},{"nombre":"Taller Cadena Norte","nombre_en":"North Chain Garage","tipo":"car_repair","ambiente":"Neumáticos de invierno junto a la estufa."},{"nombre":"Paradero Escarcha","nombre_en":"Frostline Diner","tipo":"restaurant","ambiente":"Cristales blancos ocultan la carretera."},{"nombre":"Motel Ventisca","nombre_en":"Snowdrift Motel","tipo":"motel","ambiente":"Una sola puerta iluminada en la nevada."}],"lagos":[{"nombre":"Paradero Brisa del Lago","nombre_en":"Lakeside Breeze Diner","tipo":"restaurant","ambiente":"Un deck sencillo de madera sobre la orilla con botes amarrados golpeando suavemente las llantas de protección."},{"nombre":"Estación Náutica y Vial El Espejo","nombre_en":"Mirror Lake Gas & Dock","tipo":"fuel","ambiente":"Surtidores para carros hacia la carretera y un muelle pequeño con pimpinas de gasolina hacia el agua quieta."},{"nombre":"Hostal Bahía Mansa","nombre_en":"Still Bay Motel","tipo":"motel","ambiente":"Balcones sencillos reflejándose en el agua oscura al atardecer y olor a tierra húmeda."},{"nombre":"Mirador del Islote","nombre_en":"Islet Viewpoint","tipo":"mirador","ambiente":"Una curva abierta con gravilla desde donde se dominan las islas verdes y la neblina pegada al agua."},{"nombre":"Bomba Agua Clara","nombre_en":"Clearwater Fuel","tipo":"fuel","ambiente":"Reflejos verdes bajo los surtidores."},{"nombre":"Taller El Pescador","nombre_en":"Fisher's Workshop","tipo":"car_repair","ambiente":"Motores de lancha junto a los carros."},{"nombre":"Paradero Orilla Norte","nombre_en":"North Shore Diner","tipo":"restaurant","ambiente":"Café con vista al muelle de tablas."},{"nombre":"Mirador Los Espejos","nombre_en":"Mirror Lake Lookout","tipo":"mirador","ambiente":"Las montañas duplicadas en el agua."}]};
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
    const c = centro(y), lado = r.f() < .5 ? -1 : 1, px = c + lado * 46, biomaP = biomas[bioma(y)], lista = PARADAS_RUTA[biomaP], ficha = lista[(n + sem) % lista.length], nomP = ficha.nombre, tipo = ficha.tipo, km = Math.round(y / 1000);
    if (BIOMAS_RUTA[biomas[bioma(y)]].mar && lado > 0) continue;
    const kind = tipo === 'fuel' || tipo === 'car_repair' ? 3 : tipo === 'church' ? 6 : tipo === 'motel' ? 1 : 8, pisos = tipo === 'motel' ? 2 : 1;
    edJ.push([Math.round(px * 10) / 10, Math.round(y * 10) / 10, tipo === 'motel' ? 14 : 9, 7, Math.PI / 2, pisos, kind, nomP]); pon(px, y, TT.BLDG, 8);
    for (let a = -18; a <= 18; a += 6) pon(c + lado * 24, y + a, TT.AUTO, 4);
    lugares.push({ id: 'parada-' + n, nombre: nomP + (tipo === 'mirador' ? ' ' + km : ''), municipio: '', x: px, y, ancho: 30, alto: 24, dibujo: tipo, dato: 'Kilómetro ' + km + ' de ' + nombre + '. ' + ficha.ambiente + (nombre === 'Ruta del Atlántico' ? ' / ' + ficha.nombre_en : ''), secreto: false });
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
    for (const C of ciudades) { const p = proy(C.lat ?? ruta(C.lon * Math.PI / 180), C.lon); if (!p.ve) continue; g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(p.x, p.y, Math.max(3, R * .02), 0, TAU); g.fill(); g.fillStyle = '#fff'; g.shadowColor = '#000'; g.shadowBlur = 4; const tw = g.measureText(C.nombre).width; g.fillText(C.nombre, clamp(p.x + 8, 8, Math.max(8, W - tw - 8)), clamp(p.y + 4, 14, H - 14)); g.shadowBlur = 0; }
    if (op.yo) { const G = this.enGlobo(op.yo.id, op.yo.x, op.yo.y), p = proy(G.lat, G.lon); if (p.ve) { g.fillStyle = '#2ee6a6'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, Math.max(4, R * .028), 0, TAU); g.fill(); g.stroke(); } }
  }
}
Planeta.ANILLO = ANILLO_PLANETA; Planeta.BIOMAS = BIOMAS_RUTA;
MC.Planeta = Planeta;

/* ---- js/14-ondas.js ---- */
/* =====================================================================
   ONDAS · generación por reglas locales (las herramientas de Townscaper y de tantos juegos procedurales)
   - WFC («Wave Function Collapse», Maxim Gumin): cada celda empieza con todas las fichas posibles; se fija la de
     menor entropía (la que tiene menos opciones), se propagan las reglas de vecindad y se repite. Si hay
     contradicción, se vuelve a intentar con otra semilla. Sirve para fachadas, barrios, mobiliario, mazmorras…
   - AUTOTILE: la ficha correcta según los vecinos (máscara de 4 o de 8), y las 16 esquinas de la «rejilla dual»
     (cada celda mira sus 4 esquinas: es como Townscaper arma las casas sobre los vértices, no sobre las celdas).
   - REJILLA IRREGULAR (la de Townscaper, según las charlas de Oskar Stålberg): hexágono de triángulos → se juntan
     pares al azar en cuadriláteros → todo se subdivide en cuadriláteros → se relaja para que queden casi cuadrados.
     Pueblos orgánicos, plazas y calles que no parecen hechas con regla.
   ===================================================================== */
const Ondas = {
  /* fichas: { id: { peso, lados: [arriba, derecha, abajo, izquierda] } } (dos fichas encajan si sus lados enfrentados
     son iguales) · o reglas explícitas: compat(a, b, dir). fijos: { 'x,y': id } · devuelve { ok, celdas: [[id]] } */
  resolver({ ancho, alto, fichas, compat, fijos = {}, semilla = 1, intentos = 8, permitida }) {
    const ids = Object.keys(fichas), n = ids.length, D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const ok = compat || ((a, b, d) => fichas[ids[a]].lados[d] === fichas[ids[b]].lados[(d + 2) % 4]);
    const tabla = []; for (let d = 0; d < 4; d++) { tabla[d] = []; for (let a = 0; a < n; a++) { tabla[d][a] = []; for (let b = 0; b < n; b++) if (ok(a, b, d)) tabla[d][a].push(b); } }
    for (let intento = 0; intento < intentos; intento++) {
      const r = mulberry32(semilla + intento * 7919), W = ancho * alto, P = Array.from({ length: W }, () => new Uint8Array(n).fill(1)), cuenta = new Int32Array(W).fill(n);
      if (permitida) for (let i = 0; i < W; i++) for (let a = 0; a < n; a++) if (!permitida(ids[a], i % ancho, Math.floor(i / ancho))) { P[i][a] = 0; cuenta[i]--; }
      const pila = [], quitar = (i, a) => { if (!P[i][a]) return true; P[i][a] = 0; cuenta[i]--; pila.push(i); return cuenta[i] > 0; };
      let roto = false; for (const [k, id] of Object.entries(fijos)) { const [x, y] = k.split(',').map(Number), i = y * ancho + x, a = ids.indexOf(id); for (let b = 0; b < n; b++) if (b !== a && !quitar(i, b)) roto = true; }
      const propagar = () => { while (pila.length) { const i = pila.pop(), x = i % ancho, y = (i / ancho) | 0; for (let d = 0; d < 4; d++) { const xx = x + D[d][0], yy = y + D[d][1]; if (xx < 0 || yy < 0 || xx >= ancho || yy >= alto) continue; const j = yy * ancho + xx; for (let b = 0; b < n; b++) { if (!P[j][b]) continue; let apoyo = false; for (let a = 0; a < n && !apoyo; a++) if (P[i][a] && tabla[d][a].includes(b)) apoyo = true; if (!apoyo && !quitar(j, b)) return false; } } } return true; };
      if (roto || !propagar()) continue;
      for (;;) {
        let mejor = -1, me = 1e9; for (let i = 0; i < W; i++) if (cuenta[i] > 1) { const e = cuenta[i] + r() * .5; if (e < me) { me = e; mejor = i; } }
        if (mejor < 0) break; let tot = 0; for (let a = 0; a < n; a++) if (P[mejor][a]) tot += fichas[ids[a]].peso || 1; let x = r() * tot, elegida = 0; for (let a = 0; a < n; a++) if (P[mejor][a]) { x -= fichas[ids[a]].peso || 1; if (x <= 0) { elegida = a; break; } }
        for (let b = 0; b < n; b++) if (b !== elegida) quitar(mejor, b); if (!propagar()) { roto = true; break; }
      }
      if (roto || cuenta.some(c => c !== 1)) continue;
      const celdas = []; for (let y = 0; y < alto; y++) { const f = []; for (let x = 0; x < ancho; x++) f.push(ids[P[y * ancho + x].indexOf(1)]); celdas.push(f); }
      return { ok: true, celdas, intento };
    }
    return { ok: false, celdas: null };
  },
  /* una fachada de «pisos × columnas»: locales y puerta abajo, balcones que se alinean, muros ciegos y ventanas */
  fachada(pisos, columnas, semilla = 1, estilo = 'paisa') {
    const F = { ventana: { peso: 5, lados: ['m', 'v', 'm', 'v'] }, balcon: { peso: estilo === 'moderno' ? 1 : 3, lados: ['b', 'v', 'b', 'v'] }, muro: { peso: 2, lados: ['m', 'v', 'm', 'v'] }, local: { peso: 4, lados: ['m', 'l', 'p', 'l'] }, puerta: { peso: 2, lados: ['m', 'l', 'p', 'l'] }, vitrina: { peso: 2, lados: ['m', 'l', 'p', 'l'] } };
    const K = Object.keys(F), piso = x => ['local', 'puerta', 'vitrina'].includes(x);
    /* al lado: el primer piso con el primer piso, sin dos puertas juntas; arriba de un balcón sigue un balcón o una ventana */
    const compat = (a, b, d) => { const A = K[a], B = K[b]; if (d === 1 || d === 3) return piso(A) === piso(B) && !(A === 'puerta' && B === 'puerta'); if (d === 0) return !(A === 'balcon' && B === 'muro'); return !(B === 'balcon' && A === 'muro'); };
    const R = Ondas.resolver({ ancho: columnas, alto: pisos, fichas: F, compat, semilla, permitida: (id, x, y) => (y === pisos - 1) === ['local', 'puerta', 'vitrina'].includes(id) && !(id === 'balcon' && y === pisos - 1) });
    if (!R.ok) return Array.from({ length: pisos }, (_, y) => Array.from({ length: columnas }, () => y === pisos - 1 ? 'local' : 'ventana'));
    return R.celdas;
  }
};
const Autotile = {
  /* máscara de 4 vecinos (arriba=1, derecha=2, abajo=4, izquierda=8): 16 casos */
  mascara4(es, x, y) { return (es(x, y - 1) ? 1 : 0) | (es(x + 1, y) ? 2 : 0) | (es(x, y + 1) ? 4 : 0) | (es(x - 1, y) ? 8 : 0); },
  /* máscara de 8 vecinos reducida a los 47 casos «blob» (las esquinas solo cuentan si sus dos lados están) */
  mascara8(es, x, y) { const n = es(x, y - 1), e = es(x + 1, y), s = es(x, y + 1), o = es(x - 1, y); let m = (n ? 1 : 0) | (e ? 4 : 0) | (s ? 16 : 0) | (o ? 64 : 0); if (n && e && es(x + 1, y - 1)) m |= 2; if (e && s && es(x + 1, y + 1)) m |= 8; if (s && o && es(x - 1, y + 1)) m |= 32; if (o && n && es(x - 1, y - 1)) m |= 128; return m; },
  /* rejilla dual: las 4 esquinas de una celda (sobre los vértices) → caso 0–15 y su forma canónica con giro */
  esquinas(a, b, c, d) { const k = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0) | (d ? 8 : 0); let mejor = k, giro = 0, q = k; for (let g = 1; g < 4; g++) { q = ((q << 1) | (q >> 3)) & 15; if (q < mejor) { mejor = q; giro = g; } } return { caso: k, canonico: mejor, giro }; }
};
const RejillaIrregular = {
  /* { puntos: [[x, y]], quads: [[i, j, k, l]] } con lado aproximado «lado» (m) y «anillos» de hexágono */
  crear({ anillos = 4, lado = 6, semilla = 1, relajar = 30 } = {}) {
    const r = mulberry32(semilla), P = [], idx = new Map(), clave = (q, s) => q + ',' + s, pt = (q, s) => { const k = clave(q, s); if (!idx.has(k)) { idx.set(k, P.length); P.push([lado * (q + s / 2), lado * s * Math.sqrt(3) / 2]); } return idx.get(k); };
    const T = []; for (let q = -anillos; q <= anillos; q++) for (let s = -anillos; s <= anillos; s++) { const d = (a, b) => Math.max(Math.abs(a), Math.abs(b), Math.abs(-a - b)); if (d(q, s) < anillos && d(q + 1, s) <= anillos && d(q, s + 1) <= anillos) T.push([pt(q, s), pt(q + 1, s), pt(q, s + 1)]); if (d(q + 1, s) <= anillos && d(q + 1, s + 1) <= anillos && d(q, s + 1) <= anillos && d(q, s) < anillos) T.push([pt(q + 1, s), pt(q + 1, s + 1), pt(q, s + 1)]); }
    /* juntar pares de triángulos vecinos en cuadriláteros (al azar) */
    const usado = new Uint8Array(T.length), Q = [], arista = (a, b) => a < b ? a + '_' + b : b + '_' + a, porArista = new Map(); T.forEach((t, i) => { for (let k = 0; k < 3; k++) { const e = arista(t[k], t[(k + 1) % 3]); (porArista.get(e) || porArista.set(e, []).get(e)).push(i); } });
    const orden = T.map((_, i) => i).sort(() => r() - .5); const sueltos = [];
    for (const i of orden) { if (usado[i]) continue; const t = T[i], vec = []; for (let k = 0; k < 3; k++) for (const j of porArista.get(arista(t[k], t[(k + 1) % 3]))) if (j !== i && !usado[j]) vec.push([j, k]); if (!vec.length) { sueltos.push(t); usado[i] = 1; continue; } const [j, k] = vec[Math.floor(r() * vec.length)], u = T[j], op = u.find(v => v !== t[k] && v !== t[(k + 1) % 3]); usado[i] = usado[j] = 1; Q.push([t[k], op, t[(k + 1) % 3], t[(k + 2) % 3]]); }
    /* subdividir: cada cuadrilátero en 4 y cada triángulo suelto en 3 (todo queda en cuadriláteros) */
    const medios = new Map(), medio = (a, b) => { const k = arista(a, b); if (!medios.has(k)) { medios.set(k, P.length); P.push([(P[a][0] + P[b][0]) / 2, (P[a][1] + P[b][1]) / 2]); } return medios.get(k); }, centro = L => { P.push([L.reduce((s, i) => s + P[i][0], 0) / L.length, L.reduce((s, i) => s + P[i][1], 0) / L.length]); return P.length - 1; };
    const F = []; for (const q of Q) { const c = centro(q), m = [0, 1, 2, 3].map(k => medio(q[k], q[(k + 1) % 4])); for (let k = 0; k < 4; k++) F.push([q[k], m[k], c, m[(k + 3) % 4]]); }
    for (const t of sueltos) { const c = centro(t), m = [0, 1, 2].map(k => medio(t[k], t[(k + 1) % 3])); for (let k = 0; k < 3; k++) F.push([t[k], m[k], c, m[(k + 2) % 3]]); }
    /* relajar: cada vértice interior se acerca al promedio de sus vecinos (los del borde quedan fijos) */
    const borde = new Set(), cuentaA = new Map(); for (const f of F) for (let k = 0; k < 4; k++) { const e = arista(f[k], f[(k + 1) % 4]); cuentaA.set(e, (cuentaA.get(e) || 0) + 1); } for (const [e, c] of cuentaA) if (c === 1) for (const v of e.split('_')) borde.add(+v);
    const vec = P.map(() => new Set()); for (const f of F) for (let k = 0; k < 4; k++) { vec[f[k]].add(f[(k + 1) % 4]); vec[f[(k + 1) % 4]].add(f[k]); }
    for (let it = 0; it < relajar; it++) for (let i = 0; i < P.length; i++) { if (borde.has(i) || !vec[i].size) continue; let sx = 0, sy = 0; for (const j of vec[i]) { sx += P[j][0]; sy += P[j][1]; } P[i][0] = lerp(P[i][0], sx / vec[i].size, .5); P[i][1] = lerp(P[i][1], sy / vec[i].size, .5); }
    return { puntos: P, quads: F };
  }
};
/* fachadas en caché con presupuesto por cuadro (las vistas piden muchas; se arman unas pocas por cuadro) */
const _FZ = new Map(); Ondas.presupuesto = 30;
Ondas.fachadaCache = (clave, pisos, columnas) => { const k = clave + ':' + pisos + 'x' + columnas; let F = _FZ.get(k); if (F) return F; if (Ondas.presupuesto <= 0) return null; Ondas.presupuesto--; F = Ondas.fachada(pisos, columnas, clave >>> 0); _FZ.set(k, F); if (_FZ.size > 5000) _FZ.delete(_FZ.keys().next().value); return F; };
Object.assign(MC, { Ondas, Autotile, RejillaIrregular });

/* ---- js/15-terreno.js ---- */
/* =====================================================================
   TERRENO Y LÍMITES · por dónde se puede ir de verdad (que nada se atraviese sin sentido)
   AGUA: el agua del mapa se analiza una vez: cuerpos de agua (componentes), su TIPO (mar, lago o embalse, río y
   quebrada, según su tamaño, su forma, su altura y si toca el borde) y la DISTANCIA A LA ORILLA. La profundidad
   crece con esa distancia según el tipo (playas suaves en el mar, orillas más hondas en los lagos, ríos de 1–4 m,
   quebradas de rodilla). Así se puede vadear la orilla, nadar en lo hondo y la lancha no encalla.
   MATERIAL: pasto, monte (bosque), roca, arena (playa), nieve, barro, asfalto, andén, escalas, agua… con la PENDIENTE
   real del relieve (los barrancos y acantilados salen de ella).
   REGLAS DE PASO por clase de vehículo (a pie, bici, moto, carro, camión, lancha, aire), con su motivo:
   - pendiente máxima fuera de la vía (a pie ~45°, bici ~19°, carro ~24°, camión ~17°); bajar un barranco tampoco;
   - agua: a pie se vadea hasta la cintura y luego se nada; la bici cruza charcos y quebradas de hasta 25 cm; el carro,
     hasta 40 cm; la lancha necesita al menos 60 cm;
   - roca, monte, arena y nieve: quién entra y qué tan rápido (el todoterreno y la bici de montaña sí entran al monte);
   - OBSTÁCULOS: edificios (también las partes de los emblemáticos y lo que crece con MC.Urbe), árboles (los mismos
     que pintan las losas), postes, bancas, paraderos, hidrantes, rocas, y lo que el juego diga (tráfico, gente);
   - el borde del mundo.
   Sobre una vía (calle, andén, ciclorruta, escalas, puente) la pendiente no bloquea: las calles reales existen ahí.
   ===================================================================== */
const MATERIAL_TT = ['pasto', 'monte', 'ladrillo', 'edificio', 'asfalto', 'asfalto', 'anden', 'ciclorruta', 'agua', 'agua', 'plaza', 'puente', 'estacion', 'tierra', 'asfalto', 'patio', 'escalas', 'arena', 'nieve', 'roca'];
const VIA_TT = new Set([4, 5, 6, 7, 10, 11, 12, 14, 15, 16]);   // calle, avenida, andén, ciclorruta, plaza, puente, estación, autopista, patio, escalas
const PEND_MAX = { pie: 1.0, rueda: .35, moto: .5, auto: .45, pesado: .3, agua: 99, aire: 99, riel: .08, cable: 99 };
const AGUA_MAX = { pie: 99, rueda: .25, moto: .3, auto: .4, pesado: .7, agua: 0, aire: 99 };   // profundidad que se cruza (m)
const OBST_R = { poste: .22, arbol: .4, banca: .55, caneca: .3, paradero: .95, hidrante: .2, roca: 0, palma: .3, frailejon: .25, arbusto: .5 };
const Terreno = {
  MATERIAL_TT, PEND_MAX, AGUA_MAX,
  /* ---------- agua: tipo y profundidad ---------- */
  agua(M) {
    if (M._agua) return M._agua;
    if (M.tiene?.('agua') && M.capaInfo('agua').formato === 'AGUA1') {
      const {w,h,paso,cuerpos:C} = M.capaInfo('agua'), datos = M.capa('agua');
      const dv = new DataView(datos.buffer,datos.byteOffset,datos.byteLength), n = w*h;
      const tipo = new Uint8Array(n), comp = new Int32Array(n).fill(-1), D = new Float32Array(n);
      for (let o=0; o<datos.length; o+=13) {
        const i=dv.getUint32(o,true); tipo[i]=datos[o+12]; comp[i]=dv.getInt32(o+4,true); D[i]=dv.getFloat32(o+8,true);
      }
      return M._agua={w,h,paso,C,tipo,comp,D};
    }
    const T = M.tile, paso = Math.max(T, 10, Math.ceil(Math.sqrt(M.ancho * M.alto / 1.2e6) / T) * T), w = Math.ceil(M.ancho / paso), h = Math.ceil(M.alto / paso), n = w * h;
    const tipo = new Uint8Array(n), tierra = new Uint8Array(n), rio = new Uint8Array(n);   // 0 tierra · 1 agua · 2 quebrada
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const t = M.suelo((i + .5) * paso, (j + .5) * paso), k = j * w + i; tipo[k] = t === TT.WATER ? 1 : t === TT.CANAL ? 2 : 0; }
    /* el río con nombre del mapa (si lo trae): se marca para que no se corte en la rejilla gruesa y se reconozca como río */
    let info = null; try { info = M.tiene && M.tiene('info') ? M.capa('info') : null; } catch (e) { info = null; }
    const R = info && Array.isArray(info.rio) ? info.rio : []; for (let q = 0; q + 3 < R.length; q += 2) { const L = Math.hypot(R[q + 2] - R[q], R[q + 3] - R[q + 1]); if (L > 400) continue; const m = Math.max(1, Math.ceil(L / (paso / 2))); for (let t = 0; t <= m; t++) { const i = Math.floor((R[q] + (R[q + 2] - R[q]) * t / m) / paso), j = Math.floor((R[q + 1] + (R[q + 3] - R[q + 1]) * t / m) / paso); if (i >= 0 && j >= 0 && i < w && j < h) { const k = j * w + i; rio[k] = 1; if (!tipo[k]) tipo[k] = 1; } } }
    for (let k = 0; k < n; k++) tierra[k] = tipo[k] ? 0 : 1;
    const D = distanciaRejilla(tierra, w, h), comp = new Int32Array(n).fill(-1), C = [];
    for (let s = 0; s < n; s++) { if (!tipo[s] || comp[s] >= 0) continue; const id = C.length, pila = [s]; comp[s] = id; let tam = 0, borde = false, dmax = 0, cota = 0, canal = 0, enRio = 0;
      while (pila.length) { const k = pila.pop(), i = k % w, j = (k / w) | 0; tam++; if (i === 0 || j === 0 || i === w - 1 || j === h - 1) borde = true; dmax = Math.max(dmax, D[k]); if (tam <= 400) cota += M.cota((i + .5) * paso, (j + .5) * paso); if (tipo[k] === 2) canal++; if (rio[k]) enRio++;
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= w || jj >= h) continue; const q = jj * w + ii; if (tipo[q] && comp[q] < 0) { comp[q] = id; pila.push(q); } } }
      const area = tam * paso * paso, ancho = dmax * paso * 2, cotaMedia = cota / Math.min(tam, 400);
      const t = enRio > 3 ? 'rio' : canal > tam * .5 ? (area > 5e4 ? 'rio' : 'quebrada') : (borde && cotaMedia < 8 && area > 1e6) ? 'mar' : (ancho < 90 && area / Math.max(1, ancho) > 400) ? 'rio' : 'lago';
      C.push({ id, tipo: t, area, ancho, borde, cota: cotaMedia }); }
    return (M._agua = { w, h, paso, D, comp, C, tipo });
  },
  /* el cuerpo de agua en (x, y) o null; con su profundidad (m) */
  aguaEn(M, x, y) {
    const tt = M.suelo(x, y); if (tt !== TT.WATER && tt !== TT.CANAL) return null; const A = Terreno.agua(M), i = clamp(Math.floor(x / A.paso), 0, A.w - 1), j = clamp(Math.floor(y / A.paso), 0, A.h - 1), k = j * A.w + i;
    const c = A.comp[k] >= 0 ? A.C[A.comp[k]] : { tipo: tt === TT.CANAL ? 'quebrada' : 'lago' };
    /* distancia a la orilla, suave (interpolada); medio paso porque la celda de borde ya está a media celda */
    const fx = x / A.paso - .5, fy = y / A.paso - .5, i0 = clamp(Math.floor(fx), 0, A.w - 2), j0 = clamp(Math.floor(fy), 0, A.h - 2), u = clamp(fx - i0, 0, 1), v = clamp(fy - j0, 0, 1), Dk = (a, b) => Math.min(A.D[(j0 + b) * A.w + i0 + a], 60);
    const d = Math.max(.3, ((Dk(0, 0) * (1 - u) + Dk(1, 0) * u) * (1 - v) + (Dk(0, 1) * (1 - u) + Dk(1, 1) * u) * v) * A.paso - A.paso * .5 + 2);
    const prof = c.tipo === 'mar' ? Math.min(40, .2 + d * .045) : c.tipo === 'lago' ? Math.min(30, .3 + d * .11) : c.tipo === 'rio' ? Math.min(4, .35 + d * .13) : Math.min(.7, .12 + d * .06);
    return { tipo: c.tipo, prof, orilla: d, cuerpo: c };
  },
  /* pendiente (magnitud, metros por metro) en (x, y) */
  pendiente(M, x, y, d = 6) { const gx = (M.cota(x + d, y) - M.cota(x - d, y)) / (2 * d), gy = (M.cota(x, y + d) - M.cota(x, y - d)) / (2 * d); return Math.hypot(gx, gy); },
  /* todo lo que hay en (x, y) */
  en(M, x, y) { const tt = M.suelo(x, y); return { tt, material: MATERIAL_TT[tt] || 'tierra', via: VIA_TT.has(tt), pendiente: Terreno.pendiente(M, x, y), agua: Terreno.aguaEn(M, x, y), cota: M.cota(x, y) }; },
  /* ---------- reglas de paso: { ok, f (factor de velocidad), nada, motivo } ---------- */
  paso(C, x, y) {
    const M = C.mundo, V = C.veh, cl = V.clase, tt = M.suelo(x, y), via = VIA_TT.has(tt), base = Vehiculos.suelo(V, tt);
    if (!M.dentro(x, y)) return { ok: false, f: 0, motivo: 'el borde del mundo' };
    if (cl === 'aire' && C.z > 3) return { ok: true, f: 1 };
    const ag = (tt === TT.WATER || tt === TT.CANAL) ? Terreno.aguaEn(M, x, y) : null;
    if (cl === 'agua') { if (!ag) return { ok: false, f: 0, tierra: true, motivo: 'la lancha no anda en tierra' }; if (ag.prof < .6) return { ok: false, f: 0, motivo: 'muy pando para la lancha' }; return { ok: true, f: Math.max(.3, base || 1) }; }
    if (ag && !C.paso) {
      if (cl === 'pie') return ag.prof < .5 ? { ok: true, f: .55, vadea: true } : ag.prof < 1.15 ? { ok: true, f: .32, vadea: true } : { ok: true, f: .26, nada: true };
      const lim = AGUA_MAX[cl] ?? 0; if (ag.prof > lim) return { ok: false, f: 0, agua: true, motivo: ag.tipo === 'quebrada' ? 'la quebrada está muy honda para ' + (cl === 'rueda' ? 'la bici' : 'este vehículo') : 'el agua está muy honda (' + ag.prof.toFixed(1) + ' m)' };
      return { ok: true, f: .35, vadea: true };
    }
    if (base <= 0 && !(cl === 'auto' && tt === TT.MOUNT && (V.id === 'todoterreno' || V.offroad))) return { ok: false, f: 0, motivo: { 1: 'el monte es muy cerrado', 16: 'por las escalas no pasa', 17: 'se entierra en la arena', 18: 'no avanza en la nieve', 19: 'no pasa por la roca' }[tt] || 'por ahí no pasa' };
    /* pendiente: fuera de las vías, lo muy empinado no se sube ni se baja (barrancos y acantilados) */
    if (!via && !C.paso) { const s = Terreno.pendiente(M, x, y), lim = (V.id === 'mtb' || V.id === 'todoterreno' || V.offroad ? 1.4 : 1) * (PEND_MAX[cl] ?? .5), d = Math.hypot(x - C.x, y - C.y) || .5, g = (M.cota(x, y) - M.cota(C.x, C.y)) / d;
      if (s > lim * 1.35 || g > lim || -g > lim * 1.6) return { ok: false, f: 0, motivo: g < 0 ? 'es un barranco' : 'está muy empinado' }; }
    return { ok: true, f: Math.max(.12, base || .5) * (tt === TT.MOUNT && cl === 'auto' ? .55 : 1) };
  },
  /* el punto más cercano (anillos cada 2 m hasta r) que cumple cond(x, y): para embarcar, desembarcar y salir del agua */
  cerca(M, x, y, r, cond) { if (cond(x, y)) return { x, y, d: 0 }; for (let d = 2; d <= r; d += 2) { const n = Math.max(8, Math.round(d * 1.6)); for (let k = 0; k < n; k++) { const a = k / n * TAU, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (M.dentro(px, py) && cond(px, py)) return { x: px, y: py, d }; } } return null; },
  aguaHonda(M, x, y, r = 30, min = .8) { return Terreno.cerca(M, x, y, r, (a, b) => { const g = Terreno.aguaEn(M, a, b); return g && g.prof >= min; }); },
  tierraFirme(M, x, y, r = 14) { return Terreno.cerca(M, x, y, r, (a, b) => { const t = M.suelo(a, b); return t !== TT.WATER && t !== TT.CANAL && t !== TT.BLDG && !M.edificioEn(a, b, .5) && Terreno.pendiente(M, a, b) < .8; }); },
  /* ---------- obstáculos: lo que ocupa espacio en el piso ---------- */
  _indiceSitios(M) {
    if (M._sitiosIdx) return M._sitiosIdx; const G = new Map(), C = 80, E = M.sitios().E || [];
    E.forEach((q, n) => { const k = q.caja; if (!k) return; for (let gy = Math.floor(k[1] / C); gy <= Math.floor(k[3] / C); gy++) for (let gx = Math.floor(k[0] / C); gx <= Math.floor(k[2] / C); gx++) { const key = gx * 65536 + gy; (G.get(key) || G.set(key, []).get(key)).push(n); } });
    return (M._sitiosIdx = { G, C, E });
  },
  /* ¿hay un edificio de los sitios (emblemáticos, universidades, iglesias…) en (x, y)? */
  sitioEn(M, x, y) { const I = Terreno._indiceSitios(M), L = I.G.get(Math.floor(x / I.C) * 65536 + Math.floor(y / I.C)); if (!L) return null; for (const n of L) { const q = I.E[n]; if (x < q.caja[0] || x > q.caja[2] || y < q.caja[1] || y > q.caja[3]) continue; for (const R of q.R) if (dentroPol(R, x, y)) return q; if (q.partes) for (const p of q.partes) if (p.z0 < 2.5 && dentroPol(p.B, x, y)) return q; } return null; },
  /* árbol de las losas (los mismos que se pintan) cuyo tronco toca el círculo (x, y, r) */
  arbolLosaEn(M, x, y, r) {
    const cel = 7; for (let gy = Math.floor((y - 3) / cel) * cel; gy <= y + 3; gy += cel) for (let gx = Math.floor((x - 3) / cel) * cel; gx <= x + 3; gx += cel) {
      const tt = M.suelo(gx, gy); if (tt !== TT.GRASS && tt !== TT.MOUNT && tt !== TT.PLAZA) continue; const Z = M.estilo(gx, gy), dens = tt === TT.MOUNT ? .55 : tt === TT.PLAZA ? .18 : (Z.arboles || .4) * .55; if (h2(gx, gy, 41) > dens) continue;
      const tx = gx + h2(gx, gy, 42) * cel, ty = gy + h2(gx, gy, 43) * cel; if (Math.hypot(tx - x, ty - y) < .38 + r) return { t: 'arbol', x: tx, y: ty };
    }
    return null;
  },
  /* el obstáculo que toca el círculo (x, y, r): mobiliario, naturaleza, árboles de las losas y lo que diga el juego */
  obstaculo(C, x, y, r) {
    const M = C.mundo, k = 3 + r;
    if (MC.Mobiliario) for (const p of Mobiliario.en(M, x - k, y - k, x + k, y + k, 200)) { const R = OBST_R[p.t]; if (R && Math.hypot(p.x - x, p.y - y) < R + r) return p; }
    if (MC.Naturaleza) for (const p of Naturaleza.en(M, x - k, y - k, x + k, y + k)) { const R = p.t === 'roca' ? p.s * .45 : OBST_R[p.t]; if (R && (p.t !== 'roca' || p.s > .7 || C.veh.clase !== 'pie') && Math.hypot(p.x - x, p.y - y) < R + r) return p; }
    if (Terreno.arbolLosaEn(M, x, y, r)) return { t: 'arbol' };
    if (C.obstaculos) for (const o of C.obstaculos()) if (Math.hypot(o.x - x, o.y - y) < (o.r || .5) + r) return o;
    return null;
  }
};
Object.assign(MC, { Terreno });

/* ---- js/16-estilos.js ---- */
/* =====================================================================
   ESTILOS · cómo se ve el mundo (2.7): realista, clásico, cómic, manga, anime, novela gráfica, ukiyo-e y acuarela
   Un estilo es un conjunto de datos, no otro motor. El mismo mundo, las mismas losas y los mismos árboles pasan por:
     - MAPA DE COLOR: saturar, brillo, contraste, gris, niveles (cel shading: bandas de luz) o paleta (el color más
       cercano de una obra real) y umbral con color de acento (la novela gráfica: blanco, negro y un rojo);
     - TINTA: contornos de grosor constante (la «línea clara» de Hergé y Moebius) en vías, techos, muros y árboles;
     - TRAMA: semitono de puntos (cómic impreso, Lichtenstein, Spider‑Verse), tramado de manga (screentone),
       rayado (grabado de Doré) o papel (acuarela y ukiyo-e);
     - SOMBRA: su color (azul violeta en el anime, negra en la novela, gris en el manga);
     - ÁRBOLES: real, cel (tonos planos y contorno), tono (manga), silueta (noir) o acuarela (bordes con pigmento);
     - CIELO y PASE FINAL: degradé propio (cielos de Shinkai en el anime) y, en el manga, todo a escala de grises;
       líneas de velocidad y onomatopeyas cuando el estilo las pide.
   Las PALETAS de ukiyo-e, novela y acuarela salen de obras de DOMINIO PÚBLICO (Hokusai, Hiroshige, Doré, Winslow
   Homer…), con su fuente en arte/dominio-publico/paletas.json. Del resto (Spider‑Verse, Arcane, Ghibli, Shinkai,
   Sin City, Moebius) se toman las TÉCNICAS, nunca imágenes ni personajes (docs/INSPIRACION-VISUAL.md).
   2.8: vintage (sepia, papel y viñeta) y CRT (líneas de barrido), como los filtros de Miniopolis (entrega maestra, R17).
   Uso: MC.estilo = 'comic' · MC.Estilo.p (el estilo activo) · MC.Estilo.col('#c25f37') · MC.Estilo.lista()
   ===================================================================== */
const PAL_DP = {
  hokusai: ['#f6e6c7', '#fbf4dd', '#284664', '#dbd1b9', '#6b7e8a', '#a83926', '#2c5489', '#213248', '#79736e', '#3b5f83', '#9ca9ac', '#79382c', '#5f7d4a', '#8a9a5b'],   // La gran ola y Fuji rojo (Hokusai, 1831) + dos verdes de los paisajes de Hiroshige
  dore: ['#f7f1df', '#070706', '#645f55', '#867f72', '#2b2924', '#46433c', '#171613', '#bcb5a6'],   // grabado de Gustave Doré (1861)
  acuarela: ['#cecdbc', '#576c73', '#79827e', '#afb2a7', '#e9dab7', '#496378', '#c7c7b0', '#b6b198', '#7f8d8e', '#f5f5ef']   // Winslow Homer (1899), Hiroshige (1857) y la Comisión Corográfica (1853)
};
const ESTILOS_GRAF = {
  realista: { n: 'Realista', icono: '📷', rudeza: true, arbol: 'real' },
  clasico: { n: 'Clásico (plano)', icono: '🟩', arbol: 'cel' },
  comic: { n: 'Cómic', icono: '💥', saturar: 1.35, contraste: 1.08, niveles: 5, tinta: 2.2, tintaColor: '#141118', trama: 'puntos', arbol: 'cel', sombra: [24, 20, 70, .42], lineas: '#141118', onomatopeyas: true, cielo: [[.22, .52, .95], [.98, .92, .62]] },
  unbit: { n: 'Grabado de un bit', icono: '◩', gris: true, arbol: 'tono', binario: true },
  manga: { n: 'Manga', icono: '🖋️', gris: true, contraste: 1.18, niveles: 4, tinta: 2, tintaColor: '#0b0b0b', trama: 'tono', arbol: 'tono', sombra: [0, 0, 0, .38], lineas: '#0b0b0b', onomatopeyas: true, final: 'gris', cielo: [[.82, .82, .82], [.99, .99, .99]] },
  anime: { n: 'Anime', icono: '🌸', saturar: 1.22, brillo: 1.05, niveles: 6, tinta: 1, tintaColor: '#2b2740', arbol: 'cel', sombra: [70, 50, 150, .32], lineas: '#ffffff', onomatopeyas: false, cielo: [[.16, .4, .92], [.8, .93, 1]] },
  novela: { n: 'Novela gráfica (noir)', icono: '🌃', umbral: [.3, .62], tonos: ['#0d0c0b', '#6a655c', '#ece5d3'], acento: '#b3201c', tinta: 2.6, tintaColor: '#000000', trama: 'rayado', arbol: 'silueta', sombra: [0, 0, 0, .72], lineas: '#000000', onomatopeyas: true, cielo: [[.07, .07, .08], [.5, .48, .45]] },
  ukiyoe: { n: 'Ukiyo-e (Hokusai)', icono: '🌊', paleta: 'hokusai', mezcla: .82, niveles: 5, tinta: 1.6, tintaColor: '#1d2a3f', trama: 'papel', arbol: 'cel', sombra: [30, 50, 90, .28], cielo: [[.17, .33, .54], [.96, .9, .78]] },
  vintage: { n: 'Vintage', icono: '📼', saturar: .55, contraste: .92, tinte: [.66, .52, .36], tinteK: .28, trama: 'papel', arbol: 'cel', sombra: [60, 40, 20, .3], final: 'vineta', cielo: [[.72, .62, .48], [.95, .88, .74]] },   // 2.8: foto vieja (entrega maestra, R17)
  crt: { n: 'CRT (pantalla vieja)', icono: '📺', saturar: 1.25, contraste: 1.08, niveles: 7, arbol: 'cel', sombra: [10, 20, 40, .36], final: 'crt', cielo: [[.1, .3, .6], [.6, .8, .95]] },   // 2.8: líneas de barrido y borde oscuro
  termica: { n: 'Visión térmica', icono: '🌡️', gradiente: ['#2b0b57', '#7a1fa2', '#e5383b', '#ff9f1c', '#ffea00'], arbol: 'cel', sombra: [20, 0, 60, .3], cielo: [[.1, .03, .25], [.35, .1, .45]] },   // 2.8: FireTrace (R22), paleta del informe de Gemini
  acuarela: { n: 'Acuarela', icono: '🎨', paleta: 'acuarela', mezcla: .3, saturar: .9, brillo: 1.08, trama: 'papel', arbol: 'acuarela', sombra: [60, 70, 110, .24], cielo: [[.55, .7, .86], [.97, .95, .9]] }
};
const Estilo = {
  ESTILOS: ESTILOS_GRAF, PAL_DP,
  get p() { return ESTILOS_GRAF[MC.estilo] || ESTILOS_GRAF.realista; },
  lista() { return Object.entries(ESTILOS_GRAF).map(([id, e]) => ({ id, n: e.n, icono: e.icono })); },
  _pal: {}, _cc: new Map(), _ccEst: null,
  paleta(nombre) { return this._pal[nombre] || (this._pal[nombre] = (PAL_DP[nombre] || []).map(hex3)); },
  /* el corazón: un color [r, g, b] (0..1) pasado por el estilo activo */
  rgb(c, S = this.p) {
    let r = c[0], g = c[1], b = c[2];
    if (S.saturar || S.gris) { const l = .299 * r + .587 * g + .114 * b, k = S.gris ? 0 : S.saturar; r = l + (r - l) * k; g = l + (g - l) * k; b = l + (b - l) * k; }
    if (S.brillo) { r *= S.brillo; g *= S.brillo; b *= S.brillo; }
    if (S.tinte) { const l = .299 * r + .587 * g + .114 * b, k = S.tinteK ?? .3; r += (S.tinte[0] * l * 1.6 - r) * k; g += (S.tinte[1] * l * 1.6 - g) * k; b += (S.tinte[2] * l * 1.6 - b) * k; }   // tono sepia
    if (S.contraste) { const k = S.contraste; r = (r - .5) * k + .5; g = (g - .5) * k + .5; b = (b - .5) * k + .5; }
    if (S.gradiente) { const G = S._g || (S._g = S.gradiente.map(hex3)), l = clamp(.299 * r + .587 * g + .114 * b, 0, 1) * (G.length - 1), i = Math.min(G.length - 2, Math.floor(l)), u = l - i; return mez3(G[i], G[i + 1], u); }   // mapa de calor por luminancia
    if (S.umbral) {   // novela gráfica: tres tonos de papel y tinta, y el rojo como acento (el «color selectivo» del noir)
      if (r > .38 && r > g * 1.45 && r > b * 1.45) return hex3(S.acento);
      const l = .299 * r + .587 * g + .114 * b; return hex3(S.tonos[l < S.umbral[0] ? 0 : l < S.umbral[1] ? 1 : 2]);
    }
    if (S.paleta) { const P = this.paleta(S.paleta); let best = P[0], bd = 1e9; for (const q of P) { const d = (q[0] - r) ** 2 * .3 + (q[1] - g) ** 2 * .59 + (q[2] - b) ** 2 * .11; if (d < bd) { bd = d; best = q; } } const m = S.mezcla ?? 1; r += (best[0] - r) * m; g += (best[1] - g) * m; b += (best[2] - b) * m; }
    if (S.niveles) {   // cel shading: la luz en bandas
      const l = Math.max(1e-3, .299 * r + .587 * g + .114 * b), n = S.niveles, lq = Math.max(.04, Math.round(l * n) / n), k = lq / l; r *= k; g *= k; b *= k;
    }
    return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1)];
  },
  /* un color CSS ('#hex', 'rgb()' o 'rgba()') pasado por el estilo, con caché; respeta la transparencia */
  col(css) {
    if (!css || typeof css !== 'string') return css; const S = this.p; if (S === ESTILOS_GRAF.realista || S === ESTILOS_GRAF.clasico) return css;
    if (this._ccEst !== MC.estilo) { this._cc.clear(); this._ccEst = MC.estilo; } let v = this._cc.get(css); if (v) return v;
    const hex = /^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i.exec(css);
    const rgb = /^rgba?\(\s*([.\d]+)\s*,\s*([.\d]+)\s*,\s*([.\d]+)(?:\s*,\s*([.\d]+))?\s*\)$/i.exec(css);
    if (!hex && !rgb) return css;
    let color, alfa = 1;
    if (hex) {
      const codigo = hex[1].length < 5 ? [...hex[1]].map(n => n+n).join('') : hex[1];
      color = hex3('#'+codigo.slice(0,6));
      if (codigo.length === 8) alfa = parseInt(codigo.slice(6),16)/255;
    } else {
      color = rgb.slice(1,4).map(n => Number(n)/255); alfa = Number(rgb[4] ?? 1);
    }
    v = css3(this.rgb(color,S),alfa); this._cc.set(css, v); if (this._cc.size > 4000) this._cc.clear(); return v;
  },
  /* luz de un muro: en los estilos de cel, la luz salta en bandas en lugar de degradarse */
  luz(lz) { const S = this.p; return S.niveles && !S.rudeza ? Math.round(lz * 3) / 3 : lz; },
  /* ---------- tramas horneadas en las losas (patrones en metros del mundo) ---------- */
  _src: {},
  fuente(tipo) {
    if (this._src[tipo] !== undefined) return this._src[tipo]; const S = tipo === 'papel' ? 128 : 16, c = lienzo(S, S); if (!c) return (this._src[tipo] = null); const g = c.getContext('2d');
    if (tipo === 'puntos') { g.fillStyle = 'rgba(10,10,30,.30)'; for (const [x, y] of [[4, 4], [12, 12]]) { g.beginPath(); g.arc(x, y, 2.3, 0, TAU); g.fill(); } }   // semitono en diagonal, como la imprenta
    else if (tipo === 'tono') { g.fillStyle = 'rgba(0,0,0,.34)'; for (const [x, y] of [[4, 4], [12, 12]]) { g.beginPath(); g.arc(x, y, 1.4, 0, TAU); g.fill(); } }   // tramado de manga, más fino
    else if (tipo === 'rayado') { g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.4; for (let k = -16; k < 32; k += 6) { g.beginPath(); g.moveTo(k, 16); g.lineTo(k + 16, 0); g.stroke(); } }   // rayado de grabado
    else if (tipo === 'papel') { const img = g.createImageData(S, S), d = img.data, rnd = mulberry32(77); for (let i = 0; i < S * S; i++) { const v = rnd(), o = i * 4, cl = v > .5; d[o] = d[o + 1] = d[o + 2] = cl ? 255 : 90; d[o + 3] = Math.round(Math.abs(v - .5) * 2 * (cl ? 40 : 26)); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,.10)'; g.lineWidth = .8; for (let i = 0; i < 40; i++) { const x = rnd() * S, y = rnd() * S, a = rnd() * TAU, l = 4 + rnd() * 10; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }   // fibras del papel
    return (this._src[tipo] = c);
  },
  trama(g, x0, y0, L, res) {
    const S = this.p; if (!S.trama) return; const f = this.fuente(S.trama); if (!f) return; const m = S.trama === 'papel' ? .12 : Math.max(.22, 2.2 / Math.max(.5, res)) / 16 * (S.trama === 'tono' ? .55 : 1);   // el punto del semitono mide lo mismo en pantalla a cualquier zoom de horneado
    const p = g.createPattern(f, 'repeat'); if (p && p.setTransform && typeof DOMMatrix !== 'undefined') p.setTransform(new DOMMatrix([m, 0, 0, m, 0, 0])); g.fillStyle = p; g.fillRect(x0, y0, L, L);
  },
  // Umbrales ordenados por máxima distancia al punto más cercano en un toro.
  ruidoAzul() {
    if (this._azul) return this._azul;
    const n = 16, rango = new Uint8Array(n*n), distancia = new Float32Array(n*n).fill(Infinity);
    let elegido = 93;
    for (let valor = 0; valor < rango.length; valor++) {
      rango[elegido] = valor;
      const x = elegido % n, y = elegido >> 4;
      let max = -1, siguiente = 0;
      for (let i = 0; i < rango.length; i++) {
        const dx = Math.abs(i % n - x), dy = Math.abs((i >> 4) - y);
        distancia[i] = Math.min(distancia[i], Math.min(dx,n-dx)**2 + Math.min(dy,n-dy)**2);
        const candidato = distancia[i] + h2(i,valor,451) * .01;
        if (candidato > max) { max = candidato; siguiente = i; }
      }
      elegido = siguiente;
    }
    return this._azul = rango;
  },
  /* pantallas grandes (DPR 2: 1,4 millones de píxeles): el pase por píxel va a media resolución, 4 veces menos que leer y escribir.
     1 bit: el tramado queda de 1 px CSS (el mismo aspecto). Cómic: solo se calcula la máscara de puntos y se multiplica encima,
     así la imagen conserva todo su detalle. Medido en la prueba del celular: de ~30 ms a ~8 ms por cuadro. */
  /* 2.11: cada aparato elige su camino midiendo. Con GPU de verdad los filtros no frenan (el trabajo queda en la GPU);
     en un lienzo por software se ejecutan ahí mismo y el camino por píxel a media resolución sale más barato
     (medido sin GPU: 1 bit en la maqueta, 22 ms con filtros contra ~6 ms por píxel). Se alternan los dos 12 cuadros,
     se queda el más rápido y se vuelve a medir cada ~20 s. Por estilo (cómic o 1 bit), porque cuestan distinto. */
  imprimir(g, W, H, V, binario) {
    const s = W * H > 400000 ? .5 : 1, puedeGPU = W * H > 4096 && this._filtros();
    if (!puedeGPU) return this._imprimirCPU(g, W, H, V, binario, s);
    const M = (this._camino ||= {})[binario ? 'b' : 'c'] ||= { n: 0, gpu: null, cpu: null };
    const usaGPU = M.n < 12 ? M.n % 2 === 0 : M.gpu <= M.cpu, t0 = MC.ahora();
    if (usaGPU) this._imprimirGPU(g, W, H, V, binario, s); else this._imprimirCPU(g, W, H, V, binario, s);
    const ms = MC.ahora() - t0, k = usaGPU ? 'gpu' : 'cpu'; M[k] = M[k] == null ? ms : M[k] * .8 + ms * .2; if (++M.n > 1200) { M.n = 0; M.gpu = M.cpu = null; }
    this.caminoImprimir = usaGPU ? 'filtros' : 'píxel';
  },
  _imprimirCPU(g, W, H, V, binario, s) {
    if (s === 1) return this._imprimir(g, W, H, V, binario, false);
    const w = Math.ceil(W * s), h = Math.ceil(H * s); let c = this._imp;
    if (!c || c.width !== w || c.height !== h) { c = this._imp = lienzo(w, h); this._impG = c && c.getContext('2d', { willReadFrequently: true }); }
    const q = this._impG; if (!q) return this._imprimir(g, W, H, V, binario, false);
    q.globalCompositeOperation = 'copy'; q.imageSmoothingEnabled = true; q.drawImage(g.canvas, 0, 0, w, h); q.globalCompositeOperation = 'source-over';
    this._imprimir(q, w, h, { a: V.a * s, b: V.b * s, c: V.c * s, d: V.d * s, e: V.e * s, f: V.f * s, z: V.z * s }, binario, !binario);
    g.save(); g.imageSmoothingEnabled = false; if (!binario) g.globalCompositeOperation = 'multiply'; g.drawImage(c, 0, 0, W, H); g.restore();   // igual que el camino con filtros
  },
  /* Sin leer la pantalla (lo que más cuesta: obliga a terminar todo el dibujo pendiente): con los filtros del lienzo.
     gris(imagen)·½ + patrón de umbrales·½ y luego contraste extremo = blanco si la luz pasa el umbral de esa celda, negro si no.
     Es el mismo tramado anclado al mundo del camino por píxel (ruido azul 16×16 en 1 bit; puntos 8×8 en cómic). */
  _filtros() {
    if (this._gpu != null) return this._gpu; let ok = false;
    try { const c = lienzo(2, 2), q = c && c.getContext('2d'); if (q && 'filter' in q && typeof DOMMatrix !== 'undefined') { q.filter = 'contrast(1000)'; ok = q.filter === 'contrast(1000)'; } } catch (e) { ok = false; }
    return (this._gpu = ok);
  },
  _umbral(binario) {
    const k = binario ? 'azul' : 'puntos'; this._um = this._um || {}; if (this._um[k]) return this._um[k];
    const n = binario ? 16 : 8, c = lienzo(n, n), q = c.getContext('2d'), img = q.createImageData(n, n), az = binario ? this.ruidoAzul() : null;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const o = (y * n + x) * 4; let v;
      if (binario) v = 255 - az[x + (y << 4)];   // blanco si luz > rango
      else { const dx = (x - 3.5) / 4, dy = (y - 3.5) / 4, T = 160 * (1 - dx * dx - dy * dy); v = T <= 0 ? 255 : Math.round(255 - T); }   // punto si luz < T
      img.data[o] = img.data[o + 1] = img.data[o + 2] = v; img.data[o + 3] = 255;
    }
    q.putImageData(img, 0, 0); return (this._um[k] = c);
  },
  _imprimirGPU(g, W, H, V, binario, s) {
    const w = Math.ceil(W * s), h = Math.ceil(H * s);
    if (!this._gq || this._gq.width !== w || this._gq.height !== h) { this._gq = lienzo(w, h); this._gq2 = lienzo(w, h); }
    const q = this._gq.getContext('2d'), q2 = this._gq2.getContext('2d');
    q.save(); q.globalCompositeOperation = 'copy'; q.filter = 'grayscale(1)'; q.imageSmoothingEnabled = true; q.drawImage(g.canvas, 0, 0, w, h); q.restore();
    const pat = q.createPattern(this._umbral(binario), 'repeat'); pat.setTransform(new DOMMatrix([1, 0, 0, 1, Math.round(V.e * s), Math.round(V.f * s)]));   // anclado al desplazamiento del mundo, celdas de 1 px (sin muaré en la maqueta 2:1)
    q.save(); q.imageSmoothingEnabled = false; q.globalAlpha = .5; q.fillStyle = pat; q.fillRect(0, 0, w, h); q.restore();
    q2.save(); q2.globalCompositeOperation = 'copy'; q2.filter = 'contrast(1000)'; q2.drawImage(this._gq, 0, 0); q2.restore();
    if (!binario) { q2.save(); q2.globalCompositeOperation = 'lighten'; q2.fillStyle = 'rgb(133,122,148)'; q2.fillRect(0, 0, w, h); q2.restore(); }
    g.save(); g.imageSmoothingEnabled = false; if (!binario) g.globalCompositeOperation = 'multiply'; g.drawImage(this._gq2, 0, 0, W, H); g.restore();
  },
  _imprimir(g, W, H, V, binario, mascara) {
    const img = g.getImageData(0, 0, W, H), rgba = img.data;
    /* el tramado se ancla al desplazamiento del mundo (no se «nada» al moverse la cámara) con celdas de 1 píxel alineadas a la pantalla:
       anclarlo también al giro y al aplastado 2:1 de la maqueta hacía muaré (rombos) y el 1 bit no se leía */
    const e = Math.round(V.e), f = Math.round(V.f), ux = 1, uy = 0, vx = 0, vy = 1;
    const azul = binario ? this.ruidoAzul() : null;
    for (let y = 0, i = 0; y < H; y++) {
      let xw = (.5-e)*ux+(y+.5-f)*vx, yw = (.5-e)*uy+(y+.5-f)*vy;
      for (let x = 0; x < W; x++, i+=4, xw+=ux, yw+=uy) {
        const lum = .2126*rgba[i]+.7152*rgba[i+1]+.0722*rgba[i+2];
        if (binario) {
          const rango = azul[(Math.floor(xw)&15) + ((Math.floor(yw)&15)<<4)];
          rgba[i] = rgba[i+1] = rgba[i+2] = lum > rango+.5 || lum === 255 ? 255 : 0;
        } else {
          let punto = false;
          if (lum < 160) { const dx = ((Math.floor(xw)&7)-3.5)/4, dy = ((Math.floor(yw)&7)-3.5)/4; punto = dx*dx+dy*dy < (160-lum)/160; }
          if (mascara) { rgba[i] = punto ? 133 : 255; rgba[i+1] = punto ? 122 : 255; rgba[i+2] = punto ? 148 : 255; rgba[i+3] = 255; }
          else if (punto) { rgba[i]*=.52; rgba[i+1]*=.48; rgba[i+2]*=.58; }
        }
      }
    }
    g.putImageData(img,0,0);
  },
  /* ---------- pase final (por cuadro, barato): manga en grises y líneas de velocidad ---------- */
  final(g, W, H, E) {
    const S = this.p; if (S.final === 'gris') { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.restore(); }
    else if (S.final === 'vineta' || S.final === 'crt') { const c = this._capa(S.final, W, H); if (c) g.drawImage(c, 0, 0); }   // horneado una vez por tamaño de pantalla
    const C = E.jugador && E.jugador.cuerpo, v = C ? Math.abs(C.v || 0) : 0; if (S.lineas && v > 8.5) this.lineas(g, W, H, Math.min(1, (v - 8.5) / 14), E.t || 0, S.lineas);
  },
  _capas: {},
  _capa(tipo, W, H) {
    const k = tipo + W + 'x' + H; if (this._capas[k] !== undefined) return this._capas[k]; const c = lienzo(W, H); if (!c) return (this._capas[k] = null); const g = c.getContext('2d');
    const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.hypot(W, H) * .58); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, tipo === 'crt' ? 'rgba(0,0,0,.55)' : 'rgba(40,24,10,.45)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (tipo === 'crt') { g.fillStyle = 'rgba(0,0,0,.16)'; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1); }   // líneas de barrido
    for (const q in this._capas) if (q.startsWith(tipo) && q !== k) delete this._capas[q]; return (this._capas[k] = c);
  },
  /* líneas de velocidad del manga: desde el borde hacia el centro, sin tocar el centro (el juego es del centro) */
  lineas(g, W, H, k, t, col) {
    const cx = W / 2, cy = H / 2, R0 = Math.min(W, H) * (.5 - .1 * k), R1 = Math.hypot(W, H) * .6, rnd = mulberry32((t * 24) | 0);
    g.save(); g.strokeStyle = col; g.globalAlpha = .25 + .45 * k; g.lineCap = 'round';
    for (let i = 0; i < 22 + 30 * k; i++) { const a = rnd() * TAU, r0 = R0 + rnd() * (R1 - R0) * .3; g.lineWidth = 1 + rnd() * 3 * k + 1; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * (H / W) * .9); g.lineTo(cx + Math.cos(a) * R1, cy + Math.sin(a) * R1); g.stroke(); }
    g.restore();
  }
};
MC.Estilo = Estilo; MC.ESTILOS_GRAF = ESTILOS_GRAF;

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

/* ---- js/24-ambiente.js ---- */
/* =====================================================================
   AMBIENTE GLOBAL · clima y estaciones para cualquier lugar del planeta (o inventado)
   - Temperatura por latitud, altura (−6,5 °C/km), estación del año (hemisferio norte o sur) y hora del día.
   - Tipos de clima: tropical, montaña tropical, monzón, mediterráneo, templado, continental, desierto y polar.
   - Precipitación por bloques de 3 h (determinista: la misma para todos a la misma fecha y hora): lluvia, tormenta
     eléctrica, granizo, NIEVE (si hace frío) y su capa que se acumula y se derrite; niebla cuando el aire llega al
     punto de rocío con poco viento; olas de CALOR; viento con ráfagas; humedad, índice de calor y sensación térmica.
   - Efectos físicos: agarre de las llantas según el clima, visibilidad para las vistas y la IA, y calor para la biología.
   Misma interfaz que MC.Clima (lluvia, nubes, niebla, tormenta, viento, rayo, temp, tipo, texto) más nieve y calor.
   ===================================================================== */
const CLIMAS = {
  tropical: { hum: .78, amp: 4, lluvia: d => .45 + .25 * Math.cos(TAU * 2 * (d - 120) / 365) },
  montana_tropical: { hum: .72, amp: 5, lluvia: d => .38 + .22 * Math.cos(TAU * 2 * (d - 120) / 365) },
  monzon: { hum: .8, amp: 5, lluvia: (d, hs) => .15 + .65 * Math.max(0, Math.cos(TAU * (d - 200 * hs - (hs < 0 ? 182 : 0)) / 365)) },
  mediterraneo: { hum: .55, amp: 9, lluvia: (d, hs) => .12 + .32 * Math.max(0, -Math.cos(TAU * (d - 200 - (hs < 0 ? 182 : 0)) / 365)) },
  templado: { hum: .7, amp: 7, lluvia: () => .38 },
  continental: { hum: .6, amp: 10, lluvia: (d, hs) => .28 + .12 * Math.cos(TAU * (d - 200 - (hs < 0 ? 182 : 0)) / 365) },
  desierto: { hum: .22, amp: 14, lluvia: () => .04 },
  polar: { hum: .65, amp: 5, lluvia: () => .25 }
};
const Ambiente = {
  CLIMAS,
  /* el tipo de clima probable por latitud y altura (se puede fijar a mano) */
  tipoPara(lat, alt = 0) { const a = Math.abs(lat); if (a > 66) return 'polar'; if (a < 23.5) return alt > 1200 ? 'montana_tropical' : 'tropical'; if (a < 35) return 'mediterraneo'; if (a < 50) return 'templado'; return 'continental'; },
  /* temperatura media del día a nivel del mar y su variación por estación (°C) */
  tempMedia(lat, dia) { const a = Math.abs(lat), hs = lat >= 0 ? 1 : -1, base = 28 - .006 * lat * lat - .1 * a, amp = .25 * a, fase = TAU * (dia - (hs > 0 ? 200 : 17)) / 365; return base + amp * Math.cos(fase); },
  estacion(fecha, lat) { const d = Calendario.diaDelAño(fecha); if (Math.abs(lat) < 23.5) return null; const n = lat >= 0 ? d : (d + 182) % 365; return n < 79 || n >= 355 ? 'invierno' : n < 172 ? 'primavera' : n < 266 ? 'verano' : 'otoño'; },
  /* horas de luz del día (ecuación de la salida del sol) */
  horasLuz(lat, dia) { const dec = -23.44 * Math.PI / 180 * Math.cos(TAU / 365 * (dia + 10)), x = -Math.tan(lat * Math.PI / 180) * Math.tan(dec); return x <= -1 ? 24 : x >= 1 ? 0 : 24 / Math.PI * Math.acos(x); },
  /* agarre de una llanta (multiplica al coeficiente de fricción) según el clima del momento */
  agarre(cl) { if (!cl) return 1; if (cl.hielo > .3) return .18; if (cl.nieveSuelo > 1) return .4; if (cl.lluvia > .1) return 1 - .3 * Math.min(1, cl.lluvia * 1.4); return 1; },
  /* visibilidad en metros (para las vistas, la IA y el manejo) */
  visibilidad(cl) { if (!cl) return 10000; return Math.max(40, 10000 * (1 - .96 * (cl.niebla || 0)) * (1 - .6 * (cl.lluvia || 0)) * (1 - .7 * (cl.nieve || 0))); },
  crearClima(cfg, lat, alt) { return new ClimaGlobal({ lat, alt, tipo: (cfg && cfg.clima && cfg.clima.tipo) || Ambiente.tipoPara(lat, alt) }); }
};
class ClimaGlobal {
  constructor({ lat = 6.2, alt = 1500, tipo } = {}) { Object.assign(this, { lat, alt, tipoClima: tipo || Ambiente.tipoPara(lat, alt) }); this.forzado = null; this.lluvia = 0; this.nubes = .2; this.niebla = 0; this.tormenta = 0; this.rayo = 0; this.nieve = 0; this.granizo = 0; this.nieveSuelo = 0; this.hielo = 0; this.calor = 0; this.viento = { v: 2, dir: 0 }; this.temp = 20; this.hum = 60; this.rocio = 12; this.tipo = 'despejado'; this._t = null; }
  forzar(t) { this.forzado = t || null; }
  _bloque(fecha, b) {
    const sem = (fecha.getFullYear() * 400 + fecha.getMonth() * 32 + fecha.getDate()) * 8 + b, r = h2(sem, 7, 91), r2 = h2(sem, 9, 92), d = Calendario.diaDelAño(fecha), K = CLIMAS[this.tipoClima] || CLIMAS.templado, hs = this.lat >= 0 ? 1 : -1;
    const tarde = b * 3 + 1.5 >= 13 && b * 3 + 1.5 <= 19 ? 1.5 : b < 2 ? .6 : .85, p = clamp(K.lluvia(d, hs) * tarde * .7, 0, .92);
    if (r < p * .22) return { tipo: 'tormenta', lluvia: .9, nubes: 1, tormenta: 1, viento: 9 };
    if (r < p) return { tipo: 'lluvia', lluvia: .35 + r2 * .45, nubes: .9, tormenta: 0, viento: 4 };
    if (r < p + .2) return { tipo: 'nublado', lluvia: 0, nubes: .6 + r2 * .3, tormenta: 0, viento: 3 };
    return { tipo: 'despejado', lluvia: 0, nubes: .08 + r2 * .25, tormenta: 0, viento: 2 + r2 * 2 };
  }
  actualizar(reloj, dt = 0) {
    const h = reloj.hora, b = Math.floor(h / 3) % 8, f = (h % 3) / 3, d = Calendario.diaDelAño(reloj.fecha), K = CLIMAS[this.tipoClima] || CLIMAS.templado;
    const F = { despejado: { tipo: 'despejado', lluvia: 0, nubes: .1, tormenta: 0, viento: 2 }, nublado: { tipo: 'nublado', lluvia: 0, nubes: .85, tormenta: 0, viento: 3 }, lluvia: { tipo: 'lluvia', lluvia: .7, nubes: .95, tormenta: 0, viento: 4 }, tormenta: { tipo: 'tormenta', lluvia: 1, nubes: 1, tormenta: 1, viento: 10 }, nieve: { tipo: 'nieve', lluvia: .6, nubes: .95, tormenta: 0, viento: 3, frio: -6 }, niebla: { tipo: 'nublado', lluvia: 0, nubes: .4, tormenta: 0, viento: .5, niebla: 1 }, calor: { tipo: 'despejado', lluvia: 0, nubes: 0, tormenta: 0, viento: 1, calor: 12 } }[this.forzado];
    const A = F || this._bloque(reloj.fecha, b), B = F || this._bloque(b === 7 ? new Date(reloj.fecha.getFullYear(), reloj.fecha.getMonth(), reloj.fecha.getDate() + 1) : reloj.fecha, (b + 1) % 8), k = f > .8 ? suave((f - .8) / .2) : 0, s = dt > 0 ? Math.min(1, dt * .8) : 1;
    /* temperatura: media del día por latitud y estación, menos la altura, más la onda del día (máx. ~15 h) */
    const Tm = Ambiente.tempMedia(this.lat, d) - .0065 * this.alt + (A.frio || 0) + (A.calor || 0), Td = (K.amp * (1 - .5 * A.nubes)) * Math.sin(TAU * (h - 9) / 24), T = Tm + Td - lerp(A.lluvia, B.lluvia, k) * 2.5;
    this.temp = dt > 0 ? lerp(this.temp, T, Math.min(1, dt * .2)) : T;
    this.lluvia = lerp(this.lluvia, lerp(A.lluvia, B.lluvia, k), s); this.nubes = lerp(this.nubes, lerp(A.nubes, B.nubes, k), s); this.tormenta = lerp(this.tormenta, lerp(A.tormenta, B.tormenta, k), s);
    this.viento.v = lerp(this.viento.v, lerp(A.viento, B.viento, k) * (1 + .35 * Math.sin(reloj.min * 1.3) * (this.tormenta + .2)), s); this.viento.dir = h2(reloj.fecha.getDate(), b, 5) * TAU;
    /* humedad y rocío: el aire húmedo de la madrugada llega al rocío → niebla si hay poco viento */
    this.hum = clamp(K.hum * 100 + this.lluvia * 25 - Td * 3 + (h < 8 ? 12 : 0), 8, 100); this.rocio = Termo.rocio(this.temp, this.hum);
    const nb = A.niebla ? 1 : clamp((2.5 - (this.temp - this.rocio)) / 2.5, 0, 1) * clamp((3 - this.viento.v) / 3, 0, 1); this.niebla = lerp(this.niebla, nb, s);
    /* nieve, granizo, hielo y capa de nieve */
    const frio = this.temp < .8; this.nieve = frio ? this.lluvia : 0; if (frio) this.lluvia *= .15;
    this.granizo = this.tormenta > .6 && this.temp > 4 && this.temp < 22 && h2(reloj.fecha.getDate(), b, 33) < .25 ? this.tormenta : 0;
    if (dt > 0) { this.nieveSuelo = Math.max(0, this.nieveSuelo + (this.nieve * 2.2 - Math.max(0, this.temp) * .35) * dt * (reloj.vel || 1) / 60); this.hielo = this.temp < 0 && (this.nieveSuelo > .2 || this.lluvia > .05) ? clamp(this.hielo + dt * .01, 0, 1) : Math.max(0, this.hielo - dt * .02); }
    this.calor = clamp((this.temp - 32) / 8, 0, 1);
    this.tipo = this.nieve > .1 ? 'nieve' : this.granizo > .3 ? 'granizo' : this.niebla > .55 ? 'niebla' : this.calor > .3 ? 'calor' : (k > .5 ? B.tipo : A.tipo);
    if (this.tormenta > .5 && dt > 0) { this.rayo = Math.max(0, this.rayo - dt * 4); if (Math.random() < dt * .12 * this.tormenta) { this.rayo = 1; MC.emit('rayo', this); } } else this.rayo = 0;
    return this;
  }
  get sensacion() { return this.temp >= 27 ? Termo.indiceCalor(this.temp, this.hum) : Termo.sensacionViento(this.temp, this.viento.v * 3.6); }
  texto() { const ic = { despejado: '☀️ Despejado', nublado: '☁️ Nublado', lluvia: '🌧️ Lluvia', tormenta: '⛈️ Tormenta', nieve: '🌨️ Nieve', granizo: '🧊 Granizo', niebla: '🌫️ Niebla', calor: '🔥 Calor' }[this.tipo] || this.tipo; return ic + ' · ' + Math.round(this.temp) + ' °C' + (Math.abs(this.sensacion - this.temp) > 2 ? ' (se siente ' + Math.round(this.sensacion) + ')' : '') + (this.nieveSuelo > .5 ? ' · ' + Math.round(this.nieveSuelo) + ' cm de nieve' : ''); }
}
Object.assign(MC, { Ambiente, ClimaGlobal, CLIMAS });

/* ---- js/25-ia.js ---- */
/* =====================================================================
   INTELIGENCIA ARTIFICIAL · que el mundo esté vivo
   - Utilidad (Utility AI): cada agente puntúa sus opciones con curvas y hace la que más le sirve ahora.
   - Árboles de comportamiento mínimos (secuencia, selector, condición, acción) para misiones, rivales y jefes.
   - Comportamientos de dirección (Reynolds): buscar, huir, llegar, deambular, separarse (gente, animales, bandadas).
   - Población con RUTINAS REALES: cada persona tiene casa y trabajo (en edificios reales del mundo), necesidades
     (energía, hambre, ganas de salir, plata) y un día: duerme, madruga, viaja por las calles (A*), trabaja, almuerza,
     sale a la plaza o al parque, vuelve a casa. Lo que está lejos se simula «en grueso» (barato).
   - Pilotos con física: la velocidad segura en una curva es v = √(μ·g / κ) (κ = curvatura): así frenan los rivales.
   ===================================================================== */
const IA = {
  /* curvas de respuesta (entrada 0–1 → utilidad 0–1) */
  curva: { lineal: x => clamp(x, 0, 1), cuadrada: x => clamp(x, 0, 1) ** 2, raiz: x => Math.sqrt(clamp(x, 0, 1)), inversa: x => 1 - clamp(x, 0, 1), campana: (x, c = .5, a = .25) => Math.exp(-((x - c) ** 2) / (2 * a * a)), escalon: (x, u = .5) => x >= u ? 1 : 0 },
  /* opciones: [{ id, puntaje(ctx) }] → la mejor (con un poco de azar para que no sean robots) */
  elegir(opciones, ctx, azar = Math.random, ruido = .05) { let best = null, bv = -1; for (const o of opciones) { const v = o.puntaje(ctx) + (azar() - .5) * ruido; if (v > bv) { bv = v; best = o; } } return best; },
  /* árbol de comportamiento: nodos que devuelven 'ok' | 'falla' | 'sigue' */
  secuencia: (...h) => ctx => { for (const n of h) { const r = n(ctx); if (r !== 'ok') return r; } return 'ok'; },
  selector: (...h) => ctx => { for (const n of h) { const r = n(ctx); if (r !== 'falla') return r; } return 'falla'; },
  condicion: f => ctx => f(ctx) ? 'ok' : 'falla',
  accion: f => ctx => f(ctx) || 'ok',
  /* dirección (Reynolds): devuelven una fuerza deseada [fx, fy] */
  buscar: (p, obj, vmax) => { const d = V2.resta(obj, p), L = V2.largo(d) || 1; return V2.esc(d, vmax / L); },
  huir: (p, obj, vmax) => V2.esc(IA.buscar(p, obj, vmax), -1),
  llegar: (p, obj, vmax, frena = 8) => { const d = V2.resta(obj, p), L = V2.largo(d) || 1; return V2.esc(d, Math.min(vmax, vmax * L / frena) / L); },
  deambular: (ang, r, k = .6) => { const a = ang + (r() - .5) * k; return [Math.cos(a), Math.sin(a), a]; },
  separar: (p, vecinos, radio) => { let fx = 0, fy = 0; for (const q of vecinos) { const dx = p[0] - q[0], dy = p[1] - q[1], d = Math.hypot(dx, dy); if (d > 0 && d < radio) { fx += dx / d * (radio - d) / radio; fy += dy / d * (radio - d) / radio; } } return [fx, fy]; },
  /* velocidad segura en una curva de curvatura κ (1/m) con agarre μ */
  vCurva: (kappa, mu = .9) => Math.abs(kappa) < 1e-4 ? 1e3 : Math.sqrt(mu * C.g / Math.abs(kappa))
};
/* ---------- población con rutinas ---------- */
const ACTIVIDADES = ['dormir', 'casa', 'trabajo', 'almuerzo', 'paseo', 'compras'];
class Poblacion {
  /* op: { n, centro: {x, y}, radio, semilla, red ('peaton'|'rueda') } */
  constructor(mundo, op = {}) {
    this.mundo = mundo; this.r = mulberry32(op.semilla ?? 11); this.red = mundo.red(op.red || 'rueda'); this.gente = []; const c = op.centro || { x: mundo.ancho / 2, y: mundo.alto / 2 }, R = op.radio || 700;
    const ed = mundo.edificiosEn(c.x - R, c.y - R, c.x + R, c.y + R), casas = ed.filter(e => e.k === 0 || e.k === 1 || e.k === 2 || e.k === 15), trabajos = ed.filter(e => [3, 4, 5, 7, 8, 13].includes(e.k)), plazas = mundo.lugares.filter(l => Math.hypot(l.x - c.x, l.y - c.y) < R * 1.5);
    const punto = e => { const q = this.red.cercana(e.x, e.y, 120); return q ? { x: q.x, y: q.y, nodo: q.arista.a } : null; };
    for (let i = 0; i < (op.n || 40) && casas.length; i++) {
      const casa = punto(casas[(this.r() * casas.length) | 0]), trab = trabajos.length ? punto(trabajos[(this.r() * trabajos.length) | 0]) : casa, ocio = plazas.length ? punto(plazas[(this.r() * plazas.length) | 0]) : casa; if (!casa) continue;
      const madruga = 300 + this.r() * 120, sale = madruga + 540 + this.r() * 90;
      this.gente.push({ id: i, casa, trabajo: trab || casa, ocio: ocio || casa, x: casa.x, y: casa.y, a: 0, v: 1.2 + this.r() * .4, horario: { despierta: madruga, entra: madruga + 90, sale, duerme: 1320 + this.r() * 80 }, nec: { energia: 1, hambre: .2, salir: .3 }, act: 'dormir', ruta: null, s: 0, visible: false, semilla: (this.r() * 1e6) | 0, fase: this.r() * 9, aspecto: null });
    }
  }
  /* qué quiere hacer cada uno ahora (utilidad sobre necesidades y horario) */
  _decidir(p, min) {
    const H = p.horario, enHora = (a, b) => min >= a && min < b, finde = this.finDeSemana;
    const ops = [
      { id: 'dormir', puntaje: () => (min >= H.duerme || min < H.despierta) ? 1 : IA.curva.inversa(p.nec.energia) * .9 },
      { id: 'trabajo', puntaje: () => !finde && enHora(H.entra, H.sale) && !enHora(720, 780) ? .95 : 0 },
      { id: 'almuerzo', puntaje: () => enHora(720, 790) ? .7 + p.nec.hambre * .3 : p.nec.hambre * .5 },
      { id: 'paseo', puntaje: () => (enHora(H.sale, H.duerme) || (finde && enHora(600, H.duerme))) ? .45 + p.nec.salir * .4 : 0 },
      { id: 'casa', puntaje: () => .3 }
    ];
    return IA.elegir(ops, p, this.r, .04).id;
  }
  _destino(p, act) { return act === 'trabajo' ? p.trabajo : act === 'paseo' || act === 'almuerzo' ? p.ocio : p.casa; }
  /* un paso: dt en s reales; reloj del mundo; (cx, cy) donde está la cámara: lo cercano se mueve paso a paso */
  paso(dt, reloj, cx, cy, radioVisible = 450) {
    const min = reloj.min, dtJuego = dt * (reloj.vel || 1) * 60; this.finDeSemana = reloj.dia === 0 || reloj.dia === 6 || reloj.domingo;
    for (const p of this.gente) {
      p.nec.energia = clamp(p.nec.energia + (p.act === 'dormir' ? .00004 : -.000012) * dtJuego, 0, 1); p.nec.hambre = clamp(p.nec.hambre + (p.act === 'almuerzo' ? -.0004 : .00001) * dtJuego, 0, 1); p.nec.salir = clamp(p.nec.salir + (p.act === 'paseo' ? -.0002 : .00001) * dtJuego, 0, 1);
      const quiere = this._decidir(p, min);
      if (quiere !== p.act) { p.act = quiere; const d = this._destino(p, quiere); if (d && (Math.hypot(d.x - p.x, d.y - p.y) > 15)) { const a = this.red.cercana(p.x, p.y, 120); p.ruta = a ? this.red.camino(a.arista.a, d.nodo) : null; p.tramo = 0; p.s = 0; p.dest = d; } }
      const cerca = Math.hypot(p.x - cx, p.y - cy) < radioVisible;
      if (p.ruta && p.ruta.length) {
        let avanza = p.v * dt * (cerca ? 1 : (reloj.vel || 1) * 8);   // lejos: se mueve en grueso (más rápido, sin detalle)
        while (avanza > 0 && p.tramo < p.ruta.length) { const t = p.ruta[p.tramo], L = t.arista.largo, falta = L - p.s; if (avanza < falta) { p.s += avanza; avanza = 0; } else { avanza -= falta; p.tramo++; p.s = 0; } }
        if (p.tramo >= p.ruta.length) { p.ruta = null; p.x = p.dest.x; p.y = p.dest.y; }
        else { const t = p.ruta[p.tramo], s = t.adelante ? p.s : t.arista.largo - p.s, q = t.arista.t.at(s, 1.6); p.x = q.x; p.y = q.y; p.a = q.a + (t.adelante ? 0 : Math.PI); p.fase += dt * p.v * 1.8; }
      }
      p.visible = cerca && (p.ruta != null || p.act === 'paseo');   // dentro de casa o del trabajo no se ven
    }
    return this.gente.filter(p => p.visible);
  }
  resumen() { const c = {}; for (const p of this.gente) c[p.act] = (c[p.act] || 0) + 1; return c; }
}
Object.assign(MC, { IA, Poblacion, ACTIVIDADES });

/* ---- js/26-urbe.js ---- */
/* =====================================================================
   URBE · simulación de ciudad a la manera de SimCity y Cities: Skylines (sobre el mapa real o uno inventado)
   - CAMPOS (rejilla de 40 m): valor del suelo, ruido, contaminación, verde, cobertura de servicios y acceso al
     transporte. El valor sube con parques, agua, servicios, transporte y calles cerca; baja con ruido y contaminación
     (como el «land value» y la «desirability» de SimCity 4 y Cities: Skylines). Se ven como capas de datos encima.
   - ZONAS en celdas de 8 m pegadas a las calles (hasta 4 de fondo): residencial (R), comercial (C), industrial (I)
     y oficinas (O), en densidad baja o alta. Los lotes crecen solos donde hay demanda y valor, mirando a la calle.
   - DEMANDA RCI: las casas necesitan empleos; los comercios, clientes; la industria, comercio y trabajadores. La
     ciudad real se toma en equilibrio con un leve crecimiento: la demanda responde a lo que el jugador cambia.
   - NIVELES: con buen valor del suelo un edificio sube de nivel (más pisos), como en Cities: Skylines.
   - RECURSOS (la idea de GlassBox, el motor de SimCity 2013): energía y agua tienen capacidad; si no alcanzan, la
     ciudad no crece. Servicios con radio: parque, policía, bomberos, salud, colegio, biblioteca, estación.
   - PRESUPUESTO en el libro de partida doble: predial por lote (avalúo × tarifa) y gastos de mantenimiento.
   Determinista: mismas acciones, misma ciudad.
   ===================================================================== */
const ZONAS_URBE = {
  R: { n: 'Residencial', color: '#43a047', clase: 'casa', umbral: 15, tarifa: .007 }, C: { n: 'Comercial', color: '#1e88e5', clase: 'comercio', umbral: 28, tarifa: .009 },
  I: { n: 'Industrial', color: '#f9a825', clase: 'nave', umbral: 5, tarifa: .01 }, O: { n: 'Oficinas', color: '#8e24aa', clase: 'oficina', umbral: 40, tarifa: .009 }
};
const SERVICIOS_URBE = {
  parque: { n: 'Parque', icono: '🌳', radio: 320, costo: 30000000, mes: 1500000 }, policia: { n: 'Estación de policía', icono: '🚓', radio: 900, costo: 120000000, mes: 9000000 },
  bomberos: { n: 'Bomberos', icono: '🚒', radio: 1000, costo: 120000000, mes: 9000000 }, salud: { n: 'Centro de salud', icono: '🏥', radio: 1100, costo: 200000000, mes: 15000000 },
  colegio: { n: 'Colegio', icono: '🏫', radio: 800, costo: 150000000, mes: 12000000 }, biblioteca: { n: 'Biblioteca', icono: '📚', radio: 900, costo: 90000000, mes: 5000000 },
  estacion: { n: 'Estación de transporte', icono: '🚉', radio: 600, costo: 250000000, mes: 10000000 },
  energia: { n: 'Planta de energía solar', icono: '☀️', capacidad: 8000, costo: 300000000, mes: 8000000 }, agua: { n: 'Planta de agua', icono: '💧', capacidad: 10000, costo: 250000000, mes: 7000000 }
};
const RUIDO_VIA = { 1: .35, 2: .8, 3: 1, 4: .6, 5: 0, 6: 0, 7: 0, 8: 0 };
/* distancia (en celdas) a lo marcado, con la transformada «chamfer» de dos pasadas */
function distanciaRejilla(mask, w, h) {
  const D = new Float32Array(w * h), INF = 1e9; for (let i = 0; i < w * h; i++) D[i] = mask[i] ? 0 : INF; const a = 1, b = Math.SQRT2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; let v = D[i]; if (x > 0) v = Math.min(v, D[i - 1] + a); if (y > 0) { v = Math.min(v, D[i - w] + a); if (x > 0) v = Math.min(v, D[i - w - 1] + b); if (x < w - 1) v = Math.min(v, D[i - w + 1] + b); } D[i] = v; }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; let v = D[i]; if (x < w - 1) v = Math.min(v, D[i + 1] + a); if (y < h - 1) { v = Math.min(v, D[i + w] + a); if (x < w - 1) v = Math.min(v, D[i + w + 1] + b); if (x > 0) v = Math.min(v, D[i + w - 1] + b); } D[i] = v; }
  return D;
}
function desenfocar(F, w, h, r, pasadas = 2) { const T = new Float32Array(F.length); for (let p = 0; p < pasadas; p++) { for (let y = 0; y < h; y++) { let s = 0; for (let x = -r; x <= r; x++) s += F[y * w + clamp(x, 0, w - 1)]; for (let x = 0; x < w; x++) { T[y * w + x] = s / (2 * r + 1); s += F[y * w + Math.min(w - 1, x + r + 1)] - F[y * w + Math.max(0, x - r)]; } } for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += T[clamp(y, 0, h - 1) * w + x]; for (let y = 0; y < h; y++) { F[y * w + x] = s / (2 * r + 1); s += T[Math.min(h - 1, y + r + 1) * w + x] - T[Math.max(0, y - r) * w + x]; } } } return F; }
const ZONA_DE_CLASE = c => /casa|edificio|torre|apart|residen/.test(c) ? 'R' : /comerc|local|tienda|mercado/.test(c) ? 'C' : /nave|indust|bodega|fabric/.test(c) ? 'I' : /oficina|civico|salud|educ|transporte|gobierno/.test(c) ? 'O' : null;
class Urbe {
  constructor(mundo, op = {}) {
    const M = this.mundo = mundo; this.paso = op.paso || 40; this.op = op;
    const c = op.centro || { x: M.ancho / 2, y: M.alto / 2 }, caja = op.caja || (M.ancho * M.alto < 6e7 ? [0, 0, M.ancho, M.alto] : [c.x - 1500, c.y - 1500, c.x + 1500, c.y + 1500]);
    this.x0 = Math.max(0, caja[0]); this.y0 = Math.max(0, caja[1]); this.x1 = Math.min(M.ancho, caja[2]); this.y1 = Math.min(M.alto, caja[3]);
    this.w = Math.max(2, Math.ceil((this.x1 - this.x0) / this.paso)); this.h = Math.max(2, Math.ceil((this.y1 - this.y0) / this.paso)); const n = this.w * this.h;
    this.C = { valor: new Float32Array(n), ruido: new Float32Array(n), contaminacion: new Float32Array(n), verde: new Float32Array(n), servicios: new Float32Array(n), transporte: new Float32Array(n), dVia: null, dAgua: null };
    this.zonas = new Map(); this.lotes = []; this.servicios = []; this.libro = op.libro || new Libro(); this.mes = 0; this.version = 0; this.alCambiar = op.alCambiar || null;
    this.impuesto = Object.fromEntries(Object.entries(ZONAS_URBE).map(([k, z]) => [k, z.tarifa])); this.cobertura = {};
    this._fijos(); this.censar(); this.calcular(); const d0 = this._demandaCruda(); this._base = { R: .25 - d0.R, C: .12 - d0.C, I: .06 - d0.I, O: .06 - d0.O };   // la ciudad real, en equilibrio con un leve crecimiento
    this.recursos = { energia: { cap: (this.pob + this.empleos() * .5) * 1.15, uso: 0 }, agua: { cap: (this.pob + this.empleos() * .5) * 1.15, uso: 0 } };
  }
  /* celda de campo de un punto */
  _i(x, y) { const i = Math.floor((x - this.x0) / this.paso), j = Math.floor((y - this.y0) / this.paso); return i < 0 || j < 0 || i >= this.w || j >= this.h ? -1 : j * this.w + i; }
  _centro(i) { return [this.x0 + (i % this.w + .5) * this.paso, this.y0 + (Math.floor(i / this.w) + .5) * this.paso]; }
  /* lo que no cambia: distancia a las vías y al agua, ruido de las vías, verde del suelo, parques reales y estaciones */
  _fijos() {
    const M = this.mundo, w = this.w, h = this.h, n = w * h, via = new Uint8Array(n), agua = new Uint8Array(n), ruido = new Float32Array(n), verde = new Float32Array(n);
    for (const v of M.vias()) { const P = v.p, kr = RUIDO_VIA[v.k] ?? .3; for (let j = 0; j + 3 < P.length; j += 2) { const L = Math.hypot(P[j + 2] - P[j], P[j + 3] - P[j + 1]), m = Math.max(1, Math.ceil(L / (this.paso / 2))); for (let t = 0; t <= m; t++) { const i = this._i(P[j] + (P[j + 2] - P[j]) * t / m, P[j + 1] + (P[j + 3] - P[j + 1]) * t / m); if (i >= 0) { via[i] = 1; ruido[i] = Math.max(ruido[i], kr); } } } }
    for (let i = 0; i < n; i++) { const [x, y] = this._centro(i), tt = M.suelo(x, y); if (tt === TT.WATER || tt === TT.CANAL) agua[i] = 1; if (tt === TT.GRASS || tt === TT.MOUNT) verde[i] = tt === TT.MOUNT ? .55 : .3; }
    this.C.dVia = distanciaRejilla(via, w, h).map(d => d * this.paso); this.C.dAgua = distanciaRejilla(agua, w, h).map(d => d * this.paso);
    this._ruidoVias = desenfocar(ruido, w, h, 1, 2); this._verdeBase = desenfocar(verde, w, h, 1, 1);
    const parques = (M.lugares || []).filter(L => /parque|plaza|z[oó]calo/i.test(L.nombre || '')).map(L => ({ x: L.x, y: L.y }));
    const est = []; const T = M.transporte || {}; for (const l of T.lineas || []) for (const e of l.est || []) { const q = l.T && l.T.at ? l.T.at(e.s) : e; if (q) est.push({ x: q.x, y: q.y }); } for (const e of T.encicla || []) est.push({ x: e.x, y: e.y });
    /* lo fijo de verde, transporte y contaminación (los parques y estaciones reales, la industria que ya existe) se calcula una vez */
    this._verdeFijo = new Float32Array(n); this._transFijo = new Float32Array(n); this._contFija = new Float32Array(n);
    for (let i = 0; i < n; i++) { const [x, y] = this._centro(i); let v = this._verdeBase[i]; for (const p of parques) { const d = Math.hypot(p.x - x, p.y - y); if (d < 700) v += Math.exp(-d / 160); } this._verdeFijo[i] = v; let tr = 0; for (const s2 of est) { const d = Math.hypot(s2.x - x, s2.y - y); if (d < 1600) tr = Math.max(tr, Math.exp(-d / 380)); } this._transFijo[i] = tr; }
    for (const e of M.edificiosEn(this.x0, this.y0, this.x1, this.y1)) if (ZONA_DE_CLASE(e.clase || '') === 'I') { const i = this._i(e.x, e.y); if (i >= 0) this._contFija[i] += .5; }
  }
  /* población y empleos de lo que ya existe (huellas reales) */
  censar() {
    let pob = 0; const emp = { C: 0, I: 0, O: 0 }; this.existentes = 0;
    for (const e of this.mundo.edificiosEn(this.x0, this.y0, this.x1, this.y1)) { if (e.agregado) continue; const z = ZONA_DE_CLASE(e.clase || ''), area = 4 * e.hw * e.hd * (e.pis || 1); this.existentes++; if (z === 'R') pob += area / 28; else if (z === 'C') emp.C += area / 22; else if (z === 'I') emp.I += area / 60; else if (z === 'O') emp.O += area / 18; }
    this.pob = Math.round(pob); this.emp = emp; return { pob: this.pob, empleos: this.empleos() };
  }
  empleos() { return this.emp.C + this.emp.I + this.emp.O; }
  /* sin recortar: la demanda responde a los cambios respecto de la ciudad de partida */
  _demandaCruda() { const pob = Math.max(1, this.pob), trab = pob * .45, emp = this.empleos(), s0 = this._escala || (this._escala = { R: Math.max(200, trab * .3), X: Math.max(60, pob * .05) }); return { R: (emp * 1.05 - trab) / s0.R, C: (pob * .12 - this.emp.C) / s0.X, I: (this.emp.C * .9 + pob * .05 - this.emp.I) / s0.X, O: (pob * .1 - this.emp.O) / s0.X }; }
  /* demanda RCI (−1 a 1) */
  demanda() { const d = this._demandaCruda(), b = this._base || { R: 0, C: 0, I: 0, O: 0 }; return { R: clamp(d.R + b.R, -1, 1), C: clamp(d.C + b.C, -1, 1), I: clamp(d.I + b.I, -1, 1), O: clamp(d.O + b.O, -1, 1) }; }
  /* recalcula los campos (llámalo al cambiar zonas, lotes o servicios) */
  calcular() {
    const C = this.C, w = this.w, h = this.h, n = w * h, pq = this.servicios.filter(s => s.tipo === 'parque'), es = this.servicios.filter(s => s.tipo === 'estacion'), sv = this.servicios.filter(s => SERVICIOS_URBE[s.tipo].radio && s.tipo !== 'parque' && s.tipo !== 'estacion');
    const cont = Float32Array.from(this._contFija), ruido = Float32Array.from(this._ruidoVias);
    for (const L of this.lotes) { const i = this._i(L.x, L.y); if (i < 0) continue; if (L.tipo === 'I') { cont[i] += 1; ruido[i] = Math.max(ruido[i], .7); } else if (L.tipo === 'C') ruido[i] = Math.max(ruido[i], .35); }
    desenfocar(cont, w, h, 3, 2); desenfocar(ruido, w, h, 1, 1);
    const cober = {}; for (const t of ['policia', 'bomberos', 'salud', 'colegio', 'biblioteca']) cober[t] = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const [x, y] = this._centro(i); let v = this._verdeFijo[i]; for (const p of pq) v += Math.exp(-Math.hypot(p.x - x, p.y - y) / 160); C.verde[i] = clamp(v, 0, 1.5) / 1.5;
      let tr = this._transFijo[i]; for (const s of es) tr = Math.max(tr, Math.exp(-Math.hypot(s.x - x, s.y - y) / 380)); C.transporte[i] = tr;
      let sm = 0; for (const s of sv) { const cv = 1 - Math.hypot(s.x - x, s.y - y) / SERVICIOS_URBE[s.tipo].radio; if (cv > cober[s.tipo][i]) cober[s.tipo][i] = cv; } for (const t in cober) sm += cober[t][i]; C.servicios[i] = sm / 5;
      C.contaminacion[i] = clamp(cont[i] * 1.6, 0, 1); C.ruido[i] = clamp(ruido[i], 0, 1);
      C.valor[i] = clamp(22 + 14 * Math.exp(-C.dVia[i] / 60) + 26 * C.verde[i] + 14 * Math.exp(-C.dAgua[i] / 140) + 22 * C.servicios[i] + 14 * C.transporte[i] - 38 * C.contaminacion[i] - 14 * C.ruido[i], 0, 100);
    }
    this.cobertura = cober; this.version++; return this;
  }
  valorEn(x, y) { const i = this._i(x, y); return i < 0 ? 0 : this.C.valor[i]; }
  campoEn(nombre, x, y) { const i = this._i(x, y), F = this.C[nombre]; return i < 0 || !F ? 0 : F[i]; }
  /* ZONIFICAR: celdas de 8 m pegadas a las calles, hasta 4 de fondo, dentro del círculo (x, y, r) */
  zonificar(tipo, x, y, r = 120, dens = 'baja') {
    if (!ZONAS_URBE[tipo]) return 0; const M = this.mundo; let n = 0; const { G, C } = M._rejillaVias(), VV = M.vias(), vis = new Set();
    for (let gy = Math.floor((y - r) / C); gy <= Math.floor((y + r) / C); gy++) for (let gx = Math.floor((x - r) / C); gx <= Math.floor((x + r) / C); gx++) { const a = G.get(gx * 65536 + gy); if (a) for (let q = 0; q < a.length; q += 2) vis.add(a[q]); }
    for (const vi of vis) { const v = VV[vi]; if (v.k === VIA.CICLO || v.k === VIA.SENDERO || v.k === VIA.ESCALAS || v.k === VIA.AUTOPISTA) continue; const P = v.p, anc = (v.ancho || 8) / 2;
      for (let j = 0; j + 3 < P.length; j += 2) { const ax = P[j], ay = P[j + 1], L = Math.hypot(P[j + 2] - ax, P[j + 3] - ay), a = Math.atan2(P[j + 3] - ay, P[j + 2] - ax), nx = -Math.sin(a), ny = Math.cos(a);
        for (let s = 4; s < L; s += 8) for (const ld of [1, -1]) for (let k = 0; k < 4; k++) {
          const cx = ax + Math.cos(a) * s + nx * ld * (anc + 4 + 8 * k), cy = ay + Math.sin(a) * s + ny * ld * (anc + 4 + 8 * k); if (Math.hypot(cx - x, cy - y) > r || !M.dentro(cx, cy)) continue;
          const key = Math.round(cx / 4) * 65536 + Math.round(cy / 4); if (this.zonas.has(key)) { const z0 = this.zonas.get(key); if (!z0.lote) { z0.tipo = tipo; z0.dens = dens; } continue; }
          const tt = M.suelo(cx, cy); if (tt === TT.WATER || tt === TT.CANAL || M.edificioEn(cx, cy, 2) || M.pendiente(cx, cy, a, 8) > .3) continue;
          this.zonas.set(key, { tipo, dens, x: cx, y: cy, a, lado: ld, fondo: k, lote: null }); n++;
        } } }
    this.version++; return n;
  }
  quitarZonas(x, y, r) { let n = 0; for (const [k, z] of this.zonas) if (!z.lote && Math.hypot(z.x - x, z.y - y) <= r) { this.zonas.delete(k); n++; } this.version++; return n; }
  /* un servicio en (x, y): cobra la construcción y queda en el presupuesto mensual */
  servicio(tipo, x, y, cuenta = 'alcaldia') {
    const S = SERVICIOS_URBE[tipo]; if (!S) return null; if (!this.libro.mover(cuenta, 'contratistas', S.costo, 'Construcción: ' + S.n)) return null;
    const s = { tipo, x, y, n: S.n }; this.servicios.push(s); if (S.capacidad) this.recursos[tipo].cap += S.capacidad; this.calcular(); MC.emit('urbe', { tipo: 'servicio', s }); return s;
  }
  /* avanza «meses»: demanda, crecimiento, niveles, recursos y presupuesto */
  avanzar(meses = 1) {
    const M = this.mundo; let nuevos = 0, suben = 0;
    for (let m = 0; m < meses; m++) {
      this.mes++; const D = this.demanda(), uso = this.pob + this.empleos() * .5; this.recursos.energia.uso = uso; this.recursos.agua.uso = uso;
      const recurso = Math.min(1, this.recursos.energia.cap / Math.max(1, uso), this.recursos.agua.cap / Math.max(1, uso));
      const cand = []; for (const z of this.zonas.values()) if (!z.lote && D[z.tipo] > .05 && this.valorEn(z.x, z.y) >= ZONAS_URBE[z.tipo].umbral) cand.push(z);
      cand.sort((p, q) => this.valorEn(q.x, q.y) - this.valorEn(p.x, p.y) || p.fondo - q.fondo || p.x - q.x);
      const cupo = { R: Math.ceil(6 * Math.max(0, D.R) * recurso), C: Math.ceil(4 * Math.max(0, D.C) * recurso), I: Math.ceil(3 * Math.max(0, D.I) * recurso), O: Math.ceil(3 * Math.max(0, D.O) * recurso) };
      for (const z of cand) { if (cupo[z.tipo] <= 0) continue; const L = this._lote(z); if (L) { cupo[z.tipo]--; nuevos++; } }
      /* subir de nivel: el valor del suelo alrededor manda (como los niveles 1–5 de Cities: Skylines) */
      for (const L of this.lotes) { const v = this.valorEn(L.x, L.y), obj = 1 + (v >= 80) + (v >= 65) + (v >= 50) + (v >= 35); if (obj > L.nivel && L.tipo !== 'I' && recurso >= 1 && h2(L.x | 0, this.mes, 5) < .35) { L.nivel++; L.e.pis += L.dens === 'alta' ? 2 : 1; L.e.h = Mundo.altoEdificio(L.e.k, L.e.pis); this._sumar(L, L.area * (L.dens === 'alta' ? 2 : 1)); suben++; this._avisar(L); } }
      this._presupuesto();
    }
    if (nuevos || suben) this.calcular(); return { nuevos, suben, demanda: this.demanda(), pob: this.pob, empleos: Math.round(this.empleos()) };
  }
  _sumar(L, area) { if (L.tipo === 'R') this.pob += Math.round(area / 28); else if (L.tipo === 'C') this.emp.C += area / 22; else if (L.tipo === 'I') this.emp.I += area / 60; else this.emp.O += area / 18; }
  _avisar(L) { if (this.alCambiar) this.alCambiar(L.x - 30, L.y - 30, L.x + 30, L.y + 30); }
  /* crea el lote y su edificio mirando a la calle (ancho a lo largo de la vía, fondo hacia adentro) */
  _lote(z) {
    const M = this.mundo, alta = z.dens === 'alta', T = z.tipo, frente = T === 'I' ? 16 : alta ? 14 : T === 'C' ? 10 : 8, fondo = T === 'I' ? 20 : alta ? 16 : 12, ux = Math.cos(z.a), uy = Math.sin(z.a), nx = -uy * z.lado, ny = ux * z.lado;
    const cx = z.x + nx * (fondo / 2 - 4), cy = z.y + ny * (fondo / 2 - 4);
    for (const [px, py] of [[0, 0], [frente / 2, fondo / 2], [-frente / 2, fondo / 2], [frente / 2, -fondo / 2], [-frente / 2, -fondo / 2]]) { const x = cx + ux * px + nx * py, y = cy + uy * px + ny * py; if (!M.dentro(x, y) || M.edificioEn(x, y, .8) || M.suelo(x, y) === TT.WATER) return null; }
    const v = this.valorEn(cx, cy), pis = T === 'I' ? 2 : T === 'R' ? (alta ? 3 + Math.floor(v / 14) : 1 + (v > 45)) : T === 'C' ? (alta ? 3 + Math.floor(v / 18) : 1 + (v > 50)) : 4 + Math.floor(v / 12);
    const e = M.agregarEdificio({ x: cx, y: cy, hw: frente / 2 - .5, hd: fondo / 2 - .5, ang: z.a, pis, clase: ZONAS_URBE[T].clase, k: 99, urbe: T }); if (!e) return null;
    const L = { tipo: T, dens: z.dens, x: cx, y: cy, e, nivel: 1, area: (frente - 1) * (fondo - 1) * pis, zona: z }; this.lotes.push(L);
    for (const q of this.zonas.values()) if (!q.lote && Math.hypot(q.x - cx, q.y - cy) < Math.max(frente, fondo) / 2 + 2) q.lote = L; z.lote = L;
    this._sumar(L, L.area); this._avisar(L); MC.emit('urbe', { tipo: 'lote', L }); return L;
  }
  /* predial (avalúo por m² según el valor del suelo × tarifa anual / 12) y mantenimiento de los servicios */
  _presupuesto() {
    let ing = 0; for (const L of this.lotes) { const aval = 1000000 + 40000 * this.valorEn(L.x, L.y); ing += L.area * aval * 100 * (this.impuesto[L.tipo] || .008) / 12; }
    ing += this.pob * 150000;   // otros recaudos (industria y comercio, vehículos…): $1.500 por habitante al mes
    ing = Math.round(ing); if (ing > 0) this.libro.mover('ciudadanos', 'alcaldia', ing, 'Recaudo del mes ' + this.mes, false);
    let gas = 0; for (const s of this.servicios) gas += SERVICIOS_URBE[s.tipo].mes; if (gas) this.libro.mover('alcaldia', 'contratistas', gas, 'Mantenimiento del mes ' + this.mes, false);
    this.ultimoMes = { ingresos: ing, gastos: gas };
  }
  /* las capas de información para MC.Vistas: E.capaInfo = urbe.capa('valor' | 'ruido' | 'contaminacion' | 'verde' | 'servicios' | 'transporte' | 'zonas') */
  capa(nombre) {
    const U = this, TIT = { valor: 'Valor del suelo', ruido: 'Ruido', contaminacion: 'Contaminación', verde: 'Verde', servicios: 'Servicios', transporte: 'Transporte', zonas: 'Zonas' }, css = c => 'rgb(' + c.join(',') + ')';   // 2.5.1: cada capa trae su leyenda (auditoría de Gemini)
    if (nombre === 'zonas') return { nombre, titulo: TIT.zonas, leyenda: Object.values(ZONAS_URBE).map(z => [z.color, z.n]), dibujar(g, a, b, c, d, e, f, D) { if (D.z < .5) return; g.save(); for (const z of U.zonas.values()) { if (z.lote) continue; const [x, y] = D.pr(z.x, z.y, 0), s = Math.max(2, D.z * 6.5); g.fillStyle = ZONAS_URBE[z.tipo].color + (z.dens === 'alta' ? 'aa' : '66'); g.fillRect(x - s / 2, y - s * .5 * (D.P.k || 1), s, s * (D.P.k || 1)); } g.restore(); } };
    const PAL = { valor: [[200, 40, 40], [240, 200, 60], [40, 170, 80]], ruido: [[0, 0, 0], [250, 150, 40], [160, 30, 160]], contaminacion: [[0, 0, 0], [170, 120, 50], [90, 60, 30]], verde: [[0, 0, 0], [120, 200, 90], [20, 120, 50]], servicios: [[0, 0, 0], [80, 160, 240], [30, 70, 200]], transporte: [[0, 0, 0], [240, 200, 60], [230, 90, 40]] }[nombre];
    if (!PAL || !this.C[nombre]) return null; let cv = null, ver = -1;
    const hacer = () => { const F = U.C[nombre], w = U.w, h = U.h; cv = lienzo(w, h); if (!cv) return; const g2 = cv.getContext('2d'), img = g2.createImageData(w, h), D = img.data, esValor = nombre === 'valor';
      for (let i = 0; i < w * h; i++) { const t = clamp(esValor ? F[i] / 100 : F[i], 0, 1), A = t < .5 ? PAL[0] : PAL[1], B = t < .5 ? PAL[1] : PAL[2], u = t < .5 ? t * 2 : (t - .5) * 2; D[4 * i] = A[0] + (B[0] - A[0]) * u; D[4 * i + 1] = A[1] + (B[1] - A[1]) * u; D[4 * i + 2] = A[2] + (B[2] - A[2]) * u; D[4 * i + 3] = esValor ? 150 : Math.round(t * 190); }
      g2.putImageData(img, 0, 0); ver = U.version; };
    const leyenda = nombre === 'valor' ? [[css(PAL[0]), 'bajo'], [css(PAL[1]), 'medio'], [css(PAL[2]), 'alto']] : [[css(PAL[1]), 'algo'], [css(PAL[2]), 'mucho']];
    return { nombre, titulo: TIT[nombre] || nombre, leyenda, dibujar(g, a, b, c, d, e, f) { if (ver !== U.version || !cv) hacer(); if (!cv) return; g.save(); g.setTransform(a, b, c, d, e, f); g.imageSmoothingEnabled = true; g.drawImage(cv, U.x0, U.y0, U.w * U.paso, U.h * U.paso); g.restore(); } };
  }
  resumen() { const D = this.demanda(); let vs = 0; for (const v of this.C.valor) vs += v; return { mes: this.mes, poblacion: this.pob, empleos: Math.round(this.empleos()), lotes: this.lotes.length, zonas: this.zonas.size, demanda: D, valorMedio: +(vs / this.C.valor.length).toFixed(1), alcaldia: this.libro.saldo('alcaldia'), recursos: this.recursos, ultimoMes: this.ultimoMes || null }; }
  /* lo que se guarda (zonas, servicios y lotes crecidos se reconstruyen con las mismas acciones) */
  guardar() { return { mes: this.mes, servicios: this.servicios.map(s => [s.tipo, Math.round(s.x), Math.round(s.y)]), lotes: this.lotes.map(L => [L.tipo, L.dens, +L.x.toFixed(1), +L.y.toFixed(1), +L.zona.a.toFixed(3), L.e.pis, L.nivel]) }; }
}
Object.assign(MC, { Urbe, ZONAS_URBE, SERVICIOS_URBE, distanciaRejilla });

/* ---- js/27-mobiliario.js ---- */
/* =====================================================================
   MOBILIARIO URBANO · los detalles que hacen que una calle parezca una calle (los «props» de Cities: Skylines)
   Sale de las vías reales con azar fijo (siempre lo mismo en el mismo lugar), con medidas reales:
   - postes de luz cada ~30 m, alternando de lado (8–10 m de alto; de noche, su charco de luz);
   - árboles de calle cada ~11 m donde la zona es arbolada (más en Laureles, menos en el centro);
   - bancas y canecas cerca de plazas y en las calles tranquilas; paraderos de bus en las avenidas cada ~350 m;
   - cebras (pasos peatonales) al llegar a los cruces de las calles; hidrantes cada ~120 m.
   Nada cae dentro de un edificio ni en el agua. Lo lejano no se genera ni se dibuja (detalle por distancia).
   ===================================================================== */
const PROPS = { poste: { h: 9 }, arbol: { h: 7 }, banca: { h: .8 }, caneca: { h: 1 }, paradero: { h: 2.6 }, hidrante: { h: .7 }, cebra: { h: 0 } };
const Mobiliario = {
  PROPS,
  /* lo de una vía (se calcula una vez) */
  deVia(mundo, v, i) {
    const C = mundo._propsVia || (mundo._propsVia = new Map()); let L = C.get(i); if (L) return L; L = [];
    if (v.k === VIA.SENDERO || v.k === VIA.ESCALAS) { C.set(i, L); return L; }
    const P = v.p, r = mulberry32(i * 2654435761 + 7), anc = (v.ancho || (v.k <= 2 ? 12 : 7)) / 2, ciclo = v.k === VIA.CICLO, peat = v.k === VIA.PEATONAL;
    let s = r() * 12, lado = 1, acum = 0; const largoV = []; for (let j = 0; j + 3 < P.length; j += 2) largoV.push(Math.hypot(P[j + 2] - P[j], P[j + 3] - P[j + 1]));
    const total = largoV.reduce((a, b) => a + b, 0), punto = d => { let j = 0; while (j < largoV.length - 1 && d > largoV[j]) { d -= largoV[j]; j++; } const t = largoV[j] ? clamp(d / largoV[j], 0, 1) : 0, ax = P[2 * j], ay = P[2 * j + 1], bx = P[2 * j + 2], by = P[2 * j + 3], a = Math.atan2(by - ay, bx - ax); return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, a }; };
    const poner = (t, d, ld, extra = 0) => { const q = punto(d), nx = -Math.sin(q.a), ny = Math.cos(q.a), off = anc + 1 + extra, x = q.x + nx * ld * off, y = q.y + ny * ld * off; if (!mundo.dentro(x, y) || mundo.suelo(x, y) === TT.WATER || mundo.edificioEn(x, y, .4)) return; L.push({ t, x, y, a: q.a, v: r() }); };
    const est = mundo.estilo ? mundo.estilo(P[0], P[1]) : { arboles: .5 }, arb = clamp(est.arboles ?? .5, 0, 1);
    if (!ciclo) for (let d = 6 + r() * 10; d < total - 4; d += 28 + r() * 6) { poner('poste', d, lado); lado = -lado; }
    for (let d = 4 + r() * 8; d < total - 3; d += 10 + r() * 3) for (const ld of [1, -1]) if (r() < arb * (ciclo ? .8 : .65)) poner('arbol', d + ld * 2, ld, ciclo ? 0 : .6);
    if (!ciclo) for (let d = 20 + r() * 30; d < total - 10; d += 55 + r() * 40) { if (peat || v.k === VIA.CALLE && r() < .35) { poner('banca', d, r() < .5 ? 1 : -1, .2); poner('caneca', d + 2.2, 1, .1); } }
    if (v.k === VIA.AVENIDA || v.k === VIA.CARRERA) for (let d = 60 + r() * 120; d < total - 20; d += 330 + r() * 60) poner('paradero', d, 1, .4);
    if (!ciclo) for (let d = 30 + r() * 60; d < total - 10; d += 110 + r() * 30) if (r() < .5) poner('hidrante', d, r() < .5 ? 1 : -1, -.2);
    if ((v.k === VIA.CALLE || v.k === VIA.CARRERA || v.k === VIA.AVENIDA) && total > 30) for (const [d, sg] of [[3.5, 1], [total - 3.5, -1]]) { const q = punto(d); if (L.some(o => o.t === 'cebra' && Math.hypot(o.x - q.x, o.y - q.y) < 4)) continue; L.push({ t: 'cebra', x: q.x, y: q.y, a: q.a, ancho: anc * 2, v: 0 }); }
    C.set(i, L); if (C.size > 6000) C.delete(C.keys().next().value); return L;
  },
  /* los props en una caja (solo de las vías que pasan por ahí) */
  en(mundo, x0, y0, x1, y1, max = 2000) {
    if (!mundo._rejillaVias) return []; const { G, C } = mundo._rejillaVias(), VV = mundo.vias(), vis = new Set(), out = [];
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const a = G.get(gx * 65536 + gy); if (a) for (let q = 0; q < a.length; q += 2) vis.add(a[q]); }
    for (const i of vis) { for (const p of Mobiliario.deVia(mundo, VV[i], i)) if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) { out.push(p); if (out.length >= max) return out; } }
    return out;
  },
  /* dibujo en las vistas 2D: cebras en el piso (antes de lo demás); el resto, de pie con su sombra de contacto */
  piso(D, L) {
    const { g, pr, z } = D; g.fillStyle = 'rgba(245,245,240,.82)';
    for (const p of L) { if (p.t !== 'cebra') continue; const c = Math.cos(p.a), s = Math.sin(p.a), n = Math.max(3, Math.round(p.ancho / 1.1)); for (let k = 0; k < n; k++) { const off = -p.ancho / 2 + (k + .5) * p.ancho / n, x = p.x - s * off, y = p.y + c * off, a0 = pr(x - c * 1.5 - s * .25, y - s * 1.5 + c * .25, 0), a1 = pr(x + c * 1.5 - s * .25, y + s * 1.5 + c * .25, 0), a2 = pr(x + c * 1.5 + s * .25, y + s * 1.5 - c * .25, 0), a3 = pr(x - c * 1.5 + s * .25, y - s * 1.5 - c * .25, 0); g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.lineTo(a3[0], a3[1]); g.fill(); } }
  },
  objeto(D, p, luces) {
    const { g, pr, z, P, noche, modo } = D, [x, y] = pr(p.x, p.y, 0), cen = modo === 'cenital', hk = cen ? 0 : P.hk;
    /* arte del juego (sprites de Gemini/ChatGPT): MC.arte.registrar(j, { prop(g, p, x, y, pxPorMetro, D) { … return true } }) */
    const fa = MC.arte.f('prop'); if (fa && fa(g, p, x, y, z, D) === true) { if (p.t === 'poste' && luces && noche > .3) luces.push([x, y, Math.max(14, z * 11)]); return; }
    if (p.t === 'arbol' && MC.estilo !== 'clasico') { const t = p._t || (p._t = { x: p.x, y: p.y, r: 1.6 + p.v * 1.2, h: 5 + p.v * 4, e: p.v < .22 ? 'guayacan_amarillo' : p.v < .4 ? 'guayacan_rosado' : p.v < .55 ? 'mango' : 'urapan', v: ((p.v * 7) | 0) % 3, espejo: p.v * 10 % 1 < .5 }); if (cen) Arboleda.arribaPantalla(D, t); else { Arboleda.sombra(D, t, D.sv || null); Arboleda.dePie(D, t); } return; }   // 2.6: árbol de calle con volumen
    if (p.t === 'arbol') { const h = 5 + p.v * 4, r = (1.6 + p.v * 1.2) * z, [, yc] = pr(p.x, p.y, h * .75); Sombras.contacto(g, x + r * .3, y + r * .15, r * .9, r * .45 * (cen ? 1 : P.k + .2), .22); if (!cen) { g.strokeStyle = '#5b4030'; g.lineWidth = Math.max(1, z * .25); g.beginPath(); g.moveTo(x, y); g.lineTo(x, yc); g.stroke(); } const cy = cen ? y : yc; g.fillStyle = noche > .3 ? '#21402c' : ['#3f7d3a', '#4b8b3f', '#356f37'][(p.v * 3) | 0]; g.beginPath(); g.arc(x, cy, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x - r * .3, cy - r * .3, r * .45, 0, TAU); g.fill(); return; }
    if (p.t === 'poste') { const [, yt] = pr(p.x, p.y, 8.5); if (!cen) { g.strokeStyle = '#4a4f58'; g.lineWidth = Math.max(1, z * .16); g.beginPath(); g.moveTo(x, y); g.lineTo(x, yt); g.stroke(); } g.fillStyle = noche > .3 ? '#ffe7b0' : '#cfd3d8'; g.beginPath(); g.arc(x, cen ? y : yt, Math.max(1.2, z * .35), 0, TAU); g.fill(); if (luces && noche > .3) luces.push([x, y, Math.max(14, z * 11)]); return; }
    const h = (PROPS[p.t] || { h: 1 }).h, w = Math.max(1.5, z * (p.t === 'paradero' ? 3 : p.t === 'banca' ? 1.6 : .5)), hh = Math.max(1, h * z * (cen ? .4 : hk));
    g.fillStyle = p.t === 'paradero' ? 'rgba(120,170,200,.85)' : p.t === 'banca' ? '#8d6e63' : p.t === 'hidrante' ? '#d8432f' : '#3d6b4f'; g.fillRect(x - w / 2, y - hh, w, hh);
    if (p.t === 'paradero') { g.fillStyle = '#2b3442'; g.fillRect(x - w / 2 - 1, y - hh - 2, w + 2, 2); }
  }
};
MC.Mobiliario = Mobiliario;

/* ---- js/28-accion-pie.js ---- */
/* MOTOR CITY · accion a pie (C-M32): máquina de estados pura, sin control de armas, reusable.
   Los guardias sólo perciben a través de una línea de visión; jamás conocen la posición actual
   después de perder contacto. El sistema de cobertura reutiliza los edificios del mundo. */
const AccionPie = {
  ver(guardia, jugador, mundo, op = {}) {
    if (!guardia || !jugador || guardia.fuera) return false;
    const dx = jugador.x - guardia.x, dy = jugador.y - guardia.y, d = Math.hypot(dx,dy);
    const rango = op.rango ?? guardia.vista ?? 24, cono = op.cono ?? guardia.cono ?? 1.05;
    if (d > rango || d < .001) return d < .001;
    const ang = Math.atan2(dy, dx), dif = Math.atan2(Math.sin(ang - guardia.a), Math.cos(ang - guardia.a));
    if (Math.abs(dif) > cono) return false;
    return !this.ocluido(mundo, guardia, jugador);
  },
  ocluido(mundo, desde, hasta) {
    if (!mundo || typeof mundo.edificioEn !== 'function') return false;
    const d = Math.hypot(hasta.x - desde.x, hasta.y - desde.y);
    const n = Math.min(64, Math.ceil(d));   /* una muestra por metro: a 3 m se saltaba muros de 2 m (relevo Claude) */
    for (let i = 1; i < n; i++) {
      const t = i / n, x = desde.x + (hasta.x-desde.x)*t, y = desde.y + (hasta.y-desde.y)*t;
      if (mundo.edificioEn(x,y,0)) return true;
    }
    return false;
  },
  /* Persecución en alarma: sólo acercarse si el jugador sigue visible. La búsqueda de
     la última posición vista ya la hace paso(). Nunca leer la posición actual a ciegas. */
  perseguir(q, jugador, mundo, dt, op = {}) {
    if (!q || !jugador || q.fuera || q.distraido > 0 || !(dt > 0))
      return { visible: false, golpe: false, movio: false };
    const radio = op.radio ?? q.vista ?? 24, alcance = op.alcance ?? 1.1, rapidez = op.rapidez ?? 4.6;
    const visible = this.ver(q, jugador, mundo, { rango: radio });
    if (!visible) return { visible: false, golpe: false, movio: false };
    q.ultima = { x: jugador.x, y: jugador.y };
    q.busquedaT = 5; q.estado = 'alerta';
    const dx = jugador.x - q.x, dy = jugador.y - q.y, d = Math.hypot(dx, dy);
    if (d <= alcance) return { visible: true, golpe: true, movio: false };
    const paso = Math.min(d-alcance, rapidez*Math.min(dt,.05));
    const nx = q.x + dx/d*paso, ny = q.y + dy/d*paso;
    if (mundo && typeof mundo.edificioEn === 'function' &&
       (mundo.edificioEn(nx,ny,0) || mundo.edificioEn((nx+q.x)/2,(ny+q.y)/2,0)))
      return { visible: true, golpe: false, movio: false };
    q.x = nx; q.y = ny; q.a = Math.atan2(dy,dx);
    return { visible: true, golpe: false, movio: true };
  },
  paso(q, dt, op = {}) {
    if (!q || q.fuera || !(dt > 0)) return { ve: false, estado: 'fuera' };
    dt = Math.min(dt, .05);
    const J = op.jugador, M = op.mundo, cebo = op.cebo, t = (q.fase = (q.fase || 0) + dt);
    const ve = !op.distraido && this.ver(q,J,M), vistaAntes = !!q.ve;
    q.ve = ve;
    if (ve) { q.ultima = {x:J.x,y:J.y}; q.busquedaT = 5; q.alerta = 1; q.estado='alerta'; }
    else if (q.busquedaT > 0) { q.busquedaT = Math.max(0,q.busquedaT-dt); q.estado='busqueda'; }
    else if (cebo && (q.distraido > 0)) q.estado='distraccion';
    else q.estado='patrulla';
    let meta=null, rapidez=0;
    if (q.estado==='alerta' && op.alarma && q.ultima) {meta=q.ultima; rapidez=2.4;}
    else if (q.estado==='busqueda' && q.ultima) {meta=q.ultima; rapidez=1.55;}
    else if (q.estado==='distraccion' && cebo) {meta=cebo; rapidez=1.25;}
    else if (q.estado==='patrulla' && q.origen) {
      const fase=Math.floor(t/5)%2;
      meta={x:q.origen.x+Math.cos(q.a0||0)*(fase?4:-4),y:q.origen.y+Math.sin(q.a0||0)*(fase?4:-4)};
      rapidez=.65;
    }
    if(meta) {
      const dx=meta.x-q.x,dy=meta.y-q.y,d=Math.hypot(dx,dy);
      if(d>.6) {
        const a=Math.atan2(dy,dx), paso=Math.min(d-.5,rapidez*dt);
        const nx=q.x+Math.cos(a)*paso,ny=q.y+Math.sin(a)*paso;
        /* comprobar punto final y punto intermedio: nadie atraviesa una fachada */
        if(!M || typeof M.edificioEn!=='function'||(!M.edificioEn(nx,ny,0)&&!M.edificioEn((nx+q.x)/2,(ny+q.y)/2,0))) {q.x=nx;q.y=ny;}
        q.a=a;
      } else if(q.estado==='busqueda') q.busquedaT=Math.min(q.busquedaT,.6);
    } else if (q.origen) q.a=(q.a0||0)+Math.sin(t*.6)*.4;
    return {ve, primeraVista:ve&&!vistaAntes, estado:q.estado, x:q.x, y:q.y};
  }
};
MC.AccionPie = AccionPie;
/* ---- js/28-busqueda.js ---- */
/* =====================================================================
   BÚSQUEDA (4.0) · nivel de búsqueda de 0 a 5, policía y bandas que persiguen por calles reales
   Lo pidió el autor para el juego adulto («Noche de Cobro»): persecuciones como Reckless Getaway 2, #DRIVE, Pako y GTA
   Chinatown Wars, pero sobre la red vial real del mundo. Amplía MC.Persecucion (C-M26) sin romperla.
   - CALOR (heat 0–100, como en la biblia de Codex): sube con los delitos, más si hay testigos y si te ven;
     baja solo cuando nadie te ve (línea de visión y la luz del helicóptero). Nivel = escalones 15, 35, 55, 70 y 85 (contrato de Codex).
   - PRESUPUESTO por nivel: cuántas patrullas hay a la vez. Nacen detrás o a un costado, lejos y fuera de la vista;
     se van si quedan muy lejos. Ninguna se teletransporta delante del jugador.
   - TÁCTICAS: seguir (ruta A* por la red), cerrar (interceptar adelante), embestir (de cerca y con vista limpia, directo
     al costado). Los rivales empujan según su masa y se dañan; con la salud en cero quedan destrozados y humeando.
   - BANDOS: «policia» (sirena; dispara desde el nivel 4) y «banda» (los sicarios de una mafia ficticia; disparan
     siempre que te ven de cerca). Los disparos fallan más a mayor distancia y velocidad.
   - NIVEL 3+: púas atravesadas en la vía de adelante (pinchan las llantas) y bloqueos con dos patrullas atravesadas.
   - NIVEL 5: helicóptero con reflector; mientras estés en la luz, el calor no baja.
   - CAPTURA: una patrulla al lado y tú casi quieto durante 2,5 s.
   - ÚLTIMA POSICIÓN (contrato de Codex, «Turno Cero»): la policía solo sabe lo que ve; si te pierde de vista va a donde
     te vio por última vez y busca ahí. El CEBO ACÚSTICO (T05) la lleva a otro punto; el PULSO DE INTERFERENCIA (T08)
     apaga un rato a un rival o al helicóptero; el jugador también DISPARA (munición limitada, a los vehículos).
   Uso:
     const B = new MC.Busqueda(M); B.alerta(30, { testigos: 2, causa: 'robo' }); B.banda(2);
     cada cuadro: B.actualizar(dt, cuerpo, trafico); trafico = trafico.concat(B.vehiculos()); cuerpo.obstaculos → B.obstaculos()
     eventos (para la interfaz y el sonido): B.sacar() → [{ tipo: 'nivel'|'embestida'|'disparo'|'herido'|'pinchado'|'fuera'|'atrapado'|'perdidos'|'alerta', … }]
   ===================================================================== */
const BUSQ_UMBRAL = [0, 15, 35, 55, 70, 85], BUSQ_PRESUPUESTO = [0, 1, 2, 3, 4, 4];   /* umbrales y tope de 4 perseguidores del contrato «Turno Cero» */
const BUSQ_BANDOS = {
  policia: { n: 'Policía', color: '#16233f', sirena: true, dispara: 4, salud: 1, veh: 'patrulla', agresion: .7 },
  banda: { n: 'Banda', color: '#151515', sirena: false, dispara: 0, salud: .8, veh: 'banda_suv', agresion: 1 }
};
class Busqueda {
  constructor(mundo, op = {}) {
    this.mundo = mundo; this.heat = clamp(op.heat || 0, 0, 100); this.nivel = 0; this.rivales = []; this.puas = []; this.heli = null; this.disparos = []; this.eventos = [];
    this.t = 0; this.sinContacto = 0; this.visto = false; this.capturaT = 0; this.estado = 'libre'; this.pinchado = false; this.danio = 0; this.ultima = null; this.cebo = null; this._n = 0; this._nacerT = 0; this._puasT = 0; this._bloqT = 0; this._vistaT = 0;
    this.op = Object.assign({ disipacion: 2.4, radioVista: 110, radioNacer: [75, 170], lejos: 420, captura: 2.5, semilla: 7 }, op);
    this._s = (this.op.semilla * 9301 + 49297) % 233280;
    Busqueda.vehiculos();
  }
  /* los vehículos de los rivales (se registran una vez, sobre el carro base del motor) */
  static vehiculos() {
    const V = MC.Vehiculos; if (V.lista.has('patrulla')) return;
    V.registrar({ id: 'patrulla', n: 'Patrulla', de: 'carro', icon: '🚓', vmax: 36, acc: 4.6, freno: 8, masa: 1700, color: '#16233f', juegos: ['*'], publico: true });
    V.registrar({ id: 'banda_suv', n: 'Camioneta de la banda', de: 'carro', icon: '🚙', vmax: 34, acc: 4.2, freno: 7, masa: 2200, ancho: 1.95, largo: 4.8, color: '#151515', juegos: ['*'], publico: true });
  }
  _r() { return (this._s = (this._s * 9301 + 49297) % 233280) / 233280; }
  _ev(tipo, o = {}) { const e = Object.assign({ tipo, t: this.t }, o); this.eventos.push(e); if (this.eventos.length > 40) this.eventos.shift(); return e; }
  /* saca los eventos pendientes (la interfaz los muestra una vez) */
  sacar() { const E = this.eventos; this.eventos = []; return E; }
  nivelDe(h) { let n = 0; for (let i = 1; i < BUSQ_UMBRAL.length; i++) if (h >= BUSQ_UMBRAL[i]) n = i; return n; }
  /* un delito o una señal: gravedad × testigos × visibilidad */
  alerta(gravedad, op = {}) { const { testigos = 1, visible = true, causa = '' } = op, d = gravedad * Math.max(.3, testigos) * (visible ? 1 : .4); this.heat = clamp(this.heat + d, 0, 100); if (causa) this._ev('alerta', { causa, d: Math.round(d) }); this._nivel(); return this.nivel; }
  /* poner el calor en un nivel exacto (una escena de la historia) */
  ponerNivel(n) { this.heat = n > 0 ? BUSQ_UMBRAL[clamp(n, 0, 5)] + 6 : 0; this.sinContacto = 0; this._nivel(); }
  _nivel() { const n = this.nivelDe(this.heat); if (n !== this.nivel) { const sube = n > this.nivel; this.nivel = n; this._ev('nivel', { nivel: n, sube }); if (n === 0) { this._ev('perdidos'); for (const r of this.rivales) if (r.bando === 'policia') r.retirada = true; this.heli = null; this.puas.length = 0; } } }
  /* esconderse (garaje, metro, pintura nueva): la policía te pierde */
  esconder(motivo = 'escondite') { this.heat = 0; this.sinContacto = 99; this._nivel(); for (const r of this.rivales) if (r.bando === 'policia') r.retirada = true; this._ev('escondido', { motivo }); }
  /* la banda manda n carros (no depende del calor: es otra guerra) */
  banda(n = 2, op = {}) { const J = op.J || this._J; let k = 0; for (let i = 0; i < n; i++) if (this._nacer('banda', J, Object.assign({ cerca: true }, op))) k++; if (k) this._ev('banda', { n: k }); return k; }
  limpiar() { this.rivales = []; this.puas = []; this.heli = null; this.disparos = []; this.heat = 0; this.nivel = 0; this.estado = 'libre'; this.capturaT = 0; this.pinchado = false; this.danio = 0; this.ultima = null; this.cebo = null; }
  /* T05 · cebo acústico: los que no te ven van a revisar ese punto durante dur segundos */
  senuelo(x, y, dur = 9) { this.cebo = { x, y, t: dur }; for (const r of this.rivales) r.tiempoRuta = 0; this._ev('cebo', { x, y }); }
  /* T08 · pulso de interferencia: apaga 4 s al rival más cercano (o al helicóptero); sube la alerta */
  pulso(J, radio = 65) {
    let m = null, md = radio; for (const r of this.rivales) { if (r.roto || r.aturdido > 0) continue; const d = Math.hypot(r.cuerpo.x - J.x, r.cuerpo.y - J.y); if (d < md) { md = d; m = r; } }
    if (this.heli && !(this.heli.aturdido > 0) && Math.hypot(this.heli.x - J.x, this.heli.y - J.y) < radio * 1.6 && (!m || md > 30)) { this.heli.aturdido = 5; this._ev('pulso', { quien: 'helicoptero' }); this.alerta(5, { causa: 'interferencia' }); return 'helicoptero'; }
    if (!m) return null; m.aturdido = 4; this._ev('pulso', { quien: m.id, bando: m.bando, x: m.cuerpo.x, y: m.cuerpo.y }); this.alerta(5, { causa: 'interferencia' }); return m.id;
  }
  /* el jugador dispara al rival más cercano que vea (la banda primero); devuelve { id, acierto } o null */
  disparar(J, op = {}) {
    const alcance = op.alcance || 48; let m = null, md = alcance;
    for (const r of this.rivales) { if (r.roto) continue; const d = Math.hypot(r.cuerpo.x - J.x, r.cuerpo.y - J.y) - (r.bando === 'banda' ? 12 : 0); if (d < md && this.vista(J.x, J.y, r.cuerpo.x, r.cuerpo.y)) { md = d; m = r; } }
    if (!m) return null; const C = m.cuerpo, d = Math.hypot(C.x - J.x, C.y - J.y), p = clamp(.88 - d / 75 - Math.abs(J.v || 0) / 95, .2, .88), acierto = this._r() < p, err = acierto ? .4 : 2 + this._r() * 3;
    this.disparos.push({ x0: J.x, y0: J.y, x1: C.x + (this._r() - .5) * err, y1: C.y + (this._r() - .5) * err, t: 0, acierto, bando: 'jugador' });
    if (acierto) { m.salud -= op.dano || .2; if (m.salud <= 0 && !m.roto) { m.roto = true; this._ev('fuera', { id: m.id, bando: m.bando, x: C.x, y: C.y, por: 'disparo' }); } }
    if (m.bando === 'policia') this.alerta(acierto ? 12 : 7, { testigos: 1.2, causa: 'disparaste a la policía' }); else this.alerta(2.5, { testigos: .6, visible: false, causa: '' });
    return { id: m.id, acierto, bando: m.bando, x: C.x, y: C.y };
  }
  /* ¿hay línea de visión entre dos puntos? (sin edificios en medio; muestras cada 6 m) */
  vista(x0, y0, x1, y1) { const M = this.mundo, d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 6); for (let i = 1; i < n; i++) { const f = i / n; if (M.edificioEn(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, 0)) return false; } return true; }
  /* nace un rival detrás o a un costado del jugador, sobre una vía, fuera de la vista */
  _nacer(bando, J, op = {}) {
    if (!J) return null; const M = this.mundo, B = BUSQ_BANDOS[bando], ca = Math.cos(J.a || 0), sa = Math.sin(J.a || 0), [r0, r1] = op.cerca ? [55, 110] : this.op.radioNacer;
    for (let k = 0; k < 10; k++) {
      const ang = (J.a || 0) + Math.PI + (this._r() - .5) * 2.2, d = r0 + this._r() * (r1 - r0), x = J.x + Math.cos(ang) * d, y = J.y + Math.sin(ang) * d, q = M.viaCercana(x, y, 90);
      if (!q || !M.dentro(q.x, q.y)) continue; const dx = q.x - J.x, dy = q.y - J.y, dd = Math.hypot(dx, dy); if (dd < 45) continue;
      if (!op.cerca && (dx * ca + dy * sa) > 0 && this.vista(J.x, J.y, q.x, q.y)) continue;   /* delante y a la vista: no */
      const ang2 = Math.atan2(J.y - q.y, J.x - q.x), C = new MC.Cuerpo(M, { x: q.x, y: q.y, a: Math.abs(angDif(q.ang, ang2)) < Math.PI / 2 ? q.ang : q.ang + Math.PI, veh: B.veh });
      C.v = Math.min(C.vmax() * .6, Math.abs(J.v || 0) * .9 + 6);
      const r = { id: bando + '-' + (this._n++), bando, B, cuerpo: C, ruta: null, tiempoRuta: 0, tactica: ['seguir', 'cerrar', 'embestir'][this._n % 3], salud: B.salud, roto: false, humo: 0, retirada: false, fuego: 1 + this._r(), choqueT: 0 };
      this.rivales.push(r); return r;
    }
    return null;
  }
  /* púas atravesadas en la vía de adelante */
  _ponerPuas(J) { const M = this.mundo, d = 120 + this._r() * 60, q = M.viaCercana(J.x + Math.cos(J.a) * d, J.y + Math.sin(J.a) * d, 40); if (!q || this.puas.length > 3) return; this.puas.push({ x: q.x, y: q.y, a: q.ang + Math.PI / 2, largo: Math.max(6, (q.ancho || 7) * 1.1), t: 0 }); this._ev('puas'); }
  /* bloqueo: dos patrullas atravesadas en la vía de adelante */
  _bloqueo(J) {
    const M = this.mundo, d = 170 + this._r() * 60, q = M.viaCercana(J.x + Math.cos(J.a) * d, J.y + Math.sin(J.a) * d, 40); if (!q) return;
    for (const s of [-1, 1]) { const x = q.x + Math.cos(q.ang + Math.PI / 2) * s * 2.6, y = q.y + Math.sin(q.ang + Math.PI / 2) * s * 2.6, C = new MC.Cuerpo(M, { x, y, a: q.ang + Math.PI / 2 + (s > 0 ? .3 : -.3), veh: 'patrulla' }); C.v = 0;
      this.rivales.push({ id: 'bloqueo-' + (this._n++), bando: 'policia', B: BUSQ_BANDOS.policia, cuerpo: C, quieto: true, vida: 45, salud: 1.4, roto: false, humo: 0, retirada: false, fuego: 2, choqueT: 0 }); }
    this._ev('bloqueo');
  }
  actualizar(dt, J, trafico = []) {
    if (!J || !Number.isFinite(dt) || dt <= 0) return; dt = Math.min(dt, .05); this.t += dt; this._J = J; const M = this.mundo, vj = J.v || 0;
    /* ¿alguien te ve? (cada 0,25 s: línea de visión de los rivales y la luz del helicóptero) */
    if ((this._vistaT -= dt) <= 0) { this._vistaT = .25; let v = false; for (const r of this.rivales) { if (r.roto || r.retirada) continue; const C = r.cuerpo, d = Math.hypot(C.x - J.x, C.y - J.y); r.ve = d < this.op.radioVista && this.vista(C.x, C.y, J.x, J.y); if (r.ve && r.bando === 'policia') v = true; } if (this.heli && !(this.heli.aturdido > 0) && Math.hypot(this.heli.lx - J.x, this.heli.ly - J.y) < 16) v = true; this.visto = v; if (v) this.ultima = { x: J.x, y: J.y, a: J.a || 0, t: this.t }; }
    if (this.cebo && (this.cebo.t -= dt) <= 0) this.cebo = null; if (this.heli && this.heli.aturdido > 0) this.heli.aturdido -= dt;
    if (this.nivel > 0) { if (this.visto) this.sinContacto = 0; else { this.sinContacto += dt; if (this.sinContacto > 3) this.heat = Math.max(0, this.heat - this.op.disipacion * dt * (1 + this.sinContacto / 12)); } }
    this._nivel();
    /* presupuesto: nacen hasta completar el de su nivel; los lejanos se van */
    const policias = this.rivales.filter(r => r.bando === 'policia' && !r.roto && !r.retirada && !r.quieto).length;
    if ((this._nacerT -= dt) <= 0 && policias < BUSQ_PRESUPUESTO[this.nivel]) { this._nacerT = 2.2; this._nacer('policia', J); }
    if (this.nivel >= 3 && (this._puasT -= dt) <= 0) { this._puasT = 20 + this._r() * 10; if (Math.abs(vj) > 8) this._ponerPuas(J); }
    if (this.nivel >= 3 && (this._bloqT -= dt) <= 0) { this._bloqT = 28 + this._r() * 12; if (Math.abs(vj) > 8) this._bloqueo(J); }
    if (this.nivel >= 5) { if (!this.heli) this.heli = { x: J.x - 120, y: J.y - 80, z: 70, a: 0, lx: J.x, ly: J.y }; const H = this.heli, f = 1 - Math.exp(-dt * .9); H.x += (J.x - 25 - H.x) * f; H.y += (J.y - 25 - H.y) * f; H.a += dt * 9; const g = 1 - Math.exp(-dt * 1.6); H.lx += (J.x - H.lx) * g; H.ly += (J.y - H.ly) * g; }
    else this.heli = null;
    /* cada rival */
    const ca = Math.cos(J.a || 0), sa = Math.sin(J.a || 0), vjx = ca * vj, vjy = sa * vj;
    for (const r of this.rivales) {
      const C = r.cuerpo, dx = J.x - C.x, dy = J.y - C.y, d = Math.hypot(dx, dy);
      r.choqueT = Math.max(0, r.choqueT - dt);
      if (r.roto) { r.humo += dt; C.v *= Math.max(0, 1 - dt * 3); C.actualizar(dt, { acel: -1, giro: 0 }); continue; }
      if (r.aturdido > 0) { r.aturdido -= dt; C.actualizar(dt, { acel: -.25, giro: 0 }); }
      else if (r.quieto) { r.vida -= dt; C.v = 0; }
      else if (r.retirada) { C.actualizar(dt, { acel: -.6, giro: 0 }); }
      else {
        /* de cerca y con la vía libre, directo (embestir); si no, la ruta por la red */
        const directo = d < 30 && r.ve && (r.tactica === 'embestir' || r.bando === 'banda' || d < 14);
        if (directo) { const adel = r.tactica === 'cerrar' ? clamp(Math.abs(vj) * .5, 0, 8) : 0, tx = J.x + ca * adel - C.x, ty = J.y + sa * adel - C.y, L = Math.hypot(tx, ty) || 1; C.actualizar(dt, { dir: { x: tx / L, y: ty / L, m: 1 }, turbo: d > 8 }); }
        else {
          r.tiempoRuta -= dt;
          if (r.tiempoRuta <= 0) {
            /* la policía va a lo que sabe: si te ve (o alguien te ve), a ti; si no, al cebo o a donde te vio por última vez */
            const sabe = r.bando === 'banda' || this.visto || !this.ultima, adel = r.tactica === 'cerrar' ? clamp(Math.abs(vj) * 1.2, 5, 30) : 0;
            let meta = sabe && !this.cebo ? { x: J.x + ca * adel, y: J.y + sa * adel } : this.cebo ? { x: this.cebo.x, y: this.cebo.y } : { x: this.ultima.x, y: this.ultima.y };
            if (!sabe && !this.cebo && Math.hypot(C.x - meta.x, C.y - meta.y) < 18) { const g = this._r() * TAU, d2 = 40 + this._r() * 80; meta = { x: meta.x + Math.cos(g) * d2, y: meta.y + Math.sin(g) * d2 }; }   /* busca alrededor */
            const p = MC.Manejo.rutaA(M, C, meta, 'rueda'); r.ruta = Array.isArray(p) && p.length >= 4 ? p : null; r.tiempoRuta = 1.2 + (this._n % 3) * .2; }
          if (!r.ruta) C.actualizar(dt, { acel: -.4, giro: 0 });
          else { const m = MC.Manejo.pilotar(C, r.ruta, dt, { radio: 5, turbo: d > 60 }); if (m && m.atascado) r.tiempoRuta = 0; }   /* 4.0.2: piloto con mirada adelante y salida de atascos */
        }
      }
      /* contacto con el jugador: empuje por masas, daño a los dos */
      const contacto = 2.5; if (d < contacto && d > 1e-3 && r.choqueT <= 0) {
        const nx = dx / d, ny = dy / d, vcx = Math.cos(C.a) * C.v, vcy = Math.sin(C.a) * C.v, rel = (vcx - vjx) * nx + (vcy - vjy) * ny;
        if (Math.abs(rel) > 1.5) { r.choqueT = .6; const mj = (J.veh && J.veh.masa) || 1400, mr = (C.veh && C.veh.masa) || 1700, golpe = Math.abs(rel), kJ = mr / (mj + mr), kR = mj / (mj + mr);
          J.v *= 1 - clamp(golpe * .025 * kJ, 0, .5); C.v *= 1 - clamp(golpe * .03 * kR, 0, .7);
          const quien = rel > 0 ? 'rival' : 'jugador', aJ = golpe * .012 * kJ * (quien === 'rival' ? r.B.agresion : .6);   /* quien embiste recibe menos */
          this.danio += aJ; r.salud -= golpe * .045 * kR * (quien === 'jugador' ? 1.3 : .6);
          /* dónde se abolló cada uno (para los modelos 3D): el punto de contacto visto desde cada carro */
          const zona = (ax, ay, aa) => { const f = Math.cos(aa) * ax + Math.sin(aa) * ay, l = -Math.sin(aa) * ax + Math.cos(aa) * ay; return Math.abs(f) > Math.abs(l) ? (f > 0 ? 'f' : 'b') : (l > 0 ? 'l' : 'r'); };
          const zr = zona(dx, dy, C.a), zj = zona(-dx, -dy, J.a || 0); r.golpes = r.golpes || { f: 0, b: 0, l: 0, r: 0 }; r.golpes[zr] = Math.min(1, r.golpes[zr] + golpe * .03);
          this._ev('abolladura', { zona: zj, fuerza: golpe });
          this._ev('embestida', { id: r.id, bando: r.bando, quien, fuerza: golpe, x: (J.x + C.x) / 2, y: (J.y + C.y) / 2 });
          if (r.bando === 'policia' && quien === 'jugador') this.alerta(4, { causa: '' });
          if (r.salud <= 0) { r.roto = true; this._ev('fuera', { id: r.id, bando: r.bando, x: C.x, y: C.y }); if (r.bando === 'policia') this.alerta(8, { causa: 'patrulla destrozada' }); } }
        J.x += (dx / d) * (contacto - d) * .5; J.y += (dy / d) * (contacto - d) * .5;   /* nadie atraviesa a nadie */
      }
      /* disparos: la banda siempre que te ve de cerca; la policía desde su nivel */
      if (r.ve && !r.retirada && !(r.aturdido > 0) && d < 55 && (r.bando === 'banda' || this.nivel >= r.B.dispara) && (r.fuego -= dt) <= 0) {
        r.fuego = .7 + this._r() * .7; const p = clamp(.72 - d / 90 - Math.abs(vj) / 70, .1, .7), acierto = this._r() < p, err = acierto ? .6 : 2.5 + this._r() * 4, ex = (this._r() - .5) * err * 2, ey = (this._r() - .5) * err * 2;
        this.disparos.push({ x0: C.x, y0: C.y, x1: J.x + ex, y1: J.y + ey, t: 0, acierto, bando: r.bando }); this._ev('disparo', { id: r.id, bando: r.bando, acierto, x: C.x, y: C.y });
        if (acierto) { this.danio += .03; this._ev('herido', { bando: r.bando }); }
      }
    }
    this.disparos = this.disparos.filter(s => (s.t += dt) < .18);
    /* se van: destrozados viejos, en retirada lejos, lejanos de más, bloqueos vencidos */
    this.rivales = this.rivales.filter(r => { const d = Math.hypot(r.cuerpo.x - J.x, r.cuerpo.y - J.y); return !(r.roto && r.humo > 25) && !(r.retirada && d > 120) && !(d > this.op.lejos) && !(r.quieto && r.vida <= 0 && d > 60); });
    /* púas: si pasas por encima, se pinchan las llantas */
    for (const P of this.puas) { P.t += dt; const ux = Math.cos(P.a), uy = Math.sin(P.a), rx = J.x - P.x, ry = J.y - P.y, u = rx * ux + ry * uy, w = -rx * uy + ry * ux; if (!this.pinchado && Math.abs(u) < P.largo / 2 && Math.abs(w) < 1.1 && Math.abs(vj) > 2) { this.pinchado = true; this._ev('pinchado', { x: P.x, y: P.y }); } }
    this.puas = this.puas.filter(P => P.t < 60 && Math.hypot(P.x - J.x, P.y - J.y) < 500);
    /* captura: una patrulla al lado y tú casi quieto */
    let cerca = false; for (const r of this.rivales) if (r.bando === 'policia' && !r.roto && !r.retirada && Math.hypot(r.cuerpo.x - J.x, r.cuerpo.y - J.y) < 5) { cerca = true; break; }
    this.capturaT = this.nivel > 0 && cerca && Math.abs(vj) < 2 ? this.capturaT + dt : Math.max(0, this.capturaT - dt * 2);
    if (this.capturaT > this.op.captura && this.estado !== 'atrapado') { this.estado = 'atrapado'; this._ev('atrapado'); }
  }
  /* los rivales como vehículos de tráfico (las vistas 2D y 3D ya los dibujan; sirena y destrozo como banderas) */
  vehiculos() {
    return this.rivales.map(r => { const c = r.cuerpo; return { id: r.id, tipo: 'carro', clase: 'auto', x: c.x, y: c.y, a: c.a, v: c.v, largo: c.veh.largo || 4.6, ancho: c.veh.ancho || 1.85, color: r.roto ? '#2a2420' : r.B.color, sirena: r.B.sirena && !r.roto && !r.retirada && !(r.aturdido > 0), roto: r.roto, humo: r.roto ? r.humo : 0, bando: r.bando, frena: 0, dano: r.golpes || null }; });
  }
  /* para cuerpo.obstaculos: nadie atraviesa a nadie */
  obstaculos() { const L = []; for (const r of this.rivales) { const c = r.cuerpo, l = (c.veh.largo || 4.6) / 3, cs = Math.cos(c.a), sn = Math.sin(c.a); for (const k of [-1, 0, 1]) L.push({ x: c.x + cs * l * k, y: c.y + sn * l * k, r: (c.veh.ancho || 1.85) / 2 + .1, motivo: 'rival:' + r.id }); } return L; }
  /* para la interfaz: qué tan cerca está el rival más cercano y de qué bando */
  masCercano(J) { let m = null, md = 1e9; for (const r of this.rivales) { if (r.roto || r.retirada) continue; const d = Math.hypot(r.cuerpo.x - J.x, r.cuerpo.y - J.y); if (d < md) { md = d; m = r; } } return m ? { d: md, bando: m.bando, r: m } : null; }
}
Busqueda.UMBRAL = BUSQ_UMBRAL; Busqueda.PRESUPUESTO = BUSQ_PRESUPUESTO; Busqueda.BANDOS = BUSQ_BANDOS;
MC.Busqueda = Busqueda;

/* ---- js/28-naturaleza.js ---- */
/* =====================================================================
   NATURALEZA · rocas, palmas, frailejones, arbustos y juncos donde de verdad van
   Con azar fijo por celdas de 16 m y según el material, la pendiente, la altura y el agua (MC.Terreno):
   - ROCAS (de 0,4 a 3 m): en la roca y la montaña empinada, en los cauces de ríos y quebradas y en las playas
     rocosas. Las grandes no se atraviesan; las pequeñas se pasan a pie pero frenan las ruedas.
   - PALMAS en las playas y en tierra caliente baja; FRAILEJONES en el páramo (más de 3.000 m, como en los Andes);
     ARBUSTOS en el monte; JUNCOS en la orilla poco honda de lagos y ríos.
   Se dibujan en las vistas 2D con su sombra de contacto y chocan (MC.Terreno.obstaculo). Arte: gancho `naturaleza`.
   ===================================================================== */
const Naturaleza = {
  CELDA: 16,
  _celda(M, gx, gy) {
    const C = M._natura || (M._natura = new Map()), k = gx * 65536 + gy; let L = C.get(k); if (L) return L; L = [];
    const r = mulberry32((gx * 73856093) ^ (gy * 19349663) ^ 0x2545f491), S = Naturaleza.CELDA;
    for (let n = 0; n < 4; n++) {
      const x = (gx + r()) * S, y = (gy + r()) * S, u = r(), s = r(); if (!M.dentro(x, y)) continue; const tt = M.suelo(x, y);
      if (tt === TT.WATER || tt === TT.CANAL) { const ag = Terreno.aguaEn(M, x, y); if (ag && ag.prof < .45 && ag.tipo !== 'mar' && u < .35) L.push({ t: 'junco', x, y, s: .6 + s }); else if (ag && ag.tipo !== 'lago' && ag.tipo !== 'mar' && ag.prof < .9 && u < .12) L.push({ t: 'roca', x, y, s: .4 + s * .8 }); continue; }
      if (VIA_TT.has(tt) || tt === TT.BLDG || tt === TT.BRICK || M.edificioEn(x, y, 1)) continue;
      const pend = Terreno.pendiente(M, x, y), alt = M.cota(x, y);
      if (tt === TT.ROCA) { if (u < .55) L.push({ t: 'roca', x, y, s: .5 + s * 2.5 }); continue; }
      if (tt === TT.ARENA) { if (u < .1) L.push({ t: 'palma', x, y, s: .8 + s * .4 }); else if (u < .16) L.push({ t: 'roca', x, y, s: .4 + s }); continue; }
      if (alt > 3000 && (tt === TT.GRASS || tt === TT.MOUNT)) { if (u < .4) L.push({ t: 'frailejon', x, y, s: .7 + s * .8 }); else if (u < .5) L.push({ t: 'roca', x, y, s: .4 + s * 1.2 }); continue; }
      if (pend > .7 && u < .3 + (pend - .7) * .5) { L.push({ t: 'roca', x, y, s: .5 + s * (1 + pend) }); continue; }
      if (tt === TT.MOUNT && u < .14) { L.push({ t: 'arbusto', x, y, s: .7 + s * .8 }); continue; }
      if (tt === TT.GRASS && alt < 900 && u < .03) L.push({ t: 'palma', x, y, s: .9 + s * .3 });
    }
    C.set(k, L); if (C.size > 20000) C.delete(C.keys().next().value); return L;
  },
  en(M, x0, y0, x1, y1, max = 3000) { const S = Naturaleza.CELDA, out = []; for (let gy = Math.floor(y0 / S); gy <= Math.floor(y1 / S); gy++) for (let gx = Math.floor(x0 / S); gx <= Math.floor(x1 / S); gx++) { for (const p of Naturaleza._celda(M, gx, gy)) if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) { out.push(p); if (out.length >= max) return out; } } return out; },
  /* dibujo 2D: pr(x, y, h) del mundo a la pantalla, z = px por metro */
  objeto(D, p) {
    const { g, pr, z, P, noche, modo } = D, [x, y] = pr(p.x, p.y, 0), cen = modo === 'cenital', fa = MC.arte.f('naturaleza'); if (fa && fa(g, p, x, y, z, D) === true) return;
    const osc = noche > .3 ? -.35 : 0, s = p.s * z;
    if (p.t === 'roca') { Sombras.contacto(g, x + s * .15, y + s * .1, s * .62, s * .32 * (cen ? 1 : P.k + .3), .3); const hh = cen ? 0 : s * .55 * P.hk; g.fillStyle = tono('#8a857c', osc - .05); g.beginPath(); g.moveTo(x - s * .5, y); g.quadraticCurveTo(x - s * .55, y - hh - s * .25 * (cen ? 1 : P.k), x - s * .05, y - hh - s * .3 * (cen ? 1 : P.k)); g.quadraticCurveTo(x + s * .5, y - hh - s * .2 * (cen ? 1 : P.k), x + s * .5, y); g.closePath(); g.fill(); g.fillStyle = tono('#b3ada2', osc); g.beginPath(); g.ellipse(x - s * .12, y - hh - s * .18 * (cen ? 1 : P.k), s * .22, s * .1, -.3, 0, TAU); g.fill(); return; }
    if (p.t === 'palma') { const h = 6 * p.s, [, yt] = pr(p.x, p.y, h); Sombras.contacto(g, x, y, z * .6, z * .3, .2); if (!cen) { g.strokeStyle = tono('#8b6b4a', osc); g.lineWidth = Math.max(1, z * .28); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + z * .6, (y + yt) / 2, x + z * .3, yt); g.stroke(); } const cx = cen ? x : x + z * .3, cy = cen ? y : yt; g.strokeStyle = tono('#3f8f3a', osc); g.lineWidth = Math.max(1, z * .35); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, L = z * 2.4; g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + Math.cos(a) * L * .6, cy + Math.sin(a) * L * .3 - z * .4, cx + Math.cos(a) * L, cy + Math.sin(a) * L * .55 + z * .3); g.stroke(); } return; }
    if (p.t === 'frailejon') { const h = 1.4 * p.s, [, yt] = pr(p.x, p.y, h); Sombras.contacto(g, x, y, z * .4, z * .2, .2); if (!cen) { g.fillStyle = tono('#6b5a43', osc); g.fillRect(x - z * .15, yt, z * .3, y - yt); } g.fillStyle = tono('#a9b48a', osc); g.beginPath(); g.arc(x, cen ? y : yt, z * .55 * p.s, 0, TAU); g.fill(); g.fillStyle = tono('#e3c84a', osc); g.beginPath(); g.arc(x, (cen ? y : yt) - z * .2, z * .15, 0, TAU); g.fill(); return; }
    if (p.t === 'arbusto') { Sombras.contacto(g, x, y, s * .6, s * .3, .2); g.fillStyle = tono('#4f7f3a', osc); g.beginPath(); g.arc(x, y - (cen ? 0 : s * .35 * P.hk), s * .55, 0, TAU); g.fill(); return; }
    if (p.t === 'junco') { g.strokeStyle = tono('#6c8f3a', osc); g.lineWidth = Math.max(.6, z * .08); for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x + k * z * .12, y); g.lineTo(x + k * z * .2, y - z * (cen ? .4 : 1.2) * p.s); g.stroke(); } }
  }
};
MC.Naturaleza = Naturaleza;

/* ---- js/28-persecucion.js ---- */
/* =====================================================================
   MOTOR CITY 3.1 · Persecución optativa sin violencia gráfica (C-M26).
   Conductores sobre calles reales, rutas A* y cuerpos físicos compartidos
   con el resto del motor. Sin nuevos assets, dependencias ni azar global.
   ===================================================================== */
class Persecucion {
  constructor(mundo, op = {}) {
    this.mundo = mundo;
    this.nivel = clamp(op.nivel || 1, 1, 5);
    this.duracion = op.duracion || 90;
    this.estado = 'inactiva'; this.rivales = []; this.t = 0;
    this.puntos = 0; this.turbo = 0; this.evento = null;
    this.rozados = new Set(); this.alcance = 0; this.motivo = '';
  }
  iniciar(jugador) {
    if (!jugador || !Number.isFinite(jugador.x) || !Number.isFinite(jugador.y)) return false;
    if (this.estado === 'activa') return false;
    const M = this.mundo, n = Math.min(4, 2 + Math.floor(this.nivel / 2));
    const ca = Math.cos(jugador.a || 0), sa = Math.sin(jugador.a || 0), rivales = [];
    for (let i = 0; i < n; i++) {
      /* Nacen fuera del radio inmediato, por detrás o a un costado.
         Nunca teletransportarlos delante de la cámara a mitad de partida. */
      const atras = 38 + i * 23, lado = i % 2 ? 17 : -17;
      const x = jugador.x - ca * atras - sa * lado, y = jugador.y - sa * atras + ca * lado;
      const q = M.viaCercana(x, y, 110);
      if (!q || Math.hypot(q.x - jugador.x, q.y - jugador.y) < 20) continue;
      const c = new MC.Cuerpo(M, { x: q.x, y: q.y, a: q.ang, veh: 'carro' });
      rivales.push({ id: 'patrulla-' + i, cuerpo: c, ruta: null, tiempoRuta: 0,
        tactica: i % 2 === 0 ? 'seguir' : 'cerrar', contacto: 0 });
    }
    if (!rivales.length) return false;
    this.rivales = rivales; this.estado = 'activa'; this.motivo = '';
    this.t = 0; this.puntos = 0; this.turbo = 0; this.alcance = 0;
    this.evento = '🚨 ¡Te persiguen! Mantén distancia durante ' + this.duracion + ' s';
    this.rozados.clear();
    return true;
  }
  parar(motivo = 'cancelada') {
    if (this.estado !== 'activa') return false;
    this.estado = 'inactiva'; this.motivo = motivo; this.rivales = [];
    this.turbo = 0;
    this.evento = motivo === 'escapaste' ? '🏁 ¡Escapaste! · ' + this.puntos + ' puntos' :
      motivo === 'alcanzado' ? '🚔 Te alcanzaron. Inténtalo de nuevo' : 'Persecución terminada';
    return true;
  }
  /* Un casi choque puntúa solo con velocidad y separación real, nunca con contacto.
     El identificador del tráfico impide farmear el mismo vehículo por cuadro. */
  casiChoques(jugador, trafico = []) {
    if (this.estado !== 'activa' || Math.abs(jugador.v || 0) < 7) return 0;
    const ancho = jugador.veh && jugador.veh.ancho || 1.8;
    let cuantos = 0;
    for (const o of trafico) {
      if (o.id == null || this.rozados.has(o.id) || !Number.isFinite(o.x) || !Number.isFinite(o.y)) continue;
      const distancia = Math.hypot(jugador.x - o.x, jugador.y - o.y);
      const contacto = (ancho + (o.ancho || 1.8)) / 2 + .25;
      if (distancia > contacto + .35 && distancia < contacto + 1.5) {
        this.rozados.add(o.id); cuantos++; this.puntos += 100; this.turbo = Math.max(this.turbo, 1.25);
      }
    }
    if (cuantos) {
      this.evento = '⚡ Casi choque +' + 100 * cuantos + ' · turbo';
      MC._pausaImpacto = Math.max(MC._pausaImpacto || 0, .03);
    }
    return cuantos;
  }
  actualizar(dt, jugador, trafico = []) {
    if (this.estado !== 'activa' || !Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, .05); this.t += dt; this.turbo = Math.max(0, this.turbo - dt);
    this.casiChoques(jugador, trafico);
    let mejor = Infinity;
    for (const p of this.rivales) {
      const C = p.cuerpo, dx = jugador.x - C.x, dy = jugador.y - C.y;
      const d = Math.hypot(dx, dy);
      mejor = Math.min(mejor, d);
      p.tiempoRuta -= dt;
      if (p.tiempoRuta <= 0) {
        /* El perseguidor que cierra calcula una intercepción corta por calles,
           no una línea recta a través de casas. Replanificar con presupuesto. */
        const adelante = p.tactica === 'cerrar' ? clamp(Math.abs(jugador.v || 0) * 1.1, 5, 25) : 0;
        const meta = { x: jugador.x + Math.cos(jugador.a || 0) * adelante,
          y: jugador.y + Math.sin(jugador.a || 0) * adelante };
        const propuesta = MC.Manejo.rutaA(this.mundo, C, meta, 'rueda');
        /* rutaA devuelve un único punto cuando la red está desconectada.
           Ese respaldo sirve para «tocar para ir», pero una patrulla no debe atravesar manzanas. */
        p.ruta = Array.isArray(propuesta) && propuesta.length >= 4 ? propuesta : null;
        p.tiempoRuta = 1.5 + (p.id.charCodeAt(p.id.length - 1) % 3) * .25;
      }
      if (!p.ruta) {
        C.actualizar(dt, { acel: -.4, giro: 0 });   // sin ruta, frenar y volver a calcular
        continue;
      }
      const m = MC.Manejo.seguirRuta(C, p.ruta, { radio: 4 });
      if (!m || !m.dir) {
        C.actualizar(dt, { acel: -.4, giro: 0 });
        continue;
      }
      const meta = [C.x + m.dir.x * 8, C.y + m.dir.y * 8];
      const fuerza = MC.IA.llegar([C.x, C.y], meta, 1, 4);
      C.actualizar(dt, { dir: { x: fuerza[0], y: fuerza[1], m: clamp(Math.hypot(...fuerza), .35, 1) } });
    }
    /* Hay que detenerse y dejarse alcanzar: rozar a otro carro no es captura. */
    this.alcance = mejor < 3.6 && Math.abs(jugador.v || 0) < 3 ? this.alcance + dt : 0;
    if (this.alcance > 2) this.parar('alcanzado');
    else if (this.t >= this.duracion) this.parar('escapaste');
  }
  vehiculos() {
    if (this.estado !== 'activa') return [];
    return this.rivales.map(p => { const c = p.cuerpo; return {
      id: p.id, tipo: 'carro', clase: 'auto', x: c.x, y: c.y, a: c.a,
      v: c.v, largo: 4.4, ancho: 1.8, color: '#376878', frena: 0
    }; });
  }
}
MC.Persecucion = Persecucion;

/* ---- js/29-arboleda.js ---- */
/* =====================================================================
   ARBOLEDA · los árboles del mundo, de pie y con volumen (2.6)
   - Son los mismos árboles de siempre: azar fijo por celdas de 7 m según el suelo y la zona, en las mismas
     posiciones con que choca MC.Terreno. Antes eran discos pintados en el piso, y desde la maqueta, la oblicua
     o la lateral se veían como «tapetes». Ahora:
       · en las vistas inclinadas se levantan: tronco, ramas y copa con luz del sol, sombra en el piso según la hora;
       · desde arriba, la copa tiene volumen: lóbulos, lado iluminado, borde oscuro, hojas y flores.
   - Especies del trópico andino: guayacán amarillo y rosado (florecidos), ceiba (copa ancha), mango (densa y
     oscura), urapán (la común) y árbol de monte (más alto y estrecho).
   - Barato: cada especie se hornea UNA vez en lienzos (3 variantes, de lado y desde arriba; los de noche, cuando
     se necesitan). Dibujar un árbol es un drawImage.
   Uso: Arboleda.en(M, x0, y0, x1, y1, max) · Arboleda.dePie(D, t) · Arboleda.arriba(g, t) (en metros, para las losas)
   ===================================================================== */
const Arboleda = {
  CEL: 7, BLOQUE: 56, R: 56,
  ESPECIES: {
    urapan: { copa: ['#2f4a24', '#4d6a33', '#7c9450'], forma: 'redonda', alto: 1, ancho: 1 },
    guayacan_amarillo: { copa: ['#3b4f25', '#5d7334', '#8a9a52'], flor: ['#d89a12', '#f2c230', '#fde38a'], flores: .62, forma: 'redonda', alto: .95, ancho: 1.05 },
    guayacan_rosado: { copa: ['#3a4c2b', '#5b6e3e', '#86955a'], flor: ['#b8507a', '#df7ea3', '#f6c3d6'], flores: .55, forma: 'redonda', alto: .95, ancho: 1.05 },
    ceiba: { copa: ['#2c4522', '#476236', '#6f8a4a'], forma: 'ancha', alto: 1.25, ancho: 1.45 },
    mango: { copa: ['#1f3a1c', '#33502a', '#56713e'], forma: 'densa', alto: .85, ancho: 1.1 },
    monte: { copa: ['#263d22', '#3c5530', '#5f7744'], forma: 'conica', alto: 1.15, ancho: .78 }
  },
  /* la especie según el suelo y el azar fijo del árbol */
  especie(tt, s, r) { if (tt === TT.MOUNT) return s < .72 ? 'monte' : 'urapan'; return s < .1 ? 'guayacan_amarillo' : s < .18 ? 'guayacan_rosado' : s < .32 ? 'mango' : s < .42 && r > 3.4 ? 'ceiba' : 'urapan'; },
  /* los árboles de un bloque de 56 m (los mismos que las losas y Terreno.arbolLosaEn) */
  _bloque(M, bx, by) {
    const C = M._arboleda || (M._arboleda = new Map()), k = bx * 65536 + by; let L = C.get(k); if (L) return L; L = [];
    const cel = this.CEL, B = this.BLOQUE;
    for (let y = by * B; y < (by + 1) * B; y += cel) for (let x = bx * B; x < (bx + 1) * B; x += cel) {
      const tt = M.suelo(x, y); if (tt !== TT.GRASS && tt !== TT.MOUNT && tt !== TT.PLAZA) continue; const Z = M.estilo(x, y), dens = tt === TT.MOUNT ? .55 : tt === TT.PLAZA ? .18 : (Z.arboles || .4) * .55; if (h2(x, y, 41) > dens) continue;
      const tx = x + h2(x, y, 42) * cel, ty = y + h2(x, y, 43) * cel, r = 2.2 + h2(x, y, 44) * 2.6, s = h2(x, y, 45), e = this.especie(tt, s, r), E = this.ESPECIES[e];
      L.push({ x: tx, y: ty, r, s, e, h: r * (2.05 + h2(x, y, 46) * .5) * E.alto, v: (h2(x, y, 47) * 3) | 0, espejo: h2(x, y, 48) < .5 });
    }
    C.set(k, L); if (C.size > 6000) C.delete(C.keys().next().value); return L;
  },
  en(M, x0, y0, x1, y1, max = 2000) { const B = this.BLOQUE, out = []; for (let by = Math.floor(y0 / B); by <= Math.floor(y1 / B); by++) for (let bx = Math.floor(x0 / B); bx <= Math.floor(x1 / B); bx++) for (const t of this._bloque(M, bx, by)) if (t.x >= x0 && t.x <= x1 && t.y >= y0 && t.y <= y1) { out.push(t); if (out.length >= max) return out; } return out; },
  /* ---------- horneado: un lienzo por especie, variante y vista ---------- */
  _sp: new Map(),
  sprite(e, v, vista, noche) {
    if (!Object.hasOwn(this.ESPECIES, e)) e = 'urapan';
    const k = e + v + vista + (noche ? 'n' : '') + MC.estilo; let c = this._sp.get(k); if (c !== undefined) return c;   // 2.7: un horneado por estilo
    if (noche) { const d = this.sprite(e, v, vista, false); c = d ? lienzo(d.width, d.height) : null; if (c) { const g = c.getContext('2d'); g.drawImage(d, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(10,18,44,.6)'; g.fillRect(0, 0, c.width, c.height); c._base = d._base; c._rx = d._rx; c._alto = d._alto; } }
    else c = vista === 'lado' ? this._hornearLado(e, v) : this._hornearArriba(e, v);
    this._sp.set(k, c); return c;
  },
  /* la copa: lóbulos en tres pasadas (silueta oscura, cuerpo y luz desde arriba a la izquierda), hojas y flores encima */
  _copa(g, E, rnd, cx, cy, rx, ry, R, arriba, modo = 'real') {
    const N = arriba ? 16 : 20, L = [];
    for (let i = 0; i < N; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * .78; let px = cx + Math.cos(a) * d * rx, py = cy + Math.sin(a) * d * ry; if (!arriba && E.forma === 'conica') px = cx + (px - cx) * (.55 + .45 * clamp((py - (cy - ry)) / (2 * ry), 0, 1)); L.push([px, py, R * (.26 + rnd() * .2) * (E.forma === 'densa' ? 1.12 : 1)]); }
    if (!arriba) L.sort((p, q) => q[1] - p[1]);   // de atrás (abajo) hacia delante (arriba)
    if (modo !== 'real') return this._copaEstilo(g, E, rnd, L, cx, cy, rx, ry, R, modo);
    const [c0, c1, c2] = E.copa;
    g.fillStyle = tono(c0, -.12); for (const [x, y, r] of L) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillStyle = c1; for (const [x, y, r] of L) { g.beginPath(); g.arc(x - r * .12, y - r * .16, r * .84, 0, TAU); g.fill(); }
    for (const [x, y, r] of L) { const luz = clamp(((cx - x) / rx + (cy - y) / ry) * .5 + .45, 0, 1); if (luz < .3) continue; g.globalAlpha = .35 + luz * .5; g.fillStyle = c2; g.beginPath(); g.arc(x - r * .3, y - r * .34, r * .46, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    /* textura de hojas y sombra interior (solo dentro de la copa) */
    g.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < (arriba ? 260 : 320); i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()), x = cx + Math.cos(a) * d * rx * 1.05, y = cy + Math.sin(a) * d * ry * 1.05, r = R * (.03 + rnd() * .035); g.fillStyle = rnd() < .55 ? 'rgba(12,26,10,.32)' : 'rgba(200,220,150,.22)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    if (E.flor) for (let i = 0; i < 420 * E.flores; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()), x = cx + Math.cos(a) * d * rx, y = cy + Math.sin(a) * d * ry, lado = clamp(((cx - x) / rx + (cy - y) / ry) * .5 + .5, 0, 1), r = R * (.035 + rnd() * .04); g.fillStyle = E.flor[lado > .62 ? 2 : lado > .3 ? 1 : 0]; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    const gr = arriba ? g.createRadialGradient(cx - rx * .25, cy - ry * .25, R * .1, cx, cy, Math.max(rx, ry) * 1.05) : g.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
    gr.addColorStop(0, 'rgba(255,250,220,.10)'); gr.addColorStop(.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,14,8,.42)'); g.fillStyle = gr; g.fillRect(cx - rx * 1.4, cy - ry * 1.4, rx * 2.8, ry * 2.8);
    g.globalCompositeOperation = 'source-over';
  },
  /* 2.7: la copa en los estilos dibujados (cel, tono de manga, silueta noir, acuarela), con su tinta */
  _copaEstilo(g, E, rnd, L, cx, cy, rx, ry, R, modo) {
    const ES = Estilo.p, C = x => Estilo.col(x), luzDe = (x, y) => clamp(((cx - x) / rx + (cy - y) / ry) * .5 + .45, 0, 1), tw = ES.tinta ? R * .028 * ES.tinta : 0, bola = (x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(.5, r), 0, TAU); g.fill(); };
    if (modo === 'silueta') { g.fillStyle = '#0c0b0a'; for (const [x, y, r] of L) bola(x, y, r); g.strokeStyle = 'rgba(236,229,211,.9)'; g.lineWidth = R * .035; for (const [x, y, r] of L) if (luzDe(x, y) > .62) { g.beginPath(); g.arc(x, y, r * .9, 3.3, 4.7); g.stroke(); } return; }   // el negro del noir con el filo de luz
    const [c0, c1, c2] = E.copa.map(C);
    if (modo === 'acuarela') { g.globalAlpha = .5; for (const [x, y, r] of L) { g.fillStyle = rnd() < .5 ? c1 : c2; bola(x + (rnd() - .5) * r * .2, y + (rnd() - .5) * r * .2, r * .95); } g.globalAlpha = .35; g.strokeStyle = c0; g.lineWidth = R * .04; for (const [x, y, r] of L) { g.beginPath(); g.arc(x, y, r * .93, 0, TAU); g.stroke(); } g.globalAlpha = .4; if (E.flor) { g.fillStyle = C(E.flor[1]); for (let i = 0; i < 40 * E.flores; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * .8; bola(cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, R * (.06 + rnd() * .06)); } } g.globalAlpha = 1; return; }   // pigmento que se junta en el borde
    if (tw) { g.fillStyle = ES.tintaColor; for (const [x, y, r] of L) bola(x, y, r + tw); }   // la tinta: la silueta un poco más grande, por debajo
    g.fillStyle = c0; for (const [x, y, r] of L) bola(x, y, r);
    g.fillStyle = c1; for (const [x, y, r] of L) if (luzDe(x, y) > .22) bola(x - r * .12, y - r * .16, r * .8);
    g.fillStyle = c2; for (const [x, y, r] of L) if (luzDe(x, y) > .55) bola(x - r * .28, y - r * .3, r * .44);
    if (E.flor) { const f = E.flor.map(C); for (let i = 0; i < 90 * E.flores; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * .85, x = cx + Math.cos(a) * d * rx, y = cy + Math.sin(a) * d * ry; g.fillStyle = f[luzDe(x, y) > .6 ? 2 : 1]; bola(x, y, R * (.05 + rnd() * .03)); } }   // flores en manchas planas
    if (modo === 'tono') { const fu = Estilo.fuente('tono'); if (fu) { const p = g.createPattern(fu, 'repeat'); g.save(); g.globalCompositeOperation = 'source-atop'; g.beginPath(); g.moveTo(cx + rx * 1.6, cy - ry * 1.6); g.lineTo(cx + rx * 1.6, cy + ry * 1.6); g.lineTo(cx - rx * 1.6, cy + ry * 1.6); g.closePath(); g.clip(); g.fillStyle = p; g.fillRect(cx - rx * 1.6, cy - ry * 1.6, rx * 3.2, ry * 3.2); g.restore(); } }   // tramado en el lado de la sombra
  },
  _hornearLado(e, v) {
    const E = this.ESPECIES[e], R = this.R, rx = R * E.ancho, ry = R * (E.forma === 'ancha' ? .62 : E.forma === 'conica' ? 1.05 : .86), alto = R * 2.3 * E.alto, W = Math.ceil(rx * 2 + R * .5), H = Math.ceil(alto + R * .25);
    const c = lienzo(W, H); if (!c) return null; const g = c.getContext('2d'), rnd = mulberry32(e.length * 977 + v * 131 + 7), cx = W / 2, base = H - 2, cy = Math.max(ry + 2, base - alto + ry);
    /* tronco que se afina, con su lado en sombra, y ramas que entran a la copa */
    const modo = MC.estilo === 'realista' ? 'real' : (Estilo.p.arbol || 'cel'), tb = R * (E.forma === 'ancha' ? .2 : .13), tt = tb * .55, bark = modo === 'silueta' ? '#0c0b0a' : Estilo.col(E.forma === 'ancha' ? '#7a7466' : '#5a4433');
    g.fillStyle = tono(bark, -.25); g.beginPath(); g.moveTo(cx - tb, base); g.quadraticCurveTo(cx - tb * .4, (base + cy) / 2, cx - tt, cy + ry * .2); g.lineTo(cx + tt, cy + ry * .2); g.quadraticCurveTo(cx + tb * .4, (base + cy) / 2, cx + tb, base); g.closePath(); g.fill();
    g.fillStyle = bark; g.beginPath(); g.moveTo(cx - tb, base); g.quadraticCurveTo(cx - tb * .4, (base + cy) / 2, cx - tt, cy + ry * .2); g.lineTo(cx - tt * .1, cy + ry * .2); g.quadraticCurveTo(cx - tb * .05, (base + cy) / 2, cx - tb * .1, base); g.closePath(); g.fill();
    g.strokeStyle = tono(bark, -.15); g.lineCap = 'round'; for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, y0 = cy + ry * (.3 - i * .12); g.lineWidth = tt * (.9 - i * .15); g.beginPath(); g.moveTo(cx, y0 + ry * .25); g.quadraticCurveTo(cx + s * rx * .25, y0, cx + s * rx * (.45 + rnd() * .2), y0 - ry * (.15 + rnd() * .2)); g.stroke(); }
    if (E.forma === 'ancha') { g.fillStyle = tono(bark, -.3); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * tb * .6, base); g.lineTo(cx + s * tb * 2.1, base); g.lineTo(cx + s * tb * .5, base - R * .35); g.closePath(); g.fill(); } }   // las raíces tablares de la ceiba
    /* la copa en su capa, para que hojas y sombras queden adentro */
    if (modo !== 'real' && Estilo.p.tinta) { g.save(); g.globalCompositeOperation = 'destination-over'; g.strokeStyle = Estilo.p.tintaColor; g.lineWidth = R * .05 * Estilo.p.tinta; g.beginPath(); g.moveTo(cx - tb, base); g.lineTo(cx - tt, cy + ry * .2); g.moveTo(cx + tb, base); g.lineTo(cx + tt, cy + ry * .2); g.moveTo(cx - tb * 1.2, base); g.lineTo(cx + tb * 1.2, base); g.stroke(); g.restore(); }   // el contorno del tronco
    const cc = lienzo(W, H), gc = cc.getContext('2d'); this._copa(gc, E, rnd, cx, cy, rx, ry, R, false, modo); g.drawImage(cc, 0, 0);
    c._base = [cx, base]; c._rx = rx; c._alto = base - (cy - ry); return c;
  },
  _hornearArriba(e, v) {
    const E = this.ESPECIES[e], R = this.R, rx = R * E.ancho * .98, S = Math.ceil(rx * 2 + R * .3), c = lienzo(S, S); if (!c) return null;
    const g = c.getContext('2d'), rnd = mulberry32(e.length * 613 + v * 97 + 3); this._copa(g, E, rnd, S / 2, S / 2, rx, rx, R, true, MC.estilo === 'realista' ? 'real' : (Estilo.p.arbol || 'cel')); c._rx = rx; return c;
  },
  /* hornea todo en ratos libres al arrancar (un lienzo cada 40 ms), para que la primera vez que se vean no cueste */
  precalentar() { if (this._pre || typeof setTimeout === 'undefined' || typeof document === 'undefined') return; this._pre = true; const L = []; for (const e of Object.keys(this.ESPECIES)) for (let v = 0; v < 3; v++) L.push([e, v, 'lado'], [e, v, 'arriba']);
    const paso = () => { const q = L.shift(); if (!q) return; const sp = this.sprite(q[0], q[1], q[2], false); if (sp && q[2] === 'lado') { this.mip(sp, .4); this.mip(sp, .1); } setTimeout(paso, 40); }; setTimeout(paso, 300); },
  /* ---------- dibujo ---------- */
  /* desde arriba, en metros del mundo (para hornear en las losas): sombra suave al sureste y la copa */
  arriba(g, t, sombra = true) {
    const fa = MC.arte.f('arbol'); if (fa && fa(g, t, 'arriba', t.x, t.y, 1, null) === true) return;   // gancho de arte: arbol(g, t, vista, x, y, pxPorMetro, D) → true si lo dibujó
    const E = this.ESPECIES[t.e] || this.ESPECIES.urapan, rM = t.r * E.ancho, sp = this.sprite(t.e, t.v, 'arriba', false); if (!sp) return;
    if (sombra) { g.fillStyle = 'rgba(8,14,10,.3)'; g.beginPath(); g.ellipse(t.x + rM * .45, t.y + rM * .5, rM * 1.02, rM * .95, .6, 0, TAU); g.fill(); }
    const k = rM / sp._rx; g.drawImage(sp, t.x - sp.width / 2 * k, t.y - sp.height / 2 * k, sp.width * k, sp.height * k);
  },
  /* todas las sombras de una vez (un solo trazo: el sol es el mismo para todos), antes de los objetos */
  sombras(D, L, sv) {
    const { g, pr, z, P } = D; if (!L.length) return; const k = Math.max(.25, P.k * 1.2), Lf = sv ? Math.min(2.2, sv.L * .55) : 0;
    let ang = 0; if (sv) { const [ax, ay] = pr(0, 0, 0), [bx, by] = pr(sv.dx, sv.dy, 0); ang = Math.atan2(by - ay, bx - ax); }
    g.fillStyle = 'rgba(8,14,30,' + (sv ? (.11 + .15 * sv.fuerza) : .12).toFixed(3) + ')'; g.beginPath();
    for (const t of L) { const E = this.ESPECIES[t.e] || this.ESPECIES.urapan, rM = t.r * E.ancho, rx = z * rM * (1 + Lf * .35), ry = z * rM * .9 * k; if (rx < 1.5) continue; const [sx, sy] = sv ? pr(t.x + sv.dx / sv.L * t.h * Lf * .55, t.y + sv.dy / sv.L * t.h * Lf * .55, 0) : pr(t.x + rM * .2, t.y + rM * .1, 0); g.moveTo(sx + rx * Math.cos(ang), sy + rx * Math.sin(ang)); g.ellipse(sx, sy, rx, ry, ang, 0, TAU); }
    g.fill(); g.fillStyle = 'rgba(10,14,26,.32)'; g.beginPath();
    for (const t of L) { const [x, y] = pr(t.x, t.y, 0), rx = Math.max(1, z * t.r * .18), ry = Math.max(.6, z * t.r * .09 * (P.k + .2)); g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, TAU); }
    g.fill();
  },
  /* la sombra de un solo árbol (árboles de calle) */
  sombra(D, t, sv) {
    const { g, pr, z, P } = D, E = this.ESPECIES[t.e] || this.ESPECIES.urapan, rM = t.r * E.ancho, [x, y] = pr(t.x, t.y, 0);
    Sombras.contacto(g, x, y, Math.max(1, z * t.r * .18), Math.max(.6, z * t.r * .09 * (P.k + .2)), .35);
    if (!sv) { Sombras.contacto(g, x + z * rM * .2, y + z * rM * .1 * P.k, z * rM * .9, z * rM * .9 * P.k, .16); return; }
    const L = Math.min(2.2, sv.L * .55), [sx, sy] = pr(t.x + sv.dx / sv.L * t.h * L * .55, t.y + sv.dy / sv.L * t.h * L * .55, 0), [ex, ey] = pr(t.x + sv.dx, t.y + sv.dy, 0), ang = Math.atan2(ey - y, ex - x);
    g.save(); g.fillStyle = 'rgba(8,14,30,' + (.16 + .18 * sv.fuerza).toFixed(3) + ')'; g.translate(sx, sy); g.rotate(ang); g.scale(1, Math.max(.25, P.k * 1.2)); g.beginPath(); g.ellipse(0, 0, z * rM * (1 + L * .35), z * rM * .9, 0, 0, TAU); g.fill(); g.restore();
  },
  /* de pie (maqueta, oblicua, lateral): el sprite de lado a la medida del árbol */
  mip(sp, k) { if (k >= .55 || !sp) return sp; const n = k >= .28 ? 1 : 2, M = sp._mip || (sp._mip = []); if (!M[n]) { const f = n === 1 ? .5 : .25, c = lienzo(Math.max(1, sp.width * f), Math.max(1, sp.height * f)); if (!c) return sp; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(sp, 0, 0, c.width, c.height); c._base = [sp._base[0] * f, sp._base[1] * f]; c._rx = sp._rx * f; c._alto = sp._alto * f; M[n] = c; } return M[n]; },
  dePie(D, t) {
    const { g, pr, z, P, noche } = D, fa = MC.arte.f('arbol'); if (fa) { const [ax, ay] = pr(t.x, t.y, 0); if (fa(g, t, 'lado', ax, ay, z, D) === true) return; } let sp = this.sprite(t.e, t.v, 'lado', noche > .4); if (!sp) return; const E = this.ESPECIES[t.e] || this.ESPECIES.urapan, [x, y] = pr(t.x, t.y, 0);
    sp = this.mip(sp, (t.r * E.ancho * z) / sp._rx); const kx = (t.r * E.ancho * z) / sp._rx, ky = (t.h * z * P.hk) / sp._alto, w = sp.width * kx, h = sp.height * ky; if (h < 3) return;
    const vi = z >= 5 ? Math.sin((D.E.t || 0) * 1.3 + t.x * .21 + t.y * .13) * .045 * (D.E.viento ?? (D.E.clima && D.E.clima.viento ? clamp(D.E.clima.viento.v / 6, .2, 1.6) : .6)) : 0;   /* 2.7 · vida: el viento mece la copa (de cerca); el pie no se mueve */
    if (t.espejo || vi) { g.save(); g.translate(x, y); if (vi) g.transform(1, 0, -vi, 1, 0, 0); if (t.espejo) g.scale(-1, 1); g.drawImage(sp, -w / 2, -sp._base[1] * ky, w, h); g.restore(); } else g.drawImage(sp, x - w / 2, y - sp._base[1] * ky, w, h);
  },
  /* desde arriba, en pantalla (árboles de calle en la cenital) */
  arribaPantalla(D, t) { const { g, pr, z, noche } = D, fa = MC.arte.f('arbol'); if (fa) { const [ax, ay] = pr(t.x, t.y, 0); if (fa(g, t, 'arriba', ax, ay, z, D) === true) return; } const sp = this.sprite(t.e, t.v, 'arriba', noche > .4); if (!sp) return; const E = this.ESPECIES[t.e] || this.ESPECIES.urapan, [x, y] = pr(t.x, t.y, 0), k = t.r * E.ancho * z / sp._rx; Sombras.contacto(g, x + t.r * z * .35, y + t.r * z * .4, t.r * z, t.r * z * .92, .26); g.drawImage(sp, x - sp.width / 2 * k, y - sp.height / 2 * k, sp.width * k, sp.height * k); }
};
MC.Arboleda = Arboleda;

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
     estado: 'quieto' | 'camina' | 'corre' | 'pedalea' | 'impulsa' | 'patina' | 'tabla' | 'sentado' | 'salta' | 'cae' | 'nada' | 'bucea'
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
      /* en el agua: el cuerpo casi horizontal, patada que alterna (crol) o que abre y cierra (bucear, como la rana) */
      case 'nada': { cad = [-.15, .5]; inc = 1.32; pies = [[-.95, .5 + s * .14], [-.95, .5 - s * .14]]; break; }
      case 'bucea': { cad = [-.1, .5]; inc = 1.45; pies = [[-.9 + Math.abs(s) * .15, .5 + .16 * c], [-.9 + Math.abs(s) * .15, .5 - .16 * c]]; break; }
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
    else if (estado === 'nada') { mI = [pecho[0] + .1 + Math.cos(fase) * .5, pecho[1] + Math.sin(fase) * .35]; mD = [pecho[0] + .1 - Math.cos(fase) * .5, pecho[1] - Math.sin(fase) * .35]; }   // brazadas de crol
    else if (estado === 'bucea') { const e = (Math.sin(fase) + 1) / 2; mI = [pecho[0] + .55 - e * .5, pecho[1] + .18 * e]; mD = [pecho[0] + .55 - e * .5, pecho[1] - .18 * e]; }   // brazada de rana
    else { const b = estado === 'corre' ? .5 : estado === 'camina' ? .28 : estado === 'patina' ? .4 : .08; mI = [pecho[0] - s * b, pecho[1] - .5 + Math.abs(s) * .05]; mD = [pecho[0] + s * b, pecho[1] - .5 + Math.abs(c) * .05]; if (estado === 'corre') { mI[1] += .12; mD[1] += .12; } }
    const codo = (m, sg) => { const mx = (pecho[0] + m[0]) / 2, mz = (pecho[1] + m[1]) / 2, dx = m[0] - pecho[0], dz = m[1] - pecho[1], L = Math.hypot(dx, dz) || 1, a = .3, h = Math.sqrt(Math.max(0, a * a - (L / 2) ** 2)); return [mx + dz / L * h * sg, mz - dx / L * h * sg]; };
    Object.assign(J, { cadera: P(...cad), pecho: P(...pecho), cabeza: P(...cabeza), pieI: P(...pI), pieD: P(...pD), rodI: P(...rod(pI, 1)), rodD: P(...rod(pD, 1)), manoI: P(...mI), manoD: P(...mD), codoI: P(...codo(mI, -1)), codoD: P(...codo(mD, -1)), inc, estado, fase, radioCabeza: cab * k });
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
    const v = Object.assign({ juegos: ['*'] }, base || {}, def); if (base) v.de = def.de;
    if (v.suelo && v.suelo.length < 20) { const S = v.suelo.slice(); S[17] = S[17] ?? (v.clase === 'agua' ? 0 : S[0] * .75); S[18] = S[18] ?? (v.clase === 'agua' ? 0 : S[0] * .45); S[19] = S[19] ?? (v.clase === 'agua' ? 0 : S[1] * .8); v.suelo = S; }   // arena, nieve y roca
    this.lista.set(v.id, v); MC.emit('vehiculo', v); return v;
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
    /* agua (2.4): aire de los pulmones (0–1), buceo, vehículo que quedó parqueado en la orilla y bajarse solo al empujar hacia el agua */
    this.aire = 1; this.buceando = false; this.estacionado = null; this.empujaAgua = 0; this.bajarseEnAgua = op.bajarseEnAgua !== false; this.pulmones = op.pulmones || 35;
  }
  /* ---------- entrar y salir del agua ---------- */
  /* se baja del vehículo y lo deja parqueado donde está (en la orilla, si iba hacia el agua) */
  bajarse(motivo = '') { if (this.veh.id === 'pie') return null; const e = { veh: this.veh.id, x: this.x, y: this.y, a: this.a, motivo }; this.estacionado = e; this.setVeh('pie'); this.v = Math.min(Math.abs(this.v), 1.2); this.eventos.push('bajarse'); MC.emit('bajarse', { cuerpo: this, estacionado: e }); return e; }
  /* vuelve al vehículo parqueado si está cerca (r metros) */
  puedeMontar(r = 3) { const e = this.estacionado; return !!e && this.veh.id === 'pie' && !this.nadando && Math.hypot(e.x - this.x, e.y - this.y) <= r; }
  montar(r = 3) { if (!this.puedeMontar(r)) return false; const e = this.estacionado; this.x = e.x; this.y = e.y; this.a = e.a; this.z = 0; this.setVeh(e.veh); this.estacionado = null; this.eventos.push('montar'); MC.emit('montar', { cuerpo: this }); return true; }
  /* subirse a una lancha en el agua honda más cercana (r m); lo que traía queda parqueado */
  embarcar(id = 'lancha', r = 30) { const w = Terreno.aguaHonda(this.mundo, this.x, this.y, r, .8); if (!w) return false; if (this.veh.id !== 'pie') this.bajarse('embarcar'); this.x = w.x; this.y = w.y; this.z = 0; this.setVeh(id); this.eventos.push('embarca'); MC.emit('embarcar', { cuerpo: this }); return true; }
  /* bajarse de la lancha a la tierra firme más cercana (r m); la lancha queda amarrada donde estaba */
  desembarcar(r = 14) { if (this.veh.clase !== 'agua') return false; const t = Terreno.tierraFirme(this.mundo, this.x, this.y, r); if (!t) return false; const e = { veh: this.veh.id, x: this.x, y: this.y, a: this.a, motivo: 'amarrada' }; this.setVeh('pie'); this.x = t.x; this.y = t.y; this.estacionado = e; this.eventos.push('desembarca'); MC.emit('desembarcar', { cuerpo: this }); return true; }
  setVeh(id) { this.veh = Vehiculos.get(id); this.v = Math.min(this.v, this.veh.vmax); if (this.veh.clase !== 'aire') { this.enAire = this.z > .05; } MC.emit('cambiaVehiculo', this); }
  /* altura absoluta (m s. n. m.) de los pies: terreno + tablero del puente + salto o vuelo */
  get alturaSuelo() { return this.mundo.cota(this.x, this.y) + this.zPaso; }
  get altura() { return this.alturaSuelo + this.z; }
  vmax() { const V = this.veh, base = V.id === 'pie' ? (this.corriendo ? V.vcorre : V.vmax) : V.vmax; return base * this.escala * (Vehiculos.escala || 1); }
  /* ¿puede este vehículo estar en (x, y)? */
  puede(x, y) {
    const V = this.veh; if (V.clase === 'aire' && this.z > 3) return this.mundo.dentro(x, y);
    if (this.paso) return true;
    /* un tablero o una rampa que queda entre los pies y la cabeza es una pared (no se atraviesa ni se pasa por debajo) */
    const pie = this.zPaso + this.z, alto = this.altoCuerpo(); for (const S of this.superficies(x, y)) if (S.P && S.h - pie > this.escalonDin() && S.h - pie < alto) return false;
    /* terreno (2.4): agua y su profundidad, material, pendiente y barrancos, borde del mundo (MC.Terreno.paso) */
    const T = Terreno.paso(this, x, y); if (!T.ok) { if (T.agua) this.bloqueoAgua = true; return this._bloquea(T.motivo); }
    if (this.chocaEdificios && V.clase !== 'agua') {
      /* edificios: siempre (sobre la calle solo si se mete más de 1 m en la huella: los datos se solapan un poco con la vía),
         y también los edificios de los sitios y las partes bajas de los emblemáticos */
      const tt = this.mundo.suelo(x, y), enVia = VIA_TT.has(tt), r = V.clase === 'pie' ? .2 : .4;
      if (this.mundo.edificioEn(x, y, enVia ? -1 : r)) return this._bloquea('un edificio');
      if (!enVia && Terreno.sitioEn(this.mundo, x, y)) return this._bloquea('un edificio');
      /* árboles, postes, bancas, rocas, palmas… y lo que el juego diga (tráfico, gente). 4.0.2: los carros de la IA (this.ia) sobre la calle no chocan con lo menor del andén y el separador */
      if (!(this.z > 1.2) && !(this.ia && enVia)) { const o = Terreno.obstaculo(this, x, y, V.clase === 'pie' ? .25 : Math.min(.9, (V.ancho || .6) / 2)); if (o) return this._bloquea(o.t ? ({ arbol: 'un árbol', poste: 'un poste', roca: 'una roca', banca: 'una banca', paradero: 'un paradero', palma: 'una palma' }[o.t] || 'algo') : (o.motivo || 'algo')); }
    }
    return true;
  }
  /* por qué no pasó (para que el juego lo diga una vez: «🌊 el agua está muy honda») */
  _bloquea(motivo) { this.bloqueo = motivo || 'algo'; this.tBloqueo = 1.2; return false; }
  actualizar(dt, E = {}) {
    const V = this.veh, M = this.mundo; this.eventos.length = 0; dt = Math.min(dt, .1); this._dt = dt;
    this.corriendo = !!E.correr && V.id === 'pie';
    /* rumbo deseado (joystick que apunta en el mundo) o giro (volante) */
    let acel = E.acel || 0, giro = E.giro || 0;
    if (E.dir && E.dir.m > .08) { const des = Math.atan2(E.dir.y, E.dir.x), d = angDif(this.a, des); giro = clamp(d * 2.2, -1, 1); acel = E.dir.m * (Math.abs(d) > 2.2 && V.clase !== 'pie' ? .2 : 1); if (V.clase === 'pie' && Math.abs(d) > .1) this.a += clamp(d, -dt * 9, dt * 9); }
    /* suelo, pendiente y velocidad objetivo */
    this.tt = M.suelo(this.x, this.y); this.pend = this.paso ? 0 : M.pendiente(this.x, this.y, this.a, 12); this.tBloqueo = Math.max(0, (this.tBloqueo || 0) - dt); if (!this.tBloqueo) this.bloqueo = null;
    /* el terreno manda en la velocidad: vadear, nadar, arena, nieve, monte (MC.Terreno) */
    const Tp = this.paso || (V.clase === 'aire' && this.z > 3) ? { f: 1 } : Terreno.paso(this, this.x, this.y); this.nadando = !!Tp.nada; this.vadeando = !!Tp.vadea;
    const suelo = this.paso ? 1 : Math.max(.12, Tp.ok === false ? .15 : Tp.f), loma = V.electrico ? clamp(1 - this.pend * .4, .85, 1.15) : Vehiculos.loma(V, this.pend);
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
    else if (this.nadando && V.clase === 'pie') this._nadar(dt, E);
    else {
      /* salto con «tiempo de coyote» (se puede saltar un instante después de dejar el borde) y con memoria del botón
         (si se oprime un poco antes de caer, salta al tocar el piso): así se siente justo, como en los buenos plataformeros */
      if (!this.enAire) this.coyote = .12; else this.coyote = Math.max(0, (this.coyote || 0) - dt);
      if (E.salto) this.bufSalto = .14; else this.bufSalto = Math.max(0, (this.bufSalto || 0) - dt);
      if (this.bufSalto > 0 && V.salto && (!this.enAire || (this.coyote > 0 && this.vz <= 0))) { this.vz = Math.sqrt(2 * GRAV * .6 * V.salto); this.enAire = true; this.coyote = 0; this.bufSalto = 0; this.eventos.push('salto'); MC.emit('salto', this); }
    }
    if (this.enAire && V.clase !== 'aire') { this.z += this.vz * dt; this.vz -= GRAV * dt; if (this.z <= 0) { this.z = 0; this.enAire = false; this.eventos.push(this.vz < -6 ? 'aterrizaFuerte' : 'aterriza'); this.vz = 0; } }
    /* mover con choques (desliza por el eje libre) */
    const auto = V.clase === 'auto' || V.clase === 'pesado';
    const suelto = auto && !this.paso && (this.tt === TT.NIEVE || (this.tt === TT.LAND || this.tt === TT.GRASS) && (E.lluvia || E.clima?.lluvia || 0) > .35);
    const rumboPrevio = this.rumboRodado ?? this.a;
    this.rumboRodado = suelto ? rumboPrevio + Math.atan2(Math.sin(this.a-rumboPrevio), Math.cos(this.a-rumboPrevio)) * (1-Math.exp(-dt*2.8)) : this.a;
    this.inclinacion = auto ? Math.atan(clamp(this.pend,-.65,.65)) : 0;
    const dx = Math.cos(this.rumboRodado) * this.v * dt, dy = Math.sin(this.rumboRodado) * this.v * dt, nx = this.x + dx, ny = this.y + dy;
    if (this.puede(nx, ny)) { this.x = nx; this.y = ny; }
    else if (this.puede(nx, this.y)) { this.x = nx; this.v *= .7; }
    else if (this.puede(this.x, ny)) { this.y = ny; this.v *= .7; }
    else { if (Math.abs(this.v) > 2.5) { this.eventos.push('choque'); this.choque = .4; MC.emit('choque', this); } this.v *= -.15; }
    this.choque = Math.max(0, this.choque - dt);
    this._niveles(dt);
    this.fase += Math.abs(this.v) * dt * (V.clase === 'pie' ? (this.corriendo ? 2.4 : 3.2) : V.cuerpo === 'pedalea' ? 1.6 : 1.2);
    this.estado = this.nadando && V.clase === 'pie' ? (this.buceando ? 'bucea' : 'nada') : Personaje.estadoPara(V, Math.abs(this.v), this.enAire && V.clase !== 'aire');
    if (!this.nadando) { this.buceando = false; this.aire = Math.min(1, this.aire + dt / 4); }
    /* empujar hacia el agua honda con un vehículo: se baja solo y deja el vehículo en la orilla (y entra nadando) */
    const quiere = (E.dir && E.dir.m > .3) || (E.acel || 0) > .3; if (this.bloqueoAgua && quiere && V.clase !== 'pie' && V.clase !== 'agua' && V.clase !== 'aire') this.empujaAgua += dt; else this.empujaAgua = Math.max(0, this.empujaAgua - dt * 2);
    this.bloqueoAgua = false; if (this.bajarseEnAgua && this.empujaAgua > .6) { this.empujaAgua = 0; this.bajarse('agua'); }
    return this;
  }
  _vuelo(dt, E) {
    const V = this.veh, techo = V.techo || 60;
    if (V.vmin) { const sus = clamp((this.v - V.vmin) / V.vmin, 0, 1); this.vz = lerp(this.vz, (E.sube ? 6 : E.baja ? -6 : 0) * sus + (sus < .3 && this.z > 0 ? -4 : 0), Math.min(1, dt * 2)); }
    else this.vz = lerp(this.vz, E.sube || E.salto ? 5 : E.baja ? -6 : (this.z > 0 ? -1.2 : 0), Math.min(1, dt * 3));
    this.z = clamp(this.z + this.vz * dt, 0, techo); this.enAire = this.z > .05;
  }
  /* ---------- puentes, viaducto, deprimidos y cualquier superficie con altura ----------
     Como el controlador de personaje de los motores grandes: en cada punto hay varias superficies (el terreno y los
     tableros con su rampa). El cuerpo se apoya en la más alta que le quede a la altura de un escalón; lo que queda
     entre los pies y la cabeza es pared; lo que queda arriba de la cabeza se pasa por debajo. Si el apoyo desaparece,
     cae con gravedad (y aterriza en lo que haya abajo). Las barandas no dejan caer del tablero. */
  escalon() { const V = this.veh; return V.clase === 'pie' ? .5 : V.clase === 'aire' ? 1.2 : .35; }
  /* el escalón crece con lo que se avanza en el cuadro: la rampa más empinada sube ~0,62 m por metro */
  escalonDin() { return this.escalon() + Math.abs(this.v) * (this._dt || 1 / 60) * .7; }
  altoCuerpo() { const V = this.veh; return V.clase === 'pesado' ? 3.6 : V.clase === 'auto' ? 1.6 : V.clase === 'aire' ? 2.2 : 1.8; }
  admite(P) {
    const V = this.veh; if (P.tipo === 'viaducto') return !!V.via && V.clase !== 'pie'; if (P.tipo === 'tunel') return !!V.via;
    if (P.peatonal && (V.clase === 'auto' || V.clase === 'pesado' || V.clase === 'moto')) return false;
    if (!P.peatonal && V.clase === 'pie' && P.tipo === 'puente' && P.ancho > 12) return false; return true;
  }
  /* altura del tablero sobre el terreno a s metros del comienzo: rampas suaves en los dos extremos */
  static alturaTablero(P, s) { const rampa = P.tipo === 'viaducto' ? 1e-6 : Math.min(P.largo * .4, P.tipo === 'tunel' ? 26 : P.peatonal ? 9 : 22); return P.nivel * NIVEL_M * suave(clamp(Math.min(s, P.largo - s) / rampa, 0, 1)); }
  /* las superficies en (x, y): [{ h (m sobre el terreno), P (el paso o null), s, lat }] */
  superficies(x, y) {
    const out = [{ h: 0, P: null }], M = this.mundo; if (!M.pasosEn) return out;
    for (const P of M.pasosEn(x - 3, y - 3, x + 3, y + 3)) {
      if (!this.admite(P)) continue; const T = P.trazo || (P.trazo = new Trazo(P.p)), pr = T.proyectar(x, y); if (pr.s < -.3 || pr.s > P.largo + .3) continue;
      const q = T.at(clamp(pr.s, 0, P.largo)), lat = (x - q.x) * -Math.sin(q.a) + (y - q.y) * Math.cos(q.a); if (Math.abs(lat) > P.ancho / 2 + .15) continue;
      /* el deprimido es un corte en el piso: solo se entra por sus extremos y en su sentido (la calle de arriba lo cruza) */
      if (P.tipo === 'tunel' && this.paso !== P && !((pr.s < 3 || pr.s > P.largo - 3) && Math.abs(Math.cos(angDif(this.a, q.a))) > .5)) continue;
      out.push({ h: Cuerpo.alturaTablero(P, pr.s), P, s: pr.s, lat, q });
    }
    if (out.some(S => S.P && S.P.tipo === 'tunel')) out.shift();   // dentro del deprimido no hay piso arriba
    return out;
  }
  /* nadar: «baja» bucea, «sube» o «salto» sale a respirar; quieto, flota despacio hacia arriba. Bajo el agua el aire se gasta
     (unos 35 s, como una persona que no entrena apnea) y arriba se recupera. Sin aire, sube sola. */
  _nadar(dt, E) {
    const ag = Terreno.aguaEn(this.mundo, this.x, this.y), fondo = ag ? -Math.max(0, Math.min(12, ag.prof - .5)) : 0, q = this.sinAire ? 1 : E.baja ? -1 : (E.sube || E.salto) ? 1 : 0;
    this.vz = lerp(this.vz, q * 1.2 + (q === 0 && this.z < 0 ? .3 : 0), Math.min(1, dt * 3)); this.z = clamp(this.z + this.vz * dt, fondo, 0); this.enAire = false;
    this.buceando = this.z < -.6;
    if (this.buceando) { this.aire = Math.max(0, this.aire - dt / this.pulmones); if (this.aire <= 0 && !this.sinAire) { this.sinAire = true; this.eventos.push('sinAire'); MC.emit('sinAire', this); } }
    else { this.aire = Math.min(1, this.aire + dt / 4); if (this.z > -.05 && this.aire > .3) this.sinAire = false; }   /* sin aire: arriba hasta tomar algo de aire */
  }
  _niveles(dt) {
    if (this.nadando && !this.paso) { this.zPaso = 0; return; }   // en el agua manda _nadar (la cota del agua es su superficie)
    if (this.z < 0 && !this.enAire) this.z = 0;
    const pie = this.zPaso + this.z, esc = this.escalonDin(), SS = this.superficies(this.x, this.y); let apoyo = null;
    for (const S of SS) if (S.h <= pie + esc && (!apoyo || S.h > apoyo.h)) apoyo = S;
    if (!apoyo) apoyo = SS.reduce((a, b) => b.h < a.h ? b : a, SS[0]);   // nada a la mano: lo más bajo
    /* barandas: en lo alto del tablero no se sale por los lados */
    if (apoyo.P && Math.abs(apoyo.h) > .6 && apoyo.s > 1 && apoyo.s < apoyo.P.largo - 1) { const med = apoyo.P.ancho / 2 - .3, q = apoyo.q; if (Math.abs(apoyo.lat) > med) { const l = clamp(apoyo.lat, -med, med); this.x = q.x - Math.sin(q.a) * l; this.y = q.y + Math.cos(q.a) * l; } }
    const antes = this.paso; this.paso = apoyo.P; this.sPaso = apoyo.s || 0;
    if (apoyo.P !== antes) { if (apoyo.P) { this.eventos.push('entraPaso'); MC.emit('paso', { cuerpo: this, paso: apoyo.P }); } else this.eventos.push('salePaso'); }
    const V = this.veh;
    if (V.clase === 'aire') { this.z = Math.max(0, pie - apoyo.h); this.zPaso = apoyo.h; return; }
    /* bajar: si el apoyo queda más abajo que un escalón, el cuerpo cae; si no, se pega al piso (rampas en bajada) */
    if (pie - apoyo.h > esc + .05 && !this.enAire) { this.enAire = true; this.vz = Math.min(0, this.vz); this.eventos.push('cae'); }
    if (this.enAire) { this.z = pie - apoyo.h; this.zPaso = apoyo.h; if (this.z <= 0) { this.z = 0; this.enAire = false; this.eventos.push(this.vz < -6 ? 'aterrizaFuerte' : 'aterriza'); this.vz = 0; } }
    else { this.zPaso = apoyo.h; this.z = 0; }
  }
}
Object.assign(MC, { Cuerpo, GRAV });

/* ---- js/32-objetos.js ---- */
/* =====================================================================
   OBJETOS FÍSICOS (3.0) · los artilugios del mundo: conos, balones, canecas, cajas y vallas
   Todo en 3 dimensiones (x, y y la altura z): se empujan con impulso según la masa de quien choca, saltan un poco
   con el golpe, caen por gravedad, rebotan, ruedan con roce, chocan con los muros y se duermen quietos (no cuestan).
   Los mismos objetos en todas las cámaras: la 3D los pone en su malla y las vistas 2D los dibujan encima del suelo.
   Uso:
     const O = new MC.Objetos(mundo); O.poner('cono', x, y); O.sembrar(x, y, 260, 40);   // conos en vías, balones en plazas…
     cada cuadro: O.actualizar(dt, [{ x, y, z, r, masa, vx, vy }]); E.objetos = O;
     evento: MC.on('golpe', { o, fuerza }) para sonido, partículas y peso.
   ===================================================================== */
const TIPOS_OBJ = {
  cono: { r: .22, h: .7, masa: 2, rebote: .35, roce: 2.4, col: '#ff6a13', col2: '#f4f4f4' },
  balon: { r: .12, h: .24, masa: .45, rebote: .72, roce: 1.4, col: '#f5f5f5', col2: '#1b1b1b', rueda: true },
  caneca: { r: .32, h: .9, masa: 7, rebote: .2, roce: 3.2, col: '#2e7d32', col2: '#1b4d20' },
  caja: { r: .33, h: .6, masa: 4, rebote: .25, roce: 3.6, col: '#b07a43', col2: '#7a5129' },
  valla: { r: .55, h: 1, masa: 14, rebote: .15, roce: 4.5, col: '#e8e8e8', col2: '#d62828' }
};
/* 30 piezas de barrio: medidas aproximadas para jugabilidad, no medidas catastrales. */
const TIPOS_OBJ_BARRIO = {
  banca_parque: { r: 0.85, h: 0.85, masa: 75, rebote: 0.12, roce: 5, col: '#6e7f58', col2: '#3b3c38', fijo: true, rompible: false, resistencia: 25 },
  matera_cemento: { r: 0.325, h: 0.65, masa: 90, rebote: 0.18, roce: 2.8, col: '#b6a68c', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 11 },
  bolardo: { r: 0.1, h: 0.78, masa: 55, rebote: 0.18, roce: 5, col: '#737c83', col2: '#3b3c38', fijo: true, rompible: true, resistencia: 14 },
  poste_alumbrado: { r: 0.125, h: 6.5, masa: 210, rebote: 0.18, roce: 5, col: '#b0b7b9', col2: '#3b3c38', fijo: true, rompible: true, resistencia: 16 },
  poste_electrico: { r: 0.16, h: 8, masa: 700, rebote: 0.12, roce: 5, col: '#9a9690', col2: '#3b3c38', fijo: true, rompible: false, resistencia: 90 },
  reja_anden: { r: 1, h: 1.1, masa: 90, rebote: 0.18, roce: 5, col: '#616e74', col2: '#3b3c38', fijo: true, rompible: true, resistencia: 14 },
  moto_parqueada: { r: 1, h: 1.15, masa: 130, rebote: 0.12, roce: 5, col: '#8b6f57', col2: '#3b3c38', fijo: true, rompible: false, resistencia: 75 },
  bici_parqueada: { r: 0.875, h: 1.1, masa: 17, rebote: 0.12, roce: 2.8, col: '#2a7c94', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 50 },
  papelera: { r: 0.2, h: 0.8, masa: 9, rebote: 0.18, roce: 2.8, col: '#38635c', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 6 },
  mesa_cafe: { r: 0.4, h: 0.75, masa: 18, rebote: 0.18, roce: 2.8, col: '#94775e', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 6 },
  silla_plastica: { r: 0.275, h: 0.85, masa: 4, rebote: 0.18, roce: 2.8, col: '#ccbd9c', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 4 },
  sombrilla_comercio: { r: 1.1, h: 2.5, masa: 14, rebote: 0.18, roce: 2.8, col: '#c0a85d', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 5 },
  senal_obra: { r: 0.3, h: 1.1, masa: 5, rebote: 0.18, roce: 2.8, col: '#d78c33', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 4 },
  senal_transito: { r: 0.14, h: 2.2, masa: 35, rebote: 0.18, roce: 5, col: '#b6b6b2', col2: '#3b3c38', fijo: true, rompible: true, resistencia: 12 },
  hidrante: { r: 0.175, h: 0.7, masa: 80, rebote: 0.12, roce: 5, col: '#b64337', col2: '#3b3c38', fijo: true, rompible: false, resistencia: 80 },
  cajon_mercado: { r: 0.3, h: 0.35, masa: 7, rebote: 0.18, roce: 2.8, col: '#91704f', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 5 },
  carrito_ventas: { r: 0.75, h: 1.8, masa: 65, rebote: 0.18, roce: 2.8, col: '#b08551', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 7 },
  barril: { r: 0.3, h: 0.9, masa: 16, rebote: 0.18, roce: 2.8, col: '#626c6f', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 8 },
  llanta: { r: 0.35, h: 0.7, masa: 9, rebote: 0.12, roce: 2.8, col: '#292c2b', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 25 },
  paleta_obra: { r: 0.175, h: 1.6, masa: 3, rebote: 0.18, roce: 2.8, col: '#bc594c', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 3 },
  caja_herramientas: { r: 0.25, h: 0.27, masa: 12, rebote: 0.12, roce: 2.8, col: '#556c70', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 20 },
  tarima: { r: 1, h: 0.35, masa: 65, rebote: 0.18, roce: 2.8, col: '#aa835d', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 12 },
  saco_arena: { r: 0.325, h: 0.25, masa: 25, rebote: 0.12, roce: 2.8, col: '#b4a079', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 35 },
  maleta: { r: 0.21, h: 0.68, masa: 9, rebote: 0.18, roce: 2.8, col: '#3e677f', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 7 },
  maceta_barro: { r: 0.19, h: 0.48, masa: 8, rebote: 0.18, roce: 2.8, col: '#b56e4d', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 4 },
  coche_bebe: { r: 0.45, h: 1.1, masa: 11, rebote: 0.12, roce: 2.8, col: '#5b8086', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 30 },
  canasto: { r: 0.275, h: 0.35, masa: 3, rebote: 0.18, roce: 2.8, col: '#a28859', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 4 },
  escombro: { r: 0.175, h: 0.2, masa: 9, rebote: 0.12, roce: 2.8, col: '#9d9a8e', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 45 },
  escalera_mano: { r: 0.325, h: 1.8, masa: 13, rebote: 0.18, roce: 2.8, col: '#a9afb1', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 7 },
  maceta_colgante: { r: 0.175, h: 1.3, masa: 10, rebote: 0.18, roce: 2.8, col: '#60805a', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 5 }
};
Object.assign(TIPOS_OBJ, TIPOS_OBJ_BARRIO);
class Objetos {
  constructor(mundo, op = {}) {
    this.M = mundo; this.L = []; this.guardado = op.guardado || null;
    this.mundoId = String(op.mundoId || (mundo.meta && (mundo.meta.id || mundo.meta.nombre)) || 'mundo');
    this._repetidos = new Map(); this._ids = new Set();
  }
  /* Coordenadas originales = sector de pertenencia: mover el objeto NO cambia su identidad. */
  poner(tipo, x, y, op = {}) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Coordenadas de objeto inválidas');
    const T = TIPOS_OBJ[tipo] || TIPOS_OBJ.cono, base = tipo + '@' + x.toFixed(2) + ',' + y.toFixed(2);
    const repetido = this._repetidos.get(base) || 0; this._repetidos.set(base, repetido + 1);
    const clave = op.clave == null ? base + '#' + repetido : String(op.clave);
    const id = op.id || (MC.GuardadoSectores ? MC.GuardadoSectores.id(this.mundoId, 'objeto', clave) : this.mundoId + '/objeto/' + encodeURIComponent(clave));
    if (this._ids.has(id)) throw new Error('Objeto duplicado: ' + id);
    const o = Object.assign({ tipo, x, y, z: 0, vx: 0, vy: 0, vz: 0,
      a: op.a ?? h2(x | 0, y | 0, 91) * TAU, va: 0, vuelco: 0, dormido: true,
      roto: false, alterado: false }, T, op);
    o.id = id; o.origenX = x; o.origenY = y;
    const guardado = this.guardado && this.guardado.obtener(x, y, id);
    if (guardado && guardado.tipo === tipo) {
      for (const k of ['x', 'y', 'z', 'vx', 'vy', 'vz', 'a', 'va', 'vuelco']) {
        if (Number.isFinite(guardado[k])) o[k] = guardado[k];
      }
      for (const k of ['dormido', 'roto', 'fijo']) if (typeof guardado[k] === 'boolean') o[k] = guardado[k];
    }
    this.L.push(o); this._ids.add(id); return o;
  }
  /* Se guarda solo lo que se ha movido/roto, nunca todas las piezas del mapa. */
  guardarCambios() {
    if (!this.guardado) return 0;
    let n = 0;
    for (const o of this.L) {
      if (!o.alterado) continue;
      const cambio = { tipo: o.tipo, x: o.x, y: o.y, z: o.z, vx: o.vx, vy: o.vy,
        vz: o.vz, a: o.a, va: o.va, vuelco: o.vuelco, dormido: o.dormido,
        roto: !!o.roto, fijo: !!o.fijo };
      this.guardado.cambiar(o.origenX, o.origenY, o.id, cambio);
      o.alterado = false; n++;
    }
    return n;
  }
  /* siembra objetos que tengan sentido donde caen: conos y vallas en las vías, balones en plazas, canecas y cajas en andenes */
  sembrar(cx, cy, radio = 260, n = 40, sem = 7) {
    const M = this.M, VIAS = new Set([TT.ROAD, TT.AVE]); let k = 0;
    for (let i = 0; i < n * 8 && k < n; i++) {
      const a = h2(i, sem, 92) * TAU, d = Math.sqrt(h2(i, sem, 93)) * radio, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, t = M.suelo(x, y);
      if (M.edificioEn && M.edificioEn(x, y, .6)) continue; const s = h2(i, sem, 94);
      if (t === TT.PLAZA) { this.poner(s < .6 ? 'balon' : 'caneca', x, y); k++; }
      else if (t === TT.WALK) { this.poner(s < .55 ? 'caneca' : 'caja', x, y); k++; }
      else if (VIAS.has(t) && s < .35) { for (let j = 0; j < 3; j++) this.poner('cono', x + j * 1.2, y + j * .4); this.poner('valla', x - 1.6, y - .5); k += 4; }
    }
    return k;
  }
  en(x0, y0, x1, y1) { return this.L.filter(o => o.x >= x0 && o.x <= x1 && o.y >= y0 && o.y <= y1); }
  /* cuerpos: [{ x, y, z, r, masa, vx, vy }] (el jugador, el tráfico): los que chocan empujan */
  actualizar(dt, cuerpos = []) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, .05); const M = this.M, G = 9.81;
    for (const o of this.L) {
      for (const c of cuerpos) {
        const dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy), R = o.r + (c.r || .4); if (d >= R || d < 1e-4 || Math.abs((c.z || 0) - o.z) > o.h + 1.5) continue;
        const nx = dx / d, ny = dy / d, rel = ((c.vx || 0) - o.vx) * nx + ((c.vy || 0) - o.vy) * ny;
        if (o.fijo) {
          /* Barreras ancladas: solo ceden con una colisión fuerte si son deformables. */
          if (rel > (o.resistencia || 12) && o.rompible) {
            o.fijo = false; o.roto = true; o.vuelco = 1; o.dormido = false;
            o.vx = nx * Math.min(3, rel * .15); o.vy = ny * Math.min(3, rel * .15);
            o.alterado = true; MC.emit('golpe', { o, fuerza: rel });
          }
          continue;
        }
        o.x += nx * (R - d); o.y += ny * (R - d); o.alterado = true;  // que no se metan
        if (rel > .2) { const mc = c.masa || 70, J = rel * (1 + o.rebote) * mc / (mc + o.masa); o.vx += nx * J; o.vy += ny * J; o.vz = Math.max(o.vz, Math.min(4.5, J * (o.tipo === 'balon' ? .3 : .18))); o.va += (h2(o.x | 0, o.y | 0, 95) - .5) * J * 2; if (o.tipo === 'cono' || o.tipo === 'valla' || o.tipo === 'caneca') o.vuelco = Math.min(1, o.vuelco + J * .15); o.dormido = false; if (J > 2) MC.emit('golpe', { o, fuerza: J }); }
      }
      if (o.dormido || o.fijo) continue;
      o.alterado = true;
      o.vz -= G * dt; o.z += o.vz * dt;
      if (o.z <= 0) { o.z = 0; o.vz = Math.abs(o.vz) > 1 ? -o.vz * o.rebote : 0; const f = Math.max(0, 1 - o.roce * dt); o.vx *= f; o.vy *= f; o.va *= f; }
      const nx = o.x + o.vx * dt, ny = o.y + o.vy * dt;
      if (M.edificioEn && M.edificioEn(nx, ny, o.r * .5)) { o.vx *= -o.rebote; o.vy *= -o.rebote; } else { o.x = nx; o.y = ny; }
      o.a += o.va * dt;
      if (o.z === 0 && Math.hypot(o.vx, o.vy) < .05 && Math.abs(o.va) < .05) { o.vx = o.vy = o.va = 0; o.dormido = true; }
    }
  }
  /* 3D: la malla de cada objeto (rel: metros del mundo → GL) */
  malla(m, rel, cerca = null, rango = 160) {
    for (const o of this.L) {
      if (cerca && Math.hypot(o.x - cerca.x, o.y - cerca.y) > rango) continue;
      const p = rel(o.x, o.y, this.M.cota(o.x, o.y) + o.z), c = hex3(o.col), c2 = hex3(o.col2), tumb = o.vuelco > .6;
      if (o.tipo === 'balon') m.esfera(p[0], p[1] + o.r, p[2], o.r, o.r, o.r, c, c2, 9, 0);
      else if (o.tipo === 'cono') { if (tumb) m.cajaF(p[0], p[1], p[2], o.a, o.h, o.r * 1.6, o.r * 1.4, c); else { m.cajaF(p[0], p[1], p[2], o.a, o.r * 2.2, o.r * 2.2, .05, hex3('#222')); m.cil(p[0], p[1] + .05, p[2], o.r, o.h, 6, c, 0); m.cil(p[0], p[1] + o.h * .45, p[2], o.r * .55, o.h * .14, 6, c2, o.r * .45); } }
      else if (o.tipo === 'caneca') { if (tumb) m.cajaF(p[0], p[1], p[2], o.a, o.h, o.r * 2, o.r * 2, c); else { m.cil(p[0], p[1], p[2], o.r, o.h, 7, c, o.r * 1.06, c2); } }
      else if (o.tipo === 'valla') { const h = tumb ? .25 : o.h; m.cajaF(p[0], p[1] + (tumb ? 0 : h * .55), p[2], o.a, o.r * 2, .08, h * .4, c2); m.cajaF(p[0], p[1], p[2], o.a, o.r * 2.1, .5, .08, c); }
      else m.cajaF(p[0], p[1], p[2], o.a, o.r * 2, o.r * 2, o.roto ? o.h * .35 : o.h, c, 0, c2);
    }
  }
  /* 2D: encima del suelo con la proyección de la vista (aPantalla) y su escala en px por metro */
  dibujar2D(g, aP, z, cerca = null, rango = 120) {
    for (const o of this.L) {
      if (cerca && Math.hypot(o.x - cerca.x, o.y - cerca.y) > rango) continue; const p = aP(o.x, o.y, o.z); if (!p) continue; const r = Math.max(2, o.r * z), [sx, sy] = p;
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(sx + r * .3, sy + r * .4 + o.z * z * .3, r * 1.1, r * .7, 0, 0, TAU); g.fill();
      g.fillStyle = o.col; g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = Math.max(1, z * .04);
      if (o.tipo === 'balon') { g.beginPath(); g.arc(sx, sy - r, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = o.col2; g.beginPath(); g.arc(sx, sy - r, r * .35, 0, TAU); g.fill(); }
      else if (o.tipo === 'cono' && o.vuelco < .6) { g.beginPath(); g.moveTo(sx - r, sy); g.lineTo(sx, sy - o.h * z); g.lineTo(sx + r, sy); g.closePath(); g.fill(); g.stroke(); g.fillStyle = o.col2; g.fillRect(sx - r * .45, sy - o.h * z * .55, r * .9, Math.max(1, o.h * z * .12)); }
      else { g.save(); g.translate(sx, sy - r * .6); g.rotate(o.a); g.fillRect(-r, -r * .7, r * 2, r * 1.4); g.strokeRect(-r, -r * .7, r * 2, r * 1.4); g.restore(); }
    }
  }
}
Object.assign(MC, { Objetos, TIPOS_OBJ });

/* ---- js/32-piezas.js ---- */
/* Motor City · C-M35: desprendimiento de piezas visuales con gravedad y rebote local.
   Elementos procedurales y originales: no modifica mallas GLB ni simula un taller real.
   Se usa únicamente en el juego que pida daños por piezas (Turno Cero, 18+). */
const TIPOS_PIEZA = {
  capo: {l:1.15,w:1.45,h:.08,color:'#45464a',pos:[1.2,0]},
  baul: {l:.8,w:1.35,h:.09,color:'#45464a',pos:[-1.4,0]},
  puerta_izq:{l:1.1,w:.12,h:.9,color:'#45464a',pos:[0,-.85]},
  puerta_der:{l:1.1,w:.12,h:.9,color:'#45464a',pos:[0,.85]},
  rueda:{l:.52,w:.25,h:.52,color:'#191d23',pos:[-1.1,.75]}
};
class Piezas {
  constructor(mundo,op={}) {this.mundo=mundo;this.lista=[];this.max=op.max||22;this.gravedad=9.81;}
  soltar(tipo,cuerpo,op={}) {
    const cfg=TIPOS_PIEZA[tipo];if(!cfg||!cuerpo||!Number.isFinite(cuerpo.x)||!Number.isFinite(cuerpo.y))return null;
    const a=Number(cuerpo.a)||0,v=Number(cuerpo.v)||0,[u,w]=cfg.pos,ca=Math.cos(a),sa=Math.sin(a),lado=tipo==='puerta_izq'?-1:1;
    const q={tipo,x:cuerpo.x+u*ca-w*sa,y:cuerpo.y+u*sa+w*ca,z:(this.mundo?.cota?.(cuerpo.x,cuerpo.y)||0)+(tipo.includes('puerta')?.65:1.1),
      vx:Math.cos(a)*v*.4-Math.sin(a)*lado*3,vy:Math.sin(a)*v*.4+Math.cos(a)*lado*3,
      vz:2.1+Math.min(4,Math.abs(v)*.16),a,rot:lado*2.3,edad:0,reposo:false};
    this.lista.push(q);if(this.lista.length>this.max)this.lista.shift();
    return q;
  }
  paso(dt) {
    if(!(dt>0)||!Number.isFinite(dt))return;
    dt=Math.min(dt,.05);
    for(const p of this.lista){
      p.edad+=dt;if(p.reposo)continue;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=this.gravedad*dt;p.a+=p.rot*dt;
      const suelo=this.mundo?.cota?.(p.x,p.y)||0;
      if(p.z<=suelo+.08){p.z=suelo+.08;if(Math.abs(p.vz)<1.2){p.vz=0;p.reposo=true;}else p.vz=-p.vz*.26;p.vx*=.68;p.vy*=.68;p.rot*=.6;}
    }
    this.lista=this.lista.filter(p=>p.edad<14);
  }
  limpiar(){this.lista=[];}
  /* Render real 3D a partir de mallas orientadas; sin sprites. */
  malla(m,rel,centro,radio=170){
    if(!m||typeof m.cajaF!=='function')return;
    for(const p of this.lista){
      if(centro&&Math.hypot(p.x-centro.x,p.y-centro.y)>radio)continue;
      const cfg=TIPOS_PIEZA[p.tipo],t=rel(p.x,p.y,p.z);
      m.cajaF(t[0],t[1],t[2],p.a,cfg.l,cfg.w,cfg.h,hex3(cfg.color),0);
    }
  }
  /* Humo 3D austero sobre un vehículo muy dañado; fuego sólo en daño crítico. */
  static motorDano(m,r,a,D,tiempo=0) {
    if(!m||!D||!m.esfera)return;
    const f=Math.max(0,D.f||0,D.b||0,D.l||0,D.r||0);
    if(f<.62)return;
    const c=Math.cos(a),s=Math.sin(a),h=Math.sin(tiempo*2);
    for(let i=0;i<3;i++){
      const v=(tiempo*.4+i/3)%1, x=r[0]+c*1.25+Math.sin(tiempo+i*2)*v*.35, z=r[2]+s*1.25+Math.cos(tiempo+i)*v*.35,
        y=r[1]+1.1+v*2.8;
      m.esfera(x,y,z,.22+v*.35,.18+v*.4,.2+v*.35,[.24,.25,.27],[.16,.16,.18],i,0);
    }
    if(f>.9&&typeof m.cil==='function')m.cil(r[0]+c*1.35,r[1]+1.0,r[2]+s*1.35,.22,.65+Math.abs(h)*.25,5,[.85,.32,.1],0);
  }
}
MC.Piezas = Piezas;
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
   - Sigue al jugador con resortes críticamente amortiguados (igual a cualquier FPS), zona muerta y mirada adelante.
   - 3D: brazo con choque (edificios, cerros y tableros de puentes), campo visual según la velocidad y sacudida por trauma.
   - Lateral: gira de a 90° (girar90) e inclina hasta ver de lado (inclinarA), con animación.
   ===================================================================== */
const CAM_PERFIL = {
  primera: { dist: 0, alto: 1.62, pitch: .08, fov: 1.15 },
  tercera: { dist: 7, alto: 2.6, pitch: .22, fov: 1.0 },
  dron: { dist: 70, alto: 55, pitch: .62, fov: .95 },
  cine: { dist: 28, alto: 9, pitch: .18, fov: .8 },
  aerea: { dist: 900, alto: 650, pitch: .78, fov: .85 },
  /* 3.0: cámaras aéreas sobre el MISMO mundo 3D (fijo: no van detrás del rumbo; siguen el punto con mirada adelante).
     pitch: inclinación de lejos; pitchCerca: de cerca (se ven las fachadas); fov estrecho en la maqueta = casi ortográfica */
  cenital: { fijo: true, pitch: 1.08, pitchCerca: .74, fov: .62, dist: 0, alto: 0 },
  oblicua: { fijo: true, pitch: .86, pitchCerca: .62, fov: .7, dist: 0, alto: 0 },
  maqueta: { fijo: true, pitch: .66, pitchCerca: .58, fov: .3, yaw45: true, dist: 0, alto: 0 }
};
class Camara {
  constructor(op = {}) {
    this.x = op.x || 0; this.y = op.y || 0; this.zoom = op.zoom || 3; this.yaw = 0; this.pitch = .55; this.modo = 'sigue'; this.adelanto = 0;
    this.perfil = 'tercera'; this.d = Object.assign({}, CAM_PERFIL.tercera); this.mira = 0; this.mirarV = 0; this.ojo = [0, 0, 0]; this.blanco = [0, 0, 0]; this.fov = 1; this.orbita = 0;
    this.limites = { zoom: [.08, 14], pitch: [0, 1.45] }; this.tr = null; this.sacudida = 0; this.trauma = 0; this.mundo = op.mundo || null;
    this.yawObj = null; this.pitchObj = null; this._vy = { v: 0 }; this._vp = { v: 0 }; this._vx = { v: 0 }; this._vy2 = { v: 0 }; this._vb = { v: 0 }; this._ve = [{ v: 0 }, { v: 0 }, { v: 0 }]; this.brazo = 1; this.zonaMuerta = op.zonaMuerta ?? 18; this.offPantalla = [0, 0];
  }
  /* gesto de la pantalla (de Controles) */
  gesto(g) {
    if (g.tipo === 'zoom') { const z0 = this.zoom * g.k; this.zoom = clamp(z0, ...this.limites.zoom); if (z0 < this.limites.zoom[0] * .98) MC.emit('zoomTope', 'lejos'); else if (z0 > this.limites.zoom[1] * 1.02) MC.emit('zoomTope', 'cerca'); if (this.perfil === 'tercera' && g.k < 1 && this.d.dist / g.k > 15) MC.emit('zoomTope', 'lejos3p'); this.d.dist = clamp(this.d.dist / g.k, this.perfil === 'primera' ? 0 : 2.5, 2500); }
    else if (g.tipo === 'girar') { this.yawObj = null; this.yaw -= g.da; this.mira -= g.da; }
    else if (g.tipo === 'inclinar') { this.pitchObj = null; this.pitch = clamp(this.pitch + g.dy * .006, ...this.limites.pitch); this.d.pitch = clamp(this.d.pitch + g.dy * .004, -.4, 1.4); }
    else if (g.tipo === 'mirar') { if (this.modo === 'libre') { const c = Math.cos(this.yaw), s = Math.sin(this.yaw); this.x -= (g.dx * c + g.dy * s) / this.zoom; this.y -= (-g.dx * s + g.dy * c) / this.zoom; } else { this.mira += g.dx * .006; this.d.pitch = clamp(this.d.pitch + g.dy * .004, -.4, 1.4); } }
  }
  usarPerfil(p) { if (!CAM_PERFIL[p]) return; this.perfil = p; this.d = Object.assign({}, CAM_PERFIL[p]); this.mira = 0; }
  /* giro y inclinación animados (la vista lateral gira de a 90°, como el mundo de FEZ) */
  girar90(dir = 1) { const base = this.yawObj ?? this.yaw; this.yawObj = Math.round(base / (Math.PI / 2)) * (Math.PI / 2) + dir * Math.PI / 2; return this; }
  girarA(yaw) { this.yawObj = yaw; return this; }
  inclinarA(p) { this.pitchObj = clamp(p, ...this.limites.pitch); return this; }
  /* golpe de cámara por «trauma» (0..1): la sacudida es trauma², con ruido suave, y se apaga sola */
  sacudir(k = .4) { k *= MC.opciones ? MC.opciones.sacudida ?? 1 : 1; this.trauma = clamp((this.trauma || 0) + k, 0, 1); return this; }   // 2.8: se puede bajar o apagar (accesibilidad)
  /* objetivo: { x, y, z (altura de los pies en m), a (rumbo), v, zPaso, mundo } · dt en s */
  actualizar(dt, o) {
    dt = Math.min(dt || 0, .1); this._t = (this._t || 0) + dt;
    if (this.yawObj != null) { this.yaw = resorteAng(this.yaw, this.yawObj, this._vy, .16, dt); if (Math.abs(angDif(this.yaw, this.yawObj)) < 1e-3) { this.yaw = this.yawObj; this.yawObj = null; this._vy.v = 0; } }
    if (this.pitchObj != null) { this.pitch = resorte(this.pitch, this.pitchObj, this._vp, .2, dt); if (Math.abs(this.pitch - this.pitchObj) < 1e-3) { this.pitch = this.pitchObj; this.pitchObj = null; this._vp.v = 0; } }
    if (this.modo === 'sigue' && o) {
      /* mira hacia adelante según la velocidad, con zona muerta (lo pequeño no mueve la cámara: menos mareo) */
      this.adelanto = lerp(this.adelanto, clamp(o.v || 0, -4, 25) * .9, Math.min(1, dt * 1.5));
      const tx = o.x + Math.cos(o.a) * this.adelanto, ty = o.y + Math.sin(o.a) * this.adelanto, zm = this.zonaMuerta / Math.max(.05, this.zoom);
      if (this._fx == null || Math.hypot(tx - this._fx, ty - this._fy) > 400) { this._fx = tx; this._fy = ty; this.x = tx; this.y = ty; }
      const ddx = tx - this._fx, ddy = ty - this._fy, dd = Math.hypot(ddx, ddy); if (dd > zm) { this._fx += ddx * (1 - zm / dd); this._fy += ddy * (1 - zm / dd); }
      this.x = resorte(this.x, this._fx, this._vx, .2, dt); this.y = resorte(this.y, this._fy, this._vy2, .2, dt);
    }
    /* 3D en perspectiva: ojo detrás del rumbo (y lo que el jugador mire con el dedo) */
    if (o && this.d.fijo) this._aereo(dt, o);
    else if (o) {
      const P = this.d, M = o.mundo || this.mundo; this.orbita += dt * (this.perfil === 'cine' ? .12 : 0);
      if (this.perfil !== 'primera' && Math.abs(this.mira) > .001 && !(this._mirando > 0)) this.mira *= Math.pow(.25, dt);
      const ang = (o.a || 0) + this.mira + this.orbita + (this.perfil === 'cine' ? .8 : 0), z0 = o.z || 0, prim = this.perfil === 'primera';
      /* brazo con choque: si un edificio o el cerro quedan entre el jugador y la cámara, la cámara se acerca rápido
         y vuelve despacio (el «spring arm» de los motores grandes); bajo un puente, la cámara no se mete en el tablero */
      let brazo = 1;
      const aereo = this.perfil === 'dron' || this.perfil === 'aerea';
      if (!prim && !aereo && M && P.dist > 1.5) {
        const hz = z0 + 1.6; for (let i = 1; i <= 8; i++) { const t = i / 8, px = o.x - Math.cos(ang) * P.dist * t, py = o.y - Math.sin(ang) * P.dist * t, pz = hz + (P.alto - 1.6) * t, cz = M.cota(px, py); const e = M.edificioEn ? M.edificioEn(px, py, .6) : null; if (pz < cz + .6 || (e && pz < cz + (e.h || 6) + .5)) { brazo = Math.max(.15, (i - 1) / 8); break; } }
      }
      this.brazo = brazo < this.brazo ? lerp(this.brazo, brazo, Math.min(1, dt * 20)) : resorte(this.brazo, brazo, this._vb, .5, dt);
      const dist = prim ? 0 : P.dist * this.brazo, adel = prim ? .28 : 0;
      let ex = o.x - Math.cos(ang) * (dist - adel), ey = o.y - Math.sin(ang) * (dist - adel), ez = prim ? z0 + P.alto + (o.zCuerpo || 0) : z0 + 1.6 + (P.alto - 1.6) * this.brazo;
      if (M && aereo) { const e = M.edificioEn ? M.edificioEn(ex, ey, 2) : null; if (e) ez = Math.max(ez, M.cota(ex, ey) + (e.h || 6) + 4); }   // el dron pasa por encima de las torres
      if (M && !prim) { ez = Math.max(ez, M.cota(ex, ey) + .8); const nv = M.nivel ? M.nivel(ex, ey) : 0; if (nv > 0 && (o.zPaso || 0) < 1) { const techo = M.cota(ex, ey) + nv * NIVEL_M - 1; if (ez > techo - 1.5 && ez < techo + 3) ez = Math.max(z0 + 1.1, techo - 1.5); } }
      const look = prim ? 30 : Math.max(4, dist), lx = o.x + Math.cos(ang) * (prim ? look : 4), ly = o.y + Math.sin(ang) * (prim ? look : 4);
      const lz = prim ? ez - Math.tan(P.pitch) * look : z0 + 1.2 - Math.tan(P.pitch) * 2;
      if (prim || !isFinite(this.ojo[0]) || Math.hypot(this.ojo[0] - ex, this.ojo[1] - ey) > 500) { this.ojo = [ex, ey, ez]; this._ve.forEach(q => q.v = 0); }
      else this.ojo = [resorte(this.ojo[0], ex, this._ve[0], .12, dt), resorte(this.ojo[1], ey, this._ve[1], .12, dt), resorte(this.ojo[2], ez, this._ve[2], .16, dt)];
      this.blanco = [lx, ly, lz];
      /* sensación de velocidad: el campo visual se abre un poco al ir rápido (como en los juegos de carreras) */
      const fovObj = P.fov * (1 + (prim ? .08 : .16) * clamp((Math.abs(o.v || 0) - 8) / 30, 0, 1)); this.fov = lerp(this.fov, fovObj, Math.min(1, dt * 3));
    }
    /* sacudida: trauma² con ruido suave (no un temblor al azar) */
    if (this.sacudida > 0) this.trauma = Math.max(this.trauma || 0, this.sacudida);
    this.sacudida = Math.max(0, this.sacudida - dt * 2); this.trauma = Math.max(0, (this.trauma || 0) - dt * .9);
    const sh = (this.trauma || 0) ** 2; if (sh > 1e-4 && o) { const t = this._t, n = (a, b) => (Math.sin(t * a + b) + Math.sin(t * a * 1.7 + b * 2.3)) / 2; this.ojo = [this.ojo[0] + n(23, 1) * sh * .35, this.ojo[1] + n(19, 2) * sh * .35, this.ojo[2] + n(29, 3) * sh * .25]; this.offPantalla = [n(17, 4) * sh * 6, n(13, 5) * sh * 6]; } else this.offPantalla = [0, 0];
    if (this.tr) { this.tr.t += dt / this.tr.dur; if (this.tr.t >= 1) this.tr = null; }
  }
  /* 3.0: cámara aérea sobre el mundo 3D (cenital, oblicua y maqueta). Sigue el punto (x, y) que ya trae la mirada adelante
     y la zona muerta, con el MISMO encuadre que la vista 2D: la distancia sale del zoom (px por metro) y del alto del lienzo,
     así que pasar de 2D a 3D no salta. Más lejos, más cenital; más cerca, más oblicua (se ven las fachadas), como el mapa
     3D de los navegadores. Con la velocidad y la persecución se aleja y se inclina hacia adelante (Reckless Getaway, #DRIVE);
     en persecución, además, un vaivén lateral; el trauma la sacude. */
  _aereo(dt, o) {
    const P = this.d, M = o.mundo || this.mundo, Hp = this.pantalla ? this.pantalla[1] : 800, Zl = this.limites.zoom;
    const t = clamp(Math.log(this.zoom / Zl[0]) / Math.log(Zl[1] / Zl[0]), 0, 1), vel = clamp((Math.abs(o.v || 0) - 6) / 24, 0, 1), per = clamp(this.persecucion || 0, 0, 1);
    this._vel = lerp(this._vel || 0, vel, Math.min(1, dt * 1.2)); this._per = lerp(this._per || 0, per, Math.min(1, dt * 1.5));
    const pitch = lerp(P.pitch, P.pitchCerca ?? P.pitch, t) - this._vel * .07 - this._per * .05;
    const D = Hp / 2 / Math.max(.05, this.zoom) / Math.tan(P.fov / 2) * (1 + this._vel * .2 + this._per * .22);
    const yaw = P.yaw45 ? Math.PI / 4 + Math.round((this.yaw - Math.PI / 4) / (Math.PI / 2)) * Math.PI / 2 : this.yaw, ux = -Math.sin(yaw), uy = -Math.cos(yaw);
    const zt = (M ? M.cota(this.x, this.y) : 0) + Math.min(6, (o.z || 0) + (o.zPaso || 0)) * .6 + .8;
    let ex = this.x - ux * D * Math.cos(pitch), ey = this.y - uy * D * Math.cos(pitch); const ez = zt + D * Math.sin(pitch);
    if (this._per > .02) { const w = Math.sin(this._t * 1.7) * this._per * D * .03; ex += uy * w; ey -= ux * w; }
    this.ojo = [ex, ey, ez]; this.blanco = [this.x, this.y, zt]; this.fov = P.fov; this.distAerea = D; this.yawAereo = yaw;
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

/* ---- js/35-seres.js ---- */
/* =====================================================================
   SERES · personas, animales y criaturas con biología y ciencia reales
   PERSONAS
   - Proporciones antropométricas (Drillis y Contini) que cambian con la edad (la cabeza es 1/4 del bebé y 1/7,5 del adulto).
   - Biomecánica: velocidad al caminar y al correr por el número de Froude (Fr = v²/gL; se pasa a correr cerca de 0,5).
   - Metabolismo basal (Mifflin‑St Jeor), gasto por actividad (METs), frecuencia cardiaca (Tanaka: 208 − 0,7·edad),
     potencia sostenida (W/kg según el estado físico), energía, hidratación y temperatura con el clima.
   - Genética mendeliana: genes diploides para piel (poligénica), ojos, pelo, rizo y estatura; cruzar dos personas
     da un hijo con los alelos de los dos. El fenotipo sale como el aspecto del personaje único del motor.
   ANIMALES Y CRIATURAS
   - Alometría real a partir de la masa: metabolismo de Kleiber (3,4·M^0,75 W), altura de cadera, velocidad máxima
     (Hirt y otros, 2017), pulso (241·M^−0,25), longevidad y marcha por el número de Froude (paso, trote, galope).
   - Catálogo de especies del valle (perro criollo, gallinazo, colibrí, iguana, zarigüeya, ardilla, caballo…).
   - Criaturas inventadas «entendibles»: plan corporal (patas, segmentos, alas, cola) y prueba de verosimilitud por la
     ley cuadrado‑cubo con la gravedad del planeta (¿aguantan sus huesos su peso?).
   Dibujo de lado en cualquier estilo (vector, silueta o pixel con las vistas) y en 3D con la malla del motor.
   ===================================================================== */
const PROP = { pierna: .530, muslo: .245, canilla: .246, brazo: .186, antebrazo: .146, mano: .108, hombros: .259, cadera: .191, cabeza: .130 };
const GENES = {
  piel: { loci: 6, tipo: 'aditivo' },     // 0–12 alelos oscuros → del más claro al más oscuro
  ojos: { loci: 2, tipo: 'ojos' },        // B (café) domina sobre G (verde) que domina sobre b (azul)
  pelo: { loci: 3, tipo: 'aditivo' },     // eumelanina: 0 rubio … 6 negro
  rizo: { loci: 1, tipo: 'incompleto' },  // LL liso, LR ondulado, RR rizado
  talla: { loci: 8, tipo: 'aditivo' }     // estatura: ±0,09 m alrededor de la media según los alelos
};
const Genetica = {
  azar(r, sexo) { const g = { sexo: sexo || (r() < .5 ? 'f' : 'm') }; for (const [k, G] of Object.entries(GENES)) { g[k] = []; for (let i = 0; i < G.loci; i++) g[k].push(G.tipo === 'ojos' ? [0, 0].map(() => { const x = r(); return x < .55 ? 'B' : x < .75 ? 'G' : 'b'; }) : [r() < .5 ? 1 : 0, r() < .5 ? 1 : 0]); } return g; },
  /* meiosis: de cada locus, un alelo al azar del padre y otro de la madre */
  cruzar(a, b, r, sexo) { const h = { sexo: sexo || (r() < .5 ? 'f' : 'm') }; for (const k of Object.keys(GENES)) h[k] = a[k].map((par, i) => [par[r() < .5 ? 0 : 1], b[k][i][r() < .5 ? 0 : 1]]); return h; },
  fenotipo(g) {
    const suma = k => g[k].reduce((s, p) => s + p[0] + p[1], 0), ojos = g.ojos.flat(), o = ojos.includes('B') ? 'café' : ojos.includes('G') ? 'verde' : 'azul', rz = g.rizo[0][0] + g.rizo[0][1];
    const piel = suma('piel') / 12, pelo = suma('pelo') / 6, talla = (suma('talla') - 8) / 8;
    return { piel, ojos: o, pelo, rizo: ['liso', 'ondulado', 'rizado'][rz], talla, estaturaAdulta: (g.sexo === 'f' ? 1.62 : 1.75) * (1 + .052 * talla) };
  }
};
class Persona {
  /* op: { sexo, edad (años), estatura (m), masa (kg), forma (0 sedentaria … 1 atleta), genoma, semilla } */
  constructor(op = {}) {
    const r = mulberry32(op.semilla ?? 7); this.genoma = op.genoma || Genetica.azar(r, op.sexo); this.sexo = op.sexo || this.genoma.sexo; this.edad = op.edad ?? 30; this.forma = op.forma ?? .5;
    const F = Genetica.fenotipo(this.genoma), crece = this.edad >= 18 ? 1 : clamp(.42 + .58 * Math.pow(this.edad / 18, .8), .3, 1);
    this.estatura = op.estatura ?? F.estaturaAdulta * crece; this.masa = op.masa ?? 22 * this.estatura * this.estatura * (1 + (this.forma - .5) * .1); this.fen = F;
    this.estado = { energia: 1, hidratacion: 1, temp: 37, fc: this.fcReposo, fatiga: 0 };
  }
  get imc() { return this.masa / (this.estatura * this.estatura); }
  /* proporciones del cuerpo en metros (la cabeza pesa más en los niños) */
  get cuerpo() { const H = this.estatura, k = this.edad < 18 ? clamp(.25 - (this.edad / 18) * (.25 - PROP.cabeza), PROP.cabeza, .25) : PROP.cabeza, f = (1 - k) / (1 - PROP.cabeza); const o = {}; for (const [p, v] of Object.entries(PROP)) o[p] = p === 'cabeza' ? k * H : v * H * f; o.ancho = o.hombros * (.85 + .3 * clamp((this.imc - 18) / 15, 0, 1)); return o; }
  /* metabolismo basal (kcal/día, Mifflin‑St Jeor) */
  get tmb() { return 10 * this.masa + 6.25 * this.estatura * 100 - 5 * this.edad + (this.sexo === 'm' ? 5 : -161); }
  get fcMax() { return 208 - .7 * this.edad; }
  get fcReposo() { return 75 - 20 * this.forma; }
  /* velocidades por el número de Froude con la largura de la pierna */
  get vCamina() { return Math.sqrt(.25 * C.g * this.cuerpo.pierna); }
  get vCambio() { return Math.sqrt(.5 * C.g * this.cuerpo.pierna); }
  get vCorre() { return (3.2 + 5.6 * this.forma) * clamp(this.estatura / 1.75, .5, 1.1) * (this.edad > 40 ? 1 - (this.edad - 40) * .006 : 1) * (this.edad < 14 ? .7 + this.edad * .02 : 1); }
  /* potencia sostenible al pedalear (W): 1,5 W/kg sedentario … 4 W/kg atleta */
  get potencia() { return this.masa * (1.5 + 2.5 * this.forma); }
  /* MET aproximado de una actividad a una velocidad v (m/s) */
  met(act, v = 0) { const kmh = v * 3.6; switch (act) { case 'quieto': return 1.3; case 'camina': return clamp(1 + .55 * kmh, 2, 6); case 'corre': return clamp(kmh * 1.02, 6, 20); case 'pedalea': return clamp(3 + .35 * kmh, 3.5, 16); case 'impulsa': case 'patina': case 'tabla': return clamp(3 + .3 * kmh, 3, 12); case 'sentado': return 1.5; default: return 2; } }
  /* un paso de vida: energía, agua, pulso y temperatura según la actividad y el clima (dt en s de juego) */
  vivir(dt, act, v, clima) {
    const E = this.estado, met = this.met(act, v), kcal = met * 3.5 * this.masa / 200 * dt / 60, umbral = 5 + 5 * this.forma, calor = clima ? clamp(((clima.sensacion ?? clima.temp) - 27) / 12, 0, 1) : 0;
    E.energia = clamp(E.energia - (met > umbral ? (met - umbral) * .0009 : -.0012) * dt * (1 + calor * .6), 0, 1);
    E.hidratacion = clamp(E.hidratacion - (.00002 + met * .000004 * (1 + calor * 2)) * dt, 0, 1);
    const int = clamp((met - 1) / 15, 0, 1), fcObj = this.fcReposo + (this.fcMax - this.fcReposo) * int * (1.15 - .3 * E.energia) * (1 + calor * .1); E.fc = lerp(E.fc, fcObj, Math.min(1, dt * .25));
    E.temp = lerp(E.temp, 37 + int * 1.4 + calor * 1.2 - (clima && clima.temp < 5 ? (5 - clima.temp) * .05 : 0), Math.min(1, dt * .01)); E.fatiga = clamp(1 - E.energia * .7 - E.hidratacion * .3, 0, 1);
    return { kcal, met };
  }
  /* rendimiento físico de este momento (0–1): baja con el cansancio, la sed y el calor */
  get rendimiento() { const E = this.estado; return clamp(.35 + .65 * E.energia, .2, 1) * clamp(.6 + .4 * E.hidratacion, .3, 1) * (E.temp > 39 ? .75 : 1); }
  /* el aspecto del personaje único del motor (MC.Personaje) que sale de su genética */
  aspecto(extra = {}) { const F = this.fen; return Personaje.aspecto(Object.assign({ piel: Math.round(F.piel * 6), colPelo: F.pelo > .8 ? 0 : F.pelo > .55 ? 1 : F.pelo > .35 ? 2 : F.pelo > .2 ? 3 : 4, peinado: { liso: 1, ondulado: 3, rizado: 5 }[F.rizo], estatura: this.estatura / 1.72 }, extra)); }
}
/* ---------- animales ---------- */
const ESPECIES = {
  perro_criollo: { n: 'Perro criollo', plan: 'cuadrupedo', masa: 18, colores: ['#c9935e', '#3b2a1e', '#e8dcc8'], cola: .5 },
  gato: { n: 'Gato', plan: 'cuadrupedo', masa: 4.2, colores: ['#e8a35c', '#5a5a5a', '#f2efe8'], cola: .8 },
  caballo: { n: 'Caballo', plan: 'cuadrupedo', masa: 450, colores: ['#6b3f22', '#2b1a10', '#d9c7a8'], cola: .6 },
  vaca: { n: 'Vaca', plan: 'cuadrupedo', masa: 600, colores: ['#f2efe8', '#1d1f24'], cola: .5 },
  zarigueya: { n: 'Zarigüeya (chucha)', plan: 'cuadrupedo', masa: 2.5, colores: ['#9a9890', '#f2efe8'], cola: 1.1 },
  ardilla: { n: 'Ardilla de cola roja', plan: 'cuadrupedo', masa: .3, colores: ['#a5532a', '#e8a35c'], cola: 1.2 },
  iguana: { n: 'Iguana', plan: 'reptil', masa: 4, colores: ['#5f9a3a', '#3d6b2a'], cola: 1.6 },
  gallina: { n: 'Gallina', plan: 'ave_suelo', masa: 2, colores: ['#c45a2a', '#e8dcc8', '#d92b2b'], cola: .3 },
  gallinazo: { n: 'Gallinazo', plan: 'ave', masa: 2, colores: ['#1d1f24', '#3b3d42'], envergadura: 1.45 },
  colibri: { n: 'Colibrí', plan: 'ave', masa: .004, colores: ['#2e9d55', '#c43a26'], envergadura: .11 },
  paloma: { n: 'Paloma', plan: 'ave', masa: .35, colores: ['#8e96a3', '#5d6573'], envergadura: .65 },
  sabaleta: { n: 'Sabaleta', plan: 'pez', masa: .4, colores: ['#9fb4c8', '#d9e4ee'] },
  mariposa: { n: 'Mariposa', plan: 'insecto_volador', masa: .0005, colores: ['#f0a030', '#1d1f24'], envergadura: .08 },
  hormiga_arriera: { n: 'Hormiga arriera', plan: 'insecto', masa: .00002, colores: ['#8a3a22'] }
};
const Animal = {
  ESPECIES,
  /* lo que dice la masa (kg): alometría de los vertebrados terrestres */
  alometria(M, plan = 'cuadrupedo', g = C.g) {
    const k = Math.sqrt(C.g / g), cadera = .17 * Math.pow(M, .36), vmax = plan === 'pez' ? .9 * Math.pow(M, .19) : plan.startsWith('ave') && plan !== 'ave_suelo' ? 14 * Math.pow(M, .12) : 25.5 * Math.pow(M, .26) * (1 - Math.exp(-22 * Math.pow(M, -.6))) / 3.6;
    return { metabolismoW: 3.4 * Math.pow(M, .75), cadera, vmax: vmax * (plan.startsWith('ave') ? 1 : k), pulso: 241 * Math.pow(M, -.25), longevidad: 11.8 * Math.pow(M, .2), largo: .45 * Math.pow(M, .33) * (plan === 'reptil' ? 1.6 : 1), comidaKgDia: 3.4 * Math.pow(M, .75) * 86400 / 1.6e7 };
  },
  /* la marcha que toca a una velocidad (número de Froude con la altura de la cadera) */
  marcha(v, cadera, g = C.g) { const Fr = v * v / (g * Math.max(.01, cadera)); return Fr < .5 ? 'paso' : Fr < 2.5 ? 'trote' : 'galope'; },
  crear(id, semilla = 1) { const E = ESPECIES[id]; if (!E) throw new Error('especie desconocida: ' + id); const r = mulberry32(semilla), M = E.masa * (.85 + r() * .3); return Object.assign({ id, especie: E.n, plan: E.plan, masa: M, colores: E.colores, cola: E.cola || .4, envergadura: E.envergadura, semilla }, Animal.alometria(M, E.plan)); },
  /* criatura inventada: patas, segmentos, alas… y si es verosímil con la gravedad de su planeta (ley cuadrado‑cubo) */
  criatura(op = {}) {
    const g = op.gravedad ?? C.g, M = op.masa ?? 80, patas = op.patas ?? 6, seg = op.segmentos ?? 3, r = mulberry32(op.semilla ?? 3), A = Animal.alometria(M, 'cuadrupedo', g);
    const sigma = 30e6, carga = 3 * M * g / Math.max(1, Math.min(patas, 4)), diam = 2 * Math.sqrt(carga / (Math.PI * sigma)), relDiam = diam / A.cadera;   // hueso que aguanta 3 veces el peso (al correr) con un esfuerzo admisible de 30 MPa (fluencia del hueso ~120 MPa / 4)
    const verosimil = relDiam < .032;   // un saurópodo de 70 t en la Tierra da ~0,016: el doble es el límite de lo creíble
    return Object.assign({ id: 'criatura', especie: op.nombre || 'Criatura', plan: 'alien', patas, segmentos: seg, alas: !!op.alas, ojos: op.ojos ?? (2 + (r() * 3 | 0) * 2), masa: M, gravedad: g, colores: op.colores || ['#7e57c2', '#26c6da', '#ffca28'], huesoRelativo: relDiam, verosimil, nota: verosimil ? 'Sus patas aguantan su peso con esta gravedad.' : 'Con esta gravedad sus patas tendrían que ser muy gruesas: hazla más liviana, con más patas o en un planeta de menos gravedad.' }, A);
  }
};
/* dibujo de lado de un animal o criatura: cuerpo, cabeza, patas que se mueven con su marcha, cola, alas o aletas */
MC.arte.pieles.motor.animalLado = function (g, a, x, y, esc, dir = 1, t = 0, v = 0) {
  const k = esc, X = u => x + u * k * dir, Y = w => y - w * k, c0 = a.colores[0], c1 = a.colores[1] || tono(c0, -.3), L = a.largo || .5, h = a.cadera || .3;
  if (a.plan === 'ave' || a.plan === 'insecto_volador') { const e = (a.envergadura || .5) / 2, alt = h + .2, aleteo = Math.sin(t * (a.plan === 'insecto_volador' ? 30 : a.masa < .01 ? 60 : 6)) * e * .8; g.fillStyle = c0; g.beginPath(); g.ellipse(X(0), Y(alt), L * .5 * k, L * .18 * k, 0, 0, TAU); g.fill(); g.strokeStyle = c1; g.lineWidth = Math.max(1, L * .12 * k); g.beginPath(); g.moveTo(X(-e * .2), Y(alt)); g.lineTo(X(-e * .5), Y(alt + aleteo)); g.moveTo(X(e * .1), Y(alt)); g.lineTo(X(-e * .2), Y(alt + aleteo * .9)); g.stroke(); g.fillStyle = c1; g.beginPath(); g.arc(X(L * .45), Y(alt + L * .08), L * .14 * k, 0, TAU); g.fill(); return; }
  if (a.plan === 'pez') { const o = Math.sin(t * 8) * .1; g.fillStyle = c0; g.beginPath(); g.ellipse(X(0), Y(h), L * .5 * k, L * .18 * k, o * .3, 0, TAU); g.fill(); g.beginPath(); g.moveTo(X(-L * .45), Y(h)); g.lineTo(X(-L * .7), Y(h + L * .15 + o)); g.lineTo(X(-L * .7), Y(h - L * .15 + o)); g.fill(); return; }
  const patas = a.plan === 'alien' ? a.patas : a.plan === 'ave_suelo' ? 2 : a.plan === 'insecto' ? 6 : 4, fase = t * (2 + v / Math.max(.05, h)) * 1.5, cuerpoY = h + (a.plan === 'reptil' ? -h * .5 : 0);
  g.lineCap = 'round';
  for (let i = 0; i < patas; i++) { const u = patas === 2 ? 0 : (i / (patas - 1) - .5) * L * .7, ph = fase + (i % 2) * Math.PI + (patas > 4 ? i * .6 : 0), sw = Math.sin(ph) * h * .35, lev = Math.max(0, Math.cos(ph)) * h * .15; g.strokeStyle = i % 2 ? tono(c0, -.25) : c0; g.lineWidth = Math.max(1, L * .09 * k * (a.huesoRelativo ? 1 + a.huesoRelativo : 1)); g.beginPath(); g.moveTo(X(u), Y(cuerpoY)); g.lineTo(X(u + sw * .5), Y(cuerpoY * .45 + lev)); g.lineTo(X(u + sw), Y(lev)); g.stroke(); }
  const segs = a.plan === 'alien' ? a.segmentos : 1; g.fillStyle = c0; for (let s = 0; s < segs; s++) { const u = segs === 1 ? 0 : (s / (segs - 1) - .5) * L * .8; g.beginPath(); g.ellipse(X(u), Y(cuerpoY + h * .15), L * .5 / Math.sqrt(segs) * k, Math.max(h * .3, L * .16) * k, 0, 0, TAU); g.fill(); }
  if (a.cola) { g.strokeStyle = c0; g.lineWidth = Math.max(1, L * .07 * k); g.beginPath(); g.moveTo(X(-L * .45), Y(cuerpoY + h * .2)); g.quadraticCurveTo(X(-L * (.5 + a.cola * .4)), Y(cuerpoY + h * .5 + Math.sin(t * 3) * h * .1), X(-L * (.5 + a.cola * .6)), Y(cuerpoY + h * (.35 + .2 * Math.sin(t * 3)))); g.stroke(); }
  const hx = L * .52, hy = cuerpoY + h * .45; g.fillStyle = c0; g.beginPath(); g.ellipse(X(hx), Y(hy), L * .17 * k, L * .14 * k, 0, 0, TAU); g.fill();
  g.fillStyle = '#141414'; const ojos = a.plan === 'alien' ? a.ojos : 1; for (let o = 0; o < ojos; o++) { g.beginPath(); g.arc(X(hx + L * .07), Y(hy + L * .03 + (o - (ojos - 1) / 2) * L * .05), Math.max(1, L * .025 * k), 0, TAU); g.fill(); }
  if (a.plan === 'ave_suelo') { g.fillStyle = a.colores[2] || '#d92b2b'; g.beginPath(); g.arc(X(hx), Y(hy + L * .14), L * .05 * k, 0, TAU); g.fill(); }
};
MC.Seres = { Persona, Animal, Genetica, GENES, PROP, ESPECIES };

/* ---- js/36-taller.js ---- */
/* =====================================================================
   TALLER DE VEHÍCULOS · diseñar cualquier vehículo con ingeniería real y manejarlo
   - Ficha técnica → desempeño calculado: velocidad máxima (potencia = arrastre + rodadura), 0–100 km/h (integrando
     el par del motor por marchas y el límite de agarre μ·m·g), frenada de 100 a 0, autonomía y CO₂ por km
     (energía del combustible o de la batería con su eficiencia), velocidad de pérdida de un avión, velocidad de
     casco de una lancha y potencia humana de una bici (con MC.Seres).
   - El vehículo diseñado se registra en MC.Vehiculos con sus cifras reales y su modelo de manejo.
   - Física de carro (modelo de bicicleta con dos ejes): par por marchas, arrastre, rodadura, pendiente, agarre
     lateral con saturación (las llantas «se rinden» y el carro derrapa), freno de mano para drift y clima (MC.Ambiente).
   ===================================================================== */
const Taller = {
  /* ficha: { id, n, tipo ('carro'|'moto'|'bici'|'avion'|'lancha'|'camion'), masa, potenciaKW, parNm, rpmMax, marchas, final, rueda,
             cd, area, crr, mu, traccion (0..1 de la masa en el eje motriz), combustible, tanqueL, bateriaKWh, eficiencia,
             alasM2, clMax, esloraM, ciclista (MC.Seres.Persona) } */
  disenar(f) {
    const F = Object.assign({ tipo: 'carro', masa: 1200, potenciaKW: 80, parNm: 150, rpmMax: 6500, marchas: [3.6, 2.1, 1.4, 1.0, .8], final: 3.9, rueda: .31, cd: .32, area: 2.1, crr: .012, mu: .9, traccion: .6, combustible: 'gasolina', tanqueL: 45, eficiencia: null }, f);
    const P = F.tipo === 'bici' && F.ciclista ? F.ciclista.potencia : F.potenciaKW * 1000, m = F.masa + (F.ciclista ? F.ciclista.masa : F.tipo === 'bici' ? 75 : 75);
    const vmax = Fis.vmaxPotencia(P * (F.tipo === 'bici' ? 1 : .9), m, F.cd, F.area, F.crr);
    /* 0–100 km/h: integración con par por marchas (curva parabólica con pico en el 70 % de las rpm) y límite de tracción */
    const cien = (() => { if (vmax < 27.8) return null; let v = 0, t = 0, mar = 0; const dt = .01; while (v < 27.78 && t < 60) { const rpm = clamp(v / F.rueda * F.marchas[mar] * F.final * 60 / TAU, 1000, F.rpmMax), par = F.parNm * (1 - Math.pow((rpm / F.rpmMax - .7) / .7, 2) * .6), Fm = Math.min(par * F.marchas[mar] * F.final / F.rueda * .9, P / Math.max(v, 1)), Ft = Math.min(Fm, F.mu * m * C.g * F.traccion), Fr = Fis.arrastre(C.rhoAire, v, F.cd, F.area) + Fis.rodadura(F.crr, m); v += (Ft - Fr) / m * dt; t += dt; if (rpm >= F.rpmMax * .97 && mar < F.marchas.length - 1) { mar++; t += .25; } } return t; })();
    const frenada = Fis.frenada(27.78, F.mu);
    /* consumo a 90 km/h: potencia en la rueda / eficiencia → energía por km */
    const v90 = 25, Pr = (Fis.arrastre(C.rhoAire, v90, F.cd, F.area) + Fis.rodadura(F.crr, m)) * v90, efi = F.eficiencia ?? (F.bateriaKWh ? .85 : F.tipo === 'bici' ? .24 : .27), MJkm = Pr / efi / v90 * 1000 / 1e6;
    let autonomia = null, consumo = null, co2 = null;
    if (F.bateriaKWh) { autonomia = F.bateriaKWh * 3.6 / MJkm; consumo = MJkm / 3.6 * 100; co2 = 0; }
    else if (F.tipo !== 'bici' && Quim.COMBUSTIBLES[F.combustible]) { const Q = Quim.COMBUSTIBLES[F.combustible]; consumo = MJkm / Q.MJL * 100; autonomia = F.tanqueL / (consumo / 100); co2 = (Q.CO2kgL || 0) * consumo / 100 * 1000; }
    else if (F.tipo === 'bici') { consumo = MJkm / 4.184e-3; }   // kcal por km del ciclista
    const r = { ficha: F, masaTotal: m, vmax, ceroCien: cien, frenada100: frenada, consumo, autonomia, co2gkm: co2, potenciaPeso: P / m };
    if (F.tipo === 'avion') { const atm = Fis.atmosfera(F.altitud || 0); r.vPerdida = Math.sqrt(2 * m * C.g / (atm.rho * (F.alasM2 || 16) * (F.clMax || 1.6))); }
    if (F.tipo === 'lancha') r.vCasco = 1.25 * Math.sqrt(F.esloraM || 5);
    return r;
  },
  /* registra el diseño como vehículo jugable del motor (con sus cifras reales y el modelo de manejo) */
  registrar(d, extra = {}) {
    const F = d.ficha, clase = { carro: 'auto', moto: 'moto', bici: 'rueda', avion: 'aire', lancha: 'agua', camion: 'pesado' }[F.tipo] || 'auto', base = { auto: 'carro', moto: 'moto', rueda: 'bici', aire: 'avioneta', agua: 'lancha', pesado: 'camion' }[clase];
    const acc = d.ceroCien ? 27.78 / d.ceroCien : d.potenciaPeso * .25, v = Object.assign({ id: F.id || 'disenado_' + Math.round(F.masa), n: F.n || 'Mi vehículo', de: base, vmax: d.vmax, acc, freno: F.mu * C.g * .9, masa: d.masaTotal, largo: F.largo || (clase === 'auto' ? 4.3 : clase === 'moto' ? 2.1 : 1.8), ancho: F.ancho || (clase === 'auto' ? 1.8 : .8), ficha: F, desempeno: d, dinamica: clase === 'auto' || clase === 'pesado' ? 'carro' : null, color: F.color || '#00e5ff', vmin: d.vPerdida }, extra);
    return Vehiculos.registrar(v);
  }
};
/* ---------- manejo de carro: modelo de bicicleta con agarre que se satura (derrape) ---------- */
class ManejoCarro {
  constructor(v) { const F = v.ficha || {}; this.v = v; this.m = v.masa || 1200; this.L = F.distEjes || 2.6; this.a = this.L * .45; this.b = this.L - this.a; this.Iz = this.m * (this.L * this.L) / 12 * 1.4; this.mu = F.mu || .9; this.Cf = 80000 * this.m / 1200; this.Cr = 90000 * this.m / 1200; this.vx = 0; this.vy = 0; this.r = 0; this.marcha = 1; }
  /* E: { acel, giro, freno de mano (salto) } · ambiente: { agarre (clima × suelo), pend } · devuelve { avance, lateral, giro } por segundo */
  paso(dt, C2, E, amb = {}) {
    const v = this.v, F = v.ficha || {}, mu = this.mu * (amb.agarre ?? 1), N = this.m * C.g, delta = (E.giro || 0) * (.55 - .35 * clamp(Math.abs(this.vx) / 40, 0, 1)), mano = !!E.salto;
    const Pm = (F.potenciaKW || v.vmax * v.acc * this.m / 1000 * .5) * 1000, rev = (E.acel || 0) < 0 && this.vx < 1, Fmotor = (E.acel || 0) > 0 ? Math.min(Pm / Math.max(3, Math.abs(this.vx)), mu * N * (F.traccion || .6)) * E.acel : rev && this.vx > -8 ? Math.min(Pm / 3, mu * N * (F.traccion || .6)) * .45 * E.acel : 0, Ffreno = (E.acel || 0) < 0 && !rev ? -E.acel * mu * N * .9 * Math.sign(this.vx || 1) : 0;   /* 4.0.2: con el carro casi quieto, frenar es reversa (hasta 8 m/s) */
    const Fres = Fis.arrastre(C.rhoAire, this.vx, F.cd || .32, F.area || 2.1) * Math.sign(this.vx) + Fis.rodadura(F.crr || .012, this.m) * Math.sign(this.vx) + Fis.pendiente(this.m, amb.pend || 0);
    /* ángulos de deriva de cada eje y fuerzas laterales con saturación (μ·carga del eje) */
    const vx = Math.max(.5, Math.abs(this.vx)) * Math.sign(this.vx || 1), af = Math.atan2(this.vy + this.a * this.r, Math.abs(vx)) - delta * Math.sign(vx), ar = Math.atan2(this.vy - this.b * this.r, Math.abs(vx));
    const Nf = N * this.b / this.L, Nr = N * this.a / this.L, sat = (Cx, al, Nn) => clamp(-Cx * al, -mu * Nn, mu * Nn), Fyf = sat(this.Cf, af, Nf), Fyr = sat(this.Cr * (mano ? .25 : 1), ar, Nr) * (Math.abs(Fmotor) > mu * Nr * .8 ? .6 : 1);
    const ax = (Fmotor - Ffreno - Fres - Fyf * Math.sin(delta)) / this.m + this.vy * this.r, ay = (Fyf * Math.cos(delta) + Fyr) / this.m - this.vx * this.r, ar2 = (this.a * Fyf * Math.cos(delta) - this.b * Fyr) / this.Iz;
    this.vx += ax * dt; this.vy += ay * dt; this.r += ar2 * dt; if (Math.abs(this.vx) < .3 && !E.acel) { this.vx = 0; this.vy *= .8; this.r *= .8; }
    this.vy *= Math.pow(.2, dt); this.derrape = Math.abs(Math.atan2(this.vy, Math.abs(this.vx) + .1));
    return { avance: this.vx, lateral: this.vy, giro: this.r, derrape: this.derrape };
  }
}
Object.assign(MC, { Taller, ManejoCarro });
/* el cuerpo del jugador usa el manejo de carro cuando su vehículo lo pide (sin tocar la física base) */
Cuerpo.prototype._actualizarBase = Cuerpo.prototype.actualizar;
Cuerpo.prototype.actualizar = function (dt, E = {}) {
  const V = this.veh; if (V.dinamica !== 'carro') { this._carro = null; return this._actualizarBase(dt, E); }
  dt = Math.min(dt, .05); this.eventos.length = 0; if (!this._carro || this._carro.v !== V) { this._carro = new ManejoCarro(V); this._carro.vx = this.v; }
  let acel = E.acel || 0, giro = E.giro || 0;
  if (E.dir && E.dir.m > .08) { const d = angDif(this.a, Math.atan2(E.dir.y, E.dir.x));
    /* 4.0.2: el destino quedó atrás → frena y, ya despacio, retrocede girando al revés (vuelta en tres puntos); antes se quedaba quieto */
    if (Math.abs(d) > 2.2) { if (this._carro.vx > 2) { acel = -.7; giro = clamp(d * 2, -1, 1); } else { acel = -.6 * Math.max(.5, E.dir.m); giro = -Math.sign(d); } }
    else { giro = clamp(d * 2, -1, 1); acel = E.dir.m; } }
  this.tt = this.mundo.suelo(this.x, this.y); this.pend = this.mundo.pendiente(this.x, this.y, this.a, 12);
  const agarre = (TT_SUPERFICIE[this.tt] || .5) / (this.tt === TT.CICLO ? 1.3 : 1) * Ambiente.agarre(this.clima), R = this._carro.paso(dt, null, { acel, giro, salto: E.salto || E.turbo && false }, { agarre: clamp(agarre, .1, 1), pend: this.pend });
  const ca = Math.cos(this.a), sa = Math.sin(this.a), nx = this.x + (ca * R.avance - sa * R.lateral) * dt, ny = this.y + (sa * R.avance + ca * R.lateral) * dt;
  if (this.puede(nx, ny)) { this.x = nx; this.y = ny; } else { if (Math.abs(R.avance) > 4) { this.eventos.push('choque'); MC.emit('choque', this); } this._carro.vx *= -.2; this._carro.vy = 0; this._carro.r = 0; }
  this.a += R.giro * dt; this.v = R.avance; this.derrape = R.derrape; this._niveles(dt); this.estado = 'sentado'; return this;
};

/* ---- js/37-manejo.js ---- */
/* =====================================================================
   MANEJO · tipos de control, sensibilidad y asistencias (que todo se sienta fluido e intuitivo)
   - CURVAS DE RESPUESTA: zona muerta radial (sin «deriva» del dedo o del mando) y respuesta exponencial: lo pequeño
     es preciso y lo grande es rápido. Cada clase de vehículo tiene su perfil (a pie es directo; el carro es suave).
   - GIRO SEGÚN LA VELOCIDAD: a más velocidad, menos giro por el mismo gesto (como la dirección real y los juegos de
     carreras): nada de trompos por un dedo nervioso.
   - ESQUEMAS: joystick flotante o fijo, volante con pedales, tocar para ir (camino A* por las calles), inclinar el
     celular, un pulgar (acelera solo) y carriles (deslizar, como los corredores). El teclado y el mando sirven siempre.
   - ASISTENCIAS (se apagan en «experto»): acelerar solo, frenar antes de las curvas (v = √(μ·g/κ)), imán de calle
     (alinea suave con la vía cuando ya casi va derecho) y freno de llegada en «tocar para ir».
   Uso: const entrada = MC.Manejo.aplicar(controles.leer(), cuerpo, { camara, esquema: 'joystick', vista: 'mundo'|'volante' })
        cuerpo.actualizar(dt, entrada)
   ===================================================================== */
const PERFIL_MANEJO = {
  pie: { zm: .1, expo: 1.15, giroVel: 0 }, rueda: { zm: .12, expo: 1.35, giroVel: .35 }, moto: { zm: .12, expo: 1.55, giroVel: .55 },
  auto: { zm: .1, expo: 1.75, giroVel: .62 }, pesado: { zm: .1, expo: 1.9, giroVel: .7 }, aire: { zm: .12, expo: 1.5, giroVel: .3 }, agua: { zm: .12, expo: 1.6, giroVel: .4 }, riel: { zm: .1, expo: 1, giroVel: 0 }, cable: { zm: .1, expo: 1, giroVel: 0 }
};
const ESQUEMAS = {
  joystick: { n: 'Joystick', icono: '🕹️', ayuda: 'Pon el pulgar a la izquierda y arrastra hacia donde quieres ir.' },
  joystick_fijo: { n: 'Joystick fijo', icono: '🎯', ayuda: 'El joystick queda siempre en el mismo lugar, abajo a la izquierda.' },
  volante: { n: 'Volante y pedales', icono: '🛞', ayuda: 'Izquierda y derecha para girar; a la derecha, acelerar y frenar.' },
  tocar_ir: { n: 'Tocar para ir', icono: '👆', ayuda: 'Toca un punto del mapa y el personaje va solo por las calles.' },
  inclinacion: { n: 'Inclinar el celular', icono: '📱', ayuda: 'Inclina el celular para girar; acelera solo.' },
  un_pulgar: { n: 'Un pulgar', icono: '👍', ayuda: 'Acelera solo; desliza para girar y mantén oprimido para frenar.' },
  carriles: { n: 'Carriles', icono: '↔️', ayuda: 'Desliza a los lados para cambiar de carril y hacia arriba para saltar.' }
};
const Manejo = {
  PERFIL: PERFIL_MANEJO, ESQUEMAS,
  /* zona muerta radial con reescalado y respuesta exponencial: entra 0..1, sale 0..1 */
  curva(m, p = PERFIL_MANEJO.rueda) { if (m <= p.zm) return 0; const t = Math.min(1, (m - p.zm) / (1 - p.zm)); return Math.pow(t, p.expo); },
  /* giro efectivo a la velocidad v de un vehículo de velocidad máxima vmax */
  giroPorVelocidad(giro, v, vmax, p) { const r = clamp(Math.abs(v) / Math.max(1, vmax), 0, 1); return giro / (1 + p.giroVel * 2.2 * r * r); },
  /* velocidad segura en una curva de curvatura κ (1/m) con agarre μ: la misma que usan los pilotos de la IA */
  vSegura(kappa, mu = .8) { return Math.sqrt(mu * 9.81 / Math.max(1e-4, Math.abs(kappa))); },
  /* traduce la entrada cruda (MC.Controles.leer) a la entrada del cuerpo (MC.Cuerpo.actualizar) */
  aplicar(ent, C, op = {}) {
    const V = C.veh, P = Object.assign({}, PERFIL_MANEJO[V.clase] || PERFIL_MANEJO.rueda, op.perfil || {}), A = Object.assign({ autoAcelerar: false, frenoCurvas: true, imanCalle: true }, op.asist || {}), esq = op.esquema || 'joystick';
    const s = ent.stick || { x: 0, y: 0, m: 0 }, m0 = Math.min(1, Math.hypot(s.x, s.y)), m = Manejo.curva(m0, P), k = m0 > 0 ? m / m0 : 0, sx = s.x * k, sy = s.y * k;
    const out = { salto: ent.salto, turbo: ent.turbo, correr: ent.correr, sube: ent.sube, baja: ent.baja, acel: 0, giro: 0 };
    const vmax = C.vmax ? C.vmax() : V.vmax || 5, volante = op.vista === 'volante' || esq === 'volante' || esq === 'inclinacion' || esq === 'un_pulgar' || esq === 'carriles';
    if (!volante) {
      /* el stick apunta en el mundo, relativo a la cámara (lo natural en cenital, 3D oblicua, maqueta y lateral) */
      const yaw = op.camara ? op.camara.yaw : 0, c = Math.cos(yaw), sn = Math.sin(yaw);
      if (m > 0) out.dir = { x: sx * c + sy * sn, y: -sx * sn + sy * c, m };
      out.acel = ent.acel || 0; out.giro = ent.giro || 0;
    } else {
      let giro = esq === 'inclinacion' ? Manejo.inclinacion() : (sx || ent.giro || 0);
      out.giro = Manejo.giroPorVelocidad(clamp(giro, -1, 1), C.v, vmax, P);
      out.acel = -sy || ent.acel || 0; if (esq === 'un_pulgar' || esq === 'inclinacion' || A.autoAcelerar) out.acel = ent.freno || (ent.acel < 0) ? -1 : Math.max(out.acel, .85);
    }
    /* frenar antes de la curva: mira la vía de adelante (si el juego la da) y no deja pasar de la velocidad segura */
    if (A.frenoCurvas && op.curvaAdelante != null && V.clase !== 'pie') { const vs = Manejo.vSegura(op.curvaAdelante, op.mu || .8); if (C.v > vs && out.acel > 0) out.acel = C.v > vs * 1.08 ? -.6 : 0; }
    /* imán de calle: si ya casi va derecho por la vía, la alinea suave (no lucha contra el jugador) */
    if (A.imanCalle && op.rumboVia != null && V.clase !== 'pie' && Math.abs(out.giro) < .25 && !out.dir) { const d = angDif(C.a, op.rumboVia), d2 = Math.abs(d) > Math.PI / 2 ? angDif(C.a, op.rumboVia + Math.PI) : d; if (Math.abs(d2) < .35) out.giro += clamp(d2 * 1.5, -.25, .25); }
    return out;
  },
  /* inclinar el celular: γ (izquierda/derecha) con zona muerta; pide permiso en iPhone (llámalo desde un toque) */
  _incl: 0,
  activarInclinacion() {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) return Promise.resolve(false);
    const on = () => { window.addEventListener('deviceorientation', e => { const g = (screen.orientation && Math.abs(screen.orientation.angle) === 90) ? e.beta : e.gamma; Manejo._incl = clamp((g || 0) / 30, -1, 1); }); return true; };
    if (typeof DeviceOrientationEvent.requestPermission === 'function') return DeviceOrientationEvent.requestPermission().then(r => r === 'granted' && on()).catch(() => false);
    return Promise.resolve(on());
  },
  inclinacion() { const v = Manejo._incl; return Math.abs(v) < .08 ? 0 : (v - Math.sign(v) * .08) / .92; },
  /* tocar para ir: el camino por la red (A*) hasta el punto tocado; cada cuadro, la dirección al siguiente punto */
  rutaA(mundo, desde, hasta, red = 'peaton') {
    try { const R = mundo.red(red), a = R.cercana(desde.x, desde.y, 120), b = R.cercana(hasta.x, hasta.y, 120); if (!a || !b) return [hasta.x, hasta.y];
      /* 4.0.2: los puntos de una calle entre dos distancias s0 → s1 (en ese orden), para seguir su forma y no cortar en línea recta por encima de casas */
      const tramo = (e, s0, s1, P) => { const p = e.t.p, cum = e.t.cum, n = p.length >> 1; if (!cum) return; if (s1 >= s0) { for (let k = 0; k < n; k++) if (cum[k] > s0 && cum[k] < s1) P.push(p[2 * k], p[2 * k + 1]); } else { for (let k = n - 1; k >= 0; k--) if (cum[k] < s0 && cum[k] > s1) P.push(p[2 * k], p[2 * k + 1]); } };
      const ea = a.arista, eb = b.arista; if (ea === eb) { const P = [desde.x, desde.y, a.x, a.y]; tramo(ea, a.s, b.s, P); P.push(b.x, b.y, hasta.x, hasta.y); return P; }   // la misma calle: por la calle
      const r = R.caminoEntre([[ea.a, a.s], [ea.b, ea.largo - a.s]], [[eb.a, b.s], [eb.b, eb.largo - b.s]]);
      if (!r) return [hasta.x, hasta.y]; const C = r.C, P = [desde.x, desde.y, a.x, a.y]; tramo(ea, a.s, r.ini === ea.a ? 0 : ea.largo, P); P.push(R.nodos[r.ini].x, R.nodos[r.ini].y);
      for (const { arista: e, adelante } of C) { const p = e.t.p, n = p.length; if (adelante) for (let i = 0; i < n; i += 2) P.push(p[i], p[i + 1]); else for (let i = n - 2; i >= 0; i -= 2) P.push(p[i], p[i + 1]); }
      tramo(eb, r.fin === eb.a ? 0 : eb.largo, b.s, P); P.push(b.x, b.y, hasta.x, hasta.y); return P; } catch (e) { return [hasta.x, hasta.y]; }
  },
  seguirRuta(C, ruta, op = {}) {
    if (!ruta || ruta.length < 2) return null; let i = ruta._i || 0; while (i + 3 < ruta.length && Math.hypot(ruta[i] - C.x, ruta[i + 1] - C.y) < (op.radio || 3)) i += 2; ruta._i = i;
    const tx = ruta[i], ty = ruta[i + 1], d = Math.hypot(tx - C.x, ty - C.y), ultimo = i + 2 >= ruta.length; if (ultimo && d < 1.2) return { llego: true, acel: 0 };
    return { dir: { x: (tx - C.x) / (d || 1), y: (ty - C.y) / (d || 1), m: ultimo ? clamp(d / 6, .3, 1) : 1 } };   // frena al llegar
  },
  /* 4.0.2 · piloto de la IA sobre una ruta: mira más adelante (persecución pura), frena en las curvas y, si se atasca
     contra un árbol, un poste o una pared, retrocede girando y pide una ruta nueva. Lo usan las patrullas, la banda,
     El Contador y los rivales de carrera. Devuelve { atascado } cuando hay que volver a planear. */
  pilotar(C, ruta, dt, op = {}) {
    const S = C._piloto || (C._piloto = { atasco: 0, reversa: 0, giroRev: .7, t: 0 }); S.t += dt; C.ia = true;
    if (S.reversa > 0) { S.reversa -= dt; C.actualizar(dt, { acel: -.5, giro: S.giroRev }); return { reversa: true }; }
    /* ruta nueva: empieza en el punto más cercano que no quede atrás (rutaA arranca en un nodo que puede estar detrás) */
    if (ruta._i == null) { const ca = Math.cos(C.a), sa = Math.sin(C.a); let mejor = 0, md = 1e9; for (let j = 0; j < Math.min(ruta.length, 80); j += 2) { const dx = ruta[j] - C.x, dy = ruta[j + 1] - C.y, dd = Math.hypot(dx, dy), atras = dx * ca + dy * sa < -2 && dd < 40; const sc = dd + (atras ? 60 : 0); if (sc < md) { md = sc; mejor = j; } } ruta._i = mejor; }
    const m = Manejo.seguirRuta(C, ruta, { radio: op.radio || 6 }); if (!m || !m.dir) { C.actualizar(dt, { acel: -.4, giro: 0 }); return m; }
    let i = ruta._i || 0, falta = (op.mira || 4) + Math.abs(C.v) * .35, px = C.x, py = C.y, tx = ruta[i], ty = ruta[i + 1];
    while (i + 1 < ruta.length) { const qx = ruta[i], qy = ruta[i + 1], L = Math.hypot(qx - px, qy - py); if (L >= falta) { tx = px + (qx - px) * falta / L; ty = py + (qy - py) * falta / L; break; } falta -= L; px = qx; py = qy; tx = qx; ty = qy; i += 2; }
    /* la curva que viene: cuánto gira la ruta entre el punto que mira y uno más lejos; a más curva, menos velocidad */
    let cx = tx, cy = ty; { let f2 = 12 + Math.abs(C.v) * .6, jx = tx, jy = ty, j = i; while (j + 1 < ruta.length) { const qx = ruta[j], qy = ruta[j + 1], L = Math.hypot(qx - jx, qy - jy); if (L >= f2) { cx = jx + (qx - jx) * f2 / L; cy = jy + (qy - jy) * f2 / L; break; } f2 -= L; jx = qx; jy = qy; cx = qx; cy = qy; j += 2; } }
    const dx = tx - C.x, dy = ty - C.y, d = Math.hypot(dx, dy) || 1, giro = Math.abs(angDif(Math.atan2(dy, dx), C.a)), curva = Math.abs(angDif(Math.atan2(dy, dx), Math.atan2(cy - ty, cx - tx))), vSegura = 6 + 26 * Math.max(0, 1 - curva / 1.4);
    /* el destino quedó atrás: vuelta en tres puntos con cualquier física (frena; ya despacio, retrocede girando al revés), sin salirse de la calle */
    /* (arcade, solo para la IA: el jugador maneja con su física) casi quieta y con el destino a la espalda, gira en su sitio */
    const dS = angDif(C.a, Math.atan2(dy, dx)); if (S.vuelta || Math.abs(dS) > 1.75) { S.vuelta = Math.abs(dS) > .5; if (S.vuelta) { if (Math.abs(C.v) > 3) C.actualizar(dt, { acel: -1, giro: 0 }); else { C.a += Math.sign(dS) * Math.min(Math.abs(dS), 2.4 * dt); C.v *= .8; C.actualizar(dt, { acel: 0, giro: 0 }); } return { vuelta: true }; } }
    const k = (giro > 1.2 ? .4 : giro > .6 ? .68 : 1) * (Math.abs(C.v) > vSegura ? .15 : 1);
    C.actualizar(dt, { dir: { x: dx / d, y: dy / d, m: k * (op.m || 1) * (m.dir.m || 1) }, turbo: !!op.turbo && giro < .3, lluvia: op.lluvia || 0 });
    if (Math.abs(C.v) < 1.2 && C.bloqueo) S.atasco += dt; else S.atasco = Math.max(0, S.atasco - dt * 2);
    S.lento = Math.abs(C.v) < 1 ? (S.lento || 0) + dt : 0;
    /* atascado contra algo, quieto demasiado tiempo o con el objetivo a la espalda: maniobra en tres puntos (reversa girando hacia el otro lado) */
    if (S.atasco > .8 || S.lento > 2.2) { const lado = Math.sign(angDif(C.a, Math.atan2(dy, dx))) || 1; S.atasco = 0; S.lento = 0; S.reversa = .6; S.giroRev = -lado * .9;
      /* trabada otra vez en poco tiempo (contra una ladera, un árbol o un poste): se reacomoda hacia el centro de la calle más cercana */
      S.trabas = (S.trabas || []).filter(t => C.mundo && (S.t || 0) - t < 6); S.trabas.push(S.t || 0);
      if (S.trabas.length >= 2 && C.mundo) { const M = C.mundo, libre = (x0, y0, x1, y1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.5); for (let j = 1; j <= n; j++) if (M.edificioEn(x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n, 0)) return false; return true; };
        /* solo hacia un punto de calle al que se llega sin cruzar una casa: la calle más cercana o el punto de la ruta */
        const q = M.viaCercana(C.x, C.y, 40), cand = [q, { x: ruta[ruta._i || 0], y: ruta[(ruta._i || 0) + 1] }].filter(p => p && Number.isFinite(p.x) && Math.hypot(p.x - C.x, p.y - C.y) < 40);
        const o = cand.find(p => libre(C.x, C.y, p.x, p.y)) || (M.edificioEn(C.x, C.y, 0) ? cand[1] || cand[0] : null);
        if (o) { const f = M.edificioEn(C.x, C.y, 0) ? 1 : .6; C.x += (o.x - C.x) * f; C.y += (o.y - C.y) * f; C.a = Math.atan2(dy, dx); S.reversa = 0; S.trabas = []; } }
      return { atascado: true }; }
    return m;
  },
  /* carriles: −1, 0 o 1 con deslizar; devuelve el desplazamiento lateral suave en metros */
  carril(estado, gesto, ancho = 1.6) { if (gesto === 'izq') estado.c = Math.max(-1, (estado.c || 0) - 1); if (gesto === 'der') estado.c = Math.min(1, (estado.c || 0) + 1); estado.x = lerp(estado.x || 0, (estado.c || 0) * ancho, .25); return estado.x; }
};
MC.Manejo = Manejo;

/* ---- js/38-sprites.js ---- */
/* =====================================================================
   SPRITES · imágenes de arte (de Gemini, ChatGPT o un artista) dentro del motor, sin romper nada
   - ATLAS: una imagen con muchos cuadros y su mapa { nombre: [x, y, w, h, ancla_x, ancla_y] }. Una sola textura =
     menos cambios de estado y dibujo más rápido (como los «sprite sheets» de todos los motores 2D).
   - ANIMACIONES por tiempo o por la FASE del cuerpo (los pies del sprite van al ritmo real del paso o del pedal).
   - DIRECCIONES: 1, 2 (espejo), 4 u 8 direcciones según el rumbo y la cámara (los juegos isométricos y cenitales).
   - ESCALA REAL: cada sprite dice cuánto mide en metros (MC.Escala): se ve proporcionado en cualquier zoom.
   - PIXEL ART: dibujo sin suavizado y en píxeles enteros cuando la vista está en pixel.
   - NUEVE PARTES (9‑slice) para marcos de interfaz que se estiran sin deformar las esquinas.
   - FONDO MAGENTA: si la herramienta de arte no da transparencia, el magenta plano (#ff00ff) se vuelve transparente.
   - RESPALDO PROCEDURAL: si un sprite no está (o no ha cargado), se dibuja el del motor. El arte nuevo nunca rompe el juego.
   - HORNEAR: cualquier dibujo procedural se puede «hornear» a un atlas al arrancar (dibujar una imagen es más barato
     que repetir cien trazos cada cuadro).
   Uso: MC.Sprites.atlas('encicla', { imagen: 'data:image/png;base64,…', cuadros: {...}, anim: {...}, metros: { bici: 1.75 } })
        MC.Sprites.dibujar(g, 'encicla/bici_lado', x, y, pxPorMetro, { t, fase, rumbo, camara, espejo, pixel })
   ===================================================================== */
const Sprites = {
  atlases: new Map(), faltan: new Set(),
  /* registra un atlas; imagen: dataURL, URL local, <img> o <canvas> */
  atlas(id, def) {
    const A = { id, cuadros: def.cuadros || {}, anim: def.anim || {}, metros: def.metros || {}, img: null, listo: false, magenta: def.magenta !== false };
    const { promise, resolve: terminar } = Promise.withResolvers(); A.carga = promise;
    const fin = img => { A.img = A.magenta ? Sprites._sinMagenta(img) : img; A.listo = true; terminar(true); MC.emit('sprites', id); };
    if (def.imagen && typeof def.imagen === 'object') fin(def.imagen);
    else if (def.imagen && typeof Image !== 'undefined') { const im = new Image(); im.onload = () => fin(im); im.onerror = () => { terminar(false); MC.falla('sprites', 'no cargó ' + id); }; im.src = def.imagen; }
    else terminar(false);
    this.atlases.set(id, A); return A;
  },
  /* el magenta plano se vuelve transparente (con borde suave para el antialias) */
  _sinMagenta(img) {
    if (typeof document === 'undefined') return img; try {
      const c = lienzo(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) { const r = p[i], gg = p[i + 1], b = p[i + 2], dist = Math.abs(r - 255) + gg + Math.abs(b - 255); if (dist < 60) p[i + 3] = 0; else if (dist < 140 && r > 180 && b > 180 && gg < 110) p[i + 3] = Math.min(p[i + 3], (dist - 60) * 3); }
      g.putImageData(d, 0, 0); return c; } catch (e) { return img; }
  },
  /* busca el cuadro: 'atlas/nombre'; con animación (por tiempo o fase) y dirección */
  cuadro(ref, op = {}) {
    const [aid, nombre] = ref.includes('/') ? ref.split('/') : [null, ref], A = aid ? this.atlases.get(aid) : null; if (!A || !A.listo) { this.faltan.add(ref); return null; }
    let n = nombre; const an = A.anim[nombre];
    if (an) { const L = an.cuadros, i = op.fase != null && an.porFase ? Math.floor(((op.fase / TAU) % 1 + 1) % 1 * L.length) : Math.floor((op.t || 0) * (an.fps || 8)); n = an.bucle === false ? L[Math.min(L.length - 1, i)] : L[((i % L.length) + L.length) % L.length]; }
    /* direcciones: nombre_N, _NE, … (8) o _arriba/_abajo/_izq/_der (4) según el rumbo visto desde la cámara */
    if (op.rumbo != null) { const a = (((op.rumbo + (op.camara || 0)) % TAU) + TAU) % TAU;
      const D8 = ['E', 'SE', 'S', 'SO', 'O', 'NO', 'N', 'NE'], d8 = D8[Math.round(a / (TAU / 8)) % 8]; if (A.cuadros[n + '_' + d8]) n = n + '_' + d8;
      else { const D4 = ['der', 'abajo', 'izq', 'arriba'], d4 = D4[Math.round(a / (TAU / 4)) % 4]; if (A.cuadros[n + '_' + d4]) n = n + '_' + d4; } }
    const c = A.cuadros[n]; if (!c) { this.faltan.add(ref); return null; } return { A, c, metros: A.metros[nombre] || A.metros[n] || c[6] || null };
  },
  tiene(ref) { return !!this.cuadro(ref); },
  /* dibuja con el ancla en (x, y) (normalmente los pies); alto real en metros × pxPorMetro */
  dibujar(g, ref, x, y, pxm, op = {}) {
    const q = this.cuadro(ref, op); if (!q) { if (op.respaldo) op.respaldo(g, x, y, pxm); return false; }
    const [sx, sy, sw, sh, ax = sw / 2, ay = sh] = q.c, altoM = op.metros || q.metros || 1.7, k = altoM * pxm / sh, espejo = op.espejo || (op.dir != null && op.dir < 0);
    g.save(); if (op.pixel) g.imageSmoothingEnabled = false; if (op.alfa != null) g.globalAlpha *= op.alfa;
    let dx = x - ax * k, dy = y - ay * k, dw = sw * k, dh = sh * k; if (op.pixel) { dx = Math.round(dx); dy = Math.round(dy); dw = Math.max(1, Math.round(dw)); dh = Math.max(1, Math.round(dh)); }
    if (espejo) { g.translate(x, 0); g.scale(-1, 1); g.translate(-x, 0); }
    if (op.rot) { g.translate(x, y); g.rotate(op.rot); g.translate(-x, -y); }
    g.drawImage(q.A.img, sx, sy, sw, sh, dx, dy, dw, dh); g.restore(); return true;
  },
  /* marco de nueve partes: b = borde en px del atlas */
  nueve(g, ref, x, y, w, h, b = 8) {
    const q = this.cuadro(ref); if (!q) return false; const [sx, sy, sw, sh] = q.c, I = q.A.img, cw = sw - 2 * b, ch = sh - 2 * b;
    const P = [[0, 0, b, b, 0, 0, b, b], [b, 0, cw, b, b, 0, w - 2 * b, b], [sw - b, 0, b, b, w - b, 0, b, b], [0, b, b, ch, 0, b, b, h - 2 * b], [b, b, cw, ch, b, b, w - 2 * b, h - 2 * b], [sw - b, b, b, ch, w - b, b, b, h - 2 * b], [0, sh - b, b, b, 0, h - b, b, b], [b, sh - b, cw, b, b, h - b, w - 2 * b, b], [sw - b, sh - b, b, b, w - b, h - b, b, b]];
    for (const [ax, ay, aw, ah, bx, by, bw, bh] of P) if (aw > 0 && ah > 0 && bw > 0 && bh > 0) g.drawImage(I, sx + ax, sy + ay, aw, ah, x + bx, y + by, bw, bh); return true;
  },
  /* hornea dibujos procedurales a un atlas: lista [{ nombre, w, h, ancla:[ax,ay], metros, dibujar(g, w, h) }] */
  hornear(id, lista) {
    if (typeof document === 'undefined') return null; let W = 0, H = 0, x = 0, y = 0, fila = 0; const lado = 1024, pos = [];
    for (const it of lista) { if (x + it.w > lado) { x = 0; y += fila + 2; fila = 0; } pos.push([x, y]); x += it.w + 2; fila = Math.max(fila, it.h); W = Math.max(W, x); }
    H = y + fila; const c = lienzo(Math.max(1, W), Math.max(1, H)), g = c.getContext('2d'), cuadros = {}, metros = {};
    lista.forEach((it, i) => { const [px, py] = pos[i]; g.save(); g.translate(px, py); g.beginPath(); g.rect(0, 0, it.w, it.h); g.clip(); it.dibujar(g, it.w, it.h); g.restore(); cuadros[it.nombre] = [px, py, it.w, it.h, ...(it.ancla || [it.w / 2, it.h])]; if (it.metros) metros[it.nombre] = it.metros; });
    return this.atlas(id, { imagen: c, cuadros, metros, magenta: false });
  },
  /* pieles de arte hechas con sprites: MC.arte.registrar(juego, MC.Sprites.comoArte('encicla', { personaje: 'persona', bici: 'bici' })) */
  comoArte(aid, mapa) {
    const piel = {};
    if (mapa.personaje) piel.personajeLado = (g, J, A, x, y, pxm, dir) => Sprites.dibujar(g, aid + '/' + mapa.personaje + '_' + (J.estado || 'quieto'), x, y, pxm, { fase: J.fase, dir, metros: A.alto || 1.7, respaldo: () => MC.arte.pieles.motor.personajeLado && MC.arte.pieles.motor.personajeLado(g, J, A, x, y, pxm, dir) });
    if (mapa.vehiculos) piel.vehiculoLado = (g, V, x, y, pxm, dir, C) => Sprites.dibujar(g, aid + '/' + (mapa.vehiculos[V.id] || V.id), x, y, pxm, { dir, metros: MC.Escala ? MC.Escala.alto(V) : 1.2, fase: C && C.fase, respaldo: () => MC.arte.pieles.motor.vehiculoLado && MC.arte.pieles.motor.vehiculoLado(g, V, x, y, pxm, dir, C) });
    return piel;
  }
};
MC.Sprites = Sprites;

/* ---- js/39-sombras.js ---- */
/* =====================================================================
   SOMBRAS Y LUZ · el sol de verdad sobre la ciudad (lo que hace que una ciudad «se vea viva»)
   - SOMBRA PROYECTADA: cada edificio (y cada emblemático) proyecta su sombra en el piso según el sol de esa hora y
     ese lugar (MC.Cielo): largas y rojizas al amanecer y al atardecer, cortas al mediodía (en Medellín casi bajo los
     pies), débiles con nubes, ninguna de noche. La sombra es el casco convexo de la base y de la base corrida
     h·cot(altura del sol) en la dirección contraria al sol. En la vista cenital la sombra no oscurece su propio techo.
   - OCLUSIÓN DE CONTACTO: una sombra corta y suave pegada a la base de todo (edificios, árboles, gente, carros):
     es lo que «sienta» las cosas en el piso (la usan Townscaper, Los Sims y Cities: Skylines).
   - LUZ DE NOCHE: los postes encienden charcos de luz cálida sobre el andén y la calle (MC.Mobiliario).
   Todo es barato: un solo trazo para todas las sombras, recortado por calidad y por zoom.
   ===================================================================== */
const Sombras = {
  /* vector de la sombra en el piso por metro de altura { dx, dy, L (largo por metro), fuerza, alt } o null */
  vector(cielo) {
    const s = cielo && cielo.sol; if (!s || s.alt <= .03) return null;
    const hl = Math.hypot(s.x, s.y) || 1e-6, L = Math.min(9, 1 / Math.tan(Math.max(.07, s.alt)));
    const fuerza = clamp(cielo.luzSol ?? .6, 0, 1) * clamp((s.alt - .03) / .14, 0, 1);
    return { dx: -s.x / hl * L, dy: -s.y / hl * L, L, fuerza, alt: s.alt, calida: clamp(1 - s.alt / .45, 0, 1) };
  },
  /* casco convexo (cadena monótona) de una lista de puntos [[x, y], …] */
  casco(pts) {
    const P = pts.toSorted((a, b) => a[0] - b[0] || a[1] - b[1]); if (P.length < 3) return P; const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = []; for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    const up = []; for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  },
  /* polígono de la sombra (metros del mundo) de un prisma de base P (plano [x,y,…]) y altura h */
  poligono(P, h, v) { const pts = []; for (let i = 0; i + 1 < P.length; i += 2) { pts.push([P[i], P[i + 1]]); pts.push([P[i] + v.dx * h, P[i + 1] + v.dy * h]); } return Sombras.casco(pts); },
  _cv: null, _cache: new WeakMap(),
  /* capa de sombras de las vistas 2D. objs: [{ P, h }] · pr: mundo → pantalla · cenital: recorta los techos */
  dibujar2D(g, W, H, objs, pr, v, op = {}) {
    if (!v || !objs.length || v.fuerza < .03) return 0; const ES = MC.Estilo && MC.Estilo.p, a = (ES && ES.sombra ? ES.sombra[3] / .34 : 1) * (op.alfa ?? .34) * v.fuerza, col = ES && ES.sombra ? ES.sombra.slice(0, 3).join(',') : v.calida > .3 ? '38,22,40' : '22,30,52';   /* 2.7: el color de la sombra según el estilo */
    let dst = g; if (op.cenital) { if (!this._cv || this._cv.width !== W || this._cv.height !== H) this._cv = lienzo(W, H); if (!this._cv) return 0; dst = this._cv.getContext('2d'); dst.setTransform(1, 0, 0, 1, 0, 0); dst.clearRect(0, 0, W, H); }
    dst.save(); dst.fillStyle = op.cenital ? '#000' : 'rgba(' + col + ',' + a.toFixed(3) + ')'; dst.beginPath();
    const kv = Math.round(v.dx * 25) + ',' + Math.round(v.dy * 25);   // el sol se mueve despacio: la sombra de cada edificio se guarda mientras no cambie
    for (const o of objs) { let S; if (o.q) { const c = Sombras._cache.get(o.q); if (c && c.k === kv) S = c.S; else { S = Sombras.poligono(o.P, o.h, v); Sombras._cache.set(o.q, { k: kv, S }); } } else S = Sombras.poligono(o.P, o.h, v); if (S.length < 3) continue; const p0 = pr(S[0][0], S[0][1], 0); dst.moveTo(p0[0], p0[1]); for (let i = 1; i < S.length; i++) { const p = pr(S[i][0], S[i][1], 0); dst.lineTo(p[0], p[1]); } dst.closePath(); }
    dst.fill('nonzero');
    if (op.cenital) {   // el techo propio (y los más altos que la sombra no alcanza) no se oscurece
      dst.globalCompositeOperation = 'destination-out'; dst.beginPath();
      for (const o of objs) { const P = o.P, p0 = pr(P[0], P[1], 0); dst.moveTo(p0[0], p0[1]); for (let i = 2; i < P.length; i += 2) { const p = pr(P[i], P[i + 1], 0); dst.lineTo(p[0], p[1]); } dst.closePath(); }
      dst.fill(); dst.restore(); g.save(); g.globalAlpha = a; g.drawImage(this._cv, 0, 0); g.restore(); return objs.length;
    }
    dst.restore(); return objs.length;
  },
  /* oclusión de contacto: elipse suave bajo algo de radio r (m) en (x, y) */
  contacto(g, sx, sy, rx, ry, a = .28) { g.fillStyle = 'rgba(10,14,26,' + a + ')'; g.beginPath(); g.ellipse(sx, sy, Math.max(1, rx), Math.max(.6, ry), 0, 0, TAU); g.fill(); },
  /* luz de noche: charcos cálidos (se suman con «lighter») en puntos de pantalla [[x, y, radioPx], …] */
  luces(g, L, noche) {
    if (noche < .15 || !L.length) return; g.save(); g.globalCompositeOperation = 'lighter';
    for (const [x, y, r] of L) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,196,110,' + (.32 * noche).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g.restore();
  }
};
MC.Sombras = Sombras;

/* ---- js/40-dibujo.js ---- */
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

/* ---- js/41-vista2d.js ---- */
/* =====================================================================
   VISTA 2D ÚNICA · cenital, 3D oblicua y maqueta dimétrica 2:1 con una sola proyección:
     pantalla = centro + Aplasta(k) · Gira(yaw) · (punto − cámara) · zoom  −  altura · zoom · hk
   - cenital: k = 1, hk = 0 (los techos van en las losas) · oblicua: k = cos(incl), hk = sin(incl)
   - maqueta 2:1: yaw en múltiplos de 90° + 45°, k = 0,5, hk = 0,82 (la proyección de la maqueta de El Metro)
   - lateral: la misma ciudad vista de lado (inclinación de 1,2 a 1,47 rad), como una casa de muñecas cortada:
     cielo arriba, el corte de la tierra abajo y una franja de calle con profundidad (FEZ, Little Nightmares).
     La ciudad 3D también se inclina con dos dedos hasta quedar de lado.
   - Lo que tapa al jugador (edificios delante de él) se vuelve transparente: el mundo nunca esconde la acción.
   El suelo sale de las losas; los edificios se levantan con su huella y su altura reales; puentes y viaducto
   a su nivel; tráfico, transporte y gente encima. El pixel es la misma vista en un búfer pequeño (vistas.js).
   ===================================================================== */
const Vista2D = {
  parametros(cam, modo) {
    if (modo === 'cenital') return { yaw: cam.yaw, k: 1, hk: 0 };
    if (modo === 'maqueta') { const q = Math.round((cam.yaw - Math.PI / 4) / (Math.PI / 2)); return { yaw: Math.PI / 4 + q * Math.PI / 2, k: .5, hk: .82 }; }
    if (modo === 'lateral') { const p = clamp(Math.max(cam.pitch, 1.2), 1.2, 1.47); return { yaw: cam.yaw, k: Math.cos(p), hk: Math.sin(p) }; }
    const p = clamp(cam.pitch, .15, 1.47); return { yaw: cam.yaw, k: Math.cos(p), hk: Math.sin(p) };
  },
  dibujar(g, W, H, E, op = {}) {
    const C = E.camara, modo = op.modo || 'cenital', P = this.parametros(C, modo), z = C.zoom, cs = Math.cos(P.yaw), sn = Math.sin(P.yaw); Ondas.presupuesto = 12;
    /* matriz mundo → pantalla (sin altura) */
    const oy = P.k < .45 ? H * .17 : 0, a = z * cs, b = z * sn * P.k, c = -z * sn, d = z * cs * P.k, SN = op.pixel ? (v => v) : Math.round, e = SN(W / 2 - a * C.x - c * C.y), f = SN(H / 2 + oy - b * C.x - d * C.y);   // de lado, el piso baja: más cielo y menos tierra. 2.11: el desplazamiento va en píxeles enteros (la capa de suelo se corre sin temblar contra los objetos)
    const pr = (x, y, h = 0) => [a * x + c * y + e, b * x + d * y + f - h * z * P.hk];
    const inv = (sx, sy) => { const det = a * d - b * c, X = sx - e, Y = sy - f; return [(d * X - c * Y) / det, (-b * X + a * Y) / det]; };
    E._pr = pr; E._vista = { modo, P, W, H, z, a, b, c, d, e, f };
    /* caja del mundo visible (con margen para lo alto) */
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [sx, sy] of [[0, -H * .6 * P.hk], [W, -H * .6 * P.hk], [0, H], [W, H]]) { const [wx, wy] = inv(sx, sy); x0 = Math.min(x0, wx); x1 = Math.max(x1, wx); y0 = Math.min(y0, wy); y1 = Math.max(y1, wy); }
    /* de lado (k pequeño) la caja se iría al infinito: se recorta a una franja de profundidad alrededor de la cámara */
    if (P.k < .55) { const R = Math.max(W, H) / z * .6 + 60, Rp = Math.min(R, 90 + 260 * P.k); const fx = Math.sin(P.yaw), fy = Math.cos(P.yaw); const RR = Math.max(R, Rp); x0 = Math.max(x0, C.x - RR); x1 = Math.min(x1, C.x + RR); y0 = Math.max(y0, C.y - RR); y1 = Math.min(y1, C.y + RR); E._franja = P.k < .45 ? { Rp, fx, fy } : null; } else E._franja = null;   /* la maqueta (k = .5) recorta lo que dibuja, pero sin el corte de tierra de la vista lateral */
    E._caja = [x0, y0, x1, y1];
    /* ---------- suelo ---------- */
    const sinTechos = modo !== 'cenital', pixel = !!op.pixel, dePie = sinTechos && z >= ((E.calidad ?? 1) >= .9 ? 3.2 : 4.2) && op.arboles !== false,   /* árboles de pie de cerca; con calidad media, desde un poco más cerca */ Ls = z < .22 ? E.losasLejos : E.losas, Ld = Ls.L;
    let res = z; const RES = [.0625, .125, .25, .5, 1, 2, 3, 4, 6]; res = RES.find(r => r >= res * (pixel ? .9 : .7)) || 6;   /* z ya está en píxeles del lienzo por metro; de cerca, losas de hasta 6 px/m */ if (Ls === E.losasLejos) res = Math.min(res, .25);
    const S = this._suelo ||= { cv: null, clave: '', ult: '', estable: 0, e: 0, f: 0, ver: -1, faltan: 1 }, mS = Math.round(Math.min(W, H) * .35), fl = (sinTechos ? 1 : 0) | (dePie ? 2 : 0) | (E.clima?.lluvia > .12 ? 4 : 0);
    const claveS = [W + 2 * mS, H + 2 * mS, a, b, c, d, res, fl, MC.estilo, MC.arte.activa, Ls === E.losasLejos ? 1 : 0, Estilo.col('#5e8c4a')].join('|'); S.estable = claveS === S.ult ? S.estable + 1 : 0; S.ult = claveS;
    const usaCapa = !pixel && !E._franja && MC.opciones.capaSuelo !== false && W * H > 40000 && S.estable >= 3;   // si gira o hace zoom seguido, mejor pintar directo
    g.save(); if (!usaCapa) { g.fillStyle = Estilo.col('#5e8c4a'); g.fillRect(0, 0, W, H); }
    if (E._franja) {   /* de lado: cielo arriba de la franja y el corte de la tierra abajo (casa de muñecas) */
      const Rp = E._franja.Rp, yF = H / 2 + oy - Rp * z * P.k, yC = H / 2 + oy + Rp * z * P.k, ES0 = Estilo.p, cie = ES0.cielo ? { top: mez3(ES0.cielo[0], (E.cielo || {}).top || ES0.cielo[0], .25), hor: mez3(ES0.cielo[1], (E.cielo || {}).hor || ES0.cielo[1], .25) } : (E.cielo || { top: [.4, .6, .9], hor: [.8, .88, .95] });   /* el cielo del estilo (de Shinkai en el anime), con algo de la hora */
      const gs = g.createLinearGradient(0, 0, 0, Math.max(1, yF)); gs.addColorStop(0, css3(cie.top)); gs.addColorStop(1, css3(cie.hor)); g.fillStyle = gs; g.fillRect(0, 0, W, Math.max(0, yF));
      const gt = g.createLinearGradient(0, yC, 0, H); gt.addColorStop(0, '#6b4f36'); gt.addColorStop(.15, '#5a4230'); gt.addColorStop(1, '#2e2219'); g.fillStyle = gt; g.fillRect(0, yC, W, H - yC);
      g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 40; i++) g.fillRect(h2(i, 1, 9) * W, yC + 6 + h2(i, 2, 9) * (H - yC), 2 + h2(i, 3, 9) * 4, 2);
      g.beginPath(); g.rect(0, yF, W, yC - yF); g.clip();
    }
    let faltan = 0;
    const pintarSuelo = (gg, ox, oy, X0, Y0, X1, Y1) => {   // las losas de la caja [X0..X1]×[Y0..Y1] con la matriz corrida (ox, oy)
      gg.setTransform(a, b, c, d, e + ox, f + oy); gg.imageSmoothingEnabled = !pixel; let faltan = 0;   // (las que faltan en esta pasada)
      const gx0 = Math.floor(X0 / Ld), gx1 = Math.floor(X1 / Ld), gy0 = Math.floor(Y0 / Ld), gy1 = Math.floor(Y1 / Ld);
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
        let L = Ls.losa(gx, gy, res, faltan > (op.presupuesto ?? 2), fl);
        if (!L) { faltan++; L = Ls.losa(gx, gy, Math.max(.0625, res / 4), false, fl); }   // mientras llega la buena, una borrosa
        if (L) gg.drawImage(L, gx * Ld, gy * Ld, Ld + .05, Ld + .05); else faltan++;
      }
      return faltan;
    };
    /* 2.11: CAPA DE SUELO. El suelo se pinta una vez en una capa con margen y, mientras la cámara solo se desplace (mismo zoom,
       giro, estilo, arte, lluvia y tamaño), cada cuadro se corre con un blit en píxeles enteros: sin giro ni escala, que es lo
       que más cuesta pintar en la maqueta. Se rehace si faltan losas, si cambió algo o si la cámara salió del margen. */
    if (usaCapa) {
      const m = mS, CW = W + 2 * m, CH = H + 2 * m, clave = claveS, dx = e - S.e, dy = f - S.f;
      if (!S.cv || S.cv.width !== CW || S.cv.height !== CH) { S.cv = lienzo(CW, CH); S.clave = ''; }
      if (S.cv && (S.clave !== clave || S.faltan > 0 || S.ver !== Ls.version || Math.abs(dx) > m - 2 || Math.abs(dy) > m - 2)) {
        const q = S.cv.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.fillStyle = Estilo.col('#5e8c4a'); q.fillRect(0, 0, CW, CH);
        let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9; for (const [sx, sy] of [[-m, -m], [W + m, -m], [-m, H + m], [W + m, H + m]]) { const [wx, wy] = inv(sx, sy); X0 = Math.min(X0, wx); X1 = Math.max(X1, wx); Y0 = Math.min(Y0, wy); Y1 = Math.max(Y1, wy); }
        if (P.k < .55) { const RR = Math.max(W, H) / z * .6 + 60 + m / z; X0 = Math.max(X0, C.x - RR); X1 = Math.min(X1, C.x + RR); Y0 = Math.max(Y0, C.y - RR); Y1 = Math.min(Y1, C.y + RR); }
        faltan = S.faltan = pintarSuelo(q, m, m, X0, Y0, X1, Y1); S.clave = clave; S.e = e; S.f = f; S.ver = Ls.version; this.capasSuelo = (this.capasSuelo || 0) + 1;
      }
      if (S.cv) { g.drawImage(S.cv, e - S.e - m, f - S.f - m); g.restore(); }
      else { g.fillStyle = Estilo.col('#5e8c4a'); g.fillRect(0, 0, W, H); faltan = pintarSuelo(g, 0, 0, x0, y0, x1, y1); g.restore(); }
    } else { faltan = pintarSuelo(g, 0, 0, x0, y0, x1, y1); g.restore(); }
    const noche0 = E.cielo ? E.cielo.noche : 0; if (noche0 > .02) { g.fillStyle = 'rgba(8,18,52,' + (noche0 * .5).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    /* ---------- lo que se levanta: edificios, pasos elevados, vehículos y gente, en orden de profundidad ---------- */
    const objs = [], noche = E.cielo ? E.cielo.noche : 0, dy = (x, y) => b * x + d * y + f, cal = E.calidad ?? 1;
    const luzX = Math.cos(P.yaw + 2.4), dibCtx = { g, pr, z, P, noche, E, luzX, modo, W, H, real: !!Estilo.p.rudeza, ES: Estilo.p, mapa: !Estilo.p.rudeza && MC.estilo !== 'clasico' }, luces = [];
    const Fr = E._franja, delante = (x, y) => Fr && Fr.fx * (x - C.x) + Fr.fy * (y - C.y) > Fr.Rp;   // de lado: lo que queda antes del corte no se dibuja
    // Descartar antes de preparar el dibujo, con margen para copa, focos y altura.
    const visible = (x, y, radio, alto = 0) => {
      const sx = a * x + c * y + e, sy = b * x + d * y + f, r = radio * z + 3;
      return sx + r >= 0 && sx - r <= W && sy + r >= 0 && sy - r - alto * z * P.hk <= H;
    };
    if (E.clima?.lluvia > .12 && z >= 1) this.charcos(dibCtx, E.clima.lluvia);
    /* sombras del sol de esta hora (también de edificios que están fuera de la pantalla y la alcanzan) */
    const sv = op.sombras === false ? null : Sombras.vector(E.cielo), conSombra = sv && z > .22 && cal > .3; dibCtx.sv = conSombra ? sv : null;
    const minH = z < .5 ? 9 : z < 1 ? 5 : 0, maxN = Math.round(1800 * cal);
    if (modo !== 'cenital' || conSombra) {
      const pad = conSombra ? Math.min(160, 25 * sv.L) : 0, lista = E.mundo.edificiosEn(x0 - pad, y0 - pad, x1 + pad, y1 + pad).filter(q => q.h >= minH && !delante(q.x, q.y)); if (lista.length > maxN) lista.sort((p, q) => q.h * q.hw * q.hd - p.h * p.hw * p.hd).length = maxN;
      const sit = E.mundo.sitios().E.filter(q => { const k2 = q.caja; return !(k2[2] < x0 - pad || k2[0] > x1 + pad || k2[3] < y0 - pad || k2[1] > y1 + pad); });
      if (conSombra) { const S = lista.filter(q => visible(q.x,q.y,q.hw+q.hd+q.h*sv.L+2)).map(q => ({ P: Mundo.esquinas(q), h: q.h, q })); for (const q of sit) if (q.R[0]) S.push({ P: q.R[0], h: Math.min(q.h, 90) }); Sombras.dibujar2D(g, W, H, S, pr, sv, { cenital: modo === 'cenital' }); }
      if (modo !== 'cenital') { for (const q of lista) if (q.x >= x0 && q.x <= x1 && q.y >= y0 && q.y <= y1) objs.push({ y: dy(q.x, q.y) + Math.max(q.hw, q.hd) * z * P.k * .5, t: 0, q }); for (const q of sit) { const k2 = q.caja; if (k2[2] < x0 || k2[0] > x1 || k2[3] < y0 || k2[1] > y1) continue; objs.push({ y: dy(q.x, q.y), t: 4, q }); } }
    }
    /* agua viva: brillos que se mueven sobre lagos, ríos y mar (baratos: una muestra cada pocos metros) */
    if (cal > .4 && z > .35 && op.agua !== false) { const area = (x1 - x0) * (y1 - y0), st = Math.max(7, Math.sqrt(area / 500)), t = E.t || 0; g.save(); g.strokeStyle = 'rgba(255,255,255,' + (noche > .5 ? .12 : .32) + ')'; g.lineWidth = Math.max(1, z * .25); g.beginPath(); let n = 0;
      for (let yy = Math.floor(y0 / st) * st; yy < y1 && n < 700; yy += st) for (let xx = Math.floor(x0 / st) * st; xx < x1 && n < 700; xx += st) { const tt = E.mundo.suelo(xx, yy); if (tt !== TT.WATER && tt !== TT.CANAL) continue; n++; const ph = h2(xx | 0, yy | 0, 7) * TAU, a = (Math.sin(t * 1.3 + ph) + 1) / 2; if (a < .55) continue; const wx = xx + Math.sin(t * .4 + ph) * st * .3, wy = yy + Math.cos(t * .3 + ph) * st * .2, p1 = pr(wx - 1.2 * a, wy, 0), p2 = pr(wx + 1.2 * a, wy, 0); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); }
      g.stroke(); g.restore(); }
    /* naturaleza: rocas, palmas, frailejones, arbustos y juncos (de cerca) */
    if (z > .6 && cal > .35 && op.naturaleza !== false) for (const p of Naturaleza.en(E.mundo, x0, y0, x1, y1, Math.round(150 + 500 * cal))) if (!delante(p.x, p.y) && visible(p.x, p.y, 8, 22)) objs.push({ y: dy(p.x, p.y), t: 8, q: p });
    /* 2.6: los árboles de pie (maqueta, oblicua y lateral de cerca), con su sombra según el sol antes de todo lo demás */
    if (dePie) { const cap = Math.round(150 + 420 * cal); let AR = Arboleda.en(E.mundo, x0 - 8, y0 - 8, x1 + 8, y1 + 8, 5000).filter(t => !delante(t.x, t.y)); if (AR.length > cap) { const q = cap / AR.length; AR = AR.filter(t => (t.s * 7.31 + t.r) % 1 < q); }   /* si son demasiados, se ralea parejo (no se corta media pantalla) */ if (z >= 6) Arboleda.sombras(dibCtx, AR, conSombra ? sv : null); for (const t of AR) if (visible(t.x, t.y, t.r * 2 + 2, t.h * 1.4)) objs.push({ y: dy(t.x, t.y), t: 10, q: t }); }
    /* mobiliario urbano (postes, árboles de calle, bancas, paraderos, cebras): solo de cerca */
    if (z > .9 && cal > .35 && op.mobiliario !== false) { const L = Mobiliario.en(E.mundo, x0, y0, x1, y1, Math.round(120 + 480 * cal * Math.min(1, z / 2))).filter(p => !delante(p.x, p.y) && visible(p.x, p.y, 18, 16)); Mobiliario.piso(dibCtx, L); for (const p of L) if (p.t !== 'cebra') objs.push({ y: dy(p.x, p.y), t: 7, q: p }); }
    if (MC.Vida && op.vida !== false) MC.Vida.piso(dibCtx);   /* 2.8: huellas de llantas y pisadas en el suelo blando */
    /* capa de información (valor del suelo, ruido, contaminación…: las «vistas de datos» de SimCity y Cities: Skylines) */
    if (E.capaInfo && E.capaInfo.dibujar) E.capaInfo.dibujar(g, a, b, c, d, e, f, dibCtx);
    for (const q of E.mundo.pasosEn(x0, y0, x1, y1)) if (q.nivel > 0) objs.push({ y: dy((q.caja[0] + q.caja[2]) / 2, (q.caja[1] + q.caja[3]) / 2) + 1e4 * 0, t: 1, q, cen: modo === 'cenital' });
    for (const v of E.vehiculos || []) if (visible(v.x, v.y, (v.largo || 12) + 5, (v.z || 0) + 8)) objs.push({ y: dy(v.x, v.y) + (v.z || 0) * .001, t: 2, q: v });
    for (const p of E.peatones || []) if (visible(p.x, p.y, 2, (p.z || 0) + 3)) objs.push({ y: dy(p.x, p.y), t: 3, q: p });
    if (E.jugador) objs.push({ y: dy(E.jugador.x, E.jugador.y) + .5, t: 5, q: E.jugador });
    const est = E.jugador && E.jugador.cuerpo && E.jugador.cuerpo.estacionado; if (est && est.x >= x0 - 20 && est.x <= x1 + 20 && est.y >= y0 - 20 && est.y <= y1 + 20) objs.push({ y: dy(est.x, est.y), t: 9, q: est });
    for (const x of E.extras || []) objs.push({ y: dy(x.x, x.y), t: 6, q: x });
    objs.sort((p, q) => p.y - q.y);
    /* rayos X: lo que queda delante del jugador y lo tapa se dibuja transparente */
    const Jc = E.jugador && E.jugador.cuerpo, jKey = Jc ? dy(Jc.x, Jc.y) : 0, jS = Jc ? pr(Jc.x, Jc.y, (Jc.zPaso || 0) + (Jc.z || 0) + 1) : null;
    const tapa = q => { const hw = q.hw != null ? Math.max(q.hw, q.hd) : q.caja ? Math.max(q.caja[2] - q.caja[0], q.caja[3] - q.caja[1]) / 2 : 15, r = hw * z * 1.15 + 12, [bx, by] = pr(q.x, q.y, 0), [, ty] = pr(q.x, q.y, q.h || 10); return Math.abs(jS[0] - bx) < r && jS[1] > ty - 12 && jS[1] < by + hw * z * P.k + 12; };
    for (const o of objs) {
      const rx = Jc && modo !== 'cenital' && o.y > jKey && ((o.t === 0 || o.t === 4) ? tapa(o.q) : o.t === 10 ? (() => { const [tx, ty] = pr(o.q.x, o.q.y, 0); return Math.abs(jS[0] - tx) < o.q.r * 1.3 * z + 6 && jS[1] < ty && jS[1] > ty - o.q.h * z * P.hk; })() : false); if (rx) g.globalAlpha = o.t === 10 ? .4 : .28;
      if (o.t === 0) this.edificio(dibCtx, o.q); else if (o.t === 1) this.pasoElevado(dibCtx, o.q); else if (o.t === 2) this.vehiculo(dibCtx, o.q);
      else if (o.t === 3) this.peaton(dibCtx, o.q); else if (o.t === 4) this.sitio(dibCtx, o.q); else if (o.t === 5) this.jugador(dibCtx, o.q); else if (o.t === 6 && o.q.dibujar) o.q.dibujar(g, pr, z, P); else if (o.t === 7) Mobiliario.objeto(dibCtx, o.q, luces); else if (o.t === 8) Naturaleza.objeto(dibCtx, o.q); else if (o.t === 9) this.estacionado(dibCtx, o.q); else if (o.t === 10) Arboleda.dePie(dibCtx, o.q);
      if (rx) g.globalAlpha = 1;
    }
    Sombras.luces(g, luces, noche);   // los charcos de luz de los postes, encima de todo (como luz que se suma)
    /* cables del Metrocable: el cable entre torres por encima de todo */
    if (E.cables) this.cables(dibCtx, E.cables);
    /* 2.7: el pase final del estilo (manga en grises, líneas de velocidad) y la vida (partículas, pájaros, onomatopeyas) */
    if (MC.Vida && op.vida !== false) MC.Vida.dibujar(dibCtx);
    if (dibCtx.mapa) Estilo.final(g, W, H, E);
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
      const lz = Estilo.luz(clamp(.72 + .28 * (ey * sg / (Math.hypot(ex, ey) || 1)) * D.luzX + .1, .55, 1.05) - noche * .45);
      g.fillStyle = tono(D.mapa ? Estilo.col(muro) : muro, lz - 1); g.beginPath(); g.moveTo(B[i][0], B[i][1]); g.lineTo(B[j][0], B[j][1]); g.lineTo(T[j][0], T[j][1]); g.lineTo(T[i][0], T[i][1]); g.closePath(); g.fill(); if (D.ES.tinta && z > 1.2) { g.strokeStyle = D.ES.tintaColor; g.lineWidth = Math.max(1, D.ES.tinta * Math.min(1.4, z / 6)); g.lineJoin = 'round'; g.stroke(); }   /* 2.7: línea clara */
      if (D.real && z > 3.5) { const hb = Math.min(1, (z1 - z0) * .25) / (z1 - z0), ha = .35 / (z1 - z0), Bi = [B[i][0] + (T[i][0] - B[i][0]) * hb, B[i][1] + (T[i][1] - B[i][1]) * hb], Bj = [B[j][0] + (T[j][0] - B[j][0]) * hb, B[j][1] + (T[j][1] - B[j][1]) * hb], Ti = [T[i][0] - (T[i][0] - B[i][0]) * ha, T[i][1] - (T[i][1] - B[i][1]) * ha], Tj = [T[j][0] - (T[j][0] - B[j][0]) * ha, T[j][1] - (T[j][1] - B[j][1]) * ha];   /* 2.6: humedad y salpicado en la base del muro; sombra bajo el alero */
        g.fillStyle = 'rgba(34,26,18,.24)'; g.beginPath(); g.moveTo(B[i][0], B[i][1]); g.lineTo(B[j][0], B[j][1]); g.lineTo(Bj[0], Bj[1]); g.lineTo(Bi[0], Bi[1]); g.closePath(); g.fill();
        g.fillStyle = 'rgba(0,0,0,.13)'; g.beginPath(); g.moveTo(T[i][0], T[i][1]); g.lineTo(T[j][0], T[j][1]); g.lineTo(Tj[0], Tj[1]); g.lineTo(Ti[0], Ti[1]); g.closePath(); g.fill(); }
      if (ventanas && z > 1.8 && D.ventanas !== false) { const alto = (z1 - z0), pisos = Math.min(14, Math.max(1, Math.floor(alto / 3))), L = Math.hypot(ex, ey), cols = Math.min(6, Math.floor(L / (z * 3.2))); if (pisos >= 1 && cols >= 1) {
        /* fachada por reglas (WFC, como Townscaper): locales, vitrinas y puerta abajo; balcones alineados; muros ciegos */
        const FZ = pisos * cols <= 48 && z > 2.2 ? Ondas.fachadaCache(ventanas * 31 + i, pisos, cols) : null, alturaV = (T[i][1] - B[i][1]);
        const fm = MC.arte.f('fachadaModulo');   // arte del juego: fachadaModulo(g, tipo, x, y, ancho, alto, encendida, D) → true si lo dibujó
        for (let p = 0; p < pisos; p++) for (let q = 0; q < cols; q++) { const tipo = FZ ? FZ[pisos - 1 - p][q] : 'ventana'; if (tipo === 'muro') continue; const lit = noche > .3 && h2(i * 31 + q, p, ventanas) < .4; const u = (q + .3) / cols, v = (p + .35) / pisos, x = B[i][0] + ex * u, y = B[i][1] + ey * u + alturaV * v, w = Math.max(1, ex / cols * .45);
          if (fm) D.varianteFachada = Math.abs(ventanas + i*31 + p*7 + q) % 3;
          if (fm && fm(g, tipo, x, y, w, Math.max(1, z * 1.2), lit, D) === true) continue;
          if (tipo === 'local' || tipo === 'vitrina') { const yb = B[i][1] + ey * u + alturaV * (p + .08) / pisos; g.fillStyle = noche > .3 ? 'rgba(255,226,150,' + (.5 + noche * .4) + ')' : 'rgba(120,160,190,.55)'; g.fillRect(x - w * .25, yb - z * 1.9, w * 1.5, z * 1.9); if (tipo === 'vitrina') { g.fillStyle = ['#c43a26', '#2f80ed', '#2e7d32', '#f2b705'][(ventanas + q) % 4]; g.fillRect(x - w * .35, yb - z * 2.4, w * 1.7, Math.max(1, z * .45)); } continue; }
          if (tipo === 'puerta') { const yb = B[i][1] + ey * u + alturaV * .02; g.fillStyle = '#4a2f22'; g.fillRect(x, yb - z * 2.1, w * .8, z * 2.1); continue; }
          g.fillStyle = lit ? 'rgba(255,214,120,' + (.55 + noche * .4) + ')' : 'rgba(25,35,50,.32)'; g.fillRect(x, y, w, Math.max(1, z * 1.2));
          if (tipo === 'balcon') { g.fillStyle = 'rgba(40,44,52,.55)'; g.fillRect(x - w * .2, y + Math.max(1, z * 1.2), w * 1.4, Math.max(1, z * .3)); } } } }
    }
    if (D.mapa) techo = Estilo.col(techo); g.fillStyle = noche > .05 ? tono(techo, -noche * .5) : techo; g.beginPath(); g.moveTo(T[0][0], T[0][1]); for (let i = 1; i < n; i++) g.lineTo(T[i][0], T[i][1]); g.closePath(); g.fill(); if (D.ES.tinta && z > 1.2) { g.strokeStyle = D.ES.tintaColor; g.lineWidth = Math.max(1, D.ES.tinta * Math.min(1.4, z / 6)); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = Math.max(.5, z * .15); g.stroke();
  },
  /* 2.8: una cubierta sin muros (un techo sobre columnas: parqueaderos, kioscos, plazas de mercado) no flota */
  cubierta(D, q, st) { const { g, pr, z } = D, P = Mundo.esquinas(q), n = P.length >> 1; g.strokeStyle = '#3a3d44'; g.lineWidth = Math.max(1, z * .3); g.beginPath(); for (let i = 0; i < n; i++) { const [bx, by] = pr(P[2 * i], P[2 * i + 1], 0), [tx, ty] = pr(P[2 * i], P[2 * i + 1], q.h - .3); g.moveTo(bx, by); g.lineTo(tx, ty); } g.stroke(); this.prisma(D, P, Math.max(0, q.h - .5), q.h, st.muro, st.techo, 0); },
  charcos(D, intensidad) {
    const { g, E, P, pr, z } = D, cx = Math.floor(E.camara.x / 7), cy = Math.floor(E.camara.y / 7);
    const t = E.t || 0, charcos = [];
    for (let j = cy - 4; j <= cy + 4; j++) for (let i = cx - 4; i <= cx + 4; i++) {
      const semilla = h2(i, j, 907);
      if (semilla > .48 || charcos.length >= 20) continue;
      const x = (i + semilla) * 7, y = (j + h2(i, j, 908)) * 7;
      const tt = E.mundo.suelo(x, y);
      if (tt !== TT.ROAD && tt !== TT.AVE && tt !== TT.AUTO) continue;
      const [sx, sy] = pr(x, y), rx = (.45 + semilla * 2) * z;
      charcos.push([sx, sy, rx, Math.max(.5, rx * P.k * .52), (t * 1.8 + semilla * 17) % 1]);
    }
    g.save();
    g.fillStyle = D.noche > .45 ? 'rgba(211,175,112,.32)' : 'rgba(164,203,220,.48)';
    g.beginPath();
    for (const [x,y,rx,ry] of charcos) { g.moveTo(x + rx,y); g.ellipse(x,y,rx,ry,0,0,TAU); }
    g.fill(); g.beginPath(); g.lineWidth = Math.max(.5, z * .035);
    g.strokeStyle = 'rgba(233,242,249,' + (.25 + intensidad * .35) + ')';
    for (const [x,y,rx,ry,k] of charcos) {
      g.moveTo(x - rx * .65, y); g.lineTo(x - rx * .2, y);
      if (k > .08 && k < .8) { g.moveTo(x + rx * k, y); g.ellipse(x,y,rx*k,ry*k,0,0,TAU); }
    }
    g.stroke(); g.restore(); return charcos.length;
  },
  edificio(D, q) {
    const [x, y] = D.pr(q.x, q.y);
    const radio = Math.ceil((q.hw + q.hd + 2) * D.z) + 2;
    const base = Math.ceil(radio * D.P.k) + 3;
    const cima = base + Math.ceil((q.h + 2) * D.z * D.P.hk);
    if (x + radio < 0 || x - radio > D.W || y + base < 0 || y - cima > D.H) return;
    // La maqueta gira por cuadrantes. Un edificio ya pintado se traslada con la cámara.
    // Las pieles con fachadas dinámicas conservan su llamada en cada cuadro.
    const area = 2 * radio * (base + cima);
    if (D.modo !== 'maqueta' || area > 65000 || (MC.arte.f('fachadaModulo') && !MC.arte.f('fachadasEstaticas'))) return this._edificioDirecto(D, q);
    const clave = [MC.estilo, MC.arte.activa, D.E.losas.version, D.z, D.P.yaw, Math.round(D.noche * 36), D.noche > .3, q.h, q.hw, q.hd, q.s].join('/');
    const cache = D.E._fachadasMaqueta || (D.E._fachadasMaqueta = { imagenes: new Map(), pixeles: 0 });
    let pieza = cache.imagenes.get(q);
    if (!pieza || pieza.clave !== clave) {
      if (pieza) cache.pixeles -= pieza.area;
      const cv = lienzo(2 * radio, base + cima), ctx = cv.getContext('2d');
      const local = (wx, wy, h) => { const [sx, sy] = D.pr(wx, wy, h); return [sx - x + radio, sy - y + cima]; };
      this._edificioDirecto({ ...D, g: ctx, pr: local }, q);
      pieza = { cv, clave, area };
      cache.imagenes.set(q, pieza);
      cache.pixeles += area;
      while (cache.pixeles > 4e6 || cache.imagenes.size > 1200) {
        const vieja = cache.imagenes.keys().next().value;
        cache.pixeles -= cache.imagenes.get(vieja).area;
        cache.imagenes.delete(vieja);
      }
    }
    D.g.drawImage(pieza.cv, x - radio, y - cima);
  },
  _edificioDirecto(D, q) { const st = estiloEdificio(D.E.mundo, q), P = Mundo.esquinas(q); if (q.clase === 'techo' && D.modo !== 'cenital') return this.cubierta(D, q, st); this.prisma(D, P, 0, q.h, st.muro, st.techo, q.h >= 2.8 ? (q.s * 1e4 | 0) : 0); if (st.tanque && D.z > 1.5) { const [x, y] = D.pr(q.x, q.y, q.h + 1.2); D.g.fillStyle = '#1d1f24'; D.g.fillRect(x - D.z * .7, y - D.z * .4, D.z * 1.4, D.z * 1.2); } },
  sitio(D, q) {
    const ES = ['#b8673f', '#eceae4', '#bdbcb6', '#5e7b97', '#ece3cd', '#efe8d8', '#d4d8dd', '#3a3f4a', '#b9714b', '#d8432f', '#d9d4c9', '#a86a4c', '#e9dab3', '#2a302d', '#3a3f4a', '#6a645c', '#a6573a', '#e3e6ea', '#4b5a55'], m = ES[q.est] || '#d9d4c9', t = q.techo === 'dos' || q.techo === 'cuatro' ? '#b5542f' : q.techo === 'cupula' ? '#56665f' : tono(m, -.12);
    for (const R of q.R.slice(0, 1)) this.prisma(D, R, 0, q.partes ? q.partes[0].z0 || Math.min(q.h, 12) : q.h, m, t, 7);
    if (q.partes) for (const p of q.partes) this.prisma(D, p.B, p.z0, p.z1, ES[p.est] || m, p.techo === 'aguja' ? '#e3e6ea' : tono(ES[p.est] || m, -.15), 0);
  },
  pasoElevado(D, q) {
    const { g, z, P } = D, cen = D.modo === 'cenital';
    const h = q.nivel * NIVEL_M, L = q.ancho / 2, vi = q.tipo === 'viaducto', T = q.trazo || (q.trazo = new Trazo(q.p));
    const clave = [z,P.yaw,P.k,P.hk,cen,h,L].join('/');
    if (!q._dibujoPaso || q._dibujoPaso.clave !== clave) {
      const cs=Math.cos(P.yaw), sn=Math.sin(P.yaw);
      const pr=(x,y,alt) => [(cs*(x-q.p[0])-sn*(y-q.p[1]))*z,(sn*(x-q.p[0])+cs*(y-q.p[1]))*z*P.k-alt*z*P.hk];
      const capas = [], ctx = {beginPath(){ this.path=new Path2D(); },moveTo(x,y){this.path.moveTo(x,y);},
        lineTo(x,y){this.path.lineTo(x,y);},closePath(){this.path.closePath();},
        fill(){capas.push(['fill',this.fillStyle,this.path]);},stroke(){capas.push(['stroke',this.strokeStyle,this.path,this.lineWidth]);},
        fillRect(x,y,w,h){let ultima=capas.at(-1); if (!ultima || ultima[1]!==this.fillStyle) {ultima=['fill',this.fillStyle,new Path2D()]; capas.push(ultima);} ultima[2].rect(x,y,w,h);}};
      this._trazarPaso({cen},q,ctx,pr,z,h,L,vi,T);
      q._dibujoPaso={clave,capas};
    }
    const [x,y]=D.pr(q.p[0],q.p[1]);
    g.save();g.translate(x,y);
    for(const [tipo,color,path,ancho] of q._dibujoPaso.capas) {
      if(tipo==='fill'){g.fillStyle=color;g.fill(path);}
      else {g.strokeStyle=color;g.lineWidth=ancho;g.stroke(path);}
    }
    g.restore();
  },
  _trazarPaso(D,q,g,pr,z,h,L,vi,T) {
    const rampa = vi ? 0 : Math.min(q.largo * .4, q.peatonal ? 9 : 22), alt = s => h * (vi ? 1 : suave(Math.min(s, q.largo - s) / rampa));
    if (!D.cen) { g.fillStyle = vi ? '#9aa3ad' : '#a9a49a'; for (let s = 12; s < q.largo - 6; s += vi ? 30 : 24) { const c = T.at(s), [x, y] = pr(c.x, c.y, 0), [, y2] = pr(c.x, c.y, alt(s)); const w = Math.max(1, z * 1.4); g.fillRect(x - w / 2, y2, w, y - y2); } }
    const izq = [], der = []; for (let s = 0; s <= q.largo; s += Math.max(2, 8 / Math.max(.3, z))) { const c = T.at(s), nx = -Math.sin(c.a), ny = Math.cos(c.a), hh = D.cen ? 0 : alt(s); izq.push(pr(c.x + nx * L, c.y + ny * L, hh)); der.push(pr(c.x - nx * L, c.y - ny * L, hh)); }
    if (D.cen) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); izq.forEach(([x, y], i) => i ? g.lineTo(x + z * 2, y + z * 3) : g.moveTo(x + z * 2, y + z * 3)); der.toReversed().forEach(([x, y]) => g.lineTo(x + z * 2, y + z * 3)); g.fill(); }
    if (!D.cen) { g.fillStyle = vi ? '#7f8891' : '#8e8a80'; g.beginPath(); der.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); der.toReversed().forEach(([x, y]) => g.lineTo(x, y + z * 1.1)); g.fill(); }
    g.fillStyle = vi ? '#c9cfd8' : q.peatonal ? '#d8cfbd' : '#5a5f69'; g.beginPath(); izq.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); der.toReversed().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fill();
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
  /* 2.8 · faros: un cono de luz cálida en el piso delante del vehículo, de noche (se suma a la luz, no tapa) */
  faros(D, C, V) {
    const { g, pr, z } = D, L = 16 + Math.abs(C.v || 0) * .6, ab = .42, ca = Math.cos(C.a), sa = Math.sin(C.a), fx = C.x + ca * (V.largo || 4) * .5, fy = C.y + sa * (V.largo || 4) * .5, [x0, y0] = pr(fx, fy, 0);
    const P1 = pr(fx + Math.cos(C.a - ab) * L, fy + Math.sin(C.a - ab) * L, 0), P2 = pr(fx + Math.cos(C.a + ab) * L, fy + Math.sin(C.a + ab) * L, 0), [xm, ym] = pr(fx + ca * L, fy + sa * L, 0);
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x0, y0, xm, ym); gr.addColorStop(0, 'rgba(255,236,190,' + (.32 * D.noche).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.lineTo(P1[0], P1[1]); g.quadraticCurveTo(xm, ym, P2[0], P2[1]); g.closePath(); g.fill(); g.restore();
  },
  /* 2.7 · peso: al aterrizar el cuerpo se aplasta y vuelve (squash and stretch), desde los pies */
  jugador(D, j) {
    const C = j.cuerpo, q = C && C._squash; if (!q) return this._jugador(D, j);
    const u = ((D.E.t || 0) - q.t0) / .32; if (u >= 1 || u < 0) { C._squash = null; return this._jugador(D, j); }
    const k = q.k * Math.sin(u * Math.PI) * Math.exp(-u * 2.2) * .9, [x, y] = D.pr(C.x, C.y, (C.zPaso || 0) + (C.z || 0)); D.g.save(); D.g.translate(x, y); D.g.scale(1 + k * .3, 1 - k * .3); D.g.translate(-x, -y); this._jugador(D, j); D.g.restore();
  },
  _jugador(D, j) {
    const { g, pr, z, P } = D, C = j.cuerpo, A = j.aspecto, V = C.veh, [x, y] = pr(C.x, C.y, C.zPaso + C.z), fn = MC.arte.f('jugador');
    if (fn && fn(g, j, x, y, z, P, D) !== false) return;
    g.fillStyle = 'rgba(0,0,0,.3)'; const [sx, sy] = pr(C.x, C.y, C.zPaso); g.beginPath(); g.ellipse(sx, sy, Math.max(2, z * .7), Math.max(1.2, z * .4 * P.k), 0, 0, TAU); g.fill();
    /* marca del jugador (como en GTA): un anillo y una flecha de rumbo, para encontrarse siempre en el mapa */
    if (D.E.marcaJugador !== false) { const t = D.E.t || 0, r = Math.max(10, z * 1.2) * (1 + .07 * Math.sin(t * 4)), kk = D.modo === 'cenital' ? 1 : Math.max(.25, P.k), [fx, fy] = pr(C.x + Math.cos(C.a), C.y + Math.sin(C.a), C.zPaso), dl = Math.hypot(fx - sx, fy - sy) || 1, ux = (fx - sx) / dl, uy = (fy - sy) / dl;
      g.save(); g.strokeStyle = 'rgba(57,255,179,.9)'; g.lineWidth = Math.max(2, z * .14); g.beginPath(); g.ellipse(sx, sy, r, r * kk, 0, 0, TAU); g.stroke(); g.fillStyle = '#39ffb3'; const ax = sx + ux * (r + 4), ay = sy + uy * (r * kk + 4), w = Math.max(6, r * .45); g.beginPath(); g.moveTo(ax + ux * w, ay + uy * w); g.lineTo(ax - uy * w * .6, ay + ux * w * .6); g.lineTo(ax + uy * w * .6, ay - ux * w * .6); g.closePath(); g.fill(); g.restore(); }
    if (D.modo === 'cenital') {
      g.save(); g.translate(x, y); g.rotate(C.a + P.yaw); g.scale(z, z);
      const frena = (C._acel || 0) < -2.2 && Math.abs(C.v) > .8, nocheJ = (D.noche || 0) > .4;   /* 2.8: luces de freno y faros (entrega maestra §11.2, R13 y R19) */
      const dibujo = V.clase !== 'pie' && MC.arte.f('vehiculoArriba')?.(g,V,0,0,1,0);
      if (dibujo && ['auto','pesado','moto'].includes(V.clase)) { g.restore(); if (nocheJ) this.faros(D, C, V); return; }
      if (!dibujo && V.clase !== 'pie') { if (V.clase === 'auto' || V.clase === 'pesado' || V.clase === 'moto') { Pincel.vehiculoArriba(g, V.clase === 'moto' ? 'moto' : 'carro', V.color, V.largo, V.ancho, frena, nocheJ); g.restore(); if (nocheJ) this.faros(D, C, V); return; } g.fillStyle = '#1d1f24'; g.fillRect(-V.largo / 2, -.08, V.largo, .16); g.fillStyle = V.color || '#7ab800'; g.fillRect(-V.largo * .3, -.25, V.largo * .6, .5); }
      g.restore(); const J = Personaje.pose(C.estado || 'quieto', C.fase); J.fase = C.fase; MC.arte.f('personajeArriba')(g, J, A, x, y, z, C.a + P.yaw);
      if (C.nadando || C.vadeando) { g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = Math.max(1, z * .08); for (const k of [1, 1.6]) { g.beginPath(); g.arc(x, y, z * (.5 * k + .1 * Math.sin((D.E.t || 0) * 3 + k)), 0, TAU); g.stroke(); } if (C.buceando) { g.fillStyle = 'rgba(30,95,140,.55)'; g.beginPath(); g.arc(x, y, z * .9, 0, TAU); g.fill(); this.burbujas(g, x, y - z * .2, y + z * .4, z * 1.5, D.E.t || 0); } }
      return;
    }
    const dir = Math.cos(C.a + P.yaw) >= 0 ? 1 : -1, esc = Math.max(4, z * P.hk * 1.1);
    const cabeceo = V.clase !== 'pie' && !C.enAire ? clamp(-(C._acel || 0) * .011, -.1, .1) * dir : 0; const cab = cabeceo - (C.inclinacion || 0) * dir; if (cab) { g.save(); g.translate(x, y); g.rotate(cab); g.translate(-x, -y); }   /* 2.7 · peso: cabecea al acelerar y al frenar */
    const vl = MC.arte.f('vehiculoLado'); if (vl && V.clase !== 'pie') vl(g, V, x, y, esc, dir, C);
    const J = Personaje.pose(C.estado || 'quieto', C.fase, { alto: A.alto, manubrio: V.manubrio }); MC.arte.f('personajeLado')(g, J, A, x, y, esc, dir); if (cab) g.restore();
    /* en el agua: el agua tapa las piernas (vadeando) o casi todo el cuerpo (nadando), con su onda */
    if (C.nadando || C.vadeando) {
      /* la superficie del agua tapa lo que está debajo: las piernas al vadear, el cuerpo al nadar y todo al bucear */
      const sup = pr(C.x, C.y, (C.zPaso || 0) + (C.buceando ? 0 : C.nadando ? .58 : .55))[1], bajo = y + esc * (C.buceando ? .9 : .1), t = D.E.t || 0;
      g.fillStyle = C.buceando ? 'rgba(30,95,140,.72)' : 'rgba(52,120,160,.62)'; g.fillRect(x - esc * 1.1, sup, esc * 2.2, Math.max(1, bajo - sup));
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = Math.max(1, esc * .06); g.beginPath(); g.ellipse(x, sup, esc * (.7 + .15 * Math.sin(t * 3)), esc * .12, 0, 0, TAU); g.stroke();
      if (C.buceando) this.burbujas(g, x, sup, y, esc, t);
    }
  },
  /* burbujas que suben desde quien bucea hasta la superficie */
  burbujas(g, x, ySup, yBase, esc, t) { g.fillStyle = 'rgba(235,248,255,.85)'; for (let i = 0; i < 6; i++) { const f = ((t * .7 + i / 6) % 1), yy = lerp(yBase, ySup, f), xx = x + Math.sin(t * 2 + i * 1.7) * esc * .2 + esc * .15; g.beginPath(); g.arc(xx, yy, Math.max(1, esc * (.05 + .03 * (i % 3))), 0, TAU); g.fill(); } },
  /* el vehículo que quedó parqueado (en la orilla o amarrado en el agua) */
  estacionado(D, e) {
    const { g, pr, z, P, modo } = D, V = Vehiculos.get(e.veh), [x, y] = pr(e.x, e.y, 0);
    if (modo === 'cenital') { if (MC.arte.f('vehiculoArriba')?.(g,V,x,y,z,e.a + P.yaw)) return; g.save(); g.translate(x, y); g.rotate(e.a + P.yaw); g.scale(z, z); if (V.clase === 'auto' || V.clase === 'pesado' || V.clase === 'moto') Pincel.vehiculoArriba(g, V.clase === 'moto' ? 'moto' : 'carro', V.color, V.largo, V.ancho, false, false); else { g.fillStyle = '#1d1f24'; g.fillRect(-V.largo / 2, -.08, V.largo, .16); g.fillStyle = V.color || '#7ab800'; g.fillRect(-V.largo * .3, -.22, V.largo * .6, .44); } g.restore(); return; }
    const vl = MC.arte.f('vehiculoLado'); Sombras.contacto(g, x, y, z * (V.largo || 1.6) * .5, z * .25, .25); if (vl) vl(g, V, x, y, Math.max(4, z * P.hk * 1.1), Math.cos(e.a + P.yaw) >= 0 ? 1 : -1, null);
  },
  cables(D, cables) {
    const {g,z,P}=D, clave=[z,P.yaw,P.k,P.hk].join('/');
    g.save(); g.strokeStyle='rgba(30,32,38,.8)'; g.lineWidth=Math.max(.6,z*.12);
    for (const L of cables) {
      const inicio=L.T.at(0), [ox,oy]=D.pr(inicio.x,inicio.y);
      if (L._tramaCable?.clave!==clave) {
        const path=new Path2D();
        for (let s=0; s<=L.T.largo; s+=20) {
          let distancia=Infinity;
          for (const e of L.est) distancia=Math.min(distancia,Math.abs(e.s-s));
          const c=L.T.at(s), h=6+22*suave(clamp(distancia/120,0,1)), [x,y]=D.pr(c.x,c.y,h);
          if (s) path.lineTo(x-ox,y-oy); else path.moveTo(x-ox,y-oy);
        }
        L._tramaCable={clave,path};
      }
      g.save(); g.translate(ox,oy); g.stroke(L._tramaCable.path); g.restore();
    }
    g.restore();
  },
  etiquetas(D) {
    const { g, pr, z, W, H, E } = D; if (z < .35) return; g.font = '700 ' + Math.round(clamp(z * 4, 10, 14)) + 'px system-ui, sans-serif'; g.textAlign = 'center';
    /* las etiquetas no se montan unas sobre otras ni tapan el centro (donde va el jugador) */
    const usadas = [], cx = W / 2, cy = H / 2, R0 = Math.min(W, H) * .09;
    const pon = (t, x, y, col) => { const [sx, sy] = pr(x, y, 8); if (sx < -60 || sx > W + 60 || sy < -20 || sy > H + 20) return; const w = g.measureText(t).width + 10, r = [sx - w / 2 - 3, sy - 19, sx + w / 2 + 3, sy + 5]; if (E.bloqueosEtiquetas && E.bloqueosEtiquetas(W, H).some(z => r[0] < z[2] && r[2] > z[0] && r[1] < z[3] && r[3] > z[1])) return; if (usadas.some(u => r[0] < u[2] && r[2] > u[0] && r[1] < u[3] && r[3] > u[1])) return; if (Math.abs(sx - cx) < w / 2 + R0 && Math.abs(sy - 8 - cy) < R0 + 10) return; usadas.push(r); g.fillStyle = 'rgba(10,35,66,.82)'; g.fillRect(sx - w / 2, sy - 16, w, 18); g.fillStyle = col; g.fillText(t, sx, sy - 3); };
    for (const l of E.transporte ? E.transporte.lineas : []) if (l.clase === 'metro' || l.clase === 'cable' || l.clase === 'tram') for (const s of l.est) { const q = l.T.at(s.s); pon(s.nombre, q.x, q.y, '#ffffff'); }
    if (z > .9) for (const s of E.mundo.transporte.encicla || []) pon('🚲 ' + s.nombre, s.x, s.y, '#c4ec7c');
    const lug = []; for (const L of E.mundo.lugares) { if (L.secreto) continue; const [sx, sy] = pr(L.x, L.y, 8); if (sx > -40 && sx < W + 40 && sy > 0 && sy < H + 20) lug.push([Math.hypot(sx - W / 2, sy - H / 2), L]); }
    lug.sort((a, b) => a[0] - b[0]); for (const [, L] of lug.slice(0, D.P.k < .45 ? 5 : z > 3 ? 14 : 8)) pon(L.nombre, L.x, L.y, '#ffd84a');   // pocas y las del centro: que no tapen el mapa
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
    for (const e of M.transporte.encicla || []) { if (e.x < bx0 - 40 || e.x > bx1 + 40 || e.y < by0 - 40 || e.y > by1 + 40) continue; const p = proyecta(e.x, e.y); if (Math.abs(p.d) < 40 && p.s >= s0 && p.s < s0 + PANO_BLOQUE) B.estaciones.push({ s: p.s, d: p.d, tipo: 'encicla', nombre: e.nombre }); }
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
    if (MC.efectosClima) MC.efectosClima(g, W, H, Cl, t, true);
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

/* ---- js/44-raster.js ---- */
/* =====================================================================
   RASTER · la «tarjeta gráfica» del motor hecha en Canvas 2D (3D por software, sin WebGL)
   Cuando el aparato no tiene WebGL, o su WebGL es por software (lento), las vistas en perspectiva (tercera y primera
   persona, dron y cine) se dibujan aquí, con la misma cámara, el mismo relieve y los mismos edificios:
   - Proyección en perspectiva con la cámara del motor (ojo, blanco y campo visual vertical).
   - Recorte contra el plano cercano (Sutherland–Hodgman) para que nada «se voltee» detrás del ojo.
   - Algoritmo del pintor: todo (relieve, edificios, sitios, tráfico y gente) se ordena de lejos a cerca.
   - Descarte de caras traseras y de lo que queda fuera del cono de visión; detalle según la calidad.
   - Luz del sol real (MC.Cielo), cielo en degradé y niebla por distancia y por clima.
   Es más simple que WebGL (colores planos, sin texturas), pero corre en cualquier navegador.
   ===================================================================== */
class Raster {
  constructor(mundo) { this.mundo = mundo; this.cota = new Map(); this.n = 0; }
  _z(x, y) { const k = (x | 0) * 73856093 ^ (y | 0); let v = this.cota.get(k); if (v === undefined) { v = this.mundo.cota(x, y); if (this.cota.size > 60000) this.cota.clear(); this.cota.set(k, v); } return v; }
  dibujar(g, W, H, E, op = {}) {
    const C = E.camara, M = this.mundo, cal = clamp(E.calidad ?? .8, .3, 1), cielo = E.cielo || { top: [.35, .55, .85], hor: [.75, .85, .95], bruma: [.8, .85, .9], ambiente: .8, luzSol: .6, noche: 0, sol: { x: .3, y: .3, z: .9 } };
    const o = C.ojo, b = C.blanco; let fx = b[0] - o[0], fy = b[1] - o[1], fz = b[2] - o[2], l = Math.hypot(fx, fy, fz) || 1; fx /= l; fy /= l; fz /= l;
    let rx = -fy, ry = fx; l = Math.hypot(rx, ry); if (l < 1e-3) { rx = Math.cos(C.yaw || 0); ry = Math.sin(C.yaw || 0); l = 1; } rx /= l; ry /= l;
    const ux = -fz * ry, uy = fz * rx, uz = fx * ry - fy * rx, F = (H / 2) / Math.tan((C.fov || 1) / 2), NEAR = .4;
    const R = (220 + 280 * cal) * (op.lejos || 1), niebla = E.clima ? E.clima.niebla || 0 : 0, lejos = R * (1 - niebla * .65), cerca = lejos * .35;
    const bruma = cielo.bruma, sol = cielo.sol || { x: 0, y: 0, z: 1 }, amb = cielo.ambiente ?? .8, luz = cielo.luzSol ?? .5;
    /* cielo */
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, css3(cielo.top)); gr.addColorStop(.55, css3(cielo.hor)); gr.addColorStop(1, css3(bruma)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const cam = (x, y, z) => { const dx = x - o[0], dy = y - o[1], dz = z - o[2]; return [dx * rx + dy * ry, dx * ux + dy * uy + dz * uz, dx * fx + dy * fy + dz * fz]; };
    const L = [], Ls = [], Lsh = []; const tanH = Math.tan((C.fov || 1) / 2) * (W / H) * 1.25;
    const visible = (x, y, r) => { const dx = x - o[0], dy = y - o[1], fl = Math.hypot(fx, fy) || 1, d = (dx * fx + dy * fy) / fl; if (d < -r) return false; const lat = Math.abs(dx * rx + dy * ry); return lat <= (Math.max(d, 0) + r * 2) * tanH + r + 30 && Math.hypot(dx, dy) < R + r; };
    const sombra = (nx, ny, nz) => clamp(.42 + .5 * amb + luz * Math.max(0, nx * sol.x + ny * sol.y + nz * sol.z) * .55 - (cielo.noche || 0) * .3, .3, 1.15);
    const color = (c, k, d) => css3(mez3([c[0] * k, c[1] * k, c[2] * k], bruma, clamp((d - cerca) / Math.max(1, lejos - cerca), 0, 1)));
    /* polígono en el mundo → recortado, proyectado y guardado con su profundidad */
    const poly = (P, col, k, suelo) => {
      let Q = P.map(p => cam(p[0], p[1], p[2])), S = [];
      for (let i = 0; i < Q.length; i++) { const a = Q[i], c = Q[(i + 1) % Q.length], ia = a[2] >= NEAR, ic = c[2] >= NEAR; if (ia) S.push(a); if (ia !== ic) { const t = (NEAR - a[2]) / (c[2] - a[2]); S.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, NEAR]); } }
      if (S.length < 3) return; let d = 0; for (const s of S) d += s[2]; d /= S.length; if (d > lejos * 1.15) return;
      (suelo === 2 ? Lsh : suelo ? Ls : L).push({ d, pts: S.map(s => [W / 2 + s[0] / s[2] * F, H / 2 - s[1] / s[2] * F]), fill: suelo === 2 ? col : color(col, k, d), sh: suelo === 2 });
    };
    /* relieve: rejilla alrededor del ojo, más fina con más calidad */
    const PAL = (MC.arte.dato('suelo', PAL_SUELO) || PAL_SUELO).map(hex3), paso = cal > .75 ? 14 : cal > .5 ? 20 : 28, cx0 = Math.floor((o[0] - R) / paso), cx1 = Math.ceil((o[0] + R) / paso), cy0 = Math.floor((o[1] - R) / paso), cy1 = Math.ceil((o[1] + R) / paso);
    for (let j = cy0; j < cy1; j++) for (let i = cx0; i < cx1; i++) {
      const x = i * paso, y = j * paso, mx = x + paso / 2, my = y + paso / 2; if (!visible(mx, my, paso) || !M.dentro(mx, my)) continue;
      const z00 = this._z(x, y), z10 = this._z(x + paso, y), z11 = this._z(x + paso, y + paso), z01 = this._z(x, y + paso);
      const nx = (z00 + z01 - z10 - z11) / (2 * paso), ny = (z00 + z10 - z01 - z11) / (2 * paso), nl = Math.hypot(nx, ny, 1);
      poly([[x, y, z00], [x + paso, y, z10], [x + paso, y + paso, z11], [x, y + paso, z01]], PAL[M.suelo(mx, my)] || PAL[0], sombra(nx / nl, ny / nl, 1 / nl), true);
    }
    /* calles y ciclorrutas como cintas sobre el relieve (con su ancho real) */
    if (M._rejillaVias) { const { G, C: Cg } = M._rejillaVias(), VV = M.vias(), Rv = R * .55, vis = new Set(), asf = hex3('#4f545e'), cic = hex3('#3f9a55');
      for (let gy = Math.floor((o[1] - Rv) / Cg); gy <= Math.floor((o[1] + Rv) / Cg); gy++) for (let gx = Math.floor((o[0] - Rv) / Cg); gx <= Math.floor((o[0] + Rv) / Cg); gx++) { const a = G.get(gx * 65536 + gy); if (a) for (let q = 0; q < a.length; q += 2) vis.add(a[q]); }
      for (const i of vis) { const v = VV[i], p = v.p, w = (v.ancho || (v.k <= 2 ? 12 : 7)) / 2, col = v.k === VIA.CICLO ? cic : asf; if (v.k === VIA.CICLO && cal < .5) continue;
        for (let j = 0; j + 3 < p.length; j += 2) { const ax = p[j], ay = p[j + 1], bx = p[j + 2], by = p[j + 3], mx = (ax + bx) / 2, my = (ay + by) / 2, l2 = Math.hypot(bx - ax, by - ay) || 1; if (!visible(mx, my, l2)) continue; const nx = -(by - ay) / l2 * w, ny = (bx - ax) / l2 * w, za = this._z(ax, ay) + .15, zb = this._z(bx, by) + .15;
          poly([[ax + nx, ay + ny, za], [bx + nx, by + ny, zb], [bx - nx, by - ny, zb], [ax - nx, ay - ny, za]], col, sombra(0, 0, 1), true); } } }
    /* prisma (edificio, sitio o vehículo): muros que miran al ojo y techo */
    const prisma = (P, z0, z1, muro, techo) => {
      const n = P.length >> 1; let A = 0; for (let i = 0; i < n; i++) { const j = (i + 1) % n; A += P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; } const sg = A > 0 ? 1 : -1;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, ax = P[2 * i], ay = P[2 * i + 1], bx = P[2 * j], by = P[2 * j + 1], ex = bx - ax, ey = by - ay, el = Math.hypot(ex, ey) || 1, nx = ey / el * sg, ny = -ex / el * sg;
        if ((ax - o[0]) * nx + (ay - o[1]) * ny >= 0) continue;   // cara trasera
        poly([[ax, ay, z0], [bx, by, z0], [bx, by, z1], [ax, ay, z1]], muro, sombra(nx, ny, 0));
      }
      if (o[2] > z1 - .5) { const T = []; for (let i = 0; i < n; i++) T.push([P[2 * i], P[2 * i + 1], z1]); poly(T, techo, sombra(0, 0, 1)); }
    };
    const Rb = R * .8, maxB = Math.round(90 + 420 * cal), lista = M.edificiosEn(o[0] - Rb, o[1] - Rb, o[0] + Rb, o[1] + Rb).filter(q => visible(q.x, q.y, Math.max(q.hw, q.hd)));
    if (lista.length > maxB) { lista.sort((p, q) => Math.hypot(p.x - o[0], p.y - o[1]) - Math.hypot(q.x - o[0], q.y - o[1])); lista.length = maxB; }
    const sv = Sombras.vector(cielo), aS = sv ? (.38 * sv.fuerza).toFixed(3) : 0;
    for (const q of lista) { const st = estiloEdificio(M, q), z0 = this._z(q.x, q.y), Pq = Mundo.esquinas(q); prisma(Pq, z0, z0 + q.h, hex3(st.muro), hex3(st.techo)); if (sv && sv.fuerza > .05) poly(Sombras.poligono(Pq, q.h, sv).map(p => [p[0], p[1], z0 + .25]), 'rgba(18,26,46,' + aS + ')', 1, 2); }
    for (const q of M.sitios().E) { if (!visible(q.x, q.y, 40)) continue; const z0 = this._z(q.x, q.y); for (const Rr of q.R.slice(0, 1)) prisma(Rr, z0, z0 + Math.min(q.h, 60), hex3('#d9d4c9'), hex3('#b5542f')); }
    /* tráfico (cajas) y gente (de perfil, como recortes en la escena) */
    for (const v of E.vehiculos || []) {
      if (!visible(v.x, v.y, 8) || v.clase === 'cable') continue; const T = (typeof TRAF_TIPOS !== 'undefined' && TRAF_TIPOS[v.tipo]) || { largo: 4.3, ancho: 1.8 }, Lg = (v.largo || T.largo) / 2, An = (v.ancho || T.ancho) / 2, c = Math.cos(v.a || 0), s = Math.sin(v.a || 0), z0 = this._z(v.x, v.y) + (v.z || 0);
      prisma([v.x - c * Lg - s * An, v.y - s * Lg + c * An, v.x + c * Lg - s * An, v.y + s * Lg + c * An, v.x + c * Lg + s * An, v.y + s * Lg - c * An, v.x - c * Lg + s * An, v.y - s * Lg - c * An], z0 + .3, z0 + (v.tipo === 'buseta' || v.tipo === 'camion' || v.clase === 'metro' ? 3 : 1.5), hex3(v.color || '#c33'), hex3(tono(v.color || '#c33', .15)));
    }
    const figura = (x, y, z, dibuja) => { const c = cam(x, y, z); if (c[2] < NEAR + .2 || c[2] > lejos) return; L.push({ d: c[2] - .01, fn: () => dibuja(W / 2 + c[0] / c[2] * F, H / 2 - c[1] / c[2] * F, F / c[2], c[2]) }); };
    const lado = MC.arte.f('personajeLado'), dirDe = a => (Math.cos(a) * rx + Math.sin(a) * ry) >= 0 ? 1 : -1;
    for (const p of (E.peatones || []).slice(0, Math.round(20 + 60 * cal))) { if (!visible(p.x, p.y, 2)) continue; const A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)); figura(p.x, p.y, this._z(p.x, p.y), (sx, sy, esc) => { if (esc < 1.2) return; lado(g, Personaje.pose('camina', p.fase || 0, { alto: A.alto }), A, sx, sy, esc, dirDe(p.a || 0)); }); }
    if (E.jugador && E.jugador.cuerpo && !(C.perfil === 'primera')) {
      const j = E.jugador, Cu = j.cuerpo, A = j.aspecto || Personaje.aspecto(), V = Cu.veh;
      figura(Cu.x, Cu.y, Cu.altura, (sx, sy, esc) => {
        g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(sx, sy + esc * Cu.z, esc * .6, esc * .18, 0, 0, TAU); g.fill();
        const dir = dirDe(Cu.a), vl = MC.arte.f('vehiculoLado'); if (vl && V.clase !== 'pie') vl(g, V, sx, sy, esc, dir, Cu);
        lado(g, Personaje.pose(Cu.estado || 'quieto', Cu.fase, { alto: A.alto, manubrio: V.manubrio }), A, sx, sy, esc, dir);
      });
    }
    for (const x of E.extras || []) if (x.dibujar3d) figura(x.x, x.y, this._z(x.x, x.y) + (x.z || 0), (sx, sy, esc) => x.dibujar3d(g, sx, sy, esc));
    /* pintor: primero el piso (relieve y calles) y encima lo que se levanta, cada capa de lejos a cerca */
    Ls.sort((p, q) => q.d - p.d); L.sort((p, q) => q.d - p.d); this.n = Ls.length + L.length + Lsh.length;
    for (const it of Ls.concat(Lsh, L)) {
      if (it.fn) { it.fn(); continue; }
      const P = it.pts; g.fillStyle = it.fill; g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); g.fill();
      if (cal > .6 && !it.sh) { g.strokeStyle = it.fill; g.lineWidth = .7; g.stroke(); }   // tapa las rendijas entre polígonos
    }
    /* luz de noche: una capa azul y los faroles como puntos (barato) */
    if ((cielo.noche || 0) > .05) { g.fillStyle = 'rgba(10,20,60,' + (cielo.noche * .35).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    return this.n;
  }
}
MC.Raster = Raster;

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
/* Proyección económica de sombras sobre el terreno, sin shadow maps ni texturas.
   Se construye una sola malla para los objetos cercanos, reutilizable por celda de cámara y posición solar.
   Las sombras solo afectan al plano del suelo, con profundidad y mezcla alfa; NO se pintan sobre las fachadas. */
const Sombras3D = {
  generar(M, O, sol, cx, cy, op = {}) {
    if (!sol || sol.z < .16 || !M || typeof M.cota !== 'function') return [];
    const radio = op.radio || 115, m = new Malla();
    const k = Math.min(2.7, 1 / Math.max(sol.z, .32));
    const elev = (x, y) => M.cota(x, y) - O[2] + .12;
    const desplazamiento = altura => {
      const alcance = Math.min(25, altura * k * Math.hypot(sol.x, sol.y));
      const norm = Math.hypot(sol.x, sol.y) || 1;
      return [-sol.x / norm * alcance, -sol.y / norm * alcance];
    };
    const color = [.055, .075, .065];
    const edificaciones = op.edificios || M.edificiosEn(cx - radio, cy - radio, cx + radio, cy + radio);
    let edificios = 0;
    for (const e of edificaciones) {
      if (edificios >= 65) break;
      if (!e || !Number.isFinite(e.x) || !Number.isFinite(e.y) || !Number.isFinite(e.h) ||
          Math.hypot(e.x - cx, e.y - cy) > radio || e.h < 3) continue;
      const P = op.esquinas ? op.esquinas(e) : Mundo.esquinas(e), n = P.length / 2;
      if (n < 3 || n > 16) continue;
      const [dx, dy] = desplazamiento(Math.min(e.h, 22));
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, ax = P[i * 2], ay = P[i * 2 + 1], bx = P[j * 2], by = P[j * 2 + 1];
        if (![ax, ay, bx, by].every(Number.isFinite)) continue;
        m.quad([ax - O[0], elev(ax, ay), ay - O[1]],
          [bx - O[0], elev(bx, by), by - O[1]],
          [bx + dx - O[0], elev(bx + dx, by + dy), by + dy - O[1]],
          [ax + dx - O[0], elev(ax + dx, ay + dy), ay + dy - O[1]], color);
      }
      edificios++;
    }
    const arboles = op.arboles || Arboleda.en(M, cx - radio, cy - radio, cx + radio, cy + radio, 100);
    let arbolesDibujados = 0;
    for (const t of arboles) {
      if (arbolesDibujados >= 80 || !t || !Number.isFinite(t.x) || !Number.isFinite(t.y) || !Number.isFinite(t.h)) continue;
      if (Math.hypot(t.x - cx, t.y - cy) > radio) continue;
      const [dx,dy] = desplazamiento(t.h * .72), x = t.x + dx, y = t.y + dy, rx = Math.max(.5, t.r * .86), ry = rx * .75;
      const center = [x - O[0], elev(x, y), y - O[1]];
      for(let i = 0;i < 8;i++) {
        const a = i * Math.PI/4, b=(i+1)*Math.PI/4;
        const pa = [x + Math.cos(a)*rx, y + Math.sin(a)*ry], pb=[x + Math.cos(b)*rx,y + Math.sin(b)*ry];
        m.tri(center,[pa[0]-O[0],elev(...pa),pa[1]-O[1]],[pb[0]-O[0],elev(...pb),pb[1]-O[1]],color);
      }
      arbolesDibujados++;
    }
    return m.d;
  }
};
const VS = 'attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;attribute float aE;uniform mat4 uM;uniform vec3 uL;uniform float uAmb;uniform float uSol;uniform vec3 uO;uniform float uNoche;varying vec3 vC;varying float vD;uniform float uCurv;void main(){float d=max(dot(normalize(aN),uL),0.);vec3 c=aC*(uAmb+uSol*d);vC=mix(c,aC*(0.55+0.6*uNoche),aE*uNoche)+aE*uNoche*vec3(0.25,0.18,0.05);vD=length(aP-uO);vec3 pc=aP;vec2 dd=aP.xz-uO.xz;pc.y-=dot(dd,dd)*uCurv;gl_Position=uM*vec4(pc,1.);}';
const VT = 'attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;uniform mat4 uM;uniform vec3 uL;uniform float uAmb;uniform float uSol;uniform vec3 uO;varying vec2 vT;varying float vL;varying float vD;uniform float uCurv;void main(){vL=uAmb+uSol*max(dot(normalize(aN),uL),0.);vT=aT;vD=length(aP-uO);vec3 pc=aP;vec2 dd=aP.xz-uO.xz;pc.y-=dot(dd,dd)*uCurv;gl_Position=uM*vec4(pc,1.);}';
const FS = 'precision mediump float;uniform vec3 uF;uniform vec2 uFR;varying vec3 vC;varying float vD;void main(){float f=clamp((vD-uFR.x)/(uFR.y-uFR.x),0.,1.);gl_FragColor=vec4(mix(vC,uF,f),1.);}';
const FT = 'precision mediump float;uniform sampler2D uS;uniform vec3 uF;uniform vec2 uFR;varying vec2 vT;varying float vL;varying float vD;void main(){float f=clamp((vD-uFR.x)/(uFR.y-uFR.x),0.,1.);gl_FragColor=vec4(mix(texture2D(uS,vT).rgb*vL,uF,f),1.);}';
const FSH = 'precision mediump float;varying vec3 vC;uniform float uAlpha;void main(){gl_FragColor=vec4(vC,uAlpha);}';
const FC = 'precision mediump float;varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.);}';
const VC = 'attribute vec2 aP;attribute vec3 aC;varying vec3 vC;void main(){vC=aC;gl_Position=vec4(aP,0.999,1.);}';
class VistaGL {
  constructor(mundo, losas) {
    this.mundo = mundo; this.losas = losas; this.cv = lienzo(4, 4); this.ok = false; this.regiones = new Map(); this.O = null; this.R = 160; this.cola = [];
    try { this.gl = this.cv && this.cv.getContext && (this.cv.getContext('webgl', { antialias: true, alpha: false }) || this.cv.getContext('experimental-webgl')); } catch (e) { this.gl = null; }
    if (!this.gl) return; const gl = this.gl;
    const prog = (v, f) => { const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }; const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u = {}, a = {}; const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS), na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); for (let i = 0; i < nu; i++) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n); } for (let i = 0; i < na; i++) { const n = gl.getActiveAttrib(p, i).name; a[n] = gl.getAttribLocation(p, n); } return { p, u, a }; };
    try { this.pC = prog(VS, FS); this.pT = prog(VT, FT); this.pS = prog(VC, FC); this.pSh = prog(VS, FSH); this.ok = true; } catch (e) { MC.falla('WebGL', e); this.ok = false; }
    this.dyn = gl.createBuffer(); this.cielo = gl.createBuffer(); this.bufSombras = gl.createBuffer(); this._sombrasCache = null; this.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  }
  _vbo(arr) { const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return { b, n: arr.length }; }
  liberar() { const gl = this.gl; for (const r of this.regiones.values()) this._borrar(r); this.regiones.clear(); this._sombrasCache = null; if (this.lejos) { for (const b of this.lejos) gl.deleteBuffer(b.b); this.lejos = null; } }
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
    const res = (detalle > 3 ? 1024 : detalle > 2 ? 512 : detalle > 1 ? 256 : 128) / R, L = this.losas.losa(gx, gy, res, false, 3), tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    if (L) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, L); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([94, 140, 74]));
    const pot = L && (L.width & (L.width - 1)) === 0; if (pot) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, pot ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (pot && this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const m = new Malla(), minH = detalle >= 2 ? 0 : detalle === 1 ? 10 : 24;
    for (const e of M.edificiosEn(x0, y0, x0 + R, y0 + R)) { if (e.x < x0 || e.x >= x0 + R || e.y < y0 || e.y >= y0 + R || e.h < minH) continue; const st2 = estiloEdificio(M, e), P = Mundo.esquinas(e); let zb = 1e9; for (let i = 0; i < P.length; i += 2) zb = Math.min(zb, M.cota(P[i], P[i + 1])); zb -= O[2] + .3; m.edificio3d(P, O, zb, e, st2, detalle, M.estilo(e.x, e.y)); }   /* 3.0: con fachada (js/45b-mundo3d.js) */
    for (const q of M.sitios().E) { if (q.x < x0 || q.x >= x0 + R || q.y < y0 || q.y >= y0 + R) continue; const zb = M.cota(q.x, q.y) - O[2] - .3, mu = hex3(q.clase === 'iglesia' ? '#efe8d8' : '#d9d4c9'), te = hex3(q.techo === 'dos' || q.techo === 'cuatro' ? '#b5542f' : '#bdbcb6'); const h0 = q.partes ? Math.max(3, q.partes[0].z0) : q.h; m.prisma(q.R[0], O, zb, zb + h0, mu, te, { ventanas: detalle >= 2 ? 7 : 0 }); if (q.partes) for (const p of q.partes) m.prisma(p.B, O, zb + p.z0, zb + p.z1, mu, p.techo === 'aguja' ? hex3('#e3e6ea') : te); }
    for (const P of M.pasosEn(x0, y0, x0 + R, y0 + R)) { if (P.nivel <= 0) continue; const T = P.trazo || (P.trazo = new Trazo(P.p)), vi = P.tipo === 'viaducto', rampa = vi ? 0 : Math.min(P.largo * .4, P.peatonal ? 9 : 22), h = s => P.nivel * NIVEL_M * (vi ? 1 : suave(Math.min(s, P.largo - s) / rampa)), paso = 6;
      for (let s = 0; s < P.largo; s += paso) { const a = T.at(s), b = T.at(Math.min(P.largo, s + paso)); if (a.x < x0 || a.x >= x0 + R || a.y < y0 || a.y >= y0 + R) continue; const ha = M.cota(a.x, a.y) + h(s) - O[2], hb = M.cota(b.x, b.y) + h(Math.min(P.largo, s + paso)) - O[2], w = P.ancho / 2, nx = -Math.sin(a.a) * w, ny = Math.cos(a.a) * w, A = [a.x - O[0], a.y - O[1]], Bq = [b.x - O[0], b.y - O[1]], c = hex3(vi ? '#c9cfd8' : P.peatonal ? '#d8cfbd' : '#6a6f79'); m.quad([A[0] + nx, ha, A[1] + ny], [Bq[0] + nx, hb, Bq[1] + ny], [Bq[0] - nx, hb, Bq[1] - ny], [A[0] - nx, ha, A[1] - ny], c); m.quad([A[0] - nx, ha - 1, A[1] - ny], [A[0] - nx, ha, A[1] - ny], [Bq[0] - nx, hb, Bq[1] - ny], [Bq[0] - nx, hb - 1, Bq[1] - ny], hex3('#8e8a80')); m.quad([A[0] + nx, ha - 1, A[1] + ny], [Bq[0] + nx, hb - 1, Bq[1] + ny], [Bq[0] + nx, hb, Bq[1] + ny], [A[0] + nx, ha, A[1] + ny], hex3('#8e8a80'));
        if ((s % (vi ? 30 : 24)) < paso && h(s) > 3) m.caja(A[0], M.cota(a.x, a.y) - O[2], A[1], a.a, 1.4, vi ? 2.2 : 1, h(s) - 1, hex3('#9aa3ad')); } }
    /* 3.0: los MISMOS árboles de las vistas 2D (MC.Arboleda), low-poly y por especie */
    if (detalle >= 1) for (const t of Arboleda.en(M, x0, y0, x0 + R, y0 + R, 3000)) { if (t.x < x0 || t.x >= x0 + R || t.y < y0 || t.y >= y0 + R) continue; m.arbol3d(t.x - O[0], M.cota(t.x, t.y) - O[2] - .1, t.y - O[1], t, detalle); }
    if (false) for (let y = Math.ceil(y0 / 9) * 9; y < y0 + R; y += 9) for (let x = Math.ceil(x0 / 9) * 9; x < x0 + R; x += 9) { const tt = M.suelo(x, y); if (tt !== TT.GRASS && tt !== TT.MOUNT && tt !== TT.PLAZA) continue; const hv = h2(x, y, 41), Z = M.estilo(x, y); if (hv > (tt === TT.MOUNT ? .45 : (Z.arboles || .4) * .5)) continue; const tx = x + h2(x, y, 42) * 6 - O[0], ty = y + h2(x, y, 43) * 6 - O[1], zb = M.cota(x, y) - O[2], r = 2 + h2(x, y, 44) * 2.4, c = hex3(['#3f8a3f', '#4a9444', '#357a38', '#5a9e48'][(hv * 40 | 0) % 4]); m.caja(tx, zb, ty, 0, .5, .5, r, hex3('#6e4a2a')); m.caja(tx, zb + r * .8, ty, hv * 6, r * 1.7, r * 1.7, r * 1.5, c); }
    return { gx, gy, suelo: this._vbo(suelo), tex, cosas: m.d.length ? this._vbo(m.d) : null, detalle };
  }
  /* las cosas que se mueven, en una sola malla por cuadro */
  _dinamico(E) {
    const m = new Malla(), M = this.mundo, O = this.O, rel = (x, y, z) => [x - O[0], z - O[2], y - O[1]];
    const pj = E.jugador; if (pj && !E._sinJugador) { const C = pj.cuerpo, A = pj.aspecto, zb = M.cota(C.x, C.y) + C.zPaso + C.z, J = Personaje.pose(C.estado || 'quieto', C.fase, { alto: A.alto, manubrio: C.veh.manubrio }), ca = Math.cos(C.a), sa = Math.sin(C.a), P = j => rel(C.x + ca * j[0], C.y + sa * j[0], zb + j[1]), Lp = (j, l) => { const p = P(j); return [p[0] - sa * l, p[1], p[2] + ca * l]; };
      const piel = hex3(A.cPiel), cam = hex3(A.cCamisa), pan = hex3(A.cPantalon);
      if (C.veh.clase !== 'pie') { const V = C.veh; if (V.clase === 'auto' || V.clase === 'pesado') { const r = rel(C.x, C.y, zb), Mo = Modelos.L.size ? Modelos.vehiculo({ tipo: V.clase === 'pesado' ? 'camion' : 'carro', modelo: V.modelo }) : null; if (Mo) m.modelo(Mo, r[0], r[1], r[2], C.a, { largo: V.largo, tinte: V.tinte || null, oscuro: pj.oscuro || 0, dano: pj.dano || null, distancia: 0 }); else m.carro3d(r[0], r[1], r[2], C.a, V.largo, V.ancho, V.color || '#c0392b', V.clase === 'pesado' ? 'buseta' : 'carro', E.cielo ? E.cielo.noche : 0); } else { m.hueso(P([-.5, .35]), P([.55, .35]), .04, hex3('#1b1f27')); m.hueso(P([-.05, .4]), P([.3, .85]), .035, hex3(V.color || '#7ab800')); m.hueso(P([.55, .35]), P([.38, 1.0]), .03, hex3('#2b2f38')); for (const u of [-.52, .55]) m.caja(...rel(C.x + ca * u, C.y + sa * u, zb), C.a, .68, .06, .68, hex3('#1b1f27')); } }
      const MoJ = C.veh.clase === 'pie' && pj.modelo && !C.nadando ? Modelos.L.get(pj.modelo) : null; if (MoJ) { const r = rel(C.x, C.y, zb), clip = C.estado === 'corre' ? 'sprint_loop' : C.estado === 'camina' || Math.abs(C.v) > .3 ? (Math.abs(C.v) > 3.2 ? 'sprint_loop' : 'walk_loop') : 'idle_breath'; m.modelo(MoJ, r[0], r[1], r[2], C.a, { k: (A.alto || 1.7) / MoJ.alto, clip, t: E.t || 0 }); } else if (!(C.veh.clase === 'auto' || C.veh.clase === 'pesado')) { m.hueso(Lp(J.cadera, .12), Lp(J.rodI, .12), .07, pan); m.hueso(Lp(J.rodI, .12), Lp(J.pieI, .12), .06, pan); m.hueso(Lp(J.cadera, -.12), Lp(J.rodD, -.12), .07, pan); m.hueso(Lp(J.rodD, -.12), Lp(J.pieD, -.12), .06, pan); if (!this._sinCabeza) m.hueso(P(J.cadera), P(J.pecho), .17, cam); m.hueso(Lp(J.pecho, .2), Lp(J.codoI, .22), .05, cam); m.hueso(Lp(J.codoI, .22), Lp(J.manoI, .2), .045, A.manga ? cam : piel); m.hueso(Lp(J.pecho, -.2), Lp(J.codoD, -.22), .05, cam); m.hueso(Lp(J.codoD, -.22), Lp(J.manoD, -.2), .045, A.manga ? cam : piel); const h = P(J.cabeza); if (!this._sinCabeza) m.caja(h[0], h[1] - .13, h[2], C.a, .24, .22, .26, piel); if (this._sinCabeza) { /* en primera persona se ven las manos y el manubrio */ } else if (A.cCasco) m.caja(h[0], h[1] + .06, h[2], C.a, .3, .27, .12, hex3(A.cCasco)); else m.caja(h[0] - ca * .03, h[1] + .07, h[2] - sa * .03, C.a, .26, .24, .08, hex3(A.cPelo)); }
    }
    this._njug = m.d.length;   // 3.0: lo del jugador va primero (se repinta encima en las cámaras aéreas)
    for (const v of E.trafico || []) { const T2 = TRAF_TIPOS[v.tipo] || TRAF_TIPOS.carro, r = rel(v.x, v.y, M.cota(v.x, v.y)), h = v.tipo === 'buseta' || v.tipo === 'camion' ? 2.9 : v.tipo === 'moto' || v.tipo === 'bici' ? 1.2 : 1.1; const Mo = Modelos.L.size && Math.hypot(v.x - E.camara.x, v.y - E.camara.y) < Modelos.lejos ? Modelos.vehiculo(v) : null; if (Mo) { m.modelo(Mo, r[0], r[1], r[2], v.a, { largo: v.largo || T2.largo, tinte: v.sirena || v.bando ? null : v.color, oscuro: v.roto ? .65 : 0, dano: v.dano || null, distancia: Math.hypot(v.x - E.camara.x, v.y - E.camara.y), calidad: E.calidad }); if (v.sirena) { const f = Math.floor(performance.now() / 160) % 2, ca = Math.cos(v.a), sa = Math.sin(v.a); m.cajaF(r[0] - ca * .35 - sa * .25, r[1] + 1.56, r[2] - sa * .35 + ca * .25, v.a, .3, .16, .12, f ? [1, .1, .1] : [.35, .05, .05], f); m.cajaF(r[0] - ca * .35 + sa * .25, r[1] + 1.56, r[2] - sa * .35 - ca * .25, v.a, .3, .16, .12, f ? [.1, .2, .5] : [.15, .4, 1], 1 - f); } } else m.carro3d(r[0], r[1], r[2], v.a, T2.largo, T2.ancho, v.color, v.tipo === 'buseta' || v.tipo === 'camion' || v.tipo === 'moto' || v.tipo === 'bici' ? v.tipo : 'carro', E.cielo ? E.cielo.noche : 0, v.sirena ? v : null); }
    /* 4.0: modelos GLB que el juego pone en el mundo (personas de la historia, retenes, contenedores, escondites…) */
    for (const q of E.modelos3d || []) { const Mo = Modelos.L.get(q.id); if (!Mo || Math.hypot(q.x - E.camara.x, q.y - E.camara.y) > (q.lejos || 260)) continue; const r = rel(q.x, q.y, M.cota(q.x, q.y) + (q.z || 0)); m.modelo(Mo, r[0], r[1], r[2], q.a || 0, { k: q.k || 1, ky: q.ky, largo: q.largo, tinte: q.tinte || null, e: q.e || 0, clip: q.clip, t: (E.t || 0) + (q.fase || 0), distancia: Math.hypot(q.x - E.camara.x, q.y - E.camara.y), calidad: E.calidad }); }
    for (const p of E.peatones || []) { const r = rel(p.x, p.y, M.cota(p.x, p.y)), A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)), sw = Math.sin(p.fase) * .25; m.persona3d(r[0], r[1], r[2], p.a, A, p.fase || 0, A.alto || 1.7); }
    if (E.piezas && typeof E.piezas.malla === 'function') E.piezas.malla(m, rel, E.camara, 170);
    if (E.jugador && E.jugador.cuerpo && E.jugador.cuerpo.veh.clase !== 'pie' && E.jugador.dano) {
      const C = E.jugador.cuerpo, r = rel(C.x, C.y, M.cota(C.x, C.y));
      MC.Piezas.motorDano(m, r, C.a, E.jugador.dano, E.t || 0);
    }
    if (E.objetos) E.objetos.malla(m, rel, pj ? pj.cuerpo : null, 170);   // 3.0: artilugios físicos (MC.Objetos)
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
    /* 3.0: radio de vista definido por la cámara (la periferia del jugador). Las aéreas cargan solo lo que cabe en su encuadre
       y un poco más, con la niebla justo antes del borde: lo que se va cargando no se ve llegar (como la bruma de GTA San Andreas) */
    const aerea = C.d && C.d.fijo, Da = aerea ? (C.distAerea || 60) : 0;
    this._sinCabeza = C.perfil === 'primera'; const R = this.R, radio = aerea ? clamp(Da * 2.3 + 50, 140, 640) : 380 + 520 * cal, cx = aerea ? C.blanco[0] : C.ojo[0], cy = aerea ? C.blanco[1] : C.ojo[1], quiero = new Map();
    for (let gy = Math.floor((cy - radio) / R); gy <= Math.floor((cy + radio) / R); gy++) for (let gx = Math.floor((cx - radio) / R); gx <= Math.floor((cx + radio) / R); gx++) { const d = Math.hypot((gx + .5) * R - cx, (gy + .5) * R - cy); if (d > radio + R) continue; quiero.set(gx + ',' + gy, d < 100 && cal > .7 ? 4 : d < 170 && cal > .5 ? 3 : d < 300 ? 2 : d < 600 ? 1 : 0); }
    for (const [k, r] of this.regiones) if (!quiero.has(k)) { this._borrar(r); this.regiones.delete(k); }
    const t0 = MC.ahora(), faltan = [...quiero].filter(([k, d]) => { const r = this.regiones.get(k); return !r || r.detalle < d; }).sort((a, b) => { const [ax, ay] = a[0].split(',').map(Number), [bx, by] = b[0].split(',').map(Number); return Math.hypot((ax + .5) * R - cx, (ay + .5) * R - cy) - Math.hypot((bx + .5) * R - cx, (by + .5) * R - cy); });
    for (const [k, d] of faltan) { if (MC.ahora() - t0 > (op.presupuesto || 8) && this.regiones.size) break; const [gx, gy] = k.split(',').map(Number), viejo = this.regiones.get(k); if (viejo) this._borrar(viejo); this.regiones.set(k, this._region(gx, gy, d)); }
    this.pendientes = faltan.length;
    /* cámara y luz */
    const O = this.O, e = [C.ojo[0] - O[0], C.ojo[2] - O[2], C.ojo[1] - O[1]], b = [C.blanco[0] - O[0], C.blanco[2] - O[2], C.blanco[1] - O[1]];
    const P = M4.persp(new Float32Array(16), C.fov, W / H, .3, 9000), V = M4.mirar(new Float32Array(16), e, b), MVP = M4.mul(new Float32Array(16), P, V);
    const S = E.cielo, sol = S.sol, luz = sol.alt > -.05 ? [sol.x, Math.max(.15, sol.z), sol.y] : [.3, .8, .2], ll = Math.hypot(...luz), L = luz.map(v => v / ll), niebla = E.clima ? E.clima.niebla : 0, lluvia = E.clima ? E.clima.lluvia : 0;
    const fog = S.bruma, fr = aerea ? [Da * (1.55 - niebla * .5), Da * (2.25 - niebla * .6) + 40] : [radio * (.45 - niebla * .35), radio * (1.05 - niebla * .5) + 1500 * (1 - niebla) * (1 - lluvia * .5)];
    gl.viewport(0, 0, W, H); gl.clearColor(fog[0], fog[1], fog[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* cielo: degradado de pantalla del cénit al horizonte (el horizonte sigue la inclinación de la cámara) */
    gl.disable(gl.DEPTH_TEST); gl.useProgram(this.pS.p); const dy = b[1] - e[1], dh = Math.hypot(b[0] - e[0], b[2] - e[2]) || 1, hz = clamp(-Math.atan2(dy, dh) / (C.fov / 2), -1, 1), t = S.top, hc = S.hor;
    const cielo = [-1, 1, ...t, 1, 1, ...t, -1, hz, ...hc, 1, hz, ...hc, -1, -1, ...fog, 1, -1, ...fog]; const qd = [0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4].flatMap(i => cielo.slice(i * 5, i * 5 + 5));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cielo); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(qd), gl.DYNAMIC_DRAW); this._attr(this.pS, [['aP', 2], ['aC', 3]], 5); gl.drawArrays(gl.TRIANGLES, 0, 12);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
    const curv = E.curvatura || 0;   /* 4.0: el planeta es redondo: la altura baja con d²·k según la distancia (k = 1/2R) */
    const uni = (p) => { if (p.u.uCurv) gl.uniform1f(p.u.uCurv, curv); gl.uniformMatrix4fv(p.u.uM, false, MVP); gl.uniform3fv(p.u.uL, L); gl.uniform1f(p.u.uAmb, S.ambiente * .9); gl.uniform1f(p.u.uSol, S.luzSol * .75); gl.uniform3fv(p.u.uO, e); gl.uniform3fv(p.u.uF, fog); gl.uniform2fv(p.u.uFR, fr); if (p.u.uNoche) gl.uniform1f(p.u.uNoche, S.noche); };
    /* relieve lejano (sin los bloques que caen bajo el detalle) */
    gl.useProgram(this.pC.p); uni(this.pC); gl.disable(gl.CULL_FACE);
    for (const B of this.lejos) { if (Math.hypot(B.cx - cx, B.cy - cy) < radio - 1100) continue; gl.bindBuffer(gl.ARRAY_BUFFER, B.b); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, B.n / 10); }
    /* regiones: suelo con su losa */
    gl.useProgram(this.pT.p); uni(this.pT); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(this.pT.u.uS, 0);
    for (const r of this.regiones.values()) { gl.bindTexture(gl.TEXTURE_2D, r.tex); gl.bindBuffer(gl.ARRAY_BUFFER, r.suelo.b); this._attr(this.pT, [['aP', 3], ['aN', 3], ['aT', 2]], 8); gl.drawArrays(gl.TRIANGLES, 0, r.suelo.n / 8); }
    /* C-M27: sombras solares planas sobre el terreno antes de dibujar volúmenes.
       Cache por celda de ~25 m, para no reconstruir centenares de triángulos por cuadro.
       Se desactivan con noche, lluvia fuerte o calidad baja (respaldo visual del 2D). */
    if (cal > .48 && sol.z > .16 && S.luzSol > .2 && this.pSh) {
      const clave = [Math.floor(cx / 25), Math.floor(cy / 25), Math.round(sol.x * 10),
        Math.round(sol.y * 10), Math.round(sol.z * 10), ...O].join('/');
      if (!this._sombrasCache || this._sombrasCache.clave !== clave) {
        const geometria = Sombras3D.generar(M, O, sol, cx, cy);
        this._sombrasCache = { clave, n: geometria.length / 10 };
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufSombras);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometria), gl.DYNAMIC_DRAW);
      }
      if (this._sombrasCache.n) {
        const alpha = clamp(S.luzSol * (1 - lluvia * .5) * .33, .05, .33);
        const cull = gl.isEnabled(gl.CULL_FACE);
        gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false); gl.useProgram(this.pSh.p); uni(this.pSh);
        gl.uniform1f(this.pSh.u.uAlpha, alpha);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufSombras);
        this._attr(this.pSh, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10);
        gl.drawArrays(gl.TRIANGLES, 0, this._sombrasCache.n);
        gl.depthMask(true); gl.disable(gl.BLEND); if (cull) gl.enable(gl.CULL_FACE);
      }
    }
    gl.useProgram(this.pC.p); uni(this.pC);
    for (const r of this.regiones.values()) if (r.cosas) { gl.bindBuffer(gl.ARRAY_BUFFER, r.cosas.b); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, r.cosas.n / 10); }
    const D = this._dinamico(E); if (D.length) { gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(D), gl.DYNAMIC_DRAW); this._attr(this.pC, [['aP', 3], ['aN', 3], ['aC', 3], ['aE', 1]], 10); gl.drawArrays(gl.TRIANGLES, 0, D.length / 10);
      /* 3.0: rayos X del jugador en las cámaras aéreas: si un árbol o un techo lo tapan, se ve igual (encima de todo) */
      if (aerea && this._njug > 0) { gl.disable(gl.DEPTH_TEST); gl.drawArrays(gl.TRIANGLES, 0, this._njug / 10); gl.enable(gl.DEPTH_TEST); } }
    this.mvp = MVP; return this.cv;
  }
  _attr(p, L, paso) { const gl = this.gl; let o = 0; for (const [n, k] of L) { const a = p.a[n]; if (a !== undefined && a >= 0) { gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, k, gl.FLOAT, false, paso * 4, o * 4); } o += k; } }
  /* metros del mundo → píxel de la pantalla (para etiquetas encima de la 3D) */
  aPantalla(x, y, z, W, H) { if (!this.mvp || !this.O) return null; const m = this.mvp, X = x - this.O[0], Y = z - this.O[2], Z = y - this.O[1], cw = m[3] * X + m[7] * Y + m[11] * Z + m[15]; if (cw <= .1) return null; return [(m[0] * X + m[4] * Y + m[8] * Z + m[12]) / cw * W / 2 + W / 2, -(m[1] * X + m[5] * Y + m[9] * Z + m[13]) / cw * H / 2 + H / 2]; }
}
Object.assign(MC, { VistaGL, Malla, M4, Sombras3D });

/* ---- js/45-gl3d.js ---- */
/* =====================================================================
   MUNDO ÚNICO 3D (3.0) · un solo mundo, varias cámaras
   Antes cada vista dibujaba su propio mundo (cenital y maqueta en 2D, la 3D aparte, con cubos por árboles y cajas
   por casas). Ahora el mundo es UNO, en 3D (como #DRIVE, Pako Forever o Reckless Getaway: cámara de arriba, mundo en 3D),
   y las vistas son cámaras sobre él. El suelo sigue siendo la losa 2D (vías, andenes, pasto con su desgaste), pero ya
   sin los árboles ni los techos pintados: esos son volumen. Lo que sale aquí:
   - Edificios con fachada: zócalo de color (Guatapé), ventanas con marco y vidrio (algunas encendidas de noche), puerta,
     balcones con baranda, cornisa, techo a dos aguas con alero o plancha con pretil y tanque. Detalle por distancia (LOD).
   - Árboles low-poly facetados, los MISMOS de las vistas 2D (MC.Arboleda: posición, especie, radio y alto):
     guayacanes florecidos, ceiba ancha, mango denso, monte cónico.
   - Carros con cabina, vidrio, ruedas y luces; busetas con su franja de ventanas; motos y bicis con ruedas;
     personas con cabeza, pelo, torso y piernas.
   Todas las caras se orientan «hacia afuera» respecto a un centro (la luz plana por cara da el aspecto low-poly).
   ===================================================================== */
const PAL_ZOCALO = ['#c0392b', '#1f6fb2', '#e2b31b', '#2a9d5c', '#7d3c98', '#e0782a', '#138d75', '#d6336c', '#2c3e50'];
const osc3 = (c, k) => [c[0] * k, c[1] * k, c[2] * k], acl3 = (c, k) => [c[0] + (1 - c[0]) * k, c[1] + (1 - c[1]) * k, c[2] + (1 - c[2]) * k];
Object.assign(Malla.prototype, {
  /* triángulo y cuadro con la cara hacia afuera de ctr */
  triF(a, b, c, col, e, ctr) { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, mx = (a[0] + b[0] + c[0]) / 3 - ctr[0], my = (a[1] + b[1] + c[1]) / 3 - ctr[1], mz = (a[2] + b[2] + c[2]) / 3 - ctr[2]; if (nx * mx + ny * my + nz * mz < 0) this.tri(a, c, b, col, e); else this.tri(a, b, c, col, e); },
  quadF(a, b, c, d, col, e, ctr) { this.triF(a, b, c, col, e, ctr); this.triF(a, c, d, col, e, ctr); },
  /* esfera low-poly (icosaedro, con temblor fijo en los vértices): color arriba y abajo según la cara */
  esfera(cx, cy, cz, rx, ry, rz, col, colB, sem = 1, sub = 0) {
    const t = (1 + Math.sqrt(5)) / 2; let V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(v => { const l = Math.hypot(...v); return v.map(q => q / l); });
    let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    if (sub) { const C = new Map(), mid = (a, b) => { const k = a < b ? a + ',' + b : b + ',' + a; let i = C.get(k); if (i == null) { const m = V[a].map((q, j) => (q + V[b][j]) / 2), l = Math.hypot(...m); i = V.length; V.push(m.map(q => q / l)); C.set(k, i); } return i; }; const F2 = []; for (const [a, b, c] of F) { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); F2.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); } F = F2; }
    const P = V.map((v, i) => { const j = 1 + (h2(i, sem, 71) - .5) * .28; return [cx + v[0] * rx * j, cy + v[1] * ry * j, cz + v[2] * rz * j]; }), ctr = [cx, cy, cz];
    for (const [a, b, c] of F) { const ny = (V[a][1] + V[b][1] + V[c][1]) / 3, k = clamp(ny * .5 + .5, 0, 1), cc = [colB[0] + (col[0] - colB[0]) * k, colB[1] + (col[1] - colB[1]) * k, colB[2] + (col[2] - colB[2]) * k], v = .92 + h2(a + b * 7, c + sem, 72) * .16; this.triF(P[a], P[b], P[c], osc3(cc, v), 0, ctr); }
  },
  /* cilindro (o cono si rTop = 0) vertical de n lados, con tapa */
  cil(x, y, z, r, h, n, col, rTop = r, colTapa = col) {
    const ctr = [x, y + h / 2, z], A = [], B = []; for (let i = 0; i < n; i++) { const t = i / n * TAU; A.push([x + Math.cos(t) * r, y, z + Math.sin(t) * r]); B.push([x + Math.cos(t) * rTop, y + h, z + Math.sin(t) * rTop]); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; if (rTop > 1e-3) this.quadF(A[i], A[j], B[j], B[i], col, 0, ctr); else this.triF(A[i], A[j], B[i], col, 0, ctr); }
    if (rTop > 1e-3) for (let i = 1; i < n - 1; i++) this.triF(B[0], B[i], B[i + 1], colTapa, 0, [x, y, z]);
  },
  /* caja orientada con caras hacia afuera (la caja() vieja se queda para lo que ya la usa) */
  cajaF(x, y, z, a, L, W, Hh, col, e = 0, colTapa = col) { const c = Math.cos(a), s = Math.sin(a), hx = L / 2, hz = W / 2, P = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([u, v]) => [x + u * c - v * s, z + u * s + v * c]), b = P.map(p => [p[0], y, p[1]]), t = P.map(p => [p[0], y + Hh, p[1]]), ctr = [x, y + Hh / 2, z]; for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; this.quadF(b[i], b[j], t[j], t[i], col, e, ctr); } this.quadF(t[0], t[1], t[2], t[3], colTapa, e, ctr); this.quadF(b[0], b[1], b[2], b[3], osc3(col, .6), 0, ctr); },
  /* un árbol de MC.Arboleda (x, z en GL relativos a O; y = pie) */
  arbol3d(x, y, z, t, detalle = 3) {
    const E = Arboleda.ESPECIES[t.e] || Arboleda.ESPECIES.urapan, hx = h2(t.x | 0, t.y | 0, 81), r = t.r, H = t.h, cop = E.copa.map(hex3), flor = E.flor && hx < (E.flores || 0) + .25 ? E.flor.map(hex3) : null, tronco = hex3(t.e === 'ceiba' ? '#8a7f6c' : '#5b4430'), sub = detalle >= 3 ? 1 : 0, sem = (t.x * 13 + t.y * 7) | 0;
    const alto = Math.max(1.6, H * (E.forma === 'ancha' ? .55 : E.forma === 'conica' ? .25 : .42));
    this.cil(x, y, z, Math.max(.16, r * .09), alto + r * .3, 5, tronco, Math.max(.1, r * .06));
    if (E.forma === 'conica') { for (let i = 0; i < 3; i++) { const yb = y + alto + i * (H - alto) * .26, rr = r * (1.05 - i * .26); this.cil(x, yb, z, rr, (H - alto) * .5, 7, osc3(cop[1 + (i > 0)], .9 + i * .06), 0); } return; }
    const C1 = flor ? flor[1] : cop[1], C2 = flor ? flor[0] : cop[0], top = flor ? flor[2] : cop[2], yc = y + alto + (H - alto) * .5, rv = (H - alto) * .55;
    const ancho = E.forma === 'ancha' ? 1.45 : E.forma === 'densa' ? 1.15 : 1;
    this.esfera(x, yc, z, r * ancho, rv * (E.forma === 'ancha' ? .62 : 1), r * ancho, acl3(C1, .08), osc3(C2, .75), sem, sub);
    if (detalle >= 2) for (let i = 0; i < (E.forma === 'ancha' ? 3 : 2); i++) { const a = hx * 6.28 + i * 2.2, d = r * ancho * .62; this.esfera(x + Math.cos(a) * d, yc + rv * (.15 - i * .12), z + Math.sin(a) * d, r * .62, rv * .55, r * .62, i ? top : C1, osc3(C2, .7), sem + i + 1, 0); }
  },
  /* edificio con fachada (P: huella del mapa; O: origen GL; zb: pie en GL; e: el edificio del mundo; st: su estilo) */
  edificio3d(P, O, zb, e, st, detalle, Z, noche = 0) {
    const muro = hex3(st.muro), techo = hex3(st.techo), H = e.h, zt = zb + H + .3, sem = (e.s * 1e5) | 0, casa = H <= 10.5;
    if (detalle < 2) { this.prisma(P, O, zb, zt, muro, techo, {}); return; }
    const n = P.length >> 1, V = []; let A = 0, cx = 0, cz = 0; for (let i = 0; i < n; i++) { V.push([P[2 * i] - O[0], P[2 * i + 1] - O[1]]); cx += V[i][0] / n; cz += V[i][1] / n; }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; A += V[i][0] * V[j][1] - V[j][0] * V[i][1]; }
    const sg = A > 0 ? 1 : -1, ctr = [cx, zb + H / 2, cz];   // normal hacia afuera: (dz, −dx) si la huella va antihoraria (A > 0)
    /* cuerpo y techo (a dos aguas con alero en casas rectangulares; plancha con pretil y tanque en el resto) */
    const dos = !st.plano && !e.P && n === 4;
    this.prisma(P, O, zb, zt, muro, techo, dos ? { dosAguas: { ancho: Math.min(e.hw, e.hd) * 2 } } : {});
    if (dos) { const al = .45; for (let i = 0; i < n; i++) { const a = V[i], b = V[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1) continue; const nx = (b[1] - a[1]) / L * sg, nz = -(b[0] - a[0]) / L * sg; this.quadF([a[0], zt - .05, a[1]], [b[0], zt - .05, b[1]], [b[0] + nx * al, zt - .25, b[1] + nz * al], [a[0] + nx * al, zt - .25, a[1] + nz * al], osc3(techo, .8), 0, [cx, zt - 3, cz]); } }
    else if (detalle >= 3 || !casa) {
      for (let i = 0; i < n; i++) { const a = V[i], b = V[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < .8) continue; const nx = (b[1] - a[1]) / L * sg * .18, nz = -(b[0] - a[0]) / L * sg * .18, a2 = [a[0] - nx, a[1] - nz], b2 = [b[0] - nx, b[1] - nz]; this.quadF([a[0], zt, a[1]], [b[0], zt, b[1]], [b[0], zt + .55, b[1]], [a[0], zt + .55, a[1]], osc3(muro, .93), 0, ctr); this.quadF([a2[0], zt, a2[1]], [b2[0], zt, b2[1]], [b2[0], zt + .55, b2[1]], [a2[0], zt + .55, a2[1]], osc3(muro, .8), 0, [cx, zt + 5, cz]); this.quadF([a[0], zt + .55, a[1]], [b[0], zt + .55, b[1]], [b2[0], zt + .55, b2[1]], [a2[0], zt + .55, a2[1]], acl3(muro, .2), 0, [cx, zt - 5, cz]); }
      const tx = cx + (h2(sem, 4, 83) - .5) * Math.min(e.hw, 4), tz = cz + (h2(sem, 5, 83) - .5) * Math.min(e.hd, 4);
      if (Z.tanques_madera && H > 12 && h2(sem, 3, 82) < (Z.tanques || .5)) {   // Nueva York: tanque de agua de madera sobre patas, con techo cónico
        for (const [px, pz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) this.cajaF(tx + px * .9, zt + .55, tz + pz * .9, 0, .14, .14, 2.2, hex3('#2a2b2e'));
        this.cil(tx, zt + 2.7, tz, 1.25, 2.6, 9, hex3('#6b4e35'), 1.25, hex3('#5a412c')); this.cil(tx, zt + 5.3, tz, 1.35, 1.1, 9, hex3('#3b3d42'), 0);
      } else if (st.tanque || h2(sem, 3, 82) < .35) this.cil(tx, zt, tz, .62, 1.25, 7, hex3('#1d2228'), .62, hex3('#2b3138'));
    }
    if (detalle < 3 && !casa) return;
    /* fachada por cada muro: zócalo, ventanas con marco y vidrio, puerta, balcones y cornisa */
    const zoc = casa && h2(sem, 6, 84) < (Z.zocalos ?? .6) ? hex3(PAL_ZOCALO[(sem >>> 3) % PAL_ZOCALO.length]) : osc3(muro, .72), marco = acl3(muro, .55), vidrio = [.16, .2, .26], luz = [1, .84, .5], puerta = hex3(['#6b3e26', '#2f5d8a', '#8a2f2f', '#2f6b45'][sem % 4]), cor = acl3(muro, .3);
    const pisos = Math.max(1, Math.floor((H - .4) / 3)); let largo = -1, iL = 0; for (let i = 0; i < n; i++) { const a = V[i], b = V[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L > largo) { largo = L; iL = i; } }
    const pared = (a, b, u0, u1, y0, y1, off, col, em = 0) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = (b[1] - a[1]) / L * sg * off, nz = -(b[0] - a[0]) / L * sg * off, A1 = [a[0] + (b[0] - a[0]) * u0 + nx, a[1] + (b[1] - a[1]) * u0 + nz], B1 = [a[0] + (b[0] - a[0]) * u1 + nx, a[1] + (b[1] - a[1]) * u1 + nz]; this.quadF([A1[0], y0, A1[1]], [B1[0], y0, B1[1]], [B1[0], y1, B1[1]], [A1[0], y1, A1[1]], col, em, ctr); };
    for (let i = 0; i < n; i++) {
      const a = V[i], b = V[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 2) continue;
      pared(a, b, 0, 1, zb, zb + .95, .03, zoc);                                   // zócalo
      if (!dos) pared(a, b, 0, 1, zt - .38, zt, .05, cor);                      // cornisa
      const cols = Math.max(1, Math.floor(L / 2.7)), pta = i === iL ? Math.floor(cols / 2) : -1;
      for (let p = 0; p < pisos; p++) for (let q = 0; q < cols; q++) {
        const um = (q + .5) / cols, w = Math.min(1.1, L / cols * .45) / L, y0 = zb + (p === 0 ? 1.15 : 1.0 + p * 3), y1 = y0 + (p === 0 ? 1.15 : 1.3);
        if (p === 0 && q === pta) { const wd = Math.min(1.2, L / cols * .5) / L; pared(a, b, um - wd / 2 - .08 / L, um + wd / 2 + .08 / L, zb + .1, zb + 2.35, .04, marco); pared(a, b, um - wd / 2, um + wd / 2, zb + .1, zb + 2.25, .06, puerta); continue; }
        if (h2(sem + i * 31 + q, p, 85) < .12) continue;
        const enc = h2(sem + q * 7, p + i * 13, 86) < .45 ? 1 : 0;
        pared(a, b, um - w / 2 - .1 / L, um + w / 2 + .1 / L, y0 - .1, y1 + .1, .04, marco);
        pared(a, b, um - w / 2, um + w / 2, y0, y1, .065, enc ? luz : vidrio, enc);
        if (p > 0 && (q + p) % 2 === 0 && h2(sem, q + p * 5, 87) < .55) {         // balcón con baranda
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), bx = a[0] + (b[0] - a[0]) * um + (b[1] - a[1]) / L * sg * .38, bz = a[1] + (b[1] - a[1]) * um - (b[0] - a[0]) / L * sg * .38, bw = (w * L) + .7;
          this.cajaF(bx, y0 - .25, bz, ang, bw, .75, .12, acl3(muro, .15)); pared(a, b, um - (bw / 2) / L, um + (bw / 2) / L, y0 - .13, y0 + .62, .76, hex3('#2a2d33'));
        }
      }
    }
  },
  /* carro low-poly (o buseta, camión, moto o bici) en (x, y, z) GL con rumbo a */
  carro3d(x, y, z, a, L, W, col, tipo = 'carro', noche = 0, extra = null) {
    const c = hex3(col), ca = Math.cos(a), sa = Math.sin(a), pt = (u, v, h) => [x + u * ca - v * sa, y + h, z + u * sa + v * ca], rueda = hex3('#16181c');
    if (tipo === 'moto' || tipo === 'bici') { this.cajaF(x, y + .45, z, a, L * .55, .22, .35, c); for (const u of [-L * .36, L * .36]) { const p = pt(u, 0, 0); this.cajaF(p[0], y + .02, p[2], a, .62, .12, .62, rueda); } if (noche > .3) { const f = pt(L * .45, 0, .75); this.cajaF(f[0], f[1], f[2], a, .1, .14, .12, [1, .95, .7], 1); } return; }
    const alto = tipo === 'buseta' || tipo === 'camion' || tipo === 'bus' ? 2.6 : 1.0, bajo = .34;
    for (const [u, v] of [[L * .32, W * .44], [L * .32, -W * .44], [-L * .32, W * .44], [-L * .32, -W * .44]]) { const p = pt(u, v, 0); this.cajaF(p[0], y + .02, p[2], a, .66, .26, .64, rueda); }
    if (alto > 2) {                                                          // buseta, bus o camión: caja con franja de ventanas
      this.cajaF(x, y + bajo, z, a, L, W, alto, c, 0, acl3(c, .25));
      if (tipo !== 'camion') for (const s of [1, -1]) { const p = pt(-L * .05, s * (W / 2 + .02), 1.55 + bajo); this.cajaF(p[0], p[1], p[2], a, L * .78, .04, .8, [.12, .16, .2]); }
      else { const p = pt(L * .38, 0, bajo + 1.0); this.cajaF(p[0], p[1], p[2], a, L * .18, W * .96, .7, [.12, .16, .2]); }
    } else {                                                                 // carro: chasis, capó y cabina de vidrio
      this.cajaF(x, y + bajo, z, a, L, W, .55, c, 0, acl3(c, .12));
      const cb = pt(-L * .06, 0, bajo + .55); this.cajaF(cb[0], cb[1], cb[2], a, L * .5, W * .84, .5, [.14, .19, .24], 0, c);
    }
    const fl = pt(L / 2 + .01, W * .32, bajo + .32), fr = pt(L / 2 + .01, -W * .32, bajo + .32), bl = pt(-L / 2 - .01, W * .32, bajo + .32), br = pt(-L / 2 - .01, -W * .32, bajo + .32), on = noche > .3 ? 1 : 0;
    for (const p of [fl, fr]) this.cajaF(p[0], p[1], p[2], a, .06, .32, .14, on ? [1, .95, .75] : [.85, .85, .8], on);
    for (const p of [bl, br]) this.cajaF(p[0], p[1], p[2], a, .06, .3, .14, [.75, .08, .08], on);
    /* 4.0: barra de luces de la patrulla (rojo y azul que se alternan) */
    if (extra && extra.sirena && alto < 2) { const f = Math.floor((typeof performance !== 'undefined' ? performance.now() : 0) / 160) % 2, l = pt(-L * .06, W * .2, bajo + 1.08), r = pt(-L * .06, -W * .2, bajo + 1.08);
      this.cajaF(l[0], l[1], l[2], a, .3, .14, .34, f ? [1, .1, .1] : [.35, .05, .05], f); this.cajaF(r[0], r[1], r[2], a, .3, .14, .34, f ? [.1, .2, .5] : [.15, .4, 1], 1 - f); }
  },
  /* persona (peatón): piernas, torso, brazos, cabeza y pelo */
  persona3d(x, y, z, a, A, fase = 0, alto = 1.7) {
    const k = alto / 1.7, ca = Math.cos(a), sa = Math.sin(a), sw = Math.sin(fase) * .22, pt = (u, v, h) => [x + u * ca - v * sa, y + h * k, z + u * sa + v * ca];
    const pan = hex3(A.cPantalon), cam = hex3(A.cCamisa), piel = hex3(A.cPiel), pelo = hex3(A.cPelo || '#2b1d14');
    for (const [s, f] of [[.1, sw], [-.1, -sw]]) { const p = pt(f * .35, s, 0); this.cajaF(p[0], p[1], p[2], a + f * .4, .2, .17, .86 * k, pan); }
    const t = pt(0, 0, .86); this.cajaF(t[0], t[1], t[2], a, .26, .44, .6 * k, cam);
    for (const [s, f] of [[.27, -sw], [-.27, sw]]) { const p = pt(f * .3, s, .9); this.cajaF(p[0], p[1], p[2], a, .13, .12, .55 * k, A.manga ? cam : piel); }
    const h = pt(0, 0, 1.62); this.esfera(h[0], h[1], h[2], .14 * k, .16 * k, .14 * k, piel, osc3(piel, .85), 3, 0);
    const pl = pt(-.03, 0, 1.69); this.esfera(pl[0], pl[1], pl[2], .15 * k, .1 * k, .15 * k, pelo, osc3(pelo, .8), 5, 0);
  }
});
MC.Mundo3D = { PAL_ZOCALO };

/* ---- js/45-glb.js ---- */
/* =====================================================================
   MODELOS GLB (4.0) · el mundo único 3D lee modelos glTF 2.0 binarios (.glb), sin librerías
   Para los 42 modelos de bloqueo de Codex («Turno Cero», CC0; juegos/getaway/arte3d): vehículos, personas,
   tecnología, edificios y escenarios, en metros y con color por vértice. Un juego los mete en su HTML
   ("modelos" en juego.json → var MC_MODELOS = { id: 'base64' }) y la vista 3D los usa en vez de las cajas:
   carros del tráfico, patrullas, camionetas de la banda, el carro del jugador y lo que el juego ponga en E.modelos3d.
   - Lee POSITION, COLOR_0 (u8 normalizado o float) e índices (u16/u32) de la primera malla; sin texturas ni huesos.
   - Color dominante = carrocería: se puede teñir por instancia (cada carro del tráfico con su color).
   - Ejes: glTF Y arriba. Los carros miran hacia +X; las personas, hacia +Z (op.frente).
   - Rendimiento: normales y colores precalculados; por instancia solo se gira, se escala y se copia. Lejos, cajas.
   - PIEL Y ANIMACIÓN (glTF skin + animations, p. ej. los actores de Codex con 12 huesos y 8 clips): Modelos.posar()
     calcula la pose de un clip en el tiempo t (traslación y escala lineales, rotación con nlerp) y deforma los vértices
     en la CPU (4 huesos por vértice). Las poses se guardan por cuadro (15 por segundo) para no recalcular.
   Uso: MC.Modelos.registrar('vehiculo_sedan', base64); malla.modelo(MC.Modelos.get('vehiculo_sedan'), x, y, z, a, { k: 1, tinte: '#7a1f1f' })
   ===================================================================== */
const Modelos = {
  L: new Map(), lejos: 140,
  /* C-M33 · LOD por triángulos: el detalle cercano es íntegro; las dos mallas intermedias son
     selecciones estables de las caras de mayor superficie (no se descargan nuevos GLB).
     Esto conserva los cuerpos grandes y el material emissivo pero omite detalles pequeños lejanos.
     No sustituye a la retopología/LOD artístico de producción. */
  nivelLOD(distancia, op = {}) {
    if (op.forzarLOD != null) return clamp(op.forzarLOD | 0, 0, 2);
    const calidad = op.calidad === 0 ? .7 : op.calidad === 1 ? .85 : 1;
    return distancia < 48 * calidad ? 0 : distancia < 105 * calidad ? 1 : 2;
  },
  indicesLOD(Mo, nivel = 0) {
    if (!Mo || nivel <= 0 || Mo.n < 48) return null;
    if (!Mo._lod) Mo._lod = new Map();
    nivel = Math.min(2, Math.max(1, nivel | 0));
    if (Mo._lod.has(nivel)) return Mo._lod.get(nivel);
    const T = Mo.tris, N = Mo.n, ratio = nivel === 1 ? .64 : .3, contar = Math.max(24, Math.ceil(N * ratio));
    const importancia = new Array(N);
    for (let i = 0; i < N; i++) {
      const o = i * 21, ux = T[o + 3] - T[o], uy = T[o + 4] - T[o + 1], uz = T[o + 5] - T[o + 2],
        vx = T[o + 6] - T[o], vy = T[o + 7] - T[o + 1], vz = T[o + 8] - T[o + 2],
        area = Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) * .5;
      /* Faros y señales importantes, detectados por la marca que ya escribe el lector GLB. */
      importancia[i] = { i, k: area + (T[o + 15] >= 2 ? .1 : 0) };
    }
    importancia.sort((a,b) => b.k - a.k || a.i - b.i);
    const I = Uint32Array.from(importancia.slice(0, contar).map(x => x.i).sort((a,b) => a - b));
    Mo._lod.set(nivel, I);
    return I;
  },
  tiene(id) { return this.L.has(id); },
  get(id) { return this.L.get(id) || null; },
  /* GLB (ArrayBuffer, Uint8Array o base64) → { tris, n, bounds, frente } */
  leer(fuente, op = {}) {
    let u8 = fuente; if (typeof fuente === 'string') u8 = Modelos._b64(fuente); else if (fuente instanceof ArrayBuffer) u8 = new Uint8Array(fuente);
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('no es GLB');
    let o = 12, json = null, bin = null;
    while (o < u8.byteLength) { const len = dv.getUint32(o, true), tipo = dv.getUint32(o + 4, true), d = u8.subarray(o + 8, o + 8 + len); if (tipo === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(d)); else if (tipo === 0x004E4942) bin = d; o += 8 + len; }
    if (!json || !bin) throw new Error('GLB sin JSON o sin BIN');
    const pr = json.meshes[0].primitives[0], acc = i => { const A = json.accessors[i], V = json.bufferViews[A.bufferView], off = (V.byteOffset || 0) + (A.byteOffset || 0), n = A.count * ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT3: 9, MAT4: 16 }[A.type]), b = bin.buffer, bo = bin.byteOffset + off;
      const T = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }[A.componentType]; const copia = new Uint8Array(n * T.BYTES_PER_ELEMENT); copia.set(new Uint8Array(b, bo, n * T.BYTES_PER_ELEMENT)); return { a: new T(copia.buffer), A }; };
    const P = acc(pr.attributes.POSITION).a, Cc = pr.attributes.COLOR_0 != null ? acc(pr.attributes.COLOR_0) : null, I = pr.indices != null ? acc(pr.indices).a : null;
    /* piel: huesos, pesos, matrices de enlace y animaciones (si las hay) */
    let piel = null;
    if (pr.attributes.JOINTS_0 != null && pr.attributes.WEIGHTS_0 != null && json.skins && json.skins.length) {
      const Jt = acc(pr.attributes.JOINTS_0), Wt = acc(pr.attributes.WEIGHTS_0), sk = json.skins[0], wn = Wt.A.componentType === 5121 ? 1 / 255 : Wt.A.componentType === 5123 ? 1 / 65535 : 1;
      const nodos = json.nodes.map(n => ({ t: n.translation || [0, 0, 0], r: n.rotation || [0, 0, 0, 1], s: n.scale || [1, 1, 1], hijos: n.children || [] })), padre = new Int32Array(nodos.length).fill(-1);
      nodos.forEach((n, i) => n.hijos.forEach(h => { padre[h] = i; }));
      const anim = {}; for (const A of json.animations || []) { let dur = 0; const canales = A.channels.map(ch => { const S = A.samplers[ch.sampler], ti = acc(S.input).a, va = acc(S.output).a; dur = Math.max(dur, ti[ti.length - 1] || 0); return { nodo: ch.target.node, path: ch.target.path, t: ti, v: va, paso: ch.target.path === 'rotation' ? 4 : 3 }; }); anim[A.name || ('clip' + Object.keys(anim).length)] = { dur: dur || 1, canales }; }
      piel = { P, C: Cc, comp: Cc ? (Cc.A.type === 'VEC4' ? 4 : 3) : 0, norm: Cc && Cc.A.componentType === 5121 ? 1 / 255 : 1, idx: I, J: Jt.a, W: Float32Array.from(Wt.a, x => x * wn), joints: sk.joints, ibm: sk.inverseBindMatrices != null ? acc(sk.inverseBindMatrices).a : null, nodos, padre, anim, cache: new Map() };
    }
    const nv = P.length / 3, comp = Cc ? (Cc.A.type === 'VEC4' ? 4 : 3) : 0, norm = Cc && Cc.A.componentType === 5121 ? 1 / 255 : 1;
    const col = i => Cc ? [Cc.a[i * comp] * norm, Cc.a[i * comp + 1] * norm, Cc.a[i * comp + 2] * norm] : [.6, .6, .6];
    const idx = I || Uint32Array.from({ length: nv }, (_, i) => i), nt = idx.length / 3, T = new Float32Array(nt * 21), cuenta = new Map();
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (let t = 0; t < nt; t++) {
      const a = idx[t * 3], b = idx[t * 3 + 1], c = idx[t * 3 + 2], o2 = t * 21;
      for (const [k, v] of [[0, a], [1, b], [2, c]]) { for (let j = 0; j < 3; j++) { const q = P[v * 3 + j]; T[o2 + k * 3 + j] = q; if (q < mn[j]) mn[j] = q; if (q > mx[j]) mx[j] = q; } }
      const ux = T[o2 + 3] - T[o2], uy = T[o2 + 4] - T[o2 + 1], uz = T[o2 + 5] - T[o2 + 2], vx = T[o2 + 6] - T[o2], vy = T[o2 + 7] - T[o2 + 1], vz = T[o2 + 8] - T[o2 + 2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; T[o2 + 9] = nx / l; T[o2 + 10] = ny / l; T[o2 + 11] = nz / l;
      const cc = col(a); T[o2 + 12] = cc[0]; T[o2 + 13] = cc[1]; T[o2 + 14] = cc[2]; const key = Math.round(cc[0] * 255) + ',' + Math.round(cc[1] * 255) + ',' + Math.round(cc[2] * 255); cuenta.set(key, (cuenta.get(key) || 0) + l / 2);   /* por área, no por número de triángulos */
      T[o2 + 15] = 0;   /* 1 = carrocería (se tiñe) */
    }
    /* normales hacia afuera (la luz las necesita así; el material es de dos caras) */
    const cx = (mn[0] + mx[0]) / 2, cy = (mn[1] + mx[1]) / 2, cz = (mn[2] + mx[2]) / 2;
    for (let t = 0; t < nt; t++) { const o2 = t * 21, gx = (T[o2] + T[o2 + 3] + T[o2 + 6]) / 3 - cx, gy = (T[o2 + 1] + T[o2 + 4] + T[o2 + 7]) / 3 - cy, gz = (T[o2 + 2] + T[o2 + 5] + T[o2 + 8]) / 3 - cz; if (gx * T[o2 + 9] + gy * T[o2 + 10] + gz * T[o2 + 11] < 0) { T[o2 + 9] = -T[o2 + 9]; T[o2 + 10] = -T[o2 + 10]; T[o2 + 11] = -T[o2 + 11]; } }
    /* la carrocería: el color con más área (las llantas tienen muchos triángulos pequeños) */
    let cuerpo = null, max = 0; for (const [k, n] of cuenta) { const [r, g, b] = k.split(',').map(Number); if (n > max) { max = n; cuerpo = k; } }
    if (cuerpo) for (let t = 0; t < nt; t++) { const o2 = t * 21, key = Math.round(T[o2 + 12] * 255) + ',' + Math.round(T[o2 + 13] * 255) + ',' + Math.round(T[o2 + 14] * 255); if (key === cuerpo) T[o2 + 15] = 1; }
    /* faros y luces traseras de los vehículos (se encienden de noche): blanco cálido adelante (+X), rojo atrás */
    if (mx[0] - mn[0] > 2 && mx[1] - mn[1] < 3.2) for (let t = 0; t < nt; t++) { const o2 = t * 21, r = T[o2 + 12], g = T[o2 + 13], b = T[o2 + 14], gx = (T[o2] + T[o2 + 3] + T[o2 + 6]) / 3;
      if (gx > mx[0] - .12 && r > .7 && g > .65 && b > .6) T[o2 + 15] = 2; else if (gx < mn[0] + .12 && r > .6 && g < .45 && b < .4) T[o2 + 15] = 3; }
    return { tris: T, n: nt, bounds: [mn, mx], frente: op.frente || 'x', largo: mx[0] - mn[0], ancho: mx[2] - mn[2], alto: mx[1] - mn[1], piel, clips: piel ? Object.keys(piel.anim) : [] };
  },
  registrar(id, fuente, op = {}) { try { const m = Modelos.leer(fuente, Object.assign({ frente: /_rig$/.test(id) ? '-z' : /^personaje_/.test(id) ? 'z' : 'x' }, op)); m.id = id; Modelos.L.set(id, m); return m; } catch (e) { MC.falla('modelo ' + id, e); return null; } },
  /* todos los de un paquete { id: base64 } */
  paquete(P) { let n = 0; for (const [id, b] of Object.entries(P || {})) if (Modelos.registrar(id, b)) n++; return n; },
  /* la pose de un clip en el tiempo t → triángulos con el mismo formato que Mo.tris (en caché por cuadro de 1/15 s) */
  posar(Mo, clip, t = 0) {
    const S = Mo.piel; if (!S) return Mo.tris; const A = S.anim[clip] || S.anim[Object.keys(S.anim)[0]]; if (!A) return Mo.tris;
    const f = Math.floor(((t % A.dur) + A.dur) % A.dur * 15), clave = (clip || '') + ':' + f; let T = S.cache.get(clave); if (T) return T;
    const tt = f / 15, N = S.nodos, L = N.map(n => ({ t: n.t.slice(), r: n.r.slice(), s: n.s.slice() }));
    for (const c of A.canales) { const ti = c.t, k = c.paso; let i = 0; while (i < ti.length - 2 && ti[i + 1] < tt) i++; const u = ti.length > 1 ? clamp((tt - ti[i]) / ((ti[i + 1] - ti[i]) || 1), 0, 1) : 0, a = i * k, b = Math.min(ti.length - 1, i + 1) * k, o = L[c.nodo][c.path === 'translation' ? 't' : c.path === 'rotation' ? 'r' : 's'];
      if (!o) continue; let dot = 0; if (k === 4) for (let j = 0; j < 4; j++) dot += c.v[a + j] * c.v[b + j]; const sg = dot < 0 ? -1 : 1; for (let j = 0; j < k; j++) o[j] = c.v[a + j] + (c.v[b + j] * (k === 4 ? sg : 1) - c.v[a + j]) * u; if (k === 4) { const l = Math.hypot(o[0], o[1], o[2], o[3]) || 1; for (let j = 0; j < 4; j++) o[j] /= l; } }
    const G = new Array(N.length), glob = i => { if (G[i]) return G[i]; const m = m4trs(L[i].t, L[i].r, L[i].s); return (G[i] = S.padre[i] >= 0 ? m4mul(glob(S.padre[i]), m) : m); };
    const JM = S.joints.map((nd, j) => S.ibm ? m4mul(glob(nd), S.ibm.subarray(j * 16, j * 16 + 16)) : glob(nd));
    const nv = S.P.length / 3, V = new Float32Array(nv * 3);
    for (let v = 0; v < nv; v++) { const x = S.P[v * 3], y = S.P[v * 3 + 1], z = S.P[v * 3 + 2]; let X = 0, Y = 0, Z = 0; for (let k = 0; k < 4; k++) { const w = S.W[v * 4 + k]; if (!w) continue; const m = JM[S.J[v * 4 + k]]; X += w * (m[0] * x + m[4] * y + m[8] * z + m[12]); Y += w * (m[1] * x + m[5] * y + m[9] * z + m[13]); Z += w * (m[2] * x + m[6] * y + m[10] * z + m[14]); } V[v * 3] = X; V[v * 3 + 1] = Y; V[v * 3 + 2] = Z; }
    T = Mo.tris.slice(); const idx = S.idx || Uint32Array.from({ length: nv }, (_, i) => i), cx = (Mo.bounds[0][0] + Mo.bounds[1][0]) / 2, cy = (Mo.bounds[0][1] + Mo.bounds[1][1]) / 2, cz = (Mo.bounds[0][2] + Mo.bounds[1][2]) / 2;
    for (let q = 0; q < Mo.n; q++) { const o = q * 21; for (let k = 0; k < 3; k++) { const vi = idx[q * 3 + k]; T[o + k * 3] = V[vi * 3]; T[o + k * 3 + 1] = V[vi * 3 + 1]; T[o + k * 3 + 2] = V[vi * 3 + 2]; }
      const ux = T[o + 3] - T[o], uy = T[o + 4] - T[o + 1], uz = T[o + 5] - T[o + 2], vx = T[o + 6] - T[o], vy = T[o + 7] - T[o + 1], vz = T[o + 8] - T[o + 2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const gx = (T[o] + T[o + 3] + T[o + 6]) / 3 - cx, gy = (T[o + 1] + T[o + 4] + T[o + 7]) / 3 - cy, gz = (T[o + 2] + T[o + 5] + T[o + 8]) / 3 - cz, sgn = gx * nx + gy * ny + gz * nz < 0 ? -1 : 1; T[o + 9] = nx * sgn; T[o + 10] = ny * sgn; T[o + 11] = nz * sgn; }
    if (S.cache.size > 400) S.cache.clear(); S.cache.set(clave, T); return T;
  },
  _b64(s) { if (typeof atob === 'function') { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; } return new Uint8Array(Buffer.from(s, 'base64')); },
  /* qué modelo le toca a un vehículo del tráfico (el juego lo puede cambiar) */
  vehiculo(v) {
    const t = v.tipo, id = v.modelo || (v.sirena ? 'vehiculo_police' : v.bando === 'banda' ? 'vehiculo_suv' : t === 'taxi' ? 'vehiculo_taxi' : t === 'moto' ? 'vehiculo_motocicleta' : t === 'camion' || t === 'buseta' ? 'vehiculo_van' : t === 'bici' ? null : 'vehiculo_sedan');
    return id && Modelos.L.get(id) || null;
  }
};
/* un modelo en la malla: posición GL relativa (x, y = altura, z = sur), rumbo a del mundo; escala k o el largo deseado */
Malla.prototype.modelo = function (Mo, x, y, z, a, op = {}) {
  const T = op.clip && Mo.piel ? Modelos.posar(Mo, op.clip, op.t || 0) : Mo.tris,
    lod = Modelos.nivelLOD(op.distancia ?? 0, op), indices = Modelos.indicesLOD(Mo, lod),
    n = indices ? indices.length : Mo.n, ca = Math.cos(a), sa = Math.sin(a), d = this.d,
    fz = Mo.frente === 'z' || Mo.frente === '-z', inv = Mo.frente === '-z' ? -1 : 1;
  const k = op.k || (op.largo ? op.largo / (fz ? Mo.ancho : Mo.largo) : 1), tin = op.tinte ? hex3(op.tinte) : null, D = op.dano, ky = op.ky || k;
  /* 4.0.x: de noche cada modelo tiene un mínimo de luz propia (el sombreador solo usa la emisión de noche) y los faros se encienden */
  const e0 = op.e != null ? op.e : Modelos.brillo, osc = Math.min(.8, (op.oscuro || 0) + (D ? Math.max(D.f || 0, D.b || 0, D.l || 0, D.r || 0) * .25 : 0));
  /* abolladuras por zona (frente, atrás, izquierda, derecha; 0–1): los vértices de esa punta se meten hacia adentro y bajan un poco */
  const L2 = (fz ? Mo.ancho : Mo.largo) * k / 2, W2 = (fz ? Mo.largo : Mo.ancho) * k / 2;
  for (let t = 0; t < n; t++) {
    const o = (indices ? indices[t] : t) * 21, fl = T[o + 15], cuerpo = fl === 1, r0 = cuerpo && tin ? tin[0] : T[o + 12], g0 = cuerpo && tin ? tin[1] : T[o + 13], b0 = cuerpo && tin ? tin[2] : T[o + 14], m = 1 - osc, r = r0 * m, g = g0 * m, b = b0 * m, e = fl >= 2 ? (D && ((fl === 2 && D.f > .6) || (fl === 3 && D.b > .6)) ? 0 : 1) : e0;
    const nu = (fz ? T[o + 11] : T[o + 9]) * inv, nv = (fz ? -T[o + 9] : T[o + 11]) * inv, nx = nu * ca - nv * sa, nz = nu * sa + nv * ca, ny = T[o + 10];
    for (let j = 0; j < 3; j++) { const px = T[o + j * 3], py = T[o + j * 3 + 1], pz = T[o + j * 3 + 2]; let u = (fz ? pz : px) * k * inv, v = (fz ? -px : pz) * k * inv, h = py * ky;
      if (D) { const pf = u - L2 * .45, pb = -L2 * .45 - u, pl = v - W2 * .35, pr = -W2 * .35 - v;
        if (pf > 0 && D.f) { u -= pf * D.f * .55; h -= pf * D.f * .18; } if (pb > 0 && D.b) { u += pb * D.b * .55; h -= pb * D.b * .14; }
        if (pl > 0 && D.l) v -= pl * D.l * .6; if (pr > 0 && D.r) v += pr * D.r * .6; }
      d.push(x + u * ca - v * sa, y + h, z + u * sa + v * ca, nx, ny, nz, r, g, b, e); }
  }
};
Modelos.brillo = .32;
/* matrices 4×4 en columnas (glTF) */
function m4trs(t, q, sc) { const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  return [(1 - (yy + zz)) * sc[0], (xy + wz) * sc[0], (xz - wy) * sc[0], 0, (xy - wz) * sc[1], (1 - (xx + zz)) * sc[1], (yz + wx) * sc[1], 0, (xz + wy) * sc[2], (yz - wx) * sc[2], (1 - (xx + yy)) * sc[2], 0, t[0], t[1], t[2], 1]; }
function m4mul(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; }
MC.Modelos = Modelos;

/* ---- js/46-vistas.js ---- */
/* =====================================================================
   GESTOR DE VISTAS · todas las dimensiones de vista del motor con un solo botón
   cenital · ciudad 3D (oblicua) · maqueta 2:1 · lateral (de lado, gira de a 90°) · panorámica (de perfil) · tercera persona
   · primera persona · dron · cine
   + PIXEL en cualquiera de ellas (la misma escena en un búfer pequeño, agrandada sin suavizado).
   - Canvas 2D es la base (anda en todo); WebGL es la mejora. Si falta WebGL, o es por software, la 3D la dibuja
     MC.Raster (la «tarjeta gráfica» del motor en Canvas 2D). La 3D usa resolución dinámica (MC.ResDinamica).
   - Transición suave entre vistas en el mismo punto (fundido con la vista anterior).
   - Calidad automática: mide el tiempo de cada cuadro y sube o baja el detalle (tráfico, edificios, resolución).
   ===================================================================== */
const VISTAS = [
  /* 3.0: un solo mundo 3D y varias cámaras. Cenital, ciudad y maqueta son cámaras aéreas sobre el mundo 3D; si el aparato
     no tiene GPU (WebGL por software o ninguno), se dibujan con su respaldo 2D (el mismo mundo, el mismo encuadre). */
  { id: 'cenital', n: 'Juego (cenital 3D)', icon: '🗺️', tipo: 'gl', perfil: 'cenital', respaldo: 'cenital', control: 'mundo' },
  { id: 'ciudad3d', n: 'Ciudad 3D', icon: '🏙️', tipo: 'gl', perfil: 'oblicua', respaldo: 'oblicua', control: 'mundo' },
  { id: 'maqueta', n: 'Maqueta', icon: '🧊', tipo: 'gl', perfil: 'maqueta', respaldo: 'maqueta', control: 'mundo' },
  { id: 'lateral', n: 'Lateral', icon: '↔️', tipo: '2d', modo: 'lateral', control: 'mundo' },
  { id: 'pano', n: 'Panorámica', icon: '🎬', tipo: 'pano', control: 'pano' },
  { id: 'tercera', n: 'Tercera persona', icon: '🎮', tipo: 'gl', perfil: 'tercera', control: 'volante' },
  { id: 'primera', n: 'Primera persona', icon: '👁️', tipo: 'gl', perfil: 'primera', control: 'volante' },
  { id: 'dron', n: 'Dron', icon: '🚁', tipo: 'gl', perfil: 'dron', control: 'volante' },
  { id: 'cine', n: 'Cine', icon: '🎥', tipo: 'gl', perfil: 'cine', control: 'volante' }
];
class Vistas {
  constructor(mundo, op = {}) { Arboleda.precalentar();
    this.mundo = mundo; this.losas = new Losas(mundo); this.losasLejos = new Losas(mundo, { lado: 1280, max: 40 }); this.pano = new Panoramica(mundo); this.gl = null; this.glIntentado = false;
    this.actual = VISTAS[0]; this.anterior = null; this.pixel = false; this.escalaPixel = op.escalaPixel || 3; this.calidad = op.calidad ?? .85; this.auto = op.auto !== false; this.ms = 16; this.dpr = 1; this.fundido = null; this._buf = null;
    const aj = GPU.ajustes(); this.motor3d = op.motor3d || 'auto'; this.raster = null; this.res = new ResDinamica({ objetivo: 1000 / aj.fps, escala: aj.escala });
  }
  lista() { return VISTAS.map(v => Object.assign({ disponible: true }, v)); }
  /* 4.0: al cambiar de mundo (planeta), suelta el contexto WebGL y las losas; el navegador solo da unos pocos contextos */
  liberar() { if (this.gl) { try { this.gl.liberar(); const x = this.gl.gl && this.gl.gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch (e) { /* ya estaba suelto */ } this.gl = null; } this.glIntentado = true; this.losas = this.losasLejos = null; this._buf = null; }
  /* ¿la 3D la dibuja el raster por software? 'auto': si no hay WebGL o si el WebGL es por software */
  usaRaster() { if (this.motor3d === 'raster') return true; if (this.motor3d === 'gl') return !this.hayGL(); return GPU.perfil().nivel === 'software' || !this.hayGL(); }
  hayGL() { if (!this.glIntentado) { this.glIntentado = true; try { this.gl = new VistaGL(this.mundo, this.losas); if (!this.gl.ok) this.gl = null; } catch (e) { this.gl = null; MC.falla('WebGL', e); } } return !!this.gl; }
  /* cambia de vista (por id) con transición; la cámara toma el perfil de la nueva */
  usar(id, E) {
    let v = VISTAS.find(q => q.id === id) || VISTAS[0];
    if (v === this.actual) return v; this.anterior = this.actual; this.actual = v;
    if (this._ultimo) { this.fundido = { cv: this._copia(this._ultimo), t: 0 }; }
    if (E && E.camara) { if (v.perfil) E.camara.usarPerfil(v.perfil); if ((v.modo || v.respaldo) === 'oblicua' && (E.camara.pitch < .3 || E.camara.pitch > 1.2)) E.camara.pitch = .62; if (v.id === 'maqueta') E.camara.zoom = Math.max(E.camara.zoom, 1.2); if (v.id === 'lateral') { E.camara.pitch = 1.38; E.camara.girarA(Math.round(E.camara.yaw / (Math.PI / 2)) * Math.PI / 2); E.camara.zoom = Math.max(E.camara.zoom, 2); } }
    MC.emit('vista', v); return v;
  }
  siguiente(E, paso = 1) { const L = this.lista().filter(v => v.disponible), i = L.findIndex(v => v.id === this.actual.id); return this.usar(L[(i + paso + L.length) % L.length].id, E); }
  _copia(src) { const c = lienzo(src.width, src.height); if (c) c.getContext('2d').drawImage(src, 0, 0); return c; }
  /* dibuja la escena E en el contexto g (W × H en px de pantalla) */
  /* ¿hay 3D de verdad (GPU)? Si no, las cámaras aéreas usan su respaldo 2D. motor3d: 'auto' | 'gl' | 'raster' | '2d' */
  gl3d() { return this.motor3d !== '2d' && this.motor3d !== 'raster' && this.hayGL() && !this.usaRaster(); }
  efectiva() { const v = this.actual; return v.respaldo && !this.gl3d() ? (v._r2d ||= Object.assign({}, v, { tipo: '2d', modo: v.respaldo })) : v; }
  /* metros → pantalla con la vista que esté (2D, pixel o 3D): para la flecha al objetivo, globos y etiquetas */
  aPantalla(E, x, y, z = 0) { const v = this._ef || this.actual; if (v.tipo === 'gl' && this.gl && this.gl.mvp) return this.gl.aPantalla(x, y, z, this._W || 1, this._H || 1); if (v.tipo === '2d' && E._pr) { const r = E._pr(x, y, z); return this.pixel ? [r[0] * this.escalaPixel, r[1] * this.escalaPixel] : r; } return null; }
  dibujar(g, W, H, E, dt = 1 / 60) {
    const t0 = MC.ahora(), v = this._ef = this.efectiva(), px = this.pixel; this._W = W; this._H = H; if (E.camara) { E.camara.pantalla = [W, H]; if (this.actual.perfil && E.camara.perfil !== this.actual.perfil) E.camara.usarPerfil(this.actual.perfil); } E.losas = this.losas; E.losasLejos = this.losasLejos; E.calidad = this.calidad;
    let dst = g, w = W, h = H;
    if (px) { w = Math.max(80, Math.round(W / this.escalaPixel)); h = Math.max(60, Math.round(H / this.escalaPixel)); if (!this._buf || this._buf.width !== w || this._buf.height !== h) this._buf = lienzo(w, h); dst = this._buf.getContext('2d'); }
    const zoomReal = E.camara.zoom; if (px) E.camara.zoom = zoomReal / this.escalaPixel;
    try {
      if (v.tipo === '2d') { Vista2D.dibujar(dst, w, h, E, { modo: v.modo, pixel: px, dpr: this.dpr, presupuesto: this.calidad > .6 ? 3 : 1, etiquetas: !px }); this._clima2D(dst, w, h, E); }
      else if (v.tipo === 'three') {
        this.three ||= v.crear();
        dst.drawImage(this.three.dibujar(w,h,E),0,0,w,h);
      }
      else if (v.tipo === 'pano') { this.pano.dibujar(dst, w, h, E, px ? { k: clamp(Math.min(w, h * 1.4) / 70, 2, 40) * (zoomReal / 3.2) } : {}); }
      else if (v.tipo === 'gl') {
        /* resolución dinámica: la 3D se dibuja a escala s y se agranda (bajar píxeles antes que cuadros) */
        const s = this.auto ? this.res.escala : 1, rw = Math.max(64, Math.round(w * s)), rh = Math.max(48, Math.round(h * s));
        if (this.usaRaster()) { if (!this.raster) this.raster = new Raster(this.mundo); if (!this._rb || this._rb.width !== rw || this._rb.height !== rh) this._rb = lienzo(rw, rh); this.raster.dibujar(this._rb.getContext('2d'), rw, rh, E); dst.drawImage(this._rb, 0, 0, w, h); }
        else { const cv = this.gl.dibujar(rw, rh, E, { presupuesto: 4 + 6 * this.calidad }); if (cv) dst.drawImage(cv, 0, 0, w, h); }
        this._clima2D(dst, w, h, E, true);
      }
    } catch (e) { MC.falla('vista ' + v.id, e); }
    E.camara.zoom = zoomReal;
    if (px) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(this._buf, 0, 0, W, H); g.restore(); }
    /* bajo el agua: todo se tiñe de azul (más oscuro mientras más hondo), con rayos de luz que se mueven */
    const Cj = E.jugador && E.jugador.cuerpo; if (Cj && Cj.buceando) this._bajoAgua(g, W, H, -Cj.z, E.t || 0);
    /* fundido desde la vista anterior */
    if (this.fundido && this.fundido.cv) { this.fundido.t += dt / .55; const a = 1 - suave(this.fundido.t); if (a <= 0) this.fundido = null; else { g.save(); g.globalAlpha = a; g.drawImage(this.fundido.cv, 0, 0, W, H); g.restore(); } }
    if (v.tipo === '2d' && (Estilo.p.binario || MC.estilo === 'comic')) {
      const proy = E._vista, k = px ? this.escalaPixel : 1;
      const V = {z:proy.z*k}; for (const campo of ['a','b','c','d','e','f']) V[campo] = proy[campo]*k;
      Estilo.imprimir(g,W,H,V,!!Estilo.p.binario);
    }
    this._ultimo = g.canvas;
    this.losas.trabajar(this.calidad > .6 ? 5 : 3);
    /* calidad automática: media móvil del tiempo de dibujo */
    const ms = MC.ahora() - t0; this.ms = this.ms * .92 + ms * .08; if (v.tipo === 'gl' && this.auto) this.res.medir(ms);
    if (this.auto) { if (this.ms > 26 && this.calidad > .35) this.calidad = Math.max(.35, this.calidad - .01); else if (this.ms < 11 && this.calidad < 1) this.calidad = Math.min(1, this.calidad + .004); }
    return ms;
  }
  _bajoAgua(g, W, H, hondo, t) {
    g.save(); const a = clamp(.28 + hondo * .05, .28, .7), gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(40,120,160,' + (a * .8).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(6,40,70,' + a.toFixed(3) + ')'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(160,220,255,' + (.12 / (1 + hondo * .2)).toFixed(3) + ')'; g.lineWidth = Math.max(6, W * .02);
    for (let i = 0; i < 6; i++) { const x0 = ((i / 6 + Math.sin(t * .2 + i) * .05) % 1) * W; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 - W * .15 + Math.sin(t * .5 + i) * 20, H); g.stroke(); }
    g.restore();
  }
  _clima2D(g, W, H, E, gl) {
    const Cl = E.clima; if (!Cl) return; const t = E.t || 0;
    if (Cl.lluvia > .05) { g.strokeStyle = 'rgba(210,228,245,' + (.22 + Cl.lluvia * .3) + ')'; g.lineWidth = 1; g.beginPath(); const n = Math.round((40 + Cl.lluvia * 120) * (W * H / 3e5)), vx = Math.cos(Cl.viento.dir) * Cl.viento.v; for (let i = 0; i < n; i++) { const x = ((h2(i, 3, 3) * W + t * 60 * vx) % W + W) % W, y = (h2(i, 4, 3) * H + t * (gl ? 700 : 260) * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - vx * (gl ? 2 : .6), y + (gl ? 14 : 5)); } g.stroke(); }
    if (!gl && Cl.niebla > .25) { g.fillStyle = 'rgba(205,210,215,' + ((Cl.niebla - .25) * .55).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    if (Cl.rayo > .05) { g.fillStyle = 'rgba(255,255,255,' + (Cl.rayo * .5).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    MC.efectosClima(g, W, H, Cl, t, gl);
  }
}
/* nieve que cae y se acumula, granizo y calor (los climas de MC.ClimaGlobal) */
MC.efectosClima = function (g, W, H, Cl, t, perspectiva) {
  if (Cl.nieveSuelo > .3 && !perspectiva) { g.fillStyle = 'rgba(245,248,252,' + Math.min(.55, Cl.nieveSuelo / 25).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
  if (Cl.nieve > .05) { g.fillStyle = 'rgba(255,255,255,.9)'; const n = Math.round((60 + Cl.nieve * 160) * (W * H / 3e5)), vx = Math.cos(Cl.viento.dir) * Cl.viento.v * 6; for (let i = 0; i < n; i++) { const x = ((h2(i, 7, 3) * W + t * vx + Math.sin(t + i) * 12) % W + W) % W, y = (h2(i, 8, 3) * H + t * (35 + h2(i, 9, 3) * 30)) % H, r = 1 + h2(i, 6, 3) * 1.8; g.fillRect(x, y, r, r); } }
  if (Cl.granizo > .1) { g.fillStyle = 'rgba(235,245,255,.9)'; for (let i = 0; i < 70; i++) { const x = (h2(i, 3, 5) * W + t * 40) % W, y = (h2(i, 4, 5) * H + t * 900) % H; g.fillRect(x, y, 2.2, 2.2); } }
  if (Cl.calor > .05) { g.fillStyle = 'rgba(255,170,60,' + (Cl.calor * .12).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
};
Object.assign(MC, { Vistas, VISTAS });

/* ---- js/47-clasicos.js ---- */
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
    if (this.x0 == null) this.preparar(cx + ca * 300, cy + sa * 300);
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
    R.alargar(R.largo + 1, (ops) => { if (!lado || ops.length < 2) return null; const L = ops.toSorted((a, b) => a.giro - b.giro), o = lado < 0 ? L[0] : L[L.length - 1]; return Math.abs(o.giro) > .25 ? o : null; });
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

/* ---- js/48-interiores.js ---- */
/* =====================================================================
   INTERIORES PROCEDURALES · cualquier edificio del mundo se puede abrir por dentro
   - El plano sale de la huella del edificio (su rectángulo orientado) y de su uso: casa (con el patio de las casas
     paisas), apartamentos, local comercial, oficina, iglesia, colegio, bodega.
   - Partición binaria (BSP) guiada por un programa de cuartos con áreas reales; puertas entre cuartos vecinos de modo
     que todo queda conectado desde la entrada (árbol de expansión); ventanas en los muros de afuera.
   - Muebles con medidas reales contra los muros y con espacio para pasar (cama 1,4×1,9 m, nevera 0,7×0,7 m…).
   - Choques para caminar adentro (`solido`), y dibujo de planta para la vista cenital y el pixel.
   Determinista: el mismo edificio tiene siempre el mismo interior.
   ===================================================================== */
const PROGRAMAS = {
  casa: [['sala', 18], ['comedor', 10], ['cocina', 8], ['alcoba', 11], ['alcoba', 9], ['bano', 4], ['patio', 9], ['alcoba', 9], ['ropas', 4]],
  apartamento: [['sala', 16], ['cocina', 7], ['alcoba', 10], ['alcoba', 8], ['bano', 4], ['balcon', 4]],
  comercio: [['local', 45], ['bodega', 12], ['bano', 3], ['oficina', 8]],
  oficina: [['recepcion', 14], ['oficina', 12], ['oficina', 12], ['sala_juntas', 16], ['cocineta', 6], ['bano', 4], ['bano', 4]],
  iglesia: [['nave', 160], ['altar', 30], ['sacristia', 14], ['bano', 4]],
  colegio: [['aula', 48], ['aula', 48], ['aula', 48], ['rectoria', 14], ['bano', 8], ['patio', 60]],
  bodega: [['bodega', 200], ['oficina', 12], ['bano', 4]],
  /* lugares jugables (MC.Lugares): talleres, tiendas, centros comerciales, bibliotecas y restaurantes */
  taller: [['taller', 60], ['repuestos', 14], ['mostrador_taller', 10], ['bano', 3]],
  tienda: [['tienda', 40], ['probador', 4], ['probador', 4], ['caja', 6], ['bodega', 10]],
  centro_comercial: [['pasillo_cc', 140], ['local', 40], ['local', 40], ['local', 36], ['local', 36], ['comidas', 70], ['bano', 10], ['bano', 10]],
  biblioteca: [['lectura', 80], ['estanteria', 60], ['infantil', 30], ['computadores', 24], ['recepcion', 12], ['bano', 5]],
  restaurante: [['comedor_r', 50], ['cocina', 18], ['caja', 5], ['bano', 4], ['bano', 4]]
};
/* cuartos que pueden aparecer o no (cada casa es distinta aunque salga del mismo programa) */
const OPCIONALES = { casa: [['estudio', 8], ['terraza', 9], ['alcoba', 9], ['bano', 3.5], ['sala_tv', 10]], apartamento: [['estudio', 7], ['alcoba', 9], ['bano', 3.5], ['ropas', 3]] };
const PISO_DE = { taller: '#9ea3a8', repuestos: '#b9b4a8', mostrador_taller: '#c9c1b0', tienda: '#efe9dc', probador: '#d9cfe0', caja: '#e6e0d2', pasillo_cc: '#f1eee6', comidas: '#e9dcc5', lectura: '#c9a77c', estanteria: '#b88e62', infantil: '#bfe0c8', computadores: '#d4d7dc', comedor_r: '#c49a6c', estudio: '#c9a77c', terraza: '#c8b9a0', sala_tv: '#d6b48a', sala: '#d6b48a', comedor: '#d6b48a', alcoba: '#c49a6c', cocina: '#e8e2d4', bano: '#cfe3ea', patio: '#a8b89a', ropas: '#e0dbcf', balcon: '#cfc6b5', local: '#e6e0d2', bodega: '#bdb8ad', oficina: '#d0c8b8', recepcion: '#e8e2d4', sala_juntas: '#c9b391', cocineta: '#e8e2d4', nave: '#d9c9a8', altar: '#b5542f', sacristia: '#c9b391', aula: '#d8d0bc', rectoria: '#c9b391', pasillo: '#d9d2c2' };
const MUEBLES = { taller: [['banco_trabajo', 2.2, .8], ['elevador', 2.6, 1.6], ['herramientas', 1.6, .5], ['compresor', .6, .6], ['soporte_bici', 1.2, .5]], repuestos: [['estante', 2, .5], ['estante', 2, .5], ['llantas', 1, 1]], mostrador_taller: [['mostrador', 2, .6]], tienda: [['perchero', 1.6, .5], ['perchero', 1.6, .5], ['vitrina', 1.4, .6], ['espejo', .8, .2], ['exhibidor', 1.2, 1.2]], probador: [['espejo', .6, .15]], caja: [['mostrador', 1.8, .6]], pasillo_cc: [['banca', 1.6, .5], ['matera', .8, .8], ['fuente', 2.4, 2.4], ['banca', 1.6, .5]], comidas: [['mesa_cc', 1.2, 1.2], ['mesa_cc', 1.2, 1.2], ['mesa_cc', 1.2, 1.2], ['mesa_cc', 1.2, 1.2]], lectura: [['mesa_lectura', 2.4, 1.2], ['mesa_lectura', 2.4, 1.2], ['estante', 2.4, .4], ['sillon', .9, .9]], estanteria: [['estante', 2.4, .4], ['estante', 2.4, .4], ['estante', 2.4, .4], ['estante', 2.4, .4]], infantil: [['tapete', 2.4, 1.8], ['estante', 1.6, .4], ['puff', .6, .6]], computadores: [['escritorio', 1.4, .7], ['escritorio', 1.4, .7], ['escritorio', 1.4, .7]], comedor_r: [['mesa_r', 1, 1], ['mesa_r', 1, 1], ['mesa_r', 1, 1], ['mesa_r', 1, 1], ['mesa_r', 1, 1]], estudio: [['escritorio', 1.3, .65], ['biblioteca', 1.6, .4], ['silla', .5, .5]], terraza: [['hamaca', 2.6, .9], ['matera', .6, .6], ['matera', .6, .6]], sala_tv: [['sofa', 2, .9], ['tv', 1.4, .4], ['puff', .6, .6]], sala: [['sofa', 2.1, .9], ['mesa_centro', 1, .6], ['tv', 1.4, .4], ['matera', .5, .5]], comedor: [['comedor', 1.6, .9]], cocina: [['estufa', .6, .6], ['nevera', .7, .7], ['lavaplatos', 1.2, .6], ['mesón', 1.6, .6]], alcoba: [['cama', 1.4, 1.9], ['closet', 1.6, .6], ['mesa_noche', .45, .45]], bano: [['inodoro', .4, .65], ['lavamanos', .5, .45], ['ducha', .9, .9]], patio: [['matera', .5, .5], ['matera', .5, .5], ['lavadero', .8, .6]], ropas: [['lavadora', .6, .6]], balcon: [['matera', .5, .5]], local: [['mostrador', 2.4, .7], ['estante', 2, .5], ['estante', 2, .5], ['nevera', .8, .7]], bodega: [['estante', 2.4, .8], ['estante', 2.4, .8], ['estiba', 1.2, 1]], oficina: [['escritorio', 1.4, .7], ['silla', .55, .55], ['archivador', .9, .5]], recepcion: [['mostrador', 2, .7], ['sofa', 1.8, .8]], sala_juntas: [['mesa_juntas', 3, 1.2]], cocineta: [['mesón', 1.6, .6], ['nevera', .7, .7]], nave: [['banca', 3, .5], ['banca', 3, .5], ['banca', 3, .5], ['banca', 3, .5], ['banca', 3, .5], ['banca', 3, .5]], altar: [['altar', 2.4, 1]], sacristia: [['closet', 1.6, .6]], aula: [['tablero', 3, .15], ['pupitre', .7, .5], ['pupitre', .7, .5], ['pupitre', .7, .5], ['pupitre', .7, .5], ['pupitre', .7, .5], ['pupitre', .7, .5]], rectoria: [['escritorio', 1.4, .7]] };
const Interiores = {
  PROGRAMAS, PISO_DE, MUEBLES,
  programaDe(e) { const k = e.clase || ''; if (k === 'iglesia') return 'iglesia'; if (k === 'educativo') return 'colegio'; if (k === 'nave' || k === 'parqueadero' || k === 'techo') return 'bodega'; if (k === 'comercio') return 'comercio'; if (k === 'civico' || k === 'salud' || k === 'transporte') return 'oficina'; if (k === 'edificio' || k === 'torre') return 'apartamento'; return 'casa'; },
  /* plano local (metros, origen en una esquina, x a lo largo del edificio) */
  generar(e, op = {}) {
    const r = mulberry32(op.semilla ?? ((e.s || .5) * 1e9 | 0)), W = Math.max(5, (e.hw || 4) * 2), D = Math.max(5, (e.hd || 4) * 2), prog = op.programa || Interiores.programaDe(e), lista = Interiores.variar(PROGRAMAS[prog].slice(), prog, r, W * D);
    const areaT = W * D, sumaP = lista.reduce((a, q) => a + q[1], 0), escala = areaT / sumaP, cuartos = [];
    /* BSP: parte el rectángulo en dos con una proporción que respeta el área pedida de cada lado */
    const partir = (x, y, w, h, items) => {
      if (items.length === 1 || w * h < 8) { cuartos.push({ tipo: items[0][0], x, y, w, h }); for (const extra of items.slice(1)) cuartos.push({ tipo: extra[0], x, y, w: 0, h: 0, sinEspacio: true }); return; }
      const A = items.reduce((a, q) => a + q[1], 0); let mejor = 1, bd = 1e9, acum = 0; for (let i = 1; i < items.length; i++) { acum += items[i - 1][1]; const d = Math.abs(acum / A - .5); if (d < bd) { bd = d; mejor = i; } }
      const izq = items.slice(0, mejor), der = items.slice(mejor), f = izq.reduce((a, q) => a + q[1], 0) / A, porAncho = w >= h ? true : w * 1.2 > h && r() < .3;
      if (porAncho) { const c = Math.max(1.6, Math.min(w - 1.6, w * f)); partir(x, y, c, h, izq); partir(x + c, y, w - c, h, der); }
      else { const c = Math.max(1.6, Math.min(h - 1.6, h * f)); partir(x, y, w, c, izq); partir(x, y + c, w, h - c, der); }
    };
    partir(0, 0, W, D, lista.map(q => [q[0], q[1] * escala]));
    const C2 = cuartos.filter(c => !c.sinEspacio);
    /* vecinos: comparten un muro de al menos 0,9 m (cabe una puerta) */
    const muro = (a, b) => { const e2 = .01; if (Math.abs(a.x + a.w - b.x) < e2 || Math.abs(b.x + b.w - a.x) < e2) { const y0 = Math.max(a.y, b.y), y1 = Math.min(a.y + a.h, b.y + b.h); if (y1 - y0 >= .9) return { x: Math.abs(a.x + a.w - b.x) < e2 ? a.x + a.w : a.x, y: (y0 + y1) / 2, vertical: true, largo: y1 - y0 }; } if (Math.abs(a.y + a.h - b.y) < e2 || Math.abs(b.y + b.h - a.y) < e2) { const x0 = Math.max(a.x, b.x), x1 = Math.min(a.x + a.w, b.x + b.w); if (x1 - x0 >= .9) return { x: (x0 + x1) / 2, y: Math.abs(a.y + a.h - b.y) < e2 ? a.y + a.h : a.y, vertical: false, largo: x1 - x0 }; } return null; };
    /* entrada: el cuarto público más cercano a la fachada (y = 0); puertas por un árbol de expansión desde ahí */
    const pub = ['sala', 'local', 'recepcion', 'nave', 'aula', 'bodega', 'pasillo'], ent = C2.slice().sort((a, b) => (a.y - b.y) || (pub.includes(b.tipo) - pub.includes(a.tipo)))[0], puertas = [{ x: ent.x + ent.w / 2, y: 0, vertical: false, ancho: prog === 'iglesia' ? 2.4 : 1.1, entrada: true }], dentro = new Set([ent]);
    while (dentro.size < C2.length) { let par = null; for (const a of dentro) { for (const b of C2) { if (dentro.has(b)) continue; const m2 = muro(a, b); if (m2 && (!par || (b.tipo === 'bano') < (par.b.tipo === 'bano'))) par = { a, b, m: m2 }; } } if (!par) break; dentro.add(par.b); puertas.push({ x: par.m.x, y: par.m.y, vertical: par.m.vertical, ancho: .9 }); }
    /* ventanas en los muros de afuera de cuartos con luz (no en baños ni bodegas) */
    const ventanas = []; for (const c of C2) { if (['bano', 'bodega', 'ropas'].includes(c.tipo)) continue; if (c.y < .01 && c !== ent) ventanas.push({ x: c.x + c.w / 2, y: 0, vertical: false, ancho: Math.min(1.8, c.w * .5) }); if (c.y + c.h > D - .01) ventanas.push({ x: c.x + c.w / 2, y: D, vertical: false, ancho: Math.min(1.8, c.w * .5) }); if (c.x < .01) ventanas.push({ x: 0, y: c.y + c.h / 2, vertical: true, ancho: Math.min(1.5, c.h * .4) }); if (c.x + c.w > W - .01) ventanas.push({ x: W, y: c.y + c.h / 2, vertical: true, ancho: Math.min(1.5, c.h * .4) }); }
    /* muebles contra los muros, sin tapar puertas, con 0,6 m para pasar */
    const muebles = [], ESENCIAL = new Set(['cama', 'nevera', 'estufa', 'inodoro', 'sofa', 'ducha', 'comedor', 'mostrador', 'banco_trabajo']); let holgura = .6, puertaMin = 1.1;
    const libreDePuerta = (x, y, w, h) => puertas.every(p => Math.hypot(clamp(p.x, x, x + w) - p.x, clamp(p.y, y, y + h) - p.y) > puertaMin);
    for (const c of C2) { const L = (MUEBLES[c.tipo] || []).slice(); let i = 0;
      /* lo esencial (cama, nevera, estufa, inodoro…) se reintenta con menos holgura: ninguna casa queda sin cocina ni cama */
      for (const [tipo, mw, mh] of L) { let puesto = false; for (let intento = 0; intento < (ESENCIAL.has(tipo) ? 36 : 12) && !puesto; intento++, i++) { holgura = intento < 12 ? .6 : intento < 24 ? .35 : .15; puertaMin = intento < 12 ? 1.1 : intento < 24 ? .85 : .65; const lado = i % 4, rot = lado % 2 === 1, w2 = rot ? mh : mw, h2b = rot ? mw : mh; if (w2 > c.w - .3 || h2b > c.h - .3) continue; const t = r(); let x, y; if (lado === 0) { x = c.x + .1 + t * (c.w - w2 - .2); y = c.y + .1; } else if (lado === 1) { x = c.x + c.w - w2 - .1; y = c.y + .1 + t * (c.h - h2b - .2); } else if (lado === 2) { x = c.x + .1 + t * (c.w - w2 - .2); y = c.y + c.h - h2b - .1; } else { x = c.x + .1; y = c.y + .1 + t * (c.h - h2b - .2); }
          if (tipo === 'banca' || tipo === 'pupitre' || tipo === 'mesa_centro' || tipo === 'comedor' || tipo === 'mesa_juntas' || tipo === 'estiba') { x = c.x + (c.w - w2) / 2 + (r() - .5) * Math.max(0, c.w - w2 - 1.2); y = c.y + .8 + r() * Math.max(0, c.h - h2b - 1.6); }
          const choca = muebles.some(m => x < m.x + m.w + holgura && x + w2 + holgura > m.x && y < m.y + m.h + holgura && y + h2b + holgura > m.y); if (!choca && libreDePuerta(x, y, w2, h2b)) { muebles.push({ tipo, x, y, w: w2, h: h2b, cuarto: c.tipo }); puesto = true; } } } }
    const pisos = Math.max(1, e.pis || 1), plano = { programa: prog, ancho: W, fondo: D, pisos, cuartos: C2, puertas, ventanas, muebles, escaleras: pisos > 1 ? { x: W - 1.3, y: D - 3.2, w: 1.1, h: 3 } : null, edificio: e };
    plano.solido = (x, y) => { if (x < .15 || y < .15 || x > W - .15 || y > D - .15) return !puertas.some(p => p.entrada && Math.abs(p.x - x) < p.ancho / 2 && y < .3); if (muebles.some(m => x > m.x && x < m.x + m.w && y > m.y && y < m.y + m.h && !['tapete', 'ducha'].includes(m.tipo))) return true; for (const c of C2) for (const b of [[c.x, c.y, c.x + c.w, c.y], [c.x, c.y, c.x, c.y + c.h]]) { const vert = b[0] === b[2]; if (vert ? Math.abs(x - b[0]) < .08 && y > b[1] && y < b[3] : Math.abs(y - b[1]) < .08 && x > b[0] && x < b[2]) { if (!puertas.some(p => p.vertical === vert && (vert ? Math.abs(p.x - b[0]) < .1 && Math.abs(p.y - y) < p.ancho / 2 : Math.abs(p.y - b[1]) < .1 && Math.abs(p.x - x) < p.ancho / 2))) return true; } } return false; };
    plano.cuartoEn = (x, y) => C2.find(c => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) || null;
    plano.estilo = Interiores.estiloPara(e, op.estilo, r); Interiores.decorar(plano, r);
    return plano;
  },
  /* planta vista desde arriba: (x, y) esquina en pantalla, esc px por metro */
  dibujar(g, P, x, y, esc, op = {}) {
    g.save(); g.translate(x, y); g.scale(esc, esc); g.lineJoin = 'round';
    g.fillStyle = '#2b2f38'; g.fillRect(-.25, -.25, P.ancho + .5, P.fondo + .5);
    for (const c of P.cuartos) { g.fillStyle = Interiores.pisoDe(P, c.tipo); g.fillRect(c.x + .06, c.y + .06, c.w - .12, c.h - .12); Interiores.patron(g, P, c); if (c.tipo === 'bano' || c.tipo === 'cocina') { g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = .03; for (let q = .3; q < c.w; q += .3) { g.beginPath(); g.moveTo(c.x + q, c.y); g.lineTo(c.x + q, c.y + c.h); g.stroke(); } } }
    g.strokeStyle = '#2b2f38'; g.lineWidth = .14; for (const c of P.cuartos) g.strokeRect(c.x, c.y, c.w, c.h);
    for (const p of P.puertas) { g.fillStyle = PISO_DE.pasillo; if (p.vertical) g.fillRect(p.x - .1, p.y - p.ancho / 2, .2, p.ancho); else g.fillRect(p.x - p.ancho / 2, p.y - .1, p.ancho, .2); g.strokeStyle = 'rgba(43,47,56,.5)'; g.lineWidth = .04; g.beginPath(); if (p.vertical) g.arc(p.x, p.y - p.ancho / 2, p.ancho, 0, Math.PI / 2); else g.arc(p.x - p.ancho / 2, p.y, p.ancho, 0, Math.PI / 2); g.stroke(); }
    for (const v of P.ventanas) { g.fillStyle = '#8cbedc'; if (v.vertical) g.fillRect(v.x - .1, v.y - v.ancho / 2, .2, v.ancho); else g.fillRect(v.x - v.ancho / 2, v.y - .1, v.ancho, .2); }
    const COL = { cama: '#f2efe8', sofa: '#6d8fb3', closet: '#8d6e63', estufa: '#3b3d42', nevera: '#e9eef3', inodoro: '#ffffff', ducha: '#b7d7e6', lavamanos: '#ffffff', mostrador: '#a1887f', estante: '#8d6e63', banca: '#8d6e63', altar: '#efe8d8', escritorio: '#a1887f', comedor: '#8d6e63', tv: '#1d1f24', matera: '#4a9444', pupitre: '#a1887f', tablero: '#2e5d3a' };
    const EST = (P.estilo && ESTILOS_INT[P.estilo]) || ESTILOS_INT.paisa;
    const fmu = MC.arte.f('mueble');   // arte: mueble(g, m, estilo, P) en metros del plano → true si lo dibujó
    for (const m of P.muebles) { if (fmu && fmu(g, m, P.estilo, P) === true) continue; if (m.tipo === 'tapete') { Interiores.tapete(g, m, EST); continue; } g.fillStyle = m.color || (EST.muebles[m.tipo]) || COL[m.tipo] || EST.madera; g.fillRect(m.x, m.y, m.w, m.h); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .03; g.strokeRect(m.x, m.y, m.w, m.h); if (m.tipo === 'cama') { g.fillStyle = '#c43a26'; g.fillRect(m.x + m.w * .08, m.y + m.h * .3, m.w * .84, m.h * .62); } }
    if (P.escaleras) { const s2 = P.escaleras; g.fillStyle = '#bdb8ad'; g.fillRect(s2.x, s2.y, s2.w, s2.h); g.strokeStyle = '#7d7f84'; g.lineWidth = .04; for (let q = 0; q < s2.h; q += .28) { g.beginPath(); g.moveTo(s2.x, s2.y + q); g.lineTo(s2.x + s2.w, s2.y + q); g.stroke(); } }
    if (op.etiquetas !== false && esc > 14) { g.fillStyle = 'rgba(20,24,32,.42)'; g.font = '600 ' + (.34) + 'px system-ui'; g.textAlign = 'left'; g.textBaseline = 'top'; for (const c of P.cuartos) if (c.w > 1.2 && c.h > 1) g.fillText({ bano: 'baño', sala_juntas: 'juntas', recepcion: 'recepción', balcon: 'balcón', rectoria: 'rectoría', sacristia: 'sacristía' }[c.tipo] || c.tipo, c.x + .22, c.y + .2); g.textBaseline = 'alphabetic'; }   // en la esquina: el nombre no tapa los muebles
    g.restore();
  }
};
/* ---------- estilos: la misma casa genérica se ve distinta en cada hogar ---------- */
const ESTILOS_INT = {
  paisa: { n: 'Paisa tradicional', piso: 'hidraulica', pisos: ['#b5542f', '#d8c3a5', '#7a8a6a'], muro: '#f3ead8', madera: '#7b4a2e', acento: '#c43a26', muebles: { sofa: '#8a3b2a', comedor: '#6d4126' }, deco: ['matera', 'matera', 'cuadro', 'hamaca', 'tapete'] },
  moderno: { n: 'Moderno', piso: 'porcelanato', pisos: ['#e7e4de', '#d9d6cf'], muro: '#fafafa', madera: '#c8b79c', acento: '#2f80ed', muebles: { sofa: '#4a5568', comedor: '#d9cbb3' }, deco: ['lampara', 'cuadro', 'matera', 'tapete'] },
  minimalista: { n: 'Minimalista', piso: 'cemento', pisos: ['#cfcfcc', '#bdbdb9'], muro: '#ffffff', madera: '#e3d5bf', acento: '#111111', muebles: { sofa: '#e8e6e1', comedor: '#f2efe9' }, deco: ['matera', 'lampara'] },
  bohemio: { n: 'Bohemio', piso: 'madera', pisos: ['#a0703f', '#8c5f33'], muro: '#f6e3c8', madera: '#6b4423', acento: '#d9822b', muebles: { sofa: '#b0413e', comedor: '#7a4a28' }, deco: ['tapete', 'tapete', 'matera', 'matera', 'cuadro', 'cojines', 'lampara'] },
  campestre: { n: 'Campestre', piso: 'madera', pisos: ['#b38b5d', '#a17c50'], muro: '#efe6d2', madera: '#5d3d24', acento: '#4a7c3a', muebles: { sofa: '#7d8f5b', comedor: '#5d3d24' }, deco: ['matera', 'matera', 'matera', 'hamaca', 'cuadro'] },
  industrial: { n: 'Industrial', piso: 'cemento', pisos: ['#8e8e8b', '#7d7d7a'], muro: '#b8b2a8', madera: '#3f3a36', acento: '#d35400', muebles: { sofa: '#5b4636', comedor: '#2f2f2f' }, deco: ['lampara', 'cuadro', 'matera'] },
  juvenil: { n: 'Juvenil', piso: 'madera', pisos: ['#d2b48c', '#c4a57c'], muro: '#e8f4ff', madera: '#c9a77c', acento: '#ff2fb3', muebles: { sofa: '#39a0ff', comedor: '#ffcc33' }, deco: ['tapete', 'cuadro', 'cuadro', 'lampara', 'puff'] },
  clasico: { n: 'Clásico', piso: 'madera', pisos: ['#7a4f2a', '#6b4423'], muro: '#efe4cf', madera: '#4e2f1a', acento: '#8e1b1b', muebles: { sofa: '#6e1f1f', comedor: '#4e2f1a' }, deco: ['tapete', 'cuadro', 'cuadro', 'lampara', 'matera'] }
};
/* catálogo para diseñar la casa (medidas reales; precio en centavos de peso) */
const CATALOGO = [
  ['sofa', 'Sofá de tres puestos', 2.1, .9, 120000000, 'sala'], ['sofa_l', 'Sofá en L', 2.6, 1.6, 210000000, 'sala'], ['sillon', 'Sillón', .9, .9, 45000000, 'sala'], ['mesa_centro', 'Mesa de centro', 1, .6, 25000000, 'sala'],
  ['tv', 'Televisor 55"', 1.25, .3, 180000000, 'sala'], ['comedor', 'Comedor de 4 puestos', 1.6, .9, 90000000, 'comedor'], ['cama', 'Cama doble', 1.4, 1.9, 110000000, 'alcoba'], ['cama_sencilla', 'Cama sencilla', 1, 1.9, 60000000, 'alcoba'],
  ['closet', 'Clóset', 1.6, .6, 80000000, 'alcoba'], ['escritorio', 'Escritorio', 1.3, .65, 40000000, 'estudio'], ['biblioteca', 'Biblioteca', 1.6, .4, 50000000, 'estudio'], ['nevera', 'Nevera', .7, .7, 190000000, 'cocina'],
  ['estufa', 'Estufa', .6, .6, 90000000, 'cocina'], ['matera', 'Matera con planta', .5, .5, 6000000, ''], ['tapete', 'Tapete', 2, 1.4, 20000000, ''], ['lampara', 'Lámpara de pie', .4, .4, 15000000, ''],
  ['cuadro', 'Cuadro', .9, .06, 12000000, ''], ['hamaca', 'Hamaca', 2.6, .9, 18000000, ''], ['puff', 'Puf', .6, .6, 9000000, ''], ['consola', 'Consola de videojuegos', .5, .3, 250000000, 'sala'],
  ['soporte_bici', 'Soporte para la bici', 1.2, .5, 15000000, ''], ['acuario', 'Acuario', 1, .45, 40000000, '']
].map(([id, n, w, h, precio, cuarto]) => ({ id, n, w, h, precio, cuarto }));
Object.assign(Interiores, {
  ESTILOS: ESTILOS_INT, CATALOGO, OPCIONALES,
  /* agrega o quita cuartos opcionales según el área: dos casas del mismo tamaño casi nunca quedan iguales */
  variar(lista, prog, r, area) {
    lista = lista.map(q => q.slice()); const op = OPCIONALES[prog] || []; const base = lista.reduce((a, q) => a + q[1], 0); let extra = 0;
    for (const q of op) if (r() < .45 && base + extra + q[1] < area * 1.05) { lista.splice(1 + Math.floor(r() * (lista.length - 1)), 0, q.slice()); extra += q[1]; }
    if (r() < .3 && lista.length > 5) { const i = lista.findIndex(q => q[0] === 'ropas' || q[0] === 'balcon'); if (i > 0) lista.splice(i, 1); }
    for (const q of lista) q[1] *= .8 + r() * .4;   // proporciones distintas
    return lista;
  },
  estiloPara(e, pedido, r) { if (pedido && ESTILOS_INT[pedido]) return pedido; const L = Object.keys(ESTILOS_INT), z = e && e.zona; if (z === 'ladera' || z === 'pueblo') return r() < .6 ? 'paisa' : L[Math.floor(r() * L.length)]; if (z === 'poblado') return r() < .5 ? 'moderno' : 'minimalista'; return L[Math.floor(r() * L.length)]; },
  pisoDe(P, tipo) { const E = ESTILOS_INT[P.estilo]; if (!E || ['bano', 'cocina', 'cocineta', 'patio', 'taller', 'bodega', 'pasillo_cc'].includes(tipo) || P.programa !== 'casa' && P.programa !== 'apartamento') return PISO_DE[tipo] || '#d9d2c2'; return E.pisos[(tipo.length + (P.cuartos.findIndex(c => c.tipo === tipo))) % E.pisos.length]; },
  /* textura del piso por estilo: tablas de madera, baldosa hidráulica o porcelanato */
  patron(g, P, c) {
    const E = ESTILOS_INT[P.estilo]; if (!E || ['bano', 'cocina', 'patio', 'taller'].includes(c.tipo)) return; g.save(); g.beginPath(); g.rect(c.x, c.y, c.w, c.h); g.clip();
    if (E.piso === 'madera') { g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = .02; for (let q = c.y; q < c.y + c.h; q += .18) { g.beginPath(); g.moveTo(c.x, q); g.lineTo(c.x + c.w, q); g.stroke(); } }
    else if (E.piso === 'hidraulica') { g.fillStyle = 'rgba(255,255,255,.18)'; for (let yy = c.y; yy < c.y + c.h; yy += .4) for (let xx = c.x + ((yy - c.y) / .4 % 2) * .2; xx < c.x + c.w; xx += .4) { g.beginPath(); g.moveTo(xx + .2, yy); g.lineTo(xx + .4, yy + .2); g.lineTo(xx + .2, yy + .4); g.lineTo(xx, yy + .2); g.fill(); } }
    else if (E.piso === 'porcelanato') { g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = .015; for (let q = c.x; q < c.x + c.w; q += .6) { g.beginPath(); g.moveTo(q, c.y); g.lineTo(q, c.y + c.h); g.stroke(); } for (let q = c.y; q < c.y + c.h; q += .6) { g.beginPath(); g.moveTo(c.x, q); g.lineTo(c.x + c.w, q); g.stroke(); } }
    g.restore();
  },
  tapete(g, m, E) { g.fillStyle = E.acento; g.fillRect(m.x, m.y, m.w, m.h); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .05; g.strokeRect(m.x + .12, m.y + .12, m.w - .24, m.h - .24); g.strokeRect(m.x + .25, m.y + .25, m.w - .5, m.h - .5); },
  /* decoración del estilo: tapetes, materas, cuadros y lámparas donde quepan (sin tapar puertas ni el paso) */
  decorar(P, r) {
    const E = ESTILOS_INT[P.estilo]; if (!E || !['casa', 'apartamento'].includes(P.programa)) return;
    for (const c of P.cuartos) { if (!['sala', 'alcoba', 'comedor', 'estudio', 'terraza', 'sala_tv', 'balcon'].includes(c.tipo)) continue;
      for (const d of E.deco) { if (r() < .45) continue; const dim = d === 'tapete' ? [Math.min(2.2, c.w * .5), Math.min(1.6, c.h * .4)] : d === 'cuadro' ? [.8, .06] : d === 'hamaca' ? [2.6, .9] : [.45, .45];
        for (let k = 0; k < 6; k++) { const x = d === 'tapete' ? c.x + (c.w - dim[0]) / 2 + (r() - .5) * .4 : c.x + .1 + r() * Math.max(0, c.w - dim[0] - .2), y = d === 'cuadro' ? c.y + .02 : d === 'tapete' ? c.y + (c.h - dim[1]) / 2 + (r() - .5) * .4 : c.y + .1 + r() * Math.max(0, c.h - dim[1] - .2), m = { tipo: d, x, y, w: dim[0], h: dim[1], cuarto: c.tipo, deco: true };
          if (Interiores.cabe(P, m, d === 'tapete' || d === 'cuadro')) { if (d === 'tapete') P.muebles.unshift(m); else P.muebles.push(m); break; } } } }
  },
  /* ¿cabe el mueble ahí? dentro del cuarto, sin tapar puertas y con 0,6 m para pasar (los tapetes van debajo de todo) */
  cabe(P, m, encima) {
    const c = P.cuartoEn(m.x + m.w / 2, m.y + m.h / 2); if (!c || m.x < c.x - .01 || m.y < c.y - .01 || m.x + m.w > c.x + c.w + .01 || m.y + m.h > c.y + c.h + .01) return false;
    if (P.puertas.some(p => Math.hypot(clamp(p.x, m.x, m.x + m.w) - p.x, clamp(p.y, m.y, m.y + m.h) - p.y) < (encima ? .3 : .9))) return false;
    /* paso libre: 0,5 m entre muebles grandes; las cosas pequeñas (materas, lámparas) pueden ir más juntas */
    if (encima) return true; const paso = clamp(Math.min(m.w, m.h) * .6, .2, .5); return !P.muebles.some(o => o !== m && o.tipo !== 'tapete' && o.tipo !== 'cuadro' && m.x < o.x + o.w + paso && m.x + m.w + paso > o.x && m.y < o.y + o.h + paso && m.y + m.h + paso > o.y);
  }
});
MC.Interiores = Interiores;

/* ---- js/49-hogar.js ---- */
/* =====================================================================
   MI CASA · la dirección real del jugador se vuelve su casa en el juego (sin internet y sin que salga del aparato)
   DIRECCIÓN (nomenclatura colombiana): «Calle 31 # 28‑15», «Cra 51A No. 52‑10 apto 301», «Kr 43 #10-20», «Cl 56 Sur 48 20»,
   «Diagonal 75B # 2A‑120», «Avenida 80 # 32‑15». Se lee así: la casa está sobre la CALLE 31, a 15 m del cruce con la
   CARRERA 28, caminando hacia la carrera 29. El motor busca las dos vías por su nombre en el mapa (las mismas calles
   reales), encuentra el cruce, mide los metros hacia donde crece la numeración, toma el lado según la placa (pares a
   un lado e impares al otro) y elige el edificio real más cercano. Si no encuentra el cruce, da la calle; si no, el
   barrio o el lugar (y dice qué tan exacto quedó).
   PRIVACIDAD: todo se calcula en el aparato; la dirección no viaja a ningún servidor y solo se guarda si el jugador
   quiere (en su guardado local). El juego nunca la muestra a otros.
   HOGAR: el interior sale del edificio real (MC.Interiores) con un estilo propio; el jugador lo diseña: compra muebles
   del catálogo (con su precio en el libro contable), los mueve, los gira y cambia el estilo. Todo se guarda plano.
   ===================================================================== */
const TIPO_VIA = [[/^(avenida\s+calle|av\.?\s*calle|ac)\b/, 'Calle'], [/^(avenida\s+carrera|av\.?\s*carrera|ak)\b/, 'Carrera'], [/^(calle|cll?e?|cl)\b\.?/, 'Calle'], [/^(carrera|cra|crr|kra|kr|cr|k)\b\.?/, 'Carrera'],
  [/^(diagonal|dg|diag)\b\.?/, 'Diagonal'], [/^(transversal|tv|tr|trans|transv)\b\.?/, 'Transversal'], [/^(circular|cq|circ|cir)\b\.?/, 'Circular'], [/^(avenida|av)\b\.?/, 'Avenida']];
const CRUCE_DE = { Calle: ['Carrera', 'Transversal', 'Avenida'], Diagonal: ['Carrera', 'Transversal'], Carrera: ['Calle', 'Diagonal', 'Avenida'], Transversal: ['Calle', 'Diagonal'], Circular: ['Carrera', 'Calle'], Avenida: ['Calle', 'Carrera'] };
const normVia = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const Direccion = {
  /* «Calle 31 # 28-15» → { tipo: 'Calle', num: '31', cruce: '28', metros: 15, sur, complemento } */
  leer(texto) {
    let t = normVia(texto).replace(/n[°º]|numero|no\.?(?=\s*\d)/g, '#'); let tipo = null;
    for (const [re, T] of TIPO_VIA) { const m = t.match(re); if (m) { tipo = T; t = t.slice(m[0].length).trim(); break; } }
    if (!tipo) return null;
    const num = '(\\d+)\\s*([a-z]{1,2}(?![a-z]))?\\s*(bis)?\\s*([a-z](?![a-z]))?\\s*(sur|este|norte|oeste)?', re = new RegExp('^' + num + '\\s*(?:#|\\s)\\s*' + num + '\\s*(?:-|\\s)\\s*(\\d+)\\s*(.*)$'), m = t.match(re);
    if (!m) { const m2 = t.match(new RegExp('^' + num)); if (!m2) return null; return { tipo, num: m2[1] + (m2[2] || '').toUpperCase(), sur: m2[5] === 'sur', este: m2[5] === 'este', cruce: null, metros: null, complemento: '' }; }
    return { tipo, num: m[1] + (m[2] || '').toUpperCase(), sur: m[5] === 'sur' || m[10] === 'sur', este: m[5] === 'este' || m[10] === 'este', cruce: m[6] + (m[7] || '').toUpperCase(), cruceSur: m[10] === 'sur', metros: +m[11], complemento: (m[12] || '').trim() };
  },
  /* nombre de la vía como lo trae el mapa: 'Calle 56 Sur', 'Carrera 51A' */
  nombre(tipo, num, sur) { return tipo + ' ' + num + (sur ? ' Sur' : ''); },
  /* todas las vías del mapa con ese nombre (índice por nombre normalizado, se arma una vez por mundo) */
  vias(mundo, nombre) {
    if (!mundo._indiceNombres) { const I = new Map(); for (const v of mundo.vias()) { for (const n of [v.nombre, v.nom]) { if (!n) continue; const k = normVia(n).replace(/\s/g, ''); if (!I.has(k)) I.set(k, []); const L = I.get(k); if (!L.includes(v)) L.push(v); } } mundo._indiceNombres = I; }
    return mundo._indiceNombres.get(normVia(nombre).replace(/\s/g, '')) || [];
  },
  /* el punto más cercano entre dos grupos de vías (su cruce) */
  /* cruce de dos grupos de vías; cada municipio del valle tiene su propia cuadrícula (hay una «Calle 50 con Carrera 52»
     en Medellín y otra en Copacabana): con pista (el nombre del municipio o del barrio en el texto) se elige el correcto */
  cruce(A, B, max = 35, mundo = null, pista = '') {
    const todos = [], caja = v => v._caja || (v._caja = (() => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < v.p.length; i += 2) { x0 = Math.min(x0, v.p[i]); x1 = Math.max(x1, v.p[i]); y0 = Math.min(y0, v.p[i + 1]); y1 = Math.max(y1, v.p[i + 1]); } return [x0, y0, x1, y1]; })());
    const dps = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9, t = clamp(((px - ax) * dx + (py - ay) * dy) / L2, 0, 1), x = ax + dx * t, y = ay + dy * t; return [Math.hypot(px - x, py - y), x, y]; };
    for (const a of A) { const P = a.p, ca = caja(a); for (const b of B) { const Q = b.p, cb = caja(b); if (ca[0] > cb[2] + max || cb[0] > ca[2] + max || ca[1] > cb[3] + max || cb[1] > ca[3] + max) continue; let best = null;
      for (let i = 0; i + 3 < P.length; i += 2) for (let j = 0; j + 3 < Q.length; j += 2) {
        const x1 = P[i], y1 = P[i + 1], x2 = P[i + 2], y2 = P[i + 3], x3 = Q[j], y3 = Q[j + 1], x4 = Q[j + 2], y4 = Q[j + 3], den = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
        let r = null; if (Math.abs(den) > 1e-9) { const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / den, u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / den; if (t >= 0 && t <= 1 && u >= 0 && u <= 1) r = [0, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]; }
        if (!r) for (const q of [dps(x1, y1, x3, y3, x4, y4), dps(x2, y2, x3, y3, x4, y4), dps(x3, y3, x1, y1, x2, y2), dps(x4, y4, x1, y1, x2, y2)]) if (!r || q[0] < r[0]) r = q;
        if (r[0] < max && (!best || r[0] < best.d)) best = { x: r[1], y: r[2], d: r[0], via: a };
      }
      if (best) todos.push(best); } }
    if (!todos.length) return null; if (!mundo) return todos.sort((p, q) => p.d - q.d)[0];
    const pts = q => { const mu = normVia(mundo.municipio(q.x, q.y)), ba = normVia(mundo.barrio ? mundo.barrio(q.x, q.y) : ''), pi = normVia(pista); let s = -q.d; if (pi && mu && pi.includes(mu)) s += 1000; if (pi && ba && ba.length > 3 && pi.includes(ba)) s += 500; const ppal = normVia(mundo.cfg && mundo.cfg.nombre || ''); if (mu && ppal.startsWith(mu)) s += 100; return s; };
    return todos.sort((p, q) => pts(q) - pts(p))[0];
  },
  /* el rumbo de la vía principal en el punto (para medir los metros sobre ella) */
  _rumbo(vias, x, y) { let best = null; for (const v of vias) { const T = v._T || (v._T = new Trazo(v.p instanceof Float32Array ? v.p : Float32Array.from(Object.values(v.p)))), pr = T.proyectar(x, y); if (!best || pr.d < best.d) best = { d: pr.d, T, s: pr.s }; } return best; },
  /* ubica una dirección en el mundo: { ok, calidad, x, y, edificio, texto, leida } */
  ubicar(mundo, texto) {
    const D = Direccion.leer(texto), res = { ok: false, calidad: 'ninguna', leida: D, texto };
    const fallback = () => { const q = mundo.buscar && mundo.buscar(texto); if (q) Object.assign(res, { ok: true, calidad: 'lugar', x: q.x, y: q.y, edificio: Direccion.edificioCerca(mundo, q.x, q.y, 60) }); return res; };
    if (!D) return fallback();
    const tipos = D.tipo === 'Avenida' ? ['Avenida', 'Calle', 'Carrera'] : [D.tipo]; let prin = []; for (const T of tipos) { prin = Direccion.vias(mundo, Direccion.nombre(T, D.num, D.sur)); if (prin.length) break; }
    if (!prin.length && D.cruce) { for (const T of CRUCE_DE[D.tipo] || []) { const C = Direccion.vias(mundo, Direccion.nombre(T, D.cruce, D.cruceSur)); if (C.length) { const p = C[0].p, k = ((p.length >> 2) << 1); Object.assign(res, { ok: true, calidad: 'calle', x: p[k], y: p[k + 1] }); res.edificio = Direccion.edificioCerca(mundo, res.x, res.y, 40); return res; } } }
    if (!prin.length) return fallback();
    const conCruce = tipo => Direccion.vias(mundo, Direccion.nombre(tipo, D.cruce, D.cruceSur));
    let I = null, tipoC = null; if (D.cruce) for (const T of CRUCE_DE[D.tipo] || ['Carrera', 'Calle']) { const C = conCruce(T); if (C.length) { I = Direccion.cruce(prin, C, 35, mundo, texto); if (I) { tipoC = T; break; } } }
    if (!I) { const v = prin[Math.floor(prin.length / 2)], p = v.p, n = (p.length >> 1), k = (n >> 1) * 2; Object.assign(res, { ok: true, calidad: 'calle', x: p[k], y: p[k + 1] }); res.edificio = Direccion.edificioCerca(mundo, res.x, res.y, 40); return res; }
    /* hacia dónde crece la numeración: el cruce con el número siguiente (o el anterior, al revés) */
    const n = parseInt(D.cruce, 10), R = Direccion._rumbo(prin, I.x, I.y); let dir = 0;
    for (const [k, sg] of [[n + 1, 1], [n - 1, -1], [n + 2, 1], [n - 2, -1]]) { const C = Direccion.vias(mundo, Direccion.nombre(tipoC, String(k), D.cruceSur)); const J = C.length && Direccion.cruce(prin, C, 40, mundo, mundo.municipio(I.x, I.y)); if (J) { const pj = R.T.proyectar(J.x, J.y); dir = Math.sign(pj.s - R.s) * sg; if (dir) break; } }
    if (!dir) dir = 1;
    const s = clamp(R.s + dir * (D.metros || 0), 0, R.T.largo), q = R.T.at(s), nx = -Math.sin(q.a), ny = Math.cos(q.a);
    /* lado de la placa: pares a la derecha del sentido creciente e impares a la izquierda (si no hay edificio, el otro) */
    const lado = (D.metros || 0) % 2 === 0 ? 1 : -1, ladoReal = lado * dir, ancho = (R.T && prin[0].ancho) || 8;
    let ed = null; for (const sg of [ladoReal, -ladoReal]) { const x = q.x + nx * sg * (ancho / 2 + 6), y = q.y + ny * sg * (ancho / 2 + 6); ed = Direccion.edificioCerca(mundo, x, y, 18); if (ed) break; }
    Object.assign(res, { ok: true, calidad: 'exacta', x: ed ? ed.x : q.x, y: ed ? ed.y : q.y, edificio: ed, cruce: { x: I.x, y: I.y, via: tipoC + ' ' + D.cruce }, enVia: { x: q.x, y: q.y } });
    return res;
  },
  edificioCerca(mundo, x, y, r) { let best = null, bd = 1e9; for (const e of mundo.edificiosEn(x - r, y - r, x + r, y + r)) { const d = Math.hypot(e.x - x, e.y - y); if (d < bd) { bd = d; best = e; } } return best; }
};

class Hogar {
  constructor(mundo, d = {}) { this.mundo = mundo; this.d = Object.assign({ nombre: 'Mi casa', x: 0, y: 0, estilo: null, muebles: null, guardaDireccion: false, direccion: '', comprados: [] }, d); this._plano = null; }
  /* desde una dirección real; guardaDireccion = false (por defecto) no guarda el texto, solo el punto */
  static desdeDireccion(mundo, texto, op = {}) {
    const U = Direccion.ubicar(mundo, texto); if (!U.ok) return { ok: false, ubicacion: U };
    const e = U.edificio || Direccion.edificioCerca(mundo, U.x, U.y, 80); const H = new Hogar(mundo, { x: e ? e.x : U.x, y: e ? e.y : U.y, guardaDireccion: !!op.guardaDireccion, direccion: op.guardaDireccion ? texto : '', semilla: hashTxt(normVia(texto)) });
    return { ok: true, hogar: H, ubicacion: U };
  }
  get edificio() { return this.mundo.edificioEn(this.d.x, this.d.y, 1) || Direccion.edificioCerca(this.mundo, this.d.x, this.d.y, 30); }
  /* el plano: generado del edificio real y con lo que el jugador haya cambiado */
  plano() {
    if (this._plano) return this._plano; const e = this.edificio || { hw: 4, hd: 5, s: .5, pis: 2 };
    const prog = e.pis > 3 || e.clase === 'edificio' || e.clase === 'torre' ? 'apartamento' : 'casa', P = Interiores.generar(e, { semilla: (this.d.semilla >>> 0) || undefined, estilo: this.d.estilo, programa: prog });
    if (this.d.muebles) P.muebles = this.d.muebles.map(m => Object.assign({}, m)); this._plano = P; return P;
  }
  /* diseño de interiores */
  estilo(id) { this.d.estilo = id; const mueblesUsuario = this.d.muebles; this._plano = null; this.d.muebles = null; const P = this.plano(); if (mueblesUsuario) { P.muebles = mueblesUsuario.filter(m => !m.deco).concat(P.muebles.filter(m => m.deco)); this.d.muebles = P.muebles.map(m => Object.assign({}, m)); } return P; }
  comprar(id, libro, cuenta = 'jugador', caja = 'tienda') {
    const it = Interiores.CATALOGO.find(q => q.id === id); if (!it) return { ok: false, motivo: 'no existe' };
    if (libro && !libro.mover(cuenta, caja, it.precio, 'Mueble: ' + it.n)) return { ok: false, motivo: 'no alcanza la plata' };
    this.d.comprados.push(id); return { ok: true, item: it };
  }
  /* pone un mueble comprado en (x, y) del plano (metros), girado o no; devuelve si cupo */
  poner(id, x, y, girado = false) {
    const it = Interiores.CATALOGO.find(q => q.id === id), i = this.d.comprados.indexOf(id); if (!it || i < 0) return false; const P = this.plano();
    const m = { tipo: id, x, y, w: girado ? it.h : it.w, h: girado ? it.w : it.h, usuario: true }; if (!Interiores.cabe(P, m, id === 'tapete' || id === 'cuadro')) return false;
    this.d.comprados.splice(i, 1); if (id === 'tapete') P.muebles.unshift(m); else P.muebles.push(m); this._guardarMuebles(); return true;
  }
  mover(i, x, y) { const P = this.plano(), m = P.muebles[i]; if (!m) return false; const o = { x: m.x, y: m.y }; m.x = x; m.y = y; if (!Interiores.cabe(P, m, m.tipo === 'tapete' || m.tipo === 'cuadro')) { Object.assign(m, o); return false; } this._guardarMuebles(); return true; }
  girar(i) { const P = this.plano(), m = P.muebles[i]; if (!m) return false; [m.w, m.h] = [m.h, m.w]; if (!Interiores.cabe(P, m, m.tipo === 'tapete')) { [m.w, m.h] = [m.h, m.w]; return false; } this._guardarMuebles(); return true; }
  quitar(i) { const P = this.plano(), m = P.muebles[i]; if (!m) return false; P.muebles.splice(i, 1); if (Interiores.CATALOGO.some(q => q.id === m.tipo)) this.d.comprados.push(m.tipo); this._guardarMuebles(); return true; }
  muebleEn(x, y) { const P = this.plano(); for (let i = P.muebles.length - 1; i >= 0; i--) { const m = P.muebles[i]; if (x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) return i; } return -1; }
  _guardarMuebles() { this.d.muebles = this.plano().muebles.map(m => ({ tipo: m.tipo, x: +m.x.toFixed(2), y: +m.y.toFixed(2), w: m.w, h: m.h, cuarto: m.cuarto, deco: m.deco, usuario: m.usuario })); }
  /* lo que se guarda (plano y sin datos personales si el jugador no quiso guardar la dirección) */
  /* el ambiente de la casa (0–100), como el «room» de Los Sims: decorar sube el ánimo de quien vive aquí */
  ambiente() { return MC.Necesidades ? MC.Necesidades.ambiente(this.plano()) : 50; }
  guardar() { const o = Object.assign({}, this.d); if (!o.guardaDireccion) delete o.direccion; return JSON.parse(JSON.stringify(o)); }
}
Object.assign(MC, { Direccion, Hogar });

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
      C.v = 0; C.z = 0; C.enAire = false; C.paso = null; C.zPaso = 0; hud.replaceChildren(); capa.hidden = true;
      const r = { metros, puntos: Math.round(g.score), monedas: g.coinsRun, saltos: g.jumps, trucos: g.tricks, calle: M.calle(C.x, C.y), x: C.x, y: C.y };
      MC.emit('run', Object.assign({ entra: false }, r)); if (op.alSalir) op.alSalir(r);
    };
    this.salir = salir; return { g, seguir, salir };
  }
};
MC.Run = Run;

/* ---- js/60-musica.js ---- */
/* =====================================================================
   MÚSICA PROCEDURAL · electrónica, techno, synthwave, rock, jazz y lo‑fi, más clásicos de dominio público adaptados
   - COMPOSITOR (puro y determinista, se prueba en Node): armonía por estilo (progresiones reales: I‑V‑vi‑IV, ii‑V‑I…),
     bajo (contratiempo electrónico, corcheas de rock, walking bass de jazz, notas largas de lo‑fi), batería por patrón
     de 16 pasos, voces de acordes (power chords, séptimas, novenas) y melodía.
   - CLÁSICOS (obras de dominio público, transcripción propia): Himno a la alegría y Para Elisa (Beethoven), Minueto en
     Sol (Petzold, del cuaderno de Ana Magdalena Bach), Canon (Pachelbel), Gimnopedia n.º 1 (Satie), En la gruta del
     rey de la montaña (Grieg) y La primavera (Vivaldi). El arreglista los reharmoniza y los lleva a cada estilo.
   - SINTETIZADOR (WebAudio, sin muestras ni internet): piano, pad, lead, bajo, guitarra distorsionada, órgano,
     batería sintetizada; lo‑fi con filtro, polvo de vinilo y vaivén; electrónica con «sidechain».
   - ADAPTATIVO: MC.Musica.adaptar({ velocidad, hora, clima, tension }) cambia estilo y energía según el juego.
   ===================================================================== */
const NOTA = n => { const m = n.match(/^([A-G])(#|b)?(-?\d)$/); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
const ESCALA = { mayor: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 10], dorica: [0, 2, 3, 5, 7, 9, 10], mixolidia: [0, 2, 4, 5, 7, 9, 10], pentatonica: [0, 3, 5, 7, 10], blues: [0, 3, 5, 6, 7, 10] };
/* clásicos: [nota MIDI | null (silencio), duración en tiempos] en compás 4/4 salvo que diga otra cosa */
const CLASICOS = {
  himno_alegria: { n: 'Himno a la alegría', autor: 'L. van Beethoven (1824)', tono: 60, modo: 'mayor', notas: [[64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, .5], [62, 2], [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [62, 1.5], [60, .5], [60, 2]] },
  para_elisa: { n: 'Para Elisa', autor: 'L. van Beethoven (1810)', tono: 57, modo: 'menor', notas: [[76, .5], [75, .5], [76, .5], [75, .5], [76, .5], [71, .5], [74, .5], [72, .5], [69, 1.5], [60, .5], [64, .5], [69, .5], [71, 1.5], [64, .5], [68, .5], [71, .5], [72, 1.5], [64, .5], [76, .5], [75, .5], [76, .5], [75, .5], [76, .5], [71, .5], [74, .5], [72, .5], [69, 1.5], [60, .5], [64, .5], [69, .5], [71, 1.5], [64, .5], [72, .5], [71, .5], [69, 2]] },
  minueto_sol: { n: 'Minueto en Sol', autor: 'C. Petzold (c. 1725)', tono: 55, modo: 'mayor', notas: [[74, 1], [67, .5], [69, .5], [71, .5], [72, .5], [74, 1], [67, 1], [67, 1], [76, 1], [72, .5], [74, .5], [76, .5], [78, .5], [79, 1], [67, 1], [67, 1], [72, 1], [74, .5], [72, .5], [71, .5], [69, .5], [71, 1], [72, .5], [71, .5], [69, .5], [67, .5], [66, 1], [67, .5], [69, .5], [71, .5], [67, .5], [69, 3]] },
  canon: { n: 'Canon', autor: 'J. Pachelbel (c. 1680)', tono: 62, modo: 'mayor', grados: [0, 4, 5, 2, 3, 0, 3, 4], notas: [[78, 2], [76, 2], [74, 2], [73, 2], [71, 2], [69, 2], [71, 2], [73, 2]] },
  gimnopedia: { n: 'Gimnopedia n.º 1', autor: 'E. Satie (1888)', tono: 62, modo: 'mayor', metro: 3, grados: [3, 0], notas: [[null, 3], [null, 3], [78, 1], [81, 1], [79, 1], [78, 1], [73, 1], [71, 1], [73, 1], [74, 1], [69, 3], [66, 3]] },
  rey_montana: { n: 'En la gruta del rey de la montaña', autor: 'E. Grieg (1875)', tono: 59, modo: 'menor', notas: [[71, .5], [73, .5], [74, .5], [76, .5], [78, .5], [74, .5], [78, 1], [77, .5], [73, .5], [77, 1], [76, .5], [72, .5], [76, 1], [71, .5], [73, .5], [74, .5], [76, .5], [78, .5], [74, .5], [78, .5], [83, .5], [81, .5], [78, .5], [74, .5], [78, .5], [81, 2]] },
  primavera: { n: 'La primavera', autor: 'A. Vivaldi (1725)', tono: 64, modo: 'mayor', notas: [[64, .5], [68, .5], [68, .5], [68, .5], [66, .25], [64, .25], [71, 1.5], [71, .25], [69, .25], [68, .5], [68, .5], [68, .5], [66, .25], [64, .25], [71, 1.5], [71, .25], [69, .25], [68, .5], [69, .25], [71, .25], [69, .5], [68, .5], [66, 2]] }
};
const ESTILOS = {
  electronica: { bpm: 124, swing: 0, modo: 'menor', prog: [[0, 'm7'], [5, 'maj7'], [3, 'maj7'], [4, '7']], bateria: { bombo: 'x...x...x...x...', caja: '....x.......x...', plato: '..x...x...x...x.', abierto: '' }, bajo: 'contra', acordes: 'pad', lead: 'lead', sidechain: true },
  techno: { bpm: 132, swing: 0, modo: 'menor', prog: [[0, 'm'], [0, 'm'], [6, 'maj'], [5, 'maj']], bateria: { bombo: 'x...x...x...x...', caja: '....x.......x...', plato: 'xxxxxxxxxxxxxxxx', abierto: '..x...x...x...x.' }, bajo: 'pulso', acordes: 'stab', lead: 'lead', sidechain: true },
  synthwave: { bpm: 100, swing: 0, modo: 'menor', prog: [[0, 'm'], [5, 'maj'], [2, 'maj'], [6, 'maj']], bateria: { bombo: 'x.......x.......', caja: '....x.......x...', plato: 'x.x.x.x.x.x.x.x.', abierto: '' }, bajo: 'octavas', acordes: 'pad', lead: 'lead' },
  rock: { bpm: 140, swing: 0, modo: 'mayor', prog: [[0, '5'], [4, '5'], [5, '5'], [3, '5']], bateria: { bombo: 'x.....x.x.......', caja: '....x.......x...', plato: 'x.x.x.x.x.x.x.x.', abierto: '' }, bajo: 'corcheas', acordes: 'guitarra', lead: 'guitarra_lead' },
  jazz: { bpm: 118, swing: .62, modo: 'mayor', prog: [[1, 'm7'], [4, '7'], [0, 'maj7'], [5, '7']], bateria: { bombo: 'x.........x.....', caja: '......x.......x.', plato: 'x..xx..xx..xx..x', abierto: '' }, bajo: 'walking', acordes: 'piano', lead: 'piano' },
  lofi: { bpm: 78, swing: .58, modo: 'mayor', prog: [[3, 'maj7'], [2, 'm7'], [1, 'm7'], [4, '7']], bateria: { bombo: 'x.....x...x.....', caja: '....x.......x...', plato: 'x.x.x.x.x.x.x.x.', abierto: '' }, bajo: 'largo', acordes: 'piano', lead: 'piano', lofi: true },
  clasica: { bpm: 84, swing: 0, modo: 'mayor', prog: [[0, 'maj'], [3, 'maj'], [4, 'maj'], [0, 'maj']], bateria: null, bajo: 'largo', acordes: 'cuerdas', lead: 'piano' }
};
const ACORDE = { maj: [0, 4, 7], m: [0, 3, 7], '5': [0, 7, 12], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], m7b5: [0, 3, 6, 10], sus: [0, 5, 7] };
const Musica = {
  NOTA, ESCALA, CLASICOS, ESTILOS, ACORDE,
  /* acorde diatónico del grado (0..6) en la tonalidad: tríada o séptima según el modo */
  diatonico(tono, modo, grado, tipo) { const E = ESCALA[modo] || ESCALA.mayor, raiz = tono + E[grado % 7] + 12 * Math.floor(grado / 7); if (tipo) return { raiz, tipo }; const t = [0, 2, 4].map(i => E[(grado + i) % 7] + 12 * Math.floor((grado + i) / 7) - E[grado % 7]); return { raiz, tipo: t[1] === 3 && t[2] === 6 ? 'm7b5' : t[1] === 3 ? 'm' : 'maj' }; },
  /* armoniza un tema: por compás, el acorde diatónico que más notas del compás contiene */
  armonizar(tema, metro = 4) {
    if (tema.grados) return tema.grados.map(g => Musica.diatonico(tema.tono, tema.modo, g));
    const comp = [], E = ESCALA[tema.modo]; let t = 0, c = [];
    for (const [n, d] of tema.notas) { if (n != null) c.push(n); t += d; while (t >= metro - 1e-6) { comp.push(c); c = []; t -= metro; } }
    if (c.length) comp.push(c);
    return comp.map((notas, i) => { let best = 0, bv = -1; for (let gr = 0; gr < 7; gr++) { const A = Musica.diatonico(tema.tono, tema.modo, gr), set = ACORDE[A.tipo].map(x => (A.raiz + x) % 12), v = notas.filter(n => set.includes(n % 12)).length + (gr === 0 || gr === 4 ? .5 : 0) + (i === comp.length - 1 && gr === 0 ? 2 : 0); if (v > bv) { bv = v; best = gr; } } return Musica.diatonico(tema.tono, tema.modo, best); });
  },
  /* COMPONE: { estilo, tema (id de CLASICOS o null), compases, energia (0–1), semilla, tono } → { bpm, swing, eventos: [{ t, d, n, inst, v }] } (t y d en tiempos) */
  componer(op = {}) {
    const S = ESTILOS[op.estilo] || ESTILOS.electronica, r = mulberry32(op.semilla ?? 5), en = clamp(op.energia ?? .6, 0, 1), T = op.tema ? CLASICOS[op.tema] : null, metro = (T && T.metro) || 4;
    const tono = op.tono ?? (T ? T.tono : 57 + ((op.semilla ?? 5) % 7)), modo = T ? T.modo : S.modo;
    const acordes = T ? Musica.armonizar(T, metro) : S.prog.map(([g, tipo]) => Musica.diatonico(tono, modo, g, tipo)), compases = op.compases || Math.max(8, acordes.length * 2), ev = [];
    const pon = (t, d, n, inst, v) => { if (n == null || n < 24 || n > 108) return; ev.push({ t, d, n, inst, v: clamp(v, 0, 1) }); };
    for (let c = 0; c < compases; c++) {
      const A = acordes[c % acordes.length], base = c * metro, raiz = A.raiz % 12 + 36, voz = ACORDE[op.estilo === 'rock' ? '5' : A.tipo] || ACORDE.maj;
      /* acordes */
      if (S.acordes === 'pad' || S.acordes === 'cuerdas') for (const x of voz) pon(base, metro, A.raiz % 12 + 60 + x, S.acordes, .35 + en * .2);
      else if (S.acordes === 'stab') for (let s = 0; s < 4; s++) if (s % 2 || en > .5) for (const x of voz) pon(base + s + .5, .25, A.raiz % 12 + 60 + x, 'stab', .4);
      else if (S.acordes === 'guitarra') for (let s = 0; s < metro * 2; s++) for (const x of [0, 7, 12]) pon(base + s / 2, .45, raiz + 12 + x, 'guitarra', .5 + (s % 2 ? 0 : .15));
      else if (S.acordes === 'piano') { const ritmo = op.estilo === 'jazz' ? [0, 1.5, 2.5] : [0, 2.5]; for (const s of ritmo) for (const x of voz.concat(A.tipo.includes('7') ? [14] : [])) pon(base + s, op.estilo === 'lofi' ? 1.8 : .9, A.raiz % 12 + 60 + x, 'piano', .3 + en * .15); }
      /* bajo */
      const B = S.bajo;
      if (B === 'contra') for (let s = 0; s < 4; s++) pon(base + s + .5, .45, raiz, 'bajo', .7);
      else if (B === 'pulso') for (let s = 0; s < 16; s++) if (s % 4 !== 0) pon(base + s / 4, .2, raiz, 'bajo', .6);
      else if (B === 'octavas') for (let s = 0; s < 8; s++) pon(base + s / 2, .45, raiz + (s % 2 ? 12 : 0), 'bajo', .6);
      else if (B === 'corcheas') for (let s = 0; s < 8; s++) pon(base + s / 2, .45, raiz, 'bajo', .7);
      else if (B === 'walking') { const sig = acordes[(c + 1) % acordes.length].raiz % 12 + 36, E2 = ESCALA[modo]; for (let s = 0; s < metro; s++) { const n = s === 0 ? raiz : s === metro - 1 ? sig + (r() < .5 ? -1 : 1) : raiz + E2[(s * 2 + (r() * 2 | 0)) % E2.length]; pon(base + s, .9, n, 'bajo', .6); } }
      else pon(base, metro * .95, raiz, 'bajo', .55);
      /* batería (16 pasos por compás de 4; en 3/4, 12) */
      if (S.bateria && !(T && op.estilo === 'clasica')) { const pasos = metro * 4; for (const [pz, pat] of Object.entries(S.bateria)) for (let s = 0; s < pasos; s++) { if (pat[s % pat.length] !== 'x') continue; if (pz === 'plato' && en < .25 && s % 2) continue; if (pz === 'caja' && c % 8 === 7 && s > pasos - 4) continue; pon(base + s / 4, .1, { bombo: 36, caja: 38, plato: 42, abierto: 46 }[pz], pz, pz === 'bombo' ? .9 : .5 + r() * .15); } if (c % 8 === 7) for (let s = pasos - 4; s < pasos; s++) pon(base + s / 4, .1, 38, 'caja', .45 + s * .02); }
    }
    /* melodía: el tema clásico (repetido) o una melodía generada sobre la escala con motivos que se repiten */
    if (T) { const largo = T.notas.reduce((a, q) => a + q[1], 0), vueltas = Math.max(1, Math.floor(compases * metro / largo)); for (let k = 0; k < vueltas; k++) { let t = k * largo; for (const [n, d] of T.notas) { const nn = n == null ? null : n + (op.estilo === 'rock' || op.estilo === 'electronica' || op.estilo === 'techno' ? 0 : 0) + (tono - T.tono); pon(t, d * .92, nn, S.lead, .6 + en * .2); t += d; } } }
    else { const E2 = ESCALA[S.modo === 'menor' ? 'pentatonica' : 'mayor'], motivo = []; for (let i = 0; i < 8; i++) motivo.push([E2[(r() * E2.length) | 0] + (r() < .3 ? 12 : 0), r() < .3 ? 1 : .5]); for (let c = 0; c < compases; c++) { if (en < .35 && c % 2) continue; let t = c * metro; const var2 = c % 4 === 3; for (const [g, d] of motivo) { if (t >= (c + 1) * metro) break; if (r() < .25 + (1 - en) * .3) { t += d; continue; } pon(t, d * .9, tono + 12 + g + (var2 ? 2 : 0), S.lead, .55 + en * .2); t += d; } } }
    return { bpm: Math.round(S.bpm * (op.tempo || 1) * (T && op.estilo === 'clasica' ? .85 : 1)), swing: S.swing, lofi: !!S.lofi, sidechain: !!S.sidechain, metro, compases, eventos: ev.sort((a, b) => a.t - b.t), titulo: (T ? T.n + ' · ' : '') + op.estilo };
  },
  /* elige estilo y energía según el juego */
  adaptar({ velocidad = 0, hora = 12, clima = null, tension = 0, zona = '' } = {}) {
    const noche = hora < 6 || hora >= 20, lluvia = clima && clima.lluvia > .2, v = velocidad * 3.6;
    let estilo = tension > .6 ? (v > 60 ? 'techno' : 'rock') : v > 70 ? 'electronica' : v > 30 ? (noche ? 'synthwave' : 'electronica') : lluvia ? 'jazz' : noche ? 'lofi' : zona === 'centro' ? 'jazz' : 'lofi';
    return { estilo, energia: clamp(.25 + v / 120 + tension * .5, 0, 1) };
  },
  /* ---------- sintetizador (navegador) ---------- */
  ctx: null, sonando: null,
  _ctx() { if (!this.ctx) { const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext); if (!AC) return null; this.ctx = new AC(); this.salida = this.ctx.createGain(); this.salida.gain.value = .5; this.salida.connect(this.ctx.destination); } if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  volumen(v) { if (this.salida) this.salida.gain.value = clamp(v, 0, 1); },
  /* toca una pieza compuesta en bucle; devuelve { parar } */
  tocar(op = {}) {
    const ac = this._ctx(); if (!ac) return null; this.parar(); const P = op.eventos ? op : Musica.componer(op), spb = 60 / P.bpm, largo = P.compases * P.metro, bus = ac.createGain(), filtro = ac.createBiquadFilter();
    filtro.type = 'lowpass'; filtro.frequency.value = P.lofi ? 2600 : 18000; bus.connect(filtro); filtro.connect(this.salida); let ruido = null;
    if (P.lofi) { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() < .0008 ? (Math.random() - .5) * .8 : (Math.random() - .5) * .015; ruido = ac.createBufferSource(); ruido.buffer = b; ruido.loop = true; const gr = ac.createGain(); gr.gain.value = .5; ruido.connect(gr); gr.connect(this.salida); ruido.start(); }
    const t0 = ac.currentTime + .1, est = { P, bus, filtro, ruido, vuelta: 0, idx: 0, t0, activo: true };
    const tiempo = t => { const b = Math.floor(t * 2) / 2, f = t * 2 - Math.floor(t * 2); return (b + (f >= .5 - 1e-6 && P.swing ? (P.swing - .5) * 1 + .5 : f) / 2) * spb; };
    const programar = () => { if (!est.activo) return; const ahora = ac.currentTime, hasta = ahora + .25;
      while (true) { const e = P.eventos[est.idx]; if (!e) { est.idx = 0; est.vuelta++; continue; } const tt = t0 + est.vuelta * largo * spb + (P.swing ? tiempo(e.t) : e.t * spb); if (tt > hasta) break; if (tt >= ahora - .05) this._nota(ac, bus, e, tt, e.d * spb, P); est.idx++; if (est.idx >= P.eventos.length) { est.idx = 0; est.vuelta++; } }
      est.timer = setTimeout(programar, 90); };
    programar(); this.sonando = est; MC.emit('musica', { titulo: P.titulo });
    return { parar: () => this.parar(), pieza: P };
  },
  parar() { const s = this.sonando; if (!s) return; s.activo = false; clearTimeout(s.timer); try { s.bus.disconnect(); if (s.ruido) s.ruido.stop(); } catch (e) { /* ya estaba */ } this.sonando = null; },
  _nota(ac, bus, e, t, d, P) {
    const hz = 440 * Math.pow(2, (e.n - 69) / 12), g = ac.createGain(), v = e.v * .5; g.connect(bus);
    const env = (a, dec, sus, rel) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.linearRampToValueAtTime(v * sus, t + a + dec); g.gain.setValueAtTime(v * sus, t + Math.max(a + dec, d)); g.gain.linearRampToValueAtTime(0, t + Math.max(a + dec, d) + rel); };
    const osc = (tipo, f, det = 0) => { const o = ac.createOscillator(); o.type = tipo; o.frequency.value = f; o.detune.value = det; o.start(t); o.stop(t + d + .6); return o; };
    const ruido = () => { const b = ac.createBuffer(1, ac.sampleRate * .3, ac.sampleRate), x = b.getChannelData(0); for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; s.start(t); return s; };
    switch (e.inst) {
      case 'bombo': { const o = osc('sine', 150); o.frequency.exponentialRampToValueAtTime(42, t + .12); o.connect(g); g.gain.setValueAtTime(v * 1.6, t); g.gain.exponentialRampToValueAtTime(.001, t + .35); if (P.sidechain && bus.gain) { bus.gain.setValueAtTime(.35, t); bus.gain.linearRampToValueAtTime(1, t + .22); } break; }
      case 'caja': { const s = ruido(), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; s.connect(f); f.connect(g); const o = osc('triangle', 190); o.connect(g); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); break; }
      case 'plato': case 'abierto': { const s = ruido(), f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; s.connect(f); f.connect(g); g.gain.setValueAtTime(v * .35, t); g.gain.exponentialRampToValueAtTime(.001, t + (e.inst === 'abierto' ? .3 : .05)); break; }
      case 'bajo': { const o = osc(P.lofi ? 'sine' : 'sawtooth', hz), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; o.connect(f); f.connect(g); env(.005, .1, .7, .08); break; }
      case 'guitarra': case 'guitarra_lead': { const ws = ac.createWaveShaper(), cv = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; cv[i] = Math.tanh(x * 6); } ws.curve = cv; const o = osc('sawtooth', hz), o2 = osc('sawtooth', hz, 9), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3200; o.connect(ws); o2.connect(ws); ws.connect(f); f.connect(g); env(.005, .15, .6, .1); break; }
      case 'piano': { const o = osc('triangle', hz), o2 = osc('sine', hz * 2); const g2 = ac.createGain(); g2.gain.value = .25; o2.connect(g2); g2.connect(g); o.connect(g); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(v * .25, t + .4); g.gain.exponentialRampToValueAtTime(.001, t + d + .5); break; }
      case 'pad': case 'cuerdas': { for (const det of [-8, 0, 8]) osc('sawtooth', hz, det).connect((() => { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = e.inst === 'cuerdas' ? 2400 : 1400; f.connect(g); return f; })()); env(e.inst === 'cuerdas' ? .25 : .4, .3, .7, .6); g.gain.value = 0; break; }
      case 'stab': { osc('square', hz).connect(g); env(.003, .08, .2, .05); break; }
      default: { const o = osc('square', hz), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2600; o.connect(f); f.connect(g); env(.01, .1, .6, .12); }
    }
  }
};
MC.Musica = Musica;

/* ---- js/61-sonido.js ---- */
/* =====================================================================
   PAISAJE SONORO · el ambiente que se oye (sin un solo archivo de audio)
   Como en Cities: Skylines y Los Sims, la ciudad suena según dónde y cuándo: zumbido de tráfico que crece con las
   avenidas y la hora pico, pájaros al amanecer, chicharras y grillos de noche, lluvia y truenos, viento en lo alto,
   agua cerca del embalse o del río, y gente en las plazas. Todo sintetizado con WebAudio (ruido filtrado y pulsos).
   - plan(ctx): PURO (se prueba en Node): qué capas suenan y con qué volumen.
   - tocar(ctx) / actualizar(ctx) / parar(): el sonido en el navegador (empieza con un toque del jugador).
   ===================================================================== */
const Paisaje = {
  /* ctx: { hora, clima, ruido (0–1, del lugar), agua (m al agua), verde (0–1), gente (0–1), altura (m), velocidad (m/s), adentro } */
  plan(c = {}) {
    const h = c.hora ?? 12, cl = c.clima || {}, dentro = c.adentro ? .35 : 1, pico = Math.exp(-((h - 7.5) ** 2) / 2) + Math.exp(-((h - 18) ** 2) / 2.5);
    const noche = h < 5.5 || h > 19.5 ? 1 : h < 6.5 ? (6.5 - h) : h > 18.5 ? (h - 18.5) : 0;
    const L = {
      trafico: clamp((c.ruido ?? .3) * (.45 + .55 * Math.min(1, pico)) * (1 - noche * .55), 0, 1) * dentro,
      pajaros: clamp((c.verde ?? .3) * (Math.exp(-((h - 6.3) ** 2) / 1.2) + .25 * (h > 6 && h < 17 ? 1 : 0)) * (1 - (cl.lluvia || 0)), 0, 1) * dentro,
      grillos: clamp(noche * (.4 + (c.verde ?? .3) * .6) * (1 - (cl.lluvia || 0) * .8), 0, 1) * dentro,
      lluvia: clamp((cl.lluvia || 0) * (c.adentro ? .55 : 1), 0, 1), truenos: clamp(cl.tormenta || 0, 0, 1),
      viento: clamp(((cl.viento && cl.viento.v) || 2) / 12 + Math.max(0, ((c.altura ?? 1500) - 2000) / 1500) + (c.velocidad || 0) / 30, 0, 1) * dentro,
      agua: clamp(1 - (c.agua ?? 1e4) / 120, 0, 1) * dentro, gente: clamp((c.gente ?? 0) * (1 - noche * .7), 0, 1) * dentro
    };
    for (const k in L) L[k] = +L[k].toFixed(3); return L;
  },
  _ac: null, _capas: null,
  tocar(c) {
    if (typeof window === 'undefined') return null; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    if (!this._ac) this._ac = new AC(); const ac = this._ac; if (ac.state === 'suspended') ac.resume();
    if (!this._capas) {
      const ruido = (tipo) => { const n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); let ult = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; ult = tipo === 'cafe' ? (ult + .02 * w) / 1.02 : w; d[i] = tipo === 'cafe' ? ult * 3.5 : w; } const s = ac.createBufferSource(); s.buffer = b; s.loop = true; s.start(); return s; };
      const capa = (fuente, tipo, f, q) => { const fl = ac.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = q || .7; const g = ac.createGain(); g.gain.value = 0; fuente.connect(fl).connect(g).connect(ac.destination); return { g, fl }; };
      this._capas = { trafico: capa(ruido('cafe'), 'lowpass', 380), lluvia: capa(ruido('blanco'), 'bandpass', 2600, .5), viento: capa(ruido('cafe'), 'bandpass', 520, .4), agua: capa(ruido('blanco'), 'bandpass', 900, 1.2), gente: capa(ruido('cafe'), 'bandpass', 700, 1.8) };
      this._pulsos = setInterval(() => this._eventos(), 180);
    }
    return this.actualizar(c);
  },
  actualizar(c) { if (!this._capas) return null; const L = this.plan(c), ac = this._ac, t = ac.currentTime, V = { trafico: .22, lluvia: .2, viento: .12, agua: .1, gente: .08 }; for (const k in this._capas) this._capas[k].g.gain.setTargetAtTime(L[k] * V[k], t, .8); this._L = L; return L; },
  /* pájaros (silbidos que suben), grillos (pulsos agudos) y truenos (ruido grave con caída) */
  _eventos() {
    const ac = this._ac, L = this._L; if (!ac || !L) return; const t = ac.currentTime;
    const tono = (f0, f1, dur, vol, tipo = 'sine') => { const o = ac.createOscillator(), g = ac.createGain(); o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + .05); };
    if (Math.random() < L.pajaros * .35) { const f = 2400 + Math.random() * 2400; tono(f, f * (1.2 + Math.random() * .5), .08 + Math.random() * .12, .025 * L.pajaros); }
    if (Math.random() < L.grillos * .6) for (let k = 0; k < 3; k++) setTimeout(() => tono(4300, 4250, .03, .012 * L.grillos, 'square'), k * 45);
    if (Math.random() < L.truenos * .01) tono(70, 35, 2.2, .25 * L.truenos, 'sawtooth');
  },
  parar() { if (this._pulsos) clearInterval(this._pulsos); this._pulsos = null; if (this._ac) { try { this._ac.close(); } catch (e) { /* ya cerrado */ } } this._ac = null; this._capas = null; }
};
MC.Paisaje = Paisaje;


/* C-M36 · Percepción acústica espacial de persecución: pura, sin samples, compatible con todos los juegos.
   La oclusión se estima contra huellas del mundo; no afirma simular propagación acústica real. */
const PersecucionAudio = {
  plan(op = {}) {
    const d = Math.max(0, Number(op.distancia) || 0), vr = clamp(Number(op.velocidadRadial) || 0, -90, 90),
      factor = clamp(343 / (343 + vr), .8, 1.25), at = 1 / (1 + (d / 95) ** 2),
      obst = op.ocluido ? .38 : 1, int = op.interior ? .75 : 1;
    return { doppler: factor, volumen: clamp((op.intensidad ?? 1) * at * obst * int, 0, 1), corte: op.ocluido ? 650 : op.interior ? 1600 : 3200 };
  },
  motor(op = {}) {
    const v = Math.max(0, Math.abs(Number(op.velocidad) || 0)), a = clamp(Number(op.aceleracion) || 0, -1, 1),
      marcha = Math.min(5, Math.floor(v / 9)), rpm = clamp(.25 + ((v - marcha * 9) / 9) * .75, .25, 1);
    return { agudo: 42 + rpm * 70 + marcha * 6, grave: (42 + rpm * 70 + marcha * 6) / 2,
      corte: 500 + rpm * 900 + a * 400, volumen: op.activo ? .035 + rpm * .03 + Math.max(0, a) * .02 : 0 };
  },
  ocluido(mundo, a, b) {
    if (!mundo || typeof mundo.edificioEn !== 'function' || !a || !b) return false;
    const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.min(12, Math.max(2, Math.ceil(d / 14)));
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (mundo.edificioEn(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 0)) return true;
    }
    return false;
  }
};
MC.PersecucionAudio = PersecucionAudio;

/* ---- js/70-interfaz.js ---- */
/* =====================================================================
   INTERFAZ INTEGRADA · las piezas de pantalla que todo juego necesita, con el tema de cada juego
   - Tema por tokens (colores, letra, radios) en variables CSS: EnCicla verde, El Metro con sus líneas, Motor City neón…
   - Piezas: barra superior de fichas, velocímetro, barras (energía, agua, gasolina), botones táctiles grandes (≥ 48 px),
     menú, diálogo con opciones, avisos, panel de misión, minimapa (con las losas del motor) y brújula.
   - Accesible: etiquetas aria, contraste alto, respeta «reducir movimiento», funciona con teclado y con el dedo.
   - DISTRIBUCIÓN (lo que no se negocia): el centro de la pantalla es del juego (la «zona libre» donde va el jugador);
     la información va en las esquinas de arriba, el movimiento abajo a la izquierda y las acciones abajo a la derecha,
     donde llega el pulgar. Nada tapa la zona libre (MC.UI.verificar lo comprueba en las pruebas).
   - HUD CONTEXTUAL: lo que no cambia se atenúa solo a los pocos segundos y vuelve al cambiar (menos ruido, más mundo);
     al ir rápido, solo queda lo vital (foco); en modo cine no queda nada.
   - AVISOS EN COLA: uno a la vez, cortos, arriba y al centro (nunca encima del jugador), sin robar el control.
   Uso: const ui = MC.UI.crear(document.body, { tema: 'motorcity' }); ui.ficha('hora', '🕐 8:00'); ui.boton({ id, icono, texto, al })
   ===================================================================== */
const TEMAS_UI = {
  motorcity: { fondo: 'rgba(11,16,32,.78)', tinta: '#f4f1e6', acento: '#39ffb3', acento2: '#ff2fb3', borde: 'rgba(255,255,255,.16)', letra: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", radio: '14px' },
  encicla: { fondo: 'rgba(10,35,66,.82)', tinta: '#ffffff', acento: '#9bd341', acento2: '#ffd84a', borde: 'rgba(255,255,255,.18)', letra: "'Nunito', system-ui, sans-serif", radio: '16px' },
  elmetro: { fondo: 'rgba(15,27,45,.85)', tinta: '#ffffff', acento: '#ffd84a', acento2: '#1C5C9C', borde: 'rgba(255,255,255,.15)', letra: "system-ui, sans-serif", radio: '12px' },
  noche: { fondo: 'rgba(12,12,14,.82)', tinta: '#ece6da', acento: '#e8a33c', acento2: '#d3262b', borde: 'rgba(236,230,218,.16)', letra: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", radio: '6px' },
  runscooter: { fondo: 'rgba(14,99,120,.88)', tinta: '#e8e4c4', acento: '#ffc23a', acento2: '#c0191c', borde: 'rgba(232,228,196,.3)', letra: "system-ui, sans-serif", radio: '4px' }
};
const UI = {
  TEMAS: TEMAS_UI,
  crear(raiz, op = {}) {
    if (typeof document === 'undefined') return null;
    const T = Object.assign({}, TEMAS_UI[op.tema || 'motorcity'], op.colores || {}), id = 'mcui-' + Math.random().toString(36).slice(2, 7), capa = document.createElement('div'); capa.className = 'mcui'; capa.id = id; raiz.appendChild(capa);
    const css = document.createElement('style'); css.textContent = `#${id}{--f:${T.fondo};--t:${T.tinta};--a:${T.acento};--a2:${T.acento2};--b:${T.borde};--r:${T.radio};position:fixed;inset:0;pointer-events:none;font:14px/1.3 ${T.letra};color:var(--t);z-index:20}
#${id} [hidden]{display:none!important}#${id} .p{pointer-events:auto}#${id} .izq{position:absolute;top:max(10px,env(safe-area-inset-top));left:10px;right:84px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}#${id} .fichas{display:flex;flex-wrap:wrap;gap:6px;max-height:76px;overflow:hidden}#${id} .ficha{max-width:52vw;overflow:hidden;text-overflow:ellipsis}#${id} .mision{overflow:hidden}#${id} .mision .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${id} .mision .d{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#${id} .aviso.on{-webkit-line-clamp:3}
#${id} .ficha{padding:6px 10px;border-radius:999px;background:var(--f);border:1px solid var(--b);font-weight:700;white-space:nowrap;backdrop-filter:blur(6px)}
#${id} .botones{position:absolute;right:8px;top:max(10px,env(safe-area-inset-top));display:flex;flex-direction:column;flex-wrap:wrap-reverse;align-content:flex-start;max-height:calc(100vh - 170px);gap:6px;width:clamp(48px,calc(20vw - 10px),66px)}#${id} .botones button{box-sizing:border-box;width:100%;min-width:0;padding:4px 1px;overflow:hidden}#${id} .botones button small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#${id} button{min-width:48px;min-height:48px;border-radius:var(--r);border:1px solid var(--b);background:var(--f);color:var(--t);font:700 18px/1 ${T.letra};cursor:pointer}
#${id} button:focus-visible{outline:3px solid var(--a);outline-offset:2px}#${id} button small{display:block;font-size:10px;opacity:.85;margin-top:2px}
#${id} .vel{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(max(14px,env(safe-area-inset-bottom)) + 8px);text-shadow:0 2px 6px #000c;white-space:nowrap}#${id} .vel b{font:900 30px/1 ${T.letra};color:var(--a)}
#${id} .barras{display:flex;flex-wrap:wrap;gap:4px 10px;max-width:100%}#${id} .barras>div{display:flex;align-items:center;gap:4px;font-size:12px;text-shadow:0 1px 3px #000c;background:var(--f);padding:1px 8px;border-radius:999px}@media (orientation:portrait) and (max-width:560px){#${id} .barras span{display:none}}#${id} .leyenda{display:flex;flex-wrap:wrap;align-items:center;gap:3px 9px;padding:5px 10px;border-radius:var(--r);background:var(--f);font-size:12px;max-width:min(320px,70vw)}#${id} .leyenda b{margin-right:2px}#${id} .leyenda i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}#${id} .barras small{font-size:12px}#${id} .barras .barra{width:46px;height:7px}
#${id} .barra{height:8px;border-radius:6px;background:#ffffff26;overflow:hidden}#${id} .barra i{display:block;height:100%;background:linear-gradient(90deg,var(--a),var(--a2));transition:width .3s}
#${id} .aviso{padding:8px 14px;border-radius:var(--r);background:var(--f);border:1px solid var(--b);border-left:4px solid var(--a2);font-weight:800;opacity:0;transition:opacity .3s;max-width:min(340px,72vw);max-height:0;overflow:hidden}#${id} .aviso.on{opacity:1;max-height:200px}
#${id} .mision{max-width:min(320px,70vw);padding:8px 12px;border-radius:var(--r);background:var(--f);border-left:4px solid var(--a)}
#${id} .dialogo{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);width:min(520px,92vw);padding:14px;border-radius:var(--r);background:var(--f);border:1px solid var(--b)}#${id} .dialogo .opts{display:grid;gap:6px;margin-top:10px}#${id} .dialogo button{font-size:15px;text-align:left;padding:10px}
#${id} .menu{position:absolute;right:66px;top:max(10px,env(safe-area-inset-top));max-height:78vh;overflow:auto;width:min(300px,72vw);padding:8px;border-radius:var(--r);background:var(--f);border:1px solid var(--b);display:grid;gap:4px}#${id} .menu button{text-align:left;font-size:14px;padding:8px 10px}
#${id} .mapaG{position:fixed;inset:0;z-index:60;background:#0b0f14;touch-action:none}#${id} .mapaG canvas{width:100%;height:100%;display:block}#${id} .mapaG button{position:absolute;top:calc(env(safe-area-inset-top) + 12px);right:12px;width:48px;height:48px;border-radius:50%;border:0;background:#fff;color:#111;font:800 20px system-ui}#${id} .mapaG small{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom) + 14px);text-align:center;color:#fff;font:600 13px system-ui;text-shadow:0 1px 3px #000}
#${id} canvas.mini{position:absolute;right:10px;bottom:calc(max(16px,env(safe-area-inset-bottom)) + 96px);width:120px;height:120px;border-radius:50%;border:2px solid var(--b);background:#0006}
#${id} .fichas>*,#${id} .botones>*,#${id} .mision,#${id} .vel,#${id} .barras{transition:opacity .6s}#${id} .dim{opacity:.75}#${id}.foco .fichas,#${id}.foco .botones,#${id}.foco .mision,#${id}.foco .barras{opacity:.18}#${id} .izq .aviso{pointer-events:none}#${id}.cine>*{opacity:0!important;pointer-events:none!important}
@media (orientation:landscape){#${id} .izq{right:auto;max-width:24vw}#${id} .fichas{max-height:66px}#${id} .ficha{max-width:23vw}#${id} .mision .d{-webkit-line-clamp:1}}@media (orientation:landscape) and (max-height:500px){#${id} .ficha{padding:4px 8px;font-size:12px}#${id} .mision,#${id} .aviso{font-size:12px}}
#${id} .joy{position:absolute;left:0;top:0;width:124px;height:124px;margin:-62px 0 0 -62px;border-radius:50%;border:3px solid rgba(255,255,255,.45);background:radial-gradient(circle,rgba(255,255,255,.10),rgba(255,255,255,.03));transition:opacity .3s;will-change:transform}
#${id} .joy i{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:var(--a);opacity:.85;box-shadow:0 2px 10px #0006;will-change:transform}
#${id} .joy small{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:6px;white-space:nowrap;font-weight:800;text-shadow:0 1px 4px #000c}
#${id} .acciones{position:absolute;right:12px;bottom:max(14px,env(safe-area-inset-bottom));display:flex;gap:10px;align-items:flex-end}
#${id} .acciones button{width:66px;height:66px;border-radius:50%;font-size:26px;background:var(--f);border:2px solid var(--b)}#${id} .acciones button.on{background:var(--a);color:#000}
#${id} canvas.mini{bottom:calc(max(16px,env(safe-area-inset-bottom)) + 86px)}
@media (prefers-reduced-motion:reduce){#${id} *{transition:none!important}}`;
    document.head.appendChild(css);
    const div = (cls, padre = capa) => { const d = document.createElement('div'); d.className = cls; padre.appendChild(d); return d; };
    const izq = div('izq'), fichas = div('fichas', izq), barras = div('barras', izq), leyenda = div('leyenda', izq), mision = div('mision', izq), aviso = div('aviso', izq), botones = div('botones p'), vel = div('vel');   /* arriba se informa (fichas, barras, leyenda, misión, avisos), en columna y sin montarse; abajo a la izquierda solo va el pulgar */ mision.hidden = true; leyenda.hidden = true; aviso.setAttribute('role', 'status'); aviso.setAttribute('aria-live', 'polite');
    const F = {}, Bs = {}, Ba = {};
    const ui = {
      capa, tema: T,
      ficha(clave, texto) { if (!F[clave]) { F[clave] = div('ficha', fichas); } const el = F[clave]; if (el.textContent !== texto) { el.textContent = texto; ui.contextual(el); } return el; },
      /* se atenúa sola si no cambia en «seg» segundos; vuelve a encenderse al cambiar */
      contextual(el, seg = ui.atenuar) { if (!el || !seg) return; el.classList.remove('dim'); clearTimeout(el._dim); el._dim = setTimeout(() => el.classList.add('dim'), seg * 1000); },
      atenuar: op.atenuar ?? 5,
      /* foco: al ir rápido o en tensión, solo queda lo vital (velocidad, aviso); cine: nada */
      foco(on) { capa.classList.toggle('foco', !!on); }, cine(on) { capa.classList.toggle('cine', !!on); },
      /* el rectángulo que la interfaz no debe tapar (en px de la ventana) */
      zonaLibre() { const W = innerWidth, H = innerHeight, v = H > W; return v ? { x0: W * .16, y0: H * .24, x1: W * .8, y1: H * .68 } : { x0: W * .26, y0: H * .2, x1: W * .74, y1: H * .74 }; },
      boton({ id: bid, icono = '', texto = '', al, padre }) { const b = document.createElement('button'); b.className = 'p'; b.innerHTML = icono + (texto ? '<small>' + texto + '</small>' : ''); b.setAttribute('aria-label', texto || bid); b.onclick = e => { e.stopPropagation(); al && al(e); }; (padre || botones).appendChild(b); Bs[bid] = b; return b; },
      velocidad(ms, extra = '') { vel.innerHTML = '<b>' + Math.round(Math.abs(ms) * 3.6) + '</b> km/h ' + extra; },
      barra(clave, etiqueta, v) { if (!Ba[clave]) { const w = div('', barras), [ico, ...txt] = String(etiqueta).split(' '); w.title = etiqueta; w.innerHTML = '<small>' + (txt.length ? ico + '<span> ' + txt.join(' ') + '</span>' : etiqueta) + '</small><div class="barra"><i></i></div>';   /* en celular vertical solo el ícono: las barras caben en una fila */ Ba[clave] = w.querySelector('i'); Ba[clave]._w = w; } Ba[clave].style.width = Math.round(clamp(v, 0, 1) * 100) + '%'; },
      /* avisos en cola: uno a la vez; si llega uno igual, no se repite */
      barraVisible(clave, v) { if (Ba[clave]) Ba[clave]._w.hidden = !v; },
      aviso(texto, ms = 2200, clave) { const C = ui._cola || (ui._cola = []); if (clave) { for (let i = C.length - 1; i >= 0; i--) if (C[i][2] === clave) C.splice(i, 1); if (ui._av && ui._avClave === clave) { aviso.textContent = texto; clearTimeout(ui._t); ui._t = setTimeout(() => { aviso.classList.remove('on'); setTimeout(() => ui._sig(), 320); }, ms); return; } } if (C.some(q => q[0] === texto) || aviso.textContent === texto && aviso.classList.contains('on')) return; C.push([texto, ms, clave]); if (!ui._av) ui._sig(); },   // 2.8: con «clave», el aviso nuevo reemplaza al viejo del mismo tipo (la vista nunca queda desfasada)
      _sig() { const q = (ui._cola || []).shift(); if (!q) { ui._av = false; ui._avClave = null; return; } ui._av = true; ui._avClave = q[2] || null; aviso.textContent = q[0]; aviso.classList.add('on'); clearTimeout(ui._t); ui._t = setTimeout(() => { aviso.classList.remove('on'); setTimeout(() => ui._sig(), 320); }, q[1]); },
      leyenda(L) { leyenda.hidden = !L; if (!L) return; leyenda.innerHTML = '<b>' + (L.titulo || '') + '</b>' + (L.items || []).map(([c, t]) => '<span><i style="background:' + c + '"></i>' + t + '</span>').join(''); },   // qué significa cada color de una capa de datos
      mision(texto) { mision.hidden = !texto; const [t, ...d] = String(texto || '').split('<br>'); mision.innerHTML = '<div class="t">' + t + '</div>' + (d.length ? '<div class="d">' + d.join(' ') + '</div>' : ''); },   // título en una línea; el detalle, en dos como mucho (nunca medio renglón cortado)
      /* diálogo con opciones: devuelve una promesa con la opción elegida */
      dialogo(titulo, texto, opciones = ['Listo']) { return new Promise(res => { const d = div('dialogo p'); d.setAttribute('role', 'dialog'); d.innerHTML = '<b>' + titulo + '</b><div>' + texto + '</div><div class="opts"></div>'; opciones.forEach((o, i) => { const b = document.createElement('button'); b.textContent = o; b.onclick = () => { d.remove(); res(i); }; d.querySelector('.opts').appendChild(b); if (!i) setTimeout(() => b.focus(), 50); }); }); },
      menu(titulo, items, al) { const m = div('menu p'); m.innerHTML = '<b style="padding:4px">' + titulo + '</b>'; for (const it of items) { const b = document.createElement('button'); b.innerHTML = it.texto; b.onclick = () => { m.remove(); al(it.id); }; m.appendChild(b); } const cerrar = () => m.remove(); setTimeout(() => document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', k); } }), 0); return m; },
      /* minimapa redondo con las losas del motor, girado con la cámara */
      minimapa(vistas) { const c = document.createElement('canvas'); c.className = 'mini'; c.width = c.height = 240; capa.appendChild(c); ui._mini = { c, vistas }; return c; },
      pintarMinimapa(x, y, yaw = 0, puntos = []) { const M = ui._mini; if (!M) return; const g = M.c.getContext('2d'), L = M.vistas.losas, z = .45, R = 120; g.save(); g.clearRect(0, 0, 240, 240); g.beginPath(); g.arc(R, R, R, 0, TAU); g.clip(); g.translate(R, R); g.rotate(-yaw); g.scale(z, z); g.translate(-x, -y); const s = L.L, gx0 = Math.floor((x - 300) / s), gy0 = Math.floor((y - 300) / s); for (let gy = gy0; gy <= gy0 + 4; gy++) for (let gx = gx0; gx <= gx0 + 4; gx++) { const t = L.losa(gx, gy, .5, true, false) || L.losa(gx, gy, .0625, false, false); if (t) g.drawImage(t, gx * s, gy * s, s, s); } for (const p of puntos) { g.fillStyle = p.color || '#ffc23a'; g.beginPath(); g.arc(p.x, p.y, 12, 0, TAU); g.fill(); } g.restore(); g.fillStyle = '#39ffb3'; g.beginPath(); g.moveTo(R, R - 9); g.lineTo(R + 6, R + 7); g.lineTo(R - 6, R + 7); g.fill(); },
      /* 3.0: el MAPA GRANDE (al tocar el minimapa). Ver todo el mundo ya no es alejar la cámara del juego (eso lo pone lento):
         es una hoja aparte, que se pinta solo al abrirla y al moverla. Arrastrar = mover; pellizco o rueda = zoom; ✕ = cerrar. */
      abrirMapa(vistas, M, puntos = [], yo = null) {
        if (ui._mapa) return ui._mapa; const o = div('mapaG'), c = document.createElement('canvas'), x = document.createElement('button'), t = document.createElement('small'); o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Mapa');
        x.textContent = '✕'; x.setAttribute('aria-label', 'Cerrar el mapa'); t.textContent = 'Arrastra para mover · pellizca para acercar'; o.append(c, x, t); capa.appendChild(o);
        const L = vistas.losasLejos || vistas.losas, s = L.L, d = Math.min(2, devicePixelRatio || 1); let k = Math.min(innerWidth / M.ancho, innerHeight / M.alto) * 1.6, cx = yo ? yo.x : M.ancho / 2, cy = yo ? yo.y : M.alto / 2;
        const RES = [.0625, .125, .25, .5], pintar = () => { const W = c.width = Math.round(innerWidth * d), H = c.height = Math.round(innerHeight * d), g = c.getContext('2d'), z = k * d, res = RES.find(r => r >= z) || .5;
          g.fillStyle = '#1d3b4f'; g.fillRect(0, 0, W, H); g.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z); g.imageSmoothingEnabled = true;
          const x0 = cx - W / 2 / z, x1 = cx + W / 2 / z, y0 = cy - H / 2 / z, y1 = cy + H / 2 / z;
          for (let gy = Math.floor(Math.max(0, y0) / s); gy <= Math.floor(Math.min(M.alto, y1) / s); gy++) for (let gx = Math.floor(Math.max(0, x0) / s); gx <= Math.floor(Math.min(M.ancho, x1) / s); gx++) { const q = L.losa(gx, gy, res, false, 0); if (q) g.drawImage(q, gx * s, gy * s, s + .5 / z, s + .5 / z); }
          g.setTransform(1, 0, 0, 1, 0, 0); const P = (wx, wy) => [W / 2 + (wx - cx) * z, H / 2 + (wy - cy) * z];
          for (const p of puntos) { const [px, py] = P(p.x, p.y); g.fillStyle = p.color || '#ffc23a'; g.strokeStyle = '#000'; g.lineWidth = 2 * d; g.beginPath(); g.arc(px, py, 7 * d, 0, TAU); g.fill(); g.stroke(); if (p.texto) { g.font = '700 ' + 12 * d + 'px system-ui'; g.fillStyle = '#fff'; g.fillText(p.texto, px + 10 * d, py + 4 * d); } }
          if (yo) { const [px, py] = P(yo.x, yo.y); g.save(); g.translate(px, py); g.rotate((yo.a || 0) + Math.PI / 2); g.fillStyle = '#2ee6a6'; g.strokeStyle = '#06261c'; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(0, -11 * d); g.lineTo(8 * d, 9 * d); g.lineTo(0, 4 * d); g.lineTo(-8 * d, 9 * d); g.closePath(); g.fill(); g.stroke(); g.restore(); } };
        const dedos = new Map(); let base = null;
        c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); dedos.set(e.pointerId, [e.clientX, e.clientY]); base = dedos.size === 2 ? [...dedos.values()] : null; });
        c.addEventListener('pointermove', e => { const a = dedos.get(e.pointerId); if (!a) return; if (dedos.size === 1) { cx -= (e.clientX - a[0]) / k; cy -= (e.clientY - a[1]) / k; } dedos.set(e.pointerId, [e.clientX, e.clientY]); if (dedos.size === 2 && base) { const v = [...dedos.values()], d0 = Math.hypot(base[0][0] - base[1][0], base[0][1] - base[1][1]), d1 = Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]); if (d0 > 10) k = clamp(k * d1 / d0, .03, 3); base = v; } pintar(); });
        const fin = e => { dedos.delete(e.pointerId); base = null; }; c.addEventListener('pointerup', fin); c.addEventListener('pointercancel', fin);
        c.addEventListener('wheel', e => { e.preventDefault(); k = clamp(k * Math.exp(-e.deltaY * .0015), .03, 3); pintar(); }, { passive: false });
        x.onclick = () => { o.remove(); ui._mapa = null; }; pintar(); return (ui._mapa = { o, pintar });
      },
      /* joystick visible: donde se pone el dedo aparece la base y la perilla; quieto, una guía abajo a la izquierda */
      joystick(ctl, op = {}) { const j = div('joy'), k = document.createElement('i'), t = document.createElement('small'); j.appendChild(k); j.appendChild(t); t.textContent = op.texto ?? 'Arrastra para moverte'; ui._joy = { j, k, t, ctl, usado: false, t0: Date.now() }; return j; },
      pintarJoystick() { const J = ui._joy; if (!J) return; const S = J.ctl.stick, r = J.ctl.el.getBoundingClientRect();
        if (S.activo) { J.usado = true; J.j.style.opacity = 1; J.j.style.transform = 'translate(' + (r.left + S.ox) + 'px,' + (r.top + S.oy) + 'px)'; const dx = clamp(S.px - S.ox, -52, 52), dy = clamp(S.py - S.oy, -52, 52); J.k.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; J.t.hidden = true; }
        else { const x = r.left + Math.min(110, r.width * .2), y = r.top + r.height - Math.max(150, r.height * .2); J.j.style.transform = 'translate(' + x + 'px,' + y + 'px)'; J.k.style.transform = 'translate(0,0)'; J.j.style.opacity = J.usado ? .22 : .7; J.t.hidden = J.usado; } },
      /* botones de acción grandes abajo a la derecha (donde llega el pulgar); mantener = mientras está oprimido */
      accion({ id: aid, icono = '', texto = '', mantener = false, ctl, al }) {
        if (!ui._acc) ui._acc = div('acciones p'); const b = document.createElement('button'); b.innerHTML = icono; b.setAttribute('aria-label', texto || aid); b.title = texto; ui._acc.appendChild(b);
        const on = e => { e.preventDefault(); e.stopPropagation(); b.classList.add('on'); if (ctl) ctl.boton(aid, true); if (al && !mantener) al(e); }, off = e => { b.classList.remove('on'); if (ctl) ctl.boton(aid, false); if (al && mantener && e && e.type === 'pointerup') al(e); };
        b.addEventListener('pointerdown', on); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, off); return b; },
      quitar() { capa.remove(); css.remove(); }
    };
    return ui;
  }
};
/* ¿algo de la interfaz tapa la zona libre? devuelve la lista de lo que estorba (para las pruebas y para el juego) */
UI.verificar = function (ui) {
  if (!ui || typeof document === 'undefined') return []; const Z = ui.zonaLibre(), malos = [];
  for (const el of ui.capa.querySelectorAll('.ficha, .botones button, .mision, .vel, .barras, canvas.mini, .p')) {
    if (el.hidden || el.closest('[hidden]') || el.classList.contains('dialogo') || el.classList.contains('menu')) continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (r.right > Z.x0 && r.left < Z.x1 && r.bottom > Z.y0 && r.top < Z.y1) malos.push((el.className || el.tagName) + ' ' + Math.round(r.left) + ',' + Math.round(r.top));
  }
  return malos;
};
/* los principios de la interfaz del motor (resumen de docs/INVESTIGACION.md) */
UI.PRINCIPIOS = ['El centro es del juego', 'Arriba se informa, abajo se actúa', 'Los botones donde llega el pulgar (≥ 48 px)', 'Lo que no cambia se atenúa', 'Un aviso a la vez, corto', 'Se aprende jugando, no leyendo', 'Todo con el dedo, el teclado y el mando', 'Respetar «reducir movimiento» y el contraste'];
/* indicador del objetivo sobre el lienzo: si se ve, un pin que rebota; si no, una flecha en el borde que apunta hacia él */
UI.indicador = function (g, W, H, sx, sy, op = {}) {
  const k = op.escala || 1, m = 46 * k, t = (op.t || 0), col = op.color || '#ffc23a', R = op.rect || [m, m * 1.8, W - m, H - m * 2.2], dentro = sx > R[0] && sy > R[1] && sx < R[2] && sy < R[3];
  g.save(); g.font = '800 ' + Math.round(13 * k) + 'px system-ui, sans-serif'; g.textAlign = 'center';
  if (dentro) { const b = Math.abs(Math.sin(t * 3)) * 8 * k, y = sy - 20 * k - b; g.fillStyle = col; g.strokeStyle = '#1a1a1a'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(sx, y + 14 * k); g.arc(sx, y, 10 * k, Math.PI * .8, Math.PI * .2); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(sx, y, 4 * k, 0, TAU); g.fill(); if (op.texto) { g.fillStyle = '#fff'; g.strokeStyle = '#000a'; g.lineWidth = 4 * k; g.strokeText(op.texto, sx, y - 16 * k); g.fillText(op.texto, sx, y - 16 * k); } }
  else { const cx = (R[0] + R[2]) / 2, cy = (R[1] + R[3]) / 2, a = Math.atan2(sy - cy, sx - cx), hx = (R[2] - R[0]) / 2, hy = (R[3] - R[1]) / 2, f = Math.min(hx / Math.max(1e-6, Math.abs(Math.cos(a))), hy / Math.max(1e-6, Math.abs(Math.sin(a)))), ex = cx + Math.cos(a) * f, ey = cy + Math.sin(a) * f, s2 = 1 + .08 * Math.sin(t * 5);   /* en el borde de la zona libre, nunca encima de la interfaz */
    g.translate(ex, ey); g.save(); g.rotate(a); g.scale(s2, s2); g.fillStyle = col; g.strokeStyle = '#1a1a1a'; g.lineWidth = 2 * k; g.beginPath(); g.moveTo(18 * k, 0); g.lineTo(-10 * k, -13 * k); g.lineTo(-4 * k, 0); g.lineTo(-10 * k, 13 * k); g.closePath(); g.fill(); g.stroke(); g.restore();
    if (op.texto) { g.fillStyle = '#fff'; g.strokeStyle = '#000a'; g.lineWidth = 4 * k; const ty = ey > H / 2 ? -22 * k : 30 * k; g.strokeText(op.texto, 0, ty); g.fillText(op.texto, 0, ty); } }
  g.restore();
};
MC.UI = UI;

/* ---- js/80-mecanicas.js ---- */
/* =====================================================================
   MECÁNICAS · piezas de jugabilidad listas para armar juegos (las guarda y las comparte el motor)
   - Misión: pasos (ir a, recoger, entregar, esperar, condición) con tiempo límite, recompensa en el libro contable
     y eventos. - Inventario con masa y volumen reales (lo que cargas pesa: cambia la física del vehículo).
   - Carrera: puntos de control sobre las calles reales (A*), vueltas, cronómetro y rivales que frenan antes de las
     curvas con física (v = √(μg/κ)). - Logros y coleccionables. - Diálogos como grafo con condiciones y variables.
   Todas guardan su estado en un objeto plano (se puede guardar con MC.guardado sin romper nada).
   ===================================================================== */
class Mision {
  /* def: { id, titulo, pasos: [{ tipo: 'ir'|'recoger'|'entregar'|'esperar'|'condicion', x, y, radio, objeto, seg, cond, texto }], limite (s), premio (centavos), libro, cuenta } */
  constructor(def) { this.def = def; this.paso = 0; this.t = 0; this.estado = 'activa'; this.esperado = 0; }
  get actual() { return this.def.pasos[this.paso] || null; }
  actualizar(dt, jugador, inventario) {
    if (this.estado !== 'activa') return this.estado; this.t += dt; const P = this.actual;
    if (this.def.limite && this.t > this.def.limite) { this.estado = 'fallida'; MC.emit('mision', { m: this, estado: 'fallida' }); return this.estado; }
    if (!P) return this.terminar();
    const cerca = P.x == null || Math.hypot(jugador.x - P.x, jugador.y - P.y) <= (P.radio || 15); let listo = false;
    if (P.tipo === 'ir') listo = cerca;
    else if (P.tipo === 'recoger') listo = cerca && (!inventario || inventario.agregar(P.objeto));
    else if (P.tipo === 'entregar') listo = cerca && (!inventario || inventario.quitar(P.objeto.id));
    else if (P.tipo === 'esperar') { if (cerca) this.esperado += dt; listo = this.esperado >= (P.seg || 3); }
    else if (P.tipo === 'condicion') listo = !!(P.cond && P.cond(jugador));
    if (listo) { this.paso++; this.esperado = 0; MC.emit('mision', { m: this, estado: 'paso', paso: P }); if (this.paso >= this.def.pasos.length) return this.terminar(); }
    return this.estado;
  }
  terminar() { this.estado = 'cumplida'; const D = this.def; if (D.premio && D.libro) D.libro.mover(D.de || 'mundo', D.cuenta || 'jugador', D.premio, 'Misión: ' + D.titulo, false); MC.emit('mision', { m: this, estado: 'cumplida' }); return this.estado; }
  get restante() { return this.def.limite ? Math.max(0, this.def.limite - this.t) : null; }
}
class Inventario {
  constructor({ masaMax = 20, volumenMax = 60 } = {}) { this.masaMax = masaMax; this.volumenMax = volumenMax; this.items = []; }
  get masa() { return this.items.reduce((a, o) => a + (o.masa || 0), 0); }
  get volumen() { return this.items.reduce((a, o) => a + (o.volumen || 0), 0); }
  /* objeto: { id, n, masa (kg), volumen (L), valor (centavos) } */
  agregar(o) { if (this.masa + (o.masa || 0) > this.masaMax + 1e-9 || this.volumen + (o.volumen || 0) > this.volumenMax + 1e-9) { MC.emit('inventario', { lleno: true, o }); return false; } this.items.push(o); MC.emit('inventario', { agrega: o }); return true; }
  quitar(id) { const i = this.items.findIndex(o => o.id === id); if (i < 0) return false; const [o] = this.items.splice(i, 1); MC.emit('inventario', { quita: o }); return true; }
  tiene(id) { return this.items.some(o => o.id === id); }
}
class Carrera {
  /* op: { mundo, red, puntos: [{x,y}], vueltas, rivales: [{ nombre, vmax, mu }] } — la ruta sale por las calles reales */
  constructor(op) {
    this.op = op; const R = op.red || op.mundo.red('rueda'), P = op.puntos, tramos = []; this.vueltas = op.vueltas || 1;
    for (let i = 0; i < P.length - (op.cerrada ? 0 : 1); i++) { const a = P[i], b = P[(i + 1) % P.length], ca = R.cercana(a.x, a.y, 150), cb = R.cercana(b.x, b.y, 150); const c = ca && cb && R.camino(ca.arista.a, cb.arista.a); if (c) for (const t of c) tramos.push(t); }
    const pts = []; for (const t of tramos) { const p = t.arista.t.p, n = p.length >> 1; for (let k = 0; k < n; k++) { const j = t.adelante ? k : n - 1 - k; pts.push(p[2 * j], p[2 * j + 1]); } }
    this.trazo = new Trazo(Float32Array.from(pts.length >= 4 ? pts : [P[0].x, P[0].y, P[1].x, P[1].y])); this.control = P.map(q => this.trazo.proyectar(q.x, q.y).s).sort((a, b) => a - b);
    this.rivales = (op.rivales || []).map((r, i) => Object.assign({ s: -6 * (i + 1), v: 0, vuelta: 0, termino: null }, r)); this.t = 0; this.jugador = { s: 0, vuelta: 0, cp: 0, termino: null };
  }
  /* paso: el jugador avanza por donde esté (se proyecta al trazo); los rivales con física de curvas */
  actualizar(dt, x, y) {
    this.t += dt; const L = this.trazo.largo, J = this.jugador, pr = this.trazo.proyectar(x, y);
    if (pr.d < 30) { if (J.s > L * .8 && pr.s < L * .2) { J.vuelta++; J.cp = 0; } J.s = pr.s; while (J.cp < this.control.length && J.s >= this.control[J.cp] - 5) J.cp++; if (J.vuelta >= this.vueltas && !J.termino) { J.termino = this.t; MC.emit('carrera', { fin: true, tiempo: this.t, puesto: this.puesto() }); } }
    for (const R of this.rivales) { if (R.termino) continue; const k = this.trazo.curva(clamp(R.s + R.v * 1.5, 0, L), 10), vObj = Math.min(R.vmax, IA.vCurva(k, R.mu || .85)); R.v += clamp(vObj - R.v, -8 * dt, 3 * dt); R.s += R.v * dt; if (R.s >= L) { R.vuelta++; R.s -= L; if (R.vuelta >= this.vueltas) R.termino = this.t; } }
  }
  progreso(o) { return (o.vuelta || 0) * this.trazo.largo + o.s; }
  puesto() { const p = this.progreso(this.jugador); return 1 + this.rivales.filter(r => (r.termino && (!this.jugador.termino || r.termino < this.jugador.termino)) || (!r.termino && this.progreso(r) > p)).length; }
}
const Logros = {
  lista: new Map(), hechos: new Set(),
  definir(id, n, prueba) { this.lista.set(id, { id, n, prueba }); },
  revisar(estado) { const nuevos = []; for (const L of this.lista.values()) if (!this.hechos.has(L.id) && L.prueba(estado)) { this.hechos.add(L.id); nuevos.push(L); MC.emit('logro', L); } return nuevos; }
};
/* diálogos: { inicio, nodos: { id: { quien, texto, opciones: [{ texto, va, si(vars), hace(vars) }] } } } */
class Dialogo {
  constructor(def, vars = {}) { this.def = def; this.vars = vars; this.nodo = def.inicio; }
  get actual() { const N = this.def.nodos[this.nodo]; if (!N) return null; return Object.assign({}, N, { opciones: (N.opciones || []).filter(o => !o.si || o.si(this.vars)) }); }
  elegir(i) { const o = this.actual.opciones[i]; if (!o) return null; if (o.hace) o.hace(this.vars); this.nodo = o.va; return this.actual; }
}
Object.assign(MC, { Mision, Inventario, Carrera, Logros, Dialogo });

/* ---- js/82-lugares.js ---- */
/* =====================================================================
   LUGARES JUGABLES · que el mundo abierto tenga a dónde ir y qué hacer (horas de juego sin una sola misión)
   - Salen del mapa real: los lugares con nombre (parques, bibliotecas, centros comerciales, tiendas, restaurantes,
     museos, iglesias) y, para que cada cuadra tenga vida, talleres, tiendas de barrio, restaurantes y tiendas de ropa
     puestos con azar fijo en edificios reales (siempre los mismos en el mismo lugar).
   - Cada lugar tiene horario, interior propio (MC.Interiores) y actividades con efecto real: reparar y mejorar el
     vehículo (MC.Desgaste), comprar ropa (cambia el aspecto), comer (energía e hidratación de MC.Seres), leer en la
     biblioteca (aprender un dato real), descansar en el parque, conocer gente (MC.Historias)…
   - Todo cobra en el libro de partida doble (MC.Libro): la plata del juego siempre cuadra.
   ===================================================================== */
const TIPOS_LUGAR = {
  taller_bici: { n: 'Taller de bicis', icono: '🔧', programa: 'taller', horario: [8, 19], nombres: ['El Pedalazo', 'La Cadena', 'Bicis Don Chepe', 'El Rayo', 'Ruedas del Barrio', 'La Biela'] },
  taller_carro: { n: 'Taller de carros y motos', icono: '🛠️', programa: 'taller', horario: [7, 18], nombres: ['Serviteca La 80', 'Taller El Mono', 'Mecánica Rápida', 'Llantas y Frenos Juancho', 'Motos El Paisa'] },
  tienda_barrio: { n: 'Tienda de barrio', icono: '🏪', programa: 'tienda', horario: [6, 22], nombres: ['Tienda Doña Rosa', 'Granero La Esquina', 'Tienda El Vecino', 'Mini mercado La Ceiba', 'Tienda Don Darío'] },
  tienda_ropa: { n: 'Tienda de ropa', icono: '👕', programa: 'tienda', horario: [9, 20], nombres: ['Moda Paisa', 'El Ropero', 'Estilo Urbano', 'La Percha', 'Telas y Tenis'] },
  restaurante: { n: 'Restaurante', icono: '🍲', programa: 'restaurante', horario: [11, 21], nombres: ['La Fonda', 'Sazón Paisa', 'El Fogón de la Abuela', 'Corrientazo Don Luis', 'Arepas La Montaña'] },
  centro_comercial: { n: 'Centro comercial', icono: '🛍️', programa: 'centro_comercial', horario: [10, 21], re: /centro comercial|\bc\.?\s?c\.?\b|\bmall\b|unicentro|oviedo|santaf[eé]|molinos|el tesoro|premium plaza|viva /i },
  biblioteca: { n: 'Biblioteca', icono: '📚', programa: 'biblioteca', horario: [8, 19], re: /bibliotec/i },
  parque: { n: 'Parque', icono: '🌳', programa: null, horario: [0, 24], re: /parque|plaza|z[oó]calo|plazoleta|jard[ií]n/i },
  museo: { n: 'Museo', icono: '🏛️', programa: 'oficina', horario: [9, 18], re: /museo|explora|planetario|casa de la memoria/i },
  iglesia: { n: 'Iglesia', icono: '⛪', programa: 'iglesia', horario: [6, 20], re: /iglesia|catedral|bas[ií]lica|parroquia|capilla/i }
};
const ACT_LUGAR = {
  taller_bici: [{ id: 'reparar', n: 'Reparar el vehículo' }, { id: 'mejorar_llantas', n: 'Llantas nuevas (+agarre)', precio: 9000000 }, { id: 'mejorar_frenos', n: 'Frenos nuevos (+frenada)', precio: 6000000 }, { id: 'mejorar_liviano', n: 'Piezas livianas (−masa)', precio: 15000000 }, { id: 'pintura', n: 'Pintura nueva', precio: 5000000 }, { id: 'luces', n: 'Luces para la noche', precio: 3500000 }],
  taller_carro: [{ id: 'reparar', n: 'Reparar el vehículo' }, { id: 'mejorar_llantas', n: 'Llantas nuevas (+agarre)', precio: 80000000 }, { id: 'mejorar_frenos', n: 'Frenos (+frenada)', precio: 45000000 }, { id: 'mejorar_motor', n: 'Ajuste del motor (+potencia)', precio: 120000000 }, { id: 'pintura', n: 'Pintura nueva', precio: 90000000 }],
  tienda_barrio: [{ id: 'agua', n: 'Agua (500 ml)', precio: 200000, efecto: { hidratacion: .35 } }, { id: 'arepa', n: 'Arepa con quesito', precio: 350000, efecto: { energia: .25 } }, { id: 'fruta', n: 'Fruta picada', precio: 400000, efecto: { energia: .15, hidratacion: .15 } }],
  tienda_ropa: [{ id: 'camisa', n: 'Camisa nueva', precio: 6000000, aspecto: 'cCamisa' }, { id: 'pantalon', n: 'Pantalón', precio: 9000000, aspecto: 'cPantalon' }, { id: 'gorra', n: 'Gorra', precio: 3000000, aspecto: 'cGorra' }, { id: 'tenis', n: 'Tenis', precio: 15000000, aspecto: 'cZapatos' }],
  restaurante: [{ id: 'almuerzo', n: 'Corrientazo (almuerzo del día)', precio: 1800000, efecto: { energia: .6, hidratacion: .2 } }, { id: 'bandeja', n: 'Bandeja paisa', precio: 3500000, efecto: { energia: .9 } }],
  centro_comercial: [{ id: 'vitrinear', n: 'Mirar vitrinas (gratis)' }, { id: 'helado', n: 'Helado', precio: 800000, efecto: { energia: .1, hidratacion: .1 } }, { id: 'cine', n: 'Cine', precio: 1500000, efecto: { animo: .4 } }],
  biblioteca: [{ id: 'leer', n: 'Leer un rato (aprendes algo real)' }, { id: 'internet', n: 'Usar un computador (mapas y datos)' }],
  parque: [{ id: 'descansar', n: 'Descansar en una banca', efecto: { energia: .2 } }, { id: 'conversar', n: 'Conversar con alguien' }, { id: 'jugar', n: 'Jugar un rato' }],
  museo: [{ id: 'recorrer', n: 'Recorrer las salas (aprendes algo real)', precio: 1200000 }],
  iglesia: [{ id: 'contemplar', n: 'Sentarse en silencio' }]
};
/* datos reales y verificables para aprender jugando (biblioteca, museo, historias de «conciencia») */
const DATOS_REALES = [
  'Con el piso mojado, una bici necesita casi el doble de distancia para frenar: el agarre de la llanta cae de ~0,7 a ~0,4.',
  'A 1.500 m de altura, como en Medellín, el aire es ~16 % menos denso que al nivel del mar: los carros pierden potencia y las bicis sienten menos viento.',
  'El agua hierve a ~95 °C en Medellín, no a 100 °C: hay menos presión del aire encima.',
  'Una persona caminando gasta unas 3,5 veces la energía que en reposo (3,5 MET); en bici moderada, unas 7 veces.',
  'La temperatura baja unos 6,5 °C por cada kilómetro que se sube: por eso Santa Elena es más fría que el centro de Medellín.',
  'El Metro de Medellín empezó a operar en 1995 y fue el primero de Colombia.',
  'El embalse de Guatapé y El Peñol se llenó en los años 70 y dejó bajo el agua el pueblo viejo de El Peñol.',
  'La Piedra del Peñol mide unos 220 m de alto y se sube por una escalera de unos 740 escalones.',
  'Un bombillo LED gasta unas 6 veces menos energía que uno incandescente para dar la misma luz.',
  'Los perros oyen sonidos de hasta ~45.000 Hz; las personas, solo hasta ~20.000 Hz.',
  'Plantar árboles en la calle baja la temperatura del andén varios grados en los días de calor.',
  'El colibrí bate las alas entre 50 y 80 veces por segundo y su corazón late más de 1.000 veces por minuto.'
];
const Lugares = {
  TIPOS: TIPOS_LUGAR, ACTIVIDADES: ACT_LUGAR, DATOS: DATOS_REALES, CELDA: 320,
  /* clasifica un lugar con nombre del mapa */
  tipoDe(L) { const t = (L.nombre || '') + ' ' + (L.dibujo || ''); for (const [k, T] of Object.entries(TIPOS_LUGAR)) if (T.re && T.re.test(t)) return k; if (/taller|bicicleter|mec[aá]nic|llanter|serviteca/i.test(t)) return /bici/i.test(t) ? 'taller_bici' : 'taller_carro'; if (/tienda|granero|minimercado|supermercado|droguer/i.test(t)) return 'tienda_barrio'; if (/restaurante|asadero|comida|panader|caf[eé]|helader|fonda/i.test(t)) return 'restaurante'; if (/ropa|boutique|moda/i.test(t)) return 'tienda_ropa'; return null; },
  /* lugares con nombre del mapa + los de cada cuadra (azar fijo), en una caja */
  en(mundo, x0, y0, x1, y1) {
    const C = this.CELDA, out = []; if (!mundo._lugaresNombre) mundo._lugaresNombre = (mundo.lugares || []).map(L => ({ L, tipo: this.tipoDe(L) })).filter(q => q.tipo).map(q => this._hacer(q.tipo, q.L.nombre, q.L.x, q.L.y, null, hashTxt(q.L.nombre), true));
    for (const q of mundo._lugaresNombre) if (q.x >= x0 && q.x <= x1 && q.y >= y0 && q.y <= y1) out.push(q);
    const cache = mundo._lugaresCelda || (mundo._lugaresCelda = new Map());
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) {
      const k = gx * 65536 + gy; if (!cache.has(k)) cache.set(k, this._celda(mundo, gx, gy)); for (const q of cache.get(k)) if (q.x >= x0 && q.x <= x1 && q.y >= y0 && q.y <= y1) out.push(q);
    }
    return out;
  },
  cerca(mundo, x, y, r = 40, tipo) { return this.en(mundo, x - r, y - r, x + r, y + r).filter(q => (!tipo || q.tipo === tipo) && Math.hypot(q.x - x, q.y - y) <= r).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)); },
  _celda(mundo, gx, gy) {
    const C = this.CELDA, eds = mundo.edificiosEn(gx * C, gy * C, (gx + 1) * C, (gy + 1) * C).filter(e => e.h > 2 && e.hw * e.hd * 4 > 40 && e.hw * e.hd * 4 < 2500), out = []; if (eds.length < 6) return out;
    const r = mulberry32((gx * 73856093) ^ (gy * 19349663) ^ 0x5bd1e995), usados = new Set();
    for (const [tipo, p] of [['tienda_barrio', .7], ['taller_bici', .35], ['restaurante', .45], ['tienda_ropa', .2], ['taller_carro', .2]]) {
      if (r() > p) continue; for (let i = 0; i < 6; i++) { const e = eds[Math.floor(r() * eds.length)]; if (usados.has(e)) continue; usados.add(e); const T = TIPOS_LUGAR[tipo]; out.push(this._hacer(tipo, T.nombres[Math.floor(r() * T.nombres.length)], e.x, e.y, e, Math.floor(r() * 1e9), false)); break; }
    }
    return out;
  },
  _hacer(tipo, nombre, x, y, e, semilla, real) { const T = TIPOS_LUGAR[tipo]; return { tipo, nombre, x, y, edificio: e, semilla, real, icono: T.icono, horario: T.horario, programa: T.programa, abierto(h) { return h >= T.horario[0] && h < T.horario[1]; } }; },
  /* el interior del lugar (si tiene) */
  interior(mundo, L) { if (!L.programa) return null; const e = L.edificio || Direccion.edificioCerca(mundo, L.x, L.y, 40) || { hw: 9, hd: 12, s: .3 }; return Interiores.generar(Object.assign({}, e, { hw: Math.max(e.hw, L.programa === 'centro_comercial' ? 22 : 6), hd: Math.max(e.hd, L.programa === 'centro_comercial' ? 28 : 7) }), { programa: L.programa, semilla: L.semilla }); },
  /* hace una actividad: { ok, texto, cobro }  ctx: { libro, cuenta, persona (MC.Seres.Persona), aspecto, desgaste, vehiculo, hora } */
  hacer(L, idAct, ctx = {}) {
    const A = (ACT_LUGAR[L.tipo] || []).find(a => a.id === idAct); if (!A) return { ok: false, texto: 'Eso no se hace aquí.' };
    if (ctx.hora != null && !L.abierto(ctx.hora)) return { ok: false, texto: L.nombre + ' está cerrado ahora (abre de ' + L.horario[0] + ' a ' + L.horario[1] + ').' };
    let precio = A.precio || 0; if (A.id === 'reparar') precio = ctx.desgaste ? Desgaste.costoReparar(ctx.desgaste, ctx.vehiculo) : 0;
    if (precio && ctx.libro && !ctx.libro.mover(ctx.cuenta || 'jugador', 'comercio', precio, L.nombre + ': ' + A.n)) return { ok: false, texto: 'No te alcanza la plata (' + Lugares.pesos(precio) + ').' };
    let texto = A.n + ' ✓';
    if (A.efecto && ctx.persona) { const E = ctx.persona.estado; for (const [k, v] of Object.entries(A.efecto)) if (E[k] != null) E[k] = clamp(E[k] + v, 0, 1); }
    if (A.aspecto && ctx.aspecto) { const r = mulberry32(hashTxt(L.nombre + A.id + (ctx.aspecto._n = (ctx.aspecto._n || 0) + 1))); ctx.aspecto[A.aspecto] = 'hsl(' + Math.floor(r() * 360) + ',' + (45 + Math.floor(r() * 40)) + '%,' + (35 + Math.floor(r() * 30)) + '%)'; texto = 'Estrenas ' + A.n.toLowerCase() + '.'; }
    if (ctx.desgaste) { if (A.id === 'reparar') { Desgaste.reparar(ctx.desgaste); texto = 'Quedó como nuevo.'; } else if (A.id.startsWith('mejorar_') || A.id === 'pintura' || A.id === 'luces') { Desgaste.mejorar(ctx.desgaste, A.id.replace('mejorar_', '')); texto = A.n + ': listo.'; } }
    if (A.id === 'leer' || A.id === 'recorrer' || A.id === 'internet') { const d = DATOS_REALES[Math.floor(mulberry32(hashTxt(L.nombre) + (ctx.vez || 0))() * DATOS_REALES.length)]; texto = '📖 ' + d; MC.emit('aprende', { lugar: L, dato: d }); }
    MC.emit('actividad', { lugar: L, actividad: A, precio }); return { ok: true, texto, cobro: precio };
  },
  pesos(cent) { return '$' + Math.round(cent / 100).toLocaleString('es-CO'); }
};
/* ---------- desgaste, reparación y mejoras de cualquier vehículo ---------- */
const MEJORAS = { llantas: { agarre: 1.12 }, frenos: { freno: 1.22 }, liviano: { masa: .93, acc: 1.06 }, motor: { vmax: 1.07, acc: 1.12 }, pintura: {}, luces: {} };
const Desgaste = {
  MEJORAS,
  nuevo(V) { return { veh: V.id, km: 0, estado: 1, mejoras: {}, color: V.color || null }; },
  /* metros recorridos, choques y clima: la lluvia y el polvo gastan más */
  usar(st, metros, choques = 0, clima = null) { st.km += metros / 1000; st.estado = clamp(st.estado - metros * 1.5e-6 * (1 + (clima ? clima.lluvia || 0 : 0)) - choques * .025, 0, 1); return st; },
  costoReparar(st, V) { const base = { pie: 0, rueda: 6000000, moto: 30000000, auto: 90000000, pesado: 250000000, aire: 600000000, agua: 120000000 }[V ? V.clase : 'rueda'] ?? 6000000; return Math.round(base * (1 - st.estado) / 100) * 100; },
  reparar(st) { st.estado = 1; return st; },
  mejorar(st, id) { if (MEJORAS[id]) st.mejoras[id] = true; if (id === 'pintura') st.color = 'hsl(' + (hashTxt(st.veh + st.km.toFixed(2) + Object.keys(st.mejoras).length) % 360) + ',70%,50%)'; return st; },
  /* el vehículo con su estado y sus mejoras (para registrar como «el mío»): un vehículo gastado anda y frena menos */
  aplicar(V, st) {
    const k = .7 + .3 * st.estado, o = { vmax: V.vmax * (.85 + .15 * st.estado), acc: V.acc * k, freno: V.freno * k, masa: V.masa, agarre: 1 };
    for (const id of Object.keys(st.mejoras)) for (const [p, f] of Object.entries(MEJORAS[id] || {})) o[p] = (o[p] || 1) * f;
    return Object.assign({ id: 'mio_' + V.id, de: V.id, n: V.n + ' (el mío)', color: st.color || V.color }, o);
  }
};
Object.assign(MC, { Lugares, Desgaste });

/* ---- js/85-historias.js ---- */
/* =====================================================================
   HISTORIAS · trama procedural con tres pilares: DIVERSIÓN, REFLEXIÓN y CONCIENCIA
   - STORYLETS (Failbetter, Emily Short): pedacitos de historia autónomos con condición (cuándo pueden pasar),
     contenido (texto y opciones) y efecto (lo que cambian). El motor elige el más «saliente» para el momento:
     el que encaja con el lugar, la hora, el clima y lo que el jugador ha hecho, y que equilibra los tres pilares.
   - DIRECTOR DE RITMO (como el «AI Director» de Left 4 Dead): mide la intensidad (choques, persecuciones, prisa) y
     alterna tensión y respiro. Después de un pico, siempre hay calma; si todo está tranquilo mucho rato, propone un reto.
     También ajusta la dificultad según cómo le va al jugador (flujo: ni aburrido ni frustrado).
   - ENCARGOS PROCEDURALES: personaje + necesidad + lugar real + obstáculo (hora, clima, tráfico) + recompensa
     + (a veces) un dilema + una lección real. Salen MC.Mision listas para jugar.
   - OCURRENCIAS: lo que nadie previó (quedar atascado, salir del mapa, números rotos, plata que no cuadra, cuadros
     lentos) se detecta, se corrige solo (volver al último punto seguro) y se anota; y también los «momentos» buenos
     que el jugador inventa (saltos enormes, récords, visitas raras), para aprender de ellos y mejorar el motor.
   ===================================================================== */
const PILARES = ['diversion', 'reflexion', 'conciencia'];
const BASE_STORYLETS = [
  /* DIVERSIÓN: que quiera seguir jugando */
  { id: 'reto_ciclista', pilar: 'diversion', cuando: c => c.vehiculo && c.vehiculo.clase === 'rueda' && c.hora > 6 && c.hora < 19, texto: c => 'Un ciclista se te pone al lado, sonríe y señala la esquina: «¿Una carrerita hasta el parque?»', opciones: [{ texto: '¡Hágale!', efecto: c => ({ mision: 'carrera' }) }, { texto: 'Hoy no, gracias', efecto: () => ({}) }] },
  { id: 'perro_sigue', pilar: 'diversion', cuando: c => !c.banderas.perro && c.lugarTipo !== 'centro_comercial', una: true, texto: () => 'Un perro criollo te sigue moviendo la cola desde hace dos cuadras.', opciones: [{ texto: 'Darle agua y adoptarlo', efecto: c => ({ bandera: 'perro', companero: 'perro_criollo' }) }, { texto: 'Acariciarlo y seguir', efecto: () => ({}) }] },
  { id: 'domicilio_urgente', pilar: 'diversion', cuando: c => c.hora >= 11 && c.hora <= 14, texto: c => 'Suena el celular: «¡Se me quemó el arroz! ¿Me trae un almuerzo antes de la 1?»', opciones: [{ texto: 'Voy volando', efecto: () => ({ mision: 'domicilio' }) }, { texto: 'No alcanzo', efecto: () => ({}) }] },
  { id: 'tesoro_parque', pilar: 'diversion', cuando: c => c.lugarTipo === 'parque', texto: () => 'Debajo de una banca alguien dejó un mapa dibujado a mano con una X.', opciones: [{ texto: 'Seguir el mapa', efecto: () => ({ mision: 'tesoro' }) }, { texto: 'Dejarlo ahí', efecto: () => ({}) }] },
  /* REFLEXIÓN: que el mundo pese; contemplativa, sin sermones */
  { id: 'abuela_ventana', pilar: 'reflexion', cuando: c => c.hora >= 15 && c.hora <= 18, texto: () => 'Una señora te mira desde la ventana y dice: «Cuando yo era niña, esta calle era una quebrada. Uno oía el agua toda la noche.»', opciones: [{ texto: 'Quedarse a escucharla', efecto: () => ({ animo: .2, recuerdo: 'quebrada' }) }, { texto: 'Saludar y seguir', efecto: () => ({}) }] },
  { id: 'atardecer', pilar: 'reflexion', cuando: c => c.hora >= 17.4 && c.hora <= 18.4 && c.altura > 1550, texto: () => 'El sol se esconde detrás de la montaña y la ciudad empieza a encender sus luces, una por una, como si alguien la estuviera despertando.', opciones: [{ texto: 'Sentarse a mirar', efecto: () => ({ animo: .3, foto: true }) }] },
  { id: 'lluvia_alero', pilar: 'reflexion', cuando: c => c.clima && c.clima.lluvia > .5, texto: () => 'Te refugias bajo un alero. Un desconocido comparte el pedazo de techo y dice: «Lo bueno de la lluvia es que obliga a esperar.»', opciones: [{ texto: 'Esperar con él', efecto: () => ({ animo: .15, energia: .1 }) }, { texto: 'Mojarse y seguir', efecto: () => ({ hidratacion: .05 }) }] },
  { id: 'arbol_viejo', pilar: 'reflexion', cuando: c => c.lugarTipo === 'parque', texto: () => 'En el tronco del árbol más grande del parque alguien grabó dos iniciales y un año: 1974. El árbol siguió creciendo alrededor.', opciones: [{ texto: 'Tocar la corteza', efecto: () => ({ animo: .1 }) }] },
  { id: 'dilema_billetera', pilar: 'reflexion', una: true, cuando: c => c.dinero != null, texto: () => 'Encuentras una billetera en el andén. Tiene plata y la cédula de alguien que vive a tres cuadras.', opciones: [{ texto: 'Devolverla', efecto: () => ({ reputacion: 1, mision: 'devolver' }) }, { texto: 'Dejarla en la tienda de la esquina', efecto: () => ({ reputacion: .5 }) }] },
  /* CONCIENCIA: aprender algo real, rápido y jugando */
  { id: 'frenada_lluvia', pilar: 'conciencia', cuando: c => c.clima && c.clima.lluvia > .3 && c.vehiculo && c.vehiculo.clase !== 'pie', texto: () => 'Llueve: con el piso mojado necesitas casi el doble de distancia para frenar. Suelta antes el acelerador en las bajadas.', opciones: [{ texto: 'Entendido', efecto: () => ({ aprende: 'frenada_lluvia' }) }] },
  { id: 'agua_calor', pilar: 'conciencia', cuando: c => c.clima && c.clima.temp > 28, texto: () => 'Hace calor: el cuerpo suda para enfriarse y pierde agua. Un sorbo cada 15–20 minutos te mantiene rindiendo.', opciones: [{ texto: 'Buscar una tienda', efecto: () => ({ busca: 'tienda_barrio' }) }] },
  { id: 'altura_aire', pilar: 'conciencia', cuando: c => c.altura > 2000, texto: () => 'A esta altura el aire tiene menos oxígeno: el corazón late más rápido por el mismo esfuerzo. Ve con calma.', opciones: [{ texto: 'Ok', efecto: () => ({ aprende: 'altura' }) }] },
  { id: 'cultura_metro', pilar: 'conciencia', cuando: c => c.cercaDe === 'estacion', texto: () => 'En el metro se deja salir antes de entrar, y se cede la silla azul: así funciona la cultura metro.', opciones: [{ texto: 'Así lo haré', efecto: () => ({ aprende: 'cultura_metro', reputacion: .2 }) }] }
];
class Historias {
  constructor(op = {}) { this.lista = (op.storylets || []).concat(op.base === false ? [] : BASE_STORYLETS); this.vistos = new Map(); this.ultPilar = { diversion: -1e9, reflexion: -1e9, conciencia: -1e9 }; this.t = 0; this.r = mulberry32(op.semilla || 7); this.enfriamiento = op.enfriamiento ?? 90; this.director = new Director(op.director); this._ult = -1e9; }
  agregar(s) { this.lista.push(s); return this; }
  /* los que pueden pasar ahora */
  disponibles(c) { return this.lista.filter(s => { const v = this.vistos.get(s.id); if (s.una && v) return false; if (v && this.t - v < (s.enfriamiento ?? 600)) return false; try { return !s.cuando || s.cuando(c); } catch (e) { return false; } }); }
  /* elige el más saliente: peso propio × pilar que hace más falta × lo que pide el director × novedad */
  elegir(c, forzar) {
    c.banderas = c.banderas || {}; if (!forzar && this.t - this._ult < this.enfriamiento) return null;
    const D = this.disponibles(c); if (!D.length) return null; const quiere = this.director.quiere();
    let best = null, bs = -1; for (const s of D) { const falta = (this.t - this.ultPilar[s.pilar]) / 300, dir = quiere === 'respiro' ? (s.pilar === 'reflexion' ? 2 : .5) : quiere === 'reto' ? (s.pilar === 'diversion' ? 2 : .7) : 1, sc = (typeof s.peso === 'function' ? s.peso(c) : s.peso || 1) * (1 + Math.min(3, falta)) * dir * (.75 + this.r() * .5); if (sc > bs) { bs = sc; best = s; } }
    this.vistos.set(best.id, this.t); this.ultPilar[best.pilar] = this.t; this._ult = this.t; MC.emit('historia', { s: best, c });
    return { id: best.id, pilar: best.pilar, texto: typeof best.texto === 'function' ? best.texto(c) : best.texto, opciones: (best.opciones || []).map(o => ({ texto: o.texto, elegir: () => { const ef = o.efecto ? o.efecto(c) || {} : {}; if (ef.bandera) c.banderas[ef.bandera] = true; MC.emit('decision', { s: best, o, ef }); return ef; } })) };
  }
  paso(dt) { this.t += dt; this.director.paso(dt); }
  /* encargo procedural: personaje + necesidad + lugar real + obstáculo + recompensa (+ dilema y lección) */
  encargo(mundo, x, y, c = {}) {
    const r = mulberry32(hashTxt('enc' + Math.floor(this.t) + Math.round(x) + Math.round(y))), L = Lugares.cerca(mundo, x, y, 700).filter(q => q.tipo !== 'parque'), P = Lugares.cerca(mundo, x, y, 900, 'parque');
    if (L.length < 2) return null; const A = L[Math.floor(r() * L.length)]; let B = L[Math.floor(r() * L.length)]; if (B === A) B = L[(L.indexOf(A) + 1) % L.length];
    const nombres = ['Doña Rosa', 'Don Darío', 'Marta', 'Jhon Jairo', 'Luz Dary', 'Sebastián', 'Valentina', 'El profe Hernán', 'Doña Gilma', 'Camilo'], cosas = { tienda_barrio: 'un mercadito', taller_bici: 'un neumático', restaurante: 'un almuerzo', tienda_ropa: 'un vestido arreglado', taller_carro: 'una pieza del carro', centro_comercial: 'un regalo', biblioteca: 'un libro', museo: 'una carta', iglesia: 'unas velas' };
    const quien = nombres[Math.floor(r() * nombres.length)], que = cosas[A.tipo] || 'un paquete', dif = this.director.dificultad, d = Math.hypot(A.x - x, A.y - y) + Math.hypot(B.x - A.x, B.y - A.y), limite = Math.round((d / 3.2 + 60) * (1.4 - dif * .6));
    const dilema = r() < .25 ? 'En el camino, alguien te pide ayuda para cargar algo pesado. ¿Te detienes?' : null, leccion = DATOS_REALES[Math.floor(r() * DATOS_REALES.length)];
    return { titulo: quien + ' necesita ' + que, texto: quien + ' te pide recoger ' + que + ' en ' + A.nombre + ' y llevarlo a ' + B.nombre + '.' + (c.clima && c.clima.lluvia > .4 ? ' Ojo: está lloviendo.' : ''), pilar: 'diversion', dilema, leccion,
      def: { titulo: quien + ': ' + que, pasos: [{ tipo: 'ir', x: A.x, y: A.y, radio: 14, texto: 'Recoge ' + que + ' en ' + A.nombre }, { tipo: 'ir', x: B.x, y: B.y, radio: 14, texto: 'Llévalo a ' + B.nombre }], limite, premio: Math.round((d * 120 + 300000) * (1 + dif * .5) / 100) * 100 }, desde: A, hasta: B, parque: P[0] || null };
  }
}
/* el director de ritmo: intensidad que sube con lo que pasa y baja con el tiempo; fases de tensión y respiro */
class Director {
  constructor(op = {}) { this.intensidad = 0; this.fase = 'calma'; this.tFase = 0; this.dificultad = op.dificultad ?? .5; this.exitos = 0; this.fallas = 0; this.picoMax = op.pico ?? .75; this.respiroSeg = op.respiro ?? 45; this.aburrimiento = op.aburrimiento ?? 90; }
  sumar(tipo, k) { const K = { choque: .25, persecucion: .35, prisa: .12, caida: .3, logro: .1, peligro: .4 }; this.intensidad = clamp(this.intensidad + (k ?? K[tipo] ?? .1), 0, 1); }
  resultado(exito) { if (exito) this.exitos++; else this.fallas++; const n = this.exitos + this.fallas, tasa = n ? this.exitos / n : .5; this.dificultad = clamp(this.dificultad + (tasa > .7 ? .05 : tasa < .4 ? -.07 : 0), .1, .95); }
  paso(dt) {
    this.tFase += dt; this.intensidad = Math.max(0, this.intensidad - dt * (this.fase === 'respiro' ? .03 : .012));
    if (this.fase !== 'respiro' && this.intensidad >= this.picoMax) { this.fase = 'respiro'; this.tFase = 0; }
    else if (this.fase === 'respiro' && this.tFase > this.respiroSeg && this.intensidad < .3) { this.fase = 'calma'; this.tFase = 0; }
    else if (this.fase === 'calma' && this.intensidad > .35) { this.fase = 'crece'; this.tFase = 0; }
    else if (this.fase === 'crece' && this.intensidad < .2) { this.fase = 'calma'; this.tFase = 0; }
  }
  quiere() { if (this.fase === 'respiro') return 'respiro'; if (this.fase === 'calma' && this.tFase > this.aburrimiento) return 'reto'; return 'normal'; }
}
/* ---------- ocurrencias: lo imprevisto se detecta, se corrige y se anota ---------- */
class Ocurrencias {
  constructor(op = {}) { this.reg = []; this.max = op.max || 300; this.seguros = []; this.tSeg = 0; this.t = 0; this.quieto = 0; this.dentro = 0; this.lento = 0; this.nErr = MC.errores.length; this.record = { vel: 0, z: 0 }; this.juego = op.juego || MC.juego; }
  anotar(tipo, detalle = {}, C) { const e = { tipo, t: Math.round(this.t), detalle }; if (C) { e.x = Math.round(C.x / 50) * 50; e.y = Math.round(C.y / 50) * 50; } this.reg.push(e); if (this.reg.length > this.max) this.reg.shift(); MC.emit('ocurrencia', e); return e; }
  _volver(C, tipo) { const s = this.seguros[this.seguros.length - 1]; if (s) { C.x = s.x; C.y = s.y; C.a = s.a; } C.v = 0; C.z = 0; C.vz = 0; C.enAire = false; C.paso = null; C.zPaso = 0; this.anotar(tipo, { arreglo: s ? 'volvió al último punto seguro' : 'se detuvo' }, C); }
  /* llámalo cada cuadro: { cuerpo, mundo, libro, entrada, ms } */
  vigilar(dt, o = {}) {
    this.t += dt; const C = o.cuerpo, M = o.mundo; if (!C || !M) return;
    if (![C.x, C.y, C.v, C.z, C.a].every(Number.isFinite)) return this._volver(C, 'numero_invalido');
    if (!M.dentro(C.x, C.y)) return this._volver(C, 'fuera_del_mundo');
    if (C.z < -.5 && !C.nadando && !(C.paso && C.paso.tipo === 'tunel')) { C.z = 0; this.anotar('bajo_el_piso', { arreglo: 'subió al piso' }, C); }
    const vmax = C.vmax ? C.vmax() : 30; if (Math.abs(C.v) > vmax * 2.5 + 5) { C.v = Math.sign(C.v) * vmax; this.anotar('velocidad_imposible', { arreglo: 'limitada' }, C); }
    const libre = C.paso || C.veh.clase === 'aire' || C.puede(C.x, C.y); this.dentro = libre ? 0 : this.dentro + dt; if (this.dentro > .5) { this.dentro = 0; this._volver(C, 'atrapado'); }
    const quiere = o.entrada && ((o.entrada.stick && o.entrada.stick.m > .5) || Math.abs(o.entrada.acel || 0) > .5); if (quiere && Math.abs(C.v) < .15) this.quieto += dt; else this.quieto = 0; if (this.quieto > 4) { this.quieto = 0; this.anotar('atascado', { sugerencia: 'botón «salir de aquí»' }, C); MC.emit('atascado', C); }
    if (o.libro && this.t % 5 < dt && !o.libro.cuadra()) this.anotar('libro_descuadrado', {});
    if (o.ms != null) { this.lento = o.ms > 50 ? this.lento + dt : 0; if (this.lento > 5) { this.lento = 0; this.anotar('cuadros_lentos', { ms: Math.round(o.ms), sugerencia: 'bajar la calidad' }); } }
    if (MC.errores.length > this.nErr) { for (const m of MC.errores.slice(this.nErr)) this.anotar('error', { m: String(m).slice(0, 160) }); this.nErr = MC.errores.length; }
    /* puntos seguros: cada segundo, si está en un lugar válido y en el piso */
    this.tSeg += dt; if (this.tSeg > 1 && libre && !C.enAire) { this.tSeg = 0; this.seguros.push({ x: C.x, y: C.y, a: C.a }); if (this.seguros.length > 12) this.seguros.shift(); }
    /* momentos que nadie diseñó pero valen la pena (retroalimentación para mejorar el juego) */
    if (Math.abs(C.v) > this.record.vel + 3 && Math.abs(C.v) > 12) { this.record.vel = Math.abs(C.v); this.anotar('momento', { que: 'récord de velocidad', kmh: Math.round(this.record.vel * 3.6) }, C); }
    if (C.z > Math.max(2.5, this.record.z + 1) && C.veh.clase !== 'aire') { this.record.z = C.z; this.anotar('momento', { que: 'salto enorme', m: +C.z.toFixed(1) }, C); }
  }
  /* «sácame de aquí»: a la vía más cercana (el botón de emergencia que todo mundo abierto necesita) */
  rescatar(C, M) { const v = M.viaCercana(C.x, C.y, 300); if (v) { C.x = v.x; C.y = v.y; C.a = v.ang; } C.v = 0; C.z = 0; C.paso = null; C.zPaso = 0; this.anotar('rescate', {}, C); }
  resumen() { const n = {}; for (const e of this.reg) n[e.tipo] = (n[e.tipo] || 0) + 1; return n; }
  /* reporte para mejorar el motor: sin datos personales (posiciones redondeadas a 50 m, sin direcciones ni nombres) */
  exportar() { return { motor: MC.version, juego: this.juego, dia: new Date().toISOString().slice(0, 10), resumen: this.resumen(), eventos: this.reg.slice(-150) }; }
}
Object.assign(MC, { Historias, Director, Ocurrencias, PILARES });

/* ---- js/86-necesidades.js ---- */
/* =====================================================================
   NECESIDADES Y OBJETOS INTELIGENTES · la casa viva de Los Sims
   «Las personas son simples y los objetos son inteligentes» (Will Wright): cada objeto ANUNCIA qué necesidad
   satisface y cuánto. La persona suma los anuncios según qué tan urgente es cada necesidad, los atenúa por la
   distancia y elige el mejor (con un poco de azar entre los mejores para que no sea un robot).
   - 8 necesidades (0–100): hambre, energía, vejiga, higiene, diversión, social, comodidad y AMBIENTE.
   - El AMBIENTE de cada cuarto (como el «room» de Los Sims): decoración, luz (ventanas), tamaño y orden.
     Decorar la casa (MC.Hogar) sube el ánimo de quien vive ahí.
   - MC.Habitante vive solo dentro de un plano (MC.Interiores): camina, usa la nevera, duerme, ve televisión…
   ===================================================================== */
const MOTIVOS = ['hambre', 'energia', 'vejiga', 'higiene', 'diversion', 'social', 'comodidad', 'ambiente'];
const DECAE = { hambre: 6, energia: 4, vejiga: 8, higiene: 3, diversion: 5, social: 3, comodidad: 4, ambiente: 0 };   // puntos por hora de juego
const ANUNCIOS = {   // objeto: { necesidad: puntos que da, min: duración en minutos de juego, accion }
  nevera: { hambre: 35, min: 15, accion: 'come algo' }, estufa: { hambre: 55, min: 35, accion: 'cocina' }, comedor: { hambre: 25, social: 15, min: 25, accion: 'almuerza' },
  cama: { energia: 70, comodidad: 20, min: 240, accion: 'duerme' }, cama_sencilla: { energia: 65, comodidad: 15, min: 240, accion: 'duerme' }, hamaca: { energia: 25, comodidad: 30, min: 40, accion: 'se mece en la hamaca' },
  inodoro: { vejiga: 90, min: 5, accion: 'va al baño' }, ducha: { higiene: 80, min: 15, accion: 'se baña' }, lavamanos: { higiene: 20, min: 3, accion: 'se lava las manos' },
  sofa: { comodidad: 35, diversion: 10, min: 30, accion: 'descansa en el sofá' }, sofa_l: { comodidad: 40, diversion: 10, min: 30, accion: 'descansa en el sofá' }, sillon: { comodidad: 30, min: 25, accion: 'se sienta' },
  tv: { diversion: 40, min: 45, accion: 've televisión' }, consola: { diversion: 55, min: 50, accion: 'juega videojuegos' }, biblioteca: { diversion: 30, min: 40, accion: 'lee un libro' },
  escritorio: { diversion: 15, min: 60, accion: 'estudia' }, acuario: { diversion: 15, ambiente: 5, min: 10, accion: 'mira los peces' }, matera: { ambiente: 3, min: 5, accion: 'riega la matera' }, puff: { comodidad: 20, min: 20, accion: 'se recuesta' },
  lavadero: { higiene: 10, min: 20, accion: 'lava la ropa' }, banco_trabajo: { diversion: 30, min: 60, accion: 'arregla algo' }
};
const DECORA = { matera: 6, cuadro: 7, tapete: 6, lampara: 5, acuario: 10, cojines: 3, hamaca: 4, biblioteca: 4, puff: 2, tv: 2 };
const Necesidades = {
  MOTIVOS, DECAE, ANUNCIOS, DECORA,
  nuevas(v = 70) { return Object.fromEntries(MOTIVOS.map(m => [m, v])); },
  /* urgencia: una necesidad baja pesa mucho más que una media (curva cuadrática, como en Los Sims) */
  urgencia(v) { const t = clamp((100 - v) / 100, 0, 1); return t * t * 1.6 + t * .2; },
  /* puntaje de un objeto para estas necesidades, atenuado por la distancia (m) */
  puntaje(N, tipo, dist = 0) { const A = ANUNCIOS[tipo]; if (!A) return 0; let s = 0; for (const m of MOTIVOS) if (A[m]) s += A[m] * Necesidades.urgencia(N[m]); return s / (1 + dist / 6); },
  /* el ambiente de un cuarto (0–100): decoración por m², luz de las ventanas, tamaño y que no esté abarrotado */
  ambienteCuarto(P, c) {
    const area = Math.max(1, c.w * c.h), dentro = m => m.x + m.w / 2 >= c.x && m.x + m.w / 2 <= c.x + c.w && m.y + m.h / 2 >= c.y && m.y + m.h / 2 <= c.y + c.h, M = P.muebles.filter(dentro);
    let deco = 0; for (const m of M) deco += DECORA[m.tipo] || 0; const ocupado = M.reduce((a, m) => a + (m.tipo === 'tapete' || m.tipo === 'cuadro' ? 0 : m.w * m.h), 0) / area;
    const luz = P.ventanas.filter(v => (v.vertical ? Math.abs(v.x - c.x) < .05 || Math.abs(v.x - c.x - c.w) < .05 : Math.abs(v.y - c.y) < .05 || Math.abs(v.y - c.y - c.h) < .05) && (v.vertical ? v.y >= c.y && v.y <= c.y + c.h : v.x >= c.x && v.x <= c.x + c.w)).length;
    return Math.round(clamp(30 + Math.min(35, deco * 18 / Math.sqrt(area)) + Math.min(20, luz * 10) + Math.min(10, area / 2) - Math.max(0, ocupado - .45) * 60, 0, 100));
  },
  /* ambiente de la casa: promedio de los cuartos de estar (no cuenta baños ni ropas) */
  ambiente(P) { const C = P.cuartos.filter(c => !['bano', 'ropas', 'bodega', 'pasillo'].includes(c.tipo)); if (!C.length) return 50; const v = C.map(c => Necesidades.ambienteCuarto(P, c)); return Math.round(v.reduce((a, b) => a + b, 0) / v.length); }
};
/* alguien que vive solo dentro de un plano: elige, camina, usa y vuelve a elegir */
class Habitante {
  constructor(P, op = {}) { this.P = P; const ent = P.puertas.find(p => p.entrada) || { x: P.ancho / 2, y: .6 }; this.x = op.x ?? ent.x; this.y = op.y ?? Math.max(.7, ent.y + .7); this.a = 0; this.fase = 0; this.N = Necesidades.nuevas(op.inicial ?? 65); this.r = mulberry32(op.semilla || 3); this.accion = null; this.objetivo = null; this.t = 0; this.aspecto = op.aspecto || null; this.nombre = op.nombre || 'Alguien'; }
  /* dt en segundos reales; minPorSeg: minutos de juego por segundo */
  paso(dt, minPorSeg = 1) {
    const horas = dt * minPorSeg / 60; for (const m of MOTIVOS) this.N[m] = clamp(this.N[m] - DECAE[m] * horas, 0, 100); this.N.ambiente = Necesidades.ambiente(this.P);
    if (this.accion) { const A = ANUNCIOS[this.accion.tipo], k = dt * minPorSeg / A.min; for (const m of MOTIVOS) if (A[m]) this.N[m] = clamp(this.N[m] + A[m] * k, 0, 100); this.accion.resto -= dt * minPorSeg; if (this.accion.resto <= 0) this.accion = null; return this; }
    if (!this.objetivo) this.elegir();
    if (this.objetivo) { const o = this.objetivo, tx = o.x + o.w / 2, ty = o.y + o.h / 2, d = Math.hypot(tx - this.x, ty - this.y);
      if (d < Math.max(o.w, o.h) / 2 + .55) { this.accion = { tipo: o.tipo, resto: ANUNCIOS[o.tipo].min, texto: ANUNCIOS[o.tipo].accion }; this.objetivo = null; MC.emit('habitante', { h: this, accion: this.accion }); return this; }
      const v = 1.3 * dt, ux = (tx - this.x) / d, uy = (ty - this.y) / d; let nx = this.x + ux * v, ny = this.y + uy * v; const S = this.P.solido;
      if (!S(nx, ny)) { this.x = nx; this.y = ny; } else if (!S(nx, this.y)) this.x = nx; else if (!S(this.x, ny)) this.y = ny; else { this.atasco = (this.atasco || 0) + dt; if (this.atasco > 1.5) { this.atasco = 0; this.objetivo = null; this.evitar = o; } }
      this.a = Math.atan2(uy, ux); this.fase += v * 3; }
    return this;
  }
  /* los tres mejores anuncios y uno de ellos al azar (ponderado): vivo, pero no robótico */
  elegir() { const L = []; for (const m of this.P.muebles) { if (m === this.evitar || !ANUNCIOS[m.tipo]) continue; const s = Necesidades.puntaje(this.N, m.tipo, Math.hypot(m.x + m.w / 2 - this.x, m.y + m.h / 2 - this.y)); if (s > .5) L.push([s, m]); } L.sort((a, b) => b[0] - a[0]); const T = L.slice(0, 3).filter(q => q[0] >= L[0][0] * .6); /* solo los que valen casi tanto como el mejor */ if (!T.length) return null; const tot = T.reduce((a, q) => a + q[0], 0); let x = this.r() * tot; for (const [s, m] of T) { x -= s; if (x <= 0) { this.objetivo = m; this.evitar = null; return m; } } this.objetivo = T[0][1]; return T[0][1]; }
  /* la necesidad más baja (para mostrar un globito de pensamiento) */
  masUrgente() { let b = null; for (const m of MOTIVOS) if (m !== 'ambiente' && (!b || this.N[m] < this.N[b])) b = m; return b; }
}
Object.assign(MC, { Necesidades, Habitante });

/* ---- js/87-pieles.js ---- */
/* =====================================================================
   PIELES · un paquete de arte en sprites (de Gemini, ChatGPT o un artista) se vuelve una piel de MC.arte, con respaldo procedural en CADA gancho
   - El paquete trae atlas (imagen + mapa de cuadros, en metros reales), íconos SVG, hitos, paletas…: MC.Pieles.instalar(id, paquete, op).
   - Cada gancho dibuja su sprite y, si no está o todavía no cargó, dibuja el del motor. El arte nuevo nunca deja un hueco.
   - Tamaños proporcionados: árboles, rocas y personas se dibujan a la medida del mundo (la sombra calculada coincide con el dibujo).
   - Partes: se elige qué usa cada juego ('prop', 'naturaleza', 'fachada', 'personaje', 'vehiculo', 'animal', 'mueble'). Lo que no se elige sigue procedural.
   Uso: MC.Pieles.instalar('gemini', MC_ARTE.gemini, { partes: ['prop', 'naturaleza', 'personaje'], pixel: () => vistas.pixel });
        MC.arte.usar('gemini') · MC.arte.usar('motor') · MC.Pieles.icono('vista_cenital', 20) → <svg>
   El paquete de Gemini (G‑M0…G‑M15) vive en arte/gemini/ y se compila en el HTML del juego con "arte": ["gemini"] en su juego.json.
   ===================================================================== */
const Pieles = {
  paquetes: {},
  PARTES: ['prop', 'naturaleza', 'fachada', 'personaje', 'vehiculo', 'animal', 'mueble', 'arbol', 'textura'],
  /* registra los atlas y la piel; devuelve una promesa que se cumple cuando las imágenes cargaron */
  instalar(id, pack, op = {}) {
    if (!pack || !pack.atlases) throw new Error('Pieles: el paquete ' + id + ' no trae atlas');
    const ids = Object.keys(pack.atlases), partes = new Set(op.partes || this.PARTES), px = () => !!(op.pixel && op.pixel()), M = () => MC.arte.pieles.motor;
    for (const aid of ids) { const a = pack.atlases[aid]; Sprites.atlas(aid, { imagen: a.imagen, cuadros: a.cuadros, anim: a.anim, metros: a.metros, magenta: a.magenta === true }); }
    const de = sufijo => ids.find(a => a.endsWith('_' + sufijo)) || null, AP = de('p'), AV = de('v'), AA = de('a'), AM = de('m'), AU = de('u'), AW = de('w');
    const tiene = ref => { const [aid, n] = ref.split('/'), A = Sprites.atlases.get(aid); return !!(A && A.listo && (A.cuadros[n] || A.anim[n])); };
    const S = (ref, g, x, y, pxm, o = {}) => tiene(ref) && Sprites.dibujar(g, ref, x, y, pxm, Object.assign({ pixel: px() }, o));
    /* de noche: una copia oscurecida del atlas, hecha una sola vez (los sprites no reciben la luz de la hora como lo procedural) */
    const nocturno = aid => { const A = Sprites.atlases.get(aid); if (!A || !A.listo || typeof document === 'undefined') return; try { const c = lienzo(A.img.width, A.img.height), g = c.getContext('2d'); g.drawImage(A.img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(12,22,52,.58)'; g.fillRect(0, 0, c.width, c.height); Sprites.atlas(aid + '_noche', { imagen: c, cuadros: A.cuadros, anim: A.anim, metros: A.metros, magenta: false }); } catch (e) { MC.falla('pieles', e); } };
    const N = (aid, D) => D && D.noche > .4 && Sprites.atlases.get(aid + '_noche') ? aid + '_noche' : aid;
    const sinTilde = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
    const ARBOLES = op.arboles || ['arbol_guayacan_amarillo', 'arbol_guayacan_rosado', 'arbol_ceiba', 'arbol_palma', 'arbol_mango'];
    const piel = { fachadasEstaticas: true };
    const pavimento = de('suelos');
    if (partes.has('textura') && pavimento) {
      const fuentes = new Map();
      piel.textura = (material) => {
        const atlas = Sprites.atlases.get(pavimento);
        if (!atlas || !atlas.listo || !atlas.cuadros[material]) return null;
        if (!fuentes.has(material)) {
          const [x, y, w, h] = atlas.cuadros[material];
          const tile = lienzo(w, h);
          tile.getContext('2d').drawImage(atlas.img, x, y, w, h, 0, 0, w, h);
          fuentes.set(material, { imagen: tile, metros: atlas.metros[material] });
        }
        return fuentes.get(material);
      };
    }
    if (partes.has('prop') && AU) piel.prop = (g, p, x, y, z, D) => {
      if (p.t === 'cebra' || (p.t === 'arbol' && op.arboles === false)) return false; const cen = D && D.modo === 'cenital', noche = D && D.noche > .3, v = p.v || 0;
      const U = N(AU, D); if (p.t === 'arbol') { const alto = 5 + v * 4, copa = 3.2 + v * 2.4; return S(U + '/' + ARBOLES[Math.floor(v * 5) % ARBOLES.length] + (cen ? '_cen' : ''), g, x, y, z, { metros: cen ? copa : alto * 1.12 }); }   // a la medida del árbol del motor
      if (p.t === 'poste') return S(AU + '/' + (cen ? 'poste_cen' : noche ? 'poste_noche' : 'poste_dia'), g, x, y, z);   // el poste encendido no se oscurece
      if (cen) return S(U + '/' + p.t + '_cen', g, x, y, z);   // sin vista de arriba: el del motor
      return S(U + '/' + p.t, g, x, y, z);
    };
    if (partes.has('naturaleza') && AU) piel.naturaleza = (g, p, x, y, z, D) => {
      const cen = D && D.modo === 'cenital', s = p.s || 1, U = N(AU, D);
      if (p.t === 'roca') return S(U + '/roca_' + (s < .6 ? 0 : s < 1.1 ? 1 : s < 1.8 ? 2 : s < 2.5 ? 3 : 4), g, x, y, z, { metros: Math.max(.3, s * (cen ? 1.1 : .9)) });
      if (cen) return false;   // palmas, frailejones y juncos de lado no sirven desde arriba
      if (p.t === 'palma') return S(U + '/' + (s > 1.1 ? 'palma_cera' : 'palma_coco'), g, x, y, z, { metros: s > 1.1 ? 10 + s * 3 : 6 + s * 2 });
      return S(U + '/' + p.t, g, x, y, z);
    };
    if (partes.has('fachada') && AW) piel.fachadaModulo = (g, tipo, x, y, w, h, lit, D) => {
      const zona = (D && D.zona) || op.zona || 'pueblo', n = AW + '/' + zona + '_' + tipo + '_v' + (D?.varianteFachada ?? 0) + '_' + (lit ? 'noche' : 'dia');
      if (!tiene(n)) return false; const [sx, sy, sw, sh] = Sprites.atlases.get(AW).cuadros[n.split('/')[1]], A = Sprites.atlases.get(AW), r = op.recorte || [.18, .12, .64, .62];   // solo el vano (ventana, puerta o vitrina), no el muro del módulo
      g.drawImage(A.img, sx + sw * r[0], sy + sh * r[1], sw * r[2], sh * r[3], x, y, w, h); return true;
    };
    if (partes.has('personaje') && AP) {
      const tieneReparto = !!pack.atlases[AP].anim?.persona0_quieto;
      const atlasCel = AP + '_cel';
      function prepararCel() {
        if (Sprites.atlases.has(atlasCel)) return;
        const a = Sprites.atlases.get(AP);
        if (!a.listo) return;
        const c = lienzo(a.img.width,a.img.height), ctx = c.getContext('2d');
        ctx.drawImage(a.img,0,0);
        const img = ctx.getImageData(0,0,c.width,c.height), p=img.data, fila=c.width*4;
        for (let i=0; i<p.length; i+=4) {
          if (p[i+3]<32) continue;
          if (p[i-1]<48 || p[i+7]<48 || p[i-fila+3]<48 || p[i+fila+3]<48) {
            p[i]=33; p[i+1]=32; p[i+2]=37; continue;
          }
          const luz=.2126*p[i]+.7152*p[i+1]+.0722*p[i+2];
          const tono=(luz<76 ? 48 : luz<152 ? 120 : 202)/Math.max(1,luz);
          p[i]*=tono; p[i+1]*=tono; p[i+2]*=tono;
        }
        ctx.putImageData(img,0,0);
        Sprites.atlas(atlasCel,{imagen:c,cuadros:a.cuadros,metros:a.metros,anim:a.anim,magenta:false});
      }
      const figura = A => Number.isInteger(A?.figura) ? clamp(A.figura, 0, 5) : A?.cCasco ? 2 : Math.abs(A?.camisa | 0) % 6;
      piel.personajeLado = (g, J, A, x, y, esc, dir) => {
        const i = figura(A), prefijo = tieneReparto ? (i === 4 && ['comic','manga','anime'].includes(MC.estilo) ? 'cel' : i === 4 ? 'persona' : 'persona' + i) : 'persona';
        const estado = J?.estado || 'quieto';
        const enCel = tieneReparto && ['comic','manga','anime'].includes(MC.estilo) && i !== 4;
        if (enCel) prepararCel();
        const ref = (enCel ? atlasCel : AP) + '/' + prefijo + '_' + estado;
        const pxm = tieneReparto ? esc * ((A?.alto || 1.7) / 1.7) : esc;
        if (!(op.respetarAspecto && A?.propio) && S(ref,g,x,y,pxm,{fase:J?.fase, espejo:dir < 0, metros:tieneReparto ? undefined : A?.alto || 1.68})) return true;
        return M().personajeLado(g, J, A, x, y, esc, dir);
      };
      piel.personajeArriba = (g, J, A, x, y, z, ang) => {
        const ref = tieneReparto ? 'persona' + figura(A) + '_cen_der' : 'persona_cen_' + (J?.estado || 'quieto') + '_der';
        if (!(op.respetarAspecto && A?.propio) && S(AP + '/' + ref, g, x, y, z, {rot:ang || 0})) return true;
        return M().personajeArriba(g, J, A, x, y, z, ang);
      };
    }
    if (partes.has('vehiculo') && AV) piel.vehiculoLado = (g, V, x, y, esc, dir, C) => S(AV + '/' + ((V && V.id) || 'bici') + '_lado', g, x, y, esc, { espejo: dir < 0 }) || (M().vehiculoLado ? M().vehiculoLado(g, V, x, y, esc, dir, C) : false);
    if (partes.has('vehiculo') && AV) piel.vehiculoArriba = (g, V, x, y, z, ang) => S(AV + '/' + V.id + '_arriba', g, x, y, z, {rot:ang});
    if (partes.has('animal') && AA) piel.animalLado = (g, a, x, y, esc, dir, t, v) => S(AA + '/' + ((a && a.id) || 'perro_criollo') + '_lado', g, x, y, esc, { espejo: dir < 0 }) || M().animalLado(g, a, x, y, esc, dir, t, v);
    /* árboles (2.6): arbol_<especie>_lado|arriba[_v1|_v2] en cualquier atlas del paquete; si no está, el árbol procedural de MC.Arboleda */
    const AT = partes.has('arbol') ? ids.find(a => Object.keys(pack.atlases[a].cuadros || {}).some(n => /^arbol_[a-z_]+_(lado|arriba)/.test(n))) : null;
    if (AT) piel.arbol = (g, t, vista, x, y, pxm) => { const b = AT + '/arbol_' + t.e + '_' + vista, ref = t.v && tiene(b + '_v' + t.v) ? b + '_v' + t.v : tiene(b) ? b : null; if (!ref) return false; const E = MC.Arboleda && MC.Arboleda.ESPECIES[t.e]; return Sprites.dibujar(g, ref, x, y, pxm, { metros: vista === 'lado' ? t.h : t.r * 2 * (E ? E.ancho : 1), espejo: t.espejo, pixel: px() }); };
    if (partes.has('mueble') && AM) piel.mueble = (g, m, estilo) => {
      const n = sinTilde(m.tipo) + '_' + (estilo || 'paisa'), A = Sprites.atlases.get(AM); if (!A || !A.listo || !A.cuadros[n]) return false;
      const [sx, sy, sw, sh] = A.cuadros[n]; g.drawImage(A.img, sx, sy, sw, sh, m.x, m.y, m.w, m.h); return true;
    };
    MC.arte.registrar(id, piel); this.paquetes[id] = { pack, ids, partes: [...partes] };
    const listo = Promise.all(ids.map(a => Sprites.atlases.get(a).carga)).then(cargas => {
      const fallidos = ids.filter((a, i) => !cargas[i]);
      if (fallidos.length) throw new Error('Atlas sin imagen: ' + fallidos.join(', '));
      if (AU && op.noche !== false) nocturno(AU);
      if (op.usar) MC.arte.usar(id);
      return ids;
    });

    return listo;
  },
  /* un ícono SVG del paquete (24 × 24, del color del texto) o '' si no está */
  icono(id, px = 20, paquete) {
    for (const k of paquete ? [paquete] : Object.keys(this.paquetes)) { const I = this.paquetes[k] && this.paquetes[k].pack.iconos, d = I && I[id]; if (d) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (d.viewBox || '0 0 24 24') + '" width="' + px + '" height="' + px + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d.pathSvg + '</svg>'; }
    return '';
  },
  /* cuántos sprites pidió el juego que no estaban (para la auditoría de la IA de arte) */
  faltan() { return [...Sprites.faltan]; }
};
MC.Pieles = Pieles;

/* ---- js/88-vida.js ---- */
/* =====================================================================
   VIDA · peso y vida en el mundo (2.7)
   Lo que aprendieron los juegos que «se sienten bien» (Vlambeer, «The Art of Screenshake»; los 12 principios de la
   animación de Disney; Spider‑Verse con su animación a dos cuadros y sus onomatopeyas), puesto en el motor, barato:
   - PESO: al aterrizar, el cuerpo se aplasta y se estira (squash and stretch), la cámara se sacude según la caída
     y salta polvo. Al frenar o acelerar fuerte, el vehículo cabecea y levanta polvo. En un choque, el mundo se
     congela 60 ms (hitstop: el golpe «pesa») y suena la onomatopeya en los estilos dibujados («¡PUM!»).
   - VIDA: bandadas de pájaros con su sombra en el piso, hojas que caen de los árboles cercanos, salpicaduras en el
     agua y polvo en la tierra. Todo en un fondo común de 260 partículas, sin crear objetos por cuadro.
   Lo llama MC.Vista2D al final de cada dibujo: MC.Vida.dibujar(D). Se apaga con op.vida = false.
   ===================================================================== */
/* 2.8 · de la entrega maestra de referencias (docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md):
   - FAUNA QUE REACCIONA (R12, la playa en Godot): palomas en el piso que comen y alzan vuelo cuando el jugador se
     acerca rápido; se vuelven una bandada que se aleja.
   - HUELLAS QUE QUEDAN (R12 y R19, arena y nieve): surcos de las llantas y pisadas en arena, tierra, nieve y barro
     (pasto mojado cuando llueve). Duran unos minutos y se desvanecen; son marcas, no deformación de la malla (§16.5).
   - ACCESIBILIDAD (§10.3 y §13): MC.opciones.particulas (0 a 1) baja el polvo, el agua y las hojas. */
const Vida = {
  MAX: 260, P: [], aves: [], onos: [], palomas: [], marcas: [], MAXM: 700, _t: null, _pv: null,
  /* partículas: polvo, agua, hoja o chispa en metros del mundo (z = altura) */
  emitir(tipo, x, y, n = 6, op = {}) {
    n = Math.round(n * (MC.opciones ? MC.opciones.particulas ?? 1 : 1)); for (let i = 0; i < n; i++) {
      if (this.P.length >= this.MAX) this.P.shift(); const a = Math.random() * TAU, s = (op.vel ?? 1.5) * (.4 + Math.random() * .8);
      this.P.push({ tipo, x: x + (Math.random() - .5) * (op.r ?? .6), y: y + (Math.random() - .5) * (op.r ?? .6), z: op.z ?? .1, vx: Math.cos(a) * s + (op.vx || 0), vy: Math.sin(a) * s + (op.vy || 0), vz: (op.vz ?? 1.2) * (.5 + Math.random()), t: 0, vida: op.vida ?? (tipo === 'hoja' ? 4 : tipo === 'agua' ? .7 : 1.1), r: op.tam ?? (tipo === 'polvo' ? .35 : .12), fase: Math.random() * TAU });
    }
  },
  onomatopeya(x, y, texto, color = '#ffd400') { if (this.onos.length > 6) this.onos.shift(); this.onos.push({ x, y, texto, color, t: 0 }); },
  /* lo que pasa con el jugador: aterrizajes, frenazos, agua y choques */
  _jugador(E, dt) {
    const C = E.jugador && E.jugador.cuerpo; if (!C) return; if (this._cuerpo !== C) { this._cuerpo = C; this._pv = null; } const pv = this._pv || (this._pv = { aire: !!C.enAire, vz: 0, v: C.v || 0, agua: 0 });
    const acel = dt > 0 ? ((C.v || 0) - pv.v) / dt : 0; C._acel = (C._acel || 0) * .8 + acel * .2;
    if (pv.aire && !C.enAire && pv.vz < -2.2) {   // aterrizó: aplasta, sacude y levanta polvo según la caída
      const f = clamp((-pv.vz - 2.2) / 8, .15, 1); C._squash = { t0: E.t || 0, k: f }; this.emitir(C.nadando ? 'agua' : 'polvo', C.x, C.y, 6 + (f * 10 | 0), { vel: 1.5 + f * 2.5, vz: .6 }); if (E.camara && E.camara.sacudir) E.camara.sacudir(.12 + f * .3); if (f > .4) this.onomatopeya(C.x, C.y, '¡TUM!'); MC.emit('aterriza', { fuerza: f });
    }
    if (!C.enAire && !C.nadando && Math.abs(C._acel) > 6 && Math.abs(C.v) > 2.5 && Math.random() < .5) { const b = Math.sign(C.v) * -1; this.emitir('polvo', C.x + Math.cos(C.a) * b * .8, C.y + Math.sin(C.a) * b * .8, 1, { vel: .6, vz: .4 }); }   // frenazo o arrancón
    if ((C.nadando || C.vadeando) && Math.abs(C.v) > .6) { pv.agua -= dt; if (pv.agua <= 0) { pv.agua = .12; this.emitir('agua', C.x, C.y, 3, { vel: 1.2, vz: 1.8 }); } }
    pv.aire = !!C.enAire; pv.vz = C.vz || 0; pv.v = C.v || 0;
    this._huellas(E, C);
  },
  /* el suelo blando guarda la marca: arena, tierra del monte, nieve, y el pasto o la tierra cuando llueve (barro) */
  suelo(E, x, y) {
    const M = E.mundo; if (!M || !M.suelo) return null; const tt = M.suelo(x, y), llueve = E.clima && /lluvia|tormenta|aguacero/.test(String(E.clima.estado || ''));
    return tt === TT.ARENA ? 'arena' : tt === TT.NIEVE ? 'nieve' : tt === TT.MOUNT ? (llueve ? 'barro' : 'tierra') : tt === TT.GRASS && llueve ? 'barro' : null;
  },
  _huellas(E, C) {
    if (C.enAire || C.nadando || C.vadeando) { C._uh = null; return; } const s = this.suelo(E, C.x, C.y); if (!s) { C._uh = null; return; }
    const u = C._uh; if (u && Math.hypot(C.x - u.x, C.y - u.y) < .55) return; C._uh = { x: C.x, y: C.y };
    const V = C.veh || {}, pie = V.clase === 'pie' || !V.clase, nx = -Math.sin(C.a), ny = Math.cos(C.a), t = E.t || 0;
    if (pie) { const lado = (this._paso = !this._paso) ? 1 : -1; this.marcas.push({ x: C.x + nx * .14 * lado, y: C.y + ny * .14 * lado, a: C.a, w: .12, l: .26, s, t, pie: true }); }
    else if (u) { const w = Math.max(.12, (V.ancho || .6) * .18), off = (V.ancho || .6) * .38, dos = V.clase !== 'rueda' && V.clase !== 'moto'; for (const k of dos ? [-1, 1] : [0]) this.marcas.push({ x0: u.x + nx * off * k, y0: u.y + ny * off * k, x1: C.x + nx * off * k, y1: C.y + ny * off * k, w, s, t }); }
    if (this.marcas.length > this.MAXM) this.marcas.splice(0, this.marcas.length - this.MAXM);
  },
  /* las huellas en el piso, antes de los objetos (las llama MC.Vista2D) */
  piso(D) {
    const { g, pr, z, E } = D; if (!this.marcas.length || z < .9) return; const t = E.t || 0, COL = { arena: '92,70,40', tierra: '58,42,26', barro: '44,30,18', nieve: '120,135,165' };
    let viejas = 0; while (viejas < this.marcas.length && t - this.marcas[viejas].t > 240) viejas++; if (viejas) this.marcas.splice(0, viejas);
    /* en lote: un trazo por suelo y por edad (4 tramos), no uno por huella: cientos de huellas cuestan como 16 */
    const G = new Map(); for (const m of this.marcas) { const k = m.s + ((t - m.t) / 60 | 0) + (m.pie ? 'p' : 'l'); let L = G.get(k); if (!L) G.set(k, L = []); L.push(m); }
    g.save(); g.lineCap = 'round';
    for (const L of G.values()) { const m0 = L[0], a = (m0.s === 'nieve' ? .5 : .32) * clamp(1 - (t - m0.t) / 240, 0, 1), col = 'rgba(' + COL[m0.s] + ',' + a.toFixed(3) + ')'; g.beginPath();
      if (m0.pie) { for (const m of L) { const [x, y] = pr(m.x, m.y, 0), rx = Math.max(.6, m.l * z * .5); g.moveTo(x + rx, y); g.ellipse(x, y, rx, Math.max(.5, m.w * z * .5 * (D.P.k || 1)), m.a + (D.P.yaw || 0), 0, TAU); } g.fillStyle = col; g.fill(); }
      else { for (const m of L) { const [x0, y0] = pr(m.x0, m.y0, 0), [x1, y1] = pr(m.x1, m.y1, 0); g.moveTo(x0, y0); g.lineTo(x1, y1); } g.strokeStyle = col; g.lineWidth = Math.max(1, m0.w * z); g.stroke(); } }
    g.restore();
  },
  /* palomas en el piso cerca del jugador; alzan vuelo si se acerca rápido */
  _palomas(E, dt) {
    const C = E.jugador && E.jugador.cuerpo, M = E.mundo; if (!C || !M || !M.suelo) return; const t = E.t || 0;
    if (this.palomas.length < 3 && Math.random() < dt * .5) { const a = Math.random() * TAU, d = 35 + Math.random() * 30, x = C.x + Math.cos(a) * d, y = C.y + Math.sin(a) * d, tt = M.suelo(x, y);
      if ((tt === TT.PLAZA || tt === TT.WALK || tt === TT.GRASS || tt === TT.BRICK) && !(M.edificioEn && M.edificioEn(x, y, 1))) { const n = 4 + (Math.random() * 6 | 0), m = []; for (let i = 0; i < n; i++) m.push({ dx: (Math.random() - .5) * 4, dy: (Math.random() - .5) * 4, a: Math.random() * TAU, f: Math.random() * TAU }); this.palomas.push({ x, y, m, t0: t }); } }
    for (let i = this.palomas.length - 1; i >= 0; i--) { const p = this.palomas[i], d = Math.hypot(C.x - p.x, C.y - p.y), v = Math.abs(C.v || 0);
      if (d > 110) { this.palomas.splice(i, 1); continue; }
      if (d < 5 + v * .7 && (v > 1.2 || d < 2.5)) {   // ¡se asustan! la bandada sale en contra del jugador
        const a = Math.atan2(p.y - C.y, p.x - C.x) + (Math.random() - .5) * .6, b = { x: p.x, y: p.y, z: 1, sube: true, asustada: true, a, v: 9 + Math.random() * 3, n: p.m.length, garza: false, m: p.m.map((q, k) => [q.dx, q.dy, q.f]) };
        this.aves.push(b); this.palomas.splice(i, 1); this.emitir('pluma', p.x, p.y, 3, { vel: 1.2, vz: 1.5, tam: .1, vida: 1.6 }); MC.emit('fauna', { tipo: 'palomas', x: p.x, y: p.y }); continue; }
      for (const q of p.m) { q.a += (Math.random() - .5) * dt * 2; if (Math.random() < dt * .4) { q.dx += Math.cos(q.a) * .3; q.dy += Math.sin(q.a) * .3; } }
    }
  },
  /* bandadas: unas pocas, siempre cerca de la cámara (garzas y palomas sobre el pueblo) */
  _aves(E, dt) {
    const Cm = E.camara; if (!Cm) return; const R = 260;
    while (this.aves.filter(b => b.n > 0 && !b.asustada).length < 3 && this.aves.length < 8) { const a = Math.random() * TAU, n = 4 + (Math.random() * 6 | 0), cx = Cm.x - Math.cos(a) * R, cy = Cm.y - Math.sin(a) * R, rumbo = a + (Math.random() - .5) * .6, b = { x: cx, y: cy, z: 22 + Math.random() * 25, a: rumbo, v: 7 + Math.random() * 4, n, garza: Math.random() < .35, m: [] }; for (let i = 0; i < n; i++) b.m.push([(-Math.floor((i + 1) / 2)) * 2.2, (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 1.7, Math.random() * TAU]); this.aves.push(b); }
    for (let i = this.aves.length - 1; i >= 0; i--) { const b = this.aves[i]; if (b.sube) { b.z = Math.min(18, b.z + dt * 7); if (b.z >= 18) b.sube = false; } b.a += Math.sin((E.t || 0) * .3 + i) * .05 * dt; b.x += Math.cos(b.a) * b.v * dt; b.y += Math.sin(b.a) * b.v * dt; if (Math.hypot(b.x - Cm.x, b.y - Cm.y) > R * 1.3) this.aves.splice(i, 1); }
  },
  _hojas(E, dt) {
    const C = E.jugador && E.jugador.cuerpo; if (!C || !MC.Arboleda || Math.random() > dt * 1.2) return; const L = MC.Arboleda.en(E.mundo, C.x - 25, C.y - 25, C.x + 25, C.y + 25, 30); if (!L.length) return;
    const t = L[(Math.random() * L.length) | 0]; this.emitir('hoja', t.x + (Math.random() - .5) * t.r, t.y + (Math.random() - .5) * t.r, 1, { z: t.h * .7, vel: .4, vz: 0, vida: 5, tam: .14 });
  },
  actualizar(E) {
    const t = E.t || 0, dt = this._t == null ? 0 : clamp(t - this._t, 0, .1); this._t = t; if (!dt) return;
    this._jugador(E, dt); this._aves(E, dt); this._hojas(E, dt); this._palomas(E, dt);
    for (let i = this.P.length - 1; i >= 0; i--) { const p = this.P[i]; p.t += dt; if (p.t > p.vida) { this.P.splice(i, 1); continue; }
      if (p.tipo === 'hoja' || p.tipo === 'pluma') { p.vz = p.t < .3 && p.tipo === 'pluma' ? .5 : -.7; p.vx = Math.sin(p.t * 2.3 + p.fase) * .9; p.vy = Math.cos(p.t * 1.7 + p.fase) * .4; } else { p.vz -= 9.8 * dt * (p.tipo === 'polvo' ? .15 : 1); p.vx *= 1 - dt * 2; p.vy *= 1 - dt * 2; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z = Math.max(0, p.z + p.vz * dt); if (p.z === 0 && p.tipo === 'hoja') { p.vx = p.vy = 0; } }
    for (let i = this.onos.length - 1; i >= 0; i--) if ((this.onos[i].t += dt) > .8) this.onos.splice(i, 1);
  },
  dibujar(D) {
    const { g, pr, z, P, E, modo } = D; this.actualizar(E); const cen = modo === 'cenital', noche = D.noche || 0;
    /* partículas */
    for (const p of this.P) { const [x, y] = pr(p.x, p.y, p.z), k = 1 - p.t / p.vida, r = Math.max(.8, p.r * z * (p.tipo === 'polvo' ? 1 + p.t * 1.6 : 1));
      if (p.tipo === 'polvo') g.fillStyle = 'rgba(150,130,100,' + (.32 * k).toFixed(3) + ')'; else if (p.tipo === 'agua') g.fillStyle = 'rgba(225,240,255,' + (.75 * k).toFixed(3) + ')'; else if (p.tipo === 'hoja') g.fillStyle = noche > .4 ? '#3d4a2a' : (p.fase > 3 ? '#8a9a3a' : '#c4a23a'); else if (p.tipo === 'pluma') g.fillStyle = 'rgba(200,204,212,' + k.toFixed(3) + ')'; else g.fillStyle = 'rgba(255,220,120,' + k.toFixed(3) + ')';
      g.beginPath(); if (p.tipo === 'hoja' || p.tipo === 'pluma') g.ellipse(x, y, r * 1.4, r * .7, p.fase + p.t * 3, 0, TAU); else g.arc(x, y, r, 0, TAU); g.fill(); }
    /* palomas comiendo en el piso: cabecean (a dos cuadros) */
    if (z > 1.2) for (const p of this.palomas) for (const q of p.m) { const [x, y] = pr(p.x + q.dx, p.y + q.dy, 0), s = Math.max(1.6, z * .16), pico = Math.floor((E.t || 0) * 6 + q.f * 3) % 4 === 0 ? s * .5 : 0;
      g.fillStyle = 'rgba(10,14,26,.18)'; g.beginPath(); g.ellipse(x, y + s * .3, s * 1.1, s * .45, 0, 0, TAU); g.fill(); g.fillStyle = noche > .4 ? '#2a2d36' : '#8a8f9a'; g.beginPath(); g.ellipse(x, y - s * .4, s * 1.1, s * .7, q.a, 0, TAU); g.fill(); g.fillStyle = noche > .4 ? '#3a3e48' : '#6b7280'; g.beginPath(); g.arc(x + Math.cos(q.a) * s * .9, y - s * .6 + pico, s * .45, 0, TAU); g.fill(); }
    /* pájaros: su sombra en el piso (si hay sol) y el ave aleteando a dos cuadros (como Spider‑Verse) */
    if (z > .5) { const sv = D.sv, t2 = Math.floor((E.t || 0) * 12) / 12;
      for (const b of this.aves) for (const [dx, dy, fa] of b.m) {
        const ca = Math.cos(b.a), sa = Math.sin(b.a), wx = b.x + dx * ca - dy * sa, wy = b.y + dx * sa + dy * ca, ala = Math.sin(t2 * 11 + fa) * (b.garza ? .5 : .8), s = Math.max(2.2, z * (b.garza ? 1.1 : .55));
        if (sv && !noche) { const [sx, sy] = pr(wx + sv.dx / sv.L * b.z * .4, wy + sv.dy / sv.L * b.z * .4, 0); g.fillStyle = 'rgba(10,14,30,.12)'; g.beginPath(); g.ellipse(sx, sy, s * .9, s * .35, 0, 0, TAU); g.fill(); }
        const [x, y] = pr(wx, wy, cen ? 0 : b.z); const ang = Math.atan2(pr(wx + ca, wy + sa, 0)[1] - pr(wx, wy, 0)[1], pr(wx + ca, wy + sa, 0)[0] - pr(wx, wy, 0)[0]);
        g.save(); g.translate(x, y - (cen ? 0 : 0)); g.rotate(ang + Math.PI / 2); g.strokeStyle = noche > .4 ? 'rgba(20,24,40,.8)' : b.garza ? '#f4f1e8' : '#3b3b42'; g.lineWidth = Math.max(1, s * .22); g.lineCap = 'round'; g.beginPath(); g.moveTo(-s, -ala * s); g.quadraticCurveTo(-s * .4, -s * .2, 0, 0); g.quadraticCurveTo(s * .4, -s * .2, s, -ala * s); g.stroke(); g.restore();
      } }
    /* onomatopeyas (cómic, manga, novela): letras gordas con contorno, que saltan y se van */
    const ES = MC.Estilo && MC.Estilo.p; if (ES && ES.onomatopeyas) for (const o of this.onos) { const [x, y] = pr(o.x, o.y, 2.2), k = o.t / .8, s = Math.max(16, Math.min(46, z * 2.2)) * (k < .15 ? .6 + k * 3 : 1);
      g.save(); g.translate(x + 18, y - 22 - k * 20); g.rotate(-.12); g.globalAlpha = 1 - Math.max(0, k - .6) * 2.5; g.font = '900 ' + s + 'px "Impact", "Arial Black", system-ui'; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = s * .22; g.strokeStyle = '#111'; g.strokeText(o.texto, 0, 0); g.fillStyle = MC.estilo === 'manga' || MC.estilo === 'novela' ? '#fff' : o.color; g.fillText(o.texto, 0, 0); g.restore(); }
  },
  /* hitstop: el mundo se congela un instante para que el golpe pese (lo respeta MC.Bucle) */
  impacto(s = .06) { MC._pausaImpacto = Math.max(MC._pausaImpacto || 0, s); }
};
MC.on('choque', C => { if (!C) return; Vida.impacto(.06); Vida.emitir('polvo', C.x, C.y, 10, { vel: 3, vz: .8 }); Vida.onomatopeya(C.x, C.y, ['¡PUM!', '¡CRASH!', '¡BAM!'][(Math.random() * 3) | 0], '#ff5a3c'); });
MC.Vida = Vida;

/* ---- js/89-exportar.js ---- */
/* =====================================================================
   EXPORTAR y PUENTE · llevar un mundo de Motor City a motores más potentes (2.7)
   Motor City corre en un HTML en cualquier celular. Cuando se quiera más (Godot 4, Unity, Unreal 5, Blender, three.js,
   Babylon o WebGPU), el mismo mundo sale en formatos estándar y la simulación se puede usar desde afuera:
   - GLB (glTF 2.0 binario, el «JPEG del 3D»): terreno con su relieve real y color por suelo (agua por profundidad),
     edificios extruidos con el color de su zona, vías como cintas sobre el terreno y árboles de baja poligonización
     por especie. Un solo material con colores por vértice: entra igual en todos los motores.
   - ALTURAS en RAW de 16 bits (el formato que importan los terrenos de Unity y Unreal), con su mínimo y máximo.
   - ESCENA en JSON: edificios (huella, altura, colores, clase), vías (polilínea, ancho, tipo), árboles (especie,
     alto, copa), lugares jugables y la caja, para que el motor de destino ponga su propia lógica y su arte.
   - PUENTE: MC.Puente.instantanea(E) da el estado vivo (jugador, vehículos, gente, hora, clima) serializable, para
     mandarlo por WebSocket a otro motor que solo dibuje (la simulación sigue en Motor City).
   Ejes: el mundo es x al oriente, y al sur y h arriba (metros). En glTF: X = x, Y = h, Z = y (diestro, +Y arriba).
   Uso: MC.Exportar.glb(mundo, [x0, y0, x1, y1]) → Uint8Array · MC.Exportar.escena(...) · MC.Exportar.alturas(...)
        node motor.mjs exportar guatape --lado 600   → dist/exportar/guatape/{mundo.glb, alturas.r16, escena.json, LEEME.md}
   ===================================================================== */
const Exportar = {
  /* relieve: una rejilla de alturas (metros) cada `paso` metros */
  alturas(M, caja, paso = 4) {
    const [x0, y0, x1, y1] = caja, w = Math.max(2, Math.floor((x1 - x0) / paso) + 1), h = Math.max(2, Math.floor((y1 - y0) / paso) + 1), D = new Float32Array(w * h); let mn = 1e9, mx = -1e9;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = M.cota(x0 + i * paso, y0 + j * paso); D[j * w + i] = v; if (v < mn) mn = v; if (v > mx) mx = v; }
    return { w, h, paso, min: mn, max: mx, datos: D, caja: [x0, y0, x0 + (w - 1) * paso, y0 + (h - 1) * paso] };
  },
  /* RAW de 16 bits sin signo, little endian (Unity: «Raw», Unreal: «.r16»), normalizado entre min y max */
  r16(A) {
    const out = new Uint8Array(A.datos.length * 2), vista = new DataView(out.buffer);
    const k = A.max > A.min ? 65535 / (A.max - A.min) : 0;
    for (let i = 0; i < A.datos.length; i++) vista.setUint16(2 * i, Math.round((A.datos[i] - A.min) * k), true);
    return out;
  },
  /* los datos para que otro motor ponga su lógica: edificios, vías, árboles y lugares */
  escena(M, caja, op = {}) {
    const [x0, y0, x1, y1] = caja, dentro = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1, r1 = v => Math.round(v * 10) / 10, VN = {}; if (typeof VIA !== 'undefined') for (const [k, v] of Object.entries(VIA)) VN[v] = k.toLowerCase();
    const edificios = M.edificiosEn(x0, y0, x1, y1).filter(b => dentro(b.x, b.y)).slice(0, op.maxEdificios || 20000).map((b, i) => { const st = estiloEdificio(M, b); return { id: i, x: r1(b.x), y: r1(b.y), base: r1(M.cota(b.x, b.y)), alto: r1(b.h), huella: Array.from(Mundo.esquinas(b), r1), clase: b.clase || 'casa', muro: st.muro, techo: st.techo, plano: !!st.plano }; });
    const vias = this.viasEn(M, caja).map(v => ({ tipo: VN[v.k] || v.k, nombre: v.nombre || '', ancho: v.ancho, p: Array.from(v.p, r1) }));
    const arboles = Arboleda.en(M, x0, y0, x1, y1, op.maxArboles || 20000).map(t => ({ x: r1(t.x), y: r1(t.y), base: r1(M.cota(t.x, t.y)), especie: t.e, alto: r1(t.h), copa: r1(t.r * (Arboleda.ESPECIES[t.e] || {}).ancho || t.r) }));
    const lugares = (M.lugares || []).filter(l => dentro(l.x, l.y)).map(l => ({ nombre: l.nombre, x: r1(l.x), y: r1(l.y), tipo: l.dibujo || l.tipo || '' }));
    return { schema_version: 1, motor: 'Motor City ' + MC.version, mundo: (M.cfg && M.cfg.id) || '', nombre: (M.cfg && M.cfg.nombre) || '', unidades: 'metros', ejes: 'mundo: x oriente, y sur, h arriba · glTF: X = x, Y = h, Z = y', caja, edificios, vias, arboles, lugares };
  },
  // Recorte paramétrico de cada segmento. Un cruce también cuenta si ambos extremos quedan fuera.
  viasEn(M, caja) {
    const [x0,y0,x1,y1] = caja, resultado = [];
    for (const v of M.vias()) {
      let tramo = null;
      for (let i = 0; i+3 < v.p.length; i+=2) {
        const x=v.p[i], y=v.p[i+1], dx=v.p[i+2]-x, dy=v.p[i+3]-y;
        let ini=0, fin=1;
        for (const [p,q] of [[-dx,x-x0],[dx,x1-x],[-dy,y-y0],[dy,y1-y]]) {
          if (p<0) ini=Math.max(ini,q/p);
          else if (p>0) fin=Math.min(fin,q/p);
          else if (q<0) { fin=-1; break; }
        }
        if (ini>=fin || (!dx && !dy)) { tramo=null; continue; }
        if (!tramo || ini>0) { tramo={...v,p:[x+ini*dx,y+ini*dy]}; resultado.push(tramo); }
        tramo.p.push(x+fin*dx,y+fin*dy);
        if (fin<1) tramo=null;
      }
    }
    return resultado;
  },
  /* ---------- geometría ---------- */
  _malla() { return { p: [], n: [], c: [], i: [] }; },
  _v(m, x, y, z, nx, ny, nz, c) { m.p.push(x, y, z); m.n.push(nx, ny, nz); m.c.push(c[0], c[1], c[2]); return m.p.length / 3 - 1; },
  _tri(m, a, b, c) { m.i.push(a, b, c); },
  _terreno(M, A) {
    const m = this._malla(), { w, h, paso, datos } = A, [x0, y0] = A.caja, S = PAL_SUELO;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const x = x0 + i * paso, y = y0 + j * paso, hz = datos[j * w + i], hx = datos[j * w + Math.min(w - 1, i + 1)] - datos[j * w + Math.max(0, i - 1)], hy = datos[Math.min(h - 1, j + 1) * w + i] - datos[Math.max(0, j - 1) * w + i], nx = -hx / (2 * paso), nz = -hy / (2 * paso), L = Math.hypot(nx, 1, nz);
      const tt = M.suelo(x, y); let c = hex3(S[tt] || '#888'); if (tt === TT.WATER || tt === TT.CANAL) { const ag = Terreno.aguaEn(M, x, y); if (ag) { const Q = AGUA_COL[ag.tipo] || AGUA_COL.lago; c = mez3(Q[0], Q[1], clamp(ag.prof / Q[2], 0, 1)); } }
      this._v(m, x, hz, y, nx / L, 1 / L, nz / L, c);
    }
    for (let j = 0; j + 1 < h; j++) for (let i = 0; i + 1 < w; i++) { const a = j * w + i, b = a + 1, c = a + w, d = c + 1; this._tri(m, a, c, b); this._tri(m, b, c, d); }   // hacia arriba (+Y)
    return m;
  },
  _edificios(M, L) {
    const m = this._malla();
    for (const b of L) {
      const st = estiloEdificio(M, b), P = Mundo.esquinas(b), n = P.length >> 1, z0 = M.cota(b.x, b.y) - 1, z1 = z0 + 1 + b.h, cm = hex3(st.muro), ct = hex3(st.techo); let area = 0;
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; area += P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; } const s = area > 0 ? 1 : -1;
      for (let i = 0; i < n; i++) {   // muros con su normal hacia afuera
        const j = (i + 1) % n, ax = P[2 * i], ay = P[2 * i + 1], bx = P[2 * j], by = P[2 * j + 1], ex = bx - ax, ey = by - ay, l = Math.hypot(ex, ey) || 1, nx = ey / l * s, nz = -ex / l * s;
        const a = this._v(m, ax, z0, ay, nx, 0, nz, cm), b2 = this._v(m, bx, z0, by, nx, 0, nz, cm), c = this._v(m, bx, z1, by, nx, 0, nz, cm), d = this._v(m, ax, z1, ay, nx, 0, nz, cm);
        if (s > 0) { this._tri(m, a, c, b2); this._tri(m, a, d, c); } else { this._tri(m, a, b2, c); this._tri(m, a, c, d); }
      }
      const r0 = m.p.length / 3; for (let i = 0; i < n; i++) this._v(m, P[2 * i], z1, P[2 * i + 1], 0, 1, 0, ct);   // techo en abanico
      for (let i = 1; i + 1 < n; i++) { if (s > 0) this._tri(m, r0, r0 + i + 1, r0 + i); else this._tri(m, r0, r0 + i, r0 + i + 1); }
    }
    return m;
  },
  _vias(M, L) {
    const m = this._malla(), V = PAL_VIA;
    for (const v of L) { const c = hex3(v.k <= 1 ? V.autopista : v.k <= 3 ? V.avenida : v.k === VIA.CICLO ? V.ciclo : v.k > 4 ? V.peatonal : V.asfalto), w = v.ancho / 2, P = v.p;
      for (let i = 0; i + 3 < P.length; i += 2) { const ax = P[i], ay = P[i + 1], bx = P[i + 2], by = P[i + 3], l = Math.hypot(bx - ax, by - ay); if (l < .1) continue; const nx = -(by - ay) / l * w, ny = (bx - ax) / l * w, ha = M.cota(ax, ay) + .08, hb = M.cota(bx, by) + .08;
        const a = this._v(m, ax + nx, ha, ay + ny, 0, 1, 0, c), b = this._v(m, ax - nx, ha, ay - ny, 0, 1, 0, c), cc = this._v(m, bx - nx, hb, by - ny, 0, 1, 0, c), d = this._v(m, bx + nx, hb, by + ny, 0, 1, 0, c);
        const up = ((ax - nx) - (ax + nx)) * ((by + ny) - (ay + ny)) - ((ay - ny) - (ay + ny)) * ((bx + nx) - (ax + nx)) > 0; if (up) { this._tri(m, a, cc, b); this._tri(m, a, d, cc); } else { this._tri(m, a, b, cc); this._tri(m, a, cc, d); } } }   // hacia arriba (+Y)
    return m;
  },
  _arboles(M, L) {
    const m = this._malla();
    for (const t of L) { const E = Arboleda.ESPECIES[t.e] || Arboleda.ESPECIES.urapan, z = M.cota(t.x, t.y), rC = t.r * E.ancho, ct = hex3(E.flor ? E.flor[1] : E.copa[1]), cb = hex3('#5a4433'), hc = t.h * .55, tr = Math.max(.15, t.r * .08);
      const caja = (x0, x1, y0, y1, h0, h1, c) => { const Q = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; for (let i = 0; i < 4; i++) { const [ax, ay] = Q[i], [bx, by] = Q[(i + 1) % 4], nx = by - ay, nz = -(bx - ax), l = Math.hypot(nx, nz) || 1; const a = this._v(m, ax, h0, ay, nx / l, 0, nz / l, c), b = this._v(m, bx, h0, by, nx / l, 0, nz / l, c), cc = this._v(m, bx, h1, by, nx / l, 0, nz / l, c), d = this._v(m, ax, h1, ay, nx / l, 0, nz / l, c); this._tri(m, a, cc, b); this._tri(m, a, d, cc); } };
      caja(t.x - tr, t.x + tr, t.y - tr, t.y + tr, z, z + hc + .5, cb);   // tronco
      const cy = z + hc + (t.h - hc) / 2, ry = (t.h - hc) / 2 + .3, V = [[rC, 0, 0], [-rC, 0, 0], [0, ry, 0], [0, -ry, 0], [0, 0, rC], [0, 0, -rC]], F = [[0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0], [4, 3, 0], [1, 3, 4], [5, 3, 1], [0, 3, 5]];   // copa: octaedro
      for (const f of F) { const P3 = f.map(k => [t.x + V[k][0], cy + V[k][1], t.y + V[k][2]]), u = [P3[1][0] - P3[0][0], P3[1][1] - P3[0][1], P3[1][2] - P3[0][2]], w2 = [P3[2][0] - P3[0][0], P3[2][1] - P3[0][1], P3[2][2] - P3[0][2]]; let nx = u[1] * w2[2] - u[2] * w2[1], ny = u[2] * w2[0] - u[0] * w2[2], nz = u[0] * w2[1] - u[1] * w2[0]; const cxm = (P3[0][0] + P3[1][0] + P3[2][0]) / 3 - t.x, cym = (P3[0][1] + P3[1][1] + P3[2][1]) / 3 - cy, czm = (P3[0][2] + P3[1][2] + P3[2][2]) / 3 - t.y, out = nx * cxm + ny * cym + nz * czm > 0, l = Math.hypot(nx, ny, nz) || 1; if (!out) { nx = -nx; ny = -ny; nz = -nz; } const ids = P3.map(q => this._v(m, q[0], q[1], q[2], nx / l, ny / l, nz / l, ct)); if (out) this._tri(m, ids[0], ids[1], ids[2]); else this._tri(m, ids[0], ids[2], ids[1]); }
    }
    return m;
  },
  /* ---------- glTF 2.0 binario (GLB) ---------- */
  glb(M, caja, op = {}) {
    const A = this.alturas(M, caja, op.paso || 4), [x0, y0, x1, y1] = caja, dentro = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
    const partes = [['terreno', this._terreno(M, A)], ['edificios', this._edificios(M, M.edificiosEn(x0, y0, x1, y1).filter(b => dentro(b.x, b.y)))], ['vias', this._vias(M, this.viasEn(M,caja))], ['arboles', this._arboles(M, Arboleda.en(M, x0, y0, x1, y1, op.maxArboles || 8000))]].filter(([, m]) => m.i.length);
    /* el origen en el centro de la caja (los motores pierden precisión lejos del origen) */
    const ox = (x0 + x1) / 2, oz = (y0 + y1) / 2, oy = A.min; for (const [, m] of partes) for (let k = 0; k < m.p.length; k += 3) { m.p[k] -= ox; m.p[k + 1] -= oy; m.p[k + 2] -= oz; }
    const trozos = [], bufferViews = [], accessors = [], meshes = [], nodes = []; let off = 0;
    const agregar = (arr, target) => { const b = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength); trozos.push(b); bufferViews.push({ buffer: 0, byteOffset: off, byteLength: b.byteLength, target }); off += b.byteLength; const pad = (4 - off % 4) % 4; if (pad) { trozos.push(new Uint8Array(pad)); off += pad; } return bufferViews.length - 1; };
    for (const [nombre, m] of partes) {
      const pos = new Float32Array(m.p), nor = new Float32Array(m.n), col = new Float32Array(m.c), idx = new Uint32Array(m.i), mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      for (let k = 0; k < pos.length; k += 3) for (let q = 0; q < 3; q++) { if (pos[k + q] < mn[q]) mn[q] = pos[k + q]; if (pos[k + q] > mx[q]) mx[q] = pos[k + q]; }
      const n = pos.length / 3, aP = accessors.push({ bufferView: agregar(pos, 34962), componentType: 5126, count: n, type: 'VEC3', min: mn, max: mx }) - 1, aN = accessors.push({ bufferView: agregar(nor, 34962), componentType: 5126, count: n, type: 'VEC3' }) - 1, aC = accessors.push({ bufferView: agregar(col, 34962), componentType: 5126, count: n, type: 'VEC3' }) - 1, aI = accessors.push({ bufferView: agregar(idx, 34963), componentType: 5125, count: idx.length, type: 'SCALAR' }) - 1;
      meshes.push({ name: nombre, primitives: [{ attributes: { POSITION: aP, NORMAL: aN, COLOR_0: aC }, indices: aI, material: 0 }] }); nodes.push({ name: nombre, mesh: meshes.length - 1 });
    }
    const json = { asset: { version: '2.0', generator: 'Motor City ' + MC.version + ' (MC.Exportar)', copyright: '© colaboradores de OpenStreetMap (ODbL) vía Overture Maps; relieve SRTM/NASA' }, scene: 0, scenes: [{ name: (M.cfg && M.cfg.nombre) || 'Motor City', nodes: nodes.map((_, i) => i) }], nodes, meshes, materials: [{ name: 'color_por_vertice', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 }, doubleSided: false }], buffers: [{ byteLength: off }], bufferViews, accessors, extras: { origen_mundo: [ox, oz], altura_base: oy, caja } };
    const enc = new TextEncoder(); let js = enc.encode(JSON.stringify(json)); const pj = (4 - js.length % 4) % 4; if (pj) { const t = new Uint8Array(js.length + pj); t.set(js); t.fill(0x20, js.length); js = t; }
    const total = 12 + 8 + js.length + 8 + off, out = new Uint8Array(total), dv = new DataView(out.buffer); let o = 0;
    dv.setUint32(o, 0x46546C67, true); dv.setUint32(o + 4, 2, true); dv.setUint32(o + 8, total, true); o += 12;
    dv.setUint32(o, js.length, true); dv.setUint32(o + 4, 0x4E4F534A, true); out.set(js, o + 8); o += 8 + js.length;
    dv.setUint32(o, off, true); dv.setUint32(o + 4, 0x004E4942, true); o += 8; for (const b of trozos) { out.set(b, o); o += b.byteLength; }
    return out;
  }
};
/* el estado vivo de un juego, serializable, para que otro motor lo dibuje (por WebSocket, postMessage o archivo) */
const Puente = {
  aGltf(x, y, h = 0) { return [x, h, y]; },
  instantanea(E, op = {}) {
    const r1 = v => Math.round((v || 0) * 100) / 100, J = E.jugador && E.jugador.cuerpo;
    return { schema_version: 1, t: r1(E.t), hora: E.reloj ? r1(E.reloj.hora) : null, clima: E.clima ? (E.clima.estado || null) : null, estilo: MC.estilo,
      jugador: J ? { x: r1(J.x), y: r1(J.y), z: r1((J.zPaso || 0) + (J.z || 0)), a: r1(J.a), v: r1(J.v), vehiculo: J.veh && J.veh.id, estado: J.estado || null, nadando: !!J.nadando } : null,
      vehiculos: (E.vehiculos || []).slice(0, op.max || 400).map(v => ({ x: r1(v.x), y: r1(v.y), a: r1(v.a), tipo: v.tipo || v.id || '' })), peatones: (E.peatones || []).slice(0, op.max || 400).map(p => ({ x: r1(p.x), y: r1(p.y), a: r1(p.a) })) };
  }
};
MC.Exportar = Exportar; MC.Puente = Puente;

/* ---- js/90-telemetria.js ---- */
/* =====================================================================
   TELEMETRÍA · lo que hay que medir en un celular real (2.8; entrega maestra §13, §14 y R20)
   - Tiempos de cuadro en PERCENTILES (p50, p95, p99), no solo un promedio que esconde los tirones.
   - Tiempo de dibujo de la vista y FPS.
   - El estado físico del jugador para calibrar el peso: velocidad, aceleración, suelo y si está en el aire.
   - Sin datos personales: es solo para el reporte del autor y de las IAs.
   Uso: MC.Telemetria.registro(msDibujo, dtCuadro) en cada cuadro · MC.Telemetria.resumen() · MC.Telemetria.linea(E)
   ===================================================================== */
const Telemetria = {
  N: 360, cuadro: [], dibujo: [],
  registro(msDibujo, dt) {
    if (dt > 0 && dt < 1) { this.cuadro.push(dt * 1000); if (this.cuadro.length > this.N) this.cuadro.shift(); }
    if (msDibujo >= 0) { this.dibujo.push(msDibujo); if (this.dibujo.length > this.N) this.dibujo.shift(); }
  },
  percentil(L, p) { if (!L.length) return 0; const S = L.toSorted((a, b) => a - b); return S[Math.min(S.length - 1, Math.floor(p * (S.length - 1) + .5))]; },
  resumen() {
    const c = this.cuadro, d = this.dibujo, r1 = v => Math.round(v * 10) / 10, p50 = this.percentil(c, .5);
    return { n: c.length, fps: p50 ? Math.round(1000 / p50) : 0, cuadro_p50: r1(p50), cuadro_p95: r1(this.percentil(c, .95)), cuadro_p99: r1(this.percentil(c, .99)), dibujo_p50: r1(this.percentil(d, .5)), dibujo_p95: r1(this.percentil(d, .95)), gpu: MC.GPU && MC.GPU.perfil ? (MC.GPU.perfil().nivel || '?') : '?' };
  },
  /* una línea corta para la pantalla: rendimiento + física del jugador */
  linea(E) {
    const R = this.resumen(), C = E && E.jugador && E.jugador.cuerpo; let f = '';
    if (C) { const s = MC.Vida && MC.Vida.suelo ? MC.Vida.suelo(E, C.x, C.y) : null; f = ' · ' + Math.round(Math.abs(C.v || 0) * 3.6) + ' km/h · a ' + (C._acel || 0).toFixed(1) + ' m/s²' + (C.enAire ? ' · en el aire' : '') + (s ? ' · ' + s : ''); }
    return '📈 ' + R.fps + ' fps · p95 ' + R.cuadro_p95 + ' ms · dibujo ' + R.dibujo_p95 + ' ms' + f;
  },
  limpiar() { this.cuadro.length = 0; this.dibujo.length = 0; }
};
MC.Telemetria = Telemetria;

/* ---- js/90-three.js ---- */
/* Vista opcional. Cada juego proporciona su copia local de three.js. */
Vistas.registrarThree = function (THREE) {
  if (!THREE?.WebGLRenderer) throw new TypeError('Se necesita three.js con WebGLRenderer');
  const previa = VISTAS.find(v => v.id === 'three');
  if (previa) return previa;
  const vista = {id:'three', n:'Three.js', icon:'🌆', tipo:'three', control:'mundo', crear() {
    const renderer = new THREE.WebGLRenderer({antialias:true});
    const escena = new THREE.Scene(), cam = new THREE.PerspectiveCamera(48,1,.5,2000);
    const material = new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    const sol = new THREE.DirectionalLight(0xffffff,1.8);
    escena.background = new THREE.Color(0xbad5e7);
    escena.add(sol,new THREE.HemisphereLight(0xe6f5ff,0x77604d,1.5));
    const barrio = new THREE.Group();
    escena.add(barrio);
    let anterior = null, cx, cy;
    function malla(nombre,m) {
      if (!m.i.length) return;
      const geo = new THREE.BufferGeometry();
      for (const [a,datos] of [['position',m.p],['normal',m.n],['color',m.c]])
        geo.setAttribute(a,new THREE.Float32BufferAttribute(datos,3));
      geo.setIndex(m.i);
      const obj = new THREE.Mesh(geo,material);
      obj.name = nombre;
      barrio.add(obj);
    }
    return {renderer, escena, dibujar(w,h,E) {
      const M=E.mundo, C=E.camara, x=Math.floor(C.x/128), y=Math.floor(C.y/128);
      if (M!==anterior || x!==cx || y!==cy) {
        for (const viejo of [...barrio.children]) { viejo.geometry.dispose(); barrio.remove(viejo); }
        const caja=[x*128-192,y*128-192,x*128+320,y*128+320];
        malla('terreno',Exportar._terreno(M,Exportar.alturas(M,caja,8)));
        malla('edificios',Exportar._edificios(M,M.edificiosEn(...caja)));
        malla('vias',Exportar._vias(M,Exportar.viasEn(M,caja)));
        malla('arboles',Exportar._arboles(M,Arboleda.en(M,...caja,2400)));
        anterior=M; cx=x; cy=y;
      }
      if (renderer.domElement.width!==w || renderer.domElement.height!==h) {
        renderer.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix();
      }
      const base=M.cota(C.x,C.y), r=clamp(190/Math.max(1,C.zoom),20,120);
      cam.position.set(C.x+Math.sin(C.yaw)*r,base+r*.85,C.y+Math.cos(C.yaw)*r);
      cam.lookAt(C.x,base+2,C.y); sol.position.set(-.5,1,.4);
      renderer.render(escena,cam);
      return renderer.domElement;
    }};
  }};
  VISTAS.push(vista);
  return vista;
};

/* ---- js/91-contratos.js ---- */
/* =====================================================================
   CONTRATOS · datos versionados para que el mundo y el estado viajen entre motores (2.8; entrega maestra §12.3 y §16)
   - Cada formato que sale del motor lleva `schema_version` y tiene su esquema JSON en schemas/:
       escena.schema.json (MC.Exportar.escena) · puente.schema.json (MC.Puente.instantanea) · entidad.schema.json
   - MC.Contratos.validar(dato, esquema) revisa un subconjunto de JSON Schema (type, required, properties, items,
     enum, minimum, maximum, minItems, const) sin librerías, para que lo que produzca una IA pase antes de entrar.
   - La física y el estado no cambian con la calidad gráfica: el contrato describe el mundo, no cómo se ve.
   Uso: const errores = MC.Contratos.validar(MC.Exportar.escena(M, caja), esquema)   // [] si está bien
   ===================================================================== */
const Contratos = {
  VERSION: 1,
  tipoDe(v) { return v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v; },
  validar(v, S, ruta = '$', err = [], max = 50) {
    if (!S || err.length >= max) return err;
    if (S.const !== undefined && v !== S.const) err.push(ruta + ': debe ser ' + JSON.stringify(S.const));
    if (S.enum && !S.enum.includes(v)) err.push(ruta + ': no es uno de ' + S.enum.join(', '));
    if (S.type) { const t = this.tipoDe(v), ok = [].concat(S.type).some(x => x === t || (x === 'number' && t === 'integer')); if (!ok) { err.push(ruta + ': se esperaba ' + [].concat(S.type).join('|') + ' y llegó ' + t); return err; } }
    if (typeof v === 'number') { if (S.minimum !== undefined && v < S.minimum) err.push(ruta + ': menor que ' + S.minimum); if (S.maximum !== undefined && v > S.maximum) err.push(ruta + ': mayor que ' + S.maximum); }
    if (Array.isArray(v)) { if (S.minItems !== undefined && v.length < S.minItems) err.push(ruta + ': menos de ' + S.minItems + ' elementos'); if (S.maxItems !== undefined && v.length > S.maxItems) err.push(ruta + ': más de ' + S.maxItems + ' elementos'); if (S.items) for (let i = 0; i < v.length && err.length < max; i++) this.validar(v[i], S.items, ruta + '[' + i + ']', err, max); }
    if (v && typeof v === 'object' && !Array.isArray(v)) { for (const k of S.required || []) if (!(k in v)) err.push(ruta + ': falta «' + k + '»'); if (S.properties) for (const [k, s2] of Object.entries(S.properties)) if (k in v) this.validar(v[k], s2, ruta + '.' + k, err, max); }
    return err;
  }
};
MC.Contratos = Contratos;

/* ---- js/92-guardado.js ---- */
/* Estado persistente de sectores. Las coordenadas e identificadores pertenecen al mundo,
   y los cambios son datos JSON que el juego interpreta al activar cada sector. */
class GuardadoSectores {
  constructor(op = {}) {
    this.lado = op.lado ?? 128;
    if (!Number.isFinite(this.lado) || this.lado <= 0) throw new Error('El tamaño del sector debe ser positivo');
    this.mundo = String(op.mundo || '');
    this.sectores = new Map();
    this.activos = new Set();
  }
  sector(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Coordenadas de sector inválidas');
    return Math.floor(x / this.lado) + ',' + Math.floor(y / this.lado);
  }
  /* La identidad no depende del orden de carga ni de la calidad gráfica. */
  static id(mundo, tipo, clave) {
    if (![mundo, tipo, clave].every(v => typeof v === 'string' && v.length)) throw new Error('El ID requiere mundo, tipo y clave');
    return [mundo, tipo, clave].map(encodeURIComponent).join('/');
  }
  cambiar(x, y, id, cambio) {
    if (typeof id !== 'string' || !id) throw new Error('Falta el ID estable del objeto');
    if (!cambio || typeof cambio !== 'object' || Array.isArray(cambio)) throw new Error('El cambio debe ser un objeto JSON');
    const copia = JSON.parse(JSON.stringify(cambio)), clave = this.sector(x, y);
    let datos = this.sectores.get(clave);
    if (!datos) this.sectores.set(clave, datos = new Map());
    datos.set(id, copia);
  }
  obtener(x, y, id) {
    const dato = this.sectores.get(this.sector(x, y))?.get(id);
    return dato === undefined ? null : JSON.parse(JSON.stringify(dato));
  }
  quitar(x, y, id) {
    const clave = this.sector(x, y), datos = this.sectores.get(clave);
    if (!datos || !datos.delete(id)) return false;
    if (!datos.size) this.sectores.delete(clave);
    return true;
  }
  /* Devuelve los cambios de actividad para que el juego cargue o retire sus objetos. */
  actualizar(x, y, radio = 1) {
    if (!Number.isInteger(radio) || radio < 0) throw new Error('El radio debe ser un entero no negativo');
    const [sx, sy] = this.sector(x, y).split(',').map(Number), nuevos = new Set();
    for (let j = sy - radio; j <= sy + radio; j++) for (let i = sx - radio; i <= sx + radio; i++) nuevos.add(i + ',' + j);
    const despiertan = [...nuevos].filter(k => !this.activos.has(k));
    const duermen = [...this.activos].filter(k => !nuevos.has(k));
    this.activos = nuevos;
    return { despiertan, duermen };
  }
  instantanea() {
    const sectores = {};
    for (const [clave, datos] of this.sectores) sectores[clave] = Object.fromEntries(datos);
    return JSON.parse(JSON.stringify({ schema_version: 1, mundo: this.mundo, lado: this.lado, sectores }));
  }
  static restaurar(datos, migradores = {}) {
    let copia = JSON.parse(JSON.stringify(datos));
    if (!copia || typeof copia !== 'object' || Array.isArray(copia)) throw new Error('Guardado inválido');
    if (copia.schema_version === undefined) copia.schema_version = 0;
    while (copia.schema_version !== 1) {
      const v = copia.schema_version, migrar = migradores[v];
      if (!Number.isInteger(v) || v < 0 || v > 1 || typeof migrar !== 'function') throw new Error('Versión de guardado no admitida: ' + v);
      copia = migrar(copia);
      if (!copia || copia.schema_version !== v + 1) throw new Error('El migrador debe avanzar una versión');
    }
    if (typeof copia.mundo !== 'string' || !Number.isFinite(copia.lado) || copia.lado <= 0 || !copia.sectores || typeof copia.sectores !== 'object' || Array.isArray(copia.sectores)) throw new Error('Guardado de sectores inválido');
    const resultado = new GuardadoSectores({ mundo: copia.mundo, lado: copia.lado });
    for (const [clave, objetos] of Object.entries(copia.sectores)) {
      if (!/^-?\d+,-?\d+$/.test(clave) || !objetos || typeof objetos !== 'object' || Array.isArray(objetos)) throw new Error('Sector inválido: ' + clave);
      const lista = new Map();
      for (const [id, valor] of Object.entries(objetos)) {
        if (!id || !valor || typeof valor !== 'object' || Array.isArray(valor)) throw new Error('Cambio inválido: ' + id);
        lista.set(id, valor);
      }
      resultado.sectores.set(clave, lista);
    }
    return resultado;
  }
  guardar(clave, almacenamiento = typeof localStorage !== 'undefined' ? localStorage : null) {
    if (!almacenamiento) return false;
    try { almacenamiento.setItem(clave, JSON.stringify(this.instantanea())); return true; }
    catch (e) { return false; }
  }
  static leer(clave, almacenamiento = typeof localStorage !== 'undefined' ? localStorage : null, migradores = {}) {
    if (!almacenamiento) return null;
    const datos = almacenamiento.getItem(clave);
    return datos === null ? null : GuardadoSectores.restaurar(JSON.parse(datos), migradores);
  }
}
MC.GuardadoSectores = GuardadoSectores;

/* ---- js/92-publico.js ---- */
/* =====================================================================
   PÚBLICO SIMULADO (2.10) · jugadores con perfiles distintos que juegan solos
   La idea viene de MiroFish (un público falso que opina antes del lanzamiento); aquí sin su código (AGPL, servidor
   y llaves de IA): cada perfil maneja con la palanca como lo haría esa persona (puntería, reacción, fuerza, paciencia)
   y se mide lo que sentiría: cuánto tarda en llegar, cuánto se atasca, cuántas veces choca y si el juego va fluido.
   Uso:
     const p = MC.Publico.piloto('nina', { cuerpo, camara, objetivo: () => ({ x, y, radio, quieto }), ruta: (desde, hasta) => MC.Manejo.rutaA(mundo, desde, hasta, 'rueda') });
     (quien conoce el pueblo va por las calles con la ruta; el turista sigue la flecha en línea recta)
     const ent = p.leer(dt);            // la misma forma que MC.Controles.leer()
     MC.Publico.informe(p.medidas)      // { perfil, veredicto: 'bien'|'revisar'|'mal', frases: [...] }
   En consola: node motor.mjs publico   (los cuatro perfiles juegan Mandados en un celular simulado; informe en dist/publico.md)
   ===================================================================== */
const PERFILES_PUBLICO = {
  nina: { n: 'Sofía, 8 años', icono: '🧒', calles: true, error: 35, reaccion: .6, fuerza: .85, suelta: .25, turbo: false, paciencia: 25, nota: 'toca con todo el dedo, se distrae y suelta la palanca' },
  abuelo: { n: 'Don Gilberto, 70 años', icono: '👴', calles: true, error: 14, reaccion: 1.4, fuerza: .55, suelta: .08, turbo: false, paciencia: 40, nota: 'va despacio, lee todo, no le gustan los movimientos bruscos' },
  gamer: { n: 'Valentina, 17 años', icono: '🎮', calles: true, error: 5, reaccion: .22, fuerza: 1, suelta: 0, turbo: true, paciencia: 15, nota: 'va a fondo y con turbo, se aburre si no pasa nada' },
  turista: { n: 'Mark, turista', icono: '🧳', calles: false, error: 22, reaccion: .9, fuerza: .7, suelta: .05, turbo: false, paciencia: 30, nota: 'no conoce el pueblo y lee poco español: se guía por la flecha' }
};
const Publico = {
  PERFILES: PERFILES_PUBLICO,
  lista() { return Object.entries(PERFILES_PUBLICO).map(([id, p]) => ({ id, n: p.n, icono: p.icono, nota: p.nota })); },
  /* un piloto: decide cada «reaccion» segundos hacia dónde empujar, con su error de puntería; si se atasca, prueba otro rumbo */
  piloto(id, op = {}) {
    const P = PERFILES_PUBLICO[id] || PERFILES_PUBLICO.turista, rnd = mulberry32(op.semilla || (id.length * 7919 + 13));
    const M = { perfil: id, t: 0, metros: 0, atascado: 0, choques: 0, pasos: 0, llegadas: [], solto: 0, desvio: 0, cuadros: 0 };
    let rumbo = 0, prox = 0, suelta = 0, atasco = 0, x0 = null, y0 = null, desvio = 0, ruta = null, clave = '';
    const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) / 1.22; };
    const quitar = MC.on ? MC.on('choque', c => { if (!op.cuerpo || c === op.cuerpo) M.choques++; }) : null;
    return {
      perfil: P, medidas: M,
      paso() { M.pasos++; M.llegadas.push(+M.t.toFixed(1)); },
      soltar() { if (quitar) quitar(); },
      leer(dt) {
        const C = op.cuerpo, ob = op.objetivo ? op.objetivo() : null; M.t += dt; M.cuadros++;
        const E = { stick: { x: 0, y: 0, m: 0 }, teclado: false, acel: 0, giro: 0, salto: false, turbo: false, correr: false, sube: false, baja: false, accion: false, pulsos: new Set() };
        if (!C) return E;
        if (x0 != null) { const d = Math.hypot(C.x - x0, C.y - y0); M.metros += d; } x0 = C.x; y0 = C.y;
        if (!ob) return E;
        const dist = Math.hypot(ob.x - C.x, ob.y - C.y);
        if (dist < (ob.radio || 20) * (ob.quieto ? .6 : .8)) return E;   // llegó: suelta (y espera si el paso lo pide)
        const k = Math.round(ob.x) + ',' + Math.round(ob.y); if (P.calles && op.ruta && k !== clave) { clave = k; ruta = op.ruta({ x: C.x, y: C.y }, { x: ob.x, y: ob.y }); if (ruta) ruta._i = 0; }
        let tx = ob.x, ty = ob.y; if (ruta && ruta.length >= 4) { let i = ruta._i || 0; while (i + 3 < ruta.length && Math.hypot(ruta[i] - C.x, ruta[i + 1] - C.y) < 6) i += 2; ruta._i = i; tx = ruta[i]; ty = ruta[i + 1]; }
        prox -= dt; if (prox <= 0) { prox = P.reaccion * (.7 + rnd() * .6); rumbo = Math.atan2(ty - C.y, tx - C.x) + gauss() * P.error * Math.PI / 180 * .5 + desvio; desvio *= .5; }
        if (suelta > 0) { suelta -= dt; return E; } if (rnd() < P.suelta * dt) { suelta = .4 + rnd() * .8; M.solto++; return E; }
        const v = Math.abs(C.v || 0); if (v < .3) { atasco += dt; M.atascado += dt; if (atasco > 1.5) { desvio = (rnd() < .5 ? -1 : 1) * (.8 + rnd() * 1.2); prox = 0; atasco = 0; M.desvio++; clave = ''; } } else atasco = Math.max(0, atasco - dt);
        const yaw = op.camara ? op.camara.yaw || 0 : 0, c = Math.cos(yaw), s = Math.sin(yaw), wx = Math.cos(rumbo), wy = Math.sin(rumbo), f = P.fuerza;
        E.stick = { x: (wx * c - wy * s) * f, y: (wx * s + wy * c) * f, m: f }; E.turbo = E.correr = !!P.turbo && dist > 60;
        return E;
      }
    };
  },
  /* el informe de un perfil: lo que esa persona «diría» del juego, con umbrales simples y explicados */
  informe(M, extra = {}) {
    const P = PERFILES_PUBLICO[M.perfil] || PERFILES_PUBLICO.turista, fr = [], primera = M.llegadas[0];
    let malos = 0;
    if (primera == null) { fr.push('No logró llegar al primer punto en ' + Math.round(M.t) + ' s: el camino no se entiende o algo lo bloquea.'); malos += 2; }
    else if (primera > P.paciencia * 2) { fr.push('Tardó ' + primera + ' s en llegar al primer punto (su paciencia es de ~' + P.paciencia + ' s): el primer mandado está lejos o es confuso.'); malos++; }
    else fr.push('Llegó al primer punto en ' + primera + ' s.');
    const pa = M.t > 0 ? M.atascado / M.t : 0; if (pa > .25) { fr.push('Pasó el ' + Math.round(pa * 100) + ' % del tiempo quieto o atascado contra algo.'); malos++; }
    if (M.choques > Math.max(3, M.t / 10)) { fr.push('Chocó ' + M.choques + ' veces: las calles o los obstáculos no se leen bien a su ritmo.'); malos++; }
    if (extra.fps != null && extra.fps < 24) { fr.push('El juego le iba a ' + Math.round(extra.fps) + ' cuadros por segundo: se siente lento.'); malos++; }
    if (extra.errores) { fr.push('Hubo ' + extra.errores + ' errores en la consola.'); malos += 2; }
    if (!malos) fr.push('Lo disfrutó: llegó, casi no se atascó y el juego fue fluido.');
    return { perfil: M.perfil, n: P.n, icono: P.icono, veredicto: malos === 0 ? 'bien' : malos === 1 ? 'revisar' : 'mal', frases: fr, medidas: M };
  }
};
MC.Publico = Publico;

MC.archivos = ["00-nucleo.js","01-inflate.js","02-ciencia.js","03-economia.js","04-escala.js","05-gpu.js","10-mundo.js","10-sectores.js","11-red.js","12-generador.js","13-cosmos.js","13-globo-gpu.js","13-planeta.js","14-ondas.js","15-terreno.js","16-estilos.js","20-tiempo.js","21-trafico.js","22-transporte.js","24-ambiente.js","25-ia.js","26-urbe.js","27-mobiliario.js","28-accion-pie.js","28-busqueda.js","28-naturaleza.js","28-persecucion.js","29-arboleda.js","30-personaje.js","31-vehiculos.js","32-fisica.js","32-objetos.js","32-piezas.js","33-controles.js","34-camara.js","35-seres.js","36-taller.js","37-manejo.js","38-sprites.js","39-sombras.js","40-dibujo.js","41-vista2d.js","42-vehiculos-lado.js","43-panoramica.js","44-raster.js","45-gl.js","45-gl3d.js","45-glb.js","46-vistas.js","47-clasicos.js","47-seguir.js","48-interiores.js","49-hogar.js","50-run.js","60-musica.js","61-sonido.js","70-interfaz.js","80-mecanicas.js","82-lugares.js","85-historias.js","86-necesidades.js","87-pieles.js","88-vida.js","89-exportar.js","90-telemetria.js","90-three.js","91-contratos.js","92-guardado.js","92-publico.js"];
root.MC = MC;
if (!root.Valle) root.Valle = MC.ValleCompat;
if (!root.MotorValle) root.MotorValle = MC.ValleCompat;
})(typeof window !== 'undefined' ? window : globalThis);
