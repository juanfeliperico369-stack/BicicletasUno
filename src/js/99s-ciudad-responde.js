/* =====================================================================
   LA CIUDAD TE RESPONDE (ronda 3.5, Claude) · traído de Motor City 5.2 «Ciudad viva» (MC.CiudadViva con tono 'familia') y
   adaptado a EnCicla. Del motor se toma la idea, no el código: las «reglas de respuesta» (como los diálogos de Left 4 Dead 2,
   de Valve): cada frase trae condiciones y se dice la MÁS ESPECÍFICA que cumpla, sin repetir lo dicho hace poco.
   - QUÉ OYE la gente: el TIMBRE, un CHOQUE, que le pases muy cerca a un PEATÓN, que te pases un SEMÁFORO en rojo, un TRUCO en
     una plaza y, si vas despacio entre la gente, el AMBIENTE (en la estación, el paradero, el parque, la ciclorruta o la calle,
     según la hora, la lluvia y la noche).
   - QUÉ HACE: la persona más cercana lo dice en una burbuja sobre su cabeza (en la cenital y en el 3D); tras un choque, los que
     están cerca se detienen a mirar. Una frase cada 3,5 s como mucho; ninguna se repite antes de 90 s.
   - LAS FRASES están en contenido/guion/frases.json (español de Colombia, para todo público; varias enseñan: el peatón va
     primero, en rojo también para la bici, luz de noche, frenar con tiempo bajo la lluvia). Se escriben más sin programar.
   ===================================================================== */
