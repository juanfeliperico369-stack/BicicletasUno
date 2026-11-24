/* =====================================================================
   RENDIMIENTO QUE SE NOTA (ronda 3.8, Claude) · para pasar la compuerta de publicar.yml (la prueba de GPT-6: 2 km por una
   vía real con la CPU 4× lenta, p95 < 50 ms y ningún cuadro > 120 ms). Medido con el perfilador de Chromium en ese recorrido:
   1) LA CICLORRUTA MÁS CERCANA, EN CADA CUADRO. El botón «Runner» (99p, Gemini) pregunta en cada cuadro si estás en una
      ciclorruta, y la respuesta (99r, GPT-6) proyectaba la posición sobre TODOS los segmentos de TODAS las ciclorrutas del
      valle: más del 4 % del tiempo de CPU del recorrido. Ahora hay un ÍNDICE ESPACIAL (celdas de 256 px): solo se miden las
      vías que tienen un segmento cerca. El resultado es el mismo (la vía más cercana dentro del radio está, por fuerza, en
      esas celdas); para «la más cercana del valle» se busca en anillos crecientes y, si no aparece, como antes.
   2) LOS LOTES DE LOS EDIFICIOS DE CADA TROZO NUEVO. Los edificios con volumen (draw3D) y el suelo (K-1) calculaban de una
      vez los lotes de cada trozo que entraba a la vista (de 12 a 58 ms cada uno). Ahora se calculan por partes (~3 ms) y en
      una cola, fuera del dibujo; el trozo muestra sus edificios con volumen unos cuadros después.
   3) EL GPS: el campo de distancias del jugador (68 a 84 ms) también se calcula por partes (ver abajo).
   ===================================================================== */
