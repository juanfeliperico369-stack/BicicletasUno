/* =====================================================================
   MODOS EVOLUCIÓN 3.3 + 5 SKATEPARKS ABIERTOS + RUNNER EN CICLORRUTA (Gemini · Antigravity)
   Armonizado con 99c-trucos.js (Claude), 99h-valle-vivo.js (Claude) y 99r-ciclo-geometria-gpt6.js (OpenAI GPT-6).
   Incluye los 6 modos clave pedidos por el autor y el plan multi-IA (§ 4–6):
   1) 🏆 Copa del Valle (Super Arcade Racing · referente #1): 3 circuitos callejeros reales en JE.map,
      3 rivales IA, rebufo (slipstream), flechas de vértice en el asfalto y banderas en el mundo abierto.
   2) 🍔 Domicilio Sostenible (Crazy Taxi / Parcel Corps / #DRIVE): entregas contrarreloj de sabores paisas
      en JE.map con flecha diegética, recarga de reloj por racha y bono de frescura.
   3) 📡 Monitoreo 911 del Valle (911 Operator / CityRT): despacho táctico en tiempo real de camiones,
      técnicos, anfitriones y agentes de tránsito ante incidentes sobre las 6 comunas.
   4) 🏙️ El Planeador del Valle (Cities: Skylines / Townscaper): estrategia cívica colocando estaciones,
      tótems solares, ciclorrutas y plazas guayacán dentro del presupuesto para elevar cobertura y aire limpio.
   5) 🚇 Metro 2D Lateral (Tiny Rails / TrainChu): recorrido lateral pixel/2D por las estaciones reales
      de la Línea A del Metro de Medellín con acelerador, freno de precisión en andén y pasajeros.
   6) 🌅 Bajada por Las Palmas (Alto's Odyssey + Ley 1811): descenso lateral al atardecer con curvas,
      resaltos saltables, brisas de impulso y distancia segura de 1,5 m.
   + 5 skateparks físicos con rampas, barandas y parkour en JE.map + mejoras de anchos y cruces en MGRunner3D.
   ===================================================================== */
