"""Lo que va en alto (v1.7): tramos del metro en viaducto y puentes de las vías, con su nivel.
   Fuente: Overture Maps (datos de OpenStreetMap, ODbL): segmentos con road_flags/rail_flags (is_bridge) y level_rules.
   Entrada: tools/geo/cache/rail_niveles.parquet y puentes.parquet (los baja tools/geo/fetch.py) y src/data/valle.json (proyección).
   Salida: src/data/alturas.json, que tools/build.js mete en el juego como ALTURAS.
   Uso: python3 tools/geo/alturas.py
"""
import duckdb, json, math, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
CACHE = os.path.join(os.path.dirname(__file__), 'cache')
VM = json.load(open(os.path.join(ROOT, 'src', 'data', 'valle.json')))
LON0, LATN, KX, KY, MW, MH = VM['lon0'], VM['latN'], VM['kx'], VM['ky'], VM['W'], VM['H']
Q = 8   # coordenadas en casillas ×8 (1,25 m)
CXM = 111320 * math.cos(math.radians(6.25)); CYM = 110574
c = duckdb.connect()

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
def nivel(lv, a, b):
    best = 0
    for l in lv or []:
        la, lb = l['between'] or [0, 1]
        if la < b - 1e-6 and lb > a + 1e-6: best = max(best, int(l['value']))
    return best or 1
def q8(P): return [int(round(v * Q)) for p in P for v in p]

# ---------- metro: tramos en viaducto de las líneas A y B ----------
def dseg(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy or 1)))
    return math.hypot(a[0] + dx * t - p[0], a[1] + dy * t - p[1])
LIN = {k: [(VM['metro'][k]['p'][i] / 4, VM['metro'][k]['p'][i + 1] / 4) for i in range(0, len(VM['metro'][k]['p']), 2)] for k in ('A', 'B')}
def cerca(p, k): return min(dseg(p, a, b) for a, b in zip(LIN[k], LIN[k][1:]))
metro = []
for _id, cl, name, fl, lv, w in c.execute(f"select id, class, name, flags, niveles, wkt from '{CACHE}/rail_niveles.parquet' where class='subway'").fetchall():
    P = pts(w); S = cum(P)
    for f in json.loads(fl) if fl else []:
        if 'is_bridge' not in f['values']: continue
        a, b = f['between'] or [0, 1]; L = (b - a) * S[-1]
        if L < 40: continue
        T = [tile(*p) for p in sub(P, S, a, b)]; mid = T[len(T) // 2]
        k = min(('A', 'B'), key=lambda k: cerca(mid, k))
        if cerca(mid, k) > 3: continue   # a más de 30 m de la línea del juego: un ramal o un patio
        metro.append([k, nivel(json.loads(lv) if lv else [], a, b)] + q8([T[0], T[-1]]))
print('metro en viaducto:', len(metro), 'tramos (A:', sum(1 for m in metro if m[0] == 'A'), '· B:', sum(1 for m in metro if m[0] == 'B'), ')')

# ---------- puentes de las vías ----------
VK = {'residential': 1, 'unclassified': 1, 'living_street': 1, 'service': 1, 'tertiary': 4, 'secondary': 2, 'primary': 2, 'trunk': 3, 'motorway': 3,
      'pedestrian': 6, 'footway': 6, 'path': 6, 'cycleway': 5}   # como los tipos del dibujo (1 calle, 4 carrera, 2 avenida, 3 autopista, 5 ciclorruta, 6 peatonal)
MINL = {1: 10, 4: 10, 2: 10, 3: 10, 5: 12, 6: 12}
puentes, n0 = [], 0
for cl, subcl, name, fl, lv, w in c.execute(f"select class, subclass, name, flags, niveles, wkt from '{CACHE}/puentes.parquet'").fetchall():
    k = VK.get(cl)
    if not k or not fl: continue
    if cl == 'service' and subcl != 'alley' and not name: continue   # rampas de parqueaderos y entradas privadas: no son calles del juego
    if cl in ('footway', 'path') and subcl in ('sidewalk', 'crosswalk'): continue
    P = pts(w); S = cum(P)
    for f in json.loads(fl):
        if 'is_bridge' not in f['values']: continue
        n0 += 1; a, b = f['between'] or [0, 1]; L = (b - a) * S[-1]
        if L < MINL[k]: continue
        T = rdp([tile(*p) for p in sub(P, S, a, b)], .12)
        if not all(0 <= x < MW and 0 <= y < MH for x, y in T): continue
        puentes.append([k, nivel(json.loads(lv) if lv else [], a, b), round(L)] + q8(T))
print('puentes:', len(puentes), 'de', n0, 'tramos marcados ·', {k: sum(1 for p in puentes if p[0] == k) for k in sorted(set(VK.values()))})
out = {'fuente': 'Overture Maps Foundation (datos de OpenStreetMap, ODbL): road_flags/rail_flags is_bridge y level_rules', 'q': Q, 'metro': metro, 'puentes': puentes}
dst = os.path.join(ROOT, 'src', 'data', 'alturas.json')
json.dump(out, open(dst, 'w'), separators=(',', ':'))
print('->', dst, os.path.getsize(dst) // 1024, 'KB')
