/* __NOMBRE__ · un juego nuevo sobre Motor City. Lo mínimo: mundo, cámara, vistas, cuerpo, controles y un ciclo.
   Ideas: agrega MC.Mision, MC.Inventario, MC.Libro (plata), MC.Seres (biología), MC.Taller (vehículos), MC.Musica,
   MC.Poblacion (gente), MC.Interiores, MC.UI… El contrato está en MOTOR.md y la guía en docs/GUIA.md. */
(async () => {
  MC.ciudadBase = MC_CIUDAD_BASE;
  const mundo = await MC.Mundo.cargar(MC_MUNDO, Object.assign({}, MC_CIUDAD, { zonas: Object.assign({}, MC.ZONAS_BASE, MC_CIUDAD.zonas || {}) }));
  const cv = document.querySelector('#cv'), g = cv.getContext('2d'), ui = MC.UI.crear(document.body, { tema: 'motorcity' });
  const c = mundo.viaCercana(mundo.ancho / 2, mundo.alto / 2, 2000) || { x: mundo.ancho / 2, y: mundo.alto / 2, ang: 0 };
  const reloj = new MC.Reloj({ vel: 1 }), clima = new MC.ClimaGlobal({ lat: mundo.meta.latN, alt: mundo.cota(c.x, c.y) }), vistas = new MC.Vistas(mundo), camara = new MC.Camara({ zoom: 3 });
  const cuerpo = new MC.Cuerpo(mundo, { x: c.x, y: c.y, a: c.ang, veh: 'bici' }), jugador = { cuerpo, aspecto: MC.Personaje.aspecto({}) };
  const E = { mundo, camara, reloj, clima, jugador, t: 0, vehiculos: [], trafico: [], peatones: [] }, ctl = new MC.Controles(cv, { alGesto: q => camara.gesto(q) });
  ui.boton({ id: 'vista', icono: '🗺️', texto: 'Vista', al: () => vistas.siguiente(E) });
  let W, H; const ajustar = () => { W = cv.width = innerWidth * devicePixelRatio; H = cv.height = innerHeight * devicePixelRatio; }; addEventListener('resize', ajustar); ajustar();
  let t0 = performance.now();
  const cuadro = t => { requestAnimationFrame(cuadro); const dt = Math.min(.1, (t - t0) / 1000); t0 = t; E.t += dt;
    reloj.avanzar(dt); clima.actualizar(reloj, dt); E.cielo = MC.Cielo.en(reloj.fecha, reloj.hora, clima);
    const s = ctl.leer().stick; cuerpo.actualizar(dt, { dir: s.m > .08 ? { x: s.x, y: s.y, m: s.m } : null });
    camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v });
    vistas.dibujar(g, W, H, E, dt); ui.ficha('hora', '🕐 ' + reloj.texto()); ui.ficha('clima', clima.texto()); };
  requestAnimationFrame(cuadro);
})();
