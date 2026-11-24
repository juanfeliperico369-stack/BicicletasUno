"""LEY DE SOBERANÍA VIAL (Motor del Valle 1.3.0): ninguna casa de capa 0 sobre una vía de capa 0 ni sobre el agua.

   Rehace las huellas de los edificios del Valle de Aburrá desde las fuentes originales y las sanea en los datos, no en el dibujo:
     1. M_vial: la unión de los corredores de las vías de capa 0 (búferes de extremos redondos de radio ancho/2 + andén, según
        la regla activa de geo/anchos.json), más el carril del Metroplús y la vía del tranvía. Los puentes y los túneles
        (road_flags y level_rules de Overture) no recortan lo que está en otro nivel.
     2. M_agua: el río Medellín, las quebradas y el agua a cielo abierto (las quebradas tapadas van en la capa -1).
     3. B_limpio = B \\ (M_vial ∪ M_agua), con shapely 2 y STRtree.
        Una casa confiable (un polígono de OpenStreetMap) que choca solo con calles menores no se recorta: se marca en
        geometry-conflicts.geojson con su fuente y su severidad, porque la desplazada puede ser la calle.
     4. Higiene: fuera los restos de menos de 16 m²; Douglas-Peucker a 0,6 m (y otro recorte si la simplificación volvió a
        la calle); si lo recortado sigue siendo un rectángulo (IoU >= 0,92), se guarda como rectángulo.
     5. zMin y zMax del suelo bajo los vértices (el mismo relieve de 80 m que dibujan los juegos) y zBase = zMin - 6 m.
     6. Bioma por trozo de 160 m (centro, ladera_ladrillo, residencial_verde, industrial_rio, rural_montana), con la tabla de
        zonas de El Metro (VC.ZC y VC.ZM), el uso del suelo, la densidad y la pendiente.
     7. Índice por trozos de 160 m con la clave "cx,cy" (c = floor(x / 160)).

   Entrada: geo/cache/ (fetch.py: huellas, agua_niveles, puentes, landuse, rail), salida/sanear/vias_m.bin (los ejes precisos de
            las vías, de geo/build.py con VIAS_M) y salida/sanear/mapa/ (el mapa de 10 m de geo/build.py: relieve, municipios
            y comunas). Lo arma todo: node motor-valle/motor.mjs sanear
   Salida (salida/sanear/): huellas.parquet (las huellas saneadas, en metros: x al este y y al sur desde lon0/latN),
            geometry-conflicts.geojson, biomas.json, trozos.json e informe.json.
   Uso: python3 motor-valle/geo/sanear.py   (REGLA=B o C prueba otra regla; OUT=carpeta cambia la salida)
   Datos: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; Google Open Buildings (CC BY 4.0 / ODbL) y Microsoft ML
   Buildings (ODbL) vía Overture; malla vial oficial de Medellín; relieve SRTM (NASA, AWS Terrain Tiles).
"""
import json, math, os, sys, time, zlib, collections
import numpy as np
import shapely
import shapely.ops
from shapely import STRtree

HERE = os.path.dirname(os.path.abspath(__file__)); MOTOR = os.path.dirname(HERE); ROOT = os.path.dirname(MOTOR); CACHE = os.path.join(HERE, 'cache')
sys.path.insert(0, HERE)
CFG = json.load(open(os.path.join(HERE, 'anchos.json'), encoding='utf-8'))
REGLA = os.environ.get('REGLA') or CFG['regla_activa']
OUT = os.environ.get('OUT') or os.path.join(MOTOR, 'salida', 'sanear'); os.makedirs(OUT, exist_ok=True)
MAPA = os.environ.get('MAPA') or os.path.join(OUT, 'mapa')
LON0, LON1, LATN, LATS = -75.70, -75.31, 6.46, 6.015
KXM = 111320 * math.cos(math.radians((LATN + LATS) / 2)); KYM = 110574.0     # metros por grado (los mismos de geo/build.py)
TROZO = float(CFG['trozo_m']); HIG = CFG['higiene']; T0 = time.time()
ZC = [None, 'ladera', 'ladera', 'ladera', 'mixto', 'mixto', 'ladera', 'mixto', 'ladera', 'ladera', 'centro', 'laureles', 'laureles', 'ladera', 'poblado', 'mixto', 'laureles', 'pueblo', 'mixto', 'pueblo', 'pueblo', 'pueblo']   # El Metro, 11-edificios.js (VC.ZC)
ZM = [None, 'mixto', 'mixto', 'mixto', 'poblado', 'poblado', 'mixto', 'pueblo', 'mixto', 'pueblo', 'pueblo']   # El Metro, VC.ZM
BIOMAS = CFG['biomas']; BI = {b: i for i, b in enumerate(BIOMAS)}
F_EXT = 1 / math.cos(1.5 * math.pi / 32)   # 8 segmentos por cuarto de círculo; GEOS redondea los segmentos de cada arco, que puede abrir hasta 1,5 veces: así el polígono queda POR FUERA del círculo de verdad


def log(*a): print(f'[{time.time() - T0:6.1f} s]', *a, flush=True)
def proy(xy): return np.column_stack([(xy[:, 0] - LON0) * KXM, (LATN - xy[:, 1]) * KYM])
def a_lonlat(xy): return np.column_stack([LON0 + xy[:, 0] / KXM, LATN - xy[:, 1] / KYM])
def partes(g):
    if g is None or g.is_empty: return []
    if g.geom_type in ('Polygon', 'LineString'): return [g]
    return [p for q in getattr(g, 'geoms', []) for p in partes(q)]
