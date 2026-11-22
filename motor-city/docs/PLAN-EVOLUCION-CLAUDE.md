# Plan de evolución de Turno Cero · Claude (Anthropic)

> **Quién y cuándo.** Escrito por Claude el 22‑nov‑2026, rama `claude/motor-city-engine-xu7p4y`, sobre Motor City 4.6.1 → 4.7.
>
> **Las otras dos IA** trabajan en paralelo y publican lo suyo:
> - Gemini · Antigravity: `docs/PLAN-EVOLUCION-GEMINI.md`, rama `ia/gemini/4.7-evolucion-arte-render`;
> - Codex · ChatGPT: `CONTEXTO-CODEX-TURNO-CERO.md`, rama `codex/turno-cero-arte-motor`.
>
> La coordinación va en `coord/buzon/` y `coord/agentes/*.json`. Este documento las lee y no repite lo que ellas reclamaron.
>
> **Cómo leerlo.**
> - § 1–2: qué se midió y qué ya se arregló en esta ronda.
> - § 3: comparación con cada referencia del autor.
> - § 4: investigación transversal (controles, mundos grandes, render).
> - § 5–9: ideas concretas por género, mundo vivo, Run, cámaras y arte.
> - § 10: la hoja de ruta, con quién hace qué.
> - § 11: lo que no recomiendo.
> - § 12: las fuentes.

---

## 1. Las metas del autor, convertidas en criterios que se pueden comprobar

| Meta del autor | Criterio de aceptación (cómo sabremos que está) |
|---|---|
| Arcade, mundo abierto y libre, con tutorial opcional | ▶ Jugar entra directo a la ciudad (hecho en 4.2). El tutorial vive en «❓ Cómo se juega» y en avisos de primera vez. |
| Todo liberado desde el principio | Los 5 capítulos, todos los vehículos, las 3 ciudades y todos los modos se pueden jugar en la primera partida. **Hecho en 4.7.** |
| Cada modo presente en el mundo abierto, con la misma experiencia que el modo cerrado | Hay una marca en la ciudad para cada modo, y ▶ Jugar arranca **el mismo código** que el menú 🎮. **Hecho en 4.7** para 🏁 🚵 📦 🚲 🚇 🛹 🛴. |
| Cada modo fluido, jugable, ni a medias ni lentísimo | 60 cuadros por segundo con física por subpasos; ninguna actividad sin acción por más de 20 s; partidas de 1 a 4 minutos. |
| Ritmo entre la magnitud del mundo y la precisión del tiempo, sin realismo absoluto | Velocidades «arcade creíbles»:<ul><li>a pie trota a 4 m/s y corre a 6,4;</li><li>bici, 32 km/h;</li><li>carro, 115 a 145 km/h;</li><li>tren, 100 km/h, con ×3 en el tramo largo.</li></ul>El reloj del juego avanza 1 minuto por segundo. |
| Divertir, generar aprendizaje y generar curiosidad | Cada actividad deja un dato real del lugar: estación, barrio, hito o ciclorruta. El juego ya tiene los datos (MC4 con lugares, estaciones y relieve reales). |
| Géneros: Arcade, Mundo abierto, Roguelite, Estrategia, Puzzles, Acción, Gestión de recursos, Simulador de actividades, Contra el reloj y Rol | § 5, con una o más actividades concretas por género y su estado. |
| Vistas: 3D cenital, panorámica, tercera y primera persona, horizontal y vertical, 2D de frente y de lado, pixel | § 8: una tabla de vista → para qué sirve → estado → acción. |
| Un solo mundo 3D; 2D y pixel como herramienta de diseño y para los modos que lo pidan | § 4.6 y § 8: una simulación con varias proyecciones; el 2D pinta y detalla el 3D. |
| Run solo en ciclovías, con giros, anchos que cambian, obstáculos, zonas de trucos y parkour, también en el mundo abierto | § 7. |
| Ciudades con cosas que hacer y peso para el jugador; RPG/MMO con subtramas | § 6. |
| Generar diversión, conciencia y contemplación | § 5 y § 6: miradores, crónicas y Cultura Metro y EnCicla; ver también el plan de Gemini, que se encarga de los miradores. |

---

## 2. Auditoría de 4.6.1 y lo que arreglé en 4.7

### 2.1 Cómo se midió
- **Banco con «dedo» real:** un script de Playwright con eventos de puntero en el joystick flotante, como un dedo.
  - Recorre 6 cámaras y 5 vehículos en una recta de Medellín.
  - Mide la velocidad máxima, la distancia recorrida, el giro del rumbo con el joystick quieto (si da vueltas solo, el control está mal) y los cuadros por segundo.
- Capturas de las 10 vistas en vertical (412 × 860) y en horizontal (860 × 412).
- Las pruebas del motor (146 en Node y 158 en navegador), la de modos y el bot que recorre la historia entera.
- Los hallazgos de Gemini en el buzón (`coord/buzon/20261122-1416-antigravity-4.7-inicio.md`), verificados y corregidos.

### 2.2 Lo que encontré

| # | Hallazgo | Medida | Causa |
|---|---|---|---|
| A1 | Los vehículos **sí** se mueven en todas las cámaras con entrada real | Carro: 31 m/s en 3 s; moto: 40 m/s; 60 cuadros por segundo en todas las vistas | — |
| A2 | **A pie era lentísimo** | En las vistas de volante, 1,4 m/s (5 km/h); en las de mundo, 2,9 | `vmax 1,6`; solo se trotaba con el joystick a fondo en las vistas de mundo |
| A3 | **Bicis y patines lentos para un mapa de 43 × 49 km** | Bici a 27 km/h; MTB a 29 | Velocidades reales, no arcade. En EnCicla, a pie va al 43 % de la bici; aquí iba al 21 %. |
| A4 | **Modos con trayectos eternos** | EnCicla hasta 2,6 km en bici (unos 6 min); la bajada de Extremo de 1 a 4 km; el tren a 1,15 m/s² (más de 60 s entre estaciones) | Distancias pensadas en metros reales |
| A5 | **El tren «no anda» al empezar** (Gemini) | 4 s con las puertas abiertas; solo leía el joystick de arriba a abajo | `puertas = 4` y `thr = -stick.y` |
| A6 | **De lado no avanza** en tercera, primera y Arcade (Gemini) | Con el joystick solo de lado, `acel = 0` | Control de volante sin aceleración automática |
| A7 | **La cenital no era cenital** (Gemini) | 62° de lejos y 42° de cerca | `pitch 1,08 / pitchCerca 0,74` |
| A8 | **Cámaras incoherentes** | Arcade (OutRun) dibujaba una carretera infinita en plena ciudad; Vuelo dibujaba montañas yendo en carro; la panorámica, en blanco | Estaban en el ciclo general de cámaras |
| A9 | **Capítulos bloqueados** | Solo el capítulo terminado más uno | `menuHistoria` y la portada |
| A10 | **Los modos no estaban en el mundo** | Solo se entraba por el menú 🎮 | No había marcas |
| A11 | **Suelo pelado en el 3D cercano** | Manzanas «ladrillo» beige sin casas en zonas periurbanas | El mapa trae pocas casas allí; el 3D no rellena |

