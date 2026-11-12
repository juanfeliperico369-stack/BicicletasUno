#!/usr/bin/env node
/* Construye Juega EnCicla:
   dist/juega-encicla.html  -> un solo archivo, offline (también es el www de Capacitor)
   dist/web/                -> PWA para GitHub Pages (index.html, manifest, sw.js, íconos, OG)
   Uso: node tools/build.js   (luego node tools/assets.js para íconos e imagen OG) */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src'), DIST = path.join(ROOT, 'dist'), WEB = path.join(DIST, 'web');
const URL = 'https://juanfeliperico369-stack.github.io/BicicletasUno/';
const rd = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const jsFiles = fs.readdirSync(path.join(SRC, 'js')).filter(f => f.endsWith('.js')).sort();
let js = jsFiles.map(f => `/* ---- ${f} ---- */\n` + rd('js/' + f)).join('\n');
// mapa real del Valle de Aburrá (tools/geo/build.py): casillas y relieve comprimidos (deflate) + líneas en JSON
const VALLE = `const VALLE_META = ${rd('data/valle.json')};\nconst VALLE_BIN = '${fs.readFileSync(path.join(SRC, 'data', 'valle.bin')).toString('base64')}';\n`;
js = VALLE + js;
const version = (js.match(/version: '([^']+)'/) || [])[1] || '0.0.0';
const b64 = f => fs.readFileSync(path.join(SRC, 'assets', f)).toString('base64');
const fonts = `@font-face{font-family:"Titulos";src:url(data:font/woff;base64,${b64('titulos.woff')}) format("woff");font-display:swap}@font-face{font-family:"Cuerpo";font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${b64('cuerpo.woff2')}) format("woff2")}`;
const css = rd('style.css');
const tpl = rd('index.html');
const svgIcon = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges"><rect width="32" height="32" fill="#0a2342"/><circle cx="16" cy="16" r="13" fill="#9bd341"/><g fill="none" stroke="#fff" stroke-width="2"><circle cx="10" cy="19" r="4"/><circle cx="22" cy="19" r="4"/></g><path d="M10 19 15 13 22 19M15 13h5M15 19 20 13M13 12h4" stroke="#0a2342" stroke-width="1.6" fill="none"/></svg>`);
const page = (head, standalone) => tpl.replace('<!--HEAD-->', head).replace('/*FONTS*/', fonts).replace('/*CSS*/', css)
  .replace('/*JS*/', () => js.replace('/*STANDALONE*/false', standalone ? 'true' : 'false'));

fs.mkdirSync(path.join(WEB, 'icons'), { recursive: true });
// 1) archivo único offline
const single = page(`<link rel="icon" href="${svgIcon}">`, true);
fs.writeFileSync(path.join(DIST, 'juega-encicla.html'), single);
// 2) PWA
const head = [
  '<link rel="manifest" href="manifest.webmanifest">',
  '<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">',
  `<link rel="icon" type="image/svg+xml" href="${svgIcon}">`,
  '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
  '<meta property="og:type" content="website">', '<meta property="og:locale" content="es_CO">',
  '<meta property="og:title" content="Juega EnCicla">',
  '<meta property="og:description" content="El videojuego arcade del sistema de bicicletas públicas del Valle de Aburrá. 9 oficios, 27 turnos, sin internet.">',
  `<meta property="og:url" content="${URL}">`, `<meta property="og:image" content="${URL}compartir.png">`,
  '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">', '<meta property="og:image:alt" content="Portada de Juega EnCicla">',
  '<meta name="twitter:card" content="summary_large_image">', `<link rel="canonical" href="${URL}">`
].join('\n');
const web = page(head, false);
fs.writeFileSync(path.join(WEB, 'index.html'), web);
const hash = crypto.createHash('sha1').update(web).digest('hex').slice(0, 8);
fs.writeFileSync(path.join(WEB, 'manifest.webmanifest'), JSON.stringify({
  name: 'Juega EnCicla', short_name: 'EnCicla', description: 'Videojuego arcade del sistema de bicicletas públicas EnCicla (Valle de Aburrá). Funciona sin internet.',
  lang: 'es-CO', id: './', start_url: './', scope: './', display: 'standalone', orientation: 'any', background_color: '#0a2342', theme_color: '#0a2342', categories: ['games', 'education'],
  icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }, { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' }]
}, null, 1));
const CACHE = `juega-encicla-v${version}-${hash}`;
fs.writeFileSync(path.join(WEB, 'sw.js'), `/* Service worker de Juega EnCicla: guarda el juego para jugar sin internet */
const CACHE = '${CACHE}';
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './compartir.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-192.png', './icons/icon-maskable-512.png', './icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('juega-encicla-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const p = new URL(r.url).pathname;
  // el juego (./ o index.html) sale de la caché; las demás páginas (pagina.html, privacidad.html) van a la red primero
  if (r.mode === 'navigate' && (p.endsWith('/') || p.endsWith('/index.html'))) { e.respondWith(caches.match('./index.html').then(c => c || fetch(r)).catch(() => caches.match('./index.html'))); return; }
  if (r.mode === 'navigate' || /\\.apk$/.test(p)) { e.respondWith(fetch(r).catch(() => caches.match(r, { ignoreSearch: true }))); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(c => c || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(ca => ca.put(r, cp)); } return res; })));
});
`);
fs.writeFileSync(path.join(WEB, '.nojekyll'), '');
// página oficial y privacidad (landing/) + APK de descarga si existe
const LAND = path.join(ROOT, 'landing');
if (fs.existsSync(LAND)) fs.cpSync(LAND, WEB, { recursive: true, filter: s => !/descargas/.test(s) });
const apk = fs.readdirSync(DIST).filter(f => f.endsWith('.apk')).sort().pop();
if (apk) { fs.mkdirSync(path.join(WEB, 'descargas'), { recursive: true }); fs.copyFileSync(path.join(DIST, apk), path.join(WEB, 'descargas', 'JuegaEnCicla.apk')); }
fs.writeFileSync(path.join(DIST, 'build.json'), JSON.stringify({ version, hash, cache: CACHE, files: jsFiles, bytes: { single: single.length, web: web.length, js: js.length } }, null, 1));
console.log('OK v' + version, 'cache', CACHE, '| único', (single.length / 1024).toFixed(0) + ' KB | js', (js.length / 1024).toFixed(0) + ' KB');
