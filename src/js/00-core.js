'use strict';
/* =====================================================================
   JUEGA EN CICLA · núcleo (utilidades, guardado, sonido, entrada, vista)
   ===================================================================== */
const JE = window.JE = { version: '0.6.0', errors: [], headless: false };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function h2(x, y, s = 0) { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
class RNG {
  constructor(seed) { this.seed = seed >>> 0; this.r = mulberry32(this.seed); }
  f() { return this.r(); }
  i(a, b) { return a + Math.floor(this.r() * (b - a + 1)); }
  range(a, b) { return a + this.r() * (b - a); }
  pick(a) { return a[Math.floor(this.r() * a.length)]; }
  chance(p) { return this.r() < p; }
  shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
}
function fmtClock(min) {
  min = Math.max(0, min); const h = Math.floor(min / 60) % 24, m = Math.floor(min % 60);
  return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' a.m.' : ' p.m.');
}
const fmtInt = n => Math.round(n).toLocaleString('es-CO');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function todaySeed() { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
function vib(ms) { try { if (JE.save.data.settings.vib && navigator.vibrate) navigator.vibrate(ms); } catch (e) { } }

/* ---------- captura de errores (los usa el bot) ---------- */
window.addEventListener('error', e => { JE.errors.push(String(e.message || e.error) + ' @' + (e.lineno || '?')); });
window.addEventListener('unhandledrejection', e => { JE.errors.push('promesa: ' + String(e.reason)); });

/* ---------- guardado (localStorage + exportar/importar) ---------- */
const SAVE_KEY = 'juegaencicla.v1';
const Save = JE.save = {
  data: null, mem: null,
  def() {
    return {
      v: 1, created: Date.now(), profile: { name: 'Ciclista', skin: 1, shirt: 0, helmet: 0, bike: 0, bell: 0 }, spent: 0, owned: [],
      xp: 0, stars: {}, best: {}, history: [], postales: [], perks: [], streak: 0, bestStreak: 0, logros: [], flags: {},
      settings: { sfx: true, music: true, pace: 'normal', zoom: 0, vib: true, hints: true, big: false, seen: {} },
      stats: { km: 0, trips: 0, served: 0, fixed: 0, sorted: 0, plays: 0, leaves: 0, bells: 0 }
    };
  },
  merge(d, s) {
    for (const k in s) {
      if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]) && d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) this.merge(d[k], s[k]);
      else d[k] = s[k];
    }
    return d;
  },
  load() {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { raw = this.mem; }
    try { this.data = raw ? this.merge(this.def(), JSON.parse(raw)) : this.def(); } catch (e) { this.data = this.def(); }
    return this.data;
  },
  save() {
    const s = JSON.stringify(this.data);
    try { localStorage.setItem(SAVE_KEY, s); } catch (e) { this.mem = s; }
  },
  valid(o) { return o && typeof o === 'object' && o.v === 1 && Array.isArray(o.history) && o.profile && typeof o.xp === 'number'; },
  exportText() { return JSON.stringify({ app: 'Juega EnCicla', version: JE.version, exported: new Date().toISOString(), save: this.data }, null, 1); },
  importText(txt) {
    const o = JSON.parse(txt); const s = o && o.save ? o.save : o;
    if (!this.valid(s)) throw new Error('Archivo no válido');
    this.data = this.merge(this.def(), s); this.save(); return true;
  },
  reset() { this.data = this.def(); this.save(); },
  addHistory(h) { this.data.history.unshift(h); if (this.data.history.length > 300) this.data.history.length = 300; }
};

