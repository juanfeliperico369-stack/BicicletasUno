/* =====================================================================
   CALENDARIO REAL (v0.9): el juego sabe qué día es.
   Festivos de Colombia (Ley Emiliani y Semana Santa calculada), horario de EnCicla según el día,
   ciclovía de domingos y festivos, y festividades de Medellín que cambian el juego solas:
   decoración del mapa, colores, música, misiones y regalos de temporada. Para probar otra fecha: ?fecha=2026-12-24T19:00
   ===================================================================== */
const D = (y, m, d) => new Date(y, m - 1, d);
const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const nthDow = (y, m, dow, n) => { const f = D(y, m, 1), k = (dow - f.getDay() + 7) % 7; return D(y, m, 1 + k + 7 * (n - 1)); };   // n-ésimo día de la semana del mes
const lastDow = (y, m, dow) => { const l = D(y, m + 1, 0), k = (l.getDay() - dow + 7) % 7; return addD(l, -k); };
const nextMon = d => addD(d, (8 - d.getDay()) % 7);   // Ley Emiliani: se pasa al lunes
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'], DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
/* festividades de Medellín: [id, nombre, ícono, (año) => [inicio, fin], colores, decoración, música, novedad] */
const FIESTAS = [
  ['velitas', 'Noche de las Velitas', '🕯️', y => [D(y, 12, 7), D(y, 12, 8)], ['#ffd84a', '#c0392b'], 'velitas', 'jingle', 'alumbrados'],
  ['navidad', 'Navidad y Alumbrados', '🎄', y => [D(y, 12, 1), D(y + 1, 1, 7)], ['#c0392b', '#1e8449'], 'navidad', 'jingle', 'alumbrados'],
  ['navidad', 'Navidad y Alumbrados', '🎄', y => [D(y - 1, 12, 1), D(y, 1, 7)], ['#c0392b', '#1e8449'], 'navidad', 'jingle', 'alumbrados'],
  ['semanasanta', 'Semana Santa', '✝️', y => { const e = Cal.easter(y); return [addD(e, -7), e]; }, ['#6c3483', '#f4d03f'], 'semanasanta', null, null],
  ['nino', 'Día del Niño', '🎈', y => { const s = lastDow(y, 4, 6); return [addD(s, -1), addD(s, 1)]; }, ['#ff8fc7', '#56c7ff'], 'nino', null, null],
  ['madre', 'Día de la Madre', '💐', y => { const s = nthDow(y, 5, 0, 2); return [addD(s, -1), s]; }, ['#ff8fc7', '#ffffff'], 'amor', null, null],
  ['padre', 'Día del Padre', '👔', y => { const s = nthDow(y, 6, 0, 3); return [addD(s, -1), s]; }, ['#2a5a92', '#ffffff'], 'patria', null, null],
  ['patria', 'Independencia de Colombia', '🇨🇴', y => [D(y, 7, 19), D(y, 7, 20)], ['#f4d03f', '#2471a3'], 'patria', null, null],
  ['flores', 'Feria de las Flores', '🌼', y => { const f = nthDow(y, 8, 5, 1); return [f, addD(f, 9)]; }, ['#f4d03f', '#e74c3c'], 'flores', null, 'flores'],
  ['antioquia', 'Independencia de Antioquia', '🌿', y => [D(y, 8, 11), D(y, 8, 11)], ['#ffffff', '#1e8449'], 'patria', null, null],
  ['libro', 'Fiesta del Libro y la Cultura', '📚', y => { const f = nthDow(y, 9, 5, 2); return [f, addD(f, 9)]; }, ['#e67e22', '#2471a3'], 'libro', null, null],
  ['amor', 'Amor y Amistad', '💛', y => { const s = nthDow(y, 9, 6, 3); return [addD(s, -1), addD(s, 1)]; }, ['#ffd84a', '#ff8fc7'], 'amor', null, null],
  ['halloween', 'Halloween', '🎃', y => [D(y, 10, 24), D(y, 10, 31)], ['#e67e22', '#6c3483'], 'halloween', 'spooky', null],
  ['anonuevo', 'Año Nuevo', '🎆', y => [D(y, 1, 1), D(y, 1, 1)], ['#ffd84a', '#0a2342'], 'navidad', 'jingle', null]
];
const Cal = JE.cal = {
  _f: {},
  now() {
    const q = new URLSearchParams(location.search).get('fecha') || JE.fecha;
    if (q) { const m = String(q).match(/^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d):(\d\d))?/); if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 10), +(m[5] || 0)); }
    return new Date();
  },
  key(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  min(d) { return d.getHours() * 60 + d.getMinutes(); },
  easter(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return D(y, mo, da); },
  /* festivos de Colombia del año: clave -> nombre */
  festivos(y) {
    if (this._f[y]) return this._f[y]; const F = {}, add = (d, n) => { F[this.key(d)] = n; }, e = this.easter(y);
    add(D(y, 1, 1), 'Año Nuevo'); add(D(y, 5, 1), 'Día del Trabajo'); add(D(y, 7, 20), 'Independencia de Colombia'); add(D(y, 8, 7), 'Batalla de Boyacá'); add(D(y, 12, 8), 'Inmaculada Concepción'); add(D(y, 12, 25), 'Navidad');
    add(nextMon(D(y, 1, 6)), 'Reyes Magos'); add(nextMon(D(y, 3, 19)), 'San José'); add(nextMon(D(y, 6, 29)), 'San Pedro y San Pablo'); add(nextMon(D(y, 8, 15)), 'La Asunción');
    add(nextMon(D(y, 10, 12)), 'Día de la Raza'); add(nextMon(D(y, 11, 1)), 'Todos los Santos'); add(nextMon(D(y, 11, 11)), 'Independencia de Cartagena');
    add(addD(e, -3), 'Jueves Santo'); add(addD(e, -2), 'Viernes Santo'); add(nextMon(addD(e, 39)), 'Ascensión del Señor'); add(nextMon(addD(e, 60)), 'Corpus Christi'); add(nextMon(addD(e, 68)), 'Sagrado Corazón');
    return (this._f[y] = F);
  },
  festivo(d) { return this.festivos(d.getFullYear())[this.key(d)] || null; },
  dayType(d) { return this.festivo(d) ? 'festivo' : d.getDay() === 0 ? 'domingo' : d.getDay() === 6 ? 'sabado' : 'semana'; },
  /* horario de préstamo de EnCicla según el día (aproximado: confirmar con el equipo) */
  /* open: primer préstamo · lend: desde esa hora ya no se presta (la última es un minuto antes) · close: hasta esa hora se reciben bicis */
  service(d) { const t = this.dayType(d), s = t === 'semana' ? { open: 330, lend: 1260, close: 1320 } : t === 'sabado' ? { open: 390, lend: 1140, close: 1200 } : { open: 480, lend: 960, close: 960 }; return s; },
  /* domingos y festivos: los anfitriones descansan, solo prestan y reciben las estaciones automáticas */
  soloAuto(d) { const t = this.dayType(d || this.now()); return t === 'domingo' || t === 'festivo'; },
  open(d) { const s = this.service(d), m = this.min(d); return m >= s.open && m < s.lend; },
  /* ciclovía de Medellín: domingos y festivos de 7:00 a. m. a 1:00 p. m. */
  ciclovia(d) { const t = this.dayType(d); return t === 'domingo' || t === 'festivo'; },
  cicloviaNow(d) { const m = this.min(d); return this.ciclovia(d) && m >= 420 && m < 780; },
  fiesta(d) {
    d = d || this.now(); const y = d.getFullYear(), day = D(y, d.getMonth() + 1, d.getDate()); let best = null, bl = Infinity;
    for (const f of FIESTAS) { const [a, b] = f[3](y); if (day >= a && day <= b) { const l = b - a; if (l < bl) { bl = l; best = f; } } }
    if (!best) return null; const [id, name, icon, rng, cols, deco, music, nov] = best, [, b] = rng(y);
    return { id, name, icon, cols, deco, music, nov, hasta: b };
  },
  label(d) { return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; },
  hora(m) { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60, h12 = h % 12 || 12; return h12 + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h < 12 ? ' a. m.' : ' p. m.'); },
  /* resumen para la portada y el escalafón */
  resumen(d) {
    d = d || this.now(); const s = this.service(d), f = this.fiesta(d), fe = this.festivo(d), t = this.dayType(d);
    let txt = '📅 ' + this.label(d) + (fe ? ' · festivo: ' + fe : '') + (s.lend === s.close ? ' · EnCicla presta de ' + this.hora(s.open) + ' a ' + this.hora(s.close) + ', solo en estaciones automáticas' : ' · EnCicla presta de ' + this.hora(s.open) + ' a ' + this.hora(s.lend - 1) + ' y recibe hasta las ' + this.hora(s.close));
    if (this.ciclovia(d)) txt += ' · 🚴 Ciclovía de 7 a. m. a 1 p. m.';
    return { txt, f, t };
  }
};
/* ---------- regalos de temporada (ropa que solo se reclama durante la festividad, gratis) ---------- */
const FEST_REQ = { shirt: {}, helmet: {} };
for (const [fid, items] of Object.entries({
  navidad: [['shirt', '#b03a2e', 'Suéter navideño'], ['helmet', '#e74c3c', 'Gorro navideño']], halloween: [['shirt', '#e67e22', 'Disfraz de calabaza'], ['helmet', '#5b2c6f', 'Casco de bruja']],
  flores: [['shirt', '#f1c40f', 'Camisa de silletero']], libro: [['shirt', '#d35400', 'Camiseta lectora']], patria: [['shirt', '#f4d03f', 'Camiseta tricolor']], amor: [['helmet', '#ff8fc7', 'Casco del amor']]
})) for (const [k, col, name] of items) { const arr = k === 'shirt' ? SHIRTS : HELMETS; arr.push(col); FEST_REQ[k][arr.length - 1] = [fid, name]; }
const festOk = fid => { const f = Cal.fiesta(); return !!f && (f.id === fid || (fid === 'navidad' && f.id === 'velitas') || (fid === 'patria' && ['padre', 'antioquia'].includes(f.id))); };

