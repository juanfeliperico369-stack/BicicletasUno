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
const Vida = {
  MAX: 260, P: [], aves: [], onos: [], _t: null, _pv: null,
  /* partículas: polvo, agua, hoja o chispa en metros del mundo (z = altura) */
  emitir(tipo, x, y, n = 6, op = {}) {
    for (let i = 0; i < n; i++) {
      if (this.P.length >= this.MAX) this.P.shift(); const a = Math.random() * TAU, s = (op.vel ?? 1.5) * (.4 + Math.random() * .8);
      this.P.push({ tipo, x: x + (Math.random() - .5) * (op.r ?? .6), y: y + (Math.random() - .5) * (op.r ?? .6), z: op.z ?? .1, vx: Math.cos(a) * s + (op.vx || 0), vy: Math.sin(a) * s + (op.vy || 0), vz: (op.vz ?? 1.2) * (.5 + Math.random()), t: 0, vida: op.vida ?? (tipo === 'hoja' ? 4 : tipo === 'agua' ? .7 : 1.1), r: op.tam ?? (tipo === 'polvo' ? .35 : .12), fase: Math.random() * TAU });
    }
  },
  onomatopeya(x, y, texto, color = '#ffd400') { if (this.onos.length > 6) this.onos.shift(); this.onos.push({ x, y, texto, color, t: 0 }); },
  /* lo que pasa con el jugador: aterrizajes, frenazos, agua y choques */
  _jugador(E, dt) {
    const C = E.jugador && E.jugador.cuerpo; if (!C) return; const pv = this._pv || (this._pv = { aire: !!C.enAire, vz: 0, v: C.v || 0, agua: 0 });
    const acel = dt > 0 ? ((C.v || 0) - pv.v) / dt : 0; C._acel = (C._acel || 0) * .8 + acel * .2;
    if (pv.aire && !C.enAire && pv.vz < -2.2) {   // aterrizó: aplasta, sacude y levanta polvo según la caída
      const f = clamp((-pv.vz - 2.2) / 8, .15, 1); C._squash = { t0: E.t || 0, k: f }; this.emitir(C.nadando ? 'agua' : 'polvo', C.x, C.y, 6 + (f * 10 | 0), { vel: 1.5 + f * 2.5, vz: .6 }); if (E.camara && E.camara.sacudir) E.camara.sacudir(.12 + f * .3); if (f > .4) this.onomatopeya(C.x, C.y, '¡TUM!'); MC.emit('aterriza', { fuerza: f });
    }
    if (!C.enAire && !C.nadando && Math.abs(C._acel) > 6 && Math.abs(C.v) > 2.5 && Math.random() < .5) { const b = Math.sign(C.v) * -1; this.emitir('polvo', C.x + Math.cos(C.a) * b * .8, C.y + Math.sin(C.a) * b * .8, 1, { vel: .6, vz: .4 }); }   // frenazo o arrancón
    if ((C.nadando || C.vadeando) && Math.abs(C.v) > .6) { pv.agua -= dt; if (pv.agua <= 0) { pv.agua = .12; this.emitir('agua', C.x, C.y, 3, { vel: 1.2, vz: 1.8 }); } }
    pv.aire = !!C.enAire; pv.vz = C.vz || 0; pv.v = C.v || 0;
  },
  /* bandadas: unas pocas, siempre cerca de la cámara (garzas y palomas sobre el pueblo) */
  _aves(E, dt) {
    const Cm = E.camara; if (!Cm) return; const R = 260;
    while (this.aves.length < 3) { const a = Math.random() * TAU, n = 4 + (Math.random() * 6 | 0), cx = Cm.x - Math.cos(a) * R, cy = Cm.y - Math.sin(a) * R, rumbo = a + (Math.random() - .5) * .6, b = { x: cx, y: cy, z: 22 + Math.random() * 25, a: rumbo, v: 7 + Math.random() * 4, n, garza: Math.random() < .35, m: [] }; for (let i = 0; i < n; i++) b.m.push([(-Math.floor((i + 1) / 2)) * 2.2, (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 1.7, Math.random() * TAU]); this.aves.push(b); }
    for (let i = this.aves.length - 1; i >= 0; i--) { const b = this.aves[i]; b.a += Math.sin((E.t || 0) * .3 + i) * .05 * dt; b.x += Math.cos(b.a) * b.v * dt; b.y += Math.sin(b.a) * b.v * dt; if (Math.hypot(b.x - Cm.x, b.y - Cm.y) > R * 1.3) this.aves.splice(i, 1); }
  },
  _hojas(E, dt) {
    const C = E.jugador && E.jugador.cuerpo; if (!C || !MC.Arboleda || Math.random() > dt * 1.2) return; const L = MC.Arboleda.en(E.mundo, C.x - 25, C.y - 25, C.x + 25, C.y + 25, 30); if (!L.length) return;
    const t = L[(Math.random() * L.length) | 0]; this.emitir('hoja', t.x + (Math.random() - .5) * t.r, t.y + (Math.random() - .5) * t.r, 1, { z: t.h * .7, vel: .4, vz: 0, vida: 5, tam: .14 });
  },
  actualizar(E) {
    const t = E.t || 0, dt = this._t == null ? 0 : clamp(t - this._t, 0, .1); this._t = t; if (!dt) return;
    this._jugador(E, dt); this._aves(E, dt); this._hojas(E, dt);
    for (let i = this.P.length - 1; i >= 0; i--) { const p = this.P[i]; p.t += dt; if (p.t > p.vida) { this.P.splice(i, 1); continue; }
      if (p.tipo === 'hoja') { p.vz = -.7; p.vx = Math.sin(p.t * 2.3 + p.fase) * .9; p.vy = Math.cos(p.t * 1.7 + p.fase) * .4; } else { p.vz -= 9.8 * dt * (p.tipo === 'polvo' ? .15 : 1); p.vx *= 1 - dt * 2; p.vy *= 1 - dt * 2; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z = Math.max(0, p.z + p.vz * dt); if (p.z === 0 && p.tipo === 'hoja') { p.vx = p.vy = 0; } }
    for (let i = this.onos.length - 1; i >= 0; i--) if ((this.onos[i].t += dt) > .8) this.onos.splice(i, 1);
  },
  dibujar(D) {
    const { g, pr, z, P, E, modo } = D; this.actualizar(E); const cen = modo === 'cenital', noche = D.noche || 0;
    /* partículas */
    for (const p of this.P) { const [x, y] = pr(p.x, p.y, p.z), k = 1 - p.t / p.vida, r = Math.max(.8, p.r * z * (p.tipo === 'polvo' ? 1 + p.t * 1.6 : 1));
      if (p.tipo === 'polvo') g.fillStyle = 'rgba(150,130,100,' + (.32 * k).toFixed(3) + ')'; else if (p.tipo === 'agua') g.fillStyle = 'rgba(225,240,255,' + (.75 * k).toFixed(3) + ')'; else if (p.tipo === 'hoja') g.fillStyle = noche > .4 ? '#3d4a2a' : (p.fase > 3 ? '#8a9a3a' : '#c4a23a'); else g.fillStyle = 'rgba(255,220,120,' + k.toFixed(3) + ')';
      g.beginPath(); if (p.tipo === 'hoja') g.ellipse(x, y, r * 1.4, r * .7, p.fase + p.t * 3, 0, TAU); else g.arc(x, y, r, 0, TAU); g.fill(); }
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
