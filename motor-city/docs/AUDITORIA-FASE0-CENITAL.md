# Fase 0 · Auditoría real del «renacimiento cenital»
## Motor del Valle, Motor City, El Metro, Juega EnCicla y Turno Cero

**24‑nov‑2026 · Claude (Claude Code, sesión en la nube, rama `ccr-408a25e1-xz3rl6`).**
**Fase 0 = solo lectura:** no se cambió código ni datos de ningún juego. Solo se sumaron documentos y evidencia en este repositorio.

| Qué | Dónde |
|---|---|
| El pedido (fases 0 a 5) | `docs/referencias/renacimiento-cenital-2026/MASTER-PROMPT-VALLE-CITY-TURNO-CERO.md` |
| La especificación de referencia | `docs/investigacion_tecnica_motor_valle.md` (la pidió el prompt en `docs/`) |
| La segunda entrega (GPT‑6 «Eón») | `docs/referencias/renacimiento-cenital-2026/INFORME-MAESTRO-…` y `PROMPT-MAESTRO-…` (su «Lote 0») |
| La evidencia de esta fase (comandos, cifras y capturas) | `reportes/2026-11-24-claude-fase0-cenital.md` y `reportes/fase0-cenital/` |

---

## 0. En un minuto

1. **Los tres repositorios están en verde hoy** (§ 1): Motor City 158/158, El Metro 100 partidas con 0 errores, EnCicla 170/170.
2. **El problema de «casas encima de la calle» es real y está medido** (§ 3). En los datos de El Metro, **120.187 de 638.303 edificios (18,8 %) pisan el corredor vial**, aun con la regla angosta que ya usa el juego. Con los anchos «jugables» del prompt serían **151.055 (23,7 %)**.
3. **Hoy cada motor lo tapa en tiempo real, cada uno a su manera.** Ninguno lo corrige en los datos:
   - El Metro recorta cada edificio contra la calle al cargar la región. Si la casa queda recortada, su polígono se vuelve rectángulo. Si su centro cae en la vía, desaparece.
   - EnCicla no tiene huellas reales: inventa las casas en lotes a lo largo de cada calle.
   - Motor City (Turno Cero) deja 1 m de tolerancia en la colisión sobre la calle.

   Tu regla 3 («saneamiento en datos, no parches») apunta justo a esto.
4. **Varias cosas que los prompts dan por hechas no son así** (§ 4). La más importante: Turno Cero no está en MetroZero, y por regla (18+) no puede entrar ahí. Otra: El Metro y EnCicla ya tienen «un solo mundo 3D» con cámara cenital; no hay que partir de cero.
5. **Plan de la Fase 1** (§ 6): todo en `motor-valle/`, la tubería del mapa que ya comparten EnCicla y El Metro. Se suma la limpieza booleana con prueba automática, sin tocar ningún render.
6. **Necesito cinco decisiones tuyas antes de la Fase 1** (§ 7).

---

## 1. Línea base medida (antes de cambiar nada)

| Repositorio | Commit | Versión | Compilar | Probar | HTML único |
|---|---|---|---|---|---|
| `motorcity` | `245bbb0` | Motor City 5.3.1 | `node herramientas/construir.mjs` ✓ (2 s) | `node pruebas/prueba.mjs --navegador` → **158 bien** (106 s) | `getaway.html` 28.839 KB |
| `MetroZero` | `7b7733a` | El Metro 3.8.0 | `node tools/build.mjs` ✓ (1 s) | `node tools/test.mjs 100` → **0 errores**: 100 partidas, 287.221 pasos y 0 errores de consola (106 s) | `index.html` 8.749 KB |
| `BicicletasUno` | `1b3ce40` | EnCicla 3.7.0 | `node tools/build.js` ✓ (1 s) | `node tests/run.js` → **170 bien** (166 s) | `juega-encicla.html` 5.641 KB |

- **Compuerta de rendimiento de EnCicla** (`tests/benchmark-2km-gpt6.mjs`, CPU ×4, 412 × 860, caché fría, 2 km). La exige `publicar.yml`: p95 < 50 ms y peor cuadro < 120 ms.

  | Vía | p95 | Peor cuadro | Mediana |
  |---|---|---|---|
  | Carrera 43A | **103,7 ms** | 141,9 ms | 50,8 ms |
  | Av. Las Palmas | **61,2 ms** | 243,7 ms | 37,9 ms |

  **Sigue sin cumplirse.** El relevo anotaba 131 y 77 ms en otra máquina.
- **Motor del Valle:** BicicletasUno y MetroZero están en la 1.2.0 y `sincronizar.mjs --verificar` dice que **las dos copias son iguales**.
- **Herramientas en esta sesión:**
  - se instalan `shapely` 2.2 y `duckdb` 2.0;
  - responden el S3 de Overture y los mosaicos de relieve de AWS (HTTP 200).

  **La Fase 1 se puede correr aquí completa**, incluso rehaciendo desde las fuentes.

