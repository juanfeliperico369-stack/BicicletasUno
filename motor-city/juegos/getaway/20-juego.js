/* =====================================================================
   TURNO CERO · el juego (mundos del planeta, manejo, búsqueda, daño, artefactos, transporte y ciclo)
   Motor City 4.0: MC.Planeta (Nueva York → Ruta del Atlántico → Medellín y el Valle → Autopista del Embalse →
   Guatapé → Carretera del Norte → Nueva York), MC.Busqueda (sirenas 0–5, policía y banda), las cámaras aéreas 3D
   del mundo único, el horizonte curvo (E.curvatura), MC.Transporte con horario real (metro, cables, tranvía y
   Metroplús de Medellín), EnCicla, la lancha del embalse, MC.Objetos, el tráfico, la gente y los modelos GLB de Codex
   (MC.Modelos: carros, patrullas, camionetas, personas, retenes y contenedores en 3D).
   ===================================================================== */
const $ = s => document.querySelector(s), GUARDA = 'motorcity.turnocero-v1';
const leerG = () => { try { return JSON.parse(localStorage.getItem(GUARDA) || '{}'); } catch (e) { return {}; } };
const escribirG = o => { try { localStorage.setItem(GUARDA, JSON.stringify(Object.assign(leerG(), o))); } catch (e) { /* sin almacenamiento */ } };
const R_PLANETA = 60000, CURVATURA = 1 / (2 * R_PLANETA);
const plata = n => '$' + Math.round(n).toLocaleString('es-CO');
const espera = ms => new Promise(r => setTimeout(r, ms));
const clamp = MC.clamp, TAU = Math.PI * 2;

/* ---------- vehículos del juego: ingeniería del taller con las cifras de balance de la biblia ---------- */
for (const v of TC.VEHICULOS) {
  const d = MC.Taller.disenar({ id: v.id, n: v.n, tipo: v.tipo, masa: v.masa, potenciaKW: v.potenciaKW, parNm: v.parNm, cd: v.cd, area: v.area, tanqueL: 50, color: v.color, mu: v.tipo === 'moto' ? 1.05 : .95 });
  const acc = (d.ceroCien ? 27.78 / d.ceroCien : d.potenciaPeso * .25) * 1.6;   /* semiarcade (biblia de Codex): el peso se siente, pero arranca para persecuciones */
  MC.Taller.registrar(d, { vmax: v.vmax, acc, icon: v.icon, color: v.color, largo: v.largo, ancho: v.ancho, modelo: v.modelo, juegos: ['getaway'] }); v.ficha = d;
}
const VEH = id => TC.VEHICULOS.find(v => v.id === id) || TC.VEHICULOS[0];

