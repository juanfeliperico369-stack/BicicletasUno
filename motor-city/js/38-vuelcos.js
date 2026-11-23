/* =====================================================================
   MOTOR CITY 5.2 · C5-01 — vuelco y auto-enderezado.
   Código del motor, no de un juego: solo coches/pesados en manejo real.
   El ángulo es visual y el choque utiliza el impulso de MC.Dinamica;
   las ruedas y colisiones siguen la física 2D del mundo sin teletransporte.
   ===================================================================== */
const Vuelcos = {
  umbral(H, clase) {
    const ancho = clamp(H.ancho || 1.8, 1, 3.6), cg = clamp(H.cgAlto || .65, .35, 2.2);
    const crit = 9.81 * ancho * .46 / cg;
    return crit * (clase === 'pesado' ? .84 : 1);
  },
  /* Determinista: se basa en aceleración lateral real y en el impulso de un
     golpe de costado. No hay números aleatorios en el vuelco. */
  paso(C, dt) {
    if (!(dt > 0) || !C || !C.veh) return false;
    const clase = C.veh.clase, compatible = clase === 'auto' || clase === 'pesado';
    if (!compatible || !MC.opciones || MC.opciones.manejo !== 'real' || C.ia) {
      C.vuelco = 0; C._vuelco = null; return false;
    }
    const h = clamp(dt, 0, .2), D = C._din, H = D && MC.Dinamica ? MC.Dinamica.hoja(C.veh) : null;
    if (!H) return false;
    let s = C._vuelco;
    if (!s) s = C._vuelco = { armado: 0, t: -1, signo: 1, fuerza: 0 };
    const ay = clamp(D.ay || 0, -80, 80), crit = this.umbral(H, clase);
    const lateralNormal = Array.isArray(C.normalChoque) ?
      C.normalChoque[0] * -Math.sin(C.a) + C.normalChoque[1] * Math.cos(C.a) : 0;
    const golpe = C.eventos && C.eventos.includes('choque') ? Math.abs(lateralNormal) * Math.max(0, C.impacto || 0) : 0;
    const energiaGolpe = golpe / .17;
    const esfuerzo = Math.max(Math.abs(ay), energiaGolpe);
    const velocidad = Math.abs(C.v || 0);
    const extremo = velocidad > 8 && esfuerzo > crit * 1.08 && (Math.abs(ay) > crit * 1.08 || golpe >= 9);
    if (s.t < 0) {
      s.armado = extremo ? Math.min(.25, s.armado + h) : Math.max(0, s.armado - h * 1.5);
      if (golpe > 12) s.armado = Math.max(s.armado, .12);
      if (s.armado >= .09) {
        s.t = 0; s.signo = Math.sign(ay || lateralNormal || 1) || 1;
        s.fuerza = Math.max(golpe, Math.abs(ay) * .6);
        s.armado = 0;
        C.eventos.push('vuelco'); C._vuelcoGolpe = s.fuerza;
        if (MC.emit) MC.emit('vuelco', C);
      }
    }
    if (s.t >= 0) {
      s.t += h;
      const suavizar = t => { const u = clamp(t, 0, 1); return u * u * (3 - 2 * u); };
      const ang = s.t < .52 ? Math.PI * suavizar(s.t / .52) :
        s.t < 1.55 ? Math.PI :
          2 * Math.PI - Math.PI * suavizar((2.65 - s.t) / 1.1);
      C.vuelco = s.signo * ang;
      C.v = (C.v || 0) * Math.exp(-h * 2.7);
      if (D) { D.u = C.v; D.w *= Math.exp(-h * 3); D.r *= Math.exp(-h * 3); }
      if (s.t >= 2.65) {
        C.vuelco = 0; s.t = -1; s.armado = 0; C._vuelcoGolpe = 0;
        C.eventos.push('enderezado'); return false;
      }
      return true;
    }
    C.vuelco = 0;
    return false;
  }
};
/* Complemento de la física existente: sin duplicar el mundo ni intervenir en
   los juegos de familia, donde el manejo por defecto es arcade. */
if (typeof Cuerpo !== 'undefined') {
  const actualizarFisica = Cuerpo.prototype.actualizar;
  Cuerpo.prototype.actualizar = function (dt, E) {
    const res = actualizarFisica.call(this, dt, E);
    Vuelcos.paso(this, dt);
    return res;
  };
}
MC.Vuelcos = Vuelcos;
