# El pedido del autor (25‑nov‑2026): el mundo 3D cenital con una sola cámara

> **Para toda IA (Claude, Codex, Gemini, Antigravity, Cursor…):** este pedido manda sobre cualquier plan anterior de cámaras o vistas. El autor dijo que **la petición «se perdió» entre IAs**. Aquí queda **palabra por palabra**, para que no vuelva a pasar. Antes de tocar una cámara, una vista o el arte del mundo de cualquier juego, léelo.

## 1. Lo que dijo el autor (literal)

**Primer mensaje** (después de jugar EnCicla 3.9.0, El Metro 3.10.0 y Turno Cero 5.4.1):

> «Ya lo jugué, y la petición que pedí desde la anterior IA aparentemente se perdió, y era que el juego debía ser totalmente en un mundo 3D en cenital con partes 2D y de pixel art para algunos modos de juego ya establecidos y para en general hacer los detalles y texturas del mundo con mejor diseño en sus gráficos. El mundo en tercera persona no carga en totalidad ni aunque avances más, hay que pensar en forma ingeniosas para hacer la carga del mundo y mejorar su fluidez y optimización. El moviendo de ningún juego aún está a la altura de la fluidez que tiene EnCicla. EnCicla tiene un bug en la pantalla de inicio y es que no carga el panel de la animación y el el bug que tiene el metro y también EnCicla es la mala optimización de la música ya que cuando se sale de la app aún sigue sonando la música, de lo cual también carece turno cero y este también le pesa aún la mala fluidez. En todos los videojuegos aún falta mejorar los controles y la sensibilidad, además de agregar otras formas y hacerlo personalizable al gusto y darle recomendaciones dependiendo si se juega en vertical o horizontal. Hay que lograr un balance perfecto en la creación del mundo enteramente en un 3D, para jugarse en vista cenital de camara más bien centrada y que se puede mover al gusto, hacercarse y alejarse, y así añadiría un poco la forma de tercera persona, el mundo no sería tan pesado si fuera enteramente hecho 3D ya que tiene ayuda de híbridos, pero si necesito que nada quede pintado en suelo para dar la ilusión de vista cenital.»

**Segundo mensaje:**

> «Hay que eliminar las "camaras", la de maqueta, la de panorámica 2D, etc. Ya dije que debe prevalecer
> Y haz que en encicla aparezca el escalafón como botón en la pantalla de inicio, porque para ir a el hace falta ingresar al mundo abierto y luego salirse de allí, eso no es ideal»

## 2. Lo que pide, punto por punto

| # | Pedido | En los juegos |
|---|---|---|
| P1 | **Un mundo enteramente 3D**, jugado en **vista cenital**. | todos |
| P2 | **Una sola cámara**: centrada, que se mueve al gusto, se acerca y se aleja. Al acercarse, «un poco» de tercera persona. **Se eliminan las otras cámaras** (maqueta, panorámica 2D, etc.). | todos |
| P3 | **Nada pintado en el suelo** para fingir la vista cenital: lo que tiene altura (edificios, árboles, carros, postes…) es 3D de verdad. Los híbridos sirven para aligerar. | todos |
| P4 | **2D y pixel art solo en algunos modos ya establecidos**, no en el mundo. | todos |
| P5 | **Mejores detalles y texturas** en los gráficos del mundo. | todos |
| P6 | **La carga del mundo**: que cargue completo al avanzar, con ingenio; fluidez y optimización. | todos |
| P7 | **La fluidez del movimiento**: la de EnCicla es la vara; Turno Cero está por debajo. | El Metro y Turno Cero, sobre todo |
| P8 | **La música no debe seguir sonando al salir de la app.** | EnCicla, El Metro y Turno Cero |
| P9 | **La portada de EnCicla**: el panel de la animación no cargaba. | EnCicla |
| P10 | **Controles**: mejor sensibilidad, más formas de control, personalizables, con recomendaciones según se juegue en vertical o en horizontal. | todos |
| P11 | **El escalafón como botón en la portada de EnCicla** (antes había que entrar al mundo abierto y salir). | EnCicla |

## 3. Lo que ya quedó (25‑nov‑2026, Claude)

