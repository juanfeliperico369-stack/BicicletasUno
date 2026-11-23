/* =====================================================================
   TURNO CERO · 5.2 · G5-05 · GUÍA SIN FLECHA EN 🎬 MODO CINE
   Idea de Ghost of Tsushima (Sucker Punch, 2020) en sala limpia:
   Cuando 🎬 Modo cine está activo (sin minimapa ni flecha del HUD) y hay
   un objetivo o destino libre, el propio mundo orienta al jugador:
   - ráfagas de hojas doradas de guayacán y verdes (MC.Vida.emitir('hoja'))
     arrastradas por la brisa hacia el destino o la próxima esquina;
   - hebras curvas de viento diegético a baja altura (z = 1,1..3,2 m sobre
     el suelo, siguiendo la convención 5.2 de Vistas.aPantalla);
   - pequeñas bandadas de palomas urbanas (MC.Vida.aves con guiaCine: true)
     que despegan delante del jugador y planean hacia el destino en 3D y 2D.
   Funciona a pie, en bici, en moto o en carro. Respeta MC.opciones.particulas.
   ===================================================================== */
const GuiaCine = {
  version: '5.2.0-g5-05',
  _t: null,
  _cdHoja: 0,
  _cdPaloma: 0,
  _cinePrev: false,
  _destPrev: '',
  brisa: [],
  MAX_BRISA: 32,
  metricas: {
    activo: false,
    rumbo: 0,
    dist: 0,
    hojasEmitidas: 0,
    palomasEmitidas: 0,
    hebrasActivas: 0,
    palomasActivas: 0
  },

  /* Destino activo (misión, contrato, modo o pin libre en el mapa) */
  destino() {
    return G.objetivo || G.destinoLibre || null;
  },

  /* Rumbo horizontal hacia el destino (suavizado hacia la próxima esquina si G.Cine la calculó) */
  rumboHacia(C, O) {
    const dx = O.x - C.x, dy = O.y - C.y;
    const dist = Math.hypot(dx, dy);
    let ang = Math.atan2(dy, dx);
    if (G.Cine && G.Cine.giro && G.Cine.dGiro < 90 && C.veh && C.veh.clase !== 'pie') {
      const giroAng = C.a + G.Cine.giro * .42;
      const dif = Math.atan2(Math.sin(giroAng - ang), Math.cos(giroAng - ang));
      if (Math.abs(dif) < 1.15) ang += dif * .45;
    }
    return { ang, dist };
  },

  /* Emite una ráfaga inmediata de hojas + viento (+ palomas guía si conPalomas) */
  rafaga(conPalomas = false) {
    const C = G.cuerpo, O = this.destino();
    if (!G.cine || !C || !O) return false;
    const { ang, dist } = this.rumboHacia(C, O);
    if (dist < 14) return false;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const nx = -sa, ny = ca;
    const escalaP = (typeof MC !== 'undefined' && MC.opciones) ? (MC.opciones.particulas ?? 1) : 1;

    /* 1. Hojas reales en MC.Vida impulsadas hacia el destino */
    if (typeof MC !== 'undefined' && MC.Vida && MC.Vida.emitir && escalaP > 0) {
      const nH = Math.max(2, Math.round(5 * escalaP));
      for (let i = 0; i < nH; i++) {
        const lat = (Math.random() - .5) * 9;
        const adel = -1 + Math.random() * 9;
        MC.Vida.emitir('hoja', C.x + ca * adel + nx * lat, C.y + sa * adel + ny * lat, 1, {
          z: 1.2 + Math.random() * 2.2,
          vx: ca * (5.8 + Math.random() * 3.4),
          vy: sa * (5.8 + Math.random() * 3.4),
          vz: .22 + Math.random() * .35,
          vel: .35,
          vida: 2.8,
          tam: .22
        });
        this.metricas.hojasEmitidas++;
      }
    }

    /* 2. Hebras de brisa y hojas de guayacán visibles en 3D y 2D */
    const nB = Math.max(3, Math.round(7 * Math.max(.4, escalaP)));
    for (let i = 0; i < nB; i++) {
      if (this.brisa.length >= this.MAX_BRISA) this.brisa.shift();
      const lat = (Math.random() - .5) * 11;
      const adel = -2 + Math.random() * 11;
      this.brisa.push({
        x: C.x + ca * adel + nx * lat,
        y: C.y + sa * adel + ny * lat,
        z: 1.1 + Math.random() * 2.1,
        ang,
        v: 8.5 + Math.random() * 4.5,
        t: 0,
        dur: 1.7 + Math.random() * .9,
        dorada: Math.random() < .64,
        fase: Math.random() * Math.PI * 2
      });
    }

    /* 3. Bandada guía de 3 palomas urbanas en MC.Vida.aves */
    if (conPalomas && typeof MC !== 'undefined' && MC.Vida && Array.isArray(MC.Vida.aves)) {
      const n = 3, m = [];
      for (let i = 0; i < n; i++) {
        m.push([(-i) * 1.45, (i === 0 ? 0 : i === 1 ? -1.35 : 1.35), Math.random() * Math.PI * 2]);
      }
      MC.Vida.aves.push({
        x: C.x + ca * 7.5 + nx * ((Math.random() - .5) * 2.5),
        y: C.y + sa * 7.5 + ny * ((Math.random() - .5) * 2.5),
        z: 2.8,
        sube: true,
        asustada: false,
        guiaCine: true,
        creadoT: this._t || G.t || 0,
        dur: 9,
        a: ang,
        v: 11.5,
        n,
        garza: false,
        m
      });
      while (MC.Vida.aves.length > 10) MC.Vida.aves.shift();
      this.metricas.palomasEmitidas += n;
    }

    this.metricas.activo = !!(G.cine && C && O && !G.dron && !G.viaje && !G.pausa);
    this.metricas.rumbo = +ang.toFixed(3);
    this.metricas.dist = Math.round(dist);
    this.metricas.hebrasActivas = this.brisa.length;
    if (typeof MC !== 'undefined' && MC.Vida && Array.isArray(MC.Vida.aves)) {
      let pa = 0;
      for (const b of MC.Vida.aves) if (b.guiaCine && b.m) pa += b.m.length;
      this.metricas.palomasActivas = pa;
    }
    return true;
  },

  actualizar(t, es2D) {
    const dt = this._t == null ? 1 / 60 : MC.clamp(t - this._t, 0, .1);
    this._t = t;
    const C = G.cuerpo, O = this.destino();
    const ok = !!(G.cine && C && O && !G.dron && !G.viaje && !G.pausa);
    this.metricas.activo = ok;

    const claveDest = O ? (Math.round(O.x) + ',' + Math.round(O.y)) : '';
    if (ok && (!this._cinePrev || claveDest !== this._destPrev)) {
      this._cdHoja = 0;
      this._cdPaloma = 0;
    }
    this._cinePrev = ok;
    this._destPrev = claveDest;

    if (ok) {
      const { ang, dist } = this.rumboHacia(C, O);
      this.metricas.rumbo = +ang.toFixed(3);
      this.metricas.dist = Math.round(dist);
      if (dist >= 14) {
        this._cdHoja -= dt;
        this._cdPaloma -= dt;
        if (this._cdHoja <= 0) {
          this._cdHoja = 1.35;
          const enviarPalomas = this._cdPaloma <= 0;
          if (enviarPalomas) this._cdPaloma = 5.8;
          this.rafaga(enviarPalomas);
        }
      }
    } else if (!G.cine) {
      /* Al apagar Modo cine, disipar las hebras suavemente y retirar bandadas guía */
      if (this.brisa.length) {
        for (const b of this.brisa) b.t += dt * 3;
      }
    }

    /* Guiar las hojas vivas en MC.Vida.P en la dirección del destino */
    if (ok && typeof MC !== 'undefined' && MC.Vida && Array.isArray(MC.Vida.P)) {
      const ca = Math.cos(this.metricas.rumbo), sa = Math.sin(this.metricas.rumbo);
      for (const p of MC.Vida.P) {
        if (p.tipo === 'hoja' && p.z > .2) {
          p.vx += (ca * 6.4 - p.vx) * Math.min(1, dt * 3.5);
          p.vy += (sa * 6.4 - p.vy) * Math.min(1, dt * 3.5);
        }
      }
    }

    /* En vistas 3D (donde Vista2D no llama MC.Vida.actualizar), avanzar las palomas guía */
    let palAct = 0;
    if (typeof MC !== 'undefined' && MC.Vida && Array.isArray(MC.Vida.aves)) {
      for (let i = MC.Vida.aves.length - 1; i >= 0; i--) {
        const b = MC.Vida.aves[i];
        if (!b.guiaCine) continue;
        if (!es2D) {
          if (b.sube) {
            b.z = Math.min(10.5, b.z + dt * 2.8);
            if (b.z >= 10.5) b.sube = false;
          }
          b.x += Math.cos(b.a) * b.v * dt;
          b.y += Math.sin(b.a) * b.v * dt;
        }
        const edad = (t - (b.creadoT || 0));
        const lejos = C ? Math.hypot(b.x - C.x, b.y - C.y) > 150 : true;
        if (!G.cine || edad > (b.dur || 9) || lejos) {
          MC.Vida.aves.splice(i, 1);
          continue;
        }
        palAct += b.m ? b.m.length : 0;
      }
    }
    this.metricas.palomasActivas = palAct;

    for (let i = this.brisa.length - 1; i >= 0; i--) {
      const b = this.brisa[i];
      b.t += dt;
      if (b.t >= b.dur) { this.brisa.splice(i, 1); continue; }
      const ond = Math.sin(b.t * 4.4 + b.fase) * .22;
      b.x += Math.cos(b.ang + ond) * b.v * dt;
      b.y += Math.sin(b.ang + ond) * b.v * dt;
      b.z = Math.max(.45, b.z + Math.sin(b.t * 3.2 + b.fase) * .45 * dt);
    }
    this.metricas.hebrasActivas = this.brisa.length;
  },

  dibujar(g, pr, d, t) {
    const es2D = !!(G.vistas && G.vistas.efectiva && G.vistas.efectiva().tipo === '2d');
    this.actualizar(t, es2D);
    const hayPalomas = !es2D && this.metricas.palomasActivas > 0;
    if (!this.brisa.length && !hayPalomas) return;

    const noche = !!(G.reloj && (G.reloj.hora < 6 || G.reloj.hora > 18.5));
    const tau = Math.PI * 2;
    g.save();
    g.lineCap = 'round';

    /* 1. Hebras curvas de brisa y hojas de guayacán */
    for (const b of this.brisa) {
      const k = b.t / b.dur;
      const al = Math.sin(k * Math.PI);
      const ca = Math.cos(b.ang), sa = Math.sin(b.ang);
      const nx = -sa, ny = ca;
      const curva = Math.sin(b.t * 5 + b.fase) * .55;
      const p0 = pr(b.x, b.y, b.z);
      const p1 = pr(b.x - ca * 2.1 + nx * curva, b.y - sa * 2.1 + ny * curva, b.z - .1);
      const p2 = pr(b.x - ca * 4.4 - nx * curva * .5, b.y - sa * 4.4 - ny * curva * .5, b.z - .22);
      if (!p0 || !p1) continue;

      g.strokeStyle = noche
        ? 'rgba(214,232,255,' + (.42 * al).toFixed(3) + ')'
        : 'rgba(255,250,235,' + (.55 * al).toFixed(3) + ')';
      g.lineWidth = Math.max(1.3, 2.2 * d * al);
      g.beginPath();
      if (p2) {
        g.moveTo(p2[0], p2[1]);
        g.quadraticCurveTo(p1[0], p1[1], p0[0], p0[1]);
      } else {
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p0[0], p0[1]);
      }
      g.stroke();

      /* Hoja dorada de guayacán o verde en la punta de la ráfaga */
      g.save();
      g.translate(p0[0], p0[1]);
      g.rotate(Math.atan2(p0[1] - p1[1], p0[0] - p1[0]) + Math.sin(b.t * 6.5 + b.fase) * .45);
      g.fillStyle = b.dorada
        ? 'rgba(246,198,66,' + (.94 * al).toFixed(3) + ')'
        : 'rgba(134,192,76,' + (.90 * al).toFixed(3) + ')';
      g.strokeStyle = 'rgba(30,26,18,' + (.35 * al).toFixed(3) + ')';
      g.lineWidth = Math.max(.7, .9 * d);
      g.beginPath();
      g.ellipse(0, 0, 4.6 * d, 2.2 * d, 0, 0, tau);
      g.fill();
      g.stroke();
      g.restore();
    }

    /* 2. En vistas 3D, dibujar las bandadas guía de palomas urbanas (en 2D ya las dibuja MC.Vida) */
    if (hayPalomas && typeof MC !== 'undefined' && MC.Vida && Array.isArray(MC.Vida.aves)) {
      const t2 = Math.floor(t * 12) / 12;
      for (const b of MC.Vida.aves) {
        if (!b.guiaCine || !b.m) continue;
        const ca = Math.cos(b.a), sa = Math.sin(b.a);
        for (const [dx, dy, fa] of b.m) {
          const wx = b.x + dx * ca - dy * sa;
          const wy = b.y + dx * sa + dy * ca;
          const q = pr(wx, wy, b.z);
          const qAd = pr(wx + ca * 1.2, wy + sa * 1.2, b.z);
          if (!q || !qAd) continue;
          const s = Math.max(4.5 * d, Math.min(13 * d, (typeof escalaEn === 'function' ? escalaEn(wx, wy) : 6) * .58));
          const ala = Math.sin(t2 * 13 + fa) * .78;

          /* Sombra sutil en el suelo durante el día */
          if (!noche) {
            const qs = pr(wx, wy, .05);
            if (qs) {
              g.fillStyle = 'rgba(12,16,24,.18)';
              g.beginPath();
              g.ellipse(qs[0], qs[1], s * .62, s * .24, 0, 0, tau);
              g.fill();
            }
          }

          /* Paloma con silueta de alas claras y borde oscuro legible sobre cielo o asfalto */
          const angP = Math.atan2(qAd[1] - q[1], qAd[0] - q[0]);
          g.save();
          g.translate(q[0], q[1]);
          g.rotate(angP + Math.PI / 2);
          g.lineJoin = 'round';
          g.strokeStyle = 'rgba(26,30,38,.78)';
          g.lineWidth = Math.max(2.6, s * .34);
          g.beginPath();
          g.moveTo(-s, -ala * s);
          g.quadraticCurveTo(-s * .38, -s * .28, 0, 0);
          g.quadraticCurveTo(s * .38, -s * .28, s, -ala * s);
          g.stroke();

          g.strokeStyle = noche ? '#cdd9eb' : '#f4f2ec';
          g.lineWidth = Math.max(1.5, s * .21);
          g.beginPath();
          g.moveTo(-s, -ala * s);
          g.quadraticCurveTo(-s * .38, -s * .28, 0, 0);
          g.quadraticCurveTo(s * .38, -s * .28, s, -ala * s);
          g.stroke();
          g.restore();
        }
      }
    }

    g.restore();
  }
};

if (typeof EXTRAS !== 'undefined' && EXTRAS.capas) {
  EXTRAS.capas.push((g, pr, d, t) => GuiaCine.dibujar(g, pr, d, t));
}
G.GuiaCine = GuiaCine;
