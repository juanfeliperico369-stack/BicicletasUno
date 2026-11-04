#!/usr/bin/env node
/* Imágenes para Google Play y para la página del juego (landing/), con Playwright.
   Requisitos: dist/juega-encicla.html (node tools/build.js) y dist/web/icons/icon-512.png (node tools/assets.js).
   Uso: node tools/store.js
   Salida:
     dist/store/phone-1..6.png    capturas de teléfono 1080x1920 (360x640 CSS a 3x) para la ficha de Play
     dist/store/feature.png       gráfico de funciones 1024x500
     dist/store/icon-512.png      ícono 512x512 (copia de dist/web/icons/icon-512.png)
     landing/capturas/*.png       las mismas capturas a 540x960 (1.5x) para landing/pagina.html
     landing/arte/*.png           arte de portada (400x250) e íconos de los oficios (64x64)
     landing/fuentes/*            copia de las fuentes Titulos y Cuerpo (src/assets) */
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), DIST = path.join(ROOT, 'dist'), STORE = path.join(DIST, 'store');
const LAND = path.join(ROOT, 'landing'), CAPS = path.join(LAND, 'capturas'), ARTE = path.join(LAND, 'arte'), FONTS = path.join(LAND, 'fuentes');
const GAME = path.join(DIST, 'juega-encicla.html'), ICON = path.join(DIST, 'web', 'icons', 'icon-512.png');
const ASSETS = path.join(ROOT, 'src', 'assets');

for (const f of [GAME, ICON]) if (!fs.existsSync(f)) { console.error('Falta ' + path.relative(ROOT, f) + ': corre node tools/build.js && node tools/assets.js'); process.exit(1); }
for (const d of [STORE, CAPS, ARTE, FONTS]) fs.mkdirSync(d, { recursive: true });

const PERFILES = [
  { dsf: 3, dir: STORE, name: (s, i) => `phone-${i + 1}.png` },   // 1080x1920 para Google Play
  { dsf: 1.5, dir: CAPS, name: (s, i) => `${i + 1}-${s.id}.png` }  // 540x960 para la página
];
const pausa = (p, ms) => p.waitForTimeout(ms);
const iniciar = (p, rol, turno) => p.evaluate(([r, t]) => { if (JE.game.mode) JE.game.stop(); JE.game.start(r, t, { seed: 7, nov: NOVEDADES[0] }); }, [rol, turno]);
async function saltarIntro(p) {
  for (let k = 0; k < 6; k++) {
    if (await p.isVisible('#inSkip')) await p.click('#inSkip');
    else if (await p.isVisible('#inNext')) await p.click('#inNext');
    else return;
    await pausa(p, 250);
  }
}
const ESCENAS = [
  { id: 'portada', run: async p => { await saltarIntro(p); await pausa(p, 900); } },
  { id: 'escalafon', run: async p => { await p.click('#bPlay'); await pausa(p, 300); await saltarIntro(p); await pausa(p, 600); } },
  { id: 'usuario', run: async p => { await iniciar(p, 'usuario', 1); await pausa(p, 2500); } },
  {
    id: 'anfitrion', run: async p => {
      await iniciar(p, 'anfitrion', 2); await pausa(p, 4000);
      // atiende al primero de la fila apenas llegue a la ventanilla (serve() no hace nada si aún camina)
      await p.waitForFunction(() => { const s = JE.game.mode && JE.game.mode.sub; return !s || s.cur || (s.queue.length && s.queue[0].st === 'wait'); }, null, { timeout: 15000 }).catch(() => { });
      await p.evaluate(() => JE.game.mode.sub && JE.game.mode.sub.serve()); await pausa(p, 400);
    }
  },
  { id: 'monitoreo', run: async p => { await iniciar(p, 'monitoreo', 1); await pausa(p, 3000); } },
  { id: 'carrera', run: async p => { await iniciar(p, 'carrera', 2); await pausa(p, 4500); } }
];

async function abrirJuego(browser, dsf) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: dsf, isMobile: true, hasTouch: true, locale: 'es-CO' });
  const p = await ctx.newPage();
  await p.goto('file://' + GAME);
  await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 30000 });
  await p.evaluate(() => Promise.all([document.fonts.load('100px Titulos'), document.fonts.load('20px Cuerpo')]).then(() => document.fonts.ready));
  return { ctx, p };
}

