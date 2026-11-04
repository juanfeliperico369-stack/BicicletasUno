/* =====================================================================
   ARTE PROMOCIONAL: íconos de la app e imagen para compartir (OG)
   ===================================================================== */
Art.appIcon = function (size, maskable) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const g = this.mk(32, 32, p => {
    prect(p, 0, 0, 32, 32, PAL.az);
    for (let i = 0; i < 32; i += 3) for (let j = (i / 3) % 2 ? 1 : 0; j < 32; j += 3) prect(p, i, j, 1, 1, '#ffffff10');
    const r = maskable ? 11 : 13; pdisc(p, 16, 16, r, PAL.vd); pring(p, 16, 16, r, PAL.vd1);
    pring(p, 10, 19, 4, '#fff'); pring(p, 22, 19, 4, '#fff'); prect(p, 10, 19, 1, 1, '#fff'); prect(p, 22, 19, 1, 1, '#fff');
    pline(p, 10, 19, 15, 13, PAL.az); pline(p, 15, 13, 22, 19, PAL.az); pline(p, 15, 13, 20, 13, PAL.az); pline(p, 15, 19, 10, 19, PAL.az); pline(p, 15, 19, 15, 13, PAL.az); pline(p, 15, 19, 20, 13, PAL.az);
    prect(p, 13, 12, 4, 1, PAL.az); prect(p, 19, 11, 3, 1, PAL.az); prect(p, 21, 12, 3, 3, '#fff');
  });
  if (!maskable) { x.fillStyle = PAL.az; x.fillRect(0, 0, size, size); }
  x.drawImage(g, 0, 0, size, size); return c;
};
Art.shareImage = function (w = 1200, h = 630) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.fillStyle = PAL.az; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff12'; for (let i = 0; i < w; i += 9) for (let j = 0; j < h; j += 9) x.fillRect(i, j, 2, 2);
  x.fillStyle = PAL.vd; x.fillRect(0, 0, w, 64); x.fillStyle = PAL.az; x.font = '800 22px Cuerpo, sans-serif'; x.textBaseline = 'middle';
  const sp = (t, X, Y, ls) => { let cx = X; for (const ch of t) { x.fillText(ch, cx, Y); cx += x.measureText(ch).width + ls; } };
  sp('ÁREA METROPOLITANA · Nº 15', 40, 33, 6); x.fillStyle = PAL.az; x.fillRect(w - 470, 8, 450, 48); x.strokeStyle = PAL.vd; x.lineWidth = 4; x.strokeRect(w - 470, 8, 450, 48); x.fillStyle = PAL.vd1; sp('GRATIS TODOS LOS DÍAS', w - 445, 33, 5);
  const art = this.mk(200, 125, p => this.cover(p, 200, 125, 2.2)), aw = 560, ah = 350, ax = w - aw - 50, ay = 120;
  x.fillStyle = PAL.vd2; x.fillRect(ax + 14, ay + 14, aw, ah); x.drawImage(art, ax, ay, aw, ah); x.strokeStyle = '#fff'; x.lineWidth = 8; x.strokeRect(ax, ay, aw, ah);
  x.textBaseline = 'alphabetic'; x.fillStyle = '#fff'; x.font = '700 190px Titulos, Impact, sans-serif'; x.fillText('JUEGA', 36, 250); x.fillStyle = PAL.vd; x.font = '700 150px Titulos, Impact, sans-serif'; x.fillText('ENCICLA', 40, 390);
  x.fillStyle = PAL.amb; x.font = 'italic 34px Georgia, serif'; x.fillText('¿Sabes cuántas bicis mueve tu ciudad?', 44, 450);
  x.save(); x.translate(ax + aw - 60, ay + ah - 10); x.rotate(-.12); x.fillStyle = PAL.amb; x.fillRect(-120, -34, 240, 64); x.strokeStyle = PAL.az; x.lineWidth = 5; x.strokeRect(-120, -34, 240, 64); x.fillStyle = PAL.az; x.font = '700 40px Titulos, Impact, sans-serif'; x.textAlign = 'center'; x.fillText('¡9 OFICIOS!', 0, 14); x.restore();
  x.fillStyle = PAL.crema; x.fillRect(0, h - 90, w, 90); x.fillStyle = PAL.vd; x.fillRect(0, h - 96, w, 6); x.fillStyle = PAL.az; x.font = '700 46px Titulos, Impact, sans-serif'; x.textAlign = 'left'; x.fillText('LA REVISTA ARCADE MÁS PEDALEADA', 40, h - 30);
  x.font = '700 24px Cuerpo, sans-serif'; x.textAlign = 'right'; x.fillText('Juega sin internet · Web y Android', w - 40, h - 36);
  return c;
};
