/* =====================================================================
   TURNO CERO · 4.2 · el mundo abierto primero, la historia se encuentra (como los marcadores de misión de GTA)
   Pedido del autor: «mundo abierto desde el principio; el tutorial o el contexto de historia es opcional».
   - En el mundo abierto, donde empieza el próximo capítulo (o donde quedó la historia) hay un 📖 en la calle y en el minimapa.
   - Al pasar cerca, el juego solo AVISA: «📖 Aquí empieza…». Nada se abre solo; se juega si uno toca 📖 Historia (o la tecla H).
   - Si el capítulo es en otra ciudad, el 📖 lo dice en el aviso al llegar al mundo abierto.
   ===================================================================== */
const Abierto = {
  _t: 0, _cerca: false, _marca: null,
  /* dónde está la historia ahora: el punto donde quedó (si es en esta ciudad) o el inicio del próximo capítulo */
  marca() {
    if (G.modo !== 'libre' || G.contrato || !G.M || !G.M.esCiudad) return null;
    const S = leerG();
    if (S.hist && TC.HISTORIA[S.hist.cap]) { const K = S.hist, H = TC.HISTORIA[K.cap]; return K.mundo === G.id ? { x: K.x, y: K.y, seguir: true, cap: K.cap, texto: 'Acto ' + H.acto + ' · ' + H.titulo } : { lejos: K.mundo, seguir: true, cap: K.cap, texto: 'Acto ' + H.acto + ' · ' + H.titulo }; }
    const n = S.capitulos || 0; if (n >= TC.HISTORIA.length) return null; const H = TC.HISTORIA[n];
    if (H.mundo !== G.id) return { lejos: H.mundo, cap: n, texto: 'Acto ' + H.acto + ' · ' + H.titulo };
    const clave = H.inicio || ((H.pasos || []).find(p => p.a && TC.LUGARES[p.a] && TC.LUGARES[p.a].mundo === G.id) || {}).a; const r = clave ? resolver(clave) : null;
    return r ? { x: r.x, y: r.y, cap: n, texto: 'Acto ' + H.acto + ' · ' + H.titulo } : null;
  },
  paso(dt) {
    if ((this._t -= dt) > 0) return; this._t = .5; const m = this._marca = this.marca(); if (!m || m.lejos) { this._cerca = false; return; }
    const C = G.cuerpo, d = Math.hypot(m.x - C.x, m.y - C.y);
    if (d < 30 && !this._cerca) { this._cerca = true; G.ui.aviso('📖 Aquí ' + (m.seguir ? 'sigue' : 'empieza') + ' «' + m.texto + '». Si quieres jugarlo, toca 📖 Historia (es opcional)', 3400, 'historia'); if (BOT.historia) { BOT.historia.classList.add('pulso'); setTimeout(() => BOT.historia && BOT.historia.classList.remove('pulso'), 3400); } }
    else if (d > 60) this._cerca = false;
  },
  /* el 📖 en la calle: un pin que respira, con el nombre del capítulo de cerca */
  dibujar(g, pr, d, t) {
    const m = this._marca; if (!m || m.lejos) return; const p = pr(m.x, m.y, 0); if (!p) return;
    const r = (11 + Math.sin(t * 3) * 2) * d, dist = Math.hypot(m.x - G.cuerpo.x, m.y - G.cuerpo.y);
    g.save(); g.fillStyle = 'rgba(170,120,255,.22)'; g.beginPath(); g.arc(p[0], p[1], r * 2.2, 0, TAU); g.fill();
    g.fillStyle = '#7d4fd6'; g.strokeStyle = '#fff'; g.lineWidth = 2 * d; g.beginPath(); g.arc(p[0], p[1] - r * 1.6, r, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(p[0] - r * .45, p[1] - r * .9); g.lineTo(p[0], p[1]); g.lineTo(p[0] + r * .45, p[1] - r * .9); g.fillStyle = '#7d4fd6'; g.fill();
    g.font = Math.round(r * 1.1) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('📖', p[0], p[1] - r * 1.6);
    if (dist < 220) { g.font = '700 ' + Math.round(11 * d) + 'px system-ui'; g.textBaseline = 'alphabetic'; g.lineWidth = 3 * d; g.strokeStyle = 'rgba(0,0,0,.75)'; const txt = m.texto + ' · ' + Math.round(dist) + ' m'; g.strokeText(txt, p[0], p[1] - r * 3); g.fillStyle = '#e9dcff'; g.fillText(txt, p[0], p[1] - r * 3); }
    g.restore();
  }
};
(function () {
  EXTRAS.capas.push((g, pr, d, t) => Abierto.dibujar(g, pr, d, t));
  EXTRAS.mapa.push(pts => { const m = Abierto._marca; if (m && !m.lejos) pts.push({ x: m.x, y: m.y, color: '#a57bff' }); });
  EXTRAS.hud.push(() => Abierto.paso(.25));   /* hud() corre cada 0,25 s */
  /* al entrar al mundo abierto: si la historia sigue en otra ciudad, se dice una vez (sin llevarte allá) */
  const _emp = Libre.empezar; Libre.empezar = async function (id, donde, op = {}) { const r = await _emp.call(this, id, donde, op); Abierto._t = 0; const m = Abierto.marca();
    if (m && m.lejos) setTimeout(() => G.modo === 'libre' && G.ui.aviso('📖 La historia (opcional) sigue en ' + ((planeta.def(m.lejos) || {}).nombre || m.lejos) + ': «' + m.texto + '». Ve cuando quieras, por carretera o con 📖 Historia', 4200, 'historia'), 4000);
    return r; };
  const css = document.createElement('style'); css.textContent = '@keyframes pulsoHist{0%,100%{box-shadow:0 0 0 0 #a57bff00}50%{box-shadow:0 0 0 6px #a57bff99}}.pulso{animation:pulsoHist .9s ease-in-out 4}'; document.head.appendChild(css);
  G.Abierto = Abierto;
})();
