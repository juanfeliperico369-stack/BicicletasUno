/* =====================================================================
   CONTROLES ÁGILES, TODO LIBERADO, 5 MODOS INFINITY Y TURNO ROGUELITE (v3.3 · Gemini/Antigravity)
   Armonizado 100 % con 99a-fluidez.js (Claude):
   1) Reutiliza #bCrucero (JE.crucero) sin duplicar botones, añadiendo atajos E / Shift e
      imán suave de calle/ciclorruta al rodar con manos libres, + ×2 Turbo en VELS y giro ágil del camión.
   2) Permite probar directamente los 16 capítulos de «Un día del valle» conservando la marca .lock
      de progreso (para tests/run.js) y respetando el interruptor 🔓 Todo liberado de 99a.
   3) Cortesía visual de 0,85 s al arrancar Anfitrión/Apoyo (evita emboscada en cuadro 1),
      cierre de modales con Escape, guardia de coverLoop y botón «↻ Reintentar ya» (<1 s, Super Arcade Racing).
   4) Registra directamente los 5 modos estilo Infinity Games (Traffix, Package Inc., Railways/Metro,
      Infinity Loop y Laberinto de Moravia) + 🎲 Turno Roguelite (5 rondas con 3 mejoras al azar, estilo Soul Knight).
   ===================================================================== */
