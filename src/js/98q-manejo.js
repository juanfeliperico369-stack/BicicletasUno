/* =====================================================================
   MANEJO DE LA 4.5 EN LA BICI (v2.1) · lo que el autor pidió para Motor City («ahí yace toda la jugabilidad»),
   portado a Juega EnCicla (manera A del informe: leer y portar; motor-city/docs/INVESTIGACION-MANEJO.md).
   El choque que desliza vive en Ride.mover (30-ride.js). Aquí, alrededor de cada paso del recorrido:
   1) ASISTENCIA que evita estrellarse: mira adelante (más lejos cuanto más rápido) cada 0,08 s; si viene pared y quien
      juega no está girando fuerte, corre el rumbo pedido hacia el lado libre que más se parece a lo que pide y no deja
      ir a fondo contra la pared. Como la «dirección asistida» de los juegos de carreras para celular. Se apaga en
      Más → «🛞 Asistencia de manejo» (o en la pausa). El bot y el modo panorámico no la usan.
   2) DESATASCAR: si empuja y no avanza durante 0,85 s, busca el hueco libre más cercano hacia donde quiere ir
      (anillos de 3 a 12 px) y sale con un empujón suave. Si quedó metida en algo, sale derecho.
   3) QUÉ SE PISA: el bordillo (de la calzada al andén, la plaza o la estación) da un tumbo y suelta polvo; el pasto y la
      tierra levantan polvo; con lluvia, los charcos salpican; una frenada fuerte deja la marca de la llanta.
   4) EL GOLPE se ve, se oye y se siente según el impacto (Ride.golpe): de frente, golpe sordo, polvo, un aro y una
      vibración corta; rasante, un roce (y chispas si es el camión). Sin daño ni nada feo: es para todo público.
   ===================================================================== */
