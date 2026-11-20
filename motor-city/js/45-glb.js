/* =====================================================================
   MODELOS GLB (4.0) · el mundo único 3D lee modelos glTF 2.0 binarios (.glb), sin librerías
   Para los 42 modelos de bloqueo de Codex («Turno Cero», CC0; juegos/getaway/arte3d): vehículos, personas,
   tecnología, edificios y escenarios, en metros y con color por vértice. Un juego los mete en su HTML
   ("modelos" en juego.json → var MC_MODELOS = { id: 'base64' }) y la vista 3D los usa en vez de las cajas:
   carros del tráfico, patrullas, camionetas de la banda, el carro del jugador y lo que el juego ponga en E.modelos3d.
   - Lee POSITION, COLOR_0 (u8 normalizado o float) e índices (u16/u32) de la primera malla; sin texturas ni huesos.
   - Color dominante = carrocería: se puede teñir por instancia (cada carro del tráfico con su color).
   - Ejes: glTF Y arriba. Los carros miran hacia +X; las personas, hacia +Z (op.frente).
   - Rendimiento: normales y colores precalculados; por instancia solo se gira, se escala y se copia. Lejos, cajas.
   Uso: MC.Modelos.registrar('vehiculo_sedan', base64); malla.modelo(MC.Modelos.get('vehiculo_sedan'), x, y, z, a, { k: 1, tinte: '#7a1f1f' })
   ===================================================================== */
