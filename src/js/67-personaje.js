/* =====================================================================
   TU PERSONAJE, RANKINGS, PERSONAJES Y CONTROLES (v0.7)
   ===================================================================== */
SKINS.push('#fbe3cf', '#4a2c1c');
const PEINADOS = ['Corto', 'Largo', 'Gorra', 'Rapado', 'Afro', 'Coleta', 'Moño', 'Trenzas', 'Crespo'];
const PELO = ['#2a1a10', '#4a2c18', '#7a4a22', '#c9a25a', '#e8d27a', '#b8402a', '#d9d9d9', '#151515', '#3f6fd8', '#ff8fc7'];
const CARAS = ['Sin barba', 'Bigote', 'Barba'];
const GAFAS = ['Sin gafas', 'Gafas', 'Gafas de sol'];
const MANGAS = ['Camiseta', 'Manga larga', 'Chaleco EnCicla'];
const PANTALON = ['#2a3b5c', '#3d4a5a', '#5a4632', '#1f2a3a', '#6a7a8a', '#7a3b3b', '#c9b38a', '#3d6b3a'];
const ZAPATOS = ['#111111', '#ffffff', '#ff6b5a', '#56c7ff', '#9bd341', '#ffc93c'];
/* tu apariencia completa (para los minijuegos de vista lateral) */
Art.me = function (extra) {
  const P = Save.data.profile;
  return Object.assign({ skin: SKINS[P.skin] || SKINS[1], hair: PELO[P.hairCol | 0], hairStyle: P.hair | 0, shirt: SHIRTS[P.shirt] || PAL.vd, pants: PANTALON[P.pants | 0], shoes: ZAPATOS[P.shoes | 0], sleeve: P.sleeve | 0, beard: P.beard | 0, glasses: P.glasses | 0, cap: HELMETS[P.helmet] }, extra || {});
};
/* persona de lado: más peinados, barba, gafas de sol, zapatos y mangas */
Art.person = function (c, x, y, p, ph = 0, face = -1) {
  c.save(); c.translate(Math.round(x), Math.round(y)); if (face > 0) c.scale(-1, 1);
  const kid = p.kid, H = kid ? .72 : 1, legH = Math.round(6 * H), torso = Math.round(7 * H), hy = -legH - torso - 5, st = Math.floor(ph * 4) % 2, hc = p.hair || '#2a1a10';
  prect(c, -2 + (st ? -1 : 0), -legH, 2, legH, p.pants); prect(c, 0 + (st ? 1 : 0), -legH, 2, legH, shade(p.pants, -.18));
  const sh = p.shoes || '#111'; prect(c, -2 + (st ? -1 : 0), -1, 2, 1, sh); prect(c, 0 + (st ? 1 : 0), -1, 2, 1, sh);
  if (p.bag) prect(c, 2, -legH - torso + 1, 2, torso - 2, p.bag);
  prect(c, -3, -legH - torso, 5, torso, p.shirt); prect(c, -4, -legH - torso + 2, 1, torso - 3, p.sleeve === 1 ? p.shirt : p.shirt); prect(c, -4, -legH - 2, 1, 1, p.skin);
  if (!p.sleeve && !kid) prect(c, -4, -legH - torso + 4, 1, 2, p.skin);
  if (p.vest || p.sleeve === 2) { prect(c, -3, -legH - torso, 5, torso, PAL.vd); prect(c, -3, -legH - torso + 3, 5, 1, '#e8f4d0'); prect(c, -1, -legH - torso, 1, torso, p.shirt); }
  prect(c, -3, hy, 5, 5, p.skin); prect(c, -3, hy + 2, 1, 1, '#141414');
  switch (p.hairStyle | 0) {
    case 0: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 1, 3, hc); break;
    case 1: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 2, 6, hc); break;
    case 2: prect(c, -3, hy - 1, 6, 2, p.cap || PAL.az2); prect(c, -5, hy, 3, 1, p.cap || PAL.az2); break;
    case 3: prect(c, 0, hy - 1, 3, 1, hc); break;
    case 4: prect(c, -4, hy - 3, 8, 4, hc); prect(c, 1, hy, 3, 3, hc); break;
    case 5: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 2, hy, 2, 2, hc); prect(c, 3, hy + 1, 2, 4, hc); break;
    case 6: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 0, hy - 3, 3, 2, hc); break;
    case 7: prect(c, -2, hy - 1, 5, 2, hc); prect(c, 1, hy, 2, 7, hc); prect(c, 1, hy + 7, 2, 1, '#ff6b5a'); break;
    case 8: prect(c, -3, hy - 2, 6, 2, hc); prect(c, -3, hy, 1, 1, hc); prect(c, 2, hy - 1, 2, 3, hc); break;
  }
  if (p.beard === 1) prect(c, -3, hy + 3, 2, 1, hc); else if (p.beard === 2) { prect(c, -3, hy + 3, 4, 2, hc); prect(c, -3, hy + 2, 1, 1, hc); }
  if (p.glasses === 2) prect(c, -3, hy + 2, 3, 1, '#0a0a0a'); else if (p.glasses) prect(c, -3, hy + 2, 2, 1, '#333');
  if (p.cane) pline(c, -6, 0, -5, -legH - 2, '#7a5230');
  c.restore();
};
/* ciclista visto desde arriba: si tiene pelo largo se le ve la cola bajo el casco */
Art.rider = function (shirt) {
  const P = Save.data.profile, base = this.riderTop(shirt || SHIRTS[P.shirt] || PAL.vd, HELMETS[P.helmet] || '#fff', SKINS[P.skin] || SKINS[1], bikeCol());
  if (![1, 5, 7].includes(P.hair | 0)) return base;
  const k = 'rl' + (shirt || P.shirt) + P.helmet + P.skin + P.hairCol + P.bike + (Save.data.flags.gold ? 1 : 0); let c = this.cache.get(k); if (c) return c;
  c = this.mk(base.width, base.height, x => { x.drawImage(base, 0, 0); x.fillStyle = PELO[P.hairCol | 0]; x.fillRect(3, 8, 1, 2); });
  this.cache.set(k, c); return c;
};
/* retrato grande para el creador */
function drawAvatar(cv) {
  const x = cv.getContext('2d'), w = cv.width, h = cv.height, P = Save.data.profile; x.imageSmoothingEnabled = false;
  x.fillStyle = "#143a6b"; x.fillRect(0, 0, w, h); x.fillStyle = "#5e9a1e"; x.fillRect(0, h - 10, w, 10); x.fillStyle = "#bdb9ab"; x.fillRect(0, h - 12, w, 2);
  Art.bikeSide(x, w * .66, h - 12, { r: 5, face: 1, col: bikeCol() });
  Art.person(x, w * .32, h - 12, Art.me(), 0, 1);
  x.save(); x.translate(w * .32, h - 12); x.scale(1, 1); x.restore();
}

