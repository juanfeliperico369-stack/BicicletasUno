/* =====================================================================
   FLUIDEZ Y CONTROLES (ronda 3.0, Claude) · el autor: «hay modos donde todo está roto y es injugable: los vehículos no se
   mueven, van muy lento, los controles son engorrosos». Lo que midió tests/auditoria-modos.js (CPU 4× lenta, como un celular
   modesto): la bici a 14 cuadros por segundo con picos de 165 ms, y como cada paso se topaba en 50 ms, el juego perdía el
   30 % del tiempo real: todo en cámara lenta y a tirones. Aquí:
   1) SUBPASOS: el tiempo del juego sigue al real, en pasos de 50 ms como mucho (máx. 7), como los
      subpasos de 25 ms de Motor City 4.6 (hasta 0,35 s por cuadro). A 15 o a 60 cuadros por segundo la bici recorre lo mismo.
   2) TROZOS POR ADELANTADO: la ciudad que viene (hacia donde vas, 1,5 s adelante) se dibuja cuando el procesador está libre
      (requestIdleCallback; en iOS, un setTimeout), no en el cuadro en que hace falta.
   3) ⏫ ACELERADOR FIJO (pedido del autor en Motor City 4.6.1): con el botón prendido la bici (o lo que manejes) va a fondo y el
      joystick solo gira; al apagarlo frena suave hasta parar. Botón ⏫ a la izquierda (o tecla Q).
   4) TODO LIBERADO desde el principio: oficios, turnos y lo de la tienda (Más → «🔓 Todo liberado», prendido de entrada).
   5) La CARRERA DE LA CICLORRUTA arrancaba a 20 km/h y tardaba 1,3 km en llegar a su punta: ahora 34 km/h y 65 km/h a 700 m.
   ===================================================================== */
