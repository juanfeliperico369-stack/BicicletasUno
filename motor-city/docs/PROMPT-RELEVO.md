# Prompt de relevo · «Renacimiento cenital»: las cinco fases están hechas y publicadas (24/25‑nov‑2026)

> **Cópialo entero a la IA que siga:** otra sesión de Claude, ChatGPT/Codex, Gemini/Antigravity, Cursor o cualquier otra.
> Lo escribió Claude al cerrar la Fase 0 y lo puso al día al cerrar las fases 1 a **5** (24/25‑nov). El detalle está en:
> - `docs/AUDITORIA-FASE0-CENITAL.md` (la auditoría y el plan por archivo);
> - `reportes/2026-11-24-claude-fase1-cenital.md` (la Fase 1: qué se hizo, la prueba de craqueo y las decisiones que esperan al autor);
> - `reportes/2026-11-24-claude-fase2-cenital.md` (la Fase 2: el cenital con bandera en El Metro y EnCicla, y los mundos saneados de Motor City 5.3.2);
> - `reportes/2026-11-25-claude-fase3-cenital.md` (la Fase 3: la bandera encendida, El Metro 3.9.0, EnCicla 3.9.0 con las huellas reales y el Motor del Valle 1.3.1);
> - `reportes/2026-11-25-claude-fase4-pista.md` (la Fase 4: `MC.Pista`, las carreras retro pseudo‑3D, y «🏎️ Carreras retro» en Turno Cero; Motor City 5.4.0);
> - **`reportes/2026-11-25-claude-fase5-capsulas.md` (la Fase 5: las cápsulas, 🧰 el garaje y 📏 de las carreras en el celular; Motor City 5.4.1; trae la tabla de las cinco fases)**;
> - `reportes/2026-11-24-claude-fase0-cenital.md` (la línea base);
> - `CONTEXTO-RELEVO.md` (§ 5, fila 18, y § 8).
>
> El prompt anterior (5.3.0) queda en la historia de git.

---

Vas a continuar **Motor City**: un motor de juegos en un solo HTML, sin internet, con mapas reales de Medellín, el Valle de Aburrá, Guatapé y Nueva York, y sus juegos.

**Tu trabajo nuevo es el «renacimiento cenital» que pidió el autor:**
- sanear el mapa del Valle (que ningún edificio quede encima de una calle);
- un cenital 2.5D/3D bello y legible en El Metro y en Juega EnCicla;
- un modo de carreras retro pseudo‑3D en Turno Cero.

