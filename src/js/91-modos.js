/* ---------- Modos: registro para sumar juegos nuevos al menú (la carrera sin fin de Run Scooter, por ejemplo) ----------
   JE.modos.registrar({ id, name, cls, niveles, how, desc, emoji, icon, tier, vista, menu })
     id        minúsculas, único ('sinfin'); no puede ser el de un oficio
     name      nombre en el menú y arriba en el juego ('Carrera sin fin')
     cls       la clase del modo: extends Mode (pantalla propia) o MapMode (en el mapa). Ver docs/INTEGRAR.md
     niveles   nombres de los niveles (['Fácil', 'Rápida', 'Turbo']); cada nivel gana sus estrellas como un turno
     how       2 a 4 frases de cómo se juega (se leen antes de empezar)
     desc      una frase para el menú · emoji: el del título del panel · icon: ícono de Art.iconURL ('usuario', 'balance'…)
     menu      false: no sale en el menú (solo con Game.start o desde otro modo)
   Sale en la pestaña Ruta, debajo de la carrera de postales, con un botón por nivel. No suma a las estrellas del escalafón
   ni a sus logros, y no usa las mejoras de los oficios: todos juegan en igualdad. */
const isJuego = id => !!(ROLE[id] && ROLE[id].juego);
JE.modos = {
  lista: [],
  registrar(d) {
    if (!d || !/^[a-z][a-z0-9_-]{1,23}$/.test(d.id || '')) throw new Error('modo: id inválido «' + (d && d.id) + '» (minúsculas, de 2 a 24)');
    if (ROLE[d.id] && !ROLE[d.id].juego) throw new Error('modo: «' + d.id + '» ya es un oficio');
    if (typeof d.cls !== 'function') throw new Error('modo: falta la clase (cls) de «' + d.id + '»');
    const niveles = d.niveles && d.niveles.length ? d.niveles.slice(0, 5) : ['Normal'];
    ROLE[d.id] = { id: d.id, n: 0, name: d.name || d.id, tier: d.tier || 'Juego', icon: d.icon || 'usuario', vista: d.vista || '', unlock: 0, desc: d.desc || '', how: (d.how || []).slice(0, 4), juego: 1, shifts: niveles.map(n => ({ n, h: '' })) };
    MODE_CLASS[d.id] = d.cls;
    const i = this.lista.findIndex(x => x.id === d.id); if (i >= 0) this.lista[i] = d; else this.lista.push(d);
    return ROLE[d.id];
  },
  /* para las pruebas y para quitar uno a mano */
  quitar(id) { const i = this.lista.findIndex(x => x.id === id); if (i < 0) return false; this.lista.splice(i, 1); delete ROLE[id]; delete MODE_CLASS[id]; return true; }
};
/* el panel de cada juego registrado en el menú, debajo de la carrera de postales */
const _ruta91 = UI.renderRuta;
UI.renderRuta = function () {
  const r = _ruta91.apply(this, arguments), L = JE.modos.lista.filter(d => d.menu !== false && ROLE[d.id]); if (!L.length) return r;
  const el = $('#tab-ruta'), ref = $('.paper.race', el);
  const h = L.map(d => `<div class="paper juego" data-jg="${esc(d.id)}"><div class="t">${esc(d.emoji || '🎮')} ${esc(ROLE[d.id].name)}</div>${d.desc ? `<p style="margin:6px 0 0">${esc(d.desc)}</p>` : ''}<div class="row" style="margin-top:10px">${ROLE[d.id].shifts.map((s, i) => `<button class="btn sm${i ? '' : ' pri'}" data-juego="${esc(d.id)}" data-lv="${i + 1}">${esc(s.n)}<small style="display:block;opacity:.8">${'★'.repeat(this.stars(d.id)[i] | 0)}</small></button>`).join('')}</div></div>`).join('');
  if (ref) ref.insertAdjacentHTML('afterend', h); else el.insertAdjacentHTML('afterbegin', h);
  $$('[data-juego]', el).forEach(b => b.onclick = () => { Snd.sfx('tap'); this.brief(b.dataset.juego, +b.dataset.lv, { nov: NOVEDADES[0] }); });
  return r;
};