/* ---------- creador de personaje (al empezar y en Mi ciclista) ---------- */
UI.avatar = function (first) {
  const P = Save.data.profile, S = Save.data, req = (key, i) => (COSMETIC_REQ[key] || {})[i], price = (key, i) => (SHOP[key] || {})[i];
  const locked = (key, i) => { const r = req(key, i), p = price(key, i); return (r && !S.logros.includes(r[0])) || (p && !S.owned.includes(key + i)); };
  const sw = (arr, key, em) => `<div class="swatches">${arr.map((c, i) => { const r = req(key, i), p = price(key, i), lk = locked(key, i); return `<button data-k="${key}" data-i="${i}" class="${(P[key] | 0) === i ? 'on' : ''} ${lk ? (p ? 'buy' : 'lock') : ''} ${em ? 'em' : ''}" style="background:${em ? '#143a6b' : c}" aria-label="${esc((r || p || [0, key + ' ' + (i + 1)])[1])}">${em ? c : ''}${lk ? (p ? '<small>🍃' + p[0] + '</small>' : '🔒') : r ? '★' : ''}</button>`; }).join('')}</div>`;
  const txt = (arr, key) => `<div class="seg wrap">${arr.map((t, i) => `<button data-k="${key}" data-i="${i}" class="${(P[key] | 0) === i ? 'on' : ''}">${esc(t)}</button>`).join('')}</div>`;
  const tab = this._avTab || 'cuerpo';
  const body = {
    cuerpo: `<p class="pag">Piel</p>${sw(SKINS, 'skin')}<p class="pag">Peinado</p>${txt(PEINADOS, 'hair')}<p class="pag">Color de pelo</p>${sw(PELO, 'hairCol')}<p class="pag">Cara</p>${txt(CARAS, 'beard')}<p class="pag">Gafas</p>${txt(GAFAS, 'glasses')}`,
    ropa: `<p class="pag">Camiseta</p>${sw(SHIRTS, 'shirt')}<p class="pag">Estilo</p>${txt(MANGAS, 'sleeve')}<p class="pag">Pantalón</p>${sw(PANTALON, 'pants')}<p class="pag">Zapatos</p>${sw(ZAPATOS, 'shoes')}<p class="pag">Casco (siempre se pedalea con casco)</p>${sw(HELMETS, 'helmet')}`,
    bici: `<div class="paper" style="margin:6px 0 4px"><div class="t">Tienda · <span id="avHojas"></span></div><p style="margin:4px 0 0;font-size:13px">Las hojas verdes se ganan pedaleando y con las estrellas de cada turno. Lo que tiene precio se compra con dos toques.</p></div><p class="pag">Color de la bici</p>${sw(BIKES, 'bike')}<p class="pag">Timbre</p>${sw(BELLS, 'bell', true)}`
  }[tab];
  this.modal(`<h2>${first ? 'Crea tu personaje' : 'Mi ciclista'}</h2><canvas id="avPrev" class="avprev" width="64" height="40"></canvas><p class="pag">Nombre</p><input class="txtin" id="avName" maxlength="16" value="${esc(P.name)}">
    <div class="seg avtabs">${[['cuerpo', '🙂 Cuerpo'], ['ropa', '👕 Ropa'], ['bici', '🚲 Bici']].map(([k, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>${body}
    <div class="col"><button class="btn pri" id="avOk">${first ? '¡Listo, a pedalear!' : 'Guardar'}</button>${first ? '' : '<button class="btn gh" id="avRnd">🎲 Al azar</button>'}</div>`, () => {
    const draw = () => { drawAvatar($('#avPrev')); const hj = $('#avHojas'); if (hj) hj.textContent = '🍃 ' + hojas() + ' hojas'; };
    const keepName = () => { P.name = ($('#avName').value || 'Ciclista').trim().slice(0, 16) || 'Ciclista'; };
    let arm = null; draw();
    $$('.avtabs button').forEach(b => b.onclick = () => { keepName(); this._avTab = b.dataset.tab; Snd.sfx('tap'); this.avatar(first); });
    $$('#mBody [data-k]').forEach(b => b.onclick = () => {
      const k = b.dataset.k, i = +b.dataset.i, r = req(k, i), p = price(k, i);
      if (r && !S.logros.includes(r[0])) { const L = LOGROS.find(l => l.id === r[0]); Snd.sfx('bad'); return this.toast('🔒 ' + r[1] + ': se gana con el logro «' + (L && !L.secret ? L.name : '???') + '»'); }
      if (p && !S.owned.includes(k + i)) {
        if (hojas() < p[0]) { Snd.sfx('bad'); return this.toast('🍃 ' + p[1] + ' cuesta ' + p[0] + ' hojas: te faltan ' + (p[0] - hojas())); }
        if (arm !== b) { arm = b; Snd.sfx('tap'); return this.toast('🍃 ' + p[1] + ' · ' + p[0] + ' hojas. Toca otra vez para comprar.'); }
        S.spent = (S.spent | 0) + p[0]; S.owned.push(k + i); S.stats.bought = (S.stats.bought | 0) + 1; b.classList.remove('buy'); const sm = b.querySelector('small'); if (sm) sm.remove(); Snd.sfx('star'); this.toast('¡Compraste ' + p[1] + '!');
      }
      arm = null; P[k] = i; $$(`#mBody [data-k=${k}]`).forEach(x => x.classList.toggle('on', x === b)); Save.save(); draw(); if (k === 'bell') Snd.sfx('bell'); else Snd.sfx('tap');
    });
    const rnd = $('#avRnd'); if (rnd) rnd.onclick = () => { keepName(); const R = Math.random, pk = n => Math.floor(R() * n); Object.assign(P, { skin: pk(SKINS.length), hair: pk(PEINADOS.length), hairCol: pk(8), beard: pk(3), glasses: pk(3), shirt: pk(7), sleeve: pk(3), pants: pk(PANTALON.length), shoes: pk(ZAPATOS.length), helmet: pk(5) }); Save.save(); this.avatar(first); };
    $('#avOk').onclick = () => { keepName(); S.settings.seen.profile = 1; Save.save(); this.closeModal(); this.renderHome(); Snd.sfx('ok'); if (first) this.toast('¡Bienvenido, ' + P.name + '! Empieza por el Usuario.'); };
  });
};

