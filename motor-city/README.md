# Motor City

**Un motor de videojuegos de mundo abierto que convierte cualquier lugar real, o uno inventado, en un mundo jugable con leyes reales.** Funciona en un solo HTML, sin internet, en cualquier celular.

- Lo comparten **Juega EnCicla**, **El Metro** y los juegos que vienen: *Motor City* (carreras) y *Extremo* (deportes extremos).
- **Run Scooter** corre dentro de ellos: el modo «Run en la ciclovía».

| | |
|---|---|
| **Jugar en la web** | <https://juanfeliperico369-stack.github.io/motorcity/>. Juegos:<ul><li>**Turno Cero** (18+, Manhattan, Medellín y Guatapé en un planeta): [dist/juegos/getaway.html](https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/getaway.html)</li><li>minijuego **Mandados**: [dist/juegos/mandados.html](https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html)</li></ul> |
| **Documento único** (contexto, código a usar y plan de cada IA) | [`docs/DOCUMENTO-UNICO.md`](docs/DOCUMENTO-UNICO.md) · todo junto con anexos: `dist/MOTOR-CITY-TODO.md` |
| Versión | **4.0.0** · `VERSION.json` · el planeta y *Turno Cero*: [`docs/TURNO-CERO.md`](docs/TURNO-CERO.md) |
| Referencias del autor (25 fichas) | [`docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`](docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md) |
| Inspiración visual y motores potentes | [`docs/INSPIRACION-VISUAL.md`](docs/INSPIRACION-VISUAL.md) · [`docs/MOTORES-POTENTES.md`](docs/MOTORES-POTENTES.md) |
| **Tareas de cada IA** («mira el repositorio y haz tu parte») | [`TAREAS-IA.md`](TAREAS-IA.md) |
| **¿Está todo lo pedido?** | [`docs/PEDIDOS.md`](docs/PEDIDOS.md): cada pedido, su estado y dónde quedó |
| Cómo se usa | [`docs/MANUAL.md`](docs/MANUAL.md) |
| Guía completa | [`docs/GUIA.md`](docs/GUIA.md) |
| Contrato técnico | [`MOTOR.md`](MOTOR.md) |
| Investigación | [`docs/INVESTIGACION.md`](docs/INVESTIGACION.md) |
| Optimización | [`docs/OPTIMIZACION.md`](docs/OPTIMIZACION.md) |
| Usos y negocio | [`docs/NEGOCIO-Y-USOS.md`](docs/NEGOCIO-Y-USOS.md) |
| Para una IA que retome | [`CONTEXTO-IA.md`](CONTEXTO-IA.md) · [`AGENTS.md`](AGENTS.md) · [`CONTRIBUIR.md`](CONTRIBUIR.md) |
| Bitácora | [`BITACORA.md`](BITACORA.md) |

## Qué trae
- **Mundos:**
  - **un planeta** (4.0): Manhattan, Medellín y el Valle y Guatapé, unidos por carreteras generadas de 12 a 16 km en medio de la nada (`MC.Planeta`), con globo y horizonte curvo;
  - **reales**: Manhattan (craqueado a 6 m), Medellín completo (639.457 edificios, 35.746 calles, metro, cables, Metroplús y EnCicla), y Guatapé craqueado en 20 s desde datos abiertos (`geo/territorio.py`);
  - **inventados**: isla, valle, costa, montaña o llanura por semilla (`MC.Generador`);
  - **planetas enteros**: estrellas y planetas con leyes reales y relieve infinito (`MC.Cosmos`).
- **Vistas** (+ **pixel** en todas):
  - cenital, ciudad 3D, maqueta 2:1;
  - **lateral** (de lado, como una casa de muñecas, y gira de a 90° como FEZ);
  - panorámica de perfil;
  - tercera y primera persona, dron y cine.
- **GPU virtual:** si no hay WebGL, o es lento, la 3D la dibuja el **raster por software**. La resolución se ajusta sola y el bucle es de paso fijo.
- **Física y ciencia reales:**
  - puentes y niveles por superficies, con tiempo de coyote;
  - carro con derrape y taller de ingeniería;
  - química con balanceo exacto, clima con estaciones y nieve;
  - biología de personas, animales y criaturas;
  - economía en partida doble.
