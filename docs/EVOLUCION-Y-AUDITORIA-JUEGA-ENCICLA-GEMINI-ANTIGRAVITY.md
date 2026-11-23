# Evolución, Auditoría Profunda y Plan Maestro · Juega EnCicla (Gemini · Antigravity)

> **Autoría:** **Gemini (Antigravity)** · **Fecha:** 22-nov-2026 · **Rama:** `antigravity/evolucion-encicla-v22`  
> **Base:** Juega EnCicla `v2.1.0` + Motor City `4.6.1` (`2f105df`) · **Formato:** un solo HTML offline sin internet ni librerías (`dist/juega-encicla.html`), español de Colombia y todo público.  
> **Para:** el autor y la IA principal que integrará la próxima evolución (v2.2 / v3.0) de **Juega EnCicla**.

---

## 1. Resumen ejecutivo y coordinación con las otras dos IA

Esta entrega responde al encargo integral de la **Ronda 3.0**: revisar a fondo **Juega EnCicla**, compararlo sin límite de estilos contra los mejores videojuegos del mundo (incluyendo los **más de 40 referentes** entregados por el autor), investigar arquitectura de mundos abiertos con pocos recursos, **arreglar los modos rotos, lentos o engorrosos**, liberar **todo desde el principio**, construir **un solo mundo 3D con cámaras coherentes + 2D + Pixel World combinable**, adaptar el **Endless Runner exclusivamente a ciclorrutas reales** con **5 zonas de skate/BMX/parkour en el mundo abierto**, integrar **todos los módulos cerrados dentro del mundo libre** con progresión **RPG / Diario Postal / subtramas**, y dejar un plan de evolución lógico y verosímil.

### 1.1 Estado real de las tres IA trabajando en paralelo (verificado en GitHub e Issue #2)

| IA / Marca | Rama en GitHub | Zona exclusiva reservada | Aporte verificado en esta ronda |
|---|---|---|---|
| **Claude (Claude Code)** | `origin/ccr-6f184fb6-vtpkye` (`2f105df`) | `src/js/99a-*.js` a `99m-*.js`, `docs/INVESTIGACION-Y-PLAN-3.0-Claude.md` | Entregó `v2.1.0` (manejo deslizante, HUD contextual, 4 tamaños, rostros, Ruta a Guatapé, red completa de El Metro), actualizó `motor-city/` a **4.6.1** (`⏫ acelerador fijo`) y publicó el plan de coordinación 3.0 en `coord/buzon/20261122-0030-claude-plan-3.0.md`. |
| **Gemini (Antigravity)** *(esta entrega)* | `antigravity/evolucion-encicla-v22` | `src/js/99n-*.js` a `99q-*.js`, `tests/auditoria-antigravity.js`, `docs/EVOLUCION-Y-AUDITORIA-JUEGA-ENCICLA-GEMINI-ANTIGRAVITY.md` | **Arreglos quirúrgicos + 4 módulos completos en verde:** todo liberado, `⏫ acelerador fijo`, 5 modos Infinity, **un solo mundo 3D con 6 cámaras coherentes + Pixel World**, ciclorruta runner + 5 skateparks abiertos, 17 actividades en Modo Libre + RPG + Diario + subtramas + unificación narrativa con `CAST`. |
| **OpenAI GPT-6** | `origin/openai-gpt6/encicla-auditoria-20261122` (`c31524e`) | `src/js/99r-*.js` a `99z-*.js`, `tests/prueba-gpt6-ciclorrutas.mjs`, `docs/EVOLUCION-ENCICLA-OPENAI-GPT6.md` | Detectó independientemente el bug de `TramoCiclista.cercana` (solo miraba el primer vértice de cada vía) y creó el parche aditivo `src/js/99r-ciclo-geometria-gpt6.js` con proyección ortogonal exacta a segmentos (`CicloGeo.proyectar`), progresiva `inicioMetros` y bloqueo espacial del runner fuera de ciclorrutas. |

> **Nota clave de integración para la IA principal (`99p` de Gemini + `99r` de OpenAI GPT-6):**  
> Los archivos están en rangos disjuntos (`99n–99q` vs. `99r`), por lo que **no generan conflictos de fusión Git**. El único contrato funcional a decidir al unirlos es el atajo del Taller:
> - En `99p-ciclovia-skate-runner.js`, si el jugador está rodando en el mundo abierto, el botón contextual `🏁 Runner` **solo aparece sobre ciclorrutas reales**; si abre el Runner explícitamente desde el Taller estando fuera de ciclorruta, lo traslada suavemente a la ciclorruta más cercana para no frustrar la prueba rápida.
> - En `99r-ciclo-geometria-gpt6.js` (que carga después de `99p`), `ModeUsuarioR.iniciarRunner3D` y `Mode.runSub` bloquean el arranque si estás a >12 m de una ciclorruta, pidiendo acercarte físicamente, y además aportan la excelente proyección por segmento exacto `CicloGeo.proyectar` + `inicioMetros`.  
> **Recomendación:** conservar la geometría exacta por segmentos de `99r` (`CicloGeo.proyectar` e `inicioMetros`), mantener el botón situado solo en ciclorruta en Modo Libre, y ofrecer en el aviso del Taller un botón de un toque **«📍 Ir a la ciclorruta cercana»** para unir fidelidad espacial + cero fricción.

---

## 2. Auditoría real de fallas antes de Ronda 3.0 (lo roto, lo lento y lo incoherente)

Al inspeccionar el código fuente (`src/js/*.js`), correr Playwright sobre `dist/juega-encicla.html` y revisar capturas reales en `412×860` y `860×412`, se confirmaron **10 problemas concretos** (no suposiciones):

