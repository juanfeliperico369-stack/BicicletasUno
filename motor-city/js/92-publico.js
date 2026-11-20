/* =====================================================================
   PÚBLICO SIMULADO (2.10) · jugadores con perfiles distintos que juegan solos
   La idea viene de MiroFish (un público falso que opina antes del lanzamiento); aquí sin su código (AGPL, servidor
   y llaves de IA): cada perfil maneja con la palanca como lo haría esa persona (puntería, reacción, fuerza, paciencia)
   y se mide lo que sentiría: cuánto tarda en llegar, cuánto se atasca, cuántas veces choca y si el juego va fluido.
   Uso:
     const p = MC.Publico.piloto('nina', { cuerpo, camara, objetivo: () => ({ x, y, radio, quieto }), ruta: (desde, hasta) => MC.Manejo.rutaA(mundo, desde, hasta, 'rueda') });
     (quien conoce el pueblo va por las calles con la ruta; el turista sigue la flecha en línea recta)
     const ent = p.leer(dt);            // la misma forma que MC.Controles.leer()
     MC.Publico.informe(p.medidas)      // { perfil, veredicto: 'bien'|'revisar'|'mal', frases: [...] }
   En consola: node motor.mjs publico   (los cuatro perfiles juegan Mandados en un celular simulado; informe en dist/publico.md)
   ===================================================================== */
