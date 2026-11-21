/* =====================================================================
   Motor City · trabajador de servicio (4.5): la página del motor y sus juegos abren sin internet.
   - Lo que se abre una vez queda guardado en el teléfono (caché del navegador) y la próxima vez abre de ahí,
     con o sin conexión.
   - Para no volver a bajar los 25 MB de Turno Cero en cada visita, solo se consulta VERSION.json (unos bytes),
     a lo sumo cada 10 minutos: si la versión del motor cambió, lo guardado se borra y la próxima vez baja lo nuevo.
   - Solo el mismo sitio y solo GET. Nada de terceros, nada de datos del jugador (las partidas siguen en localStorage).
   ===================================================================== */
const CACHE = 'motorcity-v1';
let revisado = 0;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('motorcity-') && k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
async function revisar(c) {
  if (Date.now() - revisado < 6e5) return; revisado = Date.now();
  let v = null; try { const r = await fetch('VERSION.json?sw=' + Date.now(), { cache: 'no-store' }); if (r.ok) v = (await r.json()).version; } catch (e) { return; }
  if (!v) return; const meta = await c.match('__version'), antes = meta ? await meta.text() : null; if (antes === v) return;
  if (antes) for (const k of await c.keys()) if (!k.url.endsWith('__version')) await c.delete(k);
  await c.put('__version', new Response(v));
}
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || /VERSION\.json$/.test(url.pathname) || url.pathname.endsWith('/sw.js')) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE), guardado = await c.match(req, { ignoreSearch: true });
    e.waitUntil(revisar(c));
    if (guardado) return guardado;
    try { const r = await fetch(req); if (r.ok && r.type === 'basic') e.waitUntil(c.put(req, r.clone())); return r; }
    catch (err) { return (await c.match('index.html')) || Response.error(); }
  })());
});