---

## 2. Mapa técnico real

### 2.1 Quién es quién

| Repositorio | Es | Mapa | Lo que lleva de los otros |
|---|---|---|---|
| `motorcity` | Motor City (motor) y **Turno Cero** (`juegos/getaway/`, 18+) | Mundos MC4 (`datos/<id>/mundo.mc4`) hechos con `geo/territorio.py`; losas de 160 m y sectores de 1 km | — |
| `BicicletasUno` | Juega EnCicla (familia) | **Fuente de verdad del Motor del Valle** (`motor-valle/`, 1.2.0): casillas de 10 m | `motor-city/` 5.3.1, **solo como referencia** (no entra al HTML) |
| `MetroZero` | El Metro (familia) | **Copia** del Motor del Valle (casillas de 20 m) y capas propias en `tools/` | `motor-city/` 5.3.1, solo como referencia |

- No hay código de juego compartido en tiempo de ejecución. Lo compartido es la **tubería de datos** (`motor-valle/`), que exige: «el mapa solo se cambia aquí, cada cambio sube la versión y se sincroniza».
- **«Motor-city» en los hermanos es una copia de consulta.** Cambiarla no cambia el juego.

### 2.2 Qué dibuja el mapa hoy

| | El Metro (`src/js/`) | EnCicla (`src/js/`) | Motor City / Turno Cero (`js/`) |
|---|---|---|---|
| Casillas y relieve | `10-map.js` (20 m; relieve de 80 m; el parche oficial de `ciudad.js` a 5 m) | `20-map.js` (10 m; relieve de 80 m) | `10-mundo.js`, `15-terreno.js` (MC4) |
| Calles vectoriales | `11-ciudad2.js` (`VC`: 26.919 vías con ancho; celdas de 160 m) | `75-graficos.js` (cadenas de `vias.bin`, «ciudad suave») | `10-mundo.js` (vías del MC4) |
| Edificios | `11-edificios.js`: **639.457 huellas reales** (30.088 polígonos y el resto rectángulos orientados) por regiones de 640 m, **recortadas contra la calle en tiempo real** (`recorta`, línea 98) | `75-graficos.js` · `lotes()` (línea 193): **lotes inventados** a lo largo de cada calle (hasta 3 filas), según el tipo de casilla; sin huellas, salvo los sitios (`22-sitios.js`) | Huellas del MC4 sin recortar (`geo/territorio.py`, línea 123); en la colisión, **1 m de tolerancia** sobre la calle (`32-fisica.js`, línea 46) |
| 2D cenital | `VC.drawTop` y `estructuras` (línea 394): **oblicua constante** (`ob = 0,45`) en trozos guardados de 80, 160, 640 y 2.560 m | Trozos de 160 m con volumen y perspectiva; pixel; K‑1: trozos por etapas de 6 ms (`99w`) | `41-vista2d.js` (una sola proyección para cenital, oblicua, maqueta y lateral) |
| 3D | `22-gl.js` (`G3`, WebGL propio), en tres anillos:<ul><li>hasta 700 m (380 en «bajo»), los edificios reales;</li><li>de 700 a 1.100 m, **cajas de relleno por casilla de 20 m**, sin recortar (línea 177);</li><li>más lejos, el terreno de 320 m.</li></ul> | `99d-mundo3d.js` y `99o-mundo3d-camaras.js`: el mismo mapa en WebGL, con 6 vistas y «Pixel World» | `45-gl.js`, `45-gl3d.js` y `45-tres.js` (three.js, aprobado) |
| Cámara | `36-libre.js`, línea 190:<ul><li>seguimiento con `min(1, dt·k)`;</li><li>adelanto de 1,1·v;</li><li>zoom por velocidad, de 1,7 a 1,05.</li></ul>`27-camara.js` (`CamUI` para los otros modos) | `88-camara.js`: pellizco, giro, inclinación y 4 ángulos | `34-camara.js`: cenital a 79° de lejos y 66° de cerca, oblicua, maqueta e historieta a 55° |
| Vistas del modo libre | 3D Cenital, 3.ª persona, 1.ª persona, Panorámica, Cine y 2D/Pixel (`36-libre.js`, línea 31) | 3D Cenital, Oblicua, 3.ª, 1.ª, Panorámica 2D y Maqueta 2:1, más Pixel World | Cenital, ciudad 3D, 3.ª, 1.ª, dron, maqueta, 🏁 arcade y ⛰️ vuelo |
| Física | `36-libre.js`:<ul><li>choque que desliza;</li><li>desatascador;</li><li>asistencia de carril y de paredes;</li><li>agarre por suelo;</li><li>pendiente real, lluvia y freno de mano;</li><li>niveles (puentes y deprimidos).</li></ul> | `30-ride.js` y `98q-manejo.js` (subida y bajada en %) | `32-fisica.js` (`MC.Cuerpo`) y `37-dinamica.js` (llantas, peso y suspensión) |
| Lo que tapa al jugador | **Nada lo evita.** En las capturas de Acevedo y San Antonio, el techo de la estación tapa al jugador en la 3D cenital (§ 3.3). | Nada lo evita | **Sí:** «rayos X» (`41-vista2d.js`, línea 112) |

