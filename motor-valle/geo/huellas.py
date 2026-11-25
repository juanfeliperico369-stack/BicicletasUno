"""HUELLAS SANEADAS PARA JUEGA ENCICLA (Motor del Valle 1.3.1) → src/data/edificios.bin + edificios.json, y edificios-ligero.bin + .json
   Toma la verdad compartida de geo/sanear.py (salida/sanear/huellas.parquet) y la deja lista para el juego:
     · por trozos de 160 m (la clave "cx,cy", c = floor(x / 160)), en metros del mapa (px = m × 1,6);
     · el mismo esquema de flujos que edificios.js de El Metro: posiciones (medios metros, deltas zigzag-varint en orden de Hilbert),
       medidas, ángulo, pisos, tipo (4 bits; 16 polígono, 32 pisos conocidos, 64 de OSM, 128 recortada) y polígonos; y al final
       zb (zócalo: nibble alto = ceil((suelo en el centro - zMin) / 0,5 m), bajo = ceil((zMax - suelo) / 0,5 m)) y marca
       (bit 0: casa confiable marcada para revisar; bits 1 a 3: bioma del trozo);
     · guarda: ya redondeada como la leería el juego, ninguna pisa las vías que EnCicla dibuja (vias.bin, regla A con
       ciclorrutas), el Metroplús, el tranvía ni el agua. Si alguna no pasa, se recorta exacto (y lleva el bit 128).
   1.3.1 · LA VERSIÓN LIGERA QUE LEE EL JUEGO (edificios-ligero.bin, la que tools/build.js mete en el HTML; src/js/99z-huellas.js):
     el juego dibuja cada huella como un rectángulo de 4 esquinas (el mismo contrato de sus lotes), así que las huellas con polígono
     (recortadas o irregulares, el 17 %) se cambian por los rectángulos más grandes que caben adentro de su polígono (uno o dos), con
     su mismo ángulo y ya cuantizados como los lee el juego: ninguno vuelve a pisar la calle (se comprueba contra los corredores). Flujos:
     índice (n, bytes de posiciones, bytes de medidas), posiciones y medidas cada 0,25 m, ángulo, pisos, tipo (16 = sigue el edificio
     anterior: el segundo rectángulo de una huella, como el otro brazo de una L) y marca.
   Los pisos son los de Overture (num_floors o height / 3); 0 = sin dato (el juego ya estima la altura por celda con «hg»).
   Uso: python3 motor-valle/geo/huellas.py --encicla CARPETA_SRC_DATA      (todo: el completo y el ligero)
        python3 motor-valle/geo/huellas.py --ligero CARPETA_SRC_DATA       (solo el ligero, a partir de edificios.bin)
"""
import json, math, os, sys, time, zlib, struct
import numpy as np
import shapely
import shapely.ops
from shapely import STRtree

HERE = os.path.dirname(os.path.abspath(__file__)); MOTOR = os.path.dirname(HERE); sys.path.insert(0, HERE)
SAN = os.environ.get('OUT') or os.path.join(MOTOR, 'salida', 'sanear')
CFG = json.load(open(os.path.join(HERE, 'anchos.json'), encoding='utf-8'))
R, Q = float(CFG['trozo_m']), 2.0
KINDS = ['casa', 'edificio', 'torre', 'nave', 'educativo', 'salud', 'iglesia', 'civico', 'comercio', 'deporte', 'techo', 'invernadero', 'tanque', 'transporte', 'parqueadero', 'rural']
CK = {'house': 0, 'detached': 0, 'semidetached_house': 0, 'terrace': 0, 'bungalow': 0, 'apartments': 1, 'residential': 0, 'commercial': 8, 'retail': 8, 'office': 8, 'supermarket': 8, 'hotel': 8, 'kiosk': 8,
      'industrial': 3, 'warehouse': 3, 'manufacture': 3, 'factory': 3, 'hangar': 3, 'school': 4, 'university': 4, 'college': 4, 'kindergarten': 4, 'library': 4, 'hospital': 5, 'clinic': 5,
      'church': 6, 'chapel': 6, 'cathedral': 6, 'temple': 6, 'religious': 6, 'civic': 7, 'public': 7, 'government': 7, 'fire_station': 7, 'police': 7, 'stadium': 9, 'grandstand': 9, 'sports_hall': 9,
      'roof': 10, 'shelter': 10, 'carport': 10, 'canopy': 10, 'greenhouse': 11, 'storage_tank': 12, 'silo': 12, 'train_station': 13, 'transportation': 13, 'garage': 14, 'garages': 14, 'parking': 14,
      'farm': 15, 'farm_auxiliary': 15, 'barn': 15, 'stable': 15, 'shed': 15, 'cabin': 15, 'hut': 15}
F_EXT = 1 / math.cos(1.5 * math.pi / 32); T0 = time.time()   # el búfer de shapely queda por fuera del círculo de verdad (GEOS redondea los segmentos de cada arco)
def log(*a): print(f'[{time.time() - T0:6.1f} s]', *a, flush=True)


def hilbert(x, y, n=512):
    d, s = 0, n // 2
    while s > 0:
        rx = 1 if (x & s) else 0; ry = 1 if (y & s) else 0; d += s * s * ((3 * rx) ^ ry)
        if ry == 0:
            if rx == 1: x, y = s - 1 - x, s - 1 - y
            x, y = y, x
        s //= 2
    return d
