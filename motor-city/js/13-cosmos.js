/* =====================================================================
   COSMOS · universos enteros desde una sola semilla (la idea de No Man's Sky), con leyes reales
   - SEMILLAS EN JERARQUÍA: universo → galaxia → sistema → planeta → región → objeto. Cada nivel saca su semilla de
     la del padre y de su número (hash). Nada se guarda: todo se vuelve a calcular igual cuando se necesita, así que
     caben trillones de mundos en unos pocos kilobytes de código. Solo se guarda lo que el jugador cambia.
   - ESTRELLAS por la abundancia real (función de masa inicial: muchas enanas rojas, pocas estrellas como el Sol)
     y la relación masa–luminosidad (L ≈ M^3,5); zona habitable a √L unidades astronómicas.
   - PLANETAS: órbitas con la tercera ley de Kepler (T² = a³/M), gravedad g = G·M/R², velocidad de escape,
     temperatura de equilibrio T = 278,6 K · L^¼ · (1−albedo)^¼ / √a más el efecto invernadero, atmósfera retenida
     si la velocidad de escape supera ~6 veces la velocidad térmica de las moléculas.
   - DEL PLANETA AL MUNDO JUGABLE: el tipo de planeta da la forma del relieve, el clima, el agua, la nieve y la
     gravedad para MC.Generador, y las criaturas se diseñan y se prueban con la ley cuadrado‑cubo a esa gravedad.
   - RELIEVE CONTINUO E INFINITO: una función de altura por coordenadas (ruido fractal con crestas y deformación de
     dominio) que no tiene bordes: cualquier región se genera sola, en cualquier orden, y siempre empata.
   ===================================================================== */
