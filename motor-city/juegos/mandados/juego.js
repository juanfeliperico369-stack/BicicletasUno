/* =====================================================================
   MANDADOS · minijuego de prueba de Motor City (todo lo del motor, junto y jugable)
   Mundo: Guatapé craqueado de datos abiertos (geo/territorio.py) o un mundo nuevo generado (MC.Generador).
   Usa: vistas + pixel, controles, cámara, física, vehículos diseñados en el taller (con gasolina), persona con
   biología (energía, agua, calor), economía (libro contable en pesos), misiones con tiempo, interiores procedurales
   para entregar en la mano, población con rutinas, tráfico, un perro que te sigue, clima global, música adaptativa,
   interfaz integrada y minimapa.
   2.2: vista lateral (gira de a 90°), manejo con curvas y asistencias (joystick, un pulgar, inclinar, tocar para ir),
   MI CASA (tu dirección real → tu casa, que diseñas con muebles del catálogo), lugares jugables (talleres que
   reparan y mejoran, tiendas, restaurantes, bibliotecas), desgaste del vehículo, historias con director de ritmo
   y ocurrencias (lo imprevisto se corrige solo y se anota).
   2.3: sombras del sol por hora, mobiliario urbano y luces de noche, fachadas por reglas (WFC), MODO ALCALDE (zonas,
   demanda RCI, valor del suelo, servicios y capas de datos, a la manera de SimCity y Cities: Skylines), la casa con
   alguien que vive en ella y usa lo que pongas (Los Sims) y paisaje sonoro (tráfico, pájaros, grillos, lluvia).
   ===================================================================== */
const GUARDA = 'motorcity.mandados.v1', leerG = () => { try { return JSON.parse(localStorage.getItem(GUARDA) || '{}'); } catch (e) { return {}; } }, escribirG = o => { try { localStorage.setItem(GUARDA, JSON.stringify(Object.assign(leerG(), o))); } catch (e) { /* sin almacenamiento */ } };
const $ = s => document.querySelector(s), cop = c => MC.Dinero.formato(c, 'COP');
const PRECIOS = { agua: 250000, gasolinaL: 430000, scooter: 4000000, moto: 12000000, carro: 30000000 };   // centavos (valores de juego; la gasolina, cerca del precio de referencia por litro)
let mundo = null, generado = false;
async function abrir(gen) {
  $('#estado').textContent = gen ? 'Generando un mundo nuevo…' : 'Abriendo Guatapé…'; await new Promise(r => setTimeout(r, 30));
  MC.ciudadBase = MC_CIUDAD_BASE;
  if (gen) { mundo = MC.Generador.mundo({ semilla: (Math.random() * 1e6) | 0, ancho: 448, alto: 448, tipo: Math.random() < .5 ? 'valle' : 'isla', pueblos: 3, lat: 6.2 }); generado = true; }
  else { const cfg = Object.assign({}, MC_CIUDAD, { zonas: Object.assign({}, MC.ZONAS_BASE, MC_CIUDAD.zonas || {}) }); mundo = await MC.Mundo.cargar(MC_MUNDO, cfg); }
  $('#estado').textContent = 'Armando las calles…'; await new Promise(r => setTimeout(r, 30)); mundo.red('rueda');
  $('#portada').hidden = true; jugar();
}
$('#jugar').onclick = () => abrir(false); $('#generado').onclick = () => abrir(true);
$('#estado').textContent = 'Listo para jugar';

