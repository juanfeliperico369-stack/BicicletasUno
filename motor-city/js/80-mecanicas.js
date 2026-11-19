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
