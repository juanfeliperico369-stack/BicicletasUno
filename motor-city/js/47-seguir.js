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
