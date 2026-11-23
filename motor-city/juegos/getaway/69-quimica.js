/* =====================================================================
   TURNO CERO · 5.2 · G5-08 · PUENTE DE QUÍMICA DEL MUNDO
   Módulo aditivo que conecta los eventos de MC.QuimicaMundo con Turno Cero:
   - cuando la lluvia apaga el carro en llamas (quimica:apaga), limpia
     G.ardiendo sin explosión y avisa al jugador en español de Colombia.
   ===================================================================== */
(function () {
  if (typeof MC === 'undefined' || !MC.on) return;
  MC.on('quimica:apaga', ev => {
    if (!ev || typeof G === 'undefined') return;
    if (G.ardiendo && (!ev.sigue || ev.sigue === G.cuerpo || Math.hypot((G.cuerpo ? G.cuerpo.x : 0) - ev.x, (G.cuerpo ? G.cuerpo.y : 0) - ev.y) < 12)) {
      G.ardiendo = false;
      if (G.ui && G.ui.aviso) G.ui.aviso('🌧️ La lluvia apagó las llamas del carro (vapor H₂O)', 2800, 'quimica');
    }
  });
})();