### 2.3 Cómo se generan los datos

| Archivo del juego | Generador | Fuentes | Escala y formato |
|---|---|---|---|
| EnCicla `valle.json/.bin`, `vias.bin`, `sitios.*` y `alturas.json` | `node motor-valle/motor.mjs encicla` (`geo/build.py`, `sitios.py`, `alturas.py`) | Overture (OSM, ODbL), capas oficiales de Medellín y relieve SRTM (AWS Terrain Tiles z13) | Casillas de 10 m; binario v3 (deflate + base64) |
| El Metro `valle.js` | `node motor-valle/motor.mjs elmetro .` | Las mismas | Casillas de 20 m; v3 |
| El Metro `vias.js` | `tools/vias_datos.mjs` (de `vias.bin` de EnCicla 1.3) | Overture, con el ancho de la malla vial oficial | 26.919 vías, en unidades de 2,5 m; tipos 1 calle, 2 avenida, 3 autopista, 4 carrera, 5 ciclorruta, 6 peatonal y 7 escalas |
| El Metro `edificios.js` (4,5 MB, el más pesado) | `tools/edificios_datos.py` | Huellas de Overture:<ul><li>**Google Open Buildings: 336.503 (52,6 %)**;</li><li>OSM: 171.210;</li><li>Microsoft: 131.744.</li></ul>Pisos del Catastro (Popular, El Poblado y Robledo) y de OSM | Regiones de 640 m; medio metro; polígono opcional (bit 16) |
| El Metro `ciudad.js` | `tools/ciudad_datos.py` | Alcaldía de Medellín: manzanas, malla vial, jerarquía, espacio público y lotes | Cuartos de casilla (5 m) |
| El Metro `puentes.js` | `tools/puentes_datos.py` | Overture: `is_bridge`, `is_tunnel` y `level` | Metros |
| El Metro `rutas.js` y `rutas_calles.js` | `tools/rutas.mjs` (A\* sobre el mapa v3) y `tools/rutas_calles.mjs` (sobre `vias.js`) | — | — |
| El Metro `red.js` | Curado a mano (`docs/FUENTES.md`) | — | — |
| Motor City `mundo.mc4` | `geo/territorio.py` | Overture y SRTM | Capas MC4 |

- **Requisitos:** Python 3 con `duckdb`, `numpy`, `shapely` y `pillow` (más `pyarrow` para los edificios), y Node 18 o más nuevo.
- La caché de fuentes ocupa unos 190 MB y **no está en git**: hay que bajarla con `node motor-valle/motor.mjs fuentes`.

### 2.4 Cómo se compila el HTML único

- **El Metro** (`tools/build.mjs`):
  1. junta `head.html`, `body.html`, un `<script>` por archivo de datos y todos los `src/js/*.js` en orden, sin los comentarios de línea entera;
  2. revisa la sintaxis con `node --check`;
  3. escribe `dist/index.html`, el `sw.js` y el manifiesto.
- **EnCicla** (`tools/build.js`):
  - escribe `dist/juega-encicla.html`, con el arte lateral opcional (73 KB) y el documento para IA;
  - `publicar.yml` no publica si fallan la batería o la compuerta p95.
- **Motor City** (`herramientas/construir.mjs`):
  - escribe `dist/motor.js` (86 archivos `js/NN-*.js`), los juegos en `dist/juegos/*.html` (con los mundos y modelos incrustados) y `dist/MOTOR-CITY-TODO.md`.

### 2.5 Qué se puede tocar y qué no

**El Metro.**
- **Protegidos:**

  | Archivo | Qué es |
  |---|---|
  | `23-lado.js` | Vista lateral o panorámica del recorrido |
  | `24-iso.js` | Maqueta 2:1 |
  | `30-conduce.js` y `30b-tranvia.js` | Conducir el Metro y el tranvía |
  | `31-cabina.js` | Cabina en primera persona |
  | `32-volante.js` | Al volante |
  | `40-rieles.js` | Despacho y alimentador |
  | `45-metroplus.js` | Metroplús |
  | `47-carrera.js` y `47b-ciclovia.js` | Carrera y ciclovía |
  | `48-operacion.js` | Operación |
  | `50-cable.js` y `52-cableviaje.js` | Metrocable |
  | `67-guia.js` | Guía didáctica |
  | `70-historia.js`, `37-trama.js`, `37-cronicas.js` y `src/data/guion.js` | Rosalba y la trama |

- **A intervenir:**
  - `36-libre.js` (Ciudad Libre) y `38-bus.js` (Bus);
  - el motor compartido: `10-map.js`, `11-*.js`, `18-mundo.js`, `22-gl.js`, `22a-…` y `27-camara.js`.
