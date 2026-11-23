# Investigación y plan 3.0 · Claude (al día con la 3.3.0)

**22‑nov‑2026 · Claude (Claude Code), una de las tres IA a las que el autor les pidió lo mismo a la vez.** Las otras dos publican su propio documento con su marca en el título; leerlos y unir lo que esté en verde es parte del trabajo (`coord/buzon/`). Mi rama: `ccr-6f184fb6-vtpkye`.

> **El pedido, resumido:** revisar el juego y compararlo con los mejores (sin límite de estilos) para saber qué falta; investigar a fondo jugabilidad, controles, interactividad, juegos grandes con pocos recursos, renderizado y optimización; idear un plan **lógico y verosímil para EnCicla** (ni ideas sin cabida, ni callar las buenas); **arreglar los modos rotos, lentos o engorrosos**; **todo liberado desde el principio**; cada módulo **dentro del mundo abierto** con la misma experiencia; la carrera sin fin **solo en ciclovías**, con giros, calles que se angostan, obstáculos y zonas de trucos y parkour (también en el mundo abierto); y luego **arte y tecnología**: **un solo mundo 3D** con todas sus cámaras, el 2D y el pixel integrados donde mejor jueguen.
>
> **Metas que no se negocian:** arcade, mundo abierto y libre, tutorial opcional. Que sea divertido, que enseñe y que despierte curiosidad. Que genere conciencia y contemplación. Ritmo justo entre la magnitud del mundo y la precisión del tiempo, sin caer en el realismo absoluto.

## 0. Lo que hice en esta ronda (versión 3.0.0, todo probado)
| # | Qué | Archivo | Cómo se probó |
|---|---|---|---|
| 1 | **Auditoría medida** de los 18 modos y de los vehículos con la CPU 4× lenta (como un celular modesto): cuadros por segundo, picos, distancia, velocidad y tiempo perdido | `tests/auditoria-modos.js` | Corre solo: `node tests/auditoria-modos.js --cpu=4` |
| 2 | **Fluidez:** subpasos de física (el reloj del juego sigue al real hasta 0,35 s por cuadro). Antes, cada paso se topaba en 50 ms y a 15 cuadros por segundo todo iba en cámara lenta | `src/js/99a-fluidez.js` | Un cuadro de 200 ms avanza el juego 0,2 s (antes, 0,05). La bici avanza un 15 % más en el mismo tiempo real; el tiempo perdido baja del 21 % al 13 % |
| 3 | **Trozos de ciudad por adelantado**, cuando el procesador está libre (`requestIdleCallback`; en iOS, `setTimeout`) | `99a-fluidez.js` | Menos tirones al avanzar rápido |
| 4 | **⏫ Acelerador fijo** (pedido tuyo en Motor City 4.6.1): con el botón prendido vas a fondo y el joystick solo gira; al soltarlo frena suave. Tecla Q | `99a-fluidez.js` | Acelera sin tocar nada y frena al apagarlo |
| 5 | **Todo liberado** desde el principio: los 9 oficios con sus 3 turnos y la tienda. Se apaga en Más → 🔓 | `99a-fluidez.js`, `60-ui.js` | Todos los oficios y turnos disponibles |
| 6 | **La carrera de la ciclorruta**, a ritmo de carrera: arrancaba a 20 km/h y tardaba 1,3 km en llegar a su punta; ahora arranca a 34 km/h y llega a 65 km/h a los 700 m | `99a-fluidez.js` | 65 km/h a los 750 m |
| 7 | **Los oficios dentro del mundo abierto:** en cualquier estación EnCicla (Anfitrión, Técnico, Limpieza, Apoyo) y en Casa EnCicla (Bodega, Mecánico, Balance, Monitoreo, Supervisor, Rescate y Pausas activas). Se juega **el mismo módulo** del menú y **«🚲 Volver al valle»** te deja donde estabas | `99b-actividades.js` | El flujo completo, de punta a punta |
| 8 | **Carrera sin fin solo en ciclovías:** giros que hay que tomar (flecha 45 m antes), tramos que se angostan con conos, zonas de trucos con rampas (truco en el aire ×combo) | `99c-trucos.js` | El bot hace los 750 m con 3 vidas y toma los giros |
| 9 | **Zonas de trucos en el valle:** 7 plazas (Pies Descalzos, Parque de las Luces, Plaza Botero, Explora, MAMM · Ciudad del Río, Unidad Deportiva de Belén y el Estadio): «🛹 Truco» en bici, skate o patines; a pie, **parkour**; combos y récord | `99c-trucos.js` | Cada truco da puntos |
| 10 | **Un solo mundo 3D:** 🧍 tercera y 👁️ primera persona sobre **el mismo mapa** que la cenital. El piso es el arte 2D de cada trozo; los edificios son los mismos lotes en volumen; los árboles salen donde el 2D pinta las copas. La cámara no se mete en los edificios y el joystick va según la cámara. Sin WebGL, se queda la cenital | `99d-mundo3d.js` | Nombres proyectados, joystick «arriba = adelante» y sin errores en tercera ni en primera persona |

Todo está en `tests/revolucion-encicla.js` (sección V4) y la batería completa (`node tests/run.js`) queda en verde. **Lo que no alcancé, en orden, está en el § 6.**

## 0b. Después: «Retoma, continúa y termina» (versión 3.2.0, todo probado)
Antes de seguir uní lo que publicaron las otras IA: la auditoría de **OpenAI GPT‑6** (la carrera sin fin solo se abre en una ciclorruta y el HUD en km/h) y la **3.1.0 de la otra sesión de Claude** (⚙️ Flexibilidad y Motor City 4.7 y 4.8 en `motor-city/`). Esa unión traía un error: en Controles, tocar una opción **no guardaba** (un comentario a mitad de línea apagaba `Save.save()`); quedó corregido.