### 2.3 Lo que ya quedó hecho en 4.7 (Claude)

| Arreglo | Dónde | Comprobado |
|---|---|---|
| **Ritmo arcade:**<ul><li>a pie camina a 2,2, trota a 4 y corre a 6,4 m/s;</li><li>bici: 9 m/s;</li><li>e‑bike: 10,5;</li><li>MTB: 10,5 (más rápida en bajada);</li><li>BMX: 8,5;</li><li>skate: 7;</li><li>patines: 7,5;</li><li>patinete: 6,5.</li></ul>Se trota con el joystick a fondo en cualquier vista | `js/31-vehiculos.js`, `js/32-fisica.js` | Pruebas § 26 y § 27 |
| **Modos más cortos y vivos:**<ul><li>EnCicla: 0,3 a 1,3 km;</li><li>Mandados: 0,4 a 1,3 km;</li><li>Extremo: bajadas de 0,6 a 2,6 km;</li><li>tren: acelera a 2,4 m/s² y frena a 3,2, corre ×3 lejos de la estación (⏩) y arranca sin esperar.</li></ul> | `juegos/getaway/60-modos.js` | `pruebas/modos.mjs` |
| **Tren: el joystick empuja hacia donde va el tren** en la pantalla | `60-modos.js` | — |
| **Volante:** el joystick sostenido de lado avanza | `js/37-manejo.js` | Banco del dedo |
| **Cenital de verdad:** 79° de lejos y 66° de cerca, y **se aleja con la velocidad como GTA 2** (hasta +75 % a 30 m/s; la oblicua, +35 %) | `js/34-camara.js` | Capturas |
| **Cámaras por contexto:**<ul><li>cenital, Ciudad 3D, tercera, primera, dron y maqueta siempre;</li><li>Arcade solo en carretera y en carreras;</li><li>Vuelo solo volando.</li></ul>Si el contexto cambia, vuelve sola a la cenital | `juegos/getaway/90-inicio.js` | — |
| **Todo liberado:** los 5 capítulos (en la portada y en el menú) y todos los vehículos, aun con un guardado viejo | `90-inicio.js`, `20-juego.js` | Prueba de actividades |
| **Actividades en el mundo abierto:**<ul><li>marcas por celdas de 1,2 km con datos reales: avenidas (🏁), lomas (🚵), lugares o calles (📦), plazas (🛹), ciclorrutas (🛴), estaciones EnCicla (🚲) y de metro, tranvía y Metroplús (🚇);</li><li>se ven en la calle, el minimapa y el mapa;</li><li>▶ Jugar arranca el mismo modo ahí.</li></ul> | `60-modos.js` (`G.Actividades`) | En Medellín: 7 🚵, 9 📦, 6 🏁, 3 🚇, 1 🛹 y 1 🛴 alrededor del inicio. Trucos y tren arrancan desde su marca. |
| **🛹 Zona de trucos y parkour:**<ul><li>🦘 salta;</li><li>en el aire el joystick gira (180, 360, 720);</li><li>hay que caer derecho;</li><li>combos de hasta ×5;</li><li>75 s;</li><li>a pie es parkour.</li></ul> | `60-modos.js` | 1 155 puntos con 3 saltos con giro |
| **🛴 Run en el menú 🎮:** entra si estás en la ciclorruta; si no, te marca la más cercana | `60-modos.js` | — |
| **⏫ Acelerador fijo** (4.6.1): también en el tren | `js/37-manejo.js`, `60-modos.js` | § 27 |
| **Puente para el respaldo por software:** `Vistas.aPantalla` usa `Raster.aPantalla` cuando Gemini lo agregue | `js/46-vistas.js` | — |
| **Auditoría de ChatGPT** (`docs/PLAN-EVOLUCION-CHATGPT.md`, rama `ia/chatgpt/4.7-auditoria-arcade-20261122`), lo verificado y corregido:<ul><li>**TC‑P0‑02/03:** Run se filtra a la ciclorruta (`VIA.CICLO`) en el camino y en cada cruce; si la ciclovía se acaba, termina con «🏁 Fin de la ciclorruta» y no sigue por la calle;</li><li>**TC‑P1‑05:** EnCicla sin estaciones no se rompe;</li><li>**TC‑P1‑07:** 📍 en vez de 🔒: no es un candado de progreso, es que la ciudad no tiene esa infraestructura;</li><li>**TC‑P1‑08:** desde una marca, la pista sale de una semilla fija (misma marca, misma ruta, récords comparables);</li><li>**TC‑P0‑01:** pruebas «humanas» que solo usan entradas.</li></ul> | `js/50-run.js`, `60-modos.js`, `pruebas/humano.mjs` | 🚇 con ⏫ para en la estación en 35 s (99 pts); 🏁 con el joystick avanza 346 m a 30 m/s |
| **Hallados por la prueba humana:**<ul><li>el carro quieto frente a una caneca, un cono o una valla no podía pasar (pedía 2,5 m/s para tumbarla, y la caneca no lo dejaba acelerar): ahora el carro se lleva lo liviano a cualquier velocidad, como en GTA;</li><li>la salida de la carrera podía mirar contra un edificio: ahora avanza por la pista hasta un tramo despejado.</li></ul> | `js/32-rotos.js`, `js/32-fisica.js`, `60-modos.js` | `pruebas/humano.mjs` |

---

## 3. Comparación con las referencias del autor

Para cada familia de referencias:
- **lo que hacen bien:** la técnica, nunca el arte ni los niveles; donde hay fuente, va al final;
- **qué tiene ya Turno Cero;**
- **la idea verosímil** para este juego (no copiar el juego).

Prioridad: **P1** (siguiente versión), **P2** (la que sigue) y **P3** (cuando haya base).

### 3.1 Conducción arcade y persecución

