"""Construye el mapa real del Valle de Aburrá para Juega EnCicla.
   Entrada: tools/geo/cache/ (ver fetch.py).  Salida: src/data/valle.bin (casillas + relieve, comprimido) y src/data/valle.json.
   Uso: python3 tools/geo/build.py   (necesita: pip install duckdb numpy pillow shapely)
   1 casilla = 20 m. Fila 0 = norte. Todo lo que queda fuera de los 10 municipios del Área Metropolitana es montaña.
   Datos: © OpenStreetMap contributors (ODbL) vía Overture Maps; relieve: Terrain Tiles (AWS Open Data, SRTM).
"""
import duckdb, json, math, os, zlib, struct
import numpy as np
from PIL import Image, ImageDraw
from shapely import wkt as WKT
from shapely.geometry import LineString, MultiLineString, Polygon, MultiPolygon, GeometryCollection

HERE = os.path.dirname(os.path.abspath(__file__)); CACHE = os.path.join(HERE, 'cache'); OUT = os.path.join(HERE, '..', '..', 'src', 'data')
LON0, LON1, LATN, LATS = -75.70, -75.31, 6.46, 6.015
TILE = 20.0
KX = 111320 * math.cos(math.radians((LATN + LATS) / 2)) / TILE
KY = 110574 / TILE
MW, MH = int(math.ceil((LON1 - LON0) * KX)), int(math.ceil((LATN - LATS) * KY))
ES = 4                                   # relieve: una muestra cada 4 casillas (80 m)
EW, EH = MW // ES + 2, MH // ES + 2
print('casillas', MW, 'x', MH, '=', MW * MH)
# códigos de casilla (deben coincidir con TT en src/js/20-map.js)
GRASS, MOUNT, BRICK, BLDG, ROAD, AVE, WALK, CICLO, WATER, CANAL, PLAZA, BRIDGE, STATION, LAND, AUTO, DEPOT, STEPS = range(17)
MUNIS = ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Sabaneta', 'La Estrella', 'Caldas', 'Copacabana', 'Girardota', 'Barbosa']

c = duckdb.connect()
def rows(sql): return c.execute(sql).fetchall()
def P(name): return os.path.join(CACHE, name + '.parquet')
def T(lon, lat): return ((lon - LON0) * KX, (LATN - lat) * KY)
def geoms(g):
    if g is None or g.is_empty: return []
    if isinstance(g, (MultiLineString, MultiPolygon, GeometryCollection)): return [x for p in g.geoms for x in geoms(p)]
    return [g]
def tcoords(cs): return np.array([T(x, y) for x, y in cs], dtype=np.float64)

# ---------------- rasterizado ----------------
code = np.zeros((MH, MW), np.uint8); prio = np.zeros((MH, MW), np.uint8)
def put(cells, cv, pr):
    if not len(cells): return
    cx, cy = cells[:, 0], cells[:, 1]; ok = (cx >= 0) & (cy >= 0) & (cx < MW) & (cy < MH); cx, cy = cx[ok], cy[ok]
    m = prio[cy, cx] < pr; code[cy[m], cx[m]] = cv; prio[cy[m], cx[m]] = pr
def line_cells(pts, r):
    seg = []
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / .25)); t = np.linspace(0, 1, n + 1)
        seg.append(np.stack([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t], 1))
    if not seg: return np.zeros((0, 2), np.int64)
    p = np.concatenate(seg)
    if r <= .5:
        cl = np.floor(p).astype(np.int64); d = np.diff(cl, axis=0); diag = (d[:, 0] != 0) & (d[:, 1] != 0)
        extra = np.stack([cl[1:][diag, 0], cl[:-1][diag, 1]], 1)    # sin pasos en diagonal: las rutas son de 4 vecinos
        return np.concatenate([cl, extra])
    R = int(math.ceil(r)); off = np.array([(dx, dy) for dy in range(-R, R + 1) for dx in range(-R, R + 1)])
    base = np.floor(p).astype(np.int64); cand = (base[:, None, :] + off[None]).reshape(-1, 2); pp = np.repeat(p, len(off), 0)
    keep = ((cand[:, 0] + .5 - pp[:, 0]) ** 2 + (cand[:, 1] + .5 - pp[:, 1]) ** 2) <= r * r
    return np.concatenate([cand[keep], np.floor(p).astype(np.int64)])
