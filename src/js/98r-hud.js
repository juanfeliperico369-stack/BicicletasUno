/* =====================================================================
   HUD LIMPIO (v2.1) · «que nada tape el centro» (MC.UI.verificar de Motor City) y la lectura limpia de los juegos
   cenitales que admira el autor. Antes, en el modo libre salían hasta 8 botones redondos de 68 px apilados a la
   derecha (Timbre, Bajarse, Paseo, Trama, Taller, Renovar, Devolver, Foto…): media pantalla tapada y todo bajo el
   mismo pulgar del joystick.
   Ahora la barra es SEGÚN EL CONTEXTO:
   - abajo, junto al pulgar, la acción que sirve AHORA (Devolver en la estación, Foto en un lugar, Subirse junto a la
     bici, Sentarse en la plaza, Levantarse, Manejar en el paseo, Saltar en la panorámica), resaltada y con un pulso
     cuando aparece;
   - encima, el Timbre;
   - y «⋯ Más», que abre una bandeja con lo demás (Paseo, Trama, Taller, Bajarse, Vehículo…) y se cierra sola.
   Con 3 acciones o menos (los oficios) salen todas. Medidas en la rejilla de 8 px; el área segura del celular se respeta.
   Las acciones siguen saliendo de M.actions() (las pruebas y los demás módulos no cambian).
   ===================================================================== */
const HUD21 = JE.hud = {
  CTX: ['up', 'paseoOff', 'on', 'dock', 'renovar', 'foto', 'sit', 'jump'],
  abierta: false, _nuevos: new Map(),
  orden(acts) {
    const ctx = acts.filter(a => this.CTX.includes(a.id)).sort((a, b) => this.CTX.indexOf(a.id) - this.CTX.indexOf(b.id));
    const bell = acts.find(a => a.id === 'bell'), resto = acts.filter(a => !ctx.includes(a) && a !== bell);
    if (acts.length <= 3) return { ver: [...resto, ...(bell ? [bell] : []), ...ctx.slice().reverse()], mas: [] };   // pocas: todas (la de contexto, abajo)
    const ver = [], mas = [];
    if (bell) ver.push(bell);
    if (ctx[0]) ver.push(ctx[0]); else if (!bell && resto[0]) ver.push(resto.shift());
    for (const a of ctx.slice(1)) mas.push(a); for (const a of resto) mas.push(a);
    return { ver, mas };
  },
  boton(x, i, cls) { return `<button class="abtn ${cls}${x.label.length > 8 ? ' l9' : x.label.length > 6 ? ' l7' : ''}" data-i="${i}" aria-label="${esc(x.label)}"><img class="px" src="${Art.iconURL(x.icon, 2)}" alt="">${esc(x.label)}</button>`; },
  pintar(acts, M) {
    const bar = $('#actBar'); if (!bar) return; const { ver, mas } = this.orden(acts), idx = x => acts.indexOf(x), ahora = performance.now();
    for (const [k, t] of this._nuevos) if (ahora - t > 1600) this._nuevos.delete(k);
    const previos = new Set(this._ultimos || []); this._ultimos = acts.map(a => a.id);
    let h = mas.length ? `<button class="abtn mas" id="bMas" aria-label="Más acciones" aria-expanded="${this.abierta}">⋯<small>Más</small></button>` : '';
    for (const x of ver) { const ctx = this.CTX.includes(x.id); if (ctx && !previos.has(x.id) && previos.size) this._nuevos.set(x.id, ahora); h += this.boton(x, idx(x), (ctx ? 'ctx' : '') + (this._nuevos.has(x.id) ? ' nuevo' : '')); }
    bar.innerHTML = h; bar.classList.toggle('dock', true);
    $$('.abtn[data-i]', bar).forEach(b => b.onclick = () => { const x = (M.actions())[+b.dataset.i]; this.cerrar(); if (x) x.fn(); });
    const bm = $('#bMas'); if (bm) bm.onclick = () => { Snd.sfx('tap'); this.abierta ? this.cerrar() : this.abrir(M); };
    this.mas = mas; if (this.abierta) { if (mas.length) this.abrir(M, true); else this.cerrar(); }
    Game.layout(true);
  },
  abrir(M, repinta) {
    let t = $('#actMas'); if (!t) { t = document.createElement('div'); t.id = 'actMas'; t.setAttribute('role', 'menu'); $('#sGame').appendChild(t); }
    const acts = M.actions(); t.innerHTML = this.mas.map(x => `<button role="menuitem" data-i="${acts.findIndex(a => a.id === x.id)}"><img class="px" src="${Art.iconURL(x.icon, 2)}" alt="">${esc(x.label)}</button>`).join('');
    $$('button', t).forEach(b => b.onclick = () => { const x = (M.actions())[+b.dataset.i]; this.cerrar(); Snd.sfx('tap'); if (x) x.fn(); });
    const bm = $('#bMas'); if (bm) { const r = bm.getBoundingClientRect(); t.style.right = Math.round(innerWidth - r.left + 8) + 'px'; t.style.bottom = Math.max(8, Math.round(innerHeight - r.bottom)) + 'px'; bm.setAttribute('aria-expanded', 'true'); bm.classList.add('on'); }
    t.hidden = false; this.abierta = true; if (!repinta) this.tCierre = 6;
  },
  cerrar() { const t = $('#actMas'); if (t) t.hidden = true; this.abierta = false; const bm = $('#bMas'); if (bm) { bm.setAttribute('aria-expanded', 'false'); bm.classList.remove('on'); } },
  tick(dt) { if (this.abierta && (this.tCierre -= dt) <= 0) this.cerrar(); }
};
(function () {
  Game.barra = function (acts, M) { HUD21.pintar(acts, M); };
  /* la bandeja se cierra sola a los 6 s, al pausar, al terminar y al tocar el mapa */
  const _dom = Game.dom; Game.dom = function (dt) {
    _dom.call(this, dt); HUD21.tick(dt || 0);
    /* en el modo libre (sin metas en pantalla) el consejo va arriba a la izquierda, bajo el HUD: el centro y lo que hay
       delante de la bici quedan libres */
    const M = this.mode, libre = !!(M && M.free && M.ride && !M.sub); document.body.classList.toggle('libre21', libre);
    if (libre) { const hb = (View.hudB || 50) + 8 + 'px'; if (HUD21._hb !== hb) { HUD21._hb = hb; document.documentElement.style.setProperty('--hudB', hb); } }
  };
  for (const k of ['pause', 'stop', 'finish', 'start']) { const f = Game[k]; Game[k] = function () { HUD21.cerrar(); if (k !== 'pause') document.body.classList.remove('libre21'); return f.apply(this, arguments); }; }
  addEventListener('pointerdown', e => { if (HUD21.abierta && !e.target.closest('#actMas,#bMas')) HUD21.cerrar(); }, true);
})();
