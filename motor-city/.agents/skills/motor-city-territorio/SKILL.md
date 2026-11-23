---
name: motor-city-territorio
description: Craquear un territorio real (país, ciudad, pueblo o lugar) a un mundo MC4 de Motor City desde datos abiertos (Overture Maps/OSM y relieve SRTM), o generar un mundo inventado con MC.Generador; también las reglas de estilo de la ciudad (ciudades/<id>.json) y cómo auditar contra OSM. Úsala al crear o corregir mapas y mundos.
---
# Motor City · territorios y mundos

**Real (cualquier lugar del planeta):**
```bash
pip install duckdb shapely pillow numpy
python3 geo/territorio.py --id mi-lugar --nombre "Nombre" --bbox=lon0,latS,lon1,latN --casilla 5
```
- Se usa `--casilla 5` para pueblos y lugares, y 10 o 20 para ciudades y regiones.
- La salida es `datos/<id>/mundo.mc4`, más su resumen y `ciudades/<id>.json`, que trae las reglas por defecto: edítalas.
- **Grande (Medellín):** la tubería `geo/fetch.py` → `build.py` → `sitios.py` → `alturas.py` (con `CIUDAD=ciudades/x.json`), y luego `herramientas/fusionar.mjs`.
- **Reglas de estilo:** mira la ciudad desde arriba (dron, satélite y fotos) y escribe las zonas (muros, techos, plancha, tanques, teja, árboles, densidad y pisos). Las imágenes son solo referencia: **nunca se copian**.
- **Auditar:** compara calles, agua, transporte y nombres contra OSM. Corrige en el motor (la fuente de verdad), no en el juego.

**Inventado:**
- `MC.Generador.mundo({ semilla, ancho, alto, tile, tipo: 'isla'|'valle'|'costa'|'montaña'|'llanura', pueblos, lat })`
- Devuelve un `MC.Mundo` como el real: sirve en todas las vistas, con la física, la IA y Run. La misma semilla da el mismo mundo.

**Atribución siempre:** © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; relieve SRTM/NASA (AWS Terrain Tiles).

## Terreno, agua y límites (2.4)
- **`MC.Terreno.agua(M)`** al cargar: tipo de cada cuerpo de agua (mar, lago, río, quebrada) y su profundidad por distancia a la orilla. En Medellín, el río con nombre (`info.rio`) se marca para que no se corte.
- **Reglas de paso** (`MC.Terreno.paso`): pendiente máxima fuera de las vías, agua que cruza cada vehículo, roca, monte, arena, nieve y borde del mundo. **Sobre una vía la pendiente no bloquea.**
- **Obstáculos:** edificios (también los sitios y los emblemáticos), árboles de las losas, mobiliario, naturaleza y lo que el juego pase en `cuerpo.obstaculos`.
- **Mundos generados:** lagos por llenado de prioridad (solo los grandes y hondos), mar a nivel 0, pueblos fuera del agua, sin charquitos sueltos.
- Si craqueas un lugar nuevo, revisa con `MC.Terreno.agua(M).C` que los cuerpos de agua salgan con el tipo correcto. Un embalse en el borde de la ventana no es mar: el mar está a menos de 8 m de altura.

