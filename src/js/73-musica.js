/* =====================================================================
   MÚSICA INTERACTIVA POR ESTILOS: jazz, lo-fi, soft rock y electrónica.
   Automático: lo-fi en los menús y paseos de día, jazz de noche, soft rock en los turnos
   y electrónica en carreras, ciclovía y pausas activas. Todos siguen el mood del juego
   (velocidad, racha, tensión, noche y pendiente) y las notas interactivas (Snd.note).
   ===================================================================== */
const mfq = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORD = { maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], d7: [0, 4, 7, 10], maj: [0, 4, 7], min: [0, 3, 7], m9: [0, 3, 7, 10, 14], maj9: [0, 4, 7, 11, 14] };
const ESTILOS = {
  jazz: { name: 'Jazz', bpm: [104, 26], swing: 1, cut: 9000, rev: .3, prog: [[55, 'm7'], [48, 'd7'], [53, 'maj7'], [50, 'm7'], [55, 'm7'], [48, 'd7'], [57, 'm7'], [50, 'd7']] },
  lofi: { name: 'Lo-fi', bpm: [74, 12], swing: .75, cut: 2600, rev: .35, prog: [[53, 'maj9'], [52, 'm7'], [50, 'm9'], [48, 'maj7'], [53, 'maj9'], [52, 'm7'], [50, 'm9'], [55, 'd7']] },
  rock: { name: 'Soft rock', bpm: [98, 24], swing: 0, cut: 9000, rev: .18, prog: [[43, 'maj'], [50, 'maj'], [52, 'min'], [48, 'maj'], [43, 'maj'], [50, 'maj'], [48, 'maj'], [50, 'maj']] },
  electro: { name: 'Electrónica', bpm: [120, 8], swing: 0, cut: 12000, rev: .2, prog: [[45, 'min'], [41, 'maj'], [48, 'maj'], [43, 'maj'], [45, 'min'], [41, 'maj'], [48, 'maj'], [43, 'maj']] }
};
Object.assign(Snd, {
  cur: 'lofi', lock: null,
  bus() {
    if (this.sb || !this.ctx) return; const c = this.ctx;
    this.sb = c.createBiquadFilter(); this.sb.type = 'lowpass'; this.sb.frequency.value = 9000; this.sb.connect(this.musG);
    const len = Math.floor(c.sampleRate * 1.6), ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
    this.rev = c.createConvolver(); this.rev.buffer = ir; this.revG = c.createGain(); this.revG.gain.value = .3; this.rev.connect(this.revG); this.revG.connect(this.musG);
    this.duck = c.createGain(); this.duck.connect(this.sb);
    const nl = Math.floor(c.sampleRate * .5); this.nz = c.createBuffer(1, nl, c.sampleRate); const nd = this.nz.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
  },
  /* voz con filtro y envolvente; type puede ser una lista (osciladores desafinados = coro) */
  v(f, t, d, o = {}) {
    const c = this.ctx, g = c.createGain(), fl = c.createBiquadFilter(), types = Array.isArray(o.type) ? o.type : [o.type || 'triangle'];
    fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.cut || 4000, t); if (o.cutTo) fl.frequency.exponentialRampToValueAtTime(o.cutTo, t + d); fl.Q.value = o.q || .8;
    const a = o.a || .006, v = (o.v || .05) / Math.sqrt(types.length), end = t + d + (o.r || .08);
    types.forEach((ty, i) => { const os = c.createOscillator(); os.type = ty; os.frequency.setValueAtTime(f, t); if (o.det) os.detune.value = i % 2 ? o.det : -o.det; if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.2; lg.gain.value = f * .012; l.connect(lg); lg.connect(os.frequency); l.start(t + .08); l.stop(end); } os.connect(fl); os.start(t); os.stop(end + .02); });
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.setTargetAtTime(v * (o.sus != null ? o.sus : .55), t + a, Math.max(.02, d * .35)); g.gain.setTargetAtTime(.0001, t + d, (o.r || .08) / 3);
    fl.connect(g); g.connect(o.dest || this.sb); if (o.rev && this.rev) { const s = c.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(this.rev); }
  },
  nzHit(t, d, v, type, f, q, dest) { const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.nz; fl.type = type; fl.frequency.value = f; fl.Q.value = q || .7; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(dest || this.sb); s.start(t, Math.random() * .3, d + .05); },
  kick2(t, v) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + .14); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.connect(g); g.connect(this.sb); o.start(t); o.stop(t + .25); },
  snare(t, v, cut) { this.nzHit(t, .16, v, 'bandpass', cut || 1900, .6); this.v(190, t, .05, { type: 'triangle', v: v * .5, cut: 1200 }); },
  hh(t, v, open) { this.nzHit(t, open ? .22 : .045, v, 'highpass', 7200); },
  ride(t, v) { this.nzHit(t, .32, v * .6, 'highpass', 5200); this.v(3150, t, .25, { type: 'sine', v: v * .25, cut: 6000, sus: .2 }); },
  brush(t, v) { this.nzHit(t, .18, v, 'lowpass', 2600); },
  clap(t, v) { for (let i = 0; i < 3; i++) this.nzHit(t + i * .011, .09, v, 'bandpass', 1500, 1.2); },
  crackle(t) { if (Math.random() < .35) this.nzHit(t + Math.random() * .1, .004, .02 + Math.random() * .03, 'highpass', 3000); },
  /* estilo según el contexto (o el elegido en Más) */
  styleNow() {
    if (this.lock) return this.lock.style; const pref = Save.data.settings.mstyle || 'auto'; if (pref !== 'auto') return pref;
    const G = JE.game, M = G && G.mode, n = this.mood.n > .5;
    if (!M) return 'lofi';
    if (M.id === 'carrera' || M.race || (M.mods && M.mods.ciclovia) || M.comp || (M.sub && M.sub instanceof MGPausa)) return 'electro';
    if (n) return 'jazz';
    if (M.id === 'usuario') return 'lofi';
    return 'rock';
  },
  sched() {
    const c = this.ctx; if (!c) return; this.bus(); const M = this.mood;
    for (const k in this.mt) M[k] += (this.mt[k] - M[k]) * .12;
    const S = ESTILOS[this.cur] || ESTILOS.lofi, bpm = this.lock ? this.lock.bpm : S.bpm[0] + S.bpm[1] * M.e + 8 * M.t - 6 * M.n + (M.sl < -.04 ? 4 : M.sl > .04 ? -4 : 0), spb = this.spb = 60 / bpm / 4;
    while (this.nextT < c.currentTime + .3) {
      if (this.step % 16 === 0) { const nw = this.styleNow(); if (nw !== this.cur) { this.cur = nw; this.step = 0; } const E = ESTILOS[this.cur]; this.sb.frequency.setTargetAtTime(E.cut * (M.n > .5 ? .7 : 1), this.nextT, .3); this.revG.gain.setTargetAtTime(E.rev + .15 * M.n, this.nextT, .3); }
      this.playStep(this.step, this.nextT); this.nextT += spb; this.step = (this.step + 1) % 128;
    }
  },
  baseStep(s, t) {
    const M = this.mood, S = ESTILOS[this.cur] || ESTILOS.lofi, st = s % 16, bar = Math.floor(s / 16) % 8, [R, ck] = S.prog[bar], ch = CHORD[ck], nx = S.prog[(bar + 1) % 8][0], spb = this.spb;
    this.root = R - 12; this.third = ch[1];
    const sw = S.swing && st % 4 === 2 ? spb * .66 * S.swing : 0, T = t + sw, on8 = st % 2 === 0, k = h2(s, bar, 11);
    if (S.swing && st % 2 === 1) return;   // estilos con swing: corcheas
    const mel = (reg, type, o) => { const sc = [0, 2, ch[1], 5, 7, 9, ch[3] || 12, 12], n = sc[Math.floor(h2(s, 5, bar) * sc.length)]; this.v(mfq(R + reg + n), T, spb * (o.len || 1.8), Object.assign({ type, rev: .25 }, o)); };
    switch (this.cur) {
      case 'jazz': {
        if (st % 4 === 0) { const q = st / 4, n = q === 0 ? 0 : q === 1 ? ch[1] : q === 2 ? 7 : (nx - R) + (k < .5 ? -1 : 1); this.v(mfq(R - 12 + n), t, spb * 3.4, { type: 'triangle', v: .2, cut: 900, sus: .7 }); }
        if (st % 4 === 0 || st === 6 || st === 14) this.ride(T, .05 + .03 * M.e);
        if (st === 4 || st === 12) this.hh(t, .02);
        if ((st === 0 && (bar % 2 === 0 || M.e > .4)) || (st === 6 && M.e > .35) || (M.t > .5 && st === 10)) [ch[1], ch[3] || 11, 14].forEach(i => this.v(mfq(R + 12 + i), T, spb * (st === 0 ? 2.2 : 1.4), { type: ['triangle', 'sine'], v: .028, cut: 2400, rev: .3 }));
        if (st % 4 === 2 && M.e > .3) this.brush(T, .02);
        if ((M.e > .55 || M.k >= 1) && on8 && k < .3 + .15 * M.k) mel(24, 'sawtooth', { v: .03, cut: 1700, a: .03, vib: true, len: 1.6 });
        break;
      }
      case 'lofi': {
        if (st === 0 || st === 10 || (st === 7 && k < .3)) this.kick2(t, .13);
        if (st === 4 || st === 12) this.snare(T, .05, 1400);
        if (st % 4 === 2 || (M.e > .45 && st % 4 === 0)) this.hh(T, .012);
        if (st === 0) ch.forEach((i, j) => this.v(mfq(R + 12 + i), t + j * .012, spb * 15, { type: ['sine', 'triangle'], det: 9, v: .024, a: .03, cut: 1500, rev: .4, sus: .7 }));
        if (st === 8 && M.e > .3) ch.slice(1, 4).forEach(i => this.v(mfq(R + 24 + i), T, spb * 3, { type: 'sine', v: .016, a: .02, cut: 1800, rev: .5 }));
        if (st === 0 || st === 6 || (st === 10 && M.e > .5)) this.v(mfq(R - 12 + (st === 6 ? 7 : 0)), T, spb * 3, { type: 'sine', v: .2, cut: 500, sus: .8 });
        if ((st % 4 === 0 && k < .22 + .15 * M.k) || (M.k >= 1 && on8 && k < .3)) mel(24, 'triangle', { v: .03, a: .04, cut: 2000, rev: .45 });
        this.crackle(t);
        break;
      }
      case 'rock': {
        if (st === 0 || st === 8 || (M.e > .5 && (st === 6 || st === 10))) this.kick2(t, .18);
        if (st === 4 || st === 12) this.snare(t, .07);
        if (on8 || M.e > .75) this.hh(t, on8 ? .02 : .012);
        if (st === 0 && bar === 0 && M.e > .55) this.nzHit(t, 1.2, .04, 'highpass', 4500);
        if (on8) this.v(mfq(R - 12), t, spb * 1.6, { type: 'sawtooth', v: .07, cut: 650, sus: .6 });
        const pat = M.e < .35 ? [0, 8] : [0, 6, 8, 10, 14];
        if (pat.includes(st)) (ck === 'min' ? [0, 7, 12, 15] : [0, 7, 12, 16]).forEach((i, j) => this.v(mfq(R + 12 + i), t + j * .013, spb * 1.8, { type: 'sawtooth', v: .02, cut: 2400, cutTo: 900, rev: .15 }));
        if ((M.k >= 1 || M.e > .7) && on8 && st >= 8 && k < .45) mel(24, 'square', { v: .022, cut: 2600, vib: true, len: 1.4 });
        break;
      }
      case 'electro': {
        if (st % 4 === 0) { this.kick2(t, .22); const g = this.duck.gain; g.cancelScheduledValues(t); g.setValueAtTime(.35, t); g.linearRampToValueAtTime(1, t + spb * 3); }
        if (st === 4 || st === 12) this.clap(t, .05);
        if (st % 4 === 2) this.hh(t, .03, true); else if (M.e > .5) this.hh(t, .012);
        if (st % 4 === 2 || (M.e > .7 && st % 4 === 0)) this.v(mfq(R - 12), t, spb * 1.4, { type: 'sawtooth', v: .07, cut: 380, cutTo: 1400, q: 5 });
        if (st === 0) ch.forEach(i => this.v(mfq(R + 12 + i), t, spb * 15.5, { type: ['sawtooth', 'sawtooth'], det: 12, v: .02, a: .05, cut: 2200, sus: .8, dest: this.duck, rev: .3 }));
        if (M.e > .4 || M.k >= 1) this.v(mfq(R + 24 + [0, ch[1], 7, 12][st % 4]), t, spb * .9, { type: 'square', v: .013 + .006 * M.k, cut: 3200 });
        if (M.t > .5 && st % 2 === 0) this.v(mfq(R + 36 + st / 2), t, spb, { type: 'sine', v: .01, cut: 5000 });
        break;
      }
    }
    if (M.t > .55 && st % 8 === 0 && this.cur !== 'electro') this.v(mfq(R + 25), t, spb * 1.5, { type: 'square', v: .01, cut: 2000 });
  }
});
/* el estilo reemplaza la base; las capas de temporada (Navidad, Halloween) siguen encima */
Snd.playStep = function (s, t) {
  this.baseStep(s, t); const f = this.fest, st = s % 16; if (!f) return;
  if (f === 'jingle' && (st === 2 || st === 6 || st === 10 || st === 14)) this.v(mfq(this.root + 48 + (st === 14 ? 7 : 0)), t, .12, { type: 'sine', v: .025, rev: .3 });
  if (f === 'spooky' && st % 8 === 4) this.v(mfq(this.root + 30), t, .4, { type: 'sawtooth', v: .012, cut: 900 });
};
/* la pausa activa marca el ritmo: la música se sincroniza con la coreografía */
const _mgp73 = MGPausa.prototype.update;
MGPausa.prototype.update = function (dt) {
  if (!this._sync && Snd.ctx && !JE.headless && Snd.timer) { this._sync = 1; Snd.lock = { bpm: this.bpm, style: 'electro' }; Snd.cur = 'electro'; Snd.step = 0; Snd.nextT = Snd.ctx.currentTime + ((this.t0 - this.t) % this.beat + this.beat) % this.beat; }
  _mgp73.call(this, dt); if (this.done && this._sync === 1) { this._sync = 2; Snd.lock = null; }
};
/* opciones en Más: estilo musical */
const _mas73 = UI.renderMas;
UI.renderMas = function () {
  _mas73.call(this); const z = $('#tab-mas [data-zoom]'); if (!z) return; const row = z.closest('.opt'), S = Save.data.settings, cur = S.mstyle || 'auto';
  const d = document.createElement('div'); d.className = 'opt'; d.innerHTML = `<span>Estilo musical<br><small class="m">Automático cambia según el momento del juego</small></span><div class="seg wrap">${[['auto', 'Automático']].concat(Object.entries(ESTILOS).map(([k, e]) => [k, e.name])).map(([k, n]) => `<button data-mstyle="${k}" class="${cur === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  row.parentNode.insertBefore(d, row.nextSibling);
  $$('[data-mstyle]', d).forEach(b => b.onclick = () => { S.mstyle = b.dataset.mstyle; Save.save(); Snd.init(); Snd.resume(); Snd.music(true); this.renderMas(); Snd.sfx('tap'); });
};
