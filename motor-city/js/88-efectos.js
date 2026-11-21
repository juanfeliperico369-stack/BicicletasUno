/* =====================================================================
   EFECTOS (4.5) · explosiones, choques, derrapes y cosas rotas, con peso y lógica
   Hecho desde la idea de los juegos de acción y carreras (Burnout, GTA, Need for Speed): el golpe se ve, se oye y se siente.
   - EXPLOSIÓN: destello, bola de fuego que crece y se apaga, onda expansiva, pedazos que vuelan y rebotan, columna de humo
     negro que sube unos segundos, mancha quemada en el piso y sacudida de cámara. MC.Efectos.explosion(x, y, k)
   - CHOQUE: chispas que salen en abanico desde el punto del golpe, vidrio si fue duro, pedazos de lata si fue muy duro.
   - DERRAPE: las dos llantas traseras dejan su marca (se borra despacio) y sueltan humo blanco.
   - ROTOS (MC.Rotos): cada cosa deja sus restos: el poste tendido, la caneca regada con papeles, la banca en tablas, el cono
     rodando, el paradero en vidrios y el hidrante con su chorro de agua unos segundos.
   - FUEGO: un carro destrozado arde (llamas que titilan y humo) antes de estallar.
   Todo vive en arreglos con tope (sin crear basura cada cuadro) y se dibuja encima de cualquier vista con pr(x, y, z).
   Se enciende solo con los eventos del motor: 'choque', 'rompe' y 'derrape' (del cuerpo del jugador).
   ===================================================================== */
