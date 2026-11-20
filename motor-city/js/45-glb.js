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
   - PIEL Y ANIMACIÓN (glTF skin + animations, p. ej. los actores de Codex con 12 huesos y 8 clips): Modelos.posar()
     calcula la pose de un clip en el tiempo t (traslación y escala lineales, rotación con nlerp) y deforma los vértices
     en la CPU (4 huesos por vértice). Las poses se guardan por cuadro (15 por segundo) para no recalcular.
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
    const pr = json.meshes[0].primitives[0], acc = i => { const A = json.accessors[i], V = json.bufferViews[A.bufferView], off = (V.byteOffset || 0) + (A.byteOffset || 0), n = A.count * ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT3: 9, MAT4: 16 }[A.type]), b = bin.buffer, bo = bin.byteOffset + off;
      const T = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }[A.componentType]; const copia = new Uint8Array(n * T.BYTES_PER_ELEMENT); copia.set(new Uint8Array(b, bo, n * T.BYTES_PER_ELEMENT)); return { a: new T(copia.buffer), A }; };
    const P = acc(pr.attributes.POSITION).a, Cc = pr.attributes.COLOR_0 != null ? acc(pr.attributes.COLOR_0) : null, I = pr.indices != null ? acc(pr.indices).a : null;
    /* piel: huesos, pesos, matrices de enlace y animaciones (si las hay) */
    let piel = null;
    if (pr.attributes.JOINTS_0 != null && pr.attributes.WEIGHTS_0 != null && json.skins && json.skins.length) {
      const Jt = acc(pr.attributes.JOINTS_0), Wt = acc(pr.attributes.WEIGHTS_0), sk = json.skins[0], wn = Wt.A.componentType === 5121 ? 1 / 255 : Wt.A.componentType === 5123 ? 1 / 65535 : 1;
      const nodos = json.nodes.map(n => ({ t: n.translation || [0, 0, 0], r: n.rotation || [0, 0, 0, 1], s: n.scale || [1, 1, 1], hijos: n.children || [] })), padre = new Int32Array(nodos.length).fill(-1);
      nodos.forEach((n, i) => n.hijos.forEach(h => { padre[h] = i; }));
      const anim = {}; for (const A of json.animations || []) { let dur = 0; const canales = A.channels.map(ch => { const S = A.samplers[ch.sampler], ti = acc(S.input).a, va = acc(S.output).a; dur = Math.max(dur, ti[ti.length - 1] || 0); return { nodo: ch.target.node, path: ch.target.path, t: ti, v: va, paso: ch.target.path === 'rotation' ? 4 : 3 }; }); anim[A.name || ('clip' + Object.keys(anim).length)] = { dur: dur || 1, canales }; }
      piel = { P, C: Cc, comp: Cc ? (Cc.A.type === 'VEC4' ? 4 : 3) : 0, norm: Cc && Cc.A.componentType === 5121 ? 1 / 255 : 1, idx: I, J: Jt.a, W: Float32Array.from(Wt.a, x => x * wn), joints: sk.joints, ibm: sk.inverseBindMatrices != null ? acc(sk.inverseBindMatrices).a : null, nodos, padre, anim, cache: new Map() };
    }
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
    /* faros y luces traseras de los vehículos (se encienden de noche): blanco cálido adelante (+X), rojo atrás */
    if (mx[0] - mn[0] > 2 && mx[1] - mn[1] < 3.2) for (let t = 0; t < nt; t++) { const o2 = t * 21, r = T[o2 + 12], g = T[o2 + 13], b = T[o2 + 14], gx = (T[o2] + T[o2 + 3] + T[o2 + 6]) / 3;
      if (gx > mx[0] - .12 && r > .7 && g > .65 && b > .6) T[o2 + 15] = 2; else if (gx < mn[0] + .12 && r > .6 && g < .45 && b < .4) T[o2 + 15] = 3; }
    return { tris: T, n: nt, bounds: [mn, mx], frente: op.frente || 'x', largo: mx[0] - mn[0], ancho: mx[2] - mn[2], alto: mx[1] - mn[1], piel, clips: piel ? Object.keys(piel.anim) : [] };
  },
  registrar(id, fuente, op = {}) { try { const m = Modelos.leer(fuente, Object.assign({ frente: /_rig$/.test(id) ? '-z' : /^personaje_/.test(id) ? 'z' : 'x' }, op)); m.id = id; Modelos.L.set(id, m); return m; } catch (e) { MC.falla('modelo ' + id, e); return null; } },
  /* todos los de un paquete { id: base64 } */
  paquete(P) { let n = 0; for (const [id, b] of Object.entries(P || {})) if (Modelos.registrar(id, b)) n++; return n; },
  /* la pose de un clip en el tiempo t → triángulos con el mismo formato que Mo.tris (en caché por cuadro de 1/15 s) */
  posar(Mo, clip, t = 0) {
    const S = Mo.piel; if (!S) return Mo.tris; const A = S.anim[clip] || S.anim[Object.keys(S.anim)[0]]; if (!A) return Mo.tris;
    const f = Math.floor(((t % A.dur) + A.dur) % A.dur * 15), clave = (clip || '') + ':' + f; let T = S.cache.get(clave); if (T) return T;
    const tt = f / 15, N = S.nodos, L = N.map(n => ({ t: n.t.slice(), r: n.r.slice(), s: n.s.slice() }));
    for (const c of A.canales) { const ti = c.t, k = c.paso; let i = 0; while (i < ti.length - 2 && ti[i + 1] < tt) i++; const u = ti.length > 1 ? clamp((tt - ti[i]) / ((ti[i + 1] - ti[i]) || 1), 0, 1) : 0, a = i * k, b = Math.min(ti.length - 1, i + 1) * k, o = L[c.nodo][c.path === 'translation' ? 't' : c.path === 'rotation' ? 'r' : 's'];
      if (!o) continue; let dot = 0; if (k === 4) for (let j = 0; j < 4; j++) dot += c.v[a + j] * c.v[b + j]; const sg = dot < 0 ? -1 : 1; for (let j = 0; j < k; j++) o[j] = c.v[a + j] + (c.v[b + j] * (k === 4 ? sg : 1) - c.v[a + j]) * u; if (k === 4) { const l = Math.hypot(o[0], o[1], o[2], o[3]) || 1; for (let j = 0; j < 4; j++) o[j] /= l; } }
    const G = new Array(N.length), glob = i => { if (G[i]) return G[i]; const m = m4trs(L[i].t, L[i].r, L[i].s); return (G[i] = S.padre[i] >= 0 ? m4mul(glob(S.padre[i]), m) : m); };
    const JM = S.joints.map((nd, j) => S.ibm ? m4mul(glob(nd), S.ibm.subarray(j * 16, j * 16 + 16)) : glob(nd));
    const nv = S.P.length / 3, V = new Float32Array(nv * 3);
    for (let v = 0; v < nv; v++) { const x = S.P[v * 3], y = S.P[v * 3 + 1], z = S.P[v * 3 + 2]; let X = 0, Y = 0, Z = 0; for (let k = 0; k < 4; k++) { const w = S.W[v * 4 + k]; if (!w) continue; const m = JM[S.J[v * 4 + k]]; X += w * (m[0] * x + m[4] * y + m[8] * z + m[12]); Y += w * (m[1] * x + m[5] * y + m[9] * z + m[13]); Z += w * (m[2] * x + m[6] * y + m[10] * z + m[14]); } V[v * 3] = X; V[v * 3 + 1] = Y; V[v * 3 + 2] = Z; }
    T = Mo.tris.slice(); const idx = S.idx || Uint32Array.from({ length: nv }, (_, i) => i), cx = (Mo.bounds[0][0] + Mo.bounds[1][0]) / 2, cy = (Mo.bounds[0][1] + Mo.bounds[1][1]) / 2, cz = (Mo.bounds[0][2] + Mo.bounds[1][2]) / 2;
    for (let q = 0; q < Mo.n; q++) { const o = q * 21; for (let k = 0; k < 3; k++) { const vi = idx[q * 3 + k]; T[o + k * 3] = V[vi * 3]; T[o + k * 3 + 1] = V[vi * 3 + 1]; T[o + k * 3 + 2] = V[vi * 3 + 2]; }
      const ux = T[o + 3] - T[o], uy = T[o + 4] - T[o + 1], uz = T[o + 5] - T[o + 2], vx = T[o + 6] - T[o], vy = T[o + 7] - T[o + 1], vz = T[o + 8] - T[o + 2]; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const gx = (T[o] + T[o + 3] + T[o + 6]) / 3 - cx, gy = (T[o + 1] + T[o + 4] + T[o + 7]) / 3 - cy, gz = (T[o + 2] + T[o + 5] + T[o + 8]) / 3 - cz, sgn = gx * nx + gy * ny + gz * nz < 0 ? -1 : 1; T[o + 9] = nx * sgn; T[o + 10] = ny * sgn; T[o + 11] = nz * sgn; }
    if (S.cache.size > 400) S.cache.clear(); S.cache.set(clave, T); return T;
  },
  _b64(s) { if (typeof atob === 'function') { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; } return new Uint8Array(Buffer.from(s, 'base64')); },
  /* qué modelo le toca a un vehículo del tráfico (el juego lo puede cambiar) */
  vehiculo(v) {
    const t = v.tipo, id = v.modelo || (v.sirena ? 'vehiculo_police' : v.bando === 'banda' ? 'vehiculo_suv' : t === 'taxi' ? 'vehiculo_taxi' : t === 'moto' ? 'vehiculo_motocicleta' : t === 'camion' || t === 'buseta' ? 'vehiculo_van' : t === 'bici' ? null : 'vehiculo_sedan');
    return id && Modelos.L.get(id) || null;
  }
};
/* un modelo en la malla: posición GL relativa (x, y = altura, z = sur), rumbo a del mundo; escala k o el largo deseado */
Malla.prototype.modelo = function (Mo, x, y, z, a, op = {}) {
  const T = op.clip && Mo.piel ? Modelos.posar(Mo, op.clip, op.t || 0) : Mo.tris, n = Mo.n, ca = Math.cos(a), sa = Math.sin(a), d = this.d, fz = Mo.frente === 'z' || Mo.frente === '-z', inv = Mo.frente === '-z' ? -1 : 1;
  const k = op.k || (op.largo ? op.largo / (fz ? Mo.ancho : Mo.largo) : 1), tin = op.tinte ? hex3(op.tinte) : null, D = op.dano, ky = op.ky || k;
  /* 4.0.x: de noche cada modelo tiene un mínimo de luz propia (el sombreador solo usa la emisión de noche) y los faros se encienden */
  const e0 = op.e != null ? op.e : Modelos.brillo, osc = Math.min(.8, (op.oscuro || 0) + (D ? Math.max(D.f || 0, D.b || 0, D.l || 0, D.r || 0) * .25 : 0));
  /* abolladuras por zona (frente, atrás, izquierda, derecha; 0–1): los vértices de esa punta se meten hacia adentro y bajan un poco */
  const L2 = (fz ? Mo.ancho : Mo.largo) * k / 2, W2 = (fz ? Mo.largo : Mo.ancho) * k / 2;
  for (let t = 0; t < n; t++) {
    const o = t * 21, fl = T[o + 15], cuerpo = fl === 1, r0 = cuerpo && tin ? tin[0] : T[o + 12], g0 = cuerpo && tin ? tin[1] : T[o + 13], b0 = cuerpo && tin ? tin[2] : T[o + 14], m = 1 - osc, r = r0 * m, g = g0 * m, b = b0 * m, e = fl >= 2 ? (D && ((fl === 2 && D.f > .6) || (fl === 3 && D.b > .6)) ? 0 : 1) : e0;
    const nu = (fz ? T[o + 11] : T[o + 9]) * inv, nv = (fz ? -T[o + 9] : T[o + 11]) * inv, nx = nu * ca - nv * sa, nz = nu * sa + nv * ca, ny = T[o + 10];
    for (let j = 0; j < 3; j++) { const px = T[o + j * 3], py = T[o + j * 3 + 1], pz = T[o + j * 3 + 2]; let u = (fz ? pz : px) * k * inv, v = (fz ? -px : pz) * k * inv, h = py * ky;
      if (D) { const pf = u - L2 * .45, pb = -L2 * .45 - u, pl = v - W2 * .35, pr = -W2 * .35 - v;
        if (pf > 0 && D.f) { u -= pf * D.f * .55; h -= pf * D.f * .18; } if (pb > 0 && D.b) { u += pb * D.b * .55; h -= pb * D.b * .14; }
        if (pl > 0 && D.l) v -= pl * D.l * .6; if (pr > 0 && D.r) v += pr * D.r * .6; }
      d.push(x + u * ca - v * sa, y + h, z + u * sa + v * ca, nx, ny, nz, r, g, b, e); }
  }
};
Modelos.brillo = .32;
/* matrices 4×4 en columnas (glTF) */
function m4trs(t, q, sc) { const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  return [(1 - (yy + zz)) * sc[0], (xy + wz) * sc[0], (xz - wy) * sc[0], 0, (xy - wz) * sc[1], (1 - (xx + zz)) * sc[1], (yz + wx) * sc[1], 0, (xz + wy) * sc[2], (yz - wx) * sc[2], (1 - (xx + yy)) * sc[2], 0, t[0], t[1], t[2], 1]; }
function m4mul(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; }
MC.Modelos = Modelos;
