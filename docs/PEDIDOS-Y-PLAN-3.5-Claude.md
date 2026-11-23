# Evaluación, pedidos y plan 3.5 · Claude

**23‑nov‑2026 · Claude (Claude Code).** El autor pidió: volver a trabajar en EnCicla con todo lo nuevo del motor, evaluar qué falta, preparar los pedidos (con sus prompts listos para pegar) para Gemini y ChatGPT, planear el siguiente paso de Claude y dejar sugerencias en el repositorio. Las sugerencias están en `docs/SUGERENCIAS-Claude.md`.

## 1. Lo que hice en la 3.5.0 (todo probado: sección V7 de `tests/revolucion-encicla.js`)
| Qué | Archivo | De dónde viene |
|---|---|---|
| **🗣️ La ciudad te responde.** La gente oye el timbre, los choques, que le pases muy cerca, que te pases un semáforo en rojo y los trucos, y contesta con una burbuja sobre su cabeza (en la cenital y en el 3D). Si vas despacio entre la gente, comenta según el lugar (estación, paradero, parque, ciclorruta, calle), la hora, la lluvia y la noche. Se dice la frase más específica, sin repetir en 90 s; tras un choque, los cercanos se detienen a mirar. Varias frases enseñan: el peatón va primero, en rojo también para la bici, luz de noche, frenar con tiempo bajo la lluvia | `src/js/99s-ciudad-responde.js` y las 48 frases en `contenido/guion/frases.json` | Motor City 5.2 «Ciudad viva» (`MC.CiudadViva`, tono familia; la idea de las reglas de respuesta) |
| **🚲 La bici se inclina en las curvas** del mundo 3D, con el ciclista: φ = atan(v·ω/g), con la velocidad equivalente a la real (una bici a fondo ≈ 25 km/h) | `src/js/99d-mundo3d.js` (`cajaL`) | Motor City 5.2 (`Cuerpo._ladear`) |
| **📏 Medir este celular** (Más, o `?medir` al final de la dirección): el juego pedalea solo 10 s en la cenital y 10 s en el 3D y da un informe para copiar (cuadros por segundo, mediana, p95, cuadros lentos, pantalla, núcleos, memoria, gráfica). No sale nada del celular si no lo copias | `src/js/99t-medir-y-saltar.js` | Motor City 5.2 (`?medir`) |
| **🚀 Llegar ya** en el mapa grande del modo libre: con un destino marcado, te lleva de una vez | `99t-medir-y-saltar.js` | Motor City 4.8 (🚀 Ir del mapa) |
| **Todo junto.** En la 3.4 quedaron dos sistemas de habilidades (con dos «Resistencia») y dos de encargos con los mismos vecinos, y tres puertas a las actividades. Ahora: **un solo panel** de seis habilidades (Pedaleo y Conocer el valle, más las cuatro del RPG de Gemini); las subidas y los trucos suman a las del RPG; los **encargos de los vecinos salen en el hub** «🗺️ Valle Vivo»; **Hoy en el valle** sugiere también los arcos de mentores y las actividades del hub y trae «🗺️ Ver todo» | `src/js/99u-todo-junto.js` y `99h-valle-vivo.js` | Motor City 5.1 «Todo junto» (la idea) |
| **Reparto con doble rol.** El guion tenía dos versiones de los mismos personajes (los oficios de `66-historia.js` y la trama del valle). Gemini ya había pasado la trama a los oficios; ahora cada vecino tiene los dos: Santi es «estudiante y anfitrión de estación (medio tiempo)», Doña Luz «usuaria desde 2011, hoy anfitriona en la estación Estadio», Cata «operadora de la sala de control y fotógrafa del valle»… Así las historias de las tres IA quedan coherentes | `contenido/guion/trama_valle.json` | Revisión de las tres IA |

Lo que **no** se trae del motor, y por qué: el 3D con three.js (4.9 y 5.1), porque la regla del juego es «sin librerías» (el mundo 3D de EnCicla es WebGL propio y ya tiene ventanas que se prenden de noche y sombras horneadas); y el manejo real de carro `MC.Dinamica` (5.0), porque EnCicla es arcade de bici.

