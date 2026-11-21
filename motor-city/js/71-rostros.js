/* =====================================================================
   ROSTROS (4.5) · retratos detallados hechos a mano en Canvas 2D, sin imágenes ni librerías
   Cada personaje se describe con unos pocos rasgos y el motor dibuja su cara con volumen:
   - piel con luz desde arriba a la izquierda (degradados), sombra bajo la mandíbula, mejillas y orejas con su pliegue;
   - ojos con esclerótica, iris en degradado, pupila, brillo, párpado superior con pestañas y párpado inferior;
   - cejas con trazos de pelo, nariz con puente, aletas y fosas, labios con su comisura y brillo, surco nasolabial;
   - edad (arrugas en la frente, patas de gallo, canas), barba (sombra, bigote, candado o completa), cicatriz, lunar,
     gafas, arete, audífono, gorra o sombrero; peinados: corto, largo, moño, cola, rapado, rizado, calvo, canoso;
   - expresiones: neutral, sonrisa, seria, preocupada, enojada; parpadeo con t.
   Uso: MC.Rostro.dibujar(g, rasgos, x, y, tam, { expresion, t })  ·  MC.Rostro.url(rasgos, 128) → dataURL (con caché)
        MC.Rostro.azar(semilla) → rasgos de una persona cualquiera (guardias, transeúntes)
   ===================================================================== */
