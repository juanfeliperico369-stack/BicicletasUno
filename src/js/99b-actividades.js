/* =====================================================================
   LOS MÓDULOS DENTRO DEL MUNDO ABIERTO (ronda 3.0, Claude) · regla del autor: «todo módulo de juego debe estar presente en el
   mundo abierto y, cuando se desee jugar allí, debe ser la misma experiencia que en el módulo cerrado».
   - Cada oficio tiene su LUGAR REAL en el valle: en cualquier estación EnCicla se atiende (Anfitrión), se repara el tótem
     (Técnico), se limpia (Limpieza) y se apoya la zona (Apoyo); en Casa EnCicla (la bodega) están Bodega, Mecánico, Balance,
     Monitoreo, Supervisor, Rescate y Pausas activas.
   - Al detenerte allí aparece «🏆 Oficios aquí» (la acción del momento en la barra). Eliges oficio y turno y se juega EL MISMO
     MÓDULO del menú (la misma clase, las mismas metas y estrellas). Al terminar, «🚲 Volver al valle» te deja donde estabas, con
     tu vehículo y a la misma hora.
   - Todo liberado (99a): los 3 turnos de cada oficio se pueden jugar desde el principio.
   ===================================================================== */
const Actividades = JE.actividades = {
  ESTACION: ['anfitrion', 'tecnico', 'limpieza', 'apoyo'],
  BODEGA: ['bodega', 'mecanico', 'balance', 'monitoreo', 'supervisor', 'rescate', 'pausas'],
  existe(id) { return !!(ROLE[id] && MODE_CLASS[id]); },
  /* ¿dónde estás? una estación EnCicla o Casa EnCicla a menos de 20 m, y quieto o despacio */
  lugar(M) {
    const R = M && M.ride; if (!R || !M.free || M.sub || M.net) return null; const P = R.p; if (P.v > R.stats_().max * .25) return null;
    const dp = JE.map.depot; if (dp && dist(dp.x, dp.y, P.x, P.y) < 34 * PXM) return { k: 'bodega', name: dp.name || 'Casa EnCicla', ids: this.BODEGA.filter(id => this.existe(id)) };
    let best = null, bd = 20 * PXM; for (const s of JE.map.stations) { const d = dist(s.x, s.y, P.x, P.y); if (d < bd) { bd = d; best = s; } }
    return best ? { k: 'estacion', name: best.name, ids: this.ESTACION.filter(id => this.existe(id)) } : null;
  },
  abrir(M, L) {
    const filas = L.ids.map(id => { const r = ROLE[id], n = Math.max(1, nShifts(id)); return `<div class="opt" style="padding:8px 10px"><span><b>${esc(r.name)}</b><br><small class="m">${esc(r.desc || '')}</small></span><div class="seg">${Array.from({ length: n }, (_, i) => `<button data-of="${id}" data-t="${i + 1}">T${i + 1}</button>`).join('')}</div></div>`; }).join('');
    Game.paused = true; UI.modal(`<h2>🏆 Oficios en ${esc(L.name)}</h2><p class="m" style="margin:4px 0 10px">El mismo juego del menú, aquí. Al terminar vuelves al valle donde estabas.</p><div class="col" style="gap:8px;max-height:52vh;overflow:auto">${filas}</div><div class="col" style="margin-top:10px"><button class="btn gh" id="ofSeguir">▶ Seguir rodando</button></div>`, () => {
      $('#ofSeguir').onclick = () => { UI.closeModal(); Game.resume(); };
      $$('[data-of]').forEach(b => b.onclick = () => { Snd.sfx('tap'); UI.closeModal(); this.jugar(M, b.dataset.of, +b.dataset.t); });
    });
  },
  /* se guarda el valle como estaba y se arranca el oficio con su clase de siempre */
  jugar(M, id, t) {
    const R = M.ride, P = R.p, volver = { x: P.x, y: P.y, a: P.a, veh: P.veh, ebike: !!(M.ebike || R.ebike), clock: M.clock, own: !!M.ownBike, seed: (M.opt && M.opt.seed) || 1 };
    Game.paused = false; Game.stop(); Game.start(id, t, { seed: (Date.now() ^ 0x5bd1e995) >>> 0, nov: NOVEDADES[0] }); if (Game.meta) Game.meta.volver = volver; this.jugados = (this.jugados | 0) + 1;
  },
  volver(v) {
    Game.start('usuario', 1, { free: true, seed: v.seed, nov: NOVEDADES[0], bici: v.own ? 'propia' : 'encicla' }); const M = Game.mode, R = M && M.ride; if (!R) return;
    R.p.x = v.x; R.p.y = v.y; R.p.a = v.a; R.cam.x = v.x; R.cam.y = v.y; if (v.veh && v.veh !== 'bike' && VEHICULOS[v.veh]) R.setVeh(v.veh); if (v.ebike) { M.ebike = R.ebike = 1; } if (v.clock) M.clock = v.clock;
  }
};
(function () {
  /* la acción del momento en el modo libre: «🏆 Oficios aquí» (va en la barra según el contexto, 98r-hud.js) */
  const _act = ModeUsuarioR.prototype.actions;
  ModeUsuarioR.prototype.actions = function () {
    const a = _act.call(this); if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
    const L = Actividades.lugar(this); if (L && L.ids.length) a.push({ id: 'oficios', icon: 'estrella', label: 'Oficios aquí', fn: () => Actividades.abrir(this, L) });
    return a;
  };
  if (typeof HUD21 !== 'undefined' && !HUD21.CTX.includes('oficios')) HUD21.CTX.splice(4, 0, 'oficios');   // contextual: detrás de Devolver y Renovar
  if (typeof ICO21 !== 'undefined') ICO21.oficios = 'M8 4h8v4a4 4 0 0 1-8 0z M8 5H5a3 3 0 0 0 3 4 M16 5h3a3 3 0 0 1-3 4 M12 12v4 M8 20h8 M9 16h6v4H9z';
  /* el resultado del oficio jugado en el valle ofrece volver allí */
  const _res = UI.result;
  UI.result = function (res, meta, prog) {
    const r = _res.apply(this, arguments); const v = meta && meta.volver; if (!v) return r;
    const col = $('#resBody .col') || $('#resBody'); if (col && !$('#bVolverValle')) { const b = document.createElement('button'); b.className = 'btn pri'; b.id = 'bVolverValle'; b.textContent = '🚲 Volver al valle'; col.prepend(b); b.onclick = () => { Snd.sfx('tap'); Actividades.volver(v); }; }
    return r;
  };
  /* si se sale del oficio con la pausa, también se vuelve al valle */
  const _stop = Game.stop;
  Game.stop = function () { const v = this.meta && this.meta.volver, fin = this._fin; const r = _stop.apply(this, arguments); if (v && !fin && !Actividades._volviendo && this._salir) { Actividades._volviendo = true; setTimeout(() => { Actividades._volviendo = false; Actividades.volver(v); }, 0); } this._salir = false; return r; };
  const _pause = Game.pause;
  Game.pause = function () { _pause.call(this); const v = this.meta && this.meta.volver, e = $('#pEnd'); if (v && e && !this.meta.free) { e.textContent = '🚲 Salir al valle'; const f = e.onclick; e.onclick = () => { UI.closeModal(); this._salir = true; this.stop(); }; } };
})();
