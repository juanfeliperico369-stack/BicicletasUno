/* =====================================================================
   TURNO CERO · dibujo, interfaz y planeta
   Lo que se pinta encima del mundo (vale para la cámara 3D y para el respaldo 2D: todo se proyecta con
   vistas.aPantalla): sirenas, disparos, púas, humo, helicóptero y su reflector, conos de visión de los guardias,
   el Dron Cuervo, el cebo, la gente tendida y la flecha al objetivo. El HUD sigue la biblia: objetivo y plata
   a la izquierda, la búsqueda en una cinta estrecha, el volante abajo y lo secundario en el menú.
   ===================================================================== */
/* G-H23 (Gemini y ChatGPT, unidas): conserva la mayúscula, separa singular y plural y cubre las variantes del guion */
const LENGUAJE_SUAVE = [
  [/hijueputas?/gi, m => /s$/i.test(m) ? 'desgraciados' : 'desgraciado'],
  [/malparid[oa]s?/gi, m => /s$/i.test(m) ? 'miserables' : 'miserable'],
  [/gonorreas?/gi, m => /s$/i.test(m) ? 'canallas' : 'canalla'],
  [/(?:güe|gue|hue)vones/gi, 'bobos'], [/(?:güe|gue|hue)v[oó]n/gi, 'bobo'],
  [/tombos?/gi, m => /s$/i.test(m) ? 'agentes' : 'agente'],
  [/mierdas?/gi, 'rayos'], [/jodid[oa]s?/gi, m => 'complicad' + m.slice(5).toLowerCase()],
  [/cabr[oó]n(?:es)?/gi, m => /es$/i.test(m) ? 'canallas' : 'canalla'], [/\bputas?\b/gi, 'pesados'],
  [/\bputos?\b/gi, 'pesados'], [/\bcarajo\b/gi, 'rayos'],
  [/\bcoño\b/gi, 'caramba'], [/\bel sapo\b/gi, 'el informante']
];
const suave = t => (leerG().suave ? LENGUAJE_SUAVE.reduce((s,[r,x]) => s.replace(r,m => { const v = typeof x === 'function' ? x(m) : x; return /^[A-ZÁÉÍÓÚÑÜ]/.test(m) ? v.charAt(0).toLocaleUpperCase('es') + v.slice(1) : v; }),String(t)) : String(t));
let hudT2 = 0, mapaPts = [];
function dibujar(dt) {
  const g = G.g, E = G.E, V = G.vistas, W = G.W, H = G.H; if (!E) return;
  if (!G.pausa && densidad) { densidad.activa = MC.opciones.densidad !== false; redensificar(densidad.medir(dt, V.actual.id)); }
  if (G.seguido) { const B = G.seguido.cuerpo; E.trafico = E.trafico.concat([{ id: 'contador', tipo: 'carro', clase: 'auto', x: B.x, y: B.y, a: B.a, v: B.v, largo: 4.9, ancho: 2, color: '#0d0d0f', modelo: 'vehiculo_suv', frena: 0 }]); }
  /* el dron policial (nivel 5) en 3D: el modelo de Codex, grande, a 32 m del suelo */
  { const Hh = G.busq.heli, i = G.modelos3d.findIndex(q => q.heli); if (Hh) { const q = i >= 0 ? G.modelos3d[i] : (G.modelos3d.push({ heli: true, id: 'tecnologia_drone', k: 4.2, z: 32, lejos: 600 }), G.modelos3d[G.modelos3d.length - 1]); q.x = Hh.x; q.y = Hh.y; q.a = Hh.a * .05; } else if (i >= 0) G.modelos3d.splice(i, 1); }
  for (const f of EXTRAS.trafico) E.trafico = E.trafico.concat(f());
  V.dibujar(g, W, H, E, dt);
  const es2D = V.efectiva().tipo === '2d'; if (es2D && !V.pixel && G.objetos) G.objetos.dibujar2D(g, (x, y, z) => V.aPantalla(E, x, y, z), G.camara.zoom, G.cuerpo, 140);
  try { capas(g, es2D); } catch (e) { MC.falla('capas', e); }
  G.ui.pintarJoystick(); MC.Telemetria.registro(V.ms, dt);
  if ((hudT2 -= dt) <= 0) { hudT2 = .25; hud(); }
}
/* píxeles por metro alrededor de un punto (para dibujar a escala en cualquier cámara) */
function escalaEn(x, y) { const a = G.vistas.aPantalla(G.E, x, y, 0), b = G.vistas.aPantalla(G.E, x + 1, y, 0); return a && b ? Math.max(.5, Math.hypot(b[0] - a[0], b[1] - a[1])) : 4; }
function capas(g, es2D) {
  const E = G.E, V = G.vistas, pr = (x, y, z = 0) => V.aPantalla(E, x, y, z), d = G.dEf || 1, t = G.t, B = G.busq;
  g.save();
  /* la gente tendida en el asfalto */
  for (const c of G.caidos) { const p = pr(c.x, c.y, .05); if (!p) continue; const k = escalaEn(c.x, c.y); g.save(); g.translate(p[0], p[1]); g.rotate(c.a); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 0, k * 1.0, k * .35, 0, 0, TAU); g.fill(); g.fillStyle = (c.aspecto && c.aspecto.cCamisa) || '#5a5a60'; g.fillRect(-k * .75, -k * .2, k * 1.2, k * .4); g.fillStyle = (c.aspecto && c.aspecto.cPiel) || '#c08a64'; g.beginPath(); g.arc(k * .6, 0, k * .17, 0, TAU); g.fill(); g.restore(); }
  /* C-M35 / Gemini: vista de respaldo de piezas desprendidas en Canvas 2D y Raster software. */
  if (es2D || (V.usaRaster && V.usaRaster())) {
    const partes = (G.piezasFisicas && G.piezasFisicas.lista) || [];
    for (const q of partes) {
      const base = G.M.cota(q.x, q.y), altura = Math.max(0, q.z - base),
        p = pr(q.x, q.y, altura), sombra = pr(q.x, q.y, .08);
      if (!p) continue;
      const k = Math.max(2,Math.min(26,escalaEn(q.x,q.y)));
      g.save();
      if (sombra) {g.fillStyle='rgba(5,8,11,.35)';g.beginPath();g.ellipse(sombra[0],sombra[1],k*.45,k*.17,0,0,TAU);g.fill();}
      g.translate(p[0],p[1]);g.rotate(q.a||0);
      const metal = q.tipo === 'rueda' ? '#252a30' : '#7b8792';
      g.fillStyle = metal;g.strokeStyle='#171d23';g.lineWidth=Math.max(1,d);
      g.fillRect(-k*.4,-k*.18,k*.8,k*.36);
      g.strokeRect(-k*.4,-k*.18,k*.8,k*.36);
      g.restore();
    }
    /* Humo discreto: no inventa fuego si el daño sólo está en el chasis. */
    const dz=G.danoZonas||{},cr=G.cuerpo;
    const dano=Math.max(dz.f||0,dz.b||0,dz.l||0,dz.r||0);
    if (cr && cr.veh && cr.veh.clase!=='pie' && dano>.62) {
      const k=Math.max(3,Math.min(18,escalaEn(cr.x,cr.y)));
      for(let n=0;n<3;n++){
        const f=(t*.42+n/3)%1,p=pr(cr.x+Math.cos(t+n)*f*.4,cr.y+Math.sin(t+n)*f*.4,1+3*f);
        if(!p)continue;
        g.fillStyle='rgba(38,42,48,'+((1-f)*.25)+')';
        g.beginPath();g.arc(p[0],p[1],k*(.3+f*.6),0,TAU);g.fill();
      }
    }
  }
  /* púas */
  for (const P of B.puas) { const ux = Math.cos(P.a) * P.largo / 2, uy = Math.sin(P.a) * P.largo / 2, a = pr(P.x - ux, P.y - uy, .05), b = pr(P.x + ux, P.y + uy, .05); if (!a || !b) continue; g.strokeStyle = '#141414'; g.lineWidth = 4 * d; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.strokeStyle = '#c9c9c9'; g.lineWidth = 1.5 * d; for (let i = 0; i <= 10; i++) { const f = i / 10, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f; g.beginPath(); g.moveTo(x, y - 3 * d); g.lineTo(x, y + 3 * d); g.stroke(); } }
  /* conos de visión de los guardias · 4.5, a la manera de Hunter Assassin (Ruby Games): una linterna amarilla que se corta en los
     muros (cada rayo llega hasta el primer edificio), naranja si busca algo, roja si te vio; «?» cuando oyó y «!» cuando alerta */
  for (const q of G.guardias) {
    if (q.fuera) continue; const fuerte = G.lenteT > 0 || q.marcado > t || (Historia.p && Historia.p.tipo === 'sigilo'), col = q.alerta > 0 ? '228,74,58' : q.distraido > 0 || q.busquedaT > 0 ? '240,150,60' : '255,214,102';
    const o = pr(q.x, q.y, .1); if (!o) continue;
    /* los rayos: se recalculan solo si el guardia se movió o giró (caché por guardia) */
    const cc = q._cono || (q._cono = { x: 1e9, y: 0, a: 0, v: 0, L: [] }); if (Math.hypot(cc.x - q.x, cc.y - q.y) > .4 || Math.abs(angDif(cc.a, q.a)) > .04 || cc.v !== q.vista) { cc.x = q.x; cc.y = q.y; cc.a = q.a; cc.v = q.vista; cc.L = [];
      for (let i = -10; i <= 10; i++) { const ang = q.a + q.cono * i / 10, ca = Math.cos(ang), sa = Math.sin(ang); let d = 1; for (; d < q.vista; d += 1) if (G.M.edificioEn(q.x + ca * d, q.y + sa * d, 0)) break; cc.L.push([ang, Math.min(q.vista, d)]); } }
    const pts = []; for (const [ang, d] of cc.L) { const p = pr(q.x + Math.cos(ang) * d, q.y + Math.sin(ang) * d, .1); if (p) pts.push(p); } if (pts.length < 3) continue;
    const R = Math.max(...pts.map(p => Math.hypot(p[0] - o[0], p[1] - o[1]))), gr = g.createRadialGradient(o[0], o[1], 0, o[0], o[1], R || 1); gr.addColorStop(0, 'rgba(' + col + ',' + (fuerte ? .5 : .2) + ')'); gr.addColorStop(.75, 'rgba(' + col + ',' + (fuerte ? .22 : .08) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(o[0], o[1]); for (const p of pts) g.lineTo(p[0], p[1]); g.closePath(); g.fill();
    if (fuerte) { g.strokeStyle = 'rgba(' + col + ',.55)'; g.lineWidth = 1.2 * d; g.beginPath(); g.moveTo(o[0], o[1]); g.lineTo(pts[0][0], pts[0][1]); g.moveTo(o[0], o[1]); g.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); g.stroke(); }
    if (es2D || fuerte) { const k = escalaEn(q.x, q.y); g.fillStyle = q.alerta > 0 ? '#c25542' : '#475563'; g.strokeStyle = '#111'; g.lineWidth = 1.5 * d; g.beginPath(); g.arc(o[0], o[1], Math.max(4 * d, k * .4), 0, TAU); g.fill(); g.stroke(); }
    const marca = q.alerta > 0 ? '!' : q.busquedaT > 0 || q.distraido > 0 ? '?' : ''; if (marca) { g.font = '900 ' + 18 * d + 'px system-ui'; g.textAlign = 'center'; g.lineWidth = 4 * d; g.strokeStyle = '#111'; g.strokeText(marca, o[0], o[1] - 14 * d); g.fillStyle = marca === '!' ? '#e44a3a' : '#f0963c'; g.fillText(marca, o[0], o[1] - 14 * d); }
  }
  /* humo de los destrozados */
  const humos = G.humo.slice(); for (const r of B.rivales) if (r.roto) humos.push({ x: r.cuerpo.x, y: r.cuerpo.y, t: r.humo });
  for (const h of humos) { for (let i = 0; i < 5; i++) { const f = ((t * .35 + i / 5) % 1), p = pr(h.x + Math.sin(i * 2.1 + t) * f * 2, h.y + Math.cos(i * 1.3) * f * 2, 1 + f * 9); if (!p) continue; const k = escalaEn(h.x, h.y); g.fillStyle = 'rgba(40,40,44,' + (.45 * (1 - f)) + ')'; g.beginPath(); g.arc(p[0], p[1], k * (.8 + f * 2.4), 0, TAU); g.fill(); } if (h.t < 6) { const p = pr(h.x, h.y, 1); if (p) { const k = escalaEn(h.x, h.y); g.fillStyle = 'rgba(255,140,40,' + (.5 + Math.sin(t * 20) * .2) + ')'; g.beginPath(); g.arc(p[0], p[1], k * .9, 0, TAU); g.fill(); } } }
  for (const h of G.humo) h.t += 1 / 60; G.humo = G.humo.filter(h => h.t < 30);
  /* sirenas: el destello rojo y azul que se ve de lejos */
  const f = Math.floor(t * 6) % 2;
  for (const v of E.trafico) { if (!v.sirena) continue; const p = pr(v.x, v.y, 1.8); if (!p) continue; const k = Math.max(3, escalaEn(v.x, v.y)); const gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], k * 3.5); gr.addColorStop(0, G.pocosDestellos ? (f ? 'rgba(255,40,40,.22)' : 'rgba(60,120,255,.22)') : f ? 'rgba(255,40,40,.75)' : 'rgba(60,120,255,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], k * 3.5, 0, TAU); g.fill(); }
  /* marcas: rivales vistos por el dron (a través de los muros) y la lente */
  for (const r of B.rivales) { if (r.roto || !(r.marcado > t || G.lenteT > 0)) continue; const p = pr(r.cuerpo.x, r.cuerpo.y, 3.5); if (!p) continue; g.strokeStyle = r.bando === 'banda' ? '#c25542' : '#4b9aab'; g.lineWidth = 2.5 * d; g.beginPath(); g.moveTo(p[0], p[1] - 9 * d); g.lineTo(p[0] + 7 * d, p[1]); g.lineTo(p[0], p[1] + 9 * d); g.lineTo(p[0] - 7 * d, p[1]); g.closePath(); g.stroke(); if (r.aturdido > 0) { g.fillStyle = '#4b9aab'; g.font = '800 ' + 11 * d + 'px system-ui'; g.textAlign = 'center'; g.fillText('📡', p[0], p[1] - 12 * d); } }
  /* disparos: la estela y el fogonazo */
  for (const s of B.disparos) { const a = pr(s.x0, s.y0, 1.3), b = pr(s.x1, s.y1, 1.1); if (!a || !b) continue; const al = 1 - s.t / .18; g.strokeStyle = s.bando === 'jugador' ? 'rgba(255,236,190,' + al + ')' : 'rgba(255,214,90,' + al + ')'; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); if (!G.pocosDestellos) { g.fillStyle = 'rgba(255,230,150,' + al + ')'; g.beginPath(); g.arc(a[0], a[1], 5 * d, 0, TAU); g.fill(); } if (s.acierto) { g.fillStyle = 'rgba(255,255,255,' + al + ')'; g.beginPath(); g.arc(b[0], b[1], 3 * d, 0, TAU); g.fill(); } }
  /* el cebo: anillos que laten */
  if (G.ceboVis) { G.ceboVis.t -= 1 / 60; const p = pr(G.ceboVis.x, G.ceboVis.y, .2); if (p) { const k = escalaEn(G.ceboVis.x, G.ceboVis.y); for (let i = 0; i < 3; i++) { const fr = (t * 1.2 + i / 3) % 1; g.strokeStyle = 'rgba(219,166,95,' + (1 - fr) + ')'; g.lineWidth = 2 * d; g.beginPath(); g.arc(p[0], p[1], k * (1 + fr * 12), 0, TAU); g.stroke(); } } if (G.ceboVis.t <= 0) G.ceboVis = null; }
  /* el helicóptero y su reflector */
  if (B.heli) { const Hh = B.heli, L = pr(Hh.lx, Hh.ly, 0), k = escalaEn(Hh.lx, Hh.ly); if (L && !(Hh.aturdido > 0)) { const gr = g.createRadialGradient(L[0], L[1], 0, L[0], L[1], k * 16); gr.addColorStop(0, 'rgba(255,250,215,.42)'); gr.addColorStop(.75, 'rgba(255,250,215,.18)'); gr.addColorStop(1, 'rgba(255,250,215,0)'); g.fillStyle = gr; g.beginPath(); g.arc(L[0], L[1], k * 16, 0, TAU); g.fill(); }
    const P = es2D ? pr(Hh.x, Hh.y, Hh.z) : null; if (P) { const kk = Math.max(6, escalaEn(Hh.x, Hh.y) * 1.2); g.fillStyle = '#1d2833'; g.beginPath(); g.ellipse(P[0], P[1], kk * 2.2, kk, 0, 0, TAU); g.fill(); g.fillRect(P[0] - kk * 4, P[1] - kk * .25, kk * 2.2, kk * .5); g.strokeStyle = 'rgba(200,200,200,.55)'; g.lineWidth = 2 * d; g.beginPath(); g.moveTo(P[0] + Math.cos(Hh.a) * kk * 4, P[1] + Math.sin(Hh.a) * kk * 1.4); g.lineTo(P[0] - Math.cos(Hh.a) * kk * 4, P[1] - Math.sin(Hh.a) * kk * 1.4); g.stroke(); g.fillStyle = f ? '#ff3030' : '#ffffff'; g.beginPath(); g.arc(P[0] - kk * 3.8, P[1], 2.5 * d, 0, TAU); g.fill(); } }
  /* el dron: la mira en el suelo y el alcance alrededor del carro */
  if (G.dron) { const D = G.dron, p = pr(D.x, D.y, 0), c = pr(G.cuerpo.x, G.cuerpo.y, 0), k = escalaEn(D.x, D.y); if (c) { g.strokeStyle = 'rgba(75,154,171,.5)'; g.setLineDash([6 * d, 6 * d]); g.lineWidth = 1.5 * d; g.beginPath(); g.arc(c[0], c[1], k * TC.ARTEFACTOS.dron.alcance, 0, TAU); g.stroke(); g.setLineDash([]); }
    if (p) { g.strokeStyle = '#4b9aab'; g.lineWidth = 2 * d; g.beginPath(); g.arc(p[0], p[1], k * 6, 0, TAU); g.moveTo(p[0] - k * 9, p[1]); g.lineTo(p[0] + k * 9, p[1]); g.moveTo(p[0], p[1] - k * 9); g.lineTo(p[0], p[1] + k * 9); g.stroke(); g.fillStyle = '#4b9aab'; g.font = '800 ' + 12 * d + 'px system-ui'; g.textAlign = 'center'; g.fillText('🛸 ' + Math.ceil(D.bat) + ' s', p[0], p[1] - k * 7 - 6 * d); } }
  if (G.pulsoVis) { G.pulsoVis.t -= 1 / 60; const p = pr(G.cuerpo.x, G.cuerpo.y, 1); if (p) { const fr = 1 - G.pulsoVis.t / .5, k = escalaEn(G.cuerpo.x, G.cuerpo.y); g.strokeStyle = 'rgba(75,154,171,' + (1 - fr) + ')'; g.lineWidth = 3 * d; g.beginPath(); g.arc(p[0], p[1], k * 65 * fr, 0, TAU); g.stroke(); } if (G.pulsoVis.t <= 0) G.pulsoVis = null; }
  g.restore();
  /* la flecha al objetivo: pin si se ve, flecha en el borde si no */
  for (const f of EXTRAS.capas) f(g, pr, d, t);
  const O = G.objetivo || G.destinoLibre; if (O && !G.dron && !G.cine) { const sp = pr(O.x, O.y, 0);   /* en 🎬 modo cine no hay flecha: guían las direccionales (57-cine.js) */ if (sp) { const Z = G.ui.zonaLibre(), d2 = G.W / innerWidth; MC.UI.indicador(g, G.W, G.H, sp[0], sp[1], { texto: Math.round(Math.hypot(O.x - G.cuerpo.x, O.y - G.cuerpo.y)) + ' m', escala: d, t, rect: [Z.x0 * d2 + 20 * d, Z.y0 * d2 + 10 * d, Z.x1 * d2 - 20 * d, Z.y1 * d2] }); } }
}

