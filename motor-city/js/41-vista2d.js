/* =====================================================================
   VISTA 2D ÚNICA · cenital, 3D oblicua y maqueta dimétrica 2:1 con una sola proyección:
     pantalla = centro + Aplasta(k) · Gira(yaw) · (punto − cámara) · zoom  −  altura · zoom · hk
   - cenital: k = 1, hk = 0 (los techos van en las losas) · oblicua: k = cos(incl), hk = sin(incl)
   - maqueta 2:1: yaw en múltiplos de 90° + 45°, k = 0,5, hk = 0,82 (la proyección de la maqueta de El Metro)
   - lateral: la misma ciudad vista de lado (inclinación de 1,2 a 1,47 rad), como una casa de muñecas cortada:
     cielo arriba, el corte de la tierra abajo y una franja de calle con profundidad (FEZ, Little Nightmares).
     La ciudad 3D también se inclina con dos dedos hasta quedar de lado.
   - Lo que tapa al jugador (edificios delante de él) se vuelve transparente: el mundo nunca esconde la acción.
   El suelo sale de las losas; los edificios se levantan con su huella y su altura reales; puentes y viaducto
   a su nivel; tráfico, transporte y gente encima. El pixel es la misma vista en un búfer pequeño (vistas.js).
   ===================================================================== */
