/* =====================================================================
   SPRITES · imágenes de arte (de Gemini, ChatGPT o un artista) dentro del motor, sin romper nada
   - ATLAS: una imagen con muchos cuadros y su mapa { nombre: [x, y, w, h, ancla_x, ancla_y] }. Una sola textura =
     menos cambios de estado y dibujo más rápido (como los «sprite sheets» de todos los motores 2D).
   - ANIMACIONES por tiempo o por la FASE del cuerpo (los pies del sprite van al ritmo real del paso o del pedal).
   - DIRECCIONES: 1, 2 (espejo), 4 u 8 direcciones según el rumbo y la cámara (los juegos isométricos y cenitales).
   - ESCALA REAL: cada sprite dice cuánto mide en metros (MC.Escala): se ve proporcionado en cualquier zoom.
   - PIXEL ART: dibujo sin suavizado y en píxeles enteros cuando la vista está en pixel.
   - NUEVE PARTES (9‑slice) para marcos de interfaz que se estiran sin deformar las esquinas.
   - FONDO MAGENTA: si la herramienta de arte no da transparencia, el magenta plano (#ff00ff) se vuelve transparente.
   - RESPALDO PROCEDURAL: si un sprite no está (o no ha cargado), se dibuja el del motor. El arte nuevo nunca rompe el juego.
   - HORNEAR: cualquier dibujo procedural se puede «hornear» a un atlas al arrancar (dibujar una imagen es más barato
     que repetir cien trazos cada cuadro).
   Uso: MC.Sprites.atlas('encicla', { imagen: 'data:image/png;base64,…', cuadros: {...}, anim: {...}, metros: { bici: 1.75 } })
        MC.Sprites.dibujar(g, 'encicla/bici_lado', x, y, pxPorMetro, { t, fase, rumbo, camara, espejo, pixel })
   ===================================================================== */