const Efectos = {
  P: [], MAXP: 700, marcas: [], MAXM: 1200, restos: [], MAXR: 180, fuegos: [], ondas: [], _t: null, _ult: null,
  _p(tipo, x, y, z, vx, vy, vz, vida, r, col) {
    let p; if (this.P.length >= this.MAXP) { p = this.P[(this._i = ((this._i || 0) + 1) % this.P.length)]; } else { p = {}; this.P.push(p); }
    p.tipo = tipo; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.t = 0; p.vida = vida; p.r = r; p.col = col || null; p.rot = Math.random() * TAU; p.vr = (Math.random() - .5) * 14; return p;
  },
  /* ---------- emisores ---------- */
  chispas(x, y, n = 12, dir = null, k = 1) {
    for (let i = 0; i < n; i++) { const a = dir == null ? Math.random() * TAU : dir + (Math.random() - .5) * 1.6, s = (4 + Math.random() * 9) * k; this._p('chispa', x, y, .5 + Math.random() * .6, Math.cos(a) * s, Math.sin(a) * s, 1 + Math.random() * 3, .25 + Math.random() * .35, .05); }
  },
  humo(x, y, n = 4, op = {}) {
    for (let i = 0; i < n; i++) { const q = this._p('humo', x + (Math.random() - .5) * (op.r || 1), y + (Math.random() - .5) * (op.r || 1), op.z ?? .6, (Math.random() - .5) * .8 + (op.vx || 0), (Math.random() - .5) * .8 + (op.vy || 0), (op.sube ?? 1.4) * (.6 + Math.random() * .6), op.vida || 2.6 + Math.random() * 1.6, op.tam || .7 + Math.random() * .5, op.col || (op.negro ? '#1d1f23' : '#d9d6cf')); if (op.retardo) q.t = -op.retardo * (.6 + Math.random() * .8); }
  },
  pedazos(x, y, n = 8, col = '#2b343d', k = 1, tipo = 'pedazo') {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = (2 + Math.random() * 6) * k; this._p(tipo, x, y, .4 + Math.random(), Math.cos(a) * s, Math.sin(a) * s, 2 + Math.random() * 5 * k, 1.6 + Math.random() * 2.4, tipo === 'vidrio' ? .06 + Math.random() * .08 : .1 + Math.random() * .22 * k, col); }
  },
  agua(x, y, n = 6, alto = 6) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = .4 + Math.random() * .9; this._p('agua', x, y, .3, Math.cos(a) * s, Math.sin(a) * s, alto * (.8 + Math.random() * .4), 1.3, .09); } },
  fuego(x, y, dur = 3, op = {}) { const f = { x, y, t: 0, dur, k: op.k || 1, sigue: op.sigue || null, alEstallar: op.alEstallar || null, estalla: op.estalla !== false }; this.fuegos.push(f); if (this.fuegos.length > 24) this.fuegos.shift(); return f; },
  explosion(x, y, k = 1) {
    this.ondas.push({ x, y, t: 0, k }); if (this.ondas.length > 12) this.ondas.shift();
    this._p('flash', x, y, 1, 0, 0, 0, .22, 6 * k);
    for (let i = 0; i < 26 * k; i++) { const a = Math.random() * TAU, s = (2 + Math.random() * 7) * k; this._p('fuego', x, y, .8 + Math.random() * 1.5, Math.cos(a) * s, Math.sin(a) * s, 2 + Math.random() * 4, .7 + Math.random() * .6, 1.2 + Math.random() * 1.4 * k); }
    this.pedazos(x, y, 16 * k, '#1d2228', 1.4 * k); this.pedazos(x, y, 6 * k, '#4b9aab', 1.2 * k, 'vidrio'); this.chispas(x, y, 22 * k, null, 1.3 * k);
    this.humo(x, y, 10 * k, { negro: true, r: 3 * k, sube: 2.4, vida: 5 + Math.random() * 3, tam: 1.6 * k, retardo: .35 });
    this.resto('quemado', x, y, Math.random() * TAU, { r: 3.5 * k });
    MC.emit('explosion', { x, y, k }); if (MC.Vida) { MC.Vida.impacto(.09 * k); MC.Vida.onomatopeya && MC.Vida.onomatopeya(x, y, '¡BOOM!', '#ff7a1a'); }
  },
  marca(x1, y1, x2, y2, w = .22, a = .55) { if (Math.hypot(x2 - x1, y2 - y1) > 3) return; const m = { x1, y1, x2, y2, w, a, t0: this._t || 0 }; if (this.marcas.length >= this.MAXM) this.marcas[(this._im = ((this._im || 0) + 1) % this.MAXM)] = m; else this.marcas.push(m); },
  resto(t, x, y, a = 0, op = {}) { const r = Object.assign({ t, x, y, a, t0: this._t || 0, s: Math.random() }, op); if (this.restos.length >= this.MAXR) this.restos.shift(); this.restos.push(r);
    if (t === 'hidrante') r.chorro = 9; return r; },
  /* ---------- lo que pasa en el mundo ---------- */
  _choque(C) {
    const k = clamp((C.impacto || Math.abs(C.v) || 4) / 14, .3, 2.2), n = C.normalChoque, L = (C.veh.largo || 4) / 2, a = C.v >= 0 ? C.a : C.a + Math.PI, px = C.x + Math.cos(a) * L * .9, py = C.y + Math.sin(a) * L * .9, dir = n ? Math.atan2(n[1], n[0]) : a + Math.PI;
    if (C.veh.clase === 'pie' || C.veh.clase === 'rueda') return;
    this.chispas(px, py, (10 + 14 * k) | 0, dir, .8 + k * .4);
    if (k > .7) this.pedazos(px, py, (4 * k) | 0, '#9fc4cf', .9, 'vidrio');
    if (k > 1.1) { this.pedazos(px, py, (5 * k) | 0, C.veh.color || '#2b343d', 1); this.humo(px, py, 3, { tam: .6 }); }
  },
  _rompe(ev) {
    const o = ev.o, v = ev.v || 8, d = o.dir || 0, ca = Math.cos(d), sa = Math.sin(d);
    this.resto(o.t, o.x + ca * 1.2, o.y + sa * 1.2, d + (Math.random() - .5) * .8);
    const col = { caneca: '#2f6b45', cono: '#ff6a1a', banca: '#7a5233', valla: '#e8e4d8', hidrante: '#c0392b', paradero: '#9fc4cf', poste: '#6b7078', arbusto: '#3e6b34' }[o.t] || '#6b7078';
    this.pedazos(o.x, o.y, o.t === 'paradero' ? 18 : 8, col, clamp(v / 12, .6, 1.6), o.t === 'paradero' ? 'vidrio' : 'pedazo');
    if (o.t === 'caneca') this.pedazos(o.x, o.y, 10, '#efe9da', .8, 'papel');
    if (o.t === 'poste' || o.t === 'hidrante') this.chispas(o.x, o.y, 14, d, 1);
    if (o.t === 'arbusto') this.pedazos(o.x, o.y, 12, '#4f8a3c', .7, 'hoja');
  },
  /* el jugador: marcas de llanta y humo al derrapar o frenar en seco */
  _jugador(E, dt) {
    const C = E.jugador && E.jugador.cuerpo; if (!C || !C.veh || (C.veh.clase !== 'auto' && C.veh.clase !== 'pesado' && C.veh.clase !== 'moto')) { this._ult = null; return; }
    const der = C.eventos && C.eventos.includes('derrape'), fren = this._vPrev != null && (this._vPrev - Math.abs(C.v)) / Math.max(1e-3, dt) > 7.5 && Math.abs(C.v) > 5; this._vPrev = Math.abs(C.v);
    const L = (C.veh.largo || 4.3) * .32, W = (C.veh.ancho || 1.8) * .42, ca = Math.cos(C.a), sa = Math.sin(C.a), moto = C.veh.clase === 'moto';
    const ruedas = moto ? [[-L, 0]] : [[-L, W], [-L, -W]].concat(der ? [[L, W], [L, -W]] : []), pts = ruedas.map(([u, v]) => [C.x + u * ca - v * sa, C.y + u * sa + v * ca]);
    if ((der || fren) && !C.enAire && !C.nadando) {
      if (this._ult && this._ult.length === pts.length) for (let i = 0; i < pts.length; i++) this.marca(this._ult[i][0], this._ult[i][1], pts[i][0], pts[i][1], moto ? .14 : .2, der ? .5 : .38);
      this._ult = pts; if (Math.random() < (der ? .7 : .35)) { const q = pts[(Math.random() * pts.length) | 0]; this.humo(q[0], q[1], 1, { tam: .5 + Math.min(1, C.deslizamiento || 0), sube: .7, vida: 1.6, z: .3 }); }
    } else this._ult = null;
  },
  actualizar(E) {
    const t = E && E.t != null ? E.t : (MC.ahora ? MC.ahora() / 1000 : 0), dt = this._t == null ? 0 : clamp(t - this._t, 0, .1); this._t = t; if (!dt) return;
    if (E) this._jugador(E, dt);
    for (let i = this.P.length - 1; i >= 0; i--) { const p = this.P[i]; p.t += dt; if (p.t < 0) continue; if (p.t > p.vida) { this.P[i] = this.P[this.P.length - 1]; this.P.pop(); continue; }
      if (p.tipo === 'humo') { p.vx *= 1 - dt * .6; p.vy *= 1 - dt * .6; p.vz *= 1 - dt * .3; p.r += dt * .9; }
      else if (p.tipo === 'fuego') { p.vx *= 1 - dt * 3; p.vy *= 1 - dt * 3; p.vz = p.vz * (1 - dt * 2) + dt * 3; }
      else if (p.tipo === 'flash') { p.r += dt * 40; }
      else { const g = p.tipo === 'papel' || p.tipo === 'hoja' ? 2.5 : 9.8; p.vz -= g * dt; p.rot += p.vr * dt; if (p.tipo === 'papel' || p.tipo === 'hoja') { p.vx += Math.sin(p.t * 3 + p.rot) * dt; p.vx *= 1 - dt; p.vy *= 1 - dt; } }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.z < 0 && p.tipo !== 'humo' && p.tipo !== 'fuego') { p.z = 0; if (p.tipo === 'chispa' || p.tipo === 'agua') p.t = p.vida; else { p.vz = -p.vz * .35; p.vx *= .55; p.vy *= .55; p.vr *= .5; } } }
    for (let i = this.fuegos.length - 1; i >= 0; i--) { const f = this.fuegos[i]; f.t += dt; if (f.sigue) { if (f.sigue.veh && f.sigue.veh.clase === 'pie') f.sigue = null; else { f.x = f.sigue.x; f.y = f.sigue.y; } }   /* si se bajan, el fuego se queda en el carro */
      if (Math.random() < .55) this._p('fuego', f.x + (Math.random() - .5) * 1.4 * f.k, f.y + (Math.random() - .5) * 1.4 * f.k, .7, (Math.random() - .5) * .4, (Math.random() - .5) * .4, 1.2 + Math.random() * 1.5, .45 + Math.random() * .3, .5 + Math.random() * .5 * f.k);
      if (Math.random() < .3) this.humo(f.x, f.y, 1, { negro: true, sube: 2, vida: 3.5, tam: .9 * f.k });
      if (f.t > f.dur) { this.fuegos.splice(i, 1); if (f.estalla) { this.explosion(f.x, f.y, f.k); if (f.alEstallar) f.alEstallar(f); } } }
    for (let i = this.ondas.length - 1; i >= 0; i--) if ((this.ondas[i].t += dt) > .6) this.ondas.splice(i, 1);
    for (const r of this.restos) if (r.chorro > 0) { r.chorro -= dt; if (Math.random() < .8) this.agua(r.x, r.y, 2, 4 + r.chorro * .4); }
    /* lo muy viejo se va: marcas a los 40 s, restos a los 90 s (como en GTA, la calle se limpia sola) */
    while (this.marcas.length && t - this.marcas[0].t0 > 40) this.marcas.shift();
    while (this.restos.length && t - this.restos[0].t0 > 90) this.restos.shift();
  },
  /* ---------- dibujo encima de cualquier vista: pr(x, y, z) → [px, py] o null ---------- */
  dibujar(g, pr, E) {
    this.actualizar(E); if (!this.P.length && !this.marcas.length && !this.restos.length && !this.ondas.length) return;
    const t = this._t || 0, esc = (x, y, z = 0) => { const a = pr(x, y, z), b = pr(x + 1, y, z); return a && b ? Math.max(.4, Math.hypot(b[0] - a[0], b[1] - a[1])) : 0; };
    g.save();
    /* 1. en el piso: marcas de llanta y restos */
    g.lineCap = 'round'; for (const m of this.marcas) { const a = pr(m.x1, m.y1, 0), b = pr(m.x2, m.y2, 0); if (!a || !b) continue; const s = esc(m.x1, m.y1); const f = 1 - (t - m.t0) / 40; g.strokeStyle = 'rgba(18,18,20,' + (m.a * f).toFixed(3) + ')'; g.lineWidth = Math.max(1, m.w * s); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    for (const r of this.restos) this._resto(g, pr, r, esc(r.x, r.y), t);
    /* 2. ondas expansivas */
    for (const o of this.ondas) { const p = pr(o.x, o.y, .2), s = esc(o.x, o.y); if (!p) continue; const k = o.t / .6; g.strokeStyle = 'rgba(255,236,200,' + (.55 * (1 - k)).toFixed(3) + ')'; g.lineWidth = Math.max(1, (1 - k) * 6); g.beginPath(); g.ellipse(p[0], p[1], s * 14 * o.k * k, s * 14 * o.k * k * .62, 0, 0, TAU); g.stroke(); }
    /* 3. partículas (el fuego y el destello se suman como luz) */
    for (const p of this.P) { if (p.t < 0) continue; const q = pr(p.x, p.y, Math.max(0, p.z)); if (!q) continue; const s = esc(p.x, p.y, p.z), k = p.t / p.vida;
      if (p.tipo === 'chispa') { const q2 = pr(p.x - p.vx * .035, p.y - p.vy * .035, Math.max(0, p.z - p.vz * .035)); if (!q2) continue; g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,' + (200 - k * 120 | 0) + ',80,' + (1 - k).toFixed(2) + ')'; g.lineWidth = Math.max(1, s * .06); g.beginPath(); g.moveTo(q2[0], q2[1]); g.lineTo(q[0], q[1]); g.stroke(); g.globalCompositeOperation = 'source-over'; }
      else if (p.tipo === 'fuego') { g.globalCompositeOperation = 'lighter'; const r = Math.max(1.5, p.r * s * (1 - k * .5)), gr = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); gr.addColorStop(0, 'rgba(255,240,180,' + (.9 * (1 - k)).toFixed(2) + ')'); gr.addColorStop(.4, 'rgba(255,140,30,' + (.7 * (1 - k)).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(200,40,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(q[0], q[1], r, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; }
      else if (p.tipo === 'flash') { g.globalCompositeOperation = 'lighter'; const r = p.r * s * .25, gr = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], r); gr.addColorStop(0, 'rgba(255,255,235,' + (1 - k).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(q[0], q[1], r, 0, TAU); g.fill(); g.globalCompositeOperation = 'source-over'; }
      else if (p.tipo === 'humo') { const r = Math.max(2, p.r * s), al = (p.col === '#1d1f23' ? .5 : .32) * (1 - k) * Math.min(1, p.t * 4); g.fillStyle = p.col; g.globalAlpha = al; g.beginPath(); g.arc(q[0], q[1], r, 0, TAU); g.fill(); g.globalAlpha = 1; }
      else if (p.tipo === 'agua') { g.fillStyle = 'rgba(210,235,255,' + (.8 * (1 - k)).toFixed(2) + ')'; g.beginPath(); g.arc(q[0], q[1], Math.max(1, p.r * s), 0, TAU); g.fill(); }
      else { const r = Math.max(1.2, p.r * s); g.save(); g.translate(q[0], q[1]); g.rotate(p.rot); g.globalAlpha = Math.min(1, (1 - k) * 3); g.fillStyle = p.col || '#2b343d'; if (p.tipo === 'vidrio') { g.beginPath(); g.moveTo(-r, 0); g.lineTo(0, -r * .6); g.lineTo(r, r * .3); g.closePath(); g.fill(); } else if (p.tipo === 'papel' || p.tipo === 'hoja') g.fillRect(-r, -r * .6, r * 2, r * 1.2); else g.fillRect(-r, -r * .45, r * 2, r * .9); g.restore(); } }
    g.restore();
  },
  _resto(g, pr, r, s, t) {
    const p = pr(r.x, r.y, 0); if (!p || !s) return; const ca = Math.cos(r.a), sa = Math.sin(r.a), P = (u, v, z = 0) => pr(r.x + u * ca - v * sa, r.y + u * sa + v * ca, z), viejo = clamp(1 - (t - r.t0 - 80) / 10, 0, 1); g.globalAlpha = viejo;
    const linea = (a, b, w, col) => { if (!a || !b) return; g.strokeStyle = col; g.lineWidth = Math.max(1, w * s); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
    const caja = (u, v, L, W, col) => { const q = [P(u - L / 2, v - W / 2), P(u + L / 2, v - W / 2), P(u + L / 2, v + W / 2), P(u - L / 2, v + W / 2)]; if (q.some(x => !x)) return; g.fillStyle = col; g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (const x of q) g.lineTo(x[0], x[1]); g.closePath(); g.fill(); };
    if (r.t === 'quemado') { g.fillStyle = 'rgba(15,12,10,.5)'; g.beginPath(); g.ellipse(p[0], p[1], (r.r || 3) * s, (r.r || 3) * s * .7, r.a, 0, TAU); g.fill(); }
    else if (r.t === 'carro') { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(p[0], p[1], 2.6 * s, 1.4 * s, 0, 0, TAU); g.fill(); caja(0, 0, 4.4, 1.8, '#1b1c1f'); caja(-.3, 0, 2, 1.5, '#2b2623'); }
    else if (r.t === 'poste') { linea(P(0, 0), P(7.2, 0), .2, '#6b7078'); caja(7.4, 0, .7, .32, '#c9cfd6'); }
    else if (r.t === 'caneca') { caja(0, 0, .8, .5, '#2f6b45'); for (let i = 0; i < 5; i++) caja(.6 + h2(i, r.s * 99 | 0, 3) * 1.6, (h2(i, 5, r.s * 99 | 0) - .5) * 1.6, .25, .18, '#efe9da'); }
    else if (r.t === 'banca') { for (let i = 0; i < 3; i++) caja((i - 1) * .7, (h2(i, 2, 7) - .5) * .9, 1.3, .14, '#7a5233'); caja(.1, .3, .9, .1, '#3b3f45'); }
    else if (r.t === 'cono') { const a = P(0, 0), b = P(.7, 0); if (a && b) { g.fillStyle = '#ff6a1a'; g.beginPath(); g.moveTo(b[0], b[1]); const n = [-sa, ca], w = .22 * s; g.lineTo(a[0] + n[0] * w, a[1] + n[1] * w); g.lineTo(a[0] - n[0] * w, a[1] - n[1] * w); g.closePath(); g.fill(); } }
    else if (r.t === 'valla') { caja(0, 0, 2.2, .1, '#e8e4d8'); caja(-.6, 0, .4, .12, '#c0392b'); caja(.6, 0, .4, .12, '#c0392b'); }
    else if (r.t === 'hidrante') { caja(0, 0, .35, .35, '#c0392b'); if (r.chorro > 0) { g.fillStyle = 'rgba(160,200,230,.35)'; g.beginPath(); g.ellipse(p[0], p[1], 2.4 * s, 1.6 * s, 0, 0, TAU); g.fill(); } }
    else if (r.t === 'paradero') { linea(P(-1.5, 0), P(1.5, .3), .12, '#5d636b'); for (let i = 0; i < 9; i++) caja((h2(i, 1, 3) - .5) * 3, (h2(i, 2, 3) - .5) * 2, .2, .14, 'rgba(159,196,207,.8)'); }
    else if (r.t === 'arbusto') { g.fillStyle = 'rgba(62,107,52,.75)'; g.beginPath(); g.ellipse(p[0], p[1], .9 * s, .45 * s, r.a, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
  }
};
MC.on('choque', C => { if (C && C.veh) Efectos._choque(C); });
MC.on('rompe', ev => { if (ev && ev.o) Efectos._rompe(ev); });
MC.Efectos = Efectos;
