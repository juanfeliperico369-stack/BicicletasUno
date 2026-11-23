/* =====================================================================
   TURNO CERO · 5.2 · RETOS DESDE CUALQUIER SEMÁFORO (G5-06 del plan 5.0, retomado por Claude)
   Idea de Burnout Paradise (Criterion, 2008), en sala limpia: detenido en cualquier semáforo, frenar y acelerar a la vez
   («quemar llanta») reta al carro de al lado a una carrera corta hasta un sitio de verdad de la ciudad.
   - Dónde: a menos de 28 m de un semáforo real de la capa de tráfico (MC.Trafico.luces), en carro o moto, quieto.
   - El gesto: 🛑 sostenido y, a la vez, ⏫ prendido o el joystick empujado (en el teclado: espacio y una flecha) durante
     0,6 s: el carro se queda en su sitio quemando llanta (humo atrás) en vez de echar reversa. La primera vez que el jugador se queda quieto en un semáforo se le cuenta el truco.
   - El destino: un sitio con nombre del mapa (lugares, hitos y estaciones) entre 450 m y 1,6 km, por calles de carro; la carrera es la
     🏁 de Modos con un solo rival, «el de al lado», que sale a su lado. Lo demás (cuenta, puestos, premio, récord) es igual.
   - No se ofrece en la historia, en otro modo, con la policía detrás, a pie ni en el menú.
   ===================================================================== */
