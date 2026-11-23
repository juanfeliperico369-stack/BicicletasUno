/* =====================================================================
   HOY EN EL VALLE (ronda 3.3, Claude) · un solo «siguiente» claro, sin cerrar nada. En el valle compiten por tu atención muchos
   sistemas de objetivos: las misiones del día, la trama «Ruedas y Rieles», el boleto de Rosalba, «Un día del valle», los
   oficios, los vecinos con encargos, los radares, los miradores, las zonas de trucos, el freerun y la carrera de la ciclorruta.
   Un metaanálisis de 50 experimentos (Scheibehenne, Greifeneder y Todd, 2010) encontró que, en promedio, tener muchas opciones
   no paraliza; por eso aquí no se esconde nada: solo se SUGIERE, para quien no sabe por dónde empezar.
   - Al entrar al valle sale una tarjeta con TRES sugerencias: una de historia, una de tu día (misión, oficio) y una para
     descubrir, cada una con su distancia. Tocar una pone el destino 📍 (la flecha y la línea del GPS de siempre).
   - ✕ la cierra; el botón 🧭 de la barra de la izquierda la vuelve a abrir. Se cierra sola a los 12 s.
   Otros módulos suman sugerencias con Hoy.fuentes.push((M, add) => …) (los vecinos, 99l-vecinos.js).
   ===================================================================== */
