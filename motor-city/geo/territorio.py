"""MOTOR CITY · CRAQUEAR UN TERRITORIO · cualquier lugar del mundo → un mundo MC4 listo para el motor.
   Fuentes abiertas que cubren todo el planeta:
     · Overture Maps (OpenStreetMap, ODbL; huellas de Microsoft y Google): vías con clase y nombre, agua, usos del suelo,
       edificios con pisos y lugares con nombre.
     · Relieve: Terrain Tiles de AWS Open Data (Mapzen; SRTM/NASA y otros), formato terrarium.
   Uso:
     python3 geo/territorio.py --id guatape --nombre "Guatapé y El Peñol" --bbox=-75.185,6.214,-75.142,6.247 [--casilla 5]
   Salida: datos/<id>/mundo.mc4 + datos/<id>/resumen.json + ciudades/<id>.json (si no existe: reglas por defecto para editar)
   Necesita: pip install duckdb shapely pillow numpy   ·   El bucket de Overture es público (sin credenciales).
   El MC4 que sale usa las capas JSON (VIASJ y EDJ) en vez de los binarios grandes de Medellín: el cargador lee las dos.
"""
import argparse, io, json, math, os, sys, time, urllib.request, zlib, hashlib
import numpy as np
import duckdb, shapely
from shapely import wkb as WKB, wkt as WKT
from shapely.geometry import LineString, MultiLineString, Polygon, MultiPolygon
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.join(AQUI, '..')
ap = argparse.ArgumentParser()
ap.add_argument('--id', required=True); ap.add_argument('--nombre', default=None); ap.add_argument('--bbox', required=True, help='lon0,latS,lon1,latN')
ap.add_argument('--casilla', type=float, default=5.0); ap.add_argument('--fondo', type=int, default=-12, help='cota mínima (m): corta la batimetría'); ap.add_argument('--release', default='2026-10-21.0'); ap.add_argument('--pais', default=None)
A = ap.parse_args()
LON0, LATS, LON1, LATN = [float(v) for v in A.bbox.split(',')]
T = A.casilla; LATR = (LATN + LATS) / 2
MX = 111320 * math.cos(math.radians(LATR)); MY = 110574            # metros por grado
W = int(math.ceil((LON1 - LON0) * MX / T)); H = int(math.ceil((LATN - LATS) * MY / T))
ES = max(2, int(round(20 / T)))                                       # relieve cada ~20 m
CEL = 8                                                               # celdas de 8 casillas (municipio, pisos…)
OUT = os.path.join(RAIZ, 'datos', A.id); CACHE = os.path.join(AQUI, 'cache', A.id); os.makedirs(OUT, exist_ok=True); os.makedirs(CACHE, exist_ok=True)
print(f'· {A.id}: {W}×{H} casillas de {T:g} m ({W * T / 1000:.1f} × {H * T / 1000:.1f} km)'); sys.stdout.flush()
m = lambda lon, lat: ((lon - LON0) * MX, (LATN - lat) * MY)          # grados → metros del mapa (x oriente, y sur)
def amet(g): return shapely.transform(g, lambda xy: np.column_stack([(xy[:, 0] - LON0) * MX, (LATN - xy[:, 1]) * MY]))

# ---------- 1. Overture ----------
REL = f's3://overturemaps-us-west-2/release/{A.release}'
c = duckdb.connect(); c.execute("INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial; SET s3_region='us-west-2'; CREATE SECRET anon (TYPE s3, KEY_ID '', SECRET '', REGION 'us-west-2'); SET http_timeout=120000;")
dentro = f"bbox.xmax > {LON0} AND bbox.xmin < {LON1} AND bbox.ymax > {LATS} AND bbox.ymin < {LATN}"
def q(nombre, sql):
    f = os.path.join(CACHE, nombre + '.parquet')
    if not os.path.exists(f): t = time.time(); c.execute(f"COPY ({sql}) TO '{f}' (FORMAT PARQUET)"); print('  ', nombre, round(time.time() - t), 's'); sys.stdout.flush()
    return c.execute(f"SELECT * FROM '{f}'").fetchall()
