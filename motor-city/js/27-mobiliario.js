/* =====================================================================
   MOBILIARIO URBANO · los detalles que hacen que una calle parezca una calle (los «props» de Cities: Skylines)
   Sale de las vías reales con azar fijo (siempre lo mismo en el mismo lugar), con medidas reales:
   - postes de luz cada ~30 m, alternando de lado (8–10 m de alto; de noche, su charco de luz);
   - árboles de calle cada ~11 m donde la zona es arbolada (más en Laureles, menos en el centro);
   - bancas y canecas cerca de plazas y en las calles tranquilas; paraderos de bus en las avenidas cada ~350 m;
   - cebras (pasos peatonales) al llegar a los cruces de las calles; hidrantes cada ~120 m.
   Nada cae dentro de un edificio ni en el agua. Lo lejano no se genera ni se dibuja (detalle por distancia).
   ===================================================================== */
const PROPS = { poste: { h: 9 }, arbol: { h: 7 }, banca: { h: .8 }, caneca: { h: 1 }, paradero: { h: 2.6 }, hidrante: { h: .7 }, cebra: { h: 0 } };
const Mobiliario = {
  PROPS,
  /* lo de una vía (se calcula una vez) */
  deVia(mundo, v, i) {
    const C = mundo._propsVia || (mundo._propsVia = new Map()); let L = C.get(i); if (L) return L; L = [];
    if (v.k === VIA.SENDERO || v.k === VIA.ESCALAS) { C.set(i, L); return L; }
    const P = v.p, r = mulberry32(i * 2654435761 + 7), anc = (v.ancho || (v.k <= 2 ? 12 : 7)) / 2, ciclo = v.k === VIA.CICLO, peat = v.k === VIA.PEATONAL;
    let s = r() * 12, lado = 1, acum = 0; const largoV = []; for (let j = 0; j + 3 < P.length; j += 2) largoV.push(Math.hypot(P[j + 2] - P[j], P[j + 3] - P[j + 1]));
    const total = largoV.reduce((a, b) => a + b, 0), punto = d => { let j = 0; while (j < largoV.length - 1 && d > largoV[j]) { d -= largoV[j]; j++; } const t = largoV[j] ? clamp(d / largoV[j], 0, 1) : 0, ax = P[2 * j], ay = P[2 * j + 1], bx = P[2 * j + 2], by = P[2 * j + 3], a = Math.atan2(by - ay, bx - ax); return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, a }; };
    const poner = (t, d, ld, extra = 0) => { const q = punto(d), nx = -Math.sin(q.a), ny = Math.cos(q.a), off = anc + 1 + extra, x = q.x + nx * ld * off, y = q.y + ny * ld * off; if (!mundo.dentro(x, y) || mundo.suelo(x, y) === TT.WATER || mundo.edificioEn(x, y, .4)) return; L.push({ t, x, y, a: q.a, v: r() }); };
    const est = mundo.estilo ? mundo.estilo(P[0], P[1]) : { arboles: .5 }, arb = clamp(est.arboles ?? .5, 0, 1);
    if (!ciclo) for (let d = 6 + r() * 10; d < total - 4; d += 28 + r() * 6) { poner('poste', d, lado); lado = -lado; }
    for (let d = 4 + r() * 8; d < total - 3; d += 10 + r() * 3) for (const ld of [1, -1]) if (r() < arb * (ciclo ? .8 : .65)) poner('arbol', d + ld * 2, ld, ciclo ? 0 : .6);
    if (!ciclo) for (let d = 20 + r() * 30; d < total - 10; d += 55 + r() * 40) { if (peat || v.k === VIA.CALLE && r() < .35) { poner('banca', d, r() < .5 ? 1 : -1, .2); poner('caneca', d + 2.2, 1, .1); } }
    if (v.k === VIA.AVENIDA || v.k === VIA.CARRERA) for (let d = 60 + r() * 120; d < total - 20; d += 330 + r() * 60) poner('paradero', d, 1, .4);
    if (!ciclo) for (let d = 30 + r() * 60; d < total - 10; d += 110 + r() * 30) if (r() < .5) poner('hidrante', d, r() < .5 ? 1 : -1, -.2);
    if ((v.k === VIA.CALLE || v.k === VIA.CARRERA || v.k === VIA.AVENIDA) && total > 30) for (const [d, sg] of [[3.5, 1], [total - 3.5, -1]]) { const q = punto(d); if (L.some(o => o.t === 'cebra' && Math.hypot(o.x - q.x, o.y - q.y) < 4)) continue; L.push({ t: 'cebra', x: q.x, y: q.y, a: q.a, ancho: anc * 2, v: 0 }); }
    C.set(i, L); if (C.size > 6000) C.delete(C.keys().next().value); return L;
  },
  /* los props en una caja (solo de las vías que pasan por ahí) */
  en(mundo, x0, y0, x1, y1, max = 2000) {
    if (!mundo._rejillaVias) return []; const { G, C } = mundo._rejillaVias(), VV = mundo.vias(), vis = new Set(), out = [];
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const a = G.get(gx * 65536 + gy); if (a) for (let q = 0; q < a.length; q += 2) vis.add(a[q]); }
    for (const i of vis) { for (const p of Mobiliario.deVia(mundo, VV[i], i)) if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) { out.push(p); if (out.length >= max) return out; } }
    return out;
  },
  /* dibujo en las vistas 2D: cebras en el piso (antes de lo demás); el resto, de pie con su sombra de contacto */
  piso(D, L) {
    const { g, pr, z } = D; g.fillStyle = 'rgba(245,245,240,.82)';
    for (const p of L) { if (p.t !== 'cebra') continue; const c = Math.cos(p.a), s = Math.sin(p.a), n = Math.max(3, Math.round(p.ancho / 1.1)); for (let k = 0; k < n; k++) { const off = -p.ancho / 2 + (k + .5) * p.ancho / n, x = p.x - s * off, y = p.y + c * off, a0 = pr(x - c * 1.5 - s * .25, y - s * 1.5 + c * .25, 0), a1 = pr(x + c * 1.5 - s * .25, y + s * 1.5 + c * .25, 0), a2 = pr(x + c * 1.5 + s * .25, y + s * 1.5 - c * .25, 0), a3 = pr(x - c * 1.5 + s * .25, y - s * 1.5 - c * .25, 0); g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.lineTo(a3[0], a3[1]); g.fill(); } }
  },
  objeto(D, p, luces) {
    const { g, pr, z, P, noche, modo } = D, [x, y] = pr(p.x, p.y, 0), cen = modo === 'cenital', hk = cen ? 0 : P.hk;
    /* arte del juego (sprites de Gemini/ChatGPT): MC.arte.registrar(j, { prop(g, p, x, y, pxPorMetro, D) { … return true } }) */
    const fa = MC.arte.f('prop'); if (fa && fa(g, p, x, y, z, D) === true) { if (p.t === 'poste' && luces && noche > .3) luces.push([x, y, Math.max(14, z * 11)]); return; }
    if (p.t === 'arbol' && MC.estilo !== 'clasico') { const t = p._t || (p._t = { x: p.x, y: p.y, r: 1.6 + p.v * 1.2, h: 5 + p.v * 4, e: p.v < .22 ? 'guayacan_amarillo' : p.v < .4 ? 'guayacan_rosado' : p.v < .55 ? 'mango' : 'urapan', v: ((p.v * 7) | 0) % 3, espejo: p.v * 10 % 1 < .5 }); if (cen) Arboleda.arribaPantalla(D, t); else { Arboleda.sombra(D, t, D.sv || null); Arboleda.dePie(D, t); } return; }   // 2.6: árbol de calle con volumen
    if (p.t === 'arbol') { const h = 5 + p.v * 4, r = (1.6 + p.v * 1.2) * z, [, yc] = pr(p.x, p.y, h * .75); Sombras.contacto(g, x + r * .3, y + r * .15, r * .9, r * .45 * (cen ? 1 : P.k + .2), .22); if (!cen) { g.strokeStyle = '#5b4030'; g.lineWidth = Math.max(1, z * .25); g.beginPath(); g.moveTo(x, y); g.lineTo(x, yc); g.stroke(); } const cy = cen ? y : yc; g.fillStyle = noche > .3 ? '#21402c' : ['#3f7d3a', '#4b8b3f', '#356f37'][(p.v * 3) | 0]; g.beginPath(); g.arc(x, cy, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x - r * .3, cy - r * .3, r * .45, 0, TAU); g.fill(); return; }
    if (p.t === 'poste') { const [, yt] = pr(p.x, p.y, 8.5); if (!cen) { g.strokeStyle = '#4a4f58'; g.lineWidth = Math.max(1, z * .16); g.beginPath(); g.moveTo(x, y); g.lineTo(x, yt); g.stroke(); } g.fillStyle = noche > .3 ? '#ffe7b0' : '#cfd3d8'; g.beginPath(); g.arc(x, cen ? y : yt, Math.max(1.2, z * .35), 0, TAU); g.fill(); if (luces && noche > .3) luces.push([x, y, Math.max(14, z * 11)]); return; }
    const h = (PROPS[p.t] || { h: 1 }).h, w = Math.max(1.5, z * (p.t === 'paradero' ? 3 : p.t === 'banca' ? 1.6 : .5)), hh = Math.max(1, h * z * (cen ? .4 : hk));
    g.fillStyle = p.t === 'paradero' ? 'rgba(120,170,200,.85)' : p.t === 'banca' ? '#8d6e63' : p.t === 'hidrante' ? '#d8432f' : '#3d6b4f'; g.fillRect(x - w / 2, y - hh, w, hh);
    if (p.t === 'paradero') { g.fillStyle = '#2b3442'; g.fillRect(x - w / 2 - 1, y - hh - 2, w + 2, 2); }
  }
};
MC.Mobiliario = Mobiliario;
