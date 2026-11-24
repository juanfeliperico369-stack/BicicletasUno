"""HUELLAS SANEADAS PARA JUEGA ENCICLA (Motor del Valle 1.3.0) → src/data/edificios.bin + edificios.json
   Toma la verdad compartida de geo/sanear.py (salida/sanear/huellas.parquet) y la deja lista para el juego, SIN CONECTARLA
   (la Fase 3 decide si reemplaza los lotes inventados, con la compuerta de rendimiento):
     · por trozos de 160 m (la clave "cx,cy", c = floor(x / 160)), en metros del mapa (px = m × 1,6);
     · el mismo esquema de flujos que edificios.js de El Metro: posiciones (medios metros, deltas zigzag-varint en orden de Hilbert),
       medidas, ángulo, pisos, tipo (4 bits; 16 polígono, 32 pisos conocidos, 64 de OSM, 128 recortada) y polígonos; y al final
       zb (zócalo: nibble alto = ceil((suelo en el centro - zMin) / 0,5 m), bajo = ceil((zMax - suelo) / 0,5 m)) y marca
       (bit 0: casa confiable marcada para revisar; bits 1 a 3: bioma del trozo);
     · guarda: ya redondeada como la leería el juego, ninguna pisa las vías que EnCicla dibuja (vias.bin, regla A con
       ciclorrutas), el Metroplús, el tranvía ni el agua. Si alguna no pasa, se recorta exacto (y lleva el bit 128).
   Los pisos son los de Overture (num_floors o height / 3); 0 = sin dato (el juego ya estima la altura por celda con «hg»).
   Uso: python3 motor-valle/geo/huellas.py --encicla CARPETA_SRC_DATA
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
    # ---------- corredores de EnCicla: sus vías (vias.bin) con la regla A, el Metroplús, el tranvía y el agua ----------
    raw = zlib.decompress(open(os.path.join(dst, 'vias.bin'), 'rb').read(), -15); n = struct.unpack_from('<I', raw, 0)[0]; o = 4; U = TILE / M['vq']
    pz, pk = [], []
    def trozos(P, paso=40.0):
        L = shapely.LineString(P); m = max(1, int(math.ceil(L.length / paso)))
        return [L] if m == 1 else [shapely.ops.substring(L, L.length * i / m, L.length * (i + 1) / m) for i in range(m)]
    DEFW = {int(k): v for k, v in CFG['ancho_de_clase_m'].items()}; AND = {int(k): v for k, v in CFG['reglas']['A']['anden_m'].items()}
    for i in range(n):
        k, nm, nom, w2, np_ = struct.unpack_from('<BHHBH', raw, o); o += 8; q = np.frombuffer(raw[o:o + np_ * 4], '<i2').reshape(-1, 2).astype(np.int64).cumsum(0); o += np_ * 4
        if not 1 <= k <= 7 or np_ < 2: continue
        r = max(1, (w2 / 2 or DEFW[k]) / 2 + AND[k])
        for t in trozos(q * U): pz.append(t.buffer(r * F_EXT, quad_segs=8)); pk.append(k)
    mp = os.path.join(dst, 'metroplus.json')
    if os.path.exists(mp):
        for c in json.load(open(mp, encoding='utf-8'))['corredores'].values():
            P = np.array(c).reshape(-1, 2)
            for t in trozos(P): pz.append(t.buffer(CFG['transporte_a_nivel_m']['brt'] * F_EXT, quad_segs=8)); pk.append(20)
    T_ = M.get('metro', {}).get('T')
    if T_:
        for t in trozos(np.array(T_['p']).reshape(-1, 2) / 4 * TILE): pz.append(t.buffer(CFG['transporte_a_nivel_m']['tram'] * F_EXT, quad_segs=8)); pk.append(21)
    for w in pq.read_table(os.path.join(SAN, 'agua.parquet')).to_pydict()['wkb']: pz.append(shapely.from_wkb(w)); pk.append(30)
    pz = np.array(pz, dtype=object); ARB = STRtree(pz); log('corredores de EnCicla:', len(pz), 'trozos')
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
    F, GEO, fix, quita = [None] * N, [None] * N, np.zeros(N, bool), np.zeros(N, bool)
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
    meta = {'v': 1, 'motor': '1.3.0', 'R': R, 'nx': nx, 'ny': ny, 'n': int(cnt.sum()), 'Q': Q, 'kinds': KINDS, 'biomas': CFG['biomas'], 'len': [len(f) for f in flujos], 'raw': len(todo), 'marcas': 1, 'unidad': 'm (px = m × 1,6)',
            'flujos': ['índice (por trozo: n, bytes de posiciones, bytes de polígonos)', 'posiciones', 'medidas', 'ángulo', 'pisos (0 = sin dato)', 'tipo y banderas', 'polígonos', 'zócalo', 'marca y bioma'],
            'conectado': False, 'nota': 'Huellas saneadas del Motor del Valle 1.3 (geo/huellas.py). Juega EnCicla todavía no las lee: la Fase 3 decide si reemplazan los lotes inventados, con la compuerta de rendimiento.',
            'src': 'Huellas: Overture Maps Foundation (OpenStreetMap, ODbL; Microsoft ML Buildings, ODbL; Google Open Buildings, CC BY 4.0 / ODbL), saneadas contra la malla vial (OSM y Alcaldía de Medellín) y el agua.',
            'cifras': {'arregladas_por_la_guarda': int(fix.sum()), 'confiables_recortadas_para_el_juego': int((fix & marc).sum()), 'quitadas': int(quita.sum()), 'recortadas': int(((recort | fix) & ~quita).sum())}}
    json.dump(meta, open(os.path.join(dst, 'edificios.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    log('EnCicla: edificios.bin', len(comp) // 1024, 'KB ·', meta['n'], 'edificios en', int((cnt > 0).sum()), 'trozos de 160 m · sin conectar')


if __name__ == '__main__':
    if '--encicla' in sys.argv: encicla(sys.argv[sys.argv.index('--encicla') + 1])
    else: print(__doc__)