const Fluidez = JE.fluidez = {
  PASO: .05, MAXPASOS: 7, TOPE: .35,   /* pasos de 50 ms (los de siempre): solo se agregan cuando el cuadro pasa de 50 ms (sin espiral de pasos) */
  /* ---- 2) trozos por adelantado ---- */
  previo(R) {
    if (!R || !R.p || JE.headless || this._pend || GFX() !== '3d') return; const M = JE.map; if (!M || !M.hasG || !M.chunkG) return;
    /* andando: el trozo hacia donde vas (1,5 s adelante); quieto o al arrancar: los 8 vecinos, el más cercano primero. Uno a la vez y
       solo con tiempo libre de verdad (con poco tiempo libre, espera al siguiente) */
    const P = R.p, S = CH * TS, faltan = [], ok = (cx, cy) => cx >= 0 && cy >= 0 && cx * CH < MW && cy * CH < MH && !M.hasG(cx, cy);
    if (P.v > R.stats_().max * .3) { const k = 1.5, cx = Math.floor((P.x + Math.cos(P.a) * P.v * k) / S), cy = Math.floor((P.y + Math.sin(P.a) * P.v * k) / S); if (ok(cx, cy)) faltan.push([cx, cy]); }
    else { const c0 = Math.floor(P.x / S), r0 = Math.floor(P.y / S), L = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (ok(c0 + dx, r0 + dy)) L.push([dist((c0 + dx + .5) * S, (r0 + dy + .5) * S, P.x, P.y), c0 + dx, r0 + dy]); L.sort((a, b) => a[0] - b[0]); if (L.length) faltan.push([L[0][1], L[0][2]]); }
    if (!faltan.length) return; this._pend = true; const hacer = () => { this._pend = false; try { const [cx, cy] = faltan[0]; if (!M.hasG(cx, cy)) M.chunkG(cx, cy); this.hechos = (this.hechos | 0) + 1; } catch (e) { JE.errors.push('previo: ' + e.message); } };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(d => { if (d.timeRemaining() > 8 || d.didTimeout) hacer(); else this._pend = false; }, { timeout: 1500 }); else setTimeout(hacer, 250);
  }
};
const Crucero = JE.crucero = {
  on: false,
  poner(v) { this.on = !!v; const b = $('#bCrucero'); if (b) { b.classList.toggle('on', this.on); b.setAttribute('aria-pressed', String(this.on)); } if (JE.ui && !JE.headless) JE.ui.toast(this.on ? '⏫ Acelerador fijo: vas a fondo y el joystick solo gira' : '⏫ Acelerador suelto: frenas hasta parar'); },
  /* la entrada del jugador con el acelerador fijo: a fondo hacia donde apunta el joystick, o derecho si no lo toca */
  dir(R, d) {
    if (!this.on || !R || !R.p || R.p.veh === 'walk' && false) return d; const P = R.p;
    if (d && d.m > .08) return { x: d.x, y: d.y, m: 1 };
    return { x: Math.cos(P.a), y: Math.sin(P.a), m: 1 };
  }
};
(function () {
  /* ---- 1) el bucle con subpasos (mismo orden que 60-ui.js; Calidad.cuadro de 88-camara.js sigue envolviéndolo) ---- */
  Game.loop = (function (cal) {
    return function (t) {
      if (!this.mode) return; if (cal) try { Calidad.cuadro(t); } catch (e) { }
      let real = Math.max(0, (t - this.last) / 1000); this.last = t; if (real > Fluidez.TOPE) real = .05;   // volver de otra pestaña: un paso normal, no un salto
      try {
        if (!this.paused) { const n = Math.min(Fluidez.MAXPASOS, Math.max(1, Math.ceil(real / Fluidez.PASO))), h = real / n; for (let i = 0; i < n && this.mode && !this.mode.done; i++) this.mode.update(h); if (this.mode) Snd.setMood(this.moodOf(this.mode)); Fluidez.pasos = n; }
        if (this.mode) { this.draw(); this.dom(real); }
      } catch (e) { JE.errors.push('loop: ' + e.message); console.error(e); }
      if (!this.mode) return; if (this.mode.done) return this.finish();
      this.raf = requestAnimationFrame(t2 => this.loop(t2));
    };
  })(typeof Calidad !== 'undefined' && Calidad.cuadro);
  /* ---- 3) el acelerador fijo en la entrada del recorrido (lo usa quien juega, no el bot) ---- */
  const _upd = MapMode.prototype.update;
  MapMode.prototype.update = function (dt) {
    const R = this.ride; if (Crucero.on && R && !this.botDir && !this.sub && !(typeof panoOn === 'function' && panoOn(R)) && !JE.headless) {
      const d = R.girarDir(Input.dir()); this.botDir = Crucero.dir(R, d); try { return _upd.call(this, dt); } finally { this.botDir = null; }
    }
    return _upd.call(this, dt);
  };
  /* el asistente de 98q-manejo no ve al bot en botDir cuando es el acelerador: lo marca como humano */
  if (typeof Manejo !== 'undefined') { const _h = Manejo.humano; Manejo.humano = function (R) { if (Crucero.on && R && R.mode && !JE.headless && !Input.botDir) return !(typeof panoOn === 'function' && panoOn(R)); return _h.call(this, R); }; }
  /* el botón ⏫ va arriba en la barra de la izquierda (pulgar izquierdo: acelerar; pulgar derecho: girar) */
  const _tick = Cam.tick;
  Cam.tick = function (R, dt) {
    const r = _tick.apply(this, arguments); const bar = $('#camBar');
    if (bar && !bar.querySelector('#bCrucero')) { const b = document.createElement('button'); b.id = 'bCrucero'; b.setAttribute('aria-label', 'Acelerador fijo'); b.setAttribute('aria-pressed', 'false'); b.textContent = '⏫'; b.onclick = e => { e.stopPropagation(); Snd.sfx('tap'); Crucero.poner(!Crucero.on); }; bar.append(b); }   /* al final: los de siempre se ubican por posición */
    Fluidez.previo(R); return r;
  };
  const _key = Game.key; Game.key = function (e) { if (e.code === 'KeyQ' && this.mode && this.mode.ride && !this.mode.sub) { Crucero.poner(!Crucero.on); return; } return _key.call(this, e); };
  for (const k of ['stop', 'finish']) { const f = Game[k]; Game[k] = function () { if (Crucero.on) { Crucero.on = false; const b = $('#bCrucero'); if (b) b.classList.remove('on'); } return f.apply(this, arguments); }; }
  /* ---- 4) todo liberado (para probarlo todo antes de pulir la trama) ---- */
  const libre = () => !(Save.data && Save.data.settings && Save.data.settings.todo === false);
  Object.defineProperty(JE, 'debugUnlock', { configurable: true, get: libre, set() { } });
  const _mas = UI.renderMas;
  UI.renderMas = function () {
    _mas.call(this); const v = $('#tab-mas [data-tamopt]'); if (!v || $('#tab-mas [data-todo]')) return; const S = Save.data.settings, d = document.createElement('div'); d.className = 'opt';
    d.innerHTML = `<span>🔓 Todo liberado<br><small class="m">Oficios, turnos, juegos y la tienda abiertos desde el principio</small></span><button class="sw ${libre() ? 'on' : ''}" data-todo="1" aria-label="Todo liberado"></button>`;
    v.before(d); d.querySelector('[data-todo]').onclick = e => { S.todo = !libre(); Save.save(); Snd.sfx('tap'); e.currentTarget.classList.toggle('on', libre()); this.renderRuta && this.renderRuta(); };
  };
  /* ---- 5) la carrera de la ciclorruta, a ritmo de carrera ---- */
  if (typeof CarreraCiclovia !== 'undefined') CarreraCiclovia.prototype.rapidez = function () { return Math.min(18, 9.5 + this.metros / 80); };
})();
