#!/usr/bin/env python3
"""SITIOS REALES del valle: los lugares importantes con la forma, la altura y el estilo de sus edificios reales.

  python3 motor-valle/geo/sitios.py        (después de fetch.py y build.py)
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
C = os.path.join(R, 'motor-valle', 'geo', 'cache'); D = os.path.join(R, 'src', 'data')
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
EST = {'ladrillo': 0, 'blanco': 1, 'concreto': 2, 'cristal': 3, 'colegio': 4, 'iglesia': 5, 'coliseo': 6, 'oscuro': 7, 'teja': 8, 'rojo': 9, 'claro': 10, 'ladrillo_gris': 11,
       'artdeco': 12, 'cultura': 13, 'roca': 14, 'piedra': 15, 'teatro': 16, 'coltejer': 17, 'hierro': 18}
ROOF = {'plano': 0, 'cuatro': 1, 'dos': 2, 'helipuerto': 3, 'aguja': 4, 'cupula': 5, 'ajedrez': 6, 'cubierta': 7, 'jardin': 8}
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

# ---------- patios y talleres de los trenes (de la auditoría de El Metro): sus naves y su patio de rieles ----------
PATIOS = ['Patio-Taller Metro de Medellín', 'Talleres Ferrocarril de Antioquia', 'Patio Taller Metro de la 80', 'Patio taller del tranvía']
patios = []
for nm, w in db.execute(f"select name, wkt from '{P('landuse')}' where name in ({','.join(repr(x) for x in PATIOS)})").fetchall():
    for p in polys(tiles(WKT.loads(w))):
        if p.area * 100 < 2000 or not dentro(p): continue
        p = p.buffer(0); si = add_site('trans', nm, p); patios.append((si, nm, p))
        for i in tree.query(p, predicate='contains'): add_edif(si, int(i), 'trans', nm)
print('patios y talleres de trenes', len(patios))

# ---------- lugares sin nombre en los datos: su huella por la coordenada de su lugar (mirada en el satélite) ----------
PUNTOS = [('Teatro Metropolitano', 6.242972, -75.577488, 'cult'), ('Museo de Antioquia', 6.252386, -75.569089, 'cult'), ('Museo de Antioquia', 6.252507, -75.569319, 'cult'),
          ('Hospital Marco Fidel Suárez', 6.330683, -75.557744, 'salud'), ('Terminal del Sur', 6.216450, -75.587379, 'trans')]
GT = shapely.STRtree(G)
def huella_en(lat, lon):
    pt = Point((lon - LON0) * KX, (LATN - lat) * KY); best, bd = None, 1.6
    for i in GT.query(pt.buffer(1.6)):
        d = G[i].distance(pt)
        if d < bd and AR[i] > 120: bd, best = d, int(i)
    return best
n_p = 0
for nm, lat, lon, k in PUNTOS:
    i = huella_en(lat, lon)
    if i is None: print('  sin huella:', nm); continue
    if usado[i]:
        for e in ed_de.get(i, []): e['name'] = nm; e['k'] = k
    else: si = add_site(k, nm, G[i].buffer(.4), suelto=True); add_edif(si, i, k, nm)
    for e in ed_de.get(i, []): e['name'] = nm
    n_p += 1
print('lugares por coordenada', n_p)

# ---------- EMBLEMÁTICOS: partes con base elevada, muros inclinados, torres y cúpulas (curadas mirando las fotos aéreas) ----------
# Una parte es un prisma entre los pisos z0 y z1: anillo de abajo B y, si los muros se inclinan, anillo de arriba T (mismos vértices).
from shapely import affinity
partes, suelos = [], []   # partes: (edificio, z0, z1, B, T|None, estilo, techo) · suelos: (color, polígono)
def ejes(p):
    m = p.minimum_rotated_rectangle; c = list(m.exterior.coords)[:4]
    e1 = (c[1][0] - c[0][0], c[1][1] - c[0][1]); e2 = (c[2][0] - c[1][0], c[2][1] - c[1][1]); l1, l2 = math.hypot(*e1), math.hypot(*e2)
    if l1 < l2: e1, e2, l1, l2 = e2, e1, l2, l1
    u = (e1[0] / l1, e1[1] / l1); ct = m.centroid
    return (ct.x, ct.y), u, (-u[1], u[0]), l1 / 2, l2 / 2
def loc(E, a, b): (cx, cy), u, v, L, W = E; return (cx + u[0] * a * L + v[0] * b * W, cy + u[1] * a * L + v[1] * b * W)
def caja(E, a0, a1, b0, b1): return [loc(E, a0, b0), loc(E, a1, b0), loc(E, a1, b1), loc(E, a0, b1)]
def escala(P, E, su, sv, du=0., dv=0.):   # los mismos vértices, escalados (y corridos) en los ejes del edificio
    (cx, cy), u, v, L, W = E; out = []
    for x, y in P:
        a = (x - cx) * u[0] + (y - cy) * u[1]; b = (x - cx) * v[0] + (y - cy) * v[1]; a = a * su + du * L; b = b * sv + dv * W
        out.append((cx + u[0] * a + v[0] * b, cy + u[1] * a + v[1] * b))
    return out
def anillo(p): q = orient(p.simplify(.05, preserve_topology=True), 1.0); return list(q.exterior.coords)[:-1]
def circulo(c, r, n=14): return [(c[0] + math.cos(t / n * 2 * math.pi) * r, c[1] + math.sin(t / n * 2 * math.pi) * r) for t in range(n)]
def adentro(p, d):
    q = p.buffer(-d, join_style=2); ps = polys(q); return max(ps, key=lambda x: x.area) if ps else None
PARQ = [p for (w,) in db.execute(f"select wkt from '{P('landuse')}' where class in ('park','plaza','pedestrian','village_green','recreation_ground')").fetchall() for p in polys(tiles(WKT.loads(w))) if p.area * 100 > 600]
PT = shapely.STRtree([p.centroid for p in PARQ])
def frente(e, E):   # el extremo del edificio que mira a su parque o plaza: el más grande y cercano (a menos de 250 m); si no hay, el del sur
    ct = e['g'].centroid; best, bs, f = None, 0, 1
    for j in PT.query(ct.buffer(25)):
        pg = PARQ[int(j)]; d = pg.centroid.distance(ct); sc = pg.area / (2 + d) ** 1.5
        if d < 25 and sc > bs: bs, best = sc, pg
    if best is not None:
        pc = best.centroid; a1, a2 = loc(E, 1, 0), loc(E, -1, 0)
        f = 1 if math.hypot(a1[0] - pc.x, a1[1] - pc.y) <= math.hypot(a2[0] - pc.x, a2[1] - pc.y) else -1
    else: f = 1 if loc(E, 1, 0)[1] >= loc(E, -1, 0)[1] else -1
    return f
def torres(e, n, side, alto, tapa, est, techo_tapa, alto_tapa=2.5):
    E = ejes(e['g']); f = frente(e, E); (c, u, v, L, W) = E; s = min(side, W * 1.1, L * .9); a = f * (1 - s / (2 * L) - .02)
    bs = [0.] if n == 1 else [-(1 - s / (2 * W) - .02), (1 - s / (2 * W) - .02)]
    for b in bs:
        sq = caja(E, a - s / (2 * L), a + s / (2 * L), b - s / (2 * W), b + s / (2 * W))
        partes.append((e, 0., alto, sq, None, est, ROOF['plano']))
        if tapa == 'pico': partes.append((e, alto, alto + alto_tapa, sq, escala(sq, ejes(Polygon(sq)), .04, .04), est, ROOF['plano']))
        elif tapa == 'cupula': partes.append((e, alto, alto + alto_tapa * .6, sq, None, est, ROOF['cupula']))
def por_nombre(rx): return [e for e in edif if re.search(rx, e['name'] or '')]
def cuerpo(e, fl=None, est=None, roof=None):
    if fl is not None: e['fl'] = fl
    if est is not None: e['est'] = EST[est]
    if roof is not None: e['roof'] = ROOF[roof]
hechos = set()
def emb(rx, fn):
    for e in por_nombre(rx): fn(e); hechos.add(id(e))
# Coltejer: 36 pisos y 175 m; el remate se angosta como la punta de una aguja (arco apuntado en la fachada ancha)
def coltejer(e):
    cuerpo(e, 30, 'coltejer', 'plano'); E = ejes(e['g']); R = anillo(e['g']); prev = R
    for z0, z1, su, sv in ((30, 33.5, .74, 1.), (33.5, 36.5, .42, .97), (36.5, 39.5, .07, .93)):
        T = escala(R, E, su, sv); partes.append((e, z0, z1, prev, T, EST['coltejer'], ROOF['plano'])); prev = T
emb(r'^Edificio Coltejer$', coltejer)
# Edificio Inteligente EPM: 14 pisos en terrazas de vidrio, con techos verdes
def epm(e):
    cuerpo(e, 5, 'cristal', 'jardin')
    for d, z0, z1, r in ((.6, 5, 9, 'jardin'), (1.2, 9, 12, 'jardin'), (1.9, 12, 14, 'plano')):
        q = adentro(e['g'], d)
        if q is not None: partes.append((e, z0, z1, anillo(q), None, EST['cristal'], ROOF[r]))
emb(r'^Empresas Publicas de Medell', epm)
# Biblioteca EPM: volumen de piedra que se abre hacia arriba (la pirámide invertida sobre la Plaza de Cisneros)
def bibepm(e):
    cuerpo(e, 0, 'piedra', 'plano'); E = ejes(e['g']); R = anillo(e['g'])
    partes.append((e, 0, 6, escala(R, E, .78, .78), R, EST['piedra'], ROOF['plano']))
emb(r'^Biblioteca EPM$', bibepm)
# Catedral Metropolitana: ladrillo macizo, nave de 98 m y dos torres de 51,8 m en la fachada sobre el Parque de Bolívar
def catedral(e): cuerpo(e, 7, 'ladrillo', 'dos'); torres(e, 2, 1.0, 16, 'pico', EST['ladrillo'], None, 3)
emb(r'^Bas[ií]lica Metropolitana', catedral)
# La Candelaria (Parque Berrío): dos torres simétricas con cúpulas de teja
def candelaria(e): cuerpo(e, 5, 'iglesia', 'dos'); torres(e, 2, .8, 11, 'cupula', EST['iglesia'], None, 2.5)
emb(r'^Parroquia Nuestra Señora de La Candelaria$', candelaria)
# San Ignacio: fachada blanca con dos torres; el claustro de teja con su patio
def signacio(e): cuerpo(e, 5, 'iglesia', 'dos'); torres(e, 2, .7, 10, 'cupula', EST['iglesia'], None, 2)
emb(r'^Iglesia de San Ignacio$', signacio)
emb(r'^Claustro San Ignacio$', lambda e: cuerpo(e, 3, 'teja', 'cuatro'))
# Sagrado Corazón (Barrio Triste): neogótica, una torre con aguja alta
def sagrado(e): cuerpo(e, 5, 'ladrillo', 'dos'); torres(e, 1, .9, 13, 'pico', EST['ladrillo'], None, 6)
emb(r'^Iglesia del Sagrado Coraz', sagrado)
# Palacio de la Cultura: neogótico, ajedrezado en negro y verde grisáceo, con su gran cúpula de hierro
def palacio(e):
    cuerpo(e, 6, 'cultura', 'plano'); E = ejes(e['g']); r = min(E[3], E[4]) * .42; C = circulo(E[0], r)
    partes.append((e, 6, 9.5, C, escala(C, ejes(Polygon(C)), .6, .6), EST['hierro'], ROOF['cupula']))
emb(r'^Palacio de la Cultura', palacio)
# Teatro Metropolitano: grandes planos de ladrillo inclinados (acústica), techo claro, torre del escenario y plaza de ladrillo
def teatro(e):
    cuerpo(e, 0, 'teatro', 'plano'); E = ejes(e['g']); R = anillo(e['g'])
    partes.append((e, 0, 8, R, escala(R, E, .9, .9), EST['teatro'], ROOF['plano']))
    nort = 1 if loc(E, 1, 0)[1] < loc(E, -1, 0)[1] else -1   # la torre del escenario va al norte (así se ve desde el aire)
    a0, a1 = sorted((nort * .22, nort * .78)); partes.append((e, 8, 11.5, caja(E, a0, a1, -.62, .62), None, EST['teatro'], ROOF['plano']))
    suelos.append((1, e['g'].buffer(2.6).difference(e['g']), 0.))
emb(r'^Teatro Metropolitano$', teatro)
# Museo de Antioquia (antiguo Palacio Municipal, art decó): muros ocre claro y teja alrededor de sus patios
emb(r'^Museo de Antioquia$', lambda e: cuerpo(e, 4, 'artdeco', 'cuatro'))
emb(r'^Edificio (Carré|Vásquez)$', lambda e: cuerpo(e, 4, 'artdeco', 'plano'))
emb(r'^Edificio Estación Ferrocarril', lambda e: cuerpo(e, 2, 'artdeco', 'cuatro'))
emb(r'^Palacio Nacional$', lambda e: cuerpo(e, 5, 'artdeco', 'plano'))
emb(r'^Teatro Pablo Tob', lambda e: cuerpo(e, 4, 'ladrillo', 'cuatro'))
emb(r'^Hospital Marco Fidel Su', lambda e: cuerpo(e, 2, 'teja', 'cuatro'))
emb(r'^Terminal del Sur$', lambda e: cuerpo(e, 3, 'teja', 'cuatro'))
emb(r'^(Gobernación de Antioquia|Alcaldía de Medellín)$', lambda e: cuerpo(e, 13, 'concreto', 'helipuerto'))
# Parque Biblioteca España: tres «rocas» de pizarra oscura (techo claro), inclinadas sobre la ladera de Santo Domingo
def bespana(e):
    ct = e['g'].centroid; si = e['s']; rocas = [e]
    for i in tree.query(ct.buffer(7)):
        i = int(i)
        if not usado[i] and 150 < AR[i] < 450 and not rows[i][0] and not rows[i][1]: add_edif(si, i, 'cult', 'Parque Biblioteca España'); rocas += ed_de.get(i, [])
    for k, r in enumerate(rocas):
        cuerpo(r, 0, 'roca', 'plano'); r['name'] = 'Parque Biblioteca España'; E = ejes(r['g']); R = anillo(r['g'])
        partes.append((r, 0, 7 if k == 0 else 5, R, escala(R, E, .9, .88, (.14, -.12, .1)[k % 3], (-.1, .12, .14)[k % 3]), EST['roca'], ROOF['plano'])); hechos.add(id(r))
for e in por_nombre(r'^Parque Biblioteca España$')[:1]: bespana(e)
# las demás iglesias: torre en la fachada que mira a su parque (dos en las grandes), con su remate en punta
n_t = 0
for e in edif:
    if id(e) in hechos or e['k'] != 'iglesia' or e['g'].area * 100 < 300: continue
    E = ejes(e['g'])
    if E[3] < E[4] * 1.2: continue   # sin nave alargada no se sabe dónde va la fachada
    grande = e['g'].area * 100 > 1600 or re.search(r'catedral|bas[ií]lica', e['name'] or '', re.I)
    torres(e, 2 if grande else 1, .75 if grande else .7, e['fl'] + (6 if grande else 5), 'pico', EST['iglesia'], None, 2.5); n_t += 1
for si, nm, p in patios:   # naves de metal (o de ladrillo, las del Ferrocarril) y el patio de rieles en el sentido del patio
    for e in edif:
        if e['s'] == si: cuerpo(e, max(2, min(e['fl'], 3)), 'ladrillo' if 'Ferrocarril' in nm else 'coliseo', 'plano'); e['name'] = e['name'] or nm
    E = ejes(p); suelos.append((2, p, math.atan2(E[1][1], E[1][0])))
print('emblemáticos', len(hechos), '· iglesias con torre', n_t, '· partes', len(partes), '· suelos', len(suelos))

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

out = bytearray(b'SIT4')
sb = []
for s in sites:
    pb = poly_bytes(s['g'], .08)
    if pb is None: pb = b'\x00'
    sb.append(struct.pack('<BBH', KIND[s['k']] | (0x80 if s['suelto'] else 0), 255 if s['est'] is None else s['est'], nm_i(s['name'])) + pb)   # bit alto: sitio de un solo edificio
eb = []; idx = {}
for e in edif:
    pb = poly_bytes(e['g'])
    if pb is None: continue
    idx[id(e)] = len(eb)
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
def ring_pts(P):   # anillo de una parte sin quitar puntos repetidos: el de arriba debe tener los mismos vértices que el de abajo (aunque converjan en una punta)
    pts = [(int(round(x * U)), int(round(y * U))) for x, y in P]
    if len(pts) < 3: return None
    b = bytearray(struct.pack('<HHH', len(pts), pts[0][0], pts[0][1]))
    for a, c in zip(pts, pts[1:]): b += struct.pack('<hh', c[0] - a[0], c[1] - a[1])
    return bytes(b)
qb = []
for e, z0, z1, B, T, est, roof in partes:
    if id(e) not in idx: continue
    rb = ring_pts(B); tb = ring_pts(T) if T is not None else None
    if not rb or (T is not None and (not tb or len(tb) != len(rb))): tb = None
    if not rb: continue
    qb.append(struct.pack('<HHHBBB', idx[id(e)], int(round(z0 * 10)), int(round(z1 * 10)), est, roof, 1 if tb else 0) + rb + (tb or b''))
ub = [bytes([col]) + struct.pack('<h', ang(an)) + b for col, g, an in suelos for b in [poly_bytes(max(polys(g), key=lambda x: x.area), .05)] if b]   # color, ángulo (centésimas de grado) y polígono
out += struct.pack('<IIIIIIII', len(sb), len(eb), len(cb), len(pb_), len(wb), len(zb), len(qb), len(ub))
for b in sb + eb + cb + pb_ + wb + zb + qb + ub: out += b
raw = bytes(out)
comp = zlib.compressobj(9, zlib.DEFLATED, -15); z = comp.compress(raw) + comp.flush()
open(os.path.join(D, 'sitios.bin'), 'wb').write(z)
json.dump({'v': 1, 'u': U, 'raw': len(raw), 'names': names,
           'src': 'Sitios: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps Foundation'}, open(os.path.join(D, 'sitios.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('sitios', len(sb), '· edificios', len(eb), '· canchas', len(cb), '· pistas', len(pb_), '· piscinas', len(wb), '· plazas', len(zb), '· partes', len(qb), '· suelos', len(ub), '· nombres', len(names))
print('sitios.bin', len(z) // 1024, 'KB (', len(raw) // 1024, 'KB sin comprimir )')
