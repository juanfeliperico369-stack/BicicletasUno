/* =====================================================================
   LOS ENCARGOS DE LOS VECINOS (ronda 3.3, Claude) · del plan § 4.5: «vecinos con encargos encadenados, 3 a 5 encargos cada
   uno, con su final». Los vecinos son los personajes que ya viven en el valle (EnCicla y El Metro, 93-trama.js); las historias
   están en contenido/guion/encargos.json (texto aparte del código: se pueden escribir más sin programar).
   - Cuando un vecino tiene un encargo, sobre su nombre sale ❗; al acercarte, la acción «💬 Encargo» lo empieza.
   - Cada paso marca su destino (un lugar del valle o a otro vecino); al llegar, el vecino habla en su tarjeta con cara
     (Caras.charla) y sigue el próximo paso. Algunos pasos piden algo: ir A PIE o llegar DE NOCHE.
   - Al terminar: puntos, hojas, una nota en el diario y, con 3 historias, el logro «Buen vecino».
   - «Hoy en el valle» sugiere el paso que tengas activo o al vecino que te necesita más cerca.
   Un encargo a la vez. Se guarda en 'encargos' (objeto), registrada como pide 98v-claves.js.
   ===================================================================== */
Save.registrar('encargos', 'objeto', 'encargos de los vecinos (99l-vecinos.js)');
const Encargos = JE.encargos = {
  lista() { return typeof GUION !== 'undefined' && Array.isArray(GUION.encargos) ? GUION.encargos : []; },
  d() { const S = Save.data; if (!S.encargos || typeof S.encargos !== 'object' || Array.isArray(S.encargos)) S.encargos = {}; const D = S.encargos; if (!D.paso || typeof D.paso !== 'object') D.paso = {}; if (!Array.isArray(D.hechos)) D.hechos = []; if (D.activo === undefined) D.activo = null; return D; },
  pers(id) { return typeof Trama !== 'undefined' ? Trama.personajes().find(p => p.id === id) || null : null; },
  de(pid) { const D = this.d(); return this.lista().find(e => e.quien === pid && !D.hechos.includes(e.id)) || null; },
  activo() { const D = this.d(); return D.activo ? this.lista().find(e => e.id === D.activo) || null : null; },
  paso(E) { return E ? E.pasos[this.d().paso[E.id] | 0] || null : null; },
  lugar(ref) {
    const [k, id] = String(ref).split(':');
    if (k === 'lm') { const L = typeof LM !== 'undefined' && LM[id]; return L ? { x: (L.x + L.w / 2) * TS, y: (L.y + L.h) * TS + 6 * WK, name: L.name } : null; }
    if (k === 'p') { const p = this.pers(id); return p ? { x: p.x, y: p.y + 8 * WK, name: p.name } : null; }
    return null;
  },
  decir(pid, txt) { const p = this.pers(pid); if (!txt) return; if (p && typeof Caras !== 'undefined' && !JE.headless) Caras.charla(p.name, p.rol, txt, 7000); else if (JE.ui) JE.ui.toast('💬 ' + (p ? p.name + ': ' : '') + txt); },
  empezar(M, E) {
    if (!M || !M.ride || !E) return; const D = this.d(); if (D.activo && D.activo !== E.id) { if (JE.ui) JE.ui.toast('💬 Primero termina el encargo que llevas'); return; }
    D.activo = E.id; D.paso[E.id] = D.paso[E.id] | 0; Save.save(); Snd.sfx('ok');
    const st = this.paso(E); this.decir(E.quien, st.pide); this.marcar(M, true);
    if (JE.diario) JE.diario.anotar('Empezaste «' + E.titulo + '» con ' + ((this.pers(E.quien) || {}).name || E.quien), '💬');
  },
  /* el destino del paso activo: marcador y GPS */
  marcar(M, guia) {
    const R = M && M.ride; if (!R) return; if (M.encMarca) { R.removeMarker(M.encMarca); M.encMarca = null; }
    const E = this.activo(), st = this.paso(E); if (!E || !st) return; const L = this.lugar(st.a); if (!L) return;
    const o = JE.map.nearestOpen(Math.floor(L.x / TS), Math.floor(L.y / TS), false), x = o.x * TS + TS / 2, y = o.y * TS + TS / 2;
    M.encMarca = R.marker({ x, y, r: 18, col: '#ffb300', label: '💬 ' + st.corto, enter: () => this.llegar(M) });
    if (guia) { R.target = M.encMarca; if (R.calcGps) try { R.calcGps(); } catch (e) { } }
  },
  llegar(M) {
    const E = this.activo(), st = this.paso(E), R = M && M.ride; if (!E || !st || !R) return;
    if (st.veh && R.p.veh !== st.veh) { if (JE.ui) JE.ui.toast(st.veh === 'walk' ? '🚶 Este paso es a pie: toca «Bajarse» y camina hasta aquí' : '🚲 Este paso va en ' + st.veh); Snd.sfx('bad'); return; }
    if (st.noche && !(Art.night(M.clock || 0) > .5)) { if (JE.ui) JE.ui.toast('🌙 Este paso es de noche: vuelve después de las 6:30 p. m. (o siéntate en una banca a esperar)'); Snd.sfx('bad'); return; }
    const D = this.d(); D.paso[E.id] = (D.paso[E.id] | 0) + 1; Snd.sfx('star');
    const sig = this.paso(E), quien = st.a.startsWith('p:') ? st.a.slice(2) : E.quien;
    if (sig) { this.decir(quien, (st.luego ? st.luego + ' ' : '') + sig.pide); Save.save(); this.marcar(M, true); return; }   /* habla quien está donde llegaste (o el dueño del encargo, si llegaste a un lugar) */
    /* final */
    D.hechos.push(E.id); D.activo = null; if (M.encMarca) { R.removeMarker(M.encMarca); M.encMarca = null; }
    const pts = E.premio || 50; M.score += pts; Save.data.stats.leaves = (Save.data.stats.leaves | 0) + 5;
    this.decir(E.quien, (st.luego ? st.luego + ' ' : '') + E.final); R.float('💬 ' + E.titulo + ' +' + pts, PAL.amb); if (typeof confetti === 'function' && !JE.headless) try { confetti(2); } catch (e) { }
    if (JE.diario) JE.diario.anotar('Terminaste «' + E.titulo + '»: ' + E.final, '🏡');
    const nw = typeof Logros !== 'undefined' ? Logros.check() : []; if (nw && nw.length && JE.ui) setTimeout(() => JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', ')), 2500);
    Save.save();
  }
};
LOGROS.push({ id: 'buenvecino', name: 'Buen vecino', desc: 'Termina 3 encargos de los vecinos del valle', icon: 'estrella', test: S => !!(S.encargos && S.encargos.hechos && S.encargos.hechos.length >= 3) });
LOGROS.push({ id: 'vallevecino', name: 'El valle es mi barrio', desc: 'Termina todos los encargos de los vecinos', icon: 'estrella', test: S => !!(S.encargos && S.encargos.hechos && typeof GUION !== 'undefined' && Array.isArray(GUION.encargos) && S.encargos.hechos.length >= GUION.encargos.length) });
(function () {
  /* la acción junto al vecino y el marcador del paso al volver al valle */
  const _act = ModeUsuarioR.prototype.actions;
  ModeUsuarioR.prototype.actions = function () {
    const a = _act.call(this); if (!this.free || this.sub || this.sitting || !this.ride || this.mirador) return a;
    const p = typeof Trama !== 'undefined' && Trama.cerca(this), E = p && Encargos.de(p.id), D = Encargos.d();
    if (E && !D.activo) a.push({ id: 'encargo', icon: 'estrella', label: '💬 Encargo', fn: () => Encargos.empezar(this, E) });
    return a;
  };
  if (typeof HUD21 !== 'undefined' && !HUD21.CTX.includes('encargo')) HUD21.CTX.splice(0, 0, 'encargo');
  if (typeof ICO21 !== 'undefined') ICO21.encargo = 'M4 5h16v10H9l-5 4z M8 9h8 M8 12h5';
  const _init = ModeUsuarioR.prototype.libreInit;
  ModeUsuarioR.prototype.libreInit = function () { const r = _init.apply(this, arguments); try { if (this.free && Encargos.activo()) Encargos.marcar(this, false); } catch (e) { JE.errors.push('encargos: ' + e.message); } return r; };
  /* ❗ sobre el vecino que tiene un encargo para ti */
  const _hl = Ride.prototype.hudLife;
  Ride.prototype.hudLife = function (V, sx, sy, W) {
    _hl.call(this, V, sx, sy, W); if (!this.mode || !this.mode.free || typeof Trama === 'undefined' || !W) return; const P = this.p, D = Encargos.d();
    for (const p of Trama.personajes()) { const d = dist(P.x, P.y, p.x, p.y); if (d > 220 * WK) continue; const E = Encargos.de(p.id); if (!E || D.activo && D.activo !== E.id) continue; const q = W(p.x, p.y); if (q.x < -40 || q.x > V.w + 40 || q.y < 60 || q.y > V.h - 40) continue; V.text(D.activo === E.id ? '💬' : '❗', q.x + 15, q.y - 2, { size: 13, align: 'center', bg: '#ffb300', color: '#0a2342', pad: 2 }); }   /* junto al cuerpo: el nombre va encima */
  };
  /* en «Hoy en el valle»: el paso activo primero; si no, el vecino que te necesita más cerca */
  if (typeof Hoy !== 'undefined') Hoy.fuentes.push((M, add) => {
    const E = Encargos.activo(), st = Encargos.paso(E);
    if (E && st) { const L = Encargos.lugar(st.a); if (L) add('historia', '💬', E.titulo + ': ' + st.corto, L.x, L.y, { prio: -1, fn: () => Encargos.marcar(M, true) }); return; }
    for (const e of Encargos.lista()) { if (Encargos.d().hechos.includes(e.id)) continue; const p = Encargos.pers(e.quien); if (p) add('historia', '❗', p.name + ' te necesita: ' + e.titulo, p.x, p.y + 8 * WK); }
  });
})();
