#!/usr/bin/env node
/* Genera íconos PNG (192/512, maskable, apple 180, favicon 32) y compartir.png (1200x630)
   usando el mismo arte pixel del juego, renderizado en Chromium (Playwright). */
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const DIST = path.join(__dirname, '..', 'dist'), WEB = path.join(DIST, 'web');
(async () => {
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('file://' + path.join(DIST, 'juega-encicla.html'));
  await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 30000 });
  await p.evaluate(() => Promise.all([document.fonts.load('100px Titulos'), document.fonts.load('20px Cuerpo')]));
  const out = await p.evaluate(() => ({
    i192: Art.appIcon(192, false).toDataURL(), i512: Art.appIcon(512, false).toDataURL(),
    m192: Art.appIcon(192, true).toDataURL(), m512: Art.appIcon(512, true).toDataURL(),
    apple: Art.appIcon(180, false).toDataURL(), fav: Art.appIcon(32, false).toDataURL(), share: Art.shareImage(1200, 630).toDataURL('image/png')
  }));
  const w = (f, d) => fs.writeFileSync(path.join(WEB, f), Buffer.from(d.split(',')[1], 'base64'));
  w('icons/icon-192.png', out.i192); w('icons/icon-512.png', out.i512); w('icons/icon-maskable-192.png', out.m192); w('icons/icon-maskable-512.png', out.m512);
  w('apple-touch-icon.png', out.apple); w('icons/favicon-32.png', out.fav); w('compartir.png', out.share);
  await b.close(); console.log('íconos y compartir.png listos');
})();
