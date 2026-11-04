/* =====================================================================
   MINIJUEGOS (vista panorámica / lateral). Lógica separada del dibujo:
   el bot llama directamente a las acciones.
   ===================================================================== */
class MG {
  constructor(parent, o = {}) {
    this.p = parent; this.o = o; this.t = 0; this.done = false; this.score = 0; this.errors = 0; this.coach = ''; this.btns = []; this.pops = []; this.flash = 0;
    this.view = { kind: 'px', dw: 200, dh: 150 }; this.rng = parent.rng; this.L = null;
  }
  has(k) { return this.p.has(k); }
  pop(txt, x, y, col) { this.pops.push({ txt, x, y, t: 1, col: col || '#fff' }); }
  good(pts, x, y, txt) { this.score += pts; Snd.sfx('ok'); this.pop(txt || '+' + pts, x, y, PAL.vd1); }
  bad(msg, x, y) { this.errors++; Snd.sfx('bad'); vib(40); this.pop(msg || '✗', x, y, PAL.cor); this.flash = .22; if (this.p.onError) this.p.onError(); }
  tick(dt) { this.t += dt; for (const p of this.pops) { p.t -= dt; p.y -= 10 * dt; } this.pops = this.pops.filter(p => p.t > 0); this.flash = Math.max(0, this.flash - dt); }
  drawPops(V) { for (const p of this.pops) V.text(p.txt, p.x * V.s, p.y * V.s, { size: 16, align: 'center', stroke: '#0a2342', sw: 4, color: p.col }); if (this.flash > 0) { V.ctx.fillStyle = 'rgba(255,107,90,' + (this.flash * .5).toFixed(2) + ')'; V.ctx.fillRect(0, 0, V.w, V.h); } }
  button(V, x, y, w, h, label, fn, o = {}) {
    const c = V.ctx; c.fillStyle = '#0006'; c.fillRect(x + 4, y + 4, w, h);
    c.fillStyle = o.bg || PAL.az1; c.fillRect(x, y, w, h); c.strokeStyle = o.border || '#fff'; c.lineWidth = 3; c.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
    if (o.icon) { c.imageSmoothingEnabled = false; const s = Math.min(h - 14, 32); c.drawImage(Art.icon(o.icon), x + w / 2 - s / 2, y + 5, s, s); if (label) V.text(label, x + w / 2, y + h - 6, { size: Math.min(13, h * .28), align: 'center', color: o.color || '#fff' }); }
    else V.text(label, x + w / 2, y + h / 2 + (o.size || 18) * .35, { size: o.size || 18, align: 'center', color: o.color || '#fff' });
    this.btns.push({ x, y, w, h, fn }); if (o.key) (this.rects || (this.rects = {}))[o.key] = { x: x + w / 2, y: y + h / 2 };
  }
  pointer(type, vx, vy, cx, cy) {
    if (type === 'down') for (const b of this.btns) if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) { Snd.sfx('tap'); b.fn(); return true; }
    if (type === 'down' && this.tap) return this.tap(vx, vy, cx, cy);
    if (type === 'up' && this.release) this.release();
    return false;
  }
  card(V, w, h, title) {
    const c = V.ctx, x = (V.w - w) / 2, y = 58; c.fillStyle = '#0008'; c.fillRect(x + 6, y + 6, w, h);
    c.fillStyle = PAL.crema; c.fillRect(x, y, w, h); c.strokeStyle = PAL.az; c.lineWidth = 4; c.strokeRect(x + 2, y + 2, w - 4, h - 4);
    c.fillStyle = PAL.az; c.fillRect(x, y, w, 24); V.text(title, x + 10, y + 17, { size: 15, color: PAL.vd1 });
    return { x, y };
  }
  bgStation(V, min) {
    const b = V.b, vw = V.vw, vh = V.vh, gy = Math.round(vh * .62);
    b.drawImage(Art.panorama(vw, vh, min, gy - 18), 0, 0);
    prect(b, 0, gy - 18, vw, vh - gy + 18, '#bdb9ab'); for (let x = 0; x < vw; x += 8) prect(b, x, gy - 18, 1, vh, '#b0ac9d');
    const qy = Math.round(vh * .88); prect(b, 0, qy + 3, vw, vh - qy, '#3d4454'); prect(b, 0, qy + 3, vw, 1, '#8f8b7e');
    for (let x = 0; x < vw; x += 12) prect(b, x, Math.min(vh - 2, qy + 9), 6, 1, '#e8e8e0');
    return { gy, qy };
  }
}

