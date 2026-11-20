/* =====================================================================
   MUNDO ÚNICO 3D (3.0) · un solo mundo, varias cámaras
   Antes cada vista dibujaba su propio mundo (cenital y maqueta en 2D, la 3D aparte, con cubos por árboles y cajas
   por casas). Ahora el mundo es UNO, en 3D (como #DRIVE, Pako Forever o Reckless Getaway: cámara de arriba, mundo en 3D),
   y las vistas son cámaras sobre él. El suelo sigue siendo la losa 2D (vías, andenes, pasto con su desgaste), pero ya
   sin los árboles ni los techos pintados: esos son volumen. Lo que sale aquí:
   - Edificios con fachada: zócalo de color (Guatapé), ventanas con marco y vidrio (algunas encendidas de noche), puerta,
     balcones con baranda, cornisa, techo a dos aguas con alero o plancha con pretil y tanque. Detalle por distancia (LOD).
   - Árboles low-poly facetados, los MISMOS de las vistas 2D (MC.Arboleda: posición, especie, radio y alto):
     guayacanes florecidos, ceiba ancha, mango denso, monte cónico.
   - Carros con cabina, vidrio, ruedas y luces; busetas con su franja de ventanas; motos y bicis con ruedas;
     personas con cabeza, pelo, torso y piernas.
   Todas las caras se orientan «hacia afuera» respecto a un centro (la luz plana por cara da el aspecto low-poly).
   ===================================================================== */
