/* =====================================================================
   TAMAÑOS E ICONOS (v2.1) · pedido del autor: «mejora los iconos y la información que se muestra en pantalla: a veces hay
   tantas cosas y tan grandes que tapan todo el juego; además el tamaño solo tiene dos opciones, grande o enorme».
   - CUATRO TAMAÑOS para textos y botones (Más → «Tamaño de textos y botones» y en la pausa): Pequeño ×0,8, Mediano ×0,9
     (el nuevo de siempre), Normal ×1 (el de antes) y Grande ×1,18 (la «letra grande» de antes). Escala con --u el HUD de
     arriba, los botones de acción y de cámara, los avisos, el consejo, las metas, el minimapa, el sello y las tarjetas.
   - ICONOS VECTORIALES nítidos (trazo, 24 × 24) en los botones de acción en vez de los íconos pixel ampliados.
   - AVISOS QUE NO TAPAN: más compactos (máx. 3 líneas) y los de una persona («… (Rosalba): …») pasan a la tarjeta
     pequeña con su cara, arriba a la izquierda.
   ===================================================================== */
const Tam = JE.tam = {
  K: [.8, .9, 1, 1.18], NOM: ['Pequeño', 'Mediano', 'Normal', 'Grande'],
  nivel() { const S = Save.data && Save.data.settings; if (!S) return 1; if (S.ui == null) S.ui = S.big ? 3 : 1; return clamp(S.ui | 0, 0, 3); },
  k() { return this.K[this.nivel()]; },
  poner(n) { const S = Save.data.settings; S.ui = clamp(n | 0, 0, 3); Save.save(); this.aplicar(); },
  aplicar() {
    const n = this.nivel(), S = Save.data.settings; S.big = n === 3; document.body.classList.toggle('big', n === 3); document.body.dataset.ui = n;
    document.documentElement.style.setProperty('--u', this.K[n]); if (Game.mode) { Game.actKey = ''; try { View.resize(); } catch (e) { } }
  }
};
/* iconos de las acciones: trazos sencillos, sin relleno (se ven nítidos en cualquier tamaño y pantalla) */
const ICO21 = {
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 20.5a2 2 0 0 0 4 0',
  dock: 'M3 20h18 M6 20V10l6-5 6 5v10 M10 20v-5h4v5 M12 9v3',
  renovar: 'M20 12a8 8 0 1 1-2.3-5.7 M20 4v4h-4',
  foto: 'M4 8h3l2-3h6l2 3h3v11H4z M12 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  sit: 'M4 11h16 M5 11V8h14v3 M6 11v7 M18 11v7 M4 14.5h16',
  up: 'M12 6.5a2 2 0 1 0 0-.01 M12 9v6 M8 11.5h8 M12 15l-3 5 M12 15l3 5',
  paseo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M15.5 8.5l-2 5-5 2 2-5z',
  paseoOff: 'M4 13h16 M12 13v7 M7 9a5 5 0 0 1 10 0 M9 20h6',
  on: 'M6 17.5a3 3 0 1 0 0-.01 M18 17.5a3 3 0 1 0 0-.01 M6 17.5l4-7h5l3 7 M10 10.5l-1.2-3H7 M14 7.5h2.5',
  off: 'M13.5 5a1.6 1.6 0 1 0 0-.01 M10 21l2.2-6 3 3v3 M8.5 11l3.5-2.5 2.8 3 2.2.8 M12 8.5l-1.3 6',
  trama: 'M3 6.5c3-1.3 6-1.3 9 .7 3-2 6-2 9-.7v12.5c-3-1.3-6-1.3-9 .7-3-2-6-2-9-.7z M12 7.2v13',
  taller: 'M14.5 5.5a4 4 0 0 0 4.9 4.9l-8.6 8.6a2.1 2.1 0 0 1-3-3l8.6-8.6a4 4 0 0 0-1.9-1.9z',
  jump: 'M12 17V5 M7 10l5-5 5 5 M4 20h16',
  veh: 'M5 17.5a2 2 0 1 0 0-.01 M19 17.5a2 2 0 1 0 0-.01 M5 17.5h9l4-9h2 M14 17.5l-2-9', vehiculo: 'M5 17.5a2 2 0 1 0 0-.01 M19 17.5a2 2 0 1 0 0-.01 M5 17.5h9l4-9h2 M14 17.5l-2-9',
  runner3d: 'M5 20V4 M5 4h12l-2 4 2 4H5'
};
const icoSVG = id => ICO21[id] ? `<svg class="ico21" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICO21[id]}"/></svg>` : '';
(function () {
  /* el tamaño se aplica al arrancar y se elige en Más (y en la pausa, con un toque que recorre los cuatro) */
  const _init = UI.init; UI.init = function () { const r = _init.apply(this, arguments); try { Tam.aplicar(); } catch (e) { console.error(e); } return r; };
  if (Save.data) try { Tam.aplicar(); } catch (e) { /* aún no hay interfaz */ }
  const _mas = UI.renderMas;
  UI.renderMas = function () { _mas.call(this); $$('#tab-mas [data-ui]').forEach(b => b.onclick = () => { Snd.sfx('tap'); Tam.poner(+b.dataset.ui); this.renderMas(); }); };
  const _pause = Game.pause;
  Game.pause = function () {
    _pause.call(this); const go = $('#pGo'); if (!go) return; const b = document.createElement('button'); b.className = 'btn'; b.id = 'pTam';
    const lbl = () => { b.textContent = '🔠 Tamaño: ' + Tam.NOM[Tam.nivel()]; }; lbl(); const ref = $('#pAsist') || $('#pVel') || go; ref.after(b); b.onclick = () => { Tam.poner((Tam.nivel() + 1) % 4); lbl(); Snd.sfx('tap'); };
  };
  /* los botones de acción con su icono vectorial (si lo hay) */
  if (typeof HUD21 !== 'undefined') {
    const _boton = HUD21.boton; HUD21.boton = function (x, i, cls) { const s = icoSVG(x.id); if (!s) return _boton.call(this, x, i, cls); return `<button class="abtn ${cls}${x.label.length > 8 ? ' l9' : x.label.length > 6 ? ' l7' : ''}" data-i="${i}" aria-label="${esc(x.label)}">${s}<span>${esc(x.label.replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+\s*/, ''))}</span></button>`; };
    const _abrir = HUD21.abrir; HUD21.abrir = function (M, rep) { _abrir.call(this, M, rep); $$('#actMas button').forEach(b => { const x = M.actions()[+b.dataset.i]; const s = x && icoSVG(x.id); if (s) { const img = b.querySelector('img'); if (img) img.outerHTML = s; const tx = [...b.childNodes].find(n => n.nodeType === 3); if (tx) tx.textContent = tx.textContent.replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+\s*/, ''); } }); };
  }
  /* avisos: lo que dice una persona conocida va a su tarjeta con cara; lo demás, compacto */
  const _toast = UI.toast;
  UI.toast = function (t) {
    const m = typeof t === 'string' && typeof Caras !== 'undefined' && !JE.headless && Game.mode && t.match(/^\S+\s+(.+?)\s+\(([^)]+)\):\s+(.+)$/);
    if (m && (CARAS21[m[2]] || /Rosalba|Efraín|Marleny|Wílmar|Libardo|Jhon/.test(m[2]))) { Caras.charla(m[2], m[1], m[3]); return; }
    return _toast.apply(this, arguments);
  };
})();
