/* =====================================================================
   NATURALEZA · rocas, palmas, frailejones, arbustos y juncos donde de verdad van
   Con azar fijo por celdas de 16 m y según el material, la pendiente, la altura y el agua (MC.Terreno):
   - ROCAS (de 0,4 a 3 m): en la roca y la montaña empinada, en los cauces de ríos y quebradas y en las playas
     rocosas. Las grandes no se atraviesan; las pequeñas se pasan a pie pero frenan las ruedas.
   - PALMAS en las playas y en tierra caliente baja; FRAILEJONES en el páramo (más de 3.000 m, como en los Andes);
     ARBUSTOS en el monte; JUNCOS en la orilla poco honda de lagos y ríos.
   Se dibujan en las vistas 2D con su sombra de contacto y chocan (MC.Terreno.obstaculo). Arte: gancho `naturaleza`.
   ===================================================================== */
const Naturaleza = {
  CELDA: 16,
  _celda(M, gx, gy) {
    const C = M._natura || (M._natura = new Map()), k = gx * 65536 + gy; let L = C.get(k); if (L) return L; L = [];
    const r = mulberry32((gx * 73856093) ^ (gy * 19349663) ^ 0x2545f491), S = Naturaleza.CELDA;
    for (let n = 0; n < 4; n++) {
      const x = (gx + r()) * S, y = (gy + r()) * S, u = r(), s = r(); if (!M.dentro(x, y)) continue; const tt = M.suelo(x, y);
      if (tt === TT.WATER || tt === TT.CANAL) { const ag = Terreno.aguaEn(M, x, y); if (ag && ag.prof < .45 && ag.tipo !== 'mar' && u < .35) L.push({ t: 'junco', x, y, s: .6 + s }); else if (ag && ag.tipo !== 'lago' && ag.tipo !== 'mar' && ag.prof < .9 && u < .12) L.push({ t: 'roca', x, y, s: .4 + s * .8 }); continue; }
      if (VIA_TT.has(tt) || tt === TT.BLDG || tt === TT.BRICK || M.edificioEn(x, y, 1)) continue;
      const pend = Terreno.pendiente(M, x, y), alt = M.cota(x, y);
      if (tt === TT.ROCA) { if (u < .55) L.push({ t: 'roca', x, y, s: .5 + s * 2.5 }); continue; }
      if (tt === TT.ARENA) { if (u < .1) L.push({ t: 'palma', x, y, s: .8 + s * .4 }); else if (u < .16) L.push({ t: 'roca', x, y, s: .4 + s }); continue; }
      if (alt > 3000 && (tt === TT.GRASS || tt === TT.MOUNT)) { if (u < .4) L.push({ t: 'frailejon', x, y, s: .7 + s * .8 }); else if (u < .5) L.push({ t: 'roca', x, y, s: .4 + s * 1.2 }); continue; }
      if (pend > .7 && u < .3 + (pend - .7) * .5) { L.push({ t: 'roca', x, y, s: .5 + s * (1 + pend) }); continue; }
      if (tt === TT.MOUNT && u < .14) { L.push({ t: 'arbusto', x, y, s: .7 + s * .8 }); continue; }
      if (tt === TT.GRASS && alt < 900 && u < .03) L.push({ t: 'palma', x, y, s: .9 + s * .3 });
    }
    C.set(k, L); if (C.size > 20000) C.delete(C.keys().next().value); return L;
  },
  en(M, x0, y0, x1, y1, max = 3000) { const S = Naturaleza.CELDA, out = []; for (let gy = Math.floor(y0 / S); gy <= Math.floor(y1 / S); gy++) for (let gx = Math.floor(x0 / S); gx <= Math.floor(x1 / S); gx++) { for (const p of Naturaleza._celda(M, gx, gy)) if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) { out.push(p); if (out.length >= max) return out; } } return out; },
  /* dibujo 2D: pr(x, y, h) del mundo a la pantalla, z = px por metro */
  objeto(D, p) {
    const { g, pr, z, P, noche, modo } = D, [x, y] = pr(p.x, p.y, 0), cen = modo === 'cenital', fa = MC.arte.f('naturaleza'); if (fa && fa(g, p, x, y, z, D) === true) return;
    const osc = noche > .3 ? -.35 : 0, s = p.s * z;
    if (p.t === 'roca') { Sombras.contacto(g, x + s * .15, y + s * .1, s * .62, s * .32 * (cen ? 1 : P.k + .3), .3); const hh = cen ? 0 : s * .55 * P.hk; g.fillStyle = tono('#8a857c', osc - .05); g.beginPath(); g.moveTo(x - s * .5, y); g.quadraticCurveTo(x - s * .55, y - hh - s * .25 * (cen ? 1 : P.k), x - s * .05, y - hh - s * .3 * (cen ? 1 : P.k)); g.quadraticCurveTo(x + s * .5, y - hh - s * .2 * (cen ? 1 : P.k), x + s * .5, y); g.closePath(); g.fill(); g.fillStyle = tono('#b3ada2', osc); g.beginPath(); g.ellipse(x - s * .12, y - hh - s * .18 * (cen ? 1 : P.k), s * .22, s * .1, -.3, 0, TAU); g.fill(); return; }
    if (p.t === 'palma') { const h = 6 * p.s, [, yt] = pr(p.x, p.y, h); Sombras.contacto(g, x, y, z * .6, z * .3, .2); if (!cen) { g.strokeStyle = tono('#8b6b4a', osc); g.lineWidth = Math.max(1, z * .28); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + z * .6, (y + yt) / 2, x + z * .3, yt); g.stroke(); } const cx = cen ? x : x + z * .3, cy = cen ? y : yt; g.strokeStyle = tono('#3f8f3a', osc); g.lineWidth = Math.max(1, z * .35); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, L = z * 2.4; g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + Math.cos(a) * L * .6, cy + Math.sin(a) * L * .3 - z * .4, cx + Math.cos(a) * L, cy + Math.sin(a) * L * .55 + z * .3); g.stroke(); } return; }
    if (p.t === 'frailejon') { const h = 1.4 * p.s, [, yt] = pr(p.x, p.y, h); Sombras.contacto(g, x, y, z * .4, z * .2, .2); if (!cen) { g.fillStyle = tono('#6b5a43', osc); g.fillRect(x - z * .15, yt, z * .3, y - yt); } g.fillStyle = tono('#a9b48a', osc); g.beginPath(); g.arc(x, cen ? y : yt, z * .55 * p.s, 0, TAU); g.fill(); g.fillStyle = tono('#e3c84a', osc); g.beginPath(); g.arc(x, (cen ? y : yt) - z * .2, z * .15, 0, TAU); g.fill(); return; }
    if (p.t === 'arbusto') { Sombras.contacto(g, x, y, s * .6, s * .3, .2); g.fillStyle = tono('#4f7f3a', osc); g.beginPath(); g.arc(x, y - (cen ? 0 : s * .35 * P.hk), s * .55, 0, TAU); g.fill(); return; }
    if (p.t === 'junco') { g.strokeStyle = tono('#6c8f3a', osc); g.lineWidth = Math.max(.6, z * .08); for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x + k * z * .12, y); g.lineTo(x + k * z * .2, y - z * (cen ? .4 : 1.2) * p.s); g.stroke(); } }
  }
};
MC.Naturaleza = Naturaleza;
