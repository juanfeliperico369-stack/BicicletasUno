/* =====================================================================
   MAPA VIVO: el nombre de la comuna o del municipio aparece al entrar, palomas en plazas y parques
   que vuelan al pasar, sombras de nubes y brillos en el agua.
   Todo es efecto visual: usa Math.random y no el azar de la partida (retos y multijugador no cambian).
   ===================================================================== */
const zonaNom = n => (n || '').replace(/^Comuna \d+ - /, '');
CityMap.barrioAt = function (x, y) { if (!this.ba) return ''; const v = this.ba[clamp(Math.floor(y / TS / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(x / TS / 8), 0, VM.mW - 1)]; return v ? VM.barrios[v - 1] : ''; };
CityMap.zonaAt = function (x, y) {
  const mu = this.muniAt(x, y), co = mu === 'Medellín' ? zonaNom(this.comunaAt(x, y)) : '', ba = this.barrioAt(x, y);
  return { k: ba || co || mu, txt: ba || co || mu, sub: ba ? (co ? co + ' · ' + mu : mu) : co ? 'Medellín' : 'Valle de Aburrá' };
};
/* centro de cada barrio (para rotular el mapa grande de cerca) */
CityMap.barrioCentros = function () {
  if (this._bc || !this.ba) return this._bc || []; const n = VM.barrios.length, sx = new Float64Array(n), sy = new Float64Array(n), k = new Float64Array(n), C = 8 * TS;
  for (let j = 0; j < VM.mH; j++) for (let i = 0; i < VM.mW; i++) { const v = this.ba[j * VM.mW + i]; if (v) { sx[v - 1] += i; sy[v - 1] += j; k[v - 1]++; } }
  return (this._bc = VM.barrios.map((nm, q) => k[q] ? [nm, (sx[q] / k[q] + .5) * C, (sy[q] / k[q] + .5) * C] : null).filter(Boolean));
};
/* centro de cada comuna (para rotular el mapa grande) */
CityMap.comunaCentros = function () {
  if (this._cc) return this._cc; const n = VM.comunas.length, sx = new Float64Array(n), sy = new Float64Array(n), k = new Float64Array(n), C = 8 * TS;
  for (let j = 0; j < VM.mH; j++) for (let i = 0; i < VM.mW; i++) { const v = this.co[j * VM.mW + i]; if (v) { sx[v - 1] += i; sy[v - 1] += j; k[v - 1]++; } }
  return (this._cc = VM.comunas.map((nm, q) => k[q] ? [zonaNom(nm), (sx[q] / k[q] + .5) * C, (sy[q] / k[q] + .5) * C] : null).filter(Boolean));
};
/* sombra de nube, dibujada una vez */
const nubeSombra = () => Art.cache.get('nubeS') || (Art.cache.set('nubeS', Art.mk(96, 60, x => {
  for (const [a, b, r] of [[30, 32, 22], [52, 26, 24], [70, 34, 18], [44, 40, 18]]) { const g = x.createRadialGradient(a, b, 2, a, b, r); g.addColorStop(0, 'rgba(10,20,45,.5)'); g.addColorStop(1, 'rgba(10,20,45,0)'); x.fillStyle = g; x.beginPath(); x.arc(a, b, r, 0, TAU); x.fill(); }
})), Art.cache.get('nubeS'));

const _life84 = Ride.prototype.updLife;
Ride.prototype.updLife = function (dt) {
  _life84.call(this, dt); const M = this.mode, P = this.p;
  // zona: se confirma en dos lecturas seguidas (1 s) para no parpadear en los bordes
  if (this.zB) this.zB.t -= dt;
  this.zT = (this.zT || 0) - dt;
  if (this.zT <= 0 && !M.sub) { this.zT = .5; const z = this.map.zonaAt(P.x, P.y); if (z.k && z.k !== this.zona) { if (z.k === this.zCand) { this.zona = z.k; this.zB = { t: 3, txt: z.txt, sub: z.sub }; } else this.zCand = z.k; } }
  // palomas: bandadas en plazas y parques cerca de ti; vuelan cuando te acercas
  const B = this.palomas || (this.palomas = []); this.palT = (this.palT == null ? 1 : this.palT) - dt;
  if (this.palT <= 0) {
    this.palT = 1.5 + Math.random() * 2;
    if (B.length < 3) for (let k = 0; k < 8; k++) {
      const x = P.x + (Math.random() - .5) * 320, y = P.y + (Math.random() - .5) * 440, v = this.map.get(Math.floor(x / TS), Math.floor(y / TS));
      if ((v !== TT.PLAZA && v !== TT.GRASS) || dist(x, y, P.x, P.y) < 70) continue;
      const ps = []; for (let j = 4 + (Math.random() * 6 | 0); j > 0; j--) ps.push({ dx: (Math.random() - .5) * 14, dy: (Math.random() - .5) * 10, ph: Math.random() * 6, vx: 0, vy: 0 });
      B.push({ x, y, ps, fly: 0 }); break;
    }
  }
  for (const f of B) {
    if (!f.fly && dist(f.x, f.y, P.x, P.y) < 30) { f.fly = .001; for (const q of f.ps) { const a = Math.atan2(f.y + q.dy - P.y, f.x + q.dx - P.x) + (Math.random() - .5) * .9, s = 40 + Math.random() * 30; q.vx = Math.cos(a) * s; q.vy = Math.sin(a) * s; } }
    if (f.fly) { f.fly += dt; for (const q of f.ps) { q.dx += q.vx * dt; q.dy += q.vy * dt; } } else for (const q of f.ps) q.ph += dt * 3;
  }
  this.palomas = B.filter(f => f.fly < 2.2 && dist(f.x, f.y, P.x, P.y) < 460);
};
/* en el suelo: brillos en el río y las quebradas, y las palomas que comen */
const _ground84 = Ride.prototype.drawGround;
Ride.prototype.drawGround = function (c, ox, oy, inV) {
  _ground84.apply(this, arguments); const t = this.mode.t, G = 18, M = this.map;
  c.fillStyle = 'rgba(255,255,255,.55)';
  for (let y = Math.floor(oy / G) * G; y < oy + View.vh + G; y += G) for (let x = Math.floor(ox / G) * G; x < ox + View.vw + G; x += G) {
    const v = M.get(Math.floor(x / TS), Math.floor(y / TS)); if (v !== TT.WATER && v !== TT.CANAL) continue;
    if (Math.sin(t * 2.1 + x * .13 + y * .071) > .8) c.fillRect(x - ox + Math.sin(t * .8 + y) * 2, y - oy, 2.4, .6);
  }
  for (const f of this.palomas || []) if (!f.fly && inV(f.x, f.y, 20)) for (const q of f.ps) {
    const x = f.x + q.dx - ox, y = f.y + q.dy - oy, pk = Math.sin(q.ph * 2.3) > .7 ? .5 : 0;
    c.fillStyle = '#80878f'; c.fillRect(x - .9, y - .5, 1.8, 1.1); c.fillStyle = '#4d5560'; c.fillRect(x + .7, y - .5 + pk, .7, .7);
  }
};
/* en el aire: palomas volando y sombras de nubes que pasan (de día y sin lluvia) */
const _sky84 = Ride.prototype.drawSky;
Ride.prototype.drawSky = function (c, ox, oy) {
  _sky84.apply(this, arguments); const t = this.mode.t;
  for (const f of this.palomas || []) if (f.fly) {
    c.globalAlpha = Math.max(0, 1 - f.fly / 2.2); c.fillStyle = '#6f7782';
    for (const q of f.ps) { const x = f.x + q.dx - ox, y = f.y + q.dy - oy, s = 1 + f.fly * .8, w = Math.sin((t + q.ph) * 22) > 0 ? 1.6 : .5; c.fillRect(x - w * s, y - .4 * s, w * 2 * s, .8 * s); c.fillRect(x - .5 * s, y - .6 * s, s, 1.2 * s); }
    c.globalAlpha = 1;
  }
  const n = Art.night(this.min); if (n >= .5 || this.mode.mods.rain || JE.headless) return;
  const C = 760, d = t * 7, img = nubeSombra(); c.globalAlpha = .55 * (1 - n * 1.6);
  for (let gy = Math.floor((oy - 200) / C); gy <= Math.floor((oy + View.vh + 200) / C); gy++) for (let gx = Math.floor((ox - d - 300) / C); gx <= Math.floor((ox - d + View.vw + 300) / C); gx++) {
    const x = gx * C + h2(gx, gy, 81) * C * .7 + d, y = gy * C + h2(gx, gy, 82) * C * .7, w = 220 + h2(gx, gy, 83) * 160; c.drawImage(img, x - ox - w / 2, y - oy - w * .31, w, w * .62);
  }
  c.globalAlpha = 1;
};
/* nombre de la zona al entrar (arriba, sin tapar el minimapa) */
const _hud84 = Ride.prototype.hud;
Ride.prototype.hud = function (V) {
  const r = _hud84.apply(this, arguments), B = this.zB; if (!B || B.t <= 0 || this.mode.sub) return r;
  const a = clamp(Math.min(B.t / .5, (3 - B.t) / .35), 0, 1), y = (View.hudB || 50) + 34, c = V.ctx; c.save(); c.globalAlpha = a;
  V.text(B.txt, V.w / 2, y, { size: 19, align: 'center', color: '#fff', stroke: '#0a2342', sw: 5 }); V.text(B.sub, V.w / 2, y + 16, { size: 11, align: 'center', color: PAL.vd1, stroke: '#0a2342', sw: 3, body: true });
  c.restore(); return r;
};
