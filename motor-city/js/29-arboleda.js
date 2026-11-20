/* =====================================================================
   ARBOLEDA · los árboles del mundo, de pie y con volumen (2.6)
   - Son los mismos árboles de siempre: azar fijo por celdas de 7 m según el suelo y la zona, en las mismas
     posiciones con que choca MC.Terreno. Antes eran discos pintados en el piso, y desde la maqueta, la oblicua
     o la lateral se veían como «tapetes». Ahora:
       · en las vistas inclinadas se levantan: tronco, ramas y copa con luz del sol, sombra en el piso según la hora;
       · desde arriba, la copa tiene volumen: lóbulos, lado iluminado, borde oscuro, hojas y flores.
   - Especies del trópico andino: guayacán amarillo y rosado (florecidos), ceiba (copa ancha), mango (densa y
     oscura), urapán (la común) y árbol de monte (más alto y estrecho).
   - Barato: cada especie se hornea UNA vez en lienzos (3 variantes, de lado y desde arriba; los de noche, cuando
     se necesitan). Dibujar un árbol es un drawImage.
   Uso: Arboleda.en(M, x0, y0, x1, y1, max) · Arboleda.dePie(D, t) · Arboleda.arriba(g, t) (en metros, para las losas)
   ===================================================================== */
const Arboleda = {
  CEL: 7, BLOQUE: 56, R: 56,
  ESPECIES: {
    urapan: { copa: ['#2f4a24', '#4d6a33', '#7c9450'], forma: 'redonda', alto: 1, ancho: 1 },
    guayacan_amarillo: { copa: ['#3b4f25', '#5d7334', '#8a9a52'], flor: ['#d89a12', '#f2c230', '#fde38a'], flores: .62, forma: 'redonda', alto: .95, ancho: 1.05 },
    guayacan_rosado: { copa: ['#3a4c2b', '#5b6e3e', '#86955a'], flor: ['#b8507a', '#df7ea3', '#f6c3d6'], flores: .55, forma: 'redonda', alto: .95, ancho: 1.05 },
    ceiba: { copa: ['#2c4522', '#476236', '#6f8a4a'], forma: 'ancha', alto: 1.25, ancho: 1.45 },
    mango: { copa: ['#1f3a1c', '#33502a', '#56713e'], forma: 'densa', alto: .85, ancho: 1.1 },
    monte: { copa: ['#263d22', '#3c5530', '#5f7744'], forma: 'conica', alto: 1.15, ancho: .78 }
  },
  /* la especie según el suelo y el azar fijo del árbol */
  especie(tt, s, r) { if (tt === TT.MOUNT) return s < .72 ? 'monte' : 'urapan'; return s < .1 ? 'guayacan_amarillo' : s < .18 ? 'guayacan_rosado' : s < .32 ? 'mango' : s < .42 && r > 3.4 ? 'ceiba' : 'urapan'; },
  /* los árboles de un bloque de 56 m (los mismos que las losas y Terreno.arbolLosaEn) */
  _bloque(M, bx, by) {
    const C = M._arboleda || (M._arboleda = new Map()), k = bx * 65536 + by; let L = C.get(k); if (L) return L; L = [];
    const cel = this.CEL, B = this.BLOQUE;
    for (let y = by * B; y < (by + 1) * B; y += cel) for (let x = bx * B; x < (bx + 1) * B; x += cel) {
      const tt = M.suelo(x, y); if (tt !== TT.GRASS && tt !== TT.MOUNT && tt !== TT.PLAZA) continue; const Z = M.estilo(x, y), dens = tt === TT.MOUNT ? .55 : tt === TT.PLAZA ? .18 : (Z.arboles || .4) * .55; if (h2(x, y, 41) > dens) continue;
      const tx = x + h2(x, y, 42) * cel, ty = y + h2(x, y, 43) * cel, r = 2.2 + h2(x, y, 44) * 2.6, s = h2(x, y, 45), e = this.especie(tt, s, r), E = this.ESPECIES[e];
      L.push({ x: tx, y: ty, r, s, e, h: r * (2.05 + h2(x, y, 46) * .5) * E.alto, v: (h2(x, y, 47) * 3) | 0, espejo: h2(x, y, 48) < .5 });
    }
    C.set(k, L); if (C.size > 6000) C.delete(C.keys().next().value); return L;
  },
  en(M, x0, y0, x1, y1, max = 2000) { const B = this.BLOQUE, out = []; for (let by = Math.floor(y0 / B); by <= Math.floor(y1 / B); by++) for (let bx = Math.floor(x0 / B); bx <= Math.floor(x1 / B); bx++) for (const t of this._bloque(M, bx, by)) if (t.x >= x0 && t.x <= x1 && t.y >= y0 && t.y <= y1) { out.push(t); if (out.length >= max) return out; } return out; },
  /* ---------- horneado: un lienzo por especie, variante y vista ---------- */
  _sp: new Map(),
  sprite(e, v, vista, noche) {
    const k = e + v + vista + (noche ? 'n' : '') + MC.estilo; let c = this._sp.get(k); if (c !== undefined) return c;   // 2.7: un horneado por estilo
    if (noche) { const d = this.sprite(e, v, vista, false); c = d ? lienzo(d.width, d.height) : null; if (c) { const g = c.getContext('2d'); g.drawImage(d, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(10,18,44,.6)'; g.fillRect(0, 0, c.width, c.height); c._base = d._base; c._rx = d._rx; c._alto = d._alto; } }
    else c = vista === 'lado' ? this._hornearLado(e, v) : this._hornearArriba(e, v);
    this._sp.set(k, c); return c;
  },
  /* la copa: lóbulos en tres pasadas (silueta oscura, cuerpo y luz desde arriba a la izquierda), hojas y flores encima */
  _copa(g, E, rnd, cx, cy, rx, ry, R, arriba, modo = 'real') {
    const N = arriba ? 16 : 20, L = [];
    for (let i = 0; i < N; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * .78; let px = cx + Math.cos(a) * d * rx, py = cy + Math.sin(a) * d * ry; if (!arriba && E.forma === 'conica') px = cx + (px - cx) * (.55 + .45 * clamp((py - (cy - ry)) / (2 * ry), 0, 1)); L.push([px, py, R * (.26 + rnd() * .2) * (E.forma === 'densa' ? 1.12 : 1)]); }
    if (!arriba) L.sort((p, q) => q[1] - p[1]);   // de atrás (abajo) hacia delante (arriba)
    if (modo !== 'real') return this._copaEstilo(g, E, rnd, L, cx, cy, rx, ry, R, modo);
    const [c0, c1, c2] = E.copa;
    g.fillStyle = tono(c0, -.12); for (const [x, y, r] of L) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillStyle = c1; for (const [x, y, r] of L) { g.beginPath(); g.arc(x - r * .12, y - r * .16, r * .84, 0, TAU); g.fill(); }
    for (const [x, y, r] of L) { const luz = clamp(((cx - x) / rx + (cy - y) / ry) * .5 + .45, 0, 1); if (luz < .3) continue; g.globalAlpha = .35 + luz * .5; g.fillStyle = c2; g.beginPath(); g.arc(x - r * .3, y - r * .34, r * .46, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    /* textura de hojas y sombra interior (solo dentro de la copa) */
    g.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < (arriba ? 260 : 320); i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()), x = cx + Math.cos(a) * d * rx * 1.05, y = cy + Math.sin(a) * d * ry * 1.05, r = R * (.03 + rnd() * .035); g.fillStyle = rnd() < .55 ? 'rgba(12,26,10,.32)' : 'rgba(200,220,150,.22)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    if (E.flor) for (let i = 0; i < 420 * E.flores; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()), x = cx + Math.cos(a) * d * rx, y = cy + Math.sin(a) * d * ry, lado = clamp(((cx - x) / rx + (cy - y) / ry) * .5 + .5, 0, 1), r = R * (.035 + rnd() * .04); g.fillStyle = E.flor[lado > .62 ? 2 : lado > .3 ? 1 : 0]; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    const gr = arriba ? g.createRadialGradient(cx - rx * .25, cy - ry * .25, R * .1, cx, cy, Math.max(rx, ry) * 1.05) : g.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
    gr.addColorStop(0, 'rgba(255,250,220,.10)'); gr.addColorStop(.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(6,14,8,.42)'); g.fillStyle = gr; g.fillRect(cx - rx * 1.4, cy - ry * 1.4, rx * 2.8, ry * 2.8);
    g.globalCompositeOperation = 'source-over';
  },
  /* 2.7: la copa en los estilos dibujados (cel, tono de manga, silueta noir, acuarela), con su tinta */
  _copaEstilo(g, E, rnd, L, cx, cy, rx, ry, R, modo) {
    const ES = Estilo.p, C = x => Estilo.col(x), luzDe = (x, y) => clamp(((cx - x) / rx + (cy - y) / ry) * .5 + .45, 0, 1), tw = ES.tinta ? R * .028 * ES.tinta : 0, bola = (x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(.5, r), 0, TAU); g.fill(); };
    if (modo === 'silueta') { g.fillStyle = '#0c0b0a'; for (const [x, y, r] of L) bola(x, y, r); g.strokeStyle = 'rgba(236,229,211,.9)'; g.lineWidth = R * .035; for (const [x, y, r] of L) if (luzDe(x, y) > .62) { g.beginPath(); g.arc(x, y, r * .9, 3.3, 4.7); g.stroke(); } return; }   // el negro del noir con el filo de luz
    const [c0, c1, c2] = E.copa.map(C);
    if (modo === 'acuarela') { g.globalAlpha = .5; for (const [x, y, r] of L) { g.fillStyle = rnd() < .5 ? c1 : c2; bola(x + (rnd() - .5) * r * .2, y + (rnd() - .5) * r * .2, r * .95); } g.globalAlpha = .35; g.strokeStyle = c0; g.lineWidth = R * .04; for (const [x, y, r] of L) { g.beginPath(); g.arc(x, y, r * .93, 0, TAU); g.stroke(); } g.globalAlpha = .4; if (E.flor) { g.fillStyle = C(E.flor[1]); for (let i = 0; i < 40 * E.flores; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * .8; bola(cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, R * (.06 + rnd() * .06)); } } g.globalAlpha = 1; return; }   // pigmento que se junta en el borde
    if (tw) { g.fillStyle = ES.tintaColor; for (const [x, y, r] of L) bola(x, y, r + tw); }   // la tinta: la silueta un poco más grande, por debajo
    g.fillStyle = c0; for (const [x, y, r] of L) bola(x, y, r);
    g.fillStyle = c1; for (const [x, y, r] of L) if (luzDe(x, y) > .22) bola(x - r * .12, y - r * .16, r * .8);
    g.fillStyle = c2; for (const [x, y, r] of L) if (luzDe(x, y) > .55) bola(x - r * .28, y - r * .3, r * .44);
    if (E.flor) { const f = E.flor.map(C); for (let i = 0; i < 90 * E.flores; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * .85, x = cx + Math.cos(a) * d * rx, y = cy + Math.sin(a) * d * ry; g.fillStyle = f[luzDe(x, y) > .6 ? 2 : 1]; bola(x, y, R * (.05 + rnd() * .03)); } }   // flores en manchas planas
    if (modo === 'tono') { const fu = Estilo.fuente('tono'); if (fu) { const p = g.createPattern(fu, 'repeat'); g.save(); g.globalCompositeOperation = 'source-atop'; g.beginPath(); g.moveTo(cx + rx * 1.6, cy - ry * 1.6); g.lineTo(cx + rx * 1.6, cy + ry * 1.6); g.lineTo(cx - rx * 1.6, cy + ry * 1.6); g.closePath(); g.clip(); g.fillStyle = p; g.fillRect(cx - rx * 1.6, cy - ry * 1.6, rx * 3.2, ry * 3.2); g.restore(); } }   // tramado en el lado de la sombra
  },
  _hornearLado(e, v) {
    const E = this.ESPECIES[e], R = this.R, rx = R * E.ancho, ry = R * (E.forma === 'ancha' ? .62 : E.forma === 'conica' ? 1.05 : .86), alto = R * 2.3 * E.alto, W = Math.ceil(rx * 2 + R * .5), H = Math.ceil(alto + R * .25);
    const c = lienzo(W, H); if (!c) return null; const g = c.getContext('2d'), rnd = mulberry32(e.length * 977 + v * 131 + 7), cx = W / 2, base = H - 2, cy = Math.max(ry + 2, base - alto + ry);
    /* tronco que se afina, con su lado en sombra, y ramas que entran a la copa */
    const modo = MC.estilo === 'realista' ? 'real' : (Estilo.p.arbol || 'cel'), tb = R * (E.forma === 'ancha' ? .2 : .13), tt = tb * .55, bark = modo === 'silueta' ? '#0c0b0a' : Estilo.col(E.forma === 'ancha' ? '#7a7466' : '#5a4433');
    g.fillStyle = tono(bark, -.25); g.beginPath(); g.moveTo(cx - tb, base); g.quadraticCurveTo(cx - tb * .4, (base + cy) / 2, cx - tt, cy + ry * .2); g.lineTo(cx + tt, cy + ry * .2); g.quadraticCurveTo(cx + tb * .4, (base + cy) / 2, cx + tb, base); g.closePath(); g.fill();
    g.fillStyle = bark; g.beginPath(); g.moveTo(cx - tb, base); g.quadraticCurveTo(cx - tb * .4, (base + cy) / 2, cx - tt, cy + ry * .2); g.lineTo(cx - tt * .1, cy + ry * .2); g.quadraticCurveTo(cx - tb * .05, (base + cy) / 2, cx - tb * .1, base); g.closePath(); g.fill();
    g.strokeStyle = tono(bark, -.15); g.lineCap = 'round'; for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, y0 = cy + ry * (.3 - i * .12); g.lineWidth = tt * (.9 - i * .15); g.beginPath(); g.moveTo(cx, y0 + ry * .25); g.quadraticCurveTo(cx + s * rx * .25, y0, cx + s * rx * (.45 + rnd() * .2), y0 - ry * (.15 + rnd() * .2)); g.stroke(); }
    if (E.forma === 'ancha') { g.fillStyle = tono(bark, -.3); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * tb * .6, base); g.lineTo(cx + s * tb * 2.1, base); g.lineTo(cx + s * tb * .5, base - R * .35); g.closePath(); g.fill(); } }   // las raíces tablares de la ceiba
    /* la copa en su capa, para que hojas y sombras queden adentro */
    if (modo !== 'real' && Estilo.p.tinta) { g.save(); g.globalCompositeOperation = 'destination-over'; g.strokeStyle = Estilo.p.tintaColor; g.lineWidth = R * .05 * Estilo.p.tinta; g.beginPath(); g.moveTo(cx - tb, base); g.lineTo(cx - tt, cy + ry * .2); g.moveTo(cx + tb, base); g.lineTo(cx + tt, cy + ry * .2); g.moveTo(cx - tb * 1.2, base); g.lineTo(cx + tb * 1.2, base); g.stroke(); g.restore(); }   // el contorno del tronco
    const cc = lienzo(W, H), gc = cc.getContext('2d'); this._copa(gc, E, rnd, cx, cy, rx, ry, R, false, modo); g.drawImage(cc, 0, 0);
    c._base = [cx, base]; c._rx = rx; c._alto = base - (cy - ry); return c;
  },
  _hornearArriba(e, v) {
    const E = this.ESPECIES[e], R = this.R, rx = R * E.ancho * .98, S = Math.ceil(rx * 2 + R * .3), c = lienzo(S, S); if (!c) return null;
    const g = c.getContext('2d'), rnd = mulberry32(e.length * 613 + v * 97 + 3); this._copa(g, E, rnd, S / 2, S / 2, rx, rx, R, true, MC.estilo === 'realista' ? 'real' : (Estilo.p.arbol || 'cel')); c._rx = rx; return c;
  },
  /* hornea todo en ratos libres al arrancar (un lienzo cada 40 ms), para que la primera vez que se vean no cueste */
  precalentar() { if (this._pre || typeof setTimeout === 'undefined' || typeof document === 'undefined') return; this._pre = true; const L = []; for (const e of Object.keys(this.ESPECIES)) for (let v = 0; v < 3; v++) L.push([e, v, 'lado'], [e, v, 'arriba']);
    const paso = () => { const q = L.shift(); if (!q) return; const sp = this.sprite(q[0], q[1], q[2], false); if (sp && q[2] === 'lado') { this.mip(sp, .4); this.mip(sp, .1); } setTimeout(paso, 40); }; setTimeout(paso, 300); },
  /* ---------- dibujo ---------- */
  /* desde arriba, en metros del mundo (para hornear en las losas): sombra suave al sureste y la copa */
  arriba(g, t, sombra = true) {
    const fa = MC.arte.f('arbol'); if (fa && fa(g, t, 'arriba', t.x, t.y, 1, null) === true) return;   // gancho de arte: arbol(g, t, vista, x, y, pxPorMetro, D) → true si lo dibujó
    const E = this.ESPECIES[t.e] || this.ESPECIES.urapan, rM = t.r * E.ancho, sp = this.sprite(t.e, t.v, 'arriba', false); if (!sp) return;
    if (sombra) { g.fillStyle = 'rgba(8,14,10,.3)'; g.beginPath(); g.ellipse(t.x + rM * .45, t.y + rM * .5, rM * 1.02, rM * .95, .6, 0, TAU); g.fill(); }
    const k = rM / sp._rx; g.drawImage(sp, t.x - sp.width / 2 * k, t.y - sp.height / 2 * k, sp.width * k, sp.height * k);
  },
  /* todas las sombras de una vez (un solo trazo: el sol es el mismo para todos), antes de los objetos */
  sombras(D, L, sv) {
    const { g, pr, z, P } = D; if (!L.length) return; const k = Math.max(.25, P.k * 1.2), Lf = sv ? Math.min(2.2, sv.L * .55) : 0;
    let ang = 0; if (sv) { const [ax, ay] = pr(0, 0, 0), [bx, by] = pr(sv.dx, sv.dy, 0); ang = Math.atan2(by - ay, bx - ax); }
    g.fillStyle = 'rgba(8,14,30,' + (sv ? (.11 + .15 * sv.fuerza) : .12).toFixed(3) + ')'; g.beginPath();
    for (const t of L) { const E = this.ESPECIES[t.e] || this.ESPECIES.urapan, rM = t.r * E.ancho, rx = z * rM * (1 + Lf * .35), ry = z * rM * .9 * k; if (rx < 1.5) continue; const [sx, sy] = sv ? pr(t.x + sv.dx / sv.L * t.h * Lf * .55, t.y + sv.dy / sv.L * t.h * Lf * .55, 0) : pr(t.x + rM * .2, t.y + rM * .1, 0); g.moveTo(sx + rx * Math.cos(ang), sy + rx * Math.sin(ang)); g.ellipse(sx, sy, rx, ry, ang, 0, TAU); }
    g.fill(); g.fillStyle = 'rgba(10,14,26,.32)'; g.beginPath();
    for (const t of L) { const [x, y] = pr(t.x, t.y, 0), rx = Math.max(1, z * t.r * .18), ry = Math.max(.6, z * t.r * .09 * (P.k + .2)); g.moveTo(x + rx, y); g.ellipse(x, y, rx, ry, 0, 0, TAU); }
    g.fill();
  },
  /* la sombra de un solo árbol (árboles de calle) */
  sombra(D, t, sv) {
    const { g, pr, z, P } = D, E = this.ESPECIES[t.e] || this.ESPECIES.urapan, rM = t.r * E.ancho, [x, y] = pr(t.x, t.y, 0);
    Sombras.contacto(g, x, y, Math.max(1, z * t.r * .18), Math.max(.6, z * t.r * .09 * (P.k + .2)), .35);
    if (!sv) { Sombras.contacto(g, x + z * rM * .2, y + z * rM * .1 * P.k, z * rM * .9, z * rM * .9 * P.k, .16); return; }
    const L = Math.min(2.2, sv.L * .55), [sx, sy] = pr(t.x + sv.dx / sv.L * t.h * L * .55, t.y + sv.dy / sv.L * t.h * L * .55, 0), [ex, ey] = pr(t.x + sv.dx, t.y + sv.dy, 0), ang = Math.atan2(ey - y, ex - x);
    g.save(); g.fillStyle = 'rgba(8,14,30,' + (.16 + .18 * sv.fuerza).toFixed(3) + ')'; g.translate(sx, sy); g.rotate(ang); g.scale(1, Math.max(.25, P.k * 1.2)); g.beginPath(); g.ellipse(0, 0, z * rM * (1 + L * .35), z * rM * .9, 0, 0, TAU); g.fill(); g.restore();
  },
  /* de pie (maqueta, oblicua, lateral): el sprite de lado a la medida del árbol */
  mip(sp, k) { if (k >= .55 || !sp) return sp; const n = k >= .28 ? 1 : 2, M = sp._mip || (sp._mip = []); if (!M[n]) { const f = n === 1 ? .5 : .25, c = lienzo(Math.max(1, sp.width * f), Math.max(1, sp.height * f)); if (!c) return sp; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(sp, 0, 0, c.width, c.height); c._base = [sp._base[0] * f, sp._base[1] * f]; c._rx = sp._rx * f; c._alto = sp._alto * f; M[n] = c; } return M[n]; },
  dePie(D, t) {
    const { g, pr, z, P, noche } = D, fa = MC.arte.f('arbol'); if (fa) { const [ax, ay] = pr(t.x, t.y, 0); if (fa(g, t, 'lado', ax, ay, z, D) === true) return; } let sp = this.sprite(t.e, t.v, 'lado', noche > .4); if (!sp) return; const E = this.ESPECIES[t.e] || this.ESPECIES.urapan, [x, y] = pr(t.x, t.y, 0);
    sp = this.mip(sp, (t.r * E.ancho * z) / sp._rx); const kx = (t.r * E.ancho * z) / sp._rx, ky = (t.h * z * P.hk) / sp._alto, w = sp.width * kx, h = sp.height * ky; if (h < 3) return;
    const vi = z >= 5 ? Math.sin((D.E.t || 0) * 1.3 + t.x * .21 + t.y * .13) * .045 * (D.E.viento ?? .6) : 0;   /* 2.7 · vida: el viento mece la copa (de cerca); el pie no se mueve */
    if (t.espejo || vi) { g.save(); g.translate(x, y); if (vi) g.transform(1, 0, -vi, 1, 0, 0); if (t.espejo) g.scale(-1, 1); g.drawImage(sp, -w / 2, -sp._base[1] * ky, w, h); g.restore(); } else g.drawImage(sp, x - w / 2, y - sp._base[1] * ky, w, h);
  },
  /* desde arriba, en pantalla (árboles de calle en la cenital) */
  arribaPantalla(D, t) { const { g, pr, z, noche } = D, fa = MC.arte.f('arbol'); if (fa) { const [ax, ay] = pr(t.x, t.y, 0); if (fa(g, t, 'arriba', ax, ay, z, D) === true) return; } const sp = this.sprite(t.e, t.v, 'arriba', noche > .4); if (!sp) return; const E = this.ESPECIES[t.e] || this.ESPECIES.urapan, [x, y] = pr(t.x, t.y, 0), k = t.r * E.ancho * z / sp._rx; Sombras.contacto(g, x + t.r * z * .35, y + t.r * z * .4, t.r * z, t.r * z * .92, .26); g.drawImage(sp, x - sp.width / 2 * k, y - sp.height / 2 * k, sp.width * k, sp.height * k); }
};
MC.Arboleda = Arboleda;
