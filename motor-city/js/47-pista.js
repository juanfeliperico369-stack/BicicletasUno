/* =====================================================================
   47 · MC.Pista · CARRERAS RETRO PSEUDO‑3D (renacimiento cenital, Fase 4 · Claude, 25‑nov‑2026)
   La técnica clásica de las carreteras por segmentos, escrita desde cero (sala limpia: el código abierto de otros se leyó, no se copió):
   - LA PISTA: segmentos de 200 de largo, cada uno con p1 y p2 (mundo «m», cámara «c» y pantalla «s»), su curva, la banda de color
     (asfalto, pianos, berma y líneas alternan cada 3 segmentos), sus objetos al lado de la vía, los carros que van en él y su «clip».
     Colinas cosenoidales (y = y0 + (y1 − y0)·(1 − cos πt)/2) y curvas acumuladas (x += dx; dx += curva) con fuerza centrífuga.
   - LA PROYECCIÓN: d = 1/tan(FOV/2), s = d/(z − camZ), X = W/2 + k·s·(x − camX), Y = yh − k·s·(y − camY). En horizontal k = W/2 y
     yh = H/2 (la fórmula clásica); en vertical (412 × 860) se usa la misma k en los dos ejes y el horizonte un poco más arriba, porque
     con H/2 en el eje vertical la imagen quedaría estirada al doble. Se ven 280 segmentos.
   - DOS PASADAS: 1) de cerca a lejos con maxY: descarta lo que está detrás de la cámara o de una cresta, recorta cada segmento contra
     maxY (no se pinta nada dos veces), guarda seg.clip = maxY y pone niebla en los últimos 45. Las franjas se juntan por color y nivel
     de niebla: unas decenas de rellenos por cuadro (MC.Arcade pinta unas mil figuras). 2) De lejos a cerca: los objetos y los rivales,
     recortados abajo contra seg.clip (un carro detrás de una cresta no se asoma por debajo de ella).
   - MÁS: paralaje de 3 capas (cielo, montañas del Valle y horizonte urbano) que se mueve con curva·velocidad y con la altura de la
     cámara; el carro con 6 estados (recto, giro suave y giro brusco, en plano y en subida), vibración en la berma, chispas y humo al
     derrapar; rebufo detrás de un rival (menos arrastre y carga el nitro); nitro con FOV de 100° a 116°, líneas de velocidad y una
     sacudida corta; rivales con IA de carril y adelantamiento suave; HUD (posición, vuelta, tiempo, velocidad, nitro y minimapa) y
     controles táctiles en las esquinas (fuera de la zona libre del centro). Todo el arte es procedural.
   - DOS CIRCUITOS: «palmas» (Subida a Las Palmas: subida larga, curvas encadenadas, lomas y la bajada por Escobero) y «regional»
     (Autopista Regional nocturna: alta velocidad, puentes y arcos sobre la vía y la silueta de la ciudad).
   MC.Arcade (47-clasicos.js) se queda para la calle real; esto es para circuitos.
   Uso sin pantalla (pruebas): const P = MC.Pista.crear('palmas'), S = MC.Pista.carrera(P, { vueltas: 2 }); MC.Pista.paso(S, 1 / 60, MC.Pista.bot(S));
     MC.Pista.dibujar(g, W, H, S) · MC.Pista.simular('regional', { vueltas: 2 }) · MC.Pista.perfil(P).
   El juego completo: MC.Pista.entrar({ circuito, lienzo, capa, vueltas, rivales, alSalir(resultado) }) → { S, salir }.
   ===================================================================== */
