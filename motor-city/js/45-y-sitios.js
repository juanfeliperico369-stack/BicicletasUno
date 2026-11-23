/* =====================================================================
   SITIOS ICÓNICOS DE MEDELLÍN EN 3D (5.3 · C5-02, primera versión de Claude con las fichas de Gemini G5-07)
   - Datos: docs/sitios/sitios.json (30 fichas: coordenadas del MC4, medidas, colores HEX, rasgos y receta), incrustadas al construir
     como MC_SITIOS. Solo para el mundo de Medellín y en el 3D realista (VistaTres); el 2D y el 3D clásico quedan como estaban.
   - Cada sitio tiene una FORMA hecha con las piezas de la malla (cajas orientadas, troncos de pirámide, cilindros, esferas):
     la aguja del Coltejer, las torres y la nave de las iglesias, la cúpula del Planetario, las tres rocas oscuras de la Biblioteca
     España, el óvalo del estadio con sus torres de luz, los cubos rojos de Explora, la pirámide invertida de la Biblioteca EPM, los
     postes del Parque de las Luces, las esculturas de la Plaza Botero, las flores del Orquideorama…; de noche, sus ventanas brillan.
   - Los sitios que son UN edificio reemplazan al edificio genérico del mapa (el que tenga el centro dentro de su planta y no sea
     mucho más alto); las plazas y parques solo SUMAN lo suyo (no borran nada).
   - Orientación: la del edificio genérico más grande que reemplaza o, si no hay, la de la vía más cercana.
   Es una versión de bajo polígono hecha por código (sin modelos ni texturas: sin peso); el pedido C5-02 de ChatGPT sigue abierto
   para modelos más finos. Medidas y rasgos: las fichas de Gemini; no se afirma exactitud arquitectónica.
   ===================================================================== */
