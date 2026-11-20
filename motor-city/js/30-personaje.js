/* =====================================================================
   PERSONAJE ÚNICO · el mismo cuerpo para todos los juegos; cada juego lo viste a su estilo
   - Aspecto: piel, pelo, ropa, zapatos, casco y accesorios (une el creador de Juega EnCicla y el de El Metro).
   - Esqueleto: una pose (articulaciones en metros) para quieto, caminar, correr, pedalear, impulsarse,
     patinar, ir sobre una tabla o sentado; todas las vistas dibujan a partir de la misma pose.
   - Piel: MC.arte.registrar(juego, { personaje(g, pose, aspecto, vista, o) }) dibuja a su manera;
     si el juego no la trae, el motor dibuja la suya (lado, cenital y la de 3D en WebGL).
   ===================================================================== */
const PIELES = ['#f6d7c3', '#eac3a2', '#d9a77f', '#c18a63', '#9b6a47', '#74492f', '#4a2c1c', '#fbe3cf'];
const PELOS = ['#1b120c', '#3b2416', '#6b4226', '#a8743a', '#d9b26a', '#8c8c8c', '#e9e4da', '#b5332a', '#2b4f8c'];
const ROPA = ['#7ab800', '#2a5a92', '#c43a26', '#f2c400', '#1d1f24', '#e9eef3', '#743d90', '#e38835', '#1c5c9c', '#3d6b3a', '#ec407a', '#29b6f6'];
const PANTALONES = ['#2b3a55', '#1d1f24', '#5b4a3a', '#7d8696', '#3d6b3a', '#c9b38a'];
const ZAPATOS = ['#1d1f24', '#e9eef3', '#c43a26', '#2a5a92', '#8a5a35'];
const CASCOS = [null, '#ffffff', '#7ab800', '#1d1f24', '#c43a26', '#29b6f6', '#f2c400'];
const ASPECTO_BASE = { piel: 1, pelo: 0, peinado: 1, colPelo: 0, camisa: 0, manga: 0, pantalon: 0, zapatos: 0, casco: 1, gafas: 0, barba: 0, morral: 0, estatura: 1, contextura: 1, chaleco: 0 };
const Personaje = {
  PIELES, PELOS, ROPA, PANTALONES, ZAPATOS, CASCOS, ASPECTO_BASE,
  /* aspecto completo con colores (acepta índices o colores; lo que falta, por defecto) */
  aspecto(a = {}) {
    const A = MC.guardado.completar(a, ASPECTO_BASE), c = (L, v) => typeof v === 'string' ? v : L[v | 0] || L[0];
    return { ...A, cPiel: c(PIELES, A.piel), cPelo: c(PELOS, A.colPelo), cCamisa: c(ROPA, A.camisa), cPantalon: c(PANTALONES, A.pantalon), cZapatos: c(ZAPATOS, A.zapatos), cCasco: A.casco === 0 || A.casco === null ? null : c(CASCOS, A.casco), alto: 1.72 * (A.estatura || 1) };
  },
  /* un aspecto al azar (gente de la ciudad), siempre igual para la misma semilla */
  azar(semilla) { const r = mulberry32(semilla); return this.aspecto({ piel: r() * PIELES.length | 0, colPelo: r() * 6 | 0, peinado: r() * 6 | 0, camisa: r() * ROPA.length | 0, pantalon: r() * PANTALONES.length | 0, zapatos: r() * ZAPATOS.length | 0, casco: 0, gafas: r() < .15 ? 1 : 0, barba: r() < .2 ? 1 : 0, estatura: .9 + r() * .2 }); },
  /* ---------- pose: articulaciones en metros, de lado (x adelante, z arriba), con la cadera sobre el suelo ----------
     estado: 'quieto' | 'camina' | 'corre' | 'pedalea' | 'impulsa' | 'patina' | 'tabla' | 'sentado' | 'salta' | 'cae' | 'nada' | 'bucea'
     fase: ciclo del paso (rad) · v: velocidad (m/s) · alto: estatura (m) */
  pose(estado, fase = 0, o = {}) {
    const H = o.alto || 1.72, k = H / 1.72, s = Math.sin(fase), c = Math.cos(fase), J = {};
    const P = (x, z) => [x * k, z * k];
    let cad = [0, .95], inc = 0, pies = null;
    switch (estado) {
      case 'camina': { const a = .32; inc = .04; pies = [[s * a, Math.max(0, -c) * .08], [-s * a, Math.max(0, c) * .08]]; cad = [0, .95 - Math.abs(s) * .02]; break; }
      case 'corre': { const a = .55; inc = .18; pies = [[s * a, Math.max(0, -c) * .28], [-s * a, Math.max(0, c) * .28]]; cad = [.04, .98 + Math.abs(c) * .05]; break; }
      case 'pedalea': { cad = [-.12, 1.02]; inc = .55; const r = .17; pies = [[.12 + Math.cos(fase) * r, .32 + Math.sin(fase) * r], [.12 - Math.cos(fase) * r, .32 - Math.sin(fase) * r]]; break; }
      case 'impulsa': { cad = [0, .98]; inc = .12; const e = Math.max(0, s); pies = [[.05, .12], [-.1 - e * .45, .12 * (1 - e) + (s < 0 ? .06 : 0)]]; break; }
      case 'patina': { cad = [0, .9]; inc = .3; pies = [[s * .3, .06], [-s * .3, .06 + Math.max(0, c) * .05]]; break; }
      case 'tabla': { cad = [0, .88]; inc = .12; pies = [[.22, .1], [-.18, .1]]; break; }
      case 'sentado': { cad = [-.05, .62]; inc = .1; pies = [[.45, .12], [.4, .12]]; break; }
      case 'salta': { cad = [0, 1.0]; inc = .2; pies = [[.2, .55], [-.15, .5]]; break; }
      case 'cae': { cad = [0, .3]; inc = 1.3; pies = [[.6, .05], [.5, .1]]; break; }
      /* en el agua: el cuerpo casi horizontal, patada que alterna (crol) o que abre y cierra (bucear, como la rana) */
      case 'nada': { cad = [-.15, .5]; inc = 1.32; pies = [[-.95, .5 + s * .14], [-.95, .5 - s * .14]]; break; }
      case 'bucea': { cad = [-.1, .5]; inc = 1.45; pies = [[-.9 + Math.abs(s) * .15, .5 + .16 * c], [-.9 + Math.abs(s) * .15, .5 - .16 * c]]; break; }
      default: { pies = [[.08, 0], [-.08, 0]]; }
    }
    if (o.z) cad = [cad[0], cad[1] + o.z];
    const tronco = .52, cuello = .1, cab = .13;
    const pecho = [cad[0] + Math.sin(inc) * tronco, cad[1] + Math.cos(inc) * tronco], cabeza = [pecho[0] + Math.sin(inc * .7) * (cuello + cab), pecho[1] + Math.cos(inc * .7) * (cuello + cab)];
    const pie = (p) => [p[0], p[1] + (o.z || 0)], rod = (f, sg) => { const mx = (cad[0] + f[0]) / 2, mz = (cad[1] + f[1]) / 2, dx = f[0] - cad[0], dz = f[1] - cad[1], L = Math.hypot(dx, dz), m = .5, h = Math.sqrt(Math.max(0, m * m - (L / 2) ** 2)); return [mx - dz / L * h * sg, mz + dx / L * h * sg]; };
    const pI = pie(pies[0]), pD = pie(pies[1]);
    /* brazos: al manubrio si va en algo con manubrio; si no, se balancean al paso */
    let mI, mD;
    if (o.manubrio) { mI = mD = [o.manubrio[0], o.manubrio[1] + (o.z || 0)]; }
    else if (estado === 'nada') { mI = [pecho[0] + .1 + Math.cos(fase) * .5, pecho[1] + Math.sin(fase) * .35]; mD = [pecho[0] + .1 - Math.cos(fase) * .5, pecho[1] - Math.sin(fase) * .35]; }   // brazadas de crol
    else if (estado === 'bucea') { const e = (Math.sin(fase) + 1) / 2; mI = [pecho[0] + .55 - e * .5, pecho[1] + .18 * e]; mD = [pecho[0] + .55 - e * .5, pecho[1] - .18 * e]; }   // brazada de rana
    else { const b = estado === 'corre' ? .5 : estado === 'camina' ? .28 : estado === 'patina' ? .4 : .08; mI = [pecho[0] - s * b, pecho[1] - .5 + Math.abs(s) * .05]; mD = [pecho[0] + s * b, pecho[1] - .5 + Math.abs(c) * .05]; if (estado === 'corre') { mI[1] += .12; mD[1] += .12; } }
    const codo = (m, sg) => { const mx = (pecho[0] + m[0]) / 2, mz = (pecho[1] + m[1]) / 2, dx = m[0] - pecho[0], dz = m[1] - pecho[1], L = Math.hypot(dx, dz) || 1, a = .3, h = Math.sqrt(Math.max(0, a * a - (L / 2) ** 2)); return [mx + dz / L * h * sg, mz - dx / L * h * sg]; };
    Object.assign(J, { cadera: P(...cad), pecho: P(...pecho), cabeza: P(...cabeza), pieI: P(...pI), pieD: P(...pD), rodI: P(...rod(pI, 1)), rodD: P(...rod(pD, 1)), manoI: P(...mI), manoD: P(...mD), codoI: P(...codo(mI, -1)), codoD: P(...codo(mD, -1)), inc, estado, fase, radioCabeza: cab * k });
    return J;
  },
  /* el estado del cuerpo según el vehículo y la velocidad */
  estadoPara(veh, v, enAire) {
    if (enAire) return 'salta'; const C = veh && veh.cuerpo; if (C === 'sentado') return 'sentado';
    if (!veh || veh.id === 'pie') return v > 3.2 ? 'corre' : v > .25 ? 'camina' : 'quieto';
    if (C === 'pedalea') return 'pedalea'; if (C === 'tabla') return v > .5 && v < 3 ? 'impulsa' : 'tabla'; if (C === 'patina') return 'patina'; if (C === 'impulsa') return v < 4 && v > .3 ? 'impulsa' : 'tabla';
    return 'quieto';
  }
};