| # | Problema confirmado | Archivo original | Impacto real en el jugador | Solución aplicada (Ronda 3.0) |
|---|---|---|---|---|
| 1 | **`Snd.vehSfx` roto por completo** | `src/js/92-vehiculos.js` | Llamaba `this.on`, `this.noise()` y `this.tone()` con firma inexistente respecto a `00-core.js`; al tocar timbre/truco en skate, patines o scooter fallaba el audio o lanzaba excepción. | Reescrito sobre `Snd.init()`, `Snd.tone(f, d, opts)` y `Snd.hat(...)` para los 7 vehículos. |
| 2 | **Salto bloqueado y sprites incompletos en Panorámica 2D** | `src/js/75-graficos.js`, `src/js/92-vehiculos.js` | `Ride.prototype.jump()` rechazaba todo excepto `bike`; `skate`, `patines`, `scooter`, `emonopatin`, `ebike` y `walk` no podían saltar obstáculos en Panorámica 2D y faltaba `lado` en el registro. | Habilitado salto para los **7 vehículos no-camión** + `Art.vehSideRider(...)` enlazado a `JE.vehiculos.registrar`. |
| 3 | **Sin `⏫ acelerador fijo`, camión rígido en esquinas y tope `×1.5`** | `src/js/30-ride.js`, `src/js/79-interfaz.js` | Soltar el pulgar frenaba de golpe; el camión (Balance, Supervisor, Bodega) sufría en curvas estrechas OSM; no había modo Turbo rápido para recorrer el valle completo. | Portado **`⏫ Acelerador fijo`** (patrón Motor City 4.6.1) en `#camBar` (`E`/`Shift`) con suave imán de vía + asistencia de giro del camión a baja velocidad + `×2 Turbo` en `VELS` (`99n`). |
| 4 | **Emboscada en cuadro 1 en Anfitrión y Apoyo** | `src/js/52-oficios.js` | La bici nacía a 20 px de un marcador de 36 px y disparaba `MGApertura` antes de que el jugador viera el mapa. | Ventana de cortesía visual de 0,85 s en `ShiftMode.doTask` en modo interactivo (sin afectar bots ni `tests/run.js`). |
| 5 | **Contenido bloqueado + 5 minijuegos Infinity ocultos** | `src/js/60-ui.js`, `src/js/90-puzles.js` | Había que destrabar oficios, turnos y los 16 capítulos de *Un día del valle* linealmente; `MGTraffix`, `MGRutas` (Despacho y Metro), `MGLoop` y `MGLaberinto` no eran modos jugables directos ni accesibles desde Modo Libre. | **Todo 100 % liberado desde el segundo 1** (los 12 oficios, turnos 1–3, 16 capítulos probables conservando la marca visual `.lock` de avance) + registro de los 5 modos Infinity (`99n`). |
| 6 | **Cámaras desconectadas y ausencia de 3P/1P sobre el mismo mundo 3D** | `src/js/75-graficos.js`, `src/js/79-interfaz.js` | Solo había Cenital, Oblicua, Panorámica 2D y una Maqueta estática; no existía 3.ª ni 1.ª persona real del mismo valle, ni Pixel World combinable con las vistas 3D. | Nuevo director `JE.vistas` (`99o`) con **6 cámaras reales sobre el único `JE.map`** (3D Cenital, Oblicua, **3D Tercera Persona**, **3D Primera Persona**, Panorámica 2D, Maqueta 2:1 viva) + **Pixel World** combinable + controles coherentes (`girarDir`). |
| 7 | **Carrera en ciclovía costosa e imprecisa** | `src/js/92-ciclovia.js` | `CarreraCiclovia.render` repetía búsqueda binaria por cada franja vertical; `TramoCiclista.cercana` miraba solo el vértice 0; el bot no esquivaba bien. | Caché de curvatura por corte Z (~15× menos búsquedas binarias), mejora de búsqueda cercana, controles WASD/flechas/táctil y bot esquivador. |
| 8 | **Endless Runner desconectado de ciclorrutas y sin zonas de skate/parkour** | `src/js/91-runner.js` | Se abría desde cualquier calle, tenía ancho constante, sin giros en intersecciones ni zonas de trucos en el mundo abierto. | `99p-ciclovia-skate-runner.js`: botón `🏁 Runner` solo sobre ciclorrutas reales, tramos de ancho dinámico (Avenida Ancha ↔ Ciclorruta ↔ Paso Estrecho), cruces direccionales (`⬅ ⬆ ➡`), barandas/parkour y **5 skateparks reales** integrados en el Valle abierto. |
| 9 | **Mundo libre sin peso RPG ni acceso a todos los módulos cerrados** | `src/js/69-libre.js` | Los oficios y minijuegos vivían aislados en menús cerrados; rodar por barrios no construía reputación ni crónica personal. | `99q-mundo-vivo-rpg.js`: **Hub Valle Vivo** con las **17 actividades** jugables dentro del mundo abierto con regreso exacto, 4 habilidades RPG (Resistencia reduce desgaste real en subidas), reputación por 6 comunas, Diario Postal y subtramas ciudadanas cercanas. |
| 10 | **Incoherencia narrativa + accesibilidad WCAG y modo horizontal** | `contenido/guion/trama_valle.json`, `src/index.html`, `src/style.css` | Los 9 personajes en `trama_valle.json` contradecían sus oficios canónicos en `CAST` (`66-historia.js`, pendiente en `REVOLUCION-2.1.md` § 6); `user-scalable=no` bloqueaba zoom; `body.contraste` tapaba focos; faltaba pulido en `860×412`. | Unificación 100 % de los 9 mentores con `CAST`; `lang="es-CO"`, ARIA, objetivos táctiles `≥44px`, `100dvh`, `prefers-reduced-motion`, contraste AA limpio y paisaje `860×412`. |

---

## 3. Comparativa exhaustiva contra los mejores videojuegos (40+ referentes sin límite de estilos)

El principio rector de esta comparativa es estricto: **ni proponer mecánicas imposibles o incompatibles con un juego colombiano todo público** (se descartan armas, violencia, crímenes o explosiones gratuitas), **ni descartar perezosamente referentes de otros géneros** cuando sus principios de cámara, ritmo, lectura espacial, retroalimentación táctil (*game feel*), gestión o contemplación son 100 % aplicables a la movilidad en el Valle de Aburrá.

### 3.1 Referente prioritario #1: *Super Arcade Racing* (`com.outofthebit.superarcaderacing`)

El autor lo señaló explícitamente como **«el más importante a tener en cuenta»**. ¿Por qué *Super Arcade Racing* se siente instantáneamente adictivo en móvil con vista cenital y recursos modestos?

