/* =====================================================================
   CIENCIA · matemáticas, física y química fieles a la realidad (unidades del SI)
   Todo es puro y determinista (mismas entradas → mismas salidas) y está probado en pruebas/prueba.mjs.
   - Constantes y unidades · vectores y geometría · ruido (Perlin, fbm, crestas) · muestreo de Poisson
   - Integradores (Euler semiimplícito, RK4) · estadística y distribuciones
   - Física: atmósfera estándar (ISA), arrastre, sustentación, rodadura, pendiente, flotación, choques, proyectiles,
     fricción por superficie y clima · Termodinámica: calor, enfriamiento de Newton, punto de rocío, índice de
     calor y sensación térmica · Química: elementos, masa molar de fórmulas, balanceo exacto de ecuaciones,
     gases ideales, pH, combustibles y baterías, materiales.
   ===================================================================== */
const C = {
  g: 9.80665, G: 6.6743e-11, R: 8.314462618, NA: 6.02214076e23, kB: 1.380649e-23, sigma: 5.670374419e-8, c: 299792458,
  Raire: 287.05, cpAire: 1005, rhoAire: 1.225, rhoAgua: 1000, cpAgua: 4186, Lv: 2.257e6, Lf: 3.34e5, P0: 101325, T0: 288.15, atm: 101325
};
const U = {
  kmh: v => v / 3.6, aKmh: v => v * 3.6, mph: v => v * .44704, nudos: v => v * .514444,
  C_K: t => t + 273.15, K_C: t => t - 273.15, F_C: f => (f - 32) * 5 / 9, C_F: c => c * 9 / 5 + 32,
  kWh: e => e * 3.6e6, aKWh: j => j / 3.6e6, cv: p => p * 735.49875, hp: p => p * 745.699872, aCv: w => w / 735.49875,
  psi: p => p * 6894.757, bar: p => p * 1e5, L: v => v / 1000, cal: c => c * 4.184, kcal: c => c * 4184, aKcal: j => j / 4184, grad: r => r * 180 / Math.PI, rad: d => d * Math.PI / 180
};
/* ---------- vectores (arreglos) y geometría ---------- */
const V2 = { suma: (a, b) => [a[0] + b[0], a[1] + b[1]], resta: (a, b) => [a[0] - b[0], a[1] - b[1]], esc: (a, k) => [a[0] * k, a[1] * k], punto: (a, b) => a[0] * b[0] + a[1] * b[1], cruz: (a, b) => a[0] * b[1] - a[1] * b[0], largo: a => Math.hypot(a[0], a[1]), unit: a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }, rot: (a, t) => [a[0] * Math.cos(t) - a[1] * Math.sin(t), a[0] * Math.sin(t) + a[1] * Math.cos(t)] };
const V3 = { suma: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], resta: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], esc: (a, k) => [a[0] * k, a[1] * k, a[2] * k], punto: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cruz: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], largo: a => Math.hypot(a[0], a[1], a[2]), unit: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; } };
const Geo = {
  area(P) { let a = 0; const n = P.length >> 1; for (let i = 0; i < n; i++) { const j = (i + 1) % n; a += P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; } return a / 2; },
  centroide(P) { let cx = 0, cy = 0, a = 0; const n = P.length >> 1; for (let i = 0; i < n; i++) { const j = (i + 1) % n, f = P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; a += f; cx += (P[2 * i] + P[2 * j]) * f; cy += (P[2 * i + 1] + P[2 * j + 1]) * f; } a /= 2; return a ? [cx / (6 * a), cy / (6 * a)] : [P[0], P[1]]; },
  /* cruce de los segmentos ab y cd: [t, u] o null */
  cruce(a, b, c, d) { const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-12) return null; const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den; return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [t, u] : null; },
  /* envolvente convexa (cadena monótona de Andrew) de puntos [[x,y],…] */
  envolvente(Pts) { const p = Pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p; const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); } for (const q of p.slice().reverse()) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); } hi.pop(); lo.pop(); return lo.concat(hi); },
  bezier: (p0, p1, p2, p3, t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; },
  catmull: (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3); return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]; }
};
const Suaviza = { entra: t => t * t, sale: t => t * (2 - t), entraSale: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t, cubica: t => t * t * (3 - 2 * t), quintica: t => t * t * t * (t * (t * 6 - 15) + 10), rebote: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; }, elastico: t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1 };
/* ---------- ruido coherente (Perlin con gradientes, sembrado) ---------- */
class Ruido {
  constructor(semilla = 1) { const r = mulberry32(semilla), p = new Uint8Array(256); for (let i = 0; i < 256; i++) p[i] = i; for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)), t = p[i]; p[i] = p[j]; p[j] = t; } this.p = new Uint8Array(512); for (let i = 0; i < 512; i++) this.p[i] = p[i & 255]; }
  /* Perlin 2D en [-1, 1] (aprox.) */
  n2(x, y) {
    const P = this.p, X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y);
    const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10), gr = (h, a, b) => { switch (h & 7) { case 0: return a + b; case 1: return -a + b; case 2: return a - b; case 3: return -a - b; case 4: return a; case 5: return -a; case 6: return b; default: return -b; } };
    const aa = P[P[X] + Y], ab = P[P[X] + Y + 1], ba = P[P[X + 1] + Y], bb = P[P[X + 1] + Y + 1];
    return lerp(lerp(gr(aa, x, y), gr(ba, x - 1, y), u), lerp(gr(ab, x, y - 1), gr(bb, x - 1, y - 1), u), v) * .7071;
  }
  /* movimiento browniano fraccional: octavas que suman detalle */
  fbm(x, y, oct = 5, lac = 2, gan = .5) { let a = 1, f = 1, s = 0, n = 0; for (let i = 0; i < oct; i++) { s += a * this.n2(x * f, y * f); n += a; a *= gan; f *= lac; } return s / n; }
  /* crestas (cordilleras afiladas) en [0, 1] */
  crestas(x, y, oct = 5) { let a = .5, f = 1, s = 0, w = 1; for (let i = 0; i < oct; i++) { let v = 1 - Math.abs(this.n2(x * f, y * f)); v *= v * w; w = clamp(v * 2, 0, 1); s += v * a; a *= .5; f *= 2; } return s; }
  /* deformación del dominio (formas orgánicas) */
  torcido(x, y, k = 1.5) { return this.fbm(x + k * this.fbm(x + 5.2, y + 1.3, 3), y + k * this.fbm(x + 1.7, y + 9.2, 3)); }
}
/* muestreo de Poisson en disco (Bridson): puntos repartidos sin amontonarse, para árboles, casas, NPC… */
function poissonDisco(ancho, alto, r, semilla = 1, k = 24, acepta) {
  const rand = mulberry32(semilla), cel = r / Math.SQRT2, gw = Math.ceil(ancho / cel), gh = Math.ceil(alto / cel), grid = new Int32Array(gw * gh).fill(-1), pts = [], act = [];
  const pon = (x, y) => { pts.push([x, y]); act.push(pts.length - 1); grid[Math.floor(y / cel) * gw + Math.floor(x / cel)] = pts.length - 1; };
  pon(rand() * ancho, rand() * alto);
  while (act.length) { const i = Math.floor(rand() * act.length), [px, py] = pts[act[i]]; let ok = false;
    for (let t = 0; t < k; t++) { const a = rand() * TAU, d = r * (1 + rand()), x = px + Math.cos(a) * d, y = py + Math.sin(a) * d; if (x < 0 || y < 0 || x >= ancho || y >= alto) continue; const gx = Math.floor(x / cel), gy = Math.floor(y / cel); let lejos = true;
      for (let j = Math.max(0, gy - 2); j <= Math.min(gh - 1, gy + 2) && lejos; j++) for (let q = Math.max(0, gx - 2); q <= Math.min(gw - 1, gx + 2); q++) { const o = grid[j * gw + q]; if (o >= 0 && (pts[o][0] - x) ** 2 + (pts[o][1] - y) ** 2 < r * r) { lejos = false; break; } }
      if (lejos && (!acepta || acepta(x, y))) { pon(x, y); ok = true; break; } }
    if (!ok) act.splice(i, 1); }
  return pts;
}
/* ---------- integradores ---------- */
const Integra = {
  /* y' = f(t, y) con y un arreglo de números (RK4 clásico) */
  rk4(f, t, y, h) { const k1 = f(t, y), y2 = y.map((v, i) => v + h / 2 * k1[i]), k2 = f(t + h / 2, y2), y3 = y.map((v, i) => v + h / 2 * k2[i]), k3 = f(t + h / 2, y3), y4 = y.map((v, i) => v + h * k3[i]), k4 = f(t + h, y4); return y.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); },
  /* Euler semiimplícito (estable para juegos): primero la velocidad, luego la posición */
  euler(x, v, a, h) { const v2 = v + a * h; return [x + v2 * h, v2]; }
};
/* ---------- estadística y azar con distribuciones ---------- */
const Est = {
  media: L => L.reduce((a, b) => a + b, 0) / (L.length || 1),
  desv: L => { const m = Est.media(L); return Math.sqrt(L.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, L.length - 1)); },
  percentil: (L, p) => { const s = L.slice().sort((a, b) => a - b), i = (s.length - 1) * p, lo = Math.floor(i); return s[lo] + (s[Math.min(s.length - 1, lo + 1)] - s[lo]) * (i - lo); },
  normal: (r, m = 0, s = 1) => { const u = Math.max(1e-12, r()), v = r(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); },
  exponencial: (r, lam) => -Math.log(1 - r()) / lam,
  poisson: (r, lam) => { const L = Math.exp(-lam); let k = 0, p = 1; do { k++; p *= r(); } while (p > L); return k - 1; },
  ponderado: (r, items) => { let t = 0; for (const [, w] of items) t += w; let x = r() * t; for (const [v, w] of items) { x -= w; if (x <= 0) return v; } return items[items.length - 1][0]; }
};
/* ---------- física ---------- */
const MU = { asfalto: [.9, .8], asfalto_mojado: [.6, .5], concreto: [.85, .75], adoquin: [.7, .6], grava: [.6, .5], tierra: [.55, .45], barro: [.35, .25], pasto: [.45, .35], arena: [.5, .4], nieve: [.3, .2], hielo: [.12, .08], madera: [.6, .5], caucho_metal: [.8, .6] };   // [estático, dinámico] de caucho sobre…
const Fis = {
  /* atmósfera estándar internacional (troposfera, h < 11 km): { T (K), p (Pa), rho (kg/m³) } */
  atmosfera(h) { const T = C.T0 - .0065 * h, p = C.P0 * Math.pow(1 - 2.25577e-5 * h, 5.25588); return { T, p, rho: p / (C.Raire * T) }; },
  arrastre: (rho, v, Cd, A) => .5 * rho * v * v * Cd * A,                       // N
  sustentacion: (rho, v, Cl, S) => .5 * rho * v * v * Cl * S,                   // N
  rodadura: (Crr, m, pend = 0) => Crr * m * C.g * Math.cos(Math.atan(pend)),  // N
  pendiente: (m, pend) => m * C.g * Math.sin(Math.atan(pend)),                 // N (pend: tanto por uno, subida > 0)
  flotacion: (rhoFluido, V) => rhoFluido * V * C.g,                           // N
  /* velocidad máxima donde la potencia iguala arrastre + rodadura (+ pendiente) [m/s] — bisección */
  vmaxPotencia(P, m, Cd, A, Crr, rho = C.rhoAire, pend = 0) { let lo = 0, hi = 150; for (let i = 0; i < 60; i++) { const v = (lo + hi) / 2, F = Fis.arrastre(rho, v, Cd, A) + Fis.rodadura(Crr, m, pend) + Fis.pendiente(m, pend); if (F * v > P) hi = v; else lo = v; } return (lo + hi) / 2; },
  frenada: (v, mu) => v * v / (2 * mu * C.g),                                  // m hasta detenerse
  /* tiro parabólico sin aire: alcance y tiempo desde altura h0 */
  proyectil(v0, ang, h0 = 0) { const vx = v0 * Math.cos(ang), vy = v0 * Math.sin(ang), t = (vy + Math.sqrt(vy * vy + 2 * C.g * h0)) / C.g; return { t, alcance: vx * t, alturaMax: h0 + vy * vy / (2 * C.g) }; },
  /* choque 1D con coeficiente de restitución e (1 elástico, 0 plástico): velocidades después */
  choque(m1, v1, m2, v2, e = 1) { const P = m1 * v1 + m2 * v2, M = m1 + m2; return [(P + m2 * e * (v2 - v1)) / M, (P + m1 * e * (v1 - v2)) / M]; },
  energiaCinetica: (m, v) => .5 * m * v * v,
  mu: (sup, mojado) => { const b = MU[sup] || MU.asfalto; return mojado && MU[sup + '_mojado'] ? MU[sup + '_mojado'][1] : b[1] * (mojado ? .72 : 1); },
  /* péndulo simple (balanceo de cabinas, columpios): periodo */
  periodoPendulo: L => TAU * Math.sqrt(L / C.g)
};
/* ---------- termodinámica y humedad ---------- */
const Termo = {
  calor: (m, c, dT) => m * c * dT,
  newton: (T, Tamb, k, t) => Tamb + (T - Tamb) * Math.exp(-k * t),
  /* punto de rocío (fórmula de Magnus, °C) */
  rocio(Tc, HR) { const a = 17.625, b = 243.04, g = Math.log(HR / 100) + a * Tc / (b + Tc); return b * g / (a - g); },
  humedad(Tc, Td) { const a = 17.625, b = 243.04; return 100 * Math.exp(a * Td / (b + Td) - a * Tc / (b + Tc)); },
  /* índice de calor (regresión de Rothfusz, NOAA) en °C */
  indiceCalor(Tc, HR) { const T = U.C_F(Tc); if (T < 80) return Tc; const R = HR; let F = -42.379 + 2.04901523 * T + 10.14333127 * R - .22475541 * T * R - 6.83783e-3 * T * T - 5.481717e-2 * R * R + 1.22874e-3 * T * T * R + 8.5282e-4 * T * R * R - 1.99e-6 * T * T * R * R; return U.F_C(F); },
  /* sensación térmica por viento (Environment Canada; T ≤ 10 °C, viento > 4,8 km/h) */
  sensacionViento(Tc, vKmh) { if (Tc > 10 || vKmh <= 4.8) return Tc; const v = Math.pow(vKmh, .16); return 13.12 + .6215 * Tc - 11.37 * v + .3965 * Tc * v; },
  /* temperatura con la altura (gradiente de 6,5 °C por km) */
  conAltura: (T0, h0, h) => T0 - .0065 * (h - h0)
};
/* ---------- química ---------- */
const ELEMENTOS = 'H:1.008:hidrógeno He:4.0026:helio Li:6.94:litio Be:9.0122:berilio B:10.81:boro C:12.011:carbono N:14.007:nitrógeno O:15.999:oxígeno F:18.998:flúor Ne:20.180:neón Na:22.990:sodio Mg:24.305:magnesio Al:26.982:aluminio Si:28.085:silicio P:30.974:fósforo S:32.06:azufre Cl:35.45:cloro Ar:39.948:argón K:39.098:potasio Ca:40.078:calcio Ti:47.867:titanio V:50.942:vanadio Cr:51.996:cromo Mn:54.938:manganeso Fe:55.845:hierro Co:58.933:cobalto Ni:58.693:níquel Cu:63.546:cobre Zn:65.38:zinc Br:79.904:bromo Ag:107.87:plata Sn:118.71:estaño I:126.90:yodo Pt:195.08:platino Au:196.97:oro Hg:200.59:mercurio Pb:207.2:plomo U:238.03:uranio'.split(' ').reduce((o, s, i) => { const [sim, m, n] = s.split(':'); o[sim] = { z: i + 1, masa: +m, nombre: n }; return o; }, {});
const Quim = {
  ELEMENTOS,
  /* «Ca(OH)2» → { Ca: 1, O: 2, H: 2 } (acepta paréntesis anidados e hidratos con ·) */
  atomos(f) {
    const partes = f.split(/[·.*]/); if (partes.length > 1) { const T = {}; for (const p of partes) { const m = p.match(/^(\d+)(.*)$/), k = m ? +m[1] : 1, A = Quim.atomos(m ? m[2] : p); for (const e in A) T[e] = (T[e] || 0) + A[e] * k; } return T; }
    let i = 0; const pila = [{}];
    while (i < f.length) { const ch = f[i];
      if (ch === '(' || ch === '[') { pila.push({}); i++; }
      else if (ch === ')' || ch === ']') { i++; let n = ''; while (/\d/.test(f[i] || '')) n += f[i++]; const g = pila.pop(), top = pila[pila.length - 1]; for (const e in g) top[e] = (top[e] || 0) + g[e] * (+n || 1); }
      else { const m = f.slice(i).match(/^([A-Z][a-z]?)(\d*)/); if (!m) throw new Error('fórmula inválida: ' + f); if (!ELEMENTOS[m[1]]) throw new Error('elemento desconocido: ' + m[1]); const top = pila[pila.length - 1]; top[m[1]] = (top[m[1]] || 0) + (+m[2] || 1); i += m[0].length; } }
    if (pila.length !== 1) throw new Error('paréntesis sin cerrar: ' + f); return pila[0];
  },
  masaMolar(f) { const A = Quim.atomos(f); let m = 0; for (const e in A) m += ELEMENTOS[e].masa * A[e]; return m; },   // g/mol
  /* balancea una ecuación «C8H18 + O2 -> CO2 + H2O» con coeficientes enteros mínimos (eliminación de Gauss exacta) */
  balancear(ec) {
    const [izq, der] = ec.split(/->|=>|→|=/).map(s => s.split('+').map(t => t.trim()).filter(Boolean)), esp = [...izq, ...der], el = [...new Set(esp.flatMap(e => Object.keys(Quim.atomos(e))))];
    const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }, fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
    const sub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => fr(a[0] * b[0], a[1] * b[1]), div = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
    const M = el.map(e => esp.map((s, j) => fr((Quim.atomos(s)[e] || 0) * (j < izq.length ? 1 : -1))));
    const n = esp.length, piv = []; let r = 0;
    for (let c = 0; c < n && r < M.length; c++) { let p = r; while (p < M.length && M[p][c][0] === 0) p++; if (p === M.length) continue; [M[r], M[p]] = [M[p], M[r]]; const pv = M[r][c]; M[r] = M[r].map(v => div(v, pv)); for (let i = 0; i < M.length; i++) if (i !== r && M[i][c][0] !== 0) { const f = M[i][c]; M[i] = M[i].map((v, j) => sub(v, mul(f, M[r][j]))); } piv.push(c); r++; }
    const libre = [...Array(n).keys()].find(c => !piv.includes(c)); if (libre === undefined) throw new Error('la ecuación no tiene solución única');
    const x = Array(n).fill(null).map(() => fr(0)); x[libre] = fr(1); piv.forEach((c, i) => { x[c] = fr(-M[i][libre][0], M[i][libre][1]); });
    const lcm = x.reduce((a, v) => a * v[1] / gcd(a, v[1]), 1), ent = x.map(v => v[0] * lcm / v[1]), g = ent.reduce((a, v) => gcd(a, v)), co = ent.map(v => Math.abs(v / g));
    return { coef: co, texto: izq.map((s, i) => (co[i] > 1 ? co[i] + ' ' : '') + s).join(' + ') + ' → ' + der.map((s, i) => (co[izq.length + i] > 1 ? co[izq.length + i] + ' ' : '') + s).join(' + ') };
  },
  /* gases ideales PV = nRT: pasa tres y devuelve el que falta */
  gas({ P, V, n, T }) { if (P == null) return n * C.R * T / V; if (V == null) return n * C.R * T / P; if (n == null) return P * V / (C.R * T); return P * V / (n * C.R); },
  pH: H => -Math.log10(H),
  /* energía de combustibles y baterías (valores típicos; poder calorífico inferior) */
  COMBUSTIBLES: { gasolina: { MJkg: 43.4, MJL: 32.2, CO2kgL: 2.31 }, diesel: { MJkg: 42.6, MJL: 35.8, CO2kgL: 2.68 }, etanol: { MJkg: 26.8, MJL: 21.2, CO2kgL: 1.51 }, gnv: { MJkg: 47.1, MJL: null, CO2kgL: null }, hidrogeno: { MJkg: 120, MJL: null, CO2kgL: 0 }, bateria_litio: { MJkg: .9, MJL: 2.2, CO2kgL: 0 }, cuerpo_humano: { MJkg: 37.7, MJL: null, CO2kgL: null } },
  MATERIALES: { acero: { rho: 7850, fluencia: 250e6, E: 200e9 }, aluminio: { rho: 2700, fluencia: 276e6, E: 69e9 }, fibra_carbono: { rho: 1600, fluencia: 600e6, E: 70e9 }, titanio: { rho: 4500, fluencia: 880e6, E: 114e9 }, madera: { rho: 600, fluencia: 40e6, E: 11e9 }, concreto: { rho: 2400, fluencia: 3e6, E: 30e9 }, ladrillo: { rho: 1900, fluencia: 7e6, E: 15e9 }, vidrio: { rho: 2500, fluencia: 50e6, E: 70e9 }, caucho: { rho: 1100, fluencia: 15e6, E: .05e9 }, plastico_abs: { rho: 1050, fluencia: 40e6, E: 2.3e9 } }
};
Object.assign(MC, { C, U, V2, V3, Geo, Suaviza, Ruido, poissonDisco, Integra, Est, Fis, MU, Termo, Quim });
MC.Ciencia = { C, U, V2, V3, Geo, Suaviza, Ruido, poissonDisco, Integra, Est, Fis, MU, Termo, Quim };