## 2. Evaluación: qué falta (en orden de impacto)
| # | Qué falta | Por qué importa | Quién |
|---|---|---|---|
| 1 | **Probar en un celular real y con personas** | Todo se ha probado en un Chromium con la CPU 4× lenta. Ya hay con qué medirlo: 📏 Medir este celular y 🧪 Modo prueba | El autor (§ 3.5) |
| 2 | **Un trozo de ciudad nuevo cuesta de 24 a 89 ms** en un celular lento | Es el tirón que queda al avanzar rápido por zonas nuevas | ChatGPT con Codex (§ 3.2, K‑1) |
| 3 | **El arte de los modos laterales** (Freerun de la Comuna 13, Metro 2D, Bajada por Las Palmas) | Son las escenas más pobres: un fondo de degradado y poco más. El dibujo por código ya llegó a su techo ahí | ChatGPT (§ 3.1) y Gemini (§ 3.3) |
| 4 | **Pruebas de los 12 modos de Gemini** | Hoy solo los cubre la prueba de «lo que ve el jugador»; falta que el bot los termine y sume | Gemini con Antigravity (§ 3.4, A‑3) |
| 5 | **Los encargos de los otros 9 vecinos** y más frases de la ciudad | El contenido es lo que da ganas de volver | Gemini con Antigravity (§ 3.4, A‑1 y A‑2) |
| 6 | **Publicar con la red de seguridad** | Hoy se publica a mano; ya hubo una versión con un error en la página (la 3.1.0) | ChatGPT con Codex (§ 3.2, K‑3) |
| 7 | **31 modos en el menú** y una pestaña Más de 21 opciones | Mucho para quien llega; conviene agruparlo sin quitar nada | Claude (§ 4) |
| 8 | **Run 3D y la maqueta** con sus propias cámaras | El autor pidió un solo mundo 3D con todas sus cámaras | Claude (§ 4) |
| 9 | **El reparto canónico** | Lo dejé con doble rol; el autor debe confirmarlo o escoger uno | El autor |

## 3. Los pedidos, con su prompt listo para pegar
Antes de cada prompt de **imagen**, pega el **prompt base** de la guía de arte (`docs/IA-ENCICLA.md`: § 6.0 para Gemini y § 7.0 para ChatGPT) y, si existe, adjunta la imagen ancla **G‑00**. Las imágenes se archivan en `arte/entregas/<fecha>-<entrega>/` con su `manifiesto.json` y se revisan con la lista de control de la guía antes de entrar al juego, siempre con respaldo dibujado por código.

### 3.1 Para ChatGPT (imágenes)
**C‑130 · Comuna 13 de lado (cuatro capas para el Freerun)**
```
Encargo C-130 para el videojuego "Juega EnCicla" (Medellín, para todo público).
Estilo: pixel art moderno, limpio y cálido de 16 bits; contorno de 1 píxel #0a1424; 2 o 3 tonos por color; luz desde arriba a la izquierda. Paleta base: #0e2d55, #0a2342, #143a6b, #9bd341, #c4ec7c, #5e9a1e, #4a9a2c, #ffffff, #f4efd8, #ffc93c, #ff6b5a, #56c7ff, #c0623b, #9aa7b8, #d6dde6.
Haz una panorámica LATERAL (vista de lado, como un juego de plataformas) de la Comuna 13 de Medellín, en 4 capas separadas, cada una en relación 21:9 y que se repita en bucle horizontal (el borde izquierdo empata con el derecho):
- Capa 1 (escena completa): cielo de la tarde y el valle lejano con montañas azules.
- Capa 2 (fondo magenta plano #FF00FF): ladera con casas de ladrillo apiladas, techos de lámina y teja, ventanas pequeñas; algunas casas pintadas de colores.
- Capa 3 (fondo magenta plano #FF00FF): muros con murales de grafiti alegres: pájaros, flores, guayacanes, caras sonrientes, manos, colibríes. Sin letras, sin números y sin logos.
- Capa 4 (fondo magenta plano #FF00FF), primer plano: escaleras eléctricas al aire libre con techo naranja sobre columnas metálicas, barandas, escalones de cemento y matas en materas.
Prohibido: texto, letras, números, logos, marcas de agua, personas reales, estilo fotográfico, sombras sobre el magenta.
Entrega 4 PNG por separado, a la mayor resolución posible, con estos nombres: c130_comuna13_capa1.png, c130_comuna13_capa2.png, c130_comuna13_capa3.png y c130_comuna13_capa4.png. Con Python, verifica que el magenta sea exactamente #FF00FF y que cada capa empate en sus bordes.
```

