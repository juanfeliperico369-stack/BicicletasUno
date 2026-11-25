/* =====================================================================
   TURNO CERO · 4.5 · el sigilo a pie con la forma de Hunter Assassin (Ruby Games)
   Lo que se toma de ese juego (no su arte ni sus niveles): vista desde arriba, cerca y limpia, para leer de un vistazo
   las linternas de los guardias (40-dibujo.js: conos que se cortan en los muros) y las sombras donde esconderse.
   - Al entrar a pie en una misión de sigilo, la cámara pasa sola a 🗺️ cenital y se acerca; al salir, vuelve a la que tenías.
     Se apaga en ⏸ Menú («Sigilo desde arriba»).
   - Tocar un punto lleva al personaje por el camino (el «tocar para ir» del motor), como en Hunter Assassin.
   ===================================================================== */
(function () {
  const activo = () => leerG().sigiloCenital !== false;
  EXTRAS.hud.push(() => {
    const C = G.cuerpo; if (!C || !G.vistas) return;
    const en = activo() && Historia.p && Historia.p.tipo === 'sigilo' && C.veh.clase === 'pie' && (G.guardias || []).some(q => !q.fuera);
    if (en && !G._sigCam) {
      G._sigCam = { id: G.vistaId, zoom: G.camara.zoom }; G.vistaId = 'cenital'; G.vistas.usar('cenital', G.E);
      const L = G.camara.limites.zoom, tope = Math.min(L[1], 15 * (G.dEf || 1)); G.camara.zoom = clamp(Math.max(G.camara.zoom, L[0] + (tope - L[0]) * .55), L[0], tope);   /* 5.5.0: desde arriba, sin el tramo de casi tercera persona */
      G.ui.aviso('🔦 Sigilo: vista desde arriba. Evita las linternas y quédate en la sombra', 2600, 'sigcam');
    } else if (!en && G._sigCam) {
      const s = G._sigCam; G._sigCam = null; if (s.id && s.id !== 'cenital') { G.vistaId = s.id; G.vistas.usar(s.id, G.E); } G.camara.zoom = s.zoom;
    }
  });
  G.sigiloCenital = v => { escribirG({ sigiloCenital: !!v }); };
})();