/* ---------- decoración del mapa según la festividad ---------- */
Ride.prototype.drawFest = function (c, ox, oy) {
  const F = this.fest; if (!F || JE.headless) return; const M = this.map, t = this.mode.t, n = Art.night(this.mode.clock || 600);
  const x0 = Math.floor(ox / TS) - 1, y0 = Math.floor(oy / TS) - 1, x1 = x0 + Math.ceil(View.vw / TS) + 2, y1 = y0 + Math.ceil(View.vh / TS) + 2, R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x - ox, y - oy, w, h); };
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = M.get(x, y), r = h2(x, y, 77), px = x * TS, py = y * TS, blink = ((t * 3 + x + y) | 0) % 2;
    switch (F.deco) {
      case 'navidad':
        if (v === TT.GRASS && r < .05) { R(px + 6, py + 3, 4, 2, '#1e8449'); R(px + 5, py + 5, 6, 2, '#1e8449'); R(px + 4, py + 7, 8, 3, '#1e8449'); R(px + 7, py + 10, 2, 2, '#6e2c00'); R(px + 7, py + 1, 2, 2, '#ffd84a'); if (blink) { R(px + 5, py + 6, 1, 1, '#e74c3c'); R(px + 10, py + 8, 1, 1, '#56c7ff'); } else R(px + 8, py + 7, 1, 1, '#ffd84a'); }
        else if (v === TT.WALK && r < .07) for (let i = 0; i < 4; i++) R(px + 2 + i * 4, py + 2 + (i & 1), 2, 2, ['#e74c3c', '#ffd84a', '#56c7ff', '#9bd341'][(i + blink) % 4]);
        break;
      case 'velitas': if (v === TT.WALK && r < .14) { R(px + 7, py + 7, 2, 5, '#f5f5f0'); R(px + 7, py + 5 + blink, 2, 2, '#ffb300'); if (n > .3) { c.globalAlpha = .35; R(px + 4, py + 3, 8, 8, '#ffd84a'); c.globalAlpha = 1; } } break;
      case 'halloween':
        if ((v === TT.WALK || v === TT.GRASS) && r < .035) { pdisc(c, px + 8 - ox, py + 9 - oy, 4, '#e67e22'); R(px + 7, py + 4, 2, 2, '#1e8449'); if (n > .3 || blink) { R(px + 6, py + 8, 1, 1, '#ffd84a'); R(px + 9, py + 8, 1, 1, '#ffd84a'); R(px + 6, py + 10, 4, 1, '#ffd84a'); } }
        else if (v === TT.PLAZA && r < .02) { R(px + 4, py + 4, 8, 6, '#ffffff'); R(px + 5, py + 6, 2, 2, '#0a0a0a'); R(px + 9, py + 6, 2, 2, '#0a0a0a'); }
        break;
      case 'flores': if ((v === TT.GRASS || v === TT.WALK) && r < .08) for (let i = 0; i < 3; i++) pdisc(c, px + 4 + i * 4 - ox, py + 6 + (i & 1) * 4 - oy, 2, ['#f1c40f', '#e74c3c', '#ff8fc7', '#ffffff'][(x + y + i) % 4]); break;
      case 'libro': if (v === TT.WALK && r < .025) { R(px + 3, py + 5, 10, 7, '#8a6a4a'); for (let i = 0; i < 4; i++) R(px + 4 + i * 2, py + 3, 2, 5, ['#e74c3c', '#2471a3', '#f1c40f', '#1e8449'][i]); } break;
      case 'patria': if (v === TT.WALK && r < .05) { R(px + 3, py + 2, 1, 12, '#59606c'); R(px + 4, py + 2, 8, 3, '#f4d03f'); R(px + 4, py + 5, 8, 2, '#2471a3'); R(px + 4, py + 7, 8, 2, '#c0392b'); } break;
      case 'amor': if ((v === TT.GRASS || v === TT.PLAZA) && r < .04) { const k = Math.sin(t * 3 + x) * 2; R(px + 5, py + 5 + k, 2, 2, '#ff8fc7'); R(px + 9, py + 5 + k, 2, 2, '#ff8fc7'); R(px + 5, py + 7 + k, 6, 2, '#ff8fc7'); R(px + 7, py + 9 + k, 2, 2, '#ff8fc7'); } break;
      case 'nino': if ((v === TT.GRASS || v === TT.PLAZA) && r < .04) { const k = Math.sin(t * 2 + y) * 2, col = ['#e74c3c', '#56c7ff', '#f1c40f', '#ff8fc7'][(x + y) % 4]; pdisc(c, px + 8 - ox, py + 4 + k - oy, 3, col); R(px + 8, py + 7 + k, 1, 6, '#ffffffaa'); } break;
      case 'semanasanta': if (v === TT.WALK && r < .02) { R(px + 3, py + 2, 1, 12, '#59606c'); R(px + 4, py + 2, 7, 6, '#6c3483'); R(px + 6, py + 3, 1, 4, '#f4d03f'); R(px + 5, py + 4, 3, 1, '#f4d03f'); } break;
    }
  }
};
const _dg69 = Ride.prototype.drawGround;
Ride.prototype.drawGround = function (b, ox, oy, inV) { this.drawFest(b, ox, oy); _dg69.call(this, b, ox, oy, inV); };
/* la festividad entra a cada recorrido sola */
const _setup69 = MapMode.prototype.setupRide;
MapMode.prototype.setupRide = function (o) {
  _setup69.call(this, o); const f = Cal.fiesta(); this.ride.fest = f;
  if (f && f.id === 'flores') this.mods.flores = true; if (f && (f.deco === 'navidad' || f.deco === 'velitas')) this.mods.alumbrados = true;
};
/* música de temporada: las capas se tocan en 73-musica.js (Snd.fest) */
