/* =====================================================================
   TRÁFICO Y SEMÁFOROS · carros, taxis amarillos, motos, busetas, ciclistas y peatones alrededor del jugador
   sobre la red real de calles, con semáforos reales (los de la capa de tráfico) que cambian con el reloj del mundo.
   Determinista en los semáforos (la fase sale del segundo del día); los agentes nacen y mueren cerca de la cámara.
   ===================================================================== */
const TRAF_TIPOS = {
  carro: { v: 11, largo: 4.4, ancho: 1.8, colores: ['#e9eef3', '#c9ced6', '#9aa3ad', '#1d1f24', '#c43a26', '#2a5a92', '#3d6b3a', '#d98a3a', '#e9eef3', '#7f8891'] },
  taxi: { v: 12, largo: 4.2, ancho: 1.7, colores: ['#f2c400'] },
  moto: { v: 13, largo: 2.0, ancho: .8, colores: ['#1d1f24', '#c43a26', '#2a5a92', '#e9eef3', '#f07a1a'] },
  buseta: { v: 9, largo: 9.5, ancho: 2.4, colores: ['#e9eef3', '#2e9d55', '#e7b531', '#d8432f', '#3a7bd5'] },
  camion: { v: 8, largo: 8, ancho: 2.4, colores: ['#e9eef3', '#d98a3a', '#3a7bd5'] },
  bici: { v: 5, largo: 1.8, ancho: .6, colores: ['#9bd341', '#29b6f6', '#ff7043', '#ec407a', '#1d1f24'] }
};
const TRAF_MEZCLA = [['carro', 46], ['taxi', 18], ['moto', 24], ['buseta', 6], ['camion', 3], ['bici', 5]];
class Trafico {
  constructor(mundo, op = {}) {
    this.mundo = mundo; this.nombreRed = op.red || 'rueda'; this.n = op.n || 40; this.np = op.peatones || 30; this.radio = op.radio || 380; this.agentes = []; this.peatones = []; this.az = new Azar(op.semilla || 7); this._luces = null; this.ciclo = 60;
  }
  get red() { return this.mundo.red(this.nombreRed); }
  /* semáforos: cada punto de la capa se pega al cruce más cercano; su fase sale del nodo (siempre igual) */
  luces() {
    if (this._luces) return this._luces; const R = this.red, L = this._luces = new Map();
    for (const [x, y] of this.mundo.trafico.semaforos) {
      let best = -1, bd = 30; const c = R.cercana(x, y, 30); if (!c) continue;
      for (const n of [c.arista.a, c.arista.b]) { const N = R.nodos[n], d = Math.hypot(N.x - x, N.y - y); if (d < bd && N.ar.length >= 3) { bd = d; best = n; } }
      if (best < 0 || L.has(best)) continue; const N = R.nodos[best], e0 = R.aristas[N.ar[0]];
      L.set(best, { nodo: best, x: N.x, y: N.y, eje: R.salida(e0, best), fase: h2(best, 3, 11) * this.ciclo });
    }
    return L;
  }
  /* luz que ve quien llega al nodo con rumbo ang: 'verde' | 'amarillo' | 'rojo' | null (sin semáforo) */
  luz(nodo, ang, seg) {
    const S = this.luces().get(nodo); if (!S) return null;
    const p = ((seg + S.fase) % this.ciclo + this.ciclo) % this.ciclo, ejeA = Math.abs(Math.cos(angDif(S.eje, ang))) > .7071, m = this.ciclo / 2;
    const q = ejeA ? p : (p + m) % this.ciclo; return q < m - 4 ? 'verde' : q < m ? 'amarillo' : 'rojo';
  }
  _tipo() { let t = this.az.f() * 102, i = 0; while (i < TRAF_MEZCLA.length - 1 && (t -= TRAF_MEZCLA[i][1]) > 0) i++; return TRAF_MEZCLA[i][0]; }
  _nacer(cx, cy, lejos) {
    const R = this.red, a = this.az.f() * TAU, d = lejos ? this.radio * (.75 + this.az.f() * .25) : this.radio * Math.sqrt(this.az.f()), c = R.cercana(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 120);
    if (!c) return null; const e = c.arista; if (e.k === VIA.CICLO || e.k === VIA.PEATONAL) return null;
    const tipo = e.k === VIA.AUTOPISTA && this.az.f() < .3 ? 'camion' : this._tipo(), T = TRAF_TIPOS[tipo];
    return { tipo, e, s: c.s, dir: this.az.f() < .5 ? 1 : -1, v: T.v * (.6 + this.az.f() * .3), vmax: T.v * (e.k === VIA.AUTOPISTA ? 1.6 : e.k === VIA.AVENIDA ? 1.25 : 1) * (.85 + this.az.f() * .3), color: this.az.uno(T.colores), largo: T.largo, ancho: T.ancho, x: c.x, y: c.y, a: 0, frena: 0, id: this.az.e(1, 1e9) };
  }
  /* un paso de la simulación alrededor de (cx, cy) a la hora seg */
  paso(dt, cx, cy, seg, calidad = 1) {
    const R = this.red, nObj = Math.round(this.n * calidad), A = this.agentes;
    for (let i = A.length - 1; i >= 0; i--) if (Math.hypot(A[i].x - cx, A[i].y - cy) > this.radio * 1.35) A.splice(i, 1);
    let intentos = 0; while (A.length < nObj && intentos++ < 30) { const g = this._nacer(cx, cy, A.length > nObj * .5); if (g) A.push(g); }
    /* el de adelante en la misma arista y el mismo sentido */
    const grupos = new Map(); for (const g of A) { const k = g.e.i * 2 + (g.dir > 0 ? 1 : 0); (grupos.get(k) || grupos.set(k, []).get(k)).push(g); }
    for (const L of grupos.values()) { L.sort((p, q) => (p.s - q.s) * p.dir); for (let i = 0; i < L.length; i++) L[i].delante = L[i + 1] || null; }
    for (const g of A) {
      const e = g.e, finS = g.dir > 0 ? e.largo : 0, falta = Math.abs(finS - g.s), nodo = g.dir > 0 ? e.b : e.a;
      let objetivo = g.vmax;
      if (g.delante) { const hueco = Math.abs(g.delante.s - g.s) - (g.largo + g.delante.largo) / 2; objetivo = Math.min(objetivo, Math.max(0, (hueco - 2.5) * 1.2)); }
      if (falta < 26) { const luz = this.luz(nodo, e.t.rumbo(g.dir > 0 ? e.largo - 1 : 1) + (g.dir > 0 ? 0 : Math.PI), seg); if (luz === 'rojo' || (luz === 'amarillo' && falta > 8)) objetivo = Math.min(objetivo, Math.max(0, (falta - 4) * .8)); }
      g.v += clamp(objetivo - g.v, -7 * dt, 3 * dt); g.v = Math.max(0, g.v); g.frena = objetivo < g.v - .5 ? 1 : 0;
      g.s += g.v * dt * g.dir;
      if ((g.dir > 0 && g.s >= e.largo) || (g.dir < 0 && g.s <= 0)) {
        const ang = e.t.rumbo(g.dir > 0 ? e.largo - .5 : .5) + (g.dir > 0 ? 0 : Math.PI), ops = R.opciones(nodo, ang, e.i).filter(o => o.arista.k !== VIA.CICLO && o.arista.k !== VIA.PEATONAL && Math.abs(o.giro) < 2.3);
        if (!ops.length) { g.dir = -g.dir; g.s = clamp(g.s, 0, e.largo); continue; }
        const rect = ops.filter(o => Math.abs(o.giro) < .5), o = rect.length && this.az.f() < .6 ? rect[0] : this.az.uno(ops), sobra = Math.abs(g.s - finS);
        g.e = o.arista; g.dir = o.adelante ? 1 : -1; g.s = o.adelante ? sobra : o.arista.largo - sobra;
      }
      const q = g.e.t.at(g.s, (g.e.ancho / 4 + .3) * g.dir); g.x = q.x; g.y = q.y; g.a = q.a + (g.dir > 0 ? 0 : Math.PI);
    }
    this._peatones(dt, cx, cy, calidad);
    return A;
  }
  _peatones(dt, cx, cy, calidad) {
    const P = this.peatones, n = Math.round(this.np * calidad), R = this.red;
    for (let i = P.length - 1; i >= 0; i--) if (Math.hypot(P[i].x - cx, P[i].y - cy) > this.radio) P.splice(i, 1);
    let k = 0; while (P.length < n && k++ < 20) { const a = this.az.f() * TAU, d = this.radio * Math.sqrt(this.az.f()), c = R.cercana(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 80); if (!c || c.arista.k === VIA.AUTOPISTA) continue; P.push({ e: c.arista, s: c.s, dir: this.az.f() < .5 ? 1 : -1, lado: this.az.f() < .5 ? 1 : -1, v: 1.1 + this.az.f() * .5, semilla: this.az.e(1, 1e6), x: c.x, y: c.y, a: 0, fase: this.az.f() * 10 }); }
    for (const p of P) {
      p.s += p.v * dt * p.dir; p.fase += dt * p.v * 1.8;
      if (p.s > p.e.largo || p.s < 0) { const nodo = p.s > p.e.largo ? p.e.b : p.e.a, ops = R.opciones(nodo, 0, p.e.i).filter(o => o.arista.k !== VIA.AUTOPISTA); if (!ops.length) { p.dir = -p.dir; p.s = clamp(p.s, 0, p.e.largo); } else { const o = this.az.uno(ops); p.e = o.arista; p.dir = o.adelante ? 1 : -1; p.s = o.adelante ? 0 : o.arista.largo; } }
      const q = p.e.t.at(p.s, (p.e.ancho / 2 + 1.4) * p.lado); p.x = q.x; p.y = q.y; p.a = q.a + (p.dir > 0 ? 0 : Math.PI);
    }
  }
  cercanos(x, y, r) { return this.agentes.filter(g => Math.abs(g.x - x) < r && Math.abs(g.y - y) < r); }
}
Object.assign(MC, { Trafico, TRAF_TIPOS });
