# MOTOR CITY — DOCUMENTO MAESTRO UNIFICADO DE REFERENCIAS, PESO, VIDA Y ARQUITECTURA

**Versión:** 1.0 de unificación · **Fecha:** 19 de noviembre de 2026  
**Fuentes fusionadas:** `ENTREGA-REELS.md` (análisis anterior) + `Referencias y Arquitectura para Motor City.md` (reporte de Gemini) + videos MP4 adjuntos en ambas entregas.  
**Producto objetivo:** motor/sistema de videojuego de mundo abierto orientado primero a teléfonos móviles, con arquitectura reutilizable en PC y adaptadores para otros motores.  
**Naturaleza del archivo:** documento de diseño, investigación visual, especificación preliminar y plan de implementación; no es código ni certificación de rendimiento.

## Índice

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

## 1. Resumen ejecutivo

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

## 2. Método, alcance y fiabilidad

**Niveles usados para las afirmaciones:**

- **Directa:** se inspeccionaron fotogramas del MP4 adjunto; permite describir lo visible, **no** verificar motor, código, shaders, físicas o cifras de rendimiento.
- **Indirecta:** se dispone de una descripción externa que vincula un identificador de Instagram con un proyecto; no sustituye el metraje.
- **Solo Gemini:** descripción proporcionada por el segundo informe, útil para hipótesis de diseño pero sin video verificable en los adjuntos disponibles.
- **Propuesta Motor City:** decisión o técnica sugerida por los análisis, que **no afirma** ser exactamente la usada en la referencia.

**Reconciliación:** El reporte de Gemini contiene interpretaciones más específicas (p. ej., *Wave Function Collapse*, ECS de 1000 NPC, sombreado concreto, simuladores en WebGL, formato MIT y generación en 0,08 s) que la inspección visual no puede demostrar. Se conservan en las fichas para no perder sus ideas, pero quedan clasificadas como **hipótesis o afirmaciones del reporte, no como hechos verificados**. El análisis anterior, más conservador, se conserva para describir qué sí se ve y qué no se sabe.

**Por qué hay varias tablas:** las **25 fichas** agrupan temáticamente los materiales de Gemini; las **14 URLs** conservan exactamente el alcance del encargo original; el **registro de clips** documenta el respaldo audiovisual. No sumar tablas como si representaran proyectos distintos.

---

## 3. Referencias de Gemini: 25 fichas completas

> **Procedencia de todas las filas de este apartado:** texto del documento de Gemini, reproducido en detalle y reorganizado en tres grupos. La columna “técnica” describe **lo que Gemini interpreta que parece utilizar**; por sí sola no verifica una implementación. La columna final representa **ideas para Motor City**, no una orden de copiar arte ajeno.

### Bloque A — Fichas R01–R10

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

### Bloque B — Fichas R11–R18

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

### Bloque C — Fichas R19–R25

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

## 4. Trazabilidad y grado de comprobación de las 25 fichas

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

## 5. Registro íntegro de los 14 enlaces originales de Instagram

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

## 6. Análisis audiovisual anterior: nueve MP4 (seis proyectos, dos juegos y un collage)

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

## 7. Inspección directa: mapa de 17 fichas con evidencia en videos

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

## 8. Las cinco técnicas más útiles: convergencia de ambas evaluaciones

La priorización combina **frecuencia cualitativa de rasgos visibles**, relevancia para el objetivo «peso + vida» y viabilidad móvil. No es un conteo estadístico de mecanismos ocultos.

