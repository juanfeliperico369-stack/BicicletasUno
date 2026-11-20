/* =====================================================================
   MOTOR CITY 3.0 EN JUEGA ENCICLA (adaptado a su forma: mapa de casillas de 10 m y sprites)
   1) Calidad automática del 3.0: mide el tiempo REAL entre cuadros (media móvil), reacciona en ~1 s y solo deja
      un escalón más bajo si de verdad mejoró (si no, vuelve y no insiste por 60 s: la pantalla puede ir a 30 Hz).
   2) Artilugios físicos (MC.Objetos del motor, a la escala de los sprites): conos de obra en las ciclorrutas y
      balones en las plazas. La bici los tumba y los hace rodar; saltan un poco, caen, ruedan con roce, chocan con las
      casas y se duermen quietos. No frenan la bici: son vida, no castigo.
   ===================================================================== */
Calidad.cuadro = function (t) {
  const dt = t - this.last; this.last = t; const M = Game.mode; if (!M || !M.ride || M.sub || Game.paused || JE.headless || !(dt > 0 && dt < 250)) return;
  const q = View.calidad || 1, base = Math.min(window.devicePixelRatio || 1, 2), ahora = performance.now();
  this.ema = this.ema == null ? dt : this.ema * .9 + dt * .1;
  const P = this.prueba; if (P) { P.t += dt; if (P.t > 600) P.m = P.m == null ? dt : P.m * .9 + dt * .1; if (P.t > 2200) { if (P.m > P.antes * .93) { if (P.tipo === 'q') { View.calidad = P.q0; View.resize(); } else { this.d3 = 1; JE.calidad3D = 1; } this.piso = ahora + 60000; } this.ema = P.m; this.prueba = null; } return; }
  if (this.ema > 21) { this.lento = (this.lento || 0) + dt; this.holgado = 0; } else if (this.ema < 18.2) { this.holgado = (this.holgado || 0) + dt; this.lento = 0; } else { this.lento = Math.max(0, (this.lento || 0) - dt / 2); this.holgado = 0; }
  if (this.lento > 800 && !(this.piso > ahora)) {
    this.lento = 0;
    if (this.d3 > 0) { this.prueba = { tipo: 'd3', antes: this.ema, t: 0 }; this.d3 = 0; JE.calidad3D = 0; }
    else if (base > 1.01 && q > .6) { this.prueba = { tipo: 'q', q0: q, antes: this.ema, t: 0 }; View.calidad = Math.round((q - .2) * 10) / 10; View.resize(); }
  } else if (this.holgado > 4000) {
    this.holgado = 0; if (q < 1 && base > 1.01) { View.calidad = Math.round((q + .2) * 10) / 10; View.resize(); } else if (this.d3 < 1) { this.d3 = 1; JE.calidad3D = 1; }
  }
};
const Artilugios = JE.artilugios = {
  L: [], K: 2.6,   // K: los objetos se ven K veces su tamaño real, como los demás sprites del mapa
  TIPOS: { cono: { r: .25, h: .7, masa: 2, rebote: .3, roce: 2.6, col: '#ff6a13', col2: '#f4f4f4' }, balon: { r: .12, h: .24, masa: .45, rebote: .7, roce: 1.4, col: '#f5f5f5', col2: '#1b1b1b' } },
  poner(tipo, x, y) { const T = this.TIPOS[tipo]; const o = Object.assign({ tipo, x, y, z: 0, vx: 0, vy: 0, vz: 0, a: 0, va: 0, vuelco: 0, dormido: true }, T); this.L.push(o); return o; },
  /* conos de obra en grupos de 3 sobre ciclorrutas y balones en plazas, alrededor del punto (x, y en px del mapa) */
  sembrar(cx, cy, radioPx = 900, n = 36, sem = 1) {
    const map = JE.map; if (!map) return 0; let k = 0, s = sem * 9301 + 49297;
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n * 30 && k < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * radioPx, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, tt = map.get(Math.floor(x / TS), Math.floor(y / TS));
      if (tt === TT.CICLO && r() < .5) { for (let j = 0; j < 3; j++) this.poner('cono', x + j * 1.6, y + j * .5); k += 3; }
      else if (tt === TT.PLAZA) { this.poner('balon', x, y); k++; }
    }
    return k;
  },
  /* la bici (o el que vaya) empuja: impulso según su masa; gravedad y roce en px del mapa */
  actualizar(ride, dt) {
    dt = Math.min(dt, .05); const P = ride.p, map = JE.map, mpp = M_PER_PX, G = 9.81 / mpp, vx = Math.cos(P.a) * P.v, vy = Math.sin(P.a) * P.v, masa = P.veh === 'walk' ? 70 : 85;
    for (const o of this.L) {
      const dx = o.x - P.x, dy = o.y - P.y, d = Math.hypot(dx, dy), R = o.r * this.K / mpp + 2.2;   // lo que se ve: el objeto a escala de sprite más la bici
      if (d < R && d > 1e-3) { const nx = dx / d, ny = dy / d, rel = (vx - o.vx) * nx + (vy - o.vy) * ny; o.x += nx * (R - d); o.y += ny * (R - d);
        if (rel > .3) { const J = rel * (1 + o.rebote) * masa / (masa + o.masa); o.vx += nx * J; o.vy += ny * J; o.vz = Math.min(4.5 / mpp, J * (o.tipo === 'balon' ? .3 : .18)); o.va += (Math.random() - .5) * 6; if (o.tipo === 'cono') o.vuelco = 1; o.dormido = false; this.golpes = (this.golpes || 0) + 1; if (typeof vib === 'function') vib(15); if (J * mpp > 2 && typeof Snd !== 'undefined') Snd.sfx('tap'); } }
      if (o.dormido) continue;
      o.vz -= G * dt; o.z += o.vz * dt; if (o.z <= 0) { o.z = 0; o.vz = Math.abs(o.vz) * mpp > 1 ? -o.vz * o.rebote : 0; const f = Math.max(0, 1 - o.roce * dt); o.vx *= f; o.vy *= f; o.va *= f; }
      const nx = o.x + o.vx * dt, ny = o.y + o.vy * dt, tt = map.get(Math.floor(nx / TS), Math.floor(ny / TS));
      if (tt === TT.BLDG || tt === TT.BRICK || tt === TT.WATER) { o.vx *= -o.rebote; o.vy *= -o.rebote; } else { o.x = nx; o.y = ny; }
      o.a += o.va * dt; if (o.z === 0 && Math.hypot(o.vx, o.vy) * mpp < .05) { o.vx = o.vy = o.va = 0; o.dormido = true; }
    }
  },
  /* encima de la ciudad, con la misma cámara (w2s ya sabe del giro) */
  dibujar(ride, V) {
    if (!this.L.length) return; const c = V.ctx, s = V.s, k = this.K / M_PER_PX * s; c.save(); c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    for (const o of this.L) {
      const p = ride.w2s(o.x, o.y); if (p.x < -20 || p.y < -20 || p.x > V.vw * s + 20 || p.y > V.vh * s + 20) continue; const r = Math.max(1.5, o.r * k), zp = o.z * s * .6;
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(p.x + r * .3, p.y + r * .3, r * 1.1, r * .65, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = o.col; c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1;
      if (o.tipo === 'balon') { c.beginPath(); c.arc(p.x, p.y - r - zp, r, 0, Math.PI * 2); c.fill(); c.stroke(); c.fillStyle = o.col2; c.beginPath(); c.arc(p.x, p.y - r - zp, r * .35, 0, Math.PI * 2); c.fill(); }
      else if (!o.vuelco) { const h = o.h * k; c.beginPath(); c.moveTo(p.x - r, p.y); c.lineTo(p.x, p.y - h); c.lineTo(p.x + r, p.y); c.closePath(); c.fill(); c.stroke(); c.fillStyle = o.col2; c.fillRect(p.x - r * .45, p.y - h * .55, r * .9, Math.max(1, h * .14)); }
      else { c.save(); c.translate(p.x, p.y - zp); c.rotate(o.a); c.beginPath(); c.moveTo(-o.h * k * .5, -r * .8); c.lineTo(o.h * k * .5, 0); c.lineTo(-o.h * k * .5, r * .8); c.closePath(); c.fill(); c.stroke(); c.restore(); }
    }
    c.restore();
  }
};
const _upd97 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) {
  const r = _upd97.call(this, dt, dir);
  if (!this._artis && this.p && JE.map) { this._artis = true; Artilugios.L = []; Artilugios.sembrar(this.p.x, this.p.y, 1100, 40, (Game.mode && Game.mode.seed) || 1); }
  Artilugios.actualizar(this, dt); return r;
};
const _top97 = Ride.prototype.renderTop0;
Ride.prototype.renderTop0 = function (V, sw, sh) { _top97.call(this, V, sw, sh); try { Artilugios.dibujar(this, V); } catch (e) { JE.errors && JE.errors.push(String(e)); } };
