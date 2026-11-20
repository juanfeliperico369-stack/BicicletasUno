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
          const m = r.ruta && MC.Manejo.seguirRuta(C, r.ruta, { radio: 5 });
          if (!m || !m.dir) C.actualizar(dt, { acel: -.4, giro: 0 });
          else { const meta = [C.x + m.dir.x * 8, C.y + m.dir.y * 8], f = MC.IA.llegar([C.x, C.y], meta, 1, 4); C.actualizar(dt, { dir: { x: f[0], y: f[1], m: clamp(Math.hypot(f[0], f[1]), .35, 1) }, turbo: d > 60 }); }
        }
      }
      /* contacto con el jugador: empuje por masas, daño a los dos */
      const contacto = 2.5; if (d < contacto && d > 1e-3 && r.choqueT <= 0) {
        const nx = dx / d, ny = dy / d, vcx = Math.cos(C.a) * C.v, vcy = Math.sin(C.a) * C.v, rel = (vcx - vjx) * nx + (vcy - vjy) * ny;
        if (Math.abs(rel) > 1.5) { r.choqueT = .6; const mj = (J.veh && J.veh.masa) || 1400, mr = (C.veh && C.veh.masa) || 1700, golpe = Math.abs(rel), kJ = mr / (mj + mr), kR = mj / (mj + mr);
          J.v *= 1 - clamp(golpe * .025 * kJ, 0, .5); C.v *= 1 - clamp(golpe * .03 * kR, 0, .7);
          const quien = rel > 0 ? 'rival' : 'jugador', aJ = golpe * .012 * kJ * (quien === 'rival' ? r.B.agresion : .6);   /* quien embiste recibe menos */
          this.danio += aJ; r.salud -= golpe * .045 * kR * (quien === 'jugador' ? 1.3 : .6);
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
    return this.rivales.map(r => { const c = r.cuerpo; return { id: r.id, tipo: 'carro', clase: 'auto', x: c.x, y: c.y, a: c.a, v: c.v, largo: c.veh.largo || 4.6, ancho: c.veh.ancho || 1.85, color: r.roto ? '#2a2420' : r.B.color, sirena: r.B.sirena && !r.roto && !r.retirada, roto: r.roto, humo: r.roto ? r.humo : 0, bando: r.bando, frena: 0 }; });
  }
  /* para cuerpo.obstaculos: nadie atraviesa a nadie */
  obstaculos() { const L = []; for (const r of this.rivales) { const c = r.cuerpo, l = (c.veh.largo || 4.6) / 3, cs = Math.cos(c.a), sn = Math.sin(c.a); for (const k of [-1, 0, 1]) L.push({ x: c.x + cs * l * k, y: c.y + sn * l * k, r: (c.veh.ancho || 1.85) / 2 + .1, motivo: 'rival:' + r.id }); } return L; }
  /* para la interfaz: qué tan cerca está el rival más cercano y de qué bando */
  masCercano(J) { let m = null, md = 1e9; for (const r of this.rivales) { if (r.roto || r.retirada) continue; const d = Math.hypot(r.cuerpo.x - J.x, r.cuerpo.y - J.y); if (d < md) { md = d; m = r; } } return m ? { d: md, bando: m.bando, r: m } : null; }
}
Busqueda.UMBRAL = BUSQ_UMBRAL; Busqueda.PRESUPUESTO = BUSQ_PRESUPUESTO; Busqueda.BANDOS = BUSQ_BANDOS;
MC.Busqueda = Busqueda;
