#!/usr/bin/env python3
"""SITIOS REALES del valle: los lugares importantes con la forma, la altura y el estilo de sus edificios reales.

  python3 tools/geo/sitios.py        (después de fetch.py y build.py)
  -> src/data/sitios.bin (deflate) y src/data/sitios.json (nombres, tipos y tamaño)

Qué junta (datos de OpenStreetMap vía Overture, ODbL):
- Áreas: universidades, instituciones técnicas, colegios y escuelas, hospitales y clínicas, templos y estadios
  (land_use con nombre) con los edificios cuyo centro cae adentro.
- Edificios sueltos importantes: alcaldías (puntos de Overture places sobre su huella), Gobernación, Concejo, palacios,
  iglesias y capillas con nombre, bibliotecas, museos, coliseos, terminales, hospitales y torres con nombre.
- Todas las canchas (land_use pitch), pistas atléticas (track) y piscinas (water swimming_pool) del valle.
Estilos: se eligieron mirando el valle desde arriba (satélite, fotos aéreas y videos de dron; ver docs/MEDELLIN-DESDE-EL-AIRE.md).
Unidad: 1/8 de casilla (1,25 m). Anillos: n, x0, y0 (u16) y luego dx, dy (i16).
"""
import json, math, os, re, struct, zlib
import duckdb, numpy as np, shapely
from shapely import wkb as WKB, wkt as WKT
from shapely.geometry import Polygon, MultiPolygon, Point
from shapely.geometry.polygon import orient

R = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
C = os.path.join(R, 'tools', 'geo', 'cache'); D = os.path.join(R, 'src', 'data')
meta = json.load(open(os.path.join(D, 'valle.json'), encoding='utf-8'))
LON0, LATN, KX, KY, MW, MH = meta['lon0'], meta['latN'], meta['kx'], meta['ky'], meta['W'], meta['H']
U = 8                                   # unidades por casilla
db = duckdb.connect(); db.execute("INSTALL spatial; LOAD spatial;")
P = lambda n: os.path.join(C, n + '.parquet')

def tiles(g):   # lon/lat -> casillas
    return shapely.transform(g, lambda xy: np.column_stack([(xy[:, 0] - LON0) * KX, (LATN - xy[:, 1]) * KY]))
def polys(g):
    if g is None or g.is_empty: return []
    if isinstance(g, Polygon): return [g]
    if isinstance(g, MultiPolygon): return list(g.geoms)
    if hasattr(g, 'geoms'): return [p for x in g.geoms for p in polys(x)]
    return []
def dentro(p): b = p.bounds; return b[0] > 2 and b[1] > 2 and b[2] < MW - 2 and b[3] < MH - 2

