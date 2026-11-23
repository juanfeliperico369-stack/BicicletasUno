/* =====================================================================
   MUNDO ABIERTO VIVO + HUB DE 22+ ACTIVIDADES + REPUTACIÓN + ARCOS DE MENTORES (v3.3 · Gemini/Antigravity)
   Armonizado 100 % con 99b-actividades.js (Claude), 99h-valle-vivo.js (Claude) y 99r-ciclo-geometria-gpt6.js (GPT-6):
   1) Registra SOLO la clave 'rpg' (objeto) en Save.registrar y escribe directo en JE.diario (99h)
      para cero colisiones de claves del guardado y una única crónica del Valle.
   2) Hub «🗺️ Valle Vivo» en Más y Pausa con 22+ actividades jugables desde Modo Libre con regreso exacto:
      - Copa del Valle (Super Arcade Racing), Domicilio Sostenible, Monitoreo 911, El Planeador,
        Metro 2D Lateral (Tiny Rails), Bajada Las Palmas, Turno Roguelite, 5 modos Infinity,
        oficios EnCicla, Ruta a Guatapé, Freerun Comuna 13 y Runner en Ciclorruta.
   3) Reputación por 6 comunas (Visitante → Vecino → Embajador → Leyenda) + 4 habilidades RPG +
      6 arcos encadenados de 3 encargos con mentores canónicos de CAST (Luz, Santi, Don Jairo,
      Ing. Paola, Cata y Rosalba) + subtramas ciudadanas emergentes.
   ===================================================================== */
