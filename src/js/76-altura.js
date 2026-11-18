/* =====================================================================
   LO QUE VA EN ALTO (v1.7): el metro en viaducto con sus estaciones elevadas y los puentes de las vías,
   cada uno a su altura (Overture / OpenStreetMap: is_bridge y level; tools/geo/alturas.py).
   En la ciudad 3D la bici pasa por DEBAJO del viaducto y de los puentes; a un puente se sube por sus
   extremos (si se llega por un lado, se pasa por debajo). En el suelo quedan su sombra y sus pilares.
   ===================================================================== */
const ALT = { mA: .4, mB: .5, techo: .27, grosor: .075, pz: 36, paso: 6 };
const ALT_SL = 21 * MS * 1.55, ALT_SW = 11 * MS * .9;   // medio largo y medio ancho de una estación del metro (como en el dibujo plano)
const altSuave = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const ALT_KV = { 1: [1, 4], 4: [1, 4], 2: [2, 3], 3: [2, 3], 5: [5], 6: [6, 8] };   // tipos de vía del dibujo que puede ser cada puente

Object.assign(CityMap, {
  alturas() {
    this.altG = new Map(); this.decks = []; this.deckG = new Map();
    const A = typeof ALTURAS !== 'undefined' && ALTURAS; if (!A) return;
    const q = A.q || 8, S = CH * TS, CK = (x, y) => Math.floor(x / S) + ',' + Math.floor(y / S), meter = (G, k, o) => (G.get(k) || G.set(k, []).get(k)).push(o);
    // ---- metro: tramos en viaducto de las líneas A y B, con rampas en sus extremos ----
    for (const [L, id, zd, col] of [[this.lineA, 'A', ALT.mA, '#1C5C9C'], [this.lineB, 'B', ALT.mB, '#E38835']]) {
      if (!L) continue; const iv = [];
      for (const m of A.metro || []) {   // la línea del juego está suavizada: en las curvas se aparta hasta ~100 m del trazado; si el tramo sigue más allá de la punta de la línea, llega hasta la punta
        if (m[0] !== id) continue; const pa = this.project(L, m[2] / q * TS, m[3] / q * TS), pb = this.project(L, m[4] / q * TS, m[5] / q * TS), punta = r => r.s < 5 || r.s > L.len - 5, ok = r => r.d <= 160 || punta(r);
        if (Math.min(pa.d, pb.d) > 160 || !ok(pa) || !ok(pb)) continue; iv.push([Math.min(pa.s, pb.s), Math.max(pa.s, pb.s)]);
      }
      iv.sort((a, b) => a[0] - b[0]); const R = [];
      for (const v of iv) { const l = R[R.length - 1]; if (l && v[0] <= l[1] + 40) l[1] = Math.max(l[1], v[1]); else R.push(v.slice()); }
      L.alto = R.map(([s0, s1]) => { const len = s1 - s0, r = Math.min(110, len / 3); return { s0, s1, z: len > 700 ? zd : Math.min(zd, .26), r0: s0 < 5 ? 0 : r, r1: s1 > L.len - 5 ? 0 : r }; });   // si la línea termina en el viaducto, allí no hay rampa
      L.zAt = s => { for (const a of L.alto) if (s >= a.s0 && s <= a.s1) return a.z * (a.r0 ? altSuave((s - a.s0) / a.r0) : 1) * (a.r1 ? altSuave((a.s1 - s) / a.r1) : 1); return 0; };
      L.col = col;
      for (const st of L.st) { const a = L.alto.find(a => Math.max(0, st.s - ALT_SL) >= a.s0 - .5 && Math.min(L.len, st.s + ALT_SL) <= a.s1 + .5); st.alto = a && L.zAt(st.s) > a.z * .9 ? 1 : 0; st.z = st.alto ? L.zAt(st.s) : 0; }
      for (const a of L.alto) {   // piezas cortas; las estaciones empiezan y terminan en un corte
        const cuts = new Set([a.s0, a.s1]); for (let s = a.s0 + ALT.pz; s < a.s1; s += ALT.pz) cuts.add(s);
        for (const st of L.st) if (st.alto && st.s >= a.s0 && st.s <= a.s1) { cuts.add(Math.max(a.s0, st.s - ALT_SL)); cuts.add(Math.min(a.s1, st.s + ALT_SL)); }
        const cs = [...cuts].filter(s => s >= a.s0 && s <= a.s1).sort((x, y) => x - y);
        for (let i = 0; i + 1 < cs.length; i++) {
          const s0 = cs[i], s1 = cs[i + 1]; if (s1 - s0 < .5) continue;
          const pc = this.altPieza('m', L, s0, s1, 6.5, L.zAt); pc.L = L; pc.col = col;
          const st = L.st.find(st => st.alto && s0 >= Math.max(a.s0, st.s - ALT_SL) - .1 && s1 <= Math.min(a.s1, st.s + ALT_SL) + .1); if (st) { pc.est = st; pc.ini = Math.abs(s0 - Math.max(a.s0, st.s - ALT_SL)) < .2; pc.fin = Math.abs(s1 - Math.min(a.s1, st.s + ALT_SL)) < .2; }
          for (let s = Math.ceil(s0 / 48) * 48; s < s1; s += 48) { if (st) continue; const k = Math.round((s - s0) / (s1 - s0) * (pc.n - 1)); if (pc.Z[k] > .12) pc.pil.push(k); }
          meter(this.altG, CK(pc.x, pc.y), pc);
        }
      }
    }
    // ---- puentes de las vías: se cortan del dibujo del suelo y se levantan con el mismo trazo ----
    for (const B of A.puentes || []) {
      const k = B[0], lvl = B[1], lenM = B[2], pts = []; for (let i = 3; i + 1 < B.length; i += 2) pts.push({ x: B[i] / q * TS, y: B[i + 1] / q * TS });
      if (pts.length < 2 || !ALT_KV[k]) continue;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
      const a = pts[0], b = pts[pts.length - 1]; let bl = 0; for (let i = 1; i < pts.length; i++) bl += dist(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
      let best = null;
      for (const ch of this.chainsNear(x0 - 2 * TS, y0 - 2 * TS, x1 - x0 + 4 * TS, y1 - y0 + 4 * TS)) {
        if (!ALT_KV[k].includes(ch.k) || ch.p.length < 4) continue;
        const pa = this.chProj(ch, a.x, a.y), pb = this.chProj(ch, b.x, b.y), tol = ch.w / 2 + 8; if (pa.d > tol || pb.d > tol) continue;
        const sl = Math.abs(pb.s - pa.s); if (sl < bl * .6 || sl > bl * 1.6 + 12) continue;
        const sc = pa.d + pb.d; if (!best || sc < best.sc) best = { ch, sa: Math.min(pa.s, pb.s), sb: Math.max(pa.s, pb.s), sc };
      }
      let P, w;
      if (best) { P = this.poly(this.chTrozo(best.ch, best.sa, best.sb)); w = best.ch.w; this.chCorta(best.ch, best.sa, best.sb); }
      else { P = this.poly(pts); w = k === 6 ? 6 : k === 5 ? 7 : CHW[k] * TS; }
      if (P.len < 8) continue;
      let ag = 0, nS = 0; for (let s = 0; s <= P.len; s += 4) { const p = this.at(P, s), v = this.get(Math.floor(p.x / TS), Math.floor(p.y / TS)); nS++; if (v === TT.WATER || v === TT.BRIDGE || v === TT.CANAL) ag++; }
      const agua = ag / nS > .3, pe = k >= 5, z = agua ? .2 : pe ? .24 : lenM < 25 ? .1 : lvl >= 3 ? .5 : lvl === 2 ? .36 : .2, r = Math.min(pe ? 10 : 26, P.len / 3);
      const D = { P, w, z, r, k, lvl, agua, pe, len: P.len, zAt: s => z * altSuave(s / r) * altSuave((P.len - s) / r), x0: x0 - w, y0: y0 - w, x1: x1 + w, y1: y1 + w };
      this.decks.push(D); const seen = new Set();
      for (let s = 0; s <= P.len + 15; s += 15) { const p = this.at(P, Math.min(s, P.len)); for (const [dx, dy] of [[0, 0], [w, 0], [-w, 0], [0, w], [0, -w]]) { const kk = CK(p.x + dx, p.y + dy); if (!seen.has(kk)) { seen.add(kk); meter(this.deckG, kk, D); } } }
      for (let s = 0; s < P.len - .5; s += ALT.pz) {
        const s1 = Math.min(P.len, s + ALT.pz), pc = this.altPieza('p', P, s, s1, w / 2, D.zAt); pc.D = D;
        for (let t = Math.ceil(s / 40) * 40; t < s1; t += 40) { const kk = Math.round((t - s) / (s1 - s) * (pc.n - 1)); if (pc.Z[kk] > .12) pc.pil.push(kk); }
        meter(this.altG, CK(pc.x, pc.y), pc);
      }
    }
    this.altInfo = { metroA: (this.lineA && this.lineA.alto || []).length, metroB: (this.lineB && this.lineB.alto || []).length, puentes: this.decks.length, cortados: this.decks.filter(d => d.P).length };
  },
  /* una pieza de algo elevado: muestras del eje cada ~6 px con su normal y su altura */
  altPieza(t, P, s0, s1, hw, zAt) {
    const n = Math.max(2, Math.ceil((s1 - s0) / ALT.paso) + 1), X = new Float32Array(n), Y = new Float32Array(n), NX = new Float32Array(n), NY = new Float32Array(n), Z = new Float32Array(n), a0 = Math.max(0, s0 - .7), a1 = Math.min(P.len, s1 + .7);   // ±0,7 px: las piezas se traslapan y no se ve la costura
    for (let i = 0; i < n; i++) { const s = a0 + (a1 - a0) * i / (n - 1), p = this.at(P, s); X[i] = p.x; Y[i] = p.y; NX[i] = -Math.sin(p.a); NY[i] = Math.cos(p.a); Z[i] = zAt(clamp(s, s0, s1)); }
    const m = n >> 1; return { alto: 1, t, n, X, Y, NX, NY, Z, hw, x: X[m], y: Y[m], s0, s1, pil: [] };
  },
  /* proyección de un punto sobre una vía del dibujo: {d, s} */
  chProj(ch, x, y) {
    const p = ch.p, c = this.chCum(ch); let bd = 1e9, bs = 0;
    for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, L2 = dx * dx + dy * dy || 1, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (d < bd) { bd = d; bs = c[(i >> 1) - 1] + Math.sqrt(L2) * t; } }
    return { d: bd, s: bs };
  },
  /* el trozo de una vía entre sa y sb, como puntos {x, y} */
  chTrozo(ch, sa, sb) {
    const p = ch.p, c = this.chCum(ch), out = [this.chPt(ch, sa)];
    for (let i = 0; i < c.length; i++) if (c[i] > sa && c[i] < sb) out.push({ x: p[i * 2], y: p[i * 2 + 1] });
    out.push(this.chPt(ch, sb)); return out;
  },
  /* corta [sa, sb] de una vía del dibujo (el puente se dibuja en alto); si sobran dos partes, la segunda es una vía nueva */
  chCorta(ch, sa, sb) {
    const c = this.chCum(ch), len = c[c.length - 1], flat = P => { const o = []; for (const q of P) o.push(q.x, q.y); return o; };
    const A = sa > 1.5 ? flat(this.chTrozo(ch, 0, sa)) : null, Bp = sb < len - 1.5 ? flat(this.chTrozo(ch, sb, len)) : null, j1 = ch.j1;
    if (A) { ch.p = A; ch.cum = null; ch.j1 = false; if (Bp) this.chNueva(Object.assign({}, ch, { p: Bp, cum: null, j0: false, j1 })); }
    else if (Bp) { ch.p = Bp; ch.cum = null; ch.j0 = false; }
    else { ch.k = 0; ch.p = [ch.p[0], ch.p[1], ch.p[0] + .01, ch.p[1]]; ch.cum = null; }   // todo el tramo es puente: ya no se dibuja en el suelo
  },
  chNueva(ch) {
    const idx = this.chains.length, G = this.chainGrid, C = 32 * TS, p = ch.p; ch.id = idx; this.chains.push(ch);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); }
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const k = gx + ',' + gy; (G.get(k) || G.set(k, []).get(k)).push(idx); }
  },
  /* el tramo [s0, s1] de una línea que pasa cerca de un trozo (o null) */
  altRango(L, px0, py0, S, m) { let a = 1e9, b = -1e9; const P = L.pts, c = L.cum; for (let i = 0; i < P.length; i++) { const p = P[i]; if (p.x > px0 - m && p.y > py0 - m && p.x < px0 + S + m && p.y < py0 + S + m) { a = Math.min(a, c[Math.max(0, i - 1)]); b = Math.max(b, c[Math.min(P.length - 1, i + 1)]); } } return a <= b ? [a, b] : null; },
  decksNear(x, y) { const S = CH * TS; return this.deckG ? this.deckG.get(Math.floor(x / S) + ',' + Math.floor(y / S)) || [] : []; },
  /* posición sobre un puente: s a lo largo, d de lado (con signo), a el rumbo del puente ahí */
  deckProj(D, x, y) { const pr = this.project(D.P, x, y), q = this.at(D.P, pr.s), d = (x - q.x) * -Math.sin(q.a) + (y - q.y) * Math.cos(q.a); return { s: pr.s, d, a: q.a, dd: pr.d }; },
  /* en el suelo (trozo 3D): sombras y bases de los pilares de lo que va en alto */
  altSuelo(c, px0, py0, S) {
    if (!this.altG) return; const near = (x, y, m) => x > px0 - m && y > py0 - m && x < px0 + S + m && y < py0 + S + m;
    const piezas = []; for (let gy = -1; gy <= 1; gy++) for (let gx = -1; gx <= 1; gx++) { const L = this.altG.get((Math.floor(px0 / S) + gx) + ',' + (Math.floor(py0 / S) + gy)); if (L) piezas.push(...L); }
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const b of piezas) {
      if (!near(b.x, b.y, 60)) continue; const hw = b.est ? ALT_SW : b.hw, zt = b.est ? b.Z[b.n >> 1] + ALT.techo : 0;
      c.fillStyle = 'rgba(8,14,30,.2)'; c.beginPath();
      for (let i = 0; i < b.n; i++) { const d = 3 + (zt || b.Z[i]) * 13; c[i ? 'lineTo' : 'moveTo'](b.X[i] + b.NX[i] * hw + d, b.Y[i] + b.NY[i] * hw + d); }
      for (let i = b.n - 1; i >= 0; i--) { const d = 3 + (zt || b.Z[i]) * 13; c.lineTo(b.X[i] - b.NX[i] * hw + d, b.Y[i] - b.NY[i] * hw + d); }
      c.closePath(); c.fill();
      c.fillStyle = b.t === 'm' ? '#7d828a' : '#8a867c';
      for (const i of b.pil) { const r = b.t === 'm' ? 2 : 1.5; c.beginPath(); c.roundRect(b.X[i] - r, b.Y[i] - r, r * 2, r * 2, .8); c.fill(); }
      if (b.est) { c.fillStyle = '#8d939c'; for (let i = 0; i < b.n; i += 4) for (const sd of [-1, 1]) { const x = b.X[i] + b.NX[i] * (ALT_SW - 2) * sd, y = b.Y[i] + b.NY[i] * (ALT_SW - 2) * sd; c.beginPath(); c.arc(x, y, 1.4, 0, TAU); c.fill(); } }
    }
  }
});
const _build76 = CityMap.build;
CityMap.build = function () { _build76.call(this); try { this.alturas(); } catch (e) { console.warn('alturas', e); this.altG = null; this.decks = []; this.deckG = new Map(); } };