const b64 = f => fs.readFileSync(path.join(ASSETS, f)).toString('base64');
const featureHTML = (arte, icono) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Titulos;src:url(data:font/woff;base64,${b64('titulos.woff')}) format("woff")}
@font-face{font-family:Cuerpo;font-weight:100 900;src:url(data:font/woff2;base64,${b64('cuerpo.woff2')}) format("woff2")}
*{box-sizing:border-box}html,body{margin:0;width:1024px;height:500px;overflow:hidden}
body{background:#0a2342 radial-gradient(rgba(255,255,255,.08) 1.4px,transparent 2px) 0 0/9px 9px;color:#fff;font-family:Cuerpo,sans-serif;position:relative}
.band{position:absolute;left:0;right:0;top:0;height:50px;background:#9bd341;color:#0a2342;display:flex;align-items:center;justify-content:space-between;padding:0 28px 0 40px;font-weight:800;letter-spacing:.34em;font-size:15px}
.band span{background:#0a2342;color:#c4ec7c;border:3px solid #9bd341;outline:3px solid #0a2342;padding:6px 14px;letter-spacing:.22em;font-weight:700}
.t{position:absolute;left:36px;font-family:Titulos,Impact,sans-serif;text-transform:uppercase;line-height:.8;text-shadow:6px 6px 0 #0a2342}
.t1{top:78px;font-size:158px}.t2{top:206px;font-size:122px;color:#9bd341}
.kick{position:absolute;left:42px;top:318px;font:italic 25px Georgia,serif;color:#ffc93c}
.chips{position:absolute;left:42px;top:362px;display:flex;gap:10px}
.chips b{border:3px solid #9bd341;padding:4px 10px;font-family:Titulos,sans-serif;font-weight:400;font-size:21px;text-transform:uppercase;background:#0e2d55}
.art{position:absolute;right:52px;top:84px;width:440px;height:275px;border:6px solid #fff;box-shadow:13px 13px 0 #5e9a1e;background:url(${arte}) 0 0/100% 100%;image-rendering:pixelated}
.stk{position:absolute;right:30px;top:318px;transform:rotate(-7deg);background:#ffc93c;color:#0a2342;border:4px solid #0a2342;box-shadow:5px 5px 0 #0007;font-family:Titulos,sans-serif;font-size:34px;text-transform:uppercase;padding:6px 14px}
.foot{position:absolute;left:0;right:0;bottom:0;height:68px;background:#f4efd8;border-top:6px solid #9bd341;color:#0a2342;display:flex;align-items:center;justify-content:space-between;padding:0 40px}
.foot b{font-family:Titulos,sans-serif;font-weight:400;font-size:36px;text-transform:uppercase;line-height:1}
.foot span{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px}
.foot img{width:40px;height:40px;image-rendering:pixelated;border:2px solid #0a2342}
</style></head><body>
<div class="band">ÁREA METROPOLITANA · VALLE DE ABURRÁ<span>GRATIS · SIN INTERNET</span></div>
<div class="t t1">Juega</div><div class="t t2">EnCicla</div>
<div class="kick">¿Sabes cuántas bicis mueve tu ciudad?</div>
<div class="chips"><b>9 oficios</b><b>27 turnos</b><b>Carrera 1 vs 1</b></div>
<div class="art"></div><div class="stk">¡Del usuario al supervisor!</div>
<div class="foot"><b>La revista arcade más pedaleada</b><span><img src="${icono}" alt="">Pixel art · Android y web</span></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch(), hechos = [];
  const out = (f, buf) => { fs.writeFileSync(f, buf); hechos.push(path.relative(ROOT, f)); };

  // 1) capturas de teléfono (Play a 3x y página a 1.5x)
  for (const pf of PERFILES) {
    const { ctx, p } = await abrirJuego(browser, pf.dsf);
    for (const [i, s] of ESCENAS.entries()) { await s.run(p); out(path.join(pf.dir, pf.name(s, i)), await p.screenshot()); }
    const errs = await p.evaluate(() => { if (JE.game.mode) JE.game.stop(); return JE.errors.slice(); });
    if (errs.length) console.warn('Avisos del juego (' + pf.dsf + 'x):', errs.join(' | '));
    await ctx.close();
  }

  // 2) arte para la página y el gráfico de funciones (sale del mismo arte pixel del juego)
  const { ctx, p } = await abrirJuego(browser, 1);
  const arte = await p.evaluate(() => {
    const ids = ROLES.map(r => r.id).concat('carrera');
    const ico = {}; for (const id of ids) ico[id] = Art.iconURL(id === 'carrera' ? 'pin' : ROLE[id].icon, 4);
    const base = Art.mk(200, 125, x => Art.cover(x, 200, 125, 2.2));
    const portada = Art.mk(400, 250, x => { x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0, 400, 250); });
    return { ico, portada: portada.toDataURL('image/png'), base: base.toDataURL('image/png'), app: Art.appIcon(96, false).toDataURL('image/png') };
  });
  await ctx.close();
  const dataPNG = d => Buffer.from(d.split(',')[1], 'base64');
  out(path.join(ARTE, 'portada.png'), dataPNG(arte.portada));
  out(path.join(ARTE, 'icono.png'), dataPNG(arte.app));
  for (const [id, d] of Object.entries(arte.ico)) out(path.join(ARTE, id + '.png'), dataPNG(d));

  // 3) gráfico de funciones 1024x500 (composición propia: Art.shareImage no cabe en ese formato)
  const fp = await browser.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
  await fp.setContent(featureHTML(arte.base, arte.app));
  await fp.evaluate(() => Promise.all([document.fonts.load('100px Titulos'), document.fonts.load('800 20px Cuerpo')]).then(() => document.fonts.ready));
  const des = await fp.evaluate(() => [...document.querySelectorAll('.t,.kick,.chips,.foot b,.foot span,.band,.stk')].filter(e => { const r = e.getBoundingClientRect(); return r.right > 1024 || r.bottom > 500 || r.left < 0; }).map(e => e.className));
  if (des.length) console.warn('feature.png: elementos fuera del lienzo:', des.join(', '));
  out(path.join(STORE, 'feature.png'), await fp.screenshot());
  await fp.close();
  await browser.close();

  // 4) ícono 512 y fuentes para la página
  fs.copyFileSync(ICON, path.join(STORE, 'icon-512.png')); hechos.push('dist/store/icon-512.png');
  for (const f of ['titulos.woff', 'cuerpo.woff2']) { fs.copyFileSync(path.join(ASSETS, f), path.join(FONTS, f)); hechos.push('landing/fuentes/' + f); }

  const kb = f => (fs.statSync(path.join(ROOT, f)).size / 1024).toFixed(0) + ' KB';
  console.log(hechos.map(f => '  ' + f + ' · ' + kb(f)).join('\n'));
  console.log('Listo: ' + hechos.length + ' archivos (Play: dist/store/ · página: landing/)');
})().catch(e => { console.error(e); process.exit(1); });
