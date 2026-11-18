/* =====================================================================
   EL SISTEMA METRO COMO EN «EL METRO» (v1.7.1): trenes, tranvía, Metroplús, Metrocable y sus estaciones con los
   diseños del videojuego El Metro (repo metrozero: 21-sprites.js, 35-ciudad.js y 11-puentes.js), pasados a la
   escala de Juega EnCicla (1 m = 1,6 px) y a su cámara 3D. Colores y medidas en metros, como allá.
   ===================================================================== */
const PXM = TS / (VM.tile || 10);   // px del mundo por metro
const mulC = (h, f) => { const n = parseInt(h.slice(1, 7), 16), r = clamp(Math.round((n >> 16) * f), 0, 255), g = clamp(Math.round((n >> 8 & 255) * f), 0, 255), b = clamp(Math.round((n & 255) * f), 0, 255); return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1); };
const SIS = {
  metro: { carL: 22, W: 3, n: 3, plat: 110 }, tram: { carL: 19.5, W: 3, n: 2, plat: 50, col: '#59AB42' }, brt: { L: 18, W: 2.5, plat: 30 }, cable: { L: 2.6, W: 2.2, z: 14, torre: 260, sep: 60 }
};
const SisSpr = {
  rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); },
  /* vista desde arriba, centrado en el origen y mirando hacia +x (como Spr.veh de El Metro); L y W en px */
  veh(g, kind, L, W, col, o = {}) {
    const dark = '#141414', glass = o.night ? '#263a4d' : '#1f2e3d', glassL = o.night ? '#355068' : '#2f4a60', R = this.rr;
    if (kind === 'cable') {
      g.fillStyle = dark; R(g, -L / 2 - .4, -W / 2 - .4, L + .8, W + .8, 1.2); g.fillStyle = col; R(g, -L / 2, -W / 2, L, W, .9);
      g.fillStyle = glassL; g.fillRect(-L * .34, -W * .34, L * .68, W * .68); g.fillStyle = col; g.fillRect(-L * .12, -W * .5, L * .24, W);
      g.fillStyle = dark; g.fillRect(-.6, -.6, 1.2, 1.2); return;
    }
    const bus = kind === 'brt', rail = kind === 'metro' || kind === 'tram', u = Math.max(.35, W * .12);
    g.fillStyle = dark; R(g, -L / 2 - .45, -W / 2 - .45, L + .9, W + .9, .9);
    const body = rail ? (kind === 'metro' ? '#e9ecef' : '#eef2ee') : col; g.fillStyle = body; R(g, -L / 2, -W / 2, L, W, .7);
    if (bus) {   // articulado: dos secciones y fuelle
      const j = -L * .14; g.fillStyle = '#2a2a2a'; g.fillRect(j - L * .035, -W / 2 - .4, L * .07, W + .8); g.fillStyle = '#1a1a1a'; for (let x = j - L * .03; x < j + L * .035; x += .8) g.fillRect(x, -W / 2, .4, W);
      g.fillStyle = mulC(body, 1.08); g.fillRect(-L / 2 + L * .06, -W * .18, L * .88, W * .36);   // techo
      g.fillStyle = '#f4f1ea'; g.fillRect(-L / 2 + .4, -W / 2 + .4, L - .8, u); g.fillRect(-L / 2 + .4, W / 2 - .4 - u, L - .8, u);
      g.fillStyle = glass; const n = Math.max(3, Math.floor(L / 3)); for (let i = 0; i < n; i++) { const x = -L / 2 + L * .1 + i * (L * .82 / n); if (Math.abs(x + L * .14) < L * .05) continue; g.fillRect(x, -W / 2 + .4, L * .82 / n * .62, u); g.fillRect(x, W / 2 - .4 - u, L * .82 / n * .62, u); }
      g.fillStyle = glass; g.fillRect(L / 2 - Math.max(.9, L * .07), -W / 2 + .4, Math.max(.9, L * .07), W - .8);   // parabrisas
      g.fillStyle = glassL; g.fillRect(-L / 2 + .4, -W / 2 + .4, Math.max(.6, L * .04), W - .8);
      g.fillStyle = '#9aa0a6'; g.fillRect(-L * .3, -W * .1, L * .08, W * .2); g.fillRect(L * .12, -W * .1, L * .08, W * .2);
      g.fillStyle = '#ffb000'; g.fillRect(L / 2 - Math.max(.9, L * .07) - .4, -W * .22, .6, W * .44);   // letrero
      if (o.lights) { g.fillStyle = '#fff6c0'; g.fillRect(L / 2 - .6, -W / 2 + .4, .6, W * .2); g.fillRect(L / 2 - .6, W / 2 - .4 - W * .2, .6, W * .2); }
      return;
    }
    const st = Math.max(.4, W * .14);
    g.fillStyle = col; g.fillRect(-L / 2 + .4, -W / 2 + .4, L - .8, st); g.fillRect(-L / 2 + .4, W / 2 - .4 - st, L - .8, st);   // franja de la línea
    g.fillStyle = '#c9ced4'; g.fillRect(-L / 2 + L * .08, -W * .16, L * .84, W * .32);   // techo central (equipos)
    g.fillStyle = '#aeb4ba'; for (let i = 0; i < 3; i++) g.fillRect(-L * .3 + i * L * .3, -W * .1, L * .12, W * .2);
    g.fillStyle = glass; const n = Math.max(4, Math.floor(L / 2.4)), wv = Math.max(.35, W * .1); for (let i = 0; i < n; i++) { const x = -L / 2 + L * .06 + i * (L * .88 / n); g.fillRect(x, -W / 2 + .4 + st, L * .88 / n * .55, wv); g.fillRect(x, W / 2 - .4 - st - wv, L * .88 / n * .55, wv); }
    const e = Math.max(.9, L * .06), lw = Math.max(.4, W * .18);
    if (o.end === 'front' || o.end === 'both') { g.fillStyle = glass; g.fillRect(L / 2 - e, -W / 2 + .4, e, W - .8); g.fillStyle = '#fff6c0'; g.fillRect(L / 2 - .6, -W / 2 + .4, .6, lw); g.fillRect(L / 2 - .6, W / 2 - .4 - lw, .6, lw); }
    if (o.end === 'back' || o.end === 'both') { g.fillStyle = glass; g.fillRect(-L / 2 + .4, -W / 2 + .4, e, W - .8); g.fillStyle = '#ff3b2f'; g.fillRect(-L / 2 + .4, -W / 2 + .4, .6, lw); g.fillRect(-L / 2 + .4, W / 2 - .4 - lw, .6, lw); }
    if (kind === 'tram') { g.fillStyle = dark; g.fillRect(-L * .04, -W * .4, L * .08, W * .8); g.fillRect(-L * .02, -W * .5, L * .04, W); }   // pantógrafo
  },
  cache: new Map(),
  /* el sprite en caché (4× para que gire nítido) */
  img(kind, col, L, W, end, night) {
    const k = kind + col + (L | 0) + (W * 10 | 0) + (end || '') + (night ? 'n' : ''); let c = this.cache.get(k); if (c) return c;
    const m = 1.2, S = 4; c = Art.mk(Math.ceil((L + m * 2) * S), Math.ceil((W + m * 2) * S), x => { x.scale(S, S); x.translate(m + L / 2, m + W / 2); this.veh(x, kind, L, W, col, { end, night, lights: night }); });
    c.m = m; this.cache.set(k, c); return c;
  },
  /* dibuja un vehículo en (x, y) con rumbo a; f escala (altura en perspectiva) */
  dib(c, kind, col, L, W, x, y, a, f, end, night) { const I = this.img(kind, col, L, W, end, night), m = I.m; c.save(); c.translate(x, y); c.rotate(a); if (f && f !== 1) c.scale(f, f); c.drawImage(I, -L / 2 - m, -W / 2 - m, L + m * 2, W + m * 2); c.restore(); }
};
/* una franja que sigue la polilínea P entre s0 y s1, de o0 a o1 px de lado, a la altura z (con la perspectiva PX/PY) */
function sisBanda(c, M, P, s0, s1, o0, o1, z, PX, PY) {
  const n = Math.max(2, Math.ceil((s1 - s0) / 6)); c.beginPath();
  for (let i = 0; i <= n; i++) { const q = M.at(P, s0 + (s1 - s0) * i / n, o0); i ? c.lineTo(PX(q.x, q.y, z), PY(q.x, q.y, z)) : c.moveTo(PX(q.x, q.y, z), PY(q.x, q.y, z)); }
  for (let i = n; i >= 0; i--) { const q = M.at(P, s0 + (s1 - s0) * i / n, o1); c.lineTo(PX(q.x, q.y, z), PY(q.x, q.y, z)); }
  c.closePath();
}
/* un muro vertical a lo largo de la línea (lado off), de z0 a z1, solo los tramos que miran a la cámara */
function sisMuro(c, M, P, s0, s1, off, z0, z1, ox, oy, px, py, PX, PY) {
  const n = Math.max(1, Math.ceil((s1 - s0) / 6)); let prev = M.at(P, s0, off);
  for (let i = 1; i <= n; i++) {
    const q = M.at(P, s0 + (s1 - s0) * i / n, off), nx = -Math.sin(q.a) * Math.sign(off), ny = Math.cos(q.a) * Math.sign(off), mx = (prev.x + q.x) / 2 - ox, my = (prev.y + q.y) / 2 - oy;
    if (nx * (px - mx) + ny * (py - my) > 0) { c.beginPath(); c.moveTo(PX(prev.x, prev.y, z0), PY(prev.x, prev.y, z0)); c.lineTo(PX(q.x, q.y, z0), PY(q.x, q.y, z0)); c.lineTo(PX(q.x, q.y, z1), PY(q.x, q.y, z1)); c.lineTo(PX(prev.x, prev.y, z1), PY(prev.x, prev.y, z1)); c.closePath(); c.fill(); }
    prev = q;
  }
}
/* ---------- Metroplús por su corredor real y en sus andenes reales (como en El Metro 1.3; datos de OSM vía metrozero) ---------- */
CityMap.mpReal = function () {
  const R = typeof MP_REAL !== 'undefined' && MP_REAL; if (!R) return; this.mpRealN = 0;
  for (const P of this.mp || []) {
    const C = R.corredores && R.corredores[P.id];
    if (C && C.length > 8) { const pts = []; for (let i = 0; i + 1 < C.length; i += 2) pts.push({ x: C[i] * PXM, y: C[i + 1] * PXM }); const N = this.poly(pts); P.pts = N.pts; P.cum = N.cum; P.len = N.len; P.osm = 1; }
    const A = R.andenes && R.andenes[P.id]; if (A) for (const st of P.st) { const q = A[st.name]; if (q) { st.px = q[0] * PXM; st.py = q[1] * PXM; this.mpRealN++; } }
    for (const st of P.st) st.s = this.project(P, st.px, st.py).s;
  }
};
/* ---------- buses articulados del Metroplús, con el dibujo de El Metro: van por su carril y paran en cada andén ---------- */
Ride.prototype.updBrt = function (dt) {
  const M = this.map; if (!M.mp || !M.mp.length) return; const Lb = SIS.brt.L * PXM, P = this.p;
  if (!this.brts) { this.brts = []; for (const L of M.mp) for (let i = 0; i < 4; i++) this.brts.push({ L, s: L.len * (i + .5) / 4, dir: i % 2 ? -1 : 1, wait: this.rng.f() * 2 }); }
  for (const b of this.brts) {
    if (b.wait > 0) { b.wait -= dt; continue; }
    const q0 = M.at(b.L, b.s, b.dir * 2.2 * PXM), fx = Math.cos(q0.a) * b.dir, fy = Math.sin(q0.a) * b.dir, dx = P.x - q0.x, dy = P.y - q0.y, al = dx * fx + dy * fy, lat = Math.abs(-dx * fy + dy * fx);
    if (al > 0 && al < Lb / 2 + 22 && lat < 6) continue;   // si el ciclista está delante, el bus espera
    const prev = b.s; b.s += 40 * WK * b.dir * dt;
    for (const st of b.L.st) if ((prev - st.s) * (b.s - st.s) < 0) { b.wait = 2.5; b.s = st.s; }
    if (b.s > b.L.len - Lb / 2) { b.s = b.L.len - Lb / 2; b.dir = -1; b.wait = 3; } if (b.s < Lb / 2) { b.s = Lb / 2; b.dir = 1; b.wait = 3; }
  }
};
const _tr74 = Ride.prototype.updTrains;   // (va con los trenes: 78-ciudad-viva.js reemplaza updLife con la versión de 68-ciudad.js)
Ride.prototype.updTrains = function (dt) { _tr74.call(this, dt); if (GFX() === '3d') this.updBrt(dt); };
const _dg74 = Ride.prototype.drawGround;
Ride.prototype.drawGround = function (b, ox, oy, inV) {
  _dg74.call(this, b, ox, oy, inV); if (GFX() !== '3d' || !this.brts) return; const M = this.map, Lb = SIS.brt.L * PXM, nt = Art.night(this.min) > .5;
  for (const v of this.brts) { const q = M.at(v.L, v.s, v.dir * 2.2 * PXM); if (!inV(q.x, q.y, 40)) continue; SisSpr.dib(b, 'brt', v.L.col, Lb, SIS.brt.W * PXM, q.x - ox, q.y - oy, q.a + (v.dir < 0 ? Math.PI : 0), 1, null, nt); }
};
