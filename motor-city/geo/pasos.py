"""Capa candidata para motor-valle. Entrada Parquet de Overture descargada por geo/fetch.py."""
import bisect
import json
import math
from pathlib import Path


def tramos(segmento, puntos, reglas, niveles):
    """Puntos en metros desde el origen del motor. Devuelve polílineas en metros."""
    distancias = [0.0]
    for a, b in zip(puntos, puntos[1:]):
        distancias.append(distancias[-1] + math.dist(a, b))
    largo = distancias[-1]
    if not largo:
        return []

    def limites(regla):
        return regla.get("between") or [0, 1]

    def punto(distancia):
        i = min(len(puntos) - 2, max(0, bisect.bisect_right(distancias, distancia) - 1))
        fraccion = (distancia - distancias[i]) / (distancias[i + 1] - distancias[i] or 1)
        return [a + (b - a) * fraccion for a, b in zip(puntos[i], puntos[i + 1])]

    cortes = sorted({0, 1, *(v for r in reglas + niveles for v in limites(r) if 0 <= v <= 1)})
    salida = []
    for inicio, fin in zip(cortes, cortes[1:]):
        centro = (inicio + fin) / 2
        activos = [r for r in reglas if limites(r)[0] <= centro < limites(r)[1]]
        flags = {valor for r in activos for valor in r["values"]}
        nivel = next((int(r["value"]) for r in niveles
                      if limites(r)[0] <= centro < limites(r)[1]), None)
        if "is_tunnel" in flags:
            tipo, estimado = "tunel", -1
        elif "is_bridge" in flags:
            tipo, estimado = "puente", 1
        elif nivel is not None and nivel < 0:
            tipo, estimado = "inferior_abierto", nivel
        else:
            continue
        a, b = inicio * largo, fin * largo
        vertices = [punto(a), *[p for p, d in zip(puntos, distancias) if a < d < b], punto(b)]
        salida.append({"id": segmento, "entre": [inicio, fin], "tipo": tipo,
                       "nivel": estimado if nivel is None else nivel, "inferido": nivel is None,
                       "m": [[round(x, 2), round(y, 2)] for x, y in vertices]})
    return salida


def exportar(cache, meta):
    import duckdb
    cx = duckdb.connect()
    filas = cx.execute("select id, wkt, flags, niveles from read_parquet(?) order by id",
                       [str(cache)]).fetchall()
    salida = []
    for identificador, wkt, flags, niveles in filas:
        if not wkt.upper().startswith("LINESTRING"):
            continue
        coords = wkt[wkt.index("(") + 1:wkt.rindex(")")].split(",")
        puntos = []
        for coord in coords:
            lon, lat = map(float, coord.split()[:2])
            puntos.append([(lon - meta["lon0"]) * meta["kx"] * meta["tile"],
                            (meta["latN"] - lat) * meta["ky"] * meta["tile"]])
        salida.extend(tramos(identificador, puntos, json.loads(flags or "[]"), json.loads(niveles or "[]")))
    return {"unidad": "m", "fuente": "OpenStreetMap (ODbL) vía Overture Maps", "tramos": salida}


if __name__ == "__main__":
    import sys
    if sys.argv[1:] == ["--prueba"]:
        fila = tramos("muestra", [(0, 0), (10, 0), (20, 0)],
                      [{"between": [.25, .75], "values": ["is_tunnel"]}],
                      [{"between": [.5, 1], "value": -2}])
        assert [t["tipo"] for t in fila] == ["tunel", "tunel", "inferior_abierto"]
        assert [t["nivel"] for t in fila] == [-1, -2, -2]
        assert fila[0]["m"] == [[5, 0], [10, 0]] and fila[-1]["m"][-1] == [20, 0]
        print("OK: boca parcial, cambio de nivel y paso inferior abierto")
    else:
        cache, meta = map(Path, sys.argv[1:])
        print(json.dumps(exportar(cache, json.loads(meta.read_text())), ensure_ascii=False))
