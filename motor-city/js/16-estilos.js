/* =====================================================================
   ESTILOS · cómo se ve el mundo (2.7): realista, clásico, cómic, manga, anime, novela gráfica, ukiyo-e y acuarela
   Un estilo es un conjunto de datos, no otro motor. El mismo mundo, las mismas losas y los mismos árboles pasan por:
     - MAPA DE COLOR: saturar, brillo, contraste, gris, niveles (cel shading: bandas de luz) o paleta (el color más
       cercano de una obra real) y umbral con color de acento (la novela gráfica: blanco, negro y un rojo);
     - TINTA: contornos de grosor constante (la «línea clara» de Hergé y Moebius) en vías, techos, muros y árboles;
     - TRAMA: semitono de puntos (cómic impreso, Lichtenstein, Spider‑Verse), tramado de manga (screentone),
       rayado (grabado de Doré) o papel (acuarela y ukiyo-e);
     - SOMBRA: su color (azul violeta en el anime, negra en la novela, gris en el manga);
     - ÁRBOLES: real, cel (tonos planos y contorno), tono (manga), silueta (noir) o acuarela (bordes con pigmento);
     - CIELO y PASE FINAL: degradé propio (cielos de Shinkai en el anime) y, en el manga, todo a escala de grises;
       líneas de velocidad y onomatopeyas cuando el estilo las pide.
   Las PALETAS de ukiyo-e, novela y acuarela salen de obras de DOMINIO PÚBLICO (Hokusai, Hiroshige, Doré, Winslow
   Homer…), con su fuente en arte/dominio-publico/paletas.json. Del resto (Spider‑Verse, Arcane, Ghibli, Shinkai,
   Sin City, Moebius) se toman las TÉCNICAS, nunca imágenes ni personajes (docs/INSPIRACION-VISUAL.md).
   Uso: MC.estilo = 'comic' · MC.Estilo.p (el estilo activo) · MC.Estilo.col('#c25f37') · MC.Estilo.lista()
   ===================================================================== */
