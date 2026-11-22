/* =====================================================================
   TURNO CERO · la historia (cinco actos por el planeta) y los contratos de Calle libre
   Pasos: ir, perder (la búsqueda en 0), destruir (sacar de la vía a la banda), viajar (a otra ciudad del planeta
   por su carretera), dron (T02), sigilo (guardias con vista y línea de visión), acceso (T06), foto (T11),
   seguir (El Contador con el Rastreador Cerbero, T03), si (rama por bandera) y final (A, B o C).
   Cada paso es un punto de control: si fallas, vuelves a su comienzo; la Caja de custodia (T09) guarda las pruebas.
   ===================================================================== */
const angDif = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const Historia = {
  cap: 0, i: 0, sub: null, p: null, est: {}, ocupado: false,
  pasosDe() { return this.sub || TC.HISTORIA[this.cap].pasos; },
  async empezar(cap, i = 0, op = {}) {
    const token = G.narrativaEpoch || 0;
    G.hist = this; G.contrato = null; G.modo = 'historia'; this.p = null; this.ocupado = true; this.cap = cap;   /* nada se completa mientras cambia de capítulo */ this.sub = op.sub ? (TC.HISTORIA[cap].pasos.find(q => q.tipo === 'si' && G.flags[q.flag]) || {}).pasos || null : null; const H = TC.HISTORIA[cap];
    if (i === 0) { G.cebos = 2; G.reloj.min = H.hora * 60; G.climaForzado = H.clima; if (G.clima) G.clima.forzar(H.clima); }
    if (op.donde) await entrarMundo(op.donde.mundo, { x: op.donde.x, y: op.donde.y, a: op.donde.a, heat: 0 });
    else if (G.id !== H.mundo) await entrarMundo(H.mundo, { lugar: H.inicio, heat: 0 });
    if (i === 0) { await tarjeta('Acto ' + H.acto + ' · Capítulo ' + H.cap, H.titulo, TC.QUIEN.mara.n, H.acto); if (H.intro && !op.sinIntro) await escena(H.intro); }
    if ((G.narrativaEpoch || 0) !== token || G.modo !== 'historia') return;
    this.empezarPaso(i);
  },
  empezarPaso(i) {
    const P = this.pasosDe(); if (i >= P.length) return this.finCapitulo();
    this.i = i; const p = this.p = P[i]; this.est = { t: 0, fuera: 0, vistoT: 0, alarma: false, ultimo: 0 }; this.ocupado = false;
    G.guardias = []; G.modelos3d.length = 0; G.seguido = null; G.puedeFoto = false; G.puedeReducir = null; G.rutaEventos = []; G.rutaHecha = {};
    const C = G.cuerpo; G.check = { cap: this.cap, i, sub: !!this.sub, mundo: G.id, x: C.x, y: C.y, a: C.a, dinero: G.dinero, rep: Object.assign({}, G.rep), flags: Object.assign({}, G.flags), veh: G.veh, tengo: G.tengo.slice(), evidencia: G.evidencia, municion: G.municion, carro: Math.max(.6, G.carro), vida: Math.max(.7, G.vida) };
    escribirG({ hist: G.check });
    if (p.heatInicio != null) G.busq.ponerNivel(p.heatInicio);
    if (p.llamada) Subt.decir(p.llamada);
    if (p.tipo === 'si') { if (G.flags[p.flag]) { this.sub = p.pasos; return this.empezarPaso(0); } return this.empezarPaso(i + 1); }
    if (p.tipo === 'final') return this.terminar();
    if (p.tipo === 'destruir') G.busq.banda(p.banda || p.n);
    if (p.tipo === 'viajar') { G.rutaEventos = p.ruta || []; if (G.id === p.a) return this.completar(); }
    if (p.tipo === 'sigilo') this.ponerGuardias(p);
    if (p.tipo === 'seguir') this.ponerSeguido(p);
    if (p.tipo === 'acceso') return this.acceso();
    this.meta();
    MC.emit('turno:paso', { cap: this.cap, i, tipo: p.tipo });
  },
  /* el objetivo del paso en el mundo actual (lo que señala la flecha) */
  meta() {
    const p = this.p; if (!p) return; let m = null;
    if (p.a && TC.LUGARES[p.a]) { m = resolver(p.a); if (!m && TC.LUGARES[p.a].mundo !== G.id) m = this.haciaMundo(TC.LUGARES[p.a].mundo); }
    else if (p.tipo === 'viajar') m = this.haciaMundo(p.a);
    G.objetivo = m ? { x: m.x, y: m.y, texto: m.n || '' } : null; this.est.meta = m;
    /* quien espera en el lugar (actores GLB de Codex con su animación) */
    if (p.actor && m && TC.LUGARES[p.a] && TC.LUGARES[p.a].mundo === G.id && !G.modelos3d.some(q => q.actor)) { const Mo = MC.Modelos.get(p.actor.id); G.modelos3d.push({ actor: true, id: p.actor.id, x: m.x + Math.cos((m.a || 0) + 1.57) * 4, y: m.y + Math.sin((m.a || 0) + 1.57) * 4, a: (m.a || 0) - 1.57, k: Mo ? 1.72 / Mo.alto : 1, clip: p.actor.clip || 'idle_breath' }); }
  },
  /* si el objetivo está en otro mundo, la flecha va a la salida que lleva hacia allá (el planeta es un anillo) */
  haciaMundo(id) {
    if (G.id === id) return null; const n = planeta.anillo.length; let adelante = 0, atras = 0; for (let k = 1; k < n; k++) { if (planeta.vecino(G.id, k).id === id) { adelante = k; break; } } for (let k = 1; k < n; k++) { if (planeta.vecino(G.id, -k).id === id) { atras = k; break; } }
    const sig = adelante <= atras; if (!G.M.esCiudad) { const c = G.M.carretera, p = sig ? c.fin : c.inicio; return { x: p.x, y: sig ? c.largo - 10 : 10, n: (sig ? planeta.vecino(G.id, 1) : planeta.vecino(G.id, -1)).nombre }; }
    const Q = planeta.puertas(G.id, G.M), q = sig ? Q.siguiente : Q.anterior; return { x: q.x, y: q.y, n: 'Salida: ' + (q.nombre || (sig ? planeta.vecino(G.id, 1) : planeta.vecino(G.id, -1)).nombre) };
  },
  paso(dt) {
    const p = this.p; if (!p || this.ocupado || G.pausa) return; const E = this.est, C = G.cuerpo; E.t += dt;
    if (p.limite) { const r = p.limite - E.t; G.reloj_mision = r; if (r <= 0) { this.ocupado = true; fallar('⏱ Llegaste tarde', 'Cerraron el muelle y Nadia ya no estaba. Nadie volvió a verla en Water Street.'); return; } } else G.reloj_mision = null;
    const m = E.meta, d = m ? Math.hypot(m.x - C.x, m.y - C.y) : 1e9;
    if (p.tipo === 'ir' && d < (p.radio || 18)) { if (p.maxNivel != null && G.busq.nivel > p.maxNivel) { if (E.t - E.ultimo > 4) { E.ultimo = E.t; G.ui.aviso('🚨 ' + p.avisoNivel, 2600, 'nivel'); } } else this.completar(); }
    else if (p.tipo === 'foto') G.puedeFoto = d < 30 && Math.abs(C.v) < 3;
    else if (p.tipo === 'dron') { if (G.dron && m && Math.hypot(G.dron.x - m.x, G.dron.y - m.y) < 45) { G.ui.aviso('🛸 Ahí está: una antena en la azotea y alguien fumando', 2200, 'dron'); G.dron = null; G.recarga.dron = 6; this.completar(); } else if (!G.dron && d < 90 && E.t - E.ultimo > 8) { E.ultimo = E.t; G.ui.aviso('🛸 Estás cerca: lanza el Dron Cuervo', 1800, 'dron'); } }
    else if (p.tipo === 'perder') { if (G.busq.nivel === 0 && !this.bandaViva()) this.completar(); }
    else if (p.tipo === 'destruir') { if (E.fuera >= p.n) this.completar(); else if (!this.bandaViva() && E.t - E.ultimo > 8) { E.ultimo = E.t; G.busq.banda(Math.max(1, p.n - E.fuera)); } }
    else if (p.tipo === 'sigilo') this.sigilo(dt, d);
    else if (p.tipo === 'seguir') this.seguir(dt);
  },
  bandaViva() { return G.busq.rivales.some(r => r.bando === 'banda' && !r.roto); },
  completar() { const p = this.p, A = p.alLlegar || p.alFin || {}; this.ocupado = true; G.objetivo = null; G.puedeFoto = false; if (A.esperar) { G.esperando = { t: A.esperar, total: A.esperar, texto: A.texto || 'Esperando…', luego: () => this.sigue(A) }; } else this.sigue(A); },
  async sigue(A) {
    G.esperando = null; if (A.escena) await escena(A.escena);
    if (A.decision) { const o = await decision(A.decision); if (o.evidencia) sumarEvidencia(o.evidencia); }
    if (A.evidencia) sumarEvidencia(A.evidencia); aplicar(A); if (A.municion) { G.municion += A.municion; G.ui.aviso('🔫 ' + G.municion + ' tiros', 1800, 'bala'); }
    if (A.heat) { G.busq.ponerNivel(A.heat); if (A.causa) G.ui.aviso('🚨 ' + A.causa[0].toUpperCase() + A.causa.slice(1), 2600, 'nivel'); }
    this.ocupado = false; this.empezarPaso(this.i + 1);
  },
  alEntrar(id) { const p = this.p; if (!p) return; G.rutaEventos = p.tipo === 'viajar' ? (p.ruta || []) : []; if (p.tipo === 'viajar' && id === p.a) { this.completar(); return; } this.meta(); },
  fuera(ev) { if (this.p && this.p.tipo === 'destruir' && ev.bando === 'banda') { this.est.fuera++; G.ui.aviso('💥 ' + this.est.fuera + ' de ' + this.p.n, 1500, 'fuera'); } },
  async reintentar() {
    const K = G.check; if (!K) return; Object.assign(G, { dinero: Math.round(K.dinero * .9), rep: Object.assign({}, K.rep), flags: Object.assign({}, K.flags), veh: K.veh, tengo: K.tengo.slice(), evidencia: Math.max(G.evidencia, K.evidencia), municion: K.municion, carro: K.carro, vida: K.vida });
    this.cap = K.cap; this.sub = K.sub ? this.sub : null; this.ocupado = false; G.busq.limpiar();
    if (K.mundo !== G.id) await entrarMundo(K.mundo, { x: K.x, y: K.y, a: K.a, heat: 0 });
    else { const C = G.cuerpo; C.x = K.x; C.y = K.y; C.a = K.a; C.v = 0; if (C.veh.clase === 'pie' || C.veh.id !== G.veh) C.setVeh(G.veh); G.camara.x = C.x; G.camara.y = C.y; }
    this.empezarPaso(K.i);
  },
  async finCapitulo() { this.p = null; this.ocupado = true; G.objetivo = null; this.sub = null; const k = this.cap + 1; const hechos = Math.max(leerG().capitulos || 0, k); escribirG({ capitulos: hechos }); if (k >= TC.HISTORIA.length) return this.terminar(); await espera(600); this.empezar(k); },
  terminar() {
    const k = TC.final(G.flags, G.evidencia), F = TC.FINALES[k]; this.p = null; G.objetivo = null; G.busq.limpiar(); Snd.sirenaVol(0);
    const fin = leerG().finales || []; if (!fin.includes(k)) fin.push(k); escribirG({ finales: fin, capitulos: TC.HISTORIA.length, hist: null });
    $('#fH').textContent = suave(F.t); $('#fX').textContent = suave(F.x);
    $('#fC').innerHTML = 'Pruebas: ' + G.evidencia + ' · Plata: ' + plata(G.dinero) + ' · Kilómetros: ' + G.km.toFixed(1) + ' · Rivales fuera de la vía: ' + G.destrozados + ' · Civiles heridos: ' + G.civiles + ' · Tiros recibidos: ' + G.disparosRecibidos + '<br>Confianza · Nadia ' + (G.rep.nadia || 0) + ' · Noah ' + (G.rep.noah || 0) + ' · Cross ' + (G.rep.cross || 0) + '<br>Finales vistos: ' + fin.join(', ');
    $('#final').hidden = false; G.pausa = true; MC.emit('turno:final', { final: k });
  },
  /* ---- sigilo: guardias con vista (24 m, 60°) y línea de visión; el cebo los distrae; si te ven, entrada a las malas ---- */
  ponerGuardias(p) {
    const m = resolver(p.a); if (!m) return; const M = G.M, n = p.guardias || 3;
    for (let k = 0; k < n * 6 && G.guardias.length < n; k++) { const ang = k / n * TAU + (k % 3) * .4, r = 20 + (k % 4) * 7, x = m.x + Math.cos(ang) * r, y = m.y + Math.sin(ang) * r; if (M.edificioEn(x, y, 0) || M.suelo(x, y) === MC.TT.WATER) continue; G.guardias.push({ x, y, a0: ang, a: ang, origen: { x, y }, estado: 'patrulla', ultima: null, busquedaT: 0, vista: 24, cono: 1.05, distraido: 0, fase: k * 1.7, modelo: MC.Modelos.tiene('personaje_guard_rig') ? 'personaje_guard_rig' : k % 2 ? 'personaje_operative' : 'personaje_guard' }); }
    for (const q of G.guardias) { const Mo = MC.Modelos.get(q.modelo); G.modelos3d.push(q.m3 = { id: q.modelo, x: q.x, y: q.y, a: q.a, k: Mo ? 1.75 / Mo.alto : 1, clip: 'idle_breath', fase: q.fase }); }
    for (let k = 0; k < 4; k++) { const ang = k * 1.6 + .5, x = m.x + Math.cos(ang) * 14, y = m.y + Math.sin(ang) * 14; if (!M.edificioEn(x, y, 0)) G.modelos3d.push({ id: G.id === 'nueva_york' ? 'escenario_container' : k % 2 ? 'escenario_container' : 'escenario_barrier', x, y, a: ang }); }
    G.modelos3d.push({ id: 'escenario_checkpoint', x: m.x, y: m.y, a: m.a || 0 });
  },
  sigilo(dt, d) {
    const C = G.cuerpo, E = this.est; let visto = false;
    for (const q of G.guardias) {
      const ve = MC.AccionPie.paso(q, dt, { jugador: C, mundo: G.M, alarma: E.alarma, cebo: G.ceboVis, distraido: q.distraido > 0 });
      if (q.distraido > 0) q.distraido = Math.max(0, q.distraido - dt);
      if (q.m3) { q.m3.x = q.x; q.m3.y = q.y; q.m3.a = q.a; q.m3.clip = q.estado === 'distraccion' ? 'interact_device' : q.estado === 'alerta' || q.estado === 'busqueda' ? 'sprint_loop' : 'idle_breath'; }
      if (ve.ve && q.distraido <= 0) visto = true;
    }
    E.vistoT = visto ? E.vistoT + dt : Math.max(0, E.vistoT - dt * .5);
    /* a pie y pegada a un guardia: ✊ reducirlo sin matarlo (la animación de golpe no letal de Codex) */
    G.puedeReducir = C.veh.clase === 'pie' ? G.guardias.find(q => !q.fuera && Math.hypot(q.x - C.x, q.y - C.y) < 2.6) || null : null;
    if (!E.avisoPie && E.t > 2) { E.avisoPie = true; G.ui.aviso('🕶️ Consejo: bájate 🚪 y acércate a pie por detrás para reducir guardias ✊', 3200, 'sigilo'); }
    if (!E.alarma && E.vistoT > .7) { E.alarma = true; G.flags.ruido = true; G.busq.ponerNivel(Math.max(3, G.busq.nivel)); G.busq.banda(2); G.ui.aviso('🚨 ¡Te vieron! Entrada a las malas', 2600, 'nivel'); Subt.decir([['radio', '«¡Intrusa en el perímetro!» Gritos, radios, motores que arrancan.']]); }
    else if (visto && !E.alarma) G.ui.aviso('👀 Un guardia te está mirando…', 600, 'visto');
    if (d < 10) this.completar();
  },
  /* ✊ reducir a un guardia (no letal): si te estaba mirando, hace ruido */
  reducir() {
    const q = G.puedeReducir; if (!q || q.fuera) return; q.fuera = true; G.puedeReducir = null; const C = G.cuerpo; C.a = Math.atan2(q.y - C.y, q.x - C.x);
    if (q.m3) { q.m3.clip = 'hit_reaction'; setTimeout(() => { const i = G.modelos3d.indexOf(q.m3); if (i >= 0) G.modelos3d.splice(i, 1); }, 900); }
    G.reduciendo = .8; Snd.golpe(.3); G.camara.sacudir(.08); const visto = q.alerta > 0; G.ui.aviso(visto ? '✊ Reducido, pero hizo ruido' : '✊ Reducido sin un ruido', 1600, 'reducir'); if (visto) G.busq.alerta(6, { causa: 'forcejeo' });
    G.reducidos = (G.reducidos || 0) + 1;
  },
  /* ---- seguir: El Contador sale en su carro hacia la salida de la ciudad; el Rastreador Cerbero lo marca al tocarlo ---- */
  ponerSeguido(p) {
    const m = resolver(p.desde); if (!m) return; const Q = planeta.puertas(G.id, G.M), dest = Q.siguiente, Cb = new MC.Cuerpo(G.M, { x: m.x, y: m.y, a: m.a, veh: 'banda_suv' });
    G.seguido = { cuerpo: Cb, marcado: false, ruta: null, rt: 0, dest, salio: false }; this.est.meta = null; G.objetivo = { x: m.x, y: m.y, texto: 'El Contador' };
  },
  seguir(dt) {
    const S = G.seguido, E = this.est; if (!S) return; const C = G.cuerpo, B = S.cuerpo, d = Math.hypot(B.x - C.x, B.y - C.y);
    if ((S.rt -= dt) <= 0) { S.rt = 2; const r = MC.Manejo.rutaA(G.M, B, S.dest, 'rueda'); S.ruta = Array.isArray(r) && r.length >= 4 ? r : S.ruta; }
    B.escala = S.marcado ? 1 : .82 + (d < 60 ? .2 : 0); if (S.ruta) { const g = MC.Manejo.pilotar(B, S.ruta, dt, { radio: 6 }); if (g && g.atascado) S.rt = 0; } else B.actualizar(dt, { acel: -.3, giro: 0 });
    G.objetivo = { x: B.x, y: B.y, texto: S.marcado ? '📍 El Contador (marcado)' : 'El Contador' };
    if (!S.marcado && d < 4.6) { S.marcado = true; G.ui.aviso('📍 Rastreador Cerbero pegado. Ya no se te escapa', 2400, 'rast'); Subt.decir([['rook', 'Lo tiene. Ahora déjelo correr y no lo pierda de vista hasta la autopista.']]); }
    if (!S.marcado && E.t > 90) { this.ocupado = true; fallar('🚙 Se te escapó', 'El Contador se perdió en el tráfico de la Avenida El Poblado. Sin rastreador no hay rastro.'); return; }
    if (Math.hypot(B.x - S.dest.x, B.y - S.dest.y) < 45) { if (S.marcado) { G.ui.aviso('📍 Salió hacia el oriente. El rastreador dice: Guatapé', 2600, 'rast'); G.seguido = null; this.completar(); } else { this.ocupado = true; fallar('🚙 Se te escapó', 'Salió del valle sin rastreador.'); } }
  },
  /* ---- T06 · módulo de acceso: sincroniza tres veces la aguja con la ventana verde ---- */
  acceso() {
    this.ocupado = true; G.pausa = true; const box = document.createElement('div'); box.id = 'acceso';
    box.innerHTML = '<div class="m"><b>🔓 Módulo de acceso · T06</b><small>Toca cuando la aguja pase por la ventana verde. Tres veces. Cada falla hace ruido.</small><div class="barra"><i class="v"></i><i class="a"></i></div><div class="cta"><span id="acN">0 / 3</span><button id="acB">🔓 Sincronizar</button></div></div>';
    document.body.appendChild(box); const a = box.querySelector('.a'), v = box.querySelector('.v'); let t = 0, ok = 0, mal = 0, w0 = .3 + Math.random() * .45, vel = 1.1, vivo = true;
    v.style.left = (w0 * 100) + '%'; const anim = () => { if (!vivo) return; t += .016 * vel; const x = (Math.sin(t * 3) * .5 + .5); a.style.left = (x * 100) + '%'; a._x = x; requestAnimationFrame(anim); }; anim();
    box.querySelector('#acB').onclick = () => { const x = a._x || 0; if (x >= w0 && x <= w0 + .14) { ok++; vel += .35; w0 = .15 + Math.random() * .65; v.style.left = (w0 * 100) + '%'; Snd.golpe(.05); } else { mal++; G.busq.alerta(9, { causa: 'la cerradura hizo ruido' }); Snd.golpe(.2); } box.querySelector('#acN').textContent = ok + ' / 3' + (mal ? ' · ruido ' + mal : '');
      if (ok >= 3 || mal >= 4) { vivo = false; box.remove(); G.pausa = false; if (mal >= 4) { G.ui.aviso('🚨 Forzaste la puerta: entrada a las malas', 2400, 'nivel'); G.busq.ponerNivel(Math.max(2, G.busq.nivel)); } else G.ui.aviso('🔓 Abierta', 1400, 'acc'); this.ocupado = false; this.empezarPaso(this.i + 1); } };
  },
  /* ---- T11 · foto (el botón 📷 aparece cerca y quieta) ---- */
  foto() { if (!this.p || this.p.tipo !== 'foto' || !G.puedeFoto) return; const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 260); Snd.ruido(.08, 6000, .3); G.ui.aviso('📷 Foto con metadatos guardada', 1600, 'foto'); this.completar(); }
};
function sumarEvidencia(n) { G.evidencia += n; G.ui.aviso('🧳 Prueba guardada en la Caja de custodia · ' + G.evidencia, 2000, 'ev'); }
/* tarjeta de capítulo (pantalla negra con el título) */
async function tarjeta(p, h, s, acto) { const tr = $('#transicion'); if (acto) tr.dataset.acto = acto; $('#trP').textContent = p; $('#trH').textContent = h; $('#trS').textContent = s || ''; tr.classList.add('on'); G.pausa = true; await espera(1900); tr.classList.remove('on'); G.pausa = false; await espera(300); delete tr.dataset.acto; }

