"""Construye el mapa real del Valle de Aburrá para Juega EnCicla (v3: casillas de 10 m).
   Entrada: tools/geo/cache/ (fetch.py: OpenStreetMap vía Overture, huellas de edificios y relieve;
            oficial.py: capas oficiales de Medellín, Itagüí, Envigado y Sabaneta).
   Salida: src/data/valle.bin (casillas, relieve, municipios, comunas, barrios, alturas y lotes), src/data/vias.bin y src/data/valle.json.
   Uso: python3 tools/geo/build.py      (TILE=20 python3 tools/geo/build.py rehace el mapa antiguo de 20 m)
   Necesita: pip install duckdb numpy pillow shapely
   Fila 0 = norte. Todo lo que queda fuera de los 10 municipios del Área Metropolitana es montaña.
   Datos: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; huellas de edificios de Overture Maps (OSM, Microsoft y Google, ODbL);
   Alcaldía de Medellín (Catastro: manzanas, malla vial, jerarquía vial, espacio público, lotes y barrios) y barrios de Itagüí, Envigado y Sabaneta;
   relieve: Terrain Tiles (AWS Open Data, SRTM/NASA).
"""
import duckdb, json, math, os, re, zlib, struct
import numpy as np
import shapely
from PIL import Image, ImageDraw
from shapely import wkt as WKT
from shapely.geometry import LineString, MultiLineString, Polygon, MultiPolygon, GeometryCollection, shape
from shapely.strtree import STRtree

HERE = os.path.dirname(os.path.abspath(__file__)); CACHE = os.path.join(HERE, 'cache'); OUT = os.path.join(HERE, '..', '..', 'src', 'data')
OFI = os.path.join(CACHE, 'oficial')
LON0, LON1, LATN, LATS = -75.70, -75.31, 6.46, 6.015
TILE = float(os.environ.get('TILE', '10'))
S = 20.0 / TILE                          # escala frente al mapa de 20 m: radios y ventanas en casillas se multiplican por S
KX = 111320 * math.cos(math.radians((LATN + LATS) / 2)) / TILE
KY = 110574 / TILE
MW, MH = int(math.ceil((LON1 - LON0) * KX)), int(math.ceil((LATN - LATS) * KY))
ES = int(round(80 / TILE))               # relieve: una muestra cada 80 m
EW, EH = MW // ES + 2, MH // ES + 2
VQ = int(round(8 / S))                   # vías: puntos en fracciones de casilla (2,5 m)
CL = 8                                   # celdas de municipios, comunas, barrios, alturas y lotes: 8 casillas
print('casillas', MW, 'x', MH, '=', MW * MH, '· casilla de', TILE, 'm')
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
def ofi(n):
    f = os.path.join(OFI, n + '.json')
    return json.load(open(f, encoding='utf-8'))['features'] if os.path.exists(f) else []
def toT(g):   # geometría lon/lat -> casillas (vectorizado)
    return shapely.transform(g, lambda xy: np.column_stack([(xy[:, 0] - LON0) * KX, (LATN - xy[:, 1]) * KY]))
def box(m, r):  # cuenta en ventana (2r+1)^2
    r = int(r); s = np.pad(m.astype(np.int32), ((r + 1, r), (r + 1, r))).cumsum(0).cumsum(1)
    return s[2 * r + 1:, 2 * r + 1:] - s[:-2 * r - 1, 2 * r + 1:] - s[2 * r + 1:, :-2 * r - 1] + s[:-2 * r - 1, :-2 * r - 1]
def n4(m):   # algún vecino de 4 en la máscara
    o = np.zeros_like(m); o[1:] |= m[:-1]; o[:-1] |= m[1:]; o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]; return o

# ---------------- rasterizado ----------------
code = np.zeros((MH, MW), np.uint8); prio = np.zeros((MH, MW), np.uint8)
def put(cells, cv, pr):
    if not len(cells): return
    cx, cy = cells[:, 0], cells[:, 1]; ok = (cx >= 0) & (cy >= 0) & (cx < MW) & (cy < MH); cx, cy = cx[ok], cy[ok]
    m = prio[cy, cx] < pr; code[cy[m], cx[m]] = cv; prio[cy[m], cx[m]] = pr
def putm(mask, cv, pr):
    m = mask & (prio < pr); code[m] = cv; prio[m] = pr
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
def poly_mask(polys, val=1, img=None, k=1.0, tile=False):
    """rellena polígonos (lon/lat, o casillas si tile=True) en una imagen de MW/k x MH/k"""
    img = img or Image.new('L', (int(math.ceil(MW / k)), int(math.ceil(MH / k))), 0); d = ImageDraw.Draw(img)
    f = (lambda x, y: (x / k, y / k)) if tile else (lambda x, y: (T(x, y)[0] / k, T(x, y)[1] / k))
    for g in polys:
        if not isinstance(g, Polygon) or g.area <= 0: continue
        ext = [f(x, y) for x, y in g.exterior.coords]
        if len(ext) >= 3: d.polygon(ext, fill=val)
        for h in g.interiors:
            hh = [f(x, y) for x, y in h.coords]
            if len(hh) >= 3: d.polygon(hh, fill=0)
    return img

# ---------------- municipios y comunas ----------------
muni = Image.new('L', (MW, MH), 0)
for i, name in enumerate(MUNIS):
    for (w,) in rows(f"select wkt from '{P('div')}' where subtype='county' and name='{name}'"):
        poly_mask(geoms(WKT.loads(w)), i + 1, muni)
MUNI = np.array(muni); del muni
# comunas de Medellín: del límite catastral oficial (si está); si no, de Overture
COMUNA_N = {'POPULAR': 'Comuna 1 - Popular', 'SANTA CRUZ': 'Comuna 2 - Santa Cruz', 'MANRIQUE': 'Comuna 3 - Manrique', 'ARANJUEZ': 'Comuna 4 - Aranjuez', 'CASTILLA': 'Comuna 5 - Castilla',
            'DOCE DE OCTUBRE': 'Comuna 6 - Doce de Octubre', 'ROBLEDO': 'Comuna 7 - Robledo', 'VILLA HERMOSA': 'Comuna 8 - Villa Hermosa', 'BUENOS AIRES': 'Comuna 9 - Buenos Aires',
            'LA CANDELARIA': 'Comuna 10 - La Candelaria', 'LAURELES': 'Comuna 11 - Laureles-Estadio', 'LA AMERICA': 'Comuna 12 - La América', 'SAN JAVIER': 'Comuna 13 - San Javier',
            'EL POBLADO': 'Comuna 14 - El Poblado', 'GUAYABAL': 'Comuna 15 - Guayabal', 'BELEN': 'Comuna 16 - Belén', 'PALMITAS': 'Corregimiento San Sebastián de Palmitas',
            'SAN CRISTOBAL': 'Corregimiento San Cristóbal', 'ALTAVISTA': 'Corregimiento Altavista', 'SAN ANTONIO DE PRADO': 'Corregimiento San Antonio de Prado', 'SANTA ELENA': 'Corregimiento Santa Elena'}
