/* =====================================================================
   LO QUE VA EN ALTO (v1.7): el metro en viaducto con sus estaciones elevadas y los puentes de las vías,
   cada uno a su altura (Overture / OpenStreetMap: is_bridge y level; motor-valle/geo/alturas.py).
   En la ciudad 3D la bici pasa por DEBAJO del viaducto y de los puentes; a un puente se sube por sus
   extremos (si se llega por un lado, se pasa por debajo). En el suelo quedan su sombra y sus pilares.
   ===================================================================== */
const ALT = { mA: .4, mB: .5, techo: .27, grosor: .075, pz: 36, paso: 6 };
const ALT_SL = 55 * (TS / (VM.tile || 10)), ALT_SW = 9.2 * (TS / (VM.tile || 10));   // medio largo (andén de 110 m) y medio ancho (cubierta a 9 m del eje) de una estación del metro, como en El Metro
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
          const pc = this.altPieza('m', L, s0, s1, 5 * PXM, L.zAt); pc.L = L; pc.col = col;   // tablero de 10 m, como en El Metro
          const st = L.st.find(st => st.alto && s0 >= Math.max(a.s0, st.s - ALT_SL) - .1 && s1 <= Math.min(a.s1, st.s + ALT_SL) + .1); if (st) { pc.est = st; pc.ini = Math.abs(s0 - Math.max(a.s0, st.s - ALT_SL)) < .2; pc.fin = Math.abs(s1 - Math.min(a.s1, st.s + ALT_SL)) < .2; }
          for (let s = Math.ceil(s0 / (30 * PXM)) * 30 * PXM; s < s1; s += 30 * PXM) { const k = Math.round((s - s0) / (s1 - s0) * (pc.n - 1)); if (pc.Z[k] > .12) pc.pil.push(k); }   // columnas cada 30 m
          if (st) pc.hall = this.altHall(L, st, s0, s1);   // edificio de acceso bajo el viaducto, sin tapar la calle
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
  /* el edificio de acceso de una estación (de 22 m adentro de cada punta del andén), partido donde una calle pasa por debajo; el trozo de la pieza [s0, s1] */
  altHall(L, st, s0, s1) {
    if (!st.hall) {
      const a0 = st.s - ALT_SL + 22 * PXM, a1 = st.s + ALT_SL - 22 * PXM, road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE || v === TT.CICLO, H = []; let ini = null;
      for (let s = a0; s <= a1 + .1; s += 4) { const q = this.at(L, Math.min(s, a1)); let calle = false; for (const o of [-6, 0, 6]) { const p = this.at(L, Math.min(s, a1), o); if (road(this.get(Math.floor(p.x / TS), Math.floor(p.y / TS)))) calle = true; } if (!calle && ini == null) ini = s; if ((calle || s >= a1) && ini != null) { if (Math.min(s, a1) - ini > 8) H.push([ini, Math.min(s, a1)]); ini = null; } }
      st.hall = H;
    }
    const out = []; for (const [a, b] of st.hall) { const x = Math.max(a, s0), y = Math.min(b, s1); if (y - x > .5) out.push({ a: x, b: y, ini: a >= s0 - .01 && a <= s1, fin: b >= s0 && b <= s1 + .01 }); } return out;
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
/* ---------- Metroplús sobre el eje real de sus avenidas (v1.7) ----------
   El trazado viene de la red de El Metro y está suavizado: en las curvas cortaba esquinas y algunas estaciones quedaban fuera de la calzada.
   Cada punto se lleva al eje de la vía del dibujo más cercana (en las avenidas de doble calzada, al separador entre las dos),
   y cada estación se corre lo justo para quedar en un tramo recto, alineada con su carril. */
Object.assign(CityMap, {
  mpAjusta() {
    const road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE, info = [];
    const cubre = (P, s, half, lat) => { let m = 0, k = 0; for (let ds = -half; ds <= half; ds += 4) for (let dl = -lat; dl <= lat; dl += 3) { const q = this.at(P, s + ds, dl); m++; if (road(this.get(Math.floor(q.x / TS), Math.floor(q.y / TS)))) k++; } return k / m; };
    for (const P of this.mp || []) {
      const antes = P.st.map(st => cubre(P, st.s, 30, 6)), pts = [];
      let prev = null;
      for (let s = 0; s <= (P.osm ? -1 : P.len); s += 6) {   // el corredor de OSM (P.osm) ya va por su carril: no se mueve
        const q = this.at(P, s), ux = Math.cos(q.a), uy = Math.sin(q.a); let L = null, R = null, best = null;
        for (const ch of this.chainsNear(q.x - 28, q.y - 28, 56, 56)) {
          if (!(ch.k >= 1 && ch.k <= 4) || ch.p.length < 4) continue;
          const pr = this.chProj(ch, q.x, q.y); if (pr.d > 26) continue;
          const a = this.chPt(ch, Math.max(0, pr.s - 3)), b = this.chPt(ch, pr.s + 3), al = Math.abs(((b.x - a.x) * ux + (b.y - a.y) * uy) / (Math.hypot(b.x - a.x, b.y - a.y) || 1)); if (al < .8) continue;   // solo vías que van en el mismo sentido (no las que cruzan)
          const c = this.chPt(ch, pr.s), sd = (c.x - q.x) * -uy + (c.y - q.y) * ux, cand = { x: c.x, y: c.y, d: pr.d + (ch === prev ? -4 : 0) + (ch.k === 1 ? 5 : 0), ch };
          if (sd < 0) { if (!L || cand.d < L.d) L = cand; } else if (!R || cand.d < R.d) R = cand;
          if (!best || cand.d < best.d) best = cand;
        }
        let x = q.x, y = q.y;
        if (L && R && L.ch.k === R.ch.k && L.ch.k >= 2 && L.d < 20 && R.d < 20 && dist(L.x, L.y, R.x, R.y) < 34) { x = (L.x + R.x) / 2; y = (L.y + R.y) / 2; prev = null; }   // doble calzada: el carril va por el separador
        else if (best) { x = best.x; y = best.y; prev = best.ch; }
        pts.push({ x, y });
      }
      if (pts.length >= 3) {
      const sm = pts.map((p, i) => i === 0 || i === pts.length - 1 ? p : { x: (pts[i - 1].x + p.x * 2 + pts[i + 1].x) / 4, y: (pts[i - 1].y + p.y * 2 + pts[i + 1].y) / 4 });
      const N = this.poly(sm); P.pts = N.pts; P.cum = N.cum; P.len = N.len; }
      // cada estación, en el tramo recto más cercano a su punto real y sobre la calzada
      P.st.forEach((st, i) => {
        const s0 = this.project(P, st.px, st.py).s, W = P.osm ? 12 : 42; let bs = s0, bk = -1e9;   // con el andén real (OSM), apenas se corre
        for (let ds = -W; ds <= W; ds += 6) {
          const s = clamp(s0 + ds, 30, P.len - 30), a = this.at(P, s - 28), b = this.at(P, s + 28), giro = Math.abs(angDiff(a.a, b.a)), k = cubre(P, s, 30, 6) * 2 - giro * 2.2 - Math.abs(ds) / 120;
          if (k > bk) { bk = k; bs = s; }
        }
        st.s = bs; const q = this.at(P, bs); st.x = q.x; st.y = q.y;
        info.push({ l: P.name || P.id, st: st.name, antes: Math.round(antes[i] * 100), ahora: Math.round(cubre(P, bs, 30, 6) * 100), corr: Math.round(Math.abs(bs - s0)) });
      });
    }
    this.mpInfo = info;
  }
});
const _build76 = CityMap.build;
CityMap.build = function () { _build76.call(this); try { if (this.mpReal) this.mpReal(); this.mpAjusta(); } catch (e) { console.warn('metroplus', e); } try { this.alturas(); } catch (e) { console.warn('alturas', e); this.altG = null; this.decks = []; this.deckG = new Map(); } };

/* ---------- dibujo de una pieza elevada (en draw3D, ordenada con los edificios) ---------- */
const ALT_COL = { m: { top: '#d3d6db', borde: '#8d939c', lado: '#bfc4cb', bajo: '#9aa0a8', riel: '#8e949c', pilar: '#a3a8b0' }, p: { top: '#565a62', borde: '#cfcabf', lado: '#b8b3a7', bajo: '#9a958a', riel: '#e8c64a', pilar: '#aaa59a' }, pe: { top: '#d8d2c4', borde: '#f2efe8', lado: '#aaa59a', bajo: '#8f8a7f', riel: '#c7bfac', pilar: '#a8a399' }, ci: { top: '#2e9d55', borde: '#f2efe8', lado: '#aaa59a', bajo: '#8f8a7f', riel: '#d8f0c8', pilar: '#a8a399' } };
const ALT_PAL = new Map();
const altPal = (k, nb) => { const key = k + nb; let p = ALT_PAL.get(key); if (p) return p; const B = ALT_COL[k]; p = {}; for (const n in B) p[n] = mixHex(B[n], '#0b1430', nb * .17); ALT_PAL.set(key, p); return p; };
Ride.prototype.altoPieza = function (c, b, ox, oy, px, py, K, nb) {
  const n = b.n, X = b.X, Y = b.Y, NX = b.NX, NY = b.NY, Z = b.Z, D = b.D, kind = b.t === 'm' ? 'm' : D.k === 5 ? 'ci' : D.pe ? 'pe' : 'p', C = altPal(kind, nb), th = b.t === 'm' ? ALT.grosor : .05;
  const PX = (x, y, z) => { const f = 1 + K * z; return px + (x - ox - px) * f; }, PY = (x, y, z) => { const f = 1 + K * z; return py + (y - oy - py) * f; };
  let hw = b.hw;
  if (b.t === 'm') return this.altMetro(c, b, ox, oy, px, py, K, nb, PX, PY);
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
  if (b.t === 'm') return;   // el metro va antes, con el diseño de El Metro (altMetro)
  else {
    const zr = i => Z[i] + .004, zb = i => Z[i] + .035;
    if (!D.pe && hw > 7) linea(0, zr, .8, D.k === 3 ? '#f2f0e8' : C.riel, D.k === 3 ? [9, 6] : [8, 6]);
    linea(hw - .6, zb, 1.1, C.borde); linea(-hw + .6, zb, 1.1, C.borde);   // barandas
  }
};
/* el viaducto y sus estaciones con el diseño de El Metro (35-ciudad.js de metrozero): columnas cada 30 m, tablero de concreto
   con su canto, durmientes y cuatro rieles; en las estaciones, el edificio de acceso abajo (la calle pasa libre), dos andenes
   laterales con su línea amarilla y la cubierta metálica con el borde del color de la línea */
Ride.prototype.altMetro = function (c, b, ox, oy, px, py, K, nb, PX, PY) {
  const n = b.n, X = b.X, Y = b.Y, NX = b.NX, NY = b.NY, Z = b.Z, M = this.map, L = b.L, st = b.est, hw = b.hw, sh = col => nb ? mixHex(col, '#0b1430', nb * .17) : col, th = 1.6 / 27;
  const lado = (sd, z0f, z1f, w, col) => { c.fillStyle = col; for (let i = 0; i + 1 < n; i++) { const ax = X[i] + NX[i] * w * sd, ay = Y[i] + NY[i] * w * sd, bx = X[i + 1] + NX[i + 1] * w * sd, by = Y[i + 1] + NY[i + 1] * w * sd, mx = (ax + bx) / 2 - ox, my = (ay + by) / 2 - oy; if ((NX[i] * sd) * (px - mx) + (NY[i] * sd) * (py - my) <= 0) continue; const za0 = z0f(i), za1 = z1f(i), zb0 = z0f(i + 1), zb1 = z1f(i + 1); if (za1 - za0 < .004 && zb1 - zb0 < .004) continue; c.beginPath(); c.moveTo(PX(ax, ay, za0), PY(ax, ay, za0)); c.lineTo(PX(bx, by, zb0), PY(bx, by, zb0)); c.lineTo(PX(bx, by, zb1), PY(bx, by, zb1)); c.lineTo(PX(ax, ay, za1), PY(ax, ay, za1)); c.closePath(); c.fill(); } };
  const losa = (w, z, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * w, y = Y[i] + NY[i] * w, zz = z(i); c[i ? 'lineTo' : 'moveTo'](PX(x, y, zz), PY(x, y, zz)); } for (let i = n - 1; i >= 0; i--) { const x = X[i] - NX[i] * w, y = Y[i] - NY[i] * w, zz = z(i); c.lineTo(PX(x, y, zz), PY(x, y, zz)); } c.closePath(); c.fill(); };
  const linea = (off, z, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w; if (dash) { c.setLineDash(dash); c.lineDashOffset = b.s0; } c.beginPath(); for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * off, y = Y[i] + NY[i] * off, zz = z(i); c[i ? 'lineTo' : 'moveTo'](PX(x, y, zz), PY(x, y, zz)); } c.stroke(); if (dash) { c.setLineDash([]); c.lineDashOffset = 0; } };
  const zTop = i => Z[i], zBot = i => Math.max(0, Z[i] - th), zr = i => Z[i] + .003;
  // 0) edificio de acceso bajo la estación: muros claros, techo y franja del color de la línea (asoma a los lados del tablero)
  if (st && b.hall && b.hall.length) {
    const zt = 5 / 27, W = 11 * PXM;
    for (const h of b.hall) {
      c.fillStyle = sh('#cfc6b3'); sisMuro(c, M, L, h.a, h.b, W, 0, zt, ox, oy, px, py, PX, PY); sisMuro(c, M, L, h.a, h.b, -W, 0, zt, ox, oy, px, py, PX, PY);
      for (const [s1, on] of [[h.a, h.ini], [h.b, h.fin]]) { if (!on) continue; const q = M.at(L, s1), tx = Math.cos(q.a) * (s1 === h.a ? -1 : 1), ty = Math.sin(q.a) * (s1 === h.a ? -1 : 1); if (tx * (px - (q.x - ox)) + ty * (py - (q.y - oy)) <= 0) continue; const A = M.at(L, s1, -W), B = M.at(L, s1, W); c.beginPath(); c.moveTo(PX(A.x, A.y, 0), PY(A.x, A.y, 0)); c.lineTo(PX(B.x, B.y, 0), PY(B.x, B.y, 0)); c.lineTo(PX(B.x, B.y, zt), PY(B.x, B.y, zt)); c.lineTo(PX(A.x, A.y, zt), PY(A.x, A.y, zt)); c.closePath(); c.fill(); }
      sisBanda(c, M, L, h.a, h.b, -W, W, zt, PX, PY); c.fillStyle = sh('#e6dfcf'); c.fill(); c.strokeStyle = 'rgba(40,36,30,.5)'; c.lineWidth = .35; c.stroke();
      c.fillStyle = sh(L.col); sisBanda(c, M, L, h.a, h.b, -W, -W + PXM, zt, PX, PY); c.fill(); sisBanda(c, M, L, h.a, h.b, W - PXM, W, zt, PX, PY); c.fill();
    }
  }
  // 1) columnas: del piso al tablero, con su luz
  if (b.pil.length) {
    c.lineCap = 'butt'; c.strokeStyle = sh('#857f75'); c.lineWidth = 2.4 * PXM; c.beginPath(); for (const i of b.pil) { const zb = Math.max(0, Z[i] - th); c.moveTo(X[i] - ox, Y[i] - oy); c.lineTo(PX(X[i], Y[i], zb), PY(X[i], Y[i], zb)); } c.stroke();
    c.strokeStyle = sh('#aaa398'); c.lineWidth = .8 * PXM; c.beginPath(); for (const i of b.pil) { const zb = Math.max(0, Z[i] - th), dx = -NX[i] * .6 * PXM, dy = -NY[i] * .6 * PXM; c.moveTo(X[i] - ox + dx, Y[i] - oy + dy); c.lineTo(PX(X[i], Y[i], zb) + dx, PY(X[i], Y[i], zb) + dy); } c.stroke(); c.lineCap = 'round';
  }
  // 2) canto del tablero y tablero: borde oscuro de 10 m y superficie de concreto de 8,6 m
  lado(1, zBot, zTop, hw, sh('#6f685e')); lado(-1, zBot, zTop, hw, sh('#6f685e'));
  losa(hw, zTop, sh('#4f4b45')); losa(4.3 * PXM, zTop, sh('#9a9185'));
  // 3) durmientes y dos vías (cuatro rieles)
  for (const o of [-2, 2]) linea(o * PXM, zr, 2.6 * PXM, sh('#7d756a'), [.35 * PXM, .55 * PXM]);
  for (const o of [-2.72, -1.28, 1.28, 2.72]) linea(o * PXM, zr, .42, '#2b2a28');
  // 4) los trenes que van por esta pieza
  this.altTrenes(c, b, ox, oy, px, py, K, PX, PY);
  // 5) estación: dos andenes laterales y su cubierta metálica a 4,2 m
  if (!st) return;
  const zs = st.z, zc = zs + 4.2 / 27, a0 = b.ini ? b.s0 + 6 * PXM : b.s0, a1 = b.fin ? b.s1 - 6 * PXM : b.s1;
  for (const sd of [-1, 1]) {
    c.fillStyle = sh('#bdb5a5'); sisMuro(c, M, L, b.s0, b.s1, sd * 8.6 * PXM, zs - th, zs, ox, oy, px, py, PX, PY);   // canto del andén
    sisBanda(c, M, L, b.s0, b.s1, sd * 4.1 * PXM, sd * 8.6 * PXM, zs, PX, PY); c.fillStyle = sh('#ece6d6'); c.fill(); c.strokeStyle = 'rgba(40,36,30,.55)'; c.lineWidth = .4; c.stroke();
    sisBanda(c, M, L, b.s0, b.s1, sd * 4.1 * PXM, sd * 4.55 * PXM, zs + .001, PX, PY); c.fillStyle = '#f2c400'; c.fill();
    if (a1 - a0 < 1) continue;
    sisBanda(c, M, L, a0, a1, sd * 4.6 * PXM, sd * 8.6 * PXM, zs + .002, PX, PY); c.fillStyle = 'rgba(30,30,30,.16)'; c.fill();   // sombra de la cubierta en el andén
    c.strokeStyle = sh('#8d939c'); c.lineWidth = .5; c.beginPath(); for (let t = a0 + 4 * PXM; t < a1; t += 12 * PXM) { const q = M.at(L, t, sd * 8.4 * PXM); c.moveTo(PX(q.x, q.y, zs), PY(q.x, q.y, zs)); c.lineTo(PX(q.x, q.y, zc), PY(q.x, q.y, zc)); } c.stroke();   // postes
    sisBanda(c, M, L, a0, a1, sd * 5 * PXM, sd * 9 * PXM, zc, PX, PY); c.fillStyle = sh('#dde1e4'); c.fill(); c.strokeStyle = 'rgba(60,66,74,.6)'; c.lineWidth = .35; c.stroke();
    sisBanda(c, M, L, a0, a1, sd * 8.3 * PXM, sd * 9 * PXM, zc + .001, PX, PY); c.fillStyle = sh(L.col); c.fill();
    c.strokeStyle = 'rgba(120,126,134,.55)'; c.lineWidth = .3; c.beginPath(); for (let t = a0 + 4 * PXM; t < a1 - 2 * PXM; t += 6 * PXM) { const A = M.at(L, t, sd * 5 * PXM), B = M.at(L, t, sd * 8.3 * PXM); c.moveTo(PX(A.x, A.y, zc), PY(A.x, A.y, zc)); c.lineTo(PX(B.x, B.y, zc), PY(B.x, B.y, zc)); } c.stroke();
  }
};
/* trenes sobre esta pieza del viaducto, con el dibujo de El Metro: recortados a la losa para que no asomen en la pieza vecina */
Ride.prototype.altTrenes = function (c, b, ox, oy, px, py, K, PX, PY) {
  const cars = this._altCars; if (!cars || !cars.length) return; const cl = SIS.metro.carL * PXM; let any = false;
  for (const q of cars) if (q.L === b.L && q.s > b.s0 - cl && q.s < b.s1 + cl) { any = true; break; }
  if (!any) return; const n = b.n, X = b.X, Y = b.Y, NX = b.NX, NY = b.NY, Z = b.Z, w = b.hw + 1, night = Art.night(this.min) > .5;
  c.save(); c.beginPath();
  for (let i = 0; i < n; i++) { const x = X[i] + NX[i] * w, y = Y[i] + NY[i] * w; c[i ? 'lineTo' : 'moveTo'](PX(x, y, Z[i]), PY(x, y, Z[i])); }
  for (let i = n - 1; i >= 0; i--) { const x = X[i] - NX[i] * w, y = Y[i] - NY[i] * w; c.lineTo(PX(x, y, Z[i]), PY(x, y, Z[i])); }
  c.closePath(); c.clip();
  for (const q of cars) { if (q.L !== b.L || q.s < b.s0 - cl || q.s > b.s1 + cl) continue; const z = q.z + .03, f = 1 + K * z; SisSpr.dib(c, 'metro', q.L.col, cl, SIS.metro.W * PXM, px + (q.x - ox - px) * f, py + (q.y - oy - py) * f, q.a, f, q.end, night); }
  c.restore();
};
/* los vagones de este cuadro (3 de 22 m, cada sentido por su vía): en el viaducto (van con su pieza) o a nivel del suelo */
Ride.prototype.altVagones = function () {
  const out = this._altCars = [], low = this._lowCars = []; if (!this.metroOn()) return;
  const cl = SIS.metro.carL * PXM, gp = PXM, nC = SIS.metro.n;
  for (const tr of this.trains) for (let i = 0; i < nC; i++) {
    const s = tr.s - tr.dir * (i * (cl + gp) + cl / 2); if (s < 0 || s > tr.L.len) continue;
    const q = this.map.at(tr.L, s, tr.dir * 2 * PXM), z = tr.L.zAt ? tr.L.zAt(s) : 0, o = { L: tr.L, s, x: q.x, y: q.y, a: q.a + (tr.dir < 0 ? Math.PI : 0), z, end: i === 0 ? 'front' : i === nC - 1 ? 'back' : 'mid' }; (z > .015 ? out : low).push(o);
  }
};
/* trenes a nivel del suelo (antes que el jugador); en pixel clásico se queda el dibujo de siempre */
Ride.prototype.drawTrenesSuelo = function (c, ox, oy, inV, spr) { this.altVagones(); const cl = SIS.metro.carL * PXM, night = Art.night(this.min) > .5; for (const q of this._lowCars) if (inV(q.x, q.y, 30)) { c.fillStyle = 'rgba(0,0,0,.22)'; SisSpr.dib(c, 'metro', q.L.col, cl, SIS.metro.W * PXM, q.x - ox, q.y - oy, q.a, 1, q.end, night); } };
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
