#!/usr/bin/env python3
"""Motor City R4 · inspección de atributos de cubierta Overture (SIN modificar MC4).

Uso desde la raíz del repositorio:
    python3 geo/auditar_cubiertas_overture.py --parquet geo/cache/edificios.parquet
    python3 geo/auditar_cubiertas_overture.py --parquet geo/cache/edificios.parquet --salida reportes/r4-cubiertas.json
    python3 geo/auditar_cubiertas_overture.py --self-test

La fuente de entrada ya está prevista por geo/fetch.py. No presupone cobertura ni
fuerza emparejamientos por cercanía. Requiere duckdb SOLO para leer Parquet.
"""
import argparse
import json
import os
from pathlib import Path

CAMPOS = ('roof_shape', 'roof_color', 'roof_material', 'facade_color', 'facade_material', 'height', 'num_floors')


def porcentaje(n, total):
    return round(100.0 * n / total, 2) if total else 0.0


def sanitizar_valor(v):
    if v is None:
        return None
    s = str(v).strip()
    if not s or s.lower() in ('null', 'none', 'nan'):
        return None
    return s[:120]


def resumen_filas(filas, columnas):
    """Audita un iterable de tuplas o dicts sin depender de DuckDB (apto para pruebas)."""
    disponibles = set(columnas)
    conteos = {f: 0 for f in CAMPOS}
    tipos = {}
    total = 0
    for fila in filas:
        total += 1
        d = fila if isinstance(fila, dict) else dict(zip(columnas, fila))
        for f in CAMPOS:
            valor = sanitizar_valor(d.get(f)) if f in disponibles else None
            if valor is not None:
                conteos[f] += 1
                if f == 'roof_shape':
                    tipos[valor] = tipos.get(valor, 0) + 1
    return {
        'total': total,
        'campos_presentes': sorted(set(CAMPOS) & disponibles),
        'campos_ausentes': sorted(set(CAMPOS) - disponibles),
        'con_id_fuente': 'id' in disponibles,
        'atributos': {k: {'cantidad': v, 'porcentaje': porcentaje(v, total)} for k, v in conteos.items()},
        'formas_de_techo': dict(sorted(tipos.items(), key=lambda p: (-p[1], p[0]))[:30]),
        'advertencia': 'Cobertura de atributos en la fuente, NO cobertura de emparejamiento con ED1/MC4.'
    }


def auditar_parquet(ruta):
    try:
        import duckdb
    except ImportError as exc:
        raise SystemExit('Falta DuckDB. Instala las dependencias ya usadas por geo/fetch.py: pip install duckdb') from exc
    if not os.path.isfile(ruta):
        raise SystemExit('No existe la caché: ' + str(ruta) + '. Primero genera geo/cache/edificios.parquet con geo/fetch.py.')
    con = duckdb.connect(database=':memory:')
    try:
        campos = [r[0] for r in con.execute('DESCRIBE SELECT * FROM read_parquet(?)', [str(ruta)]).fetchall()]
        presentes = [k for k in CAMPOS if k in campos]
        # Limitar columnas evita cargar geometrías de cientos de miles de huellas.
        seleccion = ', '.join('"' + k + '"' for k in presentes) or 'NULL AS vacio'
        cursor = con.execute('SELECT ' + seleccion + ' FROM read_parquet(?)', [str(ruta)])
        def iterar():
            while True:
                lote = cursor.fetchmany(4096)
                if not lote:
                    break
                yield from lote
        salida = resumen_filas(iterar(), presentes + (['id'] if 'id' in campos else []))
        salida['entrada'] = str(ruta)
        salida['fuente'] = 'Overture Maps · archivo de caché existente de geo/fetch.py (sin consultas de red)'
        salida['estado'] = 'solo_auditoria_sin_modificaciones_de_mundo'
        salida['paso_siguiente'] = (
            'El archivo incluye id: comprobar enlace por identificador y geometría antes de aplicar atributos.'
            if 'id' in campos else
            'El archivo no incluye id: regenerar una extracción con id Overture y huella, y validar unión geométrica antes de aplicar atributos.'
        )
        return salida
    finally:
        con.close()


def auto_prueba():
    prueba = [
        {'roof_shape': 'gabled', 'roof_color': '#aabbcc', 'height': 6, 'num_floors': 2},
        {'roof_shape': 'flat', 'roof_color': ' ', 'height': None, 'num_floors': None},
        {'roof_shape': '', 'roof_color': None, 'height': 0, 'num_floors': 1},
        {'roof_shape': None, 'roof_color': 'red', 'height': None, 'num_floors': None},
    ]
    out = resumen_filas(prueba, ['roof_shape', 'roof_color', 'height', 'num_floors'])
    assert out['total'] == 4
    assert out['atributos']['roof_shape'] == {'cantidad': 2, 'porcentaje': 50.0}
    assert out['atributos']['roof_color'] == {'cantidad': 2, 'porcentaje': 50.0}
    assert out['atributos']['height']['cantidad'] == 2
    assert out['campos_ausentes'] == ['facade_color', 'facade_material', 'roof_material']
    assert out['formas_de_techo'] == {'flat': 1, 'gabled': 1}
    assert not out['con_id_fuente']
    assert porcentaje(0, 0) == 0.0
    print('✓ R4: 8 verificaciones sintéticas de cobertura, campos ausentes y nulos')


def main():
    p = argparse.ArgumentParser(description='Motor City · auditar cubiertas Overture sin alterar MC4')
    p.add_argument('--parquet', default='geo/cache/edificios.parquet', help='Caché Parquet existente')
    p.add_argument('--salida', help='Archivo JSON opcional; nunca modifica el MC4')
    p.add_argument('--self-test', action='store_true', help='Prueba independiente de DuckDB')
    a = p.parse_args()
    if a.self_test:
        auto_prueba()
        return
    out = auditar_parquet(a.parquet)
    s = json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + '\n'
    if a.salida:
        ruta = Path(a.salida)
        ruta.parent.mkdir(parents=True, exist_ok=True)
        ruta.write_text(s, encoding='utf-8')
        print('✓ Auditoría R4 guardada en', ruta)
    else:
        print(s, end='')


if __name__ == '__main__':
    main()