def poly_mask(polys, val=1, img=None):
    img = img or Image.new('L', (MW, MH), 0); d = ImageDraw.Draw(img)
    for g in polys:
        if not isinstance(g, Polygon) or g.area <= 0: continue
        ext = [T(x, y) for x, y in g.exterior.coords]
        if len(ext) >= 3: d.polygon(ext, fill=val)
        for h in g.interiors:
            hh = [T(x, y) for x, y in h.coords]
            if len(hh) >= 3: d.polygon(hh, fill=0)
    return img

# ---------------- municipios y comunas ----------------
muni = Image.new('L', (MW, MH), 0); dm = ImageDraw.Draw(muni)
for i, name in enumerate(MUNIS):
    for (w,) in rows(f"select wkt from '{P('div')}' where subtype='county' and name='{name}'"):
        poly_mask(geoms(WKT.loads(w)), i + 1, muni)
MUNI = np.array(muni)
comunas = rows(f"select name, wkt from '{P('div')}' where subtype='macrohood' order by name")
com = Image.new('L', (MW, MH), 0)
for i, (n, w) in enumerate(comunas): poly_mask(geoms(WKT.loads(w)), i + 1, com)
COM = np.array(com)
print('municipios', [int((MUNI == i + 1).sum()) for i in range(10)])

# ---------------- usos del suelo ----------------
def lu(where): return [g for (w,) in rows(f"select wkt from '{P('landuse')}' where {where}") for g in geoms(WKT.loads(w))]
URB = np.array(poly_mask(lu("subtype in ('residential','developed','education','medical','military','religious','transportation','construction') or class in ('commercial','retail','industrial')"))) > 0
PARK = np.array(poly_mask(lu("class in ('park','garden','grass','recreation_ground','village_green','cemetery','golf_course','fairway','nature_reserve','dog_park')"))) > 0
PLZ = np.array(poly_mask(lu("class in ('plaza','pitch','playground','track','stadium','marketplace')"))) > 0
FARM = np.array(poly_mask(lu("subtype in ('agriculture','horticulture') or class in ('meadow','farmland','orchard','grassland')"))) > 0
put(np.argwhere(FARM)[:, ::-1], GRASS, 1); put(np.argwhere(URB)[:, ::-1], BLDG, 2)
put(np.argwhere(PARK)[:, ::-1], GRASS, 3); put(np.argwhere(PLZ)[:, ::-1], PLAZA, 4)

# ---------------- agua ----------------
wpoly, river_lines, streams = [], [], []
for sub, cl, name, w in rows(f"select subtype, class, name, wkt from '{P('water')}'"):
    for g in geoms(WKT.loads(w)):
        if isinstance(g, Polygon):
            if sub in ('river', 'lake', 'reservoir', 'water', 'pond') and cl not in ('swimming_pool', 'fountain'): wpoly.append(g)
        elif isinstance(g, LineString):
            if sub == 'river': river_lines.append((name, g))
            elif sub in ('stream', 'canal'): streams.append((name, g))
WAT = np.array(poly_mask(wpoly)) > 0
for name, g in river_lines:
    cells = line_cells(tcoords(g.coords), 1.4 if name == 'Río Medellín' else .9); ok = (cells[:, 0] >= 0) & (cells[:, 1] >= 0) & (cells[:, 0] < MW) & (cells[:, 1] < MH); WAT[cells[ok, 1], cells[ok, 0]] = True