- ⚠️ **Choque con la regla 1:** el dibujo compartido también lo usan modos protegidos.
  - `MAP.drawTop` (que llama a `VC.drawTop`) lo usan Conducir (vista superior), Volante, Carrera, el mapa grande y el álbum.
  - La 3D `G3.draw` la usan Conducir, Volante, Carrera y el viaje en Metrocable.

  Un cambio en el render se ve también ahí. Para evitarlo hace falta una **bandera por modo** (decisión 4).

**EnCicla.**
- **Protegidos:**
  - los 9 oficios y los 27 turnos (`50-modes.js`, `52-oficios.js` y `72-oficios2.js`);
  - los minijuegos (`40-mg.js`, `45-mg2.js` y `46-mg3.js`);
  - la interfaz de revista (`60-ui.js` y `79-interfaz.js`).
- **A intervenir:** el modo libre (`69-libre.js`) y la vista cenital (`75-graficos.js`, `76-altura.js`, `99d` y `99o`).
- ⚠️ **El mismo choque:** el cenital de `75-graficos.js` es el de los oficios **Usuario** (mundo libre), **Apoyo**, **Técnico**, **Balance** y **Supervisor** (`50-modes.js`, `ROLES`). Ver la decisión 3.

**Motor City / Turno Cero.** Siguen las zonas de `coord/agentes/claude.json`. El pseudo‑3D está en `js/47-clasicos.js` y `juegos/getaway/55-clasicos.js`.

---

## 3. Evidencia medida

### 3.1 Edificios contra corredores viales (El Metro, datos actuales)
- **Herramienta:** `reportes/fase0-cenital/medir-conflictos-elmetro.mjs`, en Node y sin dependencias.
  - Decodifica `vias.js`, `edificios.js` y `valle.js` igual que el juego.
  - Rasteriza los corredores a 0,5 m por región de 640 m y muestrea cada huella cada 0,5 m.
  - Tarda 34 s y no modifica nada.
- **Resultado completo:** `reportes/fase0-cenital/conflictos-elmetro.json`.
- **Las dos reglas medidas:**
  - **A, la del juego hoy:** radio = w/2 + 1,3 m en calles de carros y w/2 + 0,3 m en peatonales y escalas; las ciclorrutas no se despejan.
  - **B, la del prompt:** radio = ancho/2 + andén, con autopista 22 + 3, avenida 15 + 2,5, carrera 11 + 2, calle 8,5 + 1,5 y ciclorruta 3,5 + 0,8. Nunca más angosta que la vía real.

| | Regla A (juego hoy) | Regla B (prompt) |
|---|---|---|
| Edificios que pisan la vía | **120.187 (18,8 %)** | **151.055 (23,7 %)** |
| … con el centro en la vía (hoy el juego los borra) | 12.267 | 24.983 |
| Área invadida | 2,57 km² (2,6 % de 100 km² construidos) | 4,23 km² |
| Por tamaño: < 0,3 / 0,3–2 / 2–10 / 10–50 / > 50 m² | 2.868 / 9.548 / 34.183 / 64.729 / 8.859 | 2.644 / 8.949 / 32.422 / 88.361 / 18.679 |
| Por tipo de vía | calle 94.388 · carrera 11.468 · escalas 5.704 · avenida 5.526 · peatonal 2.673 · autopista 428 | calle 117.084 · carrera 17.113 · avenida 7.999 · escalas 5.019 · peatonal 2.362 · autopista 1.342 · ciclorruta 136 |
| Fracción media de la casa dentro de la vía (las que tocan) | 21,8 % | 27,9 % |

- **Anillo lejano 3D de El Metro** (de 700 a 1.100 m de la cámara): de 515.666 casillas BLDG o BRICK de 20 m, **76.585 (14,9 %)** levantarían una caja de relleno que toca un corredor A.
  - Se calculó con la caja máxima de 21 × 19 m y sin el parche de `ciudad.js`: es una estimación.

### 3.2 Por qué pasa
Es una hipótesis con datos; la Fase 1 la confirma con los polígonos de origen.
- **Lo que se sabe:** las calles de OSM son ejes sin espesor. Al darles un ancho jugable, la calle se come el frente de las casas. Así lo dicen los dos documentos.
- **Lo poco conocido:**
  - 73 % de las huellas no las dibujó una persona: salen de un **modelo de aprendizaje automático sobre imágenes de satélite** (Google, 52,6 %, y Microsoft, 20,6 %).
  - Esas huellas y los ejes de OSM se trazaron sobre imágenes distintas. Entre ellas hay **corrimientos de 1 a 3 m** que no dependen del ancho de la calle.
  - Además, el 95 % de las huellas se guarda como **rectángulo orientado** (el mínimo que la encierra). En una casa en L o en un lote irregular, ese rectángulo invade más de lo que invade la casa.
  - Por eso la fracción media invadida (21,8 %) es tan alta, aun con la regla angosta.