seg = f"read_parquet('{REL}/theme=transportation/type=segment/*', hive_partitioning=1)"
vias = q('vias', f"SELECT class, subclass, names.primary AS nombre, to_json(road_flags) fl, ST_AsWKB(geometry) g FROM {seg} WHERE subtype='road' AND {dentro}")
agua = q('agua', f"SELECT subtype, class, names.primary, ST_AsWKB(geometry) g FROM read_parquet('{REL}/theme=base/type=water/*', hive_partitioning=1) WHERE {dentro}")
uso = q('uso', f"SELECT subtype, class, names.primary, ST_AsWKB(geometry) g FROM read_parquet('{REL}/theme=base/type=land_use/*', hive_partitioning=1) WHERE {dentro}")
tierra = q('tierra', f"SELECT subtype, class, names.primary, ST_AsWKB(geometry) g FROM read_parquet('{REL}/theme=base/type=land/*', hive_partitioning=1) WHERE {dentro}")
edif = q('edificios2', f"SELECT subtype, class, height, num_floors, names.primary, ST_AsWKB(geometry) g, sources[1].dataset AS src FROM read_parquet('{REL}/theme=buildings/type=building/*', hive_partitioning=1) WHERE {dentro}")   # 5.4: con su fuente (las de OSM son confiables)
lug = q('lugares', f"SELECT names.primary AS n, basic_category AS cat, confidence, ST_X(geometry) lon, ST_Y(geometry) lat FROM read_parquet('{REL}/theme=places/type=place/*', hive_partitioning=1) WHERE {dentro} AND names.primary IS NOT NULL ORDER BY confidence DESC LIMIT 400")
print(f'  vías {len(vias)} · agua {len(agua)} · uso {len(uso)} · tierra {len(tierra)} · edificios {len(edif)} · lugares {len(lug)}'); sys.stdout.flush()

