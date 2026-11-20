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
const PRECIOS = { lancha: 1500000, agua: 250000, gasolinaL: 430000, scooter: 4000000, moto: 12000000, carro: 30000000 };   // centavos (valores de juego; la gasolina, cerca del precio de referencia por litro)
let mundo = null, generado = false;
async function abrir(gen) {
  $('#estado').textContent = gen ? 'Generando un mundo nuevo…' : 'Abriendo Guatapé…'; await new Promise(r => setTimeout(r, 30));
  MC.ciudadBase = MC_CIUDAD_BASE;
  if (gen) { mundo = MC.Generador.mundo({ semilla: (Math.random() * 1e6) | 0, ancho: 448, alto: 448, tipo: Math.random() < .5 ? 'valle' : 'isla', pueblos: 3, lat: 6.2 }); generado = true; }
  else { const cfg = Object.assign({}, MC_CIUDAD, { zonas: Object.assign({}, MC.ZONAS_BASE, MC_CIUDAD.zonas || {}) }); mundo = await MC.Mundo.cargar(MC_MUNDO, cfg); }
  $('#estado').textContent = 'Armando las calles…'; await new Promise(r => setTimeout(r, 30)); mundo.red('rueda');
  $('#estado').textContent = 'Midiendo el agua…'; await new Promise(r => setTimeout(r, 30)); MC.Terreno.agua(mundo);   // lagos, ríos, mar y su profundidad (una vez)
  $('#portada').hidden = true; jugar();
}
$('#jugar').onclick = () => abrir(false); $('#generado').onclick = () => abrir(true);
$('#estado').textContent = 'Listo para jugar';

