#!/usr/bin/env python3
"""Motor City R3/R4: unión geométrica conservadora de edificios, sin editar MC4.

Entrada: dos FeatureCollection GeoJSON en la MISMA referencia espacial métrica;
          la referencia se declara como 'MC4-LOCAL-METROS'.
Uso: python3 geo/cruzar_huellas_seguros.py --base base.json --fuente fuente.json --reporte reportes/cruce.json
Los datos de la fuente no se exportan sin autorización legal explícita.
"""
import argparse
import collections
import json
import math
import re
from pathlib import Path
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.strtree import STRtree

CRS = 'MC4-LOCAL-METROS'
FORMAS = {'flat','gabled','hipped','half-hipped','pyramidal','round','dome','skillion','mansard','cone','saltbox','gambrel','sawtooth'}
TIPOS_CATASTRO = {'N','E','BQ','TO','CA'}


def cargar(ruta):
    obj = json.loads(Path(ruta).read_text(encoding='utf8'))
    if obj.get('type') != 'FeatureCollection' or obj.get('crs') != CRS:
        raise ValueError('Se exige FeatureCollection con crs=MC4-LOCAL-METROS; reproyectar ANTES y verificar escala')
    features = obj.get('features')
    if not isinstance(features, list):
        raise ValueError('features no es una lista')
    salida = []
    ids = set()
    for i, f in enumerate(features):
        if f.get('type') != 'Feature' or not isinstance(f.get('properties'), dict):
            raise ValueError('Feature inválido en índice %s' % i)
        ident = f.get('id')
        if not isinstance(ident, (str,int)) or not str(ident).strip() or ident in ids:
            raise ValueError('Falta id estable o hay duplicados en Feature %s' % i)
        ids.add(ident)
        g = shape(f.get('geometry'))
        if not isinstance(g, (Polygon, MultiPolygon)) or not g.is_valid or g.area < 4 or any(not math.isfinite(x) for x in g.bounds):
            raise ValueError('Geometría de edificio inválida en id %s' % ident)
        salida.append((ident,g,f['properties']))
    return salida


def limpiar(prop):
    """Conserva solo campos arquitectónicos, nunca identificadores catastrales."""
    val = {}
    pisos = prop.get('numero_pisos',prop.get('num_floors'))
    tipo = prop.get('tipo_construccion')
    if tipo is not None and tipo not in TIPOS_CATASTRO:
        return {}  # descartar piscinas, tanques, transitorios, otras clases no aprobadas
    try:
        if pisos is not None and math.isfinite(float(pisos)) and 1 <= float(pisos) <= 120 and float(pisos).is_integer():
            val['pisos'] = int(pisos)
    except (TypeError,ValueError):
        pass
    if isinstance(prop.get('roof_shape'), str) and prop['roof_shape'].strip().lower() in FORMAS:
        val['techo_forma'] = prop['roof_shape'].strip().lower()
    for campo,out in [('roof_color','techo_color'),('roof:colour','techo_color'),('building:colour','fachada_color'),('facade_color','fachada_color')]:
        s=prop.get(campo)
        if isinstance(s,str) and re.fullmatch(r'#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?',s):
            val[out]=s.lower()
    levels=prop.get('roof:levels')
    try:
        if levels is not None and math.isfinite(float(levels)) and 0 <= float(levels) <= 12:
            val['techo_pisos'] = float(levels)
    except (ValueError,TypeError):
        pass
    return val


def cruzar(base,fuente, umbral_iou=.78, cobertura=.82, margen=.12):
    geom = [f[1] for f in fuente]
    tree=STRtree(geom) if geom else None
    candidatos=[]; causas=collections.Counter();por_comuna=collections.Counter()
    for bid,bg,bprop in base:
        comuna = str(bprop.get('comuna') or 'sin_comuna')
        por_comuna[comuna]+=1
        matches=[]
        if tree is not None:
            for index in tree.query(bg):
                j=int(index)
                sid,sg,sp=fuente[j]
                area=bg.intersection(sg).area
                if area<=0:continue
                iou=area/(bg.area+sg.area-area)
                cb=area/bg.area
                if iou>=umbral_iou and cb>=cobertura:
                    matches.append((iou,cb,j,sid,sp))
        matches.sort(reverse=True,key=lambda o:o[0])
        if not matches:
            causas['sin_coincidencia_segura']+=1;continue
        if len(matches)>1 and matches[0][0]-matches[1][0] < margen:
            causas['ambiguo_para_objetivo']+=1;continue
        iou,cb,j,sid,sp=matches[0]
        candidato={'id_base':str(bid),'id_fuente':str(sid),'indice_fuente':j,'iou':round(iou,4),
                   'cobertura':round(cb,4),'comuna':comuna,'atributos':limpiar(sp)}
        if not candidato['atributos']:
            causas['sin_atributos_utiles']+=1;continue
        candidatos.append(candidato)
    recuentos=collections.Counter(x['id_fuente'] for x in candidatos)
    aceptados=[x for x in candidatos if recuentos[x['id_fuente']]==1]
    causas['conflicto_varios_objetivos']=len(candidatos)-len(aceptados)
    ac=collections.Counter(x['comuna'] for x in aceptados)
    cobertura_comuna={k:{'objetivos':n,'coincidencias_seguras':ac[k],'porcentaje':round(100*ac[k]/n,2)} for k,n in sorted(por_comuna.items())}
    return {'base_total':len(base),'fuente_total':len(fuente),'coincidencias_seguras':len(aceptados),
            'cobertura_mundo_porcentaje':round(len(aceptados)*100/len(base),2) if base else 0,
            'rechazos':dict(sorted(causas.items())), 'cobertura_por_comuna':cobertura_comuna,
            'parejas':aceptados}