| Referencia | Lo que hace bien | Turno Cero hoy | Idea concreta | Prio. |
|---|---|---|---|---|
| **Super Arcade Racing** (OutOfTheBit; «la más importante» para el autor) | Carreras 2D desde arriba al estilo de los arcades de los 80 y 90. Dos botones, acelerar y frenar, pensados para el celular. El giro es preciso en curvas cerradas a alta velocidad.[^sar] | Modelo de EnCicla (4.6), ⏫ acelerador fijo (4.6.1), 🏁 carreras con rivales, Arcade (OutRun) en carretera | **«Esquema SAR» opcional en ⏸ Menú → Controles:** ⏫ y 🛑 grandes; el joystick solo gira, o mitad izquierda y mitad derecha de la pantalla. **Cámara cenital que se aleja con la velocidad** (GTA 2 lo hace, § 3.2). Circuitos cortos (40 a 70 s por vuelta) con 3 vueltas en calles cerradas por barreras. | P1 |
| **#DRIVE** (Pixel Perfect Dude) | Manejo infinito por una vía, esquivar tráfico, gasolina que se acaba, policía detrás. La crítica le reprocha poca variedad y dirección «flotante».[^drive] | Carreteras de 12 a 16 km entre ciudades, ⏩, búsqueda de 0 a 5 | **«Ruta de la medianoche»** en la carretera entre ciudades: la gasolina baja y hay que entrar a las bombas; *near miss* (pasar rozando) suma; la búsqueda escala. La carretera es la real del planeta, no una pista aparte. | P2 |
| **PAKO Forever / PAKO 2 / PAKO 3** (Tree Men Games) | Persecución desde arriba en mapas generados; un golpe y se acaba; la presión escala (policía, tanques, helicópteros). Se queja la gente de las patrullas que aparecen de frente sin tiempo de reacción.[^pako] | `MC.Busqueda` 0–5 con helicóptero, púas y retenes | **Modo «Fuga» (roguelite corto, § 5):** sobrevivir 90 s con la búsqueda subiendo sola. Aprender del reclamo: **nunca aparecer de frente a menos de 120 m ni fuera de la pantalla en la dirección de avance**. | P1 |
| **APEX Racer**, **Need for Speed No Limits** | Carreras cortas con progresión de carros y piezas, nitro, rivales con nombre | 🏁 con 3 rivales, récords por ciudad y ⚡ turbo | **Rivales con historia:** «Lucía la Flecha», «el Mono Rendón» y «Kira» reaparecen, te retan y recuerdan si les ganaste (§ 6). Las mejoras se compran en el 🔧 taller (§ 5, gestión). | P2 |
| **FR Legends** | Drift en tándem con jueces: línea, ángulo, compromiso y cercanía al rival.[^frl] | Derrape con freno de mano (4.5) | **Zonas de drift** (como las de Forza) en curvas reales: puntaje por ángulo × velocidad × duración; en tándem, más puntos por seguir de cerca a un rival de la IA. | P2 |
| **Forza Horizon** | El mundo abierto lleno de retos medidos sobre la vía misma: radares de velocidad (un punto), zonas de velocidad (un promedio), carteles de peligro (saltos) y zonas de drift, con récords. Premia la conducción arriesgada.[^fh] | 🏁 🚵 marcas (4.7) | **Sumar a `Actividades`:**<ul><li>📸 radar en las avenidas largas;</li><li>⚠️ salto en las lomas con cambio brusco de pendiente (el relieve real lo da);</li><li>〰️ zona de drift en curvas;</li><li>los tres con récord por ciudad y sin menú: se pasan y se miden.</li></ul> | **P1** |
| **Getaway (MoonLight Games) / The Getaway 1 y 2** | Persecución cinematográfica en una ciudad real; guía sin interfaz (las direccionales del carro) | 🎬 Modo cine con direccionales (C‑M40), Manhattan y Medellín reales | Ya está la base. **Pulir:** que las direccionales titilen a 40 m del giro, con sonido; misiones de «llévame sin que nos vean». | P2 |

### 3.2 Mundo abierto desde arriba

| Referencia | Lo que hace bien | Turno Cero hoy | Idea | Prio. |
|---|---|---|---|---|
| **GTA 1, GTA 2, London** | Vista desde arriba. **En carro, la cámara sube y sube más con la velocidad; a pie, baja.**[^gta2] Misiones por teléfonos públicos, respeto de pandillas. | Cenital 3D a 79°, que **se aleja con la velocidad** (hecho en 4.7), contratos 📞, búsqueda | **Teléfonos públicos** como marca de actividad para los contratos (ya existen los 📞): tocar uno da el contrato. | **P1** |
| **GTA Chinatown Wars** | Cenital 3D con mini juegos táctiles (abrir carros, armar cosas) y un mercado de compra y venta entre barrios | Artefactos, 🔓 acceso | **Mini juegos táctiles de 5 a 10 s** para abrir un carro, reparar en el taller o cablear (enlazado con los puzzles de § 3.4). **Mercado de piezas** entre barrios (gestión, § 5). | P2 |
| **GTA San Andreas** | Atributos del personaje que suben con el uso (manejo, físico); barrios que se ganan | Reputación por grupos (`G.rep`) | **Habilidades que suben jugando** (§ 6): manejo (menos derrape), físico (correr más), ciclismo (bici más rápida). Visibles y pequeñas: +2 % por nivel, tope +20 %. | P2 |
| **CityRT** (cityrt.com) | Simulación de transporte en ciudades reales | `MC.Transporte` con horarios, `MC.Trafico` con semáforos | Base del **Centro de control** (§ 3.3). | P3 |

### 3.3 Transporte, tráfico y despacho

| Referencia | Lo que hace bien | Turno Cero hoy | Idea | Prio. |
|---|---|---|---|---|
| **Traffix / Traffix 3D** (Infinity Games), «perfecto para buses y metrobús» | Controlas los semáforos:<ul><li>rojo por defecto; amarillo deja pasar uno; doble toque, verde;</li><li>la gente se enoja si espera y se choca si la apuras.</li></ul>En la versión 3D: mantener el dedo para dejar pasar.[^traffix] | Semáforos reales en `MC.Trafico.luces()` y la multa en 🚲 EnCicla | **🚦 «Turno en el centro de control»:** en un cruce real con semáforo, la cámara se pone cenital y fija. Tocas la luz de cada eje: rojo, amarillo o verde. Los buses y el Metroplús tienen prioridad (dan más puntos). Ningún choque; la paciencia de cada fila se ve en el carro. **El mismo cruce del mundo abierto**, con el mismo tráfico. | **P1** |
| **Railways** (Infinity Games), «perfecto para el metro en 3D cenital» | Toques que detienen un tren un instante; arrastrar para hacer vía; recoger pasajeros de su color; evitar choques.[^rail] | 🚇 manejar una línea (4.6) | **🚇 «Despachador»** en la vista cenital de una línea real (A, B, tranvía, Metroplús): varios trenes a la vez; tocar uno lo detiene; mantener libre el andén; los pasajeros del color de la línea. Complementa a manejar un tren. | P2 |
| **Train Chu** (no encontré ficha pública con ese nombre; el autor lo da como modelo del metro en 2D) | Por lo que pide el autor: el tren de lado, en 2D, parando en estaciones | 🚇 manejar en 3D | **Vista lateral 2D del mismo tren** (§ 4.6 y § 8). La línea A va en viaducto: de lado se ve el río, las montañas y los barrios al fondo, la vista más bonita del Valle. Mismos controles: ⚡, 🛑, ⏫. | P2 |
| **Tiny Rails** | Tren que viaja por un mundo; gestión de vagones y pasajeros; pasiva y contemplativa | Carreteras y planeta | **Vagón propio** en 🚇: con las paradas bien hechas suben clientes que pagan; idle suave entre ciudades. | P3 |
| **911 Operator** | Despacho de unidades (policía, bomberos, ambulancia) en mapas reales de OpenStreetMap; llamadas.[^911] | El mapa grande de EnCicla (4.6), mapas reales | **📻 «Central de domicilios»** (no policial, para no chocar con el tono del 18+): desde el mapa grande, asignar mandados a repartidores de la IA según la distancia real, con el reloj corriendo. Gestión y contra el reloj sobre la ciudad real. | P2 |