/* ---------- rangos y ranking del valle ---------- */
const RANGOS = [['Ciclista novato', 0], ['Usuario frecuente', 150], ['Anfitrión en formación', 400], ['Taller de confianza', 800], ['Rueda firme', 1400], ['Apoyo todoterreno', 2200], ['Técnico de luz verde', 3300], ['Balance experto', 4800], ['Voz de Monitoreo', 6600], ['Supervisor del valle', 9000], ['Leyenda EnCicla', 12500]];
const rangoDe = xp => { let i = 0; while (i < RANGOS.length - 1 && xp >= RANGOS[i + 1][1]) i++; return i; };
const RIVALES = [['Don Rubén', 'Supervisor · Belén', 15800], ['Cata', 'Monitoreo · Robledo', 11900], ['Wilson', 'Balance · Bello', 8700], ['La Patinadora de Laureles', 'Usuaria', 7600], ['Ing. Paola', 'Técnica · Envigado', 6400],
  ['Kevin', 'Apoyo · Manrique', 4900], ['Mango Biche', 'Usuario · Itagüí', 4100], ['Yuli', 'Bodega · Guayabal', 3500], ['Don Jairo', 'Mecánico · Aranjuez', 2600], ['Rueda Loca', 'Usuaria · Copacabana', 2000],
  ['Santi', 'Anfitrión · Floresta', 1700], ['Paz Pedal', 'Usuaria · Sabaneta', 1200], ['Doña Luz', 'Usuaria desde 2011', 1100], ['El Tinto', 'Usuario · Caldas', 700], ['Bici Bebé', 'Usuaria · Girardota', 300], ['El Domingo', 'Usuario de ciclovía', 120]];
