/* =====================================================================
   ARRANQUE
   ===================================================================== */
(function boot() {
  Save.load(); document.body.classList.toggle('big', !!Save.data.settings.big); View.init(); JE.map.generate(); UI.init(); bindCanvas();
  const q = new URLSearchParams(location.search);
  if (q.get('unlock')) JE.debugUnlock = true;
  const standalone = /*STANDALONE*/false;
  if (!standalone && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.Capacitor) {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(e => JE.errors.push('sw: ' + e.message));
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!had) return; if (UI.cur !== 'sGame') location.reload(); else UI.toast('Hay una versión nueva: se aplicará al volver al menú'); });
  }
  JE.ready = true;
})();
