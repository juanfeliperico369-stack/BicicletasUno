#!/usr/bin/env python3
"""Motor City R3: cobertura preliminar de pisos desde el catastro público municipal.

No lee geometrías, no descarga predios, no genera MC4. Solo solicita recuentos
agrupados a un servicio ArcGIS oficial, sin credenciales, y los documenta.
La disponibilidad pública de la capa NO sustituye validar términos de reutilización.

Uso: python3 geo/auditar_pisos_catastro.py --self-test
     python3 geo/auditar_pisos_catastro.py --consultar --salida reportes/r3-cobertura-catastro.json
"""
import argparse
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

URL = 'https://www.medellin.gov.co/servidormapas/rest/services/vivienda_ciudad_terri/VC_Catastro_VCT/MapServer/8'
CLASES = ('N', 'E', 'BQ', 'TO', 'CA')


def pedir_recuento(dominio, donde, timeout=18):
    endpoint = dominio.rstrip('/') + '/query?' + urlencode({
        'where': donde, 'returnCountOnly': 'true', 'f': 'json'
    })
    req = Request(endpoint, headers={'Accept': 'application/json', 'User-Agent': 'MotorCity-R3-lectura-cobertura/1.0'})
    with urlopen(req, timeout=timeout) as respuesta:
        dato = json.load(respuesta)
    if 'error' in dato:
        raise ValueError('ArcGIS devolvió error: ' + str(dato['error']))
    if not isinstance(dato.get('count'), int) or dato['count'] < 0:
        raise ValueError('Recuento ArcGIS inválido: ' + str(dato)[:350])
    return dato['count']


def calcular_cobertura(recuento):
    consultas = {
        'total': '1=1',
        'pisos_validos': 'numero_pisos IS NOT NULL AND numero_pisos > 0 AND numero_pisos <= 120',
        'construcciones_clase': "tipo_construccion IN ('N','E','BQ','TO','CA')",
        'clase_con_pisos': "tipo_construccion IN ('N','E','BQ','TO','CA') AND numero_pisos IS NOT NULL AND numero_pisos > 0 AND numero_pisos <= 120",
    }
    resultados = {k: recuento(q) for k, q in consultas.items()}
    total, validos = resultados['total'], resultados['pisos_validos']
    por_clase, ambas = resultados['construcciones_clase'], resultados['clase_con_pisos']
    if not (0 <= validos <= total and 0 <= por_clase <= total and 0 <= ambas <= min(validos, por_clase)):
        raise ValueError('Respuesta inconsistente: recuentos inválidos de ArcGIS')
    porcentaje = lambda v, n: round(v * 100 / n, 2) if n else 0.0
    return {
        'fuente': URL,
        'publicador': 'Subsecretaría de Catastro, Alcaldía de Medellín',
        'capa': 'VC_Catastro_VCT / Construccion (MapServer/8)',
        'campo_pisos': 'numero_pisos',
        'clases_revisadas': list(CLASES),
        'recuentos': resultados,
        'porcentaje_pisos_validos': porcentaje(validos, total),
        'porcentaje_pisos_en_clases': porcentaje(ambas, por_clase),
        'srid_de_la_capa': 9377,
        'estado': 'solo_recuento_no_integrado_a_MC4',
        'advertencias': [
          'Este porcentaje es de objetos de la capa municipal, NO porcentaje de huellas ED1 cubiertas.',
          'Se requiere unión geométrica y cobertura por comuna antes de cambiar pisos en Motor City.',
          'Verificar licencia, vigencia y autorización de reutilización; visibilidad REST no equivale a licencia abierta.',
          'Un mismo lote puede tener más de una construcción; no cruzar por centroide sin ambigüedad.',
        ],
    }


def auto_prueba():
    tabla = {'1=1': 100, 'numero_pisos IS NOT NULL AND numero_pisos > 0 AND numero_pisos <= 120': 70,
      "tipo_construccion IN ('N','E','BQ','TO','CA')": 80,
      "tipo_construccion IN ('N','E','BQ','TO','CA') AND numero_pisos IS NOT NULL AND numero_pisos > 0 AND numero_pisos <= 120": 65}
    out = calcular_cobertura(lambda q: tabla[q])
    assert out['recuentos']['total'] == 100
    assert out['porcentaje_pisos_validos'] == 70.0
    assert out['porcentaje_pisos_en_clases'] == 81.25
    assert out['srid_de_la_capa'] == 9377
    assert 'NO porcentaje de huellas ED1' in out['advertencias'][0]
    assert len(out['clases_revisadas']) == 5
    try:
        calcular_cobertura(lambda q: 101 if q == '1=1' else 102)
    except ValueError:
        pass
    else:
        raise AssertionError('Recuento inconsistente aceptado')
    print('✓ R3: 7 verificaciones sintéticas de filtros, porcentajes y recuentos incoherentes')


def main():
    p = argparse.ArgumentParser(description='R3 · audita recuentos de pisos de una capa oficial sin descargar predios')
    p.add_argument('--self-test', action='store_true')
    p.add_argument('--consultar', action='store_true', help='Habilita exactamente 4 solicitudes de recuento al servicio REST oficial')
    p.add_argument('--salida', help='Archivo JSON opcional, fuera del MC4')
    a = p.parse_args()
    if a.self_test:
        auto_prueba()
        return
    if not a.consultar:
        p.error('Usa --self-test o --consultar; no hay solicitudes de red por defecto')
    out = calcular_cobertura(lambda q: pedir_recuento(URL, q))
    s = json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + '\n'
    if a.salida:
        path = Path(a.salida)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(s, encoding='utf8')
        print('✓ Informe R3 escrito en', path)
    else:
        print(s, end='')


if __name__ == '__main__':
    main()