UI.ranking = function (tab) {
  tab = tab || this._rkTab || 'valle'; this._rkTab = tab; const S = Save.data, rk = rangoDe(S.xp), nx = RANGOS[rk + 1], pct = nx ? (S.xp - RANGOS[rk][1]) / (nx[1] - RANGOS[rk][1]) * 100 : 100;
  let h = `<h2>Ranking</h2><div class="rkcard"><div class="rkn">${rk + 1}</div><div><div class="pag">Tu rango</div><div class="rkt">${esc(RANGOS[rk][0])}</div><div class="xpbar"><i style="width:${pct.toFixed(1)}%"></i></div><div class="pag">${fmtInt(S.xp)} de experiencia${nx ? ' · faltan ' + fmtInt(nx[1] - S.xp) + ' para ' + esc(nx[0]) : ' · ¡rango máximo!'}</div></div></div>`;
  h += `<div class="seg rktabs">${[['valle', 'El valle'], ['marcas', 'Mis marcas'], ['oficios', 'Por oficio']].map(([k, n]) => `<button data-rk="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div><div class="rklist">`;
  if (tab === 'valle') { const L = RIVALES.map(r => ({ n: r[0], s: r[1], v: r[2] })).concat([{ n: S.profile.name + ' (tú)', s: RANGOS[rk][0], v: S.xp, me: 1 }]).sort((a, b) => b.v - a.v); L.forEach((x, i) => { h += `<div class="li ${x.me ? 'me' : ''}"><b>${i + 1}</b><span>${esc(x.n)}<small>${esc(x.s)}</small></span><i>${fmtInt(x.v)} XP</i></div>`; }); }
  else if (tab === 'marcas') { const R = S.history.filter(e => !e.free).slice().sort((a, b) => b.s - a.s).slice(0, 10); if (!R.length) h += '<p class="m">Aún no hay partidas. ¡A rodar!</p>'; R.forEach((e, i) => { h += `<div class="li"><b>${i + 1}</b><span>${fmtInt(e.s)} pts<small>${esc(ROLE[e.m] ? ROLE[e.m].name : e.m)} · ${esc(ROLE[e.m] && ROLE[e.m].shifts ? shiftName(e.m, e.t) : '')} · ${new Date(e.d).toLocaleDateString('es-CO')}</small></span><i style="color:var(--amb)">${'★'.repeat(e.st)}</i></div>`; }); }
  else ROLES.forEach(r => { for (let t = 1; t <= nShifts(r.id); t++) { const b = S.best[r.id + t] || 0; h += `<div class="li ${b ? '' : 'off'}"><b><img class="px" width="16" height="16" src="${Art.iconURL(r.icon)}" alt=""></b><span>${esc(r.name)}<small>${esc(shiftName(r.id, t))}</small></span><i>${b ? fmtInt(b) : '—'}</i></div>`; } });
  this.modal(h + `</div><div class="col"><button class="btn pri" id="mClose">Cerrar</button></div>`, () => $$('[data-rk]').forEach(b => b.onclick = () => { Snd.sfx('tap'); this.ranking(b.dataset.rk); }));
};

