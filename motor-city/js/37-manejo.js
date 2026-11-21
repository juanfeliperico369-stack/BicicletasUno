/* =====================================================================
   MANEJO · tipos de control, sensibilidad y asistencias (que todo se sienta fluido e intuitivo)
   - CURVAS DE RESPUESTA: zona muerta radial (sin «deriva» del dedo o del mando) y respuesta exponencial: lo pequeño
     es preciso y lo grande es rápido. Cada clase de vehículo tiene su perfil (a pie es directo; el carro es suave).
   - GIRO SEGÚN LA VELOCIDAD: a más velocidad, menos giro por el mismo gesto (como la dirección real y los juegos de
     carreras): nada de trompos por un dedo nervioso.
   - ESQUEMAS: joystick flotante o fijo, volante con pedales, tocar para ir (camino A* por las calles), inclinar el
     celular, un pulgar (acelera solo) y carriles (deslizar, como los corredores). El teclado y el mando sirven siempre.
   - ASISTENCIAS (se apagan en «experto»): acelerar solo, frenar antes de las curvas (v = √(μ·g/κ)), imán de calle
     (alinea suave con la vía cuando ya casi va derecho) y freno de llegada en «tocar para ir».
   Uso: const entrada = MC.Manejo.aplicar(controles.leer(), cuerpo, { camara, esquema: 'joystick', vista: 'mundo'|'volante' })
        cuerpo.actualizar(dt, entrada)
   ===================================================================== */
