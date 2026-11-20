# Manhattan · Contrato de datos y fases GIS

**Objetivo**: extraer una región real, no un mapa inspirado de ficción, con cifras de rendimiento medidas y licencias adecuadas.

## Realidad del repositorio a 20 de noviembre de 2026
- `geo/territorio.py` genera MC4 mediante Overture y relieve Terrain Tiles (SRTM/otros). Acepta `--id`, `--nombre`, `--bbox` y `--casilla`. Requiere Python con duckdb, shapely, numpy y pillow.
- `contenido/nueva-york-lugares.json` tiene 50 POIs reales de CommonPlace. No son vías, edificios ni zonas habilitadas.
- **Aún no** existe `datos/nueva_york/mundo.mc4` construido y probado para la vertical. No declarar que Manhattan es jugable hasta producirlo.

## Fuentes preferentes
1. [NYC DCP LION](https://www.nyc.gov/content/planning/pages/resources/datasets/lion) / [NYC Centerline](https://data.cityofnewyork.us/City-Government/NYC-Street-Centerline-CSCL-/inkn-q76z), para direcciones, segmentos, rampas y vías elevadas. El bbox no basta: usar delimitación geográfica.
2. [NYC Building Footprints](https://data.cityofnewyork.us/City-Government/BUILDING/5zhs-2jue), para huellas y `height_roof`, normalizado a metros.
3. [NYC CommonPlace](https://data.cityofnewyork.us/City-Government/CommonPlace/t95h-5fsr), para POIs y reconocibilidad, sin asignar accesos públicos por defecto.
4. Overture Maps para otras capas y como respaldo, registrando fecha/release, procedencia y atribución; Terrain Tiles para relieve costero.
5. [Condiciones de NYC Open Data](https://data.cityofnewyork.us/stories/s/Terms-of-Use/k9k7-3cje) y [licencia OSM](https://www.openstreetmap.org/copyright).

## Recorte de demostración
Propuesta inicial, **no perímetro validado**: `-74.015,40.707,-73.987,40.730` (Lower Manhattan/Chinatown/LES, con franjas de agua y barrios vecinos). Usar el bbox sólo como filtro técnico, luego recortar polígonos de tierra, orillas y circulación. No inventar puentes conectados si los segmentos tienen distinta elevación.

Comando exploratorio (hace descargas pesadas, **no ejecutado por esta entrega**):

```bash
python3 -m pip install duckdb shapely numpy pillow
python3 geo/territorio.py --id nueva_york_piloto \
 --nombre "Noche de Cobro / Bajo Manhattan" \
 --bbox=-74.015,40.707,-73.987,40.730 --casilla 5
```

Antes de integrarlo: medir duración, ancho/alto, cantidad de segmentos y edificios, RAM pico, archivo MC4, % de vías conectadas y colisiones con ríos. Si el peso excede objetivo, recortar geografía o usar datos por sector.

## Contrato territorial propuesto
```json
{"schema_version":1,"city_id":"nueva_york","crs_input":"EPSG:4326",
 "unidad_motor":"m","bbox_lon_lat":[-74.015,40.707,-73.987,40.730],
 "sector_lado_m":512,"origen":"NYC/OpenStreetMap/Overture",
 "build":{"release":"identificador real de la fuente","sha256":"hash real"},
 "capas":["suelo","relieve","viales","edificios","agua","poi","conectividad"]}
```
El contrato es **propuesta, no formato MC4 ya añadido**. El motor existente usa otro contenedor; la próxima IA deberá adaptar la serialización sin romper clientes.

## Cortes de calidad
- Entradas: ningún segmento sin clase/nombre válidos rompe el generador; nodos finitos; altura en metros y nunca mezclada con pies.
- Conectividad: no cruzar FDR / calles locales sin intersección real, ni meterse en vías elevadas a nivel calle.
- Datos: cada asset/POI y distrito tiene `source`, `retrieved_at` y clasificación de acceso; no usar memoriales sensibles para misiones destructivas.
- Sectores: leer sólo alrededor del jugador; almacenar huellas/sucesos en `MC.GuardadoSectores` y comprobar retorno al sector.
- Offline: el juego no llama a servidores de NYC, OSM, tiendas ni mapas externos durante la partida.
- Pruebas: snapshot de tamaño/hash de sectores; nodos de frontera alineados; caminos A* con ida y vuelta donde corresponda; al menos un paso elevado real.
- Atribución visible en créditos/ajustes para OSM/Overture/NYC, sin sustituir comprobación legal de cada dataset.

**No confundir «señal GIS» con verdad total:** el Open Data municipal advierte de errores e incompletitud; la verificación cartográfica sigue siendo necesaria.