/* ---------- sonido 8 bits (WebAudio, sin archivos) ---------- */
const Snd = JE.snd = {
  ctx: null, out: null, musG: null, timer: null, step: 0, nextT: 0, noise: null, theme: 0,
  init() {
    if (this.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try {
      this.ctx = new AC(); this.out = this.ctx.createGain(); this.out.gain.value = .5; this.out.connect(this.ctx.destination);
      this.musG = this.ctx.createGain(); this.musG.gain.value = .16; this.musG.connect(this.out);
      const len = Math.floor(this.ctx.sampleRate * .06); this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null; }
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => { }); },
  tone(f, d, o = {}) {
    const c = this.ctx; if (!c) return;
    const t = o.t != null ? o.t : c.currentTime + (o.at || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'square'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
    const v = o.v != null ? o.v : .1;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    osc.connect(g); g.connect(o.dest || this.out); osc.start(t); osc.stop(t + d + .03);
  },
  hat(t, v = .05) {
    const c = this.ctx; if (!c || !this.noise) return;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = this.noise; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
    s.connect(g); g.connect(this.musG); s.start(t);
  },
  sfx(n) {
    if (!this.ctx || !Save.data.settings.sfx || JE.headless) return; this.resume();
    const T = (f, d, o) => this.tone(f, d, o);
    switch (n) {
      case 'tap': T(700, .05, { v: .05 }); break;
      case 'ok': T(784, .07, { v: .08 }); T(1175, .12, { at: .07, v: .08 }); break;
      case 'bad': T(220, .2, { type: 'sawtooth', v: .07, to: 140 }); break;
      case 'coin': T(988, .05, { v: .06 }); T(1319, .12, { at: .05, v: .06 }); break;
      case 'bell': { const b = Save.data.profile.bell | 0;
        if (b === 1) [0, .22].forEach(a => { T(233, .17, { type: 'sawtooth', v: .06, at: a }); T(294, .17, { type: 'square', v: .03, at: a }); });
        else if (b === 2) [2637, 3136, 3520].forEach((f, i) => T(f, .3, { type: 'sine', v: .07, at: i * .09 }));
        else if (b === 3) [0, .17].forEach(a => T(620, .13, { type: 'sawtooth', v: .07, to: 330, at: a }));
        else [0, .16].forEach(a => { T(2093, .32, { type: 'triangle', v: .09, at: a }); T(2637, .22, { type: 'sine', v: .04, at: a }); });
        break; }
      case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => T(f, .16, { at: i * .085, v: .08 })); break;
      case 'lose': [392, 330, 262, 196].forEach((f, i) => T(f, .2, { at: i * .12, v: .07, type: 'triangle' })); break;
      case 'honk': T(311, .16, { v: .05 }); T(370, .16, { v: .04 }); break;
      case 'star': T(1568, .18, { type: 'triangle', v: .09 }); T(2093, .25, { type: 'triangle', v: .07, at: .09 }); break;
      case 'leaf': T(1760, .06, { type: 'triangle', v: .05 }); break;
      case 'truck': T(110, .25, { type: 'sawtooth', v: .05, to: 90 }); break;
      case 'spark': T(1200, .08, { type: 'sawtooth', v: .04, to: 300 }); break;
    }
  },
  /* sonido ambiente suave según la zona */
  amb(k) {
    if (!this.ctx || !Save.data.settings.sfx || JE.headless) return; this.resume();
    const T = (f, d, o) => this.tone(f, d, o), R = Math.random;
    if (k === 'birds') { const n = 2 + (R() * 3 | 0), f0 = 2600 + R() * 900; for (let i = 0; i < n; i++) T(f0 + R() * 400, .07, { type: 'sine', v: .022, to: f0 + 900, at: i * .11 }); }
    else if (k === 'crickets') { for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) T(4300, .025, { type: 'triangle', v: .01, at: j * .45 + i * .045 }); }
    else if (k === 'tram') { [0, .3].forEach(a => T(1046, .4, { type: 'triangle', v: .035, at: a })); }
    else if (k === 'metro') { T(140, .9, { type: 'sawtooth', v: .018, to: 420 }); T(420, .8, { type: 'sine', v: .014, to: 120, at: .85 }); }
    else if (k === 'river') { for (let i = 0; i < 3; i++) T(300 + R() * 200, .25, { type: 'sine', v: .012, to: 200, at: i * .2 }); }
  },
  music(on) {
    if (!this.ctx) return;
    if (on && Save.data.settings.music && !JE.headless) {
      if (!this.timer) { this.nextT = this.ctx.currentTime + .08; this.timer = setInterval(() => this.sched(), 70); }
    } else if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },
  sched() {
    const c = this.ctx; if (!c) return; const spb = 60 / 108 / 4;
    while (this.nextT < c.currentTime + .3) { this.playStep(this.step, this.nextT); this.nextT += spb; this.step = (this.step + 1) % 128; }
  },
  playStep(s, t) {
    const mf = m => 440 * Math.pow(2, (m - 69) / 12);
    const bar = Math.floor(s / 16) % 8, st = s % 16;
    const prog = this.theme === 1 ? [45, 41, 43, 40, 45, 41, 43, 44] : [43, 40, 36, 38, 43, 40, 36, 38];
    const minor = this.theme === 1 ? [1, 0, 0, 1, 1, 0, 0, 0] : [0, 1, 0, 0, 0, 1, 0, 0];
    const r = prog[bar], third = minor[bar] ? 3 : 4, D = this.musG;
    if (st === 0 || st === 6 || st === 8 || st === 14) this.tone(mf(r + (st === 6 ? 7 : st === 14 ? 12 : 0)), .18, { t, type: 'triangle', v: .22, dest: D });
    if (st === 4 || st === 12 || st === 10) [0, third, 7].forEach(i => this.tone(mf(r + 24 + i), .07, { t, type: 'square', v: .035, dest: D }));
    if (st % 2 === 0) this.hat(t, st % 4 === 0 ? .03 : .018);
    const pent = [0, 2, 4, 7, 9, 12, 14, 16];
    const k = h2(s, bar, this.theme * 7 + 3);
    if ((st % 4 === 2 && k < .55) || (st === 0 && k < .8)) this.tone(mf(r + 24 + pent[Math.floor(h2(s, 5, bar) * pent.length)]), .14, { t, type: 'square', v: .045, dest: D });
  }
};