# ---------- 2. Relieve (terrarium) ----------
Z = 14 if (LON1 - LON0) < .3 else 13
tx = lambda lon: (lon + 180) / 360 * 2 ** Z
ty = lambda lat: (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * 2 ** Z
teselas = {}
def tesela(x, y):
    k = (x, y)
    if k in teselas: return teselas[k]
    f = os.path.join(CACHE, f'dem_{Z}_{x}_{y}.png')
    if not os.path.exists(f):
        for intento in range(4):
            try: urllib.request.urlretrieve(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png', f); break
            except Exception as e: time.sleep(2 ** intento)
    a = np.asarray(Image.open(f).convert('RGB'), dtype=np.float64); teselas[k] = a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768; return teselas[k]
def cota(lon, lat):
    X, Y = tx(lon), ty(lat); xi, yi = int(X), int(Y); px, py = (X - xi) * 256, (Y - yi) * 256; a = tesela(xi, yi)
    i, j = min(254, int(px)), min(254, int(py)); fx, fy = px - i, py - j
    return (a[j, i] * (1 - fx) + a[j, i + 1] * fx) * (1 - fy) + (a[j + 1, i] * (1 - fx) + a[j + 1, i + 1] * fx) * fy
eW, eH = W // ES + 2, H // ES + 2
rel = np.zeros((eH, eW), dtype=np.int16)
for j in range(eH):
    for i in range(eW): rel[j, i] = int(round(cota(LON0 + i * ES * T / MX, LATN - j * ES * T / MY)))
# huecos y picos del modelo de elevación (vacíos del radar, embalses): lo que se aparta más de 150 m de la mediana 3×3 se reemplaza
pad = np.pad(rel.astype(np.float64), 1, mode='edge'); med = np.median(np.stack([pad[1 + dy:1 + dy + eH, 1 + dx:1 + dx + eW] for dy in (-1, 0, 1) for dx in (-1, 0, 1)]), axis=0)
malos = np.abs(rel - med) > 150; rel[malos] = med[malos].astype(np.int16)
# 4.0: el relieve de terrarium trae el fondo del mar (batimetría): en un mundo jugable el agua no baja de --fondo (−12 m)
rel = np.maximum(rel, A.fondo).astype(np.int16)
print(f'  relieve {eW}×{eH} (cada {ES * T:g} m): {rel.min()}–{rel.max()} m · {int(malos.sum())} huecos corregidos'); sys.stdout.flush()

# ---------- 3. Suelo por casilla (TT) ----------
TT = dict(GRASS=0, MOUNT=1, BRICK=2, BLDG=3, ROAD=4, AVE=5, WALK=6, CICLO=7, WATER=8, CANAL=9, PLAZA=10, BRIDGE=11, STATION=12, LAND=13, AUTO=14, DEPOT=15, STEPS=16)
img = Image.new('L', (W, H), TT['GRASS']); d = ImageDraw.Draw(img)
def pol(g, v):
    gs = [g] if isinstance(g, Polygon) else list(getattr(g, 'geoms', []))
    for p in gs:
        if not isinstance(p, Polygon) or p.is_empty: continue
        d.polygon([(x / T, y / T) for x, y in p.exterior.coords], fill=v)
        for h in p.interiors: d.polygon([(x / T, y / T) for x, y in h.coords], fill=TT['GRASS'])
def lin(g, v, ancho):
    gs = [g] if isinstance(g, LineString) else list(getattr(g, 'geoms', []))
    for l in gs:
        if isinstance(l, LineString) and len(l.coords) > 1: d.line([(x / T, y / T) for x, y in l.coords], fill=v, width=max(1, int(round(ancho / T))), joint='curve')
USO = {'residential': 'BRICK', 'commercial': 'BRICK', 'retail': 'BRICK', 'industrial': 'DEPOT', 'park': 'GRASS', 'grass': 'GRASS', 'recreation_ground': 'GRASS', 'pitch': 'GRASS', 'forest': 'MOUNT', 'wood': 'MOUNT', 'farmland': 'GRASS', 'meadow': 'GRASS', 'cemetery': 'GRASS', 'plaza': 'PLAZA', 'pedestrian': 'PLAZA', 'parking': 'PLAZA', 'education': 'BRICK', 'religious': 'PLAZA'}
for st, cl, _, g in tierra:
    if cl in ('forest', 'wood', 'scrub', 'shrub', 'tree', 'wetland', 'rock', 'cliff') and g: pol(amet(WKB.loads(g)), TT['MOUNT'])
for st, cl, _, g in uso:
    v = USO.get(cl) or USO.get(st)
    if v and g: pol(amet(WKB.loads(g)), TT[v])
for st, cl, _, g in agua:
    if not g: continue
    G = amet(WKB.loads(g))
    if isinstance(G, (Polygon, MultiPolygon)): pol(G, TT['WATER'])
    else: lin(G, TT['CANAL'] if cl in ('stream', 'ditch', 'drain', 'canal') else TT['WATER'], 4 if cl in ('stream', 'ditch', 'drain') else 14)
EDK = ['casa', 'edificio', 'torre', 'nave', 'educativo', 'salud', 'iglesia', 'civico', 'comercio', 'deporte', 'techo', 'invernadero', 'tanque', 'transporte', 'parqueadero', 'rural']
def edk(st, cl):
    cl = cl or ''; st = st or ''
    if cl in ('house', 'detached', 'semidetached_house', 'terrace', 'bungalow', 'hut', 'cabin') or st == 'residential': return 0
    if cl in ('apartments', 'dormitory', 'hotel'): return 1
    if cl in ('industrial', 'warehouse', 'factory', 'manufacture', 'storage_tank', 'hangar') or st == 'industrial': return 3
    if cl in ('school', 'university', 'college', 'kindergarten') or st == 'education': return 4
    if cl in ('hospital', 'clinic') or st == 'medical': return 5
    if cl in ('church', 'cathedral', 'chapel', 'religious', 'temple', 'mosque') or st == 'religious': return 6
    if cl in ('civic', 'government', 'public', 'townhall', 'fire_station', 'police') or st == 'civic': return 7
    if cl in ('commercial', 'retail', 'supermarket', 'office', 'kiosk') or st in ('commercial', 'service'): return 8
    if cl in ('stadium', 'sports_hall', 'grandstand', 'pavilion') or st == 'entertainment': return 9
    if cl in ('roof', 'carport', 'shed'): return 10
    if cl in ('greenhouse',): return 11
    if cl in ('parking', 'garage', 'garages'): return 14
    if st == 'agricultural' or cl in ('barn', 'farm', 'farm_auxiliary', 'stable', 'cowshed'): return 15
    return 0
VK = {'motorway': (3, 'AUTO', 22), 'trunk': (3, 'AUTO', 18), 'primary': (2, 'AVE', 14), 'secondary': (2, 'AVE', 11), 'tertiary': (1, 'ROAD', 8), 'residential': (1, 'ROAD', 7), 'unclassified': (1, 'ROAD', 6),
      'living_street': (1, 'ROAD', 6), 'service': (1, 'ROAD', 5), 'pedestrian': (6, 'WALK', 5), 'footway': (6, 'WALK', 2.5), 'sidewalk': (6, 'WALK', 2), 'crosswalk': (6, 'WALK', 3), 'steps': (7, 'STEPS', 2.5),
      'path': (8, 'WALK', 2), 'track': (8, 'ROAD', 3.5), 'cycleway': (5, 'CICLO', 2.6), 'bridleway': (8, 'WALK', 2)}
# ---------- 3b. Ley de soberanía vial (5.4 · renacimiento cenital, Fase 2: la misma regla A del Motor del Valle 1.3) ----------
# Ninguna casa sobre la calle ni sobre el agua: a cada huella se le quita el corredor de cada vía a nivel (su ancho / 2 + 1,3 m en
# las de carros; + 0,3 m en peatonales, escalas, senderos y ciclorrutas; las aceras y cebras ya van dentro de su calle) y el agua.
# Las casas de OSM (confiables) no pierden el andén de las calles menores (quedan marcadas), pero sí el asfalto: en un juego ningún
# carro puede chocar con una casa pintada sobre la calle (el Motor del Valle las conserva enteras; El Metro las recorta igual). Los restos de menos de 16 m² se van,
# salvo que conserven el 90 % y 12 m². Los puentes y túneles no despejan nada (van por encima o por debajo).
from shapely.strtree import STRtree
F_EXT = 1 / math.cos(1.5 * math.pi / 32)   # el búfer de GEOS es un polígono inscrito: así contiene el disco real
CARROS = {'ROAD', 'AVE', 'AUTO'}
def nivel(fl):   # 0 a ras; 1 puente o elevada; −1 túnel, cubierta o por dentro de un edificio (no despejan nada: pasan por encima o por debajo)
    try: F = json.loads(fl) if fl else None
    except Exception: F = None
    V = {v for f in (F or []) for v in (f.get('values') or [])}
    return -1 if V & {'is_tunnel', 'is_covered', 'is_indoor'} else 1 if 'is_bridge' in V else 0
a_nivel = lambda fl: nivel(fl) == 0
COR, MENOR, ASF = [], [], []   # el corredor completo, si es calle menor y, si lo es, solo su asfalto (ancho / 2)
for cl, sub, nom, fl, g in vias:
    if not g or sub in ('sidewalk', 'crosswalk') or not a_nivel(fl): continue
    k, tt, ancho = VK.get(cl or '', (1, 'ROAD', 5)); G = amet(WKB.loads(g)); men = k != 2 and k != 3
    COR.append(shapely.buffer(G, (ancho / 2 + (1.3 if tt in CARROS else .3)) * F_EXT, quad_segs=8)); MENOR.append(men); ASF.append(shapely.buffer(G, ancho / 2 * F_EXT, quad_segs=8) if men else None)
for st, cl, _, g in agua:
    if not g: continue
    G = amet(WKB.loads(g))
    COR.append(G if isinstance(G, (Polygon, MultiPolygon)) else shapely.buffer(G, (2 if cl in ('stream', 'ditch', 'drain') else 7) * F_EXT, quad_segs=8)); MENOR.append(False); ASF.append(None)
COR = np.array(COR, dtype=object); MENOR = np.array(MENOR, dtype=bool); ARBOL = STRtree(COR) if len(COR) else None
SAN = dict(huellas=0, tocan=0, recortadas=0, quitadas=0, marcadas=0, area0=0.0, area1=0.0)
def piezas(g):
    if g.is_empty: return []
    if isinstance(g, Polygon): return [g]
    return [p for h in getattr(g, 'geoms', []) for p in piezas(h)]
def intacta(P, confiable):   # la huella que no se recorta va simplificada a 0,3 m como siempre, salvo que el atajo toque un corredor
    s2 = shapely.simplify(P, .3, preserve_topology=True)
    if s2.is_empty or not isinstance(s2, Polygon) or not s2.is_valid: return [P]
    if ARBOL is not None and any((ASF[j] if confiable and MENOR[j] else COR[j]) is not None and (ASF[j] if confiable and MENOR[j] else COR[j]).intersects(s2) for j in ARBOL.query(s2, predicate='intersects')): return [P]
    return [s2]
def limpia(P, confiable):
    a0 = P.area; SAN['huellas'] += 1; SAN['area0'] += a0
    if ARBOL is None: SAN['area1'] += a0; return intacta(P, confiable)
    js = list(ARBOL.query(P, predicate='intersects'))
    if not js: SAN['area1'] += a0; return intacta(P, confiable)
    if confiable and any(MENOR[j] for j in js): SAN['marcadas'] += 1
    G = [ASF[j] if confiable and MENOR[j] else COR[j] for j in js]; G = [g for g in G if g is not None and g.intersects(P)]
    if not G: SAN['area1'] += a0; return intacta(P, confiable)
    SAN['tocan'] += 1; M = shapely.union_all(G); vale = lambda p: p.area >= 16 or (p.area >= .9 * a0 and p.area >= 12)
    out = []
    for p in piezas(shapely.make_valid(shapely.difference(P, M))):
        if not vale(p): continue
        s2 = shapely.simplify(p, .3, preserve_topology=True)   # la forma simplificada se vuelve a recortar: el atajo no puede volver a la calle
        if shapely.intersection(s2, M).area > 1e-6: s2 = shapely.difference(s2, M)
        out += [q for q in piezas(shapely.make_valid(s2)) if vale(q)]
    if not out: SAN['quitadas'] += 1
    elif sum(q.area for q in out) < a0 - .01: SAN['recortadas'] += 1   # solo tocaba un borde: no cuenta como recortada
    SAN['area1'] += sum(q.area for q in out); return out
EDJ = []
for st, cl, alto, pisos, _, g, src in edif:
    if not g: continue
    G = amet(WKB.loads(g)); P0 = G if isinstance(G, Polygon) else max(getattr(G, 'geoms', []), key=lambda p: p.area, default=None)
    if P0 is None or P0.is_empty or P0.area < 6: continue
    for P in limpia(P0, src == 'OpenStreetMap'):
     pol(P, TT['BLDG']); k = edk(st, cl)
     pis = int(pisos) if pisos else int(round(alto / 3.05)) if alto else (1 if k in (0, 15, 10) else 2)
     r = P.minimum_rotated_rectangle; cs = list(r.exterior.coords)[:4]; e1 = (cs[1][0] - cs[0][0], cs[1][1] - cs[0][1]); e2 = (cs[2][0] - cs[1][0], cs[2][1] - cs[1][1])
     l1, l2 = math.hypot(*e1), math.hypot(*e2); ang = math.atan2(e1[1], e1[0]) if l1 >= l2 else math.atan2(e2[1], e2[0]); c0 = r.centroid
     ring = [round(v, 1) for xy in list(P.exterior.coords)[:-1] for v in xy]   # ya simplificada a 0,3 m (y recortada si tocaba)
     EDJ.append([round(c0.x, 1), round(c0.y, 1), round(max(l1, l2) / 2, 2), round(min(l1, l2) / 2, 2), round(ang, 3), max(1, min(60, pis)), k, ring if len(ring) >= 6 else None])
SAN['conserva_area_pct'] = round(100 * SAN['area1'] / max(1, SAN['area0']), 3); SAN['area0'] = round(SAN['area0']); SAN['area1'] = round(SAN['area1'])
print('  saneamiento (ley de soberanía vial):', SAN); sys.stdout.flush()
VJ = []; nombres = []
for cl, sub, nom, fl, g in sorted(vias, key=lambda v: -VK.get(v[0] or 'x', (0, '', 0))[2]):
    if not g: continue
    k, tt, ancho = VK.get(cl or '', (1, 'ROAD', 5))
    if sub in ('sidewalk', 'crosswalk'): k, tt, ancho = VK[sub]
    G = amet(WKB.loads(g)); lin(G, TT[tt], ancho)
    for l in ([G] if isinstance(G, LineString) else list(getattr(G, 'geoms', []))):
        if isinstance(l, LineString) and len(l.coords) > 1: nv = nivel(fl); VJ.append([k, nom or '', round(ancho, 1), [round(v, 1) for xy in l.simplify(.4).coords for v in xy]] + ([nv] if nv else []))   # 5.4: [5] = nivel si no va a ras
suelo = np.asarray(img, dtype=np.uint8)
print('  casillas por tipo', {k: int((suelo == v).sum()) for k, v in TT.items() if (suelo == v).sum()}); sys.stdout.flush()

# ---------- 4. Celdas (municipio, pisos), lugares y nombres ----------
mW, mH = W // CEL + 1, H // CEL + 1
muni = np.ones((mH, mW), dtype=np.uint8); pis = np.zeros((mH, mW), dtype=np.uint8)
for e in EDJ:
    i, j = min(mW - 1, max(0, int(e[0] / T / CEL))), min(mH - 1, max(0, int(e[1] / T / CEL))); pis[j, i] = max(pis[j, i], min(255, e[5]))
lugares = []
for n, cat, conf, lon, lat in lug:
    x, y = m(lon, lat); lugares.append({'id': hashlib.sha1(n.encode()).hexdigest()[:8], 'nombre': n, 'municipio': A.nombre or A.id, 'x': round(x, 1), 'y': round(y, 1), 'ancho': 40, 'alto': 40, 'dibujo': cat or '', 'dato': cat or '', 'secreto': False})
NOMBRE = A.nombre or A.id

# ---------- 5. Contenedor MC4 ----------
capas = []
def capa(nombre, tipo, buf, **extra): capas.append((nombre, tipo, buf, extra))
capa('suelo', 'u8', suelo.tobytes(), w=W, h=H)
capa('relieve', 'i16', rel.astype('<i2').tobytes(), w=eW, h=eH, paso=ES)
for n in ('municipio', 'comuna', 'lotes'): capa(n, 'u8', (muni if n == 'municipio' else np.zeros((mH, mW), np.uint8)).tobytes(), w=mW, h=mH, paso=CEL)
capa('barrio', 'u16', np.zeros((mH, mW), '<u2').tobytes(), w=mW, h=mH, paso=CEL)
capa('pisos', 'u8', pis.tobytes(), w=mW, h=mH, paso=CEL)
capa('nivel', 'i8', np.zeros((H, W), np.int8).tobytes(), w=W, h=H)
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':')).encode()
capa('vias', 'json', J(VJ), formato='VIASJ')
capa('edificios', 'json', J({'kinds': EDK, 'lista': EDJ}), formato='EDJ', R=320)
capa('info', 'json', J({'barrios': [], 'comunas': [], 'municipios': [NOMBRE], 'calles': sorted({v[1] for v in VJ if v[1]}), 'sitios_nombres': [], 'rio': [], 'parques': []}))
capa('pasos', 'json', J({'tipos': ['puente', 'tunel', 'viaducto'], 'lista': []}))
capa('transporte', 'json', J({'lineas': [], 'encicla': []}))
capa('lugares', 'json', J({'lugares': lugares, 'hitos': []}))
capa('trafico', 'json', J({'carriles': [], 'semaforos': []}))
blobs, tabla, off = [], {}, 0
for nombre, tipo, buf, extra in capas:
    co = zlib.compressobj(9, zlib.DEFLATED, -15); z = co.compress(buf) + co.flush()
    tabla[nombre] = dict(extra, o=off, n=len(z), raw=len(buf), tipo=tipo, sha1=hashlib.sha1(buf).hexdigest()[:12]); blobs.append(z); off += len(z)