const ROSTRO_PIELES = ['#f1d3bd', '#e8bd98', '#d9a47c', '#c68a5e', '#a96f45', '#8a5634', '#6b3f24', '#4e2c18'];
const ROSTRO_PELOS = ['#16110d', '#2b1d14', '#4a3020', '#6e4a2c', '#9a6b3c', '#c4924f', '#d9b77a', '#8a8580', '#c9c5bf'];
const Rostro = {
  _cache: new Map(),
  azar(semilla = 1) {
    const r = mulberry32((semilla * 2654435761) >>> 0), el = L => L[(r() * L.length) | 0], fem = r() < .45;
    return { piel: el(ROSTRO_PIELES), pelo: el(ROSTRO_PELOS.slice(0, 7)), ojos: el(['#3b2414', '#4a2f1a', '#2c5d3f', '#3d5f86', '#6b4a2b']), peinado: fem ? el(['largo', 'moño', 'cola', 'rizado', 'corto']) : el(['corto', 'rapado', 'rizado', 'calvo', 'corto']),
      barba: fem ? 'ninguna' : el(['ninguna', 'sombra', 'bigote', 'candado', 'completa', 'ninguna']), edad: r() * .8, nariz: el(['recta', 'ancha', 'aguilena']), ropa: el(['#2b343d', '#475563', '#6b2f2a', '#2f5d45', '#1d2833', '#7a6a55']), fem,
      labios: fem ? el(['#b5645a', '#9a4a48', '#c27a6a']) : null, acc: r() < .2 ? ['gafas'] : r() < .15 ? ['arete'] : [] };
  },
  url(R, tam = 128, op = {}) {
    const k = JSON.stringify(R) + tam + (op.expresion || ''); let u = this._cache.get(k); if (u) return u;
    if (typeof document === 'undefined') return ''; const cv = document.createElement('canvas'); cv.width = tam; cv.height = tam; this.dibujar(cv.getContext('2d'), R, 0, 0, tam, op);
    u = cv.toDataURL('image/png'); this._cache.set(k, u); if (this._cache.size > 80) this._cache.delete(this._cache.keys().next().value); return u;
  },
  /* dibuja el retrato en un cuadrado de lado tam con esquina en (x, y) */
  dibujar(g, R, x, y, tam, op = {}) {
    const ex = op.expresion || R.expresion || 'neutral', t = op.t || 0, parpadeo = op.t != null && (t % 4.2) < .12;
    const piel = hex3(R.piel || ROSTRO_PIELES[3]), pelo = R.pelo || ROSTRO_PELOS[1], css = (c, k = 0) => css3(k >= 0 ? mez3(c, [1, 1, 1], k) : mez3(c, [0, 0, 0], -k)), sombra = css(piel, -.22), luz = css(piel, .16), med = css(piel, 0);
    const edad = R.edad || 0, canas = edad > .65 || R.peinado === 'canoso';
    g.save(); g.translate(x, y); g.scale(tam / 100, tam / 100);
    /* fondo: un círculo suave del color del personaje */
    const fg = g.createRadialGradient(50, 40, 10, 50, 50, 70); fg.addColorStop(0, R.fondo || '#3a4450'); fg.addColorStop(1, '#14181d'); g.fillStyle = fg; g.fillRect(0, 0, 100, 100);
    /* pelo de atrás (largo, cola, moño, rizado) */
    const colPelo = canas ? css(hex3('#bdb8b0'), 0) : pelo, peloOsc = css(hex3(canas ? '#9a958e' : pelo), -.25);
    if (R.peinado === 'largo') { g.fillStyle = peloOsc; g.beginPath(); g.moveTo(26, 40); g.quadraticCurveTo(20, 80, 30, 96); g.lineTo(70, 96); g.quadraticCurveTo(80, 80, 74, 40); g.closePath(); g.fill(); }
    if (R.peinado === 'rizado') { g.fillStyle = peloOsc; for (let i = 0; i < 16; i++) { const a = Math.PI * (1.05 + i / 15 * .9), rr = 27 + (i % 3) * 2; g.beginPath(); g.arc(50 + Math.cos(a) * rr * 1.05, 44 + Math.sin(a) * rr, 7.5, 0, TAU); g.fill(); } }
    /* cuello y hombros con la ropa */
    g.fillStyle = sombra; g.beginPath(); g.moveTo(40, 66); g.lineTo(60, 66); g.lineTo(62, 84); g.lineTo(38, 84); g.closePath(); g.fill();
    const ropa = hex3(R.ropa || '#2b343d'); const rg = g.createLinearGradient(0, 78, 0, 100); rg.addColorStop(0, css(ropa, .12)); rg.addColorStop(1, css(ropa, -.25)); g.fillStyle = rg;
    g.beginPath(); g.moveTo(8, 100); g.quadraticCurveTo(12, 82, 36, 78); g.lineTo(50, 90); g.lineTo(64, 78); g.quadraticCurveTo(88, 82, 92, 100); g.closePath(); g.fill();
    g.strokeStyle = css(ropa, -.4); g.lineWidth = 1.2; g.beginPath(); g.moveTo(36, 78); g.lineTo(46, 100); g.moveTo(64, 78); g.lineTo(54, 100); g.stroke();   /* solapas */
    if (R.cuello !== 'chaqueta') { g.fillStyle = R.camisa || '#d8d2c4'; g.beginPath(); g.moveTo(40, 78); g.lineTo(50, 92); g.lineTo(60, 78); g.lineTo(55, 76); g.lineTo(50, 84); g.lineTo(45, 76); g.closePath(); g.fill(); }
    /* orejas */
    for (const s of [-1, 1]) { const ox = 50 + s * 25; g.fillStyle = med; g.beginPath(); g.ellipse(ox, 47, 4.2, 7, s * .15, 0, TAU); g.fill(); g.strokeStyle = sombra; g.lineWidth = 1; g.beginPath(); g.arc(ox + s * .6, 47, 2.6, s > 0 ? -1.2 : 1.9, s > 0 ? 1.2 : 4.3); g.stroke(); }
    if (R.acc && R.acc.includes('arete')) { g.fillStyle = '#e8c56a'; g.beginPath(); g.arc(25.5, 54.5, 1.4, 0, TAU); g.arc(74.5, 54.5, 1.4, 0, TAU); g.fill(); }
    if (R.acc && R.acc.includes('audifono')) { g.fillStyle = '#1b1f24'; g.beginPath(); g.ellipse(76, 47, 2.6, 3.6, 0, 0, TAU); g.fill(); g.fillStyle = '#4b9aab'; g.fillRect(75.4, 45.8, 1.3, 1.3); }
    /* la cabeza: óvalo con mandíbula, luz arriba a la izquierda */
    const anch = R.fem ? 23 : 24.5, cg = g.createRadialGradient(42, 36, 4, 50, 48, 34); cg.addColorStop(0, luz); cg.addColorStop(.55, med); cg.addColorStop(1, sombra); g.fillStyle = cg;
    g.beginPath(); g.moveTo(50, 18); g.bezierCurveTo(50 + anch * 1.15, 18, 50 + anch, 42, 50 + anch * .92, 52); g.bezierCurveTo(50 + anch * .8, 63, 58, 72, 50, 72); g.bezierCurveTo(42, 72, 50 - anch * .8, 63, 50 - anch * .92, 52); g.bezierCurveTo(50 - anch, 42, 50 - anch * 1.15, 18, 50, 18); g.closePath(); g.fill();
    /* sombra de la mandíbula sobre el cuello y mejillas */
    g.fillStyle = 'rgba(80,40,30,.10)'; g.beginPath(); g.ellipse(35, 57, 6, 4, -.3, 0, TAU); g.ellipse(65, 57, 6, 4, .3, 0, TAU); g.fill();
    if (R.fem || ex === 'sonrisa') { g.fillStyle = 'rgba(210,90,80,.13)'; g.beginPath(); g.ellipse(36, 56, 5, 3, 0, 0, TAU); g.ellipse(64, 56, 5, 3, 0, 0, TAU); g.fill(); }
    /* barba (debajo de los labios) */
    const barba = R.barba || 'ninguna', cb = css(hex3(canas ? '#a8a39b' : pelo), 0);
    if (barba === 'sombra' || barba === 'completa' || barba === 'candado') { const a = barba === 'sombra' ? .22 : .85; g.fillStyle = cb; g.globalAlpha = a;
      g.beginPath(); if (barba === 'candado') { g.ellipse(50, 66, 7, 6, 0, 0, TAU); } else { g.moveTo(28, 54); g.bezierCurveTo(30, 66, 40, 73, 50, 73); g.bezierCurveTo(60, 73, 70, 66, 72, 54); g.bezierCurveTo(66, 60, 60, 61, 50, 61); g.bezierCurveTo(40, 61, 34, 60, 28, 54); } g.fill(); g.globalAlpha = 1;
      if (barba !== 'sombra') { g.strokeStyle = css(hex3(cb), -.3); g.lineWidth = .5; for (let i = 0; i < 26; i++) { const px = 34 + (i * 37 % 32), py = 60 + (i * 13 % 11); g.beginPath(); g.moveTo(px, py); g.lineTo(px + .5, py + 1.6); g.stroke(); } } }
    /* ojos */
    const ojo = hex3(R.ojos || '#3b2414'), oy = 44, abierto = parpadeo ? .1 : ex === 'enojada' ? .75 : ex === 'preocupada' ? 1.05 : 1;
    for (const s of [-1, 1]) { const ox = 50 + s * 10;
      g.fillStyle = 'rgba(70,40,30,.18)'; g.beginPath(); g.ellipse(ox, oy - 1, 6.8, 4.2, 0, Math.PI, 0); g.fill();   /* cuenca */
      g.save(); g.beginPath(); g.moveTo(ox - 5.6, oy); g.quadraticCurveTo(ox, oy - 4.4 * abierto, ox + 5.6, oy); g.quadraticCurveTo(ox, oy + 3 * abierto, ox - 5.6, oy); g.closePath(); g.fillStyle = '#f4efe8'; g.fill(); g.clip();
      if (!parpadeo) { const ig = g.createRadialGradient(ox - .6, oy - .6, .3, ox, oy, 3.2); ig.addColorStop(0, css(ojo, .35)); ig.addColorStop(.7, css(ojo, 0)); ig.addColorStop(1, css(ojo, -.45)); g.fillStyle = ig; g.beginPath(); g.arc(ox, oy, 3.1, 0, TAU); g.fill(); g.fillStyle = '#0b0807'; g.beginPath(); g.arc(ox, oy, 1.35, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(ox - 1, oy - 1.1, .7, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(80,50,40,.25)'; g.fillRect(ox - 6, oy - 4.6 * abierto, 12, 1.4); g.restore();   /* sombra del párpado sobre el ojo */
      g.strokeStyle = '#1d140f'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(ox - 5.8, oy + .2); g.quadraticCurveTo(ox, oy - 4.6 * abierto, ox + 5.8, oy + .2); g.stroke();   /* párpado y pestañas */
      if (R.fem) { g.lineWidth = .7; for (const q of [-4, -2, 2.2, 4.3]) { g.beginPath(); g.moveTo(ox + q * s, oy - 3.2 * abierto); g.lineTo(ox + q * s * 1.2, oy - 4.6 * abierto); g.stroke(); } }
      g.strokeStyle = 'rgba(90,55,40,.45)'; g.lineWidth = .6; g.beginPath(); g.moveTo(ox - 4.6, oy + 1.8); g.quadraticCurveTo(ox, oy + 3.4, ox + 4.6, oy + 1.6); g.stroke();   /* párpado inferior */
      if (edad > .45) { g.strokeStyle = 'rgba(90,55,40,.35)'; g.lineWidth = .5; for (const k of [-1.6, 0, 1.6]) { g.beginPath(); g.moveTo(ox + s * 6.5, oy + k * .8); g.lineTo(ox + s * 9, oy + k * 1.5); g.stroke(); } }
      /* cejas: trazos de pelo con la expresión */
      const cy = oy - 7.5 - (ex === 'preocupada' ? 1 : 0), inc = ex === 'enojada' ? 2.4 * s : ex === 'preocupada' ? -1.8 * s : 0, gros = R.fem ? 1 : 1.7;
      g.strokeStyle = css(hex3(canas ? '#9a958e' : pelo), -.1); g.lineWidth = .75; for (let i = 0; i < 11; i++) { const u = i / 10, px = ox - 6 * s * (u - .5) * -2 * .5 + (u - .5) * 12 * s * 0, bx = ox + (u - .5) * 12, by = cy - Math.sin(u * Math.PI) * 1.6 + (s > 0 ? -inc * (1 - u) : inc * u) * .5; g.beginPath(); g.moveTo(bx - .9, by + gros * .6); g.lineTo(bx + .9, by - gros * .6); g.stroke(); }
    }
    /* nariz: puente, aletas y fosas */
    const nz = R.nariz || 'recta', na = nz === 'ancha' ? 6.2 : 4.6; g.strokeStyle = 'rgba(90,50,35,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(47.5, 45); g.quadraticCurveTo(nz === 'aguilena' ? 45 : 46.5, 52, 46.5, 56); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(50.6, 52, 1.2, 4, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(90,50,35,.25)'; g.beginPath(); g.ellipse(50, 58, na, 2.4, 0, 0, Math.PI); g.fill(); g.fillStyle = 'rgba(40,20,15,.55)'; g.beginPath(); g.ellipse(50 - na * .45, 58.3, 1.3, .8, .3, 0, TAU); g.ellipse(50 + na * .45, 58.3, 1.3, .8, -.3, 0, TAU); g.fill();
    /* surco nasolabial (más marcado con la edad o al sonreír) */
    g.strokeStyle = 'rgba(90,50,35,' + (.12 + edad * .25 + (ex === 'sonrisa' ? .15 : 0)).toFixed(2) + ')'; g.lineWidth = .8; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(50 + s * (na + 1), 57); g.quadraticCurveTo(50 + s * (na + 5), 61, 50 + s * (na + 5), 65); g.stroke(); }
    /* bigote */
    if (barba === 'bigote' || barba === 'completa' || barba === 'candado') { g.fillStyle = cb; g.beginPath(); g.moveTo(42, 62.5); g.quadraticCurveTo(50, 58.6, 58, 62.5); g.quadraticCurveTo(50, 61.4, 42, 62.5); g.fill(); }
    /* boca */
    const sonr = ex === 'sonrisa' ? 2.2 : ex === 'enojada' ? -1.4 : ex === 'preocupada' ? -.8 : ex === 'seria' ? -.3 : .3, lab = R.labios || css(piel, -.28);
    g.fillStyle = css(hex3(lab), -.12); g.beginPath(); g.moveTo(43, 64); g.quadraticCurveTo(46.5, 62.4, 50, 63.2); g.quadraticCurveTo(53.5, 62.4, 57, 64); g.quadraticCurveTo(50, 64.6 + sonr * .3, 43, 64); g.fill();   /* labio de arriba */
    g.fillStyle = lab; g.beginPath(); g.moveTo(43.6, 64.2); g.quadraticCurveTo(50, 64.6 + sonr * .4, 56.4, 64.2); g.quadraticCurveTo(50, 68.2, 43.6, 64.2); g.fill();   /* de abajo */
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(50, 66, 2.6, .8, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(60,25,20,.7)'; g.lineWidth = .8; g.beginPath(); g.moveTo(43, 64 - sonr * .5); g.quadraticCurveTo(50, 64.6 + sonr, 57, 64 - sonr * .5); g.stroke();   /* comisura */
    /* arrugas de la frente */
    if (edad > .35) { g.strokeStyle = 'rgba(90,55,40,' + (.12 + edad * .2).toFixed(2) + ')'; g.lineWidth = .6; for (let i = 0; i < (edad > .7 ? 3 : 2); i++) { g.beginPath(); g.moveTo(40, 31 + i * 2.6); g.quadraticCurveTo(50, 29.5 + i * 2.6, 60, 31 + i * 2.6); g.stroke(); } }
    if (R.acc && R.acc.includes('cicatriz')) { g.strokeStyle = 'rgba(150,80,70,.8)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(63, 36); g.lineTo(58, 50); g.stroke(); g.lineWidth = .5; for (const k of [.25, .5, .75]) { const px = 63 - 5 * k, py = 36 + 14 * k; g.beginPath(); g.moveTo(px - 1.4, py - .5); g.lineTo(px + 1.4, py + .5); g.stroke(); } }
    if (R.acc && R.acc.includes('lunar')) { g.fillStyle = '#3a2418'; g.beginPath(); g.arc(59, 59, .9, 0, TAU); g.fill(); }
    /* pelo de adelante */
    g.fillStyle = colPelo; const p = R.peinado || 'corto';
    if (p !== 'calvo' && p !== 'rapado') { g.beginPath(); g.moveTo(24, 46); g.bezierCurveTo(20, 18, 38, 10, 52, 12); g.bezierCurveTo(68, 12, 81, 22, 76, 46); if (p === 'largo' || p === 'cola' || p === 'moño') { g.bezierCurveTo(72, 30, 64, 24, 54, 23); g.bezierCurveTo(44, 26, 34, 24, 28, 36); } else { g.bezierCurveTo(73, 32, 66, 25, 56, 25); g.bezierCurveTo(46, 25, 32, 26, 27, 38); } g.closePath(); g.fill();
      g.strokeStyle = css(hex3(canas ? '#d9d5cf' : pelo), .22); g.lineWidth = .6; for (let i = 0; i < 14; i++) { const u = i / 13; g.beginPath(); g.moveTo(28 + u * 46, 22 + Math.abs(u - .5) * 14); g.quadraticCurveTo(32 + u * 42, 16 + Math.abs(u - .5) * 8, 40 + u * 24, 13); g.stroke(); } }
    if (p === 'rapado') { g.fillStyle = colPelo; g.globalAlpha = .55; g.beginPath(); g.moveTo(26, 40); g.bezierCurveTo(22, 18, 40, 13, 50, 13); g.bezierCurveTo(60, 13, 78, 18, 74, 40); g.bezierCurveTo(68, 26, 60, 22, 50, 22); g.bezierCurveTo(40, 22, 32, 26, 26, 40); g.fill(); g.globalAlpha = 1; }
    if (p === 'moño') { g.fillStyle = colPelo; g.beginPath(); g.arc(50, 10, 8, 0, TAU); g.fill(); }
    if (p === 'cola') { g.fillStyle = colPelo; g.beginPath(); g.ellipse(76, 30, 5, 13, .5, 0, TAU); g.fill(); }
    if (p === 'calvo') { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(44, 24, 9, 4, -.3, 0, TAU); g.fill(); if (canas || edad > .5) { g.fillStyle = css(hex3('#bdb8b0'), 0); g.beginPath(); g.ellipse(26.5, 42, 3, 8, 0, 0, TAU); g.ellipse(73.5, 42, 3, 8, 0, 0, TAU); g.fill(); } }
    /* gorra o sombrero */
    if (R.acc && R.acc.includes('gorra')) { const cgc = R.colorGorra || '#2f4a63'; g.fillStyle = cgc; g.beginPath(); g.moveTo(24, 34); g.bezierCurveTo(24, 12, 76, 12, 76, 34); g.closePath(); g.fill(); g.fillStyle = css(hex3(cgc), -.3); g.beginPath(); g.ellipse(50, 34, 28, 4, 0, 0, Math.PI); g.fill(); g.fillStyle = '#d8d2c4'; g.fillRect(46, 22, 8, 5); }
    if (R.acc && R.acc.includes('sombrero')) { g.fillStyle = '#7a5233'; g.beginPath(); g.ellipse(50, 26, 36, 6, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(32, 26); g.bezierCurveTo(32, 6, 68, 6, 68, 26); g.closePath(); g.fill(); g.fillStyle = '#3b2418'; g.fillRect(32, 21, 36, 3); }
    /* gafas */
    if (R.acc && R.acc.includes('gafas')) { g.strokeStyle = '#121418'; g.lineWidth = 1.4; g.fillStyle = 'rgba(160,200,220,.18)'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect ? g.roundRect(50 + s * 10 - 7, 39.5, 14, 9, 3) : g.rect(50 + s * 10 - 7, 39.5, 14, 9); g.fill(); g.stroke(); } g.beginPath(); g.moveTo(47, 43); g.lineTo(53, 43); g.moveTo(26, 42); g.lineTo(33, 42); g.moveTo(67, 42); g.lineTo(74, 42); g.stroke(); }
    g.restore();
  }
};
MC.Rostro = Rostro;