function jugar() {
  const cv = $('#cv'), g = cv.getContext('2d', { alpha: false }), M = mundo, ui = MC.UI.crear(document.body, { tema: 'motorcity' });
  const lat = generado ? 6.2 : 6.234, centro = generado ? M.generado.pueblos[0] : M.geoAMetros(6.2338, -75.1592), c0 = M.viaCercana(centro.x, centro.y, 400) || { x: centro.x, y: centro.y, ang: 0 };
  const reloj = new MC.Reloj({ vel: 1.5 }), clima = new MC.ClimaGlobal({ lat, alt: M.cota(c0.x, c0.y) }), vistas = new MC.Vistas(M), camara = new MC.Camara({ zoom: 3.4, mundo: M });
  const yo = new MC.Seres.Persona({ edad: 24, forma: .55, semilla: (Math.random() * 1e6) | 0 }), cuerpo = new MC.Cuerpo(M, { x: c0.x, y: c0.y, a: c0.ang, veh: 'bici' }); cuerpo.clima = clima;
  const jugador = { cuerpo, aspecto: yo.aspecto({ casco: 2, camisa: 0 }) }, libro = new MC.Libro(); libro.mover('mundo', 'jugador', 1000000, 'Plata para empezar', false);
  /* vehículos diseñados con ingeniería real (taller) */
  const dMoto = MC.Taller.disenar({ id: 'moto_mandados', n: 'Moto de mandados', tipo: 'moto', masa: 115, potenciaKW: 7.5, parNm: 10, cd: .6, area: .8, crr: .015, mu: 1, marchas: [2.8, 1.9, 1.4, 1.1, .9], final: 3, rueda: .3, tanqueL: 12, color: '#ff7043' });
  const dCarro = MC.Taller.disenar({ id: 'carro_mandados', n: 'Carro de mandados', masa: 1050, potenciaKW: 63, parNm: 120, cd: .33, area: 2, tanqueL: 40, color: '#00e5ff' });
  MC.Taller.registrar(dMoto, { vmax: Math.min(dMoto.vmax, 22) }); MC.Taller.registrar(dCarro, { vmax: Math.min(dCarro.vmax, 25) });
  const garaje = { bici: { n: '🚲 Bici', tiene: true }, scooter: { n: '🛵 Scooter eléctrico', precio: PRECIOS.scooter }, moto_mandados: { n: '🏍️ Moto (' + Math.round(dMoto.vmax * 3.6) + ' km/h, ' + dMoto.consumo.toFixed(1) + ' L/100 km)', precio: PRECIOS.moto, tanque: 12, consumo: dMoto.consumo }, carro_mandados: { n: '🚗 Carro (0–100 en ' + dCarro.ceroCien.toFixed(1) + ' s)', precio: PRECIOS.carro, tanque: 40, consumo: dCarro.consumo }, pie: { n: '🚶 A pie', tiene: true } };
  const tanque = { moto_mandados: 6, carro_mandados: 20 };
  const E = { mundo: M, camara, reloj, clima, transporte: null, jugador, t: 0, vehiculos: [], trafico: [], peatones: [], extras: [], cables: [] };
  const pobl = new MC.Poblacion(M, { n: 36, centro: c0, radio: 900, semilla: 4 }), trafico = new MC.Trafico(M, { n: 10, peatones: 0, red: 'rueda', radio: 400 });
  const perro = MC.Seres.Animal.crear('perro_criollo', 3); perro.x = c0.x - 3; perro.y = c0.y; perro.a = 0; perro.v = 0;
  E.extras.push({ get x() { return perro.x; }, get y() { return perro.y; }, dibujar(gg, pr, z, P) { const [sx, sy] = pr(perro.x, perro.y, 0); if (P.hk < .1) { gg.save(); gg.translate(sx, sy); gg.rotate(perro.a + P.yaw); gg.fillStyle = perro.colores[0]; gg.beginPath(); gg.ellipse(0, 0, z * .45, z * .17, 0, 0, MC.TAU); gg.fill(); gg.beginPath(); gg.arc(z * .45, 0, z * .13, 0, MC.TAU); gg.fill(); gg.restore(); } else MC.arte.f('animalLado')(gg, perro, sx, sy, z * P.hk * 1.4, Math.cos(perro.a + P.yaw) >= 0 ? 1 : -1, E.t, perro.v); } });
  /* lugares de los mandados: los que tienen nombre y quedan cerca de una vía */
  const sitios = M.lugares.filter(l => M.viaCercana(l.x, l.y, 45) && M.suelo(l.x, l.y) !== MC.TT.WATER).slice(0, 200);
  if (sitios.length < 4) for (const e of M.edificiosEn(c0.x - 800, c0.y - 800, c0.x + 800, c0.y + 800).slice(0, 60)) sitios.push({ nombre: 'Casa ' + (sitios.length + 1), x: e.x, y: e.y, dibujo: 'casa' });
  const tiendas = M.lugares.filter(l => /store|shop|super|market|tienda|restaurant|cafe|bakery|food/i.test(l.dibujo || '')), gasolineras = M.lugares.filter(l => /gas|fuel/i.test(l.dibujo || ''));
  let mision = null, entregado = false, interior = null, dinero0 = 0, hechos = 0;
  /* 2.2: historias, ocurrencias, desgaste, manejo y mi casa */
  const hist = new MC.Historias({ semilla: 11 }), ocu = new MC.Ocurrencias({ juego: 'mandados' }), desg = {}, banderas = {}; let esquema = leerG().esquema || 'joystick', ruta = null, hogar = null;
  if (!generado && leerG().hogar) { try { hogar = new MC.Hogar(M, leerG().hogar); } catch (e) { hogar = null; } }
  E.extras.push({ get x() { return hogar ? hogar.d.x : -1e9; }, get y() { return hogar ? hogar.d.y : -1e9; }, dibujar(gg, pr, z) { if (!hogar) return; const [sx, sy] = pr(hogar.d.x, hogar.d.y, 9); gg.font = Math.round(Math.max(16, z * 5)) + 'px system-ui'; gg.textAlign = 'center'; gg.fillText('🏠', sx, sy); } });
  MC.on('choque', () => { hist.director.sumar('choque'); camara.sacudir(.35); }); MC.on('atascado', () => { bRescate.hidden = false; });
  const nuevaMision = () => {
    const az = Math.random, o = sitios[(az() * sitios.length) | 0]; let d = null; for (let k = 0; k < 40 && !d; k++) { const q = sitios[(az() * sitios.length) | 0], dist = Math.hypot(q.x - o.x, q.y - o.y); if (q !== o && dist > 250 && dist < 1600) d = q; } if (!d) d = sitios[(sitios.indexOf(o) + 1) % sitios.length];
    const dist = Math.hypot(d.x - o.x, d.y - o.y) + Math.hypot(o.x - cuerpo.x, o.y - cuerpo.y), masa = +(0.5 + az() * 7).toFixed(1), limite = Math.round(dist / 3.4 + 60), pago = Math.round((300000 + dist * 600) / 100) * 100;
    entregado = false; const paquete = { id: 'paquete', n: 'Paquete', masa, volumen: masa * 3 };
    mision = new MC.Mision({ titulo: 'De ' + o.nombre + ' a ' + d.nombre, limite, premio: pago, libro, cuenta: 'jugador', pasos: [{ tipo: 'ir', x: o.x, y: o.y, radio: 22, texto: 'Recoge en ' + o.nombre }, { tipo: 'esperar', x: o.x, y: o.y, radio: 22, seg: 1.2, texto: 'Recogiendo…' }, { tipo: 'ir', x: d.x, y: d.y, radio: 22, texto: 'Lleva a ' + d.nombre }, { tipo: 'condicion', x: d.x, y: d.y, radio: 40, cond: () => entregado, texto: 'Entra y entrega en la mano 🚪' }] });
    mision.paquete = paquete; mision.origen = o; mision.destino = d; mision.pago = pago; dinero0 = libro.saldo('jugador');
    ui.aviso('📦 Mandado nuevo: ' + o.nombre + ' → ' + d.nombre + ' · ' + cop(pago) + ' · ' + masa + ' kg', 3500);
  };
  MC.on('mision', ev => { if (ev.estado === 'cumplida' || ev.estado === 'fallida') hist.director.resultado(ev.estado === 'cumplida'); if (ev.estado === 'cumplida') { hechos++; ui.aviso('✅ ¡Entregado! +' + cop(mision.pago) + ' · llevas ' + hechos, 3000); setTimeout(nuevaMision, 2500); } else if (ev.estado === 'fallida') { ui.aviso('⏰ Se acabó el tiempo. Pagan la mitad.', 3000); libro.mover('mundo', 'jugador', mision.pago / 2, 'Mandado tarde', false); setTimeout(nuevaMision, 2500); } });
  /* controles e interfaz */
  const ctl = new MC.Controles(cv, { alGesto: q => { if (q.tipo !== 'toque') camara.gesto(q); else tocarMapa(q); }, alTecla: k => tecla(k) });
  const VIST = ['cenital', 'ciudad3d', 'maqueta', 'lateral', 'pano', 'tercera']; let iv = 0, seguir = null;
  /* tocar para ir: en la vista cenital, un toque marca el destino y el personaje va solo por las calles (A*) */
  const tocarMapa = q => { if (esquema !== 'tocar_ir' || vistas.actual.id !== 'cenital') return; const d = vistas.dpr || 1, [x, y] = camara.aMundo(q.x * d, q.y * d, W, H); ruta = MC.Manejo.rutaA(M, cuerpo, { x, y }, cuerpo.veh.clase === 'pie' ? 'rueda' : 'rueda'); ui.aviso('👆 Vamos para allá'); };
  const ponVista = id => { const v = vistas.usar(id, E); bGirar.hidden = !(v.id === 'lateral' || v.id === 'maqueta'); if (v.tipo === 'pano') { try { seguir = new MC.SeguirRuta(M, cuerpo, { red: 'rueda' }); } catch (e) { seguir = null; } } else seguir = null; ui.aviso(v.icon + ' ' + v.n); };
  const tecla = k => { if (k === 'KeyQ') camara.girar90(-1); else if (k === 'KeyR') camara.girar90(1); else if (k === 'KeyH') casa(); else if (k === 'KeyV') { iv = (iv + 1) % VIST.length; ponVista(VIST[iv]); } else if (k === 'KeyP') vistas.pixel = !vistas.pixel; else if (k === 'KeyM') musica(); else if (k === 'KeyE') entrar(); else if (k === 'KeyB') menuVeh(); };
  ui.boton({ id: 'vista', icono: '🗺️', texto: 'Vista', al: () => tecla('KeyV') }); ui.boton({ id: 'pixel', icono: '👾', texto: 'Pixel', al: () => tecla('KeyP') }); ui.boton({ id: 'veh', icono: '🚲', texto: 'Vehículo', al: () => menuVeh() }); ui.boton({ id: 'musica', icono: '🎵', texto: 'Sonido', al: () => menuSonido() });
  const bAccion = ui.boton({ id: 'accion', icono: '🚪', texto: 'Entrar', al: () => entrar() }); bAccion.hidden = true;
  const bComprar = ui.boton({ id: 'comprar', icono: '💧', texto: 'Agua', al: () => comprar() }); bComprar.hidden = true;
  const bGirar = ui.boton({ id: 'girar', icono: '↻', texto: 'Girar', al: () => camara.girar90(1) }); bGirar.hidden = true;
  ui.boton({ id: 'casa', icono: '🏠', texto: 'Mi casa', al: () => casa() }); ui.boton({ id: 'ciudad', icono: '🏙️', texto: 'Ciudad', al: () => menuCiudad() }); ui.boton({ id: 'control', icono: '🎮', texto: 'Control', al: () => menuControl() });
  const bLugar = ui.boton({ id: 'lugar', icono: '🔧', texto: 'Lugar', al: () => menuLugar() }); bLugar.hidden = true;
  const bRescate = ui.boton({ id: 'rescate', icono: '🆘', texto: 'Salir de aquí', al: () => { ocu.rescatar(cuerpo, M); bRescate.hidden = true; } }); bRescate.hidden = true;
  const menuControl = () => ui.menu('Tipo de control', Object.entries(MC.Manejo.ESQUEMAS).filter(([id]) => ['joystick', 'un_pulgar', 'inclinacion', 'tocar_ir'].includes(id)).map(([id, Q]) => ({ id, texto: Q.icono + ' ' + Q.n + (esquema === id ? ' ✓' : '') })), id => { esquema = id; escribirG({ esquema }); ruta = null; if (id === 'inclinacion') MC.Manejo.activarInclinacion(); if (id === 'tocar_ir' && vistas.actual.id !== 'cenital') { iv = 0; ponVista('cenital'); } ui.aviso(MC.Manejo.ESQUEMAS[id].ayuda, 3500); });
  /* lugares jugables: talleres, tiendas, restaurantes, bibliotecas, parques… */
  let lugarCerca = null;
  const menuLugar = () => { const L = lugarCerca; if (!L) return; const V = cuerpo.veh, st = desg[V.id] || (desg[V.id] = MC.Desgaste.nuevo(V)); ui.menu(L.icono + ' ' + L.nombre + (L.abierto(reloj.hora) ? '' : ' (cerrado)'), MC.Lugares.ACTIVIDADES[L.tipo].map(A => ({ id: A.id, texto: A.n + (A.precio ? ' · ' + cop(A.precio) : A.id === 'reparar' ? ' · ' + cop(MC.Desgaste.costoReparar(st, V)) + ' (estado ' + Math.round(st.estado * 100) + ' %)' : '') })), id => { const r = MC.Lugares.hacer(L, id, { libro, cuenta: 'jugador', persona: yo, aspecto: jugador.aspecto, desgaste: st, vehiculo: V, hora: reloj.hora, vez: hechos }); ui.aviso(r.texto, r.texto.length > 60 ? 6000 : 2500); }); };
  /* MI CASA: dirección real → edificio real → interior propio que se diseña */
  const casa = () => { if (hogar) { if (Math.hypot(hogar.d.x - cuerpo.x, hogar.d.y - cuerpo.y) < 30) return abrirCasa(); ui.aviso('🏠 Tu casa queda a ' + Math.round(Math.hypot(hogar.d.x - cuerpo.x, hogar.d.y - cuerpo.y)) + ' m (míralo en el minimapa) · mantén el botón para cambiarla', 3500); return; } pedirDireccion(); };
  const pedirDireccion = () => { const F = $('#casaForm'); F.hidden = false; $('#casaTxt').value = (hogar && hogar.d.direccion) || ''; $('#casaTxt').focus();
    $('#casaNo').onclick = () => { F.hidden = true; };
    $('#casaOk').onclick = () => { const t = $('#casaTxt').value.trim(); if (!t) return; const R = MC.Hogar.desdeDireccion(M, t, { guardaDireccion: $('#casaRec').checked }); if (!R.ok) { ui.aviso('No encontré esa dirección en el mapa. Prueba con «Calle 31 # 28-15».', 3500); return; }
      hogar = R.hogar; F.hidden = true; if (!generado) escribirG({ hogar: hogar.guardar() }); const q = { exacta: 'exacta', calle: 'sobre esa calle', lugar: 'cerca de ese lugar' }[R.ubicacion.calidad] || ''; ui.aviso('🏠 Tu casa: ' + M.lugarTexto(hogar.d.x, hogar.d.y) + ' (' + q + ')', 4000); }; };
  ui.capa.querySelector('[aria-label="Mi casa"]').addEventListener('contextmenu', e => { e.preventDefault(); pedirDireccion(); });
  ui.minimapa(vistas);
  const menuVeh = () => ui.menu('Garaje', Object.entries(garaje).map(([id, G]) => ({ id, texto: G.n + (G.tiene ? '' : ' · ' + cop(G.precio)) + (cuerpo.veh.id === id ? ' ✓' : '') })), id => { const G = garaje[id]; if (!G.tiene) { if (!libro.mover('jugador', 'tienda', G.precio, 'Compra: ' + G.n)) return ui.aviso('Te faltan ' + cop(G.precio - libro.saldo('jugador'))); G.tiene = true; ui.aviso('🎉 Compraste ' + G.n); } cuerpo.setVeh(id); if (seguir) seguir.v = Math.min(seguir.v, cuerpo.vmax()); });
  let tocando = null, temaI = 0; const TEMAS = [null, ...Object.keys(MC.Musica.CLASICOS)];
  const musica = () => { if (tocando) { MC.Musica.parar(); tocando = null; ui.aviso('🔇 Música apagada'); return; } temaI = (temaI + 1) % TEMAS.length; const A = MC.Musica.adaptar({ velocidad: Math.abs(cuerpo.v), hora: reloj.hora, clima }); tocando = MC.Musica.tocar({ estilo: A.estilo, tema: TEMAS[temaI], energia: A.energia, compases: 16, semilla: (Math.random() * 99) | 0 }); if (tocando) ui.aviso('🎵 ' + tocando.pieza.titulo + (TEMAS[temaI] ? ' (' + MC.Musica.CLASICOS[TEMAS[temaI]].autor + ', dominio público)' : '')); };
  /* sonido: música procedural y paisaje sonoro del lugar (tráfico, pájaros, grillos, lluvia, agua) */
  let ambienteOn = false; const menuSonido = () => ui.menu('Sonido', [{ id: 'm', texto: tocando ? '🎵 Otra canción' : '🎵 Música' }, { id: 'x', texto: '🔇 Apagar la música' }, { id: 'a', texto: ambienteOn ? '🌿 Sonido ambiente: apagar' : '🌿 Sonido ambiente: encender' }], id => { if (id === 'm') { if (tocando) { MC.Musica.parar(); tocando = null; } musica(); } else if (id === 'x') { if (tocando) { MC.Musica.parar(); tocando = null; } } else { ambienteOn = !ambienteOn; if (ambienteOn) MC.Paisaje.tocar(ctxSonido()); else MC.Paisaje.parar(); ui.aviso(ambienteOn ? '🌿 Escucha el lugar' : 'Ambiente apagado'); } });
  const ctxSonido = () => { const via = M.viaCercana(cuerpo.x, cuerpo.y, 40), ruido = urbe ? urbe.campoEn('ruido', cuerpo.x, cuerpo.y) : via ? ({ 1: .35, 2: .8, 3: 1, 4: .6 }[via.k] || .2) : .05; let agua = 1e4; for (let k = 0; k < 8 && agua > 100; k++) for (const r of [30, 70, 120]) if (M.suelo(cuerpo.x + Math.cos(k * .785) * r, cuerpo.y + Math.sin(k * .785) * r) === MC.TT.WATER) { agua = Math.min(agua, r); break; }
    const t = M.suelo(cuerpo.x, cuerpo.y); return { hora: reloj.hora, clima, ruido, agua, verde: urbe ? urbe.campoEn('verde', cuerpo.x, cuerpo.y) : t === MC.TT.GRASS || t === MC.TT.MOUNT ? .7 : .3, gente: Math.min(1, (E.peatones || []).filter(p => Math.hypot(p.x - cuerpo.x, p.y - cuerpo.y) < 40).length / 8), altura: cuerpo.altura, velocidad: Math.abs(cuerpo.v), adentro: !!interior }; };
  /* MODO ALCALDE: la simulación de ciudad (MC.Urbe) y las capas de datos */
  let urbe = null, capaId = null, urbeT = 0;
  const darUrbe = () => { if (!urbe) { urbe = new MC.Urbe(M, { libro, centro: { x: cuerpo.x, y: cuerpo.y }, alCambiar: (a, b, c, d) => vistas.losas.invalidar(a, b, c, d) }); libro.mover('mundo', 'alcaldia', 3000000000, 'Presupuesto inicial de la alcaldía', false); } return urbe; };
  const ponCapa = id => { capaId = id; E.capaInfo = id ? darUrbe().capa(id) : null; if (vistas.actual.tipo !== '2d') { iv = 0; ponVista('cenital'); } };
  const menuCiudad = () => ui.menu('🏙️ Ciudad (alcalde)', [
    { id: 'c:valor', texto: '📊 Ver valor del suelo' }, { id: 'c:ruido', texto: '🔊 Ver ruido' }, { id: 'c:contaminacion', texto: '🏭 Ver contaminación' }, { id: 'c:verde', texto: '🌳 Ver verde' }, { id: 'c:servicios', texto: '🏥 Ver servicios' }, { id: 'c:zonas', texto: '🟩 Ver zonas' }, { id: 'c:', texto: '✖ Quitar la capa' },
    { id: 'z:R', texto: '🏠 Zonificar residencial aquí' }, { id: 'z:C', texto: '🏪 Zonificar comercio aquí' }, { id: 'z:I', texto: '🏭 Zonificar industria aquí' },
    { id: 's:parque', texto: '🌳 Parque aquí · ' + cop(MC.SERVICIOS_URBE.parque.costo) }, { id: 's:colegio', texto: '🏫 Colegio aquí · ' + cop(MC.SERVICIOS_URBE.colegio.costo) }, { id: 's:energia', texto: '☀️ Planta solar aquí · ' + cop(MC.SERVICIOS_URBE.energia.costo) }, { id: 'r', texto: '📋 Cómo va el pueblo' }
  ], id => { const [k, v] = id.split(':'), U = darUrbe();
    if (k === 'c') { ponCapa(v || null); ui.aviso(v ? '📊 Capa: ' + v : 'Sin capa'); }
    else if (k === 'z') { const n = U.zonificar(v, cuerpo.x, cuerpo.y, 120); ponCapa('zonas'); ui.aviso(n ? '🟩 ' + n + ' lotes de ' + MC.ZONAS_URBE[v].n.toLowerCase() + ' junto a las calles. Crecerán si hay demanda.' : 'Aquí no hay terreno libre junto a una calle', 3500); }
    else if (k === 's') { const s = U.servicio(v, cuerpo.x + 12, cuerpo.y + 12); ui.aviso(s ? MC.SERVICIOS_URBE[v].icono + ' ' + s.n + ' construido' : 'La alcaldía no tiene plata para eso', 3000); if (s) ponCapa(v === 'parque' ? 'verde' : 'valor'); }
    else { const R = U.resumen(), D = R.demanda, b = x => (x > 0 ? '▲' : '▼') + Math.round(Math.abs(x) * 100); ui.dialogo('📋 ' + (M.meta.nombre || 'El pueblo') + ' · mes ' + R.mes, 'Población: ' + R.poblacion.toLocaleString('es-CO') + ' · empleos: ' + R.empleos.toLocaleString('es-CO') + '<br>Demanda: casas ' + b(D.R) + ' · comercio ' + b(D.C) + ' · industria ' + b(D.I) + '<br>Valor medio del suelo: ' + R.valorMedio + '/100 · lotes nuevos: ' + R.lotes + '<br>Alcaldía: ' + cop(libro.saldo('alcaldia')) + (R.ultimoMes ? ' · recaudo del mes ' + cop(R.ultimoMes.ingresos) : ''), ['Listo']); } });
  const cercaDe = (L, r) => L.find(l => Math.hypot(l.x - cuerpo.x, l.y - cuerpo.y) < r);
  const comprar = () => { const V = cuerpo.veh.id; if (tanque[V] != null && (cercaDe(gasolineras, 40) || !gasolineras.length && cercaDe(tiendas, 30))) { const L = garaje[V].tanque - tanque[V], c = Math.round(L * PRECIOS.gasolinaL); if (libro.mover('jugador', 'gasolinera', c, 'Gasolina')) { tanque[V] = garaje[V].tanque; ui.aviso('⛽ Tanque lleno: ' + L.toFixed(1) + ' L · ' + cop(c)); } else ui.aviso('No te alcanza la plata'); return; } if (libro.mover('jugador', 'tienda', PRECIOS.agua, 'Agua')) { yo.estado.hidratacion = Math.min(1, yo.estado.hidratacion + .5); yo.estado.energia = Math.min(1, yo.estado.energia + .15); ui.aviso('💧 Agua: ' + cop(PRECIOS.agua)); } else ui.aviso('No te alcanza para el agua'); };
  /* entregar adentro: el interior procedural del edificio del destino */
  const entrar = () => { if (!mision || mision.paso !== 3) return; const d = mision.destino, ed = M.edificiosEn(d.x - 45, d.y - 45, d.x + 45, d.y + 45).sort((a, b) => Math.hypot(a.x - d.x, a.y - d.y) - Math.hypot(b.x - d.x, b.y - d.y))[0]; if (!ed) { entregado = true; return; } abrirInterior(ed); };
  function abrirInterior(ed) {
    const P = MC.Interiores.generar(ed), capa = $('#interior'), ic = $('#icv'), ig = ic.getContext('2d'), cuartos = P.cuartos.filter(c => c.w > 1.5 && c.h > 1.5), dest = cuartos[cuartos.length - 1] || P.cuartos[0], ent = P.puertas.find(p => p.entrada);
    const yoI = { x: ent.x, y: .6, a: Math.PI / 2, fase: 0 }, ctlI = new MC.Controles(ic, {}), quien = MC.Personaje.azar((Math.random() * 1e5) | 0); capa.hidden = false; interior = true; ui.aviso('🚪 Busca a quien recibe (' + dest.tipo + ')');
    const paso = () => { if (!interior) return; requestAnimationFrame(paso); const W = ic.width = innerWidth * Math.min(2, devicePixelRatio || 1), H = ic.height = innerHeight * Math.min(2, devicePixelRatio || 1), esc = Math.min(W / (P.ancho + 3), H / (P.fondo + 3)), ox = (W - P.ancho * esc) / 2, oy = (H - P.fondo * esc) / 2, e = ctlI.leer();
      if (e.stick.m > .1) { const v = 2.2 / 60; const nx = yoI.x + e.stick.x * v * 2, ny = yoI.y + e.stick.y * v * 2; if (!P.solido(nx, yoI.y)) yoI.x = nx; if (!P.solido(yoI.x, ny)) yoI.y = ny; yoI.a = Math.atan2(e.stick.y, e.stick.x); yoI.fase += .25; }
      ig.fillStyle = '#141822'; ig.fillRect(0, 0, W, H); MC.Interiores.dibujar(ig, P, ox, oy, esc);
      const qx = dest.x + dest.w / 2, qy = dest.y + dest.h / 2, J = MC.Personaje.pose('quieto', 0); MC.arte.f('personajeArriba')(ig, J, quien, ox + qx * esc, oy + qy * esc, esc, Math.PI); ig.fillStyle = '#ffc23a'; ig.font = '800 ' + Math.round(esc * .55) + 'px system-ui'; ig.textAlign = 'center'; ig.fillText('📦 aquí', ox + qx * esc, oy + (qy - .7) * esc);
      const J2 = MC.Personaje.pose(e.stick.m > .1 ? 'camina' : 'quieto', yoI.fase); J2.fase = yoI.fase; MC.arte.f('personajeArriba')(ig, J2, jugador.aspecto, ox + yoI.x * esc, oy + yoI.y * esc, esc, yoI.a);
      if (Math.hypot(yoI.x - qx, yoI.y - qy) < 1.1) { entregado = true; interior = false; capa.hidden = true; }
      if (yoI.y < .25) { interior = false; capa.hidden = true; } };
    requestAnimationFrame(paso);
  }
  /* diseño de la casa: tocar un mueble lo selecciona, tocar otro punto lo mueve; comprar, girar, quitar y estilo */
  function abrirCasa() {
    const P = hogar.plano(), capa = $('#interior'), ic = $('#icv'), ig = ic.getContext('2d'), barra = $('#barraCasa'); let sel = -1, colocar = null, esc = 1, ox = 0, oy = 0; const d = Math.min(2, devicePixelRatio || 1);
    capa.hidden = false; barra.hidden = false; interior = true; ui.aviso('🏠 Bienvenido a casa · estilo ' + MC.Interiores.ESTILOS[P.estilo].n + ' · toca un mueble para moverlo', 3500);
    /* alguien vive aquí (Los Sims): elige qué usar según lo que necesita y lo que tú pongas */
    const hab = new MC.Habitante(P, { semilla: (hogar.d.semilla || 1) + 5, nombre: 'Tu familia' }), habA = MC.Personaje.azar(hogar.d.semilla || 7), ICO = { hambre: '🍽️', energia: '😴', vejiga: '🚻', higiene: '🚿', diversion: '🎮', social: '💬', comodidad: '🛋️' };
    const guardar = () => { if (!generado) escribirG({ hogar: hogar.guardar() }); };
    const ctlI = new MC.Controles(ic, { sinStick: true, alGesto: q => { if (q.tipo !== 'toque') return; const x = (q.x * d - ox) / esc, y = (q.y * d - oy) / esc, PL = hogar.plano();
      if (colocar) { const it = MC.Interiores.CATALOGO.find(c => c.id === colocar); if (hogar.poner(colocar, x - it.w / 2, y - it.h / 2)) { ui.aviso('✓ ' + it.n); colocar = null; guardar(); } else ui.aviso('Ahí no cabe: deja 0,5 m para pasar y no tapes las puertas'); return; }
      const i = hogar.muebleEn(x, y); if (i >= 0 && i !== sel) { sel = i; ui.aviso('Seleccionado · toca dónde moverlo'); } else if (sel >= 0) { const m = PL.muebles[sel]; if (hogar.mover(sel, x - m.w / 2, y - m.h / 2)) guardar(); else ui.aviso('Ahí no cabe'); sel = -1; } } });
    $('#bcEstilo').onclick = () => { const L = Object.keys(MC.Interiores.ESTILOS), i = (L.indexOf(hogar.plano().estilo) + 1) % L.length; hogar.estilo(L[i]); sel = -1; guardar(); ui.aviso('🎨 ' + MC.Interiores.ESTILOS[L[i]].n); };
    $('#bcComprar').onclick = () => ui.menu('Catálogo', MC.Interiores.CATALOGO.map(c => ({ id: c.id, texto: c.n + ' · ' + cop(c.precio) + ' · ' + c.w + '×' + c.h + ' m' })), id => { const r = hogar.comprar(id, libro, 'jugador', 'mueblería'); if (!r.ok) return ui.aviso(r.motivo); colocar = id; guardar(); ui.aviso('Toca dónde ponerlo'); });
    $('#bcGirar').onclick = () => { if (sel < 0) return ui.aviso('Primero toca un mueble'); if (!hogar.girar(sel)) ui.aviso('Girado no cabe'); else guardar(); };
    $('#bcQuitar').onclick = () => { if (sel < 0) return ui.aviso('Primero toca un mueble'); hogar.quitar(sel); sel = -1; guardar(); ui.aviso('Quitado (queda guardado para ponerlo después)'); };
    $('#bcSalir').onclick = () => { interior = false; capa.hidden = true; barra.hidden = true; };
    const paso = () => { if (!interior || barra.hidden) return; requestAnimationFrame(paso); const W2 = ic.width = Math.round(innerWidth * d), H2 = ic.height = Math.round(innerHeight * d), PL = hogar.plano(); esc = Math.min(W2 / (PL.ancho + 2), (H2 * .82) / (PL.fondo + 2)); ox = (W2 - PL.ancho * esc) / 2; oy = (H2 * .86 - PL.fondo * esc) / 2;
      ig.fillStyle = '#141822'; ig.fillRect(0, 0, W2, H2); MC.Interiores.dibujar(ig, PL, ox, oy, esc); const m = PL.muebles[sel]; if (m) { ig.strokeStyle = '#39ffb3'; ig.lineWidth = 3; ig.strokeRect(ox + m.x * esc, oy + m.y * esc, m.w * esc, m.h * esc); } ctlI.leer();
      hab.P = PL; hab.paso(1 / 60, 6); const J = MC.Personaje.pose(hab.accion ? 'quieto' : 'camina', hab.fase); J.fase = hab.fase; MC.Sombras.contacto(ig, ox + hab.x * esc, oy + hab.y * esc + esc * .1, esc * .35, esc * .18); MC.arte.f('personajeArriba')(ig, J, habA, ox + hab.x * esc, oy + hab.y * esc, esc, hab.a);
      ig.font = Math.round(esc * .6) + 'px system-ui'; ig.textAlign = 'center'; ig.fillText(hab.accion ? '💭' : ICO[hab.masUrgente()] || '', ox + hab.x * esc, oy + (hab.y - .6) * esc);
      if ((infoT += 1 / 60) > .5) { infoT = 0; $('#bcInfo').textContent = '✨ Ambiente ' + hogar.ambiente() + '/100 · ' + hab.nombre + ': ' + (hab.accion ? hab.accion.texto : 'busca qué hacer'); } };
    let infoT = 1;
    requestAnimationFrame(paso);
  }
  /* tamaño */
  let W = 0, H = 0; const ajustar = () => { const d = Math.min(2, devicePixelRatio || 1); W = cv.width = Math.round(innerWidth * d); H = cv.height = Math.round(innerHeight * d); vistas.dpr = d; }; addEventListener('resize', ajustar); ajustar();
  ponVista('cenital'); nuevaMision(); camara.x = cuerpo.x; camara.y = cuerpo.y;
  /* ciclo */
  let t0 = performance.now(), hud = 0, adapt = 0, histT = 0, dialogo = false, sonT = 0;
  const cuadro = ahora => {
    requestAnimationFrame(cuadro); const dt = Math.min(.1, (ahora - t0) / 1000); t0 = ahora; if (interior) return; E.t += dt;
    reloj.avanzar(dt); clima.actualizar(reloj, dt); E.cielo = MC.Cielo.en(reloj.fecha, reloj.hora, clima);
    const ent = ctl.leer(), V = cuerpo.veh, humano = V.clase === 'pie' || (V.clase === 'rueda' && !V.electrico), sinGas = tanque[V.id] != null && tanque[V.id] <= 0;
    cuerpo.escala = humano ? .55 + .45 * yo.rendimiento : sinGas ? .08 : 1;
    const x0 = cuerpo.x, y0 = cuerpo.y;
    if (vistas.actual.tipo === 'pano' && seguir) { seguir.paso(dt, { acel: Math.abs(ent.stick.x) > .2 ? ent.stick.x * (vistas.pano.lado < 0 ? 1 : -1) : ent.acel, salto: ent.salto, turbo: ent.turbo }); E.pano = { trazo: seguir.trazo, s: seguir.s, id: seguir.id }; }
    else { const gl = vistas.actual.tipo === 'gl', via = V.clase !== 'pie' ? M.viaCercana(cuerpo.x, cuerpo.y, 12) : null, entrada = MC.Manejo.aplicar(ent, cuerpo, { camara, esquema, vista: gl ? 'volante' : 'mundo', rumboVia: via ? via.ang : null }); entrada.correr = ent.stick.m > .92;
      if (ruta) { const sg = MC.Manejo.seguirRuta(cuerpo, ruta); if (!sg || sg.llego) { ruta = null; ui.aviso('📍 Llegaste'); } else if (ent.stick.m > .3) ruta = null; else Object.assign(entrada, sg); }
      cuerpo.actualizar(dt, entrada); }
    const ds = Math.hypot(cuerpo.x - x0, cuerpo.y - y0), st = V.clase !== 'pie' ? (desg[V.id] || (desg[V.id] = MC.Desgaste.nuevo(V))) : null; if (st) { MC.Desgaste.usar(st, ds, cuerpo.eventos.includes('choque') ? 1 : 0, clima); cuerpo.escala *= .82 + .18 * st.estado; } if (tanque[V.id] != null) tanque[V.id] = Math.max(0, tanque[V.id] - ds * garaje[V.id].consumo / 100 / 1000 * 1.4);
    if (mision && mision.paquete) { const carga = mision.paso >= 2 && mision.estado === 'activa'; cuerpo.escala *= carga ? MC.clamp(1 - mision.paquete.masa / (V.clase === 'pie' ? 25 : V.clase === 'rueda' ? 60 : 900), .5, 1) : 1; }
    yo.vivir(dt * 6, cuerpo.estado || 'quieto', Math.abs(cuerpo.v), clima);
    if (mision) mision.actualizar(dt, cuerpo);
    camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v, zCuerpo: cuerpo.z, zPaso: cuerpo.zPaso });
    ocu.vigilar(dt, { cuerpo, mundo: M, libro, entrada: ent, ms: vistas.ms });
    if (urbe && urbe.zonas.size && (urbeT += dt) > 6) { urbeT = 0; const r = urbe.avanzar(1); if (r.nuevos) ui.aviso('🏗️ Se construyeron ' + r.nuevos + ' edificios nuevos · ' + r.pob.toLocaleString('es-CO') + ' habitantes'); if (capaId) E.capaInfo = urbe.capa(capaId); }
    if (ambienteOn && (sonT += dt) > 1) { sonT = 0; MC.Paisaje.actualizar(ctxSonido()); } hist.paso(dt); if (mision && mision.restante < 25 && mision.estado === 'activa') hist.director.sumar('prisa', dt * .02);
    if (!dialogo && (histT += dt) > 25) { histT = 0; const L0 = MC.Lugares.cerca(M, cuerpo.x, cuerpo.y, 60)[0]; const s = hist.elegir({ hora: reloj.hora, clima, vehiculo: V, altura: cuerpo.altura, lugarTipo: L0 && L0.tipo, dinero: libro.saldo('jugador'), banderas });
      if (s) { dialogo = true; const ic = { diversion: '🎉', reflexion: '🌅', conciencia: '💡' }[s.pilar]; ui.dialogo(ic + ' ' + (L0 ? L0.nombre : M.calle(cuerpo.x, cuerpo.y) || ''), s.texto, s.opciones.map(o => o.texto)).then(i => { dialogo = false; const ef = s.opciones[i] ? s.opciones[i].elegir() : {}; if (ef.energia) yo.estado.energia = Math.min(1, yo.estado.energia + ef.energia); if (ef.hidratacion) yo.estado.hidratacion = Math.min(1, yo.estado.hidratacion + ef.hidratacion); if (ef.mision) { const en = hist.encargo(M, cuerpo.x, cuerpo.y, { clima }); if (en) { mision = new MC.Mision(Object.assign({}, en.def, { libro, cuenta: 'jugador' })); mision.pago = en.def.premio; ui.aviso('📜 ' + en.texto, 4500); } } }); } }
    /* el perro te sigue (dirección de Reynolds: llegar con separación) */
    const f = MC.IA.llegar([perro.x, perro.y], [cuerpo.x - Math.cos(cuerpo.a) * 3, cuerpo.y - Math.sin(cuerpo.a) * 3], Math.min(perro.vmax, Math.abs(cuerpo.v) + 3), 4); perro.x += f[0] * dt; perro.y += f[1] * dt; perro.v = Math.hypot(f[0], f[1]); if (perro.v > .2) perro.a = Math.atan2(f[1], f[0]);
    E.peatones = pobl.paso(dt, reloj, cuerpo.x, cuerpo.y, 420); E.trafico = trafico.paso(dt, cuerpo.x, cuerpo.y, reloj.seg, vistas.calidad);
    vistas.dibujar(g, W, H, E, dt);
    if ((adapt += dt) > 20 && tocando) { adapt = 0; const A = MC.Musica.adaptar({ velocidad: Math.abs(cuerpo.v), hora: reloj.hora, clima }); if (A.estilo !== tocando.pieza.titulo.split(' · ').pop()) tocando = MC.Musica.tocar({ estilo: A.estilo, tema: TEMAS[temaI], energia: A.energia, compases: 16 }); }
    if ((hud -= dt) <= 0) { hud = .25;
      ui.ficha('hora', '🕐 ' + reloj.texto()); ui.ficha('clima', clima.texto()); ui.ficha('plata', '💰 ' + cop(libro.saldo('jugador'))); ui.ficha('lugar', '📍 ' + (M.calle(cuerpo.x, cuerpo.y) || M.meta.nombre));
      ui.velocidad(cuerpo.v, V.icon || ''); ui.barra('energia', '⚡ Energía', yo.estado.energia); ui.barra('agua', '💧 Agua', yo.estado.hidratacion); if (tanque[V.id] != null) ui.barra('gas', '⛽ Gasolina', tanque[V.id] / garaje[V.id].tanque);
      const P = mision && mision.actual; ui.mision(mision ? '<b>📦 ' + mision.def.titulo + '</b><br>' + (P ? P.texto : '') + ' · ⏱ ' + Math.ceil(mision.restante) + ' s · ' + (P && P.x != null ? Math.round(Math.hypot(P.x - cuerpo.x, P.y - cuerpo.y)) + ' m' : '') : '');
      bAccion.hidden = !(mision && mision.paso === 3 && mision.destino); ui.foco(Math.abs(cuerpo.v) > 11);
      lugarCerca = MC.Lugares.cerca(M, cuerpo.x, cuerpo.y, 28)[0] || null; bLugar.hidden = !lugarCerca; if (lugarCerca) { bLugar.firstChild.textContent = lugarCerca.icono; bLugar.querySelector('small').textContent = lugarCerca.nombre.length > 12 ? MC.Lugares.TIPOS[lugarCerca.tipo].n.split(' ')[0] : lugarCerca.nombre; }
      if (st) ui.barra('estado', '🔧 Estado', st.estado); bComprar.hidden = !(cercaDe(tiendas, 30) || (tanque[V.id] != null && cercaDe(gasolineras, 40))); bComprar.firstChild.textContent = tanque[V.id] != null && cercaDe(gasolineras, 40) ? '⛽' : '💧';
      ui.pintarMinimapa(cuerpo.x, cuerpo.y, camara.yaw, (P && P.x != null ? [{ x: P.x, y: P.y, color: '#ffc23a' }] : []).concat(hogar ? [{ x: hogar.d.x, y: hogar.d.y, color: '#39ffb3' }] : []));
      window.MANDADOS = { mundo: M, cuerpo, yo, libro, mision, reloj, clima, vistas, camara, hechos, generado, hist, ocu, desg, ui, get hogar() { return hogar; }, get urbe() { return urbe; }, darUrbe, ponCapa, ponHogar: t => { const R = MC.Hogar.desdeDireccion(M, t); if (R.ok) hogar = R.hogar; return R; }, abrirCasa: () => abrirCasa(), ponVista, entregar: () => { entregado = true; interior = false; $('#interior').hidden = true; } }; }
  };
  requestAnimationFrame(cuadro);
}
