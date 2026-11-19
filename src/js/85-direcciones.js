/* =====================================================================
   DIRECCIONES PAISAS (idea de El Metro, hecha para EnCicla)
   - La calle por la que vas, siempre a la vista (nombre popular y nomenclatura oficial).
   - Misión "¿Dónde queda?" en el modo libre: un domicilio a "Calle X con Carrera Y" sin marca en el mapa.
     Enseña la regla de Medellín: las calles crecen hacia el norte y las carreras hacia el occidente.
   - Secretos de El Metro: el homenaje a Gardel (estación de Metroplús en Manrique) y subir a Arví.
   ===================================================================== */
const NOMB = i => (VM.calles || [])[i - 1] || '';
/* la vía más cercana con nombre (a menos de ~12 m): { n: nombre que usa la gente, nom: nomenclatura oficial } */
CityMap.calleAt = function (x, y) {
  let best = null, bd = 20;
  for (const ch of this.chainsNear(x - 24, y - 24, 48, 48)) {
    if (!(ch.n || ch.nom) || !(ch.k <= 4 || ch.k === 6)) continue; const p = ch.p;
    for (let i = 2; i < p.length; i += 2) { const ax = p[i - 2], ay = p[i - 1], dx = p[i] - ax, dy = p[i + 1] - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (d < bd) { bd = d; best = ch; } }
  }
  if (!best) return null; const n = NOMB(best.n), nom = NOMB(best.nom);
  return { n: n || nom, nom: nom && nom !== n ? nom : '' };
};
/* una esquina "Calle X con Carrera Y" a cierta distancia (px) del punto */
CityMap.esquina = function (x, y, rmin, rmax, rng) {
  const near = this.chainsNear(x - rmax, y - rmax, rmax * 2, rmax * 2).filter(ch => ch.nom && ch.k >= 1 && ch.k <= 4);
  const bb = ch => ch.bb || (ch.bb = (() => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (let i = 0; i < ch.p.length; i += 2) { a = Math.min(a, ch.p[i]); c = Math.max(c, ch.p[i]); b = Math.min(b, ch.p[i + 1]); d = Math.max(d, ch.p[i + 1]); } return [a, b, c, d]; })());
  const cl = near.filter(ch => /^Calle \d/.test(NOMB(ch.nom))), cr = near.filter(ch => /^Carrera \d/.test(NOMB(ch.nom)));
  for (let i = cl.length - 1; i > 0; i--) { const j = Math.floor(rng.f() * (i + 1)); [cl[i], cl[j]] = [cl[j], cl[i]]; }
  for (const a of cl.slice(0, 60)) { const A = bb(a);
    for (const b of cr) { const B = bb(b); if (A[0] > B[2] || B[0] > A[2] || A[1] > B[3] || B[1] > A[3]) continue; const p = a.p, q = b.p;
      for (let i = 2; i < p.length; i += 2) for (let j = 2; j < q.length; j += 2) {
        const x1 = p[i - 2], y1 = p[i - 1], x2 = p[i], y2 = p[i + 1], x3 = q[j - 2], y3 = q[j - 1], x4 = q[j], y4 = q[j + 1], den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4); if (!den) continue;
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den, u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den; if (t < 0 || t > 1 || u < 0 || u > 1) continue;
        const ix = x1 + t * (x2 - x1), iy = y1 + t * (y2 - y1), d = dist(ix, iy, x, y); if (d > rmin && d < rmax) return { x: ix, y: iy, a: NOMB(a.nom), b: NOMB(b.nom) };
      } } }
  return null;
};

