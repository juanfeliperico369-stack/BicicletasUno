/* Verifica el enlace publicado: carga, SW activo, offline, instalabilidad (CDP), recursos OG */
const { chromium } = require('playwright');
const URL = process.argv[2] || 'https://juanfeliperico369-stack.github.io/BicicletasUno/';
(async () => {
  const px = process.env.HTTPS_PROXY || process.env.https_proxy;
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'], proxy: px ? { server: px } : undefined });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true }), p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const r = await p.goto(URL, { waitUntil: 'load' }); await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 30000 });
  console.log('carga:', r.status(), errs.length ? 'ERRORES ' + errs.join(' | ') : 'sin errores');
  const sw = await p.evaluate(async () => { const reg = await navigator.serviceWorker.ready; await new Promise(r => setTimeout(r, 1500)); return { state: reg.active && reg.active.state, scope: reg.scope, caches: await caches.keys() }; });
  console.log('service worker:', JSON.stringify(sw));
  const cdp = await ctx.newCDPSession(p);
  const inst = await cdp.send('Page.getInstallabilityErrors'); console.log('errores de instalabilidad:', JSON.stringify(inst.installabilityErrors));
  const man = await cdp.send('Page.getAppManifest'); console.log('manifest:', man.url, man.errors && man.errors.length ? JSON.stringify(man.errors) : 'sin errores');
  const og = await p.evaluate(async () => { const g = n => (document.querySelector(`meta[property="${n}"]`) || {}).content; const res = {}; for (const u of [g('og:image'), new URL('apple-touch-icon.png', location.href).href, new URL('manifest.webmanifest', location.href).href]) res[u] = (await fetch(u)).status; return { image: g('og:image'), url: g('og:url'), res }; });
  console.log('OG:', JSON.stringify(og));
  await ctx.setOffline(true); await p.reload({ waitUntil: 'load' }); const off = await p.waitForFunction(() => window.JE && JE.ready, null, { timeout: 15000 }).then(() => true).catch(() => false);
  console.log('abre sin conexión:', off);
  if (off) { await p.click('#bPlay'); await p.click('button[data-role=usuario][data-t="1"]'); await p.click('#bGo'); await p.waitForTimeout(800); console.log('juega sin conexión:', await p.isVisible('#sGame')); }
  await b.close();
})().catch(e => { console.error('FALLO', e.message); process.exit(1); });
