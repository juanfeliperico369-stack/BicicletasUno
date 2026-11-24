"""Capas de las vías (Motor del Valle 1.3.0): qué tramos de cada eje van en otro nivel.
   De Overture (OpenStreetMap, ODbL): road_flags (is_bridge, is_tunnel) y level_rules, con su tramo «between».
   La capa es -1 (túnel, deprimido, paso inferior abierto), 0 (a nivel), 1 (puente, viaducto) o 2 (cables y lo aéreo).
   Lo usan geo/sanear.py (los puentes y los túneles no recortan lo que está en otro nivel) y geo/rasante.py (la cota va de
   estribo a estribo y los extremos son rampas).
"""
import json, math, os
import numpy as np
import shapely
import shapely.ops
from shapely import STRtree

HERE = os.path.dirname(os.path.abspath(__file__)); CACHE = os.path.join(HERE, 'cache')


def tramos_otro_nivel(proy):
    """[(tipo, nivel, LineString en metros)] de cache/puentes.parquet; proy: lon/lat -> metros (n x 2)"""
    import duckdb
    from pasos import tramos
    c = duckdb.connect(); out = []
    for _id, cl, sub, fl, lv, w in c.execute(f"select id, class, subclass, flags, niveles, wkt from '{os.path.join(CACHE, 'puentes.parquet')}'").fetchall():
        if not w or not w.upper().startswith('LINESTRING'): continue
        P = proy(np.array([[float(t) for t in p.split()[:2]] for p in w[w.index('(') + 1:w.rindex(')')].split(',')]))
        flags = [f for f in (json.loads(fl) if fl else []) if f.get('values')]; lvs = [l for l in (json.loads(lv) if lv else []) if l.get('value') is not None]
        for t in tramos(_id, [tuple(p) for p in P], flags, lvs):
            out.append((t['tipo'], int(t['nivel']), shapely.LineString(t['m'])))
        for l in lvs:   # nivel > 0 sin bandera de puente (OSM a veces marca un paso elevado solo con layer)
            v = int(l.get('value') or 0)
            if v <= 0 or any('is_bridge' in (f.get('values') or []) for f in flags): continue
            a, b = l.get('between') or [0, 1]; g = shapely.LineString(P)
            s = shapely.ops.substring(g, a * g.length, b * g.length)
            if s.geom_type == 'LineString' and s.length > 1: out.append(('elevado', v, s))
    return out


def intervalos(lineas, tramos, tol=.3):
    """{índice de línea: [(s0, s1, nivel)]}: dónde cae cada tramo en otro nivel sobre los ejes (coinciden punto a punto,
       porque los ejes de geo/build.py salen de los mismos segmentos de Overture)"""
    arbol = STRtree([g if g is not None else shapely.Point(-1e9, -1e9) for g in lineas]); out = {}
    for tipo, nv, g in tramos:
        if g.length < .5: continue
        p0, p1, pm = shapely.Point(g.coords[0]), shapely.Point(g.coords[-1]), g.interpolate(.5, normalized=True)
        for j in arbol.query(g.buffer(tol)):
            L = lineas[j]
            if L is None or L.distance(p0) > tol or L.distance(p1) > tol or L.distance(pm) > tol: continue
            a, b = sorted((L.project(p0), L.project(p1)))
            if b - a > .5: out.setdefault(int(j), []).append((a, b, nv))
    return out


def a_nivel(L, iv):
    """las partes de la línea L que van a nivel (capa 0), sin los intervalos iv"""
    iv = sorted((a, b) for a, b, _ in iv or [])
    if not iv: return [L]
    out, s = [], 0.0
    for a, b in iv:
        if a > s + .5: out.append(shapely.ops.substring(L, s, a))
        s = max(s, b)
    if L.length > s + .5: out.append(shapely.ops.substring(L, s, L.length))
    return [g for g in out if g.geom_type == 'LineString' and g.length > .1]
