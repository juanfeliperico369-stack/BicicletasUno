"""Lo que va en alto y en bajo (v1.8 / Motor del Valle 1.1.0): tramos del metro en viaducto,
   puentes de las vías (is_bridge, level >= 1) y túneles/deprimidos viales (is_tunnel, level <= -1).
   Fuente: Overture Maps (datos de OpenStreetMap, ODbL): segmentos con road_flags/rail_flags
   (is_bridge, is_tunnel) y level_rules, más los principales soterrados y deprimidos del Valle de Aburrá.
   Entrada: motor-valle/geo/cache/rail_niveles.parquet y puentes.parquet (los baja motor-valle/geo/fetch.py)
   y src/data/valle.json (proyección).
   Salida: src/data/alturas.json, que tools/build.js mete en el juego como ALTURAS.
   Uso: python3 motor-valle/geo/alturas.py
"""
import json, math, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
CACHE = os.path.join(os.path.dirname(__file__), 'cache')
VM = json.load(open(os.path.join(ROOT, 'src', 'data', 'valle.json')))
LON0, LATN, KX, KY, MW, MH = VM['lon0'], VM['latN'], VM['kx'], VM['ky'], VM['W'], VM['H']
Q = 8   # coordenadas en casillas ×8 (1,25 m)
CXM = 111320 * math.cos(math.radians(6.25)); CYM = 110574

def pts(w):
    w = w[w.index('(') + 1:w.rindex(')')]
    return [tuple(map(float, p.split())) for p in w.split(',')]
def cum(P):
    s = [0.0]
    for a, b in zip(P, P[1:]): s.append(s[-1] + math.hypot((b[0] - a[0]) * CXM, (b[1] - a[1]) * CYM))
    return s
def sub(P, S, a, b):
    """trozo de la línea entre las fracciones a y b de su largo"""
    L = S[-1]; ta, tb = a * L, b * L; out = []
    def at(t):
        for i in range(1, len(P)):
            if S[i] >= t:
                u = (t - S[i - 1]) / max(1e-9, S[i] - S[i - 1]); return (P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u)
        return P[-1]
    out.append(at(ta))
    for i in range(1, len(P) - 1):
        if ta < S[i] < tb: out.append(P[i])
    out.append(at(tb)); return out
def tile(lon, lat): return ((lon - LON0) * KX, (LATN - lat) * KY)
def rdp(P, eps):
    if len(P) <= 2: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-9
    i, md = max(((i, abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / L) for i, p in enumerate(P[1:-1], 1)), key=lambda t: t[1])
    if md <= eps: return [a, b]
    return rdp(P[:i + 1], eps)[:-1] + rdp(P[i:], eps)
def nivel(lv, a, b, default=1):
    best = 0
    for l in lv or []:
        la, lb = l['between'] or [0, 1]
        if la < b - 1e-6 and lb > a + 1e-6:
            v = int(l['value'])
            best = min(best, v) if default < 0 else max(best, v)
    return best or default
def q8(P): return [int(round(v * Q)) for p in P for v in p]

# Principales soterrados y deprimidos viales del Valle de Aburrá (garantizados aunque no haya caché parquet local)
DEPRIMIDOS_VALLE = [
    # [k, nivel, largo_m, (lon_a, lat_a), (lon_b, lat_b)]
    (3, -1, 390, [(-75.5811, 6.2416), (-75.5792, 6.2450)]),   # Soterrado Parques del Río (Autopista Sur)
    (3, -1, 360, [(-75.5784, 6.2422), (-75.5767, 6.2453)]),   # Soterrado Parques del Río (Av. Regional)
    (2, -1, 210, [(-75.5754, 6.2450), (-75.5734, 6.2456)]),   # Deprimido de San Juan (La Alpujarra)
    (2, -1, 185, [(-75.5648, 6.2488), (-75.5643, 6.2506)]),   # Deprimido Av. Oriental con La Playa
    (2, -1, 175, [(-75.5637, 6.2538), (-75.5628, 6.2554)]),   # Deprimido de Villanueva (Av. Oriental)
    (2, -1, 165, [(-75.5872, 6.2392), (-75.5856, 6.2402)]),   # Deprimido de Bulerías (Av. 33)
    (3, -1, 220, [(-75.5694, 6.2700), (-75.5685, 6.2721)]),   # Deprimido Terminal del Norte / Caribe
    (2, -1, 180, [(-75.5762, 6.2314), (-75.5747, 6.2325)]),   # Deprimido de Industriales (Calle 30)
    (2, -1, 170, [(-75.5951, 6.2600), (-75.5944, 6.2616)]),   # Deprimido de la 80 con Colombia
    (3, -1, 195, [(-75.5644, 6.2782), (-75.5635, 6.2800)]),   # Deprimido Puente Madre Laura
    (2, -1, 160, [(-75.5851, 6.2090), (-75.5844, 6.2104)]),   # Deprimido de Guayabal / Cristo Rey
    (2, -1, 155, [(-75.5791, 6.1940), (-75.5785, 6.1955)]),   # Deprimido Aguacatala / Av. El Poblado
]

