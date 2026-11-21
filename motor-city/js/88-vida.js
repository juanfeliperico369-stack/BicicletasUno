/* =====================================================================
   VIDA · peso y vida en el mundo (2.7)
   Lo que aprendieron los juegos que «se sienten bien» (Vlambeer, «The Art of Screenshake»; los 12 principios de la
   animación de Disney; Spider‑Verse con su animación a dos cuadros y sus onomatopeyas), puesto en el motor, barato:
   - PESO: al aterrizar, el cuerpo se aplasta y se estira (squash and stretch), la cámara se sacude según la caída
     y salta polvo. Al frenar o acelerar fuerte, el vehículo cabecea y levanta polvo. En un choque, el mundo se
     congela 60 ms (hitstop: el golpe «pesa») y suena la onomatopeya en los estilos dibujados («¡PUM!»).
   - VIDA: bandadas de pájaros con su sombra en el piso, hojas que caen de los árboles cercanos, salpicaduras en el
     agua y polvo en la tierra. Todo en un fondo común de 260 partículas, sin crear objetos por cuadro.
   Lo llama MC.Vista2D al final de cada dibujo: MC.Vida.dibujar(D). Se apaga con op.vida = false.
   ===================================================================== */
/* 2.8 · de la entrega maestra de referencias (docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md):
   - FAUNA QUE REACCIONA (R12, la playa en Godot): palomas en el piso que comen y alzan vuelo cuando el jugador se
     acerca rápido; se vuelven una bandada que se aleja.
   - HUELLAS QUE QUEDAN (R12 y R19, arena y nieve): surcos de las llantas y pisadas en arena, tierra, nieve y barro
     (pasto mojado cuando llueve). Duran unos minutos y se desvanecen; son marcas, no deformación de la malla (§16.5).
   - ACCESIBILIDAD (§10.3 y §13): MC.opciones.particulas (0 a 1) baja el polvo, el agua y las hojas. */
