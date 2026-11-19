/* =====================================================================
   GUION (contenido/guion, lo embebe tools/build.js como GUION):
   historia principal "Un día del valle" (16 capítulos), frases de la ciudad, consejos del tutor,
   saludos de fiesta, huevos de pascua de El Metro y logros nuevos.
   ===================================================================== */
const horaMin = h => { const m = /(\d+):(\d+) ([ap])\. m\./.exec(h || ''); return m ? (+m[1] % 12 + (m[3] === 'p' ? 12 : 0)) * 60 + +m[2] : 600; };

/* ---------- Un día del valle: cada capítulo juega un turno real con sus propios diálogos ---------- */
const DIA = (GUION.dia_del_valle || []).filter(c => ROLE[c.rol] && (!c.turno || c.turno <= nShifts(c.rol)));
const Dia = JE.dia = {
  list: DIA,
  saved() { const S = Save.data; if (Array.isArray(S.dia)) { S.diaValle = S.dia; delete S.dia; } return S.diaValle || (S.diaValle = []); },   // Save.data.dia es de las misiones del modo libre
  done(id) { return this.saved().includes(id); },
  next() { return DIA.find(c => !this.done(c.id)) || null; },
  count() { return DIA.filter(c => this.done(c.id)).length; },
  cap(id) { return DIA.find(c => c.id === id) || null; },
  n(c) { return DIA.indexOf(c) + 1; },
  mark(c) { const L = this.saved(); if (!L.includes(c.id)) { L.push(c.id); Save.save(); } },
  bubble(c, txt, after) {
    const C = CAST[c.rol];
    return `<div class="hist-b ${after ? 'after' : ''}"><img class="px" src="${Historia.face(c.rol)}" alt=""><div><div class="pag">Un día del valle · ${this.n(c)} de ${DIA.length} · ${esc(c.hora)} · ${esc(c.lugar)}</div><p>«${esc(txt)}»</p><small>${esc(C[0])}, ${esc(C[1])}</small>${!after && c.consejo ? `<div class="tip">💡 ${esc(c.consejo)}</div>` : ''}</div></div>`;
  },
  /* abre un capítulo: título en escena y la ficha del turno; el último es el epílogo */
  play(c) {
    const me = Art.me(c.rol === 'usuario' ? undefined : { uniforme: true });
    if (!c.turno) return Cine.show([
      { who: '', text: 'Epílogo · ' + c.titulo, big: true, auto: 3.2, draw: Cine.paseo(600, me) },
      { who: CAST.usuario[0] + ', ' + CAST.usuario[1], text: c.antes, draw: Cine.charla(600, me, Cine.actor('usuario')) },
      { who: CAST.supervisor[0] + ', ' + CAST.supervisor[1], text: c.despues, draw: Cine.charla(600, me, Cine.actor('supervisor')) },
      { who: '', text: '¡Completaste Un día del valle! Gracias por pedalear con EnCicla.', big: true, auto: 4, draw: (x, t) => Art.cover(x, 160, 90, t + 2) }
    ], () => {
      this.mark(c); const nw = Logros.check(); Save.save();
      UI.toast('📖 Un día del valle: ¡historia completa!' + (nw.length ? ' · 🏅 ' + nw.map(l => l.name).join(', ') : '')); UI.historia();
    });
    Cine.show([{ who: '', text: c.hora + ' · ' + c.lugar + ' · ' + c.titulo, big: true, auto: 3, draw: Cine.paseo(horaMin(c.hora), me) }], () => UI.brief(c.rol, c.turno, { dia: c.id }));
  }
};
/* la ficha y el resultado del turno usan los diálogos del capítulo */
const _hbrief83 = Historia.brief;
Historia.brief = function (roleId, turno, o) { const c = o && o.dia && Dia.cap(o.dia); return c ? Dia.bubble(c, c.antes) : _hbrief83.call(this, roleId, turno, o); };
const _hres83 = Historia.result;
Historia.result = function (res, meta) { const c = meta.dia && Dia.cap(meta.dia); return c ? Dia.bubble(c, res.pass ? c.despues : c.fallo, true) : _hres83.call(this, res, meta); };
/* el capítulo viaja con la partida (también al repetir el mismo turno) */
const _start83 = Game.start;
Game.start = function (roleId, turno, o = {}) {
  const m0 = this.meta, keep = m0 && m0.dia && m0.roleId === roleId && m0.turno === turno && !o.free && !o.reto ? m0.dia : null;
  const r = _start83.apply(this, arguments); if (this.meta) this.meta.dia = o.dia || keep; return r;
};
const _apply83 = Progress.apply;
Progress.apply = function (res, meta, M) {
  const c = meta.dia && Dia.cap(meta.dia), first = !!c && res.pass && !Dia.done(c.id);
  if (first) Dia.mark(c);
  const out = _apply83.call(this, res, meta, M); if (c) { out.cine = false; out.dia = first; } return out;
};
const _result83 = UI.result;
UI.result = function (res, meta, prog) {
  _result83.call(this, res, meta, prog); const c = meta.dia && Dia.cap(meta.dia), again = $('#bAgain'); if (!c || !again) return;
  const nb = $('#bNext'); if (nb) nb.remove(); const nx = res.pass ? Dia.next() : null;
  if (nx) { const b = document.createElement('button'); b.className = 'btn pri'; b.id = 'bDia'; b.textContent = nx.turno ? '▶ Capítulo ' + Dia.n(nx) + ': ' + nx.titulo : '▶ Epílogo: ' + nx.titulo; again.parentNode.prepend(b); again.classList.remove('pri'); b.onclick = () => { Snd.sfx('tap'); Dia.play(nx); }; }
  const h = document.createElement('button'); h.className = 'btn gh'; h.id = 'bDiaL'; h.textContent = '📖 Un día del valle'; h.onclick = () => { this.go('sHome'); this.historia(); };
  const esc2 = $('#bEsc'); if (esc2) esc2.before(h);
};
/* pantalla de historia: primero "Un día del valle", después los capítulos por oficio */
const _hist83 = UI.historia;
UI.historia = function () {
  _hist83.call(this); const body = $('#mBody'), h2 = body && body.querySelector('h2'); if (!h2 || !DIA.length) return;
  h2.textContent = 'Historia'; const p = body.querySelector('p.pag'); if (p) p.textContent = 'Por oficio · ' + p.textContent;
  const nx = Dia.next(); let h = `<div class="pag">Un día del valle · ${Dia.count()} de ${DIA.length} capítulos</div><div class="dia-l">`;
  for (const c of DIA) {
    const ok = Dia.done(c.id), cur = c === nx;
    h += `<button class="dia-c ${ok ? 'ok' : cur ? 'next' : 'lock'}" data-dia="${c.id}"><img class="px" src="${Historia.face(c.rol)}" alt=""><span><b>${ok || cur ? '' : '🔒 '}${esc(c.titulo)}</b><small>${esc(c.hora)} · ${esc(c.lugar)} · ${esc(CAST[c.rol][0])}</small></span><i>${ok ? '✓' : cur ? '▶' : ''}</i></button>`;
  }
  const d = document.createElement('div'); d.className = 'dia'; d.innerHTML = h + '</div>'; h2.after(d);
  const cur = d.querySelector('.next'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  d.querySelectorAll('[data-dia]').forEach(b => b.onclick = () => {
    const c = Dia.cap(b.dataset.dia); if (!c) return;
    if (!Dia.done(c.id) && c !== Dia.next()) { Snd.sfx('bad'); return this.toast('Primero termina el capítulo anterior'); }
    Snd.sfx('tap'); this.closeModal(); Dia.play(c);
  });
};

/* ---------- la ciudad habla: frases de los peatones según la hora, el clima, la fiesta y el lugar ---------- */
const Ciudad = JE.ciudad = {
  ctx(M, R) {
    const m = typeof M.clock === 'number' ? ((M.clock % 1440) + 1440) % 1440 : Cal.min(Cal.now()), d = M.fecha || Cal.now(), P = R.p;
    if (M.mods && M.mods.rain) return 'lluvia';
    if (Cal.fiesta(d) && Math.random() < .35) return 'fiesta';
    if (M.free && Cal.ciclovia(d) && m >= 420 && m < 780 && Math.random() < .6) return 'ciclovia';
    if (P && Math.random() < .5 && JE.map.stations.some(s => dist(s.x, s.y, P.x, P.y) < 70 * WK)) return 'estacion';
    return m < 300 || m >= 1110 ? 'noche' : m < 420 ? 'manana' : m < 540 ? 'hora_pico' : m < 690 ? 'manana' : m < 1020 ? 'mediodia' : 'hora_pico';
  },
  frase(M, R) { const L = (GUION.ciudad || {})[this.ctx(M, R)]; return L && L.length ? L[(Math.random() * L.length) | 0] : ''; }
};
const _life83 = Ride.prototype.updLife;
Ride.prototype.updLife = function (dt) {
  _life83.call(this, dt); const M = this.mode; if (!this.peds || M.sub || M.done || M.endT != null) return;
  this.talkT = (this.talkT == null ? 4 : this.talkT) - dt; if (this.talkT > 0) return; this.talkT = 7 + Math.random() * 7;   // solo efecto visual: no usa el azar de la partida
  const P = this.p, L = this.peds.filter(q => { const d = dist(q.x, q.y, P.x, P.y); return d > 14 * WK && d < 90 * WK; }); if (!L.length) return;
  const q = L[(Math.random() * L.length) | 0], f = Ciudad.frase(M, this); if (f) this.fx.push({ k: 't', x: q.x, y: q.y - 10, t: 2.6, txt: '«' + f + '»', col: '#f4efd8' });
};

/* ---------- consejo del tutor en la ficha del turno ---------- */
const _brief83 = UI.brief;
UI.brief = function (roleId, turno, o = {}) {
  _brief83.call(this, roleId, turno, o); if (o.dia || isMulti(roleId)) return;
  const T = (GUION.tutor || {})[o.free && roleId === 'usuario' ? 'libre' : roleId], how = $('#briefBody .howto'); if (!T || !T.length || !how) return;
  const p = document.createElement('p'); p.className = 'tip'; p.textContent = '💡 ' + T[(Math.random() * T.length) | 0]; how.after(p);
};

/* ---------- modo libre: saludo de fiesta, cumpleaños del Metro y "Antes del primer tren" ---------- */
const metroCumple = d => d.getMonth() === 10 && d.getDate() === 30 ? d.getFullYear() - 1995 : 0;
const _init83 = ModeUsuarioR.prototype.libreInit;
ModeUsuarioR.prototype.libreInit = function (now) {
  _init83.call(this, now); if (!JE.ui) return; const d = this.fecha || now || Cal.now(), f = Cal.fiesta(d), g = f && (GUION.fiestas || {})[f.id];
  if (g && CAST[g.rol]) JE.ui.toast(f.icon + ' ' + f.name + ' · ' + CAST[g.rol][0] + ': «' + g.frase + '»');
  const n = metroCumple(d), gm = GUION.metro; if (n && gm) JE.ui.toast('🚇 Hoy el Metro de Medellín cumple ' + n + ' años · ' + gm.cumple.quien + ': «' + gm.cumple.dice + '»');
};
const _tick83 = ModeUsuarioR.prototype.tick;
ModeUsuarioR.prototype.tick = function (dt) {
  _tick83.call(this, dt); if (!this.free || this.done || this.trenOk || !GUION.metro) return;
  const m = ((this.clock % 1440) + 1440) % 1440; if (m < 240 || m >= Cal.metro(this.fecha || Cal.now()).abre) return;   // desde las 4:00 hasta el primer tren (4:30; 5:00 domingos y festivos)
  const st = Dia.niquia || (Dia.niquia = (JE.map.metroA || []).find(s => /niqu/i.test(s.name || ''))), P = this.ride.p;
  if (!st || dist(st.px, st.py, P.x, P.y) > 40 * WK) return;
  this.trenOk = true; Save.data.flags.primerTren = 1; const nw = Logros.check(), g = GUION.metro.primerTren; Save.save();
  this.ride.stamp = { t: 3, title: 'ANTES DEL PRIMER TREN', sub: g.quien + ' te saluda en Niquía', bg: PAL.cie }; Snd.sfx('star');
  if (JE.ui) { JE.ui.toast('🚇 ' + g.quien + ': «' + g.dice + '»'); if (nw.length) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', ')); }
};

