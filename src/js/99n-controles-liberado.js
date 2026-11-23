/* =====================================================================
   CONTROLES ÁGILES, ACELERADOR FIJO Y TODO LIBERADO (v2.2 · Ronda 3.0 · Gemini/Antigravity)
   Zona aditiva reservada: 99n–99y (corre después de 98v-claves.js y 99a–99m sin choques).
   1) Todo liberado desde el principio: los 12 oficios, todos sus turnos (1–3 y Libre),
      los modos arcade y la prueba directa de los 16 capítulos de «Un día del valle»
      (conservando el estado de progreso en historia para no romper tests/run.js).
   2) ⏫ Acelerador fijo (portado de Motor City 4.6.1, js/37-manejo.js): un toque mantiene
      el impulso continuo mientras el joystick solo dirige; otro toque frena suavemente.
      Teclas rápidas: E o Shift.
   3) Manejo pulido del camión (Balance, Supervisor, Bodega) en giros cerrados, velocidad
      ×2 Turbo opcional en VELS, cierre de modales con Escape y guardia de coverLoop.
   4) Los 5 minijuegos inspirados en Infinity Games (Traffix, Package Inc., Railways/Metro,
      Infinity Loop/Laser y Laberinto de Moravia) registrados directamente como modos jugables.
   ===================================================================== */