(function () {
  /* =====================================================================
     A) 5 SKATEPARKS / ZONAS PARKOUR FÍSICAS EN EL MUNDO ABIERTO + RUNNER CICLORRUTA
     ===================================================================== */
  const SKATE_DEF = [
    { id: 'ciudaddelrio', n: 'Skatepark Ciudad del Río', barrio: 'Ciudad del Río', lat: 6.2238, lon: -75.5747, col: '#ff8a3d', tipo: 'Skate & BMX', r: 34 },
    { id: 'parquesrio', n: 'Parques del Río · Parkour', barrio: 'Conquistadores', lat: 6.2458, lon: -75.5789, col: '#9bd341', tipo: 'Parkour & Rampas', r: 34 },
    { id: 'atanasio', n: 'Unidad Atanasio · Bowl & Rails', barrio: 'Estadio', lat: 6.2568, lon: -75.5902, col: '#56c7ff', tipo: 'BMX & Skate', r: 34 },
    { id: 'cuatrosur', n: 'Puente de la 4 Sur · Street', barrio: 'El Poblado', lat: 6.2055, lon: -75.5778, col: '#ffc93c', tipo: 'Street & Grinds', r: 34 },
    { id: 'laureles2', n: 'Segundo Parque de Laureles', barrio: 'Laureles', lat: 6.2442, lon: -75.5964, col: '#ff5a9d', tipo: 'Manuals & Parkour', r: 32 }
  ];

  const TRUCOS_99P = {
    bike: ['Bunny Hop', 'Barspin', 'Manual', 'Tailwhip', 'Wall-Ride'],
    ebike: ['Salto Turbo', 'Barspin Eléctrico', 'Manual Largo', '360° Suave'],
    skate: ['Ollie', 'Kickflip', '50-50 Grind', 'Heelflip', 'Boardslide', 'Nose Manual'],
    patines: ['Soul Grind', 'Salto 360°', 'Royale', 'Grab Aéreo', 'Cross-Step'],
    scooter: ['Tailwhip', 'Barspin', 'Feeble Grind', 'Bunny Hop'],
    emonopatin: ['Salto Urbano', '180° Pivot', 'Manual Eléctrico'],
    walk: ['Bóveda Parkour', 'Salto Kong', 'Wall-Run', 'Precisión', 'Giro Aéreo']
  };

  const Skate = JE.skate = {
    spots: null,
    init() {
      if (this.spots || !JE.map || typeof geoP !== 'function') return;
      this.spots = SKATE_DEF.map(d => {
        const g = geoP(d.lat, d.lon);
        const o = JE.map.nearestOpen ? JE.map.nearestOpen(Math.floor(g.x / TS), Math.floor(g.y / TS), false) : { x: Math.floor(g.x / TS), y: Math.floor(g.y / TS) };
        const x = o.x * TS + TS / 2, y = o.y * TS + TS / 2;
        return Object.assign({}, d, {
          x, y,
          piezas: [
            { k: 'rampa', dx: -12, dy: -6, w: 10, h: 6 },
            { k: 'rail', dx: 8, dy: -9, w: 16, h: 3 },
            { k: 'rampa', dx: 11, dy: 8, w: 10, h: 6 },
            { k: 'parkour', dx: -10, dy: 9, w: 9, h: 5 }
          ]
        });
      });
      JE.skateSpots = this.spots;
    },
    cerca(R) {
      if (!this.spots || !R) return null;
      const P = R.p;
      for (const s of this.spots) if (dist(P.x, P.y, s.x, s.y) <= s.r * WK) return s;
      return null;
    },
    hacerTruco(R, bonusNombre) {
      const P = R.p, M = R.mode;
      if (!P || !M || P.veh === 'truck') return false;
      if ((R._trucoCd || 0) > 0) return false;
      R._trucoCd = .55;
      R.ollieT = .46;
      R.inv = Math.max(R.inv || 0, .48);
      const list = TRUCOS_99P[P.veh] || TRUCOS_99P.bike;
      const nombre = bonusNombre || list[Math.floor(Math.random() * list.length)];
      R._trCombo = (R._trT > 0 ? (R._trCombo | 0) + 1 : 1);
      R._trT = 3.2;
      const pts = 10 + Math.min(40, (R._trCombo - 1) * 8);
      M.score = (M.score | 0) + pts;
      const tag = (P.veh === 'walk' ? '🏃 ' : '🛹 ') + nombre + (R._trCombo > 1 ? ' ×' + R._trCombo : '') + ' +' + pts;
      for (const f of R.fx || []) if (f.k === 't') f.y -= 10;
      R.float(tag, R._trCombo >= 3 ? '#ff8a3d' : PAL.amb);
      if (Snd.vehSfx) Snd.vehSfx(P.veh === 'walk' ? 'skate' : P.veh, 'ollie');
      R.burst(P.x, P.y, R._trCombo >= 3 ? '#ffc93c' : '#9bd341', 7);
      if (JE.habil && JE.habil.subir) JE.habil.subir('equilibrio', H => { H.trucos = (H.trucos | 0) + 1; });
      if (JE.rpg && JE.rpg.ganarSkill) JE.rpg.ganarSkill('tecnica', 4 + R._trCombo * 2, nombre);
      return true;
    },
    /* Respeta la proyección exacta por segmentos de 99r-ciclo-geometria-gpt6.js cuando está cargada */
    enCiclovia(R) {
      if (!R || !R.map) return false;
      if (JE.cicloGeoGPT6 && R.mode && JE.cicloGeoGPT6.enCiclovia) return JE.cicloGeoGPT6.enCiclovia(R.mode);
      if (R.tileAt() === TT.CICLO) return true;
      const P = R.p, near = R.map.chainsNear ? R.map.chainsNear(P.x - 16, P.y - 16, 32, 32) : [];
      for (let i = 0; i < near.length; i++) {
        const ch = near[i];
        if (ch.k !== 5 || !ch.p) continue;
        for (let j = 0; j < ch.p.length; j += 2) {
          if (Math.hypot(ch.p[j] - P.x, ch.p[j + 1] - P.y) < 15) return true;
        }
      }
      return false;
    }
  };

  /* Circuitos callejeros reales de Copa del Valle (Super Arcade Racing) en JE.map */
  const COPAS_DEF = [
    { id: 'laureles', n: 'Circuito Laureles', lat: 6.2448, lon: -75.5955, col: '#ff8a3d', laps: 2,
      pts: [[6.2448, -75.5955], [6.2492, -75.5920], [6.2465, -75.5865], [6.2412, -75.5905]] },
    { id: 'rio', n: 'Sprint Ciudad del Río', lat: 6.2242, lon: -75.5742, col: '#9bd341', laps: 2,
      pts: [[6.2242, -75.5742], [6.2325, -75.5738], [6.2310, -75.5792], [6.2228, -75.5785]] },
    { id: 'estadio', n: 'Circuito Atanasio–Estadio', lat: 6.2565, lon: -75.5898, col: '#56c7ff', laps: 2,
      pts: [[6.2565, -75.5898], [6.2612, -75.5865], [6.2580, -75.5818], [6.2525, -75.5860]] }
  ];

  function copaSpots() {
    if (Skate._copas || !JE.map || typeof geoP !== 'function') return Skate._copas || [];
    Skate._copas = COPAS_DEF.map((d, idx) => {
      const g = geoP(d.lat, d.lon);
      const o = JE.map.nearestOpen ? JE.map.nearestOpen(Math.floor(g.x / TS), Math.floor(g.y / TS), false) : { x: Math.floor(g.x / TS), y: Math.floor(g.y / TS) };
      return Object.assign({}, d, { idx, x: o.x * TS + TS / 2, y: o.y * TS + TS / 2 });
    });
    JE.copaSpots = Skate._copas;
    return Skate._copas;
  }

  const _start99p = Game.start;
  Game.start = function () {
    Skate.init();
    copaSpots();
    return _start99p.apply(this, arguments);
  };

  /* Dibujar los 5 skateparks y las 3 banderas de Copa del Valle sobre el mismo mundo */
  const _drawG99p = Ride.prototype.drawGround;
  Ride.prototype.drawGround = function (c, ox, oy, inV) {
    _drawG99p.call(this, c, ox, oy, inV);
    if (Skate.spots) {
      for (const s of Skate.spots) {
        if (!inV(s.x, s.y, s.r * WK + 16)) continue;
        const sx = s.x - ox, sy = s.y - oy, rad = 24;
        c.save();
        c.fillStyle = 'rgba(218,222,226,.82)';
        c.beginPath(); c.roundRect(sx - rad, sy - rad * .78, rad * 2, rad * 1.56, 7); c.fill();
        c.strokeStyle = s.col; c.lineWidth = 1.4; c.stroke();
        for (const pz of s.piezas) {
          const px = sx + pz.dx, py = sy + pz.dy;
          if (pz.k === 'rampa') {
            c.fillStyle = '#e8b931'; c.fillRect(px - pz.w / 2, py - pz.h / 2, pz.w, pz.h);
            c.fillStyle = '#0a2342'; c.fillRect(px - pz.w / 2, py - pz.h / 2, pz.w, 1.5);
          } else if (pz.k === 'rail') {
            c.fillStyle = '#253244'; c.fillRect(px - pz.w / 2, py - 1.2, pz.w, 2.4);
            c.fillStyle = '#56c7ff'; c.fillRect(px - pz.w / 2, py - .6, pz.w, 1.2);
          } else {
            c.fillStyle = '#2e9d55'; c.fillRect(px - pz.w / 2, py - pz.h / 2, pz.w, pz.h);
            c.fillStyle = '#e8f5d0'; c.fillRect(px - pz.w / 2 + 1, py - 1, pz.w - 2, 1.4);
          }
        }
        c.restore();
      }
    }
    if (this.mode && this.mode.free && Skate._copas) {
      for (const cp of Skate._copas) {
        if (!inV(cp.x, cp.y, 26)) continue;
        const sx = cp.x - ox, sy = cp.y - oy;
        c.save();
        c.strokeStyle = cp.col; c.lineWidth = 2; c.setLineDash([4, 3]);
        c.beginPath(); c.arc(sx, sy, 16, 0, TAU); c.stroke(); c.setLineDash([]);
        /* Cuadrícula ajedrezada de salida estilo Super Arcade Racing */
        for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) {
          c.fillStyle = (r + k) % 2 ? '#0a2342' : '#ffffff';
          c.fillRect(sx - 8 + k * 4, sy - 4 + r * 4, 4, 4);
        }
        c.restore();
      }
    }
  };

  /* Física automática al cruzar rampas/barandas en los 5 skateparks del mundo abierto */
  const _upd99p = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) {
    const r = _upd99p.call(this, dt, dir);
    if (this._trucoCd > 0) this._trucoCd = Math.max(0, this._trucoCd - dt);
    if (this._trT > 0) { this._trT -= dt; if (this._trT <= 0) this._trCombo = 0; }
    if (!Skate.spots || JE.headless || !(this.mode && this.mode.free)) return r;
    const P = this.p;
    if (P.veh !== 'truck' && P.v > 14 * WK) {
      const sp = Skate.cerca(this);
      if (sp) {
        if (!this._skGreet || this._skGreet !== sp.id) {
          this._skGreet = sp.id;
          if (JE.ui) JE.ui.toast('🛹 ' + sp.n + ' (' + sp.tipo + '): cruza las rampas o toca Truco');
        }
        for (const pz of sp.piezas) {
          if (Math.hypot(P.x - (sp.x + pz.dx), P.y - (sp.y + pz.dy)) < 7.5) {
            const nom = pz.k === 'rail' ? '50-50 Grind' : pz.k === 'parkour' ? 'Bóveda Parkour' : 'Salto en Rampa';
            Skate.hacerTruco(this, nom);
            break;
          }
        }
      } else this._skGreet = null;
    }
    return r;
  };

  const _hud99p = Ride.prototype.hud;
  Ride.prototype.hud = function (V, opts) {
    _hud99p.call(this, V, opts);
    if (this.big || (typeof panoOn === 'function' && panoOn(this))) return;
    const inPersp = (typeof Mundo3D !== 'undefined' && Mundo3D.activo(this)) || (JE.vistas && (JE.vistas.esPersp() || JE.vistas.esMaqueta()));
    if (!inPersp && Skate.spots && this.lblRoom) {
      for (const s of Skate.spots) {
        if (Math.abs(s.x - this.p.x) > 220 || Math.abs(s.y - this.p.y) > 280) continue;
        const q = this.w2s(s.x, s.y - 26), lbl = '🛹 ' + s.n;
        if (this.lblRoom(q.x, q.y, lbl.length * 5.8 + 10, 16)) {
          V.text(lbl, q.x, q.y, { size: 10.5, align: 'center', bg: '#0a2342ee', color: s.col, pad: 3, border: s.col });
        }
      }
      for (const cp of Skate._copas || []) {
        if (Math.abs(cp.x - this.p.x) > 220 || Math.abs(cp.y - this.p.y) > 280) continue;
        const q = this.w2s(cp.x, cp.y - 22), lbl = '🏁 ' + cp.n;
        if (this.lblRoom(q.x, q.y, lbl.length * 5.8 + 10, 16)) {
          V.text(lbl, q.x, q.y, { size: 10.5, align: 'center', bg: '#0a2342ee', color: cp.col, pad: 3, border: cp.col });
        }
      }
    }
    if (this._trCombo > 0 && this._trT > 0) {
      V.text('🛹 COMBO ×' + this._trCombo, V.w / 2, (View.top || 60) + 66, { size: 15, align: 'center', color: '#ffc93c', bg: '#0a2342e0', pad: 5 });
    }
  };

  /* Acciones contextuales en Modo Libre: Skatepark, Ciclorruta Runner y Bandera Copa del Valle */
  if (typeof HUD21 !== 'undefined' && Array.isArray(HUD21.CTX)) {
    for (const k of ['cicloRunner', 'copaAqui']) if (!HUD21.CTX.includes(k)) HUD21.CTX.push(k);
  }
  const _act99p = ModeUsuarioR.prototype.actions;
  ModeUsuarioR.prototype.actions = function () {
    const a = _act99p.call(this);
    if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
    const R = this.ride;
    if (Skate.cerca(R) && R.p.veh !== 'truck' && !a.some(x => x.id === 'truco')) {
      a.push({ id: 'truco', icon: 'estrella', label: R.p.veh === 'walk' ? 'Parkour' : 'Truco', fn: () => Skate.hacerTruco(R) });
    }
    if (Skate.enCiclovia(R) && R.p.veh !== 'walk' && R.p.veh !== 'truck') {
      a.push({ id: 'cicloRunner', icon: 'usuario', label: 'Runner', fn: () => this.iniciarRunner3D() });
    }
    const cp = (Skate._copas || []).find(c => dist(R.p.x, R.p.y, c.x, c.y) < 30 * WK);
    if (cp && typeof Actividades !== 'undefined') {
      a.push({ id: 'copaAqui', icon: 'estrella', label: 'Copa Valle', fn: () => Actividades.jugar(this, 'copa', cp.idx + 1) });
    }
    return a;
  };

  /* Mejora aditiva de MGRunner3D: anchos variables, giros direccionales y obstáculos de grind/parkour */
  if (typeof MGRunner3D !== 'undefined') {
    const TRAMOS_ANCHO = [
      { id: 'normal', n: 'Ciclorruta del Valle', k: 1.0, col: '#2e8b52' },
      { id: 'ancha', n: 'Avenida Ancha (Ciclovía)', k: 1.32, col: '#3a9b5f' },
      { id: 'estrecha', n: 'Paso Estrecho · Barrio', k: .68, col: '#5b6772' }
    ];
    const RAMALES = [['Laureles', 'Estadio'], ['Ciudad del Río', 'El Poblado'], ['Parques del Río', 'Carabobo'], ['Jardín Botánico', 'Moravia']];
    const _spawn99p = MGRunner3D.prototype.spawnRow;
    MGRunner3D.prototype.spawnRow = function () {
      _spawn99p.call(this);
      if (this.rng.f() < .24) {
        const d = this.nextD - 8, lane = this.rng.i(-1, 1);
        this.items.push({ d, lane, kind: this.rng.f() < .55 ? 'baranda' : 'parkour', done: false, moved: false });
      }
    };
    const _updR99p = MGRunner3D.prototype.update;
    MGRunner3D.prototype.update = function (dt) {
      if (this._wIdx == null) { this._wIdx = 0; this._wScale = 1.0; this._nextW = 110; this._nextTurn = 145; this._turn = null; this._bank = 0; this._comboR = 0; }
      if (this.distM >= this._nextW) {
        this._nextW += 115 + this.rng.i(0, 50);
        this._wIdx = (this._wIdx + 1 + this.rng.i(0, 1)) % TRAMOS_ANCHO.length;
        const tr = TRAMOS_ANCHO[this._wIdx];
        if (JE.ui && !JE.headless) JE.ui.toast('🛣️ ' + tr.n);
      }
      this._wScale += (TRAMOS_ANCHO[this._wIdx].k - this._wScale) * Math.min(1, dt * 3);
      if (!this._turn && this.distM >= this._nextTurn - 38) {
        const ram = RAMALES[Math.floor(this.rng.f() * RAMALES.length)];
        this._turn = { at: this._nextTurn, izq: ram[0], der: ram[1], done: false };
      }
      if (this._turn && !this._turn.done && this.distM >= this._turn.at) {
        this._turn.done = true;
        const dir = this.lane < 0 ? -1 : this.lane > 0 ? 1 : 0;
        if (dir !== 0) {
          this._bank = dir * .35; this.score += 18; this.barrio = dir < 0 ? this._turn.izq : this._turn.der;
          Snd.sfx('coin');
          if (JE.ui && !JE.headless) JE.ui.toast((dir < 0 ? '⬅️ Giraste hacia ' : '➡️ Giraste hacia ') + this.barrio + ' +18');
        }
        this._nextTurn = this.distM + 145 + this.rng.i(0, 45);
        this._turn = null;
      }
      this._bank *= Math.max(0, 1 - dt * 3.2);
      for (const it of this.items || []) {
        if (it.done || (it.kind !== 'baranda' && it.kind !== 'parkour')) continue;
        const rel = it.d - this.distM;
        if (Math.abs(rel) < 2.2 && Math.abs(it.lane - this.laneX) < .62) {
          if (this.jumpZ > .18 || it.kind === 'baranda') {
            it.done = true; this._comboR = (this._comboR | 0) + 1;
            const pts = 16 + this._comboR * 6;
            this.score += pts; this.hojas += 2; this.jumpZ = Math.max(this.jumpZ, .55); this.jumpVz = 2.4;
            if (Snd.vehSfx) Snd.vehSfx(this.veh || 'bike', 'ollie');
          }
        }
      }
      return _updR99p.call(this, dt);
    };
    const _hudR99p = MGRunner3D.prototype.hud;
    MGRunner3D.prototype.hud = function (V) {
      _hudR99p.call(this, V);
      const tr = TRAMOS_ANCHO[this._wIdx || 0];
      if (tr && tr.id !== 'normal') {
        V.text((tr.id === 'estrecha' ? '⚠️ ' : '🛣️ ') + tr.n, V.w / 2, Math.max((View.hudB || 50) + 64, 96), { size: 11.5, align: 'center', color: tr.id === 'estrecha' ? '#ffc93c' : '#c4ec7c', bg: '#0a2342d8', pad: 4 });
      }
      if (this._turn && !this._turn.done) {
        const d = Math.max(0, Math.round(this._turn.at - this.distM));
        V.text('⬅ ' + this._turn.izq + ' · ⬆ Recto · ' + this._turn.der + ' ➡ (' + d + ' m)', V.w / 2, Math.max((View.hudB || 50) + 86, 118), { size: 12, align: 'center', color: '#0a2342', bg: '#ffc93cee', pad: 5 });
      }
    };
  }

  /* =====================================================================
     B) LOS 6 MODOS EVOLUCIÓN 3.3 (TODOS CON BOT ACTIVO Y JUGABLES EN MENÚ + VALLE)
     ===================================================================== */
  if (!JE.modos || typeof ModeSub === 'undefined' || typeof MapMode === 'undefined') return;

  /* ---------- 1) 🏆 COPA DEL VALLE (Super Arcade Racing · Referente #1) ---------- */
  class ModeCopa extends MapMode {
    constructor(role, turno, opt) {
      super(role, turno, opt);
      const def = COPAS_DEF[(turno - 1) % COPAS_DEF.length] || COPAS_DEF[0];
      this.def = def;
      this.clock = [9 * 60, 15 * 60, 17 * 60 + 20][(turno - 1) % 3] || 540;
      this.limit = 160;
      this.laps = def.laps || 2;
      this.lap = 1;
      this.cpIdx = 0;
      this.rebufoT = 0;
      this.rebufos = 0;
      this.sim = new StationSim(this.rng, { demand: .5 });
      /* Resolver cada vértice del circuito al punto abierto real más cercano sobre JE.map */
      this.wps = def.pts.map(([lat, lon]) => {
        const g = geoP(lat, lon);
        const o = JE.map.nearestOpen ? JE.map.nearestOpen(Math.floor(g.x / TS), Math.floor(g.y / TS), false) : { x: Math.floor(g.x / TS), y: Math.floor(g.y / TS) };
        return { x: o.x * TS + TS / 2, y: o.y * TS + TS / 2 };
      });
      const p0 = this.wps[0], p1 = this.wps[1];
      const a0 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      this.setupRide({ sim: this.sim, start: { x: p0.x, y: p0.y, a: a0 }, traffic: 10 });
      this.ride.p.a = a0;
      /* 3 rivales arcade sobre las mismas calles */
      const names = ['Mateo (Sprint)', 'Valeria (Laureles)', 'Sebas (Río)'];
      const cols = ['#ff5a36', '#56c7ff', '#ffc93c'];
      this.rivals = names.map((nm, i) => ({
        id: i + 1, name: nm, shirt: cols[i],
        x: p0.x + Math.cos(a0) * (10 + i * 7), y: p0.y + Math.sin(a0) * (10 + i * 7),
        a: a0, wp: 1, lap: 1, done: false, spd: .78 + i * .06 + (turno - 1) * .04
      }));
      this.ride.opps = this.rivals;
      this.placeCp();
      this.goal('Completa las ' + this.laps + ' vueltas de ' + def.n, true, () => this.lap > this.laps, () => 'Vuelta ' + Math.min(this.lap, this.laps) + '/' + this.laps);
      this.goal('Termina en el podio (1.° o 2.°)', false, () => this.pos() <= 2, () => this.pos() + '.° lugar');
      this.goal('Aprovecha 1 rebufo (drafting)', false, () => this.rebufos >= 1, () => this.rebufos + ' rebufos');
      this.coach = '🏆 ' + def.n + ': sigue los chevrons verdes y pégate detrás de un rival para ganar ¡Rebufo!';
    }
    pos() {
      const myProg = (this.lap - 1) * this.wps.length + this.cpIdx;
      let p = 1;
      for (const r of this.rivals) {
        const rp = (r.lap - 1) * this.wps.length + (r.wp === 0 ? this.wps.length : r.wp - 1);
        if (r.done || rp > myProg) p++;
      }
      return p;
    }
    placeCp() {
      this.ride.markers = [];
      const idx = (this.cpIdx + 1) % this.wps.length;
      const wp = this.wps[idx];
      const esMeta = idx === 0;
      this.ride.target = this.ride.marker({
        x: wp.x, y: wp.y, r: 26 * WK, col: esMeta ? '#ff2fb3' : '#9bd341',
        label: esMeta ? '🏁 Meta Vuelta ' + this.lap : '⏩ Vértice ' + idx,
        enter: () => this.hitCp()
      });
    }
    hitCp() {
      this.cpIdx++;
      this.score += 30;
      Snd.sfx('coin');
      if (this.cpIdx >= this.wps.length) {
        this.cpIdx = 0; this.lap++;
        if (this.lap > this.laps) {
          const p = this.pos();
          this.score += p === 1 ? 160 : p === 2 ? 100 : 50;
          this.ride.stamp = { t: 2.2, title: p === 1 ? '🏆 ¡CAMPEÓN!' : '🏁 ' + p + '.° LUGAR', sub: this.def.n + ' · ' + this.t.toFixed(1) + ' s', bg: p === 1 ? PAL.vd : PAL.amb };
          Snd.sfx(p <= 2 ? 'win' : 'ok');
          if (JE.rpg && JE.rpg.guardarCopa) JE.rpg.guardarCopa(this.def.id, this.t, p);
          if (JE.diario && JE.diario.anotar) JE.diario.anotar('Copa del Valle (' + this.def.n + '): ' + p + '.° en ' + this.t.toFixed(1) + ' s', '🏆');
          this.endT = 1.6;
          this.ride.markers = []; this.ride.target = null;
          return;
        }
        this.ride.stamp = { t: 1.3, title: 'VUELTA ' + this.lap + ' DE ' + this.laps, sub: '¡A fondo por el vértice!', bg: PAL.amb };
        Snd.sfx('star');
      }
      this.placeCp();
    }
    tick(dt) {
      const P = this.ride.p;
      /* Mover rivales siguiendo los mismos vértices y detectar rebufo (slipstream) */
      let drafting = false;
      for (const r of this.rivals) {
        if (r.done) continue;
        const w = this.wps[r.wp % this.wps.length];
        const d0 = dist(r.x, r.y, w.x, w.y);
        const ta = Math.atan2(w.y - r.y, w.x - r.x);
        r.a += clamp(angDiff(r.a, ta), -5.5 * dt, 5.5 * dt);
        const v = 56 * WK * r.spd;
        r.x += Math.cos(r.a) * v * dt; r.y += Math.sin(r.a) * v * dt;
        if (d0 < 26 * WK) {
          r.wp++;
          if (r.wp > this.wps.length) { r.wp = 1; r.lap++; if (r.lap > this.laps) r.done = true; }
        }
        /* Rebufo si el jugador va 6–34 px detrás del rival con rumbo parecido */
        const dp = dist(P.x, P.y, r.x, r.y);
        if (dp > 6 && dp < 36 * WK && P.v > 24) {
          const toR = Math.atan2(r.y - P.y, r.x - P.x);
          if (Math.abs(angDiff(P.a, toR)) < .45) drafting = true;
        }
      }
      if (drafting) {
        this.rebufoT += dt;
        P.v = Math.min(this.ride.stats_().max * 1.24, P.v + 38 * dt);
        if (this.rebufoT > .55) {
          this.rebufoT = 0; this.rebufos++; this.score += 15;
          this.ride.float('💨 ¡REBUFO! +15', '#56c7ff'); Snd.sfx('coin');
        }
      } else this.rebufoT = Math.max(0, this.rebufoT - dt * .5);
      if (this.endT != null) { this.endT -= dt; if (this.endT <= 0) this.end(); }
      else if (this.t > this.limit) { this.end(); }
    }
    hud2(V) {
      /* Chevrons luminosos estilo Super Arcade Racing hacia el siguiente vértice */
      const T = this.ride.target;
      if (T && !this.ride.big) {
        const c = V.ctx, P = this.ride.p, ang = Math.atan2(T.y - P.y, T.x - P.x);
        const phase = (this.t * 3) % 1;
        c.save(); c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
        for (let k = 1; k <= 3; k++) {
          const d = (k + phase) * 22;
          const q = this.ride.w2s(P.x + Math.cos(ang) * d, P.y + Math.sin(ang) * d);
          if (q.x < 10 || q.x > V.w - 10 || q.y < 40 || q.y > V.h - 40) continue;
          c.save(); c.translate(q.x, q.y); c.rotate(ang);
          c.strokeStyle = 'rgba(155,211,65,' + (0.95 - k * .22) + ')'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(-5, -6); c.lineTo(4, 0); c.lineTo(-5, 6); c.stroke();
          c.restore();
        }
        c.restore();
      }
      V.text('🏆 ' + this.def.n + ' · Vuelta ' + Math.min(this.lap, this.laps) + '/' + this.laps + ' · ' + this.pos() + '.° · ' + this.t.toFixed(1) + ' s', 10, V.h - 20, { size: 12.5, color: '#ffc93c', bg: '#0a2342dd', pad: 4, body: true });
    }
    info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: '🏆 ' + this.pos() + '.°' }, { t: 'V' + Math.min(this.lap, this.laps) + '/' + this.laps }] }; }
    bot() { this.botDrive(); }
  }
  JE.modos.registrar({ id: 'copa', name: 'Copa del Valle', cls: ModeCopa, emoji: '🏆', icon: 'estrella',
    niveles: ['Circuito Laureles', 'Sprint Ciudad del Río', 'Circuito Atanasio'],
    desc: 'Carreras callejeras arcade (estilo Super Arcade Racing) sobre calles reales de Medellín con rivales IA y rebufo.',
    how: ['Sigue los chevrons verdes hacia cada vértice del circuito.', 'Pégate detrás de un rival para activar ¡Rebufo! y adelantar.', 'Completa las vueltas en el podio y rompe tu récord.'] });

  /* ---------- 2) 🍔 DOMICILIO SOSTENIBLE CONTRARRELOJ (Crazy Taxi / Parcel Corps / #DRIVE) ---------- */
  const PEDIDOS = [
    ['🍲 Bandeja Paisa', 'Restaurante El Rancherito'], ['🫓 Arepa con Quesito', 'Esquina de Laureles'],
    ['☕ Café de Origen', 'Tostadora Ciudad del Río'], ['🍩 Buñuelos Calientes', 'Panadería del Parque'],
    ['🥗 Ensalada de Frutas', 'Mercado del Río'], ['🥟 Empanadas de Iglesia', 'Parque Envigado']
  ];
  class ModeDomicilio extends MapMode {
    constructor(role, turno, opt) {
      super(role, turno, opt);
      this.clock = [12 * 60 + 15, 13 * 60 + 30, 19 * 60][(turno - 1) % 3] || 735;
      this.meta = [3, 5, 7][(turno - 1) % 3] || 3;
      this.entregados = 0;
      this.racha = 0;
      this.tiempo = [55, 65, 75][(turno - 1) % 3] || 55;
      this.sim = new StationSim(this.rng, { demand: .6 });
      const st0 = this.rng.pick(JE.map.stations.filter(s => s.zone === 'centro') || JE.map.stations);
      this.setupRide({ sim: this.sim, start: { x: st0.x, y: st0.y }, traffic: 14 });
      this.fase = 'recoger';
      this.nuevoPedido();
      this.goal('Entrega ' + this.meta + ' domicilios calientes', true, () => this.entregados >= this.meta, () => this.entregados + '/' + this.meta);
      this.goal('Mantén la comida intacta (≤1 golpe)', false, () => this.ride.stats.crashes <= 1, () => this.ride.stats.crashes + ' golpes');
      this.coach = '🍔 Domicilio Sostenible en bici: recoge el pedido y entrégalo antes de que se enfríe.';
    }
    nuevoPedido() {
      const P = this.ride.p;
      this.pedido = this.rng.pick(PEDIDOS);
      const cand = JE.map.stations.filter(s => { const d = dist(s.x, s.y, P.x, P.y); return d > 95 && d < 360; });
      const dst = cand.length ? this.rng.pick(cand) : JE.map.stations.filter(s => dist(s.x, s.y, P.x, P.y) > 70).sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y))[0] || JE.map.stations[0];
      this.fase = 'entregar';
      this.ride.markers = [];
      this.ride.target = this.ride.marker({
        x: dst.x, y: dst.y, r: 22 * WK, col: '#ff8a3d',
        label: this.pedido[0] + ' → ' + dst.name,
        enter: () => {
          this.entregados++; this.racha++;
          const bono = 45 + this.racha * 12;
          this.score += bono; this.tiempo = Math.min(90, this.tiempo + 18);
          this.ride.stamp = { t: 1.5, title: '¡ENTREGADO! +' + bono, sub: this.pedido[0] + ' · +18 s', bg: PAL.vd };
          Snd.sfx('win');
          if (this.entregados >= this.meta) {
            if (JE.diario && JE.diario.anotar) JE.diario.anotar('Domicilio Sostenible: ' + this.entregados + ' entregas en bici', '🍔');
            this.endT = 1.4; this.ride.markers = []; this.ride.target = null;
          } else this.nuevoPedido();
        }
      });
    }
    tick(dt) {
      if (this.endT != null) { this.endT -= dt; if (this.endT <= 0) this.end(); return; }
      this.tiempo -= dt;
      /* Recompensa por avance fluido para sensación arcade inmediata */
      if (this.ride.p.v > 25) this.score += dt * 1.5;
      if (this.tiempo <= 0) { JE.ui && JE.ui.toast('⏱️ Se acabó el tiempo de entrega'); this.end(); }
    }
    hud2(V) {
      const T = this.ride.target;
      if (T && !this.ride.big) {
        const ang = Math.atan2(T.y - this.ride.p.y, T.x - this.ride.p.x);
        const c = V.ctx; c.save(); c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
        c.translate(V.w / 2, (View.top || 54) + 34); c.rotate(ang);
        c.fillStyle = '#ff8a3d'; c.strokeStyle = '#0a2342'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(18, 0); c.lineTo(-10, -11); c.lineTo(-4, 0); c.lineTo(-10, 11); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
      V.text('🍔 ' + this.pedido[0] + ' · ' + this.entregados + '/' + this.meta + ' · ⏱️ ' + Math.ceil(this.tiempo) + ' s', 10, V.h - 20, { size: 12.5, color: this.tiempo < 12 ? '#ff6b6b' : '#ffc93c', bg: '#0a2342dd', pad: 4, body: true });
    }
    info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: '🍔 ' + this.entregados + '/' + this.meta }, { t: '⏱️ ' + Math.ceil(this.tiempo) + 's' }] }; }
    bot() { this.botDrive(); }
  }
  JE.modos.registrar({ id: 'domicilio', name: 'Domicilio Sostenible', cls: ModeDomicilio, emoji: '🍔', icon: 'usuario',
    niveles: ['Almuerzo Centro (3)', 'Ruta Laureles (5)', 'Cena Hora Pico (7)'],
    desc: 'Entregas contrarreloj en bici (estilo Crazy Taxi / Parcel Corps): sigue la flecha gigante y suma segundos por cada entrega.',
    how: ['Sigue la flecha naranja gigante hacia el cliente.', 'Cada entrega a tiempo suma +18 s al reloj y multiplica tu racha.', 'Evita golpes para mantener el pedido perfecto.'] });

  /* ---------- 3) 📡 MONITOREO 911 DEL VALLE (911 Operator / CityRT) ---------- */
  const UNID_911 = [
    { id: 'camion', ic: '🚚', n: 'Balance', col: '#9bd341' },
    { id: 'tecnico', ic: '🛠️', n: 'Técnico', col: '#56c7ff' },
    { id: 'anfitrion', ic: '🧑‍💼', n: 'Anfitrión', col: '#ffc93c' },
    { id: 'agente', ic: '🚦', n: 'Tránsito', col: '#ff8a3d' }
  ];
  const INC_911 = [
    { k: 'camion', t: 'Estación saturada' }, { k: 'tecnico', t: 'Tótem sin señal' },
    { k: 'anfitrion', t: 'Fila de usuarios' }, { k: 'agente', t: 'Cruce Metroplús' }
  ];
  const SECT_911 = [
    { n: 'Bello', x: .52, y: .16 }, { n: 'Carabobo', x: .50, y: .30 },
    { n: 'Estadio', x: .26, y: .42 }, { n: 'Centro', x: .54, y: .48 },
    { n: 'Laureles', x: .24, y: .58 }, { n: 'Poblado', x: .72, y: .68 },
    { n: 'Envigado', x: .62, y: .82 }, { n: 'Belén', x: .28, y: .74 }
  ];
  class MGMonitoreo911 extends MG {
    constructor(parent, o = {}) {
      super(parent, o);
      this.dur = o.dur || 45;
      this.meta = o.meta || 6;
      this.resueltos = 0;
      this.perdidos = 0;
      this.sel = 0;
      this.incs = [];
      this.units = UNID_911.map((u, i) => Object.assign({}, u, { x: .35 + i * .1, y: .52, busy: null, tx: .5, ty: .5 }));
      this.spawnT = .3;
      this.spawnInc();
      this.spawnInc();
    }
    spawnInc() {
      if (this.incs.length >= 4) return;
      const s = this.rng.pick(SECT_911), tip = this.rng.pick(INC_911);
      this.incs.push({ id: this.rng.i(1, 99999), sec: s.n, x: s.x, y: s.y, k: tip.k, t: tip.t, ttl: 16, maxT: 16, assigned: false });
    }
    dispatch(inc, unit) {
      if (!inc || !unit || unit.busy) return false;
      inc.assigned = true;
      unit.busy = inc;
      unit.tx = inc.x; unit.ty = inc.y;
      Snd.sfx('tap');
      return true;
    }
    update(dt) {
      this.t += dt;
      if (this.done) return;
      this.spawnT -= dt;
      if (this.spawnT <= 0) { this.spawnInc(); this.spawnT = 3.2; }
      for (const u of this.units) {
        if (!u.busy) continue;
        const dx = u.tx - u.x, dy = u.ty - u.y, d = Math.hypot(dx, dy);
        if (d < .025) {
          const okMatch = u.id === u.busy.k;
          this.resueltos++;
          this.score += okMatch ? 35 : 15;
          Snd.sfx(okMatch ? 'win' : 'ok');
          this.incs = this.incs.filter(x => x !== u.busy);
          u.busy = null;
        } else {
          u.x += (dx / d) * .28 * dt; u.y += (dy / d) * .28 * dt;
        }
      }
      for (let i = this.incs.length - 1; i >= 0; i--) {
        const inc = this.incs[i];
        if (!inc.assigned) inc.ttl -= dt;
        if (inc.ttl <= 0) { this.perdidos++; this.incs.splice(i, 1); Snd.sfx('bad'); }
      }
      if (this.t >= this.dur || this.resueltos >= this.meta + 4) this.done = true;
    }
    render(V) { V.b.fillStyle = '#07172d'; V.b.fillRect(0, 0, V.vw, V.vh); }
    hud(V) {
      this.btns = [];
      const c = V.ctx, W = V.w, H = V.h;
      const top = Math.max((View.hudB || 50) + 52, 128), bot = H - 86, mh = Math.max(140, bot - top);
      c.fillStyle = '#07172d'; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#1b4978'; c.lineWidth = 8;
      c.beginPath(); c.moveTo(W * .54, top); c.bezierCurveTo(W * .48, top + mh * .4, W * .58, top + mh * .7, W * .50, bot); c.stroke();
      c.strokeStyle = '#9bd34155'; c.lineWidth = 2; c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(W * .52, top + mh * .12); c.lineTo(W * .54, top + mh * .86); c.stroke();
      c.beginPath(); c.moveTo(W * .22, top + mh * .44); c.lineTo(W * .54, top + mh * .48); c.stroke();
      c.setLineDash([]);
      for (const s of SECT_911) {
        const sx = W * s.x, sy = top + mh * s.y;
        c.fillStyle = '#123159'; c.beginPath(); c.arc(sx, sy, 14, 0, TAU); c.fill();
        V.text(s.n, sx, sy + 20, { size: 10, align: 'center', color: '#9cc0e6' });
      }
      for (const u of this.units) {
        const ux = W * u.x, uy = top + mh * u.y;
        if (u.busy) {
          c.strokeStyle = u.col; c.lineWidth = 2.5; c.setLineDash([4, 4]);
          c.beginPath(); c.moveTo(ux, uy); c.lineTo(W * u.tx, top + mh * u.ty); c.stroke(); c.setLineDash([]);
        }
        c.fillStyle = u.col; c.beginPath(); c.arc(ux, uy, 11, 0, TAU); c.fill();
        V.text(u.ic, ux, uy + 4, { size: 12, align: 'center' });
      }
      this._incHits = [];
      for (const inc of this.incs) {
        const ix = W * inc.x, iy = top + mh * inc.y;
        const uDef = UNID_911.find(u => u.id === inc.k) || UNID_911[0];
        this._incHits.push({ x: ix, y: iy, r: 28, inc });
        c.strokeStyle = inc.assigned ? '#9bd341' : '#ff5a36'; c.lineWidth = 3;
        c.beginPath(); c.arc(ix, iy, 18, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, inc.ttl / inc.maxT)); c.stroke();
        c.fillStyle = '#0a2342ee'; c.beginPath(); c.arc(ix, iy, 15, 0, TAU); c.fill();
        V.text(uDef.ic, ix, iy + 5, { size: 14, align: 'center' });
        V.text(inc.t, ix, iy - 22, { size: 10, align: 'center', color: '#fff', bg: '#0a2342dd', pad: 2 });
      }
      this._uHits = [];
      const bw = Math.min(92, (W - 28) / 4);
      this.units.forEach((u, i) => {
        const bx = (W - bw * 4 - 12) / 2 + i * (bw + 4), by = H - 72;
        this._uHits.push({ x: bx, y: by, w: bw, h: 58, i });
        c.fillStyle = i === this.sel ? '#1e4e84' : '#0f2747';
        c.strokeStyle = u.busy ? '#64748b' : (i === this.sel ? u.col : '#2a4c7a'); c.lineWidth = 2;
        c.beginPath(); c.roundRect(bx, by, bw, 58, 10); c.fill(); c.stroke();
        V.text(u.ic + ' ' + u.n, bx + bw / 2, by + 24, { size: 11, align: 'center', color: '#fff' });
        V.text(u.busy ? 'En ruta…' : 'Libre', bx + bw / 2, by + 44, { size: 10, align: 'center', color: u.busy ? '#ffc93c' : '#9bd341' });
      });
      V.text('📡 911 Valle · Resueltos ' + this.resueltos + '/' + this.meta + ' · ⏱️ ' + Math.max(0, Math.ceil(this.dur - this.t)) + 's', W / 2, top - 6, { size: 12, align: 'center', color: '#c4ec7c', bg: '#0a2342dd', pad: 4 });
    }
    pointer(kind, x, y, sx, sy) {
      if (kind !== 'down') return;
      for (const b of this._uHits || []) {
        if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) { this.sel = b.i; Snd.sfx('tap'); return; }
      }
      for (const h of this._incHits || []) {
        if (Math.hypot(sx - h.x, sy - h.y) <= h.r && !h.inc.assigned) {
          const chosen = !this.units[this.sel].busy ? this.units[this.sel] : this.units.find(u => !u.busy && u.id === h.inc.k) || this.units.find(u => !u.busy);
          if (chosen) this.dispatch(h.inc, chosen);
          return;
        }
      }
    }
    bot() {
      const inc = this.incs.find(x => !x.assigned);
      if (!inc) return;
      const u = this.units.find(q => !q.busy && q.id === inc.k) || this.units.find(q => !q.busy);
      if (u) this.dispatch(inc, u);
    }
  }
  JE.MGMonitoreo911 = MGMonitoreo911;
  class ModoMonitoreo911 extends ModeSub {
    constructor(role, turno, opt) {
      super(role, turno, opt);
      const cfg = [[40, 5], [48, 8], [55, 11]][turno - 1] || [40, 5];
      this.clock = [8 * 60, 13 * 60, 18 * 60][turno - 1] || 480;
      this.sub = new MGMonitoreo911(this, { dur: cfg[0], meta: cfg[1] });
      this.view = this.sub.view;
      this.goal('Atiende ' + cfg[1] + ' incidentes del Valle', true, () => (this.sub.resueltos | 0) >= cfg[1], () => (this.sub.resueltos | 0) + '/' + cfg[1]);
      this.goal('Máximo 1 incidente vencido', false, () => (this.sub.perdidos | 0) <= 1, () => (this.sub.perdidos | 0) + ' perdidos');
    }
  }
  JE.modos.registrar({ id: 'monitoreo911', name: 'Monitoreo 911', cls: ModoMonitoreo911, emoji: '📡', icon: 'monitoreo',
    niveles: ['Mañana Tranquila', 'Mediodía Activo', 'Hora Pico 911'],
    desc: 'Despacha camiones, técnicos, anfitriones y agentes en tiempo real sobre Medellín (estilo 911 Operator / CityRT).',
    how: ['Elige la unidad correcta abajo y toca el incidente en el mapa.', 'Cada ícono indica qué unidad resuelve mejor la novedad.', 'Atiende los reportes antes de que se agote su anillo rojo.'] });

  /* ---------- 4) 🏙️ EL PLANEADOR DEL VALLE (Cities: Skylines / Townscaper) ---------- */
  const OBRAS_PL = [
    { id: 'estacion', ic: '🚲', n: 'Estación', cost: 25, cob: 18, aire: 8, col: '#9bd341' },
    { id: 'ciclo', ic: '🟢', n: 'Ciclorruta', cost: 20, cob: 14, aire: 12, col: '#56c7ff' },
    { id: 'solar', ic: '☀️', n: 'Tótem Solar', cost: 15, cob: 9, aire: 14, col: '#ffc93c' },
    { id: 'parque', ic: '🌳', n: 'Guayacán', cost: 10, cob: 6, aire: 16, col: '#f2c230' }
  ];
  class MGPlaneador extends MG {
    constructor(parent, o = {}) {
      super(parent, o);
      this.presupuesto = o.presupuesto || 120;
      this.metaCob = o.metaCob || 75;
      this.sel = 0;
      this.cob = 12;
      this.aire = 20;
      this.nodos = SECT_911.map(s => ({ n: s.n, x: s.x, y: s.y, obra: null }));
    }
    colocar(nodo) {
      const ob = OBRAS_PL[this.sel];
      if (!nodo || nodo.obra || this.presupuesto < ob.cost) return false;
      nodo.obra = ob;
      this.presupuesto -= ob.cost;
      const vecinos = this.nodos.filter(q => q !== nodo && q.obra && Math.hypot(q.x - nodo.x, q.y - nodo.y) < .35).length;
      const bonoCob = ob.cob + vecinos * 5;
      const bonoAire = ob.aire + vecinos * 3;
      this.cob = Math.min(100, this.cob + bonoCob);
      this.aire = Math.min(100, this.aire + bonoAire);
      this.score += bonoCob + bonoAire;
      Snd.sfx(vecinos ? 'star' : 'coin');
      if (this.cob >= this.metaCob || this.nodos.every(q => q.obra) || this.presupuesto < 10) this.done = true;
      return true;
    }
    update(dt) { this.t += dt; }
    render(V) { V.b.fillStyle = '#0d2238'; V.b.fillRect(0, 0, V.vw, V.vh); }
    hud(V) {
      this.btns = [];
      const c = V.ctx, W = V.w, H = V.h;
      const top = Math.max((View.hudB || 50) + 52, 128), bot = H - 86, mh = Math.max(140, bot - top);
      c.fillStyle = '#0d2238'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < this.nodos.length; i++) for (let j = i + 1; j < this.nodos.length; j++) {
        const a = this.nodos[i], b = this.nodos[j];
        if (a.obra && b.obra && Math.hypot(a.x - b.x, a.y - b.y) < .35) {
          c.strokeStyle = '#9bd34188'; c.lineWidth = 4;
          c.beginPath(); c.moveTo(W * a.x, top + mh * a.y); c.lineTo(W * b.x, top + mh * b.y); c.stroke();
        }
      }
      this._hits = [];
      for (const nd of this.nodos) {
        const nx = W * nd.x, ny = top + mh * nd.y;
        this._hits.push({ x: nx, y: ny, r: 28, nd });
        c.fillStyle = nd.obra ? nd.obra.col : '#183a5f';
        c.strokeStyle = nd.obra ? '#ffffff' : '#56c7ff88'; c.lineWidth = 2;
        c.beginPath(); c.arc(nx, ny, 19, 0, TAU); c.fill(); c.stroke();
        V.text(nd.obra ? nd.obra.ic : '+', nx, ny + 6, { size: 16, align: 'center', color: nd.obra ? '#0a2342' : '#c4ec7c' });
        V.text(nd.n, nx, ny + 29, { size: 10.5, align: 'center', color: '#e8f5d0' });
      }
      this._bHits = [];
      const bw = Math.min(92, (W - 28) / 4);
      OBRAS_PL.forEach((ob, i) => {
        const bx = (W - bw * 4 - 12) / 2 + i * (bw + 4), by = H - 72;
        this._bHits.push({ x: bx, y: by, w: bw, h: 58, i });
        c.fillStyle = i === this.sel ? '#1e4e84' : '#0f2747';
        c.strokeStyle = i === this.sel ? ob.col : '#2a4c7a'; c.lineWidth = 2;
        c.beginPath(); c.roundRect(bx, by, bw, 58, 10); c.fill(); c.stroke();
        V.text(ob.ic + ' ' + ob.n, bx + bw / 2, by + 24, { size: 10.5, align: 'center', color: '#fff' });
        V.text(ob.cost + ' 🍃', bx + bw / 2, by + 44, { size: 11, align: 'center', color: this.presupuesto >= ob.cost ? '#ffc93c' : '#ff6b6b' });
      });
      V.text('🏙️ Cobertura ' + this.cob + '% / ' + this.metaCob + '% · 🌿 Aire ' + this.aire + '% · 🍃 ' + this.presupuesto, W / 2, top - 6, { size: 11.5, align: 'center', color: '#c4ec7c', bg: '#0a2342dd', pad: 4 });
    }
    pointer(kind, x, y, sx, sy) {
      if (kind !== 'down') return;
      for (const b of this._bHits || []) {
        if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) { this.sel = b.i; Snd.sfx('tap'); return; }
      }
      for (const h of this._hits || []) {
        if (Math.hypot(sx - h.x, sy - h.y) <= h.r) { this.colocar(h.nd); return; }
      }
    }
    bot() {
      const libre = this.nodos.find(n => !n.obra);
      if (!libre) return;
      this.sel = this.presupuesto >= 25 ? 0 : this.presupuesto >= 20 ? 1 : this.presupuesto >= 15 ? 2 : 3;
      this.colocar(libre);
    }
  }
  JE.MGPlaneador = MGPlaneador;
  class ModoPlaneador extends ModeSub {
    constructor(role, turno, opt) {
      super(role, turno, opt);
      const cfg = [[110, 65], [130, 80], [145, 92]][turno - 1] || [110, 65];
      this.clock = 600;
      this.sub = new MGPlaneador(this, { presupuesto: cfg[0], metaCob: cfg[1] });
      this.view = this.sub.view;
      this.goal('Alcanza ' + cfg[1] + ' % de cobertura ciclista', true, () => (this.sub.cob | 0) >= cfg[1], () => (this.sub.cob | 0) + '%/' + cfg[1] + '%');
      this.goal('Eleva la calidad del aire a 65 %+', false, () => (this.sub.aire | 0) >= 65, () => (this.sub.aire | 0) + '%');
    }
  }
  JE.modos.registrar({ id: 'planeador', name: 'El Planeador', cls: ModoPlaneador, emoji: '🏙️', icon: 'mapa',
    niveles: ['Plan Centro', 'Red Metropolitana', 'Valle Sostenible'],
    desc: 'Diseña la red de movilidad del Valle (Cities: Skylines / Townscaper): conecta estaciones, ciclorrutas y guayacanes.',
    how: ['Elige una obra abajo y toca un sector del mapa para construirla.', 'Conectar sectores vecinos da bonos extra de red y aire limpio.', 'Alcanza la meta de cobertura antes de agotar el presupuesto.'] });

  /* ---------- 5) 🚇 METRO 2D LATERAL (Tiny Rails / TrainChu) ---------- */
  const EST_LINEA_A = ['Niquía', 'Bello', 'Madera', 'Acevedo', 'Tricentenario', 'Caribe', 'Universidad', 'Hospital', 'Prado', 'Parque Berrío', 'San Antonio', 'Alpujarra', 'Exposiciones', 'Industriales', 'Poblado', 'Aguacatala', 'Ayurá', 'Envigado', 'Itagüí', 'Sabaneta', 'La Estrella'];
  class MGMetro2D extends MG {
    constructor(parent, o = {}) {
      super(parent, o);
      const ini = o.ini || 0, n = o.tramos || 5;
      this.est = EST_LINEA_A.slice(ini, ini + n + 1);
      this.idx = 0;
      this.pos = 0;
      this.spd = 14;
      this.th = 1;
      this.pasajeros = 24;
      this.paradasOk = 0;
      this.espera = 0;
      this.distEst = 240;
      this.aviso = '▶ Acelera entre estaciones y frena suave sobre el andén';
    }
    update(dt) {
      this.t += dt;
      if (this.done) return;
      if (this.espera > 0) {
        this.espera -= dt;
        if (this.espera <= 0) {
          this.idx++;
          if (this.idx >= this.est.length - 1) { this.score += 60; this.done = true; return; }
          this.pos = 0; this.th = 1;
        }
        return;
      }
      if (this.th > 0) this.spd = Math.min(58, this.spd + 22 * dt);
      else if (this.th < 0) this.spd = Math.max(0, this.spd - 38 * dt);
      else this.spd = Math.max(0, this.spd - 6 * dt);
      this.pos += this.spd * dt;
      this.score += this.spd * dt * .08;
      const falta = this.distEst - this.pos;
      if (Math.abs(falta) < 26 && this.spd < 4) {
        this.paradasOk++;
        const suben = 12 + this.rng.i(0, 14);
        this.pasajeros += suben;
        this.score += 45;
        this.aviso = '✅ Parada perfecta en ' + this.est[this.idx + 1] + ' · +' + suben + ' viajeros';
        Snd.sfx('win');
        this.espera = 1.2;
      } else if (this.pos > this.distEst + 32) {
        this.aviso = '⚠️ Te pasaste el andén de ' + this.est[this.idx + 1] + ' (parada asistida)';
        this.spd = 0; this.espera = 1.1; Snd.sfx('bad');
      }
    }
    render(V) { V.b.fillStyle = '#1c4f82'; V.b.fillRect(0, 0, V.vw, V.vh); }
    hud(V) {
      this.btns = [];
      const c = V.ctx, W = V.w, H = V.h;
      const g = c.createLinearGradient(0, 0, 0, H * .72);
      g.addColorStop(0, '#1c4f82'); g.addColorStop(.65, '#f2a359'); g.addColorStop(1, '#fde0a6');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      const off = (this.idx * this.distEst + this.pos) * .5;
      c.fillStyle = '#2d4e5e';
      c.beginPath(); c.moveTo(0, H * .66);
      for (let x = 0; x <= W + 40; x += 32) {
        const y = H * .50 - Math.sin((x + off * .35) * .014) * 28 - Math.cos((x + off * .2) * .031) * 14;
        c.lineTo(x, y);
      }
      c.lineTo(W, H * .72); c.lineTo(0, H * .72); c.closePath(); c.fill();
      if (JE.capas) JE.capas.dibujar(c, 'lineaA', off, W, H); /* K-2: 4 capas; fallback previo */
      const vy = Math.round(H * .68);
      c.fillStyle = '#475569'; c.fillRect(0, vy, W, 18);
      c.fillStyle = '#334155';
      for (let x = -(off * 2 % 70); x < W + 70; x += 70) c.fillRect(x, vy + 18, 14, H - vy);
      const falta = this.distEst - this.pos, ax = W * .35 + falta * 2.4;
      if (ax > -120 && ax < W + 140) {
        c.fillStyle = '#0a2342'; c.fillRect(ax - 55, vy - 54, 110, 12);
        c.fillStyle = '#9bd341'; c.fillRect(ax - 55, vy - 42, 110, 4);
        c.fillStyle = '#cbd5e1'; c.fillRect(ax - 50, vy - 4, 100, 6);
        V.text('🚇 ' + (this.est[this.idx + 1] || ''), ax, vy - 60, { size: 11, align: 'center', color: '#fff', bg: '#0a2342ee', pad: 3 });
      }
      const tx = W * .35;
      for (let k = 0; k < 3; k++) {
        const vx = tx - k * 54 - 22;
        c.fillStyle = '#f1f5f9'; c.fillRect(vx, vy - 26, 50, 24);
        c.fillStyle = '#9bd341'; c.fillRect(vx, vy - 11, 50, 6);
        c.fillStyle = '#1e293b';
        for (let w = 0; w < 3; w++) c.fillRect(vx + 6 + w * 14, vy - 22, 10, 8);
      }
      const by = H - 64;
      this._bFreno = { x: 18, y: by, w: W * .42, h: 48 };
      this._bAcel = { x: W - 18 - W * .42, y: by, w: W * .42, h: 48 };
      c.fillStyle = this.th < 0 ? '#ef4444' : '#0a2342e0'; c.strokeStyle = '#ff8a3d'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(this._bFreno.x, by, this._bFreno.w, 48, 12); c.fill(); c.stroke();
      V.text('🛑 FRENAR', this._bFreno.x + this._bFreno.w / 2, by + 29, { size: 13.5, align: 'center', color: '#fff' });
      c.fillStyle = this.th > 0 ? '#9bd341' : '#0a2342e0'; c.strokeStyle = '#9bd341';
      c.beginPath(); c.roundRect(this._bAcel.x, by, this._bAcel.w, 48, 12); c.fill(); c.stroke();
      V.text('▶ ACELERAR', this._bAcel.x + this._bAcel.w / 2, by + 29, { size: 13.5, align: 'center', color: this.th > 0 ? '#0a2342' : '#fff' });
      const top = Math.max((View.hudB || 50) + 52, 128);
      V.text('🚇 Línea A · Próxima: ' + (this.est[this.idx + 1] || 'Meta') + ' (' + Math.max(0, Math.round(falta)) + ' m) · ' + Math.round(this.spd * 1.4) + ' km/h', W / 2, top, { size: 12, align: 'center', color: '#c4ec7c', bg: '#0a2342dd', pad: 4 });
      V.text(this.aviso + ' · 👥 ' + this.pasajeros, W / 2, top + 24, { size: 11, align: 'center', color: '#fff', bg: '#0a2342aa', pad: 3 });
    }
    pointer(kind, x, y, sx, sy) {
      if (kind === 'up') { this.th = 0; return; }
      if (kind === 'down') {
        if (this._bFreno && sx <= View.w * .5) this.th = -1;
        else this.th = 1;
      }
    }
    key(e) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'Space') this.th = -1;
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') this.th = 1;
    }
    bot() {
      const falta = this.distEst - this.pos;
      this.th = falta < 55 ? -1 : 1;
    }
  }
  JE.MGMetro2D = MGMetro2D;
  class ModoMetro2D extends ModeSub {
    constructor(role, turno, opt) {
      super(role, turno, opt);
      const cfgs = [[0, 4], [7, 5], [14, 6]][turno - 1] || [0, 4];
      this.clock = [7 * 60, 14 * 60, 17 * 60 + 45][turno - 1] || 420;
      this.sub = new MGMetro2D(this, { ini: cfgs[0], tramos: cfgs[1] });
      this.view = this.sub.view;
      this.goal('Completa el recorrido de la Línea A', true, () => !!this.sub.done, () => this.sub.idx + '/' + (this.sub.est.length - 1));
      this.goal('Logra 2+ paradas precisas en andén', false, () => (this.sub.paradasOk | 0) >= 2, () => (this.sub.paradasOk | 0) + ' paradas');
    }
  }
  JE.modos.registrar({ id: 'metro2d', name: 'Metro 2D Lateral', cls: ModoMetro2D, emoji: '🚇', icon: 'supervisor',
    niveles: ['Norte (Niquía–Acevedo)', 'Centro (Hospital–Alpujarra)', 'Sur (Poblado–La Estrella)'],
    desc: 'Viaje lateral 2D contemplativo por la Línea A del Metro de Medellín (estilo Tiny Rails): frena exacto en cada andén.',
    how: ['Mantén ▶ Acelerar en los tramos rectos y 🛑 Frenar al acercarte al andén.', 'Detente bajo la cubierta verde para recoger viajeros.', 'Disfruta el paisaje de las montañas del Valle al atardecer.'] });

  /* ---------- 6) 🌅 BAJADA POR LAS PALMAS AL ATARDECER (Alto's Odyssey + Ley 1811) ---------- */
  class MGPalmas extends MG {
    constructor(parent, o = {}) {
      super(parent, o);
      this.metaM = o.metaM || 1400;
      this.distM = 0;
      this.spd = 13;
      this.y = 0;
      this.vy = 0;
      this.freno = false;
      this.brisas = 0;
      this.sustos = 0;
      this.objs = [];
      for (let d = 110; d < this.metaM - 60; d += 78) {
        const k = this.rng.f() < .42 ? 'brisa' : this.rng.f() < .55 ? 'resalto' : 'curva';
        this.objs.push({ d, k, done: false });
      }
    }
    saltar() {
      if (this.y <= .05) { this.vy = 9.2; if (Snd.vehSfx) Snd.vehSfx('bike', 'ollie'); }
    }
    update(dt) {
      this.t += dt;
      if (this.done) return;
      const acc = this.freno ? -14 : 6.5;
      this.spd = clamp(this.spd + acc * dt, 7, 25);
      this.distM += this.spd * dt;
      this.score += this.spd * dt * .2;
      this.vy -= 23 * dt;
      this.y = Math.max(0, this.y + this.vy * dt);
      if (this.y === 0 && this.vy < 0) this.vy = 0;
      for (const o of this.objs) {
        if (o.done || Math.abs(o.d - this.distM) > 6) continue;
        o.done = true;
        if (o.k === 'brisa') { this.brisas++; this.score += 20; this.spd = Math.min(26, this.spd + 3); Snd.sfx('coin'); }
        else if (o.k === 'resalto') {
          if (this.y > .45) { this.score += 25; Snd.sfx('star'); }
          else { this.sustos++; this.spd = Math.max(8, this.spd - 5); Snd.sfx('bad'); }
        } else if (o.k === 'curva') {
          if (this.spd <= 16.5 || this.freno) { this.score += 22; Snd.sfx('ok'); }
          else { this.sustos++; this.spd = 10; Snd.sfx('bad'); }
        }
      }
      if (this.distM >= this.metaM) { this.score += 80; this.done = true; }
    }
    render(V) { V.b.fillStyle = '#2a1f4d'; V.b.fillRect(0, 0, V.vw, V.vh); }
    hud(V) {
      this.btns = [];
      const c = V.ctx, W = V.w, H = V.h;
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#2a1f4d'); g.addColorStop(.42, '#c8553d'); g.addColorStop(.72, '#f7b267'); g.addColorStop(1, '#1a2634');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = '#ffe599'; c.beginPath(); c.arc(W * .76, H * .30, 32, 0, TAU); c.fill();
      c.fillStyle = '#3b2848';
      c.beginPath(); c.moveTo(0, H * .66);
      for (let x = 0; x <= W + 40; x += 28) c.lineTo(x, H * .50 - Math.sin((x + this.distM * .6) * .016) * 24);
      c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
      if (JE.capas) JE.capas.dibujar(c, 'palmas', this.distM, W, H); /* K-2 */
      const slopeY = x => H * .56 + (x / W) * H * .16;
      c.strokeStyle = '#334155'; c.lineWidth = 28;
      c.beginPath(); c.moveTo(-10, slopeY(-10)); c.lineTo(W + 10, slopeY(W + 10)); c.stroke();
      c.strokeStyle = '#ffc93c'; c.lineWidth = 2; c.setLineDash([12, 10]);
      c.beginPath(); c.moveTo(-10, slopeY(-10)); c.lineTo(W + 10, slopeY(W + 10)); c.stroke(); c.setLineDash([]);
      for (const o of this.objs) {
        if (o.done) continue;
        const rel = o.d - this.distM;
        if (rel < -20 || rel > 120) continue;
        const ox = W * .26 + rel * 3.8, oy = slopeY(ox);
        if (o.k === 'brisa') {
          c.strokeStyle = '#9bd341'; c.lineWidth = 3;
          c.beginPath(); c.arc(ox, oy - 24, 10, 0, TAU); c.stroke();
          V.text('🌬️', ox, oy - 20, { size: 13, align: 'center' });
        } else if (o.k === 'resalto') {
          c.fillStyle = '#ffc93c'; c.fillRect(ox - 10, oy - 6, 20, 7);
          V.text('⬆️', ox, oy - 16, { size: 11, align: 'center' });
        } else {
          V.text('⚠️ Curva · frena', ox, oy - 24, { size: 10.5, align: 'center', color: '#0a2342', bg: '#ffc93cee', pad: 3 });
        }
      }
      const px = W * .26, py = slopeY(px) - this.y * 28;
      c.save(); c.translate(px, py); c.rotate(.15);
      c.fillStyle = '#181c22'; c.beginPath(); c.arc(-10, -4, 6, 0, TAU); c.arc(10, -4, 6, 0, TAU); c.fill();
      c.strokeStyle = '#9bd341'; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -4); c.lineTo(0, -14); c.lineTo(10, -4); c.stroke();
      c.fillStyle = '#e8f5d0'; c.beginPath(); c.arc(2, -24, 5, 0, TAU); c.fill();
      c.restore();
      const by = H - 62;
      c.fillStyle = this.freno ? '#ef4444' : '#0a2342e0'; c.strokeStyle = '#ff8a3d'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(18, by, W * .42, 46, 12); c.fill(); c.stroke();
      V.text('🛑 FRENAR CURVA', 18 + W * .21, by + 28, { size: 12.5, align: 'center', color: '#fff' });
      c.fillStyle = '#9bd341'; c.strokeStyle = '#fff';
      c.beginPath(); c.roundRect(W - 18 - W * .42, by, W * .42, 46, 12); c.fill(); c.stroke();
      V.text('⬆️ SALTAR', W - 18 - W * .21, by + 28, { size: 12.5, align: 'center', color: '#0a2342' });
      const top = Math.max((View.hudB || 50) + 52, 128);
      V.text('🌅 Las Palmas · ' + Math.round(this.distM) + '/' + this.metaM + ' m · ' + Math.round(this.spd * 3.6) + ' km/h · Ley 1811 (1,5 m)', W / 2, top, { size: 11.5, align: 'center', color: '#ffe599', bg: '#0a2342dd', pad: 4 });
    }
    pointer(kind, x, y, sx, sy) {
      if (kind === 'up') { this.freno = false; return; }
      if (kind === 'down') {
        if (sx < View.w * .5) this.freno = true;
        else this.saltar();
      }
    }
    key(e) {
      if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') this.saltar();
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') this.freno = true;
    }
    bot() {
      const next = this.objs.find(o => !o.done && o.d > this.distM && o.d - this.distM < 28);
      this.freno = !!(next && next.k === 'curva' && this.spd > 15);
      if (next && next.k === 'resalto' && next.d - this.distM < 16) this.saltar();
    }
  }
  JE.MGPalmas = MGPalmas;
  class ModoPalmas extends ModeSub {
    constructor(role, turno, opt) {
      super(role, turno, opt);
      const metaM = [1100, 1500, 1900][turno - 1] || 1100;
      this.clock = 17 * 60 + 35;
      this.sub = new MGPalmas(this, { metaM });
      this.view = this.sub.view;
      this.goal('Llega a El Poblado desde Alto de Las Palmas', true, () => !!this.sub.done, () => Math.min(100, Math.round(100 * this.sub.distM / metaM)) + '%');
      this.goal('Bajada limpia (≤1 susto)', false, () => (this.sub.sustos | 0) <= 1, () => (this.sub.sustos | 0) + ' sustos');
    }
  }
  JE.modos.registrar({ id: 'palmas', name: 'Bajada Las Palmas', cls: ModoPalmas, emoji: '🌅', icon: 'usuario',
    niveles: ['Mirador Las Palmas', 'Descenso El Poblado', 'Atardecer Completo'],
    desc: 'Descenso lateral contemplativo al atardecer desde Las Palmas (estilo Alto\'s Odyssey + Ley 1811).',
    how: ['Toca derecha (o Espacio) para saltar resaltos.', 'Mantén izquierda para moderar antes de las curvas cerradas.', 'Atrapa las brisas verdes y disfruta la puesta de sol sobre Medellín.'] });
})();
