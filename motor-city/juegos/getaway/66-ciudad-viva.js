/* =====================================================================
   TURNO CERO · 5.2 · LA CIUDAD VIVA Y EL DESPACHO (fase 2 del plan 5.0)
   Lo que hace el jugador se oye en la calle (MC.CiudadViva):
   - los choques fuertes, los derrapes, los atropellos, los disparos, las explosiones y las sirenas son EVENTOS; la gente que
     los oye mira, huye, llama por celular o se acerca a ayudar, y algunos lo comentan (frases del tono 18+ y las de todos);
   - en las bancas y los paraderos del mobiliario real hay gente sentada o esperando, según la hora y la lluvia;
   - un TESTIGO que llama por un atropello, un disparo o una explosión sube la búsqueda («un vecino llamó a la policía») y
     pide el servicio: 🚑 una ambulancia (atiende a los caídos y se los lleva) o 🚒 los bomberos (a un carro en llamas). Los
     servicios salen a 300 m, llegan por las calles reales (MC.Manejo.rutaA) con la sirena, atienden y se van;
   - lo que dice la gente sale en un globo sobre su cabeza; quien llama lleva 📞 y quien mira, ❗ (como en las historietas).
   Nada de esto pasa en un capítulo de la historia con escena ni en el menú (G.pausa).
   ===================================================================== */