**C‑131 · La Línea A del Metro de lado (cuatro capas para el Metro 2D)**
```
Encargo C-131 para "Juega EnCicla" (mismo estilo y paleta del encargo C-130).
Panorámica LATERAL del Valle de Aburrá vista desde la Línea A del Metro de Medellín, en 4 capas separadas, relación 21:9, que se repitan en bucle horizontal:
- Capa 1 (escena completa): cielo de mañana y montañas del valle.
- Capa 2 (fondo magenta plano #FF00FF): ciudad lejana con edificios de ladrillo y torres blancas, y la silueta de un cerro verde.
- Capa 3 (fondo magenta plano #FF00FF): orilla del río con árboles y la ciclorruta verde #4a9a2c pasando por debajo.
- Capa 4 (fondo magenta plano #FF00FF), primer plano: el viaducto de concreto del metro con columnas en T, baranda y rieles; incluye UNA estación elevada con cubierta blanca y una franja azul #1C5C9C a lo largo del borde.
Aparte, en una imagen 16:9 con fondo magenta: el tren de perfil, 3 vagones blancos y plateados con una franja azul #1C5C9C, ventanas oscuras, sin logos.
Prohibido: texto, letras, números, logos, marcas, personas reales.
Nombres: c131_lineaA_capa1.png a c131_lineaA_capa4.png y c131_tren_perfil.png.
```

**C‑132 · Bajada por Las Palmas al atardecer (cuatro capas)**
```
Encargo C-132 para "Juega EnCicla" (mismo estilo y paleta del encargo C-130).
Panorámica LATERAL de la vía Las Palmas bajando hacia Medellín al atardecer, en 4 capas, relación 21:9, en bucle horizontal:
- Capa 1 (escena completa): cielo naranja y rosado del atardecer con el sol bajo.
- Capa 2 (fondo magenta #FF00FF): el valle a lo lejos con las luces de la ciudad empezando a prenderse.
- Capa 3 (fondo magenta #FF00FF): montaña con bosque de eucaliptos y pinos, y miradores con barandas de madera.
- Capa 4 (fondo magenta #FF00FF), primer plano: borde de la carretera con baranda metálica, línea amarilla, señales sin letras (solo flechas de curva) y helechos.
Prohibido: texto, letras, números, logos, personas reales. Nombres: c132_palmas_capa1.png a c132_palmas_capa4.png.
```

**C‑133 · El corredor de lado (hoja de sprites del Freerun)**
```
Encargo C-133 para "Juega EnCicla" (mismo estilo y paleta del encargo C-130).
Hoja de sprites 1:1 de 1024×1024, cuadrícula de 4×4 celdas de 256 px, fondo magenta plano #FF00FF: una persona joven de VISTA LATERAL mirando a la derecha, con camiseta verde exactamente #9bd341, pantalón azul exactamente #0e2d55, tenis blancos y gorra blanca (esos colores exactos permiten cambiarle la ropa en el juego). Proporción de 4 cabezas.
- Fila 1: correr, ciclo de 4 cuadros.
- Fila 2: impulso, arriba del salto, cayendo, aterrizando.
- Fila 3: deslizarse por el piso (2 cuadros) y tropezar (2 cuadros).
- Fila 4: salto de gato sobre un muro, kong con las manos, giro en el aire y rodada al caer.
Todas las celdas con el mismo encuadre: los pies a la misma altura en las filas 1 y 3. Sin sombras en el piso ni sobre el magenta.
Nombre: c133_corredor_lado.png. Si no logras la cuadrícula exacta, entrega cada celda aparte: c133_corredor_01.png a c133_corredor_16.png.
```

