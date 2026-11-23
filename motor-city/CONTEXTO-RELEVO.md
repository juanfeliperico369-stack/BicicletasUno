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

## 0. Entregables de la 5.0.0 «Que se sienta» (HTML, APK y enlaces)
> **Un solo juego de prueba (decisión del autor en 4.6):** Turno Cero. Adentro, 🎮 Modos: Carreras, Extremo, Mandados, EnCicla y manejar el Metro, el tranvía y el Metroplús. Los juegos sueltos Carreras y Extremo se borraron; Mandados queda solo como banco interno de pruebas automáticas.

| Juego | Enlace | HTML (un solo archivo) | APK |
|---|---|---|---|
| Página del motor | <https://juanfeliperico369-stack.github.io/motorcity/> | `index.html` | — |
| **Turno Cero 5.0.0** (18+), el juego de prueba con todo: 🛞 manejo real (peso, suspensión, marchas, derrapes y choques), 🖼️ 3D realista (three.js), ⚙️ Flexibilidad, 🆘 rescate, 🚀 Ir en el mapa, pantalla en mitades, un solo mapa, 🌄 miradores | <https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/getaway.html> | `dist/juegos/getaway.html` | <https://github.com/juanfeliperico369-stack/motorcity/releases/download/v5.0.0/MotorCity-getaway.apk> |
| Juega EnCicla 3.2.0 (modos pulidos, transporte en el mundo 3D, freerun de la Comuna 13, el valle que recuerda) | <https://juanfeliperico369-stack.github.io/BicicletasUno/> | `BicicletasUno/dist/juega-encicla.html` | <https://github.com/juanfeliperico369-stack/BicicletasUno/releases/download/v3.2.0/JuegaEnCicla-v3.2.0-debug.apk> (y `descargas/JuegaEnCicla.apk` en Pages) |
| El Metro 3.3.0 (⚙️ Flexibilidad en Ajustes) | <https://juanfeliperico369-stack.github.io/MetroZero/> | `MetroZero/dist/index.html` | <https://juanfeliperico369-stack.github.io/MetroZero/el-metro.apk> (código 31) |
| Run Scooter | <https://juanfeliperico369-stack.github.io/RunRunZero/> | `RunRunZero/web/index.html` | <https://juanfeliperico369-stack.github.io/RunRunZero/RunScooter.apk> |

Las APK de los juegos del motor las compila `.github/workflows/apk-juegos.yml` (Capacitor 7). El proxy de esta sesión no deja subir etiquetas: el flujo, lanzado a mano, crea él mismo la release `v<VERSION.json>`. EnCicla (`android.yml`) y El Metro (`apk.yml`) hacen lo mismo con la versión de cada juego; Run Scooter la publica en su página con cada empuje a `main`.
**Juegos hermanos:** por decisión del autor siguen con su propio Motor del Valle; reciben el motor en `motor-city/` como referencia y un informe detallado en `docs/INFORME-MOTOR-CITY-4.6.md` (y el de la 4.5) (qué se cambió, qué mejoró, qué falta auditar, qué les toca y cómo usar el motor sin dejar el suyo).

## 1. La misión
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