const Modelos = {
  L: new Map(), lejos: 140,
  tiene(id) { return this.L.has(id); },
  get(id) { return this.L.get(id) || null; },
  /* GLB (ArrayBuffer, Uint8Array o base64) → { tris, n, bounds, frente } */
  leer(fuente, op = {}) {
    let u8 = fuente; if (typeof fuente === 'string') u8 = Modelos._b64(fuente); else if (fuente instanceof ArrayBuffer) u8 = new Uint8Array(fuente);
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); if (dv.getUint32(0, true) !== 0x46546C67) throw new Error('no es GLB');
    let o = 12, json = null, bin = null;
    while (o < u8.byteLength) { const len = dv.getUint32(o, true), tipo = dv.getUint32(o + 4, true), d = u8.subarray(o + 8, o + 8 + len); if (tipo === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(d)); else if (tipo === 0x004E4942) bin = d; o += 8 + len; }
    if (!json || !bin) throw new Error('GLB sin JSON o sin BIN');
    const pr = json.meshes[0].primitives[0], acc = i => { const A = json.accessors[i], V = json.bufferViews[A.bufferView], off = (V.byteOffset || 0) + (A.byteOffset || 0), n = A.count * ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[A.type]), b = bin.buffer, bo = bin.byteOffset + off;
      const T = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }[A.componentType]; const copia = new Uint8Array(n * T.BYTES_PER_ELEMENT); copia.set(new Uint8Array(b, bo, n * T.BYTES_PER_ELEMENT)); return { a: new T(copia.buffer), A }; };
    const P = acc(pr.attributes.POSITION).a, Cc = pr.attributes.COLOR_0 != null ? acc(pr.attributes.COLOR_0) : null, I = pr.indices != null ? acc(pr.indices).a : null;
    const nv = P.length / 3, comp = Cc ? (Cc.A.type === 'VEC4' ? 4 : 3) : 0, norm = Cc && Cc.A.componentType === 5121 ? 1 / 255 : 1;
    const col = i => Cc ? [Cc.a[i * comp] * norm, Cc.a[i * comp + 1] * norm, Cc.a[i * comp + 2] * norm] : [.6, .6, .6];
    const idx = I || Uint32Array.from({ length: nv }, (_, i) => i), nt = idx.length / 3, T = new Float32Array(nt * 21), cuenta = new Map();
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (let t = 0; t < nt; t++) {
      const a = idx[t * 3], b = idx[t * 3 + 1], c = idx[t * 3 + 2], o2 = t * 21;
      for (const [k, v] of [[0, a], [1, b], [2, c]]) { for (let j = 0; j < 3; j++) { const q = P[v * 3 + j]; T[o2 + k * 3 + j] = q; if (q < mn[j]) mn[j] = q; if (q > mx[j]) mx[j] = q; } }
      const ux = T[o2 + 3] - T[o2], uy = T[o2 + 4] - T[o2 + 1], uz = T[o2 + 5] - T[o2 + 2], vx = T[o2 + 6] - T[o2], vy = T[o2 + 7] - T[o2 + 1], vz = T[o2 + 8] - T[o2 + 2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; T[o2 + 9] = nx / l; T[o2 + 10] = ny / l; T[o2 + 11] = nz / l;
      const cc = col(a); T[o2 + 12] = cc[0]; T[o2 + 13] = cc[1]; T[o2 + 14] = cc[2]; const key = Math.round(cc[0] * 255) + ',' + Math.round(cc[1] * 255) + ',' + Math.round(cc[2] * 255); cuenta.set(key, (cuenta.get(key) || 0) + l / 2);   /* por área, no por número de triángulos */
      T[o2 + 15] = 0;   /* 1 = carrocería (se tiñe) */
    }
    /* normales hacia afuera (la luz las necesita así; el material es de dos caras) */
    const cx = (mn[0] + mx[0]) / 2, cy = (mn[1] + mx[1]) / 2, cz = (mn[2] + mx[2]) / 2;
    for (let t = 0; t < nt; t++) { const o2 = t * 21, gx = (T[o2] + T[o2 + 3] + T[o2 + 6]) / 3 - cx, gy = (T[o2 + 1] + T[o2 + 4] + T[o2 + 7]) / 3 - cy, gz = (T[o2 + 2] + T[o2 + 5] + T[o2 + 8]) / 3 - cz; if (gx * T[o2 + 9] + gy * T[o2 + 10] + gz * T[o2 + 11] < 0) { T[o2 + 9] = -T[o2 + 9]; T[o2 + 10] = -T[o2 + 10]; T[o2 + 11] = -T[o2 + 11]; } }
    /* la carrocería: el color con más área (las llantas tienen muchos triángulos pequeños) */
    let cuerpo = null, max = 0; for (const [k, n] of cuenta) { const [r, g, b] = k.split(',').map(Number); if (n > max) { max = n; cuerpo = k; } }
    if (cuerpo) for (let t = 0; t < nt; t++) { const o2 = t * 21, key = Math.round(T[o2 + 12] * 255) + ',' + Math.round(T[o2 + 13] * 255) + ',' + Math.round(T[o2 + 14] * 255); if (key === cuerpo) T[o2 + 15] = 1; }
    return { tris: T, n: nt, bounds: [mn, mx], frente: op.frente || 'x', largo: mx[0] - mn[0], ancho: mx[2] - mn[2], alto: mx[1] - mn[1] };
  },
  registrar(id, fuente, op = {}) { try { const m = Modelos.leer(fuente, Object.assign({ frente: /^personaje_/.test(id) ? 'z' : 'x' }, op)); m.id = id; Modelos.L.set(id, m); return m; } catch (e) { MC.falla('modelo ' + id, e); return null; } },
  /* todos los de un paquete { id: base64 } */
  paquete(P) { let n = 0; for (const [id, b] of Object.entries(P || {})) if (Modelos.registrar(id, b)) n++; return n; },
  _b64(s) { if (typeof atob === 'function') { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; } return new Uint8Array(Buffer.from(s, 'base64')); },
  /* qué modelo le toca a un vehículo del tráfico (el juego lo puede cambiar) */
  vehiculo(v) {
    const t = v.tipo, id = v.modelo || (v.sirena ? 'vehiculo_police' : v.bando === 'banda' ? 'vehiculo_suv' : t === 'taxi' ? 'vehiculo_taxi' : t === 'moto' ? 'vehiculo_motocicleta' : t === 'camion' || t === 'buseta' ? 'vehiculo_van' : t === 'bici' ? null : 'vehiculo_sedan');
    return id && Modelos.L.get(id) || null;
  }
};
/* un modelo en la malla: posición GL relativa (x, y = altura, z = sur), rumbo a del mundo; escala k o el largo deseado */
Malla.prototype.modelo = function (Mo, x, y, z, a, op = {}) {
  const T = Mo.tris, n = Mo.n, ca = Math.cos(a), sa = Math.sin(a), d = this.d, fz = Mo.frente === 'z';
  const k = op.k || (op.largo ? op.largo / (fz ? Mo.ancho : Mo.largo) : 1), tin = op.tinte ? hex3(op.tinte) : null, osc = op.oscuro || 0, e = op.e || 0, ky = op.ky || k;
  for (let t = 0; t < n; t++) {
    const o = t * 21, cuerpo = T[o + 15] === 1, r0 = cuerpo && tin ? tin[0] : T[o + 12], g0 = cuerpo && tin ? tin[1] : T[o + 13], b0 = cuerpo && tin ? tin[2] : T[o + 14], m = 1 - osc, r = r0 * m, g = g0 * m, b = b0 * m;
    const nu = fz ? T[o + 11] : T[o + 9], nv = fz ? -T[o + 9] : T[o + 11], nx = nu * ca - nv * sa, nz = nu * sa + nv * ca, ny = T[o + 10];
    for (let j = 0; j < 3; j++) { const px = T[o + j * 3], py = T[o + j * 3 + 1], pz = T[o + j * 3 + 2], u = (fz ? pz : px) * k, v = (fz ? -px : pz) * k; d.push(x + u * ca - v * sa, y + py * ky, z + u * sa + v * ca, nx, ny, nz, r, g, b, e); }
  }
};
MC.Modelos = Modelos;