### 3.2 Para ChatGPT con Codex («astra»: lo fuerte)
```
Eres Codex trabajando en el repositorio juanfeliperico369-stack/BicicletasUno (el juego "Juega EnCicla"). Antes de tocar nada lee CLAUDE.md, TAREAS-IA.md, docs/PEDIDOS-Y-PLAN-3.5-Claude.md y docs/SUGERENCIAS-Claude.md. Reglas: un solo HTML sin internet ni librerías; español de Colombia y todo público; no romper el guardado (juegaencicla.v1; las claves nuevas se registran con Save.registrar); `node tools/build.js` y `node tests/run.js` en verde antes de cada push; nunca subas llaves. Trabaja en la rama codex/encicla-3.6 y escribe tus módulos con el prefijo src/js/99w-* y 99x-* (los demás prefijos son de otras IA). Haz solo esto, en orden:

K-1 · Rendimiento: que un trozo de ciudad nuevo no trabe el cuadro. Hoy CityMap.drawGround3 (src/js/75-graficos.js) dibuja un trozo de 160 m de una vez: 24 a 89 ms con la CPU 4× lenta (mide con node tests/auditoria-modos.js --cpu=4 y con el perfilador). Hazlo por partes repartidas en varios cuadros (un generador que avance hasta gastar unos 6 ms por cuadro; mientras tanto se ve el respaldo color tierra que ya existe) o en un Worker con OffscreenCanvas, con respaldo si el navegador no lo tiene. Meta: p95 del modo libre menor que 50 ms con CPU 4× y ningún cuadro mayor que 120 ms al recorrer 2 km en línea recta. Agrega la prueba a tests/revolucion-encicla.js (sección nueva) y deja las cifras de antes y después en docs/BITACORA.md.

K-2 · El arte de los modos laterales con respaldo. Cuando el autor entregue C-130 a C-133 (en arte/entregas/), haz tools/capas.js: reduce cada capa con vecino más cercano, la cuantiza a la paleta y la incrusta como WebP en base64 al construir. Haz src/js/99w-capas.js con Capas.dibujar(b, id, desplazamiento) para el Freerun (99g-freerun.js), el Metro 2D y la Bajada por Las Palmas (99p-ciclovia-skate-runner.js), con paralaje por capa. Si una imagen falta, se dibuja lo de hoy: nada se rompe. El HTML no debe crecer más de 1,5 MB. Prueba con capturas en 412 × 860 y deja la comparación antes y después.

K-3 · Publicar con la red de seguridad. Haz .github/workflows/publicar.yml: en cada push a main compila, corre node tests/run.js y, solo si pasa, publica dist/ en la rama gh-pages CONSERVANDO la carpeta /metro/ (El Metro vive ahí) y descargas/. Pruébalo primero en una rama de ensayo (gh-pages-ensayo) y documenta en CLAUDE.md cómo se usa.

Al terminar cada tarea: pruebas en verde, docs/BITACORA.md al día y una nota de 5 a 10 líneas en coord/buzon/ (qué hiciste, cómo lo probaste, qué falta).
```

### 3.3 Para Gemini (imágenes con Nano Banana)
**G‑130 · Dieciséis murales de la Comuna 13 (hoja de 4×4)**
```
Encargo G-130 para el videojuego "Juega EnCicla" (Medellín, para todo público). Usa el prompt base de estilo de "Juega EnCicla" y, si lo tienes, la imagen ancla G-00.
Hoja 1:1 de 4×4 celdas iguales, fondo magenta plano #FF00FF entre celdas: 16 murales de grafiti en pixel art, cada uno en un muro rectangular de proporción 6:5, con colores vivos de la paleta del juego (#9bd341, #ffc93c, #ff6b5a, #56c7ff, #c0623b, #f4efd8). Temas alegres de barrio: colibríes, guacamayas, flores y guayacanes, caras sonrientes de niños y abuelos, manos que se dan la mano, una bicicleta, el sol sobre las montañas, un corazón con hojas, notas musicales, un tren de cable, peces del río y estrellas.
Prohibido: letras, palabras, números, logos, firmas, personas reales reconocibles y cualquier símbolo de violencia.
Nombre: g130_murales.png. Si no logras la cuadrícula, entrega 16 imágenes: g130_mural_01.png a g130_mural_16.png, todas del mismo tamaño.
```

**G‑131 · Ancla de estilo de los modos laterales (prueba)**
```
Encargo G-131 para "Juega EnCicla" (mismo prompt base de estilo). Es una PRUEBA antes de las capas grandes: una escena lateral 16:9 de 640×360 en pixel art, con una persona joven en bici (camiseta verde #9bd341, pantalón azul #0e2d55, casco blanco) rodando por la ciclorruta verde #4a9a2c junto al río Medellín en la mañana, con el viaducto del metro al fondo y el cerro Nutibara. Sin texto ni logos. Nombre: g131_ancla_lateral.png. Esta imagen fija el estilo que seguirán C-130 a C-133.
```

