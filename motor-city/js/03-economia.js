/* =====================================================================
   ECONOMÍA · números lógicos y verificables para cualquier juego
   - Dinero en enteros (centavos): nunca hay errores de coma flotante en las cuentas.
   - Libro contable de partida doble: toda transacción cuadra (debe = haber) y el sistema no crea dinero de la nada.
   - Mercados con oferta y demanda (equilibrio lineal exacto y ajuste walrasiano en el tiempo), elasticidad y choques.
   - Finanzas: interés compuesto, inflación, cuota de un préstamo (sistema francés), valor presente neto y TIR,
     depreciación. Empleos y salarios por hora de juego.
   Los valores de referencia (salario mínimo, precios) son configurables: actualízalos cada año en la ciudad.
   ===================================================================== */
const Dinero = {
  moneda: 'COP', decimales: 0,
  /* de unidades a centavos (enteros) y al revés */
  aCent: v => Math.round(v * 100), deCent: c => c / 100,
  formato(cent, moneda = Dinero.moneda) { try { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: moneda, maximumFractionDigits: moneda === 'COP' ? 0 : 2 }).format(cent / 100); } catch (e) { return '$' + Math.round(cent / 100).toLocaleString('es-CO'); } },
  /* reparte un monto en partes enteras proporcionales que suman exacto (método del mayor residuo) */
  repartir(cent, pesos) { const T = pesos.reduce((a, b) => a + b, 0), base = pesos.map(p => Math.floor(cent * p / T)); let resto = cent - base.reduce((a, b) => a + b, 0); const ord = pesos.map((p, i) => [cent * p / T - base[i], i]).sort((a, b) => b[0] - a[0]); for (let k = 0; resto > 0; k++, resto--) base[ord[k % ord.length][1]]++; return base; }
};
/* libro de partida doble: cuentas con saldo en centavos; cada asiento mueve de una a otra y la suma total siempre es 0 */
class Libro {
  constructor() { this.cuentas = new Map(); this.asientos = []; this.cuenta('mundo'); }
  cuenta(id, tipo = 'activo') { if (!this.cuentas.has(id)) this.cuentas.set(id, { id, tipo, saldo: 0 }); return this.cuentas.get(id); }
  saldo(id) { return (this.cuentas.get(id) || { saldo: 0 }).saldo; }
  /* mueve `cent` de `de` a `a`; con `estricto`, no deja saldos negativos (salvo el mundo, que emite) */
  mover(de, a, cent, concepto = '', estricto = true) {
    cent = Math.round(cent); if (cent <= 0) return false; const D = this.cuenta(de), A = this.cuenta(a);
    if (estricto && de !== 'mundo' && D.saldo < cent) return false;
    D.saldo -= cent; A.saldo += cent; this.asientos.push({ de, a, cent, concepto, n: this.asientos.length }); if (this.asientos.length > 5000) this.asientos.splice(0, 1000); MC.emit('dinero', { de, a, cent, concepto }); return true;
  }
  cuadra() { let s = 0; for (const c of this.cuentas.values()) s += c.saldo; return s === 0; }
}
/* un mercado: demanda Qd = a − b·P y oferta Qs = c + d·P (P en unidades de moneda) */
class Mercado {
  constructor({ nombre, a, b, c, d, precio }) { Object.assign(this, { nombre, a, b, c, d }); this.precio = precio ?? this.equilibrio().P; this.choque = 0; }
  equilibrio() { const P = (this.a + this.choque - this.c) / (this.b + this.d); return { P, Q: this.a + this.choque - this.b * P }; }
  demanda(P = this.precio) { return Math.max(0, this.a + this.choque - this.b * P); }
  oferta(P = this.precio) { return Math.max(0, this.c + this.d * P); }
  /* elasticidad precio de la demanda en el precio actual */
  elasticidad(P = this.precio) { const Q = this.demanda(P); return Q ? -this.b * P / Q : -Infinity; }
  /* ajuste walrasiano: el precio sube si falta y baja si sobra (k: velocidad por unidad de tiempo) */
  paso(dt, k = .05) { const exceso = this.demanda() - this.oferta(); this.precio = Math.max(0, this.precio + k * exceso * dt); return this.precio; }
}
const Finanzas = {
  compuesto: (P, r, n) => P * Math.pow(1 + r, n),                       // capital con interés r por periodo, n periodos
  inflacion: (precio, anual, anios) => precio * Math.pow(1 + anual, anios),
  tasaPeriodo: (anual, periodos = 12) => Math.pow(1 + anual, 1 / periodos) - 1,   // tasa efectiva anual → por periodo
  /* cuota fija de un préstamo (sistema francés) y su tabla */
  cuota: (P, r, n) => r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)),
  amortizacion(P, r, n) { const q = Finanzas.cuota(P, r, n), T = []; let s = P; for (let i = 1; i <= n; i++) { const int = s * r, ab = q - int; s -= ab; T.push({ n: i, cuota: q, interes: int, abono: ab, saldo: Math.max(0, s) }); } return T; },
  vpn: (r, flujos) => flujos.reduce((a, f, t) => a + f / Math.pow(1 + r, t), 0),
  /* tasa interna de retorno por bisección (flujos con un cambio de signo) */
  tir(flujos) { let lo = -.99, hi = 10; const f = r => Finanzas.vpn(r, flujos); if (f(lo) * f(hi) > 0) return null; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; },
  depreciacionLineal: (costo, residual, vida, t) => Math.max(residual, costo - (costo - residual) * t / vida),
  depreciacionDecreciente: (costo, tasa, t) => costo * Math.pow(1 - tasa, t)
};
/* empleos y salarios: el pago por hora de juego sale del salario mensual de referencia */
const Trabajo = {
  referencia: { salarioMinimo: 1423500, horasMes: 192, nota: 'Salario mínimo de Colombia de 2025 como referencia: actualízalo en la configuración de la ciudad.' },
  porHora: (mensual, horasMes = Trabajo.referencia.horasMes) => mensual / horasMes,
  /* pago de un turno en centavos (con recargo nocturno del 35 % entre las 9 p. m. y las 6 a. m., como en Colombia) */
  turno(mensual, minInicio, minutos) { const h = Trabajo.porHora(mensual) / 60; let pago = 0; for (let m = 0; m < minutos; m++) { const t = (minInicio + m) % 1440, noche = t >= 1260 || t < 360; pago += h * (noche ? 1.35 : 1); } return Math.round(pago * 100); }
};
Object.assign(MC, { Dinero, Libro, Mercado, Finanzas, Trabajo });
