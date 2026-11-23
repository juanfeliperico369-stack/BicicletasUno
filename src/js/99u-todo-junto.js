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
})();
