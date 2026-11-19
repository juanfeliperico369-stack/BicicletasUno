/* =====================================================================
   TIEMPO DEL MUNDO · reloj, calendario colombiano (festivos de la Ley Emiliani), cielo por hora,
   sol y luna (posición astronómica para la latitud de la ciudad) y clima.
   Las mismas reglas para todos los juegos: a la misma fecha y hora, el mismo cielo y el mismo clima.
   ===================================================================== */
const Calendario = {
  pascua(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mes - 1, dia); },
  _cache: new Map(),
  /* festivos de Colombia del año: { 'aaaa-mm-dd': nombre } */
  festivos(y) {
    if (this._cache.has(y)) return this._cache.get(y);
    const F = {}, f = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const fijo = (m, d, n) => { F[f(new Date(y, m - 1, d))] = n; };
    const lunes = (d, n) => { const w = d.getDay(), k = w === 1 ? 0 : (8 - w) % 7; F[f(new Date(d.getFullYear(), d.getMonth(), d.getDate() + k))] = n; };
    fijo(1, 1, 'Año Nuevo'); fijo(5, 1, 'Día del Trabajo'); fijo(7, 20, 'Día de la Independencia'); fijo(8, 7, 'Batalla de Boyacá'); fijo(12, 8, 'Inmaculada Concepción'); fijo(12, 25, 'Navidad');
    for (const [m, d, n] of [[1, 6, 'Reyes Magos'], [3, 19, 'San José'], [6, 29, 'San Pedro y San Pablo'], [8, 15, 'Asunción de la Virgen'], [10, 12, 'Día de la Raza'], [11, 1, 'Todos los Santos'], [11, 11, 'Independencia de Cartagena']]) lunes(new Date(y, m - 1, d), n);
    const P = this.pascua(y), mas = k => new Date(y, P.getMonth(), P.getDate() + k);
    F[f(mas(-3))] = 'Jueves Santo'; F[f(mas(-2))] = 'Viernes Santo'; F[f(mas(43))] = 'Ascensión del Señor'; F[f(mas(64))] = 'Corpus Christi'; F[f(mas(71))] = 'Sagrado Corazón';
    this._cache.set(y, F); return F;
  },
  festivo(d) { const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); return this.festivos(d.getFullYear())[k] || null; },
  domingoOFestivo(d) { return d.getDay() === 0 || !!this.festivo(d); },
  diaDelAño(d) { return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); },
  /* fiestas de la ciudad (cada juego puede sumar las suyas) */
  fiestas: [
    { id: 'flores', nombre: 'Feria de las Flores', desde: [8, 1], hasta: [8, 10] },
    { id: 'alumbrados', nombre: 'Alumbrados navideños', desde: [12, 1], hasta: [1, 7] },
    { id: 'velitas', nombre: 'Noche de las velitas', desde: [12, 7], hasta: [12, 7] }
  ],
  fiestasEn(d) { const m = d.getMonth() + 1, dd = d.getDate(), v = m * 100 + dd; return this.fiestas.filter(F => { const a = F.desde[0] * 100 + F.desde[1], b = F.hasta[0] * 100 + F.hasta[1]; return a <= b ? v >= a && v <= b : v >= a || v <= b; }); }
};

/* ---------- reloj del juego: minutos del día (0–1440) que avanzan a la velocidad elegida ---------- */
class Reloj {
  constructor(op = {}) { const d = op.fecha ? new Date(op.fecha) : new Date(); this.fecha = new Date(d.getFullYear(), d.getMonth(), d.getDate()); this.min = op.min != null ? op.min : d.getHours() * 60 + d.getMinutes(); this.vel = op.vel != null ? op.vel : 1; this.pausa = false; }
  /* dt en segundos reales; vel = minutos de juego por segundo real (1 = un minuto por segundo) */
  avanzar(dt) { if (this.pausa) return; this.min += dt * this.vel; while (this.min >= 1440) { this.min -= 1440; this.fecha = new Date(this.fecha.getFullYear(), this.fecha.getMonth(), this.fecha.getDate() + 1); MC.emit('dia', this.fecha); } }
  get hora() { return this.min / 60; }
  get dia() { return this.fecha.getDay(); }
  get domingo() { return Calendario.domingoOFestivo(this.fecha); }
  get festivo() { return Calendario.festivo(this.fecha); }
  texto() { const h = Math.floor(this.min / 60) % 24, m = Math.floor(this.min % 60), h12 = ((h + 11) % 12) + 1; return h12 + ':' + String(m).padStart(2, '0') + (h < 12 ? ' a. m.' : ' p. m.'); }
  /* segundos desde la medianoche: la referencia común de horarios (transporte, semáforos) */
  get seg() { return this.min * 60; }
}