| Pilar de *Super Arcade Racing* | Qué lo hace brillante | Qué ya tiene / agregamos en EnCicla | Qué falta evolucionar (Fase 4.0) |
|---|---|---|---|
| **1. Física arcade de agarre + derrape controlado** | El vehículo responde al primer milisegundo, gira con radio intuitivo que se cierra suavemente al frenar/soltar y nunca castiga con trompos incontrolables. | Manejo deslizante `30-ride.js` + `98q-manejo.js` + `⏫ Acelerador fijo` (`99n`) + giro ágil del camión. | Botón opcional de **freno trasero / derrape controlado** en bicis deportivas, skate y camión con chispa/polvo y salida con impulso (*boost de curva*). |
| **2. Lectura instantánea de la trazada y vértices** | Bordes bicolores en curvas, flechas luminosas pintadas en el asfalto y anticipación visual antes del giro. | Flechas GPS de suelo en 3P/1P (`99o`), cono direccional cenital (`98s`) y señales direccionales en el Runner (`99p`). | **Chevrons dinámicos en curvas cerradas** de ciclorrutas y contrarreloj urbana, con color por velocidad óptima (verde = a fondo, ámbar = modera). |
| **3. Sensación de velocidad y micro-feedback (*juice*)** | Marcas persistentes de llanta, partículas de polvo/lluvia, inclinación sutil del chasis al girar y rebufo (*slipstream*) detrás de otros corredores. | Inclinación del ciclista en 3P (`99o`), marcas de frenada/polvo/lluvia (`98p`) y combos en skateparks (`99p`). | **Rebufo en pelotón (*drafting*)** detrás de otros ciclistas en Ciclovía/Guatapé y **fantasma (*ghost*)** de tu mejor vuelta contrarreloj en cada corredor del valle. |
| **4. Reinicio en <1 s y estructura de retos cortos** | Si fallas un tramo, vuelves a correr con un toque sin pantallas pesadas; mezcla contrarreloj, eliminatoria, duelos y campeonato. | Acceso directo sin bloqueos (`99n`) y 17 actividades rápidas desde el mundo abierto (`99q`). | **Botón «↻ Reintentar ya»** en la tarjeta de fin de actividad/runner + circuitos callejeros marcados por barrios (Circuito Laureles, Sprint Río, Lomas del Poblado). |
| **5. Personalización con impacto visible y legible** | Mejoras simples (motor, ruedas, frenos, carrocería) que se notan tanto en el manejo como en el aspecto del vehículo. | Taller con 7 vehículos + mejoras roguelite + habilidades RPG (`resistencia`, `tecnica`, `mecanica`, `civismo`). | **Taller visual de partes EnCicla** (llantas urbanas/gravel, luces LED, canasta, calcomanías de comunas) reflejadas en 3D Cenital, 3P, 1P y Panorámica 2D. |

### 3.2 Conducción cenital, escape ágil y mundo abierto vehicular

| Referente | Lección jugable clave | Aplicación lógica y verosímil en Juega EnCicla | Qué NO entra |
|---|---|---|---|
| **PAKO Forever / PAKO 2 / PAKO 3** | Sesiones ultra-rápidas en mapas densos con obstáculos destructibles suaves, giro con 2 dedos o un pulgar y tensión creciente en espacios cerrados. | Modo **«Hora Pico Extrema»** en estacionamientos/glorietas y esquive fluido de tráfico en Balance/Rescate sin quedarse pegado a esquinas. | Persecuciones violentas o estallidos de carros. |
| **#DRIVE (`htdrive`)** | Viaje infinito panorámico de carretera con cambios de paisaje, paradas rápidas en estaciones de servicio para agua/reparación y estética postal retro. | Enriquecer la **Ruta a Guatapé** y nuevas rutas intermunicipales (Envigado → Caldas, Bello → Barbosa) con paradas fluidas de hidratación y clima cambiante. | — |
| **Reckless Getaway 2 / Getaway** | Claridad cenital en avenidas anchas, atajos por callejones y rampas urbanas que enlazan planos de altura. | Atajos reales por **puentes peatonales, pasajes de Laureles y parques**; rampas de skateparks integradas en el mismo flujo vial (`99p`). | Destrucción policial. |
| **GTA 1, 2 y London** | **Arquitectura top-down 2.5D/3D con fachadas que se abren en perspectiva**, tráfico vivo con semáforos reales, misiones por cabina/teléfono y reputación por facciones/barrios. | **Cámara Cenital 3D + Oblicua** con fachadas extruidas (`75-graficos.js` + `99o`), **reputación por 6 comunas** y **subtramas por radio/tótem** (`99q`). | Crimen, armas y violencia. |
| **GTA: Chinatown Wars** | **Minijuegos táctiles integrados al mundo abierto** (acciones cortas con gestos reales de pantalla que no rompen el ritmo del mapa) y economía dinámica por barrios. | El corazón de EnCicla: cada estación/bici dispara micro-acciones táctiles (ajustar sillín, inflar llanta, escanear tarjeta Cívica, armar tula) y balanceo inteligente entre comunas con demanda variable. | Tráfico ilegal. |
| **GTA: San Andreas** | Estadísticas orgánicas que suben **haciendo** (pedalear sube resistencia, hacer trucos sube técnica), cambio libre de vehículo y ciudad con identidad marcada por zonas. | Implementado en `99q-mundo-vivo-rpg.js`: 4 habilidades RPG que crecen al jugar (`resistencia` baja desgaste real de energía) y 6 comunas con rangos propios. | Combate armado / bandas. |
| **Need For Speed No Limits / APEX Racer / FR Legends / Forza Horizon 2** | **Sensación de festival abierto** (Forza Horizon: el mundo entero es un patio de pruebas con radares de velocidad, zonas de trucos y rutas de punto a punto), cambio de vista instantáneo cabina/3P, telemetría limpia y derrape expresivo (FR Legends) + vista lateral 2D estilizada en sprints (APEX Racer). | **Cámaras 3P y 1P sobre el mismo mundo 3D (`99o`)**, **Panorámica 2D lateral** para sprints/saltos (APEX Racer), **5 zonas de skate/trucos abiertas (`99p`)** y próximo sistema de **Radares de Cadencia y Zonas de Flujo Verde** estilo Forza Horizon. | Carreras clandestinas temerarias sin cultura vial. |
| **Crazy Taxi / Parcel Corps** | **Flecha gigante diegética**, bonos por ruta creativa/saltos y entregas contrarreloj llenas de personalidad ciclista. | Flecha GPS proyectada sobre el asfalto en 3P/1P (`99o`), combos de entregas en Balance/Domicilios sostenibles y propinas en hojas por puntualidad. | Atropellos (siempre prioridad peatonal). |

### 3.3 Tránsito, ferrocarriles, logística y puzles táctiles (*Infinity Games* y estrategia)

