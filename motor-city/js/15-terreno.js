/* =====================================================================
   TERRENO Y LÍMITES · por dónde se puede ir de verdad (que nada se atraviese sin sentido)
   AGUA: el agua del mapa se analiza una vez: cuerpos de agua (componentes), su TIPO (mar, lago o embalse, río y
   quebrada, según su tamaño, su forma, su altura y si toca el borde) y la DISTANCIA A LA ORILLA. La profundidad
   crece con esa distancia según el tipo (playas suaves en el mar, orillas más hondas en los lagos, ríos de 1–4 m,
   quebradas de rodilla). Así se puede vadear la orilla, nadar en lo hondo y la lancha no encalla.
   MATERIAL: pasto, monte (bosque), roca, arena (playa), nieve, barro, asfalto, andén, escalas, agua… con la PENDIENTE
   real del relieve (los barrancos y acantilados salen de ella).
   REGLAS DE PASO por clase de vehículo (a pie, bici, moto, carro, camión, lancha, aire), con su motivo:
   - pendiente máxima fuera de la vía (a pie ~45°, bici ~19°, carro ~24°, camión ~17°); bajar un barranco tampoco;
   - agua: a pie se vadea hasta la cintura y luego se nada; la bici cruza charcos y quebradas de hasta 25 cm; el carro,
     hasta 40 cm; la lancha necesita al menos 60 cm;
   - roca, monte, arena y nieve: quién entra y qué tan rápido (el todoterreno y la bici de montaña sí entran al monte);
   - OBSTÁCULOS: edificios (también las partes de los emblemáticos y lo que crece con MC.Urbe), árboles (los mismos
     que pintan las losas), postes, bancas, paraderos, hidrantes, rocas, y lo que el juego diga (tráfico, gente);
   - el borde del mundo.
   Sobre una vía (calle, andén, ciclorruta, escalas, puente) la pendiente no bloquea: las calles reales existen ahí.
   ===================================================================== */