# ---------- tipos y estilos ----------
KIND = {'uni': 1, 'cole': 2, 'salud': 3, 'iglesia': 4, 'gob': 5, 'dep': 6, 'cult': 7, 'trans': 8, 'ofi': 9}
# estilo: índice en ESTILOS del juego (75-sitios3d.js); se curan algunos por nombre según las imágenes aéreas
EST = {'ladrillo': 0, 'blanco': 1, 'concreto': 2, 'cristal': 3, 'colegio': 4, 'iglesia': 5, 'coliseo': 6, 'oscuro': 7, 'teja': 8, 'rojo': 9, 'claro': 10, 'ladrillo_gris': 11}
ROOF = {'plano': 0, 'cuatro': 1, 'dos': 2, 'helipuerto': 3, 'aguja': 4, 'cupula': 5, 'ajedrez': 6, 'cubierta': 7}
CURADO = [   # (patrón del nombre del sitio o del edificio, estilo, techo) — lo que se ve desde el aire
    (r'Universidad de Antioquia|Ciudadela Robledo|IPS Universitaria', 'teja', 'cuatro'),        # bloques de teja con patio
    (r'Universidad Nacional|Facultad de Minas', 'claro', 'plano'),                             # bloques claros entre árboles
    (r'Pontificia Bolivariana|UPB', 'ladrillo', 'cuatro'),
    (r'EAFIT', 'ladrillo', 'plano'),
    (r'Universidad de Medell', 'ladrillo', 'plano'),
    (r'ITM|Pascual Bravo|Colegio Mayor|Tecnológico de Antioquia|Politécnico', 'claro', 'plano'),
    (r'SENA', 'claro', 'plano'),
    (r'Gobernación|Alcaldía de Medellín|Torre Institucional|Alpujarra|Palacio de Justicia|Edificio Atlas|Concejo de Medell', 'concreto', 'helipuerto'),
    (r'Empresas P[uú]blicas|^EPM$|Edificio Inteligente', 'cristal', 'plano'),
    (r'Coltejer', 'claro', 'aguja'),
    (r'Bas[ií]lica Metropolitana', 'ladrillo', 'dos'),
    (r'Palacio de la Cultura', 'claro', 'ajedrez'),
    (r'Palacio Nacional', 'blanco', 'plano'),
    (r'Explora|Exploratorio', 'rojo', 'plano'),
    (r'Biblioteca España|Biblioteca Espa', 'oscuro', 'plano'),
    (r'Biblioteca EPM', 'oscuro', 'plano'),
    (r'Planetario', 'blanco', 'cupula'),
    (r'Plaza Mayor', 'blanco', 'plano'),
    (r'Terminal', 'blanco', 'plano'),
    (r'Coliseo|Estadio|Tribuna', 'coliseo', 'plano'),
]
def curado(*names):
    for nm in names:
        for pat, e, r in CURADO:
            if nm and re.search(pat, nm, re.I): return EST[e], ROOF[r]
    return None

# ---------- áreas (land_use con nombre o de educación/salud) ----------
LU = {'university': 'uni', 'college': 'uni', 'school': 'cole', 'kindergarten': 'cole', 'schoolyard': 'cole', 'hospital': 'salud', 'clinic': 'salud', 'religious': 'iglesia', 'stadium': 'dep'}
areas = []
for cl, nm, w in db.execute(f"select class, name, wkt from '{P('landuse')}' where class in ({','.join(repr(k) for k in LU)})").fetchall():
    for p in polys(tiles(WKT.loads(w))):
        p = p.buffer(0)
        if p.is_empty or p.area * 100 < 150 or not dentro(p): continue   # menos de 150 m²: no es un sitio
        areas.append({'k': LU[cl], 'name': nm or '', 'g': p})
print('áreas', len(areas), {k: sum(1 for a in areas if a['k'] == k) for k in set(LU.values())})

# ---------- edificios ----------
rows = db.execute(f"select name, class, height, num_floors, roof_shape, wkb from '{P('edificios')}'").fetchall()
G = tiles(shapely.from_wkb([r[5] for r in rows])); CT = shapely.centroid(G); AR = shapely.area(G) * 100
print('edificios', len(rows))
tree = shapely.STRtree(CT)
usado = np.zeros(len(rows), bool)

def pisos(i, k):
    nm, cl, h, nf = rows[i][0], rows[i][1], rows[i][2], rows[i][3]
    if nf: return int(max(1, min(60, nf)))
    if h: return int(max(1, min(60, round(h / 3.2))))
    a = AR[i]
    base = {'uni': 3, 'cole': 2, 'salud': 4, 'iglesia': 3, 'gob': 6, 'dep': 3, 'cult': 2, 'trans': 3, 'ofi': 8}[k]
    if cl == 'roof': return 1
    if cl in ('house', 'residential', 'detached', 'shed', 'garage', 'kiosk', 'cabin', 'guardhouse'): return 1
    if a > 2500 and k in ('uni', 'salud', 'gob'): base += 1
    if a < 120: base = min(base, 2)
    return base