- **Consecuencia:** el recorte no puede ser ciego. Cuando una casa confiable (un polígono de OSM o del Catastro) choca con una calle menor, la desplazada puede ser la calle. Esos casos se marcan para revisión (GeoJSON de conflictos), como pide el informe de GPT‑6, en vez de borrar la casa.

### 3.3 Capturas «antes»
Están en `reportes/img/claude-fase0/`, a 412 × 860, tomadas con las mismas pruebas de cada juego.
- `elmetro-libre-cen3d-acevedo.webp`: en la 3D cenital, un techo enorme tapa por completo al jugador («Tú») en la estación de salida. Es la evidencia directa de que falta el *occluder fade*.
- `elmetro-libre-cen3d-san-antonio.webp`: la cubierta de la estación tapa al jugador.
- `elmetro-libre-cen3d-parques-del-rio.webp`: el skatepark de Parques del Río.
- `encicla-usuario-cenital-san-ignacio.webp`: el oficio Usuario, con los lotes inventados en La Candelaria.

### 3.4 Los cinco videos de referencia
Se identificaron por sus metadatos públicos (oEmbed de YouTube). **No se vieron cuadro a cuadro.** El informe de GPT‑6 no pudo verificar los videos 1, 2 y 4.

| Video | Es |
|---|---|
| `EH3h5B9TiyQ` | *Reckless Getaway 2*, juego en Android (Uptodown) |
| `0skAS5QIYrE` | *Super Arcade Racing*, juego completo en PS4 (Casual Racer Red) |
| `cRaZkqIRA3A` | *GTA Chinatown Wars*, recorrido completo (GTA Series Videos) |
| `NH9dXqeyBfU` | *GTA 2*, juego completo en español (ProjectVOID) |
| `SqGbFtBU4Fs` | *Grand Theft Auto* (GTA 1), recorrido completo (NeoGamer) |

Coinciden con los cinco títulos de la matriz de `docs/investigacion_tecnica_motor_valle.md`. Esa matriz sí corresponde a tus videos.

---

## 4. Lo que los documentos suponen y no es así

| El documento dice | Lo real | Qué cambia en el plan |
|---|---|---|
| «MetroZero (El Metro + **laboratorio de Turno Cero**)» | En MetroZero no hay nada de Turno Cero. Turno Cero (18+) vive solo en `motorcity/juegos/getaway/`, y los tres repositorios prohíben mezclarlo con los juegos de familia. | Las fases 4 y 5 van en `motorcity`. |
| «Motor-valle y motor-city: el motor compartido» | `motor-valle/` es la **tubería de datos** compartida y sincronizada. `motor-city/` en los hermanos es solo de consulta. Cada juego dibuja con su propio código. | El saneamiento sí se comparte (va en `motor-valle/`). El render se adapta en cada juego. |
| «Del 2D sin profundidad a un 3D básico…» | El Metro y EnCicla ya tienen **un solo mundo 3D WebGL con 3D cenital**, varias cámaras y pixel; El Metro, además, la física de Motor City 4.5 (choque que desliza, carril, pendiente y niveles). | La Fase 2 **pule y completa**:<ul><li>*occluder fade*;</li><li>quitar el relleno por casillas;</li><li>zócalos y terreno facetado;</li><li>sombra de contacto;</li><li>*tilt-shift*.</li></ul>No reescribe. |
| «El intento previo no implementó la acumulación de curvas ni el recorte `maxY`» | `MC.Arcade` usa **otra técnica válida**: proyecta en 3D el eje real de la calle (puntos cada 6 m con la cota del MC4) y pinta de lejos a cerca. Así las lomas tapan bien lo de atrás, sin `maxY`. Lo que **sí falta** es lo de carreras (ver la tabla de abajo). | La Fase 4 suma un módulo de **pistas diseñadas**, sin reemplazar el de la calle real. |
| Fórmula de extrusión lineal `x_t = x_b + (x_b − c)·h·k` | Es la aproximación de primer orden de una cámara cenital real. La exacta es `x_t = x_b + (x_b − c)·h/(Z_c − h)`, con `k ≈ 1/Z_c` (`Z_c`, la altura de la cámara). Falla en las torres altas. | En Canvas 2D obliga a redibujar cada edificio en cada cuadro y rompe los trozos guardados (por eso El Metro usa una oblicua constante en 2D). La perspectiva verdadera ya la da la 3D WebGL. La extrusión radial queda solo para el 2D/Pixel, con caché por edificio. |
| Trozos de 250 m | Los cachés actuales son de 160 m: El Metro (`VC.CG` y trozos), EnCicla (16 × 10 m) y Motor City (losas). 250 m no es múltiplo de la casilla de 20 m de El Metro (da 12,5). | Propuesta: 160 m (decisión 2). |
| Anchos «jugables» para todo el valle | En laderas (Comuna 13, Santo Domingo y Manrique), las calles reales miden de 4 a 6 m y las manzanas son angostas: la regla B **borra 24.983 casas** (las que quedan con el centro en la vía). | Propuesta: regla híbrida por bioma (decisión 1). |
| Relieve SRTM de 30 m | En los juegos llega a **80 m por muestra**. El SRTM además es un modelo de superficie (en la ciudad mide parte de los techos). El MDT LiDAR CC BY‑SA espera tu decisión de licencia y **no se usa**. | El suavizado a lo largo de las vías se hace sobre el SRTM. |

