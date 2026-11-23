/* =====================================================================
   TURNO CERO · 5.2 · G5-04 · MINIJUEGOS TÁCTILES CORTOS (idea de Chinatown Wars)
   Módulo 100 % aditivo sobre G.ui (juegos/getaway/64-minijuegos.js):
   - Turno Cero (18+):
       1) puentear — unir 3 pares de cables de color con el dedo (15 s);
       2) chapa    — alinear 3 pines de cilindro en la línea de corte (18 s).
   - Familia / bici (todo público, sin violencia):
       3) llanta   — bombear la llanta de la bici a la banda óptima 50–62 PSI (16 s);
       4) cadena   — encarrilar la cadena de la bici pasando por 3 guías del piñón (16 s).
   Contratos de calidad móvil:
   - Sobre G.ui (clase 'dialogo' reconocida por MC.UI.verificar, cero solapamientos);
   - 10 a 20 s, salida inmediata (✕ Salir >= 48x48 px y tecla Escape), jamás bloquea;
   - Pointer Events con touch-action:none, setPointerCapture y pointercancel seguro;
   - Teclado de respaldo para accesibilidad + estética taller sin clichés genéricos.
   ===================================================================== */
const Minijuegos = {
  version: '5.2.0-g5-04',
  activo: null,
  _cssInyectado: false,
  stats: { jugados: 0, ganados: 0, cancelados: 0, ultimo: null },

  DEF: {
    puentear: {
      id: 'puentear',
      tono: 'adulto',
      ico: '🔌',
      titulo: 'Puentear el encendido',
      sub: 'Arrastra cada cable a su bornera del mismo color',
      dur: 15,
      premioTexto: '⚡ Encendido listo · +$120',
      recompensa() {
        G.dinero = (G.dinero || 0) + 120;
        if (G.carro != null) G.carro = Math.min(1, G.carro + .25);
        if (G.busq && G.busq.pinchado) G.busq.pinchado = false;
      }
    },
    chapa: {
      id: 'chapa',
      tono: 'adulto',
      ico: '🔓',
      titulo: 'Forzar la chapa',
      sub: 'Sube cada pin hasta la línea verde hasta que haga clic',
      dur: 18,
      premioTexto: '🔓 Chapa abierta · +$150',
      recompensa() {
        G.dinero = (G.dinero || 0) + 150;
        if (typeof G.cebos === 'number') G.cebos = Math.min(9, G.cebos + 1);
      }
    },
    llanta: {
      id: 'llanta',
      tono: 'familia',
      ico: '🛞',
      titulo: 'Inflar la llanta de la bici',
      sub: 'Bombea arriba y abajo hasta sostener 50–62 PSI en verde',
      dur: 16,
      premioTexto: '🚲 Llanta al pelo (56 PSI) · +$80',
      recompensa() {
        G.dinero = (G.dinero || 0) + 80;
        if (G.busq) G.busq.pinchado = false;
        G._biciAfinadaT = 45;
      }
    },
    cadena: {
      id: 'cadena',
      tono: 'familia',
      ico: '⛓️',
      titulo: 'Ajustar la cadena',
      sub: 'Arrastra la guía por los 3 puntos del piñón para tensar',
      dur: 16,
      premioTexto: '⚙️ Cadena ajustada y aceitada · +$90',
      recompensa() {
        G.dinero = (G.dinero || 0) + 90;
        G._biciAfinadaT = 45;
      }
    }
  },

  /* Lista de minijuegos filtrable por tono ('familia', 'adulto' o todos) */
  lista(tono) {
    const todos = Object.values(this.DEF);
    if (!tono) return todos;
    return todos.filter(d => d.tono === tono);
  },

  _inyectarCSS() {
    if (this._cssInyectado || typeof document === 'undefined') return;
    this._cssInyectado = true;
    const st = document.createElement('style');
    st.id = 'mc-minijuegos-css';
    st.textContent = `
.mcui .dialogo.mc-mini{position:fixed!important;left:50%!important;top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;width:min(388px,94vw)!important;max-height:92vh!important;padding:12px!important;border-radius:10px!important;background:#14161a!important;color:#f2ede2!important;border:2px solid #e8a33c!important;box-shadow:0 18px 48px rgba(0,0,0,.82),0 0 0 9999px rgba(8,10,14,.58)!important;z-index:85!important;display:flex!important;flex-direction:column!important;gap:8px!important;box-sizing:border-box!important;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif!important}
.mcui .dialogo.mc-mini.familia{background:#102235!important;border-color:#9bd341!important;color:#f7fbff!important}
.mcui .dialogo.mc-mini .mc-mini-cab{display:flex;align-items:center;justify-content:space-between;gap:8px}
.mcui .dialogo.mc-mini .mc-mini-tit{display:flex;flex-direction:column;min-width:0}
.mcui .dialogo.mc-mini .mc-mini-tit b{font-size:16px;line-height:1.15;color:#fff}
.mcui .dialogo.mc-mini .mc-mini-tit small{font-size:12px;line-height:1.25;color:#d6d1c6;margin-top:2px}
.mcui .dialogo.mc-mini.familia .mc-mini-tit small{color:#d0e6f5}
.mcui .dialogo.mc-mini .mc-mini-salir{min-width:48px!important;min-height:48px!important;padding:0 14px!important;border-radius:8px!important;background:#262930!important;color:#fff!important;border:1px solid rgba(255,255,255,.32)!important;font:800 15px/1 system-ui!important;flex:0 0 auto;text-align:center!important}
.mcui .dialogo.mc-mini .mc-mini-salir:focus-visible{outline:3px solid #ffc23a;outline-offset:2px}
.mcui .dialogo.mc-mini .mc-mini-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;font:700 13px/1.2 system-ui}
.mcui .dialogo.mc-mini .mc-mini-barra{flex:1;height:10px;border-radius:6px;background:rgba(255,255,255,.16);overflow:hidden}
.mcui .dialogo.mc-mini .mc-mini-barra i{display:block;height:100%;width:100%;background:#e8a33c;transition:width .1s linear}
.mcui .dialogo.mc-mini.familia .mc-mini-barra i{background:#9bd341}
.mcui .dialogo.mc-mini .mc-mini-cv{width:100%;height:auto;aspect-ratio:360 / 248;border-radius:8px;background:#1c1f25;border:1px solid rgba(255,255,255,.18);touch-action:none;display:block;cursor:pointer}
.mcui .dialogo.mc-mini.familia .mc-mini-cv{background:#152c44}
.mcui .dialogo.mc-mini .mc-mini-pie{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:#dad4c7}
.mcui .dialogo.mc-mini .mc-mini-pie button{min-height:48px!important;min-width:110px!important;padding:6px 14px!important;font-size:15px!important;font-weight:800!important;border-radius:8px!important;background:#e8a33c!important;color:#14161a!important;border:none!important;text-align:center!important}
.mcui .dialogo.mc-mini.familia .mc-mini-pie button{background:#9bd341!important;color:#0e2235!important}
@media (orientation:landscape) and (max-height:500px){
  .mcui .dialogo.mc-mini{width:min(450px,90vw)!important;padding:8px 10px!important;gap:5px!important}
  .mcui .dialogo.mc-mini .mc-mini-cv{max-height:46vh;aspect-ratio:420 / 200}
  .mcui .dialogo.mc-mini .mc-mini-tit b{font-size:14px}
  .mcui .dialogo.mc-mini .mc-mini-tit small{font-size:11px}
}`;
    document.head.appendChild(st);
  },

  /* Sonido táctil corto con Web Audio del juego (sin fallar si Snd está apagado) */
  _clic(f = 520, dur = .06) {
    try {
      if (typeof Snd !== 'undefined' && Snd.golpe) { Snd.golpe(dur * 1.1); return; }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ac = this._ac || (this._ac = new Ctx());
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = f; g.gain.value = .06;
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    } catch (e) { /* audio opcional */ }
  },

  /* Menú selector de los 4 minijuegos (separa Turno Cero 18+ y Familia/Bici) */
  menu(op = {}) {
    if (!G.ui) return null;
    const soloFam = op.tono === 'familia';
    const items = [];
    if (!soloFam) {
      items.push({ id: 'puentear', texto: '🔌 <b>Puentear el carro</b> <small>18+ · une 3 cables con el dedo (15 s)</small>' });
      items.push({ id: 'chapa', texto: '🔓 <b>Forzar la chapa</b> <small>18+ · alinea los 3 pines en verde (18 s)</small>' });
    }
    items.push({ id: 'llanta', texto: '🛞 <b>Inflar la llanta (bici)</b> <small>familia · bombea hasta 50–62 PSI (16 s)</small>' });
    items.push({ id: 'cadena', texto: '⛓️ <b>Ajustar la cadena (bici)</b> <small>familia · encarrila en los 3 puntos (16 s)</small>' });
    items.push({ id: 'x', texto: '✕ Cerrar' });
    return G.ui.menu('🔧 Minijuegos táctiles', items, id => {
      if (id !== 'x' && this.DEF[id]) this.abrir(id, op);
    });
  },

  /* Cierra de inmediato sin bloquear y devuelve el estado de pausa anterior */
  cerrar(razon = 'cancelado') {
    const A = this.activo;
    if (!A) return false;
    this.activo = null;
    if (A.raf) cancelAnimationFrame(A.raf);
    if (A.teclaFn) document.removeEventListener('keydown', A.teclaFn, true);
    if (A.el && A.el.parentNode) A.el.remove();
    G.pausa = A.pausaAntes;
    const res = {
      id: A.def.id,
      ok: razon === 'ganado',
      cancelado: razon === 'cancelado',
      agotado: razon === 'tiempo',
      tiempo_s: +((performance.now() - A.t0) / 1000).toFixed(2),
      progreso: +A.progreso.toFixed(2)
    };
    this.stats.jugados++;
    if (res.ok) this.stats.ganados++;
    else if (res.cancelado) this.stats.cancelados++;
    this.stats.ultimo = res;
    if (res.ok) {
      try { if (A.def.recompensa && !A.op.sinRecompensa) A.def.recompensa(); } catch (e) {}
      if (G.ui && !A.op.callado) G.ui.aviso(A.def.premioTexto, 2600, 'minijuego');
    } else if (res.agotado) {
      if (G.ui && !A.op.callado) G.ui.aviso('⏱️ Se acabó el tiempo en ' + A.def.titulo + ' — puedes intentarlo otra vez', 2200, 'minijuego');
    } else if (G.ui && !A.op.callado) {
      G.ui.aviso('Saliste de ' + A.def.titulo, 1400, 'minijuego');
    }
    if (typeof MC !== 'undefined' && MC.emit) MC.emit('minijuego:fin', res);
    if (A.resolver) A.resolver(res);
    return true;
  },

  /* Abre un minijuego táctil por id ('puentear' | 'chapa' | 'llanta' | 'cadena') */
  abrir(id, op = {}) {
    const def = this.DEF[id];
    if (!def || !G.ui || !G.ui.capa) return Promise.resolve({ id, ok: false, cancelado: true, tiempo_s: 0 });
    if (this.activo) this.cerrar('cancelado');
    this._inyectarCSS();

    return new Promise(resolver => {
      const pausaAntes = !!G.pausa;
      G.pausa = true;
      const dur = MC.clamp(op.dur || def.dur, 10, 20);
      const wrap = document.createElement('div');
      wrap.className = 'dialogo mc-mini p' + (def.tono === 'familia' ? ' familia' : '');
      wrap.setAttribute('role', 'dialog');
      wrap.setAttribute('aria-label', def.titulo);
      wrap.dataset.minijuego = id;
      wrap.innerHTML =
        '<div class="mc-mini-cab">' +
          '<div class="mc-mini-tit"><b>' + def.ico + ' ' + def.titulo + '</b><small>' + def.sub + '</small></div>' +
          '<button type="button" class="mc-mini-salir" aria-label="Salir del minijuego">✕ Salir</button>' +
        '</div>' +
        '<div class="mc-mini-meta"><span class="mc-mini-est">Listo</span><div class="mc-mini-barra"><i></i></div><span class="mc-mini-seg">' + dur + ' s</span></div>' +
        '<canvas class="mc-mini-cv" width="360" height="248"></canvas>' +
        '<div class="mc-mini-pie"><span class="mc-mini-ayuda">Toca y arrastra · Esc para salir</span><button type="button" class="mc-mini-accion" hidden></button></div>';
      G.ui.capa.appendChild(wrap);

      const cv = wrap.querySelector('canvas');
      const ctx = cv.getContext('2d');
      const elEst = wrap.querySelector('.mc-mini-est');
      const elSeg = wrap.querySelector('.mc-mini-seg');
      const elBar = wrap.querySelector('.mc-mini-barra i');
      const btnSalir = wrap.querySelector('.mc-mini-salir');
      const btnAcc = wrap.querySelector('.mc-mini-accion');

      const juego = this._crearEstado(id, cv.width, cv.height, op);
      const A = {
        id, def, op, el: wrap, cv, ctx, elEst, elSeg, elBar, btnAcc,
        juego, pausaAntes, dur, t0: performance.now(), ult: performance.now(),
        progreso: 0, resolver, raf: 0, punteroId: null
      };
      this.activo = A;

      if (id === 'llanta') {
        btnAcc.hidden = false;
        btnAcc.textContent = '⬆️ Bombear';
        btnAcc.onclick = e => { e.stopPropagation(); this._bombear(A, 1); };
      }

      btnSalir.onclick = e => { e.stopPropagation(); this.cerrar('cancelado'); };
      A.teclaFn = e => {
        if (!this.activo || this.activo !== A) return;
        if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); this.cerrar('cancelado'); return; }
        this._teclaJuego(A, e);
      };
      document.addEventListener('keydown', A.teclaFn, true);

      const pos = e => {
        const r = cv.getBoundingClientRect();
        return {
          x: (e.clientX - r.left) * (cv.width / Math.max(1, r.width)),
          y: (e.clientY - r.top) * (cv.height / Math.max(1, r.height))
        };
      };
      cv.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation();
        if (A.punteroId != null) return;
        A.punteroId = e.pointerId;
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        this._puntero(A, 'down', pos(e));
      });
      cv.addEventListener('pointermove', e => {
        if (A.punteroId !== e.pointerId) return;
        e.preventDefault();
        this._puntero(A, 'move', pos(e));
      });
      const soltar = e => {
        if (A.punteroId !== e.pointerId) return;
        A.punteroId = null;
        this._puntero(A, 'up', pos(e));
      };
      cv.addEventListener('pointerup', soltar);
      cv.addEventListener('pointercancel', soltar);

      if (typeof MC !== 'undefined' && MC.emit) MC.emit('minijuego:inicio', { id, dur });
      const bucle = now => {
        if (this.activo !== A) return;
        const dt = MC.clamp((now - A.ult) / 1000, 0, .08);
        A.ult = now;
        const trans = (now - A.t0) / 1000;
        const queda = Math.max(0, A.dur - trans);
        A.elSeg.textContent = Math.ceil(queda) + ' s';
        A.elBar.style.width = Math.round((queda / A.dur) * 100) + '%';
        const ganado = this._pasoJuego(A, dt);
        this._dibujarJuego(A);
        if (ganado) { this.cerrar('ganado'); return; }
        if (queda <= 0) { this.cerrar('tiempo'); return; }
        A.raf = requestAnimationFrame(bucle);
      };
      this._dibujarJuego(A);
      A.raf = requestAnimationFrame(bucle);
    });
  },

  /* ---------- Inicialización de los 4 minijuegos ---------- */
  _crearEstado(id, W, H, op) {
    if (id === 'puentear') {
      const cols = ['#e8483c', '#f2b830', '#3aa0e8'];
      const nombres = ['ROJO', 'ÁMBAR', 'AZUL'];
      const izqY = [64, 128, 192];
      const ordenDer = op.determinista ? [2, 0, 1] : [1, 2, 0];
      const cables = cols.map((c, i) => ({
        i, col: c, nombre: nombres[i],
        x0: 62, y0: izqY[i],
        x1: W - 62, y1: izqY[ordenDer[i]],
        conectado: false
      }));
      return { cables, arrastre: null, chispas: [] };
    }
    if (id === 'chapa') {
      const lineaY = 104;
      const pines = [0, 1, 2].map(i => ({
        i, x: 94 + i * 86,
        y: 186 - i * 10,
        objetivoY: lineaY,
        fijo: false,
        sost: 0
      }));
      return { lineaY, pines, activoIdx: -1, selTeclado: 0 };
    }
    if (id === 'llanta') {
      return {
        psi: 22, minOk: 50, maxOk: 62, maxSeguro: 76,
        mangoY: 64, arrastrando: false, ultY: 64,
        estabilidad: 0, metaEst: 1.25, reventon: 0
      };
    }
    /* cadena */
    const cx = 198, cy = 128, r = 68;
    const puntos = [
      { ang: -Math.PI * .78, x: cx + Math.cos(-Math.PI * .78) * r, y: cy + Math.sin(-Math.PI * .78) * r, ok: false },
      { ang: -Math.PI * .15, x: cx + Math.cos(-Math.PI * .15) * r, y: cy + Math.sin(-Math.PI * .15) * r, ok: false },
      { ang: Math.PI * .52, x: cx + Math.cos(Math.PI * .52) * r, y: cy + Math.sin(Math.PI * .52) * r, ok: false }
    ];
    return {
      cx, cy, r, puntos,
      guia: { x: 70, y: 188 },
      arrastrando: false,
      pasoActual: 0
    };
  },

  _bombear(A, fuerza) {
    const J = A.juego;
    if (J.reventon > 0) return;
    J.psi = Math.min(82, J.psi + 7.5 * fuerza);
    J.mangoY = 176;
    this._clic(340 + J.psi * 4, .05);
    if (J.psi > J.maxSeguro) {
      J.reventon = .6;
      J.psi = 30;
      J.estabilidad = 0;
      this._clic(140, .14);
    }
  },

  _puntero(A, tipo, pt) {
    const J = A.juego, T = Math.PI * 2;
    if (A.id === 'puentear') {
      if (tipo === 'down') {
        const c = J.cables.find(q => !q.conectado && Math.hypot(pt.x - q.x0, pt.y - q.y0) < 34);
        if (c) J.arrastre = { cable: c, x: pt.x, y: pt.y };
      } else if (tipo === 'move' && J.arrastre) {
        J.arrastre.x = MC.clamp(pt.x, 12, A.cv.width - 12);
        J.arrastre.y = MC.clamp(pt.y, 12, A.cv.height - 12);
      } else if (tipo === 'up' && J.arrastre) {
        const c = J.arrastre.cable;
        if (Math.hypot(J.arrastre.x - c.x1, J.arrastre.y - c.y1) < 36) {
          c.conectado = true;
          this._clic(680, .07);
          for (let k = 0; k < 10; k++) {
            const a = Math.random() * T, s = 35 + Math.random() * 65;
            J.chispas.push({ x: c.x1, y: c.y1, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: .35, col: c.col });
          }
        }
        J.arrastre = null;
      }
      return;
    }
    if (A.id === 'chapa') {
      if (tipo === 'down') {
        const idx = J.pines.findIndex(p => !p.fijo && Math.abs(pt.x - p.x) < 38);
        if (idx >= 0) { J.activoIdx = idx; J.pines[idx].y = MC.clamp(pt.y, 58, 206); }
      } else if (tipo === 'move' && J.activoIdx >= 0) {
        const p = J.pines[J.activoIdx];
        if (!p.fijo) p.y = MC.clamp(pt.y, 58, 206);
      } else if (tipo === 'up') {
        J.activoIdx = -1;
      }
      return;
    }
    if (A.id === 'llanta') {
      if (tipo === 'down') { J.arrastrando = true; J.ultY = pt.y; }
      else if (tipo === 'move' && J.arrastrando) {
        const dy = pt.y - J.ultY;
        J.ultY = pt.y;
        J.mangoY = MC.clamp(pt.y, 48, 196);
        if (dy > 3 && J.reventon <= 0) {
          J.psi = Math.min(82, J.psi + dy * .26);
          if (J.psi > J.maxSeguro) { J.reventon = .6; J.psi = 30; J.estabilidad = 0; this._clic(140, .14); }
        }
      } else if (tipo === 'up') { J.arrastrando = false; }
      return;
    }
    if (A.id === 'cadena') {
      if (tipo === 'down') {
        if (Math.hypot(pt.x - J.guia.x, pt.y - J.guia.y) < 42) J.arrastrando = true;
      } else if (tipo === 'move' && J.arrastrando) {
        J.guia.x = MC.clamp(pt.x, 20, A.cv.width - 20);
        J.guia.y = MC.clamp(pt.y, 20, A.cv.height - 20);
        const obj = J.puntos[J.pasoActual];
        if (obj && !obj.ok && Math.hypot(J.guia.x - obj.x, J.guia.y - obj.y) < 30) {
          obj.ok = true;
          J.pasoActual++;
          this._clic(540 + J.pasoActual * 120, .07);
        }
      } else if (tipo === 'up') { J.arrastrando = false; }
    }
  },

  _teclaJuego(A, e) {
    const J = A.juego;
    if (A.id === 'puentear' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      const c = J.cables.find(q => !q.conectado);
      if (c) { c.conectado = true; this._clic(680, .07); }
    } else if (A.id === 'chapa') {
      const p = J.pines.find(q => !q.fijo);
      if (!p) return;
      if (e.key === 'ArrowUp' || e.key === 'KeyW') { e.preventDefault(); p.y = MC.clamp(p.y - 10, 58, 206); }
      else if (e.key === 'ArrowDown' || e.key === 'KeyS') { e.preventDefault(); p.y = MC.clamp(p.y + 10, 58, 206); }
    } else if (A.id === 'llanta' && (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault(); this._bombear(A, 1);
    } else if (A.id === 'cadena' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      const obj = J.puntos[J.pasoActual];
      if (obj) { J.guia.x = obj.x; J.guia.y = obj.y; obj.ok = true; J.pasoActual++; this._clic(620, .07); }
    }
  },

  _pasoJuego(A, dt) {
    const J = A.juego;
    if (A.id === 'puentear') {
      for (let i = J.chispas.length - 1; i >= 0; i--) {
        const s = J.chispas[i]; s.t -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 120 * dt;
        if (s.t <= 0) J.chispas.splice(i, 1);
      }
      const n = J.cables.filter(c => c.conectado).length;
      A.progreso = n / J.cables.length;
      A.elEst.textContent = 'Cables ' + n + '/' + J.cables.length;
      return n === J.cables.length;
    }
    if (A.id === 'chapa') {
      let fijos = 0;
      for (const p of J.pines) {
        if (p.fijo) { fijos++; continue; }
        if (Math.abs(p.y - J.lineaY) <= 13) {
          p.sost += dt;
          if (p.sost >= .3) { p.fijo = true; p.y = J.lineaY; fijos++; this._clic(760, .08); }
        } else {
          p.sost = Math.max(0, p.sost - dt * 2);
          if (J.activoIdx !== p.i) p.y = Math.min(196, p.y + 42 * dt);
        }
      }
      A.progreso = fijos / J.pines.length;
      A.elEst.textContent = 'Pines ' + fijos + '/' + J.pines.length;
      return fijos === J.pines.length;
    }
    if (A.id === 'llanta') {
      if (J.reventon > 0) J.reventon = Math.max(0, J.reventon - dt);
      if (!J.arrastrando) J.mangoY += (64 - J.mangoY) * Math.min(1, dt * 6);
      J.psi = Math.max(16, J.psi - 2.2 * dt);
      const enBanda = J.psi >= J.minOk && J.psi <= J.maxOk;
      if (enBanda) J.estabilidad += dt;
      else J.estabilidad = Math.max(0, J.estabilidad - dt * .6);
      A.progreso = MC.clamp(J.estabilidad / J.metaEst, 0, 1);
      A.elEst.textContent = J.reventon > 0 ? '¡Demasiada presión!' : Math.round(J.psi) + ' PSI' + (enBanda ? ' · ¡Sostén!' : '');
      return J.estabilidad >= J.metaEst;
    }
    /* cadena */
    const ok = J.puntos.filter(p => p.ok).length;
    A.progreso = ok / J.puntos.length;
    A.elEst.textContent = 'Guías ' + ok + '/' + J.puntos.length;
    return ok === J.puntos.length;
  },

  _dibujarJuego(A) {
    const g = A.ctx, W = A.cv.width, H = A.cv.height, J = A.juego, T = Math.PI * 2;
    g.clearRect(0, 0, W, H);
    if (A.id === 'puentear') {
      g.fillStyle = '#1b1e24'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#2d313a'; g.fillRect(24, 24, 74, H - 48); g.fillRect(W - 98, 24, 74, H - 48);
      g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 2;
      g.strokeRect(24, 24, 74, H - 48); g.strokeRect(W - 98, 24, 74, H - 48);
      for (const c of J.cables) {
        g.strokeStyle = c.conectado ? c.col : 'rgba(255,255,255,.16)';
        g.lineWidth = c.conectado ? 8 : 2;
        g.setLineDash(c.conectado ? [] : [5, 6]);
        g.beginPath(); g.moveTo(c.x0, c.y0);
        g.bezierCurveTo(W * .42, c.y0, W * .58, c.y1, c.x1, c.y1);
        g.stroke(); g.setLineDash([]);
        for (const [bx, by] of [[c.x0, c.y0], [c.x1, c.y1]]) {
          g.fillStyle = c.col; g.beginPath(); g.arc(bx, by, 17, 0, T); g.fill();
          g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke();
          g.fillStyle = '#14161a'; g.beginPath(); g.arc(bx, by, 6, 0, T); g.fill();
        }
      }
      if (J.arrastre) {
        const c = J.arrastre.cable;
        g.strokeStyle = c.col; g.lineWidth = 9; g.lineCap = 'round';
        g.beginPath(); g.moveTo(c.x0, c.y0);
        g.quadraticCurveTo((c.x0 + J.arrastre.x) / 2, (c.y0 + J.arrastre.y) / 2 + 18, J.arrastre.x, J.arrastre.y);
        g.stroke();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(J.arrastre.x, J.arrastre.y, 9, 0, T); g.fill();
      }
      for (const s of J.chispas) {
        g.fillStyle = '#ffe58a'; g.beginPath(); g.arc(s.x, s.y, 3.2, 0, T); g.fill();
      }
      return;
    }
    if (A.id === 'chapa') {
      g.fillStyle = '#1b1e24'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#2d3138'; g.fillRect(36, 36, W - 72, H - 72);
      g.fillStyle = 'rgba(63,174,90,.28)'; g.fillRect(36, J.lineaY - 13, W - 72, 26);
      g.strokeStyle = '#4ad66d'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(36, J.lineaY); g.lineTo(W - 36, J.lineaY); g.stroke();
      for (const p of J.pines) {
        g.fillStyle = '#14161a'; g.fillRect(p.x - 16, 48, 32, 168);
        /* Resorte helicoidal en zigzag */
        g.strokeStyle = '#9aa1ab'; g.lineWidth = 2; g.beginPath();
        g.moveTo(p.x, 50);
        for (let k = 0, y = 56; y < p.y - 18; k++, y += 7) g.lineTo(p.x + (k % 2 ? 7 : -7), y);
        g.lineTo(p.x, p.y - 18);
        g.stroke();
        const listo = p.fijo || Math.abs(p.y - J.lineaY) <= 13;
        g.fillStyle = p.fijo ? '#4ad66d' : (listo ? '#ffd452' : '#d49a3a');
        g.fillRect(p.x - 12, p.y - 18, 24, 36);
        g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(p.x - 12, p.y - 18, 24, 36);
        g.fillStyle = '#14161a'; g.fillRect(p.x - 12, p.y - 2, 24, 4);
      }
      return;
    }
    if (A.id === 'llanta') {
      g.fillStyle = '#13273d'; g.fillRect(0, 0, W, H);
      const inflado = MC.clamp((J.psi - 16) / 56, 0, 1);
      g.strokeStyle = '#23282e'; g.lineWidth = 18 + inflado * 6;
      g.beginPath(); g.ellipse(106, 128, 64, 54 + inflado * 10, 0, 0, T); g.stroke();
      g.strokeStyle = '#9bd341'; g.lineWidth = 3;
      g.beginPath(); g.ellipse(106, 128, 46, 38 + inflado * 8, 0, 0, T); g.stroke();
      /* Radios de la bici */
      g.strokeStyle = 'rgba(216,232,248,.35)'; g.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * T;
        g.beginPath(); g.moveTo(106, 128);
        g.lineTo(106 + Math.cos(a) * 44, 128 + Math.sin(a) * (36 + inflado * 7));
        g.stroke();
      }
      /* Manómetro PSI con marca 50–62 */
      const bx = 196, by = 34, bw = 28, bh = 168;
      g.fillStyle = '#0c1a2a'; g.fillRect(bx, by, bw, bh);
      const yMaxOk = by + bh * (1 - J.maxOk / 82), yMinOk = by + bh * (1 - J.minOk / 82);
      g.fillStyle = 'rgba(155,211,65,.42)'; g.fillRect(bx, yMaxOk, bw, yMinOk - yMaxOk);
      const yVal = by + bh * (1 - J.psi / 82);
      g.fillStyle = J.psi > J.maxSeguro ? '#e8483c' : (J.psi >= J.minOk && J.psi <= J.maxOk ? '#9bd341' : '#ffc23a');
      g.fillRect(bx + 4, yVal, bw - 8, by + bh - yVal);
      g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(bx, by, bw, bh);
      g.fillStyle = '#d8e9f8'; g.font = '700 10px system-ui'; g.textAlign = 'center';
      g.fillText('50–62', bx + bw / 2, by - 8);
      /* Bomba táctil derecha */
      g.fillStyle = '#33526e'; g.fillRect(284, 86, 22, 120);
      g.fillStyle = '#c8d6e5'; g.fillRect(291, J.mangoY, 8, Math.max(12, 194 - J.mangoY));
      g.fillStyle = '#ffc23a'; g.fillRect(256, J.mangoY - 11, 78, 22);
      g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(256, J.mangoY - 11, 78, 22);
      /* Barra de sostener en banda verde */
      g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(30, 218, 152, 12);
      g.fillStyle = '#9bd341'; g.fillRect(30, 218, 152 * MC.clamp(J.estabilidad / J.metaEst, 0, 1), 12);
      return;
    }
    /* cadena */
    g.fillStyle = '#13273d'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#29445f'; g.beginPath(); g.arc(J.cx, J.cy, J.r - 12, 0, T); g.fill();
    g.strokeStyle = '#9eb6cc'; g.lineWidth = 5; g.setLineDash([7, 5]);
    g.beginPath(); g.arc(J.cx, J.cy, J.r, 0, T); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#13273d'; g.beginPath(); g.arc(J.cx, J.cy, 20, 0, T); g.fill();
    g.strokeStyle = '#dce6ef'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(62, 128);
    for (const p of J.puntos) if (p.ok) g.lineTo(p.x, p.y);
    g.lineTo(J.guia.x, J.guia.y);
    g.stroke();
    J.puntos.forEach((p, idx) => {
      const actual = idx === J.pasoActual;
      g.fillStyle = p.ok ? '#9bd341' : (actual ? '#ffc23a' : '#4a647d');
      g.beginPath(); g.arc(p.x, p.y, actual ? 18 : 14, 0, T); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = '#102235'; g.font = '800 13px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(idx + 1), p.x, p.y + 1);
    });
    g.fillStyle = '#2dd4bf'; g.beginPath(); g.arc(J.guia.x, J.guia.y, 16, 0, T); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
  }
};