def auto_prueba():
    from shapely.geometry import box
    f=lambda ident,g,p: (ident,g,p)
    base=[f('a',box(0,0,10,10),{'comuna':'A'}),f('b',box(20,0,30,10),{'comuna':'B'}),
          f('c',box(40,0,50,10),{'comuna':'B'}),f('d',box(60,0,70,10),{'comuna':'C'})]
    fuente=[f('1',box(0,0,10,10),{'numero_pisos':3,'roof_shape':'gabled','roof_color':'#abcd12'}),
            f('2',box(20,0,30,10),{'numero_pisos':2,'tipo_construccion':'P','roof_shape':'flat'}),
            f('3',box(40,0,50,10),{'roof_shape':'flat'}),
            f('4',box(40,0,50,10),{'roof_shape':'gabled'}),
            f('5',box(61,1,71,11),{'numero_pisos':9})]
    m=cruzar(base,fuente)
    assert m['coincidencias_seguras']==1, m
    assert m['rechazos']['ambiguo_para_objetivo']==1
    assert m['parejas'][0]['atributos']['pisos']==3
    assert m['rechazos']['sin_atributos_utiles']==1
    assert m['cobertura_por_comuna']['B']['coincidencias_seguras']==0
    assert limpiar({'roof_color':'#bad','num_floors':2.5,'roof:levels':1.5})=={'techo_color':'#bad','techo_pisos':1.5}
    assert limpiar({'roof_color':'red','numero_pisos':-20,'roof_shape':'random'})=={}
    dobles=cruzar([f('x',box(0,0,10,10),{}),f('y',box(0,0,10,10),{})],
                   [f('z',box(0,0,10,10),{'num_floors':2})])
    assert dobles['coincidencias_seguras']==0 and dobles['rechazos']['conflicto_varios_objetivos']==2
    print('✓ R3/R4: 8 validaciones de intersección segura, ambigüedad, duplicados y atributos')


def main():
    a=argparse.ArgumentParser(description='MC4: cruce uno a uno de huellas reales sin asignaciones por proximidad')
    a.add_argument('--base')
    a.add_argument('--fuente')
    a.add_argument('--reporte')
    a.add_argument('--exportar',help='Archivo con los pares; requiere --licencia-verificada y --atribucion')
    a.add_argument('--licencia-verificada',action='store_true')
    a.add_argument('--atribucion')
    a.add_argument('--self-test',action='store_true')
    op=a.parse_args()
    if op.self_test:
        auto_prueba();return
    if not op.base or not op.fuente or not op.reporte:
        a.error('se requieren --base, --fuente, --reporte')
    if op.exportar and (not op.licencia_verificada or not op.atribucion):
        a.error('la exportación requiere licencia verificada y atribución explícita')
    m=cruzar(cargar(op.base),cargar(op.fuente))
    resumen={k:v for k,v in m.items() if k!='parejas'}
    resumen['estado']='diagnostico_sin_modificar_MC4'
    Path(op.reporte).parent.mkdir(parents=True,exist_ok=True)
    Path(op.reporte).write_text(json.dumps(resumen,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('✓ Diagnóstico seguro:',resumen['coincidencias_seguras'],'de',resumen['base_total'],'objetivos')
    if op.exportar:
        Path(op.exportar).parent.mkdir(parents=True,exist_ok=True)
        Path(op.exportar).write_text(json.dumps({'atribucion':op.atribucion,'parejas':m['parejas']},ensure_ascii=False,indent=2)+'\n',encoding='utf8')

if __name__=='__main__':
    main()