### Lo que existe y lo que falta del modo carreras (pseudo‑3D)

| Pedido (Subsistema D) | `MC.Arcade` hoy (`js/47-clasicos.js`) |
|---|---|
| Segmentos de largo fijo | ✅ Puntos cada 6 m (200 por cuadro) sobre la calle real o la carretera del planeta |
| Curvas | ✅ Reales (la calle). ❌ No hay pistas diseñadas con perfil de curva. |
| Colinas | ✅ Con la cota real del MC4. ❌ No hay colinas cosenoidales diseñadas. |
| Recorte `maxY` y sprites que asoman | ✅ Correcto por pintor. ❌ Pinta de más: cada segmento pinta una franja de pasto de todo el ancho, y son unas mil figuras por cuadro. |
| Rivales | ✅ En 🏁 Carreras, 3 rivales con IA sobre las calles (`60-modos.js`), dibujados como tráfico |
| Parallax | ⚠️ Dos capas de montañas que siguen el rumbo; ❌ falta la de la ciudad y la reacción a `camY` |
| Sprites del jugador | ⚠️ Giro y freno; ❌ faltan subida, bajada, giro brusco y la vibración en la berma |
| Nitro, rebufo, FOV dinámico y minimapa de pista | ❌ El FOV es fijo: unos 58° con el celular de pie y 71° acostado (el prompt pide de 100° a 116°). Con un FOV tan estrecho, la orilla de la vía corre más despacio por la pantalla, y por eso **se siente menos la velocidad**. |
| Circuitos *Subida a Las Palmas* y *Autopista Regional Nocturna* | ❌ |

---

## 5. Pedido contra lo que existe (Subsistema B, cenital)

Solo se anota lo verificado en el código. «—» es «no verificado».

| Pedido | El Metro | EnCicla | Motor City |
|---|---|---|---|
| Extrusión 2.5D | 2D oblicua constante; 3D con perspectiva real | 2D con volumen; 3D WebGL | 2D única; 3D WebGL y three.js |
| Sombreado direccional | ✅ Sol según la hora (`G3.sun`) | ✅ | ✅ Luz física (4.9) |
| Contorno tipo cómic (*cel-shading*) | — | — | ✅ Historieta (G5‑01) |
| Sombras proyectadas | ✅ En 2D | ✅ | ✅ |
| Sombra de contacto | — | ✅ Elipse bajo cada sprite (`blit`) | — |
| *Occluder fade* | ❌ (capturas) | ❌ | ✅ Rayos X |
| Cámara con resorte, adelanto y zoom por velocidad | ✅ (`min(1, dt·k)` es casi `1 − e^(−k·dt)`; a 15 cps da 0,27 contra 0,23) | ⚠️ Ángulos y pellizco | ✅ |
| Agarre lateral por superficie | ✅ `VC.agarre` | — | ✅ `MC.Dinamica` |
| La pendiente en la física | ✅ | ✅ La bici va más lenta en subida (`30-ride.js`, línea 97) | ✅ |
| Choque que desliza | ✅ | — | ✅ |
| Objetos livianos que se tumban | — | ✅ Conos y balones (`97-motor30.js`) | ✅ `MC.Objetos` |
| Asistencia de carril | ✅ | — | ✅ Ayuda de esquinas |
| Trozos y descarte por pantalla | ✅ 640, 160 y 80 m | ✅ 160 m | ✅ Losas y sectores |
| Terreno facetado | ❌ Suave (malla de 40 m) | — | — |
| *Tilt-shift* | ❌ (hay niebla) | ❌ (niebla) | — |

---

## 6. Plan detallado de la Fase 1 · Saneamiento GIS

**Nada de esto se hace hasta tu OK.**

### Dónde y con qué reglas
- **Dónde:** en `BicicletasUno/motor-valle/`, la fuente de verdad (regla 1 del `MOTOR.md` del Motor del Valle), copiado a `MetroZero/motor-valle/` con `sincronizar.mjs`.
- **Versión:** del Motor del Valle 1.2.0 a la **1.3.0**.
- **Rama:** `ccr-408a25e1-xz3rl6` en los dos repositorios. Nunca `main`.
- **No se toca ningún `src/js/`.** El recorte en tiempo real de El Metro queda de red de seguridad, y la prueba debe demostrar que ya no corta nada. EnCicla recibe los datos nuevos, pero **no los conecta** todavía: eso es la Fase 3, medida contra la compuerta de rendimiento.

