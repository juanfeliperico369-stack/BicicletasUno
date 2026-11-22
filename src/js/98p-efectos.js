/* =====================================================================
   EFECTOS PARA TODO PÚBLICO (v2.1) · portados de Motor City 4.5 (js/88-efectos.js, MC.Efectos) a la vista cenital
   de Juega EnCicla, en px del mapa (1 m = 1,6 px). Sin explosiones ni fuego: solo lo que pasa de verdad en una ciclorruta.
   - polvo:   bocanadas que crecen y se desvanecen (tierra, pasto, bordillo, frenada en seco)
   - chispa:  rayitas brillantes con gravedad (el camión que roza; un tubo que raspa)
   - pedazo:  trocitos que saltan, giran y rebotan (un cono que se parte, una caneca que se riega)
   - hoja:    hojas que caen girando (al rozar un árbol o arbusto)
   - gota:    salpicaduras de los charcos cuando llueve
   - aro:     onda que se abre en el piso (un golpe, un timbrazo fuerte)
   - marcas:  las llantas dejan su marca al frenar fuerte o derrapar; se borran despacio (40 s)
   Todo vive en arreglos con tope (sin crear basura cada cuadro). Con «reducir movimiento» del sistema, la mitad.
   API: JE.efx.polvo(x, y, n, col) · chispas(x, y, n, dir) · pedazos(x, y, n, col) · hojas(x, y, n) · gotas(x, y, n)
        aro(x, y, r, col) · marca(x1, y1, x2, y2, w, a) · actualizar(dt) · dibujarSuelo(c, ox, oy) · dibujar(c, ox, oy, noche)
   ===================================================================== */