/* ---------- cielo: colores por hora, sol y luna ---------- */
const CIELO_KF = [   // hora, cénit, horizonte, bruma (0..1)
  [0, [.03, .05, .13], [.08, .1, .2], [.1, .12, .2]], [4.6, [.05, .07, .17], [.12, .13, .25], [.14, .15, .24]],
  [5.6, [.2, .25, .45], [.85, .55, .45], [.6, .5, .5]], [6.4, [.35, .55, .85], [.98, .8, .6], [.8, .75, .7]],
  [8, [.32, .58, .92], [.72, .84, .95], [.78, .84, .9]], [12, [.27, .55, .93], [.68, .82, .96], [.78, .85, .92]],
  [16.5, [.3, .55, .9], [.75, .82, .92], [.8, .84, .9]], [17.8, [.32, .42, .72], [.98, .66, .42], [.86, .66, .52]],
  [18.4, [.2, .22, .45], [.86, .42, .36], [.55, .36, .38]], [19.2, [.07, .09, .22], [.25, .2, .35], [.2, .18, .28]], [24, [.03, .05, .13], [.08, .1, .2], [.1, .12, .2]]
];
const Cielo = {
  /* la posición del sol: altura y acimut (rad) para la latitud de la ciudad (6,24° N en el valle) */
  sol(fecha, hora, lat = 6.24) {
    const n = Calendario.diaDelAño(fecha), dec = -23.44 * Math.PI / 180 * Math.cos(TAU / 365 * (n + 10)), H = (hora - 12) * 15 * Math.PI / 180, la = lat * Math.PI / 180;
    const alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H));
    const az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(la) - Math.sin(la) * Math.cos(H));   // desde el norte, en sentido horario
    return { alt, az, x: Math.sin(az) * Math.cos(alt), y: -Math.cos(az) * Math.cos(alt), z: Math.sin(alt) };   // x oriente, y sur (como el mapa), z arriba
  },
  /* luna: aproximación (fase por el ciclo sinódico y medio día corrido del sol) */
  luna(fecha, hora) { const ref = Date.UTC(2000, 0, 6, 18, 14), dias = (fecha.getTime() + hora * 36e5 - ref) / 864e5, fase = ((dias / 29.530588) % 1 + 1) % 1, s = this.sol(fecha, (hora - fase * 24 + 48) % 24); return Object.assign(s, { fase }); },
  /* colores y luces a esta hora: { top, hor, bruma, dia (0..1), noche (0..1), sol, luna, ambiente, luzSol } */
  en(fecha, hora, clima) {
    let i = 0; while (i < CIELO_KF.length - 2 && CIELO_KF[i + 1][0] <= hora) i++;
    const a = CIELO_KF[i], b = CIELO_KF[i + 1], t = suave((hora - a[0]) / (b[0] - a[0] || 1));
    let top = mez3(a[1], b[1], t), hor = mez3(a[2], b[2], t), bruma = mez3(a[3], b[3], t);
    const s = this.sol(fecha, hora), dia = clamp((s.alt + .1) / .35, 0, 1), noche = clamp((-s.alt - .02) / .2, 0, 1);
    if (clima) { const nub = clima.nubes * .6 + clima.lluvia * .4, gris = mez3([.55, .58, .62], [.12, .13, .17], noche); top = mez3(top, gris, nub * .7); hor = mez3(hor, mez3(gris, [1, 1, 1], .15), nub * .6); bruma = mez3(bruma, gris, nub * .5 + clima.niebla * .4); }
    const nubes = clima ? clima.nubes : .2;
    return { top, hor, bruma, dia, noche, sol: s, luna: this.luna(fecha, hora), ambiente: .28 + .62 * dia * (1 - nubes * .35), luzSol: dia * (1 - nubes * .6), atardecer: clamp(1 - Math.abs(hora - 18) / .9, 0, 1) + clamp(1 - Math.abs(hora - 6) / .8, 0, 1) };
  }
};

/* ---------- clima: el mismo para todos a la misma fecha y hora ----------
   Se decide por bloques de 3 h con un azar fijo (fecha + bloque) y la probabilidad del mes y de la hora;
   entre bloques se pasa suave. Un juego puede forzarlo (clima.forzar('lluvia')). */