const Hoy = JE.hoy = {
  fuentes: [],
  km(c) { const k = c.km; return k < 1 ? Math.max(10, Math.round(k * 100) * 10) + ' m' : String(k.toFixed(1)).replace('.', ',') + ' km'; },
  estacionCerca(M, x, y) { let b = null, bd = 1e18; for (const s of JE.map.stations || []) { const d = dist(s.x, s.y, x, y); if (d < bd) { bd = d; b = s; } } return b; },
  lugarOficio(M, rol) {
    const A = typeof Actividades !== 'undefined' ? Actividades : null, P = M.ride.p;
    if (A && A.ESTACION.includes(rol)) { const s = this.estacionCerca(M, P.x, P.y); return s ? { x: s.x, y: s.y + 12 * WK } : null; }
    const d = JE.map.depot; return d ? { x: d.x, y: d.y } : null;
  },
  cand(M) {
    const R = M.ride, P = R.p, out = [], km = (x, y) => dist(x, y, P.x, P.y) * M_PER_PX / 1000;
    const add = (tipo, ico, titulo, x, y, extra = {}) => { if (x == null || !isFinite(x) || !isFinite(y)) return; out.push(Object.assign({ tipo, ico, titulo, x, y, km: km(x, y) }, extra)); };
    /* historia */
    try { const C = typeof Trama !== 'undefined' && Trama.capActual(); if (C) { const o = JE.map.nearestOpen(C.tx1 | 0, C.ty1 | 0, false); add('historia', '📖', 'Ruedas y Rieles · cap. ' + C.n + ': ' + C.titulo, o.x * TS + TS / 2, o.y * TS + TS / 2, { fn: () => Trama.iniciarCap(M, C.id) }); } } catch (e) { }
    try { const q = typeof Boleto !== 'undefined' && Boleto.actual(), mk = q && q.evento === 'visitar' && Boleto.marca(M); if (mk) add('historia', '🎟️', 'El boleto de Rosalba: ' + q.titulo, mk.x, mk.y); } catch (e) { }
    try { const c = typeof Dia !== 'undefined' && Dia.next(); if (c) { const L = this.lugarOficio(M, c.rol); if (L) add('historia', '☀️', 'Un día del valle · cap. ' + Dia.n(c) + ': ' + c.titulo, L.x, L.y, { pista: 'el oficio se juega allí, con «Oficios aquí»' }); } } catch (e) { }
    /* tu día */
    for (const ms of M.misiones || []) { if (ms.done || !ms.marks || !ms.marks.length) continue; const m = ms.marks[0]; add('dia', '📋', ms.txt, m.x, m.y); }
    try { const s = this.estacionCerca(M, P.x, P.y); if (s) add('dia', '🛠️', 'Un turno de oficio en la estación ' + s.name, s.x, s.y + 12 * WK, { aqui: () => { const A = typeof Actividades !== 'undefined' && Actividades, L = A && A.lugar(M); if (L) A.abrir(M, L); } }); } catch (e) { }
    /* descubrir */
    try { if (typeof Radares !== 'undefined') { const H = typeof Habil !== 'undefined' ? Habil.d() : { radares: {} }; for (const r of Radares.lista()) if (!H.radares[r.id]) add('descubrir', '📸', 'Radar de ' + r.nombre + ': pon tu récord', r.x, r.y); } } catch (e) { }
    try { if (typeof Mirador !== 'undefined') for (const m of Mirador.lista()) add('descubrir', '🔭', 'Mirador · ' + m.name, m.x, m.y); } catch (e) { }
    try { if (typeof Trucos !== 'undefined') for (const z of Trucos.zonas()) add('descubrir', z.id === 'comuna13' ? '🧗' : '🛹', z.id === 'comuna13' ? 'Freerun en la Comuna 13' : 'Zona de trucos · ' + z.name, z.x, z.y); } catch (e) { }
    try { const t = typeof TramoCiclista !== 'undefined' && TramoCiclista.cercana(JE.map, P); if (t) add('descubrir', '🛣️', 'Carrera de la ciclorruta · ' + t.nombre, t.p[0], t.p[1]); } catch (e) { }
    for (const f of this.fuentes) try { f(M, add); } catch (e) { JE.errors.push('hoy: ' + e.message); }
    return out;
  },
  /* una de historia, una de tu día y una para descubrir (esta rota cada día entre las tres más cercanas) */
  elegir(M) {
    const C = this.cand(M), por = t => C.filter(c => c.tipo === t).sort((a, b) => (a.prio || 0) - (b.prio || 0) || a.km - b.km), out = [];
    const h = por('historia'), d = por('dia'), x = por('descubrir'), dia = Math.floor(Date.now() / 864e5);
    if (h.length) out.push(h[0]); if (d.length) out.push(d[0]); if (x.length) out.push(x[Math.min(x.length - 1, dia % Math.min(3, x.length))]);
    for (const c of h.slice(1).concat(x)) { if (out.length >= 3) break; if (!out.includes(c)) out.push(c); }
    return out.slice(0, 3);
  },
  mostrar(M) {
    if (!M || !M.free || !M.ride || M.sub || JE.headless) return; const L = this.elegir(M); if (!L.length) return;
    let el = $('#hoy21'); if (!el) { el = document.createElement('div'); el.id = 'hoy21'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Hoy en el valle'); ($('#sGame') || document.body).append(el); }
    el.innerHTML = `<div class="hoyT"><span>🧭 Hoy en el valle</span><button class="hoyX" aria-label="Cerrar">✕</button></div>` + L.map((c, i) => `<button class="hoyI" data-i="${i}"><span class="hoyE">${c.ico}</span><span class="hoyN">${esc(c.titulo)}</span><small>${this.km(c)}</small></button>`).join('');
    el.hidden = false; this._L = L; this._M = M;
    el.querySelector('.hoyX').onclick = e => { e.stopPropagation(); Snd.sfx('tap'); this.cerrar(); };
    el.querySelectorAll('.hoyI').forEach(b => b.onclick = e => { e.stopPropagation(); this.ir(M, L[+b.dataset.i]); this.cerrar(); });
    clearTimeout(this._t); this._t = setTimeout(() => this.cerrar(), 12000);
  },
  cerrar() { const el = $('#hoy21'); if (el) el.hidden = true; clearTimeout(this._t); },
  ir(M, c) {
    if (!M || !M.ride || !c) return; Snd.sfx('star');
    if (c.fn) { c.fn(); return; }
    if (c.aqui && c.km < .05) { c.aqui(); return; }   /* lo tienes al lado: se abre de una vez */
    const R = M.ride, o = JE.map.nearestOpen(Math.floor(c.x / TS), Math.floor(c.y / TS), vehVia(R.p.veh)); if (!o) return;
    R.way = { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2, label: c.titulo.slice(0, 44), col: '#ff2fb3' }; R.gpsT = 0; if (R.calcGps) try { R.calcGps(); } catch (e) { }
    if (JE.ui) JE.ui.toast('📍 ' + c.titulo + ' · a ' + this.km(c) + (c.pista ? ' · ' + c.pista : ''));
  }
};
(function () {
  const _init = ModeUsuarioR.prototype.libreInit;
  /* sola, solo cuando no hay ya un destino marcado (si el juego ya te guía, no se suma otra cosa en pantalla) y después de los
     avisos de la entrada; y al LLEGAR a un destino, que es cuando uno se pregunta «¿y ahora qué?» */
  ModeUsuarioR.prototype.libreInit = function () { const r = _init.apply(this, arguments); if (this.free && !this.net && !JE.headless) setTimeout(() => { const R = this.ride; if (Game.mode === this && !this.sub && R && !R.way && !R.target && !this.sitting) Hoy.mostrar(this); }, 5000); return r; };
  const _upd = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) {
    const w0 = this.way, r = _upd.call(this, dt, dir), M = this.mode;
    if (w0 && !this.way && M && M.free && M.ride === this && !JE.headless && dist(w0.x, w0.y, this.p.x, this.p.y) < 30 * WK) setTimeout(() => { if (Game.mode === M && !M.sub && !this.way && !M.sitting) Hoy.mostrar(M); }, 2600);
    return r;
  };
  /* el botón 🧭 en la barra de la izquierda; la tarjeta se va si entras a un minijuego o sales del valle */
  const _tick = Cam.tick;
  Cam.tick = function (R, dt) {
    const r = _tick.apply(this, arguments), bar = $('#camBar'), M = Game.mode;
    if (bar && M && M.free && !bar.querySelector('#bHoy')) { const b = document.createElement('button'); b.id = 'bHoy'; b.setAttribute('aria-label', 'Hoy en el valle: sugerencias'); b.textContent = '🧭'; b.onclick = e => { e.stopPropagation(); Snd.sfx('tap'); const el = $('#hoy21'); if (el && !el.hidden) Hoy.cerrar(); else Hoy.mostrar(Game.mode); }; bar.append(b); }
    const bh = bar && bar.querySelector('#bHoy'); if (bh) { const ver = !!(M && M.free && !M.net); if (bh.hidden === ver) bh.hidden = !ver; }   /* solo en el valle */
    const el = $('#hoy21'); if (el && !el.hidden && (!M || M !== Hoy._M || M.sub)) Hoy.cerrar();
    return r;
  };
  for (const k of ['stop', 'finish']) { const f = Game[k]; Game[k] = function () { Hoy.cerrar(); return f.apply(this, arguments); }; }
})();
