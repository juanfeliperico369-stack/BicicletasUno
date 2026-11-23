/* =====================================================================
   TURNO CERO · 4.6 · 🎮 MODOS: un solo juego de prueba con todo
   El autor: «la idea no era tener 4 videojuegos de prueba, la idea era tener solo uno… entrega los cuatro en Turno Cero, y
   rescata técnicas, funciones, mecánicas y jugabilidades de EnCicla y El Metro, para un juego de prueba con absolutamente todo».
   Aquí viven, en la ciudad abierta en la que estés (Nueva York, Medellín y el Valle o Guatapé), sin pantallas aparte:
   - 🏁 CARRERAS (antes «Motor City · Carreras»): circuito o sprint por las calles de aquí contra 3 rivales con IA que se
     adaptan a tu ritmo (MC.Manejo.pilotar), cuenta regresiva, posición, vueltas y récords.
   - 🚵 EXTREMO (antes «Extremo»): bici de montaña desde lo más alto de las vías cercanas hasta lo más bajo; 🦘 saltar y
     derrapar suman puntos; dos rivales.
   - 📦 MANDADOS (antes «Mandados»): recoger y entregar con el reloj corriendo; el paquete se daña con los golpes y el pago baja.
   - 🚲 ENCICLA (de «Juega EnCicla»): toma una cicla y llévala a la estación que más la necesita (rebalanceo); la racha por la
     ciclorruta multiplica y volarse un semáforo en rojo resta.
   - 🚇 METRO, TRANVÍA Y METROPLÚS (de «El Metro»): manejas el tren por su línea real: ⚡ acelera, 🛑 frena; para dentro del
     andén (puntos por precisión), abre puertas, suben y bajan pasajeros.
   - 🧪 LABORATORIO: estilo gráfico, hora, clima y cualquier vehículo del motor.
   Sin policía mientras dura un modo. Todo con el motor (MC.Cuerpo, MC.Manejo, MC.Trafico.luces, MC.Transporte) y el manejo 4.6.
   ===================================================================== */
