/* =====================================================================
   TURNO CERO · arranque: portada, controles, botones, menú y teclado
   ===================================================================== */
if (typeof MC_MODELOS !== 'undefined') MC.Modelos.paquete(MC_MODELOS);   /* los 42 GLB de Codex, dentro del HTML */
MC.Modelos.lejos = 150;
G.aspecto = Object.assign(MC.Personaje.azar(34), { cPelo: '#141414', cCamisa: '#2b343d', cPantalon: '#1d2833', cPiel: '#b98a66', cCasco: null });

function iniciarInterfaz() {
  if (G.ui) return; G.cv = $('#cv'); G.g = G.cv.getContext('2d', { alpha: false });
  const ui = G.ui = MC.UI.crear(document.body, { tema: 'noche' });
  G.ctl = new MC.Controles(G.cv, { mitades: true, alGesto: q => { if (q.tipo !== 'toque' && G.camara) G.camara.gesto(q); }, alTecla: tecla });
  ui.joystick(G.ctl, { texto: 'Arrastra para manejar' });
  { const izq = ui.capa.querySelector('.izq'), vj = $('#viaje'); if (izq && vj) izq.insertBefore(vj, izq.querySelector('.aviso')); }   /* el letrero de la vía va en la columna de la izquierda, nunca sobre la calle */
  /* 4.6.1 · ⏫ acelerador fijo: un toque y el carro acelera solo (el joystick solo da la dirección); otro toque y frena hasta parar */
  G.botAcel = ui.alternar({ id: 'acelerador', icono: '⏫', texto: 'Acelerar: prendido acelera solo, el joystick solo da la dirección; apagado, frena hasta parar (tecla V)', al: v => ponerAcelerador(v) });
  ui.accion({ id: 'freno', icono: '🛑', texto: 'Freno', mantener: true, ctl: G.ctl });
  ui.accion({ id: 'turbo', icono: '⚡', texto: 'Turbo', mantener: true, ctl: G.ctl });
  const b = (k, icono, texto, al) => (BOT[k] = ui.boton({ id: k, icono, texto, al }));
  b('menu', '⏸', 'Menú', menu); b('mapa', '🗺️', 'Mapa', abrirMapaTC); b('globo', '🌍', 'Planeta', () => Globo.abrir()); b('camara', '🎥', 'Cámara', siguienteCamara);
  b('taller', '🔧', 'Taller', menuTaller); b('metro', '🚇', 'Metro', menuTransporte); b('encicla', '🚲', 'EnCicla', () => { G.cuerpo.setVeh('bici'); G.ui.aviso('🚲 EnCicla: por la ciclorruta no te sigue nadie en carro', 2200); });
  b('lancha', '🚤', 'Lancha', () => { if (G.cuerpo.embarcar('lancha')) { G.ui.aviso('🚤 Al embalse: la policía se queda en la orilla', 2200); if (G.busq.nivel && !G.busq.visto) G.busq.esconder('embalse'); } });
  b('tierra', '🏝️', 'Tierra', () => { if (G.cuerpo.desembarcar()) G.ui.aviso('🏝️ En tierra: consigue un carro', 1800); });
  b('bajar', '🚪', 'Bajarse', () => G.cuerpo.bajarse('jugador')); b('robar', '🚗', 'Robar', robarCarro); b('montar', '🔑', 'Subirse', () => { if (G.cuerpo.montar(4)) G.carro = Math.max(G.carro, .05); });
  b('foto', '📷', 'Foto', () => Historia.foto()); b('rapido', '⏩', 'Viaje ×3', () => { G.rapido = !G.rapido; G.ui.aviso(G.rapido ? '⏩ El viaje va tres veces más rápido' : '▶ Velocidad normal', 1400, 'rapido'); });
  b('contratos', '📞', 'Contratos', () => Contratos.menu()); for (const f of EXTRAS.ui) f(b); b('reducir', '✊', 'Reducir', () => Historia.reducir());
  /* alejar la cámara más allá del tope abre el planeta (de la calle al globo, sin menú) */
  let topes = [], tGlobo = 0; MC.on('zoomTope', w => { if (w !== 'lejos' || G.globo || G.pausa) return; const t = performance.now(); topes = topes.filter(x => t - x < 1300); topes.push(t); if (topes.length > 7 && t - tGlobo > 4000) { tGlobo = t; topes = []; Globo.abrir(true); } });
  for (const k of ['taller', 'metro', 'encicla', 'lancha', 'tierra', 'bajar', 'robar', 'montar', 'foto', 'rapido', 'contratos', 'reducir']) BOT[k].hidden = true;
  const AR = $('#artefactos'); AR.hidden = false; AR.querySelectorAll('button').forEach(x => x.onclick = e => { e.stopPropagation(); const k = x.dataset.k; if (G.pausa) return; (Artefactos[k] || (() => 0))(); });
  addEventListener('resize', ajustar);
  $('#gCerrar').onclick = () => Globo.cerrar();
  $('#fLibre').onclick = () => { $('#final').hidden = true; G.pausa = false; Libre.empezar(G.id || 'nueva_york'); };
  $('#fPortada').onclick = () => location.reload();
  t0 = performance.now(); requestAnimationFrame(cuadro);
}
const CAMARAS = ['cenital', 'ciudad3d', 'tercera', 'primera', 'maqueta', 'arcade', 'vuelo'];   /* 4.1: 🏁 arcade (OutRun) y ⛰️ vuelo (Voxel Space de Comanche) */
/* 4.7 · cada cámara donde tiene sentido (el autor: «las vistas no tienen coherencia con cómo se adaptaron»): las cinco del mundo 3D
   siempre; 🏁 Arcade (la carretera pseudo-3D de OutRun) solo en las carreteras entre ciudades y en las carreras; ⛰️ Vuelo (Voxel
   Space) solo volando (jetpack). Si cambia el contexto, la cámara vuelve sola a la cenital 3D. */
