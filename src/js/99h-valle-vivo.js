/* =====================================================================
   EL VALLE QUE RECUERDA (ronda 3.2, Claude) · lo 🔜 pequeño del plan (§ 4.2, 4.4 y 4.5) para que el mundo abierto tenga
   historia propia («subtramas a la manera de un RPG o un MMO»), diversión y contemplación:
   1) 📸 RADARES en las ciclorrutas más largas del valle (a más de 1 km uno de otro): al pasar se mide tu velocidad, la
      equivalente a la real de tu vehículo (una bici a fondo ≈ 24 km/h), y queda tu récord. 🛹 SALTOS con récord en las
      zonas de trucos: el largo depende de tu velocidad.
   2) 💪 HABILIDADES que suben al usarlas (como en San Andreas): Pedaleo (km rodados), Resistencia (km en subida), Equilibrio
      (trucos) y Conocer el valle (barrios visitados). Efectos pequeños y dichos: +1,5 % de velocidad punta por nivel de
      Pedaleo, −5 % de lo que frena la loma por nivel de Resistencia y +2 puntos por truco por nivel de Equilibrio. Solo en
      el valle y solo para quien juega (el bot y las pruebas no cambian).
   3) 📔 TU DIARIO: lo que haces queda anotado solo: turnos y juegos terminados, récords, barrios nuevos, niveles y miradores.
      En Más → «📔 Mi diario y habilidades».
   4) 🔭 MIRADORES (Cerro Nutibara, El Volador, Las Tres Cruces, Quitasol y el Alto de San Miguel): te sientas arriba y la
      cámara 3D gira despacio sobre la ciudad viva (trenes, cables, carros), con la niebla más lejos y el dato del lugar.
      El tiempo pasa más rápido, como al sentarse en una banca.
   Se guarda en 'habil' (objeto) y 'diario' (lista de las últimas 80 notas), registradas como pide 98v-claves.js.
   ===================================================================== */
