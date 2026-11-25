<!-- Generado por node motor.mjs documento · Motor City 5.4.0 · no se edita a mano: edita los documentos de origen -->

# Contexto y entrega de Codex · Motor City y Turno Cero

Actualización del 22 de noviembre de 2026. Base de integración Motor City 4.6.1, commit 546229d. Prioridad del autor: arte y tecnología del motor, juego arcade de mundo abierto, tutorial opcional y acceso temprano a las actividades. El juego está en juegos/getaway/.

## Plan y estado

1. Mejorar el motor, auditar, corregir y optimizar. La base 4.6.1 incorpora controles arcade, acelerador fijo, mapa y cámaras. Las pruebas y límites figuran abajo.
2. Usar el mismo motor en Turno Cero. El acceso al mundo libre y el menú reúnen carreras, extremo, mandados, EnCicla y tren. Las actividades tienen condiciones de ciudad y estado que requieren revisión para cumplir el acceso deseado por el autor.
3. Volver a auditar motor y juego tras integrar cambios. El ritmo y los controles aún necesitan pruebas humanas en dispositivos físicos.

El encargo exige un mundo compartido en 3D, vistas cenital, panorámica, primera, tercera, lateral y pixel, con 2D en los modos adecuados. También pide actividades con consecuencias, aprendizaje y curiosidad, y un endless runner en ciclovías con cambios de dirección, obstáculos y zonas de trucos. Estos puntos siguen en el plan.

## Entrega

- Cinco ilustraciones originales pintadas se integraron en las transiciones de los actos I a V. Se incluyen en el HTML autocontenido. La portada existente de Gemini sigue activa. Hay una portada alternativa en arte/chatgpt/turno-cero/.
- El menú compartido de MC.UI limpia su manejador Escape al cerrarse y al desmontar la interfaz. Al abrir otro menú cierra el anterior y devuelve el foco al control que lo abrió.
- pruebas/modos.mjs acepta MC_PRUEBAS_URL para ejecutar la batería por HTTP local.
- Se conservó el trabajo simultáneo publicado hasta 4.6.1. El trabajo anterior sobre 4.2 quedó en los stashes locales y necesita revisión antes de integrarse. Incluye una API experimental MC.Ciudad, modelos y una guía de direccionales incompleta. La prueba anterior registró errores GuiaCine is not defined.

## Comparación para la próxima evolución

Las fuentes siguientes son descripciones oficiales consultadas en línea. Son investigación de diseño y no prueban una partida directa en cada título.

- **Super Arcade Racing**, referente prioritario. Sus carreras cenitales, pistas por bioma, rivales, personalización y clasificación sugieren circuitos de entrada inmediata, reinicio rápido, curvas legibles y tiempos comparables. Se propone usar el mismo recorrido en mundo abierto y en el selector, con reglas y resultados idénticos. https://store.steampowered.com/app/1103770/
- **Traffix** centra la decisión en semáforos y flujo. Un desafío corto podría medir esperas y cruces seguros en una intersección del mismo mapa, con controles de un toque y salida inmediata. https://store.steampowered.com/app/1102580/
- **Night Call** relaciona conversaciones con conducción. Un pasajero o una entrega podrían revelar una pieza opcional del expediente sin condicionar la exploración. https://store.steampowered.com/app/680380/
- **112 Operator** combina ubicación, incidentes, tráfico y clima. Una actividad de despacho con incidentes ficticios podría compartir calles y estado del tránsito. https://store.steampowered.com/app/793460/
- **Railway Empire** presenta decisiones de red y estaciones. Puede orientar una actividad de planificación ferroviaria a la escala del tren actual. https://store.steampowered.com/app/503940/
- Los enlaces del autor a PAKO, #DRIVE, Package Inc, Railways, Tiny Rails, Vector, Monument Valley y los demás quedan en la petición adjunta. Hace falta estudiar sus controles y experiencias directamente.

Medir tiempo hasta alcanzar velocidad útil, radio de giro, frenado, carga, p50/p95 y fallos en calles estrechas. Comparar cada actividad cerrada con su entrada desde el mundo abierto usando posición, reglas, físicas y cámara equivalentes. Ajustar distancias y reloj para evitar esperas excesivas. Mantener una simulación espacial única y comprobar que cámaras, colisiones, tráfico y objetos coincidan entre las representaciones.

## Pruebas de esta entrega

- node motor.mjs prueba --navegador, con Chromium por HTTP local: 158 comprobaciones aprobadas, con WebGL por software y emulación móvil.
- node pruebas/modos.mjs: los cinco modos concluyen en la simulación, los rivales avanzan, el acelerador fijo arranca y frena, y el mapa abre y cierra. El bot adelanta la posición en carreras y entregas.
- Prueba adicional en Chromium: acto I muestra su ilustración y el menú se abre y se cierra dos veces con Escape en 412 × 860 y 860 × 412, sin errores de página.
- En la revisión anterior de repositorios hermanos, Metro completó 100 partidas con cero errores y Run completó 100 simulaciones con cero errores. EnCicla tuvo dos fallos en la adaptación local del banco de pruebas, uno en niveles y otro en reenvío multijugador. Repetir con las versiones actuales antes de atribuir la causa.

## Pendientes

- Probar manualmente actividades y entradas desde el mundo abierto en móvil vertical, horizontal y escritorio. La prueba automatizada usa intervenciones del bot y no acredita la experiencia completa a mano.
- Ajustar disponibilidad y transiciones de los modos para cumplir la intención de acceso desde el comienzo. Resolver la dependencia de redes presentes solo en determinadas ciudades.
- Diseñar y probar ciclovías continuas, cambios de dirección, obstáculos, zonas de trucos y regreso al mismo punto del mundo libre.
- Revisar C-M31 y el estado de C-M37, C-M38, C-M39, C-M40 y C-A18 contra las implementaciones y pruebas actuales.
- Verificar GPU real, tiempos, memoria, accesibilidad de menús y rendimiento. Recorrer historia y finales a mano.
- Consultar fichas, buzones y ramas remotas de las otras IAs antes de integrar cambios. Revisar el trabajo respaldado en los stashes de esta sesión.
- Modern Web Guidance y otras skills se instalaron durante la sesión. La revisión automática rechazó la instalación de Claude-Mem por la captura persistente de actividad y sus posibles destinos externos.

## Handoff para la siguiente IA

Lee este documento, CONTEXTO-RELEVO.md, TAREAS-IA.md y coord/. Al terminar tu turno, **escribe tu propio documento de contexto con el plan completo, lo realizado, las pruebas y lo pendiente**, actualiza el relevo compartido y deja la misma instrucción a la siguiente IA. Incluye enlaces de ejecución y distingue pruebas reales, simulaciones y trabajo pendiente.

# Documento de relevo · Motor City y *Turno Cero*

> **Para la IA que siga (Claude, Codex, Gemini o cualquier otra).** Este documento existe por pedido del autor:
> «siempre, pero siempre, un documento de contexto con todo el plan, lo que hiciste y lo que falta, para que si no lo logras se le pase el trabajo a otra IA».
>
> **Reglas de este documento:**
> 1. **Léelo entero antes de tocar nada.** Luego lee `CONTEXTO-IA.md`, `MOTOR.md`, `TAREAS-IA.md` (§ 4.0) y `docs/TURNO-CERO.md`.
> 2. **Al terminar tu turno (o si se te va a acabar el contexto), es OBLIGATORIO:**
>    - actualizar la sección **«Relevo de cada IA»** al final, con tu propia entrada (quién eres, qué hiciste, cómo lo probaste, qué falta y qué riesgo dejas);
>    - actualizar **«Estado»**, **«Hecho»** y **«Falta»** si cambiaron;
>    - dejar tu ficha en `coord/agentes/<tu-id>.json` y un mensaje nuevo en `coord/buzon/AAAAMMDD-HHMM-<tu-id>-<tema>.md`, según el protocolo de abajo.
> 3. **Nunca borres la entrada de otra IA.** Este documento es un relevo: se suma, no se reescribe.
> 4. A la IA que venga después de ti pásale la misma instrucción: **también debe hacer y dejar su documento de contexto** (su entrada aquí y su ficha en `coord/`).

**Última actualización:** 22‑nov‑2026, Claude (motor **4.9.0** «Realismo»). Lo entregado y los enlaces están en el § 0.

> **El autor confirmó que Codex, ChatGPT y Antigravity ya no siguen. Claude asumió todo lo que quedaba.** La tabla del § 5 dice qué se hizo y qué queda, y por qué.
**Última actualización:** 21‑nov‑2026, Gemini · Antigravity (sincronizado con motor **4.0.3** de Claude + ingeniería inversa limpia de motores clásicos + paquete de arte pintado).
**Última actualización:** 21‑nov‑2026, Gemini · Antigravity (sincronizado con motor **4.1.0** de Claude `2d4118f`: auditoría móvil 4.1.0 de `🏁 Arcade`, `⛰️ Vuelo`, sigilo Thief `#gema`/`👂`, mundo abierto primero en Turno Cero + El Metro + EnCicla, y catálogo `G‑H27`).
- Base integrada de Claude (**4.1.0**): unió entregas 4.0.3 de ChatGPT/Codex y Gemini/Antigravity, y trajo motores clásicos (`js/47-clasicos.js`: OutRun, Comanche, Thief, Wolfenstein, Elite) y «mundo abierto primero» en Turno Cero.
**Última actualización:** 21‑nov‑2026, Claude (motor 4.2.0). Hizo tres cosas:
- unió las entregas nuevas de ChatGPT/Codex (C‑M34 por capas, arte de Gemini, PBR) y de Antigravity (técnicas clásicas sobre datos reales);
- agregó el recorte por región en el 3D;
- en Turno Cero, la historia ahora se descubre en el mundo abierto (📖).
**Última actualización:** 21‑nov‑2026, Gemini · Antigravity (sobre motor **4.2.0** `7580543` en `ia/antigravity/motorcity-4.2`: pool circular sin basura en `js/88-vida.js`, escalador EMA con histéresis en `js/05-gpu.js` + `js/46-vistas.js`, verificación RAM post-GC 4.2.0, auditoría `G‑H25..28` y revisión PR #10).

**Rama de trabajo:** `claude/motor-city-engine-xu7p4y` en los cuatro repositorios. Las otras IA trabajan en sus ramas (`ia/<agente>/<tema>`, entrega Gemini actual en `ia/antigravity/motorcity-4.2`). `main` de `motorcity` se avanza en rápido para GitHub Pages.

---

## 0. Entregables de la 5.3.0 «Todo lo nuevo, unido» (HTML, APK y enlaces)
> **Un solo juego de prueba (decisión del autor en 4.6):** Turno Cero. Adentro, 🎮 Modos: Carreras, Extremo, Mandados, EnCicla y manejar el Metro, el tranvía y el Metroplús. Los juegos sueltos Carreras y Extremo se borraron; Mandados queda solo como banco interno de pruebas automáticas.

| Juego | Enlace | HTML (un solo archivo) | APK |
|---|---|---|---|
| Página del motor | <https://juanfeliperico369-stack.github.io/motorcity/> | `index.html` | — |
| **Turno Cero 5.3.0** (18+), el juego de prueba con todo: 🏛️ 30 sitios icónicos en 3D, 🚗 vuelcos, 🔌 puentear, 🧪 química del mundo, 🍃 guía de cine, 🔧 minijuegos, 🗣️ ciudad viva (la gente reacciona, habla y llama; 🚑 y 🚒 llegan por la ruta real), 🚦 retos desde cualquier semáforo, 🏍️ motos que se inclinan, 🪟 cuartos falsos de noche, 📏 medir el rendimiento, 🗯️ vista Historieta, 🏔️ paralaje por biomas en Arcade, 🛞 manejo real (peso, suspensión, marchas, derrapes y choques), 🖼️ 3D realista (three.js), ⚙️ Flexibilidad, 🆘 rescate, 🚀 Ir en el mapa, pantalla en mitades, un solo mapa, 🌄 miradores | <https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/getaway.html> | `dist/juegos/getaway.html` | <https://github.com/juanfeliperico369-stack/motorcity/releases/download/v5.3.0/MotorCity-getaway.apk> |
| Juega EnCicla **3.7.0 en `main`** (unión de las dos 3.6 sobre la 3.5.0); la página sigue en la 3.4.0 hasta que el benchmark de `publicar.yml` cumpla o el autor decida | <https://juanfeliperico369-stack.github.io/BicicletasUno/> | `BicicletasUno/dist/juega-encicla.html` | <https://github.com/juanfeliperico369-stack/BicicletasUno/releases/download/v3.4.0/JuegaEnCicla-v3.4.0-debug.apk> (y `descargas/JuegaEnCicla.apk` en Pages) |
| El Metro 3.8.0 (unión de las 3.7 de Claude «Épocas» y de Antigravity, más CX‑36 de Codex) | <https://juanfeliperico369-stack.github.io/MetroZero/> | `MetroZero/dist/index.html` | <https://juanfeliperico369-stack.github.io/MetroZero/el-metro.apk> (código 36) |
| Run Scooter | <https://juanfeliperico369-stack.github.io/RunRunZero/> | `RunRunZero/web/index.html` | <https://juanfeliperico369-stack.github.io/RunRunZero/RunScooter.apk> |

**5.3.1 (herramientas):** las skills y los plugins de todas las IA se integran con un comando: `node motor.mjs skills --integrar --agente <tu-agente>`. El prompt para compartir es `docs/PROMPT-SKILLS.md`. El juego es el mismo y la APK v5.3.0 sigue vigente.

Las APK de los juegos del motor las compila `.github/workflows/apk-juegos.yml` (Capacitor 7). El proxy de esta sesión no deja subir etiquetas: el flujo, lanzado a mano, crea él mismo la release `v<VERSION.json>`. EnCicla (`android.yml`) y El Metro (`apk.yml`) hacen lo mismo con la versión de cada juego; Run Scooter la publica en su página con cada empuje a `main`.
**Juegos hermanos:** por decisión del autor siguen con su propio Motor del Valle; reciben el motor en `motor-city/` como referencia y un informe detallado en `docs/INFORME-MOTOR-CITY-4.6.md` (y el de la 4.5) (qué se cambió, qué mejoró, qué falta auditar, qué les toca y cómo usar el motor sin dejar el suyo).

## 1. La misión
> **Misión y visión al día (24‑nov‑2026), del motor y de cada juego:** `docs/VISION-Y-MISION.md`. Solo el autor las cambia.

**Motor City** es un motor de mundo abierto en **un solo HTML, sin internet ni librerías**. Convierte lugares reales (datos abiertos) o inventados en mundos jugables con leyes reales:
- **Juegos encima:**
  - **Juega EnCicla** (`BicicletasUno`, todo público);
  - **El Metro** (`MetroZero`, todo público);
  - **Run Scooter** (`RunRunZero`);
  - **Mandados** (Guatapé, demo del motor);
  - **Turno Cero** (`juegos/getaway/`, 18+).
- **Lo que pidió el autor para la 4.0:** el juego grande y adulto («el monstruo»), sin limitarse. Juntar Nueva York (Manhattan), la mejor versión de Medellín y el Valle, y Guatapé **en un mismo planeta**, con caminos largos en medio de la nada para ir de una ciudad a otra.

## 2. Dónde está y cómo se prueba
| Qué | Dónde |
|---|---|
| **Jugar** | <https://juanfeliperico369-stack.github.io/motorcity/>. Juegos:<ul><li>Turno Cero: `dist/juegos/getaway.html`</li><li>misión 3D de Codex: `dist/juegos/turno-cero-accion-3d.html`</li><li>Mandados: `dist/juegos/mandados.html`</li></ul> |
| Código del motor | `js/NN-*.js`. Solo entran los que empiezan con dos dígitos y un guion, y se compilan a `dist/motor.js`. Ojo: un comentario `//` en una sola línea rompe el código; usa `/* */`. |
| Turno Cero | `juegos/getaway/`, con 10 contenido, 20 juego, 30 historia, 40 dibujo y 90 inicio. `juego.json` lleva `"mundos"`, `"modelos"` y `"extras"`. |
| Mundos | `datos/<id>/mundo.mc4`:<ul><li>`nueva_york`: 10 MB, Manhattan a 6 m;</li><li>`medellin`: 6,8 MB;</li><li>`guatape`: 0,4 MB.</li></ul>Reglas de ciudad en `ciudades/<id>.json`. |
| Modelos 3D | `arte/modelos/turno-cero/*.glb`: los 45 de Codex, 3 de ellos con esqueleto. CC0. |
| Compilar | `node motor.mjs construir` (o `node herramientas/construir.mjs`) |
| Probar | `node motor.mjs prueba --navegador`: **debe dar todo en verde**. La última vez (4.0.3) dio 152 de 152. |
| Documento único | `docs/DOCUMENTO-UNICO.md`. Todo junto queda en `dist/MOTOR-CITY-TODO.md`, que se arma solo al compilar. |
| Juegos | `node motor.mjs sincronizar ../BicicletasUno` y `../MetroZero`. Después, en cada juego, sus pruebas:<ul><li>EnCicla: `node tools/build.js && node tests/run.js`;</li><li>El Metro: `node tools/build.mjs && node tools/test.mjs 100 && node tools/todo.mjs`;</li><li>Run: `node tools/build.mjs && node tools/sim.mjs 100 240`.</li></ul> |

## 3. Estado (21‑nov‑2026)
- **Motor 4.4.0**, con las entregas de ChatGPT/Codex y de Gemini/Antigravity unidas, y todas las pruebas en verde. Lo nuevo:
  - **motores clásicos** en `js/47-clasicos.js`: las vistas 🏁 Arcade (OutRun) y ⛰️ Vuelo (Voxel Space), la gema y el ruido de Thief, el DDA y las semillas de Elite. Ver `docs/INVESTIGACION-MOTORES-CLASICOS.md`. Ya trae:
  - **`MC.Planeta`**: anillo de ciudades y carreteras generadas, globo y horizonte curvo;
  - **`MC.Busqueda`**: búsqueda de 0 a 5 con los umbrales de Codex y la última posición vista;
  - **`MC.Modelos`**: lector GLB, con piel y animación glTF, faros de noche y abolladuras por zona;
  - **juegos con varios mundos**;
  - **manejo con reversa y el piloto de la IA**, `MC.Manejo.pilotar`, con rutas que siguen la calle.
- **Turno Cero, jugable de punta a punta:**
  - cinco actos, siete misiones y finales A, B y C;
  - las tres ciudades y tres carreteras de 12 a 16 km;
  - metro, cables, EnCicla y lancha;
  - artefactos T01 a T11 y sigilo con conos de visión.
  - Un bot lo recorrió completo sin errores. **No se ha probado en un celular real con GPU.**
- **Juegos:**
  - EnCicla y El Metro tienen el motor 4.0 en `motor-city/` y sus pruebas en verde;
  - Turno Cero no se mezcla con ellos;
  - Antigravity y Codex trabajan en sus ramas de juego (ver § 6).

## 4. Hecho (por versión, lo esencial)
| Versión | Qué |
|---|---|
| 2.0–2.11 | El mundo MC4 y el craqueo de territorios (`geo/territorio.py`), física, vehículos, clima, tráfico, transporte con horario, vistas 2D, estilos, `MC.Vida`, telemetría y guardado por sectores. Ver `BITACORA.md`. |
| 3.0–3.1 | Mundo único 3D con cámaras aéreas, fachadas, árboles low-poly, `MC.Objetos`, mapa grande; `MC.Persecucion` (Codex) y sombras solares (Codex) |
| 4.0 | Todo lo de § 3, más Manhattan craqueado y `docs/TURNO-CERO.md` |
| 4.0.2 | Reversa y vuelta en tres puntos; `MC.Manejo.pilotar` (la IA sale de atascos); `rutaA` por la forma de la calle. En Turno Cero: Run en la ciclovía, carreras, guardias a pie y accesibilidad. |
| 4.4.0 | Claude asume lo de las otras IA.<ul><li>Unidas sus últimas entregas: C‑M34 raster espacial, el pool sin basura y el escalador EMA.</li><li>Turno Cero: 🎬 modo cine con direccionales (C‑M40), 🧱 cubierta y 💨 esquivar a pie (C‑M32) y 🕹️ Retro 1993 con el COLORMAP de Doom (C‑M39).</li><li>EnCicla: los 5 arreglos de Codex con su prueba.</li><li>Run Scooter: 🛣️ la carretera de la nada (C‑R40).</li></ul> |
| 4.3.0 | <ul><li>Arreglos de la auditoría de Antigravity: Arcade sin fantasmas, ⚡ = correr a pie, el menú que no se corta, la gema de color, los faros solo de noche y los búferes del Vuelo.</li><li>Unida la caché del planeta de ChatGPT.</li><li>Mundo abierto primero en El Metro y EnCicla.</li></ul> |
| 4.2.0 | Unidas:<ul><li>C‑M34 (MC4 por capas bajo demanda);</li><li>el arte de Gemini en la portada y el PBR de los GLB;</li><li>la técnica clásica de Antigravity sobre datos reales.</li></ul>Recorte por región en el 3D (niebla y cono). La IA atropella lo menor del andén. Vuelo sin pausa. En Turno Cero: 📖 en el mundo abierto y la carrera con la meta adelante. |
| 4.1.0 | Motores clásicos, rehechos desde cero:<ul><li>`MC.Arcade`: carretera pseudo-3D;</li><li>`MC.VoxelSpace`: vuelo;</li><li>`MC.Sigilo`: gema de luz y ruido por caminos;</li><li>`MC.DDA` y `MC.Semilla`.</li></ul>En Turno Cero: sigilo con gema y oído, y las cámaras 🏁 y ⛰️. |
| 4.0.3 | Unidas las entregas de ChatGPT/Codex (globo WebGL2, sectores de 1 km, LOD, piezas, audio, acción a pie con línea de visión) y de Gemini/Antigravity (auditoría, 56 paradas). Claude terminó lo que quedó a medias: la prueba roja de la línea de visión, el lenguaje suave con concordancia, lo que faltaba de G‑H20/G‑H21 y las zonas Z1/Z2 de El Metro. |
| 4.0.1 | Relevo (este documento y `coord/`), luces y abolladuras de los GLB, motor y Doppler, dron policial 3D, reducción no letal, alejar hasta el planeta, eventos de carretera, contratos nuevos y arte de portada |

## 5. Falta (en orden de valor) y a quién le toca
> Desde 4.4 **Claude lleva todo**. Lo que dice «Autor» necesita un celular físico o una decisión suya.

| # | Qué | Estado | Detalle |
|---|---|---|---|
| 1 | **Probar en un celular real con GPU** (Turno Cero, Arcade, Vuelo, Retro, memoria de Manhattan) | **Autor** | La plantilla está en `reportes/2026-11-21-gemini-clasicos-4.1.md` § 1.4. En la VM no hay GPU física. |
| 2 | ~~Arreglos de Codex en EnCicla~~ | **Hecho en 4.4 (Claude)** | `BicicletasUno/src/js/98o-arreglos.js` y `tests/regresion-encicla.js`, con 5 de 5 en verde. |
| 3 | ~~Manhattan por sectores (C‑M34)~~ | **Hecho (ChatGPT, unido en 4.4)** | Raster espacial de 1 km bajo demanda, LRU y caché del planeta. Falta medir la memoria en un celular (fila 1). |
| 4 | ~~Acción a pie: cobertura y esquivar (C‑M32)~~ | **Hecho en 4.4 (Claude)** | `juegos/getaway/57-cine.js`: 🧱 cubierta (los guardias ven ×0,45) y 💨 esquivar (Q). La escena 3D de Codex sigue como misión aparte. |
| 5 | ~~Direccionales como guía (C‑M40)~~ | **Hecho en 4.4 (Claude)** | 🎬 Modo cine en ⏸ Menú. |
| 6 | ~~COLORMAP de Doom (C‑M39)~~ | **Hecho en 4.4 (Claude)** | `js/47-colormap.js` y 🕹️ Retro 1993 en ⏸ Menú. |
| 7 | ~~Pool de partículas y escalador dinámico~~ | **Hecho (Antigravity, unido en 4.4)** | `js/88-vida.js` y `js/05-gpu.js`. |
| 8 | ~~Run por la carretera de la nada (C‑R40)~~ | **Hecho en 4.4 (Claude)** | `RunRunZero`: 🛣️ en la portada. Copiado al motor con `herramientas/importar-run.mjs`. |
| 9 | ~~PVS de Quake (C‑M37)~~ | **Hecho en 4.5 (Claude)** | `herramientas/pvs.mjs` + `js/45-pvs.js`: Manhattan recorta 26 % y Guatapé 28 % a ras de calle, sin fugas grandes (`pruebas/pvs.mjs`). Medellín medido (15 %) y fuera del HTML por peso. |
| 10 | **Guatapé en los juegos hermanos** | **Sus IA** (decisión del autor 4.5) | Va en `docs/INFORME-MOTOR-CITY-4.5.md` de cada uno, con el cómo: el lector MC4 del motor como un modo aparte (`datos/guatape/mundo.mc4`, 0,4 MB). |
| 11 | **El Metro: crónicas (Z3)** | **Sus IA** (4.5) | En el informe de MetroZero. |
| 12 | **El globo en la misma escena 3D (C‑M31)** | Pendiente | Sigue como vista aparte con animación al alejar. Falta dibujar la esfera (radio = 1/2k de la curvatura) en `js/45-gl.js` cuando la cámara aérea pase de unos kilómetros, y subir el tope de la cámara aérea. |
| 13 | **LOD retopologizados y más actores con esqueleto (C‑M33)** | Pendiente: arte | En 4.5 los 42 modelos se rehicieron (generador 0.3.1, AO, caras); LOD a mano sigue necesitando Blender. |
| 14 | **Cotejo en terreno de las 8 coordenadas de Turno Cero** | **Autor** o alguien de Medellín y de Guatapé | Están verificadas contra el MC4. |
| 15 | ~~Tarjetas de El Metro con el texto encima del arte~~ | **No se reproduce en la versión actual** | El diseño cambió desde la auditoría (v0.2.0). |
| 16 | **Sentir el manejo nuevo (4.6) con las manos** en Turno Cero, El Metro y los modos | **Autor** | Los números a tocar están en `Vehiculos.ARCADE` (motor; El Metro tiene los suyos desde su 3.1.0): `accK`, `brkK`, `w0`, `w1`, `tw`. Ver `docs/INVESTIGACION-MANEJO.md` § 0. |
| 17 | ~~Manejo de EnCicla, mapa de EnCicla, horizontal, un solo juego de prueba~~ | **Hecho en 4.6 (Claude)** | `js/32-fisica.js`, `js/70-mapa.js`, `juegos/getaway/60-modos.js`. El Metro lo hizo su propia sesión en la 3.1.0 «Fluido» (rama `ccr-2a67f935-oat714`). |
| 18 | **Renacimiento cenital** (pedido del autor, 24‑nov: *master prompt*, investigación técnica y entrega de GPT‑6 en `docs/referencias/renacimiento-cenital-2026/`): saneamiento GIS en `motor-valle/`, cenital 2.5D, integración en El Metro y EnCicla, y carreras pseudo‑3D en Turno Cero | **Fases 0 a 4 hechas (Claude). La 1 está aprobada; sigue la Fase 5 (Turno Cero en cápsulas y en el celular)** | Fase 0: `docs/AUDITORIA-FASE0-CENITAL.md`. Fase 1 (Motor del Valle 1.3.0, el Valle saneado): `reportes/2026-11-24-claude-fase1-cenital.md`. **Fase 2** (el cenital nuevo con bandera en El Metro y EnCicla; Motor City 5.3.2 con los mundos saneados y sin la tolerancia de 1 m): `reportes/2026-11-24-claude-fase2-cenital.md`. **Fase 3** (la bandera encendida; El Metro 3.9.0 y EnCicla 3.9.0, con las huellas reales en su modo libre; Motor del Valle 1.3.1): `reportes/2026-11-25-claude-fase3-cenital.md`. **Fase 4** (`MC.Pista`: carreras retro pseudo‑3D, y «🏎️ Carreras retro» en Turno Cero; Motor City 5.4.0): `reportes/2026-11-25-claude-fase4-pista.md`. Todo en la rama `ccr-4f6eeea5-yulqk1` de los tres repositorios, no en `main`. Publicar y pasar a `main` esperan el OK del autor. |

## 6. Protocolo entre IAs (sin mediador), adoptado de Antigravity y Codex
- **Una rama por agente:** `ia/<agente>/<tema>` o `<agente>/<tema>`. Nunca `push --force` sobre la rama de otro, ni sobre `main` ni sobre `gh-pages`.
- **Ficha propia:** `coord/agentes/<agente>.json`. Cada IA edita **solo la suya**.
- **Buzón donde solo se suma:** `coord/buzon/AAAAMMDD-HHMM-<agente>-<tema>.md`. Un archivo nuevo por mensaje; nunca se edita el de otro.
- **Antes de empezar y antes de cada push:**
  - `git fetch --all --prune` y revisar `git branch -r`;
  - leer las fichas y el buzón de las otras ramas (`git show origin/<rama>:coord/...`);
  - unir lo que ya esté verde.
- **Zonas actuales:**
  - **Claude:** el motor (`js/`, `herramientas/`, `pruebas/`) y Turno Cero (`juegos/getaway/`, salvo los archivos de Codex en `arte3d/` y `turno-cero-accion-3d.html`).
  - **Codex:** `juegos/getaway/arte3d/`, la escena 3D y, en EnCicla, lo que reclama en `coord/agentes/codex.json` de `BicicletasUno`.
  - **Antigravity (Gemini):** las zonas Z1–Z5 de El Metro (`MetroZero/.ai-coord/`) y los rangos `98a–98m` de EnCicla.
- **Si dos soluciones chocan,** gana la que pase las pruebas, pese menos en KB y dé menos ms por cuadro (`MC.Telemetria`). Las mejoras que no se excluyen se suman.

## 7. Reglas que no se negocian
- **Mundo abierto desde el principio** (pedido del autor, 4.1): en todos los juegos se entra a jugar de una. La historia, el tutorial y el contexto son opcionales y nunca bloquean.
- Un solo HTML, sin internet en el juego, y español de Colombia.
- No romper los guardados. El de Turno Cero es `motorcity.turnocero-v1`.
- Turno Cero es para adultos (18+) y **no se mezcla** con EnCicla, El Metro ni Run, que son para todo público.
- Todo es ficción en Turno Cero: personas, empresas, bandas y policía. Las calles son reales y no se acusa de nada a lugares reales.
- **Nunca subir llaves.** No poner el correo del autor en ningún lado. No poner identificadores de modelos de IA en los commits.
- No copiar arte con derechos: de las referencias se toman técnicas, no arte.
- Pruebas en verde antes de cada push. Actualizar `BITACORA.md` y este documento.

## 8. Relevo de cada IA (súmale tu entrada; no borres las anteriores)

### Claude · 20‑nov‑2026 · motor 4.0.0 → 4.0.x
- **Hecho:** ver § 3 y `BITACORA.md`. En este turno, además:
  - se unió lo último de Codex (escena 3D y rigs);
  - `MC.Modelos.posar` reproduce los esqueletos;
  - se creó este documento.
  - Las mejoras de la 4.0.x están en su propia sección de la bitácora.
- **Cómo lo probé:**
  - `node motor.mjs prueba --navegador`: 150 de 150;
  - bot de historia completa;
  - capturas en 412×860;
  - pruebas de EnCicla y El Metro (100 partidas) en verde.
- **Falta:** § 5.
- **Riesgo que dejo:**
  - el HTML de Turno Cero pesa unos 26 MB, por las tres ciudades;
  - la carga de Medellín tarda varios segundos;
  - no hay medición en celular;
  - los recorridos son largos a propósito (16 km de carretera ≈ 8–9 min).

### Claude · 20‑nov‑2026 · 4.0.1
- **Hecho:**
  - este documento y el protocolo `coord/` en el motor;
  - luces y abolladuras de los GLB;
  - sonido de motor y Doppler;
  - dron policial 3D;
  - ✊ reducción no letal a pie;
  - alejar la cámara hasta el planeta;
  - eventos de carretera en Calle libre y 3 contratos nuevos;
  - arte de portada (SVG);
  - versión 4.0.1.
- **Probé:**
  - la suite completa del motor;
  - el bot de la historia completa (final A, sin errores);
  - capturas de la portada, la noche en 3D, el carro abollado y el sigilo a pie;
  - EnCicla y El Metro con sus pruebas.
- **No toqué** el `src/` de los juegos: Antigravity y Codex trabajan allí en sus ramas (`ia/antigravity/…`, `codex/encicla-motorcity`). Al integrar, que fusionen sobre `claude/motor-city-engine-xu7p4y` siguiendo `coord/`.
- **A la IA que siga:** empieza por § 5. Al terminar, **escribe tu entrada aquí** y tu ficha en `coord/agentes/`, y pídele lo mismo a la siguiente.

### Claude · 21‑nov‑2026 · 4.0.2
- **Hecho:**
  - reversa y vuelta en tres puntos en el modelo de carro;
  - `MC.Manejo.pilotar`, el piloto de la IA que usan las patrullas, la banda, El Contador y los rivales;
  - `rutaA`, que sigue la forma de la calle (antes cortaba por encima de casas);
  - en Turno Cero: Run en la ciclovía, carreras callejeras, guardias que persiguen a pie y opciones de accesibilidad.
- **Probé:**
  - 152 de 152 en verde;
  - simulación del piloto en Medellín (1,7 km en unos 60 s) y en Guatapé (3 de 4);
  - en Chromium, Run y la carrera;
  - el bot de la historia completa.
- **Riesgo:**
  - en Guatapé hay calles que los datos marcan como edificio o como muy empinadas, y la IA se puede trabar allí;
  - el jugador ahora retrocede al frenar estando quieto, el comportamiento normal de los juegos, pero hay que confirmarlo en un celular.
- **Sigue:** § 5, sin cambios en el orden. Para Codex: la acción a pie ya tiene la base (guardias que persiguen y ✊); falta la cobertura y esquivar.
- **A la IA que siga:** al terminar, **escribe tu entrada aquí** y tu ficha en `coord/agentes/`, y pídele lo mismo a la siguiente.


### ChatGPT · 20‑nov‑2026 · auditoría 4.0.1 de Gemini
- **Hecho:** G-H22 (28 paradas y selección por bioma), G-H23 (lenguaje suave extendido), G-H21 (riesgo de referencia comercial detectado y corregido en el guion).
- **Prueba:** `node pruebas/getaway-contenido.mjs` incorporada a Actions, pendiente del estado final de la nueva PR.
- **Falta:** cotejo parcelario de 19 lugares y G-H20/24 en GPU física; tareas C-M31–36 y arte PBR no terminadas.
- **Riesgo:** la ubicación de la finca sigue siendo una coordenada narrativa aproximada; no atribuir delitos a lugares reales.
- **Relevo:** cada IA agrega su propia entrada, ficha y buzón; no reescribe las otras.


### ChatGPT · 20‑nov‑2026 · ampliación C-M36 de la PR 4.0.x
- **Hecho:** `MC.PersecucionAudio` como núcleo reutilizable; sirena de Turno Cero con atenuación, Doppler y oclusión por edificios, motor en bandas coherentes.
- **Pruebas:** cálculos deterministas añadidos a `pruebas/getaway-contenido.mjs`; revisar Actions antes de integrar.
- **Falta:** pruebas auditivas y de rendimiento en móvil real, correcciones C-M31/32/33/34/35.


### ChatGPT · 20‑nov‑2026 · C-M32 base de guardias 3D integrada
- **Hecho:** nuevo módulo compartido `MC.AccionPie`; percepción según cono/oclusión, última posición vista, búsqueda, patrulla y distracción; guardias animados sincronizan posición con el modelo GLB, sin atravesar edificios.
- **Pruebas:** módulo puro con obstáculos ficticios y pérdida de línea visual en `pruebas/getaway-contenido.mjs`. La escena 3D independiente sigue separada; no se declara integración completa de todos sus sistemas de combate/cobertura.
- **Pendiente:** esquiva, combate táctico ampliado, integración profunda de objetos físicos, pruebas de movilidad en móvil real.


### ChatGPT · 20‑nov‑2026 · C-M33 personajes rigged de preproducción
- Generador y validador ampliados de 3 a 9 actores GLB (12 huesos, 8 animaciones) y pesos mixtos en articulaciones. Prueba Python local 9/9 válida.
- Integración al juego, LOD1/LOD2 de vehículos/actores y PBR final pendientes. CI entrega los GLB generados como artefacto.


### ChatGPT · 20-nov-2026 · C-M33 LOD geométrico de escena
- **Hecho:** selección de geometría 0/1/2 por distancia en `MC.Modelos`, integrada en modelos de tráfico y escena 3D, con caché por modelo.
- **Prueba:** `pruebas/getaway-contenido.mjs` verifica 120→77→36 triángulos y que el jugador conserva la malla completa.
- **Falta:** LOD GLB retopologizados, validación de silueta y GPU de móvil real; mantener PR en borrador hasta CI.


### ChatGPT · 20-nov-2026 · C-M35: daño por piezas visuales en 3D
- **Hecho:** `MC.Piezas` reutilizable con capó, baúl, puertas y rueda; desprendimiento en umbral de daño, gravedad/rebote local, geometría de mallas 3D y humo/fuego procedurales sobre el vehículo del jugador.
- **Pruebas:** caso de 2 piezas con colisión, máximo de fragmentos, render sin sprites y limpieza al reparar, dentro de la suite G-H21/22/23.
- **Límite:** las piezas son geometría procedural auxiliar, todavía no son las partes segmentadas físicamente de cada GLB. No se ha verificado en GPU real.


### ChatGPT · 20-nov-2026 · C-M31 globo WebGL2 (parcial)
- **Hecho:** `MC.GloboGPU` usa un shader WebGL2 con franjas de biomas del anillo, ruido geográfico ficticio, sombreado solar, atmósfera Rayleigh aproximada, estrellas y posición del jugador.
- **Integración:** canvas GPU en overlay del planeta; si falla WebGL2, el `Planeta.globo` 2D original sigue disponible y táctil.
- **Límite:** la transición sigue siendo por capa superpuesta (animada) y no todavía dentro del mismo renderizador de ciudad. Prueba de shader en Chromium pendiente de CI.


### ChatGPT · 20-nov-2026 · QA real C-M31
- Se amplió la prueba Chromium del juego compilado: abre el globo, verifica el lienzo WebGL2 y exige que el respaldo 2D sólo se use por ausencia de WebGL2. La PR permanece en borrador a la espera de Actions.


### ChatGPT · 20-nov-2026 · C-M34 memoria ED1 por sectores (parcial)
- **Hecho:** `MC.Sectores1km`: sectores de 1 km con caché LRU de metadatos; limita a 36 las regiones de edificios ED1 decodificadas cerca de la cámara de Manhattan, cada 2 s. El mundo sigue funcional fuera de la caché porque ED1 crudo permanece disponible.
- **Prueba:** en Node se crean 90 regiones ficticias y el sectorizador reduce a <=20 sin perder la API; se conservan guardados.
- **No hecho:** el MC4 comprimido de 10,2 MB y las capas de suelo, relieve y viales siguen cargándose en el juego completo. Streaming real necesita dividir el formato/binarios en construcción y lector sectorizado.
### Claude · 21‑nov‑2026 · 4.5.0 · PVS, modelos, manejo, efectos, rostros, Hunter Assassin, Carreras y Extremo
- **Pedido:** retocar modelos 3D, 2D y pixel; PVS; topografías, casas y edificios (sin cambiar el mapa); informe detallado a cada repositorio y que sigan con su motor del Valle; en el motor y el juego de prueba, todo lo que falta. Después: manejo y controles, rostros, árboles con lógica, vehículos que suben por algunas cosas, la forma cenital de *Hunter Assassin* y explosiones, choques, derrapes y cosas rotas. Autorizado a publicar.
- **Hecho:** ver `BITACORA.md` (4.5.0), `docs/PEDIDOS.md` § 16 y `docs/INVESTIGACION-MANEJO.md`.
  - El hallazgo más importante: los carros de Turno Cero usan el modelo de bicicleta de `js/36-taller.js`, que frenaba en seco y rebotaba al rozar cualquier cosa. Ahora comparte con la física base el choque que desliza, el desatascador y la asistencia.
- **Cómo se probó:** 144 Node, 156 navegador, `pruebas/pvs.mjs`, `pruebas/sin-conexion.mjs`, `pruebas/carreras.mjs` y `pruebas/getaway-historia.mjs` (Final A en 162 s, 0 errores). Capturas revisadas: modelos, retratos, derrape y explosión, carreras.
- **Falta:** el globo en la misma escena (§ 5, fila 12); probar la sensación del manejo con las manos en un celular (autor); LOD a mano (arte); 4 paletas de obras y los 10 reels que piden iniciar sesión.
- **Riesgo:** la asistencia de manejo corrige el volante; si a alguien no le gusta, se apaga en ⏸ Menú. Los números para afinar están en `docs/INVESTIGACION-MANEJO.md` § 5.

### Claude · 21‑nov‑2026 · 4.4.0 · lo que quedaba de las otras IA
- **Pedido del autor:** «Y ya ni lo harán, resuelve tú lo que falta». Codex, ChatGPT y Antigravity ya no siguen.
- **Hecho:**
  - **unidas sus últimas ramas:**
    - `ia/chatgpt/cm34-spatial-420-20261121` (28 commits: raster espacial de 1 km);
    - `ia/antigravity/motorcity-4.2` (pool sin basura y escalador EMA).
  - **EnCicla:** los 5 arreglos de Codex:
    - bici prestada;
    - acceso sin aparcamiento;
    - gasto de la eléctrica;
    - montar;
    - hojas de la trama.

    Más la prueba de regresión.
  - **Turno Cero** (`57-cine.js`):
    - 🎬 modo cine con direccionales (C‑M40);
    - 🧱 cubierta y 💨 esquivar (C‑M32);
    - 🕹️ Retro 1993, que usa `js/47-colormap.js` (C‑M39).
  - **Run Scooter:**
    - 🛣️ carretera de la nada (C‑R40);
    - regalo diario sin ventana;
    - el motor importa la versión nueva.
  - **El Metro:** las tarjetas ya no tienen el problema de la auditoría.
- **Probé:**
  - Node: 142;
  - el contenido de Turno Cero;
  - C‑M34 en Node;
  - Chromium;
  - EnCicla (regresiones 5 de 5);
  - El Metro: 100 partidas;
  - Run Scooter: 100 partidas, con la carretera;
  - capturas a `412 × 860`:
    - modo cine: direccional a 67 m;
    - esquivar: 3 m;
    - retro: 1,3 ms por cuadro;
    - carretera en Run.
- **Riesgo:**
  - el modo cine calcula la ruta cada segundo, y en una ciudad grande eso puede costar unos ms;
  - Retro 1993 cambia el pixel de Turno Cero para todas las vistas 2D.
- **Sigue:** § 5, filas 9 a 13, en este orden: PVS, Guatapé en los juegos hermanos, crónicas y globo.
- **A la IA que siga** (si vuelve alguna): **escribe tu entrada aquí**, deja tu ficha en `coord/agentes/` y un mensaje en `coord/buzon/`.

### Claude · 21‑nov‑2026 · 4.3.0 · lo que encontró la auditoría y el mundo abierto en los tres juegos
- **Pedido del autor:** «retoma y sigue, hay cosas nuevas».
- **Lo nuevo de las otras IA:**
  - la auditoría móvil de Antigravity (G‑H25, G‑H26, G‑H28) y su catálogo G‑H27;
  - la caché del planeta de ChatGPT (`ia/chatgpt/planeta-cache-410-20261121`).

  Se unieron las dos.
- **Hecho, cada hallazgo de la auditoría:**
  - **Arcade:**
    - el suelo se pinta antes que los segmentos;
    - los trapecios se solapan 0,7 px;
    - el haz de noche baja a 0,11;
  - **⚡ a pie = correr**, en `js/33-controles.js` (motor: vale para todos los juegos);
  - **sigilo** (`55-clasicos.js`): agachada con menos de 1 m/s; ruido al correr; faros × noche y con `DDA.bloqueado`; gema que cambia de tono y leyenda la primera vez;
  - **menú ⏸** (`index.html`): `position:fixed`, `top:50%` y `transform` con `!important`, porque el `top` en línea de `MC.UI` lo empujaba hacia arriba;
  - **Vuelo:** búferes reusados (`_libres`) y el carro visible de noche.
- **Mundo abierto primero:**
  - **El Metro:** `src/js/97-abierto.js` y los íconos en `src/iconos/`;
  - **EnCicla:** `src/js/98n-abierto.js`.

  Los dos son aditivos y sus pruebas quedan actualizadas.
- **Probé:**
  - Node: 141;
  - el contenido de Turno Cero;
  - la caché del planeta en Node y en Chromium;
  - la batería de Chromium;
  - El Metro: 100 partidas, 0 errores;
  - EnCicla: en verde;
  - mediciones a `412 × 860`:
    - menú: arriba en 148 px;
    - a pie con ⚡: 4,25 m/s;
    - El Metro: 1 toque, 0,4 s;
    - EnCicla: 1 toque, 0,3 s.
- **Riesgo:**
  - la Arcade, en calles con giros cerrados, puede mostrar la vía de lado durante un momento (ya no deja basura en pantalla);
  - el cambio de ⚡ también hace correr a pie en Mandados (es lo esperado).
- **Sigue:**
  - **El Metro (Antigravity):** las tarjetas `Est. 01` y `Est. 02`, con texto encima del arte y el título recortado;
  - **EnCicla (Codex):** volver a subir sus arreglos;
  - **todos:** medir en un celular real (la plantilla está en el reporte de Antigravity).
- **A la IA que siga:** al terminar, **escribe tu entrada aquí**, deja tu ficha en `coord/agentes/` y un mensaje en `coord/buzon/`, y pídele lo mismo a la siguiente.

### Claude · 21‑nov‑2026 · 4.2.0 · unir, recortar y abrir la historia
- **Pedido del autor:** «continúa desarrollando y mejorando».
- **Hecho:**
  - **unidas tres ramas**, sin perder nada de nadie:
    - `ia/chatgpt/4-0-2-gemini-auditoria` (13);
    - `ia/chatgpt/cm34-cache-20261120` (26);
    - `ia/antigravity/motorcity-4.0` (3).

    Las paradas quedan en 56, con el formato completo de Gemini;
  - **recorte por región en `js/45-gl.js`:** niebla (Silent Hill) y cono horizontal en las cámaras de manejo; queda la estadística `vistas.gl.recorte`;
  - **IA:** atropella lo menor del andén (`MENOR_IA`) y cruza las casillas de borde, ladrillo o edificio sin edificio real (`BORDE_IA`), las dos en `js/32-fisica.js`. Con eso se arregló la prueba que a veces fallaba con el rival de la carrera;
  - **⛰️ Vuelo:** la primera ventana se arma por franjas;
  - **Turno Cero:**
    - `56-abierto.js`: el 📖 en el mundo abierto;
    - ganchos nuevos `EXTRAS.capas` y `EXTRAS.mapa` para dibujar encima y poner puntos en el minimapa;
    - la carrera con la meta adelante.
- **Probé:**
  - Node: 141;
  - el contenido de Turno Cero;
  - C‑M34 en Node y en Chromium;
  - las técnicas clásicas de Antigravity (6/6);
  - la batería de Chromium;
  - capturas a `412 × 860`.

  Recorte en tercera persona: 17 de 58 regiones dibujadas.
- **Riesgo:**
  - el recorte por región usa un margen de 0,15 rad y de 30 m. Si en un celular se ven aparecer edificios en el borde de la pantalla, sube esos márgenes en `js/45-gl.js`.
- **Sigue:** § 5, con lo nuevo:
  - llevar al motor lo mejor del laboratorio de Antigravity: los pools de Burnout para partículas y el `EscaladorDinamico` de *Shadow of the Colossus`;
  - el PVS (C‑M37).
- **A la IA que siga:** al terminar, **escribe tu entrada aquí**, deja tu ficha en `coord/agentes/` y un mensaje en `coord/buzon/`, y pídele lo mismo a la siguiente.

### Claude · 21‑nov‑2026 · 4.1.0 · motores clásicos
- **Pedido del autor:**
  - investigar motores viejos, livianos y potentes, y cómo los usaron los mejores juegos;
  - hacerles ingeniería inversa;
  - traer partes de las versiones liberadas.
- **Hecho:**
  - **la investigación con fuentes y licencias:** `docs/INVESTIGACION-MOTORES-CLASICOS.md`. Es sala limpia: el código GPL (Doom, Quake) y el de licencias propias (Build, Wolfenstein) solo se leen como documentación, y **el código filtrado o «reversado» de GTA III no se usa**;
  - **`js/47-clasicos.js`:**
    - `MC.Arcade`: la vista 🏁, carretera pseudo-3D de OutRun sobre la vía real;
    - `MC.VoxelSpace`: la vista ⛰️, el vuelo de Comanche;
    - `MC.Sigilo`: la gema y el ruido de Thief;
    - `MC.DDA`: Wolfenstein;
    - `MC.Semilla`: Elite;
  - **Turno Cero (`55-clasicos.js`):** el sigilo con gema ◆ y oído de los guardias, y las cámaras nuevas en 🎥;
  - **Turno Cero, mundo abierto desde el principio** (pedido del autor):
    - ▶ «Jugar · mundo abierto» es el primer botón;
    - la historia es 📖 opcional: en la portada, el botón 📖 del juego, ⏸ Menú y la tecla H;
    - la casilla «Entrar directo» salta la portada;
    - **no vuelvas a poner la historia ni el tutorial como paso obligatorio.**
- **Probé:**
  - `node pruebas/prueba.mjs`, § 22 (números verificables);
  - el banco de Chromium con 11 vistas;
  - capturas a `412 × 860` en Medellín y en la Autopista del Embalse, de día y de noche.
- **Riesgo:**
  - la vista Vuelo arma su ventana de 2 km la primera vez de una sola vez (puede tardar unos 0,3 s en un celular);
  - la vista Arcade en la ciudad sigue la calle más cercana, y en cruces complejos puede escoger otra;
  - el ruido de Thief usa `edificioEn` por celda: está bien para unos pocos guardias, pero no lo uses cada cuadro para cientos.
  - ~~prueba ocasionalmente roja del rival de la carrera~~ **Resuelta en 4.2.** La causa era doble: el rival chocaba con casillas de ladrillo y con bancas o postes del borde de la calle, y la meta podía quedar detrás. Ahora la IA atropella lo menor del andén, cruza el borde sin edificio real y la meta queda adelante. En dos corridas seguidas avanzó 60 m.
- **Sigue:** § 5, filas 13 y 14, además de lo anterior.
- **A la IA que siga:** al terminar, **escribe tu entrada aquí**, deja tu ficha en `coord/agentes/` y un mensaje en `coord/buzon/`, y pídele lo mismo a la siguiente.

### Claude · 21‑nov‑2026 · 4.0.3 · terminar lo de las otras IA antes de que se queden sin uso
- **Pedido del autor:** «ayúdalos a completar las tareas, están por quedar sin uso».
- **Hecho:**
  - **unidas las ramas:**
    - `ia/chatgpt/4-0-2-gemini-auditoria`: sus primeros commits y sus 6 arreglos nuevos;
    - `ia/antigravity/motorcity-4.0`: la auditoría, las capturas y las paradas;
  - **ChatGPT dejó una prueba en rojo en su rama.** `AccionPie.ocluido` muestreaba cada 3 m y se saltaba muros de 2 m; ahora muestrea cada metro y `pruebas/getaway-contenido.mjs` pasa entera;
  - **sobre los arreglos G‑H20 a G‑H23 de ChatGPT se suma:**
    - «El testigo incómodo» en lugar de «El sapo»;
    - el lenguaje suave en los finales, con género y número;
    - `G CEBO` en la escena 3D;
    - la ruta de `pruebas-modelos.py`;
    - 56 paradas y la prueba de 8 por bioma;
  - **El Metro:** las zonas Z1 y Z2 de Antigravity, sus 6 errores a 412 px, en `MetroZero/src/js/98-relevo-z1.js`. Probado con 100 partidas y 0 errores. Hay ficha y mensaje en `MetroZero/.ai-coord/`;
  - **EnCicla y Run:** se unió el protocolo de coordinación de Codex y de Antigravity, solo sus fichas.
- **Probé:**
  - `node motor.mjs prueba --navegador`;
  - `node pruebas/getaway-contenido.mjs`;
  - `arte3d/pruebas-modelos.py` (42/42);
  - en El Metro: `node tools/test.mjs 100` y la medición a `412 × 860`.
- **Riesgo:**
  - los arreglos de código de Codex en EnCicla se perdieron: no estaban en GitHub (§ 5, fila 11);
  - las 8 coordenadas nuevas de Turno Cero se verificaron contra el MC4, no en terreno.
- **Sigue:** § 5.
- **A la IA que siga:** al terminar, **escribe tu entrada aquí**, deja tu ficha en `coord/agentes/` y un mensaje en `coord/buzon/`, y pídele lo mismo a la siguiente.

### ChatGPT · 21-nov-2026 · correcciones de mapa/diálogos Gemini
- Se integró el commit 4.0.2 de Claude en la rama de ChatGPT con merge de dos padres.
- G-H21: ocho coordenadas corregidas según el informe MC4 de Gemini (incluido refugio ficticio). El cotejo físico/catastral sigue sin hacerse.
- G-H23: corregida la clave inexistente `coro` por `camara` en los subtítulos de la banda.

### Gemini · Antigravity («hydrogen») · 21‑nov‑2026 · auditoría y datos sobre 4.0.1 (`ia/antigravity/motorcity-4.0`)
- **Hecho (todas las tareas de Gemini en `TAREAS-IA.md` § 4.0, cero ediciones en `js/`, `herramientas/`, `pruebas/` ni `juegos/getaway/`):**
  - **`G‑H22`:** creado `contenido/paradas-carretera.json` con **28 paradas originales** (4 por cada uno de los 7 biomas de `MC.Planeta.BIOMAS`: `costa`, `llanura`, `desierto`, `bosque`, `montana`, `nieve`, `lagos`), bilingüe `nombre_es` / `nombre_en`, `tipo` compatible con `PARADAS_RUTA`, `rutas` y frase de `ambiente`.
  - **`G‑H12`, `G‑H13` y `G‑H6`:** reporte `reportes/2026-11-21-gemini-herramientas-4.0.md` con:
    - instalación verificada de las 4 skills externas (`node motor.mjs skills --instalar --agente antigravity`: `hallmark`, `modern-web-guidance`, `find-skills`, `hyperframes`);
    - auditoría de `node motor.mjs publico` (Sofía 8 años `mal` / 5 s atascada; Mark turista `revisar` / 35 % atascado; Don Gilberto y Valentina `bien`);
    - auditoría de `npx -y modern-web-guidance@latest legacy-scan js --json`: **6 hallazgos (`js/structured-clone`)**, todos clasificados `dropWhen` (no aplicar) porque `pruebas/prueba.mjs` corre en `node:vm` sin `structuredClone` y `00-nucleo.js`/`49-hogar.js`/`92-guardado.js` dependen de normalización JSON.
  - **`G‑H20`, `G‑H21`, `G‑H23` y `G‑H24`:** reporte integral `reportes/2026-11-21-gemini-turno-cero.md` + **12 capturas móviles WebP** (`reportes/img/turno-cero-4.0/`, 907 KB total, revisadas una por una):
    - **`G‑H24` (carga y memoria):** `nueva_york` tarda `2.850 ms` y sube el JS Heap a **215,3 MB** (`262,4 MB` reservados); `medellin` `1.746 ms` / **66,3 MB**; `guatape` `985 ms` / **13,6 MB**. Confirma la urgencia de `C‑M34` (Manhattan por sectores de 1 km).
    - **`G‑H21` (19 lugares):** `gu_finca` apunta al hotel real **`La valentina finca hotel`** como refugio del villano (ALTO — propuesta neutra verificada en MC4: `6.23636, -75.18186`, a 495 m del negocio más cercano); además 4 calles desfasadas (`ny_noah`, `ny_oeste`, `md_centro`, `md_envigado`) y 3 ajustes menores, todos con coordenadas exactas sobre vía en MC4.
    - **`G‑H23` (lenguaje suave + bug real):** hallado bug real en `juegos/getaway/20-juego.js:256` (hablante `'coro'` no existe en `TC.QUIEN`, debe ser `'camara'`); `LENGUAJE_SUAVE` pierde mayúscula inicial, pluraliza `malparida`, omite `tombo`/`güevones` y no pasa por `TC.CONTRATOS` (`El sapo`).
    - **`G‑H20` (revisión visual `412×860`):** portada 18+ empuja botones debajo del pliegue; menú de pausa deja sangrar el HUD subyacente; diálogo activo no se cierra al abrir `Menú` o cambiar a `Calle libre` y se solapa con `#subt`; etiqueta `Medellín` recortada en el globo; botón `G SEÑUELO` roza borde en `turno-cero-accion-3d.html`.
  - **Protocolo `coord/`:** ficha actualizada en `coord/agentes/antigravity.json` (`estado: "entregado"`) y relevo en `coord/buzon/20261121-0320-antigravity-relevo-4.0.md`.
- **Cómo lo probé:**
  - `node motor.mjs prueba --navegador` (aislado sobre 4.0.1): **151/151 en verde (`89,8 s`)**, medianas CPU 4× (`cenital 5,1`, `ciudad3d 11,8`, `maqueta 13,5`, `lateral 11,9`, `pano 5,7 ms`), 12 estilos, 45 GLB y Turno Cero móvil `0` errores;
  - `node pruebas/portada.mjs`: **4/4 perfiles en verde** (`320×640`, `412×860`, `860×412`, `1440×900`);
  - 12 capturas móviles reales en Chromium `412×860` + `dist/juegos/turno-cero-accion-3d.html` en WebGL2 (`87` draw calls, `19.842` tris, `0` errores) + perfilado CDP `Performance.getMetrics` por ciudad;
  - validación programática de los 19 lugares contra `datos/{nueva_york,medellin,guatape}/mundo.mc4` y de las 445 cadenas de `juegos/getaway/10-contenido.js`;
  - verificado `git diff` sin modificaciones en `.js`/`.mjs` y `node motor.mjs documento` ejecutado para regenerar `dist/MOTOR-CITY-TODO.md`.
- **Falta:**
  - **Autor / QA físico:** probar *Turno Cero* en un **celular real con GPU** y llenar la tabla § 1.3 de `reportes/2026-11-21-gemini-turno-cero.md` (esta VM no tiene GPU física).
  - **Claude:** integrar PR de `ia/antigravity/motorcity-4.0`, aplicar los parches puntuales (`gu_finca` + 4 calles, `'coro'` → `'camara'`, `suave()`, portada/menú/diálogos, etiqueta del globo y conexión de `contenido/paradas-carretera.json`).
  - **Codex:** priorizar **`C‑M34`** (Manhattan por sectores de 1 km para bajar el pico de `215,3 MB` JS Heap), ajustar ancho del botón `G SEÑUELO` en `turno-cero-accion-3d.html`, corregir ruta en `juegos/getaway/arte3d/pruebas-modelos.py` (`arte/modelos/turno-cero/`), y continuar `C‑M31`, `C‑M32`, `C‑M33`, `C‑M35`.
  - **ChatGPT:** `C‑A16` (texturas PBR para GLB) y `C‑A17` (portada pintada).
- **Riesgos que dejo:**
  - Manhattan (`nueva_york`) consume **215,3 MB de JS Heap** (`262,4 MB` reservados) al descomprimirse completo: riesgo alto de cierre por memoria en celulares de 2–3 GB hasta completar `C‑M34`.
  - Ninguna captura de *Turno Cero* principal corrió aún sobre WebGL con GPU física (solo respaldo 2D en VM); la escena de Codex sí validó WebGL2 por SwiftShader.
  - `pruebas/getaway-3d.mjs` usa `headless: false` y requiere `xvfb-run` en Linux sin X11.
- **Instrucción obligatoria para la siguiente IA (Claude, Codex, ChatGPT o quien siga):** antes de cerrar tu turno, **DEBE quedar tu propio documento de contexto y relevo**: añade tu entrada aquí en `CONTEXTO-RELEVO.md` § 8 (sin borrar las entradas anteriores), actualiza § 3/§ 5 si cambiaron, actualiza tu ficha en `coord/agentes/<tu-id>.json`, deja un mensaje nuevo en `coord/buzon/` y **especifícale exactamente esta misma regla a la siguiente IA** para que nunca se pierda el hilo del proyecto.
### ChatGPT · 20–21 nov 2026 · integración Claude 4.0.2, Gemini PR #8 y nuevos QA
- Merge de dos padres de `main` (Claude 4.0.2) con la rama PR #7 sin pisar las mecánicas de Run, carreras y accesibilidad.
- Importación literal de 18 archivos artísticos de Gemini, 17 informes/capturas y 3 registros de coordinación de PR #8; los originales y la autoría permanecen inalterados.
- G-H21/22/23: 8 correcciones geográficas, finca ficticia en punto con acceso al agua verificado por Gemini, 28 paradas originales con rutas/tipo, subtítulos y lenguaje con gramática correcta.
- C-M32/31/34/35: persecución sin visión a través de muros, planeta responsive con etiquetas, caché de mundo anterior liberada al entrar, piezas 2D además de 3D. C-A16: seis modelos con UV/PBR 1024 generables y validables.
- Corregido campo EDJ de geometría de paradas y controles de señuelo en móvil.
- **Pendiente:** CI del último HEAD, GPU/RAM física, streaming MC4, PBR en shader y arte final de mallas. No fusionar PR #7 hasta verificar.
### ChatGPT · 20-nov-2026 · C-M34, robustez de caché por sectores
- **Hecho en rama aislada** ia/chatgpt/cm34-cache-20261120: refuerzo de MC.Sectores1km; evita la reintroducción/expulsión constante cuando el radio supera maxSectores, prioriza el sector central y rechaza coordenadas NaN/Infinity.
- **Pruebas verificadas en contenedor local:** node --check y 5/5 grupos Node con el módulo real; prueba integrada en workflow para que se ejecute CI en PR.
- **Investigación:** Build (sectores), Quake (PVS), GTA III (streaming/LOD), Godot (HLOD) y MDN WebGL. Detalles y fuentes: reportes/2026-11-20-chatgpt-cm34-sectores-y-motores.md.
- **No hecho:** bytes MC4 cargados bajo demanda (no existe streaming real), pruebas completas Chromium y teléfonos GPU. No se tocaron juegos, binarios, ni ramas ajenas.
- **Relevo:** ficha propia coord/agentes/chatgpt-cm34.json y mensaje coord/buzon/20261120-2318-chatgpt-cm34.md. Claude debe revisar integración y versión; Gemini puede tomar perfil base VM. La siguiente IA también debe dejar su entrada.
### ChatGPT · 20-nov-2026 · continuación C-M34 por capas offline
- **Implementado en rama aislada PR #9:** API `MC.Mundo.desdePaquete/cargarPaquete` para descompresión por capa, empaquetador seguro en `herramientas/construir.mjs` activable con `mundos_capas:true`. Turno Cero usa el formato en sus tres ciudades; lector viejo se conserva.
- **Cobertura añadida:** `pruebas/paquete-capas-cm34.mjs` confronta los bytes de las capas empaquetadas con los tres MC4 originales; `pruebas/paquete-capas-browser.mjs` abre el HTML offline en 412×860, inicia Calle libre y consulta las tres ciudades. Ambas integradas en GitHub Actions.
- **Trazabilidad:** `docs/MC4-CAPAS-OFFLINE.md` y `reportes/2026-11-20-chatgpt-cm34-sectores-y-motores.md`.
- **Pendiente real:** aprobar CI del último commit y medir recursos en dispositivos físicos, luego dividir datos dentro de cada capa por región. La capa `suelo` todavía se infla completa; no confundir con streaming espacial de 1 km.
- **Coordinación:** Claude revisar código del motor y fijar versión si integra; Gemini medir memoria/rendimiento; IA ChatGPT siguiente continuar índices espaciales. Mantener ramas independientes y entradas aditivas.
### Gemini · Antigravity («hydrogen») · 21‑nov‑2026 (fase 2) · sincronizado a 4.0.2, revisión del PR #7 y paquete de arte pintado (`ia/antigravity/motorcity-4.0`)
- **Hecho (en respuesta al relevo de ChatGPT `MOTOR_CITY_4_0_X_RELEVO_GEMINI_CHATGPT_NUEVA_FASE.md` y al pedido de mejorar arte y tecnología):**
  - **Revisión técnica, visual y de memoria del PR #7:** reporte [`reportes/2026-11-21-gemini-revision-pr7.md`](reportes/2026-11-21-gemini-revision-pr7.md) + 2 capturas WebP (`reportes/img/pr7-revision/`), confirmando `151/151` navegador, 3/3 CI, `gu_finca` aprobada (`agua40m: true`), y detectando la retención multi-ciudad (`201,3 → 258,9 MB` / `316 MB` reservados al pasar NY → Medellín), recorte/etiquetas de `MC.GloboGPU` y falta de respaldo 2D de `MC.Piezas`.
  - **Arte pintado aditivo para *Turno Cero* (`arte/gemini/turno-cero/`, `1,2 MB` total WebP, sin texto):** portada vertical `1080×1920`, 5 láminas de acto `1280×720`, atlas PBR 3×3 `1024×1024` + 9 losetas `256×256`, `catalogo.json` y galería offline interactiva `arte/gemini/turno-cero/galeria.html` (verificada `412×860` y `1280×800`, `0` errores).
### Gemini · Antigravity («hydrogen») · 21‑nov‑2026 (fase 3) · sincronizado a 4.0.3 e ingeniería inversa limpia de motores clásicos (`ia/antigravity/motorcity-4.0`)
- **Pedido del autor:** investigar motores viejos/descontinuados livianos pero potentísimos en sus años de gloria, documentar cómo los explotaron los mejores juegos y adaptar sus algoritmos (en sala limpia y sin dependencias) a Motor City.
- **Hecho (100 % aditivo, 0 ediciones en `js/`, `herramientas/`, `pruebas/` ni `juegos/getaway/` sobre 4.0.3 `ae098eb`):**
  - **Guía técnica y legal de 10 motores clásicos:** [`docs/MOTORES-CLASICOS-INGENIERIA.md`](docs/MOTORES-CLASICOS-INGENIERIA.md) — RenderWare 3.x (*GTA III–SA*, *Burnout 3*), id Tech 1–3 (*Doom/Quake*), Build Engine (*Duke Nukem 3D/Blood*), Voxel Space (*Comanche/Outcast*), Reflections (*Driver* PS1 en 2 MB RAM), GOAL (*Jak & Daxter* PS2), Team ICO (*Shadow of the Colossus*), Team Silent (*Silent Hill* PS1), Unreal Engine 1 y motores permisivos auditables (Cube 2 `zlib`, Irrlicht `zlib`, Torque 3D `MIT`), con matriz de licencias *clean-room* y mapa exacto hacia `js/`.
  - **Módulo listo para integrar en sala limpia:** [`experimentos/tecnicas-clasicas/mc-clasico.js`](experimentos/tecnicas-clasicas/mc-clasico.js) (estilo `/* */`, cero `//`, cero dependencias):
    - `StreamAnillo` (RenderWare `CStreaming` + GOAL): presupuesto rígido en KB, prefetcheo predictivo por vector de velocidad, LRU y evacuación 100 % al cambiar de ciudad;
    - `CulleoUrbano` (Silent Hill `farPlane = fogEnd` + Build Engine horizonte 1D): descarta **89,6–94,8 %** de edificios ocluidos/fuera de niebla en cañones urbanos;
    - `PVSRejilla` + RLE + `hornearAOUrbano` (Quake / id Tech 2–3): bitset PVS `O(1)` con compresión RLE exacta bit a bit + oclusión ambiental horneada por callejón para modelos *low-poly*;
    - `VoxelTerreno` (Comanche / Outcast): raycaster 2.5D de mapa de alturas puro en CPU (`0,4 ms/cuadro` en Canvas 2D, 0 WebGL) sobre relieve de Guatapé y la Piedra del Peñol;
    - `FisicaDriver` + `PoolParticulas` (Driver PS1 + Burnout 3): suspensión blanda de 4 resortes (cabeceo/balanceo/derrape) + pool circular `Float32Array` sin *garbage collection*;
    - `EscaladorDinamico` (Shadow of the Colossus): lazo cerrado EMA para sostener 60 FPS ajustando DPR y distancia de niebla.
  - **Suite unitaria:** [`experimentos/tecnicas-clasicas/prueba-clasico.mjs`](experimentos/tecnicas-clasicas/prueba-clasico.mjs) (**6/6 bloques en verde**).
  - **Laboratorio interactivo jugable offline:** [`experimentos/tecnicas-clasicas/laboratorio.html`](experimentos/tecnicas-clasicas/laboratorio.html) con 4 pestañas en vivo (Cañón Urbano con toggles, Vuelo Voxel Space 60 FPS sobre Guatapé, Simulador `CStreaming` RenderWare y Catálogo de 10 motores).
- **Cómo lo probé:**
  - `node experimentos/tecnicas-clasicas/prueba-clasico.mjs`: **6/6 en verde** (presupuesto `≤ 8192 KB`, `94,8 %` descarte en cañón, RLE bit-exacto, Voxel Space OK, Driver sin `NaN`, Escalador convergente);
  - `laboratorio.html` verificado en Chromium (`1280×800` y `412×860`): `89,6 %` descartados en vivo (`0,2 ms`), Voxel Space `0,4 ms` (`5.448` columnas), `0` errores, `0` desborde horizontal, y corregido contraste WCAG AA en botones de ciudad tras revisar capturas a ojo;
  - `node motor.mjs prueba` + `node pruebas/getaway-contenido.mjs` sobre la rama sincronizada con **4.0.3** (`ae098eb`) y `node motor.mjs documento` regenerado.
- **Falta:**
  - **Claude / Codex:** integrar las técnicas ya probadas de `mc-clasico.js` en `js/13-planeta.js` (`StreamAnillo`: evacuar ciudad previa para eliminar el salto a `258,9 MB`), `js/45-gl.js` (`CulleoUrbano` + `hornearAOUrbano`), `js/32-fisica.js`/`js/45-glb.js` (`FisicaDriver` + `PoolParticulas`), `js/40-vistas.js` (`EscaladorDinamico`), y adoptar/combinar `arte/gemini/turno-cero/`; además revisar § 5 filas 1, 7–12 (celular real GPU, EnCicla Codex, El Metro Z3–Z5 en `MetroZero`).
- **Instrucción obligatoria para la siguiente IA (Claude, Codex, ChatGPT o quien siga):** antes de cerrar tu turno, **DEBE quedar tu propio documento de contexto y relevo**: suma tu entrada aquí en `CONTEXTO-RELEVO.md` § 8 (sin borrar las anteriores), actualiza § 3/§ 5 si cambiaron, actualiza tu ficha en `coord/agentes/<tu-id>.json`, deja un mensaje nuevo en `coord/buzon/` y **especifícale exactamente esta misma regla a la siguiente IA**.
### Gemini · Antigravity («hydrogen») · 21‑nov‑2026 (fase 4) · datos reales MC4 en técnicas clásicas, verificación visual 4.0.3 y auditoría PR #9 (`ia/antigravity/motorcity-4.0`)
- **Hecho (100 % aditivo, cero cambios en `js/`, `herramientas/`, `pruebas/` ni `juegos/getaway/`):**
  - **Conexión de técnicas clásicas a los MC4 reales (`datos/{guatape,medellin,nueva_york}/mundo.mc4`):**
    - [`experimentos/tecnicas-clasicas/extraer-mc4-demo.mjs`](experimentos/tecnicas-clasicas/extraer-mc4-demo.mjs) + [`benchmark-mc4-real.json`](experimentos/tecnicas-clasicas/benchmark-mc4-real.json) + [`datos-reales-mc4.js`](experimentos/tecnicas-clasicas/datos-reales-mc4.js) (`101,7 KB`): extrae relieve **SRTM/NASA real** de Guatapé (`1.813–2.028 m`) y Medellín (`1.446–2.789 m`) y huellas reales Overture/OSM de Manhattan Chelsea (`309` edificios), Midtown (`231`), El Poblado (`518`) y Centro Medellín (`520`);
    - **Benchmarks medidos sobre edificios reales:** `CulleoUrbano` (Build 1D + Silent Hill) descarta **94,8 %** en Chelsea (`309 → 16` en `1,89 ms`), **93,5 %** en Midtown (`231 → 15`), **95,0 %** en El Poblado (`518 → 26`, PVS RLE `-62 %`) y **94,4 %** en Centro Medellín (`520 → 29`); `VoxelTerreno.cargarDesdeSnapshot` dibuja Guatapé SRTM real en **`0,99 ms/cuadro`** en Canvas 2D puro (`0 WebGL`);
    - actualizado [`experimentos/tecnicas-clasicas/laboratorio.html`](experimentos/tecnicas-clasicas/laboratorio.html) para jugar/volar directamente sobre Manhattan Chelsea/Midtown, El Poblado y el SRTM real de Guatapé y el Valle de Aburrá.
  - **Verificación visual de 4.0.3 y auditoría completa de PR #9 (`ia/chatgpt/cm34-cache-20261120`):** [`reportes/2026-11-21-gemini-verificacion-4.0.3-y-pr9.md`](reportes/2026-11-21-gemini-verificacion-4.0.3-y-pr9.md) + 4 capturas WebP (`reportes/img/verificacion-4.0.3/`):
    - **4.0.3 confirmado corregido:** portada 18+ completa sobre el pliegue en `412×860` y `G CEBO` limpio en `turno-cero-accion-3d.html`;
    - **REGRESIÓN VISUAL ALTA encontrada en 4.0.3 (`02-menu-pausa-403.webp`):** al oscurecer el overlay del menú de pausa, la caja del menú quedó desplazada por encima del borde superior en `412×860`, cortando el título y los primeros 4 botones (`▶ Seguir`, `Cámara`, `Sonido`, `Lenguaje`);
    - **PR #9 (`C‑M34` paquete por capas):** `construir.mjs` OK, `sectores-cm34.mjs` 5/5 OK, `paquete-capas-cm34.mjs` OK y `paquete-capas-browser.mjs` OK (`0` errores); baja el arranque HTML **-60 %** (`1.748 → 693 ms`) y el heap inicial de NY (`231,2 → 218,7 MB`), **pero tanto 4.0.3 (`270,7 MB`) como PR #9 (`279,6 MB` / `328,1 MB` reservados) siguen acumulando las 3 ciudades en RAM al viajar `NY → MD → GU`** por falta de evacuación en `MC.Planeta`.
- **Cómo lo probé:**
  - `node experimentos/tecnicas-clasicas/extraer-mc4-demo.mjs` sobre los 3 `mundo.mc4` reales;
  - `node experimentos/tecnicas-clasicas/prueba-clasico.mjs` (**6/6 verde**, ahora cubriendo también `VoxelTerreno.cargarDesdeSnapshot` con SRTM real de Guatapé);
  - verificación visual en Chromium de `laboratorio.html` (datos reales Chelsea + Guatapé SRTM) y de `4.0.3` (`412×860`), + benchmark comparativo CDP `4.0.3` vs `PR #9`;
  - `node motor.mjs prueba` y `node pruebas/getaway-contenido.mjs` en verde + `node motor.mjs documento` regenerado.
- **Falta (prioridad inmediata para la siguiente IA):**
  1. **Claude (ALTA — 4.0.4):** corregir el centrado vertical/scroll del menú de pausa en `412×860` (`02-menu-pausa-403.webp`: usar `align-items: flex-start; overflow-y: auto; padding-top: max(16px, env(safe-area-inset-top))` en el overlay de menú) para que `▶ Seguir` vuelva a ser visible;
  2. **Claude / Codex (ALTA):** evacuar el mundo anterior al cambiar de ciudad en `MC.Planeta` (`StreamAnillo.cambiarCiudad`, ahorra ~`190–210 MB` tanto en `4.0.3` como en `PR #9`);
  3. **Claude / Codex:** integrar `CulleoUrbano` (`93,5–95,0 %` descarte medido en MC4 real), `hornearAOUrbano`, `FisicaDriver`, `PoolParticulas` y `EscaladorDinamico` de `mc-clasico.js`, corregir encuadre/etiquetas de `MC.GloboGPU` y adoptar `arte/gemini/turno-cero/`;
  4. **Autor / QA físico:** medición real con GPU física en celular Android/iOS (tabla § 1.3 de `reportes/2026-11-21-gemini-turno-cero.md`).
- **Instrucción obligatoria para la siguiente IA (Claude, Codex, ChatGPT o quien siga):** antes de cerrar tu turno, **DEBE quedar tu propio documento de contexto y relevo**: suma tu entrada aquí en `CONTEXTO-RELEVO.md` § 8 (sin borrar las anteriores), actualiza § 3/§ 5 si cambiaron, actualiza tu ficha en `coord/agentes/<tu-id>.json`, deja un mensaje nuevo en `coord/buzon/` y **especifícale exactamente esta misma regla a la siguiente IA**.

### Gemini · Antigravity («hydrogen») · 21‑nov‑2026 (fase 5) · sincronizado a 4.1.0 y auditoría completa `G‑H25`, `G‑H26`, `G‑H27` y `G‑H28` (`ia/antigravity/motorcity-4.0`)
- **Hecho (todas las tareas de Gemini en `TAREAS-IA.md` § 4.1 completadas, 100 % aditivo, 0 ediciones en `js/`, `herramientas/`, `pruebas/` ni `juegos/`):**
  - **Sincronización con Motor City 4.1.0 (`2d4118f`):** fusionado `origin/main` limpio sin tocar archivos del motor ni del juego.
  - **`G‑H25`, `G‑H26` y `G‑H28`:** reporte [`reportes/2026-11-21-gemini-clasicos-4.1.md`](reportes/2026-11-21-gemini-clasicos-4.1.md) + **18 capturas WebP `412×860`** (`reportes/img/clasicos-4.1/`, `455,5 KB`, revisadas visualmente una por una):
    - **`G‑H25` (🏁 Arcade y ⛰️ Vuelo · ciudad y carretera · día y noche):**
      - `MC.VoxelSpace` corrió fluido en VM (`vistasMs p50 = 1,49–2,79 ms`, `cuadroMs p50 = 33,3 ms`) y superó el estrés de avanzar `626–782 m` (Medellín, Ruta del Atlántico y Guatapé) reconstruyendo la ventana por franjas en ~`1,0 s` sin congelar (`preparar` inicial `57,6–102,4 ms`; pico aislado `288 ms` al reasignar 2,8 MB en `_iniciar`);
      - **BUG VISUAL ALTA en `MC.Arcade` (`js/47-clasicos.js:152`):** en giros/pendientes urbanas (p. ej. Calle 9, El Poblado), no pinta fondo debajo del horizonte (`hor..H`), dejando el **32–35 % inferior del lienzo congelado** con el mapa anterior o un «doble carro fantasma» (`03-arcade-poblado-dia.webp`, `04-arcade-poblado-noche.webp`); además el haz `lighter` nocturno sobreexpone el horizonte a blanco (`07-arcade-horizonte-noche.webp`) y los trapecios dejan costuras de 1 px.
      - Incluye plantilla en blanco (§ 1.4) para la medición en celular físico con GPU.
    - **`G‑H26` (Sigilo a lo Thief en Muelle 4 y Bodega 9):**
      - `#gema` (`37×37 px`) se ubica bien en `412×860` (`y=631..667`, `0` solapamientos), y el oído `MC.Sigilo.ruido` sí rodea muros (`6,3 m` recto → `9,7 m` rodeando, caminar lento `0` alertas);
      - **BUG CRÍTICO MÓVIL (`juegos/getaway/20-juego.js:200` + `55-clasicos.js:24,27`):** `js/33-controles.js:50` liga `correr` a `B.has('correr')`, pero en móvil solo existe `⚡` (`turbo`). Medido: **`vMaxMovilConTurbo = 1,53 m/s`** frente a **`vMaxTecladoShift = 4,52 m/s`** — en celular es **imposible correr a pie y activar `👂 Un guardia oyó tus pasos` (`v > 4,2`)**, y Mara queda permanentemente `agachado: true` (`1,53 < 1,6`). Además, los faros del tráfico suman luz de día y a través de muros.
    - **`G‑H28` («Mundo abierto primero» en 3 juegos):**
      - **Turno Cero 4.1.0: ✅ CUMPLE** (`▶ Jugar · mundo abierto` → Medellín en **`1,99 s`** y 1 toque, `📖 Historia` visible en 4 puntos, `Entrar directo` salta portada en `1,99 s` y `?portada` la devuelve). **Persiste el bug ALTA de 4.0.3 en `⏸ Menú`** (`primerBotonTop: -259 px` con 11 opciones).
      - **El Metro (`MetroZero` `v0.2.0`): ❌ PENDIENTE** (`▶ JUGAR` abre `MODOS` con `Historia` #1 y `Ciudad Libre` #3 cortado → 2º toque abre grilla con **14/15 estaciones bloqueadas**, requiere **3 toques** + tiene 3 `404` de favicon y textos sobre ilustraciones).
      - **Juega EnCicla (`BicicletasUno` `v1.7.1`): ❌ PENDIENTE** (`▶ Jugar` abre modal **`BIENVENIDA · 1 DE 4`** y tras `Saltar` abre un **2º muro modal obligatorio `Crea tu personaje`** con botón bajo el pliegue → requiere **≥ 4 toques + scroll**).
  - **`G‑H27` (Catálogo ampliado de técnicas clásicas en sala limpia):** [`reportes/2026-11-21-gemini-tecnicas-clasicas-extra.md`](reportes/2026-11-21-gemini-tecnicas-clasicas-extra.md) con fuentes públicas y licencias verificadas para ***Driver***, ***Midtown Madness*** (ARTS/AGE), ***Hard Drivin'***, ***Stunt Car Racer***, ***Crazy Taxi*** (+ nota de patente expirada US 6,200,138), ***The Getaway***, ***Burnout 3***, ***Jak & Daxter***, ***Shadow of the Colossus***, ***Silent Hill***, ***Unreal 1*** y 3 motores permisivos auditables (**Cube 2 `zlib`**, **Irrlicht `zlib`**, **Torque 3D `MIT`**).
  - **Protocolo `coord/`:** actualizados `coord/agentes/antigravity.json` (`base: "2d4118f"`, `version_motor: "4.1.0"`), `reportes/README.md` y buzón `coord/buzon/20261121-0530-antigravity-clasicos-4.1.md`.
- **Cómo lo probé:**
  - `node motor.mjs prueba` (**141/141 verde**, `13,6 s`), `node pruebas/getaway-contenido.mjs` (**verde**), `node experimentos/tecnicas-clasicas/prueba-clasico.mjs` (**6/6 verde**);
  - Playwright `412×860` DPR 2 sobre `dist/juegos/getaway.html` (`0` errores consola), `MetroZero/dist/index.html` (`3` errores `404` favicon) y `BicicletasUno/dist/juega-encicla.html` (`0` errores), con 18 capturas WebP inspeccionadas visualmente;
  - verificado `git diff origin/main -- js/ herramientas/ pruebas/ juegos/` vacío (0 ediciones en código del motor/juego) y `node motor.mjs documento` regenerado.
- **Falta (prioridad inmediata para la siguiente IA):**
  1. **Claude (URGENTE — 4.1.1):**
     - pintar fondo inferior `fillRect(0, hor, W, H - hor)` en `MC.Arcade` (`js/47-clasicos.js:152`) + bajar `lighter` nocturno y solapar `±0,6 px` en `trap()`;
     - mapear `⚡` a `e.correr` cuando `V.clase === 'pie'` (`juegos/getaway/20-juego.js:200`), ajustar `agachado` (`v < 1.0`) y pasos (`C.corriendo && v > 2.8`), y filtrar faros de tráfico por `noche` + `!MC.DDA.bloqueado` (`55-clasicos.js`);
     - corregir recorte superior de `⏸ Menú` (`-259 px` en `412×860`, `js/56-ui.js`);
     - evacuar ciudad previa en `MC.Planeta` (`StreamAnillo`, ahorra ~190–210 MB) y usar doble buffer en `MC.VoxelSpace._iniciar`.
  2. **Codex / Claude (`G‑H28` en juegos hermanos):** alinear `MetroZero` (1 toque a Ciudad Libre + 15 estaciones libres + arreglar 3 `404` favicon) y `BicicletasUno` (1 toque a pedalear sin bloquear con `BIENVENIDA` ni `Crea tu personaje`).
  3. **Codex (4.1 fuertes):** `C‑M37` (PVS Quake Manhattan), `C‑M38` (portales Build), `C‑M39` (COLORMAP Doom), `C‑M40` (direccionales *The Getaway*), `C‑A18` (capas Arcade por bioma), además de `arte/gemini/turno-cero/` y `mc-clasico.js`.
  4. **Autor / QA físico:** llenar tabla § 1.4 de `reportes/2026-11-21-gemini-clasicos-4.1.md` (Arcade/Vuelo) y tabla § 1.3 de `reportes/2026-11-21-gemini-turno-cero.md` en celular físico con GPU.
- **Instrucción obligatoria para la siguiente IA (Claude, Codex, ChatGPT o quien siga):** antes de cerrar tu turno, **DEBE quedar tu propio documento de contexto y relevo**: suma tu entrada aquí en `CONTEXTO-RELEVO.md` § 8 (sin borrar las anteriores), actualiza § 3/§ 5 si cambiaron, actualiza tu ficha en `coord/agentes/<tu-id>.json`, deja un mensaje nuevo en `coord/buzon/` y **especifícale exactamente esta misma regla a la siguiente IA** para que nunca se pierda el hilo del proyecto.
### ChatGPT · 21-nov-2026 UTC · Motor City 4.1 · memoria de MC.Planeta (rama separada)
- Sobre `main` 4.1.0 se implementó `MC.Planeta` single-flight para evitar varias descompresiones de la misma ciudad concurrentes, LRU auténtico con reserva de ciudad activa, presupuesto `maxMundos` y `diagnosticoCache()`.
- Turno Cero marca su ciudad actual con `planeta.fijar(id)`, sin modificar misiones ni narrativa.
- Pruebas adicionales: 7 casos Node de carga/fallo/concurrencia/LRU, y Chromium offline para partida y cambio real Guatapé → Medellín. Añadidas a CI, sin borrar pruebas existentes.
- Guía `docs/PLANETA-CACHE-CONCURRENCIA.md`; informe `reportes/2026-11-21-chatgpt-planeta-cache-410.md`; relevo `coord/buzon/20261121-chatgpt-planeta-cache-410.md`.
- Esta entrega es independiente de PR #9: no se toca el empaquetado MC4 por capas, tampoco hay streaming espacial ni benchmark de GPU física. Revisar CI antes de integrar.

### ChatGPT · 21-nov-2026 · C-M34 streaming territorial y memoria 4.2 (PR #11)

- **Estado del trabajo:** rama `ia/chatgpt/cm34-spatial-420-20261121` sobre `main` 4.2.0, PR #11 en borrador. PR #9 ya fue fusionada; PR #10 pasó CI pero quedó conflictiva con cambios de 4.2.
- **Implementado:** builder divide `suelo/nivel` en sectores de aproximadamente 1 km comprimidos por separado; `MC.RasterMC4` decodifica por casilla usando LRU de 16 sectores por raster y materializa capa entera solo si se le pide expresamente; resto del MC4 queda compatible. `juego.json` usa `mundos_rasters:true`.
- **Motor Planeta:** portado de PR #10 con LRU real, single-flight, reserva de mundo activo y `liberarExcepto(id)`; se conserva el id de rutas y se evita resucitar precargas viejas tras cambio de ciudad.
- **Pruebas y correcciones:** `pruebas/raster-sector-cm34.mjs`, `pruebas/paquete-capas-cm34.mjs` (tres ciudades, equivalencia completa de los bytes de `suelo/nivel`), `pruebas/planeta-cache-cm34.mjs` (nueve escenarios) y dos QA de Chromium. CI inicial corrigió paréntesis extra de raster y una aserción G-H24 acoplada al borrado antiguo. **Consultar CI del último commit** para estado final, no las ejecuciones intermedias.
- **Guía e informe:** `docs/MC4-STREAMING-TERRITORIAL.md` y `reportes/2026-11-21-chatgpt-cm34-streaming-territorial.md`; ficha `coord/agentes/chatgpt-spatial-420.json`; mensaje `coord/buzon/20261121-1015-chatgpt-cm34-spatial.md`.
- **Límites verdaderos:** edificios ED1, grafos de vías y relieve aún no se trocean espacialmente; HTML contiene datos Base64 enteros y la lectura de un nuevo sector es síncrona. Falta perfil físico RAM/FPS, halo para interpolación y continuidad de colisiones.
- **A la IA siguiente:** revisar PR #11 y sus tests primero, medir antes de afirmar mejoras, luego trabajar en ED1, vías y relieve en una rama aislada. Obligatorio sumar entrada propia a este relevo, ficha y buzon sin borrar aportes anteriores.

**Sincronización de la rama:** el motor 4.3.0 avanzó mientras el CI anterior corría. Este relevo se concatena al actual sin borrar entradas de Claude, Gemini y otros agentes; el commit de integración conserva el historial del PR y el de `main`, con CI nuevo exigido.
### Gemini · Antigravity («hydrogen») · 21‑nov‑2026 (fases 5 y 6) · Motor City 4.2.0: pool `MC.Vida` (Burnout 3), escalador `MC.ResDinamica` (SotC), auditoría `G‑H25..28`, verificación RAM post-GC y PR #10 (`ia/antigravity/motorcity-4.2`)
- **En respuesta directa al pedido de Claude (`coord/buzon/20261121-1800-claude-4.2.md`):**
  - **`js/88-vida.js` (`MC.Vida` · pool circular sin basura, técnica *Burnout 3*):** banco preasignado de `260` ranuras, `emitir()` en `O(1)` sin `shift()` y `actualizar()` con *swap-and-pop* `O(1)` sin `splice()`, auto-recuperación si código externo limpia `V.P.length = 0`, y `MC.Vida.poolDiagnostico()`. **Medido (`pruebas/vida-y-resdinamica.mjs`):** `20.000` emisiones en `500` cuadros en **`36,03 ms`** (`0,072 ms/cuadro`), **`creados: 260`** exactos (`0` basura en ejecución, `0` fugas).
  - **`js/05-gpu.js` + `js/46-vistas.js` (`MC.ResDinamica` · técnica *Shadow of the Colossus*):** lazo cerrado EMA con zona muerta (`[72 %..92 %]` del objetivo), respuesta asimétrica, cuantización `escalaPaso` (`0,05`) con enfriamiento (`8` cuadros) para evitar redimensionar el lienzo 3D cada cuadro, `factorNiebla` acoplado (`0,62..1,00` expuesto en `E.factorNiebla`) y `diagnostico()`. **Medido:** `0` cambios en `300` cuadros dentro de zona muerta; `3` cambios al caer a `0,50` bajo `40 ms`; pasa intacta `pruebas/prueba.mjs:102`.
  - **Suite unitaria nueva:** [`pruebas/vida-y-resdinamica.mjs`](pruebas/vida-y-resdinamica.mjs) (**7/7 en verde**).
- **Auditoría completa 4.1 (`G‑H25..28`, incorporada aquí tras cierre de PR #8) y verificación 4.2.0 + PR #10:**
  - [`reportes/2026-11-21-gemini-clasicos-4.1.md`](reportes/2026-11-21-gemini-clasicos-4.1.md) + 18 WebP (`455,5 KB`): `G‑H25` (Arcade/Vuelo + bug ALTA `hor..H` congelado en ciudad + plantilla celular físico), `G‑H26` (sigilo Thief + bug ALTA móvil `⚡` no activa `e.correr` a pie: `1,53 m/s < 4,2`) y `G‑H28` (Turno Cero 4.1+ cumple en 1 toque; El Metro `v0.2.0` exige 3 toques y bloquea 14/15 estaciones + 3 `404` favicon; EnCicla `v1.7.1` bloquea con 2 modales seguidos `BIENVENIDA 1/4` + `Crea tu personaje`).
  - [`reportes/2026-11-21-gemini-tecnicas-clasicas-extra.md`](reportes/2026-11-21-gemini-tecnicas-clasicas-extra.md) (`G‑H27`): catálogo en sala limpia de 14 clásicos y motores permisivos (*Driver*, *Midtown Madness* ARTS/AGE, *Hard Drivin'*, *Stunt Car Racer*, *Crazy Taxi*, *The Getaway*, *Burnout 3*, *Jak & Daxter*, *Shadow of the Colossus*, *Silent Hill*, *Unreal 1*, Cube 2 `zlib`, Irrlicht `zlib`, Torque 3D `MIT`).
  - [`reportes/2026-11-21-gemini-4.2-pool-escalador-y-pr10.md`](reportes/2026-11-21-gemini-4.2-pool-escalador-y-pr10.md) + 4 WebP (`108,5 KB`):
    - **✅ Memoria multi-ciudad 4.2.0 post-GC (`HeapProfiler.collectGarbage`):** `Medellín 51,5 MB → Manhattan 197,3 MB → Guatapé 8,4 MB → Medellín 51,9 MB` (**fuga multi-ciudad 100 % eliminada**, `-188,9 MB` liberados al salir de Manhattan);
    - **✅ Portada 4.2.0 con arte pintado de Gemini y `MC.GloboGPU`:** verificados limpios en `412×860`;
    - **⚠️ `⏸ Menú` en 4.2.0 (`02-menu-pausa-420.webp`):** sigue cortado por arriba (`primerBotonTop: -224 px` en `412×860`);
    - **PR #10 (`ia/chatgpt/planeta-cache-410-20261121`):** diseño excelente (single-flight + LRU + `fijar(id)`), actualmente `CONFLICTING` contra `main` 4.2.0; rebasar preservando la evacuación en `juegos/getaway/20-juego.js:112-114`.
  - `node motor.mjs construir` (compilación limpia de `dist/motor.js`, `dist/juegos/getaway.html`, `dist/juegos/mandados.html`, `dist/motor-city.html`);
  - `node pruebas/vida-y-resdinamica.mjs` (**7/7 verde**);
  - `node motor.mjs prueba --navegador` (**153/153 verde**, `109,1 s`, `0` errores consola, CPU 4× bajo `17 ms`);
  - `node pruebas/paquete-capas-browser.mjs` (**verde**, 3 ciudades offline, `0` errores), `node pruebas/paquete-capas-cm34.mjs` (**verde**), `node pruebas/sectores-cm34.mjs` (**5/5**), `node pruebas/getaway-contenido.mjs` (**verde**), `node experimentos/tecnicas-clasicas/prueba-clasico.mjs` (**6/6**);
  - verificación visual `412×860` + perfilado CDP post-GC + `node motor.mjs documento`.
  1. **Claude (URGENTE — 4.2.1):** integrar esta PR `ia/antigravity/motorcity-4.2` y corregir los 3 bugs ALTA verificados con captura: (a) recorte superior de `⏸ Menú` (`-224 px`, `js/56-ui.js`), (b) fondo inferior `hor..H` + `lighter` nocturno en `MC.Arcade` (`js/47-clasicos.js:152`), (c) botón táctil `⚡` mapeado a `e.correr` a pie + umbrales de sigilo (`juegos/getaway/20-juego.js:200` y `55-clasicos.js:22,24,27`), más margen derecho al rótulo de `56-abierto.js`.
  2. **ChatGPT / Codex (PR #10):** rebasar `ia/chatgpt/planeta-cache-410-20261121` sobre `main` 4.2.0 conservando la evacuación de ciudad previa de `20-juego.js:112-114`.
  3. **Codex / Claude (`G‑H28` en juegos hermanos):** alinear `MetroZero` (1 toque a Ciudad Libre + 15 estaciones libres + arreglar 3 `404` favicon) y `BicicletasUno` (1 toque a pedalear sin bloquear con `BIENVENIDA` ni `Crea tu personaje`).
  4. **Codex (4.1/4.2 fuertes):** `C‑M37` (PVS Quake Manhattan), `C‑M38` (portales Build), `C‑M39` (COLORMAP Doom), `C‑M40` (direccionales *The Getaway*), `C‑A18` (capas Arcade por bioma).
  5. **Autor / QA físico:** completar tabla § 1.4 de `reportes/2026-11-21-gemini-clasicos-4.1.md` en celular físico con GPU.

### Claude · 21‑nov‑2026 · 4.6.0
- **Qué pidió el autor:** el manejo y el movimiento eran injugables (toscos, lentos, derrapes por nada, solo vertical, mapa que congela); basarse en EnCicla y no en El Metro, y arreglar El Metro; un solo juego de prueba con todo (los cuatro dentro de Turno Cero, con lo de EnCicla y El Metro).
- **Qué hice:** el modelo de manejo de EnCicla en el motor (con subpasos y prueba §26), el mapa grande de EnCicla (`js/70-mapa.js`), horizontal en Turno Cero y en los APK, 🎮 Modos en Turno Cero (`juegos/getaway/60-modos.js`: Carreras, Extremo, Mandados, EnCicla, Metro, Laboratorio), y borré `juegos/carreras/` y `juegos/extremo/`. En El Metro también hice el manejo de EnCicla, pero lo retiré: la sesión de El Metro ya lo había publicado en su 3.1.0 «Fluido» (APK 29); en MetroZero solo quedó el motor 4.6.0 y el informe. En EnCicla otra sesión tiene la 2.1.0 en su rama: no avancé su `main` para no estorbarle la unión.
- **Cómo se prueba:** `node pruebas/prueba.mjs` (145), `node motor.mjs prueba --navegador` (157), `node pruebas/modos.mjs` (los cinco modos y el mapa); en los hermanos, sus pruebas con el motor 4.6.0 copiado (EnCicla en verde, El Metro 100 partidas y Run 100 simulaciones con 0 errores).
- **Lo que queda:** la sensación en un celular real (autor) y el globo en la misma escena 3D (C‑M31).

### Claude · 22‑nov‑2026 · 4.6.1
- **Qué pidió el autor:** un botón que, prendido, acelere siempre (el joystick solo para la dirección) y que, al apagarlo, el carro pare.
- **Qué hice:** `acelFijo` en `MC.Manejo.aplicar`, `frenoK` en la física, `ui.alternar` en la interfaz, y ⏫ en Turno Cero (también en el tren de 🎮 Modos), con el HUD ajustado en vertical y en horizontal.
- **Cómo se prueba:** `node pruebas/prueba.mjs` § 27 y `node pruebas/modos.mjs`.
- **Para los juegos hermanos:** está en `motor-city/js/37-manejo.js`; adoptarlo es pasar `acelFijo` al armar la entrada y poner un botón (ver `docs/INFORME-MOTOR-CITY-4.6.md`).


### Codex · 22-nov-2026 · arte y menú sobre 4.6.1

Cinco ilustraciones de actos, limpieza del menú compartido y soporte de pruebas por HTTP. Ver CONTEXTO-CODEX-TURNO-CERO.md para plan, investigación y pendientes. La siguiente IA debe escribir su propio documento de contexto y exigir lo mismo a quien continúe.

### Claude · 22‑nov‑2026 · 4.7.0 (con Gemini y Codex en paralelo)
- **Qué pidió el autor:**
  - revisar el juego contra las referencias y los mejores juegos, investigar y hacer un plan verosímil con la marca de la IA;
  - arreglar los modos;
  - todo liberado y cada modo en el mundo abierto;
  - Run en ciclovías;
  - luego arte y cámaras.
- **Qué hice:**
  - `docs/PLAN-EVOLUCION-CLAUDE.md`;
  - el ritmo arcade, todo liberado, `G.Actividades`, 🛹 trucos, 🛴 en el menú 🎮, cámaras por contexto, la cenital de verdad que se aleja con la velocidad y el volante que avanza de lado;
  - los hallazgos de Gemini en mis zonas.
- **Coordinación:** respetar `coord/agentes/*.json → trabajo_4_7`:
  - Gemini: render y `62-mundo-vivo.js`;
  - Codex: `70-interfaz.js`, `30-historia.js` y el arte.
- **Siguiente (4.8):** las P1 del plan § 10.

### Claude · 22‑nov‑2026 · motor 4.8.0 «Flexibilidad»
- **Pedido:** retomar lo de Gemini y ChatGPT, terminar de unir motor, Turno Cero, EnCicla y El Metro, optimizar y añadir *Flexibilidad* a todo. Luego, en la misma sesión: 🆘 rescate, 🚀 Ir en el mapa, pantalla en mitades y un solo mapa en Turno Cero.
- **Hecho:**
  - **Uniones:**
    - motor ← ramas de ChatGPT, Codex y Gemini;
    - EnCicla 3.1.0 ← 3.0.0 de su otra sesión + GPT-6;
    - El Metro 3.3.0 ← 3.2.0 + Antigravity + Codex + GPT-6. En El Metro, la carrera ya no suma dos arranques (96-arcade y 98a).
  - **Hallazgos cerrados:**
    - los 11 contratos de ChatGPT;
    - el render que Gemini dejó planeado: Raster con tráfico y `aPantalla`, primera persona a la altura de los ojos, luz hemisférica, niebla según el escalador;
    - 🌄 miradores.
  - **⚙️ `MC.Flex`:** 11 ajustes, entre ellos la pantalla en mitades o la clásica. EnCicla y El Metro tienen su propio panel.
  - **Optimización:** el caché de sectores de suelo pasó de 16 a 400 (p95 de 166 a 33 ms con CPU 4×) y el minimapa ya no tapa botones en horizontal.
  - **Turno Cero:**
    - `63-rescate.js`;
    - 🚀 Ir y 🌍 en el mapa;
    - mitades en `MC.Controles`.
- **Probado:**
  - motor: `prueba.mjs --navegador`, `modos`, `humano`, `actividades`, `flexibilidad`, `rescate-mapa`, `chatgpt-input-real` y `chatgpt-auditoria-contratos`;
  - EnCicla: `tests/run.js`;
  - El Metro: `tools/test.mjs 100`, con 0 errores.
- **Falta:**
  - subtramas RPG del mundo vivo (plan de Gemini);
  - el ancho de la ciclorruta por tipo en Run;
  - el globo dentro de la misma escena 3D (#60);
  - pasar el «Ir» y las mitades a EnCicla y El Metro si el autor lo pide.
- **Riesgo:**
  - `pruebas/modos.mjs` falló una vez y pasó al repetirla: vigilar si es intermitente;
  - con 400 sectores, el caché de suelo usa hasta unos 4 MB.

### Claude · 22‑nov‑2026 · motor 4.9.0 «Realismo»
- **Pedido:** «los gráficos aún son básicos». El autor aprobó incrustar three.js: «haz todo lo que propones y sigue mejorando».
- **Hecho:**
  - three.js 0.170 (MIT) dentro de `motor.js`, sin internet;
  - `MC.VistaTres` (`js/45-tres.js`) sobre las mismas mallas: sol con sombras, luz física, cielo, exposición neutra, ventanas de noche, grano en muros y suelo;
  - ⚙️ Gráficos;
  - `docs/PLAN-REALISMO.md`, con lo que sigue en datos y dibujo.
- **Probado:** `pruebas/tres.mjs` y la batería completa del motor.
- **Falta (por orden):**
  - catastro en todas las comunas;
  - techos de OpenStreetMap;
  - relieve, que exige decidir la licencia;
  - atlas de fachadas pintado;
  - mallas pre-cocinadas por sector;
  - plano histórico de Medellín.
- **Riesgos:**
  - el rendimiento en celulares reales con sombras no se ha medido: aquí no hay GPU, y las pruebas usan WebGL por software;
  - en gama baja, el modo automático usa el clásico.


### Codex · 22-nov-2026 · R1 fachadas de Medellín

Integración en rama ia/chatgpt/r1-fachadas-medellin. Ver reportes/2026-11-22-codex-integracion-arte-chatgpt-r1.md para técnica, capturas, pruebas y límites. R4 y R3 fueron investigados y siguen pendientes. La siguiente IA debe escribir su propio documento de contexto y transmitir la misma instrucción a quien continúe.

### Claude · 23‑nov‑2026 · motor 5.0.0 «Que se sienta»
- **Pedido:** llegar al nivel de San Andreas y Chinatown Wars, sumar a Gemini (vuelve), escribir los prompts de cada IA, revisar lo nuevo de ChatGPT con Codex y retomar lo que quedó.
- **Hecho:**
  - **`MC.Dinamica`** (`js/37-dinamica.js`): manejo real del carro con hoja de manejo, ejes con carga, llantas que se saturan, marchas, resortes y choques con impulso.
  - Ayudas para celular. ⚙️ 🛞 Manejo real (de fábrica en Turno Cero) o arcade.
  - El tono del motor por rpm y la marcha en el velocímetro.
  - El tráfico recibe el golpe (`g.golpe`, y luego vuelve a su carril con `g.off`).
  - El 3D dibuja cabeceo, alabeo y rebote (`Malla.modelo` con `op.cab` y `op.alab`).
- **Unido:**
  - **R1 de Codex:** fachadas en `main`, con copias de juego (1024/512) por `herramientas/fachadas_juego.py`; prueba portable `pruebas/r1-fachadas.mjs` en la QA.
  - **EnCicla 3.2.0** de la otra sesión de Claude: en `main` y en la web, con la APK 3.2.0 en `descargas/`.
- **Pruebas:** `pruebas/dinamica.mjs` (19) y la batería de Turno Cero con el manejo real (humano, modos, actividades, rescate y flexibilidad).
- **Plan y pedidos:**
  - `docs/PLAN-5.0.md`;
  - ChatGPT (lo fuerte): `docs/PEDIDOS-CHATGPT-5.0.md`;
  - Gemini (lo fácil y mediano): `docs/PEDIDOS-GEMINI-5.0.md`.
- **Lecciones:**
  - con el mismo agarre en los dos ejes, el carro hacía trompo en curva; las llantas de atrás más rígidas dan el subviraje de un carro de calle;
  - con el joystick hace falta la velocidad pedida del arcade (baja si el dedo apunta de lado) y una reversa corta al quedar trancado;
  - `_obst` se borra en cada `puede()`: hay que leerlo enseguida.
- **Sigue (Claude):**
  - fase 2: eventos y reacciones, escenas de la calle, frases con condiciones y despacho;
  - fase 4: lenguaje de misiones, repeticiones exactas y bot que las gana.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

### ChatGPT · 22-nov-2026 · R3 fuente oficial potencial de pisos
- **Leído:** relevo 4.9, plan de realismo, `docs/PEDIDOS-CHATGPT-4.9.md`, bitácora, documentación del motor, skills y reporte R1 de Codex.
- **Hecho:** localicé la capa municipal `VC_Catastro_VCT/MapServer/8` (Construccion) con geometrías, `numero_pisos`, `numero_sotanos`, `tipo_construccion`, `id_construccion` y SRID 9377, distinta de la capa parcial documentada por Codex. No es evidencia aún de cobertura en todas las comunas.
- **Código:** `geo/auditar_pisos_catastro.py` solicita solo 4 recuentos estadísticos, sin descarga de predios, y solo al activarlo con `--consultar`. Informe `reportes/2026-11-22-chatgpt-r3-catastro-fuente-oficial.md`.
- **Probado:** 7 verificaciones sintéticas y compilación Python 3 aprobadas. Consulta de red, cobertura por comuna, licencia y correspondencia con ED1 pendientes.
- **No tocado:** MC4, `geo/territorio.py`, mundos, guardados, R1 de Codex, V4 de Gemini, ni `main`.
- **Siguiente paso:** verificar licencia, recuentos reales, proyección EPSG:9377, unión geométrica y cobertura por comuna antes de integrar oficialmente los pisos.
- **Coordinación:** `coord/agentes/chatgpt-r3.json` y `coord/buzon/20261122-2055-chatgpt-r3.md`. Al siguiente agente se le pide mantener este relevo §8 con pruebas y límites.

### ChatGPT · 22-nov-2026 · R4 techos Overture (relevo de Codex R1)
- **Contexto leído:** `docs/PEDIDOS-CHATGPT-4.9.md`, `docs/PLAN-REALISMO.md`, `docs/TURNO-CERO.md`, bitácora 4.7–4.9 y las skills del motor. Codex entregó la integración R1 en PR #15, con GitHub Actions en verde y R3/R4 pendientes.
- **Hecho:** nueva herramienta `geo/auditar_cubiertas_overture.py` que mide, sin editar mundo ni hacer red, la cobertura de `roof_shape`, `roof_color`, `roof_material`, `facade_color`, `facade_material`, alturas y pisos en `geo/cache/edificios.parquet`; informe `reportes/2026-11-22-chatgpt-r4-auditoria-overture.md`.
- **Hallazgo:** `geo/fetch.py` ya solicita varios campos de tejado de Overture; `geo/territorio.py` no los selecciona. La caché tampoco preserva el ID Overture en la selección actual, y el MC4 fusionado emplea ED1 de El Metro: falta comprobar la correspondencia de cada huella antes de aplicar datos.
- **Probado:** prueba sintética de ocho condiciones y `py_compile` de Python 3. La ejecución con Parquet real está pendiente; no hay datos para declarar porcentajes de techo.
- **No tocado:** `js/45-tres.js`, R1, `geo/territorio.py`, `herramientas/fusionar.mjs`, `datos/medellin/mundo.mc4`, guardados ni ramas de otras IA.
- **Falta:** medir cobertura con caché, incorporar IDs y una unión geométrica inequívoca; para R3 conseguir pisos oficiales fuera de Popular, El Poblado y Robledo. R5 no se aplica hasta decisión de licencia del autor.
- **Coordinación:** `coord/agentes/chatgpt-r4.json` y `coord/buzon/20261122-2055-chatgpt-r4.md`; Codex conserva `coord/agentes/chatgpt.json` para que no haya conflicto.
- **Siguiente IA:** actualizar también esta sección §8 con los resultados reales, pruebas, limitaciones y riesgos; entregar el mismo contrato al siguiente agente.


### ChatGPT · actualización R4-R3 del 22-nov-2026 · Unión espacial validada sintéticamente
- Se añadieron geo/reproyectar_huellas_fuente.py y geo/cruzar_huellas_seguros.py para convertir WGS84/9377 al MC4 local y rechazar asignaciones erróneas de techos y pisos por intersección, márgenes y duplicados. Ver reportes/2026-11-22-chatgpt-r4-preparacion-cruce.md.
- CI dedicada run 45099980386: 23 comprobaciones sintéticas aprobadas y Python compila; 8 atributos, 8 coincidencias, 7 proyección. Una ejecución anterior falló por literal de nueva línea y se corrigió.
- Aún no hay porcentajes de cobertura real ni licencia oficial verificada para redistribuir datos catastrales; nada se aplicó al MC4 o render. Siguiente agente debe ejecutar la cadena sobre datos autorizados, medir falsos positivos y dejar informe de cobertura por comuna.

### ChatGPT · 22-nov-2026 · R5 relieve (solo informe y licencia)
- **Pedido del autor:** continuar lo pendiente de Codex en orden `docs/PEDIDOS-CHATGPT-4.9.md`, sin tocar `main` ni otros juegos.
- **Investigado:** ficha oficial del MDT LiDAR 2024 de Medellín, malla de **1 m**, **37.639,66 ha**, **EPSG:9377**, generado por la Alcaldía y custodiado/distribuido por IGAC, con licencia declarada **CC BY-SA 4.0**. Universidad de Bristol indica **CC BY-NC-SA 4.0** para FABDEM, por lo que no se incorpora para uso comercial sin permiso. Ver `reportes/2026-11-22-chatgpt-r5-relieve-licencias.md`.
- **Hecho:** informe comparativo de fuentes, obligaciones de licencia, ruta de integración hipotética y condiciones de autorización. **No se descargó ni procesó un MDT; no se modificó MC4 ni código jugable.**
- **Verificado:** metadatos de ICDE/IGAC y fichas de licencia. No pruebas de motor porque esta entrega no lo modifica. La etiqueta «datos descargables» del catálogo no implica que el archivo se haya descargado o se haya comprobado su acceso.
- **Falta:** decisión **expresa del autor** sobre licencia CC BY-SA para la cartografía derivada, verificación del archivo real, precisión y referencia vertical, y pruebas antes de modificar el juego. Mantener el terreno actual mientras tanto.
- **Coordinación:** `coord/agentes/chatgpt-r5.json` y `coord/buzon/20261122-2055-chatgpt-r5.md`, sin pisar Codex R1, ChatGPT R3/R4 o Gemini V4. A la próxima IA le corresponde registrar su trabajo y riesgos en §8.

### ChatGPT · 22-nov-2026 · R6 prehorneado de sectores 1 km y 3 LOD
- **Pedido:** continuar R3/R4/R6 tras la integración R1 de Codex, con Gemini trabajando V4 en paralelo y respetando el plan de Motor City 4.9.
- **Hecho:** `herramientas/precocinar-sectores.mjs` lee MC4 ED1/EDJ y relieve existentes, construye mallas por sector de **1 km**, con LOD 0 (huellas), LOD 1 (cajas orientadas) y LOD 2 (agrupación lejana de 40 m). Exporta deflateRaw, sumas SHA-256, clases y manifiesto. No hay modificaciones del MC4.
- **Pruebas locales:** `node --check` y `node herramientas/precocinar-sectores.mjs --self-test`: 2 sectores, 3 niveles, 46/40/30 triángulos, 873 bytes en fixture, comprobación de EDJ y ED1 sintéticos y de hashes. Se añadió CI de medición con Guatapé real en `.github/workflows/r6-sectores-qa.yml`.
- **Límites:** herramienta de construcción, no activación de render. No afirmar mejora de FPS ni reducción de memoria en teléfono hasta conectar los datos en VistaTres, comparar pesos reales y probar GPU.
- **Falta:** prehornear/medir Medellín real, conectar el lector offline al HTML único con carga diferida y respaldo a malla actual, y ejecutar pruebas completas del motor antes de fusionar.
- **Coordinación:** informe `reportes/2026-11-22-chatgpt-r6-sectores-lod.md`, ficha `coord/agentes/chatgpt-r6.json` y mensaje `coord/buzon/20261122-2055-chatgpt-r6.md`. No tocar R1 de Codex, V4 de Gemini o trabajos R3/R4/R5.
- **Para la siguiente IA:** registrar resultados cuantitativos del MC4 verdadero, pruebas de compatibilidad, riesgos y límites en este relevo §8 antes de cualquier fusión.


### ChatGPT · actualización R6 del 22-nov-2026 · Precocinado medido en Medellín real
- CI específica 45099935194 exitosa: Guatapé 21 sectores/440.925 bytes; Medellín 2.086 sectores, LOD 0/1/2 6.853.547/6.394.570/2.339.000 triángulos y 101.492.868 bytes, 13,17 s de generación. Salida solo LOD 2: 10.646.954 bytes y 2,29 s, ahorro medido del 89,5 % contra los tres niveles; 281 MB RSS del proceso, no memoria GPU.
- El prehorneador usa ahora coordenadas relativas cuantizadas i16 a 5 cm cuando caben, fallback f32 cuando no, opción --niveles para evitar generar bloques no usados y --exportar-huellas para extracción de huellas MC4 con fines de auditoría R3/R4. El MC4 original, guardados, shaders y HTML no se modificaron.
- Es un artefacto de construcción, todavía NO un motor más rápido: un LOD 2 de 2,339 millones de triángulos no debe cargarse completo ni sumarse al HTML sin caché espacial. A la siguiente IA le corresponde medir presupuesto de carga por sector y la reducción de geometría real en VistaTres; registrar resultados de las cuatro suites y no afirmar FPS sin pruebas.
### Gemini · Antigravity («hydrogen») · 23‑nov‑2026 · 5.0 · G5‑01 Vista «Historieta» (Chinatown Wars)
- **Pedido:** `G5-01` de `docs/PEDIDOS-GEMINI-5.0.md` (rama `ia/gemini/g5-01-historieta`).
- **Hecho:**
  - Perfil de cámara `historieta` en `js/34-camara.js` (`pitch: 0.96 rad` ≈ `55°`, `pitchCerca: 0.88`, `fov: 0.68`, `giraRumbo: true`) con rotación suave de `this.yaw` siguiendo el rumbo del vehículo en `_aereo(dt, o)` mediante `resorteAng`.
  - Opción `['historieta', 'historieta: colores planos y contorno negro (Chinatown Wars)']` en `⚙️ Flexibilidad → 🖼️ Gráficos` (`js/37-flexibilidad.js`), conservando la instancia de `VistaTres` y sus regiones 3D al alternar entre `'auto'`, `'realistas'` e `'historieta'` en caliente.
  - Módulo aditivo `js/47-historieta.js` (`MC.Historieta`, sin tocar `js/37-dinamica.js` ni `js/45-tres.js`): casco invertido 3D (`THREE.BackSide` expandido horizontalmente `0.18 m` con sesgo de profundidad `mvPosition.z -= 0.95` en espacio de vista para no oscurecer caras superiores con bobinado CW) sobre las mallas dinámicas de `VistaTres`, más pase de colores planos (4 bandas de cel-shading con saturación `×1.25`) y contorno negro Sobel/Roberts (`#0c0e14`) en búfer `willReadFrequently` legible a `412 × 860`.
  - Prueba automatizada `pruebas/historieta.mjs`, reporte `reportes/2026-11-23-gemini-g5-01-historieta.md` y 4 capturas comparativas WebP en `reportes/img/gemini-g5-01/`.
- **Peso añadido al HTML (`dist/juegos/getaway.html`):** `+3.1 KB` (`js/47-historieta.js` + ajustes mínimos en `js/34-camara.js` y `js/37-flexibilidad.js`).
- **Pruebas:** `node herramientas/construir.mjs`, `node pruebas/historieta.mjs` (`pitchGrados: 55`, `angCamGrados: 55`, `regiones3D: 12`, `cascoTres: true`, `pctContorno: 36.08%`, `hudSolapa: 0`), `node pruebas/dinamica.mjs` (19/19), `node pruebas/modos.mjs`, `node pruebas/humano.mjs` y `node pruebas/prueba.mjs --navegador`.
- **Sigue (Gemini):** `G5-02` (anillos de recoger y entregar en Mandados/EnCicla y controles de vuelo para jetpack y avión en rama `ia/gemini/g5-02-anillos`), `G5-03` (`datos/frases/*.json`) y `G5-07` (fichas de los ~30 sitios icónicos de Medellín empezando por el Edificio Coltejer).
- **Instrucción para la IA que siga:** deja tu entrada en este § 8 de `CONTEXTO-RELEVO.md`, tu mensaje en `coord/buzon/` y actualiza tu ficha en `coord/agentes/`.

### Gemini Antigravity — Motor City V4 · 23‑nov‑2026 · Misión V4: Revolución Visual de los Biomas y el Modo Arcade (`ia/antigravity/v4-paralaje-biomas`)
- **Encargo oficial ([Issue #14](https://github.com/juanfeliperico369-stack/motorcity/issues/14)):** Desarrollar en sala limpia las 18 texturas originales `1024 × 256` RGBA WebP (`6 biomas × 3 capas` de paralaje sin costuras), integrarlas en `MC.Arcade` sobre el mismo mundo 3D con ciclo día/noche/niebla, caché LRU, escalado de calidad, respaldo procedural y mejoras de dirección visual, sin tocar ninguno de los archivos de Codex ni de Claude.
- **Hecho (sobre `origin/main` `f1510e1`, Motor City `4.9.0`, 0 líneas modificadas en `js/45-tres.js`, `js/45-gl.js`, `js/47-clasicos.js`, `arte/fachadas/medellin/`, `geo/territorio.py`, `datos/medellin/mundo.mc4` y `juegos/getaway/60-modos.js`):**
  - **Fase 1 — 18 texturas originales `1024 × 256` RGBA WebP (`arte/arcade/biomas/*.webp`, `540,58 KB` total) + `arte/arcade/biomas/manifiesto.json`:**
    - Biomas con identidad geológica y regional colombiana: `costa` (espuma de rompiente, faro lejano, cocoteros con anillos de corteza y pasto de duna), `desierto` (mesetas estratificadas, barrancos de arenisca roja, cardones acostillados y agaves), `bosque` (cintas de neblina andina, guayacanes amarillos en flor, helechos arbóreos y raíces de contrafuerte), `montana` (clave canónica sin `ñ`: barrancos de la cordillera central, cascada plateada de quebrada andina, talud de tierra colorada y frailejones de páramo), `nieve` (picos glaciares con grietas azul hielo y abetos subalpinos nevados) y `lagos` (monolito granítico estriado estilo Piedra del Peñol, islas con orillas de tierra roja saprolítica de Guatapé y juncos), con `llanura` manteniendo el respaldo procedural para verificar el fallback.
    - Capas: `lejos` (`velocidad: 0.12`), `medio` (`velocidad: 0.35`), `cerca` (`velocidad: 0.70`), transparencia real (`24,6 % – 79,0 %`), fila superior `y = 0` 100 % transparente, iluminación neutra cenital y costura horizontal exacta **`costura_mae = 0.0000`** en los 18 archivos.
  - **Fase 2 — Integración aditiva en `MC.Arcade` (`js/47-paralaje-biomas.js` → `MC.ParalajeBiomas`):**
    - Envoltura no invasiva sobre `Arcade.prototype.dibujar` que reemplaza las 2 montañas procedurales por las 3 capas del bioma detrás de la calzada, árboles, postes, edificios y vehículos (jamás invade la carretera ni el HUD: `difCalzada < 0,36 / 255`).
    - Detección del bioma real del mundo 3D (`M.carretera.bioma(C.y)`) con transición suave (`crossfade`), capa 0 ultra-lejana (`vel: 0.04`) con cirros y bandadas de aves en V, aureola solar crepuscular detrás de la cordillera lejana, velos dinámicos de neblina de valle entre planos (`lejos ↔ medio ↔ cerca`), tinte dinámico día/noche/bruma/niebla/lluvia desde `cieloRetro(E)` (`source-atop`), caché LRU acotada a `<= 2` biomas (`máximo 6 imágenes`), reducción automática de calidad (`calidad = 0.50 → 2 capas`, `calidad = 0.30 → respaldo procedural`) y respaldo procedural automático si falta cualquier textura o en `llanura`.
  - **Fase 3 — Jugabilidad y dirección visual Arcade:**
    - Chevrones diegéticos de anticipación de curvas sobre la cresta exterior del horizonte (`|curva| > 0.14 rad`), inclinación lateral centrífuga en curvas, líneas periféricas de velocidad (`v > 19 m/s`), velo atmosférico de costura en el horizonte y velocidades coprimas `12 : 35 : 70`.
  - **Documentación, pruebas y capturas:**
    - [`docs/PLAN-V4-PARALAJE-GEMINI.md`](docs/PLAN-V4-PARALAJE-GEMINI.md) (incluye síntesis de 5 líneas de la lectura obligatoria y parche opcional de 2 líneas para `js/47-clasicos.js:157`).
    - [`reportes/gemini-v4-paralaje-biomas.md`](reportes/gemini-v4-paralaje-biomas.md) + 27 imágenes WebP en `reportes/img/gemini-v4/` (6 vistas previas de repetición 3× + comparativas antes/después día y noche en `412×860` y `860×412`).
    - [`pruebas/paralaje-biomas.mjs`](pruebas/paralaje-biomas.mjs): suite E2E en Node + Chromium.
- **Cómo lo probé (las 5 órdenes obligatorias de § 7 en verde):**
  - `node herramientas/construir.mjs` (`motor.js` `2478 KB`, `dist/juegos/getaway.html` `26844 KB`, `+751 KB` / `+2,88 %`);
  - `node pruebas/prueba.mjs --navegador` (**158/158 en verde**, `112,2 s`, `0` errores);
  - `node pruebas/tres.mjs` (**en verde**, `VistaTres` día/dron/noche/clásico, `0` errores);
  - `node pruebas/modos.mjs` (**en verde**, carreras, extremo, mandados, EnCicla, metro, acelerador fijo y mapa);
  - `node pruebas/paralaje-biomas.mjs` (**18/18 texturas y 7/7 escenas de bioma en verde**, `costura_mae = 0.0000`, `lruMax = 2`, `imgsEnCache = 6`, `heapMB = 110.6`, respaldo y degradación de calidad verificados).
- **Falta / Siguiente paso:**
  - **Claude:** revisar e integrar el [PR #18](https://github.com/juanfeliperico369-stack/motorcity/pull/18) de `ia/antigravity/v4-paralaje-biomas` en `main` (y opcionalmente aplicar el parche de 2 líneas en `js/47-clasicos.js:157` documentado en `docs/PLAN-V4-PARALAJE-GEMINI.md` § 3.2).
  - **Autor / QA físico:** verificar la sensación visual de los 6 biomas en un celular físico con GPU.
- **Instrucción obligatoria para la siguiente IA (Claude, Codex, ChatGPT o quien siga):** al terminar tu turno, **deja siempre tu propio documento de contexto y relevo**: añade tu entrada aquí en `CONTEXTO-RELEVO.md` § 8 (sin borrar las anteriores), actualiza tu ficha en `coord/agentes/<tu-id>.json`, deja un mensaje en `coord/buzon/` y **especifícale exactamente esta misma obligación a la siguiente IA**.

### Claude · 23‑nov‑2026 · motor 5.1.0 «Todo junto»
- **Unido:**
  - **ChatGPT y Codex:** R3, R4, R5 y R6 (herramientas e informes, sin tocar el juego). Claude corrió el recuento de R3: 1.135.621 construcciones, 96,7 % con pisos.
  - **Gemini y Antigravity:** G5‑01 Historieta y V4 biomas.
  - **EnCicla 3.4.0 y El Metro 3.5.0:** cada uno tenía dos versiones paralelas, de otra sesión de Claude y de Antigravity.
- **Pulido:**
  - Historieta en la GPU (`posRender` y `uPlano` en `VistaTres`; ~2 ms en vez de ~8 ms, sin puntos negros);
  - biomas incrustados al construir;
  - colisión barrida en la carrera por ciclorruta de El Metro.
- **Esperan al autor:**
  - la licencia del catastro (R3);
  - el MDT LiDAR CC BY-SA (R5);
  - medir en un celular real.
- **Sigue (Claude):**
  - **fase 2, la ciudad viva:** eventos que la gente oye y a los que reacciona, escenas de la calle sacadas de las bancas, paraderos y tiendas del mapa, el motor de frases que usará los textos de Gemini (G5‑03) y el despacho de policía, ambulancia y bomberos;
  - **después, fase 4:** lenguaje de misiones, repeticiones exactas y el bot que gana cada misión.
- **Pedidos:** la sección «★ Estado 5.1 y orden nuevo» al principio de `docs/PEDIDOS-CHATGPT-5.0.md` y de `docs/PEDIDOS-GEMINI-5.0.md`.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.
### Gemini · Antigravity («hydrogen») · 23‑nov‑2026 · 5.0 · G5‑02 Anillos de recoger y entregar (Mandados y EnCicla) y controles de vuelo
- **Pedido:** `G5-02` de `docs/PEDIDOS-GEMINI-5.0.md` (rama `ia/gemini/g5-02-anillos`).
- **Hecho:**
  - Módulo aditivo `juegos/getaway/61-anillos.js` (`G.AnillosVuelo`) que proyecta los anillos de recoger y entregar en `📦 Mandados` (`r = 22 m`, `#ffc23a` / `#3fae5a`), `🚲 EnCicla` (`r = 16 m / 14 m`, `#3fae5a` / `#2dd4bf`) y `📞 Contratos` (`r = 18 m`) sobre el asfalto en 3D y 2D (`29` vértices proyectados), con onda concéntrica interior, 4 postes de luz vertical (`z = 0.18..2.1 m`) y arco radial blanco de progreso (`0 % → 100 %`) al esperar dentro del anillo.
  - Botones táctiles `🔼 Subir` (`BOT.sube` / `#bSube`) y `🔽 Bajar` (`BOT.baja` / `#bBaja`, `≥ 48 × 48 px`) en `.vuelo-ctl`, visibles únicamente cuando el jugador lleva `jetpack`, `avioneta` o `avion` (`C.veh.clase === 'aire' || C.veh.vuela`), ubicados fuera de `zonaLibre()` (`412 × 860` y `860 × 412`), con empuje automático de despegue por encima de `vmin` en aeronaves de ala fija y sin activar el freno de mano con `Space`.
  - Ajuste mínimo en `juegos/getaway/60-modos.js`: incluye `'avioneta'` y `'avion'` en el selector de vehículos de `🧪 Laboratorio` y reinicia `m.esp = 0` al completar la fase 0 o salir del anillo en `pasoEnCicla`.
  - Prueba automatizada `pruebas/anillos.mjs`, reporte `reportes/2026-11-23-gemini-g5-02-anillos.md` y capturas WebP en `reportes/img/gemini-g5-02/`.
- **Peso añadido al HTML (`dist/juegos/getaway.html`):** `+9.4 KB`.
- **Pruebas:** `node herramientas/construir.mjs`, `node pruebas/anillos.mjs`, `node pruebas/dinamica.mjs`, `node pruebas/humano.mjs`, `node pruebas/modos.mjs` y `node pruebas/prueba.mjs --navegador`.
- **Sigue (Gemini):** `G5-03` (`datos/frases/*.json` con 200 frases y escenas de la calle en rama `ia/gemini/g5-03-frases`) y `G5-07` (fichas y dibujos de referencia de los ~30 sitios icónicos de Medellín empezando por el Edificio Coltejer).
- **Instrucción para la IA que siga:** deja tu entrada en este § 8 de `CONTEXTO-RELEVO.md`, tu mensaje en `coord/buzon/` y actualiza tu ficha en `coord/agentes/`.

### Claude · 23‑nov‑2026 · motor 5.2.0 «Ciudad viva»
- **Pedido del autor:** «Haz tu parte; en algún momento ya dejarán de proveer, así que retómalos».
- **Hecho:**
  - **Fase 2, la ciudad viva:** `js/26-vida-ciudad.js` (`MC.CiudadViva`: eventos, reacciones, escenas y frases) y `juegos/getaway/66-ciudad-viva.js` (testigos, búsqueda, 🚑 y 🚒 por la ruta real, globos e íconos).
  - **Retomado de Gemini:** G5‑03 (las frases), G5‑06 (retos desde cualquier semáforo, `67-retos-semaforo.js`) y G5‑12 (📏 medir, `68-medir.js`).
  - **Retomado de ChatGPT:** C5‑01, motos y bicis que se inclinan (falta vuelco y deformación); R8, cuartos falsos de noche en las fachadas R1 (falta SSAO, faroles y agua).
  - **Arreglos:** `Vistas.aPantalla` suma la cota en 3D (antes, en Medellín, todo lo dibujado encima quedaba fuera de la pantalla); el manejo real ya arranca con el joystick de lado.
- **Probado:** la batería completa con `ciudad-viva.mjs` (45), `retos-semaforo.mjs`, `medir.mjs` y `dinamica.mjs` (25), más la QA de siempre y `prueba.mjs --navegador`.
- **Esperan al autor:** la licencia del catastro (R3), el MDT LiDAR CC BY‑SA (R5) y **medir en su celular con 📏** (copiar el resultado y pegarlo en el chat).
- **Sigue (Claude):** fase 4 (lenguaje de misiones, repeticiones exactas y el bot que gana cada misión); y lo que las otras IA no alcancen, en el orden de «★ Estado 5.2» de los pedidos.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

### Gemini · Antigravity («hydrogen») · 23‑nov‑2026 · 5.2 · G5‑07 Fichas de los 30 sitios icónicos de Medellín (para C5‑02)
- **Pedido:** `G5-07` de `docs/PEDIDOS-GEMINI-5.0.md` («★ Estado 5.2», rama `ia/gemini/g5-07-sitios` sobre `origin/main` `df80193`).
- **Hecho:**
  - Catálogo completo en `docs/sitios/`: manifiesto legible por máquina `docs/sitios/sitios.json` + 30 fichas detalladas `docs/sitios/<id>.md` + índice y guía de integración para Codex `docs/sitios/README.md`.
  - Cobertura de los 20 sitios explícitos del pedido (`coltejer`, `candelaria`, `palacio_cultura`, `plaza_botero`, `edificio_epm`, `alpujarra`, `pueblito_paisa`, `parque_explora`, `orquideorama`, `planetario`, `parque_deseos`, `biblioteca_espana`, `estadio_atanasio`, `catedral_metropolitana`, `museo_antioquia`, `plaza_mayor`, `teatro_pablo_tobon`, `ruta_n`, `parque_lleras`, `plaza_libertad`) + 10 hitos clave reales presentes en `datos/medellin/mundo.mc4` (`teatro_metropolitano`, `pies_descalzos`, `parque_luces`, `edificio_vasquez`, `edificio_carre`, `biblioteca_epm`, `estacion_ferrocarril`, `palacio_nacional`, `casa_memoria`, `mamm`).
  - Cada ficha trae coordenadas WGS84, proyección verificada en metros de `mundo.mc4` (`x, y, cota_m`), enlace a `hito_mc4`, `osm_id` verificado o consulta Overpass explícita, dimensiones, paleta HEX, 4–5 rasgos reconocibles, receta de modelado y presupuestos LOD0/LOD1 (**23 540 / 6 740 tris totales**).
  - 30 imágenes de referencia WebP `768×512` sin texto ni logos en `docs/sitios/img/<id>.webp` (`401,6 KB` total): `edificio_epm.webp` generada con **Nano Banana** y las otras 29 como maquetas 3D limpias de estudio (cuota de `gemini-3.1-flash-image` en enfriamiento de ~5 h; desbloquean `C5-02` hoy y pueden refrescarse con Nano Banana luego sin cambiar rutas).
  - Validador `pruebas/sitios-medellin.mjs` (**671 ok, 0 fallos**) y reporte `reportes/2026-11-23-gemini-g5-07-sitios.md`.
- **Peso añadido al HTML (`dist/juegos/getaway.html`):** **`+0 KB`**.
- **Pruebas:** `construir.mjs` (`getaway.html 28734 KB`), `sitios-medellin.mjs` (`671/671`), `dinamica.mjs` (`25/25`), `historieta.mjs` (`gpu: true`, `3,4 ms`), `paralaje-biomas.mjs` (`18/18`), `humano.mjs` (`metro 35 s`, `carrera 431 m`), `prueba.mjs --navegador` (`158/158`, `112,2 s`).
- **Sigue (Gemini):** `G5-04` (Minijuegos táctiles cortos en `juegos/getaway/64-minijuegos.js`), seguido de `G5-01-b` (Historieta noche/1P/lluvia) y `G5-05` (Guía sin flecha en Modo cine).
### Gemini · Antigravity («hydrogen») · 23‑nov‑2026 · 5.2 · G5‑01‑b Historieta GPU (noche, lluvia y primera persona)
- **Pedido:** `G5-01-b` de `docs/PEDIDOS-GEMINI-5.0.md` («★ Estado 5.2», rama `ia/gemini/g5-01-b-historieta` sobre `origin/main` `df80193`).
- **Hecho:**
  - Pulido 100 % en GPU en `js/47-historieta.js` (sin volver a CPU en 3D realista, sin tocar `js/45-tres.js` ni subir `op.presupuesto`):
    1. `r.getDrawingBufferSize(sz)` para `P.rt`, eliminando las franjas negras en L del borde derecho/inferior en `noche` (`pctBordeDerNegro: 0 %`).
    2. Bandas perceptuales (`bandas: 5`, potencia `0.55`, ganancia acotada `[0.55, 1.45]`): la noche deja de lavarse a tono diurno (`lumMedia 101,0 → 34,3`) y la lluvia gana contraste (`70,8`).
    3. Zona muerta de cuantización (`8.5e-5`) + `umbralPrimera: [0.012, 0.034]` activos solo en `E.camara.perfil === 'primera'`, eliminando las rayas cebra sobre el asfalto en primera persona mientras mantiene nítido el contorno negro en vista Historieta 55° (`umbralGeo: [0.0032, 0.0115]`).
  - `pruebas/historieta.mjs` ampliada con aserciones de noche, lluvia y primera persona; reporte `reportes/2026-11-23-gemini-g5-01-b-historieta.md` y 8 capturas WebP antes/después en `reportes/img/gemini-g5-01-b/` (`269,1 KB`).
- **Peso añadido al HTML (`dist/juegos/getaway.html`):** **`+1.0 KB`** (`28 734 → 28 735 KB`).
- **Pruebas:** `construir.mjs`, `historieta.mjs` (`dia 3,7 ms`, `noche 2,3 ms`, `lluvia 2,8 ms`, `primera 6,0 ms`), `dinamica.mjs` (`25/25`), `humano.mjs` (`35 s` / `430 m`), `prueba.mjs --navegador` (`158/158`, `114,0 s`).
- **Sigue (Gemini):** `G5-05` (Guía sin flecha en Modo cine) y `G5-08` (Química del mundo).
- **Instrucción para la IA que siga:** deja siempre tu entrada aquí en `CONTEXTO-RELEVO.md` § 8, tu mensaje en `coord/buzon/` y actualiza tu ficha en `coord/agentes/`.
### Gemini · Antigravity («hydrogen») · 23‑nov‑2026 · 5.2 · G5‑05 Guía sin flecha en 🎬 Modo cine (Ghost of Tsushima)
- **Pedido:** `G5-05` de `docs/PEDIDOS-GEMINI-5.0.md` («★ Estado 5.2», rama `ia/gemini/g5-05-guia-cine`).
- **Hecho:**
  - Módulo 100 % aditivo `juegos/getaway/65-guia-cine.js` (`G.GuiaCine`): cuando `G.cine` está encendido (sin minimapa ni flecha) y hay `G.objetivo || G.destinoLibre`, emite hojas reales en `MC.Vida.emitir('hoja')`, hebras curvas de brisa con hojas doradas de guayacán y verdes sobre `EXTRAS.capas`, y bandadas guía de 3 palomas urbanas en `MC.Vida.aves` (`guiaCine: true`) orientadas hacia el destino o suavizadas hacia la próxima esquina de `G.Cine`.
  - Funciona en carro, moto, bici y a pie, y se ve tanto en 3D realista (`VistaTres`, donde `GuiaCine` avanza y dibuja sus palomas guía sin duplicar en 2D) como en 2D (`Vista2D`). Al apagar 🎬 Modo cine deja de emitir y retira las bandadas guía.
  - Prueba automatizada `pruebas/guia-cine.mjs` (basada en `requestAnimationFrame`), reporte `reportes/2026-11-23-gemini-g5-05-guia-cine.md` y 3 capturas antes/después WebP (`114.8 KB`) en `reportes/img/gemini-g5-05/`.
- **Peso añadido al HTML (`dist/juegos/getaway.html`):** `+12.1 KB` (`+12 364 bytes`).
- **Pruebas:** `construir.mjs` ✓ · `guia-cine.mjs` ✓ (2/2 corridas, `errRumboPaloma 0.001 rad`, `avanzoPaloma 5.37 m`, `miniOculto true`, `pieActivo true`, `apagado true`, `red 0`) · `dinamica.mjs` ✓ (`25/25`) · `historieta.mjs` ✓ (`gpu true`, `hudSolapa 0`) · `humano.mjs` ✓ (`metro 35 s`, `carrera 432 m` a `31.5 m/s`) · `prueba.mjs --navegador` ✓ (`158/158`, `112.1 s`).
- **Sigue (Gemini):** `G5-08` (Química del mundo en `ia/gemini/g5-08-quimica`), luego `G5-09`, `G5-10`, `G5-11` y `G5-13`.
### Gemini · Antigravity («hydrogen») · 23‑nov‑2026 · 5.2 · G5‑08 Química del mundo (Zelda: Breath of the Wild)
- **Pedido:** `G5-08` de `docs/PEDIDOS-GEMINI-5.0.md` («★ Estado 5.2», rama `ia/gemini/g5-08-quimica`).
- **Hecho:**
  - Módulo aditivo del motor `js/89-quimica-mundo.js` (`MC.QuimicaMundo`): envuelve `MC.Efectos.actualizar` y conecta `MC.Quim`/`MC.C`/`E.clima` con `MC.Efectos` y `MC.Vida` (lluvia apaga `Efectos.fuegos` sin explosión liberando vapor H₂O con `Quim.masaMolar('H2O')` y `C.Lv`; charcos deterministas en vías/plazas/andenes salpican en 2D y 3D proporcional a la velocidad; viento real desvía columnas de humo según altura `z`, más polvo y hojas).
  - Puente aditivo `juegos/getaway/69-quimica.js`: al recibir `quimica:apaga` sobre el carro en llamas, limpia `G.ardiendo = false` y muestra aviso sin tocar `20-juego.js`.
  - Arreglo quirúrgico en `js/46-vistas.js:81` (2 líneas): suma `M.cota(x, y)` al proyector `proy` de `MC.Efectos.dibujar` en 3D (convención 5.2), corrigiendo que todos los efectos de `MC.Efectos` quedaban 1.500 m bajo tierra en Medellín.
  - Prueba automatizada `pruebas/quimica-mundo.mjs` (Node + Chromium `412×860`), reporte `reportes/2026-11-23-gemini-g5-08-quimica.md` y captura WebP (`35.2 KB`) en `reportes/img/gemini-g5-08/`.
- **Peso añadido al HTML (`dist/juegos/getaway.html`):** `+8.8 KB` (`+9 062 bytes`).
- **Pruebas:** `construir.mjs` ✓ · `quimica-mundo.mjs` ✓ (`7/7`) · `dinamica.mjs` ✓ (`25/25`) · `historieta.mjs` ✓ (`gpu true`, `5 ms`, `hudSolapa 0`) · `humano.mjs` ✓ (`metro 35 s`, `carrera 431 m` a `31.5 m/s`) · `prueba.mjs --navegador` ✓ (`158/158`, `112.9 s`).
- **Sigue (Gemini):** `G5-09` (subtramas RPG y crónicas en `juegos/getaway/62-mundo-vivo.js`), `G5-10`, `G5-11` y `G5-13`.
- **Instrucción para la IA que siga:** deja tu entrada en este § 8 de `CONTEXTO-RELEVO.md`, tu mensaje en `coord/buzon/` y actualiza tu ficha en `coord/agentes/`.
### Gemini · Antigravity («hydrogen») · 23‑nov‑2026 · 5.2 · G5‑04 Minijuegos táctiles cortos (Chinatown Wars)
- **Pedido:** `G5-04` de `docs/PEDIDOS-GEMINI-5.0.md` («★ Estado 5.2», rama `ia/gemini/g5-04-minijuegos` sobre `origin/main` `df80193`).
- **Hecho:**
  - Módulo 100 % aditivo `juegos/getaway/64-minijuegos.js` (`G.Minijuegos`) sobre `G.ui`, sin editar `60-modos.js`, `37-dinamica.js`, `45-tres.js` ni `25-ia.js`.
  - 4 minijuegos de 15–18 s con separación limpia por tono: `puentear` (cables por color, 18+) y `chapa` (3 pines con resorte, 18+) para Turno Cero; `llanta` (bomba PSI 50–62, familia/bici) y `cadena` (3 guías del piñón, familia/bici).
  - Accesible desde `🎮 Modos → 🔧 Minijuegos táctiles` y `G.Minijuegos.abrir(id)`, con `✕ Salir` (`86×48 px`), `Escape`, teclado de respaldo, `touch-action: none`, `pointercancel` seguro, `MC.UI.verificar === []` y sin bloquear jamás `G.pausa`.
  - Prueba E2E `pruebas/minijuegos.mjs`, reporte `reportes/2026-11-23-gemini-g5-04-minijuegos.md` y 5 capturas WebP en `reportes/img/gemini-g5-04/` (`113,8 KB`).
- **Peso añadido al HTML (`dist/juegos/getaway.html`):** **`+27.8 KB`** (`28 734 → 28 762 KB`).
- **Pruebas:** `construir.mjs`, `minijuegos.mjs` (`4/4` táctiles en `412×860` y `860×412`), `dinamica.mjs` (`25/25`), `historieta.mjs` (`gpu: true`, `5,2 ms`), `humano.mjs` (`35 s` / `430 m`), `prueba.mjs --navegador` (`158/158`, `112,9 s`).
- **Sigue (Gemini):** `G5-01-b` (Historieta noche, primera persona y lluvia), `G5-05` (Guía sin flecha en Modo cine) y `G5-08` (Química del mundo).
- **Instrucción para la IA que siga:** deja siempre tu entrada aquí en `CONTEXTO-RELEVO.md` § 8, tu mensaje en `coord/buzon/` y actualiza tu ficha en `coord/agentes/`.


### ChatGPT · 23-nov-2026 · Codex R6-b: Worker Blob y LOD2 en el juego
- **Leído:** pedidos 5.2, relevo y CI verde de main; la generación de R6 ya existía, pero no estaba conectada al render. Los datos de R3 y R5 continúan bloqueados por licencia.
- **Implementado:** `herramientas/r6b-compacto.mjs` construye cajas LOD2 por regiones 160 m y sectores 1 km, cuantizadas 12,5 cm y comprimidas por sector; `construir.mjs` las incrusta solo en Turno Cero de Guatapé/Medellín si pesan hasta 2,5 MB por ciudad. `js/45-z-r6b.js` crea Web Worker Blob sin internet, cachea seis sectores y aporta una malla de detalle lejano a VistaTres con fallback.
- **Pruebas:** `pruebas/r6b-datos.mjs` para los dos MC4 reales y `pruebas/r6b-browser.mjs` para Worker offline + fallback + prueba constructiva de región CPU ×4, p95. Nueva GitHub Actions `r6b-qa.yml` y CI general. Confirmar estado final en PR #25 antes de fusionar.
- **No modificado:** MC4, fuente geográfica, guardados, R1 cercano, posRender, archivos de otros juegos, ramas de Codex y Gemini.
- **Limitaciones:** LOD2 agrupa edificios, no es idéntico al catastro; no afirma una subida de FPS sin medirla; CPU ×4 aquí solo mide tiempo de construcción. Requiere capturas visuales y benchmark físico.
- **Informe:** `reportes/2026-11-23-chatgpt-r6b-worker.md`; siguiente agente debe incorporar resultados finales, registrar nueva entrada §8, ficha y buzón, y no borrar otros trabajos.

### ChatGPT · 23-nov-2026 · Relevo de Codex (C5-01: vuelcos de autos y daño)
- **Leído:** `docs/PEDIDOS-CHATGPT-5.0.md` «Estado 5.2», `CONTEXTO-RELEVO.md`, `CLAUDE.md`, `docs/PLAN-REALISMO.md` y los módulos de física y render del motor. R1 y las auditorías R3/R4/R5/R6 ya están fusionadas y no se rehacen.
- **Hecho:** módulo `js/38-vuelcos.js`, que prolonga `MC.Dinamica` con vuelcos a partir de aceleración lateral o choque de costado; ralentiza y autoendereza en 2,65 s, lanza eventos `vuelco` y `enderezado`; `js/45-gl.js` inclina el modelo GLB del coche; Turno Cero aplica daño persistente de paneles laterales mediante su sistema existente.
- **Pruebas:** nuevo `pruebas/vuelcos.mjs` y workflow `.github/workflows/c5-vuelcos-qa.yml`, en revisión CI. No afirmar verde hasta verificarla.
- **Sin alterar:** mundos MC4, `js/45-tres.js`, datos con licencia pendiente, guardados, R6 precompiler, trabajos de Gemini y motores hermanos. Manejo Arcade y vehículos IA quedan fuera de la mecánica.
- **Límites:** simulación audiovisual 2D con vuelco visual; no modelo rígido 6DoF. Falta verificar visual 3D y memoria/FPS físico.
- **Informe y coordinación:** `reportes/2026-11-23-chatgpt-c5-vuelcos.md` y buzón nuevo. **Siguiente Codex/ChatGPT:** R6-b, cargar sectores precocinados sin agregar paquetes pesados al HTML; revisar R4-b solo con fuente autorizada. Registrar siempre nuevo relevo §8 y ficha/buzón.

### Claude · 23‑nov‑2026 · motor 5.3.0 «Todo lo nuevo, unido»
- **Pedido del autor:** «Retoma, continúa y termina; integra todo lo nuevo, compréndelo y mejóralo; y dame el prompt de relevo para la otra IA».
- **Unido y mejorado:** las 7 ramas del motor (G5‑07, G5‑01‑b, G5‑05, G5‑08, G5‑04, C5‑01 y R6‑b). Claude:
  - corrigió los vuelcos (enterrados boca arriba, y manejables volcados);
  - apagó R6‑b (`?r6b`) con la medición que lo justifica;
  - metió el minijuego de puentear en el robo de carros.
- **Nuevo:** `MC.Sitios`, los 30 sitios icónicos en el 3D realista con las fichas de Gemini. El Coltejer y el Planetario faltaban.
- **Hermanos:**
  - **EnCicla 3.7.0** en `main`, con `tests/run.js` en verde. La página no se actualiza por la compuerta de rendimiento de GPT‑6, que no se tocó: decide el autor.
  - **El Metro 3.8.0** publicado con la APK 36.
- **Probado:** la batería completa del motor (34 pruebas, con `prueba.mjs --navegador`); EnCicla `tests/run.js` (170); El Metro, 100 partidas con 0 errores, más GA‑36 y las cuatro de GPT‑6 Eón.
- **Esperan al autor:**
  - la licencia del catastro y el LiDAR CC BY‑SA;
  - medir con 📏 en el celular;
  - decidir la compuerta de rendimiento de EnCicla.
- **El prompt de relevo** está en `docs/PROMPT-RELEVO.md`.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

### Claude · 23‑nov‑2026 · motor 5.3.1 «Skills para todas las IA»
- **Pedido del autor:** la lista de skills y plugins, cómo integrarlos y un prompt para compartir entre IA que los integre solo.
- **Hecho:**
  - `node motor.mjs skills --integrar --agente <tu-agente>` deja las propias en `.claude/skills/` y `.agents/skills/`, completa el `.gitignore`, instala las 4 externas con su commit revisado y lo verifica;
  - en los juegos hermanos se corre `node motor-city/motor.mjs skills --integrar …` desde la raíz del juego;
  - `--verificar` corre en la QA.
- **Arreglado:**
  - las propias no estaban en `.agents/skills/` (Codex, Antigravity, Gemini CLI y Cursor no las veían);
  - en los hermanos, las externas caían dentro de `motor-city/`;
  - el `.gitignore` no ignoraba los enlaces que deja el instalador;
  - `sincronizar` copiaba las externas instaladas.
- **Probado:** las cuatro instalaciones reales (Codex + Claude Code en el motor, Claude Code solo, Cursor y la mezcla), `git status` limpio, el conflicto entre carpetas y la batería del motor (158 bien).
- **El prompt:** `docs/PROMPT-SKILLS.md`.
- **Riesgo que dejo:** si una IA edita una skill solo en `.agents/skills/`, `--sincronizar` lo detecta como distinta y no pisa nada. Hay que elegir con `--desde`.
- **Para quien siga:** antes de trabajar, corre el comando con tu agente y deja la línea «4) Verificación» en tu informe.

### Claude · 24‑nov‑2026 · Fase 0 del «renacimiento cenital» (auditoría y línea base; motor 5.3.1 sin cambios)
- **Pedido del autor:** ponerse al día, atender los prompts de relevo y de skills, y continuar con tres archivos. Están guardados en `docs/investigacion_tecnica_motor_valle.md` y `docs/referencias/renacimiento-cenital-2026/`.
- **Skills:** `node motor.mjs skills --integrar --agente claude-code` terminó con «4) Verificación: ✓ todo en orden». En El Metro, EnCicla y Run, `--verificar` sale con 0.
- **Hecho (solo lectura en los juegos):**
  - `docs/AUDITORIA-FASE0-CENITAL.md`, con:
    - el mapa real de qué dibuja el mapa, cómo se generan los datos y cómo se compila cada HTML;
    - los modos protegidos;
    - las correcciones a los prompts;
    - el plan de la Fase 1 por archivo.
  - La evidencia: `reportes/2026-11-24-claude-fase0-cenital.md` y `reportes/fase0-cenital/` (la herramienta `medir-conflictos-elmetro.mjs`, `conflictos-elmetro.json` y `linea-base.json`), más 4 capturas.
- **Probado:**

  | Repositorio | Resultado |
  |---|---|
  | Motor City | 158 bien |
  | El Metro | `tools/test.mjs 100`: 0 errores |
  | EnCicla | `tests/run.js`: 170 bien |
  | Compuerta de EnCicla (CPU ×4) | p95 de 103,7 y 61,2 ms: sigue sin cumplirse |
- **Hallazgo central:**
  - el 18,8 % de los 638.303 edificios de El Metro pisa la vía, aun con la regla angosta del juego;
  - ninguno de los tres motores lo corrige en los datos: El Metro recorta en tiempo real, EnCicla inventa lotes y Motor City tolera 1 m en la colisión.
- **Ojo, para quien siga:**
  - Turno Cero no va en MetroZero (18+).
  - El render compartido de El Metro también dibuja modos protegidos (`MAP.drawTop` y `G3.draw`), y el cenital de EnCicla es el de cinco oficios: cualquier cambio de render necesita **bandera por modo**.
- **Esperan al autor (§ 7 de la auditoría):**
  1. la regla de anchos (A, B o C híbrida);
  2. los trozos de 160 o 250 m;
  3. los oficios de EnCicla;
  4. los modos protegidos de El Metro;
  5. la fuente de datos (Overture u otra).

  Siguen pendientes también la licencia del catastro y el LiDAR, y medir en un celular.
- **Riesgo que dejo:** ninguno en el juego, porque no se cambió. Si alguien empieza la Fase 1 sin las decisiones, la regla B borra 24.983 casas en laderas.
- **Prompt de relevo** (lo pidió el autor: «con todo lo nuevo que debe hacer la otra IA»): `docs/PROMPT-RELEVO.md`. Trae:
  - las seis decisiones del autor, con lo recomendado;
  - las fases 1 a 5, con archivos, comandos y criterios de «hecho»;
  - la línea base para comparar;
  - las reglas y el cierre.

  El aviso está arriba en `CLAUDE.md`, `AGENTS.md` y `GEMINI.md`.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

### Claude · 24‑nov‑2026 · decisiones del autor para el renacimiento cenital y el prompt de relevo en `main`
- **El autor respondió las cinco preguntas** (§ 7 de `docs/AUDITORIA-FASE0-CENITAL.md`):
  1. **el ancho real** (regla A: la vía real + 1,3 m en las de carros; + 0,3 m en peatonales, escalas y ciclorrutas);
  2. **trozos de 160 m**;
  3. **EnCicla: solo en el modo libre**;
  4. **El Metro: Ciudad Libre y Bus**;
  5. **«la opción que pruebe que la ciudad será bien craqueada»**: rehacer desde las fuentes originales (Overture, las capas oficiales y SRTM), con la prueba de craqueo. La prueba exige:
     - geometría exacta;
     - el 97 % o más del área construida;
     - la fidelidad contra OSM, sin bajar de la auditoría del 17‑nov de El Metro;
     - los conflictos en GeoJSON;
     - capturas en 6 zonas piloto.
  - **Turno Cero, solo en `motorcity`** (es regla).
- **El prompt de relevo, con las decisiones:** `docs/PROMPT-RELEVO.md`, § 3 y § 4. **El autor autorizó subirlo a `main`** (avance rápido, solo documentos).
- **Misión y visión, al día:** `docs/VISION-Y-MISION.md` (el § 1 de este documento apunta ahí).
- **Sigue:** la **Fase 1** en `BicicletasUno/motor-valle/`, con el plan del § 4 del prompt. Avisa en `coord/buzon/` antes de tocar `motor-valle/` o los datos de El Metro.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

### Claude · 24‑nov‑2026 · Fase 1 del renacimiento cenital: el Valle saneado (Motor del Valle 1.3.0; motor 5.3.1 sin cambios)
- **Pedido del autor:** «Continúa con el trabajo de desarrollar y mejorar el motor y los videojuegos» con el prompt de relevo. La Fase 1 sigue el § 4 del prompt y las decisiones del § 3.
- **Hecho** (rama `ccr-4f6eeea5-yulqk1` en BicicletasUno, MetroZero y motorcity; **nada en `main`**):
  - **Motor del Valle 1.3.0**, en `BicicletasUno/motor-valle/` y sincronizado:
    - `geo/anchos.json`, con la regla A;
    - `geo/sanear.py`, la ley de soberanía vial;
    - `geo/niveles.py`, puentes y túneles;
    - `geo/rasante.py`;
    - `geo/huellas.py`, que exporta para EnCicla;
    - `pruebas/geometria.py` y `geometria.mjs`;
    - el subcomando `sanear`;
    - las fuentes `huellas` y `agua_niveles`;
    - los ejes precisos de las vías (`VIAS_M`).
  - **El Metro:** `edificios.js` v2, con una guarda contra su recorte en tiempo real, el bit 128 y `zb`, y `vias.js` v2 con la cota al final. Herramientas nuevas: `tools/corredores.mjs` y `tools/prueba-recorte.mjs`; `edificios_datos.py --saneadas` y `vias_datos.mjs --cota`.
  - **EnCicla:** `edificios.bin` + `edificios.json` y `vias-cota.bin`, **sin conectar**. Su HTML no cambió.
- **Probado (todo en verde):**
  - prueba de craqueo:
    1. geometría exacta, 0 solapes sin marca;
    2. en el juego, 0;
    3. el 98,45 % del área;
    4. la fidelidad contra OSM no baja;
    5. 44.538 conflictos en GeoJSON;
    6. capturas de 6 zonas;
  - El Metro: el recorte en tiempo real corta **0 de 622.086** en las 4.731 regiones (antes recortaba 107.546 y quitaba 17.190); `test.mjs 100` con 0 errores; HTML de 9,35 MB;
  - EnCicla: 177 ✓;
  - la herramienta de la Fase 0: de 120.187 a 5.
- **Lo poco conocido que salió de medir:**
  - las vías de los dos juegos están redondeadas a 2,5 m: se corren hasta ~3 m de su eje;
  - las casas de OSM (a mano) chocan con el corredor más que las de satélite: el andén de 1,3 m y el ancho de clase no existen en las laderas;
  - la rasante real se aparta ±7 m del suelo de 80 m de los juegos;
  - hoy el juego quitaba 17.190 casas, no 12.267;
  - Overture no trae `min_height` en el Valle.
- **Esperan al autor:**
  1. el OK de la Fase 2;
  2. las casas confiables en El Metro (su andén de 1,3 m las recorta en la exportación: 38.761, y quita 4.038);
  3. las vías precisas en El Metro (+230 KB);
  4. el ancho por fachadas (apagado);
  5. la cota dentro de `vias.js` (+366 KB) o aparte;
  6. refrescar el mapa base.
- **Riesgo que dejo:**
  - al HTML de El Metro le quedan 146 KB hasta el tope de 9,5 MB;
  - si cambian los corredores del juego, hay que repetir `corredores.mjs` + `edificios_datos.py --saneadas` + `prueba-recorte.mjs --todas`.
- **Prompt de relevo:** `docs/PROMPT-RELEVO.md`, puesto al día para la Fase 2.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

### Claude · 24/25‑nov‑2026 · Fase 2 del renacimiento cenital: el cenital con bandera y los mundos saneados (motor 5.3.2)
- **Pedido del autor:** «Retoma y continúa con las siguientes fases, ok, aprobado, haz lo mejor, inicia» (aprobó la Fase 1) y, tras un reinicio, «Retoma, y continúa».
- **Hecho** (rama `ccr-4f6eeea5-yulqk1`; **nada en `main`**):
  - **El Metro** (`src/js/97d-cenital.js`, aditivo; la bandera vive solo mientras dibujan Ciudad Libre o Bus):
    - *occluder fade* a 0,30 con tramado, techos de estación que se abren y la silueta del jugador bajo los tableros (que nunca se esconden);
    - el anillo lejano con edificios reales: 0 cajas de relleno;
    - zócalos hasta `zBase`, terreno facetado con bandas de cota, sombras de contacto en 2D y 3D, bruma CSS y cámara `1 − e^(−k·dt)`;
    - `22-gl.js` partido en funciones sin cambiar lo que dibuja: con la bandera apagada, las mallas son idénticas a las de antes.
  - **EnCicla** (`src/js/99y-cenital.js`, solo `mode.free`): silueta y sombras de contacto en 3D, bruma CSS y la cámara 3D exponencial. Lo demás ya lo tenía, o no aplica: su piso 3D es plano.
  - **Motor City 5.3.2:**
    - `geo/territorio.py` con la ley de soberanía vial;
    - Medellín, Guatapé y Nueva York regenerados (con su agua y su PVS);
    - `js/32-fisica.js` sin la tolerancia de 1 m;
    - `pruebas/calles-libres.mjs`: en Medellín, de 45.689 puntos de calle con choque a 15; en Nueva York, de 25.729 a 1.234 (0,074 %);
    - cuatro pruebas que elegían su escenario en el mapa se ajustaron (manejo, ruido, ladeo de la moto y ciudad viva); la ambulancia de Turno Cero ahora prueba otros puntos de partida si el primero no tiene ruta;
    - `pruebas/medir.mjs` es intermitente también en `main`: hay una carrera en el arranque de `?medir`, pendiente para quien siga.
- **Probado:**
  - El Metro: `test.mjs 100` con 0 errores, con la bandera apagada y encendida; `prueba-cenital` BIEN (jugador visible en San Antonio, Acevedo y el Centro); p95 igual; rutas A\* 0 de 61.332.
  - EnCicla: `tests/run.js` 177 ✓, con la bandera apagada y encendida por defecto; regresión 0; `cenital-libre` BIEN.
  - Motor City: `prueba --navegador` 158 bien y toda la lista de `motor-city-qa.yml` (ver el informe).
- **Esperan al autor:** el OK de la Fase 2 y de la Fase 3 (la Fase 3 enciende la bandera); la decisión 7 (se dejó como en la Fase 1); si las huellas reales de EnCicla valen +5,5 MB de HTML (la compuerta decide si se puede).
- **Prompt de relevo:** `docs/PROMPT-RELEVO.md`, puesto al día para la Fase 3.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

### Claude · 25‑nov‑2026 · Fase 3 del renacimiento cenital: la bandera encendida y las huellas reales en EnCicla (El Metro 3.9.0, EnCicla 3.9.0, Motor del Valle 1.3.1)
- **Pedido del autor:** seguir con las fases siguientes y, tras dos reinicios, «Retoma, y continua» y «retoma y sigue».
- **Hecho** (rama `ccr-4f6eeea5-yulqk1`; **nada en `main`** y nada publicado):
  - **El Metro 3.9.0** (versionCode 37): la bandera encendida en Ciudad Libre y Bus, y `tools/capturas-protegidos.mjs` para comparar los 13 modos protegidos píxel a píxel.
  - **EnCicla 3.9.0** (versionCode 30900): la bandera encendida en el modo libre y `src/js/99z-huellas.js`, que cambia los lotes inventados del paseo libre por las 625.880 huellas reales. Tienen la forma de un lote, se arman por región de 160 m y cada trozo dibuja las de sus vecinos, así que no quedan costuras.
  - **Motor del Valle 1.3.1** (`geo/huellas.py`): `edificios-ligero.bin` lleva uno o dos rectángulos adentro de cada polígono, cada 0,25 m, y ninguno toca un corredor. Se sincronizó a MetroZero; El Metro da el mismo md5.
- **Probado:**
  - El Metro: `test.mjs 100` con 0 errores; los modos protegidos no cambian; rutas A\* 0 de 61.332.
  - EnCicla: `tests/run.js` 177 ✓; `cenital-libre` BIEN; `geometria.mjs --ligero` BIEN.
  - La compuerta: con las huellas cumple la meta en 3 de 3 rondas; con los lotes, en 1 de 3.
- **Esperan al autor:**
  - publicar las dos 3.9.0 (APK y páginas) y pasar a `main`;
  - si el HTML de EnCicla puede pesar 9,99 MB: con las constantes de `huellas.py` baja a unos 9,3 MB, pero tapa menos.
- **Riesgo que dejo:** «mundo 3D único» (EnCicla) falla si la batería corre al mismo tiempo que otra prueba pesada (espera un tiempo fijo).
- **Prompt de relevo:** `docs/PROMPT-RELEVO.md`, puesto al día para la Fase 4.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

### Claude · 25‑nov‑2026 · Fase 4 del renacimiento cenital: `MC.Pista` y las carreras retro de Turno Cero (motor 5.4.0)
- **Pedido del autor:** seguir con las fases siguientes («retoma y sigue»).
- **Hecho** (rama `ccr-4f6eeea5-yulqk1`; **nada en `main`**):
  - **`js/47-pista.js` (`MC.Pista`):** la técnica clásica de segmentos, escrita desde cero:
    - dos pasadas con `maxY` y `seg.clip`, niebla, y las franjas juntas por color (unos 40 rellenos por cuadro);
    - paralaje de 3 capas, el carro con 6 estados, rebufo, nitro, rivales con IA de carril, HUD, minimapa y controles táctiles;
    - dos circuitos: Subida a Las Palmas y Autopista Regional nocturna;
    - `simular`, `bot`, `perfil`, `crearDe` y `cieloDe` para las pruebas.
  - **Turno Cero** (`juegos/getaway/70-retro.js`, aditivo): «🏎️ Carreras retro» en 🎮 Modos.
    - El mundo se pausa mientras corres, y al salir vuelves al mismo punto.
    - El cielo de Las Palmas sale de la hora y el clima del mundo (`cieloRetro`).
    - Hay premio por puesto y récord por circuito.
  - `pruebas/pista-retro.mjs` (en `motor-city-qa.yml`); Motor City 5.4.0.
- **Probado:**
  - `pista-retro`: la cresta recorta (0 píxeles debajo); la curva es continua; el bot gana los dos circuitos; p95 de 5,2 a 5,9 ms; Turno Cero vuelve al mismo punto; 0 errores;
  - `prueba` 146 bien y `prueba --navegador` 158 bien;
  - `modos.mjs` ✓ (el umbral del ⏫ acelerador es intermitente, de antes).
- **Esperan al autor:** la APK y pasar a `main`.
- **Prompt de relevo:** `docs/PROMPT-RELEVO.md`, puesto al día para la Fase 5.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.

# MOTOR CITY · Documento único

> **Para el autor (OneZero) y para todas las IAs:** Gemini (Antigravity y Nano Banana), ChatGPT (Codex), Claude y las IAs de Juega EnCicla, El Metro y Run Scooter.
>
> **Cada IA lee TODO este documento** para tener el contexto completo. Después hace **solo su parte** (§9) y entrega **un solo documento** (§11).
>
> | | |
> |---|---|
> | Versión | **Motor City 3.0.0** · 20‑nov‑2026 |
> | Repositorio | `juanfeliperico369-stack/motorcity` (rama `claude/motor-city-engine-xu7p4y`; la web sale de `main`) |
> | Web | <https://juanfeliperico369-stack.github.io/motorcity/> |
> | Minijuego | <https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html> |
> | **¿Está todo lo pedido?** | `docs/PEDIDOS.md`: cada pedido del autor, su estado y el archivo donde quedó |
> | **«Mira el repositorio y haz tu parte»** | `TAREAS-IA.md`: la lista corta de cada IA, en orden |

## Índice
1. Qué es Motor City
2. Lo que pasó (todas las sesiones)
3. Estado actual
4. Cómo está hecho (capas y módulos)
5. **El código a usar** (recetas exactas)
6. Lo aprendido de las referencias y dónde quedó
7. Reglas para todas las IAs
8. Cómo probar y publicar
9. **Plan de cada IA** (con las peticiones nuevas)
10. Peticiones de arte y de código, en detalle
11. Cómo entregar
12. Lo que necesita el autor
13. Fuentes

## 1. Qué es Motor City
**Un motor de videojuegos de mundo abierto que convierte cualquier lugar real (o inventado) en un mundo jugable con leyes reales.**
- Las leyes son de física, química, biología, clima, economía, tráfico, transporte y ciudad.
- Funciona en **un solo HTML**, sin internet ni librerías, en cualquier celular.

**Lo usan:**
- **Juega EnCicla** (`BicicletasUno`) y **El Metro** (`MetroZero`);
- **Run Scooter** (`RunRunZero`) corre dentro de ellos como «Run en la ciclovía»;
- los juegos que vienen: ***Motor City*** (carreras de mundo abierto, al estilo GTA, Forza y Need for Speed) y ***Extremo*** (deportes extremos).

**La visión del autor:** que el motor sirva para:
- crear gráficos;
- **craquear territorios** (países, ciudades, pueblos y lugares) y crear mundos nuevos;
- guardar funciones, mecánicas y jugabilidad;
- tener física, química, economía y matemáticas **fieles a la realidad**;
- personajes con biología real;
- vehículos, animales y criaturas;
- un mundo vivo;
- interiores únicos;
- música e interfaces que **no estorban**;
- historias con **diversión, reflexión y conciencia**;
- y ahora, **cómo crean ciudades SimCity, Los Sims, Cities: Skylines y Townscaper**.

## 2. Lo que pasó
| Sesión | Pedido del autor | Lo que se hizo |
|---|---|---|
| **2.0** | Un solo motor de mundo abierto según el *Plan del Mundo Abierto*, en el repo nuevo `motorcity` | El mundo de Medellín en un solo archivo MC4: 639.457 edificios, 35.746 calles, metro, cables, Metroplús y EnCicla. Personaje, 35 vehículos, física, controles y cámara. 8 vistas más pixel, panorámica de perfil y WebGL. Reloj, festivos, cielo, clima, tráfico y transporte con horario. Run en la ciclovía. Banco de pruebas y 54 pruebas. Sincronización a los juegos. |
| **2.1** | Craquear territorios; física, química y economía reales; mundos nuevos; biología; vehículos y animales; interfaz; música; mundo vivo; interiores; nombre solo «Motor City»; repo abierto a las IAs | `geo/territorio.py` (Guatapé en 20 s). `MC.Generador`. Ciencia, química y economía con pruebas. Clima global con estaciones y nieve. Seres (persona, genética, animales y criaturas). Taller de vehículos. IA y población con rutinas. Interiores. Música procedural y clásicos de dominio público. Interfaz y mecánicas. Minijuego **Mandados**. Plantillas, skills, `CONTRIBUIR.md` y reportes. 80 pruebas. |
| **2.2** | Solución a la tarjeta gráfica; puentes y cámara; vistas de lado (FEZ, Little Nightmares, Monument Valley); sprites; interfaz con psicología; los mejores motores; historia con 3 pilares; ocurrencias; manual; optimización; controles; **casa del jugador por su dirección**; talleres y tiendas; No Man's Sky; proporciones | GPU virtual y 3D por software (`MC.Raster`). Física por superficies. Cámara con resortes. **Vista lateral.** `MC.Manejo` con 7 esquemas. `MC.Sprites`. `MC.Escala`. Interfaz por zonas. **Mi casa** (`MC.Direccion` + `MC.Hogar`, 8 estilos y 22 muebles). `MC.Lugares` y `MC.Desgaste`. `MC.Historias` con director. `MC.Ocurrencias`. `MC.Cosmos`. Web en GitHub Pages. 103 pruebas. |
| **2.3** | Estudiar **SimCity, Los Sims, Cities: Skylines y Townscaper**: cómo crean entornos, ambientes, sombras y detalles de ciudad. Un **documento único** con todo y el código a usar | **Sombras del sol** por hora en todas las vistas. **Mobiliario urbano** y luces de noche. **Fachadas por reglas** (WFC). **`MC.Urbe`**: zonas, demanda RCI, valor del suelo, servicios, contaminación, crecimiento, niveles, recursos, presupuesto y **capas de datos**. **Objetos inteligentes** y necesidades (`MC.Habitante`). **`MC.Ondas`**, `MC.Autotile` y `MC.RejillaIrregular`. **`MC.Paisaje`** (sonido ambiente). Mandados con **modo alcalde** y casa habitada. 109 pruebas. Este documento. |
| **2.4** | Montañas, rocas y tipos de terreno; agua en **lagos, ríos, playa y mar**; **límites de paso verosímiles** («el personaje pasa por encima de cosas que no debería») | **`MC.Terreno`**: agua por tipo y profundidad; material y pendiente; **reglas de paso** por vehículo con su motivo (vadear, nadar, barrancos, roca, monte, arena, nieve, borde del mundo); **obstáculos reales** (emblemáticos, árboles de las losas, postes, bancas, rocas, tráfico y gente). **`MC.Naturaleza`**: rocas, palmas, frailejones, arbustos y juncos. **Lagos** en los mundos generados (llenado por prioridad) y mar a nivel 0. **Agua y roca en las losas**: color por profundidad, espuma en la orilla y roca en las laderas empinadas. Brillos del agua. El personaje se ve vadeando o nadando. 115 pruebas. |
| **2.5** | «Añade la capacidad de poder entrar en el agua» | **Entrar al agua de verdad:**<ul><li>con un vehículo, al empujar hacia el agua honda (o con «🏊 Al agua») uno se baja, el vehículo queda **parqueado en la orilla** y se entra nadando;</li><li>se **bucea** («🤿», o Z/Ctrl) con **aire limitado** (~35 s); sin aire se sube sola;</li><li>el cuerpo tiene pose de **nado** (crol) y de **buceo** (rana);</li><li>bajo el agua todo se tiñe de azul, con rayos de luz y burbujas;</li><li>se sale por la orilla y se **vuelve a subir** al vehículo;</li><li>**lancha**: embarcar en el agua honda más cercana y «⚓ A tierra» (queda amarrada).</li></ul>117 pruebas. |
| **2.5.1** | «El minijuego es injugable: no hay controles de verdad, no se puede mover nada; hay que pagar cosas. Mejóralo con lo nuevo. ¿Ya están todos los pedidos?» | **Lo que pasaba:** el personaje sí se movía, pero la cámara estaba tan lejos que medía 3 píxeles y el joystick no se veía. **Lo que se hizo:**<ul><li>**cámara cerca**: unos 45 m en el lado corto de la pantalla;</li><li>**marca del jugador** (anillo y flecha);</li><li>**joystick visible** con guía, y **botones de acción** para el pulgar: ⤒ saltar, ⚡ turbo, y 🔽 🔼 en el agua o en el aire;</li><li>**flecha al objetivo** con la distancia, siempre en la zona libre;</li><li>**tutorial** al empezar;</li><li>**modo libre** por defecto: todo gratis, con los 34 vehículos (pie, bici, moto, carro, bus, avión y lancha);</li><li>menús **Vista** y **Ajustes**;</li><li>el **primer mandado cerca**;</li><li>en computador, flechas o WASD;</li><li>la lista **`docs/PEDIDOS.md`**.</li></ul>**Llegó la entrega de Gemini** (G‑M0…G‑M15) y quedó integrada:<ul><li>`arte/gemini/` y **`MC.Pieles`**, con respaldo procedural en cada gancho;</li><li>en Mandados se usan árboles del trópico, props, rocas, fachadas y muebles, y el selector 🎨 Arte;</li><li>también se corrigió lo válido de su auditoría.</li></ul>118 pruebas, con una nueva que juega en un celular táctil. |
| **2.6** | «Haz una revolución para que los gráficos sean más realistas: desde la vista cenital los árboles se ven como tapetes en el suelo. Deja el estilo *family friendly*, pero con más realismo, rudeza y crudeza. Los tutoriales deben ser opcionales. Copia todos los pedidos en los repositorios. Gemini con Antigravity pasa a *hydrogen*: déjale lo fácil. ChatGPT con Codex sigue con *astra*: encárgale lo mejor; GPT genera mejores imágenes.» | **Estilo realista familiar** (`MC.estilo = 'realista'`; el clásico sigue disponible):<ul><li>**`MC.Arboleda`**: los árboles se levantan en la maqueta, la oblicua y la lateral (tronco, ramas, copa con luz y sombra según el sol). Desde arriba tienen volumen. Hay 6 especies del trópico: guayacanes florecidos, ceiba, mango, urapán y monte. Son los mismos con que se choca;</li><li>**`Rudeza`**, horneada en las losas:<ul><li>asfalto con parches, grietas, manchas de aceite y alcantarillas;</li><li>andén de baldosa con bordillo;</li><li>pasto con parches secos;</li><li>tejas de barro en hileras y planchas con humedad;</li><li>grano;</li><li>paleta menos saturada;</li></ul></li><li>los muros con la base sucia y sombra bajo el alero;</li><li>el **tutorial es opcional** (en la portada y en Ajustes);</li><li>el gancho de arte `arbol`;</li><li>`node motor.mjs capturas` y `node motor.mjs revisar-arte`;</li><li>**`TAREAS-IA.md`** en los cuatro repositorios, con el reparto nuevo.</li></ul>119 pruebas. La maqueta de Medellín queda por debajo de 40 ms con la CPU 4× más lenta. |
| **2.7** | «Necesito peso y vida en el motor, y que se pueda adaptar a motores más potentes. Estéticas de cómic, manga, anime y novela gráfica. Investiga y aprende de las mejores obras visuales, inspírate en ellas, y recopila y adapta arte de verdad.» Y 14 reels de referencia. | **Estilos gráficos** (`MC.Estilo`, `js/16-estilos.js`). Son 8: realista, clásico, **cómic** (tinta, semitono y onomatopeyas), **manga** (grises, tramado y líneas de velocidad), **anime** (*cel* y cielos de Shinkai), **novela gráfica** (noir: tres tonos y un rojo de acento), **ukiyo-e** y **acuarela**. Cada uno tiene su mapa de color, su tinta, su trama, su sombra, sus árboles y su cielo. Las paletas salen de **obras de dominio público** (Hokusai, Hiroshige, Doré, Winslow Homer, la Comisión Corográfica…; `arte/dominio-publico/`).<br>**Peso y vida** (`MC.Vida`):<ul><li>aterrizaje con aplastamiento, sacudida y polvo;</li><li>cabeceo del vehículo al acelerar y al frenar;</li><li>**hitstop** en los choques;</li><li>bandadas con su sombra, hojas que caen y salpicaduras;</li><li>el viento mece las copas.</li></ul>**Motores potentes** (`MC.Exportar`, `MC.Puente`): el mundo en **glTF 2.0** (validador de Khronos: 0 errores; abierto en three.js), alturas RAW 16 y escena JSON para Godot, Unity, Unreal y Blender; y el estado vivo para otro motor.<br>**Investigación:** `docs/INSPIRACION-VISUAL.md` y `docs/MOTORES-POTENTES.md`.<br>123 pruebas. |
| **2.8** | La **entrega maestra de referencias** (los 14 reels, videos y el análisis de ChatGPT y de Gemini: 25 fichas, peso, vida, arquitectura y rendimiento) y «prepara todo». | La entrega quedó en `docs/referencias/` y su resumen en `docs/INSPIRACION-VISUAL.md` §1. Al motor se sumó:<ul><li>**palomas que alzan vuelo** cuando el jugador se acerca (R12);</li><li>**huellas** de llantas y pisadas en arena, tierra, nieve y barro, que con lluvia salen en el pasto (R12 y R19);</li><li>**faros y luces de freno** del jugador (R13 y R19);</li><li>los estilos **vintage**, **CRT** y **visión térmica** (R17 y R22), para 11 en total;</li><li>**accesibilidad**: sacudida y partículas ajustables (§10.3);</li><li>**telemetría en percentiles** (p95 y p99) y **calidad baja, media o alta** en Ajustes (§13 y §14);</li><li>**contratos versionados** (`schemas/` y `MC.Contratos`, §12.3);</li><li>el hitstop también en Mandados.</li></ul>Lo demás quedó repartido: C‑M20, C‑M21, C‑M22, C‑A10, C‑A11, G‑H7 y G‑H9. 125 pruebas. |
| **2.9** | Llegaron, en paralelo, las entregas de **Gemini** (G‑H1…G‑H8) y de **ChatGPT y Codex** (2.7.1: arte C‑A, C‑M1, C‑M13, C‑M15…C‑M19). | Todo quedó unido en la rama:<ul><li>los **6 atlas de ChatGPT** (676 cuadros; Vista → Arte → ChatGPT);</li><li>el agua precalculada en los MC4;</li><li>el gancho `textura` y los charcos con lluvia;</li><li>el estilo de **1 bit**;</li><li>la caché de fachadas (la maqueta de Medellín baja a **22 ms** con la CPU 4×);</li><li>los adaptadores de **Godot y three.js** probados;</li><li>los hallazgos de Gemini, corregidos;</li><li>las paletas de las obras colombianas.</li></ul>Son 12 estilos. 132 pruebas. |
| **2.10** | «Retoma y continúa: une todo, mejora y optimiza todo, y añade peticiones para Gemini y ChatGPT». Llegaron 11 enlaces, y después «añade las skills y plugins de los videos y sigue desarrollando». | <ul><li>Se unieron las ramas de El Metro (Motor del Valle 1.2.0) y de EnCicla (alto contraste y metro sin casas debajo).</li><li>El cómic y el 1 bit ya no leen la pantalla y no hacen muaré.</li><li>Mandados bajó de 8,2 a 5,1 MB.</li><li>Las rutas van por la calle (`rutaA`).</li><li>Skills de los videos: **Hallmark, Modern Web Guidance, find-skills y HyperFrames** (`skills-externas.json`, `node motor.mjs skills`, plugins en `.claude/settings.json`).</li><li>El **público simulado** (`MC.Publico`, `node motor.mjs publico`).</li><li>Pedidos G‑H10…G‑H13, C‑M23…C‑M25 y C‑A12.</li></ul> |
| **3.0** | «Sigue básico: las dimensiones están mal ideadas; hay cosas en 2D que deberían ser 3D; el mundo de la cenital, la maqueta y la 3D debe ser uno solo, híbrido. Investiga #DRIVE, Pako Forever, Getaway, Reckless Getaway 2 y la distancia de GTA San Andreas; pon tope al zoom; define un radio de vista; mejora las fachadas; agrega artilugios físicos.» | <ul><li>**Un solo mundo 3D y varias cámaras**: la cenital, la ciudad y la maqueta son cámaras sobre el mismo mundo, con respaldo 2D.</li><li>Fachadas con zócalo, ventanas, puerta y balcones; árboles low-poly que son los mismos de la 2D; carros y gente con detalle.</li><li>Topes de zoom, cámara continua y mapa grande.</li><li>Radio de vista con niebla, rayos X del jugador y persecución.</li><li>`MC.Objetos`, los artilugios físicos.</li><li>La investigación está en `docs/INVESTIGACION-CAMARA.md`.</li></ul> |
| **4.0** (esta) | «Empieza con el monstruo, nada de *family friendly*. Combina ese mundo con Guatapé y la mejor versión de Medellín y el valle, todo en un mismo planeta, con caminos largos en medio de la nada». Luego, «adapta todo lo nuevo» (Codex: *Turno Cero*, espionaje 2026, 42 GLB). | **Motor:**<ul><li>`MC.Planeta`: anillo de ciudades y carreteras generadas, globo y horizonte curvo;</li><li>`MC.Busqueda`: búsqueda de 0 a 5 con la última posición vista, embestidas, disparos, púas, retenes y helicóptero;</li><li>`MC.Modelos`: lector GLB, con los 42 modelos en la cámara 3D;</li><li>juegos con varios mundos.</li></ul>**Juego:** *Turno Cero* (`juegos/getaway/`), de Manhattan a Medellín y Guatapé, con el metro, EnCicla, la lancha y los artefactos de Codex. Ver `docs/TURNO-CERO.md`. |

## 3. Estado actual
| | |
|---|---|
| **Pruebas** | **137 en verde** (`node motor.mjs prueba --navegador`), en Node y en Chromium. Incluyen el público simulado y las rutas por la calle (2.10). Una juega Mandados en un celular táctil y otra recorre los 11 estilos. |
| **Medido**<br>(Chromium, CPU 4× más lenta, 412 × 860; mediana del dibujo con sombras y mobiliario) | cenital 8–10 ms · ciudad 3D ~15 ms · maqueta ~27 ms · lateral 14–20 ms · panorámica ~9–12 ms. La 3D por software va en 15–25 ms, contra 70–90 ms del WebGL por software. |
| **Mundos** | Manhattan (MC4, 10 MB, 6 m); Medellín (MC4, 6 MB); Guatapé craqueado (0,2 MB, 195 lugares jugables); mundos generados por semilla; planetas. |
| **Juegos** | **Turno Cero** (`dist/juegos/getaway.html`, 18+, tres ciudades en un planeta) y Mandados (Guatapé). EnCicla y El Metro tienen el motor en `motor-city/`; su `motor-valle/` quedó como estaba y siguen en verde. Run Scooter, sin cambios. |
| **Lo que falta medir** | Un **celular real** de gama media. |

## 4. Cómo está hecho
```
JUEGOS          Juega EnCicla · El Metro · Run Scooter · Mandados · Motor City (carreras) · Extremo
PIEZAS          MC.Mision · Carrera · Inventario · Logros · Dialogo · Historias + Director · Ocurrencias · UI · Musica · Paisaje
CIUDAD          MC.Urbe (zonas, demanda, valor, servicios, crecimiento, presupuesto) · Lugares · Desgaste · Hogar · Habitante
MUNDO VIVO      Reloj · Calendario · Cielo · Clima/ClimaGlobal · Trafico · Transporte · IA · Poblacion · Mobiliario
SERES/MÁQUINAS  Personaje · Seres · Vehiculos · Taller · Cuerpo (superficies) · Controles · Manejo · Camara
VISTAS          Vistas (cenital, ciudad 3D, maqueta, lateral, panorámica, 3.ª y 1.ª persona, dron, cine, pixel) · Raster · Sombras · Sprites · arte
MUNDO           Mundo (MC4 real) · Generador · Cosmos · Ondas · RejillaIrregular · Autotile · Direccion
CIENCIA         Ciencia · Fis · Quim · Termo · Escala · Dinero · Libro · Mercado · Finanzas · GPU · Bucle · resorte
```
**Archivos:** `js/NN-nombre.js`, en orden y en **un solo cierre**. Solo se publica `MC`. Se arma en `dist/motor.js` con `node motor.mjs construir`.

| Archivo | Módulo | Archivo | Módulo |
|---|---|---|---|
| 00 | núcleo, eventos, `arte` | 38 | `Sprites` |
| 02 | ciencia | 39 | `Sombras` (2.3) |
| 03 | economía | 40 | losas (`Losas.invalidar`) |
| 04 | `Escala` | 41 | `Vista2D` (sombras, mobiliario, capas, fachadas WFC) |
| 05 | `GPU` | 42–43 | perfil y panorámica |
| 10 | `Mundo` (`agregarEdificio`) | 44 | `Raster` |
| 11 | redes | 45 | GL |
| 12 | `Generador` | 46 | `Vistas` |
| 13 | `Cosmos` | 47 | seguir la ruta |
| 14 | `Ondas`, `Autotile`, `RejillaIrregular` (2.3) | 48 | `Interiores` |
| 15 | **`Terreno`** (2.4): agua, material, pendiente, reglas de paso y obstáculos | 28 | **`Naturaleza`** (2.4): rocas, palmas, frailejones, arbustos y juncos |
| 20–22 | tiempo, tráfico, transporte | 49 | `Hogar` y `Direccion` |
| 24 | ambiente | 50 | Run |
| 25 | IA | 60 | música |
| 26 | `Urbe` (2.3) | 61 | `Paisaje` (2.3) |
| 27 | `Mobiliario` (2.3) | 70 | `UI` |
| 30–37 | personaje, vehículos, física, controles, cámara, seres, taller, manejo | 80 | mecánicas |
| | | 82 | `Lugares` |
| | | 85 | `Historias` |
| | | 86 | `Necesidades` y `Habitante` (2.3) |

## 5. El código a usar
> Todo lo de aquí está probado en `pruebas/prueba.mjs` o en `juegos/mandados/juego.js`, el ejemplo completo. Copia y adapta.

### 5.1 Incluir el motor y el mundo (un solo HTML)
- Un juego nuevo: `node motor.mjs nuevo juego mi-juego --mundo guatape`.
- `node motor.mjs construir` pega en `dist/juegos/mi-juego.html` el mundo (`MC_MUNDO`), la ciudad (`MC_CIUDAD`), el motor y tu `juego.js`.
- En un juego que ya existe, incluye `motor-city/dist/motor.js` antes de tu código. El mundo va en base64: `dist/mundo-<id>.js`.
```js
const cfg = Object.assign({}, MC_CIUDAD, { zonas: Object.assign({}, MC.ZONAS_BASE, MC_CIUDAD.zonas || {}) });
const M = await MC.Mundo.cargar(MC_MUNDO, cfg);            // real (MC4)
// o: const M = MC.Generador.mundo({ semilla: 42, tipo: 'isla', ancho: 448, alto: 448, pueblos: 3, lat: 6.2 });
// o un planeta: const P = MC.Cosmos.planeta(MC.Cosmos.estrella(1, 0, 7), 2); const M = MC.Generador.mundo(MC.Cosmos.mundoDe(P));
M.red('rueda');                                              // arma la red de calles una vez (tarda ~1 s en Medellín)
```

### 5.2 El ciclo de juego
```js
const vistas = new MC.Vistas(M), camara = new MC.Camara({ zoom: 3.4, mundo: M }), reloj = new MC.Reloj({ vel: 1.5 });
const clima = new MC.ClimaGlobal({ lat: 6.23, alt: M.cota(x, y) }), cuerpo = new MC.Cuerpo(M, { x, y, a: 0, veh: 'bici' });
const ctl = new MC.Controles(lienzo, { alGesto: q => camara.gesto(q) }), ui = MC.UI.crear(document.body, { tema: 'motorcity' });
const E = { mundo: M, camara, reloj, clima, jugador: { cuerpo, aspecto: MC.Personaje.aspecto() }, vehiculos: [], peatones: [], extras: [], t: 0 };
new MC.Bucle({
  actualizar: dt => {
    reloj.avanzar(dt); clima.actualizar(reloj, dt); E.cielo = MC.Cielo.en(reloj.fecha, reloj.hora, clima); E.t += dt;
    const entrada = MC.Manejo.aplicar(ctl.leer(), cuerpo, { camara, esquema: 'joystick', vista: vistas.actual.tipo === 'gl' ? 'volante' : 'mundo' });
    cuerpo.actualizar(dt, entrada);
    camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v, zCuerpo: cuerpo.z, zPaso: cuerpo.zPaso });
  },
  dibujar: () => vistas.dibujar(g, W, H, E, 1 / 60)            // con sombras, mobiliario, luces y fachadas por reglas
}).iniciar();
vistas.usar('lateral', E); camara.girar90(1); vistas.pixel = true;   // vista de lado que gira de a 90°, y pixel
```

### 5.3 La interfaz que no estorba
```js
ui.ficha('hora', '🕐 ' + reloj.texto()); ui.mision('<b>📦 Lleva el paquete</b>'); ui.aviso('¡Listo!');
ui.boton({ id: 'casa', icono: '🏠', texto: 'Mi casa', al: () => abrirCasa() });
ui.menu('Garaje', [{ id: 'bici', texto: '🚲 Bici' }], id => cuerpo.setVeh(id));
const i = await ui.dialogo('Título', 'Texto', ['Sí', 'No']);
ui.foco(Math.abs(cuerpo.v) > 11);                       // al ir rápido, solo lo vital
console.assert(MC.UI.verificar(ui).length === 0);       // nada tapa el centro

// 2.5.1 · controles que se ven (abajo a la izquierda el pulgar izquierdo; abajo a la derecha el derecho)
ui.joystick(ctl, { texto: 'Arrastra para moverte' });  // en cada cuadro: ui.pintarJoystick()
ui.accion({ id: 'salto', icono: '⤒', texto: 'Saltar', mantener: true, ctl });   // mantener → ctl.boton('salto', true|false)
ui.accion({ id: 'turbo', icono: '⚡', texto: 'Turbo', mantener: true, ctl });
// el objetivo: pin si se ve, flecha en el borde de la zona libre si no
const [sx, sy] = E._pr(meta.x, meta.y, 0), Z = ui.zonaLibre(), k = W / innerWidth;
MC.UI.indicador(g, W, H, sx, sy, { texto: '120 m', escala: k, t, rect: [Z.x0 * k, Z.y0 * k, Z.x1 * k, Z.y1 * k] });
// la cámara: ~45 m en el lado corto, para que el jugador mida más de 10 px
const camara = new MC.Camara({ zoom: Math.max(9, Math.min(18, Math.min(innerWidth, innerHeight) / 45)) * devicePixelRatio, mundo: M });
```
> **Lección de la 2.5.1:** un juego de prueba se juega **sin pagar** (modo libre) y con **controles que se ven**. Si el jugador no ve su personaje ni el joystick, cree que no se mueve, aunque se mueva.

### 5.4 Arte: sprites y ganchos de dibujo
```js
MC.Sprites.atlas('encicla', { imagen: 'data:image/webp;base64,…', cuadros: { bici_lado: [0, 0, 64, 40, 32, 40] }, metros: { bici_lado: 1.05 } });
MC.Sprites.dibujar(g, 'encicla/bici_lado', x, y, pxPorMetro, { dir: 1, fase: cuerpo.fase, pixel: vistas.pixel });
MC.arte.registrar('encicla', {
  personajeLado(g, J, A, x, y, pxm, dir) { /* … */ },        // personaje de perfil (pose J del esqueleto único)
  vehiculoLado(g, V, x, y, pxm, dir, C) { /* … */ },
  prop(g, p, x, y, pxm, D) { return MC.Sprites.dibujar(g, 'encicla/' + p.t, x, y, pxm); },          // 2.3: postes, árboles, bancas…
  fachadaModulo(g, tipo, x, y, w, h, encendida, D) { /* ventana|balcon|local|vitrina|puerta */ return true; },  // 2.3
  mueble(g, m, estilo, P) { return MC.Sprites.dibujar(g, 'muebles/' + m.tipo + '_' + estilo, m.x + m.w / 2, m.y + m.h, 1); }  // 2.3, en metros
}).usar('encicla');
```
**Regla:**
- si un gancho devuelve `true`, el motor no dibuja lo suyo;
- si no, dibuja el respaldo procedural;
- lo que falte queda en `MC.Sprites.faltan`.

**2.5.1 · un paquete entero de arte, en una línea** (`js/87-pieles.js`):
```js
// arte/<ia>/ = atlas .webp + manifiesto.json (cuadros, anim, metros) + iconos.json + hitos.json + paletas.json
// juego.json: "arte": ["gemini"] → el HTML trae MC_ARTE.gemini (o se incluye dist/arte/gemini.js)
MC.Pieles.instalar('gemini', MC_ARTE.gemini, { partes: ['prop', 'naturaleza', 'fachada', 'mueble'], pixel: () => vistas.pixel, usar: true });
MC.arte.usar('motor');                    // volver al procedural
MC.Pieles.icono('vista_cenital', 20);     // <svg> de G‑M9
```
- Cada gancho cae al dibujo del motor si el sprite no está.
- Los árboles y las rocas se dibujan **a la medida del motor**, para que la sombra calculada coincida con el dibujo.
- De noche se usa una **copia oscurecida** del atlas, hecha una sola vez.
- Las partes son: `prop`, `naturaleza`, `fachada`, `personaje`, `vehiculo`, `animal`, `mueble` y `arbol` (2.6).

**2.6 · estilo realista familiar:**
```js
MC.estilo = 'realista';        // por defecto; 'clasico' = plano y limpio (las losas se rehacen solas)
MC.Arboleda.en(mundo, x0, y0, x1, y1)   // los árboles: { x, y, r, h, e (especie), v (variante) }, los mismos que chocan
// gancho de arte para reemplazar los árboles procedurales (C‑A4): vista 'lado' (ancla en el pie) o 'arriba' (ancla en el centro)
MC.arte.registrar('mijuego', { arbol(g, t, vista, x, y, pxPorMetro, D) { return MC.Sprites.dibujar(g, 'mijuego/arbol_' + t.e + '_' + vista, x, y, pxPorMetro, { metros: vista === 'lado' ? t.h : t.r * 2 }); } });
```
- Los árboles van de pie desde un zoom de 3,2 px por metro (4,2 con calidad media), y antes se hornean desde arriba en las losas.

**2.7 · estilos gráficos, peso y vida, y motores potentes:**
```js
MC.estilo = 'comic';            // realista, clasico, comic, manga, anime, novela, ukiyoe, acuarela (MC.Estilo.lista())
MC.Estilo.col('#c25f37')        // un color pasado por el estilo activo; MC.Estilo.rgb([r, g, b]) en 0..1
// un estilo nuevo es un objeto de datos en MC.ESTILOS_GRAF: { n, icono, saturar, brillo, contraste, gris, niveles,
//   paleta, mezcla, umbral, tonos, acento, tinta, tintaColor, trama: 'puntos'|'tono'|'rayado'|'papel', arbol: 'real'|'cel'|'tono'|'silueta'|'acuarela',
//   sombra: [r, g, b, a], cielo: [[arriba], [horizonte]], lineas: color, onomatopeyas: true, final: 'gris' }
MC.Vida.emitir('polvo', x, y, 8, { vel: 2 }); MC.Vida.onomatopeya(x, y, '¡ZAS!'); MC.Vida.impacto(.06);   // peso y vida
const glb = MC.Exportar.glb(mundo, [x0, y0, x1, y1]);   // glTF 2.0 binario; MC.Exportar.escena(...), .alturas(...), .r16(...)
socket.send(JSON.stringify(MC.Puente.instantanea(E)));  // el estado vivo para otro motor
```

**2.8 · de la entrega maestra:**
```js
MC.opciones.sacudida = .4; MC.opciones.particulas = 0;   // accesibilidad: de 0 a 1
MC.Telemetria.registro(vistas.ms, dt); MC.Telemetria.resumen();   // { fps, cuadro_p50, cuadro_p95, cuadro_p99, dibujo_p95, gpu }
MC.Contratos.validar(MC.Exportar.escena(M, caja), esquemaEscena);   // [] si cumple schemas/escena.schema.json
MC.on('fauna', e => …); MC.on('aterriza', e => …);   // las palomas alzaron vuelo; el jugador aterrizó (fuerza 0–1)
```
- Las huellas (`MC.Vida.marcas`) duran 4 minutos.
- Las palomas aparecen en plazas, andenes y parques.
- Los faros salen solos de noche en el carro y la moto del jugador.
- `Rudeza` (asfalto, andén, techos y grano) se hornea una vez por losa: no cuesta por cuadro.

### 5.5 Mi casa y quien vive en ella (Los Sims)
```js
const R = MC.Hogar.desdeDireccion(M, 'Calle 31 # 28-15', { guardaDireccion: false });   // sin internet; la dirección no sale del aparato
const hogar = R.hogar, plano = hogar.plano();          // interior propio del edificio real
hogar.estilo('bohemio'); hogar.comprar('sofa', libro, 'jugador'); hogar.poner('sofa', 1.2, 0.8);
const hab = new MC.Habitante(plano, { semilla: 5 });   // elige por anuncios de los objetos y la distancia
hab.paso(dt, 6);                                       // 6 min de juego por segundo; hab.accion.texto = «duerme», «cocina»…
hogar.ambiente();                                      // 0–100: decorar sube el ánimo
```

### 5.6 La ciudad (SimCity y Cities: Skylines)
```js
const urbe = new MC.Urbe(M, { libro, centro: { x, y }, alCambiar: (a, b, c, d) => vistas.losas.invalidar(a, b, c, d) });
urbe.zonificar('R', x, y, 150);          // celdas de 8 m junto a las calles (R, C, I, O; 'baja' o 'alta')
urbe.servicio('parque', x, y);           // parque, policia, bomberos, salud, colegio, biblioteca, estacion, energia, agua
urbe.avanzar(1);                         // un mes: demanda RCI, crecimiento, niveles, recursos y presupuesto
E.capaInfo = urbe.capa('valor');         // capas de datos: valor, ruido, contaminacion, verde, servicios, transporte, zonas
urbe.demanda(); urbe.valorEn(x, y); urbe.resumen(); urbe.guardar();
```

### 5.7 Lugares, historias, ocurrencias y sonido
```js
const L = MC.Lugares.cerca(M, x, y, 30)[0];
MC.Lugares.hacer(L, 'reparar', { libro, cuenta: 'jugador', desgaste, vehiculo: cuerpo.veh, hora: reloj.hora });
const hist = new MC.Historias({ semilla: 11 }); hist.paso(dt);
const s = hist.elegir({ hora: reloj.hora, clima, vehiculo: cuerpo.veh, altura: cuerpo.altura, lugarTipo: L && L.tipo, banderas: {} });
if (s) ui.dialogo('🌅', s.texto, s.opciones.map(o => o.texto)).then(i => s.opciones[i].elegir());
const ocu = new MC.Ocurrencias({ juego: 'mi-juego' }); ocu.vigilar(dt, { cuerpo, mundo: M, libro, entrada, ms: vistas.ms });
MC.Paisaje.tocar({ hora: reloj.hora, clima, ruido: .5, verde: .4 });   // después de un toque del jugador
MC.Musica.tocar({ estilo: 'lofi', tema: 'gimnopedia', energia: .4, compases: 16 });
```

### 5.8 Generar con reglas (Townscaper)
```js
const R = MC.Ondas.resolver({ ancho: 10, alto: 10, fichas: { casa: { peso: 3, lados: ['c', 'c', 'c', 'c'] }, plaza: { peso: 1, lados: ['p', 'p', 'p', 'p'] } }, compat: (a, b, d) => true, semilla: 7 });
const fachada = MC.Ondas.fachada(5, 4, 12);              // [['ventana', 'balcon', …], …, ['local', 'puerta', 'vitrina', 'local']]
const rejilla = MC.RejillaIrregular.crear({ anillos: 4, lado: 6, semilla: 3 });   // { puntos, quads }: pueblos orgánicos
MC.Autotile.mascara8((x, y) => agua(x, y), i, j);        // 47 casos de borde (agua, pasto, andén…)
```

### 5.9 Terreno, agua y límites (2.4)
```js
MC.Terreno.agua(M);                                    // al cargar (una vez, ~0,3–1 s): lagos, ríos, mar, quebradas y su profundidad
MC.Terreno.aguaEn(M, x, y);                            // { tipo: 'mar'|'lago'|'rio'|'quebrada', prof (m), orilla (m) } o null
MC.Terreno.en(M, x, y);                                // { material, via, pendiente, agua, cota }
MC.Terreno.paso(cuerpo, x, y);                         // { ok, f, vadea, nada, motivo }: lo usa MC.Cuerpo solo
cuerpo.nadando; cuerpo.vadeando; cuerpo.bloqueo;       // 'el agua está muy honda (2.3 m)', 'está muy empinado', 'un árbol'…
cuerpo.obstaculos = () => trafico.map(v => ({ x: v.x, y: v.y, r: 1.1, motivo: 'un vehículo' }));   // lo que el juego quiera que estorbe
MC.Naturaleza.en(M, x0, y0, x1, y1);                   // rocas, palmas, frailejones, arbustos y juncos (se dibujan y chocan solos)
/* ENTRAR AL AGUA (2.5) */
cuerpo.bajarse('agua');                                // se baja y deja el vehículo parqueado (cuerpo.estacionado); también solo al empujar 0,6 s hacia lo hondo
cuerpo.actualizar(dt, { baja: true });                 // nadando: bucea (sube con { sube: true } o { salto: true }); quieto, flota hacia arriba
cuerpo.buceando; cuerpo.aire;                          // aire 0–1 (cuerpo.pulmones = 35 s); sin aire sube sola (evento MC.on('sinAire'))
cuerpo.puedeMontar(3) && cuerpo.montar(3);             // vuelve al vehículo parqueado
cuerpo.embarcar('lancha', 30); cuerpo.desembarcar(16); // lancha en el agua honda más cercana / a la tierra firme más cercana
MC.Terreno.aguaHonda(M, x, y, r, min); MC.Terreno.tierraFirme(M, x, y, r);
```
- **Lo que pinta el motor solo:**
  - el vehículo parqueado;
  - las poses `nada` y `bucea`;
  - el agua tapando el cuerpo;
  - las burbujas;
  - el tono bajo el agua en todas las vistas.
**Reglas de paso:**

| Clase | Pendiente máxima fuera de vía | Agua que cruza |
|---|---|---|
| A pie | ~45° | Vadea hasta ~1,15 m; después nada |
| Bici | ~19° | 0,25 m |
| Moto | ~27° | 0,3 m |
| Carro | ~24° | 0,4 m |
| Camión | ~17° | 0,7 m |
| Lancha | — | Necesita 0,6 m |

- La bici de montaña y el todoterreno toleran 40 % más pendiente, y el todoterreno entra al monte.
- Sobre las vías la pendiente no bloquea, porque las calles reales existen ahí.

### 5.10 Probar y medir
```bash
node motor.mjs construir && node motor.mjs prueba --navegador     # 134 en verde
node motor.mjs exportar guatape                                   # el mundo en glTF, alturas RAW 16 y escena JSON (dist/exportar/)
node motor.mjs capturas                                           # 14 fotos estándar de Mandados en dist/capturas/
node motor.mjs revisar-arte arte/chatgpt                          # revisa un paquete de arte contra las reglas
MC_CHROMIUM=/usr/bin/chromium node motor.mjs prueba --navegador   # si Playwright no pudo bajar su navegador (red cerrada)
node motor.mjs reporte "Lo que cambié" --juego encicla --autor "IA de EnCicla"
node motor.mjs documento                                          # arma dist/MOTOR-CITY-TODO.md (este documento + anexos)
```

## 6. Lo aprendido de las referencias y dónde quedó
| Referencia | Lo que enseña | En el motor | Lo que falta (petición) |
|---|---|---|---|
| **SimCity** (2000, 4, 2013 con GlassBox) | Ciudad por **capas de datos** (valor del suelo, deseabilidad, contaminación, crimen y tráfico). Parques y agua valorizan; la contaminación desvaloriza. Desde 2013, **recursos en recipientes llevados por agentes** (GlassBox). | `MC.Urbe`: campos de 40 m (valor, ruido, contaminación, verde, servicios, transporte), demanda RCI, energía y agua con capacidad, y capas de datos encima de las vistas. | Agentes que lleven los recursos (agua, energía, basura) por la red; viajes casa → trabajo (C‑M9). |
| **Cities: Skylines** (1 y 2) | **Zonas pegadas a las calles**; lotes que crecen mirando a la calle; demanda RCI; **niveles** de edificio por valor del suelo y servicios; distritos y políticas; **props y decals** (el detalle); LOD. Lección de la 2: sin LOD y con sombras caras el rendimiento se cae. | Zonas de 8 m hasta 4 de fondo; lotes alineados con la vía; niveles 1–5; `MC.Mobiliario` (postes, árboles, bancas, paraderos, cebras e hidrantes). Sombras baratas (un trazo y en caché). | Distritos y políticas; decals (manchas, huecos, charcos); kits de props de Gemini (G‑M10 y G‑M11). |
| **Los Sims** | «Personas simples, **objetos inteligentes**». Los objetos **anuncian** qué necesidad satisfacen. 8 motivos (hambre, higiene, diversión, energía, vejiga, social, comodidad y ambiente). **Ambiente del cuarto** por decoración. Modos de construir y de comprar. | `MC.Necesidades` (anuncios, urgencia cuadrática y atenuación por distancia) y `MC.Habitante` (vive en la casa); `Hogar.ambiente()`. Comprar y poner ya estaban (`MC.Hogar`). | Paredes editables (modo construir), dos o más habitantes que conversan, A* dentro de la casa (C‑M10). |
| **Townscaper** (Oskar Stålberg) | **Rejilla irregular** (hexágono → triángulos → cuadriláteros relajados). **Reglas locales** (WFC) que eligen el módulo según los vecinos. Las casas se arman en las **esquinas** (rejilla dual). Paleta suave, sombras de contacto y detalles automáticos (arcos, escaleras, jardines). | `MC.RejillaIrregular`, `MC.Ondas.resolver` (WFC) y `fachada`, `MC.Autotile` (máscaras 4/8 y esquinas). Fachadas por reglas en ciudad 3D, maqueta y lateral. Oclusión de contacto en losas, árboles y gente. | Pueblos generados sobre la rejilla irregular; módulos 3D de casas por esquina (G‑M12 y C‑M11). |
| **Sombras** (todas) | La sombra **sienta** las cosas y cuenta la hora. Un buen sistema es barato: una sombra por objeto, en caché y por calidad. | `MC.Sombras`: sombra proyectada según el sol real (larga y cálida al atardecer, ninguna de noche); casco convexo en caché; recorte de techos en cenital; también en el raster. Luz de noche: charcos cálidos en los postes. | Sombras sobre los muros de los vecinos y de los árboles (C‑M12). |
| **Terreno y agua** (motores de mundo abierto; Barnes, 2014) | Controlador de personaje con **pendiente máxima** y escalón; agua con profundidad (vadear o nadar); llenado de depresiones por prioridad para tener lagos con salida; la naturaleza sigue al material y a la pendiente. | `MC.Terreno`, `MC.Naturaleza`, lagos del generador, agua y roca en las losas. | Texturas de agua y orillas, olas y animación de la espuma (G‑M15); capa de agua precalculada en el MC4 (C‑M15). |
| **FEZ, Monument Valley, Little Nightmares** | Vistas ortográficas, giros de a 90° y casa de muñecas. | Vista lateral, maqueta 2:1 y rayos X. | — |
| **GTA, Forza, Need for Speed** | Cámara de persecución, FOV con la velocidad y asistencias. | `MC.Camara`, `MC.Manejo`. | Carreras (*Motor City*, 2.4). |
| **No Man's Sky** | Todo desde una semilla y ruido continuo. | `MC.Cosmos`. | — |
| **Left 4 Dead, storylets** | Director de ritmo y historias por saliencia. | `MC.Historias`. | 60 storylets (C‑M5). |

**Lo crucial para cómo se crea en el motor (2.3):** una ciudad no se dibuja, **se cultiva**.
1. Calles reales o generadas.
2. Zonas a sus lados.
3. Lotes que crecen por demanda y valor.
4. Fachadas armadas por reglas.
5. Mobiliario a lo largo de las vías.
6. Sombras y luz según la hora.
7. Gente con necesidades.
8. Capas de datos para entender y decidir.
9. **Terreno con reglas (2.4):** el agua tiene tipo y profundidad, la montaña tiene pendiente y roca, y nada se atraviesa sin sentido.

## 7. Reglas para todas las IAs
1. **Lee todo este documento.** Antes de cambiar el motor, sigue la skill `motor-city-desarrollo` (en `.claude/skills/`).
2. **Las reglas del autor:**
   - un solo HTML, sin internet ni librerías;
   - español de Colombia, para todo público y sin datos personales;
   - no romper guardados ni la API (deja alias);
   - las pruebas en verde;
   - el arte con respaldo procedural;
   - nada de marcas, logos ni personas reales sin permiso.
3. **Tres pilares** en todo: **diversión** (que quiera seguir), **reflexión** (que el mundo pese, sin sermones) y **conciencia** (que aprenda algo real, rápido y jugando).
4. **La pantalla es del juego:**
   - el centro no se tapa;
   - información arriba y acciones donde llega el pulgar;
   - un aviso a la vez;
   - lo que no cambia se atenúa.
5. **Fluido:** presupuesto de 16,7 ms (o 33,3 ms) por cuadro. Si agregas detalle, agrégalo con **LOD y caché** (la lección de Cities: Skylines 2).
6. **Ciencia con fuente** y prueba con valores conocidos (skill `motor-city-ciencia`).
7. **Un solo cierre:** antes de declarar un `const` de nivel superior, busca que no exista (`grep -n "const NOMBRE" js/*.js`).
8. **Reporte obligatorio** si tocas el motor desde un juego.
9. **Solo lo tuyo.** Si te piden algo de otra IA, dilo y no lo hagas.

## 8. Cómo probar y publicar
```bash
git clone https://github.com/juanfeliperico369-stack/motorcity && cd motorcity && git checkout claude/motor-city-engine-xu7p4y
node motor.mjs construir && node motor.mjs prueba --navegador
```
- **La web** (GitHub Pages) sirve la rama `main`. Lo que llega a `main` queda en <https://juanfeliperico369-stack.github.io/motorcity/>.
- **Los juegos:** `node motor.mjs sincronizar ../BicicletasUno` copia el motor a `BicicletasUno/motor-city/`.

## 9. Plan de cada IA
### 9.1 Gemini (Antigravity «hydrogen» y Nano Banana) · TAREAS FÁCILES: revisar, medir, datos y referencias
**Cambio del autor (nov‑2026):** Antigravity trabaja por ahora con **«hydrogen»** (ya no con «argon»), así que a Gemini le tocan tareas cortas y comprobables. **La lista exacta está en `TAREAS-IA.md`.**

| Id | Tarea |
|---|---|
| **G‑H1** | Revisión visual con `node motor.mjs capturas` (14 fotos estándar de Mandados) y una tabla de hallazgos. |
| **G‑H2** | Revisor de arte: `node motor.mjs revisar-arte arte/<paquete>` sobre cada entrega. |
| **G‑H3** | 6 láminas de referencia del estilo realista familiar (Nano Banana), solo como guía para ChatGPT. |
| **G‑H4** | 30 datos verificables de Guatapé y Medellín, con fuente. |
| **G‑H5** | Qué ícono de G‑M9 va en cada botón. |
| **G‑H6** | Correr las pruebas del motor y de los juegos, y reportar. |

**Lo que ya entregó (2.5.1):**
- G‑M0…G‑M15 está en `arte/gemini/`; la revisión de Claude, en `arte/gemini/LEEME.md`;
- se usan los props, las fachadas y los muebles. En 2.6 los árboles son los procedurales con volumen.

**Lo que ya no le toca:** los atlas grandes, el personaje y los vehículos a escala pasan a ChatGPT (C‑A2 y C‑A3).

**No es tu rol:** el código del motor (eso es de ChatGPT y de Claude).

**Nuevo en la 3.0:**
- **G‑H14**: capturas de las 3 cámaras en un celular con GPU;
- **G‑H15**: los colores reales de los zócalos de Guatapé;
- **G‑H16**: la fluidez del 3D contra el 2D;
- **G‑H17**: 30 objetos del mobiliario real.

**Nuevo en la 2.10:**
- **G‑H11**: las 4 paletas colombianas;
- **G‑H12**: correr `node motor.mjs publico`, `node motor.mjs skills` y `legacy-scan`, y reportar;
- **G‑H13**: instalar las skills en Antigravity.

### 9.2 ChatGPT (imágenes) y Codex («astra») · TAREAS FUERTES: arte realista a escala y código difícil
**Cambio del autor (nov‑2026):** Codex sigue con **«astra»** y ChatGPT genera mejores imágenes, así que le tocan el arte importante y el código difícil. **La lista exacta está en `TAREAS-IA.md`.**

**Arte, en orden** (detalle en §10.2):
1. **C‑A1** · ancla de estilo realista familiar.
2. **C‑A2** · personaje a escala.
3. **C‑A3** · vehículos a escala.
4. **C‑A4** · árboles realistas (gancho nuevo `arbol`).
5. **C‑A5** · texturas de suelo.
6. **C‑A6** · fachadas con desgaste.
7. **C‑A7** · animales a escala.

**Código, en orden:**
1. **C‑M13** · maqueta por debajo de 20 ms.
2. **C‑M16** · gancho `textura`.
3. **C‑M17** · lluvia que se ve.
4. **C‑M1** · auditoría de lo nuevo.
5. **C‑M15** · terreno.
6. **C‑M9, C‑M12, C‑M10, C‑M14 y C‑M11.**
7. **C‑M2 a C‑M8.**

**El código que usarás:**
- **arte:** en `arte/chatgpt/`, con atlas y `manifiesto.json`. Debe pasar `node motor.mjs revisar-arte arte/chatgpt`. Se prueba con `MC.Pieles.instalar('chatgpt', MC_ARTE.chatgpt, { partes: [...] })` (§5.4);
- **código:** commits en la rama con `node motor.mjs prueba --navegador` en verde, y cada mejora con su prueba `ok(condición, 'qué se prueba', datos)`.

**Nuevo en la 3.0 (mundo único 3D):**
- **C‑M26**: persecución jugable;
- **C‑M27**: sombras y desenfoque de maqueta en WebGL;
- **C‑M28**: atlas de fachadas e impostores lejanos;
- **C‑M29**: rampas, destrucción y objetos guardados por sector;
- **C‑A13** y **C‑A14**: láminas de fachadas y de vehículos.

**Nuevo en la 2.10, con las skills de los videos:**
- **C‑M23**: la red vial de Guatapé, sin puntas sueltas;
- **C‑M24**: la ayuda de manejo para niños, que pidió el público simulado;
- **C‑M25**: la portada web con **Hallmark**;
- **C‑A12**: el tráiler de Mandados con **HyperFrames**.

Antes de escribir HTML, CSS o JS, consulta **Modern Web Guidance**. Las skills se instalan con `node motor.mjs skills --instalar --agente codex`.

### 9.3 IA de Juega EnCicla (`BicicletasUno`)
1. Migrar a `motor-city/` (`motor-city/docs/MIGRACION-ENCICLA.md`) sin perder sus 97 pruebas.
2. Usar `MC.Vistas`, que ya trae sombras, mobiliario, lateral y panorámica, con la piel EnCicla.
3. Usar `MC.Manejo` (perfil bici) y `MC.UI` (tema `encicla`) con `verificar`.
4. **Estaciones EnCicla como lugares jugables**, y talleres de bici.
5. **Mi casa** con soporte para la bici.
6. **Capa de datos de movilidad:** `urbe.capa('transporte')` y `ruido` para ver dónde conviene la ciclorruta. **Conciencia:** por qué la bici baja el ruido.
7. Historias de cultura ciudadana.
8. Publicar en `gh-pages` **conservando `/metro/`**, con APK de `versionCode` > 20003. No subas llaves.

### 9.4 IA de El Metro (`MetroZero`)
1. Seguir su protocolo de 7 pasos y migrar a `motor-city/`.
2. **Lección de ciudad:**
   - las estaciones suben el valor del suelo: `urbe.capa('transporte')` y `urbe.capa('valor')`;
   - un modo «¿dónde va la próxima estación?» con `MC.Urbe`.
3. `MC.Raster` como respaldo de su G3. Estaciones como lugares, con interiores. Cultura metro. Rosalba y la gente con rutinas.
4. `node tools/test.mjs 100` con 0 errores.

### 9.5 IA de Run Scooter (`RunRunZero`)
- Sigue independiente. Avisa si cambias el juego (el importador dice qué parche no calza).
- Opcional: `MC.Manejo` y `MC.Sprites`.

### 9.6 Codex y Antigravity como agentes de un juego
Son «la IA de ese juego» (9.3 a 9.5): misma rama, mismas pruebas y reporte.

### 9.7 Claude (la IA del motor) · lo que sigue
1. Unir la entrega de ChatGPT (la de Gemini quedó en la 2.5.1): 2.6.
   - De la auditoría de Codex: bajar la **maqueta** de 40 ms en cualquier máquina, con caché por región y fachadas horneadas.
   - Del informe de Gemini queda pendiente:
     - la cola única de avisos y anuncios;
     - el minimapa suavizado;
     - el modo para daltónicos con sus paletas;
     - los íconos SVG en la interfaz.
2. Carreras de *Motor City* sobre la red real (`MC.Carrera`), con repeticiones.
3. *Extremo*: física de tabla, de bici de montaña y de surf.
4. Agentes con propósito en `MC.Urbe`.
5. Losas en un *Worker*.
6. Otra ciudad completa con transporte.

## 10. Peticiones en detalle
### 10.1 Para Gemini
> **Desde la 2.6, lo de Gemini son las tareas fáciles G‑H1…G‑H6 de `TAREAS-IA.md`.** La tabla de abajo (G‑M0…G‑M15) ya se entregó en la 2.5.1 y queda como referencia de las reglas y los nombres.

**Reglas del arte:**
- sin texto, logos ni marcas;
- fondo transparente o **magenta #ff00ff**;
- **32 px por metro** en la fuente;
- perfil mirando a la derecha; cenital mirando al oriente (+x); frontal para fachadas y muebles en lateral;
- luz de arriba a la izquierda y **sin sombra proyectada** (la pone el motor);
- nombres en minúsculas, en español y con guiones bajos;
- medidas de `MC.Escala.MEDIDAS`.

**Cada atlas trae su JSON:** `cuadros: { nombre: [x, y, w, h, ancla_x, ancla_y] }`, con el ancla en los pies o en la base, y `metros: { nombre: altoReal }`.

| Id | Encargo |
|---|---|
| **G‑M0** | **Ancla de estilo:** una lámina con personaje en bici, carro, casa de ladera, torre, **una calle con su mobiliario** y una sala desde arriba. En suave y en pixel ×3. 1024×512. |
| **G‑M1** | **Personaje:** 8 estados (quieto, camina, corre, pedalea, impulsa, patina, sentado y salta; 3–4 cuadros cada uno). Perfil y cenital de 4 direcciones. 3 tonos de piel, 2 peinados y 2 cuerpos. |
| **G‑M2** | **Vehículos:** los 35 de `MC.Vehiculos`, de perfil y cenital, con las ruedas aparte. Taxi amarillo y buseta, sin marcas. |
| **G‑M3** | **Animales:** perro criollo, gato, gallinazo, colibrí, iguana, zarigüeya, ardilla, caballo y vaca. Más 4 criaturas verosímiles por la ley cuadrado‑cubo. |
| **G‑M4** | **Muebles por estilo:** los 22 de `MC.Interiores.CATALOGO`, más los del plano (nevera, estufa, inodoro, ducha y lavamanos), en los 8 estilos (paisa, moderno, minimalista, bohemio, campestre, industrial, juvenil y clásico). Cenital (gancho `mueble`) y frontal. **Prioridad:** sala, alcoba y cocina en paisa, moderno y juvenil. |
| **G‑M5** | **Pisos y muros:** madera, 3 baldosas hidráulicas paisas, porcelanato y cemento. *Tiles* de 64×64 sin costuras. |
| **G‑M6** | **Lugares jugables:** taller de bicis y de carros, tienda de barrio, tienda de ropa, centro comercial, biblioteca y restaurante, con sus muebles propios. |
| **G‑M7** | **Fachadas por zona** (ladera, centro, Laureles, El Poblado, pueblo e industria), de día y de noche. |
| **G‑M8** | **Siluetas de los 30 hitos**, como *paths* normalizados. |
| **G‑M9** | **Íconos SVG:** 9 vistas, 7 controles, 10 lugares, Mi casa, Ciudad, capas de datos, zonas (R, C, I, O) y servicios. |
| **G‑M10 (nuevo)** | **Kit de props urbanos**, como los de Cities: Skylines: poste (día y noche), **5 árboles del trópico** (guayacán amarillo, guayacán rosado, ceiba, palma y mango), banca, caneca, paradero, hidrante, señal de pare, semáforo, kiosco, fuente, bolardo y matera de andén. Cenital y frontal, para el gancho `prop(g, p, x, y, pxm, D)` (`p.t` es el tipo y `p.v` una variante de 0 a 1). |
| **G‑M11 (nuevo)** | ***Decals* del piso:** manchas de aceite, grietas, alcantarillas, huecos, hojas caídas, charcos para la lluvia, rayas gastadas y cebras viejas. Transparentes, de 64–128 px. |
| **G‑M12 (nuevo)** | **Módulos de fachada para las reglas** (WFC, como Townscaper): `ventana`, `balcon`, `local`, `vitrina`, `puerta` y `muro`, cada uno en 3 variantes por zona, de día y con la ventana encendida. Para el gancho `fachadaModulo(g, tipo, x, y, w, h, encendida, D)`. Que encajen entre sí: lado con lado y piso con piso. |
| **G‑M13 (nuevo)** | **Paletas:** 6 por hora (amanecer, mañana, mediodía, tarde, atardecer y noche) para el tono de la ciudad, al estilo de la paleta suave de Townscaper. Y paletas para las **capas de datos** (valor, ruido, contaminación, verde, servicios y transporte), con versión para **daltónicos**. JSON con colores HEX. |
| **G‑M15 (2.4)** | **Naturaleza y agua:** rocas de 5 tamaños (de 0,4 a 3 m, grises andinas), palma de coco y palma de cera (la del Quindío), frailejón (páramo), arbustos de monte y juncos de orilla. Cenital y frontal, para el gancho `naturaleza(g, p, x, y, pxPorMetro, D)` (`p.t`, `p.s` es el tamaño). Más *tiles* de agua de 64×64 por tipo (mar turquesa, lago verdoso, río pardo, quebrada clara), en somera y honda, la espuma de la orilla y la arena mojada. |
| **G‑M14 (nuevo)** | **Guía de luz y sombra:** color y opacidad de las sombras por hora y por zona, contacto suave en las bases y charcos de luz de noche (cálido o frío). Ejemplos pintados de una cuadra a las 7, 12, 17 y 20 h. |

**Auditoría visual:**
- La ciudad de día, en la tarde (sombras largas) y de noche (luces): ¿se lee bien a cada zoom?
- ¿El mobiliario estorba o ayuda?
- Las capas de datos: ¿se entienden?
- 10 casas: ¿se sienten distintas?
- Compara con SimCity, Cities: Skylines y Townscaper (sin copiar arte).
- Mide en un celular real (FPS por vista) y anota `MC.GPU.perfil()`.

### 10.2 Para ChatGPT (arte y código)
| Id | Encargo |
|---|---|
| **C‑M1** | **Auditoría** de todos los módulos 2.2 y 2.3 (§4). Busca errores, bordes, fugas (cachés que crecen) y trabajo de más por cuadro. Entrega una tabla con archivo:línea, severidad, escenario y *diff*. |
| **C‑M2** | **Redes precalculadas** en el MC4 (~1 s menos al arrancar en Medellín). |
| **C‑M3** | **Raster** a menos de 12 ms a calidad 0,8 sin GPU. |
| **C‑M4** | **50 direcciones públicas** (calles y cruces) de Medellín, Envigado, Itagüí, Bello y Guatapé. Soporte de «Bis», «Este», diagonales y transversales. Nunca direcciones de personas. |
| **C‑M5** | **60 storylets** (20 por pilar) + **15 de alcalde** (fiestas del pueblo, mercado campesino, apagón, aguacero que tapa una quebrada, nuevo parque…), con datos verificables y su fuente. |
| **C‑M6** | **Accesibilidad:** lector de pantalla, teclado, contraste AA, modo zurdo, letra grande y **capas de datos para daltónicos**. |
| **C‑M7** | **Íconos SVG** que no haga Gemini, y el logotipo de Motor City (solo forma). |
| **C‑M8** | **Pruebas que faltan:** `Manejo.seguirRuta`, `Hogar.mover` y `girar`, `Lugares.hacer` en los 10 tipos, `Ocurrencias`, Kepler en `Cosmos` y `Sprites.hornear`. |
| **C‑M9 (nuevo)** | **Tráfico con propósito** (Cities: Skylines y GlassBox): los habitantes de los lotes de `MC.Urbe` viajan de la casa al trabajo por la red (A*). La carga de cada arista da la **congestión** y una capa `trafico`. Sin pasar de 2 ms por cuadro. |
| **C‑M10 (nuevo)** | **Casa:** A* en una rejilla de 0,25 m dentro del plano, dos o más `MC.Habitante` que conversan (necesidad social), y **modo construir** (mover paredes y puertas) que siga pasando `Interiores.cabe`. |
| **C‑M11 (nuevo)** | **Pueblo orgánico:** `MC.Generador` arma la plaza y las manzanas de un pueblo sobre `MC.RejillaIrregular`, con `MC.Ondas` para decidir casa, patio, calle o plaza. |
| **C‑M12 (nuevo)** | **Sombras:** también sobre los muros de los edificios vecinos y de los árboles del mobiliario, en caché por hora y sin pasar de 3 ms. |
| **C‑M13 (nuevo)** | **Maqueta por debajo de 20 ms** con la CPU 4× más lenta, con todo el detalle: lotes por región, fachadas en caché y mobiliario en lienzos. |
| **C‑M15 (2.4)** | **Terreno:** (1) guardar en el MC4 una capa `agua` precalculada (tipo y distancia a la orilla), porque hoy se calcula al cargar en 0,3–1 s; (2) física en terreno irregular: el carro se inclina y patina en barro y nieve, y la moto y la bici de montaña saltan rocas pequeñas; (3) pruebas de los motivos de `Terreno.paso` en los 7 tipos de vehículo; (4) en el raster, agua y rocas. |
| **C‑M14 (nuevo)** | **Distritos y políticas** en `MC.Urbe`, como Cities: Skylines: nombre, impuestos por distrito y políticas (prohibir industria pesada, bici prioritaria, parques gratis), con efecto en los campos y en la demanda. |
| **C‑A1 (2.6)** | **Ancla de estilo realista familiar:** una cuadra de Guatapé en maqueta 2:1, de día y de noche con lluvia. Asfalto gastado, andenes de baldosa, tejas, zócalos de colores y guayacanes. Sin caricatura, sin texto ni marcas. |
| **C‑A2 (2.6)** | **Personaje a escala** (reemplaza G‑M1): 10 estados × 4 cuadros de perfil y 4 direcciones desde arriba. 6 personas distintas. 1,70 m = 54 px. La figura llena el cuadro. |
| **C‑A3 (2.6)** | **Vehículos a escala** (reemplaza G‑M2): los 35 más los 2 de mandados, de perfil y desde arriba, sin sombra horneada, con algo de uso. Ruedas aparte. |
| **C‑A4 (2.6)** | **Árboles realistas** para el gancho `arbol`: 6 especies × 3 variantes más 2 palmas, de lado y desde arriba, de 128 px. |
| **C‑A5 (2.6)** | **Texturas de suelo sin costuras**, de 128 px = 4 m: asfalto gastado y parcheado, baldosa, adoquín, pasto, barro, grava, teja, plancha y zinc. |
| **C‑A6 (2.6)** | **Fachadas con desgaste** para `fachadaModulo` (reemplaza G‑M12). |
| **C‑A7 (2.6)** | **Animales a escala** para `animalLado` (reemplaza G‑M3). |
| **C‑M16 (2.6)** | **Gancho `textura`** en `Losas.pintar`: patrones en metros con las texturas de C‑A5, y `Rudeza` como respaldo. Con su prueba. |
| **C‑M17 (2.6)** | **Lluvia que se ve:** asfalto mojado, charcos con reflejo y salpicaduras, sin pasar de 2 ms por cuadro. |

## 11. Cómo entregar
- **Gemini:** `ENTREGA-GEMINI-MOTOR-CITY-<versión>.md` (Claude extrae el arte a `arte/gemini/`):
  - resumen de 10 líneas;
  - cada G‑M, con su imagen en base64 o SVG, su JSON y una nota de uso;
  - auditoría (tabla);
  - rendimiento en el celular;
  - reglas aprendidas.
- **ChatGPT:** `ENTREGA-CHATGPT-MOTOR-CITY-2.3.md`:
  - resumen;
  - auditoría;
  - cada C‑M, con su *diff* unificado, cómo probarlo y la salida de las pruebas;
  - reglas aprendidas.
- **IAs de los juegos:** commits en su rama, su bitácora y un reporte en el motor (`node motor.mjs reporte`) si lo tocan.
- **Todas:** informen en 5–10 líneas: qué hicieron, cómo lo probaron, qué aprendieron y qué falta.

## 12. Lo que necesita el autor
1. **Probar en un celular real** de gama media, con Mandados: qué se siente lento o confuso.
   - Lo pedido y su estado: `docs/PEDIDOS.md`.
2. **Pasar este documento** a cada IA y traer sus entregas.
3. **Elegir la licencia** del motor antes de mostrarlo a empresas (ver `docs/NEGOCIO-Y-USOS.md`).
4. **Permisos de marca** si un juego usará logos del Metro o de EnCicla comercialmente.

No hace falta conectar ninguna aplicación.

## 13. Fuentes
**SimCity:**
- Game Developer, «GDC 2012: Breaking down SimCity's GlassBox engine».
- Andrew Willmott, «Inside GlassBox».
- PC Gamer, «SimCity: Inside the GlassBox engine».
- Análisis de la comunidad sobre el valor del suelo en SimCity 4.

**Cities: Skylines:**
- Paradox Interactive y Colossal Order, *dev diaries* de zonificación y economía.
- Análisis técnicos del rendimiento de Cities: Skylines II: PC Gamer, Tom's Hardware y Windows Central.

**Los Sims:**
- Forbus y Wright, «Programming Objects in The Sims» (Northwestern).
- Game Maker's Toolkit, «The Genius AI Behind The Sims».
- PC Gamer, sobre la autonomía de Los Sims.

**Townscaper:**
- Boris the Brave, «Editable WFC» y «WFC tips and tricks».
- Maxim Gumin, *WaveFunctionCollapse* (GitHub).
- Charlas de Oskar Stålberg (por ejemplo, «Beyond Townscaper», 2021).
- Los detalles exactos de su rejilla no están documentados oficialmente.

**Terreno:** Barnes, Lehman y Mulla, «Priority-Flood: An Optimal Depression-Filling and Watershed-Labeling Algorithm» (2014), para los lagos.

**Las anteriores** (FEZ, Monument Valley, Little Nightmares, No Man's Sky, storylets, Left 4 Dead, cámaras y diseño de interfaz) están en `docs/INVESTIGACION.md`.


---

# ANEXO 0. Tareas de cada IA (`TAREAS-IA.md`)


> **24‑nov‑2026 · el «renacimiento cenital».** Es un pedido nuevo del autor: sanear el mapa del Valle, un cenital 2.5D en El Metro y EnCicla, y carreras pseudo‑3D en Turno Cero.
> - La Fase 0 está hecha: `docs/AUDITORIA-FASE0-CENITAL.md`.
> - **El autor ya decidió (24‑nov)**: el ancho real, trozos de 160 m, el modo libre en EnCicla, Ciudad Libre y Bus en El Metro, y rehacer desde las fuentes con la prueba de craqueo.
> - **La Fase 1 puede empezar:** sigue `docs/PROMPT-RELEVO.md`.
> - La misión y la visión de cada juego están en `docs/VISION-Y-MISION.md`.
> - Si vas a tocar `motor-valle/` o los datos de El Metro, avisa antes en `coord/buzon/`.

> **5.0 (23‑nov‑2026), decisión del autor: Gemini vuelve.** El plan está en **`docs/PLAN-5.0.md`**.
> - **ChatGPT y Codex** (lo fuerte: datos, render, física, IA y modelos): **`docs/PEDIDOS-CHATGPT-5.0.md`**.
> - **Gemini y Antigravity** (lo fácil y mediano: interfaz, cámara, textos, arte y modos): **`docs/PEDIDOS-GEMINI-5.0.md`**.
> - Lo de abajo, incluida la nota de la 4.9, queda como historial.

> **4.9 (22‑nov‑2026), decisión del autor: todos los pedidos que eran de Gemini y de ChatGPT pasan a ChatGPT** (imágenes en ChatGPT; código y commits en Codex). Gemini queda en pausa. **La lista vigente, en orden, con sus contratos técnicos: `docs/PEDIDOS-CHATGPT-4.9.md`.** Lo de abajo queda como historial.

> **4.5 (21‑nov‑2026), decisión del autor:** EnCicla, El Metro y Run Scooter **siguen con su propio motor**. Reciben Motor City en `motor-city/` como referencia y un informe detallado en `docs/INFORME-MOTOR-CITY-4.5.md` de cada repositorio. Las tareas de «migrar a motor-city» quedan anuladas. Lo de este motor: `CONTEXTO-RELEVO.md` § 0 y § 5.

> **Si te dijeron «mira el repositorio y haz tu parte», empieza aquí.**
> 1. Busca abajo **quién eres** y haz **solo tu parte**, en el orden indicado.
> 2. El contexto completo, el código exacto y las reglas están en `docs/DOCUMENTO-UNICO.md` (léelo entero). Lo que ya se hizo y lo que falta está en `docs/PEDIDOS.md`.
> 3. Al terminar, informa en 5–10 líneas: qué hiciste, cómo lo probaste, qué aprendiste y qué falta.

**Primero lee `CONTEXTO-RELEVO.md`** (el relevo entre IAs) y, al terminar, deja tu entrada en su § 8 y tu ficha en `coord/agentes/`.

**Novedades de la 4.0 (20‑nov‑2026): el planeta y *Turno Cero*.** Lee `docs/TURNO-CERO.md`.
- **El planeta** (`MC.Planeta`): Manhattan, Medellín y el Valle y Guatapé, unidos por carreteras de 12 a 16 km «en medio de la nada». Tiene horizonte curvo y vista de globo.
- **El juego adulto *Turno Cero*** (`juegos/getaway/`) toma el canon de Codex y lo lleva a las tres ciudades.
- **Sistemas nuevos del motor:**
  - `MC.Busqueda`, la búsqueda de 0 a 5, con tus umbrales y la última posición vista;
  - `MC.Modelos`, el lector GLB: tus 42 modelos ya se ven en la cámara 3D;
  - los juegos con varios mundos (`"mundos"` en `juego.json`);
  - los GLB dentro del HTML (`"modelos"`).
- **Los pedidos nuevos** están abajo, en «## 4.0 · Pedidos nuevos».

**Lo que sigue después de la 3.0:** la prueba en grande, «Getaway Nueva York». El plan, el orden y **las 10 reglas que dejó el feedback del autor para todas las IA** están en `docs/PROXIMO-NUEVA-YORK.md`. Léelas antes de tu encargo.

**Novedades de la 3.0 (20‑nov‑2026): un solo mundo 3D y varias cámaras.**
- La cenital, la ciudad y la maqueta son cámaras sobre el mismo mundo 3D (`js/45-gl3d.js`); sin GPU usan su respaldo 2D.
- Hay fachadas, árboles low-poly que son los mismos de la 2D, artilugios físicos (`MC.Objetos`), topes de zoom y el mapa grande.
- Lee primero `docs/INVESTIGACION-CAMARA.md`.
- Los videos que no se pudieron leer ya no interesan: G‑H10 se quitó.

**Novedades de la 2.10 (20‑nov‑2026):**
- **Skills y plugins de los videos del autor** (`skills-externas.json`, skill `motor-city-skills-externas`):
  - **Hallmark**, para páginas web que no parezcan hechas por IA;
  - **Modern Web Guidance** (Google Chrome), para HTML, CSS y JS moderno;
  - **find-skills** (Vercel), para buscar skills;
  - **HyperFrames**, para videos de lanzamiento.
- **Cómo se instalan (desde la 5.3.1, un solo comando para todas las IA):**
  - `node motor.mjs skills --integrar --agente <tu-agente>` (`claude-code`, `codex`, `antigravity`, `gemini-cli` o `cursor`);
  - deja las propias en `.claude/skills/` y `.agents/skills/`, completa el `.gitignore`, instala las externas y lo verifica;
  - el prompt para pasárselo a otra IA es `docs/PROMPT-SKILLS.md`;
  - Claude Code también las recibe como plugins por `.claude/settings.json`.
- **Público simulado:** `node motor.mjs publico`. Una niña, un abuelo, una gamer y un turista juegan solos Mandados, y el informe queda en `dist/publico.md`.
- **Política de navegadores:** está en `CLAUDE.md`.

**Reparto desde noviembre de 2026, por decisión del autor:**
- **Gemini con Antigravity** trabaja por ahora con **«hydrogen»** (ya no con «argon»). Le tocan las **tareas fáciles**: revisar, medir, reunir datos y referencias.
- **ChatGPT con Codex** sigue con **«astra»** y genera mejores imágenes. Le tocan las **tareas fuertes**: el arte realista a escala y el código difícil.

**La guía de referencias (2.8):** `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`, la entrega del autor con 25 fichas. Tiene el peso, la vida, la arquitectura portable y el rendimiento en móvil. Su resumen, con lo que ya está en el motor, está en `docs/INSPIRACION-VISUAL.md` §1.

**Los estilos (2.7):**
- **realista familiar** (por defecto);
- **cómic, manga, anime, novela gráfica, ukiyo-e y acuarela** (`MC.estilo`).

De las obras con derechos se toman las **técnicas**; el arte que se copia es de **dominio público** (`docs/INSPIRACION-VISUAL.md`). **Peso y vida:** `MC.Vida`. **Motores potentes:** `docs/MOTORES-POTENTES.md`.

**El estilo realista familiar (2.6):**
- Para todo público, pero con la ciudad como es:
  - asfalto gastado, con parches, grietas y alcantarillas;
  - andenes de baldosa con bordillo;
  - pasto con parches secos;
  - tejas de barro y planchas de concreto con humedad;
  - muros con la base sucia;
  - árboles con volumen (guayacanes florecidos, ceibas, mangos).
- Nada de caricatura plana. Nada de violencia, sangre ni marcas.
- El estilo clásico (plano) sigue disponible: `MC.estilo = 'clasico'`.

---

### 4.1 · Motores clásicos (21‑nov‑2026)
> Lee `docs/INVESTIGACION-MOTORES-CLASICOS.md`. La regla es **sala limpia**:
> - las ideas, sí; el código de otros motores, no;
> - **nunca** código filtrado;
> - cada técnica nueva lleva su fuente y una prueba con números comprobables.

#### Gemini · Antigravity («hydrogen») · fáciles
| Id | Tarea | Entrega |
|---|---|---|
| **G‑H25** | Juega Turno Cero en 🎥 **🏁 Arcade** y **⛰️ Vuelo**, en la ciudad y en una carretera, de día y de noche. Mide en un celular real la fluidez y si hay tirones al avanzar en Vuelo. | Capturas y una tabla en `reportes/` |
| **G‑H26** | Prueba el **sigilo nuevo** en el capítulo del muelle o de la bodega. Revisa si la gema ◆ se lee bien, si en lo oscuro los guardias de verdad ven menos y si el «👂 oyó tus pasos» se siente justo. | Reporte con lo que cambiarías |
| **G‑H28** | Prueba el **mundo abierto primero**:<ul><li>¿se entiende en la portada que ▶ es jugar ya?</li><li>¿se encuentra la historia 📖 cuando uno la quiere?</li><li>¿la casilla «Entrar directo» funciona?</li></ul>Hazlo también en El Metro y EnCicla: ¿se puede jugar de una, sin tutorial obligatorio? | Reporte con capturas |
| **G‑H27** | Lista de **más técnicas clásicas** con fuente pública y licencia, por ejemplo *Driver*, *Midtown Madness*, *Hard Drivin'*, *Stunt Car Racer* y *Crazy Taxi*. Para cada una: qué hacía y para qué serviría aquí. | Tabla en `reportes/` |

#### ChatGPT · Codex («astra») · fuertes
| Id | Tarea | Contrato | Entrega |
|---|---|---|---|
| **C‑M37** | **PVS de Quake para Manhattan:** por cada sector de 1 km, la lista de sectores que pueden verse, según la altura de los edificios. | Se precalcula al construir. `MC.Sectores1km` no decodifica los que no se ven. | Herramienta y prueba de memoria |
| **C‑M38** | **Sectores y portales de Build** para entrar a los edificios: cuartos como sectores y puertas como portales. | `48-interiores.js`, sin cargar otro mundo | Módulo y prueba |
| **C‑M39** | **COLORMAP de Doom:** niebla y oscuridad por distancia con tablas de paleta (32 niveles), para el estilo pixel y el 1 bit. | `16-estilos.js`. Sin mezclar colores por píxel en cada cuadro. | Módulo y prueba de ms |
| **C‑M40** | **Direccionales como guía** (*The Getaway*): en un «modo cine», el carro de uno parpadea hacia la próxima esquina de la ruta, sin flecha ni minimapa. | Luces del GLB (`op.luces`) | Escena y prueba |
| **C‑A18** (arte) | **Capas de cielo y montañas pintadas por bioma** para la vista Arcade: costa, desierto, bosque, montaña, nieve y lagos, en 3 capas de paralaje. | PNG o WebP con fondo transparente, 1024 × 256 | `arte/arcade/` |

#### Claude · motor
- Tope de modelos de tráfico por ciudad que se cambian por patrullas al subir la búsqueda (GTA III).
- La ventana del Vuelo cada vez más rápida: la ventana nueva se arma por franjas y solo se debe ver el tirón la primera vez.

### 4.0 · Pedidos nuevos (20‑nov‑2026)
> Juega primero `dist/juegos/getaway.html` (o desde la página del motor) en un celular real.
> - En la portada, «Calle libre» deja elegir ciudad.
> - En el menú ⏸ están los personajes y los artefactos.
> - `window.TURNO` expone el estado para pruebas.

> **Estado al 21‑nov‑2026 (4.3.0, Claude):**
> - **G‑H25, G‑H26, G‑H27 y G‑H28 entregadas por Antigravity.** Sus hallazgos se arreglaron en 4.3.0, incluido «mundo abierto primero» en El Metro y EnCicla.
> - **Sigue para Gemini:** medir en un celular real con la plantilla del reporte `reportes/2026-11-21-gemini-clasicos-4.1.md`.
>
> **Estado anterior (4.0.3):**
> - **Gemini:**
>   - **G‑H21, G‑H22, G‑H23 y G‑H24 entregadas y aplicadas.**
>   - **G‑H20:** se hizo la revisión en VM y se aplicaron sus arreglos; falta el celular real con GPU.
> - **Codex:**
>   - **C‑M36 hecha.**
>   - **C‑M31, C‑M32, C‑M33, C‑M34 y C‑M35:** avanzadas y unidas; lo que falta de cada una está en `CONTEXTO-RELEVO.md` § 5.
>   - Sus arreglos de EnCicla no llegaron a GitHub y hay que volver a subirlos (§ 5, fila 11).

#### Gemini · Antigravity («hydrogen») · fáciles
| Id | Tarea | Cómo | Entrega |
|---|---|---|---|
| **G‑H20** | **Turno Cero en un celular real con GPU** | Juega el Acto I completo y una persecución de nivel 5 en Medellín. Saca capturas de la cámara 3D, donde se ven los modelos GLB, y de la carretera. Anota la telemetría p95. | `reportes/AAAA-MM-DD-gemini-turno-cero.md` con 12 capturas |
| **G‑H21** | **Verifica los 19 lugares de la historia** (`TC.LUGARES` en `juegos/getaway/10-contenido.js`) | Para cada uno, revisa que:<ul><li>la calle es real;</li><li>no hay un negocio real con ese nombre;</li><li>no es un lugar sensible (memorial, hospital, colegio, iglesia).</li></ul>Propón coordenadas mejores donde haga falta. | Una tabla en el reporte |
| **G‑H22** | **Paradas de carretera** por bioma: costa, llanura, desierto, bosque, montaña, nieve y lagos | 4 por bioma: un nombre inventado y creíble (en español y, para la Ruta del Atlántico, también en inglés) y una línea de ambiente | `contenido/paradas-carretera.json` |
| **G‑H23** | **Revisión del lenguaje** | Activa «🗣️ Lenguaje: suave» y lista las groserías o expresiones del guion que se escapan del filtro | Lista en el reporte |
| **G‑H24** | **Carga y memoria por ciudad** | Mide el tiempo desde la portada hasta manejar en Manhattan, Medellín y Guatapé, y la memoria del navegador (DevTools remoto) | Tabla en el reporte |

#### ChatGPT · Codex («astra») · fuertes
| Id | Tarea | Contrato | Entrega |
|---|---|---|---|
| **C‑M31** | **El globo en WebGL y la transición continua**. Alejar hasta el globo ya funciona, con animación (4.0.1); falta la esfera WebGL dentro de la misma escena. | Al alejar la cámara más allá del mapa, el mundo se vuelve esfera sin corte. Debe tener:<ul><li>biomas de `MC.Planeta.BIOMAS`;</li><li>dispersión de Rayleigh simple;</li><li>las estrellas de `MC.Cosmos`.</li></ul>Con respaldo al lienzo actual (`Planeta.globo`). | `js/` + prueba |
| **C‑M32** | **Pasa tu escena 3D de acción** (`turno-cero-accion-3d.html`) **al motor**: a pie, cobertura tras `MC.Objetos`, guardias que patrullan y van a la última posición vista, combate no letal | Reusa `MC.Busqueda` (rivales a pie), `MC.Modelos.posar` (tus rigs ya se animan) y los conos del sigilo de `juegos/getaway/30-historia.js`, para que funcione en Manhattan, Medellín y Guatapé reales. Sin gore y sin instrucciones reales. | `js/` + paso «a pie» en Turno Cero |
| **C‑M33** | **LOD de los GLB y más actores con esqueleto** | **Ya hecho por Claude:** `MC.Modelos.posar` reproduce tus rigs (12 huesos y 8 clips) en el juego.<br>**Falta:**<ul><li>LOD1 y LOD2 de vehículos y actores;</li><li>Nadia, Noah, Cross, El Contador y transeúntes con esqueleto;</li><li>pesos suaves en codos y rodillas.</li></ul> | `arte/modelos/turno-cero/` + `js/45-glb.js` |
| **C‑M34** | **Manhattan por sectores de 1 km** (era C‑M22) | El MC4 de 10 MB por sectores alrededor del jugador, con `MC.GuardadoSectores` | Herramienta + prueba de memoria |
| **C‑M35** | **Daño por piezas en los carros GLB**: capó, puertas y llantas. **Ya hecho por Claude (4.0.1):** abolladuras por zona y faro roto (`op.dano`). Falta que las piezas se suelten, y humo y fuego en 3D. | Deformar vértices por zona según `Busqueda` y los choques. Humo y fuego en 3D. | `js/45-glb.js` |
| **C‑M36** | **Audio de persecución**: motor por capas de rpm y sirena con Doppler y oclusión aproximada. **Ya hecho por Claude (4.0.1)** en Turno Cero; falta la oclusión y pasarlo a `js/61-sonido.js` para todos los juegos. | Sin samples con derechos; Web Audio | `js/61-sonido.js` |
| **C‑A16** | **Texturas PBR de bajo polígono** para 6 vehículos y 6 personajes | UV más un atlas de 1024 px por familia, sin marcas, con la paleta de tu biblia | `arte/modelos/turno-cero/texturas/` |
| **C‑A17** | **Portada vertical de Turno Cero** (1080×1920) y **5 láminas de acto** | Sin texto (la tipografía la pone el juego): Manhattan de noche, la carretera del desierto, Medellín desde el metro, la autopista con helicóptero y el embalse al amanecer | `arte/chatgpt/turno-cero/` |

#### Claude · motor
- Une las entregas de esta tabla.
- **Lanchas de la banda en el embalse:** `MC.Busqueda` en el agua.
- **El helicóptero como GLB** (o un modelo procedural).
- **Más contratos en la Calle libre.**
- **Los eventos de la Carretera del Norte**, en el regreso a Nueva York.
- **Los juegos de los repositorios** reciben el motor 4.0 sin cambiar su forma.

---

### Gemini · Antigravity («hydrogen») · tareas fáciles
> **Entregado el 20‑nov‑2026 (G‑H1…G‑H8):**
> - `reportes/2026-11-20-gemini-*.md` (capturas, revisor de arte y pruebas);
> - `arte/referencias/` (6 láminas);
> - `contenido/datos-gemini.json` (30 datos);
> - `arte/gemini/iconos-ui.json`;
> - `arte/dominio-publico/candidatas.md` (40 obras);
> - la auditoría de los reels en `docs/INSPIRACION-VISUAL.md` §1.1.
>
> Claude corrigió lo que encontraron las capturas (botones y zona libre, aviso desfasado, ventanas en casas de un piso, cubiertas flotantes, cebras cruzadas, botón «Comprar» y burbuja de la casa) y sacó las paletas de las obras colombianas.
>
> **Lo que sigue para Gemini:**
> - **G‑H7**: los 13 enlaces y las 7 fichas que solo describe su informe;
> - **G‑H9**: la medición en un celular real;
> - **G‑H1 otra vez** sobre la 2.8, con `node motor.mjs capturas`.

Cada tarea es corta y se puede comprobar. Si algo pide más que esto, **déjalo anotado para ChatGPT** y no lo hagas.

| Id | Tarea | Cómo | Entrega |
|---|---|---|---|
| **G‑H1** | **Revisión visual con capturas** | `node motor.mjs construir` y `node motor.mjs capturas`. Saca 14 fotos de Mandados: 4 vistas × 3 horas, más la capa de valor y Mi casa. Para cada foto responde: ¿se lee el personaje? ¿algo tapa el centro? ¿los árboles están de pie en la maqueta y la lateral? ¿la noche se ve bien? ¿hay algo que se vea de caricatura o fuera de escala? | `reportes/AAAA-MM-DD-gemini-capturas.md`, con una tabla foto → hallazgo → gravedad (alta, media o baja). |
| **G‑H2** | **Revisor de arte** | `node motor.mjs revisar-arte arte/<paquete>` sobre cada paquete que llegue (empieza por `arte/gemini`, que hoy tiene 21 cuadros fuera de la imagen). | La salida pegada en un reporte y una lista de qué debe corregir quien lo hizo. |
| **G‑H3** | **Láminas de referencia** (Nano Banana) del estilo realista familiar | 6 escenas, sin texto ni logos, vistas como la maqueta 2:1:<br>1. una calle de Guatapé con zócalos de colores;<br>2. una ladera de Medellín con escaleras;<br>3. la orilla del embalse;<br>4. una noche con lluvia y charcos;<br>5. una plaza con guayacanes florecidos;<br>6. un taller de barrio. | `arte/referencias/` (PNG). Son **solo referencia** para ChatGPT y no van al juego. |
| **G‑H4** | **30 datos verificables** de Guatapé y Medellín (geografía, naturaleza, historia, movilidad) | Una frase corta cada uno, **con su fuente** (enlace). | `contenido/datos-gemini.json`: `[{ "texto", "fuente", "lugar", "tema" }]` |
| **G‑H5** | **Íconos a botones** | Elige qué ícono de `arte/gemini/iconos.json` va en cada botón de Mandados (Vista, Vehículo, Sonido, Agua, Mi casa, Ciudad, Ajustes, saltar y turbo). | `arte/gemini/iconos-ui.json`: `{ "boton": "icono" }` |
| **G‑H7** | **Verifica las referencias que faltan**: los 13 enlaces de Instagram que siguen sin verificar y las 7 fichas que solo describe tu informe (R02, R03, R04, R08, R09, R13 y R18 en `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md` §4) | Para cada uno: qué se ve, qué estilo es (cómic, manga, anime, realista…), qué da sensación de peso o de vida y qué técnica parece usar. | Una tabla en `docs/INSPIRACION-VISUAL.md` §1, una fila por reel. |
| **G‑H8** | **40 obras de dominio público** para paletas, al menos 10 colombianas (Comisión Corográfica, Epifanio Garay, Ricardo Acevedo Bernal, grabados del *Papel Periódico Ilustrado*…) | Para cada una: el enlace en Wikimedia Commons y su licencia. Solo dominio público. | Una lista en `arte/dominio-publico/candidatas.md`. Claude saca las paletas. |
| **G‑H9** | **Medición en un celular real**, con el autor | En Mandados, ⚙️ Ajustes → 📈 Telemetría. 5 minutos por vista (cenital, maqueta, lateral) y por calidad (baja, media, alta). Anota el modelo del celular, los fps, el p95 y si se calienta. | Una tabla en `reportes/AAAA-MM-DD-gemini-celular.md`. |
| **G‑H11** (2.10) | **Las 4 paletas colombianas que faltan** (Wikimedia bloqueó la descarga) | Para cada obra de `arte/dominio-publico/candidatas.md` marcada «falta», da el enlace directo a una **miniatura de 250 px** en `upload.wikimedia.org` y confirma que es de dominio público. | Los enlaces en `candidatas.md`. Claude saca las paletas. |
| **G‑H12** (2.10) | **Corre las herramientas nuevas y reporta** | `node motor.mjs publico` (anota el veredicto de cada perfil), `node motor.mjs skills` y `npx -y modern-web-guidance@latest legacy-scan js --json`. | `reportes/<fecha>-gemini-herramientas.md`, sin cambiar código. Para cada hallazgo de `legacy-scan`: archivo, línea y si aplica según su `keepWhen` y su `dropWhen`. |
| **G‑H13** (2.10; 5.3.1) | **Integra las skills en Antigravity** | Sigue `docs/PROMPT-SKILLS.md`: `node motor.mjs skills --integrar --agente antigravity` (debe terminar en «4) Verificación: ✓»). Confirma en la lista de skills de Antigravity que aparecen las 10 propias y las 4 externas. Úsalas en tus tareas. | Una línea en tu reporte, con lo que se instaló y lo que falló. |
| **G‑H14** (3.0) | **Capturas de las 3 cámaras en un celular real con GPU** (allí sí se ve el 3D) | En Mandados, prueba la cámara de juego de cerca y de lejos, la maqueta y la vista detrás del jugador, de día y de noche. Para cada una, ¿se lee el jugador? ¿Algo lo tapa? ¿Las fachadas se ven? ¿Se nota cuando carga lo lejano? | `reportes/<fecha>-gemini-camaras-3d.md` con fotos y una tabla de foto, hallazgo y gravedad, sin cambiar código. |
| **G‑H15** (3.0) | **Los colores reales de los zócalos de Guatapé** | De 10 a 15 colores de zócalos y fachadas reales, con su fuente (foto de dominio público o con licencia libre, o una fuente oficial). | `arte/dominio-publico/zocalos-guatape.json`: `[{ "hex", "dónde", "fuente" }]`. Claude los pone en `PAL_ZOCALO`. |
| **G‑H16** (3.0) | **Fluidez del 3D contra el 2D en tu celular** | ⚙️ Ajustes → 📈 Telemetría. 3 minutos con la cámara de juego (3D) y 3 con «Calidad: baja» (2D). Anota el modelo, la mediana y el percentil 95, y la densidad del lienzo. | Una tabla en tu reporte. |
| **G‑H17** (3.0) | **30 objetos del mobiliario real** de Guatapé y Medellín para los artilugios físicos: bancas, materas, bolardos, postes, rejas, motos parqueadas… | Para cada uno: tamaño aproximado en metros, material, color y si se mueve o se rompe al chocar. | `contenido/objetos-gemini.json`. Codex los convierte en tipos de `MC.Objetos`. |
| **G‑H18** (Nueva York) | **50 lugares de Manhattan** para el juego: museos, puentes, parques, garajes y miradores. | Para cada uno: nombre, latitud y longitud, tipo y una fuente. | `contenido/nueva-york-lugares.json` |
| **G‑H19** (Nueva York) | **Análisis de persecuciones** en videos de *Reckless Getaway 2*, *Pako Forever* y *#DRIVE*. | Qué hace la cámara, cuántos perseguidores hay, cómo sube la dificultad y qué premia. Una tabla por juego, con minuto y segundo. | `reportes/<fecha>-gemini-persecuciones.md` |
| **G‑H6** | **Pruebas y reporte** | `node motor.mjs prueba --navegador`, y en cada juego sus pruebas (ver su `TAREAS-IA.md`). | Un reporte con lo que pasó y lo que falló, sin corregir código. |

**No es tu rol:** cambiar el código del motor, hacer atlas grandes o arreglar fallas. Eso es de ChatGPT y de Claude.

---

### ChatGPT · Codex («astra») · tareas fuertes
> **Entregado el 20‑nov‑2026 (2.7.1, unido en la 2.9):**
> - el arte C‑A1…C‑A9 (`arte/chatgpt/`);
> - el código C‑M1, C‑M13 (la maqueta va en 22 ms; la meta de 20 sigue abierta), C‑M15, C‑M16, C‑M17, C‑M18 y C‑M19.
>
> **2.10:**
> - el cómic y el 1 bit ya no leen la pantalla (filtros del lienzo y media resolución): cenital 21 y 18 ms, maqueta 31 y 28 ms (antes 26/25 y 43/42) en Chromium sin GPU;
> - el 1 bit ya no hace muaré en la maqueta;
> - Mandados pasó de 8,2 a 5,1 MB (`herramientas/aligerar_arte.py`).
>
> **Lo que sigue, en orden (ver estado actualizado en `docs/ESTADO-3.1.0.md`):**
> 1. **C‑M13**: la maqueta por debajo de 20 ms;
> 2. **C‑M21**, **C‑M20** y **C‑M22**;
> 3. **C‑A10** y **C‑A11**;
> 4. después, C‑M2…C‑M12 y C‑M14.
>
> **Nuevos de la 3.0 (mundo único 3D):** **C‑M26**, **C‑M27**, **C‑M28**, **C‑M29**, **C‑A13** y **C‑A14**, antes que todo lo demás. La maqueta ya va por debajo de 20 ms con la densidad dinámica y la capa de suelo (C‑M13 queda hecho).
>
> **Nuevos de la 2.10, con las skills de los videos:** **C‑M23**, **C‑M24**, **C‑M25** y **C‑A12**, justo después de C‑M13.
>
> Cuando entregues un atlas nuevo, corre `python3 herramientas/aligerar_arte.py`. Así queda WebP con pérdida, calidad 88 y alfa sin pérdida.

**Primero el arte** (lo genera ChatGPT) y **después el código** (lo hace Codex). Detalle y reglas en el documento único, §10.

#### Arte (imágenes de ChatGPT), en orden
**Reglas comunes:**
- 32 px por metro;
- que la figura **llene su cuadro**;
- ancla en los pies o la base;
- **2 px de margen** entre cuadros;
- fondo transparente o magenta #ff00ff;
- **sin sombra horneada**: la pone el motor según el sol;
- luz de arriba a la izquierda;
- sin texto, logos ni marcas.

Cada atlas va con su `manifiesto.json` y pasa `node motor.mjs revisar-arte` sin problemas graves.

| Id | Encargo | Para qué gancho |
|---|---|---|
| **C‑A1** | **Ancla de estilo realista familiar**: una cuadra de Guatapé en maqueta 2:1, de día y de noche con lluvia. Es la referencia de todo lo demás. | — |
| **C‑A2** | **Personaje a escala**: 10 estados × 4 cuadros de perfil (quieto, camina, corre, pedalea, impulsa, patina, sentado, salta, nada, bucea) y desde arriba en 4 direcciones. 6 personas distintas (piel, pelo, ropa de diario y de trabajo, casco de ciclista). 1,70 m = 54 px. | `personajeLado`, `personajeArriba` |
| **C‑A3** | **Vehículos a escala**: los 35 de `MC.Vehiculos` más la moto y el carro de mandados, de perfil y desde arriba, con un poco de uso (polvo, rayones). Buseta, chiva, taxi y bus colombianos, sin marcas. Ruedas aparte. | `vehiculoLado` |
| **C‑A4** | **Árboles realistas**: guayacán amarillo y rosado (florecidos), ceiba, mango, urapán y árbol de monte, más palma de cera y de coco. 3 variantes de cada uno, de lado (128 px de alto) y desde arriba (128 px). Nombres: `arbol_<especie>_lado`, `arbol_<especie>_arriba`, `_v1`, `_v2`. | `arbol` (nuevo) |
| **C‑A5** | **Texturas de suelo sin costuras** (128 × 128 px = 4 m): asfalto gastado, asfalto parcheado, andén de baldosa, adoquín, pasto, tierra con barro, grava, teja de barro, plancha de concreto y zinc oxidado. | `textura` (lo hace C‑M16) |
| **C‑A6** | **Módulos de fachada con desgaste**: 6 zonas × 6 tipos × 3 variantes, de día y de noche (reemplaza G‑M12). | `fachadaModulo` |
| **C‑A7** | **Animales a escala**: perro criollo, gato, gallinazo, caballo, vaca, iguana, zarigüeya y ardilla. | `animalLado` |
| **C‑A8** | **Láminas guía de los estilos 2.7**: la misma cuadra de Guatapé en cómic (*Spider‑Verse* y Lichtenstein), manga (tramado y líneas), anime (Shinkai y Ghibli), novela gráfica (noir con un rojo), ukiyo-e (Hokusai) y acuarela (Comisión Corográfica). Solo la técnica, nunca personajes ni marcas. | guía de `MC.Estilo` |
| **C‑A10** | **Tipografía propia** (R25) para letreros, placas, grafitis y menús: una fuente a partir de letra a mano, con 3 variantes por letra, libre para usar. | interfaz y letreros |
| **C‑A11** | **Interfaz de libreta** (R23): el mapa de mandados, la lista de misiones y los botones como una libreta dibujada, con *squash and stretch* al tocar. | `MC.UI` (tema) |
| **C‑A12** (2.10) | **Tráiler de Mandados con HyperFrames** (skill `hyperframes`): 30 s en vertical 9:16 y en horizontal 16:9:<ul><li>con capturas reales (`node motor.mjs capturas`) de las vistas y de los estilos (realista, cómic, 1 bit, acuarela);</li><li>con subtítulos en español y música libre de derechos;</li><li>sin cifras ni frases inventadas.</li></ul> | `videos/` (MP4 de menos de 15 MB) y el HTML de la composición |
| **C‑A13** (3.0) | **Láminas de fachadas de Guatapé por módulos**: ventana, puerta, balcón, zócalo y cornisa, en 6 combinaciones de color reales (frente, lado y detalle). Son la guía para el atlas de fachadas del mundo 3D. | `edificio3d` (C‑M28) |
| **C‑A14** (3.0) | **Vehículos colombianos low-poly en vistas ortográficas** (frente, lado y arriba, con medidas): buseta, chiva, taxi, moto con parrillero, camión de estacas y bici EnCicla. Codex los modela en código a partir de las láminas. | `carro3d` |
| **C‑A15** (Nueva York) | **Arte de Nueva York**, todo público: taxi amarillo, patrulla, carros de «la mafia» (sedanes negros de los 70), módulos de fachada de *brownstone* con escalera de incendios, rascacielos (3 estilos), puentes, el muelle y el *skyline* para los impostores. Sin marcas ni logos. | `carro3d`, `edificio3d` e impostores |
| **C‑A9** | **El personaje en *cel***, con contorno y 3 tonos, para los estilos dibujados: los mismos estados que C‑A2. | `personajeLado` en los estilos `comic`, `manga` y `anime` |

#### Código (Codex), en orden
| Id | Encargo |
|---|---|
| **C‑M13** | **Maqueta por debajo de 20 ms** con la CPU 4× más lenta, con todo el detalle 2.6: árboles de pie, desgaste y fachadas. Hoy da 30–38 ms aquí y 44,7 ms en la máquina de Codex. |
| **C‑M23** (2.10) | **La red vial de Guatapé:**<ul><li>123 de sus 385 nodos son puntas sueltas;</li><li>tiene 5 componentes;</li><li>las rutas dan rodeos de 4× en el percentil 90.</li></ul>Revisa `geo/territorio.py` y `Red` (`une`, `_partir`): que se unan los cruces y las puntas que casi tocan, sin crear calles falsas. | La prueba «rutas por la calle» con el percentil 90 por debajo de 2,5× y `node motor.mjs publico` sin perfiles atascados por el mapa. |
| **C‑M24** (2.10) | **Ayuda de manejo para niños**: el público simulado marca que Sofía (8 años) pasa el 43 % del tiempo atascada. Agrega en ⚙️ Ajustes una ayuda opcional:<ul><li>imán a la calle;</li><li>frenado antes de chocar;</li><li>giro suave al rozar un muro.</li></ul>Va encendida por defecto en el ritmo «tranquilo». | `node motor.mjs publico --perfiles nina` con atascado por debajo del 25 %, y su prueba. |
| **C‑M25** (2.10) | **La portada web de Motor City con Hallmark** (`/hallmark`): el `index.html` de GitHub Pages que lleva a Mandados y a los juegos.<ul><li>En español, con capturas reales.</li><li>Sin cifras, testimonios ni logos inventados.</li><li>`sloplint --render` limpio y el piso de Hallmark completo: tokens, `:focus-visible` y `prefers-reduced-motion`.</li></ul> | `index.html` y su reporte de `sloplint` |
| **C‑M26** (3.0) | **Persecución jugable**, como Reckless Getaway: policía o rivales con `MC.IA` que cortan el paso y frenan delante. La cámara ya tiene `camara.persecucion` (0 a 1); súmale casi choques que dan turbo y un leve *hitstop*. | Un modo en Mandados («¡Te persiguen!») con su prueba. |
| **C‑M27** (3.0) | **Luz del mundo 3D:** sombras de los edificios y los árboles con *shadow map* en WebGL 1 (si no se puede, sombras proyectadas en el suelo), y desenfoque de maqueta (*tilt-shift*) con la profundidad, como HD‑2D. Debe mantener 60 cuadros por segundo en un celular medio. | `js/45-gl.js` con su prueba. |
| **C‑M28** (3.0) | **Atlas de fachadas con UV** para `edificio3d`, a partir de las láminas C‑A13 y del arte de ChatGPT, más **impostores lejanos** (siluetas de cerros y torres) para la vista detrás del jugador. Se hornean de lado con la Arboleda y los edificios. | `js/45-gl3d.js` |
| **C‑M29** (3.0) | **Más física:** rampas y saltos con cámara lenta al aterrizar, destrucción ligera (vallas, conos y postes que se doblan), objetos movidos que se guardan por sector (`MC.GuardadoSectores`) y los 30 objetos de G‑H17. | `js/32-objetos.js` con su prueba. |
| **C‑M30** (Nueva York) | **Craquear Manhattan:** `geo/territorio.py --id nueva_york --bbox=-74.03,40.68,-73.90,40.88`, partido en **sectores de 1 km** que se cargan alrededor del jugador (MC4 por sectores), con su prueba de memoria en un celular medio. | `datos/nueva_york/` y `ciudades/nueva_york.json` |
| **C‑M31** (Nueva York) | **Mundo redondo:** curvatura en el sombreador (d²/2R) y vista de planeta con atmósfera (dispersión de Rayleigh simple) y estrellas al alejarse del mapa. | `js/45-gl.js` |
| **C‑M16** | **Gancho `textura`** en las losas: las texturas de C‑A5 como patrones en metros, con respaldo procedural (`Rudeza`), y su prueba. |
| **C‑M17** | **Lluvia y atmósfera que se ven** (R02, R03 y R09): asfalto mojado más oscuro, charcos con reflejo y salpicaduras, y niebla de distancia en la maqueta y la lateral, sin pasar de 2 ms por cuadro. |
| **C‑M1** | **Auditoría de lo nuevo**: `js/16-estilos.js`, `js/29-arboleda.js`, `Rudeza` en `js/40-dibujo.js`, `js/87-pieles.js`, `js/88-vida.js` y `js/89-exportar.js`. Una tabla con archivo:línea, severidad, escenario y *diff*. |
| **C‑M18** | **Motores potentes**: abrir `node motor.mjs exportar guatape` en **Godot 4** (y, si se puede, Unity y Unreal); un proyecto mínimo que lea `escena.json` y ponga los árboles con `MultiMeshInstance3D`; y una vista de Motor City con **three.js o WebGPU** registrada en `MC.Vistas` (`docs/MOTORES-POTENTES.md`). |
| **C‑M20** | **API de construcción por código y pincel de mundo** (R18 *VoxPix* y R10 *Town Brush*): `city.calle(puntos, op)`, `city.edificio(x, y, ancho, fondo, alto, op)`, `city.arbol(x, y, especie)`, `city.luz(x, y)` y un mundo que se arma desde `escena.json`, validado con `schemas/escena.schema.json` (`MC.Contratos.validar`). Con eso, una IA construye barrios enteros por código. |
| **C‑M21** | **Peso del cuerpo y del vehículo** (R06, R07, R09, R11–R13, R20 y R21): suspensión por rueda con rayos, balanceo de la carrocería, cosas que se rompen (conos, vallas), IK de pies en escalones, animaciones cotidianas (abrir puertas, reparar, sentarse), tablero en primera persona con limpiaparabrisas, taller con rayos X y gráficas de suspensión y agarre en la telemetría. Sin pasar de 2 ms por cuadro, y la física igual en cualquier calidad gráfica. |
| **C‑M22** | **Guardado y mundo por sectores** (entrega §11 y §12.3): `MC.Guardado`, con `schema_version`, IDs estables y migradores; sectores activos y dormidos que recuerdan los cambios (huellas, objetos rotos, grafitis) al volver. |
| **C‑M19** | **Estilo de 1 bit con trama estable**, como *Return of the Obra Dinn*: umbral contra una trama de ruido azul que no tiemble al mover la cámara. Y semitono por luminancia en la sombra del cómic. |
| **C‑M15** | **Terreno**: la capa `agua` precalculada en el MC4, y el carro que se inclina y patina en barro y nieve. |
| **C‑M9, C‑M12, C‑M10, C‑M14, C‑M11** | Tráfico con propósito, sombras sobre muros, casa con A* y dos habitantes, distritos y políticas, y pueblo orgánico (§10.2). |
| **C‑M2 a C‑M8** | Redes precalculadas, raster, direcciones, storylets, accesibilidad y pruebas que faltan (§10.2). |

**Cómo entregas:**
- **El arte:** en `arte/chatgpt/`, con el mismo formato de `arte/gemini/` (atlas `.webp` o `.png` más `manifiesto.json`).
- **El código:** commits en la rama `claude/motor-city-engine-xu7p4y`, con `node motor.mjs prueba --navegador` en verde y cada mejora con su prueba.
- **El resumen:** `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`.

---

### Las IAs de los juegos
Cada juego **debería** tener su propio `TAREAS-IA.md` en la raíz: la auditoría de las ramas `main` no los encontró, por lo que es trabajo de integración pendiente:
- **Juega EnCicla** (`BicicletasUno`): migrar a `motor-city/` y el estilo 2.6.
- **El Metro** (`MetroZero`): su protocolo de 7 pasos y la migración.
- **Run Scooter** (`RunRunZero`): sigue independiente.

### Claude · la IA del motor
- **4.0:**
  - el planeta (`MC.Planeta`);
  - la búsqueda 0–5 (`MC.Busqueda`);
  - el lector GLB (`MC.Modelos`);
  - los juegos con varios mundos;
  - *Turno Cero* (`juegos/getaway/`), con el canon de Codex llevado a Manhattan, Medellín y Guatapé.
- **3.0:** mundo único 3D con cámaras aéreas, fachadas, árboles low-poly, artilugios físicos, mapa grande y la investigación de cámara.
- **2.10:**
  - unió las ramas viejas de los juegos;
  - instaló las skills de los videos;
  - quitó el leer la pantalla en el cómic y el 1 bit;
  - aligeró los atlas;
  - arregló `rutaA`;
  - creó el público simulado.
- Une las entregas (arte de ChatGPT en `MC.Pieles` y código de Codex).
- Mantiene `docs/PEDIDOS.md`.
- Sigue con *Motor City* (carreras) y *Extremo* (§9.7).

---
### Consolidación de la rama 3.1.0 (20-nov-2026)
La PR #5 contiene C-M26 (persecución jugable y E2E verificado), C-M25 (portada editorial), C-M27 (sombras solares proyectadas, parcial), C-M29/G-H17 (física y guardado parcial), G-H1 (14 capturas inspeccionadas), G-H18 (50 lugares oficiales de Manhattan), G-H19 (investigación documental parcial) y guías de arte. Consultar [`docs/ESTADO-3.1.0.md`](docs/ESTADO-3.1.0.md) antes de asumir que una tarea está cerrada. **C-A14, C-M28, tilt-shift y pruebas móviles físicas continúan pendientes.**

### 20-nov-2026 · C-A15 / G-H19 ampliada · Manhattan adulto
- **Publicado en PR #5:** `docs/REFERENCIAS-MANHATTAN-13.md` (13 fichas Google Play), `docs/GETAWAY-MANHATTAN-BIBLIA.md` (7 misiones adultas y tres finales), `juegos/getaway/preproduccion/*.json` para agentes, `juegos/getaway/prototipo.html` como mini juego offline esquemático, y dos `arte/chatgpt/guias/manhattan-*.svg` con fuentes vectoriales originales. Estas entregas **no contienen mapa MC4 real**.
- **C-A15:** dirección artística conceptual y wireframe listos como documentos, no atlas UV ni captura de gameplay.
- **G-H19:** investigación documental ampliada de 3 a 13 fichas, sin cronometrajes de vídeos no observados.
- **Siguiente IA:** antes de iniciar 3D, auditar licencias del GIS, cobertura de la isla y conectividad de puentes, carga por 1 km y transición de prototipo a MC4.


#### Avance comprobable «Turno Cero» v0.3.0 (20-nov-2026)
ChatGPT entregó una vertical slice 3D original en `juegos/getaway/turno-cero-accion-3d.html`, pruebas E2E `pruebas/getaway-3d.mjs` y tres GLB de personajes con 12 huesos y 8 clips cada uno. Tiene controles PC/táctil, combate ficticio, dron, visor, señuelos, persecución y una misión completa en **distrito ficticio de prueba**. Ver `docs/GETAWAY-AVANCE-V03.md`. Pendiente GIS Manhattan real, conexión de las APIs MC4, materiales PBR finales y reproducción de rig glTF en runtime.


---

# ANEXO 0d. Cámara, mundo único y jugabilidad (investigación 3.0) (`docs/INVESTIGACION-CAMARA.md`)


> Pedido del autor: «las dimensiones están mal ideadas; hay cosas que se quedan en 2D cuando deberían estar en 3D; el mundo en cenital, maqueta y 3D debe ser el mismo; investiga la cámara de #DRIVE, Pako Forever, Getaway y Reckless Getaway 2; ni tan cerca ni tan lejos, con tope; un radio de vista; carga por zonas que no se note (la niebla de GTA San Andreas); fachadas; artilugios físicos».

### 1. Lo que enseñan las referencias (ingeniería inversa)
Sobre las cámaras de esos juegos se publica poco. Lo que sigue sale de lo que se ve al jugarlos y de lo que sí está documentado; donde algo no está confirmado, se dice.

| Referencia | Qué se ve | Qué se tomó |
|---|---|---|
| **#DRIVE** (Pixel Perfect Dude) | Mundo 3D low-poly; cámara alta que va **detrás y arriba** del carro, mirando adelante; el carro abajo de la pantalla para ver lo que viene. | El mundo 3D low-poly con luz plana por cara; la **mirada adelante** según la velocidad. |
| **Pako Forever** / **Getaway** | Vista **isométrica fija** sobre una ciudad 3D low-poly; la cámara no gira con el carro, solo lo sigue; persecuciones con policía. | La **maqueta** como cámara 3D casi ortográfica (campo visual estrecho, giro de a 90°); la cámara aérea **no gira** con el rumbo, lo que da control estable. |
| **Reckless Getaway 2** (Pixelbite) | La vista es elevada y en 3D, según las fichas de las tiendas. No se encontró una descripción técnica de la cámara: **sin confirmar**. Lo que el autor describe, una cámara frenética en las persecuciones, coincide con alejarse, inclinarse y sacudirse con los golpes. | El **modo persecución** (`camara.persecucion`, 0 a 1): se aleja un 22 %, se inclina hacia adelante y se mece de lado. Además, el **trauma²**, que sacude con cada golpe. |
| **GTA San Andreas** | Poca distancia de dibujo, **modelos de bajo detalle (LOD)** a lo lejos y **niebla** ajustada por hora y clima para que no se vea lo que se carga; el mundo se carga por sectores. Los detalles internos solo están en fuentes de *modding*, no oficiales. | **Radio de vista** definido por la cámara y **niebla justo antes del borde**. Las regiones de 160 m se cargan por cercanía con un presupuesto de milisegundos (ya estaba) y bajan de detalle con la distancia. |
| **HD‑2D** (*Octopath Traveler*) | Sprites 2D como hojas de papel dentro de un mundo **todo 3D**, con desenfoque por profundidad (efecto maqueta), luz puntual y bruma. | El **híbrido**: el suelo es la losa 2D (vías, andenes, pasto con su desgaste) puesta sobre el relieve 3D, y todo lo que se levanta es volumen. El desenfoque por profundidad queda como encargo (necesita el búfer de profundidad). |
| **Diseño de cámaras** (zona muerta, mirada adelante, *Cinemachine*) | Zona muerta para que lo pequeño no mueva la cámara; la mirada adelante se congela al frenar; nunca saltar sin suavizado. | Ya estaba: resortes críticamente amortiguados, zona muerta y mirada adelante. Ahora también en las cámaras aéreas 3D. |

### 2. Lo que quedó en el motor (3.0)
1. **Un solo mundo 3D, varias cámaras** (`js/45-gl3d.js`, `MC.Camara` perfiles `cenital`, `oblicua` y `maqueta`):
   - la cenital, la ciudad y la maqueta son cámaras sobre el mismo mundo 3D;
   - sin GPU usan su **respaldo 2D**, que es el mismo mundo con el mismo encuadre.
2. **Encuadre igual en 2D y en 3D:** la distancia de la cámara aérea sale del zoom en px por metro y del alto del lienzo, así que cambiar de cámara no salta.
3. **Inclinación según el zoom:** de lejos la cámara queda más cenital y de cerca más oblicua (se ven las fachadas).
4. **Topes de zoom:** de 2,6 a 22 px por metro en Mandados.
5. **Cámara continua:** pellizcar hasta el tope de cerca pasa a la vista detrás del jugador, y alejarse desde ahí vuelve a la cenital.
6. **Mapa grande:** para ver todo está el mapa (se toca el minimapa), no alejar el mundo vivo.
7. **Radio de vista y niebla:** las cámaras aéreas cargan solo hasta 2,3 veces su distancia, con niebla entre 1,55 y 2,25 veces. Lo que se carga no se ve llegar.
8. **Fachadas:**
   - zócalo de color (en Guatapé);
   - ventanas con marco y vidrio, algunas encendidas de noche;
   - puerta en el muro más largo;
   - balcones con baranda y cornisa;
   - techo con alero, o plancha con pretil y tanque negro.
9. **Detalle por distancia (LOD):** las fachadas solo cerca; lejos, el prisma.
10. **Árboles low-poly:** los **mismos** de las vistas 2D (`MC.Arboleda`), por especie: guayacanes florecidos, ceiba ancha, mango denso y monte cónico.
11. **Vehículos y gente:** carros con cabina, vidrio, ruedas y luces; busetas con franja de ventanas; motos y bicis; personas con cabeza y pelo.
12. **Rayos X del jugador:** si un árbol o un techo lo tapan, se ve igual.
13. **Artilugios físicos** (`MC.Objetos`):
    - conos, balones, canecas, cajas y vallas;
    - impulso según la masa de quien choca;
    - saltan, caen, ruedan con roce, chocan con los muros y se duermen quietos;
    - se ven en todas las cámaras, y en Mandados ya están sembrados.
14. **Jerarquía clara:** una sola **cámara de juego** y la de detrás del jugador. Lo demás (otras vistas, pixel, filtros de estilo y arte) va en «Más vistas y filtros».

### 3. Mecánicas y jugabilidades recopiladas para lo que sigue
| Idea | De dónde | Cómo encaja |
|---|---|---|
| Persecución con policía o rivales que **estrechan** el camino | Reckless Getaway, Pako, #DRIVE | `MC.IA` con pilotos que cortan el paso; la cámara ya tiene `persecucion`. |
| **Casi choques** que dan puntos o turbo | #DRIVE (pasar rozando) | Distancia mínima al tráfico por cuadro; premio y un leve *hitstop*. |
| **Destrucción ligera** del mobiliario | Reckless Getaway (vallas, postes) | `MC.Objetos` ya tiene vallas, conos y canecas. Faltan postes, bolardos y rejas de los datos del mapa. |
| **Saltos con rampa** y cámara lenta al aterrizar | GTA, Burnout | El cuerpo ya tiene `z` y el evento `aterriza`. Falta la rampa como objeto y el *slow-mo* ya existente en `MC._pausaImpacto`. |
| **Carga por sectores con guardado** | GTA, C‑M22 de Codex | `MC.GuardadoSectores` (2.9.1) más las regiones de `VistaGL`: los objetos movidos se guardan por sector. |
| **Siluetas lejanas** (*impostores*) | GTA San Andreas (LOD) | Edificios lejanos como cajas sin fachada (ya está); faltan las siluetas de cerros y torres en el horizonte de la vista detrás del jugador. |
| **Desenfoque de maqueta** (*tilt-shift*) | HD‑2D | Un pase con profundidad en WebGL; encargo para Codex. |

### Fuentes
- [HD‑2D (Wikipedia)](https://en.wikipedia.org/wiki/HD-2D) y [Octopath Traveler II, entrevista de Unreal Engine](https://www.unrealengine.com/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style)
- [#DRIVE en App Store](https://apps.apple.com/us/app/drive/id1366180154?l=pt-BR) y [TouchArcade](https://toucharcade.com/games/drive)
- [Reckless Getaway 2 en App Store](https://apps.apple.com/us/app/id1190553787), [reseña de Reckless Getaway (Pocket Gamer)](https://www.pocketgamer.com/reckless-getaway/review-4216/) y [Malavida](https://malavida.com/en/soft/reckless-getaway-2/iphone)
- GTA San Andreas, de la comunidad y no oficial: [Project2DFX](https://libertycity.net/files/gta-san-andreas/140501-project2dfx-v4.3.html), [guía de modding](https://gtacommunitydocs.vercel.app/docs/san-andreas-modding-guide/graphics/) y [MTA: distancias LOD](https://wiki.multitheftauto.com/wiki/EngineSetModelLODDistance?oldid=82240)
- Cámaras: [Cinemachine, guía de seguimiento](https://uhiyama-lab.com/en/notes/unity/unity-cinemachine-camera-guide/), [How to Make a Good 2D Camera (GMTK)](https://gmtk.substack.com/p/how-to-make-a-good-2d-camera) y [cámara de un juego de carreras visto desde arriba (Game Developer)](https://gamedeveloper.com/game-platforms/let-s-talk-about-top-down-view-camera-system-for-a-racing-game)


---

# ANEXO 0e. Lo que sigue: Getaway Nueva York y las reglas del feedback (`docs/PROXIMO-NUEVA-YORK.md`)


> **Actualización de alcance (20-nov-2026, posterior al pedido original):** el autor cambió explícitamente el concepto de **todo público** a **thriller criminal para adultos**. Esta página conserva el plan geográfico histórico, pero el contrato vigente de historia y arte es `docs/GETAWAY-MANHATTAN-BIBLIA.md`, y el juego de trabajo se llama provisionalmente **TURNO CERO: MANHATTAN**. No copiar un juego comercial ni representar como exacta una cuadrícula inventada. Se agregó un prototipo independiente en `juegos/getaway/prototipo.html`, que **no usa Manhattan MC4**.

> **Pedido del autor (20‑nov‑2026)**, para después de las mejoras de Gemini y ChatGPT:
> - craquear Nueva York, en especial Manhattan;
> - alrededor, llanuras, montañas, lagos, playas y todos los tipos de terreno, para exprimir el motor;
> - un juego como *Getaway*: persecuciones en carro con una trama breve de mafia, que funcione en grande;
> - todo en un mundo que se pueda ver redondo, con la atmósfera y el espacio.
>
> Este documento lo deja listo. **Nadie empieza el juego antes de cerrar los encargos 3.0** (`TAREAS-IA.md`).

### 1. El mundo
| Parte | Cómo | Quién |
|---|---|---|
| **Manhattan real** | `python3 geo/territorio.py --id nueva_york --bbox=-74.03,40.68,-73.90,40.88`, de Overture/OSM más el relieve SRTM. Se cuentan unos 45.000 edificios con su altura, la cuadrícula, Central Park, los muelles y los puentes de Brooklyn, Manhattan, Williamsburg y Queensboro. La atribución es ODbL. | Codex (C‑M30) |
| **El resto del mundo** | `MC.Generador` alrededor de la isla, a escala real. Hay llanuras con pueblos, montañas con nieve, lagos, playas con mar, desierto y bosque, con las carreteras que los unen. | Claude |
| **Carga por sectores** | El MC4 de Manhattan no puede ir entero en memoria en un celular. Hay que partirlo en sectores de 1 km que se cargan alrededor del jugador, con la niebla y el radio de vista de la 3.0, y guardar los cambios con `MC.GuardadoSectores`. | Claude, y Codex (C‑M22) |
| **Rascacielos que se ven a lo lejos** | Impostores (siluetas horneadas) para lo que está a más de 600 m, como el LOD de GTA San Andreas. En el borde, la niebla. | Codex (C‑M28) |
| **Mundo redondo, atmósfera y espacio** | Se hace en tres pasos:<ol><li>**Curvatura en el sombreador:** la altura baja con d²/2R, así que el horizonte se curva al subir.</li><li>**Vista de planeta:** al alejarse más allá del mapa, el mundo pasa a ser una esfera con la textura de `losasLejos`, con un halo de atmósfera (dispersión de Rayleigh simple) y estrellas.</li><li>**El espacio:** con `MC.Cosmos` (ya existe) pone el Sol y la Luna en su lugar y las estrellas de la hora.</li></ol> | Claude (C‑M31 para el sombreador de atmósfera, si Codex llega antes) |

### 2. Concepto histórico para todo público (SUPERADO por la versión adulta)
- **Trama breve, cinco capítulos:**
  - un conductor novato hereda el taxi de su tío y descubre que una familia de «la mafia» le debe al barrio;
  - escapes, rescates de mercancía robada (cuadros de un museo) y una última persecución por el puente de Brooklyn.
  - Sin sangre ni armas a la vista: los «golpes» son choques de carros y la policía persigue, como en Reckless Getaway.
- **Persecución:**
  - nivel de búsqueda de 1 a 5;
  - pilotos de `MC.IA` que cortan el paso;
  - casi choques que dan turbo;
  - daño del carro (`MC.Desgaste`);
  - rampas y destrucción ligera (`MC.Objetos`);
  - escondites (garajes) para perderlos.
  La cámara ya tiene `camara.persecucion`: se aleja, se inclina y se mece.
- **Cámaras:** la cámara de juego (cenital 3D, que se inclina al acercarse), la de detrás del carro y la maqueta para las repeticiones. El mapa grande sirve para planear la ruta.
- **Mapa:** las calles reales con su nombre, las avenidas con semáforos, el tráfico denso de Midtown y los taxis amarillos.

### 3. Lo que aprendió el motor del feedback del autor (reglas para TODAS las IA)
1. **Un solo mundo, varias cámaras.** Nunca se hace un contenido distinto para 2D y otro para 3D: el 2D es el respaldo del mismo mundo.
2. **Lo que se levanta es volumen:** árboles, casas, carros y gente. El suelo puede ser losa 2D, sin nada pintado encima que también exista en 3D.
3. **Fachadas con detalle:** zócalo, ventanas, puerta, balcones y techo, con detalle por distancia.
4. **Cámara:**
   - ni tan cerca ni tan lejos, con topes;
   - para ver todo, el mapa, no alejar el mundo vivo;
   - una cámara continua, no un menú de vistas.
5. **Jerarquía:** lo principal a la vista. Las demás vistas y los filtros de estilo van en un submenú.
6. **Periferia definida:** cada cámara carga solo su radio, con niebla en el borde, y la carga no se nota.
7. **Tutoriales opcionales:** un botón, nunca una ventana que salga sola.
8. **Fluidez antes que peso:** medir el tiempo real entre cuadros (lo que cuesta pintar no lo ve el reloj de JS) y bajar la densidad solo si sirve.
9. **Probar en un celular real con GPU**, no solo en el navegador de pruebas sin GPU.
10. **Física con peso:** el que choca empuja según su masa; nada atraviesa nada.

### 4. Orden de trabajo
1. Cerrar los encargos 3.0: G‑H14…G‑H17, C‑M26…C‑M29, C‑A13 y C‑A14.
2. Gemini: G‑H18 y G‑H19. ChatGPT: C‑A15. Codex: C‑M30. Claude: los sectores, el mundo de alrededor y el planeta.
3. Claude arma el juego «Getaway Nueva York» (`juegos/getaway/`), con sus pruebas y el público simulado (`node motor.mjs publico`).
4. Se prueba en grande con un celular medio y uno alto: la telemetría de Gemini y el público simulado.


---

# ANEXO 0c. Skills y plugins externos (Hallmark, Modern Web Guidance, find-skills, HyperFrames) y público simulado (`.claude/skills/motor-city-skills-externas/SKILL.md`)

---
name: motor-city-skills-externas
description: Cuándo y cómo usar en Motor City las skills y plugins de terceros que pidió el autor (Hallmark para páginas web, Modern Web Guidance para HTML/CSS/JS moderno, find-skills para buscar skills, HyperFrames para videos de lanzamiento) y el público simulado (MC.Publico, idea de MiroFish). Úsala antes de hacer una página web de un juego, un tráiler, al escribir código del navegador o al buscar una skill nueva.
---

## Skills externas en Motor City

El catálogo está en `skills-externas.json` (repositorio, commit revisado, licencia, para qué sí y para qué no). `node motor.mjs skills` muestra todo: las propias, las externas y los plugins (`--json` para otras herramientas).

### Integrarlas (5.3.1: un solo comando)
- **Cualquier IA con terminal**, desde la raíz del repositorio: `node motor.mjs skills --integrar --agente <tu-agente>`.
  - `<tu-agente>` es `claude-code`, `codex`, `antigravity`, `gemini-cli` o `cursor`.
  - En un juego hermano se usa la copia del motor: `node motor-city/motor.mjs skills --integrar …`.
- **Qué hace:**
  1. deja las propias iguales en `.claude/skills/` (Claude Code) y en `.agents/skills/` (Codex, Antigravity, Gemini CLI y Cursor);
  2. completa el `.gitignore`;
  3. instala las 4 externas con el instalador oficial (`npx skills add`) y su commit revisado, en el repositorio donde se corre;
  4. lo verifica.
- **Claude Code** también las recibe como plugins por `.claude/settings.json`, que se aceptan al abrir el proyecto. En una sesión en la nube no se ofrecen: ahí se usa `--agente claude-code`.
- **Las externas no se suben** (están en `.gitignore`).
  - Necesitan internet y Node 22, y se instalan **en la máquina de la IA**.
  - Nunca van dentro del HTML de un juego.
- **Una skill propia** se edita en `.claude/skills/<nombre>/` y se copia con `node motor.mjs skills --sincronizar`. La QA corre `node motor.mjs skills --verificar`.
- **El prompt para pasárselo a otra IA:** `docs/PROMPT-SKILLS.md`.

### Las skills propias del proyecto que salieron de los mismos videos (entrega de Gemini 2.9.1)
Úsalas primero, porque no necesitan instalar nada:
- `motor-city-web-moderna`: Baseline y Modern Web Guidance;
- `motor-city-diseno-ui`: el piso anti-clichés de Hallmark para el HUD y las portadas;
- `motor-city-qa-playwright`: pruebas táctiles en 412 × 860;
- `motor-city-revision-ia`: revisión de cambios hechos por IA, procedencia de los plugins y la simulación como hipótesis.

El catálogo completo, con la trazabilidad de los enlaces, está en `docs/SKILLS-Y-PLUGINS.md`.

### Cuál usar
| Tarea | Skill | Regla de Motor City encima |
|---|---|---|
| Portada web de un juego, prensa o landing (GitHub Pages) | **Hallmark** (`/hallmark`, `/hallmark audit <archivo>`) | Español de Colombia y todo público. Nada inventado: ni cifras, ni testimonios, ni logos. Las capturas son reales (`node motor.mjs capturas`). |
| Cualquier HTML, CSS o JS del navegador (menús, diálogos, accesibilidad, rendimiento) | **Modern Web Guidance** (`npx -y modern-web-guidance@latest search "…"`, `retrieve`, `legacy-scan`) | La **política de navegadores** de abajo. Un solo HTML, sin librerías. |
| Tráiler o video de lanzamiento | **HyperFrames** | Se hace con capturas reales del juego. El video es aparte; el juego no cambia. |
| «¿Hay una skill para…?» | **find-skills** (`npx skills find …`) | Solo de fuentes conocidas y con más de 1.000 instalaciones. Se revisa y se anota en `skills-externas.json` antes de usarla. |
| Probar con gente antes de publicar | **MC.Publico** (`node motor.mjs publico`) | Es una prueba de humo, no reemplaza a la gente de verdad. Mira el informe `dist/publico.md`. |
| Probar la web en un navegador | `webapp-testing` (Playwright) | Ya está en las pruebas: `node motor.mjs prueba --navegador`. |

### Política de navegadores (pedida por Modern Web Guidance)
- **Baseline ampliamente disponible.** Eso incluye ES2023: `toSorted`, `toReversed`, `structuredClone` y `replaceChildren`.
- **Lo más nuevo** (Baseline 2024 en adelante, `Promise.withResolvers`, `ctx.filter` en Safari menor a 18…) solo con detección y un respaldo de **20 líneas o menos, sin dependencias**. Ejemplo: el respaldo de `js/00-nucleo.js` y `Estilo._filtros()` en `js/16-estilos.js`.
- Celulares de referencia:
  - Android 7 con WebView 119 o más;
  - iPhone 8 o X con iOS 16 (Safari 16).
- El guardado se copia con JSON a propósito: así cada valor por defecto es serializable igual que un guardado. No lo cambies por `structuredClone`.

### Lo que no se usa
- **MiroFish** (AGPL, aplicación aparte con servidor y llaves). Solo se tomó la idea: `MC.Publico`.
- Material filtrado de terceros, por ejemplo «system prompts» filtrados. No se copia ni se usa.
- Una skill que no esté en el catálogo. Primero se revisa (lee su SKILL.md y sus scripts) y se anota.

### Reglas aprendidas
- `legacy-scan` revisa solo ~20 % de las guías. Verifica cada hallazgo con su `keepWhen` y su `dropWhen` antes de cambiar código.
- La salida de Hallmark se revisa con `sloplint`. En Motor City aplica a páginas web, no al lienzo del juego.
- **5.3.1 · El instalador** (`npx skills add`, probado el 23-nov-2026) se comporta así:
  - con Codex, Antigravity, Gemini CLI o Cursor deja la carpeta en `.agents/skills/<id>` y, si también va Claude Code, un **enlace** en `.claude/skills/<id>`;
  - con Claude Code solo, deja una copia en `.claude/skills/<id>`;
  - siempre escribe `skills-lock.json`.
- **En `.gitignore`, `carpeta/` no ignora un enlace.** Por eso las entradas de las externas van sin barra final. Con la barra, `git add -A` subía los 4 enlaces rotos.
- **En un juego hermano, el destino es la raíz git de donde se corre.** Antes se instalaba dentro de `motor-city/`, donde ninguna IA las encuentra.


---

# ANEXO 0b. Todos los pedidos y su estado (`docs/PEDIDOS.md`)


> **Para qué sirve:** responder «¿ya está todo lo que pedí en el repositorio?».
>
> Cada pedido aparece con su estado y con el archivo donde vive. Se actualiza en cada sesión.
>
> **Estados:**
> - ✅ está en el repositorio y tiene prueba;
> - 🟡 está hecho, pero falta algo que no depende del código (un celular real, otra IA);
> - ⏳ todavía no está, y se dice a quién le toca.

Versión **3.0.0** en `main`; **3.0.1 propuesta en la PR #5** · 20‑nov‑2026 · **138 pruebas en verde en Chromium para el commit f976776** ([ejecución](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44750220010)).

### Resumen
- **Hechos:** 76 pedidos ✅.
- **Hechos, pero falta algo de afuera:** 5 🟡. Los 10 reels que piden iniciar sesión los describe Gemini. La documentación decía que el motor estaba copiado en EnCicla y El Metro, pero la auditoría de las ramas `main` no encontró `motor-city/` en sus raíces (ver `docs/AUDITORIA-ECOSISTEMA-2026-11-20.md`). Y falta probar en un celular real.
- **Pendientes:** 6 ⏳:
  - los juegos *Motor City* (carreras) y *Extremo*;
  - bajar la maqueta de 40 ms en cualquier máquina;
  - el test de WebRTC de EnCicla, que le toca a su IA;
  - el arte y el código de ChatGPT (C‑A y C‑M);
  - las tareas fáciles de Gemini (G‑H1…G‑H6);
  - la licencia.

  Ninguno es un olvido. Cada uno está en el plan (§9 y §12 del documento único).

### 1. El motor y el repositorio (2.0–2.1)
| Pedido | Estado | Dónde |
|---|---|---|
| Un solo motor para todos los juegos, según el plan del mundo abierto | ✅ | `js/` → `dist/motor.js` · `docs/VISION-MOTOR-CITY.md` |
| Repositorio nuevo y llamarlo solo «Motor City» | ✅ | `juanfeliperico369-stack/motorcity` |
| Craquear territorios reales (país, ciudad, pueblo o lugar) | ✅ | `geo/territorio.py` · Guatapé en `datos/guatape` · skill `motor-city-territorio` |
| Crear mundos nuevos | ✅ | `js/12-generador.js` (isla, valle, costa, montaña, llanura) |
| Física fiel a la realidad | ✅ | `js/02-ciencia.js` (`MC.Fis`), `js/32-fisica.js` |
| Química fiel | ✅ | `js/02-ciencia.js` (`MC.Quim`, balanceo exacto) |
| Economía fiel | ✅ | `js/03-economia.js` (partida doble, mercado, finanzas) |
| Matemáticas | ✅ | `js/02-ciencia.js` (ruido, integradores, unidades SI) |
| Biología y personajes | ✅ | `js/35-seres.js`, `js/30-personaje.js` |
| Vehículos | ✅ | `js/31-vehiculos.js` (35), `js/36-taller.js` |
| Animales y alienígenas | ✅ | `js/35-seres.js`, `js/13-cosmos.js` |
| Interfaces | ✅ | `js/70-interfaz.js` |
| Música | ✅ | `js/60-musica.js` (procedural y clásicos de dominio público) |
| Mundo vivo | ✅ | `js/20-tiempo.js`, `21-trafico`, `22-transporte`, `24-ambiente`, `25-ia` |
| Interiores procedurales únicos | ✅ | `js/48-interiores.js` |
| Skills para las IAs | ✅ | `.claude/skills/` (desarrollo, territorio, juegos, ciencia, arte) |
| Usos y cómo venderlo | ✅ | `docs/NEGOCIO-Y-USOS.md` |
| Plan para Gemini y para GPT | ✅ | `docs/DOCUMENTO-UNICO.md` §9 y §10 |
| Contexto para las IAs de cada juego | ✅ | `CONTEXTO-IA.md`, `AGENTS.md`, `CLAUDE.md` y `docs/CONTEXTO-MOTOR-CITY.md` en cada juego |
| Repositorio abierto a las IAs, con reportes | ✅ | `reportes/`, `CONTRIBUIR.md`, `node motor.mjs reporte` |
| Minijuego en un HTML y su link | ✅ | `juegos/mandados` → [mandados.html](https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html) |
| Que EnCicla y El Metro usen el motor | 🟡 | El motor ya está copiado en `motor-city/` de cada juego, y la guía paso a paso está en `docs/MIGRACION-*.md`. **Falta:** la migración, que la hace la IA de cada juego (§9.3 y §9.4). |
| Run Scooter dentro de los juegos | ✅ | `js/50-run.js` («Run en la ciclovía») |
| Los juegos *Motor City* (carreras) y *Extremo* | ⏳ | Son juegos futuros. Las piezas ya existen (`MC.Carrera`, física y tráfico). **Le toca:** a Claude, que lo tiene en su plan (§9.7). |

### 2. Gráficos, controles y lugares (2.2)
| Pedido | Estado | Dónde |
|---|---|---|
| Solución a la tarjeta gráfica («crea una si es posible») | ✅ | `js/05-gpu.js` (nivel y resolución dinámica), `js/44-raster.js` (3D por software) |
| Física de puentes | ✅ | `js/32-fisica.js` (superficies y niveles), `js/red-niveles.mjs` |
| Mejor cámara | ✅ | `js/34-camara.js` (resortes y sacudida) |
| Vista lateral (FEZ, Little Nightmares, Monument Valley) | ✅ | `js/41-vista2d.js` (lateral), `js/42-vehiculos-lado.js` · `docs/INVESTIGACION.md` |
| Sprites | ✅ | `js/38-sprites.js` (atlas, 8 direcciones, 9‑slice, fondo magenta) |
| Psicología de la interfaz | ✅ | `js/70-interfaz.js` (zonas, atenuación, un aviso a la vez, `MC.UI.verificar`) |
| Los mejores motores, estudiados | ✅ | `docs/INVESTIGACION.md` |
| Historia con diversión, reflexión y conciencia | ✅ | `js/85-historias.js` (`MC.Historias` y director de ritmo) |
| Ocurrencias (lo imprevisto) | ✅ | `js/85-historias.js` (`MC.Ocurrencias`) |
| Manual de uso | ✅ | `docs/MANUAL.md` |
| Optimización | ✅ | `docs/OPTIMIZACION.md` |
| Tipos de controles | ✅ | `js/33-controles.js`, `js/37-manejo.js` (7 esquemas) |
| Información en pantalla que no estorbe | ✅ | `js/70-interfaz.js` |
| La casa del jugador desde su dirección, con diseño de interiores | ✅ | `js/49-hogar.js` (`MC.Direccion` y `MC.Hogar`). La dirección no sale del celular. |
| Más lugares: talleres, compras, restaurantes… | ✅ | `js/82-lugares.js`, `js/36-taller.js` |
| Historias procedurales | ✅ | `js/85-historias.js` |
| Generación como No Man's Sky | ✅ | `js/13-cosmos.js` (estrellas, planetas y relieve infinito) |
| Tamaños proporcionados | ✅ | `js/04-escala.js` (`MC.Escala.validar`) |

### 3. La ciudad (2.3)
| Pedido | Estado | Dónde |
|---|---|---|
| Cómo hacen SimCity y Cities: Skylines las ciudades | ✅ | `js/26-urbe.js` (zonas, demanda RCI, valor del suelo, servicios, presupuesto, capas de datos) |
| Sombras | ✅ | `js/39-sombras.js` (sol según la hora, en todas las vistas) |
| Detalles de ciudad | ✅ | `js/27-mobiliario.js` (postes, árboles, bancas, paraderos, cebras) |
| Los Sims | ✅ | `js/86-necesidades.js` (objetos inteligentes y necesidades) |
| Townscaper | ✅ | `js/14-ondas.js` (WFC, autotile, rejilla irregular) |
| Ambiente sonoro | ✅ | `js/61-sonido.js` (`MC.Paisaje`) |
| Un solo documento con todo: contexto, código a usar y plan de cada IA | ✅ | `docs/DOCUMENTO-UNICO.md` → `dist/MOTOR-CITY-TODO.md` |

### 4. Terreno y agua (2.4–2.5)
| Pedido | Estado | Dónde |
|---|---|---|
| Montañas, rocas y tipos de terreno | ✅ | `js/15-terreno.js`, `js/28-naturaleza.js` |
| Agua en lagos, ríos, playa y mar | ✅ | `js/15-terreno.js`, `js/12-generador.js` (lagos), `js/40-dibujo.js` (color por profundidad) |
| Límites verosímiles («el personaje pasa por encima de cosas») | ✅ | `MC.Terreno.paso` y los obstáculos en `js/32-fisica.js` |
| Poder entrar al agua | ✅ | `js/32-fisica.js` (bajarse, nadar, bucear con aire, montar, lancha) |

### 5. El minijuego jugable (2.5.1, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «No hay controles de verdad, no se puede mover nada» | ✅ | El problema no era el movimiento: la cámara estaba muy lejos y el joystick no se veía. Ahora hay **joystick visible** (`ui.joystick`), **botones de acción** (`ui.accion`), **cámara cerca** (unos 45 m en el lado corto), **marca del jugador**, **flecha al objetivo** (`MC.UI.indicador`) y **tutorial**. En computador funcionan las flechas y WASD. |
| «No está completamente liberado porque hay que pagar» | ✅ | **Modo libre**, prendido por defecto: los 34 vehículos (bici, moto, carro, bus, avión, lancha…), la casa, los lugares y la ciudad son gratis. Se apaga en ⚙️ Ajustes. |
| «Mejóralo con lo nuevo» | ✅ | Agua (al agua, bucear, lancha), terreno, sombras, ciudad (modo alcalde), mi casa, lugares, historias y paisaje sonoro. El primer mandado empieza cerca. |
| Que no se rompa otra vez | ✅ | Prueba nueva en `pruebas/prueba.mjs`: un celular táctil abre el juego, arrastra el joystick y se mueve. |
| La entrega de Gemini, integrada | ✅ | `arte/gemini/` (10 atlas, íconos, hitos, paletas), `js/87-pieles.js` (`MC.Pieles`) y el selector 🎨 Arte en Mandados. La revisión está en `arte/gemini/LEEME.md`: se usan árboles, props, rocas, fachadas y muebles; el personaje, los vehículos y los animales quedan procedurales hasta que vengan a escala. |
| La auditoría de Codex (`docs/AUDITORIA-MOTOR-CITY-2026-11-19.md`), atendida | ✅ | Las pruebas usan el Chromium del sistema si Playwright no trae el suyo, o el que diga `MC_CHROMIUM`. El arte de Gemini ya se revisó en las vistas. Lo que no es del motor quedó con su dueño (abajo). |
| La auditoría de Gemini, corregida | ✅ | Leyenda en las capas de datos; etiquetas de los cuartos en la esquina; ventanas encendidas en las casas bajas; la maqueta sin el corte de tierra; barras con fondo. Además, un comentario que desde la 2.2 anulaba dos líneas de la interfaz. |

### 6. Realismo y reparto de tareas (2.6, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «Desde la cenital los árboles se ven como tapetes en el suelo» | ✅ | `js/29-arboleda.js`: de pie en la maqueta, la oblicua y la lateral, con volumen desde arriba y sombra según el sol. |
| «Más realismo, rudeza y crudeza, pero *family friendly*» | ✅ | `MC.Rudeza` en `js/40-dibujo.js` (asfalto, andenes, pasto, techos y grano), muros con la base sucia y `MC.estilo` (realista o clásico). |
| «Los tutoriales deben ser opcionales» | ✅ | Mandados: «❓ Cómo se juega (opcional)» en la portada y en ⚙️ Ajustes; ya no se abre solo. |
| «Copia todos tus pedidos en los repositorios» | ✅ | `TAREAS-IA.md` en motorcity, BicicletasUno, MetroZero y RunRunZero, y `AGENTS.md`, `CLAUDE.md` y `GEMINI.md` apuntando ahí. |
| «Gemini (Antigravity) pasa a *hydrogen*: lo fácil» | ✅ | G‑H1…G‑H6 en `TAREAS-IA.md`, con `node motor.mjs capturas` y `revisar-arte` para que sean comprobables. |
| «ChatGPT (Codex) sigue con *astra*: mejores pedidos; mejores imágenes» | ✅ | Arte C‑A1…C‑A7 y código C‑M13, C‑M16 y C‑M17 (más los C‑M de antes) en `TAREAS-IA.md` y §10.2. |

### 7. Estilos, peso y vida, y motores potentes (2.7, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «Peso y vida en el motor» | ✅ | `js/88-vida.js` (`MC.Vida`): aterrizaje con aplastamiento, sacudida y polvo; hitstop; cabeceo del vehículo; bandadas; hojas; salpicaduras; viento en las copas. |
| «Que se pueda adaptar a motores más potentes» | ✅ | `js/89-exportar.js` (`MC.Exportar`, `MC.Puente`), `node motor.mjs exportar` y `docs/MOTORES-POTENTES.md`. El GLB pasa el validador de Khronos y three.js lo dibuja. |
| «Estéticas de cómic, manga, anime y novela gráfica» | ✅ | `js/16-estilos.js`: cómic, manga, anime, novela gráfica, ukiyo-e y acuarela, más realista y clásico. |
| «Investiga y aprende de las mejores obras visuales» | ✅ | `docs/INSPIRACION-VISUAL.md`, con fuentes. |
| «Recopila y adapta arte de verdad» | ✅ | Paletas de 10 obras de dominio público en `arte/dominio-publico/` (sin copiar arte con derechos). |
| Las referencias (14 reels) | 🟡 | Se leyeron 4; los otros 10 piden iniciar sesión. Los describe Gemini (G‑H7). |

### 8. La entrega maestra de referencias (2.8, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Sumar la entrega maestra (25 fichas, peso, vida y arquitectura) | ✅ | `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`, el resumen ficha por ficha en `docs/INSPIRACION-VISUAL.md` §1 y anexo E4 del documento único |
| «Prepara todo»: lo que se pudo hacer ya en el motor | ✅ | Palomas que huyen, huellas, faros, luces de freno, vintage, CRT, térmico, accesibilidad, telemetría, calidad y contratos (`js/88-vida.js`, `js/90-telemetria.js`, `js/91-contratos.js`, `schemas/`) |
| «Prepara todo»: lo demás, repartido | ✅ | `TAREAS-IA.md`: C‑M20, C‑M21, C‑M22, C‑A10, C‑A11, G‑H7 y G‑H9 |

### 9. La entrega de Gemini (G‑H1…G‑H8) y sus hallazgos (2.8)
| Pedido | Estado | Dónde |
|---|---|---|
| Tareas fáciles de Gemini | ✅ | `reportes/2026-11-20-gemini-*.md`, `arte/referencias/`, `contenido/datos-gemini.json`, `arte/gemini/iconos-ui.json`, `arte/dominio-publico/candidatas.md` y `docs/INSPIRACION-VISUAL.md` §1.1 |
| Corregir lo que vio Gemini en las capturas | ✅ | Zona libre con margen para los botones (80 %); avisos con clave (la vista nunca queda desfasada); ventanas en las casas de un piso; cubiertas sobre columnas; cebras sin cruzarse; botón «Comprar» y burbuja dentro de la casa; sombra de las copas más pequeña |
| Paletas de las obras colombianas | 🟡 | 12 de 16 en `arte/dominio-publico/paletas.json` (`col_*`): Comisión Corográfica, Torres Méndez, Garay, Acevedo Bernal y el *Papel Periódico Ilustrado*. Wikimedia frenó las otras 4; se completan en la próxima sesión. |

### 10. La entrega de ChatGPT y Codex (2.7.1), unida en la 2.9
| Pedido | Estado | Dónde |
|---|---|---|
| Arte a escala de ChatGPT (C‑A1…C‑A9) | ✅ | `arte/chatgpt/` (6 atlas, 676 cuadros) y `arte/chatgpt/guias/`; en Mandados: Vista → Arte → ChatGPT |
| Código de Codex (C‑M1, C‑M13, C‑M15…C‑M19) | ✅ | La auditoría y sus arreglos; caché de fachadas (maqueta a 22 ms); agua en el MC4; `textura` y charcos; adaptadores de Godot y three.js; 1 bit (`ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`) |
| Maqueta por debajo de 20 ms (C‑M13) | 🟡 | Va en 22 ms con la CPU 4×. Los estilos cómic (28 ms) y 1 bit (37 ms) de Codex cuestan más porque procesan toda la pantalla. |

### 11. Lo que falta, y a quién le toca
| Qué | Estado | A quién le toca |
|---|---|---|
| Probar en un **celular real** de gama media | 🟡 | Al autor. Anota el modelo y lo que se siente lento o confuso. |
| Lo que sigue de ChatGPT y Codex (C‑A10, C‑A11, C‑M2…C‑M12, C‑M14, C‑M20…C‑M22) | ⏳ | A ChatGPT y Codex («astra»): `TAREAS-IA.md`. |
| Revisión visual, revisor de arte, referencias y datos (G‑H1…G‑H6) | ⏳ | A Gemini («hydrogen»): `TAREAS-IA.md`. |
| Licencia del motor | ⏳ | Al autor (`docs/NEGOCIO-Y-USOS.md`). |
| Maqueta por debajo de 40 ms en cualquier máquina (Codex midió 44,7 ms en la suya; aquí da 27–29 ms) | ⏳ | A Claude: caché por región y fachadas horneadas (§9.7). |
| El test de WebRTC de EnCicla (ventana fija de 900 ms) | ⏳ | A la IA de EnCicla (lo señalaron Gemini y Codex). |

### 12. «Retoma, une todo, mejora y optimiza todo; añade las skills y plugins de los videos y sigue desarrollando» (2.10, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Revisar los repositorios ya actualizados y **unir todo** | Hecho | <ul><li>El Metro: Motor del Valle 1.2.0 desde EnCicla.</li><li>`plan-unico-el-metro` ya estaba dentro de la v2.0.0, así que no se fusionó: habría devuelto 14 archivos a su estado anterior.</li><li>EnCicla: de `revolucion-v2` (2.0.1) se trajo el **alto contraste** y el **metro sin casas debajo** (`src/js/96-accesible.js`, con 2 pruebas). El registro de claves del guardado queda para su IA.</li></ul> |
| **Optimizar todo** | Hecho | <ul><li>El cómic y el 1 bit sin leer la pantalla (`Estilo._imprimirGPU`), a media resolución en pantallas densas.</li><li>Cuadro real en la cenital: el cómic pasó de 25,5 a 20,8 ms y el 1 bit de 25,1 a 17,9 ms. En la maqueta: el cómic pasó de 42,9 a 30,9 ms y el 1 bit de 42,4 a 27,7 ms.</li><li>Atlas más livianos: Mandados pasó de 8,2 a 5,1 MB y se ve igual (`herramientas/aligerar_arte.py`).</li></ul> |
| **Mejorar todo** | Hecho | <ul><li>El 1 bit ya no hace muaré en la maqueta.</li><li>`rutaA` sale por el extremo de la calle que conviene: mediana de 1,29× la línea recta, y a veces mucho más corta. Arregla también «tocar para ir».</li><li>Modern Web Guidance sobre el motor, con respaldo para celulares viejos.</li></ul> |
| **Skills y plugins de los videos** | Hecho | <ul><li>`skills-externas.json`, `node motor.mjs skills`, `.claude/settings.json` en los 4 repositorios y la skill `motor-city-skills-externas`.</li><li>El detalle de los 11 enlaces está en `docs/INSPIRACION-VISUAL.md` §1.2.</li></ul> |
| **Seguir desarrollando** | Hecho | **`MC.Publico`**, el público simulado (idea de MiroFish), con `node motor.mjs publico` y su prueba. |
| **Nuevas peticiones para Gemini y ChatGPT** | Hecho | <ul><li>Gemini: G‑H10 a G‑H13.</li><li>ChatGPT y Codex: C‑M23 (red vial), C‑M24 (ayuda para niños), C‑M25 (portada con Hallmark) y C‑A12 (tráiler con HyperFrames).</li><li>Todo en `TAREAS-IA.md`.</li></ul> |

### 13. «Sigue básico: mundo único híbrido, cámara de #DRIVE y Reckless Getaway, tope de zoom, radio de vista, fachadas y artilugios físicos» (3.0, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Revisar si Gemini y ChatGPT publicaron algo | Hecho | No subieron nada nuevo después de la 2.9.1. |
| Investigar las cámaras de referencia y GTA San Andreas | Hecho | `docs/INVESTIGACION-CAMARA.md` |
| Que la cenital, la maqueta y la 3D sean el mismo mundo | Hecho | Cámaras aéreas sobre el mundo 3D (`js/45-gl3d.js`, perfiles de `MC.Camara`), con respaldo 2D sin GPU. |
| Lo que estaba en 2D y debía ser 3D | Hecho | Árboles low-poly, que son los mismos de la 2D; el suelo 3D sin árboles ni techos pintados; carros y personas con volumen. |
| Moverse en 3 dimensiones y artilugios físicos | Hecho (base) | El cuerpo ya tenía altura, saltos y buceo. Ahora están `MC.Objetos` (conos, balones, canecas, cajas y vallas). Rampas y destrucción quedan para Codex (C‑M29). |
| Ni tan cerca ni tan lejos, con tope; mejorar el ángulo | Hecho | Zoom de 2,6 a 22 px por metro; la cámara se inclina según el zoom; cámara continua hasta la vista detrás del jugador. |
| Un mapa en vez de alejar todo | Hecho | El mapa grande, al tocar el minimapa. |
| Radio de vista y carga que no se note | Hecho | Radio y niebla por cámara; las regiones se cargan por cercanía. |
| Fachadas | Hecho | Zócalo, ventanas, puerta, balcones, cornisa, alero, pretil y tanque. |
| Jerarquía de estilos y vistas | Hecho | Una cámara de juego y «Más vistas y filtros». |
| Fluidez | Hecho | 2.11: la densidad dinámica y la capa de suelo. |
| Pedidos nuevos para Gemini y ChatGPT | Hecho | G‑H14 a G‑H17, y C‑M26 a C‑M29, C‑A13 y C‑A14, en `TAREAS-IA.md`. |


### 14. «Empieza con el monstruo, nada de *family friendly*; todo en un planeta, con caminos largos en medio de la nada»; y luego «adapta todo lo nuevo» (4.0, esta sesión)
| Pedido | Estado |
|---|---|
| El juego grande y adulto | ✅ *Turno Cero* (`juegos/getaway/`), con el canon de Codex. Ver `docs/TURNO-CERO.md`. |
| Guatapé, la mejor versión de Medellín y el Valle, y Nueva York en un solo planeta | ✅ `MC.Planeta`: anillo de 3 ciudades y 3 carreteras, con globo y horizonte curvo |
| Caminos largos en medio de la nada para llegar a cada ciudad | ✅ 16, 12 y 15 km generados, con biomas, paradas, letrero de km y viaje ×3 |
| Los modos, vehículos y transporte de Medellín, adaptados | ✅ Metro, cables, tranvía y Metroplús (subirse y perder a la policía), EnCicla, lancha del embalse y robo de carros |
| Lo nuevo de Codex: espionaje 2026, artefactos y GLB | ✅ Artefactos T01, T02, T03, T05, T06, T08, T09, T11 y T04 en el juego; los 42 GLB en la cámara 3D (`MC.Modelos`) |
| Lo nuevo de Codex: acción a pie, esqueletos y texturas | ⏳ C‑M32, C‑M33 y C‑A16 (`TAREAS-IA.md` § 4.0) |
| Medir en un celular real | ⏳ G‑H20 y G‑H24 |

### 20-nov-2026 · Entrega ChatGPT (rama de integración)
- **C-M29 / G-H17 · Parcial funcional:** 30 objetos con parámetros de juego, guardado por sector original e IDs estables; restauración en Mandados.
- **Pendiente:** arte y modelos detallados, streaming de objetos por sectores, prueba móvil y ejecución integral de Playwright desde un clon.

### 20-nov-2026 · Nueva ronda de IA y diseño
- **C-M25:** portada editorial sin neón ni tarjetas genéricas, con prueba en Chromium `pruebas/portada.mjs`; ejecución CI pendiente de inspección en el commit correspondiente.
- **G-H19, parcial:** investigación documental de persecuciones de tres juegos. No se inventan minutos/segundos ni conteo de policías; `reportes/2026-11-20-gemini-persecuciones.md`.
- **G-H18:** 50 registros de NYC CommonPlace publicados en `contenido/nueva-york-lugares.json` (IDs/coordenadas/fuente); **acceso a cada lugar sin verificar**. Ver `docs/ESTADO-3.1.0.md`.

### Nota de consolidación · 3.1.0
Esta página conserva la historia original de los pedidos, incluso estados de 2.10/3.0 ahora superados. El **estado actualizado y con evidencias** se mantiene en [`docs/ESTADO-3.1.0.md`](ESTADO-3.1.0.md). No leer «Hecho» de versiones anteriores como una certificación de la rama principal ni del rendimiento en teléfonos físicos.

### 15. «Investiga motores viejos y livianos» y «mundo abierto desde el principio» (4.1 a 4.4)
| Pedido | Estado | Dónde |
|---|---|---|
| Investigar motores clásicos (Wolfenstein, Doom, Build, Quake, Elite, Thief, OutRun, Comanche) y adaptar sus técnicas, desde cero | ✅ | `docs/INVESTIGACION-MOTORES-CLASICOS.md`, `js/47-clasicos.js` (DDA, semillas, gema de luz y ruido, carretera arcade, Voxel Space), `js/47-colormap.js` (COLORMAP) |
| Mundo abierto desde el principio; tutorial e historia opcionales | ✅ | Turno Cero (🌎 Mundo abierto), El Metro y EnCicla (Jugar abre la ciudad), Run Scooter (regalo diario sin ventana) |
| Lo que dejaron Codex, ChatGPT y Antigravity | ✅ | Modo cine con direccionales (C‑M40), cubierta y esquivar (C‑M32), COLORMAP (C‑M39), pool de partículas y escalador, arreglos de EnCicla, la carretera de Run |

### 16. «Retoca modelos, haz el PVS, mejora topografías y edificios… comparte el motor con un informe a cada repositorio» y «pule el manejo, los rostros, los árboles, Hunter Assassin, explosiones» (4.5, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| PVS de Quake (C‑M37) | ✅ | `herramientas/pvs.mjs`, `js/45-pvs.js`, `datos/nueva_york/pvs.bin`, `datos/guatape/pvs.bin`; prueba sin fugas `pruebas/pvs.mjs`. Recorta 26 % en Manhattan y 28 % en Guatapé (cámara a ras de calle). Medellín: horneado y medido (15 %), no se mete al HTML porque pesa 1 MB para poco. |
| Modelos 3D pulidos | ✅ | `juegos/getaway/arte3d/generar_modelos.py` 0.3.1: silueta de carro con capó, cabina y baúl, rines, faros, espejos; personas con cara (ojos, cejas, orejas, nariz, labios), manos y peinado; AO horneada; malla indexada. |
| Edificios, casas y relieve (sin cambiar el mapa) | ✅ | Techos a cuatro aguas en casas de teja y en los hitos, terrazas con aires y cuarto de escalera, coronas y agujas en las torres, relieve cercano con malla de 10 m. |
| Peso y uso sin internet | ✅ | GLB comprimidos (2 MB → 0,4 MB en el HTML); `sw.js`: lo abierto una vez abre sin internet, y solo se consulta `VERSION.json` para saber si hay versión nueva (`pruebas/sin-conexion.mjs`). |
| Manejo y controles | ✅ | `docs/INVESTIGACION-MANEJO.md`: deslizar contra la pared, pérdida según el ángulo, desatascar, asistencia que evita estrellarse, derrape con freno de mano, pisar andén, ladrillo, arena, nieve y roca suelta, moto por escalas. |
| Explosiones, choques, derrapes y cosas rotas | ✅ | `js/88-efectos.js` y `js/32-rotos.js`. |
| Rostros detallados | ✅ | `js/71-rostros.js` (retratos en los diálogos y subtítulos de Turno Cero) y caras en los modelos 3D. |
| Árboles con lógica | ✅ | `js/29-arboleda.js`: nada en canchas, piscinas ni en la mitad de una plaza dura; la colisión usa el mismo filtro. |
| La forma cenital de Hunter Assassin | ✅ | Linternas que se cortan en los muros, «?» y «!», cámara cenital sola en el sigilo a pie (`juegos/getaway/58-sigilo.js`). |
| Interfaz y espaciados (juego de prueba) | ✅ | Rejilla de 8 px y área segura en el HUD de Turno Cero. |
| Bot de la historia en las pruebas | ✅ | `pruebas/getaway-historia.mjs` (`node motor.mjs prueba --historia`) y en la integración continua. |
| Documento detallado a cada repositorio; que sigan con su motor del Valle | ✅ | `docs/INFORME-MOTOR-CITY-4.5.md` en BicicletasUno, MetroZero y RunRunZero; el motor va en `motor-city/` como referencia. |
| El mapa | No se tocó | Por pedido del autor: es de las IA que lo desarrollan. El PVS es un dato derivado del mapa, no lo cambia. |
| HTML, APK y enlace de cada juego | ✅ | Ver `CONTEXTO-RELEVO.md` § 1. |

### 17. «Injugables, toscos como GTA IV… básate en EnCicla, arregla El Metro, el mapa congela, no hay horizontal» y «un solo juego de prueba con todo» (4.6, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Manejo fluido, que arranque, avance y retome rápido, sin derrapes por nada | ✅ | El modelo de EnCicla (`30-ride.js`) en `js/32-fisica.js` (`_arcade`) y `js/31-vehiculos.js` (`ARCADE`); subpasos de 25 ms; prueba §26. |
| Movimiento del personaje como en EnCicla | ✅ | A pie, el mismo modelo: gira al instante y trota con el joystick a fondo. |
| Horizontal | ✅ | Portada y HUD de Turno Cero a 860×412; los APK giran con el celular (Turno Cero y Run Scooter). |
| El mapa: brújula, acercar y alejar, que no congele | ✅ | `js/70-mapa.js`: vista general armada de a poco, detalle con presupuesto, pausa, ✕ + − ◎ 🧭, tocar = destino. Tocar el minimapa lo abre. |
| Arreglar El Metro | ✅ (por la sesión de El Metro) | La 3.1.0 «Fluido» (APK 29) ya trae el manejo de EnCicla; esta sesión retiró el suyo para no pisarlo y dejó el informe 4.6 con cómo comparar los dos. |
| Un solo juego de prueba: los cuatro en Turno Cero | ✅ | `juegos/getaway/60-modos.js`: 🏁 Carreras, 🚵 Extremo, 📦 Mandados, 🚲 EnCicla (racha por la ciclorruta, semáforo en rojo, rebalanceo), 🚇 Metro, tranvía y Metroplús (manejar y parar en el andén), 🧪 Laboratorio. `pruebas/modos.mjs`. |
| Lo que dije que faltaba | Parcial | Hecho: mapa, horizontal, manejo. Pendiente: el globo en la misma escena 3D (C‑M31) y la prueba en un celular real. |
| HTML, APK y enlace de cada juego | ✅ | `CONTEXTO-RELEVO.md` § 0. |

### 18. «Coloca un botón que, presionado, siempre esté acelerando sin parar; para detenerse, se desactiva» (4.6.1)
| Pedido | Estado | Dónde |
|---|---|---|
| Botón de acelerador fijo | ✅ | `js/37-manejo.js` (`acelFijo`), `js/70-interfaz.js` (`ui.alternar`), Turno Cero: ⏫ junto a 🛑 y ⚡, tecla V. |
| Que al desactivarlo se detenga | ✅ | Frena suave hasta parar (`frenoK` 0,55), salvo que se toque el joystick. |
| Adaptarlo bien | ✅ | Vertical (la velocidad sube sobre los botones) y horizontal; también en el tren de 🎮 Modos; a pie se esconde; aviso la primera vez. Pruebas § 27 y `pruebas/modos.mjs`. |

### 19. «Revisa el juego contra los mejores, investiga, haz un plan; arregla los modos; todo liberado; cada modo en el mundo abierto; Run en ciclovías; luego arte y cámaras» (4.7, con Gemini y Codex en paralelo)
| Pedido | Estado | Dónde |
|---|---|---|
| Documento con la marca de la IA | ✅ | `docs/PLAN-EVOLUCION-CLAUDE.md` (Gemini: `docs/PLAN-EVOLUCION-GEMINI.md`; Codex: `CONTEXTO-CODEX-TURNO-CERO.md`) |
| Comparar con las referencias e investigar | ✅ | Plan § 3–4, con fuentes; límites declarados (no se pudieron jugar ni ver los videos) |
| Arreglar los modos (lentos, engorrosos) | ✅ | Plan § 2: ritmo, tren, volante, cenital |
| Todo liberado desde el principio | ✅ | Capítulos y vehículos |
| Cada modo presente en el mundo abierto | ✅ | `G.Actividades` en `juegos/getaway/60-modos.js` |
| Run solo en ciclovías, con giros, anchos, obstáculos, trucos y parkour | Parcial | Ya: ciclorruta real, curvas, cruces y la marca 🛴. Falta el ancho por tipo de vía y las zonas de trucos dentro del corredor (plan § 7). |
| Cámaras coherentes; un solo mundo 3D; 2D y pixel donde convienen | Parcial | Cámaras por contexto, cenital de verdad y zoom por velocidad (4.7). La lateral 2D en el tren y los enfrentamientos va en el plan § 8. |
| Arte y gráficos más realistas | En curso | Gemini (iluminación, primera persona, raster) y Codex (arte). Rellenar manzanas espera el visto bueno del autor (plan § 9). |
| Revisar lo que reportan las otras IA | ✅ | Buzón y ramas leídos; hallazgos de Gemini resueltos; entrega de Codex unida |

### 20. «Retoma el trabajo de Gemini y ChatGPT, termina de unir lo que falta en el motor, el juego de prueba, EnCicla y El Metro, optimízalos y añade a todo Flexibilidad» (4.8)
| Pedido | Estado | Dónde |
|---|---|---|
| Unir las ramas de Gemini, ChatGPT y Codex en el motor | ✅ | Merges en `claude/motor-city-engine-xu7p4y` |
| Cerrar los hallazgos de ChatGPT | ✅ 11/11 | `pruebas/chatgpt-auditoria-contratos.mjs` y `pruebas/chatgpt-input-real.mjs` |
| Hacer lo que Gemini dejó planeado (render y mundo vivo) | ✅ render y miradores · ⏳ subtramas | `js/44-raster.js`, `js/45-gl.js`, `js/34-camara.js`, `60-modos.js` (🌄). Las subtramas RPG siguen en su plan |
| Unir EnCicla (3.0.0 + GPT-6) | ✅ 3.1.0 | `BicicletasUno`, `tests/run.js` en verde |
| Unir El Metro (3.2.0 + Antigravity + Codex + GPT-6) | ✅ 3.3.0 | `MetroZero`, `tools/test.mjs 100`: 0 errores |
| Optimizar | ✅ medido | Caché de sectores (p95 de 166 a 33 ms con CPU 4×); minimapa sin solapes |
| Flexibilidad en todo | ✅ | Motor (`MC.Flex`) y Turno Cero; EnCicla (Más → ⚙️ Flexibilidad); El Metro (Ajustes → ⚙️ Flexibilidad) |

### 21. «Añade a Turno Cero los servicios de rescate y teletransportarse en el mapa con Ir; divide la pantalla en mitades (arriba siempre la cámara); unifica los mapas» (4.8)
| Pedido | Estado | Dónde |
|---|---|---|
| Servicios de rescate | ✅ | 🆘 en el HUD y en ⏸ Menú: `juegos/getaway/63-rescate.js` |
| Teletransportarse con «Ir» al poner el punto | ✅ | 🚀 Ir en el mapa (`js/70-mapa.js`, `op.alIr`) |
| Pantalla en mitades: arriba siempre mover y acercar la cámara | ✅ | `js/33-controles.js` (mitades), `js/34-camara.js` (encuadre fijo, doble toque endereza) |
| Unificar los mapas | ✅ | Minimapa, 🗺️ y 🌍 en un solo mapa (`op.planeta`), 🗺️ de vuelta desde el planeta |
| Prueba | ✅ | `pruebas/rescate-mapa.mjs` |

### 22. «Los gráficos aún son básicos: incrusta three.js, haz todo lo que propones y sigue mejorando» (4.9)
| Pedido | Estado | Dónde |
|---|---|---|
| Incrustar three.js (sin internet) | ✅ | `js/vendor/`, `herramientas/construir.mjs` |
| Sol con sombras, luz física, cielo y noche | ✅ | `js/45-tres.js` (`MC.VistaTres`) |
| Suelo, muros y ladrillo con más vida | ✅ procedural | Grano y juntas en los sombreadores |
| Relieve, casas y edificios «como son» | 📋 plan con decisiones de licencia | `docs/PLAN-REALISMO.md` § 3 A |
| Elegir gráficos según el celular | ✅ | ⚙️ Flexibilidad → 🖼️ Gráficos |
| Prueba | ✅ | `pruebas/tres.mjs` |



---

# ANEXO A. Manual (`docs/MANUAL.md`)


> **Para todas las IAs:** el documento único `docs/DOCUMENTO-UNICO.md` tiene el contexto, el código exacto y el plan de cada una.

Este manual explica para qué sirve el motor, qué contiene, cómo se usa, cómo sacarle el máximo provecho y qué hacer si falta algo.

> **Para quién:** el autor, las IAs de cada juego y cualquier persona que llegue.
> **Lo técnico al detalle:** `MOTOR.md`.

### 1. Para qué sirve
Motor City convierte **cualquier lugar real** (un país, una ciudad, un pueblo o una cuadra) o **uno inventado** (un valle, una isla o un planeta entero) en un **mundo jugable con leyes reales**. Encima, cada juego pone su piel, su trama y sus mecánicas.

Sirve para:
- **juegos**: los cuatro que vienen y los que se le ocurran;
- **simuladores**: movilidad, educación vial, riesgo y urbanismo;
- **experiencias educativas**: física, química, biología y economía jugables;
- **turismo**: pueblos jugables.

Funciona en **un solo HTML**, sin internet y en cualquier celular.

### 2. Qué contiene (el mapa del motor)
| Para… | Módulo | Lo principal |
|---|---|---|
| **Números reales** | `MC.Ciencia`, `MC.Fis`, `MC.Quim`, `MC.Termo` | Unidades SI, ruido, integradores, atmósfera, arrastre, química con balanceo exacto, calor. |
| **Plata que cuadra** | `MC.Dinero`, `MC.Libro`, `MC.Mercado`, `MC.Finanzas` | Centavos enteros, partida doble, oferta y demanda, préstamos, VPN y TIR. |
| **Tamaños proporcionados** | `MC.Escala` | Medidas reales de gente, puertas, calles y vehículos; `validar()`. |
| **Fluidez en cualquier aparato** | `MC.GPU`, `MC.ResDinamica`, `MC.Bucle`, `MC.resorte` | Nivel del aparato, resolución dinámica, paso fijo y resortes. |
| **El mundo** | `MC.Mundo`, `MC.Generador`, `MC.Cosmos` | Mundos reales (MC4), inventados por semilla o planetas enteros. |
| **Caminos** | `mundo.red()`, `MC.Trazo`, `MC.Recorrido`, `MC.SeguirRuta` | A*, recorridos y seguir la vía. |
| **Mundo vivo** | `MC.Reloj`, `MC.Calendario`, `MC.Cielo`, `MC.Clima`, `MC.ClimaGlobal`, `MC.Ambiente`, `MC.Trafico`, `MC.Transporte`, `MC.IA`, `MC.Poblacion` | Hora, festivos, sol y luna, clima con estaciones y nieve, tráfico, metro con horario, gente con rutinas. |
| **Cuerpos y máquinas** | `MC.Personaje`, `MC.Vehiculos`, `MC.Cuerpo`, `MC.Taller`, `MC.Seres` | Personaje único, 35 vehículos, física con puentes, taller de ingeniería, biología. |
| **Controles** | `MC.Controles`, `MC.Manejo` | Teclado, dedo y mando; curvas, esquemas y asistencias. |
| **Cámara y vistas** | `MC.Camara`, `MC.Vistas`, `MC.Vista2D`, `MC.Raster`, `MC.Losas` | 9 vistas más pixel, 3D por software y resortes. |
| **Estilos gráficos (2.7)** | `MC.Estilo` | Cómic, manga, anime, novela gráfica, ukiyo-e y acuarela, con tinta, tramas y paletas de obras de dominio público. |
| **Peso y vida (2.7–2.8)** | `MC.Vida`, `MC.opciones` | Aterrizajes con aplastamiento, hitstop, bandadas, hojas, polvo, salpicaduras y viento; palomas que alzan vuelo y huellas en el suelo blando; faros y luces de freno. La sacudida y las partículas se pueden bajar (accesibilidad). |
| **Medir y contratos (2.8)** | `MC.Telemetria`, `MC.Contratos` | Fps y tiempos de cuadro en percentiles; datos versionados con sus esquemas (`schemas/`). |
| **Motores potentes (2.7)** | `MC.Exportar`, `MC.Puente` | El mundo en glTF y el estado vivo para Godot, Unity, Unreal, Blender o three.js (`docs/MOTORES-POTENTES.md`). |
| **Estilo realista (2.6)** | `MC.estilo`, `MC.Arboleda`, `MC.Rudeza` | Árboles de pie con volumen; asfalto, andenes, pasto, techos y muros con desgaste. Familiar, pero sin caricatura. `MC.estilo = 'clasico'` para el plano. |
| **Arte** | `MC.arte`, `MC.Sprites`, `MC.Pincel`, `MC.Pieles` | Pieles por juego, atlas, animaciones y respaldo procedural. **Paquetes de arte** de las IAs (`arte/gemini/`) instalados en una línea (2.5.1). |
| **Adentro** | `MC.Interiores`, `MC.Hogar`, `MC.Direccion` | Interiores con estilos, **tu casa desde tu dirección** y diseño. |
| **A dónde ir** | `MC.Lugares`, `MC.Desgaste` | Talleres, tiendas, restaurantes, bibliotecas y parques; reparar y mejorar. |
| **Qué pasa** | `MC.Mision`, `MC.Inventario`, `MC.Carrera`, `MC.Logros`, `MC.Dialogo`, `MC.Historias`, `MC.Director`, `MC.Ocurrencias` | Misiones, carreras, historias con pilares, ritmo y lo imprevisto. |
| **Pantalla y sonido** | `MC.UI`, `MC.Musica`, `MC.Paisaje` | Interfaz con zonas y atenuación; **joystick visible**, **botones de acción** y **flecha al objetivo** (2.5.1); música procedural y clásicos; sonido ambiente del lugar. |
| **Terreno y agua (2.4–2.5)** | `MC.Terreno`, `MC.Naturaleza`, `cuerpo.bajarse`, `montar`, `embarcar` y `desembarcar` | Agua por tipo y profundidad; entrar al agua dejando el vehículo en la orilla; nadar y bucear con aire; lancha. Pendientes, roca, monte, arena y nieve; quién pasa por dónde y por qué. |
| **Ciudad (2.3)** | `MC.Urbe`, `MC.Sombras`, `MC.Mobiliario`, `MC.Ondas`, `MC.Autotile`, `MC.RejillaIrregular`, `MC.Necesidades`, `MC.Habitante` | Zonas, demanda, valor del suelo y capas de datos; sombras del sol; postes, árboles y cebras; fachadas por reglas; casas habitadas. |

### 3. Cómo se usa (cinco recetas)
**a) Jugar o mostrar.** Abre <https://juanfeliperico369-stack.github.io/motorcity/> en el celular. El minijuego **Mandados** se juega así:
- **moverse:** arrastra en cualquier parte de la mitad izquierda; el joystick aparece donde pongas el dedo. En computador, flechas o WASD;
- **acciones:** ⤒ saltar y ⚡ turbo, abajo a la derecha. En el agua o en el aire aparecen 🔽 bajar y 🔼 subir;
- **a dónde ir:** la flecha amarilla con los metros. El mapa pequeño muestra el punto;
- **todo es gratis** en el **modo libre**, que viene prendido. Se cambia en ⚙️ Ajustes, donde también están «Cómo se juega» (opcional; también en la portada), la sacudida de cámara, las partículas, la calidad, la telemetría, los controles y el rescate;
- **🗺️ Vista** cambia la cámara (cenital, 3D, maqueta, lateral…), el pixel y el estilo (realista, clásico, cómic, manga, anime, novela gráfica, ukiyo-e, acuarela, vintage, CRT o térmico); **🚲 Vehículo** abre el garaje con los 34 vehículos.

**b) Un juego nuevo con una IA.** Dile a la IA:
> «Lee `AGENTS.md` del repositorio motorcity y haz un juego de [idea] sobre el mundo [guatape|medellin|generado]».

La IA corre `node motor.mjs nuevo juego nombre --mundo guatape` y usa la skill `motor-city-juegos`. El juego queda en `juegos/nombre/` y se compila a `dist/juegos/nombre.html`.

**c) Un lugar real nuevo:**
1. Busca en cualquier mapa el rectángulo de longitud y latitud del lugar.
2. Corre:
   ```bash
   python3 geo/territorio.py --id mi-pueblo --nombre "Mi pueblo" --bbox=lon0,latS,lon1,latN
   ```
3. Cambia `"mundo": "mi-pueblo"` en el `juego.json` y vuelve a construir.

**d) Un mundo inventado o un planeta:**
```js
const mundo = MC.Generador.mundo({ semilla: 42, tipo: 'isla' });   // isla, valle, costa, montaña, llanura
const estrella = MC.Cosmos.estrella(1, 0, 7), planeta = MC.Cosmos.planeta(estrella, 2);
const mundo2 = MC.Generador.mundo(MC.Cosmos.mundoDe(planeta));          // el planeta, jugable
```

**e) El ciclo de un juego** (lo mínimo):
```js
const M = await MC.Mundo.cargar(MC_MUNDO, MC_CIUDAD), vistas = new MC.Vistas(M), camara = new MC.Camara({ mundo: M });
const cuerpo = new MC.Cuerpo(M, { x, y, veh: 'bici' }), ctl = new MC.Controles(lienzo), ui = MC.UI.crear(document.body);
new MC.Bucle({
  actualizar: dt => { cuerpo.actualizar(dt, MC.Manejo.aplicar(ctl.leer(), cuerpo, { camara })); camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v, zPaso: cuerpo.zPaso }); },
  dibujar: () => vistas.dibujar(g, W, H, { mundo: M, camara, jugador: { cuerpo, aspecto }, t: performance.now() / 1000 })
}).iniciar();
```

### 4. Cómo sacarle el máximo provecho
- **Usa lo real.** Un juego en el lugar donde vive el jugador engancha más que cualquier mundo genérico. Con `MC.Hogar.desdeDireccion` el jugador juega desde **su casa**. Esto pasa sin internet y sin que la dirección salga del celular.
- **Arma, no programes.** Combina piezas: misión + lugares + historias + clima. Ejemplo: «en temporada de lluvias, una tienda pide un domicilio urgente y la lección es la frenada mojada».
- **Deja que el mundo cuente.** Hora, clima, gente con rutinas, atardeceres y storylets de reflexión: la trama sale del mundo, no de textos largos.
- **Tres pilares en cada juego:** algo **divertido** cada minuto, algo para **pensar** de vez en cuando y algo **real que se aprende** cuando sirve. `MC.Historias` los equilibra solo.
- **Que nunca estorbe:**
  - el centro de la pantalla es del juego;
  - un aviso a la vez;
  - botones donde llega el pulgar.

  `MC.UI.verificar` lo comprueba.
- **Que se sienta bien en las manos:**
  - curvas de respuesta por vehículo;
  - giro según la velocidad;
  - tiempo de coyote;
  - cámara con resortes.

  Todo viene puesto; ajústalo con `MC.Manejo.PERFIL`.
- **Mide antes de optimizar:** `vistas.ms`, `MC.GPU.perfil()` y `node motor.mjs prueba --navegador`. Ver `docs/OPTIMIZACION.md`.
- **Aprende de los jugadores.** `MC.Ocurrencias.exportar()` dice dónde se atascan y qué hacen que nadie esperaba. Sin datos personales.

### 5. Qué hacer si falta algo
1. **Mira si ya existe:** busca en este manual, en `MOTOR.md` y en `js/` (cada archivo empieza con lo que hace).
2. **Si es de un solo juego**, va en el juego (su `juego.js`), no en el motor.
3. **Si otros juegos lo pueden usar**, pídeselo a una IA así:
   > «Lee `CONTRIBUIR.md` y la skill `motor-city-desarrollo`, crea el módulo con `node motor.mjs nuevo modulo nombre`, con sus pruebas, y deja un reporte con `node motor.mjs reporte`».
4. **Si es arte**, pídelo a Gemini o ChatGPT con las reglas del documento único (§10): un solo documento, sprites en atlas con fondo magenta o transparente, y medidas en metros. Cuando llega, va a `arte/<ia>/` y se instala con `MC.Pieles.instalar`.
5. **Si es un dato real** (un precio, una cifra científica), va con su **fuente** en el código y su **prueba** con el valor conocido (skill `motor-city-ciencia`).
6. **Si algo falla en el celular**, anota el modelo y lo que pasó. Con `MC.Ocurrencias.exportar()` y `MC.GPU.perfil()` la IA del motor lo reproduce.

### 6. Comandos
| Comando | Qué hace |
|---|---|
| `node motor.mjs construir` | Arma el motor, los mundos y los juegos (`dist/`). |
| `node motor.mjs prueba --navegador` | Corre las 134 pruebas, también en Chromium. |
| `node motor.mjs exportar ID [--centro x,y --lado m]` | El mundo en glTF 2.0, alturas RAW 16 y escena JSON (Godot, Unity, Unreal, Blender, three.js). |
| `node motor.mjs capturas [--web]` | 14 fotos estándar de Mandados en `dist/capturas/` (revisión visual). |
| `node motor.mjs revisar-arte arte/ID` | Revisa un paquete de arte contra las reglas. |
| `node motor.mjs documento` | Arma `dist/MOTOR-CITY-TODO.md` (el documento único con anexos). |
| `node motor.mjs nuevo juego\|modulo nombre` | Crea un juego o un módulo desde su plantilla. |
| `node motor.mjs reporte "título" --juego X` | Deja el reporte de un cambio hecho desde otro juego. |
| `node motor.mjs sincronizar ../Juego` | Copia el motor a `Juego/motor-city/`. |
| `python3 geo/territorio.py …` | Craquea un lugar real. |

### Guardado por sectores

`MC.GuardadoSectores` guarda cambios JSON asociados a IDs estables y a sectores del mundo. La aplicación decide qué objetos crear o retirar cuando `actualizar` informa las claves que despiertan y duermen. Cada instantánea tiene `schema_version`, identificador del mundo y lado del sector en metros.

```js
const sectores = new MC.GuardadoSectores({ mundo: 'guatape', lado: 128 });
const id = MC.GuardadoSectores.id('guatape', 'valla', 'calle-27-valla-1');
sectores.cambiar(70, 20, id, { rota: true });
const actividad = sectores.actualizar(70, 20, 1);
sectores.guardar('mi-juego.sectores');
const vuelta = MC.GuardadoSectores.leer('mi-juego.sectores');
console.log(vuelta.obtener(70, 20, id));
```

`guardar` devuelve `false` si el almacenamiento falla. `leer` devuelve `null` si no existe el dato y lanza un error para datos inválidos o versiones futuras. Para migrar una versión previa se pasa a `leer` o `restaurar` un objeto de funciones por número de versión. Cada función recibe una copia y debe aumentar `schema_version` exactamente en uno. El administrador conserva cambios, mientras el juego debe conectar los eventos y aplicar los datos al despertar cada sector.


---

# ANEXO B. Contrato técnico (`MOTOR.md`)


**Versión 3.0.0 · 20‑nov‑2026.** Documento único con todo: `docs/DOCUMENTO-UNICO.md`. Fuente de verdad: `juanfeliperico369-stack/motorcity`. Copias: `motor-city/` de Juega EnCicla y de El Metro, con `herramientas/sincronizar.mjs`. Cómo se usa: `docs/MANUAL.md`.

**Qué es.** El motor de mundo abierto que convierte cualquier lugar real (Medellín, Guatapé, cualquier ciudad) o inventado (un valle, una isla, un planeta) en un mundo jugable con leyes reales:

- **un solo mundo**, en un solo archivo de datos (MC4);
- **un solo personaje** y **un registro de vehículos**;
- **todas las vistas**: cenital, pixel, ciudad 3D, maqueta 2:1, panorámica de perfil, tercera y primera persona, dron y cine;
- **las mismas reglas del mundo**: reloj, calendario, cielo, clima, tráfico, semáforos y transporte con horario;
- **Run en la ciclovía**.

Cada juego conserva lo suyo y solo pone su piel: formas de juego, apartados, arte, trama y huevos de pascua.

### 1. Reglas
1. **El mundo solo se cambia aquí.** Una corrección del mapa (una calle, un puente, un edificio o una estación) va en `motorcity`: en `geo/`, en `herramientas/fusionar.mjs` o en `ciudades/<id>.json`. Luego se sube la versión y se sincroniza.
2. **Cada cambio sube la versión** en `VERSION.json` (*semver*). Se copia a los juegos con `node herramientas/sincronizar.mjs ../BicicletasUno` (o `../MetroZero`), que lo deja en `motor-city/`. Con `--verificar` debe decir «los archivos son iguales».
3. **Lo de cada juego no entra al motor:** su trama, sus modos, sus menús y su arte final. El motor ofrece *hooks* (sección 6) y datos. Si un dato sale de las mismas fuentes, puede vivir en el motor para que todos lo usen.
4. **Un solo HTML por juego, sin internet ni librerías.** El motor es JavaScript puro con Canvas 2D y WebGL 1. Si falta WebGL, Canvas 2D es el respaldo.
5. **No romper guardados:** con `MC.guardado.completar(guardado, porDefecto)`, los campos nuevos llevan su valor por defecto.
6. **Fluido en un celular medio:** con la CPU 4× más lenta, la mediana del dibujo debe quedar por debajo de 40 ms (ver `node pruebas/prueba.mjs --navegador`). La calidad automática baja o sube el detalle.
7. **Español de Colombia, para todo público, sin datos personales.**
8. **Atribución siempre:**
   - © colaboradores de OpenStreetMap (ODbL), vía Overture Maps;
   - huellas de edificios de Overture (OSM, Microsoft y Google);
   - capas oficiales de Medellín: Catastro, malla vial y barrios;
   - relieve SRTM (NASA, AWS Terrain Tiles).
9. **Compatibilidad 1.x:** `js/valle.js` sigue siendo el lector 1.2.0 que incluye Juega EnCicla (sus pruebas exigen `Valle.version === '1.2.0'`). **No se edita.** Lo nuevo va en los fragmentos numerados.

### 2. Comandos
| Comando | Qué hace |
|---|---|
| `node motor.mjs mundo` | **F1**: junta los datos de EnCicla (`../BicicletasUno`) y de El Metro (`../MetroZero`) en `datos/<ciudad>/mundo.mc4` y `resumen.json`. |
| `node motor.mjs construir` | `dist/motor.js` (el motor), `dist/mundo-<ciudad>.js` (el mundo en base64) y `dist/motor-city.html` (el banco de pruebas jugable). |
| `node motor.mjs run` | Vuelve a importar Run Scooter de `../RunRunZero` a `run/run-scooter.js`, con sus parches comprobados. |
| `node motor.mjs prueba [--navegador]` | Las pruebas del motor: datos, consultas, redes, tiempo, transporte, tráfico, física y vehículos. Con `--navegador`, también las 8 vistas, Run y el rendimiento. |
| `node motor.mjs sincronizar RUTA [--verificar]` | Copia el motor a `RUTA/motor-city/`, o solo compara. |
| `node motor.mjs nuevo juego\|modulo nombre` | Crea un juego o un módulo desde su plantilla. |
| `node motor.mjs reporte "título" --juego X` | Reporte obligatorio de un cambio hecho desde otro juego. |
| `python3 geo/territorio.py --id x --bbox=…` | Craquea un lugar real (Overture + SRTM) a `datos/x/mundo.mc4` y `ciudades/x.json`. |
| `node motor.mjs fuentes \| encicla \| elmetro RUTA \| version` | La tubería 1.x de siempre (`geo/*.py`), que genera los datos que hoy leen los juegos. |

### 3. Coordenadas
- **Unidad:** metros del mapa, desde el origen de la ciudad (`lon0`, `latN`). `x` va hacia el oriente y `y` hacia el sur. La altura es la cota (m s. n. m.) más lo que se levanta.
- **Casilla:** `tile` m (10 en el valle). Casilla de un punto: `x / tile`. Las capas de celda van cada 8 casillas (80 m).
- **Grados:** `x = (lon − lon0) · kx` y `y = (latN − lat) · ky`, con `kx = 111320 · cos(lat_ref)` y `ky = 110574` m por grado.
- **Juega EnCicla dibuja en px:** 1 m = 1,6 px. `MC.ValleCompat.desdeMundo(mundo, 16)` le da las consultas 1.x en px.
- **El Metro dibuja en metros:** usa el mundo tal cual.

### 4. El mundo 2.0 (contenedor MC4)
```
'MC4\0' · u32 largo de la cabecera · cabecera JSON · capas (cada una en deflate crudo)
```
La cabecera trae `W`, `H`, `tile`, `lon0`, `latN`, `kx`, `ky`, `atribucion` y `capas: { nombre: { o, n, raw, tipo, sha1, … } }`. El cargador las infla **cuando alguien las pide**.

| Capa | Tipo | Qué es | Origen |
|---|---|---|---|
| `suelo` | u8 W×H | Tipo de casilla `TT` (pasto, monte, ladrillo, edificio, calle, avenida, andén, ciclorruta, agua, quebrada, plaza, puente, estación, pista, autopista, patio, escalas) | EnCicla `valle.bin` |
| `relieve` | i16 cada 80 m | Cota en metros (SRTM) | EnCicla |
| `municipio`, `comuna`, `barrio`, `pisos`, `lotes` | por celda de 80 m | Divisiones oficiales, pisos del edificio más alto y lote mediano | EnCicla + capas oficiales |
| `nivel` | i8 W×H | **Nivel firmado por casilla**: lo que pasa por encima (puente 1–2, viaducto 2–3) o por debajo (deprimido −1). 1 nivel = 4,5 m. | Puentes de El Metro + viaducto de EnCicla sobre los rieles reales |
| `vias` | VIAS3 | 35.746 vías con su curva, su clase, su nombre, su nomenclatura y su ancho | EnCicla `vias.bin` |
| `sitios` | SIT4 | 1.203 sitios y 5.314 edificios con su forma real (también con patio), y las partes de los emblemáticos (el Coltejer, la Biblioteca España…) | EnCicla `sitios.bin` |
| `edificios` | ED1 (regiones de 640 m) | **Las 639.457 huellas**, con su forma, orientación, pisos y uso | El Metro `edificios.js` |
| `pasos` | JSON | 2.193 puentes, deprimidos y tramos de viaducto como vectores: tipo, nivel, ancho, alto y si es peatonal | El Metro + EnCicla |
| `transporte` | JSON | 31 líneas (metro, tranvía, cables, Metroplús, alimentadores y futuras) con estaciones, eje real (rieles y corredores), andenes y datos; 133 estaciones EnCicla | El Metro `red.js`, `rieles.js`, `metroplus*.js`, `rutas_calles.js` + EnCicla |
| `lugares` | JSON | 45 lugares con postal (EnCicla) y 30 hitos con su huella y su altura (El Metro), enlazados | Los dos |
| `trafico` | JSON | 754 carriles con su sentido y 649 semáforos | EnCicla |
| `info` | JSON | Nombres (barrios, comunas, municipios, calles y sitios), el río, los parques y las líneas del dibujo de EnCicla | EnCicla |

**Las reglas de estilo de la ciudad** van aparte, en `ciudades/<id>.json`:

- la ventana, la casilla y la atribución;
- las **zonas de estilo** (ladera, centro, Laureles, El Poblado, mixto, pueblo, industria, campus y rural), con muros, techos, plancha, tanques, teja, árboles, densidad y pisos;
- la zona de cada comuna y de cada municipio;
- el horario del transporte y el clima del lugar.

### 5. El motor en el navegador (`dist/motor.js` → `MC`)
Se incluye con un `<script>` (o pegado en el HTML único) **antes** del código del juego. Solo publica `MC`, y `Valle`/`MotorValle` si no existían.

| Módulo | Archivo | Lo principal |
|---|---|---|
| Núcleo | `00-nucleo.js` | Utilidades (`clamp`, `h2`, `Azar`, colores); `MC.on/emit`; `MC.arte` (pieles); `MC.modulos`; `MC.huevos`; `MC.guardado` |
| Mundo | `10-mundo.js` | `await MC.Mundo.cargar(b64, ciudad)`: `suelo`, `cota`, `pendiente`, `normal`, `nivel`, `solido`, `superficie`, `esCiclovia`, `municipio`, `comuna`, `barrio`, `zona`, `estilo`, `lugarTexto`, `vias`, `viaCercana`, `calle`, `edificiosRegion`, `edificiosEn`, `edificioEn`, `sitios`, `pasos`, `pasosEn`, `transporte`, `lugares`, `hitos`, `lugarCercano`, `estacionCercana`, `enciclaCercana`, `buscar`, `geoAMetros`, `metrosAGeo` |
| Redes | `11-red.js` | `mundo.red('ciclo'\|'calles'\|'rueda'\|'peaton')`: grafo con nodos en los cruces; `cercana`, `opciones`, `continua`, `camino` (A\*), `componentes`. `MC.Trazo` (polilínea con `at`, `rumbo`, `curva` y `proyectar`). `MC.Recorrido` (camino sin fin que en cada cruce sigue la que continúa o la elegida). |
| Tiempo | `20-tiempo.js` | `MC.Reloj` (minutos del día y velocidad), `MC.Calendario` (festivos de Colombia, Ley Emiliani y fiestas), `MC.Cielo.en(fecha, hora, clima)` (colores, sol, luna, día y noche), `MC.Clima` (el mismo para todos a la misma hora; `forzar`) |
| Tráfico | `21-trafico.js` | `MC.Trafico`: carros, taxis amarillos, motos, busetas, camiones y ciclistas, con semáforos reales que nunca dan verde a las dos calles; peatones en los andenes |
| Transporte | `22-transporte.js` | `MC.Transporte`: metro, tranvía, Metroplús, alimentadores y cables, con **horario real**, deterministas (`vehiculos(fecha, seg, caja)`, `proximo(línea, estación, …)`) |
| Personaje | `30-personaje.js` | `MC.Personaje.aspecto()` y `azar()`; `pose(estado, fase, op)` (articulaciones en metros); dibujos de lado y cenital de la piel del motor |
| Vehículos | `31-vehiculos.js` | `MC.Vehiculos.registrar(def)` (hereda de `de`), `get`, `de(juego)`, `suelo`, `loma`. 35 vehículos: a pie, bici EnCicla, eléctrica, BMX, montaña, ruta, patinete, scooter, monopatín, monociclo, skate, longboard, patines, quad, triciclo, jetpack, moto, carro, taxi, camión, buseta, deportivo, fórmula, óvalo, drift, todoterreno, avioneta, avión, lancha, surf, metro, tranvía, cable y Metroplús |
| Física | `32-fisica.js` | `MC.Cuerpo`: suelo, pendiente real (las eléctricas no sufren), choques con lo sólido y con las huellas reales, puentes que se suben por sus extremos con baranda, deprimidos, saltos, vuelo y agua |
| Controles | `33-controles.js` | `MC.Controles(elemento, { alGesto })`: teclado, joystick virtual, gestos (pellizco, giro e inclinación) y gamepad; `leer()` una vez por cuadro |
| Cámara | `34-camara.js` | `MC.Camara`: la misma para todas las vistas; perfiles `primera`, `tercera`, `dron`, `cine` y `aerea`; `gesto`, `actualizar`, `aPantalla`, `aMundo` |
| Dibujo | `40-dibujo.js` | `MC.Losas`: losas de 160 m en caché. Llevan suelo suave con el sombreado del relieve, vías en vectores, canchas, piscinas, árboles por zona y techos reales. Son **el mismo mapa en todas las vistas**. |
| Vistas | `41`–`46` | `MC.Vistas(mundo)`: `usar(id)`, `siguiente()`, `pixel`, `dibujar(g, W, H, escena, dt)`, `calidad` (automática). Vistas: `cenital`, `ciudad3d`, `maqueta`, `pano`, `tercera`, `primera`, `dron` y `cine`. |
| Seguir la ruta | `47-seguir.js` | `MC.SeguirRuta(mundo, cuerpo)`: el cuerpo va solo por la vía real (panorámica, Run y paseo). Tiene `paso`, `avanzar`, `girar(±1)` y `cruceProximo()`. |
| Run | `50-run.js` | `MC.Run.puede(mundo, cuerpo)` y `MC.Run.entrar({ mundo, cuerpo, reloj, clima, aspecto, lienzo, capa, hud, alSalir })` |

**Módulos de la 2.1 y la 2.2:**

| Módulo | Archivo | Lo principal |
|---|---|---|
| Ciencia | `02-ciencia.js` | `MC.Ciencia`, `MC.Fis` (ISA, arrastre, sustentación, rodadura, choques, proyectiles), `MC.Termo` (rocío, índice de calor, sensación térmica), `MC.Quim` (masa molar, balanceo exacto, gases, pH, combustibles) |
| Economía | `03-economia.js` | `MC.Dinero` (centavos), `MC.Libro` (partida doble: `mover`, `saldo`, `cuadra`), `MC.Mercado`, `MC.Finanzas` |
| Escala | `04-escala.js` | `MC.Escala.MEDIDAS` (medidas reales), `validar()`, `pxPorMetro`, `escalaSprite`, `proporcion` |
| GPU virtual | `05-gpu.js` | `MC.GPU.perfil()` y `ajustes()`, `MC.ResDinamica`, `MC.Bucle` (paso fijo con interpolación), `MC.resorte` y `resorteAng` |
| Generador | `12-generador.js` | `MC.Generador.mundo({ semilla, tipo, ancho, alto, pueblos, lat })` |
| Cosmos | `13-cosmos.js` | `MC.Cosmos.estrella(u, g, n)`, `planeta(E, i)`, `mundoDe(P)`, `criaturaDe(P)`, `altura(semilla, x, y)` (relieve infinito) |
| Ambiente | `24-ambiente.js` | `MC.ClimaGlobal({ lat, alt })` (estaciones, nieve, niebla, calor), `MC.Ambiente.agarre`, `estacion`, `horasLuz` |
| IA | `25-ia.js` | `MC.IA` (utilidad, árboles de comportamiento, dirección de Reynolds, `vSegura`), `MC.Poblacion` (gente con rutinas) |
| Seres | `35-seres.js` | `MC.Seres.Persona` (biología y genética), `MC.Seres.Animal` (alometría, `criatura` con verosimilitud) |
| Taller | `36-taller.js` | `MC.Taller.disenar(ficha)` → desempeño real; `registrar`; carro con derrape |
| Manejo | `37-manejo.js` | `MC.Manejo.aplicar(entrada, cuerpo, { camara, esquema, vista, rumboVia, curvaAdelante })`, `curva`, `giroPorVelocidad`, `ESQUEMAS`, `rutaA` y `seguirRuta` (tocar para ir), `activarInclinacion` |
| Sprites | `38-sprites.js` | `MC.Sprites.atlas(id, { imagen, cuadros, anim, metros })`, `dibujar(g, 'atlas/nombre', x, y, pxm, { t, fase, rumbo, dir, pixel, respaldo })`, `nueve`, `hornear`, `comoArte` |
| Raster | `44-raster.js` | `new MC.Raster(mundo).dibujar(g, W, H, escena)`: la 3D por software |
| Interiores | `48-interiores.js` | `MC.Interiores.generar(edificio, { programa, estilo, semilla })`, `ESTILOS` (8), `CATALOGO` (22), `cabe`, `dibujar`; programas de casa, apartamento, comercio, oficina, iglesia, colegio, bodega, taller, tienda, centro comercial, biblioteca y restaurante |
| Mi casa | `49-hogar.js` | `MC.Direccion.leer(texto)` y `ubicar(mundo, texto)` (nomenclatura colombiana → edificio real); `MC.Hogar.desdeDireccion`, `plano`, `estilo`, `comprar`, `poner`, `mover`, `girar`, `quitar`, `guardar` |
| Música | `60-musica.js` | `MC.Musica.componer`, `tocar`, `adaptar`, `CLASICOS` |
| Interfaz | `70-interfaz.js` | `MC.UI.crear(raiz, { tema })`: `ficha`, `boton`, `barra`, `aviso` (en cola), `mision`, `dialogo`, `menu`, `minimapa`, `foco`, `cine`, `zonaLibre`; `MC.UI.verificar(ui)` |
| Mecánicas | `80-mecanicas.js` | `MC.Mision`, `MC.Inventario`, `MC.Carrera`, `MC.Logros`, `MC.Dialogo` |
| Lugares | `82-lugares.js` | `MC.Lugares.en`, `cerca`, `hacer(lugar, actividad, ctx)`, `interior`, `TIPOS`; `MC.Desgaste` (usar, reparar, mejorar, aplicar) |
| Ondas | `14-ondas.js` | `MC.Ondas.resolver({ ancho, alto, fichas, compat, fijos, semilla })` (WFC), `fachada(pisos, cols, semilla)`, `fachadaCache`; `MC.Autotile.mascara4`, `mascara8`, `esquinas`; `MC.RejillaIrregular.crear({ anillos, lado, semilla })` |
| Terreno | `15-terreno.js` | `MC.Terreno.agua(M)` (cuerpos de agua: mar, lago, río, quebrada; distancia a la orilla), `aguaEn(M, x, y)` (tipo y profundidad), `pendiente`, `en`, `paso(cuerpo, x, y)` (reglas por clase con motivo: vadear, nadar, barrancos, roca, monte, arena, nieve, borde), `sitioEn`, `arbolLosaEn`, `obstaculo`; `PEND_MAX`, `AGUA_MAX` |
| Naturaleza | `28-naturaleza.js` | `MC.Naturaleza.en(M, x0, y0, x1, y1)`: rocas, palmas, frailejones, arbustos y juncos con azar fijo por material, pendiente, altura y agua; `objeto(D, p)` (gancho de arte `naturaleza`) |
| Urbe | `26-urbe.js` | `new MC.Urbe(mundo, { libro, centro, caja, alCambiar })`: `zonificar(tipo, x, y, r, dens)`, `quitarZonas`, `servicio(tipo, x, y)`, `avanzar(meses)`, `demanda()`, `valorEn`, `campoEn`, `capa(nombre)` (→ `E.capaInfo`), `resumen`, `guardar`; `MC.ZONAS_URBE`, `MC.SERVICIOS_URBE` |
| Mobiliario | `27-mobiliario.js` | `MC.Mobiliario.en(mundo, x0, y0, x1, y1)`: postes, árboles, bancas, canecas, paraderos, hidrantes y cebras por vía (las vistas 2D lo dibujan solo; gancho de arte `prop`) |
| Sombras | `39-sombras.js` | `MC.Sombras.vector(cielo)`, `poligono`, `dibujar2D`, `contacto` y `luces` (las vistas 2D y el raster las usan solas) |
| Paisaje | `61-sonido.js` | `MC.Paisaje.plan(ctx)` (puro), `tocar`, `actualizar` y `parar` |
| Necesidades | `86-necesidades.js` | `MC.Necesidades` (`ANUNCIOS`, `urgencia`, `puntaje`, `ambiente(plano)`), `new MC.Habitante(plano, { semilla })` con `paso(dt, minPorSeg)`; `MC.Hogar.ambiente()` |
| Mundo (2.3) | `10-mundo.js` | `mundo.agregarEdificio({ x, y, hw, hd, ang, pis, clase })` y `quitarEdificio`; `vistas.losas.invalidar(x0, y0, x1, y1)` |
| Historias | `85-historias.js` | `MC.Historias` (storylets con pilares, `elegir`, `encargo`), `MC.Director` (ritmo y dificultad), `MC.Ocurrencias` (vigilar, rescatar, exportar) |

**La escena** que reciben las vistas: `{ mundo, camara, reloj, clima, cielo, transporte, jugador: { cuerpo, aspecto }, vehiculos, trafico, peatones, cables, pano: { trazo, s, id }, extras: [{ x, y, dibujar }], t }`. El banco de pruebas (`sandbox/10-juego.js`) es el ejemplo completo de un juego sobre el motor, en unas 150 líneas.

### 6. La piel de cada juego (hooks de arte)
```js
MC.arte.registrar('encicla', {
  suelo: [...17 colores por TT], via: { asfalto, anden, ciclo, … },
  personajeLado(g, pose, aspecto, x, y, pxPorMetro, dir) { … },   // panorámica, 3D oblicua y maqueta
  personajeArriba(g, pose, aspecto, x, y, pxPorMetro, rumbo) { … }, // cenital
  vehiculoLado(g, vehiculo, x, y, pxPorMetro, dir, cuerpo) { … },
  jugador(g, j, x, y, z, P, D) { … return true },                  // reemplaza todo el dibujo del jugador en 2D
  jugadorLado(g, j, x, y, esc, dir) { … return true }               // ídem en la panorámica
}).usar('encicla');
```
- Lo que el juego no traiga lo dibuja el motor.
- Los dibujos de lado reciben la **pose** del esqueleto único: un mismo personaje en todas las vistas, vestido por cada juego.
- Las zonas de estilo (`ciudades/<id>.json`) mandan en los colores de muros y techos. Un juego puede sobrescribirlas al cargar la ciudad.

### 7. Las vistas, una por una
- **Cenital:** losas, objetos encima y techos con sombra. Se gira con dos dedos.
- **Lateral (2.2):** la misma proyección inclinada de 1,2 a 1,47 rad. Muestra cielo arriba, el corte de la tierra abajo y una franja de calle con profundidad: una casa de muñecas, como *Little Nightmares*. Gira de a 90° con animación (`camara.girar90`), como *FEZ*. La ciudad 3D también se inclina con dos dedos hasta quedar de lado. Lo que tapa al jugador se vuelve transparente (rayos X).
- **Ciudad 3D:** la misma proyección inclinada. Los edificios se levantan con su huella y su altura reales, y tienen ventanas que se encienden de noche. Lleva puentes y viaducto con pilas, y vehículos con volumen.
- **Maqueta 2:1:** dimétrica (giro de 45° más múltiplos de 90°, aplastado 0,5 y altura 0,82), como la maqueta de El Metro.
- **Panorámica de perfil (cuidado especial).** Junta la de El Metro y la de EnCicla:
  - cielo por hora, con el sol y la luna donde de verdad están;
  - nubes, gallinazos, lluvia, niebla y rayos;
  - cordillera, cerros y laderas con barrios que se encienden de noche (densidad tomada de lo construido de verdad);
  - ciudad media y emblemáticos con su silueta (el Coltejer con su aguja);
  - viaducto y trenes reales, y cables con sus cabinas balanceándose;
  - fila de edificios del frente real, con su huella, su altura, su zona y sus ventanas;
  - cruces con su nombre, árboles, faroles, estaciones EnCicla y del metro;
  - tráfico y gente de perfil;
  - el jugador en cualquier vehículo y un primer plano real.

  El fondo se mira por un eje suavizado, así que las esquinas no hacen saltar las montañas. Funciona con el celular vertical y acostado.
- **Tercera y primera persona, dron y cine (WebGL):**
  - relieve real, con malla de 20 m cerca y de 240 m para las montañas del valle;
  - el suelo es la losa (texturas potencia de 2 con mipmaps y filtro anisótropo);
  - edificios, sitios, emblemáticos por partes, puentes, viaducto y árboles;
  - personaje con la misma pose, trenes, cabinas, tráfico y gente;
  - luz del sol por hora, niebla por clima y detalle por distancia.
- **Pixel:** cualquiera de las vistas, dibujada en un búfer de un tercio y agrandada sin suavizado.
- **Transición:** fundido de 0,55 s en el mismo punto.

### 8. Run en la ciclovía
- `run/run-scooter.js` es RunRunZero casi idéntico: motor WebGL, modelos, escena, reglas y audio. Lo arma `herramientas/importar-run.mjs`, con **12 parches con nombre y comprobados**:
  - relieve real en el sombreador (64 alturas);
  - curvas reales;
  - esquinas en los cruces reales: al doblar, se dobla en el mundo;
  - cielo y lluvia del mundo.
- `MC.Run.entrar(...)`:
  - solo en la ciclovía y con un vehículo que corra Run;
  - sigue la ciclorruta real y, en cada cruce, la que continúa (si se acaba, la calle);
  - las curvas fuertes giran la cámara;
  - se puede parar, ir a pie o correr, y cambiar de vehículo;
  - un metro del corredor son 0,5 m reales;
  - al salir, el cuerpo queda en el punto real donde iba, a la misma hora y con el mismo clima.
- Las metas y los retos de Run Scooter siguen andando: monedas, trucos, entregas, rivales y poderes.

### 9. Reglas del mundo (F5)
| Regla | Cómo funciona |
|---|---|
| **Reloj** | Un minuto de juego por segundo real (configurable). |
| **Calendario** | Festivos de Colombia con la Ley Emiliani (Pascua calculada) y fiestas de la ciudad. |
| **Cielo** | Colores por hora; sol y luna astronómicos para la latitud. |
| **Clima** | Bloques de 3 h con azar fijo por fecha, según la probabilidad del mes y la hora (temporadas de lluvia y aguaceros de la tarde). Es igual para todos a la misma hora. |
| **Transporte** | Lunes a sábado, de 4:30 a. m. a 11 p. m.; domingos y festivos, de 5 a. m. a 10 p. m. Frecuencias de hora pico y de valle; parada en cada estación. Las cabinas van cada 12 s. |
| **Tráfico** | Agentes alrededor del jugador. Semáforos de 60 s con fase fija por cruce; frenan en amarillo y en rojo, y guardan distancia. |
| **Huevos** | `MC.huevos.poner({ id, x, y, radio, hora, vehiculo, cond, juegos })`. El motor avisa con `MC.on('huevo')` una sola vez. |

### 9b. Física de niveles (2.2)
- **Superficies:** el terreno y los tableros (con su rampa) en cada punto.
- **Apoyo:** el cuerpo se apoya en la más alta que quede a un escalón (0,5 m a pie, 0,35 m con ruedas, más lo que avanza en el cuadro).
- **Pared:** lo que queda entre los pies y la cabeza no se atraviesa.
- **Por debajo:** lo que queda arriba de la cabeza se pasa por debajo.
- **Caída:** sin apoyo, cae con gravedad.
- **Barandas:** no dejan salir del tablero.
- **Deprimidos:** solo se entra por sus extremos.
- **Salto:** tiempo de coyote (0,12 s) y memoria del botón (0,14 s).

### 9c. El planeta, la búsqueda y los modelos (4.0)
- **`MC.Planeta`:**
  - `new MC.Planeta({ anillo, cargar: id => MC.Mundo.cargar(b64, cfg) })` arma el anillo de ciudades y carreteras;
  - `await P.mundo(id)` carga perezosa, con dos mundos en memoria como máximo;
  - `P.puertas(id).siguiente` da `{ x, y, a, nombre }`;
  - `P.cruce(id, x, y, dt)` da `{ a: idVecino }`;
  - `P.llegada(id, desde)` dice dónde aparece quien llega;
  - `P.restante(id, x, y)` sirve para el letrero;
  - `P.globo(g, W, H, { lon0, inclinacion, t, yo })` dibuja el planeta;
  - `Generador.carretera({ largo, biomas, semilla })` crea un tramo de la nada.
  - En la vista 3D, `E.curvatura = 1/(2R)` curva el horizonte.
- **`MC.Busqueda`:**
  - `new MC.Busqueda(M)`;
  - `B.alerta(gravedad, { testigos, visible, causa })` y `B.ponerNivel(n)`;
  - `B.banda(n)`, `B.esconder()`, `B.senuelo(x, y, s)`, `B.pulso(J)` y `B.disparar(J)`;
  - cada cuadro, `B.actualizar(dt, cuerpo, trafico)`, más `B.vehiculos()` (con `sirena` y `roto`) y `B.obstaculos()`;
  - `B.sacar()` entrega los eventos `nivel`, `embestida`, `disparo`, `herido`, `fuera`, `pinchado`, `bloqueo`, `puas`, `atrapado` y `perdidos`.
- **`MC.Modelos`:**
  - `MC.Modelos.registrar(id, glb | base64)` y `MC.Modelos.paquete(MC_MODELOS)`;
  - `malla.modelo(Mo, x, y, z, a, { largo | k, tinte, oscuro, dano: { f, b, l, r } })`, con las abolladuras por zona; de noche se encienden los faros y hay luz propia (`MC.Modelos.brillo`);
  - `MC.Modelos.vehiculo(v)` elige el modelo de un vehículo del tráfico;
  - `E.modelos3d = [{ id, x, y, a, k, clip }]` pone modelos en el mundo;
  - `MC.Modelos.posar(Mo, clip, t)` anima modelos con piel glTF, y `E.jugador.modelo` anima al jugador a pie.
- **Manejo de la IA (4.0.2):**
  - `MC.Manejo.pilotar(cuerpo, ruta, dt, { radio, turbo, mira })` mira adelante en la ruta, frena según la curva que viene y sale de los atascos (reversa o reacomodo hacia la calle);
  - devuelve `{ atascado }` cuando conviene volver a planear;
  - `MC.Manejo.rutaA` sigue la forma de la calle de punta a punta;
  - el carro con física (`ManejoCarro`) tiene reversa y vuelta en tres puntos.
- **Juegos con varios mundos:** en `juego.json`, `"mundos": ["nueva_york", "medellin", "guatape"]` y `"modelos": "arte/modelos/turno-cero"`. El juego lee `document.getElementById('mc4-' + id).textContent` y `MC_CIUDADES[id]`.

### 9d. Motores clásicos (4.1, `js/47-clasicos.js`)
Técnicas de motores viejos, livianos y potentes, rehechas desde cero (sala limpia). La investigación, las licencias y las fuentes están en `docs/INVESTIGACION-MOTORES-CLASICOS.md`.
- **Vistas nuevas** en `MC.VISTAS`:
  - `arcade` 🏁: la carretera pseudo-3D de OutRun sobre la vía real;
  - `vuelo` ⛰️: el Voxel Space de Comanche sobre el relieve y los edificios del MC4.

  En el banco: teclas `0` y `-`.
- **`MC.Arcade(M)`:**
  - `camino(x, y, a)` da los puntos `{x, y, z, w, u}` cada 6 m por la autopista o por la calle y sus empalmes; `u` fija las franjas al mundo;
  - `dibujar(g, W, H, E)`;
  - `aPantalla(x, y, z)`.
- **`MC.Pista` (5.4, `js/47-pista.js`): las carreras retro pseudo‑3D en circuitos** (MC.Arcade se queda para la calle real). Escrita desde cero con la técnica clásica de segmentos:
  - **la pista:** segmentos de 200 de largo con `p1` y `p2` (mundo, cámara y pantalla), curva, banda de color cada 3 segmentos, objetos, carros y `clip`; colinas cosenoidales y curvas acumuladas con fuerza centrífuga; dos circuitos (`palmas` y `regional`); `crearDe(def)` arma otros (las pruebas arman una loma);
  - **el dibujo**, `dibujar(g, W, H, S, op)`:
    - pasada 1, de cerca a lejos con `maxY`: recorta cada segmento contra lo ya pintado, guarda `seg.clip` y pone niebla en los últimos 45 segmentos;
    - las franjas se juntan por color y nivel de niebla: unos 40 rellenos por cuadro;
    - pasada 2, de lejos a cerca: objetos y rivales recortados contra `seg.clip`;
    - además: paralaje de 3 capas, el carro con 6 estados, la baranda continua, chispas, humo y el tablero;
  - **la carrera sin pantalla:**
    - `carrera(P, op)`, `paso(S, dt, ent)` (paso fijo de 1/120 s), `bot(S)` y `simular(id, op)`;
    - rebufo a menos de 15 segmentos, nitro (FOV de 100° a 116°) y rivales que cambian de carril sin saltos;
    - `perfil(P)` (curvas y alturas, para las pruebas) y `cieloDe(E)` (el cielo de `cieloRetro`);
  - **el juego completo:** `entrar({ circuito, lienzo, capa, vueltas, rivales, cielo, noche, alTerminar, alSalir })`, con controles táctiles en las esquinas. En vertical, el carro va encima de la fila de botones. Lo usa Turno Cero en «🏎️ Carreras retro» (`juegos/getaway/70-retro.js`).
- **`MC.VoxelSpace(M, { N, celda })`:**
  - `preparar(x, y)` arma, de una vez, la ventana N × N (suelo, relieve, agua, edificios y luz horneada);
  - durante el juego, la ventana nueva se arma por franjas (`_iniciar` y `_trabajar`) mientras se dibuja la anterior.
- **`MC.Sigilo`:**
  - `luz(M, x, y, { reloj, clima, fuentes })` da un valor de 0 a 1 con el sol, la sombra de los edificios, los postes de noche y los faros;
  - `gema(luz, { vel, agachado })`;
  - `alcance(base, vis, alerta)`;
  - `ruido(M, x, y, fuerza, { celda })` devuelve `{ camino(x, y), oye(x, y) }`. Es un Dijkstra que rodea los edificios.
- **`MC.DDA`:**
  - `recorrer(x0, y0, x1, y1, T, fn)` pasa por las casillas exactas del rayo;
  - `bloqueado(M, …)` dice si hay suelo sólido en el camino.
- **`MC.Semilla`:**
  - `desde(texto)`, `torcer()`, `siguiente()`, `nombre()`, `valor()` y `lugares(n)`;
  - son las semillas de Elite: nombres de veredas siempre iguales, sin guardar nada.

### 10. Hoja de ruta (lo que sigue)
- **2.1:** precalcular las redes en el MC4 (hoy `red('rueda')` tarda alrededor de 1 s al arrancar). Guardar el ancho y la nomenclatura de las ciclorrutas. Sumar `geo/pasos.py` (niveles firmados de Overture) y conectarlo al GPS de dos niveles.
- **2.2:** sombras del sol en WebGL. Agua animada del río. Ventanas con textura. Árboles por especie. Atlas del arte que entreguen Gemini y ChatGPT (`MC.arte`).
- **2.3:** Motor City (carreras), con la física de carro con derrape, motos, aviones y lanchas ya registrados (sección 5). Pistas de carrera sobre la red real y repeticiones.
- **3.0:** otra ciudad completa con la receta de `docs/CIUDADES.md`.

### Historial
| Versión | Fecha | Qué cambió |
|---|---|---|
| 1.0.0 | 18‑nov‑2026 | Una tubería con dos resoluciones, el exportador a El Metro, el sincronizador y el contrato (BicicletasUno). |
| 1.1.0 | 18/19‑nov‑2026 | Túneles y deprimidos; el lector `valle.js`; la fachada de El Metro. |
| 1.2.0 | 19‑nov‑2026 | Une las dos 1.1.0 con la fuente de verdad en BicicletasUno. |
| **3.0.0** | 20‑nov‑2026 | **Un solo mundo 3D, varias cámaras:**<ul><li>`js/45-gl3d.js`: `Malla.triF/quadF/esfera/cil/cajaF/arbol3d/edificio3d/carro3d/persona3d`;</li><li>`CAM_PERFIL` `cenital`, `oblicua` y `maqueta` (`fijo`, `pitchCerca`, `yaw45`) y `Camara._aereo`, `persecucion`, `pantalla`, evento `zoomTope`;</li><li>`VISTAS` aéreas `tipo:'gl'` con `respaldo` 2D; `Vistas.gl3d()`, `efectiva()` y `aPantalla(E, x, y, z)`;</li><li>radio y niebla por cámara y rayos X del jugador en `VistaGL`;</li><li>`ui.abrirMapa(vistas, M, puntos, yo)`;</li><li>`js/32-objetos.js`: `MC.Objetos` (`poner`, `sembrar`, `actualizar`, `malla`, `dibujar2D`) y evento `golpe`.</li></ul>2.11: `MC.DensidadLienzo`, capa de suelo de `Vista2D` y `Estilo._imprimirGPU/_imprimirCPU` medidos. |
| **2.10.0** | 20‑nov‑2026 | <ul><li>`MC.Publico` (`js/92-publico.js`: `piloto(perfil, op)`, `informe(medidas)`, `lista()`, `PERFILES`) y `herramientas/publico.mjs`.</li><li>`Red.caminoEntre(inicios, metas)`; `Manejo.rutaA` sale por el extremo que conviene.</li><li>`Estilo._imprimirGPU`, `_filtros()` y `_umbral()`: cómic y 1 bit sin leer la pantalla, con tramado anclado al desplazamiento del mundo.</li><li>Respaldo de `toSorted`, `toReversed` y `Promise.withResolvers` en `00-nucleo.js`.</li><li>`herramientas/aligerar_arte.py` y `herramientas/skills-externas.mjs` (`node motor.mjs skills`).</li><li>Mandados: `MANDADOS.piloto`.</li></ul> |
| **2.9.0** | 20‑nov‑2026 | Unión de la 2.8 (Claude) con la 2.7.1 de Codex:<ul><li>`arte/chatgpt/` y `vehiculoArriba` en las pieles;</li><li>`textura` en las losas y `Vista2D.charcos`;</li><li>la capa `agua` en el MC4 (`herramientas/precalcular-agua.mjs`);</li><li>el estilo `unbit` (`Estilo.imprimir`, `ruidoAzul`);</li><li>la caché de fachadas en la maqueta;</li><li>`js/90-three.js` y `adaptadores/godot` y `adaptadores/three`.</li></ul>Los faros también salen con el vehículo de piel, y la cubierta sobre columnas pasa por la caché. 132 pruebas. |
| **2.8.0** | 20‑nov‑2026 | **De la entrega maestra de referencias** (`docs/referencias/`):<ul><li>`MC.Vida`: `palomas` y evento `fauna`, `marcas` (huellas por superficie), `suelo(E, x, y)`, `piso(D)` y `emitir` escalado por `MC.opciones.particulas`;</li><li>`MC.opciones` (`sacudida` y `particulas`; `Camara.sacudir` lo respeta);</li><li>`Vista2D.faros` y las luces de freno del jugador;</li><li>los estilos `vintage` (`tinte`, `final: 'vineta'`), `crt` (`final: 'crt'`) y `termica` (`gradiente`);</li><li>`js/90-telemetria.js` (`MC.Telemetria`: `registro`, `percentil`, `resumen`, `linea`);</li><li>`js/91-contratos.js` (`MC.Contratos.validar`) y `schemas/` (escena, puente y entidad, `schema_version: 1`);</li><li>`schema_version` en `Exportar.escena` y `Puente.instantanea`.</li></ul>125 pruebas. |
| **2.7.0** | 20‑nov‑2026 | **Estilos gráficos:** `js/16-estilos.js` (`MC.Estilo`: `p`, `rgb`, `col`, `luz`, `trama`, `final`, `lineas`, `lista`; `MC.ESTILOS_GRAF` con 8 estilos de datos; paletas de dominio público en `PAL_DP`). Las losas, los muros, los techos, las sombras (`MC.Sombras` usa `estilo.sombra`), el cielo lateral y los árboles (`Arboleda._copaEstilo`, un horneado por estilo) pasan por el estilo. **Vida:** `js/88-vida.js` (`MC.Vida.emitir`, `onomatopeya`, `impacto`, `dibujar`; bandadas, aterrizaje con `_squash` y evento `aterriza`, frenazos y agua) y `MC.Bucle` con `MC._pausaImpacto` (hitstop). El vehículo cabecea con `C._acel` y las copas se mecen de cerca (`E.viento`). **Exportar:** `js/89-exportar.js` (`MC.Exportar.glb`, `escena`, `alturas`, `r16`; `MC.Puente.instantanea`, `aGltf`) y `node motor.mjs exportar`. 123 pruebas. |
| **2.6.0** | 20‑nov‑2026 | **Estilo realista familiar:** `MC.estilo` (`'realista'` o `'clasico'`, en la clave de las losas). `js/29-arboleda.js` (`MC.Arboleda.en`, `dePie`, `arriba`, `sombras`, `mip`, `precalentar`; 6 especies, sprites horneados con mipmaps y copia nocturna; los mismos árboles que `Terreno.arbolLosaEn`). Las losas llevan una bandera `2` (sin árboles: van de pie desde z ≥ 3,2, o 4,2 con calidad < 0,9) y la sombra bajo la copa horneada. `MC.Rudeza` (grano, baldosa, `asfalto(g, v, res)`, `techo`, paleta). Humedad en la base de los muros desde z > 3,5. Gancho de arte `arbol(g, t, vista, x, y, pxm, D)` y parte `arbol` en `MC.Pieles` (`arboles: false` deja fuera los árboles del paquete). `node motor.mjs capturas` y `revisar-arte`. 119 pruebas. |
| **2.5.1** | 19‑nov‑2026 | **Arte de Gemini integrado:** `js/87-pieles.js` (`MC.Pieles.instalar(id, paquete, { partes, pixel, usar })`, `MC.Pieles.icono`, `MC.Pieles.faltan`). La construcción compila `arte/<id>/` dentro del HTML con `"arte": ["<id>"]` en `juego.json`, y suelto en `dist/arte/<id>.js`. Las capas de `MC.Urbe` traen `titulo` y `leyenda`, y hay `ui.leyenda`. **Jugable en el celular:**<ul><li>`ui.joystick(ctl, op)` y `ui.pintarJoystick()`: joystick visible que sigue al dedo, con guía «Arrastra para moverte»;</li><li>`ui.accion({ id, icono, texto, mantener, ctl, al })`: botones redondos para el pulgar, que al mantenerse alimentan `ctl.boton`;</li><li>`ui.barraVisible`;</li><li>`MC.UI.indicador(g, W, H, sx, sy, op)`: el pin o la flecha al objetivo, con `op.rect` para no tapar la interfaz;</li><li>`ui.mision` con el título en una línea y el detalle en dos;</li><li>marca del jugador en las vistas 2D (`E.marcaJugador`);</li><li>`Losas`: resolución hasta 6 y presupuesto de píxeles.</li></ul>Mandados: cámara de unos 45 m en el lado corto, modo libre (todo gratis, 34 vehículos), menú Vista y menú Ajustes, tutorial, y el primer mandado cerca. 118 pruebas. |
| **2.5.0** | 19‑nov‑2026 | **Entrar al agua:** `cuerpo.bajarse`, `montar` y `puedeMontar` (vehículo parqueado en la orilla, también solo al empujar hacia lo hondo), nado con **buceo** y **aire** (`buceando`, `aire`, `pulmones`, evento `sinAire`), poses `nada` y `bucea`, `embarcar` y `desembarcar` (lancha), `Terreno.aguaHonda` y `tierraFirme`. Tono bajo el agua, burbujas y vehículo parqueado en las vistas. 117 pruebas. |
| **2.4.0** | 19‑nov‑2026 | Terreno y límites verosímiles: agua por tipo y profundidad (vadear, nadar; lancha con calado), pendiente máxima fuera de las vías, roca, monte, arena y nieve por vehículo, obstáculos reales (emblemáticos, árboles de las losas, mobiliario, rocas, tráfico y gente) y edificios también sobre la calle si uno se mete de verdad. Naturaleza. Lagos por llenado de prioridad en el generador y mar a nivel 0. Agua por profundidad, espuma y roca de acantilado en las losas; brillos del agua; vadear y nadar visibles. 115 pruebas. |
| **2.3.0** | 19‑nov‑2026 | Lo aprendido de SimCity, Los Sims, Cities: Skylines y Townscaper: sombras del sol por hora (2D y raster), mobiliario urbano y luces de noche, fachadas por reglas (WFC), `MC.Urbe` (zonas, demanda RCI, valor del suelo, servicios, contaminación, crecimiento, niveles, recursos, presupuesto y capas de datos), objetos inteligentes y `MC.Habitante`, `MC.Ondas`, `MC.Autotile`, `MC.RejillaIrregular` y `MC.Paisaje`. Ganchos de arte `prop`, `fachadaModulo` y `mueble`. Documento único. 109 pruebas. |
| **2.2.0** | 19‑nov‑2026 | GPU virtual (perfil, resolución dinámica, bucle de paso fijo y raster 3D por software). Física de niveles por superficies. Cámara con resortes, brazo con choque, FOV por velocidad y trauma. **Vista lateral.** Manejo (curvas, esquemas y asistencias), sprites, escala real, interfaz por zonas, interiores con 8 estilos y catálogo, **Mi casa** desde la dirección, lugares jugables y desgaste, historias con director, ocurrencias y cosmos. 103 pruebas. |
| **2.1.0** | 19‑nov‑2026 | Nombre: solo «Motor City» (carpeta `motor-city/`). Ciencia, economía, generador de mundos, territorios (`geo/territorio.py`), clima global, seres, taller, IA y población, interiores, música, interfaz y mecánicas. Minijuego Mandados, plantillas, reportes y skills. 80 pruebas. |
| **2.0.0** | 19‑nov‑2026 | **Motor City.** La fuente de verdad pasa a `motorcity`.<br>• Mundo 2.0 en un solo archivo (MC4), con todas las huellas, sitios, pasos con nivel, transporte, lugares y tráfico.<br>• El motor en el navegador: personaje, vehículos, física, controles, cámara, 8 vistas más pixel, panorámica de perfil, WebGL, reglas del mundo y Run en la ciclovía.<br>• Banco de pruebas jugable y 54 pruebas.<br>• La tubería 1.x sigue igual (y ya lee cualquier ventana de ciudad). |
| **5.3.2** | 24‑nov‑2026 | **Mundos saneados** (renacimiento cenital, Fase 2): `geo/territorio.py` con la ley de soberanía vial del Motor del Valle 1.3 (regla A; las casas de OSM conservan el andén de las calles menores, no el asfalto; puentes, túneles y vías cubiertas con su nivel en `VIASJ[5]`, que el cargador lee como `via.nivel`); Medellín, Guatapé y Nueva York regenerados con su agua y su PVS; la colisión con edificios sin la tolerancia de 1 m sobre la calle (`js/32-fisica.js`); prueba `pruebas/calles-libres.mjs`. |
| **5.4.0** | 25‑nov‑2026 | **Carreras retro** (renacimiento cenital, Fase 4): `MC.Pista` (`js/47-pista.js`), las carreras pseudo‑3D por segmentos en circuitos, escritas desde cero (dos pasadas con `maxY` y `seg.clip`, niebla, franjas juntas por color, paralaje de 3 capas, el carro con 6 estados, rebufo, nitro, rivales con IA de carril, HUD, minimapa y controles táctiles; circuitos `palmas` y `regional`; `simular`, `bot` y `perfil` para las pruebas). En Turno Cero, «🏎️ Carreras retro» (`juegos/getaway/70-retro.js`). Prueba `pruebas/pista-retro.mjs`. |


---

# ANEXO C. Contexto para la IA que retome (`CONTEXTO-IA.md`)


> **4.0 (20‑nov‑2026):** `MC.Planeta` (ciudades y carreteras en un anillo), `MC.Busqueda` (búsqueda 0–5), `MC.Modelos` (lector GLB) y el juego adulto *Turno Cero* (`juegos/getaway/`, canon de Codex en tres ciudades). Lee `docs/TURNO-CERO.md` y `TAREAS-IA.md` § 4.0.

> **Léelo completo antes de tocar nada.** Si se te acaba el contexto, este documento, `MOTOR.md` y `BITACORA.md` bastan para seguir.
> Lo escribió Claude (Claude Code) el 19‑nov‑2026, a pedido del autor (OneZero). La 2.0 sigue el *Plan del Mundo Abierto*; la 2.1 y la 2.2, los pedidos que vinieron después (ver §3b).
> Ese plan está en `docs/PLAN-MUNDO-ABIERTO.md` de BicicletasUno, rama `ccr-bed2d98a-uho2kr`.

### 1. La misión en una frase
**Motor City** convierte cualquier lugar real (o inventado) en un mundo jugable con leyes reales, para Juega EnCicla, El Metro y los juegos que vienen. Cada juego conserva su forma de juego, su arte y su trama, y solo pone su piel. El nombre es solo «Motor City»: nada de «del Valle».

**La visión del autor, a largo plazo:**
- ***Motor City***: un juego de carreras en mundo abierto, al estilo GTA, Forza Horizon y Need for Speed. Carros, motos, aviones, tuneo, carreras callejeras, NASCAR y F1, con una trama ruda pero simpática y estilo EnCicla. Gráficos 2D y pixel con vista cenital 3D y cámaras cambiantes.
- ***Extremo***: deportes extremos (downhill, BMX, skate, parkour, surf, lanchas…), con estética más realista.

El motor debe quedar como **terreno fértil** para esas semillas. Ver `docs/VISION-MOTOR-CITY.md`.

### 2. Los cuatro repositorios
| Repo | Qué es | Rama de trabajo de esta sesión | Notas |
|---|---|---|---|
| `juanfeliperico369-stack/motorcity` | **El motor (fuente de verdad desde la 2.0)** | `claude/motor-city-engine-xu7p4y` | Este repo. |
| `juanfeliperico369-stack/BicicletasUno` | Juega EnCicla v2.0.1 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-bed2d98a-uho2kr`) | Ignorar `revolucion-v2`. Al publicar en `gh-pages`, **conservar `/metro/`**. APK con `versionCode` > 20003. Sus pruebas: `node tests/run.js` (97 ✓). |
| `juanfeliperico369-stack/MetroZero` | El Metro v2.0.0 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-2a67f935-oat714` + `main`) | **Seguir su `CLAUDE.md`** (protocolo de 7 pasos). Sus pruebas: `node tools/test.mjs 100` (0 errores). |
| `juanfeliperico369-stack/RunRunZero` | Run Scooter v2.5.0 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-cbc7f0af-0306uo`) | Juego propio. **No depende del motor**: el motor lo importa (`node motor.mjs run`). Es WebGL propio, no Canvas 2D como decía el plan. |

**Cada juego tiene su propia IA.** Si tocas un juego, deja escrito qué cambiaste en su bitácora y en `docs/CONTEXTO-MOTOR-CITY.md` de ese repo. No hagas PR si no te lo piden y no subas llaves (*keystores*).

### 3. Lo que quedó hecho (2.0.0)
| Fase del plan | Estado | Dónde |
|---|---|---|
| **F1 · Mundo construido en un solo archivo** | ✅ | `herramientas/fusionar.mjs` → `datos/medellin/mundo.mc4` (16 capas, 6 MB; ver `MOTOR.md` §4). Cargador `js/10-mundo.js`. |
| **F2 · Personaje, vehículos, cámara, física y controles** | ✅ | `js/30` a `js/34`. |
| **F3 · Vistas** | ✅ | `js/40` a `js/46`:<br>• cenital, ciudad 3D y maqueta 2:1 (una sola proyección);<br>• **panorámica de perfil** (`43-panoramica.js`);<br>• WebGL de tercera y primera persona, dron y cine (`45-gl.js`);<br>• gestor con pixel, transición y calidad automática (`46-vistas.js`). |
| **F4 · Run en la ciclovía** | ✅ | `herramientas/importar-run.mjs` (12 parches) → `run/run-scooter.js`. El envoltorio es `js/50-run.js` y la ruta real la da `js/47-seguir.js`. |
| **F5 · Mismas reglas del mundo** | ✅ | `js/20-tiempo.js`, `21-trafico.js`, `22-transporte.js`, y los huevos en `00-nucleo.js`. |
| Banco de pruebas | ✅ | `sandbox/` → `dist/motor-city.html`. |
| Pruebas del motor | ✅ | `node pruebas/prueba.mjs --navegador`: 54 pruebas. |
| Sincronización | ✅ | `herramientas/sincronizar.mjs` y `sincronizar.mjs` (el atajo). Copia el paquete a `<juego>/motor-city/` (desde la 2.1; `motor-valle/` queda como estaba en cada juego hasta que su IA migre). |
| Migración de los juegos al mundo 2.0 | ⏳ **Le toca a la IA de cada juego** | Las guías son `docs/MIGRACION-ENCICLA.md` y `docs/MIGRACION-ELMETRO.md`. |
| Arte y auditoría de Gemini y ChatGPT | ⏳ **Pedido** | `docs/PETICION-GEMINI.md` y `docs/PETICION-CHATGPT.md`. Cada uno entrega un solo documento; el autor se lo pasa a la IA del motor para unirlo y mejorarlo. |

**Cifras medidas** (Chromium sin GPU, CPU 4× más lenta, 412 × 860): mediana del dibujo en cenital 4,1 ms, ciudad 3D 8,6 ms, maqueta 17,8 ms y panorámica 7,3 ms. La vista WebGL en SwiftShader (por software) da 70–90 ms; con GPU real debe ser mucho menor, pero **hay que medirla en un celular**.

### 3b. Lo que se hizo en la 2.1 y la 2.2
| Pedido del autor | Estado | Dónde |
|---|---|---|
| Crear gráficos, craquear territorios y crear mundos nuevos | ✅ | `geo/territorio.py` (Guatapé de ejemplo), `MC.Generador`, `MC.Cosmos` (planetas, semillas en jerarquía como No Man's Sky) |
| Física, química, economía y matemáticas fieles | ✅ | `02-ciencia`, `03-economia`, `04-escala` (medidas reales), `36-taller`, con pruebas de valores conocidos |
| Personajes con biología; animales y alienígenas | ✅ | `35-seres` (Mifflin, Froude, Kleiber, genética, cuadrado‑cubo) |
| Vehículos | ✅ | 35 en el registro + `MC.Taller` (diseñar con ingeniería) + `MC.Desgaste` (reparar y mejorar) |
| Mundo vivo (NPC, día y noche, estaciones, tormenta, nieve, calor, niebla, tráfico) | ✅ | `24-ambiente`, `25-ia` (`MC.Poblacion` con rutinas) |
| Interiores procedurales distintos entre sí | ✅ | `48-interiores`: 8 estilos, cuartos opcionales, decoración y catálogo de 22 muebles |
| **La casa del jugador por su dirección**, y diseñarla | ✅ | `49-hogar` (`MC.Direccion` lee la nomenclatura colombiana y la ubica en el mapa real, sin internet; `MC.Hogar` diseña) |
| Talleres, tiendas, centros comerciales, bibliotecas y parques | ✅ | `82-lugares` |
| Historias procedurales: diversión, reflexión y conciencia | ✅ | `85-historias` (storylets, director de ritmo, encargos) |
| Ocurrencias (lo imprevisto) y retroalimentación | ✅ | `MC.Ocurrencias` |
| Solución a la tarjeta gráfica | ✅ | `05-gpu` (perfil, resolución dinámica, paso fijo) y `44-raster` (3D por software) |
| Puentes y dimensiones complicadas; cámara; vista lateral | ✅ | `32-fisica` (superficies, coyote), `34-camara` (resortes, brazo con choque, FOV y trauma), vista `lateral` (casa de muñecas que gira de a 90°) |
| Sprites, interfaz que no estorba, controles y sensibilidad | ✅ | `38-sprites`, `70-interfaz` (zonas, atenuación, cola, `verificar`), `37-manejo` |
| Música (electrónica, rock, jazz, lo‑fi y clásicos) | ✅ | `60-musica` |
| Minijuego, HTML y link web | ✅ | `juegos/mandados` → `dist/juegos/mandados.html` · <https://juanfeliperico369-stack.github.io/motorcity/> (Pages sirve `main`) |
| Documentos | ✅ | `docs/MANUAL.md`, `GUIA.md`, `INVESTIGACION.md`, `OPTIMIZACION.md`, `PLAN-IAS.md`, `PETICION-*.md` y `NEGOCIO-Y-USOS.md` |
| Repo abierto a las IAs de los juegos, con reportes | ✅ | `CONTRIBUIR.md`, `AGENTS.md`, `reportes/`, `node motor.mjs reporte` |
| **2.3 · SimCity, Los Sims, Cities: Skylines y Townscaper** | ✅ | `39-sombras` (sol por hora), `27-mobiliario` (props y luces), fachadas WFC (`14-ondas`), `26-urbe` (ciudad y capas de datos), `86-necesidades` (objetos inteligentes), `61-sonido` (paisaje sonoro). Mandados con modo alcalde. |
| **2.4 · Montañas, rocas, agua (lagos, ríos, playa, mar) y límites de paso** | ✅ | `15-terreno` (agua, pendiente, reglas de paso, obstáculos), `28-naturaleza`, lagos en `12-generador`, agua y roca en `40-dibujo`; `MC.Cuerpo` vadea, nada y dice por qué no pasa |
| **2.5 · Entrar al agua** | ✅ | `MC.Cuerpo`: `bajarse`, `montar`, `_nadar` (buceo y aire), `embarcar` y `desembarcar`; poses `nada` y `bucea`; tono bajo el agua (`Vistas._bajoAgua`) |
| **Un solo documento con todo** | ✅ | `docs/DOCUMENTO-UNICO.md` (contexto, código a usar y plan de cada IA) y `dist/MOTOR-CITY-TODO.md` (con anexos; `node motor.mjs documento`) |

### 4. Decisiones que no hay que deshacer sin motivo
1. **El mundo 2.0 junta los datos ya generados** por los dos juegos, que comparten el mismo origen. Así no hacen falta los 190 MB de fuentes ni Python para tener el mundo. La tubería `geo/` sigue para regenerar desde cero (y ya acepta otra ciudad con `CIUDAD=ciudades/x.json`).
2. **Todo en metros** desde el origen de la ciudad. EnCicla convierte con 1 m = 1,6 px (`MC.ValleCompat.desdeMundo(m, 16)`).
3. **`js/valle.js` no se toca:** es el lector 1.2.0 que incluye EnCicla, y sus pruebas exigen esa versión. `construir.mjs` solo empaqueta los fragmentos numerados.
4. **Las losas (160 m) son el mismo mapa en todas las vistas.** También son el piso de WebGL.
5. **La panorámica mira el fondo por un eje suavizado** que pasa por el jugador. Si se usa el rumbo de cada punto, las montañas saltan en las esquinas.
6. **Run importa RunRunZero casi idéntico con parches comprobados.** Si RunRunZero cambia y un parche no calza, el importador lo dice y no escribe nada. No se copian su interfaz ni su guardado.
7. **Una sola red (`rueda`)** para el tráfico, la panorámica y Run, filtrando por tipo de vía.
8. **Determinismo compartido:** el clima, los trenes y los semáforos salen de la fecha y la hora. Dos juegos abiertos a la misma hora ven lo mismo.
9. **Privacidad de Mi casa:** la dirección se resuelve en el aparato contra las calles del mapa. Solo se guarda si el jugador marca «recordar», y nunca va en reportes (`Ocurrencias.exportar` redondea posiciones a 50 m).
10. **El arte nuevo entra por `MC.Sprites` con respaldo:** si falta un cuadro, se dibuja el procedural y se anota en `MC.Sprites.faltan`.
11. **Pages sirve la rama `main`** del repo (con `.nojekyll` e `index.html` de portada). Lo que se quiera en la web debe llegar a `main`.

### 5. Lo que falta o se puede mejorar (en orden de valor; el plan completo está en `docs/PLAN-IAS.md`)
1. **Que cada juego use el motor 2.0** (sus IAs, con las guías de migración). EnCicla debe recuperar y mejorar su panorámica con la de este motor; El Metro conserva su `23-lado.js` y puede pasarse a esta.
2. **Medir en un celular real** la vista 3D en WebGL y el arranque. Hoy `red('rueda')` tarda alrededor de 1 s (45.000 aristas), así que conviene precalcularla en el MC4 (2.1).
3. **Run con el arte de cada juego.** Hoy las zonas y los letreros son los de Orbe, la ciudad de Run Scooter (los temas `THEMES`/`ZONES`). Hay que mapearlos a las zonas reales (`mundo.zona`) y darle a `RUNV.cielo` y a la paleta de la vía la piel de EnCicla o de El Metro. Las esquinas ya muestran los nombres reales en el HUD.
4. **Panorámica:**
   - estaciones del metro con su dibujo de El Metro (`SisSpr`/`Art`) en vez de las bandas actuales;
   - deprimidos (el camino que baja con sus muros);
   - más mobiliario por zona.
5. **WebGL:** sombras, agua, texturas de fachada, árboles por especie y la cabina del metro como vista (de El Metro).
6. **Otra ciudad** de prueba con `docs/CIUDADES.md`, para demostrar que el motor «craquea» cualquier ciudad.
7. **Integrar lo que entreguen Gemini y ChatGPT** (sprites, paletas, auditoría).
8. ~~Publicar en GitHub Pages~~ Hecho: <https://juanfeliperico369-stack.github.io/motorcity/>.
9. **2.3:**
   - unir lo que entreguen Gemini (sprites, muebles por estilo, lugares) y ChatGPT (auditoría, storylets, accesibilidad);
   - vista frontal de la casa en la lateral;
   - redes precalculadas;
   - losas en un *Worker*.

### 6. Cómo comprobar que todo está bien
```bash
cd motorcity
node motor.mjs mundo && node motor.mjs run && node motor.mjs construir
node motor.mjs prueba --navegador                 # debe decir «✓ TODAS LAS PRUEBAS PASARON · 134 bien»
node motor.mjs sincronizar ../BicicletasUno --verificar   # «los archivos son iguales»
node motor.mjs sincronizar ../MetroZero --verificar
cd ../BicicletasUno && node tools/build.js && node tests/run.js      # «✓ TODAS LAS PRUEBAS PASARON»
cd ../MetroZero && node tools/build.mjs && node tools/test.mjs 100   # «RESULTADO: OK, 0 errores»
```
Capturas: `dist/motor-city.html` en Chromium con `--use-gl=swiftshader` (ver `pruebas/prueba.mjs`).

### 7. Trampas conocidas
- Los atributos `hidden` necesitan `[hidden]{display:none!important}` si el CSS pone `display`.
- `hex3()` acepta `#rgb`, `#rrggbb` y `rgba(...)`; `tono()` depende de él.
- Las capas de `valle.json` van en cuartos de casilla (×2,5 m); las de `alturas.json` y `sitios.bin`, en octavos (×1,25 m); `vias.bin`, en `tile / vq`. El Metro va en metros. **Todo eso ya está convertido en el MC4.**
- En `Mundo`, `meta.kx` está en **casillas** por grado; `mundo.kx`, en **metros** por grado.
- Run Scooter: un metro del corredor son `MC.Run.ESC` = 0,5 m reales. `RUNV.ponHill` reemplaza `HILL`, y el sombreador lee `uHR[64]`.
- La panorámica con pixel ajusta su escala; las etiquetas no se dibujan en el búfer del pixel.
- **Nombres repetidos en el cierre único:** todos los `js/NN-*.js` comparten un solo ámbito. Antes de declarar `const ESTILOS` o `const ACTIVIDADES`, busca si ya existe (pasó con la música y con los lugares).
- La vista lateral recorta la caja visible a una franja de profundidad (`E._franja`): sin eso, con `k` cerca de 0, la caja se va al infinito.
- `MC.Vistas.motor3d`: `'auto'` usa el raster si el WebGL es por software (SwiftShader en las pruebas); `'gl'` lo fuerza; `'raster'` también.
- **El agua se analiza una vez por mundo** (`MC.Terreno.agua`, 0,3–1 s). Los juegos la llaman al cargar; si no, la primera vez que alguien toca agua se nota un tirón.
- **Sobre la vía** el edificio solo bloquea si uno se mete más de 1 m en su huella (los datos se solapan con la calle), y la pendiente no bloquea. Fuera de la vía, sí.
- **Comentarios `//` en líneas largas de una sola instrucción** cortan el resto de la línea: usa `/* … */` dentro del código.
- En las pruebas de Node no hay `document`: `MC.GPU.perfil()` da `'sin-pantalla'` y `MC.UI.crear` devuelve `null`.


---

# ANEXO D. Guía (`docs/GUIA.md`)


> **Para el autor y para cualquier IA o persona que llegue.** Está escrita para leerse de corrido.
> Lo técnico al detalle está en `MOTOR.md` (el contrato) y el estado y las trampas en `CONTEXTO-IA.md`.

### 1. Qué es, en una frase
**Motor City es un motor de videojuegos de mundo abierto, en JavaScript puro, que convierte cualquier territorio real (o uno inventado) en un mundo jugable con leyes reales.** Encima de ese mundo, cada juego pone su piel, su trama y sus mecánicas.

Las leyes reales son de física, química, biología, clima, economía, tráfico y transporte.

Funciona en **un solo archivo HTML, sin internet ni librerías**: en el celular, en el computador, como app (APK) o en una página web.

### 2. Cómo está hecho (las capas)
```
        ┌───────────────────────── JUEGOS ─────────────────────────┐
        │ Juega EnCicla · El Metro · Run Scooter · Mandados · Motor City · Extremo │  ← su piel, su trama, sus modos
        └──────────────────────────────────────────────────────────────┘
   PIEZAS DE JUEGO   misiones · inventario · carreras · logros · diálogos · interfaz (MC.UI) · música (MC.Musica)
   MUNDO VIVO        reloj y calendario · cielo · clima global y estaciones · tráfico y semáforos · transporte con
                     horario · población con rutinas (IA) · animales · huevos de pascua
   SERES Y MÁQUINAS  personaje único (pose) · biología (persona, genética, animales, criaturas) · vehículos
                     (registro + taller de ingeniería) · física del cuerpo y del carro · controles · cámara
   VISTAS            cenital · ciudad 3D · maqueta 2:1 · panorámica de perfil · 3.ª y 1.ª persona · dron · cine
                     · pixel en todas · interiores · minimapa · calidad automática
   MUNDO (MC4)       suelo · relieve · divisiones · niveles · vías · edificios · sitios · pasos · transporte ·
                     lugares · tráfico  ←  craqueado de datos abiertos  o  generado por semilla
   CIENCIA           unidades SI · geometría · ruido · integradores · estadística · física · termodinámica ·
                     química · economía y finanzas
```
**Cada capa solo usa las de abajo.** Por eso un juego nuevo arranca con todo lo de abajo ya hecho.

### 3. El mundo: real o inventado, en un solo archivo
- **El formato MC4** es una cabecera más capas comprimidas que se abren cuando se piden:
  - el **suelo** por casilla (pasto, monte, calle, ciclorruta, agua, arena, nieve, roca…);
  - el **relieve**;
  - el municipio, la comuna y el barrio;
  - el **nivel firmado** de puentes, viaducto y deprimidos;
  - las **vías** con nombre;
  - las **edificaciones**, con su huella, pisos y uso;
  - los **sitios y emblemáticos**;
  - el **transporte** y los **lugares**.
- **Craquear un territorio real:** `geo/territorio.py`.
  - Le das un rectángulo de longitud y latitud. Baja de **Overture Maps** (OpenStreetMap, más las huellas de edificios de Microsoft y Google) las calles, el agua, los usos del suelo, los edificios y los lugares, y de **SRTM** el relieve.
  - Arma el mundo en segundos. **Guatapé** (4,8 × 3,6 km, 2.661 edificios, el embalse y el Peñol) salió en unos 20 s y pesa 0,19 MB.
- **Medellín** (43 × 49 km, 639.457 edificios, metro, cables y Metroplús) salió de juntar lo que ya tenían EnCicla y El Metro (`herramientas/fusionar.mjs`). Pesa 6 MB.
- **Inventar un mundo:** `MC.Generador.mundo({ semilla, tipo })`. Sus pasos:
  1. relieve con ruido y una forma: isla, valle, costa, montaña o llanura;
  2. ríos que bajan por la pendiente;
  3. biomas por temperatura y humedad;
  4. pueblos en lo plano junto al agua, con cuadrícula, plaza, iglesia y casas;
  5. carreteras con A\* que evitan las pendientes, con puentes;
  6. nombres, un mirador y un cable al cerro más alto.

  **La misma semilla da el mismo mundo.**
- **Las reglas de estilo** de cada lugar (colores de muros y techos, plancha, tanques, árboles, densidad, pisos, clima y horarios) están en `ciudades/<id>.json`, y salen de **mirar el lugar desde arriba**.

### 4. Las vistas: el mismo mapa en todas las dimensiones gráficas
- **Las losas:** pedazos de 160 m del mapa que se pintan una vez, con el suelo suave, el sombreado del relieve, las calles con su ancho real, el agua, las canchas, los árboles y los techos. Las usan todas las vistas. Por eso **se siente el mismo mapa** en cenital, en 3D o en la maqueta. También son el piso de la 3D.
- **Las vistas 2D** (cenital, ciudad 3D y maqueta 2:1) son una sola proyección con tres ajustes: giro, inclinación y altura.
- **La panorámica de perfil** es la vista con «cuidado especial»:
  - cielo con el sol y la luna reales;
  - montañas en capas con barrios que se encienden de noche;
  - la fila real de edificios;
  - emblemáticos en silueta;
  - viaducto y trenes reales;
  - cruces con su nombre;
  - tráfico y gente de perfil.
- **La 3D en WebGL** (tercera y primera persona, dron y cine) lleva el relieve real, los edificios levantados, la luz del sol por hora y niebla por clima. Si el aparato no tiene WebGL, cae a la ciudad 3D en Canvas.
- **Pixel:** cualquier vista dibujada pequeña y agrandada sin suavizado. Una tecla y todo es pixel art.
- **Interiores:** cualquier edificio se abre por dentro, con un plano según su uso (la casa paisa con su patio, el apartamento, el local, la oficina, la iglesia, el colegio, la bodega), puertas que conectan todo, ventanas y muebles con medidas reales.
- **Calidad automática:** mide cuánto tarda cada cuadro y sube o baja el detalle. Con la CPU 4× más lenta las vistas 2D quedan entre 4 y 18 ms.

### 5. Los seres y las máquinas (con ciencia de verdad)
- **Personaje único:** un esqueleto con poses (quieto, caminar, correr, pedalear, impulsarse, patinar, ir en tabla, sentado, saltar). Cada juego lo viste a su manera y se ve igual en todas las vistas.
- **Persona con biología:**

  | Aspecto | Cómo se calcula |
  |---|---|
  | Proporciones | Antropometría según la edad |
  | Paso y carrera | Número de Froude |
  | Metabolismo | Mifflin‑St Jeor |
  | Gasto | METs por actividad |
  | Pulso | Tanaka |
  | Potencia al pedalear | W/kg según el estado físico |
  | Estado del cuerpo | Energía, hidratación y temperatura según el clima |

  Su **genética mendeliana** (piel poligénica, ojos, pelo, rizo, estatura) le da hijos con los genes de los padres.
- **Animales con alometría real:** metabolismo (Kleiber), velocidad máxima (Hirt 2017), pulso, longevidad y marcha (paso, trote o galope). Hay especies del valle: perro criollo, gallinazo, colibrí, iguana, zarigüeya, ardilla…
- **Criaturas inventadas:** patas, segmentos, alas y ojos, con una prueba de **verosimilitud** por la ley cuadrado‑cubo con la gravedad del planeta.
- **Vehículos:**
  - un registro con 35 (bicis, patinetes, motos, carros, avionetas, lanchas, metro, cable…);
  - un **taller de ingeniería**: con masa, potencia, aerodinámica, llantas y combustible calcula la velocidad máxima, el 0–100, la frenada, el consumo, la autonomía, el CO₂, la velocidad de pérdida de un avión y la velocidad de casco de una lancha;
  - el carro se maneja con un **modelo de bicicleta de dos ejes**: derrapa cuando las llantas se rinden y la lluvia o la nieve le quitan agarre.

### 6. El mundo vivo
| Sistema | Qué hace |
|---|---|
| **Reloj y calendario** | Festivos de Colombia (Ley Emiliani) y fiestas de la ciudad. |
| **Cielo** | Colores por hora; sol y luna astronómicos. |
| **Clima global** | Para cualquier latitud y altura: estaciones por hemisferio, lluvia, tormenta eléctrica, granizo, **nieve que se acumula y se derrite**, **niebla cuando el aire llega al punto de rocío**, **olas de calor**, viento, índice de calor y sensación térmica. Es **el mismo para todos a la misma hora**. |
| **Tráfico** | Carros, taxis amarillos, motos, busetas y ciclistas con semáforos reales. |
| **Transporte** | Metro, tranvía, cables y Metroplús con **horario real** (deterministas). |
| **Población con rutinas** (IA de utilidad) | Cada persona tiene casa y trabajo en edificios reales y necesidades (energía, hambre, ganas de salir). Madruga, va a trabajar por las calles, almuerza, sale a la plaza y vuelve a casa. Lo lejano se simula «en grueso». |
| **IA** | Utilidad, árboles de comportamiento, dirección (buscar, huir, llegar, deambular, separarse) y **pilotos con física**, que frenan antes de cada curva a la velocidad segura √(μg/κ). |

### 7. Economía, mecánicas, interfaz y música
- **Economía exacta:**
  - dinero en centavos (enteros) y **libro de partida doble**: siempre cuadra y nadie crea plata de la nada;
  - mercados con oferta y demanda (equilibrio y ajuste en el tiempo), interés, inflación, préstamos, VPN y TIR;
  - salarios con recargo nocturno.
- **Mecánicas listas:** misiones con pasos, tiempo y premio; inventario con masa real (lo que cargas te frena); carreras por calles reales con rivales; logros; diálogos.
- **Interfaz integrada** (`MC.UI`):
  - temas por juego (Motor City, EnCicla, El Metro, Run Scooter);
  - fichas, barras, botones grandes y accesibles;
  - menús, diálogos, avisos, panel de misión y minimapa.
- **Música procedural** (`MC.Musica`), sin un solo archivo de audio:
  - estilos: electrónica, techno, synthwave, rock, jazz, lo‑fi y clásica;
  - **siete clásicos de dominio público** reharmonizados en cada estilo: Beethoven, Petzold/Bach, Pachelbel, Satie, Grieg y Vivaldi;
  - se **adapta** a la velocidad, la hora, el clima y la tensión del juego.

### 8. Cómo lo usas tú (el autor)
- **Para jugar y mostrar:** abre `dist/juegos/mandados.html` (el minijuego) o `dist/motor-city.html` (Medellín completo). También están en la web: ver el README.
- **Para pedir un juego nuevo a una IA:** dile que lea `AGENTS.md` y corra `node motor.mjs nuevo juego nombre`. Con las skills y la plantilla, en minutos tiene un juego andando sobre el mundo que elija.
- **Para tener un lugar nuevo:**
  1. Dale a una IA (o corre tú) `python3 geo/territorio.py --id mi-pueblo --bbox=…` con el rectángulo de longitud y latitud. Se sacan de cualquier mapa.
  2. Cambia `"mundo"` en `juego.json` y vuelve a construir.
- **Para inventar mundos:** `MC.Generador.mundo({ semilla, tipo })` dentro del juego. En Mandados es el botón «Mundo nuevo».

### 9. Qué se hizo para crearlo (resumen honesto)
1. **Revisión de los tres juegos:** se compilaron, se probaron y se jugaron. De ahí se tomó lo mejor de cada uno:
   - de EnCicla, sus datos a 10 m, los sitios y la panorámica de plataformas;
   - de El Metro, todas las huellas, los puentes, los rieles, la vista lateral y el WebGL;
   - de Run Scooter, el corredor completo.
2. **2.0:**
   - el mundo en un solo archivo y las redes de calles;
   - el tiempo, el clima, el transporte y el tráfico;
   - el personaje, los vehículos, la física, los controles y la cámara;
   - 8 vistas más pixel, la panorámica y la 3D;
   - Run en la ciclovía, el banco de pruebas y 54 pruebas;
   - la sincronización a los juegos.
3. **2.1:**
   - nombre: solo «Motor City»;
   - nuevos módulos: ciencia (física, química con balanceo exacto, termodinámica), economía, generador de mundos, craqueo de territorios, clima global con estaciones y nieve, biología (personas, genética, animales y criaturas), taller de vehículos con manejo de carro, IA y población con rutinas, interiores, música, interfaz y mecánicas;
   - el **minijuego Mandados**;
   - las herramientas para hacer juegos y módulos con plantillas;
   - los reportes de cambios, las skills del proyecto y 80 pruebas.

### 10. Lo que no es (todavía)
- La 3D es «low‑poly» (cajas y prismas), no realista. Para *Extremo* hacen falta sombras, materiales y animación de personaje más fina (ver `docs/SIGUIENTES-PASOS.md`).
- El craqueo de territorios deja la ciudad muy bien de calles, edificios y agua, pero **sin transporte ni emblemáticos modelados**. Eso se agrega a mano o con más fuentes (GTFS, modelos de los edificios famosos).
- La música es de sintetizador (chiptune elegante, no orquesta). Se puede mejorar con instrumentos muestreados si se acepta que el HTML pese más.

### 11. Lo nuevo de la 2.2
- **GPU virtual:** el motor mide el aparato, baja la resolución antes que los cuadros y, si no hay WebGL o es lento, dibuja la 3D por software (`MC.Raster`).
- **Vista lateral:** la ciudad de lado, como una casa de muñecas, que gira de a 90° como FEZ. Lo que tapa al jugador se vuelve transparente.
- **Puentes y niveles bien resueltos:** superficies, rampas, pasar por debajo y tiempo de coyote. **Cámara con resortes** que no atraviesa edificios.
- **Mi casa:** tu dirección real → tu casa en el juego, que diseñas con muebles reales (sin internet; la dirección no sale del celular).
- **Lugares jugables:** talleres, tiendas, restaurantes, centros comerciales, bibliotecas y parques. **Historias** con diversión, reflexión y conciencia, y un **director de ritmo**.
- **Ocurrencias:** lo imprevisto se corrige solo y se anota. **Cosmos:** planetas con leyes reales.
- **Manejo** con curvas y asistencias, **sprites**, **escala real** e **interfaz** que no tapa el centro.
- **Más documentos:** el manual (`docs/MANUAL.md`), la investigación (`docs/INVESTIGACION.md`), la optimización (`docs/OPTIMIZACION.md`) y el plan de cada IA (`docs/PLAN-IAS.md`).


---

# ANEXO E. Investigación (`docs/INVESTIGACION.md`)


> Cada idea dice **de dónde viene**, **qué enseña** y **dónde quedó en el motor** (módulo `MC.*`).
> Las fuentes están al final. Donde una fuente no confirma un detalle técnico, se dice.

### 1. Vistas y dimensiones: un mismo mundo, muchas formas de mirarlo
| Juego | Qué hace | Qué se tomó para Motor City |
|---|---|---|
| **FEZ** (Polytron, 2012) | El mundo es 3D, pero el jugador lo ve desde 4 lados en 2D y gira de a 90°. Lo que parece lejos en un lado queda pegado en otro. Primero se juega en 2D puro y después se presenta el giro. | Vista **lateral** (`lateral`): la ciudad real vista de lado, con giros animados de a 90° (`camara.girar90`). La maqueta 2:1 también gira de a 90°. |
| **Monument Valley** (ustwo, 2014) | Proyección **ortográfica** (sin perspectiva): las ilusiones de geometría imposible solo funcionan así y desde ciertos ángulos. Diseño de «menos juego, más experiencia». | Las vistas 2D del motor son ortográficas (una sola proyección con giro, aplastamiento y altura: `Vista2D.parametros`). La maqueta 2:1 (dimétrica) sirve para puzles de perspectiva. |
| **Little Nightmares** (Tarsier) | Mundo 3D con cámara de lado y fija que se desplaza: efecto de **casa de muñecas**. Movimiento completo en profundidad, aunque juzgar la profundidad cuesta. | La vista lateral corta la ciudad como una casa de muñecas: cielo arriba, **corte de la tierra** abajo y una franja de calle con profundidad. Para el problema de la profundidad: **rayos X**, porque lo que tapa al jugador se vuelve transparente. |
| **GTA, Forza Horizon, Need for Speed** | Cámara de persecución con resorte, campo visual que se abre con la velocidad, cámara que esquiva paredes y vistas que se cambian con un botón. | `MC.Camara`: **resortes críticamente amortiguados**, **brazo con choque** (no atraviesa edificios ni cerros, ni se mete en el tablero de un puente), **FOV según la velocidad** y **sacudida por trauma** en los choques. |
| **Juegos de pixel art y cenitales** | Píxeles enteros, sin suavizado y con escala fija por metro. | Pixel en todas las vistas (búfer pequeño agrandado) y `MC.Escala.pxPorMetro(…, entero)`. |

**Regla del motor:** el mundo es uno solo, en metros. Las vistas son maneras de proyectarlo; ninguna tiene datos propios. Por eso un juego puede pasar de cenital a lateral, a 3D o a pixel sin perder nada.

### 2. Física y lógica: que se sienta justo
- **Controlador de personaje por superficies** (la técnica de los motores grandes):
  - en cada punto hay varias superficies: el terreno y los tableros de puentes con sus rampas;
  - el cuerpo se apoya en la más alta que quede a un **escalón** de los pies;
  - lo que queda **entre los pies y la cabeza es pared**, y lo que queda arriba de la cabeza **se pasa por debajo**;
  - si el apoyo desaparece, el cuerpo **cae**.

  Así se resuelven puentes, viaducto, deprimidos y cualquier «dimensión complicada» (`MC.Cuerpo.superficies`). Se probó en 5 puentes reales de Medellín: el carro sube a 4,5 m por la rampa y el peatón pasa por debajo.
- **Tiempo de coyote y memoria del salto** (los plataformeros modernos, como *Celeste*):
  - se puede saltar un instante después de dejar el borde;
  - si se oprime un poco antes de caer, el salto sale al tocar el piso.

  El jugador siente que el juego «le entiende».
- **Paso fijo con interpolación** («Fix Your Timestep!», Glenn Fiedler; *Game Programming Patterns*):
  - la física avanza siempre en pasos de 1/60 s, igual en cualquier aparato;
  - el dibujo interpola;
  - hay un tope para no entrar en la «espiral de la muerte».

  Está en `MC.Bucle`.
- **Física con números reales** donde importa:
  - velocidad segura en curva v = √(μg/κ);
  - frenada con agarre según el clima;
  - ley cuadrado‑cubo para criaturas;
  - gravedad g = GM/R² en otros planetas.

### 3. Mundos procedurales: la lección de No Man's Sky
- **Una semilla define un planeta entero.** Lo que no se guarda se vuelve a calcular igual. La generación es continua y por etapas: forma del terreno, superficie, texturas, población y simulación (charla de Hello Games en la GDC 2017, «Continuous World Generation in No Man's Sky»).
- **Jerarquía de semillas** (universo → galaxia → sistema → planeta → región → objeto) y **ruido continuo sin bordes**: cualquier región se genera en cualquier orden y empata con sus vecinas.
- **En Motor City:**
  - `MC.Cosmos` crea estrellas con abundancias reales (muchas enanas rojas) y luminosidad L ≈ M^3,5;
  - crea planetas con órbitas de Kepler, gravedad, temperatura de equilibrio con invernadero y atmósfera retenida o perdida;
  - del planeta salen el mundo jugable (`MC.Generador`) y criaturas verosímiles a esa gravedad;
  - `Cosmos.altura(semilla, x, y)` es un relieve **infinito y continuo** (fractal con crestas y deformación de dominio).

  Nota: los detalles internos del «uber noise» de No Man's Sky no están confirmados en las fuentes revisadas; el motor usa la técnica conocida equivalente.

### 4. Historia y trama: diversión, reflexión y conciencia
- **Storylets** (Failbetter Games; Emily Short, «Storylets: You Want Them»): piezas de historia con **condición, contenido y efecto**. Un gestor elige la más **saliente** para el momento («salience-based narrative»). Se combinan sin escribir un árbol gigante.
- **Director de ritmo** («AI Director» de *Left 4 Dead*, Valve): mide la intensidad y alterna **tensión y respiro**. Después de un pico siempre hay calma.
- **Flujo** (Csikszentmihalyi): reto ajustado a la habilidad; ni aburrido ni frustrado. Se logra con **dificultad dinámica**.
- **En Motor City** (`MC.Historias`):
  - storylets con tres pilares:
    - **diversión**: retos, un perro que te adopta, tesoros;
    - **reflexión**: la señora que recuerda la quebrada, el atardecer, la lluvia bajo un alero, un dilema con una billetera;
    - **conciencia**: frenar con lluvia, el agua con calor, la altura, la cultura metro;
  - un director que pide respiro después de los picos y propone retos si todo está quieto mucho rato;
  - **encargos procedurales**: personaje + necesidad + lugar real + obstáculo + recompensa + dilema + lección real (`DATOS_REALES`, verificables).
- **Reglas de escritura** (para que haya peso real sin sermones):
  - **Mostrar, no explicar.** El mundo cuenta: el tronco con un año grabado, la ciudad que se enciende.
  - **Elecciones con consecuencias pequeñas pero visibles:** el perro te sigue, la reputación sube.
  - **Aprender jugando:** la lección llega en el momento en que sirve (lluvia + bici = frenada), en una línea.
  - **Silencio y contemplación:** momentos sin misión, con música baja (el atardecer). *Monument Valley* y *Journey* lo enseñan: la atmósfera es narrativa.

### 5. Ocurrencias: lo que nadie previó
- Los mundos abiertos fallan en los bordes:
  - quedar atascado o caer bajo el piso;
  - salir del mapa o números rotos (NaN);
  - plata que aparece de la nada.
- Los grandes estudios usan **invariantes** (cosas que siempre deben ser ciertas), **recuperación automática** (volver al último punto seguro), un botón de **«sácame de aquí»** y **telemetría** para saber dónde pasa.
- **Emergencia buena:** *Zelda: Breath of the Wild* (su «motor químico»), los *immersive sims* y *Dwarf Fortress* dejan que reglas simples produzcan historias que nadie escribió. Hay que **verlas** para aprender de ellas.
- **En Motor City** (`MC.Ocurrencias`):
  - vigila números inválidos, fuera del mundo, bajo el piso, velocidad imposible, atrapado, atascado, libro descuadrado, cuadros lentos y errores;
  - **corrige solo** y **anota**;
  - anota también los **«momentos»**: récords de velocidad y saltos enormes;
  - `exportar()` da un reporte sin datos personales (posiciones redondeadas a 50 m) para mejorar el motor.

### 6. Interfaz, psicología y neurociencia
| Principio | De dónde viene | Cómo quedó |
|---|---|---|
| **El centro es del juego** | Diseño de HUD en juegos de acción; *The Gamer's Brain* (Celia Hodent): la atención es limitada. | `ui.zonaLibre()`; `MC.UI.verificar` prueba que nada la tape (en las pruebas del navegador). Las etiquetas no se montan ni tapan el centro. |
| **Arriba se informa, abajo se actúa** | Ley de Fitts: lo que se toca debe estar grande y cerca del pulgar. | Información arriba a la izquierda, en columna. Movimiento abajo a la izquierda. Acciones a la derecha. Botones de 48 px o más. |
| **Lo que no cambia se atenúa** | Interfaz mínima de *Zelda BotW* y *Destiny*. | Las fichas se atenúan a los 5 s y vuelven al cambiar. **Foco** al ir rápido; **cine** sin nada. |
| **Pocas opciones a la vez** | Ley de Hick: más opciones = más tiempo para decidir. | Menús cortos y botones contextuales (Taller, Tienda y Entrar solo aparecen cuando sirven). |
| **Un aviso a la vez** | Carga cognitiva. | Avisos en cola, cortos, sin robar el control. |
| **Competencia, autonomía y relación** | Teoría de la autodeterminación (Ryan, Rigby y Przybylski, 2006): lo que hace que un juego enganche sanamente. | Competencia: retos con flujo. Autonomía: mundo abierto, casa propia y estilos. Relación: gente con rutinas, perro y historias. |
| **Recompensa que sorprende** | Error de predicción de recompensa y dopamina (Schultz, 1997). | Momentos y storylets inesperados, tesoros y huevos de pascua. **Sin trampas** (nada de cajas de botín ni presión de compra): los juegos son para todo público. |
| **Tareas abiertas** | Efecto Zeigarnik: lo inconcluso se recuerda. | Misión visible arriba con tiempo y distancia. |
| **Buen final** | Regla pico‑final (Kahneman): se recuerda el mejor momento y el último. | Cada entrega cierra con un premio claro. El atardecer cierra el día. |
| **Se aprende jugando** | Tutoriales integrados (*Portal*, *Mario*); la primera parte de FEZ es 2D puro. | Ayuda de una línea al cambiar de control (`ESQUEMAS.ayuda`). Las lecciones llegan cuando sirven. |
| **Accesible** | Pautas de accesibilidad en juegos. | Etiquetas aria, contraste alto, «reducir movimiento», teclado, dedo y mando. |

### 7. Controles y sensibilidad
- **Zona muerta radial** (que el dedo o el mando no «derive») y **respuesta exponencial** (lo pequeño es preciso y lo grande es rápido): el estándar de los juegos de mando.
- **Giro según la velocidad** (como la dirección asistida y los juegos de carreras): a 100 km/h el mismo gesto gira menos.
- **Asistencias** que se apagan:
  - frenar antes de la curva;
  - «imán de calle»;
  - acelerar solo.
- **Esquemas:** joystick flotante o fijo, volante y pedales, **tocar para ir** (camino A* por las calles), **inclinar el celular**, **un pulgar** y **carriles**.
- Todo está en `MC.Manejo`.

### 8. Sprites y arte
- **Atlas** (una imagen con muchos cuadros): menos cambios de textura y dibujo más rápido. Es el estándar desde los juegos de 8 bits hasta Unity y Godot.
- **Animación por fase:** los pies del sprite van al ritmo del paso real.
- **4 u 8 direcciones** para cenital e isométrico.
- **9‑slice** para marcos de interfaz.
- **Fondo magenta** que se vuelve transparente (la regla de las IAs de arte de El Metro).
- **Hornear** lo procedural a un atlas al arrancar.
- **Respaldo:** si el arte no está, el motor dibuja el suyo y anota qué falta.
- Todo está en `MC.Sprites`.

### 9. Los motores más grandes y qué juegos hicieron con ellos
| Motor | Juegos conocidos | Lección para Motor City |
|---|---|---|
| **id Tech** (id Software) | *Doom*, *Quake* | Rendimiento ante todo y herramientas para la comunidad (mods). |
| **Unreal Engine** (Epic) | *Unreal*, *Gears of War*, *Fortnite*; *Little Nightmares II* (según la entrevista de Epic) | Editor visual y *blueprints*: hacer juegos sin ser experto. Aquí: plantillas, skills y `node motor.mjs nuevo`. |
| **Unity** | *Monument Valley*, *Hollow Knight*, *Cuphead*, *Genshin Impact* | Un núcleo pequeño, componentes y una tienda de piezas. Aquí: módulos `MC.*` registrables y pieles de arte. |
| **Source** (Valve) | *Half‑Life 2*, *Portal*, *Left 4 Dead* | Física como jugabilidad e IA director. |
| **RAGE** (Rockstar) | *GTA IV*, *GTA V*, *Red Dead Redemption* | Ciudad viva: gente con rutinas, tráfico y clima. |
| **ForzaTech** (Playground y Turn 10) | *Forza Horizon*, *Forza Motorsport* | Manejo con física real y asistencias graduables. |
| **Frostbite** (EA DICE) | *Battlefield*, *Need for Speed* recientes | Destrucción y luz. |
| **Motor propio de Hello Games** | *No Man's Sky* | Todo desde una semilla. |
| **Godot** (código abierto) | Muchos juegos independientes | Libre, liviano y comunidad. Modelo de licencia a estudiar. |
| **XNA/FNA y motores propios pequeños** | *FEZ* (Trixel), *Celeste* | Un motor pequeño y hecho a la medida del juego puede ser mejor que uno enorme. |
| **Motores web** (Phaser, PixiJS, Three.js) | Juegos de navegador | Un solo HTML que anda en todo: la apuesta de Motor City. |

**La conclusión:** los motores que ganan no son los que más hacen, sino los que **dejan crear rápido sin romper nada**: buenas herramientas, piezas que se conectan, pruebas y una comunidad que aporta. Por eso Motor City tiene:
- plantillas y skills;
- reportes de cambios de las IAs de cada juego;
- más de 100 pruebas;
- reglas de no romper guardados ni la API.

### 10. Ciudades: SimCity, Los Sims, Cities: Skylines y Townscaper (2.3)
| Juego | Qué enseña | Dónde quedó |
|---|---|---|
| **SimCity** (y su motor GlassBox de 2013) | Capas de datos (valor del suelo, contaminación, deseabilidad). Desde 2013, recursos llevados por agentes. | `MC.Urbe` (campos y recursos con capacidad) y capas de datos encima de las vistas. |
| **Cities: Skylines** | Zonas junto a las calles, lotes mirando a la vía, demanda RCI, niveles por valor del suelo y servicios, *props* y *decals*. La 2 enseña que sin LOD y con sombras caras el rendimiento se cae. | `MC.Urbe`, `MC.Mobiliario` y sombras baratas en caché. |
| **Los Sims** | Personas simples y objetos inteligentes que anuncian qué necesidad satisfacen; ambiente del cuarto. | `MC.Necesidades`, `MC.Habitante` y `Hogar.ambiente()`. |
| **Townscaper** | Rejilla irregular, reglas locales (WFC), módulos por esquina, paleta suave y sombras de contacto. | `MC.Ondas`, `MC.Autotile`, `MC.RejillaIrregular`, fachadas por reglas y oclusión de contacto. |

El detalle, el código y lo que falta están en `docs/DOCUMENTO-UNICO.md`, §6.

### Fuentes
- *Fez (video game)*, Wikipedia. Game Developer, «The dimensions of Fez».
- Hello Games, «Continuous World Generation in No Man's Sky» (Innes McKendrick, GDC 2017), GDC Vault. Sean Murray, «Building Worlds Using Math(s)» (GDC 2017).
- ustwo, Ken Wong: «Designing Monument Valley: Less Game, More Experience» (GDC Europe 2014) y «The Art of Monument Valley» (GDC 2015). Cobertura de Pocket Gamer de la GDC 2014.
- Game Developer, «Crafting the bizarre, off-kilter gameworld of *Little Nightmares*». Unreal Engine, entrevista «How *Little Nightmares II* plumbs the depths of adolescent angst».
- Emily Short, «Storylets: You Want Them» (2019) y «Beyond Branching: Quality-Based, Salience-Based, and Waypoint Narrative Structures» (2016).
- Michael Booth (Valve), «The AI Systems of Left 4 Dead» (AIIDE 2009).
- Glenn Fiedler, «Fix Your Timestep!». Robert Nystrom, *Game Programming Patterns* (capítulo «Game Loop»).
- Itay Keren, «Scroll Back: The Theory and Practice of Cameras in Side-Scrollers» (GDC 2015). Squirrel Eiserloh, «Math for Game Programmers: Juicing Your Cameras With Math» (GDC 2016).
- Celia Hodent, *The Gamer's Brain* (2017). Ryan, Rigby y Przybylski, «The Motivational Pull of Video Games» (2006). Schultz, Dayan y Montague, «A Neural Substrate of Prediction and Reward» (1997). Csikszentmihalyi, *Flow* (1990).
- Nintendo, «Breaking Conventions with *The Legend of Zelda: Breath of the Wild*» (GDC 2017).
- **SimCity:**
  - Game Developer, «GDC 2012: Breaking down SimCity's GlassBox engine»;
  - Andrew Willmott, «Inside GlassBox».
- **Cities: Skylines:**
  - Paradox y Colossal Order, *dev diaries* de zonificación y economía;
  - análisis técnicos de Cities: Skylines II (PC Gamer, Tom's Hardware).
- **Los Sims:**
  - Forbus y Wright, «Programming Objects in The Sims»;
  - Game Maker's Toolkit, «The Genius AI Behind The Sims».
- **Townscaper:**
  - Boris the Brave, «Editable WFC» y «WFC tips and tricks»;
  - Maxim Gumin, *WaveFunctionCollapse*;
  - charlas de Oskar Stålberg.


---

# ANEXO E2. Inspiración visual (`docs/INSPIRACION-VISUAL.md`)


> **La regla:** de las obras con derechos se toman las **técnicas**, nunca imágenes, personajes ni logos. El arte «de verdad» que se recopila y adapta es de **dominio público**: sus paletas están en `arte/dominio-publico/`, con fuente y licencia.

### 1. Las referencias del autor: la entrega maestra (nov‑2026)
El autor reunió los 14 reels, los videos y el análisis de ChatGPT y de Gemini en un solo documento: **`docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`**. Tiene:
- 25 fichas (R01–R25);
- el registro de los 14 enlaces;
- el sistema de peso y el de vida;
- la arquitectura portable y el rendimiento en móvil;
- el plan por fases.

**Qué es comprobado y qué no:**
- 17 fichas se vieron en video.
- 1 se identificó de forma indirecta (*Town Brush*).
- 7 dependen solo del informe de Gemini.
- Las cifras de las fichas («1000 NPC», «0,08 s», «60 FPS en cualquier celular») son **hipótesis del informe, no hechos**.

#### Las 25 fichas y dónde quedaron en Motor City
| Ficha | Referencia | Lo que tomamos (la técnica, nunca el arte) | Estado |
|---|---|---|---|
| R01 | *The Sound of Fury* | Hitstop, contornos y efectos de tinta | ✅ `MC.Vida.impacto`, estilos `comic` y `novela` |
| R02 | Arte sci-fi con semitono | Semitono en las sombras, niebla de distancia | ✅ semitono · ⏳ niebla de distancia (C‑M17) |
| R03 | Calle cyberpunk pictórica | Pixel, neones y reflejos en charcos | ✅ modo pixel · ⏳ reflejos con lluvia (C‑M17) |
| R04 | *KnoxMap* (OSM → mapa jugable) | Lugares reales craqueados de datos abiertos | ✅ `geo/territorio.py`, `MC.Lugares` e interiores |
| R05 | Películas en estilo PS2 | *Mid‑poly* con texturas pintadas | ⏳ arte de ChatGPT (C‑A) y Godot (C‑M18) |
| R06 | *Project Zomboid* en 3.ª persona | Animaciones cotidianas (abrir, reparar, sentarse) | ⏳ Codex (C‑M21) |
| R07 | *Fable Rover* | Telemetría física; suspensión por rueda | ✅ `MC.Telemetria` · ⏳ suspensión (C‑M21) |
| R08 | *Mythictale* | Hitstop, polvo, sprites 2D en un mundo 3D | ✅ `MC.Vida`, `MC.Sprites` y onomatopeyas |
| R09 | *Motor Town* | Física de conducción; inclinación de la carrocería; lluvia | ✅ cabeceo y día/noche · ⏳ balanceo y suspensión (C‑M21) y lluvia (C‑M17) |
| R10 | *Town Brush* | El toque que despierta el mundo; viento; *pop* al colocar | ✅ viento en las copas y aplastamiento · ⏳ pincel de mundo (C‑M20) |
| R11 | *Cairn* | Apoyos y esfuerzo legibles | ✅ aterrizaje con peso · ⏳ IK de pies (C‑M21) |
| R12 | 4×4 en la playa (Godot) | **Fauna que huye**, surcos y cosas que se rompen | ✅ **palomas que alzan vuelo**, **huellas** · ⏳ props rompibles (C‑M21) |
| R13 | Pixel 3D nocturno | **Faros** y tablero en primera persona | ✅ **faros y luces de freno** · ⏳ tablero (C‑M21) |
| R14 | *Still The Game* (24 h) | Ventanas y farolas que se encienden, rutinas | ✅ reloj, ventanas, farolas y población |
| R15 | Ciudades en pixel art | Minijuegos sobre el mismo mapa | ✅ Run en la ciclovía y Mandados · ⏳ carreras de *Motor City* |
| R16 | *CityRT* | *Cel* con contorno, bajar a caminar, emergencias | ✅ estilos con tinta y modo alcalde · ⏳ emergencias (C‑M14) |
| R17 | *Miniopolis* | **Filtros intercambiables** | ✅ **11 estilos**, con **vintage** y **CRT** |
| R18 | *VoxPix* (API para agentes) | Construir barrios por código | ✅ contratos y esquemas (`schemas/`) · ⏳ API de construcción (C‑M20) |
| R19 | *Still The Game* (nieve) | Huellas y faros de noche | ✅ huellas en nieve, arena, tierra y barro; faros |
| R20 | *Induction Bench* | Laboratorio de física en vivo | ✅ telemetría en Ajustes · ⏳ gráficas (C‑M21) |
| R21 | *AngioSim* | Rayos X para inspeccionar | ✅ rayos X de edificios · ⏳ taller con rayos X (C‑M21) |
| R22 | *FireTrace* | Mapa táctico, dron y **visión térmica** | ✅ vista dron, capas de datos y estilo **térmico** |
| R23 | *Ballpoint Gambit* | Interfaz de libreta dibujada | ⏳ ChatGPT (C‑A11) |
| R24 | Haikus en código | Efectos procedurales en Canvas | ✅ todo el motor (Canvas, sin imágenes pesadas) |
| R25 | Letra a mano → fuente | Tipografía propia | ⏳ ChatGPT (C‑A10) |

**Los 14 enlaces:**
- **Sin verificar todavía:** 13, que siguen pidiendo iniciar sesión (tarea G‑H7 de Gemini, que puede ver videos).
- **Identificado de forma indirecta:** el 03 (*Town Brush*).

**Las decisiones de la entrega que el motor adopta:**
1. Primero credibilidad física, después complejidad visual.
2. La vida nace de las relaciones: el viento mueve las copas y la lluvia vuelve barro el pasto.
3. No atar las reglas a los gráficos: la calidad cambia el aspecto, nunca la frenada.
4. Contratos de datos versionados: `schemas/` y `MC.Contratos`.
5. Medir en un celular real con percentiles: `MC.Telemetria`.

#### 1.1 Auditoría G‑H7 de Gemini (20‑nov‑2026)
Gemini revisó los 10 reels que faltaban. Siguen detrás del inicio de sesión de Instagram, así que no se inventó contenido. Lo verificado es esto:

| Reel / publicación | Estado de acceso (2026-11-20) | Qué se ve (solo evidencia verificada) | Estilo | Qué da peso o vida | Técnica observada / uso en Motor City |
|---|---|---|---|---|---|
| `DfvyT1QIFIQ` | **Evidencia indirecta verificada** (ficha `R10`, reseña externa en `develog.develrocket.com` documentada en `MOTOR-CITY-ENTREGA-MAESTRA.md`; sin inspección del metraje original) | ***Town Brush***: al pintar con el dedo, el paisaje de un pueblo cobra vida y se transforma | Pixel art (según fuente secundaria) | Respuesta inmediata del entorno al gesto táctil (no se verificó física interna ni código) | «Toque que despierta el mundo»: pintar, reparar o limpiar activa animación, luz y cambios persistentes → referencia para `C‑M11` y `MC.Urbe` |
| `Dfaux2QFsay` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `De9tpl3yakv` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `De7qMG8iZdh` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `Dfpb3_vHFPb` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `Dc_s5CPsstT` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `De9ZhRAIOhJ` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `DdwLGJmjjvQ` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `DfRe6pQzWzS` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `DfDkDxQiQS7` | Bloqueado por inicio de sesión en Instagram (publicación `?img_index=2` privada/login) | No verificable sin sesión; pendiente asociar la imagen o MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar imagen/MP4 |

##### Técnicas verificadas directamente en los 17 clips MP4 analizados (`MOTOR-CITY-ENTREGA-MAESTRA.md`, sin asignación 1:1 a los 9 shortcodes bloqueados)
En la entrega maestra del autor se inspeccionaron directamente 17 clips MP4 (`R01`, `R05`, `R06`, `R07`, `R11`, `R12`, `R14–R17`, `R19–R25`). Aunque no existe correspondencia confirmada entre cada `.mp4` y los 9 shortcodes bloqueados arriba, sus aportes verificados respaldan directamente los módulos de Motor City 2.7:

| Fichas con MP4 directo | Qué se vio directamente en los fotogramas | Estilo | Qué da peso o vida | Principio aplicable al motor |
|---|---|---|---|---|
| `R01` (*The Sound of Fury*) | Combate musical con trazos de tinta negra, estelas y pausas de impacto | Cómic / novela gráfica oscura con *cel-shading* | *Hitstop*, sacudida de cámara, tela al viento y partículas | Contornos + VFX 2D + *hitstop* (`MC.Vida`, `MC.Estilo` `comic`/`novela`) |
| `R05`, `R06` (PS2/GTA retro y *Project Zomboid* 3ª persona 3D) | Escenas *mid/low-poly* con texturas pintadas e interacciones cotidianas en interiores 3D | *Low/mid-poly* retro con luz cálida | Retroceso de golpes, gestos cotidianos (reparar, abrir puertas, leer) y sombras largas | Personajes legibles sin hiperrealismo y micro-acciones táctiles en Mi casa y lugares |
| `R07`, `R12` (*Fable Rover ER-6* y 4×4 en desierto/playa en Godot) | Rover de 6 ruedas con suspensión visible; 4×4 rompiendo cercas y derrapando en arena junto al mar | Maqueta técnica / diorama *top-down* cálido | Compresión de suspensión, vallas rompibles, polvo de llantas, surcos y gaviotas que huyen | Suspensión ligera, *props* reactivos, fauna que reacciona y estelas (`MC.Vida`, `C‑M15`) |
| `R11` (*Cairn*) | Escalada en roca vertical con cuerdas, apoyos cuidadosos y clima de montaña | Novela gráfica / *ligne claire* 3D | Tensión del apoyo, caídas con peso y viento en tela/nieve | Contactos firmes y peso corporal al saltar/aterrizar (`MC.Vida`) |
| `R14`, `R19` (*Still The Game*) | Diorama isométrico urbano con ciclo de 24 h, estaciones, farolas, ventanas encendidas, nieve y huellas | Diorama isométrico 3D realista estilizado | Avance pesado en nieve, sombras largas girando y encendido progresivo de ventanas y farolas | Ciclo solar con luces nocturnas en fachadas (`C‑A6`) y huellas/charcos (`C‑M17`, `C‑M15`) |
| `R15`, `R16`, `R17` (Ciudades pixel art, *CityRT*, *Miniopolis*) | Mapas urbanos isométricos, constructor web *cel-shaded* y edificios modulares con filtros en vivo (*Comic, CRT, Vintage, Vibrant*) | Pixel art isométrico / *cel-shading* / maqueta con filtros | Golpe seco con polvo al encajar plantas, tráfico continuo y cambio instantáneo de atmósfera | Selector de estilos `MC.Estilo` + construcción modular y modo a pie de calle (`C‑A8`, `C‑M19`) |
| `R20–R25` (Laboratorio 3D, mapa térmico, cuaderno ilustrado, haikus JS, tipografía) | Campos 3D, vista rayos X, propagación de incendio sobre relieve, ajedrez de cuaderno, haikus en Canvas y fuente manuscrita | Técnico 3D / ilustración de cuaderno / Canvas 2D generativo | Inercia en controles, capas de datos sincronizadas, *squash & stretch* 2D y ondas procedurales | Capas de ciudad (`MC.Urbe`), efectos de lluvia/ondas ligeros en Canvas y depurador de físicas |

> **Para cerrar el mapa 1:1:** basta con que el autor indique qué `.mp4` corresponde a cada uno de los 9 shortcodes bloqueados (sin intentar evadir el inicio de sesión de Instagram).

#### 1.2 Verificación en fuentes públicas primarias de las 7 fichas «Solo Gemini» (G‑H7 · 20‑nov‑2026)
En `MOTOR-CITY-ENTREGA-MAESTRA.md` §4 había **7 fichas sin clip MP4** (`R02`, `R03`, `R04`, `R08`, `R09`, `R13` y `R18`). Se contrastaron de forma independiente contra sus **repositorios, páginas oficiales de Steam y artículos técnicos primarios**, separando hechos verificados de hipótesis no probadas:

| Ficha | Proyecto / autor | Nivel actualizado | Fuente primaria verificada | Qué se confirmó (y qué sigue sin comprobarse) |
|---|---|---|---|---|
| **R02** | **Josh White** (`@joshwhite_artist`) | **Verificado en portafolio** (sin vídeo del reel) | [ArtStation (`jdwatx`)](https://www.artstation.com/jdwatx) · [Reddit `u/Joshwhite_art`](https://www.reddit.com/user/Joshwhite_art/) · [FreeYork (sep‑2026)](https://freeyork.org/art/josh-white-digital-3d-sculpts/) | Confirmado el autor, el handle `@joshwhite_artist` y sus megaestructuras sci-fi (*Sector 8*, *M.E.C.*). **Corrección técnica:** FreeYork documenta un flujo de **esculpido 3D en Nomad Sculpt (iPad) + sobrepintado en Procreate**, no un *shader* volumétrico en tiempo real. El movimiento/paralaje del reel no se inspeccionó. |
| **R03** | **Maciej Drabik** (`@maciejdrabik_art`) | **Verificado en prensa técnica** (sin vídeo del reel) | [80.lv · *Rainy Autumn Nights* (sep‑2024)](https://80.lv/articles/digital-artist-achieves-pixelated-perfection-with-this-3d-rainy-scene) · [80.lv · animación cyberpunk (oct‑2024)](https://80.lv/articles/relax-your-mind-with-maciej-drabik-s-cyberpunk-style-3d-animation) | Confirmado su estilo 3D pixelado/pictórico con calles urbanas lluviosas, iluminación neón y paralaje (*Rainy Autumn Nights* y secuencia cyberpunk). **Distinción clave:** son piezas **prerrenderizadas en Blender + DaVinci Resolve**, no un filtro móvil en tiempo real (en Motor City la versión ligera son `vistas.pixel` + charcos `C‑M17`). |
| **R04** | ***KnoxMap*** (OSM → *Project Zomboid* Build 42) | **Verificado directamente en GitHub** | [`github.com/spytheeuclidean-a11y/knoxmap`](https://github.com/spytheeuclidean-a11y/knoxmap) (v1.8.6.3, MIT/GPL) · [Steam Workshop 3806764280](https://steamcommunity.com/sharedfiles/filedetails/?id=3806764280) | Confirmado: escrito en Python/Rust/JS por `euclid80tr` sobre *Knoxify*. Lee calles, huellas de edificios, agua, parques, vías férreas y alturas (hasta 31 pisos) de OpenStreetMap (y opcionalmente Overture Maps / ESA WorldCover), genera interiores amoblados según tipo de local y estima población. **Aclaración:** es un **compilador de escritorio fuera de línea** que tarda minutos por bloque de 600 × 600 m, no *streaming* en móvil. |
| **R08** | ***MythicTale*** (STUDIO GENKI) | **Verificado en tienda oficial** (sin vídeo del reel) | [Steam · *MythicTale* (App 4451310)](https://store.steampowered.com/app/4451310/MythicTale/) | Confirmado: Action RPG cenital estilizado en un mundo **2.5D vibrante** inspirado en clásicos portátiles, con combate rápido de artes marciales, técnicas de energía, exploración y plataformas (Windows/macOS). Los detalles concretos de *hitstop* y torneo del reel no se inspeccionaron en vídeo. |
| **R09** | ***Motor Town: Behind The Wheel*** (P3 Games) | **Verificado en tienda oficial** | [Steam · *Motor Town* (App 1369670)](https://store.steampowered.com/app/1369670/Motor_Town_Behind_The_Wheel/) · [Noticias Steam](https://steamcommunity.com/app/1369670/allnews/) | Confirmado: mundo abierto (24 × 16 km) en Acceso Anticipado para PC con ciclo día/noche, nubes volumétricas y clima dinámico, más de 50 vehículos, física realista de llantas/derrape, peso y sujeción de carga, trabajos (taxi, bus, camión, entregas) y compra/amoblado de propiedades. Es un título de escritorio (no móvil). |
| **R13** | ***Holstin*** (Sonka / Team17) — *coincidencia probable* | **Identificación probable verificada** (pendiente confirmar 1:1 con el MP4) | [Steam Demo *Holstin* (App 2443020)](https://store.steampowered.com/app/2443020) · [Rely on Horror (abr‑2025)](https://www.relyonhorror.com/latest-news/psychological-survival-horror-game-holstin-shows-off-arsenal-of-weapons-and-new-gameplay-footage/) · [WindowsForum (dic‑2025)](https://windowsforum.com/news/holstin-polish-survival-horror-with-a-dynamic-camera-now-published-by-team17.393101/) | La descripción de `R13` (urbano oscuro de Europa del Este en pixel 3D con cambio sin cortes entre vista isométrica, plano lateral, disparos sobre el hombro y conducción en primera persona) coincide punto por punto con ***Holstin*** (Polonia años 90, tecnología *2XD Rendering* de Sonka). Al no haberse visto el reel original de `@indie.gamesdaily`, se marca como **atribución probable pendiente de confirmación con el MP4**. |
| **R18** | ***VoxPix*** (Andres Wong) | **Verificado directamente en GitHub** | [`github.com/andyeswong/voxpix`](https://github.com/andyeswong/voxpix) · [`docs/api-agentes.md`](https://github.com/andyeswong/voxpix/blob/main/docs/api-agentes.md) | Confirmado vía API de GitHub: repositorio público **MIT** en TypeScript + Vue 3 + WebGL2, motor de vóxeles a pixel art 2.5D con luz dinámica y agua, expuesto sin ratón en `window.voxpix` (`box`, `water`, `foliage`, `voxels`, `batch`, `save/load`). La cifra «paisaje de 128 × 128 en 0,08 s de ediciones» aparece textualmente en el README del autor (marca declarada por el proyecto, no perfilada en nuestro móvil). |

#### 1.3 Enlaces de skills, plugins y herramientas de agentes (20‑nov‑2026)
Los 10 enlaces nuevos compartidos por el autor (8 de TikTok y 2 de Instagram) sobre skills y plugins de IA se auditaron combinando los fotogramas revisados por Codex en `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md` (2.9.1) con la verificación directa de repositorios y licencias en GitHub. Sus principios quedaron incorporados en **4 skills nuevas** en `.claude/skills/` (`motor-city-web-moderna`, `motor-city-diseno-ui`, `motor-city-qa-playwright` y `motor-city-revision-ia`) y el catálogo completo con comandos de instalación opcionales vive en **`docs/SKILLS-Y-PLUGINS.md`**. Las 2 publicaciones de Instagram (`DfVDgmclLPi/?img_index=6` y `DexJDYnNQ0X`) siguen bloqueadas detrás de inicio de sesión y permanecen abiertas hasta recibir capturas o nombres.



#### 1.2 Los 11 enlaces del 20‑nov‑2026: skills y plugins para las IA (2.10)
El autor mandó 2 Instagram (uno dos veces) y 8 TikTok, y pidió «añade las skills y plugins de los videos y sigue desarrollando». Los TikTok se leyeron por su descripción pública. Los Instagram piden iniciar sesión, y quedan para Gemini (G‑H10).

| Enlace | Qué muestra | Qué se hizo |
|---|---|---|
| TikTok @midudev (`ZSpw3MBBy`) | **Modern Web Guidance**, de Google Chrome (Apache‑2.0): una skill que evita que la IA escriba HTML, CSS o JS viejo | Plugin de Claude Code. Se corrió `legacy-scan` sobre el motor: 11 hallazgos, se aplicaron 9 con su respaldo y se dejaron 2 a propósito (la copia JSON del guardado). Se fijó la **política de navegadores** en `CLAUDE.md`. |
| TikTok @xabatzz (`ZSpw3DhsN`) | **Hallmark** (`Nutlope/hallmark`, MIT): una skill de diseño web «que no parezca hecho por IA», con 50 temas y revisión en 8 tamaños | Plugin de Claude Code. Encargo **C‑M25**: la portada de GitHub Pages. |
| TikTok @morenazogutierrez (`ZSpw3ESfu`) | Tres herramientas: skills de diseño y de animación, y **Playwright** para que la IA pruebe la web | El diseño y la animación son Hallmark y HyperFrames. Playwright ya está (`webapp-testing` y `prueba --navegador`). |
| TikTok @revolutia.ai (`ZSpw3hjS4`) | **find-skills** (`vercel-labs/skills`, MIT): busca e instala la skill justa para cada tarea | En el catálogo. Se instala con `node motor.mjs skills --instalar`. |
| TikTok @revolutia.ai (`ZSpw3yj9x`) | Una skill que convierte una web en un **video de lanzamiento** con música y subtítulos | Es **HyperFrames** (`heygen-com/hyperframes`, Apache‑2.0, skills `website-to-video` y `product-launch-video`). Plugin de Claude Code y encargo **C‑A12** (tráiler de Mandados). |
| TikTok @revolutia.ai (`ZSpw3ah5Q`) | **MiroFish** (`666ghj/MiroFish`, AGPL‑3.0): miles de clientes simulados que opinan antes del lanzamiento | Es una aplicación aparte, con servidor y llaves, así que no se instala. Se tomó la idea: **`MC.Publico`** y `node motor.mjs publico` (niña, abuelo, gamer y turista juegan solos y dan su veredicto). |
| TikTok @migue.baena (`ZSpw36ySn`) | Un supuesto «system prompt» filtrado de otra empresa | **Descartado.** Es material filtrado y confidencial de un tercero, así que no se copia ni se usa. |
| TikTok @soyenriquerocha (`ZSpw3u8dH`) | «Claude ahora construye bien sin basura» (la descripción no dice más) | Para Gemini (G‑H10): averiguar qué herramienta es. |
| Instagram `DfVDgmclLPi` (enviado dos veces) | No se pudo leer: pide iniciar sesión | Para Gemini (G‑H10). |
| Instagram `DexJDYnNQ0X` | No se pudo leer: pide iniciar sesión | Para Gemini (G‑H10). |

### 2. Peso y vida («game feel»)
| Fuente | La técnica | En el motor |
|---|---|---|
| Jan Willem Nijman (Vlambeer), «The Art of Screenshake» (2013) | El mismo juego con y sin «jugo»: sacudida, retroceso, pausa de impacto y partículas. Sin eso, todo se siente plano. | `MC.Vida` (88): sacudida según la caída, **hitstop** de 60 ms en los choques (`MC.Bucle` respeta `MC._pausaImpacto`), polvo, salpicaduras y hojas. |
| Disney, los 12 principios de la animación | *Squash and stretch*, anticipación y acción complementaria | El cuerpo se aplasta al aterrizar y vuelve (`_squash`); el vehículo cabecea con la aceleración. |
| *Spider‑Man: Into the Spider‑Verse* | Animación «a dos cuadros» (*on twos*) para un movimiento con carácter | Las alas de los pájaros aletean a 12 cuadros por segundo. |
| *Cairn*, carreras tipo Dakar (reels) | El peso del cuerpo y del vehículo | Lo mismo, más el viento que mece las copas de cerca. |

### 3. Cómic, manga, anime y novela gráfica
| Obra o autor | La técnica | Estilo del motor (`MC.estilo`) |
|---|---|---|
| *Into the Spider‑Verse* (Sony, 2018) | Semitono de puntos para la luz, rayado para las sombras, puntos de Kirby, líneas dibujadas sobre el 3D y onomatopeyas en pantalla | `comic`: semitono horneado en las losas, tinta, onomatopeyas (`¡PUM!`, `¡TUM!`) y líneas de velocidad. |
| Roy Lichtenstein, la imprenta del cómic | El punto Ben‑Day como textura | La trama `puntos` de `MC.Estilo`. |
| Hergé y la *ligne claire*; Moebius (y *Sable*, que se inspira en él) | Línea de grosor uniforme, color plano y poco contraste. En *Sable*, el contorno da profundidad. | La **tinta** de grosor constante en vías, techos, muros y árboles (`tinta`, `tintaColor`). |
| Manga (tramado, *screentone*) | Grises con tramas de puntos y líneas de velocidad radiales | `manga`: todo a escala de grises, tramado en las copas, líneas de velocidad desde el borde sin tocar el centro. |
| *Return of the Obra Dinn* (Lucas Pope) | Todo en 8 bits de gris y, al final, umbral contra una trama (1 bit), estable entre cuadros | La idea del **umbral** de la novela gráfica. Un estilo de 1 bit con trama queda para ChatGPT (C‑M19). |
| *Sin City* (Frank Miller), Mike Mignola | Blanco y negro duro y un solo color de acento | `novela`: tres tonos de papel y tinta, sombras negras, árboles en silueta con filo de luz y el **rojo** de los techos como acento. |
| Makoto Shinkai | El cielo manda la luz: azul profundo arriba, cian claro en el horizonte, nubes en capas y brillo | `anime`: cielo propio en la vista lateral, sombras azul violeta, *cel shading* en 6 bandas y línea fina. |
| Studio Ghibli (Kazuo Oga) | Fondos en gouache y acuarela, mate, con humedad en el aire | `acuarela`: papel, pigmento que se junta en el borde de las copas y paleta de acuarelas reales. |
| *Arcane* (Fortiche) | 3D con texturas pintadas a mano, sombras y luces pintadas, efectos en 2D | La dirección para el arte de ChatGPT (C‑A8): texturas pintadas sobre el volumen del motor. |
| Hokusai e Hiroshige (ukiyo-e) | Grabado en madera: azul de Prusia, papel crema, contorno y color plano | `ukiyoe`: la **paleta real** de *La gran ola* y *Fuji rojo*, con tinta índigo y papel. |

### 4. Arte de verdad, de dominio público (recopilado y adaptado)
`arte/dominio-publico/paletas.json` tiene las paletas de 8 colores sacadas de estas obras con un algoritmo de corte por la mediana. Las imágenes vienen de Wikimedia Commons (`node` / Python, 200 px), y en el repositorio solo quedan los colores, con su fuente:

| Obra | Autor y año | Licencia en Commons | Uso |
|---|---|---|---|
| *La gran ola de Kanagawa* | Hokusai, 1831 | Dominio público | `ukiyoe` |
| *Fuji rojo* (Viento del sur, cielo despejado) | Hokusai, 1831 | Dominio público | `ukiyoe` |
| *Aguacero sobre el puente Ōhashi* | Hiroshige, 1857 | Dominio público | `acuarela` |
| *Terraza de café por la noche* | Van Gogh, 1888 | CC0 | referencia para la noche |
| *Impresión, sol naciente* | Monet, 1872 | Dominio público | referencia para el amanecer |
| *Little Nemo in Slumberland* | Winsor McCay, 1906 | Dominio público | referencia del cómic clásico |
| *Las estaciones* | Alfons Mucha, 1896 | Obra de dominio público (foto FAL) | referencia |
| Grabado de la *Divina comedia* | Gustave Doré, 1861 | Dominio público | `novela` |
| Acuarelas de la **Comisión Corográfica** | Manuel María Paz y otros, 1853 | Obra de dominio público (escaneo CC BY‑SA 4.0) | `acuarela` |
| Acuarela del trópico | Winslow Homer, 1899 | Dominio público | `acuarela` |

**Por qué solo paletas:** pesan casi nada, no meten imágenes en el juego y no confunden lo que es del motor con lo que es de un museo. La lista completa, con enlaces, está en `arte/dominio-publico/paletas.json`. Gemini amplía la lista con obras colombianas (G‑H8).

### 5. Lo que sigue
- **ChatGPT** (imágenes) dibuja las láminas guía de cada estilo (C‑A8) y el personaje en *cel* (C‑A9).
- **Codex** hace el estilo de 1 bit con trama estable (C‑M19) y una vista con three.js o WebGPU (C‑M18).
- **Gemini** describe los 10 reels que faltan (G‑H7) y busca 40 obras de dominio público, también colombianas (G‑H8).

### Fuentes
- Spider‑Verse:
  - [AWN · Creating the stylized universe](https://www.awn.com/animationworld/creating-stylized-universe-sonys-spider-man-spider-verse);
  - [Foundry · Graphic look in comp](https://www.foundry.com/insights/film-tv/graphic-look-in-comp-spiderman);
  - [No Film School](https://nofilmschool.com/how-spider-verse-took-animation-risks).
- Arcane:
  - [VFX Voice · Arcane season 2](https://vfxvoice.com/riot-games-and-fortiche-get-revolutionary-with-arcane-season-2/);
  - [80.lv · backgrounds](https://80.lv/articles/arcane-artists-show-how-they-combine-traditional-art-3d-for-backgrounds).
- Game feel:
  - [Game Developer · Squeezing more juice](https://gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design-);
  - [Universität Bayreuth · Game Feel (PDF)](https://medienwissenschaft.uni-bayreuth.de/wp-content/uploads/GxD-10-Game-Feel.pdf).
- Obra Dinn:
  - [PlayStation Blog](https://blog.playstation.com/2019/10/17/return-of-the-obra-dinn-adventures-in-one-bit-out-tomorrow/);
  - [Alan Zucconi · Shader Showcase](https://www.alanzucconi.com/?p=10365).
- Ghibli y Shinkai:
  - [Gurney Journey · Painting in Ghibli style](https://gurneyjourney.blogspot.com/2018/05/painting-in-ghibli-style.html);
  - [Looper · Shinkai sobre Suzume](https://www.looper.com/1254434/director-makoto-shinkai-anime-artistry-suzume-exclusive-interview/).
- Moebius, *ligne claire* y *Sable*:
  - [Game Developer · GDC 2022, Sable](https://gamedeveloper.com/gdc2022/how-shedworks-refined-the-art-of-sable-in-pursuit-of-readability);
  - [Cook & Becker · Moebius](https://www.cookandbecker.com/en/article/346/artist-spotlight-moebius.html).
- Obras de dominio público: [Wikimedia Commons](https://commons.wikimedia.org/). Cada archivo está en `arte/dominio-publico/paletas.json`.


---

# ANEXO E3. Motores potentes (`docs/MOTORES-POTENTES.md`)


> **La idea:** Motor City nació para correr en un HTML, en cualquier celular y sin internet. Eso no lo encierra:
> - sus **mundos** salen en formatos estándar;
> - su **simulación** (física, terreno, ciudad, historias, economía) es JavaScript puro, que también corre sin pantalla;
> - su **estado vivo** se puede mandar a otro motor que solo dibuje.
>
> Así, un mismo juego puede tener una versión liviana (Motor City) y una de consola o PC (Unreal o Godot) **sin rehacer el mundo**.

![Guatapé exportado de Motor City y abierto en three.js](img/exportar-guatape-threejs.jpg)

*Guatapé exportado con `node motor.mjs exportar guatape` y abierto en three.js, sin tocar nada. El validador oficial de Khronos da 0 errores y 0 avisos.*

### Tres niveles para sacarle el máximo provecho
| Nivel | Qué se lleva | Cómo | Para qué |
|---|---|---|---|
| **1. El mundo** | Terreno, edificios, vías, árboles y lugares | `node motor.mjs exportar <mundo>` → `mundo.glb`, `alturas.r16` y `escena.json` | Hacer el juego en Godot, Unity o Unreal con el pueblo o la ciudad real ya armados. |
| **2. La simulación en vivo** | Jugador, vehículos, gente, hora y clima | `MC.Puente.instantanea(E)` cada cuadro, enviado por WebSocket (o `postMessage`) | Que Motor City siga simulando y otro motor dibuje con más detalle (luz global, sombras suaves y más polígonos). |
| **3. Otro dibujante en la web** | La vista | Una vista registrada que use three.js, Babylon o WebGPU con el mismo `E` | Gráficos de PC en el navegador, con el mismo juego (C‑M18). |

### Nivel 1 · Exportar el mundo
```bash
node motor.mjs exportar guatape                              # 600 × 600 m alrededor del centro del pueblo
node motor.mjs exportar medellin --centro 15680,13534 --lado 800 --paso 4
```
Sale en `dist/exportar/<mundo>/`:
- `mundo.glb` (glTF 2.0 binario):
  - mallas `terreno` (relieve real; color por suelo y el agua por profundidad), `edificios` (extruidos con el color de su zona), `vias` (cintas sobre el terreno) y `arboles` (tronco y copa por especie);
  - un solo material con colores por vértice;
  - +Y arriba, en metros, y el origen en el centro de la caja (en `extras.origen_mundo` quedan las coordenadas originales).
- `alturas.r16` y `alturas.json`: el relieve en RAW de 16 bits *little endian*, con su mínimo y máximo.
- `escena.json`: edificios (huella, altura, clase y colores), vías (polilínea, ancho y tipo), árboles (especie, alto y copa) y lugares jugables. El motor de destino pone **su** lógica y **su** arte sobre esto.
- `LEEME.md`: cómo abrirlo en cada motor.

| Motor | El mundo | El terreno de alta calidad | La lógica |
|---|---|---|---|
| **Godot 4** | Arrastrar `mundo.glb` al proyecto | `HTerrain` o *Terrain3D* con `alturas.r16` | GDScript lee `escena.json` y pone `MultiMeshInstance3D` para los árboles. |
| **Unity** | Paquete *glTFast* | *Terrain* → Import Raw (16 bits, Windows, ancho × alto de `alturas.json`) | C# lee `escena.json`. |
| **Unreal 5** | Import (Interchange) de `mundo.glb` | *Landscape* desde `.r16`, con escala Z = (max − min) / 512 × 100 | Blueprint o C++ con el JSON; *PCG* para poblar con los árboles. |
| **Blender** | Archivo → Importar → glTF 2.0 | — | Python lee el JSON (render de cine). |
| **three.js y Babylon** | `GLTFLoader` y `SceneLoader` | `PlaneGeometry` desplazada con las alturas | El mismo JavaScript de Motor City. |

**Comprobado:**
- `mundo.glb` de Guatapé (300 edificios, 66 vías, 1.396 árboles, 86 mil vértices) pasa el **glTF Validator de Khronos con 0 errores**;
- three.js lo dibuja (la imagen de arriba).

En Godot, Unity y Unreal no se pudo abrir desde aquí; esa prueba le toca a Codex (C‑M18).

### Nivel 2 · El puente en vivo
```js
// en Motor City (navegador o Node), en cada cuadro:
const estado = MC.Puente.instantanea(E);   // { t, hora, clima, estilo, jugador: { x, y, z, a, v, vehiculo, estado }, vehiculos: [...], peatones: [...] }
socket.send(JSON.stringify(estado));       // al motor que dibuja
// del lado del otro motor: posición glTF = [x, z, y] (MC.Puente.aGltf)
```
- La simulación sigue siendo la de Motor City (Terreno, Cuerpo, Urbe, Historias…). El otro motor solo dibuja.
- Es la arquitectura de los juegos en red: un servidor autoritativo y clientes que dibujan.

### Nivel 3 · Lo que conviene hacer para otro motor
1. **Primero el juego en Motor City**, liviano, para validar que es divertido en un celular.
2. **Después exportar el mundo** y llevar el arte final (los atlas de ChatGPT valen en cualquier motor).
3. **El peso y la vida** (`MC.Vida`) y los **estilos** (`MC.Estilo`) son ideas fáciles de rehacer en un *shader*:
   - el cómic, con semitono por luminancia y contorno por normales;
   - el manga, con umbral y trama;
   - el anime, con *cel shading* en bandas;
   - la novela, con umbral y un color de acento.

   Están descritos con sus fuentes en `docs/INSPIRACION-VISUAL.md`.
4. **Lo que no se lleva:** el guardado de cada juego y su interfaz, que se hacen en el motor de destino.

### Los contratos mínimos de la entrega maestra, y dónde están en Motor City
La entrega maestra (§12.3) pide separar la simulación del dibujo con contratos estables. Así se corresponden hoy:

| Contrato | En Motor City | Estado |
|---|---|---|
| `IInput` | `MC.Controles` y `MC.Manejo` (acciones: mover, saltar, turbo, bajar, subir) | ✅ |
| `IWorldClock` | `MC.Reloj` y `MC.Bucle` (paso fijo de 1/60 s; hitstop con `MC._pausaImpacto`) | ✅ |
| `IPhysicsWorld` | `MC.Cuerpo`, `MC.Terreno` (suelo, pendiente, agua, obstáculos) | ✅ · suspensión por rueda en C‑M21 |
| `IRenderBridge` | `MC.Vistas`, `MC.arte`, `MC.Pieles`, `MC.Estilo` | ✅ · vista three.js o WebGPU en C‑M18 |
| `IAudioBridge` | `MC.Sonido`, `MC.Paisaje`, `MC.Musica` | ✅ |
| `IWorldStreamer` | Mundo MC4 por celdas, `MC.Losas` con presupuesto | 🟡 · sectores dormidos en C‑M22 |
| `IAgentWorld` | `MC.Poblacion`, `MC.Trafico`, `MC.Transporte`, `MC.Urbe` | ✅ |
| `ISaveSystem` | Cada juego guarda lo suyo | ⏳ `MC.Guardado` versionado en C‑M22 |
| `IQualityProfile` | `MC.GPU`, `MC.ResDinamica`, `E.calidad`, y en Mandados Ajustes → Calidad (automática, baja, media o alta) | ✅ |

**Esquemas versionados** (`schemas/`, `schema_version: 1`), que comprueba `MC.Contratos.validar(dato, esquema)`:
- `escena.schema.json`, lo que sale de `MC.Exportar.escena`;
- `puente.schema.json`, lo que sale de `MC.Puente.instantanea`;
- `entidad.schema.json`, la entidad persistente que propone la entrega (§16.3).

**La regla de la entrega que el motor cumple:** la calidad gráfica cambia el aspecto, nunca la física. Una frenada mide lo mismo en un celular bajo y en uno alto.


---

# ANEXO E4. Motores clásicos livianos (4.1) (`docs/INVESTIGACION-MOTORES-CLASICOS.md`)


> **Pedido del autor (21‑nov‑2026):**
> - investigar motores viejos que hoy son livianos pero muy potentes, y lo que se logró con ellos en sus años de gloria;
> - aplicarles ingeniería inversa;
> - ver cómo los usaron los mejores juegos;
> - traer partes de las versiones liberadas de los motores ya descontinuados.

### 0. La regla: sala limpia (léela antes de tocar nada)
Motor City **no copia código** de ningún motor viejo. La «ingeniería inversa» se hace sobre las **ideas** publicadas: libros, artículos de sus autores, wikis técnicas y el código liberado *leído* como documentación. Luego se **escribe de nuevo** para Canvas 2D y el mundo MC4.

**Por qué:**

| Motor | Licencia de su código | Qué se puede hacer |
|---|---|---|
| Doom (id Tech 1) | Liberado en 1997 con licencia no comercial; **GPL** desde 1999 | Copiarlo obligaría a poner todo Motor City bajo GPL. Por eso solo se toman las ideas. |
| Quake (id Tech 2) | **GPL**. Los datos (mapas, texturas, sonidos) siguen con derechos. | Igual que Doom. |
| Wolfenstein 3D | Licencia propia de id, de uso limitado y educativo; **no es GPL** | Solo ideas (el DDA). |
| Build (Duke Nukem 3D) | Licencia propia de Ken Silverman, que no permite uso comercial sin permiso | Solo ideas (sectores y portales). |
| RenderWare (GTA III) | **Privado.** Hay fuentes «reversadas» (re3) y filtraciones. | **Prohibido** usarlas: tienen problemas legales. Solo se usa lo que contaron sus desarrolladores en público. |
| Voxel Space (Comanche) | Patentado por NovaLogic (patente vencida). Hay recreaciones abiertas, pero sus mapas son de Comanche y quedan fuera de su licencia. | Solo el algoritmo; los mapas son los del MC4. |
| Elite | Código de 1984 documentado por la comunidad (BBC Elite) | Solo la idea de las semillas. Las semillas y las sílabas son nuestras. |

Si una IA quiere **traer código** de un motor GPL, debe hacerlo en un repositorio aparte con licencia GPL y preguntarle antes al autor. **Nunca** se usa código filtrado.

### 1. Qué se trajo y dónde está (4.1)
Todo está en `js/47-clasicos.js` (motor) y en `juegos/getaway/55-clasicos.js` (Turno Cero). Las pruebas están en `pruebas/prueba.mjs` § 22 y en el banco de Chromium.

| Técnica | De dónde viene | Qué hacían con ella los mejores juegos | Cómo quedó en Motor City |
|---|---|---|---|
| **Carretera pseudo-3D por segmentos** | *Pole Position* (1982), *OutRun* (1986), *Lotus*, *Chase H.Q.* | Velocidad y curvas en máquinas sin 3D: la vía son tiras horizontales; las franjas alternas dan la sensación de velocidad; los objetos son sprites escalados; el paralaje de montañas va con el rumbo. | `MC.Arcade`, vista **🏁 Arcade**:<ul><li>la vía real (la autopista del tramo o la calle con sus empalmes) en segmentos de 6 m;</li><li>proyección de verdad, con recorte en el plano cercano;</li><li>franjas fijas al mundo;</li><li>lomas del relieve;</li><li>pinos, palmas y cactus según el bioma, y postes;</li><li>letreros con nombres de veredas, edificios del mapa como cajas, carros y patrullas con sirena;</li><li>faros de noche.</li></ul> |
| **Voxel Space** | *Comanche: Maximum Overkill* (NovaLogic, 1992); Kyle Freeman | Terreno con relieve detallado en 1992, sin polígonos: un mapa de alturas y uno de color, columna por columna, de adelante hacia atrás con un *y-buffer*. La luz va **pintada en el mapa de color**. Los pasos son más largos a lo lejos. | `MC.VoxelSpace`, vista **⛰️ Vuelo**:<ul><li>la ventana de 2 km se arma desde el MC4 (suelo, relieve, agua y edificios encima);</li><li>la luz va horneada por pendiente;</li><li>la ventana nueva se arma **por franjas** mientras se dibuja la anterior, para no trabar el juego;</li><li>niebla de distancia y carros como sprites.</li></ul> |
| **Gema de luz** | *Thief: The Dark Project* (Looking Glass, 1998) | La gema del HUD brilla según qué tan visible estás. Los guardias te ven según la luz del lugar: el primer juego de sigilo «en primera persona» de verdad. | `MC.Sigilo.luz/gema/alcance`:<ul><li>la luz sale de la hora real, de la **sombra de los edificios hacia el sol**, de los postes de la calle de noche y de los faros cercanos;</li><li>en lo oscuro, un guardia te ve a un tercio de su distancia;</li><li>en Turno Cero hay una gema ◆ en las misiones de sigilo.</li></ul> |
| **Sonido que viaja por caminos** | *Thief* | Los sonidos llegan por los caminos entre cuartos, no como burbujas que atraviesan muros. Se puede escuchar detrás de una puerta. | `MC.Sigilo.ruido`:<ul><li>es un Dijkstra en una rejilla de 4 m: el ruido rodea los edificios y entra por los callejones; a través de un muro llega muy apagado;</li><li>en Turno Cero, correr a pie o un motor cerca hace que un guardia vaya a mirar.</li></ul> |
| **DDA por casillas** | *Wolfenstein 3D* (id, 1992); *Catacomb 3‑D* | Rayos que recorren una cuadrícula sin saltarse ninguna casilla: en 1992 corría en un 286. | `MC.DDA.recorrer` y `MC.DDA.bloqueado(M, …)`: línea de visión exacta sobre las casillas del mundo (edificio, montaña o roca). |
| **Semillas que se tuercen** | *Elite* (Braben y Bell, 1984) | 8 galaxias de 256 sistemas en 32 KB: no se guardaba el universo, solo tres números de 16 bits que se «tuercen». Buscaron muchas semillas antes de dar con una buena. | `MC.Semilla`: las veredas y pueblos de la carretera (los letreros de la vista arcade) salen siempre iguales desde el nombre del tramo, sin guardar nada. Las sílabas son del español. |

### 2. Lo que queda por traer (pedidos en `TAREAS-IA.md` § 4.1)
| Técnica | De dónde | Para qué en Motor City | Quién |
|---|---|---|---|
| **Conjunto potencialmente visible (PVS)** | Quake (1996). Se precalcula qué zonas pueden verse desde cada zona y se descarta el resto antes de dibujar. | Manhattan por sectores de 1 km (C‑M34): precalcular qué sectores se ven desde cada sector, según la altura de los edificios, y no decodificar los demás. | Codex |
| **Caché de superficies y lightmaps** | Quake: la textura y la luz de cada cara se mezclan una vez en una caché y luego se dibuja desde ahí. | Fachadas de la ciudad 3D: hornear la luz del sol y de la noche por manzana (`MC.Sombras` ya calcula el sol). | Codex |
| **Mapas de luz por distancia (COLORMAP)** | Doom (1993): 32 tablas de paleta que oscurecen por distancia y por luz del sector, solo con búsquedas en tabla. | El estilo pixel y el 1 bit: niebla y oscuridad por distancia con una tabla, sin mezclar colores en cada cuadro. | Codex |
| **Sectores y portales** | Build, de Duke Nukem 3D (1996): el mundo son sectores 2D unidos por portales; se dibuja desde el sector donde está uno, siguiendo los portales. | Los interiores (`48-interiores.js`): cuartos como sectores y puertas como portales, para entrar a edificios sin cargar otro mundo. | Codex |
| **Tráfico de pocos modelos que se cambian según la búsqueda** | GTA III (2001), contado por su director técnico Obbe Vermeij: en PS2 el tráfico usaba unos pocos modelos y, con nivel de búsqueda alto, se cambiaban por patrullas. Rockstar también limitaba la velocidad en zonas densas para que el streaming alcanzara. | Turno Cero con 3 GB de RAM: un tope de modelos de tráfico por ciudad, que se cambian por patrullas al subir el nivel. | Claude (motor) con datos de Gemini |
| **Las direccionales como guía, sin HUD** | *The Getaway* (2002), el juego en que se inspira el nombre de la carpeta `getaway`: no tenía minimapa; las direccionales del carro marcaban el giro. | Un «modo cine» de Turno Cero sin flecha ni minimapa: las direccionales parpadean hacia la próxima esquina de la ruta. | Codex (luces del GLB) y Claude (ruta) |
| **Mode 7** | SNES (*F‑Zero*, *Super Mario Kart*): un plano inclinado con una transformación afín por línea. | El mapa grande inclinado en celulares sin GPU. | Libre |

### 3. Fuentes
**Voxel Space:**
- Sebastian Macke, *Voxel Space* (explicación y demo web): <https://github.com/s-macke/VoxelSpace>
- Wikipedia: <https://en.wikipedia.org/wiki/Voxel_Space>

**Carretera pseudo-3D:**
- Louis Gorenfeld, *Lou's Pseudo 3d Page*: <https://www.extentofthejam.com/pseudo/>
- Code inComplete, *How to build a racing game*: <https://codeincomplete.com/articles/javascript-racer-v1-straight> y <https://codeincomplete.com/articles/javascript-racer-v2-curves>

**Thief:**
- *Building the original Thief's revolutionary stealth system* (Game Developer): <https://gamedeveloper.com/design/building-the-original-i-thief-s-i-revolutionary-stealth-system>
- PC Gamer, *Stealth is everywhere in games, but the innovations of Thief have been forgotten*: <https://pcgamer.com/stealth-is-everywhere-in-games-but-the-innovations-of-thief-have-been-forgotten>
- Tom Leonard, *Postmortem: Thief* (en *Postmortems from Game Developer*): <https://www.oreilly.com/library/view/postmortems-from-game/9781578202140/22_Chapter_15.xhtml>

**Doom:**
- Doom Wiki, motor de dibujo y visplanes: <https://doomwiki.org/wiki/Visplane>
- Doom Wiki, árbol BSP: <https://doomwiki.org/wiki/BSP_tree>
- Doom Wiki, COLORMAP: <https://doomwiki.org/wiki/Colormap>
- Doom Wiki, luz que disminuye: <https://doomwiki.org/wiki/Light_diminishing>
- Doom Wiki, el código liberado: <https://www.doomwiki.org/wiki/Doom_source_code>
- Wikipedia, *Doom engine*: <https://en.wikipedia.org/wiki/Doom_engine>

**Quake:**
- Fabien Sanglard, *Quake 2 software renderer*: <https://fabiensanglard.net/quake2/quake2_software_renderer.php>
- Fabien Sanglard, el código de Quake: <https://fabiensanglard.net/quakeSource/quakeSourceRendition.php>
- Michael Abrash, *Graphics Programming Black Book*, cap. 59–70 (transcripción): <https://github.com/jagregory/abrash-black-book/blob/master/src/chapter-70.md>
- GameDev.net, *Quake's Lighting Model: Surface Caching*: <https://gamedev.net/tutorials/programming/graphics/ramblings-in-realtime-chapter-4-quakes-r985>

**Build:**
- Fabien Sanglard, *Build engine internals*: <https://fabiensanglard.net/duke3d/build_engine_internals.php>
- Wikipedia: <https://en.wikipedia.org/wiki/Build_(game_engine)>

**Wolfenstein 3D:**
- id Software, código liberado con licencia de uso limitado: <https://docsearch.algolia.com/mcp/docs/repo/id-software/wolf3d>
- Recreaciones con licencia MIT, como referencia de sala limpia: <https://github.com/dictoon/Wolfie>

**Elite:**
- Mark Moxon, *BBC Elite*, semillas de galaxias y sistemas: <https://elite.bbcelite.com/deep_dives/galaxy_and_system_seeds.html>
- Wikipedia: <https://en.wikipedia.org/wiki/Elite_(video_game)>

**GTA III (solo lo que contaron sus desarrolladores):**
- GamesRadar, el semáforo en rojo y el nivel de búsqueda: <https://gamesradar.com/games/grand-theft-auto/gta-3-originally-gave-players-a-wanted-level-for-running-a-red-light-but-this-was-not-popular-with-the-team-so-a-developer-quickly-removed-it>
- GamesRadar, el reto técnico más difícil: <https://gamesradar.com/games/grand-theft-auto/gta-3-dev-says-that-the-open-world-games-hardest-technical-challenge-was-partially-solved-with-careful-city-planning-and-some-extra-windy-weather>
- Sportskeeda, los límites de vehículos en PS2: <https://www.sportskeeda.com/gta/former-gta-3-vice-city-san-andreas-dev-explains-vehicle-limitations-ps2>

### 4. Para la IA que siga
- Antes de traer otra técnica:
  - lee esta tabla;
  - pon la fuente;
  - escribe el código desde cero;
  - agrega una prueba con números que se puedan comprobar a mano (§ 22 de `pruebas/prueba.mjs`).
- Al terminar, **deja tu entrada en `CONTEXTO-RELEVO.md` § 8** y pídele lo mismo a la siguiente IA.


---

# ANEXO E4. Entrega maestra de referencias (del autor) (`docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`)


**Versión:** 1.0 de unificación · **Fecha:** 19 de noviembre de 2026  
**Fuentes fusionadas:** `ENTREGA-REELS.md` (análisis anterior) + `Referencias y Arquitectura para Motor City.md` (reporte de Gemini) + videos MP4 adjuntos en ambas entregas.  
**Producto objetivo:** motor/sistema de videojuego de mundo abierto orientado primero a teléfonos móviles, con arquitectura reutilizable en PC y adaptadores para otros motores.  
**Naturaleza del archivo:** documento de diseño, investigación visual, especificación preliminar y plan de implementación; no es código ni certificación de rendimiento.

### Índice

1. Resumen ejecutivo y decisiones principales
2. Método, alcance, fiabilidad y reconciliación
3. **25 fichas principales de referencia**, tablas completas del reporte de Gemini
4. Estado de comprobación de las 25 fichas y archivos fuente
5. **14 enlaces de Instagram**, una fila por enlace y siete columnas solicitadas
6. Observaciones independientes de los primeros nueve videos
7. Inspección directa de los 17 clips de referencia identificados
8. Cinco técnicas prioritarias consolidadas
9. Identidad artística, paletas y mecánicas transferibles
10. Sensación de peso: locomoción, vehículos y cámara
11. Sensación de vida: NPC, tráfico, clima y persistencia
12. Arquitectura portable y contratos de interfaces
13. Rendimiento y calidad adaptativa en móvil
14. Fases de construcción y pruebas de aceptación
15. Decisiones finales, límites y riesgos
16. Recomendaciones operativas y protocolo para agentes IA
17. Fuentes externas y trazabilidad

---

### 1. Resumen ejecutivo

**Tesis:** la percepción de peso surge de contactos, aceleraciones, desaceleraciones, anticipaciones, cambios de apoyo, deformación aparente, sonido y cámara; la percepción de vida surge de cambios autónomos y respuestas del entorno. No se requieren gráficos hiperrealistas, pero sí reglas coherentes, reacciones visibles y controles precisos.

**Directrices fusionadas:**

- **Motor City debe ser primero un simulador de estados y relaciones**, no un renderizador con una ciudad decorativa. Física, horarios, clima, tráfico y persistencia tienen identidad propia.
- **Primero interacción tangible, luego fidelidad gráfica.** La ciudad reacciona a frenadas, lluvia, peatones, obras, cambios de horario y colisiones; el jugador recibe confirmación visual y sonora.
- **Compatibilidad por contratos, no promesas de exportación mágica.** Los modelos, datos y reglas de simulación pueden tener formatos portables; cada motor requiere integración, ajuste de física y reimplementación de partes gráficas.
- **Ciudad de detalle variable:** el entorno cercano se simula; el lejano se resume y se representa; lo descargado conserva cambios persistentes relevantes.
- **Tres niveles de calidad** para mantener el mismo gameplay en móviles diferentes, con presupuesto de CPU/GPU/RAM/temperatura.
- **Herramientas para IA:** un editor declarativo validado permite que Claude u otro asistente genere barrios y misiones mediante comandos y esquemas, pero la salida debe pasar pruebas antes de ingresar al proyecto.

**Alcance real de la evidencia:** hay **25 fichas temáticas recopiladas por Gemini**, **14 URLs originales**, **17 fichas con un MP4 observable** y **una ficha adicional (*Town Brush*) identificada de forma indirecta**. Las siete fichas restantes dependen solamente de la descripción del informe de Gemini. Esto **no significa 25 obras o videojuegos distintos**: *Still The Game* figura dos veces por mostrar aspectos diferentes y el material del carrusel incluye un resumen y seis demostraciones individuales. Las 14 URLs **no pueden vincularse automáticamente con las fichas** salvo la relación indirecta documentada para *Town Brush*.

---

### 2. Método, alcance y fiabilidad

**Niveles usados para las afirmaciones:**

- **Directa:** se inspeccionaron fotogramas del MP4 adjunto; permite describir lo visible, **no** verificar motor, código, shaders, físicas o cifras de rendimiento.
- **Indirecta:** se dispone de una descripción externa que vincula un identificador de Instagram con un proyecto; no sustituye el metraje.
- **Solo Gemini:** descripción proporcionada por el segundo informe, útil para hipótesis de diseño pero sin video verificable en los adjuntos disponibles.
- **Propuesta Motor City:** decisión o técnica sugerida por los análisis, que **no afirma** ser exactamente la usada en la referencia.

**Reconciliación:** El reporte de Gemini contiene interpretaciones más específicas (p. ej., *Wave Function Collapse*, ECS de 1000 NPC, sombreado concreto, simuladores en WebGL, formato MIT y generación en 0,08 s) que la inspección visual no puede demostrar. Se conservan en las fichas para no perder sus ideas, pero quedan clasificadas como **hipótesis o afirmaciones del reporte, no como hechos verificados**. El análisis anterior, más conservador, se conserva para describir qué sí se ve y qué no se sabe.

**Por qué hay varias tablas:** las **25 fichas** agrupan temáticamente los materiales de Gemini; las **14 URLs** conservan exactamente el alcance del encargo original; el **registro de clips** documenta el respaldo audiovisual. No sumar tablas como si representaran proyectos distintos.

---

### 3. Referencias de Gemini: 25 fichas completas

> **Procedencia de todas las filas de este apartado:** texto del documento de Gemini, reproducido en detalle y reorganizado en tres grupos. La columna “técnica” describe **lo que Gemini interpreta que parece utilizar**; por sí sola no verifica una implementación. La columna final representa **ideas para Motor City**, no una orden de copiar arte ajeno.

#### Bloque A — Fichas R01–R10

| Enlace o referencia | Qué se ve (1–2 frases) | Estilo visual | Sensación de peso | Sensación de vida | Técnica aparente / hipótesis | Qué copiaríamos como principio para mundo abierto móvil |
|---|---|---|---|---|---|---|
| **#1** — *The Sound of Fury* (`@donindies`) | Un pianista desciende a un infierno surrealista peleando con una batuta de director de orquesta y combos musicales que invocan instrumentos y trazos de tinta. Combina exploración en tercera persona con combates rápidos llenos de efectos gráficos. | Cómic / novela gráfica oscura con *cel-shading* y trazos de tinta pintados a mano. | Pausas en el golpe (*hitstop*), sacudida de cámara, enemigos lanzados por el aire, explosiones de tinta negra y estelas pesadas al golpear. | Cabello y gabardina ondeando al viento, bandadas de cuervos negros, flores meciéndose y partículas brillantes flotando. | Sombreado plano (*cel-shading*), contornos negros (*outlines*), VFX 2D integrados en 3D (pentagramas, tinta) e iluminación dramática. | Contornos ligeros en personajes + VFX 2D tipo cómic (baratos en GPU) y *hitstop* de pocos milisegundos para que cualquier impacto se sienta contundente. |
| **#2** — Arte Sci-Fi (`@joshwhite_artist`) | Secuencia de escenarios monumentales de ciencia ficción: megaestructuras colosales, un explorador frente a un acantilado con nubes iluminadas y combates de naves espaciales. Destaca por su escala épica y texturas impresas. | Novela gráfica / ilustración sci-fi estilizada con tramas de impresión (*halftone*). | Escala masiva lograda por movimiento lento y paralaje entre naves diminutas y estructuras gigantes; estelas densas y destellos de disparo. | Tráfico lejano de naves, neblina atmosférica, nubes iluminadas y partículas/luces parpadeantes en la distancia. | Iluminación atmosférica/volumétrica, filtros de trama (*halftone* / *dithering*), alto contraste y composición por siluetas. | Niebla de distancia con gradiente de color y tramas sutiles en sombras para disimular el recorte de distancia (*draw distance*) en móvil y dar sensación de ciudad gigante. |
| **#3** — Calle Cyberpunk (`@maciejdrabik_art`) | Una calle urbana nocturna bajo un tren elevado con tráfico constante, multitudes caminando, vapor saliendo del suelo y neones reflejados en el asfalto mojado. Todo está renderizado con una textura pictórica pixelada. | Pictórico impresionista / pixel art 3D cyberpunk (pinceladas cuadradas). | Paso lento, continuo y masivo del tren elevado por encima de la calle; vehículos avanzando con faros que barren el asfalto. | Multitud densa de peatones, tráfico fluido, vapor ascendente, neones vibrantes y reflejos cambiantes en el suelo húmedo. | Post-procesado pictórico/pixelado sobre escena 3D, iluminación nocturna multicolor, partículas de vapor y reflejos planos/SSR en el piso. | Usar baja resolución estilizada (filtro pictórico/pixel) con luces de neón y reflejos simples en charcos: ahorra muchísima batería/GPU y hace que la ciudad se vea viva y densa. |
| **#4** — *KnoxMap* para *Project Zomboid* (`@luis.gamingg`) | Tutorial de una herramienta que toma cualquier zona real de OpenStreetMap (ej. La Serena, Chile) y genera automáticamente un mapa jugable con calles, edificios, muebles, botín y población de zombis proporcional al mundo real. | Isométrico 2.5D / *low poly* retro. | Escala urbana realista de manzanas, avenidas y edificios densos que obligan a recorrer distancias creíbles. | Generación procedural de interiores, mobiliario y densidad de NPCs/entidades basada en la densidad real de cada edificio. | Ingesta de datos geoespaciales (OpenStreetMap), generación procedural de edificios/interiores y carga modular por zonas (*streaming*). | Un generador procedural de manzanas y calles basado en plantillas o datos reales (OSM) + *chunk streaming* para crear ciudades enormes sin ocupar gigabytes en el teléfono. |
| **#5** — *Brad Pitt Top 4 Movies* (estilo PS2/GTA) | Recreación de escenas icónicas de 4 películas (*Se7en*, *Once Upon a Time in Hollywood*, *Inglourious Basterds*, *Fight Club*) usando estética de videojuegos clásicos de PS2/GTA con personajes expresivos. | *Mid-poly* retro 3D (estilo PS2 / GTA clásico) con texturas pintadas a mano. | Puñetazo en *Fight Club* con retroceso inmediato del torso y cabeza, conducción estable del auto clásico y lenguaje corporal marcado. | Flashes de cámaras de paparazzi, multitud en el fondo, luz cálida del atardecer con *lens flare* al conducir y expresiones faciales claras. | Modelado de bajos/medios polígonos con texturas difusas pintadas (*hand-painted*), iluminación cinematográfica y animación facial por *blendshapes* o texturas. | Estética *mid-poly* estilo PS2 con texturas bien pintadas: corre a 60 FPS en cualquier celular y permite personajes expresivos sin necesitar shaders hiperrealistas. |
| **#6** — *Project Zomboid* en 3ª persona 3D | Demostración de un mod que transforma un juego isométrico en una experiencia inmersiva en tercera persona 3D: el personaje camina por casas, repara circuitos sentado en la cama, pelea con zombis, lee libros y mira campos abiertos. | *Low poly* 3D retro con iluminación suave. | Golpes lentos y pesados con armas cuerpo a cuerpo que derriban al enemigo con salpicadura y caída; caminar pausado y deliberado. | Nubes moviéndose, vegetación en el horizonte, ciclo día/noche con luz cálida de atardecer, sombras largas y animaciones cotidianas (leer, atornillar). | Cámara dinámica en tercera persona sobre el hombro, sombras proyectadas en tiempo real y animaciones contextuales de interacción con objetos. | Animaciones cotidianas y táctiles (abrir puertas, reparar, sentarse) + iluminación cálida de hora dorada: elevan enormemente la inmersión incluso con modelos *low poly*. |
| **#7** — *Fable Rover ER-6* (`@patricio.incoders`) | Aplicación interactiva 3D que simula un rover de exploración de 6 ruedas con paneles solares desplegables, pruebas sobre dunas, rocas y hielo, y un panel lateral con telemetría física en tiempo real. | *Low poly* técnico / estilizado tipo maqueta CAD / LEGO moderno con UI limpia. | Suspensión articulada independiente en las 6 ruedas que se comprime y adapta a cada roca o duna; inclinación realista del chasis. | Despliegue animado de paneles solares y sensores, interacción directa con distintos tipos de suelo y gráficas vivas de telemetría. | Física vehicular por rueda (*raycast* / restricciones de suspensión cinemática), UI técnica en tiempo real y sombreado suave limpio. | Suspensión independiente basada en *raycast* (muy ligera en CPU) para que los autos en Motor City reaccionen a baches, aceras y rampas con peso creíble. |
| **#8** — *Mythictale* (`@vandal`) | RPG de acción indie inspirado en *Dragon Ball* clásico, mostrando combates rápidos en un torneo con sprites pixel art sobre una arena 3D y exploración en un mapa abierto con bosques y agua. | Pixel art / HD-2D (sprites 2D con contorno negro sobre escenarios 3D). | Pausas de impacto (*hitstop*), destellos al chocar golpes, rebote al ser lanzado contra el suelo, ondas de choque y choque de rayos de energía. | Público animado saltando en las gradas, auras de energía chispeantes, polvo al correr y caer, agua con brillo animado y vegetación. | Animación por cuadros (*frame-by-frame*), técnica HD-2D (sprites en mundo 3D con sombras proyectadas) y partículas de energía. | Usar *billboards* o sprites 2D animados para multitudes lejanas, vegetación o efectos de impacto (polvo, chispas) para llenar la ciudad de vida a costo casi cero. |
| **#9** — *Motor Town: Behind The Wheel* (`@apknoo.es`) | Simulador de mundo abierto de conducción con gráficos minimalistas pero físicas profundas: taxis, buses, camiones con carga, policía, grúas, bajar del vehículo para empujarlo o cargar gasolina, clima y daños. | *Low poly* minimalista y colorido con sombreado plano/suave. | Balanceo de carrocería (*body roll*), suspensión visible en derrapes y baches, humo de llantas, polvo en tierra, empuje manual del auto y peso físico de la carga. | Tráfico IA, peatones/pasajeros, ciclo día/noche, lluvia con reflejos en el asfalto mojado, nubes estilizadas y misiones dinámicas en la ciudad. | Física vehicular avanzada (curvas de agarre de neumáticos, centro de gravedad, peso de carga), shader de asfalto mojado y mallas *low poly* optimizadas. | **Referencia núcleo para Motor City:** sacrificar polígonos en favor de física de conducción profunda (suspensión, derrape, peso de carga) + ciclo día/noche y lluvia con reflejos. |
| **#10** — *Townbrush* (`@townbrush`) *(también en Parte 2)* | Constructor de paisajes mediterráneos/toscanos para iPhone y PC donde el usuario "pinta" pueblos, ríos, puentes y árboles que aparecen de forma orgánica con estética acogedora. | Pixel art 3D / acuarela digital pixelada (paleta cálida mediterránea). | Efecto de rebote elástico (*squash & stretch* / *pop*) al colocar o pintar edificios, árboles y caminos sobre el terreno. | Agua brillante con barquitos y patos nadando, humo de chimeneas, cipreses meciéndose al viento, gente y ovejas caminando, lluvia suave y luz dorada. | Renderizado 3D con shader *pixel-perfect*, generación procedural por adyacencia (estilo *Wave Function Collapse*) y animaciones ambientales por *vertex shader*. | Animación de viento en árboles y agua por *vertex shader* (casi gratis en GPU móvil) + detalles ambientales diminutos (humo, pájaros, reflejos de agua) que dan alma al mapa. |

#### Bloque B — Fichas R11–R18

| Enlace o referencia | Qué se ve (1–2 frases) | Estilo visual | Sensación de peso | Sensación de vida | Técnica aparente / hipótesis | Qué copiaríamos como principio para mundo abierto móvil |
|---|---|---|---|---|---|---|
| **#11** — *Cairn* (`@elreagamingok`) | Simulador de escalada y supervivencia en montaña donde armas tu propia ruta en paredes verticales, vendando tus dedos, gestionando agua/comida, armando campamento y resistiendo tormentas. | Cómic / novela gráfica 3D estilizada (*cel-shading* suave con contornos tipo *ligne claire*). | Tensión muscular y temblor en las extremidades al sostenerse, mochila cargada, cuerdas tensándose y caídas con física dura de impacto. | Nubes envolviendo picos, tormentas de nieve iluminadas con linterna frontal, arcoíris, viento en cintas y tela, y gestos cotidianos íntimos. | Cinemática inversa (IK) procedural para manos y pies, *cel-shading* con iluminación atmosférica y micro-animaciones táctiles. | IK ligero para que el personaje pise escalones o se apoye en vehículos de forma natural + gestos táctiles breves (cargar combustible, reparar) que humanizan el mundo. |
| **#12** — Conducción en Desierto/Playa (`@mamon.xx` — Godot) | Un todoterreno 4x4 en cámara cenital atraviesa un desierto rompiendo vallas de madera y derrapa por la arena de una playa junto a olas turquesas mientras ahuyenta gaviotas. | *Low/mid-poly* estilizado con iluminación solar limpia y cálida (diorama *top-down* en Godot). | Destrucción física de cercas de madera al chocar, densas columnas de arena levantadas por las llantas, derrapes con inercia y surcos profundos permanentes en la arena. | Gaviotas que levantan vuelo al acercarse el auto (proyectando sombras), olas con espuma animada en la orilla, pastizales y luz cálida. | Motor Godot 3D, física vehicular con derrape, deformación/huellas en terreno (*render target*), partículas de polvo, shader de agua costera e IA reactiva de aves. | **Imprescindible para Motor City:** fauna reactiva barata (aves/palomas que huyen al pasar el auto), *props* urbanos rompibles (vallas, conos) y surcos persistentes en arena/tierra. |
| **#13** — Acción/Supervivencia Pixel 3D (`@indie.gamesdaily`) | Tráiler de un juego urbano oscuro post-soviético que alterna sin cortes entre vista isométrica, plano lateral, disparos sobre el hombro y conducción nocturna en primera persona bajo lluvia. | Pixel art 3D / HD-2D oscuro y cinematográfico (baja resolución con iluminación dinámica). | Paso retumbante de un tren por las vías, retroceso seco al disparar, parabrisas que se agrieta al atropellar un enemigo y caídas pesadas al saltar del tren. | Limpiaparabrisas barriendo gotas de lluvia, faros iluminando árboles nocturnos, farolas con halos de luz y partículas, y neblina espesa. | Renderizado 3D con shader de pixelación, iluminación dinámica por píxel, transiciones fluidas entre cámaras (isométrica ↔ 3ª ↔ 1ª persona) y cabina interactiva. | Modo de conducción en primera persona con tablero estilizado, limpiaparabrisas y faros nocturnos + transición suave entre cámara aérea/ciudad y cámara cercana. |
| **#14** — *Still The Game* — 4 Estaciones y 1000 NPCs (`@still.the.game`) | Avance del juego isométrico mostrando un ciclo rápido de 24 horas (09:33 a 22:59), cambio de invierno nevado a verano soleado, 1000 ciudadanos simulados con memoria/emociones y apagón nocturno con farolas. | Diorama isométrico 3D realista estilizado (arquitectura de Europa del Este). | Autos abriéndose paso con tracción pesada por la nieve, arquitectura masiva y sombras largas que giran de forma continua sobre los bloques de edificios. | Reloj de 24h con luz cambiante, transición de estaciones, rutinas de 1000 ciudadanos, ventanas encendiéndose de noche y conos de luz de farolas entre árboles. | Ciclo solar dinámico con sombras direccionales, simulación masiva de agentes (ECS ligero para 1000 NPCs) y materiales intercambiables por estación. | Simulación de población con ECS ligero (rutinas simples de tráfico/peatones) + ciclo día/noche donde las ventanas y farolas se encienden progresivamente al anochecer. |
| **#15** — Ciudades Reales en Pixel Art (65 ciudades con IA) | Mapa web interactivo de 65 ciudades reales (Madrid, Barcelona, Valencia, CDMX, Buenos Aires) dibujadas edificio a edificio en pixel art isométrico con IA, con minijuegos de carreras, vuelo y construcción colaborativa. | Pixel art isométrico detallado (estética *SimCity 2000* / ilustración arquitectónica). | Densidad arquitectónica real que da escala tangible a las avenidas, derrapes simples en curvas y sensación de altura al sobrevolar edificios con sombra proyectada. | Construcción colaborativa en vivo (jugadores levantando la Sagrada Familia piedra a piedra), carreras con rivales y nubes deslizándose sobre el mapa. | Generación asistida por IA de *tilesets* isométricos desde datos geográficos reales, motor web 2D de zoom fluido y capas multijugador ligeras. | Minijuegos rápidos integrados sobre el mismo mapa abierto (carreras por avenidas, vuelos de reconocimiento, retos de ubicación o eventos comunitarios). |
| **#16** — *CityRT* (`cityrt.com/play/`) | Constructor y simulador de ciudades 3D que corre directo en el navegador: trazas calles, levantas edificios con andamios, gestionas asesores con personalidad y desatas desastres (tornados, zombis). | Cómic / *cel-shading* 3D con contornos negros (*outlines*) y paleta europea cálida. | Edificios en obra con andamios y polvo, ruinas y calles destrozadas tras desastres, y humo denso saliendo de fábricas. | Tráfico continuo de autos/trenes, peatones, asesores con diálogos reactivos, sombras de nubes, botones para "caminar" a pie de calle y emergencias dinámicas. | WebGL / Three.js optimizado para navegador, *cel-shading* con detección de bordes, interfaz de tarjetas limpia y cámara orbital + peatonal. | Estética *cel-shading* con contornos finos corriendo fluida en web/móvil + botón para bajar a caminar por las calles que creaste + eventos de desastre/emergencia. |
| **#17** — *Miniopolis* (Edificios Modulares + Filtros) | Herramienta de construcción arquitectónica donde levantas un edificio piso por piso con bloques brillantes, añades balcones, ascensores y antenas, y alternas filtros visuales en vivo (*Comic, CRT, Vintage, Vibrant*). | Realista estilizado / maqueta arquitectónica con filtros de post-procesado intercambiables. | Golpe seco con nube de polvo, chispas y micro-vibración cada vez que encaja una planta o módulo; sombras arquitectónicas sólidas. | Peatones diminutos caminando por la acera, agua del puerto con reflejos, árboles y transformación total de la atmósfera al cambiar de filtro. | Construcción modular por grilla/extrusión (*snapping* inteligente), partículas de impacto al construir y **pipeline de post-procesado intercambiable** (LUTs, *outlines*, CRT). | **Oro para el editor de Motor City:** construcción modular rápida de edificios + **selector de filtros visuales en tiempo real** (*Comic, Vintage, CRT, Vibrant*) para cambiar el estilo del motor con un clic. |
| **#18** — *VoxPix* (`github.com/andyeswong/voxpix`) | Herramienta *open-source* (MIT) "hecha por agentes para agentes" donde una IA genera un paisaje completo (río, lago, castillo, casas, árboles, 11 antorchas) en 0.08 s vía código (`vp.box`, `vp.water`, `vp.light`), convirtiendo vóxeles en pixel art. | Vóxel 3D renderizado a pixel art isométrico con iluminación dinámica. | Bloques volumétricos con relieve sólido y sombras proyectadas nítidas que definen el terreno. | Transición suave de día a noche donde se encienden 11 luces cálidas (antorchas y ventanas) iluminando dinámicamente el mapa pixelado. | API programática de vóxeles controlada por agentes IA (sin ratón), proyección ortográfica a pixel art e iluminación dinámica por vóxel. | **Pieza clave para desarrollar con Claude:** exponer una API en código limpio (`city.road()`, `city.building()`, `city.light()`) para que **Claude genere y modifique barrios enteros en milisegundos**. |

#### Bloque C — Fichas R19–R25

| Enlace o referencia | Qué se ve (1–2 frases) | Estilo visual | Sensación de peso | Sensación de vida | Técnica aparente / hipótesis | Qué copiaríamos como principio para mundo abierto móvil |
|---|---|---|---|---|---|---|
| **#19** — *Still The Game* — Evolución Nieve (`@still.the.game`) | Comparativa "cómo empezó vs. cómo está ahora": pasa de un todoterreno *low-poly* probando suspensión sobre una rampa de madera a una ciudad invernal nevada con faros, derrapes y huellas profundas. | Realista estilizado / diorama isométrico 3D atmosférico. | Suspensión muy visible al cruzar listones de madera, derrape con inercia en la nieve, frenado pesado y surcos/huellas permanentes hundidos por las llantas. | Copos de nieve cayendo en 3D, faros del auto proyectando sombras largas a través de árboles secos y nubes de nieve levantadas al acelerar. | Física de suspensión, deformación/huellas en nieve (*render texture* dinámico), iluminación direccional de faros y partículas de nieve. | Huellas dinámicas en barro/nieve/arena mediante *render target* ligero + faros con sombras dinámicas de noche para conducción táctil. |
| **#20** — *Induction Bench* — Campo Magnético 3D (`@sebaslopezinnova`) | Simulador científico 3D hecho con Claude Opus 5.5 donde el usuario mueve un imán por una bobina, cambia materiales y ve en vivo las líneas de campo magnético, un osciloscopio y un galvanómetro. | Técnico / científico 3D oscuro (estética de laboratorio de precisión con UI clara). | Inercia y amortiguación (*damping*) al arrastrar/soltar el imán; deformación elástica continua de las líneas de flujo. | Líneas de campo 3D que se reacomodan al instante, agujas analógicas vibrando, gráficas del osciloscopio en vivo y brillo reactivo. | Simulación física en tiempo real (WebGL/Three.js), renderizado de líneas/vectores 3D, shaders por intensidad y telemetría sincronizada. | Un **laboratorio/depurador de físicas en vivo** integrado en Motor City (gráficas de suspensión, agarre y torque) para calibrar el peso de los vehículos con Claude. |
| **#21** — *AngioSim* — Corazón 3D (`@sebaslopezinnova`) | Herramienta médica 3D hecha con Claude que muestra un corazón translúcido con arterias coloreadas junto a una vista simulada de rayos X (angiograma) sincronizada con un brazo robótico virtual. | Visualización médica 3D translúcida + monocromo de rayos X (UI oscura profesional). | Rotación suave y precisa de la cámara y del brazo mecánico sincronizado; contraste de densidad en la proyección radiográfica. | Profundidad anatómica por transparencias y capas iluminadas; respuesta simultánea de múltiples vistas (3D + 2D proyectado). | Renderizado *multi-viewport* sincronizado, shaders de transparencia/Fresnel (*X-ray*) y proyección ortográfica en tiempo real. | Vista de "rayos X" o corte transparente en el taller mecánico de Motor City para inspeccionar motor, chasis, suspensión y daños internos en 3D. |
| **#22** — *FireTrace* — Mapa de Incendios 3D (`@sebaslopezinnova`) | Plataforma 3D hecha con Claude Opus 5.5 que simula la propagación de incendios forestales sobre terreno topográfico real, con línea de tiempo, cámara de drones en vivo y visión térmica/infrarroja. | Cartografía 3D realista / táctico satelital con capas de datos y visión térmica (FLIR). | Relieve topográfico real con escala masiva, avance implacable del frente de fuego y movimiento aéreo estable de los drones. | Propagación dinámica del incendio por el terreno, columnas de humo, íconos de unidades, telemetría climática y cambio entre cámara óptica y térmica. | Terreno 3D con mapas de elevación (DEM), simulación de propagación por grilla/celdas, *picture-in-picture* (dron) y shader térmico. | Un **mapa táctico 3D / modo dron** para explorar la ciudad, monitorear eventos dinámicos (incendios, tráfico, clima) y activar visión térmica o nocturna. |
| **#23** — *Ballpoint Gambit* — Ajedrez en Cuaderno (`@sebaslopezinnova`) | Juego de ajedrez hecho con Claude Sonnet 5.5 dibujado a mano con lápices de colores y bolígrafo sobre papel de cuaderno, donde cada pieza es una criatura con personalidad y los márgenes tienen garabatos animados. | Ilustración a mano / cuaderno escolar (lápiz de color, bolígrafo y textura de papel). | Saltos con arco y pequeño impacto al caer la pieza; empujones cómicos y micro-pausas cuando una criatura captura a otra. | Criaturas que parpadean, se asustan o celebran; garabatos vivos en los márgenes (ballena, sol, luna, notas) y trazos que se dibujan solos. | Animación 2D procedural y por cuadros (*spritesheets*), *squash & stretch* por código y textura de papel superpuesta (*multiply*). | Aplicar una **UI diegética tipo libreta/mapa de papel** (libreta de misiones, planos dibujados a mano, *squash & stretch* en botones) para dar personalidad propia. |
| **#24** — 20 Haikus Animados en Código (`@sebaslopezinnova`) | Colección de 20 poemas cortos (haikus) generados con Claude Haiku 5.5, cada uno acompañado por una micro-animación artística minimalista dibujada 100% con código JavaScript (lluvia, ondas, nieve, tranvía, brasas). | Minimalista / arte generativo 2D (tinta, papel, grabado y diagramas poéticos). | Ritmo pausado de las ondas en el agua, pliegue del papel y tensión de las cuerdas vibrantes. | Gotas formando círculos concéntricos, copos cayendo, líneas de tranvía avanzando, brasas parpadeando y vegetación creciendo proceduralmente. | Arte generativo puro en **HTML5 Canvas / JavaScript** (sin assets pesados), ruido procedural y física ligera de ondas/partículas. | Usar **Canvas / shaders procedurales ligeros** para efectos atmosféricos de pantalla (gotas en el parabrisas, ondas en charcos, pantallas de carga) con peso casi nulo en MB. |
| **#25** — Apuntes a Mano → Fuente Tipográfica (`@sebaslopezinnova`) | Flujo automatizado con Claude Opus 5.5 que toma 120 fotos de apuntes a mano, limpia el papel, vectoriza los trazos conservando imperfecciones y genera una fuente real (`.TTF`/`.WOFF2`) con 3 variantes por letra. | Tipografía artesanal / diseño editorial limpio sobre papel rayado. | Trazos vectoriales limpios con grosor orgánico consistente y variaciones sutiles al escribir. | Animación de escritura letra por letra y alternancia automática de variantes (*OpenType alternates*) para que el texto parezca vivo. | Visión por computadora + vectorización de esqueletos de trazo (*stroke path*) + compilación automática de fuentes con *kerning* y glifos múltiples. | Crear una **tipografía propia** para carteles de la ciudad, matrículas, grafitis y menús de Motor City usando pipelines con Claude, evitando fuentes genéricas. |

---

### 4. Trazabilidad y grado de comprobación de las 25 fichas

Los nombres de los MP4 se abrevian por legibilidad; se refieren a archivos aportados por el usuario, no a URLs de Instagram confirmadas. Los muestreos visuales de los **nueve archivos nuevos** se realizaron alrededor del 20 %, 50 % y 80 % de su duración; los anteriores ya se habían muestreado en el informe inicial.

| Ficha | Nivel de evidencia | Archivo/indicio asociado | Límite de la comprobación |
|---|---|---|---|
| R01 | **Directa** | `La batuta de un director de orquesta…(.mp4` | Secuencias artísticas del juego; origen y algoritmos por confirmar |
| R02 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R03 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R04 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R05 | **Directa** | `Brad Pitt_s 4 best movies…mp4` | Recreaciones estilizadas; no se infiere el pipeline exacto |
| R06 | **Directa** | `Project Zomboid nunca había sido tan inmersivo…mp4` | Personaje e interiores 3D; naturaleza exacta del mod por confirmar |
| R07 | **Directa** | `VID_20261119_162639_381.mp4` | Rover 3D y controles; técnica vehicular interna no comprobada |
| R08 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R09 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R10 | **Indirecta** | `Instagram DfvyT1QIFIQ; descripción independiente en informe original` | Contenido atribuido a Town Brush; no se inspeccionó el reel original |
| R11 | **Directa** | `VID_20261119_162235_462.mp4` | Escalada y montaña, inspección en entrega anterior |
| R12 | **Directa** | `VID_20261119_162206_705.mp4` | Todoterreno sobre arena y costa; agua y huellas visibles |
| R13 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R14 | **Directa** | `VID_20261119_162228_194.mp4` | Barrio, estaciones y horario; número/memoria de NPC no auditados |
| R15 | **Directa** | `¿Sabrías decir en qué esquina de tu ciudad estás…mp4` | Mapas urbanos estilizados y elementos de interfaz |
| R16 | **Directa** | `Now u can build your own city(MP4).mp4` | Constructor de ciudad y ajustes; tecnología web concreta por confirmar |
| R17 | **Directa** | `Using a variety of block types… Miniopolis…mp4` | Edificios modulares y comparación de filtros en pantalla |
| R18 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R19 | **Directa** | `VID_20261119_162439_208.mp4` | Comparativa del prototipo con escena nevada |
| R20 | **Directa** | `Claude compartió…_4.mp4` | Líneas de campo magnético 3D y controles |
| R21 | **Directa** | `Claude compartió…_5.mp4` | Visualización de corazón y paneles médicos |
| R22 | **Directa** | `Claude compartió…_1.mp4` | Mapa de incendio sobre relieve y vistas de datos |
| R23 | **Directa** | `Claude compartió…_2.mp4` | Ajedrez ilustrado y movimientos por cuadros |
| R24 | **Directa** | `Claude compartió…_6.mp4` | Animaciones de haikus y composiciones gráficas |
| R25 | **Directa** | `Claude compartió…_3.mp4` | Ejemplos de fuente manuscrita y proceso visual |

**Resultado del cruce:** 17 fichas con clips directos, 1 ficha sustentada indirectamente, 7 fichas descritas solo por Gemini. **No** se han verificado cifras como “1000 NPC con memoria”, “en 0,08 segundos” o “60 FPS en cualquier celular”.

---

### 5. Registro íntegro de los 14 enlaces originales de Instagram

> Esta tabla conserva las **siete columnas solicitadas**. Por el bloqueo/limitación de acceso directo a los reels, trece entradas se registran honestamente como no verificadas. El único vínculo atribuible de forma secundaria es R10 / *Town Brush* con el enlace 03. **No se asignan los demás archivos MP4 a las URLs por coincidencias temáticas solamente.**

| Enlace | Qué se ve (1–2 frases) | Estilo visual | Qué da peso | Qué da vida | Técnica que parece usar | Qué copiaríamos para móvil |
|---|---|---|---|---|---|---|
| [01 — De64QQuCsyG](https://www.instagram.com/reel/De64QQuCsyG/) | **No verificable:** el contenido visual del reel no pudo inspeccionarse. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** documentar un efecto concreto después de ver el reel. |
| [02 — Dfaux2QFsay](https://www.instagram.com/reel/Dfaux2QFsay/) | **No verificable:** no hay imágenes accesibles del contenido. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** extraer una mecánica o recurso visual comprobado. |
| [03 — DfvyT1QIFIQ](https://www.instagram.com/reel/DfvyT1QIFIQ/) | **Confirmación indirecta:** muestra *Town Brush*, un juego de pixel art donde, al pintar con el dedo, el paisaje de un pueblo cobra vida. La fuente secundaria lo describe como un proyecto del autor del reel; no se vio el metraje original. | **Pixel art** (según fuente secundaria) | No hay prueba suficiente de inercia, colisiones o rebotes; el gesto de pintar se asocia a una transformación del entorno. | El escenario responde a la acción del usuario: elementos del pueblo se activan o se transforman. | **Hipótesis:** pincel como entrada, cambios de estado y animaciones ligadas a zonas pintadas; los algoritmos exactos no se conocen. | «Toque que despierta el mundo»: al tocar, limpiar, regar o reparar una superficie, activar animación, luz, sonido y cambios persistentes sin exigir gráficos costosos. |
| [04 — De9tpl3yakv](https://www.instagram.com/reel/De9tpl3yakv/) | **No verificable:** Instagram no permitió ver la escena. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** seleccionar una técnica solo tras revisar imágenes. |
| [05 — DfJFFGQRG2N](https://www.instagram.com/reel/DfJFFGQRG2N/) | **No verificable:** no se recuperaron fotogramas ni una descripción independiente identificable. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** registrar interacción y coste potencial en móvil. |
| [06 — DfpsKcEKZNx](https://www.instagram.com/reel/DfpsKcEKZNx/) | **No verificable:** contenido audiovisual inaccesible. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** decidir después si aporta física, vida ambiental o lenguaje visual. |
| [07 — Dfkim-zvyVB](https://www.instagram.com/reel/Dfkim-zvyVB/) | **No verificable:** no se pudo observar el reel. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** evaluar una sola aportación reutilizable al motor. |
| [08 — De7qMG8iZdh](https://www.instagram.com/reel/De7qMG8iZdh/) | **No verificable:** no existe material visual comprobable en esta revisión. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** verificar antes de proponer un efecto. |
| [09 — Dfpb3_vHFPb](https://www.instagram.com/reel/Dfpb3_vHFPb/) | **No verificable:** sin acceso al video original. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** aislar técnica y adaptar su calidad por dispositivo. |
| [10 — Dc_s5CPsstT](https://www.instagram.com/reel/Dc_s5CPsstT/) | **No verificable:** no hay evidencia directa de su escena. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** registrar controles, cámara y respuesta si aparecen. |
| [11 — De9ZhRAIOhJ](https://www.instagram.com/reel/De9ZhRAIOhJ/) | **No verificable:** imágenes no accesibles para inspección. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** evaluar iluminación, animación o simulación según lo que muestre. |
| [12 — DdwLGJmjjvQ](https://www.instagram.com/reel/DdwLGJmjjvQ/) | **No verificable:** no pudo establecerse qué ocurre en pantalla. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** observar primero y después asignar prioridad técnica. |
| [13 — DfRe6pQzWzS](https://www.instagram.com/reel/DfRe6pQzWzS/) | **No verificable:** faltan fotogramas verificables. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** elegir una solución reproducible a partir de evidencia. |
| [14 — DfDkDxQiQS7, imagen 2](https://www.instagram.com/p/DfDkDxQiQS7/?img_index=2) | **No verificable:** se trata de una publicación con parámetro de imagen 2; ese fotograma no fue accesible. | No determinable | No evaluable | No evaluable | No inferible sin la imagen | **Pendiente:** extraer principios de composición o dirección artística cuando se aporte la diapositiva. |

**URL n.º 3 — fuente de identificación indirecta:** [reseña/revisión externa del proyecto Town Brush](https://develog.develrocket.com/@wnqudgus1234/쇼츠-뜯어보기-공유가-좋아요의-66배-어제-오늘-뜬-쇼츠-10개), mencionada en el primer análisis. Vincula el identificador `DfvyT1QIFIQ` al proyecto; **no** evidencia su física o código.

---

### 6. Análisis audiovisual anterior: nueve MP4 (seis proyectos, dos juegos y un collage)

> Se mantiene el análisis independiente original. Los clips A1–A6 corresponden a los proyectos R20–R25; B1 equivale a R11, B2 a R19. El montaje A0 no es un noveno proyecto. **No se vinculan aquí a ninguna URL de Instagram.**

| Archivo anterior | Qué se ve | Estilo | Peso observado | Vida observada | Técnica aparente | Aplicación sugerida |
|---|---|---|---|---|---|---|
| **A0.** Compilado `…¿Cu(M.mp4` (13,6 s) | Montaje de seis proyectos: incendio sobre mapa, ajedrez dibujado, fuente manuscrita, campos magnéticos, corazón 3D y poesía animada. | Mixto: visualización 3D, dibujo manual, interfaz y gráfico generativo. | No permite medir física de personajes; es un montaje promocional. | Variedad de escenarios que responden a datos o interacción. | Montaje con capturas, animación de interfaces y contenidos 2D/3D. | Referencia de **amplitud de sistemas**, no de física o «peso». |
| **A1.** Compilado `…¿Cu_1.mp4` (60 s) | Visor de terreno montañoso con frente de incendio, rutas y vistas superpuestas. | Terreno 3D de apariencia satelital, interfaz técnica. | Escala y relieve sugieren volumen; no se muestran golpes ni inercia del jugador. | El incendio cambia de posición/estado sobre el mapa. | Cámara sobre terreno, capas de datos, color para representar calor e interfaz temporal. | Mundo por **sectores y capas**; propagación local de eventos (fuego, humo, alertas) según reglas y presupuesto. |
| **A2.** Compilado `…¿Cu_2.mp4` (60 s) | Ajedrez con tablero cuadriculado y figuras ilustradas como recortes dibujados a mano, cambiando de posición. | Ilustración de cuaderno; cómic infantil/dibujo manual. | Movimientos discretos; no se observan impactos de fuerza relevantes. | Personajes/piezas cambian de posición; escenario reconocible y expresivo. | Sprites 2D, composición por capas, estados de turno y transición de posiciones. | **Siluetas legibles, identidad gráfica** y animaciones económicas para mapas, interiores y minijuegos. |
| **A3.** Compilado `…¿Cu_3.mp4` (60 s) | Conversión de páginas manuscritas en caracteres tipográficos, con etapas de segmentación y comparación. | Interfaz editorial, papel y tinta. | No aplica física corporal. | Una intervención humana se vuelve un sistema reutilizable. | Análisis y trazado de glifos; esta es una descripción visual, no una verificación del método. | Herramienta de autoría para **grafitis, letreros y diarios del mundo**, separada del motor de juego. |
| **A4.** Compilado `…¿Cu_4.mp4` (60 s) | Visualizador 3D de imanes y líneas de campo que se reorganizan al cambiar su configuración, con paneles de controles y gráficas. | Científico/abstracto 3D, neón sobre fondo oscuro. | El cambio de trayectoria sugiere fuerzas, pero no demuestra un motor de cuerpos rígidos. | El sistema reacciona continuamente a parámetros. | Trazado de líneas/curvas, integración de parámetros en tiempo real y cámara orbital. | **Campos de influencia** para viento, corrientes, tráfico y partículas; usar aproximaciones, no resolver campos físicos completos en cada móvil. |
| **A5.** Compilado `…¿Cu_5.mp4` (12,4 s) | Anatomía del corazón en 3D y vasos coloreados, junto con imagen angiográfica, curvas e interfaz de inspección. | Visualización médica 3D y paneles de diagnóstico. | Volumen y estratificación; sin interacción de choque observable. | Exploración de estructuras interrelacionadas. | Modelo 3D, transparencia/capas de color y vistas sincronizadas. | **Inspección por capas y resaltado contextual** de vehículos, edificios u objetos interactivos. |
| **A6.** Compilado `…¿Cu_6.mp4` (40 s) | Poemas breves sobre fondos cambiantes con patrones de líneas, círculos, nieve, textura y composición ilustrada. | Gráfico generativo, acuarela aparente en algunas escenas, trazos y collage. | No hay física de locomoción. | Movimiento de líneas y texturas; cada composición produce ambiente. | Animación procedural 2D por líneas, fondos con textura y transiciones. | **Vida ambiental barata**: hojas, reflejos, letreros, polvo y viento representados con pocas capas procedurales. |
| **B1.** `VID_20261119_162235_462.mp4` (39,6 s) | Montañismo en paredes rocosas, pasos elevados y acantilados; se ven escaladas, cuerdas y un personaje que se sujeta a la pared. | 3D estilizado con aspecto de ilustración/novela gráfica ligera. | Riesgo de caída, agarres, suspensión, distancia vertical y reajustes del cuerpo frente a la pared. **No** puede inferirse el algoritmo exacto de física del video. | Nubes, bruma, relieve y cambios de encuadre aportan atmósfera. | Animación de escalada, detección de superficies, cámara en tercera persona y uso visible de cuerda. | **Contactos confiables, esfuerzo legible y cámara con tensión controlada**; aplicarlo a correr, trepar, aterrizar y colisionar. |
| **B2.** `VID_20261119_162439_208.mp4` (14,8 s) | Comparación «How it started vs how it's now»: vehículo y rampa de un prototipo sencillo frente a una calle isométrica nevada con automóviles, árboles, edificios y huellas. | 3D estilizado, cámara isométrica; rasgos low poly, iluminación más atmosférica en la versión posterior. | Vehículo y rampa dan contexto de apoyo y desplazamiento; **no** bastan para certificar suspensión ni masas simuladas. | Nieve en movimiento, ambiente urbano, sombras, huellas/marcas y paleta de invierno. | Cámara elevada fija/isométrica, composición modular, partículas y materiales o texturas de nieve. | **Progresión de fidelidad** sin rehacer la simulación: mismo mundo lógico, distinta densidad de clima, iluminación, detalle y efectos. |

**Conclusiones de los adjuntos anteriores:** (1) «peso» depende del cuerpo apoyándose y resistiendo a su entorno, no del detalle poligonal; (2) «vida» se percibe cuando el mundo cambia y responde; (3) un mismo diseño puede aspirar a distintas capas visuales, aunque las imágenes no prueban que sus versiones compartan código.

---

### 7. Inspección directa: mapa de 17 fichas con evidencia en videos

Esta tabla resume **lo observado** de los videos identificados de ambas tandas; cumple una función diferente a las fichas interpretativas de Gemini. No pretende certificar que la técnica inferida esté implementada en el proyecto original.

| Ficha / proyecto | Imagen observada | Estilo aproximado | Peso o vida que comunica | Técnica reutilizable propuesta |
|---|---|---|---|---|
| R01 · The Sound of Fury | Combates estilizados, trazos gráficos, coreografía | 3D | Recuperación tras impacto y diseño sonoro sincronizados | Contornos y VFX, sin asumir shaders concretos |
| R05 · Brad Pitt PS2/GTA recreado | Escenas de películas reproducidas con estética retro | 2D/3D estilizado | Gestos, conducción y movimiento de personajes | Geometría moderada + texturas expresivas |
| R06 · Project Zomboid — 3ª persona | Interiores domésticos, interacción y personaje en 3ª persona | 3D | Animaciones cotidianas, pausas y presencia corporal | Interacciones contextuales y cámara cercana |
| R07 · Rover interactivo 3D | Rover simulado y vista de ingeniería interactiva | 3D | Movimiento relativo de ruedas/chasis si se valida temporalmente | Panel de telemetría con parámetros ajustables |
| R11 · Cairn / escalada | Persona trepando montaña con cuerdas y agarres | 3D | Apoyos y exposición de altura | Contactos/IK y esfuerzo legible |
| R12 · 4x4 en playa/desierto | Vehículo recorriendo arena y franja de agua | 3D | Estelas y huellas; no comprueba deformación de geometría | Material de suelo + decals y partículas |
| R14 · Still The Game — ciclo diario | Edificios, peatones y cambios de hora/luz | 3D | Tiempo urbano y ritmos de la ciudad | Ciclo de día y horarios agregados para NPC |
| R15 · Ciudades en pixel art | Calles reconocibles representadas con pixel art | 3D | Escala de barrios y minijuegos | Capas cartográficas y tiles isométricos |
| R16 · Constructor de ciudad | Interfaz de creación de ciudad y objetos | 3D | Colocación y evolución visible de sectores | Generación modular, APIs de edición |
| R17 · Miniopolis — editor y filtros | Construcción de edificio y filtros comparados | 3D | Respuesta al colocar piezas y cambio de aspecto | Piezas modulares y perfiles visuales |
| R19 · Still The Game — nieve | Rampa de prototipo frente a entorno invernal | 3D | Ruedas apoyadas y huellas aparentes; no prueba motor físico | Efectos de contacto + ajuste por perfil gráfico |
| R20 · Induction Bench | Campos magnéticos y gráficas variables | 3D | Respuesta continua de sistema a parámetros | Depurador visual de estados y fuerzas |
| R21 · AngioSim | Corazón, vasos y paneles diagnósticos | 3D | Sin impactos, pero lectura volumétrica | Inspector de vehículo por capas |
| R22 · FireTrace | Terreno, incendios y controles técnicos | 3D | Propagación visible sobre mapa | Simulación por sectores, minimapa táctico |
| R23 · Ballpoint Gambit | Tablero y criaturas dibujadas | 2D/ilustración | Movimiento y reacción de piezas | UI diegética y sprites animados |
| R24 · Haikus animados | Poemas con movimiento de líneas y partículas | 2D/ilustración | Ritmo ambiental suave | Efectos atmosféricos 2D de bajo costo |
| R25 · Tipografía manuscrita | Carácteres de escritura creados desde apuntes | 2D/ilustración | Variación de trazos, no interacción física | Identidad tipográfica original para UI y letreros |

**Auditoría del material nuevo:** se confirmaron visualmente las fichas R01, R05, R06, R07, R12, R14, R15, R16 y R17 con los nueve MP4 añadidos en la segunda entrega. La observación directa **mejora la identificación de escenas**; no confirma los algoritmos específicos sugeridos por Gemini. Si se desean mediciones de aceleración, huellas o rebotes, se requeriría examen cuadro a cuadro con secuencias dedicadas y acceso al juego o su código.

---

### 8. Las cinco técnicas más útiles: convergencia de ambas evaluaciones

La priorización combina **frecuencia cualitativa de rasgos visibles**, relevancia para el objetivo «peso + vida» y viabilidad móvil. No es un conteo estadístico de mecanismos ocultos.

| Orden | Técnica unificada | Peso que añade | Vida que añade | Implementación mínima móvil | Escalado futuro |
|---|---|---|---|---|---|
| **1** | **Física perceptual y feedback táctil**: inercia, contactos, suspensión, hitstop, recuperación, sonido, polvo | Aceleraciones, apoyo de ruedas/pies, retroceso y choques legibles | Objetos y personajes reaccionan al jugador | Actualización fija, 1 vehículo + 1 personaje + perfiles de materiales, desaceleración coherente, cámaras suaves | Simulaciones de neumáticos avanzadas, destrucción controlada, ragdoll cuando proceda |
| **2** | **Ambiente dinámico coherente**: día/noche, clima, viento, materiales mojados, luces reactivas | Faros y sombras comunican escala y velocidad | Peatones, luz, vegetación, clima y audio cambian juntos | Reloj global, estados de clima, viento simple, luces selectivas, 3–5 eventos locales | Estaciones, microclimas, iluminación y audio espacial más completos |
| **3** | **Animaciones contextuales y estados reactivos**: IK, gestos cotidianos, sprites, objetos funcionales | Agarrar, subir, frenar, caer, reparar y activar tienen peso | NPC no parecen estatuas; señales e interfaces responden | Máquina de estados y pequeñas transiciones con pooling | IK completo, animación procedural y comportamiento más rico |
| **4** | **Estilo artístico escalable**: low/mid-poly, cel-shading selectivo, pixel 3D, niebla, filtros | Lectura de masas, escala y profundidad | Densidad aparente de ciudad y atmósfera | Siluetas claras, sombras baratas y filtros opcionales | Materiales y reflejos superiores con el mismo estado lógico |
| **5** | **Simulación desacoplada y streaming**: agentes por niveles, sectores, APIs declarativas | El soporte y el contacto siguen reglas pese a cambios de cámara/calidad | Persistencia, tráfico, población y eventos fuera de pantalla | Sectores + estado resumido + entradas/salidas versionadas | Motor externo, ECS o técnicas de mayor escala según perfiles |

**Referencias cruzadas:** R01/R11/R12/R19 enfatizan contacto y sensación de masa; R14/R19/R22 enfatizan vida ambiental; R17/R23/R24/R25 muestran filtros o lenguajes gráficos; R15/R16/R18 aportan ideas para edición y mundo modular; R20/R21 aportan visualización y depuración. En R18 las afirmaciones técnicas dependen de Gemini, no de un video inspeccionado.

#### 8.1. Priorización original del análisis anterior (conservada)

> **Muestra efectiva:** seis demostraciones del compilado + los dos clips de juegos = **ocho propuestas visuales diferentes**, con observación por fotogramas; los recuentos orientativos no equivalen a auditoría de código ni a frecuencias de los 14 enlaces de Instagram. **Más repetida** y **más importante para el juego** son criterios distintos.

| Prioridad | Técnica / patrón visual | Presencia cualitativa en la muestra | Por qué importa en móvil | Implementación propuesta |
|---|---|---|---|---|
| **1** | **Estados visibles que evolucionan en el tiempo** | Muy frecuente: incendio, ajedrez, campos, corazón, poesía, escalada, calle nevada. | Genera sensación de mundo activo sin exigir más polígonos. | Máquina de estados, transiciones y eventos programados; diferenciar simulación cerca del jugador y decorado lejano. |
| **2** | **Respuesta visual inmediata a una acción o cambio de parámetro** | Frecuente: trazos que transforman el pueblo (*Town Brush*, fuente externa), posiciones, capas médicas, campos y acciones del personaje. | El jugador interpreta que sus decisiones tienen efecto. | Entrada → cambio de estado → animación → sonido → persistencia opcional. Presupuesto de reacción perceptual bajo. |
| **3** | **Cámara y lectura de profundidad/escala** | Frecuente: terreno 3D, imanes, corazón 3D, escalada y escena urbana isométrica. | Permite sentir distancias y alturas sin gráficos hiperrealistas. | Cámara con límites, seguimiento amortiguado, horizonte legible, parallax y controles consistentes. |
| **4** | **Capas ambientales animadas y efectos de atmósfera** | Presente en varios: fuego, poemas, nieve, cielo/bruma de montaña. | La vida ambiental puede costar menos que añadir más NPC con IA completa. | Partículas por zonas, shader simple de viento, niebla por distancia, audio ambiental y variación temporal. |
| **5** | **Contacto, suspensión y movimiento dependiente de la superficie** | Evidencia concentrada en la escalada; indicios de interacción vehículo–suelo en el clip urbano. No es el patrón más frecuente, **pero sí el más importante para lograr «peso»**. | Una caída o un aterrizaje creíbles afectan más que duplicar calidad de texturas. | Controlador cinemático robusto o cuerpo rígido calibrado, reacción de cámara, animación por contactos y audio/materiales. |

**Importante:** no hay base para afirmar que «sacudida de cámara», «ragdoll», «física de suspensión real», «sombras en tiempo real» o «animación cuadro a cuadro» estén implementadas en determinados videos. Son técnicas **propuestas**, no observadas de manera concluyente.

#### 8.2. Priorización original de Gemini (conservada como comparación)

> Términos como “raycast”, “render targets”, “ECS” y “vertex shaders” son técnicas **propuestas o atribuidas por Gemini**. No se confirmaron por inspección de metraje.

1. **Estética Estilizada de Bajo Costo Poligonal + Filtros Intercambiables (*Low/Mid-Poly*, *Cel-Shading*, Pixel 3D):**
   * *Dónde aparece:* *Motor Town*, *CityRT*, *Miniopolis*, *Townbrush*, *Indie Pixel 3D*, *Cairn*, *The Sound of Fury*, *VoxPix*.
   * *Por qué es clave:* Libera GPU en celulares para mantener 60 FPS estables y permite lograr looks memorables (cómic, diorama, pixel 3D, vintage) mediante *shaders* ligeros de post-procesado.
2. **Física de Suspensión, Inercia, Destrucción Ligera y Deformación de Suelo (*Raycast* + *Body Roll* + Huellas):**
   * *Dónde aparece:* *Motor Town*, *Fable Rover*, *Still The Game*, *Godot Desierto/Playa*.
   * *Por qué es clave:* Nada comunica mejor el **peso** que ver la carrocería inclinarse, las ruedas absorber baches, los props romperse al impacto y las llantas dejar surcos reales en nieve o arena.
3. **Micro-Feedback Táctil y Animación Reactiva (*Hitstop*, *Squash & Stretch*, Polvo, IK y Animaciones Cotidianas):**
   * *Dónde aparece:* *Miniopolis*, *Cairn*, *The Sound of Fury*, *Mythictale*, *Townbrush*, *Ballpoint Gambit*, *PZ 3D*.
   * *Por qué es clave:* Polvo al encajar un bloque, nieve levantada al acelerar, micro-pausas de golpe y gestos pequeños (vendarse, atornillar, empujar) hacen que cada acción se sienta física y viva.
4. **Iluminación Dinámica Atmosférica y Vida Ambiental Barata (Ciclo 24h, Faros, Fauna Reactiva y *Vertex Shaders*):**
   * *Dónde aparece:* *Still The Game*, *Godot Playa*, *Indie Pixel 3D*, *Maciej Drabik*, *Townbrush*, *VoxPix*, *Haikus JS*.
   * *Por qué es clave:* Sombras largas girando con el sol, faros cortando la niebla nocturna, ventanas que se encienden, aves que huyen y viento moviendo árboles por *vertex shader* llenan la ciudad de **vida** a muy bajo costo.
5. **Simulación Desacoplada, Generación Procedural y Control por API/Datos (ECS + *Chunk Streaming* + Agentes):**
   * *Dónde aparece:* *VoxPix*, *KnoxMap*, *Still The Game* (1000 NPCs), *FireTrace*, *Induction Bench*, *Ciudades Pixel*.
   * *Por qué es clave:* Separar los datos y la simulación del renderizador permite cargar ciudades enormes por *chunks* en móvil, simular cientos de agentes en segundo plano y dejar que **Claude construya y ajuste el mundo por código**.

---

### 9. Lenguaje visual, paletas y mecánicas del informe de Gemini

La siguiente selección conserva las cinco paletas y los seis grupos de mecánicas del informe original. Son **opciones de dirección artística y diseño**, no requisitos simultáneos: aplicar todos los filtros o sistemas a la vez sobrecargaría una primera versión.

#### A. Paletas de Color Recomendadas por Atmósfera
* **Día Urbano / Simulación Limpia** *(Motor Town, Fable Rover, CityRT)*:
  * Asfalto cálido `#3D4046` · Cielo claro `#6BB5E8` · Vegetación viva `#5C9E4F` · Acentos vehiculares `#F2B705` y `#E85D2A`.
* **Costa / Desierto Solar** *(Godot Arena/Playa, Townbrush)*:
  * Arena dorada `#E6B86A` · Agua turquesa `#38A3A5` · Espuma `#F7F9F9` · Sombra cálida `#8C6A43`.
* **Invierno Urbano / Nieve Nocturna** *(Still The Game, Cairn)*:
  * Nieve en sombra `#5A657A` · Azul invernal profundo `#1D2433` · Luz cálida de faros `#FFF3D1` · Silueta de árboles/chasis `#14171F`.
* **Noche Urbana / Post-Soviético / Cyberpunk** *(Maciej Drabik, Indie Pixel 3D)*:
  * Fondo nocturno `#11151C` · Niebla de vapor `#2A3B4C` · Neón cian `#00E5FF` · Luz de freno/peligro `#FF2E63` · Farola ámbar `#FFAE42`.
* **Editorial / Táctico / Laboratorio** *(FireTrace, Induction Bench, Ballpoint Gambit)*:
  * Papel crema `#F4EFE6` · Tinta azul bolígrafo `#24489B` · Alerta térmica `#FF5722` · Visión infrarroja `#2B0B57` → `#FFEA00`.

#### B. Mecánicas, Sistemas y Herramientas Clave a Integrar
1. **Conducción con Física Tangible, Superficies Reactivas y Props Rompibles (*Motor Town* + *Fable Rover* + *Still The Game* + *Godot Playa*):**
   * Suspensión independiente por rueda (*raycast*), inclinación de chasis (*body roll*), tracción diferenciada por terreno (asfalto seco/mojado, arena, barro, nieve), **huellas persistentes** en el piso y destrucción física de cercas, conos y señales.
2. **Cambio Fluido de Cámaras + Modo "Bajar del Auto" (*Indie Pixel 3D* + *CityRT* + *PZ 3D* + *Cairn*):**
   * Alternar sin cortes entre vista aérea/isométrica de ciudad, tercera persona, primera persona al volante (con tablero y limpiaparabrisas) y caminar a pie con micro-animaciones táctiles (empujar auto, cargar gasolina, reparar).
3. **Ciudad Viva: Estaciones, Ciclo 24h, Fauna y Eventos Dinámicos (*Still The Game* + *Godot Playa* + *FireTrace* + *CityRT*):**
   * Ciclo solar de 24 horas con encendido progresivo de ventanas y farolas, cambio de clima/estaciones, aves que huyen al acercarse un vehículo y emergencias urbanas (incendios propagables, tormentas) monitoreables en un **mapa táctico 3D / modo dron**.
4. **Construcción Modular + Filtros Visuales Intercambiables (*Miniopolis* + *KnoxMap* + *Townbrush*):**
   * Generador modular de edificios y manzanas (con *feedback* de polvo e impacto al colocar piezas) + un **selector de filtros de post-procesado en tiempo real** (*Default, Comic, Vintage, CRT, Pixel 3D*) para cambiar la identidad visual del motor sin rehacer los modelos.
5. **Taller "Rayos X" + Laboratorio de Telemetría (*AngioSim* + *Induction Bench*):**
   * Modo translúcido/rayos X en el taller para inspeccionar piezas internas y daños del auto, más un panel de depuración en vivo (gráficas de suspensión, agarre y torque) para afinar físicas junto a Claude.
6. **API "Hecha para Agentes" + Identidad Artesanal (*VoxPix* + *Ballpoint Gambit* + *Handwriting Font*):**
   * Exponer comandos declarativos en código para que **Claude pueda construir barrios, carreteras, luces y misiones directamente por script**, combinando UI diegética tipo libreta y tipografía propia generada a medida.

#### 9.1. Identidad propia recomendada

- **Base visual coherente:** proporciones estilizadas realistas, materiales claros, iluminación horaria creíble, siluetas de vehículo legibles, señales de tráfico y UI funcional. Esta base puede adoptar un filtro cómic/pixel/retro sin sustituir toda la dirección artística.
- **Color al servicio de información:** luces de freno, intermitentes, semáforos y alertas se distinguen incluso si un filtro estilístico cambia la paleta; ofrecer ajustes de accesibilidad.
- **Evitar la copia literal:** los videos son referencias de principios técnicos, no licencias para reproducir personajes, diseños, escenas o nombres de otros creadores.
- **Paquetes y filtros:** los estilos “Default / Comic / Vintage / CRT / Pixel” son un **sistema configurable**, no la promesa de que todos mantendrán idéntico rendimiento; medir su coste real.

---

### 10. Sistema central: cómo lograr «peso» real y perceptible

**Principio:** el peso percibido es una combinación de **dinámica de movimiento + contactos + animación + cámara + sonido**. Aumentar la gravedad por sí solo puede hacer que los controles sean desagradables.

#### 10.1. Movimiento de personajes

- **Aceleración y desaceleración graduales:** distinguir caminar, correr, frenar y girar; curva ajustable por tipo de personaje, superficie y habilidad.
- **Velocidad angular y giro del cuerpo:** pies y torso no rotan instantáneamente en cambios bruscos; anticipación moderada, sin sacrificar respuesta al toque.
- **Contacto con el suelo:** comprobación de pendiente, adherencia, límite de escalón, deslizamiento y sonido por superficie.
- **Saltos/caídas:** altura y duración calculadas; al aterrizar, absorber el impacto con rodillas, desplazamiento leve de cámara y sonido proporcional a la velocidad vertical.
- **Agarres y trepada (si son mecánicas del juego):** definir puntos válidos, alcance, estados de cansancio opcionales y transición clara al suelo. Evitar movimientos que atraviesen paredes.
- **Golpes:** animación de anticipación, contacto definido, impulso/cambio de velocidad razonable y reacción proporcional. Pausa de impacto muy breve **solo cuando encaje**; en móviles no debe bloquear la entrada ni repetirse excesivamente.

#### 10.2. Vehículos y objetos

- Parámetros por tipo: masa, aceleración, frenado, fricción, agarre lateral, velocidad de giro y recuperación después de choque.
- Para vehículos: modelo simplificado de suspensión/rueda y balanceo visual; **física real completa solo si la jugabilidad la exige**.
- Objetos: evitar que todos reboten igual; usar materiales con coeficientes distintos, umbrales de reposo y deformación visual controlada.
- Audio: frenada, impacto, roce, pasos, arrastre y reverberación por tipo de entorno. El sonido informa de la fuerza del contacto.

#### 10.3. Cámara que comunica masa sin marear

- **Seguimiento amortiguado** en vez de «pegar» la cámara al personaje.
- Reacción a aterrizajes e impactos mediante *impulsos cortos*, con intensidad limitada y opción de reducir/desactivar sacudidas.
- Ajustar distancia/altura según velocidad, obstáculo, interiores y conducción.
- Evitar vibración constante, desenfoque agresivo y cambios abruptos de FOV. Dar prioridad a accesibilidad y legibilidad en pantallas pequeñas.

#### 10.4. Regla de calibración

> Si el movimiento parece pesado pero los controles se sienten lentos, Motor City está fallando. La meta es **respuesta inmediata del control, acompañada de inercia y recuperación convincentes**.

### 11. Sistema de «vida» para un mundo abierto móvil

#### 11.1. Capas de simulación

| Capa | Comportamiento cercano al jugador | Comportamiento lejano / fuera de pantalla | Ejemplo visible |
|---|---|---|---|
| **Ambiental** | Hojas, polvo, viento, lluvia y charcos activos | Estado climático y semillas de efectos, sin partículas individuales | El viento mueve vegetación próxima y un letrero oscila. |
| **Población** | NPC con percepción local, navegación y animación | Horarios y ubicaciones agregadas, sin simular cada paso | Gente cambia de ruta, reacciona al clima y retoma rutinas. |
| **Tránsito** | Vehículos con evitación de colisiones y comportamiento vial | Flujo abstracto por vías/sectores | Semáforos, frenadas y rutas coherentes. |
| **Audio** | Emisores 3D en función de distancia y obstáculos, según soporte | Ambientes mezclados por zona, sin cientos de emisores | Rumor de avenida, pájaros en parque, lluvia bajo techo. |
| **Estado de mundo** | Objetos rotos, reparados, recogidos o activados | Registro resumido de cambios persistentes | Un grafiti o vehículo permanece cambiado después de volver. |
| **Tiempo y luz** | Transiciones coherentes de sombra/luz en puntos prioritarios | Parámetros globales de ciclo diario | Cambio progresivo de tonalidad, farolas al anochecer. |

#### 11.2. Sistema de eventos de vida

Formato conceptual: `Estímulo → regla → cambio lógico → representación audiovisual`.

- `VientoFuerte` → el sistema asigna intensidad por distrito → vegetación y telas próximas se inclinan → partículas/audios se ajustan.
- `VehiculoFrena` → se desacelera su estado físico → balanceo visual y luces de freno → sonido según velocidad y pavimento.
- `PersonaSaluda` → IA cambia a interacción → animación breve, mirada hacia jugador → respuesta si el jugador se acerca.
- `EmpiezaLluvia` → humedad por zona → reflejos y salpicaduras cercanos → los NPC modifican rutas o velocidad.
- `ChoqueLeve` → impacto materializado → pequeña deformación/ruido/reacción de peatones cercanos → estado persistente solo si la mecánica lo requiere.

**Economía de simulación:** *el mundo debe recordar más de lo que necesita calcular*. Un NPC lejano puede ser una posición estimada y una agenda; se convierte en un agente completo al entrar en una región activa.

### 12. Arquitectura del Motor City: crecer sin quedar atrapado en un único motor

#### 12.1. Recomendación estructural

**Diseñar Motor City como núcleo de simulación + contrato de datos + adaptadores de representación.** El núcleo no debe depender de las clases particulares de Unity, Godot, Unreal o de un navegador.

```text
                   PROYECTO MOTOR CITY
                           │
                  Reglas y contratos de datos
              (mundo, objetos, acciones, guardado)
                           │
       ┌───────────────────┴───────────────────┐
       │       Núcleo de simulación            │
       │ IA / tráfico / clima / estados /      │
       │ economía del mundo / eventos          │
       └───────────────────┬───────────────────┘
                           │
           Interfaces estables y versionadas
          (Input, Time, Physics, Render, Audio,
           Navigation, Storage, AssetLoader)
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
  Adaptador web       Adaptador Godot      Adaptador Unity
  WebGL/WebGPU*       GDExtension/etc.     Native plug-in/etc.
       │                   │                    │
    Móvil web          Android/iOS            Android/iOS
                           │
                    Adaptador Unreal
                  C++ plug-in / integración
                           │
                      PC / móvil**

* WebGPU solo donde el dispositivo/navegador lo soporte;
  mantener vía compatible o degradación de funciones.
** Según las capacidades y restricciones de la plataforma objetivo.
```

**Advertencia crítica:** no existe un botón para «convertir un juego web en Unreal». Los contratos, datos, modelos y parte del código de simulación **pueden ser portables**; el renderizador, shaders, físicas específicas, UI, controles, compilación y herramientas del editor normalmente requieren adaptaciones o reimplementación.

#### 12.2. Dos rutas factibles

| Ruta | Cuándo elegirla | Ventaja | Coste/riesgo |
|---|---|---|---|
| **A. Prototipo rápido con TypeScript y APIs web** | Si la prioridad es probar jugabilidad en PC/Android/iOS mediante navegador, con distribución offline que lo permita. | Iteración visual rápida; primera *vertical slice* barata. | La lógica dependiente de librerías web **no** se puede portar automáticamente a Unity/Unreal. Exigir datos y reglas independientes desde el día uno. |
| **B. Núcleo portable en C++ o Rust + interfaces C y compilación WASM donde proceda** | Si desde el inicio es requisito reutilizar simulación en web, PC y motores externos. | Mayor control y potencial reutilización de la lógica de juego. | Integración considerablemente más compleja; cada motor requiere adaptadores, pruebas ABI y empaquetado específico. |

**Decisión sugerida:** primero **contratos y un prototipo funcional**; escoger B si la portabilidad del código de simulación está realmente en la ruta de producto y existe capacidad para mantener varias integraciones. Si no, comenzar con A y asegurar *portabilidad de datos*, que es más realista que prometer portabilidad completa de código.

#### 12.3. Contratos mínimos obligatorios

```text
IInput          -> acciones abstractas: mover, mirar, saltar, conducir, interactuar
IWorldClock     -> hora simulada, delta fijo, velocidad del tiempo
IPhysicsWorld   -> consultas de suelo, raycasts, contactos, aplicación de fuerzas
IRenderBridge   -> representar entidad, LOD, materiales, luces, partículas
IAudioBridge    -> eventos espaciales, mezclas ambientales, efectos por material
IWorldStreamer  -> sectores, distancias, carga/descarga, estado persistente
IAgentWorld     -> población, tránsito, navegación y decisiones agregadas
ISaveSystem     -> guardado versionado y restauración de sectores
IQualityProfile -> efectos compatibles, presupuesto térmico, CPU, GPU y memoria
```

**Separar por datos:** `Transform`, `Velocity`, `Collider`, `Locomotion`, `Vehicle`, `AgentSchedule`, `WeatherResponse`, `RenderProxy`, `AudioEmitter`, `PersistentState`. Los identificadores de entidades deben ser estables y no depender de IDs nativos de un editor.

**Persistencia versionada:** JSON o formato binario documentado con `schema_version`, IDs permanentes, migradores de versión y pruebas de restauración. Los parámetros de física y materiales se guardan como datos; no como referencias implícitas a objetos de una escena de una sola herramienta.

**Recursos abiertos:**

- **glTF 2.0 / GLB** para intercambiar modelos, jerarquías, materiales PBR y ciertas animaciones entre herramientas, sujeto a las capacidades del importador. Es un estándar de Khronos: <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html>.
- **OpenUSD** como opción de *pipeline* de escenas complejas en producción, no necesariamente el formato de ejecución móvil: <https://www.pixar.com/openusd>.
- **Tablas JSON/CSV versionadas** para eventos, NPC, tipos de superficies, clima, vehículos, economía y reglas, con validación automatizada.
- **Pruebas del núcleo** independientes de imágenes: mismo escenario de entrada → resultado esperado dentro de tolerancia; las físicas de distintos motores pueden divergir.

#### 12.4. Principio de renderizado adaptable

La misma entidad lógica `car_023` puede representarse así:

- **Calidad baja:** malla sencilla, textura pequeña, sombra falsa, sin reflejo dinámico, menos partículas, iluminación mayormente estática.
- **Calidad media:** mejores materiales, animación extra de ruedas/suspensión, sombras selectivas, lluvia local y reflejos aproximados.
- **Calidad alta:** geometría/vegetación adicional, sombras de más calidad, densidad de población decorativa y mejores materiales, siempre sujeto a mediciones.

**No** introducir diferencias de reglas físicas por calidad gráfica: cambiar el *aspecto* del vehículo, no el resultado de su frenada, solo por tener otro celular.

**Compatibilidad con motores conocidos:** Godot dispone de caminos Forward+, Mobile y Compatibility (véase [documentación de renderizadores](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html)); Unity documenta escalado según estado térmico y potencia en [Adaptive Performance](https://docs.unity.com/en-us/engine/6000.3/manual/analysis/runtime-performance-scaling/adaptive-performance/introduction); Unreal dispone de una [ruta de renderizado móvil](https://dev.epicgames.com/documentation/unreal-engine/mobile-rendering-and-shading-modes-for-unreal-engine) diferenciada de la de escritorio. **Tener varias rutas disponibles no garantiza paridad de efectos ni de rendimiento.**

### 13. Rendimiento: reglas de un mundo abierto que sí corre en teléfonos

**Objetivos de referencia, no resultados de pruebas:**

| Perfil | Objetivo inicial | Presupuesto de cuadro | Enfoque |
|---|---|---|---|
| **Bajo** | 30 FPS estables | ~33,3 ms total | Menos NPC cercanos, sombras simuladas, partículas limitadas, distancia reducida. |
| **Medio** | 30 FPS de mayor calidad o 60 FPS cuando sea sostenible | ~33,3 / 16,7 ms | LOD más generoso y respuesta ambiental completa en zona próxima. |
| **Alto** | 60 FPS cuando CPU/GPU/temperatura lo permitan | ~16,7 ms total | Más detalle, mejores sombras y efectos, sin comprometer controles. |

- **Simulación con paso fijo:** por ejemplo 60 Hz donde sea viable; la representación puede ir a 30 o 60 FPS mediante interpolación. No asumir que todas las físicas mantendrán determinismo idéntico entre motores.
- **Streaming espacial:** partir la ciudad en sectores (probar tamaños, no fijarlos sin medición); mantener activo el vecindario del jugador, prefetched el próximo y descargar recursos distantes conservando un resumen de estado.
- **Niveles de simulación (Simulation LOD):** física completa y NPC detallados cerca; estados resumidos más lejos; estadística/horarios fuera de pantalla.
- **Object pooling:** reutilizar emisores de polvo, gotas, sonidos y objetos temporales para evitar asignaciones frecuentes.
- **LOD visual, oclusión, texturas adecuadas e instancing:** reducir cargas gráficas antes de sacrificar las reglas centrales.
- **Clima y temperatura del dispositivo:** escalado adaptativo de resolución y efectos si hay caída de FPS o limitación térmica; no esconder caídas severas con sacudidas de cámara.
- **Uso sin conexión:** si es requisito, empaquetar contenido base, guardar localmente y no depender de API remotas para la simulación principal.
- **Accesibilidad:** opciones de sacudida de cámara, intensidad de partículas, contraste, controles táctiles escalables y tamaño de interfaz.

### 14. Orden de implementación recomendado

| Fase | Construir | Prueba de aceptación concreta |
|---|---|---|
| **0. Contratos y telemetría** | Modelo de entidades, eventos, guardado, reloj fijo, monitor de FPS/tiempos de CPU-GPU y perfiles de calidad. | Cambiar de escena y recuperar guardado sin perder identificadores ni romper eventos. |
| **1. Sensación de peso** | Personaje, superficies, aceleración/frenado, salto, caída, sonidos y cámara amortiguada. | El usuario distingue caminar, correr, frenar, saltar y aterrizar con cámara reducida o desactivada. |
| **2. Vehículo y contacto** | Un vehículo, fricción, frenada, curva, rampa, colisión controlada y reacción visual de suspensión. | Distancias de frenado reproducibles en la misma configuración y sin atravesar obstáculos. |
| **3. Vida local** | Un pequeño distrito: viento, dos climas, ciclo temporal, sonidos, transeúntes y tránsito sencillo. | El barrio muestra cambios observables aun cuando el jugador no interactúa y reacciona al clima. |
| **4. Persistencia y streaming** | Sectores activos, estados dormidos, horarios, objetos persistentes y carga progresiva. | Salir del barrio y regresar conserva los cambios elegidos sin saltos graves de FPS. |
| **5. Fidelidad escalable** | Tres perfiles gráficos, partículas por presupuesto, LOD, sombras selectivas y adaptación térmica. | La jugabilidad permanece equivalente al cambiar calidad gráfica en dispositivos diferentes. |
| **6. Prueba de portabilidad** | Implementar **un único sistema pequeño** (por ejemplo, clima + objetos reactivos) en un segundo adaptador/motor. | Misma escena lógica, datos y eventos; renderizado distinto pero comportamiento compatible dentro de tolerancias. |

#### Medidas que deben recogerse en dispositivo real

- FPS promedio **y** percentiles de tiempo de cuadro, no solo un promedio favorable.
- CPU, GPU, memoria ocupada, consumo/temperatura y rendimiento después de una sesión prolongada.
- Latencia desde toque hasta respuesta visual; frenadas, aterrizajes y colisiones en distintos perfiles.
- Picos durante carga de sector y guardado; estabilidad tras cambios de orientación o retorno desde segundo plano.
- Comparación de misma semilla/escena con distintos renderizadores; investigar diferencias antes de publicar.

### 15. Decisiones de diseño finales

1. **Primero credibilidad física, después complejidad visual.** Una silueta simple que frena, tropieza o cae con coherencia tiene más «peso» que un modelo detallado que se desliza como si no tocara el suelo.
2. **La vida nace de las relaciones.** No basta un árbol que se mueve: el viento debe afectar también ropa, polvo, sonido o conducta, incluso con simulación aproximada.
3. **Optimizar no es vaciar el mundo.** El mundo cercano debe ser rico en reacciones; el lejano, rico en apariencia y estado resumido.
4. **No atar las reglas a los gráficos.** Una entidad lógica puede migrar entre web, Godot, Unity o Unreal mediante datos, contratos y adaptadores, con trabajo real de integración.
5. **Usar las referencias como inspiración, no como instrucciones de copia literal.** Reconstruir principios mecánicos y artísticos con recursos propios evita una identidad visual genérica o derivativa.

### 16. Manual operativo de implementación y delegación a agentes IA

#### 16.1. Mapa de módulos y repositorio recomendado

```text
motor-city/
  docs/
    MOTOR-CITY-ENTREGA-MAESTRA.md
    decisiones-arquitectura.md
    criterios-de-aceptacion.md
  schemas/
    world.schema.json
    vehicle.schema.json
    agent.schema.json
    save.schema.json
  data/
    surfaces.json
    vehicle-presets.json
    weather.json
    districts.json
  core/
    time/
    entities/
    events/
    movement/
    vehicles/
    agents/
    world-state/
    persistence/
  adapters/
    web/
    godot/
    unity/
    unreal/
  tools/
    world-builder/
    profiler/
    replay/
  tests/
    unit/
    integration/
    benchmark/
    visual/
  assets/
    common/
    mobile/
    high/
```

Los directorios de adaptadores son **destinos de arquitectura**, no afirmaciones de que esos adaptadores ya existan. No conviene construir los cuatro simultáneamente: implementar y probar **uno** primero, y portar **un módulo pequeño** a un segundo como prueba real de independencia.

#### 16.2. Protocolo para Claude, Gemini u otros asistentes

1. **Leer especificación y contratos actuales.** No reescribir interfaces sin una decisión de arquitectura versionada.
2. **Proponer cambios en forma de diffs atómicos.** Cada cambio debe citar el sistema afectado, el comportamiento esperado y la prueba.
3. **Usar JSON validable o funciones declarativas para generar escenas.** Los archivos producidos por IA deben pasar validación de esquema, referencias y límites de presupuesto.
4. **Separar física/estado de VFX.** Un vehículo no debe cambiar su frenada porque se desactive la nieve gráfica; un edificio no debe perder su identidad al variar el LOD.
5. **Probar en navegador y dispositivo real.** Tests unitarios y automatizados son necesarios, pero no sustituyen pruebas E2E de botones, gestos, errores de consola, carga de distrito y reanudación de partida.
6. **Registrar evidencia.** Capturas, replays con semilla, perfil de FPS/RAM, errores reproducibles y versiones de hardware.
7. **No prometer portabilidad automática.** En cada adaptación, hacer mapa explícito de equivalencias: unidades, ejes, coordenadas, físicas, entradas, assets, audio, UI y recursos gráficos.

#### 16.3. Ejemplo de contrato de entidad (propuesta, no código del juego existente)

```json
{
  "schema_version": 1,
  "entity_id": "vehicle_0001",
  "archetype": "compact_car",
  "transform": { "position_m": [0.0, 0.0, 0.0], "rotation_xyzw": [0.0, 0.0, 0.0, 1.0] },
  "vehicle": { "mass_kg": 1100, "drive": "FWD", "profile": "city_base_v1" },
  "surface_contact": "dry_asphalt",
  "visual": { "asset_id": "car_compact_a", "quality_policy": "adaptive" },
  "persistent": true
}
```

**Precaución:** los valores del ejemplo son ilustrativos; no se ha calibrado ni probado su comportamiento. La semántica de coordenadas, unidades, límites y presets debe fijarse formalmente en un esquema.

#### 16.4. Hitos mínimos no negociables antes de expandir el mapa

| Entregable | Condición comprobable |
|---|---|
| Un vehículo con física plausible | Acelera, frena, gira, rebota levemente sobre obstáculo y muestra telemetría sin atravesar el terreno |
| Un peatón convincente | Camina, corre, frena, usa escalones y reacciona a un vehículo próximo sin deslizamiento flagrante |
| Distrito activo | Cambia entre día/noche y clima sin perder tráfico y rutinas; conserva modificaciones persistentes |
| Rendimiento móvil | Se mide en dispositivo objetivo con configuración fija y sesión prolongada; no se certifica a partir del PC del desarrollador |
| Compatibilidad inicial | Una escena lógica produce resultados equivalentes en perfiles gráficos bajo/alto |
| Portabilidad piloto | Un subsistema aislado puede exportarse mediante esquema y ejecutarse en otro adaptador con tests comparativos |

#### 16.5. Riesgos y correcciones de afirmaciones demasiado fuertes

- **“60 FPS en cualquier celular”:** no garantizable sin hardware de referencia, presupuesto de frame y telemetría. Un perfil móvil debe priorizar **30 FPS consistentes** cuando 60 no sea sostenible.
- **“Vertex shaders o sprites casi gratis”:** los costes dependen de overdraw, cantidad de objetos, resolución y batería; pueden ser eficientes **si se miden**.
- **“Huellas permanentes en terreno”:** una marca visual con decal/texture no implica una malla físicamente deformada. Elegir según la interacción requerida.
- **“1000 NPC con emociones y memoria”:** el texto de un reel no certifica su arquitectura; simular muchos agentes **en segundo plano** requiere distintos grados de detalle, tests y medidas.
- **“Física determinista a 60 Hz en todos los motores”:** un paso fijo ayuda a reproducibilidad local pero **no garantiza igualdad bit a bit** entre bibliotecas o plataformas. Repetir escenarios con tolerancias.
- **“Migración sin esfuerzo a Unreal/Unity”:** los sistemas de datos pueden transferirse; integración de físicas, shaders, UI, input y empaquetado puede exigir trabajo considerable.
- **“ECS, WFC, WebGL, MIT, 0,08 s”:** son atribuciones incluidas en la descripción de Gemini para ciertos proyectos; revisar código/licencia y reproducir benchmarks antes de convertirlas en decisiones cerradas.
- **“Un filtro estilizado acelera por sí solo”:** pixelación y outlines pueden agregar pasadas de pantalla; reducir resolución interna o complejidad material es distinto de añadir un filtro.

---

### 17. Fuentes, material y pendientes documentados

**Documentos de base (fusionados íntegramente por contenido útil):**

1. `ENTREGA-REELS.md`, entrega inicial con observaciones independientes, tabla de 14 enlaces, técnica de peso/vida, arquitectura y plan de pruebas.
2. `Referencias y Arquitectura para Motor City.md`, informe de Gemini con fichas R01–R25, paletas, mecánicas, ranking y propuestas de escalado.
3. MP4 adjuntos en ambos mensajes: 9 iniciales (incluido el collage) y 9 añadidos, con 17 referentes distintos identificables en conjunto.

**Pendiente visual:** verificar 13 URLs de Instagram sin evidencia directamente atribuible; comprobar 7 fichas que por ahora dependen de Gemini; inspeccionar código o manuales originales si se necesita afirmar tecnologías específicas. No confundir “no verificado” con “falso”.

**Pendiente de ingeniería:** no se ha desarrollado ni ejecutado aquí el motor Motor City; los tests, integración de motores, prestaciones, memoria y física son **objetivos de proyecto**, no resultados medidos.

**Fuentes externas consultadas para la investigación técnica y la identificación del reel accesible:**

1. [Análisis independiente del reel *Town Brush*](https://develog.develrocket.com/@wnqudgus1234/쇼츠-뜯어보기-공유가-좋아요의-66배-어제-오늘-뜬-쇼츠-10개).
2. [Khronos — Especificación glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html).
3. [Pixar — OpenUSD](https://www.pixar.com/openusd).
4. [Godot — Renderizadores](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html).
5. [Unity — Adaptive Performance](https://docs.unity.com/en-us/engine/6000.3/manual/analysis/runtime-performance-scaling/adaptive-performance/introduction).
6. [Epic — Renderizado móvil en Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/mobile-rendering-and-shading-modes-for-unreal-engine).

**Límite metodológico:** las páginas de documentación respaldan compatibilidad general y opciones de implementación. No prueban que una técnica específica se haya usado en un reel.

---

**Cierre de unificación.** Ambas investigaciones apuntan a la misma decisión central: el mejor resultado móvil no consiste en simularlo absolutamente todo ni en maximizar los efectos, sino en **hacer que todo lo próximo al jugador tenga consecuencias comprensibles**, mientras el resto del mundo evoluciona mediante estados compactos, datos persistentes y representación escalable. Este documento es la fuente de referencia única para convertir esa idea en pruebas y código posteriores.


---

# ANEXO F. Optimización (`docs/OPTIMIZACION.md`)


**Regla de oro:** **mide, luego cambia, luego vuelve a medir.**

- **Presupuesto de un cuadro:** 16,7 ms a 60 Hz y 33,3 ms a 30 Hz. El navegador también necesita su parte: deja un 15 %.
- **Dónde medir:**
  - `vistas.ms` (ms de dibujo);
  - `MC.GPU.perfil()` (qué aparato es);
  - `node motor.mjs prueba --navegador` (CPU 4× más lenta).

### 1. Lo que el motor ya hace solo
| Técnica | Dónde | Qué logra |
|---|---|---|
| **Nivel del aparato** | `MC.GPU.perfil()` y `ajustes()` | Elige escala, cuadros por segundo, calidad y si usar WebGL o el raster. |
| **Resolución dinámica** | `MC.ResDinamica` (en la 3D) | Baja píxeles antes que cuadros, con un controlador PI que no oscila. |
| **Calidad automática** | `Vistas.calidad` | Menos edificios, tráfico y detalle si el cuadro tarda. |
| **3D por software** | `MC.Raster` | Sin WebGL, o con WebGL por software, la 3D sigue andando. En Chromium sin GPU: 15–25 ms, contra 70–90 ms del WebGL por software. |
| **Losas en caché** | `MC.Losas` | El suelo se pinta una vez por pedazo de 160 m. Mientras llega la nítida, se muestra una borrosa (carga progresiva). |
| **Capas perezosas** | `MC.Mundo.capa()` | Las capas del MC4 se inflan solo cuando alguien las pide. |
| **Rejillas espaciales** | Edificios por regiones, vías por celdas, lugares por celdas de 320 m | Las consultas no recorren todo el mapa. |
| **Simulación «en grueso»** | `MC.Poblacion` | Lo lejano se simula barato. |
| **Paso fijo y tope** | `MC.Bucle` | La física no depende de los FPS; un aparato lento no entra en espiral. |
| **Pausa en segundo plano** | `MC.Bucle` | Sin pestaña visible no hay cuadros: ahorra batería. |
| **Pixel** | `Vistas.pixel` | Dibuja en un tercio de la resolución: rapidísimo y con estilo. |
| **Etiquetas limitadas** | `Vista2D.etiquetas` | Pocas, sin montarse y sin tapar el centro. |

**Cifras medidas** (Chromium, CPU 4× más lenta, 412 × 860; mediana del dibujo):

| Vista | ms |
|---|---|
| Cenital | 4,8 |
| Ciudad 3D | 10,9 |
| Maqueta | 17 |
| Lateral | 10,6 |
| Panorámica | 10,8 |

### 2. Reglas para escribir código rápido (motor y juegos)
1. **Nada de basura por cuadro.** Reutiliza arreglos y objetos; evita `map`, `filter` y `slice` en el ciclo caliente si se puede.
2. **Una sola lectura de entrada por cuadro** (`controles.leer()`) y una sola actualización de cámara.
3. **Cachea lo que no cambia:** dibujos procedurales a lienzos (`MC.Sprites.hornear`) y texto medido.
4. **Nunca `getImageData` por cuadro**, ni cambiar el tamaño del lienzo por cuadro.
5. **Recorta lo que no se ve:** cajas visibles y conos de visión (`Raster.visible`).
6. **Detalle por distancia (LOD):** lejos, cajas; cerca, ventanas. Lejos, menos gente.
7. **Un atlas en vez de cien imágenes.** Menos cambios de estado; en WebGL, menos *draw calls*.
8. **El trabajo pesado, en pedazos.** Las losas se pintan unas pocas por cuadro (`losas.trabajar(n)`). Lo que tarde se hace al cargar, con una pantalla de «armando las calles…».
9. **Limita el `devicePixelRatio` a 2** (o 1,5 en gama media): pantallas de 3× gastan 9 veces los píxeles.
10. **Prueba en un celular real de gama media.** Es el aparato que importa.

### 3. Tiempos y sensibilidades (que se sienta bien)
- **Tiempo cambiante sin romper nada:**
  - `MC.Reloj.vel` acelera el día;
  - una cámara lenta es multiplicar `dt` en la simulación, no en la entrada;
  - la física siempre en pasos fijos.
- **Sensibilidad por vehículo** (`MC.Manejo.PERFIL`):

  | Vehículo | Respuesta |
  |---|---|
  | A pie | Directa (expo 1,15) |
  | Bici | 1,35 |
  | Moto | 1,55 |
  | Carro | 1,75, con giro que baja con la velocidad |
  | Camión | 1,9 |

  Ajusta por juego: un arcade puede bajar la respuesta y uno de simulación, subirla.
- **Asistencias:** frenar en curvas, imán de calle y acelerar solo. Encendidas para empezar y apagables para expertos.
- **Cámara:**
  - resortes de 0,12–0,2 s (más rápidos se marean y más lentos se sienten «borrachos»);
  - zona muerta de 18 px;
  - FOV +16 % a alta velocidad;
  - sacudida por trauma², no por azar.
- **Respuesta inmediata:** lo que el jugador toca responde en el mismo cuadro. Las animaciones de interfaz duran 0,2–0,6 s y respetan «reducir movimiento».

### 4. Cuando algo va lento
1. `MC.GPU.perfil()`: ¿es «software» o «baja»? Entonces el raster y la escala dinámica deberían estar activos.
2. `vistas.ms` por vista: ¿cuál vista se pasa?
3. En Chrome, Rendimiento → grabar 5 s: ¿qué función domina?
4. Prueba el pixel (`vistas.pixel = true`): si mejora mucho, el cuello es de píxeles; baja la escala.
5. Si es la simulación (tráfico, gente), baja `n` o el radio.
6. Anota el caso en un reporte (`node motor.mjs reporte`) con el aparato y las cifras.

### 5. Lo que sigue (para las IAs de código)
- Redes precalculadas en el MC4 (hoy `red('rueda')` tarda ~1 s en Medellín).
- Losas en un *Worker* con `OffscreenCanvas` (sin trabar el hilo principal).
- WebGL con lotes estáticos e *instancing* para árboles y ventanas.
- Atlas único de arte por juego.
- Audio: programar notas con anticipación (ya lo hace `MC.Musica`) y bajar voces en celulares lentos.


---

# ANEXO G. Usos y negocio (`docs/NEGOCIO-Y-USOS.md`)


> No es asesoría legal ni financiera: son ideas para explorar. Antes de vender o firmar, consúltalo con un abogado de propiedad intelectual y con un contador.

### 1. Lo que tienes en la mano
Un **motor que convierte cualquier lugar real en un mundo jugable y simulable**:
- con calles, edificios, relieve, clima, tráfico, transporte y gente;
- en un solo HTML que corre en cualquier celular;
- con ciencia verificable (física, química, biología y economía);
- y con herramientas para que **una IA arme un juego nuevo en minutos**.

Pocos proyectos juntan todo eso, y menos en español y con datos de Colombia.

### 2. Otros usos (más allá del entretenimiento)
| Uso | Para qué | Pieza del motor |
|---|---|---|
| **Educación vial y cultura ciudadana** | Simuladores de bici, peatón y conducción en la ciudad real (semáforos, clima, frenada real) | Física, tráfico, clima |
| **Turismo** | Recorridos interactivos de pueblos (Guatapé, Jardín, Santa Fe de Antioquia) y guías jugables | Craqueo de territorios, panorámica, interiores |
| **Movilidad y urbanismo** | Ver un proyecto (una ciclorruta, una línea de cable, un cambio de semáforos) antes de construirlo, con gente y tráfico simulados | Mundo MC4, redes, población, transporte |
| **Gestión del riesgo** | Escenarios de lluvia fuerte, inundación de quebradas, rutas de evacuación con la gente real del barrio | Relieve, clima, IA de rutinas, A\* |
| **Colegios y universidades** | Física, química, biología y economía «jugables»: el mismo carro con otra masa, una criatura en otro planeta, el mercado de un pueblo | Ciencia, taller, seres, economía |
| **Capacitación laboral** | Repartidores, conductores, guías y personal de estaciones: recorridos reales, tiempos y horarios | Misiones, transporte, interiores |
| **Inmobiliario y comercio** | Ver una zona con su relieve, sus edificios y su vida a cualquier hora | Vistas, día y noche |
| **Publicidad y marcas** | Minijuegos de marca en una ciudad real (sin usar marcas ajenas sin permiso) | Plantillas de juego |
| **Investigación** | Simular comportamiento de multitudes, tráfico o economía de un barrio | Población, tráfico, mercados |

### 3. Cómo se puede distribuir o vender
- **Juegos propios:**
  - los cuatro que vienen: EnCicla, El Metro, Run Scooter y Motor City/Extremo;
  - como web gratis con anuncios o patrocinio, como APK en Play Store (como ya hacen EnCicla y El Metro), o con pagos dentro del juego (vehículos, pieles, mundos).
- **Licenciar el motor:**
  - **dual**: gratis para educación y uso personal, y de pago para empresas;
  - o una **licencia comercial** por proyecto.

  Hoy el repositorio no tiene licencia declarada (por defecto, «todos los derechos reservados»). Elige una antes de abrirlo al público.
- **Mundos a la medida:** «craqueamos tu pueblo o tu ciudad». Se cobra por mundo y por juego para alcaldías, gobernaciones, oficinas de turismo, cajas de compensación y empresas.
- **Servicio de juegos con IA:** usar el motor y las plantillas para entregar juegos educativos o de marca en días, no en meses.
- **Contenido:** pieles, mundos y paquetes de música y misiones para los juegos.

**Cuidado con las licencias de los datos:**
- OpenStreetMap usa la licencia **ODbL**: se puede usar comercialmente, pero hay que **atribuir** siempre. Si redistribuyes la base de datos modificada, debe quedar con la misma licencia (los juegos como «obra producida» tienen reglas más simples).
- Overture tiene licencias por tema (ODbL y CDLA). SRTM es libre.
- La música clásica usada es de dominio público, con transcripción propia.
- **Nada de marcas ni personas reales sin permiso.** Ojo con logos como el del Metro o el de EnCicla: para usarlos comercialmente hace falta autorización de esas entidades.

### 4. A quién proponérselo (Colombia primero)
| A quién | Qué proponer |
|---|---|
| **Metro de Medellín, Área Metropolitana (EnCicla), Secretaría de Movilidad** | Juegos de cultura ciudadana. Ya tienes dos juegos sobre ellos: es la puerta natural, pero con su permiso. |
| **Alcaldías y gobernación (turismo, educación, TIC)** | Pueblos patrimonio jugables; simuladores para colegios. |
| **Ruta N, Parque Explora, Planetario, museos** | Ciencia jugable (la física, la química y la biología del motor). |
| **Universidades** (EAFIT, UdeA, UPB, Nacional, ITM) | Proyectos de investigación en movilidad, simulación y videojuegos; semilleros. |
| **MinCiencias, MinTIC, iNNpulsa** y convocatorias de **industrias creativas y economía naranja** | Fondos y becas para desarrollo de videojuegos y contenidos educativos. |
| **Cajas de compensación** (Comfama, Comfenalco) | Contenidos educativos y recreativos. |
| **Empresas de movilidad, seguros y logística** (aseguradoras, apps de reparto) | Capacitación y seguridad vial. |
| **Estudios de videojuegos** (Colombia y Latinoamérica) | Licencia del motor o coproducción. |
| **Festivales y mercados** (Colombia 4.0, BOGOTÁ Game Week u otros eventos de la industria) | Para mostrar los juegos y el motor. |

**Cómo presentarlo (en 3 minutos):**
1. Abre Mandados en el celular.
2. Craquea en vivo un pueblo que les importe (20 segundos).
3. Muéstralo en cenital, 3D y panorámica, de día y de noche, con lluvia.
4. Cierra con el modelo: lo que cuesta un juego o un mundo a la medida.

### 5. Cómo se integra a distintas propuestas
- **Un juego o una experiencia por proyecto:** plantilla, mundo del lugar, piel de la marca o la entidad, y las mecánicas que pida. Sale un HTML único: en la web de ellos, en un QR o en un APK.
- **Educación:** módulos del motor como laboratorios (por ejemplo, «diseña tu carro y mide su frenada en lluvia»), con guías para el docente.
- **Datos de ciudad:** el MC4 se puede alimentar con capas oficiales (catastro, malla vial, transporte GTFS) para estudios. La tubería ya acepta capas oficiales (`geo/oficial.py`).
- **Con otras IAs:** el repositorio trae skills, plantillas y reportes. Una IA nueva entiende el motor y aporta sin romperlo (`CONTRIBUIR.md`).


---

# ANEXO H. Cómo contribuir (`CONTRIBUIR.md`)


El repositorio queda **abierto para las IAs que desarrollan cada juego**: Juega EnCicla, El Metro, Run Scooter y los que vengan. Si un juego necesita algo del motor, se agrega aquí, para todos.

### Reglas
1. **Tu rama.** Trabaja en una rama tuya (`ia-elmetro/…`, `ia-encicla/…`). No hagas PR ni toques `main` si el autor no lo pide.
2. **Antes de cambiar:** lee `CONTEXTO-IA.md`, `MOTOR.md` y la skill `motor-city-desarrollo` (en `.claude/skills/`).
3. **No rompas a los otros:**
   - si cambias la API de `MC`, deja la vieja funcionando (alias) y dilo en el reporte;
   - si cambias el formato del mundo (MC4), sube la versión mayor y explica la migración;
   - **no toques `js/valle.js`**: lo incluye Juega EnCicla.
4. **Lo propio de tu juego no entra al motor:** trama, menús, arte final y huevos. Entra lo que **otro juego también podría usar**: una mecánica, una capa de datos, una vista, una regla del mundo o un dibujo base.
5. **Pruebas en verde:** `node motor.mjs prueba --navegador`. Si agregas algo, agrega su prueba con valores conocidos. Si es ciencia, cita la fuente.
6. **Reporte obligatorio:** `node motor.mjs reporte "Título" --juego elmetro --autor "IA de El Metro"`. Llénalo: qué necesitabas, qué cambiaste, cómo lo probaste y qué falta.
   - La **IA del motor** (Claude) revisa los reportes, pule los detalles, sube la versión y sincroniza a todos.
7. **Sincronizar:** después de que la IA del motor integre tu cambio, `node motor.mjs sincronizar ../TuJuego` lo copia a `TuJuego/motor-city/`.
8. **Atribución y licencias:**
   - Datos abiertos: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; relieve SRTM/NASA.
   - Música clásica: solo obras de dominio público, con transcripción propia.
   - Imágenes: nunca copiadas de fotos ni de satélite.

### Atajos
| Para | Comando |
|---|---|
| Un juego o modo nuevo | `node motor.mjs nuevo juego nombre --mundo guatape` |
| Una mecánica o módulo nuevo | `node motor.mjs nuevo modulo nombre` (con su prueba en `pruebas/modulos/`) |
| Un territorio real nuevo | `python3 geo/territorio.py --id x --bbox=lon0,latS,lon1,latN` |
| Un mundo inventado | `MC.Generador.mundo({ semilla, tipo })` |


---

# ANEXO I. Bitácora (`BITACORA.md`)


### 25-nov-2026 · 5.4.0 «Carreras retro» · Fase 4 del renacimiento cenital (Claude)
- **Lo que pide el prompt de relevo, Fase 4:**
  - `MC.Pista`, con la técnica clásica de segmentos, escrita desde cero (sala limpia), aparte de `MC.Arcade`, que se queda para la calle real;
  - dos circuitos;
  - «🏎️ Carreras retro» en Turno Cero;
  - una prueba con la cresta, la curva continua, el bot, el p95 y 0 errores;
  - la 5.4.0.
- **Hecho:**
  - **`js/47-pista.js` (`MC.Pista`):**
    - **la pista:** segmentos de 200 de largo con `p1` y `p2` (mundo, cámara y pantalla), curva, banda de color cada 3 segmentos, objetos y carros; colinas cosenoidales y curvas acumuladas, con fuerza centrífuga;
    - **la proyección:** la clásica (`d = 1/tan(FOV/2)`, 280 segmentos a la vista). En vertical se usa la misma escala en los dos ejes y el horizonte un poco más arriba: con `H/2` en el eje vertical, la imagen saldría estirada al doble.
    - **pasada 1, de cerca a lejos con `maxY`:** recorta cada segmento contra lo ya pintado, guarda `seg.clip` y pone niebla (6 niveles) en los últimos 45 segmentos. Las franjas de pasto, berma, pianos, asfalto, líneas y la baranda se juntan por color y nivel de niebla: **unos 40 rellenos por cuadro**.
    - **pasada 2, de lejos a cerca:** los objetos y los rivales de todos los segmentos frente a la cámara, recortados contra `seg.clip`. Un carro detrás de una cresta asoma el techo y nunca se pinta debajo de ella.
    - **lo demás:**
      - paralaje de 3 capas (cielo, montañas del Valle y la ciudad o las lomas con pinos), que se mueve con la curva, la velocidad y la altura;
      - el carro con 6 estados (recto, giro suave y brusco, en plano y en subida), vibración en la berma, chispas y humo al derrapar;
      - rebufo a menos de 15 segmentos y nitro (FOV de 100° a 116°, líneas de velocidad y una sacudida);
      - rivales que cambian de carril sin saltos y con un poco de goma;
      - HUD con posición, vuelta, tiempo, velocidad, nitro y minimapa, y controles táctiles en las esquinas (en vertical, el carro va encima de la fila de botones);
    - **los dos circuitos** (1,6 km cada uno):
      - «Subida a Las Palmas»: subida larga, curvas encadenadas, una horquilla, lomas con cresta, la bajada por Escobero, pinos y baranda continua;
      - «Autopista Regional nocturna»: alta velocidad, puentes y arcos sobre la vía, postes con luz y la silueta de la ciudad;
    - **sin pantalla, para las pruebas:** `carrera`, `paso` (paso fijo de 1/120 s), `bot`, `simular`, `perfil`, `crearDe` y `cieloDe`.
  - **Turno Cero, `juegos/getaway/70-retro.js` (aditivo):** «🏎️ Carreras retro» en 🎮 Modos, con los dos circuitos a 2 vueltas contra 5 rivales.
    - El mundo abierto se pausa mientras corres, y al salir vuelves al mismo punto, con el mismo carro.
    - Corres con el color de tu carro, y el cielo de Las Palmas sale de la hora y el clima del mundo (`cieloRetro`): de noche, la pista se oscurece y se prenden los faros.
    - Premio de 💵 500, 250 y 100 por puesto, y récord por circuito.
  - **Prueba nueva, `pruebas/pista-retro.mjs`** (en `motor-city-qa.yml`).
- **Probado:**
  - `node pruebas/pista-retro.mjs`: ✓
    - la cresta: 0 píxeles debajo con el recorte, 280 sin él; el carro asoma el techo;
    - la curva continua, con un salto de 0,25 como máximo, y la altura cierra la vuelta;
    - el bot gana los dos circuitos: 101,3 s y 76,3 s a 2 vueltas;
    - el paso y el dibujo dan un p95 de 5,2 a 5,9 ms en vertical y en horizontal (el intervalo entre cuadros, 16,7 ms: 60 fps);
    - Turno Cero: pausa, premio, récord, vuelta al mismo punto y salida con ✕;
    - 0 errores;
  - `node motor.mjs prueba` y `node motor.mjs skills --verificar`: en verde;
  - `node motor.mjs prueba --navegador`: **158 bien**;
  - `node pruebas/getaway-contenido.mjs`: ✓;
  - `node pruebas/modos.mjs`: ✓. Una corrida falló solo en el umbral del ⏫ acelerador fijo (8,7 m/s contra más de 10): depende de los cuadros reales de SwiftShader, como advierte la misma prueba, y en las dos corridas siguientes pasó.
- **Peso:** `js/47-pista.js` pesa unos 52 KB y `70-retro.js` 4 KB (la meta del módulo retro era unos 150 KB).
- **Falta:** la APK (`apk-juegos.yml`) y pasar a `main`, con el OK del autor; la Fase 5 (cápsulas y celular).

### 24-nov-2026 · 5.3.2 «Mundos saneados» · Fase 2 del renacimiento cenital (Claude)
- **Lo que pide el prompt de relevo, Fase 2 (Motor City):** el mismo saneamiento en `geo/territorio.py`, regenerar los mundos MC4 y, con los datos limpios, quitar la tolerancia de 1 m de la colisión (`js/32-fisica.js`).
- **Hecho:**
  - **`geo/territorio.py`:** la ley de soberanía vial del Motor del Valle 1.3 (regla A del autor): a cada huella se le quita el corredor de cada vía a nivel (ancho / 2 + 1,3 m en las de carros; + 0,3 m en peatonales, escalas, senderos y ciclorrutas; las aceras y cebras van dentro de su calle) y el agua; las casas de OSM conservan el andén de las calles menores, pero no el asfalto (en un juego ningún carro puede chocar con una casa pintada sobre la calle); los restos de menos de 16 m² se van, salvo que conserven el 90 % y 12 m². Los puentes, túneles y vías cubiertas o interiores no despejan nada y quedan con su nivel en `VIASJ` (`[5]`: 1 o −1; el cargador lo lee como `via.nivel`). Las huellas traen su fuente (`sources[1].dataset`).
  - **Los tres mundos, regenerados** (con su agua de `precalcular-agua.mjs` y su PVS de `pvs.mjs`):

    | Mundo | Huellas | Tocan | Recortadas | Se van | Marcadas (OSM) | Área que queda |
    |---|---|---|---|---|---|---|
    | Medellín (`fusionar.mjs`, de El Metro) | 639.457 → 622.086 | — | — | — | — | 98,45 % (Motor del Valle 1.3) |
    | Guatapé (`territorio.py`) | 2.661 | 524 | 430 | 93 | 48 | 94,7 % |
    | Nueva York (`territorio.py`) | 163.875 | 9.890 | 9.371 | 365 | 14.968 | 98,9 % |

    En Guatapé, las que se van son casi todas huellas automáticas (Google y Microsoft) de 28 m² de mediana sobre el embalse o sobre la calle: 2 de OSM.
  - **`js/32-fisica.js`:** la colisión con los edificios usa el mismo radio en la calle y fuera de ella (antes, sobre la calle, solo chocaba si uno se metía más de 1 m en la huella).
  - **Prueba nueva, `pruebas/calles-libres.mjs`** (en `motor-city-qa.yml`): recorre el eje de las calles de carros a nivel cada 2 m y pregunta lo mismo que la colisión: ¿un carro de radio 0,4 m chocaría con una casa?

    | Mundo | Antes (mundo viejo, sin la tolerancia) | Ahora |
    |---|---|---|
    | Medellín | 45.689 de 2.727.587 puntos (1,675 %) | 15 (0,001 %) |
    | Guatapé | 90 de 33.976 (0,265 %) | 0 |
    | Nueva York | 25.729 de 1.887.050 (1,363 %; con túneles y puentes) | ver el informe (0,074 % sin túneles ni puentes) |
  - `pruebas/prueba.mjs` ya no exige 639.457 huellas: exige las del mundo (622.086).
  - **Pruebas que elegían su escenario en el mapa** (la física no cambió):
    - manejo 4.5: el punto de partida debe ser calle;
    - el ruido: busca su edificio en 400 m;
    - el ladeo de la moto: compara con la teoría hasta su tope de 45°;
    - ciudad viva: mira el calor de la búsqueda (una llamada suma 8; el nivel 1 pide 15).
  - **Mejora de Turno Cero:** la ambulancia prueba otros puntos de partida si el primero no tiene ruta (`66-ciudad-viva.js`).
  - **R6‑b** (`precocinar-sectores.mjs`) acepta el ED1 v2 de El Metro.
  - `pruebas/medir.mjs` es intermitente también en `main` (una carrera en el arranque de `?medir`); queda anotado.
- **Probado:** ver `reportes/2026-11-24-claude-fase2-cenital.md`.
- **Las copias de los juegos** (`<juego>/motor-city/`) siguen en la 5.3.1: la 5.4.0 se copia una sola vez al cerrar la Fase 4 (cada copia mueve unos 70 MB de mundos y HTML).

### 24-nov-2026 · Fase 1 del renacimiento cenital · el Valle saneado (Motor del Valle 1.3.0; motor 5.3.1 sin cambios)
- **Lo que pide el prompt de relevo, Fase 1:** sanear el mapa del Valle en `motor-valle/` (BicicletasUno, copiado a MetroZero), sin tocar ningún render, con las decisiones del autor (regla A, trozos de 160 m, rehacer desde las fuentes originales y la prueba de craqueo).
- **Hecho:**
  - **la ley de soberanía vial** (`sanear.py`), la rasante (`rasante.py`), las capas de puentes y túneles (`niveles.py`), los anchos (`anchos.json`) y las pruebas `geometria.py` y `geometria.mjs`;
  - **El Metro:** `edificios.js` v2 con una guarda contra su recorte en tiempo real, y la cota al final de `vias.js`;
  - **EnCicla:** `edificios.bin` y `vias-cota.bin`, sin conectar.
- **La prueba de craqueo, en verde:**
  1. geometría exacta: 0 solapes sin marca;
  2. en el juego: 0 solapes, y el recorte de El Metro corta 0 de 622.086 (antes 107.546 y quitaba 17.190);
  3. se conserva el 98,45 % del área;
  4. la fidelidad contra OSM no baja (las casillas son idénticas);
  5. hay 44.538 conflictos en el GeoJSON;
  6. hay capturas en 6 zonas.
- **Probado:**
  - El Metro: 100 partidas con 0 errores;
  - EnCicla: 177 ✓ (HTML idéntico);
  - las dos copias del Motor del Valle, iguales.

  Motor City no cambió de código.
- **El informe:** `reportes/2026-11-24-claude-fase1-cenital.md`; la evidencia está en `reportes/fase1-cenital/` y las capturas en `reportes/img/claude-fase1/`.
- **Esperan al autor:**
  - el OK de la Fase 2;
  - las casas confiables de OSM en El Metro (su andén de 1,3 m);
  - las vías precisas en El Metro (+230 KB);
  - el ancho por fachadas (apagado).

### 24-nov-2026 · Decisiones del autor, el prompt de relevo en `main` y la misión y la visión
- **El autor decidió las cinco preguntas** de la Fase 0:
  1. el ancho **real** de las vías (con las ciclorrutas);
  2. trozos de **160 m**;
  3. EnCicla: **solo el modo libre**;
  4. El Metro: **Ciudad Libre y Bus**;
  5. «**la opción que pruebe que la ciudad será bien craqueada**»: rehacer desde las fuentes originales, con la prueba de craqueo (geometría exacta, ≥ 97 % del área construida, fidelidad contra OSM sin bajar de la auditoría del 17‑nov, conflictos y capturas).
- **`docs/PROMPT-RELEVO.md`** ya trae las decisiones (§ 3 y § 4) y la tabla de misión y visión. El autor pidió subirlo a `main`.
- **`docs/VISION-Y-MISION.md`:** la misión y la visión del motor, del Motor del Valle y de cada juego, sacadas de lo que el autor ya había escrito y puestas al día con estas decisiones.

### 24-nov-2026 · Fase 0 del «renacimiento cenital» · auditoría y línea base, sin cambiar los juegos
- **El autor:** «Ponte al día, atiende el prompt de relevo y el de skills, y continúa con estos archivos». Compartió tres cosas:
  - el *Master Prompt* (fases 0 a 5: saneamiento GIS, motor cenital 2.5D, integración y carreras pseudo‑3D en Turno Cero);
  - la *Investigación técnica*;
  - el ZIP de GPT‑6 «Eón», con su informe maestro y su prompt maestro.
- **Relevo y skills:**
  - `node motor.mjs skills --integrar --agente claude-code` terminó con «4) Verificación: ✓ todo en orden»;
  - con `--verificar` quedan en orden los cuatro repositorios.
- **Lo que pide el prompt, Fase 0 (solo lectura):** el mapa técnico real y el plan de la Fase 1, en `docs/AUDITORIA-FASE0-CENITAL.md`. La evidencia está en `reportes/2026-11-24-claude-fase0-cenital.md` y `reportes/fase0-cenital/`.
- **Línea base de hoy:**

  | Repositorio | Resultado |
  |---|---|
  | Motor City | 158 bien |
  | El Metro | 100 partidas, 0 errores |
  | EnCicla | 170 bien |
  | Compuerta de EnCicla | Sigue en rojo: p95 de 103,7 ms en la Carrera 43A y 61,2 ms en Las Palmas (meta < 50) |
- **Medido:** en los datos de El Metro, **120.187 de 638.303 edificios (18,8 %) pisan la vía** con la regla que ya usa el juego, y 151.055 (23,7 %) con los anchos del prompt.
  - Hoy cada motor lo tapa en tiempo real: El Metro recorta al cargar, EnCicla inventa lotes y Motor City tolera 1 m en la colisión.
  - **Lo poco conocido:** el 73 % de las huellas sale de modelos sobre imágenes de satélite (Google y Microsoft), corridas de 1 a 3 m frente a los ejes de OSM; además, el 95 % se guarda como rectángulo.
- **Correcciones a los documentos:**
  - Turno Cero no está en MetroZero, ni puede estar (18+).
  - `motor-city/` en los hermanos es solo de consulta; lo compartido es `motor-valle/`.
  - El Metro y EnCicla ya tienen un mundo 3D con cenital.
  - `MC.Arcade` no usa la curva acumulada: proyecta la calle real y las lomas tapan bien. Lo que le falta son las pistas diseñadas, el nitro, el rebufo y un FOV ancho (hoy, de 58° a 71°).
  - Los trozos de 250 m no se alinean con los cachés de 160 m.
- **Los cinco videos del autor,** identificados: Reckless Getaway 2, Super Arcade Racing, GTA Chinatown Wars, GTA 2 y GTA 1.
- **Sin cambios en los juegos ni en el motor:** solo documentos y evidencia. La Fase 1 (saneamiento en `motor-valle/`) **espera cinco decisiones del autor** (§ 7 de la auditoría).
- **Prompt de relevo:** `docs/PROMPT-RELEVO.md`. Trae las fases 1 a 5 completas, las seis decisiones del autor con lo recomendado, los comandos, los criterios de «hecho» y la línea base. El aviso está arriba en `CLAUDE.md`, `AGENTS.md` y `GEMINI.md`.

### 23-nov-2026 · 5.3.1 «Skills para todas las IA» · la lista, un comando que las integra y el prompt para compartir
- **El autor:** «dame la lista de skills y plugins que tenemos y cómo integrarlos, con un prompt para compartir entre IA y que las integren automáticamente».
- **La lista:**
  - **10 propias en el motor:** `motor-city-*`;
  - **8 en El Metro:** `el-metro-*`, `medellin-fiel`, `coordinacion-multi-ia` y tres copias públicas de Anthropic;
  - **4 externas con commit revisado:** Hallmark, Modern Web Guidance, find-skills y HyperFrames;
  - **3 plugins de Claude Code** en `.claude/settings.json`.

  `node motor.mjs skills` la muestra, y con `--json` la entrega en JSON.
- **Un solo comando:** `node motor.mjs skills --integrar --agente <tu-agente>` (`herramientas/skills-externas.mjs`). Hace cuatro cosas:
  1. deja las propias iguales en `.claude/skills/` (Claude Code) y en `.agents/skills/` (Codex, Antigravity, Gemini CLI y Cursor). Copia en las dos direcciones y, si una difiere, no pisa nada sin `--desde`;
  2. completa el `.gitignore`;
  3. instala las externas con `npx skills add`, en el repositorio donde se corre;
  4. lo verifica.

  También hay `--sincronizar`, sin internet, y `--verificar`, que ahora corre en la QA.
- **Cuatro fallas encontradas y arregladas:**
  - **Las propias solo estaban en `.claude/skills/`:** Codex, Gemini CLI y Antigravity, que buscan en `.agents/skills/`, no las cargaban solas. Lo confirmé con su documentación y con el instalador.
  - **En los juegos hermanos, `--instalar` dejaba las externas dentro de `motor-city/`**, donde nadie las encuentra.
  - **El instalador deja enlaces en `.claude/skills/<id>`,** y el `.gitignore` con `carpeta/` no los ignoraba: `git add -A` habría subido 4 enlaces rotos. También faltaba `find-skills`.
  - **`sincronizar` habría copiado a los juegos las externas** instaladas en el motor.
- **Probado de verdad:**
  - las 4 externas instaladas en el motor para Codex y Claude Code: `git status` no las ve;
  - con Claude Code solo, en un repositorio vacío: también instala y verifica;
  - el conflicto entre las dos carpetas: sin `--desde`, avisa y no pisa;
  - esta misma sesión de Claude Code cargó al instante `hallmark`, `modern-web-guidance`, `find-skills` y `hyperframes`;
  - la batería del motor: 158 bien.
- **El prompt para compartir entre IA:** `docs/PROMPT-SKILLS.md`. Están al día `docs/SKILLS-Y-PLUGINS.md` (§ 0), la skill `motor-city-skills-externas`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` y `TAREAS-IA.md` (G‑H13).
- **El juego no cambia:** solo la versión. La APK v5.3.0 sigue vigente.

### 23-nov-2026 · 5.3.0 «Todo lo nuevo, unido» · las ramas de Gemini y ChatGPT, comprendidas y mejoradas
- **El autor:** «Retoma, continúa y termina; integra todo lo nuevo, compréndelo y mejóralo; y dame el prompt de relevo para la otra IA».
- **Unido de Gemini / Antigravity (5 ramas):**
  - **G5‑07:** fichas de los 30 sitios icónicos de Medellín (`docs/sitios/`, con `sitios.json`, receta de modelado, colores y referencia propia);
  - **G5‑01‑b:** Historieta de noche, con lluvia y en primera persona (bandas perceptuales, sin rayas en la calzada);
  - **G5‑05:** 🎬 guía sin flecha en el modo cine (hojas y palomas hacia el destino);
  - **G5‑08:** química del mundo (la lluvia apaga el fuego, los charcos salpican, el viento lleva el humo). Además, la proyección de `MC.Efectos` suma la cota en 3D, el mismo arreglo de la 5.2 para los globos: en Medellín los choques y el humo tampoco se veían;
  - **G5‑04:** minijuegos táctiles (puentear, chapa, llanta y cadena).
- **Unido de ChatGPT / Codex (2 ramas):**
  - **C5‑01:** vuelcos con auto‑enderezado y abolladuras de costado;
  - **R6‑b:** Worker con cajas LOD2 por sector.
- **Mejorado por Claude al unir:**
  - **Vuelcos:**
    - el modelo giraba alrededor de la línea del piso y, boca arriba, quedaba enterrado; ahora se apoya en el costado o en el techo;
    - volcado no se acelera ni se gira.
  - **R6‑b, apagado por defecto** (se prende con `?r6b`):
    - no mejoró nada medible, y al llegar cada sector borraba regiones ya armadas: tras 30 s había 65 regiones y 81 pendientes, contra 128 y 0 sin él;
    - ya no borra lo armado;
    - solo se incrusta Guatapé, así el HTML no carga 2,3 MB que no se usan.
  - **El minijuego entra al juego:** tras robar un carro aparece por 6 s «🔌 Puentear», opcional y sin bloquear nada; si se gana, nadie reporta el robo y la búsqueda baja (de 15 a 0 en la prueba).
- **Nuevo de Claude · los sitios icónicos en el 3D realista** (`js/45-y-sitios.js`, primera versión de C5‑02 con las fichas de Gemini). Cada uno de los 28 sitios con forma tiene la suya:
  - la aguja del Coltejer con sus ojos;
  - las torres y la nave de la Candelaria y de la Catedral, con el cimborrio de la Catedral;
  - las bandas del Palacio de la Cultura;
  - la cúpula del Planetario y las rocas de la Biblioteca España;
  - el óvalo del Atanasio con sus torres de luz;
  - los cubos de Explora y la pirámide invertida de la Biblioteca EPM;
  - los postes del Parque de las Luces y las esculturas de la Plaza Botero;
  - las flores del Orquideorama, el Pueblito Paisa y el Monumento a la Raza.

  De noche, sus ventanas brillan. Los sitios que son un edificio reemplazan solo al genérico que cae dentro de su planta; las plazas solo suman. Son 6.698 triángulos en total y no pesan nada (no hay modelos ni texturas). **El Coltejer y el Planetario no aparecían en el 3D**, porque la capa de hitos solo se dibujaba en la panorámica.
- **Juegos hermanos:**
  - **EnCicla 3.7.0:** la 3.5.0 de la otra sesión de Claude más las dos 3.6, de Antigravity y de GPT‑6. `tests/run.js` está en verde (170). La página sigue en la 3.4.0: el `publicar.yml` de GPT‑6 exige un benchmark (p95 < 50 ms con la CPU 4×) que todavía da 131 y 77 ms. No se cambió esa compuerta; decide el autor.
  - **El Metro 3.8.0:** la 3.6/3.7 «Épocas» de la otra sesión de Claude más la 3.7 de Antigravity y CX‑36 de Codex. 100 partidas con 0 errores; publicado con la APK 36.
- **Pruebas nuevas en la QA:** `sitios-3d`, `sitios-medellin`, `vuelcos`, `puentear-robo`, `minijuegos`, `guia-cine`, `quimica-mundo`, `r6b-datos` y `r6b-browser`.

### 23-nov-2026 · 5.2.0 «Ciudad viva» · fase 2 del plan 5.0 y lo de las otras IA, retomado
- **El autor:** «Haz tu parte; en algún momento ya dejarán de proveer, así que retómalos». Claude hizo la fase 2 y tomó los pedidos de Gemini y ChatGPT que más se notan en el juego.
- **Fase 2 · la ciudad viva** (`js/26-vida-ciudad.js`, `MC.CiudadViva`; idea de los «escenarios» de los mundos abiertos y de las reglas de respuesta de los diálogos de Valve, en sala limpia):
  - **Eventos con radio de oído:** choque, derrape, bocina, atropello, disparo, explosión, sirena y servicio.
  - **Reacciones:** según el evento, la distancia y el «valor» de cada persona (sale de su semilla), la gente **mira**, **huye**, **llama** por celular o **se acerca a ayudar**. La rutina se pausa y, al terminar, vuelve caminando a su sitio; nadie se mete a un edificio.
  - **Escenas de la calle:** gente sentada en las bancas y esperando en los paraderos del mobiliario real, según la hora y la lluvia (de noche, menos). Son estables: la misma persona en la misma banca.
  - **Frases** (G5‑03, escritas por Claude porque Gemini no alcanzó): `datos/frases/ciudad.json`, 56 de familia y 17 de adultos, con condiciones de evento, lugar, hora y lluvia. Gana la más específica y no se repite en 90 s. Se incrustan al construir (`MC_FRASES`).
  - **Turno Cero** (`juegos/getaway/66-ciudad-viva.js`): el testigo que llama por un atropello, un disparo o una explosión **sube la búsqueda** («un vecino llamó a la policía») y pide el servicio. 🚑 La ambulancia o 🚒 los bomberos salen a unos 300 m, llegan por la ruta real con la sirena, atienden (la ambulancia se lleva a los heridos) y se van. Globos con lo que dice la gente y 📞 ❗ 🩹 💨 sobre quien llama, mira, ayuda o huye. Poses nuevas: sentado y con el celular.
- **Lo de las otras IA, retomado:**
  - **C5‑01 · motos que se inclinan** (de ChatGPT): motos, bicis, patinetes y patines se inclinan hacia adentro de la curva, φ = atan(v·ω/g) con la gravedad real y un tope (45° la moto, 32° lo de ruedas), en los dos manejos. El 3D inclina el modelo, el piloto y las ruedas. Faltan los vuelcos y la deformación.
  - **R8 · cuartos falsos** (de ChatGPT): detrás de cada ventana encendida de las fachadas R1, de noche, un cuarto de 2,7 × 3 × 3–5 m trazado en el sombreador (interior mapping): pared del fondo con un cuadro o un mueble, piso de madera o baldosa, techo con su lámpara y luz cálida, blanca o el azul de un televisor. Las rejas y las cortinas se conservan. Solo con GPU media o alta; en gama baja y en la Historieta queda la ventana plana. Captura en `reportes/r8-cuartos-falsos-5.2.webp`. Faltan el SSAO, los faroles con luz y el agua con reflejo.
  - **G5‑06 · retos desde cualquier semáforo** (de Gemini; idea de Burnout Paradise): quieto junto a uno de los 355 semáforos reales, 🛑 y acelerar a la vez quema llanta en el sitio y reta al de al lado a una carrera hasta un sitio con nombre (lugares, hitos o estaciones) a 0,5–1,6 km. Es la 🏁 de Modos con un solo rival que sale al lado.
  - **G5‑12 · 📏 medir el rendimiento** (de Gemini): `?medir` en la dirección o ⏸ Menú → 📏. Un bot maneja 60 s en tres cámaras y sale un panel con fps, p50, p95, p99, tirones, memoria y GPU, y **📋 Copiar resultados**. Guía en `docs/MEDIR-EN-EL-CELULAR.md`.
- **Arreglos que salieron al probar:**
  - **La proyección 3D no sumaba la cota.** `Vistas.aPantalla` recibía la altura sobre el suelo, pero el 3D trabaja con la cota absoluta (unos 1.500 m en el centro de Medellín): la flecha al objetivo, los globos y los destellos de las sirenas quedaban fuera de la pantalla en las lomas. Ahora la vista suma la cota (y `tres.mjs` pasa la altura sobre el suelo, como el resto).
  - **El carro no arrancaba con el joystick de lado.** Casi quieto, la deriva de la llanta delantera se medía contra un piso de 0,5 m/s y, con el volante a tope, el modelo inventaba un derrape que frenaba tanto como empujaba el motor. Ahora las fuerzas de lado entran de a poco desde 0 m/s (a esa velocidad manda el modelo cinemático).
- **Pruebas nuevas:** `ciudad-viva.mjs` (45 comprobaciones, en Node con el mundo real y en el navegador con el despacho), `retos-semaforo.mjs` y `medir.mjs`; `dinamica.mjs` suma la inclinación de motos y bicis (25). Las cuatro, más `anillos.mjs`, entran a la QA.

### 23-nov-2026 · 5.1.0 «Todo junto» · lo nuevo de ChatGPT y Gemini, unido y pulido
- **El autor:** «Listo lo nuevo: ármalo todo, mejóralo, púlelo y optimízalo; piensa cuál será el siguiente paso y dame los prompts para Gemini/Antigravity y ChatGPT/Codex, y lo que harás tú mientras vuelven».
- **De ChatGPT y Codex** (cuatro ramas, sin tocar el juego):
  - **R3:** `geo/auditar_pisos_catastro.py`. Claude lo corrió (solo conteos): la capa *Construccion (8)* tiene **1.135.621 construcciones y el 96,7 % trae pisos válidos**, en `reportes/r3-cobertura-catastro.json`.
  - **R4:** auditoría de los techos de Overture, cruce seguro de huellas y reproyección.
  - **R5:** informe de licencias del relieve. Existe un **MDT LiDAR de 1 m de Medellín (2024), CC BY-SA 4.0**; espera la decisión del autor.
  - **R6:** `herramientas/precocinar-sectores.mjs`, mallas por sector de 1 km en 3 niveles, formato v2 i16.
  - Más dos flujos de QA que corren solo en los pull requests de esas herramientas.
- **De Gemini y Antigravity:**
  - **G5‑01, vista Historieta** (⚙️ Gráficos → historieta; cámara a 55° que gira con el carro);
  - **V4, paralaje por biomas** en 🏁 Arcade (6 biomas × 3 capas).
- **Pulido de Claude:**
  - **Historieta en la GPU.** Antes, cada cuadro pasaba por la CPU (`getImageData`, Sobel y `putImageData`: unos 8 ms, y el grano de las texturas salía como puntos negros). Ahora es un pase en la GPU de unos 2 ms: la tinta sale del laplaciano de la profundidad, que en un plano es cero, y se apaga con la niebla. Colores por bandas suaves; muros y suelo sin grano ni texturas de fachada (`uPlano`).
  - **Ganchos nuevos en `VistaTres`:** `posRender` y `uPlano`.
  - **Biomas:** las 18 imágenes ya no van en el código (769 KB → 30 KB); se incrustan al construir desde su manifiesto (`MC_BIOMAS_V4`).
- **Juegos hermanos**, cada uno tenía dos versiones paralelas:
  - **EnCicla 3.4.0:** la 3.3.0 de la otra sesión de Claude más la 3.3.0 de Antigravity;
  - **El Metro 3.5.0:** la 3.4.0 «Jugo y ciclovías» de la otra sesión de Claude más la 3.4.0 «Mundo 3D y Realismo» de Antigravity, con la colisión barrida que le faltaba a la carrera por ciclorruta.
- **Pruebas:** `historieta.mjs` y `paralaje-biomas.mjs` entran a la QA.
- **Dos tropiezos que salieron al unir** (las pruebas humana y de modos fallaban):
  - **El presupuesto de regiones.** Las dos ramas de Gemini envolvían `VistaTres.dibujar` para construir de un golpe 28 regiones (biomas) o 95 (Historieta) cuando había pocas. Así salían completas sus capturas, pero en el juego era un tirón de segundos al empezar, al teletransportarse o con el rescate. Se quitó: el presupuesto lo decide `MC.Vistas` según la calidad. Las pruebas de Gemini siguen en verde.
  - **El manejo real en un atasco.** La prueba humana fallaba según la hora: el reloj del juego sigue la hora real y, con el semáforo en rojo, los rivales quedaban quietos junto a una torre, donde la pista roza el edificio. Ahora:
    - los rivales y la policía se pueden **empujar** (impulso por masas, `cuerpo` en sus obstáculos);
    - un roce suave contra una pared **desliza** y conserva la rapidez;
    - si queda **encajado** más de 0,6 s, toma el movimiento del arcade mientras siga rozando y vuelve al real 0,4 s después.
  - La prueba humana pasa 3 de 3 (249 a 450 m).
  - El modo Extremo de la prueba de modos falla a veces, como ya pasaba en la 4.8: teletransporta al jugador, así que no depende de la física.


### 23-nov-2026 · 5.0.0 «Que se sienta» · el manejo real del carro y el plan para las tres IA
- **El autor:**
  - «¿Cómo podemos llegar hasta el nivel del motor de GTA San Andreas o Chinatown Wars?»;
  - «¿Qué otros motores podríamos copiar?»;
  - luego: «Sí. Agrega también a Gemini, que ya está disponible, dame los prompts para cada uno, mira lo nuevo de ChatGPT con Codex y retoma lo que quedó».
- **`MC.Dinamica` (`js/37-dinamica.js`):** el carro con física de verdad.
  - **Hoja de manejo por vehículo:** masa, batalla, reparto de peso, centro de masa, μ, rigidez de llantas, tracción, kW, N·m, rpm, marchas, frenos, dirección y suspensión. Sale de la ficha del taller.
  - **Carga que cambia entre ejes** y llantas que se saturan («fórmula mágica»), con círculo de fricción.
  - Subviraje de fábrica; el freno de mano suelta la cola.
  - **Marchas automáticas,** corte de rpm y freno de motor.
  - **Carrocería con resortes** (cabeceo, alabeo, rebote), dibujada en el 3D.
  - **Choques con impulso:** contra paredes y contra el tráfico, que sale corrido y vuelve a su carril.
  - **Ayudas para celular:** control de estabilidad con el joystick, la velocidad baja si el dedo apunta de lado, reversa corta si queda trancado y ayuda de esquinas.
  - El juego da un poco más de agarre y de empuje que un carro de calle (×1,3 y ×1,6), como hacen los juegos de mundo abierto.
- **Sonido:** el tono del motor sale de las rpm (f = rpm/60 × cilindros/2), en `MC.PersecucionAudio.motor`. El velocímetro de Turno Cero muestra la marcha.
- **⚙️ Flexibilidad → 🛞 Manejo de los carros:** real (lo de fábrica) o arcade. La IA sigue en arcade.
- **Prueba nueva `pruebas/dinamica.mjs`:** 19 comprobaciones.
  - Sedán Vega: de 0 a 100 en 6,6 s; de 100 a 0 en 41,1 m (la fórmula da 41,4).
  - Curva sostenida a 1,3 g sin trompo; en mojado, la mitad del agarre lateral.
  - Curva de 90° con el joystick; choque contra un edificio; golpe a un carro del tráfico.
- La prueba humana (solo entradas) sigue en verde con el manejo real: la carrera avanza 429 m a 30 m/s.
- **Unión:**
  - **R1 de ChatGPT/Codex** (fachadas de Medellín) con menos peso: copias de juego de 1024 y 512, 1,4 MB en vez de 6,7 por HTML;
  - **EnCicla 3.2.0** de la otra sesión de Claude a main y a la web (APK 3.2.0 en `descargas/`).
- **Plan y pedidos:**
  - `docs/PLAN-5.0.md` (diagnóstico frente a San Andreas, motores de los que se toman ideas, fases);
  - `docs/PEDIDOS-CHATGPT-5.0.md` (lo fuerte);
  - `docs/PEDIDOS-GEMINI-5.0.md` (lo fácil y mediano; Gemini vuelve).


### 22-nov-2026 · R1 fachadas de Medellín (rama de revisión)
- Doce texturas de ChatGPT integradas en VistaTres con emisión nocturna y respaldo procedural.
- Capturas y pruebas en reportes/2026-11-22-codex-integracion-arte-chatgpt-r1.md.
- R4 y R3 investigados, pendientes de fuentes y regeneración verificadas.


### 22-nov-2026 · 4.9.0 «Realismo» · three.js incrustado y el 3D realista
- **El autor:**
  - «Nuestro motor no logra mapear todo tal cual: los relieves, las casas y los edificios no son como son, y los gráficos aún son básicos. ¿Qué debemos hacer?».
  - Luego aprobó incrustar three.js: «haz todo eso que propones y sigue mejorando».
  - Sobre las imágenes: las fotos de la ciudad son solo para mirar y adaptar; no se montan en el motor.
- **three.js 0.170 (MIT) dentro de `dist/motor.js`:**
  - la construcción convierte su módulo en el objeto `THREE`, sin internet;
  - la licencia va en `js/vendor/LICENSE-three.txt` y en la cabecera;
  - `motor.js` pasa de 1,0 a 1,7 MB.
- **`MC.VistaTres` (`js/45-tres.js`):** dibuja las mismas regiones y mallas que `VistaGL` (que arma los datos y sigue de respaldo).
  - Luz: materiales físicos y sol con sombras de verdad (mapa que sigue a la cámara, alineado a sus texeles); luz de cielo hemisférica casi neutra (el azul lo pone el domo); reflejos solo en los objetos; exposición «Khronos PBR Neutral»; niebla del clima.
  - De noche: las ventanas encendidas brillan con luz cálida, y lo que el clásico aclaraba (carros, letreros) recibe un leve brillo propio.
  - Grano procedural en los muros, con las juntas del ladrillo, y en el suelo, con grano fino y manchas.
- **⚙️ Gráficos:** automático (realista salvo en GPU de gama baja), realista o clásico, con cambio en caliente (`MC.Vistas.reiniciarGL`).
- **Lección:** en three.js 0.163 y posteriores, `scene.environment` usa `scene.environmentIntensity` y no el `envMapIntensity` del material: teñía de azul todo lo que mira hacia arriba. Se encontró midiendo píxeles con las luces apagadas una por una.
- **Plan de datos para que la ciudad sea «como es»:** `docs/PLAN-REALISMO.md` (catastro en todas las comunas, techos de OpenStreetMap, relieve según la licencia, planos históricos, atlas de fachadas, mallas pre-cocinadas, «modo nube»).
- **Prueba nueva:** `pruebas/tres.mjs`.


### 22-nov-2026 · 4.8.0 · Flexibilidad, lo que dejaron Gemini y ChatGPT, y optimización
- **El autor:** «Retoma el trabajo de las otras IAs (Gemini y ChatGPT), termina de unir lo que falta en el Motor y el juego de prueba, más EnCicla y El Metro, dedícate a optimizarlos. Añade a todo *Flexibilidad*.»
- **Unión:** ramas de ChatGPT (`ia/chatgpt/4.7-auditoria-arcade-20261122`), Codex (`ia/codex/reporte-metrozero-20261122`) y Gemini (`ia/gemini/4.7-evolucion-arte-render`, solo coordinación) en el motor. EnCicla: la 3.0.0 de su otra sesión y la auditoría de GPT-6. El Metro: la 3.2.0, Antigravity, Codex y las dos de GPT-6.
- **⚙️ Flexibilidad (`js/37-flexibilidad.js`, `MC.Flex`):** diez ajustes para cualquier juego del motor:
  - control (según la cámara, apuntar, volante o un pulgar), giro, velocidad de los vehículos y distancia de la cámara;
  - acelerador fijo al subir y tren con palanca;
  - mano zurda, tamaño de la interfaz, calidad fija y vibración en choques.
  En Turno Cero: ⏸ Menú → ⚙️ Flexibilidad, guardado en `leerG().flex`. Prueba nueva: `pruebas/flexibilidad.mjs`.
- **Lo de ChatGPT (auditoría 4.7, 11/11 contratos):**
  - el metro con teclado o mando es palanca (↑ acelera, ↓ frena en cualquier cámara);
  - Run solo ofrece doblar hacia otra ciclorruta;
  - la carrera lejos de la salida pregunta «🚗 Ir manejando / ⚡ Llevarme ya» (sin teletransporte sin aviso);
  - la guardia de EnCicla quedó dentro de `60-modos.js` y se retiró `61-chatgpt-guardia-encicla.js`;
  - su prueba estática apunta a `pruebas/humano.mjs` (E2E solo con entradas) y su E2E de entradas reales pasa los cuatro escenarios.
- **Lo de Gemini (su plan de render, que no alcanzó a entregar):**
  - el Raster 3D por software dibuja el tráfico (`E.trafico`), respeta `_sinJugador` en el tren y tiene `aPantalla` (flechas, conos y efectos también sin WebGL);
  - la primera persona va a la altura de los ojos de quien maneja (1,15 m en carro, 2,3 m en bus) y solo dibuja el capó;
  - luz hemisférica, brillo especular Blinn-Phong y contorno, por vértice;
  - la niebla y la distancia siguen al escalador de resolución (`E.factorNiebla`, que nadie leía);
  - 🌄 miradores en el mundo abierto: la cámara de cine orbita, se cuentan y dan una propina.
- **Optimización medida (CPU 4×, manejando con ⏫):**
  - el caché de sectores de suelo tenía 16 sectores y el mapa grande, armándose en ratos libres, recorría 44 por fila: el LRU se vaciaba en ciclo (34 000 descompresiones en 8 s, 26 % de la CPU);
  - ahora guarda hasta 400 (unos 4 MB);
  - p95 del cuadro: cenital de 166 a 33 ms, tercera de 133 a 50 ms y ciudad 3D de 150 a 50 ms.
- **Interfaz:** en horizontal el minimapa sube junto a los botones (antes tapaba la fila Modos/Cámara); en zurdo los botones van a la izquierda y el minimapa a la esquina libre.
- **Pedidos nuevos en la misma sesión (Turno Cero):**
  - 🆘 **Rescate** (`juegos/getaway/63-rescate.js`, como el 🆘 de El Metro): salir a la calle más cercana, 🔧 grúa y mecánico, 🚕 taxi, 🚇 la estación más cercana, 🚑 ambulancia, 🏠 volver a donde empezaste y 🗺️ elegir un punto; un vigía lo ofrece si llevas 3,5 s empujando sin moverte o vas en carro lejos de las calles. Con la policía encima o en un capítulo, no hay saltos.
  - 🗺️ **Un solo mapa:** el minimapa, 🗺️ y M abren el mismo; al poner un punto aparece **🚀 Ir** (calle más cercana o, si no hay a 400 m, el sitio transitable más cercano al punto); 🌍 y alejar más allá de la ciudad pasan al planeta, y 🗺️ en el planeta vuelve. El botón suelto 🌍 se quitó (la tecla G sigue).
  - ✂️ **Pantalla en mitades** (motor, `MC.Controles({ mitades: true })`): abajo se maneja (joystick en el cuarto de su mano, botones al otro); arriba es siempre la cámara: arrastrar gira e inclina, pellizcar acerca o aleja, el encuadre se queda y el doble toque lo endereza. El dedo del joystick no se suelta aunque otro mueva la cámara. ⚙️ Flexibilidad permite volver a la clásica.
  - Prueba nueva: `pruebas/rescate-mapa.mjs`.
- **Juegos hermanos:** EnCicla 3.1.0 (giro, velocidad de la cicla y pedaleo fijo al empezar, junto a lado, tamaño y vibración) y El Metro 3.3.0 (arcade o realista, mano zurda, joystick, giro, velocidad, acelerador fijo y tamaño de botones), ambos con sus pruebas en verde.


### 22-nov-2026 · Ilustraciones de actos y accesibilidad del menú
- Cinco imágenes originales WebP aparecen en las transiciones de Turno Cero.
- MC.UI limpia el manejador Escape, cierra el menú anterior y devuelve el foco.
- Pruebas de modos admiten HTTP local. Ver CONTEXTO-CODEX-TURNO-CERO.md para resultados y pendientes.


### 22-nov-2026 · 4.7.0 · Plan de evolución, ritmo arcade, todo liberado y los modos en el mundo abierto
- **El autor** (a tres IA a la vez):
  - revisar el juego contra los mejores e investigar jugabilidad, controles, mundos grandes con pocos recursos, render y optimización;
  - un plan verosímil en un documento con la marca de cada IA;
  - arreglar los modos (lentos, engorrosos, «no se mueven»);
  - todo liberado; cada modo presente en el mundo abierto con la misma experiencia;
  - Run solo en ciclovías;
  - luego arte, cámaras y un solo mundo 3D.
- **Documento:** `docs/PLAN-EVOLUCION-CLAUDE.md`. Contiene:
  - una auditoría con «dedo» real en 6 cámaras × 5 vehículos;
  - la comparación con las ~40 referencias (técnica, no arte);
  - la investigación transversal, con fuentes;
  - ideas por género bajo el marco de la «doble vida» de Mara;
  - el mundo vivo (RPG y «MMO sin servidor»), Run, cámaras y arte;
  - la hoja de ruta 4.8–5.0 repartida entre Claude, Gemini y Codex;
  - las ideas que no tienen cabida.
- **Ritmo arcade** (a pie ≈ 43 % de la bici, como en EnCicla):
  - a pie camina a 2,2, trota a 4 y corre a 6,4 m/s;
  - bici: 9; e‑bike y MTB: 10,5; skate: 7; patines: 7,5;
  - se trota con el joystick a fondo en cualquier vista.
- **Modos más cortos y vivos:**
  - EnCicla y Mandados: 0,3 a 1,3 km;
  - Extremo: hasta 2,6 km;
  - tren: 2,4 m/s² al acelerar y 3,2 al frenar, ×3 lejos de la estación, sin espera inicial; el joystick empuja hacia donde va.
- **Todo liberado:** los 5 capítulos y todos los vehículos desde la primera partida.
- **Actividades en el mundo abierto** (`G.Actividades`):
  - marcas por celdas de 1,2 km con datos reales: 🏁 avenidas, 🚵 lomas, 📦 lugares, 🛹 plazas, 🛴 ciclorrutas, 🚲 EnCicla y 🚇 estaciones;
  - se ven en la calle, el minimapa y el mapa;
  - ▶ Jugar arranca el mismo modo ahí.
- **🛹 Zona de trucos y parkour:** saltos, giros en el aire con el joystick, caer derecho y combos ×5. **🛴 Run** también en el menú 🎮.
- **Cámaras:**
  - por contexto: Arcade solo en carretera y carreras, Vuelo solo volando; primera persona y dron en el selector;
  - la cenital de verdad (79° y 66°) se aleja con la velocidad, como GTA 2;
  - en las vistas de volante, el joystick de lado avanza.
- **Hallazgos de Gemini en las zonas de Claude:** resueltos (metro, cenital, volante, cámaras, Run, puente del raster).
- **Coordinación:** `coord/buzon/2026-11-22-claude-4.7-en-curso.md` y `20261122-1500-claude-4.7-respuesta.md`. Unida la entrega de Codex (`c3fc286`).
- **Pruebas:** 146 Node y `pruebas/modos.mjs` (cinco modos, ⏫, mapa y vuelta al carro).


- **El autor:** «el joystick está bien, pero el problema es el arranque: si se suelta el joystick se deja de acelerar; coloca un botón que, presionado, siempre esté acelerando sin parar, y para detenerse simplemente se desactiva».
- **Motor:** `MC.Manejo.aplicar(…, { acelFijo })` (`js/37-manejo.js`): prendido, acelera a fondo y el joystick solo da la dirección (sin joystick sigue derecho y el imán de calle lo alinea); apagado, frena suave hasta parar (`frenoK` 0,55 en `js/32-fisica.js`), salvo que se toque el joystick. El 🛑 manda mientras se oprime (y con giro, derrapa). `ui.alternar` (`js/70-interfaz.js`): botón que se prende y se apaga, verde y brillante cuando está prendido.
- **Turno Cero:** ⏫ junto a 🛑 y ⚡ (tecla V), visible en carro, moto, bici y manejando el tren de 🎮 Modos; a pie se esconde y se apaga; un aviso la primera vez. En vertical la velocidad sube sobre la fila de botones; en horizontal la columna izquierda ya no invade la zona libre.
- **Pruebas:** §27 (sin joystick llega a 25 m/s derecho en 4 s; con el joystick a un 35 % gira sin soltar el acelerador; apagado para en 2,1 s) y `pruebas/modos.mjs` toca el botón de verdad en Turno Cero (114 km/h en 3,5 s y luego para).

### 21-nov-2026 · 4.6.0 · El manejo de EnCicla, el mapa de EnCicla, horizontal y un solo juego de prueba con todo
- **El autor:** «injugables: toscos como GTA IV; derrapa por nada, va lento, avanza lento, retoma lento; no hay horizontal; te basaste en El Metro: básate en EnCicla y arregla El Metro de paso; el mapa no deja elegir en la brújula y al abrirlo el juego deja de funcionar; el de EnCicla acerca, aleja y no se ralentiza». Luego: «la idea no era tener 4 juegos de prueba sino uno: entrega los cuatro en Turno Cero y rescata lo de EnCicla y El Metro».
- **Manejo (motor, `js/32-fisica.js`, `js/31-vehiculos.js`):** el modelo de `BicicletasUno/src/js/30-ride.js` para carros, motos, bicis y a pie: el vehículo gira hacia donde apunta el joystick con una velocidad de giro que baja con la velocidad, la velocidad persigue un objetivo (empuje × (0,3 + 0,7·cos Δ)) con aceleración y frenado firmes, las llantas agarran (derrape solo con freno de mano), asistencia de esquinas de EnCicla y reversa. Tabla `Vehiculos.ARCADE` por tipo. El modelo de llantas de Turno Cero (`ManejoCarro`) queda solo en «simulación».
- **Al ritmo del reloj:** la física da subpasos de 25 ms (antes, con dt topado en 50 ms, a pocos cuadros por segundo todo iba en cámara lenta); búsqueda, persecución, objetos y guardias a pie, igual. Prueba §26: 0→90 % en 2,7 s, radio de 4,8 m a 20 m/s sin derrapar, freno de mano que derrapa y se endereza en 0,1 s, y a 15 y a 60 cuadros por segundo el carro recorre lo mismo.
- **Cámara:** mira menos adelante (0,45·v, tope 1/6 de la vista) y sigue más rápido.
- **Mapa grande (`js/70-mapa.js`):** como el de EnCicla: una vista general del mundo armada de a poco (y en los ratos libres mientras se juega), el detalle con presupuesto por cuadro, el juego en pausa mientras está abierto, ✕ + − ◎ 🧭 (norte o rumbo arriba), tocar = destino (pegado al lugar o la estación más cercana), nombres que no se montan y la escala. Tocar el minimapa (que ahora marca la N) lo abre. Antes repintaba más de mil losas de Medellín en cada movimiento del dedo.
- **Horizontal:** portada de Turno Cero a dos columnas, HUD que no se monta (artefactos arriba al centro, subtítulos más abajo); el APK gira con el celular (antes, fijo en vertical); Run Scooter también.
- **Un solo juego de prueba:** `juegos/getaway/60-modos.js`, 🎮 Modos en Turno Cero (portada, botón y ⏸ Menú): 🏁 Carreras (circuito o sprint con 3 rivales, récords), 🚵 Extremo (bajada en bici de montaña, saltos y derrapes), 📦 Mandados (tres entregas con reloj y paquete que se daña), 🚲 EnCicla (rebalanceo de estaciones, racha por la ciclorruta, multa por semáforo en rojo) y 🚇 Metro, tranvía y Metroplús (manejas el tren por la línea real y paras en el andén), más 🧪 Laboratorio (estilo, hora, clima y cualquier vehículo). Sin policía mientras dura un modo. `juegos/carreras/` y `juegos/extremo/` se borraron (su código vive en Turno Cero); Mandados queda solo como banco interno de pruebas (público simulado y capturas), fuera de la portada y de las entregas.
- **El Metro (MetroZero):** la sesión de El Metro ya publicó en paralelo la 3.1.0 «Fluido» con el manejo de EnCicla (APK 29). Esta sesión también lo había hecho, pero lo retiró para no pisarlo: en MetroZero solo quedan el motor 4.6.0 en `motor-city/` y `docs/INFORME-MOTOR-CITY-4.6.md`. En EnCicla otra sesión prepara la 2.1.0 en su rama: tampoco se avanzó su `main`.
- **Pruebas:** 145 Node y 157 en navegador; `pruebas/modos.mjs` juega los cinco modos de punta a punta y abre el mapa (reemplaza a `pruebas/carreras.mjs`); los hermanos, en verde con el motor 4.6.0 copiado.
- **Falta:** probar la sensación con las manos en un celular (autor); el globo en la misma escena 3D (C‑M31) sigue pendiente.

### 21-nov-2026 · 4.5.0 · PVS, modelos y ciudad pulidos, manejo que no se traba, efectos, rostros, Hunter Assassin, y los juegos Motor City y Extremo
- **El autor:** retocar modelos 3D, 2D y pixel; el PVS; Guatapé en los juegos hermanos; topografías, relieve, casas y edificios; luego, «mejor un informe detallado a cada repositorio y que sigan con su motor del Valle, solo compárteles el motor»; y en el motor y el juego de prueba, todo lo que falta, sin cambiar el mapa. Después: manejo y controles («ahí yace toda la jugabilidad»), rostros detallados, árboles con lógica, vehículos que suben por algunas cosas, la forma cenital de *Hunter Assassin* y explosiones, choques, derrapes y cosas rotas.
- **PVS de Quake (C‑M37):** `herramientas/pvs.mjs` hornea, para cada celda de 160 m, qué celdas se ven (horizonte de Comanche desde ojos en la calle y sobre las vías, 4 núcleos); `js/45-pvs.js` y la vista 3D lo usan con la cámara a ras de calle. Recorta 26 % en Manhattan y 28 % en Guatapé, sin fugas grandes (`pruebas/pvs.mjs`). Medellín se midió (15 %) y no se mete al HTML.
- **Modelos y ciudad:** generador 0.3.1 (carros con capó, cabina y baúl, rines, faros y espejos; personas con cara, manos y peinado; AO horneada; malla indexada); techos a cuatro aguas; terrazas con aires y escalera; coronas y agujas; relieve cercano a 10 m. El mapa no se tocó.
- **Peso y sin conexión:** GLB comprimidos (2 MB → 0,4 MB); `sw.js` con prueba (`pruebas/sin-conexion.mjs`).
- **Manejo (`docs/INVESTIGACION-MANEJO.md`):** deslizar contra la pared, pérdida según el ángulo, desatascar, asistencia que evita estrellarse (se apaga), derrape con freno de mano, andén, ladrillo, arena, nieve y roca suelta; la moto por escalas. Lo mismo para el modelo de bicicleta de los carros de Turno Cero, que era el que frenaba en seco.
- **Efectos y rotos:** `js/88-efectos.js` y `js/32-rotos.js`.
- **Rostros:** `js/71-rostros.js`, retratos en los diálogos y subtítulos de Turno Cero; caras en los modelos 3D.
- **Árboles:** nada en canchas, piscinas ni en la mitad de las plazas duras.
- **Turno Cero:** linternas que se cortan en los muros y cámara cenital en el sigilo a pie (*Hunter Assassin*), el carro destrozado arde y estalla, HUD en rejilla de 8 px.
- **Juegos nuevos:** `juegos/carreras/` (Motor City · Carreras) y `juegos/extremo/` (Extremo), mundo abierto en Guatapé con banderas de carrera; `pruebas/carreras.mjs`.
- **Pruebas:** 144 Node, 156 navegador, PVS, sin conexión, carreras y la historia entera de Turno Cero (Final A en 162 s, 0 errores); todo en la integración continua.

### 21-nov-2026 · 4.4.0 · Claude asume lo que dejaron las otras IA
- **El autor:** «Y ya ni lo harán, resuelve tú lo que falta».
- **Unidas las últimas entregas:**
  - ChatGPT: C‑M34 raster espacial (sectores de suelo y nivel de 1 km comprimidos, bajo demanda y con LRU);
  - Antigravity:
    - pool circular sin basura en `MC.Vida`;
    - escalador EMA con histéresis y niebla acoplada en `ResDinamica` (*Shadow of the Colossus*).
- **Turno Cero:**
  - **🎬 Modo cine (C‑M40, *The Getaway*):**
    - sin flecha ni minimapa;
    - las direccionales del carro marcan la próxima esquina de la ruta (a menos de 90 m);
    - al llegar se encienden las estacionarias.
  - **A pie (C‑M32):**
    - 🧱 cubierta: quieta y pegada a un muro, los guardias ven a 0,45 de la distancia;
    - 💨 esquivar (botón o Q): 3 m en 0,4 s sin que te alcancen a golpear.
  - **🕹️ Retro 1993 (C‑M39):** el COLORMAP de Doom (`js/47-colormap.js`):
    - paleta propia de 256 colores;
    - tabla RGB15 de 32 768 entradas;
    - 32 niveles de luz por distancia y por la noche;
    - unos 1,3 ms por cuadro.
- **EnCicla:** los 5 arreglos que describió Codex, con su regresión (ver su bitácora).
- **Run Scooter:**
  - 🛣️ «Run por la carretera de la nada» (C‑R40): costa, desierto, nevado y bosque de lagos, con arena, hielo y troncos;
  - el regalo diario se entrega solo, sin ventana;
  - el motor lo reimporta (`herramientas/importar-run.mjs`; las 12 adaptaciones aplican).
- **Probado:**
  - Node: 142, con el COLORMAP en § 23;
  - el contenido;
  - C‑M34;
  - Chromium;
  - EnCicla en verde;
  - El Metro: 100 partidas;
  - Run Scooter: 100 partidas.
- **Pendiente** (`CONTEXTO-RELEVO.md` § 5):
  - el PVS calculado por adelantado;
  - Guatapé en El Metro y EnCicla;
  - las crónicas de El Metro;
  - el globo en la misma escena;
  - el celular real.

### 21-nov-2026 · 4.3.0 · La auditoría móvil de Antigravity, arreglada; mundo abierto primero en los tres juegos
- **Unidas:**
  - **la auditoría de Antigravity:** `reportes/2026-11-21-gemini-clasicos-4.1.md` (G‑H25, G‑H26 y G‑H28, con 18 capturas) y el catálogo G‑H27 (`reportes/2026-11-21-gemini-tecnicas-clasicas-extra.md`);
  - **la caché del planeta de ChatGPT:**
    - cada ciudad se carga una sola vez aunque la pidan varias veces;
    - LRU con presupuesto;
    - la ciudad donde uno juega queda protegida;
    - pruebas `planeta-cache-cm34.mjs` y `planeta-cache-browser.mjs`.
- **Arreglos de la auditoría:**
  - **🏁 Arcade:**
    - en la ciudad, debajo del horizonte ya no queda el cuadro anterior (ni el «carro fantasma»);
    - sin costuras entre segmentos;
    - el haz de los faros de noche ya no quema el horizonte.
  - **Correr a pie en el celular:** ⚡ a pie ahora es correr (`js/33-controles.js`). Antes, con el dedo, Mara no pasaba de 1,53 m/s; ahora llega a 4,25 m/s.
  - **Sigilo:**
    - «agachada» solo cuando va casi quieta;
    - correr hace ruido también en pasto o en el andén;
    - los faros cuentan solo de noche y no atraviesan muros (`MC.DDA.bloqueado`);
    - la gema cambia de color (azul apagado → ámbar → amarillo) y la primera vez explica qué es.
  - **Menú ⏸:** ya no se corta arriba a 412 × 860 (lo empujaba un estilo en línea). Ahora queda centrado y se desplaza.
  - **⛰️ Vuelo:**
    - se reusan los búferes de la ventana anterior (sin 2,8 MB nuevos en cada cambio);
    - de noche, el carro lleva halo y los stops encendidos.
- **Mundo abierto primero en los tres juegos** (regla del autor, medida por Antigravity):
  - **El Metro:** ▶ Jugar entra directo a Ciudad Libre, y «Todos los modos» queda debajo. Sus íconos ya no dan 404.
  - **EnCicla:** ▶ Jugar entra directo al modo libre. «🏆 Oficios y modos» lleva al escalafón; la bienvenida y el personaje son opcionales.
  - **Turno Cero:** ya cumplía.
- **Probado:**
  - Node: 141;
  - el contenido de Turno Cero;
  - la caché del planeta en Node y en Chromium;
  - la batería de Chromium;
  - El Metro: 100 partidas, 0 errores;
  - EnCicla: en verde;
  - capturas a `412 × 860`.

### 21-nov-2026 · 4.2.0 · Las entregas de las otras IA unidas, recorte por región, la historia se encuentra en el mundo abierto
- **Unidas:**
  - **ChatGPT/Codex** (`ia/chatgpt/4-0-2-gemini-auditoria`, 13 commits):
    - el arte de Gemini en la portada (WebP adentro del HTML);
    - 6 GLB con UV y PBR;
    - una sola ciudad en memoria al viajar;
    - el globo en celular vertical;
    - piezas y humo también en 2D y en Raster.
  - **C‑M34** (`ia/chatgpt/cm34-cache-20261120`, 26 commits): Turno Cero carga los MC4 **por capas comprimidas bajo demanda**, con caché LRU de sectores de Manhattan. Pruebas en Node y en Chromium.
  - **Antigravity** (`ia/antigravity/motorcity-4.0`):
    - las técnicas clásicas probadas sobre datos MC4 reales: `experimentos/tecnicas-clasicas/`, con laboratorio interactivo y 6/6 pruebas;
    - `docs/MOTORES-CLASICOS-INGENIERIA.md` (RenderWare, *Driver*, Silent Hill, *Shadow of the Colossus*, Unreal…);
    - la verificación visual 4.0.3.
  - **Las paradas de carretera:** 56 (28 de Gemini y 28 de ChatGPT), con `id`, `nombre_es`, `nombre_en` y `rutas`. El generador las usa tal cual.
- **Motor:**
  - **recorte por región en el 3D (`js/45-gl.js`):**
    - lo que está más allá del muro de niebla no se dibuja (Silent Hill);
    - en las cámaras de manejo, lo que queda detrás de la cámara tampoco;
    - en tercera persona se dibujan **17–18 de 58 regiones**; las cámaras aéreas no se recortan.
  - **IA:**
    - los carros de la IA atropellan lo menor del andén (poste, banca, paradero, caneca, hidrante) en lugar de trancarse; árboles y rocas sí los paran;
    - cruzan las casillas de borde (ladrillo, o edificio sin edificio real encima).

    Esa era la causa de la prueba que a veces fallaba: el rival de la carrera chocaba con un ladrillo del borde. Ahora avanza 55–87 m en 6 s.
  - **⛰️ Vuelo sin pausa:** la primera ventana también se arma por franjas, con un aviso de carga. El peor cuadro baja de unos 300 ms a 24 ms.
- **Turno Cero:**
  - **la historia se encuentra en el mundo abierto** (`56-abierto.js`):
    - un 📖 en la calle y en el minimapa donde empieza el próximo capítulo, o donde quedó la historia;
    - al pasar cerca **solo avisa**; se juega si uno toca 📖 Historia;
    - si el capítulo es en otra ciudad, lo dice al entrar;
  - **la carrera callejera:**
    - la meta queda hacia adelante;
    - el rival sale en el carril de al lado, sin encimarse;
    - si todavía no tiene ruta, va derecho a la meta.
  - el HUD dice «🌎 Mundo abierto».
- **Probado:**
  - Node: 141;
  - el contenido de Turno Cero;
  - C‑M34 en Node y en Chromium;
  - la técnica clásica de Antigravity (6/6);
  - la batería de Chromium completa;
  - capturas a `412 × 860`.

### 21-nov-2026 · 4.1.0 · Motores clásicos: lo que hicieron Comanche, OutRun, Thief, Wolfenstein y Elite, rehecho para Motor City
- **El pedido del autor:**
  - investigar motores viejos que hoy son livianos pero potentes;
  - ver cómo los usaron los mejores juegos;
  - traer sus partes al motor.
- **Regla:** sala limpia. Se toman las ideas publicadas y se escribe el código desde cero. No se copia código GPL, ni de licencias propias, ni filtrado. Licencias y fuentes en `docs/INVESTIGACION-MOTORES-CLASICOS.md`.
- **`js/47-clasicos.js`:**
  - **🏁 Arcade (`MC.Arcade`):** la carretera pseudo-3D de Pole Position y OutRun, sobre la vía real:
    - proyección por segmentos con recorte en el plano cercano;
    - franjas fijas al mundo y lomas del relieve;
    - montañas en paralaje con el rumbo;
    - pinos, palmas y cactus según el bioma; postes; letreros de veredas;
    - edificios del mapa como cajas; carros y patrullas con sirena;
    - faros de noche;
    - en celular vertical, la cámara se ajusta para no abrir demasiado el campo.
  - **⛰️ Vuelo (`MC.VoxelSpace`):** el Voxel Space de Comanche:
    - mapa de alturas y de color desde el MC4, con los edificios encima y la luz horneada;
    - columnas con y-buffer de adelante hacia atrás;
    - la ventana nueva se arma por franjas, para no trabar el juego.
  - **`MC.Sigilo` (Thief):**
    - la gema de luz: sol, sombra de los edificios hacia el sol, postes de noche y faros;
    - el ruido que rodea los edificios (Dijkstra en una rejilla de 4 m).
  - **`MC.DDA` (Wolfenstein 3D):** las casillas exactas de un rayo.
  - **`MC.Semilla` (Elite):** nombres de veredas siempre iguales desde tres números de 16 bits.
- **Turno Cero: mundo abierto desde el principio.** Pedido del autor: «quiero mundo abierto desde el principio; el tutorial o el contexto de la historia es opcional».
  - En la portada, el primer botón es ▶ **Jugar · mundo abierto**: Medellín (la ciudad más liviana en memoria) o donde quedaste, sin tarjetas ni diálogos. En la VM tarda 1,7 s.
  - La historia es opcional: 📖 en la portada, el botón 📖 Historia en el juego, ⏸ Menú y la tecla H (seguir, empezar o repetir un capítulo).
  - La casilla «Entrar directo» salta la portada la próxima vez, solo si ya se aceptó el 18+. Con `?portada` vuelve.
  - El HUD dice «🌎 Mundo abierto».
- **Turno Cero (`juegos/getaway/55-clasicos.js`):**
  - en las misiones de sigilo hay una gema ◆ que brilla según la luz; en lo oscuro, los guardias ven a un tercio de la distancia;
  - correr a pie o el motor cerca hace que un guardia vaya a mirar («👂 Un guardia oyó tus pasos»);
  - en 🎥 Cámara están las cámaras 🏁 Arcade y ⛰️ Vuelo.
- **Probado:**
  - § 22 de `pruebas/prueba.mjs`:
    - el DDA visita las casillas `0,0 1,0 2,0 3,0`;
    - Elite da los mismos 64 nombres, 64 distintos;
    - la luz vale 0,96 a mediodía y 0,24 a medianoche bajo un poste;
    - un guardia ve a 9,7 m en lo oscuro y a 24 m a pleno sol;
    - el ruido rodea un edificio: 55 m de camino contra 34 m en línea recta;
    - el camino arcade queda 100 % en la calle;
    - el voxel pone edificios de hasta 56 m;
  - el banco ahora tiene 11 vistas;
  - capturas en Chromium `412 × 860` de Medellín y de la Autopista del Embalse, de día y de noche.

### 21-nov-2026 · 4.0.3 · Terminar las tareas de las otras IA antes de que se queden sin uso
- **El pedido del autor:** «ayúdalos a completar las tareas, están por quedar sin uso». Claude unió y terminó lo que dejaron a medias.
- **ChatGPT / Codex** (`ia/chatgpt/4-0-2-gemini-auditoria`):
  - se unieron sus 6 arreglos nuevos:
    - ocho lugares corregidos;
    - diálogos que se cancelan al pasar a Calle libre;
    - portada compacta y menú con fondo;
    - guardias que solo persiguen si ven;
    - lenguaje suave en singular y plural;
  - su prueba de la persecución a pie estaba en rojo en su propia rama: `AccionPie.ocluido` miraba cada 3 m y se saltaba muros de 2 m. Ahora mira cada metro y la prueba pasa.
- **Gemini / Antigravity:**
  - las 56 paradas (28 suyas y 28 de ChatGPT) quedan en `PARADAS_RUTA`, con la prueba ajustada a 8 por bioma;
  - del informe G-H21/G-H23 se suman, sobre lo de ChatGPT:
    - el contrato «El sapo» pasa a llamarse «El testigo incómodo»;
    - el lenguaje suave cubre los finales y concuerda en género y número (`jodida` → `complicada`, `cabrones` → `canallas`);
    - el botón `G SEÑUELO` de la escena 3D se acorta a `G CEBO`;
    - la ruta de `arte3d/pruebas-modelos.py` apunta a `arte/modelos/turno-cero/` (42/42).
- **El Metro, zonas Z1 y Z2 de Antigravity:** sus 6 errores de `412 × 860` quedan arreglados en `MetroZero/src/js/98-relevo-z1.js`. Detalle en la bitácora de El Metro.
- **EnCicla, lo de Codex:** sus arreglos de código no llegaron a GitHub; solo su ficha. Quedan anotados en `CONTEXTO-RELEVO.md` § 5 para que los suba.

### 21-nov-2026 · 4.0.2 · La IA que maneja de verdad, Run en Turno Cero, carreras y guardias a pie
- **Pedido:** «Continúa mejorando».
- **Hallazgos al probar una carrera:**
  - **los carros no tenían reversa:** frenar con el carro quieto lo dejaba en cero, y si el destino quedaba atrás, el modelo frenaba para siempre;
  - **`MC.Manejo.rutaA` unía el punto de salida y el de llegada con el primer y el último nodo en línea recta**, por encima de casas y laderas.
  - Las dos cosas afectaban a toda la IA (patrullas, banda y El Contador), al «tocar para ir» y al jugador (el joystick hacia atrás no daba la vuelta).
- **Motor:**
  - **reversa** en `ManejoCarro`: quieto, frenar es reversa hasta 8 m/s;
  - **vuelta en tres puntos** cuando el destino queda atrás;
  - **`rutaA` sigue la forma de la calle** al salir y al llegar, y cuesta por distancia sobre la vía (prueba: 0 tramos sobre casas);
  - **`MC.Manejo.pilotar`**, el piloto de la IA:
    - mira adelante en la ruta y frena según la curva que viene;
    - retoma la ruta nueva por delante (no vuelve al nodo de atrás);
    - con el destino atrás, gira en su sitio (arcade, solo la IA);
    - si se atasca, retrocede, y si se traba dos veces se reacomoda hacia la calle, sin cruzar casas;
  - los carros de la IA, sobre la calle, no chocan con árboles, postes ni bancas (`C.ia`).
  - **Medido:** en Medellín una patrulla recorre 1,7 km de ruta en unos 60 s, a unos 32 m/s; en Guatapé llega en 3 de 4 casos (el que falla arranca sobre una calle que los datos marcan como edificio).
- **Turno Cero:**
  - **Run en la ciclovía**, el modo de Medellín: 🛴 sobre una ciclorruta, a pie, en EnCicla, patinete, skate o patines; si sales con más de 300 m, la policía te pierde, y los puntos dan plata;
  - **carreras callejeras** contra un coupé dorado por la red vial real, con apuestas;
  - **guardias que persiguen a pie** con la alarma, golpean de cerca y se reducen con ✊;
  - **accesibilidad**: menos destellos, sin sacudidas de cámara y subtítulos grandes (con el lenguaje suave, en ♿ del menú);
  - las metas de los contratos solo caen en calles para carro.
- **Pruebas:**
  - 152 de 152 en verde, con la sección 21 (reversa y piloto) y la prueba de rutas que siguen la calle;
  - en Chromium, Run y la carrera;
  - el bot de la historia completa sin errores.


### 20-nov-2026 · 4.0.1 · Relevo entre IAs y mejoras de los pedidos 4.0
- **Pedido del autor:** «Retoma, continúa y termina: el HTML, el link, todo actualizado y siempre un documento de contexto con todo el plan, lo hecho y lo que falta (y que la otra IA haga el suyo). Retoma las nuevas peticiones y mejora el motor, el juego de prueba, el arte y la tecnología».
- **Relevo:**
  - `CONTEXTO-RELEVO.md` contiene el plan, el estado, lo hecho, lo que falta (con dueño), las reglas y la entrada de cada IA;
  - es obligatorio que cada IA deje la suya y le pida lo mismo a la siguiente;
  - se adoptó en el motor el protocolo `coord/` de Antigravity y Codex (ficha por agente y buzón donde solo se suma);
  - el documento único empieza por el relevo.
- **Motor:**
  - **luces de los GLB:** los faros y las luces traseras se encienden de noche, y cada modelo tiene un mínimo de luz propia (`Modelos.brillo`);
  - **abolladuras por zona** en los carros 3D (`op.dano` = frente, atrás, izquierda, derecha), con faro roto, a partir de los golpes;
  - `MC.Busqueda` guarda dónde se abolló cada rival y avisa al jugador (`abolladura`);
  - la sirena se apaga en el rival aturdido.
  - Esto avanza C‑M35.
- **Turno Cero:**
  - sonido de motor por capas de rpm y sirena con efecto Doppler (C‑M36);
  - dron policial en 3D con el modelo de Codex;
  - **reducción no letal a pie** de los guardias (✊), con la animación de golpe de Codex;
  - al alejar la cámara más allá del tope se pasa al planeta con animación (C‑M31, primera parte);
  - eventos de carretera al azar en Calle libre (banda, retén, emboscada, un camionero que paga);
  - tres contratos nuevos, uno de ellos contrarreloj;
  - arte de portada: ilustración SVG procedural con Manhattan, el Metrocable, la Piedra del Peñol y la carretera.
- **Pruebas:** en Node, faros y abolladuras; el bot de la historia completa sin errores; las capturas.


### 20-nov-2026 · 4.0.0 · El planeta y *Turno Cero*
- **Pedido del autor:**
  - «empieza con la creación del monstruo; nada de *family friendly*»;
  - «combina ese mundo con Guatapé y la mejor versión de Medellín y el valle, todo en un mismo planeta, con caminos largos en medio de la nada»;
  - y luego: «adapta todo lo nuevo que se agregó».
- **Lo nuevo de Codex, unido a la rama:**
  - *Turno Cero: Manhattan*, en `docs/GETAWAY-MANHATTAN-BIBLIA.md` y `docs/GETAWAY-ESPIONAJE-3D.md`;
  - las 13 referencias;
  - el prototipo 2D;
  - el generador de 42 GLB, con su CI.
- **`MC.Planeta`** (`js/13-planeta.js`):
  - un anillo con Nueva York, la Ruta del Atlántico (16 km), Medellín y el Valle, la Autopista del Embalse (12 km), Guatapé y la Carretera del Norte (15 km);
  - las carreteras se generan con `Generador.carretera` y tienen sus biomas;
  - las puertas son reales (los puentes George Washington y de Brooklyn, las autopistas Norte y Medellín–Bogotá, la vía a El Peñol);
  - vista de globo y horizonte curvo (`uCurv` en el sombreador).
- **`MC.Busqueda`** (`js/28-busqueda.js`):
  - búsqueda de 0 a 5 con los umbrales de Codex (15/35/55/70/85) y un tope de 4;
  - los rivales nacen fuera de la vista y van a la última posición vista;
  - tácticas seguir, cerrar y embestir, con empuje por masa;
  - disparos, púas, retenes y helicóptero con reflector;
  - cebo, pulso y disparos del jugador, y captura.
- **`MC.Modelos`** (`js/45-glb.js`):
  - lector GLB sin librerías;
  - los 42 modelos de Codex, guardados en `arte/modelos/turno-cero/` (CC0);
  - la cámara 3D los usa en carros, patrullas (con barra de luces), camionetas, guardias, retenes y contenedores.
- **Construcción:**
  - juegos con varios mundos (`"mundos"`; cada MC4 va en un `<script type="text/plain">`);
  - GLB dentro del HTML (`"modelos"`).
  - Además: `Vistas.liberar()` y el tema de interfaz «noche».
- **Turno Cero** (`juegos/getaway/`, 25 MB, 18+):
  - cinco actos y siete misiones por las tres ciudades;
  - artefactos T01, T02, T03, T05, T06, T08, T09, T11 y T04;
  - sigilo con conos de visión;
  - el metro, los cables, el tranvía y el Metroplús de Medellín para perder a la policía;
  - EnCicla, lancha en el embalse, robo de carros, talleres que reparan y repintan, y escondites;
  - Calle libre con contratos;
  - finales A, B y C según las pruebas y las decisiones;
  - lenguaje fuerte, con opción de suavizarlo.
  - El diseño está en `docs/TURNO-CERO.md`.
- **Pruebas:**
  - en Node, las secciones 19 (planeta) y 20 (búsqueda y GLB);
  - en Chromium, Turno Cero de Manhattan a Medellín por la Ruta del Atlántico;
  - un bot recorrió la historia completa hasta el final A en 161 s, sin errores.
- **Corregido en el camino:**
  - al cerrar un capítulo se saltaban capítulos (el último paso se completaba varias veces);
  - el Muelle 4 caía sobre el agua;
  - los subtítulos y el letrero de la carretera tapaban el joystick y las barras.
- **Lo último de Codex** (`b2fd2e4`: la escena 3D de acción y los actores con esqueleto) quedó unido e integrado:
  - **piel y animación glTF** en `MC.Modelos.posar`: huesos, matrices de enlace y clips con interpolación, en caché por cuadro;
  - Mara a pie y los guardias se animan en la cámara 3D, y Rook, Nadia, Noah y los intermediarios esperan en sus escenas;
  - su misión 3D autónoma se copia a `dist/juegos/` (`"extras"` en `juego.json`) y se abre desde la portada.
- **Pendiente:** medir en un celular real con GPU. Los nuevos pedidos para Gemini, Codex y ChatGPT están en `TAREAS-IA.md` § 4.0.


### 20-nov-2026 · C-M27 (parcial), dirección visual y catalogación
- Sombras solares proyectadas sobre el suelo en WebGL1 (sin texturas de profundidad), mezcladas antes que los volúmenes, con cache por celda de cámara y posición solar; prueba sintética en `pruebas/prueba.mjs`.
- G-H1: 14 capturas reales auditadas, avisos duplicados corregidos, HUD atenuado más legible, nombres protegidos frente a los botones y cierre real de diálogos por el capturador.
- G-H18: `contenido/nueva-york-lugares.json` generado desde NYC CommonPlace con 50 lugares, coordenadas e IDs; excluye instalaciones municipales internas y marca accesibilidad pendiente de comprobar.
- La tabla de estado vigente, con límites y prioridades, está en `docs/ESTADO-3.1.0.md`.
- **C-M27 requiere CI del nuevo commit y prueba en GPU física**; no se afirma rendimiento móvil ni tilt-shift terminado.


### 20-nov-2026 · 3.1.0 · Persecución optativa en Mandados
- C-M26: clase pública `MC.Persecucion` con patrullas y pilotos que recomputan rutas A* por calles, un seguidor y otro que busca cortar el paso. Motor físico de `MC.Cuerpo`, sin atravesar edificios por «IA» de línea recta.
- Reto voluntario de 90 segundos con botón para iniciar/salir; disponible en moto o carro, con huellas de vehículo en el mismo mundo 3D/2D, cámara de seguimiento sin saltos y captura si el jugador se detiene.
- Los casi choques con tráfico no dan puntos en contacto ni a baja velocidad; bonus de turbo de duración corta y máximo una recompensa por ID de vehículo.
- Comprobaciones deterministas de aparición fuera del jugador, física, bonos y cierre en `pruebas/prueba.mjs`. **Validado** en el commit `ff5977ec4`: CI [#44758766581](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44758766581), con 131 tests Node y 141 en Chromium, incluido E2E de persecución. La evaluación en celular real sigue pendiente.


### 20-nov-2026 · 3.0.1 · Objetos de barrio y persistencia (ChatGPT)
- C-M29 / G-H17 (entrega parcial): 30 tipos de mobiliario urbano en `js/32-objetos.js` y tamaños **aproximados para diseño** en `contenido/objetos-gemini.json`.
- IDs estables por origen de los objetos: restauración de desplazamientos, velocidad, orientación y daño con `MC.GuardadoSectores`.
- Mandados guarda cambios de Guatapé periódicamente y al ocultar/cerrar la pestaña; los mundos aleatorios no heredan esos datos.
- Regresiones agregadas a `pruebas/prueba.mjs`. Comprobación aislada del código realizada; **batería Node/Chromium pendiente** en clon completo.
- Falta arte individualizado de cada objeto y medición con hardware móvil.


### 20‑nov‑2026 · 3.0.0 · Los tres juegos actualizados y Nueva York preparado (Claude Code)
- **EnCicla** (`src/js/97-motor30.js`):
  - la calidad automática del 3.0;
  - artilugios físicos a escala de sprite: conos de obra en las ciclorrutas y balones en las plazas, con su prueba.
- **El Metro** (`src/js/69-tutorial.js`): tutorial opcional «❓ Cómo se juega», que nunca sale solo y se puede saltar o apagar.
- **Run Scooter:** el tutorial ya no se impone en la primera partida; se pide en Ajustes.
- **Lo que sigue:** `docs/PROXIMO-NUEVA-YORK.md`, con «Getaway Nueva York» (Manhattan, el mundo de alrededor, el planeta redondo y la persecución) y las 10 reglas del feedback para todas las IA. Pedidos G‑H18, G‑H19, C‑A15, C‑M30 y C‑M31.

### 20‑nov‑2026 · 3.0.0 · Un solo mundo 3D y varias cámaras (Claude Code)
**Pedido:** el autor probó y lo sintió básico:
- las dimensiones mal ideadas;
- cosas en 2D que debían ser 3D;
- vistas como menús separados;
- casas sin fachada;
- cámara muy aérea y sin tope;
- todo el mundo cargado a la vez.

Pidió investigar #DRIVE, Pako Forever, Getaway, Reckless Getaway 2 y la distancia de GTA San Andreas. La investigación está en `docs/INVESTIGACION-CAMARA.md`.

**Lo que se hizo:**
1. **Mundo único 3D** (`js/45-gl3d.js`):
   - edificios con fachada: zócalo, ventanas con marco y vidrio encendidas de noche, puerta, balcones, cornisa, alero, pretil y tanque;
   - árboles low-poly que son los MISMOS de las vistas 2D (`MC.Arboleda`);
   - carros, busetas, motos y personas con detalle;
   - el suelo en 3D ya no trae árboles ni techos pintados.
2. **Cámaras aéreas sobre ese mundo** (`MC.Camara` perfiles `cenital`, `oblicua` y `maqueta`):
   - el mismo encuadre que la 2D;
   - más oblicua de cerca;
   - mirada adelante;
   - `persecucion` (se aleja, se inclina y se mece) y trauma.
   Sin GPU caen a su respaldo 2D.
3. **Periferia definida:** radio de carga y niebla según la cámara. Lo que se carga no se ve llegar.
4. **Topes de zoom, cámara continua y mapa grande:**
   - el zoom va de 2,6 a 22 px por metro;
   - al tope de cerca pasa a la vista detrás del jugador;
   - para ver todo, el mapa al tocar el minimapa.
5. **Rayos X del jugador** en las cámaras aéreas.
6. **Artilugios físicos** (`js/32-objetos.js`, `MC.Objetos`): conos, balones, canecas, cajas y vallas, con su prueba.
7. **Jerarquía:** una cámara de juego y la de detrás del jugador. Lo demás va en «Más vistas y filtros».

**Fluidez** (2.11, incluida aquí):
- `MC.DensidadLienzo`;
- la capa de suelo de la 2D;
- `Estilo.imprimir` medido en cada aparato.

Las vistas quedan entre 16,6 y 18 ms de mediana en un celular simulado sin GPU.

**Pruebas:** 137 en verde. Hay pruebas nuevas de la densidad dinámica y de los objetos físicos.

### 20‑nov‑2026 · 2.10.0 · Todo unido, más liviano y con las skills de los videos (Claude Code)
**Pedido:** «retoma y continúa, revisa los repositorios ya actualizados, une todo, mejora todo y optimiza todo, y añade nuevas peticiones para Gemini y ChatGPT». Llegaron 11 enlaces, y después «añade las skills y plugins de los videos y sigue desarrollando».

**Unir:**
- El Metro recibió el Motor del Valle 1.2.0 desde EnCicla. Su rama `plan-unico-el-metro` ya estaba dentro de la v2.0.0, así que no se fusionó.
- EnCicla recibió de `revolucion-v2` el alto contraste y el metro sin casas debajo (`src/js/96-accesible.js`).

**Optimizar:**
- `Estilo.imprimir` ya no lee la pantalla: usa `grayscale`, un patrón de umbrales al 50 % y `contrast(1000)`, con el respaldo por píxel a media resolución.
- Los atlas sin pérdida pasaron a WebP con calidad 88 y alfa sin pérdida. Mandados bajó de 8,2 a 5,1 MB.

**Mejorar:**
- El tramado del 1 bit y del cómic se ancla al desplazamiento del mundo con celdas de 1 px. Así se acaba el muaré de la maqueta.
- `Red.caminoEntre` (A* con varias salidas y metas) y `rutaA` corregido.
- `legacy-scan` de Modern Web Guidance: `toSorted`, `toReversed`, `replaceChildren` y `Promise.withResolvers`, con respaldo en `00-nucleo.js`.

**Skills:**
- `skills-externas.json` (Hallmark, Modern Web Guidance, find-skills y HyperFrames), con el commit revisado y la licencia de cada una.
- `node motor.mjs skills [--instalar --agente …]` y `.claude/settings.json` con los plugins.
- La skill `motor-city-skills-externas` y la política de navegadores.

**Desarrollar:** `MC.Publico` (`js/92-publico.js`) y `node motor.mjs publico`. Hay 4 perfiles con puntería, reacción, fuerza y paciencia propias, que siguen las calles con `rutaA`; el informe sale en `dist/publico.md`. Primer resultado:
- el abuelo, la gamer y el turista: «bien»;
- la niña: «revisar», atascada el 43 %. De ahí sale el encargo C‑M24.

**Lo que sigue:** G‑H10 a G‑H13, C‑M23 a C‑M25 y C‑A12 (`TAREAS-IA.md`).

### 20 de noviembre de 2026 · 2.9.1 · Persistencia por sectores

Se añadió `MC.GuardadoSectores`, con claves estables, cambios JSON por sector, transición entre sectores activos y dormidos, guardado atómico y migradores versionados. Las pruebas verifican retorno, migración y fallo de almacenamiento. La integración de esos cambios con los objetos y huellas de Mandados sigue pendiente.

La auditoría de los enlaces nuevos y las tareas abiertas está en `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`.


### 20‑nov‑2026 · 2.9.0 · Unión de la 2.8 (Claude) con la 2.7.1 (ChatGPT/Codex) (Claude Code)
Codex entregó la 2.7.1 en paralelo con la 2.8:
- 6 atlas de ChatGPT, con 676 cuadros;
- el agua precalculada en los MC4;
- el gancho `textura` y los charcos;
- el estilo de 1 bit con ruido azul;
- la caché de fachadas en la maqueta;
- los adaptadores de Godot y three.js probados;
- la auditoría C‑M1, con sus arreglos.

Se unió todo en la rama sin perder nada:
- las huellas y las palomas de la 2.8 conviven con los charcos de Codex;
- los faros y las luces de freno funcionan también con el vehículo de la piel de ChatGPT (`vehiculoArriba`);
- la cubierta sobre columnas y las ventanas de las casas de un piso pasan por la caché de fachadas;
- el hitstop se combina con la lluvia en el bucle de Mandados.

Son 12 estilos. Versión 2.9.0.

### 20‑nov‑2026 · 2.8.0 · La entrega maestra de referencias, al motor (Claude Code)
**Pedido:** el autor trajo `MOTOR-CITY-ENTREGA-MAESTRA.md` («prepara todo»). Reúne los 14 reels, los videos y el análisis de ChatGPT y de Gemini:
- 25 fichas;
- el peso y la vida;
- la arquitectura portable;
- el rendimiento en móvil y las fases.

**Lo que se hizo:**
1. La entrega quedó en `docs/referencias/` y como anexo del documento único. Su resumen, ficha por ficha y con lo que ya está en el motor, está en `docs/INSPIRACION-VISUAL.md` §1.
2. **Vida (R12, R19):**
   - palomas que comen en plazas, andenes y parques, y alzan vuelo cuando el jugador se acerca rápido (evento `fauna`);
   - huellas de llantas y pisadas en arena, tierra, nieve y barro (con lluvia, también en el pasto), que duran 4 minutos.
3. **Peso y luz (R13, R19):** faros de noche y luces de freno del jugador. El hitstop también corre en el bucle de Mandados.
4. **Filtros (R17, R22):** los estilos vintage, CRT y visión térmica, para 11 en total.
5. **Accesibilidad (§10.3, §13):** `MC.opciones.sacudida` y `particulas`, en Ajustes.
6. **Medir (§13, §14, R20):** `MC.Telemetria` con fps y tiempos de cuadro en p50, p95 y p99; en Ajustes → Telemetría, con la física del jugador. También calidad automática, baja, media o alta.
7. **Contratos (§12.3, §16):** `schemas/` (escena, puente y entidad, `schema_version: 1`) y `MC.Contratos.validar`. La tabla de los contratos mínimos de la entrega y dónde están en Motor City está en `docs/MOTORES-POTENTES.md`.
8. **Repartido en `TAREAS-IA.md`:**
   - Codex: C‑M20 (API de construcción por código y pincel de mundo), C‑M21 (suspensión, balanceo, cosas que se rompen, IK, tablero y taller con rayos X) y C‑M22 (guardado versionado y sectores);
   - ChatGPT: C‑A10 (tipografía propia) y C‑A11 (interfaz de libreta);
   - Gemini: G‑H7 (verificar las 13 URL y las 7 fichas que solo describe su informe) y G‑H9 (medición en un celular real con la telemetría).

9. **Llegó la entrega de Gemini (G‑H1…G‑H8)** y se unió a la rama. De sus capturas se corrigió:
   - la zona libre deja margen para la columna de botones (80 %): en su máquina, la prueba fallaba por 4 px;
   - `ui.aviso(texto, ms, clave)`: el aviso de la vista reemplaza al anterior y nunca queda desfasado;
   - ventanas encendidas en las casas de un piso;
   - las cubiertas sin muros se dibujan sobre columnas;
   - cebras sin cruzarse en «#»;
   - en Mi casa, el botón «Comprar» completo, la burbuja dentro de la casa y el rótulo de los cuartos pequeños;
   - la sombra horneada de las copas, más pequeña.

   También se sacaron las paletas de las obras colombianas de su lista. Wikimedia limita las descargas, así que algunas quedaron para después.
10. **Rendimiento:** las huellas se dibujan en lote (16 trazos en vez de cientos). En esta máquina nueva, la cenital de Medellín mide 14–16 ms tanto en la 2.7 como en la 2.8: no es una regresión, es el contenedor.

**Probado:** 125 pruebas:
- huellas y palomas;
- partículas apagadas por accesibilidad;
- telemetría en percentiles;
- la escena, el puente y la entidad pasan su esquema y uno roto no;
- los 11 estilos en Mandados.

Además se hizo una revisión visual de noche (faros), de las palomas y de los filtros nuevos.

### 20 de noviembre de 2026 · 2.7.1 · Arte a escala y adaptadores

Mandados incorpora seis atlas de ChatGPT con 676 cuadros. Los 997 cuadros del paquete de Gemini pasan el revisor tras reparar los recortes y márgenes. Guatapé y Medellín cargan su hidrografía desde MC4. Godot 4 y three.js abrieron escenas del motor.

El banco integrado pasó 130 pruebas. La maqueta midió 34,9 ms con CPU 4×, por encima de la meta de 20 ms. El informe enlaza las pruebas de los tres juegos, las capturas y los pendientes. [Entrega del motor compartido](ENTREGA-CHATGPT-MOTOR-CITY-2.6.md)


### 20‑nov‑2026 · 2.7.0 · Estilos gráficos, peso y vida, y motores potentes (Claude Code)
**Pedido:**
- 14 reels de referencia;
- «Necesito peso y vida en el motor, y que se pueda adaptar a motores más potentes.»
- «Estéticas de cómic, manga, anime y novelas gráficas.»
- «Investiga y aprende de las mejores obras visuales e inspírate en ellas. Recopila y adapta arte de verdad.»

**Lo que se hizo:**
1. **Reels:** se leyeron 4 de 14 sin iniciar sesión:
   - un RPG inspirado en Dragon Ball;
   - *Cairn*;
   - un *rover* en la web;
   - carreras cinematográficas tipo Dakar.

   Los otros 10 quedan para Gemini (G‑H7).
2. **`MC.Estilo`** (`js/16-estilos.js`): 8 estilos hechos de datos (mapa de color, tinta, trama, sombra, árboles, cielo y pase final):
   - realista y clásico;
   - **cómic**: tinta, semitono y onomatopeyas;
   - **manga**: grises, tramado y líneas de velocidad;
   - **anime**: *cel* en 6 bandas, línea fina, sombras azul violeta y cielo de Shinkai;
   - **novela gráfica**: tres tonos de papel y tinta, sombras negras, árboles en silueta y el rojo como acento;
   - **ukiyo-e**: paleta de Hokusai;
   - **acuarela**: papel y pigmento en el borde.

   Las losas, los muros, los techos, las sombras, el cielo y los árboles pasan por el estilo. En Mandados: 🗺️ Vista → 🖌️ Estilo.
3. **Arte de verdad:** paletas de 10 obras de dominio público bajadas de Wikimedia Commons (Hokusai, Hiroshige, Van Gogh, Monet, McCay, Mucha, Doré, la Comisión Corográfica y Winslow Homer), en `arte/dominio-publico/`. En el repositorio solo quedan los colores, con fuente y licencia.
4. **`MC.Vida`** (`js/88-vida.js`):
   - al aterrizar, el cuerpo se aplasta, la cámara se sacude según la caída y salta polvo;
   - el vehículo cabecea al acelerar y al frenar;
   - en los choques hay **hitstop** (60 ms; `MC.Bucle`);
   - bandadas de garzas y palomas con su sombra, que aletean a dos cuadros;
   - hojas que caen y salpicaduras;
   - el viento mece las copas de cerca;
   - onomatopeyas en los estilos dibujados.
5. **`MC.Exportar` y `MC.Puente`** (`js/89-exportar.js`) y `node motor.mjs exportar`: el mundo sale en **glTF 2.0** (terreno, edificios, vías y árboles, con colores por vértice), con alturas RAW 16 y escena JSON. El GLB de Guatapé:
   - pasa el **validador de Khronos con 0 errores y 0 avisos**;
   - three.js lo dibuja tal cual.
6. **Investigación:** `docs/INSPIRACION-VISUAL.md` (Spider‑Verse, Arcane, Shinkai, Ghibli, *Sin City*, Moebius y *ligne claire*, *Obra Dinn*, Vlambeer, Disney y ukiyo-e, con fuentes) y `docs/MOTORES-POTENTES.md` (Godot, Unity, Unreal, Blender y three.js).
7. **Tareas nuevas** en `TAREAS-IA.md`:
   - Gemini: G‑H7 (describir los reels) y G‑H8 (40 obras de dominio público, también colombianas);
   - ChatGPT: C‑A8 (láminas guía de los estilos) y C‑A9 (personaje en *cel*);
   - Codex: C‑M18 (Godot, Unity, Unreal y una vista three.js o WebGPU) y C‑M19 (1 bit con trama estable).

**Probado** (123 pruebas):
- estilos (manga en grises, novela con acento, ukiyo-e con la paleta de Hokusai);
- vida (aterrizaje, partículas y bandadas);
- un GLB bien formado;
- los 8 estilos en Mandados, sin errores.

La maqueta de Medellín, con la CPU 4× más lenta, mide 31 ms.

### 20‑nov‑2026 · 2.6.0 · Estilo realista familiar, árboles de pie y tareas de cada IA (Claude Code)
**Pedido:**
- «Haz una revolución para que los gráficos sean más realistas: desde la vista cenital los árboles se ven como tapetes en el suelo.»
- «Deja el estilo *family friendly*, pero dale más realismo, rudeza y crudeza.»
- «Los tutoriales deben ser opcionales.»
- «Copia todos tus pedidos en los repositorios para que cada uno continúe.»
- «Gemini con Antigravity pasa a *hydrogen*: déjale las tareas fáciles. ChatGPT con Codex sigue con *astra*: encárgale mejores pedidos; GPT genera mejores imágenes.»

**Lo que pasaba:** los árboles eran discos pintados en el piso de las losas. Desde una vista inclinada, el piso se aplasta y los discos quedaban como elipses acostadas: «tapetes».

**Lo que se hizo:**
1. **`MC.Arboleda`** (`js/29-arboleda.js`):
   - los mismos árboles (y los mismos con que se choca) se levantan en la maqueta, la oblicua y la lateral: tronco que se afina, ramas, copa de lóbulos con luz de arriba a la izquierda, hojas, y flores en los guayacanes;
   - desde arriba, la copa tiene volumen;
   - 6 especies (guayacán amarillo y rosado, ceiba con raíces tablares, mango, urapán y monte), 3 variantes cada una;
   - sprites horneados una vez, con versiones reducidas y copia nocturna;
   - sombra según el sol de cerca, y la sombra bajo la copa horneada en el piso.
2. **`MC.Rudeza`**, horneada en las losas (no cuesta por cuadro):
   - asfalto con parches, grietas, manchas de aceite y alcantarillas;
   - centro de carril más gastado;
   - andén de baldosa con bordillo;
   - pasto con parches secos y verdes;
   - tejas de barro en hileras y planchas con humedad;
   - grano;
   - paleta 30 % menos saturada.

   Además, los muros tienen la base sucia y sombra bajo el alero.
3. **`MC.estilo`** (`'realista'` por defecto o `'clasico'`) y el selector 🖌️ en Vista.
4. **Tutorial opcional:** ya no se abre solo; está en la portada («❓ Cómo se juega (opcional)») y en ⚙️ Ajustes.
5. **Tareas de cada IA:**
   - **`TAREAS-IA.md`** en los cuatro repositorios;
   - Gemini («hydrogen»): G‑H1…G‑H6, tareas fáciles;
   - ChatGPT («astra»): arte C‑A1…C‑A7 y código C‑M13, C‑M16, C‑M17…;
   - `node motor.mjs capturas` y `revisar-arte` para que las tareas fáciles sean comprobables;
   - el gancho `arbol` para el arte de ChatGPT.
6. **Rendimiento:** la maqueta de Medellín con la CPU 4× más lenta mide 30–38 ms (el límite es 40). Los árboles de pie se ralean parejo si son muchos, y con calidad media salen desde un poco más cerca.

**Probado:** 119 pruebas:
- los árboles que se ven son los que chocan;
- Mandados en un celular táctil: tutorial opcional, árboles de pie y arte cargado;
- la CPU 4× más lenta.

Capturas de día, tarde y noche en la maqueta, la cenital y la lateral.

### 19‑nov‑2026 · 2.5.1 · Mandados jugable de verdad (Claude Code)
**Pedido:** «Traté de probar el minijuego pero es injugable. No hay controles de verdad, no se puede mover nada. No está completamente liberado porque hay que pagar cosas. Mejóralo con lo nuevo. ¿Ya están todos los pedidos en el repositorio?»

**Lo que pasaba:**
- El personaje sí se movía, pero la cámara estaba tan lejos que en un celular medía unos 3 píxeles.
- El joystick era invisible.
- Por eso parecía que nada respondía.
- Además, casi todo costaba plata.

**Lo que se hizo:**
1. **Cámara cerca:** unos 45 m en el lado corto de la pantalla, en celular y en computador. El jugador tiene un **anillo verde con flecha**.
2. **Joystick visible** abajo a la izquierda (`ui.joystick`), con la guía «Arrastra para moverte» (en computador: «Flechas o WASD»).
3. **Botones de acción** redondos abajo a la derecha (`ui.accion`): ⤒ saltar y ⚡ turbo; 🔽 bajar y 🔼 subir aparecen en el agua o en el aire.
4. **Flecha al objetivo** con la distancia (`MC.UI.indicador`), siempre dentro de la zona libre, sin tapar la interfaz.
5. **Modo libre**, prendido por defecto: los 34 vehículos, la lancha, la gasolina, la casa, los lugares y el modo alcalde son gratis. Se apaga en ⚙️ Ajustes.
6. **Tutorial** «Cómo se juega» al empezar, y otra vez desde Ajustes. Los menús quedaron en **Vista** (vistas, pixel y zoom) y **Ajustes** (modo libre, controles y rescate).
7. **El primer mandado empieza cerca**, y la distancia crece con cada entrega.
8. La interfaz:
   - las barras pasaron arriba y la velocidad, abajo al centro;
   - la tarjeta del mandado lleva el título en una línea y, primero, la distancia y el tiempo.
9. **`docs/PEDIDOS.md`:** cada pedido del autor, su estado y dónde quedó. Hay 55 hechos, 2 que dependen de afuera y 3 pendientes con dueño.

10. **Llegó la entrega de Gemini** (`ENTREGA-GEMINI-MOTOR-CITY-2.5.md`, G‑M0…G‑M15) y quedó integrada:
    - el arte, extraído a `arte/gemini/`: 10 atlas WebP, manifiesto, 53 íconos, 30 hitos y paletas;
    - `MC.Pieles` lo instala como piel con respaldo procedural en cada gancho, a la medida del motor y con una copia nocturna;
    - en Mandados se usan los árboles del trópico, los props, las rocas, las fachadas y los muebles, con el selector 🎨 Arte en Vista;
    - el personaje, los vehículos y los animales siguen procedurales, porque los de Gemini no vienen a escala;
    - la revisión está en `arte/gemini/LEEME.md`.
11. **De la auditoría de Gemini** se corrigió:
    - la leyenda de las capas de datos (`ui.leyenda`);
    - las etiquetas de los cuartos, ahora en la esquina;
    - las ventanas de noche en las casas bajas;
    - la maqueta, sin el corte de tierra de la vista lateral;
    - las barras, con fondo.

    También apareció un `//` que desde la 2.2 anulaba `mision.hidden` y el `aria-live` del aviso.
12. **De la auditoría de Codex** (`docs/AUDITORIA-MOTOR-CITY-2026-11-19.md`): las pruebas usan el Chromium del sistema si Playwright no trae el suyo, o el que diga `MC_CHROMIUM`. Quedan anotados, con su dueño:
    - la maqueta, que midió 44,7 ms en su máquina y aquí 27–29 ms;
    - el test de WebRTC de EnCicla.

**Probado** (118 pruebas). La nueva, en un celular táctil emulado (412 × 860), comprueba:
- aparece el tutorial;
- todo es libre y gratis, con 34 vehículos;
- el joystick se ve;
- arrastrarlo mueve al personaje unos 4 m en 2 s;
- la cámara da 9 px por metro;
- el primer mandado está a menos de 900 m;
- el arte de Gemini carga (10 atlas, de día y de noche) sin sprites faltantes.

En computador, las flechas y WASD mueven y giran.

**Falta:** probarlo en un celular real.

### 19‑nov‑2026 · 2.5.0 · Entrar al agua (Claude Code)
**Pedido:** «Añade la capacidad de poder entrar en el agua».

**Lo que pasaba:** en la 2.4 solo se entraba a pie. Mandados empieza en bici, así que el juego frenaba en la orilla.

**Lo que se hizo:**
1. **Bajarse en la orilla:** con un vehículo, al empujar 0,6 s hacia el agua honda (o con «🏊 Al agua»), uno se baja, el vehículo queda **parqueado en la orilla** y se entra al agua. Al volver: «Subirse».
2. **Nadar y bucear:** «🤿 Bucear» (Z o Ctrl) baja hasta medio metro del fondo; «⬆️ Subir» (espacio) sube; quieto, se flota hacia arriba.
3. **El aire:** dura ~35 s bajo el agua y se recupera arriba. Sin aire, la persona sube sola y no vuelve a bajar hasta tomar algo de aire.
4. **Poses** de crol y de buceo, el agua tapando el cuerpo, burbujas y la pantalla azul con rayos de luz bajo el agua.
5. **Lancha:** se alquila en el garaje si hay agua honda a menos de 30 m. Con «⚓ A tierra» uno se baja a la tierra firme más cercana y la lancha queda amarrada.
6. **Ocurrencias:** ya no «arregla» al que bucea como si estuviera bajo el piso.

**Probado** (117 pruebas):
- la bici se queda en la orilla de Guatapé y se entra nadando;
- se bucea con aire limitado y, sin aire, se sube aunque se siga oprimiendo «bajar»;
- se sale del agua y se vuelve a la bici;
- la lancha navega, desembarca y queda amarrada;
- en Mandados, el botón «Al agua» aparece en la orilla y funciona.

### 19‑nov‑2026 · 2.4.0 · Montañas, rocas, agua y límites de paso (Claude Code)
**Pedido del autor:** un sistema de montañas, rocas y tipos de terreno; agua en lagos, ríos, playa y mar; y límites de movimiento que no rompan la verosimilitud («el personaje pasa por encima de cosas que no debería»).

**Lo que se encontró** (por qué se atravesaban cosas):
1. Sobre las casillas de calle no se revisaban los edificios.
2. Los edificios de los sitios y los emblemáticos no chocaban.
3. Los árboles de las losas solo eran dibujo.
4. Postes y bancas no chocaban.
5. El agua era «sí o no», sin profundidad.
6. La pendiente frenaba, pero nunca bloqueaba.

**Lo que se hizo:**
1. **`MC.Terreno`:**
   - análisis del agua: componentes, tipo (mar, lago, río, quebrada) y distancia a la orilla, con la profundidad que sale de ahí;
   - reglas de paso por clase con su motivo: a pie se vadea y luego se nada; bici, moto, carro y camión tienen un límite de agua; la lancha necesita calado;
   - pendiente máxima fuera de las vías (subir y bajar barrancos);
   - roca, monte, arena y nieve según el vehículo;
   - borde del mundo;
   - obstáculos: edificios también sobre la calle si uno se mete más de 1 m, sitios y emblemáticos, los mismos árboles que pintan las losas, mobiliario, naturaleza, y tráfico y gente si el juego los pasa.
2. **`MC.Naturaleza`:** rocas (las grandes chocan), palmas, frailejones en el páramo, arbustos y juncos.
3. **Generador:**
   - lagos por llenado de prioridad (Barnes, 2014), solo los grandes y hondos, de superficie plana y con desagüe;
   - el mar a nivel 0;
   - los pueblos no se construyen sobre los lagos;
   - los charquitos sueltos se limpian.
4. **Dibujo:**
   - el agua toma color por tipo y profundidad, con espuma en la orilla;
   - la roca asoma en las laderas de más de 65 %;
   - brillos que se mueven sobre el agua;
   - vadear y nadar se ven, en lateral y en cenital.
5. **Mandados:** el agua se mide al cargar; dice por qué no se pasa (🌊, ⛰️, 🌳, 🪨) y avisa al nadar; nadar cansa; el tráfico y la gente estorban.

**Probado** (115 pruebas):
- el embalse de Guatapé es lago, de 0,3 m en la orilla y 16,6 m adentro;
- Medellín tiene su río;
- caminando hacia el embalse se termina nadando;
- la bici no entra a lo hondo y la lancha no anda en lo pando;
- el carro no sube una ladera de 68 % fuera de la vía;
- no se atraviesan los emblemáticos, los postes ni los árboles;
- los lagos generados son planos, el mar está a 0 m y nada de naturaleza cae sobre las vías.

### 19‑nov‑2026 · 2.3.0 · La ciudad como SimCity, Los Sims, Cities: Skylines y Townscaper (Claude Code)
**Pedido del autor:**
- estudiar esos juegos y sus motores: cómo crean entornos, ambientes, sombras y detalles de una ciudad;
- añadirlo al motor, porque es crucial para cómo se crea;
- entregar **un solo documento** con todo (contexto, código a usar y plan de cada IA), el minijuego, el HTML y el link.

**Lo que se hizo:**
1. **Sombras del sol** por hora en las vistas 2D y en el raster: casco convexo en caché, recorte de techos en cenital y oclusión de contacto en las losas. Probado: a las 12 h la sombra mide 0,13 m por metro de altura; a las 16:30, 2,4 m y hacia el oriente; de noche, nada.
2. **Mobiliario urbano** por vía, con azar fijo: cerca del Coltejer, 269 postes, 206 árboles, 30 cebras, 45 bancas y 11 paraderos, ninguno dentro de un edificio. **Luces de noche** en charcos cálidos.
3. **Fachadas por reglas** (WFC) en ciudad 3D, maqueta y lateral: locales, vitrinas y puerta abajo, balcones alineados y muros ciegos.
4. **`MC.Urbe`:**
   - campos de 40 m (valor, ruido, contaminación, verde, servicios y transporte);
   - zonas de 8 m junto a las calles;
   - demanda RCI que responde a lo que se construye;
   - lotes que crecen mirando a la calle y suben de nivel;
   - energía y agua con capacidad (GlassBox);
   - predial y mantenimiento en el libro;
   - capas de datos encima de las vistas.

   Un parque sube el valor de 45 a 60.
5. **Los Sims:** objetos que anuncian necesidades, `MC.Habitante` (con hambre va a la nevera o a la estufa) y ambiente de la casa (decorar lo sube). Ninguna casa queda sin cocina ni cama.
6. **Townscaper:** WFC, autotile (4, 8 y esquinas) y rejilla irregular relajada.
7. **Paisaje sonoro:** tráfico, pájaros, grillos, lluvia, truenos, viento, agua y gente.
8. **Mandados:** 🏙️ modo alcalde (capas, zonas, parque, colegio, planta solar y resumen), casa con alguien que vive en ella y menú de sonido.
9. **Ganchos de arte** `prop`, `fachadaModulo` y `mueble`.
10. **Documentos:** `docs/DOCUMENTO-UNICO.md` y `node motor.mjs documento` (→ `dist/MOTOR-CITY-TODO.md`). `PLAN-IAS` y `PETICION-*` ahora apuntan ahí.

**Cifras** (CPU 4× más lenta, con sombras y mobiliario):

| Vista | ms |
|---|---|
| Cenital | 8–10 |
| Ciudad 3D | ~15 |
| Maqueta | ~27 |
| Lateral | 14–20 |

La calidad automática baja el detalle si hace falta. Bajar la maqueta a menos de 20 ms es el encargo C‑M13. 109 pruebas en verde.

### 19‑nov‑2026 · 2.2.0 · GPU virtual, mi casa, lugares, historias y vista lateral (Claude Code)
**Pedido del autor:**
- una solución a la tarjeta gráfica;
- mejor física en puentes y cámara;
- ver las vistas centrales de lado, estudiando FEZ, Little Nightmares y Monument Valley;
- sprites;
- interfaz con psicología, que no estorbe;
- estudiar los mejores motores;
- historia con diversión, reflexión y conciencia;
- ocurrencias;
- manual, optimización y tipos de controles;
- la casa del jugador por su dirección, con interiores únicos y diseñables;
- talleres, tiendas y más lugares;
- historias procedurales, No Man's Sky y tamaños proporcionales.

**Lo que se hizo** (todo con pruebas; 103 en verde, también en Chromium):
1. **GPU virtual** (`05-gpu`, `44-raster`):
   - perfil del aparato;
   - resolución dinámica PI y bucle de paso fijo;
   - **3D por software en Canvas 2D**: 15–25 ms, contra 70–90 ms del WebGL por software.
2. **Física de niveles por superficies:** se sube por la rampa y se pasa por debajo, probado en 5 puentes reales. Tiempo de coyote y memoria del salto.
3. **Cámara** con resortes críticamente amortiguados, brazo con choque (edificios, cerros y tableros), FOV por velocidad, trauma y giros animados.
4. **Vista lateral:** casa de muñecas, giro de a 90° (FEZ) y rayos X. La ciudad 3D también se inclina hasta quedar de lado.
5. **Manejo** (curvas, giro según la velocidad, asistencias y 7 esquemas), **sprites**, **escala real** (los 35 vehículos validados) e **interfaz** por zonas: columna arriba, atenuación, cola de avisos, foco y cine. `MC.UI.verificar` prueba que nada tape el centro.
6. **Interiores** con 8 estilos, cuartos opcionales, decoración, catálogo de 22 muebles y lugares nuevos (taller, tienda, centro comercial, biblioteca y restaurante).
7. **Mi casa** (`49-hogar`):
   - lee la nomenclatura colombiana y la ubica en las calles reales, sin internet;
   - acierta «Calle 50 # 52‑20» en La Candelaria y elige el municipio correcto si se dice;
   - el jugador diseña su casa y la compra cuadra en el libro.
8. **Lugares jugables y desgaste** (`82-lugares`): 195 lugares en Guatapé, con talleres que reparan y mejoran, tiendas con energía y bibliotecas con datos reales.
9. **Historias** (`85-historias`): storylets en tres pilares, director de ritmo, encargos procedurales y **ocurrencias** con corrección y reporte sin datos personales.
10. **Cosmos** (`13-cosmos`): estrellas con abundancias reales, planetas con Kepler, gravedad, temperatura y atmósfera, mundo jugable, criaturas verosímiles y relieve infinito.
11. **Mandados** con todo lo anterior.
12. **Documentos:** `docs/MANUAL.md`, `INVESTIGACION.md`, `OPTIMIZACION.md`, `PLAN-IAS.md` y las peticiones 2.2 a Gemini y ChatGPT.
13. **Web:** portada `index.html` + `.nojekyll` en `main`, porque Pages sirve `main`. La 2.0 se fusionó a `main` con el PR #1 del autor.

**Falta:** las entregas de Gemini y ChatGPT, medir en un celular real, la migración de cada juego a `motor-city/` (sus IAs) y la 2.3 (ver `docs/PLAN-IAS.md`).

### 19‑nov‑2026 · 2.1.0 · Motor City crece (Claude Code)
- Nombre: solo «Motor City»; los juegos lo reciben en `motor-city/`.
- Ciencia, economía, generador de mundos, territorios (`geo/territorio.py` con Guatapé), clima global, seres, taller, IA y población, interiores, música, interfaz y mecánicas.
- Minijuego Mandados; plantillas, `nuevo`, `reporte`, skills `motor-city-*` y `CONTRIBUIR.md`. 80 pruebas.

### 19‑nov‑2026 · 2.0.0 · nace Motor City (Claude Code)
**Pedido del autor:**
- Hacer un solo motor de mundo abierto según el *Plan del Mundo Abierto del Valle*, en el repo nuevo `motorcity`.
- Que quede listo para cualquier ciudad y para los juegos que vienen: *Motor City* (carreras) y *Extremo* (deportes extremos).

**Lo que se hizo:**
1. **Revisión:**
   - se clonaron y probaron los tres juegos en sus ramas más nuevas;
   - EnCicla v2.0.1: 97 ✓;
   - El Metro v2.0.0: 100 partidas, 0 errores;
   - Run Scooter v2.5.0: simulación de 100 partidas, bien;
   - se jugaron y capturaron sus vistas.

   **Hallazgos:**
   - Run Scooter es **WebGL propio**, no Canvas 2D como decía el plan.
   - El Metro ya integró su entrega (v2.0.0), pero su motor 1.2.0 sigue en la rama `motor-valle`.
2. **F1 · Mundo 2.0:**
   - `herramientas/fusionar.mjs` junta en `datos/medellin/mundo.mc4` (6 MB, 16 capas) los datos de EnCicla (10 m) y de El Metro (metros);
   - el cargador `js/10-mundo.js` trae todas las consultas.

   Cifras:
   - 639.457 huellas;
   - 2.193 pasos con nivel (el viaducto sale de los rieles reales);
   - 31 líneas;
   - 133 estaciones EnCicla;
   - 45 lugares y 30 hitos enlazados.
3. **Redes:** grafo de cruces sobre las vías reales (`js/11-red.js`): A\*, recorridos sin fin y la salida que continúa.
   - Ciclorrutas: 123 km.
   - Red conectada: 34.173 nodos.
4. **F5 · Reglas del mundo:**
   - reloj y festivos de Colombia;
   - cielo con el sol y la luna reales;
   - clima por temporadas, igual para todos;
   - transporte con horario real y determinista;
   - tráfico con semáforos reales;
   - huevos de pascua.
5. **F2 · Lo físico:**
   - personaje único con esqueleto de poses;
   - 35 vehículos (con los que vienen para Motor City y Extremo);
   - física con pendiente, choques, puentes por sus extremos, saltos, vuelo y agua;
   - controles de teclado, táctil y gamepad;
   - una cámara para todas las vistas.
6. **F3 · Vistas:**
   - cenital, ciudad 3D y maqueta 2:1 con una sola proyección y las losas en caché;
   - **panorámica de perfil**, que junta la de El Metro y la de EnCicla y suma la fila real de edificios, las siluetas de los emblemáticos, el viaducto con trenes reales, los cruces con nombre, el primer plano y el fondo suavizado;
   - WebGL (tercera y primera persona, dron y cine);
   - pixel en todas;
   - transición y calidad automática.
7. **F4 · Run en la ciclovía:**
   - se importa RunRunZero 5b2f85d casi idéntico, con 12 parches comprobados;
   - lomas y curvas reales;
   - esquinas en los cruces reales, que doblan el mundo;
   - cielo y lluvia del mundo;
   - se sale en el mismo punto.
8. **Banco de pruebas** `dist/motor-city.html` y **54 pruebas** (`node motor.mjs prueba --navegador`). Con la CPU 4× más lenta, la mediana del dibujo es:

   | Vista | Mediana |
   |---|---|
   | Cenital | 4,1 ms |
   | Ciudad 3D | 8,6 ms |
   | Maqueta 2:1 | 17,8 ms |
   | Panorámica | 7,3 ms |
9. **La tubería 1.x se mudó aquí:** `geo/`, `capas/`, `motor.mjs` y `js/valle.js` sin cambios. `build.py` y `fetch.py` ya leen la ventana de cualquier ciudad (`CIUDAD=ciudades/x.json`).
10. **Documentos:**
    - `MOTOR.md` (el contrato 2.0) y `CONTEXTO-IA.md`;
    - migración de EnCicla y de El Metro;
    - receta para otras ciudades y visión de los juegos que vienen;
    - peticiones de arte y auditoría para Gemini y ChatGPT.
11. **Juegos:**
    - se sincronizó el motor 2.0 en `motor-valle/` de EnCicla y de El Metro, sin cambiar su código ni sus datos;
    - en cada repo hay una nota `docs/CONTEXTO-MOTOR-CITY.md` y una entrada en su bitácora;
    - sus pruebas siguen en verde.

**Errores encontrados y corregidos en el camino:**
- La tabla de capas se pisaba con el `n` de los edificios.
- El inflador entraba en un bucle sin fin con datos truncados.
- Había una llave de más en `45-gl.js`.
- `[hidden]` no ocultaba la pantalla de carga.
- La conversión de grados a metros estaba mal.
- Faltaba un nulo en los cruces de la panorámica.
- Un color `rgba` daba negro.
- En el pixel, las etiquetas salían gigantes.

**Lo que sigue:** ver `CONTEXTO-IA.md` §5.

### C-M34 · 20-nov-2026 · Entrega candidata de ChatGPT (NO PUBLICADA EN MAIN)

Rama: ia/chatgpt/cm34-cache-20261120. Motor 4.0.3 base sin incremento de versión.
- MC.Sectores1km: precarga de sectores por cercanía al centro con presupuesto LRU estable, rechazo de coordenadas y configuración inválida.
- Test nuevo: pruebas/sectores-cm34.mjs (5/5 grupos Node locales); paso añadido a motor-city-qa.yml.
- Investigación aplicada a futuras versiones: Build, Quake/PVS, GTA III/LOD, Godot/HLOD; separación entre caché ED1 y streaming MC4 real.
- Informe técnico y evidencias: reportes/2026-11-20-chatgpt-cm34-sectores-y-motores.md.
- Pendiente: CI completa, mediciones GPU reales, streaming MC4 por chunks y revisión por Claude antes de integrar.

### C-M34 · Continuación · paquetes MC4 offline por capas (PR #9, candidato)

- API nueva compatible `MC.Mundo.desdePaquete` / `cargarPaquete`; decodificación de capas comprimidas a pedido.
- Builder opt-in `mundos_capas:true` particiona el contenedor MC4 existente por capas sin alterar el formato ni sus bytes, mantiene HTML único sin internet.
- Turno Cero usa el nuevo formato para Nueva York, Medellín y Guatapé; el cargador monolítico anterior sigue como respaldo.
- Nuevas pruebas Node de equivalencia byte a byte y Chromium de juego real (`pruebas/paquete-capas-*.mjs`), añadidas a CI.
- Guía `docs/MC4-CAPAS-OFFLINE.md`; informe `reportes/2026-11-20-chatgpt-cm34-sectores-y-motores.md`.
- **No se fusionó ni incrementó versión.** Mantener pendiente hasta CI, benchmark JS Heap/CPU y GPU física. Todavía NO son sectores geográficos de 1 km.
### C-M34 · ChatGPT · Motor City 4.1 · caché multicidad sin cargas duplicadas
Rama `ia/chatgpt/planeta-cache-410-20261121`, basada en `main` 4.1.0: single-flight asíncrono por ciudad, política LRU real, protección de mundo activo, `maxMundos` y métricas `diagnosticoCache()`. Turno Cero llama a `planeta.fijar(id)` al llegar. QA Node (7 casos) y Chromium offline integrado en GitHub Actions. Documentación: `docs/PLANETA-CACHE-CONCURRENCIA.md`, `reportes/2026-11-21-chatgpt-planeta-cache-410.md`. Estado: candidato para revisión, sin mezclar con PR #9 ni fusionar en main antes de pruebas.

### 21-nov-2026 · ChatGPT · C-M34 streaming territorial (PR #11, rama 4.2)

- El MC4 original se mantiene intacto, pero `suelo` y `nivel` se empaquetan por sectores de aproximadamente 1 km y se decodifican bajo demanda. `MC.RasterMC4` contiene LRU de 16 sectores por raster, bordes parciales, `u8/i8` y materialización compatible con `Mundo.capa`.
- `Mundo.desdePaquete/cargarPaquete` recibe proveedor opcional de sectores; el constructor y Turno Cero activan `mundos_rasters:true`; el HTML sigue offline y el resto de capas MC4 conserva sus bytes originales.
- Portada de la PR #10 a `main` 4.2: `Planeta` deduplica cargas, usa LRU, protege el mundo activo y `liberarExcepto` descarga mundo anterior e invalida rutas. Un contador de época impide resucitar cargas antiguas tras cambiar de ciudad.
- QA: `raster-sector-cm34.mjs`, `paquete-capas-cm34.mjs` (equivalencia byte a byte de Manhattan/Medellín/Guatapé), `planeta-cache-cm34.mjs` (9 casos), `getaway-contenido.mjs` actualizado a la nueva API, más Chromium offline. CI del último commit pendiente de confirmación; no mezclar runs anteriores.
- Guía: `docs/MC4-STREAMING-TERRITORIAL.md`; informe: `reportes/2026-11-21-chatgpt-cm34-streaming-territorial.md`; relevo en `coord/buzon/20261121-1015-chatgpt-cm34-spatial.md`.
- **Sin merge ni nueva versión.** ED1/vías/relieve no están fragmentados; falta medir memoria y FPS real.

**Sincronización:** los cambios de Motor City 4.3.0 de Claude/Gemini se incorporaron al historial de esta rama sin reemplazar su código. Validación del commit combinado pendiente de CI.

