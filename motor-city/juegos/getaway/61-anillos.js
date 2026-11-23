/* =====================================================================
   TURNO CERO · 5.0 · G5-02 · ANILLOS DE RECOGER Y ENTREGAR + CONTROLES DE VUELO
   Módulo aditivo para Turno Cero (juegos/getaway/61-anillos.js):
   1. Anillos proyectados en la calle (3D y 2D) para los puntos de recoger y
      entregar en 📦 Mandados, 🚲 EnCicla y 📞 Contratos de entrega:
      - aro exterior en perspectiva sobre el asfalto (r = 22 m en Mandados,
        16 m / 14 m en EnCicla, 18 m en Contratos);
      - onda concéntrica animada y 4 postes de luz vertical (z = 0.16..2.2 m)
        para distinguir la zona detrás del tráfico;
      - arco radial de progreso (0 % → 100 %) cuando el jugador frena dentro
        del anillo mientras carga o entrega.
   2. Botones táctiles 🔼 Subir (BOT.sube) y 🔽 Bajar (BOT.baja) cuando el
      jugador lleva el jetpack, la avioneta o el avión (C.veh.clase === 'aire'
      o C.veh.vuela), ubicados fuera de la zona libre (412×860 y 860×412)
      y conectados a G.ctl y al empuje de despegue de aeronaves con vmin.
   ===================================================================== */
