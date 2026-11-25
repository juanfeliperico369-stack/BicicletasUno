/* =====================================================================
   LA CÁMARA ÚNICA (3.10.0 · Claude, 25‑nov‑2026)
   El autor: «Hay que eliminar las cámaras, la de maqueta, la de panorámica 2D, etc. Ya dije que debe prevalecer» el mundo
   «enteramente en un 3D, para jugarse en vista cenital de cámara más bien centrada y que se puede mover al gusto, acercarse y
   alejarse, y así añadiría un poco la forma de tercera persona».
   - En el mundo queda una sola cámara: la cenital 3D. Se fueron la oblicua, la tercera y la primera persona (WebGL), la
     panorámica 2D y la maqueta 2:1, con su selector, el botón 3D y la entrada de la pausa. Los guardados viejos pasan a la cenital.
   - Se mueve al gusto: pellizcar acerca y aleja, dos dedos giran e inclinan, 📷 la suelta para mirar la ciudad y ⬆ vuelve al norte.
   - Acercarse suma un poco de tercera persona: desde el zoom 1,2 la cámara se inclina sola (hasta 0,62 en el tope, 2,7) y desde
     1,9 se va detrás del rumbo; al alejarte vuelve a la cenital pura. El 🎥 pasa por cuatro acercamientos: de lejos, cenital,
     de cerca y casi tercera persona.
   - Los miradores (🔭) conservan su vista contemplativa mientras dura la visita: es un momento del juego, no una cámara.
   - El estilo Pixel World sigue en Más › Gráficos: es un estilo, no una cámara.
   Archivo aditivo y el último en cargar: envuelve Vistas (99o), Cam.tick (88) y Game.start, sin reescribirlos.
   ===================================================================== */
(function () {
  if (typeof Cam === 'undefined' || !JE.vistas) return;
  const V = JE.vistas, ZOOMS = [[.72, '🛰️', 'de lejos'], [1, '🗺️', 'cenital'], [1.55, '🔎', 'de cerca'], [2.7, '🎮', 'casi tercera persona']];
  const Z_INCLINA = 1.2, Z_TOPE = 2.7, T_MAX = .62, Z_SIGUE = 1.9;
  Cam.ZMAX = Z_TOPE;
  const estilo = document.createElement('style'); estilo.textContent = '#b3D,#pVista,#camPop{display:none!important}'; document.head.appendChild(estilo);
  /* los guardados y estados viejos (panorámica, maqueta, tercera o primera persona) pasan a la cenital */
  const aCenital = () => {
    const S = Save.data && Save.data.settings; if (!S) return;
    if (S.vista === 'pano') S.vista = 'cenital'; if (S.vista3d && S.vista3d !== 'cenital' && S.vista3d !== 'oblicua') S.vista3d = 'cenital';
    if (typeof Mundo3D !== 'undefined' && Mundo3D.modo && !Mundo3D.mirador) V._syncGL('cenital');
  };
  const Unica = JE.camaraUnica = {
    ZOOMS, obj: null, _z: 0,
    actual() { const z = Cam.cfg().z || 1; let i = 0, d = 1e9; ZOOMS.forEach((q, k) => { const e = Math.abs(Math.log(z / q[0])); if (e < d) { d = e; i = k; } }); return i; },
    /* el 🎥: el siguiente acercamiento, con un paso suave */
    siguiente() {
      if (!Cam.d3()) { Cam.zoom(1.5); return null; }
      const Q = ZOOMS[(this.actual() + 1) % ZOOMS.length]; this.obj = Q[0];
      if (JE.ui) JE.ui.toast(Q[1] + ' Cámara ' + Q[2] + ' · pellizca para acercar o alejar y gira con dos dedos');
      return Q;
    },
    /* el zoom manda: más cerca, más inclinada y, desde Z_SIGUE, detrás del rumbo */
    acoplar(C) {
      const z = C.z || 1, u = clamp(Math.log(z / Z_INCLINA) / Math.log(Z_TOPE / Z_INCLINA), 0, 1);
      C.t = T_MAX * u * u * (3 - 2 * u);
      const sig = z >= Z_SIGUE ? 1 : 0; if (sig !== (C.sigue | 0)) { C.sigue = sig; if (!sig) C.r = 0; }
    }
  };
  /* el selector ya no existe: cualquier vista es la cenital (sin tocar el zoom ni el ángulo) */
  V.lista = V.lista.filter(v => v.id === 'cenital');
  V.poner = function () {
    const S = Save.data && Save.data.settings; if (!S) return; S.vista = 'cenital'; S.vista3d = 'cenital'; this._syncGL('cenital'); Save.save();
    View.rotOn = false; View.rot = 0; View.apply(); if (Game.mode && Game.mode.ride) { Cam.barra(Game.mode); Game.layout(true); }
  };
  V.actual = () => 'cenital'; V.esPersp = () => false; V.esMaqueta = () => false;
  V.siguiente = () => Unica.siguiente(); V.togglePop = () => { Unica.siguiente(); }; V.pintarPop = () => { }; V.cerrarPop = () => { };
  /* el 🎥 dice lo que hace ahora */
  const barra0 = Cam.barra; Cam.barra = function () { const r = barra0.apply(this, arguments), b = document.querySelector('#camBar [data-cam="ang"]'); if (b) { const t = 'Cámara cenital ' + ZOOMS[Unica.actual()][2] + ': toca para acercar o alejar'; if (b.title !== t) { b.title = t; b.setAttribute('aria-label', t); } } return r; };
  const start0 = Game.start; Game.start = function () { aCenital(); return start0.apply(this, arguments); };
  const tick0 = Cam.tick;
  Cam.tick = function (R, dt) {
    const C = this.cfg();
    if (Unica.obj != null) { C.z = Unica.obj + (C.z - Unica.obj) * Math.exp(-dt * 7); if (Math.abs(C.z - Unica.obj) < .004) { C.z = Unica.obj; Unica.obj = null; Save.save(); } }
    if (this.d3() && Math.abs((C.z || 1) - Unica._z) > 1e-4) { Unica._z = C.z || 1; Unica.acoplar(C); }
    aCenital();
    return tick0.apply(this, arguments);
  };
})();
