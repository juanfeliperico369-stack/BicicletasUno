/* =====================================================================
   INTERFAZ + BUCLE DEL JUEGO
   ===================================================================== */
JE.URL = 'https://juanfeliperico369-stack.github.io/BicicletasUno/';
const STARS_UNLOCK_INFO = 'Gana estrellas en los turnos para ascender en el escalafón.';
const TIPS = [
  'Las hojas verdes sirven para comprar colores de bici y timbres en «Mi ciclista y tienda».',
  'Cada turno aprobado abre un capítulo de la historia: léelos todos en Más > La historia.',
  'En «Jugar con amigos» pueden hacer un turno en equipo: uno dirige desde Monitoreo y los demás manejan los camiones.',
  'El Valle de Aburrá tiene dos temporadas de lluvias: de marzo a mayo y de septiembre a noviembre.',
  'En diciembre el río Medellín se viste de Alumbrados. ¡Búscalos en el juego!',
  'EnCicla nació en 2011 y lo gestiona el Área Metropolitana del Valle de Aburrá.',
  'El préstamo es gratis: te registras y prestas la bici en cualquier estación.',
  'Máximo 1 hora por préstamo: devuelve a tiempo y evita sanciones.',
  'De lunes a viernes se presta de 5:30 a. m. a 8:59 p. m. y las bicis se reciben hasta las 10 p. m.',
  'Usa casco, respeta los semáforos y prefiere la ciclorruta.',
  'Hay estaciones manuales (con anfitrión) y automáticas (con anclajes y tótem).',
  'El sistema va desde Caldas, donde nace el río, hasta Barbosa, al norte del valle.',
  'Hay una postal que no aparece en el álbum hasta que la encuentras pedaleando.'
];

