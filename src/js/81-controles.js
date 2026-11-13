/* =====================================================================
   CONTROLES: tipo (joystick fijo, arrastrar en cualquier parte, flechas o inclinar el celular),
   lado de la pantalla y tamaño. Se cambian en la pausa o en Más > Controles.
   ===================================================================== */
const cssPx = v => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(v)) || 0;
/* inclinar el celular: el sensor de orientación da la dirección; la posición al empezar es la neutra */
const Tilt = JE.tilt = {
  on: false, ok: false, x: 0, y: 0, y0: null,
  start() {
    if (this.on) return; this.on = true;
    window.addEventListener('deviceorientation', e => {
      if (e.beta == null || e.gamma == null) return; this.ok = true; const o = screen.orientation ? screen.orientation.angle : (window.orientation || 0);
      let x = e.gamma, y = e.beta; if (o === 90) { x = e.beta; y = -e.gamma; } else if (o === 270 || o === -90) { x = -e.beta; y = e.gamma; }
      this.x = x; this.y = y; if (this.y0 == null) this.y0 = y;
    });
  },
  ask() {
    const D = window.DeviceOrientationEvent; if (!D) return Promise.resolve(false);
    if (typeof D.requestPermission === 'function') return D.requestPermission().then(r => { if (r === 'granted') this.start(); return r === 'granted'; }).catch(() => false);
    this.start(); return Promise.resolve(true);
  },
  calib() { this.y0 = this.ok ? this.y : null; },
  dir() { if (!this.ok) return null; const dx = clamp(this.x / 22, -1, 1), dy = clamp((this.y - (this.y0 == null ? this.y : this.y0)) / 22, -1, 1), l = Math.hypot(dx, dy); if (l < .18) return { x: 0, y: 0, m: 0 }; return { x: dx / l, y: dy / l, m: clamp((l - .18) / .6, .25, 1) }; }
};
const _dir81 = Input.dir;
Input.dir = function () { const d = _dir81.call(this); if (this.botDir || d.m) return d; if (Ctrl.kind() === 'inclinar') { const t = Tilt.dir(); if (t) return t; } return d; };
Object.assign(Ctrl, {
  side() { return (Save.data && Save.data.settings.cside) || 'der'; },
  size() { const v = Save.data && Save.data.settings.csize; return [.8, 1, 1.25][v == null ? 1 : v]; },
  pad() { return ['fijo', 'flechas'].includes(this.kind()); },            // ¿hay un control dibujado en pantalla?
  anchor() { const k = this.size(), m = 40 + 46 * k; return { x: this.side() === 'izq' ? m + cssPx('--sal') : View.w - m - cssPx('--sar'), y: View.h - 74 - 46 * k }; },
  arrows() { const a = this.anchor(), s = 52 * this.size(); return [['ArrowUp', a.x, a.y - s, '▲'], ['ArrowDown', a.x, a.y + s, '▼'], ['ArrowLeft', a.x - s, a.y, '◀'], ['ArrowRight', a.x + s, a.y, '▶']]; },
  down(e, cx, cy, cv) {
    const k = this.kind(), z = this.size();
    if (k === 'flechas') { for (const [key, x, y] of this.arrows()) if (Math.abs(cx - x) < 28 * z && Math.abs(cy - y) < 28 * z) { Input.keys[key] = true; (this.held || (this.held = {}))[e.pointerId] = key; return true; } return false; }
    const fx = this.anchor(), a = k === 'fijo' && dist(cx, cy, fx.x, fx.y) <= 110 * z ? fx : { x: cx, y: cy };   // también se puede arrastrar en cualquier parte
    Input.joy = { on: true, id: e.pointerId, ox: a.x, oy: a.y, x: cx, y: cy }; try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    return true;
  },
  draw(V) {
    const k = this.kind(), c = V.ctx, z = this.size();
    if (k === 'flechas') { for (const [key, x, y, l] of this.arrows()) { c.globalAlpha = .75; c.fillStyle = Input.keys[key] ? PAL.vd : '#0a2342'; c.beginPath(); c.arc(x, y, 25 * z, 0, TAU); c.fill(); c.globalAlpha = 1; c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); V.text(l, x, y + 7 * z, { size: 20 * z, align: 'center', color: '#fff' }); } return; }
    if (k === 'fijo' && !Input.joy.on) { const a = this.anchor(); c.globalAlpha = .55; c.fillStyle = '#0a2342'; c.beginPath(); c.arc(a.x, a.y, 50 * z, 0, TAU); c.fill(); c.globalAlpha = .8; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(a.x, a.y, 48 * z, 0, TAU); c.stroke(); c.fillStyle = PAL.vd; c.beginPath(); c.arc(a.x, a.y, 20 * z, 0, TAU); c.fill(); c.globalAlpha = 1; }
    if (k === 'inclinar' && !Input.joy.on) {   // nivel de burbuja: muestra hacia dónde estás inclinando
      const a = this.anchor(), r = 34, d = Tilt.dir() || { x: 0, y: 0, m: 0 }; c.globalAlpha = .6; c.fillStyle = '#0a2342'; c.beginPath(); c.arc(a.x, a.y, r, 0, TAU); c.fill(); c.globalAlpha = .9; c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      c.fillStyle = Tilt.ok ? PAL.vd : PAL.amb; c.beginPath(); c.arc(a.x + d.x * d.m * (r - 10), a.y + d.y * d.m * (r - 10), 9, 0, TAU); c.fill(); c.globalAlpha = 1; if (!Tilt.ok) V.text('Sin sensor', a.x, a.y + r + 14, { size: 11, align: 'center', color: '#fff', body: true });
    }
  }
});
/* las tareas de abajo a la izquierda se corren si el control está a la izquierda */
Ctrl.leftGap = () => Ctrl.pad() && Ctrl.side() === 'izq' ? 40 + 92 * Ctrl.size() + 12 : 0;
const _start81 = Game.start;
Game.start = function () { Tilt.y0 = null; if (Ctrl.kind() === 'inclinar') Tilt.start(); return _start81.apply(this, arguments); };

