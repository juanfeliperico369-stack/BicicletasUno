/* K-2 · OpenAI GPT-6/Codex · fondos laterales opcionales. Sin red. */
(function () {
  'use strict';
  const paquetes = typeof CAPAS_EMBEBIDAS !== 'undefined' ? CAPAS_EMBEBIDAS : {};
  const imagenes = {}, carga = {};
  if (typeof Image === 'undefined' || typeof document === 'undefined') {
    JE.capas = { tiene: () => false, dibujar: () => false, corredor: () => false };
    return;
  }
  const preparar = (uri, clave) => {
    const i = new Image();
    carga[clave] = false;
    i.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
        const b = c.getContext('2d', { willReadFrequently: true });
        b.drawImage(i, 0, 0);
        const pix = b.getImageData(0, 0, c.width, c.height), a = pix.data;
        /* Chroma key exacta #FF00FF; WebP comprimido sin pérdidas al construir. */
        for (let k = 0; k < a.length; k += 4) if (a[k] === 255 && a[k + 1] === 0 && a[k + 2] === 255) a[k + 3] = 0;
        b.putImageData(pix, 0, 0); imagenes[clave] = c; carga[clave] = true;
      } catch (e) { imagenes[clave] = i; carga[clave] = true; }
    };
    i.onerror = () => { carga[clave] = false; };
    i.src = uri;
  };
  for (const id of Object.keys(paquetes)) {
    if (Array.isArray(paquetes[id])) paquetes[id].forEach((uri, k) => preparar(uri, id + ':' + k));
    else preparar(paquetes[id], id);
  }
  JE.capas = {
    tiene(id) { return Array.isArray(paquetes[id]) && paquetes[id].length === 4 && [0,1,2,3].every(k => carga[id + ':' + k]); },
    /* 3.8 (Claude, revisión de las capturas de 412×860 que pide CLAUDE.md): la capa 1 es un cielo OPACO de franjas planas
     * (crema/azul, rojo/naranja); estirada al alto del celular tapaba el cielo degradado que ya pinta cada modo y dejaba
     * un borde duro a media pantalla. Por defecto se dibujan las capas 2 a 4 (con transparencia) sobre el cielo del modo;
     * quien no tenga cielo propio pide { conCielo: true }. */
    dibujar(b, id, metros, w, h, o) {
      if (!this.tiene(id) || !b || typeof b.drawImage !== 'function') return false;
      w = w || (b.canvas && b.canvas.width) || 400; h = h || (b.canvas && b.canvas.height) || 240;
      const fac = [.02, .065, .16, .33], x0 = Number.isFinite(metros) ? metros : 0;
      b.save(); b.imageSmoothingEnabled = false;
      for (let i = o && o.conCielo ? 0 : 1; i < 4; i++) {
        const img = imagenes[id + ':' + i];
        if (!img) continue;
        const ancho = h * img.width / img.height, salto = Math.max(ancho, 1);
        let x = -((x0 * fac[i]) % salto);
        if (x > 0) x -= salto;
        for (; x < w; x += salto) b.drawImage(img, Math.floor(x), 0, Math.ceil(ancho), h);
      }
      b.restore(); return true;
    },
    corredor(b, estado, x, y, w = 22, h = 29) {
      const img = imagenes.corredor; if (!carga.corredor || !img) return false;
      const col = estado.tropT > 0 ? 2 : estado.suelo ? ((estado.pasos * 6 | 0) % 4) : ((estado.vy > 0) ? 1 : 2);
      const fila = estado.desliza > 0 ? 2 : estado.suelo ? 0 : 1;
      b.save(); b.imageSmoothingEnabled = false;
      b.drawImage(img, col * img.width / 4, fila * img.height / 4,
        img.width / 4, img.height / 4, x - w / 2, y - h, w, h);
      b.restore(); return true;
    },
    activos() { return Object.keys(paquetes).filter(id => Array.isArray(paquetes[id]) ? this.tiene(id) : !!carga[id]); }
  };
})();
