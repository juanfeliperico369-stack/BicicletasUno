/* OpenAI GPT-6 · Geometría de ciclorrutas y acceso situado al runner (22-11-2026).
 * Parche aditivo: no sustituye el mundo ni los módulos de otras IA.
 * Sólo consulta la red cuando alguien quiere iniciar una actividad, nunca en cada frame.
 */
(function () {
  'use strict';
  const umbralMetros = 12;

  const CicloGeo = JE.cicloGeoGPT6 = {
    /* Distancia real a segmentos y progresiva: la primera coordenada NO basta para hallar la vía próxima. */
    proyectar(via, pos) {
      const p = via && via.p;
      if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y) || !p || p.length < 4 || p.length % 2 !== 0) return null;
      let recorrido = 0, mejor = null;
      for (let i = 0; i + 3 < p.length; i += 2) {
        const x0 = +p[i], y0 = +p[i + 1], x1 = +p[i + 2], y1 = +p[i + 3];
        if (![x0, y0, x1, y1].every(Number.isFinite)) return null;
        const dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
        if (d2 < 1e-8) continue;
        const segmento = Math.sqrt(d2), u = clamp(((pos.x - x0) * dx + (pos.y - y0) * dy) / d2, 0, 1);
        const x = x0 + dx * u, y = y0 + dy * u;
        const d = Math.hypot(pos.x - x, pos.y - y);
        if (!mejor || d < mejor.distanciaPx) {
          mejor = { via, x, y, segmento: i / 2, fraccion: u, distanciaPx: d,
            distanciaMetros: d * M_PER_PX, inicioMetros: (recorrido + segmento * u) * M_PER_PX,
            ang: Math.atan2(dy, dx) };
        }
        recorrido += segmento;
      }
      if (!mejor || recorrido * M_PER_PX < 100) return null;
      mejor.largoMetros = recorrido * M_PER_PX;
      return mejor;
    },
    cercana(mapa, pos) {
      let mejor = null;
      for (const via of (mapa && mapa.vias) || []) {
        if (Number(via.k) !== 5) continue; // contrato de las ciclorrutas vectoriales
        const q = this.proyectar(via, pos);
        if (q && (!mejor || q.distanciaPx < mejor.distanciaPx)) mejor = q;
      }
      return mejor;
    },
    acceso(mapa, pos, radio = umbralMetros) {
      const q = this.cercana(mapa, pos);
      return q && q.distanciaMetros <= radio ? q : null;
    },
    /* Las ciclovías dominicales tienen carriles abiertos al público sólo durante el evento. */
    enCiclovia(mode) {
      const ride = mode && mode.ride, p = ride && ride.p, tile = ride && ride.tileAt && ride.tileAt();
      if (!p) return false;
      return tile === TT.CICLO ||
        !!(mode.mods && mode.mods.ciclovia && (tile === TT.AVE || tile === TT.AUTO)) ||
        !!this.acceso(JE.map, p);
    }
  };

  if (typeof TramoCiclista !== 'undefined') {
    const puntoOriginal = TramoCiclista.prototype.punto;
    TramoCiclista.cercana = function (mapa, pos) {
      const q = CicloGeo.cercana(mapa, pos);
      if (!q) return null;
      const tramo = new TramoCiclista(q.via);
      tramo.inicioMetros = q.inicioMetros;
      tramo.entrada = { x: q.x, y: q.y, ang: q.ang, distanciaMetros: q.distanciaMetros };
      return tramo;
    };
    TramoCiclista.prototype.punto = function (s) {
      const avance = Number.isFinite(s) ? Math.max(0, s) : 0;
      return puntoOriginal.call(this, avance + (this.inicioMetros || 0));
    };
  }

  if (typeof ModeUsuarioR !== 'undefined' && typeof ModeUsuarioR.prototype.iniciarRunner3D === 'function') {
    const iniciarOriginal = ModeUsuarioR.prototype.iniciarRunner3D;
    ModeUsuarioR.prototype.iniciarRunner3D = function () {
      if (this.free && !this.sub && this.ride) {
        if (!CicloGeo.enCiclovia(this)) {
          if (JE.ui && JE.ui.toast) JE.ui.toast('🚲 El runner se activa en una ciclorruta o ciclovía. Acércate a una y vuelve a intentarlo.');
          return false;
        }
        if (this.ride.p.veh === 'truck') {
          if (JE.ui && JE.ui.toast) JE.ui.toast('🚲 Este reto es para bici, patines, skate o a pie. Baja del camión.');
          return false;
        }
      }
      return iniciarOriginal.apply(this, arguments);
    };
  }
})();