/* ---------------- ANFITRIÓN: estación manual ---------------- */
const CARD_NAMES = ['Valentina', 'Juan José', 'Mariana', 'Santiago', 'Sara', 'Samuel', 'Isabella', 'Matías', 'Doña Gloria', 'Don Rubén', 'Camila', 'Andrés', 'Luisa', 'Felipe', 'Manuela', 'Don Jairo', 'Salomé', 'Emiliano', 'Doña Marta', 'Alejandro'];
const SANCIONES = ['Sanción por entrega tarde', 'Registro vencido', 'Tarjeta bloqueada'];
const DANOS = { llanta: 'llanta pinchada', cadena: 'cadena caída', freno: 'freno flojo' };
class MGAnfitrion extends MG {
  constructor(parent, o) {
    super(parent, o); const T = o.turno || 1; this.T = T;
    this.dur = o.dur || 150; this.min = o.clock0 || 330; this.rate = o.rate || 1.6; this.cap = o.cap || (6 + T * 2);
    this.slots = []; for (let i = 0; i < this.cap; i++) this.slots.push(this.rng.f() < .6 ? this.newBike(T > 1 ? .12 : .06) : null);
    this.queue = []; this.leaving = []; this.cur = null; this.step = null; this.msg = '';
    this.served = 0; this.abandons = 0; this.happy = 0; this.taller = 0; this.aux = 0; this.spawnT = .25; this.tiltT = 14; this.tiltTime = 0; this.truckT = o.short ? 1e9 : 55; this.truck = null; this.bikeId = 100 + this.rng.i(0, 800);
    this.patMax = (o.short ? 26 : [0, 32, 26, 23][T]) * (parent.has('sonrisa') ? 1.25 : 1) * (parent.patMul || 1);
    this.coach = 'Toca al usuario de la fila para atenderlo.';
  }
  newBike(pd) { return { id: this.bikeId++, dmg: this.rng.f() < pd ? this.rng.pick(['llanta', 'cadena', 'freno']) : null, tilt: 0 }; }
  goodSlots() { return this.slots.map((s, i) => s && !s.dmg ? i : -1).filter(i => i >= 0); }
  freeSlots() { return this.slots.map((s, i) => s ? -1 : i).filter(i => i >= 0); }
  spawnUser() {
    if (this.queue.length >= 7) return;
    const T = this.T, morning = this.min < 720, bikes = this.slots.filter(Boolean).length;
    let loan = this.rng.f() < (morning ? .6 : .42); if (bikes <= 1) loan = this.rng.f() < .3; if (bikes >= this.cap - 1) loan = this.rng.f() < .75;
    const u = { p: Art.randPerson(this.rng), type: loan ? 'loan' : 'ret', x: (this.L ? this.L.vw : 220) + 10, st: 'walk', pat: this.patMax, ph: this.rng.f() };
    u.name = this.rng.pick(CARD_NAMES); u.card = this.rng.i(1000, 9999);
    if (loan) { u.valid = T === 1 && !this.o.short ? true : this.rng.f() > (T === 3 ? .24 : .16); if (!u.valid) u.reason = this.rng.pick(SANCIONES); }
    else { u.bike = this.newBike(T === 1 ? .16 : T === 2 ? .22 : .28); u.mins = this.rng.f() < (T === 3 ? .28 : T === 2 ? .15 : 0) ? this.rng.i(62, 95) : this.rng.i(8, 58); u.late = u.mins > 60; }
    this.queue.push(u);
  }
  qx(i) { let x = this.L.bx1 + 8; for (let k = 0; k < i; k++) x += this.queue[k].type === 'ret' ? 24 : 15; return x; }
  update(dt) {
    this.tick(dt); this.min += this.rate * dt;
    if (!this.L) this.L = { vw: 220, vh: 150, bx1: 40, gy: 93, qy: 132 };
    // llegadas
    const peak = .7 + .8 * gauss(this.min, 450, 60) + .8 * gauss(this.min, 1080, 70), base = this.o.short ? .42 : [0, .3, .38, .46][this.T];
    this.spawnT -= dt * base * peak * (this.p.mods.demand || 1) * (this.p.paceRate || 1);
    if (this.spawnT <= 0) { this.spawnT = 1; this.spawnUser(); }
    // fila
    this.queue.forEach((u, i) => {
      const tx = this.qx(i); if (u.x > tx) u.x = Math.max(tx, u.x - 28 * dt), u.ph += dt * 2; else u.st = 'wait';
      if (u !== this.cur) u.pat -= dt; else u.pat -= dt * .3;
      if (u.pat <= 0 && u !== this.cur) { u.st = 'angry'; this.abandons++; this.leaving.push({ u, dir: 1, ride: false }); Snd.sfx('bad'); this.pop('¡Se fue!', u.x, this.L.qy - 26, PAL.cor); }
    });
    this.queue = this.queue.filter(u => u.st !== 'angry');
    for (const l of this.leaving) { l.u.x += (l.ride ? 60 : 30) * l.dir * dt; l.u.ph += dt * 2; }
    this.leaving = this.leaving.filter(l => l.u.x > -30 && l.u.x < this.L.vw + 30);
    // bicis torcidas (orden)
    if (this.T >= 2 && !this.o.short) { this.tiltT -= dt; if (this.tiltT <= 0) { this.tiltT = this.T === 3 ? 9 : 16; const occ = this.slots.map((s, i) => s && !s.tilt ? i : -1).filter(i => i >= 0); if (occ.length) this.slots[this.rng.pick(occ)].tilt = this.rng.f() < .5 ? -2 : 2; } }
    if (this.slots.some(s => s && s.tilt)) this.tiltTime += dt;
    // camión de balanceo
    this.truckT -= dt;
    if (this.truckT <= 0 && !this.truck) { this.truck = { x: -40, t: 0 }; this.truckT = 60; Snd.sfx('truck'); }
    if (this.truck) { const tr = this.truck; tr.t += dt; if (tr.t < 1.5) tr.x = lerp(-40, this.L.vw * .5, tr.t / 1.5); else if (tr.t < 3) { if (!tr.did) { tr.did = 1; this.balance(); } } else tr.x += 80 * dt; if (tr.x > this.L.vw + 50) this.truck = null; }
    if (this.t >= this.dur) this.done = true;
    // ayuda contextual
    if (this.step === 'card') this.coach = this.cur.type === 'loan' ? 'Revisa la tarjeta: ¿está ACTIVA? Si no hay bicis buenas, NIEGA con amabilidad.' : '';
    else if (this.step === 'pick') this.coach = 'Toca una bici con luz VERDE para prestarla.';
    else if (this.step === 'close') this.coach = '¿Llegó tarde (más de 60 min) o con daño? Ciérralo CON NOVEDAD.';
    else if (this.step === 'place') this.coach = this.cur.bike.dmg ? 'Bici dañada: tócala en el TALLER (caja roja).' : (this.freeSlots().length ? 'Toca un anclaje libre para guardar la bici.' : 'Estación llena: guárdala en AUXILIAR (caja azul).');
    else this.coach = this.queue.length ? 'Toca al usuario de la fila para atenderlo.' + (this.slots.some(s => s && s.tilt) ? ' Endereza las bicis torcidas (!).' : '') : 'Esperando usuarios… endereza bicis y retira las dañadas (luz roja).';
  }
  balance() {
    const n = this.slots.filter(Boolean).length; let moved = 0;
    if (n > this.cap * .8) { for (let i = 0; i < this.cap && moved < 4; i++) if (this.slots[i] && !this.slots[i].dmg) { this.slots[i] = null; moved++; } }
    else if (n < this.cap * .3) { for (let i = 0; i < this.cap && moved < 5; i++) if (!this.slots[i]) { this.slots[i] = this.newBike(0); moved++; } }
    this.aux = 0; this.taller = 0; this.pop('Balanceo: ' + (moved ? moved + ' bicis' : 'ok'), this.L.vw * .5, this.L.qy - 10, PAL.cie);
  }
  /* acciones */
  serve() {
    if (this.cur || !this.queue.length || this.queue[0].st !== 'wait') return false;
    this.cur = this.queue[0]; this.step = this.cur.type === 'loan' ? 'card' : (this.T >= 2 ? 'close' : 'place'); Snd.sfx('tap'); return true;
  }
  decide(lend) {
    const u = this.cur; if (!u || this.step !== 'card') return;
    const good = this.goodSlots().length > 0, x = u.x, y = this.L.qy - 26;
    if (lend) {
      if (!u.valid) { this.bad('¡Tarjeta con sanción!', x, y); this.finish(false); }
      else if (!good) { this.msg = 'No hay bicis en buen estado'; this.pop('No hay bicis', x, y, PAL.amb); }
      else this.step = 'pick';
    } else {
      if (!u.valid) { this.good(6, x, y, '+6 ¡Bien visto!'); this.finish(true, true); }
      else if (!good) { this.good(3, x, y, '+3 Disculpas'); this.finish(true, true); }
      else { this.bad('¡Era válida!', x, y); this.finish(false); }
    }
  }
  pickSlot(i) {
    const u = this.cur, s = this.slots[i], x = this.slotX(i), y = this.L.gy - 18;
    if (this.step === 'pick') {
      if (!s) return; if (s.dmg) { this.bad('¡Está dañada!', x, y); return; }
      this.slots[i] = null; u.got = s; this.served++; this.good(10 + Math.round(5 * u.pat / this.patMax), x, y); this.finish(true, false, true);
    } else if (this.step === 'place') {
      if (s) return; if (u.bike.dmg) { this.bad('¡Va al taller!', x, y); return; }
      this.slots[i] = u.bike; u.bike = null; this.served++; this.good(10 + Math.round(5 * u.pat / this.patMax), x, y); this.finish(true, true);
    } else if (!this.step && s) {
      if (s.tilt) { s.tilt = 0; this.good(2, x, y, '+2 Orden'); }
      else if (s.dmg) { this.slots[i] = null; this.taller++; this.good(3, x, y, '+3 Al taller'); }
    }
  }
  closeLoan(nov) {
    const u = this.cur; if (!u || this.step !== 'close') return;
    const need = u.late || !!u.bike.dmg;
    if (nov === need) { this.score += 3; Snd.sfx('coin'); this.pop(nov ? '+3 Novedad' : '+3 Cerrado', u.x, this.L.qy - 26, PAL.vd1); } else this.bad(need ? '¡Tenía novedad!' : '¡Estaba bien!', u.x, this.L.qy - 26);
    this.step = 'place';
  }
  toTaller() {
    if (this.step !== 'place') return; const u = this.cur, x = this.L.vw - 15, y = this.L.gy - 30;
    if (!u.bike.dmg) { this.bad('¡Está buena!', x, y); return; }
    this.taller++; u.bike = null; this.served++; this.good(10 + Math.round(5 * u.pat / this.patMax), x, y); this.finish(true, true);
  }
  toAux() {
    if (this.step !== 'place') return; const u = this.cur, x = this.L.vw - 15, y = this.L.gy - 56;
    if (u.bike.dmg) { this.bad('¡Va al taller!', x, y); return; }
    if (this.freeSlots().length) { this.bad('¡Hay anclajes libres!', x, y); return; }
    this.aux++; u.bike = null; this.served++; this.good(10, x, y); this.finish(true, true);
  }
  finish(ok, walk, ride) {
    const u = this.cur; if (!u) return; this.queue.shift(); if (ok) this.happy++;
    this.leaving.push({ u, dir: ride ? -1 : 1, ride: !!ride }); this.cur = null; this.step = null; this.msg = '';
  }
  slotX(i) { const L = this.L; return L.r0 + (L.rows === 2 ? i % L.per : i) * L.sp + L.sp / 2; }
  slotY(i) { const L = this.L; return L.rows === 2 && i >= L.per ? L.gy - 12 : L.gy; }
  /* dibujo */
  render(V) {
    const b = V.b, { gy, qy } = this.bgStation(V, this.min), vw = V.vw;
    const bx0 = 4, bw = 34, bx1 = bx0 + bw, r0 = bx1 + 14, r1 = vw - 30, rw = r1 - r0;
    let rows = 1, per = this.cap, sp = rw / this.cap; if (sp < 8) { rows = 2; per = Math.ceil(this.cap / 2); sp = rw / per; }
    this.L = { vw, vh: V.vh, gy, qy, bx1, r0, r1, rows, per, sp };
    // plataforma y techo
    prect(b, r0 - 4, gy - 28, rw + 8, 30, '#eef2f5'); prect(b, r0 - 4, gy + 1, rw + 8, 2, PAL.vd2);
    prect(b, r0 - 6, gy - 44, rw + 12, 5, PAL.vd); prect(b, r0 - 6, gy - 44, rw + 12, 1, PAL.vd1); prect(b, r0 - 2, gy - 39, 2, 40, '#9aa7b8'); prect(b, r1, gy - 39, 2, 40, '#9aa7b8');
    for (let x = r0; x < r1; x += 7) prect(b, x, gy - 42, 3, 1, '#fff');
    const t = this.t, hi = (Math.floor(t * 4) % 2) === 0;
    for (let i = 0; i < this.cap; i++) {
      const x = Math.round(this.slotX(i)), y = this.slotY(i), s = this.slots[i];
      prect(b, x + 3, y - 8, 2, 8, '#59606c'); prect(b, x + 3, y - 9, 2, 1, s ? (s.dmg ? PAL.cor : PAL.vd) : '#9aa7b8');
      if (s) Art.bikeFront(b, x, y, s.dmg ? 'bad' : 'ok', s.tilt);
      if (s && s.tilt) prect(b, x - 1, y - 22, 2, 4, PAL.amb), prect(b, x - 1, y - 17, 2, 1, PAL.amb);
      if (hi && ((this.step === 'pick' && s && !s.dmg) || (this.step === 'place' && !s && this.cur && !this.cur.bike.dmg))) pring(b, x, y - 8, 6, '#fff');
    }
    // taller y auxiliar
    const tx = vw - 26; prect(b, tx, gy - 24, 22, 22, '#3a1f22'); prect(b, tx + 1, gy - 23, 20, 20, PAL.cor); b.drawImage(Art.icon('llave'), tx + 3, gy - 21);
    prect(b, tx, gy - 50, 22, 22, '#10243f'); prect(b, tx + 1, gy - 49, 20, 20, PAL.cie); b.drawImage(Art.icon('estacion'), tx + 3, gy - 47);
    if (hi && this.step === 'place' && this.cur) { if (this.cur.bike.dmg) pring(b, tx + 11, gy - 13, 14, '#fff'); else if (!this.freeSlots().length) pring(b, tx + 11, gy - 39, 14, '#fff'); }
    // caseta con el anfitrión
    Art.booth(b, bx0, gy + 2, bw, 34);
    const pr = Save.data.profile; Art.person(b, bx0 + bw / 2 + 2, gy - 4, { skin: SKINS[pr.skin], hair: '#2a1a10', hairStyle: 2, cap: PAL.vd, shirt: '#1d4a80', pants: '#1d2c44', vest: true }, 0, 1);
    prect(b, bx0, gy - 6, bw, 8, '#e9eef3'); prect(b, bx0, gy - 6, bw, 1, PAL.vd);
    // camión
    if (this.truck) Art.truckSide(b, this.truck.x, V.vh - 1, 6, 1);
    // fila y salidas
    const drawU = (u, face, ride) => {
      if (ride) { Art.bikeSide(b, u.x, qy, { r: 4 }); Art.person(b, u.x + 1, qy - 6, u.p, 0, -1); return; }
      if (u.type === 'ret' && u.bike) Art.bikeSide(b, u.x + 11, qy, { r: 4, dmg: u.bike.dmg ? { [u.bike.dmg === 'llanta' ? 'llanta' : u.bike.dmg]: u.bike.dmg === 'llanta' ? 'f' : true } : {} });
      Art.person(b, u.x, qy, u.p, u.st === 'walk' ? u.ph : 0, face);
      if (u.st === 'wait' || u === this.cur) { const f = clamp(u.pat / this.patMax, 0, 1); Art.mood(b, u.x - 1, qy - (u.p.kid ? 23 : 29), f); prect(b, u.x - 5, qy - (u.p.kid ? 18 : 24) + 0, 9, 1, '#0a2342'); prect(b, u.x - 5, qy - (u.p.kid ? 18 : 24), Math.round(9 * f), 1, f > .55 ? PAL.vd : f > .25 ? PAL.amb : PAL.cor); }
      if (u.type === 'loan' && u.st === 'wait') prect(b, u.x - 6, qy - 12, 3, 2, u === this.cur ? PAL.amb : '#fff');
    };
    for (let i = this.queue.length - 1; i >= 0; i--) drawU(this.queue[i], -1, false);
    for (const l of this.leaving) drawU(l.u, l.dir, l.ride && l.u.got);
    if (!this.cur && this.queue.length && this.queue[0].st === 'wait' && hi) pring(b, this.queue[0].x, qy - 12, 12, '#fff');
  }
  hud(V) {
    this.btns = []; const s = V.s, L = this.L; if (!L) return;
    V.text('TALLER', (L.vw - 3) * s, (L.gy + 7) * s + 6, { size: 11, align: 'right', color: '#fff', bg: '#3a1f22', pad: 2 });
    V.text('AUXILIAR', (L.vw - 3) * s, (L.gy - 52) * s - 2, { size: 11, align: 'right', color: '#fff', bg: '#10243f', pad: 2 });
    V.text('Bicis ' + this.slots.filter(Boolean).length + '/' + this.cap, (L.r0 + 2) * s, (L.gy + 10) * s, { size: 12, color: PAL.az, bg: '#ffffffcc', pad: 2 });
    const u = this.cur; this.hideGoals = !!(u && (this.step === 'card' || this.step === 'close'));
    if (u && (this.step === 'card' || this.step === 'close')) {
      const w = Math.min(380, V.w - 20), h = 148, { x, y } = this.card(V, w, h, this.step === 'card' ? 'VENTANILLA · PRÉSTAMO' : 'VENTANILLA · DEVOLUCIÓN');
      if (this.step === 'card') {
        V.text('Tarjeta de ' + u.name + '  ·  Nº ' + u.card, x + 12, y + 46, { size: 16, color: PAL.az });
        V.text(u.valid ? '✓ ACTIVA' : '✗ ' + u.reason.toUpperCase(), x + 12, y + 72, { size: 18, color: u.valid ? PAL.vd2 : '#c0392b' });
        if (this.msg) V.text(this.msg, x + w - 12, y + 72, { size: 13, color: '#b0651a', align: 'right' });
        const bw = (w - 36) / 2;
        this.button(V, x + 12, y + h - 52, bw, 42, '✓ PRESTAR', () => this.decide(true), { bg: PAL.vd2, key: 'si' });
        this.button(V, x + 24 + bw, y + h - 52, bw, 42, '✗ NEGAR', () => this.decide(false), { bg: '#7a2a24', key: 'no' });
      } else {
        V.text('Bici Nº ' + u.bike.id + ' de ' + u.name, x + 12, y + 46, { size: 16, color: PAL.az });
        V.text('Préstamo: ' + u.mins + ' min' + (u.late ? '  (¡tarde!)' : ''), x + 12, y + 68, { size: 15, color: u.late ? '#c0392b' : PAL.az2 });
        V.text('Estado: ' + (u.bike.dmg ? DANOS[u.bike.dmg] : 'sin daños'), x + 12, y + 88, { size: 15, color: u.bike.dmg ? '#c0392b' : PAL.vd2 });
        const bw = (w - 36) / 2;
        this.button(V, x + 12, y + h - 50, bw, 40, 'CERRAR OK', () => this.closeLoan(false), { bg: PAL.vd2, size: 16, key: 'ok' });
        this.button(V, x + 24 + bw, y + h - 50, bw, 40, 'CON NOVEDAD', () => this.closeLoan(true), { bg: '#b0651a', size: 16, key: 'nov' });
      }
    }
    this.drawPops(V);
  }
  hint(V) {
    if (this.served >= 3 || !this.L) return null; const s = V.s, L = this.L, u = this.cur, R = this.rects || {};
    if (!u) { const q = this.queue[0]; return q && q.st === 'wait' ? { x: q.x * s, y: (L.qy - 12) * s, txt: 'Toca' } : null; }
    if (this.step === 'card') return R[u.valid && this.goodSlots().length ? 'si' : 'no'] || null;
    if (this.step === 'close') return R[u.late || u.bike.dmg ? 'nov' : 'ok'] || null;
    if (this.step === 'pick') { const i = this.goodSlots()[0]; return i >= 0 ? { x: this.slotX(i) * s, y: (this.slotY(i) - 8) * s } : null; }
    if (this.step === 'place') { if (u.bike.dmg) return { x: (L.vw - 15) * s, y: (L.gy - 13) * s }; const f = this.freeSlots()[0]; return f >= 0 ? { x: this.slotX(f) * s, y: (this.slotY(f) - 8) * s } : { x: (L.vw - 15) * s, y: (L.gy - 39) * s }; }
    return null;
  }
  tap(vx, vy) {
    const L = this.L; if (!L) return false;
    if (vx > L.vw - 28 && vy > L.gy - 26 && vy < L.gy + 2) { this.toTaller(); return true; }
    if (vx > L.vw - 28 && vy > L.gy - 52 && vy < L.gy - 26) { this.toAux(); return true; }
    let bi = -1, bd = 1e9;
    for (let i = 0; i < this.cap; i++) { const x = this.slotX(i), y = this.slotY(i) - 8, d = Math.abs(vx - x) + Math.abs(vy - y) * .6; if (d < bd && Math.abs(vx - x) < L.sp * .75 + 2 && Math.abs(vy - y) < 12) { bd = d; bi = i; } }
    if (bi >= 0) { this.pickSlot(bi); return true; }
    if (vy > L.gy && !this.cur) { this.serve(); return true; }
    if (vx < L.bx1 + 4 && !this.cur) { this.serve(); return true; }
    return false;
  }
  bot(err) {
    const r = this.rng.f() < err;
    if (!this.cur) { if (this.queue.length && this.queue[0].st === 'wait') return this.serve(); const ti = this.slots.findIndex(s => s && (s.tilt || s.dmg)); if (ti >= 0) this.pickSlot(ti); return; }
    const u = this.cur;
    if (this.step === 'card') this.decide(r ? !u.valid : (u.valid && this.goodSlots().length > 0));
    else if (this.step === 'pick') { const g = this.goodSlots(); this.pickSlot(r ? this.rng.i(0, this.cap - 1) : g[0]); if (!g.length) this.finish(false); }
    else if (this.step === 'close') this.closeLoan(r ? !(u.late || !!u.bike.dmg) : (u.late || !!u.bike.dmg));
    else if (this.step === 'place') { if (u.bike.dmg) this.toTaller(); else { const f = this.freeSlots(); if (f.length) this.pickSlot(f[0]); else this.toAux(); } }
  }
}