const PAL_DP = {
  hokusai: ['#f6e6c7', '#fbf4dd', '#284664', '#dbd1b9', '#6b7e8a', '#a83926', '#2c5489', '#213248', '#79736e', '#3b5f83', '#9ca9ac', '#79382c', '#5f7d4a', '#8a9a5b'],   // La gran ola y Fuji rojo (Hokusai, 1831) + dos verdes de los paisajes de Hiroshige
  dore: ['#f7f1df', '#070706', '#645f55', '#867f72', '#2b2924', '#46433c', '#171613', '#bcb5a6'],   // grabado de Gustave Doré (1861)
  acuarela: ['#cecdbc', '#576c73', '#79827e', '#afb2a7', '#e9dab7', '#496378', '#c7c7b0', '#b6b198', '#7f8d8e', '#f5f5ef']   // Winslow Homer (1899), Hiroshige (1857) y la Comisión Corográfica (1853)
};
const ESTILOS_GRAF = {
  realista: { n: 'Realista', icono: '📷', rudeza: true, arbol: 'real' },
  clasico: { n: 'Clásico (plano)', icono: '🟩', arbol: 'cel' },
  comic: { n: 'Cómic', icono: '💥', saturar: 1.35, contraste: 1.08, niveles: 5, tinta: 2.2, tintaColor: '#141118', trama: 'puntos', arbol: 'cel', sombra: [24, 20, 70, .42], lineas: '#141118', onomatopeyas: true, cielo: [[.22, .52, .95], [.98, .92, .62]] },
  manga: { n: 'Manga', icono: '🖋️', gris: true, contraste: 1.18, niveles: 4, tinta: 2, tintaColor: '#0b0b0b', trama: 'tono', arbol: 'tono', sombra: [0, 0, 0, .38], lineas: '#0b0b0b', onomatopeyas: true, final: 'gris', cielo: [[.82, .82, .82], [.99, .99, .99]] },
  anime: { n: 'Anime', icono: '🌸', saturar: 1.22, brillo: 1.05, niveles: 6, tinta: 1, tintaColor: '#2b2740', arbol: 'cel', sombra: [70, 50, 150, .32], lineas: '#ffffff', onomatopeyas: false, cielo: [[.16, .4, .92], [.8, .93, 1]] },
  novela: { n: 'Novela gráfica (noir)', icono: '🌃', umbral: [.3, .62], tonos: ['#0d0c0b', '#6a655c', '#ece5d3'], acento: '#b3201c', tinta: 2.6, tintaColor: '#000000', trama: 'rayado', arbol: 'silueta', sombra: [0, 0, 0, .72], lineas: '#000000', onomatopeyas: true, cielo: [[.07, .07, .08], [.5, .48, .45]] },
  ukiyoe: { n: 'Ukiyo-e (Hokusai)', icono: '🌊', paleta: 'hokusai', mezcla: .82, niveles: 5, tinta: 1.6, tintaColor: '#1d2a3f', trama: 'papel', arbol: 'cel', sombra: [30, 50, 90, .28], cielo: [[.17, .33, .54], [.96, .9, .78]] },
  acuarela: { n: 'Acuarela', icono: '🎨', paleta: 'acuarela', mezcla: .3, saturar: .9, brillo: 1.08, trama: 'papel', arbol: 'acuarela', sombra: [60, 70, 110, .24], cielo: [[.55, .7, .86], [.97, .95, .9]] }
};
const Estilo = {
  ESTILOS: ESTILOS_GRAF, PAL_DP,
  get p() { return ESTILOS_GRAF[MC.estilo] || ESTILOS_GRAF.realista; },
  lista() { return Object.entries(ESTILOS_GRAF).map(([id, e]) => ({ id, n: e.n, icono: e.icono })); },
  _pal: {}, _cc: new Map(), _ccEst: null,
  paleta(nombre) { return this._pal[nombre] || (this._pal[nombre] = (PAL_DP[nombre] || []).map(hex3)); },
  /* el corazón: un color [r, g, b] (0..1) pasado por el estilo activo */
  rgb(c, S = this.p) {
    let r = c[0], g = c[1], b = c[2];
    if (S.saturar || S.gris) { const l = .299 * r + .587 * g + .114 * b, k = S.gris ? 0 : S.saturar; r = l + (r - l) * k; g = l + (g - l) * k; b = l + (b - l) * k; }
    if (S.brillo) { r *= S.brillo; g *= S.brillo; b *= S.brillo; }
    if (S.contraste) { const k = S.contraste; r = (r - .5) * k + .5; g = (g - .5) * k + .5; b = (b - .5) * k + .5; }
    if (S.umbral) {   // novela gráfica: tres tonos de papel y tinta, y el rojo como acento (el «color selectivo» del noir)
      if (r > .38 && r > g * 1.45 && r > b * 1.45) return hex3(S.acento);
      const l = .299 * r + .587 * g + .114 * b; return hex3(S.tonos[l < S.umbral[0] ? 0 : l < S.umbral[1] ? 1 : 2]);
    }
    if (S.paleta) { const P = this.paleta(S.paleta); let best = P[0], bd = 1e9; for (const q of P) { const d = (q[0] - r) ** 2 * .3 + (q[1] - g) ** 2 * .59 + (q[2] - b) ** 2 * .11; if (d < bd) { bd = d; best = q; } } const m = S.mezcla ?? 1; r += (best[0] - r) * m; g += (best[1] - g) * m; b += (best[2] - b) * m; }
    if (S.niveles) {   // cel shading: la luz en bandas
      const l = Math.max(1e-3, .299 * r + .587 * g + .114 * b), n = S.niveles, lq = Math.max(.04, Math.round(l * n) / n), k = lq / l; r *= k; g *= k; b *= k;
    }
    return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1)];
  },
  /* un color CSS ('#hex', 'rgb()' o 'rgba()') pasado por el estilo, con caché; respeta la transparencia */
  col(css) {
    if (!css || typeof css !== 'string') return css; const S = this.p; if (S === ESTILOS_GRAF.realista || S === ESTILOS_GRAF.clasico) return css;
    if (this._ccEst !== MC.estilo) { this._cc.clear(); this._ccEst = MC.estilo; } let v = this._cc.get(css); if (v) return v;
    const a = /rgba/.test(css) ? +(css.match(/[\d.]+/g)[3] ?? 1) : 1; v = css3(this.rgb(hex3(css), S), a); this._cc.set(css, v); if (this._cc.size > 4000) this._cc.clear(); return v;
  },
  /* luz de un muro: en los estilos de cel, la luz salta en bandas en lugar de degradarse */
  luz(lz) { const S = this.p; return S.niveles && !S.rudeza ? Math.round(lz * 3) / 3 : lz; },
  /* ---------- tramas horneadas en las losas (patrones en metros del mundo) ---------- */
  _src: {},
  fuente(tipo) {
    if (this._src[tipo] !== undefined) return this._src[tipo]; const S = tipo === 'papel' ? 128 : 16, c = lienzo(S, S); if (!c) return (this._src[tipo] = null); const g = c.getContext('2d');
    if (tipo === 'puntos') { g.fillStyle = 'rgba(10,10,30,.30)'; for (const [x, y] of [[4, 4], [12, 12]]) { g.beginPath(); g.arc(x, y, 2.3, 0, TAU); g.fill(); } }   // semitono en diagonal, como la imprenta
    else if (tipo === 'tono') { g.fillStyle = 'rgba(0,0,0,.34)'; for (const [x, y] of [[4, 4], [12, 12]]) { g.beginPath(); g.arc(x, y, 1.4, 0, TAU); g.fill(); } }   // tramado de manga, más fino
    else if (tipo === 'rayado') { g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.4; for (let k = -16; k < 32; k += 6) { g.beginPath(); g.moveTo(k, 16); g.lineTo(k + 16, 0); g.stroke(); } }   // rayado de grabado
    else if (tipo === 'papel') { const img = g.createImageData(S, S), d = img.data, rnd = mulberry32(77); for (let i = 0; i < S * S; i++) { const v = rnd(), o = i * 4, cl = v > .5; d[o] = d[o + 1] = d[o + 2] = cl ? 255 : 90; d[o + 3] = Math.round(Math.abs(v - .5) * 2 * (cl ? 40 : 26)); } g.putImageData(img, 0, 0); g.strokeStyle = 'rgba(120,100,70,.10)'; g.lineWidth = .8; for (let i = 0; i < 40; i++) { const x = rnd() * S, y = rnd() * S, a = rnd() * TAU, l = 4 + rnd() * 10; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }   // fibras del papel
    return (this._src[tipo] = c);
  },
  trama(g, x0, y0, L, res) {
    const S = this.p; if (!S.trama) return; const f = this.fuente(S.trama); if (!f) return; const m = S.trama === 'papel' ? .12 : Math.max(.22, 2.2 / Math.max(.5, res)) / 16 * (S.trama === 'tono' ? .55 : 1);   // el punto del semitono mide lo mismo en pantalla a cualquier zoom de horneado
    const p = g.createPattern(f, 'repeat'); if (p && p.setTransform && typeof DOMMatrix !== 'undefined') p.setTransform(new DOMMatrix([m, 0, 0, m, 0, 0])); g.fillStyle = p; g.fillRect(x0, y0, L, L);
  },
  /* ---------- pase final (por cuadro, barato): manga en grises y líneas de velocidad ---------- */
  final(g, W, H, E) {
    const S = this.p; if (S.final === 'gris') { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.restore(); }
    const C = E.jugador && E.jugador.cuerpo, v = C ? Math.abs(C.v || 0) : 0; if (S.lineas && v > 8.5) this.lineas(g, W, H, Math.min(1, (v - 8.5) / 14), E.t || 0, S.lineas);
  },
  /* líneas de velocidad del manga: desde el borde hacia el centro, sin tocar el centro (el juego es del centro) */
  lineas(g, W, H, k, t, col) {
    const cx = W / 2, cy = H / 2, R0 = Math.min(W, H) * (.5 - .1 * k), R1 = Math.hypot(W, H) * .6, rnd = mulberry32((t * 24) | 0);
    g.save(); g.strokeStyle = col; g.globalAlpha = .25 + .45 * k; g.lineCap = 'round';
    for (let i = 0; i < 22 + 30 * k; i++) { const a = rnd() * TAU, r0 = R0 + rnd() * (R1 - R0) * .3; g.lineWidth = 1 + rnd() * 3 * k + 1; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * (H / W) * .9); g.lineTo(cx + Math.cos(a) * R1, cy + Math.sin(a) * R1); g.stroke(); }
    g.restore();
  }
};
MC.Estilo = Estilo; MC.ESTILOS_GRAF = ESTILOS_GRAF;