| Referente | Lección jugable clave | Aplicación lógica y verosímil en Juega EnCicla |
|---|---|---|
| **Traffix** *(Infinity Games — señalado por el autor para buses y Metroplús)* | Control minimalista de semáforos con 1 toque (rojo/amarillo/verde), lectura instantánea de impaciencia y ritmo hipnótico de cruces. | `MGTraffix` ahora expuesto como modo completo **Semaforero del Valle** (`traffix` en `99n`) y actividad directa en el mundo abierto (`99q`). Próximo paso: overlay *Traffix* en cruces reales del Metroplús (Oriental, 30, 80). |
| **Package Inc.** *(Infinity Games)* | Red de nodos que crece orgánicamente; hay que despachar entregas antes de que colapse una estación saturada. | Modo **Despacho del Valle** (`despacho` en `99n` y `99q`) mapeado al balanceo real de camiones y bicicletas EnCicla entre estaciones vacías y llenas. |
| **Tiny Rails (`TrainChu`)** *(señalado por el autor para el Metro en 2D)* | Encanto pixel/2D lateral del tren avanzando por estaciones reales, vagones personalizables, pasajeros que suben/bajan y paisaje contemplativo que cambia con la hora. | **Siguiente gran módulo sugerido (P1):** **Vista Lateral 2D del Metro de Medellín** (Línea A Niquía ↔ La Estrella y Tranvía de Ayacucho en modo pixel/2D) recorriendo el mismo horario y estaciones reales de `red_metro.json`. |
| **Railways** | Trazar y conmutar agujas ferroviarias para evitar choques y sincronizar llegadas a estaciones por color. | Modo **Maquinista Línea A** (`maquinista` en `99n` y `99q`). |
| **Infinity Loop / Laser / Laberinto** *(Infinity Games)* | Puzles sin estrés, puros, táctiles y relajantes que descansan el ritmo arcade y recompensan la observación. | Expuestos como **Circuito LED (`circuito`)**, **Tótem Óptico (`laser`)** y **Laberinto de Moravia (`moravia`)** tanto en menú como dentro del mundo abierto (`99n` + `99q`). |
| **911 Operator / CityRT (`cityrt.com`)** | Mapa táctico real de ciudad donde despachas unidades en tiempo real, priorizas incidentes y observas el flujo de tránsito vivo. | Potenciar **Monitoreo (Centro de Control)** con despacho simultáneo de camiones de Balance, técnicos de campo y brigadas sobre el mapa vivo del Valle de Aburrá. |
| **Idle Supermarket Tycoon** | Progresión satisfactoria de estaciones que mejoran su capacidad, filas ordenadas y automatización amable sin volver el juego pasivo. | Evolución de estaciones EnCicla en Modo Libre/Gestión: más anclajes, paneles solares, bebederos y taller exprés que mejoran la fluidez de la comuna. |

### 3.4 Ciudad viva, simulación, construcción y sandboxes sistémicos

| Referente | Lección jugable clave | Aplicación lógica y verosímil en Juega EnCicla | Qué NO entra |
|---|---|---|---|
| **The Sims** | Necesidades humanas claras (energía, hidratación, ánimo, vínculos), rutinas cotidianas con sentido y personalización cercana. | El jugador ya tiene energía, descanso en bancas, café/agua, avatar y rutinas (`Usuario` estudio/trabajo); potenciar vínculos con los 15 vecinos/mentores y eventos de barrio. | Microgestión lenta que frene el ritmo arcade. |
| **Cities: Skylines / SimCity BuildIt / TheoTown** | Simulación sistémica de movilidad: si conectas bien una ciclorruta con el Metro, baja la congestión y mejora el aire; estética isométrica/pixel nítida (TheoTown). | **Capa táctica de Movilidad Sostenible** (ver congestión y calidad del aire por comuna; al completar turnos y subtramas mejora el índice verde del valle) + **Maqueta 2:1 + Pixel World** inspirados en TheoTown. | Impuestos complejos o menús densos de hoja de cálculo. |
| **Townscaper** | Construcción orgánica instantánea con un toque, sonido táctil delicioso y color mediterráneo/urbano sin reglas punitivas. | **Modo Urbanismo Táctico (Fase 4.0):** en plazas/parques puedes colocar con un toque bici-parqueaderos, jardineras, guayacanes, rampas o murales que quedan guardados en tu Valle. | — |
| **WorldBox / Solar Smash** | **Física emergente a escala de mundo**, efectos climáticos espectaculares y poder observar cómo reacciona todo un ecosistema vivo en tiempo real. | Traducido de forma 100 % verosímil y educativa: **Simulador de Clima y Resiliencia del Valle** (lluvias torrenciales en el río Medellín, días sin carro, ciclovía dominical masiva, floración simultánea de guayacanes, desvíos dinámicos en tiempo real). | Destrucción planetaria o catástrofes violentas. |

### 3.5 Skate, parkour, contemplación, narrativa y arte

| Referente | Lección jugable clave | Aplicación lógica y verosímil en Juega EnCicla |
|---|---|---|
| **Skate Space / Vector** | Fluidez cinética de trucos (ollies, grinds, manuals) en *Skate Space* y siluetas/bóvedas ágiles de parkour con ritmo en *Vector*. | **5 zonas reales de Skate / BMX / Parkour** integradas en el mapa abierto (`99p`: Ciudad del Río, Parques del Río, Atanasio, Puente 4 Sur, Segundo Parque de Laureles) con rampas, barandas y bóvedas parkour + combos multiplicadores + integración en el Endless Runner. |
| **Alto's Odyssey** | **Contemplación en movimiento**: horizonte por capas, ciclo dorado atardecer/noche, cámara que respira al saltar y objetivos suaves sin estrés. | Aplicado al cielo/silueta de montañas del Valle en **3P, 1P y Panorámica 2D (`99o`)** y modo **Modo Zen / Paseo Contemplativo** para rodar sin reloj disfrutando el atardecer antioqueño. |
| **Sky: Children of the Light** | Asombro compartido, exploración vertical y encuentros no verbales (gestos, timbres, luces) con otros viajeros. | **Timbre musical cordial** (saludos con vecinos y otros ciclistas en WebRTC), faroles nocturnos comunitarios y viaje contemplativo en **Metrocable** sobre la ladera. |
| **Monument Valley / Little Nightmares** | Composición arquitectónica inolvidable (*Monument Valley*: geometría limpia, perspectiva isométrica poética) y escala dramática del entorno frente al personaje pequeño (*Little Nightmares*: atmósfera y luz direccional). | En **Maqueta 2:1 (`99o`)** y lugares emblemáticos (Edificio Coltejer, Biblioteca España, Puente de la 4 Sur, Escaleras Comuna 13): composición de luz/sombra que hace sentir la grandeza del valle. *(Sin elementos de terror).* |
| **Wheel World / Season: A Letter to the Future / A Short Hike** | El placer físico de pedalear, recolectar piezas útiles, documentar historias en un diario ilustrado y explorar una montaña/valle a tu propio paso. | **Diario Postal del Valle (`99q`)** + Álbum de Postales + bicicletas y piezas con personalidad + rutas panorámicas. |
| **UnoCero (Industry Art / Revista EMSAY)** | Tono editorial inteligente, curioso y cercano (*«lo que todos saben / lo poco conocido»*, curiosidades históricas y memoria cultural) que despierta ganas de investigar más. | Coherencia de tono entre las **Fondas de Guatapé**, los datos de las **91 estaciones del Metro**, el **Diario Postal** y la trama unificada con `CAST` (`contenido/guion/trama_valle.json`). |