/* Integración 100 % aditiva en Modos.DEF y ciclo de paso (sin editar 60-modos.js) */
if (typeof Modos !== 'undefined' && Modos.DEF) {
  Modos.DEF.minijuegos = {
    ico: '🔧',
    n: 'Minijuegos táctiles',
    d: 'puentear carro, forzar chapa, inflar llanta o ajustar cadena (10–20 s)'
  };
  const _empOrig = Modos.empezar;
  Modos.empezar = function (id, op) {
    if (id === 'minijuegos') { Minijuegos.menu(op); return true; }
    return _empOrig.call(this, id, op);
  };
}
if (typeof EXTRAS !== 'undefined' && EXTRAS.paso) {
  EXTRAS.paso.push(dt => {
    if (G._biciAfinadaT > 0) G._biciAfinadaT = Math.max(0, G._biciAfinadaT - dt);
  });
}
G.Minijuegos = Minijuegos;

/* =====================================================================
   5.3 · Claude: el minijuego entra al juego (G5-04 pedía puentear el carro en Turno Cero, idea de Chinatown Wars).
   Después de robar un carro (a pie, 🚗) aparece por 6 s «🔌 Puentear»: es OPCIONAL y no frena nada (el carro ya es tuyo y
   puedes arrancar). Si lo aceptas y unes los cables a tiempo, el dueño no alcanza a reportarlo: la búsqueda baja lo que subió
   el robo (y el minijuego da su premio de siempre). Si no lo tocas, el botón se va solo.
   ===================================================================== */
