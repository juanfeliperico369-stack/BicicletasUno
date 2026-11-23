/* =====================================================================
   DINÁMICA REAL DEL CARRO (5.0) · «que se sienta»: peso, suspensión, marchas, derrapes y choques
   Pedido del autor: llegar al nivel de los grandes juegos de mundo abierto. Lo primero que se siente en 10 segundos es el carro.
   Ideas (sala limpia, nada de su código): la «hoja de manejo» por vehículo de los juegos de mundo abierto de los 2000 (unos
   30 números por carro) y el modelo de bicicleta de dos ejes de los libros de dinámica vehicular (Gillespie, Milliken,
   Pacejka: la curva de agarre que se satura, la «fórmula mágica»).
   - HOJA DE MANEJO: masa, batalla, reparto de peso, altura del centro de masa, agarre μ, rigidez de las llantas, tracción
     (trasera, delantera o 4×4), motor (kW, N·m, rpm), marchas automáticas, frenos, dirección y suspensión. Sale de la ficha del
     taller (Turno Cero trae masa, kW, N·m, Cd y área reales) o, sin ficha, de vmax, acc y masa de su clase.
   - EJES CON CARGA QUE CAMBIA: al frenar el peso pasa adelante (la trompa se hunde y la cola se aligera), al acelerar, atrás.
   - LLANTAS: agarre lateral que crece con el ángulo de deriva hasta un pico (~8°) y luego cede un poco (se puede derrapar y
     recuperar), y círculo de fricción: si el eje motriz empuja a fondo, agarra menos de lado (la cola se sale con potencia);
     el freno de mano bloquea atrás y la cola se suelta.
   - MOTOR Y MARCHAS: par según las rpm con tope de potencia, corte de rpm, cambios automáticos con un corte breve del empuje,
     freno de motor. Las rpm salen de las ruedas y dan el tono del motor (f = rpm/60 × cilindros/2, MC.PersecucionAudio).
   - CARROCERÍA CON RESORTES: cabeceo (frenar y acelerar), alabeo (curvas) y rebote (bordillos y aterrizajes), para dibujarla.
   - CHOQUES CON IMPULSO: contra una pared rebota según el ángulo y gira si el golpe va de lado; contra el tráfico reparte el
     golpe según las masas, y el otro carro sale corrido y atravesado (MC.Trafico lo devuelve a su carril después).
   - Con el joystick que apunta en el mundo, un control de estabilidad pide el giro que el agarre permite (como el ESP de un
     carro de verdad): responde rápido, pero si entras muy rápido a la curva el carro se va de largo; con el freno de mano, no
     hay ayuda y la cola se cruza.
   Se usa con MC.opciones.manejo = 'real' (⚙️ Flexibilidad → 🛞 Manejo; en Turno Cero es lo de fábrica). La IA sigue en arcade.
   ===================================================================== */