### 3.4 Puzzles

| Referencia | Lo que hace bien | Idea en Turno Cero | Prio. |
|---|---|---|---|
| **Package Inc** (Infinity Games) | Enrutar paquetes por cintas y cambios de vía hasta su destino de color | **🔀 «Centro de distribución»:** en el depósito del modo 📦 Mandados, antes de salir, se enrutan los paquetes a la puerta de cada camión. Si se hace bien, los mandados de la ronda pagan más. Puzzle corto que alimenta el modo de mundo abierto. | P2 |
| **Infinity Loop**, **Laser** | Girar piezas hasta que todo conecta (circuito o rayo) | **⚡ «Apagón»:** subtrama en un barrio con el alumbrado caído; reparar el tablero girando piezas. Al resolverlo, el barrio se ilumina **de verdad** de noche (el motor ya tiene la luz por barrio). Conciencia: el servicio público. | P2 |
| **Laberinto** (Rikudo) | Laberinto de un trazo | **Interiores del sigilo** como pequeños laberintos con conos de visión (Hunter Assassin, § 3.5) | P3 |
| **Monument Valley** | Arquitectura imposible y contemplación; cada nivel es un diorama | **Miradores** (Gemini) y la **maqueta 2:1** (ya existe): un «modo postal» que arma un diorama del lugar donde estás para contemplarlo y compartir la imagen | P3 |

### 3.5 Acción, sigilo y combate

| Referencia | Lo que hace bien | Turno Cero hoy | Idea | Prio. |
|---|---|---|---|---|
| **Hunter Assassin** | Desde arriba, tocar para ir, linternas y sombras | Hecho en 4.5 (cámara cenital sola en el sigilo, conos que se cortan en los muros) | Pulir: **tocar para ir con ruta visible** y **marcas de ruido**. | P2 |
| **Bullet Echo** (ZeptoLab) | La visión limitada a la linterna; el sonido (pasos y disparos) revela al enemigo.[^be] | Conos y ruido de Thief (4.1) | **Indicadores de sonido en el borde de la pantalla** (pasos, motor, sirena) cuando el origen está fuera de la vista: accesible y táctico. | **P1** |
| **Gun Fu: Stickman 2**, **Shadow Fight 2** | Acción en 2D lateral, de frente; animación expresiva | Acción a pie en 3D (Codex, misión aparte) | **Enfrentamientos puntuales en 2D lateral** (§ 8), solo en el 18+ y en interiores: la cámara gira a perfil, el combate es de 2 o 3 botones y al terminar vuelve al 3D en el mismo lugar. No es un juego aparte: es una proyección del mismo cuarto. | P3 |
| **Soul Knight** (ChillyRoom) | Roguelite de partidas cortas; habitaciones generadas; mejoras entre partidas | — | Modo **«Turno de noche»** (§ 5): roguelite sobre la ciudad real. | P2 |

### 3.6 Movimiento y trucos

| Referencia | Lo que hace bien | Turno Cero hoy | Idea | Prio. |
|---|---|---|---|---|
| **Alto's Odyssey** | Backflip con un toque sostenido; *grind* y *wall ride* que mantienen vivo el combo; puntos por truco y por metro.[^alto] | 🛹 trucos 4.7 (saltos, giros y combo) | **Sumar *grind*:** bordes de andén y barandas de los puentes (el mapa los tiene) mantienen el combo; **flip** (mantener 🦘); combo que solo se rompe al caer mal. | **P1** |
| **Vector** (Nekki) | *Parkour runner*: movimientos espectaculares sin memorizar combinaciones; un perseguidor detrás.[^vector] | 🛹 a pie = parkour básico | **«Huida en parkour»** en el sigilo: si te descubren a pie, un guardia persigue (ya existe en 4.0.2) y los saltos sobre obstáculos dan impulso. | P2 |
| **Skate Space** (no encontré reseña; en otros juegos de skate táctil, los trucos se hacen deslizando el dedo hacia arriba y manteniéndolo, y los gestos de muchos trucos confunden)[^skate] | — | 🛹 | **Pocos gestos y claros:** 🦘 salto, mantener = flip, joystick en el aire = giro. No hacer 80 trucos con gestos. | — |

### 3.7 Gestión, simulación y sandbox

| Referencia | Lo que hace bien | Turno Cero hoy | Idea | Prio. |
|---|---|---|---|---|
| **Idle Supermarket Tycoon** | Bucle *idle*: estaciones que producen solas, gerentes que automatizan, mejoras que se notan | 🔧 taller | **🔧 «El taller de Mara»:** contratar mecánicos (la gente con nombre de la ciudad) que reparan solos mientras manejas; mejoras de bahía, de grúa y de pintura. Sostiene el dinero y la reputación con el barrio (§ 6). | P2 |
| **The Sims** | Necesidades y objetos inteligentes | `MC.Necesidades` (2.x), Mi casa | **El escondite** de Mara: dormir para saltar a la noche, comer para recuperar vida; muebles que se compran con lo ganado. | P3 |
| **Cities: Skylines, SimCity BuildIt, TheoTown** | Zonas, demanda, servicios, tráfico | `MC.Urbe` (2.3, modo alcalde de Mandados) | **No hacer un constructor de ciudades** (§ 11). Sí: **capas de datos** del mapa grande (tráfico, valor del suelo, ruido) para leer la ciudad. Aprendizaje. | P3 |
| **WorldBox**, **Solar Smash** | Sandbox de poderes; destruir y ver qué pasa | `MC.Rotos`, explosiones (4.5) y el 🧪 laboratorio (4.6) | **🧪 Laboratorio ampliado:** clima extremo, hora, tráfico ×3, apagón y gravedad lunar en las bajadas. Es para probar el motor y divertirse, sin efecto en la historia. | P2 |
| **Townscaper** | Rejilla irregular y reglas tipo WFC que arman casas con poco arte[^towns] | WFC y autotile (2.3) | **Rellenar manzanas** (hallazgo A11): casas generadas por reglas en los bloques «ladrillo» sin edificios del mapa, con piezas modulares e instancias (§ 4.4 y § 9). | **P1 (arte)** |

### 3.8 Vuelo y espacio

| Referencia | Lo que hace bien | Idea en Turno Cero | Prio. |
|---|---|---|---|
| **Real Flight Simulator** | Vuelo realista sobre terreno | **Avioneta en Guatapé** (Gemini la tiene en su lista): despega del embalse o de una pista, sobrevuela con la vista Vuelo (Voxel Space). El control es arcade, no simulador. | P2 |
| **Spaceflight Simulator** | Armar y lanzar cohetes con física orbital | **No** (§ 11). El 🌍 planeta ya da la escala. | — |
| **Missiles!**, **1945 Air Force** | Esquivar misiles con giros cerrados; *shooter* vertical clásico | **Persecución del helicóptero** (búsqueda 5) en la carretera: esquivar los reflectores. Y un **mini juego del dron 🛸** en pixel vertical (§ 8) para la misión del dron: la cámara sube, la imagen se vuelve pixel y se esquivan señales de interferencia. | P3 |

