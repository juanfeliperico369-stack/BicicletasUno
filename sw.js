/* Service worker de Juega EnCicla: guarda el juego para jugar sin internet */
const CACHE = 'juega-encicla-v1.7.2-5a476cd6';
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './compartir.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-192.png', './icons/icon-maskable-512.png', './icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('juega-encicla-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const p = new URL(r.url).pathname, base = new URL('./', location).pathname;
  if (p.startsWith(base + 'metro/')) return;   // El Metro (en /metro/) tiene su propio service worker
  // el juego (./ o index.html) sale de la caché; las demás páginas (pagina.html, privacidad.html) van a la red primero
  if (r.mode === 'navigate' && (p === base || p === base + 'index.html')) { e.respondWith(caches.match('./index.html').then(c => c || fetch(r)).catch(() => caches.match('./index.html'))); return; }
  if (r.mode === 'navigate' || /\.apk$/.test(p)) { e.respondWith(fetch(r).catch(() => caches.match(r, { ignoreSearch: true }))); return; }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(c => c || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(ca => ca.put(r, cp)); } return res; })));
});