/* ---------------- MECÁNICO: taller de rapidez ---------------- */
const FAULTS = { pinchazo: { tool: 'parche', col: '#ff6b5a', name: 'Pinchazo' }, desinflada: { tool: 'bomba', col: '#56c7ff', name: 'Sin aire' }, cadena: { tool: 'cadena', col: '#f08a4b', name: 'Cadena' }, freno: { tool: 'llave', col: '#ffffff', name: 'Freno' }, sillin: { tool: 'allen', col: '#9bd341', name: 'Sillín' }, luz: { tool: 'luz', col: '#ffe066', name: 'Luz' } };
const TOOLS = [['parche', 'Parche'], ['bomba', 'Bomba'], ['cadena', 'Cadena'], ['llave', 'Llave'], ['allen', 'Allen'], ['luz', 'Bombillo']];
class MGMecanico extends MG {
  constructor(parent, o) {
    super(parent, o); const T = o.turno || 1; this.T = T; this.dur = o.dur || 120; this.target = o.target || 6;
    this.timePer = (o.timePer || [0, 22, 17, 15][T]) * (parent.patMul || 1); this.fr = o.faults || [[0], [1, 2], [2, 3], [2, 4]][T]; this.diag = o.diag != null ? o.diag : T === 3;
    this.fixed = 0; this.failed = 0; this.streak = 0; this.best = 0; this.perfect = 0; this.times = []; this.bike = null; this.slide = 0; this.gauge = null; this.min = o.clock0 || 480;
    this.next(); this.coach = 'Toca la herramienta del MISMO COLOR que la falla que parpadea.';
  }
  next() {
    if (this.o.maxBikes && this.fixed + this.failed >= this.o.maxBikes) { this.done = true; return; }
    let n = this.rng.i(this.fr[0], this.fr[1]); if (this.has('llave')) n = Math.max(1, n - 1);
    const keys = this.rng.shuffle(Object.keys(FAULTS).slice()).slice(0, n);
    if (keys.includes('pinchazo') && keys.includes('desinflada')) keys.splice(keys.indexOf('desinflada'), 1);
    const wheel = this.rng.f() < .5 ? 'f' : 'r';
    this.bike = { faults: keys.map(k => ({ k, ok: false, seen: !this.diag, wheel })), t: this.timePer, err: 0 }; this.slide = 1;
  }
  hot(f) { // posición de la falla en coordenadas virtuales
    const L = this.L || { cx: 100, gy: 100, r: 14 }, s = L.r / 4, x = L.cx, y = L.gy;
    switch (f.k) {
      case 'pinchazo': case 'desinflada': return { x: x + (f.wheel === 'f' ? -7 : 7) * s, y: y - L.r };
      case 'cadena': return { x: x + 3 * s, y: y - L.r + 2 };
      case 'freno': return { x: x - 6 * s, y: y - 11 * s };
      case 'sillin': return { x: x + 2 * s, y: y - 10 * s };
      case 'luz': return { x: x - 11 * s, y: y - 9 * s };
    }
  }
  update(dt) {
    this.tick(dt); this.min += dt * 3; if (this.slide > 0) { this.slide = Math.max(0, this.slide - dt * 2.5); return; }
    if (this.gauge) { this.gauge.ph += dt * (this.T === 3 ? 5.2 : 4); this.gauge.v = .5 + .5 * Math.sin(this.gauge.ph); }
    const B = this.bike; if (B) { B.t -= dt; if (B.t <= 0) { this.failed++; this.streak = 0; Snd.sfx('lose'); this.pop('¡Pendiente!', this.L ? this.L.cx : 100, 40, PAL.cor); this.gauge = null; this.next(); } }
    if (this.t >= this.dur) this.done = true;
    if (this.gauge) this.coach = '¡Infla! Toca ¡YA! cuando la aguja esté en la zona verde.';
    else if (B && B.faults.some(f => !f.seen)) this.coach = 'Diagnóstico: toca los signos ? de la bici para ver qué tiene.';
    else this.coach = 'Toca la herramienta del MISMO COLOR que la falla que parpadea.';
  }
  inspect(i) { const f = this.bike && this.bike.faults[i]; if (f && !f.seen) { f.seen = true; Snd.sfx('tap'); } }
  useTool(tool) {
    const B = this.bike; if (!B || this.slide > 0 || this.gauge) return;
    const f = B.faults.find(f => !f.ok && f.seen && FAULTS[f.k].tool === tool), h = f ? this.hot(f) : { x: this.L ? this.L.cx : 100, y: 50 };
    if (!f) { B.err++; this.streak = 0; B.t -= 2; this.bad('Herramienta equivocada', h.x, h.y - 10); return; }
    if (tool === 'bomba') { this.gauge = { f, ph: 0, v: 0 }; return; }
    this.fix(f);
  }
  pump() {
    const g = this.gauge; if (!g) return; const h = this.hot(g.f);
    if (g.v > .62 && g.v < .84) { this.gauge = null; this.fix(g.f); } else { this.pop(g.v < .62 ? 'Poco aire' : 'Mucho aire', h.x, h.y - 10, PAL.amb); this.bike.t -= 1; }
  }
  fix(f) {
    f.ok = true; const h = this.hot(f); this.score += 4; Snd.sfx('coin'); this.pop('✓', h.x, h.y - 8, PAL.vd1);
    const B = this.bike; if (B.faults.every(x => x.ok)) {
      this.fixed++; this.streak++; this.best = Math.max(this.best, this.streak); this.times.push(this.timePer - B.t); if (!B.err) this.perfect++;
      const pts = 15 + Math.round(B.t) + (B.err ? 0 : 5); this.good(pts, this.L ? this.L.cx : 100, 30, '+' + pts + ' ¡Lista!');
      if (this.o.target && this.o.short && this.fixed >= this.o.target) this.done = true; else this.next();
    }
  }
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh;
    prect(b, 0, 0, vw, vh, '#1d2c44'); for (let y = 0; y < vh; y += 16) prect(b, 0, y, vw, 1, '#22345a');
    for (let x = 6; x < vw; x += 28) { prect(b, x, 8, 18, 2, '#3b4b6b'); prect(b, x + 4, 10, 2, 8, '#9aa7b8'); prect(b, x + 11, 10, 3, 6, '#c9d1da'); }
    const gy = Math.round(vh * .66), r = clamp(Math.floor(Math.min(vw * .1, vh * .16)), 9, 22), cx = Math.round(vw / 2 - this.slide * vw * .7);
    this.L = { cx, gy, r, vw, vh };
    prect(b, 0, gy + 1, vw, 4, '#59606c'); prect(b, 0, gy + 5, vw, vh, '#2b3a55'); prect(b, cx - r * 2, gy + 1, 4, 10, '#9aa7b8'); prect(b, cx + r * 2, gy + 1, 4, 10, '#9aa7b8');
    const B = this.bike; if (!B) return;
    const dmg = {}; for (const f of B.faults) if (!f.ok) { if (f.k === 'pinchazo' || f.k === 'desinflada') dmg.llanta = f.wheel; else dmg[f.k] = true; }
    Art.bikeSide(b, cx, gy, { r, dmg });
    const blink = (Math.floor(this.t * 4) % 2) === 0;
    B.faults.forEach(f => { if (f.ok) return; const h = this.hot(f); const col = f.seen ? FAULTS[f.k].col : '#c9d1da'; pring(b, h.x, h.y, blink ? 6 : 5, col); pring(b, h.x, h.y, blink ? 7 : 6, '#0a2342'); });
    // barra de tiempo
    const k = clamp(B.t / this.timePer, 0, 1); prect(b, 8, 24, vw - 16, 4, '#0a2342'); prect(b, 8, 24, Math.round((vw - 16) * k), 4, k > .4 ? PAL.vd : k > .2 ? PAL.amb : PAL.cor);
    if (this.gauge) { const gx = vw / 2, gyy = 44; prect(b, gx - 40, gyy - 4, 80, 8, '#0a2342'); prect(b, gx - 40 + 80 * .62, gyy - 4, 80 * .22, 8, PAL.vd2); prect(b, Math.round(gx - 40 + 80 * this.gauge.v), gyy - 7, 2, 14, '#fff'); }
  }
  hud(V) {
    this.btns = []; const s = V.s, L = this.L; if (!L || !this.bike) return;
    this.bike.faults.forEach(f => { if (f.ok) return; const h = this.hot(f); V.text(f.seen ? '!' : '?', h.x * s, h.y * s + 6, { size: 16, align: 'center', color: '#fff', stroke: '#0a2342', sw: 4 }); });
    V.text('Bicis listas: ' + this.fixed + (this.o.short ? '/' + this.o.target : ''), 12, 66, { size: 16, color: PAL.vd1 });
    const n = TOOLS.length, pad = 6, bw = Math.min(110, (V.w - pad * (n + 1)) / n), bh = Math.min(76, Math.max(58, V.h * .11)), y = V.h - bh - 12, x0 = (V.w - (bw * n + pad * (n - 1))) / 2; this.coachB = bh + (this.gauge ? 96 : 26);
    TOOLS.forEach(([id, label], i) => {
      const col = Object.values(FAULTS).find(f => f.tool === id).col;
      this.button(V, x0 + i * (bw + pad), y, bw, bh, label, () => this.useTool(id), { icon: id, border: col, color: col, key: 't_' + id });
    });
    if (this.gauge) this.button(V, V.w / 2 - 80, y - 74, 160, 58, '¡YA!', () => this.pump(), { bg: PAL.vd2, size: 26, key: 'ya' });
    this.drawPops(V);
  }
  hint(V) {
    const B = this.bike, R = this.rects || {}; if (this.fixed >= 1 || !B || this.slide > 0) return null;
    if (this.gauge) return R.ya ? Object.assign({ txt: 'En verde' }, R.ya) : null;
    const h = B.faults.find(f => !f.ok && !f.seen); if (h) { const p = this.hot(h); return { x: p.x * V.s, y: p.y * V.s }; }
    const f = B.faults.find(f => !f.ok); return f ? R['t_' + FAULTS[f.k].tool] || null : null;
  }
  tap(vx, vy) {
    if (!this.bike) return false;
    const i = this.bike.faults.findIndex(f => !f.ok && !f.seen && dist(vx, vy, this.hot(f).x, this.hot(f).y) < 9);
    if (i >= 0) { this.inspect(i); return true; }
    if (this.gauge) { this.pump(); return true; }
    return false;
  }
  bot(err) {
    const B = this.bike; if (!B || this.slide > 0) return;
    if (this.gauge) { if (this.gauge.v > .66 && this.gauge.v < .8) this.pump(); return; }
    const hid = B.faults.findIndex(f => !f.ok && !f.seen); if (hid >= 0) return this.inspect(hid);
    const f = B.faults.find(f => !f.ok); if (!f) return;
    this.useTool(this.rng.f() < err ? this.rng.pick(TOOLS)[0] : FAULTS[f.k].tool);
  }
}