const PAL_ZOCALO = ['#c0392b', '#1f6fb2', '#e2b31b', '#2a9d5c', '#7d3c98', '#e0782a', '#138d75', '#d6336c', '#2c3e50'];
const osc3 = (c, k) => [c[0] * k, c[1] * k, c[2] * k], acl3 = (c, k) => [c[0] + (1 - c[0]) * k, c[1] + (1 - c[1]) * k, c[2] + (1 - c[2]) * k];
Object.assign(Malla.prototype, {
  /* triángulo y cuadro con la cara hacia afuera de ctr */
  triF(a, b, c, col, e, ctr) { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, mx = (a[0] + b[0] + c[0]) / 3 - ctr[0], my = (a[1] + b[1] + c[1]) / 3 - ctr[1], mz = (a[2] + b[2] + c[2]) / 3 - ctr[2]; if (nx * mx + ny * my + nz * mz < 0) this.tri(a, c, b, col, e); else this.tri(a, b, c, col, e); },
  quadF(a, b, c, d, col, e, ctr) { this.triF(a, b, c, col, e, ctr); this.triF(a, c, d, col, e, ctr); },
  /* esfera low-poly (icosaedro, con temblor fijo en los vértices): color arriba y abajo según la cara */
  esfera(cx, cy, cz, rx, ry, rz, col, colB, sem = 1, sub = 0) {
    const t = (1 + Math.sqrt(5)) / 2; let V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(v => { const l = Math.hypot(...v); return v.map(q => q / l); });
    let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    if (sub) { const C = new Map(), mid = (a, b) => { const k = a < b ? a + ',' + b : b + ',' + a; let i = C.get(k); if (i == null) { const m = V[a].map((q, j) => (q + V[b][j]) / 2), l = Math.hypot(...m); i = V.length; V.push(m.map(q => q / l)); C.set(k, i); } return i; }; const F2 = []; for (const [a, b, c] of F) { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); F2.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); } F = F2; }
    const P = V.map((v, i) => { const j = 1 + (h2(i, sem, 71) - .5) * .28; return [cx + v[0] * rx * j, cy + v[1] * ry * j, cz + v[2] * rz * j]; }), ctr = [cx, cy, cz];
    for (const [a, b, c] of F) { const ny = (V[a][1] + V[b][1] + V[c][1]) / 3, k = clamp(ny * .5 + .5, 0, 1), cc = [colB[0] + (col[0] - colB[0]) * k, colB[1] + (col[1] - colB[1]) * k, colB[2] + (col[2] - colB[2]) * k], v = .92 + h2(a + b * 7, c + sem, 72) * .16; this.triF(P[a], P[b], P[c], osc3(cc, v), 0, ctr); }
  },
  /* cilindro (o cono si rTop = 0) vertical de n lados, con tapa */
  cil(x, y, z, r, h, n, col, rTop = r, colTapa = col) {
    const ctr = [x, y + h / 2, z], A = [], B = []; for (let i = 0; i < n; i++) { const t = i / n * TAU; A.push([x + Math.cos(t) * r, y, z + Math.sin(t) * r]); B.push([x + Math.cos(t) * rTop, y + h, z + Math.sin(t) * rTop]); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; if (rTop > 1e-3) this.quadF(A[i], A[j], B[j], B[i], col, 0, ctr); else this.triF(A[i], A[j], B[i], col, 0, ctr); }
    if (rTop > 1e-3) for (let i = 1; i < n - 1; i++) this.triF(B[0], B[i], B[i + 1], colTapa, 0, [x, y, z]);
  },
  /* caja orientada con caras hacia afuera (la caja() vieja se queda para lo que ya la usa) */
  cajaF(x, y, z, a, L, W, Hh, col, e = 0, colTapa = col) { const c = Math.cos(a), s = Math.sin(a), hx = L / 2, hz = W / 2, P = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([u, v]) => [x + u * c - v * s, z + u * s + v * c]), b = P.map(p => [p[0], y, p[1]]), t = P.map(p => [p[0], y + Hh, p[1]]), ctr = [x, y + Hh / 2, z]; for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; this.quadF(b[i], b[j], t[j], t[i], col, e, ctr); } this.quadF(t[0], t[1], t[2], t[3], colTapa, e, ctr); this.quadF(b[0], b[1], b[2], b[3], osc3(col, .6), 0, ctr); },
  /* un árbol de MC.Arboleda (x, z en GL relativos a O; y = pie) */
  arbol3d(x, y, z, t, detalle = 3) {
    const E = Arboleda.ESPECIES[t.e] || Arboleda.ESPECIES.urapan, hx = h2(t.x | 0, t.y | 0, 81), r = t.r, H = t.h, cop = E.copa.map(hex3), flor = E.flor && hx < (E.flores || 0) + .25 ? E.flor.map(hex3) : null, tronco = hex3(t.e === 'ceiba' ? '#8a7f6c' : '#5b4430'), sub = detalle >= 3 ? 1 : 0, sem = (t.x * 13 + t.y * 7) | 0;
    const alto = Math.max(1.6, H * (E.forma === 'ancha' ? .55 : E.forma === 'conica' ? .25 : .42));
    this.cil(x, y, z, Math.max(.16, r * .09), alto + r * .3, 5, tronco, Math.max(.1, r * .06));
    if (E.forma === 'conica') { for (let i = 0; i < 3; i++) { const yb = y + alto + i * (H - alto) * .26, rr = r * (1.05 - i * .26); this.cil(x, yb, z, rr, (H - alto) * .5, 7, osc3(cop[1 + (i > 0)], .9 + i * .06), 0); } return; }
    const C1 = flor ? flor[1] : cop[1], C2 = flor ? flor[0] : cop[0], top = flor ? flor[2] : cop[2], yc = y + alto + (H - alto) * .5, rv = (H - alto) * .55;
    const ancho = E.forma === 'ancha' ? 1.45 : E.forma === 'densa' ? 1.15 : 1;
    this.esfera(x, yc, z, r * ancho, rv * (E.forma === 'ancha' ? .62 : 1), r * ancho, acl3(C1, .08), osc3(C2, .75), sem, sub);
    if (detalle >= 2) for (let i = 0; i < (E.forma === 'ancha' ? 3 : 2); i++) { const a = hx * 6.28 + i * 2.2, d = r * ancho * .62; this.esfera(x + Math.cos(a) * d, yc + rv * (.15 - i * .12), z + Math.sin(a) * d, r * .62, rv * .55, r * .62, i ? top : C1, osc3(C2, .7), sem + i + 1, 0); }
  },
  /* edificio con fachada (P: huella del mapa; O: origen GL; zb: pie en GL; e: el edificio del mundo; st: su estilo) */
  edificio3d(P, O, zb, e, st, detalle, Z, noche = 0) {
    const muro = hex3(st.muro), techo = hex3(st.techo), H = e.h, zt = zb + H + .3, sem = (e.s * 1e5) | 0, casa = H <= 10.5;
    if (detalle < 2) { this.prisma(P, O, zb, zt, muro, techo, {}); return; }
    const n = P.length >> 1, V = []; let A = 0, cx = 0, cz = 0; for (let i = 0; i < n; i++) { V.push([P[2 * i] - O[0], P[2 * i + 1] - O[1]]); cx += V[i][0] / n; cz += V[i][1] / n; }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; A += V[i][0] * V[j][1] - V[j][0] * V[i][1]; }
    const sg = A > 0 ? 1 : -1, ctr = [cx, zb + H / 2, cz];   // normal hacia afuera: (dz, −dx) si la huella va antihoraria (A > 0)
    /* cuerpo y techo (a dos aguas con alero en casas rectangulares; plancha con pretil y tanque en el resto) */
    const dos = !st.plano && !e.P && n === 4;
    this.prisma(P, O, zb, zt, muro, techo, dos ? { dosAguas: { ancho: Math.min(e.hw, e.hd) * 2 } } : {});
    if (dos) { const al = .45; for (let i = 0; i < n; i++) { const a = V[i], b = V[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1) continue; const nx = (b[1] - a[1]) / L * sg, nz = -(b[0] - a[0]) / L * sg; this.quadF([a[0], zt - .05, a[1]], [b[0], zt - .05, b[1]], [b[0] + nx * al, zt - .25, b[1] + nz * al], [a[0] + nx * al, zt - .25, a[1] + nz * al], osc3(techo, .8), 0, [cx, zt - 3, cz]); } }
    else if (detalle >= 3 || !casa) {
      for (let i = 0; i < n; i++) { const a = V[i], b = V[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < .8) continue; const nx = (b[1] - a[1]) / L * sg * .18, nz = -(b[0] - a[0]) / L * sg * .18, a2 = [a[0] - nx, a[1] - nz], b2 = [b[0] - nx, b[1] - nz]; this.quadF([a[0], zt, a[1]], [b[0], zt, b[1]], [b[0], zt + .55, b[1]], [a[0], zt + .55, a[1]], osc3(muro, .93), 0, ctr); this.quadF([a2[0], zt, a2[1]], [b2[0], zt, b2[1]], [b2[0], zt + .55, b2[1]], [a2[0], zt + .55, a2[1]], osc3(muro, .8), 0, [cx, zt + 5, cz]); this.quadF([a[0], zt + .55, a[1]], [b[0], zt + .55, b[1]], [b2[0], zt + .55, b2[1]], [a2[0], zt + .55, a2[1]], acl3(muro, .2), 0, [cx, zt - 5, cz]); }
      if (st.tanque || h2(sem, 3, 82) < .35) this.cil(cx + (h2(sem, 4, 83) - .5) * Math.min(e.hw, 4), zt, cz + (h2(sem, 5, 83) - .5) * Math.min(e.hd, 4), .62, 1.25, 7, hex3('#1d2228'), .62, hex3('#2b3138'));
    }
    if (detalle < 3 && !casa) return;
    /* fachada por cada muro: zócalo, ventanas con marco y vidrio, puerta, balcones y cornisa */
    const zoc = casa && h2(sem, 6, 84) < (Z.zocalos ?? .6) ? hex3(PAL_ZOCALO[(sem >>> 3) % PAL_ZOCALO.length]) : osc3(muro, .72), marco = acl3(muro, .55), vidrio = [.16, .2, .26], luz = [1, .84, .5], puerta = hex3(['#6b3e26', '#2f5d8a', '#8a2f2f', '#2f6b45'][sem % 4]), cor = acl3(muro, .3);
    const pisos = Math.max(1, Math.floor((H - .4) / 3)); let largo = -1, iL = 0; for (let i = 0; i < n; i++) { const a = V[i], b = V[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L > largo) { largo = L; iL = i; } }
    const pared = (a, b, u0, u1, y0, y1, off, col, em = 0) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = (b[1] - a[1]) / L * sg * off, nz = -(b[0] - a[0]) / L * sg * off, A1 = [a[0] + (b[0] - a[0]) * u0 + nx, a[1] + (b[1] - a[1]) * u0 + nz], B1 = [a[0] + (b[0] - a[0]) * u1 + nx, a[1] + (b[1] - a[1]) * u1 + nz]; this.quadF([A1[0], y0, A1[1]], [B1[0], y0, B1[1]], [B1[0], y1, B1[1]], [A1[0], y1, A1[1]], col, em, ctr); };
    for (let i = 0; i < n; i++) {
      const a = V[i], b = V[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 2) continue;
      pared(a, b, 0, 1, zb, zb + .95, .03, zoc);                                   // zócalo
      if (!dos) pared(a, b, 0, 1, zt - .38, zt, .05, cor);                      // cornisa
      const cols = Math.max(1, Math.floor(L / 2.7)), pta = i === iL ? Math.floor(cols / 2) : -1;
      for (let p = 0; p < pisos; p++) for (let q = 0; q < cols; q++) {
        const um = (q + .5) / cols, w = Math.min(1.1, L / cols * .45) / L, y0 = zb + (p === 0 ? 1.15 : 1.0 + p * 3), y1 = y0 + (p === 0 ? 1.15 : 1.3);
        if (p === 0 && q === pta) { const wd = Math.min(1.2, L / cols * .5) / L; pared(a, b, um - wd / 2 - .08 / L, um + wd / 2 + .08 / L, zb + .1, zb + 2.35, .04, marco); pared(a, b, um - wd / 2, um + wd / 2, zb + .1, zb + 2.25, .06, puerta); continue; }
        if (h2(sem + i * 31 + q, p, 85) < .12) continue;
        const enc = h2(sem + q * 7, p + i * 13, 86) < .45 ? 1 : 0;
        pared(a, b, um - w / 2 - .1 / L, um + w / 2 + .1 / L, y0 - .1, y1 + .1, .04, marco);
        pared(a, b, um - w / 2, um + w / 2, y0, y1, .065, enc ? luz : vidrio, enc);
        if (p > 0 && (q + p) % 2 === 0 && h2(sem, q + p * 5, 87) < .55) {         // balcón con baranda
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), bx = a[0] + (b[0] - a[0]) * um + (b[1] - a[1]) / L * sg * .38, bz = a[1] + (b[1] - a[1]) * um - (b[0] - a[0]) / L * sg * .38, bw = (w * L) + .7;
          this.cajaF(bx, y0 - .25, bz, ang, bw, .75, .12, acl3(muro, .15)); pared(a, b, um - (bw / 2) / L, um + (bw / 2) / L, y0 - .13, y0 + .62, .76, hex3('#2a2d33'));
        }
      }
    }
  },
  /* carro low-poly (o buseta, camión, moto o bici) en (x, y, z) GL con rumbo a */
  carro3d(x, y, z, a, L, W, col, tipo = 'carro', noche = 0) {
    const c = hex3(col), ca = Math.cos(a), sa = Math.sin(a), pt = (u, v, h) => [x + u * ca - v * sa, y + h, z + u * sa + v * ca], rueda = hex3('#16181c');
    if (tipo === 'moto' || tipo === 'bici') { this.cajaF(x, y + .45, z, a, L * .55, .22, .35, c); for (const u of [-L * .36, L * .36]) { const p = pt(u, 0, 0); this.cajaF(p[0], y + .02, p[2], a, .62, .12, .62, rueda); } if (noche > .3) { const f = pt(L * .45, 0, .75); this.cajaF(f[0], f[1], f[2], a, .1, .14, .12, [1, .95, .7], 1); } return; }
    const alto = tipo === 'buseta' || tipo === 'camion' || tipo === 'bus' ? 2.6 : 1.0, bajo = .34;
    for (const [u, v] of [[L * .32, W * .44], [L * .32, -W * .44], [-L * .32, W * .44], [-L * .32, -W * .44]]) { const p = pt(u, v, 0); this.cajaF(p[0], y + .02, p[2], a, .66, .26, .64, rueda); }
    if (alto > 2) {                                                          // buseta, bus o camión: caja con franja de ventanas
      this.cajaF(x, y + bajo, z, a, L, W, alto, c, 0, acl3(c, .25));
      if (tipo !== 'camion') for (const s of [1, -1]) { const p = pt(-L * .05, s * (W / 2 + .02), 1.55 + bajo); this.cajaF(p[0], p[1], p[2], a, L * .78, .04, .8, [.12, .16, .2]); }
      else { const p = pt(L * .38, 0, bajo + 1.0); this.cajaF(p[0], p[1], p[2], a, L * .18, W * .96, .7, [.12, .16, .2]); }
    } else {                                                                 // carro: chasis, capó y cabina de vidrio
      this.cajaF(x, y + bajo, z, a, L, W, .55, c, 0, acl3(c, .12));
      const cb = pt(-L * .06, 0, bajo + .55); this.cajaF(cb[0], cb[1], cb[2], a, L * .5, W * .84, .5, [.14, .19, .24], 0, c);
    }
    const fl = pt(L / 2 + .01, W * .32, bajo + .32), fr = pt(L / 2 + .01, -W * .32, bajo + .32), bl = pt(-L / 2 - .01, W * .32, bajo + .32), br = pt(-L / 2 - .01, -W * .32, bajo + .32), on = noche > .3 ? 1 : 0;
    for (const p of [fl, fr]) this.cajaF(p[0], p[1], p[2], a, .06, .32, .14, on ? [1, .95, .75] : [.85, .85, .8], on);
    for (const p of [bl, br]) this.cajaF(p[0], p[1], p[2], a, .06, .3, .14, [.75, .08, .08], on);
  },
  /* persona (peatón): piernas, torso, brazos, cabeza y pelo */
  persona3d(x, y, z, a, A, fase = 0, alto = 1.7) {
    const k = alto / 1.7, ca = Math.cos(a), sa = Math.sin(a), sw = Math.sin(fase) * .22, pt = (u, v, h) => [x + u * ca - v * sa, y + h * k, z + u * sa + v * ca];
    const pan = hex3(A.cPantalon), cam = hex3(A.cCamisa), piel = hex3(A.cPiel), pelo = hex3(A.cPelo || '#2b1d14');
    for (const [s, f] of [[.1, sw], [-.1, -sw]]) { const p = pt(f * .35, s, 0); this.cajaF(p[0], p[1], p[2], a + f * .4, .2, .17, .86 * k, pan); }
    const t = pt(0, 0, .86); this.cajaF(t[0], t[1], t[2], a, .26, .44, .6 * k, cam);
    for (const [s, f] of [[.27, -sw], [-.27, sw]]) { const p = pt(f * .3, s, .9); this.cajaF(p[0], p[1], p[2], a, .13, .12, .55 * k, A.manga ? cam : piel); }
    const h = pt(0, 0, 1.62); this.esfera(h[0], h[1], h[2], .14 * k, .16 * k, .14 * k, piel, osc3(piel, .85), 3, 0);
    const pl = pt(-.03, 0, 1.69); this.esfera(pl[0], pl[1], pl[2], .15 * k, .1 * k, .15 * k, pelo, osc3(pelo, .8), 5, 0);
  }
});
MC.Mundo3D = { PAL_ZOCALO };
