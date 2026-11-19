/* =====================================================================
   VEHÍCULOS · un solo registro para todos los juegos (el JE.vehiculos de Juega EnCicla llevado al motor)
   Cifras en unidades reales (m/s, m/s², rad/s, m, kg). Cada juego puede multiplicar la velocidad
   (Juega EnCicla es más arcade: MC.Vehiculos.escala = …) y poner su dibujo con MC.arte.
   clase: 'pie' | 'rueda' (micromovilidad) | 'moto' | 'auto' | 'pesado' | 'riel' | 'cable' | 'aire' | 'agua'
   cuerpo: cómo va el personaje (pedalea, impulsa, tabla, patina, sentado)
   run: 1 si se puede correr Run en la ciclovía con él · futuro: 1 si es de los juegos que vienen (Motor City, Extremo)
   ===================================================================== */
const VEH_SUELO_RUEDA = [.55, .25, .3, .3, 1, 1, .7, 1.15, 0, 0, .85, 1, .75, 0, .95, .9, .35];   // por tipo de casilla (TT)
const VEH_SUELO_PIE = [.85, .6, .7, .7, .95, .95, 1, 1, 0, 0, 1, 1, 1, 0, .9, 1, .8];
const VEH_SUELO_CARRO = [.25, .1, 0, 0, 1, 1, .3, .5, 0, 0, .5, 1, 0, 0, 1, .9, 0];
const VEH_LISTA = [
  /* a pie y micromovilidad (Juega EnCicla, Run Scooter y Gemini) */
  { id: 'pie', n: 'A pie', icon: '🚶', clase: 'pie', cuerpo: 'pie', vmax: 1.6, vcorre: 4.6, acc: 3, freno: 8, giro: [6, 5], largo: .5, ancho: .5, masa: 70, suelo: VEH_SUELO_PIE, loma: [1.1, .6, 1.15], salto: 1, run: 1 },
  { id: 'bici', n: 'Bici EnCicla', icon: '🚲', clase: 'rueda', cuerpo: 'pedalea', vmax: 7.5, acc: 1.6, freno: 4.5, giro: [3.2, 1.4], largo: 1.8, ancho: .6, masa: 95, suelo: VEH_SUELO_RUEDA, loma: [2.2, .5, 1.32], timbre: 1, salto: 1, run: 1, color: '#7ab800', manubrio: [.42, 1.0] },
  { id: 'bici_propia', n: 'Bici propia', icon: '🚴', de: 'bici', color: '#29b6f6' },
  { id: 'ebike', n: 'Bici eléctrica', icon: '⚡', de: 'bici', vmax: 8.3, acc: 2.2, electrico: 1, loma: [.4, .85, 1.15], color: '#2fa8dc' },
  { id: 'bmx', n: 'BMX', icon: '🚲', de: 'bici', vmax: 7, acc: 2, giro: [4, 1.8], salto: 1.6, trucos: 1, color: '#e53935', futuro: 1 },
  { id: 'mtb', n: 'Bici de montaña', icon: '🚵', de: 'bici', vmax: 8, suelo: [.85, .7, .5, .5, .95, .95, .75, 1.05, 0, 0, .85, .95, .75, 0, .9, .9, .55], color: '#43a047', futuro: 1 },
  { id: 'ruta', n: 'Bici de ruta', icon: '🚴', de: 'bici', vmax: 11, acc: 1.8, giro: [2.6, 1.1], color: '#fdd835', futuro: 1 },
  { id: 'patinete', n: 'Patinete clásico', icon: '🛴', clase: 'rueda', cuerpo: 'impulsa', vmax: 5.5, acc: 1.4, freno: 3.5, giro: [3.5, 1.6], largo: 1.1, ancho: .45, masa: 78, suelo: VEH_SUELO_RUEDA, loma: [2.6, .45, 1.4], run: 1, color: '#c9d1db', manubrio: [.38, 1.0] },
  { id: 'scooter', n: 'Scooter eléctrico', icon: '🛵', de: 'patinete', cuerpo: 'tabla', vmax: 7, acc: 2.4, electrico: 1, loma: [.5, .8, 1.15], color: '#29b6f6' },
  { id: 'monopatin', n: 'Monopatín eléctrico', icon: '🔋', de: 'patinete', cuerpo: 'tabla', vmax: 7.5, acc: 2.6, electrico: 1, loma: [.5, .8, 1.15], suelo: [.3, .1, .2, .2, 1, 1, .7, 1.15, 0, 0, .85, 1, .75, 0, .95, .9, .2], color: '#1f242e' },
  { id: 'monociclo', n: 'Monociclo eléctrico', icon: '🛞', de: 'patinete', cuerpo: 'tabla', vmax: 6.5, acc: 2, electrico: 1, giro: [4.5, 2], largo: .5, color: '#7e57c2' },
  { id: 'skate', n: 'Skate', icon: '🛹', clase: 'rueda', cuerpo: 'impulsa', vmax: 5.5, acc: 1.3, freno: 2.5, giro: [4.2, 1.8], largo: .82, ancho: .22, masa: 72, suelo: [.1, .05, .2, .2, 1, 1, .8, 1.1, 0, 0, .95, 1, .8, 0, .9, .9, .1], loma: [3, .4, 1.5], salto: 1.3, trucos: 1, run: 1, color: '#d9a066' },
  { id: 'longboard', n: 'Longboard', icon: '🛹', de: 'skate', vmax: 7, giro: [3, 1.2], largo: 1.05, loma: [3.4, .4, 1.7], color: '#8d6e63' },
  { id: 'patines', n: 'Patines en línea', icon: '🛼', clase: 'rueda', cuerpo: 'patina', vmax: 6, acc: 1.6, freno: 3, giro: [4, 1.9], largo: .4, ancho: .4, masa: 70, suelo: VEH_SUELO_RUEDA, loma: [2.6, .45, 1.4], salto: 1.1, run: 1, color: '#ff5a36' },
  { id: 'quad', n: 'Patines quad', icon: '🛼', de: 'patines', vmax: 5.5, giro: [4.5, 2.1], color: '#f06292' },
  { id: 'triciclo', n: 'Triciclo de carga', icon: '🚲', de: 'bici', vmax: 5.5, acc: 1, giro: [2.2, 1], largo: 2.4, ancho: 1.1, masa: 160, carga: 1, color: '#ffb300' },
  { id: 'jetpack', n: 'Jetpack', icon: '🚀', clase: 'aire', cuerpo: 'pie', vmax: 14, acc: 5, freno: 5, giro: [3, 2], largo: .6, ancho: .6, masa: 90, suelo: VEH_SUELO_PIE, loma: [0, 1, 1], vuela: 1, techo: 60, run: 1, futuro: 1, color: '#ff7043' },
  /* motor (Juega EnCicla: camión de Balance; El Metro: buses; Motor City: carros, motos y lo que viene) */
  { id: 'moto', n: 'Moto', icon: '🏍️', clase: 'moto', cuerpo: 'sentado', vmax: 22, acc: 5, freno: 8, giro: [2.6, .9], largo: 2, ancho: .8, masa: 260, suelo: VEH_SUELO_CARRO, loma: [.3, .85, 1.1], electrico: 0, via: 1, salto: .4, color: '#1d1f24', manubrio: [.5, 1.05] },
  { id: 'carro', n: 'Carro', icon: '🚗', clase: 'auto', cuerpo: 'sentado', vmax: 25, acc: 3.6, freno: 8.5, giro: [1.8, .55], largo: 4.3, ancho: 1.8, masa: 1200, suelo: VEH_SUELO_CARRO, loma: [.2, .9, 1.05], via: 1, color: '#c43a26' },
  { id: 'taxi', n: 'Taxi', icon: '🚕', de: 'carro', color: '#f2c400' },
  { id: 'camion', n: 'Camión de Balance', icon: '🚚', clase: 'pesado', cuerpo: 'sentado', vmax: 14, acc: 1.6, freno: 6, giro: [1.2, .4], largo: 6.5, ancho: 2.3, masa: 6500, suelo: VEH_SUELO_CARRO, loma: [.6, .6, 1.08], via: 1, color: '#7ab800' },
  { id: 'buseta', n: 'Buseta', icon: '🚌', de: 'camion', vmax: 15, largo: 9.5, color: '#e9eef3' },
  { id: 'deportivo', n: 'Deportivo', icon: '🏎️', de: 'carro', vmax: 55, acc: 8.5, freno: 11, giro: [2, .45], color: '#ff1744', futuro: 1 },
  { id: 'formula', n: 'Fórmula', icon: '🏁', de: 'carro', vmax: 90, acc: 14, freno: 30, giro: [2.2, .5], largo: 5.6, ancho: 2, masa: 800, color: '#d50000', futuro: 1 },
  { id: 'nascar', n: 'Óvalo (NASCAR)', icon: '🏁', de: 'carro', vmax: 80, acc: 9, freno: 14, largo: 5.2, masa: 1500, color: '#2962ff', futuro: 1 },
  { id: 'drift', n: 'Carro de drift', icon: '💨', de: 'carro', vmax: 45, acc: 7, deriva: 1, color: '#00e5ff', futuro: 1 },
  { id: 'todoterreno', n: 'Todoterreno', icon: '🚙', de: 'carro', vmax: 30, suelo: [.8, .65, 0, 0, 1, 1, .6, .7, 0, 0, .8, 1, 0, 0, 1, .9, .3], via: 0, color: '#6d4c41', futuro: 1 },
  /* aire y agua (los juegos que vienen) */
  { id: 'avioneta', n: 'Avioneta', icon: '🛩️', clase: 'aire', cuerpo: 'sentado', vmax: 60, vmin: 22, acc: 6, freno: 3, giro: [.9, .7], largo: 8, ancho: 10, masa: 900, suelo: VEH_SUELO_CARRO, loma: [0, 1, 1], vuela: 1, techo: 1200, color: '#eceff1', futuro: 1 },
  { id: 'avion', n: 'Avión de combate', icon: '✈️', de: 'avioneta', vmax: 260, vmin: 70, acc: 30, giro: [1.6, 1.1], techo: 9000, color: '#78909c', futuro: 1 },
  { id: 'lancha', n: 'Lancha', icon: '🚤', clase: 'agua', cuerpo: 'sentado', vmax: 20, acc: 4, freno: 3, giro: [1.4, .7], largo: 5, ancho: 2, masa: 700, suelo: [0, 0, 0, 0, 0, 0, 0, 0, 1, .7, 0, 0, 0, 0, 0, 0, 0], loma: [0, 1, 1], color: '#ffffff', futuro: 1 },
  { id: 'surf', n: 'Tabla de surf', icon: '🏄', de: 'lancha', cuerpo: 'tabla', vmax: 9, largo: 2.2, ancho: .6, masa: 75, color: '#ffca28', futuro: 1 },
  /* transporte público (se aborda; lo maneja el horario o el juego) */
  { id: 'metro', n: 'Tren del metro', icon: '🚇', clase: 'riel', cuerpo: 'sentado', vmax: 22, acc: 1.1, freno: 1.3, giro: [0, 0], largo: 120, ancho: 3.2, masa: 200000, suelo: VEH_SUELO_CARRO, loma: [0, 1, 1], color: '#1c5c9c', publico: 1 },
  { id: 'tranvia', n: 'Tranvía de Ayacucho', icon: '🚋', de: 'metro', vmax: 14, largo: 42, color: '#59ab42' },
  { id: 'cable', n: 'Metrocable', icon: '🚡', clase: 'cable', cuerpo: 'sentado', vmax: 5, acc: 1, freno: 1, giro: [0, 0], largo: 3, ancho: 2.2, masa: 1400, suelo: VEH_SUELO_CARRO, loma: [0, 1, 1], color: '#e38835', publico: 1 },
  { id: 'metroplus', n: 'Metroplús', icon: '🚍', de: 'buseta', largo: 18, color: '#0e6f76', publico: 1 }
];
const Vehiculos = {
  lista: new Map(), escala: 1,
  /* registra (o completa) un vehículo: lo que no diga lo hereda de su base `de` */
  registrar(def) {
    const base = def.de ? this.lista.get(def.de) : null; if (def.de && !base) throw new Error('base desconocida: ' + def.de);
    const v = Object.assign({ juegos: ['*'] }, base || {}, def); if (base) v.de = def.de;
    if (v.suelo && v.suelo.length < 20) { const S = v.suelo.slice(); S[17] = S[17] ?? (v.clase === 'agua' ? 0 : S[0] * .75); S[18] = S[18] ?? (v.clase === 'agua' ? 0 : S[0] * .45); S[19] = S[19] ?? (v.clase === 'agua' ? 0 : S[1] * .8); v.suelo = S; }   // arena, nieve y roca
    this.lista.set(v.id, v); MC.emit('vehiculo', v); return v;
  },
  get(id) { return this.lista.get(id) || this.lista.get('pie'); },
  /* los que se pueden elegir en un juego (filtro opcional) */
  de(juego, filtro) { return [...this.lista.values()].filter(v => (v.juegos.includes('*') || v.juegos.includes(juego)) && (!filtro || filtro(v))); },
  /* cuánto rinde en una casilla (0 = no entra) y en una pendiente */
  suelo(v, tt) { return (v.suelo || VEH_SUELO_RUEDA)[tt] ?? 0; },
  loma(v, p) { const [k, a, b] = v.loma || [1, .6, 1.2]; return clamp(1 - k * p, a, b); }
};
for (const d of VEH_LISTA) Vehiculos.registrar(d);
MC.Vehiculos = Vehiculos;
