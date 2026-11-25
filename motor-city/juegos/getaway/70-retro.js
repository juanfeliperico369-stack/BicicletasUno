/* =====================================================================
   TURNO CERO · 5.4 · 🏎️ CARRERAS RETRO (renacimiento cenital, Fase 4 · Claude, 25‑nov‑2026)
   Una cápsula aparte del mundo abierto: las carreras pseudo‑3D de MC.Pista (js/47-pista.js) en dos circuitos del Valle,
   «Subida a Las Palmas» y «Autopista Regional nocturna», a dos vueltas contra 5 rivales.
   - Se elige en 🎮 Modos («🏎️ Carreras retro»). El mundo abierto se pausa mientras corres (como Run) y al salir vuelves al mismo
     punto, a la misma hora y en el mismo carro.
   - Corres con el color de tu carro de Turno Cero. Récord por circuito (el mejor tiempo, en 🎮 Modos) y premio por puesto:
     💵 500, 250 y 100 al podio.
   Archivo aditivo: suma «retro» a Modos.DEF y envuelve Modos.empezar; no toca los otros modos.
   ===================================================================== */
(function () {
  if (typeof Modos === 'undefined' || typeof MC === 'undefined' || !MC.Pista) return;
  Modos.DEF.retro = { ico: '🏎️', n: 'Carreras retro', d: 'pseudo‑3D a la antigua: la Subida a Las Palmas o la Regional de noche, contra 5 rivales' };
  const PREMIO = [500, 250, 100], DESC = { palmas: ['⛰️', 'subida larga, curvas encadenadas, lomas y la bajada por Escobero'], regional: ['🌃', 'alta velocidad, puentes y arcos sobre la vía y la ciudad de noche'] };
  const estilo = document.createElement('style'); estilo.textContent = '#retro{position:fixed;inset:0;z-index:44;background:#000}#retro[hidden]{display:none}#retroCv{position:absolute;inset:0;width:100vw;height:100vh;touch-action:none}';
  document.head.appendChild(estilo);
  const capa = () => { let d = document.getElementById('retro'); if (!d) { d = document.createElement('div'); d.id = 'retro'; d.hidden = true; d.innerHTML = '<canvas id="retroCv" aria-label="Carrera retro"></canvas>'; document.body.appendChild(d); } return d; };
  const Retro = G.Retro = {
    activo: null,
    menu() {
      const R = Modos.records(), it = Object.entries(MC.Pista.CIRCUITOS).map(([id, D]) => { const [ico, d] = DESC[id] || ['🏁', D.lugar]; const r = R['retro:' + id]; return { id, texto: ico + ' <b>' + D.nombre + '</b><br><small>' + d + (r != null ? ' · 🏆 ' + fmtT(r) : '') + '</small>' }; });
      G.ui.menu('🏎️ Carreras retro', it.concat([{ id: 'x', texto: '✕ Cerrar' }]), id => { if (id !== 'x') this.correr(id); });
      return true;
    },
    /* op (pruebas): { bot: true } corre solo */
    correr(id, op = {}) {
      if (this.activo || !MC.Pista.CIRCUITOS[id]) return false;
      const C = G.cuerpo, antes = { x: C.x, y: C.y, a: C.a, veh: C.veh && C.veh.id }, d = capa();
      G.enRetro = true; G.pausa = true; try { Snd.sirenaVol(0); if (Snd.mot) Snd.mot.g.gain.value = 0; } catch (e) { /* sin audio */ }
      d.hidden = false;
      /* el cielo de la hora y el clima del mundo abierto (cieloRetro, como en 🏁 Arcade); la Regional siempre es de noche */
      const cd = !MC.Pista.CIRCUITOS[id].noche && MC.Pista.cieloDe ? MC.Pista.cieloDe({ reloj: G.reloj, clima: G.clima }) : null, cielo = cd ? cd.cielo : undefined, noche = cd ? cd.noche : 0;
      try {
        this.activo = MC.Pista.entrar(Object.assign({
          circuito: id, cielo, noche, lienzo: d.querySelector('#retroCv'), capa: d, vueltas: 2, rivales: 5, nombre: 'Tú', color: (C.veh && C.veh.color) || '#d0202a',
          alTerminar: r => this.premio(r),
          alEvento: e => { try { if (navigator.vibrate && (e.k === 'choque' || e.k === 'toque' || e.k === 'nitro')) navigator.vibrate(e.k === 'nitro' ? 40 : 25); } catch (er) { /* sin vibración */ } },   /* en el celular (también en el WebView de Android) */
          alSalir: () => { this.activo = null; G.enRetro = false; G.pausa = false; d.hidden = true; C.x = antes.x; C.y = antes.y; C.a = antes.a; C.v = 0; if (antes.veh && C.veh.id !== antes.veh) C.setVeh(antes.veh); G.camara.x = C.x; G.camara.y = C.y; t0 = performance.now(); MC.emit('modo:fin', { id: 'retro' }); },
          _alReiniciar: n => { this.activo = n; }
        }, op));
      } catch (e) { this.activo = null; G.enRetro = false; G.pausa = false; d.hidden = true; G.ui.aviso('🏎️ ' + e.message, 2400, 'modos'); return false; }
      MC.emit('modo:inicio', { id: 'retro', ok: true, circuito: id }); return true;
    },
    /* el premio y el récord, al cruzar la meta (cada carrera, también si después eliges «Otra vez») */
    premio(r) {
      if (!r.terminado) return; const p = PREMIO[r.posicion - 1] || 0, rec = Modos.record('retro:' + r.circuito, r.tiempo, true); if (p) G.dinero += p;
      G.ui.aviso('🏎️ ' + r.posicion + '.º en ' + r.nombre + (p ? ' · 💵 +' + plata(p) : '') + (rec.mejor ? ' · ⭐ ¡récord!' : ''), 3200, 'modos');
      MC.emit('modo:resultado', { id: 'retro', circuito: r.circuito, pos: r.posicion, t: r.tiempo, premio: p, record: rec.mejor });
    }
  };
  /* 📏 Medir las carreras retro (Fase 5: 60 cuadros por segundo en el celular): el bot corre en Las Palmas y Medir (68-medir.js)
     cuenta cada cuadro con su reloj y lo que tardó el dibujo de la pista, con su mismo panel y 📋. Se pide con G.Retro.medir() o con
     ?medir=retro; el ?medir de siempre (las tres cámaras del mundo abierto) no cambia. */
  if (G.Medir) {
    const Md = G.Medir, TR0 = Md.TRAMOS, ct0 = Md.cambiarTramo, cu0 = Md.cuadro, te0 = Md.terminar;
    Md.cambiarTramo = function (i) { if (this.TRAMOS[i][0] !== 'retro') return ct0.call(this, i); const A = this.activo; A.tramo = i; A.tramos = A.tramos || []; A.tramos[i] = { id: 'retro', n: this.TRAMOS[i][1], cuadros: [], dib: [] }; if (!Retro.activo) Retro.correr('palmas', { bot: true }); };
    Md.cuadro = function (t) { const A = this.activo; if (A && this.TRAMOS[A.tramo] && this.TRAMOS[A.tramo][0] === 'retro' && G.vistas) G.vistas.ms = Retro.activo && Retro.activo.ultimoMs != null ? Retro.activo.ultimoMs : -1; return cu0.call(this, t); };
    Md.terminar = function () { const retro = this.TRAMOS !== TR0; try { if (retro && Retro.activo) Retro.activo.salir(); return te0.call(this); } finally { if (retro) this.TRAMOS = TR0; } };
    Retro.medir = () => { if (Md.activo) return false; Md.TRAMOS = [['retro', 'Carreras retro (Las Palmas)']]; Md.empezar(); return true; };
    if (/[?&]medir=retro\b/.test(location.search)) Md.TRAMOS = [['retro', 'Carreras retro (Las Palmas)']];
  }
  const empezar0 = Modos.empezar;
  Modos.empezar = function (id) { if (id !== 'retro') return empezar0.apply(this, arguments); if (this.m) this.terminar(null); return Retro.menu(); };   /* «modo:inicio» sale al empezar la carrera (Retro.correr) */
})();
