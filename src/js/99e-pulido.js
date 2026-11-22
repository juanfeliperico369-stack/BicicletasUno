/* =====================================================================
   PULIDO DE LOS MODOS «A MEDIAS» (ronda 3.2, Claude) · lo que marcaron la auditoría (tests/auditoria-modos.js) y las capturas:
   1) RUN 3D: arrancaba sin nada que recoger en los primeros 26 m (0 puntos en 4 s). Ahora sale con una fila de hojas en tu
      carril, como las monedas de salida de los corredores sin fin, y el piloto de pruebas también junta hojas (no solo esquiva).
   2) BODEGA en el celular vertical: el estante quedaba bajo la barra de arriba y medio celular era piso vacío. Ahora el estante
      va bajo el título, la mesa muestra sus cajas, el piso tiene su demarcación, los pasos 1‑2‑3‑4 se ven y la caja que
      revisas sale en grande, con lo que trae adentro y sus golpes: se revisa mirando, no solo leyendo.
   (El aviso de la cámara 3D que tapaba el título de los minijuegos se arregló en 88-camara.js: solo sale en la ciudad).
   ===================================================================== */
(function () {
  /* ---------- 1) Run 3D ---------- */
  if (typeof MGRunner3D !== 'undefined') {
    const _upd = MGRunner3D.prototype.update;
    MGRunner3D.prototype.update = function (dt) {
      if (!this._salida) {   // la fila de salida: 6 hojas en tu carril entre los 4 y los 20 m (las filas del juego empiezan a los 26 m)
        this._salida = 1; for (let k = 0; k < 6; k++) this.items.push({ d: 4 + k * 3.2, lane: this.lane, kind: 'hoja', z: .2, done: false });
      }
      /* las hojas suman en this.p.score; en el modo del menú (ModeSub) ese puntaje se reescribe con el del minijuego en cada
         cuadro y las hojas se perdían (★ 0 con 6 hojas): ahí también van al puntaje del minijuego */
      const P = this.p, s0 = P ? P.score : 0, r = _upd.call(this, dt);
      if (P && typeof ModeSub !== 'undefined' && P instanceof ModeSub && P.score > s0) this.score += P.score - s0;
      if (JE.map && JE.map.barrioAt && this.posMapa) { const q = this.posMapa(); this.barrio = JE.map.barrioAt(q.px, q.py) || 'Medellín'; }   /* el barrio con px del mundo (antes se le pasaban casillas) */
      return r;
    };
    const _bot = MGRunner3D.prototype.bot;
    MGRunner3D.prototype.bot = function (dt) {
      const r = _bot.call(this, dt), malo = it => !it.done && it.kind !== 'hoja' && it.kind !== 'tinto';
      if (this.items.some(it => malo(it) && Math.abs(it.lane - this.lane) < .45 && it.d - this.distM > 1 && it.d - this.distM < 26)) return r;   // primero esquivar
      let h = null; for (const it of this.items) { const rel = it.d - this.distM; if (!it.done && (it.kind === 'hoja' || it.kind === 'tinto') && rel > .5 && rel < 18 && (!h || it.d < h.d)) h = it; }
      if (h && Math.abs(h.lane - this.lane) > .4) {
        const dl = h.lane > this.lane ? 1 : -1, nl = this.lane + dl;
        if (!this.items.some(it => malo(it) && Math.abs(it.lane - nl) < .45 && it.d - this.distM > -1 && it.d - this.distM < 14)) this.moveLane(dl);
      }
      return r;
    };
  }

  /* ---------- 1b) los puntos de los minijuegos de cada fase de un turno ----------
     En ShiftMode (52-oficios.js) el minijuego de una FASE (la recepción de la bodega, por ejemplo) sumaba sus errores pero no
     sus puntos: 42 puntos bien ganados y la ★ en 0. Los minijuegos de las TAREAS sí sumaban (t.pts + s.score). Ahora las fases
     también, y mientras se juega la ★ muestra lo que va. */
  if (typeof ShiftMode !== 'undefined') {
    const _np = ShiftMode.prototype.nextPhase, _rs = ShiftMode.prototype.runSub, _inf = ShiftMode.prototype.info;
    ShiftMode.prototype.nextPhase = function () { const f = this._fase; this._fase = 1; try { return _np.apply(this, arguments); } finally { this._fase = f; } };
    ShiftMode.prototype.runSub = function (mg, cb) {
      if (this._fase && cb) { const fin = cb; this._subFase = mg; cb = s => { if (this._subFase === s) this._subFase = null; if (s && s.score > 0) this.score += Math.round(s.score); return fin(s); }; }
      return _rs.call(this, mg, cb);
    };
    if (_inf) ShiftMode.prototype.info = function () { const r = _inf.apply(this, arguments); if (r && this.sub && this.sub === this._subFase && this.sub.score > 0) r.score = Math.round(this.score + this.sub.score); return r; };
  }

  /* ---------- 2) Bodega en vertical ---------- */
  if (typeof MGBodega2 !== 'undefined') {
    const PASOS_B = [['descargar', 'Descargar'], ['verificar', 'Verificar'], ['organizar', 'Organizar'], ['cargar', 'Cargar']];
    /* una caja de cartón: con cinta, y con su golpe si viene golpeada */
    const caja = (b, x, y, w, h, bx, brillo) => {
      prect(b, x, y, w, h, bx.checked ? (bx.ok ? '#c48a52' : '#7a2a24') : '#d8a868'); prect(b, x, y, w, 2, '#e8c088'); prect(b, x + (w >> 1) - 1, y, 2, h, '#b07a48');
      if (bx.bad === 'golpe') { prect(b, x + 1, y + 3, Math.max(2, w >> 2), Math.max(2, h >> 2), '#5a3a24'); prect(b, x + w - 3, y + h - 4, 2, 3, '#5a3a24'); }
      if (brillo) { prect(b, x - 1, y - 1, w + 2, 1, '#fff'); prect(b, x - 1, y + h, w + 2, 1, '#fff'); prect(b, x - 1, y, 1, h, '#fff'); prect(b, x + w, y, 1, h, '#fff'); }
    };
    const _rB = MGBodega2.prototype.render;
    MGBodega2.prototype.render = function (V) {
      const vw = V.vw, vh = V.vh; if (vh < vw * 1.3) return _rB.call(this, V);   // apaisado: el dibujo de siempre
      const b = V.b, s = V.s, B = this.curBox(), on = (this.t * 4 | 0) % 2, top = Math.round(((V.top || 52) + 30) / s), gy = Math.round(vh * .58);
      this.L = { vw, vh, gy };
      /* pared con columnas y los dos portones enrollables */
      prect(b, 0, 0, vw, gy, '#22314f'); for (let x = 0; x < vw; x += 20) prect(b, x, 0, 10, gy, '#26385c');
      for (const px of [4, vw - 64]) { prect(b, px, gy - 70, 60, 70, '#3a4a66'); for (let y = gy - 68; y < gy; y += 4) prect(b, px + 2, y, 56, 1, '#2c3a52'); prect(b, px, gy - 73, 60, 3, '#e0b030'); }
      /* la estantería, con una bahía por pieza (su color arriba) */
      const n = PARTES.length, x0 = Math.round(vw * .05), W = vw - x0 * 2, bw = Math.floor(W / n), H = 66;
      prect(b, x0 - 2, top - 2, W + 2, H + 4, '#1a2438');
      PARTES.forEach((k, i) => {
        const x = x0 + i * bw, q = Math.min(9, this.shelf[k]), paso = Math.floor((bw - 6) / 3);
        prect(b, x, top, bw - 3, H, '#4a505c'); prect(b, x, top, bw - 3, 3, CATS[k].col);
        for (let r = 0; r < 3; r++) prect(b, x, top + 22 + r * 21, bw - 3, 2, '#2e333d');
        for (let j = 0; j < q; j++) b.drawImage(Art.icon(k), 0, 0, 16, 16, x + 2 + (j % 3) * paso, top + 7 + Math.floor(j / 3) * 21, 13, 13);
        const toca = B && this.step === 'organizar' && B.type === k || this.step === 'cargar' && this.order && this.loaded[k] < (this.order[k] || 0);
        if (toca && on) { prect(b, x - 1, top - 1, bw - 1, 1, '#fff'); prect(b, x - 1, top + H, bw - 1, 1, '#fff'); prect(b, x - 1, top, 1, H, '#fff'); prect(b, x + bw - 3, top, 1, H, '#fff'); }
      });
      /* los dos camiones: el que llega (izquierda) y el del taller (derecha) */
      Art.truckSide(b, 30, gy + 4, this.boxes.filter(x => x.where === 'truck').length, 1);
      Art.truckSide(b, vw - 34, gy + 4, Math.min(10, PARTES.reduce((a, k) => a + this.loaded[k], 0)), -1);
      /* la mesa con sus cajas (dos filas de cuatro) */
      const mx = Math.round(vw * .3), mw = Math.round(vw * .4), en = this.table.filter(x => !x.shelved);
      prect(b, mx, gy - 6, mw, 5, '#8a6a4a'); prect(b, mx + 3, gy - 1, 3, 9, '#6a4a2a'); prect(b, mx + mw - 6, gy - 1, 3, 9, '#6a4a2a');
      en.slice(0, 8).forEach((bx, i) => caja(b, mx + 3 + (i % 4) * Math.floor((mw - 6) / 4), gy - 20 - Math.floor(i / 4) * 13, 12, 12, bx, bx === B && on));
      /* el piso: baldosas y la demarcación amarilla del paso de la transpaleta */
      prect(b, 0, gy, vw, vh - gy, '#3b4250'); for (let y = gy + 16; y < vh; y += 22) prect(b, 0, y, vw, 1, '#343a47'); for (let x = 17; x < vw; x += 34) prect(b, x, gy, 1, vh - gy, '#343a47');
      for (let x = 2; x < vw; x += 12) { prect(b, x, gy + 34, 7, 2, '#e0b030'); prect(b, x + 5, vh - 64, 7, 2, '#e0b030'); }
      /* la caja que estás revisando, en grande en el piso: lo que trae adentro y sus golpes */
      const cy = Math.round((gy + 40 + vh - 70) / 2);
      if (B && (this.step === 'verificar' || this.step === 'organizar')) {
        const w = 70, h = 46, x = Math.round(vw / 2 - w / 2), y = cy - h / 2 + 6;
        prect(b, x + 3, y + h, w, 3, '#2a2f3a');                                   // su sombra en el piso
        prect(b, x, y, w, h, '#d8a868'); prect(b, x, y, w, 4, '#e8c088'); prect(b, x + w / 2 - 2, y, 4, h, '#b07a48');
        prect(b, x - 6, y - 8, w / 2 + 4, 8, '#e3b47c'); prect(b, x + w / 2 + 2, y - 8, w / 2 + 4, 8, '#e3b47c');   // las solapas abiertas
        for (let j = 0; j < Math.min(6, B.q); j++) b.drawImage(Art.icon(B.type), 0, 0, 16, 16, x + 4 + (j % 3) * 21, y + 6 + Math.floor(j / 3) * 18, 14, 14);
        prect(b, x + w - 32, y + h - 16, 30, 12, '#fff'); b.drawImage(Art.icon(B.type), 0, 0, 16, 16, x + w - 31, y + h - 15, 10, 10);   // la etiqueta (el número lo pone hud)
        if (B.bad === 'golpe') { prect(b, x + 2, y + 10, 14, 9, '#5a3a24'); prect(b, x + 6, y + 19, 6, 6, '#6a4a30'); prect(b, x + w - 8, y + 2, 8, 6, '#3b4250'); }
        this._grande = { x: x + w - 32, y: y + h - 16 };
      } else this._grande = null;
      /* en el primer paso: la transpaleta espera junto al camión */
      if (this.step === 'descargar') { const x = 66, y = gy + 46; prect(b, x, y + 8, 34, 4, '#c0392b'); prect(b, x + 30, y - 10, 3, 20, '#555'); prect(b, x + 27, y - 12, 9, 3, '#333'); prect(b, x + 2, y + 12, 4, 4, '#222'); prect(b, x + 26, y + 12, 4, 4, '#222'); }
    };
    const _hB = MGBodega2.prototype.hud;
    MGBodega2.prototype.hud = function (V) {
      const L = this.L, alto = L && L.vh >= L.vw * 1.3;
      if (alto) for (const p of this.pops) if (!p.bajo) { p.bajo = 1; p.x = L.vw / 2; p.y = L.gy - 34; }   // los avisos (+5, ✗) bajo el estante: antes tapaban el título
      _hB.call(this, V); if (!alto) return; const s = V.s, B = this.curBox();
      /* los cuatro pasos, con el que va en verde */
      const y = (L.gy + 26) * s, i0 = PASOS_B.findIndex(p => p[0] === this.step), w = (V.w - 24) / 4;
      PASOS_B.forEach((p, i) => V.text((i < i0 ? '✓ ' : (i + 1) + ' · ') + p[1], 12 + w * i + w / 2, y, { size: 12.5, align: 'center', color: i === i0 ? PAL.vd1 : i < i0 ? '#9fb0c8' : '#6f7f99', body: true }));
      if (B && this._grande) V.text('× ' + B.label, (this._grande.x + 12) * s, (this._grande.y + 10) * s, { size: 13, color: PAL.az, body: true });
    };
  }
})();
