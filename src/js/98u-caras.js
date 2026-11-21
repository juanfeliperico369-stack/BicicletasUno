/* =====================================================================
   CARAS DE LA GENTE DE ENCICLA (v2.1) · con los rostros de Motor City 4.5 (98t-rostros.js).
   Antes los mentores eran un retrato pixel de 12 × 12 y los vecinos de la trama solo un aviso de texto.
   Ahora cada persona tiene UNA cara, la misma en todas partes:
   - los 9 mentores de las historias (CAST), el tutor y «Un día del valle» (Historia.face);
   - los vecinos de la trama «Ruedas y Rieles» (EnCicla y El Metro): al hablarles sale una tarjeta con su cara, su nombre
     y lo que dicen, arriba a la izquierda, sin tapar el centro ni detener el juego;
   - Rosalba, Don Efraín, Doña Marleny y Wílmar se visten como en la biblia de estilo de El Metro
     (MetroZero/arte/00-biblia-de-estilo.md § 8): Rosalba ~60, uniforme azul #12446c, pelo canoso recogido, sonrisa cálida.
   Quien no esté en la lista tiene una cara estable sacada de su nombre (Rostro.azar).
   ===================================================================== */
const CARAS21 = {
  'Doña Luz': { piel: '#e0ac7e', pelo: '#d9d9d9', ojos: '#4a2f1a', peinado: 'moño', fem: true, edad: .72, ropa: '#b07cff', labios: '#b5645a' },
  'Santi': { piel: '#c68a5e', pelo: '#2b1d14', ojos: '#3b2414', peinado: 'corto', edad: .08, ropa: '#9bd341', barba: 'ninguna' },
  'Don Jairo': { piel: '#a86a3d', pelo: '#8a8580', ojos: '#3b2414', peinado: 'corto', edad: .62, ropa: '#143a6b', barba: 'bigote', acc: ['gorra'], colorGorra: '#0e2d55' },
  'Yuli': { piel: '#e0ac7e', pelo: '#5a2d0c', ojos: '#4a2f1a', peinado: 'cola', fem: true, edad: .22, ropa: '#ffc93c', labios: '#c27a6a' },
  'Kevin': { piel: '#8d5524', pelo: '#141414', ojos: '#2c1a10', peinado: 'rapado', edad: .1, ropa: '#9bd341', acc: ['gorra'], colorGorra: '#ffffff' },
  'Ing. Paola': { piel: '#f1c9a5', pelo: '#141414', ojos: '#3d5f86', peinado: 'largo', fem: true, edad: .3, ropa: '#0a2342', acc: ['gafas'], labios: '#9a4a48' },
  'Wilson': { piel: '#c68a5c', pelo: '#2b1d14', ojos: '#3b2414', peinado: 'corto', edad: .38, ropa: '#ff6b5a', barba: 'sombra' },
  'Cata': { piel: '#a86a3d', pelo: '#2b1d14', ojos: '#3b2414', peinado: 'rizado', fem: true, edad: .15, ropa: '#56c7ff', acc: ['arete'], labios: '#b5645a' },
  'Don Rubén': { piel: '#e0ac7e', pelo: '#bbbbbb', ojos: '#4a2f1a', peinado: 'canoso', edad: .75, ropa: '#0a2342', barba: 'candado' },
  'Rosalba': { piel: '#c68a5e', pelo: '#dcd8d0', ojos: '#3b2414', peinado: 'moño', fem: true, edad: .78, ropa: '#12446c', labios: '#b5645a' },
  'Don Efraín': { piel: '#e8bd98', pelo: '#e9e6e0', ojos: '#4a2f1a', peinado: 'canoso', edad: .85, ropa: '#5a6470', barba: 'bigote', acc: ['audifono'] },
  'Doña Marleny': { piel: '#c68a5e', pelo: '#16110d', ojos: '#3b2414', peinado: 'moño', fem: true, edad: .58, ropa: '#c8201f', labios: '#9a4a48' },
  'Wílmar': { piel: '#8a5a3b', pelo: '#16110d', ojos: '#2c1a10', peinado: 'corto', edad: .4, ropa: '#f2f2f2', barba: 'bigote', acc: ['gorra'], colorGorra: '#1c5c9c' },
  'Don Libardo': { piel: '#e8bd98', pelo: '#9a9690', ojos: '#4a2f1a', peinado: 'canoso', edad: .65, ropa: '#0a2342', barba: 'sombra' },
  'Jhon': { piel: '#c68a5e', pelo: '#16110d', ojos: '#3b2414', peinado: 'rizado', edad: .05, ropa: '#e38835' }
};
const Caras = JE.caras = {
  hash(t) { let h = 2166136261; for (const ch of String(t)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; },
  de(nombre) { return CARAS21[nombre] || (this._azar || (this._azar = {}))[nombre] || (this._azar[nombre] = Rostro21.azar(this.hash(nombre))); },
  url(nombre, tam = 96, expresion = 'sonrisa') { try { return Rostro21.url(this.de(nombre), tam, { expresion }); } catch (e) { JE.errors && JE.errors.push('cara: ' + e.message); return ''; } },
  /* tarjeta de charla: cara, nombre, oficio y lo que dice; no detiene el juego y se va sola */
  charla(nombre, rol, txt, ms) {
    let el = $('#charla'); if (!el) { el = document.createElement('div'); el.id = 'charla'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); ($('#sGame') || document.body).appendChild(el); }
    el.innerHTML = `<img src="${this.url(nombre, 96)}" alt=""><div><b>${esc(nombre)}</b>${rol ? `<small>${esc(rol)}</small>` : ''}<p>«${esc(txt)}»</p></div>`;
    el.classList.add('on'); clearTimeout(this._t); this._t = setTimeout(() => el.classList.remove('on'), ms || clamp(2200 + txt.length * 45, 3200, 7000));
  },
  ocultar() { const el = $('#charla'); if (el) el.classList.remove('on'); clearTimeout(this._t); }
};
(function () {
  /* los mentores: la misma cara en las historias, el tutor, «Un día del valle» y Personajes */
  const _face = Historia.face;
  Historia.face = function (roleId) { const C = CAST[roleId]; if (!C) return _face.call(this, roleId); const u = Caras.url(C[0], 96, 'sonrisa'); return u || _face.call(this, roleId); };
  /* la trama: hablarle a un vecino muestra su tarjeta (el aviso de texto sigue para los lectores de pantalla) */
  if (typeof Trama !== 'undefined') {
    const _hablar = Trama.hablar;
    Trama.hablar = function (M, p) {
      p = p || this.cerca(M); if (!p) return; const ui = JE.ui, _toast = ui && ui.toast;
      if (ui) ui.toast = function (t) { if (/^💬 /.test(t)) return; return _toast.apply(this, arguments); };   /* la tarjeta lo dice (y se anuncia: aria-live) */
      try { _hablar.call(this, M, p); } finally { if (ui) ui.toast = _toast; }
      if (JE.headless) return; Caras.charla(p.name, p.rol, p.saludo);
    };
  }
  for (const k of ['stop', 'finish', 'start']) { const f = Game[k]; Game[k] = function () { Caras.ocultar(); return f.apply(this, arguments); }; }
  /* mientras habla alguien, el consejo de arriba a la izquierda se esconde (están en el mismo sitio) */
  const _dom = Game.dom; Game.dom = function (dt) { _dom.call(this, dt); const ch = $('#charla'), co = $('#coach'); if (ch && co && ch.classList.contains('on') && co.style.opacity !== '0') co.style.opacity = '0'; };
  /* Personajes: los mentores con su cara y, debajo, los 15 vecinos de la trama (EnCicla y El Metro), con dónde encontrarlos */
  const _pers = UI.personajes;
  UI.personajes = function () {
    _pers.call(this); const box = $('#mBody'); if (!box || typeof Trama === 'undefined') return;
    const intro = box.querySelector('p.m'); if (intro) intro.textContent = 'La gente que mueve EnCicla. Cada mentor cuenta su historia en los turnos de su oficio.';
    const prox = [...box.querySelectorAll('.paper')].find(d => /Próximamente/.test(d.textContent)); if (!prox) return;
    const E = Trama.estado(), L = Trama.personajes();
    prox.outerHTML = `<p class="pag" style="margin:14px 0 6px">Vecinos del valle · «Ruedas y Rieles» (${E.charlas.length}/${L.length} saludados)</p><div class="chars">` + L.map(p => { const ok = E.charlas.includes(p.id);
      return `<div class="char${ok ? '' : ' nuevo21'}"><img src="${Caras.url(p.name, 96, ok ? 'sonrisa' : 'neutral')}" alt=""><div><b>${ok ? '✓ ' : ''}${esc(p.name)}</b><div class="pag">${esc(p.rol)} · ${esc(p.juego || 'EnCicla')}</div><small>${ok ? '«' + esc(p.saludo) + '»' : '📍 Búscalo en ' + esc(p.lugar) + ' y pasa cerca en el modo libre para saludar.'}</small></div></div>`; }).join('') + '</div>';
  };
})();