(function () {
  if (typeof Save !== 'undefined' && typeof Save.registrar === 'function') {
    Save.registrar('rpg', 'objeto', 'reputación, arcos de mentores y copas (99q-mundo-vivo-rpg.js)');
  }

  const SKILLS = [
    { id: 'resistencia', n: 'Resistencia', ic: '🫀', desc: 'Reduce hasta 30 % el cansancio al pedalear largas lomas.' },
    { id: 'tecnica', n: 'Técnica y Trucos', ic: '🛹', desc: 'Combos y puntaje extra en skateparks, freerun y ciclorrutas.' },
    { id: 'mecanica', n: 'Oficio y Estrategia', ic: '🔧', desc: 'Bonos en oficios, puzles, Monitoreo 911 y El Planeador.' },
    { id: 'civismo', n: 'Cultura Cívica', ic: '🌿', desc: 'Mayor reputación por comuna y bonos en encargos vecinales.' }
  ];

  const COMUNAS = [
    { id: 'centro', n: 'Centro · Candelaria' },
    { id: 'laureles', n: 'Laureles · Estadio' },
    { id: 'poblado', n: 'El Poblado · Ciudad del Río' },
    { id: 'norte', n: 'Norte · Carabobo y Bello' },
    { id: 'sur', n: 'Sur · Envigado y Sabaneta' },
    { id: 'occidente', n: 'Occidente · San Javier y Belén' }
  ];

  /* 6 arcos encadenados de 3 encargos (100 % coherentes con CAST de 66-historia.js) */
  const ARCOS = [
    { id: 'luz', quien: 'Luz · Usuaria experta', ic: '🚲', pasos: [
      { t: 'Bajada dorada por Las Palmas', act: 'palmas', desc: 'Rueda al atardecer cuidando la distancia de 1,5 m (Ley 1811).' },
      { t: 'Sprint en Copa del Valle', act: 'copa', desc: 'Usa el rebufo en circuito callejero con Luz animando desde la acera.' },
      { t: 'Domicilio solidario de barrio', act: 'domicilio', desc: 'Lleva café de origen y arepas sin un solo golpe.' }
    ] },
    { id: 'santi', quien: 'Santi · Anfitrión de estación', ic: '🧑‍💼', pasos: [
      { t: 'Ventanilla en hora pico', act: 'anfitrion', desc: 'Presta y recibe bicis ajustando el sillín con una sonrisa.' },
      { t: 'Inventario sin un fallo', act: 'conteo', desc: 'Cuadra el número exacto de anclajes de la estación.' },
      { t: 'Brigada limpia del parque', act: 'limpieza', desc: 'Deja el habitáculo impecable para la jornada de la tarde.' }
    ] },
    { id: 'jairo', quien: 'Don Jairo · Mecánico maestro', ic: '🛠️', pasos: [
      { t: 'Diagnóstico exprés en taller', act: 'mecanico', desc: 'Frenos, cadena y presión de llantas contra el reloj.' },
      { t: 'Ensamble de EnCicla nueva', act: 'ensamble', desc: 'Arma una bicicleta completa desde cero siguiendo el manual.' },
      { t: 'Racha Roguelite del taller', act: 'roguelite', desc: 'Supera una cadena de retos con una sola vida y mejoras al azar.' }
    ] },
    { id: 'paola', quien: 'Ing. Paola · Técnica de tótems', ic: '🔌', pasos: [
      { t: 'Reconectar circuito LED', act: 'circuito', desc: 'Cierra la red eléctrica de los anclajes sin puntas abiertas.' },
      { t: 'Calibrar tótem óptico', act: 'laser', desc: 'Alinea los espejos del lector Cívica con precisión.' },
      { t: 'Planear nuevas estaciones', act: 'planeador', desc: 'Expande la red sostenible hacia las comunas con menor cobertura.' }
    ] },
    { id: 'cata', quien: 'Cata · Centro de Control', ic: '📡', pasos: [
      { t: 'Cruce Metroplús fluido', act: 'traffix', desc: 'Sincroniza los semáforos para dar vía sin represamientos.' },
      { t: 'Despacho de balanceo', act: 'despacho', desc: 'Redirige camiones a las estaciones que más bicis piden.' },
      { t: 'Guardia en Monitoreo 911', act: 'monitoreo911', desc: 'Coordina en vivo camiones, técnicos y agentes por todo el Valle.' }
    ] },
    { id: 'rosalba', quien: 'Rosalba · Conductora de El Metro', ic: '🚇', pasos: [
      { t: 'Viaje lateral por la Línea A', act: 'metro2d', desc: 'Conduce el Metro en 2D lateral parando exacto en cada andén.' },
      { t: 'Agujas ferroviarias en hora pico', act: 'maquinista', desc: 'Guía cada tren hacia su estación de color sin retrasos.' },
      { t: 'Paseo zen por Moravia', act: 'moravia', desc: 'Cierra el turno caminando entre los jardines comunitarios.' }
    ] }
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
        S.rpg = { sk: { resistencia: 0, tecnica: 0, mecanica: 0, civismo: 0 }, rep: {}, arcos: {}, copas: {}, hechos: 0, subt: 0 };
      }
      S.rpg.sk = S.rpg.sk || { resistencia: 0, tecnica: 0, mecanica: 0, civismo: 0 };
      S.rpg.rep = S.rpg.rep || {};
      S.rpg.arcos = S.rpg.arcos || {};
      S.rpg.copas = S.rpg.copas || {};
      return S.rpg;
    },
    nivel(id) {
      const xp = (this.estado().sk[id] | 0);
      return Math.min(10, 1 + Math.floor(Math.sqrt(xp / 25)));
    },
    anotar(txt, ico) {
      if (JE.diario && typeof JE.diario.anotar === 'function') {
        JE.diario.anotar(txt, ico || '🌿');
      }
    },
    guardarCopa(id, seg, pos) {
      const E = this.estado(), prev = E.copas[id];
      if (!prev || seg < prev.seg) E.copas[id] = { seg: +seg.toFixed(1), pos };
      Save.save();
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
      if (motivo && !JE.headless) this.anotar(motivo, '⭐');
      Save.save();
    },

    /* ---------- Catálogo unificado de 22+ actividades jugables desde Modo Libre ---------- */
    actividades(M) {
      const clock0 = (M && M.clock) || 540;
      const tm = (M && M.timeMul) || 1;
      const nearSt = M && M.nearStation ? M.nearStation() : null;
      const stName = nearSt ? nearSt.name : 'Estación EnCicla';
      return [
        /* Carreras, Rutas y Acción */
        { id: 'copa', cat: 'Carreras, Rutas y Acción', ic: '🏆', n: 'Copa del Valle (Arcade)', desc: 'Circuitos callejeros estilo Super Arcade Racing con rivales y rebufo.', sk: 'tecnica',
          modo: ['copa', 1] },
        { id: 'domicilio', cat: 'Carreras, Rutas y Acción', ic: '🍔', n: 'Domicilio Sostenible', desc: 'Entregas contrarreloj en bici estilo Crazy Taxi / Parcel Corps.', sk: 'resistencia',
          modo: ['domicilio', 1] },
        { id: 'palmas', cat: 'Carreras, Rutas y Acción', ic: '🌅', n: 'Bajada por Las Palmas', desc: 'Descenso lateral al atardecer estilo Alto\'s Odyssey + Ley 1811.', sk: 'tecnica',
          run: () => JE.MGPalmas ? new JE.MGPalmas(M, { metaM: 1200 }) : null },
        { id: 'metro2d', cat: 'Carreras, Rutas y Acción', ic: '🚇', n: 'Metro 2D Lateral', desc: 'Viaje lateral por la Línea A de Medellín estilo Tiny Rails.', sk: 'civismo',
          run: () => JE.MGMetro2D ? new JE.MGMetro2D(M, { ini: 7, tramos: 5 }) : null },
        { id: 'freerun', cat: 'Carreras, Rutas y Acción', ic: '🧗', n: 'Freerun Comuna 13', desc: 'Parkour lateral en las escaleras eléctricas con trucos por gesto.', sk: 'tecnica',
          run: () => JE.MGFreerun ? new JE.MGFreerun(M, { lvl: 1 }) : null },
        { id: 'guatape', cat: 'Carreras, Rutas y Acción', ic: '🏔️', n: 'Ruta a Guatapé en Bici', desc: 'Cicloturismo por el embalse, fondas culturales y La Piedra.', sk: 'resistencia',
          run: () => typeof MGGuatape !== 'undefined' ? new MGGuatape(M, { tramo: 1 }) : null },
        { id: 'run3d', cat: 'Carreras, Rutas y Acción', ic: '🏁', n: 'Runner en Ciclorruta 3D', desc: 'Ciclorruta real con giros, anchos variables y trucos.', sk: 'tecnica',
          custom: () => M.iniciarRunner3D && M.iniciarRunner3D() },
        /* Estrategia, Tránsito y Puzles */
        { id: 'monitoreo911', cat: 'Estrategia, Tránsito y Puzles', ic: '📡', n: 'Monitoreo 911 del Valle', desc: 'Despacha camiones, técnicos y agentes en vivo (911 Operator).', sk: 'mecanica',
          run: () => JE.MGMonitoreo911 ? new JE.MGMonitoreo911(M, { dur: 40, meta: 5 }) : null },
        { id: 'planeador', cat: 'Estrategia, Tránsito y Puzles', ic: '🏙️', n: 'El Planeador del Valle', desc: 'Construye estaciones, ciclorrutas y guayacanes (Cities/Townscaper).', sk: 'mecanica',
          run: () => JE.MGPlaneador ? new JE.MGPlaneador(M, { presupuesto: 120, metaCob: 70 }) : null },
        { id: 'roguelite', cat: 'Estrategia, Tránsito y Puzles', ic: '🎲', n: 'Turno Roguelite (5 rondas)', desc: 'Una sola vida y 3 mejoras al azar entre rondas (Soul Knight).', sk: 'mecanica',
          run: () => JE.MGRoguelite ? new JE.MGRoguelite(M, { rondas: 3 }) : null },
        { id: 'traffix', cat: 'Estrategia, Tránsito y Puzles', ic: '🚦', n: 'Semaforero (Traffix)', desc: 'Controla cruces de buses, Metroplús y ciclistas sin choques.', sk: 'civismo',
          run: () => new MGTraffix(M, { dur: 35, target: 10 }) },
        { id: 'despacho', cat: 'Estrategia, Tránsito y Puzles', ic: '🚚', n: 'Despacho (Package Inc.)', desc: 'Dirige camiones y bicis por desvíos a su estación destino.', sk: 'mecanica',
          run: () => new MGRutas(M, { dur: 40 }) },
        { id: 'maquinista', cat: 'Estrategia, Tránsito y Puzles', ic: '🛤️', n: 'Maquinista Línea A (Railways)', desc: 'Cambia agujas y guía los trenes a su estación por color.', sk: 'mecanica',
          run: () => new MGRutas(M, { theme: 'metro', dur: 40 }) },
        { id: 'circuito', cat: 'Estrategia, Tránsito y Puzles', ic: '🔌', n: 'Circuito LED (Infinity Loop)', desc: 'Conecta el cableado de los anclajes sin puntas abiertas.', sk: 'mecanica',
          run: () => new MGLoop(M, { n: 5 }) },
        { id: 'laser', cat: 'Estrategia, Tránsito y Puzles', ic: '🔦', n: 'Tótem Óptico (Laser)', desc: 'Alinea espejos para energizar el tótem lector.', sk: 'mecanica',
          run: () => new MGLaser(M, { n: 5, turns: 3 }) },
        { id: 'moravia', cat: 'Estrategia, Tránsito y Puzles', ic: '🌼', n: 'Laberinto de Moravia', desc: 'Recorrido zen entre las flores de los jardines de Moravia.', sk: 'resistencia',
          run: () => new MGLaberinto(M, { n: 9 }) },
        /* Oficios EnCicla */
        { id: 'anfitrion', cat: 'Oficios EnCicla', ic: '🧑‍💼', n: 'Ventanilla de Anfitrión', desc: 'Presta y recibe bicis, ajusta el sillín.', sk: 'civismo',
          run: () => new MGAnfitrion(M, { turno: 2, short: true, dur: 40 * tm, cap: 8, clock0, rate: 1.5 }) },
        { id: 'pausas', cat: 'Oficios EnCicla', ic: '🤸', n: 'Pausa Activa (ritmo)', desc: 'Coreografía musical de estiramiento con el equipo.', sk: 'resistencia',
          run: () => new MGPausa(M, { lvl: 1, clock0, st: stName }) },
        { id: 'limpieza', cat: 'Oficios EnCicla', ic: '🧽', n: 'Brigada de Limpieza', desc: 'Deja el habitáculo impecable con las 4 herramientas.', sk: 'civismo',
          run: () => new MGLimpieza(M, { clock0, st: stName, secs: 45 }) },
        { id: 'conteo', cat: 'Oficios EnCicla', ic: '📋', n: 'Inventario de Control', desc: 'Cuenta las bicis ancladas con precisión.', sk: 'civismo',
          run: () => new MGConteo(M, { docks: 8, clock0 }) },
        { id: 'mecanico', cat: 'Oficios EnCicla', ic: '🛠️', n: 'Taller Mecánico', desc: 'Diagnostica y repara bicis contra el reloj.', sk: 'mecanica',
          run: () => new MGMecanico(M, { turno: 1, diag: true, short: true, target: 3, maxBikes: 4, dur: 65 * tm, clock0 }) },
        { id: 'ensamble', cat: 'Oficios EnCicla', ic: '🔩', n: 'Ensamble de Bici Nueva', desc: 'Arma una EnCicla desde cero siguiendo el manual.', sk: 'mecanica',
          run: () => new MGEnsamble(M, { dur: 70 * tm, clock0 }) },
        { id: 'bodega', cat: 'Oficios EnCicla', ic: '📦', n: 'Operación de Bodega', desc: 'Descarga, verifica, organiza y carga pedidos.', sk: 'mecanica',
          run: () => new MGBodega2(M, { boxes: 5, clock0 }) },
        { id: 'llamadas', cat: 'Oficios EnCicla', ic: '📞', n: 'Atención al Cliente', desc: 'Resuelve llamadas e inscripciones de usuarios.', sk: 'civismo',
          run: () => new MGLlamadas(M, { dur: 45 * tm, clock0 }) }
      ];
    },

    lanzarActividad(M, actId, onWin) {
      if (!M || M.sub || !M.ride) return false;
      const item = this.actividades(M).find(a => a.id === actId);
      if (!item) return false;
      if (item.modo && typeof Actividades !== 'undefined') {
        if (onWin) onWin();
        Actividades.jugar(M, item.modo[0], item.modo[1]);
        return true;
      }
      if (item.custom) { item.custom(); return true; }
      const mg = item.run();
      if (!mg) return false;
      M.runSub(mg, fin => {
        const pts = Math.max(10, (fin && fin.score) | 0);
        const bonus = Math.round(pts * (1 + (this.nivel(item.sk) - 1) * .08));
        M.score = (M.score | 0) + bonus;
        Save.data.stats.leaves = (Save.data.stats.leaves | 0) + 4;
        const E = this.estado(); E.hechos = (E.hechos | 0) + 1;
        this.ganarSkill(item.sk, 10 + Math.min(18, Math.round(pts / 8)), item.ic + ' ' + item.n + ' (+' + bonus + ' pts)');
        if (onWin) onWin();
        if (M.ride) M.ride.stamp = { t: 2.2, title: '¡' + item.n.toUpperCase() + '!', sub: '+' + bonus + ' pts · +4 🍃', bg: PAL.vd };
        Snd.sfx('win');
      });
      return true;
    },

    /* Avanzar un paso en el arco encadenado de un mentor */
    jugarArco(M, arcoId) {
      const arco = ARCOS.find(a => a.id === arcoId); if (!arco) return false;
      const E = this.estado(), idx = E.arcos[arcoId] | 0;
      const paso = arco.pasos[Math.min(idx, arco.pasos.length - 1)];
      return this.lanzarActividad(M, paso.act, () => {
        if ((E.arcos[arcoId] | 0) < arco.pasos.length) {
          E.arcos[arcoId] = (E.arcos[arcoId] | 0) + 1;
          Save.data.stats.leaves = (Save.data.stats.leaves | 0) + 8;
          this.ganarSkill('civismo', 12, arco.quien + ': completaste «' + paso.t + '»');
          Save.save();
        }
      });
    },

    /* ---------- Subtrama emergente ciudadana (siempre en la estación más cercana >80 px) ---------- */
    lanzarSubtrama(M) {
      if (!M || !M.free || !M.ride || M.sub) return null;
      if (M._subt && M._subt.m) M.ride.removeMarker(M._subt.m);
      const R = M.ride, P = R.p;
      const pool = [
        { k: 'rescate', ic: '🚲', titulo: 'Bici olvidada en el parque', act: 'conteo', desc: 'Un vecino reportó una EnCicla sin anclar cerca. Llega y haz inventario.' },
        { k: 'cruce', ic: '🚦', titulo: 'Cruce Metroplús congestionado', act: 'traffix', desc: 'Se apagó un semáforo en la avenida: ayuda a dar paso a buses y ciclistas.' },
        { k: 'totem', ic: '🔌', titulo: 'Tótem sin señal', act: 'circuito', desc: 'La Ing. Paola pide apoyo en la estación cercana para reconectar el circuito.' },
        { k: 'emergencia', ic: '📡', titulo: 'Reporte del Centro 911', act: 'monitoreo911', desc: 'Cata pide apoyo despachando unidades para destrabar la hora pico.' },
        { k: 'bici', ic: '🛠️', titulo: 'Ciclista varado en ruta', act: 'mecanico', desc: 'Don Jairo te envía a ayudar a un ciclista con cadena y frenos.' }
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

    /* ---------- Ventana unificada: 22+ Actividades · Arcos de Mentores · Skate & Copa · RPG & Comunas ---------- */
    abrirHub(M, tab) {
      if (!M || !M.ride) return;
      Game.paused = true;
      tab = tab || 'act';
      const E = this.estado(), acts = this.actividades(M);
      const cats = [...new Set(acts.map(a => a.cat))];
      const tabsHtml = `<div class="seg wrap" style="margin:6px 0 10px">` +
        [['act', '🎮 24 Actividades'], ['arcos', '🤝 Encargos'], ['spots', '🛹 Skate & Copa'], ['rpg', '⭐ Comunas y RPG']]
          .map(([k, lb]) => `<button data-ht="${k}" class="${tab === k ? 'on' : ''}">${lb}</button>`).join('') + `</div>`;

      let body = '';
      if (tab === 'act') {
        body += `<p class="m" style="margin:0 0 8px">Juega cualquier carrera, puzle, simulación u oficio directamente desde el mundo abierto y regresa al mismo punto.</p>`;
        body += `<button class="btn amb sm" id="hSubt" style="width:100%;margin-bottom:10px">📻 Pedir subtrama ciudadana cercana</button>`;
        for (const cat of cats) {
          body += `<div class="pag" style="margin:8px 0 4px">${esc(cat)}</div><div class="act-grid">` +
            acts.filter(a => a.cat === cat).map(a => `<button class="act-card" data-ha="${a.id}"><b>${a.ic} ${esc(a.n)}</b><small>${esc(a.desc)}</small></button>`).join('') + `</div>`;
        }
      } else if (tab === 'arcos') {
        body += `<p class="m" style="margin:0 0 8px">Encargos encadenados (3 pasos) con los mentores de EnCicla y El Metro. Cada paso sube tu reputación en la comuna.</p><div class="col" style="gap:8px;max-height:50vh;overflow:auto">` +
          ARCOS.map(a => {
            const pIdx = E.arcos[a.id] | 0, fin = pIdx >= a.pasos.length, paso = a.pasos[Math.min(pIdx, a.pasos.length - 1)];
            return `<div class="rpg-card"><b>${a.ic} ${esc(a.quien)} · ${Math.min(pIdx, a.pasos.length)}/${a.pasos.length}</b><small class="m">${fin ? '✅ Arco completado · puedes repetir el último reto' : 'Siguiente: ' + esc(paso.t) + ' — ' + esc(paso.desc)}</small><div class="row" style="margin-top:6px"><button class="btn sm ${fin ? '' : 'pri'}" data-arco="${a.id}">${fin ? '↻ Repetir' : '▶ Aceptar encargo'}</button></div></div>`;
          }).join('') + `</div>`;
      } else if (tab === 'spots') {
        const spots = JE.skateSpots || [], copas = JE.copaSpots || [];
        body += `<div class="pag">🏆 Copa del Valle (circuitos callejeros reales)</div><div class="act-grid">` +
          copas.map((cp, i) => {
            const rec = E.copas[cp.id];
            return `<div class="act-card"><b>🏁 ${esc(cp.n)}</b><small>${rec ? 'Récord: ' + rec.seg + ' s (' + rec.pos + '.°)' : '2 vueltas · 3 rivales IA · rebufo'}</small><div class="row" style="margin-top:6px"><button class="btn sm pri" data-cpgo="${i}">🏁 Correr</button></div></div>`;
          }).join('') + `</div><div class="pag" style="margin-top:8px">🛹 5 Skateparks y Parkour abiertos</div><div class="act-grid">` +
          spots.map((s, i) => `<div class="act-card"><b>🛹 ${esc(s.n)}</b><small>${esc(s.barrio)} · ${esc(s.tipo)}</small><div class="row" style="margin-top:6px"><button class="btn sm pri" data-skgo="${i}">📍 Ir ahora</button><button class="btn sm" data-skgps="${i}">🧭 GPS</button></div></div>`).join('') + `</div>`;
      } else {
        body += `<div class="pag">Habilidades RPG · ${E.hechos | 0} actividades · ${E.subt | 0} subtramas</div><div class="rpg-grid">` +
          SKILLS.map(s => {
            const lv = this.nivel(s.id), xp = E.sk[s.id] | 0, next = lv * lv * 25, pct = Math.min(100, Math.round(100 * xp / Math.max(1, next)));
            return `<div class="rpg-card"><b>${s.ic} ${esc(s.n)} · Nv.${lv}</b><div class="rpg-bar"><i style="width:${pct}%"></i></div><small class="m">${esc(s.desc)}</small></div>`;
          }).join('') + `</div><div class="pag" style="margin-top:10px">Reputación por comuna / zona</div><div class="rpg-grid">` +
          COMUNAS.map(c => {
            const v = E.rep[c.id] | 0;
            return `<div class="rpg-card"><b>${esc(c.n)}</b><small class="m">${rangoRep(v)} · ${v} rep</small></div>`;
          }).join('') + `</div>`;
      }

      UI.modal(`<h2>🗺️ Valle Vivo · Todo el Valle</h2>${tabsHtml}${body}<div class="col"><button class="btn gh" id="hClose">▶ Seguir rodando</button></div>`, () => {
        const resume = () => { UI.closeModal(); if (Game.paused) Game.resume(); };
        $$('[data-ht]').forEach(b => b.onclick = () => { Snd.sfx('tap'); this.abrirHub(M, b.dataset.ht); });
        $$('[data-ha]').forEach(b => b.onclick = () => { resume(); this.lanzarActividad(M, b.dataset.ha); });
        $$('[data-arco]').forEach(b => b.onclick = () => { resume(); this.jugarArco(M, b.dataset.arco); });
        $$('[data-cpgo]').forEach(b => b.onclick = () => { resume(); if (typeof Actividades !== 'undefined') Actividades.jugar(M, 'copa', (+b.dataset.cpgo) + 1); });
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

  /* Efecto real de la habilidad Resistencia: reduce cansancio al pedalear en Modo Libre */
  if (typeof ModeUsuarioR !== 'undefined' && ModeUsuarioR.prototype.tick) {
    const _tick99q = ModeUsuarioR.prototype.tick;
    ModeUsuarioR.prototype.tick = function (dt) {
      const e0 = this.energy;
      const r = _tick99q.call(this, dt);
      if (this.free && typeof this.energy === 'number' && typeof e0 === 'number' && this.energy < e0 && !JE.headless) {
        const red = Math.min(.30, (RPG.nivel('resistencia') - 1) * .035);
        if (red > 0) this.energy = Math.min(100, this.energy + (e0 - this.energy) * red);
      }
      if (this.free && this.ride && this.ride.p.v > 20 * WK && this.ride.tileAt() === TT.CICLO && !JE.headless) {
        this._flujoT = (this._flujoT || 0) + dt;
        if (this._flujoT >= 8) {
          this._flujoT = 0; this.score = (this.score | 0) + 15;
          this.ride.float('🟢 Flujo Verde +15', '#9bd341');
          RPG.ganarSkill('resistencia', 3);
        }
      }
      return r;
    };
  }

  /* Botón «🗺️ Valle Vivo» en ⋯ Más (sin desplazar Devolver/Oficios de HUD21.CTX) y en Pausa */
  const _act99q = ModeUsuarioR.prototype.actions;
  ModeUsuarioR.prototype.actions = function () {
    const a = _act99q.call(this);
    if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
    a.push({ id: 'actividades', icon: 'mapa', label: 'Valle Vivo', fn: () => RPG.abrirHub(this, 'act') });
    return a;
  };

  const _pause99q = Game.pause;
  Game.pause = function () {
    _pause99q.call(this);
    const go = $('#pGo'), M = this.mode;
    if (!go || !M || !M.free || !M.ride || $('#pHubValle')) return;
    const b = document.createElement('button');
    b.className = 'btn amb'; b.id = 'pHubValle';
    b.textContent = '🗺️ Valle Vivo (24 actividades · Encargos · RPG)';
    const ref = $('#pVista') || $('#pVel') || go;
    ref.after(b);
    b.onclick = () => { Snd.sfx('tap'); RPG.abrirHub(M, 'act'); };
  };
})();