KX, KY = MX / T, MY / T
meta = {'formato': 'MC4', 'v': 4, 'motor': json.load(open(os.path.join(RAIZ, 'VERSION.json')))['version'], 'ciudad': A.id, 'nombre': NOMBRE, 'W': W, 'H': H, 'tile': T, 'lon0': LON0, 'latN': LATN, 'lon1': LON1, 'latS': LATS, 'kx': KX, 'ky': KY, 'unidad': 'm',
        'fuentes': {'overture': A.release, 'relieve': f'terrarium z{Z}'}, 'atribucion': ['© colaboradores de OpenStreetMap (ODbL), vía Overture Maps Foundation; huellas de Overture (OSM, Microsoft y Google)', 'Relieve: Terrain Tiles (AWS Open Data; SRTM/NASA y otros)'], 'capas': tabla}
mj = J(meta); data = b'MC4\0' + len(mj).to_bytes(4, 'little') + mj + b''.join(blobs)
open(os.path.join(OUT, 'mundo.mc4'), 'wb').write(data)
json.dump({'ciudad': A.id, 'bytes': len(data), 'casillas': [W, H], 'tile': T, 'vias': len(VJ), 'edificios': len(EDJ), 'lugares': len(lugares), 'relieve': [int(rel.min()), int(rel.max())], 'saneamiento': SAN}, open(os.path.join(OUT, 'resumen.json'), 'w'), indent=1)
cfg = os.path.join(RAIZ, 'ciudades', A.id + '.json')
if not os.path.exists(cfg):
    base = json.load(open(os.path.join(RAIZ, 'ciudades', 'medellin.json'), encoding='utf8'))
    base.update({'id': A.id, 'nombre': NOMBRE, 'ventana': {'lon0': LON0, 'latN': LATN, 'lon1': LON1, 'latS': LATS, 'lat_ref': LATR}, 'casilla_m': T, 'zona_por_comuna': [None], 'zona_por_municipio': [None, 'pueblo'], 'emblematicos': None})
    base['atribucion'] = meta['atribucion']; json.dump(base, open(cfg, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f'✓ {os.path.relpath(os.path.join(OUT, "mundo.mc4"), RAIZ)} · {len(data) / 1048576:.2f} MB · {len(VJ)} vías · {len(EDJ)} edificios · {len(lugares)} lugares')
