# Cámara, mundo único y jugabilidad · investigación de la 3.0 (20‑nov‑2026)

> Pedido del autor: «las dimensiones están mal ideadas; hay cosas que se quedan en 2D cuando deberían estar en 3D; el mundo en cenital, maqueta y 3D debe ser el mismo; investiga la cámara de #DRIVE, Pako Forever, Getaway y Reckless Getaway 2; ni tan cerca ni tan lejos, con tope; un radio de vista; carga por zonas que no se note (la niebla de GTA San Andreas); fachadas; artilugios físicos».

## 1. Lo que enseñan las referencias (ingeniería inversa)
Sobre las cámaras de esos juegos se publica poco. Lo que sigue sale de lo que se ve al jugarlos y de lo que sí está documentado; donde algo no está confirmado, se dice.

| Referencia | Qué se ve | Qué se tomó |
|---|---|---|
| **#DRIVE** (Pixel Perfect Dude) | Mundo 3D low-poly; cámara alta que va **detrás y arriba** del carro, mirando adelante; el carro abajo de la pantalla para ver lo que viene. | El mundo 3D low-poly con luz plana por cara; la **mirada adelante** según la velocidad. |
| **Pako Forever** / **Getaway** | Vista **isométrica fija** sobre una ciudad 3D low-poly; la cámara no gira con el carro, solo lo sigue; persecuciones con policía. | La **maqueta** como cámara 3D casi ortográfica (campo visual estrecho, giro de a 90°); la cámara aérea **no gira** con el rumbo, lo que da control estable. |
| **Reckless Getaway 2** (Pixelbite) | La vista es elevada y en 3D, según las fichas de las tiendas. No se encontró una descripción técnica de la cámara: **sin confirmar**. Lo que el autor describe, una cámara frenética en las persecuciones, coincide con alejarse, inclinarse y sacudirse con los golpes. | El **modo persecución** (`camara.persecucion`, 0 a 1): se aleja un 22 %, se inclina hacia adelante y se mece de lado. Además, el **trauma²**, que sacude con cada golpe. |
| **GTA San Andreas** | Poca distancia de dibujo, **modelos de bajo detalle (LOD)** a lo lejos y **niebla** ajustada por hora y clima para que no se vea lo que se carga; el mundo se carga por sectores. Los detalles internos solo están en fuentes de *modding*, no oficiales. | **Radio de vista** definido por la cámara y **niebla justo antes del borde**. Las regiones de 160 m se cargan por cercanía con un presupuesto de milisegundos (ya estaba) y bajan de detalle con la distancia. |
| **HD‑2D** (*Octopath Traveler*) | Sprites 2D como hojas de papel dentro de un mundo **todo 3D**, con desenfoque por profundidad (efecto maqueta), luz puntual y bruma. | El **híbrido**: el suelo es la losa 2D (vías, andenes, pasto con su desgaste) puesta sobre el relieve 3D, y todo lo que se levanta es volumen. El desenfoque por profundidad queda como encargo (necesita el búfer de profundidad). |
| **Diseño de cámaras** (zona muerta, mirada adelante, *Cinemachine*) | Zona muerta para que lo pequeño no mueva la cámara; la mirada adelante se congela al frenar; nunca saltar sin suavizado. | Ya estaba: resortes críticamente amortiguados, zona muerta y mirada adelante. Ahora también en las cámaras aéreas 3D. |

## 2. Lo que quedó en el motor (3.0)
1. **Un solo mundo 3D, varias cámaras** (`js/45-gl3d.js`, `MC.Camara` perfiles `cenital`, `oblicua` y `maqueta`):
   - la cenital, la ciudad y la maqueta son cámaras sobre el mismo mundo 3D;
   - sin GPU usan su **respaldo 2D**, que es el mismo mundo con el mismo encuadre.
2. **Encuadre igual en 2D y en 3D:** la distancia de la cámara aérea sale del zoom en px por metro y del alto del lienzo, así que cambiar de cámara no salta.
3. **Inclinación según el zoom:** de lejos la cámara queda más cenital y de cerca más oblicua (se ven las fachadas).
4. **Topes de zoom:** de 2,6 a 22 px por metro en Mandados.
5. **Cámara continua:** pellizcar hasta el tope de cerca pasa a la vista detrás del jugador, y alejarse desde ahí vuelve a la cenital.
6. **Mapa grande:** para ver todo está el mapa (se toca el minimapa), no alejar el mundo vivo.
7. **Radio de vista y niebla:** las cámaras aéreas cargan solo hasta 2,3 veces su distancia, con niebla entre 1,55 y 2,25 veces. Lo que se carga no se ve llegar.
8. **Fachadas:**
   - zócalo de color (en Guatapé);
   - ventanas con marco y vidrio, algunas encendidas de noche;
   - puerta en el muro más largo;
   - balcones con baranda y cornisa;
   - techo con alero, o plancha con pretil y tanque negro.
