/* =====================================================================
   QUÍMICA DEL MUNDO · 5.2 · G5-08 (idea de Zelda: Breath of the Wild)
   Conecta MC.Quim / MC.C / MC.ClimaGlobal con MC.Efectos y MC.Vida de forma
   100 % aditiva (sin modificar js/88-efectos.js ni js/88-vida.js):
   1. La lluvia apaga el fuego de los carros antes de que estallen, liberando
      vapor de agua (H2O) en proporción a la intensidad de lluvia, la masa
      molar del agua (Quim.masaMolar('H2O')) y el calor latente de
      vaporización (C.Lv).
   2. Los charcos de lluvia sobre calles, plazas, ciclorrutas y andenes
      salpican agua en abanico desde ambos costados al pasar a pie, en bici,
      moto o carro (visibles en 3D vía MC.Efectos y en 2D vía MC.Vida).
   3. El viento real de E.clima.viento ({ v, dir }) desvía las columnas de
      humo (MC.Efectos.P) y el polvo/hojas (MC.Vida.P) según su altura z
      (perfil de capa límite atmosférica).
   ===================================================================== */
const QuimicaMundo = {
  version: '5.2.0-g5-08',
  _salpCd: 0,
  humedadSuelo: 0,
  metricas: {
    fuegosApagados: 0,
    salpicaduras: 0,
    humosDesviados: 0,
    ultimoViento: { vx: 0, vy: 0 }
  },

  /* Determina si en (x, y) hay charco bajo lluvia o pavimento húmedo */
  hayCharco(M, x, y, humedad) {
    if (humedad < .18) return false;
    const tt = M && M.suelo ? M.suelo(x, y) : TT.ROAD;
    if (tt !== TT.ROAD && tt !== TT.AVE && tt !== TT.AUTO && tt !== TT.WALK && tt !== TT.PLAZA && tt !== TT.CICLO) return false;
    const cx = Math.floor(x / 6), cy = Math.floor(y / 6);
    const prob = clamp(.28 + humedad * .52, .2, .85);
    return h2(cx, cy, 731) < prob;
  },

  /* Tasa de extinción térmica del fuego por lluvia (0 = seco, 1+ = aguacero) */
  tasaExtincion(lluvia) {
    if (!lluvia || lluvia < .2) return 0;
    const masaAgua = typeof Quim !== 'undefined' && Quim.masaMolar ? Quim.masaMolar('H2O') : 18.015;
    const factorLatente = (typeof C !== 'undefined' && C.Lv) ? (C.Lv / 2.257e6) : 1;
    return clamp((lluvia - .15) * 1.45 * (masaAgua / 18.015) * factorLatente, 0, 2.2);
  },

  /* Emite abanico lateral de gotas desde las ruedas o pasos en 3D (Efectos) y 2D (Vida) */
  _salpicar(x, y, ang, ancho, kVel, hum) {
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    const nGotas = Math.max(2, Math.round(3 + kVel * 5));
    const escalaP = (MC.opciones && MC.opciones.particulas != null) ? MC.opciones.particulas : 1;
    if (escalaP <= 0) return;

    if (typeof Vida !== 'undefined' && Vida.emitir) {
      for (const lado of [-1, 1]) {
        Vida.emitir('agua', x + nx * ancho * lado, y + ny * ancho * lado, nGotas, {
          vel: 1.4 + kVel * 2.2,
          vz: 1.4 + kVel * 2.4,
          vx: nx * lado * (1.3 + kVel * 2.1),
          vy: ny * lado * (1.3 + kVel * 2.1),
          tam: .12,
          vida: .58
        });
      }
    }
    if (typeof Efectos !== 'undefined' && Efectos._p) {
      const n3 = Math.max(2, Math.round((3 + kVel * 4) * escalaP));
      for (const lado of [-1, 1]) {
        const bx = x + nx * ancho * lado;
        const by = y + ny * ancho * lado;
        for (let i = 0; i < n3; i++) {
          const disp = (Math.random() - .5) * 1.4;
          const vLat = (1.8 + kVel * 3.4) * (.7 + Math.random() * .6);
          Efectos._p(
            'agua',
            bx + (Math.random() - .5) * .3,
            by + (Math.random() - .5) * .3,
            .22,
            nx * lado * vLat - Math.cos(ang) * (kVel * 1.1) + disp,
            ny * lado * vLat - Math.sin(ang) * (kVel * 1.1) + disp,
            (2.2 + kVel * 2.8) * (.7 + Math.random() * .5),
            .55 + Math.random() * .35,
            .11 + kVel * .05
          );
        }
      }
    }
    this.metricas.salpicaduras++;
    MC.emit('quimica:salpica', { x, y, kVel: +kVel.toFixed(2), hum: +hum.toFixed(2) });
  },

  paso(E, dt) {
    if (!E || !dt || dt <= 0) return;
    const cl = E.clima || {};
    const lluvia = Number(cl.lluvia || 0);
    if (lluvia > .1) this.humedadSuelo = clamp(this.humedadSuelo + lluvia * dt * .35, 0, 1);
    else this.humedadSuelo = Math.max(0, this.humedadSuelo - dt * .015);

    const vViento = (cl.viento && Number.isFinite(cl.viento.v)) ? cl.viento.v : 2;
    const dirV = (cl.viento && Number.isFinite(cl.viento.dir)) ? cl.viento.dir : 0;
    const wvx = Math.cos(dirV) * vViento;
    const wvy = Math.sin(dirV) * vViento;
    this.metricas.ultimoViento.vx = +wvx.toFixed(2);
    this.metricas.ultimoViento.vy = +wvy.toFixed(2);

    /* 1. La lluvia apaga los fuegos activos antes de estallar y suelta vapor H2O */
    if (typeof Efectos !== 'undefined' && Array.isArray(Efectos.fuegos) && Efectos.fuegos.length) {
      const tasa = this.tasaExtincion(lluvia);
      if (tasa > 0) {
        for (let i = Efectos.fuegos.length - 1; i >= 0; i--) {
          const f = Efectos.fuegos[i];
          f.humedad = (f.humedad || 0) + tasa * dt;
          if (Math.random() < Math.min(.78, tasa * .62)) {
            Efectos.humo(f.x, f.y, 1, {
              col: '#e3edf5',
              sube: 2.2,
              tam: .7 * (f.k || 1),
              vida: 1.9,
              vx: wvx * .35,
              vy: wvy * .35
            });
          }
          if (f.humedad >= 1) {
            f.estalla = false;
            Efectos.fuegos.splice(i, 1);
            Efectos.humo(f.x, f.y, 7, {
              col: '#edf4fa',
              r: 1.5,
              sube: 2.5,
              tam: 1.05,
              vida: 2.6,
              vx: wvx * .42,
              vy: wvy * .42
            });
            this.metricas.fuegosApagados++;
            MC.emit('quimica:apaga', { x: f.x, y: f.y, lluvia, sigue: f.sigue || null });
          }
        }
      }
    }

    /* 2. El viento desvía el humo (MC.Efectos.P) y el polvo/hojas (MC.Vida.P) según z */
    let desv = 0;
    if (typeof Efectos !== 'undefined' && Array.isArray(Efectos.P)) {
      for (let i = 0; i < Efectos.P.length; i++) {
        const p = Efectos.P[i];
        if (p.tipo === 'humo' && p.t >= 0) {
          const kAltura = .28 + Math.min(1.25, Math.max(0, p.z) * .18);
          p.vx += (wvx * kAltura - p.vx) * Math.min(1, dt * 1.45);
          p.vy += (wvy * kAltura - p.vy) * Math.min(1, dt * 1.45);
          desv++;
        }
      }
    }
    if (typeof Vida !== 'undefined' && Array.isArray(Vida.P)) {
      for (let i = 0; i < Vida.P.length; i++) {
        const p = Vida.P[i];
        if ((p.tipo === 'polvo' || p.tipo === 'hoja') && p.z > .05) {
          p.vx += wvx * .18 * dt;
          p.vy += wvy * .18 * dt;
        }
      }
    }
    this.metricas.humosDesviados = desv;

    /* 3. Charcos que salpican al pasar el jugador (a pie, bici, moto o carro) */
    const Cj = E.jugador && E.jugador.cuerpo;
    this._salpCd = Math.max(0, this._salpCd - dt);
    if (Cj && !Cj.enAire && !Cj.nadando && this._salpCd <= 0) {
      const vel = Math.abs(Cj.v || 0);
      const hum = Math.max(this.humedadSuelo, lluvia);
      if (vel > 1.4 && this.hayCharco(E.mundo, Cj.x, Cj.y, hum)) {
        const kVel = clamp(vel / 16, .25, 1.4);
        const ancho = (Cj.veh && Cj.veh.ancho) ? Cj.veh.ancho * .44 : .28;
        this._salpicar(Cj.x, Cj.y, Cj.a || 0, ancho, kVel, hum);
        this._salpCd = clamp(.22 - kVel * .08, .08, .22);
      }
    }
  }
};

/* Envoltura aditiva sobre Efectos.actualizar (corre en 3D y en 2D cada cuadro) */
if (typeof Efectos !== 'undefined' && Efectos.actualizar) {
  const _actEfOrig = Efectos.actualizar;
  Efectos.actualizar = function (E) {
    const tAntes = this._t;
    const r = _actEfOrig.call(this, E);
    const dt = (tAntes != null && this._t != null) ? clamp(this._t - tAntes, 0, .1) : 0;
    if (E && dt > 0) QuimicaMundo.paso(E, dt);
    return r;
  };
}

MC.QuimicaMundo = QuimicaMundo;
