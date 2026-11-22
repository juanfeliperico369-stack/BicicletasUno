/* =====================================================================
   TURNO CERO · 4.8 · RESCATE, «🚀 IR» EN EL MAPA, UN SOLO MAPA Y PANTALLA EN MITADES
   Pedidos del autor:
   - «Añade a Turno Cero los servicios de rescate» (los del 🆘 de El Metro) «y la capacidad de teletransportarse en el mapa con
     la opción Ir al poner el punto»;
   - «divide la pantalla en horizontal y vertical a la mitad, para que la parte de arriba de los botones siempre permita mover y
     acercar o alejar la cámara y cuadrar a gusto la vista»;
   - «unifica los mapas».
   Qué hace:
   - 🆘 Rescate: salir a la calle más cercana, 🔧 grúa y mecánico (el carro queda reparado en la vía), 🚕 taxi, 🚇 la estación
     más cercana, 🚑 ambulancia (vida llena) y 🏠 volver a donde empezaste en esta ciudad. Un vigía lo ofrece si llevas 3,5 s
     empujando sin moverte o si vas en carro lejos de toda calle.
   - 🗺️ Un solo mapa: el minimapa, 🗺️ y la tecla M abren el mismo; al poner un punto aparece «🚀 Ir» (te deja en la calle más
     cercana a ese punto, con tu vehículo); 🌍 y alejar más allá de la ciudad pasan al planeta (el botón suelto del planeta se va).
   - Con la policía encima no hay saltos ni rescate que llegue: primero piérdela. En un capítulo de la historia, tampoco.
   - La pantalla en mitades vive en el motor (MC.Controles con { mitades: true }); aquí solo se avisa una vez cómo se usa.
   ===================================================================== */