def poligonos(g): return [p for p in partes(g) if p.geom_type == 'Polygon' and p.area > 0]


# ---------------- el mapa de 10 m: relieve (80 m), municipios y comunas (celdas de 80 m) ----------------
def cargar_mapa():
    M = json.load(open(os.path.join(MAPA, 'valle.json'), encoding='utf-8')); raw = zlib.decompress(open(os.path.join(MAPA, 'valle.bin'), 'rb').read(), -15)
    nT, nE, nM = M['W'] * M['H'], M['eW'] * M['eH'], M['mW'] * M['mH']
    E = np.frombuffer(raw[nT:nT + nE * 2], np.int16).reshape(M['eH'], M['eW']).astype(np.float64).cumsum(1)
    MU = np.frombuffer(raw[nT + nE * 2:nT + nE * 2 + nM], np.uint8).reshape(M['mH'], M['mW'])
    CO = np.frombuffer(raw[nT + nE * 2 + nM:nT + nE * 2 + nM * 2], np.uint8).reshape(M['mH'], M['mW'])
    return M, E, MU, CO
MAP, E, MU, CO = cargar_mapa(); TILE = MAP['tile']; GE = TILE * MAP['es']; CEL = TILE * 8; WM, HM = MAP['W'] * TILE, MAP['H'] * TILE
def elev(x, y):
    """relieve en metros, bilineal en la grilla de 80 m (la misma fórmula de El Metro, 10-map.js · elevM, y de EnCicla)"""
    gx = np.clip(np.asarray(x) / GE, 0, MAP['eW'] - 1.001); gy = np.clip(np.asarray(y) / GE, 0, MAP['eH'] - 1.001); i = gx.astype(int); j = gy.astype(int); fx = gx - i; fy = gy - j
    return (E[j, i] * (1 - fx) + E[j, i + 1] * fx) * (1 - fy) + (E[j + 1, i] * (1 - fx) + E[j + 1, i + 1] * fx) * fy