for name, g in streams: put(line_cells(tcoords(g.coords), .5), CANAL, 5)
put(np.argwhere(WAT)[:, ::-1], WATER, 6)

# ---------------- vías ----------------
RC = {  # clase -> (código, radio en casillas, prioridad)
    'track': (WALK, .5, 7), 'bridleway': (WALK, .5, 7), 'path': (WALK, .5, 7), 'footway': (WALK, .5, 7), 'pedestrian': (WALK, .5, 8),
    'steps': (STEPS, .5, 9), 'service': (ROAD, .5, 11), 'unknown': (ROAD, .5, 11),
    'residential': (ROAD, .5, 12), 'unclassified': (ROAD, .5, 12), 'living_street': (ROAD, .5, 12),
    'tertiary': (ROAD, .75, 13), 'secondary': (AVE, 1.0, 14), 'primary': (AVE, 1.1, 15), 'trunk': (AUTO, 1.2, 16), 'motorway': (AUTO, 1.25, 16)}
majors, cycles = [], []
for cl, sub, name, w in rows(f"select class, subclass, name, wkt from '{P('roads')}'"):
    if cl == 'cycleway':
        for g in geoms(WKT.loads(w)):
            if isinstance(g, LineString): cycles.append(line_cells(tcoords(g.coords), .5))
        continue
    if cl not in RC or (cl == 'service' and sub in ('parking_aisle', 'driveway')): continue
    cv, r, pr = RC[cl]
    for g in geoms(WKT.loads(w)):
        if not isinstance(g, LineString): continue
        pts = tcoords(g.coords); put(line_cells(pts, r), cv, pr)
        if cl in ('trunk', 'motorway', 'primary', 'secondary'): majors.append((cl, name or '', pts))
# adelgazar calles: quita casillas de calle que forman bloques 2x2 sin cortar la red (número de Yokoi = 1)
def thin(code, iters=3):
    for it in range(iters):
        removed = 0
        for par in ((0, 0), (1, 1), (0, 1), (1, 0)):   # 4 subcampos: dos casillas del mismo subcampo nunca son vecinas
            R = np.isin(code, [ROAD, AVE, AUTO, BRIDGE]).astype(np.uint8); Rp = np.pad(R, 1)
            n = [Rp[0:-2, 1:-1], Rp[0:-2, 2:], Rp[1:-1, 2:], Rp[2:, 2:], Rp[2:, 1:-1], Rp[2:, 0:-2], Rp[1:-1, 0:-2], Rp[0:-2, 0:-2]]   # N NE E SE S SW W NW
            yok = sum(n[k] - n[k] * n[(k + 1) % 8] * n[(k + 2) % 8] for k in (0, 2, 4, 6))
            deg = n[0] + n[2] + n[4] + n[6]
            sq = (n[0] & n[1] & n[2]) | (n[2] & n[3] & n[4]) | (n[4] & n[5] & n[6]) | (n[6] & n[7] & n[0])
            yy, xx = np.indices(code.shape)
            m = (code == ROAD) & (yok == 1) & (deg >= 2) & sq.astype(bool) & ((xx & 1) == par[0]) & ((yy & 1) == par[1])
            code[m] = BLDG; prio[m] = 2; removed += int(m.sum())
        print('adelgazar', it, removed)
        if not removed: break
