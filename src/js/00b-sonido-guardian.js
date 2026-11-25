/* =====================================================================
   GUARDIÁN DEL SONIDO (Juega EnCicla 3.9.1 · Claude, 25‑nov‑2026)
   El autor: «cuando se sale de la app aún sigue sonando la música» (El Metro, EnCicla y Turno Cero).
   Al salir de la app (o cambiar de pestaña, bloquear la pantalla o cerrar), todo el sonido se calla de una, en cualquier
   pantalla del juego:
   - cada AudioContext que se cree queda registrado (una subclase) y se suspende: la música, los efectos, el paisaje sonoro y
     los motores paran al instante, también las notas que ya estaban programadas;
   - los <audio> y <video> que suenan se pausan y la voz de los anuncios se corta;
   - mientras la app está afuera, nada vuelve a sonar aunque el juego lo pida (resume() y play() esperan);
   - al volver, sigue solo lo que sonaba.
   Avisos que escucha: visibilitychange, pagehide y pageshow, freeze y resume (el ciclo de vida de la página), pause y resume en
   document (Capacitor los da en la APK cuando la actividad se pausa, aunque el WebView siga «visible») y app:pausa y app:sigue
   (los manda la actividad nativa).
   La misma pieza está en Motor City (js/01-sonido-guardian.js, para Turno Cero) y en El Metro (src/js/00b-sonido-guardian.js).
   Estado para las pruebas: window.guardianSonido (fuera, veces, contextos).
   ===================================================================== */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined' || window.guardianSonido) return;
  const W = window, AC = W.AudioContext || W.webkitAudioContext, ctxs = new Set(), medios = new Set(), dormidos = new Set(), pausados = new Set();
  let fuera = false, veces = 0;
  const G = W.guardianSonido = { get fuera() { return fuera; }, get veces() { return veces; }, get contextos() { return ctxs.size; }, callar, volver };
  if (AC) {
    const Guardado = class extends AC {
      constructor(...a) { super(...a); ctxs.add(this); if (fuera) { dormidos.add(this); super.suspend().catch(() => { }); } }
      resume() { if (fuera) { dormidos.add(this); return Promise.resolve(); } return super.resume(); }
    };
    try { W.AudioContext = Guardado; if (W.webkitAudioContext) W.webkitAudioContext = Guardado; } catch (e) { /* sin reemplazo: quedan los medios */ }
  }
  const MP = W.HTMLMediaElement && W.HTMLMediaElement.prototype, play0 = MP && MP.play;
  if (play0) MP.play = function () { medios.add(this); if (fuera) { pausados.add(this); return Promise.resolve(); } return play0.apply(this, arguments); };
  function callar() {
    if (fuera) return; fuera = true; veces++;
    for (const c of ctxs) if (c.state === 'running') { dormidos.add(c); c.suspend().catch(() => { }); }
    for (const m of medios) if (!m.paused) { pausados.add(m); try { m.pause(); } catch (e) { /* nada */ } }
    try { if (W.speechSynthesis) W.speechSynthesis.cancel(); } catch (e) { /* sin voz */ }
  }
  function volver() {
    if (!fuera || document.hidden) return; fuera = false;
    for (const c of dormidos) if (c.state !== 'closed') c.resume().catch(() => { });
    dormidos.clear();
    for (const m of pausados) { try { const p = play0.call(m); if (p && p.catch) p.catch(() => { }); } catch (e) { /* nada */ } }
    pausados.clear();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) callar(); else volver(); });
  W.addEventListener('pagehide', callar); W.addEventListener('pageshow', volver);
  document.addEventListener('freeze', callar); document.addEventListener('resume', volver);
  document.addEventListener('pause', callar);
  W.addEventListener('app:pausa', callar); W.addEventListener('app:sigue', volver);
})();
