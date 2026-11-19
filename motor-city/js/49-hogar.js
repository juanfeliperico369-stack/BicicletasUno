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
