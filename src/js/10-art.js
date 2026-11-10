/* =====================================================================
   ARTE PIXEL procedural (sin imágenes externas)
   ===================================================================== */
const PAL = {
  az: '#0a2342', az1: '#0e2d55', az2: '#143a6b', az3: '#2a5a92', vd: '#9bd341', vd1: '#c4ec7c', vd2: '#5e9a1e',
  bl: '#ffffff', crema: '#f4efd8', amb: '#ffc93c', cor: '#ff6b5a', cie: '#56c7ff', lad: '#c0623b', k: '#0a1424', gris: '#9aa7b8', plata: '#d6dde6'
};
const SKINS = ['#f6d2b4', '#e0ac83', '#c68a5e', '#9a6440', '#6b4128'];
const SHIRTS = ['#9bd341', '#56c7ff', '#ff6b5a', '#ffc93c', '#ffffff', '#b07cff', '#ff8fc7', '#0a2342', '#ffd84a', '#f08a4b', '#2ec4b6', '#23272f', '#c0392b'];
const HELMETS = ['#ffffff', '#9bd341', '#ff6b5a', '#0e2d55', '#ffc93c', '#ffd84a', '#56c7ff', '#ff8a3d', '#b07cff', '#ff8fc7', '#2ec4b6', '#23272f'];
const BIKES = ['#9bd341', '#56c7ff', '#ff6b5a', '#b07cff', '#ff8fc7', '#ffffff'];
const BELLS = ['🔔', '📯', '🛎️', '🦆'];
/* tienda: se compra con hojas verdes. clave -> índice -> [precio, nombre] */
const SHOP = {
  shirt: { 10: [20, 'Camiseta turquesa'], 11: [20, 'Camiseta negra'], 12: [25, 'Camiseta roja paisa'] },
  helmet: { 9: [15, 'Casco rosado'], 10: [15, 'Casco turquesa'], 11: [20, 'Casco negro'] },
  bike: { 1: [30, 'Bici azul cielo'], 2: [30, 'Bici coral'], 3: [35, 'Bici morada'], 4: [35, 'Bici rosada'], 5: [40, 'Bici blanca'] },
  bell: { 1: [25, 'Corneta'], 2: [25, 'Campanita'], 3: [30, 'Pato de hule'] }
};
const hojas = () => Math.max(0, (Save.data.stats.leaves | 0) - (Save.data.spent | 0));
const bikeCol = () => Save.data.flags.gold ? '#ffd84a' : BIKES[Save.data.profile.bike | 0] || PAL.vd;
/* ropa que se gana con logros: índice -> [logro, nombre] */
const COSMETIC_REQ = { shirt: { 7: ['aprobado', 'Uniforme EnCicla'], 8: ['dorada', 'Camiseta dorada'], 9: ['postal15', 'Camiseta silletera'] }, helmet: { 5: ['perfecto', 'Casco dorado'], 6: ['maquinista', 'Casco del Metro'], 7: ['ciclorruta', 'Casco cono de ciclovía'], 8: ['oficios', 'Casco todero'] } };
const HAIRS = ['#2a1a10', '#4a2c18', '#7a4a22', '#c9a25a', '#d9d9d9', '#151515'];
const PANTS = ['#2a3b5c', '#3d4a5a', '#5a4632', '#1f2a3a', '#6a7a8a', '#7a3b3b'];

