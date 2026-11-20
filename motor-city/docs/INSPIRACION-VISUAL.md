# Inspiración visual · lo que aprendimos de las mejores obras y dónde quedó en el motor

> **La regla:** de las obras con derechos se toman las **técnicas**, nunca imágenes, personajes ni logos. El arte «de verdad» que se recopila y adapta es de **dominio público**: sus paletas están en `arte/dominio-publico/`, con fuente y licencia.

## 1. Las referencias del autor: la entrega maestra (nov‑2026)
El autor reunió los 14 reels, los videos y el análisis de ChatGPT y de Gemini en un solo documento: **`docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`**. Tiene:
- 25 fichas (R01–R25);
- el registro de los 14 enlaces;
- el sistema de peso y el de vida;
- la arquitectura portable y el rendimiento en móvil;
- el plan por fases.

**Qué es comprobado y qué no:**
- 17 fichas se vieron en video.
- 1 se identificó de forma indirecta (*Town Brush*).
- 7 dependen solo del informe de Gemini.
- Las cifras de las fichas («1000 NPC», «0,08 s», «60 FPS en cualquier celular») son **hipótesis del informe, no hechos**.

### Las 25 fichas y dónde quedaron en Motor City
| Ficha | Referencia | Lo que tomamos (la técnica, nunca el arte) | Estado |
|---|---|---|---|
| R01 | *The Sound of Fury* | Hitstop, contornos y efectos de tinta | ✅ `MC.Vida.impacto`, estilos `comic` y `novela` |
| R02 | Arte sci-fi con semitono | Semitono en las sombras, niebla de distancia | ✅ semitono · ⏳ niebla de distancia (C‑M17) |
| R03 | Calle cyberpunk pictórica | Pixel, neones y reflejos en charcos | ✅ modo pixel · ⏳ reflejos con lluvia (C‑M17) |
| R04 | *KnoxMap* (OSM → mapa jugable) | Lugares reales craqueados de datos abiertos | ✅ `geo/territorio.py`, `MC.Lugares` e interiores |
| R05 | Películas en estilo PS2 | *Mid‑poly* con texturas pintadas | ⏳ arte de ChatGPT (C‑A) y Godot (C‑M18) |
| R06 | *Project Zomboid* en 3.ª persona | Animaciones cotidianas (abrir, reparar, sentarse) | ⏳ Codex (C‑M21) |
| R07 | *Fable Rover* | Telemetría física; suspensión por rueda | ✅ `MC.Telemetria` · ⏳ suspensión (C‑M21) |
| R08 | *Mythictale* | Hitstop, polvo, sprites 2D en un mundo 3D | ✅ `MC.Vida`, `MC.Sprites` y onomatopeyas |
| R09 | *Motor Town* | Física de conducción; inclinación de la carrocería; lluvia | ✅ cabeceo y día/noche · ⏳ balanceo y suspensión (C‑M21) y lluvia (C‑M17) |
| R10 | *Town Brush* | El toque que despierta el mundo; viento; *pop* al colocar | ✅ viento en las copas y aplastamiento · ⏳ pincel de mundo (C‑M20) |
| R11 | *Cairn* | Apoyos y esfuerzo legibles | ✅ aterrizaje con peso · ⏳ IK de pies (C‑M21) |
| R12 | 4×4 en la playa (Godot) | **Fauna que huye**, surcos y cosas que se rompen | ✅ **palomas que alzan vuelo**, **huellas** · ⏳ props rompibles (C‑M21) |
| R13 | Pixel 3D nocturno | **Faros** y tablero en primera persona | ✅ **faros y luces de freno** · ⏳ tablero (C‑M21) |
| R14 | *Still The Game* (24 h) | Ventanas y farolas que se encienden, rutinas | ✅ reloj, ventanas, farolas y población |
| R15 | Ciudades en pixel art | Minijuegos sobre el mismo mapa | ✅ Run en la ciclovía y Mandados · ⏳ carreras de *Motor City* |
| R16 | *CityRT* | *Cel* con contorno, bajar a caminar, emergencias | ✅ estilos con tinta y modo alcalde · ⏳ emergencias (C‑M14) |
| R17 | *Miniopolis* | **Filtros intercambiables** | ✅ **11 estilos**, con **vintage** y **CRT** |
| R18 | *VoxPix* (API para agentes) | Construir barrios por código | ✅ contratos y esquemas (`schemas/`) · ⏳ API de construcción (C‑M20) |
| R19 | *Still The Game* (nieve) | Huellas y faros de noche | ✅ huellas en nieve, arena, tierra y barro; faros |
| R20 | *Induction Bench* | Laboratorio de física en vivo | ✅ telemetría en Ajustes · ⏳ gráficas (C‑M21) |
| R21 | *AngioSim* | Rayos X para inspeccionar | ✅ rayos X de edificios · ⏳ taller con rayos X (C‑M21) |
| R22 | *FireTrace* | Mapa táctico, dron y **visión térmica** | ✅ vista dron, capas de datos y estilo **térmico** |
| R23 | *Ballpoint Gambit* | Interfaz de libreta dibujada | ⏳ ChatGPT (C‑A11) |
| R24 | Haikus en código | Efectos procedurales en Canvas | ✅ todo el motor (Canvas, sin imágenes pesadas) |
| R25 | Letra a mano → fuente | Tipografía propia | ⏳ ChatGPT (C‑A10) |

