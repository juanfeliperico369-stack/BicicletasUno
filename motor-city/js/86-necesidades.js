/* =====================================================================
   NECESIDADES Y OBJETOS INTELIGENTES · la casa viva de Los Sims
   «Las personas son simples y los objetos son inteligentes» (Will Wright): cada objeto ANUNCIA qué necesidad
   satisface y cuánto. La persona suma los anuncios según qué tan urgente es cada necesidad, los atenúa por la
   distancia y elige el mejor (con un poco de azar entre los mejores para que no sea un robot).
   - 8 necesidades (0–100): hambre, energía, vejiga, higiene, diversión, social, comodidad y AMBIENTE.
   - El AMBIENTE de cada cuarto (como el «room» de Los Sims): decoración, luz (ventanas), tamaño y orden.
     Decorar la casa (MC.Hogar) sube el ánimo de quien vive ahí.
   - MC.Habitante vive solo dentro de un plano (MC.Interiores): camina, usa la nevera, duerme, ve televisión…
   ===================================================================== */
const MOTIVOS = ['hambre', 'energia', 'vejiga', 'higiene', 'diversion', 'social', 'comodidad', 'ambiente'];
const DECAE = { hambre: 6, energia: 4, vejiga: 8, higiene: 3, diversion: 5, social: 3, comodidad: 4, ambiente: 0 };   // puntos por hora de juego
const ANUNCIOS = {   // objeto: { necesidad: puntos que da, min: duración en minutos de juego, accion }
  nevera: { hambre: 35, min: 15, accion: 'come algo' }, estufa: { hambre: 55, min: 35, accion: 'cocina' }, comedor: { hambre: 25, social: 15, min: 25, accion: 'almuerza' },
  cama: { energia: 70, comodidad: 20, min: 240, accion: 'duerme' }, cama_sencilla: { energia: 65, comodidad: 15, min: 240, accion: 'duerme' }, hamaca: { energia: 25, comodidad: 30, min: 40, accion: 'se mece en la hamaca' },
  inodoro: { vejiga: 90, min: 5, accion: 'va al baño' }, ducha: { higiene: 80, min: 15, accion: 'se baña' }, lavamanos: { higiene: 20, min: 3, accion: 'se lava las manos' },
  sofa: { comodidad: 35, diversion: 10, min: 30, accion: 'descansa en el sofá' }, sofa_l: { comodidad: 40, diversion: 10, min: 30, accion: 'descansa en el sofá' }, sillon: { comodidad: 30, min: 25, accion: 'se sienta' },
  tv: { diversion: 40, min: 45, accion: 've televisión' }, consola: { diversion: 55, min: 50, accion: 'juega videojuegos' }, biblioteca: { diversion: 30, min: 40, accion: 'lee un libro' },
  escritorio: { diversion: 15, min: 60, accion: 'estudia' }, acuario: { diversion: 15, ambiente: 5, min: 10, accion: 'mira los peces' }, matera: { ambiente: 3, min: 5, accion: 'riega la matera' }, puff: { comodidad: 20, min: 20, accion: 'se recuesta' },
  lavadero: { higiene: 10, min: 20, accion: 'lava la ropa' }, banco_trabajo: { diversion: 30, min: 60, accion: 'arregla algo' }
};
const DECORA = { matera: 6, cuadro: 7, tapete: 6, lampara: 5, acuario: 10, cojines: 3, hamaca: 4, biblioteca: 4, puff: 2, tv: 2 };
const Necesidades = {
  MOTIVOS, DECAE, ANUNCIOS, DECORA,
  nuevas(v = 70) { return Object.fromEntries(MOTIVOS.map(m => [m, v])); },
  /* urgencia: una necesidad baja pesa mucho más que una media (curva cuadrática, como en Los Sims) */
  urgencia(v) { const t = clamp((100 - v) / 100, 0, 1); return t * t * 1.6 + t * .2; },
  /* puntaje de un objeto para estas necesidades, atenuado por la distancia (m) */
  puntaje(N, tipo, dist = 0) { const A = ANUNCIOS[tipo]; if (!A) return 0; let s = 0; for (const m of MOTIVOS) if (A[m]) s += A[m] * Necesidades.urgencia(N[m]); return s / (1 + dist / 6); },
  /* el ambiente de un cuarto (0–100): decoración por m², luz de las ventanas, tamaño y que no esté abarrotado */
  ambienteCuarto(P, c) {
    const area = Math.max(1, c.w * c.h), dentro = m => m.x + m.w / 2 >= c.x && m.x + m.w / 2 <= c.x + c.w && m.y + m.h / 2 >= c.y && m.y + m.h / 2 <= c.y + c.h, M = P.muebles.filter(dentro);
    let deco = 0; for (const m of M) deco += DECORA[m.tipo] || 0; const ocupado = M.reduce((a, m) => a + (m.tipo === 'tapete' || m.tipo === 'cuadro' ? 0 : m.w * m.h), 0) / area;
    const luz = P.ventanas.filter(v => (v.vertical ? Math.abs(v.x - c.x) < .05 || Math.abs(v.x - c.x - c.w) < .05 : Math.abs(v.y - c.y) < .05 || Math.abs(v.y - c.y - c.h) < .05) && (v.vertical ? v.y >= c.y && v.y <= c.y + c.h : v.x >= c.x && v.x <= c.x + c.w)).length;
    return Math.round(clamp(30 + Math.min(35, deco * 18 / Math.sqrt(area)) + Math.min(20, luz * 10) + Math.min(10, area / 2) - Math.max(0, ocupado - .45) * 60, 0, 100));
  },
  /* ambiente de la casa: promedio de los cuartos de estar (no cuenta baños ni ropas) */
  ambiente(P) { const C = P.cuartos.filter(c => !['bano', 'ropas', 'bodega', 'pasillo'].includes(c.tipo)); if (!C.length) return 50; const v = C.map(c => Necesidades.ambienteCuarto(P, c)); return Math.round(v.reduce((a, b) => a + b, 0) / v.length); }
};
/* alguien que vive solo dentro de un plano: elige, camina, usa y vuelve a elegir */
class Habitante {
  constructor(P, op = {}) { this.P = P; const ent = P.puertas.find(p => p.entrada) || { x: P.ancho / 2, y: .6 }; this.x = op.x ?? ent.x; this.y = op.y ?? Math.max(.7, ent.y + .7); this.a = 0; this.fase = 0; this.N = Necesidades.nuevas(op.inicial ?? 65); this.r = mulberry32(op.semilla || 3); this.accion = null; this.objetivo = null; this.t = 0; this.aspecto = op.aspecto || null; this.nombre = op.nombre || 'Alguien'; }
  /* dt en segundos reales; minPorSeg: minutos de juego por segundo */
  paso(dt, minPorSeg = 1) {
    const horas = dt * minPorSeg / 60; for (const m of MOTIVOS) this.N[m] = clamp(this.N[m] - DECAE[m] * horas, 0, 100); this.N.ambiente = Necesidades.ambiente(this.P);
    if (this.accion) { const A = ANUNCIOS[this.accion.tipo], k = dt * minPorSeg / A.min; for (const m of MOTIVOS) if (A[m]) this.N[m] = clamp(this.N[m] + A[m] * k, 0, 100); this.accion.resto -= dt * minPorSeg; if (this.accion.resto <= 0) this.accion = null; return this; }
    if (!this.objetivo) this.elegir();
    if (this.objetivo) { const o = this.objetivo, tx = o.x + o.w / 2, ty = o.y + o.h / 2, d = Math.hypot(tx - this.x, ty - this.y);
      if (d < Math.max(o.w, o.h) / 2 + .55) { this.accion = { tipo: o.tipo, resto: ANUNCIOS[o.tipo].min, texto: ANUNCIOS[o.tipo].accion }; this.objetivo = null; MC.emit('habitante', { h: this, accion: this.accion }); return this; }
      const v = 1.3 * dt, ux = (tx - this.x) / d, uy = (ty - this.y) / d; let nx = this.x + ux * v, ny = this.y + uy * v; const S = this.P.solido;
      if (!S(nx, ny)) { this.x = nx; this.y = ny; } else if (!S(nx, this.y)) this.x = nx; else if (!S(this.x, ny)) this.y = ny; else { this.atasco = (this.atasco || 0) + dt; if (this.atasco > 1.5) { this.atasco = 0; this.objetivo = null; this.evitar = o; } }
      this.a = Math.atan2(uy, ux); this.fase += v * 3; }
    return this;
  }
  /* los tres mejores anuncios y uno de ellos al azar (ponderado): vivo, pero no robótico */
  elegir() { const L = []; for (const m of this.P.muebles) { if (m === this.evitar || !ANUNCIOS[m.tipo]) continue; const s = Necesidades.puntaje(this.N, m.tipo, Math.hypot(m.x + m.w / 2 - this.x, m.y + m.h / 2 - this.y)); if (s > .5) L.push([s, m]); } L.sort((a, b) => b[0] - a[0]); const T = L.slice(0, 3).filter(q => q[0] >= L[0][0] * .6); /* solo los que valen casi tanto como el mejor */ if (!T.length) return null; const tot = T.reduce((a, q) => a + q[0], 0); let x = this.r() * tot; for (const [s, m] of T) { x -= s; if (x <= 0) { this.objetivo = m; this.evitar = null; return m; } } this.objetivo = T[0][1]; return T[0][1]; }
  /* la necesidad más baja (para mostrar un globito de pensamiento) */
  masUrgente() { let b = null; for (const m of MOTIVOS) if (m !== 'ambiente' && (!b || this.N[m] < this.N[b])) b = m; return b; }
}
Object.assign(MC, { Necesidades, Habitante });