def varint(v, out):
    v = ((v << 1) ^ (v >> 63)) & ((1 << 64) - 1)
    while True:
        b = v & 127; v >>= 7
        if v: out.append(b | 128)
        else: out.append(b); return
def uvarint(v, out):
    while True:
        b = v & 127; v >>= 7
        if v: out.append(b | 128)
        else: out.append(b); return


def corredores(dst, M):
    """los corredores de EnCicla (polígonos de shapely): sus vías (vias.bin) con la regla A, el Metroplús, el tranvía y el agua"""
    import pyarrow.parquet as pq
    TILE = M['tile']; raw = zlib.decompress(open(os.path.join(dst, 'vias.bin'), 'rb').read(), -15); n = struct.unpack_from('<I', raw, 0)[0]; o = 4; U = TILE / M['vq']
    pz = []
    def trozos(P, paso=40.0):
        L = shapely.LineString(P); m = max(1, int(math.ceil(L.length / paso)))
        return [L] if m == 1 else [shapely.ops.substring(L, L.length * i / m, L.length * (i + 1) / m) for i in range(m)]
    DEFW = {int(k): v for k, v in CFG['ancho_de_clase_m'].items()}; AND = {int(k): v for k, v in CFG['reglas']['A']['anden_m'].items()}
    for i in range(n):
        k, nm, nom, w2, np_ = struct.unpack_from('<BHHBH', raw, o); o += 8; q = np.frombuffer(raw[o:o + np_ * 4], '<i2').reshape(-1, 2).astype(np.int64).cumsum(0); o += np_ * 4
        if not 1 <= k <= 7 or np_ < 2: continue
        r = max(1, (w2 / 2 or DEFW[k]) / 2 + AND[k])
        for t in trozos(q * U): pz.append(t.buffer(r * F_EXT, quad_segs=8))
    mp = os.path.join(dst, 'metroplus.json')
    if os.path.exists(mp):
        for c in json.load(open(mp, encoding='utf-8'))['corredores'].values():
            for t in trozos(np.array(c).reshape(-1, 2)): pz.append(t.buffer(CFG['transporte_a_nivel_m']['brt'] * F_EXT, quad_segs=8))
    T_ = M.get('metro', {}).get('T')
    if T_:
        for t in trozos(np.array(T_['p']).reshape(-1, 2) / 4 * TILE): pz.append(t.buffer(CFG['transporte_a_nivel_m']['tram'] * F_EXT, quad_segs=8))
    for w in pq.read_table(os.path.join(SAN, 'agua.parquet')).to_pydict()['wkb']: pz.append(shapely.from_wkb(w))
    return np.array(pz, dtype=object)