const Efx = JE.efx = {
  P: [], MAXP: 260, M: [], MAXM: 420, t: 0, _i: 0, _im: 0,
  pocos() { return this._pocos == null ? (this._pocos = !!(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) : this._pocos; },
  n(n) { return JE.headless ? 0 : this.pocos() ? Math.ceil(n / 2) : n; },
  _p(tipo, x, y, vx, vy, vida, r, col, z = 0, vz = 0) {
    this.k = (this.k | 0) + 1; let p; if (this.P.length >= this.MAXP) { this._i = (this._i + 1) % this.P.length; p = this.P[this._i]; } else { p = {}; this.P.push(p); }
    p.tipo = tipo; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.z = z; p.vz = vz; p.t = 0; p.vida = vida; p.r = r; p.col = col; p.rot = Math.random() * TAU; p.vr = (Math.random() - .5) * 12; return p;
  },
  /* ---------- emisores (px del mapa; dir en radianes o null) ---------- */
  polvo(x, y, n = 4, col = '#cdbf9f', k = 1) {
    for (let i = this.n(n); i-- > 0;) { const a = Math.random() * TAU, s = (3 + Math.random() * 7) * k; this._p('polvo', x + (Math.random() - .5) * 2, y + (Math.random() - .5) * 2, Math.cos(a) * s, Math.sin(a) * s, .55 + Math.random() * .5, (1.2 + Math.random() * 1.2) * k, col, .4, 2 + Math.random() * 3); }
  },
  chispas(x, y, n = 8, dir = null, k = 1) {
    for (let i = this.n(n); i-- > 0;) { const a = dir == null ? Math.random() * TAU : dir + (Math.random() - .5) * 1.5, s = (18 + Math.random() * 34) * k; this._p('chispa', x, y, Math.cos(a) * s, Math.sin(a) * s, .22 + Math.random() * .3, .5, Math.random() < .5 ? '#fff6c8' : '#ffc23a', 1 + Math.random() * 2, 8 + Math.random() * 14); }
  },
  pedazos(x, y, n = 6, col = '#ff6a13', k = 1) {
    for (let i = this.n(n); i-- > 0;) { const a = Math.random() * TAU, s = (10 + Math.random() * 26) * k; this._p('pedazo', x, y, Math.cos(a) * s, Math.sin(a) * s, 1.2 + Math.random() * 1.4, .5 + Math.random() * .7, col, 1 + Math.random() * 2, 10 + Math.random() * 16); }
  },
  hojas(x, y, n = 5, col) {
    const C = ['#5f9e46', '#7cb342', '#4e8a3a', '#9bd341', '#c9a227'];
    for (let i = this.n(n); i-- > 0;) { const a = Math.random() * TAU, s = 4 + Math.random() * 9; this._p('hoja', x + (Math.random() - .5) * 6, y + (Math.random() - .5) * 6, Math.cos(a) * s, Math.sin(a) * s, 1.6 + Math.random() * 1.4, .9 + Math.random() * .5, col || C[(Math.random() * C.length) | 0], 6 + Math.random() * 6, -1); }
  },
  gotas(x, y, n = 6) {
    for (let i = this.n(n); i-- > 0;) { const a = Math.random() * TAU, s = 6 + Math.random() * 14; this._p('gota', x, y, Math.cos(a) * s, Math.sin(a) * s, .35 + Math.random() * .25, .45, '#cfe8ff', .5, 9 + Math.random() * 8); }
  },
  aro(x, y, r = 8, col = '#ffffff') { if (!JE.headless) this._p('aro', x, y, 0, 0, .45, r, col); },
  marca(x1, y1, x2, y2, w = .9, a = .32) {
    if (JE.headless || Math.hypot(x2 - x1, y2 - y1) > 12) return; const m = { x1, y1, x2, y2, w, a, t0: this.t };
    if (this.M.length >= this.MAXM) { this._im = (this._im + 1) % this.MAXM; this.M[this._im] = m; } else this.M.push(m);
  },
  limpiar() { this.P.length = 0; this.M.length = 0; },
  /* ---------- física: gravedad en z, roce en el piso ---------- */
  actualizar(dt) {
    this.t += dt; const G = 60;
    for (const p of this.P) {
      if (p.t >= p.vida) continue; p.t += dt;
      if (p.tipo === 'aro') continue;
      if (p.tipo === 'hoja') { p.z = Math.max(0, p.z - dt * (2.2 + Math.sin(p.t * 5) * 1.2)); p.x += (p.vx + Math.sin(p.t * 3 + p.rot) * 4) * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 1.5; p.vy *= 1 - dt * 1.5; p.rot += p.vr * dt * .4; continue; }
      if (p.tipo === 'polvo') { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 3; p.vy *= 1 - dt * 3; p.z += p.vz * dt; p.vz *= 1 - dt * 2; continue; }
      p.vz -= G * dt; p.z += p.vz * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.z <= 0) { p.z = 0; if (p.tipo === 'chispa' || p.tipo === 'gota') { p.t = p.vida; continue; } p.vz = Math.abs(p.vz) > 6 ? -p.vz * .35 : 0; p.vx *= .6; p.vy *= .6; p.vr *= .6; }
    }
  },
  /* las marcas van en el piso (debajo de la bici y de los carros) */
  dibujarSuelo(c, ox, oy) {
    if (!this.M.length) return; const vw = View.vw + 40, vh = View.vh + 40; c.save(); c.lineCap = 'round'; c.strokeStyle = '#1b1c20';
    for (const m of this.M) {
      const e = this.t - m.t0; if (e > 40) continue; const x1 = m.x1 - ox, y1 = m.y1 - oy; if (x1 < -20 || y1 < -20 || x1 > vw || y1 > vh) continue;
      c.globalAlpha = m.a * (e > 30 ? 1 - (e - 30) / 10 : 1); c.lineWidth = m.w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(m.x2 - ox, m.y2 - oy); c.stroke();
    }
    c.restore();
  },
  /* las partículas van encima de todo lo del suelo; z sube en la pantalla (vista desde arriba con un poco de perspectiva) */
  dibujar(c, ox, oy, noche = 0) {
    if (!this.P.length) return; const vw = View.vw + 30, vh = View.vh + 30, osc = 1 - noche * .45; c.save();
    for (const p of this.P) {
      if (p.t >= p.vida) continue; const x = p.x - ox, y = p.y - oy - p.z * .6; if (x < -30 || y < -30 || x > vw || y > vh) continue; const f = p.t / p.vida;
      switch (p.tipo) {
        case 'polvo': c.globalAlpha = (1 - f) * .42 * osc; c.fillStyle = p.col; c.beginPath(); c.arc(x, y, p.r * (1 + f * 1.4), 0, TAU); c.fill(); break;
        case 'chispa': { c.globalAlpha = 1 - f * .6; c.strokeStyle = p.col; c.lineWidth = .7; const l = .035; c.beginPath(); c.moveTo(x, y); c.lineTo(x - p.vx * l, y - p.vy * l + p.vz * l * .6); c.stroke(); break; }
        case 'pedazo': c.globalAlpha = (f > .8 ? (1 - f) * 5 : 1) * osc + (1 - osc) * .5; c.fillStyle = p.col; c.save(); c.translate(x, y); c.rotate(p.rot); c.fillRect(-p.r, -p.r * .6, p.r * 2, p.r * 1.2); c.restore(); break;
        case 'hoja': c.globalAlpha = f > .75 ? (1 - f) * 4 : 1; c.fillStyle = p.col; c.save(); c.translate(x, y); c.rotate(p.rot); c.beginPath(); c.ellipse(0, 0, p.r, p.r * .45, 0, 0, TAU); c.fill(); c.restore(); break;
        case 'gota': c.globalAlpha = .75 * (1 - f); c.fillStyle = p.col; c.fillRect(x - .4, y - .4, .8, .8); break;
        case 'aro': c.globalAlpha = .55 * (1 - f); c.strokeStyle = p.col; c.lineWidth = .8; c.beginPath(); c.arc(x, y, p.r * (.3 + f), 0, TAU); c.stroke(); break;
      }
    }
    c.restore();
  }
};
/* ---------- enganche con el recorrido (vista cenital) ---------- */
(function () {
  const _upd = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) { const r = _upd.call(this, dt, dir); if (!Game.mode || Game.mode.ride === this) Efx.actualizar(dt); return r; };   // solo el recorrido que se ve (en red hay más de uno)
  /* las marcas, en el piso: al final de lo del suelo (marcadores, hojas, semáforos) */
  const _dg = Ride.prototype.drawGround;
  Ride.prototype.drawGround = function (b, ox, oy, inV) { _dg.call(this, b, ox, oy, inV); try { Efx.dibujarSuelo(b, ox, oy); } catch (e) { JE.errors && JE.errors.push('efx suelo: ' + e.message); } };
  /* las partículas, encima de la ciudad y debajo del cielo (cables, aves); se oscurecen de noche */
  const _sky = Ride.prototype.drawSky;
  Ride.prototype.drawSky = function (b, ox, oy) { try { Efx.dibujar(b, ox, oy, Art.night(this.min || 600)); } catch (e) { JE.errors && JE.errors.push('efx: ' + e.message); } return _sky.call(this, b, ox, oy); };
  /* cada partida empieza limpia */
  const _start = Game.start;
  Game.start = function () { Efx.limpiar(); return _start.apply(this, arguments); };
  /* el choque con un carro: un aro en el piso y un poco de polvo (sin sangre ni nada feo: la bici se tambalea) */
  const _crash = Ride.prototype.crash;
  Ride.prototype.crash = function (c) { const P = this.p; Efx.aro(P.x, P.y, 10, '#ffffff'); Efx.polvo(P.x, P.y, 5, '#d9d2c2'); return _crash.call(this, c); };
  /* los artilugios de 97-motor30.js: el cono golpeado suelta pedacitos naranja y el balón un aro */
  if (typeof Artilugios !== 'undefined') {
    const _act = Artilugios.actualizar;
    Artilugios.actualizar = function (ride, dt) { const g0 = this.golpes | 0; const r = _act.call(this, ride, dt); if ((this.golpes | 0) > g0 && ride && ride.p) { const P = ride.p; Efx.polvo(P.x + Math.cos(P.a) * 4, P.y + Math.sin(P.a) * 4, 3, '#d8ccb0', .8); if (Math.random() < .5) Efx.pedazos(P.x + Math.cos(P.a) * 4, P.y + Math.sin(P.a) * 4, 3, '#ff6a13', .7); } return r; };
  }
  /* sonidos nuevos: golpe sordo, roce contra la pared y el tumbo del bordillo (síntesis, sin archivos) */
  const _sfx = Snd.sfx;
  Snd.sfx = function (n) {
    if (n !== 'golpe' && n !== 'roce' && n !== 'bordillo' && n !== 'frenazo') return _sfx.apply(this, arguments);
    if (!this.ctx || !Save.data.settings.sfx || JE.headless) return; this.resume && this.resume(); const T = (f, d, o) => this.tone(f, d, o), now = this.ctx.currentTime;
    if (n === 'golpe') { T(130, .16, { type: 'triangle', v: .09, to: 70 }); this.hat && this.hat(now, .05); }
    else if (n === 'roce') { T(900, .07, { type: 'sawtooth', v: .018, to: 500 }); }
    else if (n === 'bordillo') { T(180, .06, { type: 'triangle', v: .05, to: 120 }); }
    else if (n === 'frenazo') { T(1400, .22, { type: 'sawtooth', v: .012, to: 900 }); }
  };
})();