const PuentearRobo = {
  chip: null, _t: 0, _calor: 0, ofrecidos: 0,
  ofrecer(calor) {
    if (!G.ui || !G.ui.capa || G.hist || G.pausa || Minijuegos.activo) return;
    this.quitar(); this._calor = calor; this._t = 6; this.ofrecidos++;
    if (!document.getElementById('mcChipCss')) { const st = document.createElement('style'); st.id = 'mcChipCss'; st.textContent = '.mcui .mc-chip{position:absolute;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);min-height:48px;padding:0 18px;border-radius:24px;border:2px solid #f2b84b;background:rgba(18,20,26,.92);color:#fff;font:600 15px system-ui,sans-serif;z-index:30;box-shadow:0 4px 14px rgba(0,0,0,.4)}.mcui .mc-chip:active{transform:translateX(-50%) scale(.97)}'; document.head.appendChild(st); }
    const b = document.createElement('button'); b.className = 'mc-chip'; b.type = 'button'; b.textContent = '🔌 Puentear: que nadie lo reporte';
    b.onclick = () => { this.quitar(); Minijuegos.abrir('puentear').then(r => { if (!r || !r.ok || !G.busq) return; const B = G.busq; B.heat = Math.max(0, B.heat - this._calor); if (B._nivel) B._nivel(); G.ui.aviso('🔌 Arrancó sin alarma: nadie alcanzó a reportar el robo', 2800, 'minijuego'); MC.emit('puentear:robo', { calor: this._calor }); }); };
    G.ui.capa.appendChild(b); this.chip = b;
  },
  quitar() { if (this.chip) { this.chip.remove(); this.chip = null; } },
  paso(dt) { if (this.chip && ((this._t -= dt) <= 0 || G.pausa || G.cuerpo.veh.clase === 'pie')) this.quitar(); }
};
if (typeof robarCarro === 'function') robarCarro = (orig => function () { const antes = G.veh, calor0 = G.busq ? G.busq.heat : 0; orig(); if (G.veh !== antes || (G.busq && G.busq.heat > calor0)) PuentearRobo.ofrecer(G.busq ? Math.max(0, G.busq.heat - calor0) : 0); })(robarCarro);
EXTRAS.paso.push(dt => PuentearRobo.paso(dt));
G.PuentearRobo = PuentearRobo;
