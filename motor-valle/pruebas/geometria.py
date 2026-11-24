"""PRUEBA DE GEOMETRÍA EXACTA (Motor del Valle 1.3.0): la verdad compartida de geo/sanear.py, con polígonos (shapely), sin usar
   los trozos de corredor del saneamiento (los arma de nuevo, con 32 segmentos por cuarto de círculo):
     a) 0 solapes de capa 0: ningún edificio pisa (> 0,05 m²) el corredor de una vía de capa 0 (regla activa de geo/anchos.json),
        el carril del Metroplús ni la vía del tranvía. Las casas confiables marcadas no cuentan como fallo, pero cada una tiene que
        estar en geometry-conflicts.geojson (y se informan aparte);
     b) 0 casas en el agua a cielo abierto (> 0,05 m²);
     c) 0 restos: ninguna recortada de menos de 16 m² (salvo la casa chica apenas rozada: 12 m² o más y el 90 % de su área);
     d) se conserva la ciudad: el área construida que queda es el 97 % o más de la original.
   Uso: python3 motor-valle/pruebas/geometria.py   (lee salida/sanear/; sale con 1 si algo falla e imprime un JSON con las cifras)
"""
import json, math, os, sys, time, collections
import numpy as np
import shapely
import shapely.ops
from shapely import STRtree
import pyarrow.parquet as pq

AQUI = os.path.dirname(os.path.abspath(__file__)); MOTOR = os.path.dirname(AQUI); GEO = os.path.join(MOTOR, 'geo'); SAN = os.environ.get('OUT') or os.path.join(MOTOR, 'salida', 'sanear')
sys.path.insert(0, GEO)
CFG = json.load(open(os.path.join(GEO, 'anchos.json'), encoding='utf-8')); REGLA = os.environ.get('REGLA') or CFG['regla_activa']
LON0, LATN = -75.70, 6.46; KXM = 111320 * math.cos(math.radians((6.46 + 6.015) / 2)); KYM = 110574.0
def proy(xy): return np.column_stack([(xy[:, 0] - LON0) * KXM, (LATN - xy[:, 1]) * KYM])
T0 = time.time(); fallos = []; res = {'regla': REGLA}

# ---------- ejes y radios (regla A, B o C de anchos.json) ----------
from rasante import cargar_vias
from niveles import tramos_otro_nivel, intervalos, a_nivel
V = cargar_vias(os.path.join(SAN, 'vias_m.bin'))
L = [shapely.LineString(P) if len(P) > 1 else None for (_, _, _, _, P) in V]
IV = intervalos(L, tramos_otro_nivel(proy))
RA = CFG['reglas']['A']
def radio(k, w): return max(RA['radio_minimo_m'], w / 2 + RA['anden_m'][str(k)]) if REGLA == 'A' else None
if REGLA != 'A': raise SystemExit('esta prueba mide la regla A (la activa por decisión del autor); para B o C hay que extenderla')
ejes, rad, tipo = [], [], []
for j, (k, _, _, w2, P) in enumerate(V):
    if not 1 <= k <= 7 or L[j] is None: continue
    for g in a_nivel(L[j], IV.get(j)): ejes.append(g); rad.append(radio(k, w2 / 2)); tipo.append(k)
mp = None
for f in ('metroplus.json', 'metroplus.js'):
    p = os.path.join(MOTOR, '..', 'src', 'data', f)
    if os.path.exists(p):
        s = open(p, encoding='utf-8').read()
        mp = {k: np.array(c).reshape(-1, 2) for k, c in json.loads(s)['corredores'].items()} if f.endswith('.json') else {k: np.array(c['p']).reshape(-1, 2) for k, c in json.loads(s[s.index('{'):s.rindex('}') + 1]).items() if isinstance(c, dict) and 'p' in c}
        break
for P in (mp or {}).values(): ejes.append(shapely.LineString(P)); rad.append(CFG['transporte_a_nivel_m']['brt']); tipo.append(20)
import duckdb
for (w,) in duckdb.connect().execute(f"select wkt from '{os.path.join(GEO, 'cache', 'rail.parquet')}' where class='tram'").fetchall():
    g = shapely.from_wkt(w)
    for q in getattr(g, 'geoms', [g]): ejes.append(shapely.LineString(proy(np.asarray(q.coords)))); rad.append(CFG['transporte_a_nivel_m']['tram']); tipo.append(21)