/* ---------------- BODEGA: clasificación rápida ---------------- */
const CATS = { llanta: { name: 'Llantas', col: '#56c7ff' }, cadena: { name: 'Cadenas', col: '#f08a4b' }, sillin: { name: 'Sillines', col: '#9bd341' }, caja: { name: 'Camión', col: '#ffffff' }, luz: { name: 'Luces', col: '#ffe066' }, malo: { name: 'Descarte', col: '#ff6b5a' } };
class MGBodega extends MG {
  constructor(parent, o) {
    super(parent, o); const T = o.turno || 1; this.T = T; this.dur = o.dur || 120;
    this.cats = ['llanta', 'cadena', 'sillin', 'caja'].concat(T >= 2 ? ['luz'] : []).concat(T >= 3 ? ['malo'] : []);
    this.items = []; this.spawnT = .5; this.ok = 0; this.wrong = 0; this.miss = 0; this.combo = 0; this.bestCombo = 0; this.truck = 0; this.trucks = 0; this.truckAway = 0; this.fly = []; this.newBikes = 0;
    this.coach = 'Cuando la pieza llegue al ESCÁNER, toca su caja del mismo color.';
  }
  prog() { return clamp(this.t / this.dur, 0, 1); }
  speed() { return (16 + 16 * this.prog()) * (1 + (this.T - 1) * .12) * (this.has('ojo') ? .85 : 1) * (this.p.paceRate || 1); }
  update(dt) {
    this.tick(dt); const vw = this.L ? this.L.vw : 200, end = vw * .74;
    this.spawnT -= dt; if (this.spawnT <= 0) { this.spawnT = lerp(1.9, 1.0, this.prog()) / (1 + (this.T - 1) * .1) / (this.p.paceRate || 1); this.items.push({ cat: this.rng.pick(this.cats), x: -10 }); }
    const v = this.speed(); for (const it of this.items) it.x += v * dt;
    for (const it of this.items) if (it.x > end) { it.gone = true; this.miss++; this.combo = 0; Snd.sfx('bad'); this.pop('¡Se cayó!', end, (this.L ? this.L.belt : 60) - 10, PAL.cor); }
    this.items = this.items.filter(it => !it.gone);
    for (const f of this.fly) f.t += dt * 3; this.fly = this.fly.filter(f => f.t < 1);
    if (this.truckAway > 0) { this.truckAway -= dt; }
    if (this.t >= this.dur) this.done = true;
  }
  front() { let f = null; for (const it of this.items) if (!f || it.x > f.x) f = it; return f; }
  sort(cat) {
    const it = this.front(); const L = this.L || { vw: 200, belt: 60, vh: 150 };
    if (!it) { this.pop('Nada en la banda', L.vw / 2, L.belt - 14, PAL.amb); return; }
    if (it.x < L.vw * .12) { this.pop('Espera que avance', L.vw / 2, L.belt - 14, PAL.amb); return; }
    this.items.splice(this.items.indexOf(it), 1);
    const bi = this.cats.indexOf(cat); this.fly.push({ cat: it.cat, x0: it.x, y0: L.belt, bi, t: 0, ok: it.cat === cat });
    if (it.cat === cat) {
      this.ok++; this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); const pts = 5 * Math.min(5, 1 + Math.floor(this.combo / 4)); this.score += pts; Snd.sfx('coin'); this.pop('+' + pts + (this.combo >= 4 ? ' x' + Math.min(5, 1 + Math.floor(this.combo / 4)) : ''), it.x, L.belt - 12, PAL.vd1);
      if (cat === 'caja') { this.newBikes++; this.truck++; if (this.truck >= 10) { this.truck = 0; this.trucks++; this.truckAway = 2; this.good(30, L.vw * .86, L.belt - 30, '+30 ¡Camión lleno!'); } }
    } else { this.wrong++; this.combo = 0; this.bad('Caja equivocada', it.x, L.belt - 12); }
  }
  acc() { const n = this.ok + this.wrong + this.miss; return n ? this.ok / n : 1; }
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh, belt = Math.round(vh * .38); this.L = { vw, vh, belt };
    prect(b, 0, 0, vw, vh, '#22314f'); for (let x = 0; x < vw; x += 20) { prect(b, x, 0, 10, belt - 26, '#26385c'); }
    for (let x = 4; x < vw; x += 24) { prect(b, x, 6, 20, 1, '#9aa7b8'); prect(b, x, 16, 20, 1, '#9aa7b8'); for (let k = 0; k < 3; k++) prect(b, x + 2 + k * 6, 8, 4, 8, ['#c48a52', '#56c7ff', '#9bd341'][(x / 24 + k) % 3 | 0]); }
    // banda
    const end = vw * .74; prect(b, 0, belt + 4, end + 6, 6, '#3b4250'); const off = Math.floor(this.t * this.speed()) % 6;
    for (let x = -6 + off; x < end; x += 6) prect(b, x, belt + 5, 3, 1, '#59606c'); prect(b, 0, belt + 10, end + 6, 2, '#151a22');
    prect(b, Math.round(vw * .62), belt - 18, 2, 30, '#ff2fb3'); prect(b, Math.round(vw * .62) - 6, belt - 22, 14, 5, '#2b2f38');
    for (const it of this.items) b.drawImage(Art.icon(it.cat), Math.round(it.x - 8), belt - 12);
    const f = this.front(); if (f && (Math.floor(this.t * 5) % 2)) pring(b, f.x, belt - 4, 10, '#fff');
    // camión
    if (this.truckAway <= 0) Art.truckSide(b, vw * .87, belt + 12, this.truck, -1);
    // cajas destino (arriba de los botones)
    const n = this.cats.length;
    this.fly.forEach(fl => { const tx = (fl.bi + .5) * vw / n, ty = vh - 10; const x = lerp(fl.x0, tx, fl.t), y = lerp(fl.y0, ty, fl.t) - Math.sin(fl.t * Math.PI) * 20; b.drawImage(Art.icon(fl.cat), Math.round(x - 8), Math.round(y - 8)); });
  }
  hud(V) {
    this.btns = []; if (!this.L) return;
    const s = V.s; V.text('ESCÁNER', this.L.vw * .62 * s, (this.L.belt - 24) * s, { size: 11, align: 'center', color: '#ff8fd6' });
    V.text('Camión ' + this.truck + '/10', this.L.vw * .87 * s, (this.L.belt + 26) * s, { size: 12, align: 'center', color: '#fff', bg: '#0a2342cc', pad: 2 });
    V.text('Bicis nuevas: ' + this.newBikes + '  ·  Precisión ' + Math.round(this.acc() * 100) + '%', 12, 66, { size: 14, color: PAL.vd1 });
    const n = this.cats.length, pad = 6, bw = Math.min(120, (V.w - pad * (n + 1)) / n), bh = Math.min(84, Math.max(60, V.h * .12)), y = V.h - bh - 12, x0 = (V.w - (bw * n + pad * (n - 1))) / 2; this.coachB = bh + 26;
    this.cats.forEach((c, i) => this.button(V, x0 + i * (bw + pad), y, bw, bh, CATS[c].name, () => this.sort(c), { icon: c, border: CATS[c].col, color: CATS[c].col, key: 'c_' + c }));
    this.drawPops(V);
  }
  hint() { const f = this.front(), R = this.rects || {}; return this.ok < 4 && f && this.L && f.x > this.L.vw * .3 ? R['c_' + f.cat] || null : null; }
  bot(err) { const f = this.front(); if (f && f.x > (this.L ? this.L.vw : 200) * .3) this.sort(this.rng.f() < err ? this.rng.pick(this.cats) : f.cat); }
}