def build_curated_tunnels():
    out = []
    for k, lv, lenM, coords in DEPRIMIDOS_VALLE:
        T = [tile(lon, lat) for lon, lat in coords]
        if all(0 <= x < MW and 0 <= y < MH for x, y in T):
            out.append([k, lv, lenM] + q8(T))
    return out

if __name__ == '__main__':
    dst = os.path.join(ROOT, 'src', 'data', 'alturas.json')
    rail_p = os.path.join(CACHE, 'rail_niveles.parquet')
    puentes_p = os.path.join(CACHE, 'puentes.parquet')
    if os.path.exists(rail_p) and os.path.exists(puentes_p):
        import duckdb
        c = duckdb.connect()
        def dseg(p, a, b):
            dx, dy = b[0] - a[0], b[1] - a[1]; t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy or 1)))
            return math.hypot(a[0] + dx * t - p[0], a[1] + dy * t - p[1])
        LIN = {k: [(VM['metro'][k]['p'][i] / 4, VM['metro'][k]['p'][i + 1] / 4) for i in range(0, len(VM['metro'][k]['p']), 2)] for k in ('A', 'B')}
        def cerca(p, k): return min(dseg(p, a, b) for a, b in zip(LIN[k], LIN[k][1:]))
        metro = []
        for _id, cl, name, fl, lv, w in c.execute(f"select id, class, name, flags, niveles, wkt from '{rail_p}' where class='subway'").fetchall():
            P = pts(w); S = cum(P)
            for f in json.loads(fl) if fl else []:
                if 'is_bridge' not in f['values']: continue
                a, b = f['between'] or [0, 1]; L = (b - a) * S[-1]
                if L < 40: continue
                T = [tile(*p) for p in sub(P, S, a, b)]; mid = T[len(T) // 2]
                k = min(('A', 'B'), key=lambda k: cerca(mid, k))
                if cerca(mid, k) > 3: continue
                metro.append([k, nivel(json.loads(lv) if lv else [], a, b, 1)] + q8([T[0], T[-1]]))
        VK = {'residential': 1, 'unclassified': 1, 'living_street': 1, 'service': 1, 'tertiary': 4, 'secondary': 2, 'primary': 2, 'trunk': 3, 'motorway': 3,
              'pedestrian': 6, 'footway': 6, 'path': 6, 'cycleway': 5}
        MINL = {1: 10, 4: 10, 2: 10, 3: 10, 5: 12, 6: 12}
        puentes, tuneles = [], build_curated_tunnels()
        for cl, subcl, name, fl, lv, w in c.execute(f"select class, subclass, name, flags, niveles, wkt from '{puentes_p}'").fetchall():
            k = VK.get(cl)
            if not k or not fl: continue
            if cl == 'service' and subcl != 'alley' and not name: continue
            if cl in ('footway', 'path') and subcl in ('sidewalk', 'crosswalk'): continue
            P = pts(w); S = cum(P)
            for f in json.loads(fl):
                vals = f['values'] or []
                is_br = 'is_bridge' in vals
                is_tn = 'is_tunnel' in vals or 'is_underpass' in vals
                if not (is_br or is_tn): continue
                a, b = f['between'] or [0, 1]; L = (b - a) * S[-1]
                if L < MINL[k]: continue
                T = rdp([tile(*p) for p in sub(P, S, a, b)], .12)
                if not all(0 <= x < MW and 0 <= y < MH for x, y in T): continue
                if is_br:
                    puentes.append([k, nivel(json.loads(lv) if lv else [], a, b, 1), round(L)] + q8(T))
                elif is_tn:
                    tuneles.append([k, nivel(json.loads(lv) if lv else [], a, b, -1), round(L)] + q8(T))
        out = {'fuente': 'Overture Maps Foundation (datos de OpenStreetMap, ODbL): road_flags/rail_flags is_bridge, is_tunnel y level_rules', 'q': Q, 'metro': metro, 'puentes': puentes, 'tuneles': tuneles}
    else:
        cur = json.load(open(dst)) if os.path.exists(dst) else {'q': Q, 'metro': [], 'puentes': []}
        cur['fuente'] = 'Overture Maps Foundation (datos de OpenStreetMap, ODbL): road_flags/rail_flags is_bridge, is_tunnel y level_rules'
        cur['tuneles'] = build_curated_tunnels()
        out = cur
    json.dump(out, open(dst, 'w'), separators=(',', ':'))
    print('-> alturas.json:', len(out.get('metro', [])), 'metro ·', len(out.get('puentes', [])), 'puentes ·', len(out.get('tuneles', [])), 'túneles/deprimidos')