const Rescate = {
  inicio: null, _at: null, _tv: 0, _lejos: 0, _av: -99,
  /* ¿se puede saltar ahora? (null = sí; si no, la razón) */
  puede() {
    if (!G.M || !G.cuerpo || G.viaje || G.dron || G.enRun || G.globo || G.transicion) return '🆘 Ahora no: termina lo que estás haciendo';
    if (G.busq && G.busq.nivel > 0) return '🚔 Con la policía encima no llega nadie ni hay atajos: piérdela primero';
    if (G.hist) return '📖 En la historia no hay atajos: sigue el capítulo o sal al 🌎 mundo abierto (⏸ Menú)';
    return null;
  },
  /* dejar al jugador en la calle más cercana a (x, y), con su vehículo */
  saltar(x, y, op = {}) {
    const no = this.puede(); if (no) { G.ui.aviso(no, 2800, 'rescate'); return false; }
    if (G.Modos && G.Modos.m) G.Modos.terminar('🎮 Saliste del modo');
    const C = G.cuerpo, M = G.M, pie = C.veh.clase === 'pie';
    /* la calle más cercana al punto; si no hay calle a 400 m pero el punto es transitable (un parque, una loma), el punto mismo */
    const q = M.viaCercana(x, y, 400, pie ? null : deCarro) || M.viaCercana(x, y, 400) || (op.calle ? null : this.sitioCerca(x, y, 400)) || M.viaCercana(x, y, 2500) || M.viaCercana(x, y, 6000) || M.viaCercana(x, y, 15000) || { x, y, ang: C.a };   /* el rescate siempre llega a una calle, aunque esté lejos (en el monte) */
    C.x = q.x; C.y = q.y; C.a = q.ang ?? C.a; C.v = 0; C.z = 0; C.rumboRodado = C.a; C.choque = 0; if (C.eventos) C.eventos.length = 0;
    if (G.camara) { G.camara.x = C.x; G.camara.y = C.y; }
    this._at = null; MC.emit('rescate', { tipo: op.tipo || 'ir', x: C.x, y: C.y }); return true;
  },
  /* ¿se puede estar ahí? (puede() mide la pendiente desde donde está el cuerpo: se prueba con el cuerpo puesto en el punto) */
  transitable(x, y) { const C = G.cuerpo, x0 = C.x, y0 = C.y; C.x = x; C.y = y; let ok = false; try { ok = C.puede(x, y, true); } catch (e) { ok = false; } C.x = x0; C.y = y0; return ok; },
  /* el sitio transitable más cercano al punto, en anillos de 10 m (para el 🚀 Ir del mapa: un parque, una loma, un potrero) */
  sitioCerca(x, y, r) { const M = G.M, C = G.cuerpo; if (M.dentro(x, y) && this.transitable(x, y)) return { x, y, ang: C.a }; for (let d = 10; d <= r; d += 10) { const n = Math.max(8, Math.round(d / 6)); for (let k = 0; k < n; k++) { const a = k / n * TAU, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (M.dentro(px, py) && this.transitable(px, py)) return { x: px, y: py, ang: C.a }; } } return null; },
  estacion() {
    const C = G.cuerpo; let best = null, bd = 1e9;
    try { for (const L of (G.transporte && G.transporte.lineas) || []) { if (L.clase === 'cable') continue; for (const e of L.est) { const q = L.T.at(e.s), d = Math.hypot(q.x - C.x, q.y - C.y); if (d < bd) { bd = d; best = { nombre: e.nombre, x: q.x, y: q.y, d }; } } } } catch (e) { /* sin líneas */ }
    return best;
  },
  menu() {
    const no = this.puede(); if (no) return G.ui.aviso(no, 2800, 'rescate');
    const C = G.cuerpo, km = d => d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1).replace('.', ',') + ' km', carro = C.veh.clase === 'auto' || C.veh.clase === 'pesado' || C.veh.clase === 'moto';
    const it = [{ id: 'calle', texto: '🛣 Salir a la calle más cercana<br><small>' + (C.veh.clase === 'pie' ? 'a pie' : 'con tu vehículo') + '</small>' }];
    if (carro) it.push({ id: 'grua', texto: '🔧 Grúa y mecánico<br><small>te dejan en la vía con el carro reparado</small>' });
    it.push({ id: 'taxi', texto: '🚕 Pedir un taxi<br><small>llega a la calle más cercana y te subes</small>' });
    const E = this.estacion(); if (E) it.push({ id: 'est', texto: '🚇 Ir a la estación más cercana<br><small>' + E.nombre + ' · a ' + km(E.d) + '</small>' });
    if (G.vida < .99) it.push({ id: 'amb', texto: '🚑 Ambulancia<br><small>te atienden: vida llena</small>' });
    const I = this.inicio; if (I && I.id === G.id) it.push({ id: 'ini', texto: '🏠 Volver a donde empezaste<br><small>a ' + km(Math.hypot(I.x - C.x, I.y - C.y)) + '</small>' });
    it.push({ id: 'mapa', texto: '🗺️ Elegir un punto en el mapa<br><small>pon el punto y toca 🚀 Ir</small>' }, { id: 'x', texto: '✕ Cerrar' });
    G.ui.menu('🆘 Rescate · ¿qué necesitas?', it, k => this.servicio(k));
  },
  servicio(k) {
    const C = G.cuerpo;
    if (k === 'calle') { if (this.saltar(C.x, C.y, { tipo: 'calle', calle: true })) G.ui.aviso('🛣 Listo: en la calle', 1600, 'rescate'); }
    else if (k === 'grua') { if (this.saltar(C.x, C.y, { tipo: 'grua', calle: true })) { G.carro = 1; if (G.busq) G.busq.pinchado = false; try { reparaZonas(); } catch (e) { /* sin piezas */ } G.ui.aviso('🔧 La grúa te dejó en la vía y el mecánico arregló el carro', 2600, 'rescate'); } }
    else if (k === 'taxi') { if (this.saltar(C.x, C.y, { tipo: 'taxi', calle: true })) { G.veh = 'tc_mercury'; C.setVeh('tc_mercury'); C.estacionado = null; G.carro = 1; G.ui.aviso('🚕 Llegó el taxi: es tuyo mientras quieras', 2400, 'rescate'); } }
    else if (k === 'est') { const E = this.estacion(); if (E && this.saltar(E.x, E.y, { tipo: 'estacion', calle: true })) G.ui.aviso('🚇 ' + E.nombre + ' · toca 🚇 para viajar', 2600, 'rescate'); }
    else if (k === 'amb') { G.vida = 1; G.ui.aviso('🚑 Te atendieron: vida llena', 2200, 'rescate'); MC.emit('rescate', { tipo: 'ambulancia' }); }
    else if (k === 'ini') { const I = this.inicio; if (I && this.saltar(I.x, I.y, { tipo: 'inicio' })) G.ui.aviso('🏠 Volviste a donde empezaste', 1800, 'rescate'); }
    else if (k === 'mapa') abrirMapaTC();
  },
  /* 🚀 Ir: desde el mapa (devuelve false si no se pudo, y el mapa sigue abierto) */
  ir(p) { if (!this.saltar(p.x, p.y, { tipo: 'mapa' })) return false; G.destinoLibre = null; G.ui.aviso('🚀 ' + (p.nombre || 'Llegaste al punto'), 2000, 'rescate'); return true; },
  /* el vigía: atascado empujando, o en carro lejos de toda calle */
  vigia(dt) {
    const C = G.cuerpo; if (!C || !G.M) return;
    if (!this.inicio || this.inicio.id !== G.id) this.inicio = { id: G.id, x: C.x, y: C.y };
    if (G.pausa || G.viaje || G.controlExterno || G.hist || (G.busq && G.busq.nivel > 0) || (G.Modos && G.Modos.m)) { this._at = null; return; }
    const st = G.ctl && G.ctl.stick, empuja = C.veh.clase !== 'pie' && ((st && st.m > .5) || G.acelFijo);
    if (empuja) { const a = this._at; if (!a) this._at = { x: C.x, y: C.y, t: 0 }; else { a.t += dt; if (Math.hypot(C.x - a.x, C.y - a.y) > 1.2) this._at = null; else if (a.t > 3.5) { this._at = null; this.ofrecer('¿Atascado? Toca 🆘 Rescate: te saca a la calle'); } } } else this._at = null;
    if ((this._tv += dt) > 3) { this._tv = 0; if (C.veh.clase === 'auto' || C.veh.clase === 'pesado') { const q = G.M.viaCercana(C.x, C.y, 90); this._lejos = q ? 0 : this._lejos + 1; if (this._lejos >= 4) { this._lejos = -10; this.ofrecer('¿Perdido? Estás lejos de las calles: 🆘 Rescate te deja en una'); } } }
  },
  ofrecer(t) { if (G.t - this._av < 25) return; this._av = G.t; G.ui.aviso(t, 3400, 'rescate'); const b = BOT.rescate; if (b) { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 6000); } }
};
G.Rescate = Rescate;
EXTRAS.paso.push(dt => Rescate.vigia(dt));
EXTRAS.ui.push(b => {
  b('rescate', '🆘', 'Rescate', () => Rescate.menu());
  if (BOT.globo) BOT.globo.hidden = true;   /* un solo mapa: el planeta se abre desde 🗺️ (🌍 o alejando) y con la tecla G */
  { const gb = document.getElementById('globo'); if (gb && !document.getElementById('gMapa')) { const m = document.createElement('button'); m.id = 'gMapa'; m.textContent = '🗺️'; m.setAttribute('aria-label', 'Volver al mapa de la ciudad'); m.title = 'Volver al mapa de la ciudad'; m.style.cssText = 'position:absolute;top:max(12px,env(safe-area-inset-top));left:12px;width:52px;height:52px;border-radius:50%;font-size:24px;z-index:3'; m.onclick = () => { Globo.cerrar(); abrirMapaTC(); }; gb.appendChild(m); } }
  /* la pantalla en mitades: se explica una vez */
  if (!leerG().mitadesVisto) setTimeout(() => { if (!G.ui) return; G.ui.aviso('☝️ Mitad de arriba: arrastra para girar e inclinar la cámara y pellizca para acercar o alejar · doble toque la endereza · abajo se maneja', 6000, 'mitades'); escribirG({ mitadesVisto: true }); }, 9000);
});