(function () {
  /* ---------- 1) Todo liberado desde el principio ---------- */
  JE.todoLiberado = true;
  if (typeof UI !== 'undefined') {
    UI.unlocked = function () { return true; };
    UI.turnoOk = function () { return true; };

    /* En Historia («Un día del valle»), conserva la clase visual .lock en los capítulos aún no
       completados en orden lineal (para que el jugador vea su avance y pase tests/run.js),
       pero permite tocar y probar CUALQUIER capítulo al instante sin bloqueo. */
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

    /* Portada: evitar bucles duplicados de coverLoop y permitir cerrar modales con Escape */
    const _cover99n = UI.coverLoop;
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
    void _cover99n;
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

  /* Velocidad ×2 Turbo disponible al final de VELS (sin tocar ×0,75 · ×1 · ×1,25 · ×1,5) */
  if (typeof VELS !== 'undefined' && Array.isArray(VELS) && !VELS.some(v => v[0] === 2)) {
    VELS.push([2, 'Turbo', '🚀']);
  }

  /* ---------- 2) ⏫ Acelerador fijo (patrón Motor City 4.6.1) ---------- */
  const AcelFijo = JE.acelFijo = {
    on: false,
    _parar: false,
    toggle(silencio) {
      const M = Game.mode, R = M && M.ride;
      if (!R || M.sub || R.p.veh === 'walk') { this.on = false; this._parar = false; return false; }
      this.on = !this.on;
      this._parar = !this.on;
      if (!silencio) {
        Snd.sfx('tap');
        if (JE.ui) JE.ui.toast(this.on ? '⏫ Acelerador fijo activado: solo dirige con el dedo (toca ⏫ para frenar)' : '🛑 Acelerador fijo apagado: frenando suave');
      }
      this.syncBtn();
      return this.on;
    },
    apagar() { this.on = false; this._parar = false; this.syncBtn(); },
    syncBtn() {
      const b = document.querySelector('#camBar [data-cam="acel"]');
      if (!b) return;
      const M = Game.mode, R = M && M.ride, hide = !R || R.p.veh === 'walk';
      b.hidden = hide;
      b.classList.toggle('acelOn', this.on && !hide);
      b.setAttribute('aria-pressed', this.on && !hide ? 'true' : 'false');
    },
    aplicar(R, dir) {
      const P = R.p;
      if (JE.headless || Input.botDir || (R.mode && R.mode.botDir) || (R.libre && R.libre.on) || P.veh === 'walk') {
        if (P.veh === 'walk' && this.on) this.apagar();
        return dir;
      }
      if (!this.on) {
        if (this._parar) {
          if ((dir && dir.m > .1) || P.v < 3) this._parar = false;
          else return { x: 0, y: 0, m: 0 };
        }
        return dir;
      }
      this._parar = false;
      /* Si el jugador dirige con el joystick, acelera a fondo en esa dirección (salvo si jala hacia atrás para frenar) */
      if (dir && dir.m > .12) {
        const ta = Math.atan2(dir.y, dir.x), da = Math.abs(angDiff(P.a, ta));
        if (da > 2.45) return { x: dir.x, y: dir.y, m: .28 };
        return { x: dir.x, y: dir.y, m: 1 };
      }
      /* Sin joystick: sigue derecho con suave imán de calle/ciclorruta */
      let ang = P.a;
      const M = R.map;
      if (M && M.chainsNear && P.v > 8) {
        const near = M.chainsNear(P.x - 16, P.y - 16, 32, 32);
        let bestD = 12, bestA = null;
        for (let i = 0; i < near.length && i < 12; i++) {
          const ch = near[i], p = ch.p;
          if (!p || p.length < 4) continue;
          if (P.veh === 'truck' && ch.k > 4) continue;
          for (let j = 2; j < p.length; j += 2) {
            const mx = (p[j - 2] + p[j]) * .5, my = (p[j - 1] + p[j + 1]) * .5;
            const d = Math.hypot(mx - P.x, my - P.y);
            if (d < bestD) {
              const a = Math.atan2(p[j + 1] - p[j - 1], p[j] - p[j - 2]);
              const d1 = Math.abs(angDiff(P.a, a)), d2 = Math.abs(angDiff(P.a, a + Math.PI));
              const dMin = Math.min(d1, d2);
              if (dMin < .34) { bestD = d; bestA = d1 <= d2 ? a : a + Math.PI; }
            }
          }
        }
        if (bestA != null) ang = P.a + clamp(angDiff(P.a, bestA) * .45, -.16, .16);
      }
      return { x: Math.cos(ang), y: Math.sin(ang), m: 1 };
    }
  };

  /* Inyectar botón ⏫ en #camBar y enganchar la física + asistencia de giro del camión */
  const _barra99n = Cam.barra;
  Cam.barra = function (M) {
    _barra99n.call(this, M);
    const bar = $('#camBar');
    if (!bar || bar.hidden) return;
    let ab = bar.querySelector('[data-cam="acel"]');
    if (!ab) {
      ab = document.createElement('button');
      ab.dataset.cam = 'acel';
      ab.textContent = '⏫';
      ab.setAttribute('aria-label', 'Acelerador fijo');
      ab.title = 'Acelerador fijo (tecla E / Shift)';
      bar.appendChild(ab);
      ab.onclick = e => { e.stopPropagation(); AcelFijo.toggle(); };
    }
    AcelFijo.syncBtn();
    Cam.lugar();
  };

  /* En Ride.prototype.update: aplicar ⏫ acelerador fijo y destrabe suave de esquinas para el camión */
  const _upd99n = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) {
    const P = this.p;
    const d2 = AcelFijo.aplicar(this, dir);
    /* En juego interactivo con el camión (Balance, Supervisor, Bodega), mejorar agilidad en giros lentos
       para que no se quede pegado en esquinas estrechas del mapa OSM (sin alterar cifras de VSTATS) */
    const esCamionVivo = !JE.headless && P.veh === 'truck' && d2 && d2.m > .2 && !Input.botDir && !(this.mode && this.mode.botDir);
    if (esCamionVivo && P.v < 34 * WK) {
      const ta = Math.atan2(d2.y, d2.x), da = angDiff(P.a, ta);
      if (Math.abs(da) > .35) P.a += clamp(da, -1.6 * dt, 1.6 * dt);
    }
    const r = _upd99n.call(this, dt, d2);
    if (AcelFijo._parar && !AcelFijo.on && P.v > 0 && !JE.headless) {
      P.v = Math.max(0, P.v - this.stats_().brk * .75 * dt);
    }
    return r;
  };

  /* Apagar acelerador fijo al cambiar de estado o bajarse */
  for (const k of ['start', 'stop', 'pause', 'finish']) {
    const orig = Game[k];
    if (typeof orig === 'function') {
      Game[k] = function () { AcelFijo.apagar(); return orig.apply(this, arguments); };
    }
  }
  const _off99n = Ride.prototype.getOff;
  if (_off99n) Ride.prototype.getOff = function () { AcelFijo.apagar(); return _off99n.apply(this, arguments); };

  window.addEventListener('keydown', e => {
    const M = Game.mode;
    if (!M || !M.ride || M.sub || Game.paused || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
    if ((e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
      /* En Rescate cuando lleva bici, KeyE se usa para equilibrio */
      if (M.carry && e.code === 'KeyE') return;
      AcelFijo.toggle();
    }
  });

  /* ---------- 3) Arreglo del arranque inmediato en Anfitrión y Apoyo ----------
     En 52-oficios.js, la bici arranca a 20 px de la estación de inicio cuyo marcador mide 36 px,
     disparando MGApertura en el cuadro 1 antes de que el jugador vea el mapa. Damos 0,9 s de
     margen visual en juego interactivo (el bot y tests/run.js siguen funcionando igual). */
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

  /* ---------- 4) Los 5 modos estilo Infinity Games accesibles desde el menú y el mundo libre ---------- */
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
          const dur = [36, 46, 56][turno - 1] || 40;
          this.clock = [7 * 60, 12 * 60, 17 * 60][turno - 1] || 420;
          this.sub = new MGRutas(this, { dur });
          this.view = this.sub.view;
          this.goal('Completa el despacho sin perder la red', true, () => this.sub.score >= 20, () => this.sub.score + ' pts');
          this.goal('Precisión ≥ 80 %', false, () => (this.sub.acc ? this.sub.acc() : 1) >= .8, () => Math.round((this.sub.acc ? this.sub.acc() : 1) * 100) + '%');
        }
      }
      JE.modos.registrar({ id: 'despacho', name: 'Despacho EnCicla', cls: ModoDespacho, emoji: '📦', icon: 'balance',
        niveles: ['Laureles', 'Corredor Río', 'Valle Completo'],
        desc: 'Desvía camiones de balance y bicis hacia su estación correcta (estilo Package Inc.).',
        how: ['Toca los desvíos para girar las flechas de la ruta.', 'Envía cada vehículo al color de su estación destino.', 'Encadena entregas seguidas para sumar más puntos.'] });

      class ModoMaquinista extends ModeSub {
        constructor(role, turno, opt) {
          super(role, turno, opt);
          const dur = [38, 48, 58][turno - 1] || 45;
          this.clock = [6 * 60, 12 * 60 + 30, 18 * 60 + 30][turno - 1] || 420;
          this.sub = new MGRutas(this, { theme: 'metro', dur });
          this.view = this.sub.view;
          this.goal('Lleva los trenes del Metro a su vía', true, () => this.sub.score >= 20, () => this.sub.score + ' pts');
          this.goal('Precisión ≥ 85 %', false, () => (this.sub.acc ? this.sub.acc() : 1) >= .85, () => Math.round((this.sub.acc ? this.sub.acc() : 1) * 100) + '%');
        }
      }
      JE.modos.registrar({ id: 'maquinista', name: 'Maquinista del Metro', cls: ModoMaquinista, emoji: '🚇', icon: 'monitoreo',
        niveles: ['Línea A Mañana', 'San Antonio', 'Hora Pico'],
        desc: 'Dirige los cambios de vía de la Línea A y B del Metro de Medellín (estilo Railways / Tiny Rails).',
        how: ['Toca los cambios de aguja antes de que pase cada tren.', 'Guía cada tren hacia la estación del color indicado.', 'Sin colisiones ni retrasos en la red del valle.'] });
    }
    if (typeof MGLoop !== 'undefined' && typeof MGLaser !== 'undefined') {
      class ModoCircuito extends ModeSub {
        constructor(role, turno, opt) {
          super(role, turno, opt);
          this.clock = 600;
          this.sub = turno === 2 ? new MGLaser(this, { n: 5, turns: 3 }) : new MGLoop(this, { n: turno === 3 ? 6 : 5 });
          this.view = this.sub.view;
          this.goal('Completa el circuito técnico', true, () => this.sub.done && this.sub.score > 0, () => this.sub.score + ' pts');
          this.goal('Sin errores', false, () => (this.sub.errors | 0) === 0, () => (this.sub.errors | 0) + ' errores');
        }
      }
      JE.modos.registrar({ id: 'circuito', name: 'Circuito y Láser', cls: ModoCircuito, emoji: '🔌', icon: 'tecnico',
        niveles: ['Anclajes (Loop)', 'Tótem Óptico (Láser)', 'Red Avanzada'],
        desc: 'Puzles técnicos de estaciones EnCicla inspirados en Infinity Loop y Laser.',
        how: ['Toca cada pieza para girarla hasta cerrar el circuito.', 'En Tótem Óptico, alinea los espejos hasta encender el sensor.', 'Energiza toda la estación con el menor número de toques.'] });
    }
    if (typeof MGLaberinto !== 'undefined') {
      class ModoMoravia extends ModeSub {
        constructor(role, turno, opt) {
          super(role, turno, opt);
          this.clock = 540;
          const sz = [7, 9, 11][turno - 1] || 9;
          this.sub = new MGLaberinto(this, { n: sz });
          this.view = this.sub.view;
          this.goal('Cruza los jardines de Moravia', true, () => this.sub.done && this.sub.score > 0, () => this.sub.score + ' pts');
          this.goal('Recorrido limpio', false, () => (this.sub.errors | 0) === 0, () => 'zen');
        }
      }
      JE.modos.registrar({ id: 'moravia', name: 'Laberinto de Moravia', cls: ModoMoravia, emoji: '🌼', icon: 'usuario',
        niveles: ['Jardín Bajo', 'Sendero Central', 'Mirador'],
        desc: 'Recorre los senderos floridos de Moravia en puzle cenital relajante.',
        how: ['Arrastra o toca la dirección para avanzar por los jardines.', 'Encuentra la salida hacia la estación EnCicla.', 'Ideal para descansar y contemplar el barrio.'] });
    }
  }
})();
