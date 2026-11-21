/* =====================================================================
   MUNDO ABIERTO PRIMERO (Claude, 21‑nov‑2026) · regla del autor para todos los juegos de Motor City:
   «mundo abierto desde el principio; el tutorial y el contexto de la historia son opcionales y nunca bloquean».
   Antigravity lo midió en su auditoría G‑H28 (motor-city/reportes/2026-11-21-gemini-clasicos-4.1.md):
   aquí ▶ Jugar abría «BIENVENIDA 1 DE 4» y luego «Crea tu personaje» (4 toques o más y desplazar).
   - ▶ Jugar entra DIRECTO al modo libre: pedaleando por el valle con un ciclista listo (1 toque).
     Con EnCicla abierta sale en bici de EnCicla; de noche o con suspensión, en su bici.
   - Lo demás queda opcional:
     · un botón nuevo, «🏆 Oficios y modos», lleva al escalafón (los 11 oficios, el álbum, las partidas);
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
    if (!document.getElementById('bOficios')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'bOficios'; b.textContent = '🏆 Oficios y modos'; b.onclick = e => { Snd.sfx && Snd.sfx('tap'); montar.viejo && montar.viejo.call(play, e); }; play.insertAdjacentElement('afterend', b); }
  };
  /* UI.init asigna los botones al arrancar: se monta después */
  if (UI && UI.init) { const _init = UI.init; UI.init = function () { const r = _init.apply(this, arguments); try { montar(); } catch (e) { console.error(e); } return r; }; }
  window.addEventListener('load', () => setTimeout(() => { try { montar(); } catch (e) { /* aún no */ } }, 0));
})();