function jugar() {
  const cv = $('#cv'), g = cv.getContext('2d', { alpha: false }), M = mundo, ui = MC.UI.crear(document.body, { tema: 'motorcity' });
  const lat = generado ? 6.2 : 6.234, centro = generado ? M.generado.pueblos[0] : M.geoAMetros(6.2338, -75.1592), c0 = M.viaCercana(centro.x, centro.y, 400) || { x: centro.x, y: centro.y, ang: 0 };
  /* zoom legible en cualquier pantalla: ~7 px de pantalla por metro (una persona mide ~12 px; un carro, ~30) */
  const dpr0 = Math.min(2, devicePixelRatio || 1);
  const reloj = new MC.Reloj({ vel: 1.5 }), clima = new MC.ClimaGlobal({ lat, alt: M.cota(c0.x, c0.y) }), vistas = new MC.Vistas(M), camara = new MC.Camara({ zoom: Math.max(9, Math.min(18, Math.min(innerWidth, innerHeight) / 45)) * dpr0, mundo: M }); camara.limites.zoom = [2.6 * dpr0, 22 * dpr0];   /* 3.0: tope de lejanía y de cercanía (para ver todo está el mapa) */
  /* MODO LIBRE (por defecto): todo desbloqueado y gratis para probar el motor; se puede apagar en ⚙️ Ajustes */
  let libre = leerG().libre ?? true; const pagar = (de, a, c, concepto) => libre || libro.mover(de, a, c, concepto);
  const yo = new MC.Seres.Persona({ edad: 24, forma: .55, semilla: (Math.random() * 1e6) | 0 }), cuerpo = new MC.Cuerpo(M, { x: c0.x, y: c0.y, a: c0.ang, veh: 'bici' }); cuerpo.clima = clima;
  const jugador = { cuerpo, aspecto: yo.aspecto({ casco: 2, camisa: 0 }) }, libro = new MC.Libro(); libro.mover('mundo', 'jugador', 1000000, 'Plata para empezar', false);
  /* vehículos diseñados con ingeniería real (taller) */
  const dMoto = MC.Taller.disenar({ id: 'moto_mandados', n: 'Moto de mandados', tipo: 'moto', masa: 115, potenciaKW: 7.5, parNm: 10, cd: .6, area: .8, crr: .015, mu: 1, marchas: [2.8, 1.9, 1.4, 1.1, .9], final: 3, rueda: .3, tanqueL: 12, color: '#ff7043' });
  const dCarro = MC.Taller.disenar({ id: 'carro_mandados', n: 'Carro de mandados', masa: 1050, potenciaKW: 63, parNm: 120, cd: .33, area: 2, tanqueL: 40, color: '#00e5ff' });
  MC.Taller.registrar(dMoto, { vmax: Math.min(dMoto.vmax, 22) }); MC.Taller.registrar(dCarro, { vmax: Math.min(dCarro.vmax, 25) });
  const garaje = { bici: { n: '🚲 Bici', tiene: true }, scooter: { n: '🛵 Scooter eléctrico', precio: PRECIOS.scooter }, moto_mandados: { n: '🏍️ Moto (' + Math.round(dMoto.vmax * 3.6) + ' km/h, ' + dMoto.consumo.toFixed(1) + ' L/100 km)', precio: PRECIOS.moto, tanque: 12, consumo: dMoto.consumo }, carro_mandados: { n: '🚗 Carro (0–100 en ' + dCarro.ceroCien.toFixed(1) + ' s)', precio: PRECIOS.carro, tanque: 40, consumo: dCarro.consumo }, pie: { n: '🚶 A pie', tiene: true } };
  const tanque = { moto_mandados: 6, carro_mandados: 20 };
  const ORDEN = ['pie', 'rueda', 'moto', 'auto', 'pesado', 'aire', 'agua'], GRUPO = { pie: 'A pie', rueda: 'Bicis, patinetes y tablas', moto: 'Motos', auto: 'Carros', pesado: 'Pesados', aire: 'Aire', agua: 'Agua' };
  const listaVeh = () => libre ? MC.Vehiculos.de('mandados', v => ORDEN.includes(v.clase)).sort((a, b) => ORDEN.indexOf(a.clase) - ORDEN.indexOf(b.clase)).map(v => [v.id, { n: (v.icon || '•') + ' ' + v.n + ' · ' + GRUPO[v.clase].toLowerCase(), tiene: true, agua: v.clase === 'agua' }]) : Object.entries(garaje);
  const E = { mundo: M, camara, reloj, clima, transporte: null, jugador, t: 0, vehiculos: [], trafico: [], peatones: [], extras: [], cables: [] };
  /* 3.0: artilugios físicos (MC.Objetos): conos y vallas en las vías, balones en las plazas, canecas y cajas en los andenes */
  const objetos = new MC.Objetos(M); objetos.sembrar(c0.x, c0.y, 340, 46); E.objetos = objetos;
  MC.on('golpe', ev => { camara.sacudir(Math.min(.22, ev.fuerza * .025)); if (MC.Vida && MC.Vida.emitir) MC.Vida.emitir('polvo', ev.o.x, ev.o.y, 6); });
  const pobl = new MC.Poblacion(M, { n: 36, centro: c0, radio: 900, semilla: 4 }), trafico = new MC.Trafico(M, { n: 10, peatones: 0, red: 'rueda', radio: 400 });
  const perro = MC.Seres.Animal.crear('perro_criollo', 3); perro.x = c0.x - 3; perro.y = c0.y; perro.a = 0; perro.v = 0;
  E.extras.push({ get x() { return perro.x; }, get y() { return perro.y; }, dibujar(gg, pr, z, P) { const [sx, sy] = pr(perro.x, perro.y, 0); if (P.hk < .1) { gg.save(); gg.translate(sx, sy); gg.rotate(perro.a + P.yaw); gg.fillStyle = perro.colores[0]; gg.beginPath(); gg.ellipse(0, 0, z * .45, z * .17, 0, 0, MC.TAU); gg.fill(); gg.beginPath(); gg.arc(z * .45, 0, z * .13, 0, MC.TAU); gg.fill(); gg.restore(); } else MC.arte.f('animalLado')(gg, perro, sx, sy, z * P.hk * 1.4, Math.cos(perro.a + P.yaw) >= 0 ? 1 : -1, E.t, perro.v); } });
  /* lugares de los mandados: los que tienen nombre y quedan cerca de una vía */
  const sitios = M.lugares.filter(l => M.viaCercana(l.x, l.y, 45) && M.suelo(l.x, l.y) !== MC.TT.WATER).slice(0, 200);
  if (sitios.length < 4) for (const e of M.edificiosEn(c0.x - 800, c0.y - 800, c0.x + 800, c0.y + 800).slice(0, 60)) sitios.push({ nombre: 'Casa ' + (sitios.length + 1), x: e.x, y: e.y, dibujo: 'casa' });
  const tiendas = M.lugares.filter(l => /store|shop|super|market|tienda|restaurant|cafe|bakery|food/i.test(l.dibujo || '')), gasolineras = M.lugares.filter(l => /gas|fuel/i.test(l.dibujo || ''));
  let mision = null, entregado = false, interior = null, dinero0 = 0, hechos = 0;
  let piloto = null;   // 2.10: un jugador del público simulado (MC.Publico) maneja en vez de los controles
  /* 2.2: historias, ocurrencias, desgaste, manejo y mi casa */
  const hist = new MC.Historias({ semilla: 11 }), ocu = new MC.Ocurrencias({ juego: 'mandados' }), desg = {}, banderas = {}; let esquema = leerG().esquema || 'joystick', ruta = null, hogar = null;
  if (!generado && leerG().hogar) { try { hogar = new MC.Hogar(M, leerG().hogar); } catch (e) { hogar = null; } }
  E.extras.push({ get x() { return hogar ? hogar.d.x : -1e9; }, get y() { return hogar ? hogar.d.y : -1e9; }, dibujar(gg, pr, z) { if (!hogar) return; const [sx, sy] = pr(hogar.d.x, hogar.d.y, 9); gg.font = Math.round(Math.max(16, z * 5)) + 'px system-ui'; gg.textAlign = 'center'; gg.fillText('🏠', sx, sy); } });
  MC.on('choque', () => { hist.director.sumar('choque'); camara.sacudir(.35); }); MC.on('atascado', () => { bRescate.hidden = false; });
  const nuevaMision = () => {
    const az = Math.random, lejos = Math.min(1600, 450 + hechos * 200), cerca = sitios.map(q => [q, Math.hypot(q.x - cuerpo.x, q.y - cuerpo.y)]).sort((a, b) => a[1] - b[1]), cand = cerca.filter(c => c[1] > 40 && c[1] < Math.min(900, 250 + hechos * 120)), o = (cand.length ? cand[(az() * Math.min(8, cand.length)) | 0] : cerca[Math.min(1, cerca.length - 1)])[0]; let d = null;   /* 2.5.1: el primer mandado empieza cerca y la distancia crece con la experiencia */
    for (let k = 0; k < 60 && !d; k++) { const q = sitios[(az() * sitios.length) | 0], dist = Math.hypot(q.x - o.x, q.y - o.y); if (q !== o && dist > 150 && dist < lejos) d = q; } if (!d) d = sitios[(sitios.indexOf(o) + 1) % sitios.length];
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
  const ponVista = id => { const v = vistas.usar(id, E); bGirar.hidden = !(v.id === 'lateral' || v.id === 'maqueta'); if (v.tipo === 'pano') { try { seguir = new MC.SeguirRuta(M, cuerpo, { red: 'rueda' }); } catch (e) { seguir = null; } } else seguir = null; ui.aviso(v.icon + ' ' + v.n, 1600, 'vista'); };
  const tecla = k => { if (k === 'KeyQ') camara.girar90(-1); else if (k === 'KeyR') camara.girar90(1); else if (k === 'KeyH') casa(); else if (k === 'KeyV') { iv = (iv + 1) % VIST.length; ponVista(VIST[iv]); } else if (k === 'KeyP') vistas.pixel = !vistas.pixel; else if (k === 'KeyM') musica(); else if (k === 'KeyE') entrar(); else if (k === 'KeyB') menuVeh(); };
  ui.boton({ id: 'vista', icono: '🗺️', texto: 'Vista', al: () => menuVista() }); ui.boton({ id: 'veh', icono: '🚲', texto: 'Vehículo', al: () => menuVeh() }); ui.boton({ id: 'musica', icono: '🎵', texto: 'Sonido', al: () => menuSonido() });
  const bAccion = ui.boton({ id: 'accion', icono: '🚪', texto: 'Entrar', al: () => entrar() }); bAccion.hidden = true;
  const bComprar = ui.boton({ id: 'comprar', icono: '💧', texto: 'Agua', al: () => comprar() }); bComprar.hidden = true;
  const bGirar = ui.boton({ id: 'girar', icono: '↻', texto: 'Girar', al: () => camara.girar90(1) }); bGirar.hidden = true;
  ui.boton({ id: 'casa', icono: '🏠', texto: 'Mi casa', al: () => casa() }); ui.boton({ id: 'ciudad', icono: '🏙️', texto: 'Ciudad', al: () => menuCiudad() }); ui.boton({ id: 'ajustes', icono: '⚙️', texto: 'Ajustes', al: () => menuAjustes() });
  const bLugar = ui.boton({ id: 'lugar', icono: '🔧', texto: 'Lugar', al: () => menuLugar() }); bLugar.hidden = true;
  const bRescate = ui.boton({ id: 'rescate', icono: '🆘', texto: 'Salir de aquí', al: () => { ocu.rescatar(cuerpo, M); bRescate.hidden = true; } }); bRescate.hidden = true;
  /* el agua (2.4): entrar (dejando el vehículo en la orilla), bucear, subir a respirar, volver al vehículo, lancha y tierra */
  let bucear = false, subirT = 0;
  const bAgua = ui.boton({ id: 'agua', icono: '🏊', texto: 'Al agua', al: () => { const w = MC.Terreno.aguaHonda(M, cuerpo.x, cuerpo.y, 8, .3); cuerpo.bajarse('agua'); if (w) { cuerpo.a = Math.atan2(w.y - cuerpo.y, w.x - cuerpo.x); } } }); bAgua.hidden = true;
  const bMontar = ui.boton({ id: 'montar', icono: '🚲', texto: 'Subirse', al: () => { if (cuerpo.montar(3.5)) ui.aviso('🚲 De nuevo en ' + cuerpo.veh.n); } }); bMontar.hidden = true;
  const bTierra = ui.boton({ id: 'tierra', icono: '⚓', texto: 'A tierra', al: () => { if (cuerpo.desembarcar(16)) ui.aviso('⚓ La lancha queda amarrada aquí'); else ui.aviso('Acércate más a la orilla'); } }); bTierra.hidden = true;
  MC.on('bajarse', ev => { if (ev.estacionado.motivo === 'agua') ui.aviso('🏊 Dejaste ' + MC.Vehiculos.get(ev.estacionado.veh).n.toLowerCase() + ' en la orilla. ¡Al agua!', 3000); });
  MC.on('sinAire', () => { bucear = false; ui.aviso('😮‍💨 ¡Sin aire! Subes a respirar'); });
  const elegirControl = id => { esquema = id; escribirG({ esquema }); ruta = null; if (id === 'inclinacion') MC.Manejo.activarInclinacion(); if (id === 'tocar_ir' && vistas.actual.id !== 'cenital') { iv = 0; ponVista('cenital'); } ui.aviso(MC.Manejo.ESQUEMAS[id].ayuda, 3500); };
  /* lugares jugables: talleres, tiendas, restaurantes, bibliotecas, parques… */
  let lugarCerca = null;
  const menuLugar = () => { const L = lugarCerca; if (!L) return; const V = cuerpo.veh, st = desg[V.id] || (desg[V.id] = MC.Desgaste.nuevo(V)); ui.menu(L.icono + ' ' + L.nombre + (L.abierto(reloj.hora) ? '' : ' (cerrado)'), MC.Lugares.ACTIVIDADES[L.tipo].map(A => ({ id: A.id, texto: A.n + (A.precio ? ' · ' + cop(A.precio) : A.id === 'reparar' ? ' · ' + cop(MC.Desgaste.costoReparar(st, V)) + ' (estado ' + Math.round(st.estado * 100) + ' %)' : '') })), id => { const r = MC.Lugares.hacer(L, id, { libro: libre ? null : libro, cuenta: 'jugador', persona: yo, aspecto: jugador.aspecto, desgaste: st, vehiculo: V, hora: reloj.hora, vez: hechos }); ui.aviso(r.texto, r.texto.length > 60 ? 6000 : 2500); }); };
  /* MI CASA: dirección real → edificio real → interior propio que se diseña */
  const casa = () => { if (hogar) { if (Math.hypot(hogar.d.x - cuerpo.x, hogar.d.y - cuerpo.y) < 30) return abrirCasa(); ui.aviso('🏠 Tu casa queda a ' + Math.round(Math.hypot(hogar.d.x - cuerpo.x, hogar.d.y - cuerpo.y)) + ' m (míralo en el minimapa) · mantén el botón para cambiarla', 3500); return; } pedirDireccion(); };
  const pedirDireccion = () => { const F = $('#casaForm'); F.hidden = false; $('#casaTxt').value = (hogar && hogar.d.direccion) || ''; $('#casaTxt').focus();
    $('#casaNo').onclick = () => { F.hidden = true; };
    $('#casaOk').onclick = () => { const t = $('#casaTxt').value.trim(); if (!t) return; const R = MC.Hogar.desdeDireccion(M, t, { guardaDireccion: $('#casaRec').checked }); if (!R.ok) { ui.aviso('No encontré esa dirección en el mapa. Prueba con «Calle 31 # 28-15».', 3500); return; }
      hogar = R.hogar; F.hidden = true; if (!generado) escribirG({ hogar: hogar.guardar() }); const q = { exacta: 'exacta', calle: 'sobre esa calle', lugar: 'cerca de ese lugar' }[R.ubicacion.calidad] || ''; ui.aviso('🏠 Tu casa: ' + M.lugarTexto(hogar.d.x, hogar.d.y) + ' (' + q + ')', 4000); }; };
  ui.capa.querySelector('[aria-label="Mi casa"]').addEventListener('contextmenu', e => { e.preventDefault(); pedirDireccion(); });
  /* 3.0: el minimapa abre el mapa grande (ver todo sin alejar la cámara del juego); al llegar al tope de lejanía, se avisa */
  const miniCv = ui.minimapa(vistas); miniCv.style.pointerEvents = 'auto'; miniCv.style.cursor = 'pointer'; miniCv.setAttribute('aria-label', 'Abrir el mapa');
  const abrirMapa = () => { const P = mision && mision.actual; ui.abrirMapa(vistas, M, (P && P.x != null ? [{ x: P.x, y: P.y, color: '#ffc23a', texto: P.texto }] : []).concat(hogar ? [{ x: hogar.d.x, y: hogar.d.y, color: '#ff7a59', texto: 'Mi casa' }] : []), { x: cuerpo.x, y: cuerpo.y, a: cuerpo.a }); };
  miniCv.addEventListener('click', abrirMapa); MC.on('zoomTope', q => { if (q === 'lejos') ui.aviso('🗺️ Para ver todo el pueblo, toca el minimapa', 2600, 'mapa'); });
  /* controles a la vista: joystick que aparece bajo el dedo y botones grandes de acción (mantener oprimido) */
  /* 2.5.1: el arte de Gemini (G‑M0…G‑M15) como piel opcional; lo que no esté o no haya cargado se dibuja procedural */
  MC.estilo = leerG().estilo || 'realista';   // 2.6: realista (texturas, desgaste y árboles de pie) o clásico (plano y limpio)
  let arte = leerG().arte || 'gemini'; const hayGemini = !!(window.MC_ARTE && MC_ARTE.gemini);
  const pieles = ['motor', ...Object.keys(window.MC_ARTE || {})];
  if (!pieles.includes(arte)) arte = 'motor';
  for (const id of pieles.slice(1)) {
    const opciones = id === 'gemini' ? { partes: ['prop', 'fachada', 'mueble'], arboles: false } : { respetarAspecto: true, recorte: [0,0,1,1] };
    MC.Pieles.instalar(id, MC_ARTE[id], { ...opciones, pixel: () => vistas.pixel }).then(() => {
      if (arte === id) { MC.arte.usar(id); vistas.losas.limpiar(); vistas.losasLejos.limpiar(); }
    }).catch(e => ocu.anotar && ocu.anotar('arte', String(e)));
  }
  const cambiarArte = () => {
    arte = pieles[(pieles.indexOf(arte) + 1) % pieles.length];
    MC.arte.usar(arte); escribirG({ arte }); ui.aviso('🎨 Arte · ' + arte, 2500);
  };
  ui.joystick(ctl, { texto: matchMedia('(pointer: fine)').matches && !('ontouchstart' in window) ? 'Flechas o WASD · o arrastra' : 'Arrastra para moverte' });
  ui.accion({ id: 'salto', icono: '⤒', texto: 'Saltar', ctl }); ui.accion({ id: 'turbo', icono: '⚡', texto: 'Turbo (mantener)', mantener: true, ctl });
  const bBaja = ui.accion({ id: 'baja', icono: '🔽', texto: 'Bajar / bucear (mantener)', mantener: true, ctl }), bSube = ui.accion({ id: 'sube', icono: '🔼', texto: 'Subir (mantener)', mantener: true, ctl }); bBaja.hidden = bSube.hidden = true;
  /* 2.7: estilos gráficos (realista, clásico, cómic, manga, anime, novela gráfica, ukiyo-e y acuarela) */
  const DESC_ESTILO = { realista: 'asfalto gastado, tejas y árboles de pie', clasico: 'plano y limpio', comic: 'tinta, semitono y onomatopeyas', unbit: '1 bit: blanco y negro con trama de ruido azul, como Obra Dinn', manga: 'blanco y negro, tramado y líneas de velocidad', anime: 'cel shading y cielos de Shinkai', novela: 'noir: tinta, sombras negras y un rojo', ukiyoe: 'paleta de Hokusai sobre papel', vintage: 'foto vieja: sepia, papel y viñeta', crt: 'pantalla vieja con líneas de barrido', termica: 'el calor del mundo, como un dron térmico', acuarela: 'pigmento y papel, como la Comisión Corográfica' };
  const ponEstilo = id => { MC.estilo = id; escribirG({ estilo: id }); ui.aviso('🖌️ ' + MC.Estilo.p.n + ': ' + (DESC_ESTILO[id] || ''), 2500, 'estilo'); };
  const menuEstilo = () => ui.menu('🖌️ Estilo', MC.Estilo.lista().map(e => ({ id: e.id, texto: e.icono + ' ' + e.n + (MC.estilo === e.id ? ' ✓' : '') })), ponEstilo);
  /* 3.0: UNA cámara de juego (la cenital 3D, que se inclina al acercarse) y la de detrás del jugador; lo demás va en «Más vistas
     y filtros». Pellizcar hasta el tope de cerca pasa a detrás del jugador, y alejarse desde ahí vuelve a la cenital: una sola cámara continua. */
  const ACC = { mas: () => { camara.zoom = Math.min(camara.limites.zoom[1], camara.zoom * 1.5); }, menos: () => { camara.zoom = Math.max(camara.limites.zoom[0], camara.zoom / 1.5); }, mapa: () => abrirMapa() };
  const menuVista = () => ui.menu('Cámara', [{ id: 'cenital', texto: '🎮 Cámara de juego' + (vistas.actual.id === 'cenital' ? ' ✓' : '') }, { id: 'tercera', texto: '🧍 Detrás del jugador' + (vistas.actual.id === 'tercera' ? ' ✓' : '') }, { id: 'mas', texto: '🔍 Acercar' }, { id: 'menos', texto: '🔎 Alejar' }, { id: 'mapa', texto: '🗺️ Mapa' }, { id: 'otras', texto: '➕ Más vistas y filtros…' }], id => { if (ACC[id]) ACC[id](); else if (id === 'otras') menuOtras(); else { iv = Math.max(0, VIST.indexOf(id)); ponVista(id); } });
  const menuOtras = () => ui.menu('Más vistas y filtros', MC.VISTAS.filter(v => v.id !== 'cenital' && v.id !== 'tercera').map(v => ({ id: v.id, texto: v.icon + ' ' + v.n + (vistas.actual.id === v.id ? ' ✓' : '') })).concat([{ id: 'pixel', texto: '👾 Pixel: ' + (vistas.pixel ? 'sí' : 'no') }, { id: 'estilo', texto: '🖌️ Filtro de estilo: ' + MC.Estilo.p.icono + ' ' + MC.Estilo.p.n }], hayGemini ? [{ id: 'arte', texto: '🎨 Arte: ' + MC.arte.activa }] : []), id => { if (id === 'pixel') vistas.pixel = !vistas.pixel; else if (id === 'arte') cambiarArte(); else if (id === 'estilo') menuEstilo(); else { iv = Math.max(0, VIST.indexOf(id)); ponVista(id); } });
  MC.on('zoomTope', q => { if (q === 'cerca' && vistas.actual.id === 'cenital') { ponVista('tercera'); camara.d.dist = 6; } else if (q === 'lejos3p' && vistas.actual.id === 'tercera') { ponVista('cenital'); camara.zoom = camara.limites.zoom[1] * .75; } });
  const ayuda = () => ui.dialogo('🎮 Cómo se juega', '<div style="text-align:left;line-height:1.5">' +
    '• <b>Moverte:</b> pon el pulgar abajo a la izquierda y arrastra (o flechas / WASD).<br>• <b>Saltar ⤒ y turbo ⚡:</b> abajo a la derecha (o espacio y Shift).<br>' +
    '• <b>Mirar:</b> arrastra a la derecha para girar la cámara; pellizca o usa la rueda para acercar.<br>• <b>Mandados:</b> sigue la <b style="color:#ffc23a">flecha amarilla</b>; al llegar, «🚪 Entrar» y entrega en la mano.<br>' +
    '• <b>Vehículos:</b> 🚲 abre el garaje (en modo libre, todos los del motor: bicis, motos, carros, jetpack, avioneta, lancha…). En el aire y en el agua: 🔼 🔽.<br>' +
    '• <b>Agua:</b> en la orilla, «🏊 Al agua»; mantén 🔽 para bucear.<br>• <b>Más:</b> 🗺️ vistas (lateral, 3D, pixel…), 🏠 tu casa, 🏙️ alcalde, ⚙️ ajustes.</div>', ['¡A jugar!']);
  /* 2.8 · accesibilidad y medición (entrega maestra §10.3, §13 y §14): sacudida, partículas, calidad y telemetría */
  const OPC = Object.assign({ sacudida: 1, particulas: 1, calidad: 'auto', tele: false }, leerG().opciones || {}); let tele = !!OPC.tele, teleT = 0;
  const aplicarOpc = () => { MC.opciones.sacudida = OPC.sacudida; MC.opciones.particulas = OPC.particulas; const Q = { baja: .45, media: .75, alta: 1 }[OPC.calidad]; vistas.auto = !Q; MC.opciones.densidad = !Q; if (Q) vistas.calidad = Q; tele = !!OPC.tele; if (!tele) { const f = ui.ficha('tele', ''); f.hidden = true; } escribirG({ opciones: OPC }); };
  aplicarOpc();
  const NIVEL = v => v >= 1 ? 'normal' : v > 0 ? 'suave' : 'apagada', sig = (L, v) => L[(L.indexOf(v) + 1) % L.length];
  const menuAjustes = () => ui.menu('⚙️ Ajustes', [{ id: 'libre', texto: '🆓 Modo libre (todo gratis): ' + (libre ? 'sí' : 'no') }, { id: 'ayuda', texto: '❓ Cómo se juega' },
    { id: 'o:sacudida', texto: '📳 Sacudida de cámara: ' + NIVEL(OPC.sacudida) }, { id: 'o:particulas', texto: '✨ Partículas: ' + (OPC.particulas >= 1 ? 'muchas' : OPC.particulas > 0 ? 'pocas' : 'ninguna') }, { id: 'o:calidad', texto: '🎚️ Calidad: ' + { auto: 'automática', baja: 'baja', media: 'media', alta: 'alta' }[OPC.calidad] }, { id: 'o:tele', texto: '📈 Telemetría (fps y física): ' + (OPC.tele ? 'sí' : 'no') }, ...Object.entries(MC.Manejo.ESQUEMAS).filter(([k]) => ['joystick', 'un_pulgar', 'inclinacion', 'tocar_ir'].includes(k)).map(([k, Q]) => ({ id: 'c:' + k, texto: Q.icono + ' Control: ' + Q.n + (esquema === k ? ' ✓' : '') })), { id: 'rescate', texto: '🆘 Volver a la calle más cercana' }],
    id => { if (id.startsWith('o:')) { const k = id.slice(2); if (k === 'sacudida' || k === 'particulas') OPC[k] = sig([1, .4, 0], OPC[k]); else if (k === 'calidad') OPC.calidad = sig(['auto', 'baja', 'media', 'alta'], OPC.calidad); else OPC.tele = !OPC.tele; aplicarOpc(); ui.aviso('⚙️ Listo', 1200); } else if (id === 'libre') { libre = !libre; escribirG({ libre }); ui.aviso(libre ? '🆓 Modo libre: todo desbloqueado y gratis' : '💰 Modo con plata: hay que ganar para comprar'); } else if (id === 'ayuda') ayuda(); else if (id === 'rescate') ocu.rescatar(cuerpo, M); else if (id.startsWith('c:')) elegirControl(id.slice(2)); });
  const menuVeh = () => ui.menu(libre ? 'Garaje · todo libre (' + listaVeh().length + ')' : 'Garaje', listaVeh().map(([id, G]) => ({ id, texto: G.n + (G.tiene ? '' : ' · ' + cop(G.precio)) + (cuerpo.veh.id === id ? ' ✓' : '') })).concat(!libre && MC.Terreno.aguaHonda(M, cuerpo.x, cuerpo.y, 30) ? [{ id: 'lancha', texto: '🚤 Lancha (alquiler) · ' + cop(PRECIOS.lancha) }] : []), id => {
    if (libre && MC.Vehiculos.get(id).clase === 'agua') { if (cuerpo.nadando || cuerpo.veh.clase === 'agua' || MC.Terreno.aguaHonda(M, cuerpo.x, cuerpo.y, 40)) { if (cuerpo.embarcar(id, 40)) return ui.aviso('🚤 ¡Al agua! Para volver: «⚓ A tierra»'); } return ui.aviso('🌊 Acércate al agua (embalse, río o mar) para usarlo'); }
    if (cuerpo.nadando) return ui.aviso('Primero sal del agua');
    if (id === 'lancha') { if (!pagar('jugador', 'muelle', PRECIOS.lancha, 'Alquiler de lancha')) return ui.aviso('No te alcanza para la lancha'); if (cuerpo.embarcar('lancha', 30)) ui.aviso('🚤 ¡A navegar! Para volver, «⚓ A tierra»'); return; }
    if (cuerpo.veh.clase === 'agua') return ui.aviso('Primero baja a tierra (⚓)'); const G = libre ? null : garaje[id]; if (G && !G.tiene) { if (!pagar('jugador', 'tienda', G.precio, 'Compra: ' + G.n)) return ui.aviso('Te faltan ' + cop(G.precio - libro.saldo('jugador'))); G.tiene = true; ui.aviso('🎉 Compraste ' + G.n); } cuerpo.setVeh(id); if (seguir) seguir.v = Math.min(seguir.v, cuerpo.vmax()); });
  let tocando = null, temaI = 0; const TEMAS = [null, ...Object.keys(MC.Musica.CLASICOS)];
  const musica = () => { if (tocando) { MC.Musica.parar(); tocando = null; ui.aviso('🔇 Música apagada'); return; } temaI = (temaI + 1) % TEMAS.length; const A = MC.Musica.adaptar({ velocidad: Math.abs(cuerpo.v), hora: reloj.hora, clima }); tocando = MC.Musica.tocar({ estilo: A.estilo, tema: TEMAS[temaI], energia: A.energia, compases: 16, semilla: (Math.random() * 99) | 0 }); if (tocando) ui.aviso('🎵 ' + tocando.pieza.titulo + (TEMAS[temaI] ? ' (' + MC.Musica.CLASICOS[TEMAS[temaI]].autor + ', dominio público)' : '')); };
  /* sonido: música procedural y paisaje sonoro del lugar (tráfico, pájaros, grillos, lluvia, agua) */
  let ambienteOn = false; const menuSonido = () => ui.menu('Sonido', [{ id: 'm', texto: tocando ? '🎵 Otra canción' : '🎵 Música' }, { id: 'x', texto: '🔇 Apagar la música' }, { id: 'a', texto: ambienteOn ? '🌿 Sonido ambiente: apagar' : '🌿 Sonido ambiente: encender' }], id => { if (id === 'm') { if (tocando) { MC.Musica.parar(); tocando = null; } musica(); } else if (id === 'x') { if (tocando) { MC.Musica.parar(); tocando = null; } } else { ambienteOn = !ambienteOn; if (ambienteOn) MC.Paisaje.tocar(ctxSonido()); else MC.Paisaje.parar(); ui.aviso(ambienteOn ? '🌿 Escucha el lugar' : 'Ambiente apagado'); } });
  const ctxSonido = () => { const via = M.viaCercana(cuerpo.x, cuerpo.y, 40), ruido = urbe ? urbe.campoEn('ruido', cuerpo.x, cuerpo.y) : via ? ({ 1: .35, 2: .8, 3: 1, 4: .6 }[via.k] || .2) : .05; let agua = 1e4; for (let k = 0; k < 8 && agua > 100; k++) for (const r of [30, 70, 120]) if (M.suelo(cuerpo.x + Math.cos(k * .785) * r, cuerpo.y + Math.sin(k * .785) * r) === MC.TT.WATER) { agua = Math.min(agua, r); break; }
    const t = M.suelo(cuerpo.x, cuerpo.y); return { hora: reloj.hora, clima, ruido, agua, verde: urbe ? urbe.campoEn('verde', cuerpo.x, cuerpo.y) : t === MC.TT.GRASS || t === MC.TT.MOUNT ? .7 : .3, gente: Math.min(1, (E.peatones || []).filter(p => Math.hypot(p.x - cuerpo.x, p.y - cuerpo.y) < 40).length / 8), altura: cuerpo.altura, velocidad: Math.abs(cuerpo.v), adentro: !!interior }; };
  /* MODO ALCALDE: la simulación de ciudad (MC.Urbe) y las capas de datos */
  let urbe = null, capaId = null, urbeT = 0;
  const darUrbe = () => { if (!urbe) { urbe = new MC.Urbe(M, { libro, centro: { x: cuerpo.x, y: cuerpo.y }, alCambiar: (a, b, c, d) => vistas.losas.invalidar(a, b, c, d) }); libro.mover('mundo', 'alcaldia', libre ? 1e13 : 3000000000, 'Presupuesto inicial de la alcaldía', false); } return urbe; };
  const ponCapa = id => { capaId = id; E.capaInfo = id ? darUrbe().capa(id) : null; ui.leyenda(E.capaInfo && E.capaInfo.leyenda ? { titulo: E.capaInfo.titulo, items: E.capaInfo.leyenda } : null); if (vistas.actual.tipo !== '2d') { iv = 0; ponVista('cenital'); } };
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
  const comprar = () => { const V = cuerpo.veh.id; if (tanque[V] != null && (cercaDe(gasolineras, 40) || !gasolineras.length && cercaDe(tiendas, 30))) { const L = garaje[V].tanque - tanque[V], c = Math.round(L * PRECIOS.gasolinaL); if (pagar('jugador', 'gasolinera', c, 'Gasolina')) { tanque[V] = garaje[V].tanque; ui.aviso('⛽ Tanque lleno: ' + L.toFixed(1) + ' L · ' + cop(c)); } else ui.aviso('No te alcanza la plata'); return; } if (pagar('jugador', 'tienda', PRECIOS.agua, 'Agua')) { yo.estado.hidratacion = Math.min(1, yo.estado.hidratacion + .5); yo.estado.energia = Math.min(1, yo.estado.energia + .15); ui.aviso('💧 Agua: ' + cop(PRECIOS.agua)); } else ui.aviso('No te alcanza para el agua'); };
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
    $('#bcComprar').onclick = () => ui.menu('Catálogo', MC.Interiores.CATALOGO.map(c => ({ id: c.id, texto: c.n + ' · ' + cop(c.precio) + ' · ' + c.w + '×' + c.h + ' m' })), id => { const r = hogar.comprar(id, libre ? null : libro, 'jugador', 'mueblería'); if (!r.ok) return ui.aviso(r.motivo); colocar = id; guardar(); ui.aviso('Toca dónde ponerlo'); });
    $('#bcGirar').onclick = () => { if (sel < 0) return ui.aviso('Primero toca un mueble'); if (!hogar.girar(sel)) ui.aviso('Girado no cabe'); else guardar(); };
    $('#bcQuitar').onclick = () => { if (sel < 0) return ui.aviso('Primero toca un mueble'); hogar.quitar(sel); sel = -1; guardar(); ui.aviso('Quitado (queda guardado para ponerlo después)'); };
    $('#bcSalir').onclick = () => { interior = false; capa.hidden = true; barra.hidden = true; };
    const paso = () => { if (!interior || barra.hidden) return; requestAnimationFrame(paso); const W2 = ic.width = Math.round(innerWidth * d), H2 = ic.height = Math.round(innerHeight * d), PL = hogar.plano(); esc = Math.min(W2 / (PL.ancho + 2), (H2 * .82) / (PL.fondo + 2)); ox = (W2 - PL.ancho * esc) / 2; oy = (H2 * .86 - PL.fondo * esc) / 2;
      ig.fillStyle = '#141822'; ig.fillRect(0, 0, W2, H2); MC.Interiores.dibujar(ig, PL, ox, oy, esc); const m = PL.muebles[sel]; if (m) { ig.strokeStyle = '#39ffb3'; ig.lineWidth = 3; ig.strokeRect(ox + m.x * esc, oy + m.y * esc, m.w * esc, m.h * esc); } ctlI.leer();
      hab.P = PL; hab.paso(1 / 60, 6); const J = MC.Personaje.pose(hab.accion ? 'quieto' : 'camina', hab.fase); J.fase = hab.fase; MC.Sombras.contacto(ig, ox + hab.x * esc, oy + hab.y * esc + esc * .1, esc * .35, esc * .18); MC.arte.f('personajeArriba')(ig, J, habA, ox + hab.x * esc, oy + hab.y * esc, esc, hab.a);
      ig.font = Math.round(esc * .6) + 'px system-ui'; ig.textAlign = 'center'; ig.fillText(hab.accion ? '💭' : ICO[hab.masUrgente()] || '', ox + hab.x * esc, oy + Math.max(.55, hab.y - .6) * esc);   /* la burbuja nunca se sale por el muro de arriba */
      if ((infoT += 1 / 60) > .5) { infoT = 0; $('#bcInfo').textContent = '✨ Ambiente ' + hogar.ambiente() + '/100 · ' + hab.nombre + ': ' + (hab.accion ? hab.accion.texto : 'busca qué hacer'); } };
    let infoT = 1;
    requestAnimationFrame(paso);
  }
  /* tamaño */
  /* 2.11: densidad dinámica del lienzo (MC.DensidadLienzo): si los cuadros llegan lentos, el lienzo baja de densidad
     (el navegador lo agranda gratis) y la cámara corrige el zoom para que el mundo se vea del mismo tamaño */
  const densidad = new MC.DensidadLienzo({ max: Math.min(2, devicePixelRatio || 1), activa: MC.opciones.densidad !== false }); let dEf = densidad.max;
  let W = 0, H = 0; const ajustar = () => { densidad.ponerMax(Math.min(2, devicePixelRatio || 1)); const d = dEf = densidad.medir(0, vistas.actual.id); W = cv.width = Math.round(innerWidth * d); H = cv.height = Math.round(innerHeight * d); vistas.dpr = d; }; addEventListener('resize', ajustar); ajustar();
  const redensificar = d => { if (d === dEf) return; const k = d / dEf; camara.zoom *= k; camara.limites.zoom = [camara.limites.zoom[0] * k, camara.limites.zoom[1] * k]; dEf = d; W = cv.width = Math.round(innerWidth * d); H = cv.height = Math.round(innerHeight * d); vistas.dpr = d; };
  ponVista('cenital'); nuevaMision(); camara.x = cuerpo.x; camara.y = cuerpo.y;
  /* 2.6: el tutorial es opcional (en la portada y en ⚙️ Ajustes); al empezar solo queda la guía del joystick, que se va sola */
  /* ciclo */
  let t0 = performance.now(), hud = 0, adapt = 0, histT = 0, dialogo = false, sonT = 0, ultBloqueo = null, nadaba = false;
  /* el tráfico y la gente también ocupan espacio: no se atraviesan */
  cuerpo.obstaculos = () => { const L = []; for (const v of E.trafico || []) { if (v.clase === 'metro' || v.clase === 'cable' || v.clase === 'tram') continue; const r = (v.ancho || 1.8) / 2 + .15, l = (v.largo || 4.3) / 3, c = Math.cos(v.a || 0), s2 = Math.sin(v.a || 0); for (const k of [-1, 0, 1]) L.push({ x: v.x + c * l * k, y: v.y + s2 * l * k, r, motivo: 'un vehículo' }); } for (const p of E.peatones || []) L.push({ x: p.x, y: p.y, r: .28, motivo: 'una persona' }); return L; };
  const cuadro = ahora => {
    requestAnimationFrame(cuadro); const dt = Math.min(.1, (ahora - t0) / 1000); t0 = ahora; if (interior) return; E.t += dt; const impacto = MC._pausaImpacto > 0; if (impacto) MC._pausaImpacto -= dt;   /* 2.8: hitstop (el golpe pesa un instante) */
    reloj.avanzar(dt); clima.actualizar(reloj, dt); E.cielo = MC.Cielo.en(reloj.fecha, reloj.hora, clima);
    const ent = piloto ? piloto.leer(dt) : ctl.leer(), V = cuerpo.veh, humano = V.clase === 'pie' || (V.clase === 'rueda' && !V.electrico), sinGas = tanque[V.id] != null && tanque[V.id] <= 0;
    cuerpo.escala = humano ? .55 + .45 * yo.rendimiento : sinGas ? .08 : 1;
    const x0 = cuerpo.x, y0 = cuerpo.y;
    if (vistas.actual.tipo === 'pano' && seguir) { seguir.paso(dt, { acel: Math.abs(ent.stick.x) > .2 ? ent.stick.x * (vistas.pano.lado < 0 ? 1 : -1) : ent.acel, salto: ent.salto, turbo: ent.turbo }); E.pano = { trazo: seguir.trazo, s: seguir.s, id: seguir.id }; }
    else { const gl = vistas.actual.control === 'volante', via = V.clase !== 'pie' ? M.viaCercana(cuerpo.x, cuerpo.y, 12) : null, entrada = MC.Manejo.aplicar(ent, cuerpo, { camara, esquema, vista: gl ? 'volante' : 'mundo', rumboVia: via ? via.ang : null }); entrada.correr = ent.stick.m > .92; if (bucear) entrada.baja = true; if (subirT > 0) { subirT -= dt; entrada.sube = true; } if (!cuerpo.nadando) bucear = false;
      if (ruta) { const sg = MC.Manejo.seguirRuta(cuerpo, ruta); if (!sg || sg.llego) { ruta = null; ui.aviso('📍 Llegaste'); } else if (ent.stick.m > .3) ruta = null; else Object.assign(entrada, sg); }
      entrada.lluvia = clima.lluvia; cuerpo.actualizar(impacto ? 0 : dt, entrada); }
    const ds = Math.hypot(cuerpo.x - x0, cuerpo.y - y0), st = V.clase !== 'pie' ? (desg[V.id] || (desg[V.id] = MC.Desgaste.nuevo(V))) : null; if (st) { MC.Desgaste.usar(st, ds, cuerpo.eventos.includes('choque') ? 1 : 0, clima); cuerpo.escala *= .82 + .18 * st.estado; } if (tanque[V.id] != null && !libre) tanque[V.id] = Math.max(0, tanque[V.id] - ds * garaje[V.id].consumo / 100 / 1000 * 1.4);
    if (mision && mision.paquete) { const carga = mision.paso >= 2 && mision.estado === 'activa'; cuerpo.escala *= carga ? MC.clamp(1 - mision.paquete.masa / (V.clase === 'pie' ? 25 : V.clase === 'rueda' ? 60 : 900), .5, 1) : 1; }
    yo.vivir(dt * 6, cuerpo.nadando ? 'corre' : cuerpo.estado || 'quieto', Math.abs(cuerpo.v), clima);   // nadar cansa como correr
    /* el terreno dice por qué no se pasa (una vez), y avisa al empezar a nadar */
    if (cuerpo.bloqueo && cuerpo.bloqueo !== ultBloqueo) { ultBloqueo = cuerpo.bloqueo; const b = cuerpo.bloqueo; ui.aviso((/agua|quebrada|pando/.test(b) ? '🌊 ' : /empinado|barranco/.test(b) ? '⛰️ ' : /árbol|palma/.test(b) ? '🌳 ' : /roca/.test(b) ? '🪨 ' : /borde/.test(b) ? '🧭 ' : '🚧 ') + b[0].toUpperCase() + b.slice(1)); } else if (!cuerpo.bloqueo) ultBloqueo = null;
    if (cuerpo.nadando && !nadaba) ui.aviso('🏊 Nadando: cansa rápido'); nadaba = cuerpo.nadando;
    if (mision) mision.actualizar(dt, cuerpo);
    /* 3.0: contra reloj (queda menos de un cuarto del tiempo del mandado), la cámara entra en «persecución»: se aleja, se inclina y se mece */
    camara.persecucion = mision && mision.estado === 'activa' && mision.def.limite ? MC.clamp((.3 - (mision.def.limite - mision.t) / mision.def.limite) / .3, 0, 1) : 0;
    camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v, zCuerpo: cuerpo.z, zPaso: cuerpo.zPaso, mundo: M });
    ocu.vigilar(dt, { cuerpo, mundo: M, libro, entrada: ent, ms: vistas.ms });
    if (urbe && urbe.zonas.size && (urbeT += dt) > 6) { urbeT = 0; const r = urbe.avanzar(1); if (r.nuevos) ui.aviso('🏗️ Se construyeron ' + r.nuevos + ' edificios nuevos · ' + r.pob.toLocaleString('es-CO') + ' habitantes'); if (capaId) E.capaInfo = urbe.capa(capaId); }
    if (ambienteOn && (sonT += dt) > 1) { sonT = 0; MC.Paisaje.actualizar(ctxSonido()); } hist.paso(dt); if (mision && mision.restante < 25 && mision.estado === 'activa') hist.director.sumar('prisa', dt * .02);
    if (!dialogo && (histT += dt) > 25) { histT = 0; const L0 = MC.Lugares.cerca(M, cuerpo.x, cuerpo.y, 60)[0]; const s = hist.elegir({ hora: reloj.hora, clima, vehiculo: V, altura: cuerpo.altura, lugarTipo: L0 && L0.tipo, dinero: libro.saldo('jugador'), banderas });
      if (s) { dialogo = true; const ic = { diversion: '🎉', reflexion: '🌅', conciencia: '💡' }[s.pilar]; ui.dialogo(ic + ' ' + (L0 ? L0.nombre : M.calle(cuerpo.x, cuerpo.y) || ''), s.texto, s.opciones.map(o => o.texto)).then(i => { dialogo = false; const ef = s.opciones[i] ? s.opciones[i].elegir() : {}; if (ef.energia) yo.estado.energia = Math.min(1, yo.estado.energia + ef.energia); if (ef.hidratacion) yo.estado.hidratacion = Math.min(1, yo.estado.hidratacion + ef.hidratacion); if (ef.mision) { const en = hist.encargo(M, cuerpo.x, cuerpo.y, { clima }); if (en) { mision = new MC.Mision(Object.assign({}, en.def, { libro, cuenta: 'jugador' })); mision.pago = en.def.premio; ui.aviso('📜 ' + en.texto, 4500); } } }); } }
    /* el perro te sigue (dirección de Reynolds: llegar con separación) */
    const f = MC.IA.llegar([perro.x, perro.y], [cuerpo.x - Math.cos(cuerpo.a) * 3, cuerpo.y - Math.sin(cuerpo.a) * 3], Math.min(perro.vmax, Math.abs(cuerpo.v) + 3), 4); perro.x += f[0] * dt; perro.y += f[1] * dt; perro.v = Math.hypot(f[0], f[1]); if (perro.v > .2) perro.a = Math.atan2(f[1], f[0]);
    E.peatones = pobl.paso(dt, reloj, cuerpo.x, cuerpo.y, 420); E.trafico = trafico.paso(dt, cuerpo.x, cuerpo.y, reloj.seg, vistas.calidad);
    { const V = cuerpo.veh, cs = [{ x: cuerpo.x, y: cuerpo.y, z: cuerpo.z, r: V.clase === 'pie' ? .35 : Math.max(.4, (V.ancho || .8) / 2), masa: V.masa || (V.clase === 'auto' ? 1200 : V.clase === 'pesado' ? 6000 : 90), vx: Math.cos(cuerpo.a) * cuerpo.v, vy: Math.sin(cuerpo.a) * cuerpo.v }]; for (const t of E.trafico) if (Math.hypot(t.x - cuerpo.x, t.y - cuerpo.y) < 160) cs.push({ x: t.x, y: t.y, z: 0, r: 1, masa: 1200, vx: Math.cos(t.a) * (t.v || 0), vy: Math.sin(t.a) * (t.v || 0) }); objetos.actualizar(dt, cs); }
    if (!interior) { densidad.activa = MC.opciones.densidad !== false; redensificar(densidad.medir(dt, vistas.actual.id + (vistas.pixel ? '_px' : ''))); }
    vistas.dibujar(g, W, H, E, dt); if (vistas.efectiva().tipo === '2d' && !vistas.pixel) objetos.dibujar2D(g, (x, y, z) => vistas.aPantalla(E, x, y, z), camara.zoom, cuerpo, 140); ui.pintarJoystick(); MC.Telemetria.registro(vistas.ms, dt); if (tele && (teleT -= dt) <= 0) { teleT = .25; ui.ficha('tele', MC.Telemetria.linea(E)).hidden = false; }   /* 2.8: telemetría (percentiles) */
    /* la flecha al objetivo del mandado (en las vistas 2D): pin si se ve, flecha en el borde si no */
    const Pm = mision && mision.actual; const spm = Pm && Pm.x != null ? vistas.aPantalla(E, Pm.x, Pm.y, 0) : null; if (spm && vistas.actual.tipo !== 'pano') { const [sx, sy] = spm; const Z = ui.zonaLibre(), d2 = W / innerWidth; MC.UI.indicador(g, W, H, sx, sy, { texto: Math.round(Math.hypot(Pm.x - cuerpo.x, Pm.y - cuerpo.y)) + ' m', escala: dEf, t: E.t, rect: [Z.x0 * d2 + 20 * dEf, Z.y0 * d2 + 10 * dEf, Z.x1 * d2 - 20 * dEf, Z.y1 * d2] }); }
    if ((adapt += dt) > 20 && tocando) { adapt = 0; const A = MC.Musica.adaptar({ velocidad: Math.abs(cuerpo.v), hora: reloj.hora, clima }); if (A.estilo !== tocando.pieza.titulo.split(' · ').pop()) tocando = MC.Musica.tocar({ estilo: A.estilo, tema: TEMAS[temaI], energia: A.energia, compases: 16 }); }
    if ((hud -= dt) <= 0) { hud = .25;
      ui.ficha('hora', '🕐 ' + reloj.texto()); ui.ficha('clima', clima.texto()); ui.ficha('plata', libre ? '🆓 ' + cop(libro.saldo('jugador')) : '💰 ' + cop(libro.saldo('jugador'))); ui.ficha('lugar', '📍 ' + (M.calle(cuerpo.x, cuerpo.y) || M.meta.nombre));
      ui.velocidad(cuerpo.v, V.icon || ''); ui.barra('energia', '⚡ Energía', yo.estado.energia); ui.barra('agua', '💧 Agua', yo.estado.hidratacion); if (tanque[V.id] != null) ui.barra('gas', '⛽ Gasolina', tanque[V.id] / garaje[V.id].tanque);
      const P = mision && mision.actual; ui.mision(mision ? '<b>📦 ' + mision.def.titulo + '</b><br>' + (P && P.x != null ? '<b>' + Math.round(Math.hypot(P.x - cuerpo.x, P.y - cuerpo.y)) + ' m</b> · ' : '') + '⏱ ' + Math.ceil(mision.restante) + ' s · ' + (P ? P.texto : '') : '');   // lo urgente (distancia y tiempo) va primero
      bAccion.hidden = !(mision && mision.paso === 3 && mision.destino); ui.foco(Math.abs(cuerpo.v) > 11);
      lugarCerca = MC.Lugares.cerca(M, cuerpo.x, cuerpo.y, 28)[0] || null; bLugar.hidden = !lugarCerca; if (lugarCerca) { bLugar.firstChild.textContent = lugarCerca.icono; bLugar.querySelector('small').textContent = lugarCerca.nombre.length > 12 ? MC.Lugares.TIPOS[lugarCerca.tipo].n.split(' ')[0] : lugarCerca.nombre; }
      if (st) ui.barra('estado', '🔧 Estado', st.estado);
      const nada = cuerpo.nadando, aguaCerca = V.clase !== 'pie' && V.clase !== 'agua' && V.clase !== 'aire' && !!MC.Terreno.aguaHonda(M, cuerpo.x, cuerpo.y, 6, .3);
      bAgua.hidden = !aguaCerca; bBaja.hidden = bSube.hidden = !(nada || V.clase === 'aire'); bTierra.hidden = !(V.clase === 'agua' && MC.Terreno.tierraFirme(M, cuerpo.x, cuerpo.y, 16));
      bMontar.hidden = !cuerpo.puedeMontar(3.5); if (!bMontar.hidden) bMontar.firstChild.textContent = MC.Vehiculos.get(cuerpo.estacionado.veh).icon || '🚲';
      ui.barra('aire', '🫧 Aire', cuerpo.aire); ui.barraVisible('aire', cuerpo.buceando || cuerpo.aire < .999); bComprar.hidden = !(cercaDe(tiendas, 30) || (tanque[V.id] != null && cercaDe(gasolineras, 40))); bComprar.firstChild.textContent = tanque[V.id] != null && cercaDe(gasolineras, 40) ? '⛽' : '💧';
      ui.pintarMinimapa(cuerpo.x, cuerpo.y, camara.yaw, (P && P.x != null ? [{ x: P.x, y: P.y, color: '#ffc23a' }] : []).concat(hogar ? [{ x: hogar.d.x, y: hogar.d.y, color: '#39ffb3' }] : []));
      window.MANDADOS = { mundo: M, cuerpo, yo, libro, get mision() { return mision; }, get piloto() { return piloto; }, set piloto(p) { piloto = p; }, get vehiculos() { return listaVeh().length; }, reloj, clima, vistas, camara, hechos, generado, hist, ocu, desg, ui, get hogar() { return hogar; }, get urbe() { return urbe; }, get botones() { return { bAgua, bMontar, bTierra, bBaja, bSube }; }, get libre() { return libre; }, cambiarArte, ponEstilo, opciones: OPC, aplicarOpc, darUrbe, ponCapa, ponHogar: t => { const R = MC.Hogar.desdeDireccion(M, t); if (R.ok) hogar = R.hogar; return R; }, abrirCasa: () => abrirCasa(), ponVista, entregar: () => { entregado = true; interior = false; $('#interior').hidden = true; } }; }
  };
  requestAnimationFrame(cuadro);
}