/* ---------------- ESTACIÓN AUTOMÁTICA: apertura / cierre ---------------- */
class MGApertura extends MG {
  constructor(parent, o) {
    super(parent, o); this.mode = o.cierre ? 'cierre' : 'apertura'; this.docks = []; const n = o.docks || 6;
    for (let i = 0; i < n; i++) this.docks.push({ on: this.mode === 'cierre', bike: this.rng.f() < .55 });
    this.step = this.mode === 'apertura' ? 'unlock' : 'lock'; this.hold = 0; this.holding = false; this.opts = null; this.min = o.clock0 || 330;
  }
  update(dt) {
    this.tick(dt);
    if (this.holding && (this.step === 'power' || this.step === 'off')) { this.hold += dt; if (this.hold >= .8) { this.holding = false; this.hold = 0; Snd.sfx('ok'); if (this.step === 'power') this.step = 'docks'; else this.finishMG(); } }
    this.coach = { unlock: 'Toca el CANDADO del tótem para desbloquearlo.', power: 'MANTÉN presionado el botón de encendido.', docks: 'Toca cada anclaje en ROJO para activarlo.', lock: 'Toca cada anclaje VERDE para cerrarlo.', count: '¿Cuántas bicis quedaron en la estación? Cuéntalas.', off: 'MANTÉN presionado para apagar el tótem.' }[this.step] || '';
  }
  unlock() { if (this.step === 'unlock') { this.step = 'power'; Snd.sfx('coin'); } }
  press(on) { if (this.step === 'power' || this.step === 'off') { this.holding = on; if (!on) this.hold = 0; } }
  dock(i) {
    const d = this.docks[i]; if (!d) return; const x = this.L ? this.dockX(i) : 100, y = this.L ? this.L.gy - 20 : 80;
    if (this.step === 'docks' && !d.on) { d.on = true; Snd.sfx('tap'); this.score += 1; if (this.docks.every(d => d.on)) this.finishMG(); }
    else if (this.step === 'lock' && d.on) { d.on = false; Snd.sfx('tap'); this.score += 1; if (this.docks.every(d => !d.on)) { this.step = 'count'; const n = this.docks.filter(d => d.bike).length, a = this.rng.shuffle([n, n + 1, Math.max(0, n - 1) === n ? n + 2 : Math.max(0, n - 1)]); this.opts = [...new Set(a)]; while (this.opts.length < 3) this.opts.push(n + this.opts.length + 1); } }
    else if (this.step === 'docks' || this.step === 'lock') this.pop('Ya está', x, y, PAL.amb);
  }
  answer(v) { const n = this.docks.filter(d => d.bike).length; if (v === n) { this.good(5, 100, 40, '+5 ¡Conteo exacto!'); this.step = 'off'; } else this.bad('Cuenta otra vez', 100, 40); }
  finishMG() { this.score += 8; Snd.sfx('win'); this.done = true; }
  dockX(i) { const L = this.L; return L.r0 + i * L.sp + L.sp / 2; }
  render(V) {
    const b = V.b, { gy } = this.bgStation(V, this.min), vw = V.vw, n = this.docks.length, r0 = 46, sp = Math.min(20, (vw - r0 - 12) / n);
    this.L = { gy, r0, sp, vw };
    prect(b, r0 - 6, gy - 46, n * sp + 12, 5, PAL.vd); prect(b, r0 - 4, gy - 28, n * sp + 8, 30, '#eef2f5');
    const blink = Math.floor(this.t * 4) % 2;
    this.docks.forEach((d, i) => { const x = Math.round(this.dockX(i)); prect(b, x - 1, gy - 12, 3, 12, '#59606c'); prect(b, x - 2, gy - 15, 5, 3, d.on ? PAL.vd : PAL.cor); if (d.bike) Art.bikeFront(b, x + 5, gy, 'ok'); if (blink && ((this.step === 'docks' && !d.on) || (this.step === 'lock' && d.on))) pring(b, x, gy - 13, 6, '#fff'); });
    // tótem
    const tx = 16; prect(b, tx, gy - 44, 18, 46, '#2b2f38'); prect(b, tx + 2, gy - 40, 14, 10, this.step === 'unlock' ? '#10243f' : PAL.vd2); prect(b, tx + 6, gy - 22, 6, 6, this.step === 'unlock' ? PAL.amb : '#59606c');
    if (this.step === 'unlock' && blink) pring(b, tx + 9, gy - 19, 7, '#fff');
    if (this.holding) prect(b, tx, gy - 50, Math.round(18 * this.hold / .8), 3, PAL.vd1);
  }
  hud(V) {
    this.btns = []; const s = V.s; if (!this.L) return;
    V.text(this.mode === 'apertura' ? 'APERTURA DE ESTACIÓN' : 'CIERRE DE ESTACIÓN', V.w / 2, 70, { size: 20, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 });
    if (this.step === 'power' || this.step === 'off') this.button(V, V.w / 2 - 110, V.h - 110, 220, 70, this.holding ? 'SOSTÉN… ' + Math.round(this.hold / .8 * 100) + '%' : (this.step === 'power' ? '⏻ ENCENDER' : '⏻ APAGAR'), () => this.press(true), { bg: PAL.vd2, size: 22, key: 'pw' });
    if (this.step === 'count' && this.opts) { const bw = Math.min(110, (V.w - 40) / 3); this.opts.forEach((v, i) => this.button(V, V.w / 2 - (bw * 3 + 20) / 2 + i * (bw + 10), V.h - 100, bw, 64, String(v), () => this.answer(v), { size: 30, key: 'n' + v })); }
    this.drawPops(V);
  }
  tap(vx, vy) {
    const L = this.L; if (!L) return false;
    if (vx < 40 && vy > L.gy - 48) { this.unlock(); return true; }
    for (let i = 0; i < this.docks.length; i++) if (Math.abs(vx - this.dockX(i)) < L.sp / 2 + 2 && vy > L.gy - 30 && vy < L.gy + 4) { this.dock(i); return true; }
    return false;
  }
  release() { this.press(false); }
  hint(V) {
    const L = this.L, R = this.rects || {}, s = V.s; if (!L) return null;
    if (this.step === 'unlock') return { x: 25 * s, y: (L.gy - 19) * s, txt: 'Toca' };
    if (this.step === 'power' || this.step === 'off') return R.pw ? Object.assign({ txt: 'Mantén' }, R.pw) : null;
    if (this.step === 'docks' || this.step === 'lock') { const i = this.docks.findIndex(d => this.step === 'docks' ? !d.on : d.on); return i >= 0 ? { x: this.dockX(i) * s, y: (L.gy - 13) * s } : null; }
    if (this.step === 'count' && this.errors === 0) return null;
    return null;
  }
  bot() {
    if (this.step === 'unlock') this.unlock(); else if (this.step === 'power' || this.step === 'off') this.press(true);
    else if (this.step === 'docks') this.dock(this.docks.findIndex(d => !d.on)); else if (this.step === 'lock') this.dock(this.docks.findIndex(d => d.on));
    else if (this.step === 'count') this.answer(this.docks.filter(d => d.bike).length);
  }
}

