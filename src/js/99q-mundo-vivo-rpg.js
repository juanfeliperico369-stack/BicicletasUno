/* =====================================================================
   MUNDO ABIERTO VIVO + TODOS LOS MÓDULOS EN MODO LIBRE + RPG Y DIARIO (v2.2 · Ronda 3.0 · Gemini/Antigravity)
   1) Todos los módulos cerrados (oficios, puzles Infinity, carreras, Guatapé y skateparks)
      jugables directamente DESDE el mundo abierto con exactamente la misma fluidez y regreso
      al mismo punto del valle.
   2) Progresión RPG con peso real en el mundo (claves registradas vía Save.registrar):
      - 4 habilidades del ciclista (Resistencia, Técnica/Trucos, Oficio/Mecánica, Cultura Cívica)
      - Reputación en 6 zonas/comunas del Valle de Aburrá (Visitante → Vecino → Embajador → Leyenda)
      - Diario Postal del Valle (registro automático de hazañas, actividades y subtramas)
   3) Subtramas emergentes ciudadanas (eventos dinámicos tipo MMO en el barrio actual) y
      Flujo Verde en ciclorrutas.
   ===================================================================== */
(function () {
  /* Registrar claves del guardado para pasar Save.revisarClaves() en tests/run.js */
  if (typeof Save !== 'undefined' && typeof Save.registrar === 'function') {
    Save.registrar('rpg', 'objeto', '99q-mundo-vivo-rpg.js');
    Save.registrar('diario', 'lista', '99q-mundo-vivo-rpg.js');
  }

  const SKILLS = [
    { id: 'resistencia', n: 'Resistencia', ic: '🫀', desc: 'Cansa menos al pedalear largas distancias y lomas.' },
    { id: 'tecnica', n: 'Técnica y Trucos', ic: '🛹', desc: 'Combos más largos en skateparks, parkour y ciclorrutas.' },
    { id: 'mecanica', n: 'Oficio y Mecánica', ic: '🔧', desc: 'Más puntos y hojas al resolver oficios y puzles técnicos.' },
    { id: 'civismo', n: 'Cultura Cívica', ic: '🌿', desc: 'Mayor reputación en las comunas y bonos por saludos y civismo.' }
  ];

  const COMUNAS = [
    { id: 'centro', n: 'Centro · Candelaria' },
    { id: 'laureles', n: 'Laureles · Estadio' },
    { id: 'poblado', n: 'El Poblado · Ciudad del Río' },
    { id: 'norte', n: 'Norte · Carabobo y Bello' },
    { id: 'sur', n: 'Sur · Envigado y Sabaneta' },
    { id: 'occidente', n: 'Occidente · San Javier y Belén' }
  ];

  const RANGOS_REP = [[0, 'Visitante'], [40, 'Vecino'], [110, 'Embajador'], [220, 'Leyenda del Valle']];
  const rangoRep = v => { let r = RANGOS_REP[0][1]; for (const [min, nm] of RANGOS_REP) if (v >= min) r = nm; return r; };

  function comunaDe(x, y) {
    if (!JE.map || !JE.map.zonaAt) return 'centro';
    const z = String((JE.map.zonaAt(x, y) || {}).sub || '').toLowerCase();
    const m = String((JE.map.muniAt && JE.map.muniAt(x, y)) || '').toLowerCase();
    if (/poblado|guayabal/.test(z)) return 'poblado';
    if (/laureles|estadio/.test(z)) return 'laureles';
    if (/san javier|belen|belén|america|américa|robledo/.test(z)) return 'occidente';
    if (/envigado|sabaneta|itag|estrella|caldas/.test(m)) return 'sur';
    if (/bello|copacabana|girardota|barbosa|aranjuez|castilla|manrique|moravia/.test(z + ' ' + m)) return 'norte';
    return 'centro';
  }

  const RPG = JE.rpg = {
    estado() {
      const S = Save.data;
      if (!S.rpg || typeof S.rpg !== 'object' || Array.isArray(S.rpg)) {
        S.rpg = { sk: { resistencia: 0, tecnica: 0, mecanica: 0, civismo: 0 }, rep: {}, hechos: 0, subt: 0 };
      }
      S.rpg.sk = S.rpg.sk || { resistencia: 0, tecnica: 0, mecanica: 0, civismo: 0 };
      S.rpg.rep = S.rpg.rep || {};
      return S.rpg;
    },
    diario() {
      const S = Save.data;
      if (!Array.isArray(S.diario)) S.diario = [];
      return S.diario;
    },
    nivel(id) {
      const xp = (this.estado().sk[id] | 0);
      return Math.min(10, 1 + Math.floor(Math.sqrt(xp / 25)));
    },
    ganarSkill(id, pts, motivo) {
      const E = this.estado(), prev = this.nivel(id);
      E.sk[id] = (E.sk[id] | 0) + Math.max(1, pts | 0);
      const now = this.nivel(id);
      if (now > prev && JE.ui && !JE.headless) {
        const s = SKILLS.find(x => x.id === id);
        JE.ui.toast('⬆️ ' + (s ? s.ic + ' ' + s.n : id) + ' subió a Nivel ' + now + '!');
        Snd.sfx('star');
      }
      if (Game.mode && Game.mode.ride) {
        const com = comunaDe(Game.mode.ride.p.x, Game.mode.ride.p.y);
        E.rep[com] = (E.rep[com] | 0) + Math.max(2, Math.round(pts * .6));
      }
      if (motivo && !JE.headless) this.anotar(motivo);
      Save.save();
    },
    anotar(txt) {
      const D = this.diario(), M = Game.mode;
      const barrio = (M && M.ride && JE.map && JE.map.barrioAt) ? (JE.map.barrioAt(M.ride.p.x, M.ride.p.y) || 'Valle de Aburrá') : 'Valle de Aburrá';
      const hora = M && typeof M.clock === 'number' ? fmtClock(M.clock) : '';
      D.unshift({ t: Date.now(), b: barrio, h: hora, txt: String(txt).slice(0, 140) });
      if (D.length > 40) D.length = 40;
    },

    /* ---------- Catálogo unificado de TODOS los módulos jugables directo dentro del mundo abierto ---------- */
    actividades(M) {
      const clock0 = (M && M.clock) || 540;
      const tm = (M && M.timeMul) || 1;
      const nearSt = M && M.nearStation ? M.nearStation() : null;
      const stName = nearSt ? nearSt.name : 'Estación EnCicla';
      return [
        { id: 'anfitrion', cat: 'Oficios en estaciones', ic: '🧑‍💼', n: 'Ventanilla de Anfitrión', desc: 'Presta y recibe bicis, ajusta el sillín.', sk: 'civismo',
          run: () => new MGAnfitrion(M, { turno: 2, short: true, dur: 40 * tm, cap: 8, clock0, rate: 1.5 }) },
        { id: 'pausas', cat: 'Oficios en estaciones', ic: '🤸', n: 'Pausa Activa (ritmo)', desc: 'Coreografía musical de estiramiento con el equipo.', sk: 'resistencia',
          run: () => new MGPausa(M, { lvl: 1, clock0, st: stName }) },
        { id: 'limpieza', cat: 'Oficios en estaciones', ic: '🧽', n: 'Brigada de Limpieza', desc: 'Deja el habitáculo impecable con las 4 herramientas.', sk: 'civismo',
          run: () => new MGLimpieza(M, { clock0, st: stName, secs: 45 }) },
        { id: 'conteo', cat: 'Oficios en estaciones', ic: '📋', n: 'Inventario de Control', desc: 'Cuenta las bicis ancladas con precisión.', sk: 'civismo',
          run: () => new MGConteo(M, { docks: 8, clock0 }) },
        { id: 'mecanico', cat: 'Taller y Bodega', ic: '🛠️', n: 'Taller Mecánico', desc: 'Diagnostica y repara bicis contra el reloj.', sk: 'mecanica',
          run: () => new MGMecanico(M, { turno: 1, diag: true, short: true, target: 3, maxBikes: 4, dur: 65 * tm, clock0 }) },
        { id: 'ensamble', cat: 'Taller y Bodega', ic: '🔩', n: 'Ensamble de Bici Nueva', desc: 'Arma una EnCicla desde cero siguiendo el manual.', sk: 'mecanica',
          run: () => new MGEnsamble(M, { dur: 70 * tm, clock0 }) },
        { id: 'bodega', cat: 'Taller y Bodega', ic: '📦', n: 'Operación de Bodega', desc: 'Descarga, verifica, organiza y carga pedidos.', sk: 'mecanica',
          run: () => new MGBodega2(M, { boxes: 5, clock0 }) },
        { id: 'tulas', cat: 'Taller y Bodega', ic: '🎒', n: 'Armar Tulas de Apertura', desc: 'Empareja llaves por color y celulares cargados.', sk: 'civismo',
          run: () => new MGTulas(M, { mode: 'armar', names: ['Estadio', 'Berrío', 'Poblado'], clock0 }) },
        { id: 'traffix', cat: 'Tránsito, Metro y Puzles', ic: '🚦', n: 'Semaforero (estilo Traffix)', desc: 'Controla cruces de buses, Metroplús y ciclistas.', sk: 'civismo',
          run: () => new MGTraffix(M, { dur: 35, target: 10 }) },
        { id: 'despacho', cat: 'Tránsito, Metro y Puzles', ic: '🚚', n: 'Despacho (Package Inc.)', desc: 'Dirige camiones y bicis a su estación destino.', sk: 'mecanica',
          run: () => new MGRutas(M, { dur: 40 }) },
        { id: 'maquinista', cat: 'Tránsito, Metro y Puzles', ic: '🚇', n: 'Maquinista Línea A (Metro)', desc: 'Cambia agujas y guía los trenes a tiempo.', sk: 'mecanica',
          run: () => new MGRutas(M, { theme: 'metro', dur: 40 }) },
        { id: 'circuito', cat: 'Tránsito, Metro y Puzles', ic: '🔌', n: 'Circuito (Infinity Loop)', desc: 'Conecta el cableado LED de los anclajes.', sk: 'mecanica',
          run: () => new MGLoop(M, { n: 5 }) },
        { id: 'laser', cat: 'Tránsito, Metro y Puzles', ic: '🔦', n: 'Tótem Óptico (Laser)', desc: 'Alinea espejos para energizar el tótem.', sk: 'mecanica',
          run: () => new MGLaser(M, { n: 5, turns: 3 }) },
        { id: 'moravia', cat: 'Tránsito, Metro y Puzles', ic: '🌼', n: 'Laberinto de Moravia', desc: 'Recorrido zen por los jardines de Moravia.', sk: 'resistencia',
          run: () => new MGLaberinto(M, { n: 9 }) },
        { id: 'llamadas', cat: 'Tránsito, Metro y Puzles', ic: '📞', n: 'Atención al Cliente', desc: 'Resuelve llamadas e inscripciones de usuarios.', sk: 'civismo',
          run: () => new MGLlamadas(M, { dur: 45 * tm, clock0 }) },
        { id: 'guatape', cat: 'Rutas, Carreras y Skate', ic: '🏔️', n: 'Ruta a Guatapé en Bici', desc: 'Cicloturismo por el embalse y La Piedra.', sk: 'resistencia',
          run: () => typeof MGGuatape !== 'undefined' ? new MGGuatape(M, { tramo: 1 }) : null },
        { id: 'run3d', cat: 'Rutas, Carreras y Skate', ic: '🏁', n: 'Runner en Ciclorruta 3D', desc: 'Ciclorruta con giros, anchos y zonas de trucos.', sk: 'tecnica',
          custom: () => M.iniciarRunner3D && M.iniciarRunner3D() }
      ];
    },

    lanzarActividad(M, actId) {
      if (!M || M.sub || !M.ride) return false;
      const item = this.actividades(M).find(a => a.id === actId);
      if (!item) return false;
      if (item.custom) { item.custom(); return true; }
      const mg = item.run();
      if (!mg) return false;
      M.runSub(mg, fin => {
        const pts = Math.max(10, (fin && fin.score) | 0);
        const bonus = Math.round(pts * (1 + (this.nivel(item.sk) - 1) * .08));
        M.score = (M.score | 0) + bonus;
        Save.data.stats.leaves = (Save.data.stats.leaves | 0) + 4;
        const E = this.estado(); E.hechos = (E.hechos | 0) + 1;
        this.ganarSkill(item.sk, 10 + Math.min(18, Math.round(pts / 8)), item.ic + ' ' + item.n + ' completado (+' + bonus + ' pts)');
        if (M.ride) {
          M.ride.stamp = { t: 2.2, title: '¡' + item.n.toUpperCase() + '!', sub: '+' + bonus + ' pts · +4 🍃', bg: PAL.vd };
        }
        Snd.sfx('win');
      });
      return true;
    },

    /* ---------- Subtrama emergente ciudadana (evento dinámico en el mundo abierto) ---------- */
    lanzarSubtrama(M) {
      if (!M || !M.free || !M.ride || M.sub) return null;
      if (M._subt && M._subt.m) M.ride.removeMarker(M._subt.m);
      const R = M.ride, P = R.p;
      const pool = [
        { k: 'rescate', ic: '🚲', titulo: 'Bici olvidada en el parque', sk: 'civismo', act: 'conteo', desc: 'Un vecino reportó una EnCicla sin anclar cerca. Llega y haz inventario.' },
        { k: 'cruce', ic: '🚦', titulo: 'Cruce congestionado', sk: 'civismo', act: 'traffix', desc: 'Se apagó un semáforo en la avenida: ayuda a dar paso a buses y ciclistas.' },
        { k: 'totem', ic: '🔌', titulo: 'Tótem sin señal', sk: 'mecanica', act: 'circuito', desc: 'La Ing. Paola pide apoyo en la estación cercana para reconectar el circuito.' },
        { k: 'bici', ic: '🛠️', titulo: 'Ciclista varado en ruta', sk: 'mecanica', act: 'mecanico', desc: 'Don Jairo te envía a ayudar a un ciclista con cadena y frenos.' }
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const st = JE.map.stations
        .filter(s => dist(s.x, s.y, P.x, P.y) > 80)
        .sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y))[0] || JE.map.stations[0];
      const m = R.marker({
        x: st.x, y: st.y, r: 20, col: '#ff8a3d', label: pick.ic + ' ' + pick.titulo,
        enter: () => {
          R.removeMarker(m); M._subt = null;
          this.estado().subt = (this.estado().subt | 0) + 1;
          this.lanzarActividad(M, pick.act);
        }
      });
      M._subt = { pick, st, m };
      R.target = m;
      R.calcGps();
      if (JE.ui) JE.ui.toast('📻 Subtrama en ' + st.name + ': ' + pick.titulo + ' — ' + pick.desc);
      Snd.sfx('coin');
      return M._subt;
    },

    /* ---------- Ventana unificada: Actividades del Valle + Perfil RPG + Skateparks + Diario ---------- */
    abrirHub(M, tab) {
      if (!M || !M.ride) return;
      Game.paused = true;
      tab = tab || 'act';
      const E = this.estado(), D = this.diario(), acts = this.actividades(M);
      const cats = [...new Set(acts.map(a => a.cat))];
      const tabsHtml = `<div class="seg wrap" style="margin:6px 0 10px">` +
        [['act', '🎮 Actividades'], ['skate', '🛹 Skate & Parkour'], ['rpg', '⭐ Mi RPG y Comunas'], ['diario', '📓 Diario Postal']]
          .map(([k, lb]) => `<button data-ht="${k}" class="${tab === k ? 'on' : ''}">${lb}</button>`).join('') + `</div>`;

      let body = '';
      if (tab === 'act') {
        body += `<p class="m" style="margin:0 0 8px">Juega cualquier oficio, puzle o carrera directamente desde el mundo abierto y regresa aquí mismo con tus premios RPG.</p>`;
        body += `<button class="btn amb sm" id="hSubt" style="width:100%;margin-bottom:10px">📻 Pedir subtrama ciudadana cercana</button>`;
        for (const cat of cats) {
          body += `<div class="pag" style="margin:8px 0 4px">${esc(cat)}</div><div class="act-grid">` +
            acts.filter(a => a.cat === cat).map(a => `<button class="act-card" data-ha="${a.id}"><b>${a.ic} ${esc(a.n)}</b><small>${esc(a.desc)}</small></button>`).join('') + `</div>`;
        }
      } else if (tab === 'skate') {
        const spots = JE.skateSpots || [];
        body += `<p class="m" style="margin:0 0 8px">5 parques reales de Skate, BMX y Parkour integrados en el valle. Toca cualquiera para marcar GPS o viajar ahora.</p><div class="act-grid">` +
          spots.map((s, i) => `<div class="act-card"><b>🛹 ${esc(s.n)}</b><small>${esc(s.barrio)} · ${esc(s.tipo)}</small><div class="row" style="margin-top:6px"><button class="btn sm pri" data-skgo="${i}">📍 Ir ahora</button><button class="btn sm" data-skgps="${i}">🧭 GPS</button></div></div>`).join('') + `</div>`;
      } else if (tab === 'rpg') {
        body += `<div class="pag">Habilidades del ciclista · ${E.hechos | 0} actividades · ${E.subt | 0} subtramas</div><div class="rpg-grid">` +
          SKILLS.map(s => {
            const lv = this.nivel(s.id), xp = E.sk[s.id] | 0, next = lv * lv * 25, pct = Math.min(100, Math.round(100 * xp / Math.max(1, next)));
            return `<div class="rpg-card"><b>${s.ic} ${esc(s.n)} · Nv.${lv}</b><div class="rpg-bar"><i style="width:${pct}%"></i></div><small class="m">${esc(s.desc)}</small></div>`;
          }).join('') + `</div><div class="pag" style="margin-top:10px">Reputación por comuna / zona</div><div class="rpg-grid">` +
          COMUNAS.map(c => {
            const v = E.rep[c.id] | 0;
            return `<div class="rpg-card"><b>${esc(c.n)}</b><small class="m">${rangoRep(v)} · ${v} rep</small></div>`;
          }).join('') + `</div>`;
      } else {
        body += `<div class="pag">Crónica de tus recorridos por el Valle (${D.length})</div>`;
        if (!D.length) body += `<p class="m">Aún no hay entradas. Completa una actividad, aterriza un truco en un skatepark o haz una subtrama para estrenar tu diario.</p>`;
        else body += `<div class="col" style="max-height:46vh;overflow:auto">` + D.map(e => `<div class="rpg-card"><b>${esc(e.b)}${e.h ? ' · ' + esc(e.h) : ''}</b><small class="m">${esc(e.txt)}</small></div>`).join('') + `</div>`;
      }

      UI.modal(`<h2>🗺️ Valle Vivo · Actividades y RPG</h2>${tabsHtml}${body}<div class="col"><button class="btn gh" id="hClose">▶ Seguir rodando</button></div>`, () => {
        const resume = () => { UI.closeModal(); if (Game.paused) Game.resume(); };
        $$('[data-ht]').forEach(b => b.onclick = () => { Snd.sfx('tap'); this.abrirHub(M, b.dataset.ht); });
        $$('[data-ha]').forEach(b => b.onclick = () => { resume(); this.lanzarActividad(M, b.dataset.ha); });
        const sb = $('#hSubt'); if (sb) sb.onclick = () => { resume(); this.lanzarSubtrama(M); };
        $$('[data-skgo]').forEach(b => b.onclick = () => {
          const s = (JE.skateSpots || [])[+b.dataset.skgo]; if (!s) return;
          M.ride.p.x = s.x; M.ride.p.y = s.y; M.ride.cam.x = s.x; M.ride.cam.y = s.y;
          resume();
          if (JE.ui) JE.ui.toast('🛹 Llegaste a ' + s.n + ' · ¡A hacer trucos!');
        });
        $$('[data-skgps]').forEach(b => b.onclick = () => {
          const s = (JE.skateSpots || [])[+b.dataset.skgps]; if (!s) return;
          const mk = M.ride.marker({ x: s.x, y: s.y, r: 22, col: s.col, label: '🛹 ' + s.n, enter: m2 => M.ride.removeMarker(m2) });
          M.ride.target = mk; M.ride.calcGps(); resume();
          if (JE.ui) JE.ui.toast('🧭 Ruta marcada hacia ' + s.n);
        });
        $('#hClose').onclick = resume;
      });
    }
  };

  /* Agregar el botón «🗺️ Actividades» en Modo Libre (dentro de la bandeja ⋯ Más, sin alterar Devolver/Taller) */
  const _act99q = ModeUsuarioR.prototype.actions;
  ModeUsuarioR.prototype.actions = function () {
    const a = _act99q.call(this);
    if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
    a.push({ id: 'actividades', icon: 'monitoreo', label: 'Actividades', fn: () => RPG.abrirHub(this, 'act') });
    return a;
  };

  /* También acceso directo en el menú de Pausa en Modo Libre */
  const _pause99q = Game.pause;
  Game.pause = function () {
    _pause99q.call(this);
    const go = $('#pGo'), M = this.mode;
    if (!go || !M || !M.free || !M.ride || $('#pHub')) return;
    const b = document.createElement('button');
    b.className = 'btn'; b.id = 'pHub'; b.textContent = '🗺️ Actividades, Skate y RPG';
    go.after(b);
    b.onclick = () => RPG.abrirHub(M, 'act');
  };

  /* Peso real del RPG y Flujo Verde en Modo Libre:
     - Resistencia reduce el desgaste de energía
     - Rodar limpio por ciclorrutas carga el Flujo Verde y da puntos + XP de resistencia */
  const _tick99q = ModeUsuarioR.prototype.tick;
  ModeUsuarioR.prototype.tick = function (dt) {
    const e0 = this.energy;
    _tick99q.call(this, dt);
    if (!this.free || this.sub || JE.headless) return;
    const resLv = RPG.nivel('resistencia');
    if (resLv > 1 && this.energy < e0 && this.energy > 0) {
      /* Recupera parte del gasto según nivel de Resistencia (hasta 30 % menos fatiga) */
      this.energy = Math.min(100, this.energy + (e0 - this.energy) * Math.min(.30, (resLv - 1) * .035));
    }
    const R = this.ride;
    if (R && R.p.v > 35 * WK && R.tileAt() === TT.CICLO) {
      this._flujoT = (this._flujoT || 0) + dt;
      if (this._flujoT >= 8) {
        this._flujoT = 0;
        this.score = (this.score | 0) + 10;
        R.float('🌿 Flujo Verde +10', PAL.vd1);
        RPG.ganarSkill('resistencia', 3);
      }
    } else if (this._flujoT > 0) {
      this._flujoT = Math.max(0, this._flujoT - dt * .5);
    }
  };
})();