/* ---------- panel de controles ---------- */
const CTRL_TXT = { fijo: 'El joystick se queda en su sitio. También puedes arrastrar el dedo en cualquier parte.', flotante: 'Pon el dedo donde quieras y arrástralo hacia donde quieres ir.', flechas: 'Cuatro botones grandes: ideal para niños y abuelos.', inclinar: 'Inclina el celular hacia donde quieres ir. Al empezar, la posición en que lo tienes es la neutra.' };
UI.controles = function (inGame) {
  const S = Save.data.settings, k = Ctrl.kind(), seg = (key, cur, opts) => `<div class="seg wrap">${opts.map(([v, n]) => `<button data-c="${key}" data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  this.modal(`<h2>Controles</h2><p class="pag">Cómo te mueves</p>${seg('ctrl', k, [['fijo', '🕹️ Joystick fijo'], ['flotante', '👆 Arrastrar'], ['flechas', '⬆️ Flechas'], ['inclinar', '📱 Inclinar']])}
    <p class="m" style="font-size:13px;margin:6px 0 10px">${CTRL_TXT[k]}</p>
    ${Ctrl.pad() || k === 'inclinar' ? `<p class="pag">Lado</p>${seg('cside', Ctrl.side(), [['izq', '◀ Izquierda'], ['der', 'Derecha ▶']])}` : ''}
    ${Ctrl.pad() ? `<p class="pag">Tamaño</p>${seg('csize', S.csize == null ? 1 : S.csize, [[0, 'Pequeño'], [1, 'Normal'], [2, 'Grande']])}` : ''}
    ${k === 'inclinar' ? '<div class="col" style="margin:8px 0"><button class="btn sm" id="cCal">🎯 Recalibrar</button></div>' : ''}
    <p class="pag">Vibración</p>${seg('vib', S.vib ? 1 : 0, [[1, 'Sí'], [0, 'No']])}
    <p class="m" style="font-size:12.5px;margin-top:10px">En computador: flechas o WASD para moverte y espacio para el timbre.</p>
    <div class="col"><button class="btn pri" id="mClose">${inGame ? '▶ Volver al juego' : 'Listo'}</button></div>`, () => {
    $$('[data-c]').forEach(b => b.onclick = async () => {
      const key = b.dataset.c, v = b.dataset.v;
      if (key === 'ctrl' && v === 'inclinar') { const ok = await Tilt.ask(); if (!ok) { Snd.sfx('bad'); return this.toast('Este celular no deja usar el sensor de movimiento'); } Tilt.y0 = null; }
      S[key] = key === 'csize' ? +v : key === 'vib' ? v === '1' : v; Save.save(); Snd.sfx('tap'); this.controles(inGame);
    });
    const cal = $('#cCal'); if (cal) cal.onclick = () => { Tilt.calib(); Snd.sfx('ok'); this.toast('Listo: esta es tu posición neutra'); };
    if (inGame) $('#mClose').onclick = () => { this.closeModal(); Game.resume(); };
  });
};
const _pause81 = Game.pause;
Game.pause = function () { _pause81.call(this); const go = $('#pGo'); if (!go || !this.mode || !this.mode.ride) return; const b = document.createElement('button'); b.className = 'btn'; b.id = 'pCtrl'; b.textContent = '🎮 Controles'; go.after(b); b.onclick = () => UI.controles(true); };
const _mas81 = UI.renderMas;
UI.renderMas = function () {
  _mas81.call(this); const c = $('#tab-mas [data-ctrl]'); if (!c) return; const row = c.closest('.opt');
  row.innerHTML = '<span>Controles<br><small class="m">Joystick, flechas o inclinar el celular</small></span><button class="btn sm" id="mCtrl">🎮 Ajustar</button>';
  $('#mCtrl').onclick = () => this.controles(false);
};