### 3.9 Contemplación y atmósfera

| Referencia | Lo que hace bien | Idea | Prio. |
|---|---|---|---|
| **Sky: Children of the Light** | Conexión y exploración; un MMO casi sin combate cuyo diseño premia ayudar a otros[^sky] | **«Huellas»** (§ 6): los récords y los mensajes se comparten por código QR o enlace (sin servidor); los fantasmas de carrera de otros jugadores. | P2 |
| **Little Nightmares**, **The Bonfire: Forsaken Lands** | Atmósfera; supervivencia con ciclo día y noche | Noche y clima ya existen. Para **conciencia**: subtramas sobre el trabajo nocturno, la ciudad que no duerme y los trabajadores invisibles (§ 6). | P2 |

---

## 4. Investigación transversal

### 4.1 Jugabilidad, ritmo y «game feel»
- **Definición útil:** Swink define la sensación de juego como el control en tiempo real de objetos virtuales en un espacio simulado, con las interacciones enfatizadas por el pulido.[^swink] De ahí salen tres palancas:
  - **respuesta inmediata:** subpasos, acelerador fijo y búfer de salto, ya hechos;
  - **simulación coherente:** un mundo, una física;
  - **pulido:** sacudida, pausa al golpe y partículas, ya en el motor.
- **Sacudida corta y decreciente:** la versión práctica del «screenshake» de Vlambeer es empujar la cámara unos píxeles y dejar que el temblor decaiga rápido. Ya existe (`camara.sacudir`) y la desactiva la opción de accesibilidad.[^shake]
- **Ritmo por compresión del tiempo, no por velocidad irreal:** el ⏩ de la carretera (4.0) y del tren (4.7) acelera lo aburrido y deja a escala real lo que exige precisión (parar en el andén o tomar la curva). Es la regla para el resto de modos.
- **Arriesgar paga:** Forza Horizon premia la conducción peligrosa con puntos y castiga poco los errores.[^fh] Aplicado aquí:
  - pasar rozando,
  - derrapar en la zona,
  - saltar la loma.
  Todo suma; el choque solo cuesta tiempo.

### 4.2 Controles táctiles
| Principio | De dónde | Estado |
|---|---|---|
| Joystick flotante donde se pone el dedo | Estándar en móvil | Hecho (2.x) |
| **Aceleración sin el pulgar:** botón ⏫ o aceleración automática | El autor y los *racers* de dos botones (SAR) | Hecho (4.6.1 y 4.7) |
| En la vista de volante, el joystick de lado también avanza | *Racers* móviles | Hecho (4.7) |
| Botones de contexto: solo se ven cuando sirven | GTA (entrar, robar), Hunter Assassin | Hecho; sumar ▶ Jugar (4.7) |
| Pocos gestos y claros para trucos | Reseñas de juegos de skate táctil[^skate] | 🛹 4.7 |
| Indicadores de sonido en el borde | Bullet Echo[^be] | **P1** |
| Esquema elegible en ⏸ Menú → Controles: joystick de mundo, volante, dos botones (SAR) o un dedo (*drift*) | *Thumb Drift* y *One Tap Drift* usan un dedo[^sar] | **P1** |
| Vibración corta en el golpe, en el aterrizaje y al pasar un radar | — | P2 (respetar la accesibilidad) |

### 4.3 Interactividad aplicada (que el mundo responda)
- **Los retos están en la vía** (Forza): no hay menú, el mundo mide.
- **Datos reales que enseñan:** 911 Operator descarga calles y servicios reales de OpenStreetMap.[^911] Motor City ya lo tiene horneado en MC4, sin internet. Cada actividad termina con un dato del lugar:
  - la estación (año, línea),
  - el barrio,
  - la ciclorruta (km).
  Eso es «aprendizaje y curiosidad» sin interrumpir.
- **Consecuencias visibles:**
  - el barrio que ayudaste se ilumina (⚡ Apagón);
  - la estación que rebalanceaste tiene ciclas;
  - el rival al que le ganaste te saluda.

### 4.4 Mundos grandes con pocos recursos
1. **Datos abiertos como contenido:** calles, relieve, estaciones y lugares (OSM/Overture y SRTM). Ya está; es la mayor ventaja del proyecto.
2. **Reglas en vez de arte a mano:** WFC y rejilla irregular (Townscaper[^towns]) para rellenar manzanas con casas a partir de 6 a 10 piezas modulares; variación de color por zona (`ciudades/<id>.json` ya tiene paletas).
3. **Semillas deterministas** (Elite, 4.1): las actividades de 4.7 salen de la celda y de `MC.h2`. Mismo lugar, misma actividad, sin guardar nada.
4. **Instancias:** una malla de casa o de árbol dibujada mil veces en una llamada. Las guías de WebGL ponen como presupuesto entre 50 y 200 llamadas de dibujo por cuadro en celulares de gama baja.[^webgl]
5. **Losas 2D como textura del 3D:** ya es así (`45-gl.js` usa `Losas`). El 2D es el pincel del 3D: lo que se pinta en 2D se ve en el 3D.
6. **Streaming por sectores** (C‑M34) y **PVS** (4.5): ya hechos.

### 4.5 Render y optimización (lo que conviene, en orden)
| Técnica | Para qué | Estado | Quién |
|---|---|---|---|
| Instancias para casas, árboles y mobiliario | Bajar llamadas de dibujo | Parcial | Gemini (`45-gl3d.js`) |
| Atlas de texturas para fachadas y señales | Una textura, menos cambios de estado[^webgl] | Parcial | Gemini y Codex (arte) |
| LOD de 2 o 3 niveles e **impostores** (un sprite que mira a la cámara) para lo lejano | Ciudades enteras al fondo | LOD hecho (C‑M33); impostores no | Gemini |
| PVS y recorte por región | No dibujar lo que no se ve | Hecho (4.5, 4.2) | — |
| Resolución dinámica y perfiles de calidad | Mantener 60 cuadros por segundo | Hecho (2.8, 4.4) | — |
| Física por subpasos con dt de 25 ms | Mismo ritmo a cualquier cuadro por segundo | Hecho (4.6) | — |
| Pools sin basura | Evitar tirones del recolector | Hecho (4.4) | — |
| Texturas comprimidas (KTX2 / Basis) | Menos memoria | **No**: necesita un transcodificador (una librería) y la regla es sin librerías. Alternativa: *vertex color* y texturas pequeñas generadas al vuelo. | — |
| Iluminación hemisférica, especular y *rim* | Realismo barato | En curso | Gemini (`45-gl.js`) |