const PERFILES_PUBLICO = {
  nina: { n: 'Sofía, 8 años', icono: '🧒', calles: true, error: 35, reaccion: .6, fuerza: .85, suelta: .25, turbo: false, paciencia: 25, nota: 'toca con todo el dedo, se distrae y suelta la palanca' },
  abuelo: { n: 'Don Gilberto, 70 años', icono: '👴', calles: true, error: 14, reaccion: 1.4, fuerza: .55, suelta: .08, turbo: false, paciencia: 40, nota: 'va despacio, lee todo, no le gustan los movimientos bruscos' },
  gamer: { n: 'Valentina, 17 años', icono: '🎮', calles: true, error: 5, reaccion: .22, fuerza: 1, suelta: 0, turbo: true, paciencia: 15, nota: 'va a fondo y con turbo, se aburre si no pasa nada' },
  turista: { n: 'Mark, turista', icono: '🧳', calles: false, error: 22, reaccion: .9, fuerza: .7, suelta: .05, turbo: false, paciencia: 30, nota: 'no conoce el pueblo y lee poco español: se guía por la flecha' }
};
const Publico = {
  PERFILES: PERFILES_PUBLICO,
  lista() { return Object.entries(PERFILES_PUBLICO).map(([id, p]) => ({ id, n: p.n, icono: p.icono, nota: p.nota })); },
  /* un piloto: decide cada «reaccion» segundos hacia dónde empujar, con su error de puntería; si se atasca, prueba otro rumbo */
  piloto(id, op = {}) {
    const P = PERFILES_PUBLICO[id] || PERFILES_PUBLICO.turista, rnd = mulberry32(op.semilla || (id.length * 7919 + 13));
    const M = { perfil: id, t: 0, metros: 0, atascado: 0, choques: 0, pasos: 0, llegadas: [], solto: 0, desvio: 0, cuadros: 0 };
    let rumbo = 0, prox = 0, suelta = 0, atasco = 0, x0 = null, y0 = null, desvio = 0, ruta = null, clave = '';
    const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) / 1.22; };
    const quitar = MC.on ? MC.on('choque', c => { if (!op.cuerpo || c === op.cuerpo) M.choques++; }) : null;
    return {
      perfil: P, medidas: M,
      paso() { M.pasos++; M.llegadas.push(+M.t.toFixed(1)); },
      soltar() { if (quitar) quitar(); },
      leer(dt) {
        const C = op.cuerpo, ob = op.objetivo ? op.objetivo() : null; M.t += dt; M.cuadros++;
        const E = { stick: { x: 0, y: 0, m: 0 }, teclado: false, acel: 0, giro: 0, salto: false, turbo: false, correr: false, sube: false, baja: false, accion: false, pulsos: new Set() };
        if (!C) return E;
        if (x0 != null) { const d = Math.hypot(C.x - x0, C.y - y0); M.metros += d; } x0 = C.x; y0 = C.y;
        if (!ob) return E;
        const dist = Math.hypot(ob.x - C.x, ob.y - C.y);
        if (dist < (ob.radio || 20) * (ob.quieto ? .6 : .8)) return E;   // llegó: suelta (y espera si el paso lo pide)
        const k = Math.round(ob.x) + ',' + Math.round(ob.y); if (P.calles && op.ruta && k !== clave) { clave = k; ruta = op.ruta({ x: C.x, y: C.y }, { x: ob.x, y: ob.y }); if (ruta) ruta._i = 0; }
        let tx = ob.x, ty = ob.y; if (ruta && ruta.length >= 4) { let i = ruta._i || 0; while (i + 3 < ruta.length && Math.hypot(ruta[i] - C.x, ruta[i + 1] - C.y) < 6) i += 2; ruta._i = i; tx = ruta[i]; ty = ruta[i + 1]; }
        prox -= dt; if (prox <= 0) { prox = P.reaccion * (.7 + rnd() * .6); rumbo = Math.atan2(ty - C.y, tx - C.x) + gauss() * P.error * Math.PI / 180 * .5 + desvio; desvio *= .5; }
        if (suelta > 0) { suelta -= dt; return E; } if (rnd() < P.suelta * dt) { suelta = .4 + rnd() * .8; M.solto++; return E; }
        const v = Math.abs(C.v || 0); if (v < .3) { atasco += dt; M.atascado += dt; if (atasco > 1.5) { desvio = (rnd() < .5 ? -1 : 1) * (.8 + rnd() * 1.2); prox = 0; atasco = 0; M.desvio++; clave = ''; } } else atasco = Math.max(0, atasco - dt);
        const yaw = op.camara ? op.camara.yaw || 0 : 0, c = Math.cos(yaw), s = Math.sin(yaw), wx = Math.cos(rumbo), wy = Math.sin(rumbo), f = P.fuerza;
        E.stick = { x: (wx * c - wy * s) * f, y: (wx * s + wy * c) * f, m: f }; E.turbo = E.correr = !!P.turbo && dist > 60;
        return E;
      }
    };
  },
  /* el informe de un perfil: lo que esa persona «diría» del juego, con umbrales simples y explicados */
  informe(M, extra = {}) {
    const P = PERFILES_PUBLICO[M.perfil] || PERFILES_PUBLICO.turista, fr = [], primera = M.llegadas[0];
    let malos = 0;
    if (primera == null) { fr.push('No logró llegar al primer punto en ' + Math.round(M.t) + ' s: el camino no se entiende o algo lo bloquea.'); malos += 2; }
    else if (primera > P.paciencia * 2) { fr.push('Tardó ' + primera + ' s en llegar al primer punto (su paciencia es de ~' + P.paciencia + ' s): el primer mandado está lejos o es confuso.'); malos++; }
    else fr.push('Llegó al primer punto en ' + primera + ' s.');
    const pa = M.t > 0 ? M.atascado / M.t : 0; if (pa > .25) { fr.push('Pasó el ' + Math.round(pa * 100) + ' % del tiempo quieto o atascado contra algo.'); malos++; }
    if (M.choques > Math.max(3, M.t / 10)) { fr.push('Chocó ' + M.choques + ' veces: las calles o los obstáculos no se leen bien a su ritmo.'); malos++; }
    if (extra.fps != null && extra.fps < 24) { fr.push('El juego le iba a ' + Math.round(extra.fps) + ' cuadros por segundo: se siente lento.'); malos++; }
    if (extra.errores) { fr.push('Hubo ' + extra.errores + ' errores en la consola.'); malos += 2; }
    if (!malos) fr.push('Lo disfrutó: llegó, casi no se atascó y el juego fue fluido.');
    return { perfil: M.perfil, n: P.n, icono: P.icono, veredicto: malos === 0 ? 'bien' : malos === 1 ? 'revisar' : 'mal', frases: fr, medidas: M };
  }
};
MC.Publico = Publico;