| Orden | Técnica unificada | Peso que añade | Vida que añade | Implementación mínima móvil | Escalado futuro |
|---|---|---|---|---|---|
| **1** | **Física perceptual y feedback táctil**: inercia, contactos, suspensión, hitstop, recuperación, sonido, polvo | Aceleraciones, apoyo de ruedas/pies, retroceso y choques legibles | Objetos y personajes reaccionan al jugador | Actualización fija, 1 vehículo + 1 personaje + perfiles de materiales, desaceleración coherente, cámaras suaves | Simulaciones de neumáticos avanzadas, destrucción controlada, ragdoll cuando proceda |
| **2** | **Ambiente dinámico coherente**: día/noche, clima, viento, materiales mojados, luces reactivas | Faros y sombras comunican escala y velocidad | Peatones, luz, vegetación, clima y audio cambian juntos | Reloj global, estados de clima, viento simple, luces selectivas, 3–5 eventos locales | Estaciones, microclimas, iluminación y audio espacial más completos |
| **3** | **Animaciones contextuales y estados reactivos**: IK, gestos cotidianos, sprites, objetos funcionales | Agarrar, subir, frenar, caer, reparar y activar tienen peso | NPC no parecen estatuas; señales e interfaces responden | Máquina de estados y pequeñas transiciones con pooling | IK completo, animación procedural y comportamiento más rico |
| **4** | **Estilo artístico escalable**: low/mid-poly, cel-shading selectivo, pixel 3D, niebla, filtros | Lectura de masas, escala y profundidad | Densidad aparente de ciudad y atmósfera | Siluetas claras, sombras baratas y filtros opcionales | Materiales y reflejos superiores con el mismo estado lógico |
| **5** | **Simulación desacoplada y streaming**: agentes por niveles, sectores, APIs declarativas | El soporte y el contacto siguen reglas pese a cambios de cámara/calidad | Persistencia, tráfico, población y eventos fuera de pantalla | Sectores + estado resumido + entradas/salidas versionadas | Motor externo, ECS o técnicas de mayor escala según perfiles |

**Referencias cruzadas:** R01/R11/R12/R19 enfatizan contacto y sensación de masa; R14/R19/R22 enfatizan vida ambiental; R17/R23/R24/R25 muestran filtros o lenguajes gráficos; R15/R16/R18 aportan ideas para edición y mundo modular; R20/R21 aportan visualización y depuración. En R18 las afirmaciones técnicas dependen de Gemini, no de un video inspeccionado.

### 8.1. Priorización original del análisis anterior (conservada)

> **Muestra efectiva:** seis demostraciones del compilado + los dos clips de juegos = **ocho propuestas visuales diferentes**, con observación por fotogramas; los recuentos orientativos no equivalen a auditoría de código ni a frecuencias de los 14 enlaces de Instagram. **Más repetida** y **más importante para el juego** son criterios distintos.

| Prioridad | Técnica / patrón visual | Presencia cualitativa en la muestra | Por qué importa en móvil | Implementación propuesta |
|---|---|---|---|---|
| **1** | **Estados visibles que evolucionan en el tiempo** | Muy frecuente: incendio, ajedrez, campos, corazón, poesía, escalada, calle nevada. | Genera sensación de mundo activo sin exigir más polígonos. | Máquina de estados, transiciones y eventos programados; diferenciar simulación cerca del jugador y decorado lejano. |
| **2** | **Respuesta visual inmediata a una acción o cambio de parámetro** | Frecuente: trazos que transforman el pueblo (*Town Brush*, fuente externa), posiciones, capas médicas, campos y acciones del personaje. | El jugador interpreta que sus decisiones tienen efecto. | Entrada → cambio de estado → animación → sonido → persistencia opcional. Presupuesto de reacción perceptual bajo. |
| **3** | **Cámara y lectura de profundidad/escala** | Frecuente: terreno 3D, imanes, corazón 3D, escalada y escena urbana isométrica. | Permite sentir distancias y alturas sin gráficos hiperrealistas. | Cámara con límites, seguimiento amortiguado, horizonte legible, parallax y controles consistentes. |
| **4** | **Capas ambientales animadas y efectos de atmósfera** | Presente en varios: fuego, poemas, nieve, cielo/bruma de montaña. | La vida ambiental puede costar menos que añadir más NPC con IA completa. | Partículas por zonas, shader simple de viento, niebla por distancia, audio ambiental y variación temporal. |
| **5** | **Contacto, suspensión y movimiento dependiente de la superficie** | Evidencia concentrada en la escalada; indicios de interacción vehículo–suelo en el clip urbano. No es el patrón más frecuente, **pero sí el más importante para lograr «peso»**. | Una caída o un aterrizaje creíbles afectan más que duplicar calidad de texturas. | Controlador cinemático robusto o cuerpo rígido calibrado, reacción de cámara, animación por contactos y audio/materiales. |