| # | Qué | Archivo | Cómo se probó |
|---|---|---|---|
| 11 | **Run 3D del menú:** las hojas no sumaban (★ 0 con 6 hojas): el modo copiaba el puntaje del minijuego en cada cuadro. Ahora suman, y la carrera sale con una **fila de hojas** para puntuar desde el primer segundo. Las **teclas** (flechas, W, S, espacio) no hacían nada: llegaban como evento y el corredor esperaba el nombre de la tecla | `99e-pulido.js`, `99g-freerun.js` | 15 puntos y 6 hojas en 1,5 s; la flecha cambia de carril |
| 12 | **Turnos de varias fases:** el minijuego de una fase (la recepción de la Bodega, por ejemplo) sumaba sus errores pero **no sus puntos**. Ahora sí, y la ★ muestra lo que va mientras juegas | `99e-pulido.js` | La Bodega: ★ 83 durante y después (antes, 0) |
| 13 | **Bodega en el celular vertical:** el estante quedaba bajo la barra de arriba y medio celular era piso vacío. Ahora el estante va bajo el título, la mesa muestra sus cajas, los pasos 1‑2‑3‑4 se ven y **la caja que revisas sale en grande**, abierta, con lo que trae y sus golpes: se revisa mirando | `99e-pulido.js` | Capturas en 412 × 860 |
| 14 | El aviso de la cámara (pellizcar y girar) **tapaba el título de los minijuegos**: ahora solo sale en la ciudad 2D | `88-camara.js` | Capturas |
| 15 | **Transporte en el mundo 3D**, con los mismos datos de la cenital: el **viaducto** del metro (tablero, barandas y columnas en T cada 30 m), las **estaciones elevadas** (andén ancho, cubierta con la franja de la línea y el edificio de acceso), los **puentes** a su altura, los **trenes** (3 vagones de 22 m), el **tranvía**, los buses del **Metroplús** y los **metrocables** (cable doble a 14 m, torres cada 260 m, estaciones y cabinas cada 60 m a 5 m/s). Los carros y tú van **encima** de los puentes (antes quedaban dentro del tablero) | `99f-mundo3d-transporte.js`, `99d-mundo3d.js` | 1.233 piezas en alto, sin errores, en tercera y primera persona |
| 16 | **Fachadas con ventanas** (una fila por piso de 3 m) que **de noche se prenden** al azar, hechas en el sombreador: no pesan nada. Las **sombras** del 3D son las que el arte 2D ya hornea en el piso, con el mismo sol del noroeste | `99d-mundo3d.js` | Capturas de día y de noche |
| 17 | **🧗 Freerun en la Comuna 13** (2D de lado, en pixel): escaleras eléctricas (más rápido) y de cemento, techos con huecos, materas, perros dormidos, chazas, muros y cuerdas de ropa, hasta el mirador; murales al fondo. En el menú (tres niveles) y en el valle | `99g-freerun.js` | El piloto llega al mirador sin caídas, con 52 estrellas y 6 trucos |
| 18 | **Trucos con gesto:** en el aire, deslizar ← → ↑ ↓ o **hacer un círculo** es un truco con nombre (en el freerun y en la carrera de la ciclorruta, donde deslizar también cambia de carril y salta). En el piso del freerun, el gesto se cumple apenas se reconoce, sin esperar a soltar el dedo | `99g-freerun.js` | Los cinco gestos se reconocen y el de la ciclorruta cambia de carril |
| 19 | **📸 Radares** en las 14 ciclorrutas más largas (a más de 1 km uno de otro), con la velocidad equivalente a la real de tu vehículo y tu récord; **🛹 saltos con récord** en las zonas de trucos | `99h-valle-vivo.js` | Récord de 23 km/h en el primer radar |
| 20 | **💪 Habilidades que suben al usarlas:** Pedaleo (km), Resistencia (km en subida), Equilibrio (trucos) y Conocer el valle (barrios). Efectos pequeños y dichos: +1,5 % de punta por nivel, −5 % de lo que frena la loma por nivel y +2 puntos por truco por nivel; solo en el valle y solo para quien juega | `99h-valle-vivo.js` | Los km suman; el bot y las pruebas no cambian |
| 21 | **📔 Tu diario:** lo que haces queda anotado solo (turnos y juegos, récords, barrios nuevos, niveles, miradores). En Más → «📔 Mi diario y habilidades» | `99h-valle-vivo.js` | 7 notas en la prueba y las 4 habilidades en pantalla |
| 22 | **🔭 Miradores** (Cerro Nutibara, El Volador, Las Tres Cruces, Quitasol y el Alto de San Miguel): te sientas arriba y la cámara 3D gira despacio sobre la ciudad viva, con la niebla más lejos y el dato del lugar; el tiempo pasa más rápido | `99h-valle-vivo.js` | La cámara gira, sin errores, y se sale bien |
| 23 | La **auditoría de modos** ahora cuenta los puntos del minijuego en curso y marca si hubo acción | `tests/auditoria-modos.js` | — |

Las pruebas nuevas están en `tests/revolucion-encicla.js` (sección V5) y la batería completa queda en verde.

## 0c. «¿Cómo podríamos mejorar el juego?» → hecho en la 3.3.0
Las cinco mejoras que propuse, en orden de impacto, más la de contenido. Todas probadas (sección V6).