### 4.6 Un solo mundo 3D, con 2D y pixel integrados
**Principio:** una simulación (`MC.Cuerpo`, `MC.Trafico`, `MC.Transporte` y el mismo `G.E`) y varias **proyecciones**. Nunca dos mundos.
- **3D:** la cenital, la oblicua, la tercera y la primera persona, el dron y la maqueta son la misma escena GL con distinta cámara. Así es desde 3.0.
- **2D como herramienta:** las losas pintadas en 2D son la textura del suelo 3D. Las fachadas, el mobiliario y las señales se diseñan en 2D y se proyectan sobre las mallas 3D. Esto ya pasa con el suelo; falta extenderlo a las fachadas (Gemini y Codex).
- **2D como vista jugable:**
  - la **lateral** es una proyección ortográfica de perfil del mismo mundo, para los modos que juegan mejor de lado: el tren (Train Chu), los enfrentamientos (Shadow Fight), el parkour (Vector) y la carretera (Alto);
  - la cámara cambia a perfil y la simulación sigue igual. Al salir, se está en el mismo punto.
- **Pixel:**
  1. **como estilo:** el 🕹️ Retro, con COLORMAP y pixelado sobre el mismo cuadro (ya existe);
  2. **como modo:** el dron en pixel vertical, al estilo de 1945, y el mini juego del apagón;
  3. **como herramienta:** las losas en pixel sirven para revisar el diseño del mapa desde arriba (la maqueta pixel).
- **Arcade y Vuelo:** son técnicas clásicas (pseudo‑3D y Voxel Space) que solo tienen sentido en la carretera entre ciudades y en el aire. En 4.7 ya solo aparecen ahí.

---

## 5. Ideas por género (verosímiles para Turno Cero)

**Marco narrativo que las une: la doble vida.** Mara Vega es mecánica y conductora de turno cero.
- **Los trabajos legales** (📦 mandados, 🚇 turnos de metro, 🚲 rebalanceo, 🔧 taller) le dan **cobertura**: le bajan la búsqueda más rápido, abren casas seguras y le dan la confianza del barrio.
- **Los contratos** (📞) dan plata pero suben la búsqueda.

Así cada actividad pesa en la historia sin bloquear nada: todo sigue libre desde el inicio.

| Género | Actividad | Cómo con el motor | Estado | Prio. |
|---|---|---|---|---|
| **Arcade** | 🏁 carreras, ⚠️ saltos, 📸 radares, 〰️ drift (Forza); persecuciones | `Modos`, `Actividades`, `MC.Busqueda` | 🏁 hecho; el resto, P1 | P1 |
| **Mundo abierto** | Marcas de todo en la ciudad; teléfonos 📞 | `Actividades` (4.7) | Hecho; sumar 📞 | P1 |
| **Roguelite** | 🌙 **«Turno de noche»**: cadena de 3 a 5 contratos generados con la búsqueda que no baja; si te atrapan se pierde la carga de la partida, pero lo aprendido queda (contactos y mejoras del taller). Partidas de 5 a 8 min, como Hades y Soul Knight: dos capas, la de la partida y la permanente.[^rogue] | `Contratos`, `MC.Busqueda`, guardado | Nuevo | P2 |
| **Estrategia** | 🚦 centro de control (Traffix); 🚇 despachador (Railways) | `MC.Trafico.luces`, `MC.Transporte` | Nuevo | P1 / P2 |
| **Puzzles** | 🔀 distribución (Package Inc); ⚡ apagón (Infinity Loop); laberintos del sigilo | Mini vistas cenitales del mismo lugar | Nuevo | P2 |
| **Acción** | Sigilo (Hunter Assassin y Bullet Echo), persecución a pie, enfrentamientos 2D (18+) | `58-sigilo.js`, acción a pie | Parcial | P1 (indicadores de sonido) |
| **Gestión de recursos** | 🔧 taller *idle*; gasolina en la carretera; mercado de piezas (Chinatown Wars) | `G.dinero`, `MC.Desgaste` | Parcial | P2 |
| **Simulador de actividades** | 🚇 maquinista, 🚌 conductor de Metroplús (paradas y tiempo), 🚲 EnCicla, ✈️ avioneta | `60-modos.js` | 🚇 y 🚲 hechos; 🚌 = 🚇 con el bus real (P1) | P1 |
| **Contra el reloj** | 📦 mandados, 📸 radares, 📻 central de domicilios | `Modos` | 📦 hecho | P1 / P2 |
| **Rol** | Habilidades que suben jugando; reputación por barrio; rivales y contactos con memoria; subtramas | `G.rep`, § 6 | Base | P2 |

---

## 6. Un mundo vivo con peso: RPG y «MMO sin servidor»

1. **Reputación por barrio** (no solo por grupo):
   - cada barrio recuerda lo que hiciste ahí (entregas, ayudas, persecuciones);
   - el mapa grande lo muestra como capa;
   - en un barrio con buena reputación, los vecinos te esconden (💤 la búsqueda baja más rápido);
   - en uno con mala, te delatan.
2. **Subtramas cortas** (3 a 5 pasos) que nacen de los lugares reales:
   - «el kiosco del parque que cierra»: mandados;
   - «la ciclorruta rota»: Run;
   - «el maquinista enfermo»: el turno de metro;
   - «el barrio sin luz»: el apagón.
   Gemini trabaja las crónicas en `62-mundo-vivo.js`. Desde § 5 propongo que **cada subtrama use una actividad existente** como cuerpo, para no crear sistemas nuevos.
3. **Personajes con memoria:** rivales de carrera, contactos del taller, la gente con nombre. Recuerdan la última vez y lo comentan con un subtítulo corto y la cara de `MC.Rostro`.
4. **Habilidades por uso** (San Andreas): subidas pequeñas y visibles, con tope del 20 %. No bloquean nada: solo se nota que mejoras.
5. **«MMO» sin internet en el juego** (regla del proyecto):
   - **fantasmas de carrera y récords que se comparten** por código QR o enlace (El Metro ya tiene `05-qr.js`);
   - **mensajes en la ciudad** (Sky): una nota en un mirador que otro jugador recibe al importar tu código;
   - **carreras en red local** por WebRTC (EnCicla ya lo tiene en `tests/run.js`: carrera en red de 3).
6. **Cultura y conciencia**, sin sermón:
   - ceder el paso en el semáforo (multa en 🚲);
   - el peatón primero (El Metro lo hace);
   - los trabajadores de la noche;
   - las crónicas del barrio (UnoCero, el juego terminado del autor, sirve de tono).

---

## 7. Run en las ciclovías

**Lo que ya existe** (`js/50-run.js`, Run Scooter importado):
- solo se entra desde una ciclovía;
- el corredor sigue **la ciclorruta real**: su relieve, sus curvas y, en cada cruce, la que continúa (las esquinas son reales).

En 4.7 se sumaron la marca 🛴 en el mundo abierto y la entrada desde 🎮.

**Lo que falta** (el código del corredor es el de Run Scooter, se importa con `herramientas/importar-run.mjs` y sus parches; no se edita a mano):