function camarasAqui() { const C = G.cuerpo, L = ['cenital', 'ciudad3d', 'tercera', 'primera', 'dron', 'maqueta']; if ((G.M && !G.M.esCiudad) || (G.Modos && G.Modos.m && G.Modos.m.id === 'carrera')) L.push('arcade'); if (C && C.veh.clase === 'aire') L.push('vuelo'); return L; }
function siguienteCamara() { const L = camarasAqui(), i = L.indexOf(G.vistaId); G.vistaId = L[(i + 1) % L.length]; const v = G.vistas.usar(G.vistaId, G.E); G.ui.aviso(v.icon + ' ' + v.n, 1400, 'vista'); escribirG({ vista: G.vistaId }); }
function camaraCoherente() { if (!G.vistas || G._sigCam) return; const L = camarasAqui(); if ((G.vistaId === 'arcade' || G.vistaId === 'vuelo') && !L.includes(G.vistaId)) { const ant = G.vistaId; G.vistaId = 'cenital'; G.vistas.usar('cenital', G.E); G.ui.aviso('🗺️ Vuelve la cenital 3D (' + (ant === 'vuelo' ? 'el vuelo es para el jetpack' : 'la cámara Arcade es para la carretera y las carreras') + ')', 1800, 'vista'); } }
function menu() {
  const S = leerG(), it = [{ id: 'seguir', texto: '▶ Seguir' }, { id: 'modos', texto: '🎮 Modos de juego (carreras, extremo, mandados, EnCicla, metro)' }, { id: 'rescate', texto: '🆘 Rescate (calle, grúa, taxi, estación, ambulancia, volver)' }, { id: 'cam', texto: '🎥 Cámara: ' + G.vistas.actual.n }, { id: 'cine', texto: '🎬 Modo cine: ' + (G.cine ? 'sí (guían las direccionales)' : 'no') }, { id: 'retro', texto: '🕹️ Retro 1993: ' + (G.retro ? 'sí (pixel con la luz de Doom)' : 'no') }, { id: 'asis', texto: '🛞 Asistencia de manejo: ' + (G.asistencia ? 'sí (esquiva paredes)' : 'no') }, { id: 'sigcam', texto: '🔦 Sigilo desde arriba: ' + (S.sigiloCenital !== false ? 'sí' : 'no') }, { id: 'sonido', texto: Snd.on ? '🔊 Sonido: sí' : '🔇 Sonido: no' }, { id: 'suave', texto: S.suave ? '🗣️ Lenguaje: suave' : '🗣️ Lenguaje: fuerte' }, { id: 'flex', texto: '⚙️ Flexibilidad (control, giro, velocidad, cámara, mano, tamaño, calidad)' }, { id: 'acces', texto: '♿ Accesibilidad' }, { id: 'quien', texto: '👥 Personajes' }, { id: 'artef', texto: '🧰 Artefactos' }];
  if (G.hist) it.push({ id: 'reintentar', texto: '↩ Volver al último punto' }); it.push({ id: 'historia', texto: '📖 Historia (opcional)' }, { id: 'libre', texto: '🌎 Mundo abierto aquí' }, { id: 'portada', texto: '🏠 Portada' });
  G.ui.menu('Turno Cero · ' + planeta.def(G.id).nombre, it, async k => {
    if (k === 'asis') { G.asistencia = !G.asistencia; escribirG({ asistencia: G.asistencia }); G.ui.aviso(G.asistencia ? '🛞 Asistencia: el carro esquiva las paredes que vienen' : '🛞 Sin asistencia: todo depende de ti', 2200, 'asis'); return menu(); }
    if (k === 'modos') return Modos.menu();
    if (k === 'rescate') return Rescate.menu();
    if (k === 'sigcam') { G.sigiloCenital(leerG().sigiloCenital === false); return menu(); }
    if (k === 'cam') siguienteCamara(); else if (k === 'retro') { G.retro = !G.retro; escribirG({ retro: G.retro }); G.vistas.pixel = G.retro; G.vistas.colormap = G.retro; G.ui.aviso(G.retro ? '🕹️ Retro 1993: pocos píxeles, 256 colores y la luz que se apaga con la distancia' : '🕹️ Retro apagado', 2600, 'retro'); } else if (k === 'cine') { G.cine = !G.cine; escribirG({ cine: G.cine }); document.body.classList.toggle('cine', G.cine); G.ui.aviso(G.cine ? '🎬 Modo cine: sin flecha ni minimapa; las direccionales del carro marcan la próxima esquina' : '🎬 Modo cine apagado', 3000, 'cine'); } else if (k === 'sonido') { if (Snd.on) Snd.apagar(); else Snd.prender(); escribirG({ sonido: Snd.on }); } else if (k === 'suave') escribirG({ suave: !S.suave });
    else if (k === 'acces') Extras.opcionesMenu();
    else if (k === 'flex') MC.Flex.menu(G.ui, G.flex || leerG().flex, f => { G.flex = MC.Flex.aplicar(f, { vistas: G.vistas }); escribirG({ flex: G.flex }); });   /* 4.8 · ⚙️ Flexibilidad */
    else if (k === 'quien') { G.pausa = true; await G.ui.dialogo('👥 Personajes', Object.values(TC.QUIEN).filter(q => q.d).map(q => '<b style="color:' + q.c + '">' + q.n + '</b>: ' + q.d).join('<br>'), ['Listo']); G.pausa = false; }
    else if (k === 'artef') { G.pausa = true; await G.ui.dialogo('🧰 Artefactos de 2026 (ficción)', Object.values(TC.ARTEFACTOS).map(a => a.icon + ' <b>' + a.cod + ' · ' + a.n + '</b>: ' + a.d).join('<br>'), ['Listo']); G.pausa = false; }
    else if (k === 'reintentar') Historia.reintentar(); else if (k === 'libre') Libre.empezar(G.id, { x: G.cuerpo.x, y: G.cuerpo.y, a: G.cuerpo.a }); else if (k === 'portada') location.href = location.pathname + '?portada'; else if (k === 'historia') menuHistoria();
  });
}
/* 📖 la historia, cuando uno quiera: seguirla, empezarla o repetir un capítulo; o quedarse en el mundo abierto */
function menuHistoria() {
  const S = leerG(), it = [];
  if (S.hist && TC.HISTORIA[S.hist.cap]) { const H = TC.HISTORIA[S.hist.cap]; it.push({ id: 'seguir', texto: '▶ Seguir: Acto ' + H.acto + ' · ' + H.titulo }); }
  it.push({ id: 'nueva', texto: S.hist ? '↺ Empezar la historia desde el principio' : '▶ Empezar la historia (Acto I · Manhattan)' });
  for (let i = 1; i < TC.HISTORIA.length; i++)   /* 4.7: todos los capítulos liberados desde el principio (el autor: «no quiero esperar a avanzar en la historia») */ it.push({ id: 'cap' + i, texto: 'Acto ' + TC.HISTORIA[i].acto + ' · ' + TC.HISTORIA[i].titulo });
  it.push({ id: 'no', texto: '🌎 Seguir en el mundo abierto' });
  G.ui.menu('📖 Historia (opcional)', it, async k => {
    if (k === 'seguir') { const K = S.hist; Object.assign(G, { dinero: K.dinero, rep: K.rep || G.rep, flags: K.flags || {}, veh: K.veh || G.veh, tengo: K.tengo || G.tengo, evidencia: K.evidencia || 0, municion: K.municion || 0 }); G.check = K; await Historia.empezar(K.cap, K.i, { donde: { mundo: K.mundo, x: K.x, y: K.y, a: K.a }, sinIntro: true, sub: K.sub }); }
    else if (k === 'nueva') { escribirG({ hist: null }); await Historia.empezar(0); }
    else if (/^cap\d+$/.test(k)) { const i = +k.slice(3); G.municion = i >= 3 ? 24 : 0; await Historia.empezar(i); }
  });
}
/* 4.6 · el mapa grande del motor (js/70-mapa.js, como el de EnCicla): pausa el juego, acerca y aleja sin congelar, 🧭 brújula, tocar = destino */
function abrirMapaTC() { const ui = G.ui; if (!ui || !G.M) return; if (ui._mapa) return ui._mapa.cerrar(); let antes = false;
  ui.abrirMapa(G.vistas, G.M, () => mapaPts, () => (G.cuerpo ? { x: G.cuerpo.x, y: G.cuerpo.y, a: G.cuerpo.a } : null), { alIr: p => Rescate.ir(p), planeta: () => Globo.abrir(true), destino: G.destinoLibre, pausa: v => { if (v) { antes = G.pausa; G.pausa = true; } else G.pausa = antes; }, alDestino: p => { G.destinoLibre = p; } }); }