/* ---------------- TÉCNICO: cables del anclaje ---------------- */
const WCOL = ['#ff6b5a', '#56c7ff', '#9bd341', '#ffc93c', '#b07cff'];
class MGCables extends MG {
  constructor(parent, o) { super(parent, o); const n = o.n || 3; this.n = n; this.right = this.rng.shuffle([...Array(n).keys()]); this.links = new Array(n).fill(-1); this.sel = -1; this.min = o.clock0 || 600; this.coach = 'Une cada cable con el de su MISMO COLOR: toca uno a la izquierda y luego su pareja.'; }
  update(dt) { this.tick(dt); if (this.links.every(l => l >= 0) && !this.endT) this.endT = .6; if (this.endT) { this.endT -= dt; if (this.endT <= 0) { this.done = true; Snd.sfx('win'); } } }
  pickL(i) { if (this.links[i] < 0) { this.sel = i; Snd.sfx('tap'); } }
  pickR(j) {
    if (this.sel < 0) return; const c = this.right[j];
    if (this.links.includes(j)) return;
    if (c === this.sel) { this.links[this.sel] = j; this.score += 3; Snd.sfx('coin'); } else { this.bad('¡Chispa!', 100, 40); Snd.sfx('spark'); }
    this.sel = -1;
  }
  pos(side, i) { const L = this.L || { vw: 200, vh: 150 }; return { x: side ? L.vw * .78 : L.vw * .22, y: 34 + i * ((L.vh - 70) / Math.max(1, this.n - 1 || 1)) }; }
  render(V) {
    const b = V.b; this.L = { vw: V.vw, vh: V.vh }; prect(b, 0, 0, V.vw, V.vh, '#1b2433'); prect(b, V.vw * .3, 20, V.vw * .4, V.vh - 40, '#26334a');
    for (let i = 0; i < this.n; i++) {
      const l = this.pos(0, i), rIdx = this.right.indexOf(i), r = this.pos(1, rIdx);
      prect(b, l.x - 8, l.y - 4, 10, 8, WCOL[i]); if (i === this.sel && Math.floor(this.t * 6) % 2) pring(b, l.x - 3, l.y, 8, '#fff');
      prect(b, this.pos(1, i).x - 2, this.pos(1, i).y - 4, 10, 8, WCOL[this.right[i]]);
      if (this.links[i] >= 0) { const rr = this.pos(1, this.links[i]); pline(b, l.x + 2, l.y, rr.x - 2, rr.y, WCOL[i]); pline(b, l.x + 2, l.y + 1, rr.x - 2, rr.y + 1, WCOL[i]); }
    }
  }
  hud(V) { this.btns = []; V.text('REPARA EL ANCLAJE', V.w / 2, 70, { size: 20, align: 'center', color: PAL.vd1 }); this.drawPops(V); }
  tap(vx, vy) { for (let i = 0; i < this.n; i++) { const l = this.pos(0, i), r = this.pos(1, i); if (dist(vx, vy, l.x - 3, l.y) < 12) { this.pickL(i); return true; } if (dist(vx, vy, r.x + 3, r.y) < 12) { this.pickR(i); return true; } } return false; }
  hint(V) { if (this.links.some(l => l >= 0) || !this.L) return null; const p = this.sel < 0 ? this.pos(0, 0) : this.pos(1, this.right.indexOf(this.sel)); return { x: (p.x + (this.sel < 0 ? -3 : 3)) * V.s, y: p.y * V.s }; }
  bot(err) { if (this.sel < 0) { const i = this.links.findIndex(l => l < 0); if (i >= 0) this.pickL(i); } else { const j = this.rng.f() < err ? this.rng.i(0, this.n - 1) : this.right.indexOf(this.sel); this.pickR(j); } }
}