**Los 14 enlaces:**
- **Sin verificar todavía:** 13, que siguen pidiendo iniciar sesión (tarea G‑H7 de Gemini, que puede ver videos).
- **Identificado de forma indirecta:** el 03 (*Town Brush*).

**Las decisiones de la entrega que el motor adopta:**
1. Primero credibilidad física, después complejidad visual.
2. La vida nace de las relaciones: el viento mueve las copas y la lluvia vuelve barro el pasto.
3. No atar las reglas a los gráficos: la calidad cambia el aspecto, nunca la frenada.
4. Contratos de datos versionados: `schemas/` y `MC.Contratos`.
5. Medir en un celular real con percentiles: `MC.Telemetria`.

### 1.1 Auditoría G‑H7 de Gemini (20‑nov‑2026)
Gemini revisó los 10 reels que faltaban. Siguen detrás del inicio de sesión de Instagram, así que no se inventó contenido. Lo verificado es esto:

| Reel / publicación | Estado de acceso (2026-11-20) | Qué se ve (solo evidencia verificada) | Estilo | Qué da peso o vida | Técnica observada / uso en Motor City |
|---|---|---|---|---|---|
| `DfvyT1QIFIQ` | **Evidencia indirecta verificada** (ficha `R10`, reseña externa en `develog.develrocket.com` documentada en `MOTOR-CITY-ENTREGA-MAESTRA.md`; sin inspección del metraje original) | ***Town Brush***: al pintar con el dedo, el paisaje de un pueblo cobra vida y se transforma | Pixel art (según fuente secundaria) | Respuesta inmediata del entorno al gesto táctil (no se verificó física interna ni código) | «Toque que despierta el mundo»: pintar, reparar o limpiar activa animación, luz y cambios persistentes → referencia para `C‑M11` y `MC.Urbe` |
| `Dfaux2QFsay` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `De9tpl3yakv` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `De7qMG8iZdh` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `Dfpb3_vHFPb` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `Dc_s5CPsstT` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `De9ZhRAIOhJ` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `DdwLGJmjjvQ` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `DfRe6pQzWzS` | Bloqueado por inicio de sesión en Instagram (sin acceso público al shortcode) | No verificable sin sesión; pendiente asociar al MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar MP4 |
| `DfDkDxQiQS7` | Bloqueado por inicio de sesión en Instagram (publicación `?img_index=2` privada/login) | No verificable sin sesión; pendiente asociar la imagen o MP4 correspondiente del autor | Pendiente | Pendiente | Pendiente asociar imagen/MP4 |

