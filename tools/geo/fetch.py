"""Descarga los datos abiertos del Valle de Aburrá para construir el mapa real del juego.
   - Calles, ciclorrutas, Metro, tranvía, ríos, quebradas, parques y municipios: Overture Maps (datos de OpenStreetMap, ODbL).
   - Relieve: Terrain Tiles de AWS Open Data (Mapzen, SRTM/NASA), formato terrarium, zoom 13.
   Uso: python3 tools/geo/fetch.py   (necesita: pip install duckdb)   ->  tools/geo/cache/
   La primera vez tarda ~1 minuto. Para que DuckDB lea el bucket público sin credenciales:
   env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY python3 tools/geo/fetch.py
"""
import duckdb, math, os, sys, time, urllib.request
OUT = os.path.join(os.path.dirname(__file__), 'cache'); os.makedirs(OUT, exist_ok=True); os.makedirs(os.path.join(OUT, 'dem'), exist_ok=True)
REL = 's3://overturemaps-us-west-2/release/2026-10-21.0'
BB = (-75.72, -75.28, 6.0, 6.50)   # lon0, lon1, lat0, lat1
c = duckdb.connect(); c.execute("INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial; SET s3_region='us-west-2'; CREATE SECRET anon (TYPE s3, KEY_ID '', SECRET '', REGION 'us-west-2'); SET http_timeout=120000;")
inside = f"bbox.xmax > {BB[0]} AND bbox.xmin < {BB[1]} AND bbox.ymax > {BB[2]} AND bbox.ymin < {BB[3]}"
def q(name, sql):
    f = os.path.join(OUT, name + '.parquet')
    if os.path.exists(f): print('ya está', name); return
    t = time.time(); c.execute(f"COPY ({sql}) TO '{f}' (FORMAT PARQUET)")
    print(name, c.execute(f"select count(*) from '{f}'").fetchone()[0], round(time.time() - t), 's'); sys.stdout.flush()
seg = f"read_parquet('{REL}/theme=transportation/type=segment/*', hive_partitioning=1)"
q('roads', f"SELECT id, class, subclass, names.primary AS name, ST_AsText(geometry) wkt FROM {seg} WHERE subtype='road' AND {inside}")
q('rail', f"SELECT id, class, subclass, names.primary AS name, ST_AsText(geometry) wkt FROM {seg} WHERE subtype='rail' AND {inside}")
q('water', f"SELECT id, subtype, class, names.primary AS name, ST_AsText(geometry) wkt FROM read_parquet('{REL}/theme=base/type=water/*', hive_partitioning=1) WHERE {inside}")
q('landuse', f"SELECT id, subtype, class, names.primary AS name, ST_AsText(geometry) wkt FROM read_parquet('{REL}/theme=base/type=land_use/*', hive_partitioning=1) WHERE {inside}")
q('div', f"SELECT id, subtype, class, names.primary AS name, ST_AsText(geometry) wkt FROM read_parquet('{REL}/theme=divisions/type=division_area/*', hive_partitioning=1) WHERE {inside} AND country='CO'")
# relieve
Z = 13
tx = lambda lon: int((lon + 180) / 360 * 2 ** Z)
ty = lambda lat: int((1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * 2 ** Z)
n = 0
for x in range(tx(BB[0]), tx(BB[1]) + 1):
    for y in range(ty(BB[3]), ty(BB[2]) + 1):
        f = os.path.join(OUT, 'dem', f'{Z}_{x}_{y}.png')
        if not os.path.exists(f): urllib.request.urlretrieve(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png', f); n += 1
print('relieve: tiles nuevos', n)