const Pista = (() => {
  const SEG = 200, ANCHO = 2000, CAMH = 1000, VISTA = 280, NIEBLA = 45, BANDA = 3, CARRILES = 3, CARRO_W = 620, CARRO_L = 1500, PASO = 1 / 120;
  const M_POR_U = .003;   /* metros por unidad: un segmento son 0,6 m, la vía mide 12 m y un carro 4,5 m */
  const cl = (v, a, b) => v < a ? a : v > b ? b : v, mez = (a, b, t) => a + (b - a) * t, suave = t => t * t * (3 - 2 * t);
  const azar = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const css = v => 'rgb(' + (v[0] | 0) + ',' + (v[1] | 0) + ',' + (v[2] | 0) + ')';
  const mezC = (a, b, t) => [mez(a[0], b[0], t), mez(a[1], b[1], t), mez(a[2], b[2], t)];

  /* ---------- los dos circuitos: tramos [segmentos, curva, subida (unidades), objetos] ---------- */
  const CIRCUITOS = {
    palmas: {
      nombre: 'Subida a Las Palmas', lugar: 'Medellín · vía Las Palmas', noche: false, vmax: 11000, rivales: ['Lucía «la Flecha»', 'el Mono Rendón', 'Kira Salazar', 'Toño Ceballos', 'la Mona Gil'],
      colores: { cielo: ['#5d9be0', '#f3c58f'], pasto: ['#3f8a3a', '#367d33'], berma: ['#8b7f6a', '#7d725f'], piano: ['#e8e4dc', '#c0392b'], asfalto: ['#6b6b6e', '#636366'], linea: '#f1efe8', niebla: '#cfd9e3' },
      paralaje: 'valle', obj: 'montana',
      tramos: [[140, 0, 0, 'salida'], [160, 2, 1600], [110, -3, 1400], [110, 3, 1400], [90, 0, 2600, 'pinos'], [90, 0, -1400], [100, 4, 1500, 'baranda'], [100, -4, 1500, 'baranda'], [110, 5, 1700, 'baranda'],
        [170, 0, 900, 'mirador'], [230, -3, 2400, 'pinos'], [70, 0, 2200], [70, 0, -2200], [130, 6.5, 1500, 'baranda'], [110, 0, 300, 'alto'], [210, -2, -6200, 'pinos'], [160, 4, -5200, 'baranda'],
        [150, -3.5, -4200, 'baranda'], [130, 0, -3000, 'casas'], [120, 2.5, 'cierre', 'casas'], [120, 0, 0, 'salida']]
    },
    regional: {
      nombre: 'Autopista Regional nocturna', lugar: 'Medellín · Regional, junto al río', noche: true, vmax: 14500, rivales: ['la Negra Úsuga', 'Pipe «Turbo» Arango', 'Kira Salazar', 'el Paisa Montoya', 'Vale Restrepo'],
      colores: { cielo: ['#06091a', '#28305a'], pasto: ['#12201c', '#0f1b18'], berma: ['#2b2b31', '#26262b'], piano: ['#c9c9cf', '#a4262c'], asfalto: ['#2e3036', '#2a2c32'], linea: '#e9e2b8', niebla: '#1b2140' },
      paralaje: 'ciudad', obj: 'autopista',
      tramos: [[160, 0, 0, 'salida'], [260, 1.2, 400, 'postes'], [220, 0, 600, 'arcos'], [200, -1.6, -300, 'postes'], [160, 0, 1800, 'puente'], [160, 0, -1800, 'puente'], [260, 2, 0, 'postes'],
        [240, 0, 0, 'arcos'], [220, -2.2, 500, 'postes'], [180, 0, 1400, 'puente'], [180, 0, -1400, 'postes'], [280, 1.6, 'cierre', 'arcos'], [140, 0, 0, 'salida']]
    }
  };

  /* ---------- armar la pista ---------- */
  function crear(id) { const D = CIRCUITOS[id]; if (!D) throw new Error('MC.Pista: no conozco el circuito ' + id); return crearDe(D, id); }
  /* una pista a partir de su definición (las pruebas arman las suyas: una loma con cresta, por ejemplo) */
  function crearDe(D, id = D.id || 'pista') {
    D = Object.assign({ nombre: id, lugar: '', noche: false, vmax: 12000, rivales: ['Rival'], obj: 'montana', paralaje: 'valle' }, D);
    D.colores = Object.assign({}, CIRCUITOS.palmas.colores, D.colores || {});
    const segs = [], rnd = azar(hashTexto(id)); let y = 0;
    const totalSube = D.tramos.reduce((a, t) => a + (typeof t[2] === 'number' ? t[2] : 0), 0);
    for (const [n, curva, dy0, tema] of D.tramos) {
      const dy = dy0 === 'cierre' ? -totalSube : dy0, y0 = y;
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n, e = Math.min(suave(cl(t1 / .3, 0, 1)), suave(cl((1 - t0) / .3, 0, 1)));   /* la curva entra y sale suave */
        const ya = y0 + dy * (1 - Math.cos(Math.PI * t0)) / 2, yb = y0 + dy * (1 - Math.cos(Math.PI * t1)) / 2, k = segs.length;
        segs.push({ i: k, p1: { m: { y: ya, z: k * SEG }, c: { x: 0, y: 0, z: 0 }, s: { x: 0, y: 0, w: 0, e: 0 } }, p2: { m: { y: yb, z: (k + 1) * SEG }, c: { x: 0, y: 0, z: 0 }, s: { x: 0, y: 0, w: 0, e: 0 } },
          curva: curva * e, banda: Math.floor(k / BANDA) % 2, obj: [], carros: [], clip: 0, niebla: 0, tema: tema || '' });
      }
      y = y0 + dy;
    }
    const P = { id, D, segs, N: segs.length, L: segs.length * SEG, vmax: D.vmax, colores: D.colores };
    poblar(P, rnd); P.mapa = minimapa(P); P.paleta = paleta(D.colores);
    return P;
  }
  function hashTexto(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619); return h >>> 0; }
  /* los objetos al lado de la vía, según el tema de cada tramo */
  function poblar(P, rnd) {
    const S = P.segs, monte = P.D.obj === 'montana';
    const pon = (i, tipo, x, op = {}) => { const s = S[((i % P.N) + P.N) % P.N]; s.obj.push(Object.assign({ tipo, x, esc: 1 }, op)); };
    for (let i = 0; i < P.N; i++) {
      const t = S[i].tema, c = S[i].curva;
      if (monte) {
        if (i % 7 === 0) { pon(i, rnd() < .55 ? 'pino' : 'arbol', -1.7 - rnd() * 1.6, { esc: .8 + rnd() * .6 }); }
        if (i % 9 === 4) { pon(i, rnd() < .5 ? 'pino' : 'arbol', 1.7 + rnd() * 1.8, { esc: .8 + rnd() * .6 }); }
        if (t === 'pinos' && i % 4 === 2) pon(i, 'pino', (rnd() < .5 ? -1 : 1) * (2.2 + rnd() * 2.5), { esc: .9 + rnd() * .7 });
        if (t === 'baranda') S[i].baranda = c >= 0 ? -1 : 1;   /* la baranda va por fuera de la curva, continua (se dibuja con la vía) */
        if (Math.abs(c) > 2.5 && i % 20 === 0) pon(i, 'senal', c > 0 ? -1.35 : 1.35, { dir: Math.sign(c) });
        if (t === 'mirador' && i % 30 === 5) pon(i, 'mirador', 1.6);
        if (t === 'casas' && i % 16 === 3) pon(i, 'casa', (rnd() < .5 ? -1 : 1) * (2 + rnd() * 1.5), { color: ['#e8d7b0', '#d9a066', '#f0efe8', '#c9d6c2'][(rnd() * 4) | 0] });
        if (t === 'alto' && i % 25 === 0) pon(i, 'roca', (rnd() < .5 ? -1 : 1) * (1.6 + rnd()), { esc: .7 + rnd() * .5 });
        if (i % 37 === 11) pon(i, 'roca', (rnd() < .5 ? -1 : 1) * (1.8 + rnd() * 2), { esc: .5 + rnd() * .5 });
      } else {
        if (i % 12 === 0) { pon(i, 'poste', -1.3); pon(i, 'poste', 1.3, { espejo: true }); }
        if (t === 'arcos' && i % 70 === 30) pon(i, 'arco', 0, { color: ['#2f80ed', '#e84a5f', '#27ae60', '#f2c94c'][(i / 70 | 0) % 4] });
        if (t === 'puente' && i % 160 === 80) pon(i, 'puente', 0);
        if (i % 26 === 9) pon(i, 'torre', (rnd() < .5 ? -1 : 1) * (3.6 + rnd() * 4), { esc: .8 + rnd() * .9, ventanas: 1 + (rnd() * 4 | 0) });
        if (i % 50 === 25) pon(i, 'valla', rnd() < .5 ? -1.9 : 1.9, { color: ['#2f80ed', '#e84a5f', '#f2994a'][(rnd() * 3) | 0] });
        if (Math.abs(c) > 1.4 && i % 24 === 0) pon(i, 'senal', c > 0 ? -1.35 : 1.35, { dir: Math.sign(c) });
      }
    }
    S[2].obj.push({ tipo: 'meta', x: 0, esc: 1 });   /* el arco de la meta, una sola vez */
  }
  /* el minimapa: rumbo = suma de las curvas, cerrado repartiendo la diferencia */
  function minimapa(P) {
    /* el giro de cada curva es proporcional a lo que curva (540° en total) y lo que falta para dar una vuelta (360°) se reparte parejo */
    const n = P.N, xs = new Float32Array(n + 1), ys = new Float32Array(n + 1); let a = 0, x = 0, y = 0, suma = 0; const tot = P.segs.reduce((s, q) => s + Math.abs(q.curva), 0) || 1, kk = 3 * Math.PI / tot;
    for (const q of P.segs) suma += q.curva; const del = ((suma >= 0 ? 1 : -1) * TAU_ - kk * suma) / n;
    for (let i = 0; i < n; i++) { a += P.segs[i].curva * kk + del; x += Math.cos(a); y += Math.sin(a); xs[i + 1] = x; ys[i + 1] = y; }
    for (let i = 0; i <= n; i++) { xs[i] -= x * i / n; ys[i] -= y * i / n; }
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i <= n; i++) { x0 = Math.min(x0, xs[i]); x1 = Math.max(x1, xs[i]); y0 = Math.min(y0, ys[i]); y1 = Math.max(y1, ys[i]); }
    const e = 1 / Math.max(x1 - x0, y1 - y0, 1); for (let i = 0; i <= n; i++) { xs[i] = (xs[i] - (x0 + x1) / 2) * e; ys[i] = (ys[i] - (y0 + y1) / 2) * e; }
    return { xs, ys };
  }
  const TAU_ = Math.PI * 2;
  /* los colores ya mezclados con la niebla, en 6 niveles (así las franjas se juntan por color) */
  function paleta(C) {
    const nb = hex(C.niebla), out = {};
    for (const k of ['pasto', 'berma', 'piano', 'asfalto']) out[k] = C[k].map(c => { const v = hex(c), L = []; for (let f = 0; f < 6; f++) L.push(css(mezC(v, nb, f / 6))); return L; });
    const lv = hex(C.linea); out.linea = []; for (let f = 0; f < 6; f++) out.linea.push(css(mezC(lv, nb, f / 6)));
    out.niebla = C.niebla; return out;
  }
  /* el perfil (para las pruebas): curvas, desplazamiento acumulado y alturas */
  function perfil(P) {
    const n = P.N, curva = new Float64Array(n), x = new Float64Array(n + 1), y = new Float64Array(n + 1); let dx = 0;
    for (let i = 0; i < n; i++) { const q = P.segs[i]; curva[i] = q.curva; x[i + 1] = x[i] + dx; dx += q.curva; y[i] = q.p1.m.y; } y[n] = P.segs[n - 1].p2.m.y;
    let saltoCurva = 0, saltoAlto = 0; for (let i = 1; i < n; i++) { saltoCurva = Math.max(saltoCurva, Math.abs(curva[i] - curva[i - 1])); saltoAlto = Math.max(saltoAlto, Math.abs(P.segs[i].p1.m.y - P.segs[i - 1].p2.m.y)); }
    return { curva, x, y, saltoCurva, saltoAlto, cierreAlto: Math.abs(P.segs[n - 1].p2.m.y - P.segs[0].p1.m.y), largo_m: P.L * M_POR_U };
  }

  /* ---------- la carrera (sin pantalla) ---------- */
  function carrera(P, op = {}) {
    const nR = op.rivales == null ? 5 : op.rivales, R = [], rnd = azar(hashTexto(P.id + ':' + (op.semilla || 1)));
    const colores = ['#2f80ed', '#27ae60', '#f2c94c', '#9b51e0', '#eb5757', '#56ccf2'];
    /* la parrilla, detrás de la línea (vuelta −1: al cruzarla empieza la primera): los rivales adelante y tú de último */
    for (let k = 0; k < nR; k++) R.push({ nombre: P.D.rivales[k % P.D.rivales.length], color: colores[k % colores.length], z: P.L - (3 + k * 9) * SEG, x: (k % 2 ? .5 : -.5), xObj: (k % 2 ? .5 : -.5), v: 0, habil: .86 + k * .025 + rnd() * .02, vuelta: -1, fin: null, tCarril: 0, rival: true });
    const jug = { nombre: op.nombre || 'Tú', color: op.color || '#d0202a', z: P.L - (3 + nR * 9) * SEG, x: nR % 2 ? .5 : -.5, v: 0, vuelta: -1, fin: null, nitro: .5, nitroT: 0, vueltas: [], mejor: null, rebufo: false, derrape: 0, berma: 0, choque: 0, subida: 0, giro: 0, fov: 100, sacude: 0, rival: false };
    return { P, t: -3, vueltas: op.vueltas || 2, jug, rivales: R, todos: [jug].concat(R), ev: [], fin: false, acc: 0, offs: [0, 0, 0], part: [], stats: { cuadros: 0 } };
  }
  const segDe = (P, z) => P.segs[(Math.floor(z / SEG) % P.N + P.N) % P.N];
  const total = c => c.vuelta * 1e9 + c.z;   /* para ordenar: vueltas y luego distancia */
  function posicion(S, c) { const L = S.P.L, d = c.fin != null ? 1e15 - c.fin : c.vuelta * L + c.z; let p = 1; for (const o of S.todos) { if (o === c) continue; const e = o.fin != null ? 1e15 - o.fin : o.vuelta * L + o.z; if (e > d) p++; } return p; }
  /* un paso de la simulación; ent = { giro: -1..1, gas, freno, nitro } */
  function paso(S, dt, ent = {}) {
    S.acc += dt; let n = 0;
    while (S.acc >= PASO && n < 30) { pasoFijo(S, PASO, ent); S.acc -= PASO; n++; }
    if (n >= 30) S.acc = 0;
    return S;
  }
  function pasoFijo(S, dt, ent) {
    const P = S.P, J = S.jug, vmax = P.vmax; S.t += dt;
    if (S.t < 0) { J.v = 0; for (const r of S.rivales) r.v = 0; return; }
    if (J.fin == null) {
      const sg = segDe(P, J.z), f = (J.z % SEG) / SEG, sp = J.v / vmax, nitroOn = J.nitroT > 0, top = vmax * (nitroOn ? 1.32 : 1) * (J.rebufo ? 1.04 : 1);
      J.subida = (sg.p2.m.y - sg.p1.m.y) / SEG;
      /* aceleración, frenos y arrastre (más en el pasto); el rebufo baja el arrastre */
      if (ent.gas || nitroOn) J.v += vmax * (nitroOn ? .62 : .42) * (1 - .55 * sp) * dt; else if (ent.freno) J.v -= vmax * 1.1 * dt; else J.v -= vmax * (J.rebufo ? .1 : .18) * dt;
      if (ent.freno && (ent.gas || nitroOn)) J.v -= vmax * .9 * dt;
      J.v -= J.subida * vmax * .36 * dt;   /* la loma frena un poco y la bajada empuja */
      const fuera = Math.abs(J.x) > 1; if (fuera && J.v > vmax * .32) J.v -= vmax * (Math.abs(J.x) > 1.32 ? 1.4 : .7) * dt;
      J.v = cl(J.v, 0, top);
      /* dirección y fuerza centrífuga (la curva te saca hacia afuera) */
      const g = cl(ent.giro || 0, -1, 1); J.giro = mez(J.giro, g, cl(dt * 10, 0, 1));
      J.x += J.giro * 2.4 * Math.min(1, sp * 1.6) * dt - .42 * sg.curva * sp * sp * dt;
      J.derrape = Math.abs(sg.curva) > 2.5 && Math.abs(J.giro) > .7 && sp > .72 ? Math.min(1, J.derrape + dt * 3) : Math.max(0, J.derrape - dt * 4);
      if (J.derrape > .5) { J.v -= vmax * .05 * dt; J.nitro = Math.min(1, J.nitro + .08 * dt); }
      J.berma = Math.abs(J.x) > .92 && Math.abs(J.x) < 1.32 && sp > .1 ? 1 : 0; J.x = cl(J.x, -2.6, 2.6);
      /* choques con lo de la orilla */
      if (Math.abs(J.x) > 1.05) for (const o of sg.obj) { const w = ANCHO_OBJ[o.tipo]; if (!w || o.tipo === 'arco' || o.tipo === 'puente' || o.tipo === 'meta') continue; if (Math.abs(J.x - o.x) < (w * o.esc / ANCHO) / 2 + CARRO_W / ANCHO / 2) { J.v *= .35; J.x = cl(J.x * .82, -2.6, 2.6); J.choque = .6; S.ev.push({ k: 'choque', con: o.tipo }); break; } }
      /* nitro */
      if (ent.nitro && J.nitro > .2 && J.nitroT <= 0) { J.nitroT = 2.4 * J.nitro; J.nitro = 0; J.sacude = .35; S.ev.push({ k: 'nitro' }); }
      if (J.nitroT > 0) J.nitroT = Math.max(0, J.nitroT - dt);
      J.fov = mez(J.fov, nitroOn ? 116 : 100, cl(dt * 4, 0, 1)); J.sacude = Math.max(0, J.sacude - dt); J.choque = Math.max(0, J.choque - dt);
      J.nitro = Math.min(1, J.nitro + .025 * dt);
      avanzar(S, J, J.v * dt);
    } else { J.v = Math.max(0, J.v - vmax * .3 * dt); J.z += J.v * dt; if (J.z >= P.L) J.z -= P.L; }
    /* los rivales: su carril, su velocidad en las curvas y un adelantamiento suave */
    for (const r of S.rivales) {
      const sg = segDe(P, r.z), adelante = curvaAdelante(P, r.z, 60), mio = vmax * r.habil * (1 - Math.min(.32, Math.max(0, adelante - 3.2) * .09));
      const dif = (S.jug.vuelta * P.L + S.jug.z) - (r.vuelta * P.L + r.z), goma = cl(dif / (P.L * .25), -1, 1) * .05;   /* un poco de goma: ni muy lejos ni muy cerca */
      const obj = r.fin != null ? mio * .5 : mio * (1 + goma);
      r.v += cl(obj - r.v, -vmax * .9 * dt, vmax * .38 * dt); r.v = Math.max(0, r.v);
      r.tCarril -= dt;
      if (r.tCarril <= 0) {
        const lento = S.todos.find(o => o !== r && o.z > r.z && o.z - r.z < 26 * SEG && Math.abs(o.x - r.xObj) < .45 && o.v < r.v * .99);
        if (lento) { const op = [-.62, 0, .62].filter(x => Math.abs(x - r.xObj) > .3 && !S.todos.some(o => o !== r && Math.abs(o.z - r.z) < 12 * SEG && Math.abs(o.x - x) < .4)); if (op.length) { r.xObj = op.sort((a, b) => Math.abs(a - r.x) - Math.abs(b - r.x))[0]; r.tCarril = 1.6; } }
        else r.tCarril = .4;
      }
      r.x += cl(r.xObj - r.x, -.75 * dt, .75 * dt);   /* sin saltos: va hacia su carril a 0,75 por segundo */
      avanzar(S, r, r.v * dt);
    }
    /* rebufo y choques entre carros */
    J.rebufo = false;
    for (const r of S.rivales) {
      let dz = r.z - J.z; if (dz < -P.L / 2) dz += P.L; else if (dz > P.L / 2) dz -= P.L;
      const dx = (r.x - J.x) * ANCHO;
      if (dz > CARRO_L * .6 && dz < 15 * SEG && Math.abs(dx) < CARRO_W * .7 && J.v > vmax * .5) { J.rebufo = true; J.nitro = Math.min(1, J.nitro + .14 * PASO); }
      if (Math.abs(dz) < CARRO_L * .9 && Math.abs(dx) < CARRO_W * .95) {
        if (dz > 0 && J.v > r.v) { J.v = r.v * .92; S.ev.push({ k: 'toque', con: r.nombre }); }
        else if (dz < 0 && r.v > J.v) r.v = J.v * .95;
        const emp = Math.sign(dx || 1) * .9 * PASO; r.x += emp; J.x -= emp * .6;
      }
    }
    if (J.fin != null && !S.fin) { S.fin = true; S.ev.push({ k: 'fin', pos: posicion(S, J) }); }
  }
  /* la curva más fuerte de los próximos n segmentos */
  function curvaAdelante(P, z, n) { const i0 = Math.floor(z / SEG); let m = 0; for (let k = 0; k < n; k += 3) m = Math.max(m, Math.abs(P.segs[(i0 + k) % P.N].curva)); return m; }
  function avanzar(S, c, dz) {
    const P = S.P; c.z += dz;
    while (c.z >= P.L) {
      c.z -= P.L; c.vuelta++;
      if (!c.rival && c.vuelta >= 1) { const tv = S.t - (c.vueltas.reduce((a, b) => a + b, 0)); c.vueltas.push(tv); if (c.mejor == null || tv < c.mejor) c.mejor = tv; S.ev.push({ k: 'vuelta', n: c.vuelta, t: tv }); }
      if (c.vuelta >= S.vueltas && c.fin == null) { c.fin = S.t; if (!c.rival) c.pos = posicion(S, c); }
    }
  }
  /* el piloto automático (para las pruebas y para la demostración): carril libre, contra la curva, frena antes de las horquillas */
  function bot(S) {
    const P = S.P, J = S.jug, sg = segDe(P, J.z), vmax = P.vmax, sp = J.v / vmax, ad = curvaAdelante(P, J.z, 70);
    let obj = J._carril ?? 0; const delante = S.rivales.filter(r => { let dz = r.z - J.z; if (dz < 0) dz += P.L; return dz > 0 && dz < 32 * SEG; });
    if (delante.some(r => Math.abs(r.x - obj) < .45)) { const libres = [-.62, 0, .62].filter(x => !delante.some(r => Math.abs(r.x - x) < .45)); if (libres.length) obj = libres.sort((a, b) => Math.abs(a - J.x) - Math.abs(b - J.x))[0]; }
    J._carril = obj;
    const contra = .42 * sg.curva * sp * sp / (2.4 * Math.max(.2, Math.min(1, sp * 1.6)));
    const giro = cl((obj - J.x) * 2.2 + contra, -1, 1), vSegura = vmax * Math.min(1.25, Math.sqrt(2.4 * .8 / (.42 * Math.max(.1, ad))));
    return { giro, gas: J.v < vSegura, freno: J.v > vSegura * 1.08, nitro: ad < 1.5 && J.nitro > .6 && J.nitroT <= 0 };
  }
  /* una carrera entera sin pantalla, con el bot */
  function simular(id, op = {}) {
    const P = typeof id === 'string' ? crear(id) : id, S = carrera(P, op), dt = op.dt || 1 / 60, tope = op.tope || 600; let t = 0;
    while (!S.fin && t < tope) { paso(S, dt, bot(S)); t += dt; S.ev.length = 0; }
    const J = S.jug; return { circuito: P.id, terminado: J.fin != null, tiempo: J.fin, posicion: J.fin != null ? J.pos : posicion(S, J), vueltas: J.vueltas.slice(), mejorVuelta: J.mejor, largo_m: Math.round(P.L * M_POR_U), rivales: S.rivales.map(r => ({ nombre: r.nombre, vuelta: r.vuelta, fin: r.fin })) };
  }

  /* ---------- el dibujo ---------- */
  /* el alto de cada objeto (unidades del mundo), para no dibujar lo que una cresta tapa entero */
  const ALTO_OBJ = { pino: 2600, arbol: 2200, roca: 600, baranda: 260, senal: 900, mirador: 500, casa: 1300, poste: 3000, valla: 1500, arco: 3400, puente: 3800, meta: 3000 };
  const altoObj = o => (o.tipo === 'torre' ? 4000 + (o.ventanas || 1) * 1800 : ALTO_OBJ[o.tipo] || 1000) * o.esc;
  const ANCHO_OBJ = { pino: 900, arbol: 1100, poste: 160, baranda: 700, senal: 380, mirador: 900, casa: 1800, roca: 700, torre: 2600, valla: 1300, arco: 0, puente: 0, meta: 0 };
  function vista(W, H) { return H > W * 1.05 ? { k: Math.max(W / 2, H * .34), yh: H * .4 } : { k: W / 2, yh: H / 2 }; }
  const capas = new Map();   /* el paralaje ya dibujado, por circuito y tamaño */
  function paralaje(P, W, H) {
    const key = P.id + ':' + W + 'x' + H; let L = capas.get(key); if (L) return L;
    const r = azar(hashTexto(key)), noche = P.D.noche, mk = (w, h) => { const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h }); return c; };
    const ww = Math.max(2, Math.ceil(W * 2)), hh = Math.max(2, Math.ceil(H * .5)), out = [];
    for (let k = 0; k < 3; k++) {
      const c = mk(ww, hh), g = c.getContext('2d'); g.clearRect(0, 0, ww, hh);
      if (k === 0) {   /* lo más lejos: nubes o estrellas y la luna */
        if (noche) { g.fillStyle = 'rgba(255,255,240,.85)'; for (let i = 0; i < 140; i++) { const x = r() * ww, y = r() * hh * .7, s = r() < .1 ? 2 : 1; g.fillRect(x, y, s, s); } g.fillStyle = '#f3efd8'; g.beginPath(); g.arc(ww * .3, hh * .25, Math.max(6, H * .025), 0, TAU_); g.fill(); }
        else { g.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 9; i++) { const x = r() * ww, y = hh * (.12 + r() * .35), s = 18 + r() * 40; for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(x + j * s * .6, y + Math.sin(j) * 4, s * .7, s * .32, 0, 0, TAU_); g.fill(); } } }
      } else if (k === 1) {   /* las montañas del Valle: dos cordilleras */
        for (const [cc, alto, fase] of noche ? [['#141a36', .62, 1], ['#0e1330', .45, 2]] : [['#7f9fb8', .66, 1], ['#5f8a6e', .48, 2]]) {
          g.fillStyle = cc; g.beginPath(); g.moveTo(0, hh);
          for (let x = 0; x <= ww; x += 8) { const t = x / ww * TAU_, y = hh * (1 - alto * (.55 + .25 * Math.sin(t * 2 + fase) + .12 * Math.sin(t * 5 + fase * 3) + .06 * Math.sin(t * 11 + fase))); g.lineTo(x, y); }
          g.lineTo(ww, hh); g.closePath(); g.fill();
        }
      } else {   /* el horizonte cercano: la ciudad (de noche, con ventanas) o las lomas con pinos */
        if (P.D.paralaje === 'ciudad') {
          let x = 0; while (x < ww) { const w = 10 + r() * 34, h = hh * (.18 + r() * .55); g.fillStyle = noche ? '#0b0f22' : '#6b7280'; g.fillRect(x, hh - h, w, h);
            if (noche) { g.fillStyle = 'rgba(255,214,120,.85)'; for (let yy = hh - h + 4; yy < hh - 3; yy += 5) for (let xx = x + 2; xx < x + w - 2; xx += 4) if (r() < .32) g.fillRect(xx, yy, 2, 2); }
            x += w + r() * 4; }
          if (noche) { g.fillStyle = 'rgba(255,90,60,.9)'; for (let i = 0; i < 12; i++) g.fillRect(r() * ww, hh * (.3 + r() * .3), 2, 2); }
        } else {
          g.fillStyle = '#3d6b3a'; g.beginPath(); g.moveTo(0, hh); for (let x = 0; x <= ww; x += 6) { const t = x / ww * TAU_; g.lineTo(x, hh * (1 - .28 - .1 * Math.sin(t * 3) - .05 * Math.sin(t * 9))); } g.lineTo(ww, hh); g.closePath(); g.fill();
          g.fillStyle = '#2c5a2c'; for (let i = 0; i < 90; i++) { const x = r() * ww, t = x / ww * TAU_, y = hh * (1 - .28 - .1 * Math.sin(t * 3) - .05 * Math.sin(t * 9)) + 4, h = 8 + r() * 10; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + h * .35, y); g.lineTo(x - h * .35, y); g.closePath(); g.fill(); }
          g.fillStyle = 'rgba(240,230,210,.9)'; for (let i = 0; i < 26; i++) { const x = r() * ww, t = x / ww * TAU_, y = hh * (1 - .28 - .1 * Math.sin(t * 3) - .05 * Math.sin(t * 9)) + 6 + r() * 10; g.fillRect(x, y, 3, 2); }
        }
      }
      out.push({ c, w: ww, h: hh });
    }
    L = { capas: out, cielo: null }; capas.set(key, L); if (capas.size > 6) capas.delete(capas.keys().next().value); return L;
  }
  /* lo que se reusa entre cuadros (sin basura) */
  /* las franjas de cada cuadro, juntas por capa (pasto, berma, piano, asfalto, línea), banda y nivel de niebla: índice = capa·12 + banda·6 + niebla */
  const CAPAS_V = ['pasto', 'berma', 'piano', 'asfalto', 'linea'], LOTES = Array.from({ length: 62 }, () => []);   /* 60: la baranda; 61: sus postes */ let LOTE_N = 0;
  function quad(a, x1, y1, w1, x2, y2, w2) { a.push(x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2); }
  function proyectar(p, camX, camY, camZ, d, k, W, yh) {
    p.c.x = p.m.x - camX; p.c.y = p.m.y - camY; p.c.z = p.m.z - camZ;
    const e = p.s.e = d / p.c.z; p.s.x = W / 2 + e * p.c.x * k; p.s.y = yh - e * p.c.y * k; p.s.w = e * ANCHO * k;
  }
  /* dibuja un cuadro; op = { colorCarros (pruebas), sinHud, hud: true } -> cifras del cuadro */
  function dibujar(g, W, H, S, op = {}) {
    const t0 = performance.now(), P = S.P, J = S.jug, V = vista(W, H), k = V.k, d = 1 / Math.tan(J.fov * Math.PI / 360), N = P.N, C = P.paleta;
    const sj = segDe(P, J.z), fj = (J.z % SEG) / SEG, yJug = mez(sj.p1.m.y, sj.p2.m.y, fj), sacude = (J.berma ? (Math.random() - .5) * 3 : 0) + (J.sacude > 0 ? (Math.random() - .5) * 8 * J.sacude : 0);
    const camY = yJug + CAMH, margen = H > W * 1.05 ? Math.max(18, H * .14) : Math.max(18, H * .04),   /* en vertical, el carro va encima de la fila de botones (la zona libre del centro) */ zJug = k * d * CAMH / Math.max(40, (H - margen) - V.yh), camZ = ((J.z - zJug) % P.L + P.L) % P.L;
    const base = segDe(P, camZ), bi = base.i, f = (camZ % SEG) / SEG;   /* se dibuja desde el segmento de la cámara (detrás del carro) */
    /* fondo: cielo y paralaje (se mueve con la curva, la velocidad y la altura de la cámara) */
    const ce = op.cielo || P.colores.cielo, gr = g.createLinearGradient(0, 0, 0, V.yh); gr.addColorStop(0, ce[0]); gr.addColorStop(1, ce[1]); g.fillStyle = gr; g.fillRect(0, 0, W, V.yh + 2);
    g.fillStyle = C.pasto[0][5]; g.fillRect(0, V.yh, W, H - V.yh);
    const PL = paralaje(P, W, H), sube = cl((yJug - (S._y0 ?? (S._y0 = yJug))) * .00045 * H / 10, -H * .1, H * .1);
    for (let i = 0; i < 3; i++) { const L = PL.capas[i], ox = ((S.offs[i] * L.w) % L.w + L.w) % L.w, y = V.yh - L.h + sube * (i + 1) * .35 + (i === 0 ? -L.h * .15 : 0); g.drawImage(L.c, -ox, y); g.drawImage(L.c, L.w - ox, y); }
    /* pasada 1: de cerca a lejos, con maxY */
    let maxY = H, x = 0, dx = -base.curva * f, nVis = 0, nRec = 0;
    LOTE_N++; for (const a of LOTES) a.length = 0;
    const camX = J.x * ANCHO;
    for (let n = 0; n < VISTA; n++) {
      const s = P.segs[(bi + n) % N], vuelta = bi + n >= N ? P.L : 0;
      s.p1.m.x = x; s.p2.m.x = x + dx; const z1 = s.p1.m.z, z2 = s.p2.m.z; s.p1.m.z += vuelta; s.p2.m.z += vuelta;
      proyectar(s.p1, camX, camY, camZ, d, k, W, V.yh); proyectar(s.p2, camX, camY, camZ, d, k, W, V.yh); s.p1.m.z = z1; s.p2.m.z = z2;
      x += dx; dx += s.curva; s.vista = false; s.clip = maxY; s.delante = s.p1.c.z > 1; s.niebla = n > VISTA - NIEBLA ? Math.min(5, Math.floor((n - (VISTA - NIEBLA)) / NIEBLA * 6)) : 0;
      if (s.p1.c.z <= 1 || s.p2.s.y >= s.p1.s.y - .01 || s.p2.s.y >= maxY) { nRec++; continue; }
      s.vista = true; nVis++;
      /* recortar contra maxY: lo que quedó debajo ya lo tapa algo más cerca */
      let x1 = s.p1.s.x, y1 = s.p1.s.y, w1 = s.p1.s.w; const x2 = s.p2.s.x, y2 = s.p2.s.y, w2 = s.p2.s.w;
      if (y1 > maxY) { const t = (y1 - maxY) / (y1 - y2); x1 = mez(x1, x2, t); w1 = mez(w1, w2, t); y1 = maxY; }
      const bn = s.banda * 6 + s.niebla, LP = LOTES[bn], LB = LOTES[12 + bn], LR = LOTES[24 + bn], LA = LOTES[36 + bn], LL = LOTES[48 + s.niebla];
      LP.push(0, y1, W, y1, W, y2, 0, y2);
      quad(LB, x1, y1, w1 * 1.3, x2, y2, w2 * 1.3);
      const pw1 = w1 / 9, pw2 = w2 / 9; quad(LR, x1 - w1 - pw1 * .2, y1, pw1, x2 - w2 - pw2 * .2, y2, pw2); quad(LR, x1 + w1 + pw1 * .2, y1, pw1, x2 + w2 + pw2 * .2, y2, pw2);
      quad(LA, x1, y1, w1, x2, y2, w2);
      if (s.banda === 0) { const lw1 = w1 / 60, lw2 = w2 / 60; for (let c = 1; c < CARRILES; c++) { const u = -1 + 2 * c / CARRILES; quad(LL, x1 + u * w1, y1, lw1, x2 + u * w2, y2, lw2); } }
      { const lw1 = w1 / 45, lw2 = w2 / 45; quad(LL, x1 - w1 * .96, y1, lw1, x2 - w2 * .96, y2, lw2); quad(LL, x1 + w1 * .96, y1, lw1, x2 + w2 * .96, y2, lw2); }
      if (s.baranda) {   /* la baranda: una franja levantada 0,5 a 0,8 m sobre la orilla, de p1 a p2, y un poste cada 3 segmentos */
        const u = s.baranda * 1.2, xa = x1 + u * w1, xb = x2 + u * w2, h1 = 270 * s.p1.s.e * k, h2 = 270 * s.p2.s.e * k;
        LOTES[60].push(xa, y1 - h1 * .95, xb, y2 - h2 * .95, xb, y2 - h2 * .55, xa, y1 - h1 * .55);
        if (s.i % 3 === 0) { const pw = Math.max(.6, w1 / 70); LOTES[61].push(xa - pw, y1 - h1 * .95, xa + pw, y1 - h1 * .95, xa + pw, y1, xa - pw, y1); }
      }
      maxY = y2;
    }
    let fig = 0;
    for (let ci = 0; ci < 5; ci++) for (let b = 0; b < 2; b++) for (let nf = 0; nf < 6; nf++) {
      if (ci === 4 && b) continue; const a = LOTES[ci * 12 + b * 6 + nf]; if (!a.length) continue;
      g.fillStyle = ci === 4 ? C.linea[nf] : C[CAPAS_V[ci]][b][nf]; g.beginPath();
      for (let i = 0; i < a.length; i += 8) { g.moveTo(a[i], a[i + 1]); g.lineTo(a[i + 2], a[i + 3]); g.lineTo(a[i + 4], a[i + 5]); g.lineTo(a[i + 6], a[i + 7]); g.closePath(); }
      g.fill(); fig++;
    }
    for (const [i, c] of [[61, '#6d7178'], [60, '#d4d7dc']]) { const a = LOTES[i]; if (!a.length) continue; g.fillStyle = c; g.beginPath(); for (let j = 0; j < a.length; j += 8) { g.moveTo(a[j], a[j + 1]); g.lineTo(a[j + 2], a[j + 3]); g.lineTo(a[j + 4], a[j + 5]); g.lineTo(a[j + 6], a[j + 7]); g.closePath(); } g.fill(); fig++; }
    /* los carros, en su segmento */
    for (const c of S.rivales) { const s = segDe(P, c.z); if (s._cuadro !== LOTE_N) { s._cuadro = LOTE_N; s.carros.length = 0; } s.carros.push(c); }
    /* pasada 2: de lejos a cerca, objetos y rivales recortados contra seg.clip */
    let nObj = 0, nCar = 0, nClip = 0;
    for (let n = VISTA - 1; n > 0; n--) {
      /* también los segmentos que tapa una cresta: lo que va en ellos se asoma por encima de la cresta (recortado contra seg.clip) */
      const s = P.segs[(bi + n) % N]; if (!s.delante || s.clip <= 0) { if (s._cuadro === LOTE_N) s.carros.length = 0; continue; }
      const e = s.p1.s.e, alfa = s.niebla ? 1 - s.niebla / 7 : 1;
      if (alfa < 1) g.globalAlpha = alfa;
      for (const o of s.obj) { const X = s.p1.s.x + e * o.x * ANCHO * k, Y = s.p1.s.y; if (X < -W * .6 || X > W * 1.6) continue; const alto = altoObj(o) * e * k; if (Y - alto >= s.clip) continue; const rec = Y > s.clip; if (rec) { g.save(); g.beginPath(); g.rect(0, 0, W, s.clip); g.clip(); nClip++; } objeto(g, o, X, Y, e * k, s, S, W); if (rec) g.restore(); nObj++; }
      if (s._cuadro === LOTE_N && s.carros.length) {
        for (const c of s.carros) {
          const ff = (c.z % SEG) / SEG, ee = mez(s.p1.s.e, s.p2.s.e, ff), X = mez(s.p1.s.x, s.p2.s.x, ff) + ee * c.x * ANCHO * k, Y = mez(s.p1.s.y, s.p2.s.y, ff), w = ee * CARRO_W * k;
          if (w < 1 || (Y - w * .62 >= s.clip && !op.sinRecorte)) continue; const rec = Y > s.clip && !op.sinRecorte; if (rec) { g.save(); g.beginPath(); g.rect(0, 0, W, s.clip); g.clip(); nClip++; }
          if (op.colorCarros) { g.fillStyle = op.colorCarros; g.fillRect(X - w / 2, Y - w * .55, w, w * .55); }
          else { if (P.D.noche) { g.fillStyle = 'rgba(255,40,30,.35)'; g.fillRect(X - w * .5, Y - w * .38, w, w * .14); } carroAtras(g, X, Y, w, c.color, { freno: c.v < S.P.vmax * .4, t: S.t }); }
          if (rec) g.restore(); nCar++;
        }
        s.carros.length = 0;
      }
      if (alfa < 1) g.globalAlpha = 1;
    }
    /* la hora del mundo abierto (op.noche, de cieloRetro en Turno Cero): en un circuito de día, la noche lo oscurece */
    const noche = P.D.noche ? 1 : cl(op.noche || 0, 0, 1);
    if (!P.D.noche && noche > .05) { g.fillStyle = 'rgba(8,12,34,' + (noche * .55).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    /* el jugador: 6 estados (recto, giro suave y brusco; en plano o en subida), berma, chispas, humo y nitro */
    const wJ = Math.min(W * .42, CARRO_W * k * d / zJug), xJ = W / 2 + sacude, yJ = H - margen + (J.berma ? Math.sin(S.t * 60) * 1.5 : 0);
    const estado = Math.abs(J.giro) < .2 ? 0 : Math.abs(J.giro) < .65 ? .5 : 1, giroDib = Math.sign(J.giro) * estado;
    if (J.nitroT > 0 || J.fov > 103) lineas(g, W, V.yh, H, (J.fov - 100) / 16, S.t);
    if (noche > .3) { const gl = g.createRadialGradient(xJ, yJ - wJ * 1.4, wJ * .2, xJ, yJ - wJ * 1.6, wJ * 2.6); gl.addColorStop(0, 'rgba(255,240,190,.28)'); gl.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gl; g.fillRect(xJ - wJ * 2.6, yJ - wJ * 4.2, wJ * 5.2, wJ * 4.2); }
    particulas(g, S, xJ, yJ, wJ);
    g.save(); g.translate(xJ, yJ); if (J.subida > .01) g.scale(1, 1.08); carroAtras(g, 0, 0, wJ, J.color, { giro: giroDib, freno: !!J._freno, t: S.t });
    if (J.subida > .01) { g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(-wJ * .36, -wJ * .52, wJ * .72, wJ * .05); }
    if (J.nitroT > 0) { g.fillStyle = (S.t * 20 | 0) % 2 ? '#7fd8ff' : '#ffffff'; g.beginPath(); g.ellipse(-wJ * .3, -wJ * .1, wJ * .06, wJ * .1, 0, 0, TAU_); g.ellipse(wJ * .3, -wJ * .1, wJ * .06, wJ * .1, 0, 0, TAU_); g.fill(); }
    g.restore();
    if (!op.sinHud) hud(g, W, H, S);
    const ms = performance.now() - t0; S.stats.cuadros++;
    return { ms, visibles: nVis, recortados: nRec, figuras: fig, objetos: nObj, carros: nCar, clips: nClip, horizonte: V.yh, maxY };
  }
  /* objetos de la orilla (todos procedurales); X, Y = pie del objeto en pantalla; e = escala (px por unidad) */
  function objeto(g, o, X, Y, e, s, S, W) {
    const z = e * o.esc, noche = S.P.D.noche;
    switch (o.tipo) {
      case 'pino': { const h = 2600 * z, w = 900 * z; if (h < 2) return; g.fillStyle = '#5a3d22'; g.fillRect(X - w * .06, Y - h * .25, w * .12, h * .25); g.fillStyle = '#1f5130'; g.beginPath(); g.moveTo(X, Y - h); g.lineTo(X + w / 2, Y - h * .18); g.lineTo(X - w / 2, Y - h * .18); g.closePath(); g.fill(); g.fillStyle = '#2a6a3c'; g.beginPath(); g.moveTo(X, Y - h); g.lineTo(X + w * .3, Y - h * .45); g.lineTo(X - w * .1, Y - h * .45); g.closePath(); g.fill(); return; }
      case 'arbol': { const h = 2200 * z, w = 1100 * z; if (h < 2) return; g.fillStyle = '#5d4126'; g.fillRect(X - w * .07, Y - h * .45, w * .14, h * .45); g.fillStyle = '#2f7a3a'; g.beginPath(); g.ellipse(X, Y - h * .66, w * .5, h * .34, 0, 0, TAU_); g.fill(); g.fillStyle = '#3e9147'; g.beginPath(); g.ellipse(X - w * .12, Y - h * .74, w * .26, h * .18, 0, 0, TAU_); g.fill(); return; }
      case 'roca': { const h = 600 * z, w = 700 * z; if (h < 1) return; g.fillStyle = '#8d8a83'; g.beginPath(); g.moveTo(X - w / 2, Y); g.lineTo(X - w * .3, Y - h); g.lineTo(X + w * .25, Y - h * .9); g.lineTo(X + w / 2, Y); g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(X, Y - h * .8, w * .4, h * .8); return; }
      case 'baranda': { const h = 260 * z, w = 700 * z; if (h < .6) return; g.fillStyle = '#c9ccd2'; g.fillRect(X - w / 2, Y - h, w, h * .4); g.fillStyle = '#7a7e86'; g.fillRect(X - w * .05, Y - h, w * .1, h); return; }
      case 'senal': { const h = 900 * z, w = 380 * z; if (h < 2) return; g.fillStyle = '#555'; g.fillRect(X - w * .05, Y - h, w * .1, h); g.fillStyle = '#f2c94c'; g.fillRect(X - w / 2, Y - h, w, w * .8); g.fillStyle = '#1b1b1b'; const d = o.dir || 1, cx = X, cy = Y - h + w * .4; g.beginPath(); g.moveTo(cx - d * w * .25, cy - w * .25); g.lineTo(cx + d * w * .15, cy); g.lineTo(cx - d * w * .25, cy + w * .25); g.lineTo(cx - d * w * .05, cy); g.closePath(); g.fill(); return; }
      case 'mirador': { const h = 500 * z, w = 900 * z; if (h < 1) return; g.fillStyle = '#7b5a3a'; g.fillRect(X - w / 2, Y - h, w, h * .18); g.fillRect(X - w * .45, Y - h, w * .06, h); g.fillRect(X + w * .39, Y - h, w * .06, h); return; }
      case 'casa': { const h = 1300 * z, w = 1800 * z; if (h < 2) return; g.fillStyle = o.color || '#e8d7b0'; g.fillRect(X - w / 2, Y - h * .7, w, h * .7); g.fillStyle = '#a6452f'; g.beginPath(); g.moveTo(X - w * .56, Y - h * .7); g.lineTo(X, Y - h); g.lineTo(X + w * .56, Y - h * .7); g.closePath(); g.fill(); g.fillStyle = '#3c3c46'; g.fillRect(X - w * .28, Y - h * .5, w * .16, h * .2); g.fillRect(X + w * .12, Y - h * .5, w * .16, h * .2); g.fillStyle = '#6a4a2c'; g.fillRect(X - w * .06, Y - h * .36, w * .12, h * .36); return; }
      case 'poste': { const h = 3000 * z, w = 160 * z; if (h < 2) return; g.fillStyle = '#4b4f58'; g.fillRect(X - w / 2, Y - h, w, h); const brazo = (o.espejo ? -1 : 1) * 700 * z; g.fillRect(Math.min(X, X + brazo), Y - h, Math.abs(brazo), w * .8); if (noche) { const lx = X + brazo, ly = Y - h + w; g.fillStyle = 'rgba(255,214,140,.18)'; g.beginPath(); g.arc(lx, ly, 150 * z, 0, TAU_); g.fill(); g.fillStyle = '#ffe9b0'; g.fillRect(lx - w, ly - w * .3, w * 2, w * .7); } return; }
      case 'torre': { const h = (4000 + (o.ventanas || 1) * 1800) * z, w = 2600 * z; if (h < 3) return; g.fillStyle = noche ? '#10142a' : '#8a8f99'; g.fillRect(X - w / 2, Y - h, w, h); if (noche && w > 6) { g.fillStyle = 'rgba(255,214,120,.8)'; const fx = Math.max(3, w / 6), fy = Math.max(3, h / 14); for (let yy = Y - h + fy; yy < Y - fy; yy += fy * 1.6) for (let xx = X - w / 2 + fx * .5; xx < X + w / 2 - fx; xx += fx * 1.5) if (((xx * 7 + yy * 13) | 0) % 5 < 2) g.fillRect(xx, yy, fx * .7, fy * .6); } return; }
      case 'valla': { const h = 1500 * z, w = 1300 * z; if (h < 2) return; g.fillStyle = '#3a3d44'; g.fillRect(X - w * .04, Y - h * .55, w * .08, h * .55); g.fillStyle = o.color || '#2f80ed'; g.fillRect(X - w / 2, Y - h, w, h * .5); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(X - w * .4, Y - h * .9, w * .5, h * .08); g.fillRect(X - w * .4, Y - h * .74, w * .3, h * .06); return; }
      case 'arco': case 'puente': case 'meta': {   /* lo que pasa por encima de la vía: dos pilares y una viga */
        const xL = X - 1.45 * ANCHO * e, xR = X + 1.45 * ANCHO * e, alto = (o.tipo === 'puente' ? 3000 : 2600) * e, grueso = (o.tipo === 'puente' ? 700 : 300) * e, pil = Math.max(1, 260 * e);
        if (alto < 2) return;
        g.fillStyle = o.tipo === 'puente' ? (noche ? '#3a3f4c' : '#9aa0a8') : o.tipo === 'meta' ? '#f1efe8' : '#2b2f3a'; g.fillRect(xL - pil / 2, Y - alto, pil, alto); g.fillRect(xR - pil / 2, Y - alto, pil, alto); g.fillRect(xL - pil / 2, Y - alto - grueso, xR - xL + pil, grueso);
        if (o.tipo === 'arco') { g.fillStyle = o.color || '#2f80ed'; g.fillRect(xL + (xR - xL) * .3, Y - alto - grueso * 2.2, (xR - xL) * .4, grueso * 1.3); if (noche) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(xL + (xR - xL) * .33, Y - alto - grueso * 1.9, (xR - xL) * .34, grueso * .3); } }
        if (o.tipo === 'meta') { const n = 10, cw = (xR - xL) / n; for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#111' : '#fff'; g.fillRect(xL + i * cw, Y - alto - grueso, cw, grueso / 2); g.fillStyle = i % 2 ? '#fff' : '#111'; g.fillRect(xL + i * cw, Y - alto - grueso / 2, cw, grueso / 2); } }
        if (o.tipo === 'puente' && noche) { g.fillStyle = 'rgba(255,214,140,.7)'; for (let i = 1; i < 8; i++) g.fillRect(xL + (xR - xL) * i / 8, Y - alto - grueso * .6, Math.max(1, pil * .4), Math.max(1, pil * .3)); }
        return;
      }
    }
  }
  /* las líneas de velocidad del nitro, desde el punto de fuga */
  function lineas(g, W, yh, H, f, t) {
    if (f <= 0) return; g.strokeStyle = 'rgba(255,255,255,' + (.25 * f).toFixed(3) + ')'; g.lineWidth = 1.5; g.beginPath();
    for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU_ + Math.sin(t * 3 + i) * .05, r0 = W * (.25 + ((t * 2 + i * .37) % 1) * .3), r1 = r0 + W * .18; g.moveTo(W / 2 + Math.cos(a) * r0, yh + Math.sin(a) * r0 * .7); g.lineTo(W / 2 + Math.cos(a) * r1, yh + Math.sin(a) * r1 * .7); }
    g.stroke();
  }
  /* chispas y humo al derrapar o en la berma (partículas en pantalla) */
  function particulas(g, S, xJ, yJ, wJ) {
    const J = S.jug, L = S.part;
    if ((J.derrape > .4 || J.berma) && J.v > 1000 && L.length < 60) for (let i = 0; i < 2; i++) { const lado = i ? 1 : -1; L.push({ x: xJ + lado * wJ * .38, y: yJ - wJ * .05, vx: (Math.random() - .5) * 60 - J.giro * 40, vy: -20 - Math.random() * 40, t: 0, humo: J.berma ? 1 : Math.random() < .5 }); }
    const dt = 1 / 60;
    for (let i = L.length - 1; i >= 0; i--) { const p = L[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > (p.humo ? .9 : .35)) { L.splice(i, 1); continue; }
      if (p.humo) { g.fillStyle = 'rgba(200,200,200,' + (.35 * (1 - p.t / .9)).toFixed(3) + ')'; g.beginPath(); g.arc(p.x, p.y, wJ * (.06 + p.t * .16), 0, TAU_); g.fill(); }
      else { g.fillStyle = p.t < .15 ? '#fff3b0' : '#ff9d2e'; g.fillRect(p.x, p.y, 2, 2); } }
  }
  /* el tablero: posición, vuelta, tiempo, velocidad, nitro y minimapa */
  const fmt = t => { t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); };
  function hud(g, W, H, S) {
    const J = S.jug, P = S.P, n = S.todos.length, pos = J.fin != null ? J.pos : posicion(S, J), kmh = Math.round(J.v * M_POR_U * 3.6), sx = Math.min(1.25, Math.max(.8, Math.min(W, H) / 412));
    g.save(); g.font = '800 ' + Math.round(14 * sx) + 'px system-ui, sans-serif'; g.textBaseline = 'middle';
    const pill = (x, y, w, h) => { g.fillStyle = 'rgba(8,10,24,.66)'; g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, h / 2) : g.rect(x, y, w, h); g.fill(); };
    const top = Math.max(10, H * .012);
    pill(10, top, 132 * sx, 30 * sx); g.fillStyle = '#ffd34d'; g.fillText('P ' + pos + '/' + n, 22 * sx, top + 15 * sx); g.fillStyle = '#fff'; g.fillText('V ' + cl(J.vuelta + 1, 1, S.vueltas) + '/' + S.vueltas, 76 * sx, top + 15 * sx);
    pill(W / 2 - 52 * sx, top, 104 * sx, 30 * sx); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(S.t < 0 ? String(Math.ceil(-S.t)) : fmt(J.fin ?? S.t), W / 2, top + 15 * sx);
    pill(10, top + 36 * sx, 132 * sx, 24 * sx); g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '700 ' + Math.round(12 * sx) + 'px system-ui, sans-serif'; g.fillText(kmh + ' km/h', 22 * sx, top + 48 * sx);
    g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(84 * sx, top + 44 * sx, 50 * sx, 8 * sx); g.fillStyle = J.nitroT > 0 ? '#7fd8ff' : '#39ffb3'; g.fillRect(84 * sx, top + 44 * sx, 50 * sx * (J.nitroT > 0 ? J.nitroT / 2.4 : J.nitro), 8 * sx);
    if (J.rebufo) { g.fillStyle = '#7fd8ff'; g.fillText('REBUFO', 22 * sx, top + 70 * sx); }
    /* minimapa */
    const m = 78 * sx, mx = W - m - 12, my = top; g.fillStyle = 'rgba(8,10,24,.55)'; g.fillRect(mx - 4, my - 4, m + 8, m + 8); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.beginPath();
    const MP = P.mapa, paso = Math.max(1, Math.floor(P.N / 160)); for (let i = 0; i <= P.N; i += paso) { const X = mx + m / 2 + MP.xs[i] * m * .92, Y = my + m / 2 + MP.ys[i] * m * .92; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); } g.closePath(); g.stroke();
    for (const c of S.todos) { const i = Math.floor(c.z / SEG) % P.N; g.fillStyle = c === J ? '#ffd34d' : c.color; g.beginPath(); g.arc(mx + m / 2 + MP.xs[i] * m * .92, my + m / 2 + MP.ys[i] * m * .92, c === J ? 4 : 3, 0, TAU_); g.fill(); }
    if (S.t < 0 || (S.t < .8)) { g.textAlign = 'center'; g.font = '900 ' + Math.round(54 * sx) + 'px system-ui, sans-serif'; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 6; const tx = S.t < 0 ? String(Math.ceil(-S.t)) : '¡YA!'; g.strokeText(tx, W / 2, H * .32); g.fillText(tx, W / 2, H * .32); }
    g.restore();
  }

  /* el cielo del mundo abierto (cieloRetro de 47-clasicos.js: la hora y el clima) para un circuito de día -> { cielo, noche } */
  function cieloDe(E) { if (typeof cieloRetro !== 'function') return null; const c = cieloRetro(E || {}), rgb = v => 'rgb(' + v.map(x => Math.round(x)).join(',') + ')'; return { cielo: [rgb(c.top), rgb(c.hor)], noche: c.noche || 0 }; }

  /* ---------- el juego completo: lienzo, controles, bucle y resultado ---------- */
  function entrar(op) {
    const P = typeof op.circuito === 'string' ? crear(op.circuito) : op.circuito, S = carrera(P, op), cv = op.lienzo, capa = op.capa;
    const g = cv.getContext('2d', { alpha: false }); capa.hidden = false; cv.hidden = false;
    let W = 0, H = 0; const tam = () => { const dpr = Math.min(1.5, window.devicePixelRatio || 1); W = Math.max(200, Math.round((cv.clientWidth || innerWidth) * dpr)); H = Math.max(200, Math.round((cv.clientHeight || innerHeight) * dpr)); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } };
    tam(); addEventListener('resize', tam);
    const ent = { giro: 0, gas: false, freno: false, nitro: false }, teclas = new Set(), toque = { izq: false, der: false, gas: false, freno: false };
    const tactil = matchMedia && matchMedia('(pointer: coarse)').matches;
    const ui = document.createElement('div'); ui.className = 'mcPistaUI'; ui.style.cssText = 'position:absolute;inset:0;pointer-events:none;font:800 15px system-ui,sans-serif;color:#fff;user-select:none;-webkit-user-select:none';
    const boton = (txt, css, k) => { const b = document.createElement('button'); b.textContent = txt; b.dataset.k = k; b.style.cssText = 'position:absolute;pointer-events:auto;touch-action:none;border-radius:18px;border:2px solid rgba(255,255,255,.35);background:rgba(8,10,24,.55);color:#fff;font:900 22px system-ui;' + css;
      const on = e => { e.preventDefault(); toque[k] = true; if (k === 'nitro') ent.nitro = true; }, off = e => { e.preventDefault(); toque[k] = false; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off); ui.appendChild(b); return b; };
    const abajo = 'calc(max(16px, env(safe-area-inset-bottom)) + 8px)';
    boton('◀', 'left:12px;bottom:' + abajo + ';width:68px;height:68px', 'izq'); boton('▶', 'left:88px;bottom:' + abajo + ';width:68px;height:68px', 'der');
    boton('▲', 'right:12px;bottom:' + abajo + ';width:72px;height:72px;border-color:#39ffb3', 'gas'); boton('▼', 'right:92px;bottom:' + abajo + ';width:58px;height:58px', 'freno'); boton('🔥', 'right:12px;bottom:calc(max(16px, env(safe-area-inset-bottom)) + 92px);width:72px;height:56px;border-color:#7fd8ff', 'nitro');
    const sal = document.createElement('button'); sal.textContent = '✕'; sal.setAttribute('aria-label', 'Salir'); sal.style.cssText = 'position:absolute;pointer-events:auto;left:12px;top:calc(max(10px, env(safe-area-inset-top)) + 96px);width:44px;height:44px;border-radius:14px;border:1px solid rgba(255,255,255,.35);background:rgba(8,10,24,.6);color:#fff;font:800 18px system-ui'; ui.appendChild(sal);
    const fin = document.createElement('div'); fin.hidden = true; fin.style.cssText = 'position:absolute;inset:0;display:grid;place-content:center;gap:12px;background:rgba(6,8,20,.78);text-align:center;pointer-events:auto;padding:24px'; ui.appendChild(fin);
    capa.appendChild(ui);
    const kd = e => { if (e.code === 'Escape') { salir(); return; } teclas.add(e.code); if (e.code === 'Space' || e.code === 'ShiftLeft') ent.nitro = true; if (/Arrow|Key[WASD]|Space/.test(e.code)) e.preventDefault(); }, ku = e => teclas.delete(e.code);
    addEventListener('keydown', kd); addEventListener('keyup', ku);
    let raf = 0, last = performance.now(), activo = true, mostrado = false;
    const cuadro = ts => {
      if (!activo) return; raf = requestAnimationFrame(cuadro); const dt = Math.min(.1, (ts - last) / 1000); last = ts;
      const izq = toque.izq || teclas.has('ArrowLeft') || teclas.has('KeyA'), der = toque.der || teclas.has('ArrowRight') || teclas.has('KeyD');
      ent.giro = (der ? 1 : 0) - (izq ? 1 : 0); ent.freno = toque.freno || teclas.has('ArrowDown') || teclas.has('KeyS'); ent.gas = (tactil && !ent.freno) || toque.gas || teclas.has('ArrowUp') || teclas.has('KeyW');
      if (op.bot) Object.assign(ent, bot(S));
      S.jug._freno = ent.freno; paso(S, dt, ent); ent.nitro = false;
      const sp = S.jug.v / P.vmax, sg = segDe(P, S.jug.z); S.offs[0] += dt * sp * sg.curva * .0006; S.offs[1] += dt * sp * sg.curva * .0012; S.offs[2] += dt * sp * sg.curva * .0022;
      for (const e of S.ev) { if (e.k === 'fin' && !mostrado) { mostrado = true; if (op.alTerminar) try { op.alTerminar(res()); } catch (er) { if (typeof MC !== 'undefined' && MC.falla) MC.falla('Pista: al terminar', er); } setTimeout(resultado, 900); } if (op.alEvento) try { op.alEvento(e); } catch (er) { /* sin efecto */ } }
      S.ev.length = 0;
      try { dibujar(g, W, H, S, amb); } catch (e) { if (typeof MC !== 'undefined' && MC.falla) MC.falla('Pista: dibujo', e); }
    };
    const amb = { cielo: op.cielo, noche: op.noche };   /* el cielo y la noche del mundo abierto, si el juego los da */
    raf = requestAnimationFrame(cuadro);
    const res = () => ({ circuito: P.id, nombre: P.D.nombre, terminado: S.jug.fin != null, tiempo: S.jug.fin, posicion: S.jug.fin != null ? S.jug.pos : posicion(S, S.jug), de: S.todos.length, vueltas: S.jug.vueltas.slice(), mejorVuelta: S.jug.mejor });
    function resultado() {
      const r = res(), med = ['🥇', '🥈', '🥉'][r.posicion - 1] || '🏁';
      fin.innerHTML = '<div style="font:900 26px system-ui">' + med + ' ' + r.posicion + '.º de ' + r.de + '</div><div style="font:700 16px system-ui">' + P.D.nombre + ' · ' + fmt(r.tiempo || S.t) + (r.mejorVuelta ? ' · mejor vuelta ' + fmt(r.mejorVuelta) : '') + '</div>';
      const otra = document.createElement('button'), volver = document.createElement('button');
      otra.textContent = 'Otra vez'; volver.textContent = 'Volver al mundo abierto';
      for (const b of [otra, volver]) b.style.cssText = 'padding:12px 20px;border-radius:12px;border:2px solid #39ffb3;background:#102a22;color:#39ffb3;font:900 17px system-ui;pointer-events:auto';
      volver.style.borderColor = 'rgba(255,255,255,.4)'; volver.style.color = '#fff'; volver.style.background = '#0b1020';
      otra.onclick = () => { const o = Object.assign({}, op, { circuito: P }); salir(true); const n = entrar(o); if (op._alReiniciar) op._alReiniciar(n); };
      volver.onclick = () => salir();
      fin.appendChild(otra); fin.appendChild(volver); fin.hidden = false;
    }
    sal.onclick = () => salir();
    function salir(sinAviso) {
      if (!activo) return; activo = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('resize', tam);
      ui.remove(); if (!sinAviso) { capa.hidden = true; if (op.alSalir) op.alSalir(res()); }
    }
    return { S, salir: () => salir(), resultado: res };
  }

  return { SEG, ANCHO, VISTA, NIEBLA, CIRCUITOS, crear, crearDe, carrera, paso, bot, simular, dibujar, perfil, entrar, posicion, vista, cieloDe, M_POR_U };
})();
MC.Pista = Pista;
