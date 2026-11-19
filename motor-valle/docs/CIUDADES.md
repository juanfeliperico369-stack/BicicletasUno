# Cómo craquear otra ciudad con Motor City

El motor no sabe que es Medellín: lo sabe `ciudades/medellin.json` y lo trae `datos/medellin/mundo.mc4`. Para otra ciudad se repite la receta del plan (sección 8) con las herramientas del motor.

## 1. La ciudad en un archivo de reglas
Copia `ciudades/medellin.json` a `ciudades/<id>.json` y cambia:

| Campo | Qué es |
|---|---|
| `ventana` | Longitud y latitud de la esquina noroeste (`lon0`, `latN`) y de la sureste (`lon1`, `latS`), más `lat_ref` (latitud media). |
| `casilla_m` | El tamaño de la casilla: 10 m para una ciudad; 20–40 m para una región grande (un país para Motor City). |
| `zonas` | Las reglas de estilo que salen de **mirar la ciudad desde arriba**: muros, techos, plancha, tanques, teja, árboles, densidad y pisos por zona. |
| `zona_por_comuna` / `zona_por_municipio` | Qué zona tiene cada división oficial. |
| `transporte.servicio`, `pico` y `clases` | Horario y frecuencias del transporte. |
| `clima` | Lluvia por mes, horas de aguacero y temperatura. |
| `atribucion` | Las fuentes. Ponlas siempre. |

## 2. Las fuentes (abiertas, para todo el mundo)
- **Overture Maps** (OSM más huellas satelitales de Microsoft y Google) trae calles con clase y nombre, ciclorrutas, agua, parques, usos del suelo, lugares y edificios con pisos. Se lee con DuckDB, directo del S3 público.
- **SRTM**, vía AWS Terrain Tiles: el relieve.
- **Capas oficiales** de la ciudad (catastro, malla vial y barrios), si las hay.
- **Transporte:** GTFS u OSM (`route=subway|tram|bus|aerialway`).

```bash
pip install duckdb numpy shapely pillow
CIUDAD=ciudades/<id>.json python3 geo/fetch.py      # unos cientos de MB en geo/cache (no se suben)
CIUDAD=ciudades/<id>.json TILE=10 OUT=salida/<id> python3 geo/build.py   # casillas, relieve, divisiones y vías
```
> `geo/oficial.py`, `geo/sitios.py`, `geo/alturas.py` y `geo/metroplus_elmetro.py` tienen partes de Medellín: las capas oficiales, los nombres de los emblemáticos y los deprimidos a mano. Para otra ciudad, copia el script y cambia esas listas. Lo general (Overture y SRTM) sirve tal cual.

## 3. El mundo MC4
Hoy `herramientas/fusionar.mjs` junta los datos de los dos juegos del valle. Para otra ciudad hay dos caminos:
- **Hacer `fusionar-<id>.mjs`**, que lea las salidas de `geo/build.py` (`valle.json`, `valle.bin` y `vias.bin` en `salida/<id>`). Esa parte es la misma, porque `fusionar.mjs` ya la lee así. Las huellas de edificios salen de Overture: el formato ED1 se arma como en `MetroZero/tools/edificios_datos.py`.
- **(2.1) `geo/mundo.py`**, que escriba el MC4 directo desde las fuentes, sin pasar por los juegos. Está en la hoja de ruta.

## 4. Mirarla desde arriba (las reglas de estilo)
- Usa dron, satélite y fotos de los barrios y de los emblemáticos.
- Escribe sus reglas de estilo (materiales, techos, colores, densidad y vegetación por zona) en `zonas` y elige sus 20 a 30 emblemáticos.
- Si hay ortofotos o imágenes Sentinel‑2, saca de ahí el color de los techos y de la vegetación por zona, en vez de hacerlo a ojo.
- **Las imágenes solo son de referencia: nunca se copian al juego.**

## 5. Auditar y corregir
- Compara contra OSM: calles, estaciones, río, transporte, nombres y barrios. En EnCicla está `tools/auditoria-mapa.js`; en El Metro, `tools/auditoria-mapa.mjs` y `osm_comparar.py`.
- Corre `node pruebas/prueba.mjs` con la ciudad nueva y ajusta las pruebas que nombran lugares de Medellín.

## 6. Jugarla
`node herramientas/construir.mjs --ciudad <id>` arma `dist/mundo-<id>.js`. El banco de pruebas abre la ciudad que le pases; cambia `MC_CIUDAD_MEDELLIN` y `MC_MUNDO_MEDELLIN` en `sandbox/10-juego.js` o pásalas por parámetro.

**Para *Motor City* (el juego):** varias ciudades y pueblos en un mapa grande se arman como varios MC4 (uno por ciudad, a 10 m) más un MC4 regional (a 40 m) para las carreteras entre ellas. El cargador ya maneja varias instancias de `MC.Mundo`.