### 3.4 Para Gemini con Antigravity («hydrogen»: lo fácil)
```
Eres Gemini con Antigravity trabajando en el repositorio juanfeliperico369-stack/BicicletasUno ("Juega EnCicla"). Lee primero CLAUDE.md, TAREAS-IA.md, docs/PEDIDOS-Y-PLAN-3.5-Claude.md y docs/SUGERENCIAS-Claude.md. Reglas: un solo HTML sin internet ni librerías; español de Colombia y todo público; no romper el guardado; `node tools/build.js` y `node tests/run.js` en verde antes de cada push; nunca subas llaves. Trabaja en la rama antigravity/encicla-3.6; tus módulos llevan el prefijo src/js/99n-* a 99q-* (ya son tuyos) o 99y-*. Antes de crear un sistema nuevo, busca si ya existe uno que haga lo mismo (habilidades: 99h y 99q; encargos: 99l y 99q; sugerencias: 99k) y súmale en vez de duplicarlo. Haz solo esto, en orden:

A-1 · Encargos de los otros 9 vecinos. En contenido/guion/encargos.json ya hay 6 historias (Santi, Doña Luz, Cata, Don Efraín, Wílmar y Don Jairo). Escribe una historia de 3 pasos para cada uno de: Yuli, Kevin, la ingeniera Paola, Wílson, Don Rubén, Doña Marleny, Don Libardo, Jhon y Rosalba (a Rosalba no le repitas su boleto: que sea otra historia). Usa el mismo formato: "a" es "lm:<id de un lugar de src/js/19-lugares.js>" o "p:<id de un personaje>"; un paso puede pedir "veh": "walk" (a pie) o "noche": true. Respeta el reparto con doble rol de contenido/guion/trama_valle.json. Cada historia con su final y su premio (50 a 80). Nada de violencia; que enseñe algo verdadero del valle o de la bici.

A-2 · Cuarenta frases más para la ciudad. En contenido/guion/frases.json, con el formato que ya tiene (ev, y si quieres lugar, hora, lluvia, noche): 10 para "timbre", 8 para "peaton", 6 para "semaforo", 6 para "truco" y 10 para "ambiente" en distintos lugares. Español de Colombia, para todo público; varias que enseñen sin regañar.

A-3 · Pruebas de tus 12 modos. En tests/ agrega una sección (como la V5 del freerun) que, para Copa del Valle, Domicilio Sostenible, Monitoreo 911, El Planeador, Metro 2D Lateral, Bajada por Las Palmas, Semaforero, Despacho, Maquinista, Circuito LED, Laberinto de Moravia y Turno Roguelite, ponga el bot a jugar hasta el final (con el juego en pausa y M.update a mano) y verifique: que termina, que suma puntos, que no hay errores. Llámala desde tests/run.js.

A-4 · Las capturas. Corre el juego en 412 × 860 y entrega una tabla captura → hallazgo → gravedad de tus modos, del hub Valle Vivo y de la pestaña Más (21 opciones), con una propuesta para agruparla en secciones sin quitar ninguna.

Al terminar cada tarea: pruebas en verde, docs/BITACORA.md al día y una nota de 5 a 10 líneas en coord/buzon/.
```

### 3.5 Para el autor (lo que ninguna IA puede hacer)
1. En tu celular: **Más → 📏 Medir este celular → Copiar**, y pégale el informe a cualquiera de nosotras. Si tienes un celular modesto (Android 7 o iPhone 8), mejor.
2. **Más → 🧪 Modo prueba**: préndelo, deja jugar a 5 niños y, otro día, a 5 adultos (unos 15 minutos cada uno, sin ayudarles), y luego **Ver → Copiar**.
3. Confirma el **reparto con doble rol** de § 1 (o dime qué versión prefieres).
4. Dime si publico la 3.5.0 en `main` y en la página (conservando `/metro/`).

## 4. Mi siguiente paso (Claude)
1. **Con tu informe de 📏 y del 🧪:** arreglar lo que salga primero en tu celular (tirones, botones que no se alcanzan, modos donde la gente se rinde).
2. **Revisar e integrar** lo que entreguen ChatGPT y Gemini: arte con la lista de control y su respaldo, y código con las pruebas.
3. **Ordenar la entrada:** agrupar los 31 modos en cinco secciones (Oficios, Carreras, Rompecabezas, Simulación y Paseos) con una fila de recomendados, y la pestaña Más en secciones, sin quitar nada.
4. **Un solo mundo 3D de verdad:** que Run 3D y la maqueta usen las cámaras de `Mundo3D`.
5. **Accesibilidad** de lo nuevo (hub, Hoy en el valle, burbujas) con las skills `motor-city-diseno-ui` y `motor-city-web-moderna`.

## Fuentes
- Las reglas de respuesta de los diálogos: Elan Ruskin, «AI-driven Dynamic Dialog through Fuzzy Pattern Matching» (GDC 2012, Valve), la idea que también usa Motor City 5.2.
- La inclinación de una bici en una curva: φ = atan(v²/(g·r)) = atan(v·ω/g), la física de cualquier vehículo de dos ruedas.
- Lo demás está en `docs/INFORME-MOTOR-CITY-4.6.md` (las notas de Motor City 4.8 a 5.2).
