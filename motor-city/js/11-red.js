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