function prect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
function pline(c, x0, y0, x1, y1, col) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); c.fillStyle = col;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  while (n++ < 4000) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function pdisc(c, cx, cy, r, col) { c.fillStyle = col; cx = Math.round(cx); cy = Math.round(cy); for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y) + .5); c.fillRect(cx - w, cy + y, w * 2 + 1, 1); } }
function pring(c, cx, cy, r, col) {
  c.fillStyle = col; cx = Math.round(cx); cy = Math.round(cy); let x = r, y = 0, e = 1 - r;
  while (x >= y) { for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) c.fillRect(cx + a, cy + b, 1, 1); y++; if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; } }
}
function hexLerp(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp(pa >> 8 & 255, pb >> 8 & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
function shade(hex, f) { return f < 0 ? hexLerp(hex, '#000000', -f) : hexLerp(hex, '#ffffff', f); }

const Art = JE.art = {
  cache: new Map(),
  mk(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; fn(x, c); return c; },
  get(key, w, h, fn) { let c = this.cache.get(key); if (!c) { c = this.mk(w, h, fn); this.cache.set(key, c); } return c; },
  map(rows, pal) { const h = rows.length, w = rows[0].length; return this.mk(w, h, x => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const col = pal[rows[j][i]]; if (col) { x.fillStyle = col; x.fillRect(i, j, 1, 1); } } }); },

  /* ---- vista cenital: ciclista mirando al norte (7x12) ---- */
  hand() {
    return this.cache.get('hand') || this.cache.set('hand', this.map([
      '.....kk.........', '....kwwk........', '....kwwk........', '....kwwk........', '....kwwkkk.kk...', '....kwwkwwkwwk..', '.kk.kwwkwwkwwkk.',
      'kwwkkwwwwwwwwwwk', 'kwwwkwwwwwwwwwwk', '.kwwwwwwwwwwwwwk', '..kwwwwwwwwwwwk.', '...kwwwwwwwwwwk.', '....kwwwwwwwwk..', '.....kwwwwwwwk..', '.....kkkkkkkkk..'
    ], { k: '#0a2342', w: '#ffffff' })).get('hand');
  },
  riderTop(shirt, helmet, skin, frame) {
    frame = frame || PAL.vd; const k = 'rt' + shirt + helmet + skin + frame; let c = this.cache.get(k); if (c) return c;
    c = this.map([
      '..bbb..', '..bbb..', '...t...', 'kkkfkkk', '.s.f.s.', '.sCCCs.', '.CHHHC.', '..HHH..', '..CCC..', '...f...', '...t...', '...t...'
    ], { b: frame === PAL.vd ? '#dfe5ec' : '#fff3a0', t: '#141821', k: '#2b2f38', f: frame, s: skin, C: shirt, H: helmet });
    this.cache.set(k, c); return c;
  },
  bikeTop() { return this.get('bt', 3, 8, x => { prect(x, 1, 0, 1, 2, '#141821'); prect(x, 0, 2, 3, 1, '#2b2f38'); prect(x, 1, 3, 1, 3, PAL.vd); prect(x, 1, 6, 1, 2, '#141821'); }); },
  carTop(col, kind) {
    const k = 'ct' + col + kind; let c = this.cache.get(k); if (c) return c;
    if (kind === 'bus') {
      c = this.mk(8, 26, x => {
        prect(x, 0, 0, 8, 26, col); prect(x, 1, 1, 6, 2, '#1d2c44'); prect(x, 1, 4, 6, 20, shade(col, .25));
        for (let i = 0; i < 6; i++) prect(x, 0, 5 + i * 3, 1, 2, '#1d2c44'), prect(x, 7, 5 + i * 3, 1, 2, '#1d2c44');
        prect(x, 0, 13, 8, 1, '#222'); prect(x, 1, 24, 6, 1, PAL.cor);
      });
    } else {
      c = this.mk(6, 11, x => {
        prect(x, 1, 0, 4, 1, col); prect(x, 0, 1, 6, 9, col); prect(x, 1, 10, 4, 1, col);
        prect(x, 1, 2, 4, 2, '#1d2c44'); prect(x, 1, 4, 4, 3, shade(col, .22)); prect(x, 1, 7, 4, 1, '#1d2c44');
        prect(x, 0, 0, 1, 1, '#fff6c0'); prect(x, 5, 0, 1, 1, '#fff6c0'); prect(x, 0, 10, 1, 1, PAL.cor); prect(x, 5, 10, 1, 1, PAL.cor);
        if (kind === 'taxi') { prect(x, 2, 5, 2, 1, '#222'); }
      });
    }
    this.cache.set(k, c); return c;
  },
  truckTop(load, cap) {
    const lv = Math.round(clamp(load / Math.max(1, cap), 0, 1) * 6); const k = 'tt' + lv; let c = this.cache.get(k); if (c) return c;
    c = this.mk(11, 24, x => {
      prect(x, 1, 0, 9, 1, '#e8eef4'); prect(x, 0, 1, 11, 6, '#f4f7fa'); prect(x, 1, 2, 9, 2, '#1d2c44'); prect(x, 0, 5, 11, 1, PAL.vd);
      prect(x, 0, 7, 11, 1, '#2b2f38'); prect(x, 0, 8, 11, 16, '#cfd8e2'); prect(x, 1, 9, 9, 14, '#8d99a8');
      for (let i = 0; i < lv; i++) { prect(x, 2, 10 + i * 2, 7, 1, PAL.vd); prect(x, 2, 10 + i * 2, 1, 1, '#141821'); prect(x, 8, 10 + i * 2, 1, 1, '#141821'); }
      prect(x, 0, 8, 1, 16, PAL.vd); prect(x, 10, 8, 1, 16, PAL.vd); prect(x, 0, 23, 11, 1, PAL.cor);
    });
    this.cache.set(k, c); return c;
  },
  trainCar() { return this.get('train', 6, 16, x => { prect(x, 0, 0, 6, 16, '#e6e9ee'); prect(x, 1, 1, 4, 14, '#c3c9d2'); for (let i = 0; i < 4; i++) prect(x, 0, 2 + i * 4, 6, 1, '#1d2c44'); prect(x, 0, 0, 6, 1, PAL.vd); prect(x, 0, 15, 6, 1, PAL.vd); }); },

  /* ---- vista lateral ---- */
  person(c, x, y, p, ph = 0, face = -1) {
    c.save(); c.translate(Math.round(x), Math.round(y)); if (face > 0) c.scale(-1, 1);
    const kid = p.kid, H = kid ? .72 : 1, legH = Math.round(6 * H), torso = Math.round(7 * H), headY = -legH - torso - 5;
    const step = Math.floor(ph * 4) % 2;
    // piernas
    prect(c, -2 + (step ? -1 : 0), -legH, 2, legH, p.pants); prect(c, 0 + (step ? 1 : 0), -legH, 2, legH, shade(p.pants, -.18));
    prect(c, -2 + (step ? -1 : 0), -1, 2, 1, '#111'); prect(c, 0 + (step ? 1 : 0), -1, 2, 1, '#111');
    // mochila
    if (p.bag) prect(c, 2, -legH - torso + 1, 2, torso - 2, p.bag);
    // torso + brazo
    prect(c, -3, -legH - torso, 5, torso, p.shirt); prect(c, -4, -legH - torso + 2, 1, torso - 3, p.shirt); prect(c, -4, -legH - 2, 1, 1, p.skin);
    if (p.vest) { prect(c, -3, -legH - torso + 1, 5, 1, PAL.vd); prect(c, -3, -legH - 3, 5, 1, PAL.vd); }
    // cabeza
    prect(c, -3, headY, 5, 5, p.skin); prect(c, -3, headY + 2, 1, 1, '#141414');
    if (p.hairStyle === 0) prect(c, -2, headY - 1, 5, 2, p.hair), prect(c, 1, headY, 1, 3, p.hair);
    else if (p.hairStyle === 1) prect(c, -2, headY - 1, 5, 2, p.hair), prect(c, 1, headY, 2, 6, p.hair);
    else if (p.hairStyle === 2) prect(c, -3, headY - 1, 6, 2, p.cap || PAL.az2), prect(c, -5, headY, 3, 1, p.cap || PAL.az2);
    else prect(c, 0, headY - 1, 3, 1, p.hair);
    if (p.glasses) prect(c, -3, headY + 2, 2, 1, '#333');
    if (p.cane) pline(c, -6, 0, -5, -legH - 2, '#7a5230');
    c.restore();
  },
  bikeSide(c, x, y, o = {}) {
    const r = o.r || 4, s = r / 4; x = Math.round(x); y = Math.round(y);
    c.save(); c.translate(x, y); if (o.face > 0) c.scale(-1, 1);
    const fx = Math.round(-7 * s), rx = Math.round(7 * s), hy = -r, fr = o.col || PAL.vd, d = o.dmg || {};
    const wheel = (wx, flat) => { pring(c, wx, hy, r, '#151a22'); if (r > 3) pring(c, wx, hy, r - 1, '#3b4250'); prect(c, wx, hy, 1, 1, '#aab'); if (flat) prect(c, wx - r + 1, -1, r * 2 - 1, 1, '#151a22'); };
    wheel(fx, d.llanta === 'f' || d.desinflada === 'f'); wheel(rx, d.llanta === 'r' || d.desinflada === 'r');
    const seatX = Math.round(2 * s), seatY = Math.round(-9 * s - (r > 6 ? 2 : 0)), headX = Math.round(-5 * s), bb = 0;
    pline(c, rx, hy, seatX, seatY + 1, fr); pline(c, seatX, seatY + 1, bb, hy, fr); pline(c, bb, hy, rx, hy, fr);
    pline(c, seatX, seatY + 1, headX, seatY + 1, fr); pline(c, headX, seatY + 1, bb, hy, fr); pline(c, headX, seatY + 1, fx, hy, '#c9d1da');
    // sillín, manubrio, canasta, guardabarros
    if (d.sillin) pline(c, seatX - 2 * s, seatY - 2 * s, seatX + 2 * s, seatY, '#222'); else prect(c, seatX - Math.round(2 * s), seatY, Math.round(5 * s), Math.max(1, Math.round(s)), '#222');
    prect(c, headX - 1, seatY - Math.round(2 * s), Math.max(2, Math.round(3 * s)), Math.max(1, Math.round(s)), '#2b2f38');
    prect(c, fx - Math.round(3 * s), seatY - Math.round(1 * s), Math.round(5 * s), Math.round(3 * s), '#dfe5ec');
    if (s >= 1.5) for (let i = 0; i < 3; i++) prect(c, fx - Math.round(3 * s) + 1 + i * Math.round(1.6 * s), seatY - Math.round(s) + 1, 1, Math.round(3 * s) - 1, '#9aa7b8');
    prect(c, fx - Math.round(4 * s), seatY + Math.round(1 * s), 1, 1, d.luz ? '#552' : '#fff3a0');
    // cadena
    if (d.cadena) { for (let i = 0; i < 6 * s; i += 2) prect(c, bb + i, hy + 2 + (i % 4 ? 1 : 0), 1, 1, PAL.amb); }
    else pline(c, bb, hy + 1, rx, hy + 1, '#59606c');
    if (d.freno) prect(c, headX - 2, seatY - 2 * s, 1, 3, PAL.cor);
    c.restore();
  },
  bikeFront(c, x, y, st = 'ok', lean = 0) {
    x = Math.round(x + lean); y = Math.round(y);
    prect(c, x, y - 9, 1, 9, '#151a22'); prect(c, x - 1, y - 5, 1, 1, '#151a22'); prect(c, x + 1, y - 5, 1, 1, '#151a22');
    pline(c, x - 1, y - 11, x, y - 6, PAL.vd); pline(c, x + 1, y - 11, x, y - 6, PAL.vd);
    prect(c, x - 3 + Math.round(lean / 2), y - 12, 7, 1, '#2b2f38'); prect(c, x - 2 + Math.round(lean / 2), y - 15, 5, 3, '#dfe5ec'); prect(c, x - 1 + Math.round(lean / 2), y - 14, 1, 1, '#9aa7b8'); prect(c, x + 1 + Math.round(lean / 2), y - 14, 1, 1, '#9aa7b8');
    prect(c, x, y - 11, 1, 1, st === 'bad' ? '#552' : '#fff3a0');
  },
  truckSide(c, x, y, load = 0, face = 1) {
    c.save(); c.translate(Math.round(x), Math.round(y)); if (face < 0) c.scale(-1, 1);
    prect(c, -24, -16, 34, 13, '#e9eef3'); prect(c, -24, -9, 34, 2, PAL.vd); prect(c, -24, -16, 34, 1, '#cfd8e2');
    for (let i = 0; i < Math.min(8, load); i++) prect(c, -22 + i * 4, -14, 1, 4, '#2b2f38'), prect(c, -23 + i * 4, -12, 3, 1, PAL.vd);
    prect(c, 10, -14, 11, 11, '#f4f7fa'); prect(c, 15, -12, 5, 4, '#1d2c44'); prect(c, 10, -8, 11, 2, PAL.vd); prect(c, 20, -5, 2, 1, '#fff3a0');
    prect(c, -24, -4, 46, 1, '#59606c');
    for (const wx of [-16, 14]) { pdisc(c, wx, -2, 3, '#151a22'); prect(c, wx, -2, 1, 1, '#aab'); }
    c.restore();
  },
  booth(c, x, y, w, h) {
    prect(c, x, y - h, w, h, '#e9eef3'); prect(c, x - 2, y - h - 4, w + 4, 5, PAL.vd); prect(c, x - 2, y - h - 4, w + 4, 1, PAL.vd1);
    prect(c, x + 3, y - h + 4, w - 6, Math.round(h * .42), '#1d2c44'); prect(c, x, y - Math.round(h * .45), w, 2, PAL.az2);
    prect(c, x + 2, y - h - 3, w - 4, 3, PAL.az);
  },
  mood(c, x, y, f) {
    const col = f > .55 ? PAL.vd : f > .25 ? PAL.amb : PAL.cor;
    pdisc(c, x, y, 3, col); prect(c, x - 1, y - 1, 1, 1, '#1a1a1a'); prect(c, x + 1, y - 1, 1, 1, '#1a1a1a');
    if (f > .55) { prect(c, x - 1, y + 1, 3, 1, '#1a1a1a'); prect(c, x - 2, y, 1, 1, '#1a1a1a'); prect(c, x + 2, y, 1, 1, '#1a1a1a'); }
    else if (f > .25) prect(c, x - 1, y + 1, 3, 1, '#1a1a1a');
    else { prect(c, x - 1, y + 2, 3, 1, '#1a1a1a'); prect(c, x - 2, y + 1, 1, 1, '#1a1a1a'); prect(c, x + 2, y + 1, 1, 1, '#1a1a1a'); }
  },
  randPerson(rng) {
    const kid = rng.chance(.15), old = !kid && rng.chance(.18);
    return {
      kid, skin: rng.pick(SKINS), hair: old ? '#d9d9d9' : rng.pick(HAIRS), hairStyle: rng.i(0, 3), cap: rng.pick([PAL.cor, PAL.az2, PAL.amb, '#fff']),
      shirt: rng.pick(['#ff6b5a', '#56c7ff', '#ffc93c', '#ffffff', '#b07cff', '#ff8fc7', '#7fd1b9', '#f08a4b', '#6a7cff']), pants: rng.pick(PANTS),
      bag: !old && rng.chance(.35) ? rng.pick(['#2a5a92', '#7a3b3b', '#3d6b3a', '#222']) : null, cane: old && rng.chance(.5), glasses: old || rng.chance(.12)
    };
  },

  /* ---- cielo según la hora ---- */
  sky(min) {
    const K = [[0, '#061733', '#13325e'], [330, '#061733', '#13325e'], [400, '#3a5b96', '#f6b27a'], [470, '#4fb0e8', '#cdeeff'], [1020, '#4fb0e8', '#cdeeff'], [1100, '#3b4c8a', '#ff9a5a'], [1170, '#0b2047', '#2b3f74'], [1440, '#061733', '#13325e']];
    min = ((min % 1440) + 1440) % 1440;
    for (let i = 0; i < K.length - 1; i++) if (min >= K[i][0] && min <= K[i + 1][0]) { const t = (min - K[i][0]) / (K[i + 1][0] - K[i][0]); return [hexLerp(K[i][1], K[i + 1][1], t), hexLerp(K[i][2], K[i + 1][2], t)]; }
    return ['#061733', '#13325e'];
  },
  night(min) { min = ((min % 1440) + 1440) % 1440; if (min < 330 || min > 1170) return 1; if (min < 420) return 1 - (min - 330) / 90; if (min > 1080) return (min - 1080) / 90; return 0; },
  /* panorámica del valle: cielo, montañas, comunas, metro */
  panorama(vw, vh, min, horizon) {
    const bucket = Math.floor(min / 20); const key = 'pano' + vw + 'x' + vh + ':' + bucket + ':' + horizon;
    let c = this.cache.get(key); if (c) return c;
    for (const k of this.cache.keys()) if (k.startsWith('pano')) this.cache.delete(k);
    c = this.mk(vw, vh, x => {
      const [t, b] = this.sky(min), n = this.night(min);
      for (let y = 0; y < horizon; y++) prect(x, 0, y, vw, 1, hexLerp(t, b, y / horizon));
      if (n > .5) for (let i = 0; i < 40; i++) prect(x, Math.floor(h2(i, 1) * vw), Math.floor(h2(i, 2) * horizon * .6), 1, 1, '#ffffff' + (h2(i, 3) > .5 ? 'cc' : '66'));
      else { const sx = vw * (.15 + .7 * clamp((min - 360) / 720, 0, 1)); pdisc(x, sx, horizon * .28, 5, '#fff3c4'); }
      // montañas lejanas y cercanas
      const far = hexLerp('#3c6e8f', '#13284a', n), near = hexLerp('#3f7d4a', '#10233d', n);
      for (let i = 0; i < vw; i++) {
        const hf = horizon * (.42 + .16 * Math.sin(i / 23) + .07 * Math.sin(i / 7.3 + 1)); prect(x, i, hf, 1, horizon - hf, far);
        const hn = horizon * (.62 + .1 * Math.sin(i / 23 + 2) + .035 * Math.sin(i / 9.1)); prect(x, i, hn, 1, horizon - hn + 1, near);
        // casitas de ladrillo de las comunas
        for (let j = Math.ceil(hn) + 3; j < horizon - 2; j += 2) if (i % 2 === 0 && h2(i, j, 7) < .55 * (j - hn) / (horizon - hn)) {
          prect(x, i, j, 2, 1, n > .45 ? (h2(i, j, 9) < .3 ? '#ffd76a' : '#1b2a44') : (h2(i, j, 8) < .7 ? '#b9653f' : '#d8d2c4'));
        }
      }
      // skyline con la aguja del Coltejer
      const sk = hexLerp('#6f8fae', '#1b2c4a', n);
      for (let i = 0; i < vw; i += 5) { const hh = 4 + Math.floor(h2(i, 4) * 10); prect(x, i, horizon - hh, 4, hh, sk); if (n > .45) prect(x, i + 1, horizon - hh + 2, 1, 1, '#ffe08a'); }
      const cx = Math.floor(vw * .62); prect(x, cx, horizon - 22, 4, 22, sk); pline(x, cx, horizon - 22, cx + 2, horizon - 30, sk); pline(x, cx + 3, horizon - 22, cx + 2, horizon - 30, sk);
      // viaducto del metro
      prect(x, 0, horizon - 8, vw, 3, hexLerp('#c9ccd1', '#4a5468', n)); prect(x, 0, horizon - 5, vw, 1, '#0004');
      for (let i = 6; i < vw; i += 22) prect(x, i, horizon - 5, 3, 5, hexLerp('#aab0b8', '#36405a', n));
    });
    this.cache.set(key, c); return c;
  },

  /* ---- íconos 16x16 ---- */
  icon(name) {
    return this.get('ic_' + name, 16, 16, x => {
      const L = (a, b, c2, d, col) => pline(x, a, b, c2, d, col), R = (a, b, w, h, col) => prect(x, a, b, w, h, col);
      switch (name) {
        case 'usuario': pring(x, 4, 11, 3, '#fff'); pring(x, 12, 11, 3, '#fff'); L(4, 11, 8, 7, PAL.vd); L(8, 7, 12, 11, PAL.vd); L(6, 7, 11, 7, PAL.vd); L(8, 7, 4, 11, PAL.vd); R(5, 6, 3, 1, '#fff'); R(11, 5, 3, 2, '#dfe5ec'); R(7, 1, 3, 3, PAL.amb); R(7, 4, 2, 2, PAL.vd); break;
        case 'anfitrion': R(1, 4, 14, 9, '#fff'); R(1, 4, 14, 2, PAL.vd); R(3, 8, 3, 2, PAL.amb); R(8, 8, 5, 1, PAL.az3); R(8, 10, 4, 1, PAL.az3); break;
        case 'mecanico': L(3, 13, 11, 5, '#d6dde6'); L(4, 13, 12, 5, '#d6dde6'); R(10, 2, 2, 2, '#d6dde6'); R(13, 4, 2, 2, '#d6dde6'); R(12, 3, 1, 1, '#d6dde6'); R(2, 12, 3, 3, PAL.vd); break;
        case 'bodega': R(2, 5, 12, 9, '#b07a46'); R(2, 5, 12, 2, '#d39a5c'); R(7, 5, 2, 9, '#e8d9b0'); L(5, 2, 8, 0, PAL.vd); L(8, 0, 11, 2, PAL.vd); R(8, 0, 1, 4, PAL.vd); break;
        case 'apoyo': R(5, 4, 7, 11, '#2b2f38'); R(6, 6, 5, 3, PAL.vd); R(10, 0, 1, 4, '#2b2f38'); R(6, 10, 1, 1, '#fff'); R(8, 10, 1, 1, '#fff'); R(6, 12, 1, 1, '#fff'); R(8, 12, 1, 1, '#fff'); R(1, 6, 2, 1, PAL.cie); R(0, 8, 2, 1, PAL.cie); break;
        case 'tecnico': L(9, 1, 5, 8, PAL.amb); L(5, 8, 10, 8, PAL.amb); L(10, 8, 6, 15, PAL.amb); L(10, 1, 6, 8, PAL.amb); R(1, 12, 5, 2, '#d6dde6'); R(0, 12, 1, 2, PAL.cor); break;
        case 'balance': this.truckSide(x, 13, 14, 3, 1); break;
        case 'monitoreo': R(1, 2, 14, 10, '#d6dde6'); R(2, 3, 12, 8, PAL.az2); R(4, 5, 2, 2, PAL.vd); R(9, 4, 2, 2, PAL.cor); R(7, 8, 2, 2, PAL.amb); R(6, 12, 4, 2, '#9aa7b8'); R(4, 14, 8, 1, '#9aa7b8'); break;
        case 'supervisor': pdisc(x, 8, 8, 6, PAL.amb); pdisc(x, 8, 8, 4, PAL.az2); R(7, 4, 2, 8, PAL.amb); R(4, 7, 8, 2, PAL.amb); R(7, 7, 2, 2, '#fff'); break;
        case 'parche': R(3, 3, 10, 10, PAL.cor); R(4, 4, 8, 8, '#ff9488'); R(5, 7, 6, 2, '#fff'); R(7, 5, 2, 6, '#fff'); break;
        case 'bomba': R(6, 4, 4, 11, PAL.cie); R(7, 5, 2, 9, '#a6e3ff'); R(3, 2, 10, 2, '#2b2f38'); R(7, 1, 2, 2, '#2b2f38'); R(10, 12, 4, 1, '#2b2f38'); break;
        case 'cadena': for (let i = 0; i < 4; i++) { pring(x, 3 + i * 3, 8 + (i % 2 ? -1 : 1), 2, PAL.amb); } break;
        case 'llave': L(3, 13, 10, 6, '#fff'); L(4, 13, 11, 6, '#fff'); R(10, 3, 4, 4, '#fff'); R(11, 4, 2, 2, PAL.az1); break;
        case 'allen': R(4, 2, 3, 10, PAL.vd); R(4, 10, 9, 3, PAL.vd); R(5, 3, 1, 8, PAL.vd1); break;
        case 'luz': pdisc(x, 8, 6, 4, PAL.amb); R(6, 10, 4, 3, '#9aa7b8'); R(7, 13, 2, 1, '#9aa7b8'); R(7, 4, 1, 2, '#fff'); break;
        case 'llanta': pring(x, 8, 8, 6, '#151a22'); pring(x, 8, 8, 5, '#3b4250'); pring(x, 8, 8, 4, '#151a22'); R(8, 8, 1, 1, '#d6dde6'); L(8, 3, 8, 13, '#9aa7b8'); L(3, 8, 13, 8, '#9aa7b8'); break;
        case 'sillin': R(2, 5, 12, 3, '#2b2f38'); R(3, 4, 7, 1, '#2b2f38'); R(7, 8, 2, 6, '#9aa7b8'); break;
        case 'freno': R(3, 3, 3, 10, PAL.cor); R(10, 3, 3, 10, PAL.cor); R(5, 7, 6, 2, '#d6dde6'); break;
        case 'caja': R(1, 4, 14, 10, '#c48a52'); R(1, 4, 14, 2, '#e0aa6c'); pring(x, 5, 10, 2, '#5a3a1a'); pring(x, 11, 10, 2, '#5a3a1a'); L(5, 10, 8, 8, PAL.vd); L(8, 8, 11, 10, PAL.vd); break;
        case 'malo': R(2, 2, 12, 12, '#3a1f22'); L(4, 4, 11, 11, PAL.cor); L(4, 11, 11, 4, PAL.cor); L(5, 4, 12, 11, PAL.cor); L(5, 11, 12, 4, PAL.cor); break;
        case 'hoja': L(3, 13, 12, 3, PAL.vd2); pdisc(x, 8, 8, 4, PAL.vd); L(4, 12, 11, 4, PAL.vd2); R(9, 5, 2, 1, PAL.vd1); break;
        case 'estrella': R(7, 1, 2, 14, PAL.amb); R(1, 6, 14, 3, PAL.amb); R(4, 4, 8, 8, PAL.amb); R(3, 11, 3, 3, PAL.amb); R(10, 11, 3, 3, PAL.amb); break;
        case 'timbre': pdisc(x, 8, 8, 5, '#d6dde6'); pdisc(x, 8, 8, 3, '#aab4c0'); R(7, 2, 2, 2, '#9aa7b8'); R(12, 8, 3, 2, '#2b2f38'); break;
        case 'pin': pdisc(x, 8, 6, 5, PAL.vd); pdisc(x, 8, 6, 2, PAL.az); L(5, 9, 8, 15, PAL.vd); L(11, 9, 8, 15, PAL.vd); R(7, 10, 3, 3, PAL.vd); break;
        case 'estacion': R(1, 3, 14, 3, PAL.vd); for (let i = 0; i < 4; i++) { R(3 + i * 3, 7, 1, 7, '#fff'); } R(1, 14, 14, 1, '#9aa7b8'); break;
      }
    });
  },
  iconURL(name, scale = 3) { const k = 'url' + name + scale; let u = this.cache.get(k); if (u) return u; const ic = this.icon(name); const c = this.mk(16 * scale, 16 * scale, x => { x.imageSmoothingEnabled = false; x.drawImage(ic, 0, 0, 16 * scale, 16 * scale); }); u = c.toDataURL(); this.cache.set(k, u); return u; },

  /* ---- escena de portada (animada) ---- */
  cover(x, w, h, t) {
    const hor = Math.floor(h * .72), min = 1125; // atardecer paisa
    x.drawImage(this.panorama(w, h, min, hor), 0, 0);
    // tren del metro pasando
    const tx = ((t * 18) % (w + 60)) - 60; for (let i = 0; i < 3; i++) { prect(x, tx + i * 17, hor - 12, 16, 4, '#e6e9ee'); prect(x, tx + i * 17, hor - 11, 16, 1, '#1d2c44'); prect(x, tx + i * 17, hor - 9, 16, 1, PAL.vd); }
    // calle y ciclorruta
    prect(x, 0, hor, w, h - hor, '#3b4250'); prect(x, 0, hor, w, 3, '#b7b3a6'); prect(x, 0, hor + 3, w, 7, '#5e9a1e'); prect(x, 0, hor + 3, w, 1, PAL.vd);
    for (let i = (-(t * 40) % 10 + 10) % 10 - 10; i < w; i += 10) prect(x, i, hor + 6, 5, 1, '#e8f5d0');
    for (let i = (-(t * 60) % 16 + 16) % 16 - 16; i < w; i += 16) prect(x, i, hor + 15, 8, 1, '#c9ccd1');
    // ciclista
    const cxp = Math.round(w * .5), cy = hor + 9, ph = t * 2;
    const P = Save.data ? Save.data.profile : { skin: 1, shirt: 0, helmet: 0 };
    this.bikeSide(x, cxp, cy, { r: 5, face: 1, col: Save.data ? bikeCol() : PAL.vd });
    const sk = SKINS[P.skin] || SKINS[1], sh = SHIRTS[P.shirt] || PAL.vd, he = HELMETS[P.helmet] || '#fff';
    const lx = Math.round(Math.sin(ph * 6) * 2);
    prect(x, cxp - 1 + lx, cy - 9, 2, 5, PAL.az2); prect(x, cxp - 1 - lx, cy - 9, 2, 5, '#1d2c44');
    prect(x, cxp - 2, cy - 17, 5, 8, sh); pline(x, cxp + 2, cy - 15, cxp + 5, cy - 12, sk);
    prect(x, cxp - 1, cy - 22, 5, 5, sk); prect(x, cxp - 2, cy - 24, 7, 3, he); prect(x, cxp + 3, cy - 20, 1, 1, '#141414');
  }
};
