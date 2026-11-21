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
const CALZADA_TT = new Set([4, 5, 11, 14]);   /* calle, avenida, puente y autopista: salir de ahí es subir un bordillo */
const MENOR_IA = new Set(['poste', 'banca', 'paradero', 'caneca', 'hidrante']), BORDE_IA = new Set([TT.BLDG, TT.BRICK]);   /* lo menor del andén que la IA atropella (4.2) */
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
  puede(x, y, sondeo = false) {
    const V = this.veh; if (V.clase === 'aire' && this.z > 3) return this.mundo.dentro(x, y);
    if (this.paso) return true;
    /* un tablero o una rampa que queda entre los pies y la cabeza es una pared (no se atraviesa ni se pasa por debajo) */
    const pie = this.zPaso + this.z, alto = this.altoCuerpo(); for (const S of this.superficies(x, y)) if (S.P && S.h - pie > this.escalonDin() && S.h - pie < alto) return false;
    /* terreno (2.4): agua y su profundidad, material, pendiente y barrancos, borde del mundo (MC.Terreno.paso) */
    const T = Terreno.paso(this, x, y); if (!T.ok && !(this.ia && !T.agua && BORDE_IA.has(this.mundo.suelo(x, y)) && !this.mundo.edificioEn(x, y, .3))) { if (T.agua) this.bloqueoAgua = true; return this._bloquea(T.motivo); }   /* 4.2: las casillas del borde de la calle (ladrillo o edificio sin edificio real encima) no traban a la IA; la huella de verdad se revisa abajo */
    if (this.chocaEdificios && V.clase !== 'agua') {
      /* edificios: siempre (sobre la calle solo si se mete más de 1 m en la huella: los datos se solapan un poco con la vía),
         y también los edificios de los sitios y las partes bajas de los emblemáticos */
      const tt = this.mundo.suelo(x, y), enVia = VIA_TT.has(tt), r = V.clase === 'pie' ? .2 : .4;
      if (this.mundo.edificioEn(x, y, enVia ? -1 : r)) return this._bloquea('un edificio');
      if (!enVia && Terreno.sitioEn(this.mundo, x, y)) return this._bloquea('un edificio');
      /* árboles, postes, bancas, rocas, palmas… y lo que el juego diga (tráfico, gente). 4.0.2: los carros de la IA (this.ia) sobre la calle no chocan con lo menor del andén y el separador */
      /* 4.2: y en el andén, los carros de la IA tampoco se trancan con lo menor (poste, banca, paradero, caneca, hidrante): lo atropellan como en GTA; árboles y rocas sí los paran */
      if (!(this.z > 1.2) && !(this.ia && enVia)) { const o = Terreno.obstaculo(this, x, y, V.clase === 'pie' ? .25 : Math.min(.9, (V.ancho || .6) / 2)); /* 4.5: lo que se rompe (canecas, conos, bancas, hidrantes, postes, paraderos…) no frena en seco: se lo lleva por delante si va rápido */
        if (o && !sondeo && MC.Rotos && MC.Rotos.puede(o, this)) { MC.Rotos.romper(this.mundo, o, this); return true; }
        if (o && sondeo && MC.Rotos && MC.Rotos.puede(o, this)) return true;
        if (o && !(this.ia && V.clase !== 'pie' && MENOR_IA.has(o.t))) return this._bloquea(o.t ? ({ arbol: 'un árbol', poste: 'un poste', roca: 'una roca', banca: 'una banca', paradero: 'un paradero', palma: 'una palma' }[o.t] || 'algo') : (o.motivo || 'algo')); }
    }
    return true;
  }
  /* por qué no pasó (para que el juego lo diga una vez: «🌊 el agua está muy honda») */
  _bloquea(motivo) { this.bloqueo = motivo || 'algo'; this.tBloqueo = 1.2; return false; }
  /* 4.6 · la física va al ritmo del reloj aunque el celular dé pocos cuadros: pasos de a lo sumo 1/40 s.
     (Antes se cortaba el tiempo de cada cuadro —a 0,1 s aquí y a 0,05 s en el modelo del taller—: con 15 cuadros por segundo el
     juego andaba en cámara lenta, y eso se sentía «pesado».) */
  actualizar(dt, E = {}) {
    dt = Math.min(dt || 0, .2); if (dt <= .026) return this._paso(dt, E);
    const n = Math.min(8, Math.ceil(dt / .025)), h = dt / n, ev = new Set();
    for (let i = 0; i < n; i++) { this._paso(h, i ? Object.assign({}, E, { salto: false }) : E); for (const e of this.eventos) ev.add(e); }
    this.eventos.length = 0; for (const e of ev) this.eventos.push(e); return this;
  }
  _paso(dt, E = {}) {
    const V = this.veh, M = this.mundo; this.eventos.length = 0; this._dt = dt;
    this.corriendo = !!E.correr && V.id === 'pie';
    /* rumbo deseado (joystick que apunta en el mundo) o giro (volante) */
    let acel = E.acel || 0, giro = E.giro || 0;
    /* 4.5 · el joystick apunta en el mundo: el giro sigue la dirección con amortiguación (no zigzaguea a alta velocidad) y el acelerador
       se recoge en las curvas cerradas para poder darlas (como la asistencia de frenado de los juegos de carreras para celular) */
    if (E.dir && E.dir.m > .08) { const des = Math.atan2(E.dir.y, E.dir.x), d = angDif(this.a, des); giro = clamp(d * 2.2 - (this.giroV || 0) * .12, -1, 1); acel = E.dir.m * (V.clase === 'pie' ? 1 : clamp(1.15 - Math.abs(d) * .55, .25, 1)); if (V.clase === 'pie' && Math.abs(d) > .1) this.a += clamp(d, -dt * 9, dt * 9); }
    /* 4.5 · asistencia que evita estrellarse: mira adelante (más lejos cuanto más rápido); si hay pared y el jugador no está girando
       fuerte, empuja el volante hacia el lado libre que más se parece a lo que pide. Se apaga con E.asistencia === false */
    ({ giro, acel } = this._asistencia(E, giro, acel, dt));
    /* suelo, pendiente y velocidad objetivo */
    this.tt = M.suelo(this.x, this.y); this.pend = this.paso ? 0 : M.pendiente(this.x, this.y, this.a, 12); this.tBloqueo = Math.max(0, (this.tBloqueo || 0) - dt); if (!this.tBloqueo) this.bloqueo = null;
    /* el terreno manda en la velocidad: vadear, nadar, arena, nieve, monte (MC.Terreno) */
    const Tp = this.paso || (V.clase === 'aire' && this.z > 3) ? { f: 1 } : Terreno.paso(this, this.x, this.y); this.nadando = !!Tp.nada; this.vadeando = !!Tp.vadea;
    const suelo = this.paso ? 1 : Math.max(.12, Tp.ok === false ? .15 : Tp.f), loma = V.electrico ? clamp(1 - this.pend * .4, .85, 1.15) : Vehiculos.loma(V, this.pend);
    /* 4.6 · manejo arcade (el de Juega EnCicla, llevado a todos los vehículos): a pie, bicis, motos, carros y pesados */
    if (V.clase !== 'aire' && V.clase !== 'agua' && !this.nadando && !(MC.opciones && MC.opciones.manejo === 'simulacion')) return this._arcade(dt, E, suelo, loma);
    const vmax = this.vmax() * suelo * loma * (E.turbo ? 1.25 : 1), objetivo = acel >= 0 ? vmax * acel : -vmax * .35 * -acel;
    const empuje = acel > 0 ? V.acc * (E.turbo ? 1.4 : 1) : V.freno;
    if (this.enAire && V.clase !== 'aire') { /* en el aire no se acelera */ }
    else if (acel === 0) this.v -= Math.sign(this.v) * Math.min(Math.abs(this.v), (V.clase === 'pie' ? 6 : V.clase === 'rueda' ? .35 + Math.max(0, this.pend) * 4 : .8) * dt);
    else this.v += clamp(objetivo - this.v, -V.freno * dt, empuje * dt);
    if (!V.electrico && V.clase === 'rueda' && !this.enAire && this.pend < -.03 && acel <= 0) this.v += -this.pend * 9.8 * .55 * dt;   // la bajada empuja
    /* giro: más ágil quieto que rápido; inercia corta */
    const tg = lerp(V.giro[0], V.giro[1], clamp(Math.abs(this.v) / Math.max(1, vmax), 0, 1)) * giro * (V.clase === 'pie' ? 0 : 1) * (this.v < 0 ? -1 : 1);
    this.giroV = lerp(this.giroV, tg * (E.derrape && Math.abs(this.v) > 6 ? 1.45 : 1), Math.min(1, dt * 10)); if (V.clase !== 'pie' || !E.dir) this.a += this.giroV * dt * (V.clase === 'pie' ? 1 : Math.min(1, .25 + Math.abs(this.v) / 2.5));
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
    /* 4.5 · agarre: el rumbo por donde rueda sigue a la trompa con un retraso; en piso suelto o con el freno de mano (E.derrape)
       el retraso es grande y el carro derrapa (y avisa 'derrape' para las marcas de llanta y el humo) */
    const agarre = !auto ? 99 : E.derrape && Math.abs(this.v) > 6 ? 1.6 : suelto ? 2.8 : 16 - clamp(Math.abs(this.v) / 30, 0, 1) * 6;
    const desliz = angDif(rumboPrevio, this.a); this.rumboRodado = agarre >= 99 ? this.a : rumboPrevio + desliz * (1 - Math.exp(-dt * agarre));
    this.deslizamiento = auto ? Math.abs(angDif(this.rumboRodado, this.a)) : 0;
    if (auto && this.deslizamiento > .22 && Math.abs(this.v) > 6 && !this.enAire) { this.eventos.push('derrape'); this.v *= 1 - dt * .35 * Math.min(1, this.deslizamiento); }
    this.inclinacion = auto ? Math.atan(clamp(this.pend,-.65,.65)) : 0;
    const dx = Math.cos(this.rumboRodado) * this.v * dt, dy = Math.sin(this.rumboRodado) * this.v * dt, nx = this.x + dx, ny = this.y + dy;
    const x0m = this.x, y0m = this.y; this._mover(dx, dy, dt);
    this.choque = Math.max(0, this.choque - dt);
    this._despues(E, x0m, y0m, dt);
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
  /* 4.6 · MANEJO ARCADE, tomado de Juega EnCicla (src/js/30-ride.js), que es el que se siente fluido, y llevado a todos los vehículos:
     - el giro sigue al joystick: la velocidad de giro deseada es 6,5 × el ángulo que falta, con tope (alto quieto, menor a toda
       marcha) y una inercia corta (tw, décimas de segundo);
     - el arranque va directo a la velocidad pedida (min(acc, 2 × lo que falta)), y si el joystick apunta lejos del rumbo baja la
       velocidad para poder girar (·(0,3 + 0,7·cos Δ)); el freno es fuerte; al soltar, rueda y se detiene solo;
     - el carro va por donde apunta (no derrapa por nada); solo con el freno de mano (E.derrape) la cola se cruza, y al soltarlo se
       endereza rápido;
     - en una pared prueba primero ángulos cercanos (±0,35, ±0,7, ±1,1 rad: la «asistencia de esquinas» de EnCicla) y resbala;
       si no hay salida, se detiene. Lo menor del andén se tumba (MC.Rotos) y el desatascador sigue de respaldo. */
  _arcade(dt, E, suelo, loma) {
    const V = this.veh, M = this.mundo, S = Vehiculos.arcade(V), A = this._arc || (this._arc = { w: 0 }), pie = V.clase === 'pie', motor = V.clase === 'auto' || V.clase === 'pesado' || V.clase === 'moto';
    const lluvia = (E.lluvia || (E.clima && E.clima.lluvia) || 0) > .35, deriva = !!E.derrape && motor && Math.abs(this.v) > 7, turbo = !!E.turbo && !pie;
    let max = this.vmax() * suelo * loma * (turbo ? 1.25 : 1); if (pie && E.dir && E.dir.m > .9 && !this.corriendo) max = Math.max(max, V.vcorre * .62);   /* a pie, el joystick a fondo ya trota */
    const kw = 1 - Math.exp(-dt / S.tw), wm = (S.w1 + (S.w0 - S.w1) * clamp(1 - Math.abs(this.v) / Math.max(1, max), 0, 1)) * (lluvia ? .85 : 1) * (deriva ? 1.6 : 1);
    let tv = 0, frena = false, suelta = false;
    if (this.enAire) { /* en el aire no se acelera ni se gira */ }
    else if (E.dir && E.dir.m > .08) {
      const ta = Math.atan2(E.dir.y, E.dir.x), da = angDif(this.a, ta);
      if (motor && Math.abs(da) > 2.4 && this.v < 2) {   /* el joystick apunta atrás y casi quieto: reversa girando al revés (tres puntos) */
        const db = angDif(this.a + Math.PI, ta); A.w += (clamp(-db * 4, -wm, wm) - A.w) * kw; tv = -Math.min(8, max * .32) * E.dir.m;
      } else { A.w += (clamp(da * 6.5, -wm, wm) - A.w) * kw; tv = max * E.dir.m * (.3 + .7 * Math.max(0, Math.cos(da))); }
    } else if (E.acel || E.giro) {   /* volante y pedales (y la IA): el giro manda la velocidad de giro, el acelerador la velocidad */
      const g = clamp(E.giro || 0, -1, 1), ac = clamp(E.acel || 0, -1, 1); A.w += (g * wm * (this.v < -.3 ? -1 : 1) - A.w) * kw;
      if (ac > 0) tv = max * ac; else if (ac < 0) { if (this.v > .5) frena = true; else tv = -Math.min(8, max * .32) * -ac; } else suelta = true;
    } else { A.w *= 1 - kw; suelta = true; }
    /* velocidad: directo a la pedida (como EnCicla); frenar es fuerte; soltar, rueda */
    const acc = S.acc * (turbo ? 1.4 : 1) * (pie ? 1 : clamp(suelo * 1.4, .5, 1)), brk = S.brk * (lluvia ? .7 : 1);
    if (this.enAire) { /* nada */ }
    else if (frena) this.v = Math.max(0, this.v - brk * dt);
    else if (suelta) { const c = (S.coast + Math.abs(this.v) * S.arrastre) * (lluvia ? .6 : 1) * dt; this.v = Math.abs(this.v) <= c ? 0 : this.v - Math.sign(this.v) * c; }
    else if (tv >= 0 && this.v >= 0) { if (tv > this.v) this.v = Math.min(tv, this.v + Math.min(acc, (tv - this.v) * 2 + .5) * dt); else this.v = Math.max(tv, this.v - Math.min(brk, (this.v - tv) * 3.5 + 6) * dt); }
    else if (tv < 0 && this.v <= .3) this.v = Math.max(tv, this.v - acc * .6 * dt);
    else this.v -= Math.sign(this.v) * Math.min(Math.abs(this.v), brk * dt);
    if (V.clase === 'rueda' && !V.electrico && !this.enAire && this.pend < -.03 && suelta) this.v += -this.pend * 9.8 * .55 * dt;   /* la bajada empuja la bici */
    if (deriva) this.v *= 1 - .22 * dt;
    /* el giro: un carro casi quieto gira poco (no da vueltas en el puesto); a pie y en bici, normal */
    if (!this.enAire) this.a += A.w * dt * (motor ? Math.min(1, .3 + Math.abs(this.v) / 4) : 1);
    this.giroV = A.w;
    /* por dónde rueda: igual a la trompa, salvo con el freno de mano (la cola se cruza) o en nieve y hielo (algo suelto) */
    const rp = this.rumboRodado ?? this.a, sueltoP = motor && (this.tt === TT.NIEVE || (lluvia && (this.tt === TT.GRASS || this.tt === TT.LAND)));
    const k = deriva ? 3 : sueltoP ? 6 : 40; this.rumboRodado = motor ? rp + angDif(rp, this.a) * (1 - Math.exp(-dt * k)) : this.a;
    this.deslizamiento = motor ? Math.abs(angDif(this.rumboRodado, this.a)) : 0; if (this.deslizamiento > .2 && Math.abs(this.v) > 6 && !this.enAire) this.eventos.push('derrape');
    if (Math.abs(this.rumboRodado - this.a) > Math.PI * 4) this.rumboRodado = this.a;
    /* salto (coyote y memoria del botón) y caída */
    if (!this.enAire) this.coyote = .12; else this.coyote = Math.max(0, (this.coyote || 0) - dt);
    if (E.salto) this.bufSalto = .14; else this.bufSalto = Math.max(0, (this.bufSalto || 0) - dt);
    if (this.bufSalto > 0 && V.salto && (!this.enAire || (this.coyote > 0 && this.vz <= 0))) { this.vz = Math.sqrt(2 * GRAV * .6 * V.salto); this.enAire = true; this.coyote = 0; this.bufSalto = 0; this.eventos.push('salto'); MC.emit('salto', this); }
    if (this.enAire) { this.z += this.vz * dt; this.vz -= GRAV * dt; if (this.z <= 0) { this.z = 0; this.enAire = false; this.eventos.push(this.vz < -6 ? 'aterrizaFuerte' : 'aterriza'); this.vz = 0; } }
    this.inclinacion = motor ? Math.atan(clamp(this.pend, -.65, .65)) : 0;
    /* moverse: si choca, la asistencia de esquinas de EnCicla */
    const x0m = this.x, y0m = this.y, st = this.v * dt, dir = this.rumboRodado ?? this.a;
    if (Math.abs(st) > 1e-6) {
      const nx = this.x + Math.cos(dir) * st, ny = this.y + Math.sin(dir) * st;
      if (this.puede(nx, ny)) { this.x = nx; this.y = ny; }
      else {
        const v0 = Math.abs(this.v); let movio = 0; const orden = A.w >= 0 ? [.35, -.35, .7, -.7, 1.1, -1.1] : [-.35, .35, -.7, .7, -1.1, 1.1];
        for (const da of orden) { const ax = this.x + Math.cos(dir + da) * st, ay = this.y + Math.sin(dir + da) * st; if (this.puede(ax, ay, true)) { this.x = ax; this.y = ay; this.a += da * Math.min(1, dt * 7.5); this.rumboRodado = this.a; this.v *= Math.exp(-(Math.abs(da) > .5 ? 3.2 : 1.6) * dt); A.w *= .5; movio = Math.abs(da); break; } }
        if (!movio) { const rz = Math.exp(-3.2 * dt); if (this.puede(nx, this.y, true)) { this.x = nx; this.v *= rz; movio = 1.2; } else if (this.puede(this.x, ny, true)) { this.y = ny; this.v *= rz; movio = 1.2; } }
        const impacto = movio ? (movio > .5 ? v0 * Math.sin(Math.min(1.4, movio)) : 0) : v0;
        if (!movio) { this.v *= motor ? -.12 : 0; A.w = 0; }
        if (impacto > 3 && !(this.choque > .15)) { this.eventos.push('choque'); this.choque = .4; this.impacto = impacto; this.normalChoque = [-Math.cos(dir), -Math.sin(dir)]; MC.emit('choque', this); }
      }
    }
    this.choque = Math.max(0, (this.choque || 0) - dt);
    this._despues(E, x0m, y0m, dt); this._niveles(dt);
    this.fase += Math.abs(this.v) * dt * (pie ? (this.corriendo ? 2.4 : 3.2) : V.cuerpo === 'pedalea' ? 1.6 : 1.2);
    this.estado = Personaje.estadoPara(V, Math.abs(this.v), this.enAire); this.buceando = false; this.aire = Math.min(1, this.aire + dt / 4);
    const quiere = (E.dir && E.dir.m > .3) || (E.acel || 0) > .3; if (this.bloqueoAgua && quiere && !pie) this.empujaAgua += dt; else this.empujaAgua = Math.max(0, this.empujaAgua - dt * 2);
    this.bloqueoAgua = false; if (this.bajarseEnAgua && this.empujaAgua > .6) { this.empujaAgua = 0; this.bajarse('agua'); }
    return this;
  }
  /* 4.5 · moverse con choques: en vez de trabarse contra los ejes del mapa, desliza a lo largo de la pared (su normal se estima
     tanteando alrededor del punto bloqueado), pierde velocidad según el ángulo del golpe (rasante: casi nada; de frente: casi toda)
     y el carro se alinea con la pared, como en los juegos de carreras arcade */
  _mover(dx, dy, dt) {
    const L = Math.hypot(dx, dy); if (L < 1e-7) return;
    if (this.puede(this.x + dx, this.y + dy)) { this.x += dx; this.y += dy; return; }
    const V = this.veh, auto = V.clase !== 'pie' && V.clase !== 'rueda', r = Math.max(.5, Math.min(1.4, (V.ancho || .6) * .65)), px = this.x + dx, py = this.y + dy; let bx = 0, by = 0;
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, cx = Math.cos(a), cy = Math.sin(a); if (!this.puede(px + cx * r, py + cy * r, true)) { bx += cx; by += cy; } }
    const bl = Math.hypot(bx, by), nx = bl > .01 ? -bx / bl : -dx / L, ny = bl > .01 ? -by / bl : -dy / L, ux = dx / L, uy = dy / L, dot = ux * nx + uy * ny, impacto = clamp(-dot, 0, 1);
    let tx = ux - dot * nx, ty = uy - dot * ny; const tl = Math.hypot(tx, ty); let movio = false;
    if (tl > .05) { tx /= tl; ty /= tl; const s = L * tl; if (this.puede(this.x + tx * s, this.y + ty * s, true)) { this.x += tx * s; this.y += ty * s; movio = true; } }
    if (!movio) { if (this.puede(this.x + dx, this.y, true)) { this.x += dx; movio = true; } else if (this.puede(this.x, this.y + dy, true)) { this.y += dy; movio = true; } }
    const sp = Math.abs(this.v);
    if (sp * impacto > 2.5 && !(this.choque > .15)) { this.eventos.push('choque'); this.choque = .4; this.impacto = sp * impacto; this.normalChoque = [nx, ny]; MC.emit('choque', this); }
    if (movio) { this.v *= 1 - Math.min(.95, impacto * impacto * .9 + dt * .6);
      if (auto && tl > .05) { const dir = this.v >= 0 ? Math.atan2(ty, tx) : Math.atan2(-ty, -tx); this.a += angDif(this.a, dir) * Math.min(1, dt * 7) * (1 - impacto * .6); this.rumboRodado = this.a; } }
    else { this.v *= auto ? -.18 : 0; if (this.puede(this.x + nx * .06, this.y + ny * .06, true)) { this.x += nx * .06; this.y += ny * .06; } }
  }
  /* 4.5 · asistencia que evita estrellarse: mira adelante (más lejos cuanto más rápido); si hay pared y el jugador no está girando
     fuerte, empuja el volante hacia el lado libre que más se parece a lo que pide, y no deja ir a fondo hacia la pared.
     Como la «dirección asistida» de los juegos de carreras para celular. Se apaga con E.asistencia === false */
  _asistencia(E, giro, acel, dt) {
    const V = this.veh; if (V.clase === 'pie' || V.clase === 'aire' || this.ia || E.asistencia === false || Math.abs(this.v) < 3) { this._asis = 0; this._asisFreno = 0; return { giro, acel }; }
    if ((this._tAsis = (this._tAsis || 0) - dt) <= 0) {
      this._tAsis = .08; const la = clamp(Math.abs(this.v) * .45, 3, 12), sg = this.v >= 0 ? 1 : -1, libre = da => this.puede(this.x + Math.cos(this.a + da) * la * sg, this.y + Math.sin(this.a + da) * la * sg, true);
      this._asis = 0; this._asisFreno = 0;
      if (!libre(0)) { const pide = E.dir ? angDif(this.a, Math.atan2(E.dir.y, E.dir.x)) : giro; for (const da of (pide >= 0 ? [.3, -.3, .6, -.6] : [-.3, .3, -.6, .6])) if (libre(da)) { this._asis = Math.sign(da) * sg * (Math.abs(da) > .4 ? .75 : .5); break; } this._asisFreno = 1; }
    }
    if (this._asis && Math.abs(giro) < .7) giro = clamp(giro + this._asis, -1, 1);
    if (this._asisFreno && acel > .5 && Math.abs(this.v) > 9) acel = .5;
    return { giro, acel };
  }
  /* 4.5 · después de moverse: desatascar si empuja y no avanza, el empujón hacia el hueco y el tumbo del bordillo */
  _despues(E, x0m, y0m, dt) {
    const V = this.veh, auto = V.clase === 'auto' || V.clase === 'pesado', empuja = (E.dir && E.dir.m > .3) || Math.abs(E.acel || 0) > .3;
    if (!this.ia && empuja && V.clase !== 'aire' && !this.nadando && Math.hypot(this.x - x0m, this.y - y0m) < .015) this.atasco = (this.atasco || 0) + dt; else this.atasco = Math.max(0, (this.atasco || 0) - dt * 2);
    if (this.atasco > .85) { this.atasco = 0; this._desatascar(E); }
    if (this._empujon) { const q = this._empujon, f = Math.min(1, dt * 8), metido = !this.puede(this.x, this.y, true); if (metido || this.puede(this.x + q.x * f, this.y + q.y * f, true)) { this.x += q.x * f; this.y += q.y * f; } q.x *= 1 - f; q.y *= 1 - f; if (Math.hypot(q.x, q.y) < .02) this._empujon = null; }   /* metido dentro de algo: sale derecho hacia el hueco libre */
    /* bordillo: al subir de la calzada al andén o a un patio, un tumbo (para la cámara y la suspensión) */
    const ttN = this.mundo.suelo(this.x, this.y); if (auto && CALZADA_TT.has(this.tt) !== CALZADA_TT.has(ttN) && Math.abs(this.v) > 2) { this.tumbo = Math.min(1, Math.abs(this.v) / 12); this.eventos.push('bordillo'); } this.tumbo = Math.max(0, (this.tumbo || 0) - dt * 3);
  }
  _desatascar(E) {
    const quiere = E.dir ? Math.atan2(E.dir.y, E.dir.x) : this.a + (this.v < 0 || (E.acel || 0) < 0 ? Math.PI : 0); let mejor = null, md = 1e9;
    for (const d of [.8, 1.4, 2.2, 3.2]) { for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = this.x + Math.cos(a) * d, y = this.y + Math.sin(a) * d; if (!this.puede(x, y, true)) continue; const pen = d * .6 + Math.abs(angDif(quiere, a)) * 1.2; if (pen < md) { md = pen; mejor = { x: x - this.x, y: y - this.y, a }; } } if (mejor) break; }
    if (!mejor) return false; this._empujon = { x: mejor.x, y: mejor.y }; if (this.veh.clase !== 'pie') { this.a += angDif(this.a, mejor.a) * .5; this.rumboRodado = this.a; } this.v = 0; this.eventos.push('desatasco'); MC.emit('desatasco', this); return true;
  }
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