| Pedido | Propuesta | Prio. |
|---|---|---|
| Calles que cambian de grandes a estrechas | El ancho del corredor sale de `VIA_ANCHO[k]` del tramo real (ciclorruta 2,4 m, calle 6, avenida 12). Si se angosta, los carriles pasan de 3 a 2 con un aviso visual. Es un parche nuevo en `importar-run.mjs`. | P1 |
| Obstáculos verosímiles | Los del mobiliario real del tramo (`MC.Mobiliario`: postes, canecas, bancas) en vez de obstáculos al azar | P2 |
| Zonas de skate y trucos | Donde el tramo pasa junto a una plaza (`TT.PLAZA`), una **zona de trucos** de 100 m con rampas y barandas para *grind* (Alto[^alto]) | P1 |
| Parkour | A pie, saltar bancas y barandas da impulso (Vector) | P2 |
| Estas zonas en el mundo abierto | 🛹 marcas en las plazas (hecho en 4.7) y 🛴 en las ciclorrutas (hecho) | Hecho |

---

## 8. Cámaras y vistas: para qué sirve cada una

| Vista | Para qué | Estado 4.7 | Acción |
|---|---|---|---|
| 🗺️ Cenital 3D | La principal: GTA 1 y 2, lectura del tráfico, carreras | A 79° y 66°, se aleja con la velocidad (4.7) | — |
| 🏙️ Ciudad 3D (oblicua) | Ver fachadas y relieve | Bien | — |
| 🎮 Tercera persona | Manejo inmersivo y Run | Avanza de lado (4.7) | P2: que la cámara anticipe el rumbo en la curva |
| 👁️ Primera persona | Manejar el tren y contemplar | En el selector (4.7) | Gemini arregla que no choque con la propia malla |
| 🚁 Dron | Ver la persecución desde arriba y atrás | En el selector (4.7) | — |
| 🧊 Maqueta 2:1 | Contemplación, postal, diseño | Bien | P3: modo postal |
| 🏁 Arcade (pseudo‑3D) | Carretera entre ciudades y carreras | Solo ahí (4.7) | — |
| ⛰️ Vuelo (Voxel Space) | Jetpack y avioneta | Solo volando (4.7) | — |
| ↔️ Lateral 2D | Tren (Train Chu), enfrentamientos, parkour | Existe en el motor; no se usa en los modos | **P2:** usarla en 🚇 y en los enfrentamientos |
| 🎬 Panorámica | Postal y créditos | **En blanco en Turno Cero** (`E.pano` vacío, hallazgo de Gemini) | Fuera del selector hasta llenarla |
| 🕹️ Retro pixel | Estilo | Existe | — |
| Horizontal y vertical | Toda la interfaz | Hecho (4.6) | — |

---

## 9. Arte y gráficos: lo que más rinde

| Prioridad | Qué | Por qué | Quién |
|---|---|---|---|
| 1 | **Rellenar manzanas sin casas** (hallazgo A11) con casas modulares por reglas (WFC) e instancias | Es la diferencia más visible entre «simple» y «ciudad» en tercera persona | **Pide el visto bueno del autor:** en la 4.5 dijo que el mapa es de las IA que lo desarrollan. Si lo autoriza: Claude hace las reglas (`26-urbe.js`, `12-generador.js`), con las piezas de Gemini y Codex. |
| 2 | Iluminación: luz hemisférica de cielo y suelo, especular, *rim*, AO por altura y niebla de distancia | Realismo barato sin texturas pesadas | **Gemini** (`45-gl.js`, `45-gl3d.js`) |
| 3 | Fachadas por zona (`ciudades/<id>.json`) con ventanas, balcones y toldos en atlas | Medellín se reconoce por el ladrillo y las terrazas | Gemini y Codex (arte) |
| 4 | Vegetación: árboles por especie y altura según el clima, y pasto con variación | Las laderas verdes del Valle | Gemini |
| 5 | Modelos de los vehículos y personajes (GLB) | Ya hay 45, con caras (4.5) | Codex (arte 3D) |
| 6 | Pixel y 2D: losas más finas, sombras de pixel y paleta por hora | Para el Retro, la maqueta y el diseño | Gemini (`41-vista2d.js`, `47-clasicos.js`) |

---

## 10. Hoja de ruta y reparto entre las tres IA

| Versión | Qué | Claude | Gemini (Antigravity) | Codex (ChatGPT) |
|---|---|---|---|---|
| **4.7** (esta) | Ritmo, todo liberado, actividades en el mundo, 🛹, cámaras por contexto, hallazgos de Gemini | ✅ | Iluminación, primera persona y raster; `62-mundo-vivo.js` | Arte de actos y menú (unido) |
| **4.8** | **P1:**<ul><li>⚠️ 📸 〰️ retos de Forza;</li><li>🚦 centro de control (Traffix);</li><li>🚌 Metroplús como modo;</li><li>indicadores de sonido;</li><li>esquema de controles SAR;</li><li>Run con anchos reales y zonas de trucos;</li><li>*grind* en 🛹;</li><li>📞 teléfonos.</li></ul> | Jugabilidad, cámaras y `importar-run.mjs` | Fachadas y vegetación; anillos visuales de las marcas | Arte de los rivales y del taller |
| **4.9** | **P2:**<ul><li>🌙 Turno de noche (roguelite);</li><li>🚇 despachador;</li><li>🔀 distribución;</li><li>⚡ apagón;</li><li>🔧 taller *idle*;</li><li>reputación por barrio;</li><li>habilidades;</li><li>fantasmas por QR;</li><li>lateral 2D en el tren;</li><li>avioneta.</li></ul> | Sistemas | Subtramas y crónicas, miradores, avioneta | Retratos y escenas |
| **5.0** | Pulido total, prueba en celulares reales con GPU, accesibilidad y la trama final | Integración | Render | Historia y arte |

**Reglas para no chocar** (`coord/agentes/*.json`):
- Claude: `60-modos.js`, `20-juego.js`, `90-inicio.js`, `40-dibujo.js`, `50-extras.js`, `32-fisica.js`, `37-manejo.js`, `46-vistas.js`, `34-camara.js`, `50-run.js` y las pruebas.
- Gemini: `45-gl.js`, `45-gl3d.js`, `44-raster.js`, `47-clasicos.js`, `41-vista2d.js` y `62-mundo-vivo.js`.
- Codex: `70-interfaz.js`, `30-historia.js` y el arte.
- Si alguien necesita un gancho en archivos de otro, lo pide en `coord/buzon/`.

---

## 11. Lo que no recomiendo (ideas sin cabida, con la razón)

| Idea | Por qué no |
|---|---|
| Servidores MMO en tiempo real | La regla es un solo HTML, sin internet en el juego. La alternativa verosímil está en § 6.5. |
| Simulador de vuelo o espacio realista (Spaceflight Simulator) | Rompe el ritmo arcade y el tono. La avioneta arcade y el 🌍 planeta cubren la fantasía. |
| Constructor de ciudades completo (Cities: Skylines) | La ciudad es real y es de las IA del mapa. Sí caben capas de datos para leerla. |
| Texturas fotorrealistas grandes y KTX2 | El tamaño del HTML y la regla de no usar librerías. Mejor luz, *vertex color*, atlas pequeños e instancias. |
| Juegos aparte por cada modo | El autor lo pidió explícito: un solo juego. Todo modo vive en el mundo. |
| Bloquear contenido detrás de la historia | El autor quiere probar todo antes de pulir la trama. |