def celda(x, y, A):
    return A[np.clip((np.asarray(y) // CEL).astype(int), 0, A.shape[0] - 1), np.clip((np.asarray(x) // CEL).astype(int), 0, A.shape[1] - 1)]
def zona(x, y):
    c = celda(x, y, CO); m = celda(x, y, MU)
    return np.where(c > 0, np.array(ZC + [None] * 0, dtype=object)[np.clip(c, 0, len(ZC) - 1)], np.array(ZM, dtype=object)[np.clip(m, 0, len(ZM) - 1)])
log('mapa', MAP['W'], '×', MAP['H'], 'casillas de', TILE, 'm · relieve', int(E.min()), '..', int(E.max()), 'm')


# ---------------- vías: los ejes precisos de vias.bin (geo/build.py con VIAS_M), en el mismo orden ----------------
def cargar_vias(path):
    import struct
    b = zlib.decompress(open(path, 'rb').read()); mag, ver, n = struct.unpack_from('<4sII', b, 0); o = 12; L = []
    if mag != b'VIAM': raise SystemExit('vias_m.bin no es de geo/build.py')
    meta = json.load(open(path + '.json', encoding='utf-8'))
    for i in range(n):
        k, nm, nom, w2, np_ = struct.unpack_from('<BHHBI', b, o); o += 10
        P = np.frombuffer(b[o:o + np_ * 8], '<f4').reshape(-1, 2).astype(np.float64); o += np_ * 8
        L.append({'i': i, 'k': k, 'nm': meta['calles'][nm - 1] if nm else '', 'nom': meta['calles'][nom - 1] if nom else '', 'w': w2 / 2, 'P': P})
    return L
VIAS = cargar_vias(os.path.join(OUT, 'vias_m.bin'))
log('vías', len(VIAS), '·', sum(len(v['P']) for v in VIAS), 'puntos')


# ---------------- capas: puentes y túneles de Overture (road_flags y level_rules con su tramo «between») ----------------
from niveles import tramos_otro_nivel, intervalos, a_nivel
NIV = tramos_otro_nivel(proy)
log('tramos en otro nivel', len(NIV), dict(collections.Counter(t for t, _, _ in NIV)))
LV = [shapely.LineString(v['P']) if len(v['P']) > 1 else None for v in VIAS]
INTERV = intervalos(LV, NIV)   # vía -> [(s0, s1, nivel)]: los ejes coinciden punto a punto con los tramos de Overture
log('vías con tramos en otro nivel', len(INTERV))
def tramos_capa0(j):
    """las partes de la vía j que van en la capa 0"""
    return a_nivel(LV[j], INTERV.get(j)) if LV[j] is not None else []


# ---------------- el radio de cada corredor según la regla ----------------
R_A = CFG['reglas']['A']; R_B = CFG['reglas']['B']; R_C = CFG['reglas']['C']
def radio(k, w, lad=False):
    k = str(k)
    if REGLA == 'A' or (REGLA == 'C' and not lad and int(k) not in R_C['tipos_con_regla_B']):
        return max(R_A['radio_minimo_m'], w / 2 + R_A['anden_m'][k])
    if REGLA == 'B' or (REGLA == 'C' and int(k) in R_C['tipos_con_regla_B']):
        return max(R_B['radio_minimo_m'], max(R_B['ancho_jugable_m'].get(k, 0), w) / 2 + R_B['anden_m'][k])
    return max(R_C['radio_minimo_m'], w / 2 + R_C['anden_ladera_m'])   # regla C en ladera


# ---------------- M_vial: trozos de corredor de hasta 40 m (búferes pequeños para el STRtree) ----------------
def trocear(g, paso=40.0):
    if g.length <= paso: return [g]
    n = int(math.ceil(g.length / paso)); return [shapely.ops.substring(g, g.length * i / n, g.length * (i + 1) / n) for i in range(n)]
PZ, PZk, PZv, PZr = [], [], [], []   # geometría, tipo (1-7; 20 metroplús; 21 tranvía; 30 agua), vía, radio
MENORES = set(CFG['confiables']['calles_menores'])
for j, v in enumerate(VIAS):
    if not 1 <= v['k'] <= 7: continue
    if REGLA == 'C':
        mid = LV[j].interpolate(.5, normalized=True) if LV[j] is not None else None
        lad = mid is not None and zona([mid.x], [mid.y])[0] == 'ladera'
    else: lad = False
    r = radio(v['k'], v['w'], lad)
    for g in tramos_capa0(j):
        for t in trocear(g): PZ.append(t.buffer(r * F_EXT, quad_segs=8)); PZk.append(v['k']); PZv.append(j); PZr.append(r)
nV = len(PZ)
# transporte a nivel: el carril del Metroplús (de El Metro: metroplus.json de EnCicla o metroplus.js) y la vía del tranvía (OSM)
TR = CFG['transporte_a_nivel_m']
def metroplus():
    for f in ('metroplus.json', 'metroplus.js'):
        p = os.path.join(ROOT, 'src', 'data', f)
        if not os.path.exists(p): continue
        s = open(p, encoding='utf-8').read()
        if f.endswith('.json'): return {k: np.array(c).reshape(-1, 2) for k, c in json.loads(s)['corredores'].items()}
        d = json.loads(s[s.index('{'):s.rindex('}') + 1]); return {k: np.array(c['p']).reshape(-1, 2) for k, c in d.items() if isinstance(c, dict) and 'p' in c}
    return {}
MP = metroplus()
for k, P in MP.items():
    if len(P) < 2: continue
    for t in trocear(shapely.LineString(P)): PZ.append(t.buffer(TR['brt'] * F_EXT, quad_segs=8)); PZk.append(20); PZv.append(-1); PZr.append(TR['brt'])
import duckdb
_dk = duckdb.connect()
for (w,) in _dk.execute(f"select wkt from '{os.path.join(CACHE, 'rail.parquet')}' where class='tram'").fetchall():
    for g in partes(shapely.from_wkt(w)):
        if g.geom_type != 'LineString': continue
        g = shapely.LineString(proy(np.asarray(g.coords)))
        for t in trocear(g): PZ.append(t.buffer(TR['tram'] * F_EXT, quad_segs=8)); PZk.append(21); PZv.append(-1); PZr.append(TR['tram'])
log('corredores de capa 0:', nV, 'trozos de vía ·', len(PZ) - nV, 'de transporte (Metroplús', len(MP), 'líneas, y tranvía)')


# ---------------- M_agua: el agua a cielo abierto ----------------
AG = CFG['agua']; nAg0 = len(PZ); AGUA_POL = []
def tapada(lv, tags):
    t = json.loads(tags) if tags else {}
    return (lv is not None and lv < 0) or t.get('tunnel') in ('yes', 'culvert', 'flooded') or t.get('covered') == 'yes' or t.get('location') in ('underground', 'underwater')
for _id, sub, cl, name, lv, tags, w in _dk.execute(f"select id, subtype, class, name, level, tags, wkt from '{os.path.join(CACHE, 'agua_niveles.parquet')}'").fetchall():
    if cl in AG['no_son_agua'] or sub == 'human_made' or tapada(lv, tags): continue
    for g in partes(shapely.from_wkt(w)):
        if g.geom_type == 'Polygon' and (cl in AG['poligonos'] or sub in AG['poligonos']):
            g = shapely.make_valid(shapely.transform(g, proy))
            for p in poligonos(g): AGUA_POL.append(p)
        elif g.geom_type == 'LineString' and (cl in AG['lineas_m'] or sub in AG['lineas_m']):
            r = AG['lineas_m'].get(cl, AG['lineas_m'].get(sub, 1.5)); g = shapely.LineString(proy(np.asarray(g.coords)))
            for t in trocear(g): PZ.append(t.buffer(r * F_EXT, quad_segs=8)); PZk.append(30); PZv.append(-1); PZr.append(r)
# los polígonos grandes (el río y los embalses) se parten por mitades hasta quedar de 160 m o menos
def partir(p):
    x0, y0, x1, y1 = p.bounds
    if max(x1 - x0, y1 - y0) <= TROZO or p.area < 1: return [p]
    if x1 - x0 >= y1 - y0: xm = (x0 + x1) / 2; cajas = (shapely.box(x0 - 1, y0 - 1, xm, y1 + 1), shapely.box(xm, y0 - 1, x1 + 1, y1 + 1))
    else: ym = (y0 + y1) / 2; cajas = (shapely.box(x0 - 1, y0 - 1, x1 + 1, ym), shapely.box(x0 - 1, ym, x1 + 1, y1 + 1))
    return [z for c in cajas for q in poligonos(p.intersection(c)) for z in partir(q)]
for p in AGUA_POL:
    for z in partir(p): PZ.append(z); PZk.append(30); PZv.append(-1); PZr.append(0)
PZ = np.array(PZ, dtype=object); PZk = np.array(PZk); PZv = np.array(PZv); PZr = np.array(PZr)
ES_VIA = PZk <= 7; ES_MENOR = np.isin(PZk, list(MENORES)); ES_AGUA = PZk == 30
log('agua a cielo abierto:', int(ES_AGUA.sum()), 'trozos ·', len(AGUA_POL), 'polígonos')
ARBOL = STRtree(PZ)


# ---------------- huellas de Overture (OSM, Microsoft y Google), como las lee El Metro (tools/edificios_datos.py) ----------------
import pyarrow as pa, pyarrow.parquet as pq
HT = pq.read_table(os.path.join(CACHE, 'huellas.parquet')).to_pydict()
G = shapely.make_valid(shapely.transform(shapely.from_wkb(HT['wkb']), proy))
def mayor(g):   # un multipolígono de make_valid se queda con su parte mayor (como El Metro)
    if g.geom_type == 'Polygon': return g
    ps = poligonos(g); return max(ps, key=lambda p: p.area) if ps else None
G = np.array([mayor(g) for g in G], dtype=object); ok = np.array([g is not None for g in G])
A0 = np.zeros(len(G)); A0[ok] = shapely.area(G[ok]); CT = np.zeros((len(G), 2)); CT[ok] = shapely.get_coordinates(shapely.centroid(G[ok]))
ok &= (A0 >= HIG['area_minima_m2']) & (CT[:, 0] > 0) & (CT[:, 1] > 0) & (CT[:, 0] < WM) & (CT[:, 1] < HM)
IX = np.nonzero(ok)[0]; G = G[IX]; A0 = A0[IX]; N = len(G)
SRC = np.array(HT['src'], dtype=object)[IX]; CONF = np.isin(SRC, CFG['confiables']['fuentes'])
log('huellas', len(HT['id']), '→ en el mapa (>= 12 m²):', N, '· área', round(A0.sum() / 1e6, 2), 'km² ·', dict(collections.Counter(SRC)))


# ---------------- el recorte: B_limpio = B \ (M_vial ∪ M_agua) ----------------
bi, pj = ARBOL.query(G, predicate='intersects')
ai = shapely.area(shapely.intersection(G[bi], PZ[pj])); m = ai > 1e-4; bi, pj, ai = bi[m], pj[m], ai[m]
log('pares casa-corredor que se tocan:', len(bi), '· casas:', len(np.unique(bi)))
orden = np.argsort(bi, kind='stable'); bi, pj, ai = bi[orden], pj[orden], ai[orden]
cortes = np.flatnonzero(np.diff(bi)) + 1; grupos = np.split(np.arange(len(bi)), cortes) if len(bi) else []
GEOM = list(G)                     # la huella limpia (Polygon) o None si desaparece
EXTRA_PARTES = []                  # (índice de origen, polígono): las partes de 16 m² o más de una casa que la calle partió en dos
RECORT = np.zeros(N, bool); MARCA = np.zeros(N, np.uint8)       # 1 = casa confiable marcada (no se recorta)
INV = np.zeros(N); INVK = np.zeros(N, np.uint8); QUITA = np.zeros(N, np.uint8)   # área invadida, tipo de vía, por qué desaparece (1 resto chico, 2 toda en la calle)
CONFLICTOS = []
eps = HIG['douglas_peucker_m']; FMIN = HIG['fragmento_minimo_m2']
def limpiar(g, M, vale):
    """B \\ M, sin restos chicos, simplificado (sin volver a la calle). Un resto es lo que queda de menos de 16 m²; una casa
       chica que apenas se roza (conserva el 90 % de su área y queda de 12 m² o más) no es un resto: sigue.
       La simplificación puede empujar un borde hacia afuera, contra un trozo que la casa original no tocaba: se vuelven a buscar
       todos los trozos que toca la forma simplificada (vale(j): los que esta casa respeta) y se recorta otra vez."""
    a0 = g.area; amin = lambda p: p.area >= FMIN or (p.area >= .9 * a0 and p.area >= HIG['area_minima_m2'])
    d = shapely.difference(g, M, grid_size=None)
    ps = [p for p in poligonos(d) if amin(p)]
    out = []
    for p in ps:
        s = shapely.simplify(p, eps, preserve_topology=True)
        if s.is_empty: continue
        js2 = [j for j in ARBOL.query(s, predicate='intersects') if vale(j)]
        if js2:
            M2 = shapely.union_all(PZ[js2])
            if shapely.intersection(s, M2).area > 1e-6: s = shapely.difference(s, M2)
        out += [q for q in poligonos(shapely.make_valid(s)) if amin(q)]
    return out
for gi, idx in enumerate(grupos):
    i = bi[idx[0]]; js = pj[idx]
    via = ES_VIA[js] | (PZk[js] >= 20) & (PZk[js] < 30); agua = ES_AGUA[js]; menor = ES_MENOR[js]
    mayor_o_agua = ~menor
    if CONF[i] and not mayor_o_agua.any():
        # casa confiable contra calles menores: no se recorta, se marca
        MARCA[i] = 1; inv = shapely.intersection(G[i], shapely.union_all(PZ[js])); INV[i] = inv.area
        INVK[i] = collections.Counter(PZk[js]).most_common(1)[0][0]
        CONFLICTOS.append((i, inv, int(INVK[i]))); continue
    usar = js if not CONF[i] else js[mayor_o_agua]
    if CONF[i] and menor.any():   # confiable contra una mayor y también una menor: se recorta por la mayor y el agua, y lo de la menor se marca
        MARCA[i] = 1; inv = shapely.intersection(G[i], shapely.union_all(PZ[js[menor]])); CONFLICTOS.append((i, inv, int(collections.Counter(PZk[js[menor]]).most_common(1)[0][0])))
    M = shapely.union_all(PZ[usar]); INV[i] = shapely.intersection(G[i], M).area; INVK[i] = collections.Counter(PZk[usar]).most_common(1)[0][0]
    ps = limpiar(G[i], M, (lambda j: not ES_MENOR[j]) if CONF[i] else (lambda j: True))
    if not ps: GEOM[i] = None; QUITA[i] = 2 if INV[i] > .9 * A0[i] else 1; continue
    ps.sort(key=lambda p: -p.area); GEOM[i] = ps[0]; RECORT[i] = True
    for p in ps[1:]: EXTRA_PARTES.append((i, p))
    if gi % 20000 == 0: log('  recortadas', gi, 'de', len(grupos))
log('recortadas', int(RECORT.sum()), '· desaparecen', int((QUITA > 0).sum()), '(restos de menos de 16 m²:', int((QUITA == 1).sum()), '· enteras en la calle o el agua:', int((QUITA == 2).sum()), ') · partes extra', len(EXTRA_PARTES), '· confiables marcadas', int((MARCA > 0).sum()))

# las partes extra son casas nuevas con los mismos datos de su origen
ORIG = np.concatenate([np.arange(N), np.array([i for i, _ in EXTRA_PARTES], int)]) if EXTRA_PARTES else np.arange(N)
GEOM += [p for _, p in EXTRA_PARTES]
vivo = np.array([g is not None for g in GEOM]); GL = np.array(GEOM, dtype=object)
RECORT = np.concatenate([RECORT, np.ones(len(EXTRA_PARTES), bool)]); MARCA = np.concatenate([MARCA, MARCA[[i for i, _ in EXTRA_PARTES]] if EXTRA_PARTES else np.zeros(0, np.uint8)])
NN = len(GL)


# ---------------- rectángulos: lo recortado que sigue siendo un rectángulo (IoU >= 0,92) se guarda como rectángulo ----------------
def rect_de(o):
    """rectángulo orientado (envolvente mínima) -> (cx, cy, medio largo, medio ancho, ángulo del lado largo en [0, π))"""
    c = np.asarray(o.exterior.coords)[:4]; e1 = c[1] - c[0]; e2 = c[2] - c[1]; l1, l2 = math.hypot(*e1), math.hypot(*e2)
    if l1 < l2: e1, l1, l2 = e2, l2, l1
    m = c.mean(0); return (m[0], m[1], l1 / 2, l2 / 2, math.atan2(e1[1], e1[0]) % math.pi)
def rect_pol(cx, cy, hl, hw, an):
    ux, uy = math.cos(an), math.sin(an)
    return shapely.Polygon([(cx - ux * hl + uy * hw, cy - uy * hl - ux * hw), (cx + ux * hl + uy * hw, cy + uy * hl - ux * hw), (cx + ux * hl - uy * hw, cy + uy * hl + ux * hw), (cx - ux * hl - uy * hw, cy - uy * hl + ux * hw)])
def encoger(r, M, it=10):
    """el rectángulo más grande dentro de r (mismo eje) que no toca M: corre el lado que menos área pierde (exacto, con shapely)"""
    cx, cy, hl, hw, an = r; ux, uy = math.cos(an), math.sin(an); a0, a1, d0, d1 = -hl, hl, -hw, hw
    for _ in range(it):
        R = rect_pol(cx + ux * (a0 + a1) / 2 - uy * (d0 + d1) / 2, cy + uy * (a0 + a1) / 2 + ux * (d0 + d1) / 2, (a1 - a0) / 2, (d1 - d0) / 2, an)
        I = shapely.intersection(R, M)
        if I.area < 1e-4: return (cx + ux * (a0 + a1) / 2 - uy * (d0 + d1) / 2, cy + uy * (a0 + a1) / 2 + ux * (d0 + d1) / 2, (a1 - a0) / 2, (d1 - d0) / 2, an)
        q = shapely.get_coordinates(I); dx = q[:, 0] - cx; dy = q[:, 1] - cy; a = dx * ux + dy * uy; d = -dx * uy + dy * ux
        ia0, ia1, id0, id1 = a.min(), a.max(), d.min(), d.max()
        op = [(ia1 + .01, a1, d0, d1), (a0, ia0 - .01, d0, d1), (a0, a1, id1 + .01, d1), (a0, a1, d0, id0 - .01)]
        op = [o for o in op if o[1] - o[0] >= 1 and o[3] - o[2] >= 1]
        if not op: return None
        a0, a1, d0, d1 = max(op, key=lambda o: (o[1] - o[0]) * (o[3] - o[2]))
    return None
OBB = np.empty(NN, dtype=object); OBB[vivo] = shapely.oriented_envelope(GL[vivo])
AL = np.zeros(NN); AL[vivo] = shapely.area(GL[vivo]); AOBB = np.zeros(NN); AOBB[vivo] = shapely.area(OBB[vivo])
# ¿el rectángulo mínimo de cada casa toca algún corredor o el agua? (lo usan los exportadores)
oi, oj = ARBOL.query(OBB[vivo], predicate='intersects'); vi = np.flatnonzero(vivo)
toca = np.zeros(NN, bool)
if len(oi):
    a = shapely.area(shapely.intersection(OBB[vi[oi]], PZ[oj])); np.logical_or.at(toca, vi[oi[a > 1e-4]], True)
OBB_LIBRE = vivo & ~toca
FORMA = np.zeros(NN, np.uint8)        # 0 polígono, 1 rectángulo
RECT = np.full((NN, 5), np.nan)
iou = HIG['iou_rectangulo']; ncand = 0
for i in np.flatnonzero(vivo & RECORT):
    o = OBB[i]
    if o.geom_type != 'Polygon': continue
    r = rect_de(o)
    if OBB_LIBRE[i] and AL[i] / max(AOBB[i], 1e-9) >= iou: FORMA[i] = 1; RECT[i] = r; continue
    js = ARBOL.query(o, predicate='intersects')
    if not len(js): continue
    ncand += 1; rr = encoger(r, shapely.union_all(PZ[js]))
    if rr is None: continue
    R = rect_pol(*rr); inter = shapely.intersection(R, GL[i]).area; uni = R.area + AL[i] - inter
    if inter / max(uni, 1e-9) >= iou: FORMA[i] = 1; RECT[i] = rr
log('recortadas que vuelven a ser rectángulo (IoU >= 0,92):', int((FORMA == 1).sum()), 'de', int((vivo & RECORT).sum()), '· rectángulos mínimos libres:', int(OBB_LIBRE.sum()))


# ---------------- zócalo: zMin y zMax del suelo bajo los vértices, zBase = zMin - 6 m ----------------
geo_z = np.array([rect_pol(*RECT[i]) if FORMA[i] else GL[i] for i in range(NN)], dtype=object)
ZMIN = np.full(NN, np.nan); ZMAX = np.full(NN, np.nan)
cz, iz = shapely.get_coordinates(geo_z[vivo], return_index=True); vz = np.flatnonzero(vivo)[iz]; ez = elev(cz[:, 0], cz[:, 1])
np.fmin.at(ZMIN, vz, ez); np.fmax.at(ZMAX, vz, ez)
ZBASE = ZMIN - CFG['zocalo_m']
log('zócalo: desnivel bajo la casa (zMax - zMin) p50', round(float(np.nanmedian(ZMAX - ZMIN)), 2), 'm · p90', round(float(np.nanpercentile(ZMAX - ZMIN, 90)), 2), 'm · máx', round(float(np.nanmax(ZMAX - ZMIN)), 1), 'm')


# ---------------- ancla (el centroide, o un punto dentro si la forma es cóncava) y trozo de 160 m ----------------
ANC = np.zeros((NN, 2)); ANC[vivo] = shapely.get_coordinates(shapely.centroid(geo_z[vivo]))
fuera = vivo.copy(); fuera[vivo] = ~shapely.contains_xy(geo_z[vivo], ANC[vivo, 0], ANC[vivo, 1])
if fuera.any(): ANC[fuera] = shapely.get_coordinates(shapely.point_on_surface(geo_z[fuera]))
TX = np.floor(ANC[:, 0] / TROZO).astype(int); TY = np.floor(ANC[:, 1] / TROZO).astype(int)
NX, NY = int(math.ceil(WM / TROZO)), int(math.ceil(HM / TROZO))


# ---------------- biomas por trozo de 160 m ----------------
cob = np.zeros((NY, NX)); np.add.at(cob, (np.clip(TY[vivo], 0, NY - 1), np.clip(TX[vivo], 0, NX - 1)), AL[vivo]); cob /= TROZO * TROZO
cls = np.array(HT['class'], dtype=object)[IX][ORIG]; ind_a = np.zeros((NY, NX))
esind = vivo & np.isin(cls, ['industrial', 'warehouse', 'manufacture', 'factory', 'hangar', 'storage_tank'])
np.add.at(ind_a, (np.clip(TY[esind], 0, NY - 1), np.clip(TX[esind], 0, NX - 1)), AL[esind])
ind_frac = ind_a / np.maximum(cob * TROZO * TROZO, 1)
# uso del suelo industrial (Overture land_use) en el centro del trozo
gyc, gxc = np.mgrid[0:NY, 0:NX]; xc = (gxc + .5) * TROZO; yc = (gyc + .5) * TROZO
ind_lu = np.zeros((NY, NX), bool)
for (w,) in _dk.execute(f"select wkt from '{os.path.join(CACHE, 'landuse.parquet')}' where class in ('industrial', 'works', 'railway', 'depot')").fetchall():
    g = shapely.make_valid(shapely.transform(shapely.from_wkt(w), proy))
    for p in poligonos(g):
        x0, y0, x1, y1 = p.bounds; i0, i1 = max(0, int(x0 // TROZO)), min(NX - 1, int(x1 // TROZO)); j0, j1 = max(0, int(y0 // TROZO)), min(NY - 1, int(y1 // TROZO))
        if i1 < i0 or j1 < j0: continue
        sx, sy = xc[j0:j1 + 1, i0:i1 + 1], yc[j0:j1 + 1, i0:i1 + 1]; ind_lu[j0:j1 + 1, i0:i1 + 1] |= shapely.contains_xy(p, sx, sy)
z_c = zona(xc.ravel(), yc.ravel()).reshape(NY, NX); mu_c = celda(xc.ravel(), yc.ravel(), MU).reshape(NY, NX)
h0 = elev(xc.ravel(), yc.ravel()).reshape(NY, NX); hx = elev(xc.ravel() + 40, yc.ravel()).reshape(NY, NX) - elev(xc.ravel() - 40, yc.ravel()).reshape(NY, NX); hy = elev(xc.ravel(), yc.ravel() + 40).reshape(NY, NX) - elev(xc.ravel(), yc.ravel() - 40).reshape(NY, NX)
pend = np.hypot(hx, hy) / 80
BIO = np.full((NY, NX), BI['residencial_verde'], np.uint8)
BIO[(z_c == 'ladera') | ((pend > .15) & (cob > .02))] = BI['ladera_ladrillo']
BIO[(z_c == 'centro') & (cob > .08)] = BI['centro']   # La Candelaria (comuna 10): el centro de verdad; lo demás denso y plano es residencial
BIO[(ind_lu & (cob > .03)) | ((ind_frac > .5) & (cob > .03))] = BI['industrial_rio']
BIO[(mu_c == 0) | ((cob < .03) & ~ind_lu) | ((h0 > 1950) & (cob < .08))] = BI['rural_montana']
BIOMA = BIO[np.clip(TY, 0, NY - 1), np.clip(TX, 0, NX - 1)]
cuenta_b = collections.Counter(BIOMAS[b] for b in BIO.ravel()); log('biomas por trozo de 160 m:', dict(cuenta_b))


# ---------------- conflictos: geometry-conflicts.geojson ----------------
EST = []   # estaciones (entradas): metro y tranvía, cables y andenes del Metroplús
for l in json.load(open(os.path.join(HERE, 'lineas.json'), encoding='utf-8'))['lineas']:
    if l['tipo'] in ('metro', 'tram', 'cable', 'brt'): EST += [((lo - LON0) * KXM, (LATN - la) * KYM) for _, la, lo in l['estaciones']]
EST = np.array(EST); TE = STRtree(shapely.points(EST))
SEV = CFG['severidad_m2']; RC = CFG['critica']['radio_estacion_m']
feats = []; cuenta_sev = collections.Counter()
TIPOV = {**{int(k): v for k, v in CFG['tipos'].items()}, 20: 'metroplús', 21: 'tranvía', 30: 'agua'}
for i, inv, kmen in CONFLICTOS:
    a = inv.area; sev = 'baja' if a < SEV['baja'] else 'media' if a < SEV['media'] else 'alta'
    if len(TE.query(G[i], predicate='dwithin', distance=RC)): sev = 'crítica'
    cuenta_sev[sev] += 1
    c = a_lonlat(np.asarray(G[i].exterior.coords)).round(7).tolist()
    feats.append({'type': 'Feature', 'geometry': {'type': 'Polygon', 'coordinates': [c]}, 'properties': {
        'id': HT['id'][IX[i]], 'fuente': SRC[i], 'severidad': sev, 'area_invadida_m2': round(a, 2), 'area_casa_m2': round(A0[i], 1),
        'via': TIPOV.get(kmen, '?'), 'accion': 'marcada: la casa confiable no se recorta' + (' (sí por la vía mayor o el agua)' if RECORT[i] else ''),
        'x_m': round(float(shapely.centroid(G[i]).x), 1), 'y_m': round(float(shapely.centroid(G[i]).y), 1)}})
json.dump({'type': 'FeatureCollection', 'name': 'geometry-conflicts', 'regla': REGLA,
           'nota': 'Casas confiables (polígonos de OpenStreetMap) que chocan con calles menores (calle, ciclorruta, peatonal o escalas): no se recortan; se marcan para revisar. Severidad por el área que invade: baja < 0,3 m², media de 0,3 a 2 m², alta > 2 m²; crítica si queda a menos de 30 m de una estación.',
           'features': feats}, open(os.path.join(OUT, 'geometry-conflicts.geojson'), 'w', encoding='utf-8'), ensure_ascii=False)
log('conflictos marcados:', len(feats), dict(cuenta_sev))


# ---------------- salida: huellas.parquet, biomas.json, trozos.json e informe.json ----------------
v = np.flatnonzero(vivo); orden = v[np.lexsort((ANC[v, 0], TY[v] * 100000 + TX[v]))]
def col(a): return [None if (isinstance(x, float) and math.isnan(x)) else x for x in a]
hgt = np.array([x if x is not None else np.nan for x in HT['height']], float)[IX][ORIG]; nfl = np.array([x if x is not None else np.nan for x in HT['num_floors']], float)[IX][ORIG]
tabla = pa.table({
    'id': pa.array([HT['id'][IX[ORIG[i]]] for i in orden]),
    'parte': pa.array([0 if i < N else 1 for i in orden], pa.uint8()),
    'src': pa.array([SRC[ORIG[i]] for i in orden]),
    'subtype': pa.array([HT['subtype'][IX[ORIG[i]]] for i in orden]), 'class': pa.array([HT['class'][IX[ORIG[i]]] for i in orden]),
    'height': pa.array(col(hgt[orden]), pa.float32()), 'num_floors': pa.array(col(nfl[orden]), pa.float32()),
    'wkb': pa.array(shapely.to_wkb(GL[orden]), pa.binary()),
    'forma': pa.array(FORMA[orden], pa.uint8()),
    'rx': pa.array(RECT[orden, 0], pa.float64()), 'ry': pa.array(RECT[orden, 1], pa.float64()), 'rl': pa.array(RECT[orden, 2], pa.float64()), 'rw': pa.array(RECT[orden, 3], pa.float64()), 'ra': pa.array(RECT[orden, 4], pa.float64()),
    'obb_libre': pa.array(OBB_LIBRE[orden]), 'recortado': pa.array(RECORT[orden]), 'marcado': pa.array(MARCA[orden] > 0),
    'area0': pa.array(A0[ORIG[orden]], pa.float32()), 'area': pa.array(AL[orden], pa.float32()),
    'ax': pa.array(ANC[orden, 0], pa.float64()), 'ay': pa.array(ANC[orden, 1], pa.float64()),
    'zmin': pa.array(ZMIN[orden], pa.float32()), 'zmax': pa.array(ZMAX[orden], pa.float32()), 'zbase': pa.array(ZBASE[orden], pa.float32()),
    'bioma': pa.array(BIOMA[orden], pa.uint8()), 'cx': pa.array(TX[orden], pa.int32()), 'cy': pa.array(TY[orden], pa.int32()),
})
pq.write_table(tabla, os.path.join(OUT, 'huellas.parquet'), compression='zstd')
# la máscara de agua a cielo abierto (los exportadores y las pruebas de geometría la usan)
pq.write_table(pa.table({'wkb': pa.array(shapely.to_wkb(PZ[ES_AGUA]), pa.binary())}), os.path.join(OUT, 'agua.parquet'), compression='zstd')
# y en JSON para las pruebas en Node (pruebas/geometria.mjs): anillos en decímetros, por trozo de agua
json.dump({'unidad': 'cm', 'nota': 'agua a cielo abierto (M_agua) de geo/sanear.py: por trozo, sus anillos (el primero es el exterior)',
           'trozos': [[np.round(np.asarray(r.coords) * 100).astype(int).ravel().tolist() for r in [p.exterior, *p.interiors]] for p in PZ[ES_AGUA] if p.geom_type == 'Polygon']},
          open(os.path.join(OUT, 'agua.json'), 'w'), separators=(',', ':'))
import base64
json.dump({'trozo_m': TROZO, 'nx': NX, 'ny': NY, 'biomas': BIOMAS, 'por_trozo': dict(cuenta_b),
           'datos': base64.b64encode(zlib.compress(BIO.tobytes(), 9)).decode(), 'nota': 'uint8 por trozo de 160 m (fila = cy, columna = cx), zlib + base64; el número es el índice en «biomas»'},
          open(os.path.join(OUT, 'biomas.json'), 'w', encoding='utf-8'), ensure_ascii=False)
tk = TY[orden] * 100000 + TX[orden]; u, ini, cnt = np.unique(tk, return_index=True, return_counts=True)
json.dump({'trozo_m': TROZO, 'clave': 'cx,cy con c = floor(x / 160)', 'trozos': {f'{int(k % 100000)},{int(k // 100000)}': [int(a), int(c)] for k, a, c in zip(u, ini, cnt)}},
          open(os.path.join(OUT, 'trozos.json'), 'w', encoding='utf-8'))
quedan = vivo.sum(); a_fin = AL[vivo].sum()
inf = {'version': '1.3.0', 'regla': REGLA, 'fecha': time.strftime('%Y-%m-%d'),
       'huellas_overture': len(HT['id']), 'casas_en_el_mapa': int(N), 'area_construida_m2': round(float(A0.sum())),
       'casas_que_tocan': int(len(grupos)), 'recortadas': int(RECORT[:N].sum()), 'partes_extra': len(EXTRA_PARTES),
       'desaparecen': {'total': int((QUITA > 0).sum()), 'restos_de_menos_de_16_m2': int((QUITA == 1).sum()), 'enteras_en_la_calle_o_el_agua': int((QUITA == 2).sum())},
       'confiables_marcadas': len(feats), 'severidad': dict(cuenta_sev),
       'quedan': int(quedan), 'area_que_queda_m2': round(float(a_fin)), 'area_conservada': round(float(a_fin / A0.sum()), 5),
       'rectangulos_de_recortadas': int((FORMA == 1).sum()), 'rectangulos_minimos_libres': int(OBB_LIBRE.sum()),
       'corredores': {'trozos_de_via': int(nV), 'transporte': int(nAg0 - nV), 'agua': int(ES_AGUA.sum())}, 'tramos_en_otro_nivel': len(NIV),
       'por_fuente': dict(collections.Counter(SRC)), 'recortadas_por_fuente': dict(collections.Counter(SRC[RECORT[:N]])),
       'biomas': dict(cuenta_b), 'zocalo': {'desnivel_p50_m': round(float(np.nanmedian(ZMAX - ZMIN)), 2), 'desnivel_p90_m': round(float(np.nanpercentile(ZMAX - ZMIN, 90)), 2)},
       'segundos': round(time.time() - T0, 1)}
json.dump(inf, open(os.path.join(OUT, 'informe.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
log('listo:', int(quedan), 'casas ·', f"{inf['area_conservada'] * 100:.2f} %", 'del área construida ·', OUT)
