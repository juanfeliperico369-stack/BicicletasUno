/* =====================================================================
   F4 · RUN EN LA CICLOVÍA · «si vas por una ciclovía y tocas Run, todo cambia al estilo Run Scooter»
   - El corredor es Run Scooter casi idéntico (run/run-scooter.js, importado de RunRunZero), sobre el
     camino REAL desde donde vas: la ciclorruta y, en cada cruce, la que continúa (si se acaba, la calle).
   - Las lomas son el relieve real del camino y las curvas, su curvatura real; las esquinas salen en los
     cruces reales con calles a los dos lados: si doblas allá, doblas en el mundo abierto.
   - Puedes parar (freno), caminar o correr (a pie) y cambiar de vehículo; las metas y los retos siguen.
   - Al salir vuelves al mundo abierto en el mismo punto, a la misma hora y con el mismo clima.
   - Solo se puede en la ciclovía (casilla CICLO o una ciclorruta a menos de 7 m): así el cambio es verosímil.
   Escala: un metro del corredor son ESC metros reales (el corredor es arcade: va más rápido que la vida).
   ===================================================================== */
const RUN_VEH = { pie: 'foot', bici: 'bike', bici_propia: 'bike', bmx: 'bike', mtb: 'bike', ruta: 'bike', ebike: 'ebike', patinete: 'scooter', scooter: 'moped', monopatin: 'escooter', monociclo: 'euc', skate: 'skate', longboard: 'long', patines: 'inline', quad: 'quad', triciclo: 'trike', jetpack: 'jetpack', moto: 'moto', carro: 'auto', camion: 'camion' };
const RUN_SFX = new Set(['coin', 'jump', 'jump2', 'land', 'duck', 'lane', 'smash', 'shield', 'trick', 'stumble', 'crash', 'power', 'zone', 'deliver', 'revive', 'near', 'grind', 'clue', 'gift']);
const Run = {
  ESC: .5, activo: false,
  /* ¿se puede entrar a Run aquí y con este vehículo? */
  puede(mundo, cuerpo) { if (!MC.RunScooter) return { ok: false, razon: 'Run no está en esta compilación' }; if (!cuerpo.veh.run) return { ok: false, razon: 'Ese vehículo no corre Run' }; if (!mundo.esCiclovia(cuerpo.x, cuerpo.y, 7)) return { ok: false, razon: 'Run solo sale en la ciclovía' }; return { ok: true }; },
  /* op: { mundo, cuerpo, reloj, clima, aspecto, lienzo, capa, hud, alSalir(resultado), vehiculos: [ids] } */
  entrar(op) {
    const RS = MC.RunScooter, M = op.mundo, C = op.cuerpo, P0 = Run.puede(M, C); if (!P0.ok) throw new Error(P0.razon);
    const red = M.red('rueda'), cic = red.cercana(C.x, C.y, 12, e => e.k === VIA.CICLO);
    if (cic) { const a = cic.arista.t.rumbo(cic.s); C.x = cic.x; C.y = cic.y; C.a = Math.cos(angDif(C.a, a)) >= 0 ? a : a + Math.PI; }
    const seguir = new SeguirRuta(M, C, { red: 'rueda', atras: 120, adelante: 700 }), ESC = this.ESC, z0 = M.cota(C.x, C.y), cv = op.lienzo, capa = op.capa;
    capa.hidden = false; const dpr = Math.min(1.5, window.devicePixelRatio || 1); cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    if (!Run._gl) { if (!RS.R.init(cv)) throw new Error('Run necesita WebGL'); RS.RN.init(); try { RS.R.texture(RS.makeAtlas()); } catch (e) { MC.falla('Run: atlas', e); } Run._gl = true; }
    RS.R.resize && RS.R.resize(1);
    const A = op.aspecto, cos = { helmet: A.cCasco || '#ffffff', he: false, shirt: A.cCamisa, pants: A.cPantalon, se: false, paint: C.veh.color || '#7ab800', pe: false, pet: 'm0', skin: A.cPiel, hair: ['corto', 'coleta', 'afro', 'corto', 'moño'][(A.peinado | 0) % 5], hc: A.cPelo };
    let vid = RUN_VEH[C.veh.id] || 'bike'; RS.RN.setPlayer(cos, vid);
    /* el mapa entre el corredor (s del juego) y el mundo (s real del camino) */
    let ps = 0; const sReal = s => seguir.s + (s - ps) * ESC, punto = s => { const T = seguir.trazo; return T.at(clamp(sReal(s), 0, T.largo)); };
    const V = RS.RUNV, usados = new Set(); let ultGiro = -1e9;
    V.ponHill(s => (M.cota(punto(s).x, punto(s).y) - z0) * ESC * 1.15);
    V.hr = Ps => { const o = Ps - 60, d = 6, h = this._h || (this._h = new Float32Array(64)); for (let i = 0; i < 64; i++) { const q = punto(o + i * d); h[i] = (M.cota(q.x, q.y) - z0) * ESC * 1.15; } return { h, o: [o, d] }; };
    V.bend = Ps => clamp(seguir.trazo.curva(sReal(Ps + 30), 14) * ESC / 2, -.006, .006);
    V.esquina = (g, s) => {
      for (const c of seguir.rec.cruces) {
        const sg = ps + (seguir.base + c.s - seguir.s) / ESC; if (sg < s + 18 || sg > s + 420 || usados.has(c.nodo)) continue;
        const izq = c.opciones.filter(o => o.giro < -.6), der = c.opciones.filter(o => o.giro > .6); if (!izq.length || !der.length) continue;
        usados.add(c.nodo); const z = g.zt[g.zt.length - 1].z, n = RS.ZONES.length, L = izq[0], R2 = der[der.length - 1];
        return { s: sg, z, L: { z: (z + 1) % n, n: L.k === VIA.CICLO ? 1 : 2 }, R: { z: (z + 2) % n, n: R2.k === VIA.CICLO ? 1 : 2 }, done: 0, ai: null, real: { izq: L.nombre || 'calle', der: R2.nombre || 'calle', nodo: c.nodo } };
      }
      return null;
    };
    V.gira = (c, dir) => { if (seguir.girar(dir)) { ultGiro = seguir.s; this._aviso((dir < 0 ? '↰ ' : '↱ ') + ((c.real && (dir < 0 ? c.real.izq : c.real.der)) || 'Doblaste')); } };
    V.cielo = env => { const S = MC.Cielo.en(op.reloj.fecha, op.reloj.hora, op.clima), k = .65; for (const [a, b] of [['top', 'top'], ['hor', 'hor']]) for (let i = 0; i < 3; i++) env[a][i] = lerp(env[a][i], S[b][i], k); env.amb *= .55 + .45 * S.dia; env.sunI *= .35 + .65 * S.luzSol; env.stars = Math.max(env.stars || 0, S.noche); env.emit = Math.max(env.emit, S.noche * .6); };
    const g = RS.newGame({ seed: hashTxt(op.reloj.fecha.toDateString() + Math.round(C.x) + ',' + Math.round(C.y)), veh: vid, up: {}, mult: 1, cluesLeft: 0, letters: '', tut: false, fit: 60, evt: '' });
    try { RS.AU.init(); RS.AU.music(true); } catch (e) { /* sin audio */ }
    /* ---------- interfaz propia (la del juego que lo use puede reemplazarla) ---------- */
    const hud = op.hud; hud.innerHTML = `<div class="rTop" style="position:absolute;top:10px;left:10px;right:10px;display:flex;gap:6px;flex-wrap:wrap;font:800 13px system-ui;color:#fff;text-shadow:0 1px 3px #000"><span id="rCalle" style="background:#0b1020b0;padding:6px 10px;border-radius:999px"></span><span id="rDist" style="background:#0b1020b0;padding:6px 10px;border-radius:999px"></span><span id="rPts" style="background:#0b1020b0;padding:6px 10px;border-radius:999px"></span></div>
      <div id="rEn" style="position:absolute;top:52px;left:12px;width:150px;height:8px;border-radius:6px;background:#ffffff30;overflow:hidden"><i style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#39ffb3,#ffc23a)"></i></div>
      <div id="rAviso" style="position:absolute;top:24%;left:50%;transform:translateX(-50%);font:900 20px system-ui;color:#fff;text-shadow:0 2px 6px #000;text-align:center;transition:opacity .3s;opacity:0"></div>
      <div id="rEsq" style="position:absolute;top:34%;left:0;right:0;display:flex;justify-content:space-between;padding:0 12px;font:900 15px system-ui;color:#ffc23a;text-shadow:0 2px 4px #000"></div>
      <div style="position:absolute;right:10px;top:48px;display:flex;flex-direction:column;gap:6px">${[['rSalir', '✕', 'Salir'], ['rVeh', '🔁', 'Vehículo'], ['rPie', '🚶', 'A pie']].map(([id, i, t]) => `<button id="${id}" style="width:58px;height:50px;border-radius:14px;border:1px solid #ffffff30;background:#0b1020c0;color:#fff;font:700 18px system-ui">${i}<br><small style="font-size:9px">${t}</small></button>`).join('')}</div>
      <div style="position:absolute;right:12px;bottom:24px;display:flex;gap:10px">${[['rFreno', '■', 'FRENO'], ['rImp', '⚡', 'IMPULSO']].map(([id, i, t]) => `<button id="${id}" style="width:72px;height:72px;border-radius:50%;border:2px solid #39ffb3;background:#0b1020c0;color:#fff;font:900 22px system-ui">${i}<br><small style="font-size:9px">${t}</small></button>`).join('')}</div>
      <div id="rFin" hidden style="position:absolute;inset:0;display:grid;place-content:center;gap:10px;background:#0b1020c8;text-align:center;font:800 18px system-ui;color:#fff"><div id="rFinT"></div><button id="rOtra" style="padding:12px 20px;border-radius:12px;border:2px solid #39ffb3;background:#102a22;color:#39ffb3;font:900 18px system-ui">Seguir corriendo</button><button id="rSalir2" style="padding:12px 20px;border-radius:12px;border:1px solid #ffffff40;background:#0b1020;color:#fff;font:800 16px system-ui">Volver al mundo abierto</button></div>`;
    const $h = id => hud.querySelector('#' + id), cola = [], meter = k => cola.push(k);
    this._aviso = (t, ms = 1600) => { const a = $h('rAviso'); a.textContent = t; a.style.opacity = 1; clearTimeout(this._at); this._at = setTimeout(() => a.style.opacity = 0, ms); };
    $h('rSalir').onclick = $h('rSalir2').onclick = () => salir(); $h('rOtra').onclick = () => { if (RS.revive) RS.revive(g); else { g.p.alive = true; g.p.deadT = 0; g.p.inv = 2; } $h('rFin').hidden = true; };
    const vehs = (op.vehiculos || ['bici', 'ebike', 'patinete', 'scooter', 'monopatin', 'skate', 'longboard', 'patines', 'quad', 'monociclo', 'triciclo', 'pie']).filter(v => RUN_VEH[v]);
    const cambia = id => { const v = RS.VEHI[RUN_VEH[id]]; if (!v) return; C.setVeh(id); vid = v.id; g.veh = v; g.street = v.street ? 1 : 0; g.vs = v.spd; g.hk = v.hnd; g.bmax = v.boost; RS.RN.setPlayer(Object.assign({}, cos, { paint: C.veh.color || cos.paint }), vid); this._aviso(C.veh.icon + ' ' + C.veh.n); };
    $h('rVeh').onclick = () => { const i = vehs.indexOf(C.veh.id); cambia(vehs[(i + 1) % vehs.length]); };
    $h('rPie').onclick = () => cambia('pie');
    const pd = (id, k, k2) => { const b = $h(id); b.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); meter(k); }; if (k2) b.onpointerup = b.onpointerleave = () => meter(k2); };
    pd('rFreno', 'K', 'k'); pd('rImp', 'B');
    /* gestos: deslizar ← → ↑ ↓ (como en Run Scooter) y teclado */
    let t0 = null; const pdn = e => { if (e.target.closest('button')) return; t0 = { x: e.clientX, y: e.clientY }; }, pup = e => { if (!t0) return; const dx = e.clientX - t0.x, dy = e.clientY - t0.y; t0 = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) { meter('U'); return; } meter(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'L' : 'R') : (dy < 0 ? 'U' : 'D')); };
    capa.addEventListener('pointerdown', pdn); capa.addEventListener('pointerup', pup);
    const TK = { ArrowLeft: 'L', KeyA: 'L', ArrowRight: 'R', KeyD: 'R', ArrowUp: 'U', KeyW: 'U', Space: 'U', ArrowDown: 'D', KeyS: 'D', ShiftLeft: 'B', KeyF: 'B', KeyX: 'K', KeyQ: 'Q', KeyE: 'E' };
    const kd = e => { if (e.repeat) return; if (e.code === 'Escape') return salir(); if (e.code === 'KeyV') return $h('rVeh').onclick(); const k = TK[e.code]; if (k) { meter(k); e.preventDefault(); e.stopImmediatePropagation(); } }, ku = e => { if (e.code === 'KeyX') meter('k'); };
    addEventListener('keydown', kd, true); addEventListener('keyup', ku, true);
    /* ---------- bucle ---------- */
    let acc = 0, last = performance.now(), raf = 0, metros = 0, hudT = 0;
    this.activo = true; this.g = g; this.seguir = seguir; MC.emit('run', { entra: true });
    this._aviso('🛴 RUN · ' + (seguir.via && seguir.via.nombre || 'ciclorruta'), 2200);
    const cuadro = ts => {
      raf = requestAnimationFrame(cuadro); const dt = Math.min(.1, (ts - last) / 1000); last = ts; op.reloj.avanzar(dt); op.clima.actualizar(op.reloj, dt); V.lluvia = op.clima.lluvia > .15 ? clamp(op.clima.lluvia, 0, 1) : 0;
      if (g.p.alive) { acc += dt; let n = 0; while (acc >= RS.DT && n < 14) { RS.step(g, RS.DT, cola.shift() || null); acc -= RS.DT; n++; const ds = (g.p.s - ps) * ESC; ps = g.p.s; if (ds > 0) { seguir.avanzar(ds); metros += ds; } } if (n >= 14) acc = 0; }
      else { RS.step(g, dt, null); if (g.p.deadT > 1.1 && $h('rFin').hidden) { $h('rFin').hidden = false; $h('rFinT').innerHTML = '¡Uy! ' + (g.cause || 'Te caíste') + '<br><small>' + Math.round(metros) + ' m reales · ' + g.score + ' puntos</small>'; } }
      /* curvas fuertes del camino real (que no son una esquina elegida): la cámara gira como en una esquina */
      const k = seguir.trazo.curva(seguir.s + 6, 6); if (Math.abs(k) > .07 && seguir.s - ultGiro > 25) { ultGiro = seguir.s; RS.RN.events(g, { k: 'turn', a: { dir: Math.sign(k), z: 0, n: 2 } }); }
      for (const e of g.ev) { RS.RN.events(g, e); if (RUN_SFX.has(e.k)) try { RS.AU.sfx(e.k); } catch (er) { /* sin audio */ } if (e.k === 'trick' && e.a) this._aviso('🛹 ' + e.a.name); }
      g.ev.length = 0;
      try { RS.RN.frame(g, 'play', ts / 1000, dt); } catch (e) { MC.falla('Run: dibujo', e); }
      hudT -= dt; if (hudT <= 0) { hudT = .2; $h('rCalle').textContent = '📍 ' + ((seguir.via && seguir.via.nombre) || M.calle(C.x, C.y) || 'ciclorruta') + ' · ' + M.barrio(C.x, C.y); $h('rDist').textContent = (metros / 1000).toFixed(2) + ' km · ' + Math.round(g.p.v * ESC * 3.6) + ' km/h'; $h('rPts').textContent = '★ ' + Math.round(g.score) + ' · ◉ ' + g.coinsRun; $h('rEn').firstChild.style.width = Math.round(100 * g.p.en / g.enMax) + '%';
        const cn = g.corners.find(c => !c.done && c.s - g.p.s < 70 && c.s - g.p.s > -1); $h('rEsq').innerHTML = cn && cn.real ? `<span>↰ ${cn.real.izq}</span><span>${cn.real.der} ↱</span>` : ''; }
    };
    raf = requestAnimationFrame(cuadro);
    const salir = () => {
      if (!this.activo) return; this.activo = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); capa.removeEventListener('pointerdown', pdn); capa.removeEventListener('pointerup', pup);
      try { RS.AU.music(false); } catch (e) { /* sin audio */ }
      for (const k of ['hr', 'bend', 'esquina', 'gira', 'cielo', 'lluvia']) V[k] = undefined;
      C.v = 0; C.z = 0; C.enAire = false; C.paso = null; C.zPaso = 0; hud.replaceChildren(); capa.hidden = true;
      const r = { metros, puntos: Math.round(g.score), monedas: g.coinsRun, saltos: g.jumps, trucos: g.tricks, calle: M.calle(C.x, C.y), x: C.x, y: C.y };
      MC.emit('run', Object.assign({ entra: false }, r)); if (op.alSalir) op.alSalir(r);
    };
    this.salir = salir; return { g, seguir, salir };
  }
};
MC.Run = Run;