---

## 12. Fuentes
[^sar]: Super Arcade Racing: dos botones (acelerar y frenar), ideal para el celular, inspirado en los arcades de los 80 y 90. [Pocket Gamer](https://www.pocketgamer.com/articles/081706/five-reasons-to-play-super-arcade-racing-from-outofthebit-studio/), [TouchArcade](https://toucharcade.com/games/super-arcade-racing). Juegos de *drift* con un dedo: [Thumb Drift](https://www.pocketgamer.com/thumb-drift/review/), [One Tap Drift](https://hellofish.itch.io/one-tap-drift).
[^drive]: #DRIVE: manejo infinito, gasolina, policía, donas para los policías; críticas de dirección «flotante» y poca variedad. [App Store](https://apps.apple.com/gb/app/id1366180154?l=en-gb), [Nintendo](https://ec.nintendo.com/apps/01000F20122FA000/US).
[^pako]: PAKO Forever: mapas generados, un golpe y se acaba, policías, tanques y helicópteros; quejas por apariciones de frente. [Kotaku](https://kotaku.com/games/pako-forever), [GamePressure](https://www.gamepressure.com/games/pako-forever/z3555d), [App Store](https://apps.apple.com/gb/app/pako-forever/id1352933197).
[^frl]: FR Legends: tándem con jueces que miran línea, ángulo, compromiso y cercanía. [App Store](https://apps.apple.com/app/id1435740083), [SourceForge](https://sourceforge.net/app/fr-legends/android/).
[^fh]: Forza Horizon: radares de velocidad, zonas de velocidad, carteles de peligro y zonas de drift sobre la vía; premia la conducción arriesgada. [Wikipedia](https://en.Wikipedia.com/wiki/Forza_Horizon), [Guides4Gamers](https://guides4gamers.com/forza-horizon-4/map/world-map/), [GamesRadar](https://gamesradar.com/forza-horizon-3-skill-points-reward-you-for-dangerous-driving).
[^gta2]: GTA 1 y 2: la cámara sube en el carro y más con la velocidad; baja a pie. [gta.wiki](https://gta.wiki/w/Top-Down), [80.lv: la física de GTA 1 en el navegador](https://80.lv/articles/gta-1-s-vehicle-physics-are-now-playable-in-your-browser).
[^traffix]: Traffix: semáforos en rojo por defecto, el amarillo deja pasar uno, doble toque da verde; un choque y se pierde. Traffix 3D: mantener el dedo. [App Store (City Rush)](https://apps.apple.com/app/id1465703539), [App Store (3D)](https://apps.apple.com/app/id1483904390), [TouchArcade](https://toucharcade.com/games/traffix-city-rush).
[^rail]: Railways: detener trenes con un toque, arrastrar para hacer vía, recoger pasajeros de su color, evitar choques. [App Store](https://apps.apple.com/app/id1492002834), [Nintendo](https://nintendo.com/store/products/railways-switch).
[^911]: 911 Operator: mapas reales de OpenStreetMap con calles, direcciones e infraestructura de emergencia; despacho de 12 tipos de unidades. [Steam](https://store.steampowered.com/app/503560), [MobyGames](https://www.mobygames.com/game/84193).
[^be]: Bullet Echo: la visión la limita la linterna; los pasos y disparos se oyen. [Pocket Gamer](https://www.pocketgamer.com/articles/083149/bullet-echo-is-a-stealthy-battle-royale-game-from-zeptolab-thats-available-now-for-ios-and-android/), [App Store](https://apps.apple.com/ca/app/bullet-echo/id1500726361).
[^alto]: Alto's Odyssey: backflip con el toque sostenido; *grind* y *wall ride* mantienen el combo; puntos por truco y por metro. [iMore](https://www.imore.com/altos-odyssey-tips-and-tricks-help-you-escape-lemurs-ride-walls-over-chasms-and-more), [Pocket Gamer](https://www.pocketgamer.com/altos-odyssey/altos-odyssey-cheats-and-tips-everything-you-need-to-level-up-and-get-high-score/), [iMore, entrevista al equipo](https://www.imore.com/the-evolution-altos-odyssey-q-and-a).
[^vector]: Vector (Nekki): *parkour runner* con perseguidor; movimientos que no dependen de memorizar combinaciones. [GameRamble](https://gameramble.com/?p=9056).
[^skate]: Controles de skate táctil: trucos con deslizar y mantener ([Pocket Skate](https://www.imore.com/gaming/ios-games/ios-game-of-the-week-pocket-skate-2022)); demasiados gestos confunden ([Kotaku, Skate It](https://kotaku.com/skate-it-micro-review-skate-or-die-5543467)). No hallé una reseña de Skate Space.
[^towns]: Townscaper y Bad North: rejilla irregular y WFC con piezas hechas a mano. [Game Developer](https://www.gamedeveloper.com/game-platforms/how-townscaper-works-a-story-four-games-in-the-making), [80.lv](https://80.lv/articles/using-wave-function-collapse-algorithm-for-dioramas), [WFC (GitHub)](https://github.com/mxgmn/WaveFunctionCollapse).
[^sky]: Sky: conexión y colaboración por encima de la competencia; MMO casi sin combate. [Apple Developer](https://developer.apple.com/news/?id=zm47it7t), [Wikipedia](https://en.Wikipedia.com/wiki/Sky_(video_game)).
[^swink]: Steve Swink, *Game Feel* (definición). [Wikipedia](https://Www.wikipedia.org/wiki/Game_feel), [Game Developer](https://www.gamedeveloper.com/design/principles-of-virtual-sensation).
[^shake]: «The Art of Screenshake» (Vlambeer) y «Juice it or Lose it». [Brendan Keogh, lecturas sobre game feel](https://brkeogh.com/2017/03/31/an-incomplete-game-feel-reader/), [GameAnalytics](https://www.gameanalytics.com/blog/squeezing-more-juice-out-of-your-game-design).
[^webgl]: Presupuesto de llamadas de dibujo en móvil y buenas prácticas (atlas, instancias, LOD). [MDN](https://developer.mozilla.org/en-US/docs/WebGL/WebGL_best_practices), [PlayCanvas](https://developer.playcanvas.com/user-manual/optimization/guidelines/), [Godot](https://docs.godotengine.org/en/3.6/tutorials/performance/gpu_optimization.html).
[^rogue]: Roguelite de dos capas (la partida y la permanente) y el equilibrio de la meta‑progresión. [GameSpot sobre Hades](https://gamespot.com/articles/hades-changes-what-it-means-to-be-a-roguelike/1100-6483420/), [GameBrief](https://www.gamebrief.net/glossary/meta-progression).

**Límites de esta investigación:**
- No pude jugar los juegos del celular. Lo que digo de ellos sale de reseñas, fichas oficiales y técnicas conocidas, y lo marco con su fuente.
- No encontré fichas públicas de *Train Chu* ni reseñas de *Skate Space*; para esos dos me guío por lo que pide el autor.
- Los videos de YouTube que el autor compartió no los pude ver desde aquí.