Save.registrar('habil', 'objeto', 'habilidades, radares y saltos (99h-valle-vivo.js)');
Save.registrar('diario', 'lista', 'diario del valle (99h-valle-vivo.js)');
const Diario = JE.diario = {
  lista() { const S = Save.data; if (!Array.isArray(S.diario)) S.diario = []; return S.diario; },
  anotar(txt, ico = '📝') { if (JE.headless || !Save.data || !txt) return; const L = this.lista(), u = L[L.length - 1]; if (u && u.d === txt) return; L.push({ t: Date.now(), d: String(txt).slice(0, 140), i: ico }); if (L.length > 80) L.splice(0, L.length - 80); Save.save(); }
};
const HUMANOS3 = new Set(['bike', 'walk', 'skate', 'patines', 'scooter']);
const HAB = [
  { id: 'pedaleo', nombre: 'Pedaleo', ico: '🚲', u: 'km rodados', umbral: [0, 2, 6, 15, 30], efecto: n => n > 1 ? '+' + String(1.5 * (n - 1)).replace('.', ',') + ' % de velocidad punta' : 'rueda para subirlo' },
  { id: 'resistencia', nombre: 'Resistencia', ico: '⛰️', u: 'km en subida', umbral: [0, .4, 1.2, 3, 6], efecto: n => n > 1 ? '−' + 5 * (n - 1) + ' % de lo que frena la loma' : 'sube lomas para subirlo' },
  { id: 'equilibrio', nombre: 'Equilibrio', ico: '🛹', u: 'trucos', umbral: [0, 10, 30, 70, 150], efecto: n => n > 1 ? '+' + 2 * (n - 1) + ' puntos por truco' : 'haz trucos en las plazas' },
  { id: 'valle', nombre: 'Conocer el valle', ico: '🗺️', u: 'barrios', umbral: [0, 5, 12, 25, 45], efecto: n => n >= 5 ? 'conoces el valle como un guía' : 'cada barrio nuevo suma' }
];
const Habil = JE.habil = {
  d() { const S = Save.data; if (!S.habil || typeof S.habil !== 'object' || Array.isArray(S.habil)) S.habil = {}; const H = S.habil; H.km = +H.km || 0; H.loma = +H.loma || 0; H.trucos = H.trucos | 0; if (!Array.isArray(H.barrios)) H.barrios = []; if (!H.radares || typeof H.radares !== 'object') H.radares = {}; if (!H.saltos || typeof H.saltos !== 'object') H.saltos = {}; return H; },
  valor(id) { const H = this.d(); return id === 'pedaleo' ? H.km : id === 'resistencia' ? H.loma : id === 'equilibrio' ? H.trucos : H.barrios.length; },
  nivel(id) { const h = HAB.find(x => x.id === id), v = this.valor(id); let n = 1; for (let i = 1; i < h.umbral.length; i++) if (v >= h.umbral[i]) n = i + 1; return Math.min(5, n); },
  subir(id, f) { const n0 = this.nivel(id); f(this.d()); const n1 = this.nivel(id); if (n1 > n0) { const h = HAB.find(x => x.id === id); Snd.sfx('star'); if (JE.ui) JE.ui.toast('💪 ' + h.ico + ' ' + h.nombre + ' sube a nivel ' + n1 + ': ' + h.efecto(n1)); Diario.anotar(h.nombre + ' subió a nivel ' + n1 + ' (' + h.efecto(n1) + ')', '💪'); } },
  yo(R) { return !!(R && R.mode && R.mode.free && R.mode.ride === R && !JE.headless && (typeof Manejo === 'undefined' || Manejo.humano(R))); }
};
/* ---------- 1) radares ---------- */
const Radares = JE.radares = {
  REAL: { bike: 24, ebike: 25, walk: 12, skate: 16, patines: 18, scooter: 20, emonopatin: 25, truck: 50 },
  lista() {
    if (this._l) return this._l; const M = JE.map, out = [], cand = []; if (!M || !M.vias) return (this._l = out);
    for (const v of M.vias) { if (v.k !== 5 || !v.p || v.p.length < 4) continue; let L = 0; for (let i = 2; i < v.p.length; i += 2) L += Math.hypot(v.p[i] - v.p[i - 2], v.p[i + 1] - v.p[i - 1]); if (L * M_PER_PX >= 500) cand.push({ v, L }); }
    cand.sort((a, b) => b.L - a.L);
    for (const { v, L } of cand) {
      if (out.length >= 14) break; let acc = 0, x = v.p[0], y = v.p[1], a = 0;
      for (let i = 2; i < v.p.length; i += 2) { const l = Math.hypot(v.p[i] - v.p[i - 2], v.p[i + 1] - v.p[i - 1]); if (acc + l >= L / 2) { const f = (L / 2 - acc) / (l || 1); x = v.p[i - 2] + (v.p[i] - v.p[i - 2]) * f; y = v.p[i - 1] + (v.p[i + 1] - v.p[i - 1]) * f; a = Math.atan2(v.p[i + 1] - v.p[i - 1], v.p[i] - v.p[i - 2]); break; } acc += l; }
      if (out.some(r => Math.hypot(r.x - x, r.y - y) * M_PER_PX < 1000)) continue;
      out.push({ id: 'r' + Math.round(x / TS) + '_' + Math.round(y / TS), x, y, a, nombre: (typeof NOMB === 'function' && (NOMB(v.n) || NOMB(v.nom))) || ((M.barrioAt && M.barrioAt(x, y)) ? 'la ciclorruta de ' + M.barrioAt(x, y) : 'la ciclorruta') });
    }
    return (this._l = out);
  },
  kmh(R) { const S = R.stats_(), k = R.p.veh === 'bike' && (R.mode.ebike || R.ebike) ? 'ebike' : R.p.veh; return Math.round(R.p.v / Math.max(1, S.max) * (this.REAL[k] || 22)); },
  revisar(R) {
    const P = R.p, t = R.mode.t || 0;
    for (const r of this.lista()) {
      if (Math.abs(r.x - P.x) > 30 || Math.abs(r.y - P.y) > 30 || Math.hypot(r.x - P.x, r.y - P.y) > 13 || r.ult && t - r.ult < 5) continue;
      if (Math.abs(Math.cos(P.a - r.a)) < .6 || P.v < 8) continue;
      r.ult = t; const v = this.kmh(R), H = Habil.d(), rec = H.radares[r.id] | 0;
      if (v > rec) { H.radares[r.id] = v; R.mode.score += 15; Snd.sfx('star'); R.float('📸 ' + v + ' km/h · ¡récord!', PAL.amb); if (JE.ui) JE.ui.toast('📸 Radar de ' + r.nombre + ': ' + v + ' km/h' + (rec ? ' (antes ' + rec + ')' : '') + ' · ¡récord! +15 · en la ciclorruta, a una velocidad que te deje frenar'); Diario.anotar('Récord en el radar de ' + r.nombre + ': ' + v + ' km/h', '📸'); }
      else { R.float('📸 ' + v + ' km/h · récord ' + rec, '#ffffff'); Snd.sfx('tap'); }
    }
  }
};
/* ---------- 4) miradores ---------- */
const Mirador = JE.mirador = {
  IDS: ['cerro', 'volador', 'trescruces', 'quitasol', 'nacimiento'],
  lista() { return this._l || (this._l = this.IDS.map(id => LM[id]).filter(Boolean).map(L => ({ id: L.id, name: L.name, fact: L.fact, x: (L.x + L.w / 2) * TS, y: (L.y + L.h / 2) * TS, r: Math.max(64, Math.max(L.w, L.h) * TS * .6) }))); },
  en(R) { const P = R.p; return this.lista().find(m => dist(m.x, m.y, P.x, P.y) < m.r) || null; },
  abrir(M, m) {
    if (typeof Mundo3D === 'undefined' || !Mundo3D.ok()) { if (JE.ui) JE.ui.toast('🔭 El mirador necesita la vista 3D (WebGL), y este equipo no la tiene'); return; }
    const R = M.ride; M.sitting = true; M.sitT = 0; R.p.v = 0; M.mirador = m; this.antes = Mundo3D.modo; Mundo3D.mirador = { x: m.x, y: m.y, t: 0, h: 72 }; this.vista('tercera');
    Snd.sfx('star'); if (JE.ui) JE.ui.toast('🔭 ' + m.name + (m.fact ? ' · ' + m.fact : '') + ' · el tiempo pasa más rápido: mira cómo se mueve la ciudad');
    Diario.anotar('Contemplaste el valle desde ' + m.name + ' a las ' + fmtClock(M.clock), '🔭');
  },
  cerrar(M) { if (!M || !M.mirador) return; M.mirador = null; M.sitting = false; if (typeof Mundo3D !== 'undefined') { Mundo3D.mirador = null; this.vista(this.antes || null); } },
  /* como Mundo3D.poner, pero sin su aviso (el del mirador es el que cuenta) */
  vista(m) { const G = Mundo3D; G.modo = m; const b = $('#b3D'); if (b) { b.textContent = m === 'tercera' ? '🧍' : m === 'primera' ? '👁️' : '3D'; b.classList.toggle('on', !!m); } if (G.cv) G.cv.hidden = !m; document.body.classList.toggle('gl3d', !!m); }
};
(function () {
  /* ---------- 2) habilidades: velocidad punta (Pedaleo) y lomas (Resistencia), solo para quien juega en el valle ---------- */
  const _st = Ride.prototype.stats_;
  Ride.prototype.stats_ = function () { const S = _st.apply(this, arguments); if (!HUMANOS3.has(this.p.veh) || !Habil.yo(this)) return S; const n = Habil.nivel('pedaleo'); return n > 1 ? Object.assign({}, S, { max: S.max * (1 + .015 * (n - 1)) }) : S; };
  const _up = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) {
    const yo = Habil.yo(this), P = this.p, x0 = P.x, y0 = P.y, rpg = JE.rpg && JE.rpg.nivel, nR = yo && HUMANOS3.has(P.veh) ? (rpg ? JE.rpg.nivel('resistencia') : Habil.nivel('resistencia')) : 1, M = this.map; let r;
    if (nR > 1 && M && M.slope) { const f = M.slope, k = 1 - (rpg ? Math.min(.27, .03 * (nR - 1)) : .05 * (nR - 1));   /* 3.5: una sola Resistencia (la del RPG de Gemini, 1–10) */ M.slope = function (x, y, a) { const s = f.call(this, x, y, a); return s > 0 ? s * k : s; }; try { r = _up.call(this, dt, dir); } finally { M.slope = f; } }
    else r = _up.call(this, dt, dir);
    if (yo) try { this.valleVivo(dt, x0, y0); } catch (e) { JE.errors.push('valle vivo: ' + e.message); }
    return r;
  };
  Ride.prototype.valleVivo = function (dt, x0, y0) {
    const P = this.p, d = Math.hypot(P.x - x0, P.y - y0) * M_PER_PX / 1000;
    if (d > 0 && d < .05 && HUMANOS3.has(P.veh)) { this._km = (this._km || 0) + d; if (this.sl > .015) this._loma = (this._loma || 0) + d; }
    if ((this._km || 0) > .05) { const a = this._km, b = this._loma || 0; this._km = 0; this._loma = 0; Habil.subir('pedaleo', H => { H.km += a; }); if (b) { Habil.subir('resistencia', H => { H.loma += b; }); if (JE.rpg && JE.rpg.ganarSkill) { this._lomaRpg = (this._lomaRpg || 0) + b * 20; if (this._lomaRpg >= 1) { JE.rpg.ganarSkill('resistencia', Math.floor(this._lomaRpg)); this._lomaRpg %= 1; } } } if ((this._gd = (this._gd || 0) + a) > .5) { this._gd = 0; Save.save(); } }
    if ((this._bT = (this._bT || 0) - dt) <= 0) {   // barrios nuevos, una vez por segundo
      this._bT = 1; const b = this.map.barrioAt && this.map.barrioAt(P.x, P.y);   /* en px del mundo (la función divide por TS) */
      if (b && b !== this._bU) { this._bU = b; const H = Habil.d(); if (!H.barrios.includes(b)) { Habil.subir('valle', H2 => { H2.barrios.push(b); }); if (Date.now() - (this._bToast || 0) > 8000 && JE.ui) { this._bToast = Date.now(); JE.ui.toast('🗺️ Barrio nuevo: ' + b + ' · llevas ' + H.barrios.length); } Diario.anotar('Conociste ' + b, '🗺️'); } }
    }
    Radares.revisar(this);
  };
  /* ---------- 1b) saltos con récord y Equilibrio en las zonas de trucos ---------- */
  if (typeof Trucos !== 'undefined') {
    const _hacer = Trucos.hacer;
    Trucos.hacer = function (R) {
      const antes = R.truco; _hacer.call(this, R); if (!R.truco || R.truco === antes) return;
      if (Habil.yo(R)) { Habil.subir('equilibrio', H => { H.trucos++; }); if (JE.rpg && JE.rpg.ganarSkill) { JE.rpg.ganarSkill('tecnica', 2); const n = JE.rpg.nivel('tecnica'); if (n > 1) R.mode.score += n - 1; } else { const n = Habil.nivel('equilibrio'); if (n > 1) R.mode.score += 2 * (n - 1); } }   /* 3.5: una sola Técnica */
      const z = this.en(R), S = R.stats_(); if (!z || R.p.v < S.max * .45) return;
      const m = +(1 + R.p.v / S.max * 5.5).toFixed(1), H = Habil.d(), rec = +H.saltos[z.id] || 0;
      if (m > rec) { H.saltos[z.id] = m; R.mode.score += 10; if (JE.ui) JE.ui.toast('🛹 Salto de ' + String(m).replace('.', ',') + ' m en ' + z.name + ' · ¡récord! +10'); Diario.anotar('Récord de salto en ' + z.name + ': ' + String(m).replace('.', ',') + ' m', '🛹'); }
    };
  }
  /* ---------- 4b) el mirador: acción, cámara que gira sobre la ciudad, salida ---------- */
  const _act = ModeUsuarioR.prototype.actions;
  ModeUsuarioR.prototype.actions = function () {
    if (this.mirador) return [{ id: 'up', icon: 'usuario', label: 'Salir del mirador', fn: () => { Snd.sfx('tap'); Mirador.cerrar(this); } }];
    const a = _act.call(this); if (!this.free || this.sub || this.sitting || !this.ride || this.ride.p.v > 10) return a;
    const m = Mirador.en(this.ride); if (m) a.push({ id: 'mirador', icon: 'estrella', label: '🔭 Mirador', fn: () => Mirador.abrir(this, m) });
    return a;
  };
  const _upd = ModeUsuarioR.prototype.update;
  ModeUsuarioR.prototype.update = function (dt) { const r = _upd.call(this, dt); if (this.mirador && !this.sitting) Mirador.cerrar(this); return r; };
  if (typeof HUD21 !== 'undefined') for (const k of ['mirador']) if (!HUD21.CTX.includes(k)) HUD21.CTX.splice(1, 0, k);
  if (typeof ICO21 !== 'undefined') ICO21.mirador = 'M3 20l6-9 4 5 3-4 5 8z M15 6a2 2 0 1 0 0 .01';
  for (const k of ['stop', 'finish']) { const f = Game[k]; Game[k] = function () { if (typeof Mundo3D !== 'undefined' && Mundo3D.mirador) { Mundo3D.mirador = null; if (this.mode) this.mode.mirador = null; } return f.apply(this, arguments); }; }
  if (typeof Mundo3D !== 'undefined') {
    const G = Mundo3D, _cam = G.camara, _act3 = G.activo;
    G.camara = function (R, W, Hh) {
      const m = this.mirador; if (!m) return _cam.call(this, R, W, Hh);
      m.t += this._dt || .016; const a = -Math.PI / 2 + m.t * TAU / 110, eye = [m.x, m.h, m.y], at = [m.x + Math.cos(a) * 420, m.h - 64, m.y + Math.sin(a) * 420];
      this.yaw = a; const proj = this.persp(1.0, W / Hh, 2, 4200), view = this.mirar(eye, at); this.vp = this.mul(proj, view); this.eye = eye; this.W = W; this.Hh = Hh;
    };
    G.activo = function (R) { return _act3.call(this, R) || !!(this.mirador && R && R.mode && R.mode.mirador && R.mode.ride === R && !R.mode.sub && this.ok()); };
    /* los radares también en 3D: dos postes y la cámara sobre la ciclorruta */
    const _fijo = G.extraFijo;
    G.extraFijo = function (R) {
      if (_fijo) _fijo.call(this, R);
      if (!this._radares) { const o = []; for (const r of Radares.lista()) { const nx = -Math.sin(r.a) * 5, ny = Math.cos(r.a) * 5; for (const sd of [1, -1]) this.caja(o, r.x + nx * sd, r.y + ny * sd, r.a, .8, .8, 7, 0, [.85, .86, .88]); this.caja(o, r.x, r.y, r.a, .8, 10.6, .8, 7, [.85, .86, .88]); this.caja(o, r.x + nx * .4, r.y + ny * .4, r.a, 1.6, 1.4, 1.2, 5.8, [.95, .75, .15]); } this._radares = o.length ? this.subir(o) : { n: 0 }; }
      if (this._radares.n) this.pintar(this._radares);
    };
  }
  /* los radares en la cenital: el arco con su cámara y la franja en el piso */
  const _dg = Ride.prototype.drawGround;
  Ride.prototype.drawGround = function (b, ox, oy, inV) {
    _dg.call(this, b, ox, oy, inV); if (!this.mode || !this.mode.free) return;
    for (const r of Radares.lista()) { if (!inV(r.x, r.y, 20)) continue; b.save(); b.translate(r.x - ox, r.y - oy); b.rotate(r.a); b.fillStyle = 'rgba(255,201,60,.55)'; for (let k = -4; k <= 4; k += 2) b.fillRect(-1, k, 2, 1.2); b.fillStyle = '#e8e9ec'; b.fillRect(-1, -6, 2, 2); b.fillRect(-1, 4, 2, 2); b.fillStyle = '#ffc93c'; b.fillRect(-1.5, -6.5, 3, 2); b.restore(); }
  };
  const _hud = Ride.prototype.hud;
  Ride.prototype.hud = function (V, o) {
    _hud.call(this, V, o); if (!this.mode || !this.mode.free || this.big || !this.lblRoom) return; const P = this.p;
    if (this.mode.mirador) { V.text('🔭 Mirador · ' + this.mode.mirador.name, V.w / 2, (View.hudB || 50) + 40, { size: 13, align: 'center', bg: '#0a2342dd', pad: 5 }); return; }
    for (const r of Radares.lista()) { if (Math.abs(r.x - P.x) > 160 || Math.abs(r.y - P.y) > 160) continue; const q = this.w2s(r.x, r.y), rec = Habil.d().radares[r.id]; if (this.lblRoom(q.x, q.y - 14, 110, 14)) V.text('📸 Radar' + (rec ? ' · récord ' + rec + ' km/h' : ''), q.x, q.y - 14, { size: 10.5, align: 'center', bg: '#0a2342dd', pad: 3 }); }
    const m = Mirador.en(this); if (m && !this.mode.sitting) { const q = this.w2s(m.x, m.y); if (this.lblRoom(q.x, q.y - 22, 120, 14)) V.text('🔭 Mirador · ' + m.name, q.x, q.y - 22, { size: 10.5, align: 'center', bg: '#0a2342dd', pad: 3 }); }
  };
  /* ---------- 3) el diario: lo que terminas queda anotado; en Más, el diario y las habilidades ---------- */
  const _res = UI.result;
  UI.result = function (res, meta, prog) {
    try { const r = ROLE[meta.roleId] || {}; Diario.anotar((meta.free ? 'Práctica de ' : '') + (r.name || meta.roleId) + (r.juego || meta.free ? '' : ' · turno ' + meta.turno) + ': ' + '★'.repeat(res.stars || 0) + (res.stars ? ' · ' : '') + fmtInt(res.score) + ' puntos', res.pass ? '🏁' : '🔁'); } catch (e) { }
    return _res.apply(this, arguments);
  };
  UI.diario = function () {
    const H = Habil.d(), L = Diario.lista().slice().reverse().slice(0, 40), fecha = t => { const d = new Date(t); return d.getDate() + '/' + (d.getMonth() + 1) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    const barra = (h) => { const n = Habil.nivel(h.id), v = Habil.valor(h.id), a = h.umbral[n - 1] || 0, z = h.umbral[n] != null ? h.umbral[n] : v, f = n >= 5 ? 1 : clamp((v - a) / Math.max(1e-6, z - a), 0, 1), val = h.id === 'pedaleo' || h.id === 'resistencia' ? String(v.toFixed(1)).replace('.', ',') : v;
      return `<div class="opt"><span>${h.ico} ${h.nombre} · nivel ${n}<br><small class="m">${val} ${h.u} · ${esc(h.efecto(n))}</small></span><span style="flex:0 0 96px;height:10px;border-radius:5px;background:#0a234233;overflow:hidden;display:block"><i style="display:block;height:100%;width:${Math.round(f * 100)}%;background:${PAL.vd}"></i></span></div>`; };
    const rad = Radares.lista().filter(r => H.radares[r.id]).sort((a, b) => H.radares[b.id] - H.radares[a.id]).slice(0, 5), sal = Object.entries(H.saltos).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const RPGS = [['resistencia', '⛰️', 'Resistencia', n => n > 1 ? '−' + Math.min(27, 3 * (n - 1)) + ' % de lo que frena la loma y menos cansancio' : 'sube lomas y rueda por las ciclorrutas'], ['tecnica', '🛹', 'Técnica y trucos', n => n > 1 ? '+' + (n - 1) + ' puntos por truco en las plazas; bonos en skateparks y freerun' : 'haz trucos en plazas y skateparks'], ['mecanica', '🔧', 'Oficio y estrategia', n => n > 1 ? '+' + 8 * (n - 1) + ' % en oficios, puzles, Monitoreo 911 y el Planeador' : 'juega oficios y puzles'], ['civismo', '🌿', 'Cultura cívica', n => n > 1 ? 'más reputación en tu comuna y bonos en los encargos' : 'ayuda a los vecinos y a los mentores']];
    const barraRpg = ([id, ic, nom, ef]) => { const R2 = JE.rpg, E = R2.estado(), n = R2.nivel(id), xp = E.sk[id] | 0, a = (n - 1) * (n - 1) * 25, z = n * n * 25, f = n >= 10 ? 1 : clamp((xp - a) / Math.max(1, z - a), 0, 1);
      return `<div class="opt"><span>${ic} ${nom} · nivel ${n}<br><small class="m">${esc(ef(n))}</small></span><span style="flex:0 0 96px;height:10px;border-radius:5px;background:#0a234233;overflow:hidden;display:block"><i style="display:block;height:100%;width:${Math.round(f * 100)}%;background:${PAL.vd}"></i></span></div>`; };
    const filas = JE.rpg && JE.rpg.estado ? HAB.filter(h => h.id === 'pedaleo' || h.id === 'valle').map(barra).join('') + RPGS.map(barraRpg).join('') : HAB.map(barra).join('');   /* 3.5: un solo panel con las habilidades de las dos IA, sin repetir */
    this.modal(`<h2>📔 Mi diario y habilidades</h2><p class="m">Suben solas: al rodar, al subir lomas, con los trucos, los oficios, los encargos y conociendo barrios.</p>${filas}
      <p class="pag">Récords</p>${rad.length || sal.length ? rad.map(r => `<p class="m" style="margin:4px 0">📸 ${esc(r.nombre)}: <b>${H.radares[r.id]} km/h</b></p>`).join('') + sal.map(([id, m]) => `<p class="m" style="margin:4px 0">🛹 ${esc((LM[id] || {}).name || id)}: <b>${String(m).replace('.', ',')} m</b></p>`).join('') : '<p class="m">Pasa por un 📸 radar de ciclorruta o salta en una 🛹 zona de trucos.</p>'}
      <p class="pag">Lo que has vivido</p>${L.length ? L.map(e => `<p class="m" style="margin:4px 0">${e.i || '📝'} <small>${fecha(e.t)}</small> · ${esc(e.d)}</p>`).join('') : '<p class="m">Todavía nada: sal al valle. Lo que hagas quedará aquí.</p>'}
      <div class="col"><button class="btn pri" id="mClose">Listo</button></div>`);
  };
  const _mas = UI.renderMas;
  UI.renderMas = function () { _mas.apply(this, arguments); const col = $('#tab-mas .col'); if (!col || col.querySelector('[data-diario]')) return; const b = document.createElement('button'); b.className = 'btn'; b.dataset.diario = '1'; b.textContent = '📔 Mi diario y habilidades'; b.onclick = () => { Snd.sfx('tap'); this.diario(); }; col.insertBefore(b, col.children[1] || null); };
})();