### Archivos nuevos

| # | Archivo | Qué hace |
|---|---|---|
| 1 | `motor-valle/geo/anchos.json` | Ancho del corredor por tipo de vía y por bioma. Guarda las reglas A y B medidas y la **C recomendada**, que es híbrida:<ul><li>en laderas, la vía real + 0,5 m;</li><li>en la ciudad plana, la regla A;</li><li>en avenidas y autopistas, el ancho jugable del prompt.</li></ul>Se ajusta sin tocar código. |
| 2 | `motor-valle/geo/sanear.py` | La **ley de soberanía vial**, en pasos:<ol><li>arma `M_vial` como la unión de buffers de extremos redondos, **solo de capa 0** (los túneles y los puentes no recortan lo de otro nivel);</li><li>arma `M_agua` con el río Medellín y las quebradas de Overture `water`;</li><li>recorta: `B_limpio = B \ (M_vial ∪ M_agua)` (`shapely` 2, vectorizado con `STRtree`);</li><li>quita los pedazos de menos de 16 m² y simplifica con Douglas‑Peucker a ε = 0,6 m;</li><li>si lo recortado sigue siendo un rectángulo (IoU ≥ 0,92), lo vuelve a guardar como rectángulo, para no inflar el peso;</li><li>saca `zMin` y `zMax` bajo los vértices y `zBase = zMin − 6 m`;</li><li>asigna el bioma por celda (`centro`, `ladera_ladrillo`, `residencial_verde`, `industrial_rio`, `rural_montana` y, en Turno Cero, `costa`), con la tabla de zonas que ya usa El Metro (`VC.ZC` y `VC.ZM`), el uso del suelo y la altura;</li><li>indexa por trozos de 160 m (o de 250 m, según la decisión 2);</li><li>escribe `geometry-conflicts.geojson` con cada caso dudoso, su fuente y su severidad.</li></ol> |
| 3 | `motor-valle/geo/rasante.py` | **La cota de las vías:**<ol><li>muestrea el relieve cada 5 m;</li><li>lo suaviza a lo largo de cada vía (gaussiano, σ ≈ 25 m);</li><li>pone una sola cota en cada nodo, el promedio de las vías que llegan, y vuelve a suavizar con los nodos fijos;</li><li>calcula la pendiente `g` de cada tramo, con un tope por clase;</li><li>toma la capa (−1, 0, 1 o 2) y las rampas de `alturas.py` y `pasos.py`, que ya existen.</li></ol> |
| 4 | `motor-valle/pruebas/geometria.mjs` | Prueba sin dependencias que corre en CI. Lee los datos **exportados**, como el juego, y comprueba:<ul><li>0 edificios de capa 0 que pisen un corredor de capa 0 (> 0,05 m²);</li><li>0 fragmentos de menos de 16 m²;</li><li>0 casas en el agua;</li><li>el **presupuesto de peso**: `edificios.js` ≤ 4,6 MB y el HTML de El Metro ≤ 9,5 MB.</li></ul>Sale de la herramienta de esta fase. |
| 5 | `motor-valle/pruebas/geometria.py` | La misma prueba, exacta con polígonos (`shapely`), para correrla a mano. |

### Archivos que cambian

| # | Archivo | Qué cambia |
|---|---|---|
| 6 | `motor-valle/motor.mjs` | El subcomando `sanear` y su paso dentro de `encicla` y `elmetro` |
| 7 | `motor-valle/MOTOR.md`, `capas/index.mjs` y `VERSION.json` | La capa nueva, el contrato y el historial de la 1.3.0 |
| 8 | `MetroZero/tools/edificios_datos.py` | Escribe `edificios.js` **v2**, compatible con el formato actual (el lector de hoy lo sigue leyendo). Suma un flujo opcional de zócalo y la marca de «recortado». |
| 9 | `MetroZero/src/data/edificios.js` y `vias.js` | Regenerados (solo datos) |
| 10 | EnCicla | `src/data/edificios.bin` (huellas saneadas a 10 m) y la cota en `vias.bin`, **sin conectarlos** |

### Fuente
Recomiendo **rehacer desde Overture** con `motor.mjs fuentes` (unos 190 MB, alcanzables aquí). Así se recortan los **polígonos originales** y no los rectángulos que ya guardó El Metro (que inflan los conflictos).

### Hecho cuando…
- `geometria.mjs` da **0 solapes** de capa 0 y el peso queda dentro del presupuesto;
- `node tools/test.mjs 100` de El Metro da 0 errores, y `node tests/run.js` de EnCicla queda en verde;
- un contador de prueba (sin cambiar el juego) muestra que `VC.recorta` **corta 0 edificios** en 50 regiones de muestra;
- `sincronizar.mjs --verificar` dice que las dos copias son iguales;
- hay un informe antes y después con las mismas cifras del § 3.

