# Motor del Valle · el motor único del mapa

**Versión 1.3.0 · 24‑nov‑2026.** (El historial de versiones está al final.)

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
| `node motor-valle/motor.mjs sanear` | **1.3:** la ley de soberanía vial (ninguna casa sobre la calle ni sobre el agua), la rasante de las vías y la prueba exacta. Deja todo en `motor-valle/salida/sanear/` (ver abajo). `encicla` y `elmetro` lo corren solos. |
| `node motor-valle/motor.mjs version` | Versión y huella sha1 de cada archivo de datos de los dos juegos. |
| `node motor-valle/sincronizar.mjs RUTA --verificar` | Solo compara las dos copias: la versión, la fuente de verdad y los archivos distintos. No copia nada. |

Requiere Python 3 con `duckdb`, `numpy`, `shapely` 2, `pillow` y `pyarrow`, y Node 18 o más nuevo. Opcional: `zopfli` (las herramientas de El Metro comprimen con él, en el mismo formato deflate, un 4 % más chico).

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
| **Huellas saneadas** (1.3) | `geo/sanear.py` + `geo/huellas.py` | `edificios.bin` (sin conectar) | `edificios.js` v2 (`tools/edificios_datos.py --saneadas`) | **Unificada** (la verdad es una; cada juego la exporta con su guarda) |
| **Rasante** (1.3) | `geo/rasante.py` | `vias-cota.bin` (sin conectar) | flujo `COTA` al final de `vias.js` (`tools/vias_datos.mjs --cota`) | **Unificada** |

## Ley de soberanía vial (1.3.0): el mapa saneado
**Regla:** ninguna casa de capa 0 pisa el corredor de una vía de capa 0 ni el agua a cielo abierto. Se cumple **en los datos**, no en el dibujo.

| Paso | Archivo | Qué hace |
|---|---|---|
| Anchos | `geo/anchos.json` | **Regla A, «el real» (decisión del autor):** radio = ancho / 2 + 1,3 m en calles de carros y + 0,3 m en peatonales, escalas y ciclorrutas (mínimo 1 m). El ancho es el de la malla vial oficial (campo `Ancho`, la calzada) o el de su clase. Las reglas B («jugable») y C (híbrida) están escritas, pero apagadas. También el Metroplús (5,5 m) y el tranvía (5 m), los mismos radios que despeja El Metro. Se cambia sin tocar código. |
| Capas | `geo/niveles.py` | Los tramos en otro nivel (puentes, túneles, pasos inferiores y elevados) de `road_flags` y `level_rules` de Overture, ubicados sobre los ejes. No recortan lo que está en la capa 0. |
| Saneamiento | `geo/sanear.py` | `B_limpio = B \ (M_vial ∪ M_agua)` con shapely 2 y STRtree, sobre las huellas originales de Overture.<ul><li>Una casa confiable (polígono de OSM) que choca solo con calles menores (calle, ciclorruta, peatonal o escalas) **no se recorta**: va a `geometry-conflicts.geojson` con su fuente y su severidad (baja < 0,3 m², media hasta 2 m², alta, o crítica a menos de 30 m de una estación).</li><li>Los restos de menos de 16 m² se quitan (una casa chica apenas rozada, que conserva el 90 % y queda de 12 m² o más, sigue).</li><li>Douglas‑Peucker a 0,6 m, y otro recorte si la simplificación volvió a la calle.</li><li>Si lo recortado sigue siendo un rectángulo (IoU ≥ 0,92), se guarda como rectángulo.</li><li>`zMin` y `zMax` del suelo de 80 m bajo los vértices, y `zBase = zMin − 6 m`.</li><li>Bioma por trozo de 160 m (`centro`, `ladera_ladrillo`, `residencial_verde`, `industrial_rio` y `rural_montana`; `costa` queda para Turno Cero).</li><li>Índice por trozos de 160 m con la clave `"cx,cy"` (`c = ⌊x / 160⌋`).</li></ul> |
| Rasante | `geo/rasante.py` | La cota de cada vía: el relieve SRTM de ~19 m cada 5 m, gaussiano a lo largo de la vía (σ = 25 m), una sola cota en cada nodo (el promedio) y otro suavizado con los nodos fijos; puentes y túneles en línea recta de estribo a estribo; tope de pendiente por clase. Flujo `COTA` para cada juego (`--encicla`, `--elmetro`). |
| EnCicla | `geo/huellas.py --encicla` | `src/data/edificios.bin` + `edificios.json`: las huellas saneadas por trozos de 160 m, con una guarda contra las vías que EnCicla dibuja. **Sin conectar** (la Fase 3 decide, con la compuerta). |
| Pruebas | `pruebas/geometria.py` y `pruebas/geometria.mjs` | La exacta sobre la verdad compartida, y la de los datos como los lee el juego (con el peso: `edificios.js` ≤ 4,6 MB y el HTML de El Metro ≤ 9,5 MB). |

