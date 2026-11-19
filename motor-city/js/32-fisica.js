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
      /* árboles, postes, bancas, rocas, palmas… y lo que el juego diga (tráfico, gente) */
      if (!(this.z > 1.2)) { const o = Terreno.obstaculo(this, x, y, V.clase === 'pie' ? .25 : Math.min(.9, (V.ancho || .6) / 2)); if (o) return this._bloquea(o.t ? ({ arbol: 'un árbol', poste: 'un poste', roca: 'una roca', banca: 'una banca', paradero: 'un paradero', palma: 'una palma' }[o.t] || 'algo') : (o.motivo || 'algo')); }
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
    const dx = Math.cos(this.a) * this.v * dt, dy = Math.sin(this.a) * this.v * dt, nx = this.x + dx, ny = this.y + dy;
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