/* ---------- sonido: sirena, disparos y golpes (Web Audio, sin archivos) ---------- */
const Snd = {
  ac: null, on: leerG().sonido ?? true, sirena: null,
  ini() { if (this.ac || !this.on) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; try { this.ac = new AC(); this.out = this.ac.createGain(); this.out.gain.value = .55; this.out.connect(this.ac.destination); } catch (e) { this.ac = null; } },
  ruido(dur, f, vol) { const ac = this.ac; if (!ac || !this.on || vol < .02) return; const n = Math.round(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = f; const g = ac.createGain(); g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(this.out); s.start(); },
  disparo(d) { this.ruido(.22, 2600, clamp(1 - d / 100, .04, .8)); },
  golpe(k) { this.ruido(.45, 520, clamp(k, .05, 1)); },
  sirenaVol(v, corte = 900) { const ac = this.ac; if (!ac || !this.on) return; if (!this.sirena) { const o = ac.createOscillator(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 760; l.type = 'square'; l.frequency.value = 1.4; lg.gain.value = 170; l.connect(lg); lg.connect(o.frequency); fl.type = 'bandpass'; fl.frequency.value = 900; g.gain.value = 0; o.connect(fl); fl.connect(g); g.connect(this.out); o.start(); l.start(); this.sirena = { o, g, l, fl }; } this.sirena.g.gain.setTargetAtTime(clamp(v, 0, 1) * .1, ac.currentTime, .25); this.sirena.fl.frequency.setTargetAtTime(clamp(corte, 350, 4000), ac.currentTime, .2); },
  /* 4.0.x · efecto Doppler de la sirena: f = f0·c/(c + vr), vr > 0 si se aleja (c = 343 m/s) */
  doppler(vr) { if (!this.sirena || !this.ac) return; const k = MC.PersecucionAudio.plan({ velocidadRadial: vr }).doppler; this.sirena.o.frequency.setTargetAtTime(760 * k, this.ac.currentTime, .15); },
  /* 4.0.x · motor por capas: un diente de sierra que sube con las rpm (cambios simulados) y un zumbido grave */
  motor(v, enCarro, acel) { const ac = this.ac; if (!ac || !this.on) return; if (!this.mot) { const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'triangle'; fl.type = 'lowpass'; fl.frequency.value = 700; g.gain.value = 0; o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(this.out); o.start(); o2.start(); this.mot = { o, o2, g, fl }; }
    const R = G.cuerpo && MC.Dinamica ? MC.Dinamica.sonido(G.cuerpo) : null, P = MC.PersecucionAudio.motor(Object.assign({ velocidad: v, aceleracion: acel, activo: enCarro }, R && MC.Dinamica.activa(G.cuerpo) ? R : {})), t = ac.currentTime;   /* 5.0: con el manejo real, las rpm de verdad y sus cilindros */ this.mot.o.frequency.setTargetAtTime(P.agudo, t, .08); this.mot.o2.frequency.setTargetAtTime(P.grave, t, .08); this.mot.fl.frequency.setTargetAtTime(P.corte, t, .1); this.mot.g.gain.setTargetAtTime(P.volumen, t, .15); },
  apagar() { this.on = false; this.sirenaVol(0); if (this.mot) this.mot.g.gain.value = 0; if (this.ac) this.ac.suspend(); MC.Musica.parar(); }, prender() { this.on = true; if (this.ac) this.ac.resume(); else this.ini(); }
};

/* ---------- el planeta y sus mundos (cada MC4 viene en un <script type="text/plain">) ---------- */
async function cargarCiudad(id) {
  const C = MC_CIUDADES[id], cfg = Object.assign({}, C, { zonas: Object.assign({}, MC.ZONAS_BASE, C.zonas || {}) });
  /* C-M34: preferir las capas comprimidas embebidas, sin decodificar el MC4
     entero; el paquete monolítico anterior sigue admitido para guardados
     y HTML de versiones previas. Nunca requiere conexión de red. */
  const metaEl = document.getElementById('mc4meta-' + id);
  if (metaEl) {
    const meta = JSON.parse(metaEl.textContent);
    return MC.Mundo.cargarPaquete(meta, nombre => {
      const el = document.getElementById('mc4-' + id + '-' + nombre);
      return el ? el.textContent : null;
    }, cfg, (nombre, indice) => {
      /* C-M34: extraer solo el bloque de suelo/nivel consultado del HTML offline. */
      const info = meta.rasters && meta.rasters[nombre];
      if (!info || indice < 0 || indice + 1 >= info.indices.length) return null;
      const el = document.getElementById('mc4r-' + id + '-' + nombre);
      return el ? el.textContent.slice(info.indices[indice], info.indices[indice + 1]) : null;
    });
  }
  const el = document.getElementById('mc4-' + id);
  if (!el) throw new Error('Este juego no trae el mundo ' + id);
  return MC.Mundo.cargar(el.textContent, cfg);
}
const planeta = new MC.Planeta({ cargar: cargarCiudad, radioVisual: R_PLANETA });
async function mundoListo(id) {
  const M = await planeta.mundo(id);
  if (!M._nc) { M._nc = true; try { M.red('rueda'); } catch (e) { MC.falla('red ' + id, e); } try { MC.Terreno.agua(M); } catch (e) { /* sin agua */ } M.esCiudad = planeta.def(id).tipo === 'ciudad'; M.cfgCiudad = MC_CIUDADES[id] || null; if (MC.PVS && !M.pvs) M.pvs = MC.PVS.deElemento(id); }
  return M;
}

/* ---------- el estado del juego ---------- */
const G = window.TURNO = {
  modo: 'historia', id: null, M: null, cuerpo: null, camara: null, vistas: null, E: null, trafico: null, pobl: null, transporte: null, busq: null, objetos: null,
  reloj: new MC.Reloj({ vel: .25 }), clima: null, ui: null, ctl: null, cv: null, g: null, W: 0, H: 0,
  dinero: 380, rep: { taller: 0, vecindarios: 0, garantias: 0, coro: 0, northquay: 0 }, flags: {}, veh: 'tc_vega', tengo: TC.VEHICULOS.map(v => v.id),   /* 4.7: todos los vehículos desde el principio */
  carro: 1, vida: 1, nitro: .6, danoZonas: { f: 0, b: 0, l: 0, r: 0 }, piezasFisicas: null, piezasSueltas: {}, pausa: false, transicion: false, vistaId: 'cenital', zoom: null, km: 0, destrozados: 0, civiles: 0, disparosRecibidos: 0,
  hist: null, objetivo: null, contrato: null, evidencia: 0, municion: 0, dron: null, lenteT: 0, recarga: { dron: 0, pulso: 0, lente: 0 }, cebos: 2, rastreado: null, guardias: [], modelos3d: [], caidos: [], humo: [], lugaresCache: {}, viaje: null, rapido: false, errores: MC.errores, listo: false, t: 0
};
const ui = () => G.ui;
/* ganchos para los extras (50-extras.js): botones, HUD, tráfico y obstáculos que se suman sin reescribir este archivo */
const EXTRAS = { ui: [], hud: [], trafico: [], obstaculos: [], capas: [], mapa: [], paso: [], entrada: [] };   /* 4.6: paso (cada paso de la simulación) y entrada (tocar lo que pide el jugador antes de mover el cuerpo), para los 🎮 modos */   /* 4.2: capas (dibujar encima del mundo) y mapa (puntos del minimapa) */

/* lugar del juego → punto sobre una vía del mundo actual */
function resolver(clave) {
  const L = TC.LUGARES[clave]; if (!L || L.mundo !== G.id) return null; const C = G.lugaresCache[G.id] || (G.lugaresCache[G.id] = {}); if (C[clave]) return C[clave];
  const M = G.M; let p = null;
  if (L.lugar) { const re = L.lugar.toLowerCase(), q = M.lugares.find(l => (l.nombre || '').toLowerCase().includes(re)); if (q) p = { x: q.x, y: q.y }; }
  if (!p && L.lat != null) p = M.geoAMetros(L.lat, L.lon);
  if (!p) return null; const q = M.viaCercana(p.x, p.y, 300); const r = { x: q ? q.x : p.x, y: q ? q.y : p.y, a: q ? q.ang : 0, n: L.n, clave, taller: !!L.taller, escondite: !!L.escondite };
  return (C[clave] = r);
}
/* los talleres y escondites del mundo actual (los de la ciudad y los de las paradas de la carretera) */
function sitiosEspeciales() {
  if (G._esp && G._esp.id === G.id) return G._esp.L; const L = [];
  for (const k of Object.keys(TC.LUGARES)) { const r = resolver(k); if (r && (r.taller || r.escondite)) L.push(r); }
  if (!G.M.esCiudad) for (const l of G.M.lugares) { const tipo = l.dibujo || '', taller = tipo === 'car_repair' || /Taller/.test(l.nombre || ''), escondite = ['fuel','motel','restaurant','bar'].includes(tipo) || /Bomba|Paradero/.test(l.nombre || ''); if (taller || escondite) { const q = G.M.viaCercana(l.x, l.y, 80); L.push({ x: q ? q.x : l.x, y: q ? q.y : l.y, n: l.nombre, taller, escondite }); } }
  G._esp = { id: G.id, L }; return L;
}

/* ---------- entrar a un mundo del planeta ---------- */
async function entrarMundo(id, spawn = {}, texto = null) {
  G.transicion = true; const tr = $('#transicion'), d = planeta.def(id);
  $('#trP').textContent = texto ? texto[0] : (d.tipo === 'ciudad' ? 'Llegando a' : 'Carretera'); $('#trH').textContent = d.nombre; $('#trS').textContent = texto ? texto[1] : (d.tipo === 'tramo' ? (d.largo / 1000).toFixed(0) + ' km de nada · ' + d.biomas.map(b => MC.Planeta.BIOMAS[b].n.toLowerCase()).join(', ') : '');
  tr.classList.add('on'); await espera(450);
  const v0 = G.cuerpo ? G.cuerpo.v : 0, heat0 = G.busq ? G.busq.heat : 0, desde = G.id;
  const M = await mundoListo(id);
  if (G.vistas) G.vistas.liberar();
  G.tengo = [...new Set([...(G.tengo || []), ...TC.VEHICULOS.map(v => v.id)])];   /* 4.7: todo liberado aunque venga de un guardado viejo */
  G.id = id; G.M = M; planeta.fijar(id); G._esp = null; G.sectores = id === 'nueva_york' ? new MC.Sectores1km(M, { lado: 1000, radio: 1, maxRegiones: 36 }) : null; G._sectoresT = 0;
  let L = spawn.x != null ? spawn : spawn.lugar ? resolver(spawn.lugar) : null;
  if (!L && desde) L = planeta.llegada(id, desde);
  if (!L) { const c = M.carretera ? M.carretera.inicio : M.viaCercana(M.ancho / 2, M.alto / 2, 2000) || { x: M.ancho / 2, y: M.alto / 2 }; L = { x: c.x, y: c.y, a: c.a ?? c.ang ?? 0 }; }
  const q = M.viaCercana(L.x, L.y, 60);
  const C = new MC.Cuerpo(M, { x: q ? q.x : L.x, y: q ? q.y : L.y, a: L.a ?? (q ? q.ang : 0), veh: spawn.aPie ? 'pie' : G.veh }); C.v = spawn.aPie ? 0 : Math.min(v0, 18);
  G.cuerpo = C; C.obstaculos = obstaculos;
  /* C-M34: descargar el anterior e impedir resurrección de precargas obsoletas. */
  planeta.liberarExcepto(id);
  const lat = M.cfgCiudad ? (M.cfgCiudad.lat ?? M.metrosAGeo(C.x, C.y).lat) : (planeta.enGlobo(id, C.x, C.y).lat);
  G.clima = new MC.ClimaGlobal({ lat: Math.abs(lat) > 1 ? lat : 6.2, alt: M.cota(C.x, C.y) }); C.clima = G.clima; if (G.climaForzado) G.clima.forzar(G.climaForzado);
  const dpr0 = Math.min(2, devicePixelRatio || 1);
  G.vistas = new MC.Vistas(M); G.flex = MC.Flex.aplicar(leerG().flex, { vistas: G.vistas });   /* 4.8 · ⚙️ Flexibilidad */ G.camara = new MC.Camara({ zoom: G.zoom || Math.max(8, Math.min(15, Math.min(innerWidth, innerHeight) / 50)) * dpr0, mundo: M }); G.camara.limites.zoom = [2.4 * dpr0, 60 * dpr0]; G.camara.tercio = true;   /* 5.5.0 · la cámara única: de 20 a 60 px/m la cenital se inclina y se va detrás del rumbo (casi tercera persona, js/34-camara.js) */
  G.camara.x = C.x; G.camara.y = C.y;
  G.trafico = new MC.Trafico(M, { n: M.esCiudad ? 16 : 7, peatones: 0, red: 'rueda', radio: 460 });
  G.pobl = M.esCiudad ? new MC.Poblacion(M, { n: 30, centro: { x: C.x, y: C.y }, radio: 900, semilla: 17 }) : null;
  G.transporte = M.transporte && M.transporte.lineas && M.transporte.lineas.length ? new MC.Transporte(M, M.cfgCiudad || {}) : null;
  G.busq = new MC.Busqueda(M, { heat: spawn.heat ?? heat0 * .6, semilla: (G.t * 1000) | 0 });
  G.objetos = new MC.Objetos(M, {}); try { G.objetos.sembrar(C.x, C.y, 320, 40); } catch (e) { /* sin objetos */ }
   G.piezasFisicas = new MC.Piezas(M);
  G.E = { mundo: M, camara: G.camara, reloj: G.reloj, clima: G.clima, transporte: G.transporte, jugador: { cuerpo: C, aspecto: G.aspecto, modelo: 'personaje_mara_rig', dano: G.danoZonas }, t: G.t, vehiculos: [], trafico: [], peatones: [], extras: [], cables: G.transporte ? G.transporte.lineas.filter(l => l.clase === 'cable') : [], objetos: G.objetos, piezas: G.piezasFisicas, curvatura: CURVATURA, modelos3d: G.modelos3d,
    bloqueosEtiquetas: (w, h) => [[w - 84 * w / innerWidth, 0, w, h]] };
  G.vistas.usar(G.vistaId, G.E); G.vistas.dpr = G.dEf || 1;
  if (G.ui && G.ui._mini) G.ui._mini.vistas = G.vistas; else if (G.ui) G.ui.minimapa(G.vistas, () => abrirMapaTC());
  if (M.esCiudad) MC.MapaGrande.precalentar(M);   /* 4.6: la vista general del mapa se arma en los ratos libres */
  planeta.llegadaT = 3; G.caidos = []; G.humo = []; G.rutaHecha = {}; G.rapido = false;
  ajustar();
  await espera(120); tr.classList.remove('on'); G.transicion = false;
  MC.emit('turno:mundo', { id, desde });
  if (G.hist) Historia.alEntrar(id); else if (!M.esCiudad) G.rutaEventos = eventosCarreteraLibre();
  guardarPosicion();
}

/* obstáculos para el jugador: tráfico, rivales y gente (a pie o despacio; a velocidad la gente no frena el carro: se la lleva) */
function obstaculos() {
  const L = [], C = G.cuerpo, rapido = C.veh.clase !== 'pie' && Math.abs(C.v) > 4;
  for (const v of G.trafico ? G.trafico.agentes : []) { const r = (v.ancho || 1.8) / 2 + .15, l = (v.largo || 4.3) / 3, c = Math.cos(v.a || 0), s = Math.sin(v.a || 0); for (const k of [-1, 0, 1]) L.push({ x: v.x + c * l * k, y: v.y + s * l * k, r, motivo: 'un vehículo', ag: v }); }
  if (G.busq) for (const o of G.busq.obstaculos()) L.push(o);
  if (!rapido) for (const p of G.E.peatones || []) L.push({ x: p.x, y: p.y, r: .28, motivo: 'una persona' });
  for (const f of EXTRAS.obstaculos) for (const o of f()) L.push(o);
  if (G.seguido) { const B = G.seguido.cuerpo, cs = Math.cos(B.a), sn = Math.sin(B.a); for (const k of [-1, 0, 1]) L.push({ x: B.x + cs * 1.6 * k, y: B.y + sn * 1.6 * k, r: 1.05, motivo: 'rival:contador' }); }
  return L;
}

/* ---------- tamaño y densidad del lienzo ---------- */
let densidad = null;
function ajustar() {
  if (!G.cv) return; if (!densidad) densidad = new MC.DensidadLienzo({ max: Math.min(2, devicePixelRatio || 1), activa: MC.opciones.densidad !== false });
  densidad.ponerMax(Math.min(2, devicePixelRatio || 1)); const d = G.dEf = densidad.medir(0, G.vistas ? G.vistas.actual.id : 'cenital');
  G.W = G.cv.width = Math.round(innerWidth * d); G.H = G.cv.height = Math.round(innerHeight * d); if (G.vistas) G.vistas.dpr = d;
}
function redensificar(d) { if (d === G.dEf) return; const k = d / G.dEf; G.camara.zoom *= k; G.camara.limites.zoom = G.camara.limites.zoom.map(z => z * k); G.dEf = d; G.W = G.cv.width = Math.round(innerWidth * d); G.H = G.cv.height = Math.round(innerHeight * d); G.vistas.dpr = d; }

/* ---------- subtítulos (llamadas que no frenan el volante) y escenas ---------- */
const Subt = { cola: [], t: 0,
  decir(lineas) { for (const [q, x] of lineas) this.cola.push([q, x]); },
  paso(dt) { const el = $('#subt'); if (this.t > 0) { this.t -= dt; if (this.t <= 0) el.hidden = true; return; } const s = this.cola.shift(); if (!s) return; const Q = TC.QUIEN[s[0]] || { n: s[0], c: '#fff' }, Rr = TC.ROSTROS && TC.ROSTROS[s[0]] && MC.Rostro ? '<img class="cara" alt="" src="' + MC.Rostro.url(TC.ROSTROS[s[0]], 96) + '">' : ''; el.innerHTML = Rr + (s[0] === 'radio' ? '' : '<b style="color:' + Q.c + '">' + Q.n + ':</b> ') + suave(s[1]); el.hidden = false; this.t = Math.max(3, s[1].length * .058); },
  limpiar() { this.cola = []; this.t = 0; $('#subt').hidden = true; }
};
async function escena(lineas) {
  const token = G.narrativaEpoch || 0;
  G.pausa = true; Subt.limpiar();
  for (const [q, x] of lineas) {
    if (token !== (G.narrativaEpoch || 0)) return;
    const Q = TC.QUIEN[q] || { n: q, c: '#fff' };
    const cara = TC.ROSTROS && TC.ROSTROS[q] && MC.Rostro ? '<img class="retrato" alt="Retrato de ' + Q.n + '" src="' + MC.Rostro.url(TC.ROSTROS[q], 160, { expresion: /[!¡]|maldit|corr|ya\b/i.test(x) ? 'preocupada' : TC.ROSTROS[q].expresion }) + '">' : '';
    await G.ui.dialogo(q === 'radio' ? '<span style="color:#8a8578">· · ·</span>' : cara + '<span style="color:' + Q.c + '">' + Q.n + '</span>', suave(x), ['▶']);
  }
  if (token === (G.narrativaEpoch || 0)) G.pausa = false;
}
async function decision(D) {
  G.pausa = true; const i = await G.ui.dialogo('<span style="color:#e8a33c">❓ ' + D.pregunta + '</span>', '', D.opciones.map(o => o.texto)); G.pausa = false;
  const o = D.opciones[i] || D.opciones[0]; aplicar(o); if (o.respuesta) await escena(o.respuesta); return o;
}
function aplicar(A) {
  if (!A) return; if (A.rep) for (const [k, v] of Object.entries(A.rep)) G.rep[k] = clamp((G.rep[k] || 0) + v, -100, 100);
  if (A.flags) Object.assign(G.flags, A.flags); if (A.dinero) { G.dinero += A.dinero; G.ui.aviso((A.dinero > 0 ? '💵 +' : '💸 ') + plata(A.dinero), 2200, 'plata'); }
  if (A.reparar) { G.carro = 1; G.busq.pinchado = false; G.vida = Math.max(G.vida, .8); reparaZonas(); }
  if (A.veh) cambiarVeh(A.veh, true);
}

/* ---------- vehículo ---------- */
function cambiarVeh(id, regalo = false) {
  const C = G.cuerpo; G.veh = id; if (!G.tengo.includes(id)) G.tengo.push(id); if (C.veh.clase !== 'pie') C.setVeh(id); G.carro = 1; G.busq.pinchado = false;
  if (id === 'tc_mercury' && G.busq.nivel > 0 && G.id === 'nueva_york') { G.busq.heat = Math.max(0, Math.min(G.busq.heat, Busq_umbral(G.busq.nivel - 1) + 2)); G.ui.aviso('🚕 En Nueva York nadie mira un taxi dos veces'); }
  G.ui.aviso(VEH(id).icon + ' ' + VEH(id).n + (regalo ? '' : ''), 2000, 'veh');
}
const Busq_umbral = n => MC.Busqueda.UMBRAL[clamp(n, 0, 5)];

/* ---------- el ciclo ---------- */
let t0 = 0, hudT = 0, sonT = 0, musT = 0, tocando = null, ultBloqueo = null, rozados = new WeakMap(), insultoT = 0, radioT = 40;
function cuadro(ahora) {
  requestAnimationFrame(cuadro);
  const dtR = Math.min(.15, Math.max(0, (ahora - t0) / 1000)); /* 4.6: el motor da subpasos; a 7 cuadros por segundo el juego ya no va en cámara lenta */ t0 = ahora; if (!G.M || G.transicion || G.enRun) return; if (G.ui && G.ui._mapa) return;   /* 4.6: con el mapa abierto no se dibuja el mundo de debajo (el mapa tiene su propio ciclo) */
  if (G.globo) { pintarGlobo(dtR); return; }
  const pasos = G.rapido && !G.pausa ? 3 : 1;
  for (let k = 0; k < pasos; k++) paso(G.pausa ? 0 : dtR, k === pasos - 1 ? dtR : 0);
  dibujar(dtR);
}
function paso(dt, dtVisual) {
  const C = G.cuerpo, M = G.M, E = G.E; G.t += dt; E.t = G.t;
  G.reloj.avanzar(dt); G.clima.actualizar(G.reloj, dt); E.cielo = MC.Cielo.en(G.reloj.fecha, G.reloj.hora, G.clima);
  const ent = G.ctl.leer(); if (G.pausa) { ent.stick = { x: 0, y: 0, m: 0 }; ent.acel = 0; }
  const V = C.veh, enCarro = V.clase !== 'pie' && V.clase !== 'rueda', x0 = C.x, y0 = C.y, v0 = Math.abs(C.v), sv0 = C.v;
  /* el estado del carro: daño, púas, turbo */
  C.escala = enCarro ? (G.carro <= 0 ? .14 : (.72 + .28 * G.carro) * (G.busq.pinchado ? .58 : 1)) : 1;
  if (G.viaje) viajeTransporte(dt);
  else if (G.dron && dt > 0) vueloDron(dt, ent);
  else if (G.controlExterno && dt > 0) G.controlExterno(dt, ent);   /* 4.6: un modo maneja otra cosa (el tren de 🎮 Modos) */
  else if (dt > 0) {
    const gl = G.vistas.actual.control === 'volante', via = V.clase !== 'pie' ? M.viaCercana(C.x, C.y, 12) : null;
    const e = MC.Manejo.aplicar(ent, C, { camara: G.camara, esquema: MC.Flex.esquema('joystick'), vista: MC.Flex.vista(gl ? 'volante' : 'mundo'), rumboVia: via ? via.ang : null, acelFijo: !!G.acelFijo && V.clase !== 'pie' });   /* 4.6.1: ⏫ acelerador fijo */
    const freno = G.ctl.botones.has('freno') || ent.pulsos.has('Space');
    /* 4.5 · freno de mano: con velocidad y girando, derrapa (sigue girando, se cruza la cola, deja marcas y humo); quieto o derecho, frena */
    if (freno && V.clase !== 'pie') { const gira = (e.dir && Math.abs(angDif(C.a, Math.atan2(e.dir.y, e.dir.x))) > .25) || Math.abs(e.giro || 0) > .25; if (gira && Math.abs(C.v) > 7 && enCarro) { e.derrape = true; e.acel = Math.min(e.acel || 0, .3); } else { e.dir = null; e.acel = -1; } }
    if (G.asistencia == null) G.asistencia = leerG().asistencia === true; e.asistencia = G.asistencia; /* 4.6: apagada por defecto (el autor: «por nada derrapa, va lento»); se prende en ⏸ Menú */
    e.turbo = false; if ((ent.turbo || G.ctl.botones.has('turbo')) && G.nitro > .02 && enCarro && G.carro > 0) { e.turbo = true; G.nitro = Math.max(0, G.nitro - dt * .18); } else G.nitro = Math.min(1, G.nitro + dt * .012);
    for (const f of EXTRAS.entrada) f(e, ent); e.lluvia = G.clima.lluvia; C.actualizar(dt, e);
  }
  if (dt > 0) {
    /* daño por golpes: lo que se perdió de velocidad de un cuadro a otro */
    const dv = v0 - Math.abs(C.v);
    if (enCarro && (C.eventos.includes('choque') || dv > 5.5) && dv > 3) { const k = dv * .011 / (VEH(G.veh).salud || 1), antes = G.carro; G.carro = Math.max(0, G.carro - k); if (antes > 0 && G.carro <= 0) carroArde(); abollar(sv0 >= 0 ? 'f' : 'b', dv); G.camara.sacudir(Math.min(.3, dv * .02)); Snd.golpe(dv / 18); if (MC.Vida) MC.Vida.emitir('chispa', C.x + Math.cos(C.a) * 2, C.y + Math.sin(C.a) * 2, 8); if (/persona/.test(C.bloqueo || '')) atropello(null); if (G.carro <= 0) G.ui.aviso('🔥 El carro no da más: bájate 🚪 y consigue otro 🚗', 4000, 'carro'); }
    /* C5-01: un vuelco lateral de vehículo en manejo real dobla también los
       paneles de costado ya soportados por el modelo 3D (D.l / D.r). La vida
       del carro conserva el sistema existente de daño y reparación. */
    if (enCarro && C.eventos.includes('vuelco')) {
      const lado = C._vuelco && C._vuelco.signo < 0 ? 'l' : 'r';
      const fuerza = Math.max(8, Math.min(30, C._vuelcoGolpe || 8));
      abollar(lado, fuerza);
      abollar(lado === 'l' ? 'r' : 'l', fuerza * .35);
      G.carro = Math.max(0, G.carro - Math.min(.18, fuerza * .004) / (VEH(G.veh).salud || 1));
      G.ui.aviso('🚗 Vuelco: el vehículo se endereza solo', 2600, 'carro');
    }
    G.km += Math.hypot(C.x - x0, C.y - y0) / 1000;
    /* el mundo vivo alrededor */
    E.trafico = G.trafico.paso(dt, C.x, C.y, G.reloj.seg, G.vistas.calidad);
    if (G.pobl) { E.peatones = G.pobl.paso(dt, G.reloj, C.x, C.y, 420).filter(p => !p._caido); atropellos(); } else E.peatones = [];
    if (G.transporte) E.vehiculos = G.transporte.vehiculos(G.reloj.fecha, G.reloj.seg, [G.camara.x - 1400, G.camara.y - 1400, G.camara.x + 1400, G.camara.y + 1400]);
    casiChoques(C, E.trafico);
    /* la búsqueda */
    const B = G.busq, d0 = B.danio; B.actualizar(dt, C, E.trafico); E.trafico = E.trafico.concat(B.vehiculos());
    const dd = B.danio - d0; if (dd > 0) { if (enCarro) G.carro = Math.max(0, G.carro - dd / (VEH(G.veh).salud || 1)); else G.vida = Math.max(0, G.vida - dd * 1.5); }
    for (const ev of B.sacar()) eventoBusqueda(ev);
    /* objetos físicos (conos, vallas, canecas) */
    { const cs = [{ x: C.x, y: C.y, z: C.z, r: V.clase === 'pie' ? .35 : Math.max(.4, (V.ancho || .8) / 2), masa: V.masa || 1400, vx: Math.cos(C.a) * C.v, vy: Math.sin(C.a) * C.v }]; for (const t of E.trafico) if (Math.hypot(t.x - C.x, t.y - C.y) < 140) cs.push({ x: t.x, y: t.y, z: 0, r: 1, masa: 1400, vx: Math.cos(t.a) * (t.v || 0), vy: Math.sin(t.a) * (t.v || 0) }); G.objetos.actualizar(dt, cs); }
     if (G.piezasFisicas) G.piezasFisicas.paso(dt);
     if (G.sectores && (G._sectoresT -= dt) <= 0) { G._sectoresT = 2; G.sectorStats = G.sectores.actualizar(C.x, C.y); }
     if (B.pinchado && !G.piezasSueltas.rueda && enCarro) {
       G.piezasSueltas.rueda = true; G.piezasFisicas.soltar('rueda', C);
     }
    /* el planeta: ¿cruzaste una puerta? */
    const cr = planeta.cruce(G.id, C.x, C.y, dt); if (cr && !G.viaje) { const desde = planeta.def(G.id), hacia = planeta.def(cr.a); entrarMundo(cr.a, {}, desde.tipo === 'ciudad' ? ['Saliendo de ' + desde.nombre, (planeta.puertas(G.id) && (planeta.puertas(G.id).siguiente.nombre || '')) ] : null); return; }
    if (!M.esCiudad) eventosRuta();
    /* la historia y los contratos */
    if (G.hist) Historia.paso(dt); else if (G.contrato) Contratos.paso(dt);
    if (G.esperando) { const W = G.esperando; if (Math.abs(C.v) < 3) W.t -= dt; G.ui.aviso('⏳ ' + W.texto + ' ' + Math.min(100, Math.round((1 - W.t / W.total) * 100)) + '%', 400, 'espera'); if (W.t <= 0) W.luego(); }
    escondites(dt); for (const f of EXTRAS.paso) f(dt, ent);
    /* fallar */
    if (G.vida <= 0 && !G.cayo) { G.cayo = true; fallar('💀 Mara cayó', 'Te dieron demasiados tiros. En esta ciudad nadie para a ayudar.'); }
    else if (B.estado === 'atrapado' && !G.cayo) { G.cayo = true; fallar('🚔 Te atraparon', 'Esposas, una patrulla y una llamada a El Contador desde la estación. Tu turno se acabó.'); }
    /* la vida: bloqueos que se dicen una vez, insultos, radio */
    if (C.bloqueo && C.bloqueo !== ultBloqueo && !/rival|vehículo|persona/.test(C.bloqueo)) { ultBloqueo = C.bloqueo; G.ui.aviso('🚧 ' + C.bloqueo[0].toUpperCase() + C.bloqueo.slice(1), 1600, 'bloqueo'); } else if (!C.bloqueo) ultBloqueo = null;
    if ((radioT -= dt) <= 0) { radioT = 50 + Math.random() * 40; if (!Subt.cola.length && Subt.t <= 0 && G.busq.nivel > 0) Subt.decir([['radio', TC.RADIO[(Math.random() * TC.RADIO.length) | 0]]]); }
  }
  /* la cámara: más lejos e inclinada en persecución */
  G.camara.persecucion = G.busq.nivel > 0 || G.busq.rivales.some(r => r.bando === 'banda' && !r.roto) ? clamp(.45 + G.busq.nivel * .1, 0, 1) : (Math.abs(C.v) > 22 ? .3 : 0);
  /* artefactos: recargas y la lente espectral (T01, estilo térmico del motor por 8 s) */
  for (const k in G.recarga) G.recarga[k] = Math.max(0, G.recarga[k] - dt);
  if (G.lenteT > 0) { G.lenteT -= dt; if (G.lenteT <= 0) { MC.estilo = G.estiloAntes || 'realista'; G.ui.aviso('👁️ Lente espectral apagada', 1200, 'lente'); } }
  if (!G.viaje && !G.dron) G.camara.actualizar(dtVisual || dt, { x: C.x, y: C.y, z: C.alturaSuelo, a: C.a, v: C.v, zCuerpo: C.z, zPaso: C.zPaso, mundo: M, ojo: C.veh.clase === 'auto' ? 1.15 : C.veh.clase === 'pesado' ? 2.3 : undefined });   /* 4.8: en primera persona, los ojos de quien maneja */
  Subt.paso(dtVisual || dt);
}

/* atropellar a alguien: queda tendido; sube la búsqueda y baja la confianza del barrio */
function atropellos() {
  const C = G.cuerpo; if (C.veh.clase === 'pie' || Math.abs(C.v) < 4) return;
  for (const p of G.E.peatones) if (!p._caido && Math.hypot(p.x - C.x, p.y - C.y) < (C.veh.ancho || 1.8) / 2 + .5) atropello(p);
}
function atropello(p) {
  const C = G.cuerpo; if (p) { p._caido = true; G.caidos.push({ x: p.x, y: p.y, a: C.a + Math.PI / 2, t: G.t, aspecto: p.aspecto }); }
  G.civiles++; G.rep.vecindarios = clamp((G.rep.vecindarios || 0) - 4, -100, 100); G.busq.alerta(16, { testigos: 2, causa: 'atropellaste a alguien' }); G.carro = Math.max(0, G.carro - .04); Snd.golpe(.6); G.camara.sacudir(.15);
  if (G.caidos.length > 12) G.caidos.shift();
}
/* casi choques a velocidad: llenan el turbo (como Reckless Getaway y #DRIVE) */
function casiChoques(C, trafico) {
  if (Math.abs(C.v) < 13 || C.veh.clase === 'pie') return; const an = C.veh.ancho || 1.8;
  for (const o of trafico) { const d = Math.hypot(o.x - C.x, o.y - C.y), c = (an + (o.ancho || 1.8)) / 2 + .25; if (d > c + .3 && d < c + 1.4 && (rozados.get(o) || -9) < G.t - 6) { rozados.set(o, G.t); G.nitro = Math.min(1, G.nitro + .14); G.ui.aviso('⚡ Casi choque · +turbo', 1100, 'casi'); MC._pausaImpacto = Math.max(MC._pausaImpacto || 0, .025); } }
}
/* lo que cuenta la búsqueda */
function eventoBusqueda(ev) {
  const C = G.cuerpo, U = G.ui, d = ev.x != null ? Math.hypot(ev.x - C.x, ev.y - C.y) : 0;
  if (ev.tipo === 'nivel') { if (ev.sube) U.aviso('🚨'.repeat(ev.nivel) + ' Nivel ' + ev.nivel + (ev.nivel === 3 ? ' · púas y retenes' : ev.nivel === 5 ? ' · helicóptero' : ''), 2000, 'nivel'); }
  else if (ev.tipo === 'perdidos') U.aviso('🕶️ Los perdiste', 2200, 'nivel');
  else if (ev.tipo === 'escondido') U.aviso('🅿️ Escondida: la policía te perdió', 2400, 'nivel');
  else if (ev.tipo === 'alerta' && ev.causa) U.aviso('+alerta: ' + ev.causa, 1800, 'alerta');
  else if (ev.tipo === 'abolladura') abollar(ev.zona, ev.fuerza);
  else if (ev.tipo === 'embestida') { Snd.golpe(ev.fuerza / 16); G.camara.sacudir(Math.min(.35, ev.fuerza * .025)); if (MC.Vida) MC.Vida.emitir('chispa', ev.x, ev.y, 10); if (ev.quien === 'rival' && ev.bando === 'banda' && (insultoT -= 1) <= 0) { insultoT = 4; Subt.decir([['camara', TC.INSULTOS_BANDA[(Math.random() * TC.INSULTOS_BANDA.length) | 0]]]); } }
  else if (ev.tipo === 'disparo') { Snd.disparo(d); }
  else if (ev.tipo === 'herido') { G.disparosRecibidos++; if (C.veh.clase === 'pie' || C.veh.clase === 'moto' || C.veh.clase === 'rueda') G.vida = Math.max(0, G.vida - .09); else G.vida = Math.max(0, G.vida - .025); $('#vineta').classList.add('herido'); clearTimeout(G._vt); G._vt = setTimeout(() => $('#vineta').classList.remove('herido'), 350); }
  else if (ev.tipo === 'fuera') { if (MC.Efectos) MC.Efectos.fuego(ev.x, ev.y, 1.4, { k: 1, alEstallar: f => { MC.Efectos.resto('carro', f.x, f.y, Math.random() * TAU); if (Math.hypot(G.cuerpo.x - f.x, G.cuerpo.y - f.y) < 60) G.camara.sacudir(.3); } }); G.destrozados++; U.aviso(ev.bando === 'banda' ? '💥 Una camioneta de la banda, fuera' : '💥 Patrulla destrozada', 1800, 'fuera'); Snd.golpe(1); G.humo.push({ x: ev.x, y: ev.y, t: 0 }); if (Math.random() < .5) Subt.decir([['mara', TC.INSULTOS_MARA[(Math.random() * TC.INSULTOS_MARA.length) | 0]]]); if (G.hist) Historia.fuera(ev); if (G.contrato) Contratos.fuera(ev); }
  else if (ev.tipo === 'pinchado') { U.aviso('💥 ¡Púas! Llantas pinchadas: arréglalas en un taller 🔧', 3000, 'puas'); Snd.golpe(.4); }
  else if (ev.tipo === 'puas') U.aviso('⚠️ Púas en la vía de adelante', 1500, 'puas');
  else if (ev.tipo === 'bloqueo') U.aviso('⚠️ Retén adelante: busca otra calle o embístelo de lado', 2200, 'puas');
  else if (ev.tipo === 'banda') U.aviso('🔫 La banda: ' + ev.n + ' camioneta' + (ev.n > 1 ? 's' : ''), 2000, 'banda');
}
/* esconderse: quieta un rato en un escondite o un taller, sin que nadie te vea */
let escT = 0;
function escondites(dt) {
  const B = G.busq, C = G.cuerpo; if (B.nivel === 0 || B.visto || Math.abs(C.v) > 2) { escT = 0; return; }
  const s = sitiosEspeciales().find(q => Math.hypot(q.x - C.x, q.y - C.y) < 16); if (!s) { escT = 0; return; }
  if (B.nivel > 3) { if (escT === 0) G.ui.aviso('🅿️ Con ' + B.nivel + ' sirenas no hay escondite que valga: baja la búsqueda', 2200, 'esc'); escT = .01; return; }
  escT += dt; if (escT > 3) { escT = 0; B.esconder('escondite'); }
}
/* eventos de la carretera (los de la historia: la banda y los retenes a cierta altura del tramo) */
/* las abolladuras por zona (se ven en el modelo 3D del carro): f frente, b atrás, l izquierda, r derecha */
/* 4.5 · el carro propio destrozado arde unos segundos y estalla: hay que bajarse (o salir disparado) */
function carroArde() {
  if (!MC.Efectos || G.ardiendo) return; const C = G.cuerpo; G.ardiendo = true; G.ui.aviso('🔥 ¡El carro se está quemando! Bájate ya', 3200, 'arde'); Snd.golpe(.4);
  MC.Efectos.fuego(C.x, C.y, 4.2, { sigue: C.veh.clase !== 'pie' ? C : null, k: 1.1, alEstallar: f => { G.ardiendo = false; const dentro = G.cuerpo.veh.clase !== 'pie' && Math.hypot(G.cuerpo.x - f.x, G.cuerpo.y - f.y) < 3; MC.Efectos.resto('carro', f.x, f.y, G.cuerpo.a);
    G.camara.sacudir(.45); Snd.golpe(1); if (dentro) { G.cuerpo.bajarse('explota'); G.vida = Math.max(.05, G.vida - .45); G.cuerpo.x += 4; } else { const d = Math.hypot(G.cuerpo.x - f.x, G.cuerpo.y - f.y); if (d < 8) G.vida = Math.max(.05, G.vida - (8 - d) * .04); } } });
}
function abollar(z, fuerza) { const D = G.danoZonas; if (!D || !(z in D)) return; D[z] = Math.min(1, D[z] + clamp(fuerza, 0, 30) * .028 / (VEH(G.veh).salud || 1));
  const tipo = { f: 'capo', b: 'baul', l: 'puerta_izq', r: 'puerta_der' }[z];
  if (D[z] >= .75 && !G.piezasSueltas[z] && G.piezasFisicas && G.cuerpo?.veh.clase !== 'pie') {
    G.piezasSueltas[z] = true; G.piezasFisicas.soltar(tipo, G.cuerpo);
  }
}
function reparaZonas() { Object.assign(G.danoZonas, { f: 0, b: 0, l: 0, r: 0 }); G.piezasSueltas = {}; if (G.piezasFisicas) G.piezasFisicas.limpiar(); }
/* Calle libre: lo que pasa en la carretera de la nada (al azar en cada viaje) */
function eventosCarreteraLibre() {
  const r = () => Math.random(), L = [];
  if (r() < .7) L.push({ f: .15 + r() * .15, banda: 1 + (r() < .4 ? 1 : 0), aviso: 'Una camioneta te sigue desde la última bomba de gasolina' });
  if (r() < .6) L.push({ f: .4 + r() * .15, heat: 2, aviso: 'Retén en la vía: alguien dio tu placa' });
  if (r() < .5) L.push({ f: .6 + r() * .1, pago: 120 + Math.round(r() * 200), aviso: 'Un camionero varado te paga por llevarle un repuesto a la siguiente parada' });
  if (r() < .35) L.push({ f: .8 + r() * .1, banda: 2, aviso: 'Emboscada en la curva: dos camionetas atravesadas' });
  return L.sort((a, b) => a.f - b.f);
}
function eventosRuta() {
  const c = G.M.carretera, f = clamp(G.cuerpo.y / c.largo, 0, 1), R = G.rutaEventos || [];
  for (let i = 0; i < R.length; i++) { const r = R[i]; if (G.rutaHecha[i] || f < r.f) continue; G.rutaHecha[i] = true; if (r.aviso) G.ui.aviso('⚠️ ' + r.aviso, 2600, 'ruta'); if (r.banda) G.busq.banda(r.banda); if (r.heat) G.busq.ponerNivel(Math.max(G.busq.nivel, r.heat)); if (r.pago) { G.dinero += r.pago; G.ui.aviso('💵 +' + plata(r.pago), 2000, 'plata'); } }
}

/* ---------- metro, cables, tranvía y Metroplús de Medellín (el horario y la línea reales) ---------- */
function estacionCerca(r = 45) {
  if (!G.transporte) return null; const C = G.cuerpo; let m = null, md = r;
  for (const L of G.transporte.lineas) { if (!/metro|cable|tram|brt/.test(L.clase)) continue; for (const s of L.est) { const p = L.T.at(s.s), d = Math.hypot(p.x - C.x, p.y - C.y); if (d < md) { md = d; m = { L, s, p }; } } }
  return m;
}
function menuTransporte() {
  const e = estacionCerca(); if (!e) return; const { L, s } = e, ico = { metro: '🚇', cable: '🚡', tram: '🚋', brt: '🚍' }[L.clase] || '🚇';
  G.ui.menu(ico + ' ' + L.nombre + ' · estás en ' + s.nombre, L.est.filter(q => q !== s).map(q => ({ id: q.nombre, texto: ico + ' ' + q.nombre + ' <small>' + Math.round(Math.abs(q.s - s.s) / 1000 * 10) / 10 + ' km</small>' })), id => {
    const q = L.est.find(z => z.nombre === id); if (!q) return; const C = G.cuerpo; if (C.veh.clase !== 'pie') C.bajarse('estación');
    G.viaje = { L, s0: s.s, s1: q.s, t: 0, dur: clamp(Math.abs(q.s - s.s) / 900, 4, 11), ico, de: s.nombre, a: q.nombre }; G.E._sinJugador = true; G.busq.esconder(L.clase === 'cable' ? 'metrocable' : 'metro');
    G.ui.aviso(ico + ' ' + L.nombre + ': de ' + s.nombre + ' a ' + q.nombre + '. Aquí no te siguen.', 3200, 'metro');
  });
}
function viajeTransporte(dt) {
  const V = G.viaje, C = G.cuerpo; V.t += dt; const f = clamp(V.t / V.dur, 0, 1), k = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2, s = V.s0 + (V.s1 - V.s0) * k, p = V.L.T.at(s);
  C.x = p.x; C.y = p.y; C.v = 0; G.camara.actualizar(dt, { x: p.x, y: p.y, z: G.M.cota(p.x, p.y) + 8, a: p.a, v: 14, zCuerpo: 0, zPaso: 0, mundo: G.M });
  $('#viaje').hidden = false; $('#viaje').innerHTML = V.ico + ' ' + V.L.nombre + '<small>' + V.de + ' → ' + V.a + ' · ' + Math.round(f * 100) + '%</small>';
  if (f >= 1) { const q = G.M.viaCercana(p.x, p.y, 120) || { x: p.x, y: p.y, ang: 0 }; C.x = q.x; C.y = q.y; C.a = q.ang; G.viaje = null; G.E._sinJugador = false; $('#viaje').hidden = true; G.ui.aviso('Bajaste en ' + V.a + '. Consigue un carro: roba uno 🚗 o toma una EnCicla 🚲', 3600, 'metro'); }
}
function enciclaCerca() { const E = G.M.transporte && G.M.transporte.encicla; if (!E) return null; const C = G.cuerpo; let m = null, md = 25; for (const s of E) { const d = Math.hypot(s.x - C.x, s.y - C.y); if (d < md) { md = d; m = s; } } return m; }
/* robar el carro del tráfico más cercano (estando a pie) */
function carroCerca() { const C = G.cuerpo; let m = null, md = 6; for (const a of G.trafico.agentes) { const d = Math.hypot(a.x - C.x, a.y - C.y); if (d < md && a.tipo !== 'buseta' && a.tipo !== 'bici') { md = d; m = a; } } return m; }
function robarCarro() {
  const a = carroCerca(), C = G.cuerpo; if (!a) return; const i = G.trafico.agentes.indexOf(a); if (i >= 0) G.trafico.agentes.splice(i, 1);
  const id = a.tipo === 'taxi' ? 'tc_mercury' : a.tipo === 'moto' ? 'tc_arrow' : 'tc_vega'; C.x = a.x; C.y = a.y; C.a = a.a; C.estacionado = null; G.veh = id; C.setVeh(id); G.carro = .85; G.busq.pinchado = false;
  G.busq.alerta(10, { testigos: 1.5, causa: 'robaste un carro' }); G.ui.aviso('🚗 Te llevaste el carro de alguien. «¡Ladrona!»', 2200, 'veh'); Snd.golpe(.2);
}

/* ---------- fallar y reintentar ---------- */
async function fallar(t, x) {
  G.pausa = true; Snd.sirenaVol(0); const i = await G.ui.dialogo(t, x + (G.hist ? '<br><br>Vuelves al último punto de la historia (pierdes el 10 % de la plata).' : ''), ['Reintentar']); G.pausa = false;
  G.dinero = Math.round(G.dinero * .9); G.carro = 1; G.vida = 1; G.cayo = false; G.busq.limpiar(); G.dron = null; if (G.lenteT > 0) { G.lenteT = 0; MC.estilo = G.estiloAntes || 'realista'; }   /* la Caja de custodia (T09) guarda las pruebas */
  if (G.hist) Historia.reintentar(); else { const s = sitiosEspeciales().find(q => q.taller) || null; if (s) { G.cuerpo.x = s.x; G.cuerpo.y = s.y; } if (G.cuerpo.veh.clase === 'pie') G.cuerpo.setVeh(G.veh); }
}
function guardarPosicion() { const C = G.cuerpo; if (!C) return; escribirG({ libre: G.modo === 'libre' ? { id: G.id, x: Math.round(C.x), y: Math.round(C.y), a: C.a, dinero: G.dinero, veh: G.veh, tengo: G.tengo } : leerG().libre }); }

/* ---------- el taller: reparar, pintar (la policía ya no reconoce el carro), llantas y otro carro ---------- */
function tallerCerca() { const C = G.cuerpo; return sitiosEspeciales().find(q => q.taller && Math.hypot(q.x - C.x, q.y - C.y) < 24) || null; }
function menuTaller() {
  const T = tallerCerca(); if (!T) return; const costo = Math.round((1 - G.carro) * 420), it = [];
  it.push({ id: 'rep', texto: '🔧 Reparar el carro · ' + (G.carro > .98 ? 'está bien' : plata(costo)) });
  if (G.busq.pinchado) it.push({ id: 'llantas', texto: '🛞 Llantas nuevas · ' + plata(60) });
  it.push({ id: 'pintar', texto: '🎨 Pintura nueva (te pierden si nadie te ve) · ' + plata(150) });
  it.push({ id: 'cura', texto: '🩹 Curarte · ' + plata(Math.round((1 - G.vida) * 200)) });
  for (const v of TC.VEHICULOS) it.push({ id: 'v:' + v.id, texto: v.icon + ' ' + v.n + ' · ' + (G.tengo.includes(v.id) ? (G.veh === v.id ? 'lo llevas' : 'tuyo') : plata(v.precio)) + '<br><small>' + v.d + '</small>' });
  G.ui.menu('🔧 ' + T.n + ' · ' + plata(G.dinero), it, id => {
    const pagar = c => { if (G.dinero < c) { G.ui.aviso('💸 No te alcanza: ' + plata(c)); return false; } G.dinero -= c; return true; };
    if (id === 'rep' && G.carro < .98 && pagar(costo)) { G.carro = 1; reparaZonas(); G.ui.aviso('🔧 Como nuevo: latas enderezadas'); }
    else if (id === 'llantas' && pagar(60)) { G.busq.pinchado = false; G.ui.aviso('🛞 Llantas nuevas'); }
    else if (id === 'pintar') { if (G.busq.visto) G.ui.aviso('👀 Te están viendo: así no sirve pintarlo'); else if (pagar(150)) { G.busq.esconder('pintura'); G.ui.aviso('🎨 Otro color, otra placa. La policía ya no lo reconoce'); } }
    else if (id === 'cura' && pagar(Math.round((1 - G.vida) * 200))) { G.vida = 1; G.ui.aviso('🩹 Puntos, gasa y aguardiente'); }
    else if (id.startsWith('v:')) { const v = VEH(id.slice(2)); if (G.tengo.includes(v.id) || pagar(v.precio)) cambiarVeh(v.id); }
  });
}

/* ---------- artefactos tácticos (ficción de juego; cifras de balance de Codex) ---------- */
const Artefactos = {
  /* T02 · Dron Cuervo: el carro se queda quieto; el dron vuela con el mismo joystick, hasta 70 m; marca a los rivales que ve */
  dron() {
    const A = TC.ARTEFACTOS.dron, C = G.cuerpo; if (G.dron) { G.dron = null; G.recarga.dron = A.recarga; G.ui.aviso('🛸 Dron de vuelta', 1200, 'dron'); return; }
    if (G.recarga.dron > 0) return G.ui.aviso('🛸 Cargando la batería: ' + Math.ceil(G.recarga.dron) + ' s', 1400, 'dron');
    G.dron = { x: C.x, y: C.y, z: 28, bat: A.dur, vistos: 0 }; G.ui.aviso('🛸 Dron Cuervo en el aire · 70 m · ' + A.dur + ' s', 1800, 'dron'); MC.emit('turno:dron', G.dron);
  },
  /* T05 · Cebo acústico */
  cebo() { if (G.cebos <= 0) return G.ui.aviso('📢 Sin cebos en este capítulo', 1400, 'cebo'); const C = G.cuerpo, d = 60, x = C.x + Math.cos(C.a + Math.PI) * d, y = C.y + Math.sin(C.a + Math.PI) * d; G.cebos--; G.busq.senuelo(x, y, TC.ARTEFACTOS.cebo.dur); G.ceboVis = { x, y, t: TC.ARTEFACTOS.cebo.dur }; for (const q of G.guardias) q.distraido = 9; G.ui.aviso('📢 Cebo acústico detrás de ti · quedan ' + G.cebos, 1800, 'cebo'); },
  /* T08 · Pulso de interferencia */
  pulso() { if (G.recarga.pulso > 0) return G.ui.aviso('📡 Recargando: ' + Math.ceil(G.recarga.pulso) + ' s', 1400, 'pulso'); const r = G.busq.pulso(G.cuerpo); if (!r) return G.ui.aviso('📡 Nada que apagar cerca', 1400, 'pulso'); G.recarga.pulso = TC.ARTEFACTOS.pulso.recarga; G.pulsoVis = { t: .5 }; G.ui.aviso(r === 'helicoptero' ? '📡 Reflector del helicóptero apagado' : '📡 Interceptor apagado 4 s', 1800, 'pulso'); },
  /* T01 · Lente espectral */
  lente() { if (G.lenteT > 0) return; if (G.recarga.lente > 0) return G.ui.aviso('👁️ Recargando: ' + Math.ceil(G.recarga.lente) + ' s', 1400, 'lente'); G.estiloAntes = MC.estilo; MC.estilo = 'termica'; G.lenteT = TC.ARTEFACTOS.lente.dur * (G.clima.lluvia > .3 ? .6 : 1); G.recarga.lente = TC.ARTEFACTOS.lente.recarga; G.ui.aviso('👁️ Lente espectral' + (G.clima.lluvia > .3 ? ' (la lluvia le quita detalle)' : ''), 1600, 'lente'); },
  /* disparar (munición limitada; a los vehículos) */
  disparar() {
    if (G.municion <= 0) return G.ui.aviso('🔫 Sin munición', 1200, 'bala'); const r = G.busq.disparar(G.cuerpo, { dano: .22 }); if (!r) return G.ui.aviso('🔫 Nadie a la vista', 900, 'bala');
    G.municion--; Snd.disparo(0); G.camara.sacudir(.05); if (r.acierto && MC.Vida) MC.Vida.emitir('chispa', r.x, r.y, 6); if (r.bando === 'policia') G.rep.cross = clamp((G.rep.cross || 0) - 3, -100, 100);
  }
};
function vueloDron(dt, ent) {
  const D = G.dron, C = G.cuerpo, A = TC.ARTEFACTOS.dron; C.actualizar(dt, { acel: -1, giro: 0, lluvia: G.clima.lluvia });
  const s = ent.stick, c = Math.cos(G.camara.yaw), sn = Math.sin(G.camara.yaw); if (s.m > .08) { D.x += (s.x * c + s.y * sn) * 20 * dt; D.y += (-s.x * sn + s.y * c) * 20 * dt; }
  const dx = D.x - C.x, dy = D.y - C.y, d = Math.hypot(dx, dy); if (d > A.alcance) { D.x = C.x + dx / d * A.alcance; D.y = C.y + dy / d * A.alcance; }
  D.bat -= dt; for (const r of G.busq.rivales) if (Math.hypot(r.cuerpo.x - D.x, r.cuerpo.y - D.y) < 55) { if (!(r.marcado > G.t)) D.vistos++; r.marcado = G.t + 30; }
  for (const q of G.guardias) if (Math.hypot(q.x - D.x, q.y - D.y) < 55) q.marcado = G.t + 60;
  G.camara.actualizar(dt, { x: D.x, y: D.y, z: G.M.cota(D.x, D.y) + D.z, a: G.camara.yaw, v: 6, zCuerpo: 0, zPaso: 0, mundo: G.M });
  if (D.bat <= 0) { G.dron = null; G.recarga.dron = A.recarga; G.ui.aviso('🛸 Batería agotada: el dron vuelve solo', 1800, 'dron'); }
}
