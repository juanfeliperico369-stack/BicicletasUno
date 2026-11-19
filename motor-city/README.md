# Motor City

**Un motor de videojuegos de mundo abierto que convierte cualquier lugar real, o uno inventado, en un mundo jugable con leyes reales.** Funciona en un solo HTML, sin internet, en cualquier celular.

- Lo comparten **Juega EnCicla**, **El Metro** y los juegos que vienen: *Motor City* (carreras) y *Extremo* (deportes extremos).
- **Run Scooter** corre dentro de ellos: el modo «Run en la ciclovía».

| | |
|---|---|
| **Jugar en la web** | <https://juanfeliperico369-stack.github.io/motorcity/> · minijuego **Mandados**: [dist/juegos/mandados.html](https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html) |
| Versión | **2.2.0** · `VERSION.json` |
| Cómo se usa | [`docs/MANUAL.md`](docs/MANUAL.md) |
| Guía completa | [`docs/GUIA.md`](docs/GUIA.md) |
| Contrato técnico | [`MOTOR.md`](MOTOR.md) |
| Plan de cada IA | [`docs/PLAN-IAS.md`](docs/PLAN-IAS.md) |
| Peticiones a Gemini y ChatGPT | [`docs/PETICION-GEMINI.md`](docs/PETICION-GEMINI.md) · [`docs/PETICION-CHATGPT.md`](docs/PETICION-CHATGPT.md) |
| Investigación | [`docs/INVESTIGACION.md`](docs/INVESTIGACION.md) |
| Optimización | [`docs/OPTIMIZACION.md`](docs/OPTIMIZACION.md) |
| Usos y negocio | [`docs/NEGOCIO-Y-USOS.md`](docs/NEGOCIO-Y-USOS.md) |
| Para una IA que retome | [`CONTEXTO-IA.md`](CONTEXTO-IA.md) · [`AGENTS.md`](AGENTS.md) · [`CONTRIBUIR.md`](CONTRIBUIR.md) |
| Bitácora | [`BITACORA.md`](BITACORA.md) |

## Qué trae
- **Mundos:**
  - **reales**: Medellín completo (639.457 edificios, 35.746 calles, metro, cables, Metroplús y EnCicla), y Guatapé craqueado en 20 s desde datos abiertos (`geo/territorio.py`);
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

## Trabajar en el motor
```bash
node motor.mjs construir            # dist/motor.js, los mundos, dist/motor-city.html y dist/juegos/*.html
node motor.mjs prueba --navegador   # 103 pruebas: ciencia, mundo, física, vistas, casa, lugares, historias, cosmos y Mandados
node motor.mjs nuevo juego nombre   # un juego nuevo desde la plantilla
node motor.mjs reporte "título" --juego encicla   # obligatorio si otra IA cambia el motor
node motor.mjs sincronizar ../BicicletasUno       # copia el motor a BicicletasUno/motor-city/
python3 geo/territorio.py --id x --nombre "X" --bbox=lon0,latS,lon1,latN   # craquear un lugar real
```

## Estructura
| Carpeta o archivo | Qué hay |
|---|---|
| `js/` | El motor en fragmentos numerados (`00-` a `85-`) → `dist/motor.js`. `valle.js` es el lector 1.x de EnCicla (no se toca). |
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