/* ---------- personajes (la trama llega pronto) ---------- */
const BIOS = {
  usuario: ['Belén', 'Del afán no queda sino el cansancio.', 'Pedalea desde que EnCicla era un piloto entre universidades en 2011. Conoce cada ciclorruta del valle y no perdona a quien pasa en rojo.'],
  anfitrion: ['Floresta', 'Una sonrisa también se presta.', 'Madruga a las 4:30 para recibir la tula a las 5 en punto. Ajusta los sillines sin que se lo pidan y se sabe el nombre de cada usuario de su estación.'],
  mecanico: ['Aranjuez', 'Toda bici avisa lo que le duele.', 'Treinta años en talleres de bicicletas. Dice que reconoce una cadena seca por el ruido desde la esquina.'],
  bodega: ['Guayabal', 'Cada cosa en su sitio.', 'Jefa de la bodega: nada entra sin verificar y nada sale sin estar completo. Su lema está pegado en la puerta.'],
  apoyo: ['Manrique', 'El que sirve para todo, sirve para mucho.', 'Anfitrión de apoyo de la zona Envigado: trece estaciones que abrir, relevos de almuerzo y un inventario de control en cada rato libre.'],
  tecnico: ['Envigado', 'Luz verde o nada.', 'Ingeniera electrónica. Tiene un plan para cada power bank y sabe qué celulares de estación están medio malos.'],
  balance: ['Bello', 'Por las vías, nunca por la ciclorruta.', 'Sale a las 4 de la mañana del parqueadero de la Terminal del Norte y vuelve de noche, cuando el camión ya no cabe más bicis.'],
  monitoreo: ['Robledo', 'El mapa habla.', 'Desde la sala de control ve el valle entero: rojo es vacía, azul es llena. Cada hora revisa que los inventarios cuadren.'],
  supervisor: ['Belén · Malibú', 'Se manda como quien ha pasado por todos los puestos.', 'Empezó de usuario, luego fue anfitrión, mecánico y conductor. Hoy arma las tulas a las 4 a. m. en Casa EnCicla y las recoge a las 10:30 p. m.']
};
UI.personajes = function () {
  let h = `<h2>Personajes</h2><p class="m">La gente que mueve EnCicla. Muy pronto cada uno tendrá su propia historia en el juego.</p><div class="chars">`;
  ROLES.forEach(r => { const C = CAST[r.id], B = BIOS[r.id]; if (!C) return; h += `<div class="char"><img class="px" src="${Historia.face(r.id)}" alt=""><div><b>${esc(C[0])}</b><div class="pag">${esc(C[1])} · ${esc(B[0])}</div><p>«${esc(B[1])}»</p><small>${esc(B[2])}</small></div></div>`; });
  this.modal(h + `</div><div class="paper" style="margin:10px 0"><div class="t">Próximamente</div><p style="margin:4px 0 0;font-size:13px">Historias de personajes y su trama a lo largo de los turnos.</p></div><div class="col"><button class="btn pri" id="mClose">Cerrar</button></div>`);
};