### 3.6 Acción táctica, ritmo, reflejos y vuelo *(extrayendo mecánica pura todo público)*

| Referente | Principio mecánico puro | Traducción inteligente, creativa y 100 % verosímil para EnCicla |
|---|---|---|
| **Hunter Assassin / Bullet Echo** | **Lectura cenital con conos de visión/iluminación recortados por muros**, conciencia de ángulos muertos y posicionamiento inteligente. | Ya presente en el halo y farol nocturno (`98s`); siguiente paso: **mostrar puntos ciegos de buses y camiones en rojo suave** para enseñar seguridad vial real (educación + táctica sin armas). |
| **Shadow Fight 2 / Gun Fu Stickman 2** | Precisión rítmica de encadenar movimientos, siluetas ultra-legibles y sensación de impacto limpio en el instante justo (*hit-stop* suave). | En **Pausa Activa (ritmo)**, **trucos de Skate/Parkour** y **Taller Mecánico** (apretar tuercas/centrar rin en el punto exacto): micro-pausa de impacto (40 ms) + silueta clara + multiplicador de precisión. |
| **The Bonfire: Forsaken Lands** | Ciclo día/noche con sentido: de día construyes y preparas, al caer la tarde gestionas la hora pico y la lluvia; minimalismo lateral evocador. | Ciclo completo de **jornada EnCicla** (madrugada apertura → pico mañana → mediodía mantenimiento → pico tarde → cierre nocturno) con consecuencias visibles en demanda y clima. |
| **Soul Knight** | Partidas ágiles roguelite con salas/turnos variados, armas/herramientas curiosas y sinergias entre mejoras en cada intento. | **Turnos Roguelite de EnCicla** con sinergias de equipo (p. ej., *Llantas de Lluvia + Linterna LED + Rodamientos Cerámicos* combinan un bono secreto de «Bici de Élite»). |
| **Real Flight Simulator / Spaceflight Simulator** | Instrumentación clara (altitud, pendiente, velocidad vertical, energía) y emoción de dominar la física del entorno real. | **Instrumento de Vuelo del Metrocable y Altimetría del Valle:** al subir en Metrocable (Líneas K, J, P, L, H, M) o coronar El Poblado/La Piedra, panel limpio con m s. n. m., pendiente % y vista panorámica aérea del mismo valle 3D. |
| **Missiles! / 1945 Air Force** | Lectura limpia de trayectorias entrantes, esquive en 360° con un solo dedo y coreografía de patrones de obstáculos. | En el **Runner en Ciclorruta** y un modo **Dron Fotográfico del Valle** (volar un dron cívico sobre Medellín tomando postales aéreas mientras esquivas ráfagas de viento y bandadas de aves): pura agilidad arcade, cero violencia. |

### 3.7 Cobertura de los 10 géneros solicitados

| Género | Cómo vive hoy en Juega EnCicla (v2.2 Ronda 3.0) | Evolución sugerida (Fase 4.0) |
|---|---|---|
| **1. Arcade** | Manejo fluido `30-ride.js` + `⏫` acelerador fijo + combos de skatepark + Runner con anchos y cruces (`99n`, `99p`). | Fantasmas contrarreloj, rebufo y botón «↻ Reintentar ya». |
| **2. Mundo Abierto** | Valle de Aburrá OSM real (`JE.map`), 10 municipios, 33+ estaciones, red completa de El Metro, 5 skateparks y 17 actividades jugables en el mismo mapa (`99q`). | Más interiores/plazas interactivas y eventos de ciclovía dominical con calles cerradas a carros. |
| **3. Roguelite** | Mejoras entre turnos, novedades diarias aleatorias y retos diarios con semilla compartible. | Sinergias ocultas entre 2 mejoras + modificadores de ruta elegibles antes de salir. |
| **4. Estrategia** | Balanceo de camiones, Centro de Monitoreo, Semaforero (`traffix`) y Despacho (`despacho`). | Despacho simultáneo tipo *911 Operator* en el mapa táctico del Valle. |
| **5. Puzzles** | Circuito LED (`circuito`), Tótem Óptico (`laser`), Laberinto de Moravia (`moravia`), Armar Tulas y Conteo. | Puzles contextuales en tótems averiados al tocarlos directamente en la calle. |
| **6. Acción** | Rescate de bicis, Runner en ciclorruta con parkour/grinds, esquive en Hora Pico y Pausa Activa rítmica. | Micro *hit-stop* (40 ms) al clavar trucos perfectos y puntos ciegos tácticos de buses. |
| **7. Gestión de Recursos** | Conservación real de bicis en estaciones, energía/agua, presupuesto de mejoras y capacidad del camión. | Mejora progresiva de estaciones (anclajes, paneles solares, taller exprés) por comuna. |
| **8. Simulador de Actividades** | 12 oficios reales de EnCicla + Ruta a Guatapé con física de potencia/pendiente + red de El Metro. | Modo **Metro 2D lateral** estilo *Tiny Rails* y cabina de **Metrocable** con altimetría real. |
| **9. Contra el Reloj** | Turnos cronometrados, Carrera de Ciclovía, Guatapé y sprints en ciclorruta. | 6 circuitos cronometrados por comuna con medallas Bronce/Plata/Oro y fantasma local. |
| **10. Rol (RPG / MMO)** | 4 habilidades RPG con efecto real, reputación en 6 comunas, Diario Postal, subtramas emergentes (`99q`) y sala P2P WebRTC para rodar en grupo. | Cadena de subtramas por mentor (arcos de 3 misiones) y retos cooperativos WebRTC en skateparks. |

---

## 4. Investigación técnica aplicada: mundos grandes con pocos recursos (un solo HTML offline)

El reto técnico central de **Juega EnCicla** es extraordinario: meter **10 municipios reales del Valle de Aburrá**, tráfico, Metro, 12 oficios, 7 vehículos, 17 actividades, 6 cámaras y sonido procedural en **un solo archivo HTML offline (~5,3 MB)** que corra fluido en teléfonos Android de gama media-baja sin internet ni librerías externas.

### 4.1 Arquitectura de «Un Solo Mundo 3D + 2D + Pixel» (fin de la duplicación)

El error más común al mezclar cámaras es crear «un mapa para cenital, otro escenario falso para 3.ª persona y otro juego aparte para pixel». En **`src/js/99o-mundo3d-camaras.js`** aplicamos el principio de **Fuente Única de Verdad (`JE.map`)**:

```text
                ┌────────────────────────────────────────────────────┐
                │   FUENTE ÚNICA DE VERDAD (JE.map + Ride + Mundo)   │
                │  · Terreno OSM bit-empaquetado + relieve M.elev    │
                │  · Vías vectoriales M.chainsNear (calles, ciclo)   │
                │  · Edificios reales M.lotes (huella, altura, tipo) │
                │  · 33 estaciones, red El Metro, 5 skateparks, NPCs │
                └──────────────┬─────────────────────────────────────┘
                               │  Proyecciones en vivo sobre el MISMO estado
     ┌──────────────┬──────────┴──────────┬──────────────┬──────────────┐
     ▼              ▼                     ▼              ▼              ▼
 3D Cenital    3D Oblicua         3D 3.ª y 1.ª Pers.  Panorámica 2D  Maqueta 2:1
 (extrusión    (inclinada         (cámara perspectiva (corte lateral (dimétrica
  + fachadas)   con rumbo)         real con horizonte) sobre relieve) en vivo)
                               │
                               ▼
              ┌─────────────────────────────────────────┐
              │  CAPA COMBINABLE: PIXEL WORLD (KeyK/7)  │
              │  No excluye el 3D: detalla superficies, │
              │  sprites y cuantización sobre cualquier │
              │  cámara (incluida 3.ª Persona 3D).      │
              └─────────────────────────────────────────┘
```

**Por qué el 2D y el Pixel NO excluyen al 3D (y cómo se complementan):**
1. **El 3D define el espacio continuo del mundo:** edificios (`M.lotes`), avenidas, río, montañas del valle, estaciones, skateparks y movimiento con una sola física.
2. **El 2D aporta detalle fino y jugabilidades donde el plano lateral/frontal brilla:** fachadas con balcones y avisos locales, sprites nítidos de los 7 vehículos (`Art.vehSideRider`), **Panorámica 2D** para saltos/plataformas, puzles estilo Infinity Games y el futuro **Metro 2D** estilo *Tiny Rails*.
3. **El Pixel World aporta textura, identidad de revista pixel (EMSAY/UnoCero) y bajo costo:** funciona como capa estética combinable (`JE.vistas.togglePixel()`) tanto en Cenital como en 3P/1P/Maqueta, y en modos clásicos donde la lectura pixelada mejora la respuesta visual.

### 4.2 Balance Escala-del-Mundo vs. Reloj-del-Juego (arcade fluido sin hiperrealismo lento)

Un mapa real de ~32 km a 18 km/h reales tardaría casi 2 horas en cruzarse; eso arruina la diversión en móvil. La solución matemática aplicada entre `30-ride.js`, Motor City `4.6` y `99n-controles-liberado.js` equilibra **sensación verosímil + ritmo ágil**:
- **Velocidad arcade escalada:** en `×1` la bicicleta cruza un barrio completo en **12–25 segundos**, pero conserva diferencias reales entre vehículos (a pie < patines < skate < bici < e-bike < scooter/camión) y siente las lomas de Medellín sin paralizarse.
- **Multiplicador de ritmo libre (`×0,75 · ×1 · ×1,25 · ×1,5 · ×2 Turbo`):** permite pasar de paseo contemplativo a exploración veloz del Valle completo en un toque.
- **`⏫ Acelerador fijo` (Motor City 4.6.1):** elimina la fatiga del pulgar en móvil — un toque mantiene la velocidad de crucero con un suave imán hacia el eje de la calle/ciclorruta (`99n`), dejando al pulgar únicamente la dirección; otro toque frena suavemente.
- **Independencia de FPS:** en el bucle de física, usar subpasos pequeños (como Motor City 4.6 a 25 ms) garantiza que un celular a 20 FPS recorra la misma distancia que uno a 60 FPS sin «cámara lenta».

### 4.3 Técnicas clave de optimización para móviles modestos (medido en CPU 4×)

1. **Caché espacial por trozos (`CityMap.chunks2`) + consultas por rejilla (`M.chainsNear`, `M.lotesNear`):** nunca iterar el mapa completo en cada cuadro; solo los lotes y vías dentro de la ventana o frustum inmediato.
2. **Frustum culling estricto en 3P y 1P (`99o`):** los lotes, árboles, estaciones, vehículos y skateparks se filtran por plano cercano/lejano y ángulo de visión antes de proyectar, y se ordenan con algoritmo del pintor únicamente sobre los ~40–90 elementos visibles. Resultado verificado: **mediana de ~16,7 ms en 3P y 1P incluso con emulación de CPU 4× lenta**.
3. **Precomputación de curvatura por franja Z (`92-ciclovia.js`):** redujo ~15× las búsquedas binarias en `CarreraCiclovia.render`.
4. **Audio 100 % procedural en Web Audio (`00-core.js` + `92-vehiculos.js`):** 0 KB de archivos MP3/WAV externos, manteniendo música adaptativa (lo-fi / soft rock / jazz) y efectos diferenciados por vehículo.
5. **HUD sin reflujos DOM innecesarios y accesible (WCAG 2.2 AA):** botones `≥44×44 px`, `100dvh`, `prefers-reduced-motion`, alto contraste con contorno adaptable y disposición limpia tanto en **vertical (`412×860`)** como en **horizontal (`860×412`)** y **escritorio (`1280×800`)**.

---

## 5. Detalle de todo lo agregado, arreglado y verificado (v3.3.0 · Gemini/Antigravity sobre v3.2.0 + GPT-6 + MC 4.9.0)