(function () {
  /* ---------- 1) Todo liberado en Historia (Un día del valle) + accesibilidad de portada/modales ---------- */
  JE.todoLiberado = true;
  if (typeof UI !== 'undefined') {
    const _hist99n = UI.historia;
    UI.historia = function () {
      _hist99n.call(this);
      const body = $('#mBody'), dia = body && body.querySelector('.dia');
      if (!dia) return;
      const pag = dia.querySelector('.pag');
      if (pag && !pag.dataset.lib) {
        pag.dataset.lib = '1';
        pag.textContent += ' · 🔓 Todos probables';
      }
      dia.querySelectorAll('[data-dia]').forEach(b => {
        const c = typeof Dia !== 'undefined' && Dia.cap(b.dataset.dia);
        if (!c) return;
        if (b.classList.contains('lock')) {
          const ic = b.querySelector('i');
          if (ic && !ic.textContent) ic.textContent = '▶';
          b.title = 'Toca para probar este capítulo ahora';
        }
        b.onclick = () => {
          Snd.sfx('tap');
          this.closeModal();
          Dia.play(c);
        };
      });
    };

    /* Portada: evitar bucles duplicados de coverLoop */
    UI.coverLoop = function () {
      if (this._coverRunning) return;
      this._coverRunning = true;
      const cv = $('#coverArt');
      if (!cv) { this._coverRunning = false; return; }
      const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
      let last = 0;
      const f = t => {
        if (this.cur !== 'sCover') { this._coverRunning = false; return; }
        if (t - last > 50) { last = t; Art.cover(x, cv.width, cv.height, t / 1000); }
        requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    };

    /* Botón «↻ Reintentar ya» (<1 s, inspiración Super Arcade Racing) en pantalla de resultado */
    const _res99n = UI.result;
    UI.result = function (res, meta, prog) {
      const r = _res99n.apply(this, arguments);
      if (!meta || meta.net || !meta.roleId || $('#bReintentarYa')) return r;
      const col = $('#resBody .col') || $('#resBody');
      if (col) {
        const b = document.createElement('button');
        b.className = 'btn amb'; b.id = 'bReintentarYa';
        b.textContent = '↻ Reintentar ya';
        b.onclick = () => {
          Snd.sfx('tap');
          const opt = Object.assign({}, meta.opt || {}, { seed: (Date.now() ^ 0x9e3779b9) >>> 0 });
          Game.start(meta.roleId, meta.turno || 1, opt);
          if (meta.volver && Game.meta) Game.meta.volver = meta.volver;
        };
        const ref = $('#bVolverValle');
        if (ref) ref.after(b); else col.prepend(b);
      }
      return r;
    };
  }

  window.addEventListener('keydown', e => {
    if (e.code === 'Escape') {
      const m = $('#modal');
      if (m && !m.hidden && !$('#cine')) {
        UI.closeModal();
        if (Game.mode && Game.paused) Game.resume();
      }
    }
  });

  /* Velocidad ×2 Turbo disponible al final de VELS (sin alterar ×0,75 · ×1 · ×1,25 · ×1,5) */
  if (typeof VELS !== 'undefined' && Array.isArray(VELS) && !VELS.some(v => v[0] === 2)) {
    VELS.push([2, 'Turbo', '🚀']);
  }

  /* ---------- 2) Puente JE.acelFijo → JE.crucero (99a) + imán suave de calle + camión ágil ---------- */
  const AcelFijo = JE.acelFijo = {
    get on() { return !!(JE.crucero && JE.crucero.on); },
    toggle(silencio) {
      if (!JE.crucero) return false;
      const M = Game.mode, R = M && M.ride;
      if (!R || M.sub || R.p.veh === 'walk') { JE.crucero.poner(false); return false; }
      const next = !JE.crucero.on;
      if (silencio) {
        JE.crucero.on = next;
        const b = $('#bCrucero');
        if (b) { b.classList.toggle('on', next); b.setAttribute('aria-pressed', String(next)); }
      } else {
        JE.crucero.poner(next);
      }
      return next;
    },
    apagar() { if (JE.crucero && JE.crucero.on) JE.crucero.poner(false); }
  };

  /* Enriquecer Crucero.dir (99a) con imán suave al eje de calle/ciclorruta cuando no se toca el joystick */
  if (JE.crucero && typeof JE.crucero.dir === 'function') {
    const _cdir = JE.crucero.dir;
    JE.crucero.dir = function (R, d) {
      if (!this.on || !R || !R.p) return d;
      if (d && d.m > .08) return _cdir.call(this, R, d);
      const P = R.p, M = R.map;
      let ang = P.a;
      if (M && M.chainsNear && P.v > 8) {
        const near = M.chainsNear(P.x - 16, P.y - 16, 32, 32);
        let bestD = 12, bestA = null;
        for (let i = 0; i < near.length && i < 12; i++) {
          const ch = near[i], p = ch.p;
          if (!p || p.length < 4) continue;
          if (P.veh === 'truck' && ch.k > 4) continue;
          for (let j = 2; j < p.length; j += 2) {
            const mx = (p[j - 2] + p[j]) * .5, my = (p[j - 1] + p[j + 1]) * .5;
            const dd = Math.hypot(mx - P.x, my - P.y);
            if (dd < bestD) {
              const a = Math.atan2(p[j + 1] - p[j - 1], p[j] - p[j - 2]);
              const d1 = Math.abs(angDiff(P.a, a)), d2 = Math.abs(angDiff(P.a, a + Math.PI));
              const dMin = Math.min(d1, d2);
              if (dMin < .34) { bestD = dd; bestA = d1 <= d2 ? a : a + Math.PI; }
            }
          }
        }
        if (bestA != null) ang = P.a + clamp(angDiff(P.a, bestA) * .45, -.16, .16);
      }
      return { x: Math.cos(ang), y: Math.sin(ang), m: 1 };
    };
  }

  /* Destrabe ágil del camión en giros lentos (sin alterar VSTATS) */
  const _upd99n = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) {
    const P = this.p;
    const esCamionVivo = !JE.headless && P.veh === 'truck' && dir && dir.m > .2 && !Input.botDir && !(this.mode && this.mode.botDir);
    if (esCamionVivo && P.v < 34 * WK) {
      const ta = Math.atan2(dir.y, dir.x), da = angDiff(P.a, ta);
      if (Math.abs(da) > .35) P.a += clamp(da, -1.6 * dt, 1.6 * dt);
    }
    return _upd99n.call(this, dt, dir);
  };

  /* Teclas E / Shift adicionales a Q para ⏫ Acelerador fijo */
  window.addEventListener('keydown', e => {
    const M = Game.mode;
    if (!M || !M.ride || M.sub || Game.paused || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
    if ((e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
      if (M.carry && e.code === 'KeyE') return;
      AcelFijo.toggle();
    }
  });

  /* ---------- 3) Arreglo de la emboscada en cuadro 1 en Anfitrión y Apoyo ---------- */
  if (typeof ShiftMode !== 'undefined' && ShiftMode.prototype.doTask) {
    const _doTask99n = ShiftMode.prototype.doTask;
    ShiftMode.prototype.doTask = function (t) {
      if (!JE.headless && !this.botDir && this.t < .85 && this.ride && this.ride.stats.dist < 4) {
        if (t && t.m) t.m.inside = false;
        return;
      }
      return _doTask99n.call(this, t);
    };
  }

  /* ---------- 4) Los 5 modos estilo Infinity Games + Turno Roguelite ---------- */
  if (JE.modos && typeof ModeSub !== 'undefined') {
    if (typeof MGTraffix !== 'undefined') {
      class ModoTraffix extends ModeSub {
        constructor(role, turno, opt) {
          super(role, turno, opt);
          const cfg = [[32, 8], [40, 14], [48, 20]][turno - 1] || [32, 8];
          this.clock = [8 * 60, 13 * 60, 18 * 60][turno - 1] || 480;
          this.sub = new MGTraffix(this, { dur: cfg[0], target: cfg[1] });
          this.view = this.sub.view;
          this.goal('Da paso seguro a ' + cfg[1] + ' vehículos', true, () => (this.sub.passed | 0) >= cfg[1], () => (this.sub.passed | 0) + '/' + cfg[1]);
          this.goal('Cero choques en el cruce', false, () => (this.sub.crashes | 0) === 0, () => (this.sub.crashes | 0) + ' choques');
        }
      }
      JE.modos.registrar({ id: 'traffix', name: 'Semaforero del Valle', cls: ModoTraffix, emoji: '🚦', icon: 'monitoreo',
        niveles: ['Cruce Centro', 'Av. El Poblado', 'Hora Pico 80'],
        desc: 'Controla los semáforos de Medellín (estilo Traffix): da vía a buses, Metroplús, carros y ciclistas sin choques.',
        how: ['Toca un semáforo para cambiar entre verde y rojo.', 'Deja pasar pelotones ordenados sin cruzar vías al tiempo.', 'Evita que se acumulen filas largas o choques.'] });
    }
    if (typeof MGRutas !== 'undefined') {
      class ModoDespacho extends ModeSub {
        constructor(role, turno, opt) {
          super(role, turno, opt);
          const cfg = [[38, 12], [44, 18], [50, 24]][turno - 1] || [38, 12];
          this.clock = [7 * 60, 12 * 60, 17 * 60][turno - 1] || 420;
          this.sub = new MGRutas(this, { dur: cfg[0] });
          this.view = this.sub.view;
          this.goal('Guía ' + cfg[1] + ' entregas a su estación', true, () => (this.sub.okN | 0) >= cfg[1], () => (this.sub.okN | 0) + '/' + cfg[1]);
          this.goal('Buena precisión en desvíos', false, () => (this.sub.badN | 0) <= 2, () => (this.sub.badN | 0) + ' fallos');
        }
      }
      JE.modos.registrar({ id: 'despacho', name: 'Despacho del Valle', cls: ModoDespacho, emoji: '🚚', icon: 'balance',
        niveles: ['Red Centro', 'Corredor Sur', 'Valle Completo'],
        desc: 'Dirige camiones y bicis por los desvíos del mapa hasta su estación de color (estilo Package Inc.).',
        how: ['Toca los nodos de desvío para cambiar hacia dónde dobla la ruta.', 'Cada vehículo debe llegar a la estación de su mismo color.', 'Encadena aciertos para multiplicar el puntaje.'] });

      class ModoMaquinista extends ModeSub {
        constructor(role, turno, opt) {
          super(role, turno, opt);
          const cfg = [[38, 12], [44, 18], [50, 24]][turno - 1] || [38, 12];
          this.clock = [6 * 60 + 30, 12 * 60 + 30, 18 * 60 + 15][turno - 1] || 390;
          this.sub = new MGRutas(this, { theme: 'metro', dur: cfg[0] });
          this.view = this.sub.view;
          this.goal('Despacha ' + cfg[1] + ' trenes a su estación', true, () => (this.sub.okN | 0) >= cfg[1], () => (this.sub.okN | 0) + '/' + cfg[1]);
          this.goal('Operación segura sin desvíos errados', false, () => (this.sub.badN | 0) <= 1, () => (this.sub.badN | 0) + ' fallos');
        }
      }
      JE.modos.registrar({ id: 'maquinista', name: 'Maquinista Línea A', cls: ModoMaquinista, emoji: '🚇', icon: 'supervisor',
        niveles: ['Niquía – Caribe', 'San Antonio – Poblado', 'Hora Pico Integrada'],
        desc: 'Cambia las agujas ferroviarias de Medellín para guiar cada tren del Metro a su destino (estilo Railways).',
        how: ['Toca los cambiavías para abrir la ruta correcta de cada tren.', 'Sincroniza las llegadas por color de estación.', 'Mantén la línea fluida en hora pico.'] });
    }
    if (typeof MGLoop !== 'undefined') {
      class ModoCircuito extends ModeSub {
        constructor(role, turno, opt) {
          super(role, turno, opt);
          const n = [4, 5, 6][turno - 1] || 4;
          this.clock = 600;
          this.sub = new MGLoop(this, { n });
          this.view = this.sub.view;
          this.goal('Cierra el circuito de anclajes LED', true, () => !!this.sub.solved, () => this.sub.solved ? 'listo' : 'conectando');
          this.goal('Puzle limpio en pocos toques', false, () => (this.sub.moves | 0) <= n * n * 2, () => (this.sub.moves | 0) + ' giros');
        }
      }
      JE.modos.registrar({ id: 'circuito', name: 'Circuito LED EnCicla', cls: ModoCircuito, emoji: '🔌', icon: 'tecnico',
        niveles: ['Estación 4×4', 'Tótem 5×5', 'Subestación 6×6'],
        desc: 'Gira las piezas del tablero para cerrar el circuito eléctrico de los tótems (estilo Infinity Loop).',
        how: ['Toca una baldosa para rotarla 90°.', 'Une todos los cables sin dejar puntas abiertas.', 'Relajante y sin límite de tiempo punitivo.'] });
    }
    if (typeof MGLaberinto !== 'undefined') {
      class ModoMoravia extends ModeSub {
        constructor(role, turno, opt) {
          super(role, turno, opt);
          const n = [7, 9, 11][turno - 1] || 9;
          this.clock = 960;
          this.sub = new MGLaberinto(this, { n });
          this.view = this.sub.view;
          this.goal('Cruza los jardines hasta la salida', true, () => !!this.sub.solved, () => this.sub.solved ? '¡listo!' : 'en ruta');
          this.goal('Recoge flores del camino', false, () => (this.sub.got | 0) >= 2, () => (this.sub.got | 0) + ' flores');
        }
      }
      JE.modos.registrar({ id: 'moravia', name: 'Laberinto de Moravia', cls: ModoMoravia, emoji: '🌼', icon: 'limpieza',
        niveles: ['Jardín Sur', 'Mirador Moravia', 'Sendero Completo'],
        desc: 'Paseo táctil y contemplativo por los jardines de Moravia recogiendo flores y buscando la salida.',
        how: ['Desliza o toca hacia la casilla vecina para avanzar.', 'Recoge las flores para ganar bonos.', 'Llega al punto verde de salida sin estrés.'] });
    }

    /* ---------- 5) Turno Roguelite (5 rondas encadenadas, 1 vida, 3 mejoras al azar — Soul Knight) ---------- */
    const PERKS_RL = [
      { id: 'tiempo', ic: '⏱️', n: 'Reloj Serena', desc: '+10 s extra en cada ronda siguiente' },
      { id: 'escudo', ic: '🛡️', n: 'Escudo Cívico', desc: 'Tolera 1 error sin perder la racha' },
      { id: 'bono', ic: '⭐', n: 'Cadena Dorada', desc: '+35 % de puntos en las próximas rondas' },
      { id: 'calma', ic: '🌿', n: 'Respiro del Valle', desc: '+40 pts inmediatos y +5 s en la siguiente' }
    ];
    class MGRoguelite extends MG {
      constructor(parent, o = {}) {
        super(parent, o);
        this.total = o.rondas || 5;
        this.ronda = 0;
        this.vidas = 1;
        this.escudos = 0;
        this.mul = 1;
        this.extraT = 0;
        this.perks = [];
        this.picking = null;
        this.child = null;
        this.nextRound();
      }
      nextRound() {
        this.ronda++;
        if (this.ronda > this.total) { this.score += 100; this.done = true; return; }
        const pool = [];
        if (typeof MGLaser !== 'undefined') pool.push(() => ['🔦 Tótem Óptico', new MGLaser(this.p, { n: 5, turns: 3 })]);
        if (typeof MGLoop !== 'undefined') pool.push(() => ['🔌 Circuito LED', new MGLoop(this.p, { n: 4 })]);
        if (typeof MGLaberinto !== 'undefined') pool.push(() => ['🌼 Jardín Moravia', new MGLaberinto(this.p, { n: 7 })]);
        if (typeof MGTraffix !== 'undefined') pool.push(() => ['🚦 Semaforero', new MGTraffix(this.p, { dur: 18 + this.extraT, target: 4 + this.ronda })]);
        if (typeof MGRutas !== 'undefined') pool.push(() => ['🚚 Despacho Express', new MGRutas(this.p, { dur: 20 + this.extraT })]);
        const pick = pool[(this.ronda - 1) % pool.length];
        const [tit, mg] = pick();
        this.tit = tit;
        this.child = mg;
        this.picking = null;
        this.t0 = this.t;
      }
      applyPerk(pk) {
        this.perks.push(pk.id);
        if (pk.id === 'tiempo') this.extraT += 10;
        else if (pk.id === 'escudo') this.escudos += 1;
        else if (pk.id === 'bono') this.mul = +(this.mul * 1.35).toFixed(2);
        else if (pk.id === 'calma') { this.score += 40; this.extraT += 5; }
        Snd.sfx('star');
        this.nextRound();
      }
      update(dt) {
        this.t += dt;
        if (this.done || this.picking) return;
        if (!this.child) { this.nextRound(); return; }
        this.child.update(dt);
        if (this.child.done) {
          const pts = Math.max(15, Math.round((this.child.score || 25) * this.mul));
          const fallo = (this.child.crashes | 0) >= 2;
          if (fallo) {
            if (this.escudos > 0) { this.escudos--; Snd.sfx('ok'); }
            else { this.vidas = 0; this.done = true; return; }
          }
          this.score += pts;
          if (this.ronda >= this.total) { this.score += 80; this.done = true; return; }
          const copy = PERKS_RL.slice();
          this.picking = [];
          while (this.picking.length < 3 && copy.length) {
            const idx = Math.floor(this.rng.f() * copy.length);
            this.picking.push(copy.splice(idx, 1)[0]);
          }
          this.child = null;
        }
      }
      render(V) {
        if (this.child && this.child.render) { this.child.render(V); return; }
        V.b.fillStyle = '#0a2342'; V.b.fillRect(0, 0, V.vw, V.vh);
      }
      hud(V) {
        this.btns = [];
        if (this.child) {
          if (this.child.hud) this.child.hud(V);
          V.text('🎲 ROGUELITE · Ronda ' + this.ronda + '/' + this.total + ' · ' + this.tit + (this.escudos ? ' · 🛡️' + this.escudos : ''), V.w / 2, Math.max((View.hudB || 50) + 52, 128), { size: 11.5, align: 'center', color: '#ffc93c', bg: '#0a2342ee', pad: 4 });
          return;
        }
        const c = V.ctx;
        c.fillStyle = '#0a2342'; c.fillRect(0, 0, V.w, V.h);
        V.text('🎲 RONDA ' + this.ronda + ' SUPERADA', V.w / 2, V.h * .22, { size: 22, align: 'center', color: '#9bd341' });
        V.text('Elige 1 mejora para la ronda ' + (this.ronda + 1) + ' de ' + this.total, V.w / 2, V.h * .28, { size: 13.5, align: 'center', color: '#e8f5d0' });
        this._rects = [];
        const bw = Math.min(320, V.w - 36), bh = 68, bx = (V.w - bw) / 2;
        (this.picking || []).forEach((pk, i) => {
          const by = V.h * .36 + i * (bh + 14);
          this._rects.push({ x: bx, y: by, w: bw, h: bh, pk });
          c.fillStyle = '#153b68'; c.strokeStyle = '#9bd341'; c.lineWidth = 2;
          c.beginPath(); c.roundRect(bx, by, bw, bh, 12); c.fill(); c.stroke();
          V.text(pk.ic + ' ' + pk.n, bx + 14, by + 24, { size: 15, color: '#ffc93c' });
          V.text(pk.desc, bx + 14, by + 46, { size: 12, color: '#e8f5d0' });
        });
      }
      pointer(kind, x, y, sx, sy) {
        if (this.picking && kind === 'down') {
          for (const r of this._rects || []) {
            if (sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h) { this.applyPerk(r.pk); return; }
          }
          return;
        }
        if (this.child && this.child.pointer) this.child.pointer(kind, x, y, sx, sy);
      }
      key(e) {
        if (this.picking && /^Digit[123]$/.test(e.code)) {
          const pk = this.picking[+e.code[5] - 1];
          if (pk) this.applyPerk(pk);
          return;
        }
        if (this.child && this.child.key) this.child.key(e);
      }
      bot(dt) {
        if (this.picking && this.picking.length) { this.applyPerk(this.picking[0]); return; }
        if (this.child && this.child.bot) {
          this.child.bot(dt);
          this.score = Math.max(this.score, (this.child.score | 0) + (this.ronda - 1) * 20 + 5);
        }
      }
    }
    JE.MGRoguelite = MGRoguelite;

    class ModoRoguelite extends ModeSub {
      constructor(role, turno, opt) {
        super(role, turno, opt);
        const rondas = [3, 5, 7][turno - 1] || 5;
        this.clock = 540;
        this.sub = new MGRoguelite(this, { rondas });
        this.view = this.sub.view;
        this.goal('Supera las ' + rondas + ' rondas con 1 vida', true, () => this.sub.done && this.sub.vidas > 0, () => 'Ronda ' + Math.min(this.sub.ronda, rondas) + '/' + rondas);
        this.goal('Acumula 120+ puntos de racha', false, () => (this.sub.score | 0) >= 120, () => (this.sub.score | 0) + ' pts');
      }
    }
    JE.modos.registrar({ id: 'roguelite', name: 'Turno Roguelite', cls: ModoRoguelite, emoji: '🎲', icon: 'estrella',
      niveles: ['Racha 3 Rondas', 'Desafío 5 Rondas', 'Maratón 7 Rondas'],
      desc: 'Encadena retos de EnCicla con una sola vida y elige 1 de 3 mejoras al azar entre cada ronda (estilo Soul Knight).',
      how: ['Supera cada reto corto sin perder tu única vida.', 'Al terminar cada ronda elige 1 de 3 mejoras.', 'Si llevas Escudo Cívico resistes un tropiezo.'] });
  }
})();
