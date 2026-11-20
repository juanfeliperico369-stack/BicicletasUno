/* =====================================================================
   EXPORTAR y PUENTE · llevar un mundo de Motor City a motores más potentes (2.7)
   Motor City corre en un HTML en cualquier celular. Cuando se quiera más (Godot 4, Unity, Unreal 5, Blender, three.js,
   Babylon o WebGPU), el mismo mundo sale en formatos estándar y la simulación se puede usar desde afuera:
   - GLB (glTF 2.0 binario, el «JPEG del 3D»): terreno con su relieve real y color por suelo (agua por profundidad),
     edificios extruidos con el color de su zona, vías como cintas sobre el terreno y árboles de baja poligonización
     por especie. Un solo material con colores por vértice: entra igual en todos los motores.
   - ALTURAS en RAW de 16 bits (el formato que importan los terrenos de Unity y Unreal), con su mínimo y máximo.
   - ESCENA en JSON: edificios (huella, altura, colores, clase), vías (polilínea, ancho, tipo), árboles (especie,
     alto, copa), lugares jugables y la caja, para que el motor de destino ponga su propia lógica y su arte.
   - PUENTE: MC.Puente.instantanea(E) da el estado vivo (jugador, vehículos, gente, hora, clima) serializable, para
     mandarlo por WebSocket a otro motor que solo dibuje (la simulación sigue en Motor City).
   Ejes: el mundo es x al oriente, y al sur y h arriba (metros). En glTF: X = x, Y = h, Z = y (diestro, +Y arriba).
   Uso: MC.Exportar.glb(mundo, [x0, y0, x1, y1]) → Uint8Array · MC.Exportar.escena(...) · MC.Exportar.alturas(...)
        node motor.mjs exportar guatape --lado 600   → dist/exportar/guatape/{mundo.glb, alturas.r16, escena.json, LEEME.md}
   ===================================================================== */