thin(code)
# ciclorrutas: van al lado de la vía; si caen sobre la calzada se corren a la casilla vecina libre
SIDE = [BLDG, BRICK, WALK, GRASS, PLAZA, MOUNT, CANAL, STEPS, CICLO]
for cells in cycles:
    ok = (cells[:, 0] >= 1) & (cells[:, 1] >= 1) & (cells[:, 0] < MW - 1) & (cells[:, 1] < MH - 1)
    for x, y in np.unique(cells[ok], axis=0):
        v = code[y, x]
        if v in (WATER,): continue
        if v in SIDE: code[y, x] = CICLO; prio[y, x] = 10; continue
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            if code[y + dy, x + dx] in SIDE: code[y + dy, x + dx] = CICLO; prio[y + dy, x + dx] = 10; break
# puentes: vía sobre el agua (núcleo del cauce)
core = WAT.copy(); core[1:-1, 1:-1] &= WAT[:-2, 1:-1] & WAT[2:, 1:-1] & WAT[1:-1, :-2] & WAT[1:-1, 2:]
isway = np.isin(code, [ROAD, AVE, AUTO, WALK, CICLO, STEPS])
code[core & isway] = BRIDGE
code[WAT & ~isway & (code != BRIDGE)] = WATER

# ---------------- relieve ----------------
Z = 13; tiles = {}
for f in os.listdir(os.path.join(CACHE, 'dem')):
    z, x, y = map(int, f[:-4].split('_')); a = np.asarray(Image.open(os.path.join(CACHE, 'dem', f)).convert('RGB')).astype(np.float64)
    tiles[(x, y)] = a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768
xs, ys = [k[0] for k in tiles], [k[1] for k in tiles]; X0, Y0 = min(xs), min(ys)
mos = np.zeros(((max(ys) - Y0 + 1) * 256, (max(xs) - X0 + 1) * 256))
for (x, y), a in tiles.items(): mos[(y - Y0) * 256:(y - Y0 + 1) * 256, (x - X0) * 256:(x - X0 + 1) * 256] = a
def dem(lon, lat):
    n = 2 ** Z * 256; px = (lon + 180) / 360 * n - X0 * 256
    r = np.radians(lat); py = (1 - np.log(np.tan(r) + 1 / np.cos(r)) / math.pi) / 2 * n - Y0 * 256
    i, j = np.floor(px).astype(int), np.floor(py).astype(int); fx, fy = px - i, py - j
    return (mos[j, i] * (1 - fx) * (1 - fy) + mos[j, i + 1] * fx * (1 - fy) + mos[j + 1, i] * (1 - fx) * fy + mos[j + 1, i + 1] * fx * fy)
gx, gy = np.meshgrid(np.arange(EW) * ES, np.arange(EH) * ES)
E = dem(LON0 + gx / KX, LATN - gy / KY)
k = np.array([1, 4, 6, 4, 1], float); k /= k.sum()           # suavizado leve (ruido del SRTM)
for ax in (0, 1): E = np.apply_along_axis(lambda v: np.convolve(np.pad(v, 2, mode='edge'), k, 'valid'), ax, E)
E = np.round(E).astype(np.int16)
print('relieve', int(E.min()), '..', int(E.max()), 'm')
# pendiente por casilla (para comunas en ladera y montes)
ef = E.astype(np.float32); yy, xx = np.mgrid[0:MH, 0:MW].astype(np.float32) / ES; i0, j0 = xx.astype(int), yy.astype(int); fx, fy = xx - i0, yy - j0
up = ef[j0, i0] * (1 - fx) * (1 - fy) + ef[j0, i0 + 1] * fx * (1 - fy) + ef[j0 + 1, i0] * (1 - fx) * fy + ef[j0 + 1, i0 + 1] * fx * fy; del yy, xx, i0, j0, fx, fy
gyy, gxx = np.gradient(up, TILE); SLOPE = np.hypot(gxx, gyy)

# ---------------- relleno: ciudad, ladrillo, potrero, monte ----------------
road = np.isin(code, [ROAD, AVE, AUTO, BRIDGE])
def box(m, r):  # cuenta en ventana (2r+1)^2
    s = np.pad(m.astype(np.int32), ((r + 1, r), (r + 1, r))).cumsum(0).cumsum(1)
    return s[2 * r + 1:, 2 * r + 1:] - s[:-2 * r - 1, 2 * r + 1:] - s[2 * r + 1:, :-2 * r - 1] + s[:-2 * r - 1, :-2 * r - 1]