const UI = JE.ui = {
  cur: 'sCover', tab: 'ruta',
  init() {
    $('#ver').textContent = 'v' + JE.version;
    $('#bPlay').onclick = () => { const first = () => { if (!Save.data.settings.seen.profile) this.avatar(true); }; if (!Save.data.settings.seen.intro) this.intro(() => { this.go('sHome'); first(); }); else { this.go('sHome'); first(); } };
    $('#bReto').onclick = () => this.reto();
    $('#bHow').onclick = () => this.howto();
    $('#bShare').onclick = () => this.share('🚲 Juega EnCicla: el videojuego arcade del sistema de bicicletas públicas del Valle de Aburrá. ¡Pruébalo!');
    $('#bHomeCover').onclick = () => this.go('sCover');
    // Easter egg: bici dorada (7 toques al título o código Konami)
    let taps = [], seq = []; const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    const gold = () => { const F = Save.data.flags; F.gold = !F.gold; F.goldSeen = 1; Save.save(); Snd.sfx('star'); this.toast(F.gold ? '✨ ¡Bici dorada activada! (repite para quitarla)' : 'Bici dorada desactivada'); };
    $('#sCover h1.mega.g').addEventListener('pointerdown', () => { const t = performance.now(); taps = taps.filter(x => t - x < 4000); taps.push(t); if (taps.length >= 7) { taps = []; gold(); } });
    window.addEventListener('keydown', e => { if (this.cur !== 'sCover') return; seq.push(e.code); seq = seq.slice(-10); if (seq.join() === KON.join()) { seq = []; gold(); } });
    $$('#tabs button').forEach(b => b.onclick = () => { Snd.sfx('tap'); this.setTab(b.dataset.tab); });
    $('#bPause').onclick = () => Game.pause();
    $('#fileIn').onchange = e => this.importFile(e);
    document.addEventListener('pointerdown', () => { Snd.init(); Snd.resume(); if (this.cur !== 'sGame') Snd.music(true); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { Snd.music(false); if (Game.mode && !Game.paused) Game.pause(); } });
    this.coverLoop();
  },
  go(id) {
    $$('.scr').forEach(s => s.classList.toggle('on', s.id === id)); this.cur = id;
    if (id === 'sHome') this.renderHome();
    if (id === 'sCover') this.coverLoop();
  },
  coverLoop() {
    const cv = $('#coverArt'), x = cv.getContext('2d'); x.imageSmoothingEnabled = false; let last = 0;
    const f = t => { if (this.cur !== 'sCover') return; if (t - last > 50) { last = t; Art.cover(x, cv.width, cv.height, t / 1000); } requestAnimationFrame(f); };
    requestAnimationFrame(f);
  },
  /* ---------- progreso ---------- */
  stars(id) { return Save.data.stars[id] || [0, 0, 0]; },
  totalStars() { let n = 0; for (const r of ROLES) n += this.stars(r.id).reduce((a, b) => a + b, 0); return n; },
  level() { return 1 + Math.floor(Math.sqrt(Save.data.xp / 120)); },
  unlocked(r) { return this.totalStars() >= r.unlock || JE.debugUnlock; },
  turnoOk(r, t) { return this.unlocked(r) && (t === 1 || this.stars(r.id)[t - 2] > 0 || JE.debugUnlock); },
  setTab(t) { this.tab = t; $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t)); $$('.tab').forEach(d => d.classList.toggle('on', d.id === 'tab-' + t)); this.renderTab(); },
  renderHome() { $('#hLvl').textContent = this.level(); $('#hStars').textContent = this.totalStars(); this.renderTab(); },
  renderTab() { ({ ruta: () => this.renderRuta(), album: () => this.renderAlbum(), parts: () => this.renderParts(), mas: () => this.renderMas() })[this.tab](); },
  starStr(n, of = 3) { return '★'.repeat(n) + '<i>' + '★'.repeat(of - n) + '</i>'; },
  renderRuta() {
    const S = Save.data, tot = this.totalStars();
    let h = `<div class="hhead"><div><div class="hname">Hola, ${esc(S.profile.name)}</div><div class="hsub">★ ${tot} de ${MAX_STARS()}${S.streak > 1 ? ' · racha ' + S.streak : ''}</div></div><div class="hbar"><i style="width:${Math.round(100 * tot / MAX_STARS())}%"></i></div></div>`;
    if (S.perks.length) h += `<div class="pag">Tus mejoras</div><div class="perks">${S.perks.map(p => `<span class="chip"><img class="px" width="20" height="20" src="${Art.iconURL(PERKS[p].icon, 2)}" alt="">${esc(PERKS[p].name)}</span>`).join('')}</div>`;
    if (!S.settings.seen.profile) h += `<div class="paper" style="margin:0 0 16px"><div class="t">Crea tu ciclista</div><p style="margin:6px 0 10px">Elige tu nombre y colores antes de empezar.</p><button class="btn sm" data-act="avatar">Personalizar</button></div>`;
    h += `<div class="paper race"><div class="t">🏁 Carrera de postales</div><div class="row" style="margin-top:10px"><button class="btn sm" data-race="1">Fácil</button><button class="btn sm" data-race="2">Rápida</button><button class="btn sm" data-race="3">Turbo</button><button class="btn sm pri" data-act="multi">Con amigos</button></div></div>`;
    for (const r of ROLES) {
      const ok = this.unlocked(r), st = this.stars(r.id);
      h += `<div class="role ${ok ? '' : 'lock'}"><span class="num">${r.n}</span><div><div class="tier">${esc(r.tier)}</div><h3><img class="px" src="${Art.iconURL(r.icon)}" alt="">${esc(r.name)}</h3></div>`;
      if (!ok) h += `<div class="lockmsg">🔒 Con ${r.unlock} ★</div>`;
      else {
        h += `<div class="turnos">`;
        for (let t = 1; t <= nShifts(r.id); t++) h += `<button data-role="${r.id}" data-t="${t}" ${this.turnoOk(r, t) ? '' : 'disabled'}><span>${esc(shiftName(r.id, t))}</span>${r.shifts && r.id !== 'usuario' ? `<small class="h">${esc(r.shifts[t - 1].h)}</small>` : ''}<small>${'★'.repeat(st[t - 1])}${'☆'.repeat(3 - st[t - 1])}</small></button>`;
        h += `<button class="free" data-role="${r.id}" data-free="1">Libre<small>práctica</small></button></div>`;
      }
      h += `</div>`;
    }
    const el = $('#tab-ruta'); el.innerHTML = h;
    $$('button[data-role]', el).forEach(b => b.onclick = () => { Snd.sfx('tap'); this.brief(b.dataset.role, +b.dataset.t || 1, { free: !!b.dataset.free }); });
    const av = $('[data-act=avatar]', el); if (av) av.onclick = () => this.avatar();
    $$('[data-race]', el).forEach(b => b.onclick = () => this.brief('carrera', +b.dataset.race, { nov: NOVEDADES[0] }));
    const mu = $('[data-act=multi]', el); if (mu) mu.onclick = () => this.multi();
  },
  renderAlbum() {
    const got = Save.data.postales, list = LANDMARKS.filter(l => l.id !== 'depot' && (!l.secret || Save.data.postales.includes(l.id)));
    let h = `<div class="pag">Postales del valle</div><div class="sect"><span class="outline">${got.length}</span><h2 class="mega">Álbum<br><span style="color:var(--vd)">de postales</span></h2></div><p class="m">Visita los lugares del Valle de Aburrá en modo Usuario para coleccionarlos. Tienes ${got.length} de ${list.length}.</p><div class="album">`;
    list.forEach((L, i) => { const have = got.includes(L.id); h += `<div class="post ${have ? '' : 'lock'}" style="--r:${(h2(i, 3) - .5) * 3}deg"><canvas width="120" height="90" data-lm="${LANDMARKS.indexOf(L)}"></canvas><b>${have ? esc(L.name) : '???'}</b><small>${have ? esc(L.fact) : esc(L.muni) + ' · aún sin visitar'}</small></div>`; });
    h += `</div>`;
    const el = $('#tab-album'); el.innerHTML = h;
    $$('canvas[data-lm]', el).forEach(c => this.drawPost(c, +c.dataset.lm));
  },
  drawPost(c, i) {
    const x = c.getContext('2d'), L = LANDMARKS[i], src = JE.map.landmarkCanvas(i); x.imageSmoothingEnabled = false;
    x.fillStyle = '#5d9c4b'; x.fillRect(0, 0, c.width, c.height);
    const k = Math.min((c.width - 8) / src.width, (c.height - 8) / src.height); const w = src.width * k, h = src.height * k;
    x.drawImage(src, (c.width - w) / 2, (c.height - h) / 2, w, h);
  },
  /* Carnet EnCicla: cargo actual y récord por oficio */
  carnet() {
    const S = Save.data, top = ROLES.filter(r => (S.stars[r.id] || [0])[0] > 0).pop() || ROLES[0], km = (S.stats.km || 0).toFixed(1);
    const rec = ROLES.map(r => { const b = Math.max(0, ...[1, 2, 3].map(t => S.best[r.id + t] || 0)), st = this.stars(r.id).reduce((a, b) => a + b, 0); return `<tr class="${b ? '' : 'off'}"><td><img class="px" width="16" height="16" src="${Art.iconURL(r.icon)}" alt=""> ${esc(r.name)}</td><td>${b ? fmtInt(b) : '—'}</td><td style="color:var(--amb)">${'★'.repeat(st)}<i>${'★'.repeat(3 * nShifts(r.id) - st)}</i></td></tr>`; }).join('');
    return `<div class="carnet"><div class="ch"><canvas id="cnAv" width="80" height="50"></canvas><div><div class="pag">Carnet EnCicla · nivel ${this.level()}</div><div class="cn">${esc(S.profile.name)}</div><div class="cr">${esc(top.name)}</div> <span class="chip">🏆 ${esc(RANGOS[rangoDe(S.xp)][0])}</span><div class="pag">${km} km · ${fmtInt(S.stats.bells || 0)} timbrazos · ${S.logros.length}/${LOGROS.length} logros</div></div></div><table class="rec"><tr><th>Oficio</th><th>Récord</th><th>Estrellas</th></tr>${rec}</table></div>`;
  },
  renderParts() {
    const S = Save.data, st = S.stats;
    let h = `<div class="pag">Tus partidas (se guardan en este dispositivo)</div><div class="sect"><span class="outline">${S.history.length}</span><h2 class="mega">Partidas</h2></div>`;
    h += `<div class="stat"><div><b>${fmtInt(st.plays)}</b><span>turnos jugados</span></div><div><b>${fmtInt(S.xp)}</b><span>experiencia</span></div><div><b>${fmtInt(st.trips)}</b><span>viajes en bici</span></div><div><b>${fmtInt(st.leaves)}</b><span>hojas verdes</span></div><div><b>${S.bestStreak}</b><span>mejor racha</span></div><div><b>${S.postales.length}</b><span>postales</span></div></div>`;
    h += this.carnet();
    h += `<div class="row" style="margin:12px 0"><button class="btn sm amb" data-act="ranking">🏆 Ranking</button><button class="btn sm" id="bExp">⇩ Exportar partidas</button><button class="btn sm" id="bImp">⇧ Importar</button><button class="btn sm gh" id="bDel">Borrar todo</button></div>`;
    if (!S.history.length) h += `<p class="m">Aún no has jugado. ¡Empieza por el Usuario!</p>`;
    else { h += `<table class="hist">`; for (const e of S.history.slice(0, 60)) { const d = new Date(e.d); h += `<tr><td>${d.toLocaleDateString('es-CO')} ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td><td>${esc(ROLE[e.m] ? ROLE[e.m].name : e.m)} ${e.free ? 'libre' : 'T' + e.t}${e.reto ? ' · reto' : ''}</td><td>${fmtInt(e.s)} pts</td><td style="color:var(--amb)">${'★'.repeat(e.st)}</td></tr>`; } h += `</table>`; }
    h += Logros.html();
    const el = $('#tab-parts'); el.innerHTML = h;
    const rb = $('[data-act=ranking]', el); if (rb) rb.onclick = () => this.ranking();
    const cv = $('#cnAv', el); if (cv) { const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#143a6b'; x.fillRect(0, 0, 80, 50); x.fillStyle = '#5e9a1e'; x.fillRect(0, 40, 80, 10); Art.cover(x, 80, 50, 0); }
    $('#bExp').onclick = () => this.exportSave(); $('#bImp').onclick = () => $('#fileIn').click();
    $('#bDel').onclick = () => this.confirm('¿Borrar todas tus partidas y progreso?', () => { Save.reset(); this.renderHome(); this.toast('Progreso borrado'); });
  },
  renderMas() {
    const S = Save.data.settings;
    let h = `<div class="pag">Ajustes, reto y más</div><div class="sect"><span class="outline">+</span><h2 class="mega">Más</h2></div>`;
    h += `<div class="opt"><span>Efectos de sonido</span><button class="sw ${S.sfx ? 'on' : ''}" data-sw="sfx" aria-label="Sonido"></button></div>`;
    h += `<div class="opt"><span>Música</span><button class="sw ${S.music ? 'on' : ''}" data-sw="music" aria-label="Música"></button></div>`;
    h += `<div class="opt"><span>Letra grande</span><button class="sw ${S.big ? 'on' : ''}" data-sw="big" aria-label="Letra grande"></button></div>`;
    h += `<div class="opt"><span>Mano guía (ayudas)</span><button class="sw ${S.hints !== false ? 'on' : ''}" data-sw="hints" aria-label="Ayudas"></button></div>`;
    h += `<div class="opt"><span>Vibración</span><button class="sw ${S.vib ? 'on' : ''}" data-sw="vib" aria-label="Vibración"></button></div>`;
    h += `<div class="opt"><span>Ritmo del juego<br><small class="m">Tranquilo: más tiempo (niños y abuelos)</small></span><div class="seg">${['tranquilo', 'normal', 'arcade'].map(p => `<button data-pace="${p}" class="${S.pace === p ? 'on' : ''}">${p}</button>`).join('')}</div></div>`;
    h += `<div class="opt"><span>Controles<br><small class="m">Flechas: botones fijos, ideal para abuelos</small></span><div class="seg">${['flotante', 'fijo', 'flechas'].map(p => `<button data-ctrl="${p}" class="${(S.ctrl || 'fijo') === p ? 'on' : ''}">${p}</button>`).join('')}</div></div>`;
    h += `<div class="opt"><span>Zoom del mapa</span><div class="seg">${[-1, 0, 1].map(z => `<button data-zoom="${z}" class="${(S.zoom | 0) === z ? 'on' : ''}">${z < 0 ? 'lejos' : z > 0 ? 'cerca' : 'normal'}</button>`).join('')}</div></div>`;
    h += `<div class="col" style="display:flex;flex-direction:column;gap:12px;margin-top:16px"><button class="btn pri" data-act="intro">¿Qué es EnCicla?</button><button class="btn amb" data-act="apoya">Apoya la bici pública</button><button class="btn" data-act="historia">📖 La historia</button><button class="btn" data-act="personajes">👥 Personajes</button><button class="btn" data-act="ranking">🏆 Ranking</button><button class="btn" data-act="avatar">Mi ciclista y tienda</button><button class="btn" data-act="multi">Jugar con amigos</button><button class="btn" data-act="howto">Cómo jugar</button><button class="btn" data-act="bot">Diagnóstico (bot de pruebas)</button><button class="btn gh" data-act="cred">Créditos y aviso</button></div>`;
    h += `<div class="squig"></div><div class="paper"><div class="t">¿Sabías que?</div><p style="margin:6px 0 0">${esc(TIPS[Math.floor(Date.now() / 86400000) % TIPS.length])}</p></div>`;
    const el = $('#tab-mas'); el.innerHTML = h;
    $$('[data-sw]', el).forEach(b => b.onclick = () => { const k = b.dataset.sw; S[k] = !(S[k] !== false); Save.save(); b.classList.toggle('on', S[k]); if (k === 'music') Snd.music(S.music); if (k === 'big') document.body.classList.toggle('big', !!S.big); Snd.sfx('tap'); });
    $$('[data-pace]', el).forEach(b => b.onclick = () => { S.pace = b.dataset.pace; Save.save(); this.renderMas(); });
    $$('[data-zoom]', el).forEach(b => b.onclick = () => { S.zoom = +b.dataset.zoom; Save.save(); this.renderMas(); });
    $$('[data-ctrl]', el).forEach(b => b.onclick = () => { S.ctrl = b.dataset.ctrl; Save.save(); this.renderMas(); Snd.sfx('tap'); });
    $$('[data-act]', el).forEach(b => b.onclick = () => ({ intro: () => this.intro(), apoya: () => this.apoya(), avatar: () => this.avatar(), historia: () => this.historia(), personajes: () => this.personajes(), ranking: () => this.ranking(), multi: () => this.multi(), howto: () => this.howto(), bot: () => this.diag(), cred: () => this.credits() })[b.dataset.act]());
  },
  /* ---------- briefing ---------- */
  brief(roleId, turno, o = {}) {
    const r = ROLE[roleId], seed = o.seed != null ? o.seed : ((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
    const rng = new RNG(seed ^ 0x5bd1e995), nov = o.nov || (turno === 1 && !o.free && !o.reto ? NOVEDADES[0] : Season.pick(rng)), sea = Season.now(), wet = !!sea.wet && !o.reto && roleId !== 'carrera' && !(turno === 1 && !o.free);
    this.mute = true; JE.briefing = true; let tmp; try { tmp = new MODE_CLASS[roleId](r, turno, { seed, nov, perks: o.free ? [] : Save.data.perks, free: o.free, zona: o.zona }); } finally { this.mute = false; JE.briefing = false; }   // solo para leer las metas: sin avisos
    const goals = tmp.goals.map(g => `<li class="${g.main ? 'main' : ''}"><b>${g.main ? '★' : '☆'}</b><span>${esc(g.txt)}${g.main ? ' <small style="color:var(--vd1)">(obligatoria)</small>' : ''}</span></li>`).join('');
    let h = `<div class="row" style="justify-content:space-between"><span class="pag">${roleId === 'carrera' ? 'CARRERA · NIVEL ' + turno : o.reto ? 'RETO DEL DÍA' : o.free ? 'PRÁCTICA LIBRE' : esc(shiftName(roleId, turno)).toUpperCase()}</span><button class="btn sm gh" id="bBack">✕ Volver</button></div>`;
    h += `<div class="boxh">${esc(r.name)}</div>`;
    if (r.shifts && !isMulti(roleId) && roleId !== 'usuario') h += `<div class="paper" style="margin:8px 0"><div class="t">${esc(shiftName(roleId, turno))}</div><p style="margin:4px 0 0">🕐 ${esc(r.shifts[turno - 1].h)}</p></div>`;
    if (roleId === 'apoyo') { const zz = o.zona || APOYO_ZONAS[(seed >>> 5) % APOYO_ZONAS.length][0]; o.zona = zz; h += `<div class="pag">Tu zona (toca para cambiarla)</div><div class="zonas">${APOYO_ZONAS.map(z => `<button class="chip ${z[0] === zz ? 'on' : ''}" data-zona="${z[0]}">${esc(z[1])} · ${z[2]}</button>`).join('')}</div>`; }
    h += Historia.brief(roleId, turno, o);
    h += `<div class="howto">${r.how.map((t, i) => `<div><b>${i + 1}</b><span>${esc(t)}</span></div>`).join('')}</div>`;
    if (!o.free || roleId !== 'usuario') h += `<div class="pag" style="margin-top:12px">Metas ${roleId === 'carrera' ? 'de la carrera' : 'del turno'}</div><ul class="goals">${goals}</ul>`;
    h += `<div class="nov"><b>Hoy: ${esc(nov.name)}</b> · ${esc(nov.desc)}</div>`;
    if (!o.free && Save.data.perks.length) h += `<div class="perks">${Save.data.perks.map(p => `<span class="chip">${esc(PERKS[p].name)}</span>`).join('')}</div>`;
    h += `<div class="row" style="margin-top:16px"><button class="btn pri" id="bGo" style="flex:1">▶ Empezar ${o.free ? 'práctica' : 'turno'}</button></div>`;
    $('#briefBody').innerHTML = h; this.go('sBrief');
    $('#bBack').onclick = () => this.go(o.reto ? 'sCover' : 'sHome');
    $$('[data-zona]').forEach(b => b.onclick = () => { Snd.sfx('tap'); this.brief(roleId, turno, Object.assign({}, o, { seed, zona: b.dataset.zona })); });
    $('#bGo').onclick = () => { Snd.init(); Snd.resume(); Game.start(roleId, turno, Object.assign({}, o, { seed, nov, wet })); };
  },
  /* ---------- resultados ---------- */
  result(res, meta, prog) {
    const r = ROLE[meta.roleId], S = Save.data;
    const msg = res.pass ? (res.stars === 3 ? '¡Turno perfecto! Eres un orgullo paisa.' : '¡Turno aprobado! Puedes mejorar las estrellas.') : '¡Casi! La meta obligatoria no se cumplió. Inténtalo otra vez.';
    let h = `<div class="pag">RESULTADO · ${meta.free ? 'PRÁCTICA' : meta.reto ? 'RETO DEL DÍA' : isMulti(meta.roleId) ? 'MULTIJUGADOR' : esc(shiftName(meta.roleId, meta.turno)).toUpperCase()} · ${esc(meta.nov.name)}</div>`;
    h += `<div class="sect"><span class="outline">${r.n}</span><h2 class="mega">${esc(r.name)}</h2></div>`;
    if (!meta.free) h += `<div class="stars">${this.starStr(res.stars)}</div>`;
    h += `<div class="kick" style="margin:6px 0">${msg}</div>`;
    h += Historia.result(res, meta);
    h += `<div class="stat"><div><b>${fmtInt(res.score)}</b><span>puntos</span></div><div><b>+${prog.xp}</b><span>experiencia</span></div>${prog.hojas ? `<div><b>+${prog.hojas} 🍃</b><span>hojas de premio</span></div>` : ''}<div><b>${S.streak}</b><span>racha</span></div><div><b>${Math.round(meta.dur)} s</b><span>duración</span></div></div>`;
    if (prog.best) h += `<div class="chip" style="margin:4px 0 8px">¡Nuevo récord en este turno!</div>`;
    h += `<ul class="goals">${res.goals.map(g => `<li class="${g.ok ? 'ok' : 'no'} ${g.main ? 'main' : ''}"><b>${g.ok ? '✓' : '✗'}</b><span>${esc(g.txt)}</span></li>`).join('')}</ul>`;
    if (prog.unlocks.length) h += `<div class="paper" style="margin:10px 0"><div class="t">¡Ascenso!</div><p style="margin:6px 0 0">Desbloqueaste: ${prog.unlocks.map(esc).join(', ')}</p></div>`;
    if (prog.logros && prog.logros.length) h += `<div class="logros" style="margin:10px 0">${prog.logros.map(l => `<div class="logro ok nuevo"><img class="px" src="${Art.iconURL(l.icon, 2)}" alt=""><b>🏅 ${esc(l.name)}</b><small>${esc(l.desc)}</small></div>`).join('')}</div>`;
    if (prog.logros && prog.logros.length) { const gifts = []; for (const k in COSMETIC_REQ) for (const i in COSMETIC_REQ[k]) if (prog.logros.some(l => l.id === COSMETIC_REQ[k][i][0])) gifts.push(COSMETIC_REQ[k][i][1]); if (gifts.length) h += `<p class="m" style="margin:4px 0 10px">🎁 Nueva ropa para tu ciclista: <b>${gifts.map(esc).join(', ')}</b> (en Mi ciclista).</p>`; }
    if (prog.lost) h += `<p class="m">Perdiste tus mejoras activas (roguelite). ¡A empezar de nuevo!</p>`;
    if (prog.perkOpts) h += `<div class="pag" style="margin-top:12px">Elige una mejora para tus próximos turnos</div><div class="perkcards">${prog.perkOpts.map(p => `<button class="perkcard" data-perk="${p}"><img class="px" src="${Art.iconURL(PERKS[p].icon, 2)}" alt=""><b>${esc(PERKS[p].name)}</b><span class="m">${esc(PERKS[p].desc)}</span></button>`).join('')}</div>`;
    const nextOk = !meta.free && !meta.reto && !isMulti(meta.roleId) && meta.turno < nShifts(meta.roleId) && this.turnoOk(r, meta.turno + 1);
    h += `<div class="col" style="display:flex;flex-direction:column;gap:12px;margin-top:14px">`;
    if (nextOk) h += `<button class="btn pri" id="bNext">▶ Siguiente turno</button>`;
    h += `<button class="btn ${nextOk ? '' : 'pri'}" id="bAgain">↻ Repetir</button>`;
    if (meta.reto) h += `<button class="btn amb" id="bShareR">Compartir mi reto</button>`;
    h += `<button class="btn" id="bShareImg">📷 Compartir mi resultado</button>`;
    h += `<button class="btn gh" id="bEsc">Escalafón</button></div>`;
    $('#resBody').innerHTML = h; this.go('sResult'); $('#sResult .scroll').scrollTop = 0;
    $$('[data-perk]').forEach(b => b.onclick = () => { $$('[data-perk]').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); const P = S.perks; if (!P.includes(b.dataset.perk)) { P.push(b.dataset.perk); if (P.length > 3) P.shift(); } Save.save(); Snd.sfx('star'); this.toast('Mejora: ' + PERKS[b.dataset.perk].name); });
    if (nextOk) $('#bNext').onclick = () => this.brief(meta.roleId, meta.turno + 1);
    $('#bAgain').onclick = () => { if (meta.net) { if (Net.status !== 'open') return this.toast('Se perdió la conexión: crea otra sala'); if (Net.role === 'host') { if (meta.roleId === 'equipo') this.netStartCoop(); else this.netStartRace(); } else this.toast('Pídele a quien creó la sala que inicie otra partida'); return; } this.brief(meta.roleId, meta.turno, { free: meta.free, reto: meta.reto, seed: meta.reto ? meta.seed : undefined, nov: meta.reto ? meta.nov : undefined }); };
    $('#bEsc').onclick = () => this.go('sHome');
    $('#bShareImg').onclick = () => this.shareCard(res, meta);
    if (meta.reto) $('#bShareR').onclick = () => this.share(`🚲 Juega EnCicla · Reto del día: hice ${fmtInt(res.score)} puntos como ${r.name} (${'★'.repeat(res.stars)}${'☆'.repeat(3 - res.stars)}). Código: ${this.code(meta)} ¿Me superas?`);
    Snd.sfx(res.pass ? 'win' : 'lose'); if (res.pass) confetti(res.stars);
  },
  /* ---------- reto / código ---------- */
  code(meta) { return ROLE[meta.roleId].n + '-' + meta.turno + '-' + (meta.seed >>> 0).toString(36).toUpperCase(); },
  parseCode(c) { const m = String(c).trim().toUpperCase().match(/^(\d{1,2})-(\d)-([0-9A-Z]+)$/); if (!m) return null; const r = ROLES[+m[1] - 1], t = +m[2]; if (!r || t < 1 || t > nShifts(r.id)) return null; return { roleId: r.id, turno: t, seed: parseInt(m[3], 36) >>> 0 }; },
  reto() {
    const seed = todaySeed(), av = ROLES.filter(r => this.unlocked(r)), r = av[seed % av.length], t = Math.min(nShifts(r.id), this.turnoOk(r, 2) ? 2 : 1);
    const rng = new RNG(seed); this.brief(r.id, t, { reto: true, seed, nov: rng.pick(NOVEDADES) });
  },
  multi() {
    const net = Net.supported();
    this.modal(`<h2>Jugar con amigos</h2>
    <div class="paper" style="margin:8px 0 14px"><div class="t">Carrera, mundo libre o turno en equipo · hasta 4</div><p style="margin:6px 0 0;font-size:14px">1) Quien crea la sala toca <b>Invitar</b> y muestra el QR o envía el código. 2) Cada amigo toca <b>Unirme</b>, escanea o pega el código y devuelve su respuesta. 3) Cuando estén todos, elige <b>Carrera</b> (compiten) o <b>Turno en equipo</b> (uno dirige desde Monitoreo y los demás manejan los camiones). En la misma red Wi-Fi funciona sin internet.</p></div>
    ${net ? '<div class="row"><button class="btn pri" id="nHost">Crear sala</button><button class="btn" id="nJoin">Unirme</button></div><div id="nBox" style="margin-top:10px"></div>' : '<p class="m">Este navegador no permite salas (WebRTC).</p>'}
    <div class="squig"></div><p class="m"><b>Reto con código</b> (sin internet): todos juegan las mismas condiciones y comparan puntos.</p>
    <input class="txtin" id="codeIn" placeholder="Ej: 2-1-K3F9QZ" maxlength="16" autocomplete="off"><div class="col"><button class="btn" id="bCode">Jugar ese código</button><button class="btn gh" id="mClose">Cerrar</button></div>`, () => {
      $('#bCode').onclick = () => { const p = this.parseCode($('#codeIn').value); if (!p) return this.toast('Código no válido'); if (!this.unlocked(ROLE[p.roleId])) return this.toast('Aún no tienes ese oficio'); this.closeModal(); this.brief(p.roleId, p.turno, { reto: true, seed: p.seed, nov: new RNG(p.seed).pick(NOVEDADES) }); };
      if (!net) return;
      const box = $('#nBox'); this.netRoster = null; this.netPlayers = {};
      Net.onstatus = s => { const st = $('#nStat'); if (st) st.textContent = { open: '¡Conectados!', failed: 'No se pudo conectar. Intenten en la misma red Wi-Fi.', disconnected: 'Conexión perdida', closed: 'Conexión cerrada', waiting: 'Esperando…' }[s] || s; if (Net.role === 'host') this.renderLobby(); };
      Net.onmsg = m => this.netLobbyMsg(m);
      $('#nHost').onclick = () => { Net.reset(); Net.role = 'host'; this.netPlayers = {}; this.renderLobby(); };
      $('#nJoin').onclick = () => {
        box.innerHTML = '<p class="pag">Escanea el QR de la sala o pega su código</p>' + (QR.canScan() ? '<div class="col"><button class="btn amb" id="nScan">📷 Escanear QR</button></div>' : '') + '<textarea class="txtin" rows="3" id="nOff" style="font-size:11px;margin-top:8px" placeholder="JE1o…"></textarea><div class="col"><button class="btn pri" id="nAnsB">Generar respuesta</button></div>';
        const gen = async txt => { try { box.innerHTML = '<p class="m">Generando respuesta…</p>'; const code = await Net.join(txt); box.innerHTML = this.codeUI('Muestra este QR (o envía la respuesta) a quien creó la sala', code, '<p class="m" id="nStat">Esperando que conecte…</p><div id="nRoster"></div>'); this.bindCode(code); } catch (e) { box.innerHTML = '<p class="m">' + esc(e.message) + '</p>'; } };
        $('#nAnsB').onclick = () => gen($('#nOff').value);
        const sc = $('#nScan'); if (sc) sc.onclick = () => QR.startScan(t => gen(t), e => this.toast(e));
      };
    });
  },
  codeUI(title, code, next) { return `<p class="pag">${title}</p><div class="qrbox" id="nQR"></div><textarea class="txtin" rows="2" readonly id="nCode" style="font-size:10px">${esc(code)}</textarea><div class="row" style="margin:8px 0"><button class="btn sm" id="nCopy">Copiar</button><button class="btn sm" id="nShare">Compartir</button></div>${next}`; },
  bindCode(code) {
    try { const q = $('#nQR'); if (q) q.appendChild(QR.canvas(code, 3, 3)); } catch (e) { }
    $('#nCopy').onclick = () => { const t = $('#nCode'); t.select(); (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => this.toast('Código copiado ✓')).catch(() => { document.execCommand('copy'); this.toast('Código copiado ✓'); }); };
    $('#nShare').onclick = () => this.shareCode(code);
  },
  /* sala del anfitrión: lista de jugadores, invitar (QR/código) y empezar */
  renderLobby() {
    const box = $('#nBox'); if (!box || Net.role !== 'host') return;
    const me = Save.data.profile, ps = [{ id: 0, name: me.name + ' (tú)' }].concat(Object.entries(this.netPlayers).map(([id, p]) => ({ id: +id, name: p.name })));
    const pend = Net.pending, canInv = Net.peers.length < Net.MAX && !pend, ready = Object.keys(this.netPlayers).length > 0;
    if (this._lobbyBusy) return;
    box.innerHTML = `<p class="pag">Sala · ${ps.length} de 4 jugadores</p><div class="roster">${ps.map(p => `<span class="chip">🚲 ${esc(p.name)}</span>`).join('')}</div>
      <div id="nInv"></div><div class="col">${canInv ? '<button class="btn" id="nInvite">+ Invitar jugador</button>' : ''}<button class="btn pri" id="nStart" ${ready ? '' : 'disabled'}>🏁 Carrera de postales</button><button class="btn amb" id="nCoop" ${ready ? '' : 'disabled'}>🤝 Turno en equipo</button></div><p class="m" style="font-size:13px">En equipo: tú diriges desde Monitoreo y tus amigos manejan los camiones.</p><p class="m" id="nStat"></p>`;
    const inv = $('#nInvite'); if (inv) inv.onclick = async () => {
      this._lobbyBusy = true; $('#nInv').innerHTML = '<p class="m">Preparando invitación…</p>';
      try { const code = await Net.host(); $('#nInv').innerHTML = this.codeUI('Invitación ' + Net.peers.length + ': que tu amigo escanee este QR', code, '<p class="pag">Luego escanea o pega su respuesta</p>' + (QR.canScan() ? '<div class="col"><button class="btn amb" id="nScanA">📷 Escanear respuesta</button></div>' : '') + '<textarea class="txtin" rows="2" id="nAns" style="font-size:10px" placeholder="JE1a…"></textarea><div class="col"><button class="btn pri" id="nGo">Conectar</button></div>'); this.bindCode(code);
        const acc = async t => { try { await Net.accept(t); this._lobbyBusy = false; this.toast('Conectando…'); setTimeout(() => this.renderLobby(), 300); } catch (e) { this.toast(e.message); } };
        $('#nGo').onclick = () => acc($('#nAns').value); const sa = $('#nScanA'); if (sa) sa.onclick = () => QR.startScan(t => acc(t), e => this.toast(e));
      } catch (e) { this._lobbyBusy = false; $('#nInv').innerHTML = '<p class="m">No se pudo crear la invitación: ' + esc(e.message) + '</p>'; }
    };
    const st = $('#nStart'); if (st) st.onclick = () => this.netStartRace(); const co = $('#nCoop'); if (co) co.onclick = () => this.netStartCoop();
  },
  shareCode(code) { const t = 'Juega EnCicla · código de sala: ' + code; if (navigator.share) navigator.share({ text: t }).catch(() => { }); else { const wa = 'https://wa.me/?text=' + encodeURIComponent(t); if (window.Capacitor) location.href = wa; else window.open(wa, '_blank'); } },
  netLobbyMsg(m) {
    const P = Save.data.profile, clean = p => ({ id: p.id | 0, name: String(p.name || 'Amigo').slice(0, 16), shirt: /^#[0-9a-f]{6}$/i.test(p.shirt) ? p.shirt : PAL.cor });
    if (m.t === 'id' && Net.role === 'guest') { Net.myId = m.id | 0; Net.send({ t: 'hi', name: P.name, shirt: SHIRTS[P.shirt] }); }
    else if (m.t === 'hi' && Net.role === 'host') { this.netPlayers[m.from] = Object.assign(clean(m), { id: m.from | 0 }); this._lobbyBusy = false; Net.send({ t: 'roster', players: this.roster() }); this.renderLobby(); Snd.sfx('coin'); }
    else if (m.t === 'roster' && Net.role === 'guest') { this.netRoster = (m.players || []).slice(0, 4).map(clean); const r = $('#nRoster'); if (r) r.innerHTML = '<div class="roster">' + this.netRoster.map(p => `<span class="chip">🚲 ${esc(p.name)}</span>`).join('') + '</div>'; const st = $('#nStat'); if (st) st.textContent = '¡En la sala! Esperando que empiece la partida…'; }
    else if (m.t === 'start' && Net.role === 'guest') { if (m.kind === 'coop') this.netCoop(m.seed >>> 0, (m.players || []).map(clean)); else this.netRace(m.seed >>> 0, m.lvl || 2, (m.players || []).map(clean)); }
    else if (m.t === 'bye' && Net.role === 'host') { delete this.netPlayers[m.from]; this.renderLobby(); }
  },
  roster() { const P = Save.data.profile; return [{ id: 0, name: P.name, shirt: SHIRTS[P.shirt] }].concat(Object.values(this.netPlayers)); },
  netStartRace() { const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, players = this.roster(); Net.send({ t: 'start', seed, lvl: 2, players }); this.netRace(seed, 2, players); },
  /* turno cooperativo: el anfitrión es Monitoreo y cada invitado maneja un camión */
  netStartCoop() { const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, players = this.roster(); Net.send({ t: 'start', kind: 'coop', seed, players }); this.netCoop(seed, players); },
  netCoop(seed, players) {
    this.closeModal(); if (Game.mode) Game.stop(); const host = Net.role === 'host';
    Game.start('equipo', 1, { seed, nov: NOVEDADES[0], net: true, driver: !host, players: host ? (players || []).filter(p => p.id !== 0) : players });
  },
  netRace(seed, lvl, players) {
    this.closeModal(); if (Game.mode) Game.stop(); const others = (players || []).filter(p => p.id !== Net.myId);
    Game.start('carrera', lvl, { seed, nov: NOVEDADES[0], net: true, players: others.length ? others : [{ id: 0, name: 'Amigo', shirt: PAL.cor }] });
  },
  /* ---------- modales ---------- */
  modal(html, bind) { $('#mBody').innerHTML = html; $('#modal').hidden = false; const c = $('#mClose'); if (c) c.onclick = () => this.closeModal(); if (bind) bind(); },
  closeModal() { $('#modal').hidden = true; },
  confirm(q, yes) { this.modal(`<h2>¿Seguro?</h2><p class="m">${esc(q)}</p><div class="col"><button class="btn amb" id="mYes">Sí</button><button class="btn gh" id="mClose">No</button></div>`, () => { $('#mYes').onclick = () => { this.closeModal(); yes(); }; }); },
  howto() {
    this.modal(`<h2>Cómo jugar</h2><div class="howto">
    <div><b>1</b><span><b>Pedalear:</b> arrastra el dedo en cualquier parte de la pantalla hacia donde quieres ir (o usa flechas/WASD). La línea punteada te guía.</span></div>
    <div><b>2</b><span><b>Ciclorrutas verdes:</b> son más rápidas y seguras. Evita los carros: ¡usa el timbre!</span></div>
    <div><b>3</b><span><b>Minimapa:</b> tócalo para ver la vista general del valle.</span></div>
    <div><b>4</b><span><b>Turnos:</b> cada oficio tiene 3 turnos con 3 metas. La primera es obligatoria. Gana estrellas para ascender.</span></div>
    <div><b>5</b><span><b>Mejoras:</b> al aprobar eliges una; si fallas un turno, las pierdes (roguelite).</span></div>
    <div><b>6</b><span><b>Ritmo tranquilo</b> en Más: más tiempo para niños y abuelos.</span></div></div><div class="col"><button class="btn pri" id="mClose">¡Listo!</button></div>`);
  },
  credits() {
    this.modal(`<h2>Créditos</h2><p class="m" style="font-size:20px"><b>Creado por OneZero</b></p><p class="m">Juega EnCicla v${JE.version}</p>
    <p class="m" style="font-size:12px;opacity:.75">Mapa: ${esc(VALLE_META.src)}</p><div class="col"><button class="btn gh" id="mClose">Cerrar</button></div>`);
  },
  avatar() {
    const P = Save.data.profile;
    const S = Save.data, req = (key, i) => (COSMETIC_REQ[key] || {})[i], price = (key, i) => (SHOP[key] || {})[i];
    const locked = (key, i) => { const r = req(key, i), p = price(key, i); return (r && !S.logros.includes(r[0])) || (p && !S.owned.includes(key + i)); };
    const sw = (arr, key) => `<div class="swatches">${arr.map((c, i) => { const r = req(key, i), p = price(key, i), lk = locked(key, i), em = key === 'bell'; return `<button data-k="${key}" data-i="${i}" class="${(P[key] | 0) === i ? 'on' : ''} ${lk ? (p ? 'buy' : 'lock') : ''} ${em ? 'em' : ''}" style="background:${em ? '#143a6b' : c}" aria-label="${esc((r || p || [0, key + ' ' + (i + 1)])[1])}">${em ? c : ''}${lk ? (p ? '<small>🍃' + p[0] + '</small>' : '🔒') : r ? '★' : ''}</button>`; }).join('')}</div>`;
    this.modal(`<h2>Mi ciclista</h2><canvas id="avPrev" width="80" height="50"></canvas><p class="pag">Nombre</p><input class="txtin" id="avName" maxlength="16" value="${esc(P.name)}">
      <p class="pag">Piel</p>${sw(SKINS, 'skin')}<p class="pag">Camiseta</p>${sw(SHIRTS, 'shirt')}<p class="pag">Casco</p>${sw(HELMETS, 'helmet')}
      <div class="paper" style="margin:14px 0 4px"><div class="t">Tienda · <span id="avHojas"></span></div><p style="margin:4px 0 0;font-size:13px">Las hojas verdes se ganan pedaleando como Usuario y con las estrellas de cada turno. Lo que tiene precio se compra con dos toques.</p></div>
      <p class="pag">Color de la bici</p>${sw(BIKES, 'bike')}<p class="pag">Timbre</p>${sw(BELLS, 'bell')}<div class="col"><button class="btn pri" id="avOk">Guardar</button></div>`, () => {
      const draw = () => { const c = $('#avPrev'), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#143a6b'; x.fillRect(0, 0, 80, 50); x.fillStyle = '#5e9a1e'; x.fillRect(0, 40, 80, 10); Art.cover(x, 80, 50, 0); $('#avHojas').textContent = '🍃 ' + hojas() + ' hojas'; };
      let arm = null;
      draw(); $$('.swatches button').forEach(b => b.onclick = () => {
        const k = b.dataset.k, i = +b.dataset.i, r = req(k, i), p = price(k, i);
        if (r && !S.logros.includes(r[0])) { const L = LOGROS.find(l => l.id === r[0]); Snd.sfx('bad'); return this.toast('🔒 ' + r[1] + ': se gana con el logro «' + (L && !L.secret ? L.name : '???') + '»'); }
        if (p && !S.owned.includes(k + i)) {
          if (hojas() < p[0]) { Snd.sfx('bad'); return this.toast('🍃 ' + p[1] + ' cuesta ' + p[0] + ' hojas: te faltan ' + (p[0] - hojas())); }
          if (arm !== b) { arm = b; Snd.sfx('tap'); return this.toast('🍃 ' + p[1] + ' · ' + p[0] + ' hojas. Toca otra vez para comprar.'); }
          S.spent = (S.spent | 0) + p[0]; S.owned.push(k + i); S.stats.bought = (S.stats.bought | 0) + 1; b.classList.remove('buy'); const sm = b.querySelector('small'); if (sm) sm.remove(); Snd.sfx('star'); this.toast('¡Compraste ' + p[1] + '!');
        }
        arm = null; P[k] = i; $$(`.swatches button[data-k=${k}]`).forEach(x => x.classList.toggle('on', x === b)); Save.save(); draw(); if (k === 'bell') Snd.sfx('bell'); else Snd.sfx('tap');
      });
      $('#avOk').onclick = () => { P.name = ($('#avName').value || 'Ciclista').trim().slice(0, 16) || 'Ciclista'; Save.data.settings.seen.profile = 1; Save.save(); this.closeModal(); this.renderHome(); Snd.sfx('ok'); };
    });
  },
  diag() {
    this.modal(`<h2>Bot de pruebas</h2><p class="m">Juega partidas automáticas de los todos los oficios a alta velocidad y revisa errores, números imposibles y bicis perdidas. No cambia tu progreso.</p><div class="col"><button class="btn pri" id="dRun">Probar 27 partidas</button></div><pre class="rep" id="dOut">Listo para probar.</pre><div class="col"><button class="btn gh" id="mClose">Cerrar</button></div>`, () => {
      $('#dRun').onclick = async () => { $('#dRun').disabled = true; const out = $('#dOut'); out.textContent = 'Probando…'; const rep = await JE.bot.run({ n: 27, onProgress: (i, n) => out.textContent = 'Partida ' + i + ' de ' + n + '…' }); out.textContent = JE.bot.format(rep); $('#dRun').disabled = false; };
    });
  },
  /* ---------- exportar / importar / compartir ---------- */
  exportSave() {
    const txt = Save.exportText(), d = new Date(), name = 'juega-encicla-partidas-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '.json';
    const blob = new Blob([txt], { type: 'application/json' });
    if (window.Capacitor) { // en la app Android: copiar el respaldo (las descargas blob no existen en el WebView)
      this.modal(`<h2>Exportar partidas</h2><p class="m">Copia este texto y guárdalo (notas, correo o WhatsApp). Para recuperarlo usa Importar con un archivo .json.</p><textarea class="txtin" id="expTxt" rows="7" readonly style="font-size:11px">${esc(txt)}</textarea><div class="col"><button class="btn pri" id="bCopy">Copiar</button><button class="btn gh" id="mClose">Cerrar</button></div>`, () => {
        $('#bCopy').onclick = () => { const t = $('#expTxt'); t.select(); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => this.toast('Copiado ✓')).catch(() => { document.execCommand('copy'); this.toast('Copiado ✓'); }); };
      }); return;
    }
    try {
      const file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) { navigator.share({ files: [file], title: 'Partidas de Juega EnCicla' }).catch(() => this.download(blob, name)); return; }
    } catch (e) { }
    this.download(blob, name);
  },
  download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); this.toast('Partidas exportadas: ' + name); },
  importFile(e) {
    const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { try { Save.importText(rd.result); this.toast('Partidas importadas ✓'); this.renderHome(); } catch (err) { this.toast('No se pudo importar: ' + err.message); } e.target.value = ''; };
    rd.readAsText(f);
  },
  share(text) {
    const url = /^https?:/.test(location.protocol) && !/localhost|127\.0/.test(location.host) ? location.href.split('#')[0].split('?')[0] : JE.URL;
    if (navigator.share) navigator.share({ title: 'Juega EnCicla', text, url }).catch(() => { });
    else { const wa = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url); if (window.Capacitor) location.href = wa; else window.open(wa, '_blank'); }
  },
  toast(t) {
    const el = $('#toast'); if (!el || this.mute) return; const q = this._tq || (this._tq = []);
    if (q.includes(t) || el.textContent === t && el.classList.contains('on')) return; q.push(t); if (q.length > 3) q.splice(0, q.length - 3);
    if (!this._tt) this.toastNext();
  },
  toastNext() {
    const el = $('#toast'), q = this._tq || []; const t = q.shift(); if (!t) { el.classList.remove('on'); this._tt = null; return; }
    el.textContent = t; el.classList.add('on'); const ms = clamp(1000 + t.length * 22, 1500, 2800) * (q.length ? .75 : 1);
    this._tt = setTimeout(() => { el.classList.remove('on'); this._tt = setTimeout(() => { this._tt = null; this.toastNext(); }, 220); }, ms);
  },
  postal(L) { this.toast('📮 ¡Nueva postal! ' + L.name); }
};