const MATERIAL_TT = ['pasto', 'monte', 'ladrillo', 'edificio', 'asfalto', 'asfalto', 'anden', 'ciclorruta', 'agua', 'agua', 'plaza', 'puente', 'estacion', 'tierra', 'asfalto', 'patio', 'escalas', 'arena', 'nieve', 'roca'];
const VIA_TT = new Set([4, 5, 6, 7, 10, 11, 12, 14, 15, 16]);   // calle, avenida, andén, ciclorruta, plaza, puente, estación, autopista, patio, escalas
const PEND_MAX = { pie: 1.0, rueda: .35, moto: .5, auto: .45, pesado: .3, agua: 99, aire: 99, riel: .08, cable: 99 };
const AGUA_MAX = { pie: 99, rueda: .25, moto: .3, auto: .4, pesado: .7, agua: 0, aire: 99 };   // profundidad que se cruza (m)
const OBST_R = { poste: .22, arbol: .4, banca: .55, caneca: .3, paradero: .95, hidrante: .2, roca: 0, palma: .3, frailejon: .25, arbusto: .5 };
const Terreno = {
  MATERIAL_TT, PEND_MAX, AGUA_MAX,
  /* ---------- agua: tipo y profundidad ---------- */
  agua(M) {
    if (M._agua) return M._agua;
    if (M.tiene?.('agua') && M.capaInfo('agua').formato === 'AGUA1') {
      const {w,h,paso,cuerpos:C} = M.capaInfo('agua'), datos = M.capa('agua');
      const dv = new DataView(datos.buffer,datos.byteOffset,datos.byteLength), n = w*h;
      const tipo = new Uint8Array(n), comp = new Int32Array(n).fill(-1), D = new Float32Array(n);
      for (let o=0; o<datos.length; o+=13) {
        const i=dv.getUint32(o,true); tipo[i]=datos[o+12]; comp[i]=dv.getInt32(o+4,true); D[i]=dv.getFloat32(o+8,true);
      }
      return M._agua={w,h,paso,C,tipo,comp,D};
    }
    const T = M.tile, paso = Math.max(T, 10, Math.ceil(Math.sqrt(M.ancho * M.alto / 1.2e6) / T) * T), w = Math.ceil(M.ancho / paso), h = Math.ceil(M.alto / paso), n = w * h;
    const tipo = new Uint8Array(n), tierra = new Uint8Array(n), rio = new Uint8Array(n);   // 0 tierra · 1 agua · 2 quebrada
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const t = M.suelo((i + .5) * paso, (j + .5) * paso), k = j * w + i; tipo[k] = t === TT.WATER ? 1 : t === TT.CANAL ? 2 : 0; }
    /* el río con nombre del mapa (si lo trae): se marca para que no se corte en la rejilla gruesa y se reconozca como río */
    let info = null; try { info = M.tiene && M.tiene('info') ? M.capa('info') : null; } catch (e) { info = null; }
    const R = info && Array.isArray(info.rio) ? info.rio : []; for (let q = 0; q + 3 < R.length; q += 2) { const L = Math.hypot(R[q + 2] - R[q], R[q + 3] - R[q + 1]); if (L > 400) continue; const m = Math.max(1, Math.ceil(L / (paso / 2))); for (let t = 0; t <= m; t++) { const i = Math.floor((R[q] + (R[q + 2] - R[q]) * t / m) / paso), j = Math.floor((R[q + 1] + (R[q + 3] - R[q + 1]) * t / m) / paso); if (i >= 0 && j >= 0 && i < w && j < h) { const k = j * w + i; rio[k] = 1; if (!tipo[k]) tipo[k] = 1; } } }
    for (let k = 0; k < n; k++) tierra[k] = tipo[k] ? 0 : 1;
    const D = distanciaRejilla(tierra, w, h), comp = new Int32Array(n).fill(-1), C = [];
    for (let s = 0; s < n; s++) { if (!tipo[s] || comp[s] >= 0) continue; const id = C.length, pila = [s]; comp[s] = id; let tam = 0, borde = false, dmax = 0, cota = 0, canal = 0, enRio = 0;
      while (pila.length) { const k = pila.pop(), i = k % w, j = (k / w) | 0; tam++; if (i === 0 || j === 0 || i === w - 1 || j === h - 1) borde = true; dmax = Math.max(dmax, D[k]); if (tam <= 400) cota += M.cota((i + .5) * paso, (j + .5) * paso); if (tipo[k] === 2) canal++; if (rio[k]) enRio++;
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= w || jj >= h) continue; const q = jj * w + ii; if (tipo[q] && comp[q] < 0) { comp[q] = id; pila.push(q); } } }
      const area = tam * paso * paso, ancho = dmax * paso * 2, cotaMedia = cota / Math.min(tam, 400);
      const t = enRio > 3 ? 'rio' : canal > tam * .5 ? (area > 5e4 ? 'rio' : 'quebrada') : (borde && cotaMedia < 8 && area > 1e6) ? 'mar' : (ancho < 90 && area / Math.max(1, ancho) > 400) ? 'rio' : 'lago';
      C.push({ id, tipo: t, area, ancho, borde, cota: cotaMedia }); }
    return (M._agua = { w, h, paso, D, comp, C, tipo });
  },
  /* el cuerpo de agua en (x, y) o null; con su profundidad (m) */
  aguaEn(M, x, y) {
    const tt = M.suelo(x, y); if (tt !== TT.WATER && tt !== TT.CANAL) return null; const A = Terreno.agua(M), i = clamp(Math.floor(x / A.paso), 0, A.w - 1), j = clamp(Math.floor(y / A.paso), 0, A.h - 1), k = j * A.w + i;
    const c = A.comp[k] >= 0 ? A.C[A.comp[k]] : { tipo: tt === TT.CANAL ? 'quebrada' : 'lago' };
    /* distancia a la orilla, suave (interpolada); medio paso porque la celda de borde ya está a media celda */
    const fx = x / A.paso - .5, fy = y / A.paso - .5, i0 = clamp(Math.floor(fx), 0, A.w - 2), j0 = clamp(Math.floor(fy), 0, A.h - 2), u = clamp(fx - i0, 0, 1), v = clamp(fy - j0, 0, 1), Dk = (a, b) => Math.min(A.D[(j0 + b) * A.w + i0 + a], 60);
    const d = Math.max(.3, ((Dk(0, 0) * (1 - u) + Dk(1, 0) * u) * (1 - v) + (Dk(0, 1) * (1 - u) + Dk(1, 1) * u) * v) * A.paso - A.paso * .5 + 2);
    const prof = c.tipo === 'mar' ? Math.min(40, .2 + d * .045) : c.tipo === 'lago' ? Math.min(30, .3 + d * .11) : c.tipo === 'rio' ? Math.min(4, .35 + d * .13) : Math.min(.7, .12 + d * .06);
    return { tipo: c.tipo, prof, orilla: d, cuerpo: c };
  },
  /* pendiente (magnitud, metros por metro) en (x, y) */
  pendiente(M, x, y, d = 6) { const gx = (M.cota(x + d, y) - M.cota(x - d, y)) / (2 * d), gy = (M.cota(x, y + d) - M.cota(x, y - d)) / (2 * d); return Math.hypot(gx, gy); },
  /* todo lo que hay en (x, y) */
  en(M, x, y) { const tt = M.suelo(x, y); return { tt, material: MATERIAL_TT[tt] || 'tierra', via: VIA_TT.has(tt), pendiente: Terreno.pendiente(M, x, y), agua: Terreno.aguaEn(M, x, y), cota: M.cota(x, y) }; },
  /* ---------- reglas de paso: { ok, f (factor de velocidad), nada, motivo } ---------- */
  paso(C, x, y) {
    const M = C.mundo, V = C.veh, cl = V.clase, tt = M.suelo(x, y), via = VIA_TT.has(tt), base = Vehiculos.suelo(V, tt);
    if (!M.dentro(x, y)) return { ok: false, f: 0, motivo: 'el borde del mundo' };
    if (cl === 'aire' && C.z > 3) return { ok: true, f: 1 };
    const ag = (tt === TT.WATER || tt === TT.CANAL) ? Terreno.aguaEn(M, x, y) : null;
    if (cl === 'agua') { if (!ag) return { ok: false, f: 0, tierra: true, motivo: 'la lancha no anda en tierra' }; if (ag.prof < .6) return { ok: false, f: 0, motivo: 'muy pando para la lancha' }; return { ok: true, f: Math.max(.3, base || 1) }; }
    if (ag && !C.paso) {
      if (cl === 'pie') return ag.prof < .5 ? { ok: true, f: .55, vadea: true } : ag.prof < 1.15 ? { ok: true, f: .32, vadea: true } : { ok: true, f: .26, nada: true };
      const lim = AGUA_MAX[cl] ?? 0; if (ag.prof > lim) return { ok: false, f: 0, agua: true, motivo: ag.tipo === 'quebrada' ? 'la quebrada está muy honda para ' + (cl === 'rueda' ? 'la bici' : 'este vehículo') : 'el agua está muy honda (' + ag.prof.toFixed(1) + ' m)' };
      return { ok: true, f: .35, vadea: true };
    }
    if (base <= 0 && !(cl === 'auto' && tt === TT.MOUNT && (V.id === 'todoterreno' || V.offroad))) return { ok: false, f: 0, motivo: { 1: 'el monte es muy cerrado', 16: 'por las escalas no pasa', 17: 'se entierra en la arena', 18: 'no avanza en la nieve', 19: 'no pasa por la roca' }[tt] || 'por ahí no pasa' };
    /* pendiente: fuera de las vías, lo muy empinado no se sube ni se baja (barrancos y acantilados) */
    if (!via && !C.paso) { const s = Terreno.pendiente(M, x, y), lim = (V.id === 'mtb' || V.id === 'todoterreno' || V.offroad ? 1.4 : 1) * (PEND_MAX[cl] ?? .5), d = Math.hypot(x - C.x, y - C.y) || .5, g = (M.cota(x, y) - M.cota(C.x, C.y)) / d;
      if (s > lim * 1.35 || g > lim || -g > lim * 1.6) return { ok: false, f: 0, motivo: g < 0 ? 'es un barranco' : 'está muy empinado' }; }
    return { ok: true, f: Math.max(.12, base || .5) * (tt === TT.MOUNT && cl === 'auto' ? .55 : 1) };
  },
  /* el punto más cercano (anillos cada 2 m hasta r) que cumple cond(x, y): para embarcar, desembarcar y salir del agua */
  cerca(M, x, y, r, cond) { if (cond(x, y)) return { x, y, d: 0 }; for (let d = 2; d <= r; d += 2) { const n = Math.max(8, Math.round(d * 1.6)); for (let k = 0; k < n; k++) { const a = k / n * TAU, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (M.dentro(px, py) && cond(px, py)) return { x: px, y: py, d }; } } return null; },
  aguaHonda(M, x, y, r = 30, min = .8) { return Terreno.cerca(M, x, y, r, (a, b) => { const g = Terreno.aguaEn(M, a, b); return g && g.prof >= min; }); },
  tierraFirme(M, x, y, r = 14) { return Terreno.cerca(M, x, y, r, (a, b) => { const t = M.suelo(a, b); return t !== TT.WATER && t !== TT.CANAL && t !== TT.BLDG && !M.edificioEn(a, b, .5) && Terreno.pendiente(M, a, b) < .8; }); },
  /* ---------- obstáculos: lo que ocupa espacio en el piso ---------- */
  _indiceSitios(M) {
    if (M._sitiosIdx) return M._sitiosIdx; const G = new Map(), C = 80, E = M.sitios().E || [];
    E.forEach((q, n) => { const k = q.caja; if (!k) return; for (let gy = Math.floor(k[1] / C); gy <= Math.floor(k[3] / C); gy++) for (let gx = Math.floor(k[0] / C); gx <= Math.floor(k[2] / C); gx++) { const key = gx * 65536 + gy; (G.get(key) || G.set(key, []).get(key)).push(n); } });
    return (M._sitiosIdx = { G, C, E });
  },
  /* ¿hay un edificio de los sitios (emblemáticos, universidades, iglesias…) en (x, y)? */
  sitioEn(M, x, y) { const I = Terreno._indiceSitios(M), L = I.G.get(Math.floor(x / I.C) * 65536 + Math.floor(y / I.C)); if (!L) return null; for (const n of L) { const q = I.E[n]; if (x < q.caja[0] || x > q.caja[2] || y < q.caja[1] || y > q.caja[3]) continue; for (const R of q.R) if (dentroPol(R, x, y)) return q; if (q.partes) for (const p of q.partes) if (p.z0 < 2.5 && dentroPol(p.B, x, y)) return q; } return null; },
  /* árbol de las losas (los mismos que se pintan) cuyo tronco toca el círculo (x, y, r) */
  arbolLosaEn(M, x, y, r) {
    const cel = 7; for (let gy = Math.floor((y - 3) / cel) * cel; gy <= y + 3; gy += cel) for (let gx = Math.floor((x - 3) / cel) * cel; gx <= x + 3; gx += cel) {
      const tt = M.suelo(gx, gy); if (tt !== TT.GRASS && tt !== TT.MOUNT && tt !== TT.PLAZA) continue; const Z = M.estilo(gx, gy), dens = tt === TT.MOUNT ? .55 : tt === TT.PLAZA ? .18 : (Z.arboles || .4) * .55; if (h2(gx, gy, 41) > dens) continue;
      const tx = gx + h2(gx, gy, 42) * cel, ty = gy + h2(gx, gy, 43) * cel; if (Math.hypot(tx - x, ty - y) < .38 + r && (!MC.Arboleda || MC.Arboleda.sembrable(M, tx, ty, 3, tt))) return { t: 'arbol', x: tx, y: ty };   /* 4.5: el mismo filtro que los árboles que se ven */
    }
    return null;
  },
  /* el obstáculo que toca el círculo (x, y, r): mobiliario, naturaleza, árboles de las losas y lo que diga el juego */
  obstaculo(C, x, y, r) {
    const M = C.mundo, k = 3 + r;
    if (MC.Mobiliario) for (const p of Mobiliario.en(M, x - k, y - k, x + k, y + k, 200)) { const R = OBST_R[p.t]; if (R && Math.hypot(p.x - x, p.y - y) < R + r && !(M._rotos && MC.Rotos.esta(M, p))) return p; }
    /* 4.5: las rocas pequeñas no paran un carro (se pasan con un tumbo); a pie solo estorban las grandes */
    if (MC.Naturaleza) for (const p of Naturaleza.en(M, x - k, y - k, x + k, y + k)) { const R = p.t === 'roca' ? p.s * .45 : OBST_R[p.t]; if (R && (p.t !== 'roca' || p.s > (C.veh.clase === 'pie' ? .7 : .45)) && Math.hypot(p.x - x, p.y - y) < R + r && !(M._rotos && MC.Rotos.esta(M, p))) return p; }
    if (Terreno.arbolLosaEn(M, x, y, r)) return { t: 'arbol' };
    if (C.obstaculos) for (const o of C.obstaculos()) if (Math.hypot(o.x - x, o.y - y) < (o.r || .5) + r) return o;
    return null;
  }
};
Object.assign(MC, { Terreno });