#### Técnicas verificadas directamente en los 17 clips MP4 analizados (`MOTOR-CITY-ENTREGA-MAESTRA.md`, sin asignación 1:1 a los 9 shortcodes bloqueados)
En la entrega maestra del autor se inspeccionaron directamente 17 clips MP4 (`R01`, `R05`, `R06`, `R07`, `R11`, `R12`, `R14–R17`, `R19–R25`). Aunque no existe correspondencia confirmada entre cada `.mp4` y los 9 shortcodes bloqueados arriba, sus aportes verificados respaldan directamente los módulos de Motor City 2.7:

| Fichas con MP4 directo | Qué se vio directamente en los fotogramas | Estilo | Qué da peso o vida | Principio aplicable al motor |
|---|---|---|---|---|
| `R01` (*The Sound of Fury*) | Combate musical con trazos de tinta negra, estelas y pausas de impacto | Cómic / novela gráfica oscura con *cel-shading* | *Hitstop*, sacudida de cámara, tela al viento y partículas | Contornos + VFX 2D + *hitstop* (`MC.Vida`, `MC.Estilo` `comic`/`novela`) |
| `R05`, `R06` (PS2/GTA retro y *Project Zomboid* 3ª persona 3D) | Escenas *mid/low-poly* con texturas pintadas e interacciones cotidianas en interiores 3D | *Low/mid-poly* retro con luz cálida | Retroceso de golpes, gestos cotidianos (reparar, abrir puertas, leer) y sombras largas | Personajes legibles sin hiperrealismo y micro-acciones táctiles en Mi casa y lugares |
| `R07`, `R12` (*Fable Rover ER-6* y 4×4 en desierto/playa en Godot) | Rover de 6 ruedas con suspensión visible; 4×4 rompiendo cercas y derrapando en arena junto al mar | Maqueta técnica / diorama *top-down* cálido | Compresión de suspensión, vallas rompibles, polvo de llantas, surcos y gaviotas que huyen | Suspensión ligera, *props* reactivos, fauna que reacciona y estelas (`MC.Vida`, `C‑M15`) |
| `R11` (*Cairn*) | Escalada en roca vertical con cuerdas, apoyos cuidadosos y clima de montaña | Novela gráfica / *ligne claire* 3D | Tensión del apoyo, caídas con peso y viento en tela/nieve | Contactos firmes y peso corporal al saltar/aterrizar (`MC.Vida`) |
| `R14`, `R19` (*Still The Game*) | Diorama isométrico urbano con ciclo de 24 h, estaciones, farolas, ventanas encendidas, nieve y huellas | Diorama isométrico 3D realista estilizado | Avance pesado en nieve, sombras largas girando y encendido progresivo de ventanas y farolas | Ciclo solar con luces nocturnas en fachadas (`C‑A6`) y huellas/charcos (`C‑M17`, `C‑M15`) |
| `R15`, `R16`, `R17` (Ciudades pixel art, *CityRT*, *Miniopolis*) | Mapas urbanos isométricos, constructor web *cel-shaded* y edificios modulares con filtros en vivo (*Comic, CRT, Vintage, Vibrant*) | Pixel art isométrico / *cel-shading* / maqueta con filtros | Golpe seco con polvo al encajar plantas, tráfico continuo y cambio instantáneo de atmósfera | Selector de estilos `MC.Estilo` + construcción modular y modo a pie de calle (`C‑A8`, `C‑M19`) |
| `R20–R25` (Laboratorio 3D, mapa térmico, cuaderno ilustrado, haikus JS, tipografía) | Campos 3D, vista rayos X, propagación de incendio sobre relieve, ajedrez de cuaderno, haikus en Canvas y fuente manuscrita | Técnico 3D / ilustración de cuaderno / Canvas 2D generativo | Inercia en controles, capas de datos sincronizadas, *squash & stretch* 2D y ondas procedurales | Capas de ciudad (`MC.Urbe`), efectos de lluvia/ondas ligeros en Canvas y depurador de físicas |

> **Para cerrar el mapa 1:1:** basta con que el autor indique qué `.mp4` corresponde a cada uno de los 9 shortcodes bloqueados (sin intentar evadir el inicio de sesión de Instagram).