### Después (resumen; cada fase se detiene a pedir tu OK)

| Fase | Qué |
|---|---|
| 2 | **El Metro y EnCicla**, con bandera por modo:<ul><li>*occluder fade* (el techo que tapa al jugador baja a 0,30, sin esconder los puentes enteros);</li><li>reemplazar las cajas de relleno del anillo lejano por los edificios reales simplificados;</li><li>zócalos en ladera con `zBase`;</li><li>terreno facetado por cota;</li><li>sombra de contacto igual en todos los vehículos;</li><li>*tilt-shift* en el 12 % de arriba.</li></ul>**Motor City:** el mismo saneamiento en `geo/territorio.py`, y quitar la tolerancia de 1 m en `32-fisica.js`. |
| 3 | Conectar en El Metro (Ciudad Libre y Bus) y en EnCicla (modo libre y, si tú decides, los oficios). La compuerta p95 de EnCicla se mide antes y después. |
| 4 | `MC.Pista` (`js/47b-pista.js`), con la técnica clásica:<ul><li>curva acumulada (`x += dx; dx += curva`);</li><li>colinas cosenoidales;</li><li>pasada de cerca a lejos con `maxY` (pinta menos que hoy);</li><li>sprites de lejos a cerca recortados por `clip`.</li></ul>Además: rivales, rebufo (< 15 segmentos), nitro con FOV de 100° a 116°, tres capas de parallax del Valle y los dos circuitos. Reusa `carroAtras` y `cieloRetro` de `MC.Arcade`, que sigue para la calle real. |
| 5 | **En Turno Cero**, el selector de «cápsulas» ya existe: `G.Modos.DEF` (carrera, extremo, mandados, encicla, tren, run, trucos y lab, en `60-modos.js`). Se suma la entrada 🏎️ *Carreras retro*, con controles táctiles, y se mide a 60 cps. |

---

## 7. Decisiones que necesito del autor

> **✅ Respondidas por el autor el 24‑nov‑2026:**
> 1. el ancho **real** (regla A, con las ciclorrutas incluidas);
> 2. trozos de **160 m**;
> 3. EnCicla: **solo el modo libre**;
> 4. El Metro: **Ciudad Libre y Bus**;
> 5. «**la opción que pruebe que la ciudad será bien craqueada**»: rehacer desde las fuentes originales, con la prueba de craqueo (geometría exacta, área conservada, fidelidad contra OSM, conflictos y capturas).
>
> El detalle está en el § 3 y el § 4 de `docs/PROMPT-RELEVO.md`. Lo que sigue es el texto original de las preguntas.

1. **Regla de anchos:**
   - A, la vía real + andén (la de hoy): toca a 18,8 % de las casas;
   - B, los anchos jugables del prompt: 23,7 %, y borra 24.983 casas;
   - **C, híbrida por bioma (la recomiendo):** conserva las calles angostas de las laderas y ensancha las avenidas.
2. **Tamaño de los trozos:** **160 m**, alineado con los tres cachés (lo recomiendo), o 250 m, como dice el prompt.
3. **EnCicla:** ¿el cenital nuevo para **todos los oficios que lo usan** (Usuario, Apoyo, Técnico, Balance y Supervisor; su lógica no cambia) o **solo en el modo libre**, con bandera?
4. **El Metro:** ¿el render nuevo también se ve en los modos protegidos que dibujan la misma ciudad (vista superior de Conducir, Volante, Carrera, viaje en Metrocable y mapa) o **solo en Ciudad Libre y Bus**, con bandera?
5. **Fuente de la Fase 1:** **rehacer desde Overture** (polígonos exactos; lo recomiendo) o sanear solo lo ya exportado (más rápido, pero menos exacto).

También confírmame que **Turno Cero se queda solo en `motorcity`**. Lo que el prompt llama «laboratorio en MetroZero» no existe, y la regla 18+ lo impide.

---

## 8. Riesgos que dejo anotados

| Riesgo | Qué puede pasar | Cómo se maneja |
|---|---|---|
| **Peso** | Cada casa recortada que deja de ser rectángulo suma bytes. | El reajuste a rectángulo (IoU ≥ 0,92) y un presupuesto que la prueba exige. |
| **Identidad de barrio** | Una regla ancha y pareja vuelve irreconocibles las laderas. | Por eso la regla C. |
| **Calle desplazada** | A veces la desplazada es la calle (OSM contra huellas de satélite). | El GeoJSON de conflictos, para revisar en vez de borrar. |
| **Compuerta de EnCicla** | Más polígonos reales pueden subir el costo de dibujo. | Se mide en la Fase 3 antes de conectar. Si empeora, se queda con lotes y bandera. |
| **Licencias** | — | Solo Overture/OSM (ODbL), las capas oficiales ya usadas y SRTM. El catastro nuevo (R3) y el LiDAR (R5) siguen esperando tu decisión. |
