/* =====================================================================
   SERES · personas, animales y criaturas con biología y ciencia reales
   PERSONAS
   - Proporciones antropométricas (Drillis y Contini) que cambian con la edad (la cabeza es 1/4 del bebé y 1/7,5 del adulto).
   - Biomecánica: velocidad al caminar y al correr por el número de Froude (Fr = v²/gL; se pasa a correr cerca de 0,5).
   - Metabolismo basal (Mifflin‑St Jeor), gasto por actividad (METs), frecuencia cardiaca (Tanaka: 208 − 0,7·edad),
     potencia sostenida (W/kg según el estado físico), energía, hidratación y temperatura con el clima.
   - Genética mendeliana: genes diploides para piel (poligénica), ojos, pelo, rizo y estatura; cruzar dos personas
     da un hijo con los alelos de los dos. El fenotipo sale como el aspecto del personaje único del motor.
   ANIMALES Y CRIATURAS
   - Alometría real a partir de la masa: metabolismo de Kleiber (3,4·M^0,75 W), altura de cadera, velocidad máxima
     (Hirt y otros, 2017), pulso (241·M^−0,25), longevidad y marcha por el número de Froude (paso, trote, galope).
   - Catálogo de especies del valle (perro criollo, gallinazo, colibrí, iguana, zarigüeya, ardilla, caballo…).
   - Criaturas inventadas «entendibles»: plan corporal (patas, segmentos, alas, cola) y prueba de verosimilitud por la
     ley cuadrado‑cubo con la gravedad del planeta (¿aguantan sus huesos su peso?).
   Dibujo de lado en cualquier estilo (vector, silueta o pixel con las vistas) y en 3D con la malla del motor.
   ===================================================================== */
