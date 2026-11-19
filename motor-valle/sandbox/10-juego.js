/* =====================================================================
   MOTOR CITY · BANCO DE PRUEBAS JUGABLE (sandbox)
   El motor completo sobre el mundo real de Medellín: un personaje, todos los vehículos, todas las vistas
   (y el pixel), el reloj, el clima, el tráfico con semáforos, el metro, el tranvía, los cables y el Metroplús
   con su horario real, la panorámica de perfil que sigue la vía y Run en la ciclovía.
   No es un juego: es la prueba de que el terreno está listo para sembrar los juegos.
   ===================================================================== */
const $ = s => document.querySelector(s);
const ESTADO_DEF = { v: 1, aspecto: { piel: 2, colPelo: 1, peinado: 1, camisa: 0, pantalon: 0, zapatos: 1, casco: 2 }, veh: 'bici', vista: 'cenital', pixel: false, lugar: 'explora' };
const S = window.MCS = { listo: false, errores: MC.errores };
function progreso(p, t) { $('#cargaB').style.width = p + '%'; $('#cargaT').textContent = t; return new Promise(r => setTimeout(r, 16)); }
function aviso(t, ms = 2400) { const a = $('#hAviso'); a.textContent = t; a.classList.add('on'); clearTimeout(aviso.t); aviso.t = setTimeout(() => a.classList.remove('on'), ms); }