class Clima {
  constructor(cfg) { this.cfg = (cfg && cfg.clima) || { lluvia_mes: Array(12).fill(.35), hora_lluvia: [14, 19], temp_media_c: 22, amplitud_c: 6 }; this.forzado = null; this.lluvia = 0; this.nubes = .2; this.niebla = 0; this.viento = { v: 2, dir: 0 }; this.tormenta = 0; this.rayo = 0; this.temp = 22; this.tipo = 'despejado'; }
  _bloque(fecha, b) {
    const sem = (fecha.getFullYear() * 400 + fecha.getMonth() * 32 + fecha.getDate()) * 8 + b, r = h2(sem, 7, 77), r2 = h2(sem, 9, 78), C = this.cfg;
    const pm = C.lluvia_mes[fecha.getMonth()], hc = (b * 3 + 1.5 >= C.hora_lluvia[0] && b * 3 + 1.5 <= C.hora_lluvia[1] + 1) ? 1.6 : b * 3 < 6 ? .6 : .8, p = clamp(pm * hc * .55, 0, .9);
    if (r < p * .25) return { tipo: 'tormenta', lluvia: .95, nubes: 1, niebla: .2, tormenta: 1, viento: 7 };
    if (r < p) return { tipo: 'lluvia', lluvia: .45 + r2 * .35, nubes: .9, niebla: .1, tormenta: 0, viento: 4 };
    if (r < p + .2) return { tipo: 'nublado', lluvia: 0, nubes: .65 + r2 * .25, niebla: b < 3 ? .35 : .05, tormenta: 0, viento: 3 };
    if (b <= 2 && r2 < .35) return { tipo: 'niebla', lluvia: 0, nubes: .4, niebla: .6, tormenta: 0, viento: 1 };
    return { tipo: 'despejado', lluvia: 0, nubes: .1 + r2 * .25, niebla: 0, tormenta: 0, viento: 2 };
  }
  forzar(tipo) { this.forzado = tipo || null; }
  /* actualiza con la fecha y la hora del reloj; dt para suavizar y para los rayos */
  actualizar(reloj, dt = 0) {
    const h = reloj.hora, b = Math.floor(h / 3) % 8, f = (h % 3) / 3;
    const A = this.forzado ? this._forzado(this.forzado) : this._bloque(reloj.fecha, b), B = this.forzado ? A : this._bloque(b === 7 ? new Date(reloj.fecha.getFullYear(), reloj.fecha.getMonth(), reloj.fecha.getDate() + 1) : reloj.fecha, (b + 1) % 8);
    const k = f > .8 ? suave((f - .8) / .2) : 0, ob = { lluvia: lerp(A.lluvia, B.lluvia, k), nubes: lerp(A.nubes, B.nubes, k), niebla: lerp(A.niebla, B.niebla, k), tormenta: lerp(A.tormenta, B.tormenta, k), viento: lerp(A.viento, B.viento, k) };
    const s = dt > 0 ? Math.min(1, dt * .8) : 1;
    this.lluvia = lerp(this.lluvia, ob.lluvia, s); this.nubes = lerp(this.nubes, ob.nubes, s); this.niebla = lerp(this.niebla, ob.niebla, s); this.tormenta = lerp(this.tormenta, ob.tormenta, s);
    this.viento.v = lerp(this.viento.v, ob.viento + Math.sin(reloj.min * .7) * 1.2, s); this.viento.dir = h2(reloj.fecha.getDate(), b, 5) * TAU;
    this.tipo = k > .5 ? B.tipo : A.tipo;
    this.temp = this.cfg.temp_media_c + this.cfg.amplitud_c * Math.sin((h - 9) / 24 * TAU) * .5 - this.lluvia * 3;
    if (this.tormenta > .5 && dt > 0) { this.rayo = Math.max(0, this.rayo - dt * 4); if (Math.random() < dt * .12 * this.tormenta) { this.rayo = 1; MC.emit('rayo', this); } } else this.rayo = 0;
    return this;
  }
  _forzado(t) { return { despejado: { tipo: t, lluvia: 0, nubes: .15, niebla: 0, tormenta: 0, viento: 2 }, nublado: { tipo: t, lluvia: 0, nubes: .85, niebla: .05, tormenta: 0, viento: 3 }, lluvia: { tipo: t, lluvia: .7, nubes: .95, niebla: .1, tormenta: 0, viento: 4 }, tormenta: { tipo: t, lluvia: 1, nubes: 1, niebla: .2, tormenta: 1, viento: 8 }, niebla: { tipo: t, lluvia: 0, nubes: .5, niebla: .75, tormenta: 0, viento: 1 } }[t] || this._bloque(new Date(), 4); }
  texto() { return { despejado: '☀️ Despejado', nublado: '☁️ Nublado', lluvia: '🌧️ Lluvia', tormenta: '⛈️ Tormenta', niebla: '🌫️ Niebla' }[this.tipo] + ' · ' + Math.round(this.temp) + ' °C'; }
}
Object.assign(MC, { Calendario, Reloj, Cielo, Clima });
