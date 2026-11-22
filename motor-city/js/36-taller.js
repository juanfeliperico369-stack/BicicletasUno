/* =====================================================================
   TALLER DE VEHÍCULOS · diseñar cualquier vehículo con ingeniería real y manejarlo
   - Ficha técnica → desempeño calculado: velocidad máxima (potencia = arrastre + rodadura), 0–100 km/h (integrando
     el par del motor por marchas y el límite de agarre μ·m·g), frenada de 100 a 0, autonomía y CO₂ por km
     (energía del combustible o de la batería con su eficiencia), velocidad de pérdida de un avión, velocidad de
     casco de una lancha y potencia humana de una bici (con MC.Seres).
   - El vehículo diseñado se registra en MC.Vehiculos con sus cifras reales y su modelo de manejo.
   - Física de carro (modelo de bicicleta con dos ejes): par por marchas, arrastre, rodadura, pendiente, agarre
     lateral con saturación (las llantas «se rinden» y el carro derrapa), freno de mano para drift y clima (MC.Ambiente).
   ===================================================================== */
const Taller = {
  /* ficha: { id, n, tipo ('carro'|'moto'|'bici'|'avion'|'lancha'|'camion'), masa, potenciaKW, parNm, rpmMax, marchas, final, rueda,
             cd, area, crr, mu, traccion (0..1 de la masa en el eje motriz), combustible, tanqueL, bateriaKWh, eficiencia,
             alasM2, clMax, esloraM, ciclista (MC.Seres.Persona) } */
  disenar(f) {
    const F = Object.assign({ tipo: 'carro', masa: 1200, potenciaKW: 80, parNm: 150, rpmMax: 6500, marchas: [3.6, 2.1, 1.4, 1.0, .8], final: 3.9, rueda: .31, cd: .32, area: 2.1, crr: .012, mu: .9, traccion: .6, combustible: 'gasolina', tanqueL: 45, eficiencia: null }, f);
    const P = F.tipo === 'bici' && F.ciclista ? F.ciclista.potencia : F.potenciaKW * 1000, m = F.masa + (F.ciclista ? F.ciclista.masa : F.tipo === 'bici' ? 75 : 75);
    const vmax = Fis.vmaxPotencia(P * (F.tipo === 'bici' ? 1 : .9), m, F.cd, F.area, F.crr);
    /* 0–100 km/h: integración con par por marchas (curva parabólica con pico en el 70 % de las rpm) y límite de tracción */
    const cien = (() => { if (vmax < 27.8) return null; let v = 0, t = 0, mar = 0; const dt = .01; while (v < 27.78 && t < 60) { const rpm = clamp(v / F.rueda * F.marchas[mar] * F.final * 60 / TAU, 1000, F.rpmMax), par = F.parNm * (1 - Math.pow((rpm / F.rpmMax - .7) / .7, 2) * .6), Fm = Math.min(par * F.marchas[mar] * F.final / F.rueda * .9, P / Math.max(v, 1)), Ft = Math.min(Fm, F.mu * m * C.g * F.traccion), Fr = Fis.arrastre(C.rhoAire, v, F.cd, F.area) + Fis.rodadura(F.crr, m); v += (Ft - Fr) / m * dt; t += dt; if (rpm >= F.rpmMax * .97 && mar < F.marchas.length - 1) { mar++; t += .25; } } return t; })();
    const frenada = Fis.frenada(27.78, F.mu);
    /* consumo a 90 km/h: potencia en la rueda / eficiencia → energía por km */
    const v90 = 25, Pr = (Fis.arrastre(C.rhoAire, v90, F.cd, F.area) + Fis.rodadura(F.crr, m)) * v90, efi = F.eficiencia ?? (F.bateriaKWh ? .85 : F.tipo === 'bici' ? .24 : .27), MJkm = Pr / efi / v90 * 1000 / 1e6;
    let autonomia = null, consumo = null, co2 = null;
    if (F.bateriaKWh) { autonomia = F.bateriaKWh * 3.6 / MJkm; consumo = MJkm / 3.6 * 100; co2 = 0; }
    else if (F.tipo !== 'bici' && Quim.COMBUSTIBLES[F.combustible]) { const Q = Quim.COMBUSTIBLES[F.combustible]; consumo = MJkm / Q.MJL * 100; autonomia = F.tanqueL / (consumo / 100); co2 = (Q.CO2kgL || 0) * consumo / 100 * 1000; }
    else if (F.tipo === 'bici') { consumo = MJkm / 4.184e-3; }   // kcal por km del ciclista
    const r = { ficha: F, masaTotal: m, vmax, ceroCien: cien, frenada100: frenada, consumo, autonomia, co2gkm: co2, potenciaPeso: P / m };
    if (F.tipo === 'avion') { const atm = Fis.atmosfera(F.altitud || 0); r.vPerdida = Math.sqrt(2 * m * C.g / (atm.rho * (F.alasM2 || 16) * (F.clMax || 1.6))); }
    if (F.tipo === 'lancha') r.vCasco = 1.25 * Math.sqrt(F.esloraM || 5);
    return r;
  },
  /* registra el diseño como vehículo jugable del motor (con sus cifras reales y el modelo de manejo) */
  registrar(d, extra = {}) {
    const F = d.ficha, clase = { carro: 'auto', moto: 'moto', bici: 'rueda', avion: 'aire', lancha: 'agua', camion: 'pesado' }[F.tipo] || 'auto', base = { auto: 'carro', moto: 'moto', rueda: 'bici', aire: 'avioneta', agua: 'lancha', pesado: 'camion' }[clase];
    const acc = d.ceroCien ? 27.78 / d.ceroCien : d.potenciaPeso * .25, v = Object.assign({ id: F.id || 'disenado_' + Math.round(F.masa), n: F.n || 'Mi vehículo', de: base, vmax: d.vmax, acc, freno: F.mu * C.g * .9, masa: d.masaTotal, largo: F.largo || (clase === 'auto' ? 4.3 : clase === 'moto' ? 2.1 : 1.8), ancho: F.ancho || (clase === 'auto' ? 1.8 : .8), ficha: F, desempeno: d, dinamica: clase === 'auto' || clase === 'pesado' ? 'carro' : null, color: F.color || '#00e5ff', vmin: d.vPerdida }, extra);
    return Vehiculos.registrar(v);
  }
};
/* ---------- manejo de carro: modelo de bicicleta con agarre que se satura (derrape) ---------- */
class ManejoCarro {
  constructor(v) { const F = v.ficha || {}; this.v = v; this.m = v.masa || 1200; this.L = F.distEjes || 2.6; this.a = this.L * .45; this.b = this.L - this.a; this.Iz = this.m * (this.L * this.L) / 12 * 1.4; this.mu = F.mu || .9; this.Cf = 80000 * this.m / 1200; this.Cr = 90000 * this.m / 1200; this.vx = 0; this.vy = 0; this.r = 0; this.marcha = 1; }
  /* E: { acel, giro, freno de mano (salto) } · ambiente: { agarre (clima × suelo), pend } · devuelve { avance, lateral, giro } por segundo */
  paso(dt, C2, E, amb = {}) {
    const v = this.v, F = v.ficha || {}, mu = this.mu * (amb.agarre ?? 1), N = this.m * C.g, delta = (E.giro || 0) * (.55 - .35 * clamp(Math.abs(this.vx) / 40, 0, 1)), mano = !!E.salto;
    const Pm = (F.potenciaKW || v.vmax * v.acc * this.m / 1000 * .5) * 1000, rev = (E.acel || 0) < 0 && this.vx < 1, Fmotor = (E.acel || 0) > 0 ? Math.min(Pm / Math.max(3, Math.abs(this.vx)), mu * N * (F.traccion || .6)) * E.acel : rev && this.vx > -8 ? Math.min(Pm / 3, mu * N * (F.traccion || .6)) * .45 * E.acel : 0, Ffreno = (E.acel || 0) < 0 && !rev ? -E.acel * mu * N * .9 * Math.sign(this.vx || 1) : 0;   /* 4.0.2: con el carro casi quieto, frenar es reversa (hasta 8 m/s) */
    const Fres = Fis.arrastre(C.rhoAire, this.vx, F.cd || .32, F.area || 2.1) * Math.sign(this.vx) + Fis.rodadura(F.crr || .012, this.m) * Math.sign(this.vx) + Fis.pendiente(this.m, amb.pend || 0);
    /* ángulos de deriva de cada eje y fuerzas laterales con saturación (μ·carga del eje) */
    const vx = Math.max(.5, Math.abs(this.vx)) * Math.sign(this.vx || 1), af = Math.atan2(this.vy + this.a * this.r, Math.abs(vx)) - delta * Math.sign(vx), ar = Math.atan2(this.vy - this.b * this.r, Math.abs(vx));
    const Nf = N * this.b / this.L, Nr = N * this.a / this.L, sat = (Cx, al, Nn) => clamp(-Cx * al, -mu * Nn, mu * Nn), Fyf = sat(this.Cf, af, Nf), Fyr = sat(this.Cr * (mano ? .25 : 1), ar, Nr) * (Math.abs(Fmotor) > mu * Nr * .8 ? .6 : 1);
    const ax = (Fmotor - Ffreno - Fres - Fyf * Math.sin(delta)) / this.m + this.vy * this.r, ay = (Fyf * Math.cos(delta) + Fyr) / this.m - this.vx * this.r, ar2 = (this.a * Fyf * Math.cos(delta) - this.b * Fyr) / this.Iz;
    this.vx += ax * dt; this.vy += ay * dt; this.r += ar2 * dt; if (Math.abs(this.vx) < .3 && !E.acel) { this.vx = 0; this.vy *= .8; this.r *= .8; }
    this.vy *= Math.pow(.2, dt); this.derrape = Math.abs(Math.atan2(this.vy, Math.abs(this.vx) + .1));
    return { avance: this.vx, lateral: this.vy, giro: this.r, derrape: this.derrape };
  }
}
Object.assign(MC, { Taller, ManejoCarro });
/* el cuerpo del jugador usa el manejo de carro cuando su vehículo lo pide (sin tocar la física base) */
Cuerpo.prototype._actualizarBase = Cuerpo.prototype.actualizar;
Cuerpo.prototype.actualizar = function (dt, E = {}) {
  /* 4.6: los vehículos del taller también van con el manejo arcade (el de EnCicla). El modelo de bicicleta con agarre (pesado, al estilo
     de GTA IV) queda solo si se pide: MC.opciones.manejo = 'simulacion' */
  const V = this.veh; if (V.dinamica !== 'carro' || !(MC.opciones && MC.opciones.manejo === 'simulacion')) { this._carro = null; return this._actualizarBase(dt, E); }
  dt = Math.min(dt, .05); this.eventos.length = 0; if (!this._carro || this._carro.v !== V) { this._carro = new ManejoCarro(V); this._carro.vx = this.v; }
  /* 4.5: si el juego cambió la velocidad desde afuera (teletransporte, salida de un cinemático), el modelo la toma */
  if (Math.abs(this.v - this._carro.vx) > 1.5) { this._carro.vx = this.v; this._carro.vy = 0; this._carro.r = 0; }
  let acel = E.acel || 0, giro = E.giro || 0;
  if (E.dir && E.dir.m > .08) { const d = angDif(this.a, Math.atan2(E.dir.y, E.dir.x));
    /* 4.0.2: el destino quedó atrás → frena y, ya despacio, retrocede girando al revés (vuelta en tres puntos); antes se quedaba quieto */
    if (Math.abs(d) > 2.2) { if (this._carro.vx > 2) { acel = -.7; giro = clamp(d * 2, -1, 1); } else { acel = -.6 * Math.max(.5, E.dir.m); giro = -Math.sign(d); } }
    /* 4.5: giro amortiguado (sin zigzag a alta velocidad) y acelerador recogido en las curvas cerradas para poder darlas */
    else { giro = clamp(d * 2 - this._carro.r * .25, -1, 1); acel = E.dir.m * clamp(1.15 - Math.abs(d) * .55, .25, 1); } }
  ({ giro, acel } = this._asistencia(E, giro, acel, dt));
  this.tt = this.mundo.suelo(this.x, this.y); this.pend = this.mundo.pendiente(this.x, this.y, this.a, 12);
  const Tp = Terreno.paso(this, this.x, this.y), suelo = Math.max(.15, Tp.ok === false ? .2 : Tp.f || 1);
  const agarre = (TT_SUPERFICIE[this.tt] || .5) / (this.tt === TT.CICLO ? 1.3 : 1) * Ambiente.agarre(this.clima), turbo = !!E.turbo && acel > 0;
  const R = this._carro.paso(dt, null, { acel: acel * (turbo ? 1.4 : 1), giro, salto: !!(E.derrape || E.salto) }, { agarre: clamp(agarre, .1, 1), pend: this.pend });
  /* 4.5: el suelo, el daño (escala) y el turbo ponen el tope de velocidad, como en la física base */
  const vlim = this.vmax() * suelo * (turbo ? 1.25 : 1); if (this._carro.vx > vlim) this._carro.vx -= (this._carro.vx - vlim) * Math.min(1, dt * 2.5); if (this._carro.vx < -vlim * .4) this._carro.vx = -vlim * .4;
  const ca = Math.cos(this.a), sa = Math.sin(this.a), dx = (ca * R.avance - sa * R.lateral) * dt, dy = (sa * R.avance + ca * R.lateral) * dt, x0m = this.x, y0m = this.y;
  this.a += R.giro * dt; this.v = this._carro.vx;
  /* 4.5: el mismo choque que la física base: desliza a lo largo de la pared, pierde según el ángulo y se alinea */
  const v0 = this.v; this._mover(dx, dy, dt);
  if (this.v !== v0) { const k = v0 ? clamp(this.v / v0, -.3, 1) : 0; this._carro.vx = this.v; this._carro.vy *= Math.max(0, k); this._carro.r *= k > .7 ? .7 : .2; }
  this.choque = Math.max(0, (this.choque || 0) - dt);
  this.derrape = R.derrape; this.deslizamiento = R.derrape; if (R.derrape > .22 && Math.abs(R.avance) > 6) this.eventos.push('derrape');
  this._despues(E, x0m, y0m, dt);
  this._niveles(dt); this.estado = 'sentado'; return this;
};