const Vida = {
  MAX: 260, P: [], aves: [], onos: [], palomas: [], marcas: [], MAXM: 700, _t: null, _pv: null,
  _banco: null, _libres: null, _nAct: 0, _evict: 0, _stats: { creados: 0, reciclados: 0, descartados: 0, pico: 0 },
  /* 4.2 · pool circular sin basura en memoria (técnica Burnout 3 / RenderWare: 0 objetos nuevos por cuadro, O(1) sin shift ni splice) */
  _asegurarPool() {
    if (!this._banco) {
      this._banco = new Array(this.MAX); this._libres = new Array(this.MAX);
      for (let i = 0; i < this.MAX; i++) {
        const p = { tipo: '', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, vida: 1, r: .1, fase: 0 };
        this._banco[i] = p; this._libres[i] = p;
      }
      this._stats.creados = this.MAX; this._nAct = 0; this._evict = 0;
    } else if (this.P.length < this._nAct || this._banco.length < this.MAX) {
      if (this._banco.length < this.MAX) {
        for (let i = this._banco.length; i < this.MAX; i++) {
          const p = { tipo: '', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, vida: 1, r: .1, fase: 0 };
          this._banco.push(p); this._stats.creados++;
        }
      }
      const vivas = new Set(this.P); this._libres.length = 0;
      for (let i = 0; i < this._banco.length; i++) if (!vivas.has(this._banco[i])) this._libres.push(this._banco[i]);
      this._nAct = this.P.length; if (this._evict >= Math.max(1, this.P.length)) this._evict = 0;
    }
  },
  poolDiagnostico() {
    this._asegurarPool();
    return { capacidad: this.MAX, activas: this.P.length, libres: this._libres.length, creados: this._stats.creados, reciclados: this._stats.reciclados, descartados: this._stats.descartados, pico: this._stats.pico };
  },
  /* partículas: polvo, agua, hoja o chispa en metros del mundo (z = altura); O(1) sin crear objetos por cuadro */
  emitir(tipo, x, y, n = 6, op = {}) {
    n = Math.round(n * (MC.opciones ? MC.opciones.particulas ?? 1 : 1)); if (n <= 0) return;
    this._asegurarPool();
    for (let i = 0; i < n; i++) {
      let p;
      if (this.P.length >= this.MAX) {
        p = this.P[this._evict % this.P.length];
        this._evict = (this._evict + 1) % this.P.length;
        this._stats.descartados++;
      } else {
        p = this._libres.pop();
        if (!p) { p = { tipo: '', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, vida: 1, r: .1, fase: 0 }; this._banco.push(p); this._stats.creados++; }
        this.P.push(p);
      }
      const a = Math.random() * TAU, s = (op.vel ?? 1.5) * (.4 + Math.random() * .8);
      p.tipo = tipo; p.x = x + (Math.random() - .5) * (op.r ?? .6); p.y = y + (Math.random() - .5) * (op.r ?? .6); p.z = op.z ?? .1;
      p.vx = Math.cos(a) * s + (op.vx || 0); p.vy = Math.sin(a) * s + (op.vy || 0); p.vz = (op.vz ?? 1.2) * (.5 + Math.random());
      p.t = 0; p.vida = op.vida ?? (tipo === 'hoja' ? 4 : tipo === 'agua' ? .7 : 1.1); p.r = op.tam ?? (tipo === 'polvo' ? .35 : .12); p.fase = Math.random() * TAU;
      this._stats.reciclados++;
    }
    this._nAct = this.P.length; if (this.P.length > this._stats.pico) this._stats.pico = this.P.length;
  },
  onomatopeya(x, y, texto, color = '#ffd400') { if (this.onos.length > 6) this.onos.shift(); this.onos.push({ x, y, texto, color, t: 0 }); },
  /* lo que pasa con el jugador: aterrizajes, frenazos, agua y choques */
  _jugador(E, dt) {
    const C = E.jugador && E.jugador.cuerpo; if (!C) return; if (this._cuerpo !== C) { this._cuerpo = C; this._pv = null; } const pv = this._pv || (this._pv = { aire: !!C.enAire, vz: 0, v: C.v || 0, agua: 0 });
    const acel = dt > 0 ? ((C.v || 0) - pv.v) / dt : 0; C._acel = (C._acel || 0) * .8 + acel * .2;
    if (pv.aire && !C.enAire && pv.vz < -2.2) {   // aterrizó: aplasta, sacude y levanta polvo según la caída
      const f = clamp((-pv.vz - 2.2) / 8, .15, 1); C._squash = { t0: E.t || 0, k: f }; this.emitir(C.nadando ? 'agua' : 'polvo', C.x, C.y, 6 + (f * 10 | 0), { vel: 1.5 + f * 2.5, vz: .6 }); if (E.camara && E.camara.sacudir) E.camara.sacudir(.12 + f * .3); if (f > .4) this.onomatopeya(C.x, C.y, '¡TUM!'); MC.emit('aterriza', { fuerza: f });
    }
    if (!C.enAire && !C.nadando && Math.abs(C._acel) > 6 && Math.abs(C.v) > 2.5 && Math.random() < .5) { const b = Math.sign(C.v) * -1; this.emitir('polvo', C.x + Math.cos(C.a) * b * .8, C.y + Math.sin(C.a) * b * .8, 1, { vel: .6, vz: .4 }); }   // frenazo o arrancón
    if ((C.nadando || C.vadeando) && Math.abs(C.v) > .6) { pv.agua -= dt; if (pv.agua <= 0) { pv.agua = .12; this.emitir('agua', C.x, C.y, 3, { vel: 1.2, vz: 1.8 }); } }
    pv.aire = !!C.enAire; pv.vz = C.vz || 0; pv.v = C.v || 0;
    this._huellas(E, C);
  },
  /* el suelo blando guarda la marca: arena, tierra del monte, nieve, y el pasto o la tierra cuando llueve (barro) */
  suelo(E, x, y) {
    const M = E.mundo; if (!M || !M.suelo) return null; const tt = M.suelo(x, y), llueve = E.clima && /lluvia|tormenta|aguacero/.test(String(E.clima.estado || ''));
    return tt === TT.ARENA ? 'arena' : tt === TT.NIEVE ? 'nieve' : tt === TT.MOUNT ? (llueve ? 'barro' : 'tierra') : tt === TT.GRASS && llueve ? 'barro' : null;
  },
  _huellas(E, C) {
    if (C.enAire || C.nadando || C.vadeando) { C._uh = null; return; } const s = this.suelo(E, C.x, C.y); if (!s) { C._uh = null; return; }
    const u = C._uh; if (u && Math.hypot(C.x - u.x, C.y - u.y) < .55) return; C._uh = { x: C.x, y: C.y };
    const V = C.veh || {}, pie = V.clase === 'pie' || !V.clase, nx = -Math.sin(C.a), ny = Math.cos(C.a), t = E.t || 0;
    if (pie) { const lado = (this._paso = !this._paso) ? 1 : -1; this.marcas.push({ x: C.x + nx * .14 * lado, y: C.y + ny * .14 * lado, a: C.a, w: .12, l: .26, s, t, pie: true }); }
    else if (u) { const w = Math.max(.12, (V.ancho || .6) * .18), off = (V.ancho || .6) * .38, dos = V.clase !== 'rueda' && V.clase !== 'moto'; for (const k of dos ? [-1, 1] : [0]) this.marcas.push({ x0: u.x + nx * off * k, y0: u.y + ny * off * k, x1: C.x + nx * off * k, y1: C.y + ny * off * k, w, s, t }); }
    if (this.marcas.length > this.MAXM) this.marcas.splice(0, this.marcas.length - this.MAXM);
  },
  /* las huellas en el piso, antes de los objetos (las llama MC.Vista2D) */
  piso(D) {
    const { g, pr, z, E } = D; if (!this.marcas.length || z < .9) return; const t = E.t || 0, COL = { arena: '92,70,40', tierra: '58,42,26', barro: '44,30,18', nieve: '120,135,165' };
    let viejas = 0; while (viejas < this.marcas.length && t - this.marcas[viejas].t > 240) viejas++; if (viejas) this.marcas.splice(0, viejas);
    /* en lote: un trazo por suelo y por edad (4 tramos), no uno por huella: cientos de huellas cuestan como 16 */
    const G = new Map(); for (const m of this.marcas) { const k = m.s + ((t - m.t) / 60 | 0) + (m.pie ? 'p' : 'l'); let L = G.get(k); if (!L) G.set(k, L = []); L.push(m); }
    g.save(); g.lineCap = 'round';
    for (const L of G.values()) { const m0 = L[0], a = (m0.s === 'nieve' ? .5 : .32) * clamp(1 - (t - m0.t) / 240, 0, 1), col = 'rgba(' + COL[m0.s] + ',' + a.toFixed(3) + ')'; g.beginPath();
      if (m0.pie) { for (const m of L) { const [x, y] = pr(m.x, m.y, 0), rx = Math.max(.6, m.l * z * .5); g.moveTo(x + rx, y); g.ellipse(x, y, rx, Math.max(.5, m.w * z * .5 * (D.P.k || 1)), m.a + (D.P.yaw || 0), 0, TAU); } g.fillStyle = col; g.fill(); }
      else { for (const m of L) { const [x0, y0] = pr(m.x0, m.y0, 0), [x1, y1] = pr(m.x1, m.y1, 0); g.moveTo(x0, y0); g.lineTo(x1, y1); } g.strokeStyle = col; g.lineWidth = Math.max(1, m0.w * z); g.stroke(); } }
    g.restore();
  },
  /* palomas en el piso cerca del jugador; alzan vuelo si se acerca rápido */
  _palomas(E, dt) {
    const C = E.jugador && E.jugador.cuerpo, M = E.mundo; if (!C || !M || !M.suelo) return; const t = E.t || 0;
    if (this.palomas.length < 3 && Math.random() < dt * .5) { const a = Math.random() * TAU, d = 35 + Math.random() * 30, x = C.x + Math.cos(a) * d, y = C.y + Math.sin(a) * d, tt = M.suelo(x, y);
      if ((tt === TT.PLAZA || tt === TT.WALK || tt === TT.GRASS || tt === TT.BRICK) && !(M.edificioEn && M.edificioEn(x, y, 1))) { const n = 4 + (Math.random() * 6 | 0), m = []; for (let i = 0; i < n; i++) m.push({ dx: (Math.random() - .5) * 4, dy: (Math.random() - .5) * 4, a: Math.random() * TAU, f: Math.random() * TAU }); this.palomas.push({ x, y, m, t0: t }); } }
    for (let i = this.palomas.length - 1; i >= 0; i--) { const p = this.palomas[i], d = Math.hypot(C.x - p.x, C.y - p.y), v = Math.abs(C.v || 0);
      if (d > 110) { this.palomas.splice(i, 1); continue; }
      if (d < 5 + v * .7 && (v > 1.2 || d < 2.5)) {   // ¡se asustan! la bandada sale en contra del jugador
        const a = Math.atan2(p.y - C.y, p.x - C.x) + (Math.random() - .5) * .6, b = { x: p.x, y: p.y, z: 1, sube: true, asustada: true, a, v: 9 + Math.random() * 3, n: p.m.length, garza: false, m: p.m.map((q, k) => [q.dx, q.dy, q.f]) };
        this.aves.push(b); this.palomas.splice(i, 1); this.emitir('pluma', p.x, p.y, 3, { vel: 1.2, vz: 1.5, tam: .1, vida: 1.6 }); MC.emit('fauna', { tipo: 'palomas', x: p.x, y: p.y }); continue; }
      for (const q of p.m) { q.a += (Math.random() - .5) * dt * 2; if (Math.random() < dt * .4) { q.dx += Math.cos(q.a) * .3; q.dy += Math.sin(q.a) * .3; } }
    }
  },
  /* bandadas: unas pocas, siempre cerca de la cámara (garzas y palomas sobre el pueblo) */
  _aves(E, dt) {
    const Cm = E.camara; if (!Cm) return; const R = 260;
    while (this.aves.filter(b => b.n > 0 && !b.asustada).length < 3 && this.aves.length < 8) { const a = Math.random() * TAU, n = 4 + (Math.random() * 6 | 0), cx = Cm.x - Math.cos(a) * R, cy = Cm.y - Math.sin(a) * R, rumbo = a + (Math.random() - .5) * .6, b = { x: cx, y: cy, z: 22 + Math.random() * 25, a: rumbo, v: 7 + Math.random() * 4, n, garza: Math.random() < .35, m: [] }; for (let i = 0; i < n; i++) b.m.push([(-Math.floor((i + 1) / 2)) * 2.2, (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 1.7, Math.random() * TAU]); this.aves.push(b); }
    for (let i = this.aves.length - 1; i >= 0; i--) { const b = this.aves[i]; if (b.sube) { b.z = Math.min(18, b.z + dt * 7); if (b.z >= 18) b.sube = false; } b.a += Math.sin((E.t || 0) * .3 + i) * .05 * dt; b.x += Math.cos(b.a) * b.v * dt; b.y += Math.sin(b.a) * b.v * dt; if (Math.hypot(b.x - Cm.x, b.y - Cm.y) > R * 1.3) this.aves.splice(i, 1); }
  },
  _hojas(E, dt) {
    const C = E.jugador && E.jugador.cuerpo; if (!C || !MC.Arboleda || Math.random() > dt * 1.2) return; const L = MC.Arboleda.en(E.mundo, C.x - 25, C.y - 25, C.x + 25, C.y + 25, 30); if (!L.length) return;
    const t = L[(Math.random() * L.length) | 0]; this.emitir('hoja', t.x + (Math.random() - .5) * t.r, t.y + (Math.random() - .5) * t.r, 1, { z: t.h * .7, vel: .4, vz: 0, vida: 5, tam: .14 });
  },
  actualizar(E) {
    const t = E.t || 0, dt = this._t == null ? 0 : clamp(t - this._t, 0, .1); this._t = t; if (!dt) return;
    this._jugador(E, dt); this._aves(E, dt); this._hojas(E, dt); this._palomas(E, dt);
    if (this._banco && this.P.length < this._nAct) this._asegurarPool();
    for (let i = this.P.length - 1; i >= 0; i--) { const p = this.P[i]; p.t += dt; if (p.t > p.vida) { const ult = this.P.pop(); if (i < this.P.length) this.P[i] = ult; if (this._libres && this._libres.length < this.MAX) this._libres.push(p); continue; }
      if (p.tipo === 'hoja' || p.tipo === 'pluma') { p.vz = p.t < .3 && p.tipo === 'pluma' ? .5 : -.7; p.vx = Math.sin(p.t * 2.3 + p.fase) * .9; p.vy = Math.cos(p.t * 1.7 + p.fase) * .4; } else { p.vz -= 9.8 * dt * (p.tipo === 'polvo' ? .15 : 1); p.vx *= 1 - dt * 2; p.vy *= 1 - dt * 2; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z = Math.max(0, p.z + p.vz * dt); if (p.z === 0 && p.tipo === 'hoja') { p.vx = p.vy = 0; } }
    this._nAct = this.P.length;
    for (let i = this.onos.length - 1; i >= 0; i--) if ((this.onos[i].t += dt) > .8) this.onos.splice(i, 1);
  },
  dibujar(D) {
    const { g, pr, z, P, E, modo } = D; this.actualizar(E); const cen = modo === 'cenital', noche = D.noche || 0;
    /* partículas */
    for (const p of this.P) { const [x, y] = pr(p.x, p.y, p.z), k = 1 - p.t / p.vida, r = Math.max(.8, p.r * z * (p.tipo === 'polvo' ? 1 + p.t * 1.6 : 1));
      if (p.tipo === 'polvo') g.fillStyle = 'rgba(150,130,100,' + (.32 * k).toFixed(3) + ')'; else if (p.tipo === 'agua') g.fillStyle = 'rgba(225,240,255,' + (.75 * k).toFixed(3) + ')'; else if (p.tipo === 'hoja') g.fillStyle = noche > .4 ? '#3d4a2a' : (p.fase > 3 ? '#8a9a3a' : '#c4a23a'); else if (p.tipo === 'pluma') g.fillStyle = 'rgba(200,204,212,' + k.toFixed(3) + ')'; else g.fillStyle = 'rgba(255,220,120,' + k.toFixed(3) + ')';
      g.beginPath(); if (p.tipo === 'hoja' || p.tipo === 'pluma') g.ellipse(x, y, r * 1.4, r * .7, p.fase + p.t * 3, 0, TAU); else g.arc(x, y, r, 0, TAU); g.fill(); }
    /* palomas comiendo en el piso: cabecean (a dos cuadros) */
    if (z > 1.2) for (const p of this.palomas) for (const q of p.m) { const [x, y] = pr(p.x + q.dx, p.y + q.dy, 0), s = Math.max(1.6, z * .16), pico = Math.floor((E.t || 0) * 6 + q.f * 3) % 4 === 0 ? s * .5 : 0;
      g.fillStyle = 'rgba(10,14,26,.18)'; g.beginPath(); g.ellipse(x, y + s * .3, s * 1.1, s * .45, 0, 0, TAU); g.fill(); g.fillStyle = noche > .4 ? '#2a2d36' : '#8a8f9a'; g.beginPath(); g.ellipse(x, y - s * .4, s * 1.1, s * .7, q.a, 0, TAU); g.fill(); g.fillStyle = noche > .4 ? '#3a3e48' : '#6b7280'; g.beginPath(); g.arc(x + Math.cos(q.a) * s * .9, y - s * .6 + pico, s * .45, 0, TAU); g.fill(); }
    /* pájaros: su sombra en el piso (si hay sol) y el ave aleteando a dos cuadros (como Spider‑Verse) */
    if (z > .5) { const sv = D.sv, t2 = Math.floor((E.t || 0) * 12) / 12;
      for (const b of this.aves) for (const [dx, dy, fa] of b.m) {
        const ca = Math.cos(b.a), sa = Math.sin(b.a), wx = b.x + dx * ca - dy * sa, wy = b.y + dx * sa + dy * ca, ala = Math.sin(t2 * 11 + fa) * (b.garza ? .5 : .8), s = Math.max(2.2, z * (b.garza ? 1.1 : .55));
        if (sv && !noche) { const [sx, sy] = pr(wx + sv.dx / sv.L * b.z * .4, wy + sv.dy / sv.L * b.z * .4, 0); g.fillStyle = 'rgba(10,14,30,.12)'; g.beginPath(); g.ellipse(sx, sy, s * .9, s * .35, 0, 0, TAU); g.fill(); }
        const [x, y] = pr(wx, wy, cen ? 0 : b.z); const ang = Math.atan2(pr(wx + ca, wy + sa, 0)[1] - pr(wx, wy, 0)[1], pr(wx + ca, wy + sa, 0)[0] - pr(wx, wy, 0)[0]);
        g.save(); g.translate(x, y - (cen ? 0 : 0)); g.rotate(ang + Math.PI / 2); g.strokeStyle = noche > .4 ? 'rgba(20,24,40,.8)' : b.garza ? '#f4f1e8' : '#3b3b42'; g.lineWidth = Math.max(1, s * .22); g.lineCap = 'round'; g.beginPath(); g.moveTo(-s, -ala * s); g.quadraticCurveTo(-s * .4, -s * .2, 0, 0); g.quadraticCurveTo(s * .4, -s * .2, s, -ala * s); g.stroke(); g.restore();
      } }
    /* onomatopeyas (cómic, manga, novela): letras gordas con contorno, que saltan y se van */
    const ES = MC.Estilo && MC.Estilo.p; if (ES && ES.onomatopeyas) for (const o of this.onos) { const [x, y] = pr(o.x, o.y, 2.2), k = o.t / .8, s = Math.max(16, Math.min(46, z * 2.2)) * (k < .15 ? .6 + k * 3 : 1);
      g.save(); g.translate(x + 18, y - 22 - k * 20); g.rotate(-.12); g.globalAlpha = 1 - Math.max(0, k - .6) * 2.5; g.font = '900 ' + s + 'px "Impact", "Arial Black", system-ui'; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = s * .22; g.strokeStyle = '#111'; g.strokeText(o.texto, 0, 0); g.fillStyle = MC.estilo === 'manga' || MC.estilo === 'novela' ? '#fff' : o.color; g.fillText(o.texto, 0, 0); g.restore(); }
  },
  /* hitstop: el mundo se congela un instante para que el golpe pese (lo respeta MC.Bucle) */
  impacto(s = .06) { MC._pausaImpacto = Math.max(MC._pausaImpacto || 0, s); }
};
MC.on('choque', C => { if (!C) return; Vida.impacto(.06); Vida.emitir('polvo', C.x, C.y, 10, { vel: 3, vz: .8 }); Vida.onomatopeya(C.x, C.y, ['¡PUM!', '¡CRASH!', '¡BAM!'][(Math.random() * 3) | 0], '#ff5a3c'); });
MC.Vida = Vida;
