/* =====================================================================
   GESTOR DE VISTAS · todas las dimensiones de vista del motor con un solo botón
   cenital · ciudad 3D (oblicua) · maqueta 2:1 · lateral (de lado, gira de a 90°) · panorámica (de perfil) · tercera persona
   · primera persona · dron · cine
   + PIXEL en cualquiera de ellas (la misma escena en un búfer pequeño, agrandada sin suavizado).
   - Canvas 2D es la base (anda en todo); WebGL es la mejora. Si falta WebGL, o es por software, la 3D la dibuja
     MC.Raster (la «tarjeta gráfica» del motor en Canvas 2D). La 3D usa resolución dinámica (MC.ResDinamica).
   - Transición suave entre vistas en el mismo punto (fundido con la vista anterior).
   - Calidad automática: mide el tiempo de cada cuadro y sube o baja el detalle (tráfico, edificios, resolución).
   ===================================================================== */
const VISTAS = [
  { id: 'cenital', n: 'Cenital', icon: '🗺️', tipo: '2d', modo: 'cenital', control: 'mundo' },
  { id: 'ciudad3d', n: 'Ciudad 3D', icon: '🏙️', tipo: '2d', modo: 'oblicua', control: 'mundo' },
  { id: 'maqueta', n: 'Maqueta 2:1', icon: '🧊', tipo: '2d', modo: 'maqueta', control: 'mundo' },
  { id: 'lateral', n: 'Lateral', icon: '↔️', tipo: '2d', modo: 'lateral', control: 'mundo' },
  { id: 'pano', n: 'Panorámica', icon: '🎬', tipo: 'pano', control: 'pano' },
  { id: 'tercera', n: 'Tercera persona', icon: '🎮', tipo: 'gl', perfil: 'tercera', control: 'volante' },
  { id: 'primera', n: 'Primera persona', icon: '👁️', tipo: 'gl', perfil: 'primera', control: 'volante' },
  { id: 'dron', n: 'Dron', icon: '🚁', tipo: 'gl', perfil: 'dron', control: 'volante' },
  { id: 'cine', n: 'Cine', icon: '🎥', tipo: 'gl', perfil: 'cine', control: 'volante' }
];
class Vistas {
  constructor(mundo, op = {}) { if (MC.estilo !== 'clasico') Arboleda.precalentar();
    this.mundo = mundo; this.losas = new Losas(mundo); this.losasLejos = new Losas(mundo, { lado: 1280, max: 40 }); this.pano = new Panoramica(mundo); this.gl = null; this.glIntentado = false;
    this.actual = VISTAS[0]; this.anterior = null; this.pixel = false; this.escalaPixel = op.escalaPixel || 3; this.calidad = op.calidad ?? .85; this.auto = op.auto !== false; this.ms = 16; this.dpr = 1; this.fundido = null; this._buf = null;
    const aj = GPU.ajustes(); this.motor3d = op.motor3d || 'auto'; this.raster = null; this.res = new ResDinamica({ objetivo: 1000 / aj.fps, escala: aj.escala });
  }
  lista() { return VISTAS.map(v => Object.assign({ disponible: true }, v)); }
  /* ¿la 3D la dibuja el raster por software? 'auto': si no hay WebGL o si el WebGL es por software */
  usaRaster() { if (this.motor3d === 'raster') return true; if (this.motor3d === 'gl') return !this.hayGL(); return GPU.perfil().nivel === 'software' || !this.hayGL(); }
  hayGL() { if (!this.glIntentado) { this.glIntentado = true; try { this.gl = new VistaGL(this.mundo, this.losas); if (!this.gl.ok) this.gl = null; } catch (e) { this.gl = null; MC.falla('WebGL', e); } } return !!this.gl; }
  /* cambia de vista (por id) con transición; la cámara toma el perfil de la nueva */
  usar(id, E) {
    let v = VISTAS.find(q => q.id === id) || VISTAS[0];
    if (v === this.actual) return v; this.anterior = this.actual; this.actual = v;
    if (this._ultimo) { this.fundido = { cv: this._copia(this._ultimo), t: 0 }; }
    if (E && E.camara) { if (v.perfil) E.camara.usarPerfil(v.perfil); if (v.modo === 'oblicua' && (E.camara.pitch < .3 || E.camara.pitch > 1.2)) E.camara.pitch = .62; if (v.id === 'maqueta') E.camara.zoom = Math.max(E.camara.zoom, 1.2); if (v.id === 'lateral') { E.camara.pitch = 1.38; E.camara.girarA(Math.round(E.camara.yaw / (Math.PI / 2)) * Math.PI / 2); E.camara.zoom = Math.max(E.camara.zoom, 2); } }
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
      else if (v.tipo === 'gl') {
        /* resolución dinámica: la 3D se dibuja a escala s y se agranda (bajar píxeles antes que cuadros) */
        const s = this.auto ? this.res.escala : 1, rw = Math.max(64, Math.round(w * s)), rh = Math.max(48, Math.round(h * s));
        if (this.usaRaster()) { if (!this.raster) this.raster = new Raster(this.mundo); if (!this._rb || this._rb.width !== rw || this._rb.height !== rh) this._rb = lienzo(rw, rh); this.raster.dibujar(this._rb.getContext('2d'), rw, rh, E); dst.drawImage(this._rb, 0, 0, w, h); }
        else { const cv = this.gl.dibujar(rw, rh, E, { presupuesto: 4 + 6 * this.calidad }); if (cv) dst.drawImage(cv, 0, 0, w, h); }
        this._clima2D(dst, w, h, E, true);
      }
    } catch (e) { MC.falla('vista ' + v.id, e); }
    E.camara.zoom = zoomReal;
    if (px) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(this._buf, 0, 0, W, H); g.restore(); }
    /* bajo el agua: todo se tiñe de azul (más oscuro mientras más hondo), con rayos de luz que se mueven */
    const Cj = E.jugador && E.jugador.cuerpo; if (Cj && Cj.buceando) this._bajoAgua(g, W, H, -Cj.z, E.t || 0);
    /* fundido desde la vista anterior */
    if (this.fundido && this.fundido.cv) { this.fundido.t += dt / .55; const a = 1 - suave(this.fundido.t); if (a <= 0) this.fundido = null; else { g.save(); g.globalAlpha = a; g.drawImage(this.fundido.cv, 0, 0, W, H); g.restore(); } }
    this._ultimo = g.canvas;
    this.losas.trabajar(this.calidad > .6 ? 5 : 3);
    /* calidad automática: media móvil del tiempo de dibujo */
    const ms = MC.ahora() - t0; this.ms = this.ms * .92 + ms * .08; if (v.tipo === 'gl' && this.auto) this.res.medir(ms);
    if (this.auto) { if (this.ms > 26 && this.calidad > .35) this.calidad = Math.max(.35, this.calidad - .01); else if (this.ms < 11 && this.calidad < 1) this.calidad = Math.min(1, this.calidad + .004); }
    return ms;
  }
  _bajoAgua(g, W, H, hondo, t) {
    g.save(); const a = clamp(.28 + hondo * .05, .28, .7), gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(40,120,160,' + (a * .8).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(6,40,70,' + a.toFixed(3) + ')'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(160,220,255,' + (.12 / (1 + hondo * .2)).toFixed(3) + ')'; g.lineWidth = Math.max(6, W * .02);
    for (let i = 0; i < 6; i++) { const x0 = ((i / 6 + Math.sin(t * .2 + i) * .05) % 1) * W; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 - W * .15 + Math.sin(t * .5 + i) * 20, H); g.stroke(); }
    g.restore();
  }
  _clima2D(g, W, H, E, gl) {
    const Cl = E.clima; if (!Cl) return; const t = E.t || 0;
    if (Cl.lluvia > .05) { g.strokeStyle = 'rgba(210,228,245,' + (.22 + Cl.lluvia * .3) + ')'; g.lineWidth = 1; g.beginPath(); const n = Math.round((40 + Cl.lluvia * 120) * (W * H / 3e5)), vx = Math.cos(Cl.viento.dir) * Cl.viento.v; for (let i = 0; i < n; i++) { const x = ((h2(i, 3, 3) * W + t * 60 * vx) % W + W) % W, y = (h2(i, 4, 3) * H + t * (gl ? 700 : 260) * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - vx * (gl ? 2 : .6), y + (gl ? 14 : 5)); } g.stroke(); }
    if (!gl && Cl.niebla > .25) { g.fillStyle = 'rgba(205,210,215,' + ((Cl.niebla - .25) * .55).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    if (Cl.rayo > .05) { g.fillStyle = 'rgba(255,255,255,' + (Cl.rayo * .5).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
    MC.efectosClima(g, W, H, Cl, t, gl);
  }
}
/* nieve que cae y se acumula, granizo y calor (los climas de MC.ClimaGlobal) */
MC.efectosClima = function (g, W, H, Cl, t, perspectiva) {
  if (Cl.nieveSuelo > .3 && !perspectiva) { g.fillStyle = 'rgba(245,248,252,' + Math.min(.55, Cl.nieveSuelo / 25).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
  if (Cl.nieve > .05) { g.fillStyle = 'rgba(255,255,255,.9)'; const n = Math.round((60 + Cl.nieve * 160) * (W * H / 3e5)), vx = Math.cos(Cl.viento.dir) * Cl.viento.v * 6; for (let i = 0; i < n; i++) { const x = ((h2(i, 7, 3) * W + t * vx + Math.sin(t + i) * 12) % W + W) % W, y = (h2(i, 8, 3) * H + t * (35 + h2(i, 9, 3) * 30)) % H, r = 1 + h2(i, 6, 3) * 1.8; g.fillRect(x, y, r, r); } }
  if (Cl.granizo > .1) { g.fillStyle = 'rgba(235,245,255,.9)'; for (let i = 0; i < 70; i++) { const x = (h2(i, 3, 5) * W + t * 40) % W, y = (h2(i, 4, 5) * H + t * 900) % H; g.fillRect(x, y, 2.2, 2.2); } }
  if (Cl.calor > .05) { g.fillStyle = 'rgba(255,170,60,' + (Cl.calor * .12).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
};
Object.assign(MC, { Vistas, VISTAS });
