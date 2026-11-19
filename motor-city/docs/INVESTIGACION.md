# Investigación: lo que se aprendió de los mejores juegos y motores, y cómo quedó en Motor City

> Cada idea dice **de dónde viene**, **qué enseña** y **dónde quedó en el motor** (módulo `MC.*`).
> Las fuentes están al final. Donde una fuente no confirma un detalle técnico, se dice.

## 1. Vistas y dimensiones: un mismo mundo, muchas formas de mirarlo
| Juego | Qué hace | Qué se tomó para Motor City |
|---|---|---|
| **FEZ** (Polytron, 2012) | El mundo es 3D, pero el jugador lo ve desde 4 lados en 2D y gira de a 90°. Lo que parece lejos en un lado queda pegado en otro. Primero se juega en 2D puro y después se presenta el giro. | Vista **lateral** (`lateral`): la ciudad real vista de lado, con giros animados de a 90° (`camara.girar90`). La maqueta 2:1 también gira de a 90°. |
| **Monument Valley** (ustwo, 2014) | Proyección **ortográfica** (sin perspectiva): las ilusiones de geometría imposible solo funcionan así y desde ciertos ángulos. Diseño de «menos juego, más experiencia». | Las vistas 2D del motor son ortográficas (una sola proyección con giro, aplastamiento y altura: `Vista2D.parametros`). La maqueta 2:1 (dimétrica) sirve para puzles de perspectiva. |
| **Little Nightmares** (Tarsier) | Mundo 3D con cámara de lado y fija que se desplaza: efecto de **casa de muñecas**. Movimiento completo en profundidad, aunque juzgar la profundidad cuesta. | La vista lateral corta la ciudad como una casa de muñecas: cielo arriba, **corte de la tierra** abajo y una franja de calle con profundidad. Para el problema de la profundidad: **rayos X**, porque lo que tapa al jugador se vuelve transparente. |
| **GTA, Forza Horizon, Need for Speed** | Cámara de persecución con resorte, campo visual que se abre con la velocidad, cámara que esquiva paredes y vistas que se cambian con un botón. | `MC.Camara`: **resortes críticamente amortiguados**, **brazo con choque** (no atraviesa edificios ni cerros, ni se mete en el tablero de un puente), **FOV según la velocidad** y **sacudida por trauma** en los choques. |
| **Juegos de pixel art y cenitales** | Píxeles enteros, sin suavizado y con escala fija por metro. | Pixel en todas las vistas (búfer pequeño agrandado) y `MC.Escala.pxPorMetro(…, entero)`. |

**Regla del motor:** el mundo es uno solo, en metros. Las vistas son maneras de proyectarlo; ninguna tiene datos propios. Por eso un juego puede pasar de cenital a lateral, a 3D o a pixel sin perder nada.

## 2. Física y lógica: que se sienta justo
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

## 3. Mundos procedurales: la lección de No Man's Sky
- **Una semilla define un planeta entero.** Lo que no se guarda se vuelve a calcular igual. La generación es continua y por etapas: forma del terreno, superficie, texturas, población y simulación (charla de Hello Games en la GDC 2017, «Continuous World Generation in No Man's Sky»).
- **Jerarquía de semillas** (universo → galaxia → sistema → planeta → región → objeto) y **ruido continuo sin bordes**: cualquier región se genera en cualquier orden y empata con sus vecinas.
- **En Motor City:**
  - `MC.Cosmos` crea estrellas con abundancias reales (muchas enanas rojas) y luminosidad L ≈ M^3,5;
  - crea planetas con órbitas de Kepler, gravedad, temperatura de equilibrio con invernadero y atmósfera retenida o perdida;
  - del planeta salen el mundo jugable (`MC.Generador`) y criaturas verosímiles a esa gravedad;
  - `Cosmos.altura(semilla, x, y)` es un relieve **infinito y continuo** (fractal con crestas y deformación de dominio).

  Nota: los detalles internos del «uber noise» de No Man's Sky no están confirmados en las fuentes revisadas; el motor usa la técnica conocida equivalente.

## 4. Historia y trama: diversión, reflexión y conciencia
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

## 5. Ocurrencias: lo que nadie previó
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

## 6. Interfaz, psicología y neurociencia
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

## 7. Controles y sensibilidad
- **Zona muerta radial** (que el dedo o el mando no «derive») y **respuesta exponencial** (lo pequeño es preciso y lo grande es rápido): el estándar de los juegos de mando.
- **Giro según la velocidad** (como la dirección asistida y los juegos de carreras): a 100 km/h el mismo gesto gira menos.
- **Asistencias** que se apagan:
  - frenar antes de la curva;
  - «imán de calle»;
  - acelerar solo.
- **Esquemas:** joystick flotante o fijo, volante y pedales, **tocar para ir** (camino A* por las calles), **inclinar el celular**, **un pulgar** y **carriles**.
- Todo está en `MC.Manejo`.

## 8. Sprites y arte
- **Atlas** (una imagen con muchos cuadros): menos cambios de textura y dibujo más rápido. Es el estándar desde los juegos de 8 bits hasta Unity y Godot.
- **Animación por fase:** los pies del sprite van al ritmo del paso real.
- **4 u 8 direcciones** para cenital e isométrico.
- **9‑slice** para marcos de interfaz.
- **Fondo magenta** que se vuelve transparente (la regla de las IAs de arte de El Metro).
- **Hornear** lo procedural a un atlas al arrancar.
- **Respaldo:** si el arte no está, el motor dibuja el suyo y anota qué falta.
- Todo está en `MC.Sprites`.

## 9. Los motores más grandes y qué juegos hicieron con ellos
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

## Fuentes
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
