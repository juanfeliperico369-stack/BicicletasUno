/* =====================================================================
   PANORÁMICA 2D HÍBRIDA (de perfil) · la vista que pidió el autor con cuidado especial
   Junta y mejora las dos:
   - El Metro (23-lado.js, «estilo odisea»): el recorrido de perfil sobre el relieve real, montañas en capas con
     perspectiva atmosférica, cielo por hora con sol y luna, nubes, gallinazos, lluvia, niebla y relámpagos, las
     luces de los barrios que se encienden de noche, el tren en el viaducto y el Metrocable con su balanceo.
   - Juega EnCicla (renderPano): plataformas; la bici sigue la ruta sola (→ pedalea, ← frena, ↑ salta).
   Mejoras: la fila de edificios del frente sale del mundo real (su huella, su altura, el color de su zona y las
   ventanas de noche); los emblemáticos con su silueta al pasar; capas con paralaje por distancia real
   (cordillera, laderas con sus barrios, ciudad media y calle); subidas y bajadas reales; puentes, viaducto y
   deprimidos a su altura; cruces con su nombre; tráfico y gente de perfil; sirve para TODOS los vehículos y el
   personaje (y el tren, el tranvía y el cable); se ve bien con el celular vertical y acostado; y entra y sale
   de la cenital con una transición suave en el mismo punto.
   ===================================================================== */
