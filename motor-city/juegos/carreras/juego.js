/* =====================================================================
   MOTOR CITY · CARRERAS y EXTREMO (4.5) · los dos juegos que faltaban, sobre el manejo nuevo del motor
   - Mundo abierto primero: arrancas manejando por Guatapé (pueblo real, datos abiertos). Las carreras son banderas 🏁 en el
     mapa: llegas, cuenta regresiva y a correr. Nada te obliga.
   - CARRERAS: circuito por las calles del pueblo (2 vueltas, 3 rivales con IA que se adaptan a tu ritmo) y sprint hasta el
     malecón. Turbo, derrape con freno de mano, choques que deslizan, efectos (marcas, chispas, humo) y récords guardados.
   - EXTREMO (window.MODO_JUEGO = 'extremo'): bici de montaña cuesta abajo desde lo más alto de las vías del pueblo hasta el
     embalse; los saltos suman puntos por tiempo en el aire, los derrapes también. Contra el reloj y contra dos rivales.
   Todo del motor: MC.Mundo, MC.Cuerpo, MC.Manejo (rutaA, pilotar), MC.Vistas, MC.UI, MC.Efectos, MC.Trafico.
   ===================================================================== */
const { TAU, clamp, angDif } = MC, MODO = window.MODO_JUEGO || 'carreras', EXTREMO = MODO === 'extremo', GUARDA = 'motorcity.' + MODO + '.v1';
const leerG = () => { try { return JSON.parse(localStorage.getItem(GUARDA) || '{}'); } catch (e) { return {}; } }, escribirG = o => { try { localStorage.setItem(GUARDA, JSON.stringify(Object.assign(leerG(), o))); } catch (e) { /* sin guardado */ } };
const $ = s => document.querySelector(s), fmt = t => { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
let M = null;
async function abrir() {
  $('#estado').textContent = 'Abriendo Guatapé…'; await new Promise(r => setTimeout(r, 30));
  MC.ciudadBase = MC_CIUDAD_BASE; const cfg = Object.assign({}, MC_CIUDAD, { zonas: Object.assign({}, MC.ZONAS_BASE, MC_CIUDAD.zonas || {}) });
  M = await MC.Mundo.cargar(MC_MUNDO, cfg); $('#estado').textContent = 'Trazando las pistas…'; await new Promise(r => setTimeout(r, 30)); M.red('rueda'); MC.Terreno.agua(M);
  if (M.pvs == null && MC.PVS) M.pvs = MC.PVS.deElemento('guatape');
  $('#portada').hidden = true; jugar();
}
$('#jugar').onclick = abrir; $('#estado').textContent = 'Listo';

/* ---------- una pista: polilínea con largo acumulado ---------- */
class Pista {
  constructor(P, cerrada) { this.P = P; this.cerrada = cerrada; this.S = [0]; for (let i = 2; i < P.length; i += 2) this.S.push(this.S[this.S.length - 1] + Math.hypot(P[i] - P[i - 2], P[i + 1] - P[i - 1])); this.L = this.S[this.S.length - 1]; }
  punto(s) { s = this.cerrada ? ((s % this.L) + this.L) % this.L : clamp(s, 0, this.L); let i = 1; while (i < this.S.length - 1 && this.S[i] < s) i++; const k = (s - this.S[i - 1]) / Math.max(1e-6, this.S[i] - this.S[i - 1]), P = this.P; return { x: P[2 * i - 2] + (P[2 * i] - P[2 * i - 2]) * k, y: P[2 * i - 1] + (P[2 * i + 1] - P[2 * i - 1]) * k, a: Math.atan2(P[2 * i + 1] - P[2 * i - 1], P[2 * i] - P[2 * i - 2]) }; }
  /* la distancia recorrida más cercana a (x, y), buscando cerca de la anterior (no salta al otro lado de la pista) */
  proyectar(x, y, s0 = 0, ventana = 120) { let mejor = s0, md = 1e9; for (let s = s0 - 20; s <= s0 + ventana; s += 3) { const q = this.punto(s), d = Math.hypot(q.x - x, q.y - y); if (d < md) { md = d; mejor = s; } } return { s: mejor, d: md }; }
  plana(desde, largo) { const o = []; for (let s = desde; s <= desde + largo; s += 6) { const q = this.punto(s); o.push(q.x, q.y); } return o; }
}
function rutaPor(M, puntos, cerrar) {
  const o = []; for (let i = 0; i < puntos.length - (cerrar ? 0 : 1); i++) { const a = puntos[i], b = puntos[(i + 1) % puntos.length], r = MC.Manejo.rutaA(M, { x: a.x, y: a.y, a: 0 }, { x: b.x, y: b.y }, 'rueda'); if (!Array.isArray(r) || r.length < 4) continue; for (let j = o.length ? 2 : 0; j < r.length; j += 2) o.push(r[j], r[j + 1]); }
  return o;
}

function jugar() {
  const cv = $('#cv'), g = cv.getContext('2d', { alpha: false }), ui = MC.UI.crear(document.body, { tema: 'motorcity' }), dpr = Math.min(2, devicePixelRatio || 1);
  const centro = M.geoAMetros(6.2338, -75.1592), c0 = M.viaCercana(centro.x, centro.y, 400) || { x: centro.x, y: centro.y, ang: 0 };
  /* el vehículo: un GT diseñado en el taller (Carreras) o la bici de montaña (Extremo) */
  let vehId = 'mtb';
  if (!EXTREMO) { const d = MC.Taller.disenar({ id: 'gt_motorcity', n: 'GT Motor City', masa: 1250, potenciaKW: 160, parNm: 300, cd: .31, area: 2, mu: 1.05, tanqueL: 60, color: '#ff3b30' }); MC.Taller.registrar(d, { vmax: Math.min(d.vmax, 40) }); vehId = 'gt_motorcity'; }
  const reloj = new MC.Reloj({ vel: 1 }), clima = new MC.ClimaGlobal({ lat: 6.23, alt: M.cota(c0.x, c0.y) }), vistas = new MC.Vistas(M), camara = new MC.Camara({ zoom: Math.max(8, Math.min(16, Math.min(innerWidth, innerHeight) / 48)) * dpr, mundo: M });
  const cuerpo = new MC.Cuerpo(M, { x: c0.x, y: c0.y, a: c0.ang, veh: vehId }); cuerpo.clima = clima;
  const E = { mundo: M, camara, reloj, clima, transporte: null, jugador: { cuerpo, aspecto: { alto: 1.72, cPiel: '#c68a5e', cCamisa: '#ff3b30', cPantalon: '#1d2833', cPelo: '#16110d', cCasco: EXTREMO ? '#ffcc00' : null } }, t: 0, vehiculos: [], trafico: [], peatones: [], extras: [], cables: [], bloqueosEtiquetas: (w, h) => [[w - 84 * w / innerWidth, 0, w, h]] };
  const trafico = EXTREMO ? null : new MC.Trafico(M, { n: 8, peatones: 0, red: 'rueda', radio: 380 });
  const ctl = new MC.Controles(cv, { alGesto: q => { if (q.tipo !== 'toque') camara.gesto(q); } });
  ui.joystick(ctl, { texto: 'Arrastra para manejar' }); ui.minimapa(vistas);
  ui.accion({ id: 'freno', icono: '🛑', texto: EXTREMO ? 'Freno' : 'Freno de mano', mantener: true, ctl }); ui.accion({ id: 'turbo', icono: EXTREMO ? '🦘' : '⚡', texto: EXTREMO ? 'Saltar' : 'Turbo', mantener: true, ctl });
  const CAMS = EXTREMO ? ['tercera', 'cenital', 'ciudad3d', 'vuelo'] : ['cenital', 'ciudad3d', 'tercera', 'arcade']; let cam = leerG().cam || CAMS[0]; if (!CAMS.includes(cam)) cam = CAMS[0]; vistas.usar(cam, E);
  ui.boton({ id: 'camara', icono: '🎥', texto: 'Cámara', al: () => { cam = CAMS[(CAMS.indexOf(cam) + 1) % CAMS.length]; const v = vistas.usar(cam, E); escribirG({ cam }); ui.aviso(v.icon + ' ' + v.n, 1200, 'cam'); } });
  ui.boton({ id: 'mapa', icono: '🗺️', texto: 'Mapa', al: () => ui.abrirMapa(vistas, M, () => banderas.map(b => ({ x: b.x, y: b.y, color: '#ffcc00' })), { x: cuerpo.x, y: cuerpo.y, a: cuerpo.a }) });
  ui.boton({ id: 'records', icono: '🏆', texto: 'Récords', al: () => { const R = leerG().records || {}; ui.dialogo('🏆 Récords', Object.keys(R).length ? Object.entries(R).map(([k, v]) => '<b>' + k + '</b>: ' + fmt(v.t) + (v.pts ? ' · ' + v.pts + ' pts' : '')).join('<br>') : 'Todavía no hay. Ve a una bandera 🏁.', ['Listo']); } });
  /* ---------- las pistas y sus banderas ---------- */
  const banderas = [];
  if (!EXTREMO) {
    const pts = []; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, q = M.viaCercana(centro.x + Math.cos(a) * 330, centro.y + Math.sin(a) * 260, 160); if (q) pts.push(q); }
    const P1 = rutaPor(M, pts, true); if (P1.length > 40) { const p = new Pista(P1, true), q = p.punto(0); banderas.push({ id: 'Circuito de Guatapé', tipo: 'circuito', pista: p, vueltas: p.L > 2600 ? 1 : 2, x: q.x, y: q.y, a: q.a, rivales: 3 }); }
    const mal = M.viaCercana(...Object.values(M.geoAMetros(6.2318, -75.1617)), 300), ini = M.viaCercana(centro.x + 700, centro.y + 500, 400) || M.viaCercana(centro.x - 700, centro.y - 500, 400);
    if (mal && ini) { const P2 = rutaPor(M, [ini, mal], false); if (P2.length > 30) { const p = new Pista(P2, false), q = p.punto(0); banderas.push({ id: 'Sprint al malecón', tipo: 'sprint', pista: p, vueltas: 1, x: q.x, y: q.y, a: q.a, rivales: 3 }); } }
  } else {
    /* lo más alto y lo más bajo de las vías del pueblo: la bajada */
    let alto = null, bajo = null; for (const v of M.vias()) for (let i = 0; i < v.p.length; i += 8) { const x = v.p[i], y = v.p[i + 1]; if (Math.hypot(x - centro.x, y - centro.y) > 2400) continue; const z = M.cota(x, y); if (!alto || z > alto.z) alto = { x, y, z }; if (!bajo || z < bajo.z) bajo = { x, y, z }; }
    if (alto && bajo) { const P = rutaPor(M, [alto, bajo], false); if (P.length > 30) { const p = new Pista(P, false), q = p.punto(0); banderas.push({ id: 'Bajada a la represa', tipo: 'bajada', pista: p, vueltas: 1, x: q.x, y: q.y, a: q.a, rivales: 2, desnivel: Math.round(alto.z - bajo.z) }); } }
    const pts = []; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU, q = M.viaCercana(centro.x + Math.cos(a) * 240, centro.y + Math.sin(a) * 200, 140); if (q) pts.push(q); }
    const P3 = rutaPor(M, pts, true); if (P3.length > 40) { const p = new Pista(P3, true), q = p.punto(0); banderas.push({ id: 'Vuelta extrema al pueblo', tipo: 'circuito', pista: p, vueltas: 1, x: q.x, y: q.y, a: q.a, rivales: 2 }); }
  }
  E.extras.push({ x: 0, y: 0, dibujar(gg, pr, z) { for (const b of banderas) { if (carrera) continue; const [sx, sy] = pr(b.x, b.y, 0), s = Math.max(14, z * 2.4); gg.fillStyle = 'rgba(255,204,0,.25)'; gg.beginPath(); gg.arc(sx, sy, s * 1.6, 0, TAU); gg.fill(); gg.font = '900 ' + s + 'px system-ui'; gg.textAlign = 'center'; gg.fillText('🏁', sx, sy - s * .3); } } });
  /* ---------- la carrera ---------- */
  let carrera = null, cerca = null;
  const empezar = b => {
    const p = b.pista, q0 = p.punto(0), R = [], cvs = b.vueltas * p.L + (p.cerrada ? 0 : 0);
    Object.assign(cuerpo, { x: q0.x, y: q0.y, a: q0.a, v: 0 }); cuerpo.rumboRodado = q0.a;
    for (let k = 0; k < b.rivales; k++) { const off = (k + 1) * 7, q = p.punto(p.cerrada ? -off : 0), lado = (k % 2 ? 1 : -1) * 2.2, C = new MC.Cuerpo(M, { x: q.x - Math.sin(q.a) * lado - (p.cerrada ? 0 : Math.cos(q.a) * off), y: q.y + Math.cos(q.a) * lado - (p.cerrada ? 0 : Math.sin(q.a) * off), a: q.a, veh: EXTREMO ? 'mtb' : 'carro' }); C.ia = true;
      R.push({ nombre: ['Lucía «la Flecha»', 'el Mono Rendón', 'Kira Salazar'][k], color: ['#2f80ed', '#27ae60', '#f2c94c'][k], cuerpo: C, s: p.cerrada ? -off : 0, ruta: null, fin: null, habil: .9 + k * .05 }); }
    carrera = { b, p, rivales: R, yo: { s: 0, fin: null }, t: -3.5, total: cvs, aire: 0, puntos: 0, enAire: false, derrapeT: 0 };
    ui.aviso('🏁 ' + b.id + (b.vueltas > 1 ? ' · ' + b.vueltas + ' vueltas' : '') + (b.desnivel ? ' · ' + b.desnivel + ' m de bajada' : ''), 2400, 'carrera');
  };
  const terminar = (abandono) => {
    const c = carrera; if (!c) return; carrera = null; ui.ficha('pos', '').hidden = true; ui.ficha('vuelta', '').hidden = true; ui.ficha('crono', '').hidden = true; ui.ficha('pts', '').hidden = true;
    if (abandono) { ui.aviso('Saliste de la carrera', 1600); return; }
    const todos = [{ n: 'Tú', t: c.yo.fin, s: c.total }].concat(c.rivales.map(r => ({ n: r.nombre, t: r.fin, s: r.s }))).sort((a, b) => (a.t ?? 1e9) - (b.t ?? 1e9) || b.s - a.s), pos = todos.findIndex(x => x.n === 'Tú') + 1;
    const R = leerG().records || {}, prev = R[c.b.id], mejor = !prev || c.yo.fin < prev.t; if (mejor) { R[c.b.id] = { t: c.yo.fin, pts: EXTREMO ? Math.round(c.puntos) : 0 }; escribirG({ records: R }); }
    ui.dialogo(['🥇', '🥈', '🥉', '🏁'][Math.min(3, pos - 1)] + ' ' + c.b.id, 'Llegaste de <b>' + pos + '.º</b> en ' + fmt(c.yo.fin) + (EXTREMO ? ' · <b>' + Math.round(c.puntos) + ' puntos</b> de saltos y derrapes' : '') + (mejor ? '<br>⭐ ¡Récord nuevo!' : '<br>Récord: ' + fmt(prev.t)) + '<br><br>' + todos.map((x, i) => (i + 1) + '. ' + x.n + ' · ' + (x.t != null ? fmt(x.t) : 'sin llegar (' + Math.round(x.s / c.total * 100) + ' %)')).join('<br>'), ['Seguir manejando']);
  };
  /* ---------- ciclo ---------- */
  let t0 = performance.now(), hud = 0, W = 0, H = 0;
  const medir = () => { W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr); camara.pantalla = [W, H]; }; medir(); addEventListener('resize', medir);
  cuerpo.obstaculos = () => { const L = []; for (const v of E.trafico || []) L.push({ x: v.x, y: v.y, r: 1.2 }); if (carrera) for (const r of carrera.rivales) L.push({ x: r.cuerpo.x, y: r.cuerpo.y, r: EXTREMO ? .5 : 1.2 }); return L; };
  const cuadro = ahora => {
    requestAnimationFrame(cuadro); const dt = Math.min(.1, (ahora - t0) / 1000); t0 = ahora; E.t += dt; reloj.avanzar(dt); clima.actualizar(reloj, dt); E.cielo = MC.Cielo.en(reloj.fecha, reloj.hora, clima);
    const ent = ctl.leer(), V = cuerpo.veh, c = carrera, quieto = c && c.t < 0;
    const e = MC.Manejo.aplicar(ent, cuerpo, { camara, esquema: 'joystick', vista: vistas.actual.control === 'volante' ? 'volante' : 'mundo' });
    const freno = ctl.botones.has('freno'), boton2 = ctl.botones.has('turbo');
    if (freno) { const gira = (e.dir && Math.abs(angDif(cuerpo.a, Math.atan2(e.dir.y, e.dir.x))) > .25) || Math.abs(e.giro || 0) > .25; if (!EXTREMO && gira && Math.abs(cuerpo.v) > 7) { e.derrape = true; e.acel = Math.min(e.acel || 0, .3); } else { e.dir = null; e.acel = -1; } }
    if (EXTREMO) { e.salto = boton2 || ent.salto; e.turbo = false; } else e.turbo = boton2 || ent.turbo;
    if (quieto) { e.dir = null; e.acel = 0; cuerpo.v = 0; }
    cuerpo.actualizar(dt, e);
    camara.persecucion = c && !quieto ? .35 : 0; camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v, zCuerpo: cuerpo.z, zPaso: cuerpo.zPaso, mundo: M });
    if (trafico) E.trafico = trafico.paso(dt, cuerpo.x, cuerpo.y, reloj.seg, vistas.calidad);
    if (c) {
      c.t += dt; if (c.t < 0) { const n = Math.ceil(-c.t); if (n !== c._n) { c._n = n; ui.aviso(n <= 3 ? String(n) : '…', 700, 'cuenta'); } } else if (!c._ya) { c._ya = true; ui.aviso('¡YA!', 900, 'cuenta'); }
      /* el avance de cada uno sobre la pista */
      const pr = c.p.proyectar(cuerpo.x, cuerpo.y, c.yo.s % c.p.L), vueltaBase = Math.floor(c.yo.s / c.p.L) * c.p.L; let s = vueltaBase + pr.s; if (c.p.cerrada && s < c.yo.s - c.p.L * .5) s += c.p.L; if (s > c.yo.s && s - c.yo.s < 60) c.yo.s = s;
      if (pr.d > 90 && c.t > 0) { ui.aviso('Te saliste de la pista', 1500); terminar(true); return; }
      for (const r of c.rivales) {
        if (c.t >= 0 && r.fin == null) {
          if (!r.ruta || r.ruta._i > r.ruta.length - 30) { r.ruta = c.p.plana(r.s, 400); r.ruta._i = null; }
          /* se adaptan a tu ritmo (rubber band suave): si vas lejos atrás, aflojan; si vas adelante, aprietan */
          const gap = (c.yo.s - r.s) / 60; r.cuerpo.escala = clamp(r.habil + gap * .06, .78, 1.12) * (EXTREMO ? 1 : .92);
          MC.Manejo.pilotar(r.cuerpo, r.ruta, dt, { radio: 6 });
          const q = c.p.proyectar(r.cuerpo.x, r.cuerpo.y, r.s % c.p.L), b0 = Math.floor(r.s / c.p.L) * c.p.L; let s2 = b0 + q.s; if (c.p.cerrada && s2 < r.s - c.p.L * .5) s2 += c.p.L; if (s2 > r.s && s2 - r.s < 60) r.s = s2;
          if (r.s >= c.total - 4) r.fin = c.t;
        }
      }
      E.trafico = (E.trafico || []).concat(c.rivales.map(r => ({ id: r.nombre, tipo: EXTREMO ? 'bici' : 'carro', clase: 'auto', x: r.cuerpo.x, y: r.cuerpo.y, a: r.cuerpo.a, v: r.cuerpo.v, color: r.color, largo: EXTREMO ? 1.8 : 4.4, ancho: EXTREMO ? .6 : 1.8 })));
      /* Extremo: puntos por tiempo en el aire y por derrapar */
      if (EXTREMO && c.t > 0) { if (cuerpo.enAire) { c.aire += dt; c.enAire = true; } else if (c.enAire) { c.enAire = false; if (c.aire > .25) { const p = Math.round(c.aire * 100); c.puntos += p; ui.aviso('🦘 ¡Salto! +' + p, 900, 'salto'); MC.Vida && MC.Vida.onomatopeya && MC.Vida.onomatopeya(cuerpo.x, cuerpo.y, '¡WOW!', '#ffcc00'); } c.aire = 0; }
        if ((cuerpo.deslizamiento || 0) > .25 && Math.abs(cuerpo.v) > 5) c.puntos += dt * 30; }
      if (c.yo.fin == null && c.yo.s >= c.total - 4) { c.yo.fin = c.t; terminar(false); }
    } else { cerca = banderas.find(b => Math.hypot(b.x - cuerpo.x, b.y - cuerpo.y) < 14) || null; if (cerca && Math.abs(cuerpo.v) < 6 && !cerca._avisada) { cerca._avisada = true; ui.dialogo('🏁 ' + cerca.id, (cerca.tipo === 'circuito' ? cerca.vueltas + ' vuelta(s) por las calles de Guatapé' : cerca.tipo === 'bajada' ? 'Desde lo más alto hasta el embalse: ' + cerca.desnivel + ' m de bajada. Salta con 🦘 y derrapa para sumar puntos' : 'Hasta el malecón, por donde quieras… si te sales mucho, pierdes') + '. Rivales: ' + cerca.rivales + '.', ['¡A correr!', 'Ahora no']).then(i => { if (i === 0) empezar(cerca); }); } else if (!cerca) banderas.forEach(b => { if (Math.hypot(b.x - cuerpo.x, b.y - cuerpo.y) > 40) b._avisada = false; }); }
    vistas.dibujar(g, W, H, E, dt); ui.pintarJoystick();
    /* la flecha a la próxima parte de la pista (o a la bandera más cercana) */
    const obj = c ? c.p.punto(c.yo.s + 60) : banderas.slice().sort((a, b) => Math.hypot(a.x - cuerpo.x, a.y - cuerpo.y) - Math.hypot(b.x - cuerpo.x, b.y - cuerpo.y))[0];
    if (obj) { const sp = vistas.aPantalla(E, obj.x, obj.y, 0); if (sp) { const Z = ui.zonaLibre(), d2 = W / innerWidth; MC.UI.indicador(g, W, H, sp[0], sp[1], { texto: c ? '' : Math.round(Math.hypot(obj.x - cuerpo.x, obj.y - cuerpo.y)) + ' m', escala: dpr, t: E.t, rect: [Z.x0 * d2 + 20 * dpr, Z.y0 * d2 + 10 * dpr, Z.x1 * d2 - 20 * dpr, Z.y1 * d2] }); } }
    if ((hud -= dt) <= 0) { hud = .2; ui.velocidad(cuerpo.v);
      ui.pintarMinimapa(cuerpo.x, cuerpo.y, camara.yaw || 0, (c ? c.rivales.map(r => ({ x: r.cuerpo.x, y: r.cuerpo.y, color: r.color })) : banderas.map(b => ({ x: b.x, y: b.y, color: '#ffcc00' }))));
      if (c) { const pos = 1 + c.rivales.filter(r => (r.fin != null && c.yo.fin == null) || r.s > c.yo.s).length; ui.ficha('pos', '🏁 ' + pos + '.º de ' + (c.rivales.length + 1)).hidden = false; if (c.b.vueltas > 1) ui.ficha('vuelta', 'Vuelta ' + Math.min(c.b.vueltas, 1 + Math.floor(Math.max(0, c.yo.s) / c.p.L)) + ' de ' + c.b.vueltas).hidden = false; ui.ficha('crono', '⏱ ' + fmt(Math.max(0, c.t))).hidden = false; if (EXTREMO) ui.ficha('pts', '⭐ ' + Math.round(c.puntos)).hidden = false; }
      else ui.ficha('lugar', '📍 ' + (M.calle(cuerpo.x, cuerpo.y) || 'Guatapé'));
    }
  };
  requestAnimationFrame(cuadro);
  ui.aviso(EXTREMO ? '🚵 Extremo: anda libre por Guatapé. Las banderas 🏁 son las bajadas' : '🏎️ Motor City: maneja libre por Guatapé. Las banderas 🏁 son las carreras', 3600, 'bienvenida');
  window.CARRERAS = { M, cuerpo, banderas, empezar, get carrera() { return carrera; }, E };   /* para las pruebas */
}
