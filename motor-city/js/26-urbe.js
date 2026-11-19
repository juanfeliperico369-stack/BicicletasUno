/* =====================================================================
   URBE · simulación de ciudad a la manera de SimCity y Cities: Skylines (sobre el mapa real o uno inventado)
   - CAMPOS (rejilla de 40 m): valor del suelo, ruido, contaminación, verde, cobertura de servicios y acceso al
     transporte. El valor sube con parques, agua, servicios, transporte y calles cerca; baja con ruido y contaminación
     (como el «land value» y la «desirability» de SimCity 4 y Cities: Skylines). Se ven como capas de datos encima.
   - ZONAS en celdas de 8 m pegadas a las calles (hasta 4 de fondo): residencial (R), comercial (C), industrial (I)
     y oficinas (O), en densidad baja o alta. Los lotes crecen solos donde hay demanda y valor, mirando a la calle.
   - DEMANDA RCI: las casas necesitan empleos; los comercios, clientes; la industria, comercio y trabajadores. La
     ciudad real se toma en equilibrio con un leve crecimiento: la demanda responde a lo que el jugador cambia.
   - NIVELES: con buen valor del suelo un edificio sube de nivel (más pisos), como en Cities: Skylines.
   - RECURSOS (la idea de GlassBox, el motor de SimCity 2013): energía y agua tienen capacidad; si no alcanzan, la
     ciudad no crece. Servicios con radio: parque, policía, bomberos, salud, colegio, biblioteca, estación.
   - PRESUPUESTO en el libro de partida doble: predial por lote (avalúo × tarifa) y gastos de mantenimiento.
   Determinista: mismas acciones, misma ciudad.
   ===================================================================== */