const PANO_ST = 4, PANO_BLOQUE = 64;
class Panoramica {
  constructor(mundo) { this.mundo = mundo; this.bloques = new Map(); this.id = 0; this._bc = {}; this.lado = -1; this.ex = 1.35; }
  /* un recorrido nuevo (o el lado cambia): se olvida lo calculado */
  reiniciar(id) { this.bloques.clear(); this.id = id; this._bc = {}; }
  par(d) { return 140 / (140 + Math.max(0, d - 10)); }
  /* punto del trazo; más allá de sus puntas sigue derecho (así las montañas lejanas no se aplanan) */
  _pt(T, s) { if (s >= 0 && s <= T.largo) return T.at(s); const fin = s > T.largo, e = T.at(fin ? T.largo : 0), a = T.rumbo(fin ? T.largo - 3 : 3, 3), d = fin ? s - T.largo : s; return { x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, a, i: e.i }; }
  /* ---------- perfil por bloques de 64 m a lo largo del trazo ---------- */
  bloque(T, i) {
    const k = i; let B = this.bloques.get(k); if (B) return B;
    const M = this.mundo, s0 = i * PANO_BLOQUE, n = PANO_BLOQUE / PANO_ST + 1, L = this.lado;
    B = { s0, cerca: new Float32Array(n), medio: new Float32Array(n), lejos: new Float32Array(n), urbM: new Float32Array(n), urbL: new Float32Array(n), tt: new Uint8Array(n), alzado: new Float32Array(n), frente: [], ciudad: [], primer: [], hitos: [], cruces: [], estaciones: [], pasos: [], arboles: [] };
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; const Q = [];
    for (let j = 0; j < n; j++) {
      const s = s0 + j * PANO_ST, q = this._pt(T, s), bx = -Math.sin(q.a) * L, by = Math.cos(q.a) * L; Q.push({ s, x: q.x, y: q.y, a: q.a, bx, by });
      B.cerca[j] = M.cota(q.x, q.y); B.tt[j] = M.suelo(q.x + bx * 9, q.y + by * 9);
      let m = 0, f = 0, um = 0, ul = 0; for (const d of [400, 700, 1000, 1300, 1600]) { const x = q.x + bx * d, y = q.y + by * d; m = Math.max(m, M.cota(x, y)); um += TT_URBANO.has(M.suelo(x, y)) ? .2 : 0; }
      for (const d of [2000, 3000, 4200, 5600, 7000]) { const x = q.x + bx * d, y = q.y + by * d; f = Math.max(f, M.cota(x, y)); ul += TT_URBANO.has(M.suelo(x, y)) ? .2 : 0; }
      B.medio[j] = m; B.lejos[j] = f; B.urbM[j] = um; B.urbL[j] = ul;
      bx0 = Math.min(bx0, q.x); bx1 = Math.max(bx1, q.x); by0 = Math.min(by0, q.y); by1 = Math.max(by1, q.y);
    }
    const proyecta = (x, y) => { let bj = 0, bd = 1e18; for (let j = 0; j < Q.length; j++) { const d = (Q[j].x - x) ** 2 + (Q[j].y - y) ** 2; if (d < bd) { bd = d; bj = j; } } const q = Q[bj], ux = Math.cos(q.a), uy = Math.sin(q.a), dx = x - q.x, dy = y - q.y; return { s: q.s + dx * ux + dy * uy, d: dx * q.bx + dy * q.by, j: bj, a: q.a }; };
    /* edificios reales: frente (6–60 m al fondo), ciudad media (60–500 m), primer plano (al lado de la cámara) */
    for (const e of M.edificiosEn(bx0 - 500, by0 - 500, bx1 + 500, by1 + 500)) {
      const p = proyecta(e.x, e.y); if (p.s < s0 - 20 || p.s > s0 + PANO_BLOQUE + 20) continue; const st = estiloEdificio(M, e), ca = Math.cos(p.a), sa = Math.sin(p.a), ext = Math.abs(e.ux * ca + e.uy * sa) * e.hw + Math.abs(-e.uy * ca + e.ux * sa) * e.hd + .5, ob = { s: p.s, a: p.s - ext, b: p.s + ext, h: e.h, d: p.d, muro: st.muro, techo: st.techo, plano: st.plano, sem: e.s, cota: M.cota(e.x, e.y), clase: e.clase };
      if (p.d > 5 && p.d <= 60) B.frente.push(ob); else if (p.d > 60 && p.d < 500 && e.h > 6) B.ciudad.push(ob); else if (p.d < -5 && p.d > -40) B.primer.push(ob);
    }
    B.frente.sort((a, b) => b.d - a.d); B.ciudad.sort((a, b) => b.d - a.d);
    /* emblemáticos: hitos con huella y altura (la aguja del Coltejer, la basílica…) */
    for (const h of M.hitos) { const P = h.huella[0]; let cx = 0, cy = 0; for (let t = 0; t < P.length; t += 2) { cx += P[t]; cy += P[t + 1]; } cx /= P.length / 2; cy /= P.length / 2; if (cx < bx0 - 900 || cx > bx1 + 900 || cy < by0 - 900 || cy > by1 + 900) continue; const p = proyecta(cx, cy); if (p.s < s0 || p.s >= s0 + PANO_BLOQUE || p.d < 0 || p.d > 900) continue; let w = 0; for (let t = 0; t < P.length; t += 2) w = Math.max(w, Math.hypot(P[t] - cx, P[t + 1] - cy)); B.hitos.push({ s: p.s, d: p.d, h: h.alto + (h.corona || 0), w: w * 1.6, clase: h.clase, nombre: h.nombre, cota: M.cota(cx, cy) }); }
    /* estaciones EnCicla y del sistema cerca de la vía */
    for (const e of M.transporte.encicla) { if (e.x < bx0 - 40 || e.x > bx1 + 40 || e.y < by0 - 40 || e.y > by1 + 40) continue; const p = proyecta(e.x, e.y); if (Math.abs(p.d) < 40 && p.s >= s0 && p.s < s0 + PANO_BLOQUE) B.estaciones.push({ s: p.s, d: p.d, tipo: 'encicla', nombre: e.nombre }); }
    for (const l of M.transporte.lineas) if (l.clase === 'metro' || l.clase === 'tram' || l.clase === 'cable' || l.clase === 'brt') for (const e of l.estaciones) { if (e[1] < bx0 - 250 || e[1] > bx1 + 250 || e[2] < by0 - 250 || e[2] > by1 + 250) continue; const p = proyecta(e[1], e[2]); if (p.d > -30 && p.d < 250 && p.s >= s0 && p.s < s0 + PANO_BLOQUE) B.estaciones.push({ s: p.s, d: p.d, tipo: l.clase, color: l.color, nombre: e[0], linea: l.id, nivel: l.clase === 'metro' ? Math.max(0, M.nivel(e[1], e[2])) : 0, cota: M.cota(e[1], e[2]) }); }
    /* puentes, viaducto y deprimidos: el trazo va encima (alineado) o pasa por debajo (cruce) */
    for (const P of M.pasosEn(bx0 - 60, by0 - 60, bx1 + 60, by1 + 60)) {
      const Tp = P.trazo || (P.trazo = new Trazo(P.p));
      for (let j = 0; j < Q.length; j++) { const q = Q[j], pr = Tp.proyectar(q.x, q.y); if (pr.d > P.ancho / 2 + 6) continue; const c = Tp.at(pr.s), al = Math.abs(Math.cos(angDif(q.a, c.a))); const rampa = P.tipo === 'viaducto' ? 1e-6 : Math.min(P.largo * .4, P.tipo === 'tunel' ? 26 : P.peatonal ? 9 : 22), h = P.nivel * NIVEL_M * (P.tipo === 'viaducto' ? 1 : suave(Math.min(pr.s, P.largo - pr.s) / rampa));
        if (al > .9 && P.tipo !== 'viaducto' && !this.sinPasos) B.alzado[j] = Math.abs(h) > Math.abs(B.alzado[j]) ? h : B.alzado[j];
        else if (al < .75 && P.nivel > 0 && !B.pasos.some(o => o.P === P)) B.pasos.push({ P, s: q.s, h, ancho: P.ancho / Math.max(.35, Math.sqrt(1 - al * al)), tipo: P.tipo }); }
      if (P.tipo === 'viaducto') { for (let t = 0; t < P.largo; t += 30) { const c = Tp.at(t); if (c.x < bx0 - 300 || c.x > bx1 + 300 || c.y < by0 - 300 || c.y > by1 + 300) continue; const p = proyecta(c.x, c.y); if (p.s >= s0 && p.s < s0 + PANO_BLOQUE && p.d > 8 && p.d < 300) B.pasos.push({ P, s: p.s, d: p.d, h: P.nivel * NIVEL_M, tipo: 'viaducto_lado', cota: M.cota(c.x, c.y) }); } }
    }
    /* cruces de calles (con su nombre) */
    const Rc = M.red('calles'); let ultimo = -1e9;
    for (const q of Q) { if (q.s - ultimo < 18) continue; const c = Rc.cercana(q.x, q.y, 9, e => Math.abs(Math.cos(angDif(q.a, e.t.rumbo(e.t.proyectar(q.x, q.y).s)))) < .55); if (c) { B.cruces.push({ s: q.s, nombre: c.arista.nombre, ancho: c.arista.ancho }); ultimo = q.s; } }
    /* árboles por zona en las orillas */
    for (let s = s0; s < s0 + PANO_BLOQUE; s += 6) { const hv = h2(s | 0, 7, 3), q = this._pt(T, s), Z = M.estilo(q.x, q.y); if (hv < (Z.arboles || .4) * .6) B.arboles.push({ s: s + hv * 5, r: 2.4 + hv * 3, lado: h2(s | 0, 8, 3) < .65 ? 1 : -1, col: hv }); }
    this.bloques.set(k, B); while (this.bloques.size > 90) this.bloques.delete(this.bloques.keys().next().value);
    return B;
  }
  /* el fondo (cordillera, cerros y laderas) se mira por un eje recto y suavizado que pasa por el jugador:
     así una esquina del camino no hace saltar las montañas */
  fondo(T, s0) {
    const q = T.at(clamp(s0, 0, T.largo)), a0 = Math.atan2(T.at(clamp(s0 + 150, 0, T.largo)).y - T.at(clamp(s0 - 150, 0, T.largo)).y, T.at(clamp(s0 + 150, 0, T.largo)).x - T.at(clamp(s0 - 150, 0, T.largo)).x), F = this._fondo;
    if (F && F.id === this.id && Math.hypot(q.x - F.x, q.y - F.y) < 350 && Math.abs(angDif(F.a, a0)) < .35) return F;
    const M = this.mundo, a = F && F.id === this.id && Math.abs(angDif(F.a, a0)) < .6 ? F.a + angDif(F.a, a0) * .5 : a0, st = 30, n = 241, ux = Math.cos(a), uy = Math.sin(a), bx = -uy * this.lado, by = ux * this.lado, R = { id: this.id, x: q.x, y: q.y, a, s0, st, n, lejos: new Float32Array(n), medio: new Float32Array(n), urbM: new Float32Array(n), urbL: new Float32Array(n) };
    for (let i = 0; i < n; i++) { const d = (i - (n >> 1)) * st, x = q.x + ux * d, y = q.y + uy * d; let m = 0, f = 0, um = 0, ul = 0; for (const e of [400, 700, 1000, 1300, 1600]) { const X = x + bx * e, Y = y + by * e; m = Math.max(m, M.cota(X, Y)); um += TT_URBANO.has(M.suelo(X, Y)) ? .2 : 0; } for (const e of [2000, 3000, 4200, 5600, 7000]) { const X = x + bx * e, Y = y + by * e; f = Math.max(f, M.cota(X, Y)); ul += TT_URBANO.has(M.suelo(X, Y)) ? .2 : 0; } R.lejos[i] = f; R.medio[i] = m; R.urbM[i] = um; R.urbL[i] = ul; }
    const sm = (A, r) => { const o = new Float32Array(A.length); for (let i = 0; i < A.length; i++) { let t = 0, c = 0; for (let j = Math.max(0, i - r); j <= Math.min(A.length - 1, i + r); j++) { t += A[j]; c++; } o[i] = t / c; } return o; };
    R.lejos = sm(R.lejos, 3); R.medio = sm(R.medio, 1);
    /* cerros intermedios (de El Metro: el escalonado de siluetas) y un poco de detalle en la cresta */
    R.inter = new Float32Array(n); for (let i = 0; i < n; i++) { const u = (i - (n >> 1)) * st; R.inter[i] = R.lejos[i] * .6 + R.medio[i] * .4 + Math.sin(u * .0032 + 1) * 45 + Math.sin(u * .011) * 22; R.lejos[i] += Math.sin(u * .0021) * 30 + Math.sin(u * .0067 + 2) * 16 + (h2(i, 3, 17) - .5) * 10; }
    R.inter = sm(R.inter, 2); R.urbI = R.urbM.map((v, i) => (v + R.urbL[i]) / 2); return (this._fondo = R);
  }
  mf(campo, s) { const F = this._fondo, f = clamp((s - F.s0) / F.st + (F.n >> 1), 0, F.n - 1.001), i = f | 0, t = f - i; return F[campo][i] * (1 - t) + F[campo][i + 1] * t; }
  muestra(T, campo, s) { const i = Math.floor(s / PANO_BLOQUE), B = this.bloque(T, i), f = clamp((s - B.s0) / PANO_ST, 0, PANO_BLOQUE / PANO_ST - .001), j = f | 0, t = f - j; return B[campo][j] * (1 - t) + B[campo][j + 1] * t; }
  /* ---------- dibujo ----------
     E.pano = { trazo, s, id } (el camino que se sigue y dónde va el jugador) · op: { k (px por metro), sinJugador } */
  dibujar(g, W, H, E, op = {}) {
    const pn = E.pano; if (!pn || !pn.trazo) return; if (pn.id !== this.id) this.reiniciar(pn.id);
    const T = pn.trazo, s0 = pn.s, M = this.mundo, sky = E.cielo, t = E.t || 0, dir = -this.lado, vertical = H > W * 1.15;
    const k = op.k || clamp(Math.min(W, H * 1.4) / 70, 4, 40) * (E.camara.zoom / 3.2), cx = dir > 0 ? W * (vertical ? .3 : .36) : W * (vertical ? .7 : .64), base = H * (vertical ? .6 : .66), ex = this.ex, kj = k * 1.45;
    const z0 = this.muestra(T, 'cerca', s0) + this.muestra(T, 'alzado', s0), X = s => cx + (s - s0) * k * dir, sMin = s0 - (dir > 0 ? cx : W - cx) / k - 20, sMax = s0 + (dir > 0 ? W - cx : cx) / k + 20;
    const Ysuelo = s => base - (this.muestra(T, 'cerca', s) - z0) * k * ex - this.muestra(T, 'alzado', s) * k;
    const ink = [.05, .07, .12], C = (c, a = 1) => css3(c, a), noche = sky.noche, dia = sky.dia;
    /* 1. cielo, estrellas, sol y luna donde de verdad están (mirando hacia el fondo) */
    const gr = g.createLinearGradient(0, 0, 0, base); gr.addColorStop(0, C(sky.top)); gr.addColorStop(.75, C(sky.hor)); gr.addColorStop(1, C(sky.bruma)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (noche > .3) for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(255,245,220,' + (noche * (.3 + .5 * Math.abs(Math.sin(t * .6 + i)))) + ')'; g.fillRect(h2(i, 3, 1) * W, h2(i, 4, 1) * base * .7, 1.5, 1.5); }
    const qv = T.at(s0), mira = Math.atan2(-Math.sin(qv.a) * this.lado, -Math.cos(qv.a) * this.lado);   // acimut hacia el fondo (desde el norte, horario)
    const astro = (A, r, col, halo) => { const dA = angDif(mira, A.az), sx = W / 2 + dA / 1.25 * (W / 2), sy = base - Math.sin(A.alt) / Math.sin(1.2) * base * .9; if (A.alt < -.05 || Math.abs(dA) > 1.5) return; if (halo) { g.fillStyle = halo; g.beginPath(); g.arc(sx, sy, r * 3, 0, TAU); g.fill(); } g.fillStyle = col; g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill(); return [sx, sy]; };
    const rr = Math.min(W, H) * .04; astro(sky.sol, rr, 'rgba(255,240,205,.95)', 'rgba(255,215,150,.18)');
    const lu = astro(sky.luna, rr * .7, 'rgba(240,240,225,.92)'); if (lu && sky.luna.fase) { g.fillStyle = C(sky.top); g.beginPath(); g.arc(lu[0] + rr * .7 * (sky.luna.fase < .5 ? .6 : -.6) * (1 - Math.abs(sky.luna.fase - .5) * 2), lu[1], rr * .65, 0, TAU); g.fill(); }
    /* nubes con paralaje 0,08 (más y más grises si llueve) */
    const nN = 4 + Math.round((E.clima ? E.clima.nubes : .2) * 8); for (let i = 0; i < nN; i++) { const x = ((h2(i, 1, 9) * W * 2 - s0 * k * .08 * dir - t * 5 * (1 + i % 3)) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = base * (.08 + h2(i, 2, 9) * .35), r = 26 + h2(i, 3, 9) * 50; g.fillStyle = C(mez3(sky.hor, E.clima && E.clima.lluvia > .2 ? [.5, .52, .56] : [1, 1, 1], .45 * dia + .1), .3 + .25 * dia); for (let q = 0; q < 4; q++) { g.beginPath(); g.ellipse(x + q * r * .55, y + (q % 2) * r * .12, r * .55, r * .26, 0, 0, TAU); g.fill(); } }
    /* 2. montañas en capas: cordillera, cerros intermedios y laderas con sus barrios */
    this.fondo(T, s0); let lo = 1e9, hi = -1e9; for (let s = s0 - W / (k * .16); s < s0 + W / (k * .16); s += 60) { lo = Math.min(lo, this.mf('medio', s)); hi = Math.max(hi, this.mf('lejos', s)); }
    const span = Math.max(300, hi - lo), warm = clamp((sky.hor[0] - sky.hor[2]) * 2.2, 0, 1) * (1 - noche);
    const oFar = mez3(mez3(sky.hor, sky.top, .45), ink, .26 + .22 * noche), dFar = mez3(mez3(sky.top, [.5, .62, .76], .5), sky.hor, .18), dd = clamp((dia - .55) / .35, 0, 1) * (1 - warm * .8);
    let cFar = mez3(oFar, dFar, dd), cMid = mez3(mez3(oFar, [.2, .4, .24], .55 * dia), ink, .3), cNear = mez3(mez3(cMid, [.36, .52, .32], .4 * dia), ink, .22 + .3 * noche);
    if (E.clima && E.clima.lluvia > .2) { cFar = mez3(cFar, sky.bruma, .3); cMid = mez3(cMid, [.4, .45, .45], .15); }
    const capa = (campo, urb, par, vs, off, col, haze, barrio) => {
      const yAt = s => base - off - (this.mf(campo, s) - lo) / span * vs, pts = []; let top = H;
      for (let x = 0; x <= W + 4; x += 4) { const s = s0 + (x - cx) / (k * par) * dir, y = yAt(s); pts.push([x, y]); if (y < top) top = y; }
      const gf = g.createLinearGradient(0, top, 0, base + 30); gf.addColorStop(0, C(col)); gf.addColorStop(1, C(mez3(col, sky.bruma, haze))); g.fillStyle = gf;
      g.beginPath(); g.moveTo(0, H); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(W, H); g.closePath(); g.fill();
      g.strokeStyle = C(mez3(col, [1, .96, .88], .16 * dia + .05), .8); g.lineWidth = 1.2; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + .5) : g.moveTo(x, y + .5)); g.stroke();
      if (barrio) this.barrios(g, W, H, s0, T, urb, par, yAt, col, sky, base, cx, k, dir, barrio);
    };
    capa('lejos', 'urbL', .16, H * .34, H * .06, mez3(cFar, ink, .08 * dia), .4, 'lejos');
    capa('inter', 'urbI', .26, H * .29, H * .03, mez3(cFar, cMid, .42), .34, 'inter');
    if (E.clima && (E.clima.niebla > .2 || dia < .6)) { const fg = g.createLinearGradient(0, base - H * .3, 0, base); fg.addColorStop(0, C(sky.bruma, 0)); fg.addColorStop(1, C(sky.bruma, Math.min(.75, .25 + E.clima.niebla * .6))); g.fillStyle = fg; g.fillRect(0, base - H * .3, W, H * .3); }
    capa('medio', 'urbM', .38, H * .24, -H * .015, cMid, .22, 'medio');
    /* gallinazos planeando */
    for (let i = 0; i < 4; i++) { const bx = ((h2(i, 7, 1) * W + t * (14 + i * 3) - s0 * k * .3 * dir) % (W + 80) + W + 80) % (W + 80) - 40, by = base * (.2 + .15 * h2(i, 8, 1)) + Math.sin(t * .8 + i) * 8, wv = Math.sin(t * 3 + i) * 3; g.strokeStyle = C(ink, .65); g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx - 7, by - 2 + wv); g.lineTo(bx, by); g.lineTo(bx + 7, by - 2 + wv); g.stroke(); }
    /* 3. ciudad media y emblemáticos (paralaje por su distancia real), viaducto y trenes, cables */
    const bloques = []; for (let i = Math.floor((sMin - 300) / PANO_BLOQUE); i <= Math.floor((sMax + 300) / PANO_BLOQUE); i++) bloques.push(this.bloque(T, i));
    const Xd = (s, d) => cx + (s - s0) * k * dir * this.par(d), Yd = (cota, d) => base - (cota - z0) * k * ex * this.par(d) * .55 - d * k * this.par(d) * .06;
    const lejanos = []; for (const B of bloques) { for (const o of B.ciudad) lejanos.push(o); for (const h of B.hitos) lejanos.push(Object.assign({ hito: 1 }, h)); for (const p of B.pasos) if (p.tipo === 'viaducto_lado') lejanos.push(Object.assign({ via: 1 }, p)); }
    lejanos.sort((a, b) => b.d - a.d);
    for (const o of lejanos) {
      const pa = this.par(o.d), x = Xd(o.s, o.d), y = Yd(o.cota ?? z0, o.d); if (x < -200 || x > W + 200) continue;
      if (o.via) { const hh = o.h * k * pa; g.fillStyle = C(mez3(mez3([.62, .64, .68], cMid, .35), ink, noche * .5)); g.fillRect(x - 15 * k * pa, y - hh - 1.6 * k * pa, 30 * k * pa + 1, 1.6 * k * pa); g.fillRect(x - .7 * k * pa, y - hh, 1.4 * k * pa, hh); continue; }
      if (o.hito) { this.silueta(g, o, x, y, k * pa, mez3(mez3([.55, .57, .62], cMid, .5), ink, noche * .55), noche); if (pa > .35 && Math.abs(x - cx) < W * .25) (E._etq || (E._etq = [])).push({ t: o.nombre, x, y: y - o.h * k * pa - 10 }); continue; }
      const hh = o.h * k * pa, ww = (o.b - o.a) * k * pa, col = mez3(mez3(hex3(o.muro), cMid, .55 - pa * .4), ink, noche * .55);
      g.fillStyle = C(col); g.fillRect(x - ww / 2, y - hh, ww, hh + 2);
      if (noche <= .25 && pa > .3 && hh > 10) { g.fillStyle = C(mez3(col, [.08, .12, .18], .35), .55); const pis = Math.min(20, o.h / 3 | 0); for (let p = 0; p < pis; p++) g.fillRect(x - ww / 2 + ww * .08, y - hh + (p + .4) * hh / Math.max(1, pis), ww * .84, Math.max(1, hh / Math.max(1, pis) * .3)); }
      if (noche > .25) { g.fillStyle = 'rgba(255,214,120,' + (noche * .7) + ')'; const pis = Math.min(20, o.h / 3 | 0); for (let p = 0; p < pis; p++) for (let q = 0; q < 3; q++) if (h2(o.sem * 1e4 | 0, p * 3 + q, 5) < .35) g.fillRect(x - ww / 2 + ww * (.2 + q * .28), y - hh + (p + .4) * hh / Math.max(1, pis), Math.max(1, ww * .1), Math.max(1, hh / Math.max(1, pis) * .35)); }
    }
    /* trenes del sistema que van cerca (en su viaducto o a ras) y cabinas del cable */
    for (const v of E.vehiculos || []) {
      if (v.clase !== 'metro' && v.clase !== 'tram' && v.clase !== 'cable') continue; const p = this._proy(T, s0, v.x, v.y); if (!p || p.d < -20 || p.d > 400) continue;
      const pa = this.par(Math.max(0, p.d)), x = Xd(p.s, p.d), y = Yd(M.cota(v.x, v.y), p.d) - (v.z || 0) * k * pa; if (x < -300 || x > W + 300) continue;
      if (v.clase === 'cable') { const sw = Math.sin(t * 1.3 + v.s * .1) * (E.clima ? E.clima.viento.v * .02 : .03); g.save(); g.translate(x, y); g.rotate(sw); const s = 2.4 * k * pa; g.fillStyle = '#2d3138'; g.fillRect(-.1 * s, -1.4 * s, .2 * s, 1.4 * s); g.fillStyle = v.color; g.fillRect(-s * .8, 0, s * 1.6, s * 1.25); g.fillStyle = noche > .3 ? 'rgba(255,230,160,.9)' : 'rgba(190,220,240,.9)'; g.fillRect(-s * .6, s * .2, s * 1.2, s * .45); g.restore(); continue; }
      const largo = v.largo * k * pa, alto = 3.6 * k * pa, lado = Math.cos(angDif(T.at(p.s).a, v.a)) >= 0 ? 1 : -1; g.fillStyle = '#e6e9ee'; g.fillRect(x - largo / 2, y - alto, largo, alto); g.fillStyle = v.color; g.fillRect(x - largo / 2, y - alto * .35, largo, alto * .12);
      g.fillStyle = noche > .3 ? 'rgba(255,236,170,.95)' : 'rgba(40,55,75,.8)'; const nv = Math.max(4, largo / (3 * k * pa) | 0); for (let q = 0; q < nv; q++) g.fillRect(x - largo / 2 + (q + .2) * largo / nv, y - alto * .82, largo / nv * .55, alto * .3);
      if (lado * dir > 0) { g.fillStyle = '#ffe7a0'; g.fillRect(x + largo / 2 - 2, y - alto * .3, 2, 2); }
    }
    /* 4. fila de edificios del frente (reales) con cruces que abren hueco */
    const huecos = []; for (const B of bloques) for (const c of B.cruces) huecos.push(c);
    const enCruce = (a, b) => huecos.some(c => b > c.s - c.ancho / 2 - 2 && a < c.s + c.ancho / 2 + 2);
    for (const B of bloques) for (const o of B.frente) {
      if (enCruce(o.a, o.b)) continue; const pa = this.par(o.d), xa = Xd(o.a, o.d), xb = Xd(o.b, o.d); if (Math.max(xa, xb) < -20 || Math.min(xa, xb) > W + 20) continue;
      const yb = Ysuelo(o.s) - o.d * k * pa * .06, hh = o.h * k * pa, x0 = Math.min(xa, xb), ww = Math.abs(xb - xa), col = mez3(mez3(hex3(o.muro), [0, 0, 0], .08 + noche * .5), cNear, .12 + (1 - pa) * .3);
      g.fillStyle = C(col); g.fillRect(x0, yb - hh, ww + .5, hh + 3);
      g.fillStyle = C(mez3(hex3(o.techo), ink, noche * .5)); if (o.plano) g.fillRect(x0 - 1, yb - hh - 1.4 * pa * k * .3, ww + 2, 1.4 * pa * k * .3); else { g.beginPath(); g.moveTo(x0 - 1.5, yb - hh); g.lineTo(x0 + ww / 2, yb - hh - Math.min(ww * .3, 3 * k * pa)); g.lineTo(x0 + ww + 1.5, yb - hh); g.fill(); }
      const pis = Math.max(1, Math.min(24, Math.round(o.h / 3))), cols = Math.max(1, Math.min(8, Math.round((o.b - o.a) / 3.5))), wh = hh / pis;
      for (let p = 0; p < pis; p++) for (let q = 0; q < cols; q++) { const lit = noche > .25 && h2(o.sem * 1e4 | 0, p * 9 + q, 5) < .42; g.fillStyle = lit ? 'rgba(255,214,120,' + (.5 + noche * .45) + ')' : C(mez3(col, [.1, .14, .2], .45), .7); g.fillRect(x0 + (q + .25) * ww / cols, yb - hh + (p + .3) * wh, ww / cols * .5, wh * .42); }
      if (o.h < 12 && h2(o.sem * 1e4 | 0, 77, 1) < .5) { g.fillStyle = ['#c43a26', '#1C5C9C', '#59AB42', '#E38835', '#743D90'][(o.sem * 50 | 0) % 5]; g.globalAlpha = .7; g.fillRect(x0 + 1, yb - wh * .9, ww - 2, Math.max(1.5, k * .3)); g.globalAlpha = 1; }   // toldos de los locales
    }
    /* letreros de los cruces */
    for (const c of huecos) { const x = X(c.s), y = Ysuelo(c.s); if (x < -40 || x > W + 40 || !c.nombre) continue; g.fillStyle = '#2b2f38'; g.fillRect(x - .5, y - 3.2 * k, Math.max(1, .14 * k), 3.2 * k); g.fillStyle = '#1C5C9C'; const tw = Math.max(40, c.nombre.length * 5.5); g.fillRect(x - tw / 2, y - 3.6 * k - 12, tw, 13); g.fillStyle = '#fff'; g.font = '700 10px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(c.nombre.slice(0, 26), x, y - 3.6 * k - 2); }
    /* 5. el suelo de la vía con su perfil real: andén, calzada o ciclorruta, rayas; puentes con sus pilas */
    const tt0 = M.suelo(qv.x, qv.y), esCiclo = tt0 === TT.CICLO || (E.pano.ciclo), via = esCiclo ? '#2f9e57' : '#4a4f59', paso = Math.max(2, Math.round(3 / Math.max(.2, k / 4)));
    { const capaS = (off, col) => { g.fillStyle = C(mez3(col, ink, noche * .55)); g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W + paso; x += paso) { const s = s0 + (x - cx) / k * dir; g.lineTo(x, Ysuelo(s) + off * k); } g.lineTo(W, H); g.fill(); };
      capaS(1.6, [.78, .75, .68]); capaS(2.4, esCiclo ? [.36, .55, .3] : [.62, .6, .55]); capaS(3.4, [.34, .5, .3]); capaS(5.2, [.42, .46, .4]); capaS(7.5, [.3, .36, .28]); capaS(10.5, [.22, .26, .2]);
      const gr2 = g.createLinearGradient(0, base + 4 * k, 0, H); gr2.addColorStop(0, 'rgba(0,0,0,0)'); gr2.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = gr2; g.fillRect(0, base + 4 * k, W, H); }
    for (let x = 0; x <= W + paso; x += paso) { const s = s0 + (x - cx) / k * dir, y = Ysuelo(s), al = this.muestra(T, 'alzado', s); if (al > .5) { const yt = y + al * k; g.fillStyle = C(mez3([.42, .36, .28], ink, noche * .5)); g.fillRect(x, yt + 1.6 * k, paso + .5, H - yt); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y + 1.6 * k, paso + .5, al * k); if ((Math.floor(s / 24) & 1) && (s % 24) < 2) { g.fillStyle = '#9aa3ad'; g.fillRect(x, y + 1.6 * k, Math.max(2, k * .8), al * k); } } g.fillStyle = '#d4cfc3'; g.fillRect(x, y - .25 * k, paso + .5, .35 * k); g.fillStyle = via; g.fillRect(x, y + .1 * k, paso + .5, 1.5 * k); if (((s / 3 | 0) & 1) && k > 2) { g.fillStyle = esCiclo ? '#e8f5d0' : '#e4e4dc'; g.fillRect(x, y + .8 * k, paso + .5, Math.max(1, .12 * k)); } }
    /* pasos elevados que cruzan por encima */
    for (const B of bloques) for (const p of B.pasos) { if (p.tipo === 'viaducto_lado') continue; const x = X(p.s), y = Ysuelo(p.s), hh = Math.max(4.5, p.h) * k, ww = p.ancho * k; if (x < -ww || x > W + ww) continue; g.fillStyle = p.tipo === 'viaducto' ? '#9aa3ad' : '#8e8a80'; g.fillRect(x - ww / 2, y - hh - 1.4 * k, ww, 1.4 * k); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - ww / 2, y - hh, ww, hh * .15); g.fillStyle = tono('#9aa3ad', -.1); g.fillRect(x - ww / 2 - .6 * k, y - hh, 1.2 * k, hh); g.fillRect(x + ww / 2 - .6 * k, y - hh, 1.2 * k, hh); }
    /* 6. mobiliario: árboles, faroles y estaciones */
    for (const B of bloques) for (const a of B.arboles) { const x = X(a.s), y = Ysuelo(a.s) - (a.lado > 0 ? 1.2 * k : -2.2 * k); if (x < -30 || x > W + 30) continue; const r = a.r * k * (a.lado > 0 ? .9 : 1.05), gc = mez3(mez3([.2, .45, .22], [.32, .55, .3], a.col), ink, noche * .55); g.fillStyle = C(mez3(gc, [.3, .2, .1], .6)); g.fillRect(x - .15 * k, y - r * 1.2, .3 * k, r * 1.2); g.fillStyle = C(gc); g.beginPath(); g.arc(x, y - r * 1.5, r, 0, TAU); g.arc(x - r * .5, y - r * 1.2, r * .7, 0, TAU); g.arc(x + r * .5, y - r * 1.25, r * .75, 0, TAU); g.fill(); }
    for (let s = Math.floor(sMin / 30) * 30; s < sMax; s += 30) { const x = X(s), y = Ysuelo(s); g.fillStyle = '#2b2f38'; g.fillRect(x, y - 6 * k, Math.max(1, .15 * k), 6 * k); g.fillRect(x - .8 * k * dir, y - 6 * k, k * .9, Math.max(1, .14 * k)); if (noche > .3) { g.fillStyle = 'rgba(255,220,140,.95)'; g.fillRect(x - .8 * k * dir, y - 5.9 * k, k * .5, .3 * k); g.fillStyle = 'rgba(255,210,130,' + noche * .12 + ')'; g.beginPath(); g.moveTo(x - .6 * k * dir, y - 5.8 * k); g.lineTo(x - 3.5 * k, y); g.lineTo(x + 2.5 * k, y); g.fill(); } }
    for (const B of bloques) for (const e of B.estaciones) {
      const x = X(e.s), y = Ysuelo(e.s); if (x < -80 || x > W + 80) continue;
      if (e.tipo === 'encicla') { g.fillStyle = '#7ab800'; g.fillRect(x - 3 * k, y - 3.2 * k, 6 * k, .45 * k); g.fillStyle = '#9aa7b8'; g.fillRect(x - 2.8 * k, y - 3 * k, .2 * k, 3 * k); for (let i = 0; i < 5; i++) { g.fillStyle = '#59606c'; g.fillRect(x - 2 * k + i * k, y - 1.2 * k, .1 * k, 1.2 * k); g.fillStyle = '#7ab800'; g.fillRect(x - 2.2 * k + i * k, y - 1.1 * k, .5 * k, .5 * k); } (E._etq || (E._etq = [])).push({ t: '🚲 ' + e.nombre, x, y: y - 4 * k, c: '#c4ec7c' }); }
      else { const pa = this.par(Math.max(0, e.d)), xx = Xd(e.s, e.d), yy = Yd(e.cota ?? z0, e.d) - e.nivel * NIVEL_M * k * pa, w = (e.tipo === 'metro' ? 110 : 30) * k * pa; g.fillStyle = C(mez3(hex3(e.color || '#1C5C9C'), ink, noche * .3)); g.fillRect(xx - w / 2, yy - 6 * k * pa, w, 1.2 * k * pa); g.fillStyle = 'rgba(220,226,232,.85)'; g.fillRect(xx - w / 2, yy - 1.2 * k * pa, w, 1.2 * k * pa); (E._etq || (E._etq = [])).push({ t: e.nombre, x: xx, y: yy - 7 * k * pa, c: '#fff', bg: e.color }); }
    }
    /* 7. tráfico y gente de perfil (los que van por la misma vía) */
    for (const v of E.trafico || []) { const p = this._proy(T, s0, v.x, v.y); if (!p || Math.abs(p.d) > 14) continue; const x = X(p.s), y = Ysuelo(p.s) + (p.d * this.lado > 0 ? .4 : 1.1) * k, L = (v.largo || 4.4) * k, Hh = (v.tipo === 'buseta' || v.tipo === 'camion' ? 3.1 : v.tipo === 'moto' || v.tipo === 'bici' ? 1.3 : 1.5) * k, ld = Math.cos(angDif(T.at(p.s).a, v.a)) * dir >= 0 ? 1 : -1; if (x < -L || x > W + L) continue; this.carroLado(g, x, y, L, Hh, v.color, ld, noche > .4, v.tipo); }
    for (const p of E.peatones || []) { const q = this._proy(T, s0, p.x, p.y); if (!q || Math.abs(q.d) > 14) continue; const x = X(q.s), y = Ysuelo(q.s) - .2 * k; if (x < -10 || x > W + 10) continue; const A = p.aspecto || (p.aspecto = Personaje.azar(p.semilla || 1)), J = Personaje.pose('camina', p.fase, { alto: A.alto }); MC.arte.f('personajeLado')(g, J, A, x, y, k * .95, Math.cos(angDif(T.at(q.s).a, p.a)) * dir >= 0 ? 1 : -1); }
    if (op.extras) op.extras(g, { X, Y: Ysuelo, k, dir, s0, T, cx, base });
    /* 8. el jugador */
    if (E.jugador && !op.sinJugador) { const C2 = E.jugador.cuerpo, A = E.jugador.aspecto, V = C2.veh, y = Ysuelo(s0) + .5 * k - C2.z * k, esc = kj; const fn = MC.arte.f('jugadorLado'); if (!(fn && fn(g, E.jugador, cx, y, esc, dir) !== false)) { if (V.clase !== 'pie') (MC.arte.f('vehiculoLado'))(g, V, cx, y, esc, dir, C2); const J = Personaje.pose(C2.estado || 'quieto', C2.fase, { alto: A.alto, manubrio: V.manubrio }); MC.arte.f('personajeLado')(g, J, A, cx, y, esc, dir); } if (C2.z > .1) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(cx, Ysuelo(s0) + .2 * k, .9 * k, .2 * k, 0, 0, TAU); g.fill(); } E._jugPano = [cx, y]; }
    /* 9. primer plano: fachadas reales del lado de la cámara y matas (paralaje 1,3) */
    const fp = 1.3; for (const B of bloques) for (const o of B.primer) { const xa = cx + (o.a - s0) * k * fp * dir, xb = cx + (o.b - s0) * k * fp * dir, x0 = Math.min(xa, xb), ww = Math.abs(xb - xa); if (x0 > W || x0 + ww < 0) continue; const yb = Math.min(H + 4, Ysuelo(s0) + Math.max(5 * k * fp, (H - Ysuelo(s0)) * .62) + 4), hh = Math.min(H * .22, o.h * k * .3); g.fillStyle = C(mez3(mez3(hex3(o.muro), ink, .55 + noche * .3), cNear, .15)); g.fillRect(x0, yb - hh, ww + 1, hh + 30); if (noche > .3) { g.fillStyle = 'rgba(255,214,120,' + noche * .55 + ')'; for (let p = 0; p < 3; p++) if (h2(o.sem * 1e4 | 0, p, 9) < .4) g.fillRect(x0 + ww * .3, yb - hh + (p + .5) * hh / 3.5, ww * .25, hh / 9); } }
    { const fw = 9, U = s0 * k * fp, i0 = Math.floor((U - W) / (fw * k * fp)) - 2, i1 = i0 + Math.ceil(2 * W / (fw * k * fp)) + 4, yb0 = Math.min(H - 2, Ysuelo(s0) + Math.max(5 * k * fp, (H - Ysuelo(s0)) * .62));
      for (let i = i0; i <= i1; i++) { const hv = h2(i, 5, 61), x = cx + (i * fw * k * fp - U) * dir; if (x < -60 || x > W + 60) continue; const q = this._pt(T, i * fw), Z = M.estilo(q.x, q.y), sil = mez3(mez3([.12, .2, .14], cNear, .3), ink, .55 + noche * .3);
        g.fillStyle = C(sil);
        if (hv < (Z.arboles || .4) * .55) { const r = (2.2 + h2(i, 6, 61) * 2.4) * k * fp; g.fillRect(x - .15 * k, yb0 - r * 1.6, .3 * k * fp, r * 1.6); g.beginPath(); g.arc(x, yb0 - r * 1.7, r, 0, TAU); g.arc(x - r * .6, yb0 - r * 1.3, r * .7, 0, TAU); g.arc(x + r * .6, yb0 - r * 1.35, r * .75, 0, TAU); g.fill(); }
        else if (hv < .62) { const r = (.8 + h2(i, 7, 61)) * k * fp; g.beginPath(); g.arc(x, yb0 - r * .6, r, Math.PI, 0); g.fill(); }
        else if (hv < .75 && TT_URBANO.has(M.suelo(q.x, q.y))) { const L = 4.2 * k * fp, Hh = 1.4 * k * fp; g.fillRect(x - L / 2, yb0 - Hh, L, Hh * .7); g.fillRect(x - L * .28, yb0 - Hh * 1.25, L * .55, Hh * .5); g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.arc(x - L * .3, yb0 - Hh * .2, Hh * .25, 0, TAU); g.arc(x + L * .3, yb0 - Hh * .2, Hh * .25, 0, TAU); g.fill(); }
        else { g.fillRect(x - fw * k * fp / 2, yb0 - .9 * k * fp, fw * k * fp, .12 * k * fp); for (let b = 0; b < 4; b++) g.fillRect(x - fw * k * fp / 2 + b * fw * k * fp / 4, yb0 - .9 * k * fp, .1 * k * fp, .9 * k * fp); }
      } }
    /* 10. clima encima de todo */
    if (E.clima) this.clima(g, W, H, E.clima, t);
    /* etiquetas (las dos más cercanas al jugador) */
    if (E._etq) { const L = E._etq.sort((a, b) => Math.abs(a.x - cx) - Math.abs(b.x - cx)).slice(0, 3); g.font = '700 12px system-ui,sans-serif'; g.textAlign = 'center'; for (const l of L) { const w = g.measureText(l.t).width + 10; g.fillStyle = l.bg ? l.bg + 'dd' : 'rgba(10,35,66,.85)'; g.fillRect(l.x - w / 2, l.y - 15, w, 18); g.fillStyle = l.c || '#fff'; g.fillText(l.t, l.x, l.y - 2); } E._etq = null; }
    return { X, Y: Ysuelo, k, dir, cx, base };
  }
  /* (s, d) de un punto respecto al trazo cerca del jugador (rápido: mira solo ±400 m) */
  _proy(T, s0, x, y) { const q = T.at(s0); if (Math.abs(x - q.x) > 450 || Math.abs(y - q.y) > 450) return null; let bs = s0, bd = 1e18; for (let s = Math.max(0, s0 - 420); s <= Math.min(T.largo, s0 + 420); s += 12) { const p = T.at(s), d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; bs = s; } } const p = T.at(bs), ux = Math.cos(p.a), uy = Math.sin(p.a), dx = x - p.x, dy = y - p.y; return { s: bs + dx * ux + dy * uy, d: (dx * -uy + dy * ux) * this.lado }; }
  silueta(g, o, x, y, k, col, noche) {
    const h = o.h * k, w = Math.max(4, o.w * k * .5); g.fillStyle = css3(col);
    if (o.clase === 'aguja') { g.fillRect(x - w / 2, y - h * .78, w, h * .78); g.beginPath(); g.moveTo(x - w / 2, y - h * .78); g.lineTo(x, y - h); g.lineTo(x + w / 2, y - h * .78); g.fill(); }
    else if (/basilica|iglesia|catedral/.test(o.clase)) { g.fillRect(x - w / 2, y - h * .55, w, h * .55); g.fillRect(x - w * .12, y - h, w * .24, h * .45); g.beginPath(); g.moveTo(x - w * .14, y - h * .92); g.lineTo(x, y - h * 1.08); g.lineTo(x + w * .14, y - h * .92); g.fill(); }
    else if (/cupula|palacio/.test(o.clase)) { g.fillRect(x - w / 2, y - h * .7, w, h * .7); g.beginPath(); g.arc(x, y - h * .7, w * .25, Math.PI, 0); g.fill(); }
    else { g.fillRect(x - w / 2, y - h, w, h); }
    if (noche > .3) { g.fillStyle = 'rgba(255,90,80,' + (.6 + .4 * Math.sin(Date.now() / 300)) + ')'; g.fillRect(x - 1, y - h - 2, 2, 2); }
  }
  carroLado(g, x, y, L, Hh, col, dir, luz, tipo) {
    g.fillStyle = '#141414'; g.fillRect(x - L / 2 - 1, y - Hh - 1, L + 2, Hh + 1); g.fillStyle = col; g.fillRect(x - L / 2, y - Hh, L, Hh * .62);
    if (tipo === 'buseta' || tipo === 'camion') { g.fillRect(x - L / 2, y - Hh, L, Hh * .9); g.fillStyle = 'rgba(40,60,80,.85)'; for (let i = 0; i < 5; i++) g.fillRect(x - L / 2 + L * (.08 + i * .18), y - Hh * .88, L * .12, Hh * .3); }
    else if (tipo === 'moto' || tipo === 'bici') { g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(x, y - Hh * 1.05, Hh * .2, 0, TAU); g.fill(); }
    else { g.fillStyle = tono(col, .12); g.fillRect(x - L * .28, y - Hh * 1.02, L * .55, Hh * .42); g.fillStyle = luz ? '#ffe7a0' : 'rgba(140,190,220,.9)'; g.fillRect(x - L * .24 + (dir > 0 ? L * .28 : 0), y - Hh * .95, L * .22, Hh * .3); }
    g.fillStyle = '#141414'; const r = Math.max(1.5, Hh * .2); g.beginPath(); g.arc(x - L * .3, y - r * .3, r, 0, TAU); g.arc(x + L * .3, y - r * .3, r, 0, TAU); g.fill();
    if (luz) { g.fillStyle = '#fff6c0'; g.fillRect(dir > 0 ? x + L / 2 - 2 : x - L / 2, y - Hh * .45, 2, 2); g.fillStyle = 'rgba(255,240,180,.15)'; g.beginPath(); const fx = dir > 0 ? x + L / 2 : x - L / 2; g.moveTo(fx, y - Hh * .45); g.lineTo(fx + dir * L * 2, y - Hh * .9); g.lineTo(fx + dir * L * 2, y); g.fill(); }
  }
  /* lluvia, niebla y relámpagos */
  clima(g, W, H, Cl, t) {
    if (Cl.lluvia > .05) { g.strokeStyle = 'rgba(220,235,245,' + (.25 + Cl.lluvia * .3) + ')'; g.lineWidth = 1; g.beginPath(); const n = Math.round(40 + Cl.lluvia * 140), vx = Math.cos(Cl.viento.dir) * Cl.viento.v * .6; for (let i = 0; i < n; i++) { const x = ((h2(i, 3, 3) * W + t * (90 + vx * 30)) % W + W) % W, y = (h2(i, 4, 3) * H + t * 700 * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - 3 - vx, y + 13); } g.stroke(); }
    if (Cl.niebla > .3) { g.fillStyle = 'rgba(200,205,210,' + (Cl.niebla - .3) * .5 + ')'; g.fillRect(0, 0, W, H); }
    if (Cl.rayo > .05) { g.fillStyle = 'rgba(255,255,255,' + Cl.rayo * .55 + ')'; g.fillRect(0, 0, W, H); }
  }
  /* laderas con barrios (de El Metro, 23-lado.js): casas de ladrillo que trepan desde el valle con monte arriba y
     luces de noche; aquí la densidad sale de lo construido de verdad en esa dirección (capa urb*).
     Se pinta en una tira en caché y se repinta solo al salir del margen o al cambiar la luz. */
  barrios(g, W, H, s0, T, urb, par, yAt, col, sky, base, cx, k, dir, id) {
    const far = id === 'lejos' || id === 'inter', hw = Math.max(far ? 2 : 4, Math.round(k * (far ? 1.1 : 2.4) * (par / .38))), rh = Math.max(2, Math.round(hw * .72)), U0 = s0 * k * par, umin = dir > 0 ? U0 - cx : U0 + cx - W;
    const yTop = Math.floor(base - H * (far ? .44 : .3)), yBot = Math.ceil(base + H * .05), bh = yBot - yTop, nq = Math.round(sky.noche * 5), dq = Math.round(sky.dia * 5);
    const key = [this.id, W, H, par, k.toFixed(3), nq, dq, col.map(v => (v * 40) | 0).join('.')].join(':'), C0 = this._bc[id];
    let c = C0 && C0.key === key && umin >= C0.u0 && umin + W <= C0.u0 + C0.w ? C0 : null;
    if (!c) {
      const w = Math.ceil(W * 2), u0 = Math.floor(umin - W * .5), cv = (C0 && C0.cv && C0.cv.width === w && C0.cv.height === bh) ? C0.cv : lienzo(w, bh); if (!cv) return; const q = cv.getContext('2d'); q.clearRect(0, 0, w, bh);
      const vn = (x, y, sd) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a = h2(xi, yi, sd), b2 = h2(xi + 1, yi, sd), c2 = h2(xi, yi + 1, sd), d = h2(xi + 1, yi + 1, sd); return (a * (1 - sx) + b2 * sx) * (1 - sy) + (c2 * (1 - sx) + d * sx) * sy; };
      const BR = [[.7, .34, .22], [.76, .42, .27], [.62, .3, .2], [.8, .52, .34], [.7, .34, .22], [.74, .38, .25], [.93, .9, .83], [.86, .8, .62], [.55, .7, .78], [.9, .7, .72], [.62, .78, .55]], RF = [[.52, .26, .2], [.5, .5, .52], [.62, .6, .58], [.4, .22, .16]];
      const tint = far ? .66 : .3, night = sky.noche, gdk = mez3(mez3(col, [.1, .26, .12], .5 * sky.dia + .1), [0, 0, 0], night * .45), glt = mez3(gdk, [.5, .66, .36], .25 * sky.dia);
      for (let cc = Math.floor(u0 / hw) - 1; cc * hw < u0 + w + hw; cc++) {
        const u = cc * hw, sCol = s0 + (u + hw / 2 - U0) / (k * par), yr = yAt(sCol), x = u - u0;   // la tira va en coordenada u = s·k·par (espejada si dir < 0)
        const urbano = clamp(this.mf(urb, sCol) * 1.3 + .15, 0, 1);
        for (let r = 0, yy = yBot - rh; yy > yr + rh * .4; r++, yy -= rh) {
          const f = (yBot - yy) / Math.max(8, yBot - yr), hv = h2(cc, r, far ? 63 : 43), xo = ((r * 5) % 3) * hw / 3 - hw / 3, yo = (h2(cc, r, 47) - .5) * rh * .4;
          const n = vn(cc / (far ? 16 : 10), r / (far ? 9 : 6), far ? 71 : 73), hf = f < .3 ? 1 : f < .62 ? 1 - (f - .3) / .32 : 0, p = clamp((n - .32) * 2.6, 0, 1) * hf * (far ? .55 : .92) * urbano;
          const X0 = x + xo, Y0 = yy - yTop + yo;
          if (hv < p) {
            const hc = BR[(hv * 997 | 0) % BR.length], cb = mez3(mez3(hc, col, tint), [0, 0, 0], night * .6), tall = h2(cc, r, 44) < .22 ? 1 + (h2(cc, r, 48) * 2 | 0) : 0, hh = rh * (1 + tall * .7);
            if (far) { if (night > .25) { q.fillStyle = css3(cb); q.fillRect(X0, Y0 - (hh - rh), hw - 1, hh); } }
            else { q.fillStyle = css3(cb); q.fillRect(X0, Y0 - (hh - rh), hw - 1.5, hh); q.fillStyle = css3(mez3(mez3(RF[(hv * 31 | 0) % RF.length], col, tint), [0, 0, 0], night * .6)); q.fillRect(X0 - .5, Y0 - (hh - rh) - rh * .18, hw - .5, rh * .36); }
            if (night > .15 && h2(cc, r, 45) < .55) { const lv = h2(cc, r, 46); q.fillStyle = 'rgba(255,' + (190 + (lv * 60 | 0)) + ',' + (100 + (lv * 60 | 0)) + ',' + Math.min(1, night * 1.15) + ')'; const d = Math.max(1, hw * (far ? .5 : .3)); q.fillRect(X0 + hw * .3, Y0 - (hh - rh) + rh * .35, d, d); }
          } else if (!far && f > .12 && hv < p + .55 * Math.min(1, f * 2)) { const rr = hw * (.5 + h2(cc, r, 50) * .35); q.fillStyle = css3(gdk); q.beginPath(); q.arc(X0 + hw / 2, Y0 + rh * .5, rr, 0, TAU); q.fill(); if (sky.dia > .3) { q.fillStyle = css3(glt); q.beginPath(); q.arc(X0 + hw / 2 - rr * .25, Y0 + rh * .5 - rr * .3, rr * .45, 0, TAU); q.fill(); } }
        }
      }
      c = this._bc[id] = { key, u0, w, cv };
    }
    g.save(); if (dir > 0) g.drawImage(c.cv, cx - (U0 - c.u0), yTop); else { g.translate(cx + U0 - c.u0, yTop); g.scale(-1, 1); g.drawImage(c.cv, 0, 0); } g.restore();
  }
}