const RetoSemaforo = {
  _quieto: 0, _gesto: 0, _ultimo: -99, _contado: 0, _luz: null,
  /* el semáforo más cercano (a menos de r metros) o null */
  semaforo(x, y, r = 28) {
    if (!G.trafico || typeof G.trafico.luces !== 'function') return null; let mejor = null, bd = r;
    for (const L of G.trafico.luces().values()) { const d = Math.hypot(L.x - x, L.y - y); if (d < bd) { bd = d; mejor = L; } }
    return mejor;
  },
  puede() {
    const C = G.cuerpo; if (!C || !G.M || !G.M.esCiudad || G.pausa || G.hist || G.viaje || G.dron || G.controlExterno || Modos.m) return false;
    if (G.busq && G.busq.nivel > 0) return false; const k = C.veh.clase; return k === 'auto' || k === 'moto' || k === 'pesado';
  },
  /* el gesto, antes de la física: 🛑 + acelerar quieto en un semáforo = quemar llanta en el sitio (sin esto, 🛑 quieto echa reversa) */
  entrada(e, ent) {
    this._quema = false; if (!this.puede() || !ent) return; const C = G.cuerpo; if (Math.abs(C.v) > 2) return;
    const freno = G.ctl.botones.has('freno') || (ent.pulsos && ent.pulsos.has('Space')) || (G.ctl.teclas && G.ctl.teclas.has('Space')), acel = !!G.acelFijo || (ent.stick && ent.stick.m > .5) || (ent.acel || 0) > .5;
    if (!freno || !acel || !this.semaforo(C.x, C.y)) return;
    this._quema = true; e.acel = 0; e.dir = null; e.giro = 0; e.derrape = false; e.turbo = false;
  },
  paso(dt, ent) {
    if (!this.puede() || !ent) { this._quieto = this._gesto = 0; return; }
    const C = G.cuerpo, quieto = Math.abs(C.v) < 1.2, L = quieto ? this.semaforo(C.x, C.y) : null;
    this._quieto = L ? this._quieto + dt : 0;
    /* la primera vez (y luego de vez en cuando, hasta 3) se cuenta el truco */
    if (L && this._quieto > 1.6 && this._contado < 3 && L !== this._luz && G.t - this._ultimo > 40) { this._luz = L; this._contado++; this._ultimo = G.t; G.ui.aviso('🚦 Reto: en un semáforo, sostén 🛑 y acelera a la vez para retar al de al lado', 3600, 'reto'); }
    this._gesto = L && this._quema ? this._gesto + dt : 0;
    /* el humo de las llantas de atrás mientras se quema llanta */
    if (this._gesto > 0 && MC.Efectos && Math.random() < .6) { const ca = Math.cos(C.a), sa = Math.sin(C.a), u = -(C.veh.largo || 4.3) * .32, v = (Math.random() < .5 ? 1 : -1) * (C.veh.ancho || 1.8) * .42; MC.Efectos.humo(C.x + u * ca - v * sa, C.y + u * sa + v * ca, 1, { tam: .55, sube: .6, vida: 1.3, z: .3 }); }
    if (this._gesto > .6 && G.t - (this._ofrecido || -99) > 4) { this._ofrecido = G.t; this._gesto = 0; this.ofrecer(L); }
  },
  /* los sitios con nombre de la ciudad: lugares, hitos (el centro de su huella) y estaciones (metro, tranvía, Metroplús) */
  sitios() {
    const M = G.M; if (this._M === M && this._S) return this._S; const S = [];
    for (const l of M.lugares || []) if (l && l.nombre && l.x != null) S.push({ nombre: l.nombre, x: l.x, y: l.y });
    for (const h of M.hitos || []) { const P = h && h.huella && h.huella[0]; if (!h.nombre || !P || P.length < 6) continue; let x = 0, y = 0; for (let i = 0; i < P.length; i += 2) { x += P[i]; y += P[i + 1]; } S.push({ nombre: h.nombre, x: x / (P.length / 2), y: y / (P.length / 2) }); }
    const T = M.transporte; if (T && T.lineas) for (const L of T.lineas) if (L.clase !== 'cable') for (const e of L.estaciones || []) if (e && e[0]) S.push({ nombre: 'la estación ' + e[0], x: e[1], y: e[2] });
    this._M = M; return (this._S = S);
  },
  /* el destino: un sitio con nombre a 450–1600 m, el que quede más cerca de 900 m, con ruta de carro */
  destino(x, y) {
    const M = G.M, cand = this.sitios().map(l => ({ l, d: Math.hypot(l.x - x, l.y - y) })).filter(o => o.d > 450 && o.d < 1600).sort((a, b) => Math.abs(a.d - 900) - Math.abs(b.d - 900));
    const ini = M.viaCercana(x, y, 30, deCarro); if (!ini) return null;
    for (const { l } of cand.slice(0, 6)) { const fin = M.viaCercana(l.x, l.y, 160, deCarro); if (!fin) continue; const Q = rutaTC(M, [ini, fin], false); if (!Q || Q.length < 8) continue;
      let largo = 0; for (let i = 2; i < Q.length; i += 2) largo += Math.hypot(Q[i] - Q[i - 2], Q[i + 1] - Q[i - 1]); if (largo > 400 && largo < 2600) return { nombre: l.nombre, Q, largo }; }
    return null;
  },
  ofrecer(L) {
    const C = G.cuerpo, D = this.destino(C.x, C.y); if (!D) { G.ui.aviso('🚦 Desde este semáforo no hay un buen destino; prueba en otro', 2200, 'reto'); return; }
    MC.emit('reto:ofrecido', { destino: D.nombre, largo: D.largo, semaforo: L && L.nodo });
    G.ui.dialogo('🚦 Reto del semáforo', 'El de al lado aceleró. ¿Una carrera hasta ' + D.nombre + ' (' + (D.largo >= 1000 ? (D.largo / 1000).toFixed(1) + ' km' : Math.round(D.largo) + ' m') + ')?', ['🏁 ¡Dele!', 'Ahora no']).then(i => { if (i === 0 && this.puede()) this.iniciar(D); });
  },
  iniciar(D) {
    const C = G.cuerpo, p = new PistaTC(D.Q, false); if (p.L < 300) return false;
    const ok = Modos._pistaLista(p, false, false, 'Reto hasta ' + D.nombre, 0, C.veh.id, { nombres: ['el de al lado'], alLado: true });
    if (ok && Modos.m) { Modos.m.reto = D.nombre; MC.emit('reto:inicio', { destino: D.nombre, largo: p.L }); }
    return ok;
  }
};
G.RetoSemaforo = RetoSemaforo;
EXTRAS.entrada.push((e, ent) => RetoSemaforo.entrada(e, ent));
EXTRAS.paso.push((dt, ent) => RetoSemaforo.paso(dt, ent));
