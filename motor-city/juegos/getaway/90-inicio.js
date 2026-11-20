/* =====================================================================
   TURNO CERO · arranque: portada, controles, botones, menú y teclado
   ===================================================================== */
if (typeof MC_MODELOS !== 'undefined') MC.Modelos.paquete(MC_MODELOS);   /* los 42 GLB de Codex, dentro del HTML */
MC.Modelos.lejos = 150;
G.aspecto = Object.assign(MC.Personaje.azar(34), { cPelo: '#141414', cCamisa: '#2b343d', cPantalon: '#1d2833', cPiel: '#b98a66', cCasco: null });

function iniciarInterfaz() {
  if (G.ui) return; G.cv = $('#cv'); G.g = G.cv.getContext('2d', { alpha: false });
  const ui = G.ui = MC.UI.crear(document.body, { tema: 'noche' });
  G.ctl = new MC.Controles(G.cv, { alGesto: q => { if (q.tipo !== 'toque' && G.camara) G.camara.gesto(q); }, alTecla: tecla });
  ui.joystick(G.ctl, { texto: 'Arrastra para manejar' });
  { const izq = ui.capa.querySelector('.izq'), vj = $('#viaje'); if (izq && vj) izq.insertBefore(vj, izq.querySelector('.aviso')); }   /* el letrero de la vía va en la columna de la izquierda, nunca sobre la calle */
  ui.accion({ id: 'freno', icono: '🛑', texto: 'Freno', mantener: true, ctl: G.ctl });
  ui.accion({ id: 'turbo', icono: '⚡', texto: 'Turbo', mantener: true, ctl: G.ctl });
  const b = (k, icono, texto, al) => (BOT[k] = ui.boton({ id: k, icono, texto, al }));
  b('menu', '⏸', 'Menú', menu); b('mapa', '🗺️', 'Mapa', () => ui.abrirMapa(G.vistas, G.M, mapaPts, { x: G.cuerpo.x, y: G.cuerpo.y, a: G.cuerpo.a })); b('globo', '🌍', 'Planeta', () => Globo.abrir()); b('camara', '🎥', 'Cámara', siguienteCamara);
  b('taller', '🔧', 'Taller', menuTaller); b('metro', '🚇', 'Metro', menuTransporte); b('encicla', '🚲', 'EnCicla', () => { G.cuerpo.setVeh('bici'); G.ui.aviso('🚲 EnCicla: por la ciclorruta no te sigue nadie en carro', 2200); });
  b('lancha', '🚤', 'Lancha', () => { if (G.cuerpo.embarcar('lancha')) { G.ui.aviso('🚤 Al embalse: la policía se queda en la orilla', 2200); if (G.busq.nivel && !G.busq.visto) G.busq.esconder('embalse'); } });
  b('tierra', '🏝️', 'Tierra', () => { if (G.cuerpo.desembarcar()) G.ui.aviso('🏝️ En tierra: consigue un carro', 1800); });
  b('bajar', '🚪', 'Bajarse', () => G.cuerpo.bajarse('jugador')); b('robar', '🚗', 'Robar', robarCarro); b('montar', '🔑', 'Subirse', () => { if (G.cuerpo.montar(4)) G.carro = Math.max(G.carro, .05); });
  b('foto', '📷', 'Foto', () => Historia.foto()); b('rapido', '⏩', 'Viaje ×3', () => { G.rapido = !G.rapido; G.ui.aviso(G.rapido ? '⏩ El viaje va tres veces más rápido' : '▶ Velocidad normal', 1400, 'rapido'); });
  b('contratos', '📞', 'Contratos', () => Contratos.menu()); b('reducir', '✊', 'Reducir', () => Historia.reducir());
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
const CAMARAS = ['cenital', 'ciudad3d', 'tercera', 'maqueta'];
function siguienteCamara() { const i = CAMARAS.indexOf(G.vistaId); G.vistaId = CAMARAS[(i + 1) % CAMARAS.length]; const v = G.vistas.usar(G.vistaId, G.E); G.ui.aviso(v.icon + ' ' + v.n, 1400, 'vista'); escribirG({ vista: G.vistaId }); }
function menu() {
  const S = leerG(), it = [{ id: 'seguir', texto: '▶ Seguir' }, { id: 'cam', texto: '🎥 Cámara: ' + G.vistas.actual.n }, { id: 'sonido', texto: Snd.on ? '🔊 Sonido: sí' : '🔇 Sonido: no' }, { id: 'suave', texto: S.suave ? '🗣️ Lenguaje: suave' : '🗣️ Lenguaje: fuerte' }, { id: 'quien', texto: '👥 Personajes' }, { id: 'artef', texto: '🧰 Artefactos' }];
  if (G.hist) it.push({ id: 'reintentar', texto: '↩ Volver al último punto' }); it.push({ id: 'libre', texto: '🌎 Calle libre aquí' }, { id: 'portada', texto: '🏠 Portada' });
  G.ui.menu('Turno Cero · ' + planeta.def(G.id).nombre, it, async k => {
    if (k === 'cam') siguienteCamara(); else if (k === 'sonido') { if (Snd.on) Snd.apagar(); else Snd.prender(); escribirG({ sonido: Snd.on }); } else if (k === 'suave') escribirG({ suave: !S.suave });
    else if (k === 'quien') { G.pausa = true; await G.ui.dialogo('👥 Personajes', Object.values(TC.QUIEN).filter(q => q.d).map(q => '<b style="color:' + q.c + '">' + q.n + '</b>: ' + q.d).join('<br>'), ['Listo']); G.pausa = false; }
    else if (k === 'artef') { G.pausa = true; await G.ui.dialogo('🧰 Artefactos de 2026 (ficción)', Object.values(TC.ARTEFACTOS).map(a => a.icon + ' <b>' + a.cod + ' · ' + a.n + '</b>: ' + a.d).join('<br>'), ['Listo']); G.pausa = false; }
    else if (k === 'reintentar') Historia.reintentar(); else if (k === 'libre') Libre.empezar(G.id, { x: G.cuerpo.x, y: G.cuerpo.y, a: G.cuerpo.a }); else if (k === 'portada') location.reload();
  });
}
function tecla(k) {
  if (!G.M || G.pausa) return; const A = Artefactos;
  if (k === 'Digit1') A.dron(); else if (k === 'Digit2') A.cebo(); else if (k === 'Digit3') A.pulso(); else if (k === 'Digit4') A.lente(); else if (k === 'KeyF') A.disparar();
  else if (k === 'KeyM') BOT.mapa.onclick({ stopPropagation() {} }); else if (k === 'KeyG') Globo.abrir(); else if (k === 'KeyC') siguienteCamara(); else if (k === 'Escape') menu();
  else if (k === 'KeyE') { for (const q of ['reducir', 'foto', 'taller', 'metro', 'lancha', 'tierra', 'robar', 'montar', 'encicla']) if (BOT[q] && !BOT[q].hidden) { BOT[q].onclick({ stopPropagation() {} }); break; } }
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
  $('#bLibre').onclick = () => { const box = $('#ciudades'); box.hidden = !box.hidden; if (box.innerHTML) return; const L = S.libre;
    box.innerHTML = (L ? '<button data-c="aqui">📍 <span>Donde quedé<small>' + (planeta.def(L.id) || {}).nombre + '</small></span></button>' : '') + planeta.anillo.filter(d => d.tipo === 'ciudad').map(d => '<button class="b2" data-c="' + d.id + '">🏙️ <span>' + d.nombre + '<small>' + (d.id === 'nueva_york' ? 'Manhattan real: 6 m por casilla' : d.id === 'medellin' ? 'El valle entero: metro, cables, Metroplús y EnCicla' : 'El pueblo, el embalse y la Piedra') + '</small></span></button>').join('');
    box.onclick = e => { const x = e.target.closest('button'); if (!x) return; const c = x.dataset.c; arrancar(() => c === 'aqui' ? (Object.assign(G, { dinero: L.dinero ?? G.dinero, veh: L.veh || G.veh, tengo: L.tengo || G.tengo }), Libre.empezar(L.id, { x: L.x, y: L.y, a: L.a })) : Libre.empezar(c)); }; };
  const hechos = S.capitulos || 0; if (hechos > 0) { const box = $('#capitulos'); box.hidden = false; box.innerHTML = TC.HISTORIA.slice(0, Math.min(TC.HISTORIA.length, hechos + 1)).map((H, i) => '<button class="b2" data-i="' + i + '" style="min-height:44px;border-radius:6px;border:1px solid var(--linea);background:#121214;color:var(--tinta);font:700 14px system-ui;text-align:left;padding:0 14px">Acto ' + H.acto + ' · ' + H.titulo + '</button>').join(''); box.onclick = e => { const x = e.target.closest('button'); if (x) arrancar(async () => { G.municion = +x.dataset.i >= 3 ? 24 : 0; await Historia.empezar(+x.dataset.i); }); }; }
  Object.assign(G, { Artefactos, Historia, Contratos, Libre, planeta, Globo, entrarMundo, menuTransporte, estacionCerca, Snd });   /* para las pruebas */
  window.TURNO_LISTO = true;
})();
