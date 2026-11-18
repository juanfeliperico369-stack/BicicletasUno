/* =====================================================================
   MAQUETA 2:1 en el mapa grande (adaptada de El Metro, src/js/24-iso.js, mismo autor)
   El valle real en proyección dimétrica: relieve (80 m, bilineal), calles, río, parques, casas y
   edificios con la altura de sus huellas reales. Se dibuja por columnas de adelante hacia atrás con un
   búfer de altura; queda en caché y mientras se arrastra solo se mueve la imagen.
   Pantalla: x = (u − v)·a ; y = (u + v)·a/2 − (z − Z0)·a·kz, con (u, v) el mundo (m) girado 0, 90, 180 o 270°.
   ===================================================================== */
const Maqueta = JE.maqueta = {
  kz: 1.35, Z0: 1500, rot: 0, cv: null, ms: 0,
  R(x, y) { switch (this.rot) { case 1: return [y, -x]; case 2: return [-x, -y]; case 3: return [-y, x]; default: return [x, y]; } },
  Ri(u, v) { switch (this.rot) { case 1: return [-v, u]; case 2: return [-u, -v]; case 3: return [v, -u]; default: return [u, v]; } },
  P(x, y, z, c, w, h) { const [u, v] = this.R(x, y), [U, V] = this.R(c.x, c.y); return { x: w / 2 + ((u - v) - (U - V)) * c.a, y: h / 2 + ((u + v) - (U + V)) * c.a / 2 - (z - this.Z0) * c.a * this.kz }; },
  Pi(sx, sy, c, w, h) { const [U, V] = this.R(c.x, c.y), p = (sx - w / 2) / c.a + (U - V), q = (sy - h / 2) * 2 / c.a + (U + V), [x, y] = this.Ri((p + q) / 2, (q - p) / 2); return { x, y }; },
  elev(x, y) { return JE.map.elevT(x / VM.tile, y / VM.tile); },
  prep() {
    const E = JE.map.E, W = VM.eW, H = VM.eH, hs = new Float32Array(W * H), B = 8, bw = Math.ceil(W / B), bh = Math.ceil(H / B), bm = new Float32Array(bw * bh);
    let zmin = 1e9, zmax = -1e9;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i, e = E[k], nw = E[Math.max(0, j - 1) * W + Math.max(0, i - 1)]; hs[k] = clamp(1 + (nw - e) * .0068, .62, 1.3); zmin = Math.min(zmin, e); zmax = Math.max(zmax, e); const b = (j / B | 0) * bw + (i / B | 0); if (e > bm[b]) bm[b] = e; }
    this.hs = hs; this.bm = bm; this.bw = bw; this.zmin = zmin; this.zmax = zmax;
  },
  COL: (() => { const c = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    return { 0: c('#6f9a4a'), 1: c('#3d6838'), 4: c('#4a4e57'), 5: c('#44484f'), 6: c('#cdc6b8'), 7: c('#2e9d55'), 8: c('#3a7a8e'), 9: c('#4a7878'), 10: c('#d9cdae'), 11: c('#96969a'), 12: c('#9bd341'), 13: c('#a99a7a'), 14: c('#3a3e45'), 15: c('#5ab0d0'), 16: c('#c6c0b4') }; })(),
  TECHO: [[154, 160, 166], [185, 181, 173], [167, 170, 168], [207, 200, 187], [176, 168, 150]], MURO: [[230, 220, 200], [216, 210, 196], [201, 206, 212], [239, 232, 216]],
  TEJA: [[180, 88, 58], [162, 75, 48], [196, 104, 63]], LADR: [[169, 83, 58], [184, 92, 62]],
  /* altura (m) de un edificio: pisos del más alto de su zona (huellas reales), con variación por bloque de 40 m */
  bAlt(tx, ty) { const M = JE.map, f = M.hg ? M.hg[clamp(ty >> 3, 0, VM.mH - 1) * VM.mW + clamp(tx >> 3, 0, VM.mW - 1)] : 0, r = h2(tx >> 2, ty >> 2, 77); return f ? Math.max(6, f * 3 * (.5 + .5 * r)) : 9 + r * 18; },
  render(c, W, H) {
    if (!this.hs) this.prep();
    if (!this.cv || this.cv.width !== W || this.cv.height !== H) { this.cv = document.createElement('canvas'); this.cv.width = W; this.cv.height = H; this.cx = this.cv.getContext('2d'); this.im = this.cx.createImageData(W, H); this.d = new Uint32Array(this.im.data.buffer); }
    const t0 = performance.now(), d = this.d, a = c.a, kz = this.kz, Z0 = this.Z0, [U0, V0] = this.R(c.x, c.y), P0 = U0 - V0, Q0 = U0 + V0, TM = VM.tile;
    const M = JE.map, E = M.E, eW = VM.eW, eH = VM.eH, G = TM * ES, Tt = M.t, hs = this.hs, bm = this.bm, bw = this.bw, mW = MW * TM, mH = MH * TM;
    const [ax, ay] = this.Ri(1, 0), [bx, by] = this.Ri(0, 1), half = a / 2, kzA = a * kz, dq = 2 / a, zTop = this.zmax + 180;
    const qF = Q0 + H / a + 2 * kz * Math.max(0, zTop - Z0), qB = Q0 - H / a - 2 * kz * Math.max(0, zTop - this.zmin) - 8 / a;
    const pk = (r, g, b) => 0xff000000 | (b << 16) | (g << 8) | r, cielo = new Uint32Array(H);
    for (let y = 0; y < H; y++) { const t = y / H; cielo[y] = pk(159 + t * 70 | 0, 199 + t * 42 | 0, 230 + t * 15 | 0); }
    const COL = this.COL, TE = this.TECHO, MU = this.MURO, TJ = this.TEJA, LA = this.LADR, ventanas = a > .9;
    for (let i = 0; i < W; i++) {
      const p = (i + .5 - W / 2) / a + P0; let yb = H, dentro = false;
      for (let q = qF; q > qB && yb > 0; q -= dq) {
        const u = (p + q) * .5, v = (q - p) * .5, x = ax * u + bx * v, y = ay * u + by * v;
        if (x < 0 || y < 0 || x >= mW || y >= mH) { dentro = false; continue; }
        const gx = x / G, gy = y / G, ix = gx | 0, iy = gy | 0;
        if (H / 2 + (q - Q0) * half - (bm[(iy >> 3) * bw + (ix >> 3)] + 180 - Z0) * kzA >= yb) { dentro = true; continue; }   // ni lo más alto del bloque asomaría
        const fx = gx - ix, fy = gy - iy, k = iy * eW + ix, k2 = Math.min(ix + 1, eW - 1) - ix, k3 = iy + 1 < eH ? eW : 0;
        const e = (E[k] * (1 - fx) + E[k + k2] * fx) * (1 - fy) + (E[k + k3] * (1 - fx) + E[k + k3 + k2] * fx) * fy;
        const tx = x / TM | 0, ty = y / TM | 0, tv = Tt[ty * MW + tx], s = hs[k];
        let bh = 0, top, wall = null;
        if (tv === 3) { const hb = h2(tx >> 2, ty >> 2, 78); bh = this.bAlt(tx, ty); top = TE[hb * TE.length | 0]; wall = MU[(hb * 97 | 0) % MU.length]; }
        else if (tv === 2) { const hb = h2(tx, ty, 78); bh = 5 + hb * 4; top = hb < .45 ? TJ[(hb * 31 | 0) % 3] : TE[(hb * 13 | 0) % TE.length]; wall = LA[(hb * 7 | 0) & 1]; }
        else top = COL[tv] || COL[0];
        const z = e + bh, sy = H / 2 + (q - Q0) * half - (z - Z0) * kzA | 0;
        if (!dentro) {   // borde de la maqueta: el corte de tierra debajo de la primera casilla
          dentro = true;
          if (sy < yb) { const base = H / 2 + (q - Q0) * half - (this.zmin - 60 - Z0) * kzA | 0; for (let r = Math.max(sy + 1, 0), rb = Math.min(yb, base); r < rb; r++) d[r * W + i] = pk(92, 72, 52); yb = Math.max(0, Math.min(yb, sy + 1)); }
        }
        if (sy >= yb) continue;
        const r0 = sy < 0 ? 0 : sy, cTop = pk(Math.min(255, top[0] * s), Math.min(255, top[1] * s), Math.min(255, top[2] * s));
        if (wall) { const cW = pk(wall[0] * .86 | 0, wall[1] * .86 | 0, wall[2] * .86 | 0), cV = pk(46, 70, 96);
          for (let r = r0; r < yb; r++) { const hp = bh - (r - sy) / kzA; d[r * W + i] = r - sy < 2 ? cTop : ventanas && hp > 1.5 && (hp % 3.2) < 1.3 ? cV : cW; } }
        else for (let r = r0; r < yb; r++) d[r * W + i] = cTop;
        yb = r0;
      }
      for (let r = 0; r < yb; r++) d[r * W + i] = cielo[r];
    }
    this.cx.putImageData(this.im, 0, 0); this.ms = performance.now() - t0;
    return this.cv;
  }
};

