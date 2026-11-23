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
    version: '3.6', presupuestoMs: presupuesto, creados: 0, terminados: 0,
    cancelados: 0, errores: 0, maxEtapaMs: 0, maxCuadroMs: 0,
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
  function reanudar() {
    activo = false;
    const inicio = reloj(); let n = 0;
    /* Cada paso puede consumir más de 6 ms si una operación indivisible
     * (lotes o contorno) es lenta. Se registra: no se oculta ese límite. */
    while (cola.length && reloj() - inicio < presupuesto && n < 10) {
      const t = cola.shift();
      if (!valido(t)) { P.cancelados++; continue; }
      const a = reloj();
      let paso;
      try { paso = t.it.next(); }
      catch (e) { P.errores++; P.cancelados++; if (typeof console !== 'undefined') console.error('Chunk GPT-6', e); continue; }
      const ms = reloj() - a;
      P.maxEtapaMs = Math.max(P.maxEtapaMs, ms);
      if (muestras.length >= limiteMuestras) muestras.shift();
      muestras.push(ms);
      if (paso.done) P.terminados++;
      else cola.push(t);
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
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#cfc9bc';
    ctx.fillRect(0, 0, tam, tam); /* respaldo, antes de la primera fase */
    this.chunks2.set(key, c);
    const visibles = Math.ceil(((View.vw || 200) / (CH * TS) + 2) *
      ((View.vh || 200) / (CH * TS) + 2));
    const max = Math.max((typeof navigator !== 'undefined' &&
      navigator.deviceMemory && navigator.deviceMemory <= 2) ? 10 : 14, visibles + 4);
    while (this.chunks2.size > max) this.chunks2.delete(this.chunks2.keys().next().value);
    cola.push({ map: this, key, canvas: c, it: this.drawGround3Etapas(ctx, cx, cy, q) });
    P.creados++;
    pedir();
    return c;
  };
})();
