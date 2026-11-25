/* =====================================================================
   PORTADA VIVA (3.9.1 · Claude, 25‑nov‑2026): el panel animado de la portada sale en el primer instante
   El autor: «EnCicla tiene un bug en la pantalla de inicio y es que no carga el panel de la animación».
   La causa: el mapa del Valle se arma de un solo tirón antes de UI.init (8,6 s medidos con el CPU 4×, como un celular modesto)
   y la animación de la portada solo arrancaba al final, así que el panel quedaba en blanco todo ese rato.
   Ahora, antes de armar el mapa (99-boot.js):
   - se dibujan los 10 cuadros de un ciclo de la portada (medio segundo: las rayas de la ciclorruta y de la calle y las piernas
     del ciclista; el tren todavía no ha entrado) en una tira;
   - la tira se anima con una transformación en pasos (CSS): la mueve el compositor, aunque el hilo principal esté ocupado
     armando el mapa;
   - una píldora dice «Cargando el valle…», y si tocas un botón antes de tiempo, se hace en cuanto el juego queda listo.
   Cuando UI.init arranca el lienzo de siempre (con el tren), la tira se va. Sin el compositor (o con «menos movimiento»), queda
   el primer cuadro quieto: nunca en blanco.
   ===================================================================== */
const PortadaViva = JE.portadaViva = {
  N: 10, P: .5, el: null, pil: null, pedido: null, listo: false,
  empezar() {
    const cv = $('#coverArt'), caja = cv && cv.parentElement; if (!cv || !caja || this.el) return false;
    const W = cv.width, H = cv.height, N = this.N, F = H + 2, tira = document.createElement('canvas'); tira.width = W; tira.height = F * N;
    const x = tira.getContext('2d'); x.imageSmoothingEnabled = false;
    for (let k = 0; k < N; k++) {
      /* cada cuadro con una fila de margen arriba y abajo (copia de su propio borde): el paso del compositor nunca muestra un hilo del vecino */
      x.save(); x.translate(0, k * F + 1); x.beginPath(); x.rect(0, 0, W, H); x.clip(); Art.cover(x, W, H, k * this.P / N); x.restore();
      x.drawImage(tira, 0, k * F + 1, W, 1, 0, k * F, W, 1); x.drawImage(tira, 0, k * F + H, W, 1, 0, k * F + H + 1, W, 1);
    }
    const c0 = cv.getContext('2d'); c0.imageSmoothingEnabled = false; c0.drawImage(tira, 0, 1, W, H, 0, 0, W, H);   /* el lienzo de siempre ya no está en blanco */
    const d = this.el = document.createElement('div'); d.id = 'portadaViva';
    tira.setAttribute('aria-hidden', 'true'); tira.style.height = (N * F / H * 100) + '%'; tira.style.top = (-100 / H) + '%'; tira.style.animationDuration = this.P + 's'; tira.style.animationTimingFunction = 'steps(' + N + ')';
    const pil = this.pil = document.createElement('div'); pil.id = 'portadaCarga'; pil.setAttribute('role', 'status'); pil.innerHTML = '<span>Cargando el valle…</span><i></i>';
    d.appendChild(tira); d.appendChild(pil); cv.after(d);
    const pon = () => { if (!this.el) return; const s = d.style; s.left = (cv.offsetLeft + cv.clientLeft) + 'px'; s.top = (cv.offsetTop + cv.clientTop) + 'px'; s.width = cv.clientWidth + 'px'; s.height = cv.clientHeight + 'px'; s.borderRadius = getComputedStyle(cv).borderRadius; };
    /* sigue al lienzo en cada cuadro que el hilo principal pueda dibujar (también cuando UI.init suma botones y la portada se corre):
       se acomoda antes de pintar, así que nunca queda corrida */
    const sigue = () => { if (this.el !== d) return; pon(); requestAnimationFrame(sigue); }; sigue();
    const v = $('#ver'); if (v) v.textContent = 'v' + JE.version;
    /* un toque antes de tiempo no se pierde: se hace en cuanto el juego queda listo */
    this.tapa = e => { if (this.listo) return; const b = e.target && e.target.closest && e.target.closest('#sCover button'); if (!b || !b.id) return; e.preventDefault(); e.stopImmediatePropagation(); this.pedido = b.id; pil.firstChild.textContent = 'Ya casi: abre en cuanto cargue'; };
    document.addEventListener('click', this.tapa, true);
    JE.arranque.portada = Math.round(performance.now());
    return true;
  },
  /* UI.init ya corrió: los botones tienen su función y el lienzo de siempre se anima */
  terminar() {
    this.listo = true; document.removeEventListener('click', this.tapa, true);
    const d = this.el, p = this.pedido; this.pedido = null;
    if (d) {
      /* dos cuadros después, el lienzo de siempre ya dibujó: la tira se desvanece sin parpadeo */
      requestAnimationFrame(() => requestAnimationFrame(() => { d.classList.add('fuera'); setTimeout(() => { d.remove(); if (this.el === d) this.el = null; }, 320); }));
    }
    if (p) { const b = document.getElementById(p); if (b) b.click(); }
  }
};
