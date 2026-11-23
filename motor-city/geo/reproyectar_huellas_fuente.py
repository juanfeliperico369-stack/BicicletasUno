#!/usr/bin/env python3
"""Prepara huellas Overture/GeoMedellín en coordenadas locales MC4 sin editar el mundo.

Dependencias SOLO para herramientas: shapely, pyproj. Nunca se cargan en el juego.
python3 geo/reproyectar_huellas_fuente.py --mundo datos/medellin/mundo.mc4 \
  --entrada fuente.geojson --crs-origen EPSG:9377 --salida /tmp/fuente_local.geojson
"""
import argparse
import json
import math
import struct
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import transform as shapely_transform
from pyproj import Transformer

AUTORIZADOS = {'numero_pisos','num_floors','roof_shape','roof_color','roof:colour',
               'roof:levels','building:colour','facade_color','roof_material','facade_material','tipo_construccion'}


def abrir_mc4(ruta):
    with open(ruta,'rb') as h:
        pre=h.read(8)
        if len(pre)!=8 or pre[:4]!=b'MC4\0':
            raise ValueError('No es cabecera MC4')
        tam=struct.unpack('<I',pre[4:])[0]
        if not 10<=tam<=4_000_000:
            raise ValueError('Longitud de metadatos MC4 incorrecta')
        meta=json.loads(h.read(tam).decode('utf8'))
    if meta.get('formato')!='MC4' or not all(isinstance(meta.get(k),(int,float)) for k in ('lon0','latN','kx','ky','tile','W','H')):
        raise ValueError('Falta sistema geográfico MC4')
    return meta


def convertir(obj,meta,crs):
    if obj.get('type')!='FeatureCollection' or not isinstance(obj.get('features'),list):
        raise ValueError('Se exige GeoJSON FeatureCollection')
    if crs not in ('EPSG:4326','EPSG:9377'):
        raise ValueError('Origen no admitido: declarar EPSG:4326 o EPSG:9377 explícitamente')
    proj=Transformer.from_crs(crs,'EPSG:4326',always_xy=True)
    lon0,latN,kx,ky=(meta[k] for k in ('lon0','latN','kx','ky'))
    def a_local(x,y,z=None):
        lon,lat=proj.transform(x,y)
        return ((lon-lon0)*kx,(latN-lat)*ky) if z is None else ((lon-lon0)*kx,(latN-lat)*ky,z)
    vistos=set();feat=[];desechados={'sin_id':0,'geometria_invalida':0,'fuera_mundo':0,'id_duplicado':0}
    for i,f in enumerate(obj['features']):
        if f.get('type')!='Feature' or not isinstance(f.get('properties'),dict):
            desechados['geometria_invalida']+=1;continue
        pr=f['properties'];ident=f.get('id',pr.get('objectid',pr.get('id_construccion')))
        if not isinstance(ident,(str,int)) or not str(ident).strip():
            desechados['sin_id']+=1;continue
        ident=str(ident)
        if ident in vistos:
            desechados['id_duplicado']+=1;continue
        vistos.add(ident)
        try:
            g=shape(f.get('geometry'))
            if not isinstance(g,(Polygon,MultiPolygon)) or not g.is_valid or g.area<=0:
                raise ValueError('No es polígono válido')
            local=shapely_transform(a_local,g)
            if not local.is_valid or local.area<4 or not all(math.isfinite(v) for v in local.bounds):
                raise ValueError('Geometría convertida inválida')
        except Exception:
            desechados['geometria_invalida']+=1;continue
        if local.bounds[2]<0 or local.bounds[0]>=meta['W']*meta['tile'] or local.bounds[3]<0 or local.bounds[1]>=meta['H']*meta['tile']:
            desechados['fuera_mundo']+=1;continue
        props={k:v for k,v in pr.items() if k in AUTORIZADOS}
        feat.append({'type':'Feature','id':ident,'geometry':mapping(local),'properties':props})
    out={'type':'FeatureCollection','crs':'MC4-LOCAL-METROS','features':feat}
    resumen={'crs_origen':crs,'crs_salida':'MC4-LOCAL-METROS','entrada':len(obj['features']),
             'aceptados':len(feat),'descartados':desechados,
             'nota':'No valida licencia ni correspondencia de edificios. No modifica MC4.'}
    return out,resumen


def auto_prueba():
    from shapely.geometry import box
    meta={'formato':'MC4','lon0':-75.7,'latN':6.5,'kx':110_000,'ky':110_000,'tile':10,'W':5000,'H':5000}
    geom=box(-75.69,6.49,-75.689,6.491)
    f={'type':'FeatureCollection','features':[{'type':'Feature','id':'A','geometry':mapping(geom),'properties':{'numero_pisos':3,'cbml':'no copiar'}}]}
    out,s=convertir(f,meta,'EPSG:4326')
    assert s['aceptados']==1
    assert out['crs']=='MC4-LOCAL-METROS'
    assert out['features'][0]['geometry']['coordinates'][0][0][0]>1000
    assert out['features'][0]['properties']=={'numero_pisos':3}
    assert s['entrada']==1 and s['descartados']['fuera_mundo']==0
    p=Transformer.from_crs('EPSG:4326','EPSG:9377',always_xy=True)
    g2=shapely_transform(p.transform,geom)
    f['features'][0]['geometry']=mapping(g2)
    o2,s2=convertir(f,meta,'EPSG:9377')
    assert abs(shape(out['features'][0]['geometry']).area-shape(o2['features'][0]['geometry']).area)<1e-2
    assert s2['aceptados']==1
    print('✓ Reproyección R3/R4: 7 pruebas, WGS84 y EPSG:9377 a MC4 local sin atributos sensibles')


def main():
    p=argparse.ArgumentParser(description='Prepara huellas oficiales/OSM para cruce geométrico conservador')
    p.add_argument('--mundo');p.add_argument('--entrada');p.add_argument('--crs-origen',choices=['EPSG:4326','EPSG:9377'])
    p.add_argument('--salida');p.add_argument('--self-test',action='store_true')
    a=p.parse_args()
    if a.self_test:
        auto_prueba();return
    if not (a.mundo and a.entrada and a.crs_origen and a.salida):
        p.error('se requieren --mundo, --entrada, --crs-origen y --salida')
    out,stats=convertir(json.loads(Path(a.entrada).read_text(encoding='utf8')),abrir_mc4(a.mundo),a.crs_origen)
    Path(a.salida).parent.mkdir(parents=True,exist_ok=True)
    Path(a.salida).write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
    print(json.dumps(stats,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