BMDE = ofi('barrios_mde')
if BMDE:
    comunas = sorted(set(COMUNA_N.get((f['properties'].get('nombre_com') or '').strip(), '') for f in BMDE) - {''}, key=lambda n: (n.startswith('Corr'), int(re.sub(r'\D', '', n.split(' - ')[0]) or 99), n))
    cid = {n: i + 1 for i, n in enumerate(comunas)}
    com = Image.new('L', (MW, MH), 0)
    for f in BMDE:
        n = COMUNA_N.get((f['properties'].get('nombre_com') or '').strip())
        if n and f['geometry']: poly_mask(geoms(shape(f['geometry'])), cid[n], com)
else:
    comunas = [n for (n, _) in rows(f"select name, wkt from '{P('div')}' where subtype='macrohood' order by name")]
    com = Image.new('L', (MW, MH), 0)
    for i, (n, w) in enumerate(rows(f"select name, wkt from '{P('div')}' where subtype='macrohood' order by name")): poly_mask(geoms(WKT.loads(w)), i + 1, com)
COM = np.array(com); del com
print('municipios', [int((MUNI == i + 1).sum()) for i in range(10)], '· comunas', len(comunas))
MDE = MUNI == 1
# barrios urbanos de Medellín (indicador U): ahí rigen las manzanas oficiales
mdeU = np.array(poly_mask([g for f in BMDE if (f['properties'].get('indicador_') or '').strip() == 'U' and f['geometry'] for g in geoms(shape(f['geometry']))])) > 0

# ---------------- usos del suelo ----------------
def lu(where): return [g for (w,) in rows(f"select wkt from '{P('landuse')}' where {where}") for g in geoms(WKT.loads(w))]
URB = np.array(poly_mask(lu("subtype in ('residential','developed','education','medical','military','religious','transportation','construction') or class in ('commercial','retail','industrial')"))) > 0
PARK = np.array(poly_mask(lu("class in ('park','garden','grass','recreation_ground','village_green','cemetery','golf_course','fairway','nature_reserve','dog_park')"))) > 0
PLZ = np.array(poly_mask(lu("class in ('plaza','pitch','playground','track','stadium','marketplace')"))) > 0
FARM = np.array(poly_mask(lu("subtype in ('agriculture','horticulture') or class in ('meadow','farmland','orchard','grassland')"))) > 0
RES = np.array(poly_mask(lu("subtype = 'residential'"))) > 0
COMM = np.array(poly_mask(lu("class in ('commercial','retail','industrial') or subtype in ('education','medical','military','transportation')"))) > 0
# espacio público oficial de Medellín: plazas y zonas verdes (con nombre para los rótulos)
EPC = {'Plaza': 2, 'Plazoleta': 2, 'Plazuela': 2, 'Parque Cívico': 2, 'Parque Recreativo': 1, 'Zona Verde Recreacional': 1, 'Ecoparque': 1, 'Mirador Panoramico': 1}
ep_plz, ep_grn, parques = [], [], []
for f in ofi('espacio_publico_mde'):
    p = f['properties'] or {}; cat = EPC.get(p.get('categoria'))
    if not cat or not f['geometry']: continue
    gs = geoms(shape(f['geometry'])); (ep_plz if cat == 2 else ep_grn).extend(gs)
    nm = (p.get('nombre') or '').strip()
    if nm and not re.match(r'(?i)^(zona verde|sin nombre|z\.?v\.?|retiro)', nm):
        g = shape(f['geometry']); A = g.area * KX * KY * TILE * TILE
        if A > (900 if cat == 2 else 2500): ct = g.representative_point(); x, y = T(ct.x, ct.y); parques.append((nm, x, y, cat, A))
PARK |= np.array(poly_mask(ep_grn)) > 0; PLZ |= np.array(poly_mask(ep_plz)) > 0
for nm, w in rows(f"select name, wkt from '{P('landuse')}' where name is not null and class in ('park','garden','recreation_ground','village_green','plaza','stadium','cemetery','nature_reserve','marketplace')"):   # parques con nombre del resto del valle
    g = WKT.loads(w)
    if g.is_empty: continue
    A = g.area * KX * KY * TILE * TILE; ct = g.representative_point(); x, y = T(ct.x, ct.y)
    if A > 2500 and 0 <= x < MW and 0 <= y < MH and MUNI[int(y), int(x)] > 0: parques.append((nm.strip(), x, y, 1, A))
# manzanas oficiales de Medellín
MZ = np.array(poly_mask([g for f in ofi('manzanas_mde') if f['geometry'] for g in geoms(shape(f['geometry']))])) > 0
print('manzanas', int(MZ.sum()), 'casillas · espacio público', len(ep_plz) + len(ep_grn), '· parques con nombre', len(parques))
putm(FARM, GRASS, 1); putm(URB, BLDG, 2); putm(PARK, GRASS, 3); putm(PLZ, PLAZA, 4)