def estilo_por_clase(k, i, sname):
    cu = curado(sname, rows[i][0] or '') if k == 'uni' else curado(rows[i][0] or '', sname)   # en un campus manda el estilo del campus
    if cu: return cu
    cl = rows[i][1] or ''; rs = rows[i][4] or ''
    roof = ROOF['dos'] if rs == 'gabled' else ROOF['cuatro'] if rs in ('hipped', 'mansard') else ROOF['plano']
    if k == 'iglesia' or cl in ('church', 'cathedral', 'chapel'): return EST['iglesia'], ROOF['dos']
    if k == 'cole': return EST['colegio'], ROOF['cuatro'] if AR[i] < 900 and (i * 7) % 3 else ROOF['plano']
    if k == 'salud': return EST['blanco'], ROOF['helipuerto'] if AR[i] > 2500 else ROOF['plano']
    if k == 'dep': return EST['coliseo'], ROOF['plano']
    if k == 'gob': return EST['concreto'], ROOF['plano']
    if k == 'cult': return EST['ladrillo_gris'], ROOF['plano']
    if k == 'trans': return EST['blanco'], ROOF['plano']
    if k == 'ofi': return EST['cristal'], ROOF['plano']
    return (EST['ladrillo'] if (i % 3) else EST['claro']), roof

sites, edif, ed_de = [], [], {}
def add_site(k, name, g, est=None, suelto=False):
    ps = polys(g); g = max(ps, key=lambda x: x.area) if ps else g   # el contorno del sitio es su pieza más grande
    sites.append({'k': k, 'name': name, 'g': g, 'est': est, 'suelto': suelto}); return len(sites) - 1
def add_edif(si, i, k, sname=''):
    if usado[i]: return
    g = G[i]; ps = [p for p in polys(g) if p.area * 100 >= 15]
    if not ps: return
    usado[i] = True; e, r = estilo_por_clase(k, i, sname)
    if (rows[i][1] or '') == 'roof': r = ROOF['cubierta']
    for p in ps: edif.append({'s': si, 'k': k, 'fl': pisos(i, k), 'roof': r, 'est': e, 'name': rows[i][0] or '', 'g': p}); ed_de.setdefault(i, []).append(edif[-1])

# áreas grandes primero: un edificio queda en el sitio más grande que lo contiene
areas.sort(key=lambda a: -a['g'].area)
for a in areas:
    si = add_site(a['k'], a['name'], a['g'])
    for i in tree.query(a['g'], predicate='contains'):
        cl = rows[i][1] or ''
        if cl in ('house', 'residential', 'apartments', 'detached', 'semidetached_house') and a['k'] != 'iglesia': continue
        add_edif(si, int(i), a['k'], a['name'])

# alcaldías: el punto de Overture places cae sobre su huella (o a menos de 25 m)
ALC = []
for nm, lat, lon, conf in db.execute(f"select name, lat, lon, confidence from '{P('lugares_poi')}' where (tax in ('town_hall','government_office','city_hall') or cat = 'government_office') and (lower(name) like 'alcald%' or lower(name) like 'gobernaci%' or lower(name) like 'centro administrativo%' or lower(name) like 'concejo de%') and confidence > .6").fetchall():
    ALC.append((nm, lat, lon))
n_alc = 0
for nm, lat, lon in ALC:
    pt = Point((lon - LON0) * KX, (LATN - lat) * KY)
    if not (2 < pt.x < MW - 2 and 2 < pt.y < MH - 2): continue
    best, bd = None, 9e9
    for i in tree.query(pt.buffer(2.5)):
        d = G[i].distance(pt)
        if d < bd and AR[i] > 120: bd, best = d, int(i)
    if best is None or bd > 2.5: continue
    if usado[best]:   # ya estaba en un área: toma el nombre y el estilo de gobierno
        for e in ed_de.get(best, []): e['name'] = e['name'] or nm; e['k'] = 'gob'; e['est'], e['roof'] = curado(nm) or (EST['concreto'], ROOF['plano'])
        continue
    si = add_site('gob', nm, G[best].buffer(.4), suelto=True); add_edif(si, best, 'gob', nm); n_alc += 1
print('alcaldías y gobernación sueltas', n_alc)

