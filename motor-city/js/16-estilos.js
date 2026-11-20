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
   2.8: vintage (sepia, papel y viñeta) y CRT (líneas de barrido), como los filtros de Miniopolis (entrega maestra, R17).
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
  unbit: { n: 'Grabado de un bit', icono: '◩', gris: true, arbol: 'tono', binario: true },
  manga: { n: 'Manga', icono: '🖋️', gris: true, contraste: 1.18, niveles: 4, tinta: 2, tintaColor: '#0b0b0b', trama: 'tono', arbol: 'tono', sombra: [0, 0, 0, .38], lineas: '#0b0b0b', onomatopeyas: true, final: 'gris', cielo: [[.82, .82, .82], [.99, .99, .99]] },
  anime: { n: 'Anime', icono: '🌸', saturar: 1.22, brillo: 1.05, niveles: 6, tinta: 1, tintaColor: '#2b2740', arbol: 'cel', sombra: [70, 50, 150, .32], lineas: '#ffffff', onomatopeyas: false, cielo: [[.16, .4, .92], [.8, .93, 1]] },
  novela: { n: 'Novela gráfica (noir)', icono: '🌃', umbral: [.3, .62], tonos: ['#0d0c0b', '#6a655c', '#ece5d3'], acento: '#b3201c', tinta: 2.6, tintaColor: '#000000', trama: 'rayado', arbol: 'silueta', sombra: [0, 0, 0, .72], lineas: '#000000', onomatopeyas: true, cielo: [[.07, .07, .08], [.5, .48, .45]] },
  ukiyoe: { n: 'Ukiyo-e (Hokusai)', icono: '🌊', paleta: 'hokusai', mezcla: .82, niveles: 5, tinta: 1.6, tintaColor: '#1d2a3f', trama: 'papel', arbol: 'cel', sombra: [30, 50, 90, .28], cielo: [[.17, .33, .54], [.96, .9, .78]] },
  vintage: { n: 'Vintage', icono: '📼', saturar: .55, contraste: .92, tinte: [.66, .52, .36], tinteK: .28, trama: 'papel', arbol: 'cel', sombra: [60, 40, 20, .3], final: 'vineta', cielo: [[.72, .62, .48], [.95, .88, .74]] },   // 2.8: foto vieja (entrega maestra, R17)
  crt: { n: 'CRT (pantalla vieja)', icono: '📺', saturar: 1.25, contraste: 1.08, niveles: 7, arbol: 'cel', sombra: [10, 20, 40, .36], final: 'crt', cielo: [[.1, .3, .6], [.6, .8, .95]] },   // 2.8: líneas de barrido y borde oscuro
  termica: { n: 'Visión térmica', icono: '🌡️', gradiente: ['#2b0b57', '#7a1fa2', '#e5383b', '#ff9f1c', '#ffea00'], arbol: 'cel', sombra: [20, 0, 60, .3], cielo: [[.1, .03, .25], [.35, .1, .45]] },   // 2.8: FireTrace (R22), paleta del informe de Gemini
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
    if (S.tinte) { const l = .299 * r + .587 * g + .114 * b, k = S.tinteK ?? .3; r += (S.tinte[0] * l * 1.6 - r) * k; g += (S.tinte[1] * l * 1.6 - g) * k; b += (S.tinte[2] * l * 1.6 - b) * k; }   // tono sepia
    if (S.contraste) { const k = S.contraste; r = (r - .5) * k + .5; g = (g - .5) * k + .5; b = (b - .5) * k + .5; }
    if (S.gradiente) { const G = S._g || (S._g = S.gradiente.map(hex3)), l = clamp(.299 * r + .587 * g + .114 * b, 0, 1) * (G.length - 1), i = Math.min(G.length - 2, Math.floor(l)), u = l - i; return mez3(G[i], G[i + 1], u); }   // mapa de calor por luminancia
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
    const hex = /^#([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i.exec(css);
    const rgb = /^rgba?\(\s*([.\d]+)\s*,\s*([.\d]+)\s*,\s*([.\d]+)(?:\s*,\s*([.\d]+))?\s*\)$/i.exec(css);
    if (!hex && !rgb) return css;
    let color, alfa = 1;
    if (hex) {
      const codigo = hex[1].length < 5 ? [...hex[1]].map(n => n+n).join('') : hex[1];
      color = hex3('#'+codigo.slice(0,6));
      if (codigo.length === 8) alfa = parseInt(codigo.slice(6),16)/255;
    } else {
      color = rgb.slice(1,4).map(n => Number(n)/255); alfa = Number(rgb[4] ?? 1);
    }
    v = css3(this.rgb(color,S),alfa); this._cc.set(css, v); if (this._cc.size > 4000) this._cc.clear(); return v;
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
  // Umbrales ordenados por máxima distancia al punto más cercano en un toro.
  ruidoAzul() {
    if (this._azul) return this._azul;
    const n = 16, rango = new Uint8Array(n*n), distancia = new Float32Array(n*n).fill(Infinity);
    let elegido = 93;
    for (let valor = 0; valor < rango.length; valor++) {
      rango[elegido] = valor;
      const x = elegido % n, y = elegido >> 4;
      let max = -1, siguiente = 0;
      for (let i = 0; i < rango.length; i++) {
        const dx = Math.abs(i % n - x), dy = Math.abs((i >> 4) - y);
        distancia[i] = Math.min(distancia[i], Math.min(dx,n-dx)**2 + Math.min(dy,n-dy)**2);
        const candidato = distancia[i] + h2(i,valor,451) * .01;
        if (candidato > max) { max = candidato; siguiente = i; }
      }
      elegido = siguiente;
    }
    return this._azul = rango;
  },
  imprimir(g, W, H, V, binario) {
    const img = g.getImageData(0, 0, W, H), rgba = img.data;
    const {a,b,c,d,e,f} = V, det = a*d-b*c;
    const paso = Math.max(.08, 1 / Math.max(.1,V.z));
    const ux = d/det/paso, uy = -b/det/paso, vx = -c/det/paso, vy = a/det/paso;
    const azul = binario ? this.ruidoAzul() : null;
    for (let y = 0, i = 0; y < H; y++) {
      let xw = (.5-e)*ux+(y+.5-f)*vx, yw = (.5-e)*uy+(y+.5-f)*vy;
      for (let x = 0; x < W; x++, i+=4, xw+=ux, yw+=uy) {
        const lum = .2126*rgba[i]+.7152*rgba[i+1]+.0722*rgba[i+2];
        if (binario) {
          const rango = azul[(Math.floor(xw)&15) + ((Math.floor(yw)&15)<<4)];
          rgba[i] = rgba[i+1] = rgba[i+2] = lum > rango+.5 || lum === 255 ? 255 : 0;
        } else if (lum < 160) {
          const dx = ((Math.floor(xw)&7)-3.5)/4, dy = ((Math.floor(yw)&7)-3.5)/4;
          if (dx*dx+dy*dy < (160-lum)/160) { rgba[i]*=.52; rgba[i+1]*=.48; rgba[i+2]*=.58; }
        }
      }
    }
    g.putImageData(img,0,0);
  },
  /* ---------- pase final (por cuadro, barato): manga en grises y líneas de velocidad ---------- */
  final(g, W, H, E) {
    const S = this.p; if (S.final === 'gris') { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.restore(); }
    else if (S.final === 'vineta' || S.final === 'crt') { const c = this._capa(S.final, W, H); if (c) g.drawImage(c, 0, 0); }   // horneado una vez por tamaño de pantalla
    const C = E.jugador && E.jugador.cuerpo, v = C ? Math.abs(C.v || 0) : 0; if (S.lineas && v > 8.5) this.lineas(g, W, H, Math.min(1, (v - 8.5) / 14), E.t || 0, S.lineas);
  },
  _capas: {},
  _capa(tipo, W, H) {
    const k = tipo + W + 'x' + H; if (this._capas[k] !== undefined) return this._capas[k]; const c = lienzo(W, H); if (!c) return (this._capas[k] = null); const g = c.getContext('2d');
    const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.hypot(W, H) * .58); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, tipo === 'crt' ? 'rgba(0,0,0,.55)' : 'rgba(40,24,10,.45)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (tipo === 'crt') { g.fillStyle = 'rgba(0,0,0,.16)'; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1); }   // líneas de barrido
    for (const q in this._capas) if (q.startsWith(tipo) && q !== k) delete this._capas[q]; return (this._capas[k] = c);
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