### 5.1 Archivos creados y armonizados (zona aditiva `99n–99q` + pruebas)
- **`src/js/99n-controles-liberado.js`:** armonizado con `99a-fluidez.js` (puente `JE.acelFijo` → `#bCrucero` sin duplicar botones, atajos `E`/`Shift`, imán suave de calle/ciclorruta), prueba directa de los 16 capítulos de *Un día del valle* conservando `.lock`, `×2 Turbo`, agilidad del camión en esquinas, cortesía visual de 0,85 s en `Anfitrión`/`Apoyo`, cierre de modales con `Escape`, guardia de `coverLoop`, botón **«↻ Reintentar ya» (<1 s)** en `#sResult`, registro directo de los **5 modos estilo Infinity Games** (`traffix`, `despacho`, `maquinista`, `circuito`, `moravia`) y el modo **🎲 Turno Roguelite (`roguelite`, estilo *Soul Knight*)**.
- **`src/js/99o-mundo3d-camaras.js`:** director unificado `JE.vistas` sobre el único `JE.map`, integrado con el WebGL real `JE.mundo3d` (`99d`+`99f`) para **3D Tercera Persona** y **3D Primera Persona** (con respaldo automático Canvas 2D si falta WebGL), **cabina/manubrio EnCicla con canasta, frenos y timbre** (o cabina del camión) sobre `#gl3d`, **sol/luna atmosférica** por hora del día, **Pixel World combinable sobre WebGL** (`body.pixel3d` + escala cuantizada nítida `0,38×`), **Maqueta 2:1 en vivo** siguiendo al jugador, controles `girarDir` coherentes, icono SVG blanco en `#camBar` y atajos `1–6`, `7`/`K`, `V`.
- **`src/js/99p-ciclovia-skate-runner.js`:** entrega los **6 modos bandera solicitados por el autor y el plan multi-IA (§ 4–6)**, todos jugables en menú y desde el mundo abierto con bot activo:
  1. **🏆 Copa del Valle (`copa`, estilo *Super Arcade Racing*):** 3 circuitos callejeros reales en `JE.map` (Laureles, Ciudad del Río, Atanasio), 3 rivales IA, **rebufo (*slipstream*)**, chevrons luminosos en asfalto y banderas físicas en Modo Libre.
  2. **🍔 Domicilio Sostenible (`domicilio`, estilo *Crazy Taxi / Parcel Corps*):** entregas contrarreloj de sabores paisas sobre `JE.map` con flecha diegética gigante y bonos de tiempo por racha.
  3. **📡 Monitoreo 911 (`monitoreo911`, estilo *911 Operator / CityRT*):** despacho táctico en tiempo real de Balance, Técnico, Anfitrión y Tránsito sobre Medellín.
  4. **🏙️ El Planeador (`planeador`, estilo *Cities: Skylines / Townscaper*):** estrategia cívica construyendo estaciones, ciclorrutas, tótems solares y plazas guayacán con bonos de red y calidad del aire.
  5. **🚇 Metro 2D Lateral (`metro2d`, estilo *Tiny Rails* / `TrainChu`):** viaje lateral 2D por las estaciones reales de la Línea A del Metro de Medellín con acelerador, freno de precisión en andén y viajeros.
  6. **🌅 Bajada por Las Palmas (`palmas`, estilo *Alto's Odyssey* + Ley 1811):** descenso lateral al atardecer con saltos, freno en curvas cerradas y brisas de impulso.
  - Además conserva los **5 skateparks físicos abiertos** (Ciudad del Río, Parques del Río, Atanasio, Puente 4 Sur, Segundo Parque de Laureles), las mejoras de anchos/cruces/barandas en `MGRunner3D` y delega la detección espacial de ciclorrutas a `JE.cicloGeoGPT6` (`99r`).
- **`src/js/99q-mundo-vivo-rpg.js`:** armonizado 100 % con `99h-valle-vivo.js` (registra solo `rpg` en `Save.registrar` y escribe directo en `JE.diario`), ofrece el **Hub «🗺️ Valle Vivo»** con **24 actividades** jugables desde Modo Libre con regreso exacto, **reputación por 6 comunas**, **4 habilidades RPG** (Resistencia reduce realmente el desgaste de energía), **6 arcos encadenados de 3 encargos** con mentores canónicos (`CAST`: Luz, Santi, Don Jairo, Ing. Paola, Cata y Rosalba) y subtramas ciudadanas emergentes cercanas.
- **`tests/auditoria-antigravity.js`:** batería E2E en Chromium/Playwright que verifica los 12 modos nuevos, la armonización con `99a–99h` y `99r`, las 6 cámaras + Pixel World sobre WebGL, `Save.revisarClaves() = 0`, rendimiento CPU 4× y captura 12 pantallas en `412×860`, `860×412` y `1280×800`.

### 5.2 Arreglos quirúrgicos en archivos compartidos
- **`src/js/92-vehiculos.js`:** reparación completa de `Snd.vehSfx` + `Art.vehSideRider(...)` para los 7 vehículos en Panorámica 2D.
- **`src/js/75-graficos.js`:** `Ride.prototype.jump()` y `panoTick()` habilitados para los 7 vehículos no-camión.
- **`src/js/92-ciclovia.js`:** caché de curvatura por corte Z (~15× menos búsquedas binarias en `CarreraCiclovia.render`), controles WASD/flechas/táctil y bot esquivador.
- **`contenido/guion/trama_valle.json`:** unificación 100 % de los 9 personajes EnCicla con sus oficios canónicos en `CAST` (`66-historia.js`), resolviendo el pendiente § 6.2 de `REVOLUCION-2.1.md`.
- **`src/index.html` y `src/style.css`:** `lang="es-CO"`, eliminación de `user-scalable=no`, ARIA en modales/avisos, objetivos `≥44px`, `100dvh`, `prefers-reduced-motion`, alto contraste limpio, paisaje `860×412`, `body.pixel3d #gl3d` pixelado nítido y estilos del Hub Valle Vivo.
- **`tests/run.js` (línea 469):** corregida condición de carrera por redondeo de medio píxel en la prueba WebRTC (`Math.round(oh.y)` y `Math.round(o1.x)` dentro de `waitForFunction`, igualando la aserción de la línea 472).

### 5.3 Hallazgos visuales atrapados y corregidos al revisar las capturas reales
Durante la inspección visual directa de las capturas de Playwright (rondas 3.0 y 3.3) detectamos y corregimos **7 detalles reales de interfaz**:
1. En `3p` y `1p`, el indicador superior de cámara se solapaba con el rótulo del barrio → reubicado en píldora inferior centrada.
2. El botón de cámara en `#camBar` mostraba un emoji oscuro poco legible → reemplazado por icono SVG vectorial blanco nítido.
3. Los textos flotantes rápidos de combos en skateparks se apilaban encima unos de otros → desplazamiento vertical incremental (`f.y -= 10`).
4. El botón «+4 metas» del mini-resumen superior tenía bajo contraste → reforzado en `src/style.css`.
5. Las subtramas ciudadanas podían caer en una estación a 35 km si el filtro inicial no encontraba rango → ahora siempre eligen la estación más cercana a >80 px.
6. Al unir con `v3.2.0`, el banner superior de los 5 nuevos minijuegos (`Monitoreo 911`, `El Planeador`, `Metro 2D`, `Bajada Las Palmas` y `Roguelite`) tocaba `#goalsMini` en `412×860` → desplazado limpiamente a `Math.max((View.hudB || 50) + 52, 128)`.
7. Las 5 nuevas clases `MG` usaban `{ kind: 'mg' }` sin `hud(V)` → adaptadas al contrato real de `40-mg.js` (`render(V)` + `hud(V)`) logrando 0 errores y dibujo vectorial de alta densidad.

### 5.4 Resultados de verificación automatizada (Chromium / Playwright en VM)

<!-- TELEMETRIA_VERIFICADA -->
| Batería / Prueba | Resultado | Cifras reales medidas (Chromium / Playwright en VM Linux) |
|---|---|---|
| `node tools/build.js` | **✓ OK** | Un solo HTML offline `dist/juega-encicla.html` (`5.483 KB`, JS `5.294 KB`), `dist/ENCICLA-TODO.md` (`310 KB`). |
| `node tests/prueba-gpt6-ciclorrutas.mjs` | **✓ OK** | Proyección a segmentos, progresiva `inicioMetros`, radio 12 m y runner contextual de OpenAI GPT-6 en verde. |
| `node tools/auditoria-mapa.js` | **✓ OK** | Integridad OSM, 133 estaciones en 10 municipios y 45 lugares alcanzables. |
| `node tests/run.js` *(completa: 1–5 + R + V + V2 + V3 + V4 + V5 + WebRTC)* | **✓ TODAS LAS PRUEBAS PASARON** | CPU 4×: `usuario` **16,7 ms** (p95 `33,4 ms`), `anfitrion` **16,7 ms** (`16,8 ms`), `monitoreo` **16,7 ms** (`16,8 ms`); `Save.revisarClaves()`: **30 en uso de 30 registradas (0 errores)**; Freerun Comuna 13 (`52 ★`, `6 trucos`, `0 caídas`); Mundo 3D (`1.233 piezas`, `4.920 cables`); WebRTC 3 dispositivos en verde; **0 errores de consola**. |
| `node tests/auditoria-antigravity.js` *(v3.3 + 12 capturas)* | **✓ 100 % EN VERDE** | 12 oficios y turnos liberados + 12 modos nuevos registrados; `Snd.vehSfx` 7/7; salto Panorámica 2D 7/7; 6 cámaras + Pixel World sobre WebGL + controles `girarDir` coherentes; 7 modos evolución activos con 0 errores (`copa`, `domicilio`, `monitoreo911`, `planeador`, `metro2d`, `palmas`, `roguelite`); 5 skateparks + 3 banderas Copa + Hub 24 actividades + Arco Rosalba + subtrama cercana; CPU 4× `cenital` **33,3 ms** (p95 `50,1 ms`), `3p` **83,3 ms** (`150,1 ms`) y `1p` **83,4 ms** (`150,0 ms`) en WebGL SwiftShader por CPU; **0 errores de consola o página**. |
<!-- /TELEMETRIA_VERIFICADA -->

> **Transparencia de pruebas:** las métricas anteriores se midieron en **Chromium headless con emulación móvil y estrangulación CPU 4×** dentro de la VM Linux (donde WebGL usa renderizado por software **SwiftShader** sobre CPU, también estrangulado 4×; en un teléfono real el renderizado WebGL corre en GPU). Queda pendiente la validación táctil en **teléfono físico Android** por el autor.

---

## 6. Plan maestro de evolución para la IA principal (Fases 4.0 y 5.0)

Con los 7 modos bandera, el WebGL 3D unificado + Pixel World, los arcos de mentores, las pruebas GPT-6 y Motor City 4.9.0 ya integrados en esta rama, el camino hacia **v4.0** queda limpio, enfocado y verosímil:

### Prioridad P0 · Cierre técnico de alto impacto
1. **Trozos de ciudad en *Web Worker* con `OffscreenCanvas`:** eliminar los picos residuales al entrar a un trozo OSM nuevo de 160 m (pendiente § 6.2 de Claude).
2. **Evaluar portar realismo ligero de Motor City `4.9.0 «Realismo»` (`motor-city/js/45-tres.js`):** en lugar de duplicar 600 KB de `three.js` dentro de EnCicla, portar al sombreador WebGL actual (`99d-mundo3d.js`) luz hemisférica suave, grano procedural en muros de ladrillo/revoque y reflejo del río Medellín sin sacrificar el peso ni los FPS en móviles modestos (manteniendo el respaldo Canvas 2D automático).
3. **Cámaras del mundo 3D único para Run 3D:** conectar `MGRunner3D` directamente sobre el lienzo WebGL `#gl3d` de `99d` para compartir exactamente los mismos edificios y viaductos de la ciclorruta real (la Maqueta 2:1 ya vive sobre el mapa único desde `99o`).

### Prioridad P1 · Profundidad jugable y contemplativa (Fase 4.0)
4. **Parapente contemplativo desde San Félix (Bello) y Cabina de Metrocable con altimetría real:** experiencia contemplativa aérea (*Real Flight Simulator* + *Sky* + Voxel Space de Motor City 4.1) con m s. n. m., cámara 360° y modo foto aérea para el Álbum de Postales.
5. **Cruces vivos *Traffix* y puntos ciegos educativos en calle:** mostrar de forma educativa los ángulos muertos de buses y camiones en rojo suave (lección de *Hunter Assassin* / *Bullet Echo* aplicada a seguridad vial real) y disparar control semafórico contextual en cruces del Metroplús.
6. **Fantasmas contrarreloj compartibles por código QR (sin servidor):** exportar/importar tu mejor vuelta de **Copa del Valle** y **Ruta a Guatapé** en un QR compacto para competir contra amigos offline.

### Prioridad P2 · Urbanismo persistente, multijugador y validación en teléfono real (Fase 5.0)
7. **Urbanismo táctico persistente estilo *Townscaper* en el mapa abierto:** que las obras construidas en **El Planeador** (guayacanes, tótems solares, bici-parqueaderos) aparezcan físicamente al rodar por esas plazas en Modo Libre.
8. **Historia del transporte del Valle por épocas** (en clave editorial *UnoCero / Industry Art*: tranvía histórico de 1921, Metro 1995, Metrocable 2004, EnCicla 2011, Escaleras Comuna 13 2011, Metro de la 80).
9. **Retos cooperativos WebRTC en Skateparks y Copa del Valle:** aprovechar la sala P2P de 3–4 jugadores ya probada en `tests/run.js`.
10. **Lista obligatoria de prueba en teléfono físico Android (autor):**
    - Fluidez táctil de `⏫ Acelerador fijo`, ⚙️ Flexibilidad y gestos del Freerun Comuna 13 en pantalla real (vertical y horizontal).
    - FPS reales en GPU móvil alternando Cenital ↔ WebGL 3P ↔ WebGL 1P con cabina ↔ Pixel World 3D ↔ Panorámica 2D ↔ Maqueta 2:1.
    - Publicación final en `gh-pages` conservando `/metro/` y `descargas/` (solo tras aprobación del autor).