dens = box(road, 5)
urban = (URB | (dens >= 11)) & (SLOPE < .6)
way = np.isin(code, [ROAD, AVE, AUTO, BRIDGE, WALK, CICLO, STEPS])
nearway = box(way, 2) > 0
empty = prio == 0
rnd = np.random.default_rng(7).random((MH, MW))
fill = np.where(urban, np.where((SLOPE > .14) | (rnd < .05), BRICK, BLDG), np.where(nearway & (SLOPE < .55), GRASS, MOUNT))
code[empty] = fill[empty]
code[(code == BLDG) & (rnd < .012)] = GRASS                        # patios y lotes
# andenes junto a avenidas y autopistas
big = np.isin(code, [AVE, AUTO]); nb = np.zeros_like(big); nb[1:] |= big[:-1]; nb[:-1] |= big[1:]; nb[:, 1:] |= big[:, :-1]; nb[:, :-1] |= big[:, 1:]
code[nb & np.isin(code, [BLDG, BRICK])] = WALK
# fuera del Área Metropolitana: montaña
code[MUNI == 0] = MOUNT
print('casillas por tipo', {k: int((code == v).sum()) for k, v in [('vía', ROAD), ('avenida', AVE), ('autopista', AUTO), ('ciclo', CICLO), ('andén', WALK), ('edificios', BLDG), ('ladrillo', BRICK), ('pasto', GRASS), ('monte', MOUNT), ('agua', WATER)]})

# ---------------- líneas: carriles de carros y semáforos ----------------
def chain(items, oneway):
    """une tramos con el mismo nombre y clase que comparten extremo -> polilíneas largas"""
    out, used = [], [False] * len(items); ends = {}
    key = lambda p: (round(p[0], 2), round(p[1], 2))
    for i, (k, pts) in enumerate(items): ends.setdefault((k, key(pts[0])), []).append(i); ends.setdefault((k, key(pts[-1])), []).append(i)
    for i, (k, pts) in enumerate(items):
        if used[i]: continue
        used[i] = True; line = [tuple(p) for p in pts]
        for fwd in (True, False):
            while True:
                e = line[-1] if fwd else line[0]; nxt = None
                for j in ends.get((k, key(e)), []):
                    if used[j]: continue
                    q = items[j][1]
                    if key(q[0]) == key(e): seg = [tuple(p) for p in q]
                    elif key(q[-1]) == key(e) and not oneway: seg = [tuple(p) for p in q[::-1]]
                    else: continue
                    if not fwd: seg = seg[::-1]
                    nxt = (j, seg); break
                if not nxt: break
                used[nxt[0]] = True; line = line + nxt[1][1:] if fwd else nxt[1][:-1] + line
        out.append((k, line))
    return out
lanes = []
for oneway, cls in ((True, ('trunk', 'motorway')), (False, ('primary', 'secondary'))):
    items = [((cl if cl != 'motorway' else 'trunk', nm), p) for cl, nm, p in majors if cl in cls]
    for (cl, nm), line in chain(items, oneway):
        g = LineString(line).simplify(.35)
        if g.length < 8: continue
        cs = list(g.coords)
        mx, my = sum(p[0] for p in cs) / len(cs), sum(p[1] for p in cs) / len(cs)
        if not (0 <= mx < MW and 0 <= my < MH) or MUNI[int(my), int(mx)] == 0: continue
        lanes.append({'c': cl[0], 'n': nm, 'o': 1 if oneway else 0, 'p': [int(round(v * 4)) for p in cs for v in p]})
print('carriles', len(lanes))
# semáforos: extremos compartidos por dos vías principales distintas
nodes = {}
for cl, nm, p in majors:
    for e in (p[0], p[-1]): nodes.setdefault((round(e[0], 1), round(e[1], 1)), set()).add(nm or cl)