/* ---------- Calle libre: contratos en cualquier ciudad del planeta ---------- */
const Contratos = {
  ofertas() { const L = TC.CONTRATOS.slice().sort(() => Math.random() - .5).slice(0, 3); return L.map(c => Object.assign({}, c, { pagoF: Math.round(c.pago[0] + Math.random() * (c.pago[1] - c.pago[0])) })); },
  menu() {
    if (!G.M.esCiudad) return G.ui.aviso('📞 En la carretera no hay contratos: llega a una ciudad', 2000, 'contrato'); if (G.contrato) return G.ui.dialogo('📞 ' + suave(G.contrato.c.n), suave(G.contrato.c.texto), ['Seguir', 'Abandonar']).then(i => { if (i === 1) { G.contrato = null; G.objetivo = null; G.ui.aviso('Contrato abandonado'); } });
    const O = this.ofertas(); G.ui.menu('📞 Contratos · ' + planeta.def(G.id).nombre, O.map((c, i) => ({ id: String(i), texto: '<b>' + suave(c.n) + '</b> · ' + plata(c.pagoF) + '<br><small>' + suave(c.texto) + ' · ' + '🚨'.repeat(c.heat) + '</small>' })), id => this.empezar(O[+id]));
  },
  /* un punto sobre una calle para carros (no escaleras, senderos ni ciclorrutas: el rival y la policía también tienen que llegar) */
  punto(cx, cy, r0, r1) { const M = G.M, R = M.red('rueda'); for (let k = 0; k < 60; k++) { const a = Math.random() * TAU, d = r0 + Math.random() * (r1 - r0), q = R.cercana(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 80, e => e.k >= 1 && e.k <= 4); if (q && M.dentro(q.x, q.y)) return { x: q.x, y: q.y }; } return null; },
  empezar(c) { const C = G.cuerpo, o = this.punto(C.x, C.y, 350, 1000), d = o && this.punto(o.x, o.y, 700, 1700); if (!o || !d) return G.ui.aviso('No hay calles para ese contrato aquí'); G.contrato = { c, o, d, fase: 0, t: 0, fuera: 0 }; G.objetivo = { x: o.x, y: o.y, texto: 'Recoger' }; G.ui.aviso('📞 ' + suave(c.n) + ': ve a recoger', 2200, 'contrato'); },
  paso(dt) {
    const K = G.contrato; if (!K || G.pausa) return; const C = G.cuerpo; K.t += dt;
    if (K.c.limite && K.t > K.c.limite) { G.ui.aviso('⏱ ' + K.c.n + ': se acabó el tiempo. Sin pago', 2600, 'contrato'); G.contrato = null; G.objetivo = null; return; }
    if (K.fase === 0 && Math.hypot(K.o.x - C.x, K.o.y - C.y) < 18) { if (Math.abs(C.v) < 3) { K.esp = (K.esp || 0) + dt; G.ui.aviso('📦 Cargando… ' + Math.min(100, Math.round(K.esp / 1.5 * 100)) + '%', 400, 'contrato'); if (K.esp > 1.5) { K.fase = 1; if (K.c.heat) G.busq.ponerNivel(Math.max(G.busq.nivel, K.c.heat)); if (K.c.banda) G.busq.banda(K.c.banda); G.objetivo = K.c.tipo === 'cobro' ? null : { x: K.d.x, y: K.d.y, texto: 'Entregar' }; G.ui.aviso(K.c.tipo === 'cobro' ? '🔫 Saca de la vía a los cobradores' : '📦 Llévalo: ' + Math.round(Math.hypot(K.d.x - C.x, K.d.y - C.y)) + ' m', 2400, 'contrato'); } } }
    else if (K.fase === 1) { const llego = K.c.tipo === 'cobro' ? K.fuera >= (K.c.banda || 1) : Math.hypot(K.d.x - C.x, K.d.y - C.y) < 18; if (llego) { if (K.c.tipo === 'fuga' && G.busq.nivel > 0) { if (K.t - (K.ult || 0) > 4) { K.ult = K.t; G.ui.aviso('🚨 Piérdelos antes de entregar', 2000, 'contrato'); } return; } G.dinero += K.c.pagoF; G.ui.aviso('💵 ' + K.c.n + ': +' + plata(K.c.pagoF), 2600, 'plata'); G.contrato = null; G.objetivo = null; guardarPosicion(); } }
  },
  fuera(ev) { if (G.contrato && ev.bando === 'banda') G.contrato.fuera++; }
};
const Libre = {
  async empezar(id, donde, op = {}) {
    /* G-H20: cancelamos diálogos antiguos sin dejar al Acto anterior continuar por detrás. */
    G.narrativaEpoch = (G.narrativaEpoch || 0) + 1;
    Subt.limpiar();
    if (G.ui?.capa) {
      for (const d of G.ui.capa.querySelectorAll('.dialogo')) {
        const first = d.querySelector('button'); if (first) first.click(); else d.remove();
      }
      for (const m of G.ui.capa.querySelectorAll('.menu')) m.remove();
    }
    G.pausa = false; G.hist = null; G.modo = 'libre'; Historia.p = null; G.climaForzado = null;
    await entrarMundo(id, donde || {});
    if (!op.rapido) await tarjeta('Mundo abierto', planeta.def(id).nombre, 'Contratos 📞 · el planeta entero 🌍 · las carreteras de la nada');
    G.ui.aviso(op.rapido ? '🌎 Mundo abierto: ve a donde quieras · 📖 la historia es opcional · 📞 contratos' : '📞 Toca Contratos para trabajar · 🌍 para ver el planeta · 📖 la historia cuando quieras', 3600, 'libre');
  }
};