**Importante:** no hay base para afirmar que «sacudida de cámara», «ragdoll», «física de suspensión real», «sombras en tiempo real» o «animación cuadro a cuadro» estén implementadas en determinados videos. Son técnicas **propuestas**, no observadas de manera concluyente.

### 8.2. Priorización original de Gemini (conservada como comparación)

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

## 9. Lenguaje visual, paletas y mecánicas del informe de Gemini

La siguiente selección conserva las cinco paletas y los seis grupos de mecánicas del informe original. Son **opciones de dirección artística y diseño**, no requisitos simultáneos: aplicar todos los filtros o sistemas a la vez sobrecargaría una primera versión.

### A. Paletas de Color Recomendadas por Atmósfera
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

### B. Mecánicas, Sistemas y Herramientas Clave a Integrar
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

### 9.1. Identidad propia recomendada

- **Base visual coherente:** proporciones estilizadas realistas, materiales claros, iluminación horaria creíble, siluetas de vehículo legibles, señales de tráfico y UI funcional. Esta base puede adoptar un filtro cómic/pixel/retro sin sustituir toda la dirección artística.
- **Color al servicio de información:** luces de freno, intermitentes, semáforos y alertas se distinguen incluso si un filtro estilístico cambia la paleta; ofrecer ajustes de accesibilidad.
- **Evitar la copia literal:** los videos son referencias de principios técnicos, no licencias para reproducir personajes, diseños, escenas o nombres de otros creadores.
- **Paquetes y filtros:** los estilos “Default / Comic / Vintage / CRT / Pixel” son un **sistema configurable**, no la promesa de que todos mantendrán idéntico rendimiento; medir su coste real.

---

## 10. Sistema central: cómo lograr «peso» real y perceptible

**Principio:** el peso percibido es una combinación de **dinámica de movimiento + contactos + animación + cámara + sonido**. Aumentar la gravedad por sí solo puede hacer que los controles sean desagradables.

### 10.1. Movimiento de personajes

- **Aceleración y desaceleración graduales:** distinguir caminar, correr, frenar y girar; curva ajustable por tipo de personaje, superficie y habilidad.
- **Velocidad angular y giro del cuerpo:** pies y torso no rotan instantáneamente en cambios bruscos; anticipación moderada, sin sacrificar respuesta al toque.
- **Contacto con el suelo:** comprobación de pendiente, adherencia, límite de escalón, deslizamiento y sonido por superficie.
- **Saltos/caídas:** altura y duración calculadas; al aterrizar, absorber el impacto con rodillas, desplazamiento leve de cámara y sonido proporcional a la velocidad vertical.
- **Agarres y trepada (si son mecánicas del juego):** definir puntos válidos, alcance, estados de cansancio opcionales y transición clara al suelo. Evitar movimientos que atraviesen paredes.
- **Golpes:** animación de anticipación, contacto definido, impulso/cambio de velocidad razonable y reacción proporcional. Pausa de impacto muy breve **solo cuando encaje**; en móviles no debe bloquear la entrada ni repetirse excesivamente.

### 10.2. Vehículos y objetos

- Parámetros por tipo: masa, aceleración, frenado, fricción, agarre lateral, velocidad de giro y recuperación después de choque.
- Para vehículos: modelo simplificado de suspensión/rueda y balanceo visual; **física real completa solo si la jugabilidad la exige**.
- Objetos: evitar que todos reboten igual; usar materiales con coeficientes distintos, umbrales de reposo y deformación visual controlada.
- Audio: frenada, impacto, roce, pasos, arrastre y reverberación por tipo de entorno. El sonido informa de la fuerza del contacto.

### 10.3. Cámara que comunica masa sin marear

- **Seguimiento amortiguado** en vez de «pegar» la cámara al personaje.
- Reacción a aterrizajes e impactos mediante *impulsos cortos*, con intensidad limitada y opción de reducir/desactivar sacudidas.
- Ajustar distancia/altura según velocidad, obstáculo, interiores y conducción.
- Evitar vibración constante, desenfoque agresivo y cambios abruptos de FOV. Dar prioridad a accesibilidad y legibilidad en pantallas pequeñas.

### 10.4. Regla de calibración

> Si el movimiento parece pesado pero los controles se sienten lentos, Motor City está fallando. La meta es **respuesta inmediata del control, acompañada de inercia y recuperación convincentes**.

