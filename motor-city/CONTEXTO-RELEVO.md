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
| 18 | **Renacimiento cenital** (pedido del autor, 24‑nov: *master prompt*, investigación técnica y entrega de GPT‑6 en `docs/referencias/renacimiento-cenital-2026/`): saneamiento GIS en `motor-valle/`, cenital 2.5D, integración en El Metro y EnCicla, y carreras pseudo‑3D en Turno Cero | **Las cinco fases hechas (Claude). La 1 está aprobada; publicar y pasar a `main` esperan el OK del autor** | Fase 0: `docs/AUDITORIA-FASE0-CENITAL.md`. Fase 1 (Motor del Valle 1.3.0, el Valle saneado): `reportes/2026-11-24-claude-fase1-cenital.md`. **Fase 2** (el cenital nuevo con bandera en El Metro y EnCicla; Motor City 5.3.2 con los mundos saneados y sin la tolerancia de 1 m): `reportes/2026-11-24-claude-fase2-cenital.md`. **Fase 3** (la bandera encendida; El Metro 3.9.0 y EnCicla 3.9.0, con las huellas reales en su modo libre; Motor del Valle 1.3.1): `reportes/2026-11-25-claude-fase3-cenital.md`. **Fase 4** (`MC.Pista`: carreras retro pseudo‑3D, y «🏎️ Carreras retro» en Turno Cero; Motor City 5.4.0): `reportes/2026-11-25-claude-fase4-pista.md`. **Fase 5** (las cápsulas, 🧰 el garaje y 📏 de las carreras; Motor City 5.4.1): `reportes/2026-11-25-claude-fase5-capsulas.md`. Todo en la rama `ccr-4f6eeea5-yulqk1` de los tres repositorios, no en `main`. Publicar y pasar a `main` esperan el OK del autor. |

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

### Claude · 25‑nov‑2026 · Fase 5 del renacimiento cenital: las cápsulas, el garaje y 📏 en el celular (motor 5.4.1)
- **Pedido del autor:** seguir con las fases siguientes («retoma y sigue»).
- **Hecho** (rama `ccr-4f6eeea5-yulqk1`; **nada en `main`**):
  - **🧰 Garaje y colección** (`juegos/getaway/71-garaje.js`, aditivo):
    - fichas en 2D pixel con las cifras de `MC.Taller`, la moto con su perfil de `MC.Dinamica` y la capa aérea con sus ganchos (`G.Garaje.capaAerea()`);
    - se abre desde la portada sin cargar ninguna ciudad (y el mundo empieza en el carro elegido), y desde 🎮 Modos en el mundo abierto;
    - los kilómetros de cada vehículo.
  - **📏 de las carreras retro** (`G.Retro.medir()`, `?medir=retro`) y vibración corta en el celular.
  - **Arreglo de raíz de la carrera intermitente de 📏** (`68-medir.js`: el sello de `requestAnimationFrame` podía ser anterior al inicio y daba `TRAMOS[−1]`).
  - `pruebas/capsulas.mjs` (en `motor-city-qa.yml`); Motor City 5.4.1.
- **Probado:**
  - `capsulas` ✓ y `medir` ✓, en 3 de 3 cada una;
  - el paso entre cápsulas deja todo igual, y el reloj no avanza mientras se corre;
  - `pista-retro`, `modos` y `getaway-contenido` ✓; `prueba` 146 bien y `prueba --navegador` 158 bien.
- **Esperan al autor:** publicar las páginas y las APK (El Metro 3.9.0, EnCicla 3.9.0 y Turno Cero), pasar a `main` (con PR en BicicletasUno y MetroZero), medir en su celular con 📏 y el peso del HTML de EnCicla (9,99 MB).
- **Prompt de relevo:** `docs/PROMPT-RELEVO.md`, al día.
- **Instrucción para quien siga:** escribe tu propio documento de contexto, deja tu entrada aquí y pásale la misma instrucción a la IA que continúe.