/* ---------- dibujo de una pieza elevada (en draw3D, ordenada con los edificios) ---------- */
const ALT_COL = { m: { top: '#d3d6db', borde: '#8d939c', lado: '#bfc4cb', bajo: '#9aa0a8', riel: '#8e949c', pilar: '#a3a8b0' }, p: { top: '#565a62', borde: '#cfcabf', lado: '#b8b3a7', bajo: '#9a958a', riel: '#e8c64a', pilar: '#aaa59a' }, pe: { top: '#d8d2c4', borde: '#f2efe8', lado: '#aaa59a', bajo: '#8f8a7f', riel: '#c7bfac', pilar: '#a8a399' }, ci: { top: '#2e9d55', borde: '#f2efe8', lado: '#aaa59a', bajo: '#8f8a7f', riel: '#d8f0c8', pilar: '#a8a399' } };
const ALT_PAL = new Map();
const altPal = (k, nb) => { const key = k + nb; let p = ALT_PAL.get(key); if (p) return p; const B = ALT_COL[k]; p = {}; for (const n in B) p[n] = mixHex(B[n], '#0b1430', nb * .17); ALT_PAL.set(key, p); return p; };
Ride.prototype.altoPieza = function (c, b, ox, oy, px, py, K, nb) {
  const n = b.n, X = b.X, Y = b.Y, NX = b.NX, NY = b.NY, Z = b.Z, D = b.D, kind = b.t === 'm' ? 'm' : D.k === 5 ? 'ci' : D.pe ? 'pe' : 'p', C = altPal(kind, nb), th = b.t === 'm' ? ALT.grosor : .05;
  const PX = (x, y, z) => { const f = 1 + K * z; return px + (x - ox - px) * f; }, PY = (x, y, z) => { const f = 1 + K * z; return py + (y - oy - py) * f; };
  let hw = b.hw;
  // 1) pilares: del suelo a la losa
  if (b.pil.length) { c.strokeStyle = C.pilar; c.lineWidth = b.t === 'm' ? 3.4 : D.pe ? 1.4 : 2.4; c.lineCap = 'butt'; c.beginPath(); for (const i of b.pil) { const zb = Math.max(0, Z[i] - th); c.moveTo(X[i] - ox, Y[i] - oy); c.lineTo(PX(X[i], Y[i], zb), PY(X[i], Y[i], zb)); } c.stroke(); c.lineCap = 'round'; }
  // 2) los costados de la losa que miran a la cámara
  const lado = (sd, z0f, z1f, w, col) => {
    c.fillStyle = col;
    for (let i = 0; i + 1 < n; i++) {
      const ax = X[i] + NX[i] * w * sd, ay = Y[i] + NY[i] * w * sd, bx = X[i + 1] + NX[i + 1] * w * sd, by = Y[i + 1] + NY[i + 1] * w * sd, mx = (ax + bx) / 2 - ox, my = (ay + by) / 2 - oy;
      if ((NX[i] * sd) * (px - mx) + (NY[i] * sd) * (py - my) <= 0) continue;
      const za0 = z0f(i), za1 = z1f(i), zb0 = z0f(i + 1), zb1 = z1f(i + 1); if (za1 - za0 < .004 && zb1 - zb0 < .004) continue;
      c.beginPath(); c.moveTo(PX(ax, ay, za0), PY(ax, ay, za0)); c.lineTo(PX(bx, by, zb0), PY(bx, by, zb0)); c.lineTo(PX(bx, by, zb1), PY(bx, by, zb1)); c.lineTo(PX(ax, ay, za1), PY(ax, ay, za1)); c.closePath(); c.fill();
    }
  };
  const zTop = i => Z[i], zBot = i => Math.max(0, Z[i] - th);
  lado(1, zBot, zTop, hw, C.lado); lado(-1, zBot, zTop, hw, C.lado);
  // 3) la losa por encima
  const losa = (w, z, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * w, y = Y[i] + NY[i] * w, zz = z(i); c[i ? 'lineTo' : 'moveTo'](PX(x, y, zz), PY(x, y, zz)); } for (let i = n - 1; i >= 0; i--) { const x = X[i] - NX[i] * w, y = Y[i] - NY[i] * w, zz = z(i); c.lineTo(PX(x, y, zz), PY(x, y, zz)); } c.closePath(); c.fill(); };
  const linea = (off, z, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; if (dash) { c.setLineDash(dash); c.lineDashOffset = b.s0 * (1 + K * Z[n >> 1]); } c.beginPath(); for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * off, y = Y[i] + NY[i] * off, zz = z(i); c[i ? 'lineTo' : 'moveTo'](PX(x, y, zz), PY(x, y, zz)); } c.stroke(); if (dash) { c.setLineDash([]); c.lineDashOffset = 0; } };
  losa(hw, zTop, C.top);
  if (b.t === 'm') { const zr = i => Z[i] + .004; for (const o of [-3.6, -1.6, 1.6, 3.6]) linea(o, zr, .55, C.riel); linea(hw - .5, zr, .9, C.borde); linea(-hw + .5, zr, .9, C.borde); this.altTrenes(c, b, ox, oy, px, py, K, PX, PY); }
  else {
    const zr = i => Z[i] + .004, zb = i => Z[i] + .035;
    if (!D.pe && hw > 7) linea(0, zr, .8, D.k === 3 ? '#f2f0e8' : C.riel, D.k === 3 ? [9, 6] : [8, 6]);
    linea(hw - .6, zb, 1.1, C.borde); linea(-hw + .6, zb, 1.1, C.borde);   // barandas
  }
  // 4) estación elevada: caja sobre la plataforma con su techo y las franjas del color de la línea
  const st = b.est; if (!st) return;
  const zs = st.z, zb0 = Math.max(0, zs - .16), zt = zs + ALT.techo, W = ALT_SW;
  const z0 = () => zb0, z1 = () => zt;
  c.strokeStyle = C.pilar; c.lineWidth = 2.6; c.beginPath(); for (let i = 0; i < n; i += 4) for (const sd of [-1, 1]) { const x = X[i] + NX[i] * (W - 2) * sd, y = Y[i] + NY[i] * (W - 2) * sd; c.moveTo(x - ox, y - oy); c.lineTo(PX(x, y, zb0), PY(x, y, zb0)); } c.stroke();
  const cv = mixHex(b.col, '#0b1430', nb * .17), vid = mixHex('#7d9bb5', '#0b1430', nb * .17);
  lado(1, z0, z1, W, vid); lado(-1, z0, z1, W, vid);
  // franja de color abajo del vidrio
  lado(1, z0, i => zb0 + .06, W, cv); lado(-1, z0, i => zb0 + .06, W, cv);
  // tapas de los extremos
  for (const [i, fin] of [[0, false], [n - 1, true]]) {
    if (!(fin ? b.fin : b.ini)) continue; const sg = fin ? 1 : -1, tx = (X[n - 1] - X[0]) * sg, ty = (Y[n - 1] - Y[0]) * sg, ex = X[i] - ox, ey = Y[i] - oy;
    if (tx * (px - ex) + ty * (py - ey) <= 0) continue;
    const ax = X[i] + NX[i] * W, ay = Y[i] + NY[i] * W, bx = X[i] - NX[i] * W, by = Y[i] - NY[i] * W; c.fillStyle = vid; c.beginPath(); c.moveTo(PX(ax, ay, zb0), PY(ax, ay, zb0)); c.lineTo(PX(bx, by, zb0), PY(bx, by, zb0)); c.lineTo(PX(bx, by, zt), PY(bx, by, zt)); c.lineTo(PX(ax, ay, zt), PY(ax, ay, zt)); c.closePath(); c.fill();
  }
  losa(W, z1, mixHex('#e9ecef', '#0b1430', nb * .17));
  linea(W - 2.2, z1, 3.2, cv); linea(-W + 2.2, z1, 3.2, cv);
  c.strokeStyle = mixHex('#c3c8cf', '#0b1430', nb * .17); c.lineWidth = .9; c.beginPath();
  for (let i = 1; i < n - 1; i += 2) { const a = [X[i] + NX[i] * (W - 4), Y[i] + NY[i] * (W - 4)], d = [X[i] - NX[i] * (W - 4), Y[i] - NY[i] * (W - 4)]; c.moveTo(PX(a[0], a[1], zt), PY(a[0], a[1], zt)); c.lineTo(PX(d[0], d[1], zt), PY(d[0], d[1], zt)); }
  c.stroke();
};
/* trenes sobre esta pieza del viaducto: recortados a la losa para que no asomen en la pieza vecina */
Ride.prototype.altTrenes = function (c, b, ox, oy, px, py, K, PX, PY) {
  const cars = this._altCars; if (!cars || !cars.length) return; let any = false;
  for (const q of cars) if (q.L === b.L && q.s > b.s0 - 10 && q.s < b.s1 + 10) { any = true; break; }
  if (!any) return; const n = b.n, X = b.X, Y = b.Y, NX = b.NX, NY = b.NY, Z = b.Z, w = b.hw + 2;
  c.save(); c.beginPath();
  for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * w, y = Y[i] + NY[i] * w; c[i ? 'lineTo' : 'moveTo'](PX(x, y, Z[i]), PY(x, y, Z[i])); }
  for (let i = n - 1; i >= 0; i--) { const x = X[i] - NX[i] * w, y = Y[i] - NY[i] * w; c.lineTo(PX(x, y, Z[i]), PY(x, y, Z[i])); }
  c.closePath(); c.clip(); const tc = Art.trainCar();
  for (const q of cars) { if (q.L !== b.L || q.s < b.s0 - 10 || q.s > b.s1 + 10) continue; const z = q.z + .05, f = 1 + K * z; c.save(); c.translate(px + (q.x - ox - px) * f, py + (q.y - oy - py) * f); c.rotate(q.a + Math.PI / 2); c.scale(f, f); blit(c, tc); c.restore(); }
  c.restore();
};
/* los vagones de este cuadro: en el viaducto (se dibujan con su pieza) o a nivel del suelo */
Ride.prototype.altVagones = function () {
  const out = this._altCars = [], low = this._lowCars = []; if (!this.metroOn()) return;
  for (const tr of this.trains) for (let j = -1; j <= 1; j++) { const s = tr.s + j * 17; if (s < 0 || s > tr.L.len) continue; const q = this.map.at(tr.L, s), z = tr.L.zAt ? tr.L.zAt(s) : 0, o = { L: tr.L, s, x: q.x, y: q.y, a: q.a, z }; (z > .015 ? out : low).push(o); }
};
/* trenes a nivel del suelo: antes que el jugador */
Ride.prototype.drawTrenesSuelo = function (c, ox, oy, inV, spr) { this.altVagones(); const tc = Art.trainCar(); for (const q of this._lowCars) if (inV(q.x, q.y)) spr(tc, q.x, q.y, q.a); };
/* encima de todo: el jugador cuando va por un puente y los carros que van por los puentes */
Ride.prototype.drawArriba = function (c, ox, oy, inV, spr, sp) {
  const P = this.p, E = this.ojo(), px = E.x - ox, py = E.y - oy, K = E.K;
  const sprZ = (img, x, y, a, z, sh) => { const f = 1 + K * z; c.save(); c.translate(px + (x - ox - px) * f, py + (y - oy - py) * f); c.rotate(a + Math.PI / 2); c.scale(f, f); blit(c, img, sh); c.restore(); };
  for (const cr of this.cars) if (cr.arriba && inV(cr.x, cr.y)) sprZ(Art.carTop(cr.col, cr.kind), cr.x, cr.y, cr.ang, cr.z || .2, '#0004');
  if (P.lvl > 0) sprZ(sp, P.x, P.y, P.a, P.z || 0, '#0005');
};
/* el nivel del jugador: arriba si entró al puente por uno de sus extremos (o va sobre el agua), debajo si llegó por un lado */
Ride.prototype.nivel = function () {
  const P = this.p, M = this.map; if (!M.deckG || !M.decks.length) { P.lvl = 0; P.z = 0; return; }
  let D = P.deck;
  if (D) {
    const pr = M.deckProj(D, P.x, P.y);
    if (pr.s < -3 || pr.s > D.len + 3 || Math.abs(pr.d) > D.w / 2 + 3) { P.deck = null; P.lvl = 0; P.z = 0; D = null; }
    else if (P.lvl > 0) {
      P.z = D.zAt(clamp(pr.s, 0, D.len));
      if (D.agua) { const lim = D.w / 2 - 1.5; if (Math.abs(pr.d) > lim) { const e = (Math.abs(pr.d) - lim) * Math.sign(pr.d), nx = -Math.sin(pr.a), ny = Math.cos(pr.a); if (!this.blocked(P.x - nx * e, P.y - ny * e, this.stats_().r)) { P.x -= nx * e; P.y -= ny * e; } } }   // baranda sobre el río
    }
  }
  if (!D) {
    const t = this.tileAt(), sobreAgua = t === TT.BRIDGE;
    for (const d of M.decksNear(P.x, P.y)) {
      if (P.x < d.x0 || P.x > d.x1 || P.y < d.y0 || P.y > d.y1) continue;
      const pr = M.deckProj(d, P.x, P.y); if (pr.s < 0 || pr.s > d.len || Math.abs(pr.d) > d.w / 2) continue;
      const ext = pr.s < d.r + 8 || pr.s > d.len - d.r - 8, along = Math.abs(Math.cos(angDiff(P.a, pr.a))) > .5;
      P.deck = d; P.lvl = (ext && along) || (sobreAgua && d.agua) ? 1 : 0; P.z = P.lvl ? d.zAt(pr.s) : 0; break;
    }
  }
};
/* los carros: arriba si van por un puente en su mismo sentido */
Ride.prototype.nivelCarros = function () {
  const M = this.map; if (!M.deckG || !M.decks.length) return;
  for (const cr of this.cars) {
    cr.arriba = false; const L = M.decksNear(cr.x, cr.y); if (!L.length) continue;
    for (const d of L) { if (d.pe || cr.x < d.x0 || cr.x > d.x1 || cr.y < d.y0 || cr.y > d.y1) continue; const pr = M.deckProj(d, cr.x, cr.y); if (pr.s < 0 || pr.s > d.len || Math.abs(pr.d) > d.w / 2 + 2) continue; if (Math.abs(Math.cos(angDiff(cr.ang, pr.a))) > .8) { cr.arriba = true; cr.z = d.zAt(pr.s); break; } }
  }
};
const _upd76 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) { _upd76.call(this, dt, dir); if (GFX() === '3d') { this.nivel(); if (!JE.headless) this.nivelCarros(); } else { this.p.lvl = 0; this.p.z = 0; } };