## 11. Sistema de «vida» para un mundo abierto móvil

### 11.1. Capas de simulación

| Capa | Comportamiento cercano al jugador | Comportamiento lejano / fuera de pantalla | Ejemplo visible |
|---|---|---|---|
| **Ambiental** | Hojas, polvo, viento, lluvia y charcos activos | Estado climático y semillas de efectos, sin partículas individuales | El viento mueve vegetación próxima y un letrero oscila. |
| **Población** | NPC con percepción local, navegación y animación | Horarios y ubicaciones agregadas, sin simular cada paso | Gente cambia de ruta, reacciona al clima y retoma rutinas. |
| **Tránsito** | Vehículos con evitación de colisiones y comportamiento vial | Flujo abstracto por vías/sectores | Semáforos, frenadas y rutas coherentes. |
| **Audio** | Emisores 3D en función de distancia y obstáculos, según soporte | Ambientes mezclados por zona, sin cientos de emisores | Rumor de avenida, pájaros en parque, lluvia bajo techo. |
| **Estado de mundo** | Objetos rotos, reparados, recogidos o activados | Registro resumido de cambios persistentes | Un grafiti o vehículo permanece cambiado después de volver. |
| **Tiempo y luz** | Transiciones coherentes de sombra/luz en puntos prioritarios | Parámetros globales de ciclo diario | Cambio progresivo de tonalidad, farolas al anochecer. |

### 11.2. Sistema de eventos de vida

Formato conceptual: `Estímulo → regla → cambio lógico → representación audiovisual`.

- `VientoFuerte` → el sistema asigna intensidad por distrito → vegetación y telas próximas se inclinan → partículas/audios se ajustan.
- `VehiculoFrena` → se desacelera su estado físico → balanceo visual y luces de freno → sonido según velocidad y pavimento.
- `PersonaSaluda` → IA cambia a interacción → animación breve, mirada hacia jugador → respuesta si el jugador se acerca.
- `EmpiezaLluvia` → humedad por zona → reflejos y salpicaduras cercanos → los NPC modifican rutas o velocidad.
- `ChoqueLeve` → impacto materializado → pequeña deformación/ruido/reacción de peatones cercanos → estado persistente solo si la mecánica lo requiere.

**Economía de simulación:** *el mundo debe recordar más de lo que necesita calcular*. Un NPC lejano puede ser una posición estimada y una agenda; se convierte en un agente completo al entrar en una región activa.

## 12. Arquitectura del Motor City: crecer sin quedar atrapado en un único motor

### 12.1. Recomendación estructural

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

### 12.2. Dos rutas factibles

| Ruta | Cuándo elegirla | Ventaja | Coste/riesgo |
|---|---|---|---|
| **A. Prototipo rápido con TypeScript y APIs web** | Si la prioridad es probar jugabilidad en PC/Android/iOS mediante navegador, con distribución offline que lo permita. | Iteración visual rápida; primera *vertical slice* barata. | La lógica dependiente de librerías web **no** se puede portar automáticamente a Unity/Unreal. Exigir datos y reglas independientes desde el día uno. |
| **B. Núcleo portable en C++ o Rust + interfaces C y compilación WASM donde proceda** | Si desde el inicio es requisito reutilizar simulación en web, PC y motores externos. | Mayor control y potencial reutilización de la lógica de juego. | Integración considerablemente más compleja; cada motor requiere adaptadores, pruebas ABI y empaquetado específico. |

**Decisión sugerida:** primero **contratos y un prototipo funcional**; escoger B si la portabilidad del código de simulación está realmente en la ruta de producto y existe capacidad para mantener varias integraciones. Si no, comenzar con A y asegurar *portabilidad de datos*, que es más realista que prometer portabilidad completa de código.

### 12.3. Contratos mínimos obligatorios

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

### 12.4. Principio de renderizado adaptable

La misma entidad lógica `car_023` puede representarse así:

- **Calidad baja:** malla sencilla, textura pequeña, sombra falsa, sin reflejo dinámico, menos partículas, iluminación mayormente estática.
- **Calidad media:** mejores materiales, animación extra de ruedas/suspensión, sombras selectivas, lluvia local y reflejos aproximados.
- **Calidad alta:** geometría/vegetación adicional, sombras de más calidad, densidad de población decorativa y mejores materiales, siempre sujeto a mediciones.