const SITIOS_FORMA = {
  coltejer: 'aguja', candelaria: 'iglesia', catedral_metropolitana: 'catedral', palacio_cultura: 'palacio', plaza_botero: 'botero',
  edificio_epm: 'torre_vidrio', alpujarra: 'raza', pueblito_paisa: 'pueblito', parque_explora: 'cubos', orquideorama: 'flores',
  planetario: 'cupula', parque_deseos: 'deseos', biblioteca_espana: 'rocas', estadio_atanasio: 'estadio', museo_antioquia: 'deco',
  plaza_mayor: 'nave', teatro_pablo_tobon: 'teatro', ruta_n: 'ruta_n', teatro_metropolitano: 'teatro', pies_descalzos: 'bambu',
  parque_luces: 'luces', edificio_vasquez: 'republicano', edificio_carre: 'republicano', biblioteca_epm: 'piramide_inv',
  estacion_ferrocarril: 'estacion', palacio_nacional: 'republicano', casa_memoria: 'bloque', mamm: 'malla'
};
/* las que son un edificio (reemplazan al genérico); las demás son plazas y parques que solo suman */
const SITIOS_REEMPLAZA = new Set(['aguja', 'iglesia', 'catedral', 'palacio', 'torre_vidrio', 'cubos', 'cupula', 'rocas', 'estadio', 'deco', 'nave', 'teatro', 'ruta_n', 'republicano', 'piramide_inv', 'estacion', 'bloque', 'malla']);
const Sitios = {
  activo: true, _M: null, _L: null,
  /* los sitios del mundo (solo Medellín), con su orientación y los edificios genéricos que tapan (se calcula una vez) */
  lista(M) {
    if (!this.activo || !M || !M.cfg || M.cfg.id !== 'medellin' || typeof MC_SITIOS === 'undefined') return [];
    if (this._M === M && this._L) return this._L;
    const L = [];
    for (const s0 of MC_SITIOS) {
      const forma = SITIOS_FORMA[s0.id]; if (!forma) continue; const s = Object.assign({ forma }, s0), w = s.planta[0], d = s.planta[1];
      /* los edificios genéricos que caen en la planta (con la orientación del más grande) */
      let mayor = null; const tapa = new Set();
      for (const e of M.edificiosEn(s.x - w, s.y - d, s.x + w, s.y + d)) {
        const ang = Math.atan2(e.uy || 0, e.ux || 1), dx = e.x - s.x, dy = e.y - s.y;
        if (Math.hypot(dx, dy) > Math.max(w, d) * .62) continue;
        if (!mayor || e.hw * e.hd > mayor.hw * mayor.hd) mayor = e;
        if (SITIOS_REEMPLAZA.has(forma) && e.h <= s.alto * 1.6 + 8) tapa.add(e);
        void ang;
      }
      const via = M.viaCercana ? M.viaCercana(s.x, s.y, 120) : null;
      s.a = mayor ? Math.atan2(mayor.uy || 0, mayor.ux || 1) : via ? via.ang : 0;
      /* solo se tapa lo que de verdad queda dentro de la planta girada (no los vecinos) */
      const ca = Math.cos(s.a), sa = Math.sin(s.a);
      s.tapa = new Set([...tapa].filter(e => { const u = (e.x - s.x) * ca + (e.y - s.y) * sa, v = -(e.x - s.x) * sa + (e.y - s.y) * ca; return Math.abs(u) < w * .5 && Math.abs(v) < d * .5; }));
      s.cota = M.cota(s.x, s.y); L.push(s);
    }
    this._M = M; return (this._L = L);
  },
  /* ¿este edificio genérico lo reemplaza un sitio? */
  tapa(M, e) { for (const s of this.lista(M)) if (s.tapa.has(e)) return true; return false; },
  /* los sitios cuyo centro cae en la región (gx, gy) de lado R */
  enRegion(M, gx, gy, R) { return this.lista(M).filter(s => Math.floor(s.x / R) === gx && Math.floor(s.y / R) === gy); },
  /* ---------- las piezas, en el marco del sitio (u adelante, v al lado, y arriba) ---------- */
  _piezas(m, s, O, zb) {
    const ca = Math.cos(s.a), sa = Math.sin(s.a), X0 = s.x - O[0], Z0 = s.y - O[1];
    const P = (u, v, y) => [X0 + u * ca - v * sa, zb + y, Z0 + u * sa + v * ca];
    const col = k => hex3((s.col && s.col[k]) || '#9a958c'), vid = hex3((s.col && s.col.vidrio) || '#26343f');
    const caja = (u, v, y, L, W, H, c, e = 0, cT = c) => { const p = P(u, v, y); m.cajaF(p[0], p[1], p[2], s.a, L, W, H, c, e, cT); };
    /* tronco de pirámide rectangular: abajo L0 × W0 en y0, arriba L1 × W1 en y1 (desplazado du, dv); con tapa si L1·W1 > 0 */
    const tronco = (u, v, y0, y1, L0, W0, L1, W1, c, du = 0, dv = 0, cT = c) => {
      const A = [[-L0 / 2, -W0 / 2], [L0 / 2, -W0 / 2], [L0 / 2, W0 / 2], [-L0 / 2, W0 / 2]].map(([a, b]) => P(u + a, v + b, y0)),
        B = [[-L1 / 2, -W1 / 2], [L1 / 2, -W1 / 2], [L1 / 2, W1 / 2], [-L1 / 2, W1 / 2]].map(([a, b]) => P(u + du + a, v + dv + b, y1)), ctr = P(u + du / 2, v + dv / 2, (y0 + y1) / 2);
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; m.quadF(A[i], A[j], B[j], B[i], c, 0, ctr); }
      if (L1 * W1 > .01) m.quadF(B[0], B[1], B[2], B[3], cT, 0, ctr); m.quadF(A[0], A[1], A[2], A[3], c, 0, ctr);
    };
    const cil = (u, v, y, r, h, n, c, rT = r, cT = c) => { const p = P(u, v, y); m.cil(p[0], p[1], p[2], r, h, n, c, rT, cT); };
    /* franjas de ventanas (de noche brillan): en las 4 caras de un bloque L × W, de y0 a y1 cada «paso» */
    const ventanas = (u, v, L, W, y0, y1, paso = 3.2, alto = 1.1) => { for (let y = y0; y + alto < y1; y += paso) caja(u, v, y, L + .3, W + .3, alto, vid, 1); };
    return { P, col, vid, caja, tronco, cil, ventanas, h: (i, k = 1) => h2(i, k, 913) };
  },
  /* ---------- las formas ---------- */
  armar(m, s, O, zb, detalle) {
    const K = this._piezas(m, s, O, zb), { caja, tronco, cil, ventanas, col, vid, h } = K, w = s.planta[0], d = s.planta[1], H = s.alto, fino = detalle >= 2;
    switch (s.forma) {
      case 'aguja': {   /* Coltejer: podio, cuerpo con franjas y la aguja que se estrecha hasta la punta, con los dos «ojos» */
        caja(0, 0, 0, w * .95, d * .9, 12, col('podio'));
        caja(0, 0, 12, 36, 22, 106, col('fachada')); if (fino) ventanas(0, 0, 36, 22, 16, 116, 3.4, 1.2);
        tronco(0, 0, 118, H - 2, 36, 22, 26, 1.2, col('fachada'));
        if (fino) for (const sg of [-1, 1]) caja(0, sg * 7.4, 150, 7, .8, 7, vid, 1);
        cil(0, 0, H - 2, .35, 12, 4, col('acento'), .05); break;
      }
      case 'iglesia': case 'catedral': {   /* nave con techo a dos aguas, dos torres al frente con su remate y, la catedral, cimborrio */
        const cat = s.forma === 'catedral', L = w * .9, W = d * (cat ? .42 : .45), hN = cat ? 30 : 17, c1 = col(cat ? 'ladrillo' : 'fachada'), cT = col('techo');
        caja(0, 0, 0, L, W, hN, c1); tronco(0, 0, hN, hN + W * .38, L, W, L, .6, cT);
        const t = cat ? 11 : 7, hT = H - (cat ? 10 : 7);
        for (const sg of [-1, 1]) { caja(L / 2 - t / 2, sg * (W / 2 - t / 2), 0, t, t, hT, cat ? col('ladrillo_claro') : c1); cil(L / 2 - t / 2, sg * (W / 2 - t / 2), hT, t * .62, cat ? 10 : 7, 8, cT, 0); if (fino) ventanas(L / 2 - t / 2, sg * (W / 2 - t / 2), t, t, hT - 6, hT - 1, 5, 1.6); }
        if (cat) { cil(-L * .1, 0, hN, 11, 10, 10, c1); cil(-L * .1, 0, hN + 10, 11, 9, 10, cT, 2); }
        if (fino) caja(L / 2 + .2, 0, 3, .4, W * .3, hN * .55, vid, 1);   /* el rosetón y la puerta: luz de noche */
        break;
      }
      case 'palacio': {   /* Palacio de la Cultura: bandas blancas y negras, torre central con cúpula y pináculos en las esquinas */
        const L = w * .88, W = d * .8, hB = 20;
        for (let y = 0, i = 0; y < hB; y += 2.5, i++) caja(0, 0, y, L, W, 2.5, col(i % 2 ? 'fachada_oscura' : 'fachada_clara'));
        if (fino) ventanas(0, 0, L, W, 3, hB - 1, 4.2, 1.3);
        caja(0, 0, hB, 12, 12, H - hB - 6, col('fachada_clara')); cil(0, 0, H - 6, 6.5, 6, 8, col('acento'), 0);
        for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) cil(a * (L / 2 - 2), b * (W / 2 - 2), hB, 1.6, 7, 6, col('fachada_oscura'), 0);
        break;
      }
      case 'torre_vidrio': {   /* Edificio Inteligente de EPM: bloque de vidrio verdoso con marcos y franjas */
        const L = Math.min(w, 70), W = Math.min(d, 46);
        caja(0, 0, 0, L, W, H, vid, 0, col('fachada')); if (fino) { ventanas(0, 0, L, W, 2, H - 1, 3.6, 1.4); for (let i = -2; i <= 2; i++) caja(i * L / 5, W / 2 + .3, 0, .9, .6, H, col('fachada')); }
        break;
      }
      case 'cubos': {   /* Parque Explora: cubos rojos sobre su basamento oscuro */
        caja(0, 0, 0, w * .8, d * .75, 2.5, col('basamento'));
        const C = [[-.3, 24, 16], [-.05, 20, 13], [.18, 22, 15], [.38, 17, 11]];
        C.forEach(([f, l, hh], i) => caja(f * d, (h(i) - .5) * w * .3, 2.5, l, l, hh, col('cubos_rojos'), 0));
        if (fino) caja(.05 * d, 0, 2.5, 30, 12, 6, vid, 1);
        break;
      }
      case 'cupula': {   /* Planetario: tambor de ladrillo y cúpula escalonada */
        const r = Math.min(w, d) * .42; cil(0, 0, 0, r, 7, 16, col('ladrillo'));
        for (let k = 0; k < 4; k++) { const a0 = k / 4 * Math.PI / 2, a1 = (k + 1) / 4 * Math.PI / 2; cil(0, 0, 7 + Math.sin(a0) * r * .85, Math.cos(a0) * r, (Math.sin(a1) - Math.sin(a0)) * r * .85, 16, col('cupula'), Math.max(.4, Math.cos(a1) * r)); }
        caja(r + 4, 0, 0, 10, 14, 6, col('concreto')); if (fino) caja(r + 9.2, 0, 1, .4, 8, 3.4, vid, 1);
        break;
      }
      case 'rocas': {   /* Biblioteca España: tres rocas oscuras facetadas sobre la plataforma, en la ladera de Santo Domingo */
        caja(0, 0, 0, w * .9, d * .8, 2, col('plataforma'));
        [[-12, -10, 21, 19, H, 5, -3], [10, -6, 18, 17, H * .86, -4, 4], [0, 14, 16, 15, H * .78, 3, 2]].forEach(([u, v, l0, w0, hh, du, dv]) => {
          tronco(u, v, 2, 2 + hh * .55, l0, w0, l0 * .92, w0 * .9, col('rocas'), du * .4, dv * .4);
          tronco(u + du * .4, v + dv * .4, 2 + hh * .55, 2 + hh, l0 * .92, w0 * .9, l0 * .55, w0 * .5, col('rocas'), du * .6, dv * .6);
          if (fino) caja(u, v, 6, l0 * .7, w0 * .7, 1, col('aristas'), 1); });
        break;
      }
      case 'estadio': {   /* Atanasio Girardot: óvalo de tribunas (más altas a los lados), cancha, pista y cuatro torres de luz */
        caja(0, 0, 0, 105, 68, .3, col('cesped')); const n = 28, ra = w * .47, rb = d * .47;
        for (let i = 0; i < n; i++) { const t = (i + .5) / n * TAU, u = Math.cos(t) * ra, v = Math.sin(t) * rb, lado = Math.abs(Math.sin(t)), hh = 16 + lado * (H - 18);
          const P0 = K.P(u, v, 0), seg = TAU / n * Math.max(ra, rb) * 1.05; m.cajaF(P0[0], P0[1], P0[2], s.a + t + Math.PI / 2, seg, 14, hh, col('tribunas'), 0, col('estructura')); }
        if (fino) for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { cil(a * ra * .78, b * rb * .78, 0, .9, H + 10, 6, col('estructura')); caja(a * ra * .78, b * rb * .78, H + 10, 6, 2, 3, col('luz_noche'), 1); }
        break;
      }
      case 'deco': {   /* Museo de Antioquia (antiguo Palacio Municipal): bloque art déco con zócalo y pilastras */
        const L = w * .85, W = d * .7; caja(0, 0, 0, L, W, 3.2, col('zocalo')); caja(0, 0, 3.2, L, W, H - 3.2, col('fachada'));
        if (fino) { ventanas(0, 0, L, W, 5, H - 2, 4.6, 1.8); for (let i = -4; i <= 4; i++) caja(i * L / 9, W / 2 + .25, 3.2, 1.1, .5, H - 3.2, col('acento')); }
        break;
      }
      case 'nave': {   /* Plaza Mayor: pabellón bajo con cubierta de madera */
        const L = w * .82, W = d * .7; caja(0, 0, 0, L, W, H - 5, col('concreto')); tronco(0, 0, H - 5, H, L + 4, W + 4, L * .8, W * .6, col('techo'));
        if (fino) ventanas(0, 0, L, W, 2, H - 6, 5, 2.4);
        break;
      }
      case 'teatro': {   /* teatros: sala con la torre del escenario atrás, más alta */
        const L = w * .85, W = d * .78, c1 = col('ladrillo'); caja(0, 0, 0, L, W, H * .6, c1); caja(-L * .22, 0, 0, L * .38, W * .8, H, c1, 0, col('techo'));
        tronco(L * .18, 0, H * .6, H * .72, L * .55, W, L * .45, W * .8, col('techo')); if (fino) caja(L / 2 + .2, 0, 1, .4, W * .5, 4, vid, 1);
        break;
      }
      case 'ruta_n': {   /* Ruta N: dos volúmenes de vidrio y aluminio unidos, con muro verde */
        const L = w * .42, W = d * .7;
        for (const sg of [-1, 1]) { caja(sg * w * .24, 0, 0, L, W, H, vid, 0, col('aluminio')); if (fino) ventanas(sg * w * .24, 0, L, W, 2, H - 1, 3.8, 1.3); }
        caja(0, 0, 6, w * .1, W * .7, H * .5, col('acento')); if (fino) caja(-w * .24, W / 2 + .4, 2, L * .8, .5, H - 6, col('muro_verde'));
        break;
      }
      case 'republicano': {   /* edificios republicanos: ladrillo o estuco, cornisa y mansarda */
        const L = w * .88, W = d * .88, c1 = col((s.col && s.col.ladrillo) ? 'ladrillo' : 'fachada'), cE = col((s.col && s.col.estuco) ? 'estuco' : (s.col && s.col.acento_ocre) ? 'acento_ocre' : 'fachada');
        caja(0, 0, 0, L, W, H - 4, c1); caja(0, 0, H - 4.6, L + 1, W + 1, .8, cE); tronco(0, 0, H - 3.8, H, L, W, L * .8, W * .8, col('techo'));
        if (fino) ventanas(0, 0, L, W, 2.5, H - 5, 3.8, 1.7);
        break;
      }
      case 'piramide_inv': {   /* Biblioteca EPM: la pirámide invertida sobre su base */
        caja(0, 0, 0, w * .7, d * .5, 7, col('piedra')); tronco(0, 0, 7, H, 22, 22, w * .75, w * .75, col('oscuro'));
        if (fino) caja(0, 0, 2, w * .7 + .3, d * .5 + .3, 3, vid, 1);
        break;
      }
      case 'estacion': {   /* Estación del Ferrocarril: bloque largo, frontón al centro y reloj */
        const L = w * .9, W = d * .4; caja(0, 0, 0, L, W, H - 4, col('fachada')); tronco(0, 0, H - 4, H, L, W, L, .6, col('techo'));
        caja(0, W / 2 + 1, 0, 14, 3, H + 2, col('molduras')); if (fino) { caja(0, W / 2 + 2.6, H - 3, 3, .3, 3, hex3('#f3efe2'), 1); ventanas(0, 0, L, W, 2, H - 5, 4, 2.2); }
        break;
      }
      case 'bloque': case 'malla': {   /* Casa de la Memoria y MAMM: concreto, y el MAMM con su malla de ladrillo */
        const L = w * .82, W = d * .72; caja(0, 0, 0, L, W, H, col('concreto'));
        if (s.forma === 'malla') caja(L * .2, 0, 3, L * .62, W + .6, H - 3, col('malla')); else caja(0, 0, H, L * .9, W * .9, .6, col('zinc'));
        if (fino) caja(-L / 2 - .2, 0, 1, .4, W * .6, 3, vid, 1);
        break;
      }
      /* ---------- plazas y parques: solo suman ---------- */
      case 'botero': {   /* Plaza Botero: esculturas de bronce redondas sobre pedestales */
        for (let i = 0; i < (fino ? 14 : 6); i++) { const u = (h(i, 1) - .5) * w * .8, v = (h(i, 2) - .5) * d * .75, k = 1.1 + h(i, 3) * 1.2, p = K.P(u, v, 1.2);
          caja(u, v, 0, 2.2, 2.2, 1.2, col('pedestal')); m.esfera(p[0], p[1] + k * 1.2, p[2], k, k * 1.25, k, col('bronce'), osc3(col('bronce'), .6), i + 3); }
        break;
      }
      case 'raza': {   /* La Alpujarra: el Monumento a la Raza, una forma que sube curvándose */
        caja(0, 0, 0, 14, 14, 2, col('plaza'));
        for (let k = 0; k < 9; k++) { const t = k / 9; tronco(Math.sin(t * 3) * 4, Math.cos(t * 2.2) * 3, 2 + t * 36, 2 + (t + 1 / 9) * 36, 7 - t * 4, 5 - t * 2.5, 6.4 - t * 4, 4.6 - t * 2.4, col('monumento'), Math.cos(t * 3) * .8, -Math.sin(t * 2.2) * .6); }
        break;
      }
      case 'pueblito': {   /* Pueblito Paisa: plazoleta, iglesita y casitas blancas con puertas de colores */
        caja(0, 0, 0, w * .6, d * .5, .3, hex3('#b9a98f'));
        caja(-w * .22, 0, 0, 10, 7, 7, col('fachada')); tronco(-w * .22, 0, 7, 10, 10, 7, 10, .4, col('techo')); caja(-w * .22 + 4.5, 0, 0, 3, 3, 13, col('fachada')); cil(-w * .22 + 4.5, 0, 13, 2, 3, 4, col('techo'), 0);
        for (let i = 0; i < 6; i++) { const u = (i % 3 - 1) * 11 + 6, v = (i < 3 ? -1 : 1) * d * .2; caja(u, v, 0, 8, 6, 4, col('fachada')); tronco(u, v, 4, 6, 8.6, 6.6, 8.6, .4, col('techo')); if (fino) caja(u, v + (i < 3 ? 3.1 : -3.1), 0, 1.4, .3, 2.4, col(i % 2 ? 'carpinteria_azul' : 'carpinteria_rojo')); }
        break;
      }
      case 'flores': {   /* Orquideorama: «flores» hexagonales de madera sobre columnas */
        for (let i = 0; i < (fino ? 7 : 4); i++) { const t = i / 7 * TAU, u = i ? Math.cos(t) * 20 : 0, v = i ? Math.sin(t) * 16 : 0;
          cil(u, v, 0, 1, H - 2, 6, col('acero')); cil(u, v, H - 2, 9, 1.4, 6, col('madera')); }
        break;
      }
      case 'deseos': {   /* Parque de los Deseos: la casa de la música y el reloj de sol */
        caja(w * .25, 0, 0, 14, 10, 8, col('casa_musica')); cil(-w * .15, 0, 0, 1.4, H, 4, col('acero'), .1);
        if (fino) caja(0, d * .25, 0, 18, 6, .2, col('agua'));
        break;
      }
      case 'bambu': {   /* Pies Descalzos: agua, arena y un bosque de bambú */
        caja(0, 0, 0, w * .5, d * .3, .25, col('agua')); caja(w * .2, -d * .25, 0, w * .3, d * .2, .2, col('arena'));
        for (let i = 0; i < (fino ? 26 : 10); i++) cil(-w * .3 + h(i, 4) * w * .25, (h(i, 5) - .5) * d * .5, 0, .18, 7 + h(i, 6) * 4, 4, col('bambu'), .1);
        break;
      }
      case 'luces': {   /* Parque de las Luces: el bosque de postes de 24 m que de noche se encienden */
        const nu = fino ? 12 : 6, nv = fino ? 9 : 5;
        for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const u = (i / (nu - 1) - .5) * w * .8, v = (j / (nv - 1) - .5) * d * .8; cil(u, v, 0, .2, H, 4, col('postes')); caja(u, v, H, .6, .6, .5, col('luz_noche'), 1); }
        break;
      }
    }
  }
};
MC.Sitios = Sitios;
/* en el 3D realista: el sitio se arma en la región de su centro y tapa a los genéricos que reemplaza */
if (typeof VistaTres !== 'undefined') {
  const _ed = VistaTres.prototype._edificio;
  VistaTres.prototype._edificio = function (m, P, O, zb, e, ...resto) { if (Sitios.activo && Sitios.tapa(this.mundo, e)) return; return _ed.call(this, m, P, O, zb, e, ...resto); };
  const _reg = VistaTres.prototype._region;
  VistaTres.prototype._region = function (gx, gy, detalle) {
    const r = _reg.call(this, gx, gy, detalle);
    try {
      const L = Sitios.activo && r && r.grupo ? Sitios.enRegion(this.mundo, gx, gy, this.R) : [];
      if (L.length) { const m = new Malla(); for (const s of L) Sitios.armar(m, s, this.O, s.cota - this.O[2], detalle);
        if (m.d.length) { const g = new THREE.Mesh(this._geo10(m.d), this.matCosas); g.castShadow = g.receiveShadow = detalle >= 1; g.userData.sitios = L.map(s => s.id); r.grupo.add(g); r.sitios = L.map(s => s.id); } }
    } catch (e) { MC.falla('sitios', e); }
    return r;
  };
}
