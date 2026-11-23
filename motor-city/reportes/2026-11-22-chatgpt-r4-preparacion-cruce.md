# ChatGPT — Motor City R3/R4 · Cruce geométrico seguro y fuentes

Firma: ChatGPT (OpenAI). Fecha: 22 noviembre 2026, hora Colombia.

## Implementación comprobable

- geo/auditar_cubiertas_overture.py: mide columnas y porcentajes no nulos en el Parquet local de Overture. Solo lee caché; no altera el mundo.
- geo/reproyectar_huellas_fuente.py: convierte FeatureCollection de WGS84 EPSG:4326 y EPSG:9377 a coordenadas del MC4, lee cabecera del mundo, comprueba escala, geometrias y límites, elimina atributos catastrales ajenos al dibujo. Dependencias Shapely y pyproj exclusivamente para datos, nunca en HTML.
- geo/cruzar_huellas_seguros.py: comparación polígono contra polígono usando STRtree de Shapely. Requiere IoU >= 0,78 y cobertura de la huella base >= 0,82. Rechaza candidatos casi empatados (separación de IoU < 0,12), duplicados muchos-a-uno, tipos de construcción excluidos, geometrías inválidas. Produce por defecto solo conteos y cobertura por comuna, no listas de predios.
- La rama paralela R6 añade extracción opcional de huellas existentes del MC4 mediante la opción --exportar-huellas; la columna pisos_estimados nunca se interpreta como altura catastral oficial.

## Comandos para la próxima integración autorizada

    node herramientas/precocinar-sectores.mjs --entrada datos/medellin/mundo.mc4 --exportar-huellas /tmp/ed1.json
    python3 geo/reproyectar_huellas_fuente.py --mundo datos/medellin/mundo.mc4 --entrada /tmp/fuente-autorizada.geojson --crs-origen EPSG:9377 --salida /tmp/fuente-local.json
    python3 geo/cruzar_huellas_seguros.py --base /tmp/ed1.json --fuente /tmp/fuente-local.json --reporte reportes/r3-r4-cobertura-por-comuna.json

La fuente-autorizada.geojson no está incluida aquí; requiere previamente fuente real descargada con permiso de reutilización confirmado. La exportación detallada de emparejamientos requiere licencia verificada y atribución.

## Resultados reales de CI

- La ejecución https://github.com/juanfeliperico369-stack/motorcity/actions/runs/45099980386 finalizó correctamente.
- Ejecutó python -m py_compile para los tres módulos.
- Cobertura Overture: 8 verificaciones sintéticas aprobadas.
- Unión conservadora por intersección: 8 verificaciones sintéticas aprobadas.
- Reproyección WGS84/9377 a MC4: 7 verificaciones sintéticas aprobadas.
- Total 23 comprobaciones sintéticas. Una ejecución anterior falló por un salto de línea mal escapado en Python, corregido y vuelto a ejecutar con éxito.

## Riesgos y pendientes

- No se ha medido la cobertura real de pisos y techos en ninguna comuna. Ningún porcentaje de ejemplo es un resultado de Medellín.
- IoU 0,78, cobertura 0,82 y margen 0,12 son umbrales conservadores iniciales, no calibrados sobre ejemplos reales etiquetados. Hay que probar falsos positivos y negativos y resolver empates.
- El formato ED1 ya usado por Medellín proviene de datos distintos de las huellas Overture y los objetos catastrales; no emparejar por simple distancia al centro.
- El catálogo municipal expone numero_pisos pero falta confirmar licencia de reutilización, representatividad por comuna y clases con cambios semánticos.
- Se mantienen MC4, guardados, motores de otros juegos y el HTML offline sin cambios. La integración de atributos al render sigue pendiente.
- La batería general del repositorio puede fallar por una prueba heredada que exige máximo de 16 sectores residentes; Codex ya adaptó esa prueba en el PR #15. No se deben omitir pruebas ni maquillar fallos.
