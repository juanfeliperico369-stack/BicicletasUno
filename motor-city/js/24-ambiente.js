/* =====================================================================
   AMBIENTE GLOBAL · clima y estaciones para cualquier lugar del planeta (o inventado)
   - Temperatura por latitud, altura (−6,5 °C/km), estación del año (hemisferio norte o sur) y hora del día.
   - Tipos de clima: tropical, montaña tropical, monzón, mediterráneo, templado, continental, desierto y polar.
   - Precipitación por bloques de 3 h (determinista: la misma para todos a la misma fecha y hora): lluvia, tormenta
     eléctrica, granizo, NIEVE (si hace frío) y su capa que se acumula y se derrite; niebla cuando el aire llega al
     punto de rocío con poco viento; olas de CALOR; viento con ráfagas; humedad, índice de calor y sensación térmica.
   - Efectos físicos: agarre de las llantas según el clima, visibilidad para las vistas y la IA, y calor para la biología.
   Misma interfaz que MC.Clima (lluvia, nubes, niebla, tormenta, viento, rayo, temp, tipo, texto) más nieve y calor.
   ===================================================================== */
const CLIMAS = {
  tropical: { hum: .78, amp: 4, lluvia: d => .45 + .25 * Math.cos(TAU * 2 * (d - 120) / 365) },
  montana_tropical: { hum: .72, amp: 5, lluvia: d => .38 + .22 * Math.cos(TAU * 2 * (d - 120) / 365) },
  monzon: { hum: .8, amp: 5, lluvia: (d, hs) => .15 + .65 * Math.max(0, Math.cos(TAU * (d - 200 * hs - (hs < 0 ? 182 : 0)) / 365)) },
  mediterraneo: { hum: .55, amp: 9, lluvia: (d, hs) => .12 + .32 * Math.max(0, -Math.cos(TAU * (d - 200 - (hs < 0 ? 182 : 0)) / 365)) },
  templado: { hum: .7, amp: 7, lluvia: () => .38 },
  continental: { hum: .6, amp: 10, lluvia: (d, hs) => .28 + .12 * Math.cos(TAU * (d - 200 - (hs < 0 ? 182 : 0)) / 365) },
  desierto: { hum: .22, amp: 14, lluvia: () => .04 },
  polar: { hum: .65, amp: 5, lluvia: () => .25 }
};
const Ambiente = {
  CLIMAS,
  /* el tipo de clima probable por latitud y altura (se puede fijar a mano) */
  tipoPara(lat, alt = 0) { const a = Math.abs(lat); if (a > 66) return 'polar'; if (a < 23.5) return alt > 1200 ? 'montana_tropical' : 'tropical'; if (a < 35) return 'mediterraneo'; if (a < 50) return 'templado'; return 'continental'; },
  /* temperatura media del día a nivel del mar y su variación por estación (°C) */
  tempMedia(lat, dia) { const a = Math.abs(lat), hs = lat >= 0 ? 1 : -1, base = 28 - .006 * lat * lat - .1 * a, amp = .25 * a, fase = TAU * (dia - (hs > 0 ? 200 : 17)) / 365; return base + amp * Math.cos(fase); },
  estacion(fecha, lat) { const d = Calendario.diaDelAño(fecha); if (Math.abs(lat) < 23.5) return null; const n = lat >= 0 ? d : (d + 182) % 365; return n < 79 || n >= 355 ? 'invierno' : n < 172 ? 'primavera' : n < 266 ? 'verano' : 'otoño'; },
  /* horas de luz del día (ecuación de la salida del sol) */
  horasLuz(lat, dia) { const dec = -23.44 * Math.PI / 180 * Math.cos(TAU / 365 * (dia + 10)), x = -Math.tan(lat * Math.PI / 180) * Math.tan(dec); return x <= -1 ? 24 : x >= 1 ? 0 : 24 / Math.PI * Math.acos(x); },
  /* agarre de una llanta (multiplica al coeficiente de fricción) según el clima del momento */
  agarre(cl) { if (!cl) return 1; if (cl.hielo > .3) return .18; if (cl.nieveSuelo > 1) return .4; if (cl.lluvia > .1) return 1 - .3 * Math.min(1, cl.lluvia * 1.4); return 1; },
  /* visibilidad en metros (para las vistas, la IA y el manejo) */
  visibilidad(cl) { if (!cl) return 10000; return Math.max(40, 10000 * (1 - .96 * (cl.niebla || 0)) * (1 - .6 * (cl.lluvia || 0)) * (1 - .7 * (cl.nieve || 0))); },
  crearClima(cfg, lat, alt) { return new ClimaGlobal({ lat, alt, tipo: (cfg && cfg.clima && cfg.clima.tipo) || Ambiente.tipoPara(lat, alt) }); }
};
class ClimaGlobal {
  constructor({ lat = 6.2, alt = 1500, tipo } = {}) { Object.assign(this, { lat, alt, tipoClima: tipo || Ambiente.tipoPara(lat, alt) }); this.forzado = null; this.lluvia = 0; this.nubes = .2; this.niebla = 0; this.tormenta = 0; this.rayo = 0; this.nieve = 0; this.granizo = 0; this.nieveSuelo = 0; this.hielo = 0; this.calor = 0; this.viento = { v: 2, dir: 0 }; this.temp = 20; this.hum = 60; this.rocio = 12; this.tipo = 'despejado'; this._t = null; }
  forzar(t) { this.forzado = t || null; }
  _bloque(fecha, b) {
    const sem = (fecha.getFullYear() * 400 + fecha.getMonth() * 32 + fecha.getDate()) * 8 + b, r = h2(sem, 7, 91), r2 = h2(sem, 9, 92), d = Calendario.diaDelAño(fecha), K = CLIMAS[this.tipoClima] || CLIMAS.templado, hs = this.lat >= 0 ? 1 : -1;
    const tarde = b * 3 + 1.5 >= 13 && b * 3 + 1.5 <= 19 ? 1.5 : b < 2 ? .6 : .85, p = clamp(K.lluvia(d, hs) * tarde * .7, 0, .92);
    if (r < p * .22) return { tipo: 'tormenta', lluvia: .9, nubes: 1, tormenta: 1, viento: 9 };
    if (r < p) return { tipo: 'lluvia', lluvia: .35 + r2 * .45, nubes: .9, tormenta: 0, viento: 4 };
    if (r < p + .2) return { tipo: 'nublado', lluvia: 0, nubes: .6 + r2 * .3, tormenta: 0, viento: 3 };
    return { tipo: 'despejado', lluvia: 0, nubes: .08 + r2 * .25, tormenta: 0, viento: 2 + r2 * 2 };
  }
  actualizar(reloj, dt = 0) {
    const h = reloj.hora, b = Math.floor(h / 3) % 8, f = (h % 3) / 3, d = Calendario.diaDelAño(reloj.fecha), K = CLIMAS[this.tipoClima] || CLIMAS.templado;
    const F = { despejado: { tipo: 'despejado', lluvia: 0, nubes: .1, tormenta: 0, viento: 2 }, nublado: { tipo: 'nublado', lluvia: 0, nubes: .85, tormenta: 0, viento: 3 }, lluvia: { tipo: 'lluvia', lluvia: .7, nubes: .95, tormenta: 0, viento: 4 }, tormenta: { tipo: 'tormenta', lluvia: 1, nubes: 1, tormenta: 1, viento: 10 }, nieve: { tipo: 'nieve', lluvia: .6, nubes: .95, tormenta: 0, viento: 3, frio: -6 }, niebla: { tipo: 'nublado', lluvia: 0, nubes: .4, tormenta: 0, viento: .5, niebla: 1 }, calor: { tipo: 'despejado', lluvia: 0, nubes: 0, tormenta: 0, viento: 1, calor: 12 } }[this.forzado];
    const A = F || this._bloque(reloj.fecha, b), B = F || this._bloque(b === 7 ? new Date(reloj.fecha.getFullYear(), reloj.fecha.getMonth(), reloj.fecha.getDate() + 1) : reloj.fecha, (b + 1) % 8), k = f > .8 ? suave((f - .8) / .2) : 0, s = dt > 0 ? Math.min(1, dt * .8) : 1;
    /* temperatura: media del día por latitud y estación, menos la altura, más la onda del día (máx. ~15 h) */
    const Tm = Ambiente.tempMedia(this.lat, d) - .0065 * this.alt + (A.frio || 0) + (A.calor || 0), Td = (K.amp * (1 - .5 * A.nubes)) * Math.sin(TAU * (h - 9) / 24), T = Tm + Td - lerp(A.lluvia, B.lluvia, k) * 2.5;
    this.temp = dt > 0 ? lerp(this.temp, T, Math.min(1, dt * .2)) : T;
    this.lluvia = lerp(this.lluvia, lerp(A.lluvia, B.lluvia, k), s); this.nubes = lerp(this.nubes, lerp(A.nubes, B.nubes, k), s); this.tormenta = lerp(this.tormenta, lerp(A.tormenta, B.tormenta, k), s);
    this.viento.v = lerp(this.viento.v, lerp(A.viento, B.viento, k) * (1 + .35 * Math.sin(reloj.min * 1.3) * (this.tormenta + .2)), s); this.viento.dir = h2(reloj.fecha.getDate(), b, 5) * TAU;
    /* humedad y rocío: el aire húmedo de la madrugada llega al rocío → niebla si hay poco viento */
    this.hum = clamp(K.hum * 100 + this.lluvia * 25 - Td * 3 + (h < 8 ? 12 : 0), 8, 100); this.rocio = Termo.rocio(this.temp, this.hum);
    const nb = A.niebla ? 1 : clamp((2.5 - (this.temp - this.rocio)) / 2.5, 0, 1) * clamp((3 - this.viento.v) / 3, 0, 1); this.niebla = lerp(this.niebla, nb, s);
    /* nieve, granizo, hielo y capa de nieve */
    const frio = this.temp < .8; this.nieve = frio ? this.lluvia : 0; if (frio) this.lluvia *= .15;
    this.granizo = this.tormenta > .6 && this.temp > 4 && this.temp < 22 && h2(reloj.fecha.getDate(), b, 33) < .25 ? this.tormenta : 0;
    if (dt > 0) { this.nieveSuelo = Math.max(0, this.nieveSuelo + (this.nieve * 2.2 - Math.max(0, this.temp) * .35) * dt * (reloj.vel || 1) / 60); this.hielo = this.temp < 0 && (this.nieveSuelo > .2 || this.lluvia > .05) ? clamp(this.hielo + dt * .01, 0, 1) : Math.max(0, this.hielo - dt * .02); }
    this.calor = clamp((this.temp - 32) / 8, 0, 1);
    this.tipo = this.nieve > .1 ? 'nieve' : this.granizo > .3 ? 'granizo' : this.niebla > .55 ? 'niebla' : this.calor > .3 ? 'calor' : (k > .5 ? B.tipo : A.tipo);
    if (this.tormenta > .5 && dt > 0) { this.rayo = Math.max(0, this.rayo - dt * 4); if (Math.random() < dt * .12 * this.tormenta) { this.rayo = 1; MC.emit('rayo', this); } } else this.rayo = 0;
    return this;
  }
  get sensacion() { return this.temp >= 27 ? Termo.indiceCalor(this.temp, this.hum) : Termo.sensacionViento(this.temp, this.viento.v * 3.6); }
  texto() { const ic = { despejado: '☀️ Despejado', nublado: '☁️ Nublado', lluvia: '🌧️ Lluvia', tormenta: '⛈️ Tormenta', nieve: '🌨️ Nieve', granizo: '🧊 Granizo', niebla: '🌫️ Niebla', calor: '🔥 Calor' }[this.tipo] || this.tipo; return ic + ' · ' + Math.round(this.temp) + ' °C' + (Math.abs(this.sensacion - this.temp) > 2 ? ' (se siente ' + Math.round(this.sensacion) + ')' : '') + (this.nieveSuelo > .5 ? ' · ' + Math.round(this.nieveSuelo) + ' cm de nieve' : ''); }
}
Object.assign(MC, { Ambiente, ClimaGlobal, CLIMAS });
