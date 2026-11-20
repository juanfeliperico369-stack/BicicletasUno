#!/usr/bin/env node
/* Portada editorial: prueba real de legibilidad, teclado, enlaces y anchura sin dependencias en la página. */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), { chromium } = require('playwright');
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(raiz, 'index.html')).href;
const b = await chromium.launch({ headless: true });
let bien = 0;
try {
  for (const [w, h] of [[320,640], [412,860], [860,412], [1440,900]]) {
    const p = await b.newPage({ viewport: { width:w, height:h }, reducedMotion: 'reduce' });
    const errores = [];
    p.on('pageerror', e => errores.push(e.message));
    p.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) errores.push('Petición en red: '+r.url()); });
    await p.goto(url);
    const v = await p.evaluate(() => {
      const play = document.querySelector('a.jugar');
      const r = play.getBoundingClientRect();
      const s = getComputedStyle(play);
      const links = [...document.querySelectorAll('a')];
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        actionVisible: r.top >= 0 && r.bottom <= innerHeight && r.width >= 44 && r.height >= 44,
        actionText: play.textContent.trim(),
        background: s.backgroundColor, text: s.color,
        skipLink: !!document.querySelector('a[href="#contenido"]'),
        brokenLinks: links.filter(a => !a.getAttribute('href')).length
      };
    });
    if (errores.length || v.overflow || !v.actionVisible || v.actionText !== 'Jugar Mandados' ||
        !v.skipLink || v.brokenLinks || v.background !== 'rgb(29, 82, 74)' || v.text !== 'rgb(255, 255, 255)')
      throw new Error(`Portada ${w}×${h}: ${JSON.stringify({ ...v, errores })}`);
    if (w === 412 || w === 1440) {
      const fs = await import('node:fs');
      const out = path.join(raiz,'dist','capturas');
      fs.mkdirSync(out,{recursive:true});
      await p.screenshot({ path: path.join(out,`portada-${w}.png`), fullPage:true });
    }
    await p.keyboard.press('Tab');
    const focused = await p.evaluate(() => document.activeElement?.classList.contains('saltar'));
    if (!focused) throw new Error('El enlace «Saltar al contenido» debe recibir el primer foco');
    console.log(`✓ Portada ${w}×${h}: sin desbordamiento, acción visible, enlaces y foco correctos`);
    bien++;
    await p.close();
  }
  console.log('✓ Portada editorial: '+bien+' perfiles aprobados');
} finally { await b.close(); }
