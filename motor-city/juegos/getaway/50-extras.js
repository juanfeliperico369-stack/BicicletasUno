/* =====================================================================
   TURNO CERO · extras 4.0.2
   - RUN EN LA CICLOVÍA (el modo de Medellín, de Run Scooter): a pie, en EnCicla, patinete, skate o patines, sobre una
     ciclorruta, 🛴 Run te mete al corredor; si sales con más de 300 m, la policía te pierde («se fue por la ciclovía»).
   - CARRERAS CALLEJERAS (contrato «carrera»): un rival sale a tu lado hacia el mismo punto por la red vial real
     (rutas A* del motor); gana quien llegue primero. Apuestas con plata.
   - GUARDIAS QUE PERSIGUEN A PIE (C‑M32, primera parte): con la alarma, los guardias del sigilo corren hacia ti si
     estás a pie; de cerca golpean (no letal para ellos, sí te bajan la vida). Los reduces con ✊ o te subes al carro.
   - ACCESIBILIDAD ADULTA (revisión G7 de la biblia de Codex): menos destellos (sirenas y fogonazos suaves), sin
     sacudidas de cámara (MC.opciones.sacudida) y subtítulos grandes. Se guardan en este celular.
   ===================================================================== */
const Extras = {
  /* ---------- accesibilidad ---------- */
  aplicarOpciones() { const S = leerG(); MC.opciones.sacudida = S.sinSacudidas ? 0 : 1; G.pocosDestellos = !!S.pocosDestellos; document.body.classList.toggle('subtGrandes', !!S.subtGrandes); },
  opcionesMenu() {
    const S = leerG(), it = [{ id: 'pocosDestellos', texto: (S.pocosDestellos ? '✅' : '⬜') + ' Menos destellos (sirenas y disparos suaves)' }, { id: 'sinSacudidas', texto: (S.sinSacudidas ? '✅' : '⬜') + ' Sin sacudidas de cámara' }, { id: 'subtGrandes', texto: (S.subtGrandes ? '✅' : '⬜') + ' Subtítulos grandes' }, { id: 'suave', texto: (S.suave ? '✅' : '⬜') + ' Lenguaje suave' }];
    G.ui.menu('♿ Accesibilidad', it, k => { escribirG({ [k]: !leerG()[k] }); Extras.aplicarOpciones(); Extras.opcionesMenu(); });
  },
  /* ---------- Run en la ciclovía ---------- */
  puedeRun() { const C = G.cuerpo; return !!(MC.Run && MC.RunScooter && !G.viaje && G.M.esCiudad && C.veh.run && Math.abs(C.v) < 8 && MC.Run.puede(G.M, C).ok); },
  entrarRun() {
    if (!Extras.puedeRun()) return G.ui.aviso('🛴 Run sale en una ciclorruta, a pie o en bici, patinete, skate o patines', 2400, 'run');
    const C = G.cuerpo, nivel0 = G.busq.nivel; G.enRun = true; G.pausa = true; Snd.sirenaVol(0); if (Snd.mot) Snd.mot.g.gain.value = 0;
    try {
      MC.Run.entrar({ mundo: G.M, cuerpo: C, reloj: G.reloj, clima: G.clima, aspecto: G.aspecto, lienzo: $('#runCv'), capa: $('#run'), hud: $('#runHud'), alSalir: r => {
        G.enRun = false; G.pausa = false; $('#run').hidden = true; G.camara.x = C.x; G.camara.y = C.y; t0 = performance.now();
        const m = Math.round(r.metros || 0); if (nivel0 > 0 && m > 300) { G.busq.esconder('ciclovía'); G.ui.aviso('🛴 ' + m + ' m por la ciclovía: la policía te perdió', 2800, 'run'); } else G.ui.aviso('🛴 Run: ' + m + ' m · ' + (r.puntos || 0) + ' puntos', 2400, 'run');
        if (r.puntos) { const p = Math.round(r.puntos / 20); if (p > 0) { G.dinero += p; G.ui.aviso('💵 +' + plata(p) + ' (apuestas de la ciclovía)', 2000, 'plata'); } }
      } });
    } catch (e) { G.enRun = false; G.pausa = false; $('#run').hidden = true; G.ui.aviso('🛴 ' + e.message, 2400, 'run'); }
  },
  /* ---------- carreras callejeras ---------- */
  carrera(c) {
    const C = G.cuerpo, d = Contratos.punto(C.x, C.y, 1100, 2000); if (!d) return G.ui.aviso('No hay calles para una carrera aquí');
    const q = G.M.viaCercana(C.x + Math.cos(C.a + Math.PI / 2) * 4, C.y + Math.sin(C.a + Math.PI / 2) * 4, 20) || { x: C.x, y: C.y, ang: C.a }, R = new MC.Cuerpo(G.M, { x: q.x, y: q.y, a: C.a, veh: 'tc_noir' });
    G.contrato = { c, o: { x: C.x, y: C.y }, d, fase: 1, t: 0, fuera: 0, carrera: { cuerpo: R, ruta: null, rt: 0, cuenta: 3 } }; G.objetivo = { x: d.x, y: d.y, texto: 'Meta' };
    G.ui.aviso('🏁 ' + c.n + ': ' + Math.round(Math.hypot(d.x - C.x, d.y - C.y)) + ' m hasta la meta. Apuesta: ' + plata(c.pagoF), 2600, 'contrato');
  },
  pasoCarrera(dt) {
    const K = G.contrato, X = K.carrera, C = G.cuerpo, R = X.cuerpo; K.t += dt;
    if (X.cuenta > 0) { const antes = Math.ceil(X.cuenta); X.cuenta -= dt; if (Math.ceil(X.cuenta) !== antes) G.ui.aviso(X.cuenta > 0 ? '🏁 ' + Math.ceil(X.cuenta) : '🏁 ¡YA!', 700, 'carrera'); R.actualizar(dt, { acel: 0, giro: 0, salto: true }); return; }
    if ((X.rt -= dt) <= 0) { X.rt = 1.6; const r = MC.Manejo.rutaA(G.M, R, K.d, 'rueda'); X.ruta = Array.isArray(r) && r.length >= 4 ? r : X.ruta; }
    const g = X.ruta ? MC.Manejo.pilotar(R, X.ruta, dt, { radio: 6, turbo: true, lluvia: G.clima.lluvia }) : (R.actualizar(dt, { acel: -.3, giro: 0 }), null); R.escala = .93 + Math.min(.12, Math.hypot(C.x - R.x, C.y - R.y) / 2000);   /* el rival no se escapa ni se rinde (goma elástica suave) */
    if (g && g.atascado) X.rt = 0;
    const dj = Math.hypot(K.d.x - C.x, K.d.y - C.y), dr = Math.hypot(K.d.x - R.x, K.d.y - R.y);
    if (dj < 18 || dr < 18) { const gano = dj <= dr; if (gano) { G.dinero += K.c.pagoF; G.ui.aviso('🏆 Ganaste la carrera: +' + plata(K.c.pagoF), 2800, 'plata'); } else { G.dinero = Math.max(0, G.dinero - Math.round(K.c.pagoF / 2)); G.ui.aviso('😤 Te ganó por ' + Math.round(dj) + ' m. Pagas la mitad de la apuesta', 2800, 'plata'); } G.contrato = null; G.objetivo = null; guardarPosicion(); }
    else if (K.t > 300) { G.contrato = null; G.objetivo = null; G.ui.aviso('🏁 La carrera se canceló', 1800, 'carrera'); }
  },
  traficoCarrera() { const K = G.contrato; if (!K || !K.carrera) return []; const R = K.carrera.cuerpo; return [{ id: 'rival-carrera', tipo: 'carro', clase: 'auto', x: R.x, y: R.y, a: R.a, v: R.v, largo: 4.35, ancho: 1.8, color: '#c9a227', modelo: 'vehiculo_coupe', frena: 0 }]; },
  obstaculosCarrera() { const K = G.contrato; if (!K || !K.carrera) return []; const R = K.carrera.cuerpo, cs = Math.cos(R.a), sn = Math.sin(R.a); return [-1, 0, 1].map(k => ({ x: R.x + cs * 1.5 * k, y: R.y + sn * 1.5 * k, r: 1, motivo: 'rival:carrera' })); },
  /* ---------- guardias que persiguen a pie ---------- */
  guardiasPersiguen(dt) {
    const H = Historia, C = G.cuerpo;
    if (!H.p || H.p.tipo !== 'sigilo' || !H.est.alarma) return;
    const aPie = C.veh.clase === 'pie';
    for (const q of G.guardias) {
      if (q.fuera) continue;
      q.golpeT = Math.max(0, (q.golpeT || 0) - dt);
      /* Si pierde el campo visual, MC.AccionPie.paso sigue buscando en su último avistamiento. */
      const P = aPie ? MC.AccionPie.perseguir(q, C, G.M, dt) : { visible:false, golpe:false, movio:false };
      if (P.movio && q.m3) { q.m3.x=q.x; q.m3.y=q.y; q.m3.a=q.a; q.m3.clip='sprint_loop'; }
      if (P.golpe && q.golpeT <= 0) {
        q.golpeT = 1.3; G.vida = Math.max(0, G.vida - .1);
        G.camara.sacudir(.1); Snd.golpe(.35);
        if (q.m3) q.m3.clip = 'nonlethal_strike';
        G.ui.aviso('👊 Un guardia te golpea: redúcelo ✊ o súbete al carro', 1500, 'golpe');
      } else if (!P.visible && q.m3 && q.estado !== 'busqueda') q.m3.clip = 'idle_breath';
    }
  }
};
/* ganchos: la carrera es otro tipo de contrato */
{ const _emp = Contratos.empezar.bind(Contratos), _paso = Contratos.paso.bind(Contratos);
  Contratos.empezar = c => c.tipo === 'carrera' ? Extras.carrera(c) : _emp(c);
  Contratos.paso = dt => { if (G.contrato && G.contrato.carrera && !G.pausa) return Extras.pasoCarrera(dt); return _paso(dt); };
  const _sig = Historia.sigilo.bind(Historia); Historia.sigilo = (dt, d) => { _sig(dt, d); Extras.guardiasPersiguen(dt); };
  EXTRAS.trafico.push(() => Extras.traficoCarrera()); EXTRAS.obstaculos.push(() => Extras.obstaculosCarrera());
  EXTRAS.hud.push(() => { if (BOT.run) BOT.run.hidden = !Extras.puedeRun(); });
  EXTRAS.ui.push(b => { b('run', '🛴', 'Run', () => Extras.entrarRun()); BOT.run.hidden = true; Extras.aplicarOpciones(); }); }
TC.CONTRATOS.push(
  { id: 'carrera_corta', n: 'Carrera de semáforo', tipo: 'carrera', pago: [200, 350], heat: 0, texto: 'Un muchacho con un coupé dorado te reta. Hasta el punto marcado, por donde quieras.' },
  { id: 'carrera_larga', n: 'Carrera de medianoche', tipo: 'carrera', pago: [400, 700], heat: 1, texto: 'Apuesta grande, ruta larga y alguien ya llamó a la policía.' });
