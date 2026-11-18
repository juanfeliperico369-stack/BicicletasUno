"""Metroplús como en El Metro (v1.7.1): corredores de las Líneas 1 y 2 (relaciones de ruta de OpenStreetMap 5458501 y 5401999)
   y el centro del andén real de cada estación, tomados de El Metro (repo metrozero: src/data/metroplus.js y metroplus_andenes.js,
   generados allí por tools/metroplus_osm.py y tools/metroplus_andenes.py). © colaboradores de OpenStreetMap (ODbL).
   Las coordenadas vienen en metros del mapa del valle de El Metro (mismo lon0/latN): en Juega EnCicla, px = m × 1,6 (casillas de 10 m y 16 px).
   Uso: python3 tools/geo/metroplus_elmetro.py RUTA_A_METROZERO   ->  src/data/metroplus.json
"""
import json, os, sys
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..', '..', 'juanfeliperico369-stack', 'metrozero')
def js_obj(path):
    s = open(path, encoding='utf-8').read(); return json.loads(s[s.index('{'):s.rindex('}') + 1])
C = js_obj(os.path.join(src, 'src', 'data', 'metroplus.js'))
A = js_obj(os.path.join(src, 'src', 'data', 'metroplus_andenes.js'))
out = {'fuente': 'El Metro (metrozero): corredores de Metroplús de OpenStreetMap (relaciones 5458501 y 5401999) y andenes reales; © colaboradores de OpenStreetMap (ODbL). Metros del mapa del valle (px = m × 1,6).',
       'corredores': {k: [round(v, 1) for v in C[k]['p']] for k in ('MP1', 'MP2') if k in C},
       'andenes': {k: {n: [round(p[0], 1), round(p[1], 1)] for n, p in v.items()} for k, v in A.items()}}
dst = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'metroplus.json')
json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('corredores', {k: len(v) // 2 for k, v in out['corredores'].items()}, 'andenes', {k: len(v) for k, v in out['andenes'].items()}, '->', os.path.getsize(dst) // 1024, 'KB')