const fmtT = t => { t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
class PistaTC {
  constructor(P, cerrada) { this.P = P; this.cerrada = cerrada; this.S = [0]; for (let i = 2; i < P.length; i += 2) this.S.push(this.S[this.S.length - 1] + Math.hypot(P[i] - P[i - 2], P[i + 1] - P[i - 1])); this.L = this.S[this.S.length - 1]; }
  punto(s) { s = this.cerrada ? ((s % this.L) + this.L) % this.L : clamp(s, 0, this.L); let i = 1; while (i < this.S.length - 1 && this.S[i] < s) i++; const k = (s - this.S[i - 1]) / Math.max(1e-6, this.S[i] - this.S[i - 1]), P = this.P; return { x: P[2 * i - 2] + (P[2 * i] - P[2 * i - 2]) * k, y: P[2 * i - 1] + (P[2 * i + 1] - P[2 * i - 1]) * k, a: Math.atan2(P[2 * i + 1] - P[2 * i - 1], P[2 * i] - P[2 * i - 2]) }; }
  proyectar(x, y, s0 = 0, ventana = 120) { let mejor = s0, md = 1e9; for (let s = s0 - 20; s <= s0 + ventana; s += 3) { const q = this.punto(s), d = Math.hypot(q.x - x, q.y - y); if (d < md) { md = d; mejor = s; } } return { s: mejor, d: md }; }
  plana(desde, largo) { const o = []; for (let s = desde; s <= desde + largo; s += 6) { const q = this.punto(s); o.push(q.x, q.y); } return o; }
}
const rutaTC = (M, puntos, cerrar) => { const o = []; for (let i = 0; i < puntos.length - (cerrar ? 0 : 1); i++) { const a = puntos[i], b = puntos[(i + 1) % puntos.length], r = MC.Manejo.rutaA(M, { x: a.x, y: a.y, a: 0 }, { x: b.x, y: b.y }, 'rueda'); if (!Array.isArray(r) || r.length < 4) continue; for (let j = o.length ? 2 : 0; j < r.length; j += 2) o.push(r[j], r[j + 1]); } return o; };
const deCarro = v => v.k >= 1 && v.k <= 4;

const Modos = {
  m: null,
  DEF: {
    carrera: { ico: '🏁', n: 'Carreras', d: 'circuito o sprint por las calles de aquí contra 3 rivales' },
    extremo: { ico: '🚵', n: 'Extremo', d: 'bajada en bici de montaña: saltos y derrapes suman' },
    mandados: { ico: '📦', n: 'Mandados', d: 'recoge y entrega a tiempo; cuida el paquete' },
    encicla: { ico: '🚲', n: 'EnCicla', d: 'lleva la cicla a la estación que la necesita; ciclorruta = racha, semáforo en rojo = multa', puede: () => ((G.M.transporte && G.M.transporte.encicla) || []).length >= 2, falta: 'solo donde hay estaciones EnCicla (Medellín y el Valle)' },
    tren: { ico: '🚇', n: 'Metro, tranvía y Metroplús', d: 'maneja el tren por su línea real y para en cada andén', puede: () => !!(G.transporte && G.transporte.lineas.some(L => L.clase !== 'cable' && L.est.length >= 3)), falta: 'solo donde hay líneas (Medellín y el Valle)' },
    run: { ico: '🛴', n: 'Run en la ciclovía', d: 'el corredor infinito por la ciclorruta real (a pie, bici, patinete, skate o patines)' },
    trucos: { ico: '🛹', n: 'Zona de trucos y parkour', d: 'skate, BMX, patines o a pie: salta (🦘), gira en el aire y encadena combos en 75 s' },
    lab: { ico: '🧪', n: 'Laboratorio del motor', d: 'estilo gráfico, hora, clima y cualquier vehículo' }
  },
  records() { return leerG().records || {}; },
  record(clave, valor, menor) { const R = this.records(), p = R[clave], mejor = p == null || (menor ? valor < p : valor > p); if (mejor) { R[clave] = valor; escribirG({ records: R }); } return { mejor, antes: p }; },
  disponible() { return G.M && G.M.esCiudad && G.modo === 'libre' && !G.contrato && !G.hist && !G.viaje && !G.dron; },
  menu() {
    if (this.m) return G.ui.menu('🎮 ' + this.DEF[this.m.id].n, [{ id: 'seguir', texto: '▶ Seguir' }, { id: 'salir', texto: '🛑 Salir del modo' }], k => { if (k === 'salir') this.terminar('Saliste del modo'); });
    if (!this.disponible()) return G.ui.aviso('🎮 Los modos se juegan en el mundo abierto de una ciudad, sin contrato ni historia', 2600, 'modos');
    const R = this.records(), it = Object.entries(this.DEF).map(([id, D]) => { const ok = !D.puede || D.puede(), r = id === 'carrera' ? R['carrera:' + G.id] : id === 'extremo' ? R['extremo:' + G.id] : R[id + ':' + G.id]; return { id, texto: D.ico + ' <b>' + D.n + '</b><br><small>' + (ok ? D.d : D.falta) + (r != null && id !== 'lab' ? ' · 🏆 ' + (id === 'carrera' ? fmtT(r) : Math.round(r) + ' pts') : '') + '</small>' + (ok ? '' : ' 📍') };   /* 4.7 (ChatGPT TC-P1-07): no es un candado de progreso, es que en esta ciudad no existe */ });
    G.ui.menu('🎮 Modos de juego · ' + G.M.meta.ciudad, it.concat([{ id: 'x', texto: '✕ Cerrar' }]), id => { if (id === 'x') return; const D = this.DEF[id]; if (D.puede && !D.puede()) return G.ui.aviso('📍 ' + D.n + ': ' + D.falta + ' (viaja por la 🌍 carretera o elige la ciudad en la portada)', 3200, 'modos'); this.empezar(id); });
  },
  empezar(id, op) {
    if (this.m) this.terminar(null); const C = G.cuerpo; G.busq.limpiar(); G.destinoLibre = null; G.objetivo = null;
    /* 4.7 (ChatGPT TC-P1-08): desde una marca del mundo, la pista sale de una semilla fija (misma marca, misma ruta, récords comparables) */
    this._rnd = op && op.centro ? MC.mulberry32((Math.round(op.centro.x) * 73856093 ^ Math.round(op.centro.y) * 19349663 ^ MC.hashTxt(G.id + ':' + id)) >>> 0) : Math.random;
    const r = id === 'carrera' ? this.armarCarrera(false) : id === 'extremo' ? this.armarCarrera(true) : id === 'mandados' ? this.armarMandado(0) : id === 'encicla' ? this.armarEnCicla() : id === 'tren' ? this.elegirLinea() : id === 'run' ? this.irARun() : id === 'trucos' ? this.armarTrucos(op && op.centro) : id === 'lab' ? this.laboratorio() : null;
    if (r === false) G.ui.aviso('🚧 No encontré calles para ' + this.DEF[id].n + ' aquí: muévete un poco y prueba otra vez', 2800, 'modos');
    MC.emit('modo:inicio', { id, ok: r !== false }); return r; },
  terminar(texto) { const m = this.m; if (!m) return; this.m = null; const C = G.cuerpo; G.objetivo = null; G.controlExterno = null; G.E._sinJugador = false; for (const k of ['m1', 'm2', 'm3']) { const f = G.ui.ficha(k, ''); f.hidden = true; } if (BOT.saltar) BOT.saltar.hidden = true;
    if (m.tren) { const q = G.M.viaCercana(C.x, C.y, 150) || { x: C.x, y: C.y, ang: C.a }; C.x = q.x; C.y = q.y; C.a = q.ang; C.v = 0; }
    if (m.antes && C.veh.id !== m.antes) { C.setVeh(m.antes); C.v = 0; }
    if (texto) G.ui.aviso(texto, 2400, 'modos'); MC.emit('modo:fin', { id: m.id }); },

  /* ---------------- 🏁 carreras y 🚵 extremo ---------------- */
  armarCarrera(extremo) {
    if (!this._rnd) this._rnd = Math.random;
    const M = G.M, C = G.cuerpo, x0 = C.x, y0 = C.y; let P = null, cerrada = false, tipo = '', desnivel = 0;
    const largo = Q => { let L = 0; for (let i = 2; i < Q.length; i += 2) L += Math.hypot(Q[i] - Q[i - 2], Q[i + 1] - Q[i - 1]); return L; }, bueno = Q => Q && Q.length >= 8 && largo(Q) > 400 && largo(Q) < (extremo ? 2600 : 5000);
    /* extremo: lo más alto cerca y, desde ahí, lo más bajo a menos de 1,2 km (bajadas de 1 a 4 km, no vueltas por medio valle) */
    if (extremo) { const alto = this.extremoVias(x0, y0, 1200, 1); const bajo = alto && this.extremoVias(alto.x, alto.y, 800, -1);
      if (alto && bajo && alto.z - bajo.z > 25) { const Q = rutaTC(M, [alto, bajo], false); if (bueno(Q)) { P = Q; tipo = 'Bajada'; desnivel = Math.round(alto.z - bajo.z); } } }
    for (let intento = 0; intento < 6 && !P; intento++) { cerrada = intento % 2 === 0; const pts = [], n = cerrada ? 5 : 2, R = (extremo ? 260 : 380) * Math.pow(.7, intento);
      for (let k = 0; k < n; k++) { const a = k / n * TAU + this._rnd() * .4, q = M.viaCercana(x0 + Math.cos(a) * R * (cerrada ? 1 : 3.2), y0 + Math.sin(a) * R * (cerrada ? .8 : 3.2), 220, extremo ? null : deCarro); if (q) pts.push(q); }
      if (!cerrada) { const q0 = M.viaCercana(x0, y0, 120, extremo ? null : deCarro); if (q0) pts.unshift(q0); pts.length = Math.min(pts.length, 2); }
      if (pts.length >= 2) { const Q = rutaTC(M, pts, cerrada); if (bueno(Q)) { P = Q; tipo = cerrada ? 'Circuito' : 'Sprint'; } } }
    if (!P) return false;
    const p = new PistaTC(P, cerrada); if (p.L < 300) return false; const vueltas = cerrada && p.L < 2200 ? 2 : 1, antes = C.veh.id;
    /* 4.7: la salida, en un tramo despejado: si los primeros 15 m de pista chocan con algo (un edificio, un poste), la salida avanza por la pista */
    let s0 = 0; const libre = s => { for (let d = 2; d <= 15; d += 2.5) { const q = p.punto(s + d); if (G.M.edificioEn(q.x, q.y, 1.2)) return false; } return true; }; while (s0 < Math.min(150, p.L / 3) && !libre(s0)) s0 += 6;
    if (s0 > 0) { const P2 = []; for (let s = s0; s <= p.L - (cerrada ? 0 : 1); s += 6) { const q = p.punto(s); P2.push(q.x, q.y); } if (cerrada) for (let s = 0; s < s0; s += 6) { const q = p.punto(s); P2.push(q.x, q.y); } if (P2.length >= 8) return this._pistaLista(new PistaTC(P2, cerrada), cerrada, extremo, tipo, desnivel, antes); }
    return this._pistaLista(p, cerrada, extremo, tipo, desnivel, antes);
  },
  _pistaLista(p, cerrada, extremo, tipo, desnivel, antes) {
    const C = G.cuerpo, vueltas = cerrada && p.L < 2200 ? 2 : 1, q0 = p.punto(0);
    if (extremo) { if (C.veh.id !== 'mtb') C.setVeh('mtb'); } else if (C.veh.clase === 'pie' || C.veh.clase === 'rueda') { C.setVeh(G.veh); C.estacionado = null; }
    const d0 = Math.hypot(q0.x - C.x, q0.y - C.y);   /* 4.8 (ChatGPT TC-P1-08): lejos de la salida, el jugador elige ir manejando o saltar a la parrilla */
    const nombres = extremo ? ['Lucía «la Flecha»', 'el Mono Rendón'] : ['Lucía «la Flecha»', 'el Mono Rendón', 'Kira Salazar'], R = [];
    nombres.forEach((nombre, k) => { const off = (k + 1) * 7, q = p.punto(cerrada ? -off : 0), lado = (k % 2 ? 1 : -1) * 2.2, Cb = new MC.Cuerpo(G.M, { x: q.x - Math.sin(q.a) * lado - (cerrada ? 0 : Math.cos(q.a) * off), y: q.y + Math.cos(q.a) * lado - (cerrada ? 0 : Math.sin(q.a) * off), a: q.a, veh: extremo ? 'mtb' : ['tc_noir', 'tc_arrow', 'tc_mercury'][k] || 'carro' }); Cb.ia = true; R.push({ nombre, color: ['#2f80ed', '#27ae60', '#f2c94c'][k], cuerpo: Cb, s: cerrada ? -off : 0, ruta: null, fin: null, habil: .9 + k * .05 }); });
    this.m = { id: extremo ? 'extremo' : 'carrera', extremo, p, vueltas, total: vueltas * p.L, rivales: R, yo: { s: 0, fin: null }, t: -3.5, puntos: 0, aire: 0, enAire: false, antes: extremo ? antes : null, tipo, desnivel };
    if (extremo && BOT.saltar) BOT.saltar.hidden = false;
    const c = this.m; if (d0 > 30) { c.ir = true; G.objetivo = { x: q0.x, y: q0.y, texto: '🏁 Salida' };
      G.ui.dialogo('🏁 La salida está a ' + (d0 >= 1000 ? (d0 / 1000).toFixed(1) + ' km' : Math.round(d0) + ' m'), 'Ve manejando (la flecha te lleva y la cuenta empieza al llegar) o salta directo a la parrilla.', ['🚗 Ir manejando', '⚡ Llevarme ya']).then(i => { if (i === 1 && this.m === c && c.ir) this.alaSalida(c); }); } else this.alaSalida(c);
    G.ui.aviso((extremo ? '🚵 ' : '🏁 ') + tipo + ' · ' + (p.L / 1000).toFixed(1) + ' km' + (vueltas > 1 ? ' · ' + vueltas + ' vueltas' : '') + (desnivel ? ' · ' + desnivel + ' m de bajada' : ''), 2600, 'modos'); return true;
  },
  /* a la parrilla: al aceptar «Llevarme ya» o al llegar manejando a menos de 14 m de la salida */
  alaSalida(c) { const C = G.cuerpo, q = c.p.punto(0); c.ir = false; c.t = -3.5; c._n = null; G.objetivo = null; for (const d of document.querySelectorAll('.mcui .dialogo')) if (d.textContent.includes('La salida está')) d.remove();
    C.x = q.x; C.y = q.y; C.a = q.a; C.v = 0; C.rumboRodado = q.a; G.camara.x = q.x; G.camara.y = q.y; },
  extremoVias(x0, y0, R, signo) { let mejor = null; for (const v of G.M.vias()) { if (v.k > 8) continue; for (let i = 0; i < v.p.length; i += 8) { const x = v.p[i], y = v.p[i + 1]; if (Math.hypot(x - x0, y - y0) > R) continue; const z = G.M.cota(x, y) * signo; if (!mejor || z > mejor.zz) mejor = { x, y, z: z * signo, zz: z }; } } return mejor; },
  pasoCarrera(dt) {
    const c = this.m, C = G.cuerpo; if (c.ir) { const q = c.p.punto(0); if (Math.hypot(q.x - C.x, q.y - C.y) < 14) this.alaSalida(c); else return; }
    c.t += dt; if (c.t < 0) { const n = Math.ceil(-c.t); if (n !== c._n) { c._n = n; G.ui.aviso(n <= 3 ? String(n) : '…', 700, 'cuenta'); } C.v = 0; return; } else if (!c._ya) { c._ya = true; G.ui.aviso('¡YA!', 900, 'cuenta'); }
    const pr = c.p.proyectar(C.x, C.y, c.yo.s % c.p.L), base = Math.floor(Math.max(0, c.yo.s) / c.p.L) * c.p.L; let s = base + pr.s; if (c.p.cerrada && s < c.yo.s - c.p.L * .5) s += c.p.L; if (s > c.yo.s && s - c.yo.s < 60) c.yo.s = s;
    if (pr.d > 110) return this.terminar('Te saliste de la pista: la carrera se acabó');
    for (const r of c.rivales) { if (r.fin != null) continue; if (!r.ruta || r.ruta._i > r.ruta.length - 30) { r.ruta = c.p.plana(r.s, 400); r.ruta._i = null; }
      const gap = (c.yo.s - r.s) / 60; r.cuerpo.escala = clamp(r.habil + gap * .06, .78, 1.12) * (c.extremo ? 1 : .92); MC.Manejo.pilotar(r.cuerpo, r.ruta, dt, { radio: 6 });
      const q = c.p.proyectar(r.cuerpo.x, r.cuerpo.y, r.s % c.p.L), b0 = Math.floor(Math.max(0, r.s) / c.p.L) * c.p.L; let s2 = b0 + q.s; if (c.p.cerrada && s2 < r.s - c.p.L * .5) s2 += c.p.L; if (s2 > r.s && s2 - r.s < 60) r.s = s2; if (r.s >= c.total - 4) r.fin = c.t; }
    if (c.extremo) { if (C.enAire) { c.aire += dt; c.enAire = true; } else if (c.enAire) { c.enAire = false; if (c.aire > .25) { const p = Math.round(c.aire * 100); c.puntos += p; G.ui.aviso('🦘 ¡Salto! +' + p, 900, 'salto'); if (MC.Vida && MC.Vida.onomatopeya) MC.Vida.onomatopeya(C.x, C.y, '¡WOW!', '#ffcc00'); } c.aire = 0; }
      if ((C.deslizamiento || 0) > .2 && Math.abs(C.v) > 5) c.puntos += dt * 30; }
    if (c.yo.fin == null && c.yo.s >= c.total - 4) { c.yo.fin = c.t; this.finCarrera(); }
  },
  finCarrera() {
    const c = this.m, todos = [{ n: 'Tú', t: c.yo.fin, s: c.total }].concat(c.rivales.map(r => ({ n: r.nombre, t: r.fin, s: r.s }))).sort((a, b) => (a.t ?? 1e9) - (b.t ?? 1e9) || b.s - a.s), pos = todos.findIndex(x => x.n === 'Tú') + 1;
    const premio = [300, 150, 60, 0][Math.min(3, pos - 1)], clave = (c.extremo ? 'extremo:' : 'carrera:') + G.id, rec = c.extremo ? this.record(clave, c.puntos, false) : this.record(clave, c.yo.fin, true); G.dinero += premio;
    const txt = 'Llegaste de <b>' + pos + '.º</b> en ' + fmtT(c.yo.fin) + (c.extremo ? ' · <b>' + Math.round(c.puntos) + ' puntos</b>' : '') + (premio ? ' · 💵 ' + plata(premio) : '') + (rec.mejor ? '<br>⭐ ¡Récord nuevo!' : '') + '<br><br>' + todos.map((x, i) => (i + 1) + '. ' + x.n + ' · ' + (x.t != null ? fmtT(x.t) : 'sin llegar')).join('<br>');
    this.terminar(null); MC.emit('modo:resultado', { id: c.extremo ? 'extremo' : 'carrera', pos, t: c.yo.fin, puntos: c.puntos }); G.ui.dialogo(['🥇', '🥈', '🥉', '🏁'][Math.min(3, pos - 1)] + ' ' + c.tipo, txt, ['Listo']);
  },

  /* ---------------- 📦 mandados ---------------- */
  sitio(x, y, r0, r1) { const M = G.M, Lg = (M.lugares || []).filter(L => { const d = Math.hypot(L.x - x, L.y - y); return d > r0 && d < r1; }); for (let k = 0; k < 12; k++) { let p; if (Lg.length && k < 6) { const L = Lg[(Math.random() * Lg.length) | 0]; p = { x: L.x, y: L.y, nombre: L.nombre }; } else { const a = Math.random() * TAU, d = r0 + Math.random() * (r1 - r0); p = { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d }; } const q = M.viaCercana(p.x, p.y, 120, deCarro); if (q && !M.edificioEn(q.x, q.y, 1.5)) return { x: q.x, y: q.y, nombre: p.nombre || M.calle(q.x, q.y) || M.lugarTexto(q.x, q.y) }; } return null; },
  armarMandado(n, prev) {
    const C = G.cuerpo, o = prev || this.sitio(C.x, C.y, 150, 900), d = o && this.sitio(o.x, o.y, 400, 1300); if (!o || !d) return false;
    const dist = Math.hypot(d.x - o.x, d.y - o.y), ant = this.m && this.m.id === 'mandados' ? this.m : null;
    this.m = { id: 'mandados', n, o, d, fase: prev ? 1 : 0, t: 0, limite: Math.round(dist / 8.5 + 35), paquete: 1, esp: 0, vPrev: Math.abs(C.v), ganado: ant ? ant.ganado : 0, hechos: ant ? ant.hechos : 0 };
    G.objetivo = prev ? { x: d.x, y: d.y, texto: d.nombre } : { x: o.x, y: o.y, texto: o.nombre };
    G.ui.aviso('📦 Mandado ' + (n + 1) + ' de 3 · ' + (prev ? 'lleva el paquete a ' : 'recoge en ') + (prev ? d.nombre : o.nombre), 2600, 'modos'); return true;
  },
  pasoMandado(dt) {
    const m = this.m, C = G.cuerpo, v = Math.abs(C.v), dv = m.vPrev - v; m.vPrev = v;
    if (m.fase === 1) { m.t += dt; if (dv > 3.5) { const p = Math.min(.25, dv * .014); m.paquete = Math.max(0, m.paquete - p); G.ui.aviso('📦 ¡Cuidado con el paquete! ' + Math.round(m.paquete * 100) + ' %', 1200, 'paquete'); } }
    const P = m.fase === 0 ? m.o : m.d; if (Math.hypot(P.x - C.x, P.y - C.y) < 22 && v < 3) { m.esp += dt; G.ui.aviso((m.fase ? '📦 Entregando… ' : '📦 Recogiendo… ') + Math.min(100, Math.round(m.esp / 1.2 * 100)) + ' %', 400, 'espera'); } else m.esp = 0;
    if (m.esp < 1.2) return; m.esp = 0;
    if (m.fase === 0) { m.fase = 1; m.t = 0; G.objetivo = { x: m.d.x, y: m.d.y, texto: m.d.nombre }; G.ui.aviso('📦 Listo: llévalo a ' + m.d.nombre + ' en ' + fmtT(m.limite), 2400, 'modos'); return; }
    const dist = Math.hypot(m.d.x - m.o.x, m.d.y - m.o.y), aTiempo = m.t <= m.limite, pago = Math.round((25 + dist / 1000 * 55) * (.3 + .7 * m.paquete) * (aTiempo ? 1.25 : .7));
    m.ganado += pago; m.hechos++; G.dinero += pago; G.ui.aviso('📦 Entregado ' + (aTiempo ? 'a tiempo' : 'tarde') + ' · paquete ' + Math.round(m.paquete * 100) + ' % · 💵 ' + plata(pago), 2600, 'plata');
    if (m.n < 2) { if (this.armarMandado(m.n + 1, m.d) === false) this.finMandados(); } else this.finMandados();
  },
  finMandados() { const m = this.m, rec = this.record('mandados:' + G.id, m.ganado, false); this.terminar(null); MC.emit('modo:resultado', { id: 'mandados', ganado: m.ganado, hechos: m.hechos }); G.ui.dialogo('📦 Mandados del día', m.hechos + ' entregas · ganaste <b>' + plata(m.ganado) + '</b>' + (rec.mejor ? '<br>⭐ ¡Tu mejor día!' : ''), ['Listo']); },

  /* ---------------- 🚲 EnCicla (de Juega EnCicla) ---------------- */
  bicis(s) { const B = this._bicis || (this._bicis = new Map()); if (!B.has(s.id || s.nombre)) B.set(s.id || s.nombre, Math.floor(MC.h2(Math.round(s.x), Math.round(s.y), 7) * 13)); return B.get(s.id || s.nombre); },
  armarEnCicla(desde) {
    const C = G.cuerpo, S = (G.M.transporte && G.M.transporte.encicla) || []; if (!Array.isArray(S) || S.length < 2) return false; if (desde && (!Number.isFinite(desde.x) || !Number.isFinite(desde.y) || !S.includes(desde))) return false; let o = desde;   /* 4.8: la guardia de ChatGPT (antes en 61-chatgpt-guardia-encicla.js), integrada */   /* 4.7 (ChatGPT TC-P1-05): sin estaciones, no se rompe */ if (!o) { let md = 1e9; for (const s of S) { const d = Math.hypot(s.x - C.x, s.y - C.y); if (d < md) { md = d; o = s; } } } if (!o) return false;
    const cands = S.filter(s => s !== o).map(s => ({ s, d: Math.hypot(s.x - o.x, s.y - o.y) })).filter(q => q.d > 300 && q.d < 1300).sort((a, b) => this.bicis(a.s) - this.bicis(b.s) || a.d - b.d); const dest = (cands[0] || {}).s; if (!dest) return false;
    const ant = this.m && this.m.id === 'encicla' ? this.m : null, dist = Math.hypot(dest.x - o.x, dest.y - o.y);
    this.m = { id: 'encicla', o, d: dest, fase: desde ? 1 : 0, t: 0, limite: Math.round(dist / 5 + 40), racha: 0, fuera: 0, puntos: ant ? ant.puntos : 0, vueltas: ant ? ant.vueltas : 0, rojos: ant ? ant.rojos : 0, pasados: new Map(), antes: ant ? ant.antes : C.veh.id, esp: 0 };
    G.objetivo = desde ? { x: dest.x, y: dest.y, texto: '🚲 ' + dest.nombre } : { x: o.x, y: o.y, texto: '🚲 ' + o.nombre };
    if (desde) { if (C.veh.id !== 'bici') C.setVeh('bici'); G.ui.aviso('🚲 Lleva la cicla a ' + dest.nombre + ' (' + this.bicis(dest) + ' de 15 ciclas): la necesitan', 2800, 'modos'); }
    else G.ui.aviso('🚲 Ve a la estación ' + o.nombre + ' y toma una cicla', 2600, 'modos'); return true;
  },
  luces() { const T = G.trafico; if (!T || !T.luces) return null; if (this._lucesDe === T) return this._lucesG; const g = new Map(); for (const L of T.luces().values()) { const k = Math.floor(L.x / 60) + ',' + Math.floor(L.y / 60); if (!g.has(k)) g.set(k, []); g.get(k).push(L); } this._lucesDe = T; return (this._lucesG = g); },
  pasoEnCicla(dt) {
    const m = this.m, C = G.cuerpo, v = Math.abs(C.v);
    if (m.fase === 0) { if (Math.hypot(m.o.x - C.x, m.o.y - C.y) < 16 && v < 2.5) { m.esp += dt; if (m.esp > .8) { m.fase = 1; m.t = 0; C.setVeh('bici'); G.objetivo = { x: m.d.x, y: m.d.y, texto: '🚲 ' + m.d.nombre }; G.ui.aviso('🚲 ¡Cicla tomada! Llévala a ' + m.d.nombre + ' (' + this.bicis(m.d) + ' de 15): por la ciclorruta suma racha', 2800, 'modos'); } } return; }
    m.t += dt;
    /* la racha por la ciclorruta (EnCicla): cada 8 s seguidos sube el multiplicador hasta ×3 */
    if (v > 2 && G.M.esCiclovia(C.x, C.y, 4)) { m.racha += dt; m.fuera = 0; } else if ((m.fuera += dt) > 1.5) m.racha = 0;
    const mult = 1 + Math.min(2, Math.floor(m.racha / 8) * .5); m.puntos += dt * v * .4 * mult; if (mult > 1 && mult !== m._mult) G.ui.aviso('🟩 Racha en la ciclorruta ×' + mult, 1200, 'racha'); m._mult = mult;
    /* el semáforo en rojo (EnCicla): pasar con la luz roja resta */
    const g = this.luces(); if (g && v > 3) { const k = Math.floor(C.x / 60) + ',' + Math.floor(C.y / 60); for (const L of g.get(k) || []) { if (Math.hypot(L.x - C.x, L.y - C.y) > 7) continue; const ult = m.pasados.get(L.nodo) || -99; if (G.t - ult < 20) continue; m.pasados.set(L.nodo, G.t); if (G.trafico.luz(L.nodo, C.a, G.reloj.seg) === 'rojo') { m.puntos = Math.max(0, m.puntos - 50); m.rojos++; m.racha = 0; G.ui.aviso('🚦 ¡Te volaste el semáforo en rojo! −50', 1800, 'rojo'); } } }
    if (Math.hypot(m.d.x - C.x, m.d.y - C.y) < 14 && v < 2.5) { m.esp += dt; if (m.esp < .8) return; m.esp = 0; const B = this._bicis; B.set(m.d.id || m.d.nombre, this.bicis(m.d) + 1); B.set(m.o.id || m.o.nombre, Math.max(0, this.bicis(m.o) - 1)); const bono = Math.max(0, Math.round((m.limite - m.t) * 2)) + 100; m.puntos += bono; m.vueltas++;
      G.ui.aviso('🚲 Cicla devuelta en ' + m.d.nombre + ' · +' + bono + (m.t > m.limite ? ' (tarde)' : ''), 2400, 'modos'); if (m.vueltas < 3) { if (this.armarEnCicla(m.d) === false) this.finEnCicla(); } else this.finEnCicla(); }
  },
  finEnCicla() { const m = this.m, rec = this.record('encicla:' + G.id, m.puntos, false); this.terminar(null); MC.emit('modo:resultado', { id: 'encicla', puntos: m.puntos, rojos: m.rojos }); G.ui.dialogo('🚲 EnCicla', 'Rebalanceaste ' + m.vueltas + ' estaciones · <b>' + Math.round(m.puntos) + ' puntos</b>' + (m.rojos ? ' · 🚦 ' + m.rojos + ' semáforo(s) en rojo' : ' · ningún semáforo en rojo 👏') + (rec.mejor ? '<br>⭐ ¡Récord!' : ''), ['Listo']); },

  /* ---------------- 🚇 metro, tranvía y Metroplús (de El Metro) ---------------- */
  elegirLinea() {
    const C = G.cuerpo, Ls = G.transporte.lineas.filter(L => L.clase !== 'cable' && L.est.length >= 3).map(L => { let d = 1e9; for (const e of L.est) { const q = L.T.at(e.s); d = Math.min(d, Math.hypot(q.x - C.x, q.y - C.y)); } return { L, d }; }).sort((a, b) => a.d - b.d);
    const ico = c => c === 'metro' ? '🚇' : c === 'tranvia' ? '🚋' : '🚌';
    G.ui.menu('🚇 ¿Qué línea manejas?', Ls.slice(0, 8).map((q, i) => ({ id: String(i), texto: ico(q.L.clase) + ' <b>' + q.L.nombre + '</b> <small>' + q.L.est.length + ' estaciones · a ' + (q.d / 1000).toFixed(1) + ' km</small>' })).concat([{ id: 'x', texto: '✕ Cerrar' }]), k => { if (k !== 'x') this.armarTren(Ls[+k].L); });
    return true;
  },
  armarTren(L) {
    const C = G.cuerpo; let i0 = 0, md = 1e9; L.est.forEach((e, i) => { const q = L.T.at(e.s), d = Math.hypot(q.x - C.x, q.y - C.y); if (d < md) { md = d; i0 = i; } });
    const dir = i0 > (L.est.length - 1) / 2 ? -1 : 1, e = L.est[i0];
    this.m = { id: 'tren', tren: true, L, dir, s: e.s, v: 0, sig: i0 + dir, puertas: 4, pasajeros: 40 + ((Math.random() * 60) | 0), t: 0, puntos: 0, paradas: 0, errores: [], vmax: clamp((L.C.vel_ms || 12) * 1.9, 16, 28), antes: null };
    this.m.puertas = .6;   /* 4.7 (hallazgo de Gemini): antes esperaba 4 s con las puertas abiertas y parecía que el tren no andaba */
    G.controlExterno = (dt, ent) => this.manejarTren(dt, ent); G.E._sinJugador = true; this.manejarTren(0, { stick: { x: 0, y: 0, m: 0 } });
    G.ui.aviso((L.clase === 'metro' ? '🚇 ' : L.clase === 'tranvia' ? '🚋 ' : '🚌 ') + L.nombre + ' hacia ' + L.est[dir > 0 ? L.est.length - 1 : 0].nombre + ' · ⚡ acelera, 🛑 frena, para dentro del andén', 3600, 'modos');
  },
  manejarTren(dt, ent) {
    const m = this.m, L = m.L, C = G.cuerpo, B = G.ctl.botones, st = ent.stick || { x: 0, y: 0, m: 0 };
    /* 4.7 (hallazgo de Gemini): el joystick empuja hacia donde va el tren en la pantalla (antes solo leía arriba/abajo: en líneas horizontales no arrancaba) */
    let thr = 0; if (st.m > .15) { const yaw = (G.camara && G.camara.yaw) || 0, c = Math.cos(yaw), sn = Math.sin(yaw), wx = st.x * c + st.y * sn, wy = -st.x * sn + st.y * c, ad = C.a; thr = clamp((wx * Math.cos(ad) + wy * Math.sin(ad)) / Math.max(.2, Math.hypot(wx, wy)) * st.m * 1.4, -1, 1); if (G.vistas && G.vistas.actual.control === 'volante') thr = clamp(-st.y * 1.4, -1, 1); }
    /* 4.8 (auditoría de ChatGPT, input real): con teclado o mando es palanca (↑ acelera, ↓ frena) en cualquier cámara; en la pantalla también, si ⚙️ Flexibilidad lo pide */
    if (ent.teclado || (G.flex && G.flex.tren === 'palanca')) thr = clamp(ent.teclado ? ent.acel : -st.y * 1.4, -1, 1); else if (!st.m && ent.acel) thr = ent.acel;
    if (B.has('turbo') || ent.turbo) thr = 1;
    /* 4.6.1 · ⏫ acelerador fijo también en el tren: prendido acelera solo; al apagarlo frena suave hasta parar (para llegar al andén) */
    if (G.acelFijo) { m._parar = false; thr = 1; } else if (m._fijo) m._parar = true; m._fijo = !!G.acelFijo; if (m._parar) { if (thr > .05 || m.v < .3) m._parar = false; else thr = -.6; }
    if (B.has('freno') || (ent.pulsos && ent.pulsos.has('Space'))) thr = -1;
    m.t += dt; if (m.puertas > 0) { m.puertas -= dt; m.v = 0; if (m.puertas <= 0) G.ui.aviso('🚪 Cierren puertas · siguiente: ' + (L.est[m.sig] ? L.est[m.sig].nombre : 'fin de línea'), 1800, 'puertas'); }
    else { if (thr > .05) m.v += 2.4 * thr * dt; else if (thr < -.05) m.v = Math.max(0, m.v + 3.2 * thr * dt); else m.v = Math.max(0, m.v - .15 * dt); if (m.v > m.vmax) { m.v -= 2.2 * dt; if ((m._lim = (m._lim || 0) - dt) <= 0) { m._lim = 3; G.ui.aviso('⚠️ Velocidad máxima de la línea: ' + Math.round(m.vmax * 3.6) + ' km/h', 1500, 'lim'); } } }
    /* 4.7: lo divertido es arrancar y parar en el andén; el trayecto largo entre estaciones corre ×3 (⏩), como el ⏩ de la carretera */
    const E0 = L.est[m.sig], lejos = E0 && (E0.s - m.s) * m.dir > 450 + m.v * m.v / 6.4 && m.v > 8; m.rapido = lejos;
    m.s = clamp(m.s + m.v * dt * m.dir * (lejos ? 3 : 1), 0, L.T.largo);
    const E = L.est[m.sig]; if (E) { const falta = (E.s - m.s) * m.dir;
      if (falta < -16) { m.errores.push('Te pasaste de ' + E.nombre); m.puntos = Math.max(0, m.puntos - 40); G.ui.aviso('😬 Te pasaste de ' + E.nombre + ': los pasajeros se quejan (−40)', 2400, 'tren'); m.sig += m.dir; }
      else if (Math.abs(falta) < 12 && m.v < .35 && m.puertas <= 0) { const err = Math.abs(falta), pts = Math.max(10, Math.round(100 - err * 8)), bajan = Math.min(m.pasajeros, (Math.random() * 30) | 0), suben = (Math.random() * 40) | 0; m.pasajeros += suben - bajan; m.puntos += pts; m.paradas++; m.puertas = 5;
        G.ui.aviso('🚇 ' + E.nombre + ' · paraste a ' + err.toFixed(1) + ' m de la marca · +' + pts + ' · 👥 ↓' + bajan + ' ↑' + suben, 2600, 'tren'); m.sig += m.dir; } }
    else if (m.puertas <= 0 && m.v < .2) return this.finTren();
    const q = L.T.at(m.s), a = m.dir > 0 ? q.a : q.a + Math.PI, nv = G.M.nivel(q.x, q.y); C.x = q.x; C.y = q.y; C.a = a; C.v = 0; C.eventos.length = 0;
    m.vis = { id: 'yo-tren', linea: L.id, clase: L.clase, color: L.color, x: q.x, y: q.y, a, z: L.clase === 'metro' && nv > 0 ? nv * MC.NIVEL_M + 1 : 0, s: m.s, dir: m.dir, largo: L.C.largo_m || 12, parado: m.v < .3, estacion: m.puertas > 0 };
  },
  finTren() { const m = this.m, rec = this.record('tren:' + G.id, m.puntos, false), pago = Math.round(m.puntos * .6); G.dinero += pago; this.terminar(null); MC.emit('modo:resultado', { id: 'tren', puntos: m.puntos, paradas: m.paradas }); G.ui.dialogo('🚇 Fin de la línea · ' + m.L.nombre, m.paradas + ' paradas en ' + fmtT(m.t) + ' · <b>' + Math.round(m.puntos) + ' puntos</b> · 💵 ' + plata(pago) + (m.errores.length ? '<br>' + m.errores.slice(0, 3).join('<br>') : '<br>Ninguna estación pasada 👏') + (rec.mejor ? '<br>⭐ ¡Récord!' : ''), ['Listo']); },

  /* ---------------- 🛹 zona de trucos y parkour (4.7) ----------------
     Como Alto's Odyssey y los juegos de skate: 🦘 salta; en el aire, el joystick hace girar (180, 360, 720); hay que caer
     derecho (menos de 60° respecto de hacia dónde vas) o es caída. Cada truco encadenado antes de 2,5 s sube el combo
     (hasta ×5); estrellarse lo rompe. A pie es parkour (saltos y vueltas con el mismo sistema). 75 segundos. */
  armarTrucos(centro) {
    const C = G.cuerpo, c = centro || { x: C.x, y: C.y }, antes = C.veh.id; if (C.veh.clase === 'auto' || C.veh.clase === 'moto' || C.veh.clase === 'pesado' || C.veh.clase === 'agua') C.setVeh('skate');
    this.m = { id: 'trucos', c, R: 55, t: 75, puntos: 0, combo: 0, mult: 1, ultimo: -9, aire: 0, giro: 0, enAire: false, aPrev: C.a, racha: 0, antes };
    if (BOT.saltar) BOT.saltar.hidden = false; G.ui.aviso('🛹 ' + (C.veh.clase === 'pie' ? 'Parkour' : 'Zona de trucos') + ': 🦘 salta y, en el aire, gira con el joystick; cae derecho y encadena combos', 3200, 'modos'); return true;
  },
  pasoTrucos(dt) {
    const m = this.m, C = G.cuerpo, stick = G.ctl.leer().stick; m.t -= dt;
    if (C.enAire) {
      /* en el aire: el joystick hace girar (de lado a lado, 9 rad/s); el rumbo del recorrido no cambia */
      if (stick && stick.m > .45) { const w = Math.sign(stick.x || 1) * 9 * dt; C.a += w; m.giro += Math.abs(w); }
      m.aire += dt; m.enAire = true;
    } else if (m.enAire) {
      const mal = Math.abs(MC.angDif(C.a, C.rumboRodado ?? C.a)) > 1.05 && m.giro > .5;
      if (mal) { C.a = C.rumboRodado ?? C.a; C.v *= .3; m.combo = 0; m.mult = 1; m.racha = 0; G.ui.aviso('💥 ¡Caída! Cae derecho la próxima', 1400, 'truco'); }
      else if (m.aire > .18) { const g = m.giro, nombre = g > 5.6 ? '720' : g > 2.7 ? '360' : g > 1.2 ? '180' : C.veh.clase === 'pie' ? 'Salto' : 'Ollie', p = Math.round((m.aire * 90 + g * 45 + 10) * m.mult);
        m.puntos += p; m.combo++; m.racha++; m.mult = Math.min(5, 1 + m.combo * .5); m.ultimo = G.t; G.ui.aviso('🛹 ' + nombre + ' +' + p + (m.mult > 1 ? ' ×' + m.mult.toFixed(1) : ''), 900, 'truco'); if (MC.Vida && MC.Vida.onomatopeya && g > 2.7) MC.Vida.onomatopeya(C.x, C.y, nombre + '!', '#ff6ad5'); }
      m.aire = 0; m.giro = 0; m.enAire = false; C.rumboRodado = C.a;
    }
    if (m.combo && G.t - m.ultimo > 2.5) { m.combo = 0; m.mult = 1; }
    if (C.eventos.includes('choque') && Math.abs(C.v) > 2.5) { m.combo = 0; m.mult = 1; m.racha = 0; }
    if (Math.hypot(m.c.x - C.x, m.c.y - C.y) > m.R * 2.2) G.ui.aviso('↩ Vuelve a la zona de trucos', 1200, 'zona');
    if (m.t <= 0) this.finTrucos();
  },
  finTrucos() { const m = this.m, rec = this.record('trucos:' + G.id, m.puntos, false), pago = Math.round(m.puntos * .15); G.dinero += pago; this.terminar(null); MC.emit('modo:resultado', { id: 'trucos', puntos: m.puntos }); G.ui.dialogo('🛹 Sesión terminada', '<b>' + Math.round(m.puntos) + ' puntos</b>' + (pago ? ' · 💵 ' + plata(pago) : '') + (rec.mejor ? '<br>⭐ ¡Récord en esta ciudad!' : ''), ['Listo']); },

  /* 🛴 Run (4.7): si ya estás en una ciclorruta y en algo que corre Run, entra; si no, marca la ciclorruta más cercana como destino */
  irARun() { const C = G.cuerpo; if (G.Extras && G.Extras.puedeRun && G.Extras.puedeRun()) { G.Extras.entrarRun(); return true; }
    const q = G.M.viaCercana(C.x, C.y, 2500, v => v.k === MC.VIA.CICLO); if (!q) return false; G.destinoLibre = { x: q.x, y: q.y, nombre: 'Ciclorruta · Run' };
    G.ui.aviso('🛴 La ciclorruta más cercana está a ' + Math.round(Math.hypot(q.x - C.x, q.y - C.y)) + ' m: síguela (📍). Allá, a pie o en bici, toca 🛴 Run', 3200, 'modos'); return true; },

  /* ---------------- 🧪 laboratorio ---------------- */
  laboratorio() {
    const C = G.cuerpo, est = MC.Estilo.lista(), climas = ['despejado', 'nublado', 'lluvia', 'tormenta', 'niebla'];
    const it = [{ id: 'estilo', texto: '🎨 Estilo gráfico: ' + ((est.find(e => e.id === MC.estilo) || {}).n || MC.estilo) }, { id: 'hora', texto: '🕐 Hora: ' + Math.floor(G.reloj.hora) + ':' + String(Math.floor(G.reloj.min % 60)).padStart(2, '0') + ' (+3 h)' }, { id: 'clima', texto: '🌦️ Clima: ' + (G.climaForzado || 'el real') }, { id: 'veh', texto: '🚗 Cualquier vehículo del motor' }, { id: 'x', texto: '✕ Cerrar' }];
    G.ui.menu('🧪 Laboratorio del motor', it, k => {
      if (k === 'estilo') { const i = est.findIndex(e => e.id === MC.estilo); MC.estilo = est[(i + 1) % est.length].id; if (G.vistas && G.vistas.losas) { G.vistas.losas.limpiar(); if (G.vistas.losasLejos) G.vistas.losasLejos.limpiar(); } this.laboratorio(); }
      else if (k === 'hora') { G.reloj.min = (G.reloj.min + 180) % 1440; this.laboratorio(); }
      else if (k === 'clima') { const i = climas.indexOf(G.climaForzado); G.climaForzado = i >= climas.length - 1 ? null : climas[i + 1]; G.clima.forzar(G.climaForzado); this.laboratorio(); }
      else if (k === 'veh') { const L = TC.VEHICULOS.map(v => ({ id: 'tc:' + v.id, texto: (v.icon || '🚗') + ' ' + v.n })).concat(['mtb', 'bmx', 'ebike', 'patinete', 'skate', 'patines', 'moto', 'quad', 'jetpack', 'camion', 'buseta'].map(id => ({ id: 'mc:' + id, texto: '🧩 ' + id }))); G.ui.menu('🚗 Vehículo', L, v => { if (v.startsWith('tc:')) { if (C.veh.clase === 'pie') C.setVeh(v.slice(3)); cambiarVeh(v.slice(3)); } else C.setVeh(v.slice(3)); }); }
    });
    return true;
  },

  /* ---------------- los ganchos del ciclo ---------------- */
  paso(dt) { const m = this.m; if (!m || !(dt > 0)) return; if (G.busq.nivel > 0) G.busq.limpiar();
    if (m.id === 'carrera' || m.id === 'extremo') this.pasoCarrera(dt); else if (m.id === 'mandados') this.pasoMandado(dt); else if (m.id === 'encicla') this.pasoEnCicla(dt); else if (m.id === 'trucos') this.pasoTrucos(dt);
    if (this.m && this.m.vis) G.E.vehiculos = (G.E.vehiculos || []).concat([this.m.vis]); },
  entrada(e) { const m = this.m; if (!m) return; if ((m.id === 'carrera' || m.id === 'extremo') && m.t < 0 && !m.ir) { e.dir = null; e.acel = 0; e.giro = 0; } if (m.id === 'extremo' || m.id === 'trucos') { e.salto = e.salto || G.ctl.botones.has('saltar'); if (m.id === 'extremo') e.turbo = false; } },
  trafico() { const m = this.m; if (!m || !m.rivales) return []; return m.rivales.map(r => ({ id: r.nombre, tipo: m.extremo ? 'bici' : 'carro', clase: 'auto', x: r.cuerpo.x, y: r.cuerpo.y, a: r.cuerpo.a, v: r.cuerpo.v, color: r.color, largo: m.extremo ? 1.8 : 4.4, ancho: m.extremo ? .6 : 1.8 })); },
  obstaculos() { const m = this.m; if (!m || !m.rivales) return []; return m.rivales.map(r => ({ x: r.cuerpo.x, y: r.cuerpo.y, r: m.extremo ? .5 : 1.2, cuerpo: r.cuerpo })); },   /* 5.1: cuerpo → el manejo real lo empuja al chocarlo */
  hud() {
    const m = this.m, f = (k, t) => { const el = G.ui.ficha(k, t); el.hidden = !t; }; if (BOT.modos) BOT.modos.hidden = !(this.disponible() || m); if (!m) return;
    if ((m.id === 'carrera' || m.id === 'extremo') && m.ir) { const q = m.p.punto(0); f('m1', '🏁 Ve a la salida · ' + Math.round(Math.hypot(q.x - G.cuerpo.x, q.y - G.cuerpo.y)) + ' m'); f('m2', ''); f('m3', ''); G.objetivo = { x: q.x, y: q.y, texto: '🏁 Salida' }; }
    else if (m.id === 'carrera' || m.id === 'extremo') { const pos = 1 + m.rivales.filter(r => (r.fin != null && m.yo.fin == null) || r.s > m.yo.s).length; f('m1', '🏁 ' + pos + '.º de ' + (m.rivales.length + 1) + (m.vueltas > 1 ? ' · vuelta ' + Math.min(m.vueltas, 1 + Math.floor(Math.max(0, m.yo.s) / m.p.L)) + '/' + m.vueltas : '')); f('m2', '⏱ ' + fmtT(m.t)); f('m3', m.extremo ? '🦘 ' + Math.round(m.puntos) + ' pts' : ''); G.objetivo = m.p.punto(m.yo.s + 60); G.objetivo.texto = ''; }
    else if (m.id === 'mandados') { f('m1', '📦 ' + (m.n + 1) + '/3 · ' + Math.round(m.paquete * 100) + ' %'); f('m2', m.fase ? '⏱ ' + fmtT(m.limite - m.t) : '📍 recoger'); f('m3', '💵 ' + plata(m.ganado)); }
    else if (m.id === 'encicla') { f('m1', '🚲 ' + (m.vueltas + 1) + '/3 · ' + Math.round(m.puntos) + ' pts'); f('m2', m.fase ? '⏱ ' + fmtT(m.limite - m.t) + ' · ×' + (1 + Math.min(2, Math.floor(m.racha / 8) * .5)) : '📍 toma una cicla'); f('m3', m.rojos ? '🚦 ' + m.rojos : ''); }
    else if (m.id === 'trucos') { f('m1', '🛹 ' + Math.round(m.puntos) + ' pts'); f('m2', '⏱ ' + fmtT(m.t) + (m.combo ? ' · combo ×' + m.mult.toFixed(1) : '')); f('m3', m.racha ? '🔥 ' + m.racha : ''); G.objetivo = Math.hypot(m.c.x - G.cuerpo.x, m.c.y - G.cuerpo.y) > m.R ? { x: m.c.x, y: m.c.y, texto: 'zona de trucos' } : null; }
    else if (m.id === 'tren') { const E = m.L.est[m.sig]; f('m1', '🚇 ' + m.L.nombre); f('m2', E ? '➡ ' + E.nombre + ' · ' + Math.max(0, Math.round((E.s - m.s) * m.dir)) + ' m' : '🏁 fin de línea'); f('m3', (m.rapido ? '⏩ ×3 · ' : '') + '👥 ' + m.pasajeros + ' · ' + Math.round(m.puntos) + ' pts'); G.ui.velocidad(m.v, '🚇'); if (E) G.objetivo = Object.assign(m.L.T.at(E.s), { texto: E.nombre }); }
  },
  capas(g, pr, d) { const m = this.m; if (!m || !m.p) return; const c = m.p, paso = 40; g.save(); g.strokeStyle = 'rgba(255,204,0,.55)'; g.lineWidth = 3 * d; g.setLineDash([8 * d, 8 * d]); g.beginPath(); let ok = false; for (let s = m.yo.s; s < Math.min(m.total, m.yo.s + 420); s += paso) { const q = c.punto(s), sp = pr(q.x, q.y, 0); if (!sp) { ok = false; continue; } if (!ok) g.moveTo(sp[0], sp[1]); else g.lineTo(sp[0], sp[1]); ok = true; } g.stroke(); g.restore(); },
  mapa(pts) { const m = this.m; if (!m) return; if (m.rivales) for (const r of m.rivales) pts.push({ x: r.cuerpo.x, y: r.cuerpo.y, color: r.color }); if (m.id === 'encicla') for (const s of G.M.transporte.encicla) if (Math.hypot(s.x - G.cuerpo.x, s.y - G.cuerpo.y) < 1500) pts.push({ x: s.x, y: s.y, color: '#3fae5a' }); }
};
EXTRAS.paso.push(dt => Modos.paso(dt)); EXTRAS.entrada.push(e => Modos.entrada(e)); EXTRAS.trafico.push(() => Modos.trafico()); EXTRAS.obstaculos.push(() => Modos.obstaculos());
EXTRAS.hud.push(() => Modos.hud()); EXTRAS.capas.push((g, pr, d) => Modos.capas(g, pr, d)); EXTRAS.mapa.push(pts => Modos.mapa(pts));
EXTRAS.ui.push(b => { b('modos', '🎮', 'Modos', () => Modos.menu()); b('saltar', '🦘', 'Saltar', () => {}); BOT.saltar.hidden = true; BOT.saltar.addEventListener('pointerdown', () => G.ctl.boton('saltar', true)); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) BOT.saltar.addEventListener(ev, () => G.ctl.boton('saltar', false)); });
G.Modos = Modos;

