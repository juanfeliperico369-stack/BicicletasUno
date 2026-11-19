/* =====================================================================
   ONDAS · generación por reglas locales (las herramientas de Townscaper y de tantos juegos procedurales)
   - WFC («Wave Function Collapse», Maxim Gumin): cada celda empieza con todas las fichas posibles; se fija la de
     menor entropía (la que tiene menos opciones), se propagan las reglas de vecindad y se repite. Si hay
     contradicción, se vuelve a intentar con otra semilla. Sirve para fachadas, barrios, mobiliario, mazmorras…
   - AUTOTILE: la ficha correcta según los vecinos (máscara de 4 o de 8), y las 16 esquinas de la «rejilla dual»
     (cada celda mira sus 4 esquinas: es como Townscaper arma las casas sobre los vértices, no sobre las celdas).
   - REJILLA IRREGULAR (la de Townscaper, según las charlas de Oskar Stålberg): hexágono de triángulos → se juntan
     pares al azar en cuadriláteros → todo se subdivide en cuadriláteros → se relaja para que queden casi cuadrados.
     Pueblos orgánicos, plazas y calles que no parecen hechas con regla.
   ===================================================================== */
const Ondas = {
  /* fichas: { id: { peso, lados: [arriba, derecha, abajo, izquierda] } } (dos fichas encajan si sus lados enfrentados
     son iguales) · o reglas explícitas: compat(a, b, dir). fijos: { 'x,y': id } · devuelve { ok, celdas: [[id]] } */
  resolver({ ancho, alto, fichas, compat, fijos = {}, semilla = 1, intentos = 8, permitida }) {
    const ids = Object.keys(fichas), n = ids.length, D = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const ok = compat || ((a, b, d) => fichas[ids[a]].lados[d] === fichas[ids[b]].lados[(d + 2) % 4]);
    const tabla = []; for (let d = 0; d < 4; d++) { tabla[d] = []; for (let a = 0; a < n; a++) { tabla[d][a] = []; for (let b = 0; b < n; b++) if (ok(a, b, d)) tabla[d][a].push(b); } }
    for (let intento = 0; intento < intentos; intento++) {
      const r = mulberry32(semilla + intento * 7919), W = ancho * alto, P = Array.from({ length: W }, () => new Uint8Array(n).fill(1)), cuenta = new Int32Array(W).fill(n);
      if (permitida) for (let i = 0; i < W; i++) for (let a = 0; a < n; a++) if (!permitida(ids[a], i % ancho, Math.floor(i / ancho))) { P[i][a] = 0; cuenta[i]--; }
      const pila = [], quitar = (i, a) => { if (!P[i][a]) return true; P[i][a] = 0; cuenta[i]--; pila.push(i); return cuenta[i] > 0; };
      let roto = false; for (const [k, id] of Object.entries(fijos)) { const [x, y] = k.split(',').map(Number), i = y * ancho + x, a = ids.indexOf(id); for (let b = 0; b < n; b++) if (b !== a && !quitar(i, b)) roto = true; }
      const propagar = () => { while (pila.length) { const i = pila.pop(), x = i % ancho, y = (i / ancho) | 0; for (let d = 0; d < 4; d++) { const xx = x + D[d][0], yy = y + D[d][1]; if (xx < 0 || yy < 0 || xx >= ancho || yy >= alto) continue; const j = yy * ancho + xx; for (let b = 0; b < n; b++) { if (!P[j][b]) continue; let apoyo = false; for (let a = 0; a < n && !apoyo; a++) if (P[i][a] && tabla[d][a].includes(b)) apoyo = true; if (!apoyo && !quitar(j, b)) return false; } } } return true; };
      if (roto || !propagar()) continue;
      for (;;) {
        let mejor = -1, me = 1e9; for (let i = 0; i < W; i++) if (cuenta[i] > 1) { const e = cuenta[i] + r() * .5; if (e < me) { me = e; mejor = i; } }
        if (mejor < 0) break; let tot = 0; for (let a = 0; a < n; a++) if (P[mejor][a]) tot += fichas[ids[a]].peso || 1; let x = r() * tot, elegida = 0; for (let a = 0; a < n; a++) if (P[mejor][a]) { x -= fichas[ids[a]].peso || 1; if (x <= 0) { elegida = a; break; } }
        for (let b = 0; b < n; b++) if (b !== elegida) quitar(mejor, b); if (!propagar()) { roto = true; break; }
      }
      if (roto || cuenta.some(c => c !== 1)) continue;
      const celdas = []; for (let y = 0; y < alto; y++) { const f = []; for (let x = 0; x < ancho; x++) f.push(ids[P[y * ancho + x].indexOf(1)]); celdas.push(f); }
      return { ok: true, celdas, intento };
    }
    return { ok: false, celdas: null };
  },
  /* una fachada de «pisos × columnas»: locales y puerta abajo, balcones que se alinean, muros ciegos y ventanas */
  fachada(pisos, columnas, semilla = 1, estilo = 'paisa') {
    const F = { ventana: { peso: 5, lados: ['m', 'v', 'm', 'v'] }, balcon: { peso: estilo === 'moderno' ? 1 : 3, lados: ['b', 'v', 'b', 'v'] }, muro: { peso: 2, lados: ['m', 'v', 'm', 'v'] }, local: { peso: 4, lados: ['m', 'l', 'p', 'l'] }, puerta: { peso: 2, lados: ['m', 'l', 'p', 'l'] }, vitrina: { peso: 2, lados: ['m', 'l', 'p', 'l'] } };
    const K = Object.keys(F), piso = x => ['local', 'puerta', 'vitrina'].includes(x);
    /* al lado: el primer piso con el primer piso, sin dos puertas juntas; arriba de un balcón sigue un balcón o una ventana */
    const compat = (a, b, d) => { const A = K[a], B = K[b]; if (d === 1 || d === 3) return piso(A) === piso(B) && !(A === 'puerta' && B === 'puerta'); if (d === 0) return !(A === 'balcon' && B === 'muro'); return !(B === 'balcon' && A === 'muro'); };
    const R = Ondas.resolver({ ancho: columnas, alto: pisos, fichas: F, compat, semilla, permitida: (id, x, y) => (y === pisos - 1) === ['local', 'puerta', 'vitrina'].includes(id) && !(id === 'balcon' && y === pisos - 1) });
    if (!R.ok) return Array.from({ length: pisos }, (_, y) => Array.from({ length: columnas }, () => y === pisos - 1 ? 'local' : 'ventana'));
    return R.celdas;
  }
};
const Autotile = {
  /* máscara de 4 vecinos (arriba=1, derecha=2, abajo=4, izquierda=8): 16 casos */
  mascara4(es, x, y) { return (es(x, y - 1) ? 1 : 0) | (es(x + 1, y) ? 2 : 0) | (es(x, y + 1) ? 4 : 0) | (es(x - 1, y) ? 8 : 0); },
  /* máscara de 8 vecinos reducida a los 47 casos «blob» (las esquinas solo cuentan si sus dos lados están) */
  mascara8(es, x, y) { const n = es(x, y - 1), e = es(x + 1, y), s = es(x, y + 1), o = es(x - 1, y); let m = (n ? 1 : 0) | (e ? 4 : 0) | (s ? 16 : 0) | (o ? 64 : 0); if (n && e && es(x + 1, y - 1)) m |= 2; if (e && s && es(x + 1, y + 1)) m |= 8; if (s && o && es(x - 1, y + 1)) m |= 32; if (o && n && es(x - 1, y - 1)) m |= 128; return m; },
  /* rejilla dual: las 4 esquinas de una celda (sobre los vértices) → caso 0–15 y su forma canónica con giro */
  esquinas(a, b, c, d) { const k = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0) | (d ? 8 : 0); let mejor = k, giro = 0, q = k; for (let g = 1; g < 4; g++) { q = ((q << 1) | (q >> 3)) & 15; if (q < mejor) { mejor = q; giro = g; } } return { caso: k, canonico: mejor, giro }; }
};
const RejillaIrregular = {
  /* { puntos: [[x, y]], quads: [[i, j, k, l]] } con lado aproximado «lado» (m) y «anillos» de hexágono */
  crear({ anillos = 4, lado = 6, semilla = 1, relajar = 30 } = {}) {
    const r = mulberry32(semilla), P = [], idx = new Map(), clave = (q, s) => q + ',' + s, pt = (q, s) => { const k = clave(q, s); if (!idx.has(k)) { idx.set(k, P.length); P.push([lado * (q + s / 2), lado * s * Math.sqrt(3) / 2]); } return idx.get(k); };
    const T = []; for (let q = -anillos; q <= anillos; q++) for (let s = -anillos; s <= anillos; s++) { const d = (a, b) => Math.max(Math.abs(a), Math.abs(b), Math.abs(-a - b)); if (d(q, s) < anillos && d(q + 1, s) <= anillos && d(q, s + 1) <= anillos) T.push([pt(q, s), pt(q + 1, s), pt(q, s + 1)]); if (d(q + 1, s) <= anillos && d(q + 1, s + 1) <= anillos && d(q, s + 1) <= anillos && d(q, s) < anillos) T.push([pt(q + 1, s), pt(q + 1, s + 1), pt(q, s + 1)]); }
    /* juntar pares de triángulos vecinos en cuadriláteros (al azar) */
    const usado = new Uint8Array(T.length), Q = [], arista = (a, b) => a < b ? a + '_' + b : b + '_' + a, porArista = new Map(); T.forEach((t, i) => { for (let k = 0; k < 3; k++) { const e = arista(t[k], t[(k + 1) % 3]); (porArista.get(e) || porArista.set(e, []).get(e)).push(i); } });
    const orden = T.map((_, i) => i).sort(() => r() - .5); const sueltos = [];
    for (const i of orden) { if (usado[i]) continue; const t = T[i], vec = []; for (let k = 0; k < 3; k++) for (const j of porArista.get(arista(t[k], t[(k + 1) % 3]))) if (j !== i && !usado[j]) vec.push([j, k]); if (!vec.length) { sueltos.push(t); usado[i] = 1; continue; } const [j, k] = vec[Math.floor(r() * vec.length)], u = T[j], op = u.find(v => v !== t[k] && v !== t[(k + 1) % 3]); usado[i] = usado[j] = 1; Q.push([t[k], op, t[(k + 1) % 3], t[(k + 2) % 3]]); }
    /* subdividir: cada cuadrilátero en 4 y cada triángulo suelto en 3 (todo queda en cuadriláteros) */
    const medios = new Map(), medio = (a, b) => { const k = arista(a, b); if (!medios.has(k)) { medios.set(k, P.length); P.push([(P[a][0] + P[b][0]) / 2, (P[a][1] + P[b][1]) / 2]); } return medios.get(k); }, centro = L => { P.push([L.reduce((s, i) => s + P[i][0], 0) / L.length, L.reduce((s, i) => s + P[i][1], 0) / L.length]); return P.length - 1; };
    const F = []; for (const q of Q) { const c = centro(q), m = [0, 1, 2, 3].map(k => medio(q[k], q[(k + 1) % 4])); for (let k = 0; k < 4; k++) F.push([q[k], m[k], c, m[(k + 3) % 4]]); }
    for (const t of sueltos) { const c = centro(t), m = [0, 1, 2].map(k => medio(t[k], t[(k + 1) % 3])); for (let k = 0; k < 3; k++) F.push([t[k], m[k], c, m[(k + 2) % 3]]); }
    /* relajar: cada vértice interior se acerca al promedio de sus vecinos (los del borde quedan fijos) */
    const borde = new Set(), cuentaA = new Map(); for (const f of F) for (let k = 0; k < 4; k++) { const e = arista(f[k], f[(k + 1) % 4]); cuentaA.set(e, (cuentaA.get(e) || 0) + 1); } for (const [e, c] of cuentaA) if (c === 1) for (const v of e.split('_')) borde.add(+v);
    const vec = P.map(() => new Set()); for (const f of F) for (let k = 0; k < 4; k++) { vec[f[k]].add(f[(k + 1) % 4]); vec[f[(k + 1) % 4]].add(f[k]); }
    for (let it = 0; it < relajar; it++) for (let i = 0; i < P.length; i++) { if (borde.has(i) || !vec[i].size) continue; let sx = 0, sy = 0; for (const j of vec[i]) { sx += P[j][0]; sy += P[j][1]; } P[i][0] = lerp(P[i][0], sx / vec[i].size, .5); P[i][1] = lerp(P[i][1], sy / vec[i].size, .5); }
    return { puntos: P, quads: F };
  }
};
/* fachadas en caché con presupuesto por cuadro (las vistas piden muchas; se arman unas pocas por cuadro) */
const _FZ = new Map(); Ondas.presupuesto = 30;
Ondas.fachadaCache = (clave, pisos, columnas) => { const k = clave + ':' + pisos + 'x' + columnas; let F = _FZ.get(k); if (F) return F; if (Ondas.presupuesto <= 0) return null; Ondas.presupuesto--; F = Ondas.fachada(pisos, columnas, clave >>> 0); _FZ.set(k, F); if (_FZ.size > 5000) _FZ.delete(_FZ.keys().next().value); return F; };
Object.assign(MC, { Ondas, Autotile, RejillaIrregular });