/* ---------- créditos: enlace al juego hermano ---------- */
const _cred83 = UI.credits;
UI.credits = function () {
  _cred83.call(this); const g = GUION.metro, col = $('#mBody .col'); if (!g || !col) return;
  const p = document.createElement('p'); p.className = 'm'; p.innerHTML = `🚇 ${esc(g.creditos)}: <a href="${g.web}" id="mMetro">${esc(g.web.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a>`; col.before(p);
  $('#mMetro').onclick = e => { e.preventDefault(); if (window.Capacitor) location.href = g.web; else window.open(g.web, '_blank', 'noopener'); };
};

/* ---------- logros nuevos ---------- */
const aprobados = (S, m) => S.history.filter(h => h.m === m && h.p && !h.free && !h.reto).length;
LOGROS.push(
  { id: 'diavalle', name: 'Un día del valle', desc: 'Completa los 16 capítulos de la historia principal', icon: 'usuario', test: S => (S.diaValle || []).length >= DIA.length },
  { id: 'taller', name: 'Manos al taller', desc: 'Aprueba 5 turnos de Mecánico', icon: 'mecanico', test: S => aprobados(S, 'mecanico') >= 5 },
  { id: 'caja', name: 'Todo en su caja', desc: 'Aprueba 3 turnos de Bodega', icon: 'bodega', test: S => aprobados(S, 'bodega') >= 3 },
  { id: 'relevo', name: 'Relevo de oro', desc: 'Aprueba 3 turnos de Apoyo', icon: 'apoyo', test: S => aprobados(S, 'apoyo') >= 3 },
  { id: 'pausa5', name: 'Una pausa más', desc: 'Aprueba 5 turnos de Pausas Activas', icon: 'pausas', test: S => aprobados(S, 'pausas') >= 5 },
  { id: 'residuos', name: 'Cero residuos', desc: 'Gana 3 estrellas en la brigada de Limpieza', icon: 'limpieza', test: S => S.history.some(h => h.m === 'limpieza' && h.st === 3 && !h.free) },
  { id: 'ojo', name: 'Ojo clínico', desc: 'Aprueba 3 turnos de Técnico', icon: 'tecnico', test: S => aprobados(S, 'tecnico') >= 3 },
  { id: 'brigada', name: 'Brigada del valle', desc: 'Aprueba 3 turnos de Rescate', icon: 'rescate', test: S => aprobados(S, 'rescate') >= 3 },
  { id: 'mapavivo', name: 'Mapa vivo', desc: 'Aprueba 3 turnos de Monitoreo', icon: 'monitoreo', test: S => aprobados(S, 'monitoreo') >= 3 },
  { id: 'primertren', name: 'Antes del primer tren', desc: 'Encuentra a Rosalba en Niquía antes del primer tren (4:30 a. m.; 5:00 los domingos y festivos)', icon: 'monitoreo', secret: true, test: S => !!S.flags.primerTren }
);