lights = []
for (x, y), names in nodes.items():
    if len(names) < 2 or not (0 <= x < MW and 0 <= y < MH) or MUNI[int(y), int(x)] == 0: continue
    if any(abs(x - a) < 5 and abs(y - b) < 5 for a, b in lights): continue
    lights.append((x, y))
print('semáforos', len(lights))

# ---------------- Metro, tranvía y río ----------------
METRO = {
 'A': [('Niquía', 6.3377, -75.5440), ('Bello', 6.3303, -75.5536), ('Madera', 6.3158, -75.5554), ('Acevedo', 6.3000, -75.5583), ('Tricentenario', 6.2903, -75.5646),
       ('Caribe', 6.2775, -75.5697), ('Universidad', 6.2694, -75.5660), ('Hospital', 6.2633, -75.5636), ('Prado', 6.2567, -75.5659), ('Parque Berrío', 6.2503, -75.5683),
       ('San Antonio', 6.2470, -75.5698), ('Alpujarra', 6.2425, -75.5715), ('Exposiciones', 6.2384, -75.5733), ('Industriales', 6.2302, -75.5755), ('Poblado', 6.2125, -75.5779),
       ('Aguacatala', 6.1934, -75.5817), ('Ayurá', 6.1866, -75.5858), ('Envigado', 6.1746, -75.5972), ('Itagüí', 6.1630, -75.6066), ('Sabaneta', 6.1570, -75.6166), ('La Estrella', 6.1540, -75.6265)],
 'B': [('San Antonio', 6.2470, -75.5698), ('Cisneros', 6.2490, -75.5749), ('Suramericana', 6.2532, -75.5826), ('Estadio', 6.2533, -75.5882), ('Floresta', 6.2586, -75.5978),
       ('Santa Lucía', 6.2577, -75.6066), ('San Javier', 6.2566, -75.6136)]}
rail = {'subway': [], 'tram': []}
for cl, nm, w in rows(f"select class, name, wkt from '{P('rail')}' where class in ('subway','tram')"):
    for g in geoms(WKT.loads(w)):
        if isinstance(g, LineString): rail[cl].append(tcoords(g.coords))
def dense(lines):
    pts = []
    for p in lines:
        for (x0, y0), (x1, y1) in zip(p[:-1], p[1:]):
            n = max(1, int(math.hypot(x1 - x0, y1 - y0) / 1.5)); t = np.linspace(0, 1, n + 1)
            pts.append(np.stack([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t], 1))
    return np.concatenate(pts)
def follow(stops, lines, corridor=12):
    """polilínea que sigue la vía real entre paradas consecutivas"""
    R = dense(lines); st = [np.array(T(lon, lat)) for _, lat, lon in stops]
    st = [R[np.argmin(((R - s) ** 2).sum(1))] for s in st]          # paradas pegadas a la vía
    path, idx = [], []
    for a, b in zip(st[:-1], st[1:]):
        ab = b - a; L2 = (ab ** 2).sum() or 1; t = ((R - a) @ ab) / L2; q = a + np.outer(np.clip(t, 0, 1), ab)
        m = (t > 0) & (t < 1) & (((R - q) ** 2).sum(1) < corridor ** 2); seg = R[m][np.argsort(t[m])]
        idx.append(len(path)); path.append(tuple(a))
        # promedio por tramos para ignorar la doble vía
        if len(seg):
            tt = np.sort(t[m]); bins = np.linspace(0, 1, max(2, int(math.sqrt(L2) / 6)) + 1)
            for b0, b1 in zip(bins[:-1], bins[1:]):
                mm = (tt >= b0) & (tt < b1)
                if mm.sum(): path.append(tuple(seg[mm].mean(0)))
    idx.append(len(path)); path.append(tuple(st[-1]))
    return path, idx