const ZONAS_URBE = {
  R: { n: 'Residencial', color: '#43a047', clase: 'casa', umbral: 15, tarifa: .007 }, C: { n: 'Comercial', color: '#1e88e5', clase: 'comercio', umbral: 28, tarifa: .009 },
  I: { n: 'Industrial', color: '#f9a825', clase: 'nave', umbral: 5, tarifa: .01 }, O: { n: 'Oficinas', color: '#8e24aa', clase: 'oficina', umbral: 40, tarifa: .009 }
};
const SERVICIOS_URBE = {
  parque: { n: 'Parque', icono: '🌳', radio: 320, costo: 30000000, mes: 1500000 }, policia: { n: 'Estación de policía', icono: '🚓', radio: 900, costo: 120000000, mes: 9000000 },
  bomberos: { n: 'Bomberos', icono: '🚒', radio: 1000, costo: 120000000, mes: 9000000 }, salud: { n: 'Centro de salud', icono: '🏥', radio: 1100, costo: 200000000, mes: 15000000 },
  colegio: { n: 'Colegio', icono: '🏫', radio: 800, costo: 150000000, mes: 12000000 }, biblioteca: { n: 'Biblioteca', icono: '📚', radio: 900, costo: 90000000, mes: 5000000 },
  estacion: { n: 'Estación de transporte', icono: '🚉', radio: 600, costo: 250000000, mes: 10000000 },
  energia: { n: 'Planta de energía solar', icono: '☀️', capacidad: 8000, costo: 300000000, mes: 8000000 }, agua: { n: 'Planta de agua', icono: '💧', capacidad: 10000, costo: 250000000, mes: 7000000 }
};
const RUIDO_VIA = { 1: .35, 2: .8, 3: 1, 4: .6, 5: 0, 6: 0, 7: 0, 8: 0 };
/* distancia (en celdas) a lo marcado, con la transformada «chamfer» de dos pasadas */
function distanciaRejilla(mask, w, h) {
  const D = new Float32Array(w * h), INF = 1e9; for (let i = 0; i < w * h; i++) D[i] = mask[i] ? 0 : INF; const a = 1, b = Math.SQRT2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; let v = D[i]; if (x > 0) v = Math.min(v, D[i - 1] + a); if (y > 0) { v = Math.min(v, D[i - w] + a); if (x > 0) v = Math.min(v, D[i - w - 1] + b); if (x < w - 1) v = Math.min(v, D[i - w + 1] + b); } D[i] = v; }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; let v = D[i]; if (x < w - 1) v = Math.min(v, D[i + 1] + a); if (y < h - 1) { v = Math.min(v, D[i + w] + a); if (x < w - 1) v = Math.min(v, D[i + w + 1] + b); if (x > 0) v = Math.min(v, D[i + w - 1] + b); } D[i] = v; }
  return D;
}
function desenfocar(F, w, h, r, pasadas = 2) { const T = new Float32Array(F.length); for (let p = 0; p < pasadas; p++) { for (let y = 0; y < h; y++) { let s = 0; for (let x = -r; x <= r; x++) s += F[y * w + clamp(x, 0, w - 1)]; for (let x = 0; x < w; x++) { T[y * w + x] = s / (2 * r + 1); s += F[y * w + Math.min(w - 1, x + r + 1)] - F[y * w + Math.max(0, x - r)]; } } for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += T[clamp(y, 0, h - 1) * w + x]; for (let y = 0; y < h; y++) { F[y * w + x] = s / (2 * r + 1); s += T[Math.min(h - 1, y + r + 1) * w + x] - T[Math.max(0, y - r) * w + x]; } } } return F; }
const ZONA_DE_CLASE = c => /casa|edificio|torre|apart|residen/.test(c) ? 'R' : /comerc|local|tienda|mercado/.test(c) ? 'C' : /nave|indust|bodega|fabric/.test(c) ? 'I' : /oficina|civico|salud|educ|transporte|gobierno/.test(c) ? 'O' : null;
class Urbe {
  constructor(mundo, op = {}) {
    const M = this.mundo = mundo; this.paso = op.paso || 40; this.op = op;
    const c = op.centro || { x: M.ancho / 2, y: M.alto / 2 }, caja = op.caja || (M.ancho * M.alto < 6e7 ? [0, 0, M.ancho, M.alto] : [c.x - 1500, c.y - 1500, c.x + 1500, c.y + 1500]);
    this.x0 = Math.max(0, caja[0]); this.y0 = Math.max(0, caja[1]); this.x1 = Math.min(M.ancho, caja[2]); this.y1 = Math.min(M.alto, caja[3]);
    this.w = Math.max(2, Math.ceil((this.x1 - this.x0) / this.paso)); this.h = Math.max(2, Math.ceil((this.y1 - this.y0) / this.paso)); const n = this.w * this.h;
    this.C = { valor: new Float32Array(n), ruido: new Float32Array(n), contaminacion: new Float32Array(n), verde: new Float32Array(n), servicios: new Float32Array(n), transporte: new Float32Array(n), dVia: null, dAgua: null };
    this.zonas = new Map(); this.lotes = []; this.servicios = []; this.libro = op.libro || new Libro(); this.mes = 0; this.version = 0; this.alCambiar = op.alCambiar || null;
    this.impuesto = Object.fromEntries(Object.entries(ZONAS_URBE).map(([k, z]) => [k, z.tarifa])); this.cobertura = {};
    this._fijos(); this.censar(); this.calcular(); const d0 = this._demandaCruda(); this._base = { R: .25 - d0.R, C: .12 - d0.C, I: .06 - d0.I, O: .06 - d0.O };   // la ciudad real, en equilibrio con un leve crecimiento
    this.recursos = { energia: { cap: (this.pob + this.empleos() * .5) * 1.15, uso: 0 }, agua: { cap: (this.pob + this.empleos() * .5) * 1.15, uso: 0 } };
  }
  /* celda de campo de un punto */
  _i(x, y) { const i = Math.floor((x - this.x0) / this.paso), j = Math.floor((y - this.y0) / this.paso); return i < 0 || j < 0 || i >= this.w || j >= this.h ? -1 : j * this.w + i; }
  _centro(i) { return [this.x0 + (i % this.w + .5) * this.paso, this.y0 + (Math.floor(i / this.w) + .5) * this.paso]; }
  /* lo que no cambia: distancia a las vías y al agua, ruido de las vías, verde del suelo, parques reales y estaciones */
  _fijos() {
    const M = this.mundo, w = this.w, h = this.h, n = w * h, via = new Uint8Array(n), agua = new Uint8Array(n), ruido = new Float32Array(n), verde = new Float32Array(n);
    for (const v of M.vias()) { const P = v.p, kr = RUIDO_VIA[v.k] ?? .3; for (let j = 0; j + 3 < P.length; j += 2) { const L = Math.hypot(P[j + 2] - P[j], P[j + 3] - P[j + 1]), m = Math.max(1, Math.ceil(L / (this.paso / 2))); for (let t = 0; t <= m; t++) { const i = this._i(P[j] + (P[j + 2] - P[j]) * t / m, P[j + 1] + (P[j + 3] - P[j + 1]) * t / m); if (i >= 0) { via[i] = 1; ruido[i] = Math.max(ruido[i], kr); } } } }
    for (let i = 0; i < n; i++) { const [x, y] = this._centro(i), tt = M.suelo(x, y); if (tt === TT.WATER || tt === TT.CANAL) agua[i] = 1; if (tt === TT.GRASS || tt === TT.MOUNT) verde[i] = tt === TT.MOUNT ? .55 : .3; }
    this.C.dVia = distanciaRejilla(via, w, h).map(d => d * this.paso); this.C.dAgua = distanciaRejilla(agua, w, h).map(d => d * this.paso);
    this._ruidoVias = desenfocar(ruido, w, h, 1, 2); this._verdeBase = desenfocar(verde, w, h, 1, 1);
    const parques = (M.lugares || []).filter(L => /parque|plaza|z[oó]calo/i.test(L.nombre || '')).map(L => ({ x: L.x, y: L.y }));
    const est = []; const T = M.transporte || {}; for (const l of T.lineas || []) for (const e of l.est || []) { const q = l.T && l.T.at ? l.T.at(e.s) : e; if (q) est.push({ x: q.x, y: q.y }); } for (const e of T.encicla || []) est.push({ x: e.x, y: e.y });
    /* lo fijo de verde, transporte y contaminación (los parques y estaciones reales, la industria que ya existe) se calcula una vez */
    this._verdeFijo = new Float32Array(n); this._transFijo = new Float32Array(n); this._contFija = new Float32Array(n);
    for (let i = 0; i < n; i++) { const [x, y] = this._centro(i); let v = this._verdeBase[i]; for (const p of parques) { const d = Math.hypot(p.x - x, p.y - y); if (d < 700) v += Math.exp(-d / 160); } this._verdeFijo[i] = v; let tr = 0; for (const s2 of est) { const d = Math.hypot(s2.x - x, s2.y - y); if (d < 1600) tr = Math.max(tr, Math.exp(-d / 380)); } this._transFijo[i] = tr; }
    for (const e of M.edificiosEn(this.x0, this.y0, this.x1, this.y1)) if (ZONA_DE_CLASE(e.clase || '') === 'I') { const i = this._i(e.x, e.y); if (i >= 0) this._contFija[i] += .5; }
  }
  /* población y empleos de lo que ya existe (huellas reales) */
  censar() {
    let pob = 0; const emp = { C: 0, I: 0, O: 0 }; this.existentes = 0;
    for (const e of this.mundo.edificiosEn(this.x0, this.y0, this.x1, this.y1)) { if (e.agregado) continue; const z = ZONA_DE_CLASE(e.clase || ''), area = 4 * e.hw * e.hd * (e.pis || 1); this.existentes++; if (z === 'R') pob += area / 28; else if (z === 'C') emp.C += area / 22; else if (z === 'I') emp.I += area / 60; else if (z === 'O') emp.O += area / 18; }
    this.pob = Math.round(pob); this.emp = emp; return { pob: this.pob, empleos: this.empleos() };
  }
  empleos() { return this.emp.C + this.emp.I + this.emp.O; }
  /* sin recortar: la demanda responde a los cambios respecto de la ciudad de partida */
  _demandaCruda() { const pob = Math.max(1, this.pob), trab = pob * .45, emp = this.empleos(), s0 = this._escala || (this._escala = { R: Math.max(200, trab * .3), X: Math.max(60, pob * .05) }); return { R: (emp * 1.05 - trab) / s0.R, C: (pob * .12 - this.emp.C) / s0.X, I: (this.emp.C * .9 + pob * .05 - this.emp.I) / s0.X, O: (pob * .1 - this.emp.O) / s0.X }; }
  /* demanda RCI (−1 a 1) */
  demanda() { const d = this._demandaCruda(), b = this._base || { R: 0, C: 0, I: 0, O: 0 }; return { R: clamp(d.R + b.R, -1, 1), C: clamp(d.C + b.C, -1, 1), I: clamp(d.I + b.I, -1, 1), O: clamp(d.O + b.O, -1, 1) }; }
  /* recalcula los campos (llámalo al cambiar zonas, lotes o servicios) */
  calcular() {
    const C = this.C, w = this.w, h = this.h, n = w * h, pq = this.servicios.filter(s => s.tipo === 'parque'), es = this.servicios.filter(s => s.tipo === 'estacion'), sv = this.servicios.filter(s => SERVICIOS_URBE[s.tipo].radio && s.tipo !== 'parque' && s.tipo !== 'estacion');
    const cont = Float32Array.from(this._contFija), ruido = Float32Array.from(this._ruidoVias);
    for (const L of this.lotes) { const i = this._i(L.x, L.y); if (i < 0) continue; if (L.tipo === 'I') { cont[i] += 1; ruido[i] = Math.max(ruido[i], .7); } else if (L.tipo === 'C') ruido[i] = Math.max(ruido[i], .35); }
    desenfocar(cont, w, h, 3, 2); desenfocar(ruido, w, h, 1, 1);
    const cober = {}; for (const t of ['policia', 'bomberos', 'salud', 'colegio', 'biblioteca']) cober[t] = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const [x, y] = this._centro(i); let v = this._verdeFijo[i]; for (const p of pq) v += Math.exp(-Math.hypot(p.x - x, p.y - y) / 160); C.verde[i] = clamp(v, 0, 1.5) / 1.5;
      let tr = this._transFijo[i]; for (const s of es) tr = Math.max(tr, Math.exp(-Math.hypot(s.x - x, s.y - y) / 380)); C.transporte[i] = tr;
      let sm = 0; for (const s of sv) { const cv = 1 - Math.hypot(s.x - x, s.y - y) / SERVICIOS_URBE[s.tipo].radio; if (cv > cober[s.tipo][i]) cober[s.tipo][i] = cv; } for (const t in cober) sm += cober[t][i]; C.servicios[i] = sm / 5;
      C.contaminacion[i] = clamp(cont[i] * 1.6, 0, 1); C.ruido[i] = clamp(ruido[i], 0, 1);
      C.valor[i] = clamp(22 + 14 * Math.exp(-C.dVia[i] / 60) + 26 * C.verde[i] + 14 * Math.exp(-C.dAgua[i] / 140) + 22 * C.servicios[i] + 14 * C.transporte[i] - 38 * C.contaminacion[i] - 14 * C.ruido[i], 0, 100);
    }
    this.cobertura = cober; this.version++; return this;
  }
  valorEn(x, y) { const i = this._i(x, y); return i < 0 ? 0 : this.C.valor[i]; }
  campoEn(nombre, x, y) { const i = this._i(x, y), F = this.C[nombre]; return i < 0 || !F ? 0 : F[i]; }
  /* ZONIFICAR: celdas de 8 m pegadas a las calles, hasta 4 de fondo, dentro del círculo (x, y, r) */
  zonificar(tipo, x, y, r = 120, dens = 'baja') {
    if (!ZONAS_URBE[tipo]) return 0; const M = this.mundo; let n = 0; const { G, C } = M._rejillaVias(), VV = M.vias(), vis = new Set();
    for (let gy = Math.floor((y - r) / C); gy <= Math.floor((y + r) / C); gy++) for (let gx = Math.floor((x - r) / C); gx <= Math.floor((x + r) / C); gx++) { const a = G.get(gx * 65536 + gy); if (a) for (let q = 0; q < a.length; q += 2) vis.add(a[q]); }
    for (const vi of vis) { const v = VV[vi]; if (v.k === VIA.CICLO || v.k === VIA.SENDERO || v.k === VIA.ESCALAS || v.k === VIA.AUTOPISTA) continue; const P = v.p, anc = (v.ancho || 8) / 2;
      for (let j = 0; j + 3 < P.length; j += 2) { const ax = P[j], ay = P[j + 1], L = Math.hypot(P[j + 2] - ax, P[j + 3] - ay), a = Math.atan2(P[j + 3] - ay, P[j + 2] - ax), nx = -Math.sin(a), ny = Math.cos(a);
        for (let s = 4; s < L; s += 8) for (const ld of [1, -1]) for (let k = 0; k < 4; k++) {
          const cx = ax + Math.cos(a) * s + nx * ld * (anc + 4 + 8 * k), cy = ay + Math.sin(a) * s + ny * ld * (anc + 4 + 8 * k); if (Math.hypot(cx - x, cy - y) > r || !M.dentro(cx, cy)) continue;
          const key = Math.round(cx / 4) * 65536 + Math.round(cy / 4); if (this.zonas.has(key)) { const z0 = this.zonas.get(key); if (!z0.lote) { z0.tipo = tipo; z0.dens = dens; } continue; }
          const tt = M.suelo(cx, cy); if (tt === TT.WATER || tt === TT.CANAL || M.edificioEn(cx, cy, 2) || M.pendiente(cx, cy, a, 8) > .3) continue;
          this.zonas.set(key, { tipo, dens, x: cx, y: cy, a, lado: ld, fondo: k, lote: null }); n++;
        } } }
    this.version++; return n;
  }
  quitarZonas(x, y, r) { let n = 0; for (const [k, z] of this.zonas) if (!z.lote && Math.hypot(z.x - x, z.y - y) <= r) { this.zonas.delete(k); n++; } this.version++; return n; }
  /* un servicio en (x, y): cobra la construcción y queda en el presupuesto mensual */
  servicio(tipo, x, y, cuenta = 'alcaldia') {
    const S = SERVICIOS_URBE[tipo]; if (!S) return null; if (!this.libro.mover(cuenta, 'contratistas', S.costo, 'Construcción: ' + S.n)) return null;
    const s = { tipo, x, y, n: S.n }; this.servicios.push(s); if (S.capacidad) this.recursos[tipo].cap += S.capacidad; this.calcular(); MC.emit('urbe', { tipo: 'servicio', s }); return s;
  }
  /* avanza «meses»: demanda, crecimiento, niveles, recursos y presupuesto */
  avanzar(meses = 1) {
    const M = this.mundo; let nuevos = 0, suben = 0;
    for (let m = 0; m < meses; m++) {
      this.mes++; const D = this.demanda(), uso = this.pob + this.empleos() * .5; this.recursos.energia.uso = uso; this.recursos.agua.uso = uso;
      const recurso = Math.min(1, this.recursos.energia.cap / Math.max(1, uso), this.recursos.agua.cap / Math.max(1, uso));
      const cand = []; for (const z of this.zonas.values()) if (!z.lote && D[z.tipo] > .05 && this.valorEn(z.x, z.y) >= ZONAS_URBE[z.tipo].umbral) cand.push(z);
      cand.sort((p, q) => this.valorEn(q.x, q.y) - this.valorEn(p.x, p.y) || p.fondo - q.fondo || p.x - q.x);
      const cupo = { R: Math.ceil(6 * Math.max(0, D.R) * recurso), C: Math.ceil(4 * Math.max(0, D.C) * recurso), I: Math.ceil(3 * Math.max(0, D.I) * recurso), O: Math.ceil(3 * Math.max(0, D.O) * recurso) };
      for (const z of cand) { if (cupo[z.tipo] <= 0) continue; const L = this._lote(z); if (L) { cupo[z.tipo]--; nuevos++; } }
      /* subir de nivel: el valor del suelo alrededor manda (como los niveles 1–5 de Cities: Skylines) */
      for (const L of this.lotes) { const v = this.valorEn(L.x, L.y), obj = 1 + (v >= 80) + (v >= 65) + (v >= 50) + (v >= 35); if (obj > L.nivel && L.tipo !== 'I' && recurso >= 1 && h2(L.x | 0, this.mes, 5) < .35) { L.nivel++; L.e.pis += L.dens === 'alta' ? 2 : 1; L.e.h = Mundo.altoEdificio(L.e.k, L.e.pis); this._sumar(L, L.area * (L.dens === 'alta' ? 2 : 1)); suben++; this._avisar(L); } }
      this._presupuesto();
    }
    if (nuevos || suben) this.calcular(); return { nuevos, suben, demanda: this.demanda(), pob: this.pob, empleos: Math.round(this.empleos()) };
  }
  _sumar(L, area) { if (L.tipo === 'R') this.pob += Math.round(area / 28); else if (L.tipo === 'C') this.emp.C += area / 22; else if (L.tipo === 'I') this.emp.I += area / 60; else this.emp.O += area / 18; }
  _avisar(L) { if (this.alCambiar) this.alCambiar(L.x - 30, L.y - 30, L.x + 30, L.y + 30); }
  /* crea el lote y su edificio mirando a la calle (ancho a lo largo de la vía, fondo hacia adentro) */
  _lote(z) {
    const M = this.mundo, alta = z.dens === 'alta', T = z.tipo, frente = T === 'I' ? 16 : alta ? 14 : T === 'C' ? 10 : 8, fondo = T === 'I' ? 20 : alta ? 16 : 12, ux = Math.cos(z.a), uy = Math.sin(z.a), nx = -uy * z.lado, ny = ux * z.lado;
    const cx = z.x + nx * (fondo / 2 - 4), cy = z.y + ny * (fondo / 2 - 4);
    for (const [px, py] of [[0, 0], [frente / 2, fondo / 2], [-frente / 2, fondo / 2], [frente / 2, -fondo / 2], [-frente / 2, -fondo / 2]]) { const x = cx + ux * px + nx * py, y = cy + uy * px + ny * py; if (!M.dentro(x, y) || M.edificioEn(x, y, .8) || M.suelo(x, y) === TT.WATER) return null; }
    const v = this.valorEn(cx, cy), pis = T === 'I' ? 2 : T === 'R' ? (alta ? 3 + Math.floor(v / 14) : 1 + (v > 45)) : T === 'C' ? (alta ? 3 + Math.floor(v / 18) : 1 + (v > 50)) : 4 + Math.floor(v / 12);
    const e = M.agregarEdificio({ x: cx, y: cy, hw: frente / 2 - .5, hd: fondo / 2 - .5, ang: z.a, pis, clase: ZONAS_URBE[T].clase, k: 99, urbe: T }); if (!e) return null;
    const L = { tipo: T, dens: z.dens, x: cx, y: cy, e, nivel: 1, area: (frente - 1) * (fondo - 1) * pis, zona: z }; this.lotes.push(L);
    for (const q of this.zonas.values()) if (!q.lote && Math.hypot(q.x - cx, q.y - cy) < Math.max(frente, fondo) / 2 + 2) q.lote = L; z.lote = L;
    this._sumar(L, L.area); this._avisar(L); MC.emit('urbe', { tipo: 'lote', L }); return L;
  }
  /* predial (avalúo por m² según el valor del suelo × tarifa anual / 12) y mantenimiento de los servicios */
  _presupuesto() {
    let ing = 0; for (const L of this.lotes) { const aval = 1000000 + 40000 * this.valorEn(L.x, L.y); ing += L.area * aval * 100 * (this.impuesto[L.tipo] || .008) / 12; }
    ing += this.pob * 150000;   // otros recaudos (industria y comercio, vehículos…): $1.500 por habitante al mes
    ing = Math.round(ing); if (ing > 0) this.libro.mover('ciudadanos', 'alcaldia', ing, 'Recaudo del mes ' + this.mes, false);
    let gas = 0; for (const s of this.servicios) gas += SERVICIOS_URBE[s.tipo].mes; if (gas) this.libro.mover('alcaldia', 'contratistas', gas, 'Mantenimiento del mes ' + this.mes, false);
    this.ultimoMes = { ingresos: ing, gastos: gas };
  }
  /* las capas de información para MC.Vistas: E.capaInfo = urbe.capa('valor' | 'ruido' | 'contaminacion' | 'verde' | 'servicios' | 'transporte' | 'zonas') */
  capa(nombre) {
    const U = this; if (nombre === 'zonas') return { nombre, dibujar(g, a, b, c, d, e, f, D) { if (D.z < .5) return; g.save(); for (const z of U.zonas.values()) { if (z.lote) continue; const [x, y] = D.pr(z.x, z.y, 0), s = Math.max(2, D.z * 6.5); g.fillStyle = ZONAS_URBE[z.tipo].color + (z.dens === 'alta' ? 'aa' : '66'); g.fillRect(x - s / 2, y - s * .5 * (D.P.k || 1), s, s * (D.P.k || 1)); } g.restore(); } };
    const PAL = { valor: [[200, 40, 40], [240, 200, 60], [40, 170, 80]], ruido: [[0, 0, 0], [250, 150, 40], [160, 30, 160]], contaminacion: [[0, 0, 0], [170, 120, 50], [90, 60, 30]], verde: [[0, 0, 0], [120, 200, 90], [20, 120, 50]], servicios: [[0, 0, 0], [80, 160, 240], [30, 70, 200]], transporte: [[0, 0, 0], [240, 200, 60], [230, 90, 40]] }[nombre];
    if (!PAL || !this.C[nombre]) return null; let cv = null, ver = -1;
    const hacer = () => { const F = U.C[nombre], w = U.w, h = U.h; cv = lienzo(w, h); if (!cv) return; const g2 = cv.getContext('2d'), img = g2.createImageData(w, h), D = img.data, esValor = nombre === 'valor';
      for (let i = 0; i < w * h; i++) { const t = clamp(esValor ? F[i] / 100 : F[i], 0, 1), A = t < .5 ? PAL[0] : PAL[1], B = t < .5 ? PAL[1] : PAL[2], u = t < .5 ? t * 2 : (t - .5) * 2; D[4 * i] = A[0] + (B[0] - A[0]) * u; D[4 * i + 1] = A[1] + (B[1] - A[1]) * u; D[4 * i + 2] = A[2] + (B[2] - A[2]) * u; D[4 * i + 3] = esValor ? 150 : Math.round(t * 190); }
      g2.putImageData(img, 0, 0); ver = U.version; };
    return { nombre, dibujar(g, a, b, c, d, e, f) { if (ver !== U.version || !cv) hacer(); if (!cv) return; g.save(); g.setTransform(a, b, c, d, e, f); g.imageSmoothingEnabled = true; g.drawImage(cv, U.x0, U.y0, U.w * U.paso, U.h * U.paso); g.restore(); } };
  }
  resumen() { const D = this.demanda(); let vs = 0; for (const v of this.C.valor) vs += v; return { mes: this.mes, poblacion: this.pob, empleos: Math.round(this.empleos()), lotes: this.lotes.length, zonas: this.zonas.size, demanda: D, valorMedio: +(vs / this.C.valor.length).toFixed(1), alcaldia: this.libro.saldo('alcaldia'), recursos: this.recursos, ultimoMes: this.ultimoMes || null }; }
  /* lo que se guarda (zonas, servicios y lotes crecidos se reconstruyen con las mismas acciones) */
  guardar() { return { mes: this.mes, servicios: this.servicios.map(s => [s.tipo, Math.round(s.x), Math.round(s.y)]), lotes: this.lotes.map(L => [L.tipo, L.dens, +L.x.toFixed(1), +L.y.toFixed(1), +L.zona.a.toFixed(3), L.e.pis, L.nivel]) }; }
}
Object.assign(MC, { Urbe, ZONAS_URBE, SERVICIOS_URBE, distanciaRejilla });