# edificios sueltos importantes con nombre
PAT = re.compile(r'alcald|gobernaci|concejo|palacio|centro administrativo|torre institucional|biblioteca|museo|teatro|bas[ií]lica|catedral|parroquia|iglesia|templo|capilla|santuario|coliseo|estadio|tribuna|hospital|cl[ií]nica|terminal|planetario|explora|coltejer|empresas p[uú]blicas|^epm$|plaza mayor|universidad|colegio|instituci[oó]n educativa|escuela|liceo', re.I)
CLS = {'government': 'gob', 'civic': 'gob', 'public': 'gob', 'church': 'iglesia', 'cathedral': 'iglesia', 'chapel': 'iglesia', 'religious': 'iglesia', 'library': 'cult', 'museum': 'cult',
       'hospital': 'salud', 'transportation': 'trans', 'stadium': 'dep', 'sports_centre': 'dep', 'sports_hall': 'dep', 'grandstand': 'dep', 'school': 'cole', 'university': 'uni', 'college': 'uni', 'kindergarten': 'cole'}
def kind_nombre(nm, cl):
    s = nm.lower()
    if re.search(r'alcald|gobernaci|concejo|centro administrativo|torre institucional|palacio de justicia', s): return 'gob'
    if re.search(r'bas[ií]lica|catedral|parroquia|iglesia|templo|capilla|santuario', s): return 'iglesia'
    if re.search(r'hospital|cl[ií]nica', s): return 'salud'
    if re.search(r'coliseo|estadio|tribuna', s): return 'dep'
    if re.search(r'terminal', s): return 'trans'
    if re.search(r'biblioteca|museo|teatro|planetario|explora|palacio', s): return 'cult'
    if re.search(r'universidad', s): return 'uni'
    if re.search(r'colegio|instituci[oó]n educativa|escuela|liceo', s): return 'cole'
    if re.search(r'coltejer|empresas p[uú]blicas|^epm$|plaza mayor', s): return 'ofi'
    return CLS.get(cl)
n_s = 0
for i, r in enumerate(rows):
    if usado[i] or not r[0]: continue
    nm, cl = r[0], r[1] or ''
    if not (PAT.search(nm) or cl in CLS): continue
    k = kind_nombre(nm, cl)
    if not k or AR[i] < 60: continue
    g = G[i]
    if not polys(g) or not dentro(polys(g)[0]): continue
    si = add_site(k, nm, g.buffer(.4), suelto=True); add_edif(si, i, k, nm); n_s += 1
print('edificios sueltos con nombre', n_s)

# ---------- canchas, pistas y piscinas ----------
def rect(p):
    m = p.minimum_rotated_rectangle; c = list(m.exterior.coords)[:4]
    e1 = (c[1][0] - c[0][0], c[1][1] - c[0][1]); e2 = (c[2][0] - c[1][0], c[2][1] - c[1][1])
    l1, l2 = math.hypot(*e1), math.hypot(*e2)
    if l1 < l2: e1, e2, l1, l2 = e2, e1, l2, l1
    return m.centroid.x, m.centroid.y, l1, l2, math.atan2(e1[1], e1[0])
canchas = []
for (w,) in db.execute(f"select wkt from '{P('landuse')}' where class = 'pitch'").fetchall():
    for p in polys(tiles(WKT.loads(w))):
        if p.area * 100 < 120 or not dentro(p): continue
        cx, cy, L, A, an = rect(p)
        canchas.append((cx, cy, L, A, an, 1 if L * A * 100 >= 3500 else 2 if L * A * 100 >= 900 else 3))   # 1 fútbol, 2 sintética, 3 placa polideportiva
pistas = [p for (w,) in db.execute(f"select wkt from '{P('landuse')}' where class = 'track'").fetchall() for p in polys(tiles(WKT.loads(w))) if p.area * 100 > 800 and dentro(p)]
pisc = [p for (w,) in db.execute(f"select wkt from '{P('water')}' where class = 'swimming_pool'").fetchall() for p in polys(tiles(WKT.loads(w))) if p.area * 100 >= 12 and dentro(p)]
plazas = [p for (w,) in db.execute(f"select wkt from '{P('landuse')}' where class in ('plaza','pedestrian')").fetchall() for p in polys(tiles(WKT.loads(w))) if p.area * 100 >= 80 and dentro(p)]   # plazas de piso dentro de los campus
print('canchas', len(canchas), '· pistas', len(pistas), '· piscinas', len(pisc), '· plazas', len(plazas))

