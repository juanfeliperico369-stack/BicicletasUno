/* =====================================================================
   ARRANQUE
   ===================================================================== */
(function boot() {
  Save.load(); View.init(); JE.map.generate(); UI.init(); bindCanvas();
  const q = new URLSearchParams(location.search);
  if (q.get('unlock')) JE.debugUnlock = true;
  const standalone = /*STANDALONE*/false;
  if (!standalone && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.Capacitor) {
    navigator.serviceWorker.register('sw.js').catch(e => JE.errors.push('sw: ' + e.message));
  }
  JE.ready = true;
})();
