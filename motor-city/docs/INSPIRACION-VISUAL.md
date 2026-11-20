# Inspiración visual · lo que aprendimos de las mejores obras y dónde quedó en el motor

> **La regla:** de las obras con derechos se toman las **técnicas**, nunca imágenes, personajes ni logos. El arte «de verdad» que se recopila y adapta es de **dominio público**: sus paletas están en `arte/dominio-publico/`, con fuente y licencia.

## 1. Las referencias del autor (reels de Instagram, nov‑2026)
De los 14 enlaces se pudieron leer 4 sin iniciar sesión:

| Reel | Qué es | Qué tomamos |
|---|---|---|
| `De64QQuCsyG` (vandalnet) | Un RPG independiente inspirado en **Dragon Ball** | Estética **anime**: cel shading, contorno, colores vivos y onomatopeyas. → estilo `anime` y `comic`. |
| `DfJFFGQRG2N` (elreagamingok) | ***Cairn***, un simulador de escalada y supervivencia | **Peso**: el cuerpo pesa, cada apoyo cuenta. → `MC.Vida`: aterrizajes con aplastamiento, sacudida y polvo. |
| `DfpsKcEKZNx` (patricio.incoders) | Un vehículo tipo *rover* en la web | Vehículos con suspensión que **se sienten**. → cabeceo al acelerar y al frenar. |
| `Dfkim-zvyVB` (mamon.xx) | Carreras **cinematográficas** tipo Dakar: agua, nubes, contacto de llantas | Para *Motor City* (carreras): cámara de cine, polvo y salpicaduras. → partículas de `MC.Vida` y vista `cine`. |

**Los otros 10 reels** (`Dfaux2QFsay`, `DfvyT1QIFIQ`, `De9tpl3yakv`, `De7qMG8iZdh`, `Dfpb3_vHFPb`, `Dc_s5CPsstT`, `De9ZhRAIOhJ`, `DdwLGJmjjvQ`, `DfRe6pQzWzS` y la publicación `DfDkDxQiQS7`) piden iniciar sesión. Describirlos es la tarea **G‑H7** de Gemini, que puede ver videos.

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