**No** introducir diferencias de reglas físicas por calidad gráfica: cambiar el *aspecto* del vehículo, no el resultado de su frenada, solo por tener otro celular.

**Compatibilidad con motores conocidos:** Godot dispone de caminos Forward+, Mobile y Compatibility (véase [documentación de renderizadores](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html)); Unity documenta escalado según estado térmico y potencia en [Adaptive Performance](https://docs.unity.com/en-us/engine/6000.3/manual/analysis/runtime-performance-scaling/adaptive-performance/introduction); Unreal dispone de una [ruta de renderizado móvil](https://dev.epicgames.com/documentation/unreal-engine/mobile-rendering-and-shading-modes-for-unreal-engine) diferenciada de la de escritorio. **Tener varias rutas disponibles no garantiza paridad de efectos ni de rendimiento.**

## 13. Rendimiento: reglas de un mundo abierto que sí corre en teléfonos

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

## 14. Orden de implementación recomendado

| Fase | Construir | Prueba de aceptación concreta |
|---|---|---|
| **0. Contratos y telemetría** | Modelo de entidades, eventos, guardado, reloj fijo, monitor de FPS/tiempos de CPU-GPU y perfiles de calidad. | Cambiar de escena y recuperar guardado sin perder identificadores ni romper eventos. |
| **1. Sensación de peso** | Personaje, superficies, aceleración/frenado, salto, caída, sonidos y cámara amortiguada. | El usuario distingue caminar, correr, frenar, saltar y aterrizar con cámara reducida o desactivada. |
| **2. Vehículo y contacto** | Un vehículo, fricción, frenada, curva, rampa, colisión controlada y reacción visual de suspensión. | Distancias de frenado reproducibles en la misma configuración y sin atravesar obstáculos. |
| **3. Vida local** | Un pequeño distrito: viento, dos climas, ciclo temporal, sonidos, transeúntes y tránsito sencillo. | El barrio muestra cambios observables aun cuando el jugador no interactúa y reacciona al clima. |
| **4. Persistencia y streaming** | Sectores activos, estados dormidos, horarios, objetos persistentes y carga progresiva. | Salir del barrio y regresar conserva los cambios elegidos sin saltos graves de FPS. |
| **5. Fidelidad escalable** | Tres perfiles gráficos, partículas por presupuesto, LOD, sombras selectivas y adaptación térmica. | La jugabilidad permanece equivalente al cambiar calidad gráfica en dispositivos diferentes. |
| **6. Prueba de portabilidad** | Implementar **un único sistema pequeño** (por ejemplo, clima + objetos reactivos) en un segundo adaptador/motor. | Misma escena lógica, datos y eventos; renderizado distinto pero comportamiento compatible dentro de tolerancias. |

### Medidas que deben recogerse en dispositivo real

- FPS promedio **y** percentiles de tiempo de cuadro, no solo un promedio favorable.
- CPU, GPU, memoria ocupada, consumo/temperatura y rendimiento después de una sesión prolongada.
- Latencia desde toque hasta respuesta visual; frenadas, aterrizajes y colisiones en distintos perfiles.
- Picos durante carga de sector y guardado; estabilidad tras cambios de orientación o retorno desde segundo plano.
- Comparación de misma semilla/escena con distintos renderizadores; investigar diferencias antes de publicar.

## 15. Decisiones de diseño finales

1. **Primero credibilidad física, después complejidad visual.** Una silueta simple que frena, tropieza o cae con coherencia tiene más «peso» que un modelo detallado que se desliza como si no tocara el suelo.
2. **La vida nace de las relaciones.** No basta un árbol que se mueve: el viento debe afectar también ropa, polvo, sonido o conducta, incluso con simulación aproximada.
3. **Optimizar no es vaciar el mundo.** El mundo cercano debe ser rico en reacciones; el lejano, rico en apariencia y estado resumido.
4. **No atar las reglas a los gráficos.** Una entidad lógica puede migrar entre web, Godot, Unity o Unreal mediante datos, contratos y adaptadores, con trabajo real de integración.
5. **Usar las referencias como inspiración, no como instrucciones de copia literal.** Reconstruir principios mecánicos y artísticos con recursos propios evita una identidad visual genérica o derivativa.

## 16. Manual operativo de implementación y delegación a agentes IA

### 16.1. Mapa de módulos y repositorio recomendado

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

### 16.2. Protocolo para Claude, Gemini u otros asistentes

1. **Leer especificación y contratos actuales.** No reescribir interfaces sin una decisión de arquitectura versionada.
2. **Proponer cambios en forma de diffs atómicos.** Cada cambio debe citar el sistema afectado, el comportamiento esperado y la prueba.
3. **Usar JSON validable o funciones declarativas para generar escenas.** Los archivos producidos por IA deben pasar validación de esquema, referencias y límites de presupuesto.
4. **Separar física/estado de VFX.** Un vehículo no debe cambiar su frenada porque se desactive la nieve gráfica; un edificio no debe perder su identidad al variar el LOD.
5. **Probar en navegador y dispositivo real.** Tests unitarios y automatizados son necesarios, pero no sustituyen pruebas E2E de botones, gestos, errores de consola, carga de distrito y reanudación de partida.
6. **Registrar evidencia.** Capturas, replays con semilla, perfil de FPS/RAM, errores reproducibles y versiones de hardware.
7. **No prometer portabilidad automática.** En cada adaptación, hacer mapa explícito de equivalencias: unidades, ejes, coordenadas, físicas, entradas, assets, audio, UI y recursos gráficos.

### 16.3. Ejemplo de contrato de entidad (propuesta, no código del juego existente)

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

### 16.4. Hitos mínimos no negociables antes de expandir el mapa

| Entregable | Condición comprobable |
|---|---|
| Un vehículo con física plausible | Acelera, frena, gira, rebota levemente sobre obstáculo y muestra telemetría sin atravesar el terreno |
| Un peatón convincente | Camina, corre, frena, usa escalones y reacciona a un vehículo próximo sin deslizamiento flagrante |
| Distrito activo | Cambia entre día/noche y clima sin perder tráfico y rutinas; conserva modificaciones persistentes |
| Rendimiento móvil | Se mide en dispositivo objetivo con configuración fija y sesión prolongada; no se certifica a partir del PC del desarrollador |
| Compatibilidad inicial | Una escena lógica produce resultados equivalentes en perfiles gráficos bajo/alto |
| Portabilidad piloto | Un subsistema aislado puede exportarse mediante esquema y ejecutarse en otro adaptador con tests comparativos |

### 16.5. Riesgos y correcciones de afirmaciones demasiado fuertes

- **“60 FPS en cualquier celular”:** no garantizable sin hardware de referencia, presupuesto de frame y telemetría. Un perfil móvil debe priorizar **30 FPS consistentes** cuando 60 no sea sostenible.
- **“Vertex shaders o sprites casi gratis”:** los costes dependen de overdraw, cantidad de objetos, resolución y batería; pueden ser eficientes **si se miden**.
- **“Huellas permanentes en terreno”:** una marca visual con decal/texture no implica una malla físicamente deformada. Elegir según la interacción requerida.
- **“1000 NPC con emociones y memoria”:** el texto de un reel no certifica su arquitectura; simular muchos agentes **en segundo plano** requiere distintos grados de detalle, tests y medidas.
- **“Física determinista a 60 Hz en todos los motores”:** un paso fijo ayuda a reproducibilidad local pero **no garantiza igualdad bit a bit** entre bibliotecas o plataformas. Repetir escenarios con tolerancias.
- **“Migración sin esfuerzo a Unreal/Unity”:** los sistemas de datos pueden transferirse; integración de físicas, shaders, UI, input y empaquetado puede exigir trabajo considerable.
- **“ECS, WFC, WebGL, MIT, 0,08 s”:** son atribuciones incluidas en la descripción de Gemini para ciertos proyectos; revisar código/licencia y reproducir benchmarks antes de convertirlas en decisiones cerradas.
- **“Un filtro estilizado acelera por sí solo”:** pixelación y outlines pueden agregar pasadas de pantalla; reducir resolución interna o complejidad material es distinto de añadir un filtro.

---

## 17. Fuentes, material y pendientes documentados

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
