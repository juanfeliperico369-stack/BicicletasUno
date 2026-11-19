/* =====================================================================
   GESTOR DE VISTAS · todas las dimensiones de vista del motor con un solo botón
   cenital · ciudad 3D (oblicua) · maqueta 2:1 · panorámica (de perfil) · tercera persona · primera persona · dron · cine
   + PIXEL en cualquiera de ellas (la misma escena en un búfer pequeño, agrandada sin suavizado).
   - Canvas 2D es la base (anda en todo); WebGL es la mejora (si falta, la 3D cae a la ciudad 3D oblicua).
   - Transición suave entre vistas en el mismo punto (fundido con la vista anterior).
   - Calidad automática: mide el tiempo de cada cuadro y sube o baja el detalle (tráfico, edificios, resolución).
   ===================================================================== */
const VISTAS = [
  { id: 'cenital', n: 'Cenital', icon: '🗺️', tipo: '2d', modo: 'cenital', control: 'mundo' },
  { id: 'ciudad3d', n: 'Ciudad 3D', icon: '🏙️', tipo: '2d', modo: 'oblicua', control: 'mundo' },
  { id: 'maqueta', n: 'Maqueta 2:1', icon: '🧊', tipo: '2d', modo: 'maqueta', control: 'mundo' },
  { id: 'pano', n: 'Panorámica', icon: '🎬', tipo: 'pano', control: 'pano' },
  { id: 'tercera', n: 'Tercera persona', icon: '🎮', tipo: 'gl', perfil: 'tercera', control: 'volante' },
  { id: 'primera', n: 'Primera persona', icon: '👁️', tipo: 'gl', perfil: 'primera', control: 'volante' },
  { id: 'dron', n: 'Dron', icon: '🚁', tipo: 'gl', perfil: 'dron', control: 'volante' },
  { id: 'cine', n: 'Cine', icon: '🎥', tipo: 'gl', perfil: 'cine', control: 'volante' }
];
class Vistas {
  constructor(mundo, op = {}) {
    this.mundo = mundo; this.losas = new Losas(mundo); this.losasLejos = new Losas(mundo, { lado: 1280, max: 40 }); this.pano = new Panoramica(mundo); this.gl = null; this.glIntentado = false;
    this.actual = VISTAS[0]; this.anterior = null; this.pixel = false; this.escalaPixel = op.escalaPixel || 3; this.calidad = op.calidad ?? .85; this.auto = op.auto !== false; this.ms = 16; this.dpr = 1; this.fundido = null; this._buf = null;
  }
  lista() { return VISTAS.map(v => Object.assign({ disponible: v.tipo !== 'gl' || this.hayGL() }, v)); }
  hayGL() { if (!this.glIntentado) { this.glIntentado = true; try { this.gl = new VistaGL(this.mundo, this.losas); if (!this.gl.ok) this.gl = null; } catch (e) { this.gl = null; MC.falla('WebGL', e); } } return !!this.gl; }
  /* cambia de vista (por id) con transición; la cámara toma el perfil de la nueva */
  usar(id, E) {
    let v = VISTAS.find(q => q.id === id) || VISTAS[0]; if (v.tipo === 'gl' && !this.hayGL()) v = VISTAS[1];
    if (v === this.actual) return v; this.anterior = this.actual; this.actual = v;
    if (this._ultimo) { this.fundido = { cv: this._copia(this._ultimo), t: 0 }; }
    if (E && E.camara) { if (v.perfil) E.camara.usarPerfil(v.perfil); if (v.modo === 'oblicua' && E.camara.pitch < .3) E.camara.pitch = .62; if (v.id === 'maqueta') E.camara.zoom = Math.max(E.camara.zoom, 1.2); }
    MC.emit('vista', v); return v;
  }
  siguiente(E, paso = 1) { const L = this.lista().filter(v => v.disponible), i = L.findIndex(v => v.id === this.actual.id); return this.usar(L[(i + paso + L.length) % L.length].id, E); }
  _copia(src) { const c = lienzo(src.width, src.height); if (c) c.getContext('2d').drawImage(src, 0, 0); return c; }
  /* dibuja la escena E en el contexto g (W × H en px de pantalla) */
  dibujar(g, W, H, E, dt = 1 / 60) {
    const t0 = MC.ahora(), v = this.actual, px = this.pixel; E.losas = this.losas; E.losasLejos = this.losasLejos; E.calidad = this.calidad;
    let dst = g, w = W, h = H;
    if (px) { w = Math.max(80, Math.round(W / this.escalaPixel)); h = Math.max(60, Math.round(H / this.escalaPixel)); if (!this._buf || this._buf.width !== w || this._buf.height !== h) this._buf = lienzo(w, h); dst = this._buf.getContext('2d'); }
    const zoomReal = E.camara.zoom; if (px) E.camara.zoom = zoomReal / this.escalaPixel;
    try {
      if (v.tipo === '2d') { Vista2D.dibujar(dst, w, h, E, { modo: v.modo, pixel: px, dpr: this.dpr, presupuesto: this.calidad > .6 ? 3 : 1, etiquetas: !px }); this._clima2D(dst, w, h, E); }
      else if (v.tipo === 'pano') { this.pano.dibujar(dst, w, h, E, px ? { k: clamp(Math.min(w, h * 1.4) / 70, 2, 40) * (zoomReal / 3.2) } : {}); }
      else if (v.tipo === 'gl') { const cv = this.gl && this.gl.dibujar(w, h, E, { presupuesto: 4 + 6 * this.calidad }); if (cv) { dst.drawImage(cv, 0, 0); this._clima2D(dst, w, h, E, true); } else Vista2D.dibujar(dst, w, h, E, { modo: 'oblicua' }); }
    } catch (e) { MC.falla('vista ' + v.id, e); }
    E.camara.zoom = zoomReal;
    if (px) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(this._buf, 0, 0, W, H); g.restore(); }
    /* fundido desde la vista anterior */
    if (this.fundido && this.fundido.cv) { this.fundido.t += dt / .55; const a = 1 - suave(this.fundido.t); if (a <= 0) this.fundido = null; else { g.save(); g.globalAlpha = a; g.drawImage(this.fundido.cv, 0, 0, W, H); g.restore(); } }
    this._ultimo = g.canvas;
    this.losas.trabajar(this.calidad > .6 ? 5 : 3);
    /* calidad automática: media móvil del tiempo de dibujo */
    const ms = MC.ahora() - t0; this.ms = this.ms * .92 + ms * .08;
    if (this.auto) { if (this.ms > 26 && this.calidad > .35) this.calidad = Math.max(.35, this.calidad - .01); else if (this.ms < 11 && this.calidad < 1) this.calidad = Math.min(1, this.calidad + .004); }
    return ms;
  }
  _clima2D(g, W, H, E, gl) {
    const Cl = E.clima; if (!Cl) return; const t = E.t || 0;
    if (Cl.lluvia > .05) { g.strokeStyle = 'rgba(210,228,245,' + (.22 + Cl.lluvia * .3) + ')'; g.lineWidth = 1; g.beginPath(); const n = Math.round((40 + Cl.lluvia * 120) * (W * H / 3e5)), vx = Math.cos(Cl.viento.dir) * Cl.viento.v; for (let i = 0; i < n; i++) { const x = ((h2(i, 3, 3) * W + t * 60 * vx) % W + W) % W, y = (h2(i, 4, 3) * H + t * (gl ? 700 : 260) * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - vx * (gl ? 2 : .6), y + (gl ? 14 : 5)); } g.stroke(); }
    if (!gl && Cl.niebla > .25) { g.fillStyle = 'rgba(205,210,215,' + ((Cl.niebla - .25) * .55).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    if (Cl.rayo > .05) { g.fillStyle = 'rgba(255,255,255,' + (Cl.rayo * .5).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
  }
}
Object.assign(MC, { Vistas, VISTAS });
