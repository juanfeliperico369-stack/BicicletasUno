/* =====================================================================
   MUNDO ABIERTO PRIMERO (Claude, 21‑nov‑2026) · regla del autor para todos los juegos de Motor City:
   «mundo abierto desde el principio; el tutorial y el contexto de la historia son opcionales y nunca bloquean».
   Antigravity lo midió en su auditoría G‑H28 (motor-city/reportes/2026-11-21-gemini-clasicos-4.1.md):
   aquí ▶ Jugar abría «BIENVENIDA 1 DE 4» y luego «Crea tu personaje» (4 toques o más y desplazar).
   - ▶ Jugar entra DIRECTO al modo libre: pedaleando por el valle con un ciclista listo (1 toque).
     Con EnCicla abierta sale en bici de EnCicla; de noche o con suspensión, en su bici.
   - Lo demás queda opcional:
     · un botón nuevo, «🏆 Escalafón» (antes «Oficios y modos»), lleva directo al escalafón (los 11 oficios, el álbum, las partidas);
     · la bienvenida está en «Cómo jugar»;
     · el personaje se arma cuando uno quiera, en Mi ciclista.
   Archivo aditivo (rango 98n–98z, libre según coord/agentes/antigravity.json): envuelve UI.init sin reescribir 60-ui.js.
   ===================================================================== */
(function () {
  const libreYa = () => {
    Snd.init(); Snd.resume && Snd.resume(); Snd.sfx('tap');
    const now = Cal.now(), f = Cal.fiesta(now), all = NOVEDADES.concat(typeof NOV_EXTRA !== 'undefined' ? NOV_EXTRA : []), id = Cal.cicloviaNow(now) ? 'ciclovia' : f && f.nov;
    const nov = (id && all.find(n => n.id === id)) || NOVEDADES[0], susp = JE.cuenta && JE.cuenta.suspHasta && JE.cuenta.suspHasta(), bici = Cal.open(now) && !susp ? 'encicla' : 'propia';
    Game.start('usuario', 1, { free: true, seed: Date.now() >>> 0, nov, bici });
  };
  const montar = () => {
    const play = document.getElementById('bPlay'); if (!play || !play.onclick || play.onclick === libreYa) return;
    /* el arranque puede asignar los botones después de que este archivo corre: se guarda el manejador original cada vez que aparezca uno nuevo */
    montar.viejo = play.onclick; play.onclick = libreYa; play.innerHTML = '▶ Jugar <small style="display:block;font-size:12px;font-weight:600;opacity:.85">Modo libre: pedalea por el valle</small>';
    /* 3.9.1 (el autor: «haz que en EnCicla aparezca el escalafón como botón en la pantalla de inicio, porque para ir a él hace falta
       ingresar al mundo abierto y luego salirse de allí»): el botón se llama 🏆 Escalafón y lleva directo a su pestaña, sin la
       bienvenida (sigue en Más › ¿Qué es EnCicla?). El personaje se crea la primera vez, como siempre (80-limpieza.js). */
    if (!document.getElementById('bOficios')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'bOficios'; b.setAttribute('aria-label', 'Escalafón: oficios, modos, álbum y partidas'); b.innerHTML = '🏆 Escalafón <small style="display:block;font-size:12px;font-weight:600;opacity:.85">Oficios, modos, álbum y partidas</small>'; b.onclick = () => { Snd.sfx && Snd.sfx('tap'); UI.tab = 'ruta'; UI.go('sHome'); UI.setTab('ruta'); }; play.insertAdjacentElement('afterend', b); }
  };
  /* UI.init asigna los botones al arrancar: se monta después */
  if (UI && UI.init) { const _init = UI.init; UI.init = function () { const r = _init.apply(this, arguments); try { montar(); } catch (e) { console.error(e); } return r; }; }
  window.addEventListener('load', () => setTimeout(() => { try { montar(); } catch (e) { /* aún no */ } }, 0));
})();
