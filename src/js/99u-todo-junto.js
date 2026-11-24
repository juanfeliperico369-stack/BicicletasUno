/* =====================================================================
   TODO JUNTO (ronda 3.5, Claude) · como el «Todo junto» de Motor City 5.1: lo que hicieron las tres IA, en una sola experiencia.
   En la 3.4 quedaron dos sistemas que hacían lo mismo, con los mismos vecinos: las habilidades (las de Claude y el RPG de
   Gemini, con dos «Resistencia») y los encargos (los de los vecinos en el valle y los arcos de mentores del «Valle Vivo»). Y
   tres puertas a las actividades: «Oficios aquí», el hub «🗺️ Valle Vivo» y «🧭 Hoy en el valle». Aquí:
   1) HABILIDADES: un solo panel (📔 Mi diario y habilidades): Pedaleo y Conocer el valle, y las cuatro del RPG (Resistencia,
      Técnica y trucos, Oficio y estrategia, Cultura cívica). Las subidas y los trucos de las plazas suman a las del RPG
      (99h-valle-vivo.js). En la pestaña ⭐ del hub, un botón lleva al panel.
   2) ENCARGOS: en la pestaña 🤝 del hub salen también los encargos de los vecinos, con su estado y «📍 Ir».
   3) HOY EN EL VALLE sugiere también el siguiente paso de un arco de mentor y una actividad del hub (rota cada día), y su
      tarjeta trae «🗺️ Ver todo», que abre el hub.
   El reparto de personajes se unificó en contenido/guion/trama_valle.json (cada vecino tiene su oficio y su vida en el valle).
   ===================================================================== */