function ponerAcelerador(v, callado) { G.acelFijo = !!v; if (G.botAcel && G.botAcel.activo !== G.acelFijo) G.botAcel.poner(G.acelFijo, true); if (callado) return; if (G.ui) G.ui.aviso(G.acelFijo ? '⏫ Acelerando solo: el joystick solo da la dirección · 🛑 frena · toca ⏫ otra vez para parar' : '⏹ Acelerador apagado: frenando hasta parar', 2200, 'acel'); escribirG({ acelFijoVisto: true }); }
function tecla(k) {
  if (!G.M || G.pausa) return; const A = Artefactos;
  if (k === 'Digit1') A.dron(); else if (k === 'Digit2') A.cebo(); else if (k === 'Digit3') A.pulso(); else if (k === 'Digit4') A.lente(); else if (k === 'KeyF') A.disparar();
  else if (k === 'KeyM') BOT.mapa.onclick({ stopPropagation() {} }); else if (k === 'KeyG') Globo.abrir(); else if (k === 'KeyC') siguienteCamara(); else if (k === 'Escape') menu();
  else if (k === 'KeyR' && BOT.run && !BOT.run.hidden) Extras.entrarRun();
  else if (k === 'KeyH' && G.modo === 'libre') menuHistoria();
  else if (k === 'KeyE') { for (const q of ['reducir', 'foto', 'taller', 'metro', 'lancha', 'tierra', 'robar', 'montar', 'encicla']) if (BOT[q] && !BOT[q].hidden) { BOT[q].onclick({ stopPropagation() {} }); break; } }
  else if (k === 'KeyV') { if (G.cuerpo.veh.clase !== 'pie' || G.controlExterno) ponerAcelerador(!G.acelFijo); }
  else if (k === 'KeyX') { if (G.cuerpo.veh.clase !== 'pie') G.cuerpo.bajarse('jugador'); }
}

