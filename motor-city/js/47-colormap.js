/* =====================================================================
   COLORMAP (4.4, C‑M39) · la luz de Doom (id Software, 1993), rehecha desde cero (sala limpia; la paleta es nuestra)
   Doom no mezclaba colores: tenía UNA paleta de 256 colores y 32 tablas que dicen, para cada color, cuál es su versión
   más oscura dentro de la misma paleta. La luz que baja con la distancia era solo buscar en una tabla.
   Aquí, en el modo pixel de cualquier vista:
   - una paleta de 256 colores (cubo 6×6×6 + rampa de grises cálidos);
   - una tabla de 32 768 entradas (RGB de 15 bits → índice) que se arma una sola vez;
   - 32 niveles de luz; el nivel crece con la distancia al jugador en pantalla y con la noche.
   Cuesta unas 3 búsquedas por píxel del búfer pequeño (≈ 40 000 píxeles en un celular): menos de 1 ms.
   Uso: vistas.pixel = true; vistas.colormap = true   (o MC.Colormap.aplicar(imageData, op) a mano)
   ===================================================================== */
const Colormap = {
  _cm: null,
  /* la paleta y las tablas (perezoso: la primera vez que se usa) */
  crear(niveles = 32) {
    const P = []; for (let r = 0; r < 6; r++) for (let g = 0; g < 6; g++) for (let b = 0; b < 6; b++) P.push([r * 51, g * 51, b * 51]);
    for (let k = 0; k < 40; k++) { const v = Math.round(k / 39 * 255); P.push([Math.min(255, v + 6), v, Math.max(0, v - 8)]); }
    const n = P.length, cerca = (r, g, b) => { let m = 0, md = 1e9; for (let i = 0; i < n; i++) { const p = P[i], d = (p[0] - r) * (p[0] - r) * .3 + (p[1] - g) * (p[1] - g) * .59 + (p[2] - b) * (p[2] - b) * .11; if (d < md) { md = d; m = i; } } return m; };
    const tabla = new Uint8Array(32768); for (let i = 0; i < 32768; i++) tabla[i] = cerca(((i >> 10) & 31) * 8.23, ((i >> 5) & 31) * 8.23, (i & 31) * 8.23);
    /* luz[nivel·n + c]: el color c oscurecido (0 = tal cual, niveles-1 = casi negro), siempre dentro de la paleta */
    const luz = new Uint8Array(niveles * n); for (let l = 0; l < niveles; l++) { const k = 1 - l / (niveles - 1) * .94; for (let c = 0; c < n; c++) { const p = P[c]; luz[l * n + c] = tabla[((p[0] * k) >> 3) << 10 | ((p[1] * k) >> 3) << 5 | ((p[2] * k) >> 3)]; } }
    const rgba = new Uint32Array(n); for (let c = 0; c < n; c++) rgba[c] = (255 << 24) | (P[c][2] << 16) | (P[c][1] << 8) | P[c][0];
    return { P, n, tabla, luz, niveles, rgba };
  },
  tablas() { return this._cm || (this._cm = this.crear()); },
  /* img: { data, width, height } (ImageData). op: { cx, cy (centro de la luz, px), base (nivel de luz de fondo 0..31), caida (niveles por px²) } */
  aplicar(img, op = {}) {
    const T = this.tablas(), U = new Uint32Array(img.data.buffer, img.data.byteOffset, img.data.length >> 2), w = img.width, h = img.height, n = T.n, max = T.niveles - 1;
    const cx = op.cx ?? w / 2, cy = op.cy ?? h * .6, base = op.base ?? 0, caida = op.caida ?? 18 / (w * w);
    for (let y = 0, i = 0; y < h; y++) { const dy2 = (y - cy) * (y - cy); for (let x = 0; x < w; x++, i++) {
      const v = U[i], c = T.tabla[((v & 255) >> 3) << 10 | (((v >> 8) & 255) >> 3) << 5 | (((v >> 16) & 255) >> 3)], l = Math.min(max, (base + ((x - cx) * (x - cx) + dy2) * caida) | 0);
      U[i] = T.rgba[T.luz[l * n + c]]; } }
    return img;
  },
  /* sobre un lienzo pequeño (el búfer del modo pixel), con la luz centrada en el jugador */
  lienzo(cv, E, centro) {
    const g = cv.getContext('2d'), img = g.getImageData(0, 0, cv.width, cv.height), cielo = E && E.reloj && typeof Cielo !== 'undefined' ? Cielo.en(E.reloj.fecha, E.reloj.hora, E.clima) : null, noche = cielo ? cielo.noche : 0;
    this.aplicar(img, { cx: centro ? centro[0] : cv.width / 2, cy: centro ? centro[1] : cv.height * .6, base: Math.round(noche * 9), caida: (4 + noche * 22) / (cv.width * cv.width) });
    g.putImageData(img, 0, 0);
  }
};
MC.Colormap = Colormap;