const PROP = { pierna: .530, muslo: .245, canilla: .246, brazo: .186, antebrazo: .146, mano: .108, hombros: .259, cadera: .191, cabeza: .130 };
const GENES = {
  piel: { loci: 6, tipo: 'aditivo' },     // 0–12 alelos oscuros → del más claro al más oscuro
  ojos: { loci: 2, tipo: 'ojos' },        // B (café) domina sobre G (verde) que domina sobre b (azul)
  pelo: { loci: 3, tipo: 'aditivo' },     // eumelanina: 0 rubio … 6 negro
  rizo: { loci: 1, tipo: 'incompleto' },  // LL liso, LR ondulado, RR rizado
  talla: { loci: 8, tipo: 'aditivo' }     // estatura: ±0,09 m alrededor de la media según los alelos
};
const Genetica = {
  azar(r, sexo) { const g = { sexo: sexo || (r() < .5 ? 'f' : 'm') }; for (const [k, G] of Object.entries(GENES)) { g[k] = []; for (let i = 0; i < G.loci; i++) g[k].push(G.tipo === 'ojos' ? [0, 0].map(() => { const x = r(); return x < .55 ? 'B' : x < .75 ? 'G' : 'b'; }) : [r() < .5 ? 1 : 0, r() < .5 ? 1 : 0]); } return g; },
  /* meiosis: de cada locus, un alelo al azar del padre y otro de la madre */
  cruzar(a, b, r, sexo) { const h = { sexo: sexo || (r() < .5 ? 'f' : 'm') }; for (const k of Object.keys(GENES)) h[k] = a[k].map((par, i) => [par[r() < .5 ? 0 : 1], b[k][i][r() < .5 ? 0 : 1]]); return h; },
  fenotipo(g) {
    const suma = k => g[k].reduce((s, p) => s + p[0] + p[1], 0), ojos = g.ojos.flat(), o = ojos.includes('B') ? 'café' : ojos.includes('G') ? 'verde' : 'azul', rz = g.rizo[0][0] + g.rizo[0][1];
    const piel = suma('piel') / 12, pelo = suma('pelo') / 6, talla = (suma('talla') - 8) / 8;
    return { piel, ojos: o, pelo, rizo: ['liso', 'ondulado', 'rizado'][rz], talla, estaturaAdulta: (g.sexo === 'f' ? 1.62 : 1.75) * (1 + .052 * talla) };
  }
};
class Persona {
  /* op: { sexo, edad (años), estatura (m), masa (kg), forma (0 sedentaria … 1 atleta), genoma, semilla } */
  constructor(op = {}) {
    const r = mulberry32(op.semilla ?? 7); this.genoma = op.genoma || Genetica.azar(r, op.sexo); this.sexo = op.sexo || this.genoma.sexo; this.edad = op.edad ?? 30; this.forma = op.forma ?? .5;
    const F = Genetica.fenotipo(this.genoma), crece = this.edad >= 18 ? 1 : clamp(.42 + .58 * Math.pow(this.edad / 18, .8), .3, 1);
    this.estatura = op.estatura ?? F.estaturaAdulta * crece; this.masa = op.masa ?? 22 * this.estatura * this.estatura * (1 + (this.forma - .5) * .1); this.fen = F;
    this.estado = { energia: 1, hidratacion: 1, temp: 37, fc: this.fcReposo, fatiga: 0 };
  }
  get imc() { return this.masa / (this.estatura * this.estatura); }
  /* proporciones del cuerpo en metros (la cabeza pesa más en los niños) */
  get cuerpo() { const H = this.estatura, k = this.edad < 18 ? clamp(.25 - (this.edad / 18) * (.25 - PROP.cabeza), PROP.cabeza, .25) : PROP.cabeza, f = (1 - k) / (1 - PROP.cabeza); const o = {}; for (const [p, v] of Object.entries(PROP)) o[p] = p === 'cabeza' ? k * H : v * H * f; o.ancho = o.hombros * (.85 + .3 * clamp((this.imc - 18) / 15, 0, 1)); return o; }
  /* metabolismo basal (kcal/día, Mifflin‑St Jeor) */
  get tmb() { return 10 * this.masa + 6.25 * this.estatura * 100 - 5 * this.edad + (this.sexo === 'm' ? 5 : -161); }
  get fcMax() { return 208 - .7 * this.edad; }
  get fcReposo() { return 75 - 20 * this.forma; }
  /* velocidades por el número de Froude con la largura de la pierna */
  get vCamina() { return Math.sqrt(.25 * C.g * this.cuerpo.pierna); }
  get vCambio() { return Math.sqrt(.5 * C.g * this.cuerpo.pierna); }
  get vCorre() { return (3.2 + 5.6 * this.forma) * clamp(this.estatura / 1.75, .5, 1.1) * (this.edad > 40 ? 1 - (this.edad - 40) * .006 : 1) * (this.edad < 14 ? .7 + this.edad * .02 : 1); }
  /* potencia sostenible al pedalear (W): 1,5 W/kg sedentario … 4 W/kg atleta */
  get potencia() { return this.masa * (1.5 + 2.5 * this.forma); }
  /* MET aproximado de una actividad a una velocidad v (m/s) */
  met(act, v = 0) { const kmh = v * 3.6; switch (act) { case 'quieto': return 1.3; case 'camina': return clamp(1 + .55 * kmh, 2, 6); case 'corre': return clamp(kmh * 1.02, 6, 20); case 'pedalea': return clamp(3 + .35 * kmh, 3.5, 16); case 'impulsa': case 'patina': case 'tabla': return clamp(3 + .3 * kmh, 3, 12); case 'sentado': return 1.5; default: return 2; } }
  /* un paso de vida: energía, agua, pulso y temperatura según la actividad y el clima (dt en s de juego) */
  vivir(dt, act, v, clima) {
    const E = this.estado, met = this.met(act, v), kcal = met * 3.5 * this.masa / 200 * dt / 60, umbral = 5 + 5 * this.forma, calor = clima ? clamp(((clima.sensacion ?? clima.temp) - 27) / 12, 0, 1) : 0;
    E.energia = clamp(E.energia - (met > umbral ? (met - umbral) * .0009 : -.0012) * dt * (1 + calor * .6), 0, 1);
    E.hidratacion = clamp(E.hidratacion - (.00002 + met * .000004 * (1 + calor * 2)) * dt, 0, 1);
    const int = clamp((met - 1) / 15, 0, 1), fcObj = this.fcReposo + (this.fcMax - this.fcReposo) * int * (1.15 - .3 * E.energia) * (1 + calor * .1); E.fc = lerp(E.fc, fcObj, Math.min(1, dt * .25));
    E.temp = lerp(E.temp, 37 + int * 1.4 + calor * 1.2 - (clima && clima.temp < 5 ? (5 - clima.temp) * .05 : 0), Math.min(1, dt * .01)); E.fatiga = clamp(1 - E.energia * .7 - E.hidratacion * .3, 0, 1);
    return { kcal, met };
  }
  /* rendimiento físico de este momento (0–1): baja con el cansancio, la sed y el calor */
  get rendimiento() { const E = this.estado; return clamp(.35 + .65 * E.energia, .2, 1) * clamp(.6 + .4 * E.hidratacion, .3, 1) * (E.temp > 39 ? .75 : 1); }
  /* el aspecto del personaje único del motor (MC.Personaje) que sale de su genética */
  aspecto(extra = {}) { const F = this.fen; return Personaje.aspecto(Object.assign({ piel: Math.round(F.piel * 6), colPelo: F.pelo > .8 ? 0 : F.pelo > .55 ? 1 : F.pelo > .35 ? 2 : F.pelo > .2 ? 3 : 4, peinado: { liso: 1, ondulado: 3, rizado: 5 }[F.rizo], estatura: this.estatura / 1.72 }, extra)); }
}
/* ---------- animales ---------- */
const ESPECIES = {
  perro_criollo: { n: 'Perro criollo', plan: 'cuadrupedo', masa: 18, colores: ['#c9935e', '#3b2a1e', '#e8dcc8'], cola: .5 },
  gato: { n: 'Gato', plan: 'cuadrupedo', masa: 4.2, colores: ['#e8a35c', '#5a5a5a', '#f2efe8'], cola: .8 },
  caballo: { n: 'Caballo', plan: 'cuadrupedo', masa: 450, colores: ['#6b3f22', '#2b1a10', '#d9c7a8'], cola: .6 },
  vaca: { n: 'Vaca', plan: 'cuadrupedo', masa: 600, colores: ['#f2efe8', '#1d1f24'], cola: .5 },
  zarigueya: { n: 'Zarigüeya (chucha)', plan: 'cuadrupedo', masa: 2.5, colores: ['#9a9890', '#f2efe8'], cola: 1.1 },
  ardilla: { n: 'Ardilla de cola roja', plan: 'cuadrupedo', masa: .3, colores: ['#a5532a', '#e8a35c'], cola: 1.2 },
  iguana: { n: 'Iguana', plan: 'reptil', masa: 4, colores: ['#5f9a3a', '#3d6b2a'], cola: 1.6 },
  gallina: { n: 'Gallina', plan: 'ave_suelo', masa: 2, colores: ['#c45a2a', '#e8dcc8', '#d92b2b'], cola: .3 },
  gallinazo: { n: 'Gallinazo', plan: 'ave', masa: 2, colores: ['#1d1f24', '#3b3d42'], envergadura: 1.45 },
  colibri: { n: 'Colibrí', plan: 'ave', masa: .004, colores: ['#2e9d55', '#c43a26'], envergadura: .11 },
  paloma: { n: 'Paloma', plan: 'ave', masa: .35, colores: ['#8e96a3', '#5d6573'], envergadura: .65 },
  sabaleta: { n: 'Sabaleta', plan: 'pez', masa: .4, colores: ['#9fb4c8', '#d9e4ee'] },
  mariposa: { n: 'Mariposa', plan: 'insecto_volador', masa: .0005, colores: ['#f0a030', '#1d1f24'], envergadura: .08 },
  hormiga_arriera: { n: 'Hormiga arriera', plan: 'insecto', masa: .00002, colores: ['#8a3a22'] }
};
const Animal = {
  ESPECIES,
  /* lo que dice la masa (kg): alometría de los vertebrados terrestres */
  alometria(M, plan = 'cuadrupedo', g = C.g) {
    const k = Math.sqrt(C.g / g), cadera = .17 * Math.pow(M, .36), vmax = plan === 'pez' ? .9 * Math.pow(M, .19) : plan.startsWith('ave') && plan !== 'ave_suelo' ? 14 * Math.pow(M, .12) : 25.5 * Math.pow(M, .26) * (1 - Math.exp(-22 * Math.pow(M, -.6))) / 3.6;
    return { metabolismoW: 3.4 * Math.pow(M, .75), cadera, vmax: vmax * (plan.startsWith('ave') ? 1 : k), pulso: 241 * Math.pow(M, -.25), longevidad: 11.8 * Math.pow(M, .2), largo: .45 * Math.pow(M, .33) * (plan === 'reptil' ? 1.6 : 1), comidaKgDia: 3.4 * Math.pow(M, .75) * 86400 / 1.6e7 };
  },
  /* la marcha que toca a una velocidad (número de Froude con la altura de la cadera) */
  marcha(v, cadera, g = C.g) { const Fr = v * v / (g * Math.max(.01, cadera)); return Fr < .5 ? 'paso' : Fr < 2.5 ? 'trote' : 'galope'; },
  crear(id, semilla = 1) { const E = ESPECIES[id]; if (!E) throw new Error('especie desconocida: ' + id); const r = mulberry32(semilla), M = E.masa * (.85 + r() * .3); return Object.assign({ id, especie: E.n, plan: E.plan, masa: M, colores: E.colores, cola: E.cola || .4, envergadura: E.envergadura, semilla }, Animal.alometria(M, E.plan)); },
  /* criatura inventada: patas, segmentos, alas… y si es verosímil con la gravedad de su planeta (ley cuadrado‑cubo) */
  criatura(op = {}) {
    const g = op.gravedad ?? C.g, M = op.masa ?? 80, patas = op.patas ?? 6, seg = op.segmentos ?? 3, r = mulberry32(op.semilla ?? 3), A = Animal.alometria(M, 'cuadrupedo', g);
    const sigma = 30e6, carga = 3 * M * g / Math.max(1, Math.min(patas, 4)), diam = 2 * Math.sqrt(carga / (Math.PI * sigma)), relDiam = diam / A.cadera;   // hueso que aguanta 3 veces el peso (al correr) con un esfuerzo admisible de 30 MPa (fluencia del hueso ~120 MPa / 4)
    const verosimil = relDiam < .032;   // un saurópodo de 70 t en la Tierra da ~0,016: el doble es el límite de lo creíble
    return Object.assign({ id: 'criatura', especie: op.nombre || 'Criatura', plan: 'alien', patas, segmentos: seg, alas: !!op.alas, ojos: op.ojos ?? (2 + (r() * 3 | 0) * 2), masa: M, gravedad: g, colores: op.colores || ['#7e57c2', '#26c6da', '#ffca28'], huesoRelativo: relDiam, verosimil, nota: verosimil ? 'Sus patas aguantan su peso con esta gravedad.' : 'Con esta gravedad sus patas tendrían que ser muy gruesas: hazla más liviana, con más patas o en un planeta de menos gravedad.' }, A);
  }
};
/* dibujo de lado de un animal o criatura: cuerpo, cabeza, patas que se mueven con su marcha, cola, alas o aletas */
MC.arte.pieles.motor.animalLado = function (g, a, x, y, esc, dir = 1, t = 0, v = 0) {
  const k = esc, X = u => x + u * k * dir, Y = w => y - w * k, c0 = a.colores[0], c1 = a.colores[1] || tono(c0, -.3), L = a.largo || .5, h = a.cadera || .3;
  if (a.plan === 'ave' || a.plan === 'insecto_volador') { const e = (a.envergadura || .5) / 2, alt = h + .2, aleteo = Math.sin(t * (a.plan === 'insecto_volador' ? 30 : a.masa < .01 ? 60 : 6)) * e * .8; g.fillStyle = c0; g.beginPath(); g.ellipse(X(0), Y(alt), L * .5 * k, L * .18 * k, 0, 0, TAU); g.fill(); g.strokeStyle = c1; g.lineWidth = Math.max(1, L * .12 * k); g.beginPath(); g.moveTo(X(-e * .2), Y(alt)); g.lineTo(X(-e * .5), Y(alt + aleteo)); g.moveTo(X(e * .1), Y(alt)); g.lineTo(X(-e * .2), Y(alt + aleteo * .9)); g.stroke(); g.fillStyle = c1; g.beginPath(); g.arc(X(L * .45), Y(alt + L * .08), L * .14 * k, 0, TAU); g.fill(); return; }
  if (a.plan === 'pez') { const o = Math.sin(t * 8) * .1; g.fillStyle = c0; g.beginPath(); g.ellipse(X(0), Y(h), L * .5 * k, L * .18 * k, o * .3, 0, TAU); g.fill(); g.beginPath(); g.moveTo(X(-L * .45), Y(h)); g.lineTo(X(-L * .7), Y(h + L * .15 + o)); g.lineTo(X(-L * .7), Y(h - L * .15 + o)); g.fill(); return; }
  const patas = a.plan === 'alien' ? a.patas : a.plan === 'ave_suelo' ? 2 : a.plan === 'insecto' ? 6 : 4, fase = t * (2 + v / Math.max(.05, h)) * 1.5, cuerpoY = h + (a.plan === 'reptil' ? -h * .5 : 0);
  g.lineCap = 'round';
  for (let i = 0; i < patas; i++) { const u = patas === 2 ? 0 : (i / (patas - 1) - .5) * L * .7, ph = fase + (i % 2) * Math.PI + (patas > 4 ? i * .6 : 0), sw = Math.sin(ph) * h * .35, lev = Math.max(0, Math.cos(ph)) * h * .15; g.strokeStyle = i % 2 ? tono(c0, -.25) : c0; g.lineWidth = Math.max(1, L * .09 * k * (a.huesoRelativo ? 1 + a.huesoRelativo : 1)); g.beginPath(); g.moveTo(X(u), Y(cuerpoY)); g.lineTo(X(u + sw * .5), Y(cuerpoY * .45 + lev)); g.lineTo(X(u + sw), Y(lev)); g.stroke(); }
  const segs = a.plan === 'alien' ? a.segmentos : 1; g.fillStyle = c0; for (let s = 0; s < segs; s++) { const u = segs === 1 ? 0 : (s / (segs - 1) - .5) * L * .8; g.beginPath(); g.ellipse(X(u), Y(cuerpoY + h * .15), L * .5 / Math.sqrt(segs) * k, Math.max(h * .3, L * .16) * k, 0, 0, TAU); g.fill(); }
  if (a.cola) { g.strokeStyle = c0; g.lineWidth = Math.max(1, L * .07 * k); g.beginPath(); g.moveTo(X(-L * .45), Y(cuerpoY + h * .2)); g.quadraticCurveTo(X(-L * (.5 + a.cola * .4)), Y(cuerpoY + h * .5 + Math.sin(t * 3) * h * .1), X(-L * (.5 + a.cola * .6)), Y(cuerpoY + h * (.35 + .2 * Math.sin(t * 3)))); g.stroke(); }
  const hx = L * .52, hy = cuerpoY + h * .45; g.fillStyle = c0; g.beginPath(); g.ellipse(X(hx), Y(hy), L * .17 * k, L * .14 * k, 0, 0, TAU); g.fill();
  g.fillStyle = '#141414'; const ojos = a.plan === 'alien' ? a.ojos : 1; for (let o = 0; o < ojos; o++) { g.beginPath(); g.arc(X(hx + L * .07), Y(hy + L * .03 + (o - (ojos - 1) / 2) * L * .05), Math.max(1, L * .025 * k), 0, TAU); g.fill(); }
  if (a.plan === 'ave_suelo') { g.fillStyle = a.colores[2] || '#d92b2b'; g.beginPath(); g.arc(X(hx), Y(hy + L * .14), L * .05 * k, 0, TAU); g.fill(); }
};
MC.Seres = { Persona, Animal, Genetica, GENES, PROP, ESPECIES };