/* ---------- Ni una gota (de El Metro): lleva un tinto en la canasta de una estación a otra sin chocar ---------- */
const _initNG = ModeUsuarioR.prototype.libreInit;
ModeUsuarioR.prototype.libreInit = function (now) {
  _initNG.call(this, now); const day = Save.data.dia, R = this.ride, P = R.p;
  if (!this.free || !GUION.metro || (day && day.done && day.done.includes('tinto'))) return;
  const dest = JE.map.stations.filter(s => stOk(s) && dist(s.x, s.y, P.x, P.y) > 500 && dist(s.x, s.y, P.x, P.y) < 1400).sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y))[0]; if (!dest) return;
  const ms = { id: 'tinto', kind: 'tinto', txt: '☕ Ni una gota: lleva un tinto a ' + dest.name, h: 6, xp: 40, ok: true, marks: [] }; this.misiones.push(ms); this.tinto = ms;
  const m = R.marker({ x: dest.x, y: dest.y, r: 14, col: '#8a5a3b', label: '☕ ' + dest.name, enter: () => this.tintoLlega(ms) }); m.mis = ms; ms.marks.push(m);
  this.goal(ms.txt, false, () => ms.done, () => ms.ok ? 'sin regar' : 'se regó: recarga en una estación');
};
ModeUsuarioR.prototype.tintoLlega = function (ms) {
  if (ms.done) return; if (!ms.ok) return JE.ui && JE.ui.toast('☕ Se te regó el tinto: recarga en una estación y vuelve');
  this.cumplir(ms); Save.data.flags.niUnaGota = 1; const nw = Logros.check(); Save.save(); this.ride.stamp = { t: 2.6, title: '¡NI UNA GOTA!', sub: 'El tinto llegó completo', bg: '#8a5a3b' }; Snd.sfx('star');
  if (JE.ui) { JE.ui.toast('☕ Rosalba: «Ese tinto también merece llegar completo.»'); if (nw.length) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', ')); }
};
ModeUsuarioR.prototype.onCrash = function () { const ms = this.tinto; if (ms && !ms.done && ms.ok) { ms.ok = false; JE.ui && JE.ui.toast('☕ ¡Se regó el tinto! Recarga en cualquier estación'); } };
const _tickNG = ModeUsuarioR.prototype.tick;
ModeUsuarioR.prototype.tick = function (dt) {
  _tickNG.call(this, dt); const ms = this.tinto; if (!ms || ms.done || ms.ok) return; const P = this.ride.p;
  if (JE.map.stations.some(s => stOk(s) && dist(s.x, s.y, P.x, P.y) < 26 * WK)) { ms.ok = true; JE.ui && JE.ui.toast('☕ Tinto recargado: ahora sí, sin regar'); }
};
LOGROS.push({ id: 'nigota', name: 'Ni una gota', desc: 'Lleva un tinto de estación a estación sin regarlo', icon: 'usuario', secret: true, test: S => !!S.flags.niUnaGota });