/* ---------------- bucle de juego ---------------- */
const Game = JE.game = {
  mode: null, meta: null, paused: false, raf: 0, last: 0, _vk: '', hudKey: '', actKey: '', goalT: 0,
  start(roleId, turno, o) {
    const role = ROLE[roleId];
    this.mode = new MODE_CLASS[roleId](role, turno, { seed: o.seed, nov: o.nov, perks: o.free || isMulti(roleId) ? [] : Save.data.perks.slice(), free: o.free, reto: o.reto, net: o.net, oppName: o.oppName, oppShirt: o.oppShirt, players: o.players, wet: o.wet, driver: o.driver, zona: o.zona, bici: o.bici, comp: o.comp, n: o.n });
    this.meta = { roleId, turno, free: !!o.free, reto: !!o.reto, net: !!o.net, seed: o.seed, nov: o.nov, dur: 0 };
    this.hintsOn = Save.data.settings.hints !== false && (roleId === 'carrera' ? !Save.data.history.some(h => h.m === 'carrera') : !(UI.stars(roleId)[0] > 0));
    UI.go('sGame'); $('#toast').classList.remove('on'); View.resize(); this._vk = ''; this.applyView();
    $('#hudTtl').textContent = role.name + (o.free ? ' · libre' : o.reto ? ' · reto' : isMulti(roleId) ? '' : ' · ' + (role.shifts && role.shifts[turno - 1] ? role.shifts[turno - 1].n.replace(/^Turno (\d) · /, 'T$1 ') : 'T' + turno)); this.hudKey = ''; this.actKey = ''; $('#actBar').innerHTML = '';
    this.coachT = 0; this._coachEr = 0; $('#coach').textContent = ''; this.goalOpen = 7; this._gst = null; UI._tq = []; clearTimeout(UI._tt); UI._tt = null; $('#toast').classList.remove('on');
    this.paused = false; this.last = performance.now(); cancelAnimationFrame(this.raf); Snd.theme = ['monitoreo', 'supervisor', 'tecnico'].includes(roleId) ? 1 : 0; Snd.music(true);
    this.raf = requestAnimationFrame(t => this.loop(t));
  },
  applyView() { const a = this.mode.sub || this.mode, v = a.view || { kind: 'map' }, k = v.kind + v.dw + v.dh; if (this._vk !== k) { this._vk = k; View.setMode(v.kind, v.dw, v.dh); } },
  loop(t) {
    if (!this.mode) return;
    const dt = Math.min(.05, Math.max(0, (t - this.last) / 1000)); this.last = t;
    try {
      if (!this.paused) { this.mode.update(dt); Snd.setMood(this.moodOf(this.mode)); }
      this.draw(); this.dom(dt);
    } catch (e) { JE.errors.push('loop: ' + e.message); console.error(e); }
    if (this.mode.done) return this.finish();
    this.raf = requestAnimationFrame(t2 => this.loop(t2));
  },
  draw() {
    this.applyView(); const a = this.mode.sub || this.mode, V = View; V.subX = V.subY = 0;
    a.render(V); V.present(); if (a.renderTop) a.renderTop(V); V.ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    if (this.mode.sub && this.mode.ride) { a.hud(V); } else this.mode.hud(V);
    if (this.hintsOn && !this.paused && a.hint) { const h = a.hint(V); if (h) drawHand(V, h); }
  },
  dom(dt) {
    const M = this.mode, inf = M.info(), a = M.sub || M;
    const key = inf.clock + '|' + inf.score + '|' + inf.chips.map(c => c.t + c.c).join(',');
    if (key !== this.hudKey) { this.hudKey = key; $('#hudClock').textContent = '⏱ ' + inf.clock; $('#hudScore').textContent = '★ ' + fmtInt(inf.score); $('#hudChips').innerHTML = inf.chips.map(c => `<span class="chip ${c.c || ''}">${esc(c.t)}</span>`).join(''); }
    const co = $('#coach'), ct = a.coach || '';
    // el cartel de ayuda no debe tapar el juego: es pequeño en el mapa y se quita solo tras el tiempo de lectura.
    // Vuelve si cambia el texto o si el jugador se equivoca; también se lee en el menú de pausa.
    const ride = !!M.ride && !M.sub, er = (a.errors | 0) + (M.errors | 0);
    if (co.textContent !== ct) { co.textContent = ct; this.coachT = 0; }
    if (er !== this._coachEr) { if (er > (this._coachEr | 0)) this.coachT = 0; this._coachEr = er; }
    this.coachT = (this.coachT || 0) + dt;
    const life = clamp(1.2 + ct.length * .028, 2, 3.4) * (Save.data.settings.pace === 'tranquilo' ? 1.4 : 1) * (this.hintsOn ? 1 : .65);
    const op = ct && this.coachT < life ? '1' : '0'; if (co.style.opacity !== op) co.style.opacity = op;
    co.classList.toggle('mini', ride);
    const top = !!a.coachB && View.h < 520 && !ride; co.classList.toggle('coachTop', top);
    const cb = top ? '' : 'calc(var(--sab) + ' + (a.coachB || 12) + 'px)'; if (co.style.bottom !== cb) co.style.bottom = cb;
    const gm = $('#goalsMini'), hide = a.hideGoals ? 'none' : ''; if (gm.style.display !== hide) gm.style.display = hide;
    this.goalT -= dt; this.goalOpen = Math.max(0, (this.goalOpen == null ? 7 : this.goalOpen) - dt);
    if (this.goalT <= 0) {
      this.goalT = .4; const st = M.goals.map(g => (g.ok() ? 1 : 0) + g.prog()).join('|'); if (st !== this._gst) { if (this._gst != null) this.goalOpen = 3.5; this._gst = st; }
      const full = this.goalOpen > 0 && ride, L = M.free && M.id === 'usuario' ? [] : full ? M.goals : M.goals.filter(g => g.main);
      gm.classList.toggle('mini', !full);
      gm.innerHTML = L.map(g => { const ok = g.ok(); return `<div class="${ok ? 'ok' : ''} ${g.main ? 'main' : ''}">${ok ? '✓' : g.main ? '★' : '☆'} ${esc(g.txt)} · ${esc(g.prog())}</div>`; }).join('') + (!full && M.goals.length > 1 && ride ? `<div class="more">+${M.goals.length - 1} metas</div>` : '');
    }
    this.layout(ride);
    const acts = M.sub ? [] : M.actions(), ak = acts.map(x => x.id + x.label).join(',');
    if (ak !== this.actKey) { this.actKey = ak; const bar = $('#actBar'); bar.innerHTML = acts.map((x, i) => `<button class="abtn" data-i="${i}"><img class="px" src="${Art.iconURL(x.icon, 2)}" alt="">${esc(x.label)}</button>`).join(''); $$('.abtn', bar).forEach(b => b.onclick = () => { const x = (M.actions())[+b.dataset.i]; if (x) x.fn(); }); }
  },
  /* lo que siente la música: velocidad, racha, pendiente, noche y apuro */
  moodOf(M) {
    const a = M.sub || M, R = M.ride; let e = .4, t = 0, k = 0, sl = 0; const n = Art.night(M.clock || 600);
    if (R && !M.sub) { e = clamp(R.p.v / R.stats_().max, 0, 1); k = R.cicLv || 0; sl = R.sl || 0; }
    else e = a.queue ? .45 + Math.min(.45, a.queue.length * .09) : .55;
    const ph = M.phase; if (ph && ph.tasks) { let best = 1e9; for (const x of ph.tasks) if (!x.done && x.due) best = Math.min(best, (x.due - M.clock) / Math.max(.1, M.rate)); t = clamp(1 - best / 25, 0, 1); }
    if (M.loanMin && !M.free) t = Math.max(t, clamp((M.loanMin() - 40) / 20, 0, 1));
    if (a.queue && a.patMax) t = Math.max(t, clamp((a.queue.length - 2) / 4, 0, 1));
    if (a.gauge || (a.state === 'walk' && Math.abs(a.th || 0) > .6)) t = Math.max(t, .7);
    return { e, t, k, n, sl };
  },
  /* acomoda las capas para que nada quede encima de nada: HUD arriba, metas a la izquierda, mapa a la derecha, avisos debajo */
  layout(ride) {
    const hud = $('#hud').getBoundingClientRect(), gm = $('#goalsMini'), hb = Math.round(hud.bottom);
    const gt = (hb + 6) + 'px'; if (gm.style.top !== gt) gm.style.top = gt;
    const g = gm.style.display === 'none' ? { bottom: hb } : gm.getBoundingClientRect(), mmB = ride ? hb + 8 + Math.round(Math.min(84, View.w * .21) * 1.55) + 22 : hb;
    View.hudB = hb; View.top = Math.max(hb, Math.round(g.bottom)) + 6;
    const tt = Math.max(View.top, mmB) + 8 + 'px'; document.documentElement.style.setProperty('--toastTop', tt);
    const ctrl = ride && Ctrl.kind() !== 'flotante'; document.body.classList.toggle('ctrlR', ctrl);
  },
  pause() {
    if (!this.mode) return; const net = !!this.meta.net; this.paused = !net; if (!net) Snd.music(false); const map = !!this.mode.ride;   // en red el juego no se detiene
    UI.modal(`<h2>${net ? 'Menú' : 'Pausa'}</h2><p class="m">${esc(ROLE[this.mode.id].name)} · ${net ? 'en red: el juego sigue corriendo' : (this.meta.free ? 'práctica' : 'turno ' + this.meta.turno) + ' · ' + esc(this.mode.nov.name)}</p>${(this.mode.sub || this.mode).coach ? `<p class="m" style="font-size:14px">💡 ${esc((this.mode.sub || this.mode).coach)}</p>` : ''}<div class="col"><button class="btn pri" id="pGo">▶ Continuar</button>${map ? '<button class="btn" id="pMap">Vista general</button>' : ''}${net ? '' : '<button class="btn" id="pRe">↻ Reiniciar</button>'}<button class="btn" id="pSnd">Sonido: ${Save.data.settings.sfx ? 'sí' : 'no'}</button><button class="btn gh" id="pEnd">${this.meta.free ? 'Terminar práctica' : 'Salir del turno'}</button></div>`, () => {
      $('#pGo').onclick = () => this.resume();
      if (map) $('#pMap').onclick = () => { this.mode.ride.big = true; this.resume(); };
      if (!net) $('#pRe').onclick = () => { UI.closeModal(); const m = this.meta; this.stop(); Game.start(m.roleId, m.turno, { free: m.free, reto: m.reto, seed: m.reto ? m.seed : ((Date.now() ^ 0x9e3779b9) >>> 0), nov: m.nov }); };
      $('#pSnd').onclick = () => { const S = Save.data.settings; S.sfx = S.music = !S.sfx; Save.save(); $('#pSnd').textContent = 'Sonido: ' + (S.sfx ? 'sí' : 'no'); };
      $('#pEnd').onclick = () => { UI.closeModal(); if (net) { const M = this.mode; if (M.id === 'equipo' && Net.role === 'host') M.end(); else { Net.send({ t: 'bye' }); Net.onmsg = m => UI.netLobbyMsg(m); } this.stop(); UI.go('sHome'); } else if (this.meta.free) { this.paused = false; this.mode.end(); this.finish(); } else { this.stop(); UI.go('sHome'); } };
    });
  },
  resume() { UI.closeModal(); this.paused = false; this.last = performance.now(); Snd.music(true); },
  stop() { cancelAnimationFrame(this.raf); this.mode = null; Input.joy.on = false; },
  finish() {
    cancelAnimationFrame(this.raf); const M = this.mode, meta = this.meta; meta.dur = M.t; this.mode = null; Input.joy.on = false;
    const res = M.result(), prog = Progress.apply(res, meta, M);
    UI.result(res, meta, prog);
  },
  key(e) { if (!this.mode) return; if (e.code === 'Escape' || e.code === 'KeyP') { this.paused ? this.resume() : this.pause(); return; } const a = this.mode.sub || this.mode; if (a.key) a.key(e); }
};