/* ---------- la calle por la que vas ---------- */
const _life85 = Ride.prototype.updLife;
Ride.prototype.updLife = function (dt) {
  _life85.call(this, dt); const P = this.p;
  this.cT = (this.cT || 0) - dt;
  if (this.cT <= 0) { this.cT = .4; const c = this.map.calleAt(P.x, P.y); if (c) { this.calle = c; this.calleT = 1.6; } }
  if (this.calleT > 0) this.calleT -= dt;
  // secretos de El Metro: Gardel (Metroplús, Manrique) y Arví (al final del cable L)
  this.sT = (this.sT || 0) - dt; if (this.sT > 0 || JE.headless) return; this.sT = .6;
  const F = Save.data.flags, M = this.map;
  if (!F.gardel) for (const L of M.mp || []) for (const s of L.st) if (s.name === 'Gardel' && dist(s.px, s.py, P.x, P.y) < 40 * WK) {
    F.gardel = 1; Save.save(); this.stamp = { t: 2.8, title: '¡HOMENAJE A GARDEL!', sub: 'Carlos Gardel murió en Medellín en 1935', bg: '#0E6F76' }; Snd.sfx('star');
    if (JE.ui) { JE.ui.toast('🎩 Estación Gardel del Metroplús: en Manrique el tango se baila en la calle.'); const nw = Logros.check(); if (nw.length) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', ')); }
  }
  if (!F.arvi) { const c = CABLES.find(k => /Arví/.test(k[0])), e = c && c[2][c[2].length - 1]; if (e) { const g = geoP(e[0], e[1]); if (dist(g.x, g.y, P.x, P.y) < 60 * WK) {
    F.arvi = 1; Save.save(); this.stamp = { t: 2.8, title: '¡LLEGASTE A ARVÍ!', sub: 'Subiste en bici hasta el bosque de la montaña', bg: '#8E612A' }; Snd.sfx('star');
    if (JE.ui) { JE.ui.toast('🌲 Parque Arví: bosque, mercado campesino y caminos de los antiguos pobladores. Lo normal es subir en el cable L.'); const nw = Logros.check(); if (nw.length) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', ')); } } } }
};
const _hud85 = Ride.prototype.hud;
Ride.prototype.hud = function (V) {
  const r = _hud85.apply(this, arguments), C = this.calle; if (!C || !(this.calleT > 0) || this.mode.sub || this.big) return r;
  const y = Math.max((View.hudB || 50) + 12, (View.top || 0) + 8), t = '📍 ' + C.n   // debajo de los objetivos, si los hay + (C.nom ? ' · ' + C.nom : '');
  V.text(t.length > 46 ? t.slice(0, 45) + '…' : t, 10, y, { size: 11, align: 'left', color: '#fff', stroke: '#0a2342', sw: 3, body: true });
  return r;
};

/* ---------- misión "¿Dónde queda?" (modo libre, en Medellín, donde está la nomenclatura oficial) ---------- */
const _init85 = ModeUsuarioR.prototype.libreInit;
ModeUsuarioR.prototype.libreInit = function (now) {
  _init85.call(this, now); const R = this.ride, P = R.p, M = JE.map;
  if (!this.free || VM.v < 3 || M.muniAt(P.x, P.y) !== 'Medellín') return;
  const e = M.esquina(P.x, P.y, 500, 1500, this.rng); if (!e) return;
  const ms = { id: 'dir', kind: 'dir', txt: '📮 ¿Dónde queda? Lleva un domicilio a la ' + e.a + ' con ' + e.b, h: 6, xp: 50, marks: [], e, t: 0 }; this.misiones.push(ms); this.dirMs = ms;
  this.goal(ms.txt, false, () => ms.done, () => ms.marks.length ? 'te marcamos la esquina' : 'sin marca: guíate por las calles');
  if (JE.ui) JE.ui.toast('📮 Domicilio a la ' + e.a + ' con ' + e.b + '. Pista: en Medellín las calles crecen hacia el norte y las carreras hacia el occidente.');
};
const _tick85 = ModeUsuarioR.prototype.tick;
ModeUsuarioR.prototype.tick = function (dt) {
  _tick85.call(this, dt); const ms = this.dirMs; if (!ms || ms.done) return; const P = this.ride.p, e = ms.e;
  ms.t += dt;
  if (ms.t > 75 && !ms.marks.length) { const m = this.ride.marker({ x: e.x, y: e.y, r: 14, col: '#e8641f', label: '📮 ' + e.a + ' con ' + e.b }); m.mis = ms; ms.marks.push(m); JE.ui && JE.ui.toast('📮 Pista: te marcamos la esquina en el mapa'); }
  if (dist(e.x, e.y, P.x, P.y) < 18 * WK) {
    const F = Save.data.flags, solo = !ms.marks.length; F.dirs = (F.dirs || 0) + 1; if (solo) F.dirsSolo = (F.dirsSolo || 0) + 1;
    this.cumplir(ms); const nw = Logros.check(); Save.save(); this.ride.stamp = { t: 2.6, title: solo ? '¡SIN MAPA!' : '¡DOMICILIO ENTREGADO!', sub: e.a + ' con ' + e.b, bg: '#e8641f' }; Snd.sfx('star');
    if (JE.ui && nw.length) JE.ui.toast('🏅 Logro: ' + nw.map(l => l.name).join(', '));
  }
};
LOGROS.push(
  { id: 'direcciones', name: 'Domiciliario paisa', desc: 'Encuentra 3 esquinas por su dirección (Calle con Carrera)', icon: 'usuario', test: S => (S.flags.dirs || 0) >= 3 },
  { id: 'sinmapa', name: 'Sin mapa', desc: 'Llega a una dirección antes de que te la marquen', icon: 'usuario', secret: true, test: S => (S.flags.dirsSolo || 0) >= 1 },
  { id: 'gardel', name: 'Volver', desc: 'Pasa por la estación Gardel del Metroplús, en Manrique', icon: 'usuario', secret: true, test: S => !!S.flags.gardel },
  { id: 'arvi', name: 'Hasta Arví', desc: 'Sube en bici hasta la estación Arví del cable L', icon: 'usuario', secret: true, test: S => !!S.flags.arvi }
);