const Exportar = {
  /* relieve: una rejilla de alturas (metros) cada `paso` metros */
  alturas(M, caja, paso = 4) {
    const [x0, y0, x1, y1] = caja, w = Math.max(2, Math.floor((x1 - x0) / paso) + 1), h = Math.max(2, Math.floor((y1 - y0) / paso) + 1), D = new Float32Array(w * h); let mn = 1e9, mx = -1e9;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = M.cota(x0 + i * paso, y0 + j * paso); D[j * w + i] = v; if (v < mn) mn = v; if (v > mx) mx = v; }
    return { w, h, paso, min: mn, max: mx, datos: D, caja: [x0, y0, x0 + (w - 1) * paso, y0 + (h - 1) * paso] };
  },
  /* RAW de 16 bits sin signo, little endian (Unity: «Raw», Unreal: «.r16»), normalizado entre min y max */
  r16(A) {
    const out = new Uint8Array(A.datos.length * 2), vista = new DataView(out.buffer);
    const k = A.max > A.min ? 65535 / (A.max - A.min) : 0;
    for (let i = 0; i < A.datos.length; i++) vista.setUint16(2 * i, Math.round((A.datos[i] - A.min) * k), true);
    return out;
  },
  /* los datos para que otro motor ponga su lógica: edificios, vías, árboles y lugares */
  escena(M, caja, op = {}) {
    const [x0, y0, x1, y1] = caja, dentro = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1, r1 = v => Math.round(v * 10) / 10, VN = {}; if (typeof VIA !== 'undefined') for (const [k, v] of Object.entries(VIA)) VN[v] = k.toLowerCase();
    const edificios = M.edificiosEn(x0, y0, x1, y1).filter(b => dentro(b.x, b.y)).slice(0, op.maxEdificios || 20000).map((b, i) => { const st = estiloEdificio(M, b); return { id: i, x: r1(b.x), y: r1(b.y), base: r1(M.cota(b.x, b.y)), alto: r1(b.h), huella: Array.from(Mundo.esquinas(b), r1), clase: b.clase || 'casa', muro: st.muro, techo: st.techo, plano: !!st.plano }; });
    const vias = this.viasEn(M, caja).map(v => ({ tipo: VN[v.k] || v.k, nombre: v.nombre || '', ancho: v.ancho, p: Array.from(v.p, r1) }));
    const arboles = Arboleda.en(M, x0, y0, x1, y1, op.maxArboles || 20000).map(t => ({ x: r1(t.x), y: r1(t.y), base: r1(M.cota(t.x, t.y)), especie: t.e, alto: r1(t.h), copa: r1(t.r * (Arboleda.ESPECIES[t.e] || {}).ancho || t.r) }));
    const lugares = (M.lugares || []).filter(l => dentro(l.x, l.y)).map(l => ({ nombre: l.nombre, x: r1(l.x), y: r1(l.y), tipo: l.dibujo || l.tipo || '' }));
    return { schema_version: 1, motor: 'Motor City ' + MC.version, mundo: (M.cfg && M.cfg.id) || '', nombre: (M.cfg && M.cfg.nombre) || '', unidades: 'metros', ejes: 'mundo: x oriente, y sur, h arriba · glTF: X = x, Y = h, Z = y', caja, edificios, vias, arboles, lugares };
  },
  // Recorte paramétrico de cada segmento. Un cruce también cuenta si ambos extremos quedan fuera.
  viasEn(M, caja) {
    const [x0,y0,x1,y1] = caja, resultado = [];
    for (const v of M.vias()) {
      let tramo = null;
      for (let i = 0; i+3 < v.p.length; i+=2) {
        const x=v.p[i], y=v.p[i+1], dx=v.p[i+2]-x, dy=v.p[i+3]-y;
        let ini=0, fin=1;
        for (const [p,q] of [[-dx,x-x0],[dx,x1-x],[-dy,y-y0],[dy,y1-y]]) {
          if (p<0) ini=Math.max(ini,q/p);
          else if (p>0) fin=Math.min(fin,q/p);
          else if (q<0) { fin=-1; break; }
        }
        if (ini>=fin || (!dx && !dy)) { tramo=null; continue; }
        if (!tramo || ini>0) { tramo={...v,p:[x+ini*dx,y+ini*dy]}; resultado.push(tramo); }
        tramo.p.push(x+fin*dx,y+fin*dy);
        if (fin<1) tramo=null;
      }
    }
    return resultado;
  },
  /* ---------- geometría ---------- */
  _malla() { return { p: [], n: [], c: [], i: [] }; },
  _v(m, x, y, z, nx, ny, nz, c) { m.p.push(x, y, z); m.n.push(nx, ny, nz); m.c.push(c[0], c[1], c[2]); return m.p.length / 3 - 1; },
  _tri(m, a, b, c) { m.i.push(a, b, c); },
  _terreno(M, A) {
    const m = this._malla(), { w, h, paso, datos } = A, [x0, y0] = A.caja, S = PAL_SUELO;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const x = x0 + i * paso, y = y0 + j * paso, hz = datos[j * w + i], hx = datos[j * w + Math.min(w - 1, i + 1)] - datos[j * w + Math.max(0, i - 1)], hy = datos[Math.min(h - 1, j + 1) * w + i] - datos[Math.max(0, j - 1) * w + i], nx = -hx / (2 * paso), nz = -hy / (2 * paso), L = Math.hypot(nx, 1, nz);
      const tt = M.suelo(x, y); let c = hex3(S[tt] || '#888'); if (tt === TT.WATER || tt === TT.CANAL) { const ag = Terreno.aguaEn(M, x, y); if (ag) { const Q = AGUA_COL[ag.tipo] || AGUA_COL.lago; c = mez3(Q[0], Q[1], clamp(ag.prof / Q[2], 0, 1)); } }
      this._v(m, x, hz, y, nx / L, 1 / L, nz / L, c);
    }
    for (let j = 0; j + 1 < h; j++) for (let i = 0; i + 1 < w; i++) { const a = j * w + i, b = a + 1, c = a + w, d = c + 1; this._tri(m, a, c, b); this._tri(m, b, c, d); }   // hacia arriba (+Y)
    return m;
  },
  _edificios(M, L) {
    const m = this._malla();
    for (const b of L) {
      const st = estiloEdificio(M, b), P = Mundo.esquinas(b), n = P.length >> 1, z0 = M.cota(b.x, b.y) - 1, z1 = z0 + 1 + b.h, cm = hex3(st.muro), ct = hex3(st.techo); let area = 0;
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; area += P[2 * i] * P[2 * j + 1] - P[2 * j] * P[2 * i + 1]; } const s = area > 0 ? 1 : -1;
      for (let i = 0; i < n; i++) {   // muros con su normal hacia afuera
        const j = (i + 1) % n, ax = P[2 * i], ay = P[2 * i + 1], bx = P[2 * j], by = P[2 * j + 1], ex = bx - ax, ey = by - ay, l = Math.hypot(ex, ey) || 1, nx = ey / l * s, nz = -ex / l * s;
        const a = this._v(m, ax, z0, ay, nx, 0, nz, cm), b2 = this._v(m, bx, z0, by, nx, 0, nz, cm), c = this._v(m, bx, z1, by, nx, 0, nz, cm), d = this._v(m, ax, z1, ay, nx, 0, nz, cm);
        if (s > 0) { this._tri(m, a, c, b2); this._tri(m, a, d, c); } else { this._tri(m, a, b2, c); this._tri(m, a, c, d); }
      }
      const r0 = m.p.length / 3; for (let i = 0; i < n; i++) this._v(m, P[2 * i], z1, P[2 * i + 1], 0, 1, 0, ct);   // techo en abanico
      for (let i = 1; i + 1 < n; i++) { if (s > 0) this._tri(m, r0, r0 + i + 1, r0 + i); else this._tri(m, r0, r0 + i, r0 + i + 1); }
    }
    return m;
  },
  _vias(M, L) {
    const m = this._malla(), V = PAL_VIA;
    for (const v of L) { const c = hex3(v.k <= 1 ? V.autopista : v.k <= 3 ? V.avenida : v.k === VIA.CICLO ? V.ciclo : v.k > 4 ? V.peatonal : V.asfalto), w = v.ancho / 2, P = v.p;
      for (let i = 0; i + 3 < P.length; i += 2) { const ax = P[i], ay = P[i + 1], bx = P[i + 2], by = P[i + 3], l = Math.hypot(bx - ax, by - ay); if (l < .1) continue; const nx = -(by - ay) / l * w, ny = (bx - ax) / l * w, ha = M.cota(ax, ay) + .08, hb = M.cota(bx, by) + .08;
        const a = this._v(m, ax + nx, ha, ay + ny, 0, 1, 0, c), b = this._v(m, ax - nx, ha, ay - ny, 0, 1, 0, c), cc = this._v(m, bx - nx, hb, by - ny, 0, 1, 0, c), d = this._v(m, bx + nx, hb, by + ny, 0, 1, 0, c);
        const up = ((ax - nx) - (ax + nx)) * ((by + ny) - (ay + ny)) - ((ay - ny) - (ay + ny)) * ((bx + nx) - (ax + nx)) > 0; if (up) { this._tri(m, a, cc, b); this._tri(m, a, d, cc); } else { this._tri(m, a, b, cc); this._tri(m, a, cc, d); } } }   // hacia arriba (+Y)
    return m;
  },
  _arboles(M, L) {
    const m = this._malla();
    for (const t of L) { const E = Arboleda.ESPECIES[t.e] || Arboleda.ESPECIES.urapan, z = M.cota(t.x, t.y), rC = t.r * E.ancho, ct = hex3(E.flor ? E.flor[1] : E.copa[1]), cb = hex3('#5a4433'), hc = t.h * .55, tr = Math.max(.15, t.r * .08);
      const caja = (x0, x1, y0, y1, h0, h1, c) => { const Q = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; for (let i = 0; i < 4; i++) { const [ax, ay] = Q[i], [bx, by] = Q[(i + 1) % 4], nx = by - ay, nz = -(bx - ax), l = Math.hypot(nx, nz) || 1; const a = this._v(m, ax, h0, ay, nx / l, 0, nz / l, c), b = this._v(m, bx, h0, by, nx / l, 0, nz / l, c), cc = this._v(m, bx, h1, by, nx / l, 0, nz / l, c), d = this._v(m, ax, h1, ay, nx / l, 0, nz / l, c); this._tri(m, a, cc, b); this._tri(m, a, d, cc); } };
      caja(t.x - tr, t.x + tr, t.y - tr, t.y + tr, z, z + hc + .5, cb);   // tronco
      const cy = z + hc + (t.h - hc) / 2, ry = (t.h - hc) / 2 + .3, V = [[rC, 0, 0], [-rC, 0, 0], [0, ry, 0], [0, -ry, 0], [0, 0, rC], [0, 0, -rC]], F = [[0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0], [4, 3, 0], [1, 3, 4], [5, 3, 1], [0, 3, 5]];   // copa: octaedro
      for (const f of F) { const P3 = f.map(k => [t.x + V[k][0], cy + V[k][1], t.y + V[k][2]]), u = [P3[1][0] - P3[0][0], P3[1][1] - P3[0][1], P3[1][2] - P3[0][2]], w2 = [P3[2][0] - P3[0][0], P3[2][1] - P3[0][1], P3[2][2] - P3[0][2]]; let nx = u[1] * w2[2] - u[2] * w2[1], ny = u[2] * w2[0] - u[0] * w2[2], nz = u[0] * w2[1] - u[1] * w2[0]; const cxm = (P3[0][0] + P3[1][0] + P3[2][0]) / 3 - t.x, cym = (P3[0][1] + P3[1][1] + P3[2][1]) / 3 - cy, czm = (P3[0][2] + P3[1][2] + P3[2][2]) / 3 - t.y, out = nx * cxm + ny * cym + nz * czm > 0, l = Math.hypot(nx, ny, nz) || 1; if (!out) { nx = -nx; ny = -ny; nz = -nz; } const ids = P3.map(q => this._v(m, q[0], q[1], q[2], nx / l, ny / l, nz / l, ct)); if (out) this._tri(m, ids[0], ids[1], ids[2]); else this._tri(m, ids[0], ids[2], ids[1]); }
    }
    return m;
  },
  /* ---------- glTF 2.0 binario (GLB) ---------- */
  glb(M, caja, op = {}) {
    const A = this.alturas(M, caja, op.paso || 4), [x0, y0, x1, y1] = caja, dentro = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
    const partes = [['terreno', this._terreno(M, A)], ['edificios', this._edificios(M, M.edificiosEn(x0, y0, x1, y1).filter(b => dentro(b.x, b.y)))], ['vias', this._vias(M, this.viasEn(M,caja))], ['arboles', this._arboles(M, Arboleda.en(M, x0, y0, x1, y1, op.maxArboles || 8000))]].filter(([, m]) => m.i.length);
    /* el origen en el centro de la caja (los motores pierden precisión lejos del origen) */
    const ox = (x0 + x1) / 2, oz = (y0 + y1) / 2, oy = A.min; for (const [, m] of partes) for (let k = 0; k < m.p.length; k += 3) { m.p[k] -= ox; m.p[k + 1] -= oy; m.p[k + 2] -= oz; }
    const trozos = [], bufferViews = [], accessors = [], meshes = [], nodes = []; let off = 0;
    const agregar = (arr, target) => { const b = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength); trozos.push(b); bufferViews.push({ buffer: 0, byteOffset: off, byteLength: b.byteLength, target }); off += b.byteLength; const pad = (4 - off % 4) % 4; if (pad) { trozos.push(new Uint8Array(pad)); off += pad; } return bufferViews.length - 1; };
    for (const [nombre, m] of partes) {
      const pos = new Float32Array(m.p), nor = new Float32Array(m.n), col = new Float32Array(m.c), idx = new Uint32Array(m.i), mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      for (let k = 0; k < pos.length; k += 3) for (let q = 0; q < 3; q++) { if (pos[k + q] < mn[q]) mn[q] = pos[k + q]; if (pos[k + q] > mx[q]) mx[q] = pos[k + q]; }
      const n = pos.length / 3, aP = accessors.push({ bufferView: agregar(pos, 34962), componentType: 5126, count: n, type: 'VEC3', min: mn, max: mx }) - 1, aN = accessors.push({ bufferView: agregar(nor, 34962), componentType: 5126, count: n, type: 'VEC3' }) - 1, aC = accessors.push({ bufferView: agregar(col, 34962), componentType: 5126, count: n, type: 'VEC3' }) - 1, aI = accessors.push({ bufferView: agregar(idx, 34963), componentType: 5125, count: idx.length, type: 'SCALAR' }) - 1;
      meshes.push({ name: nombre, primitives: [{ attributes: { POSITION: aP, NORMAL: aN, COLOR_0: aC }, indices: aI, material: 0 }] }); nodes.push({ name: nombre, mesh: meshes.length - 1 });
    }
    const json = { asset: { version: '2.0', generator: 'Motor City ' + MC.version + ' (MC.Exportar)', copyright: '© colaboradores de OpenStreetMap (ODbL) vía Overture Maps; relieve SRTM/NASA' }, scene: 0, scenes: [{ name: (M.cfg && M.cfg.nombre) || 'Motor City', nodes: nodes.map((_, i) => i) }], nodes, meshes, materials: [{ name: 'color_por_vertice', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 }, doubleSided: false }], buffers: [{ byteLength: off }], bufferViews, accessors, extras: { origen_mundo: [ox, oz], altura_base: oy, caja } };
    const enc = new TextEncoder(); let js = enc.encode(JSON.stringify(json)); const pj = (4 - js.length % 4) % 4; if (pj) { const t = new Uint8Array(js.length + pj); t.set(js); t.fill(0x20, js.length); js = t; }
    const total = 12 + 8 + js.length + 8 + off, out = new Uint8Array(total), dv = new DataView(out.buffer); let o = 0;
    dv.setUint32(o, 0x46546C67, true); dv.setUint32(o + 4, 2, true); dv.setUint32(o + 8, total, true); o += 12;
    dv.setUint32(o, js.length, true); dv.setUint32(o + 4, 0x4E4F534A, true); out.set(js, o + 8); o += 8 + js.length;
    dv.setUint32(o, off, true); dv.setUint32(o + 4, 0x004E4942, true); o += 8; for (const b of trozos) { out.set(b, o); o += b.byteLength; }
    return out;
  }
};
/* el estado vivo de un juego, serializable, para que otro motor lo dibuje (por WebSocket, postMessage o archivo) */
const Puente = {
  aGltf(x, y, h = 0) { return [x, h, y]; },
  instantanea(E, op = {}) {
    const r1 = v => Math.round((v || 0) * 100) / 100, J = E.jugador && E.jugador.cuerpo;
    return { schema_version: 1, t: r1(E.t), hora: E.reloj ? r1(E.reloj.hora) : null, clima: E.clima ? (E.clima.estado || null) : null, estilo: MC.estilo,
      jugador: J ? { x: r1(J.x), y: r1(J.y), z: r1((J.zPaso || 0) + (J.z || 0)), a: r1(J.a), v: r1(J.v), vehiculo: J.veh && J.veh.id, estado: J.estado || null, nadando: !!J.nadando } : null,
      vehiculos: (E.vehiculos || []).slice(0, op.max || 400).map(v => ({ x: r1(v.x), y: r1(v.y), a: r1(v.a), tipo: v.tipo || v.id || '' })), peatones: (E.peatones || []).slice(0, op.max || 400).map(p => ({ x: r1(p.x), y: r1(p.y), a: r1(p.a) })) };
  }
};
MC.Exportar = Exportar; MC.Puente = Puente;