const Dichos = JE.dichos = {
  dicho: null, dichos: 0, _ult: new Map(), _t0: -99,
  frases() { return typeof GUION !== 'undefined' && GUION.frases && Array.isArray(GUION.frases.frases) ? GUION.frases.frases : []; },
  paraderos(M) { if (this._par) return this._par; const L = []; for (const A of M.alim || []) for (const st of A.st || []) if (isFinite(st.px)) L.push(st); return (this._par = L); },
  lugar(R, x, y) {
    const M = R.map, v = M.get(Math.floor(x / TS), Math.floor(y / TS)), cerca = (s, d) => Math.abs(s.x - x) < d && Math.abs(s.y - y) < d;
    if ((M.stations || []).some(s => cerca(s, 42))) return 'estacion';
    if (this.paraderos(M).some(s => Math.abs(s.px - x) < 34 && Math.abs(s.py - y) < 34)) return 'paradero';
    if (v === TT.CICLO) return 'ciclorruta'; if (v === TT.PLAZA || v === TT.GRASS) return 'parque'; return 'calle';
  },
  /* la frase más específica que cumpla las condiciones y no se haya dicho en 90 s (empates: al azar) */
  elegir(ev, ctx) {
    const ahora = performance.now() / 1000; let mejor = [], pmax = -1;
    for (const f of this.frases()) {
      if (!f.ev || !f.ev.includes(ev)) continue; let p = 0;
      if (f.lugar) { if (f.lugar !== ctx.lugar) continue; p++; }
      if (f.hora) { if (!(ctx.min >= f.hora[0] && ctx.min <= f.hora[1])) continue; p++; }
      if (f.lluvia != null) { if (!!f.lluvia !== !!ctx.lluvia) continue; p++; }
      if (f.noche != null) { if (!!f.noche !== !!ctx.noche) continue; p++; }
      if (f.veh) { if (!f.veh.includes(ctx.veh)) continue; p++; }
      if (ahora - (this._ult.has(f.t) ? this._ult.get(f.t) : -1e9) < 90) continue;
      if (p > pmax) { pmax = p; mejor = [f]; } else if (p === pmax) mejor.push(f);
    }
    return mejor.length ? mejor[(Math.random() * mejor.length) | 0] : null;
  },
  quien(R, x, y, r) { let b = null, bd = r; for (const q of R.peds || []) { const d = dist(q.x, q.y, x, y); if (d < bd) { bd = d; b = q; } } return b; },
  contexto(R, q) { const M = R.mode, min = ((M.clock | 0) % 1440 + 1440) % 1440; return { lugar: this.lugar(R, q.x, q.y), min, lluvia: !!(M.mods && M.mods.rain), noche: Art.night(min) > .5, veh: R.p.veh }; },
  decir(R, ev, x, y, op = {}) {
    if (!R || !R.mode || JE.headless || R.mode.sub) return null; const ahora = performance.now() / 1000;
    if (ahora - this._t0 < (op.pausa || 3.5)) return null;
    const q = this.quien(R, x, y, op.r || 60 * WK); if (!q) return null;
    const f = this.elegir(ev, this.contexto(R, q)); if (!f) return null;
    this._t0 = ahora; this._ult.set(f.t, ahora); this.dicho = { q, t: f.t, fin: ahora + 2.9, R }; this.dichos++;
    if (op.mira) for (const p of R.peds || []) if (dist(p.x, p.y, x, y) < op.mira) p.side = Math.max(p.side || 0, 1.4);   /* se detienen a mirar */
    return f;
  },
  /* la burbuja: hasta dos renglones de 30 letras */
  renglones(t) { const W = t.split(' '), L = ['']; for (const w of W) { const l = L[L.length - 1]; if ((l + ' ' + w).trim().length > 30 && L.length < 2) L.push(w); else L[L.length - 1] = (l + ' ' + w).trim(); } return L; }
};
(function () {
  const R0 = Ride.prototype;
  const _bell = R0.bellPeds;
  R0.bellPeds = function () { const P = this.p, hay = (this.peds || []).some(q => dist(q.x, q.y, P.x, P.y) < 40 * WK), r = _bell.apply(this, arguments); if (hay) Dichos.decir(this, 'timbre', P.x, P.y, { r: 40 * WK }); return r; };
  const _crash = R0.crash;
  R0.crash = function () { const r = _crash.apply(this, arguments); const P = this.p; Dichos.decir(this, 'choque', P.x, P.y, { r: 90 * WK, mira: 60 * WK, pausa: 1.5 }); return r; };
  /* lo que se cuenta en stats: el peatón al que le pasaste muy cerca y el semáforo en rojo; y el ambiente si vas despacio entre la gente */
  const _up = R0.update;
  R0.update = function (dt, dir) {
    const st = this.stats || {}, p0 = st.peds | 0, r0 = st.reds | 0, r = _up.call(this, dt, dir), P = this.p;
    if (!this.mode || this.mode.ride !== this || JE.headless) return r;
    if ((st.peds | 0) > p0) Dichos.decir(this, 'peaton', P.x, P.y, { r: 50 * WK, pausa: 1.5 });
    else if ((st.reds | 0) > r0) Dichos.decir(this, 'semaforo', P.x, P.y, { r: 90 * WK, pausa: 1.5 });
    else if ((this._ambT = (this._ambT == null ? 8 + Math.random() * 8 : this._ambT) - dt) <= 0) { this._ambT = 14 + Math.random() * 10; if (P.v < this.stats_().max * .45) Dichos.decir(this, 'ambiente', P.x, P.y, { r: 46 * WK, pausa: 8 }); }
    return r;
  };
  if (typeof Trucos !== 'undefined') { const _h = Trucos.hacer; Trucos.hacer = function (R) { const a = R.truco, r = _h.apply(this, arguments); if (R.truco && R.truco !== a) Dichos.decir(R, 'truco', R.p.x, R.p.y, { r: 70 * WK, pausa: 5 }); return r; }; }
  /* la burbuja sobre la persona que habla (con la cámara que esté: la cenital o la del mundo 3D) */
  const _hud = R0.hud;
  R0.hud = function (V, o) {
    _hud.call(this, V, o); const D = Dichos.dicho; if (!D || D.R !== this || performance.now() / 1000 > D.fin || this.big || !this.w2s) return;
    const q = this.w2s(D.q.x, D.q.y); if (q.x < -60 || q.x > V.w + 60 || q.y < 50 || q.y > V.h - 30) return; const L = Dichos.renglones('«' + D.t + '»');
    L.forEach((t, i) => V.text(t, q.x, q.y - 24 - (L.length - 1 - i) * 15, { size: 11.5, align: 'center', color: '#0a2342', bg: '#fff8dc', pad: 3, border: '#0a2342', body: true }));
  };
})();