def encicla(dst):
    import pyarrow.parquet as pq
    M = json.load(open(os.path.join(dst, 'valle.json'), encoding='utf-8')); TILE = M['tile']; W, H = M['W'] * TILE, M['H'] * TILE
    T = pq.read_table(os.path.join(SAN, 'huellas.parquet')).to_pydict(); N = len(T['id'])
    G = np.array(shapely.from_wkb(T['wkb']), dtype=object); A = shapely.area(G); anc = np.column_stack([T['ax'], T['ay']])
    forma = np.array(T['forma']); RX = np.column_stack([np.array([v if v is not None else np.nan for v in T[c]], float) for c in ('rx', 'ry', 'rl', 'rw', 'ra')])
    recort = np.array(T['recortado'], bool); marc = np.array(T['marcado'], bool); bioma = np.array(T['bioma'], np.uint8); src = np.array(T['src'], dtype=object)
    nfl = np.array([v if v is not None else np.nan for v in T['num_floors']], float); hgt = np.array([v if v is not None else np.nan for v in T['height']], float)
    pis = np.where(~np.isnan(nfl) & (nfl > 0), nfl, np.where(~np.isnan(hgt) & (hgt > 0), np.round(hgt / 3), 0)).clip(0, 255).astype(int)
    kind = np.array([CK.get(c or '', 1 if p >= 4 else 0) for c, p in zip(T['class'], pis)], int); kind[(kind == 0) & (pis >= 4)] = 1; kind[(kind == 1) & (pis >= 10)] = 2
    log('huellas saneadas', N)
    pz = corredores(dst, M); ARB = STRtree(pz); log('corredores de EnCicla:', len(pz), 'trozos')
    nx, ny = int(math.ceil(W / R)), int(math.ceil(H / R))
    def cuant(g, rect, an_):
        """cuantiza como la leería el juego -> (campos, geometría decodificada)"""
        if rect is not None:
            cx, cy, hl, hw, an = rect; rx, ry = min(nx - 1, max(0, int(cx // R))), min(ny - 1, max(0, int(cy // R)))
            X, Y = int(min(511, max(0, round((cx - rx * R) * Q)))), int(min(511, max(0, round((cy - ry * R) * Q))))
            dA, dB = int(min(255, max(1, math.floor(hl * Q)))), int(min(255, max(1, math.floor(hw * Q)))); a = int(an / math.pi * 128) % 128
            x, y = rx * R + X / Q, ry * R + Y / Q; L1, L2 = max(.5, dA / Q), max(.5, dB / Q); aa = (a + .5) * math.pi / 128; ux, uy = math.cos(aa), math.sin(aa)
            P = shapely.Polygon([(x - ux * L1 + uy * L2, y - uy * L1 - ux * L2), (x + ux * L1 + uy * L2, y + uy * L1 - ux * L2), (x + ux * L1 - uy * L2, y + uy * L1 + ux * L2), (x - ux * L1 - uy * L2, y - uy * L1 + ux * L2)])
            return {'rx': rx, 'ry': ry, 'X': X, 'Y': Y, 'dA': dA, 'dB': dB, 'a': a, 'J': None}, P
        ex = np.asarray(g.exterior.coords)[:-1]
        if len(ex) > 120: ex = np.asarray(g.simplify(1.0, preserve_topology=True).exterior.coords)[:-1]
        c = g.centroid; c = (c.x, c.y) if g.contains(c) else tuple(g.point_on_surface().coords[0])
        rx, ry = min(nx - 1, max(0, int(c[0] // R))), min(ny - 1, max(0, int(c[1] // R)))
        X, Y = int(min(511, max(0, round((c[0] - rx * R) * Q)))), int(min(511, max(0, round((c[1] - ry * R) * Q))))
        J = np.round((ex - [rx * R, ry * R]) * Q).astype(int); k_ = np.ones(len(J), bool); k_[1:] = np.any(np.diff(J, axis=0) != 0, axis=1); J = J[k_]
        if len(J) < 3: return None, None
        P = shapely.make_valid(shapely.Polygon(J / Q + [rx * R, ry * R]))
        if P.geom_type != 'Polygon': return None, None
        o_ = shapely.oriented_envelope(P); c4 = np.asarray(o_.exterior.coords)[:4]; ea, eb = c4[1] - c4[0], c4[2] - c4[1]; la, lb = math.hypot(*ea), math.hypot(*eb)
        if la < lb: ea, la, lb = eb, lb, la
        return {'rx': rx, 'ry': ry, 'X': X, 'Y': Y, 'dA': int(min(255, math.ceil(la / 2 * Q))), 'dB': int(min(255, math.ceil(lb / 2 * Q))), 'a': int((math.atan2(ea[1], ea[0]) % math.pi) / math.pi * 128) % 128, 'J': J}, P
    def libre(P): return not any(pz[j].intersects(P) for j in ARB.query(P))
    def obb(g):
        o_ = shapely.oriented_envelope(g); c4 = np.asarray(o_.exterior.coords)[:4]; ea, eb = c4[1] - c4[0], c4[2] - c4[1]; la, lb = math.hypot(*ea), math.hypot(*eb)
        if la < lb: ea, la, lb = eb, lb, la
        m = c4.mean(0); return (m[0], m[1], la / 2, lb / 2, math.atan2(ea[1], ea[0]) % math.pi), o_.area
    F, GEO, RECT, fix, quita = [None] * N, [None] * N, [None] * N, np.zeros(N, bool), np.zeros(N, bool)
    for i in range(N):
        g = G[i]; rect = None
        if forma[i] == 1: rect = tuple(RX[i])
        elif not recort[i]:
            r, ao = obb(g)
            if (A[i] / max(ao, 1e-6) >= .78 or A[i] < 90) and r[2] * Q <= 255 and r[3] * Q <= 255: rect = r
        f, P = cuant(g, rect, None)
        if f is None or not libre(P):
            ok = False
            for intento in range(4):   # se recorta exacto contra lo que pisa, con un margen que crece por el redondeo
                Mg = shapely.union_all([pz[j] for j in ARB.query(g.buffer(3))]).buffer(.36 + .25 * intento)
                d = g.difference(Mg); ps = [p for p in getattr(d, 'geoms', [d]) if p.geom_type == 'Polygon' and p.area >= 12]
                if not ps: break
                p = max(ps, key=lambda p: p.area).simplify(.3, preserve_topology=True)
                f, P = cuant(p, None, None)
                if f is not None and libre(P): ok = True; break
            if not ok: quita[i] = True; continue
            fix[i] = True
        F[i], GEO[i] = f, P
        if rect is not None and not fix[i]: RECT[i] = rect   # el rectángulo sin redondear (la versión ligera lo cuantiza más fino)
        if i % 100000 == 0: log('  guarda', i, 'de', N, '· arregladas', int(fix.sum()), '· quitadas', int(quita.sum()))
    log('guarda: arregladas', int(fix.sum()), '(confiables marcadas:', int((fix & marc).sum()), ') · quitadas', int(quita.sum()))
    # ---------- zócalo con el relieve de 80 m del juego ----------
    rawv = zlib.decompress(open(os.path.join(dst, 'valle.bin'), 'rb').read(), -15); nT, nE = M['W'] * M['H'], M['eW'] * M['eH']
    E = np.frombuffer(rawv[nT:nT + nE * 2], np.int16).astype(np.int64).reshape(M['eH'], M['eW']).cumsum(1).astype(float); GE = TILE * M['es']
    def elev(x, y):
        gx = np.clip(x / GE, 0, M['eW'] - 1.001); gy = np.clip(y / GE, 0, M['eH'] - 1.001); i = gx.astype(int); j = gy.astype(int); fx = gx - i; fy = gy - j
        return (E[j, i] * (1 - fx) + E[j, i + 1] * fx) * (1 - fy) + (E[j + 1, i] * (1 - fx) + E[j + 1, i + 1] * fx) * fy
    viv = np.flatnonzero(~quita); cz, iz = shapely.get_coordinates(np.array([GEO[i] for i in viv], dtype=object), return_index=True); ez = elev(cz[:, 0], cz[:, 1])
    zmin = np.full(len(viv), np.inf); zmax = np.full(len(viv), -np.inf); np.minimum.at(zmin, iz, ez); np.maximum.at(zmax, iz, ez)
    cc = np.array([(F[i]['rx'] * R + F[i]['X'] / Q, F[i]['ry'] * R + F[i]['Y'] / Q) for i in viv]); ec = elev(cc[:, 0], cc[:, 1])
    ZB = np.zeros(N, np.uint8); ZB[viv] = (np.clip(np.ceil((ec - zmin) / .5 - 1e-9), 0, 15).astype(np.uint8) << 4) | np.clip(np.ceil((zmax - ec) / .5 - 1e-9), 0, 15).astype(np.uint8)
    # ---------- codificación por trozos de 160 m ----------
    reg = np.array([F[i]['ry'] * nx + F[i]['rx'] if F[i] else 0 for i in range(N)]); hk = np.array([hilbert(F[i]['X'], F[i]['Y']) if F[i] else 0 for i in range(N)])
    orden = np.lexsort((hk, reg)); orden = orden[~quita[orden]]
    pos, dim, an, pi_, ki, pol, zb, mar = (bytearray() for _ in range(8)); cnt = np.zeros(nx * ny, int); pb = np.zeros(nx * ny, int); qb = np.zeros(nx * ny, int)
    last = -1; px = py = pa = 0
    for i in orden:
        f = F[i]; r = reg[i]
        if r != last: last = r; px = py = pa = 0
        p0, q0 = len(pos), len(pol)
        varint(f['X'] - px, pos); varint(f['Y'] - py, pos); px, py = f['X'], f['Y']
        dim.append(f['dA']); dim.append(f['dB']); an.append((f['a'] - pa) % 128); pa = f['a']
        pi_.append(int(pis[i])); fl = int(kind[i]) | (32 if pis[i] > 0 else 0) | (64 if src[i] == 'OpenStreetMap' else 0) | (128 if recort[i] or fix[i] else 0)
        if f['J'] is not None:
            fl |= 16; uvarint(len(f['J']), pol); qx, qy = px, py
            for jx, jy in f['J']: varint(int(jx) - qx, pol); varint(int(jy) - qy, pol); qx, qy = int(jx), int(jy)
        ki.append(fl); zb.append(int(ZB[i])); mar.append((1 if marc[i] else 0) | (int(bioma[i]) << 1))
        cnt[r] += 1; pb[r] += len(pos) - p0; qb[r] += len(pol) - q0
    idxb = bytearray()
    for r in range(nx * ny): uvarint(int(cnt[r]), idxb); uvarint(int(pb[r]), idxb); uvarint(int(qb[r]), idxb)
    flujos = [idxb, pos, dim, an, pi_, ki, pol, zb, mar]; todo = b''.join(bytes(f) for f in flujos)
    z = zlib.compressobj(9, zlib.DEFLATED, -15); comp = z.compress(todo) + z.flush()
    open(os.path.join(dst, 'edificios.bin'), 'wb').write(comp)
    meta = {'v': 1, 'motor': '1.3.1', 'R': R, 'nx': nx, 'ny': ny, 'n': int(cnt.sum()), 'Q': Q, 'kinds': KINDS, 'biomas': CFG['biomas'], 'len': [len(f) for f in flujos], 'raw': len(todo), 'marcas': 1, 'unidad': 'm (px = m × 1,6)',
            'flujos': ['índice (por trozo: n, bytes de posiciones, bytes de polígonos)', 'posiciones', 'medidas', 'ángulo', 'pisos (0 = sin dato)', 'tipo y banderas', 'polígonos', 'zócalo', 'marca y bioma'],
            'conectado': 'edificios-ligero.bin', 'nota': 'Huellas saneadas del Motor del Valle 1.3 (geo/huellas.py), con sus polígonos y su zócalo. Juega EnCicla lee la versión ligera (edificios-ligero.bin: un rectángulo por huella, el inscrito en las de polígono) en el modo libre con la bandera del cenital.',
            'src': 'Huellas: Overture Maps Foundation (OpenStreetMap, ODbL; Microsoft ML Buildings, ODbL; Google Open Buildings, CC BY 4.0 / ODbL), saneadas contra la malla vial (OSM y Alcaldía de Medellín) y el agua.',
            'cifras': {'arregladas_por_la_guarda': int(fix.sum()), 'confiables_recortadas_para_el_juego': int((fix & marc).sum()), 'quitadas': int(quita.sum()), 'recortadas': int(((recort | fix) & ~quita).sum())}}
    json.dump(meta, open(os.path.join(dst, 'edificios.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    log('EnCicla: edificios.bin', len(comp) // 1024, 'KB ·', meta['n'], 'edificios en', int((cnt > 0).sum()), 'trozos de 160 m')
    ligero(dst, pz, ARB, [RECT[i] for i in orden])


def maxrect(Mk):
    """el rectángulo de celdas verdaderas más grande de una matriz booleana -> (área, fila0, fila1, col0, col1), fila1 y col1 exclusivas
       (la programación dinámica de alturas, izquierdas y derechas por fila, con cada fila en numpy)"""
    nr, nc = Mk.shape; idx = np.arange(nc); h = np.zeros(nc, np.int32); Lf = np.zeros(nc, np.int32); Rt = np.full(nc, nc, np.int32); best = (0, 0, 0, 0, 0)
    for r in range(nr):
        row = Mk[r]; h = np.where(row, h + 1, 0)
        cl = np.maximum.accumulate(np.where(row, -1, idx)) + 1; cr = np.minimum.accumulate(np.where(row, nc, idx)[::-1])[::-1]
        Lf = np.where(row, np.maximum(Lf, cl), 0); Rt = np.where(row, np.minimum(Rt, cr), nc)
        ar = (Rt - Lf) * h; c = int(ar.argmax())
        if ar[c] > best[0]: best = (int(ar[c]), r - int(h[c]) + 1, r + 1, int(Lf[c]), int(Rt[c]))
    return best


def inscritos(P, aa, minimo=4.0, frac=.1):
    """los rectángulos más grandes adentro del polígono P con el ángulo aa -> (C, [(u0, u1, v0, v1), …]) o None: el centro de giro y
       los bordes en el marco girado (u a lo largo del ángulo, v a lo ancho). Se gira P para que el ángulo quede horizontal, se
       rasteriza con celdas cuyas 4 esquinas caen en P y se busca el rectángulo de celdas más grande (maxrect). Si queda otra parte
       que valga la pena (≥ minimo m² y ≥ frac del polígono: el otro brazo de una L, por ejemplo), va un segundo rectángulo,
       crecido hacia el primero para que se monten y no quede una raja. Cada uno se comprueba exacto; si una muesca delgada se cuela
       entre las esquinas, se repite con celdas que caben enteras (centro adentro de P erosionado en media diagonal)."""
    ca, sa = math.cos(aa), math.sin(aa); C = np.asarray(P.exterior.coords)[:-1].mean(0)
    Pr = shapely.transform(P, lambda xy: np.column_stack([(xy[:, 0] - C[0]) * ca + (xy[:, 1] - C[1]) * sa, (xy[:, 1] - C[1]) * ca - (xy[:, 0] - C[0]) * sa]))
    x0, y0, x1, y1 = Pr.bounds; s0 = min(2.0, max(.1, max(x1 - x0, y1 - y0) / 80)); Pt = Pr.buffer(1e-6, quad_segs=2); shapely.prepare(Pt)
    for modo in (0, 1):
        s = s0; Mk = None
        for _ in range(4):
            nc, nr = max(1, int(math.ceil((x1 - x0) / s))), max(1, int(math.ceil((y1 - y0) / s)))
            if modo == 0:   # esquinas de la rejilla adentro de P (con el borde)
                gx, gy = np.meshgrid(x0 + np.arange(nc + 1) * s, y0 + np.arange(nr + 1) * s); V = shapely.intersects_xy(Pt, gx, gy); Mk = V[:-1, :-1] & V[1:, :-1] & V[:-1, 1:] & V[1:, 1:]
            else:
                Pe = Pr.buffer(-s * .7072, quad_segs=4)
                if Pe.is_empty: s /= 2; Mk = None; continue
                gx, gy = np.meshgrid(x0 + (np.arange(nc) + .5) * s, y0 + (np.arange(nr) + .5) * s); shapely.prepare(Pe); Mk = shapely.contains_xy(Pe, gx, gy)
            if Mk.any(): break
            s /= 2; Mk = None
        if Mk is None: continue
        bordes = lambda r0, r1, c0, c1: (x0 + c0 * s, x0 + c1 * s, y0 + r0 * s, y0 + r1 * s)
        cabe = lambda b: modo == 1 or Pt.covers(shapely.box(b[0], b[2], b[1], b[3]))
        _, r0, r1, c0, c1 = maxrect(Mk); b1 = bordes(r0, r1, c0, c1)
        if not cabe(b1): continue
        out = [b1]; M2 = Mk.copy(); M2[r0:r1, c0:c1] = False
        if M2.any():
            a2, q0, q1, d0, d1 = maxrect(M2)
            if a2 * s * s >= max(minimo, frac * P.area):
                crece = True
                while crece:   # hacia el primero (o hacia donde se pueda): una fila o una columna a la vez, mientras todas sus celdas estén en P
                    crece = False
                    if q0 > 0 and Mk[q0 - 1, d0:d1].all(): q0 -= 1; crece = True
                    if q1 < Mk.shape[0] and Mk[q1, d0:d1].all(): q1 += 1; crece = True
                    if d0 > 0 and Mk[q0:q1, d0 - 1].all(): d0 -= 1; crece = True
                    if d1 < Mk.shape[1] and Mk[q0:q1, d1].all(): d1 += 1; crece = True
                b2 = bordes(q0, q1, d0, d1)
                if cabe(b2): out.append(b2)
        return C, out
    return None


QP, QD = 4, 4   # la versión ligera: centros y medias medidas cada 0,25 m (la completa: 0,5 m; en EnCicla 1 m = 1,6 px, así que 0,25 m no se ve)


def ligero(dst, pz=None, ARB=None, cont=None):
    """edificios-ligero.bin + .json (1.3.1): lo que mete tools/build.js en el HTML de EnCicla. Lee edificios.bin (el completo); con
       cont (desde encicla(): el rectángulo sin redondear de cada registro que va como rectángulo, en el orden del archivo) los
       cuantiza más fino; sin él (--ligero solo), conserva sus medidas de 0,5 m.
       Flujos: índice (por trozo: n, bytes de posiciones, bytes de medidas), posiciones (zigzag-varint, cada 0,25 m), medidas
       (uvarint de las medias medidas, cada 0,25 m), ángulo, pisos, tipo (bit 16 = sigue el edificio anterior: el segundo
       rectángulo de una huella, con el mismo aspecto) y marca."""
    import hashlib
    M = json.load(open(os.path.join(dst, 'valle.json'), encoding='utf-8')); E = json.load(open(os.path.join(dst, 'edificios.json'), encoding='utf-8'))
    if pz is None: pz = corredores(dst, M); ARB = STRtree(pz); log('corredores de EnCicla:', len(pz), 'trozos')
    cb = open(os.path.join(dst, 'edificios.bin'), 'rb').read(); huella = hashlib.sha1(cb).hexdigest()[:16]
    b = np.frombuffer(zlib.decompress(cb, -15), np.uint8); L = E['len']; off = np.cumsum([0] + L)
    if off[-1] != len(b) or len(L) != 9: raise SystemExit('edificios.bin no coincide con edificios.json')
    R_, Q_, nx, ny = E['R'], E['Q'], E['nx'], E['ny']; nR = nx * ny
    def uvs(buf):
        out = []; v = sh = 0
        for c in buf.tolist():
            v |= (c & 127) << sh; sh += 7
            if c < 128: out.append(v); v = sh = 0
        return np.array(out, np.int64)
    zz = lambda v: np.where(v & 1, -((v + 1) >> 1), v >> 1)
    cnt = uvs(b[off[0]:off[1]]).reshape(nR, 3)[:, 0]; N = int(cnt.sum()); reg = np.repeat(np.arange(nR), cnt); st = np.r_[0, np.cumsum(cnt)][:-1][reg]
    def porTrozo(d): c = np.cumsum(d); return c - np.r_[0, c][st]
    pv = zz(uvs(b[off[1]:off[2]])); X, Y = porTrozo(pv[0::2]), porTrozo(pv[1::2])
    dim = b[off[2]:off[3]].astype(np.int64).reshape(-1, 2); a = porTrozo(b[off[3]:off[4]].astype(np.int64)) % 128
    pis = b[off[4]:off[5]].copy(); kin = b[off[5]:off[6]].copy(); mar = b[off[8]:off[9]].copy(); rx, ry = reg % nx, reg // nx
    if cont is not None and len(cont) != N: raise SystemExit('cont no coincide con edificios.bin')
    K = QD // Q_   # de medias medidas de 0,5 m a medias medidas de 0,1 m
    def mejor_centro(C, u0, u1, v0, v1, aa):
        """el centro en la rejilla de 0,25 m (de los 9 más cercanos) que deja el rectángulo más grande adentro de los bordes -> (x, y, A, B) o None"""
        ca, sa = math.cos(aa), math.sin(aa); uc, vc = (u0 + u1) / 2, (v0 + v1) / 2; cx, cy = C[0] + uc * ca - vc * sa, C[1] + uc * sa + vc * ca; m = None
        for ex in (-1, 0, 1):
            for ey in (-1, 0, 1):
                qx, qy = (round(cx * QP) + ex) / QP, (round(cy * QP) + ey) / QP; qu, qv = (qx - C[0]) * ca + (qy - C[1]) * sa, (qy - C[1]) * ca - (qx - C[0]) * sa
                A_, B_ = math.floor(min(qu - u0, u1 - qu) * QD + 1e-9), math.floor(min(qv - v0, v1 - qv) * QD + 1e-9)
                if A_ >= QD // 2 and B_ >= QD // 2 and (m is None or A_ * B_ > m[0]): m = (A_ * B_, qx, qy, A_, B_)   # medias medidas de al menos 0,5 m
        return m and m[1:]
    # ---------- los rectángulos de cada registro: [(x, y, A, B)] (centro en metros, medias medidas en décimas) ----------
    REC, VIEJO, POL = [None] * N, [None] * N, {}
    raw = uvs(b[off[6]:off[7]]); k = 0; ins = np.zeros(N, bool); quita = np.zeros(N, bool); nfino = 0
    for j in range(N):
        aa = (a[j] + .5) * math.pi / 128; ca, sa = math.cos(aa), math.sin(aa)
        if kin[j] & 16:
            nv = int(raw[k]); d = zz(raw[k + 1:k + 1 + 2 * nv]).reshape(-1, 2); k += 1 + 2 * nv
            J = np.cumsum(d, 0) + [X[j], Y[j]]; P = shapely.make_valid(shapely.Polygon(J / Q_ + [rx[j] * R_, ry[j] * R_]))
            if P.geom_type != 'Polygon': P = max(getattr(P, 'geoms', [P]), key=lambda g: g.area if g.geom_type == 'Polygon' else 0)
            rr = inscritos(P, aa) if P.geom_type == 'Polygon' else None; out = []
            if rr is not None:
                C, bs = rr
                for bb in bs:
                    q = mejor_centro(C, *bb, aa)
                    if q: out.append(q)
            if not out: quita[j] = True; continue
            REC[j] = out; ins[j] = True; POL[j] = P
            if len(POL) % 25000 == 0: log('  inscritos', len(POL))
        else:
            x0_, y0_ = rx[j] * R_ + X[j] / Q_, ry[j] * R_ + Y[j] / Q_; VIEJO[j] = (x0_, y0_, max(1, int(dim[j, 0])) * K, max(1, int(dim[j, 1])) * K)
            r_ = cont[j] if cont is not None else None
            if r_ is not None:   # el rectángulo sin redondear, en el marco girado del ángulo que lee el juego
                cx, cy, hl, hw = r_[0], r_[1], min(r_[2], 255 / Q_), min(r_[3], 255 / Q_); q = mejor_centro((cx, cy), -hl, hl, -hw, hw, aa)
                if q: REC[j] = [q]; nfino += 1; continue
            REC[j] = [VIEJO[j]]
    if k != len(raw): raise SystemExit('flujo de polígonos inconsistente')
    log('rectángulos: inscritos', int(ins.sum()), '(con segundo rectángulo:', sum(len(REC[j]) > 1 for j in POL), ') · rectángulos más finos', nfino, '· sin rectángulo posible', int(quita.sum()))
    # ---------- comprobación como lo lee el juego: sin tocar ningún corredor (y los inscritos, adentro de su polígono) ----------
    def poli(js, ks):
        x = np.array([REC[j][k_][0] for j, k_ in zip(js, ks)]); y = np.array([REC[j][k_][1] for j, k_ in zip(js, ks)]); A_ = np.array([REC[j][k_][2] for j, k_ in zip(js, ks)]) / QD; B_ = np.array([REC[j][k_][3] for j, k_ in zip(js, ks)]) / QD
        aa = (a[js] + .5) * np.pi / 128; ux, uy = np.cos(aa), np.sin(aa); L1, L2 = np.maximum(.5, A_), np.maximum(.5, B_)
        c = np.stack([np.column_stack([x - ux * L1 + uy * L2, y - uy * L1 - ux * L2]), np.column_stack([x + ux * L1 + uy * L2, y + uy * L1 - ux * L2]),
                      np.column_stack([x + ux * L1 - uy * L2, y + uy * L1 + ux * L2]), np.column_stack([x - ux * L1 - uy * L2, y - uy * L1 + ux * L2])], 1)
        return shapely.polygons(c)
    vuelve, encoge, fuera_ = 0, 0, 0
    for vuelta in range(6):
        js = np.array([j for j in range(N) if REC[j] for _ in REC[j]]); ks = np.array([k_ for j in range(N) if REC[j] for k_ in range(len(REC[j]))])
        G_ = poli(js, ks); q = ARB.query(G_, predicate='intersects'); mal = np.zeros(len(js), bool); mal[np.unique(q[0])] = True
        pi_ = np.flatnonzero(ins[js]); dentro = np.ones(len(js), bool)
        if len(pi_): dentro[pi_] = shapely.area(shapely.difference(G_[pi_], np.array([POL[j] for j in js[pi_]], dtype=object))) <= .01
        mal |= ~dentro
        if not mal.any(): break
        log('  vuelta', vuelta, '· tocan un corredor o se salen', int(mal.sum()))
        for t in np.flatnonzero(mal)[::-1]:   # de atrás hacia adelante: quitar un rectángulo no corre los índices de los demás de ese registro
            j, k_ = int(js[t]), int(ks[t]); x_, y_, A_, B_ = REC[j][k_]
            if not ins[j]: REC[j][k_] = VIEJO[j]; vuelve += 1   # rectángulo: vuelve a sus medidas de 0,5 m (las que pasaron la guarda)
            elif vuelta < 5 and A_ > QD // 2 and B_ > QD // 2: REC[j][k_] = (x_, y_, A_ - 1, B_ - 1); encoge += 1
            else: REC[j].pop(k_); fuera_ += 1
        for j in range(N):
            if REC[j] is not None and not REC[j]: REC[j] = None; quita[j] = True
    js = np.array([j for j in range(N) if REC[j] for _ in REC[j]]); ks = np.array([k_ for j in range(N) if REC[j] for k_ in range(len(REC[j]))]); G_ = poli(js, ks)
    tocan = int(len(np.unique(ARB.query(G_, predicate='intersects')[0])))
    ar = shapely.area(G_); ap = {}
    for t in np.flatnonzero(ins[js]): ap[int(js[t])] = ap.get(int(js[t]), 0) + ar[t]
    razonA = np.array([min(1.0, ap[j] / POL[j].area) for j in ap]); log('comprobación: tocan un corredor', tocan, 'de', len(js), 'rectángulos · área inscrita / polígono: mediana', round(float(np.median(razonA)), 3), '· p10', round(float(np.percentile(razonA, 10)), 3), '· vuelven a 0,5 m', vuelve, '· encogidos', encoge, '· quitados', fuera_)
    if tocan: raise SystemExit(f'{tocan} rectángulos tocan un corredor')
    # ---------- codificación por trozos de 160 m, en orden de Hilbert (el segundo rectángulo, justo después del primero) ----------
    vivos = [j for j in range(N) if REC[j]]; rg = {}
    for j in vivos: x_, y_ = REC[j][0][0], REC[j][0][1]; qx_, qy_ = min(nx - 1, max(0, int(x_ // R_))), min(ny - 1, max(0, int(y_ // R_))); rg[j] = (qy_ * nx + qx_, qx_, qy_)
    hk = {j: hilbert(int(min(511, max(0, (REC[j][0][0] - rg[j][1] * R_) * 3.19))), int(min(511, max(0, (REC[j][0][1] - rg[j][2] * R_) * 3.19)))) for j in vivos}
    vivos.sort(key=lambda j: (rg[j][0], hk[j]))
    pos, dm, an, pi_, ki, mr = (bytearray() for _ in range(6)); cnt2 = np.zeros(nR, int); pb = np.zeros(nR, int); db = np.zeros(nR, int); last = -1; px = py = pa = 0; nseg = 0
    for j in vivos:
        r, qx_, qy_ = rg[j]
        if r != last: last = r; px = py = pa = 0
        for k_, (x_, y_, A_, B_) in enumerate(REC[j]):
            Xq, Yq = int(round((x_ - qx_ * R_) * QP)), int(round((y_ - qy_ * R_) * QP)); p0, d0 = len(pos), len(dm)
            varint(Xq - px, pos); varint(Yq - py, pos); px, py = Xq, Yq; uvarint(int(A_), dm); uvarint(int(B_), dm)
            an.append((int(a[j]) - pa) % 128); pa = int(a[j]); pi_.append(int(pis[j])); ki.append((int(kin[j]) & ~16) | (16 if k_ else 0)); mr.append(int(mar[j]))
            cnt2[r] += 1; pb[r] += len(pos) - p0; db[r] += len(dm) - d0; nseg += k_ > 0
    idxb = bytearray()
    for r in range(nR): uvarint(int(cnt2[r]), idxb); uvarint(int(pb[r]), idxb); uvarint(int(db[r]), idxb)
    flujos = [idxb, pos, dm, an, pi_, ki, mr]; todo = b''.join(bytes(f) for f in flujos); z = zlib.compressobj(9, zlib.DEFLATED, -15); comp = z.compress(todo) + z.flush()
    open(os.path.join(dst, 'edificios-ligero.bin'), 'wb').write(comp)
    meta = {'v': 2, 'ligero': True, 'motor': '1.3.1', 'R': R_, 'nx': nx, 'ny': ny, 'n': int(cnt2.sum()), 'edificios': len(vivos), 'Q': QP, 'Qd': QD, 'kinds': E['kinds'], 'biomas': E['biomas'], 'len': [len(f) for f in flujos], 'raw': len(todo), 'unidad': E['unidad'], 'de': {'edificios.bin': huella},
            'flujos': ['índice (por trozo: n, bytes de posiciones, bytes de medidas)', 'posiciones (zigzag-varint, cada 1/Q m)', 'medidas (uvarint de las medias medidas, cada 1/Qd m)', 'ángulo', 'pisos (0 = sin dato)', 'tipo y banderas (16 = sigue el edificio anterior: su segundo rectángulo; 32 pisos conocidos; 64 de OSM; 128 recortada)', 'marca y bioma (bit 0 casa confiable marcada; bits 1 a 3 bioma)'],
            'nota': 'La versión ligera de edificios.bin que lee Juega EnCicla (tools/build.js la mete en el HTML; src/js/99z-huellas.js): uno o dos rectángulos por huella; en las de polígono, los más grandes que caben adentro, ya cuantizados. Ninguno toca una vía, el Metroplús, el tranvía ni el agua.',
            'src': E['src'], 'cifras': {'edificios': len(vivos), 'rectangulos': int(cnt2.sum()), 'segundos_rectangulos': nseg, 'inscritos': int(ins.sum()), 'rectangulos_mas_finos': nfino, 'vuelven_a_0_5_m': vuelve, 'encogidos': encoge, 'quitados': int(quita.sum()), 'tocan_un_corredor': tocan,
            'area_inscrita_sobre_poligono': {'mediana': round(float(np.median(razonA)), 3), 'p10': round(float(np.percentile(razonA, 10)), 3), 'media': round(float(razonA.mean()), 3)}}}
    json.dump(meta, open(os.path.join(dst, 'edificios-ligero.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    log('EnCicla: edificios-ligero.bin', len(comp) // 1024, 'KB ·', meta['n'], 'rectángulos de', len(vivos), 'edificios ·', meta['cifras'])

if __name__ == '__main__':
    if '--encicla' in sys.argv: encicla(sys.argv[sys.argv.index('--encicla') + 1])
    elif '--ligero' in sys.argv: ligero(sys.argv[sys.argv.index('--ligero') + 1])
    else: print(__doc__)