metro = {}
for k, stops in METRO.items():
    path, idx = follow(stops, rail['subway'])
    g = LineString(path).simplify(.6); pts = list(g.coords)
    stp = [min(range(len(pts)), key=lambda j: (pts[j][0] - path[i][0]) ** 2 + (pts[j][1] - path[i][1]) ** 2) for i in idx]
    metro[k] = {'p': [int(round(v * 4)) for p in pts for v in p], 'st': [[stops[i][0], int(round(path[idx[i]][0] * 4)), int(round(path[idx[i]][1] * 4))] for i in range(len(stops))]}
TRAM = [('San Antonio', 6.2470, -75.5698), ('San José', 6.2470, -75.5658), ('Pabellón del Agua', 6.2459, -75.5620), ('Bicentenario', 6.2445, -75.5585), ('Buenos Aires', 6.2410, -75.5560),
        ('Miraflores', 6.2400, -75.5520), ('Loyola', 6.2393, -75.5478), ('Alejandro Echavarría', 6.2357, -75.5420), ('Oriente', 6.2350, -75.5385)]
tp, ti = follow(TRAM, rail['tram'], corridor=10)
tg = LineString(tp).simplify(.4)
metro['T'] = {'p': [int(round(v * 4)) for p in tg.coords for v in p], 'st': [[TRAM[i][0], int(round(tp[ti[i]][0] * 4)), int(round(tp[ti[i]][1] * 4))] for i in range(len(TRAM))]}
# río Medellín: línea central de sur a norte
rv = chain([(('r', 'Río Medellín'), tcoords(g.coords)) for n, g in river_lines if n == 'Río Medellín'], False)
rv = max(rv, key=lambda kl: LineString(kl[1]).length)[1]
if rv[0][1] < rv[-1][1]: rv = rv[::-1]
river = [int(round(v * 4)) for p in LineString(rv).simplify(.8).coords for v in p]

# ---------------- salida ----------------
mu8 = MUNI[::8, ::8].astype(np.uint8); co8 = COM[::8, ::8].astype(np.uint8)
dE = np.diff(np.concatenate([E[:, :1] * 0, E], 1), axis=1).astype(np.int16)        # deltas por fila
blob = code.tobytes() + dE.tobytes() + mu8.tobytes() + co8.tobytes()
comp = zlib.compressobj(9, zlib.DEFLATED, -15); data = comp.compress(blob) + comp.flush()
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'valle.bin'), 'wb').write(data)
meta = {'v': 1, 'W': MW, 'H': MH, 'tile': TILE, 'lon0': LON0, 'latN': LATN, 'kx': KX, 'ky': KY, 'es': ES, 'eW': EW, 'eH': EH, 'mW': mu8.shape[1], 'mH': mu8.shape[0],
        'munis': MUNIS, 'comunas': [n for n, _ in comunas], 'lanes': lanes, 'lights': [[int(round(x * 4)), int(round(y * 4))] for x, y in lights], 'metro': metro, 'river': river,
        'src': 'Datos del mapa: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps Foundation. Relieve: Terrain Tiles (AWS Open Data, SRTM/NASA).'}
open(os.path.join(OUT, 'valle.json'), 'w').write(json.dumps(meta, ensure_ascii=False, separators=(',', ':')))
print('valle.bin', len(data) // 1024, 'KB (sin comprimir', len(blob) // 1024, 'KB) · valle.json', os.path.getsize(os.path.join(OUT, 'valle.json')) // 1024, 'KB')
# vista previa para revisar a ojo
pal = np.array([[79, 143, 69], [36, 80, 44], [138, 74, 48], [86, 101, 124], [43, 50, 64], [56, 66, 87], [125, 134, 150], [155, 211, 65], [61, 140, 176], [119, 119, 119], [207, 196, 166], [56, 66, 87], [255, 255, 255], [200, 200, 200], [20, 20, 28], [86, 199, 255], [160, 120, 90]], np.uint8)
Image.fromarray(pal[code]).save(os.path.join(CACHE, 'preview.png'))