/* ---------- Trama en datos: misiones del modo libre desde contenido/guion/misiones.json (para M6 del plan único) ----------
   Cada misión: { id, txt, lugar, nombre, dias, desde, hasta, req, repite, h, xp, despues, huevo }
     lugar    id de un lugar del juego (LANDMARKS: 'berrio', 'botanico'…) o [lat, lon]; nombre: el letrero del destino
     dias     'semana|sabado|domingo|festivo' (o 'todos'); desde/hasta: '7:00 a. m.'…; req: ids de misiones de la trama ya hechas
     despues  frase o lista de frases al cumplirla; huevo: id del fragmento (Easter egg) que se guarda en Save.data.huevos
   Salen una o dos por día (las mismas todo el día), antes de las misiones menores. Guía: docs/INTEGRAR.md */
function tramaHechas() { const S = Save.data; if (Array.isArray(S.trama)) { S.tramaHechas = (S.tramaHechas || []).concat(S.trama); S.trama = null; } return S.tramaHechas || (S.tramaHechas = []); }   // la v1.7.2 las guardaba en Save.data.trama, que ahora es de «Ruedas y Rieles» (93-trama.js)
function guionMisiones(now) {
  const G = Array.isArray(GUION.misiones) ? GUION.misiones : [], S = Save.data, hechas = tramaHechas(), dt = Cal.dayType(now), m = Cal.min(now);
  const okL = g => typeof g.lugar === 'string' ? !!LM[g.lugar] : Array.isArray(g.lugar) && g.lugar.length >= 2 && isFinite(g.lugar[0]) && isFinite(g.lugar[1]);
  const ok = G.filter(g => g && g.id && g.txt && okL(g) && (!g.dias || g.dias === 'todos' || String(g.dias).split('|').includes(dt)) && (!g.desde || m >= horaMin(g.desde)) && (!g.hasta || m < horaMin(g.hasta)) && (!g.req || [].concat(g.req).every(r => hechas.includes(r))) && (g.repite || !hechas.includes(g.id)));
  const rng = new RNG(hashStr('trama' + Cal.key(now))), pick = rng.shuffle(ok.slice()).slice(0, 2);
  return pick.map(g => ({ id: 'g_' + g.id, kind: 'visita', place: typeof g.lugar === 'string' ? [g.lugar, g.nombre || LM[g.lugar].name] : ['', g.nombre || 'Destino', +g.lugar[0], +g.lugar[1]], txt: g.txt, h: g.h || 8, xp: g.xp || 20, trama: g }));
}
const _cumplirG = ModeUsuarioR.prototype.cumplir;
ModeUsuarioR.prototype.cumplir = function (ms, late) {
  const was = ms.done; _cumplirG.call(this, ms, late); const g = ms.trama; if (was || !g) return;
  const S = Save.data, H = tramaHechas(); if (!H.includes(g.id)) H.push(g.id);
  if (g.huevo && !(S.huevos || (S.huevos = [])).includes(g.huevo)) { S.huevos.push(g.huevo); JE.ui && JE.ui.toast('🥚 Encontraste un fragmento escondido'); }
  if (JE.ui) for (const t of [].concat(g.despues || [])) JE.ui.toast(t); Save.save();
};
