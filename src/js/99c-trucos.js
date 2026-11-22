/* =====================================================================
   CARRERA SIN FIN EN CICLOVÍAS Y ZONAS DE TRUCOS (ronda 3.0, Claude) · el autor: «el endless runner solo aplica en ciclovías:
   hay cambios de dirección, las calles cambian de grandes a estrechas, hay obstáculos y lugares tipo skating para hacer paradas
   o trucos, hasta parkour; estas zonas también deben estar en el mundo abierto».
   A) LA CARRERA DE LA CICLORRUTA (92-ciclovia.js), que ya va por una ciclorruta real, suma:
      - GIROS: cada 220–320 m la ciclorruta dobla en una esquina; 45 m antes sale la flecha. Hay que tomarla (◀ o ▶, deslizar o
        las flechas) en los últimos 18 m: bien tomada da +30 y un viraje del paisaje; si te pasas, frenas 2 s (no pierdes vida).
      - TRAMOS ESTRECHOS: de 60 a 110 m con un carril cerrado por conos («⚠️ Se angosta»).
      - ZONAS DE TRUCOS: rampas seguidas; en el aire, «Salta» otra vez hace un truco (+20 × combo).
   B) ZONAS DE TRUCOS EN EL VALLE (modo libre): en las plazas de Pies Descalzos, Parque de las Luces, Plaza Botero, Explora,
      MAMM · Ciudad del Río, Parques del Río, Plaza Mayor y las unidades deportivas. Adentro, la acción «🛹 Truco»: en bici,
      skate, patines o patineta salta y hace un truco con nombre (combo si encadenas); a pie es parkour. Récord de la sesión.
   ===================================================================== */