const Sprites = {
  atlases: new Map(), faltan: new Set(),
  /* registra un atlas; imagen: dataURL, URL local, <img> o <canvas> */
  atlas(id, def) {
    const A = { id, cuadros: def.cuadros || {}, anim: def.anim || {}, metros: def.metros || {}, img: null, listo: false, magenta: def.magenta !== false };
    let terminar;
    A.carga = new Promise(resolver => { terminar = resolver; });
    const fin = img => { A.img = A.magenta ? Sprites._sinMagenta(img) : img; A.listo = true; terminar(true); MC.emit('sprites', id); };
    if (def.imagen && typeof def.imagen === 'object') fin(def.imagen);
    else if (def.imagen && typeof Image !== 'undefined') { const im = new Image(); im.onload = () => fin(im); im.onerror = () => { terminar(false); MC.falla('sprites', 'no cargó ' + id); }; im.src = def.imagen; }
    else terminar(false);
    this.atlases.set(id, A); return A;
  },
  /* el magenta plano se vuelve transparente (con borde suave para el antialias) */
  _sinMagenta(img) {
    if (typeof document === 'undefined') return img; try {
      const c = lienzo(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) { const r = p[i], gg = p[i + 1], b = p[i + 2], dist = Math.abs(r - 255) + gg + Math.abs(b - 255); if (dist < 60) p[i + 3] = 0; else if (dist < 140 && r > 180 && b > 180 && gg < 110) p[i + 3] = Math.min(p[i + 3], (dist - 60) * 3); }
      g.putImageData(d, 0, 0); return c; } catch (e) { return img; }
  },
  /* busca el cuadro: 'atlas/nombre'; con animación (por tiempo o fase) y dirección */
  cuadro(ref, op = {}) {
    const [aid, nombre] = ref.includes('/') ? ref.split('/') : [null, ref], A = aid ? this.atlases.get(aid) : null; if (!A || !A.listo) { this.faltan.add(ref); return null; }
    let n = nombre; const an = A.anim[nombre];
    if (an) { const L = an.cuadros, i = op.fase != null && an.porFase ? Math.floor(((op.fase / TAU) % 1 + 1) % 1 * L.length) : Math.floor((op.t || 0) * (an.fps || 8)); n = an.bucle === false ? L[Math.min(L.length - 1, i)] : L[((i % L.length) + L.length) % L.length]; }
    /* direcciones: nombre_N, _NE, … (8) o _arriba/_abajo/_izq/_der (4) según el rumbo visto desde la cámara */
    if (op.rumbo != null) { const a = (((op.rumbo + (op.camara || 0)) % TAU) + TAU) % TAU;
      const D8 = ['E', 'SE', 'S', 'SO', 'O', 'NO', 'N', 'NE'], d8 = D8[Math.round(a / (TAU / 8)) % 8]; if (A.cuadros[n + '_' + d8]) n = n + '_' + d8;
      else { const D4 = ['der', 'abajo', 'izq', 'arriba'], d4 = D4[Math.round(a / (TAU / 4)) % 4]; if (A.cuadros[n + '_' + d4]) n = n + '_' + d4; } }
    const c = A.cuadros[n]; if (!c) { this.faltan.add(ref); return null; } return { A, c, metros: A.metros[nombre] || A.metros[n] || c[6] || null };
  },
  tiene(ref) { return !!this.cuadro(ref); },
  /* dibuja con el ancla en (x, y) (normalmente los pies); alto real en metros × pxPorMetro */
  dibujar(g, ref, x, y, pxm, op = {}) {
    const q = this.cuadro(ref, op); if (!q) { if (op.respaldo) op.respaldo(g, x, y, pxm); return false; }
    const [sx, sy, sw, sh, ax = sw / 2, ay = sh] = q.c, altoM = op.metros || q.metros || 1.7, k = altoM * pxm / sh, espejo = op.espejo || (op.dir != null && op.dir < 0);
    g.save(); if (op.pixel) g.imageSmoothingEnabled = false; if (op.alfa != null) g.globalAlpha *= op.alfa;
    let dx = x - ax * k, dy = y - ay * k, dw = sw * k, dh = sh * k; if (op.pixel) { dx = Math.round(dx); dy = Math.round(dy); dw = Math.max(1, Math.round(dw)); dh = Math.max(1, Math.round(dh)); }
    if (espejo) { g.translate(x, 0); g.scale(-1, 1); g.translate(-x, 0); }
    if (op.rot) { g.translate(x, y); g.rotate(op.rot); g.translate(-x, -y); }
    g.drawImage(q.A.img, sx, sy, sw, sh, dx, dy, dw, dh); g.restore(); return true;
  },
  /* marco de nueve partes: b = borde en px del atlas */
  nueve(g, ref, x, y, w, h, b = 8) {
    const q = this.cuadro(ref); if (!q) return false; const [sx, sy, sw, sh] = q.c, I = q.A.img, cw = sw - 2 * b, ch = sh - 2 * b;
    const P = [[0, 0, b, b, 0, 0, b, b], [b, 0, cw, b, b, 0, w - 2 * b, b], [sw - b, 0, b, b, w - b, 0, b, b], [0, b, b, ch, 0, b, b, h - 2 * b], [b, b, cw, ch, b, b, w - 2 * b, h - 2 * b], [sw - b, b, b, ch, w - b, b, b, h - 2 * b], [0, sh - b, b, b, 0, h - b, b, b], [b, sh - b, cw, b, b, h - b, w - 2 * b, b], [sw - b, sh - b, b, b, w - b, h - b, b, b]];
    for (const [ax, ay, aw, ah, bx, by, bw, bh] of P) if (aw > 0 && ah > 0 && bw > 0 && bh > 0) g.drawImage(I, sx + ax, sy + ay, aw, ah, x + bx, y + by, bw, bh); return true;
  },
  /* hornea dibujos procedurales a un atlas: lista [{ nombre, w, h, ancla:[ax,ay], metros, dibujar(g, w, h) }] */
  hornear(id, lista) {
    if (typeof document === 'undefined') return null; let W = 0, H = 0, x = 0, y = 0, fila = 0; const lado = 1024, pos = [];
    for (const it of lista) { if (x + it.w > lado) { x = 0; y += fila + 2; fila = 0; } pos.push([x, y]); x += it.w + 2; fila = Math.max(fila, it.h); W = Math.max(W, x); }
    H = y + fila; const c = lienzo(Math.max(1, W), Math.max(1, H)), g = c.getContext('2d'), cuadros = {}, metros = {};
    lista.forEach((it, i) => { const [px, py] = pos[i]; g.save(); g.translate(px, py); g.beginPath(); g.rect(0, 0, it.w, it.h); g.clip(); it.dibujar(g, it.w, it.h); g.restore(); cuadros[it.nombre] = [px, py, it.w, it.h, ...(it.ancla || [it.w / 2, it.h])]; if (it.metros) metros[it.nombre] = it.metros; });
    return this.atlas(id, { imagen: c, cuadros, metros, magenta: false });
  },
  /* pieles de arte hechas con sprites: MC.arte.registrar(juego, MC.Sprites.comoArte('encicla', { personaje: 'persona', bici: 'bici' })) */
  comoArte(aid, mapa) {
    const piel = {};
    if (mapa.personaje) piel.personajeLado = (g, J, A, x, y, pxm, dir) => Sprites.dibujar(g, aid + '/' + mapa.personaje + '_' + (J.estado || 'quieto'), x, y, pxm, { fase: J.fase, dir, metros: A.alto || 1.7, respaldo: () => MC.arte.pieles.motor.personajeLado && MC.arte.pieles.motor.personajeLado(g, J, A, x, y, pxm, dir) });
    if (mapa.vehiculos) piel.vehiculoLado = (g, V, x, y, pxm, dir, C) => Sprites.dibujar(g, aid + '/' + (mapa.vehiculos[V.id] || V.id), x, y, pxm, { dir, metros: MC.Escala ? MC.Escala.alto(V) : 1.2, fase: C && C.fase, respaldo: () => MC.arte.pieles.motor.vehiculoLado && MC.arte.pieles.motor.vehiculoLado(g, V, x, y, pxm, dir, C) });
    return piel;
  }
};
MC.Sprites = Sprites;
