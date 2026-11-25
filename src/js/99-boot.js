/* =====================================================================
   ARRANQUE
   ===================================================================== */
(async function boot() {
  const A = JE.arranque; A.boot = Math.round(performance.now());
  Save.load(); document.body.classList.toggle('big', !!Save.data.settings.big); View.init();
  /* 3.9.1: la portada se anima desde el primer instante (98z-portada-viva.js); el mapa se arma después de pintar un cuadro */
  try { PortadaViva.empezar(); } catch (e) { console.warn('portada viva', e); }
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  const t0 = performance.now(); A.mapa0 = Math.round(t0); try { await JE.map.load(); } catch (e) { JE.errors.push('mapa: ' + e.message); console.error(e); } JE.mapMs = Math.round(performance.now() - t0);
  UI.init(); bindCanvas(); A.ui = Math.round(performance.now());
  try { PortadaViva.terminar(); } catch (e) { console.warn('portada viva', e); }
  const q = new URLSearchParams(location.search);
  if (q.get('unlock')) JE.debugUnlock = true;
  const standalone = /*STANDALONE*/false;
  if (!standalone && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.Capacitor) {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(e => JE.errors.push('sw: ' + e.message));
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!had) return; if (UI.cur !== 'sGame') location.reload(); else UI.toast('Hay una versión nueva: se aplicará al volver al menú'); });
  }
  JE.ready = true; A.listo = Math.round(performance.now());
})();