**Salidas** (`motor-valle/salida/sanear/`, no van a git): `huellas.parquet` (las huellas saneadas, en metros), `agua.parquet` y `agua.json`, `geometry-conflicts.geojson`, `biomas.json`, `trozos.json`, `informe.json`, `vias_m.bin` (los ejes precisos, en el orden de `vias.bin`), `rasante.bin`, `rasante.json` y `cota-elmetro.bin`.

**Formatos nuevos** (compatibles: los lectores de hoy no los leen):
- **`vias.js` de El Metro, v2:** después de las vías (`VIAS.bytes`) va el flujo `COTA` (`VIAS.cota` bytes).
- **Flujo `COTA` v1:** `COTA`, u8 versión y uvarint de cuántas vías. Por vía: uvarint de nudos; por nudo, uvarint `ds` (metros a lo largo de la vía) y zigzag `dz` (cuartos de metro; el primero absoluto); luego uvarint de eventos y, por evento, uvarint del nudo y u8 `(capa + 1) | rampa << 2`. La pendiente de cada tramo es `Δz / Δs`.
- **`edificios.js` de El Metro, v2:** el bit 128 del byte de uso marca «recortado»; al final, el flujo `zb` (los edificios cuyo suelo baja más de 4 m desde el centro: salto de índice, cuánto baja y cuánto sube en medios metros). `len` trae 8 largos y el lector usa los seis primeros.
- **`edificios.bin` de EnCicla:** el mismo esquema, por trozos de 160 m, con dos flujos más (`zb` por edificio y `marca`: casa confiable marcada y bioma). Lo describe `edificios.json`.

## Propuestas en estudio
- **Pasos a distinto nivel** (entrega de ChatGPT, v2.0 de EnCicla):
  - `geo/pasos.py` saca de Overture los túneles, los puentes y los pasos inferiores abiertos, con su nivel firmado.
  - `js/red-niveles.mjs` arma una red por casilla y nivel: un cruce no conecta niveles distintos, salvo por una rampa.
  - Su prueba es `node tests/prueba-niveles.mjs`.
- Todavía no cambia la salida del motor. Para adoptarla hay que subir la versión.
- **Las dos «1.1.0» ya están unidas en la 1.2.0** (ver el historial). Sus capas propias (`vias_datos.mjs`, `rutas_calles.mjs` e `hitos.js`) siguen en el repositorio de El Metro hasta mudarse a `capas/` (F2).

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

## Historial
| Versión | Fecha | Qué cambió |
|---|---|---|
| 1.0.0 | 18‑nov‑2026 | Una tubería con dos resoluciones, el exportador a El Metro, el sincronizador y este contrato. |
| 1.1.0 · EnCicla (Gemini) | 18‑nov‑2026 | Túneles y deprimidos en `geo/alturas.py`, el lector `js/valle.js` y el catálogo `capas/index.mjs`. |
| 1.1.0 · El Metro | 19‑nov‑2026 | La fachada `MotorValle` (MAP, VC, G3), la huella de los datos de los dos juegos en `version` y sus capas propias. Puso a MetroZero como fuente de verdad, al revés de lo acordado. |
| 1.2.0 | 19‑nov‑2026 | **Une las dos 1.1.0**, con la fuente de verdad en BicicletasUno. `js/valle.js` trae el lector de EnCicla y la interfaz de El Metro: `Valle` y `MotorValle`, con `Valle.elmetro`. `version` mide los datos de los dos juegos. `sincronizar --verificar` compara las copias y avisa si una dice otra fuente de verdad. El catálogo suma las capas de El Metro y la propuesta de pasos. |
| **1.3.0** | 24‑nov‑2026 | **Renacimiento cenital, Fase 1: el mapa saneado.** Ley de soberanía vial (`geo/sanear.py` y `geo/anchos.json`, regla A del autor), capas de puentes y túneles (`geo/niveles.py`), rasante (`geo/rasante.py`), huellas saneadas para EnCicla (`geo/huellas.py`, sin conectar), pruebas de geometría (`pruebas/`), dos fuentes nuevas (`huellas` y `agua_niveles`), los ejes precisos de las vías (`build.py` con `VIAS_M`) y el subcomando `sanear`. En El Metro: `edificios.js` v2 y la cota al final de `vias.js`. |