const PERFIL_MANEJO = {
  pie: { zm: .1, expo: 1.15, giroVel: 0 }, rueda: { zm: .12, expo: 1.35, giroVel: .35 }, moto: { zm: .12, expo: 1.55, giroVel: .55 },
  auto: { zm: .1, expo: 1.75, giroVel: .62 }, pesado: { zm: .1, expo: 1.9, giroVel: .7 }, aire: { zm: .12, expo: 1.5, giroVel: .3 }, agua: { zm: .12, expo: 1.6, giroVel: .4 }, riel: { zm: .1, expo: 1, giroVel: 0 }, cable: { zm: .1, expo: 1, giroVel: 0 }
};
const ESQUEMAS = {
  joystick: { n: 'Joystick', icono: '🕹️', ayuda: 'Pon el pulgar a la izquierda y arrastra hacia donde quieres ir.' },
  joystick_fijo: { n: 'Joystick fijo', icono: '🎯', ayuda: 'El joystick queda siempre en el mismo lugar, abajo a la izquierda.' },
  volante: { n: 'Volante y pedales', icono: '🛞', ayuda: 'Izquierda y derecha para girar; a la derecha, acelerar y frenar.' },
  tocar_ir: { n: 'Tocar para ir', icono: '👆', ayuda: 'Toca un punto del mapa y el personaje va solo por las calles.' },
  inclinacion: { n: 'Inclinar el celular', icono: '📱', ayuda: 'Inclina el celular para girar; acelera solo.' },
  un_pulgar: { n: 'Un pulgar', icono: '👍', ayuda: 'Acelera solo; desliza para girar y mantén oprimido para frenar.' },
  carriles: { n: 'Carriles', icono: '↔️', ayuda: 'Desliza a los lados para cambiar de carril y hacia arriba para saltar.' }
};
const Manejo = {
  PERFIL: PERFIL_MANEJO, ESQUEMAS,
  /* zona muerta radial con reescalado y respuesta exponencial: entra 0..1, sale 0..1 */
  curva(m, p = PERFIL_MANEJO.rueda) { if (m <= p.zm) return 0; const t = Math.min(1, (m - p.zm) / (1 - p.zm)); return Math.pow(t, p.expo); },
  /* giro efectivo a la velocidad v de un vehículo de velocidad máxima vmax */
  giroPorVelocidad(giro, v, vmax, p) { const r = clamp(Math.abs(v) / Math.max(1, vmax), 0, 1); return giro / (1 + p.giroVel * 2.2 * r * r); },
  /* velocidad segura en una curva de curvatura κ (1/m) con agarre μ: la misma que usan los pilotos de la IA */
  vSegura(kappa, mu = .8) { return Math.sqrt(mu * 9.81 / Math.max(1e-4, Math.abs(kappa))); },
  /* traduce la entrada cruda (MC.Controles.leer) a la entrada del cuerpo (MC.Cuerpo.actualizar) */
  aplicar(ent, C, op = {}) {
    const V = C.veh, P = Object.assign({}, PERFIL_MANEJO[V.clase] || PERFIL_MANEJO.rueda, op.perfil || {}), A = Object.assign({ autoAcelerar: false, frenoCurvas: true, imanCalle: true }, op.asist || {}), esq = op.esquema || 'joystick';
    const s = ent.stick || { x: 0, y: 0, m: 0 }, m0 = Math.min(1, Math.hypot(s.x, s.y)), m = Manejo.curva(m0, P), k = m0 > 0 ? m / m0 : 0, sx = s.x * k, sy = s.y * k;
    const out = { salto: ent.salto, turbo: ent.turbo, correr: ent.correr, sube: ent.sube, baja: ent.baja, acel: 0, giro: 0 };
    const vmax = C.vmax ? C.vmax() : V.vmax || 5, volante = op.vista === 'volante' || esq === 'volante' || esq === 'inclinacion' || esq === 'un_pulgar' || esq === 'carriles';
    if (!volante) {
      /* el stick apunta en el mundo, relativo a la cámara (lo natural en cenital, 3D oblicua, maqueta y lateral) */
      const yaw = op.camara ? op.camara.yaw : 0, c = Math.cos(yaw), sn = Math.sin(yaw);
      if (m > 0) out.dir = { x: sx * c + sy * sn, y: -sx * sn + sy * c, m };
      out.acel = ent.acel || 0; out.giro = ent.giro || 0;
    } else {
      let giro = esq === 'inclinacion' ? Manejo.inclinacion() : (sx || ent.giro || 0);
      out.giro = Manejo.giroPorVelocidad(clamp(giro, -1, 1), C.v, vmax, P);
      out.acel = -sy || ent.acel || 0; if (esq === 'un_pulgar' || esq === 'inclinacion' || A.autoAcelerar) out.acel = ent.freno || (ent.acel < 0) ? -1 : Math.max(out.acel, .85);
    }
    /* frenar antes de la curva: mira la vía de adelante (si el juego la da) y no deja pasar de la velocidad segura */
    if (A.frenoCurvas && op.curvaAdelante != null && V.clase !== 'pie') { const vs = Manejo.vSegura(op.curvaAdelante, op.mu || .8); if (C.v > vs && out.acel > 0) out.acel = C.v > vs * 1.08 ? -.6 : 0; }
    /* imán de calle: si ya casi va derecho por la vía, la alinea suave (no lucha contra el jugador) */
    if (A.imanCalle && op.rumboVia != null && V.clase !== 'pie' && Math.abs(out.giro) < .25 && !out.dir) { const d = angDif(C.a, op.rumboVia), d2 = Math.abs(d) > Math.PI / 2 ? angDif(C.a, op.rumboVia + Math.PI) : d; if (Math.abs(d2) < .35) out.giro += clamp(d2 * 1.5, -.25, .25); }
    return out;
  },
  /* inclinar el celular: γ (izquierda/derecha) con zona muerta; pide permiso en iPhone (llámalo desde un toque) */
  _incl: 0,
  activarInclinacion() {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) return Promise.resolve(false);
    const on = () => { window.addEventListener('deviceorientation', e => { const g = (screen.orientation && Math.abs(screen.orientation.angle) === 90) ? e.beta : e.gamma; Manejo._incl = clamp((g || 0) / 30, -1, 1); }); return true; };
    if (typeof DeviceOrientationEvent.requestPermission === 'function') return DeviceOrientationEvent.requestPermission().then(r => r === 'granted' && on()).catch(() => false);
    return Promise.resolve(on());
  },
  inclinacion() { const v = Manejo._incl; return Math.abs(v) < .08 ? 0 : (v - Math.sign(v) * .08) / .92; },
  /* tocar para ir: el camino por la red (A*) hasta el punto tocado; cada cuadro, la dirección al siguiente punto */
  rutaA(mundo, desde, hasta, red = 'peaton') {
    try { const R = mundo.red(red), a = R.cercana(desde.x, desde.y, 120), b = R.cercana(hasta.x, hasta.y, 120); if (!a || !b) return [hasta.x, hasta.y];
      /* 4.0.2: los puntos de una calle entre dos distancias s0 → s1 (en ese orden), para seguir su forma y no cortar en línea recta por encima de casas */
      const tramo = (e, s0, s1, P) => { const p = e.t.p, cum = e.t.cum, n = p.length >> 1; if (!cum) return; if (s1 >= s0) { for (let k = 0; k < n; k++) if (cum[k] > s0 && cum[k] < s1) P.push(p[2 * k], p[2 * k + 1]); } else { for (let k = n - 1; k >= 0; k--) if (cum[k] < s0 && cum[k] > s1) P.push(p[2 * k], p[2 * k + 1]); } };
      const ea = a.arista, eb = b.arista; if (ea === eb) { const P = [desde.x, desde.y, a.x, a.y]; tramo(ea, a.s, b.s, P); P.push(b.x, b.y, hasta.x, hasta.y); return P; }   // la misma calle: por la calle
      const r = R.caminoEntre([[ea.a, a.s], [ea.b, ea.largo - a.s]], [[eb.a, b.s], [eb.b, eb.largo - b.s]]);
      if (!r) return [hasta.x, hasta.y]; const C = r.C, P = [desde.x, desde.y, a.x, a.y]; tramo(ea, a.s, r.ini === ea.a ? 0 : ea.largo, P); P.push(R.nodos[r.ini].x, R.nodos[r.ini].y);
      for (const { arista: e, adelante } of C) { const p = e.t.p, n = p.length; if (adelante) for (let i = 0; i < n; i += 2) P.push(p[i], p[i + 1]); else for (let i = n - 2; i >= 0; i -= 2) P.push(p[i], p[i + 1]); }
      tramo(eb, r.fin === eb.a ? 0 : eb.largo, b.s, P); P.push(b.x, b.y, hasta.x, hasta.y); return P; } catch (e) { return [hasta.x, hasta.y]; }
  },
  seguirRuta(C, ruta, op = {}) {
    if (!ruta || ruta.length < 2) return null; let i = ruta._i || 0; while (i + 3 < ruta.length && Math.hypot(ruta[i] - C.x, ruta[i + 1] - C.y) < (op.radio || 3)) i += 2; ruta._i = i;
    const tx = ruta[i], ty = ruta[i + 1], d = Math.hypot(tx - C.x, ty - C.y), ultimo = i + 2 >= ruta.length; if (ultimo && d < 1.2) return { llego: true, acel: 0 };
    return { dir: { x: (tx - C.x) / (d || 1), y: (ty - C.y) / (d || 1), m: ultimo ? clamp(d / 6, .3, 1) : 1 } };   // frena al llegar
  },
  /* 4.0.2 · piloto de la IA sobre una ruta: mira más adelante (persecución pura), frena en las curvas y, si se atasca
     contra un árbol, un poste o una pared, retrocede girando y pide una ruta nueva. Lo usan las patrullas, la banda,
     El Contador y los rivales de carrera. Devuelve { atascado } cuando hay que volver a planear. */
  pilotar(C, ruta, dt, op = {}) {
    const S = C._piloto || (C._piloto = { atasco: 0, reversa: 0, giroRev: .7, t: 0 }); S.t += dt; C.ia = true;
    if (S.reversa > 0) { S.reversa -= dt; C.actualizar(dt, { acel: -.5, giro: S.giroRev }); return { reversa: true }; }
    /* ruta nueva: empieza en el punto más cercano que no quede atrás (rutaA arranca en un nodo que puede estar detrás) */
    if (ruta._i == null) { const ca = Math.cos(C.a), sa = Math.sin(C.a); let mejor = 0, md = 1e9; for (let j = 0; j < Math.min(ruta.length, 80); j += 2) { const dx = ruta[j] - C.x, dy = ruta[j + 1] - C.y, dd = Math.hypot(dx, dy), atras = dx * ca + dy * sa < -2 && dd < 40; const sc = dd + (atras ? 60 : 0); if (sc < md) { md = sc; mejor = j; } } ruta._i = mejor; }
    const m = Manejo.seguirRuta(C, ruta, { radio: op.radio || 6 }); if (!m || !m.dir) { C.actualizar(dt, { acel: -.4, giro: 0 }); return m; }
    let i = ruta._i || 0, falta = (op.mira || 4) + Math.abs(C.v) * .35, px = C.x, py = C.y, tx = ruta[i], ty = ruta[i + 1];
    while (i + 1 < ruta.length) { const qx = ruta[i], qy = ruta[i + 1], L = Math.hypot(qx - px, qy - py); if (L >= falta) { tx = px + (qx - px) * falta / L; ty = py + (qy - py) * falta / L; break; } falta -= L; px = qx; py = qy; tx = qx; ty = qy; i += 2; }
    /* la curva que viene: cuánto gira la ruta entre el punto que mira y uno más lejos; a más curva, menos velocidad */
    let cx = tx, cy = ty; { let f2 = 12 + Math.abs(C.v) * .6, jx = tx, jy = ty, j = i; while (j + 1 < ruta.length) { const qx = ruta[j], qy = ruta[j + 1], L = Math.hypot(qx - jx, qy - jy); if (L >= f2) { cx = jx + (qx - jx) * f2 / L; cy = jy + (qy - jy) * f2 / L; break; } f2 -= L; jx = qx; jy = qy; cx = qx; cy = qy; j += 2; } }
    const dx = tx - C.x, dy = ty - C.y, d = Math.hypot(dx, dy) || 1, giro = Math.abs(angDif(Math.atan2(dy, dx), C.a)), curva = Math.abs(angDif(Math.atan2(dy, dx), Math.atan2(cy - ty, cx - tx))), vSegura = 6 + 26 * Math.max(0, 1 - curva / 1.4);
    /* el destino quedó atrás: vuelta en tres puntos con cualquier física (frena; ya despacio, retrocede girando al revés), sin salirse de la calle */
    /* (arcade, solo para la IA: el jugador maneja con su física) casi quieta y con el destino a la espalda, gira en su sitio */
    const dS = angDif(C.a, Math.atan2(dy, dx)); if (S.vuelta || Math.abs(dS) > 1.75) { S.vuelta = Math.abs(dS) > .5; if (S.vuelta) { if (Math.abs(C.v) > 3) C.actualizar(dt, { acel: -1, giro: 0 }); else { C.a += Math.sign(dS) * Math.min(Math.abs(dS), 2.4 * dt); C.v *= .8; C.actualizar(dt, { acel: 0, giro: 0 }); } return { vuelta: true }; } }
    const k = (giro > 1.2 ? .4 : giro > .6 ? .68 : 1) * (Math.abs(C.v) > vSegura ? .15 : 1);
    C.actualizar(dt, { dir: { x: dx / d, y: dy / d, m: k * (op.m || 1) * (m.dir.m || 1) }, turbo: !!op.turbo && giro < .3, lluvia: op.lluvia || 0 });
    if (Math.abs(C.v) < 1.2 && C.bloqueo) S.atasco += dt; else S.atasco = Math.max(0, S.atasco - dt * 2);
    S.lento = Math.abs(C.v) < 1 ? (S.lento || 0) + dt : 0;
    /* atascado contra algo, quieto demasiado tiempo o con el objetivo a la espalda: maniobra en tres puntos (reversa girando hacia el otro lado) */
    if (S.atasco > .8 || S.lento > 2.2) { const lado = Math.sign(angDif(C.a, Math.atan2(dy, dx))) || 1; S.atasco = 0; S.lento = 0; S.reversa = .6; S.giroRev = -lado * .9;
      /* trabada otra vez en poco tiempo (contra una ladera, un árbol o un poste): se reacomoda hacia el centro de la calle más cercana */
      S.trabas = (S.trabas || []).filter(t => C.mundo && (S.t || 0) - t < 6); S.trabas.push(S.t || 0);
      if (S.trabas.length >= 2 && C.mundo) { const M = C.mundo, libre = (x0, y0, x1, y1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.5); for (let j = 1; j <= n; j++) if (M.edificioEn(x0 + (x1 - x0) * j / n, y0 + (y1 - y0) * j / n, 0)) return false; return true; };
        /* solo hacia un punto de calle al que se llega sin cruzar una casa: la calle más cercana o el punto de la ruta */
        const q = M.viaCercana(C.x, C.y, 40), cand = [q, { x: ruta[ruta._i || 0], y: ruta[(ruta._i || 0) + 1] }].filter(p => p && Number.isFinite(p.x) && Math.hypot(p.x - C.x, p.y - C.y) < 40);
        const o = cand.find(p => libre(C.x, C.y, p.x, p.y)) || (M.edificioEn(C.x, C.y, 0) ? cand[1] || cand[0] : null);
        if (o) { const f = M.edificioEn(C.x, C.y, 0) ? 1 : .6; C.x += (o.x - C.x) * f; C.y += (o.y - C.y) * f; C.a = Math.atan2(dy, dx); S.reversa = 0; S.trabas = []; } }
      return { atascado: true }; }
    return m;
  },
  /* carriles: −1, 0 o 1 con deslizar; devuelve el desplazamiento lateral suave en metros */
  carril(estado, gesto, ancho = 1.6) { if (gesto === 'izq') estado.c = Math.max(-1, (estado.c || 0) - 1); if (gesto === 'der') estado.c = Math.min(1, (estado.c || 0) + 1); estado.x = lerp(estado.x || 0, (estado.c || 0) * ancho, .25); return estado.x; }
};
MC.Manejo = Manejo;
