# Turno Cero · paquete 3D reproducible

**Estado:** prototipos geométricos de preproducción. **No son el videojuego 3D**, ni modelos cinematográficos terminados.

El juego objetivo, situado en 2026, combina mafia, espionaje, infiltración, combate a pie, dispositivos especiales y persecuciones en Manhattan. La adenda narrativa vive en [`docs/GETAWAY-ESPIONAJE-3D.md`](../../../docs/GETAWAY-ESPIONAJE-3D.md).

## Generación offline (sin paquetes Python)
```sh
python3 juegos/getaway/arte3d/generar_modelos.py
python3 juegos/getaway/arte3d/pruebas-modelos.py
```
El script crea `juegos/getaway/arte3d/modelos/*.glb` (42 archivos) y reescribe `manifest.json`, compatible con glTF 2.0. La **CI publica los GLB como artefacto descargable** dentro de los resultados de Actions; evita versionar binarios de preproducción que pueden regenerarse. Todos los modelos se crean con 1 unidad = 1 metro, Y arriba.

## Visor
Abrir `visor-3d.html` localmente con WebGL2; trae un rastreador de prueba incrustado para funcionar sin conexión. Para revisar más modelos, pulsa «Archivos GLB», selecciona uno o varios de `modelos/` y gira con arrastrar. No utiliza bibliotecas externas ni servidores.

## Recursos incluidos
7 vehículos, 6 personajes, 10 dispositivos, 4 edificios y 15 módulos de escenario: **42 modelos de bloqueado**. El fichero `manifest.json` tiene medidas, tamaños de archivos, conteos de polígonos y finalidad. Una ampliación 3D auténtica exigirá UV, texturas PBR, variación de daño, rigging, animaciones, LOD, navegación y un Manhattan generado a partir de geodatos licenciados.

**Licencia de la geometría procedural original:** CC0-1.0. Las láminas cinematográficas son referencias separadas; la estética no debe copiar personajes ni iconografía de franquicias existentes.

## V0.3 · Rigs y escena de acción 3D
- [Juego standalone WebGL2](../turno-cero-accion-3d.html) con controles de escritorio y táctiles; 4 GLB previos incrustados y actores animados proceduralmente.
- `python3 generar_actores_rig.py && python3 validar_actores_rig.py` crea 3 GLB nuevos de personaje con 12 huesos y 8 clips cada uno. Son **animaciones exportadas** todavía no ejecutadas por el visor del juego.
- [Guía y límites](README-ACCION-3D.md). El workflow de activos entrega 45 GLB como un artifact descargable.

## C-M33 · nuevos personajes articulados
El generador exporta **9 personajes** (Mara, Rook, guardia, Nadia, Noah, Cross, El Contador y dos peatones), cada uno con **12 huesos, 8 clips** y pesos compartidos en codos/rodillas. El validador comprueba los 9 GLB y pesos sumando 255. El catálogo generable es 42 básicos + 9 articulados (**51 GLB**).

Los personajes adicionales son **activos de desarrollo** descargables desde Actions; no reemplazan automáticamente los modelos de la compilación ni constituyen LOD1/LOD2 o arte PBR cinematográfico.
