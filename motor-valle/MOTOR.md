# Motor del Valle · el motor único del mapa

**Versión 1.0.0 · 18‑nov‑2026.**

**Qué es.** El motor del Valle crea el mapa del Valle de Aburrá que comparten **Juega EnCicla** y **El Metro**: es el mismo mapa, cada juego en su resolución.

Lo demás va por aparte, porque cada juego es una obra propia con su trama y sus diseños especiales: módulos de juego, funciones, mecánicas, estilo de dibujo, historia y Easter eggs.

| | |
|---|---|
| Fuente de verdad | `juanfeliperico369-stack/BicicletasUno` → `motor-valle/` |
| Copia | `juanfeliperico369-stack/MetroZero` → `motor-valle/` (igual, con `sincronizar.mjs`) |
| Versión | `motor-valle/VERSION.json` |

## Reglas
1. **El mapa solo se cambia aquí.**
   - Los juegos no editan a mano los datos generados: `src/data/valle.*`, `vias.bin`, `sitios.*`, `alturas.json`, `metroplus.json` y, en El Metro, `src/data/valle.js`.
   - Una corrección del mapa (una calle, un puente, un edificio, una estación) va en `motor-valle/`.
2. **Cada cambio sube la versión** en `VERSION.json` y se copia al otro repositorio:
   ```
   node motor-valle/sincronizar.mjs ../MetroZero
   ```
   o al revés. Si el otro repositorio tiene una versión más nueva, el sincronizador no copia.
3. **Lo propio de cada juego no entra al motor:** cómo se dibuja, la física, la trama, los modos y los Easter eggs. Los datos que solo usa un juego pueden vivir en el motor si salen de las mismas fuentes; así el otro juego también puede usarlos.
4. **Atribución siempre:**
   - © colaboradores de OpenStreetMap (ODbL), vía Overture Maps Foundation;
   - capas oficiales de Medellín: Subsecretaría de Catastro, malla vial y barrios;
   - relieve SRTM (NASA, AWS Terrain Tiles).

## Comandos
| Comando | Qué hace |
|---|---|
| `node motor-valle/motor.mjs fuentes` | Descarga o actualiza las fuentes en `motor-valle/geo/cache/`: Overture/OSM, edificios, puentes y rieles con nivel, relieve y capas oficiales. Ocupa unos 190 MB y no se sube a git. |
| `node motor-valle/motor.mjs encicla [RUTA_ELMETRO]` | Casillas de **10 m** → `src/data/` de Juega EnCicla: `valle.json`, `valle.bin`, `vias.bin`, `sitios.*`, `alturas.json` y, con la ruta de El Metro, `metroplus.json`. |
| `node motor-valle/motor.mjs elmetro RUTA_ELMETRO` | Casillas de **20 m** → `RUTA_ELMETRO/src/data/valle.js`, en formato v3 de El Metro, con la misma tubería. |
| `… --prueba` | Deja la salida en `motor-valle/salida/` sin tocar los juegos. |
| `node motor-valle/motor.mjs version` | Versión y huella sha1 de cada archivo de datos. |

Requiere Python 3 con `duckdb`, `numpy`, `shapely` y `pillow`, y Node 18 o más nuevo.

## Coordenadas (las mismas para los dos)
- **Ventana:** lon −75,70 a −75,31; lat 6,46 (norte) a 6,015 (sur). De Caldas a Barbosa.
- **Escalas:** `kx = 111320 · cos(6,2375°) / tile` y `ky = 110574 / tile` (casillas por grado).
- **Casilla de un punto:** `x = (lon − lon0) · kx` y `y = (latN − lat) · ky`.
- **Metros del mapa:** `casilla × tile`.

| | Juega EnCicla | El Metro |
|---|---|---|
| Casilla | 10 m (4.316 × 4.921) | 20 m (2.158 × 2.461) |
| Unidad de dibujo | 16 px por casilla (**1 m = 1,6 px**) | metros |
| Conversión | `px = m × 1,6` | `m = px / 1,6` |

Los dos usan el mismo origen (`lon0`, `latN`). Por eso un dato en metros de El Metro (los andenes del Metroplús, por ejemplo) entra a EnCicla multiplicado por 1,6, y uno de EnCicla sale a El Metro dividido por 1,6.

## Formato binario v3
Es `valle.bin` en EnCicla y `VALLE_BIN` en El Metro: deflate crudo y base64 en el HTML. Las capas van seguidas:

1. `W·H` bytes: tipo de casilla (`TT`).
2. `eW·eH·2`: relieve en metros, `uint16`, una muestra cada `es` casillas (80 m).
3. `mW·mH`: municipio.
4. `mW·mH`: comuna.
5. `mW·mH·2`: barrio, `uint16`. Está si hay `barrios`; en El Metro lo marca `ba: 1`.
6. `mW·mH`: pisos del edificio más alto (`hg`).
7. `mW·mH`: área mediana de los lotes ×4 m² (`lt`).