/* ---------------- TÉCNICO: reinicio del tótem (memoria) ---------------- */
const KCOL = [PAL.vd, PAL.cie, PAL.amb, PAL.cor];
class MGSimon extends MG {
  constructor(parent, o) { super(parent, o); this.len = o.len || 3; this.seq = []; for (let i = 0; i < this.len; i++) this.seq.push(this.rng.i(0, 3)); this.show = 0; this.inp = 0; this.lit = -1; this.phase = 'show'; this.min = o.clock0 || 600; }
  update(dt) {
    this.tick(dt);
    if (this.phase === 'show') { this.show += dt; const k = Math.floor(this.show / .5); this.lit = k < this.len && (this.show % .5) < .32 ? this.seq[k] : -1; if (k >= this.len) { this.phase = 'in'; this.lit = -1; } }
    else if (this.phase === 'ok') { this.show += dt; if (this.show > .6) { this.done = true; Snd.sfx('win'); } }
    this.coach = this.phase === 'show' ? 'Mira el orden en que se encienden las teclas…' : this.phase === 'in' ? 'Repite el orden tocando las teclas (' + this.inp + '/' + this.len + ').' : '¡Tótem reiniciado!';
  }
  key(i) {
    if (this.phase !== 'in') return;
    if (this.seq[this.inp] === i) { this.inp++; if (Save.data.settings.sfx && !JE.headless) Snd.tone(523 + i * 130, .12, { v: .08 }); if (this.inp >= this.len) { this.phase = 'ok'; this.show = 0; this.score += 6; } }
    else { this.bad('Otra vez', 100, 40); this.phase = 'show'; this.show = -.4; this.inp = 0; }
  }
  kr(i) { const L = this.L || { vw: 200, vh: 150 }, s = Math.min(L.vw, L.vh) * .26, cx = L.vw / 2, cy = L.vh * .56; return { x: cx + (i % 2 ? 4 : -s - 4), y: cy + (i > 1 ? 4 : -s - 4), s }; }
  render(V) {
    const b = V.b; this.L = { vw: V.vw, vh: V.vh }; prect(b, 0, 0, V.vw, V.vh, '#1b2433');
    const k0 = this.kr(0); prect(b, k0.x - 10, k0.y - 26, k0.s * 2 + 28, k0.s * 2 + 40, '#2b2f38'); prect(b, k0.x - 4, k0.y - 20, k0.s * 2 + 16, 10, '#10243f');
    for (let i = 0; i < 4; i++) { const r = this.kr(i); prect(b, r.x, r.y, r.s, r.s, this.lit === i ? '#ffffff' : shade(KCOL[i], -.45)); prect(b, r.x + 2, r.y + 2, r.s - 4, r.s - 4, this.lit === i ? KCOL[i] : shade(KCOL[i], -.25)); }
  }
  hud(V) { this.btns = []; V.text('REINICIA EL TÓTEM', V.w / 2, 70, { size: 20, align: 'center', color: PAL.vd1 }); this.drawPops(V); }
  tap(vx, vy) { for (let i = 0; i < 4; i++) { const r = this.kr(i); if (vx >= r.x && vx <= r.x + r.s && vy >= r.y && vy <= r.y + r.s) { this.key(i); return true; } } return false; }
  bot(err) { if (this.phase === 'in') this.key(this.rng.f() < err ? this.rng.i(0, 3) : this.seq[this.inp]); }
}