## 2. Peso y vida («game feel»)
| Fuente | La técnica | En el motor |
|---|---|---|
| Jan Willem Nijman (Vlambeer), «The Art of Screenshake» (2013) | El mismo juego con y sin «jugo»: sacudida, retroceso, pausa de impacto y partículas. Sin eso, todo se siente plano. | `MC.Vida` (88): sacudida según la caída, **hitstop** de 60 ms en los choques (`MC.Bucle` respeta `MC._pausaImpacto`), polvo, salpicaduras y hojas. |
| Disney, los 12 principios de la animación | *Squash and stretch*, anticipación y acción complementaria | El cuerpo se aplasta al aterrizar y vuelve (`_squash`); el vehículo cabecea con la aceleración. |
| *Spider‑Man: Into the Spider‑Verse* | Animación «a dos cuadros» (*on twos*) para un movimiento con carácter | Las alas de los pájaros aletean a 12 cuadros por segundo. |
| *Cairn*, carreras tipo Dakar (reels) | El peso del cuerpo y del vehículo | Lo mismo, más el viento que mece las copas de cerca. |

## 3. Cómic, manga, anime y novela gráfica
| Obra o autor | La técnica | Estilo del motor (`MC.estilo`) |
|---|---|---|
| *Into the Spider‑Verse* (Sony, 2018) | Semitono de puntos para la luz, rayado para las sombras, puntos de Kirby, líneas dibujadas sobre el 3D y onomatopeyas en pantalla | `comic`: semitono horneado en las losas, tinta, onomatopeyas (`¡PUM!`, `¡TUM!`) y líneas de velocidad. |
| Roy Lichtenstein, la imprenta del cómic | El punto Ben‑Day como textura | La trama `puntos` de `MC.Estilo`. |
| Hergé y la *ligne claire*; Moebius (y *Sable*, que se inspira en él) | Línea de grosor uniforme, color plano y poco contraste. En *Sable*, el contorno da profundidad. | La **tinta** de grosor constante en vías, techos, muros y árboles (`tinta`, `tintaColor`). |
| Manga (tramado, *screentone*) | Grises con tramas de puntos y líneas de velocidad radiales | `manga`: todo a escala de grises, tramado en las copas, líneas de velocidad desde el borde sin tocar el centro. |
| *Return of the Obra Dinn* (Lucas Pope) | Todo en 8 bits de gris y, al final, umbral contra una trama (1 bit), estable entre cuadros | La idea del **umbral** de la novela gráfica. Un estilo de 1 bit con trama queda para ChatGPT (C‑M19). |
| *Sin City* (Frank Miller), Mike Mignola | Blanco y negro duro y un solo color de acento | `novela`: tres tonos de papel y tinta, sombras negras, árboles en silueta con filo de luz y el **rojo** de los techos como acento. |
| Makoto Shinkai | El cielo manda la luz: azul profundo arriba, cian claro en el horizonte, nubes en capas y brillo | `anime`: cielo propio en la vista lateral, sombras azul violeta, *cel shading* en 6 bandas y línea fina. |
| Studio Ghibli (Kazuo Oga) | Fondos en gouache y acuarela, mate, con humedad en el aire | `acuarela`: papel, pigmento que se junta en el borde de las copas y paleta de acuarelas reales. |
| *Arcane* (Fortiche) | 3D con texturas pintadas a mano, sombras y luces pintadas, efectos en 2D | La dirección para el arte de ChatGPT (C‑A8): texturas pintadas sobre el volumen del motor. |
| Hokusai e Hiroshige (ukiyo-e) | Grabado en madera: azul de Prusia, papel crema, contorno y color plano | `ukiyoe`: la **paleta real** de *La gran ola* y *Fuji rojo*, con tinta índigo y papel. |

## 4. Arte de verdad, de dominio público (recopilado y adaptado)
`arte/dominio-publico/paletas.json` tiene las paletas de 8 colores sacadas de estas obras con un algoritmo de corte por la mediana. Las imágenes vienen de Wikimedia Commons (`node` / Python, 200 px), y en el repositorio solo quedan los colores, con su fuente:

| Obra | Autor y año | Licencia en Commons | Uso |
|---|---|---|---|
| *La gran ola de Kanagawa* | Hokusai, 1831 | Dominio público | `ukiyoe` |
| *Fuji rojo* (Viento del sur, cielo despejado) | Hokusai, 1831 | Dominio público | `ukiyoe` |
| *Aguacero sobre el puente Ōhashi* | Hiroshige, 1857 | Dominio público | `acuarela` |
| *Terraza de café por la noche* | Van Gogh, 1888 | CC0 | referencia para la noche |
| *Impresión, sol naciente* | Monet, 1872 | Dominio público | referencia para el amanecer |
| *Little Nemo in Slumberland* | Winsor McCay, 1906 | Dominio público | referencia del cómic clásico |
| *Las estaciones* | Alfons Mucha, 1896 | Obra de dominio público (foto FAL) | referencia |
| Grabado de la *Divina comedia* | Gustave Doré, 1861 | Dominio público | `novela` |
| Acuarelas de la **Comisión Corográfica** | Manuel María Paz y otros, 1853 | Obra de dominio público (escaneo CC BY‑SA 4.0) | `acuarela` |
| Acuarela del trópico | Winslow Homer, 1899 | Dominio público | `acuarela` |

**Por qué solo paletas:** pesan casi nada, no meten imágenes en el juego y no confunden lo que es del motor con lo que es de un museo. La lista completa, con enlaces, está en `arte/dominio-publico/paletas.json`. Gemini amplía la lista con obras colombianas (G‑H8).

## 5. Lo que sigue
- **ChatGPT** (imágenes) dibuja las láminas guía de cada estilo (C‑A8) y el personaje en *cel* (C‑A9).
- **Codex** hace el estilo de 1 bit con trama estable (C‑M19) y una vista con three.js o WebGPU (C‑M18).
- **Gemini** describe los 10 reels que faltan (G‑H7) y busca 40 obras de dominio público, también colombianas (G‑H8).

## Fuentes
- Spider‑Verse:
  - [AWN · Creating the stylized universe](https://www.awn.com/animationworld/creating-stylized-universe-sonys-spider-man-spider-verse);
  - [Foundry · Graphic look in comp](https://www.foundry.com/insights/film-tv/graphic-look-in-comp-spiderman);
  - [No Film School](https://nofilmschool.com/how-spider-verse-took-animation-risks).
- Arcane:
  - [VFX Voice · Arcane season 2](https://vfxvoice.com/riot-games-and-fortiche-get-revolutionary-with-arcane-season-2/);
  - [80.lv · backgrounds](https://80.lv/articles/arcane-artists-show-how-they-combine-traditional-art-3d-for-backgrounds).
- Game feel:
  - [Game Developer · Squeezing more juice](https://gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design-);
  - [Universität Bayreuth · Game Feel (PDF)](https://medienwissenschaft.uni-bayreuth.de/wp-content/uploads/GxD-10-Game-Feel.pdf).
- Obra Dinn:
  - [PlayStation Blog](https://blog.playstation.com/2019/10/17/return-of-the-obra-dinn-adventures-in-one-bit-out-tomorrow/);
  - [Alan Zucconi · Shader Showcase](https://www.alanzucconi.com/?p=10365).
- Ghibli y Shinkai:
  - [Gurney Journey · Painting in Ghibli style](https://gurneyjourney.blogspot.com/2018/05/painting-in-ghibli-style.html);
  - [Looper · Shinkai sobre Suzume](https://www.looper.com/1254434/director-makoto-shinkai-anime-artistry-suzume-exclusive-interview/).
- Moebius, *ligne claire* y *Sable*:
  - [Game Developer · GDC 2022, Sable](https://gamedeveloper.com/gdc2022/how-shedworks-refined-the-art-of-sable-in-pursuit-of-readability);
  - [Cook & Becker · Moebius](https://www.cookandbecker.com/en/article/346/artist-spotlight-moebius.html).
- Obras de dominio público: [Wikimedia Commons](https://commons.wikimedia.org/). Cada archivo está en `arte/dominio-publico/paletas.json`.
