/* =====================================================================
   LUGARES JUGABLES · que el mundo abierto tenga a dónde ir y qué hacer (horas de juego sin una sola misión)
   - Salen del mapa real: los lugares con nombre (parques, bibliotecas, centros comerciales, tiendas, restaurantes,
     museos, iglesias) y, para que cada cuadra tenga vida, talleres, tiendas de barrio, restaurantes y tiendas de ropa
     puestos con azar fijo en edificios reales (siempre los mismos en el mismo lugar).
   - Cada lugar tiene horario, interior propio (MC.Interiores) y actividades con efecto real: reparar y mejorar el
     vehículo (MC.Desgaste), comprar ropa (cambia el aspecto), comer (energía e hidratación de MC.Seres), leer en la
     biblioteca (aprender un dato real), descansar en el parque, conocer gente (MC.Historias)…
   - Todo cobra en el libro de partida doble (MC.Libro): la plata del juego siempre cuadra.
   ===================================================================== */
const TIPOS_LUGAR = {
  taller_bici: { n: 'Taller de bicis', icono: '🔧', programa: 'taller', horario: [8, 19], nombres: ['El Pedalazo', 'La Cadena', 'Bicis Don Chepe', 'El Rayo', 'Ruedas del Barrio', 'La Biela'] },
  taller_carro: { n: 'Taller de carros y motos', icono: '🛠️', programa: 'taller', horario: [7, 18], nombres: ['Serviteca La 80', 'Taller El Mono', 'Mecánica Rápida', 'Llantas y Frenos Juancho', 'Motos El Paisa'] },
  tienda_barrio: { n: 'Tienda de barrio', icono: '🏪', programa: 'tienda', horario: [6, 22], nombres: ['Tienda Doña Rosa', 'Granero La Esquina', 'Tienda El Vecino', 'Mini mercado La Ceiba', 'Tienda Don Darío'] },
  tienda_ropa: { n: 'Tienda de ropa', icono: '👕', programa: 'tienda', horario: [9, 20], nombres: ['Moda Paisa', 'El Ropero', 'Estilo Urbano', 'La Percha', 'Telas y Tenis'] },
  restaurante: { n: 'Restaurante', icono: '🍲', programa: 'restaurante', horario: [11, 21], nombres: ['La Fonda', 'Sazón Paisa', 'El Fogón de la Abuela', 'Corrientazo Don Luis', 'Arepas La Montaña'] },
  centro_comercial: { n: 'Centro comercial', icono: '🛍️', programa: 'centro_comercial', horario: [10, 21], re: /centro comercial|\bc\.?\s?c\.?\b|\bmall\b|unicentro|oviedo|santaf[eé]|molinos|el tesoro|premium plaza|viva /i },
  biblioteca: { n: 'Biblioteca', icono: '📚', programa: 'biblioteca', horario: [8, 19], re: /bibliotec/i },
  parque: { n: 'Parque', icono: '🌳', programa: null, horario: [0, 24], re: /parque|plaza|z[oó]calo|plazoleta|jard[ií]n/i },
  museo: { n: 'Museo', icono: '🏛️', programa: 'oficina', horario: [9, 18], re: /museo|explora|planetario|casa de la memoria/i },
  iglesia: { n: 'Iglesia', icono: '⛪', programa: 'iglesia', horario: [6, 20], re: /iglesia|catedral|bas[ií]lica|parroquia|capilla/i }
};
const ACT_LUGAR = {
  taller_bici: [{ id: 'reparar', n: 'Reparar el vehículo' }, { id: 'mejorar_llantas', n: 'Llantas nuevas (+agarre)', precio: 9000000 }, { id: 'mejorar_frenos', n: 'Frenos nuevos (+frenada)', precio: 6000000 }, { id: 'mejorar_liviano', n: 'Piezas livianas (−masa)', precio: 15000000 }, { id: 'pintura', n: 'Pintura nueva', precio: 5000000 }, { id: 'luces', n: 'Luces para la noche', precio: 3500000 }],
  taller_carro: [{ id: 'reparar', n: 'Reparar el vehículo' }, { id: 'mejorar_llantas', n: 'Llantas nuevas (+agarre)', precio: 80000000 }, { id: 'mejorar_frenos', n: 'Frenos (+frenada)', precio: 45000000 }, { id: 'mejorar_motor', n: 'Ajuste del motor (+potencia)', precio: 120000000 }, { id: 'pintura', n: 'Pintura nueva', precio: 90000000 }],
  tienda_barrio: [{ id: 'agua', n: 'Agua (500 ml)', precio: 200000, efecto: { hidratacion: .35 } }, { id: 'arepa', n: 'Arepa con quesito', precio: 350000, efecto: { energia: .25 } }, { id: 'fruta', n: 'Fruta picada', precio: 400000, efecto: { energia: .15, hidratacion: .15 } }],
  tienda_ropa: [{ id: 'camisa', n: 'Camisa nueva', precio: 6000000, aspecto: 'cCamisa' }, { id: 'pantalon', n: 'Pantalón', precio: 9000000, aspecto: 'cPantalon' }, { id: 'gorra', n: 'Gorra', precio: 3000000, aspecto: 'cGorra' }, { id: 'tenis', n: 'Tenis', precio: 15000000, aspecto: 'cZapatos' }],
  restaurante: [{ id: 'almuerzo', n: 'Corrientazo (almuerzo del día)', precio: 1800000, efecto: { energia: .6, hidratacion: .2 } }, { id: 'bandeja', n: 'Bandeja paisa', precio: 3500000, efecto: { energia: .9 } }],
  centro_comercial: [{ id: 'vitrinear', n: 'Mirar vitrinas (gratis)' }, { id: 'helado', n: 'Helado', precio: 800000, efecto: { energia: .1, hidratacion: .1 } }, { id: 'cine', n: 'Cine', precio: 1500000, efecto: { animo: .4 } }],
  biblioteca: [{ id: 'leer', n: 'Leer un rato (aprendes algo real)' }, { id: 'internet', n: 'Usar un computador (mapas y datos)' }],
  parque: [{ id: 'descansar', n: 'Descansar en una banca', efecto: { energia: .2 } }, { id: 'conversar', n: 'Conversar con alguien' }, { id: 'jugar', n: 'Jugar un rato' }],
  museo: [{ id: 'recorrer', n: 'Recorrer las salas (aprendes algo real)', precio: 1200000 }],
  iglesia: [{ id: 'contemplar', n: 'Sentarse en silencio' }]
};
/* datos reales y verificables para aprender jugando (biblioteca, museo, historias de «conciencia») */
const DATOS_REALES = [
  'Con el piso mojado, una bici necesita casi el doble de distancia para frenar: el agarre de la llanta cae de ~0,7 a ~0,4.',
  'A 1.500 m de altura, como en Medellín, el aire es ~16 % menos denso que al nivel del mar: los carros pierden potencia y las bicis sienten menos viento.',
  'El agua hierve a ~95 °C en Medellín, no a 100 °C: hay menos presión del aire encima.',
  'Una persona caminando gasta unas 3,5 veces la energía que en reposo (3,5 MET); en bici moderada, unas 7 veces.',
  'La temperatura baja unos 6,5 °C por cada kilómetro que se sube: por eso Santa Elena es más fría que el centro de Medellín.',
  'El Metro de Medellín empezó a operar en 1995 y fue el primero de Colombia.',
  'El embalse de Guatapé y El Peñol se llenó en los años 70 y dejó bajo el agua el pueblo viejo de El Peñol.',
  'La Piedra del Peñol mide unos 220 m de alto y se sube por una escalera de unos 740 escalones.',
  'Un bombillo LED gasta unas 6 veces menos energía que uno incandescente para dar la misma luz.',
  'Los perros oyen sonidos de hasta ~45.000 Hz; las personas, solo hasta ~20.000 Hz.',
  'Plantar árboles en la calle baja la temperatura del andén varios grados en los días de calor.',
  'El colibrí bate las alas entre 50 y 80 veces por segundo y su corazón late más de 1.000 veces por minuto.'
];
const Lugares = {
  TIPOS: TIPOS_LUGAR, ACTIVIDADES: ACT_LUGAR, DATOS: DATOS_REALES, CELDA: 320,
  /* clasifica un lugar con nombre del mapa */
  tipoDe(L) { const t = (L.nombre || '') + ' ' + (L.dibujo || ''); for (const [k, T] of Object.entries(TIPOS_LUGAR)) if (T.re && T.re.test(t)) return k; if (/taller|bicicleter|mec[aá]nic|llanter|serviteca/i.test(t)) return /bici/i.test(t) ? 'taller_bici' : 'taller_carro'; if (/tienda|granero|minimercado|supermercado|droguer/i.test(t)) return 'tienda_barrio'; if (/restaurante|asadero|comida|panader|caf[eé]|helader|fonda/i.test(t)) return 'restaurante'; if (/ropa|boutique|moda/i.test(t)) return 'tienda_ropa'; return null; },
  /* lugares con nombre del mapa + los de cada cuadra (azar fijo), en una caja */
  en(mundo, x0, y0, x1, y1) {
    const C = this.CELDA, out = []; if (!mundo._lugaresNombre) mundo._lugaresNombre = (mundo.lugares || []).map(L => ({ L, tipo: this.tipoDe(L) })).filter(q => q.tipo).map(q => this._hacer(q.tipo, q.L.nombre, q.L.x, q.L.y, null, hashTxt(q.L.nombre), true));
    for (const q of mundo._lugaresNombre) if (q.x >= x0 && q.x <= x1 && q.y >= y0 && q.y <= y1) out.push(q);
    const cache = mundo._lugaresCelda || (mundo._lugaresCelda = new Map());
    for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) {
      const k = gx * 65536 + gy; if (!cache.has(k)) cache.set(k, this._celda(mundo, gx, gy)); for (const q of cache.get(k)) if (q.x >= x0 && q.x <= x1 && q.y >= y0 && q.y <= y1) out.push(q);
    }
    return out;
  },
  cerca(mundo, x, y, r = 40, tipo) { return this.en(mundo, x - r, y - r, x + r, y + r).filter(q => (!tipo || q.tipo === tipo) && Math.hypot(q.x - x, q.y - y) <= r).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)); },
  _celda(mundo, gx, gy) {
    const C = this.CELDA, eds = mundo.edificiosEn(gx * C, gy * C, (gx + 1) * C, (gy + 1) * C).filter(e => e.h > 2 && e.hw * e.hd * 4 > 40 && e.hw * e.hd * 4 < 2500), out = []; if (eds.length < 6) return out;
    const r = mulberry32((gx * 73856093) ^ (gy * 19349663) ^ 0x5bd1e995), usados = new Set();
    for (const [tipo, p] of [['tienda_barrio', .7], ['taller_bici', .35], ['restaurante', .45], ['tienda_ropa', .2], ['taller_carro', .2]]) {
      if (r() > p) continue; for (let i = 0; i < 6; i++) { const e = eds[Math.floor(r() * eds.length)]; if (usados.has(e)) continue; usados.add(e); const T = TIPOS_LUGAR[tipo]; out.push(this._hacer(tipo, T.nombres[Math.floor(r() * T.nombres.length)], e.x, e.y, e, Math.floor(r() * 1e9), false)); break; }
    }
    return out;
  },
  _hacer(tipo, nombre, x, y, e, semilla, real) { const T = TIPOS_LUGAR[tipo]; return { tipo, nombre, x, y, edificio: e, semilla, real, icono: T.icono, horario: T.horario, programa: T.programa, abierto(h) { return h >= T.horario[0] && h < T.horario[1]; } }; },
  /* el interior del lugar (si tiene) */
  interior(mundo, L) { if (!L.programa) return null; const e = L.edificio || Direccion.edificioCerca(mundo, L.x, L.y, 40) || { hw: 9, hd: 12, s: .3 }; return Interiores.generar(Object.assign({}, e, { hw: Math.max(e.hw, L.programa === 'centro_comercial' ? 22 : 6), hd: Math.max(e.hd, L.programa === 'centro_comercial' ? 28 : 7) }), { programa: L.programa, semilla: L.semilla }); },
  /* hace una actividad: { ok, texto, cobro }  ctx: { libro, cuenta, persona (MC.Seres.Persona), aspecto, desgaste, vehiculo, hora } */
  hacer(L, idAct, ctx = {}) {
    const A = (ACT_LUGAR[L.tipo] || []).find(a => a.id === idAct); if (!A) return { ok: false, texto: 'Eso no se hace aquí.' };
    if (ctx.hora != null && !L.abierto(ctx.hora)) return { ok: false, texto: L.nombre + ' está cerrado ahora (abre de ' + L.horario[0] + ' a ' + L.horario[1] + ').' };
    let precio = A.precio || 0; if (A.id === 'reparar') precio = ctx.desgaste ? Desgaste.costoReparar(ctx.desgaste, ctx.vehiculo) : 0;
    if (precio && ctx.libro && !ctx.libro.mover(ctx.cuenta || 'jugador', 'comercio', precio, L.nombre + ': ' + A.n)) return { ok: false, texto: 'No te alcanza la plata (' + Lugares.pesos(precio) + ').' };
    let texto = A.n + ' ✓';
    if (A.efecto && ctx.persona) { const E = ctx.persona.estado; for (const [k, v] of Object.entries(A.efecto)) if (E[k] != null) E[k] = clamp(E[k] + v, 0, 1); }
    if (A.aspecto && ctx.aspecto) { const r = mulberry32(hashTxt(L.nombre + A.id + (ctx.aspecto._n = (ctx.aspecto._n || 0) + 1))); ctx.aspecto[A.aspecto] = 'hsl(' + Math.floor(r() * 360) + ',' + (45 + Math.floor(r() * 40)) + '%,' + (35 + Math.floor(r() * 30)) + '%)'; texto = 'Estrenas ' + A.n.toLowerCase() + '.'; }
    if (ctx.desgaste) { if (A.id === 'reparar') { Desgaste.reparar(ctx.desgaste); texto = 'Quedó como nuevo.'; } else if (A.id.startsWith('mejorar_') || A.id === 'pintura' || A.id === 'luces') { Desgaste.mejorar(ctx.desgaste, A.id.replace('mejorar_', '')); texto = A.n + ': listo.'; } }
    if (A.id === 'leer' || A.id === 'recorrer' || A.id === 'internet') { const d = DATOS_REALES[Math.floor(mulberry32(hashTxt(L.nombre) + (ctx.vez || 0))() * DATOS_REALES.length)]; texto = '📖 ' + d; MC.emit('aprende', { lugar: L, dato: d }); }
    MC.emit('actividad', { lugar: L, actividad: A, precio }); return { ok: true, texto, cobro: precio };
  },
  pesos(cent) { return '$' + Math.round(cent / 100).toLocaleString('es-CO'); }
};
/* ---------- desgaste, reparación y mejoras de cualquier vehículo ---------- */
const MEJORAS = { llantas: { agarre: 1.12 }, frenos: { freno: 1.22 }, liviano: { masa: .93, acc: 1.06 }, motor: { vmax: 1.07, acc: 1.12 }, pintura: {}, luces: {} };
const Desgaste = {
  MEJORAS,
  nuevo(V) { return { veh: V.id, km: 0, estado: 1, mejoras: {}, color: V.color || null }; },
  /* metros recorridos, choques y clima: la lluvia y el polvo gastan más */
  usar(st, metros, choques = 0, clima = null) { st.km += metros / 1000; st.estado = clamp(st.estado - metros * 1.5e-6 * (1 + (clima ? clima.lluvia || 0 : 0)) - choques * .025, 0, 1); return st; },
  costoReparar(st, V) { const base = { pie: 0, rueda: 6000000, moto: 30000000, auto: 90000000, pesado: 250000000, aire: 600000000, agua: 120000000 }[V ? V.clase : 'rueda'] ?? 6000000; return Math.round(base * (1 - st.estado) / 100) * 100; },
  reparar(st) { st.estado = 1; return st; },
  mejorar(st, id) { if (MEJORAS[id]) st.mejoras[id] = true; if (id === 'pintura') st.color = 'hsl(' + (hashTxt(st.veh + st.km.toFixed(2) + Object.keys(st.mejoras).length) % 360) + ',70%,50%)'; return st; },
  /* el vehículo con su estado y sus mejoras (para registrar como «el mío»): un vehículo gastado anda y frena menos */
  aplicar(V, st) {
    const k = .7 + .3 * st.estado, o = { vmax: V.vmax * (.85 + .15 * st.estado), acc: V.acc * k, freno: V.freno * k, masa: V.masa, agarre: 1 };
    for (const id of Object.keys(st.mejoras)) for (const [p, f] of Object.entries(MEJORAS[id] || {})) o[p] = (o[p] || 1) * f;
    return Object.assign({ id: 'mio_' + V.id, de: V.id, n: V.n + ' (el mío)', color: st.color || V.color }, o);
  }
};
Object.assign(MC, { Lugares, Desgaste });