(function () {
  /* ---------- 0) UN SOLO PRESUPUESTO POR CUADRO para el trabajo de fondo (el suelo de los trozos K-1, los lotes y el GPS).
     Cada tarea recibe en requestAnimationFrame la hora en que empezó el cuadro (ts): si el juego y las demás tareas ya
     gastaron la meta, hace un solo paso; si el cuadro va holgado (un celular rápido, la portada), avanza hasta su propio
     tope. Así el trabajo de fondo no apila un cuadro lento sobre otro. ---------- */
  const Fondo = JE.fondo = {
    meta: 16, n: 0, ts: -1, ult: {},   /* meta: ms de JavaScript por cuadro (juego + fondo) */
    /* cuánto le queda a una tarea en este cuadro (0: solo su paso obligado, si le toca) */
    limite(ts, propio) { this.cuadro(ts); const pasado = typeof ts === 'number' && ts > 0 ? performance.now() - ts : 0; return Math.max(0, Math.min(propio, this.meta - pasado)); },
    cuadro(ts) { if (ts !== this.ts) { this.ts = ts; this.n++; } },
    /* con el cuadro ya cargado, cada tarea da un paso cuando le toca su turno (uno de cada tres cuadros) o si lleva tres
       cuadros sin avanzar: nunca se detiene y nunca se juntan los pasos de todas en el mismo cuadro */
    turno(ts, quien, slot) { this.cuadro(ts); const u = this.ult[quien]; if (this.n % 3 === slot || u == null || this.n - u >= 3) { this.ult[quien] = this.n; return true; } return false; },
    paso(quien) { this.ult[quien] = this.n; }
  };
  /* ---------- 1) índice espacial de las ciclorrutas ---------- */
  const G = JE.cicloGeoGPT6;
  if (G && G.proyectar) {
    const CELDA = 256; let idx = null, mapaIdx = null;
    const indexar = mapa => {
      idx = new Map(); mapaIdx = mapa;
      for (const via of (mapa && mapa.vias) || []) {
        if (Number(via.k) !== 5 || !via.p || via.p.length < 4) continue; const p = via.p;
        for (let i = 0; i + 3 < p.length; i += 2) {
          const x0 = Math.floor(Math.min(p[i], p[i + 2]) / CELDA), x1 = Math.floor(Math.max(p[i], p[i + 2]) / CELDA), y0 = Math.floor(Math.min(p[i + 1], p[i + 3]) / CELDA), y1 = Math.floor(Math.max(p[i + 1], p[i + 3]) / CELDA);
          for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const k = cx + ',' + cy; let L = idx.get(k); if (!L) idx.set(k, L = []); if (L[L.length - 1] !== via) L.push(via); }
        }
      }
    };
    /* la vía más cercana entre las que tienen un segmento a menos de r px */
    const cercanaEn = (mapa, pos, r) => {
      if (!idx || mapaIdx !== mapa) indexar(mapa); const vias = new Set(), c0x = Math.floor((pos.x - r) / CELDA), c1x = Math.floor((pos.x + r) / CELDA), c0y = Math.floor((pos.y - r) / CELDA), c1y = Math.floor((pos.y + r) / CELDA);
      for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) { const L = idx.get(cx + ',' + cy); if (L) for (const v of L) vias.add(v); }
      let mejor = null; for (const via of vias) { const q = G.proyectar(via, pos); if (q && (!mejor || q.distanciaPx < mejor.distanciaPx)) mejor = q; } return mejor;
    };
    const _cercana = G.cercana;
    G.cercana = function (mapa, pos) {
      if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return _cercana.call(this, mapa, pos);
      for (const r of [64, 256, 1024, 4096]) { const q = cercanaEn(mapa, pos, r); if (q && q.distanciaPx <= r) return q; }
      return _cercana.call(this, mapa, pos);
    };
    G.acceso = function (mapa, pos, radio = 12) {
      if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return null;
      const q = cercanaEn(mapa, pos, radio / M_PER_PX + 2); return q && q.distanciaMetros <= radio ? q : null;
    };
    G.indice = () => (idx ? idx.size : 0);
  }
  /* ---------- 3) EL GPS SIN TIRONES · el campo de distancias (CityMap.flow, algoritmo de Dial sobre una ventana de hasta
     cientos de miles de casillas) tardaba de 68 a 84 ms con la CPU 4× lenta cada vez que había que recalcularlo: un tirón
     al marcar un destino y al salirse de la ventana. Para la flecha del GPS del jugador (Ride.calcGps) ahora se calcula
     por partes, 4 ms por cuadro, y mientras tanto se sigue viendo la ruta anterior. Los bots, el mapa grande y las carreras
     siguen con el cálculo de siempre (CityMap.flow, el mismo campo y el mismo caché). ---------- */
  const CM = typeof CityMap !== 'undefined' ? CityMap : null;
  if (CM && CM.flow && CM.flows) {
    CM.flowListo = function (tx, ty, truck, fx, fy) {
      tx = clamp(tx | 0, 0, MW - 1); ty = clamp(ty | 0, 0, MH - 1); const ok0 = v => truck ? TRUCK_OK[v] : !SOLID[v];
      if (!ok0(this.get(tx, ty))) { const n = this.nearestOpen(tx, ty, truck); tx = n.x; ty = n.y; }
      fx = clamp(fx | 0, 0, MW - 1); fy = clamp(fy | 0, 0, MH - 1); const kb = tx + ',' + ty + (truck ? 't' : 'b');
      for (const [k, F] of this.flows) if (k.startsWith(kb + '|') && fx > F.x0 + 4 && fy > F.y0 + 4 && fx < F.x0 + F.w - 5 && fy < F.y0 + F.h - 5) return F;   /* ya está: el de siempre lo encontrará */
      const J = this._fj; if (J && J.kb === kb && fx > J.x0 + 4 && fy > J.y0 + 4 && fx < J.x0 + J.w - 5 && fy < J.y0 + J.h - 5) return null;   /* calculándose */
      const m = Math.round(90 * MS), x0 = clamp(Math.min(tx, fx) - m, 0, MW - 1), y0 = clamp(Math.min(ty, fy) - m, 0, MH - 1), x1 = clamp(Math.max(tx, fx) + m, 0, MW - 1), y1 = clamp(Math.max(ty, fy) + m, 0, MH - 1);
      const w = x1 - x0 + 1, h = y1 - y0 + 1, D = new Int32Array(w * h).fill(1e9), buckets = [], s = (ty - y0) * w + (tx - x0); D[s] = 0; buckets[0] = [s];
      this._fj = { kb, x0, y0, w, h, D, buckets, cur: 0, maxB: 0, truck }; this._fjVez = (this._fjVez | 0) + 1; const vez = this._fjVez;
      const paso = ts => {
        const Jb = this._fj; if (!Jb || vez !== this._fjVez) return; const t0 = performance.now(), lim = Fondo.limite(ts, 4);
        if (lim <= 0 && !Fondo.turno(ts, 'gps', 2)) return requestAnimationFrame(paso); Fondo.paso('gps'); const T = this.t, cost = v => Jb.truck ? (TRUCK_OK[v] ? (v === TT.AUTO ? 2 : 3) : 0) : PATHC[v]; let n = 0;
        while (Jb.cur <= Jb.maxB + 8) {
          const B = Jb.buckets[Jb.cur]; if (!B || !B.length) { Jb.cur++; continue; } const i = B.pop(); if (Jb.D[i] !== Jb.cur) continue;
          const x = i % Jb.w, y = (i / Jb.w) | 0;
          for (let k = 0; k < 4; k++) { const nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0); if (nx < 0 || ny < 0 || nx >= Jb.w || ny >= Jb.h) continue;
            const j = ny * Jb.w + nx, c = cost(T[(ny + Jb.y0) * MW + nx + Jb.x0]); if (!c) continue; const nd = Jb.cur + c; if (nd < Jb.D[j]) { Jb.D[j] = nd; (Jb.buckets[nd] || (Jb.buckets[nd] = [])).push(j); if (nd > Jb.maxB) Jb.maxB = nd; } }
          if ((++n & 1023) === 0 && performance.now() - t0 > lim) return requestAnimationFrame(paso);
        }
        const F = { D: Jb.D, x0: Jb.x0, y0: Jb.y0, w: Jb.w, h: Jb.h }; this.flows.set(Jb.kb + '|' + Jb.x0 + ',' + Jb.y0 + ',' + Jb.w + ',' + Jb.h, F); if (this.flows.size > 10) this.flows.delete(this.flows.keys().next().value);
        this._fj = null; this.flowsPorPartes = (this.flowsPorPartes | 0) + 1;
      };
      requestAnimationFrame(paso); return null;
    };
    const _gps = Ride.prototype.calcGps;
    Ride.prototype.calcGps = function () {
      const T = this.way || this.target; if (!T || JE.headless || !this.mode || this.mode.ride !== this) return _gps.apply(this, arguments);
      const F = this.map.flowListo(Math.floor(T.x / TS), Math.floor(T.y / TS), vehVia(this.p.veh), Math.floor(this.p.x / TS), Math.floor(this.p.y / TS));
      if (!F) { if (this._gpsPara !== T) { this._gpsPara = T; this.gps = []; } return; }   /* calculándose: la ruta anterior sigue (salvo si cambió el destino) */
      this._gpsPara = T; return _gps.apply(this, arguments);
    };
  }
  /* ---------- 2) LOS LOTES DE LOS EDIFICIOS, POR PARTES Y FUERA DEL DIBUJO. Los edificios con volumen (draw3D) ya no calculan
     en medio del dibujo los lotes de un trozo nuevo: los piden a una cola que avanza ~4 ms por cuadro con el cálculo por partes
     (CityMap.lotesEtapas, 75-graficos) y, mientras tanto, ese trozo se dibuja sin volumen (el suelo de ese trozo ya los muestra
     desde arriba). El dibujo del suelo (K-1) también los calcula por partes. Si dos piden el mismo trozo, se continúa el
     cálculo empezado: nunca se hace dos veces. En las pruebas sin pantalla (JE.headless) todo sigue de una vez. ---------- */
  if (CM && CM.lotesEtapas && CM.lotC) {
    const pend = new Map(), _le = CM.lotesEtapas; let activo = false;
    CM.lotesEtapas = function* (cx, cy) { const k = cx + ',' + cy, it = pend.get(k); if (it) { pend.delete(k); return yield* it; } return yield* _le.call(this, cx, cy); };
    const trabajar = ts => {
      activo = false; const t0 = performance.now(), lim = Fondo.limite(ts, 4); let n = 0;
      if (lim <= 0 && !Fondo.turno(ts, 'lotes', 1)) return programar(); Fondo.paso('lotes');
      while (pend.size && (n++ === 0 || performance.now() - t0 < lim)) {
        const [k, it] = pend.entries().next().value; let r;
        try { r = it.next(); } catch (e) { pend.delete(k); JE.errors.push('lotes ' + k + ': ' + e.message); continue; }
        if (r.done) { pend.delete(k); JE.lotesPorPartes = (JE.lotesPorPartes | 0) + 1; }
      }
      if (pend.size) programar();
    };
    const programar = () => { if (!activo) { activo = true; requestAnimationFrame(trabajar); } };
    CM.lotesPedir = function (cx, cy) {
      const k = cx + ',' + cy; if (this.lotC.has(k) || pend.has(k)) return;
      pend.set(k, _le.call(this, cx, cy)); while (pend.size > 16) pend.delete(pend.keys().next().value);   /* los más viejos ya salieron de la vista */
      programar();
    };
    CM.lotesPendientes = () => pend.size;
    const VACIO = Object.freeze({ all: Object.freeze([]), ed: Object.freeze([]), casas: Object.freeze([]) });
    const _d3 = Ride.prototype.draw3D;
    Ride.prototype.draw3D = function () {
      const M = this.map; if (!M || !M.lotC || !M.lotesPedir || JE.headless) return _d3.apply(this, arguments);
      const lotes = M.lotes;
      M.lotes = function (cx, cy) { if (this.lotC.has(cx + ',' + cy)) return lotes.call(this, cx, cy); this.lotesPedir(cx, cy); JE.lotesDiferidos = (JE.lotesDiferidos | 0) + 1; return VACIO; };
      try { return _d3.apply(this, arguments); } finally { M.lotes = lotes; }
    };
  }
  /* ---------- 4) EL SUELO SE RASTERIZA DENTRO DEL PRESUPUESTO. Canvas graba las órdenes de dibujo y las rasteriza después,
     de una vez, cuando el trozo se pinta en la pantalla: con la CPU 4× lenta, el primer drawImage de un trozo nuevo costaba
     de 28 a 52 ms, fuera de toda cuenta (el presupuesto de K-1 solo medía la grabación, ~11 ms por trozo). Ahora, tras cada
     etapa, se pinta el trozo en un lienzo de 1×1 (sin leer píxeles): eso obliga a rasterizar lo grabado en ese momento y
     el tiempo cae dentro de la etapa, que sí se cuenta. Con GPU es solo una copia. El dibujo de una vez (drawGround3) no
     cambia. ---------- */
  if (CM && CM.drawGround3Etapas && CM.drawGround3 && typeof document !== 'undefined') {
    const _dge = CM.drawGround3Etapas, _dg3 = CM.drawGround3; let mini = null, deUnaVez = 0;
    const volcar = c => { try { if (!mini) { const cv = document.createElement('canvas'); cv.width = cv.height = 1; mini = cv.getContext('2d'); mini.imageSmoothingEnabled = false; } mini.drawImage(c.canvas, 0, 0, 1, 1); mini.clearRect(0, 0, 1, 1); } catch (e) { } };
    CM.drawGround3Etapas = function* (c, cx, cy, q) {
      const it = _dge.call(this, c, cx, cy, q); if (deUnaVez || JE.headless || !c || !c.canvas) return yield* it;
      for (;;) { const r = it.next(); volcar(c); if (r.done) return r.value; yield r.value; }
    };
    CM.drawGround3 = function () { deUnaVez++; try { return _dg3.apply(this, arguments); } finally { deUnaVez--; } };
  }
})();