Las capas 3 a 7 van por celda de 8 casillas.

**Tipos de casilla (`TT`):**

| Código | Tipo | Código | Tipo | Código | Tipo |
|---|---|---|---|---|---|
| 0 | GRASS | 6 | WALK | 12 | STATION |
| 1 | MOUNT | 7 | CICLO | 13 | LAND |
| 2 | BRICK | 8 | WATER | 14 | AUTO |
| 3 | BLDG | 9 | CANAL | 15 | DEPOT |
| 4 | ROAD | 10 | PLAZA | 16 | STEPS |
| 5 | AVE | 11 | BRIDGE | | |

El `valle.json` (o `VALLE_META`) trae, entre otros, `barrios`, `munis`, `comunas`, `lanes`, `lights`, `metro` (A, B y T), `river`, `mp` y `parques`.

## Capas: qué hay y quién las genera hoy
| Capa | Generador | Juega EnCicla | El Metro | Estado |
|---|---|---|---|---|
| Base: casillas, relieve, municipios, comunas, barrios, pisos y lotes | `geo/build.py` | `valle.json` + `valle.bin` (10 m) | `valle.js` (20 m) | **Unificada** |
| Calles con nombre (vectores) | `geo/build.py` | `vias.bin` | `vias.js` (`tools/vias_datos.mjs`) | Por unificar (F2) |
| Sitios reales y emblemáticos | `geo/sitios.py` | `sitios.bin`/`sitios.json` | `edificios.js` (`tools/edificios_datos.py`, todas las huellas) | Por unificar (F2) |
| Puentes y viaducto con nivel | `geo/alturas.py` | `alturas.json` | `puentes.js` (`tools/puentes_datos.py`) | Por unificar (F2) |
| Red de transporte | `geo/lineas.json` (de `red.js` de El Metro) | `VM.metro`, `CABLES` | `red.js` | Mismo origen |
| Metroplús: corredor y andenes reales | `tools/metroplus_osm.py` y `metroplus_andenes.py` (El Metro) → `geo/metroplus_elmetro.py` | `metroplus.json` | `metroplus.js`, `metroplus_andenes.js` | Mismo origen |
| Ciudad oficial | `tools/ciudad_datos.py` (El Metro) | — | `ciudad.js` | Por unificar (F2) |
| Lugares e hitos | `19-lugares.js` (EnCicla) | `LUGARES` | `hitos.js`, `lugares.js` | Por unificar (F3) |

## Propuestas en estudio
- **Pasos a distinto nivel** (entrega de ChatGPT, v2.0 de EnCicla):
  - `geo/pasos.py` saca de Overture los túneles, los puentes y los pasos inferiores abiertos, con su nivel firmado.
  - `js/red-niveles.mjs` arma una red por casilla y nivel: un cruce no conecta niveles distintos, salvo por una rampa.
  - Su prueba es `node tests/prueba-niveles.mjs`.
- Todavía no cambia la salida del motor. Para adoptarla hay que subir la versión.
- **Hay dos «1.1.0»:** la de Gemini (aquí) y la que trae la entrega de El Metro. Se deben reconciliar en una 1.2.0 desde este repositorio, que es la fuente de verdad.

## Hoja de ruta de la unificación
- **F1 (hecho, v1.0.0):**
  - una sola tubería con dos resoluciones;
  - el exportador al formato de El Metro;
  - el sincronizador;
  - este contrato.
- **F2:**
  - El Metro hace su `valle.js` con `node motor-valle/motor.mjs elmetro .` y retira su copia de la tubería.
  - Sus generadores de capas (vías, edificios, puentes, ciudad, rieles, Metroplús y rutas) se mudan a `motor-valle/capas/`, con salida para los dos juegos y la conversión de escala en un solo lugar.
- **F3:** un solo cargador `motor-valle/js/valle.js` que los dos juegos incluyen.
  - Decodifica el binario.
  - Convierte coordenadas.
  - Responde consultas: casilla, relieve, barrio, calle más cercana y estación más cercana.
- **F4:** las mismas capas en los dos juegos (EnCicla con las huellas de edificios de El Metro; El Metro con sitios, alturas y Metroplús de EnCicla), y una auditoría del mapa que mide los dos con las mismas cifras (`tools/auditoria-mapa.js`).

**Para trabajar al tiempo:** cada IA trabaja en su juego. Un cambio del mapa va en `motor-valle/` del repositorio de EnCicla (la fuente de verdad), sube la versión y se sincroniza al otro.