/* ---------- HUD ---------- */
const BOT = {};
function hud() {
  const U = G.ui, C = G.cuerpo, B = G.busq, M = G.M, V = C.veh, enCarro = V.clase !== 'pie' && V.clase !== 'rueda', tramo = !M.esCiudad, H = G.hist && TC.HISTORIA[Historia.cap];
  U.ficha('cap', G.hist ? 'Acto ' + H.acto + ' · ' + H.titulo : '🌎 Mundo abierto');
  U.ficha('plata', plata(G.dinero) + (G.municion ? ' · 🔫 ' + G.municion : ''));
  const banda = B.rivales.some(r => r.bando === 'banda' && !r.roto);
  U.ficha('heat', '🚨'.repeat(B.nivel) + '◦'.repeat(5 - B.nivel) + (banda ? ' · 🔫 banda' : '') + (B.visto ? ' · 👁' : B.nivel ? ' · buscando' : '')).hidden = !(B.nivel || banda);
  U.ficha('ev', '🧳 ' + G.evidencia).hidden = !G.hist;
  U.ficha('lugar', '📍 ' + (tramo ? planeta.def(G.id).nombre + ' · ' + MC.Planeta.BIOMAS[M.carretera.bioma(C.y)].n : (M.calle(C.x, C.y) || planeta.def(G.id).nombre))).hidden = B.nivel > 0;
  U.velocidad(C.v, (V.icon || '') + (C._din && MC.Dinamica.activa(C) ? ' <small>' + (C.marcha < 0 ? 'R' : C.marcha + 'ª') + '</small>' : ''));   /* 5.0: la marcha (manejo real) */ U.barra('carro', '🔧 Carro', enCarro ? G.carro : 1); U.barraVisible('carro', enCarro); U.barra('vida', '❤️ Vida', G.vida); U.barra('nitro', '⚡ Turbo', G.nitro); U.barraVisible('nitro', enCarro);
  /* el objetivo, con lo urgente primero */
  const O = G.objetivo, dist = O ? Math.round(Math.hypot(O.x - C.x, O.y - C.y)) : null;
  if (G.hist && Historia.p) { const p = Historia.p; U.mision('<b>' + suave(p.texto) + '</b><br>' + (dist != null ? '<b>' + (dist > 1500 ? (dist / 1000).toFixed(1) + ' km' : dist + ' m') + '</b>' : '') + (G.reloj_mision != null ? ' · ⏱ ' + Math.ceil(G.reloj_mision) + ' s' : '') + (p.tipo === 'destruir' ? ' · 💥 ' + Historia.est.fuera + '/' + p.n : '') + (O && O.texto ? ' · ' + O.texto : '')); }
  else if (G.contrato) U.mision('<b>📞 ' + G.contrato.c.n + '</b><br>' + (dist != null ? '<b>' + dist + ' m</b> · ' + (O.texto || '') : '💥 ' + G.contrato.fuera + '/' + (G.contrato.c.banda || 1)));
  else if (G.destinoLibre) { const D = G.destinoLibre, dd = Math.hypot(D.x - C.x, D.y - C.y); if (dd < 22) { G.destinoLibre = null; G.ui.aviso('📍 Llegaste' + (D.nombre ? ' a ' + D.nombre : ''), 2000, 'destino'); } U.mision('<b>📍 ' + (D.nombre || 'Tu destino') + '</b><br><b>' + (dd > 1500 ? (dd / 1000).toFixed(1) + ' km' : Math.round(dd) + ' m') + '</b> · en el 🗺️ mapa lo cambias'); }   /* 4.6: el destino que marcaste en el mapa */
  else U.mision('');
  /* el letrero de la carretera */
  const vj = $('#viaje'); if (!G.viaje) { if (tramo) { const c = M.carretera, falta = Math.max(0, c.largo - C.y); vj.hidden = false; vj.innerHTML = '➡ ' + planeta.vecino(G.id, 1).nombre + ' · ' + (falta / 1000).toFixed(1) + ' km<small>⬅ ' + planeta.vecino(G.id, -1).nombre + ' · ' + (C.y / 1000).toFixed(1) + ' km · ' + MC.Planeta.BIOMAS[c.bioma(C.y)].n + '</small>'; } else { const Q = planeta.puertas(G.id, M), q = [Q.siguiente, Q.anterior].find(z => Math.hypot(z.x - C.x, z.y - C.y) < 700); vj.hidden = !q; if (q) vj.innerHTML = (q === Q.siguiente ? '➡ ' + planeta.vecino(G.id, 1).nombre : '⬅ ' + planeta.vecino(G.id, -1).nombre) + '<small>Salida por ' + (q.nombre || 'la autopista') + ' · ' + Math.round(Math.hypot(q.x - C.x, q.y - C.y)) + ' m</small>'; } }
  /* botones según el momento */
  const vis = (k, v) => { if (BOT[k]) BOT[k].hidden = !v; };
  vis('taller', !!tallerCerca()); vis('metro', !!estacionCerca() && Math.abs(C.v) < 6); vis('encicla', V.clase === 'pie' && !!enciclaCerca());
  const agua = V.clase !== 'agua' && !!MC.Terreno.aguaHonda(M, C.x, C.y, 30, .8); vis('lancha', agua && Math.abs(C.v) < 5); vis('tierra', V.clase === 'agua' && !!MC.Terreno.tierraFirme(M, C.x, C.y, 16));
  vis('bajar', V.clase !== 'pie' && V.clase !== 'agua' && Math.abs(C.v) < 3); vis('robar', V.clase === 'pie' && !!carroCerca()); vis('montar', !!C.puedeMontar(4)); vis('foto', !!G.puedeFoto); vis('reducir', !!G.puedeReducir);
  /* 4.6.1 · ⏫ acelerador fijo: se ve en carro, moto o bici (y manejando el tren); a pie se esconde y se apaga. La primera vez, un aviso */
  { const puede = (V.clase !== 'pie' && !G.viaje && !G.dron) || !!G.controlExterno; if (G.botAcel) { G.botAcel.b.hidden = !puede; G.ui.capa.classList.toggle('con-alt', puede); if (!puede && G.acelFijo) ponerAcelerador(false, true); if (puede && !G._puedeAcel && G.flex && G.flex.acelFijo && !G.controlExterno) ponerAcelerador(true, true); G._puedeAcel = puede; }   /* 4.8 · ⚙️ «acelerador fijo al subir» */
    if (puede && !G.controlExterno && !G._acelAviso && !leerG().acelFijoVisto) { G._acelAviso = true; G.ui.aviso('⏫ Nuevo: toca ⏫ y el carro acelera solo; el joystick solo da la dirección. Tócalo otra vez para parar', 4200, 'acelNuevo'); } }
  vis('rapido', tramo && B.nivel === 0 && !banda); if (BOT.rapido) BOT.rapido.classList.toggle('on', G.rapido); if (!tramo || B.nivel || banda) G.rapido = false;
  vis('contratos', G.modo === 'libre' && !tramo); for (const f of EXTRAS.hud) f();
  /* artefactos: listo o cuánto falta */
  const AR = $('#artefactos'); if (AR) { const pon = (k, txt, ok) => { const b = AR.querySelector('[data-k="' + k + '"]'); if (b) { b.querySelector('small').textContent = txt; b.classList.toggle('off', !ok); } }; pon('dron', G.dron ? Math.ceil(G.dron.bat) + 's' : G.recarga.dron ? Math.ceil(G.recarga.dron) + 's' : 'T02', !G.recarga.dron); pon('cebo', '×' + G.cebos, G.cebos > 0); pon('pulso', G.recarga.pulso ? Math.ceil(G.recarga.pulso) + 's' : 'T08', !G.recarga.pulso); pon('lente', G.lenteT > 0 ? Math.ceil(G.lenteT) + 's' : G.recarga.lente ? Math.ceil(G.recarga.lente) + 's' : 'T01', !G.recarga.lente); pon('disparar', '×' + G.municion, G.municion > 0); AR.querySelector('[data-k="disparar"]').hidden = !G.municion; }
  /* minimapa: objetivo, escondites y talleres si te buscan, el Contador marcado, rivales vistos */
  const pts = []; if (O) pts.push({ x: O.x, y: O.y, color: '#dba65f' }); if (G.destinoLibre && G.destinoLibre !== O) pts.push({ x: G.destinoLibre.x, y: G.destinoLibre.y, color: '#ffc23a' }); for (const f of EXTRAS.mapa) f(pts);
  if (B.nivel) for (const s of sitiosEspeciales()) pts.push({ x: s.x, y: s.y, color: s.taller ? '#4b9aab' : '#7fc8a9' });
  for (const r of B.rivales) if (!r.roto && (r.marcado > G.t || r.ve)) pts.push({ x: r.cuerpo.x, y: r.cuerpo.y, color: r.bando === 'banda' ? '#c25542' : '#476e8a' });
  U.pintarMinimapa(C.x, C.y, G.camara.yaw, pts); mapaPts = pts;
  /* la sirena más cercana suena con Doppler (se acerca: más aguda; se aleja: más grave) y el motor sigue las rpm */
  let pol = null, dp = 160; for (const r of B.rivales) if (r.bando === 'policia' && !r.roto && !r.retirada) { const d = Math.hypot(r.cuerpo.x - C.x, r.cuerpo.y - C.y); if (d < dp) { dp = d; pol = r; } }
  if (pol) { const vr = G._dpol != null && G._polId === pol.id ? (dp - G._dpol) / .25 : 0; if (G._ocPolId !== pol.id || G.t - (G._ocT ?? -1e8) > .25) { G._ocluido = MC.PersecucionAudio.ocluido(G.M, C, pol.cuerpo); G._ocT = G.t; G._ocPolId = pol.id; } const p = MC.PersecucionAudio.plan({ distancia: dp, velocidadRadial: vr, ocluido: G._ocluido, interior: !!G.enInterior }); Snd.sirenaVol(p.volumen, p.corte); Snd.doppler(vr); G._dpol = dp; G._polId = pol.id; } else { Snd.sirenaVol(0); G._dpol = null; G._ocPolId = null; }
  Snd.motor(C.v, enCarro && G.carro > 0, G.ctl.botones.has('freno') ? -1 : 1);
  /* la música sigue la tensión (MC.Musica, compuesta en el momento) */
  if ((musT -= .25) <= 0 && Snd.on && Snd.ac) { musT = 20; const tension = clamp(B.nivel / 5 + (banda ? .4 : 0), 0, 1), A = MC.Musica.adaptar({ velocidad: Math.abs(C.v), hora: G.reloj.hora, clima: G.clima, tension }); if (!tocando || A.estilo !== G._estiloMus) { G._estiloMus = A.estilo; tocando = MC.Musica.tocar({ estilo: A.estilo, energia: A.energia, compases: 16 }); MC.Musica.volumen(.32); } }
}

