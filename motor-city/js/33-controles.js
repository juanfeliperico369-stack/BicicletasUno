/* =====================================================================
   CONTROLES · teclado, pantalla táctil (joystick virtual y gestos) y control de juegos (gamepad)
   Entrega cada cuadro una entrada única: { stick:{x,y,m}, acel, giro, salto, turbo, correr, sube, baja, accion }
   y avisa los gestos de cámara (pellizco = zoom, giro con dos dedos = girar, dos dedos arriba/abajo = inclinar,
   un dedo en la mitad derecha = mirar alrededor). Los botones de la interfaz llaman controles.boton(id, true|false).
   ===================================================================== */
class Controles {
  constructor(el, op = {}) {
    this.el = el; this.teclas = new Set(); this.botones = new Set(); this.pulsos = new Set(); this.stick = { x: 0, y: 0, m: 0, activo: false, ox: 0, oy: 0, px: 0, py: 0, id: null }; this.dedos = new Map(); this.gesto = null; this.op = op;
    this.alGesto = op.alGesto || (() => {}); this.alTecla = op.alTecla || (() => {});
    if (typeof window === 'undefined' || !el) return;
    const kd = e => { if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; this.teclas.add(e.code); if (!e.repeat) { this.pulsos.add(e.code); this.alTecla(e.code, e); } if (/Arrow|Space/.test(e.code)) e.preventDefault(); };
    const ku = e => this.teclas.delete(e.code);
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', () => { this.teclas.clear(); this.botones.clear(); });
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', e => this._abajo(e)); el.addEventListener('pointermove', e => this._mueve(e));
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(t, e => this._arriba(e));
    el.addEventListener('wheel', e => { e.preventDefault(); this.alGesto({ tipo: 'zoom', k: Math.exp(-e.deltaY * .0015) }); }, { passive: false });
  }
  _abajo(e) {
    const r = this.el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; this.dedos.set(e.pointerId, { x, y, x0: x, y0: y });
    try { this.el.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ }
    if (this.dedos.size === 2) { this._gesto0(); if (this.stick.id !== null) this._soltarStick(); return; }
    if (x < r.width * .55 && this.stick.id === null && !this.op.sinStick) Object.assign(this.stick, { id: e.pointerId, ox: x, oy: y, px: x, py: y, activo: true });
    else this.gesto = { tipo: 'mirar', x, y };
  }
  _mueve(e) {
    const d = this.dedos.get(e.pointerId); if (!d) return; const r = this.el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, ddx = x - d.x, ddy = y - d.y; d.x = x; d.y = y;
    if (this.dedos.size >= 2 && this.gesto && this.gesto.tipo === 'dos') { this._gesto(); return; }
    if (e.pointerId === this.stick.id) { const R = 52, dx = x - this.stick.ox, dy = y - this.stick.oy, L = Math.hypot(dx, dy); if (L > R) { this.stick.ox += dx * (1 - R / L); this.stick.oy += dy * (1 - R / L); } this.stick.px = x; this.stick.py = y; const ex = (x - this.stick.ox) / R, ey = (y - this.stick.oy) / R; this.stick.x = ex; this.stick.y = ey; this.stick.m = Math.min(1, Math.hypot(ex, ey)); return; }
    if (this.gesto && this.gesto.tipo === 'mirar') this.alGesto({ tipo: 'mirar', dx: ddx, dy: ddy });
  }
  _arriba(e) { if (!this.dedos.has(e.pointerId)) return; const d = this.dedos.get(e.pointerId); this.dedos.delete(e.pointerId); if (e.pointerId === this.stick.id) this._soltarStick(); if (this.dedos.size < 2 && this.gesto && this.gesto.tipo === 'dos') this.gesto = null; if (!this.dedos.size) { if (this.gesto && this.gesto.tipo === 'mirar' && Math.hypot(d.x - d.x0, d.y - d.y0) < 8) this.alGesto({ tipo: 'toque', x: d.x, y: d.y }); this.gesto = null; } }
  _soltarStick() { Object.assign(this.stick, { id: null, activo: false, x: 0, y: 0, m: 0 }); }
  _par() { const [a, b] = [...this.dedos.values()]; return { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, d: Math.hypot(b.x - a.x, b.y - a.y), ang: Math.atan2(b.y - a.y, b.x - a.x) }; }
  _gesto0() { this.gesto = Object.assign({ tipo: 'dos' }, this._par()); }
  _gesto() { const p = this._par(), g = this.gesto; this.alGesto({ tipo: 'zoom', k: p.d / (g.d || p.d) }); this.alGesto({ tipo: 'girar', da: angDif(g.ang, p.ang) }); this.alGesto({ tipo: 'inclinar', dy: p.cy - g.cy }); Object.assign(g, p); }
  boton(id, on) { if (on) { this.botones.add(id); this.pulsos.add('btn:' + id); } else this.botones.delete(id); }
  /* la entrada de este cuadro (los pulsos se gastan al leerla) */
  leer() {
    const T = this.teclas, B = this.botones, k = c => T.has(c), pad = this._pad();
    let ax = (k('ArrowRight') || k('KeyD') ? 1 : 0) - (k('ArrowLeft') || k('KeyA') ? 1 : 0), ay = (k('ArrowDown') || k('KeyS') ? 1 : 0) - (k('ArrowUp') || k('KeyW') ? 1 : 0);
    let sx = this.stick.x, sy = this.stick.y, sm = this.stick.m;
    if (pad && Math.hypot(pad.x, pad.y) > .15) { sx = pad.x; sy = pad.y; sm = Math.min(1, Math.hypot(pad.x, pad.y)); }
    if (ax || ay) { const L = Math.hypot(ax, ay); sx = ax / L; sy = ay / L; sm = 1; }
    const p = this.pulsos, pulso = c => p.has(c);
    const E = {
      stick: { x: sx, y: sy, m: sm }, teclado: !!(ax || ay),
      acel: clamp(-ay || (pad ? pad.rt - pad.lt : 0) || (B.has('acel') ? 1 : 0) - (B.has('freno') ? 1 : 0), -1, 1), giro: ax || (pad ? pad.x : 0),
      salto: pulso('Space') || pulso('btn:salto') || (pad && pad.a), turbo: k('ShiftLeft') || k('ShiftRight') || B.has('turbo') || (pad && pad.rb), correr: k('ShiftLeft') || k('ShiftRight') || B.has('correr') || B.has('turbo') || (pad && pad.rb),   /* 4.3: en el celular, ⚡ a pie es correr (auditoría G-H26) */
      sube: k('Space') || B.has('sube'), baja: k('ControlLeft') || k('KeyZ') || B.has('baja'), accion: pulso('KeyE') || pulso('Enter') || pulso('btn:accion'), pulsos: new Set(p)
    };
    p.clear(); return E;
  }
  _pad() { if (typeof navigator === 'undefined' || !navigator.getGamepads) return null; for (const g of navigator.getGamepads()) if (g && g.connected) { const b = i => g.buttons[i] && g.buttons[i].pressed, v = i => g.buttons[i] ? g.buttons[i].value : 0; const a = b(0); if (a && !this._a) this.pulsos.add('btn:salto'); this._a = a; return { x: g.axes[0] || 0, y: g.axes[1] || 0, a: false, rt: v(7), lt: v(6), rb: b(5) }; } return null; }
}
MC.Controles = Controles;
