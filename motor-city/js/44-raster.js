/* =====================================================================
   RASTER · la «tarjeta gráfica» del motor hecha en Canvas 2D (3D por software, sin WebGL)
   Cuando el aparato no tiene WebGL, o su WebGL es por software (lento), las vistas en perspectiva (tercera y primera
   persona, dron y cine) se dibujan aquí, con la misma cámara, el mismo relieve y los mismos edificios:
   - Proyección en perspectiva con la cámara del motor (ojo, blanco y campo visual vertical).
   - Recorte contra el plano cercano (Sutherland–Hodgman) para que nada «se voltee» detrás del ojo.
   - Algoritmo del pintor: todo (relieve, edificios, sitios, tráfico y gente) se ordena de lejos a cerca.
   - Descarte de caras traseras y de lo que queda fuera del cono de visión; detalle según la calidad.
   - Luz del sol real (MC.Cielo), cielo en degradé y niebla por distancia y por clima.
   Es más simple que WebGL (colores planos, sin texturas), pero corre en cualquier navegador.
   ===================================================================== */
class Raster {
  constructor(mundo) { this.mundo = mundo; this.cota = new Map(); this.n = 0; }
  _z(x, y) { const k = (x | 0) * 73856093 ^ (y | 0); let v = this.cota.get(k); if (v === undefined) { v = this.mundo.cota(x, y); if (this.cota.size > 60000) this.cota.clear(); this.cota.set(k, v); } return v; }
  dibujar(g, W, H, E, op = {}) {
    const C = E.camara, M = this.mundo, cal = clamp(E.calidad ?? .8, .3, 1), cielo = E.cielo || { top: [.35, .55, .85], hor: [.75, .85, .95], bruma: [.8, .85, .9], ambiente: .8, luzSol: .6, noche: 0, sol: { x: .3, y: .3, z: .9 } };
    const o = C.ojo, b = C.blanco; let fx = b[0] - o[0], fy = b[1] - o[1], fz = b[2] - o[2], l = Math.hypot(fx, fy, fz) || 1; fx /= l; fy /= l; fz /= l;
    let rx = -fy, ry = fx; l = Math.hypot(rx, ry); if (l < 1e-3) { rx = Math.cos(C.yaw || 0); ry = Math.sin(C.yaw || 0); l = 1; } rx /= l; ry /= l;
    const ux = -fz * ry, uy = fz * rx, uz = fx * ry - fy * rx, F = (H / 2) / Math.tan((C.fov || 1) / 2), NEAR = .4;
    this._P = { o: [o[0], o[1], o[2]], fx, fy, fz, rx, ry, ux, uy, uz, t: Math.tan((C.fov || 1) / 2) };   /* 4.8 (pedido de Gemini): la misma proyección para flechas, conos y efectos */
    const R = (220 + 280 * cal) * (op.lejos || 1), niebla = E.clima ? E.clima.niebla || 0 : 0, lejos = R * (1 - niebla * .65), cerca = lejos * .35;
    const bruma = cielo.bruma, sol = cielo.sol || { x: 0, y: 0, z: 1 }, amb = cielo.ambiente ?? .8, luz = cielo.luzSol ?? .5;
    /* cielo */
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, css3(cielo.top)); gr.addColorStop(.55, css3(cielo.hor)); gr.addColorStop(1, css3(bruma)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const cam = (x, y, z) => { const dx = x - o[0], dy = y - o[1], dz = z - o[2]; return [dx * rx + dy * ry, dx * ux + dy * uy + dz * uz, dx * fx + dy * fy + dz * fz]; };
    const L = [], Ls = [], Lsh = []; const tanH = Math.tan((C.fov || 1) / 2) * (W / H) * 1.25;
    const visible = (x, y, r) => { const dx = x - o[0], dy = y - o[1], fl = Math.hypot(fx, fy) || 1, d = (dx * fx + dy * fy) / fl; if (d < -r) return false; const lat = Math.abs(dx * rx + dy * ry); return lat <= (Math.max(d, 0) + r * 2) * tanH + r + 30 && Math.hypot(dx, dy) < R + r; };
    const sombra = (nx, ny, nz) => clamp(.42 + .5 * amb + luz * Math.max(0, nx * sol.x + ny * sol.y + nz * sol.z) * .55 - (cielo.noche || 0) * .3, .3, 1.15);
    const color = (c, k, d) => css3(mez3([c[0] * k, c[1] * k, c[2] * k], bruma, clamp((d - cerca) / Math.max(1, lejos - cerca), 0, 1)));
    /* polígono en el mundo → recortado, proyectado y guardado con su profundidad */
    const poly = (P, col, k, suelo) => {
      let Q = P.map(p => cam(p[0], p[1], p[2])), S = [];
      for (let i = 0; i < Q.length; i++) { const a = Q[i], c = Q[(i + 1) % Q.length], ia = a[2] >= NEAR, ic = c[2] >= NEAR; if (ia) S.push(a); if (ia !== ic) { const t = (NEAR - a[2]) / (c[2] - a[2]); S.push([a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, NEAR]); } }
      if (S.length < 3) return; let d = 0; for (const s of S) d += s[2]; d /= S.length; if (d > lejos * 1.15) return;
      (suelo === 2 ? Lsh : suelo ? Ls : L).push({ d, pts: S.map(s => [W / 2 + s[0] / s[2] * F, H / 2 - s[1] / s[2] * F]), fill: suelo === 2 ? col : color(col, k, d), sh: suelo === 2 });
    };
    /* relieve: rejilla alrededor del ojo, más fina con más calidad */
    const PAL = (MC.arte.dato('suelo', PAL_SUELO) || PAL_SUELO).map(hex3), paso = cal > .75 ? 14 : cal > .5 ? 20 : 28, cx0 = Math.floor((o[0] - R) / paso), cx1 = Math.ceil((o[0] + R) / paso), cy0 = Math.floor((o[1] - R) / paso), cy1 = Math.ceil((o[1] + R) / paso);
    for (let j = cy0; j < cy1; j++) for (let i = cx0; i < cx1; i++) {
      const x = i * paso, y = j * paso, mx = x + paso / 2, my = y + paso / 2; if (!visible(mx, my, paso) || !M.dentro(mx, my)) continue;
      const z00 = this._z(x, y), z10 = this._z(x + paso, y), z11 = this._z(x + paso, y + paso), z01 = this._z(x, y + paso);
      const nx = (z00 + z01 - z10 - z11) / (2 * paso), ny = (z00 + z10 - z01 - z11) / (2 * paso), nl = Math.hypot(nx, ny, 1);
      poly([[x, y, z00], [x + paso, y, z10], [x + paso, y + paso, z11], [x, y + paso, z01]], PAL[M.suelo(mx, my)] || PAL[0], sombra(nx / nl, ny / nl, 1 / nl), true);
    }
    /* calles y ciclorrutas como cintas sobre el relieve (con su ancho real) */
    if (M._rejillaVias) { const { G, C: Cg } = M._rejillaVias(), VV = M.vias(), Rv = R * .55, vis = new Set(), asf = hex3('#4f545e'), cic = hex3('#3f9a55');
      for (let gy = Math.floor((o[1] - Rv) / Cg); gy <= Math.floor((o[1] + Rv) / Cg); gy++) for (let gx = Math.floor((o[0] - Rv) / Cg); gx <= Math.floor((o[0] + Rv) / Cg); gx++) { const a = G.get(gx * 65536 + gy); if (a) for (let q = 0; q < a.length; q += 2) vis.add(a[q]); }
      for (const i of vis) { const v = VV[i], p = v.p, w = (v.ancho || (v.k <= 2 ? 12 : 7)) / 2, col = v.k === VIA.CICLO ? cic : asf; if (v.k === VIA.CICLO && cal < .5) continue;
        for (let j = 0; j + 3 < p.length; j += 2) { const ax = p[j], ay = p[j + 1], bx = p[j + 2], by = p[j + 3], mx = (ax + bx) / 2, my = (ay + by) / 2, l2 = Math.hypot(bx - ax, by - ay) || 1; if (!visible(mx, my, l2)) continue; const nx = -(by - ay) / l2 * w, ny = (bx - ax) / l2 * w, za = this._z(ax, ay) + .15, zb = this._z(bx, by) + .15;
          poly([[ax + nx, ay + ny, za], [bx + nx, by + ny, zb], [bx - nx, by - ny, zb], [ax - nx, ay - ny, za]], col, sombra(0, 0, 1), true); } } }
    /* prisma (edificio, sitio o vehículo): muros que miran al ojo y techo */
    const prisma = (P, z0, z1, muro, techo) => {
      const n = P.length >> 1; let A = 0; for (let i = 0; i < n; i++) { const j = (i + 1) % n; A += P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; } const sg = A > 0 ? 1 : -1;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, ax = P[2 * i], ay = P[2 * i + 1], bx = P[2 * j], by = P[2 * j + 1], ex = bx - ax, ey = by - ay, el = Math.hypot(ex, ey) || 1, nx = ey / el * sg, ny = -ex / el * sg;
        if ((ax - o[0]) * nx + (ay - o[1]) * ny >= 0) continue;   // cara trasera
        poly([[ax, ay, z0], [bx, by, z0], [bx, by, z1], [ax, ay, z1]], muro, sombra(nx, ny, 0));
      }
      if (o[2] > z1 - .5) { const T = []; for (let i = 0; i < n; i++) T.push([P[2 * i], P[2 * i + 1], z1]); poly(T, techo, sombra(0, 0, 1)); }
    };
    const Rb = R * .8, maxB = Math.round(90 + 420 * cal), lista = M.edificiosEn(o[0] - Rb, o[1] - Rb, o[0] + Rb, o[1] + Rb).filter(q => visible(q.x, q.y, Math.max(q.hw, q.hd)));
    if (lista.length > maxB) { lista.sort((p, q) => Math.hypot(p.x - o[0], p.y - o[1]) - Math.hypot(q.x - o[0], q.y - o[1])); lista.length = maxB; }
    const sv = Sombras.vector(cielo), aS = sv ? (.38 * sv.fuerza).toFixed(3) : 0;
    for (const q of lista) { const st = estiloEdificio(M, q), z0 = this._z(q.x, q.y), Pq = Mundo.esquinas(q); prisma(Pq, z0, z0 + q.h, hex3(st.muro), hex3(st.techo)); if (sv && sv.fuerza > .05) poly(Sombras.poligono(Pq, q.h, sv).map(p => [p[0], p[1], z0 + .25]), 'rgba(18,26,46,' + aS + ')', 1, 2); }
    for (const q of M.sitios().E) { if (!visible(q.x, q.y, 40)) continue; const z0 = this._z(q.x, q.y); for (const Rr of q.R.slice(0, 1)) prisma(Rr, z0, z0 + Math.min(q.h, 60), hex3('#d9d4c9'), hex3('#b5542f')); }
    /* tráfico (cajas) y gente (de perfil, como recortes en la escena) */
    /* 4.8 (hallazgo de Gemini): el tráfico de la calle (E.trafico) también; antes solo se veía el transporte público */
    const caja = v => {
      if (!visible(v.x, v.y, 8) || v.clase === 'cable') return; const T = (typeof TRAF_TIPOS !== 'undefined' && TRAF_TIPOS[v.tipo]) || { largo: 4.3, ancho: 1.8 }, Lg = (v.largo || T.largo) / 2, An = (v.ancho || T.ancho) / 2, c = Math.cos(v.a || 0), s = Math.sin(v.a || 0), z0 = this._z(v.x, v.y) + (v.z || 0);
      prisma([v.x - c * Lg - s * An, v.y - s * Lg + c * An, v.x + c * Lg - s * An, v.y + s * Lg + c * An, v.x + c * Lg + s * An, v.y + s * Lg - c * An, v.x - c * Lg + s * An, v.y - s * Lg - c * An], z0 + .3, z0 + (v.tipo === 'buseta' || v.tipo === 'camion' || v.clase === 'metro' ? 3 : 1.5), hex3(v.color || '#c33'), hex3(tono(v.color || '#c33', .15)));
    };
    for (const v of E.vehiculos || []) caja(v); for (const v of E.trafico || []) caja(v);
    const figura = (x, y, z, dibuja) => { const c = cam(x, y, z); if (c[2] < NEAR + .2 || c[2] > lejos) return; L.push({ d: c[2] - .01, fn: () => dibuja(W / 2 + c[0] / c[2] * F, H / 2 - c[1] / c[2] * F, F / c[2], c[2]) }); };
    const lado = MC.arte.f('personajeLado'), dirDe = a => (Math.cos(a) * rx + Math.sin(a) * ry) >= 0 ? 1 : -1;
    for (const p of (E.peatones || []).slice(0, Math.round(20 + 60 * cal))) { if (!visible(p.x, p.y, 2)) continue; const A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)); figura(p.x, p.y, this._z(p.x, p.y), (sx, sy, esc) => { if (esc < 1.2) return; lado(g, Personaje.pose('camina', p.fase || 0, { alto: A.alto }), A, sx, sy, esc, dirDe(p.a || 0)); }); }
    if (E.jugador && E.jugador.cuerpo && !E._sinJugador && !(C.perfil === 'primera')) {   // 4.8: en el tren el jugador es el tren
      const j = E.jugador, Cu = j.cuerpo, A = j.aspecto || Personaje.aspecto(), V = Cu.veh;
      figura(Cu.x, Cu.y, Cu.altura, (sx, sy, esc) => {
        g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(sx, sy + esc * Cu.z, esc * .6, esc * .18, 0, 0, TAU); g.fill();
        const dir = dirDe(Cu.a), vl = MC.arte.f('vehiculoLado'); if (vl && V.clase !== 'pie') vl(g, V, sx, sy, esc, dir, Cu);
        lado(g, Personaje.pose(Cu.estado || 'quieto', Cu.fase, { alto: A.alto, manubrio: V.manubrio }), A, sx, sy, esc, dir);
      });
    }
    for (const x of E.extras || []) if (x.dibujar3d) figura(x.x, x.y, this._z(x.x, x.y) + (x.z || 0), (sx, sy, esc) => x.dibujar3d(g, sx, sy, esc));
    /* pintor: primero el piso (relieve y calles) y encima lo que se levanta, cada capa de lejos a cerca */
    Ls.sort((p, q) => q.d - p.d); L.sort((p, q) => q.d - p.d); this.n = Ls.length + L.length + Lsh.length;
    for (const it of Ls.concat(Lsh, L)) {
      if (it.fn) { it.fn(); continue; }
      const P = it.pts; g.fillStyle = it.fill; g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); g.fill();
      if (cal > .6 && !it.sh) { g.strokeStyle = it.fill; g.lineWidth = .7; g.stroke(); }   // tapa las rendijas entre polígonos
    }
    /* luz de noche: una capa azul y los faroles como puntos (barato) */
    if ((cielo.noche || 0) > .05) { g.fillStyle = 'rgba(10,20,60,' + (cielo.noche * .35).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    return this.n;
  }
  /* del mundo (z absoluta, como Gl.aPantalla) a la pantalla de W×H; null si queda detrás del ojo */
  aPantalla(x, y, z, W, H) { const P = this._P; if (!P) return null; const dx = x - P.o[0], dy = y - P.o[1], dz = z - P.o[2], d = dx * P.fx + dy * P.fy + dz * P.fz; if (d <= .4) return null; const F = (H / 2) / P.t; return [W / 2 + (dx * P.rx + dy * P.ry) / d * F, H / 2 - (dx * P.ux + dy * P.uy + dz * P.uz) / d * F]; }
}
MC.Raster = Raster;
