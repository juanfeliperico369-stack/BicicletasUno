# Investigación · Motores clásicos livianos y potentes (Motor City 4.1)

> **Pedido del autor (21‑nov‑2026):**
> - investigar motores viejos que hoy son livianos pero muy potentes, y lo que se logró con ellos en sus años de gloria;
> - aplicarles ingeniería inversa;
> - ver cómo los usaron los mejores juegos;
> - traer partes de las versiones liberadas de los motores ya descontinuados.

## 0. La regla: sala limpia (léela antes de tocar nada)
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

## 1. Qué se trajo y dónde está (4.1)
Todo está en `js/47-clasicos.js` (motor) y en `juegos/getaway/55-clasicos.js` (Turno Cero). Las pruebas están en `pruebas/prueba.mjs` § 22 y en el banco de Chromium.

| Técnica | De dónde viene | Qué hacían con ella los mejores juegos | Cómo quedó en Motor City |
|---|---|---|---|
| **Carretera pseudo-3D por segmentos** | *Pole Position* (1982), *OutRun* (1986), *Lotus*, *Chase H.Q.* | Velocidad y curvas en máquinas sin 3D: la vía son tiras horizontales; las franjas alternas dan la sensación de velocidad; los objetos son sprites escalados; el paralaje de montañas va con el rumbo. | `MC.Arcade`, vista **🏁 Arcade**:<ul><li>la vía real (la autopista del tramo o la calle con sus empalmes) en segmentos de 6 m;</li><li>proyección de verdad, con recorte en el plano cercano;</li><li>franjas fijas al mundo;</li><li>lomas del relieve;</li><li>pinos, palmas y cactus según el bioma, y postes;</li><li>letreros con nombres de veredas, edificios del mapa como cajas, carros y patrullas con sirena;</li><li>faros de noche.</li></ul> |
| **Voxel Space** | *Comanche: Maximum Overkill* (NovaLogic, 1992); Kyle Freeman | Terreno con relieve detallado en 1992, sin polígonos: un mapa de alturas y uno de color, columna por columna, de adelante hacia atrás con un *y-buffer*. La luz va **pintada en el mapa de color**. Los pasos son más largos a lo lejos. | `MC.VoxelSpace`, vista **⛰️ Vuelo**:<ul><li>la ventana de 2 km se arma desde el MC4 (suelo, relieve, agua y edificios encima);</li><li>la luz va horneada por pendiente;</li><li>la ventana nueva se arma **por franjas** mientras se dibuja la anterior, para no trabar el juego;</li><li>niebla de distancia y carros como sprites.</li></ul> |
| **Gema de luz** | *Thief: The Dark Project* (Looking Glass, 1998) | La gema del HUD brilla según qué tan visible estás. Los guardias te ven según la luz del lugar: el primer juego de sigilo «en primera persona» de verdad. | `MC.Sigilo.luz/gema/alcance`:<ul><li>la luz sale de la hora real, de la **sombra de los edificios hacia el sol**, de los postes de la calle de noche y de los faros cercanos;</li><li>en lo oscuro, un guardia te ve a un tercio de su distancia;</li><li>en Turno Cero hay una gema ◆ en las misiones de sigilo.</li></ul> |
| **Sonido que viaja por caminos** | *Thief* | Los sonidos llegan por los caminos entre cuartos, no como burbujas que atraviesan muros. Se puede escuchar detrás de una puerta. | `MC.Sigilo.ruido`:<ul><li>es un Dijkstra en una rejilla de 4 m: el ruido rodea los edificios y entra por los callejones; a través de un muro llega muy apagado;</li><li>en Turno Cero, correr a pie o un motor cerca hace que un guardia vaya a mirar.</li></ul> |
| **DDA por casillas** | *Wolfenstein 3D* (id, 1992); *Catacomb 3‑D* | Rayos que recorren una cuadrícula sin saltarse ninguna casilla: en 1992 corría en un 286. | `MC.DDA.recorrer` y `MC.DDA.bloqueado(M, …)`: línea de visión exacta sobre las casillas del mundo (edificio, montaña o roca). |
| **Semillas que se tuercen** | *Elite* (Braben y Bell, 1984) | 8 galaxias de 256 sistemas en 32 KB: no se guardaba el universo, solo tres números de 16 bits que se «tuercen». Buscaron muchas semillas antes de dar con una buena. | `MC.Semilla`: las veredas y pueblos de la carretera (los letreros de la vista arcade) salen siempre iguales desde el nombre del tramo, sin guardar nada. Las sílabas son del español. |

## 2. Lo que queda por traer (pedidos en `TAREAS-IA.md` § 4.1)
| Técnica | De dónde | Para qué en Motor City | Quién |
|---|---|---|---|
| **Conjunto potencialmente visible (PVS)** | Quake (1996). Se precalcula qué zonas pueden verse desde cada zona y se descarta el resto antes de dibujar. | Manhattan por sectores de 1 km (C‑M34): precalcular qué sectores se ven desde cada sector, según la altura de los edificios, y no decodificar los demás. | Codex |
| **Caché de superficies y lightmaps** | Quake: la textura y la luz de cada cara se mezclan una vez en una caché y luego se dibuja desde ahí. | Fachadas de la ciudad 3D: hornear la luz del sol y de la noche por manzana (`MC.Sombras` ya calcula el sol). | Codex |
| **Mapas de luz por distancia (COLORMAP)** | Doom (1993): 32 tablas de paleta que oscurecen por distancia y por luz del sector, solo con búsquedas en tabla. | El estilo pixel y el 1 bit: niebla y oscuridad por distancia con una tabla, sin mezclar colores en cada cuadro. | Codex |
| **Sectores y portales** | Build, de Duke Nukem 3D (1996): el mundo son sectores 2D unidos por portales; se dibuja desde el sector donde está uno, siguiendo los portales. | Los interiores (`48-interiores.js`): cuartos como sectores y puertas como portales, para entrar a edificios sin cargar otro mundo. | Codex |
| **Tráfico de pocos modelos que se cambian según la búsqueda** | GTA III (2001), contado por su director técnico Obbe Vermeij: en PS2 el tráfico usaba unos pocos modelos y, con nivel de búsqueda alto, se cambiaban por patrullas. Rockstar también limitaba la velocidad en zonas densas para que el streaming alcanzara. | Turno Cero con 3 GB de RAM: un tope de modelos de tráfico por ciudad, que se cambian por patrullas al subir el nivel. | Claude (motor) con datos de Gemini |
| **Las direccionales como guía, sin HUD** | *The Getaway* (2002), el juego en que se inspira el nombre de la carpeta `getaway`: no tenía minimapa; las direccionales del carro marcaban el giro. | Un «modo cine» de Turno Cero sin flecha ni minimapa: las direccionales parpadean hacia la próxima esquina de la ruta. | Codex (luces del GLB) y Claude (ruta) |
| **Mode 7** | SNES (*F‑Zero*, *Super Mario Kart*): un plano inclinado con una transformación afín por línea. | El mapa grande inclinado en celulares sin GPU. | Libre |

## 3. Fuentes
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

## 4. Para la IA que siga
- Antes de traer otra técnica:
  - lee esta tabla;
  - pon la fuente;
  - escribe el código desde cero;
  - agrega una prueba con números que se puedan comprobar a mano (§ 22 de `pruebas/prueba.mjs`).
- Al terminar, **deja tu entrada en `CONTEXTO-RELEVO.md` § 8** y pídele lo mismo a la siguiente IA.