| # | Qué | Archivo | Cómo se probó |
|---|---|---|---|
| 24 | **El perdón en los saltos** (como en Celeste): si tocas «saltar» un instante antes de caer, el salto se guarda y sale al tocar el piso. Antes ese toque se perdía en Run 3D y en la carrera de la ciclorruta, y en el freerun se volvía un truco | `99i-perdon.js` | En los tres, el toque en la bajada salta al caer |
| 25 | **El primer minuto fluido.** Medido con el perfilador y la CPU 4× lenta: cada trozo de ciudad tarda de 24 a 89 ms y el primer cuadro dibujaba todos los visibles de una vez. Ahora la salida del valle se dibuja **mientras estás en el menú**, y el adelanto en el tiempo libre nunca dibuja dos trozos seguidos | `99j-primer-minuto.js` | El primer cuadro bajó de 413 a 219 ms y el peor de los siguientes de 89 a 63 ms (p95 de 37 a 31 ms). En la prueba de rendimiento de la batería (modo libre, CPU 4×), la mediana por cuadro pasó de 33,3 a 16,8 ms: antes, el adelanto dibujaba un trozo en casi cada rato libre |
| 26 | **🧭 Hoy en el valle:** un solo «siguiente» claro sin cerrar nada. Junta las misiones del día, la trama, el boleto, «Un día del valle», los oficios, los vecinos, los radares, los miradores, las zonas de trucos, el freerun y la carrera de la ciclorruta, y propone **tres**: una de historia, una de tu día y una para descubrir, con su distancia. Sale sola solo si no tienes ya un destino, o **al llegar a uno** (el momento de «¿y ahora qué?»); el botón 🧭 la abre cuando quieras. Tocar una pone el destino 📍 | `99k-hoy-valle.js` | Tres sugerencias, tarjeta, botón y destino |
| 27 | **🧪 Modo prueba** (Más): para probar con personas reales, sin internet y **sin nombres**: por partida, el modo, la hora, cuánto duró, cómo acabó (terminó, no pasó o se salió), los puntos, las estrellas, los errores, los cuadros lentos y una carita opcional en los resultados. «Ver» muestra el resumen (dónde se salen, cuántas terminan) y el JSON para copiar | `99m-modo-prueba.js` | La partida queda anotada, sin el nombre del jugador |
| 28 | **Red de seguridad:** el flujo `.github/workflows/pruebas.yml` corre la batería completa en un Chromium real en cada push a `main` y a las ramas de las IA, y en cada pull request; la regla quedó en `CLAUDE.md`: no se publica si no está en verde. Y dos pruebas nuevas: **Controles guarda** (el error de la 3.1.0) y **lo que ve el jugador**: en 17 modos, el número de la pantalla de resultados y la ★ del final coinciden con lo guardado | `.github/workflows/pruebas.yml`, `tests/revolucion-encicla.js` | En verde |
| 29 | **💬 Encargos de los vecinos:** 6 historias de 3 pasos con los personajes que ya viven en el valle (Santi, Doña Luz, Cata, Don Efraín, Wílmar y Don Jairo), con ❗ sobre quien te necesita, la tarjeta con su cara, pasos que piden ir **a pie** o llegar **de noche**, su final, puntos, hojas, el diario y los logros «Buen vecino» y «El valle es mi barrio». El texto está en `contenido/guion/encargos.json`: se escriben más sin programar | `99l-vecinos.js`, `contenido/guion/encargos.json` | La historia de Santi, de punta a punta; el paso a pie no avanza en bici |

## 1. Auditoría: qué estaba roto, qué era lento y por qué
**Cómo se midió.** Chromium con la CPU 4× más lenta (`Emulation.setCPUThrottlingRate`), 412 × 860, tiempo real, una persona simulada con el joystick a fondo sobre una avenida recta.

| Hallazgo | Medido | Causa | Arreglo |
|---|---|---|---|
| **«Los vehículos van lento»** | La bici a 14 cuadros por segundo, picos de 165 ms, el **21–30 % del tiempo real perdido** | El bucle topaba cada paso en 50 ms: cada cuadro lento era cámara lenta | Subpasos (§ 0, n.º 2); la IA del motor llegó a lo mismo en Motor City 4.6 (pasos de 25 ms) |
| **Tirones al avanzar rápido** | p95 de 120–165 ms | Al llegar a un trozo nuevo de 160 m, se dibuja entero en ese cuadro (calles, casas, árboles, rieles) | Trozos por adelantado en el tiempo libre. **Falta:** dibujarlos en un *worker* con `OffscreenCanvas` (§ 6) |
| **«Controles engorrosos»** | Hay que mantener el dedo para avanzar | Ningún modo tenía «acelerar solo» | ⏫ acelerador fijo |
| **La carrera de la ciclorruta, eterna** | 20 km/h al arrancar; 4 min para 1,3 km | `rapidez = min(14, 5,5 + m/160)` | `min(18, 9,5 + m/80)` |
| **Hojas en el carril cerrado** (al agregar los tramos estrechos) | El bot perdía las 3 vidas en 491 m | Lo recogible caía en el carril de conos | Lo recogible pasa al carril abierto |
| **Botones de la bandeja «⋯ Más» que no hacían nada** (v2.1) | `data-i = -1` | Se buscaba la acción por identidad de objeto | Por `id`, con prueba que los toca |
| Modos sin errores pero que se sienten «a medias» | Run 3D: 0 puntos en 4 s; Bodega: 0 en 4 s; Turno en equipo y Monitoreo: sin acción sin red o sin órdenes | Run 3D y Bodega: **puntos que se perdían** (n.º 11 y 12); Turno en equipo y Monitoreo esperan tus órdenes (y el primero, amigos conectados): así está pensado | ✅ 3.2 (§ 0b) |

**Cifras actuales** (después del arreglo, CPU 4×): la bici a ~25 cuadros por segundo con mediana de 26 ms; el camión de Balance a ~27; la Ruta a Guatapé a ~38; la carrera de la ciclorruta y Run 3D a ~60. Sin errores de consola en ninguno.