const Progress = JE.progress = {
  apply(res, meta, M) {
    const S = Save.data, out = { xp: 0, unlocks: [], perkOpts: null, lost: false, best: false };
    const before = ROLES.filter(r => UI.unlocked(r)).map(r => r.id);
    out.xp = Math.round(res.score / 10) + res.stars * 20 + (meta.reto ? 15 : 0); if (meta.free) out.xp = Math.round(out.xp / 3);
    S.xp += out.xp; S.stats.plays++; out.hojas = meta.free ? 0 : res.stars * 2; S.stats.leaves += out.hojas;
    if (!meta.free && !isMulti(meta.roleId)) {
      const st = S.stars[meta.roleId] || [0, 0, 0]; if (res.stars > st[meta.turno - 1]) st[meta.turno - 1] = res.stars; S.stars[meta.roleId] = st;
      const k = meta.roleId + meta.turno; if (res.score > (S.best[k] || 0)) { out.best = !!S.best[k]; S.best[k] = res.score; }
      if (res.pass) {
        S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
        const pool = Object.keys(PERKS).filter(p => !S.perks.includes(p)), rng = new RNG((Date.now() ^ meta.seed) >>> 0);
        out.perkOpts = rng.shuffle(pool).slice(0, 3);
      } else { S.streak = 0; if (S.perks.length) { S.perks = []; out.lost = true; } }
    }
    S.stats.km += Math.round((M.ride ? M.ride.stats.dist * M_PER_PX : 0)) / 1000; if (M.ride) S.stats.bells += M.ride.stats.bells;
    Save.addHistory({ d: Date.now(), m: meta.roleId, t: meta.turno, s: res.score, st: res.stars, p: res.pass, free: meta.free, reto: meta.reto, net: meta.net, nov: meta.nov.id, dur: Math.round(meta.dur), seed: meta.seed });
    out.unlocks = ROLES.filter(r => UI.unlocked(r) && !before.includes(r.id)).map(r => r.name);
    out.logros = Logros.check();
    Save.save(); return out;
  }
};

