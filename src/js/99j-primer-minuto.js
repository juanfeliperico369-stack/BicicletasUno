/* =====================================================================
   EL PRIMER MINUTO FLUIDO (ronda 3.3, Claude) · medido con el perfilador de Chromium y la CPU 4× lenta: cada trozo de ciudad
   (160 m) tarda de 24 a 89 ms en dibujarse (mediana ~45 ms; un cuarto de eso son los lotes de los edificios) y el PRIMER cuadro
   del valle dibujaba todos los trozos visibles de una vez: un tirón de varios cientos de ms justo al empezar.
   1) PRECALENTAR: mientras estás en el menú (o leyendo el briefing), se dibujan los trozos de tu estación de salida, uno por
      rato libre (requestIdleCallback; en iOS, setTimeout): al tocar «Jugar» ya están listos.
   2) UN TROZO A LA VEZ: el adelanto en el tiempo libre (99a-fluidez.js) espera si en los últimos 80 ms ya se dibujó otro
      (antes podían caer dos en el mismo cuadro: el visible y el adelantado).
   ===================================================================== */
const Precalentar = JE.precalentar = {
  cola: [], activo: false, hechos: 0,
  /* los trozos alrededor de (x, y), del más cercano al más lejano */
  pedir(x, y, r = 1) {
    const S = CH * TS, c0 = Math.floor(x / S), r0 = Math.floor(y / S), L = [];
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const cx = c0 + dx, cy = r0 + dy; if (cx >= 0 && cy >= 0 && cx * CH < MW && cy * CH < MH) L.push([cx, cy, dx * dx + dy * dy]); }
    L.sort((a, b) => a[2] - b[2]); this.cola = L; this.seguir();
  },
  seguir() {
    if (this.activo || !this.cola.length || JE.headless) return; this.activo = true;
    const paso = () => {
      this.activo = false; const M = JE.map; if (!M || !M.chunkG) return;
      if (Game.mode && Game.mode.ride && !Game.paused && performance.now() - (M._ultTrozo || 0) < 80) return this.seguir();   // jugando: no dos trozos seguidos
      const k = this.cola.shift(); if (k && !M.hasG(k[0], k[1])) try { M.chunkG(k[0], k[1]); this.hechos++; } catch (e) { JE.errors.push('precalentar: ' + e.message); }
      if (this.cola.length) this.seguir();
    };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(paso, { timeout: 2500 }); else setTimeout(paso, 120);
  },
  /* la estación de salida del modo libre (69-libre.js: homeStation) */
  salida() { try { if (typeof homeStation === 'function' && JE.map) { const h = homeStation(); if (h) this.pedir(h.x, h.y + 10 * WK, 1); } } catch (e) { } }
};
(function () {
  /* la hora del último trozo dibujado: así nadie dibuja otro encima en el mismo cuadro */
  if (typeof CityMap !== 'undefined' && CityMap.chunkG) {
    const _g = CityMap.chunkG;
    CityMap.chunkG = function (cx, cy) { const nuevo = !this.hasG(cx, cy), r = _g.call(this, cx, cy); if (nuevo) this._ultTrozo = performance.now(); return r; };
  }
  if (typeof Fluidez !== 'undefined' && Fluidez.previo) {
    const _p = Fluidez.previo;
    Fluidez.previo = function (R) { const M = JE.map; if (M && performance.now() - (M._ultTrozo || 0) < 80) return; return _p.call(this, R); };
  }
  /* en el menú: precalentar la salida del valle */
  const _go = UI.go;
  UI.go = function (id) { const r = _go.apply(this, arguments); if (id === 'sHome' && !Game.mode) setTimeout(() => Precalentar.salida(), 400); return r; };
  const _brief = UI.brief;
  if (_brief) UI.brief = function (roleId) { const r = _brief.apply(this, arguments); if (roleId === 'usuario') Precalentar.salida(); return r; };
  if (JE.ready) setTimeout(() => Precalentar.salida(), 800); else addEventListener('load', () => setTimeout(() => Precalentar.salida(), 1200));
})();