/* ---------------- APOYO: inspección de estación ---------------- */
class MGInspeccion extends MG {
  constructor(parent, o) {
    super(parent, o); const n = o.n || 7; this.bikes = []; for (let i = 0; i < n; i++) this.bikes.push({ bad: false, found: false });
    const k = o.bad || 2; this.rng.shuffle([...Array(n).keys()]).slice(0, k).forEach(i => this.bikes[i].bad = true); this.min = o.clock0 || 600;
    this.coach = 'Encuentra las bicis con luz ROJA y retíralas para revisión.';
  }
  update(dt) { this.tick(dt); if (this.bikes.every(b => !b.bad || b.found) && !this.done) { this.score += 6; this.done = true; Snd.sfx('win'); } }
  pick(i) { const bk = this.bikes[i]; if (!bk || bk.found) return; const x = this.L ? this.bx(i) : 100; if (bk.bad) { bk.found = true; this.good(3, x, 50, '+3'); } else this.bad('Esa está bien', x, 50); }
  bx(i) { const L = this.L; return 30 + i * L.sp + L.sp / 2; }
  render(V) {
    const b = V.b, { gy } = this.bgStation(V, this.min), n = this.bikes.length, sp = Math.min(22, (V.vw - 60) / n); this.L = { gy, sp };
    prect(b, 26, gy - 46, n * sp + 8, 5, PAL.vd); prect(b, 26, gy - 28, n * sp + 8, 30, '#eef2f5');
    this.bikes.forEach((bk, i) => { const x = Math.round(this.bx(i)); prect(b, x + 3, gy - 9, 2, 1, bk.bad ? PAL.cor : PAL.vd); if (!bk.found) Art.bikeFront(b, x, gy, bk.bad ? 'bad' : 'ok'); else prect(b, x - 2, gy - 4, 6, 2, PAL.vd); });
  }
  hud(V) { this.btns = []; V.text('VERIFICA LA ESTACIÓN', V.w / 2, 70, { size: 20, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 5 }); this.drawPops(V); }
  tap(vx, vy) { if (!this.L) return false; for (let i = 0; i < this.bikes.length; i++) if (Math.abs(vx - this.bx(i)) < this.L.sp / 2 + 1 && vy > this.L.gy - 22 && vy < this.L.gy + 3) { this.pick(i); return true; } return false; }
  bot(err) { const i = this.rng.f() < err ? this.rng.i(0, this.bikes.length - 1) : this.bikes.findIndex(b => b.bad && !b.found); if (i >= 0) this.pick(i); }
}