/* ---------------- entrada sobre el lienzo ---------------- */
function bindCanvas() {
  const cv = $('#cv'), pos = e => { const r = cv.getBoundingClientRect(); return { cx: e.clientX - r.left, cy: e.clientY - r.top }; };
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); Snd.init(); Snd.resume(); const M = Game.mode; if (!M || Game.paused) return;
    const { cx, cy } = pos(e), v = View.toV(cx, cy), a = M.sub || M;
    const used = a.pointer('down', v.x, v.y, cx, cy);
    if (!used && !M.sub && M.ride && M.view.kind === 'map' && !Input.joy.on) Ctrl.down(e, cx, cy, cv);
  });
  cv.addEventListener('pointermove', e => { const j = Input.joy; if (j.on && e.pointerId === j.id) { const { cx, cy } = pos(e); j.x = cx; j.y = cy; } });
  const up = e => { const j = Input.joy; if (j.on && e.pointerId === j.id) j.on = false; Ctrl.up(e); const M = Game.mode; if (M) { const a = M.sub || M, { cx, cy } = pos(e), v = View.toV(cx, cy); a.pointer('up', v.x, v.y, cx, cy); } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('contextmenu', e => e.preventDefault());
}

/* mano guía animada */
function drawHand(V, h) {
  const c = V.ctx, t = performance.now() / 1000; let x = h.x, y = h.y;
  if (h.drag) { const k = (t % 1.7) / 1.2, kk = Math.min(1, k); x += h.dx * kk; y += h.dy * kk; c.globalAlpha = k > 1 ? Math.max(0, 1 - (k - 1) * 2.5) : 1; c.strokeStyle = '#ffffffaa'; c.lineWidth = 4; c.setLineDash([6, 7]); c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(x, y); c.stroke(); c.setLineDash([]); }
  else { const r = (t * 1.4 % 1) * 24; c.strokeStyle = 'rgba(255,255,255,' + (1 - r / 24).toFixed(2) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r + 6, 0, TAU); c.stroke(); y += 6 + Math.abs(Math.sin(t * 5)) * 8; }
  c.imageSmoothingEnabled = false; c.drawImage(Art.hand(), x - 11, y - 1, 32, 30);
  if (h.txt) V.text(h.txt, x + 6, y + 44, { size: 13, align: 'center', bg: PAL.az, color: '#fff', pad: 3 });
  c.globalAlpha = 1;
}
/* confeti al aprobar */
function confetti(n) {
  if (JE.headless || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const d = document.createElement('div'); d.className = 'confetti'; const cols = ['#9bd341', '#ffffff', '#ffc93c', '#56c7ff', '#c4ec7c'];
  for (let i = 0; i < 30 + n * 20; i++) { const e = document.createElement('i'); e.style.left = (Math.random() * 100) + '%'; e.style.background = cols[i % cols.length]; e.style.animationDelay = (Math.random() * .8) + 's'; e.style.animationDuration = (2 + Math.random() * 1.4) + 's'; e.style.width = (6 + Math.random() * 6) + 'px'; d.appendChild(e); }
  document.body.appendChild(d); setTimeout(() => d.remove(), 4200);
}