/* =====================================================================
   4.7 · ACTIVIDADES EN EL MUNDO ABIERTO (el autor: «todo módulo de juego debe estar presente en el mundo abierto, y jugarlo allí
   debe ser la misma experiencia que en el módulo cerrado»). Como los eventos de Forza Horizon o los íconos de GTA: marcas en la
   calle, en el minimapa y en el mapa. Al llegar (cerca y despacio) aparece ▶ y el modo arranca ahí con el MISMO código del menú 🎮.
   Se ubican por celdas de 1,2 km alrededor del jugador con datos reales: avenidas (🏁), lomas (🚵), lugares (📦), plazas (🛹),
   ciclorrutas (🛴), estaciones EnCicla (🚲) y de metro, tranvía y Metroplús (🚇). Se calculan de a poco (dos celdas por cuadro).
   ===================================================================== */
const ACT = { carrera: ['🏁', '#ffcc00', 'Carrera'], extremo: ['🚵', '#7cd67c', 'Bajada extrema'], mandados: ['📦', '#ffb066', 'Mandados'], encicla: ['🚲', '#3fae5a', 'EnCicla: rebalanceo'], tren: ['🚇', '#4fb3ff', 'Manejar el tren'], trucos: ['🛹', '#ff6ad5', 'Zona de trucos'], run: ['🛴', '#00e0c6', 'Run en la ciclovía'], mirador: ['🌄', '#ffd59e', 'Mirador'] };   /* 4.8: miradores (plan de Gemini: el mundo vivo también se contempla) */
const Actividades = {
  L: 1200, celdas: new Map(), cerca: null, _visto: new Set(), _lista: [], _t: 0,
  celda(cx, cy) {
    const k = G.id + ':' + cx + ',' + cy; if (this.celdas.has(k)) return this.celdas.get(k);
    const M = G.M, L = this.L, x0 = cx * L, y0 = cy * L, out = [], h = n => MC.h2(cx * 7 + n, cy * 13 + n, 31 + n), V = MC.VIA, en = (x, y) => x >= x0 && y >= y0 && x < x0 + L && y < y0 + L;
    if (x0 + L > 0 && y0 + L > 0 && x0 < M.ancho && y0 < M.alto) {
      const px = x0 + L * (.2 + .6 * h(1)), py = y0 + L * (.2 + .6 * h(2));
      if (h(3) < .7) { const q = M.viaCercana(px, py, 500, v => v.k === V.AVENIDA || v.k === V.AUTOPISTA || v.k === V.CARRERA); if (q && en(q.x, q.y)) out.push({ t: 'carrera', x: q.x, y: q.y }); }
      { let zmax = -1e9, zmin = 1e9, best = null; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = x0 + L * (i + .5) / 4, y = y0 + L * (j + .5) / 4, z = M.cota(x, y); if (z > zmax) { zmax = z; best = { x, y }; } if (z < zmin) zmin = z; }
        if (zmax - zmin > 80 && h(7) < .35 && best) { const q = M.viaCercana(best.x, best.y, 220); if (q && en(q.x, q.y)) out.push({ t: 'extremo', x: q.x, y: q.y }); }
        if (zmax - zmin > 40 && h(8) < .3 && best) { const q = M.viaCercana(best.x, best.y, 160); if (q && en(q.x, q.y)) { let b = ''; try { b = M.barrio(q.x, q.y); } catch (e) { /* sin barrios */ } out.push({ t: 'mirador', x: q.x, y: q.y, nombre: b || M.calle(q.x, q.y) || '' }); } } }
      if (h(4) < .6) { const mx = x0 + L * (.2 + .6 * h(5)), my = y0 + L * (.2 + .6 * h(6)), Lg = M.lugarCercano(mx, my, 500), q = Lg ? M.viaCercana(Lg.x, Lg.y, 150, v => v.k >= 1 && v.k <= 4) : M.viaCercana(mx, my, 300, v => v.k === V.CALLE || v.k === V.CARRERA); if (q && en(q.x, q.y)) out.push({ t: 'mandados', x: q.x, y: q.y, nombre: Lg ? Lg.nombre : M.calle(q.x, q.y) }); }   /* el despacho: un lugar con nombre o, si no hay, una calle del barrio */
      { let pl = null; for (let j = 0; j < 6 && !pl; j++) for (let i = 0; i < 6 && !pl; i++) { const x = x0 + L * (i + .5) / 6, y = y0 + L * (j + .5) / 6; if (M.suelo(x, y) === MC.TT.PLAZA) pl = { x, y }; } if (pl) out.push({ t: 'trucos', x: pl.x, y: pl.y }); }
      { const q = M.viaCercana(x0 + L / 2, y0 + L / 2, 620, v => v.k === V.CICLO); if (q && en(q.x, q.y)) out.push({ t: 'run', x: q.x, y: q.y }); }
      try { for (const s of M.transporte.encicla || []) if (en(s.x, s.y)) out.push({ t: 'encicla', x: s.x, y: s.y, nombre: s.nombre }); } catch (e) { /* sin EnCicla */ }
      try { const vistos = new Set(); for (const l of (G.transporte && G.transporte.lineas) || []) { if (l.clase === 'cable' || l.est.length < 3) continue; for (const e of l.est) { const q = l.T.at(e.s); if (!en(q.x, q.y) || vistos.has(e.nombre)) continue; vistos.add(e.nombre); out.push({ t: 'tren', x: q.x, y: q.y, nombre: e.nombre }); } } } catch (e) { /* sin metro */ }
    }
    this.celdas.set(k, out); return out;
  },
  /* las marcas a la vista (celdas alrededor del jugador), de a dos celdas nuevas por llamada para no trabar */
  actualizar() {
    const C = G.cuerpo, L = this.L, cx = Math.floor(C.x / L), cy = Math.floor(C.y / L), lista = []; let nuevas = 0;
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const k = G.id + ':' + (cx + i) + ',' + (cy + j); if (!this.celdas.has(k)) { if (nuevas >= 2) continue; nuevas++; } for (const a of this.celda(cx + i, cy + j)) lista.push(a); }
    this._lista = lista; return lista;
  },
  hud() {
    const C = G.cuerpo; if (!G.M || !G.M.esCiudad || !C) { this.cerca = null; if (BOT.jugarAqui) BOT.jugarAqui.hidden = true; return; }
    const L = this.actualizar(); let cerca = null, bd = 1e9; const libre = Modos.disponible() && !Modos.m;
    if (libre) for (const a of L) { const d = Math.hypot(a.x - C.x, a.y - C.y), r = a.t === 'tren' ? 45 : a.t === 'trucos' || a.t === 'mirador' ? 30 : 18; if (d < r && d < bd) { bd = d; cerca = a; } }
    this.cerca = cerca; if (BOT.jugarAqui) { BOT.jugarAqui.hidden = !cerca; if (cerca) { const T = ACT[cerca.t]; BOT.jugarAqui.innerHTML = T[0] + '<small>' + (cerca.t === 'mirador' ? '▶ Mirar' : '▶ Jugar') + '</small>'; BOT.jugarAqui.title = T[2]; } }
    if (cerca) { const k = cerca.t + ':' + Math.round(cerca.x) + ',' + Math.round(cerca.y); if (!this._visto.has(k)) { this._visto.add(k); const T = ACT[cerca.t]; G.ui.aviso(T[0] + ' ' + T[2] + (cerca.nombre ? ' · ' + cerca.nombre : '') + ' · toca ▶ Jugar', 2600, 'actividad'); } }
  },
  jugar() {
    const a = this.cerca; if (!a) return; const C = G.cuerpo;
    if (a.t === 'mirador') return this.mirar(a);
    if (a.t === 'run') { if (C.veh.clase !== 'pie' && !C.veh.run) return G.ui.aviso('🛴 Run es a pie o en bici, patinete, skate o patines: bájate (🚪) o cambia de vehículo', 2600, 'run'); if (G.Extras && G.Extras.entrarRun) return G.Extras.entrarRun(); return; }
    if (a.t === 'tren') { const Ls = G.transporte.lineas.filter(L => L.clase !== 'cable' && L.est.some(e => e.nombre === a.nombre)); if (Ls.length === 1) { Modos.armarTren(Ls[0]); MC.emit('modo:inicio', { id: 'tren', ok: true, desde: 'mundo' }); return; } return Modos.empezar('tren'); }
    Modos.empezar(a.t, { centro: { x: a.x, y: a.y } });
  },
  /* 🌄 mirador: la cámara de cine orbita 7 s sobre el valle, dice el barrio y cuenta los miradores descubiertos */
  mirar(a) {
    const k = G.id + ':' + Math.round(a.x) + ',' + Math.round(a.y), S = leerG(), vistos = S.miradores || [], nuevo = !vistos.includes(k), ant = this._mirAnt || G.vistaId;
    if (nuevo) { escribirG({ miradores: vistos.concat(k).slice(-500) }); G.dinero += 50; }
    G.cuerpo.v = 0; this._mirAnt = ant; G.vistaId = 'cine'; G.vistas.usar('cine', G.E);
    G.ui.aviso('🌄 Mirador' + (a.nombre ? ' · ' + a.nombre : '') + ' · ' + Math.round(G.M.cota(a.x, a.y)) + ' m' + (nuevo ? ' · ¡nuevo! ' + (vistos.length + 1) + ' descubiertos · 💵 +' + plata(50) : ' · ya lo conocías'), 3600, 'mirador');
    clearTimeout(this._mir); this._mir = setTimeout(() => { const v = this._mirAnt; this._mirAnt = null; if (G.vistaId === 'cine') { G.vistaId = camarasAqui().includes(v) ? v : 'cenital'; G.vistas.usar(G.vistaId, G.E); } }, 7000);
    MC.emit('modo:resultado', { id: 'mirador', nuevo, total: vistos.length + (nuevo ? 1 : 0) });
  },
  capas(g, pr, d) {
    const C = G.cuerpo; if (!C || Modos.m) return; const t = G.t;
    for (const a of this._lista) { const dd = Math.hypot(a.x - C.x, a.y - C.y); if (dd > 260) continue; const sp = pr(a.x, a.y, 0); if (!sp) continue; const T = ACT[a.t], s = Math.max(12, 18 * d) * (1 + .08 * Math.sin(t * 3 + a.x));
      g.save(); g.globalAlpha = clamp(1.25 - dd / 260, .25, 1); g.fillStyle = T[1] + '40'; g.strokeStyle = T[1]; g.lineWidth = 3 * d; g.beginPath(); g.arc(sp[0], sp[1], s * 1.5, 0, TAU); g.fill(); g.stroke();
      g.font = Math.round(s * 1.3) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(T[0], sp[0], sp[1] - s * 1.9); g.restore(); }
  },
  mapa(pts) { if (Modos.m) return; const C = G.cuerpo; for (const a of this._lista) if (Math.hypot(a.x - C.x, a.y - C.y) < 1600) pts.push({ x: a.x, y: a.y, color: ACT[a.t][1] }); }
};
EXTRAS.hud.push(() => Actividades.hud()); EXTRAS.capas.push((g, pr, d) => Actividades.capas(g, pr, d)); EXTRAS.mapa.push(pts => Actividades.mapa(pts));
EXTRAS.ui.push(b => { b('jugarAqui', '▶', 'Jugar aquí', () => Actividades.jugar()); BOT.jugarAqui.hidden = true; });
G.Actividades = Actividades;
EXTRAS.hud.push(() => { if (typeof camaraCoherente === 'function') camaraCoherente(); });   /* 4.7: Arcade y Vuelo solo donde tienen sentido */
