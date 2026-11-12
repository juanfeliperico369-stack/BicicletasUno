/* =====================================================================
   MINIJUEGOS DE LA OPERACIÓN REAL (v0.7)
   Conteo (inventario) · Tulas (armar / cargar celulares) · Bodega (recibir, verificar, organizar, cargar)
   · Ensamble de bicis · Atención al cliente (llamadas). Lógica separada del dibujo; el bot usa las acciones.
   ===================================================================== */

/* ---------- INVENTARIO RÁPIDO: cuenta las bicis de la estación ---------- */
class MGConteo extends MG {
  constructor(parent, o) {
    super(parent, o); const n = o.docks || 8; this.docks = []; for (let i = 0; i < n; i++) this.docks.push(this.rng.f() < .55);
    this.n = this.docks.filter(Boolean).length; const a = new Set([this.n]); while (a.size < 3) a.add(Math.max(0, this.n + this.rng.i(-2, 2))); this.opts = this.rng.shuffle([...a]);
    this.min = o.clock0 || 600; this.coach = 'Inventario: cuenta las bicis ancladas y toca el número.';
  }
  update(dt) { this.tick(dt); if (this.endT != null && (this.endT -= dt) <= 0) this.done = true; }
  answer(v) { if (this.endT != null) return; if (v === this.n) { this.good(6, 100, 40, '+6 ¡Inventario exacto!'); this.endT = .5; } else this.bad('Cuenta otra vez', 100, 40); }
  render(V) {
    const b = V.b, { gy } = this.bgStation(V, this.min), n = this.docks.length, r0 = 30, sp = Math.min(20, (V.vw - r0 - 10) / n); this.L = { gy };
    prect(b, r0 - 6, gy - 46, n * sp + 12, 5, PAL.vd); prect(b, r0 - 4, gy - 28, n * sp + 8, 30, '#eef2f5');
    this.docks.forEach((d, i) => { const x = Math.round(r0 + i * sp + sp / 2); prect(b, x - 1, gy - 12, 3, 12, '#59606c'); prect(b, x - 2, gy - 15, 5, 3, PAL.vd); if (d) Art.bikeFront(b, x + 4, gy, 'ok'); });
  }
  hud(V) {
    this.btns = []; V.text(this.o.title || 'INVENTARIO DE LA ESTACIÓN', V.w / 2, 70, { size: 20, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    const bw = Math.min(110, (V.w - 40) / 3); this.opts.forEach((v, i) => this.button(V, V.w / 2 - (bw * 3 + 20) / 2 + i * (bw + 10), V.h - 100, bw, 64, String(v), () => this.answer(v), { size: 30, key: 'n' + v }));
    this.drawPops(V);
  }
  hint() { return this.errors ? (this.rects || {})['n' + this.n] || null : null; }
  bot(err) { this.answer(this.rng.f() < err ? this.rng.pick(this.opts) : this.n); }
}

/* ---------- TULAS: a las 4 a. m. se arman (llaves + celular cargado); a las 10:30 p. m. se recogen y se cargan ---------- */
const TULA_COL = ['#ff6b5a', '#56c7ff', '#ffc93c', '#b07cff', '#ff8fc7', '#9bd341'];
class MGTulas extends MG {
  constructor(parent, o) {
    super(parent, o); this.mode = o.mode || 'armar'; const names = o.names || ['Estación 1', 'Estación 2', 'Estación 3'];
    this.tulas = names.slice(0, 6).map((name, i) => ({ name, col: TULA_COL[i], key: this.mode === 'cargar', cel: this.mode === 'cargar', done: false }));
    this.keys = this.rng.shuffle(this.tulas.map((t, i) => ({ col: t.col, i, used: this.mode === 'cargar' })));
    this.cels = this.rng.shuffle(this.tulas.map(() => ({ bat: this.rng.i(85, 100), used: false })).concat([{ bat: this.rng.i(8, 35), used: false }, { bat: this.rng.i(5, 30), used: false }]));
    this.slots = this.tulas.map(() => null); this.cur = 0; this.min = o.clock0 || 240;
    this.coach = this.mode === 'armar' ? 'Arma la tula marcada: toca su LLAVE del mismo color y un CELULAR con batería llena.' : 'Recoge cada tula: toca la tula y luego un cargador libre para poner el celular a cargar.';
  }
  update(dt) { this.tick(dt); if (this.endT != null && (this.endT -= dt) <= 0) this.done = true; }
  key(i) {
    if (this.mode !== 'armar' || this.endT != null) return; const k = this.keys[i], t = this.tulas[this.cur]; if (!k || k.used || !t || t.key) return;
    if (k.col !== t.col) return this.bad('Esa llave es de otra estación', 100, 60);
    k.used = true; t.key = true; Snd.sfx('coin'); this.check();
  }
  cel(i) {
    if (this.mode !== 'armar' || this.endT != null) return; const c = this.cels[i], t = this.tulas[this.cur]; if (!c || c.used || !t || t.cel) return;
    if (c.bat < 60) return this.bad('Ese celular está descargado', 100, 60);
    c.used = true; t.cel = true; Snd.sfx('coin'); this.check();
  }
  check() { const t = this.tulas[this.cur]; if (t.key && t.cel) { t.done = true; this.good(8, 100, 40, '+8 Tula lista'); this.cur++; if (this.cur >= this.tulas.length) this.endT = .6; } }
  plug(j) {   // modo cargar: la tula elegida va al cargador j
    if (this.mode !== 'cargar' || this.endT != null) return; const t = this.tulas[this.cur]; if (!t) return;
    if (this.slots[j]) return this.bad('Ese cargador ya está ocupado', 100, 60);
    this.slots[j] = t; t.done = true; this.good(6, 100, 40, '+6 Cargando'); this.cur++; if (this.cur >= this.tulas.length) this.endT = .6;
  }
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh; prect(b, 0, 0, vw, vh, '#2b3a55'); prect(b, 0, vh * .55, vw, vh, '#c9b38a'); for (let x = 0; x < vw; x += 16) prect(b, x, vh * .55, 1, vh, '#b39d74');
    const n = this.tulas.length, tw = Math.min(30, (vw - 20) / n); this.L = { tw, n, vw, vh };
    this.tulas.forEach((t, i) => { const x = 10 + i * tw + tw / 2, y = vh * .3; prect(b, x - 8, y - 6, 16, 16, t.done ? '#3d6b3a' : '#4a3a2a'); prect(b, x - 8, y - 6, 16, 3, t.col); prect(b, x - 3, y - 10, 6, 4, '#2b2f38'); if (i === this.cur && (this.t * 4 | 0) % 2) pring(b, x, y + 2, 11, '#fff'); if (t.key) prect(b, x - 5, y + 2, 4, 2, '#ffd84a'); if (t.cel) prect(b, x + 1, y, 3, 6, '#1d2c44'); });
    if (this.mode === 'cargar') this.slots.forEach((s, j) => { const x = 14 + j * 22, y = vh * .72; prect(b, x, y, 16, 10, '#59606c'); prect(b, x + 6, y - 4, 4, 4, s ? PAL.vd : '#9aa7b8'); if (s) prect(b, x + 4, y - 14, 8, 12, '#1d2c44'); });
  }
  hud(V) {
    this.btns = []; const L = this.L; if (!L) return; const s = V.s;
    V.text(this.mode === 'armar' ? 'ARMAR TULAS · Casa EnCicla' : 'RECOGER TULAS · cargar celulares', V.w / 2, 66, { size: 18, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    this.tulas.forEach((t, i) => V.text(t.name.split(' ').slice(-2).join(' '), (10 + i * L.tw + L.tw / 2) * s, L.vh * .3 * s + 30, { size: 10, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 2 }));
    if (this.mode === 'armar') {
      const n = this.keys.length, bw = Math.min(64, (V.w - 20) / Math.max(n, 4) - 6); let y = V.h - 170;
      this.keys.forEach((k, i) => { if (!k.used) this.button(V, 10 + i * (bw + 6), y, bw, 52, '🔑', () => this.key(i), { bg: k.col, size: 22, key: 'k' + i }); });
      y = V.h - 100; const m = this.cels.length, cw = Math.min(64, (V.w - 20) / m - 6);
      this.cels.forEach((c, i) => { if (!c.used) this.button(V, 10 + i * (cw + 6), y, cw, 60, '📱' + c.bat + '%', () => this.cel(i), { bg: c.bat < 60 ? '#7a2a24' : PAL.az1, size: 13, key: 'c' + i }); });
    } else {
      const n = this.slots.length, bw = Math.min(90, (V.w - 20) / n - 6);
      this.slots.forEach((sl, j) => { if (!sl) this.button(V, 10 + j * (bw + 6), V.h - 100, bw, 60, '🔌 ' + (j + 1), () => this.plug(j), { bg: PAL.vd2, size: 16, key: 'p' + j }); });
    }
    this.drawPops(V);
  }
  hint() { const R = this.rects || {}, t = this.tulas[this.cur]; if (!t || this.tulas.filter(x => x.done).length >= 1) return null; if (this.mode === 'cargar') return R['p' + this.slots.findIndex(x => !x)] || null; if (!t.key) return R['k' + this.keys.findIndex(k => !k.used && k.col === t.col)] || null; return R['c' + this.cels.findIndex(c => !c.used && c.bat >= 60)] || null; }
  bot(err) {
    const t = this.tulas[this.cur]; if (!t || this.endT != null) return; const r = this.rng.f() < err;
    if (this.mode === 'cargar') return this.plug(this.slots.findIndex(x => !x));
    if (!t.key) return this.key(r ? this.rng.i(0, this.keys.length - 1) : this.keys.findIndex(k => !k.used && k.col === t.col));
    this.cel(r ? this.rng.i(0, this.cels.length - 1) : this.cels.findIndex(c => !c.used && c.bat >= 60));
  }
}

/* ---------- BODEGA: descargar, verificar, organizar y cargar el pedido del taller ---------- */
const PARTES = ['llanta', 'cadena', 'sillin', 'luz'];
class MGBodega2 extends MG {
  constructor(parent, o) {
    super(parent, o); const R = this.rng, n = o.boxes || 7; this.step = 'descargar'; this.min = o.clock0 || 480;
    this.boxes = []; for (let i = 0; i < n; i++) { const type = R.pick(PARTES), q = R.i(2, 6), bad = R.f() < .28 ? R.pick(['golpe', 'cant']) : null; this.boxes.push({ type, q, label: bad === 'cant' ? q + R.pick([-1, 1, 2]) : q, bad, where: 'truck' }); }
    this.table = []; this.shelf = { llanta: 0, cadena: 0, sillin: 0, luz: 0 }; this.ok = 0; this.rejOk = 0;
    this.order = null; this.loaded = { llanta: 0, cadena: 0, sillin: 0, luz: 0 };
    this.coach = 'Descarga: toca las cajas del camión para bajarlas a la mesa.';
  }
  update(dt) {
    this.tick(dt);
    const cur = this.table[0];
    if (this.step === 'descargar' && !this.boxes.some(b => b.where === 'truck')) { this.step = 'verificar'; Snd.sfx('ok'); }
    if (this.step === 'verificar' && !this.table.some(b => !b.checked)) { this.step = 'organizar'; }
    if (this.step === 'organizar' && !this.table.some(b => b.checked && b.ok && !b.shelved)) this.makeOrder();
    if (this.endT != null && (this.endT -= dt) <= 0) this.done = true;
    this.coach = { descargar: 'Descarga: toca las cajas del camión para bajarlas a la mesa.', verificar: 'Verifica cada caja: ¿la etiqueta coincide con lo que trae y no está golpeada? ACEPTA o RECHAZA.', organizar: 'Organiza: toca el ESTANTE de la pieza que muestra la caja.', cargar: 'Carga el camión del taller con el pedido EXACTO y toca LISTO.' }[this.step] || '';
    void cur;
  }
  unload(i) { const bx = this.boxes[i]; if (this.step !== 'descargar' || !bx || bx.where !== 'truck') return; bx.where = 'table'; this.table.push(bx); Snd.sfx('tap'); this.score += 1; }
  curBox() { return this.step === 'verificar' ? this.table.find(b => !b.checked) : this.step === 'organizar' ? this.table.find(b => b.checked && b.ok && !b.shelved) : null; }
  verify(accept) {
    const b = this.curBox(); if (this.step !== 'verificar' || !b) return; const fine = !b.bad; b.checked = true; b.ok = accept;
    if (accept === fine) { this.ok++; if (!accept) this.rejOk++; this.good(5, 100, 50, accept ? '+5 Correcto' : '+5 ¡Bien rechazada!'); } else this.bad(fine ? 'Estaba bien' : (b.bad === 'golpe' ? 'Venía golpeada' : 'La cantidad no coincide'), 100, 50);
  }
  store(type) {
    const b = this.curBox(); if (this.step !== 'organizar' || !b) return;
    if (b.type !== type) return this.bad('Ese no es su estante', 100, 50);
    b.shelved = true; this.shelf[type] += b.q; this.good(3, 100, 50, '+3');
  }
  makeOrder() {
    if (this.order) return; this.step = 'cargar'; const o = {}; let tot = 0;
    for (const k of PARTES) if (this.shelf[k] > 0 && tot < 7) { o[k] = Math.min(this.shelf[k], this.rng.i(1, 3)); tot += o[k]; }
    this.order = o; if (!tot) { this.pedidoOk = true; this.endT = .4; }
  }
  load(type) { if (this.step !== 'cargar') return; if (this.shelf[type] <= 0) return this.bad('No quedan en el estante', 100, 50); this.shelf[type]--; this.loaded[type]++; Snd.sfx('tap'); }
  unloadOne(type) { if (this.step !== 'cargar' || this.loaded[type] <= 0) return; this.loaded[type]--; this.shelf[type]++; }
  ready() {
    if (this.step !== 'cargar' || !this.order || this.endT != null) return; const exact = PARTES.every(k => (this.order[k] || 0) === this.loaded[k]);
    if (!exact) return this.bad('El pedido no está completo o sobra algo', 100, 50);
    this.pedidoOk = true; this.good(20, 100, 40, '+20 ¡Pedido listo!'); this.endT = .7;
  }
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh, gy = Math.round(vh * .5); this.L = { vw, vh, gy };
    prect(b, 0, 0, vw, vh, '#22314f'); prect(b, 0, gy, vw, vh, '#3b4250'); for (let x = 0; x < vw; x += 20) prect(b, x, 0, 10, gy, '#26385c');
    // camión que llega (izquierda) y camión del taller (derecha)
    Art.truckSide(b, 30, gy + 4, this.boxes.filter(x => x.where === 'truck').length, 1);
    Art.truckSide(b, vw - 34, gy + 4, Math.min(10, PARTES.reduce((a, k) => a + this.loaded[k], 0)), -1);
    // mesa con cajas
    prect(b, vw * .32, gy - 4, vw * .36, 4, '#8a6a4a');
    this.table.slice(0, 7).forEach((bx, i) => { const x = Math.round(vw * .34 + i * 10), y = gy - 14; prect(b, x, y, 9, 10, bx.checked ? (bx.ok ? '#c48a52' : '#7a2a24') : '#d8a868'); if (bx.bad === 'golpe') prect(b, x + 2, y + 3, 3, 2, '#5a3a24'); if (bx === this.curBox() && (this.t * 4 | 0) % 2) pring(b, x + 4, y + 5, 8, '#fff'); });
    // estantes
    PARTES.forEach((k, i) => { const x = Math.round(vw * .3 + i * vw * .1), y = 10; prect(b, x, y, vw * .09, 26, '#4a505c'); for (let j = 0; j < Math.min(6, this.shelf[k]); j++) b.drawImage(Art.icon(k), 0, 0, 16, 16, x + 2 + (j % 3) * 5, y + 2 + (j / 3 | 0) * 11, 8, 8); });
  }
  hud(V) {
    this.btns = []; const L = this.L; if (!L) return; const s = V.s, B = this.curBox();
    V.text({ descargar: '1 · DESCARGAR', verificar: '2 · VERIFICAR', organizar: '3 · ORGANIZAR', cargar: '4 · CARGAR EL PEDIDO' }[this.step] || '', V.w / 2, 66, { size: 18, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    if (this.step === 'descargar') { const left = this.boxes.map((x, i) => x.where === 'truck' ? i : -1).filter(i => i >= 0); left.slice(0, 6).forEach((i, k) => this.button(V, 10 + k * 56, V.h - 96, 50, 60, '📦', () => this.unload(i), { size: 26, key: 'b' + k })); }
    if (this.step === 'verificar' && B) {
      const w = Math.min(380, V.w - 20), { x, y } = this.card(V, w, 140, 'CAJA ' + (this.table.indexOf(B) + 1) + ' DE ' + this.table.length);
      V.text('Etiqueta: ' + B.label + ' × ' + CATS[B.type].name, x + 12, y + 46, { size: 16, color: PAL.az }); V.text('Contenido: ' + B.q + ' × ' + CATS[B.type].name + (B.bad === 'golpe' ? ' · CAJA GOLPEADA' : ''), x + 12, y + 70, { size: 15, color: B.bad === 'golpe' ? '#c0392b' : PAL.az2 });
      const bw = (w - 36) / 2; this.button(V, x + 12, y + 88, bw, 42, '✓ ACEPTAR', () => this.verify(true), { bg: PAL.vd2, key: 'si' }); this.button(V, x + 24 + bw, y + 88, bw, 42, '✗ RECHAZAR', () => this.verify(false), { bg: '#7a2a24', key: 'no' });
    }
    if (this.step === 'organizar' || this.step === 'cargar') {
      const n = PARTES.length, bw = Math.min(110, (V.w - 10 * (n + 1)) / n), y = V.h - 90;
      PARTES.forEach((k, i) => this.button(V, 10 + i * (bw + 10), y, bw, 70, CATS[k].name + (this.step === 'cargar' ? ' · ' + this.shelf[k] : ''), () => this.step === 'organizar' ? this.store(k) : this.load(k), { icon: k, border: CATS[k].col, color: CATS[k].col, key: 's_' + k }));
      if (this.step === 'organizar' && B) V.text('Caja: ' + B.q + ' × ' + CATS[B.type].name, V.w / 2, V.h - 104, { size: 16, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 4 });
    }
    if (this.step === 'cargar' && this.order) {
      const txt = 'Pedido del taller: ' + PARTES.filter(k => this.order[k]).map(k => this.order[k] + ' ' + CATS[k].name.toLowerCase() + ' (' + this.loaded[k] + ')').join(' · ');
      V.text(txt, V.w / 2, V.h - 130, { size: 13, align: 'center', color: '#fff', bg: '#0a2342dd', pad: 4, body: true });
      this.button(V, V.w / 2 - 70, 84, 140, 48, '✓ LISTO', () => this.ready(), { bg: PAL.vd2, key: 'ok' });
      PARTES.forEach((k, i) => { if (this.loaded[k] > (this.order[k] || 0)) this.button(V, 10 + i * 70, 140, 62, 34, '− ' + CATS[k].name.slice(0, 5), () => this.unloadOne(k), { size: 12, bg: '#7a2a24', key: 'u_' + k }); });
    }
    this.drawPops(V); void s;
  }
  hint() {
    const R = this.rects || {}, B = this.curBox(); if (this.errors > 2 || this.score > 60) return null;
    if (this.step === 'descargar') return R.b0 || null; if (this.step === 'verificar' && B) return R[B.bad ? 'no' : 'si'] || null;
    if (this.step === 'organizar' && B) return R['s_' + B.type] || null;
    if (this.step === 'cargar' && this.order) { const k = PARTES.find(k => this.loaded[k] < (this.order[k] || 0)); return k ? R['s_' + k] : R.ok || null; }
    return null;
  }
  bot(err) {
    const r = this.rng.f() < err, B = this.curBox();
    if (this.step === 'descargar') return this.unload(this.boxes.findIndex(x => x.where === 'truck'));
    if (this.step === 'verificar' && B) return this.verify(r ? !!B.bad : !B.bad);
    if (this.step === 'organizar' && B) return this.store(r ? this.rng.pick(PARTES) : B.type);
    if (this.step === 'cargar' && this.order) { const extra = PARTES.find(k => this.loaded[k] > (this.order[k] || 0)); if (extra) return this.unloadOne(extra); const k = PARTES.find(k => this.loaded[k] < (this.order[k] || 0)); return k ? this.load(k) : this.ready(); }
  }
}

/* ---------- MECÁNICO · ENSAMBLE: arma bicis nuevas con las piezas que llegan de bodega ---------- */
const PASOS = [['marco', 'Marco', 'bodega'], ['ruedas', 'Ruedas', 'llanta'], ['manubrio', 'Manubrio', 'mecanico'], ['cadena', 'Cadena', 'cadena'], ['sillin', 'Sillín', 'sillin'], ['frenos', 'Frenos', 'llave'], ['luz', 'Luces', 'luz']];
class MGEnsamble extends MG {
  constructor(parent, o) {
    super(parent, o); this.dur = o.dur || 110; this.min = o.clock0 || 480; this.built = 0; this.perfect = 0; this.k = 0; this.err = 0; this.gauge = null; this.order = this.rng.shuffle(PASOS.map(p => p[0]));
    this.coach = 'Sigue el manual: toca la pieza del paso que sigue. Las tuercas se aprietan en la zona verde.';
  }
  update(dt) {
    this.tick(dt); this.min += dt * 4;
    if (this.gauge) { this.gauge.ph += dt * 3.6; this.gauge.v = .5 + .5 * Math.sin(this.gauge.ph); }
    if (this.t >= this.dur) this.done = true;
  }
  part(id) {
    if (this.gauge) return; const need = PASOS[this.k][0];
    if (id !== need) { this.err++; return this.bad('Ese no es el paso ' + (this.k + 1), 100, 50); }
    if (id === 'ruedas' || id === 'frenos') { this.gauge = { ph: 0, v: 0 }; return; }
    this.step();
  }
  tighten() { const g = this.gauge; if (!g) return; if (g.v > .6 && g.v < .82) { this.gauge = null; this.step(); } else { this.err++; this.pop(g.v < .6 ? 'Floja' : '¡Muy apretada!', 100, 40, PAL.amb); } }
  step() {
    this.k++; this.score += 3; Snd.sfx('coin');
    if (this.k >= PASOS.length) { this.built++; if (!this.err) this.perfect++; this.good(20 + (this.err ? 0 : 10), 100, 30, this.err ? '+20 ¡Bici armada!' : '+30 ¡Perfecta!'); this.k = 0; this.err = 0; }
  }
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh, gy = Math.round(vh * .66), cx = Math.round(vw / 2), r = clamp(Math.floor(Math.min(vw * .1, vh * .16)), 9, 22); this.L = { gy, cx };
    prect(b, 0, 0, vw, vh, '#1d2c44'); for (let y = 0; y < vh; y += 16) prect(b, 0, y, vw, 1, '#22345a'); prect(b, 0, gy + 1, vw, 4, '#59606c'); prect(b, 0, gy + 5, vw, vh, '#2b3a55');
    prect(b, cx - 2, gy - r * 2 - 6, 4, r * 2 + 8, '#9aa7b8');   // soporte de ensamble
    const k = this.k, s = r / 4, col = PAL.vd;
    if (k >= 1) { pline(b, cx - 7 * s, gy - r, cx, gy - r, col); pline(b, cx, gy - r, cx + 3 * s, gy - 9 * s, col); pline(b, cx - 6 * s, gy - 9 * s, cx + 3 * s, gy - 9 * s, col); pline(b, cx - 7 * s, gy - r, cx - 6 * s, gy - 9 * s, col); pline(b, cx - 6 * s, gy - 9 * s, cx + 7 * s, gy - r, col); }
    if (k >= 2) { pring(b, cx - 7 * s, gy - r, r, '#151a22'); pring(b, cx + 7 * s, gy - r, r, '#151a22'); }
    if (k >= 3) { pline(b, cx + 3 * s, gy - 9 * s, cx + 4 * s, gy - 12 * s, '#2b2f38'); prect(b, cx + 2 * s, gy - 12 * s, 3 * s, 1, '#2b2f38'); }
    if (k >= 4) pline(b, cx - 7 * s, gy - r + 1, cx, gy - r + 1, '#f08a4b');
    if (k >= 5) prect(b, cx - 8 * s, gy - 10 * s, 3 * s, 1, '#1d2c44');
    if (k >= 6) { prect(b, cx + 4 * s, gy - 11 * s, 2, 2, '#ff6b5a'); }
    if (k >= 7 || (this.built && k === 0 && this.t % 1 < .3)) prect(b, cx + 8 * s, gy - 10 * s, 2, 2, '#ffe066');
    if (this.gauge) { const gx = vw / 2, gyy = 44; prect(b, gx - 40, gyy - 4, 80, 8, '#0a2342'); prect(b, gx - 40 + 80 * .6, gyy - 4, 80 * .22, 8, PAL.vd2); prect(b, Math.round(gx - 40 + 80 * this.gauge.v), gyy - 7, 2, 14, '#fff'); }
  }
  hud(V) {
    this.btns = []; V.text('ENSAMBLE · bicis armadas: ' + this.built, 12, 66, { size: 16, color: PAL.vd1 });
    V.text('Manual · paso ' + (this.k + 1) + ' de ' + PASOS.length + ': ' + PASOS[this.k][1], 12, 88, { size: 14, color: '#fff', bg: '#0a2342cc', pad: 3, body: true });
    const n = PASOS.length, pad = 5, bw = Math.min(96, (V.w - pad * (n + 1)) / n), bh = Math.min(72, Math.max(56, V.h * .1)), y = V.h - bh - 12, x0 = (V.w - (bw * n + pad * (n - 1))) / 2; this.coachB = bh + (this.gauge ? 96 : 26);
    this.order.forEach((id, i) => { const p = PASOS.find(q => q[0] === id); this.button(V, x0 + i * (bw + pad), y, bw, bh, p[1], () => this.part(id), { icon: p[2], key: 'p_' + id }); });
    if (this.gauge) this.button(V, V.w / 2 - 80, y - 74, 160, 58, 'APRETAR', () => this.tighten(), { bg: PAL.vd2, size: 22, key: 'ya' });
    this.drawPops(V);
  }
  hint() { const R = this.rects || {}; if (this.built >= 1) return null; return this.gauge ? (R.ya ? Object.assign({ txt: 'En verde' }, R.ya) : null) : R['p_' + PASOS[this.k][0]] || null; }
  tap() { if (this.gauge) { this.tighten(); return true; } return false; }
  bot(err) { if (this.gauge) { if (this.gauge.v > .64 && this.gauge.v < .78) this.tighten(); return; } this.part(this.rng.f() < err ? this.rng.pick(PASOS)[0] : PASOS[this.k][0]); }
}

/* ---------- MONITOREO · ATENCIÓN AL CLIENTE: llamadas de usuarios ---------- */
const CASOS = [
  { k: 'sancion', q: 'Me aparece una sanción y no sé por qué.', info: 'Último préstamo: 74 min (máximo 60).', ops: ['Explicar la sanción por entrega tarde', 'Quitar la sanción', 'Inscribirlo de nuevo'], ok: 0 },
  { k: 'sancion', q: 'Devolví a tiempo y me sancionaron.', info: 'Préstamo: 48 min. La estación estuvo sin conexión y registró tarde.', ops: ['Revisar el registro y levantar la sanción', 'Decirle que espere 30 días', 'Explicar la sanción por entrega tarde'], ok: 0 },
  { k: 'prestamo', q: 'La estación no me suelta la bici.', info: 'Tarjeta: activa · Estación: sin conexión.', ops: ['Reportar a Técnico y sugerir la estación más cercana', 'Pedirle que jale más fuerte', 'Bloquear la tarjeta'], ok: 0 },
  { k: 'prestamo', q: 'No me deja prestar ninguna bici.', info: 'Tarjeta: registro vencido.', ops: ['Explicar cómo renovar el registro', 'Reportar daño en la estación', 'Prestarle con otra tarjeta'], ok: 0 },
  { k: 'prestamo', q: 'Me dicen que tengo una bici prestada y ya la devolví.', info: 'Préstamo abierto en la estación Floresta. Monitoreo ve la bici anclada.', ops: ['Cerrar el préstamo con novedad y avisar a la estación', 'Cobrarle la bici', 'Decirle que vuelva mañana'], ok: 0 },
  { k: 'inscripcion', q: 'Quiero inscribirme a EnCicla.', info: 'Documento: cédula ✓ · Foto ✓ · Datos de contacto ✓', ops: ['Inscribir y explicar cómo usar el sistema', 'Pedir un documento que falta', 'Decirle que vaya al metro'], ok: 0 },
  { k: 'inscripcion', q: 'Quiero inscribirme, aquí están mis datos.', info: 'Documento: falta · Foto ✓ · Datos de contacto ✓', ops: ['Pedir el documento de identidad que falta', 'Inscribir así', 'Colgar la llamada'], ok: 0 },
  { k: 'inscripcion', q: 'Mi hijo de 12 años se quiere inscribir.', info: 'Edad: 12 años · Viene sin acudiente', ops: ['Explicar los requisitos de edad y la autorización del acudiente', 'Inscribirlo ya', 'Prestarle una bici a nombre del papá'], ok: 0 }
];
class MGLlamadas extends MG {
  constructor(parent, o) {
    super(parent, o); this.dur = o.dur || 120; this.min = o.clock0 || 480; this.rate = o.rate || 3; this.queue = []; this.cur = null; this.ringT = 1; this.solved = 0; this.lost = 0; this.wrongs = 0; this.byKind = { sancion: 0, prestamo: 0, inscripcion: 0 };
    this.pat = 24 * (parent.patMul || 1); this.coach = 'Toca el teléfono que suena para contestar.';
  }
  update(dt) {
    this.tick(dt); this.min += this.rate * dt; this.ringT -= dt * (this.p.paceRate || 1);
    if (this.ringT <= 0 && this.queue.length < 5) { this.ringT = this.rng.range(4, 8); const c = this.rng.pick(CASOS), ops = this.rng.shuffle(c.ops.map((t, i) => ({ t, ok: i === c.ok }))); this.queue.push({ c, ops, wait: this.pat, name: this.rng.pick(CARD_NAMES) }); Snd.sfx('bell'); }
    for (const q of this.queue) if (q !== this.cur) q.wait -= dt;
    const gone = this.queue.filter(q => q.wait <= 0 && q !== this.cur); if (gone.length) { this.lost += gone.length; Snd.sfx('bad'); this.pop('Colgó', 100, 50, PAL.cor); }
    this.queue = this.queue.filter(q => q.wait > 0 || q === this.cur);
    if (this.t >= this.dur && !this.cur) this.done = true;
    this.coach = this.cur ? 'Lee la información del sistema y elige la mejor solución.' : this.queue.length ? 'Toca el teléfono que suena para contestar.' : 'Esperando llamadas…';
  }
  answer() { if (this.cur || !this.queue.length) return; this.cur = this.queue[0]; Snd.sfx('tap'); }
  choose(i) {
    const q = this.cur; if (!q) return; const op = q.ops[i]; if (!op) return;
    if (op.ok) { this.solved++; this.byKind[q.c.k]++; this.good(10 + Math.round(q.wait / 3), 100, 40, '+ ¡Solucionado!'); } else { this.wrongs++; this.bad('Esa no era la solución', 100, 40); }
    this.queue.shift(); this.cur = null;
  }
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh; prect(b, 0, 0, vw, vh, '#1d2c44'); prect(b, 0, vh * .6, vw, vh, '#2b3a55');
    for (let i = 0; i < 4; i++) { const x = 16 + i * 46, y = Math.round(vh * .6) - 26; prect(b, x, y, 36, 24, '#0e2d55'); prect(b, x + 2, y + 2, 32, 16, '#56c7ff55'); prect(b, x + 14, y + 24, 8, 6, '#59606c'); }
    const pr = Save.data.profile; Art.person(b, vw / 2, Math.round(vh * .6) + 30, { skin: SKINS[pr.skin], hair: '#2a1a10', hairStyle: 1, shirt: '#56c7ff', pants: '#1d2c44' }, 0, 1);
    this.queue.forEach((q, i) => { const x = 14 + i * 28, y = 14, f = clamp(q.wait / this.pat, 0, 1); prect(b, x, y, 20, 26, q === this.cur ? PAL.vd : '#e9eef3'); prect(b, x + 4, y + 4, 12, 10, '#1d2c44'); prect(b, x, y + 28, Math.round(20 * f), 2, f > .5 ? PAL.vd : f > .25 ? PAL.amb : PAL.cor); if (q !== this.cur && (this.t * 4 | 0) % 2) pring(b, x + 10, y + 12, 14, '#fff'); });
  }
  hud(V) {
    this.btns = []; V.text('ATENCIÓN AL CLIENTE · resueltas ' + this.solved, 12, 66, { size: 15, color: PAL.vd1 });
    if (!this.cur && this.queue.length) this.button(V, V.w / 2 - 90, V.h - 100, 180, 64, '📞 CONTESTAR', () => this.answer(), { bg: PAL.vd2, size: 20, key: 'tel' });
    const q = this.cur; this.hideGoals = !!q;
    if (q) {
      const w = Math.min(420, V.w - 16), h = 96 + q.ops.length * 50, { x, y } = this.card(V, w, h, ({ sancion: 'SANCIÓN', prestamo: 'ERROR DE PRÉSTAMO', inscripcion: 'INSCRIPCIÓN' })[q.c.k] + ' · ' + q.name);
      V.text('«' + q.c.q + '»', x + 12, y + 44, { size: 15, color: PAL.az, body: true }); V.text('Sistema: ' + q.c.info, x + 12, y + 68, { size: 13, color: PAL.az2, body: true });
      q.ops.forEach((op, i) => this.button(V, x + 10, y + 84 + i * 50, w - 20, 42, op.t, () => this.choose(i), { size: 13, key: 'o' + i }));
    }
    this.drawPops(V);
  }
  hint() { const R = this.rects || {}; if (this.solved >= 2) return null; if (!this.cur) return R.tel || null; return R['o' + this.cur.ops.findIndex(o => o.ok)] || null; }
  tap() { if (!this.cur && this.queue.length) { this.answer(); return true; } return false; }
  bot(err) { if (!this.cur) return this.answer(); const i = this.rng.f() < err ? this.rng.i(0, this.cur.ops.length - 1) : this.cur.ops.findIndex(o => o.ok); this.choose(i); }
}
