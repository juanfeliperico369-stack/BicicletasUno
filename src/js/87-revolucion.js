/* =====================================================================
   REVOLUCIÓN 2.0: el Metro y la bici, juntos
   · Horario real del Metro (lunes a sábado 4:30 a. m.–11 p. m.; domingos y festivos 5 a. m.–10 p. m.).
   · Metro + bici: a pie, junto a una estación del Metro o del tranvía, se toma el Metro a otra estación
     (las bicis de EnCicla no entran al Metro: hay que devolverla antes) y se sigue en bici al llegar.
   · Placas de lo poco conocido: 30 datos curiosos, uno por estación del Metro y del tranvía (datos de El Metro,
     con sus fuentes en docs/FUENTES.md del repositorio MetroZero). Se encuentran al pasar junto a la estación.
   · «Hoy» con el horario del Metro, el dato curioso del día y las placas encontradas.
   ===================================================================== */
const PLACAS = [["Niquía","Terminal norte de la Línea A, en Bello, el segundo municipio más poblado del Valle de Aburrá."],["Bello","El municipio honra al humanista Andrés Bello; allí nació el presidente Marco Fidel Suárez."],["Acevedo","Es la estación donde la Línea A se encuentra con dos Metrocables: la Línea K y la Línea P."],["Tricentenario","El barrio se construyó para los Juegos Centroamericanos y del Caribe de 1978 y su nombre celebra los 300 años de Medellín."],["Caribe","Junto a ella está la Terminal del Norte, y de aquí parte la Línea O de Metroplús por la Avenida 80."],["Universidad","Cerca están el Jardín Botánico, el Parque Explora, el Planetario y la Ciudad Universitaria de la U. de A."],["Hospital","Debe su nombre al cercano Hospital San Vicente Fundación, uno de los grandes hospitales del país."],["Prado","El barrio Prado conserva casonas de los años 1920 y 1930, como el curioso Palacio Egipcio."],["Parque Berrío","El parque honra a Pedro Justo Berrío, gobernador de Antioquia; a pasos está la Plaza Botero."],["San Antonio","Es la única estación donde se cruzan las Líneas A y B; además, aquí empieza el tranvía de Ayacucho."],["Alpujarra","Sirve al Centro Administrativo La Alpujarra, sede de la Alcaldía de Medellín y de la Gobernación."],["Exposiciones","Junto a ella están el centro de convenciones Plaza Mayor y el Teatro Metropolitano."],["Industriales","Desde octubre de 2014 conecta con la estación Industriales de Metroplús."],["Poblado","En El Poblado se fundó en 1616 el poblado de San Lorenzo de Aburrá, semilla de Medellín."],["Aguacatala","Será la terminal sur de la futura Línea E, el Metro de la 80."],["Ayurá","Comparte nombre con la quebrada La Ayurá, que atraviesa Envigado hasta el río Medellín."],["Envigado","Envigado es la tierra del escritor Fernando González; su casa, Otraparte, hoy es museo."],["Itagüí","A Itagüí se le conoce como la 'ciudad industrial de Colombia' por sus muchas fábricas."],["Sabaneta","Sabaneta, con unos 15 km², es el municipio más pequeño de Colombia en extensión."],["La Estrella","Es terminal sur de la Línea A desde 2012; de aquí saldría el futuro Metrocable a San Antonio de Prado."],["Cisneros","Honra a Francisco Javier Cisneros, ingeniero del Ferrocarril de Antioquia; cerca está el Parque de las Luces."],["Suramericana","Está en la comuna Laureles-Estadio, a pocas cuadras de la Unidad Deportiva Atanasio Girardot."],["Estadio","Está junto al estadio Atanasio Girardot, casa de Atlético Nacional y del Independiente Medellín."],["Floresta","Aquí se integran la Línea B y la Línea O; también será parada del futuro Metro de la 80."],["San Javier","Puerta de la Comuna 13: aquí empieza el Metrocable J y muy cerca están las escaleras eléctricas."],["Bicentenario","El Parque Bicentenario se creó para celebrar los 200 años de la independencia (1810-2010)."],["Buenos Aires","Por la calle Ayacucho, camino a Buenos Aires, ya circulaba el antiguo tranvía de Medellín."],["Miraflores","Aquí el tranvía se conecta con el Metrocable M, que sube hasta Trece de Noviembre."],["Alejandro Echavarría","Su nombre recuerda al industrial Alejandro Echavarría Isaza, fundador de la textilera Coltejer."],["Oriente","Terminal del tranvía de Ayacucho y punto de partida del Metrocable H hacia Villa Sierra."]];
/* horario del Metro de Medellín (minutos desde la medianoche) */
Cal.metro = function (d) { const t = this.dayType(d); return t === 'domingo' || t === 'festivo' ? { open: 300, close: 1320 } : { open: 270, close: 1380 }; };
Cal.metroOpen = function (d, m) { const h = this.metro(d), x = m == null ? this.min(d) : m; return x >= h.open && x < h.close; };
const Rev = JE.rev = {
  R_PLACA: 60 / M_PER_PX, R_METRO: 70 / M_PER_PX,
  /* estaciones del Metro (A y B) y del tranvía con su línea y su posición sobre ella */
  estaciones() {
    if (this._st) return this._st; const M = JE.map, out = [];
    for (const [id, P, vel] of [['A', M.lineA, 37], ['B', M.lineB, 37], ['T', M.tram, 20]]) if (P && P.st) for (const s of P.st) out.push({ id, name: s.name, x: s.px, y: s.py, s: s.s, vel });
    return (this._st = out);
  },
  cerca(x, y, r) { let best = null, bd = r; for (const s of this.estaciones()) { const d = dist(s.x, s.y, x, y); if (d < bd) { bd = d; best = s; } } return best; },
  /* minutos de viaje: por la línea a su velocidad media, más el transbordo en San Antonio si cambia de línea */
  minutos(a, b) {
    const tramo = (p, q) => Math.abs(p.s - q.s) * M_PER_PX / 1000 / p.vel * 60, est = this.estaciones();
    if (a.id === b.id) return Math.max(2, Math.round(tramo(a, b) + 1));
    const sa = est.find(s => s.id === a.id && /san antonio/i.test(s.name)), sb = est.find(s => s.id === b.id && /san antonio/i.test(s.name));
    return sa && sb ? Math.round(tramo(a, sa) + tramo(sb, b) + 5) : 30;
  },
  dato(d) { const k = Cal.key(d || Cal.now()); let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; return PLACAS[h % PLACAS.length]; },
  /* viajar en el Metro desde la estación a de la partida m hasta la estación b */
  viajar(m, a, b) {
    const R = m.ride, P = R.p, S = Save.data; if (!a || !b || a === b) return false;
    if (P.veh !== 'walk') { if (JE.ui) JE.ui.toast('🚲 Las bicis de EnCicla no entran al Metro: devuélvela en una estación y sube a pie'); Snd.sfx('bad'); return false; }
    const hoy = m.fecha || Cal.now(); if (!Cal.metroOpen(hoy, m.clock)) { const h = Cal.metro(hoy); if (JE.ui) JE.ui.toast('🚇 El Metro está cerrado: abre a las ' + Cal.hora(h.open) + ' y cierra a las ' + Cal.hora(h.close)); Snd.sfx('bad'); return false; }
    const min = this.minutos(a, b); P.x = b.x; P.y = b.y; if (R.blocked(P.x, P.y, 2.5)) { const n = JE.map.nearestOpen(Math.floor(P.x / TS), Math.floor(P.y / TS), false); P.x = n.x * TS + TS / 2; P.y = n.y * TS + TS / 2; }
    R.cam.x = P.x; R.cam.y = P.y; P.v = 0; if (m.clock != null) m.clock += min; if (m.energy != null) m.energy = Math.min(100, m.energy + min);   // en el tren se descansa
    S.flags.metroViaje = (S.flags.metroViaje | 0) + 1; S.stats.metro = (S.stats.metro | 0) + 1; Save.save(); m._mb = { x: P.x, y: P.y };
    Snd.sfx('win'); if (JE.ui) JE.ui.toast('🚇 Viajaste en el Metro de ' + a.name + ' a ' + b.name + ' (' + min + ' min). Presta una bici aquí y sigue el camino');
    return true;
  },
  elegir(m, a) {
    const est = this.estaciones().filter(s => s !== a), por = id => est.filter(s => s.id === id), hoy = m.fecha || Cal.now(), h = Cal.metro(hoy);
    const btn = s => `<button class="chip" data-st="${esc(s.id + '|' + s.name)}">${esc(s.name)} · ${this.minutos(a, s)} min</button>`;
    JE.ui.modal(`<h2>🚇 Metro desde ${esc(a.name)}</h2><p class="m">Las bicis de EnCicla no entran al Metro: se devuelve la bici, se viaja y se presta otra al llegar. Horario de hoy: ${esc(Cal.hora(h.open))} a ${esc(Cal.hora(h.close))}.</p>
      ${[['A', 'Línea A'], ['B', 'Línea B'], ['T', 'Tranvía de Ayacucho']].map(([id, n]) => `<div class="pag">${n}</div><div class="zonas">${por(id).map(btn).join('')}</div>`).join('')}<div class="col"><button class="btn gh" id="mClose">Cerrar</button></div>`,
      () => document.querySelectorAll('[data-st]').forEach(el => el.onclick = () => { const [id, n] = el.dataset.st.split('|'), d = est.find(s => s.id === id && s.name === n); JE.ui.closeModal(); this.viajar(m, a, d); }));
  },
  /* placas: se encuentran al pasar junto a la estación */
  placa(m) {
    const P = m.ride.p, s = this.cerca(P.x, P.y, this.R_PLACA); if (!s) return; const S = Save.data, L = S.placas || (S.placas = []); if (L.includes(s.name)) return;
    const pl = PLACAS.find(p => p[0] === s.name); if (!pl) return; L.push(s.name); S.stats.placas = L.length; Save.save(); Snd.sfx('star');
    if (JE.ui) JE.ui.toast('🪧 Placa ' + L.length + '/' + PLACAS.length + ' · ' + pl[0] + ': ' + pl[1]); this.logros();
  },
  logros() { const n = Logros.check(); if (n.length) Save.save(); for (const l of n) if (JE.ui) JE.ui.toast('🏅 Logro: ' + l.name); }
};
LOGROS.push(
  { id: 'metrobici', name: 'Metro + bici', desc: 'Devuelve la bici, viaja en el Metro y sigue pedaleando al llegar', icon: 'monitoreo', test: S => !!S.flags.metroBici },
  { id: 'placas10', name: 'Lo poco conocido', desc: 'Encuentra 10 placas en las estaciones del Metro', icon: 'pin', test: S => (S.placas || []).length >= 10 },
  { id: 'placasTodas', name: 'Guía del Metro', desc: 'Encuentra las 30 placas de las estaciones del Metro y del tranvía', icon: 'pin', test: S => (S.placas || []).length >= PLACAS.length }
);
/* en el modo libre: botón del Metro junto a una estación, placas y el logro Metro + bici */
const _act87 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act87.call(this); if (!this.free || this.sub || this.sitting) return a; const P = this.ride.p, s = Rev.cerca(P.x, P.y, Rev.R_METRO);
  if (s && P.v < 8) a.push({ id: 'metro', icon: 'monitoreo', label: 'Metro', fn: () => Rev.elegir(this, s) });
  return a;
};
const _tick87 = ModeUsuarioR.prototype.tick;
ModeUsuarioR.prototype.tick = function (dt) {
  _tick87.call(this, dt); if (!this.free) return; if ((this._pl = (this._pl || 0) + dt) > .5) { this._pl = 0; Rev.placa(this); }
  const P = this.ride.p; if (this._mb && P.veh === 'bike' && dist(P.x, P.y, this._mb.x, this._mb.y) > 300 / M_PER_PX) { this._mb = null; Save.data.flags.metroBici = 1; Save.save(); Rev.logros(); }
};
/* «Hoy»: horario del Metro, el dato poco conocido del día y las placas encontradas */
const _ruta87 = UI.renderRuta;
UI.renderRuta = function () {
  _ruta87.call(this); const d = document.querySelector('#tab-ruta .hoy'); if (!d) return; const now = Cal.now(), h = Cal.metro(now), p = Rev.dato(now), n = (Save.data.placas || []).length;
  const x = document.createElement('div'); x.className = 'hf';
  x.innerHTML = `🚇 Metro hoy de ${esc(Cal.hora(h.open))} a ${esc(Cal.hora(h.close))}${Cal.metroOpen(now) ? '' : ' · ahora cerrado'} · 🪧 Placas: ${n}/${PLACAS.length}<br>💡 <b>Lo poco conocido:</b> ${esc(p[0])}. ${esc(p[1])}`;
  d.appendChild(x);
};
/* trenes con el horario real: de noche (Metro cerrado) se quedan en el patio, ni se mueven ni se ven */
const _updT87 = Ride.prototype.updTrains;
Ride.prototype.updTrains = function (dt) {
  const M = this.mode, d = (M && M.fecha) || Cal.now(), m = M && M.clock != null ? ((M.clock % 1440) + 1440) % 1440 : Cal.min(d);
  this.metroCerrado = !Cal.metroOpen(d, m); if (this.metroCerrado) return; _updT87.call(this, dt);
};
const _render87 = Ride.prototype.render;
Ride.prototype.render = function (V, min) {
  if (!this.metroCerrado) return _render87.call(this, V, min);
  const t = this.trains; this.trains = []; try { return _render87.call(this, V, min); } finally { this.trains = t; }
};
/* alto contraste: opción en Más, junto a «Letra grande»; se aplica al arrancar */
const _init87 = UI.init; UI.init = function () { _init87.call(this); document.body.classList.toggle('contraste', !!(Save.data && Save.data.settings.contraste)); };
const _mas87 = UI.renderMas;
UI.renderMas = function () {
  _mas87.call(this); const S = Save.data.settings, big = document.querySelector('#tab-mas [data-sw="big"]'); if (!big || document.querySelector('#tab-mas [data-sw="contraste"]')) return;
  const o = document.createElement('div'); o.className = 'opt'; o.innerHTML = `<span>Alto contraste<br><small class="m">Textos y bordes marcados, mapa más nítido</small></span><button class="sw ${S.contraste ? 'on' : ''}" data-sw="contraste" aria-label="Alto contraste"></button>`;
  big.closest('.opt').after(o); const b = o.querySelector('button');
  b.onclick = () => { S.contraste = !S.contraste; Save.save(); b.classList.toggle('on', S.contraste); document.body.classList.toggle('contraste', S.contraste); Snd.sfx('tap'); };
};
/* el viaducto del metro y el tranvía no pasan sobre casas: bajo su trazado, las casas o edificios pasan a andén
   (se mide con tools/auditoria-mapa.js; antes A 7,8 %, B 5,9 % y T 7 % del trazado iban sobre casas) */
const _rail87 = CityMap.buildRail;
CityMap.buildRail = function () {
  _rail87.call(this); const casa = v => v === TT.BRICK || v === TT.BLDG; let n = 0;
  for (const [P, r] of [[this.lineA, 7], [this.lineB, 7], [this.tram, 5]]) {
    if (!P) continue; const paso = 4 / M_PER_PX, R = r / M_PER_PX;
    for (let s = 0; s <= P.len; s += paso) { const q = this.at(P, s), tx0 = Math.floor((q.x - R) / TS), tx1 = Math.floor((q.x + R) / TS), ty0 = Math.floor((q.y - R) / TS), ty1 = Math.floor((q.y + R) / TS);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (Math.hypot((tx + .5) * TS - q.x, (ty + .5) * TS - q.y) <= R + TS / 2 && casa(this.get(tx, ty))) { this.set(tx, ty, TT.WALK); n++; } }
  }
  this.corredorRiel = n;
};