async function iniciar() {
  const cv = $('#cv'), g = cv.getContext('2d', { alpha: false }), cfg = MC_CIUDAD_MEDELLIN, guard = MC.guardado.leer('motorcity.v1', ESTADO_DEF);
  await progreso(8, 'Abriendo el mundo…');
  const mundo = await MC.Mundo.cargar(MC_MUNDO_MEDELLIN, cfg);
  await progreso(30, 'Casas y edificios del valle (639.457)…'); mundo._ed();
  await progreso(48, 'Calles con nombre y ciclorrutas…'); mundo.vias(); mundo._rejillaVias();
  await progreso(62, 'Red de calles para el tráfico y la panorámica…'); mundo.red('rueda');
  await progreso(80, 'Metro, tranvía, cables y Metroplús con su horario…');
  const reloj = new MC.Reloj({ vel: 1 }), clima = new MC.Clima(cfg), transporte = new MC.Transporte(mundo, cfg), trafico = new MC.Trafico(mundo, { n: 34, peatones: 26, red: 'rueda' });
  const vistas = new MC.Vistas(mundo), camara = new MC.Camara({ zoom: 3.2 }), inicio = mundo.buscar(guard.lugar) || mundo.buscar('explora');
  const cuerpo = new MC.Cuerpo(mundo, { x: inicio.x, y: inicio.y, veh: guard.veh });
  const p0 = mundo.viaCercana(inicio.x, inicio.y, 120); if (p0) { cuerpo.x = p0.x; cuerpo.y = p0.y; cuerpo.a = p0.ang; }
  camara.x = cuerpo.x; camara.y = cuerpo.y;
  const jugador = { cuerpo, aspecto: MC.Personaje.aspecto(guard.aspecto) };
  const E = { mundo, camara, reloj, clima, transporte, jugador, t: 0, vehiculos: [], trafico: [], peatones: [], cables: transporte.lineas.filter(l => l.clase === 'cable') };
  let seguir = null, climaModo = 0; const CLIMAS = [null, 'despejado', 'nublado', 'lluvia', 'tormenta', 'niebla'];
  const controles = new MC.Controles(cv, { alGesto: q => { if (q.tipo === 'toque') return; camara.gesto(q); }, alTecla: k => tecla(k) });
  Object.assign(S, { mundo, reloj, clima, transporte, trafico, vistas, camara, cuerpo, jugador, E, controles, guardar });
  function guardar() { MC.guardado.escribir('motorcity.v1', Object.assign(guard, { veh: cuerpo.veh.id, vista: vistas.actual.id, pixel: vistas.pixel })); }
  /* ---------- vistas ---------- */
  function ponVista(id) { const v = vistas.usar(id, E); $('#bVista').firstChild.textContent = v.icon; aviso(v.icon + ' ' + v.n + (vistas.pixel ? ' · pixel' : '')); if (v.tipo === 'pano') entrarPano(); else seguir = null; guardar(); }
  function entrarPano() { try { seguir = new MC.SeguirRuta(mundo, cuerpo, { red: 'rueda' }); E.pano = { trazo: seguir.trazo, s: seguir.s, id: seguir.id }; vistas.pano.lado = -1; } catch (e) { seguir = null; aviso('No hay vía cerca para la panorámica'); vistas.usar('cenital', E); } }
  /* ---------- menús ---------- */
  function menu(html, alClic) { const m = $('#menu'); if (!html) { m.hidden = true; return; } m.innerHTML = html; m.hidden = false; m.onclick = e => { const b = e.target.closest('button'); if (b) { alClic(b.dataset.k); m.hidden = true; } }; }
  function menuVehiculos() { const L = MC.Vehiculos.de('motorcity', v => !v.publico); menu('<h4>Vehículo</h4>' + L.map(v => `<button data-k="${v.id}" class="${v.id === cuerpo.veh.id ? 'on' : ''}">${v.icon} ${v.n}${v.futuro ? ' <small>· Motor City / Extremo</small>' : ''}</button>`).join(''), id => { cuerpo.setVeh(id); $('#bVeh').firstChild.textContent = cuerpo.veh.icon; if (seguir) seguir.v = Math.min(seguir.v, cuerpo.vmax()); aviso(cuerpo.veh.icon + ' ' + cuerpo.veh.n); guardar(); }); }
  function menuVistas() { menu('<h4>Vista</h4>' + vistas.lista().map(v => `<button data-k="${v.id}" class="${v.id === vistas.actual.id ? 'on' : ''}" ${v.disponible ? '' : 'disabled'}>${v.icon} ${v.n}</button>`).join('') + `<button data-k="pixel" class="${vistas.pixel ? 'on' : ''}">👾 Pixel ${vistas.pixel ? 'encendido' : 'apagado'}</button>`, k => { if (k === 'pixel') { vistas.pixel = !vistas.pixel; $('#bPixel').classList.toggle('on', vistas.pixel); guardar(); } else ponVista(k); }); }
  function menuIr() { const L = mundo.lugares.filter(l => !l.secreto).slice(0, 40), Est = mundo.transporte.lineas.filter(l => l.clase === 'metro').flatMap(l => l.estaciones.map(s => s[0])); menu('<h4>Lugares</h4>' + L.map(l => `<button data-k="${l.id}">📍 ${l.nombre} <small>${l.municipio}</small></button>`).join('') + '<h4>Estaciones del metro</h4>' + [...new Set(Est)].map(n => `<button data-k="${n}">🚇 ${n}</button>`).join(''), k => { const p = mundo.buscar(k); if (!p) return; const c = mundo.viaCercana(p.x, p.y, 200); cuerpo.x = c ? c.x : p.x; cuerpo.y = c ? c.y : p.y; if (c) cuerpo.a = c.ang; cuerpo.v = 0; cuerpo.paso = null; cuerpo.zPaso = 0; camara.x = cuerpo.x; camara.y = cuerpo.y; guard.lugar = k; if (seguir) entrarPano(); aviso('📍 ' + p.nombre); guardar(); }); }
  function tecla(k) {
    if (k === 'KeyV') vistas.siguiente(E) && ponVista(vistas.actual.id);
    else if (k === 'KeyP') { vistas.pixel = !vistas.pixel; $('#bPixel').classList.toggle('on', vistas.pixel); aviso(vistas.pixel ? '👾 Pixel' : 'Pixel apagado'); guardar(); }
    else if (k === 'KeyH') { reloj.min = (reloj.min + 60) % 1440; aviso('🕐 ' + reloj.texto()); }
    else if (k === 'KeyC') { climaModo = (climaModo + 1) % CLIMAS.length; clima.forzar(CLIMAS[climaModo]); aviso(CLIMAS[climaModo] ? clima.actualizar(reloj).texto() : '🌦️ Clima del día'); }
    else if (k === 'KeyB') { const L = MC.Vehiculos.de('motorcity', v => !v.publico), i = L.findIndex(v => v.id === cuerpo.veh.id); cuerpo.setVeh(L[(i + 1) % L.length].id); $('#bVeh').firstChild.textContent = cuerpo.veh.icon; aviso(cuerpo.veh.icon + ' ' + cuerpo.veh.n); guardar(); }
    else if (k === 'KeyR' && !$('#bRun').hidden) entrarRun();
    else if (k === 'KeyY') { jugador.aspecto = MC.Personaje.azar(Date.now() & 0xffff); guard.aspecto = jugador.aspecto; guardar(); }
    else if (k === 'KeyQ' && seguir) seguir.girar(-1); else if (k === 'KeyE' && seguir) seguir.girar(1);
    else if (/^Digit[1-8]$/.test(k)) ponVista(MC.VISTAS[+k.slice(5) - 1].id);
    else if (k === 'Escape') menu(null);
  }
  $('#bVista').onclick = menuVistas; $('#bPixel').onclick = () => tecla('KeyP'); $('#bVeh').onclick = menuVehiculos; $('#bHora').onclick = () => tecla('KeyH'); $('#bClima').onclick = () => tecla('KeyC'); $('#bYo').onclick = () => tecla('KeyY'); $('#bIr').onclick = menuIr;
  const bt = (id, b) => { const el = $(id); el.onpointerdown = e => { e.preventDefault(); controles.boton(b, true); }; el.onpointerup = el.onpointerleave = () => controles.boton(b, false); };
  bt('#bSalto', 'salto'); bt('#bTurbo', 'turbo'); bt('#bTurbo', 'correr');
  $('#bRun').onclick = () => entrarRun();
  /* ---------- Run en la ciclovía ---------- */
  function entrarRun() {
    if (!MC.Run) return aviso('Run no está en esta compilación');
    menu(null); S.enRun = true;
    MC.Run.entrar({ mundo, cuerpo, reloj, clima, aspecto: jugador.aspecto, lienzo: $('#runCv'), capa: $('#run'), hud: $('#runHud'), alSalir: (r) => { S.enRun = false; $('#run').hidden = true; aviso('🏁 Run: ' + Math.round(r.metros) + ' m · ' + r.puntos + ' puntos · ' + (r.calle || '')); camara.x = cuerpo.x; camara.y = cuerpo.y; if (seguir) entrarPano(); } });
  }
  /* ---------- tamaño ---------- */
  let W = 0, H = 0, dpr = 1;
  function ajustar() { dpr = Math.min(2, window.devicePixelRatio || 1) * (vistas.calidad < .6 ? .75 : 1); W = Math.round(innerWidth * dpr); H = Math.round(innerHeight * dpr); cv.width = W; cv.height = H; vistas.dpr = dpr; }
  addEventListener('resize', ajustar); ajustar();
  /* huevos de pascua de ejemplo (cada juego pone los suyos con MC.huevos.poner) */
  const colt = mundo.buscar('coltejer'); if (colt) MC.huevos.poner({ id: 'aguja_coltejer', x: colt.x, y: colt.y, radio: 60, hora: [1080, 1440], texto: '✨ La aguja del Coltejer de noche' });
  MC.huevos.poner({ id: 'tres_timbrazos', cond: e => e.timbrazos >= 3 && e.bajoMetro, texto: '🔔🔔🔔 Tres timbrazos bajo el metro' });
  MC.on('huevo', h => aviso(h.texto || ('🥚 ' + h.id), 3500));
  ponVista(guard.vista); vistas.pixel = !!guard.pixel; $('#bPixel').classList.toggle('on', vistas.pixel); $('#bVeh').firstChild.textContent = cuerpo.veh.icon;
  await progreso(100, '¡Listo!'); $('#carga').hidden = true; $('#hud').hidden = false; S.listo = true;
  aviso('Mueve con el dedo o las flechas · V vista · P pixel · B vehículo · R Run en la ciclovía', 4200);
  /* ---------- ciclo ---------- */
  let t0 = performance.now(), hudT = 0, timbrazos = 0;
  MC.on('salto', () => { timbrazos++; setTimeout(() => timbrazos = Math.max(0, timbrazos - 1), 2500); });
  function cuadro(ahora) {
    requestAnimationFrame(cuadro); if (S.enRun) { t0 = ahora; return; }
    const dt = Math.min(.1, (ahora - t0) / 1000); t0 = ahora; E.t += dt; S.cuadros = (S.cuadros || 0) + 1;
    reloj.avanzar(dt); clima.actualizar(reloj, dt); E.cielo = MC.Cielo.en(reloj.fecha, reloj.hora, clima);
    const ent = controles.leer(), v = vistas.actual;
    if (v.tipo === 'pano' && seguir) {
      const sx = ent.stick.x * (vistas.pano.lado < 0 ? 1 : -1); seguir.paso(dt, { acel: Math.abs(ent.stick.x) > .2 ? sx : ent.acel, salto: ent.salto || ent.stick.y < -.7, turbo: ent.turbo });
      if (ent.pulsos.has('ArrowUp') && seguir.cruceProximo(60)) seguir.girar(-1); if (ent.pulsos.has('ArrowDown') && seguir.cruceProximo(60)) seguir.girar(1);
      E.pano = { trazo: seguir.trazo, s: seguir.s, id: seguir.id, ciclo: seguir.via && seguir.via.k === MC.VIA.CICLO };
    } else {
      let dir = null, acel = 0, giro = 0;
      if (v.control === 'mundo') { const s = ent.stick, c = Math.cos(camara.yaw), sn = Math.sin(camara.yaw); if (s.m > .08) dir = { x: s.x * c + s.y * sn, y: -s.x * sn + s.y * c, m: s.m }; }
      else { acel = -ent.stick.y || ent.acel; giro = ent.stick.x || ent.giro; }
      cuerpo.actualizar(dt, { dir, acel, giro, salto: ent.salto, turbo: ent.turbo, correr: ent.correr || ent.stick.m > .92, sube: ent.sube, baja: ent.baja });
    }
    camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v, zCuerpo: cuerpo.z });
    /* vida del mundo alrededor de la cámara */
    const caja = [camara.x - 1600, camara.y - 1600, camara.x + 1600, camara.y + 1600];
    E.vehiculos = transporte.vehiculos(reloj.fecha, reloj.seg, caja);
    E.trafico = trafico.paso(dt, cuerpo.x, cuerpo.y, reloj.seg, vistas.calidad); E.peatones = trafico.peatones;
    vistas.dibujar(g, W, H, E, dt);
    MC.huevos.revisar({ x: cuerpo.x, y: cuerpo.y, min: reloj.min, veh: cuerpo.veh.id, timbrazos, bajoMetro: mundo.nivel(cuerpo.x, cuerpo.y) >= 2 });
    hudT -= dt; if (hudT <= 0) { hudT = .25; hud(); }
  }
  function hud() {
    $('#hHora').textContent = '🕐 ' + reloj.texto() + (reloj.festivo ? ' · ' + reloj.festivo : '');
    $('#hClima').textContent = clima.texto(); $('#hLugar').textContent = '📍 ' + mundo.lugarTexto(cuerpo.x, cuerpo.y);
    $('#hCalle').textContent = (mundo.calle(cuerpo.x, cuerpo.y) || '') + (cuerpo.paso ? ' · 🌉 sobre el puente' : '') + (vistas.pixel ? ' · 👾' : '') + ' · ' + vistas.actual.n + ' · calidad ' + Math.round(vistas.calidad * 100) + '% · ' + vistas.ms.toFixed(1) + ' ms';
    $('#hV').textContent = Math.round(Math.abs(cuerpo.v) * 3.6); $('#hVeh').textContent = cuerpo.veh.icon;
    const enCiclo = mundo.esCiclovia(cuerpo.x, cuerpo.y, 7) && cuerpo.veh.run && !!MC.Run; $('#bRun').hidden = !enCiclo; S.enCiclovia = enCiclo;
    const c = seguir && seguir.cruceProximo(70); $('#hCruce').textContent = c ? `Cruce en ${Math.round(c.falta)} m · Q ← izquierda · E → derecha` : '';
  }
  requestAnimationFrame(cuadro);
}
iniciar().catch(e => { MC.falla('inicio', e); $('#cargaT').textContent = 'No se pudo abrir el mundo: ' + e.message; });