/* ---------- el planeta entero (MC.Planeta.globo): se arrastra para girarlo ---------- */
const Globo = {
  lon0: null, inc: .32,
  abrir(desdeZoom) { const P = planeta.enGlobo(G.id, G.cuerpo.x, G.cuerpo.y); this.lon0 = P.lon; G.globo = true; G.pausa = true; $('#globo').hidden = false; const cv0 = $('#gcv'), cvGPU = $('#ggl'); cv0.classList.remove('llega'); cvGPU.classList.remove('llega'); void cv0.offsetWidth; cv0.classList.add('llega'); cvGPU.classList.add('llega'); if (desdeZoom) G.ui.aviso('🌍 Te alejaste hasta ver el planeta entero', 2200, 'globo'); const c = $('#gcv'); let x0 = null; c.onpointerdown = e => { x0 = e.clientX; c.setPointerCapture(e.pointerId); }; c.onpointermove = e => { if (x0 == null) return; this.lon0 -= (e.clientX - x0) * .35; x0 = e.clientX; }; c.onpointerup = () => { x0 = null; };
    const d = planeta.def(G.id), C = G.cuerpo, txt = d.tipo === 'tramo' ? 'Vas por la <b>' + d.nombre + '</b>, km ' + (C.y / 1000).toFixed(1) + ' de ' + (d.largo / 1000).toFixed(0) + ' · Sigue: <b>' + planeta.vecino(G.id, 1).nombre + '</b>' : 'Estás en <b>' + d.nombre + '</b> · Siguiente parada: <b>' + planeta.vecino(G.id, 1).nombre + '</b> · Anterior: ' + planeta.vecino(G.id, -1).nombre;
    $('#gInfo').innerHTML = txt + '<br><small>Un planeta: tres ciudades reales y kilómetros de nada entre ellas. Arrastra para girarlo.</small>'; },
  cerrar() { G.globo = false; G.pausa = false; $('#globo').hidden = true; }
};
function pintarGlobo(dt) {
  const c = $('#gcv'), d = Math.min(1.5, devicePixelRatio || 1), W = Math.round(innerWidth * d), H = Math.round(innerHeight * d);
  G.t += dt * .2; Globo.lon0 += dt * 2;
  if (!Globo.gpu) Globo.gpu = new MC.GloboGPU($('#ggl'), planeta.anillo);
  const jugador = planeta.enGlobo(G.id, G.cuerpo.x, G.cuerpo.y);
  const webgl = Globo.gpu.dibujar(W, H, { lon0: Globo.lon0, inc: Globo.inc, t: G.t, jugador });
  c.style.opacity = '1'; // GPU usa #gcv como capa de etiquetas transparente.
  if (webgl) {
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    const g = c.getContext('2d'); g.clearRect(0,0,W,H);
    const radio = Math.min(.68,(W/H)*.80)*H/2, incl = Globo.inc*Math.PI/180, lon0 = Globo.lon0*Math.PI/180;
    const ciudades = planeta.anillo.filter(l => l.tipo === 'ciudad');
    g.textAlign='left';g.font='700 '+Math.round(Math.max(12,Math.min(17,radio*.085)))+'px system-ui';
    for(const C of ciudades){
      const la=(C.lat || 0)*Math.PI/180,lo=C.lon*Math.PI/180-lon0,
        x=Math.cos(la)*Math.sin(lo),y=Math.sin(la),z=Math.cos(la)*Math.cos(lo),
        alto=y*Math.cos(incl)-z*Math.sin(incl),prof=y*Math.sin(incl)+z*Math.cos(incl);
      if(prof<=0)continue;
      const X=W/2+x*radio,Y=H/2-alto*radio;
      if(X<8 || X>W-8 || Y<8 || Y>H-8)continue;
      g.beginPath();g.fillStyle='#e8b875';g.arc(X,Y,Math.max(3,d*2.5),0,Math.PI*2);g.fill();
      g.shadowColor='#000';g.shadowBlur=5;g.fillStyle='#f1ece4';
      g.fillText(C.nombre, Math.max(8,Math.min(W-g.measureText(C.nombre).width-8,X+8)), Math.max(18,Math.min(H-16,Y+4)));
      g.shadowBlur=0;
    }
  } else {
    c.width = W; c.height = H;
    planeta.globo(c.getContext('2d'), W, H, { lon0: Globo.lon0, inclinacion: Globo.inc, t: G.t, yo: { id: G.id, x: G.cuerpo.x, y: G.cuerpo.y } });
  }
}
