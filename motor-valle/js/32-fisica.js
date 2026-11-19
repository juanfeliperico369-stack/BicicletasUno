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
