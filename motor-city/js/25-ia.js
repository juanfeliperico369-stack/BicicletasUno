/* =====================================================================
   INTELIGENCIA ARTIFICIAL · que el mundo esté vivo
   - Utilidad (Utility AI): cada agente puntúa sus opciones con curvas y hace la que más le sirve ahora.
   - Árboles de comportamiento mínimos (secuencia, selector, condición, acción) para misiones, rivales y jefes.
   - Comportamientos de dirección (Reynolds): buscar, huir, llegar, deambular, separarse (gente, animales, bandadas).
   - Población con RUTINAS REALES: cada persona tiene casa y trabajo (en edificios reales del mundo), necesidades
     (energía, hambre, ganas de salir, plata) y un día: duerme, madruga, viaja por las calles (A*), trabaja, almuerza,
     sale a la plaza o al parque, vuelve a casa. Lo que está lejos se simula «en grueso» (barato).
   - Pilotos con física: la velocidad segura en una curva es v = √(μ·g / κ) (κ = curvatura): así frenan los rivales.
   ===================================================================== */
const IA = {
  /* curvas de respuesta (entrada 0–1 → utilidad 0–1) */
  curva: { lineal: x => clamp(x, 0, 1), cuadrada: x => clamp(x, 0, 1) ** 2, raiz: x => Math.sqrt(clamp(x, 0, 1)), inversa: x => 1 - clamp(x, 0, 1), campana: (x, c = .5, a = .25) => Math.exp(-((x - c) ** 2) / (2 * a * a)), escalon: (x, u = .5) => x >= u ? 1 : 0 },
  /* opciones: [{ id, puntaje(ctx) }] → la mejor (con un poco de azar para que no sean robots) */
  elegir(opciones, ctx, azar = Math.random, ruido = .05) { let best = null, bv = -1; for (const o of opciones) { const v = o.puntaje(ctx) + (azar() - .5) * ruido; if (v > bv) { bv = v; best = o; } } return best; },
  /* árbol de comportamiento: nodos que devuelven 'ok' | 'falla' | 'sigue' */
  secuencia: (...h) => ctx => { for (const n of h) { const r = n(ctx); if (r !== 'ok') return r; } return 'ok'; },
  selector: (...h) => ctx => { for (const n of h) { const r = n(ctx); if (r !== 'falla') return r; } return 'falla'; },
  condicion: f => ctx => f(ctx) ? 'ok' : 'falla',
  accion: f => ctx => f(ctx) || 'ok',
  /* dirección (Reynolds): devuelven una fuerza deseada [fx, fy] */
  buscar: (p, obj, vmax) => { const d = V2.resta(obj, p), L = V2.largo(d) || 1; return V2.esc(d, vmax / L); },
  huir: (p, obj, vmax) => V2.esc(IA.buscar(p, obj, vmax), -1),
  llegar: (p, obj, vmax, frena = 8) => { const d = V2.resta(obj, p), L = V2.largo(d) || 1; return V2.esc(d, Math.min(vmax, vmax * L / frena) / L); },
  deambular: (ang, r, k = .6) => { const a = ang + (r() - .5) * k; return [Math.cos(a), Math.sin(a), a]; },
  separar: (p, vecinos, radio) => { let fx = 0, fy = 0; for (const q of vecinos) { const dx = p[0] - q[0], dy = p[1] - q[1], d = Math.hypot(dx, dy); if (d > 0 && d < radio) { fx += dx / d * (radio - d) / radio; fy += dy / d * (radio - d) / radio; } } return [fx, fy]; },
  /* velocidad segura en una curva de curvatura κ (1/m) con agarre μ */
  vCurva: (kappa, mu = .9) => Math.abs(kappa) < 1e-4 ? 1e3 : Math.sqrt(mu * C.g / Math.abs(kappa))
};
/* ---------- población con rutinas ---------- */
const ACTIVIDADES = ['dormir', 'casa', 'trabajo', 'almuerzo', 'paseo', 'compras'];
class Poblacion {
  /* op: { n, centro: {x, y}, radio, semilla, red ('peaton'|'rueda') } */
  constructor(mundo, op = {}) {
    this.mundo = mundo; this.r = mulberry32(op.semilla ?? 11); this.red = mundo.red(op.red || 'rueda'); this.gente = []; const c = op.centro || { x: mundo.ancho / 2, y: mundo.alto / 2 }, R = op.radio || 700;
    const ed = mundo.edificiosEn(c.x - R, c.y - R, c.x + R, c.y + R), casas = ed.filter(e => e.k === 0 || e.k === 1 || e.k === 2 || e.k === 15), trabajos = ed.filter(e => [3, 4, 5, 7, 8, 13].includes(e.k)), plazas = mundo.lugares.filter(l => Math.hypot(l.x - c.x, l.y - c.y) < R * 1.5);
    const punto = e => { const q = this.red.cercana(e.x, e.y, 120); return q ? { x: q.x, y: q.y, nodo: q.arista.a } : null; };
    for (let i = 0; i < (op.n || 40) && casas.length; i++) {
      const casa = punto(casas[(this.r() * casas.length) | 0]), trab = trabajos.length ? punto(trabajos[(this.r() * trabajos.length) | 0]) : casa, ocio = plazas.length ? punto(plazas[(this.r() * plazas.length) | 0]) : casa; if (!casa) continue;
      const madruga = 300 + this.r() * 120, sale = madruga + 540 + this.r() * 90;
      this.gente.push({ id: i, casa, trabajo: trab || casa, ocio: ocio || casa, x: casa.x, y: casa.y, a: 0, v: 1.2 + this.r() * .4, horario: { despierta: madruga, entra: madruga + 90, sale, duerme: 1320 + this.r() * 80 }, nec: { energia: 1, hambre: .2, salir: .3 }, act: 'dormir', ruta: null, s: 0, visible: false, semilla: (this.r() * 1e6) | 0, fase: this.r() * 9, aspecto: null });
    }
  }
  /* qué quiere hacer cada uno ahora (utilidad sobre necesidades y horario) */
  _decidir(p, min) {
    const H = p.horario, enHora = (a, b) => min >= a && min < b, finde = this.finDeSemana;
    const ops = [
      { id: 'dormir', puntaje: () => (min >= H.duerme || min < H.despierta) ? 1 : IA.curva.inversa(p.nec.energia) * .9 },
      { id: 'trabajo', puntaje: () => !finde && enHora(H.entra, H.sale) && !enHora(720, 780) ? .95 : 0 },
      { id: 'almuerzo', puntaje: () => enHora(720, 790) ? .7 + p.nec.hambre * .3 : p.nec.hambre * .5 },
      { id: 'paseo', puntaje: () => (enHora(H.sale, H.duerme) || (finde && enHora(600, H.duerme))) ? .45 + p.nec.salir * .4 : 0 },
      { id: 'casa', puntaje: () => .3 }
    ];
    return IA.elegir(ops, p, this.r, .04).id;
  }
  _destino(p, act) { return act === 'trabajo' ? p.trabajo : act === 'paseo' || act === 'almuerzo' ? p.ocio : p.casa; }
  /* un paso: dt en s reales; reloj del mundo; (cx, cy) donde está la cámara: lo cercano se mueve paso a paso */
  paso(dt, reloj, cx, cy, radioVisible = 450) {
    const min = reloj.min, dtJuego = dt * (reloj.vel || 1) * 60; this.finDeSemana = reloj.dia === 0 || reloj.dia === 6 || reloj.domingo;
    for (const p of this.gente) {
      p.nec.energia = clamp(p.nec.energia + (p.act === 'dormir' ? .00004 : -.000012) * dtJuego, 0, 1); p.nec.hambre = clamp(p.nec.hambre + (p.act === 'almuerzo' ? -.0004 : .00001) * dtJuego, 0, 1); p.nec.salir = clamp(p.nec.salir + (p.act === 'paseo' ? -.0002 : .00001) * dtJuego, 0, 1);
      const quiere = this._decidir(p, min);
      if (quiere !== p.act) { p.act = quiere; const d = this._destino(p, quiere); if (d && (Math.hypot(d.x - p.x, d.y - p.y) > 15)) { const a = this.red.cercana(p.x, p.y, 120); p.ruta = a ? this.red.camino(a.arista.a, d.nodo) : null; p.tramo = 0; p.s = 0; p.dest = d; } }
      const cerca = Math.hypot(p.x - cx, p.y - cy) < radioVisible;
      if (p.ruta && p.ruta.length) {
        let avanza = p.v * dt * (cerca ? 1 : (reloj.vel || 1) * 8);   // lejos: se mueve en grueso (más rápido, sin detalle)
        while (avanza > 0 && p.tramo < p.ruta.length) { const t = p.ruta[p.tramo], L = t.arista.largo, falta = L - p.s; if (avanza < falta) { p.s += avanza; avanza = 0; } else { avanza -= falta; p.tramo++; p.s = 0; } }
        if (p.tramo >= p.ruta.length) { p.ruta = null; p.x = p.dest.x; p.y = p.dest.y; }
        else { const t = p.ruta[p.tramo], s = t.adelante ? p.s : t.arista.largo - p.s, q = t.arista.t.at(s, 1.6); p.x = q.x; p.y = q.y; p.a = q.a + (t.adelante ? 0 : Math.PI); p.fase += dt * p.v * 1.8; }
      }
      p.visible = cerca && (p.ruta != null || p.act === 'paseo');   // dentro de casa o del trabajo no se ven
    }
    return this.gente.filter(p => p.visible);
  }
  resumen() { const c = {}; for (const p of this.gente) c[p.act] = (c[p.act] || 0) + 1; return c; }
}
Object.assign(MC, { IA, Poblacion, ACTIVIDADES });