const TRUCOS = {
  bike: ['Bunny hop', '180', 'Barspin', 'Tailwhip', 'Manual', 'X-up'], skate: ['Ollie', 'Kickflip', 'Heelflip', 'Shove-it', 'Pop shove-it', '360 flip'],
  patines: ['Giro 360', 'Mute', 'Salto de rana', 'Soul grind'], scooter: ['Tail whip', 'Bar spin', 'Bunny hop'], emonopatin: ['Salto', 'Giro 180'],
  walk: ['Salto de gato', 'Kong', 'Rodada', 'Salto de precisión', 'Muro']
};
const Trucos = JE.trucos = {
  ZONAS: ['pies', 'luces', 'botero', 'explora', 'mamm', 'parquesrio', 'plazamayor', 'unidadbelen', 'estadio', 'unidad'],
  zonas() {
    if (this._z) return this._z; const out = [];
    for (const id of this.ZONAS) { const L = typeof LM !== 'undefined' && LM[id]; if (!L) continue; out.push({ id, name: L.name, x: (L.x + L.w / 2) * TS, y: (L.y + L.h / 2) * TS, r: Math.max(46, Math.min(L.w, L.h) * TS * .45) }); }
    return (this._z = out);
  },
  en(R) { const P = R.p; return this.zonas().find(z => dist(z.x, z.y, P.x, P.y) < z.r) || null; },
  lista(veh) { return TRUCOS[veh] || TRUCOS[(VEHICULOS[veh] && VEHICULOS[veh].de) || 'bike'] || TRUCOS.bike; },
  hacer(R) {
    const P = R.p, ahora = R.mode.t || 0; if (R.truco && R.truco.t < R.truco.dur) return; const L = this.lista(P.veh), nombre = L[(Math.random() * L.length) | 0];
    const combo = this._ult != null && ahora - this._ult < 2.2 ? (this.combo | 0) + 1 : 1; this.combo = combo; this._ult = ahora;
    const pts = 10 * combo + (P.v > R.stats_().max * .5 ? 10 : 0); R.mode.score += pts; this.sesion = (this.sesion | 0) + pts; this.mejor = Math.max(this.mejor | 0, this.sesion);
    R.truco = { t: 0, dur: .62, giro: /180|360|whip|spin|Giro/.test(nombre) ? (nombre.includes('360') ? TAU : Math.PI) : 0, nombre };
    R.float(nombre + (combo > 1 ? ' ×' + combo : '') + ' +' + pts, combo > 2 ? PAL.amb : '#ffffff'); Snd.sfx(combo > 2 ? 'star' : 'coin'); vib(15);
    if (JE.efx) { JE.efx.aro(P.x, P.y, 9, combo > 2 ? '#ffc93c' : '#ffffff'); JE.efx.polvo(P.x, P.y, 3, '#d9d2c2', .8); }
  }
};
(function () {
  /* ---------- B) en el valle ---------- */
  const _act = ModeUsuarioR.prototype.actions;
  ModeUsuarioR.prototype.actions = function () {
    const a = _act.call(this); if (!this.free || this.sub || this.sitting || !this.ride) return a; const R = this.ride;
    if (Trucos.en(R) && R.p.veh !== 'truck') a.push({ id: 'truco', icon: 'llanta', label: R.p.veh === 'walk' ? 'Parkour' : 'Truco', fn: () => Trucos.hacer(R) });
    return a;
  };
  if (typeof HUD21 !== 'undefined' && !HUD21.CTX.includes('truco')) HUD21.CTX.splice(1, 0, 'truco');
  if (typeof ICO21 !== 'undefined') ICO21.truco = 'M4 15c3-1 5-1 8 1s5 2 8 1 M6 18.5a1.5 1.5 0 1 0 0-.01 M18 18.5a1.5 1.5 0 1 0 0-.01 M9 9l3-4 3 4';
  const _upd = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) { const r = _upd.call(this, dt, dir); if (this.truco) { this.truco.t += dt; if (this.truco.t >= this.truco.dur) { this.truco = null; if (JE.efx) JE.efx.polvo(this.p.x, this.p.y, 3, '#d9d2c2', .9); } } return r; };
  /* el salto se ve: la bici sube (y gira en los giros) sobre su sombra */
  const _top = Ride.prototype.renderTop0;
  Ride.prototype.renderTop0 = function (V, sw, sh) {
    const T = this.truco; if (!T) return _top.call(this, V, sw, sh); const P = this.p, f = Math.sin(Math.PI * T.t / T.dur), y0 = P.y, a0 = P.a;
    P.y -= f * 9; P.a += T.giro * (T.t / T.dur); try { return _top.call(this, V, sw, sh); } finally { P.y = y0; P.a = a0; }
  };
  const _dg = Ride.prototype.drawGround;
  Ride.prototype.drawGround = function (b, ox, oy, inV) {
    _dg.call(this, b, ox, oy, inV); if (!this.mode || !this.mode.free) return; const t = this.mode.t || 0;
    for (const z of Trucos.zonas()) { if (!inV(z.x, z.y, z.r)) continue; b.save(); b.globalAlpha = .55; b.strokeStyle = '#ffc93c'; b.setLineDash([4, 3]); b.lineWidth = 1; b.beginPath(); b.arc(z.x - ox, z.y - oy, z.r, 0, TAU); b.stroke(); b.setLineDash([]);
      b.globalAlpha = .9; for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + .4, x = z.x - ox + Math.cos(a) * z.r * .55, y = z.y - oy + Math.sin(a) * z.r * .55; b.save(); b.translate(x, y); b.rotate(a); b.fillStyle = '#caab7d'; b.fillRect(-5, -3, 10, 6); b.fillStyle = '#8a6a3d'; b.fillRect(3, -3, 2, 6); b.restore(); }
      b.restore(); }
    if (this.truco) { const P = this.p; b.fillStyle = 'rgba(0,0,0,.28)'; b.beginPath(); b.ellipse(P.x - ox, P.y - oy + 1, 4, 2.4, 0, 0, TAU); b.fill(); }
  };
  const _hud = Ride.prototype.hud;
  Ride.prototype.hud = function (V, o) { _hud.call(this, V, o); if (!this.mode || !this.mode.free || this.big || !this.lblRoom) return; const z = Trucos.en(this); if (z) { const q = this.w2s(z.x, z.y - z.r); if (this.lblRoom(q.x, q.y, 150, 15)) V.text('🛹 Zona de trucos · ' + z.name + (Trucos.mejor ? ' · récord ' + Trucos.mejor : ''), q.x, q.y, { size: 10.5, align: 'center', bg: '#0a2342dd', color: '#ffc93c', pad: 3 }); } };
  /* ---------- A) la carrera de la ciclorruta ---------- */
  if (typeof CarreraCiclovia === 'undefined') return; const C = CarreraCiclovia.prototype;
  const _fila = C.fila;
  C.fila = function () {
    const z0 = this.proxima; _fila.call(this);
    if (this.proxGiro == null) { this.proxGiro = 260; this.proxAngosta = 170; this.proxZona = 420; this.giros = []; this.giroOk = 0; this.giroMal = 0; this.trucos = 0; }
    if (z0 > this.proxGiro) { this.giros.push({ z: this.proxGiro, lado: this.rng.f() < .5 ? -1 : 1, hecho: false }); this.proxGiro += this.rng.range(220, 320); }
    if (z0 > this.proxAngosta) { const largo = this.rng.range(60, 110), lado = this.rng.f() < .5 ? -1 : 1; this.angosta = { z0: this.proxAngosta, z1: this.proxAngosta + largo, lado }; for (let z = this.proxAngosta; z < this.proxAngosta + largo; z += 6) this.objetos.push({ z, c: lado, k: 'cono' }); this.proxAngosta += largo + this.rng.range(180, 280); }
    const A = this.angosta; if (A) for (const o of this.objetos) if (!o.resuelto && o.z >= A.z0 - 4 && o.z <= A.z1 + 4 && o.c === A.lado && o.k !== 'cono') o.c = o.k === 'hoja' || o.k === 'regalo' ? 0 : -A.lado;   /* nada que recoger (ni otro peligro) en el carril cerrado */
    if (z0 > this.proxZona) { for (let k = 0; k < 4; k++) this.objetos.push({ z: this.proxZona + k * 11, c: (k % 3) - 1, k: 'rampa' }); this.zonaT = { z0: this.proxZona, z1: this.proxZona + 44 }; this.proxZona += this.rng.range(380, 520); }
  };
  C.mover = (function (f) { return function (d) { f.call(this, d); this.ultGiro = { d, m: this.metros }; }; })(C.mover);
  C.saltar = (function (f) { return function () { if (this.altura > .25 && !(this._tTruco > 0)) { this._tTruco = .35; this.comboT = (this.comboT | 0) + 1; const p = 20 * this.comboT; this.trucos++; this.score += p; this.bono = (this.bono | 0) + p; Snd.sfx('coin'); this.pop(['Tailwhip', '360', 'Barspin', 'X-up', 'Superman'][this.trucos % 5] + ' +' + p, 100, 190, PAL.amb); return; } f.call(this); }; })(C.saltar);
  const _cupd = C.update;
  C.update = function (dt) {
    if (this.frenaT > 0) { this.frenaT -= dt; this.metros -= this.rapidez() * dt * .55; }   // te pasaste el giro: frenas un rato
    _cupd.call(this, dt); this._tTruco = Math.max(0, (this._tTruco || 0) - dt); if (this.altura <= 0) this.comboT = 0;
    this.score += this.bono | 0;
    for (const g of this.giros || []) {
      if (g.hecho || g.z - this.metros > 0) continue; g.hecho = true; const u = this.ultGiro, ok = u && u.d === g.lado && this.metros - u.m < 18 + this.rapidez() * .6;
      if (ok) { this.giroOk++; this.bono = (this.bono | 0) + 30; this.virar = g.lado; Snd.sfx('ok'); this.pop('¡Bien girado! +30', 100, 170, PAL.vd1); }
      else { this.giroMal++; this.frenaT = 2; Snd.sfx('bad'); this.pop('¡Te pasaste el giro!', 100, 170, PAL.cor); }
    }
    this.virar = (this.virar || 0) * Math.max(0, 1 - dt * 2.5);
  };
  /* la flecha del giro, el aviso del tramo estrecho y la zona de trucos (nítidos, sobre la carrera) */
  const _chud = C.hud;
  C.hud = function (V) {
    _chud.call(this, V); const g = (this.giros || []).find(x => !x.hecho && x.z - this.metros < 45 && x.z - this.metros > -2);
    if (g) { const d = Math.max(0, Math.round(g.z - this.metros)), y = V.h * .2; V.text((g.lado < 0 ? '⬅ Gira a la izquierda' : 'Gira a la derecha ➡') + ' · ' + d + ' m', V.w / 2, y, { size: 18, align: 'center', color: '#0a2342', bg: d < 18 ? PAL.amb : '#ffffffee', pad: 6 }); }
    const A = this.angosta; if (A && this.metros > A.z0 - 40 && this.metros < A.z1) V.text('⚠️ Se angosta: carril ' + (A.lado < 0 ? 'izquierdo' : 'derecho') + ' cerrado', V.w / 2, V.h * .2 + 34, { size: 13, align: 'center', color: '#fff', bg: '#c0392bdd', pad: 4 });
    const Z = this.zonaT; if (Z && this.metros > Z.z0 - 30 && this.metros < Z.z1) V.text('🛹 Zona de trucos: salta en la rampa y otra vez en el aire', V.w / 2, V.h * .2 + 58, { size: 12, align: 'center', color: '#0a2342', bg: '#9bd341ee', pad: 4 });
  };
  /* el viraje del paisaje al tomar bien el giro */
  const _crender = C.render;
  C.render = function (V) { const v = this.virar || 0; if (Math.abs(v) < .02) return _crender.call(this, V); const b = V.b; b.save(); b.translate(V.vw / 2, V.vh * .4); b.rotate(-v * .06); b.translate(-V.vw / 2 + v * 14, -V.vh * .4); try { return _crender.call(this, V); } finally { b.restore(); } };
  /* los consejos de las carreras en pseudo‑3D van abajo (no tapan la vía) */
  const _dom = Game.dom; Game.dom = function (dt) { _dom.call(this, dt); const s = this.mode && this.mode.sub; document.body.classList.toggle('mg3d21', !!(s && ((typeof CarreraCiclovia !== 'undefined' && s instanceof CarreraCiclovia) || (typeof MGRunner3D !== 'undefined' && s instanceof MGRunner3D)))); };
  /* el bot toma los giros (pruebas) */
  const _cbot = C.bot; C.bot = function () { _cbot.call(this); const pel = c => this.objetos.some(o => !o.resuelto && o.c === c && o.z - this.metros > 0 && o.z - this.metros < 9 && !['hoja', 'regalo', 'rampa'].includes(o.k)); if (pel(this.carril)) { for (const c of [0, -1, 1]) if (!pel(c)) { this.carril = c; break; } } const g = (this.giros || []).find(x => !x.hecho && x.z - this.metros < 12 && x.z - this.metros > 0); if (g && (!this.ultGiro || this.ultGiro.d !== g.lado || this.metros - this.ultGiro.m > 16)) this.mover(g.lado); };
})();