/* ---------- entrada: teclado + joystick flotante ---------- */
const Input = JE.input = {
  keys: {}, joy: { on: false, id: null, ox: 0, oy: 0, x: 0, y: 0 }, botDir: null,
  dir() {
    if (this.botDir) return this.botDir;
    let x = 0, y = 0; const k = this.keys;
    if (k.ArrowLeft || k.KeyA) x -= 1; if (k.ArrowRight || k.KeyD) x += 1;
    if (k.ArrowUp || k.KeyW) y -= 1; if (k.ArrowDown || k.KeyS) y += 1;
    if (x || y) { const l = Math.hypot(x, y); return { x: x / l, y: y / l, m: 1 }; }
    const j = this.joy;
    if (j.on) { const dx = j.x - j.ox, dy = j.y - j.oy, l = Math.hypot(dx, dy); if (l > 7) return { x: dx / l, y: dy / l, m: clamp((l - 7) / 42, .25, 1) }; }
    return { x: 0, y: 0, m: 0 };
  }
};
window.addEventListener('keydown', e => { Input.keys[e.code] = true; if (JE.game && JE.game.key) JE.game.key(e); });
window.addEventListener('keyup', e => { Input.keys[e.code] = false; });
window.addEventListener('blur', () => { Input.keys = {}; Input.joy.on = false; });

/* ---------- vista: búfer pixelado + capa nítida para textos ---------- */
const View = JE.view = {
  cv: null, ctx: null, buf: null, b: null, w: 320, h: 480, dpr: 1, s: 2, vw: 160, vh: 240, kind: 'map', dw: 200, dh: 150, subX: 0, subY: 0,
  init() {
    this.cv = $('#cv'); this.ctx = this.cv.getContext('2d');
    this.buf = document.createElement('canvas'); this.b = this.buf.getContext('2d');
    addEventListener('resize', () => this.resize());
    this.resize();
  },
  resize() {
    const r = this.cv.getBoundingClientRect();
    this.w = Math.max(160, Math.round(r.width) || innerWidth); this.h = Math.max(160, Math.round(r.height) || innerHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr);
    this.apply();
  },
  setMode(kind, dw, dh) { this.kind = kind; this.dw = dw || 200; this.dh = dh || 150; this.apply(); },
  apply() {
    let s;
    if (this.kind === 'map') { s = Math.round(Math.min(this.w, this.h) / 125); if (this.w >= 700) s = Math.min(s, Math.floor(this.w / 330)); s = clamp(s + (Save.data ? Save.data.settings.zoom | 0 : 0), 2, 8); }
    else if (this.kind === 'fit') s = Math.min(this.w / this.dw, this.h / this.dh);
    else { s = Math.max(1, Math.round(Math.min(this.w / this.dw, this.h / this.dh))); while (s > 1 && (this.w / s < 170 || this.h / s < 120)) s--; }
    this.s = s; this.vw = Math.ceil(this.w / s); this.vh = Math.ceil(this.h / s);
    if (this.buf.width !== this.vw + 1 || this.buf.height !== this.vh + 1) { this.buf.width = this.vw + 1; this.buf.height = this.vh + 1; }   // +1: corrimiento por fracción de pixel
    this.b.imageSmoothingEnabled = false;
  },
  present() {
    const c = this.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
    const k = this.s * this.dpr; c.drawImage(this.buf, -this.subX * k, -this.subY * k, (this.vw + 1) * k, (this.vh + 1) * k);
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },
  /* texto nítido en coordenadas CSS */
  text(t, x, y, o = {}) {
    const c = this.ctx, sz = Math.round((o.size || 14) * (Save.data && Save.data.settings.big ? 1.15 : 1));
    c.font = (o.bold === false ? '' : '700 ') + sz + 'px ' + (o.body ? 'Cuerpo,system-ui,sans-serif' : 'Titulos,"Arial Narrow",Impact,sans-serif');
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    if (o.bg) { const w = c.measureText(t).width, p = o.pad || 4; let bx = x - (c.textAlign === 'center' ? w / 2 : c.textAlign === 'right' ? w : 0) - p; c.fillStyle = o.bg; c.fillRect(bx, y - sz * .82 - p * .6, w + p * 2, sz + p * 1.1); if (o.border) { c.strokeStyle = o.border; c.lineWidth = 2; c.strokeRect(bx, y - sz * .82 - p * .6, w + p * 2, sz + p * 1.1); } }
    if (o.stroke) { c.lineWidth = o.sw || 3; c.strokeStyle = o.stroke; c.lineJoin = 'round'; c.strokeText(t, x, y); }
    c.fillStyle = o.color || '#fff'; c.fillText(t, x, y);
  },
  /* coordenadas CSS -> virtuales */
  toV(x, y) { return { x: x / this.s, y: y / this.s }; }
};
