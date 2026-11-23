/* =====================================================================
   EL TRANSPORTE EN EL MUNDO 3D (ronda 3.2, Claude) · lo que la cenital ya tenía (76-altura.js, 74-sistema.js y 35-life.js),
   ahora en volumen y con LOS MISMOS DATOS (un solo mundo):
   - el VIADUCTO del metro (líneas A y B) con su tablero, sus barandas y sus columnas cada 30 m; las ESTACIONES elevadas con
     su andén ancho, la cubierta con la franja del color de la línea, sus columnas y el edificio de acceso debajo;
   - los PUENTES de las vías, a su altura, con sus columnas; los carros y tú van ENCIMA (antes quedaban metidos en el tablero);
   - los TRENES del metro (3 vagones de 22 m, con ventanas) por el viaducto, el TRANVÍA de Ayacucho (2 coches de 19,5 m con su
     franja verde), los buses del METROPLÚS por su carril y los METROCABLES: cable doble a 14 m, torres cada 260 m, estaciones
     de 28 × 18 m y cabinas cada 60 m que avanzan a 5 m/s, cada sentido por su cable (las medidas de El Metro).
   Sin WebGL no cambia nada: la cenital ya dibuja todo esto.
   ===================================================================== */
(function () {
  if (typeof Mundo3D === 'undefined') return;
  const G = Mundo3D, m = PXM;
  /* un triángulo y un cuadrilátero con su cara hacia la normal n (los puntos van como [x, altura, y], igual que en prisma) */
  const tri = (o, a, b, c, n, col) => { for (const p of [a, b, c]) o.push(p[0], p[1], p[2], n[0], n[1], n[2], col[0], col[1], col[2], 0, 0); };
  const quad = (o, a, b, c, d, n, col) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) { tri(o, a, b, c, n, col); tri(o, a, c, d, n, col); } else { tri(o, a, c, b, n, col); tri(o, a, d, c, n, col); }
  };
  /* caja con ventanas (los trenes y los buses): la misma caja de 99d, con los muros marcados para el sombreador */
  G.cajaV = function (o, x, y, a, Lg, W, h, z0, col) { const c = Math.cos(a), s = Math.sin(a), P = [[-Lg / 2, -W / 2], [Lg / 2, -W / 2], [Lg / 2, W / 2], [-Lg / 2, W / 2]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]); this.prisma(o, P, z0, z0 + h, col, col, null, true); };
  /* una cinta a lo largo de una pieza de 76-altura.js (X, Y, NX, NY): de -hw a +hw, con su cara de arriba en zT(i), su grosor th,
     la cara de abajo y los dos costados */
  const cinta = (o, b, hw, zT, th, cTop, cLado, cAbajo) => {
    for (let i = 0; i + 1 < b.n; i++) {
      const xa = b.X[i], ya = b.Y[i], xb = b.X[i + 1], yb = b.Y[i + 1], nax = b.NX[i], nay = b.NY[i], nbx = b.NX[i + 1], nby = b.NY[i + 1], za = zT(i), zb = zT(i + 1);
      const L0 = [xa + nax * hw, ya + nay * hw], R0 = [xa - nax * hw, ya - nay * hw], L1 = [xb + nbx * hw, yb + nby * hw], R1 = [xb - nbx * hw, yb - nby * hw];
      quad(o, [L0[0], za, L0[1]], [L1[0], zb, L1[1]], [R1[0], zb, R1[1]], [R0[0], za, R0[1]], [0, 1, 0], cTop);
      if (cAbajo) quad(o, [L0[0], za - th, L0[1]], [L1[0], zb - th, L1[1]], [R1[0], zb - th, R1[1]], [R0[0], za - th, R0[1]], [0, -1, 0], cAbajo);
      quad(o, [L0[0], za, L0[1]], [L1[0], zb, L1[1]], [L1[0], zb - th, L1[1]], [L0[0], za - th, L0[1]], [nax, 0, nay], cLado);
      quad(o, [R0[0], za, R0[1]], [R1[0], zb, R1[1]], [R1[0], zb - th, R1[1]], [R0[0], za - th, R0[1]], [-nax, 0, -nay], cLado);
    }
  };
  /* una baranda: muro delgado a lo largo del borde (lado sd), de z a z + h, con su cara de afuera y la de adentro */
  const baranda = (o, b, hw, zT, h, col) => {
    for (const sd of [1, -1]) for (let i = 0; i + 1 < b.n; i++) {
      const pa = [b.X[i] + b.NX[i] * hw * sd, b.Y[i] + b.NY[i] * hw * sd], pb = [b.X[i + 1] + b.NX[i + 1] * hw * sd, b.Y[i + 1] + b.NY[i + 1] * hw * sd], za = zT(i), zb = zT(i + 1), n = [b.NX[i] * sd, 0, b.NY[i] * sd];
      quad(o, [pa[0], za, pa[1]], [pb[0], zb, pb[1]], [pb[0], zb + h, pb[1]], [pa[0], za + h, pa[1]], n, col);
      quad(o, [pa[0], za, pa[1]], [pb[0], zb, pb[1]], [pb[0], zb + h, pb[1]], [pa[0], za + h, pa[1]], [-n[0], 0, -n[2]], col.map(v => v * .85));
    }
  };
  const C = { tablero: [.8, .8, .78], lado: [.66, .66, .64], abajo: [.5, .5, .5], pilar: [.7, .7, .68], asfalto: [.36, .37, .4], techo: [.94, .94, .9], hall: [.86, .83, .76] };
  /* ---------- lo quieto de cada trozo: viaducto, estaciones y puentes ---------- */
  G.extraMalla = function (o, cx, cy) {
    const M = JE.map, A = M.altG && M.altG.get(cx + ',' + cy); if (!A || !A.length) return; const ZA = this.ZA;
    for (const b of A) {
      if (b.t !== 'm' && b.t !== 'p' || !b.n) continue;
      const metro = b.t === 'm', est = metro && b.est, th = (metro ? 1.7 : 1.1) * m, zT = i => b.Z[i] * ZA, hw = est ? ALT_SW : b.hw;
      if (b.Z.every(z => z * ZA < 1)) continue;   // a ras del piso: lo pinta la textura
      cinta(o, b, hw, zT, th, metro ? C.tablero : C.asfalto, C.lado, C.abajo);
      baranda(o, b, hw, zT, (metro ? 1.1 : 1) * m, metro ? C.lado : C.pilar);
      const ang = i => Math.atan2(-b.NX[i], b.NY[i]);
      for (const k of b.pil) {   // columnas: la del metro en T, con su viga atravesada bajo el tablero
        const z = zT(k) - th; if (z < 2) continue; const a = ang(k);
        this.caja(o, b.X[k], b.Y[k], a, (metro ? 2.2 : 1.5) * m, (metro ? 2.2 : 1.5) * m, z, 0, C.pilar);
        if (metro) this.caja(o, b.X[k], b.Y[k], a, 1.8 * m, hw * 1.8, 1.2 * m, z - 1.2 * m, C.pilar);
      }
      if (est) {   // la estación: cubierta con la franja de la línea, columnas en sus bordes y el edificio de acceso debajo
        const zr = i => (b.Z[i] + ALT.techo) * ZA, col = this.rgb(b.col || (b.L && b.L.col) || '#1C5C9C');
        cinta(o, b, hw * 1.06, zr, .8 * m, C.techo, col, C.lado);
        for (const i of [0, b.n - 1]) for (const sd of [1, -1]) { const z0 = zT(i), z1 = zr(i) - .8 * m; if (z1 > z0) this.caja(o, b.X[i] + b.NX[i] * hw * .96 * sd, b.Y[i] + b.NY[i] * hw * .96 * sd, ang(i), .9 * m, .9 * m, z1 - z0, z0, C.pilar); }
        for (const h of b.hall || []) {
          const L = b.L; if (!L || h.b - h.a < 2) continue; const q = M.at(L, (h.a + h.b) / 2), hz = b.Z[b.n >> 1] * ZA - th - .3 * m; if (hz < 3) continue;
          const a = q.a, c = Math.cos(a), s = Math.sin(a), Lg = h.b - h.a, W = ALT_SW * 1.3, P = [[-Lg / 2, -W / 2], [Lg / 2, -W / 2], [Lg / 2, W / 2], [-Lg / 2, W / 2]].map(([u, v]) => [q.x + u * c - v * s, q.y + u * s + v * c]);
          this.prisma(o, P, 0, hz, C.hall, C.hall, C.hall.map(v => v * .92), true);
        }
      }
    }
  };
  /* ---------- los metrocables: cables, torres y estaciones (una sola malla para todo el valle) ---------- */
  G.extraFijo = function () {
    if (!this._cables) {
      const o = [], M = JE.map, zc = SIS.cable.z * m, vistas = new Map();
      for (const cb of M.cables || []) {
        if (!cb.len) continue; const ux = (cb.bx - cb.ax) / cb.len, uy = (cb.by - cb.ay) / cb.len, nx = -uy * 1.5 * m, ny = ux * 1.5 * m, a = Math.atan2(uy, ux), col = this.rgb(cb.col);
        for (const sd of [1, -1]) this.caja(o, (cb.ax + cb.bx) / 2 + nx * sd, (cb.ay + cb.by) / 2 + ny * sd, a, cb.len, .5, .5, zc, [.12, .12, .13]);   // el cable doble
        const n = Math.max(0, Math.round(cb.len / (SIS.cable.torre * m)) - 1);
        for (let k = 1; k <= n; k++) { const f = k / (n + 1), x = cb.ax + (cb.bx - cb.ax) * f, y = cb.ay + (cb.by - cb.ay) * f; this.caja(o, x, y, a, 1.5 * m, 1.5 * m, zc - .4 * m, 0, [.58, .6, .63]); this.caja(o, x, y, a, 1 * m, 4.4 * m, .8 * m, zc - .5 * m, [.42, .44, .47]); }
        for (const [x, y] of [[cb.ax, cb.ay], [cb.bx, cb.by]]) { const k = Math.round(x) + ',' + Math.round(y); if (!vistas.has(k)) vistas.set(k, { x, y, a, col }); }
      }
      for (const e of vistas.values()) {   // la estación: volumen claro, cornisa del color de la línea y la casa de la polea encima
        const c = Math.cos(e.a), s = Math.sin(e.a), P = [[-14, -9], [14, -9], [14, 9], [-14, 9]].map(([u, v]) => [e.x + (u * c - v * s) * m, e.y + (u * s + v * c) * m]);
        this.prisma(o, P, 0, zc - 1.5 * m, [.88, .86, .79], [.9, .88, .82], [.8, .78, .72], true);
        this.caja(o, e.x, e.y, e.a, 29 * m, 19 * m, 1.2 * m, zc - 1.5 * m, e.col); this.caja(o, e.x, e.y, e.a, 18 * m, 4.4 * m, 1.6 * m, zc - .3 * m, [.36, .37, .4]);
      }
      this._cables = o.length ? this.subir(o) : { n: 0 };
    }
    if (this._cables.n) this.pintar(this._cables);
  };
  /* ---------- lo que se mueve: trenes, tranvía, Metroplús y cabinas ---------- */
  G.extraMovil = function (o, R) {
    const M = JE.map, P = R.p, ZA = this.ZA, cerca = (x, y, r) => Math.abs(x - P.x) < r && Math.abs(y - P.y) < r;
    if (R.trains && (!R.metroOn || R.metroOn())) {   // el metro: 3 vagones blancos con la franja de su línea, a la altura del viaducto
      const cl = SIS.metro.carL * m, W = SIS.metro.W * m;
      for (const tr of R.trains) { if (!tr.L) continue; const col = this.rgb(tr.L.col || '#1C5C9C'); for (let j = -1; j <= 1; j++) {
        const s = tr.s + j * (cl + m); if (s < 0 || s > tr.L.len) continue; const q = M.at(tr.L, s); if (!cerca(q.x, q.y, 760)) continue; const z = (tr.L.zAt ? tr.L.zAt(s) : 0) * ZA;
        this.cajaV(o, q.x, q.y, q.a, cl, W, 3.5 * m, z + .4 * m, [.86, .88, .9]); this.caja(o, q.x, q.y, q.a, cl * 1.004, W * 1.04, .7 * m, z + .9 * m, col); this.caja(o, q.x, q.y, q.a, cl * .94, W * .9, .4 * m, z + 3.9 * m, [.52, .54, .57]);
      } }
    }
    const T = M.tram, tr = R.trm;   // el tranvía de Ayacucho: dos coches con su franja verde
    if (T && tr) { const cl = SIS.tram.carL * m, verde = this.rgb(SIS.tram.col); for (let i = 0; i < 2; i++) { const s = tr.s + (i ? -1 : 1) * tr.dir * (cl + m) / 2, q = M.at(T, clamp(s, 0, T.len)); if (!cerca(q.x, q.y, 760)) continue; this.cajaV(o, q.x, q.y, q.a, cl, SIS.tram.W * m, 3.3 * m, .3 * m, [.93, .94, .91]); this.caja(o, q.x, q.y, q.a, cl * 1.004, SIS.tram.W * m * 1.04, .8 * m, .6 * m, verde); } }
    if (R.brts) for (const v of R.brts) { const q = M.at(v.L, v.s, v.dir * 2.2 * m); if (!cerca(q.x, q.y, 700)) continue; this.cajaV(o, q.x, q.y, q.a, SIS.brt.L * m, SIS.brt.W * m, 3.1 * m, .4 * m, this.rgb(v.L.col || '#7ab648')); }   // Metroplús
    const t = R.mode && R.mode.t || 0, zc = SIS.cable.z * m, sep = SIS.cable.sep * m, cL = SIS.cable.L * m, cW = SIS.cable.W * m;
    for (const cb of M.cables || []) {   // las cabinas, cada 60 m, a 5 m/s, cada sentido por su cable
      if (!cb.len || Math.max(cb.ax, cb.bx) < P.x - 600 || Math.min(cb.ax, cb.bx) > P.x + 600 || Math.max(cb.ay, cb.by) < P.y - 600 || Math.min(cb.ay, cb.by) > P.y + 600) continue;
      const ux = (cb.bx - cb.ax) / cb.len, uy = (cb.by - cb.ay) / cb.len, nx = -uy * 1.5 * m, ny = ux * 1.5 * m, an = Math.atan2(uy, ux), col = this.rgb(cb.col), nc = Math.max(1, Math.floor(cb.len / sep));
      for (let k = 0; k < nc; k++) { const s = (k * sep + t * 5 * m) % cb.len; for (const [q, sd] of [[s, 1], [cb.len - s, -1]]) { const x = cb.ax + ux * q + nx * sd, y = cb.ay + uy * q + ny * sd; if (!cerca(x, y, 520)) continue; this.caja(o, x, y, an, .3 * m, .3 * m, 1.3 * m, zc - 1.3 * m, [.15, .15, .16]); this.cajaV(o, x, y, an, cL, cW, 2.4 * m, zc - 3.7 * m, col); } }
    }
  };
})();