- **Mi casa:** el jugador escribe **su dirección real** («Calle 31 # 28‑15») y el juego le da **su casa**: el edificio real, con un interior propio que diseña con muebles. **La dirección no sale del celular.**
- **Lugares jugables:** talleres (reparar y mejorar), tiendas, restaurantes, centros comerciales, bibliotecas (aprender algo real) y parques.
- **Mundo vivo:** gente con rutinas, tráfico con semáforos, transporte con horario, día y noche, y estaciones.
- **Historias** con tres pilares: diversión, reflexión y conciencia. Las elige un **director de ritmo** que alterna tensión y respiro.
- **Ocurrencias:** lo imprevisto se corrige solo y se anota para mejorar.
- **Manejo:** curvas de respuesta, giro según la velocidad, asistencias y 7 esquemas de control (joystick, volante, un pulgar, inclinar, tocar para ir, carriles…).
- **Interfaz que no estorba:** el centro es del juego, lo que no cambia se atenúa y hay un aviso a la vez.
- **Sprites** con atlas, animación por fase, 8 direcciones, 9‑slice y fondo magenta.
- **Música procedural:** electrónica, rock, jazz y lo‑fi, más clásicos de dominio público.
- **2.3, la ciudad como SimCity, Los Sims, Cities: Skylines y Townscaper:**
  - **sombras del sol** según la hora;
  - **mobiliario urbano** (postes, árboles, bancas, paraderos, cebras) y luces de noche;
  - **fachadas armadas por reglas** (WFC);
  - **simulación de ciudad** (zonas, demanda RCI, valor del suelo, servicios, contaminación, crecimiento, niveles y presupuesto), con **capas de datos**;
  - **objetos inteligentes** (alguien vive en tu casa y usa lo que pongas);
  - rejilla irregular y autotile;
  - **paisaje sonoro**.
- **2.4, terreno y límites verosímiles:**
  - agua por tipo (mar, lago, río, quebrada) y por profundidad: se vadea, se nada y la lancha necesita calado;
  - montañas con pendiente máxima por vehículo, y roca, monte, arena y nieve;
  - rocas, palmas, frailejones y juncos;
  - nada se atraviesa sin sentido (emblemáticos, árboles, postes, tráfico);
  - lagos en los mundos generados.
- **2.5, entrar al agua:** se deja el vehículo en la orilla, se nada y se bucea con aire limitado; se sale y se vuelve a subir; y la lancha se alquila y se amarra.
- **2.5.1, Mandados jugable de verdad:**
  - joystick visible, botones de acción y cámara cerca;
  - flecha al objetivo y tutorial;
  - **modo libre** con todo gratis y los 34 vehículos;
  - en computador, flechas o WASD;
  - **el arte de Gemini integrado** (`arte/gemini/`, `MC.Pieles`): postes, bancas, fachadas y muebles, con respaldo procedural.
- **2.6, estilo realista familiar:**
  - árboles de pie con volumen (`MC.Arboleda`): guayacanes florecidos, ceibas, mangos; ya no «tapetes» en el piso;
  - asfalto con parches, grietas y alcantarillas, andenes de baldosa con bordillo y pasto con parches secos;
  - tejas de barro y planchas con humedad, y muros con la base sucia;
  - tutorial opcional;
  - el estilo clásico (plano) sigue disponible.
- **2.7, estilos, peso y motores potentes:**
  - 8 estilos: realista, clásico, cómic, manga, anime, novela gráfica, ukiyo-e y acuarela, con paletas de obras de dominio público;
  - peso y vida: aterrizajes con aplastamiento, hitstop, bandadas, hojas, polvo y salpicaduras;
  - el mundo exportado en glTF 2.0, alturas RAW 16 y escena JSON para Godot, Unity, Unreal, Blender y three.js.
- **2.8, de la entrega maestra de referencias:**
  - palomas que alzan vuelo y huellas en arena, tierra, nieve y barro;
  - faros y luces de freno;
  - los estilos vintage, CRT y térmico;
  - sacudida y partículas ajustables;
  - telemetría en percentiles y calidad baja, media o alta;
  - contratos de datos versionados (`schemas/`).
- **2.9, las entregas de Gemini y de ChatGPT y Codex, unidas:**
  - arte de ChatGPT a escala (personas, vehículos, árboles, suelos, fachadas y animales);
  - charcos con lluvia, el estilo de 1 bit y el agua precalculada;
  - adaptadores de Godot y three.js;
  - la maqueta a 22 ms.
- **2.10, todo unido, más liviano y con las skills de los videos:**
  - el cómic y el 1 bit sin leer la pantalla;
  - Mandados de 5,1 MB (antes 8,2);
  - rutas por la calle bien hechas;
  - las skills Hallmark, Modern Web Guidance, find-skills y HyperFrames (`node motor.mjs skills`);
  - el **público simulado** (`node motor.mjs publico`).
- **2.11, fluidez:** la densidad del lienzo se ajusta sola, la capa de suelo y el camino del cómic y del 1 bit medido en cada aparato.
- **3.0, un solo mundo 3D y varias cámaras:**
  - la cenital, la ciudad y la maqueta son cámaras sobre el mismo mundo 3D (respaldo 2D sin GPU);
  - fachadas, árboles low-poly, carros y gente con detalle;
  - topes de zoom, cámara continua y mapa grande;
  - artilugios físicos (`MC.Objetos`).
  La investigación está en `docs/INVESTIGACION-CAMARA.md`.

## Trabajar en el motor
```bash
node motor.mjs construir            # dist/motor.js, los mundos, dist/motor-city.html y dist/juegos/*.html
node motor.mjs prueba --navegador   # 137 pruebas: ciencia, mundo, terreno, física, vistas, casa, lugares, historias, cosmos, ciudad y Mandados
node motor.mjs documento            # dist/MOTOR-CITY-TODO.md: el documento único con todo
node motor.mjs publico              # el público simulado (niña, abuelo, gamer y turista) juega Mandados → dist/publico.md
node motor.mjs skills               # las skills externas y cómo instalarlas
node motor.mjs nuevo juego nombre   # un juego nuevo desde la plantilla
node motor.mjs reporte "título" --juego encicla   # obligatorio si otra IA cambia el motor
node motor.mjs sincronizar ../BicicletasUno       # copia el motor a BicicletasUno/motor-city/
python3 geo/territorio.py --id x --nombre "X" --bbox=lon0,latS,lon1,latN   # craquear un lugar real
```

## Estructura
| Carpeta o archivo | Qué hay |
|---|---|
| `js/` | El motor en fragmentos numerados (`00-` a `86-`) → `dist/motor.js`. `valle.js` es el lector 1.x de EnCicla (no se toca). |
| `juegos/` | Juegos hechos con el motor (Mandados) → `dist/juegos/*.html`. |
| `plantillas/` | Plantillas de juego y de módulo. |
| `ciudades/`, `datos/` | Reglas de estilo de cada lugar y sus mundos MC4. |
| `geo/` | Craqueo de territorios: Overture/OSM y SRTM. |
| `herramientas/` | Construir, fusionar, importar Run, sincronizar, nuevo y reporte. |
| `sandbox/` | El banco de pruebas de Medellín. |
| `pruebas/` | Las pruebas del motor. |
| `reportes/` | Los cambios que piden o hacen las IAs de cada juego. |
| `docs/` | Manual, guía, investigación, optimización, plan de las IAs, peticiones, negocio y migraciones. |
| `.claude/skills/` | Skills del proyecto (las siguen todas las IAs). |

## Atribución
- © colaboradores de OpenStreetMap (ODbL), vía Overture Maps Foundation.
- Huellas de edificios de Overture (OSM, Microsoft ML Buildings y Google Open Buildings).
- Capas oficiales de Medellín (Catastro, malla vial y barrios).
- Relieve SRTM (NASA), vía AWS Terrain Tiles.
- Música clásica de dominio público, con transcripción propia.
- Run Scooter, Juega EnCicla y El Metro son del mismo autor (OneZero).