/* ---------- dibujo de lado (panorámica, plataformas y postales) del motor ----------
   g: Canvas 2D · x,y: punto del suelo en pantalla · esc: px por metro · dir: 1 mira a la derecha */
MC.arte.pieles.motor.personajeLado = function (g, J, A, x, y, esc, dir = 1) {
  const X = p => x + p[0] * esc * dir, Y = p => y - p[1] * esc, lw = Math.max(1.2, esc * .11);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const seg = (a, b, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(X(a), Y(a)); g.lineTo(X(b), Y(b)); g.stroke(); };
  const lejos = tono(A.cPantalon, -.25), cerca = A.cPantalon;
  seg(J.cadera, J.rodD, lejos, lw * 1.25); seg(J.rodD, J.pieD, lejos, lw * 1.1); seg(J.codoD, J.manoD, tono(A.cPiel, -.2), lw * .8); seg(J.pecho, J.codoD, tono(A.cCamisa, -.25), lw);
  g.fillStyle = A.cZapatos; g.fillRect(X(J.pieD) - (dir < 0 ? lw * 1.6 : 0), Y(J.pieD) - lw * .5, lw * 1.6, lw * .9);
  seg(J.cadera, J.pecho, A.cCamisa, lw * 2.3);
  if (A.morral) { g.fillStyle = tono(A.cCamisa, -.35); const mx = (X(J.cadera) + X(J.pecho)) / 2 - dir * lw * 1.4, my = (Y(J.cadera) + Y(J.pecho)) / 2; g.fillRect(mx - lw, my - lw * 1.6, lw * 2, lw * 3); }
  if (A.chaleco) { g.strokeStyle = '#7ab800'; g.lineWidth = lw * 1.4; g.beginPath(); g.moveTo(X(J.cadera), Y(J.cadera) - lw); g.lineTo(X(J.pecho), Y(J.pecho) + lw); g.stroke(); }
  seg(J.cadera, J.rodI, cerca, lw * 1.25); seg(J.rodI, J.pieI, cerca, lw * 1.1);
  g.fillStyle = A.cZapatos; g.fillRect(X(J.pieI) - (dir < 0 ? lw * 1.6 : 0), Y(J.pieI) - lw * .5, lw * 1.6, lw * .9);
  seg(J.pecho, J.codoI, A.cCamisa, lw); seg(J.codoI, J.manoI, A.manga ? A.cCamisa : A.cPiel, lw * .8);
  const r = J.radioCabeza * esc, cx = X(J.cabeza), cy = Y(J.cabeza);
  g.fillStyle = A.cPiel; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  if (A.cCasco) { g.fillStyle = A.cCasco; g.beginPath(); g.arc(cx, cy - r * .1, r * 1.08, Math.PI, 0); g.fill(); g.fillRect(cx - r * 1.08, cy - r * .2, r * 2.16, r * .25); }
  else { g.fillStyle = A.cPelo; g.beginPath(); if (dir > 0) g.arc(cx - r * .1, cy - r * .15, r, Math.PI * .85, Math.PI * 1.95); else g.arc(cx + r * .1, cy - r * .15, r, Math.PI * 1.05, Math.PI * 2.15); g.fill(); }
  g.fillStyle = '#141414'; g.fillRect(cx + dir * r * .45 - .5, cy - r * .15, Math.max(1, r * .18), Math.max(1, r * .18));
  if (A.gafas) { g.strokeStyle = '#141414'; g.lineWidth = Math.max(1, r * .12); g.beginPath(); g.moveTo(cx, cy - r * .1); g.lineTo(cx + dir * r * .95, cy - r * .1); g.stroke(); }
};
/* ---------- dibujo cenital (visto desde arriba) del motor: hombros, cabeza y casco ---------- */
MC.arte.pieles.motor.personajeArriba = function (g, J, A, x, y, esc, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const r = Math.max(1.5, .22 * esc), paso = Math.sin((J.fase || 0)) * .25 * esc;
  if (J.estado === 'camina' || J.estado === 'corre') { g.fillStyle = A.cPantalon; g.fillRect(paso - r * .4, -r * .9, r * .8, r * .55); g.fillRect(-paso - r * .4, r * .35, r * .8, r * .55); }
  g.fillStyle = A.cCamisa; g.beginPath(); g.ellipse(0, 0, r * .75, r * 1.25, 0, 0, TAU); g.fill();
  g.fillStyle = A.cCasco || A.cPelo; g.beginPath(); g.arc(r * .1, 0, r * .62, 0, TAU); g.fill();
  g.restore();
};
Object.assign(MC, { Personaje });