La Fase 0 (auditoría y línea base), la **Fase 1 (el Valle saneado, Motor del Valle 1.3.0)** y la **Fase 2 (el cenital nuevo con bandera en El Metro y EnCicla; Motor City 5.3.2 con los mundos saneados)** ya están hechas, y también la **Fase 3** (la bandera encendida: El Metro 3.9.0 en Ciudad Libre y Bus, y EnCicla 3.9.0 en el modo libre, con las huellas reales del Motor del Valle 1.3.1). El autor aprobó la Fase 1 («ok, aprobado, haz lo mejor, inicia») y pidió seguir con las fases siguientes. La **Fase 4** también está hecha (`MC.Pista` en `js/47-pista.js` y «🏎️ Carreras retro» en Turno Cero; Motor City 5.4.0). La **Fase 5** también está hecha (🧰 Garaje y colección, el paso entre cápsulas con el mismo estado y 📏 de las carreras retro; Motor City 5.4.1). **Todo quedó publicado el 25‑nov** (el autor pidió «entregame todos los html, apk y links actualizados»): las ramas entraron a `main` (PR motorcity #32, BicicletasUno #4, MetroZero #6 y RunRunZero #2), las páginas están al día y las APK en sus releases. **El Metro salió como 3.10.0** (versionCode 38): une la 3.9.0 «Unido y medido» de otra sesión (rama `ccr-2a67f935-oat714`, que estaba publicada y no en `main`) con el cenital. Falta medir en el celular del autor con 📏.

| Juego | Página | APK |
|---|---|---|
| Juega EnCicla 3.9.0 | https://juanfeliperico369-stack.github.io/BicicletasUno/ | https://github.com/juanfeliperico369-stack/BicicletasUno/releases/tag/v3.9.0 (y `descargas/JuegaEnCicla.apk` en la página) |
| El Metro 3.10.0 | https://juanfeliperico369-stack.github.io/MetroZero/ | https://github.com/juanfeliperico369-stack/MetroZero/releases/tag/v3.10.0 (y `el-metro.apk` en la página) |
| Turno Cero, Motor City 5.4.1 | https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/getaway.html (Mandados: `…/mandados.html`; el banco: `…/dist/motor-city.html`) | https://github.com/juanfeliperico369-stack/motorcity/releases/tag/v5.4.1 |
| Run Scooter 2.5.0 (no cambió) | https://juanfeliperico369-stack.github.io/RunRunZero/ | https://juanfeliperico369-stack.github.io/RunRunZero/RunScooter.apk |
 Cada fase termina con pruebas en verde; publicar (APK y páginas) y pasar a `main` siguen esperando el OK del autor. Nada de lo que ya funciona se puede romper.

## La misión y la visión (no se distorsionan)
Están completas en `docs/VISION-Y-MISION.md`. **Solo el autor las cambia.**

| Qué | Misión | Visión |
|---|---|---|
| **Motor City** | Convertir cualquier lugar real o inventado en un mundo jugable con leyes reales, en un solo HTML y sin internet | Que se sienta como los grandes mundos abiertos por su contenido, su sensación y sus herramientas, no por los polígonos. Separa la verdad geográfica, la física y la visual; un solo mundo y muchas cámaras; la cenital es la principal del mundo libre. |
| **Motor del Valle** | Ser la única tubería del mapa real del Valle para EnCicla y El Metro | Un Valle **bien craqueado y demostrado**: ninguna casa sobre la calle ni sobre el agua, laderas con zócalo, vías con su pendiente y su nivel, trozos de 160 m |
| **Juega EnCicla** (familia) | Que todas las edades conozcan y quieran EnCicla jugando el trabajo de su gente: 9 oficios, 27 turnos y revista pixel | Un modo libre donde se sienten las lomas y se leen las ciclorrutas, con el cenital nuevo **solo ahí** |
| **El Metro** (familia) | Que cualquier persona conozca, use y quiera el Metro y la ciudad de Medellín jugando, con la «Cultura Metro» | El gran mundo abierto sobre Medellín y su Metro: una ciudad fiel y viva, sin internet. El cenital nuevo va **solo en Ciudad Libre y Bus**. |
| **Turno Cero** (18+) | El juego de prueba con todo el motor: un *thriller* de conducción en un planeta (Nueva York, el Valle y Guatapé) | Un gran arcade de conducción en cápsulas (mundo abierto cenital, carreras retro pseudo‑3D, garaje, motos y aire). Solo en `motorcity`. |
| **Run Scooter** (familia) | Un corredor sin fin por la ciclovía, con la estética de EMSAY | Sigue como juego propio y como «Run en la ciclovía». No entra en este trabajo. |

## 0. Dónde está el trabajo
- **La Fase 0, las decisiones y la primera versión de este prompt están en `main` de `motorcity`.**
- **Las cinco fases están en la rama `ccr-4f6eeea5-yulqk1` de `BicicletasUno`, `MetroZero` y `motorcity`** (la de este prompt; la Fase 1 de `motorcity` ya se unió a `main` con el PR #31). Pasan a `main` solo con el OK del autor.
  - Si el autor ya la unió, haz `git pull` en `main`.
  - Si no, parte de esa rama en los tres repositorios:

    `git fetch origin ccr-4f6eeea5-yulqk1 && git checkout -b <tu-rama> origin/ccr-4f6eeea5-yulqk1`
- **Trabaja en tu rama** en cada repositorio que toques: `ia/<tu-agente>/renacimiento-faseN`, o la que te asigne tu entorno.
  - A `main`, solo en avance rápido, con las pruebas en verde **y con el OK del autor**.
  - Nunca `push --force`.
  - No abras un pull request si el autor no lo pide.
- **Si no tienes los repositorios:** `git clone https://github.com/juanfeliperico369-stack/<repo>`. Los cuatro de la tabla son de la misma cuenta.

## 1. Los repositorios

| Repositorio | Qué es | Versión | Compilar | Probar |
|---|---|---|---|---|
| `motorcity` | El motor y **Turno Cero** (`juegos/getaway/`, 18+). Sus mundos MC4 salen de `geo/territorio.py` (saneado desde la 5.3.2) y de `herramientas/fusionar.mjs` (Medellín). | 5.3.2 | `node herramientas/construir.mjs` | `node pruebas/prueba.mjs --navegador` y la lista de `.github/workflows/motor-city-qa.yml` |
| `BicicletasUno` | **Juega EnCicla** (familia) y la **fuente de verdad del Motor del Valle** (`motor-valle/`, la tubería de datos del mapa, 1.3.0) | 3.8.0 | `node tools/build.js` | `node tests/run.js`, `node tests/regresion-encicla.js` y la compuerta `node tests/benchmark-2km-gpt6.mjs --cpu=4 --assert` |
| `MetroZero` | **El Metro** (familia), con una copia del Motor del Valle y capas propias en `tools/` | 3.8.0 | `node tools/build.mjs` | `node tools/test.mjs 100` (0 errores); al terminar, `node tools/todo.mjs` |
| `RunRunZero` | Run Scooter (familia). **No entra en este trabajo.** | — | `node tools/build.mjs` | `node tools/sim.mjs 100 240` |

**Comandos del Motor del Valle** (desde la raíz de BicicletasUno; la copia de MetroZero funciona igual):

| Comando | Qué hace |
|---|---|
| `node motor-valle/motor.mjs fuentes` | Baja las fuentes: Overture `2026-10-21.0`, las capas oficiales y el relieve SRTM. Ocupan unos 190 MB en `motor-valle/geo/cache/` y **no se suben**. |
| `node motor-valle/motor.mjs encicla [RUTA_ELMETRO]` | Datos de EnCicla, en casillas de 10 m |
| `node motor-valle/motor.mjs elmetro ../MetroZero` | Datos de El Metro, en casillas de 20 m |
| `… --prueba` | Deja la salida en `motor-valle/salida/` sin tocar los juegos |
| `node motor-valle/sincronizar.mjs ../MetroZero [--verificar]` | Copia el motor al otro juego, o solo compara las dos copias |

- **Requisitos:** `pip install duckdb shapely numpy pillow pyarrow` y Node 22.
- **Detrás de un proxy:** `env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY python3 …`

## 2. Lee primero, en este orden
1. `CONTEXTO-RELEVO.md` del motor: el § 0, el § 5 (fila 18), el § 7 y las últimas entradas del § 8.
2. **`docs/AUDITORIA-FASE0-CENITAL.md`, entero.** Tiene:
   - qué dibuja el mapa en cada juego;
   - cómo se generan los datos y cómo se compila cada HTML;
   - los modos protegidos;
   - lo que los documentos suponían y no era así;
   - el plan por archivo de la Fase 1 y las decisiones del autor.
3. **El pedido:** `docs/referencias/renacimiento-cenital-2026/MASTER-PROMPT-VALLE-CITY-TURNO-CERO.md`, con su especificación en `docs/investigacion_tecnica_motor_valle.md`. Como apoyo, el `INFORME-MAESTRO-…` y el `PROMPT-MAESTRO-…` de GPT‑6, en la misma carpeta.
4. `reportes/2026-11-24-claude-fase0-cenital.md`: la línea base y cómo se midió.
5. `BicicletasUno/motor-valle/MOTOR.md`, el contrato del Motor del Valle. Su regla 1: «el mapa solo se cambia aquí».
6. El `CLAUDE.md`, `AGENTS.md` o `GEMINI.md` de cada repositorio que toques, y sus skills:
   - `motor-city-territorio`, `motor-city-desarrollo` y `motor-city-qa-playwright`;
   - en El Metro, `el-metro-desarrollo`, `medellin-fiel` y `el-metro-calidad-movil`.
7. **Integra las skills antes de trabajar,** con `docs/PROMPT-SKILLS.md`:
   - en el motor, `node motor.mjs skills --integrar --agente <tu-agente>`;
   - en un juego hermano, `node motor-city/motor.mjs skills --integrar …`.

   Deja la línea «4) Verificación» en tu informe.

## 3. Las decisiones del autor (tomadas el 24‑nov; no las vuelvas a preguntar)
Están anotadas en `CONTEXTO-RELEVO.md` § 8 y en el § 7 de la auditoría.

| # | Decisión | Lo que decidió el autor | Qué significa en la práctica |
|---|---|---|---|
| 1 | Ancho de los corredores viales | **El real** (regla A) | La vía con su ancho real (el de la malla vial oficial, o su clase si no lo tiene) + 1,3 m en las de carros y + 0,3 m en peatonales, escalas **y ciclorrutas**. Hoy el juego no despeja las ciclorrutas; en EnCicla eso importa. Las reglas B («jugable») y C (híbrida) quedan escritas en `anchos.json`, pero **apagadas**. |
| 2 | Tamaño de los trozos | **160 m** | El mismo de los tres cachés, con la clave `"cx,cy"` y `c = ⌊x/160⌋`. |
| 3 | EnCicla: ¿dónde va el render nuevo? | **Solo en el modo libre** | Va con bandera. Los 9 oficios (incluidos los cenitales: Usuario, Apoyo, Técnico, Balance y Supervisor), los turnos y los minijuegos siguen con el render de hoy. |
| 4 | El Metro: ¿dónde va el render nuevo? | **En Ciudad Libre y Bus** | Va con bandera. Los demás modos que dibujan la misma ciudad (Conducir, Volante, Carrera, Metrocable, el mapa y el álbum) se quedan como están. |
| 5 | Fuente de la Fase 1 | **«La opción que pruebe que la ciudad será bien craqueada»** | **Rehacer desde las fuentes originales** (Overture, las capas oficiales y SRTM, con `motor.mjs fuentes`) y **demostrarlo con la prueba de craqueo** de la Fase 1. Es la única opción que se puede comprobar contra los polígonos de origen. |
| 6 | ¿Turno Cero solo en `motorcity`? | **Sí** (es regla) | Es 18+ y nunca entra a los juegos de familia. |

### Decisiones nuevas que esperan al autor (salieron de medir en la Fase 1; detalle en el informe de la Fase 1)
| # | Pregunta | Lo que se midió |
|---|---|---|
| 7 | **Las casas confiables en El Metro.** La verdad compartida conserva las 44.538 casas de OSM que chocan con calles menores (decisión: no se recortan), pero el recorte en tiempo real de El Metro exige 1,3 m de andén. Su exportación las recorta (38.761) o las quita (4.038) para que el juego no corte nada. | Propuesta: en la Fase 2, con la bandera de Ciudad Libre y Bus, que el juego respete las marcadas («andén angosto») y re‑exportar sin recortarlas. |
| 8 | **¿Vías precisas en El Metro?** `vias.js` sigue con los ejes redondeados a 2,5 m: se corren hasta ~3 m del eje real. | Con ejes de 1 m, unos +230 KB; se salvarían unas 3.283 casas que la guarda hoy quita. |
| 9 | **El ancho por fachadas** (`anchos.json` · `ancho_por_fachadas`, apagado) | Angosta 4.079 calles menores sin ancho oficial; las casas marcadas bajan de 42.979 a 34.132. |
| 10 | **La cota dentro de `vias.js`** (+366 KB, como pedía el prompt) **o aparte** (como en EnCicla) | Al HTML de El Metro le quedan 146 KB hasta 9,5 MB. |
| 11 | **Refrescar el mapa base** con la descarga de hoy | Cambian los bordes (0,96 % de las casillas, en Caldas y Barbosa). |

**No las decidas tú:** pregúntalas en tu informe si tu fase las necesita.

## 4. Lo que debes hacer, fase por fase
**En cada fase:**
1. corre la batería;
2. deja el informe con el formato de lote (§ 8);
3. **detente a pedir el OK** antes de seguir.

### ✅ Fase 1 · Saneamiento GIS en `motor-valle/` · HECHA (Claude, 24‑nov; aprobada por el autor)
**Resultado:** todo en verde. Detalle en `reportes/2026-11-24-claude-fase1-cenital.md`.

| Qué | Antes | Después |
|---|---|---|
| Recorte en tiempo real de El Metro (4.731 regiones) | 107.546 recortados y 17.190 quitados | **0 y 0** |
| Herramienta de la Fase 0 (regla A) | 120.187 edificios pisan la vía | 5 (de menos de 0,3 m² cada uno) |

- **Verdad compartida:**
  - el 98,45 % del área construida;
  - 9.864 casas desaparecen;
  - 44.538 conflictos en GeoJSON.
- **Pesos:** `edificios.js` de 4.572.134 bytes y HTML de El Metro de 9.353.904 bytes.
- **Juegos:**
  - El Metro: 100 partidas, 0 errores;
  - EnCicla: 177 ✓, con su HTML idéntico.

**Lo que dejó y cómo se usa:**

| Herramienta | Para qué |
|---|---|
| `node motor-valle/motor.mjs fuentes` y luego `sanear` | Rehace la verdad compartida en `motor-valle/salida/sanear/`: `huellas.parquet`, `agua.*`, `geometry-conflicts.geojson`, `biomas.json`, `trozos.json`, `vias_m.bin`, `rasante.bin` e `informe.json`. Termina con `pruebas/geometria.py`. |
| `geo/anchos.json` | La regla (A activa) y todos sus números |
| `geo/sanear.py`, `geo/niveles.py`, `geo/rasante.py` y `geo/huellas.py` | El saneamiento, las capas, la cota y la exportación a EnCicla |
| En El Metro: `node tools/build.mjs && node tools/corredores.mjs` | Los corredores que despeja el juego |
| `python3 tools/edificios_datos.py tools/cache/edificios --saneadas ../BicicletasUno/motor-valle/salida/sanear` (antes, `--descargar tools/cache/edificios`) | `edificios.js` v2, con la guarda |
| `python3 motor-valle/geo/rasante.py --elmetro ../MetroZero` y `node tools/vias_datos.mjs --cota …/cota-elmetro.bin` | La cota |
| `node tools/prueba-recorte.mjs [--todas]` | Lo que recorta el juego: debe ser 0 y 0 |
| `node ../BicicletasUno/motor-valle/pruebas/geometria.mjs --elmetro .` | Los datos como los lee el juego, con el peso |

**Lo que pedía (queda como referencia):**
- **Dónde:** en `BicicletasUno/motor-valle/` y, con `sincronizar.mjs`, en `MetroZero/motor-valle/`.
- **Versión:** del Motor del Valle 1.2.0 a la 1.3.0.
- **Antes de tocar `motor-valle/`, `MetroZero/tools/edificios_datos.py` o `MetroZero/src/data/`, avisa en `coord/buzon/`.**

**Archivos nuevos:**

| # | Archivo | Qué hace |
|---|---|---|
| 1 | `motor-valle/geo/anchos.json` | **La regla activa es la A, «el real»** (decisión 1): la vía real + 1,3 m en las de carros, y + 0,3 m en peatonales, escalas y ciclorrutas. Tipos: 1 calle, 2 avenida, 3 autopista, 4 carrera, 5 ciclorruta, 6 peatonal y 7 escalas.<br>Quedan escritas, pero apagadas:<ul><li>**B**, la jugable (ancho + andén): autopista 22 + 3, avenida 15 + 2,5, carrera 11 + 2, calle 8,5 + 1,5, ciclorruta 3,5 + 0,8, viaducto 10 + 2;</li><li>**C**, la híbrida.</li></ul>Se ajusta sin tocar código. |
| 2 | `motor-valle/geo/sanear.py` | La ley de soberanía vial, en pasos:<ol><li>`M_vial`: la unión de buffers de extremos redondos (`w/2 + andén`), **solo de capa 0** (los túneles y los puentes no recortan lo de otro nivel);</li><li>`M_agua`: el río Medellín y las quebradas;</li><li>el recorte: `B_limpio = B \ (M_vial ∪ M_agua)`, con `shapely` 2 y `STRtree`;</li><li>quita los pedazos de menos de 16 m² y simplifica con Douglas‑Peucker a ε = 0,6 m;</li><li>si lo recortado sigue siendo un rectángulo (IoU ≥ 0,92), lo guarda otra vez como rectángulo, para no inflar el peso;</li><li>saca `zMin` y `zMax` bajo los vértices y `zBase = zMin − 6 m`;</li><li>asigna el bioma por celda (`centro`, `ladera_ladrillo`, `residencial_verde`, `industrial_rio` y `rural_montana`; en Turno Cero, también `costa`), con la tabla de zonas de El Metro (`VC.ZC` y `VC.ZM`), el uso del suelo y la altura;</li><li>indexa por trozos de **160 m** (decisión 2) con la clave `"cx,cy"`;</li><li>escribe **`geometry-conflicts.geojson`**: cuando una casa confiable (un polígono de OSM o del Catastro) choca con una calle menor, **no la recorta: la marca para revisar**, con su fuente y su severidad (< 0,3, de 0,3 a 2 o > 2 m²; si tapa una vía crítica o la entrada de una estación, es crítica).</li></ol> |
| 3 | `motor-valle/geo/rasante.py` | La cota de las vías:<ol><li>muestrea el relieve cada 5 m;</li><li>lo suaviza a lo largo de cada vía (gaussiano, σ ≈ 25 m);</li><li>pone una sola cota en cada nodo (el promedio de las vías que llegan) y vuelve a suavizar con los nodos fijos;</li><li>calcula la pendiente `g` de cada tramo, con un tope por clase;</li><li>toma la capa (−1, 0, 1 o 2) y las rampas de `alturas.py` y `pasos.py`, que ya existen.</li></ol> |
| 4 | `motor-valle/pruebas/geometria.mjs` | Prueba en Node, sin dependencias. Parte de `motorcity/reportes/fase0-cenital/medir-conflictos-elmetro.mjs`, que ya decodifica los datos como el juego. Comprueba:<ul><li>0 edificios de capa 0 que pisen un corredor de capa 0 (> 0,05 m²);</li><li>0 fragmentos de menos de 16 m²;</li><li>0 casas en el agua;</li><li>el peso: `edificios.js` ≤ 4,6 MB y el HTML de El Metro ≤ 9,5 MB.</li></ul> |
| 5 | `motor-valle/pruebas/geometria.py` | La misma prueba, exacta con polígonos (`shapely`) |

**Archivos que cambian:**

| # | Archivo | Qué cambia |
|---|---|---|
| 6 | `motor-valle/motor.mjs` | El subcomando `sanear` y su paso dentro de `encicla` y `elmetro` (con `--prueba`, a `salida/`) |
| 7 | `motor-valle/MOTOR.md`, `capas/index.mjs` y `VERSION.json` | La 1.3.0, con su historial |
| 8 | `MetroZero/tools/edificios_datos.py` | Lee las huellas saneadas y escribe un `edificios.js` **compatible**: los flujos nuevos (zócalo `zb`) van **al final** del binario, porque el lector de `11-edificios.js` solo usa los seis primeros de `len`; el bit 128 del byte de uso marca «recortado», porque hoy se leen los bits 1 a 64; y `v: 2`. |
| 9 | `MetroZero/src/data/edificios.js` y `vias.js` | Regenerados. La cota y la pendiente de las vías van en un flujo aparte al final, que el lector actual no lee. |
| 10 | EnCicla | `src/data/edificios.bin` (huellas saneadas en la escala de 10 m) y la cota de `vias.bin`, **sin conectarlos** (eso es la Fase 3) |
| 11 | Las dos copias | `node motor-valle/sincronizar.mjs ../MetroZero` y luego `--verificar` |

**Hecho cuando…**
- `geometria.mjs` da 0 solapes y el peso queda dentro del presupuesto;
- `medir-conflictos-elmetro.mjs` pasa de 120.187 edificios a casi 0 con la regla A;
- `node tools/build.mjs && node tools/test.mjs 100` da 0 errores en El Metro, y `node tools/build.js && node tests/run.js` queda en verde en EnCicla;
- una prueba con Playwright (que no cambia el juego) muestra que `VC.recorta` **corta 0 edificios** en 50 regiones de muestra (tras `VC.region`, cuenta los `b.cut === 1` y los `b.rec === false`);
- las dos copias del Motor del Valle quedan iguales;
- hay un informe antes y después, con las mismas cifras de la Fase 0;
- y pasa la **prueba de craqueo** (decisión 5), con los datos rehechos desde las fuentes originales:

  | # | Prueba | Qué exige |
  |---|---|---|
  | a | **Geometría exacta** | `geometria.py` sobre los polígonos de origen: 0 solapes de capa 0 |
  | b | **Geometría en el juego** | `geometria.mjs` sobre lo exportado, leído como lo lee el juego: también 0 solapes |
  | c | **Se conserva la ciudad** | Queda al menos el 97 % del área construida (hoy la regla A invade el 2,6 %). Se informa cuántas casas desaparecen: solo los restos de menos de 16 m², muchas menos que las 12.267 que hoy borra el juego en tiempo real. |
  | d | **Fidelidad contra OSM** | Se repite la auditoría del 17‑nov de El Metro (`tools/osm_comparar.py` y `tools/auditoria-mapa.mjs`, en las mismas zonas). Nada baja de lo que había:<ul><li>Centro · San Antonio: 100 % de las calles de OSM a ≤ 20 m, 99,9 % de las vías del juego en OSM y 214 de 214 tramos con nombre;</li><li>Niquía: 98 %, 99,6 % y 62 de 62;</li><li>Santo Domingo Savio: 100 %, 99,5 % y 181 de 181.</li></ul> |
  | e | **Conflictos revisados** | `geometry-conflicts.geojson` con cada caso dudoso, sin recortar las casas confiables |
  | f | **Capturas** | Antes y después en 6 zonas piloto: Centro/La Candelaria, Laureles, El Poblado, ladera nororiental, corredor del río y viaducto, y una zona rural |

### ✅ Fase 2 · Render cenital (El Metro y EnCicla con bandera por modo; Motor City) · HECHA (Claude, 24/25‑nov)
**Resultado:** todo en verde, con la bandera **apagada**. Detalle en `reportes/2026-11-24-claude-fase2-cenital.md`.
- **El Metro:** `src/js/97d-cenital.js`. La bandera vive mientras dibujan Ciudad Libre o Bus; se prueba con `?cenital`, Ajustes → «🛰 Cenital nuevo» o `EM.cenital.forzar`. `22-gl.js` se partió en funciones (`edifCerca`, `arboles3D`, `hitos3D`, `puentes3D`) sin cambiar lo que dibuja: con la bandera apagada las mallas son idénticas a las de antes.
  - Las pruebas: `tools/prueba-cenital.mjs` (jugador visible, 0 cajas de relleno, `--huella --contra` para las mallas), `tools/rendimiento-cenital.mjs` (p95 A/B) y `tools/prueba-rutas.mjs` (la de la Fase 3, adelantada: las rutas A\* no cruzan ningún edificio saneado).
- **EnCicla:** `src/js/99y-cenital.js`, solo con `mode.free`. Se prueba con `?cenital`, `Save.data.settings.cenital` o `JE.cenital.forzar`; la prueba es `tests/cenital-libre.mjs`. El piso 3D de EnCicla es plano: no hay zócalos ni facetas que hacer.
- **Motor City 5.3.2:** `geo/territorio.py` saneado; los tres mundos regenerados con su agua y su PVS; la colisión ya no tiene la tolerancia de 1 m; prueba nueva `pruebas/calles-libres.mjs` (en `motor-city-qa.yml`).

**Lo que dejó la Fase 2 para la Fase 3:**
- **Encender:** `PREDETERMINADA = 1` en `MetroZero/src/js/97d-cenital.js` y en `BicicletasUno/src/js/99y-cenital.js`. Las dos ya pasaron sus baterías con la bandera encendida (`test.mjs 100 --url …?cenital` y `tests/run.js` con la predeterminada en 1).
- **El costo medido:** la bruma es una capa CSS (pintada en el lienzo duplicaba la mediana del 2D en SwiftShader). En la compuerta de EnCicla, mírala aparte (variante «encendida sin bruma») si el p95 sube.
- **Las huellas reales en EnCicla:** `src/data/edificios.bin` pesa 4,1 MB (unos 5,5 MB más en el HTML, que hoy pesa 5,7 MB). Va en trozos de 160 m, los mismos de `CityMap.lotes(cx, cy)`, y está en metros (px = m × 1,6). Se cambia solo si la compuerta no empeora.
- **Si tocas la red de El Metro:** los techos de estación llevan `k` + 0,4 y los tableros `k` entero. El sombreado de siempre los pinta igual; el del cenital abre solo los techos.

**Lo que pedía esta fase** (se deja como referencia):
**Lo que dejó la Fase 1 para esta fase:**
- **Zócalos:** el suelo de cada esquina se mide con el relieve del juego (`elevM` en El Metro); `zBase = suelo del centro − max(6 m, lo que baja)`. El flujo `zb` de `edificios.js` v2 solo trae los 4.766 edificios donde el suelo baja más de 4 m desde el centro.
- **Banderas en los datos:** en El Metro, el bit 128 del byte de uso (recortada). En EnCicla, el flujo `marca` (casa confiable y bioma) de `edificios.bin`. El bioma por trozo de 160 m está en `salida/sanear/biomas.json`.
- **Terreno facetado:** la rasante real se aparta del suelo de 80 m entre −7 y +7,4 m (p10 a p90). Si las vías se dibujan con su cota, el terreno debe ajustarse a la rasante (flujo `COTA`), no al revés.
- **Si cambias un corredor** que despeja El Metro (vías, Metroplús, tranvía o hitos), repite `corredores.mjs`, `edificios_datos.py --saneadas` y `prueba-recorte.mjs --todas`. Debe dar 0 y 0.
- **Presupuesto:** al HTML de El Metro le quedan 146 KB hasta 9,5 MB.
- **Pendiente de decisión (7):** si la bandera de Ciudad Libre y Bus deja de recortar las casas marcadas, se re‑exporta sin cortarlas (`edificios_datos.py` tendría que saltarlas en la guarda solo para esos modos: hablarlo con el autor).

⚠️ **En El Metro, el render compartido también dibuja modos protegidos:**
- `MAP.drawTop` lo usan Conducir (vista superior), Volante, Carrera, el mapa y el álbum;
- `G3.draw` lo usan Conducir, Volante, Carrera y el viaje en Metrocable.

En EnCicla, el cenital de `75-graficos.js` es el de cinco oficios. **Todo va detrás de una bandera que se enciende solo en el modo libre de EnCicla y en Ciudad Libre y Bus de El Metro (decisiones 3 y 4)**, en archivos aditivos que envuelven las funciones (el patrón de los dos juegos). Por ejemplo, `MetroZero/src/js/97d-cenital.js` y `BicicletasUno/src/js/99y-cenital.js`; esos nombres hoy están libres.

**En El Metro y en EnCicla:**
1. ***Occluder fade*.** En las capturas de la Fase 0 (Acevedo y San Antonio), el techo de la estación tapa por completo al jugador. Lo que lo tape baja a una opacidad de 0,30, o se dibuja su silueta encima.
   - Nunca se esconde el tablero entero de un puente o del viaducto: se conserva con su sombra y se ve al jugador debajo.
   - Prueba: el jugador siempre visible a 412 × 860.
2. **El anillo lejano de El Metro** (de 700 a 1.100 m, `22-gl.js` · `buildNear`, línea 177): las cajas de relleno por casilla se cambian por los edificios reales simplificados, cuando hay datos.
3. **Zócalos:** los muros bajan hasta `zBase`, para que ninguna casa flote en una ladera.
4. **Terreno facetado** con sombreado plano por bandas de cota, en las laderas altas y en lo rural.
5. **Sombra de contacto** (elipse oscura) bajo todo vehículo, bici y persona, en 2D y en 3D.
6. **Bruma o *tilt-shift*** en el 12 % de arriba de la pantalla.
7. **Cámara:** cambiar `min(1, dt·k)` por `1 − e^(−k·dt)`, para que no dependa de los cuadros por segundo. El adelanto y el zoom por velocidad ya existen: ajústalos jugando. Norte arriba por defecto.

**En Motor City:**
- el mismo saneamiento en `geo/territorio.py` (porta `sanear.py`) y regenerar los mundos MC4;
- con los datos limpios, quitar la tolerancia de 1 m de la colisión en `js/32-fisica.js` (línea 46);
- `node motor.mjs prueba --navegador` y la QA.

**Hecho cuando…**
- hay capturas antes y después en los mismos puntos;
- no queda ninguna caja de relleno sobre una vía;
- las pruebas están en verde;
- el p95 no empeora. En El Metro se mide con `96d-rendimiento.js`; en EnCicla, con la compuerta.

### Fase 3 · Integración y regresión
1. **Encender la bandera:**
   - en El Metro, en Ciudad Libre y Bus;
   - en EnCicla, **solo en el modo libre** (los oficios siguen con el render de hoy).
2. **EnCicla:** cambiar los lotes inventados por las huellas reales **solo si la compuerta no empeora** (mide A/B con `tests/benchmark-2km-gpt6.mjs --cpu=4`). Si empeora, los lotes se quedan detrás de la bandera.
   - Hoy da p95 de 103,7 ms en la Carrera 43A y 61,2 ms en Las Palmas; la meta es menos de 50. **No cambies ni saltes la compuerta sin el autor.**
3. **Regresión:**

   | Juego | Qué se prueba |
   |---|---|
   | El Metro | `node tools/test.mjs 100` (0 errores) y capturas con `--shots` de la cabina, la vista lateral, el Metrocable, la guía y la historia de Rosalba |
   | EnCicla | `node tests/run.js` (los 9 oficios por los turnos, más los minijuegos) y `node tests/regresion-encicla.js` |
   | Rutas | **Una prueba nueva: las rutas A\* (`rutas_calles.js`) no cruzan ningún edificio saneado** |
4. **Versiones:**
   - El Metro: `src/js/00-core.js` y `android/gradle.properties` (`elmetro.versionName` y `elmetro.versionCode`, hoy 36);
   - EnCicla: `src/js/00-core.js` y `app/android/app/build.gradle` (`versionCode`, hoy 30700).
5. **Publicar:** solo con las pruebas en verde y con el OK del autor. La página de EnCicla se publica solo si `publicar.yml` pasa.

### Fase 4 · Carreras retro pseudo‑3D en Turno Cero (solo en `motorcity`)
`MC.Arcade` (`js/47-clasicos.js`) **se queda** para la calle real: proyecta su eje y pinta de lejos a cerca, y las lomas ya tapan bien. Lo nuevo es **`js/47b-pista.js` (`MC.Pista`)**, con la técnica clásica, escrita desde cero (sala limpia: el código abierto de otros sirve de lectura, no se copia).

**La pista:**
- `segments[]` de 200 de largo, con `p1` y `p2` (`world`, `camera` y `screen`), `curve`, colores por bandas que alternan cada 3 segmentos (asfalto, pianos, berma y líneas), `sprites[]`, `cars[]` y `clip`;
- colinas cosenoidales: `y = y0 + (y1 − y0)·(1 − cos πt)/2`;
- curvas acumuladas: `x += dx; dx += seg.curve`;
- fuerza centrífuga: `playerX −= dt·(v/vmax)·curve·C`.

**La proyección:** `d = 1/tan(FOV/2)`, `s = d/(z − camZ)`, `X = W/2 + (W/2)·s·(x − camX)` e `Y = H/2 − (H/2)·s·(y − camY)`. Se ven de 250 a 300 segmentos.

**Las dos pasadas:**
1. **De cerca a lejos, con `maxY`:**
   - descarta lo que está detrás de la cámara o de una cresta;
   - guarda `seg.clip = maxY`;
   - pone niebla en los últimos 45 segmentos.

   Pinta menos que `MC.Arcade`, que dibuja unas mil figuras por cuadro.
2. **De lejos a cerca:** los rivales y los objetos, recortados abajo contra `seg.clip`.

**Más allá de Free Gear:**
- parallax de 3 capas (cielo, montañas del Valle y horizonte urbano), que se mueve con `curve·velocidad` y con `camY`;
- el carro del jugador con 6 estados (recto, giro suave y giro brusco, en plano y en subida), vibración en la berma y chispas y humo al derrapar;
- rebufo a menos de 15 segmentos detrás de un rival en el mismo carril (menos arrastre y carga el nitro);
- nitro con FOV de 100° a 116°, líneas de velocidad y una sacudida corta;
  - hoy `MC.Arcade` tiene entre 58 y 71°, y por eso se siente lento;
- rivales con IA de carril y adelantamiento suave, sin saltos;
- HUD con posición, vuelta, tiempo, nitro y el minimapa del circuito, y controles táctiles a 412 × 860 y 860 × 412, fuera de la zona libre del centro;
- todo el arte procedural (o con respaldo procedural).

**Dos circuitos:**
- **Subida a Las Palmas:** subida larga, curvas encadenadas y lomas;
- **Autopista Regional nocturna:** alta velocidad, puentes y arcos encima de la vía, y la silueta de la ciudad.

**Turno Cero:**
- un archivo aditivo, `juegos/getaway/70-retro.js`, que suma «🏎️ Carreras retro» a `G.Modos.DEF` (`60-modos.js`);
- reusa `carroAtras` y `cieloRetro`, con récords y premio, y al salir vuelve al mismo punto del mundo abierto.

**La prueba (`pruebas/pista-retro.mjs`, sumada a `motor-city-qa.yml`):**
1. un carro detrás de una cresta queda recortado (prueba por píxeles);
2. la curva acumulada es continua;
3. el bot completa los dos circuitos, con vueltas y posiciones;
4. el p95 baja de 16,7 ms en Chromium de escritorio;
5. 0 errores de consola.

**Al cerrar:** sube a la 5.4.0 (`VERSION.json` y `js/00-nucleo.js`) y genera la APK con `apk-juegos.yml`.

### Fase 5 · Turno Cero en cápsulas y en el celular
- **El selector de cápsulas ya existe:** `G.Modos.DEF` (carrera, extremo, mandados, encicla, tren, run, trucos y lab). Comprueba que el paso entre el mundo abierto cenital y las Carreras retro conserve el estado.
- **La cápsula 3, solo la interfaz:**
  - garaje y colección en 2D pixel, con las fichas de `MC.Taller`;
  - el perfil de moto en `MC.Dinamica` (las motos ya se inclinan desde la 5.2);
  - los ganchos de la capa aérea (`layer = 2`, que ya tiene el jetpack y la avioneta);

  todo sin cargar el núcleo.
- **Controles táctiles para el WebView de Android:** medir 60 cuadros por segundo con 📏 (`68-medir.js`) y la telemetría. El módulo retro no debe pesar más de unos 150 KB (hoy `getaway.html` pesa 28.839 KB).

### Si trabajan varias IA al tiempo
Repartan por zonas y reclámenlas en `coord/agentes/<tu-id>.json`:

| Quién | Qué |
|---|---|
| Claude o Codex | Las fases 1 y 2 (datos y núcleo del render) y la Fase 4 (`MC.Pista`) |
| Gemini/Antigravity | El *occluder fade* y la cámara (prueba visual), el HUD y los controles del modo retro, y las capturas a 412 × 860 |
| ChatGPT (imágenes) | Los 6 estados del carro y las capas de parallax del Valle, siempre con respaldo procedural |

## 5. Lo que seguía de antes (más abajo en prioridad)
1. **La Fase 4 del plan 5.0:**
   - misiones con pasos, fallas y reintentos;
   - repeticiones exactas (grabar la entrada y repetirla con la misma simulación);
   - un bot que gana cada misión.
2. **Un barrio a nivel GTA en el Centro:** `MC.Sitios`, gente en escenas (`MC.CiudadViva`) y cinco misiones pulidas.
3. **Pendientes de ChatGPT/Codex:** R8 (SSAO, faroles y agua), C5‑05 (policía con tácticas), C5‑06 (multitudes), C5‑02 (modelos más finos de los sitios) y R6‑b (medir en un celular).
4. **Pendientes de Gemini:** G5‑09 a G5‑15.

## 6. Datos para comparar (línea base del 24‑nov; la columna «después de la Fase 1» es la nueva base)

| Qué | Fase 0 | Después de la Fase 1 |
|---|---|---|
| Motor City | `prueba.mjs --navegador`: **158 bien** | sin cambios de código |
| El Metro | **100 partidas, 0 errores**; HTML de 8.749 KB (8.965.591 bytes) | 100 partidas, 0 errores; HTML de 9.128 KB (**9.353.904 bytes**; tope 9.500.000) |
| El Metro · `edificios.js` | 4.549.632 bytes | **4.572.134 bytes** (tope 4.600.000) |
| EnCicla | **170 bien**; HTML de 5.641 KB (3.7.0) | 177 ✓ (3.8.0, ya en `main`); HTML de 5.670 KB, idéntico antes y después de la Fase 1 |
| Turno Cero | `getaway.html`: 28.839 KB | igual |
| Compuerta de EnCicla (CPU ×4) | p95 de **103,7 ms** (Carrera 43A) y **61,2 ms** (Las Palmas); meta < 50 | la 3.8.0 ya pasa (en el servidor, 37,4 y 31,9 ms); la Fase 1 no la movió |
| Edificios de El Metro que pisan la vía | Regla A: **120.187 de 638.303** (18,8 %), 12.267 con el centro en la vía · Regla B: **151.055** (23,7 %), 24.983 con el centro en la vía | Regla A: **5** (de menos de 0,3 m²), 0 con el centro · Regla B: 109.257 |
| Recorte en tiempo real de El Metro (todas las regiones) | 107.546 recortados y **17.190 quitados** | **0 y 0** |
| Cajas de relleno del anillo lejano sobre vías | **76.585 de 515.666** | igual (es del render: Fase 2) |
| Origen de las huellas | Google 52,6 %, OSM 26,8 % y Microsoft 20,6 %; solo 30.088 polígonos (el resto, rectángulos) | las mismas fuentes; 45.428 polígonos |

**Después de la Fase 3** (25‑nov):
- **El Metro 3.9.0:** 9.375.904 bytes y 100 partidas con 0 errores; los 13 modos protegidos no cambian (`tools/capturas-protegidos.mjs`); las rutas A\* no tocan ninguna casa (0 de 61.332 puntos).
- **EnCicla 3.9.0:** 9.990 KB (con las huellas reales, 4,3 MB en base64) y 177 ✓. En la compuerta, con la bandera, las huellas dan p95 de 46,3 ms en la Carrera 43A y 41,3 ms en Las Palmas y cumplen la meta en 3 de 3 rondas; los lotes la cumplían en 1 de 3. Ese día la máquina estaba más lenta: compara siempre en la misma sesión.
- **Motor del Valle 1.3.1:** `edificios-ligero.bin` tiene 667.644 rectángulos y ninguno toca un corredor (`geometria.mjs --ligero`).

**Después de la Fase 4** (25‑nov):
- **Motor City 5.4.0:** `pruebas/pista-retro.mjs` ✓ (paso y dibujo con p95 de 5,2 a 5,9 ms, 37 a 44 rellenos por cuadro); `prueba` 146 bien; `prueba --navegador` 158 bien.
- El nombre del módulo es **`js/47-pista.js`**, no `47b`: `construir.mjs` solo toma `NN-*.js`.

**Después de la Fase 5** (25‑nov):
- **Motor City 5.4.1:** `pruebas/capsulas.mjs` ✓ en 3 de 3; `medir.mjs` ✓ en 3 de 3, con la carrera intermitente de 📏 arreglada de raíz en `68-medir.js`; `prueba --navegador` 158 bien.

**Trucos de la Fase 3:**
- `python3 motor-valle/geo/huellas.py --encicla src/data` rehace `edificios.bin` (idéntico) y la versión ligera en unos 5,5 min.
- `tools/build.js` de EnCicla no mete una versión ligera que salió de otro `edificios.bin`.
- **No corras la batería de EnCicla junto con otra prueba pesada:** «mundo 3D único» espera 700 ms a que la cámara se acomode y, con la CPU ocupada, falla.

**Herramientas y trucos:**
- **Medir los conflictos:** `node reportes/fase0-cenital/medir-conflictos-elmetro.mjs ../MetroZero` (34 s, desde `motorcity`).
- **Fase 1:**
  - lo que recorta el juego: `node tools/prueba-recorte.mjs --todas` en El Metro (unos 10 s dentro del navegador);
  - la lámina de datos: `python3 reportes/fase1-cenital/datos-antes-despues.py`;
  - las capturas de las 6 zonas: `node reportes/fase1-cenital/capturas-elmetro.mjs ../MetroZero SALIDA antes|despues`.
- **El Metro comprime `edificios.js` con zopfli** si está (`pip install zopfli`); es el mismo deflate, un 4 % más chico. Sin zopfli, pesa unos 150 KB más y se pasa del tope.
- **Capturas:** en El Metro, `node tools/test.mjs 2 --shots <carpeta>`; en EnCicla, `node tests/run.js --shots --n=4` (quedan en `tests/out/`).
- **La compuerta de EnCicla** importa `playwright` como módulo ES. Si no lo encuentra, haz como la CI: `npm install --no-save --no-package-lock playwright`.
- **Al compilar EnCicla** se reescribe `dist/ENCICLA-TODO.md` con la fecha. Restáuralo si no publicas.
- **En `js/NN-*.js` de Motor City,** un comentario `//` en una sola línea rompe el código: usa `/* */`.

## 7. Reglas que no se negocian
- **El juego:**
  - un solo HTML, sin internet ni librerías nuevas (en Motor City, three.js ya está aprobado);
  - español de Colombia;
  - no romper los guardados: `elmetro.v1`, `juegaencicla.v1` y `motorcity.turnocero-v1`. Los campos nuevos van con su valor por defecto.
- **Turno Cero es 18+ y vive solo en `motorcity`.** EnCicla, El Metro y Run son de familia y van sin violencia.
- **Saneamiento en los datos, no parches en el render:** no escondas casas al dibujar ni quites colisiones para «arreglar» una calle.
- **Modos protegidos intactos:**
  - en El Metro, la vista lateral, la maqueta, Conducir, el tranvía, la cabina, Volante, Despacho, Metroplús, Carrera, la ciclovía, Operación, el Metrocable, la guía y la historia de Rosalba;
  - en EnCicla, los 9 oficios, los 27 turnos, los minijuegos y la interfaz de revista.
- **Cada cambio de render, con bandera por modo.**
- **Git:**
  - tu rama;
  - `main` solo con pruebas en verde y con el OK del autor;
  - sin `push --force`;
  - sin pull request si el autor no lo pide;
  - en `gh-pages` de EnCicla se conservan `/metro/` y `/descargas/`;
  - `publicar.yml` no se salta.
- **Datos:**
  - nunca subas llaves;
  - el correo del autor es privado;
  - atribuye a Overture/OSM (ODbL), Google Open Buildings (CC BY 4.0 / ODbL), Microsoft (ODbL), las capas oficiales de Medellín y SRTM;
  - **la licencia del catastro nuevo (R3) y el MDT LiDAR CC BY‑SA (R5) esperan al autor: no los integres.**
- **Sala limpia:** las ideas de otros juegos sí; su código, su arte, sus nombres o su mapa, no.
- **Si otra IA dejó una rama:** compréndela, pruébala, mejórala y únela. Si algo suyo no funciona, dilo con números en vez de borrarlo.

## 8. Al terminar cada fase (obligatorio)
1. **Corre la batería** de lo que tocaste e informa con este formato de lote:

       LOTE · REPO/RAMA/COMMIT · ESTADO · QUÉ LEÍ · QUÉ FALLABA · CAUSA RAÍZ · CAMBIO · PRUEBAS (comando, código de salida, resultado)
       DATOS (fuente y licencia) · RENDIMIENTO (antes y ahora) · REGRESIONES · CÓMO REVERTIR · PENDIENTES

   Si una prueba no se pudo correr, escribe «NO EJECUTADA», con la causa.
2. **Sube las versiones** que correspondan: Motor del Valle, motor, El Metro o EnCicla (§ 4).
3. **Escribe:**
   - la `BITACORA.md` del motor y la `docs/BITACORA.md` de cada juego que tocaste;
   - tu entrada en el § 8 de `CONTEXTO-RELEVO.md` (y en el § 5, fila 18);
   - un mensaje en `coord/buzon/AAAAMMDD-HHMM-<tu-id>-<tema>.md`;
   - tu ficha en `coord/agentes/<tu-id>.json`;
   - en El Metro, corre `node tools/todo.mjs`.
4. **Publica** las APK (`apk-juegos.yml`, `apk.yml` y `android.yml`) y las páginas solo con las pruebas en verde y el OK del autor.
5. **Detente y pide el OK de la fase siguiente.** Entrégale al autor los enlaces, el HTML y la APK, y **escribe tú también un prompt de relevo como este** para la IA que venga después.

## 9. Si eres un chat sin terminal (ChatGPT o Gemini en la web)
No puedes correr las fases. Lee en GitHub `docs/AUDITORIA-FASE0-CENITAL.md` y el *master prompt*. Puedes ayudar:
- a revisar el plan y los resultados de cada fase;
- con el arte del modo retro y del parallax, siguiendo `motor-city-arte` y `el-metro-arte`;
- con revisiones.

Dile al autor qué hiciste.