const Vista2D = {
  parametros(cam, modo) {
    if (modo === 'cenital') return { yaw: cam.yaw, k: 1, hk: 0 };
    if (modo === 'maqueta') { const q = Math.round((cam.yaw - Math.PI / 4) / (Math.PI / 2)); return { yaw: Math.PI / 4 + q * Math.PI / 2, k: .5, hk: .82 }; }
    if (modo === 'lateral') { const p = clamp(Math.max(cam.pitch, 1.2), 1.2, 1.47); return { yaw: cam.yaw, k: Math.cos(p), hk: Math.sin(p) }; }
    const p = clamp(cam.pitch, .15, 1.47); return { yaw: cam.yaw, k: Math.cos(p), hk: Math.sin(p) };
  },
  dibujar(g, W, H, E, op = {}) {
    const C = E.camara, modo = op.modo || 'cenital', P = this.parametros(C, modo), z = C.zoom, cs = Math.cos(P.yaw), sn = Math.sin(P.yaw); Ondas.presupuesto = 12;
    /* matriz mundo → pantalla (sin altura) */
    const oy = P.k < .45 ? H * .17 : 0, a = z * cs, b = z * sn * P.k, c = -z * sn, d = z * cs * P.k, SN = op.pixel ? (v => v) : Math.round, e = SN(W / 2 - a * C.x - c * C.y), f = SN(H / 2 + oy - b * C.x - d * C.y);   // de lado, el piso baja: más cielo y menos tierra. 2.11: el desplazamiento va en píxeles enteros (la capa de suelo se corre sin temblar contra los objetos)
    const pr = (x, y, h = 0) => [a * x + c * y + e, b * x + d * y + f - h * z * P.hk];
    const inv = (sx, sy) => { const det = a * d - b * c, X = sx - e, Y = sy - f; return [(d * X - c * Y) / det, (-b * X + a * Y) / det]; };
    E._pr = pr; E._vista = { modo, P, W, H, z, a, b, c, d, e, f };
    /* caja del mundo visible (con margen para lo alto) */
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [sx, sy] of [[0, -H * .6 * P.hk], [W, -H * .6 * P.hk], [0, H], [W, H]]) { const [wx, wy] = inv(sx, sy); x0 = Math.min(x0, wx); x1 = Math.max(x1, wx); y0 = Math.min(y0, wy); y1 = Math.max(y1, wy); }
    /* de lado (k pequeño) la caja se iría al infinito: se recorta a una franja de profundidad alrededor de la cámara */
    if (P.k < .55) { const R = Math.max(W, H) / z * .6 + 60, Rp = Math.min(R, 90 + 260 * P.k); const fx = Math.sin(P.yaw), fy = Math.cos(P.yaw); const RR = Math.max(R, Rp); x0 = Math.max(x0, C.x - RR); x1 = Math.min(x1, C.x + RR); y0 = Math.max(y0, C.y - RR); y1 = Math.min(y1, C.y + RR); E._franja = P.k < .45 ? { Rp, fx, fy } : null; } else E._franja = null;   /* la maqueta (k = .5) recorta lo que dibuja, pero sin el corte de tierra de la vista lateral */
    E._caja = [x0, y0, x1, y1];
    /* ---------- suelo ---------- */
    const sinTechos = modo !== 'cenital', pixel = !!op.pixel, dePie = sinTechos && z >= ((E.calidad ?? 1) >= .9 ? 3.2 : 4.2) && op.arboles !== false,   /* árboles de pie de cerca; con calidad media, desde un poco más cerca */ Ls = z < .22 ? E.losasLejos : E.losas, Ld = Ls.L;
    let res = z; const RES = [.0625, .125, .25, .5, 1, 2, 3, 4, 6]; res = RES.find(r => r >= res * (pixel ? .9 : .7)) || 6;   /* z ya está en píxeles del lienzo por metro; de cerca, losas de hasta 6 px/m */ if (Ls === E.losasLejos) res = Math.min(res, .25);
    const S = this._suelo ||= { cv: null, clave: '', ult: '', estable: 0, e: 0, f: 0, ver: -1, faltan: 1 }, mS = Math.round(Math.min(W, H) * .35), fl = (sinTechos ? 1 : 0) | (dePie ? 2 : 0) | (E.clima?.lluvia > .12 ? 4 : 0);
    const claveS = [W + 2 * mS, H + 2 * mS, a, b, c, d, res, fl, MC.estilo, MC.arte.activa, Ls === E.losasLejos ? 1 : 0, Estilo.col('#5e8c4a')].join('|'); S.estable = claveS === S.ult ? S.estable + 1 : 0; S.ult = claveS;
    const usaCapa = !pixel && !E._franja && MC.opciones.capaSuelo !== false && W * H > 40000 && S.estable >= 3;   // si gira o hace zoom seguido, mejor pintar directo
    g.save(); if (!usaCapa) { g.fillStyle = Estilo.col('#5e8c4a'); g.fillRect(0, 0, W, H); }
    if (E._franja) {   /* de lado: cielo arriba de la franja y el corte de la tierra abajo (casa de muñecas) */
      const Rp = E._franja.Rp, yF = H / 2 + oy - Rp * z * P.k, yC = H / 2 + oy + Rp * z * P.k, ES0 = Estilo.p, cie = ES0.cielo ? { top: mez3(ES0.cielo[0], (E.cielo || {}).top || ES0.cielo[0], .25), hor: mez3(ES0.cielo[1], (E.cielo || {}).hor || ES0.cielo[1], .25) } : (E.cielo || { top: [.4, .6, .9], hor: [.8, .88, .95] });   /* el cielo del estilo (de Shinkai en el anime), con algo de la hora */
      const gs = g.createLinearGradient(0, 0, 0, Math.max(1, yF)); gs.addColorStop(0, css3(cie.top)); gs.addColorStop(1, css3(cie.hor)); g.fillStyle = gs; g.fillRect(0, 0, W, Math.max(0, yF));
      const gt = g.createLinearGradient(0, yC, 0, H); gt.addColorStop(0, '#6b4f36'); gt.addColorStop(.15, '#5a4230'); gt.addColorStop(1, '#2e2219'); g.fillStyle = gt; g.fillRect(0, yC, W, H - yC);
      g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 40; i++) g.fillRect(h2(i, 1, 9) * W, yC + 6 + h2(i, 2, 9) * (H - yC), 2 + h2(i, 3, 9) * 4, 2);
      g.beginPath(); g.rect(0, yF, W, yC - yF); g.clip();
    }
    let faltan = 0;
    const pintarSuelo = (gg, ox, oy, X0, Y0, X1, Y1) => {   // las losas de la caja [X0..X1]×[Y0..Y1] con la matriz corrida (ox, oy)
      gg.setTransform(a, b, c, d, e + ox, f + oy); gg.imageSmoothingEnabled = !pixel; let faltan = 0;   // (las que faltan en esta pasada)
      const gx0 = Math.floor(X0 / Ld), gx1 = Math.floor(X1 / Ld), gy0 = Math.floor(Y0 / Ld), gy1 = Math.floor(Y1 / Ld);
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
        let L = Ls.losa(gx, gy, res, faltan > (op.presupuesto ?? 2), fl);
        if (!L) { faltan++; L = Ls.losa(gx, gy, Math.max(.0625, res / 4), false, fl); }   // mientras llega la buena, una borrosa
        if (L) gg.drawImage(L, gx * Ld, gy * Ld, Ld + .05, Ld + .05); else faltan++;
      }
      return faltan;
    };
    /* 2.11: CAPA DE SUELO. El suelo se pinta una vez en una capa con margen y, mientras la cámara solo se desplace (mismo zoom,
       giro, estilo, arte, lluvia y tamaño), cada cuadro se corre con un blit en píxeles enteros: sin giro ni escala, que es lo
       que más cuesta pintar en la maqueta. Se rehace si faltan losas, si cambió algo o si la cámara salió del margen. */
    if (usaCapa) {
      const m = mS, CW = W + 2 * m, CH = H + 2 * m, clave = claveS, dx = e - S.e, dy = f - S.f;
      if (!S.cv || S.cv.width !== CW || S.cv.height !== CH) { S.cv = lienzo(CW, CH); S.clave = ''; }
      if (S.cv && (S.clave !== clave || S.faltan > 0 || S.ver !== Ls.version || Math.abs(dx) > m - 2 || Math.abs(dy) > m - 2)) {
        const q = S.cv.getContext('2d'); q.setTransform(1, 0, 0, 1, 0, 0); q.fillStyle = Estilo.col('#5e8c4a'); q.fillRect(0, 0, CW, CH);
        let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9; for (const [sx, sy] of [[-m, -m], [W + m, -m], [-m, H + m], [W + m, H + m]]) { const [wx, wy] = inv(sx, sy); X0 = Math.min(X0, wx); X1 = Math.max(X1, wx); Y0 = Math.min(Y0, wy); Y1 = Math.max(Y1, wy); }
        if (P.k < .55) { const RR = Math.max(W, H) / z * .6 + 60 + m / z; X0 = Math.max(X0, C.x - RR); X1 = Math.min(X1, C.x + RR); Y0 = Math.max(Y0, C.y - RR); Y1 = Math.min(Y1, C.y + RR); }
        faltan = S.faltan = pintarSuelo(q, m, m, X0, Y0, X1, Y1); S.clave = clave; S.e = e; S.f = f; S.ver = Ls.version; this.capasSuelo = (this.capasSuelo || 0) + 1;
      }
      if (S.cv) { g.drawImage(S.cv, e - S.e - m, f - S.f - m); g.restore(); }
      else { g.fillStyle = Estilo.col('#5e8c4a'); g.fillRect(0, 0, W, H); faltan = pintarSuelo(g, 0, 0, x0, y0, x1, y1); g.restore(); }
    } else { faltan = pintarSuelo(g, 0, 0, x0, y0, x1, y1); g.restore(); }
    const noche0 = E.cielo ? E.cielo.noche : 0; if (noche0 > .02) { g.fillStyle = 'rgba(8,18,52,' + (noche0 * .5).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    /* ---------- lo que se levanta: edificios, pasos elevados, vehículos y gente, en orden de profundidad ---------- */
    const objs = [], noche = E.cielo ? E.cielo.noche : 0, dy = (x, y) => b * x + d * y + f, cal = E.calidad ?? 1;
    const luzX = Math.cos(P.yaw + 2.4), dibCtx = { g, pr, z, P, noche, E, luzX, modo, W, H, real: !!Estilo.p.rudeza, ES: Estilo.p, mapa: !Estilo.p.rudeza && MC.estilo !== 'clasico' }, luces = [];
    const Fr = E._franja, delante = (x, y) => Fr && Fr.fx * (x - C.x) + Fr.fy * (y - C.y) > Fr.Rp;   // de lado: lo que queda antes del corte no se dibuja
    // Descartar antes de preparar el dibujo, con margen para copa, focos y altura.
    const visible = (x, y, radio, alto = 0) => {
      const sx = a * x + c * y + e, sy = b * x + d * y + f, r = radio * z + 3;
      return sx + r >= 0 && sx - r <= W && sy + r >= 0 && sy - r - alto * z * P.hk <= H;
    };
    if (E.clima?.lluvia > .12 && z >= 1) this.charcos(dibCtx, E.clima.lluvia);
    /* sombras del sol de esta hora (también de edificios que están fuera de la pantalla y la alcanzan) */
    const sv = op.sombras === false ? null : Sombras.vector(E.cielo), conSombra = sv && z > .22 && cal > .3; dibCtx.sv = conSombra ? sv : null;
    const minH = z < .5 ? 9 : z < 1 ? 5 : 0, maxN = Math.round(1800 * cal);
    if (modo !== 'cenital' || conSombra) {
      const pad = conSombra ? Math.min(160, 25 * sv.L) : 0, lista = E.mundo.edificiosEn(x0 - pad, y0 - pad, x1 + pad, y1 + pad).filter(q => q.h >= minH && !delante(q.x, q.y)); if (lista.length > maxN) lista.sort((p, q) => q.h * q.hw * q.hd - p.h * p.hw * p.hd).length = maxN;
      const sit = E.mundo.sitios().E.filter(q => { const k2 = q.caja; return !(k2[2] < x0 - pad || k2[0] > x1 + pad || k2[3] < y0 - pad || k2[1] > y1 + pad); });
      if (conSombra) { const S = lista.filter(q => visible(q.x,q.y,q.hw+q.hd+q.h*sv.L+2)).map(q => ({ P: Mundo.esquinas(q), h: q.h, q })); for (const q of sit) if (q.R[0]) S.push({ P: q.R[0], h: Math.min(q.h, 90) }); Sombras.dibujar2D(g, W, H, S, pr, sv, { cenital: modo === 'cenital' }); }
      if (modo !== 'cenital') { for (const q of lista) if (q.x >= x0 && q.x <= x1 && q.y >= y0 && q.y <= y1) objs.push({ y: dy(q.x, q.y) + Math.max(q.hw, q.hd) * z * P.k * .5, t: 0, q }); for (const q of sit) { const k2 = q.caja; if (k2[2] < x0 || k2[0] > x1 || k2[3] < y0 || k2[1] > y1) continue; objs.push({ y: dy(q.x, q.y), t: 4, q }); } }
    }
    /* agua viva: brillos que se mueven sobre lagos, ríos y mar (baratos: una muestra cada pocos metros) */
    if (cal > .4 && z > .35 && op.agua !== false) { const area = (x1 - x0) * (y1 - y0), st = Math.max(7, Math.sqrt(area / 500)), t = E.t || 0; g.save(); g.strokeStyle = 'rgba(255,255,255,' + (noche > .5 ? .12 : .32) + ')'; g.lineWidth = Math.max(1, z * .25); g.beginPath(); let n = 0;
      for (let yy = Math.floor(y0 / st) * st; yy < y1 && n < 700; yy += st) for (let xx = Math.floor(x0 / st) * st; xx < x1 && n < 700; xx += st) { const tt = E.mundo.suelo(xx, yy); if (tt !== TT.WATER && tt !== TT.CANAL) continue; n++; const ph = h2(xx | 0, yy | 0, 7) * TAU, a = (Math.sin(t * 1.3 + ph) + 1) / 2; if (a < .55) continue; const wx = xx + Math.sin(t * .4 + ph) * st * .3, wy = yy + Math.cos(t * .3 + ph) * st * .2, p1 = pr(wx - 1.2 * a, wy, 0), p2 = pr(wx + 1.2 * a, wy, 0); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); }
      g.stroke(); g.restore(); }
    /* naturaleza: rocas, palmas, frailejones, arbustos y juncos (de cerca) */
    if (z > .6 && cal > .35 && op.naturaleza !== false) for (const p of Naturaleza.en(E.mundo, x0, y0, x1, y1, Math.round(150 + 500 * cal))) if (!delante(p.x, p.y) && visible(p.x, p.y, 8, 22)) objs.push({ y: dy(p.x, p.y), t: 8, q: p });
    /* 2.6: los árboles de pie (maqueta, oblicua y lateral de cerca), con su sombra según el sol antes de todo lo demás */
    if (dePie) { const cap = Math.round(150 + 420 * cal); let AR = Arboleda.en(E.mundo, x0 - 8, y0 - 8, x1 + 8, y1 + 8, 5000).filter(t => !delante(t.x, t.y)); if (AR.length > cap) { const q = cap / AR.length; AR = AR.filter(t => (t.s * 7.31 + t.r) % 1 < q); }   /* si son demasiados, se ralea parejo (no se corta media pantalla) */ if (z >= 6) Arboleda.sombras(dibCtx, AR, conSombra ? sv : null); for (const t of AR) if (visible(t.x, t.y, t.r * 2 + 2, t.h * 1.4)) objs.push({ y: dy(t.x, t.y), t: 10, q: t }); }
    /* mobiliario urbano (postes, árboles de calle, bancas, paraderos, cebras): solo de cerca */
    if (z > .9 && cal > .35 && op.mobiliario !== false) { const L = Mobiliario.en(E.mundo, x0, y0, x1, y1, Math.round(120 + 480 * cal * Math.min(1, z / 2))).filter(p => !delante(p.x, p.y) && visible(p.x, p.y, 18, 16)); Mobiliario.piso(dibCtx, L); for (const p of L) if (p.t !== 'cebra') objs.push({ y: dy(p.x, p.y), t: 7, q: p }); }
    if (MC.Vida && op.vida !== false) MC.Vida.piso(dibCtx);   /* 2.8: huellas de llantas y pisadas en el suelo blando */
    /* capa de información (valor del suelo, ruido, contaminación…: las «vistas de datos» de SimCity y Cities: Skylines) */
    if (E.capaInfo && E.capaInfo.dibujar) E.capaInfo.dibujar(g, a, b, c, d, e, f, dibCtx);
    for (const q of E.mundo.pasosEn(x0, y0, x1, y1)) if (q.nivel > 0) objs.push({ y: dy((q.caja[0] + q.caja[2]) / 2, (q.caja[1] + q.caja[3]) / 2) + 1e4 * 0, t: 1, q, cen: modo === 'cenital' });
    for (const v of E.vehiculos || []) if (visible(v.x, v.y, (v.largo || 12) + 5, (v.z || 0) + 8)) objs.push({ y: dy(v.x, v.y) + (v.z || 0) * .001, t: 2, q: v });
    for (const p of E.peatones || []) if (visible(p.x, p.y, 2, (p.z || 0) + 3)) objs.push({ y: dy(p.x, p.y), t: 3, q: p });
    if (E.jugador) objs.push({ y: dy(E.jugador.x, E.jugador.y) + .5, t: 5, q: E.jugador });
    const est = E.jugador && E.jugador.cuerpo && E.jugador.cuerpo.estacionado; if (est && est.x >= x0 - 20 && est.x <= x1 + 20 && est.y >= y0 - 20 && est.y <= y1 + 20) objs.push({ y: dy(est.x, est.y), t: 9, q: est });
    for (const x of E.extras || []) objs.push({ y: dy(x.x, x.y), t: 6, q: x });
    objs.sort((p, q) => p.y - q.y);
    /* rayos X: lo que queda delante del jugador y lo tapa se dibuja transparente */
    const Jc = E.jugador && E.jugador.cuerpo, jKey = Jc ? dy(Jc.x, Jc.y) : 0, jS = Jc ? pr(Jc.x, Jc.y, (Jc.zPaso || 0) + (Jc.z || 0) + 1) : null;
    const tapa = q => { const hw = q.hw != null ? Math.max(q.hw, q.hd) : q.caja ? Math.max(q.caja[2] - q.caja[0], q.caja[3] - q.caja[1]) / 2 : 15, r = hw * z * 1.15 + 12, [bx, by] = pr(q.x, q.y, 0), [, ty] = pr(q.x, q.y, q.h || 10); return Math.abs(jS[0] - bx) < r && jS[1] > ty - 12 && jS[1] < by + hw * z * P.k + 12; };
    for (const o of objs) {
      const rx = Jc && modo !== 'cenital' && o.y > jKey && ((o.t === 0 || o.t === 4) ? tapa(o.q) : o.t === 10 ? (() => { const [tx, ty] = pr(o.q.x, o.q.y, 0); return Math.abs(jS[0] - tx) < o.q.r * 1.3 * z + 6 && jS[1] < ty && jS[1] > ty - o.q.h * z * P.hk; })() : false); if (rx) g.globalAlpha = o.t === 10 ? .4 : .28;
      if (o.t === 0) this.edificio(dibCtx, o.q); else if (o.t === 1) this.pasoElevado(dibCtx, o.q); else if (o.t === 2) this.vehiculo(dibCtx, o.q);
      else if (o.t === 3) this.peaton(dibCtx, o.q); else if (o.t === 4) this.sitio(dibCtx, o.q); else if (o.t === 5) this.jugador(dibCtx, o.q); else if (o.t === 6 && o.q.dibujar) o.q.dibujar(g, pr, z, P); else if (o.t === 7) Mobiliario.objeto(dibCtx, o.q, luces); else if (o.t === 8) Naturaleza.objeto(dibCtx, o.q); else if (o.t === 9) this.estacionado(dibCtx, o.q); else if (o.t === 10) Arboleda.dePie(dibCtx, o.q);
      if (rx) g.globalAlpha = 1;
    }
    Sombras.luces(g, luces, noche);   // los charcos de luz de los postes, encima de todo (como luz que se suma)
    /* cables del Metrocable: el cable entre torres por encima de todo */
    if (E.cables) this.cables(dibCtx, E.cables);
    /* 2.7: el pase final del estilo (manga en grises, líneas de velocidad) y la vida (partículas, pájaros, onomatopeyas) */
    if (MC.Vida && op.vida !== false) MC.Vida.dibujar(dibCtx);
    if (MC.Efectos && op.vida !== false) MC.Efectos.dibujar(g, pr, E);   /* 4.5: choques, derrapes, explosiones y restos */
    if (dibCtx.mapa) Estilo.final(g, W, H, E);
    /* etiquetas (estaciones, lugares) */
    if (op.etiquetas !== false) this.etiquetas(dibCtx);
    return faltan;
  },
  /* prisma con techo: muros que miran a la cámara, sombreados por la luz, y el techo */
  prisma(D, P, z0, z1, muro, techo, ventanas) {
    const { g, pr, z, noche } = D, n = P.length >> 1; if (n < 3) return; const B = [], T = [];
    for (let i = 0; i < n; i++) { B.push(pr(P[2 * i], P[2 * i + 1], z0)); T.push(pr(P[2 * i], P[2 * i + 1], z1)); }
    let area = 0; for (let i = 0; i < n; i++) { const j = (i + 1) % n; area += B[i][0] * B[j][1] - B[j][0] * B[i][1]; } const sg = area > 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, ex = B[j][0] - B[i][0], ey = B[j][1] - B[i][1], ny = ex * sg; if (ny <= 0) continue;   // el muro mira hacia abajo de la pantalla: se ve
      const lz = Estilo.luz(clamp(.72 + .28 * (ey * sg / (Math.hypot(ex, ey) || 1)) * D.luzX + .1, .55, 1.05) - noche * .45);
      g.fillStyle = tono(D.mapa ? Estilo.col(muro) : muro, lz - 1); g.beginPath(); g.moveTo(B[i][0], B[i][1]); g.lineTo(B[j][0], B[j][1]); g.lineTo(T[j][0], T[j][1]); g.lineTo(T[i][0], T[i][1]); g.closePath(); g.fill(); if (D.ES.tinta && z > 1.2) { g.strokeStyle = D.ES.tintaColor; g.lineWidth = Math.max(1, D.ES.tinta * Math.min(1.4, z / 6)); g.lineJoin = 'round'; g.stroke(); }   /* 2.7: línea clara */
      if (D.real && z > 3.5) { const hb = Math.min(1, (z1 - z0) * .25) / (z1 - z0), ha = .35 / (z1 - z0), Bi = [B[i][0] + (T[i][0] - B[i][0]) * hb, B[i][1] + (T[i][1] - B[i][1]) * hb], Bj = [B[j][0] + (T[j][0] - B[j][0]) * hb, B[j][1] + (T[j][1] - B[j][1]) * hb], Ti = [T[i][0] - (T[i][0] - B[i][0]) * ha, T[i][1] - (T[i][1] - B[i][1]) * ha], Tj = [T[j][0] - (T[j][0] - B[j][0]) * ha, T[j][1] - (T[j][1] - B[j][1]) * ha];   /* 2.6: humedad y salpicado en la base del muro; sombra bajo el alero */
        g.fillStyle = 'rgba(34,26,18,.24)'; g.beginPath(); g.moveTo(B[i][0], B[i][1]); g.lineTo(B[j][0], B[j][1]); g.lineTo(Bj[0], Bj[1]); g.lineTo(Bi[0], Bi[1]); g.closePath(); g.fill();
        g.fillStyle = 'rgba(0,0,0,.13)'; g.beginPath(); g.moveTo(T[i][0], T[i][1]); g.lineTo(T[j][0], T[j][1]); g.lineTo(Tj[0], Tj[1]); g.lineTo(Ti[0], Ti[1]); g.closePath(); g.fill(); }
      if (ventanas && z > 1.8 && D.ventanas !== false) { const alto = (z1 - z0), pisos = Math.min(14, Math.max(1, Math.floor(alto / 3))), L = Math.hypot(ex, ey), cols = Math.min(6, Math.floor(L / (z * 3.2))); if (pisos >= 1 && cols >= 1) {
        /* fachada por reglas (WFC, como Townscaper): locales, vitrinas y puerta abajo; balcones alineados; muros ciegos */
        const FZ = pisos * cols <= 48 && z > 2.2 ? Ondas.fachadaCache(ventanas * 31 + i, pisos, cols) : null, alturaV = (T[i][1] - B[i][1]);
        const fm = MC.arte.f('fachadaModulo');   // arte del juego: fachadaModulo(g, tipo, x, y, ancho, alto, encendida, D) → true si lo dibujó
        for (let p = 0; p < pisos; p++) for (let q = 0; q < cols; q++) { const tipo = FZ ? FZ[pisos - 1 - p][q] : 'ventana'; if (tipo === 'muro') continue; const lit = noche > .3 && h2(i * 31 + q, p, ventanas) < .4; const u = (q + .3) / cols, v = (p + .35) / pisos, x = B[i][0] + ex * u, y = B[i][1] + ey * u + alturaV * v, w = Math.max(1, ex / cols * .45);
          if (fm) D.varianteFachada = Math.abs(ventanas + i*31 + p*7 + q) % 3;
          if (fm && fm(g, tipo, x, y, w, Math.max(1, z * 1.2), lit, D) === true) continue;
          if (tipo === 'local' || tipo === 'vitrina') { const yb = B[i][1] + ey * u + alturaV * (p + .08) / pisos; g.fillStyle = noche > .3 ? 'rgba(255,226,150,' + (.5 + noche * .4) + ')' : 'rgba(120,160,190,.55)'; g.fillRect(x - w * .25, yb - z * 1.9, w * 1.5, z * 1.9); if (tipo === 'vitrina') { g.fillStyle = ['#c43a26', '#2f80ed', '#2e7d32', '#f2b705'][(ventanas + q) % 4]; g.fillRect(x - w * .35, yb - z * 2.4, w * 1.7, Math.max(1, z * .45)); } continue; }
          if (tipo === 'puerta') { const yb = B[i][1] + ey * u + alturaV * .02; g.fillStyle = '#4a2f22'; g.fillRect(x, yb - z * 2.1, w * .8, z * 2.1); continue; }
          g.fillStyle = lit ? 'rgba(255,214,120,' + (.55 + noche * .4) + ')' : 'rgba(25,35,50,.32)'; g.fillRect(x, y, w, Math.max(1, z * 1.2));
          if (tipo === 'balcon') { g.fillStyle = 'rgba(40,44,52,.55)'; g.fillRect(x - w * .2, y + Math.max(1, z * 1.2), w * 1.4, Math.max(1, z * .3)); } } } }
    }
    if (D.mapa) techo = Estilo.col(techo); g.fillStyle = noche > .05 ? tono(techo, -noche * .5) : techo; g.beginPath(); g.moveTo(T[0][0], T[0][1]); for (let i = 1; i < n; i++) g.lineTo(T[i][0], T[i][1]); g.closePath(); g.fill(); if (D.ES.tinta && z > 1.2) { g.strokeStyle = D.ES.tintaColor; g.lineWidth = Math.max(1, D.ES.tinta * Math.min(1.4, z / 6)); g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = Math.max(.5, z * .15); g.stroke();
  },
  /* 2.8: una cubierta sin muros (un techo sobre columnas: parqueaderos, kioscos, plazas de mercado) no flota */
  cubierta(D, q, st) { const { g, pr, z } = D, P = Mundo.esquinas(q), n = P.length >> 1; g.strokeStyle = '#3a3d44'; g.lineWidth = Math.max(1, z * .3); g.beginPath(); for (let i = 0; i < n; i++) { const [bx, by] = pr(P[2 * i], P[2 * i + 1], 0), [tx, ty] = pr(P[2 * i], P[2 * i + 1], q.h - .3); g.moveTo(bx, by); g.lineTo(tx, ty); } g.stroke(); this.prisma(D, P, Math.max(0, q.h - .5), q.h, st.muro, st.techo, 0); },
  charcos(D, intensidad) {
    const { g, E, P, pr, z } = D, cx = Math.floor(E.camara.x / 7), cy = Math.floor(E.camara.y / 7);
    const t = E.t || 0, charcos = [];
    for (let j = cy - 4; j <= cy + 4; j++) for (let i = cx - 4; i <= cx + 4; i++) {
      const semilla = h2(i, j, 907);
      if (semilla > .48 || charcos.length >= 20) continue;
      const x = (i + semilla) * 7, y = (j + h2(i, j, 908)) * 7;
      const tt = E.mundo.suelo(x, y);
      if (tt !== TT.ROAD && tt !== TT.AVE && tt !== TT.AUTO) continue;
      const [sx, sy] = pr(x, y), rx = (.45 + semilla * 2) * z;
      charcos.push([sx, sy, rx, Math.max(.5, rx * P.k * .52), (t * 1.8 + semilla * 17) % 1]);
    }
    g.save();
    g.fillStyle = D.noche > .45 ? 'rgba(211,175,112,.32)' : 'rgba(164,203,220,.48)';
    g.beginPath();
    for (const [x,y,rx,ry] of charcos) { g.moveTo(x + rx,y); g.ellipse(x,y,rx,ry,0,0,TAU); }
    g.fill(); g.beginPath(); g.lineWidth = Math.max(.5, z * .035);
    g.strokeStyle = 'rgba(233,242,249,' + (.25 + intensidad * .35) + ')';
    for (const [x,y,rx,ry,k] of charcos) {
      g.moveTo(x - rx * .65, y); g.lineTo(x - rx * .2, y);
      if (k > .08 && k < .8) { g.moveTo(x + rx * k, y); g.ellipse(x,y,rx*k,ry*k,0,0,TAU); }
    }
    g.stroke(); g.restore(); return charcos.length;
  },
  edificio(D, q) {
    const [x, y] = D.pr(q.x, q.y);
    const radio = Math.ceil((q.hw + q.hd + 2) * D.z) + 2;
    const base = Math.ceil(radio * D.P.k) + 3;
    const cima = base + Math.ceil((q.h + 2) * D.z * D.P.hk);
    if (x + radio < 0 || x - radio > D.W || y + base < 0 || y - cima > D.H) return;
    // La maqueta gira por cuadrantes. Un edificio ya pintado se traslada con la cámara.
    // Las pieles con fachadas dinámicas conservan su llamada en cada cuadro.
    const area = 2 * radio * (base + cima);
    if (D.modo !== 'maqueta' || area > 65000 || (MC.arte.f('fachadaModulo') && !MC.arte.f('fachadasEstaticas'))) return this._edificioDirecto(D, q);
    const clave = [MC.estilo, MC.arte.activa, D.E.losas.version, D.z, D.P.yaw, Math.round(D.noche * 36), D.noche > .3, q.h, q.hw, q.hd, q.s].join('/');
    const cache = D.E._fachadasMaqueta || (D.E._fachadasMaqueta = { imagenes: new Map(), pixeles: 0 });
    let pieza = cache.imagenes.get(q);
    if (!pieza || pieza.clave !== clave) {
      if (pieza) cache.pixeles -= pieza.area;
      const cv = lienzo(2 * radio, base + cima), ctx = cv.getContext('2d');
      const local = (wx, wy, h) => { const [sx, sy] = D.pr(wx, wy, h); return [sx - x + radio, sy - y + cima]; };
      this._edificioDirecto({ ...D, g: ctx, pr: local }, q);
      pieza = { cv, clave, area };
      cache.imagenes.set(q, pieza);
      cache.pixeles += area;
      while (cache.pixeles > 4e6 || cache.imagenes.size > 1200) {
        const vieja = cache.imagenes.keys().next().value;
        cache.pixeles -= cache.imagenes.get(vieja).area;
        cache.imagenes.delete(vieja);
      }
    }
    D.g.drawImage(pieza.cv, x - radio, y - cima);
  },
  _edificioDirecto(D, q) { const st = estiloEdificio(D.E.mundo, q), P = Mundo.esquinas(q); if (q.clase === 'techo' && D.modo !== 'cenital') return this.cubierta(D, q, st); this.prisma(D, P, 0, q.h, st.muro, st.techo, q.h >= 2.8 ? (q.s * 1e4 | 0) : 0); if (st.tanque && D.z > 1.5) { const [x, y] = D.pr(q.x, q.y, q.h + 1.2); D.g.fillStyle = '#1d1f24'; D.g.fillRect(x - D.z * .7, y - D.z * .4, D.z * 1.4, D.z * 1.2); } },
  sitio(D, q) {
    const ES = ['#b8673f', '#eceae4', '#bdbcb6', '#5e7b97', '#ece3cd', '#efe8d8', '#d4d8dd', '#3a3f4a', '#b9714b', '#d8432f', '#d9d4c9', '#a86a4c', '#e9dab3', '#2a302d', '#3a3f4a', '#6a645c', '#a6573a', '#e3e6ea', '#4b5a55'], m = ES[q.est] || '#d9d4c9', t = q.techo === 'dos' || q.techo === 'cuatro' ? '#b5542f' : q.techo === 'cupula' ? '#56665f' : tono(m, -.12);
    for (const R of q.R.slice(0, 1)) this.prisma(D, R, 0, q.partes ? q.partes[0].z0 || Math.min(q.h, 12) : q.h, m, t, 7);
    if (q.partes) for (const p of q.partes) this.prisma(D, p.B, p.z0, p.z1, ES[p.est] || m, p.techo === 'aguja' ? '#e3e6ea' : tono(ES[p.est] || m, -.15), 0);
  },
  pasoElevado(D, q) {
    const { g, z, P } = D, cen = D.modo === 'cenital';
    const h = q.nivel * NIVEL_M, L = q.ancho / 2, vi = q.tipo === 'viaducto', T = q.trazo || (q.trazo = new Trazo(q.p));
    const clave = [z,P.yaw,P.k,P.hk,cen,h,L].join('/');
    if (!q._dibujoPaso || q._dibujoPaso.clave !== clave) {
      const cs=Math.cos(P.yaw), sn=Math.sin(P.yaw);
      const pr=(x,y,alt) => [(cs*(x-q.p[0])-sn*(y-q.p[1]))*z,(sn*(x-q.p[0])+cs*(y-q.p[1]))*z*P.k-alt*z*P.hk];
      const capas = [], ctx = {beginPath(){ this.path=new Path2D(); },moveTo(x,y){this.path.moveTo(x,y);},
        lineTo(x,y){this.path.lineTo(x,y);},closePath(){this.path.closePath();},
        fill(){capas.push(['fill',this.fillStyle,this.path]);},stroke(){capas.push(['stroke',this.strokeStyle,this.path,this.lineWidth]);},
        fillRect(x,y,w,h){let ultima=capas.at(-1); if (!ultima || ultima[1]!==this.fillStyle) {ultima=['fill',this.fillStyle,new Path2D()]; capas.push(ultima);} ultima[2].rect(x,y,w,h);}};
      this._trazarPaso({cen},q,ctx,pr,z,h,L,vi,T);
      q._dibujoPaso={clave,capas};
    }
    const [x,y]=D.pr(q.p[0],q.p[1]);
    g.save();g.translate(x,y);
    for(const [tipo,color,path,ancho] of q._dibujoPaso.capas) {
      if(tipo==='fill'){g.fillStyle=color;g.fill(path);}
      else {g.strokeStyle=color;g.lineWidth=ancho;g.stroke(path);}
    }
    g.restore();
  },
  _trazarPaso(D,q,g,pr,z,h,L,vi,T) {
    const rampa = vi ? 0 : Math.min(q.largo * .4, q.peatonal ? 9 : 22), alt = s => h * (vi ? 1 : suave(Math.min(s, q.largo - s) / rampa));
    if (!D.cen) { g.fillStyle = vi ? '#9aa3ad' : '#a9a49a'; for (let s = 12; s < q.largo - 6; s += vi ? 30 : 24) { const c = T.at(s), [x, y] = pr(c.x, c.y, 0), [, y2] = pr(c.x, c.y, alt(s)); const w = Math.max(1, z * 1.4); g.fillRect(x - w / 2, y2, w, y - y2); } }
    const izq = [], der = []; for (let s = 0; s <= q.largo; s += Math.max(2, 8 / Math.max(.3, z))) { const c = T.at(s), nx = -Math.sin(c.a), ny = Math.cos(c.a), hh = D.cen ? 0 : alt(s); izq.push(pr(c.x + nx * L, c.y + ny * L, hh)); der.push(pr(c.x - nx * L, c.y - ny * L, hh)); }
    if (D.cen) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); izq.forEach(([x, y], i) => i ? g.lineTo(x + z * 2, y + z * 3) : g.moveTo(x + z * 2, y + z * 3)); der.toReversed().forEach(([x, y]) => g.lineTo(x + z * 2, y + z * 3)); g.fill(); }
    if (!D.cen) { g.fillStyle = vi ? '#7f8891' : '#8e8a80'; g.beginPath(); der.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); der.toReversed().forEach(([x, y]) => g.lineTo(x, y + z * 1.1)); g.fill(); }
    g.fillStyle = vi ? '#c9cfd8' : q.peatonal ? '#d8cfbd' : '#5a5f69'; g.beginPath(); izq.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); der.toReversed().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fill();
    if (vi) { g.strokeStyle = '#6f7177'; g.lineWidth = Math.max(.5, z * .25); for (const lado of [-1.3, 1.3]) { g.beginPath(); for (let s = 0; s <= q.largo; s += 6) { const c = T.at(s, lado), [x, y] = pr(c.x, c.y, h + .1); s ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(.4, z * .2); for (const B of [izq, der]) { g.beginPath(); B.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
  },
  vehiculo(D, v) {
    const { g, pr, z, P, noche } = D;
    if (v.clase === 'metro' || v.clase === 'tram') { const L = D.E.transporte && D.E.transporte.lineas.find(l => l.id === v.linea); if (L) { const n = v.clase === 'metro' ? 6 : 2, coche = v.largo / n; if (D.modo === 'cenital') Pincel.trenArriba(g, L.T, v.s, v.dir, n, coche, v.color, (x, y) => pr(x, y, v.z)); else for (let i = n - 1; i >= 0; i--) { const sc = v.s - v.dir * (i + .5) * coche, c = L.T.at(sc), ux = Math.cos(c.a) * coche * .48, uy = Math.sin(c.a) * coche * .48, nx = -Math.sin(c.a) * 1.5, ny = Math.cos(c.a) * 1.5; this.prisma(D, [c.x - ux + nx, c.y - uy + ny, c.x + ux + nx, c.y + uy + ny, c.x + ux - nx, c.y + uy - ny, c.x - ux - nx, c.y - uy - ny], v.z + .4, v.z + 3.6, '#e6e9ee', '#c9cfd8', 0); } return; } }
    if (v.clase === 'cable') { const [x, y] = pr(v.x, v.y, v.z), s = Math.max(2, z * 2.2), sw = Math.sin((D.E.t || 0) * 1.3 + v.s * .1) * (D.E.clima ? D.E.clima.viento.v * .25 : .5); g.save(); g.translate(x, y); g.rotate(sw * .05); g.fillStyle = '#2d3138'; g.fillRect(-.15 * s, -1.2 * s, .3 * s, 1.2 * s); g.fillStyle = v.color || '#e38835'; g.fillRect(-s * .8, 0, s * 1.6, s * 1.3); g.fillStyle = 'rgba(200,225,240,.85)'; g.fillRect(-s * .6, s * .2, s * 1.2, s * .5); g.restore(); return; }
    const T = TRAF_TIPOS[v.tipo] || TRAF_TIPOS.carro, L = v.largo || T.largo, Wd = v.ancho || T.ancho;
    if (D.modo === 'cenital') { const [x, y] = pr(v.x, v.y, v.z || 0); g.save(); g.translate(x, y); g.rotate(v.a + P.yaw); g.scale(z, z); Pincel.vehiculoArriba(g, v.tipo, v.color, L, Wd, v.frena, noche > .4); g.restore(); return; }
    const ux = Math.cos(v.a) * L / 2, uy = Math.sin(v.a) * L / 2, nx = -Math.sin(v.a) * Wd / 2, ny = Math.cos(v.a) * Wd / 2, h = v.tipo === 'buseta' || v.tipo === 'camion' ? 3 : v.tipo === 'moto' || v.tipo === 'bici' ? 1.2 : 1.45;
    this.prisma(D, [v.x - ux + nx, v.y - uy + ny, v.x + ux + nx, v.y + uy + ny, v.x + ux - nx, v.y + uy - ny, v.x - ux - nx, v.y - uy - ny], (v.z || 0) + .3, (v.z || 0) + h, v.color, tono(v.color, .12), 0);
    if (noche > .4) { const [x, y] = D.pr(v.x + ux * 1.05, v.y + uy * 1.05, .8); g.fillStyle = 'rgba(255,240,190,.9)'; g.fillRect(x - 1, y - 1, 2.5, 2.5); }
  },
  peaton(D, p) {
    const { g, pr, z, P } = D, A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)), [x, y] = pr(p.x, p.y, 0);
    if (z < .8) { g.fillStyle = A.cCamisa; g.fillRect(x - 1, y - 2, 2, 2); return; }
    if (D.modo === 'cenital') { const J = Personaje.pose('camina', p.fase); J.fase = p.fase; MC.arte.f('personajeArriba')(g, J, A, x, y, z, p.a + P.yaw); return; }
    const J = Personaje.pose('camina', p.fase, { alto: A.alto }), dir = Math.cos(p.a + P.yaw) >= 0 ? 1 : -1; (MC.arte.f('personajeLado'))(g, J, A, x, y, z * P.hk, dir);
  },
  /* 2.8 · faros: un cono de luz cálida en el piso delante del vehículo, de noche (se suma a la luz, no tapa) */
  faros(D, C, V) {
    const { g, pr, z } = D, L = 16 + Math.abs(C.v || 0) * .6, ab = .42, ca = Math.cos(C.a), sa = Math.sin(C.a), fx = C.x + ca * (V.largo || 4) * .5, fy = C.y + sa * (V.largo || 4) * .5, [x0, y0] = pr(fx, fy, 0);
    const P1 = pr(fx + Math.cos(C.a - ab) * L, fy + Math.sin(C.a - ab) * L, 0), P2 = pr(fx + Math.cos(C.a + ab) * L, fy + Math.sin(C.a + ab) * L, 0), [xm, ym] = pr(fx + ca * L, fy + sa * L, 0);
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x0, y0, xm, ym); gr.addColorStop(0, 'rgba(255,236,190,' + (.32 * D.noche).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.lineTo(P1[0], P1[1]); g.quadraticCurveTo(xm, ym, P2[0], P2[1]); g.closePath(); g.fill(); g.restore();
  },
  /* 2.7 · peso: al aterrizar el cuerpo se aplasta y vuelve (squash and stretch), desde los pies */
  jugador(D, j) {
    const C = j.cuerpo, q = C && C._squash; if (!q) return this._jugador(D, j);
    const u = ((D.E.t || 0) - q.t0) / .32; if (u >= 1 || u < 0) { C._squash = null; return this._jugador(D, j); }
    const k = q.k * Math.sin(u * Math.PI) * Math.exp(-u * 2.2) * .9, [x, y] = D.pr(C.x, C.y, (C.zPaso || 0) + (C.z || 0)); D.g.save(); D.g.translate(x, y); D.g.scale(1 + k * .3, 1 - k * .3); D.g.translate(-x, -y); this._jugador(D, j); D.g.restore();
  },
  _jugador(D, j) {
    const { g, pr, z, P } = D, C = j.cuerpo, A = j.aspecto, V = C.veh, [x, y] = pr(C.x, C.y, C.zPaso + C.z), fn = MC.arte.f('jugador');
    if (fn && fn(g, j, x, y, z, P, D) !== false) return;
    g.fillStyle = 'rgba(0,0,0,.3)'; const [sx, sy] = pr(C.x, C.y, C.zPaso); g.beginPath(); g.ellipse(sx, sy, Math.max(2, z * .7), Math.max(1.2, z * .4 * P.k), 0, 0, TAU); g.fill();
    /* marca del jugador (como en GTA): un anillo y una flecha de rumbo, para encontrarse siempre en el mapa */
    if (D.E.marcaJugador !== false) { const t = D.E.t || 0, r = Math.max(10, z * 1.2) * (1 + .07 * Math.sin(t * 4)), kk = D.modo === 'cenital' ? 1 : Math.max(.25, P.k), [fx, fy] = pr(C.x + Math.cos(C.a), C.y + Math.sin(C.a), C.zPaso), dl = Math.hypot(fx - sx, fy - sy) || 1, ux = (fx - sx) / dl, uy = (fy - sy) / dl;
      g.save(); g.strokeStyle = 'rgba(57,255,179,.9)'; g.lineWidth = Math.max(2, z * .14); g.beginPath(); g.ellipse(sx, sy, r, r * kk, 0, 0, TAU); g.stroke(); g.fillStyle = '#39ffb3'; const ax = sx + ux * (r + 4), ay = sy + uy * (r * kk + 4), w = Math.max(6, r * .45); g.beginPath(); g.moveTo(ax + ux * w, ay + uy * w); g.lineTo(ax - uy * w * .6, ay + ux * w * .6); g.lineTo(ax + uy * w * .6, ay - ux * w * .6); g.closePath(); g.fill(); g.restore(); }
    if (D.modo === 'cenital') {
      g.save(); g.translate(x, y); g.rotate(C.a + P.yaw); g.scale(z, z);
      const frena = (C._acel || 0) < -2.2 && Math.abs(C.v) > .8, nocheJ = (D.noche || 0) > .4;   /* 2.8: luces de freno y faros (entrega maestra §11.2, R13 y R19) */
      const dibujo = V.clase !== 'pie' && MC.arte.f('vehiculoArriba')?.(g,V,0,0,1,0);
      if (dibujo && ['auto','pesado','moto'].includes(V.clase)) { g.restore(); if (nocheJ) this.faros(D, C, V); return; }
      if (!dibujo && V.clase !== 'pie') { if (V.clase === 'auto' || V.clase === 'pesado' || V.clase === 'moto') { Pincel.vehiculoArriba(g, V.clase === 'moto' ? 'moto' : 'carro', V.color, V.largo, V.ancho, frena, nocheJ); g.restore(); if (nocheJ) this.faros(D, C, V); return; } g.fillStyle = '#1d1f24'; g.fillRect(-V.largo / 2, -.08, V.largo, .16); g.fillStyle = V.color || '#7ab800'; g.fillRect(-V.largo * .3, -.25, V.largo * .6, .5); }
      g.restore(); const J = Personaje.pose(C.estado || 'quieto', C.fase); J.fase = C.fase; MC.arte.f('personajeArriba')(g, J, A, x, y, z, C.a + P.yaw);
      if (C.nadando || C.vadeando) { g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = Math.max(1, z * .08); for (const k of [1, 1.6]) { g.beginPath(); g.arc(x, y, z * (.5 * k + .1 * Math.sin((D.E.t || 0) * 3 + k)), 0, TAU); g.stroke(); } if (C.buceando) { g.fillStyle = 'rgba(30,95,140,.55)'; g.beginPath(); g.arc(x, y, z * .9, 0, TAU); g.fill(); this.burbujas(g, x, y - z * .2, y + z * .4, z * 1.5, D.E.t || 0); } }
      return;
    }
    const dir = Math.cos(C.a + P.yaw) >= 0 ? 1 : -1, esc = Math.max(4, z * P.hk * 1.1);
    const cabeceo = V.clase !== 'pie' && !C.enAire ? clamp(-(C._acel || 0) * .011, -.1, .1) * dir : 0; const cab = cabeceo - (C.inclinacion || 0) * dir; if (cab) { g.save(); g.translate(x, y); g.rotate(cab); g.translate(-x, -y); }   /* 2.7 · peso: cabecea al acelerar y al frenar */
    const vl = MC.arte.f('vehiculoLado'); if (vl && V.clase !== 'pie') vl(g, V, x, y, esc, dir, C);
    const J = Personaje.pose(C.estado || 'quieto', C.fase, { alto: A.alto, manubrio: V.manubrio }); MC.arte.f('personajeLado')(g, J, A, x, y, esc, dir); if (cab) g.restore();
    /* en el agua: el agua tapa las piernas (vadeando) o casi todo el cuerpo (nadando), con su onda */
    if (C.nadando || C.vadeando) {
      /* la superficie del agua tapa lo que está debajo: las piernas al vadear, el cuerpo al nadar y todo al bucear */
      const sup = pr(C.x, C.y, (C.zPaso || 0) + (C.buceando ? 0 : C.nadando ? .58 : .55))[1], bajo = y + esc * (C.buceando ? .9 : .1), t = D.E.t || 0;
      g.fillStyle = C.buceando ? 'rgba(30,95,140,.72)' : 'rgba(52,120,160,.62)'; g.fillRect(x - esc * 1.1, sup, esc * 2.2, Math.max(1, bajo - sup));
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = Math.max(1, esc * .06); g.beginPath(); g.ellipse(x, sup, esc * (.7 + .15 * Math.sin(t * 3)), esc * .12, 0, 0, TAU); g.stroke();
      if (C.buceando) this.burbujas(g, x, sup, y, esc, t);
    }
  },
  /* burbujas que suben desde quien bucea hasta la superficie */
  burbujas(g, x, ySup, yBase, esc, t) { g.fillStyle = 'rgba(235,248,255,.85)'; for (let i = 0; i < 6; i++) { const f = ((t * .7 + i / 6) % 1), yy = lerp(yBase, ySup, f), xx = x + Math.sin(t * 2 + i * 1.7) * esc * .2 + esc * .15; g.beginPath(); g.arc(xx, yy, Math.max(1, esc * (.05 + .03 * (i % 3))), 0, TAU); g.fill(); } },
  /* el vehículo que quedó parqueado (en la orilla o amarrado en el agua) */
  estacionado(D, e) {
    const { g, pr, z, P, modo } = D, V = Vehiculos.get(e.veh), [x, y] = pr(e.x, e.y, 0);
    if (modo === 'cenital') { if (MC.arte.f('vehiculoArriba')?.(g,V,x,y,z,e.a + P.yaw)) return; g.save(); g.translate(x, y); g.rotate(e.a + P.yaw); g.scale(z, z); if (V.clase === 'auto' || V.clase === 'pesado' || V.clase === 'moto') Pincel.vehiculoArriba(g, V.clase === 'moto' ? 'moto' : 'carro', V.color, V.largo, V.ancho, false, false); else { g.fillStyle = '#1d1f24'; g.fillRect(-V.largo / 2, -.08, V.largo, .16); g.fillStyle = V.color || '#7ab800'; g.fillRect(-V.largo * .3, -.22, V.largo * .6, .44); } g.restore(); return; }
    const vl = MC.arte.f('vehiculoLado'); Sombras.contacto(g, x, y, z * (V.largo || 1.6) * .5, z * .25, .25); if (vl) vl(g, V, x, y, Math.max(4, z * P.hk * 1.1), Math.cos(e.a + P.yaw) >= 0 ? 1 : -1, null);
  },
  cables(D, cables) {
    const {g,z,P}=D, clave=[z,P.yaw,P.k,P.hk].join('/');
    g.save(); g.strokeStyle='rgba(30,32,38,.8)'; g.lineWidth=Math.max(.6,z*.12);
    for (const L of cables) {
      const inicio=L.T.at(0), [ox,oy]=D.pr(inicio.x,inicio.y);
      if (L._tramaCable?.clave!==clave) {
        const path=new Path2D();
        for (let s=0; s<=L.T.largo; s+=20) {
          let distancia=Infinity;
          for (const e of L.est) distancia=Math.min(distancia,Math.abs(e.s-s));
          const c=L.T.at(s), h=6+22*suave(clamp(distancia/120,0,1)), [x,y]=D.pr(c.x,c.y,h);
          if (s) path.lineTo(x-ox,y-oy); else path.moveTo(x-ox,y-oy);
        }
        L._tramaCable={clave,path};
      }
      g.save(); g.translate(ox,oy); g.stroke(L._tramaCable.path); g.restore();
    }
    g.restore();
  },
  etiquetas(D) {
    const { g, pr, z, W, H, E } = D; if (z < .35) return; g.font = '700 ' + Math.round(clamp(z * 4, 10, 14)) + 'px system-ui, sans-serif'; g.textAlign = 'center';
    /* las etiquetas no se montan unas sobre otras ni tapan el centro (donde va el jugador) */
    const usadas = [], cx = W / 2, cy = H / 2, R0 = Math.min(W, H) * .09;
    const pon = (t, x, y, col) => { const [sx, sy] = pr(x, y, 8); if (sx < -60 || sx > W + 60 || sy < -20 || sy > H + 20) return; const w = g.measureText(t).width + 10, r = [sx - w / 2 - 3, sy - 19, sx + w / 2 + 3, sy + 5]; if (E.bloqueosEtiquetas && E.bloqueosEtiquetas(W, H).some(z => r[0] < z[2] && r[2] > z[0] && r[1] < z[3] && r[3] > z[1])) return; if (usadas.some(u => r[0] < u[2] && r[2] > u[0] && r[1] < u[3] && r[3] > u[1])) return; if (Math.abs(sx - cx) < w / 2 + R0 && Math.abs(sy - 8 - cy) < R0 + 10) return; usadas.push(r); g.fillStyle = 'rgba(10,35,66,.82)'; g.fillRect(sx - w / 2, sy - 16, w, 18); g.fillStyle = col; g.fillText(t, sx, sy - 3); };
    for (const l of E.transporte ? E.transporte.lineas : []) if (l.clase === 'metro' || l.clase === 'cable' || l.clase === 'tram') for (const s of l.est) { const q = l.T.at(s.s); pon(s.nombre, q.x, q.y, '#ffffff'); }
    if (z > .9) for (const s of E.mundo.transporte.encicla || []) pon('🚲 ' + s.nombre, s.x, s.y, '#c4ec7c');
    const lug = []; for (const L of E.mundo.lugares) { if (L.secreto) continue; const [sx, sy] = pr(L.x, L.y, 8); if (sx > -40 && sx < W + 40 && sy > 0 && sy < H + 20) lug.push([Math.hypot(sx - W / 2, sy - H / 2), L]); }
    lug.sort((a, b) => a[0] - b[0]); for (const [, L] of lug.slice(0, D.P.k < .45 ? 5 : z > 3 ? 14 : 8)) pon(L.nombre, L.x, L.y, '#ffd84a');   // pocas y las del centro: que no tapen el mapa
  }
};
MC.Vista2D = Vista2D;