| Pedido | Hecho | Dónde |
|---|---|---|
| P2 | **La cámara única** en los tres juegos. Solo la cenital 3D, con cuatro acercamientos: de lejos, cenital, de cerca y casi tercera persona. De cerca baja hasta unos 36° y se va detrás del rumbo, y los controles giran con ella. Pellizcar acerca y aleja, y dos dedos giran e inclinan. Los guardados con otra cámara vuelven a la cenital. | EnCicla 3.10.0 (`src/js/99zz-camara-unica.js`), El Metro 3.11.0 (`src/js/36-libre.js`), Turno Cero en Motor City 5.5.0 (`js/34-camara.js`, `juegos/getaway/90-inicio.js`) |
| P8 | **El guardián del sonido**: al salir de la app todo calla, en cualquier pantalla, y al volver sigue lo que sonaba. En la APK lo avisa la actividad nativa. | EnCicla 3.9.1, El Metro 3.10.1 y Motor City 5.4.2 (`*sonido-guardian*`) |
| P9 | **La portada viva** de EnCicla: la animación sale a ~1,9 s en vez de quedar ~10 s en blanco (CPU 4×), mientras el mapa se arma. | EnCicla 3.9.1 (`src/js/98z-portada-viva.js`) |
| P11 | **🏆 Escalafón** en la portada de EnCicla, directo a su pestaña. | EnCicla 3.9.1 (`src/js/98n-abierto.js`) |

**Siguen como modos propios** (no son cámaras del mundo):
- en Turno Cero, las 🏎️ Carreras retro (pseudo‑3D) y el 🧰 garaje (fichas pixel);
- en El Metro, Conduce el Metro (cabina y panorámica de la línea) y La Red;
- los minijuegos de cada juego;
- los miradores (🔭), con su vista contemplativa mientras dura la visita.

**Pixel World** de EnCicla sigue como estilo en Más › Gráficos, no como cámara.

## 4. Lo que falta: propuesta por fases (espera el OK del autor)

Cada fase tiene su informe, sus pruebas y su 📏 en el celular.

1. **Fase A · La carga del mundo sin huecos (P6).**
   - Una cola por prioridad: distancia, dirección del viaje y lo que ve la cámara inclinada (que de cerca mira más lejos).
   - Un presupuesto por cuadro, sin cancelar nunca lo cercano, y precarga hacia adelante según la velocidad.
   - Meta: con la bici a 30 km/h o el carro a 60 km/h, 0 casillas pendientes en lo visible a los 2 s. Medido con 📏 en el celular del autor.
2. **Fase B · La fluidez (P7).**
   - Paso fijo con interpolación del dibujo en los tres juegos, con la sensación de EnCicla como vara.
   - Resortes de la cámara y menos latencia de entrada.
   - Presupuesto de cuadro de Turno Cero (p95 ≤ 20 ms en el celular).
3. **Fase C · Controles a tu gusto (P10).**
   - Sensibilidad y curva, y varios esquemas: palanca fija o flotante, botones, deslizar, inclinar el celular y zurdo o diestro.
   - Tamaño y opacidad de los botones.
   - Una recomendación al girar el celular: en vertical, una mano con la palanca abajo; en horizontal, dos manos.
   - Todo guardado sin romper los guardados.
4. **Fase D · Nada pintado en el suelo (P3, P5).**
   - Árboles, carros, postes, señales, bancas y estaciones como objetos 3D livianos (instancias y niveles de detalle, LOD).
   - Fachadas y techos con textura por zona, y sombras simples de contacto.
   - El suelo solo lleva lo que de verdad es plano: vías, andenes, pasto y agua.
5. **Fase E · Un solo mundo 3D (P1).**
   - El mundo de EnCicla hoy es un lienzo 2.5D. Esta fase lo pasa al 3D de verdad (WebGL, como El Metro y Motor City), con el 2D solo de respaldo para equipos sin WebGL.
   - Es la fase más grande, y su orden lo decide el autor.

## 5. Reglas para quien siga

- **No vuelvas a poner un selector de cámaras** ni cámaras de tercera o primera persona, maqueta, panorámica o cine en el mundo de ningún juego.
  - Lo que se acerca es la misma cámara: más cerca, más baja y detrás del rumbo.
  - Si una prueba necesita otra vista del motor para medir un dibujo, la pone a mano; el jugador no la ve.
- **Nada pintado en el suelo** que deba tener altura.
- **2D y pixel solo en los modos ya establecidos.**
- El orden de las fases de § 4 lo confirma el autor.