/* ---------- en el mapa grande: botón ⬢ Maqueta, arrastre y pellizco propios, giro de 90° ---------- */
(() => {
  const st = $('#sGame'), cv = $('#cv'); if (!st || !cv) return;
  const on = () => MapView.open && MapView.iso, pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }, P = new Map();
  const span = () => { const a = [...P.values()]; return a.length > 1 ? Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1 : 1; };
  st.addEventListener('pointerdown', e => { if (!on() || e.target !== cv) return; e.stopImmediatePropagation(); e.preventDefault(); const p = pos(e); P.set(e.pointerId, { x: p.x, y: p.y, x0: p.x, y0: p.y, t: performance.now() }); if (P.size === 2) MapView.pz = span(); }, true);
  st.addEventListener('pointermove', e => { const q = P.get(e.pointerId); if (!on() || !q) return; e.stopImmediatePropagation(); const p = pos(e), c = MapView.icam;
    if (P.size === 1) { const dp = -(p.x - q.x) / c.a, dqq = -2 * (p.y - q.y) / c.a, [dx, dy] = Maqueta.Ri((dp + dqq) / 2, (dqq - dp) / 2); c.x = clamp(c.x + dx, 0, MW * VM.tile); c.y = clamp(c.y + dy, 0, MH * VM.tile); MapView.isoDrag = performance.now(); }
    q.x = p.x; q.y = p.y; if (P.size === 2 && MapView.pz) { const s = span(); MapView.isoZoom(s / MapView.pz); MapView.pz = s; } }, true);
  const up = e => { const q = P.get(e.pointerId); if (!q) return; P.delete(e.pointerId); if (!on()) return; e.stopImmediatePropagation(); if (!P.size && Math.hypot(q.x - q.x0, q.y - q.y0) < 9 && performance.now() - q.t < 450) MapView.tap(q.x, q.y); };
  st.addEventListener('pointerup', up, true); st.addEventListener('pointercancel', up, true);
  st.addEventListener('wheel', e => { if (!on()) return; e.preventDefault(); e.stopImmediatePropagation(); MapView.isoZoom(e.deltaY < 0 ? 1.2 : 1 / 1.2); }, { passive: false, capture: true });
})();
MapView.isoZoom = function (f) { const c = this.icam; c.a = clamp(c.a * f, .02, 2.4); };
const _draw86 = MapView.draw;
MapView.draw = function (V, ready) {
  if (!this.iso) { _draw86.call(this, V, ready); const top = (View.hudB || 50) + 6; this.btns.push({ x: V.w - 58, y: top + 208, w: 48, h: 44, fn: () => { this.iso = true; this.icam = { x: this.cx * M_PER_PX, y: this.cy * M_PER_PX, a: .5 }; this.isoKey = ''; } }); this.isoBtn(V, V.w - 58, top + 208, '⬢'); return; }
  const c = V.ctx, R = this.ride, cam = this.icam, w = V.w, h = V.h, top = (View.hudB || 50) + 6, now = performance.now();
  c.fillStyle = '#9fc7e6'; c.fillRect(0, 0, w, h);
  const res = this.isoRes || 1, cw = Math.ceil(w * res), ch = Math.ceil(h * res), key = [cam.x | 0, cam.y | 0, cam.a.toFixed(4), Maqueta.rot, cw, ch].join();
  if (key !== this.isoKey && (!this.isoCam || now - (this.isoDrag || 0) > 250)) {
    Maqueta.render({ x: cam.x, y: cam.y, a: cam.a * res }, cw, ch); this.isoKey = key; this.isoCam = { x: cam.x, y: cam.y, a: cam.a };
    this.isoRes = Maqueta.ms > 70 ? Math.max(.5, res * .8) : Maqueta.ms < 25 ? Math.min(1, res * 1.1) : res;   // si un dibujo pasa de 70 ms, baja la resolución sola
  }
  const o = this.isoCam, sc = cam.a / o.a, [U, Vv] = Maqueta.R(cam.x, cam.y), [Uo, Vo] = Maqueta.R(o.x, o.y);
  c.imageSmoothingEnabled = true; c.drawImage(Maqueta.cv, w / 2 - w / 2 * sc + ((Uo - Vo) - (U - Vv)) * cam.a, h / 2 - h / 2 * sc + ((Uo + Vo) - (U + Vv)) * cam.a / 2, w * sc, h * sc);
  // estaciones EnCicla, lugares y tú, sobre el relieve
  const S = (px, py, dz) => { const x = px * M_PER_PX, y = py * M_PER_PX; return Maqueta.P(x, y, Maqueta.elev(x, y) + (dz || 0), cam, w, h); };
  for (const s of JE.map.stations) { const q = S(s.x, s.y, 8); if (q.x < -10 || q.y < top || q.x > w + 10 || q.y > h) continue; c.fillStyle = '#0a2342'; c.fillRect(q.x - 4, q.y - 4, 8, 8); c.fillStyle = PAL.vd; c.fillRect(q.x - 3, q.y - 3, 6, 6); if (cam.a > .55) V.text(s.name, q.x, q.y - 8, { size: 9.5, align: 'center', color: '#fff', stroke: '#0a2342', sw: 3, body: true }); }
  if (cam.a > .25) for (const L of LANDMARKS) { if (L.secret || L.id === 'depot') continue; const q = S((L.x + L.w / 2) * TS, (L.y + L.h / 2) * TS, 30); if (q.x < 20 || q.y < top + 10 || q.x > w - 20 || q.y > h - 60) continue; V.text(L.name, q.x, q.y, { size: 10.5, align: 'center', color: '#ffe9a8', stroke: '#0a2342', sw: 3, body: true }); }
  { const q = S(R.p.x, R.p.y, 6); c.fillStyle = '#ff2fb3'; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(q.x, q.y, 6, 0, TAU); c.fill(); c.stroke(); }
  V.text('Maqueta 2:1 · arrastra, pellizca y gira', w / 2, h - 30, { size: 13, align: 'center', color: '#fff', bg: '#0a2342ee', pad: 6, body: true });
  this.btns = []; const B = (x, y, ww, hh, t, fn, bg) => { c.fillStyle = bg || '#0e2d55ee'; c.beginPath(); c.roundRect(x, y, ww, hh, 12); c.fill(); c.strokeStyle = '#ffffff55'; c.lineWidth = 1.5; c.stroke(); V.text(t, x + ww / 2, y + hh / 2 + 6, { size: 17, align: 'center', color: '#fff' }); this.btns.push({ x, y, w: ww, h: hh, fn }); };
  B(w - 58, top + 4, 48, 44, '✕', () => { this.iso = false; this.hide(); }, '#d6409fee'); B(w - 58, top + 56, 48, 44, '+', () => this.isoZoom(1.5)); B(w - 58, top + 104, 48, 44, '−', () => this.isoZoom(1 / 1.5));
  B(w - 58, top + 156, 48, 44, '◎', () => { cam.x = R.p.x * M_PER_PX; cam.y = R.p.y * M_PER_PX; }); B(w - 58, top + 208, 48, 44, '▦', () => { this.iso = false; this.cx = cam.x / M_PER_PX; this.cy = cam.y / M_PER_PX; this.clampC(); }, '#5e9a1eee'); B(w - 58, top + 260, 48, 44, '⟳', () => { Maqueta.rot = (Maqueta.rot + 1) % 4; this.isoKey = ''; });
};
MapView.isoBtn = function (V, x, y, t) { const c = V.ctx; c.fillStyle = '#5e9a1eee'; c.beginPath(); c.roundRect(x, y, 48, 44, 12); c.fill(); c.strokeStyle = '#ffffff55'; c.lineWidth = 1.5; c.stroke(); V.text(t, x + 24, y + 28, { size: 17, align: 'center', color: '#fff' }); };