/* ---------- controles: joystick flotante, joystick fijo o flechas ---------- */
const Ctrl = JE.ctrl = {
  kind() { return (Save.data && Save.data.settings.ctrl) || 'flotante'; },
  anchor() { return { x: View.w - 86 - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sar')) || 0), y: View.h - 120 }; },   // a la derecha: a la izquierda van las tareas y la ayuda
  arrows() { const a = this.anchor(), s = 52; return [['ArrowUp', a.x, a.y - s, '▲'], ['ArrowDown', a.x, a.y + s, '▼'], ['ArrowLeft', a.x - s, a.y, '◀'], ['ArrowRight', a.x + s, a.y, '▶']]; },
  /* devuelve true si el toque lo tomó el control */
  down(e, cx, cy, cv) {
    const k = this.kind();
    if (k === 'flechas') { for (const [key, x, y] of this.arrows()) if (Math.abs(cx - x) < 28 && Math.abs(cy - y) < 28) { Input.keys[key] = true; (this.held || (this.held = {}))[e.pointerId] = key; return true; } return false; }
    const a = k === 'fijo' ? this.anchor() : { x: cx, y: cy };
    if (k === 'fijo' && dist(cx, cy, a.x, a.y) > 110) return false;
    Input.joy = { on: true, id: e.pointerId, ox: a.x, oy: a.y, x: cx, y: cy }; try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    return true;
  },
  up(e) { const h = this.held && this.held[e.pointerId]; if (h) { Input.keys[h] = false; delete this.held[e.pointerId]; } },
  draw(V) {
    const k = this.kind(), c = V.ctx;
    if (k === 'flechas') { c.globalAlpha = .7; for (const [key, x, y, l] of this.arrows()) { c.fillStyle = Input.keys[key] ? PAL.vd : '#0a2342cc'; c.beginPath(); c.arc(x, y, 25, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); V.text(l, x, y + 7, { size: 20, align: 'center', color: '#fff' }); } c.globalAlpha = 1; return; }
    if (k === 'fijo' && !Input.joy.on) { const a = this.anchor(); c.globalAlpha = .35; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(a.x, a.y, 46, 0, TAU); c.stroke(); c.fillStyle = PAL.vd; c.beginPath(); c.arc(a.x, a.y, 18, 0, TAU); c.fill(); c.globalAlpha = 1; }
  }
};
LOGROS.push({ id: 'rango5', name: 'Rueda firme', desc: 'Llega al rango 5 del ranking', icon: 'estrella', test: S => rangoDe(S.xp) >= 4 });