const Manejo = JE.manejo = {
  on() { const S = Save.data && Save.data.settings; return !S || S.asist !== false; },
  ROAD: new Set([TT.ROAD, TT.AVE, TT.AUTO, TT.BRIDGE]), ALTO: new Set([TT.WALK, TT.PLAZA, TT.STATION]),
  POLVO: { [TT.GRASS]: '#b9b58a', [TT.LAND]: '#c9b78c', [TT.PLAZA]: '#d9d2c2', [TT.STEPS]: '#cfcabf' },
  /* ¿la entrada viene de una persona? (el bot, las pruebas y el paseo guiado manejan solos) */
  humano(R) { const M = R.mode; return !JE.headless && !(M && M.botDir) && !Input.botDir && !(typeof Paseo !== 'undefined' && M && Paseo.on && Paseo.on(M)) && !(typeof panoOn === 'function' && panoOn(R)); },
  /* 1) asistencia: devuelve el rumbo pedido corrido (y el acelerador recogido) si viene pared */
  asistir(R, dt, dir) {
    const P = R.p; R._asis = 0;
    if (!dir || !(dir.m > .08) || P.veh === 'walk' || P.stun > 0 || !this.on() || !this.humano(R)) { R._tAs = 0; R._asisA = 0; R._asisF = 0; return dir; }
    const S = R.stats_(); if (P.v < S.max * .18) { R._asisA = 0; R._asisF = 0; return dir; }
    if ((R._tAs = (R._tAs || 0) - dt) <= 0) {
      R._tAs = .08; R._asisA = 0; R._asisF = 0; const la = clamp(P.v * .32, 7, 34), libre = da => !R.blocked(P.x + Math.cos(P.a + da) * la, P.y + Math.sin(P.a + da) * la, S.r) && !R.blocked(P.x + Math.cos(P.a + da) * la * .55, P.y + Math.sin(P.a + da) * la * .55, S.r);
      if (!libre(0)) {
        const pide = angDiff(P.a, Math.atan2(dir.y, dir.x));
        for (const da of (pide >= 0 ? [.3, -.3, .6, -.6] : [-.3, .3, -.6, .6])) if (libre(da)) { R._asisA = da * (Math.abs(da) > .4 ? .9 : .75); break; }
        R._asisF = 1;
      }
    }
    const pide = angDiff(P.a, Math.atan2(dir.y, dir.x)); if (Math.abs(pide) > .7) return dir;   // gira fuerte: manda quien juega
    let a = Math.atan2(dir.y, dir.x), m = dir.m;
    if (R._asisA) { a += R._asisA; R._asis = R._asisA; }
    if (R._asisF && m > .6 && P.v > S.max * .45) m = .6;
    return { x: Math.cos(a), y: Math.sin(a), m };
  },
  /* 2) desatascar */
  desatascar(R, dir) {
    const P = R.p, S = R.stats_(), want = dir && dir.m ? Math.atan2(dir.y, dir.x) : P.a; let best = null, bp = 1e9;
    for (const d of [3, 5, 8, 12]) { for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d; if (R.blocked(x, y, S.r)) continue; const pen = d * M_PER_PX * .6 + Math.abs(angDiff(want, a)) * 1.2; if (pen < bp) { bp = pen; best = { x: x - P.x, y: y - P.y, a }; } } if (best) break; }
    if (!best) return false; R._empujon = { x: best.x, y: best.y }; if (P.veh !== 'walk') P.a += angDiff(P.a, best.a) * .5; P.v = 0; P.w = 0;
    R.stats.desatascos = (R.stats.desatascos | 0) + 1; return true;
  },
  /* 3 y 4) después de cada paso: atasco, empujón, bordillo, polvo, marcas y golpes */
  despues(R, dt, dir, x0, y0, v0, t0) {
    const P = R.p, S = R.stats_(), M = R.mode, Efx = JE.efx, libreCam = R.libre && R.libre.on;
    const empuja = dir && dir.m > .3 && !(P.stun > 0) && !libreCam && !(M && M.sitting);
    /* atascada = empuja y en 0,85 s no se aleja 2 px de donde estaba (el empujón de la pared la hace temblar en el sitio) */
    const an = R._anc; if (!empuja || !an || Math.hypot(P.x - an.x, P.y - an.y) > 2) { R._anc = { x: P.x, y: P.y }; R._atasco = 0; } else R._atasco = (R._atasco || 0) + dt;
    if (R._atasco > .85) { R._atasco = 0; this.desatascar(R, dir); }
    if (R._empujon) { const q = R._empujon, f = Math.min(1, dt * 8), metido = R.blocked(P.x, P.y, S.r); if (metido || !R.blocked(P.x + q.x * f, P.y + q.y * f, S.r)) { P.x += q.x * f; P.y += q.y * f; } q.x *= 1 - f; q.y *= 1 - f; if (Math.hypot(q.x, q.y) < .05) R._empujon = null; }
    if (!Efx || P.veh === 'walk') { R._tt = R.tileAt(); return; }
    const t1 = R.tileAt(), mx = Math.cos(P.a), my = Math.sin(P.a), bx = P.x - mx * 2.4, by = P.y - my * 2.4, fr = P.v / Math.max(1, S.max);
    /* bordillo: de la calzada a lo alto (andén, plaza, estación) o al revés, con velocidad */
    if (t0 != null && t1 !== t0 && (this.ROAD.has(t0) && this.ALTO.has(t1) || this.ALTO.has(t0) && this.ROAD.has(t1)) && fr > .35 && !(P.lvl > 0)) {
      R.tumbo = Math.min(.22, fr * .2); P.v *= .97; Efx.polvo(P.x, P.y, 3, '#d9d2c2', .7); Snd.sfx('bordillo'); if (fr > .7) vib(12);
    }
    R.tumbo = Math.max(0, (R.tumbo || 0) - dt);
    /* polvo en el pasto y la tierra; salpicaduras con lluvia */
    R._tPolvo = (R._tPolvo || 0) - dt;
    if (R._tPolvo <= 0 && fr > .3) {
      const col = this.POLVO[t1]; if (col && t1 !== TT.PLAZA) { Efx.polvo(bx, by, 1, col, .8); R._tPolvo = .1; }
      else if (M && M.mods && M.mods.rain && this.ROAD.has(t1)) { Efx.gotas(bx, by, 3); R._tPolvo = .14; }
    }
    /* frenada fuerte: la marca de la llanta trasera y un chirrido */
    const dec = (v0 - P.v) / Math.max(1e-3, dt);
    if (dec > S.brk * .7 && v0 > S.max * .35 && !R.golpeAhora && (this.ROAD.has(t1) || t1 === TT.CICLO)) {
      if (R._mk) Efx.marca(R._mk.x, R._mk.y, bx, by, P.veh === 'truck' ? 1.6 : .7, P.veh === 'truck' ? .4 : .28); R._mk = { x: bx, y: by };
      if (!(R._tFren > 0)) { Snd.sfx('frenazo'); R._tFren = .6; }
    } else R._mk = null;
    R._tFren = (R._tFren || 0) - dt;
    /* el golpe: Ride.mover dejó el contacto de este cuadro en R.golpe */
    const g = R.golpe; R.golpeAhora = false;
    if (g && g.t === (M && M.t) && g.v > S.max * .12) {
      R.golpeAhora = true; const k = g.imp * g.v / Math.max(1, S.max);
      if (g.imp > .55 && k > .25 && !(R._tGolpe > 0)) {
        R._tGolpe = .5; R.stats.golpes = (R.stats.golpes | 0) + 1; Snd.sfx('golpe'); vib(k > .6 ? 30 : 16); R.shake = Math.max(R.shake || 0, Math.min(.22, k * .25));
        Efx.polvo(g.x, g.y, 4, '#d9d2c2', 1); Efx.aro(g.x, g.y, 7, '#ffffff'); if (k > .6) Efx.pedazos(g.x, g.y, 3, '#b0aba0', .8);
        if (k > .55 && !(R._tPum > 0)) { R._tPum = 3; R.float(R.rng.pick(['¡Pum!', '¡Uy!', '¡Ojo!']), '#ffffff'); }
      } else if (g.imp <= .55 && fr > .3 && !(R._tRoce > 0)) {
        R._tRoce = .22; Snd.sfx('roce'); if (P.veh === 'truck') Efx.chispas(g.x, g.y, 6, Math.atan2(g.ny, g.nx) + Math.PI / 2 * Math.sign(Math.random() - .5)); else Efx.polvo(g.x, g.y, 1, '#cfc8b8', .6);
      }
    }
    R._tGolpe = (R._tGolpe || 0) - dt; R._tRoce = (R._tRoce || 0) - dt; R._tPum = (R._tPum || 0) - dt;
  }
};
(function () {
  const _upd = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) {
    const P = this.p, x0 = P.x, y0 = P.y, v0 = P.v, t0 = this.tileAt();
    const d = Manejo.asistir(this, dt, dir);
    const r = _upd.call(this, dt, d);
    try { Manejo.despues(this, dt, dir, x0, y0, v0, t0); } catch (e) { JE.errors && JE.errors.push('manejo: ' + e.message); }
    return r;
  };
  /* Más: el interruptor de la asistencia (junto a Vibración) */
  const _mas = UI.renderMas;
  UI.renderMas = function () {
    _mas.call(this); const v = $('#tab-mas [data-sw=vib]'); if (!v || $('#tab-mas [data-asist]')) return; const row = v.closest('.opt'), S = Save.data.settings, d = document.createElement('div');
    d.className = 'opt'; d.innerHTML = `<span>🛞 Asistencia de manejo<br><small class="m">Corrige un poco el rumbo para no estrellarte contra las paredes</small></span><button class="sw ${S.asist !== false ? 'on' : ''}" data-asist="1" aria-label="Asistencia de manejo"></button>`;
    row.after(d); d.querySelector('[data-asist]').onclick = e => { S.asist = S.asist === false; Save.save(); Snd.sfx('tap'); e.currentTarget.classList.toggle('on', S.asist !== false); };
  };
  /* pausa: también ahí */
  const _pause = Game.pause;
  Game.pause = function () {
    _pause.call(this); const go = $('#pGo'), M = this.mode; if (!go || !M || !M.ride || M.net) return; const S = Save.data.settings, b = document.createElement('button'); b.className = 'btn'; b.id = 'pAsist';
    const lbl = () => { b.textContent = '🛞 Asistencia de manejo: ' + (S.asist !== false ? 'sí' : 'no'); }; lbl();
    const ref = $('#pVel') || go; ref.after(b); b.onclick = () => { S.asist = S.asist === false; Save.save(); Snd.sfx('tap'); lbl(); };
  };
})();
