/* K-1 · OpenAI GPT-6 + Codex · EnCicla 3.6
 * Un trozo de ciudad deja de construirse íntegro dentro del cuadro que lo solicita.
 * Cada etapa se reanuda en rAF con presupuesto de 6 ms. Si falta Canvas, mantiene
 * el render original; el terreno base se ve mientras se completa.
 * No requiere red, Worker, OffscreenCanvas ni librerías.
 */
(function () {
  'use strict';
  if (typeof CityMap === 'undefined' || !CityMap.chunkG ||
      typeof CityMap.drawGround3Etapas !== 'function') return;
  const previa = CityMap.chunkG;
  const cola = [], muestras = [], limiteMuestras = 240, presupuesto = 6;
  let activo = false;
  const P = JE.chunksGPT6 = {
    version: '3.10.1', presupuestoMs: presupuesto, creados: 0, terminados: 0,
    cancelados: 0, errores: 0, maxEtapaMs: 0, maxCuadroMs: 0, latencias: [],   /* 3.10.1: ms desde que se pide un trozo hasta que queda completo */
    muestras, get pendientes() { return cola.length; },
    percentil95() {
      if (!muestras.length) return 0;
      const a = muestras.slice().sort((x, y) => x - y);
      return a[Math.ceil(a.length * .95) - 1];
    }
  };
  const reloj = () => (typeof performance !== 'undefined' && performance.now)
    ? performance.now() : Date.now();
  const valido = trabajo => trabajo.map.chunks2.get(trabajo.key) === trabajo.canvas;
  /* 3.10.1 · FASE A, LA CARGA SIN HUECOS (Claude, 25‑nov‑2026; el autor: «El mundo en tercera persona no carga en totalidad ni
   * aunque avances más»). Medido con la compuerta de 2 km y CPU 4×: de 32 a 40 trozos pedidos, 0 terminados y 21 a 40 cancelados.
   * La cola iba en ronda (una etapa de cada trozo por turno): ninguno terminaba, y al moverse se botaban a medio hacer.
   * Ahora:
   * - lo cercano primero: la cola se ordena en cada cuadro por la distancia al centro de la vista, con ventaja para lo que
   *   queda adelante del rumbo;
   * - de a uno y hasta terminarlo: el primero de la cola sigue con sus etapas hasta acabar, dentro del mismo presupuesto;
   * - el caché del suelo cuenta la vista de verdad: con la cámara girada (de cerca va detrás del rumbo) el suelo se dibuja en
   *   un cuadrado más grande, y antes el tope se quedaba corto y botaba trozos que seguían en pantalla. */
  function foco() {
    const M = typeof Game !== 'undefined' && Game.mode, R = M && M.ride; if (!R || !R.p) return null;
    return { x: R.ccx != null ? R.ccx : R.p.x, y: R.ccy != null ? R.ccy : R.p.y, a: R.p.a || 0 };
  }
  function ordenar() {
    const F = foco(); if (!F || cola.length < 2) return;
    const S = CH * TS, fx = Math.cos(F.a), fy = Math.sin(F.a);
    for (const t of cola) { const dx = (t.cx + .5) * S - F.x, dy = (t.cy + .5) * S - F.y, d = Math.hypot(dx, dy), ad = d > 1 ? (dx * fx + dy * fy) / d : 1; t.pri = d * (1 - .35 * ad); }
    cola.sort((a, b) => a.pri - b.pri);
  }
  P.ordenar = ordenar;
  /* el boceto: un dibujo del trozo en baja resolución con los MISMOS colores del suelo detallado (piso, calles, verde, monte,
     agua, ladrillo y edificios; 8 × 8 muestras del mapa de casillas, agrandadas y suavizadas). Cuesta 64 lecturas por trozo y
     no carga nada al inicio. dx, dy, dw, dh: dónde dibujarlo (el trozo entero o su lugar en el búfer de la vista) */
  const BASE = [207, 201, 188]; let PB = null, bc = null, bx = null, bi = null;
  const paleta = () => { const P = [];
    [[[TT.MOUNT], [63, 122, 60]], [[TT.GRASS, TT.CANAL, TT.LAND], [105, 168, 78]], [[TT.PLAZA, TT.WALK, TT.STEPS], [221, 211, 189]],
      [[TT.ROAD, TT.AVE, TT.AUTO, TT.BRIDGE, TT.CICLO], [142, 146, 154]], [[TT.BRICK], [169, 159, 145]], [[TT.BLDG, TT.STATION, TT.DEPOT], [159, 162, 167]],
      [[TT.WATER], [63, 134, 200]]].forEach(([vs, c]) => { for (const v of vs) if (v != null) P[v] = c; }); return P; };
  function boceto(M, ctx, cx, cy, dx, dy, dw, dh) {
    const n = 8, K = CH / n, x0 = cx * CH, y0 = cy * CH, respaldo = () => { ctx.fillStyle = '#cfc9bc'; ctx.fillRect(dx, dy, dw, dh); };
    if (typeof TT === 'undefined' || typeof M.get !== 'function' || typeof ctx.drawImage !== 'function') return respaldo();   /* sin mapa (pruebas aisladas): el respaldo de siempre */
    if (!PB) PB = paleta();
    if (!bc) { bc = document.createElement('canvas'); bc.width = bc.height = n; bx = bc.getContext('2d'); bi = bx && typeof bx.createImageData === 'function' ? bx.createImageData(n, n) : null; }
    if (!bx || !bi) return respaldo();
    const d = bi.data;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = PB[M.get(x0 + i * K + (K >> 1), y0 + j * K + (K >> 1))] || BASE, o = (j * n + i) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; }
    bx.putImageData(bi, 0, 0);
    const lisa = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = true; ctx.drawImage(bc, 0, 0, n, n, dx, dy, dw, dh); ctx.imageSmoothingEnabled = lisa;
  }
  P.boceto = boceto;
  function reanudar(ts) {
    activo = false;
    const inicio = reloj(); let n = 0; ordenar();
    /* 3.8 (Claude): un solo presupuesto por cuadro para todo el trabajo de fondo (JE.fondo, 99v): si el cuadro ya va
     * cargado, se hace una sola etapa (siempre al menos una, para no detenerse). */
    const F = JE.fondo, lim = F && F.limite ? F.limite(ts, presupuesto) : presupuesto;
    if (F && F.turno && cola.length) { if (lim <= 0 && !F.turno(ts, 'suelo', 0)) { pedir(); return; } F.paso('suelo'); }
    /* Cada paso puede consumir más de 6 ms si una operación indivisible
     * (lotes o contorno) es lenta. Se registra: no se oculta ese límite. */
    while (cola.length && (n === 0 || reloj() - inicio < lim) && n < 10) {
      const t = cola[0];
      if (!valido(t)) { cola.shift(); P.cancelados++; continue; }
      const a = reloj();
      let paso;
      if (!t.it) { const w = typeof t.ctx.drawImage === 'function' ? document.createElement('canvas') : null; if (w) w.width = w.height = t.tam; const wc = w && w.getContext('2d', { alpha: false }); if (!wc) { t.obra = null; t.it = t.fab(t.ctx); } else { wc.imageSmoothingEnabled = false; t.obra = w; t.it = t.fab(wc); } }   /* 3.10.1: el lienzo de obra nace cuando le toca (sin drawImage, se pinta directo) */
      try { paso = t.it.next(); }
      catch (e) { cola.shift(); P.errores++; P.cancelados++; if (typeof console !== 'undefined') console.error('Chunk GPT-6', e); continue; }
      const ms = reloj() - a;
      P.maxEtapaMs = Math.max(P.maxEtapaMs, ms);
      if (muestras.length >= limiteMuestras) muestras.shift();
      muestras.push(ms);
      if (paso.done) { cola.shift(); P.terminados++; if (t.obra) { t.ctx.drawImage(t.obra, 0, 0); t.obra = null; } if (P.latencias.length >= 120) P.latencias.shift(); P.latencias.push(Math.round(reloj() - t.t0)); }   /* 3.10.1: si no terminó, sigue de primero (de a uno y hasta terminarlo); al terminar, el detalle reemplaza el boceto */
      n++;
    }
    P.maxCuadroMs = Math.max(P.maxCuadroMs, reloj() - inicio);
    if (cola.length) pedir();
  }
  function pedir() {
    if (activo) return;
    activo = true;
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(reanudar);
    else setTimeout(reanudar, 0); /* navegación antigua */
  }
  CityMap.chunkG = function (cx, cy) {
    if (typeof GFX !== 'function' || GFX() === 'pixel' ||
        typeof document === 'undefined' || !document.createElement ||
        !this.chunks2 || typeof this.cq !== 'function') {
      return previa.call(this, cx, cy);
    }
    const q = this.cq(), key = cx + ',' + cy + ':' + q;
    let c = this.chunks2.get(key);
    if (c) {
      this.chunks2.delete(key); this.chunks2.set(key, c);
      return c;
    }
    c = document.createElement('canvas');
    const tam = CH * TS * q;
    c.width = tam; c.height = tam;
    const ctx = c.getContext('2d', { alpha: false });
    if (!ctx) return previa.call(this, cx, cy);
    ctx.imageSmoothingEnabled = false; boceto(this, ctx, cx, cy, 0, 0, tam, tam);   /* 3.10.1: el trozo en baja resolución mientras se arma (nunca un cuadro vacío) */
    this.chunks2.set(key, c);
    const lado = View.giro && View.gw ? View.gw : 0;   /* 3.10.1: con la cámara girada, el suelo es un cuadrado de lado gw */
    const visibles = Math.ceil(((lado || View.vw || 200) / (CH * TS) + 2) *
      ((lado || View.vh || 200) / (CH * TS) + 2));
    const max = Math.max((typeof navigator !== 'undefined' &&
      navigator.deviceMemory && navigator.deviceMemory <= 2) ? 10 : 14, visibles + 4);
    while (this.chunks2.size > max) this.chunks2.delete(this.chunks2.keys().next().value);
    const M = this; cola.push({ map: this, key, canvas: c, cx, cy, ctx, tam, t0: reloj(), it: null, obra: null, fab: w => M.drawGround3Etapas(w, cx, cy, q) });
    P.creados++;
    pedir();
    return c;
  };
})();
