/* =====================================================================
   MOTOR CITY · NÚCLEO (MC)
   El motor de mundo abierto que comparten Juega EnCicla, El Metro y los juegos que vienen.
   Todo el motor vive en un solo cierre y solo publica MC (y, por compatibilidad con los juegos 1.x, Valle/MotorValle).
   Reglas: un solo HTML, sin internet ni librerías; español de Colombia; ningún dato personal.
   ===================================================================== */
const MC = {
  version: '2.3.0',
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