const G_NEWTON = 6.674e-11, M_SOL = 1.989e30, M_TIERRA = 5.972e24, R_TIERRA = 6.371e6, UA = 1.496e11;
const TIPOS_ESTRELLA = [   // clase, fracción de las estrellas, masa (soles), color, temperatura (K)
  ['M', .765, [.08, .45], '#ffb46b', 3200], ['K', .121, [.45, .8], '#ffd2a1', 4500], ['G', .076, [.8, 1.04], '#fff4ea', 5800],
  ['F', .03, [1.04, 1.4], '#f8f7ff', 6750], ['A', .006, [1.4, 2.1], '#cad7ff', 8500], ['B', .0013, [2.1, 16], '#aabfff', 20000], ['O', .0001, [16, 60], '#9bb0ff', 35000]
];
const semillaDe = (...partes) => hashTxt(partes.join('/'));
const Cosmos = {
  semilla: semillaDe,
  /* estrella del sistema n de la galaxia g del universo u */
  estrella(u, g, n) {
    const r = mulberry32(semillaDe(u, 'g', g, 's', n)); let x = r(), T = TIPOS_ESTRELLA[0]; for (const t of TIPOS_ESTRELLA) { if (x < t[1]) { T = t; break; } x -= t[1]; }
    const masa = T[2][0] + (T[2][1] - T[2][0]) * r(), lum = Math.pow(masa, masa < .43 ? 2.3 : 3.5) * (masa < .43 ? .23 : 1), zh = [Math.sqrt(lum) * .95, Math.sqrt(lum) * 1.37];
    const nombre = Cosmos.nombre(r); return { u, g, n, clase: T[0], masa, luminosidad: lum, color: T[3], temperatura: T[4], zonaHabitable: zh, nombre, planetas: Math.floor(1 + r() * 8) };
  },
  /* planeta i de una estrella: órbita, tamaño, gravedad, temperatura, atmósfera y tipo */
  planeta(E, i) {
    const r = mulberry32(semillaDe(E.u, 'g', E.g, 's', E.n, 'p', i)), a = .25 * Math.pow(1.7, i) * (.85 + r() * .3);   // espaciado tipo Titius–Bode
    const rocoso = a < E.zonaHabitable[1] * 2.2 || r() < .25, masaT = rocoso ? Math.pow(10, -1.3 + r() * 1.8) : Math.pow(10, 1 + r() * 2.5), radioT = rocoso ? Math.pow(masaT, .27) : Math.min(11.2, Math.pow(masaT, .5) * .55 + 2);
    const M = masaT * M_TIERRA, R = radioT * R_TIERRA, g = G_NEWTON * M / (R * R), vEsc = Math.sqrt(2 * G_NEWTON * M / R), periodo = Math.sqrt(a * a * a / E.masa);
    const albedo = rocoso ? .25 + r() * .35 : .35 + r() * .2, Teq = 278.6 * Math.pow(E.luminosidad, .25) * Math.pow(1 - albedo, .25) / Math.sqrt(a) / Math.pow(.7, .25);
    /* atmósfera: se queda si la velocidad de escape supera ~6 veces la térmica del nitrógeno a esa temperatura */
    const vTerm = Math.sqrt(3 * 1.380649e-23 * Teq / (28 * 1.6605e-27)), atm = vEsc > 6 * vTerm ? (rocoso ? +(r() * 2.5).toFixed(2) : 100) : 0;
    const T = Teq + (atm > 0 ? 33 * Math.min(3, atm) : 0) - 273.15, agua = rocoso && T > -10 && T < 60 && atm > .3 && r() < .85;
    const tipo = !rocoso ? 'gaseoso' : atm === 0 ? 'rocoso_sin_aire' : T < -40 ? 'helado' : T > 70 ? 'desierto_ardiente' : !agua ? 'desierto' : r() < .3 ? 'oceano' : r() < .5 ? 'selva' : 'templado';
    return { i, nombre: E.nombre + ' ' + 'bcdefghij'[i], a, periodoAnos: periodo, masaTierras: masaT, radioTierras: radioT, g, vEscape: vEsc, albedo, atmosfera: atm, temperatura: T, agua, tipo, habitable: agua && g > 3 && g < 25, semilla: semillaDe(E.u, E.g, E.n, i) };
  },
  /* del planeta a los parámetros de MC.Generador (forma del relieve, clima) y a la gravedad de juego */
  mundoDe(P, op = {}) {
    const forma = { oceano: 'isla', selva: 'valle', templado: 'costa', desierto: 'llanura', desierto_ardiente: 'llanura', helado: 'montana', rocoso_sin_aire: 'montana', gaseoso: 'llanura' }[P.tipo] || 'valle';
    return Object.assign({ semilla: P.semilla, tipo: forma, gravedad: P.g, temperatura: P.temperatura, nieve: P.temperatura < 2, agua: P.agua ? 1 : 0, nombre: P.nombre, ancho: op.ancho || 4000, alto: op.alto || 4000 }, op);
  },
  /* una criatura que puede existir en ese planeta (prueba de verosimilitud de MC.Seres a su gravedad) */
  criaturaDe(P, i = 0) {
    const r = mulberry32(P.semilla + i * 7919), F = MC.Seres && MC.Seres.Animal && MC.Seres.Animal.criatura; if (!F) return null;
    for (let k = 0; k < 12; k++) { const masa = Math.pow(10, -1 + r() * 3.5) / Math.max(.3, P.g / 9.81), patas = [2, 4, 4, 6, 8][Math.floor(r() * 5)], c = F.call(MC.Seres.Animal, { masa, patas, alas: r() < (P.atmosfera > .5 ? .25 : 0), gravedad: P.g, semilla: P.semilla + i * 31 + k, nombre: Cosmos.nombre(r) }); if (c.verosimil) return c; }
    return null;
  },
  /* relieve infinito y continuo: altura en metros en (x, y) para la semilla del planeta (sin bordes ni cortes) */
  altura(semilla, x, y, op = {}) {
    const R = Cosmos._ruido(semilla), esc = op.escala || 2400, amp = op.amplitud || 900;
    const wx = x / esc + R(x / esc * .5 + 31.7, y / esc * .5 - 7.3) * .8, wy = y / esc + R(x / esc * .5 - 12.1, y / esc * .5 + 41.9) * .8;   // deformación de dominio
    let h = 0, a = .5, f = 1; for (let o = 0; o < 6; o++) { h += a * R(wx * f, wy * f); a *= .5; f *= 2.03; }
    const cresta = 1 - Math.abs(R(wx * .7 + 100, wy * .7 - 100)); return amp * (h * .7 + cresta * cresta * .6 - .25);
  },
  _ruidos: new Map(),
  _ruido(semilla) {
    if (this._ruidos.has(semilla)) return this._ruidos.get(semilla); const r = mulberry32(semilla), p = new Uint8Array(512), g = new Float32Array(512);
    for (let i = 0; i < 256; i++) { p[i] = i; g[i] = r() * TAU; } for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 256; i++) { p[i + 256] = p[i]; g[i + 256] = g[i]; }
    const f = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255, s = t => t * t * t * (t * (t * 6 - 15) + 10), d = (h, dx, dy) => Math.cos(g[h]) * dx + Math.sin(g[h]) * dy;
      const aa = p[p[X] + Y], ab = p[p[X] + Y + 1], ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1], u = s(xf), v = s(yf);
      return lerp(lerp(d(aa, xf, yf), d(ba, xf - 1, yf), u), lerp(d(ab, xf, yf - 1), d(bb, xf - 1, yf - 1), u), v) * 1.4; };
    this._ruidos.set(semilla, f); if (this._ruidos.size > 64) this._ruidos.delete(this._ruidos.keys().next().value); return f;
  },
  /* nombres sonoros y pronunciables en español */
  nombre(r) { const S = ['ka', 'lo', 'mi', 'ra', 'su', 'te', 'va', 'no', 'xi', 'ze', 'qui', 'ta', 'bel', 'dor', 'an', 'el', 'is', 'or', 'un', 'yu'], n = 2 + Math.floor(r() * 2); let s = ''; for (let i = 0; i < n; i++) s += S[Math.floor(r() * S.length)]; return s[0].toUpperCase() + s.slice(1); }
};
Object.assign(MC, { Cosmos });