const Viva = {
  servicios: [], _esc: [], _eT: 0, _sirT: 0, _chT: -9, _deT: -9,
  paso(dt) {
    const CV = MC.CiudadViva, C = G.cuerpo, M = G.M, E = G.E; if (!CV || !M || !C || !E || G.pausa || dt <= 0) return;
    CV.tono = 'adulto'; if (this._M !== M) { this._M = M; this.servicios.length = 0; this._esc = []; CV.reiniciar(); }   /* otra ciudad: todo de cero */
    /* las escenas de la calle (cada medio segundo se revisan alrededor del jugador) */
    if ((this._eT -= dt) <= 0) { this._eT = .5; this._esc = M.esCiudad ? CV.escenas(M, C.x, C.y, { reloj: G.reloj, lluvia: (G.clima && G.clima.lluvia) > .35, max: 22 }) : []; }
    const esc = this._esc.filter(p => !p._caido); E.peatones = (E.peatones || []).concat(esc);
    /* a los de las escenas también se los puede atropellar (los de las rutinas ya los revisa atropellos()) */
    if (C.veh.clase !== 'pie' && Math.abs(C.v) > 4) for (const p of esc) if (!p._caido && Math.hypot(p.x - C.x, p.y - C.y) < (C.veh.ancho || 1.8) / 2 + .5) atropello(p);
    /* lo que hace el jugador */
    if (C.eventos.includes('derrape') && Math.abs(C.v) > 11 && G.t - this._deT > 3) { this._deT = G.t; CV.emitir('derrape', C.x, C.y); }
    /* las sirenas que pasan (policía y servicios) */
    if ((this._sirT -= dt) <= 0) { this._sirT = 1.6; for (const v of E.trafico || []) if (v.sirena && Math.hypot(v.x - C.x, v.y - C.y) < 150) { CV.emitir('sirena', v.x, v.y, { quien: 'servicio' }); break; } }
    CV.paso(E.peatones, { dt, reloj: G.reloj, lluvia: (G.clima && G.clima.lluvia) > .35, mundo: M, cerca: { x: C.x, y: C.y, v: Math.abs(C.v) }, tono: 'adulto' });
    this.pasoServicios(dt);
  },
  /* 🚑 / 🚒 · salen a ~300 m por una vía de carro, llegan por la ruta real, atienden y se van */
  despachar(tipo, x, y) {
    const M = G.M; if (!M || this.servicios.length >= 2 || this.servicios.some(s => s.tipo === tipo && Math.hypot(s.dx - x, s.dy - y) < 80)) return null;
    let ini = null; for (let k = 0; k < 12 && !ini; k++) { const a = (k / 12) * TAU + Math.random() * .5, R = 260 + Math.random() * 120; ini = M.viaCercana(x + Math.cos(a) * R, y + Math.sin(a) * R, 140, deCarro); }
    if (!ini) return null; const r = MC.Manejo.rutaA(M, { x: ini.x, y: ini.y, a: 0 }, { x, y }, 'rueda'); if (!Array.isArray(r) || r.length < 4) return null;
    const T = new MC.Trazo(r), s = { tipo, T, s: 0, v: 0, fase: 'va', t: 0, dx: x, dy: y, x: ini.x, y: ini.y, a: 0 };
    this.servicios.push(s); G.ui.aviso(tipo === 'ambulancia' ? '🚑 Alguien llamó una ambulancia' : '🚒 Vienen los bomberos', 2400, 'servicio'); MC.emit('despacho', { tipo, x, y }); return s;
  },
  pasoServicios(dt) {
    const C = G.cuerpo;
    for (let i = this.servicios.length - 1; i >= 0; i--) { const s = this.servicios[i];
      if (s.fase === 'va') { s.v = Math.min(15, s.v + 4 * dt); s.s += s.v * dt; if (s.s >= s.T.largo - 7) { s.s = s.T.largo - 7; s.fase = 'atiende'; s.t = 0; s.v = 0; MC.CiudadViva.emitir('servicio', s.x, s.y, { quien: 'servicio' }); } }
      else if (s.fase === 'atiende') { s.t += dt; if (s.t > 11) { s.fase = 'sale';
          if (s.tipo === 'ambulancia') { const n0 = G.caidos.length; G.caidos = G.caidos.filter(c => Math.hypot(c.x - s.dx, c.y - s.dy) > 25); if (G.caidos.length < n0) G.ui.aviso('🚑 Se llevaron a los heridos', 1800, 'servicio'); } } }
      else { s.v = Math.min(14, s.v + 3 * dt); s.s -= s.v * dt; if (s.s <= 0 || Math.hypot(s.x - C.x, s.y - C.y) > 320) { this.servicios.splice(i, 1); continue; } }
      const q = s.T.at(s.s, 1.4); s.x = q.x; s.y = q.y; s.a = q.a + (s.fase === 'sale' ? Math.PI : 0);
    }
  },
  /* cómo se ven en el mundo (entran a E.trafico: los modelos, la sirena con su destello y su sonido) */
  trafico() { return this.servicios.map(s => ({ x: s.x, y: s.y, a: s.a, v: s.v, tipo: 'buseta', modelo: 'vehiculo_van', largo: 5.4, ancho: 2.05, color: s.tipo === 'ambulancia' ? '#f2f2f2' : '#c62828', tinteFijo: s.tipo === 'ambulancia' ? '#f2f2f2' : '#c62828', sirena: s.fase !== 'sale', servicio: s.tipo, frena: s.fase === 'atiende' ? 1 : 0 })); },
  obstaculos() { return this.servicios.map(s => ({ x: s.x, y: s.y, r: 1.5, motivo: s.tipo === 'ambulancia' ? 'una ambulancia' : 'los bomberos' })); },
  /* los globos: lo que dice la gente, y 📞 / ❗ sobre quien llama o mira */
  capa(g, pr, d = 1) {
    const CV = MC.CiudadViva, C = G.cuerpo; if (!CV || !C) return; let n = 0;
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; const fuera = q => !q || q[0] < -40 || q[0] > G.W + 40 || q[1] < -40 || q[1] > G.H + 40;
    for (const p of G.E.peatones || []) { if (!p.reac || p._caido || Math.hypot(p.x - C.x, p.y - C.y) > 70) continue; const q = pr(p.x, p.y, 2.25); if (fuera(q)) continue; g.font = 18 * d + 'px system-ui, sans-serif'; g.fillText(p.reac.tipo === 'llama' ? '📞' : p.reac.tipo === 'huye' ? '💨' : p.reac.tipo === 'ayuda' ? '🩹' : '❗', q[0], q[1]); n++; }
    for (const D of CV.dichos) { const p = D.p; if (!p || Math.hypot(p.x - C.x, p.y - C.y) > 90) continue; const q = pr(p.x, p.y, 2.7); if (fuera(q)) continue;
      const a = Math.min(1, D.t * 2), txt = D.texto, k = d, w = Math.min(200, 14 + txt.length * 6.6) * k; g.globalAlpha = a; g.font = '600 ' + 13 * k + 'px system-ui, sans-serif'; n++;
      const lineas = []; let lin = ''; for (const pal of txt.split(' ')) { if ((lin + ' ' + pal).length * 6.6 * k > w - 16 * k && lin) { lineas.push(lin); lin = pal; } else lin = lin ? lin + ' ' + pal : pal; } lineas.push(lin);
      const h = (10 + lineas.length * 16) * k, x0 = q[0] - w / 2, y0 = q[1] - h - 8 * k;
      g.fillStyle = 'rgba(255,255,255,.94)'; g.strokeStyle = 'rgba(12,14,20,.85)'; g.lineWidth = 2 * k; g.beginPath(); g.roundRect ? g.roundRect(x0, y0, w, h, 9 * k) : g.rect(x0, y0, w, h); g.moveTo(q[0] - 6 * k, y0 + h); g.lineTo(q[0], y0 + h + 8 * k); g.lineTo(q[0] + 6 * k, y0 + h); g.fill(); g.stroke();
      g.fillStyle = '#12151c'; lineas.forEach((l, i) => g.fillText(l, q[0], y0 + (13 + i * 16) * k)); }
    g.restore(); this.dibujados = n; return n;
  }
};
G.Viva = Viva;
/* el testigo llama: si fue grave y lo hizo el jugador, la policía se entera; y llega el servicio que haga falta */
MC.on('ciudad:testigo', ({ ev }) => {
  if (!ev || !G.busq || G.hist) return;
  if (ev.quien === 'jugador' && (ev.tipo === 'atropello' || ev.tipo === 'disparo' || ev.tipo === 'explosion')) G.busq.alerta(ev.tipo === 'atropello' ? 8 : 10, { testigos: 1, causa: 'un vecino llamó a la policía' });
  if (ev.tipo === 'atropello') Viva.despachar('ambulancia', ev.x, ev.y); else if (ev.tipo === 'explosion') Viva.despachar('bomberos', ev.x, ev.y);
});
/* los choques fuertes del jugador (no cada roce) */
MC.on('choque', C => { if (!C || C !== G.cuerpo || !MC.CiudadViva || (C.impacto || 0) < 7 || G.t - Viva._chT < 1.5) return; Viva._chT = G.t; MC.CiudadViva.emitir('choque', C.x, C.y, { fuerza: C.impacto }); });
/* atropellos, carros en llamas y lo de la búsqueda (disparos, patrullas destrozadas): se envuelven sin cambiar su lógica */
atropello = (orig => function (p) { orig(p); if (MC.CiudadViva && p) MC.CiudadViva.emitir('atropello', p.x, p.y, { grave: true }); })(atropello);
carroArde = (orig => function () { const antes = G.ardiendo; orig(); if (!antes && G.ardiendo && MC.CiudadViva) MC.CiudadViva.emitir('explosion', G.cuerpo.x, G.cuerpo.y, { grave: true }); })(carroArde);
eventoBusqueda = (orig => function (ev) { orig(ev); const CV = MC.CiudadViva; if (!CV || !ev) return; if (ev.tipo === 'disparo' && ev.x != null) CV.emitir('disparo', ev.x, ev.y, { quien: ev.quien || 'rival' }); else if (ev.tipo === 'fuera' && ev.x != null) CV.emitir('explosion', ev.x, ev.y, { quien: 'rival' }); })(eventoBusqueda);
EXTRAS.paso.push(dt => Viva.paso(dt));
EXTRAS.trafico.push(() => Viva.trafico());
EXTRAS.obstaculos.push(() => Viva.obstaculos());
EXTRAS.capas.push((g, pr, d) => Viva.capa(g, pr, d));