const DIN_CLASE = {
  auto: { pesoAdel: .55, cgAlto: .55, mu: 1, rig: 20, traccion: 'tras', kW: 90, Nm: 170, rpmMax: 6500, ralenti: 850, marchas: [3.5, 2.1, 1.45, 1.1, .87], rueda: .31, frenoG: .95, dirMax: .58, suspHz: 1.55, amort: .38, cil: 4, cd: .32, area: 2.1, crr: .013 },
  pesado: { pesoAdel: .5, cgAlto: 1.1, mu: .85, rig: 16, traccion: 'tras', kW: 160, Nm: 700, rpmMax: 3200, ralenti: 650, marchas: [6.5, 4, 2.6, 1.7, 1.2, 1], rueda: .5, frenoG: .72, dirMax: .52, suspHz: 1.15, amort: .36, cil: 6, cd: .7, area: 6.5, crr: .008 },
  moto: { pesoAdel: .48, cgAlto: .62, mu: 1.05, rig: 18, traccion: 'tras', kW: 45, Nm: 55, rpmMax: 10500, ralenti: 1300, marchas: [2.8, 2, 1.55, 1.25, 1.05, .92], rueda: .3, frenoG: .9, dirMax: .5, suspHz: 1.9, amort: .4, cil: 2, cd: .6, area: .8, crr: .015 }
};
/* masas del tráfico (kg) para repartir el golpe */
const DIN_MASA_TRAF = { carro: 1250, taxi: 1250, moto: 220, bici: 90, buseta: 7000, camion: 9000 };
const Dinamica = {
  /* el juego pide más empuje que el de un carro real (las persecuciones arrancan fuerte, como la biblia de Turno Cero: ×1,6) */
  potenciaJuego: 1.6,
  /* y llantas con más agarre que las de calle (≈1,3 g en asfalto seco): ágil en la ciudad, pero con peso y derrapes */
  agarreJuego: 1.3,
  activa(C) { const k = C.veh.clase; return !C.ia && !!MC.opciones && MC.opciones.manejo === 'real' && (k === 'auto' || k === 'pesado' || k === 'moto'); },
  /* la hoja de manejo del vehículo (se calcula una vez por vehículo y escala de velocidad) */
  hoja(V) {
    const esc = (MC.Vehiculos && MC.Vehiculos.escala) || 1; if (V._hoja && V._hoja.esc === esc) return V._hoja;
    const B = DIN_CLASE[V.clase === 'pesado' ? 'pesado' : V.clase === 'moto' ? 'moto' : 'auto'], F = V.ficha || {}, h = Object.assign({}, B, V.hojaManejo || {});
    h.esc = esc; h.masa = V.masa || F.masa || 1300; h.largo = V.largo || 4.3; h.ancho = V.ancho || 1.8;
    h.batalla = (V.hojaManejo && V.hojaManejo.batalla) || F.distEjes || clamp(h.largo * .6, 1.2, 6);
    h.a = h.batalla * (1 - h.pesoAdel); h.b = h.batalla * h.pesoAdel;   /* del centro de masa al eje de adelante (a) y al de atrás (b) */
    h.Iz = h.masa * (h.largo * h.largo + h.ancho * h.ancho) / 12;
    if (F.potenciaKW) { h.kW = F.potenciaKW; h.Nm = F.parNm || h.Nm; h.cd = F.cd || h.cd; h.area = F.area || h.area; h.crr = F.crr || h.crr; h.mu = F.mu || h.mu; }
    else { const vm = Math.max(5, V.vmax || 20); h.kW = Math.max(4, (Fis.arrastre(C.rhoAire, vm, h.cd, h.area) + Fis.rodadura(h.crr, h.masa)) * vm / .85 / 1000); h.Nm = Math.max(25, h.masa * Math.max(1.5, V.acc || 3) * h.rueda / (h.marchas[0] * 3.9 * .9)); }
    /* el desarrollo: en la última marcha, la velocidad tope del vehículo (con algo de margen para el turbo) cae cerca del corte */
    const vref = Math.max(5, (V.vmax || 25) * esc * 1.12); h.final = (V.hojaManejo && V.hojaManejo.final) || (h.rpmMax * .92 * TAU / 60 * h.rueda) / (h.marchas[h.marchas.length - 1] * vref);
    return (V._hoja = h);
  },
  estado() { return { u: 0, w: 0, r: 0, d: 0, marcha: 1, rpm: 0, cambio: 0, ax: 0, ay: 0, cab: 0, vcab: 0, alab: 0, valab: 0, reb: 0, vreb: 0, patina: 0, deriva: 0 }; },
  /* par del motor (N·m) a esas rpm: curva con pico en el 62 % y tope de potencia */
  par(H, rpm) { const k = rpm / H.rpmMax, p = H.Nm * Math.max(.3, 1 - .45 * Math.pow((k - .62) / .62, 2)), w = Math.max(1, rpm * TAU / 60); return Math.min(p, H.kW * 1000 / w); },
  /* un paso PURO (se prueba en Node): D = estado, H = hoja, U = mando { thr 0..1, freno 0..1, rev 0..1, delta (rad), mano },
     A = ambiente { mu (agarre del piso × clima), crrExtra, pend (subida + en el sentido del carro), vlim, potencia (×), enAire } */
  paso(D, H, U, A, h) {
    const m = H.masa, g = C.g, L = H.batalla, mu = H.mu * (A.mu ?? 1) * Dinamica.agarreJuego, dl = U.delta || 0, cd = Math.cos(dl), sd = Math.sin(dl);
    /* cargas por eje con la transferencia de la aceleración anterior */
    const tr = m * clamp(D.ax, -12, 12) * H.cgAlto / L, Ff0 = m * g * H.pesoAdel, Fzf = Math.max(m * g * .12, Ff0 - tr), Fzr = Math.max(m * g * .12, m * g - Ff0 + tr);
    /* motor: rpm desde las ruedas (con embrague que patina al arrancar) */
    const n = H.marchas.length, au = Math.abs(D.u), rev = U.rev > 0 && D.u < .6;
    if (rev) D.marcha = -1; else if (D.marcha < 1) D.marcha = 1;
    const rel = (D.marcha < 0 ? H.marchas[0] * 1.1 : H.marchas[D.marcha - 1]) * H.final, rpmRueda = au / H.rueda * rel * 60 / TAU, thr = rev ? U.rev : U.thr;
    const rpmLibre = H.ralenti + thr * (H.rpmMax * .55 - H.ralenti); D.rpm = clamp(Math.max(rpmRueda, rpmRueda < rpmLibre ? lerp(rpmRueda, rpmLibre, clamp(1 - rpmRueda / rpmLibre, 0, 1)) : 0, H.ralenti), H.ralenti, H.rpmMax * 1.02);
    D.cambio = Math.max(0, D.cambio - h);
    /* cambios automáticos: arriba cerca del corte (con un corte breve del empuje), abajo cuando el motor se cae */
    if (!rev && D.cambio <= 0) { if (rpmRueda > H.rpmMax * .9 && D.marcha < n && thr > .1) { D.marcha++; D.cambio = .16; D.cambioEv = 1; } else if (D.marcha > 1 && rpmRueda < H.rpmMax * .4) { D.marcha--; D.cambio = .06; } }
    let Fd = 0; const vlim = A.vlim || 1e9;
    if (thr > 0 && D.cambio <= 0 && D.rpm < H.rpmMax) {
      const tope = rev ? clamp((8 - au) / 2, 0, 1) : clamp((vlim - D.u) / Math.max(1, vlim * .07), 0, 1);   /* se acerca a su tope sin golpe (el tope del juego: daño, suelo, turbo) */
      Fd = Dinamica.par(H, D.rpm) * rel * .88 / H.rueda * thr * (A.potencia ?? 1) * Dinamica.potenciaJuego * tope * (rev ? -1 : 1);
    }
    /* freno de motor sin acelerar (suave) */
    if (thr === 0 && !U.freno && au > 1) Fd -= Math.sign(D.u) * H.Nm * .1 * rel / H.rueda * (D.rpm / H.rpmMax);
    /* el empuje se reparte por eje y no pasa del agarre (si pasa, las ruedas patinan) */
    const kf = H.traccion === 'del' ? 1 : H.traccion === '4x4' ? .4 : 0, Fdf = Fd * kf, Fdr = Fd * (1 - kf);
    /* control de tracción (como los carros de hoy): el empuje no pasa del 75 % del agarre del eje (y menos si la cola ya se está
       yendo, o si las ruedas van giradas), para que quede agarre de lado; sin él (freno de mano) las ruedas patinan y la cola se sale */
    const limF = mu * Fzf, limR = mu * Fzr, tcs = U.mano ? 1 : clamp(.92 - D.deriva * 3 - Math.abs(dl) * .5, .3, .92);
    D.patina = (Math.abs(Fdf) > limF * tcs * 1.05 || Math.abs(Fdr) > limR * tcs * 1.05) && au < 6 && thr > .5 ? 1 : 0;
    let Fxf = clamp(Fdf, -limF * tcs, limF * tcs), Fxr = clamp(Fdr, -limR * tcs, limR * tcs);
    /* frenos: 65 % adelante, sin bloquear (ABS); el de mano bloquea atrás */
    if (U.freno > 0 && au > .05) { const Fb = U.freno * H.frenoG * m * g, sg = Math.sign(D.u); Fxf -= sg * Math.min(Fb * .65, limF * .97); Fxr -= sg * Math.min(Fb * .35, limR * .97); }
    if (U.mano && au > .3) Fxr = -Math.sign(D.u) * limR * .7;
    /* resistencias: aire, rodadura (más en tierra y pasto) y la pendiente */
    const Fres = Math.sign(D.u) * (Fis.arrastre(C.rhoAire, D.u, H.cd, H.area) + (H.crr + (A.crrExtra || 0)) * m * g) + m * g * (A.pend || 0) / Math.sqrt(1 + (A.pend || 0) * (A.pend || 0));
    if (A.enAire) { D.u -= Math.sign(D.u) * Math.min(au, .2 * h); D.r *= Math.exp(-.5 * h); D.d = dl; return D; }
    /* llantas: ángulos de deriva y fuerza lateral que se satura; círculo de fricción con lo que ya usa el eje a lo largo */
    /* atrás las llantas son más rígidas y agarran un poco más (subviraje de fábrica, como los carros de calle: en una curva muy
       rápida se va de largo de trompa, no hace trompo); la cola se suelta con el freno de mano o con potencia de sobra */
    const ue = Math.max(.5, au), af = Math.atan2(D.w + H.a * D.r, ue) - dl * Math.sign(D.u || 1), ar = Math.atan2(D.w - H.b * D.r, ue), Bf = H.rig / (1.4 * Math.max(.1, mu)), Br = Bf * 1.35, muR = mu * 1.06;
    const lat = (al, Fz, Fx, B, m2) => { const cap = Math.sqrt(Math.max(0, 1 - Math.min(1, (Fx / Math.max(1, m2 * Fz)) ** 2))); return -m2 * Fz * Math.sin(1.4 * Math.atan(B * al)) * Math.max(.25, cap); };
    /* 5.2: casi quieto (menos de 0,5 m/s) la deriva se mide contra un piso de 0,5 m/s y, con el volante a tope, se inventaba un
       derrape de la trompa que frenaba tanto como empujaba el motor: arrancando con el dedo de lado el carro no se movía. Ahí el carro
       va por donde apuntan las ruedas (el cinemático de abajo), así que las fuerzas de lado entran de a poco desde 0 */
    const kLat = clamp(au / .5, 0, 1);
    let Fyf = lat(af, Fzf, Fxf, Bf, mu) * kLat, Fyr = lat(ar, Fzr, Fxr, Br, muR) * kLat; if (U.mano) Fyr *= .2;
    const ax = (Fxf * cd + Fxr - Fyf * sd - Fres) / m, ay = (Fxf * sd + Fyf * cd + Fyr) / m, dr = (H.a * (Fyf * cd + Fxf * sd) - H.b * Fyr) / H.Iz;
    const u0 = D.u; D.u += (ax + D.w * D.r) * h; D.w += (ay - D.u * D.r) * h; D.r += dr * h;
    /* control de estabilidad (ESP): si el carro gira más de lo que piden las ruedas y la cola se está yendo, frena por rueda (aquí:
       un momento que lleva el giro hacia el pedido y quita un poco de velocidad). Con el freno de mano no actúa: ahí se derrapa */
    if (!U.mano && Math.abs(D.u) > 2) { const rRef = D.u * Math.tan(dl) / L, ex = D.r - rRef; if (D.deriva > .06 && Math.abs(ex) > .1) { const k2 = Math.min(1, h * 5); D.r -= ex * k2; D.u -= Math.sign(D.u) * Math.min(Math.abs(D.u), Math.abs(ex) * 2.5 * h); D.w *= 1 - Math.min(.5, h * 3); } }
    if (U.freno > 0 && Math.sign(D.u) !== Math.sign(u0) && u0 !== 0) D.u = 0;   /* los frenos detienen, no echan para atrás */
    /* a poca velocidad el modelo dinámico no sirve (divide por casi cero): se mezcla con el cinemático (el carro va por donde apuntan las ruedas) */
    const k = clamp((Math.abs(D.u) - 1.5) / 3, 0, 1); if (k < 1) { const rk = D.u * Math.tan(dl) / L; D.r = lerp(rk, D.r, k); D.w = lerp(rk * H.b, D.w, k); }
    if (Math.abs(D.u) < .12 && thr === 0) { D.u = 0; D.w *= .5; D.r *= .5; }
    D.ax = lerp(D.ax, ax, Math.min(1, h * 12)); D.ay = lerp(D.ay, ay, Math.min(1, h * 12)); D.d = dl;
    D.deriva = Math.abs(D.u) > 1 ? Math.abs(Math.atan2(D.w, Math.abs(D.u))) : 0;
    return D;
  },
  /* la carrocería sobre sus resortes (para dibujar): cabeceo + nariz arriba, alabeo + el lado izquierdo arriba, rebote en metros */
  resortes(D, H, h, moto) {
    const w = TAU * H.suspHz, z = 2 * H.amort * w, kc = H.cgAlto / .55;
    /* exagerado a propósito, como en los juegos de mundo abierto (se tiene que ver en un celular): ~4° al frenar fuerte, ~6° en curva */
    const cab = clamp(D.ax * .0068 * kc, -.09, .07), alab = moto ? 0 : clamp(D.ay * .0085 * kc, -.12, .12);
    D.vcab += (w * w * (cab - D.cab) - z * D.vcab) * h; D.cab += D.vcab * h;
    D.valab += (w * w * (alab - D.alab) - z * D.valab) * h; D.alab += D.valab * h;
    D.vreb += (-w * w * D.reb - z * D.vreb) * h; D.reb = clamp(D.reb + D.vreb * h, -.25, .25);
  },
  /* el mando a partir de la entrada del jugador (joystick que apunta en el mundo, o volante y pedales) */
  mando(Q, D, H, E, mu, vlim = 30) {
    const U = { thr: 0, freno: 0, rev: 0, delta: 0, mano: !!E.derrape }, au = Math.abs(D.u), g = C.g, L = H.batalla, gir = MC.opciones.giro || 1;
    const dmax = H.dirMax * lerp(1, .32, clamp(au / 35, 0, 1));
    let dObj = 0;
    if (E.dir && E.dir.m > .08) {
      const ta = Math.atan2(E.dir.y, E.dir.x), da = angDif(Q.a, ta), am = Math.abs(da); D.ta = ta;
      const dtq = Q._dt || 1 / 60; D.revT = Math.max(0, (D.revT || 0) - dtq);
      /* trancado de trompa contra algo: si pide otro rumbo, o si lleva medio segundo empujando sin avanzar (encajado entre un carro y
         una pared), una reversa corta girando hacia donde apunta el dedo, y vuelve a intentar (lo que haría una persona). 5.1 */
      const trancado = !U.mano && Q.bloqueo && D.choqueDir > 0 && au < 1.2;
      D.atT = trancado && !D.revT ? (D.atT || 0) + dtq : 0;
      if (!D.revT && trancado && am > .9) { D.revT = 1; D.atT = 0; }
      /* encajado más de 0,6 s (la esquina de un edificio, un carro quieto y una pared): 1,2 s con el movimiento del arcade, que
         resbala por las paredes a buena velocidad (probado desde la 4.5); luego vuelve el manejo real. Nunca queda peor que el arcade */
      if (D.atT > .6) { D.atA = 1.2; D.atT = 0; }
      if (D.revT > 0 && Q.bloqueo && D.choqueDir < 0 && au < .5) D.revT = 0;   /* retrocediendo, chocó de cola: ya no más reversa */
      if (D.revT > 0) { U.rev = Math.max(.6, E.dir.m); const rObj = clamp(da * 2, -1.2, 1.2); dObj = Math.atan(L * rObj / Math.min(-1.2, D.u)); }
      else if (am > 2.4 && D.u < 2) {   /* el joystick apunta atrás y casi quieto: reversa (vuelta en tres puntos) */
        U.rev = E.dir.m; const db = angDif(Q.a + Math.PI, ta), rObj = clamp(-db * 3, -1.4, 1.4);   /* la trompa gira hacia donde apunta el dedo (como en arcade) */ dObj = Math.atan(L * rObj / Math.min(-1.2, D.u));
      } else {
        /* control de estabilidad: el giro que se pide (6 × lo que falta) sin pasar del que el agarre da a esta velocidad */
        const rGrip = mu * g / Math.max(2, au) * 1.05, rObj = clamp(da * 6 * gir, -1, 1) * (U.mano ? 2.4 : Math.min(2.4, rGrip));
        dObj = Math.atan(L * rObj / Math.max(1.5, D.u)) + (rObj - D.r) * .06;
        /* la velocidad que se pide, como en el arcade: a fondo de frente y menos cuanto más de lado apunta el dedo (para dar la curva);
           si va más rápido, frena con los frenos de verdad (el peso se va adelante); con el freno de mano no hay ayuda */
        const vObj = vlim * E.dir.m * (.3 + .7 * Math.max(0, Math.cos(da)));
        if (!U.mano && D.u > vObj + 1.5) U.freno = clamp((D.u - vObj) / 8, 0, .85);
        else if (D.u < vObj) U.thr = E.dir.m * clamp(1.15 - am * .55, .25, 1);
      }
    } else {
      D.ta = null; const ac = clamp(E.acel || 0, -1, 1), gi = clamp(E.giro || 0, -1, 1);
      /* volante y teclado: el ángulo pedido, sin pasar del que satura las llantas a esta velocidad (salvo con el freno de mano) */
      const dLim = Math.max(.035, Math.atan(L * mu * g * 1.05 / Math.max(1, D.u * D.u))); dObj = gi * dmax * gir; if (!U.mano) dObj = clamp(dObj, -dLim, dLim);
      if (ac > 0) U.thr = ac; else if (ac < 0) { if (D.u > .5) U.freno = -ac; else U.rev = -ac; }
    }
    if (E.frenoK && U.freno) U.freno *= E.frenoK;
    /* la dirección gira a una velocidad finita (como un volante de verdad) */
    const vel = 4.2 * gir * (Q._dt || 1 / 60); D.d = clamp(D.d + clamp(clamp(dObj, -dmax, dmax) - D.d, -vel, vel), -dmax, dmax); U.delta = D.d;
    return U;
  },
  /* el tono del motor para el sonido */
  sonido(Q) { const D = Q._din, H = D && Q.veh && Q.veh._hoja; return D && H ? { rpm: D.rpm, rpmMax: H.rpmMax, cilindros: H.cil, carga: D.carga || 0, marcha: D.marcha } : null; }
};
/* ---------- el cuerpo del jugador con la dinámica real ---------- */
Cuerpo.prototype._real = function (dt, E, suelo, loma) {
  const V = this.veh, M = this.mundo, H = Dinamica.hoja(V), moto = V.clase === 'moto';
  let D = this._din; if (!D || D.veh !== V) { D = this._din = Dinamica.estado(); D.veh = V; D.u = this.v; D.d = 0; }
  /* si el juego cambió la velocidad desde afuera (teletransporte, cinemático, rescate), el modelo la toma */
  if (Math.abs(this.v - D.u) > 1.5) { D.u = this.v; D.w = 0; D.r = 0; }
  /* 5.1 · zafarse: un rato con el movimiento del arcade (ver mando) */
  if (D.atA > 0) { D.atA -= dt; if (this.bloqueo) D.atA = Math.max(D.atA, .4); const r = this._arcade(dt, E, suelo, loma);   /* mientras siga rozando, sigue; el real vuelve 0,4 s después de despegarse */ D.u = this.v; D.w = 0; D.r = 0; D.d = 0; this.rpm = D.rpm; this.marcha = D.marcha; return r; }
  this._dt = dt;
  /* el piso: agarre (asfalto 1; pasto, tierra y arena menos), clima, y lo blando frena (rodadura extra) */
  /* (como en los juegos de mundo abierto, en pasto o tierra se agarra menos pero se puede manejar: μ del piso de 0,6 a 1) */
  const lluvia = (E.lluvia || (E.clima && E.clima.lluvia) || 0), sup = clamp(TT_SUPERFICIE[this.tt] ?? .6, .15, 1), mu = clamp((.5 + .5 * sup) * (lluvia > .35 ? .8 : 1) * (Ambiente.agarre(E.clima || this.clima) || 1), .12, 1.05);
  const turbo = !!E.turbo, vlim = this.vmax() * suelo * (turbo ? 1.25 : 1);
  if (E.asistencia === true) this._asistencia(E, E.giro || 0, E.acel || 0, dt);
  const U = Dinamica.mando(this, D, H, E, mu * H.mu * Dinamica.agarreJuego, vlim); if (this._asis && E.asistencia === true && Math.abs(U.delta) < .2) U.delta = clamp(U.delta + this._asis * .12, -H.dirMax, H.dirMax);
  if (this._vuelco && this._vuelco.t >= 0) { U.thr = 0; U.rev = 0; U.delta = 0; U.mano = false; U.freno = .35; }   /* 5.3: volcado no se maneja (las ruedas no tocan el piso); se arrastra hasta parar */
  D.carga = Math.max(U.thr, U.rev); D.U = U; D.A = null;
  this._vPedida = U.thr > 0 ? vlim * U.thr : U.rev > 0 ? -8 * U.rev : 0;
  /* las lomas pesan, pero el carro sube (como en los juegos de mundo abierto: la pendiente cuenta al 60 %) */
  const A = D.A = { mu, crrExtra: (1 - clamp(suelo, 0, 1)) * .1, pend: this.paso ? 0 : this.pend * .6, vlim, potencia: clamp(this.escala, .1, 1.2) * (turbo ? 1.4 : 1), enAire: this.enAire };
  /* integrar en pasos cortos (fuerzas de llantas rígidas) y mover una sola vez con choques */
  const n = Math.max(1, Math.ceil(dt / .006)), h = dt / n; let dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { Dinamica.paso(D, H, U, A, h); Dinamica.resortes(D, H, h, moto); this.a += D.r * h; const ca = Math.cos(this.a), sa = Math.sin(this.a); dx += (ca * D.u - sa * D.w) * h; dy += (sa * D.u + ca * D.w) * h; }
  if (D.cambioEv) { this.eventos.push('cambio'); D.cambioEv = 0; }
  /* salto (las motos) y caída, igual que en arcade */
  if (!this.enAire) this.coyote = .12; else this.coyote = Math.max(0, (this.coyote || 0) - dt);
  if (E.salto) this.bufSalto = .14; else this.bufSalto = Math.max(0, (this.bufSalto || 0) - dt);
  if (this.bufSalto > 0 && V.salto && (!this.enAire || (this.coyote > 0 && this.vz <= 0))) { this.vz = Math.sqrt(2 * GRAV * .6 * V.salto); this.enAire = true; this.coyote = 0; this.bufSalto = 0; this.eventos.push('salto'); MC.emit('salto', this); }
  if (this.enAire) { this.z += this.vz * dt; this.vz -= GRAV * dt; if (this.z <= 0) { const vz = this.vz; this.z = 0; this.enAire = false; this.eventos.push(vz < -6 ? 'aterrizaFuerte' : 'aterriza'); D.vreb += Math.max(-2.5, vz * .25); this.vz = 0; } }
  const x0m = this.x, y0m = this.y; this._moverReal(dx, dy, dt, D, H);
  this.v = D.u; this.giroV = D.r; this.rpm = D.rpm; this.marcha = D.marcha;
  this.rumboRodado = Math.abs(D.u) > .5 ? this.a + Math.atan2(D.w, Math.abs(D.u)) * Math.sign(D.u) : this.a;
  this.deslizamiento = D.deriva; if ((D.deriva > .2 && Math.abs(D.u) > 6) || (D.patina && Math.abs(D.u) > 2)) this.eventos.push('derrape');
  this.inclinacion = Math.atan(clamp(this.pend, -.65, .65)); this.cabeceo = D.cab; this.alabeo = D.alab; this.rebote = D.reb;
  this.choque = Math.max(0, (this.choque || 0) - dt);
  this._despues(E, x0m, y0m, dt); this._niveles(dt);
  if (this.eventos.includes('desatasco')) { D.u = this.v = 0; D.w = 0; D.r = 0; }
  if (this.eventos.includes('bordillo')) { D.vreb -= .55 * Math.min(1, Math.abs(D.u) / 12); D.vcab += (Math.random() - .5) * .4; }
  this.fase += Math.abs(this.v) * dt * 1.2;
  this.estado = Personaje.estadoPara(V, Math.abs(this.v), this.enAire); this.buceando = false; this.aire = Math.min(1, this.aire + dt / 4);
  const quiere = (E.dir && E.dir.m > .3) || (E.acel || 0) > .3; if (this.bloqueoAgua && quiere) this.empujaAgua += dt; else this.empujaAgua = Math.max(0, this.empujaAgua - dt * 2);
  this.bloqueoAgua = false; if (this.bajarseEnAgua && this.empujaAgua > .6) { this.empujaAgua = 0; this.bajarse('agua'); }
  return this;
};
/* moverse con choques de verdad: impulso con rebote según el ángulo, giro si el golpe es de lado y reparto con el otro carro */
Cuerpo.prototype._moverReal = function (dx, dy, dt, D, H) {
  const L = Math.hypot(dx, dy); if (L < 1e-7) return;
  if (this.puede(this.x + dx, this.y + dy)) { this.x += dx; this.y += dy; return; }
  const ob = this._obst;   /* lo que lo paró (antes de que otras consultas lo borren) */
  /* metido dentro de algo (salió así, o el otro se le vino encima): se deja salir */
  if (!this.puede(this.x, this.y, true)) { this.x += dx; this.y += dy; return; }
  const r = Math.max(.6, Math.min(1.5, H.ancho * .7)), px = this.x + dx, py = this.y + dy; let bx = 0, by = 0;
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, cx = Math.cos(a), cy = Math.sin(a); if (!this.puede(px + cx * r, py + cy * r, true)) { bx += cx; by += cy; } }
  const bl = Math.hypot(bx, by), nx = bl > .01 ? -bx / bl : -dx / L, ny = bl > .01 ? -by / bl : -dy / L;
  const ca = Math.cos(this.a), sa = Math.sin(this.a); let Vx = ca * D.u - sa * D.w, Vy = sa * D.u + ca * D.w;
  /* el otro: un carro del tráfico (ag) o un cuerpo con física (cu: rivales de las carreras, la policía), con su masa y su velocidad */
  const ag = ob && ob.ag, cu = ob && ob.cuerpo && ob.cuerpo !== this ? ob.cuerpo : null, m1 = H.masa, m2 = ag ? (ag.masa || DIN_MASA_TRAF[ag.tipo] || 1300) : cu ? ((cu.veh && cu.veh.masa) || 1300) : Infinity;
  const a2 = cu ? (cu.rumboRodado ?? cu.a) : ag ? (ag.a || 0) : 0, v2 = cu ? cu.v || 0 : ag ? ag.v || 0 : 0, V2x = Math.cos(a2) * v2, V2y = Math.sin(a2) * v2;
  const vn = (Vx - V2x) * nx + (Vy - V2y) * ny; D.choqueDir = D.u >= 0 ? 1 : -1;   /* de trompa (1) o de cola (−1): para saber si conviene la reversa */
  const U0 = D.U || {}, empuja0 = (U0.thr || 0) > .1;
  /* 5.1 · roce suave contra algo fijo (menos de 3 m/s de frente) acelerando: se DESLIZA a lo largo, conservando casi toda la
     rapidez, como en el arcade (antes cada roce dejaba el carro en cero y se quedaba empujando la esquina de un edificio) */
  if (vn < 0 && -vn < 3 && empuja0 && !ag && !cu && bl > .01) {
    const tx = -ny, ty = nx; let sg = Math.sign(Vx * tx + Vy * ty) || Math.sign(ca * tx + sa * ty) || 1; if (D.ta != null) { const dT = Math.cos(D.ta) * tx + Math.sin(D.ta) * ty; if (Math.abs(dT) > .2) sg = Math.sign(dT); }
    const rap = Math.max(Math.hypot(Vx, Vy) * .97, 2); Vx = tx * sg * rap; Vy = ty * sg * rap;
    this.a += angDif(this.a, Math.atan2(Vy, Vx)) * Math.min(1, dt * 6); const c2 = Math.cos(this.a), s2 = Math.sin(this.a);
    D.u = Vx * c2 + Vy * s2; D.w = -Vx * s2 + Vy * c2; D.r *= .5;
    const px2 = this.x + Vx * dt, py2 = this.y + Vy * dt; if (this.puede(px2, py2, true)) { this.x = px2; this.y = py2; return; }
  }
  if (vn < 0) {
    const e = ag || cu ? .3 : .16, j = -(1 + e) * vn / (1 / m1 + (isFinite(m2) ? 1 / m2 : 0));
    Vx += j / m1 * nx; Vy += j / m1 * ny;
    /* roce a lo largo de la pared */
    const tx = -ny, ty = nx, vt = Vx * tx + Vy * ty, fr = Math.min(Math.abs(vt), .35 * j / m1); Vx -= Math.sign(vt) * fr * tx; Vy -= Math.sign(vt) * fr * ty;
    /* el golpe en una punta hace girar: momento = brazo × impulso (la punta que va adelante) */
    const sg = D.u >= 0 ? 1 : -1, rcx = ca * H.largo * .45 * sg, rcy = sa * H.largo * .45 * sg; D.r = clamp(D.r + (rcx * j * ny - rcy * j * nx) / H.Iz * .7, -4, 4);
    if (cu) { const k = j / m2, hx = Math.cos(cu.a), hy = Math.sin(cu.a); cu.v -= k * (nx * hx + ny * hy); cu._empujon = { x: -nx * Math.min(1.5, k * .3), y: -ny * Math.min(1.5, k * .3) }; cu.choque = .4; }   /* 5.1: el golpe lo corre y le cambia la velocidad */
    if (ag) { const k = j / m2; ag.golpe = { vx: V2x - k * nx, vy: V2y - k * ny, r: clamp(-(rcx * ny - rcy * nx) * k * .25, -2.5, 2.5), t: 2.4 }; }
    D.u = Vx * ca + Vy * sa; D.w = -Vx * sa + Vy * ca;
    const imp = -vn; if (imp > 2.5 && !(this.choque > .15)) { this.eventos.push('choque'); this.choque = .4; this.impacto = imp; this.normalChoque = [nx, ny]; MC.emit('choque', this); }
    D.vcab -= Math.min(.8, imp * .05) * sg; D.valab += (Math.random() - .5) * Math.min(.6, imp * .04);
  }
  /* 5.1 · deslizarse por la pared (como en el arcade): si acelera contra ella, la trompa se alinea con la pared hacia el lado
     al que apunta el dedo (o hacia donde ya iba), así se dobla la esquina de un edificio en vez de quedarse empujándolo */
  const U = D.U || {}, empuja = (U.thr || 0) > .1;
  if (empuja && bl > .01) { const tx = -ny, ty = nx; let sg = Math.sign(ca * tx + sa * ty) || 1; if (D.ta != null) { const dT = Math.cos(D.ta) * tx + Math.sin(D.ta) * ty; if (Math.abs(dT) > .2) sg = Math.sign(dT); } this.a += angDif(this.a, Math.atan2(ty * sg, tx * sg)) * Math.min(1, dt * 5); }
  /* lo que queda del movimiento: a lo largo de la pared, si cabe; si no, un empujoncito hacia afuera */
  const sx = Vx * dt, sy = Vy * dt;
  if (Math.hypot(sx, sy) > 1e-5 && this.puede(this.x + sx, this.y + sy, true)) { this.x += sx; this.y += sy; return; }
  /* la ayuda de esquinas (la de EnCicla y del arcade): prueba ángulos cercanos, primero hacia el lado al que apunta el dedo, y
     resbala girando un poco hacia el hueco. Despacio, el rumbo sale de la trompa (no de una velocidad casi nula) y, acelerando,
     sigue a paso de 2,5 m/s: así rodea un poste, un pilar del viaducto o la esquina de un edificio como en el arcade (5.1) */
  const lento = Math.abs(D.u) < 2, atras = (U.rev || 0) > 0, st = Math.max(L, empuja || atras ? 2.5 * dt : .03), dir = lento || L < 1e-4 ? this.a + (atras ? Math.PI : 0) : Math.atan2(dy, dx);
  const pref = D.ta != null ? (Math.sign(angDif(dir, D.ta)) || 1) : (D.d >= 0 ? 1 : -1);
  for (const k of [.35, .7, 1.1]) for (const sg of [pref, -pref]) { const da = k * sg, ax = this.x + Math.cos(dir + da) * st, ay = this.y + Math.sin(dir + da) * st; if (this.puede(ax, ay, true)) { this.x = ax; this.y = ay; this.a += da * Math.min(1, dt * 7.5); if (empuja && lento) D.u = Math.max(D.u, 2.5); return; } }
  if (this.puede(this.x + nx * .05, this.y + ny * .05, true)) { this.x += nx * .05; this.y += ny * .05; }
};
Object.assign(MC, { Dinamica, DIN_CLASE });