const AnillosVuelo = {
  version: '5.0.0-g5-02',
  cajaVuelo: null,
  estado: {
    activo: false,
    modo: null,
    fase: 0,
    tipo: null,
    x: 0,
    y: 0,
    radio: 0,
    dist: 0,
    dentro: false,
    progreso: 0,
    verticesProyectados: 0,
    color: null,
    vueloVisible: false,
    subiendo: false,
    bajando: false,
    altitud: 0
  },

  /* Determina si el vehículo actual del jugador vuela (jetpack, avioneta, avión) */
  enVuelo() {
    const C = G.cuerpo;
    return !!(C && C.veh && (C.veh.clase === 'aire' || C.veh.vuela) && !G.viaje && !G.dron && !G.controlExterno);
  },

  /* Devuelve el objetivo activo de recoger/entregar en Mandados, EnCicla o Contratos */
  objetivoActivo() {
    const m = G.Modos && G.Modos.m, C = G.cuerpo;
    if (!C) return null;
    if (m && m.id === 'mandados') {
      const P = m.fase === 0 ? m.o : m.d;
      if (!P) return null;
      return {
        modo: 'mandados',
        fase: m.fase,
        tipo: m.fase === 0 ? 'recoger' : 'entregar',
        x: P.x,
        y: P.y,
        nombre: P.nombre || '',
        radio: 22,
        dur: 1.2,
        esp: m.esp || 0,
        color: m.fase === 0 ? '#ffc23a' : '#3fae5a',
        rgba: m.fase === 0 ? '255,194,58' : '63,174,90',
        icono: '📦'
      };
    }
    if (m && m.id === 'encicla') {
      const P = m.fase === 0 ? m.o : m.d;
      if (!P) return null;
      return {
        modo: 'encicla',
        fase: m.fase,
        tipo: m.fase === 0 ? 'recoger' : 'entregar',
        x: P.x,
        y: P.y,
        nombre: P.nombre || '',
        radio: m.fase === 0 ? 16 : 14,
        dur: .8,
        esp: m.esp || 0,
        color: m.fase === 0 ? '#3fae5a' : '#2dd4bf',
        rgba: m.fase === 0 ? '63,174,90' : '45,212,191',
        icono: '🚲'
      };
    }
    if (!m && G.contrato && G.contrato.c && G.contrato.c.tipo !== 'cobro' && !G.contrato.carrera) {
      const K = G.contrato, P = K.fase === 0 ? K.o : K.d;
      if (!P) return null;
      return {
        modo: 'contrato',
        fase: K.fase,
        tipo: K.fase === 0 ? 'recoger' : 'entregar',
        x: P.x,
        y: P.y,
        nombre: K.fase === 0 ? 'Recoger' : 'Entregar',
        radio: 18,
        dur: K.fase === 0 ? 1.5 : .1,
        esp: K.esp || 0,
        color: K.fase === 0 ? '#dba65f' : '#3fae5a',
        rgba: K.fase === 0 ? '219,166,95' : '63,174,90',
        icono: '📦'
      };
    }
    return null;
  },

  /* Proyecta un polígono circular de radio r (en metros) a altura z sobre (cx, cy) */
  _anilloPuntos(pr, cx, cy, r, z, n = 28, a0 = 0, a1 = TAU) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      const p = pr(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z);
      if (p && Number.isFinite(p[0]) && Number.isFinite(p[1])) pts.push(p);
    }
    return pts;
  },

  /* Dibuja el anillo de recoger o entregar encima del mundo (3D y 2D) */
  dibujarCapas(g, pr, d = 1, t = 0) {
    const info = this.objetivoActivo(), C = G.cuerpo;
    if (!info || !C) {
      this.estado.activo = false;
      this.estado.modo = null;
      this.estado.verticesProyectados = 0;
      this.estado.progreso = 0;
      this.estado.dentro = false;
      return;
    }

    const dist = Math.hypot(info.x - C.x, info.y - C.y);
    const dentro = dist < info.radio;
    const prog = clamp(info.esp / Math.max(.05, info.dur), 0, 1);
    const ptsBase = this._anilloPuntos(pr, info.x, info.y, info.radio, .18, 28);

    this.estado.activo = true;
    this.estado.modo = info.modo;
    this.estado.fase = info.fase;
    this.estado.tipo = info.tipo;
    this.estado.x = info.x;
    this.estado.y = info.y;
    this.estado.radio = info.radio;
    this.estado.dist = +dist.toFixed(2);
    this.estado.dentro = dentro;
    this.estado.progreso = +prog.toFixed(3);
    this.estado.verticesProyectados = ptsBase.length;
    this.estado.color = info.color;

    if (ptsBase.length < 6) return;

    g.save();
    /* 1. Relleno translúcido sobre el pavimento */
    g.fillStyle = 'rgba(' + info.rgba + ',' + (dentro ? '.24' : '.13') + ')';
    g.beginPath();
    g.moveTo(ptsBase[0][0], ptsBase[0][1]);
    for (let i = 1; i < ptsBase.length; i++) g.lineTo(ptsBase[i][0], ptsBase[i][1]);
    g.closePath();
    g.fill();

    /* 2. Borde exterior oscuro de alto contraste + aro principal luminoso */
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(12,14,20,.86)';
    g.lineWidth = (dentro ? 5.6 : 4.4) * d;
    g.stroke();

    g.strokeStyle = info.color;
    g.lineWidth = (dentro ? 3.4 : 2.6) * d;
    g.stroke();

    /* 3. Onda concéntrica interior (contrae al recoger, expande al entregar) */
    const faseOnda = (t * .85) % 1;
    const fOnda = info.fase === 0 ? (1 - faseOnda * .72) : (.28 + faseOnda * .72);
    const ptsOnda = this._anilloPuntos(pr, info.x, info.y, info.radio * fOnda, .22, 24);
    if (ptsOnda.length >= 6) {
      g.strokeStyle = 'rgba(' + info.rgba + ',' + ((1 - faseOnda) * .75 + .15).toFixed(2) + ')';
      g.lineWidth = 2 * d;
      g.beginPath();
      g.moveTo(ptsOnda[0][0], ptsOnda[0][1]);
      for (let i = 1; i < ptsOnda.length; i++) g.lineTo(ptsOnda[i][0], ptsOnda[i][1]);
      g.closePath();
      g.stroke();
    }

    /* 4. Postes verticales de luz y aro elevado para verse detrás del tráfico en 3D */
    if (dist < 260) {
      g.strokeStyle = 'rgba(' + info.rgba + ',.52)';
      g.lineWidth = 1.8 * d;
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2 + t * .45;
        const p0 = pr(info.x + Math.cos(a) * info.radio, info.y + Math.sin(a) * info.radio, .18);
        const p1 = pr(info.x + Math.cos(a) * info.radio, info.y + Math.sin(a) * info.radio, 2.1);
        if (p0 && p1) {
          g.beginPath();
          g.moveTo(p0[0], p0[1]);
          g.lineTo(p1[0], p1[1]);
          g.stroke();
        }
      }
    }

    /* 5. Arco radial de progreso (0 % → 100 %) cuando el jugador espera dentro del anillo */
    if (prog > .01) {
      const ptsProg = this._anilloPuntos(pr, info.x, info.y, info.radio * .88, .35, Math.max(8, Math.round(28 * prog)), -Math.PI / 2, -Math.PI / 2 + prog * TAU);
      if (ptsProg.length >= 2) {
        g.strokeStyle = '#ffffff';
        g.lineWidth = 4.6 * d;
        g.beginPath();
        g.moveTo(ptsProg[0][0], ptsProg[0][1]);
        for (let i = 1; i < ptsProg.length; i++) g.lineTo(ptsProg[i][0], ptsProg[i][1]);
        g.stroke();
      }
    }

    /* 6. Etiqueta flotante sobre el centro del anillo cuando está cerca */
    if (dist < 140) {
      const pc = pr(info.x, info.y, 2.5);
      if (pc) {
        const txt = info.icono + ' ' + (prog > .02 ? Math.min(100, Math.round(prog * 100)) + ' %' : (info.fase === 0 ? 'RECOGER' : 'ENTREGAR'));
        g.font = '800 ' + Math.round(12 * d) + 'px system-ui, sans-serif';
        g.textAlign = 'center';
        g.lineWidth = 3.5 * d;
        g.strokeStyle = 'rgba(12,14,20,.9)';
        g.strokeText(txt, pc[0], pc[1]);
        g.fillStyle = prog > .02 ? '#ffffff' : info.color;
        g.fillText(txt, pc[0], pc[1]);
      }
    }
    g.restore();
  },

  /* Crea los botones táctiles 🔼 Subir y 🔽 Bajar para jetpack, avioneta y avión */
  iniciarUI() {
    if (!G.ui || !G.ui.capa || this.cajaVuelo) return;
    if (!document.getElementById('mc-vuelo-css')) {
      const st = document.createElement('style');
      st.id = 'mc-vuelo-css';
      st.textContent =
        '.mcui .vuelo-ctl{position:absolute;right:8px;top:454px;display:flex;flex-direction:column;gap:6px;width:clamp(48px,calc(20vw - 10px),66px);pointer-events:auto;z-index:22}' +
        '.mcui .vuelo-ctl[hidden]{display:none!important}' +
        '.mcui .vuelo-ctl button{box-sizing:border-box;width:100%;min-width:48px;min-height:48px;padding:4px 2px;border-radius:var(--r,6px);border:1px solid var(--b,rgba(236,230,218,.22));background:var(--f,rgba(12,12,14,.86));color:var(--t,#ece6da);font:700 18px/1 system-ui,sans-serif;cursor:pointer;touch-action:none}' +
        '.mcui .vuelo-ctl button.on{background:var(--a,#e8a33c);color:#0c0e14;border-color:#fff}' +
        '.mcui .vuelo-ctl button small{display:block;font-size:10px;opacity:.9;margin-top:2px}' +
        '.mc-zurdo .mcui .vuelo-ctl{right:auto;left:8px}' +
        '@media (orientation:landscape){.mcui .vuelo-ctl{top:auto;right:242px;bottom:max(14px,env(safe-area-inset-bottom));flex-direction:row;width:auto}.mcui .vuelo-ctl button{width:54px;height:54px}.mc-zurdo .mcui .vuelo-ctl{left:242px;right:auto}}';
      document.head.appendChild(st);
    }

    const box = document.createElement('div');
    box.className = 'vuelo-ctl p';
    box.hidden = true;

    const crearBtn = (id, icono, texto) => {
      const btn = document.createElement('button');
      btn.id = 'b' + id[0].toUpperCase() + id.slice(1);
      btn.className = 'p';
      btn.dataset.vuelo = id;
      btn.setAttribute('aria-label', texto);
      btn.title = texto;
      btn.innerHTML = icono + '<small>' + texto + '</small>';
      const encender = e => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        btn.classList.add('on');
        if (G.ctl) G.ctl.boton(id, true);
      };
      const apagar = () => {
        btn.classList.remove('on');
        if (G.ctl) G.ctl.boton(id, false);
      };
      btn.addEventListener('pointerdown', encender);
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
        btn.addEventListener(ev, apagar);
      }
      box.appendChild(btn);
      BOT[id] = btn;
      return btn;
    };

    crearBtn('sube', '🔼', 'Subir');
    crearBtn('baja', '🔽', 'Bajar');
    G.ui.capa.appendChild(box);
    this.cajaVuelo = box;
  },

  /* Actualiza la visibilidad de los botones 🔼 Subir y 🔽 Bajar en el HUD */
  actualizarHUD() {
    if (!this.cajaVuelo) this.iniciarUI();
    const volando = this.enVuelo();
    if (this.cajaVuelo) this.cajaVuelo.hidden = !volando;
    if (BOT.sube) BOT.sube.hidden = !volando;
    if (BOT.baja) BOT.baja.hidden = !volando;
    if (!volando && G.ctl) {
      if (G.ctl.botones.has('sube')) G.ctl.boton('sube', false);
      if (G.ctl.botones.has('baja')) G.ctl.boton('baja', false);
    }
    this.estado.vueloVisible = volando;
    this.estado.altitud = G.cuerpo ? +(G.cuerpo.z || 0).toFixed(2) : 0;
  },

  /* Inyecta las señales de ascenso/descenso y el empuje de despegue antes de C.actualizar */
  aplicarEntrada(e, ent) {
    const C = G.cuerpo;
    if (!C || !C.veh || !(C.veh.clase === 'aire' || C.veh.vuela)) {
      this.estado.subiendo = false;
      this.estado.bajando = false;
      return;
    }
    const sube = !!(ent && ent.sube) || !!(G.ctl && G.ctl.botones.has('sube'));
    const baja = !!(ent && ent.baja) || !!(G.ctl && G.ctl.botones.has('baja'));
    e.sube = sube;
    e.baja = baja;
    this.estado.subiendo = sube;
    this.estado.bajando = baja;

    /* Evitar que la barra espaciadora (Space = sube) active el freno de mano del carro */
    if (sube && G.ctl && !G.ctl.botones.has('freno') && (e.acel || 0) < 0) {
      e.acel = (ent && ent.acel > 0) ? ent.acel : 0;
    }

    /* En avioneta o avión (con velocidad de pérdida vmin), mantener 🔼 Subir da empuje de despegue */
    if (C.veh.vmin && sube) {
      e.acel = 1;
      e.turbo = true;
      const vDespegue = C.veh.vmin * 1.4;
      if (C.v < vDespegue) {
        C.v = Math.min(C.veh.vmax || vDespegue, Math.max(C.v + (C.veh.acc || 8) * 3.2 * (C._dt || 1 / 60), C.veh.vmin * 1.28));
      }
    }
    this.estado.altitud = +(C.z || 0).toFixed(2);
  }
};

EXTRAS.ui.push(() => AnillosVuelo.iniciarUI());
EXTRAS.hud.push(() => AnillosVuelo.actualizarHUD());
EXTRAS.entrada.push((e, ent) => AnillosVuelo.aplicarEntrada(e, ent));
EXTRAS.capas.push((g, pr, d, t) => AnillosVuelo.dibujarCapas(g, pr, d, t));
G.AnillosVuelo = AnillosVuelo;
