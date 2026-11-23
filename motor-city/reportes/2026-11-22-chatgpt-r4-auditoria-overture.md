# ChatGPT — Motor City 4.9 · Continuación de Codex: R4/R3
**22 de noviembre de 2026 · rama `ia/chatgpt/r4-auditoria-overture-20261122` · Autor: ChatGPT (OpenAI).**

## Estado verificado del relevo

- Codex completó R1 en la rama `ia/chatgpt/r1-fachadas-medellin`, [PR #15](https://github.com/juanfeliperico369-stack/motorcity/pull/15), pero **no está unido a main**.
- Ese PR tiene **GitHub Actions en verde** en la ejecución [45096171795](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/45096171795); la ejecución previa falló por una expectativa de memoria de sectores y quedó corregida.
- Codex documentó que R4 y R3 **no están implementados**: no hay una correspondencia verificada OSM↔huellas MC4 ni datos catastrales de pisos de todas las comunas.
- Este trabajo continúa **R4**, sin modificar `geo/territorio.py`, `herramientas/fusionar.mjs`, `datos/medellin/mundo.mc4`, ni los archivos de Codex o de Gemini.

## Hallazgo nuevo: existe una fuente parcial de techos ya en el proyecto

En `geo/fetch.py`, la consulta que genera `geo/cache/edificios.parquet` ya solicita los campos **`roof_shape`**, **`roof_color`**, **`roof_material`**, **`facade_color`**, **`facade_material`**, `height`, `num_floors` y geometría de Overture Maps. La extracción de `geo/territorio.py`, en cambio, solo selecciona `subtype`, `class`, `height`, `num_floors`, nombre y geometría.

**Esto NO significa que toda Medellín tenga techos etiquetados**, ni que esos campos sean equivalentes automáticamente a `roof:levels` o `building:colour` de OSM. Es necesario medir los valores no nulos y los atributos válidos antes de modificar la representación 3D.

La consulta actual de `geo/fetch.py` tampoco conserva el identificador `id` de edificio en `edificios.parquet`, y el MC4 de Medellín usa huellas ED1 provenientes de la fusión con El Metro. Por tanto **no hay aún un vínculo uno a uno seguro** entre las filas de Overture y las entidades ED1. Una coincidencia aproximada de centroides no es prueba suficiente.

## Entrega implementada

**`geo/auditar_cubiertas_overture.py`** es una herramienta de diagnóstico sin efectos sobre el juego:
- Lee de forma local y por lotes la caché `geo/cache/edificios.parquet` existente si se proporciona; no genera peticiones de red.
- Informa presencia y porcentaje de campos de forma/color/material del techo y fachada, altura y pisos.
- Informa distribuciones de `roof_shape`, campos ausentes y si la fuente contiene ID de origen.
- Acepta versiones de caché con columnas opcionales ausentes sin inventar valores.
- Produce JSON reproducible, opcionalmente en `reportes/`, y preserva las fuentes y guardados.

**Comandos:**
```bash
python3 geo/auditar_cubiertas_overture.py --self-test
python3 geo/auditar_cubiertas_overture.py --parquet geo/cache/edificios.parquet --salida reportes/r4-cobertura-actual.json
```

La autoprueba sintética validó 8 condiciones (totales, porcentajes, campos omitidos, nulos y categorías de techo). La segunda orden **solo debe ejecutarse donde exista la caché real**; no se ha ejecutado aquí porque falta DuckDB y no se dispone del Parquet.

## R3 — pisos oficiales: no inventar cobertura

La investigación de Codex para la fuente `3DConstruccciones` informó **42.365 objetos en tres comunas**: Popular 22.896, El Poblado 13.659 y Robledo 5.810. Esos recuentos proceden de su informe de R1, no de una consulta repetida en este turno. La capa `Lotes_Febrero_2026` no contiene el campo de pisos y hay capas parciales con discrepancia entre `numero_pis` y `n_pisos`. **No se debe convertir un dato inferido o contradictorio en una altura oficial**. El alcance de cobertura para las demás comunas permanece **sin determinar**.

## Reglas y siguiente paso

1. Ejecutar la auditoría R4 sobre el Parquet real; guardar el resultado JSON y el número total de edificios con campos de techo **no nulos**.
2. Preparar nueva extracción Overture que preserve `id` + geometría. Comprobar correspondencia por intersección geométrica y unicidad, y rechazar ambigüedad. No emparejar por cercanía sin umbral y evidencia.
3. Probar un lote pequeño, con **campos opcionales y respaldo a techo procedural**; no cambiar el formato ED1 sin una migración versionada y pruebas de carga antigua.
4. Validar la legalidad y atribuciones de cada campo; distinguir Overture (esquema) de etiquetas específicas OSM. R5 (relieve) es únicamente informe, **ninguna aplicación de un DEM** hasta decisión del autor.
5. Para R3, localizar **datos oficiales de pisos** de las demás comunas, establecer criterio para `numero_pis` vs `n_pisos` y calcular cobertura por comuna antes de regenerar el MC4.
6. Durante la integración de Codex, revisar una inconsistencia menor del R1: su manifiesto todavía dice `recursos_propuestos_no_conectados_al_motor`, pese a que el PR declara integración. También declara diferencia de costura 0, pero el informe R1 mide diferencias WebP de aproximadamente 1,8–2,62 niveles por canal. Se requiere una actualización honesta del manifiesto, sin alterar hashes de los archivos originales.

## Pruebas y límites

- **Hecho y probado localmente:** autoprueba sintética y compilación Python del analizador con Python 3.
- **No ejecutado en este entorno:** auditoría de cobertura del Parquet real, regeneración MC4, comandos de construcción y cuatro suites completas del motor (el entorno no dispone del repositorio descargado ni de DuckDB).
- **El código nuevo no participa en la construcción del videojuego**. Las pruebas generales deben confirmarse en GitHub Actions antes de fusionar.
- **No afirmar:** disponibilidad de techos oficiales para todas las comunas, precisión catastral, uso de relieve aprobado ni rendimiento real en un teléfono.

**Firma:** ChatGPT (OpenAI) · Relevo para Codex, Claude y Gemini Antigravity.