# ---------- techo a cuatro aguas: anillo interior (cumbreras) precalculado ----------
def inset(p, f=.55):
    d = max(.18, min(.6, (2 * p.area / max(p.length, 1e-6)) * f))   # 2A/P ~ media anchura de las alas
    q = p.buffer(-d, join_style=2)
    q = max(polys(q), key=lambda x: x.area) if polys(q) else None
    return q if q is not None and q.area > .02 else None

# ---------- escritura ----------
names = ['']; nidx = {'': 0}
def nm_i(s):
    s = (s or '').strip()
    if s not in nidx: nidx[s] = len(names); names.append(s)
    return nidx[s]
def ring_bytes(coords):
    pts = [(int(round(x * U)), int(round(y * U))) for x, y in coords]
    q = [pts[0]]
    for p in pts[1:]:
        if p != q[-1]: q.append(p)
    if len(q) > 1 and q[-1] == q[0]: q.pop()
    if len(q) < 3: return None
    b = bytearray(struct.pack('<HHH', len(q), q[0][0], q[0][1]))
    for a, c in zip(q, q[1:]): b += struct.pack('<hh', c[0] - a[0], c[1] - a[1])
    return bytes(b)
def poly_bytes(p, tol=.05):
    p = orient(p.simplify(tol, preserve_topology=True), 1.0)
    rs = [ring_bytes(p.exterior.coords)] + [ring_bytes(h.coords) for h in p.interiors if Polygon(h).area > .25]
    rs = [r for r in rs if r]
    if not rs: return None
    return bytes([len(rs)]) + b''.join(rs)

out = bytearray(b'SIT2')
sb = []
for s in sites:
    pb = poly_bytes(s['g'], .08)
    if pb is None: pb = b'\x00'
    sb.append(struct.pack('<BBH', KIND[s['k']] | (0x80 if s['suelto'] else 0), 255 if s['est'] is None else s['est'], nm_i(s['name'])) + pb)   # bit alto: sitio de un solo edificio
eb = []
for e in edif:
    pb = poly_bytes(e['g'])
    if pb is None: continue
    ins = b'\x00'
    if e['roof'] in (ROOF['cuatro'], ROOF['dos']):
        q = inset(orient(e['g'].simplify(.05, preserve_topology=True), 1.0), .8 if e['roof'] == ROOF['dos'] else .55)   # dos aguas: cumbrera angosta
        if q is not None:
            qb = poly_bytes(q, .04)
            if qb: ins = qb   # el polígono de las cumbreras, con su patio si lo tiene
    eb.append(struct.pack('<HBBBBH', e['s'], KIND[e['k']], e['fl'], e['roof'], e['est'], nm_i(e['name'])) + pb + ins)
ang = lambda an: ((int(round(math.degrees(an) * 100)) + 18000) % 36000) - 18000   # centésimas de grado en [-180, 180)
cb = [struct.pack('<HHHHhB', int(cx * U), int(cy * U), int(L * U), int(A * U), ang(an), t) for cx, cy, L, A, an, t in canchas]
pb_ = [b for b in (poly_bytes(p, .05) for p in pistas) if b]
wb = [b for b in (poly_bytes(p, .03) for p in pisc) if b]
zb = [b for b in (poly_bytes(p, .06) for p in plazas) if b]
out += struct.pack('<IIIIII', len(sb), len(eb), len(cb), len(pb_), len(wb), len(zb))
for b in sb + eb + cb + pb_ + wb + zb: out += b
raw = bytes(out)
comp = zlib.compressobj(9, zlib.DEFLATED, -15); z = comp.compress(raw) + comp.flush()
open(os.path.join(D, 'sitios.bin'), 'wb').write(z)
json.dump({'v': 1, 'u': U, 'raw': len(raw), 'names': names,
           'src': 'Sitios: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps Foundation'}, open(os.path.join(D, 'sitios.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('sitios', len(sb), '· edificios', len(eb), '· canchas', len(cb), '· pistas', len(pb_), '· piscinas', len(wb), '· plazas', len(zb), '· nombres', len(names))
print('sitios.bin', len(z) // 1024, 'KB (', len(raw) // 1024, 'KB sin comprimir )')