# ---------------- huellas de edificios ----------------
BF = np.zeros((MH, MW), np.uint8)                 # 0 nada, 1 casa (ladrillo), 2 edificio
H8, W8 = int(math.ceil(MH / CL)), int(math.ceil(MW / CL))
HG = np.zeros((H8, W8), np.uint8)                 # pisos del edificio más alto de cada celda (para la altura de los bloques en 3D)
if os.path.exists(P('buildings')):
    bl = rows(f"select subtype, class, height, num_floors, wkb from '{P('buildings')}'")
    G = toT(shapely.from_wkb([r[4] for r in bl])); A = shapely.area(G) * TILE * TILE; ct = shapely.centroid(G)
    cxs, cys = shapely.get_x(ct), shapely.get_y(ct)
    ix, iy = np.clip(cxs.astype(int), 0, MW - 1), np.clip(cys.astype(int), 0, MH - 1)
    comN = np.array([''] + comunas)[COM[iy, ix]]
    zone = np.where(np.char.find(comN.astype(str), 'Poblado') >= 0, 3, np.where(np.char.find(comN.astype(str), 'Candelaria') >= 0, 2, np.where((np.char.find(comN.astype(str), 'Laureles') >= 0) | (np.char.find(comN.astype(str), 'América') >= 0), 1, 0)))
    hgt = np.array([r[2] if r[2] is not None else np.nan for r in bl], float); nfl = np.array([r[3] if r[3] is not None else np.nan for r in bl], float)
    big = np.select([A < 150, A < 400, A < 1000], [2, 3, np.choose(zone, [4, 6, 8, 12])], np.choose(zone, [3, 6, 10, 15]))
    fl = np.where(~np.isnan(nfl), nfl, np.where(~np.isnan(hgt), np.round(hgt / 3), big)).clip(1, 60)
    sub = np.array([r[0] or '' for r in bl]); comm = np.isin(sub, ['commercial', 'industrial', 'education', 'civic', 'religious', 'medical', 'transportation', 'service'])
    isB = (fl >= 5) | (A >= 600) | comm | ((zone >= 2) & (A >= 250)) | ((zone == 1) & (A >= 350))
    keep = (A >= 25) & (MUNI[iy, ix] > 0)
    print('edificios', len(bl), '· usados', int(keep.sum()), '· edificios altos', int((isB & keep).sum()))
    img = Image.new('L', (MW, MH), 0); d = ImageDraw.Draw(img)
    for val in (1, 2):   # primero las casas, encima los edificios
        for g in G[keep & (isB == (val == 2))]:
            for pg in (g.geoms if isinstance(g, MultiPolygon) else [g]):
                ext = np.asarray(pg.exterior.coords)
                if len(ext) >= 3: d.polygon([tuple(p) for p in ext], fill=val)
    BF = np.array(img); del img, d
    sel = keep & isB; np.maximum.at(HG, (np.clip(iy[sel] // CL, 0, H8 - 1), np.clip(ix[sel] // CL, 0, W8 - 1)), fl[sel].astype(np.uint8))
    del G, A, ct, bl
putm(BF == 1, BRICK, 5); putm(BF == 2, BLDG, 5)

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
    cells = line_cells(tcoords(g.coords), (1.0 if name == 'Río Medellín' else .45) * S); ok = (cells[:, 0] >= 0) & (cells[:, 1] >= 0) & (cells[:, 0] < MW) & (cells[:, 1] < MH); WAT[cells[ok, 1], cells[ok, 0]] = True
for name, g in streams: put(line_cells(tcoords(g.coords), .5), CANAL, 6)
put(np.argwhere(WAT)[:, ::-1], WATER, 7)

# ---------------- malla vial oficial de Medellín: nomenclatura y ancho ----------------
ABR = {'CL': 'Calle', 'CR': 'Carrera', 'DG': 'Diagonal', 'TV': 'Transversal', 'CQ': 'Circular', 'AV': 'Avenida', 'AK': 'Avenida Carrera', 'AC': 'Avenida Calle', 'VIA': 'Vía'}
def nomen(s):
    s = (s or '').strip()
    if not s or s.upper() == 'NULL': return ''
    p = s.split(); h = ABR.get(p[0].upper())
    if not h or len(p) < 2: return ''
    rest = ' '.join(p[1:]).upper().replace(' SUR', ' Sur').replace(' NORTE', ' Norte')
    return h + ' ' + rest
mv_g, mv = [], []
for f in ofi('malla_vial_mde'):
    if not f['geometry']: continue
    p = f['properties'] or {}
    for g in geoms(shape(f['geometry'])):
        if isinstance(g, LineString): mv_g.append(toT(g)); mv.append((nomen(p.get('via_gen')), float(p.get('Ancho') or 0), p.get('via_pot') or ''))
MV = STRtree(mv_g) if mv_g else None
jv_g, jv = [], []
for f in ofi('jerarquia_vial_mde'):
    p = f['properties'] or {}; nm = (p.get('nombre') or '').strip()
    if not f['geometry'] or not nm or nm.startswith(('Sin definir', 'Vía existente', 'Vía proyectada')): continue
    for g in geoms(shape(f['geometry'])):
        if isinstance(g, LineString): jv_g.append(toT(g)); jv.append(nm)
JV = STRtree(jv_g) if jv_g else None
def oficial(ls):
    """tramo OSM (en casillas) -> (nomenclatura, ancho en m, nombre popular) de la vía oficial más parecida a menos de 8 m"""
    if MV is None: return '', 0, ''
    mid = ls.interpolate(.5, normalized=True); a = ls.coords[0]; b = ls.coords[-1]; ang = math.atan2(b[1] - a[1], b[0] - a[0])
    best, bd = None, 8 / TILE
    for j in MV.query(mid.buffer(8 / TILE)):
        g = mv_g[j]; d = g.distance(mid)
        if d >= bd: continue
        p0 = g.coords[0]; p1 = g.coords[-1]; an = math.atan2(p1[1] - p0[1], p1[0] - p0[0]); da = abs((ang - an + math.pi / 2) % math.pi - math.pi / 2)
        if da > .5: continue
        best, bd = j, d
    pop = ''
    if JV is not None:
        for j in JV.query(mid.buffer(12 / TILE)):
            if jv_g[j].distance(mid) < 12 / TILE: pop = jv[j]; break
    return (mv[best][0], mv[best][1], pop) if best is not None else ('', 0, pop)

# ---------------- vías ----------------
RC = {  # clase -> (código, radio en casillas, prioridad). A 10 m una calle es una casilla; las avenidas y autopistas, dos o tres.
    'track': (WALK, .5, 8), 'bridleway': (WALK, .5, 8), 'path': (WALK, .5, 8), 'footway': (WALK, .5, 8), 'pedestrian': (WALK, .5, 9),
    'steps': (STEPS, .5, 10), 'service': (ROAD, .5, 12), 'unknown': (ROAD, .5, 12),
    'residential': (ROAD, .5, 13), 'unclassified': (ROAD, .5, 13), 'living_street': (ROAD, .5, 13),
    'tertiary': (ROAD, .375 * S, 14), 'secondary': (AVE, .45 * S, 15), 'primary': (AVE, .5 * S, 16), 'trunk': (AUTO, .45 * S, 17), 'motorway': (AUTO, .45 * S, 17)}
majors, cycles, vias = [], [], []
WALKISH = ('track', 'bridleway', 'path', 'footway')
VK = {'residential': 1, 'unclassified': 1, 'living_street': 1, 'service': 1, 'unknown': 1, 'tertiary': 4, 'secondary': 2, 'primary': 2, 'trunk': 3, 'motorway': 3,
      'pedestrian': 6, 'steps': 7, 'footway': 8, 'path': 8, 'track': 8, 'bridleway': 8}   # tipo de vía para el dibujo vectorial (1 calle, 4 carrera, 2 avenida, 3 autopista, 5 ciclorruta, 6 peatonal, 7 escalas, 8 sendero)
DEFW = {1: 7, 4: 10, 2: 15, 3: 12, 5: 2.5, 6: 5, 7: 3, 8: 2}   # ancho por defecto (m) si no hay dato oficial
nOf = 0
for cl, sub, name, w in rows(f"select class, subclass, name, wkt from '{P('roads')}'"):
    if cl == 'cycleway':
        for g in geoms(WKT.loads(w)):
            if isinstance(g, LineString):
                pts = tcoords(g.coords); cycles.append(line_cells(pts, .5)); vias.append((5, name or '', '', DEFW[5], pts))
        continue
    if cl not in RC or (cl == 'service' and sub in ('parking_aisle', 'driveway')): continue
    if cl == 'service' and sub != 'alley' and not name: continue   # vías de servicio sin nombre (parqueaderos, entradas privadas): no son calles
    if cl in WALKISH and sub in ('sidewalk', 'crosswalk'): continue   # andenes y cruces trazados como líneas: no son caminos propios
    cv, r, pr = RC[cl]
    for g in geoms(WKT.loads(w)):
        if not isinstance(g, LineString): continue
        pts = tcoords(g.coords)
        if cl in WALKISH:   # senderos solo en parques, plazas y monte: dentro de las manzanas son andenes y pasajes que ensucian el mapa
            ix, iy = (int(v) for v in pts[len(pts) // 2])
            if 0 <= ix < MW and 0 <= iy < MH and URB[iy, ix] and not (PARK[iy, ix] or PLZ[iy, ix]): continue
        k = VK[cl]; nom, anc, pop = '', 0, ''
        mx, my = (int(v) for v in pts[len(pts) // 2])
        if k in (1, 2, 3, 4) and 0 <= mx < MW and 0 <= my < MH and MDE[my, mx]:
            nom, anc, pop = oficial(LineString(pts))
            if nom or anc: nOf += 1
        nm = name or (pop if k in (2, 3) else '') or nom
        wd = anc if anc >= 3 else DEFW[k]
        if k == 3: wd = min(wd, 14)
        rr = r if cv != ROAD or anc < 13 else max(r, min(1.25, anc / TILE / 2 + .1))    # calles anchas de verdad (dato oficial): dos casillas
        put(line_cells(pts, rr), cv, pr)
        vias.append((k, nm, nom, wd, pts))
        if cl in ('trunk', 'motorway', 'primary', 'secondary'): majors.append((cl, len(vias) - 1))
print('tramos con dato oficial', nOf)

# nombres de autopistas y avenidas: un tramo sin nombre toma el del tramo vecino de la misma clase que sigue en la misma dirección
def propagate(items):
    ends = {}
    key = lambda p: (round(p[0] * 2) / 2, round(p[1] * 2) / 2)
    for i, (k, nm, nom, wd, pts) in enumerate(items):
        if k in (2, 3): ends.setdefault(key(pts[0]), []).append(i); ends.setdefault(key(pts[-1]), []).append(i)
    names = [it[1] for it in items]; total = 0
    for it in range(40):
        ch = 0
        for i, (k, nm, nom, wd, pts) in enumerate(items):
            if k not in (2, 3) or names[i]: continue
            for e, q in ((pts[0], pts[1]), (pts[-1], pts[-2])):
                da = math.atan2(e[1] - q[1], e[0] - q[0]); got = None
                for j in ends.get(key(e), []):
                    if j == i or not names[j] or items[j][0] != k: continue
                    pj = items[j][4]; f, g = (pj[0], pj[1]) if key(pj[0]) == key(e) else (pj[-1], pj[-2])
                    db = math.atan2(g[1] - f[1], g[0] - f[0]); dd = abs((da - db + math.pi) % (2 * math.pi) - math.pi)
                    if dd < .6: got = names[j]; break
                if got: names[i] = got; ch += 1; break
        total += ch
        if not ch: break
    for i in range(len(items)): items[i] = (items[i][0], names[i]) + items[i][2:]
    return total
print('nombres heredados en autopistas y avenidas', propagate(vias))
majors = [(cl, vias[i][1], vias[i][4]) for cl, i in majors]   # carriles y semáforos con los nombres ya heredados

# adelgazar calles: quita casillas de calle que forman bloques 2x2 sin cortar la red (número de Yokoi = 1)
PX = (np.arange(MW) & 1)[None, :]; PY = (np.arange(MH) & 1)[:, None]
def thin(code, iters=3):
    for it in range(iters):
        removed = 0
        for par in ((0, 0), (1, 1), (0, 1), (1, 0)):   # 4 subcampos: dos casillas del mismo subcampo nunca son vecinas
            R = np.isin(code, [ROAD, AVE, AUTO, BRIDGE]).astype(np.uint8); Rp = np.pad(R, 1)
            n = [Rp[0:-2, 1:-1], Rp[0:-2, 2:], Rp[1:-1, 2:], Rp[2:, 2:], Rp[2:, 1:-1], Rp[2:, 0:-2], Rp[1:-1, 0:-2], Rp[0:-2, 0:-2]]   # N NE E SE S SW W NW
            yok = sum(n[k] - n[k] * n[(k + 1) % 8] * n[(k + 2) % 8] for k in (0, 2, 4, 6))
            deg = n[0] + n[2] + n[4] + n[6]
            sq = (n[0] & n[1] & n[2]) | (n[2] & n[3] & n[4]) | (n[4] & n[5] & n[6]) | (n[6] & n[7] & n[0])
            m = (code == ROAD) & (yok == 1) & (deg >= 2) & sq.astype(bool) & (PX == par[0]) & (PY == par[1])
            code[m] = BLDG; prio[m] = 2; removed += int(m.sum())
            del R, Rp, n, yok, deg, sq
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
        if v in SIDE: code[y, x] = CICLO; prio[y, x] = 11; continue
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            if code[y + dy, x + dx] in SIDE: code[y + dy, x + dx] = CICLO; prio[y + dy, x + dx] = 11; break
# puentes: vía sobre el agua (núcleo del cauce)
core = WAT.copy(); core[1:-1, 1:-1] &= WAT[:-2, 1:-1] & WAT[2:, 1:-1] & WAT[1:-1, :-2] & WAT[1:-1, 2:]
isway = np.isin(code, [ROAD, AVE, AUTO, WALK, CICLO, STEPS])
code[core & isway] = BRIDGE
code[WAT & ~isway & (code != BRIDGE)] = WATER
del core, isway

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
# río que siempre baja: el SRTM mide puentes, árboles y muros, no el agua. Se "quema" el cauce con una regresión isotónica (de Caldas a Barbosa).
rv_all = [tcoords(g.coords) for n, g in river_lines if n == 'Río Medellín']
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
rv = chain([(('r', 'Río Medellín'), p) for p in rv_all], False)
rv = max(rv, key=lambda kl: LineString(kl[1]).length)[1]
if rv[0][1] < rv[-1][1]: rv = rv[::-1]                 # de sur (fila alta) a norte
RV = LineString(rv)
def pav(y):   # regresión isotónica no creciente (pool adjacent violators)
    v, w, n = [], [], []
    for x in y:
        v.append(x); w.append(1.0); n.append(1)
        while len(v) > 1 and v[-2] < v[-1]:
            a, b = v.pop(), v.pop(); wa, wb = w.pop(), w.pop(); na, nb = n.pop(), n.pop(); v.append((a * wa + b * wb) / (wa + wb)); w.append(wa + wb); n.append(na + nb)
    out = []
    for x, k in zip(v, n): out += [x] * k
    return np.array(out)
L = RV.length; ss = np.arange(0, L, ES / 2); pp = np.array([RV.interpolate(s).coords[0] for s in ss])
ex = pp[:, 0] / ES; ey = pp[:, 1] / ES; i0 = np.clip(ex.astype(int), 0, EW - 2); j0 = np.clip(ey.astype(int), 0, EH - 2); fx = ex - i0; fy = ey - j0
prof = E[j0, i0] * (1 - fx) * (1 - fy) + E[j0, i0 + 1] * fx * (1 - fy) + E[j0 + 1, i0] * (1 - fx) * fy + E[j0 + 1, i0 + 1] * fx * fy
iso = pav(prof); ups = int((np.diff(prof[::5]) > 3).sum())
burn = 0
for (x, y), z in zip(pp, iso):   # baja las muestras del relieve a menos de 60 m del cauce hasta la curva que siempre baja
    ci, cj = x / ES, y / ES
    for j in range(int(cj) - 1, int(cj) + 3):
        for i in range(int(ci) - 1, int(ci) + 3):
            if 0 <= i < EW and 0 <= j < EH and math.hypot(i - ci, j - cj) * ES * TILE < 60 and E[j, i] > z: E[j, i] = z; burn += 1
print('río: perfil', int(prof[0]), '->', int(prof[-1]), 'm · tramos de 200 m que subían más de 3 m', ups, '· muestras quemadas', burn, '· máxima corrección', int((prof - iso).max()), 'm')
E = np.round(E).astype(np.int16)
print('relieve', int(E.min()), '..', int(E.max()), 'm')
# pendiente por casilla (para comunas en ladera y montes)
ef = E.astype(np.float32); yy, xx = np.mgrid[0:MH, 0:MW].astype(np.float32) / ES; i0, j0 = xx.astype(np.int32), yy.astype(np.int32); fx, fy = xx - i0, yy - j0
up = ef[j0, i0] * (1 - fx) * (1 - fy) + ef[j0, i0 + 1] * fx * (1 - fy) + ef[j0 + 1, i0] * (1 - fx) * fy + ef[j0 + 1, i0 + 1] * fx * fy; del yy, xx, i0, j0, fx, fy
gyy, gxx = np.gradient(up, TILE); SLOPE = np.hypot(gxx, gyy).astype(np.float32); del gyy, gxx, up

# ---------------- relleno: ciudad, ladrillo, patios, potrero, monte ----------------
road = np.isin(code, [ROAD, AVE, AUTO, BRIDGE])
dens = box(road, 5 * S)
urban = (URB | (dens >= 11 * S)) & (SLOPE < .6)
way = np.isin(code, [ROAD, AVE, AUTO, BRIDGE, WALK, CICLO, STEPS])
nearway = box(way, 2 * S) > 0
rnd = np.random.default_rng(7).random((MH, MW), dtype=np.float32)
POB = np.isin(COM, [i + 1 for i, n in enumerate(comunas) if 'Poblado' in n or 'Candelaria' in n])
free = prio <= 2                                     # sin nada propio (ni vía, ni agua, ni huella, ni parque)
fp = BF > 0
# ¿hay huellas en esta zona? (si los datos de edificios no cubren una zona, se usa la regla antigua)
fpc = box(fp, 4 * S); wc = box(~road, 4 * S); covered = fpc > .08 * wc
gapB = box(BF == 1, 1); gapE = box(BF == 2, 1)     # huecos entre casas: se rellenan con la clase vecina
old = np.where(urban, np.where((SLOPE > .14) | (rnd < .05) | (RES & ~COMM & ~POB), BRICK, BLDG), np.where(nearway & (SLOPE < .55), GRASS, MOUNT))
yard = np.where(COMM, PLAZA, GRASS)
newfill = np.where(gapB + gapE >= 4, np.where(gapE > gapB, BLDG, BRICK), np.where(urban | nearway, yard, MOUNT))
# Medellín urbano: dentro de la manzana, casa o patio; fuera de la manzana (y sin vía), andén o espacio público
mzout = np.where(n4(road), WALK, np.where(COMM, PLAZA, GRASS))
mzfill = np.where(MZ, np.where(gapB + gapE >= 3, np.where(gapE > gapB, BLDG, BRICK), yard), mzout)
fill = np.where(mdeU, np.where(covered, mzfill, np.where(MZ, old, mzout)), np.where(covered & urban, newfill, old))
code[free] = fill[free]
del old, newfill, mzfill, mzout, fill, gapB, gapE, fpc, wc, dens
code[(code == BLDG) & ~fp & ~covered & ~COMM & ~POB & (rnd < .92)] = BRICK   # sin huellas: barrios de casas; edificios en el centro, El Poblado, comercio e industria
# andenes junto a avenidas y autopistas (no sobre edificios reales)
big = np.isin(code, [AVE, AUTO]); nb = n4(big)
code[nb & np.isin(code, [BLDG, BRICK, GRASS]) & ~fp] = WALK
# escaleras sueltas (sin otra escalera ni camino al lado) que solo ensucian el dibujo
st = code == STEPS; stn = box(st, 1) - 1; wn = box(np.isin(code, [ROAD, AVE, WALK, PLAZA, CICLO]), 1)
loose = st & (stn == 0) & (wn == 0); code[loose] = GRASS; print('escaleras sueltas quitadas', int(loose.sum()))
# río continuo: a lo largo del cauce del Río Medellín no hay cortes (lo que lo cruza es puente)
rc = line_cells(np.array(rv), .55 * S); ok = (rc[:, 0] >= 0) & (rc[:, 1] >= 0) & (rc[:, 0] < MW) & (rc[:, 1] < MH); rc = rc[ok]
v = code[rc[:, 1], rc[:, 0]]; isw = np.isin(v, [ROAD, AVE, AUTO, WALK, CICLO, STEPS])
code[rc[isw, 1], rc[isw, 0]] = BRIDGE; other = ~isw & (v != BRIDGE) & (v != WATER); code[rc[other, 1], rc[other, 0]] = WATER
print('río: casillas vueltas puente', int(isw.sum()), '· vueltas agua', int(other.sum()))
# fuera del Área Metropolitana: montaña
code[MUNI == 0] = MOUNT
print('casillas por tipo', {k: int((code == v).sum()) for k, v in [('vía', ROAD), ('avenida', AVE), ('autopista', AUTO), ('ciclo', CICLO), ('andén', WALK), ('plaza', PLAZA), ('edificios', BLDG), ('ladrillo', BRICK), ('pasto', GRASS), ('monte', MOUNT), ('agua', WATER), ('quebrada', CANAL), ('puente', BRIDGE)]})

# ---------------- líneas: carriles de carros y semáforos ----------------
lanes = []
for oneway, cls in ((True, ('trunk', 'motorway')), (False, ('primary', 'secondary'))):
    items = [((cl if cl != 'motorway' else 'trunk', nm), p) for cl, nm, p in majors if cl in cls]
    for (cl, nm), line in chain(items, oneway):
        g = LineString(line).simplify(.35 * S)
        if g.length < 8 * S: continue
        cs = list(g.coords)
        mx, my = sum(p[0] for p in cs) / len(cs), sum(p[1] for p in cs) / len(cs)
        if not (0 <= mx < MW and 0 <= my < MH) or MUNI[int(my), int(mx)] == 0: continue
        lanes.append({'c': cl[0], 'n': nm, 'o': 1 if oneway else 0, 'p': [int(round(v * 4)) for p in cs for v in p]})
print('carriles', len(lanes))
# semáforos: extremos compartidos por dos vías principales distintas
nodes = {}
for cl, nm, p in majors:
    for e in (p[0], p[-1]): nodes.setdefault((round(e[0] / S, 1) * S, round(e[1] / S, 1) * S), set()).add(nm or cl)
lights = []
for (x, y), names in nodes.items():
    if len(names) < 2 or not (0 <= x < MW and 0 <= y < MH) or MUNI[int(y), int(x)] == 0: continue
    if any(abs(x - a) < 5 * S and abs(y - b) < 5 * S for a, b in lights): continue
    lights.append((x, y))
print('semáforos', len(lights))

# ---------------- Metro y tranvía ----------------
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
            n = max(1, int(math.hypot(x1 - x0, y1 - y0) / (1.5 * S))); t = np.linspace(0, 1, n + 1)
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
        if len(seg):   # promedio por tramos para ignorar la doble vía
            tt = np.sort(t[m]); bins = np.linspace(0, 1, max(2, int(math.sqrt(L2) / (6 * S))) + 1)
            for b0, b1 in zip(bins[:-1], bins[1:]):
                mm = (tt >= b0) & (tt < b1)
                if mm.sum(): path.append(tuple(seg[mm].mean(0)))
    idx.append(len(path)); path.append(tuple(st[-1]))
    return path, idx
metro = {}
for k, stops in METRO.items():
    path, idx = follow(stops, rail['subway'], 12 * S)
    g = LineString(path).simplify(.6 * S); pts = list(g.coords)
    metro[k] = {'p': [int(round(v * 4)) for p in pts for v in p], 'st': [[stops[i][0], int(round(path[idx[i]][0] * 4)), int(round(path[idx[i]][1] * 4))] for i in range(len(stops))]}
TRAM = [('San Antonio', 6.2470, -75.5698), ('San José', 6.2470, -75.5658), ('Pabellón del Agua', 6.2459, -75.5620), ('Bicentenario', 6.2445, -75.5585), ('Buenos Aires', 6.2410, -75.5560),
        ('Miraflores', 6.2400, -75.5520), ('Loyola', 6.2393, -75.5478), ('Alejandro Echavarría', 6.2357, -75.5420), ('Oriente', 6.2350, -75.5385)]
tp, ti = follow(TRAM, rail['tram'], corridor=10 * S)
tg = LineString(tp).simplify(.2 * S)
metro['T'] = {'p': [int(round(v * 4)) for p in tg.coords for v in p], 'st': [[TRAM[i][0], int(round(tp[ti[i]][0] * 4)), int(round(tp[ti[i]][1] * 4))] for i in range(len(TRAM))]}
river = [int(round(v * 4)) for p in RV.simplify(.8 * S).coords for v in p]

# ---------------- Metroplús: de estación a estación por las avenidas reales (datos de líneas: tools/geo/lineas.json, de El Metro) ----------------
import heapq
LJ = json.load(open(os.path.join(HERE, 'lineas.json'), encoding='utf-8'))['lineas']
def snap(x, y, kinds, R):
    best, bd = None, 1e9
    for j in range(int(y) - R, int(y) + R + 1):
        for i in range(int(x) - R, int(x) + R + 1):
            if 0 <= i < MW and 0 <= j < MH and code[j, i] in kinds:
                d = (i + .5 - x) ** 2 + (j + .5 - y) ** 2
                if d < bd: bd, best = d, (i, j)
    return best
def ruta(a, b):
    m = int(30 * S); x0, y0 = max(0, min(a[0], b[0]) - m), max(0, min(a[1], b[1]) - m); x1, y1 = min(MW - 1, max(a[0], b[0]) + m), min(MH - 1, max(a[1], b[1]) + m)
    W, H = x1 - x0 + 1, y1 - y0 + 1; sub = code[y0:y1 + 1, x0:x1 + 1]
    cost = np.zeros(sub.shape); cost[np.isin(sub, [AVE, AUTO, BRIDGE])] = 1.0; cost[sub == ROAD] = 2.5; cost = cost.ravel()
    s0, t0 = (a[1] - y0) * W + a[0] - x0, (b[1] - y0) * W + b[0] - x0
    D = np.full(W * H, np.inf); D[s0] = 0; prev = np.full(W * H, -1, np.int64); h = [(0.0, s0)]
    while h:
        d, u = heapq.heappop(h)
        if u == t0: break
        if d > D[u]: continue
        ux, uy = u % W, u // W
        for dx, dy, k in ((1, 0, 1), (-1, 0, 1), (0, 1, 1), (0, -1, 1), (1, 1, 1.414), (1, -1, 1.414), (-1, 1, 1.414), (-1, -1, 1.414)):
            vx, vy = ux + dx, uy + dy
            if not (0 <= vx < W and 0 <= vy < H): continue
            v = vy * W + vx; c2 = cost[v]
            if not c2: continue
            nd = d + c2 * k
            if nd < D[v]: D[v] = nd; prev[v] = u; heapq.heappush(h, (nd, v))
    if not np.isfinite(D[t0]): return [a, b]
    out, u = [], t0
    while u != -1: out.append((u % W + x0, u // W + y0)); u = prev[u]
    return out[::-1]
mp = []
for L in LJ:
    if L['tipo'] != 'brt': continue
    st = []
    for n, la, lo in L['estaciones']:
        x, y = T(lo, la); q = snap(x, y, (AVE, AUTO), int(4 * S)) or snap(x, y, (ROAD, AVE, AUTO, BRIDGE), int(6 * S)) or (int(x), int(y)); st.append((n, q))
    path = [st[0][1]]
    for (_, a), (_, b) in zip(st[:-1], st[1:]): path += ruta(a, b)[1:]
    g = LineString([(x + .5, y + .5) for x, y in path]).simplify(.5 * S)
    mp.append({'id': L['id'], 'n': L['nombre'], 'c': L['color'], 'p': [int(round(v * 4)) for p in g.coords for v in p], 'st': [[n, int(round((q[0] + .5) * 4)), int(round((q[1] + .5) * 4))] for n, q in st]})
print('Metroplús', [(l['id'], len(l['st']), len(l['p']) // 2) for l in mp])

# ---------------- vías como vectores (para dibujar cada calle como es) ----------------
from shapely.ops import linemerge
grp = {}
for k, name, nom, wd, pts in vias: grp.setdefault((k, name, nom), []).append((LineString(pts), wd))
VIAS = []
for (k, name, nom), lw in grp.items():
    ls = [l for l, _ in lw]; wd = float(np.median([w for _, w in lw]))
    for g in geoms(linemerge(ls) if len(ls) > 1 else ls[0]):
        if not isinstance(g, LineString): continue
        q = np.round(np.array(g.simplify(.06 * S).coords) * VQ).astype(np.int32)
        keep = np.ones(len(q), bool); keep[1:] = np.any(np.diff(q, axis=0) != 0, axis=1); q = q[keep]
        if len(q) < 2: continue
        ix, iy = (int(v) for v in q[len(q) // 2] / VQ)
        if not (0 <= ix < MW and 0 <= iy < MH) or MUNI[iy, ix] == 0: continue
        for a0 in range(0, len(q) - 1, 60000): VIAS.append((k, name, nom, wd, q[a0:a0 + 60001]))
calles = sorted({n for _, n, _, _, _ in VIAS if n} | {n for _, _, n, _, _ in VIAS if n}); cidx = {n: i + 1 for i, n in enumerate(calles)}
vb = bytearray(struct.pack('<I', len(VIAS)))
for k, name, nom, wd, q in VIAS:   # v3: tipo, nombre, nomenclatura oficial, ancho (medios metros), n.º de puntos
    vb += struct.pack('<BHHBH', k, cidx.get(name, 0), cidx.get(nom, 0), int(min(255, round(wd * 2))), len(q)); vb += np.concatenate([q[:1], np.diff(q, axis=0)]).astype('<i2').tobytes()
comp = zlib.compressobj(9, zlib.DEFLATED, -15); vdata = comp.compress(bytes(vb)) + comp.flush()
open(os.path.join(OUT, 'vias.bin'), 'wb').write(vdata)
named = {k: [0, 0] for k in range(1, 9)}
for k, name, nom, wd, q in VIAS: named[k][0] += 1; named[k][1] += 1 if name else 0
print('vías', len(VIAS), 'líneas ·', sum(len(q) for *_, q in VIAS), 'puntos ·', len(calles), 'nombres · vias.bin', len(vdata) // 1024, 'KB · con nombre por tipo', {k: f'{v[1]}/{v[0]}' for k, v in named.items() if v[0]})

# ---------------- barrios y veredas (celdas de 8 casillas) ----------------
# oficiales: Medellín (límite catastral), Itagüí, Envigado y Sabaneta; en el resto, el punto con nombre más cercano (aproximado)
def tidy(n):
    n = re.sub(r'\s+', ' ', (n or '').strip())
    if n.isupper(): n = n.title().replace(' De ', ' de ').replace(' Del ', ' del ').replace(' La ', ' la ').replace(' Los ', ' los ').replace(' Las ', ' las ').replace(' El ', ' el ').replace(' Y ', ' y ')
    return n[:1].upper() + n[1:]
OFB = [('barrios_mde', 'nombre_bar', 1), ('barrios_itagui', 'NOM_BARRIO', 3), ('barrios_envigado', 'nom_barrio', 4), ('barrios_sabaneta', 'NOMBRE', 5)]
bpolys = []
for f, fld, mi in OFB:
    for ft in ofi(f):
        n = tidy((ft['properties'] or {}).get(fld))
        if n and ft['geometry']: bpolys.append((n, mi, geoms(shape(ft['geometry']))))
BAD = ('Comuna', 'Parque', 'Plaza', 'Urbaniz', 'Conjunto', 'Unidad Residencial', 'Edificio', 'Torre', 'Mall', 'Atrio', 'Cabecera')
bpts = []
for sub, name, lat, lon in rows(f"select subtype, name, lat, lon from '{P('barrios')}' where name is not null"):
    n = name.replace('Barrio ', '').strip()
    if not n or n.startswith(BAD) or 'partamento' in n or 'asas' in n: continue
    x, y = T(lon, lat); bpts.append((n, x / CL, y / CL, 1.0 if sub == 'neighborhood' else 1.35))
barrios = sorted({b[0] for b in bpts} | {b[0] for b in bpolys}); bid = {n: i + 1 for i, n in enumerate(barrios)}
M8 = MUNI[::CL, ::CL][:H8, :W8]; by, bx = np.mgrid[0:H8, 0:W8] + .5
best = np.full((H8, W8), 1e9); ba8 = np.zeros((H8, W8), np.uint16)
ofm = {mi for _, mi, _ in bpolys}
for n, px, py, w in bpts:
    d = np.hypot(bx - px, by - py) * w; m = d < best; best[m] = d[m]; ba8[m] = bid[n]
ba8[(best > 12 * S) | (M8 == 0) | np.isin(M8, list(ofm))] = 0
bimg = Image.new('I', (W8, H8), 0); d = ImageDraw.Draw(bimg)
for n, mi, gs in bpolys:
    for g in gs:
        if not isinstance(g, Polygon): continue
        ext = [(T(x, y)[0] / CL, T(x, y)[1] / CL) for x, y in g.exterior.coords]
        if len(ext) >= 3: d.polygon(ext, fill=bid[n])
bo = np.array(bimg).astype(np.uint16)[:H8, :W8]; ba8 = np.where(bo > 0, bo, ba8)
print('barrios', len(barrios), 'nombres (', len(bpolys), 'oficiales ) ·', int((ba8 > 0).sum()), 'celdas con barrio de', int((M8 > 0).sum()))
# lotes catastrales de Medellín: área mediana del lote por celda (para dividir las casas en fila como son)
LT = np.zeros((H8, W8), np.uint8)
lots = ofi('lotes_mde')
if lots:
    la = np.array([[*T(a['attributes']['longitud'], a['attributes']['latitud']), a['attributes'].get('area_lote') or 0] for a in lots if a['attributes'].get('longitud') and a['attributes'].get('tipo_lote') in ('N', 'L')], float)
    cx8, cy8 = np.clip((la[:, 0] // CL).astype(int), 0, W8 - 1), np.clip((la[:, 1] // CL).astype(int), 0, H8 - 1); ar = la[:, 2]
    order = np.lexsort((ar, cy8 * W8 + cx8)); keys = (cy8 * W8 + cx8)[order]; ars = ar[order]
    u, st0, cnt = np.unique(keys, return_index=True, return_counts=True)
    med = ars[st0 + cnt // 2]; ok = cnt >= 4
    LT.flat[u[ok]] = np.clip(np.round(med[ok] / 4), 1, 255).astype(np.uint8)    # en unidades de 4 m²
    print('lotes', len(la), '· celdas con lote', int(ok.sum()), '· área mediana', int(np.median(ar)), 'm²')

# ---------------- salida ----------------
mu8 = MUNI[::CL, ::CL][:H8, :W8].astype(np.uint8); co8 = COM[::CL, ::CL][:H8, :W8].astype(np.uint8)
dE = np.diff(np.concatenate([E[:, :1] * 0, E], 1), axis=1).astype(np.int16)        # deltas por fila
blob = code.tobytes() + dE.tobytes() + mu8.tobytes() + co8.tobytes() + ba8.astype('<u2').tobytes() + HG.tobytes() + LT.tobytes()
comp = zlib.compressobj(9, zlib.DEFLATED, -15); data = comp.compress(blob) + comp.flush()
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'valle.bin'), 'wb').write(data)
parques.sort(key=lambda p: -p[4]); seen = set(); pq = []
for nm, x, y, cat, A in parques:
    k = nm.lower()
    if k in seen: continue
    seen.add(k); pq.append([nm, int(round(x * 4)), int(round(y * 4)), cat])
meta = {'v': 3, 'vq': VQ, 'hg': 1, 'lt': 1, 'barrios': barrios, 'calles': calles, 'vias': len(VIAS), 'viasB': len(vb), 'W': MW, 'H': MH, 'tile': TILE, 'lon0': LON0, 'latN': LATN, 'kx': KX, 'ky': KY, 'es': ES, 'eW': EW, 'eH': EH, 'mW': mu8.shape[1], 'mH': mu8.shape[0],
        'munis': MUNIS, 'comunas': comunas, 'lanes': lanes, 'lights': [[int(round(x * 4)), int(round(y * 4))] for x, y in lights], 'metro': metro, 'mp': mp, 'river': river, 'parques': pq[:700],
        'src': 'Datos del mapa: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps Foundation; Alcaldía de Medellín (Subsecretaría de Catastro, datos abiertos); barrios de Itagüí, Envigado y Sabaneta. Relieve: Terrain Tiles (AWS Open Data, SRTM/NASA).'}
open(os.path.join(OUT, 'valle.json'), 'w').write(json.dumps(meta, ensure_ascii=False, separators=(',', ':')))
print('valle.bin', len(data) // 1024, 'KB (sin comprimir', len(blob) // 1024, 'KB) · valle.json', os.path.getsize(os.path.join(OUT, 'valle.json')) // 1024, 'KB')
# vista previa para revisar a ojo
pal = np.array([[79, 143, 69], [36, 80, 44], [138, 74, 48], [86, 101, 124], [43, 50, 64], [56, 66, 87], [125, 134, 150], [155, 211, 65], [61, 140, 176], [119, 119, 119], [207, 196, 166], [56, 66, 87], [255, 255, 255], [200, 200, 200], [20, 20, 28], [86, 199, 255], [160, 120, 90]], np.uint8)
Image.fromarray(pal[code]).save(os.path.join(CACHE, 'preview.png'))