/* ---------- la portada ---------- */
(function portada() {
  const S = leerG(), est = $('#estado');
  est.textContent = 'Listo · ' + Object.keys(MC_CIUDADES).length + ' ciudades reales y ' + planeta.anillo.filter(d => d.tipo === 'tramo').length + ' carreteras de la nada · ' + MC.Modelos.L.size + ' modelos 3D';
  const arrancar = async fn => { Snd.ini(); $('#portada').hidden = true; iniciarInterfaz(); G.vistaId = leerG().vista || 'cenital'; try { await fn(); } catch (e) { MC.falla('inicio', e); $('#portada').hidden = false; est.textContent = 'No se pudo abrir el mundo: ' + e.message; } if (G.vistas && G.ui && !G.ui._mini) { G.ui.minimapa(G.vistas); } };
  if (S.hist) { $('#bSeguir').hidden = false; const H = TC.HISTORIA[S.hist.cap]; $('#sSeguir').textContent = 'Acto ' + H.acto + ' · ' + H.titulo + ' · ' + (planeta.def(S.hist.mundo) || {}).nombre;
    $('#bSeguir').onclick = () => arrancar(async () => { const K = S.hist; Object.assign(G, { dinero: K.dinero, rep: K.rep || G.rep, flags: K.flags || {}, veh: K.veh || G.veh, tengo: K.tengo || G.tengo, evidencia: K.evidencia || 0, municion: K.municion || 0 }); G.check = K; await Historia.empezar(K.cap, K.i, { donde: { mundo: K.mundo, x: K.x, y: K.y, a: K.a }, sinIntro: true, sub: K.sub }); }); }
  $('#bHistoria').onclick = () => arrancar(async () => { escribirG({ hist: null }); await Historia.empezar(0); });
  /* 4.1 · pedido del autor: mundo abierto desde el principio; la historia y el tutorial son opcionales */
  const LA = S.libre && planeta.def(S.libre.id) ? S.libre : null;
  if (LA) $('#sAbierto').textContent = 'Donde quedaste: ' + planeta.def(LA.id).nombre + ' · la historia es opcional';
  const abierto = () => arrancar(() => LA ? (Object.assign(G, { dinero: LA.dinero ?? G.dinero, veh: LA.veh || G.veh, tengo: LA.tengo || G.tengo }), Libre.empezar(LA.id, { x: LA.x, y: LA.y, a: LA.a }, { rapido: true })) : Libre.empezar('medellin', null, { rapido: true }));
  $('#bAbierto').onclick = abierto; G.abrirMundo = abierto;
  /* 4.6 · 🎮 los modos (Carreras, Extremo, Mandados, EnCicla y el Metro) en el mismo juego: abre el mundo y luego el menú de modos */
  $('#bModos').onclick = async () => { await abierto(); const esperar = () => (G.M && !G.transicion && G.cuerpo ? Modos.menu() : setTimeout(esperar, 300)); setTimeout(esperar, 400); };
  $('#cDirecto').checked = !!S.directo; $('#cDirecto').onchange = e => escribirG({ directo: e.target.checked });
  if (S.directo && S.edad18 && !/[?&]portada/.test(location.search)) setTimeout(abierto, 60);
  for (const id of ['bAbierto', 'bModos', 'bHistoria', 'bSeguir', 'bLibre']) $('#' + id).addEventListener('click', () => escribirG({ edad18: true }), { capture: true });
  $('#bLibre').onclick = () => { const box = $('#ciudades'); box.hidden = !box.hidden; if (box.innerHTML) return; const L = S.libre;
    box.innerHTML = (L ? '<button data-c="aqui">📍 <span>Donde quedé<small>' + (planeta.def(L.id) || {}).nombre + '</small></span></button>' : '') + planeta.anillo.filter(d => d.tipo === 'ciudad').map(d => '<button class="b2" data-c="' + d.id + '">🏙️ <span>' + d.nombre + '<small>' + (d.id === 'nueva_york' ? 'Manhattan real: 6 m por casilla' : d.id === 'medellin' ? 'El valle entero: metro, cables, Metroplús y EnCicla' : 'El pueblo, el embalse y la Piedra') + '</small></span></button>').join('');
    box.onclick = e => { const x = e.target.closest('button'); if (!x) return; const c = x.dataset.c; arrancar(() => c === 'aqui' ? (Object.assign(G, { dinero: L.dinero ?? G.dinero, veh: L.veh || G.veh, tengo: L.tengo || G.tengo }), Libre.empezar(L.id, { x: L.x, y: L.y, a: L.a })) : Libre.empezar(c)); }; };
  { const box = $('#capitulos'); box.hidden = false; box.innerHTML = '<small style="color:var(--gris);font:700 11px system-ui;letter-spacing:.06em;text-transform:uppercase">📖 Todos los capítulos, liberados</small>' + TC.HISTORIA.map((H, i) => '<button class="b2" data-i="' + i + '" style="min-height:44px;border-radius:6px;border:1px solid var(--linea);background:#121214;color:var(--tinta);font:700 14px system-ui;text-align:left;padding:0 14px">Acto ' + H.acto + ' · ' + H.titulo + '</button>').join(''); box.onclick = e => { const x = e.target.closest('button'); if (x) arrancar(async () => { G.municion = +x.dataset.i >= 3 ? 24 : 0; await Historia.empezar(+x.dataset.i); }); }; }
  Object.assign(G, { Modos, abrirMapaTC, Artefactos, Historia, Contratos, Libre, planeta, Globo, entrarMundo, menuTransporte, estacionCerca, Snd, Extras, menuHistoria });   /* para las pruebas */
  window.TURNO_LISTO = true;
})();