ejes = np.array(ejes, dtype=object); rad = np.array(rad); tipo = np.array(tipo); TE = STRtree(ejes)
res['corredor'] = {'ejes': len(ejes), 'tramos_en_otro_nivel': len(IV), 'metroplus': bool(mp)}

# ---------- huellas saneadas ----------
H = pq.read_table(os.path.join(SAN, 'huellas.parquet')).to_pydict()
G = np.array(shapely.from_wkb(H['wkb']), dtype=object); A = shapely.area(G); marc = np.array(H['marcado']); rec = np.array(H['recortado']); a0 = np.array(H['area0'], float)
ids = np.array(H['id']); N = len(G); res['huellas'] = N
# a) solapes con los corredores: distancia exacta (dwithin) y, si se acercan, el área dentro del búfer fino
bi, ej = TE.query(G, predicate='dwithin', distance=float(rad.max()))
d = shapely.distance(G[bi], ejes[ej]); m = d < rad[ej] - 1e-9; bi, ej = bi[m], ej[m]
inv = shapely.area(shapely.intersection(G[bi], shapely.buffer(ejes[ej], rad[ej], quad_segs=32)))
ok = inv > .05; bi, ej, inv = bi[ok], ej[ok], inv[ok]
pisa = np.zeros(N, bool); pisa[bi] = True
conf = set()
with open(os.path.join(SAN, 'geometry-conflicts.geojson'), encoding='utf-8') as f: conf = {ft['properties']['id'] for ft in json.load(f)['features']}
sin_marca = pisa & ~marc; marcadas_sin_archivo = int(sum(1 for i in np.flatnonzero(pisa & marc) if ids[i] not in conf))
res['a_solapes'] = {'sin_marca': int(sin_marca.sum()), 'casas_confiables_marcadas_que_pisan': int((pisa & marc).sum()), 'marcadas_que_no_estan_en_el_geojson': marcadas_sin_archivo,
                    'por_tipo_sin_marca': dict(collections.Counter(int(tipo[e]) for b_, e in zip(bi, ej) if not marc[b_]))}
if sin_marca.any(): fallos.append(f'{int(sin_marca.sum())} edificios pisan un corredor de capa 0 sin estar marcados')
if marcadas_sin_archivo: fallos.append(f'{marcadas_sin_archivo} casas marcadas que no están en geometry-conflicts.geojson')
# b) agua
W = np.array(shapely.from_wkb(pq.read_table(os.path.join(SAN, 'agua.parquet')).to_pydict()['wkb']), dtype=object); TW = STRtree(W)
wi, wj = TW.query(G, predicate='intersects'); wa = shapely.area(shapely.intersection(G[wi], W[wj])); enAgua = np.zeros(N); np.add.at(enAgua, wi, wa)
res['b_casas_en_el_agua'] = int((enAgua > .05).sum())
if res['b_casas_en_el_agua']: fallos.append(f"{res['b_casas_en_el_agua']} casas en el agua")
# c) restos
resto = rec & (A < 16) & ~((A >= 12) & (A >= .9 * a0))
res['c_restos_de_menos_de_16_m2'] = int(resto.sum())
if resto.any(): fallos.append(f'{int(resto.sum())} restos de menos de 16 m²')
# d) área conservada
inf = json.load(open(os.path.join(SAN, 'informe.json'), encoding='utf-8')); area_orig = inf['area_construida_m2']
res['d_area'] = {'original_m2': area_orig, 'queda_m2': round(float(A.sum())), 'conservada': round(float(A.sum()) / area_orig, 5), 'desaparecen': inf['desaparecen']}
if A.sum() / area_orig < .97: fallos.append(f"se conserva solo el {A.sum() / area_orig * 100:.2f} % del área construida")
res['segundos'] = round(time.time() - T0, 1); res['fallos'] = fallos; res['resultado'] = 'FALLA' if fallos else 'BIEN'
print(json.dumps(res, ensure_ascii=False, indent=1))
sys.exit(1 if fallos else 0)
