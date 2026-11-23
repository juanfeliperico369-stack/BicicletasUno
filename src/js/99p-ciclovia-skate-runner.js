/* =====================================================================
   CICLORRUTA ENDLESS RUNNER ADAPTADO + 5 ZONAS SKATE / BMX / PARKOUR (v2.2 · Ronda 3.0 · Gemini/Antigravity)
   Cumple el diseño del autor:
   1) El Endless Runner SOLO se activa sobre ciclorrutas reales (TT.CICLO / vías k === 5), con aviso
      contextual al rodar por una ciclorruta en Modo Libre.
   2) En el Runner: cambios direccionales en intersecciones (⬅ Izquierda · ⬆ Recto · ➡ Derecha),
      calles que cambian de anchas a estrechas, obstáculos urbanos y zonas de trucos (rampas,
      barandas de grind y bóvedas de parkour con combo multiplicador).
   3) 5 parques reales de Skate / BMX / Parkour integrados directamente en el mundo abierto
      (Ciudad del Río, Parques del Río, Atanasio Girardot, Bajo el Puente de la 4 Sur y
      Segundo Parque de Laureles), dibujados en el mismo mundo 3D/2D y jugables con bici,
      skate, patines, scooter o a pie (parkour).
   ===================================================================== */
(function () {
  /* ---------- 1) 5 zonas reales de Skate / BMX / Parkour en el Valle de Aburrá ---------- */
  const SKATE_DEF = [
    { id: 'ciudaddelrio', n: 'Skatepark Ciudad del Río', barrio: 'Ciudad del Río', lat: 6.2238, lon: -75.5747, col: '#ff8a3d', tipo: 'Skate & BMX', r: 34 },
    { id: 'parquesrio', n: 'Parques del Río · Parkour', barrio: 'Conquistadores', lat: 6.2458, lon: -75.5789, col: '#9bd341', tipo: 'Parkour & Rampas', r: 34 },
    { id: 'atanasio', n: 'Unidad Atanasio · Bowl & Rails', barrio: 'Estadio', lat: 6.2568, lon: -75.5902, col: '#56c7ff', tipo: 'BMX & Skate', r: 34 },
    { id: 'cuatrosur', n: 'Puente de la 4 Sur · Street', barrio: 'El Poblado', lat: 6.2055, lon: -75.5778, col: '#ffc93c', tipo: 'Street & Grinds', r: 34 },
    { id: 'laureles2', n: 'Segundo Parque de Laureles', barrio: 'Laureles', lat: 6.2442, lon: -75.5964, col: '#ff5a9d', tipo: 'Manuals & Parkour', r: 32 }
  ];

  const TRUCOS = {
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
          /* Elementos físicos dentro del parque: 2 rampas, 1 baranda (rail) y 1 bóveda parkour */
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
      const list = TRUCOS[P.veh] || TRUCOS.bike;
      const nombre = bonusNombre || list[Math.floor(Math.random() * list.length)];
      R._trCombo = (R._trT > 0 ? (R._trCombo | 0) + 1 : 1);
      R._trT = 3.2;
      const pts = (10 + Math.min(40, (R._trCombo - 1) * 8));
      M.score = (M.score | 0) + pts;
      const tag = (P.veh === 'walk' ? '🏃 ' : '🛹 ') + nombre + (R._trCombo > 1 ? ' ×' + R._trCombo : '') + ' +' + pts;
      for (const f of R.fx || []) if (f.k === 't') f.y -= 10;
      R.float(tag, R._trCombo >= 3 ? '#ff8a3d' : PAL.amb);
      if (Snd.vehSfx) Snd.vehSfx(P.veh === 'walk' ? 'skate' : P.veh, 'ollie');
      R.burst(P.x, P.y, R._trCombo >= 3 ? '#ffc93c' : '#9bd341', 7);
      if (JE.rpg && JE.rpg.ganarSkill) JE.rpg.ganarSkill('tecnica', 4 + R._trCombo * 2, nombre);
      return true;
    },
    /* Detecta si el jugador está sobre una ciclorruta real (TT.CICLO o cadena k === 5) */
    enCiclovia(R) {
      if (!R || !R.map) return false;
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

  /* Inicializar los 5 spots al arrancar el juego */
  const _start99p = Game.start;
  Game.start = function () {
    Skate.init();
    return _start99p.apply(this, arguments);
  };

  /* Dibujar los 5 parques de Skate / Parkour en el suelo del mismo mundo 3D/2D */
  const _drawG99p = Ride.prototype.drawGround;
  Ride.prototype.drawGround = function (c, ox, oy, inV) {
    _drawG99p.call(this, c, ox, oy, inV);
    if (!Skate.spots) return;
    for (const s of Skate.spots) {
      if (!inV(s.x, s.y, s.r * WK + 16)) continue;
      const sx = s.x - ox, sy = s.y - oy, rad = 24;
      /* Plataforma de concreto pulido del skatepark */
      c.save();
      c.fillStyle = 'rgba(218,222,226,.82)';
      c.beginPath(); c.roundRect(sx - rad, sy - rad * .78, rad * 2, rad * 1.56, 7); c.fill();
      c.strokeStyle = s.col; c.lineWidth = 1.4; c.stroke();
      /* Rampas amarillas, baranda metálica azul y bóveda verde de parkour */
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
  };

  /* Etiqueta de los skateparks en HUD + física automática al pasar por rampas/barandas en el mundo abierto */
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
          if (JE.ui) JE.ui.toast('🛹 ' + sp.n + ' (' + sp.tipo + '): cruza las rampas o toca Truco / Espacio');
        }
        for (const pz of sp.piezas) {
          if (Math.hypot(P.x - (sp.x + pz.dx), P.y - (sp.y + pz.dy)) < 7.5) {
            const nom = pz.k === 'rail' ? '50-50 Grind' : pz.k === 'parkour' ? 'Bóveda Parkour' : 'Salto en Rampa';
            Skate.hacerTruco(this, nom);
            break;
          }
        }
      } else {
        this._skGreet = null;
      }
    }
    return r;
  };

  const _hud99p = Ride.prototype.hud;
  Ride.prototype.hud = function (V, opts) {
    _hud99p.call(this, V, opts);
    if (this.big || (typeof panoOn === 'function' && panoOn(this))) return;
    if (Skate.spots && this.lblRoom && !(JE.vistas && (JE.vistas.esPersp() || JE.vistas.esMaqueta()))) {
      for (const s of Skate.spots) {
        if (Math.abs(s.x - this.p.x) > 220 || Math.abs(s.y - this.p.y) > 280) continue;
        const q = this.w2s(s.x, s.y - 26);
        const lbl = '🛹 ' + s.n;
        if (this.lblRoom(q.x, q.y, lbl.length * 5.8 + 10, 16)) {
          V.text(lbl, q.x, q.y, { size: 10.5, align: 'center', bg: '#0a2342ee', color: s.col, pad: 3, border: s.col });
        }
      }
    }
    if (this._trCombo > 0 && this._trT > 0) {
      V.text('🛹 COMBO ×' + this._trCombo, V.w / 2, (View.top || 60) + 66, { size: 15, align: 'center', color: '#ffc93c', bg: '#0a2342e0', pad: 5 });
    }
  };

  /* Acciones contextuales en Modo Libre:
     - En ciclorruta real → botón contextual «🏁 Runner» (id: 'cicloRunner', sin tocar tests/run.js:412)
     - Dentro de un Skatepark / Parkour → botón contextual «🛹 Truco» / «🏃 Parkour» */
  if (typeof HUD21 !== 'undefined' && Array.isArray(HUD21.CTX)) {
    for (const k of ['truco', 'cicloRunner']) if (!HUD21.CTX.includes(k)) HUD21.CTX.push(k);
  }

  const _act99p = ModeUsuarioR.prototype.actions;
  ModeUsuarioR.prototype.actions = function () {
    const a = _act99p.call(this);
    if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
    const R = this.ride;
    if (Skate.cerca(R) && R.p.veh !== 'truck') {
      a.push({ id: 'truco', icon: 'estrella', label: R.p.veh === 'walk' ? 'Parkour' : 'Truco', fn: () => Skate.hacerTruco(R) });
    }
    if (Skate.enCiclovia(R) && R.p.veh !== 'walk' && R.p.veh !== 'truck') {
      a.push({ id: 'cicloRunner', icon: 'usuario', label: 'Runner', fn: () => this.iniciarRunner3D() });
    }
    return a;
  };

  /* En Modo Libre, si se intenta abrir Run 3D desde el Taller fuera de una ciclorruta,
     acercar al ciclista a la ciclorruta más cercana para respetar «solo aplica en ciclovías» */
  const _iniciarR99p = ModeUsuarioR.prototype.iniciarRunner3D;
  if (_iniciarR99p) {
    ModeUsuarioR.prototype.iniciarRunner3D = function (corredorIdx) {
      if (this.free && this.ride && !JE.headless && !Skate.enCiclovia(this.ride) && typeof TramoCiclista !== 'undefined') {
        const t = TramoCiclista.cercana(JE.map, this.ride.p);
        if (t && t.p && t.p.length >= 2) {
          this.ride.p.x = t.p[0]; this.ride.p.y = t.p[1];
          this.ride.cam.x = t.p[0]; this.ride.cam.y = t.p[1];
          if (JE.ui) JE.ui.toast('🟢 Te ubicamos en la ciclorruta ' + t.nombre + ' (el Runner aplica sobre ciclovías)');
        }
      }
      return _iniciarR99p.call(this, corredorIdx);
    };
  }

  /* ---------- 2) Mejora del Endless Runner (MGRunner3D):
     - Anchos de calle dinámicos (Avenida ancha ↔ Ciclorruta ↔ Paso estrecho)
     - Cruces direccionales (⬅ Izquierda · ⬆ Recto · ➡ Derecha) con giro inclinado
     - Rampas, barandas de grind y bóvedas de parkour con combo de trucos ---------- */
  if (typeof MGRunner3D !== 'undefined') {
    const TRAMOS_ANCHO = [
      { id: 'normal', n: 'Ciclorruta del Valle', k: 1.0, col: '#2e8b52' },
      { id: 'ancha', n: 'Avenida Ancha (Ciclovía)', k: 1.32, col: '#3a9b5f' },
      { id: 'estrecha', n: 'Paso Estrecho · Barrio', k: .68, col: '#5b6772' }
    ];
    const RAMALES = [
      ['Laureles', 'Estadio'], ['Ciudad del Río', 'El Poblado'],
      ['Parques del Río', 'Carabobo'], ['Jardín Botánico', 'Moravia']
    ];

    const _spawn99p = MGRunner3D.prototype.spawnRow;
    MGRunner3D.prototype.spawnRow = function () {
      _spawn99p.call(this);
      /* Inyectar ocasionalmente baranda de grind o zona de parkour/skate */
      if (this.rng.f() < .26) {
        const d = this.nextD - 8, lane = this.rng.i(-1, 1);
        this.items.push({ d, lane, kind: this.rng.f() < .55 ? 'baranda' : 'parkour', done: false, moved: false });
      }
    };

    const _updR99p = MGRunner3D.prototype.update;
    MGRunner3D.prototype.update = function (dt) {
      if (this._wIdx == null) {
        this._wIdx = 0; this._wScale = 1.0; this._nextW = 110;
        this._nextTurn = 145; this._turn = null; this._bank = 0; this._trCombo = 0;
      }
      /* Cambio de ancho de calle (ancha → normal → estrecha) */
      if (this.distM >= this._nextW) {
        this._wIdx = (this._wIdx + 1) % TRAMOS_ANCHO.length;
        this._nextW = this.distM + 105 + this.rng.range(0, 45);
        const tw = TRAMOS_ANCHO[this._wIdx];
        this.pop('↔ ' + tw.n, 160, 46, tw.id === 'estrecha' ? PAL.amb : PAL.vd1);
      }
      const targetW = TRAMOS_ANCHO[this._wIdx].k;
      this._wScale += (targetW - this._wScale) * Math.min(1, dt * 3.2);
      if (this._wIdx === 2 && this.lane > 0) this.lane = 0; /* en paso estrecho, 2 carriles (-1 y 0) */

      /* Cruces direccionales con letreros */
      if (!this._turn && this.distM >= this._nextTurn - 55) {
        const pair = RAMALES[Math.floor(this.distM / 120) % RAMALES.length];
        this._turn = { at: this._nextTurn, left: pair[0], right: pair[1] };
      }
      if (this._turn && this.distM >= this._turn.at) {
        const dir = this.lane < 0 ? -1 : this.lane > 0 ? 1 : 0;
        if (dir !== 0) {
          this._bank = dir * .22;
          const dest = dir < 0 ? this._turn.left : this._turn.right;
          this.barrio = dest;
          this.good(15, 160, 52, (dir < 0 ? '⬅ ' : '➡ ') + 'Giro a ' + dest + ' +15');
        } else {
          this.pop('⬆ Sigues recto por el corredor', 160, 52, PAL.cie);
        }
        this._turn = null;
        this._nextTurn = this.distM + 150 + this.rng.range(0, 35);
      }
      this._bank *= Math.exp(-dt * 4.5);

      /* Manejo de barandas (grind) y bóvedas de parkour antes del update base */
      for (const it of this.items) {
        if (it.done || (it.kind !== 'baranda' && it.kind !== 'parkour')) continue;
        const rel = it.d - this.distM;
        if (rel > 1.4 || rel < -1.4) continue;
        if (Math.abs(this.lx - it.lane) < .52) {
          it.done = true;
          this._trCombo = (this._trCombo | 0) + 1;
          this.vz = 6.8; this.z = Math.max(this.z, .22);
          const pts = 6 + this._trCombo * 3;
          this.good(pts, 160, 58, (it.kind === 'baranda' ? '⚡ 50-50 Grind' : '🏃 Salto Parkour') + ' ×' + this._trCombo + ' +' + pts);
          if (Snd.vehSfx) Snd.vehSfx('skate', 'ollie');
        }
      }
      return _updR99p.call(this, dt);
    };

    const _drawIt99p = MGRunner3D.prototype.drawItem3D;
    MGRunner3D.prototype.drawItem3D = function (b, it, x, y, sc, hw) {
      const r = v => Math.max(1, Math.round(v * sc));
      if (it.kind === 'baranda') {
        prect(b, x - r(2), y - r(8), r(4), r(8), '#3b4859');
        prect(b, x - r(12), y - r(9), r(24), r(3), '#56c7ff');
        prect(b, x - r(12), y - r(9), r(24), r(1), '#ffffff');
        return;
      }
      if (it.kind === 'parkour') {
        prect(b, x - r(10), y - r(8), r(20), r(8), '#2e9d55');
        prect(b, x - r(10), y - r(10), r(20), r(2), '#ffc93c');
        return;
      }
      return _drawIt99p.call(this, b, it, x, y, sc, hw);
    };

    const _hudR99p = MGRunner3D.prototype.hud;
    MGRunner3D.prototype.hud = function (V) {
      _hudR99p.call(this, V);
      const tw = TRAMOS_ANCHO[this._wIdx || 0];
      V.text('↔ ' + tw.n + (this._trCombo ? ' · 🛹 Combo ×' + this._trCombo : ''), 12, Math.max((View.hudB || 50) + 66, (View.top || 0) + 60), { size: 11.5, color: '#ffc93c', bg: '#0a2342cc', pad: 3, body: true });
      if (this._turn) {
        const falta = Math.max(0, Math.round(this._turn.at - this.distM));
        V.text('⬅ ' + this._turn.left + ' · ⬆ Recto · ' + this._turn.right + ' ➡ (' + falta + ' m)', V.w / 2, (View.hudB || 50) + 92, { size: 12.5, align: 'center', color: '#0a2342', bg: '#ffc93cf0', pad: 5, body: true });
      }
    };
  }
})();