9. **Detalle por distancia (LOD):** las fachadas solo cerca; lejos, el prisma.
10. **Árboles low-poly:** los **mismos** de las vistas 2D (`MC.Arboleda`), por especie: guayacanes florecidos, ceiba ancha, mango denso y monte cónico.
11. **Vehículos y gente:** carros con cabina, vidrio, ruedas y luces; busetas con franja de ventanas; motos y bicis; personas con cabeza y pelo.
12. **Rayos X del jugador:** si un árbol o un techo lo tapan, se ve igual.
13. **Artilugios físicos** (`MC.Objetos`):
    - conos, balones, canecas, cajas y vallas;
    - impulso según la masa de quien choca;
    - saltan, caen, ruedan con roce, chocan con los muros y se duermen quietos;
    - se ven en todas las cámaras, y en Mandados ya están sembrados.
14. **Jerarquía clara:** una sola **cámara de juego** y la de detrás del jugador. Lo demás (otras vistas, pixel, filtros de estilo y arte) va en «Más vistas y filtros».

## 3. Mecánicas y jugabilidades recopiladas para lo que sigue
| Idea | De dónde | Cómo encaja |
|---|---|---|
| Persecución con policía o rivales que **estrechan** el camino | Reckless Getaway, Pako, #DRIVE | `MC.IA` con pilotos que cortan el paso; la cámara ya tiene `persecucion`. |
| **Casi choques** que dan puntos o turbo | #DRIVE (pasar rozando) | Distancia mínima al tráfico por cuadro; premio y un leve *hitstop*. |
| **Destrucción ligera** del mobiliario | Reckless Getaway (vallas, postes) | `MC.Objetos` ya tiene vallas, conos y canecas. Faltan postes, bolardos y rejas de los datos del mapa. |
| **Saltos con rampa** y cámara lenta al aterrizar | GTA, Burnout | El cuerpo ya tiene `z` y el evento `aterriza`. Falta la rampa como objeto y el *slow-mo* ya existente en `MC._pausaImpacto`. |
| **Carga por sectores con guardado** | GTA, C‑M22 de Codex | `MC.GuardadoSectores` (2.9.1) más las regiones de `VistaGL`: los objetos movidos se guardan por sector. |
| **Siluetas lejanas** (*impostores*) | GTA San Andreas (LOD) | Edificios lejanos como cajas sin fachada (ya está); faltan las siluetas de cerros y torres en el horizonte de la vista detrás del jugador. |
| **Desenfoque de maqueta** (*tilt-shift*) | HD‑2D | Un pase con profundidad en WebGL; encargo para Codex. |

## Fuentes
- [HD‑2D (Wikipedia)](https://en.wikipedia.org/wiki/HD-2D) y [Octopath Traveler II, entrevista de Unreal Engine](https://www.unrealengine.com/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style)
- [#DRIVE en App Store](https://apps.apple.com/us/app/drive/id1366180154?l=pt-BR) y [TouchArcade](https://toucharcade.com/games/drive)
- [Reckless Getaway 2 en App Store](https://apps.apple.com/us/app/id1190553787), [reseña de Reckless Getaway (Pocket Gamer)](https://www.pocketgamer.com/reckless-getaway/review-4216/) y [Malavida](https://malavida.com/en/soft/reckless-getaway-2/iphone)
- GTA San Andreas, de la comunidad y no oficial: [Project2DFX](https://libertycity.net/files/gta-san-andreas/140501-project2dfx-v4.3.html), [guía de modding](https://gtacommunitydocs.vercel.app/docs/san-andreas-modding-guide/graphics/) y [MTA: distancias LOD](https://wiki.multitheftauto.com/wiki/EngineSetModelLODDistance?oldid=82240)
- Cámaras: [Cinemachine, guía de seguimiento](https://uhiyama-lab.com/en/notes/unity/unity-cinemachine-camera-guide/), [How to Make a Good 2D Camera (GMTK)](https://gmtk.substack.com/p/how-to-make-a-good-2d-camera) y [cámara de un juego de carreras visto desde arriba (Game Developer)](https://gamedeveloper.com/game-platforms/let-s-talk-about-top-down-view-camera-system-for-a-racing-game)