**Medición de la 3.2** (`node tests/auditoria-modos.js --cpu=4 --seg=4`, otra corrida): la Bodega suma 83 puntos en 4 s (antes, 0) y Run 3D 40 (antes, 0); el freerun, la carrera de la ciclorruta y Run 3D van a 60 cuadros por segundo; el camión a 40, Guatapé a 36 y el modo libre entre 27 y 31. La bici, que se mide primero y en frío (dibujando los trozos de la salida), da entre 17 y 29 cuadros por segundo según la corrida: por eso sigue en el § 6 dibujar los trozos en un *worker*. La prueba de rendimiento de la batería no cambió: mediana de 33,3 ms y p95 de 49,9 ms. Monitoreo y el Turno en equipo esperan tus órdenes: sin ellas no hay acción, como debe ser. Cero errores de consola.

## 2. Qué hacen los mejores y qué le sirve a EnCicla
La regla para cada referencia: **qué hace mejor que nadie → si cabe en un juego familiar de bicis públicas del Valle de Aburrá, cómo → si no cabe, por qué.**

### 2.1 Conducción y carreras
| Referencia | Lo que hace mejor | Para EnCicla |
|---|---|---|
| **Super Arcade Racing** (OutOfTheBit; el más importante para ti) | Carreras cenitales cortas (60 carreras en grupos de 5), derrape y dosificar el acelerador en las horquillas, trampas y hielo, monedas para mejoras desbloqueadas por progreso; personalización enorme ([Pocket Gamer](https://www.pocketgamer.com/articles/081706/five-reasons-to-play-super-arcade-racing-from-outofthebit-studio/), [The Xbox Hub](https://www.thexboxhub.com/super-arcade-racing-review/)). Críticas: la IA que siempre alcanza (*rubber band*) y desbloqueos lentos ([Bonus Stage](https://www.bonusstage.co.uk/archives/178310)) | **Sí, es el modelo de la «Copa del Valle»:** circuitos cortos sobre calles reales (Laureles, Envigado, Ciudad del Río) en la misma cenital, 3 a 5 rivales, trampas del valle (huecos, charcos de aguacero, una chiva atravesada). Mejoras de la bici con hojas. **No copiar:** la IA que siempre alcanza ni los desbloqueos lentos (todo liberado) |
| **#DRIVE**, **PAKO Forever / 2 / 3**, **Getaway 1 y 2** | Partidas de 1 a 3 minutos y una sola regla clara (mantenerse en la vía, escapar). PAKO y Getaway son persecuciones policiales | **La forma sí, la violencia no:** «Domicilio contrarreloj» (llegar antes de que se enfríe el pedido esquivando tráfico) y «La lleva» en red (ya existe). Sin policía ni choques a propósito |
| **Forza Horizon** | El **festival**: el mundo abierto lleno de eventos marcados (carreras, saltos, radares de velocidad, fotos), tableros de habilidad y regresar a donde ibas | **Sí:** el «Festival de la Bici» en el mismo valle: retos marcados donde ocurren (radar de ciclorruta, salto en la rampa del Parque de las Luces, foto en el Coltejer). Las zonas de trucos y los oficios en su lugar ya van en esa dirección |
| **NFS No Limits**, **APEX Racers**, **FR Legends** | Carreras de 30 a 60 s, el garaje y el derrape como habilidad (FR Legends) | Carreras cortas sí (Copa del Valle). **El derrape no**: una bici no derrapa así; en el **skate**, el *powerslide* puede ser su versión |
| **Grand Mountain Adventure 2** (Pixelbite) | Un mundo abierto de montaña con muchísimos retos pequeños repartidos por el mapa, y seguir el ritmo del jugador | **Sí:** micro‑retos en cada barrio (subir Las Palmas sin parar, bajar a Santa Elena sin frenar de más). Encaja con el relieve real |
| **Alto's Odyssey** | Lateral contemplativo: ritmo, trucos encadenados, clima y luz que cambian, sonido que relaja | **Sí, en lateral:** «Bajada por Las Palmas» o «Santa Elena al atardecer» en la panorámica, con trucos y la hora real. Es el modo de **contemplación** que pides |

### 2.2 Mundo abierto, rol y ciudad viva
| Referencia | Lo que hace mejor | Para EnCicla |
|---|---|---|
| **GTA 1, 2 y London** | La cenital legible, misiones desde teléfonos públicos y muchas cosas que hacer en un mapa grande | Ya tenemos la cenital. **Sí:** los «teléfonos» son los tótems de las estaciones: ahí salen encargos. **No:** el crimen |
| **GTA Chinatown Wars** | Una cámara inclinada que se puede girar entre la cenital y el 3D; minijuegos táctiles cortos; el mapa con todo marcado ([Wikipedia](https://en.wikipedia.org/wiki/Grand_Theft_Auto:_Chinatown_Wars), [GameSpot](https://www.gamespot.com/articles/grand-theft-auto-chinatown-wars-hands-on/1100-6203423/)) | **Sí, es nuestra cámara:** cenital, inclinada, tercera y primera persona sobre un mismo mundo (§ 0, n.º 10). Los minijuegos de los oficios son nuestros «tratos» táctiles |
| **GTA San Andreas** | **Habilidades que suben con la práctica** (montar en bici, resistencia), oficios secundarios, radio, gimnasio | **Sí, es el rol que pides:** «Pedaleo», «Resistencia», «Equilibrio» y «Conocer el valle» suben al usarlas (más velocidad, menos gasto, trucos más altos, atajos). Sin la violencia |
| **The Sims** | Necesidades y una historia que nace del jugador | **Sí, a la medida:** energía e hidratación (ya existen); un diario automático «Tu historia en el valle» con lo que hiciste |
| **Sky: Children of the Light** | Lo social amable y contemplativo: ayudar a desconocidos, regalar, luces de otros jugadores | **Sí, como «MMO suave»:** fantasmas de los recorridos de tus amigos (sin servidor: por el código QR que ya existe), regalar hojas y saludarse con el timbre (ya existe en red) |
| **WorldBox**, **Townscaper** | Mirar un mundo vivo y construir sin presión (en Townscaper, sin metas) | **En parte:** «Mirador» para ver la ciudad viva sin jugar (contemplación) y un modo creativo para diseñar tu plaza o tu ciclorruta. **No:** destruir |
| **Cities: Skylines**, **SimCity BuildIt**, **TheoTown** | Planear la ciudad con datos (demanda, flujos, servicio) | **Sí, y ya tenemos la simulación de demanda** (`StationSim`): el «Planeador»: dónde poner estaciones y ciclorrutas, con presupuesto, viendo cómo sube el servicio. Enseña cómo funciona un sistema de verdad |
| **INDUSTRY ART** (tu UnoCero) | Gestión que atraviesa épocas | **Sí:** «Historia del transporte del valle» por épocas: el tranvía de 1921, el Ferrocarril de Antioquia, el Metro de 1995, EnCicla de 2011 y la Línea E que viene. Encaja con El Metro y con la curiosidad |

### 2.3 Gestión, estrategia y rompecabezas (Infinity Games y compañía)
| Referencia | Lo que hace mejor | Para EnCicla |
|---|---|---|
| **Traffix** | Semáforos que se tocan para que nadie choque | **Ya existe** («Semaforero»). Siguiente: los **buses alimentadores y el Metroplús** con sus paradas (los datos llegaron en la v2.1) |
| **Railways** (Infinity Games) | Mover trenes entre vías, recoger pasajeros sin choques, parar exacto junto al andén ([App Store](https://apps.apple.com/us/app/-/id1492002834)) | **Sí, para el metro en 3D cenital:** «Despachador del Metro» con las líneas A, B y T reales. Es más de El Metro: hacerlo juntos |
| **Package Inc** | Repartir paquetes por cintas y desvíos | **Sí, es Balance:** el rebalanceo de bicis entre estaciones como rompecabezas de flujos |
| **Infinity Loop**, **Laser**, **Maze** | Rompecabezas de una sola idea (girar piezas, reflejar, salir) | **Ya hay** Láser y Laberinto. **Infinity Loop sí:** «Conecta la ciclorruta», girando tramos para unir dos estaciones |
| **911 Operator** | Despachar recursos a emergencias sobre un mapa real | **Sí, es Monitoreo:** incidentes reales del sistema (estación llena, bici varada, tótem caído) y a quién mandas |
| **Idle Supermarket Tycoon** | Gestión ociosa con mejoras que se acumulan | **Con cuidado:** Casa EnCicla como negocio que crece mientras pedaleas (talleres, personal, horario). Sin compras con dinero real |
| **The Bonfire: Forsaken Lands** | Gestión de una aldea con día, noche y recursos | En parte: la ronda de Casa EnCicla del día y la noche (preparar bicis de madrugada, recogerlas de noche) |
| **Tiny Rails** / el «Train Chu» que citas (no encontré un juego con ese nombre de Tiny Titan Studios; Tiny Rails es su juego de trenes, [Pocket Gamer](https://www.pocketgamer.com/tiny-rails/tiny-rails-is-a-no-fuss-pixellated-train-sim-out-now-on-ios-and-android)) | Tren lateral en pixel art con vagones y pasajeros | **Sí, el metro en 2D lateral:** el viaje en metro entre estaciones, en pixel, mientras llevas la bici (el «viaje de punta a punta con el Metro») |
| **Monument Valley** | Geometría isométrica imposible como rompecabezas | **En parte:** rompecabezas en la maqueta 2:1 con los hitos (girar la Plaza Botero para conectar caminos) |

### 2.4 Acción, sigilo y plataformas (con la vara de todo público)
| Referencia | Lo que hace mejor | Para EnCicla |
|---|---|---|
| **Hunter Assassin**, **Bullet Echo** | Lectura cenital: conos de visión que se cortan en los muros | **Ya adoptado** como lectura (el farol de la bici). Juego: «La lleva» o «escondidas» en un parque. **No:** asesinar |
| **Vector**, **Shadow Fight 2**, **Gun Fu: Stickman 2** | El *freerun* lateral de Vector (saltar muros, deslizarse); combates | **Vector sí, a pie:** «Parkour en las escaleras de la Comuna 13», en 2D lateral; ya existen las escaleras eléctricas en el mapa. **No:** pelear ni disparar |
| **Soul Knight** | El roguelite corto: partidas de minutos, mejoras al azar, volver a intentar | **Ya hay mejoras de roguelite** en los oficios. Siguiente: «Turno roguelite»: 5 turnos encadenados con 3 mejoras al azar y una sola vida |
| **Little Nightmares** | La luz y la atmósfera 2,5D | La atmósfera sí (noche, lluvia, alumbrados). El miedo no |
| **Skate Space** | Trucos y parques creados por la gente; las críticas piden trucos manuales, no automáticos ([gamebrain](https://gamebrain.co/game/skate-space)) | **Sí:** las zonas de trucos de esta ronda. Siguiente: trucos con gesto (deslizar arriba, abajo o en círculo) en vez de uno al azar |
| **Missiles!**, **1945 Air Force**, **Solar Smash** | Esquivar en tiempo real; destruir planetas | **No caben** (guerra y destrucción). La parte buena, esquivar, ya está en las carreras |
| **Real Flight Simulator**, **Spaceflight Simulator** | La sensación de volar | **Sí, con algo real del valle: parapente** desde San Félix (Bello), con el Voxel Space que trae Motor City 4.1. Es contemplación pura. **No:** cohetes |

## 3. Investigación transversal
### 3.1 Ritmo: la magnitud del mundo contra la precisión del tiempo
- **El tiempo del juego no es el real, pero debe ser constante.** Los subpasos (de 50 ms como mucho; solo se agregan cuando un cuadro pasa de 50 ms, así no hay «espiral» de pasos) dan el mismo recorrido a 15 o a 60 cuadros por segundo. Es la regla de los motores de física («fix your timestep»).
- **La compresión es explícita:** en la Ruta a Guatapé el paisaje corre ×4 y el reloj del día también, y la velocidad que se muestra es la real (30 km/h en plano). En el modo libre el reloj de los oficios ya corre más lento que el recorrido. **La regla para todo modo nuevo: cada viaje típico entre 30 y 90 s reales.**
- **Velocidades de referencia (CPU 4×, medidas):** bici a ~25 cuadros por segundo; con subpasos, 257 m en 5 s. Los vehículos del Taller tienen cifras parecidas (`VSTATS`); lo que los hacía sentir lentos era el tope de 50 ms, no sus cifras.
### 3.2 Controles táctiles
- **Un pulgar o dos:** joystick fijo a la derecha más acciones según el contexto (v2.1), y ahora ⏫ a la izquierda: un pulgar acelera y el otro gira, como en los juegos de carreras para celular.
- **En las carreras sin fin:** deslizar o tocar los lados (ya está); los giros se toman con la misma acción que cambiar de carril, así no hay un gesto nuevo que aprender.
- **Ayudas que se apagan** (asistencia de esquinas, acelerador fijo): diseñadas, medidas y con interruptor, como recomienda la investigación de asistencias en juegos de carreras (ver `motor-city/docs/INVESTIGACION-MANEJO.md`).
- **Retroalimentación háptica corta** (12–30 ms) solo en lo que importa: un golpe, un truco, un hueco.
### 3.3 Interactividad aplicada
- **Una acción del momento, no un menú de 8 botones** (v2.1). Cada lugar ofrece lo suyo: la estación, «Oficios aquí»; la plaza, «Truco»; el monumento, «Foto».
- **El mundo responde:** los conos se caen, el polvo sale en la tierra, los buses esperan al ciclista, los vecinos saludan al timbre.
- **Lo que se aprende va pegado a lo que se hace:** el dato de la estación al detenerse junto a ella; lo poco conocido del embalse en la fonda.
### 3.4 Juegos grandes con pocos recursos
1. **Datos reales en vez de arte a mano:** el mapa sale de OpenStreetMap, Overture y el catastro (693 mil edificios). Es el mayor «contenido gratis» del juego.
2. **Sistemas que se combinan en vez de niveles hechos a mano:** la demanda de bicis, el tráfico, el clima y la hora generan situaciones nuevas cada vez.
3. **Un arte, muchas vistas:** el mismo dibujo 2D del trozo es la cenital, el piso del 3D y la textura del mapa grande. Esta ronda lo hizo con el 3D.
4. **Semillas (Elite):** nombres, encargos y rutas que salen de una semilla, sin guardar nada.
5. **Contenido en datos** (JSON de la trama, datos de El Metro): una IA de historia agrega contenido sin tocar el código.
6. **Reusar entre juegos hermanos:** la red de El Metro ya llegó por un script (`tools/red_metro.js`).
### 3.5 Renderizado y optimización
| Técnica | Estado en EnCicla | Siguiente paso |
|---|---|---|
| Caché de trozos de 160 m (Canvas 2D) | Sí | Dibujarlos en un *worker* con `OffscreenCanvas` (Baseline en Chrome; en Safari 16.4+), con respaldo actual |
| Presupuesto de trabajo por cuadro | 1 trozo nuevo por cuadro, y ahora por adelantado | Dibujar el trozo por capas, en varios cuadros |
| Resolución dinámica | Sí (`Calidad`, 97-motor30) | Que también baje la del lienzo WebGL (ya usa `View.calidad`) |
| WebGL por trozo: una malla de edificios y una textura de piso por trozo, con reemplazo del más viejo (LRU), niebla para esconder el borde | Sí (esta ronda) | Instancias para árboles y carros (`ANGLE_instanced_arrays`); nivel de detalle; sombras horneadas en el piso |
| Tiempos de cuadro en p95, no promedios | Sí (pruebas y auditoría) | Telemetría en el juego (Motor City trae `MC.Telemetria`) |
| Paso fijo de física | Sí (esta ronda) | — |
### 3.6 Cómo integrar el 3D, el 2D y el pixel (un solo mundo)
- **El 3D es el mundo** (las cámaras cenital, inclinada, tercera y primera persona). **El 2D es la piel del 3D** (el piso de cada trozo) y su respaldo sin GPU. **El pixel es un estilo** para los modos que juegan mejor así (los minijuegos de los oficios, Run 3D, la panorámica).
- **Lo lateral para lo que se juega mejor de lado:** la panorámica, el metro de Tiny Rails, el *freerun* de Vector, la bajada de Alto. Cada uno es una cámara sobre un **tramo real** del mismo mapa (la panorámica ya sigue la ruta real).
- **Coherencia de las vistas:** cada vista debe decir qué es y para qué sirve. Hoy hay cosas que no la tienen. Run 3D tiene corredores que no son del mapa; la maqueta 2:1 es otro dibujo. **Plan:** que Run 3D use la cámara de primera persona del mundo 3D sobre la ciclorruta real, y la maqueta, una cámara isométrica del mismo mundo.

## 4. El plan: ideas y sugerencias, con su lugar en EnCicla
**Estado:** ✅ hecho en 3.0 · 🔜 siguiente (vale mucho, cuesta poco o medio) · 🗓️ después (grande). Esfuerzo: S (horas), M (un día), L (varios días).

### 4.1 Arreglar y pulir lo que ya existe (primero)
| Idea | Por qué | Estado |
|---|---|---|
| Plantilla de prueba por modo: arranca, se mueve en menos de 1 s, se termina, sin errores y a más de 25 cuadros por segundo con CPU 4× | La auditoría mostró modos que «se sienten a medias» sin estar rotos | ✅ 3.2: `tests/auditoria-modos.js` cuenta los puntos del minijuego y marca la acción |
| Run 3D: que arranque en movimiento y sume puntos visibles desde el primer segundo | 0 puntos en 4 s | ✅ 3.2 |
| Bodega y Turno en equipo: un arranque que no espere | 0 acción en 4 s | ✅ 3.2 (Bodega); el Turno en equipo espera a tus amigos |
| Dibujar los trozos en un *worker* | Los picos de 120 ms que quedan | 🗓️ M |
| Trucos con gesto (arriba, abajo, círculo) | Skate Space: los jugadores piden trucos manuales | ✅ 3.2 (freerun y ciclorruta) |

### 4.2 Diversión (arcade, acción, contra el reloj)
| Idea | Referencia | Lugar en EnCicla | Estado |
|---|---|---|---|
| **Copa del Valle:** circuitos cenitales cortos en calles reales, con rivales y trampas del valle | Super Arcade Racing | En el mundo abierto, con su bandera en el mapa | 🔜 M |
| **Domicilio contrarreloj** | #DRIVE, PAKO (sin policía) | Desde los restaurantes del mapa | 🔜 M |
| **Radares de ciclorruta y saltos con récord** | Forza Horizon | Marcados en el valle | ✅ 3.2 |
| **Carrera sin fin con giros, tramos estrechos y zonas de trucos** | Subway Surfers, Alto | Solo en ciclovías | ✅ |
| **Zonas de trucos y parkour** | Skate Space, Vector | 7 plazas reales | ✅ |

### 4.3 Conciencia y aprendizaje
| Idea | Lugar | Estado |
|---|---|---|
| Datos de cada estación al detenerte | 91 estaciones de El Metro | ✅ (v2.1) |
| **El Planeador:** dónde poner estaciones y ciclorrutas, con presupuesto, viendo el servicio (con `StationSim`) | Modo estrategia | 🗓️ L |
| **Historia del transporte del valle por épocas** (a la manera de tu INDUSTRY ART) | Álbum y modo | 🗓️ L |
| Monitoreo como 911 Operator: incidentes reales del sistema | Oficio Monitoreo | 🔜 M |
| La ley de los 1,5 m, el casco y las luces, mostrados donde importan | Ya en Guatapé; llevarlo al valle | 🔜 S |

### 4.4 Contemplación
| Idea | Lugar | Estado |
|---|---|---|
| **Parapente desde San Félix** (Voxel Space de Motor City) | El norte del valle | 🗓️ M |
| **Bajada lateral por Las Palmas al atardecer** | Panorámica sobre la vía real | 🔜 M |
| **Mirador:** ver la ciudad viva sin jugar | Cerro Nutibara, El Volador, Tres Cruces, Quitasol, Alto de San Miguel | ✅ 3.2 |
| Primera persona en el mundo 3D único | Todo el valle | ✅ |

### 4.5 Rol y «MMO suave» (subtramas que dan historia propia)
| Idea | Cómo | Estado |
|---|---|---|
| **Habilidades que suben al usarlas:** Pedaleo, Resistencia, Equilibrio, Conocer el valle | GTA San Andreas; se guardan con `Save.registrar` | ✅ 3.2 |
| **Vecinos con encargos encadenados** (los 15 de la trama y los de El Metro): 3 a 5 encargos cada uno, con su final | Contenido en `contenido/guion/*.json` | ✅ 3.3: 6 historias en `encargos.json`; faltan 9 vecinos |
| **Reputación por barrio** (te saludan, te avisan de atajos) | Sobre lo que ya hay de saludos y charlas | 🗓️ M |
| **Tu historia en el valle:** un diario automático de lo que hiciste | The Sims, Sky | ✅ 3.2 |
| **Fantasmas de tus amigos** por código QR, sin servidor | Sky | 🗓️ M |

### 4.6 Gestión, estrategia y rompecabezas
| Idea | Referencia | Estado |
|---|---|---|
| Despachador del Metro (líneas A, B y T reales), junto con El Metro | Railways | 🗓️ L |
| Alimentadores y Metroplús con sus paradas, como Traffix | Traffix | 🔜 M (los datos ya están) |
| Conecta la ciclorruta | Infinity Loop | 🔜 S |
| Rebalanceo de bicis como cintas y desvíos | Package Inc | 🔜 M (es Balance) |
| Casa EnCicla que crece mientras pedaleas, sin dinero real | Idle Supermarket Tycoon | 🗓️ M |
| Turno roguelite: 5 turnos seguidos, 3 mejoras al azar, una vida | Soul Knight | 🔜 S |

### 4.7 Lo que **no** cabe (y por qué)
- Armas, peleas, policía, explosiones y destrucción (GTA, Shadow Fight, Gun Fu, Bullet Echo, Missiles, 1945, Solar Smash): **el juego es para todo público**.
- El derrape de carro (FR Legends) en la bici: no es verosímil. Su lugar es el *powerslide* del skate.
- Cohetes (Spaceflight Simulator): no tienen relación con el valle. El vuelo que sí la tiene es el parapente.
- Desbloqueos lentos y la IA que siempre alcanza: el autor pidió todo liberado y el juego justo.

## 5. Para las otras dos IA (coordinación)
- **Lo que reportaron y ya está unido (22‑nov, 20:30 UTC):** OpenAI GPT‑6 (`docs/EVOLUCION-ENCICLA-OPENAI-GPT6.md`: la carrera sin fin solo desde una ciclorruta, el km/h del HUD y su CI) y la otra sesión de Claude (EnCicla 3.0.1 y 3.1.0 en `main`, Motor City 4.7 y 4.8 en `motor-city/`). De Gemini no hay rama en este repositorio todavía; en el motor, Claude le respondió en `motor-city/coord/buzon/`.
- **Mis zonas:** `src/js/99a-*.js` a `99m-*.js`, `tests/auditoria-modos.js` y este documento. Libres: `99n` a `99y` y sus `docs/*-<marca>.md`.
- **Para no repetir:** de § 4, yo seguiría con lo de § 4.1 (pulir modos), los radares y saltos, el diario y las habilidades. Sugiero que una IA tome **Copa del Valle + Domicilio contrarreloj** y la otra **Planeador + Monitoreo como 911 Operator**. Avisen en `coord/buzon/` antes de empezar.
- **Cómo probar:** `node tools/build.js && node tests/run.js` (todo en verde) y `node tests/auditoria-modos.js --cpu=4` para medir.

## 6. Lo que falta (en orden; lo hecho está en § 0b y § 0c)
1. **Probar con personas reales** con el 🧪 modo prueba: tres rondas cortas de 5 personas, niños y adultos por separado, y un celular modesto (Android 7 o iPhone 8).
2. Más encargos: los otros 9 vecinos (Yuli, Kevin, la ingeniera Paola, Wílson, Don Rubén, Doña Marleny, Don Libardo, Jhon y Rosalba, que ya tiene su boleto) en `contenido/guion/encargos.json`.
3. Publicar desde un flujo con las pruebas en verde que conserve `/metro/` (hoy se publica a mano; la regla ya está en `CLAUDE.md`).
4. Que Run 3D y la maqueta usen las cámaras del mundo 3D único (hoy tienen las suyas).
5. Dibujar los trozos en un *worker* con `OffscreenCanvas`, o por partes en varios cuadros: el primer minuto mejoró, pero un trozo nuevo todavía cuesta de 24 a 89 ms en un celular lento.
6. Lo del § 4 que sigue en 🔜: Copa del Valle y Domicilio contrarreloj, Monitoreo como 911 Operator, la ley de los 1,5 m en el valle, la bajada lateral por Las Palmas, los vecinos con encargos, alimentadores y Metroplús como Traffix, Conecta la ciclorruta, el rebalanceo como Package Inc y el turno roguelite.
7. Probar en un celular real: el acelerador fijo, la tercera persona, el mirador, el freerun con gestos, la carrera con giros y el perdón en los saltos (aquí solo hay Chromium con la CPU 4× lenta).

## Fuentes
- Super Arcade Racing: [Pocket Gamer](https://www.pocketgamer.com/articles/081706/five-reasons-to-play-super-arcade-racing-from-outofthebit-studio/), [The Xbox Hub](https://www.thexboxhub.com/super-arcade-racing-review/), [Bonus Stage](https://www.bonusstage.co.uk/archives/178310).
- Railways (Infinity Games): [App Store](https://apps.apple.com/us/app/-/id1492002834), [TouchTapPlay](https://www.touchtapplay.com/manage-trains-and-passengers-in-rail-management-game-railways-now-available-on-ios/).
- GTA Chinatown Wars: [Wikipedia](https://en.wikipedia.org/wiki/Grand_Theft_Auto:_Chinatown_Wars), [GameSpot](https://www.gamespot.com/articles/grand-theft-auto-chinatown-wars-hands-on/1100-6203423/).
- Tiny Rails (Tiny Titan Studios): [Pocket Gamer](https://www.pocketgamer.com/tiny-rails/tiny-rails-is-a-no-fuss-pixellated-train-sim-out-now-on-ios-and-android).
- Skate Space: [App Store](https://apps.apple.com/us/app/id1466582074), [gamebrain](https://gamebrain.co/game/skate-space).
- No encontré `cityrt.com` ni un «Train Chu» de Tiny Titan Studios: si el autor confirma qué son, se agregan.
- El perdón en los saltos: [Celeste & Forgiveness (Maddy Thorson)](https://maddymakesgames.com/articles/celeste_and_forgiveness/) y [Blizzard Watch](https://blizzardwatch.com/2020/03/13/celeste-developer-game-feel/).
- Probar con personas: [Why You Only Need to Test with 5 Users (NN/g)](https://nngroup.com/articles/why-you-only-need-to-test-with-5-users/) y [MeasuringU](https://measuringu.com/five-users/).
- Muchas opciones no paralizan en promedio: [Scheibehenne, Greifeneder y Todd, 2010](https://abcwest.cogs.indiana.edu/pmwiki/pdf/scheibehenne.options.2010.pdf).
- Escaleras eléctricas de la Comuna 13 (diciembre de 2011, seis tramos, 384 m): [Alcaldía de Medellín](https://www.medellin.gov.co/es/sala-de-prensa/noticias/las-escaleras-electricas-de-la-comuna-13-de-medellin-recibieron-mantenimiento-integral/), [ABC News / AP](https://abcnews.go.com/blogs/technology/2011/12/infamous-colombian-city-gets-giant-outdoor-escalator); la equivalencia de unos 28 pisos es de la prensa ([Voz de América](https://www.vozdeamerica.com/a/escalera-mecanica-para-pobres-medellin-136263718/107531.html)).
- Las demás referencias (GTA 1, 2 y San Andreas, Forza Horizon, Alto's Odyssey, Sky, Monument Valley, Townscaper, WorldBox, Vector, Soul Knight, 911 Operator, Idle Supermarket Tycoon, Package Inc, Traffix, Infinity Loop, Grand Mountain Adventure 2, Hunter Assassin y los simuladores de vuelo) se analizaron por su diseño público. De sus juegos solo se toman ideas, nunca su arte.