(function () {
  const RPG = JE.rpg; if (!RPG || !RPG.abrirHub) return;
  /* ---------- el hub: encargos de los vecinos y el panel de habilidades ---------- */
  const _hub = RPG.abrirHub;
  RPG.abrirHub = function (M, tab) {
    const r = _hub.apply(this, arguments), body = $('#mBody'); if (!body || !M || !M.ride) return r; tab = tab || 'act';
    const cierra = body.querySelector('#hClose'), antes = cierra ? cierra.closest('.col') : null, sec = document.createElement('div');
    if (tab === 'arcos' && typeof Encargos !== 'undefined' && Encargos.lista().length) {
      const D = Encargos.d();
      sec.innerHTML = `<div class="pag" style="margin:12px 0 4px">💬 Encargos de los vecinos (en el valle, a pie y en bici)</div><div class="col" style="gap:8px">` + Encargos.lista().map(e => {
        const p = Encargos.pers(e.quien), hecho = D.hechos.includes(e.id), activo = D.activo === e.id, i = D.paso[e.id] | 0;
        return `<div class="rpg-card"><b>${hecho ? '✅' : activo ? '💬' : '❗'} ${esc(e.titulo)}${p ? ' · ' + esc(p.name) : ''}</b><small class="m">${hecho ? 'Terminado: «' + esc(e.final) + '»' : activo ? 'Paso ' + (i + 1) + ' de ' + e.pasos.length + ': ' + esc(e.pasos[i] ? e.pasos[i].corto : '') : 'Búscalo en el valle: ' + esc(p ? p.lugar || p.name : e.quien)}</small>${hecho ? '' : `<div class="row" style="margin-top:6px"><button class="btn sm pri" data-encgo="${e.id}">📍 Ir</button></div>`}</div>`;
      }).join('') + `</div>`;
    } else if (tab === 'rpg' && UI.diario) {
      sec.innerHTML = `<button class="btn sm pri" id="hHabil" style="width:100%;margin-top:10px">💪 Todas mis habilidades y el diario</button>`;
    } else return r;
    if (antes) antes.before(sec); else body.append(sec);
    const resume = () => { UI.closeModal(); if (Game.paused) Game.resume(); };
    sec.querySelectorAll('[data-encgo]').forEach(b => b.onclick = () => {
      const e = Encargos.lista().find(x => x.id === b.dataset.encgo); if (!e) return; resume();
      if (Encargos.d().activo === e.id) { Encargos.marcar(M, true); if (JE.ui) JE.ui.toast('💬 ' + e.titulo + ': sigue la flecha'); return; }
      const p = Encargos.pers(e.quien); if (p && typeof Hoy !== 'undefined') Hoy.ir(M, { titulo: p.name + ' te necesita: ' + e.titulo, x: p.x, y: p.y + 8 * WK, km: dist(p.x, p.y, M.ride.p.x, M.ride.p.y) * M_PER_PX / 1000, aqui: () => Encargos.empezar(M, e) });
    });
    const hb = sec.querySelector('#hHabil'); if (hb) hb.onclick = () => { Snd.sfx('tap'); UI.diario(); };
    return r;
  };
  /* ---------- Hoy en el valle: arcos de mentores y actividades del hub; y «Ver todo» ---------- */
  if (typeof Hoy !== 'undefined') {
    Hoy.fuentes.push((M, add) => {
      const E = RPG.estado(), P = M.ride.p;
      const ARC = [['luz', '🚲', 'Doña Luz'], ['santi', '🧑‍💼', 'Santi'], ['jairo', '🛠️', 'Don Jairo'], ['paola', '🔌', 'La ingeniera Paola'], ['cata', '📡', 'Cata'], ['rosalba', '🚇', 'Rosalba']];
      for (const [id, ic, quien] of ARC) { const i = E.arcos[id] | 0; if (i >= 3) continue; add('historia', ic, quien + ' (mentora o mentor): reto ' + (i + 1) + ' de 3', P.x, P.y, { prio: 1, fn: () => RPG.jugarArco(M, id), aqui0: true }); break; }
      const acts = RPG.actividades(M).filter(a => ['copa', 'domicilio', 'palmas', 'metro2d', 'planeador', 'monitoreo911'].includes(a.id)), dia = Math.floor(Date.now() / 864e5);
      if (acts.length) { const a = acts[dia % acts.length]; add('descubrir', a.ic, a.n, P.x, P.y, { prio: 1, fn: () => RPG.lanzarActividad(M, a.id), aqui0: true }); }
    });
    const _mostrar = Hoy.mostrar;
    Hoy.mostrar = function (M) {
      const r = _mostrar.apply(this, arguments), el = $('#hoy21'); if (!el || el.hidden || el.querySelector('.hoyTodo')) return r;
      (this._L || []).forEach((c, i) => { if (c.aqui0) { const s = el.querySelector(`.hoyI[data-i="${i}"] small`); if (s) s.textContent = '▶ aquí'; } });
      const b = document.createElement('button'); b.className = 'hoyI hoyTodo'; b.innerHTML = '<span class="hoyE">🗺️</span><span class="hoyN">Ver todo: Valle Vivo (24 actividades, encargos y habilidades)</span><small>›</small>';
      b.onclick = e => { e.stopPropagation(); this.cerrar(); RPG.abrirHub(M, 'act'); }; el.append(b); return r;
    };
  }
  /* ---------- 4) LA PESTAÑA «MÁS», EN SEIS SECCIONES (3.8 · propuesta de la auditoría A-4 de Gemini, § 3). Medía 3.085 px
     (más de 3,5 pantallas) y once módulos le iban agregando filas donde cabían: «Música» arriba y «Estilo musical» casi al
     final; «Medir» arriba y «Diagnóstico» abajo. Ahora, después de que TODOS los módulos arman la pestaña (se instala al
     terminar de cargar, así queda por fuera de todos), cada fila se lleva a su sección <details> nativa (teclado y lector de
     pantalla sin nada extra). No se quita ni se cambia ninguna opción: los mismos nodos, con sus manejadores. Lo que no
     esté en el mapa (una opción nueva de otra IA) cae en la primera sección, nunca desaparece. «Controles» y «⚙️
     Flexibilidad» abrían la misma ventana: quedan en una sola fila. ---------- */
  const SECC = [
    { id: 'manejo', t: '🎮 Manejo, ritmo y controles', abre: true, sel: ['#mCtrl', '[data-asist]', '[data-pace]', '[data-vel]', '[data-sw="hints"]', '[data-sw="vib"]'] },
    { id: 'viaje', t: '🗺️ Tu viaje, la historia y los amigos', abre: true, sel: ['[data-p77="cine"]'], bot: ['intro', 'diario', 'historia', 'personajes', 'avatar', 'ranking', 'multi', 'apoya', 'howto', 'cred'] },
    { id: 'vista', t: '🎥 Cámaras, vista y gráficos', sel: ['[data-v3m]', '[data-camang]', '[data-zoom]', '[data-gfx]', '[data-vista]'] },
    { id: 'sonido', t: '🔊 Sonido y música', sel: ['[data-sw="sfx"]', '[data-sw="music"]', '[data-mstyle]'] },
    { id: 'lectura', t: '♿ Lectura y accesibilidad', sel: ['[data-tamopt]', '[data-sw="contraste"]', '[data-p77="cb"]'] },
    { id: 'pruebas', t: '🧪 Todo abierto, medir y probar', sel: ['[data-todo]', '[data-medir]', '[data-prueba]'], bot: ['bot'] }
  ];
  const abiertas = {}; SECC.forEach(S => { abiertas[S.id] = !!S.abre; });
  if (!document.getElementById('masSecCss')) {
    const st = document.createElement('style'); st.id = 'masSecCss';
    st.textContent = '#tab-mas details.mas-sec{border-bottom:1px solid var(--az3)}'
      + '#tab-mas details.mas-sec>summary{list-style:none;display:flex;align-items:center;gap:8px;min-height:48px;padding:8px 2px;font-weight:800;font-size:16px;cursor:pointer}'
      + '#tab-mas details.mas-sec>summary::-webkit-details-marker{display:none}'
      + '#tab-mas details.mas-sec>summary small{margin-left:auto;opacity:.7;font-weight:700}'
      + '#tab-mas details.mas-sec>summary:after{content:"▾";font-size:18px;transition:transform .15s}'
      + '#tab-mas details.mas-sec:not([open])>summary:after{transform:rotate(-90deg)}'
      + '#tab-mas details.mas-sec>.col{display:flex;flex-direction:column;gap:10px;margin:6px 0 14px}'
      + '#tab-mas details.mas-sec .opt:last-child{border-bottom:0}'
      + '#tab-mas details.mas-sec[data-sec="viaje"]>.col{display:grid;grid-template-columns:1fr 1fr;gap:8px}#tab-mas details.mas-sec>.col>.opt{grid-column:1/-1}'
      + '#tab-mas details.mas-sec[data-sec="viaje"]>.col>button{min-height:52px;padding:8px 10px;line-height:1.2}'
      + '.opt .sw{flex-shrink:0}.opt:has(.seg.wrap){flex-direction:column;align-items:stretch;gap:8px}.seg button{min-height:40px}'
      + '@media (prefers-reduced-motion:reduce){#tab-mas details.mas-sec>summary:after{transition:none}}';
    document.head.append(st);
  }
  const agrupar = () => {
    const M = document.getElementById('tab-mas'); if (!M || M.querySelector(':scope > details.mas-sec')) return;
    const filas = [...M.querySelectorAll(':scope > .opt')], col = M.querySelector(':scope > .col'), botones = col ? [...col.children] : [];
    if (filas.length < 6) return;   /* otra versión de la pestaña: no se toca */
    const usada = new Set(), cuerpos = {}, ancla = M.querySelector(':scope > .squig') || M.querySelector(':scope > .paper');
    /* Controles y ⚙️ Flexibilidad: una sola fila (las dos abrían UI.controles) */
    const fx = M.querySelector(':scope > .opt [data-act="flex"]'), mc = M.querySelector('#mCtrl');
    if (fx && mc) { const f = fx.closest('.opt'), span = mc.closest('.opt').querySelector('span'); if (span) span.innerHTML = 'Controles y flexibilidad<br><small class="m">Joystick, flechas o inclinar; giro, velocidad, lado y tamaño del joystick</small>'; f.remove(); usada.add(f); }
    for (const S of SECC) {
      const d = document.createElement('details'); d.className = 'mas-sec'; d.dataset.sec = S.id; d.open = abiertas[S.id];
      d.addEventListener('toggle', () => { abiertas[S.id] = d.open; });
      const cuerpo = document.createElement('div'); cuerpo.className = 'col'; let n = 0;
      for (const sel of S.sel) for (const f of filas) if (!usada.has(f) && (f.matches(sel) || f.querySelector(sel))) { usada.add(f); cuerpo.append(f); n++; }
      if (S.bot) for (const k of S.bot) for (const b of botones) if (!usada.has(b) && (b.dataset.act === k || (k === 'diario' && b.dataset.diario))) { usada.add(b); cuerpo.append(b); n++; }
      if (!n) continue;
      const sm = document.createElement('summary'); sm.innerHTML = esc(S.t) + '<small>' + n + '</small>'; d.append(sm, cuerpo); cuerpos[S.id] = cuerpo;
      if (ancla) ancla.before(d); else M.append(d);
    }
    /* lo que no está en el mapa: a la primera sección (abierta), nunca se pierde */
    const primero = cuerpos.manejo || Object.values(cuerpos)[0];
    if (primero) { for (const f of filas) if (!usada.has(f) && f.isConnected) primero.append(f); for (const b of botones) if (!usada.has(b) && b.isConnected) (cuerpos.viaje || primero).append(b); }
    if (col && !col.children.length) col.remove();
  };
  const instalar = () => {
    if (UI._masSecciones) return; UI._masSecciones = true;
    const _mas = UI.renderMas; UI.renderMas = function () { const r = _mas.apply(this, arguments); try { agrupar(); } catch (e) { JE.errors.push('Más en secciones: ' + e.message); } return r; };
    if (document.getElementById('tab-mas') && document.getElementById('tab-mas').children.length) try { agrupar(); } catch (e) { }
  };
  setTimeout(instalar, 0);   /* después de todo el guion: queda por fuera de todos los que arman la pestaña */
  JE.masSecciones = { SECC, agrupar, abrirTodo: () => document.querySelectorAll('#tab-mas details.mas-sec').forEach(d => { d.open = true; abiertas[d.dataset.sec] = true; }) };
  /* ---------- 5) EL VALLE VIVO SE CIERRA DESDE ARRIBA (A-4): «▶ Seguir rodando» quedaba al final de 1.900 px ---------- */
  const _hub2 = RPG.abrirHub;
  RPG.abrirHub = function () {
    const r = _hub2.apply(this, arguments), body = $('#mBody'), cierra = body && body.querySelector('#hClose');
    if (cierra && !body.querySelector('#hCloseTop')) { const b = document.createElement('button'); b.id = 'hCloseTop'; b.className = 'btn sm gh'; b.textContent = '✕ Cerrar'; b.setAttribute('aria-label', 'Cerrar el Valle Vivo y seguir rodando'); b.style.cssText = 'position:sticky;top:0;float:right;z-index:3;margin:0 0 6px 8px;min-height:44px'; b.onclick = () => cierra.click(); body.prepend(b); }
    return r;
  };
  /* ---------- 6) EL ESCALAFÓN, EN SECCIONES (3.8). La pestaña principal medía 6.231 px y los 12 OFICIOS (el corazón del
     juego: la historia del equipo de EnCicla) quedaban al fondo, debajo de 16 tarjetas de juegos de ~200 px cada una. Ahora
     los juegos van arriba en tres secciones plegables que dicen en su título qué traen (sin abrirlas se ve qué hay, en
     menos de una pantalla) y debajo, abiertos, los oficios. Mismos nodos, mismos botones; un juego nuevo que no esté en el mapa cae en «Carreras y acción». ---------- */
  const SECR = [
    { id: 'accion', t: '🏁 Carreras y acción', jg: ['race', 'run3d', 'ciclovia', 'copa', 'freerun', 'domicilio', 'roguelite'] },
    { id: 'pensar', t: '🧠 Juegos para pensar', jg: ['traffix', 'despacho', 'maquinista', 'circuito', 'moravia', 'planeador', 'monitoreo911'] },
    { id: 'paseos', t: '🌄 Paseos tranquilos', jg: ['guatape', 'metro2d', 'palmas'] },
    { id: 'oficios', t: '🚲 Los 12 oficios de EnCicla', abre: true, roles: true }
  ];
  const abiertasR = {}; SECR.forEach(S => { abiertasR[S.id] = !!S.abre; });
  if (!document.getElementById('rutaSecCss')) {
    const st = document.createElement('style'); st.id = 'rutaSecCss';
    st.textContent = '#tab-ruta details.ruta-sec{margin:14px 0 6px;border-top:2px solid var(--az3)}'
      + '#tab-ruta details.ruta-sec>summary{list-style:none;display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center;min-height:52px;padding:10px 2px;cursor:pointer}'
      + '#tab-ruta details.ruta-sec>summary::-webkit-details-marker{display:none}'
      + '#tab-ruta details.ruta-sec>summary b{font-size:18px;font-weight:800}'
      + '#tab-ruta details.ruta-sec>summary small{grid-column:1/2;opacity:.75;font-weight:600;line-height:1.3}'
      + '#tab-ruta details.ruta-sec>summary:after{content:"▾";grid-column:2;grid-row:1/3;font-size:20px;transition:transform .15s}'
      + '#tab-ruta details.ruta-sec:not([open])>summary:after{transform:rotate(-90deg)}'
      + '@media (prefers-reduced-motion:reduce){#tab-ruta details.ruta-sec>summary:after{transition:none}}';
    document.head.append(st);
  }
  const nombreDe = el => { const t = el.querySelector('.t'); return t ? t.textContent.replace(/^[^\p{L}]+/u, '').trim() : ''; };
  const agruparRuta = () => {
    const T = document.getElementById('tab-ruta'); if (!T || T.querySelector(':scope > details.ruta-sec')) return;
    const roles = [...T.querySelectorAll(':scope > .role')], juegos = [...T.querySelectorAll(':scope > .paper.juego, :scope > .paper.race')];
    if (roles.length < 6 || juegos.length < 4) return;   /* otra versión de la pestaña: no se toca */
    const usado = new Set(), cuerpos = {}, ancla = roles[0].previousElementSibling && !roles[0].previousElementSibling.matches('.juego,.race') ? roles[0] : juegos[0];
    const ref = document.createComment('secciones'); ancla.before(ref);
    for (const S of SECR) {
      const cuerpo = document.createElement('div'); let n = 0; const nombres = [];
      if (S.roles) for (const r of roles) { usado.add(r); cuerpo.append(r); n++; }
      if (S.jg) for (const k of S.jg) for (const j of juegos) if (!usado.has(j) && (k === 'race' ? j.classList.contains('race') : j.dataset.jg === k)) { usado.add(j); cuerpo.append(j); n++; nombres.push(nombreDe(j)); }
      if (!n) continue;
      const d = document.createElement('details'); d.className = 'ruta-sec'; d.dataset.sec = S.id; d.open = abiertasR[S.id];
      d.addEventListener('toggle', () => { abiertasR[S.id] = d.open; });
      const sm = document.createElement('summary'); sm.innerHTML = '<b>' + esc(S.t) + ' · ' + n + '</b><small>' + esc(S.roles ? 'Del primer préstamo a supervisar el sistema: cada oficio con sus turnos' : nombres.filter(Boolean).join(' · ')) + '</small>';
      d.append(sm, cuerpo); cuerpos[S.id] = cuerpo; ref.before(d);
    }
    for (const j of juegos) if (!usado.has(j) && j.isConnected && cuerpos.accion) cuerpos.accion.append(j);   /* lo nuevo, nunca se pierde */
    ref.remove();
  };
  const instalarRuta = () => {
    if (UI._rutaSecciones) return; UI._rutaSecciones = true;
    const _ruta = UI.renderRuta; UI.renderRuta = function () { const r = _ruta.apply(this, arguments); try { agruparRuta(); } catch (e) { JE.errors.push('Escalafón en secciones: ' + e.message); } return r; };
    const T = document.getElementById('tab-ruta'); if (T && T.children.length) try { agruparRuta(); } catch (e) { }
  };
  setTimeout(instalarRuta, 0);
  JE.rutaSecciones = { SECR, agrupar: agruparRuta, abrirTodo: () => document.querySelectorAll('#tab-ruta details.ruta-sec').forEach(d => { d.open = true; abiertasR[d.dataset.sec] = true; }) };
})();
