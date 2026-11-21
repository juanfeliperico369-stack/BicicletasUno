# Bitácora de Motor City

## 21-nov-2026 · 4.2.0 · Las entregas de las otras IA unidas, recorte por región, la historia se encuentra en el mundo abierto
- **Unidas:**
  - **ChatGPT/Codex** (`ia/chatgpt/4-0-2-gemini-auditoria`, 13 commits):
    - el arte de Gemini en la portada (WebP adentro del HTML);
    - 6 GLB con UV y PBR;
    - una sola ciudad en memoria al viajar;
    - el globo en celular vertical;
    - piezas y humo también en 2D y en Raster.
  - **C‑M34** (`ia/chatgpt/cm34-cache-20261120`, 26 commits): Turno Cero carga los MC4 **por capas comprimidas bajo demanda**, con caché LRU de sectores de Manhattan. Pruebas en Node y en Chromium.
  - **Antigravity** (`ia/antigravity/motorcity-4.0`):
    - las técnicas clásicas probadas sobre datos MC4 reales: `experimentos/tecnicas-clasicas/`, con laboratorio interactivo y 6/6 pruebas;
    - `docs/MOTORES-CLASICOS-INGENIERIA.md` (RenderWare, *Driver*, Silent Hill, *Shadow of the Colossus*, Unreal…);
    - la verificación visual 4.0.3.
  - **Las paradas de carretera:** 56 (28 de Gemini y 28 de ChatGPT), con `id`, `nombre_es`, `nombre_en` y `rutas`. El generador las usa tal cual.
- **Motor:**
  - **recorte por región en el 3D (`js/45-gl.js`):**
    - lo que está más allá del muro de niebla no se dibuja (Silent Hill);
    - en las cámaras de manejo, lo que queda detrás de la cámara tampoco;
    - en tercera persona se dibujan **17–18 de 58 regiones**; las cámaras aéreas no se recortan.
  - **IA:**
    - los carros de la IA atropellan lo menor del andén (poste, banca, paradero, caneca, hidrante) en lugar de trancarse; árboles y rocas sí los paran;
    - cruzan las casillas de borde (ladrillo, o edificio sin edificio real encima).

    Esa era la causa de la prueba que a veces fallaba: el rival de la carrera chocaba con un ladrillo del borde. Ahora avanza 55–87 m en 6 s.
  - **⛰️ Vuelo sin pausa:** la primera ventana también se arma por franjas, con un aviso de carga. El peor cuadro baja de unos 300 ms a 24 ms.
- **Turno Cero:**
  - **la historia se encuentra en el mundo abierto** (`56-abierto.js`):
    - un 📖 en la calle y en el minimapa donde empieza el próximo capítulo, o donde quedó la historia;
    - al pasar cerca **solo avisa**; se juega si uno toca 📖 Historia;
    - si el capítulo es en otra ciudad, lo dice al entrar;
  - **la carrera callejera:**
    - la meta queda hacia adelante;
    - el rival sale en el carril de al lado, sin encimarse;
    - si todavía no tiene ruta, va derecho a la meta.
  - el HUD dice «🌎 Mundo abierto».
- **Probado:**
  - Node: 141;
  - el contenido de Turno Cero;
  - C‑M34 en Node y en Chromium;
  - la técnica clásica de Antigravity (6/6);
  - la batería de Chromium completa;
  - capturas a `412 × 860`.

## 21-nov-2026 · 4.1.0 · Motores clásicos: lo que hicieron Comanche, OutRun, Thief, Wolfenstein y Elite, rehecho para Motor City
- **El pedido del autor:**
  - investigar motores viejos que hoy son livianos pero potentes;
  - ver cómo los usaron los mejores juegos;
  - traer sus partes al motor.
- **Regla:** sala limpia. Se toman las ideas publicadas y se escribe el código desde cero. No se copia código GPL, ni de licencias propias, ni filtrado. Licencias y fuentes en `docs/INVESTIGACION-MOTORES-CLASICOS.md`.
- **`js/47-clasicos.js`:**
  - **🏁 Arcade (`MC.Arcade`):** la carretera pseudo-3D de Pole Position y OutRun, sobre la vía real:
    - proyección por segmentos con recorte en el plano cercano;
    - franjas fijas al mundo y lomas del relieve;
    - montañas en paralaje con el rumbo;
    - pinos, palmas y cactus según el bioma; postes; letreros de veredas;
    - edificios del mapa como cajas; carros y patrullas con sirena;
    - faros de noche;
    - en celular vertical, la cámara se ajusta para no abrir demasiado el campo.
  - **⛰️ Vuelo (`MC.VoxelSpace`):** el Voxel Space de Comanche:
    - mapa de alturas y de color desde el MC4, con los edificios encima y la luz horneada;
    - columnas con y-buffer de adelante hacia atrás;
    - la ventana nueva se arma por franjas, para no trabar el juego.
  - **`MC.Sigilo` (Thief):**
    - la gema de luz: sol, sombra de los edificios hacia el sol, postes de noche y faros;
    - el ruido que rodea los edificios (Dijkstra en una rejilla de 4 m).
  - **`MC.DDA` (Wolfenstein 3D):** las casillas exactas de un rayo.
  - **`MC.Semilla` (Elite):** nombres de veredas siempre iguales desde tres números de 16 bits.
- **Turno Cero: mundo abierto desde el principio.** Pedido del autor: «quiero mundo abierto desde el principio; el tutorial o el contexto de la historia es opcional».
  - En la portada, el primer botón es ▶ **Jugar · mundo abierto**: Medellín (la ciudad más liviana en memoria) o donde quedaste, sin tarjetas ni diálogos. En la VM tarda 1,7 s.
  - La historia es opcional: 📖 en la portada, el botón 📖 Historia en el juego, ⏸ Menú y la tecla H (seguir, empezar o repetir un capítulo).
  - La casilla «Entrar directo» salta la portada la próxima vez, solo si ya se aceptó el 18+. Con `?portada` vuelve.
  - El HUD dice «🌎 Mundo abierto».
- **Turno Cero (`juegos/getaway/55-clasicos.js`):**
  - en las misiones de sigilo hay una gema ◆ que brilla según la luz; en lo oscuro, los guardias ven a un tercio de la distancia;
  - correr a pie o el motor cerca hace que un guardia vaya a mirar («👂 Un guardia oyó tus pasos»);
  - en 🎥 Cámara están las cámaras 🏁 Arcade y ⛰️ Vuelo.
- **Probado:**
  - § 22 de `pruebas/prueba.mjs`:
    - el DDA visita las casillas `0,0 1,0 2,0 3,0`;
    - Elite da los mismos 64 nombres, 64 distintos;
    - la luz vale 0,96 a mediodía y 0,24 a medianoche bajo un poste;
    - un guardia ve a 9,7 m en lo oscuro y a 24 m a pleno sol;
    - el ruido rodea un edificio: 55 m de camino contra 34 m en línea recta;
    - el camino arcade queda 100 % en la calle;
    - el voxel pone edificios de hasta 56 m;
  - el banco ahora tiene 11 vistas;
  - capturas en Chromium `412 × 860` de Medellín y de la Autopista del Embalse, de día y de noche.

## 21-nov-2026 · 4.0.3 · Terminar las tareas de las otras IA antes de que se queden sin uso
- **El pedido del autor:** «ayúdalos a completar las tareas, están por quedar sin uso». Claude unió y terminó lo que dejaron a medias.
- **ChatGPT / Codex** (`ia/chatgpt/4-0-2-gemini-auditoria`):
  - se unieron sus 6 arreglos nuevos:
    - ocho lugares corregidos;
    - diálogos que se cancelan al pasar a Calle libre;
    - portada compacta y menú con fondo;
    - guardias que solo persiguen si ven;
    - lenguaje suave en singular y plural;
  - su prueba de la persecución a pie estaba en rojo en su propia rama: `AccionPie.ocluido` miraba cada 3 m y se saltaba muros de 2 m. Ahora mira cada metro y la prueba pasa.
- **Gemini / Antigravity:**
  - las 56 paradas (28 suyas y 28 de ChatGPT) quedan en `PARADAS_RUTA`, con la prueba ajustada a 8 por bioma;
  - del informe G-H21/G-H23 se suman, sobre lo de ChatGPT:
    - el contrato «El sapo» pasa a llamarse «El testigo incómodo»;
    - el lenguaje suave cubre los finales y concuerda en género y número (`jodida` → `complicada`, `cabrones` → `canallas`);
    - el botón `G SEÑUELO` de la escena 3D se acorta a `G CEBO`;
    - la ruta de `arte3d/pruebas-modelos.py` apunta a `arte/modelos/turno-cero/` (42/42).
- **El Metro, zonas Z1 y Z2 de Antigravity:** sus 6 errores de `412 × 860` quedan arreglados en `MetroZero/src/js/98-relevo-z1.js`. Detalle en la bitácora de El Metro.
- **EnCicla, lo de Codex:** sus arreglos de código no llegaron a GitHub; solo su ficha. Quedan anotados en `CONTEXTO-RELEVO.md` § 5 para que los suba.

## 21-nov-2026 · 4.0.2 · La IA que maneja de verdad, Run en Turno Cero, carreras y guardias a pie
- **Pedido:** «Continúa mejorando».
- **Hallazgos al probar una carrera:**
  - **los carros no tenían reversa:** frenar con el carro quieto lo dejaba en cero, y si el destino quedaba atrás, el modelo frenaba para siempre;
  - **`MC.Manejo.rutaA` unía el punto de salida y el de llegada con el primer y el último nodo en línea recta**, por encima de casas y laderas.
  - Las dos cosas afectaban a toda la IA (patrullas, banda y El Contador), al «tocar para ir» y al jugador (el joystick hacia atrás no daba la vuelta).
- **Motor:**
  - **reversa** en `ManejoCarro`: quieto, frenar es reversa hasta 8 m/s;
  - **vuelta en tres puntos** cuando el destino queda atrás;
  - **`rutaA` sigue la forma de la calle** al salir y al llegar, y cuesta por distancia sobre la vía (prueba: 0 tramos sobre casas);
  - **`MC.Manejo.pilotar`**, el piloto de la IA:
    - mira adelante en la ruta y frena según la curva que viene;
    - retoma la ruta nueva por delante (no vuelve al nodo de atrás);
    - con el destino atrás, gira en su sitio (arcade, solo la IA);
    - si se atasca, retrocede, y si se traba dos veces se reacomoda hacia la calle, sin cruzar casas;
  - los carros de la IA, sobre la calle, no chocan con árboles, postes ni bancas (`C.ia`).
  - **Medido:** en Medellín una patrulla recorre 1,7 km de ruta en unos 60 s, a unos 32 m/s; en Guatapé llega en 3 de 4 casos (el que falla arranca sobre una calle que los datos marcan como edificio).
- **Turno Cero:**
  - **Run en la ciclovía**, el modo de Medellín: 🛴 sobre una ciclorruta, a pie, en EnCicla, patinete, skate o patines; si sales con más de 300 m, la policía te pierde, y los puntos dan plata;
  - **carreras callejeras** contra un coupé dorado por la red vial real, con apuestas;
  - **guardias que persiguen a pie** con la alarma, golpean de cerca y se reducen con ✊;
  - **accesibilidad**: menos destellos, sin sacudidas de cámara y subtítulos grandes (con el lenguaje suave, en ♿ del menú);
  - las metas de los contratos solo caen en calles para carro.
- **Pruebas:**
  - 152 de 152 en verde, con la sección 21 (reversa y piloto) y la prueba de rutas que siguen la calle;
  - en Chromium, Run y la carrera;
  - el bot de la historia completa sin errores.


## 20-nov-2026 · 4.0.1 · Relevo entre IAs y mejoras de los pedidos 4.0
- **Pedido del autor:** «Retoma, continúa y termina: el HTML, el link, todo actualizado y siempre un documento de contexto con todo el plan, lo hecho y lo que falta (y que la otra IA haga el suyo). Retoma las nuevas peticiones y mejora el motor, el juego de prueba, el arte y la tecnología».
- **Relevo:**
  - `CONTEXTO-RELEVO.md` contiene el plan, el estado, lo hecho, lo que falta (con dueño), las reglas y la entrada de cada IA;
  - es obligatorio que cada IA deje la suya y le pida lo mismo a la siguiente;
  - se adoptó en el motor el protocolo `coord/` de Antigravity y Codex (ficha por agente y buzón donde solo se suma);
  - el documento único empieza por el relevo.
- **Motor:**
  - **luces de los GLB:** los faros y las luces traseras se encienden de noche, y cada modelo tiene un mínimo de luz propia (`Modelos.brillo`);
  - **abolladuras por zona** en los carros 3D (`op.dano` = frente, atrás, izquierda, derecha), con faro roto, a partir de los golpes;
  - `MC.Busqueda` guarda dónde se abolló cada rival y avisa al jugador (`abolladura`);
  - la sirena se apaga en el rival aturdido.
  - Esto avanza C‑M35.
- **Turno Cero:**
  - sonido de motor por capas de rpm y sirena con efecto Doppler (C‑M36);
  - dron policial en 3D con el modelo de Codex;
  - **reducción no letal a pie** de los guardias (✊), con la animación de golpe de Codex;
  - al alejar la cámara más allá del tope se pasa al planeta con animación (C‑M31, primera parte);
  - eventos de carretera al azar en Calle libre (banda, retén, emboscada, un camionero que paga);
  - tres contratos nuevos, uno de ellos contrarreloj;
  - arte de portada: ilustración SVG procedural con Manhattan, el Metrocable, la Piedra del Peñol y la carretera.
- **Pruebas:** en Node, faros y abolladuras; el bot de la historia completa sin errores; las capturas.


## 20-nov-2026 · 4.0.0 · El planeta y *Turno Cero*
- **Pedido del autor:**
  - «empieza con la creación del monstruo; nada de *family friendly*»;
  - «combina ese mundo con Guatapé y la mejor versión de Medellín y el valle, todo en un mismo planeta, con caminos largos en medio de la nada»;
  - y luego: «adapta todo lo nuevo que se agregó».
- **Lo nuevo de Codex, unido a la rama:**
  - *Turno Cero: Manhattan*, en `docs/GETAWAY-MANHATTAN-BIBLIA.md` y `docs/GETAWAY-ESPIONAJE-3D.md`;
  - las 13 referencias;
  - el prototipo 2D;
  - el generador de 42 GLB, con su CI.
- **`MC.Planeta`** (`js/13-planeta.js`):
  - un anillo con Nueva York, la Ruta del Atlántico (16 km), Medellín y el Valle, la Autopista del Embalse (12 km), Guatapé y la Carretera del Norte (15 km);
  - las carreteras se generan con `Generador.carretera` y tienen sus biomas;
  - las puertas son reales (los puentes George Washington y de Brooklyn, las autopistas Norte y Medellín–Bogotá, la vía a El Peñol);
  - vista de globo y horizonte curvo (`uCurv` en el sombreador).
- **`MC.Busqueda`** (`js/28-busqueda.js`):
  - búsqueda de 0 a 5 con los umbrales de Codex (15/35/55/70/85) y un tope de 4;
  - los rivales nacen fuera de la vista y van a la última posición vista;
  - tácticas seguir, cerrar y embestir, con empuje por masa;
  - disparos, púas, retenes y helicóptero con reflector;
  - cebo, pulso y disparos del jugador, y captura.
- **`MC.Modelos`** (`js/45-glb.js`):
  - lector GLB sin librerías;
  - los 42 modelos de Codex, guardados en `arte/modelos/turno-cero/` (CC0);
  - la cámara 3D los usa en carros, patrullas (con barra de luces), camionetas, guardias, retenes y contenedores.
- **Construcción:**
  - juegos con varios mundos (`"mundos"`; cada MC4 va en un `<script type="text/plain">`);
  - GLB dentro del HTML (`"modelos"`).
  - Además: `Vistas.liberar()` y el tema de interfaz «noche».
- **Turno Cero** (`juegos/getaway/`, 25 MB, 18+):
  - cinco actos y siete misiones por las tres ciudades;
  - artefactos T01, T02, T03, T05, T06, T08, T09, T11 y T04;
  - sigilo con conos de visión;
  - el metro, los cables, el tranvía y el Metroplús de Medellín para perder a la policía;
  - EnCicla, lancha en el embalse, robo de carros, talleres que reparan y repintan, y escondites;
  - Calle libre con contratos;
  - finales A, B y C según las pruebas y las decisiones;
  - lenguaje fuerte, con opción de suavizarlo.
  - El diseño está en `docs/TURNO-CERO.md`.
- **Pruebas:**
  - en Node, las secciones 19 (planeta) y 20 (búsqueda y GLB);
  - en Chromium, Turno Cero de Manhattan a Medellín por la Ruta del Atlántico;
  - un bot recorrió la historia completa hasta el final A en 161 s, sin errores.
- **Corregido en el camino:**
  - al cerrar un capítulo se saltaban capítulos (el último paso se completaba varias veces);
  - el Muelle 4 caía sobre el agua;
  - los subtítulos y el letrero de la carretera tapaban el joystick y las barras.
- **Lo último de Codex** (`b2fd2e4`: la escena 3D de acción y los actores con esqueleto) quedó unido e integrado:
  - **piel y animación glTF** en `MC.Modelos.posar`: huesos, matrices de enlace y clips con interpolación, en caché por cuadro;
  - Mara a pie y los guardias se animan en la cámara 3D, y Rook, Nadia, Noah y los intermediarios esperan en sus escenas;
  - su misión 3D autónoma se copia a `dist/juegos/` (`"extras"` en `juego.json`) y se abre desde la portada.
- **Pendiente:** medir en un celular real con GPU. Los nuevos pedidos para Gemini, Codex y ChatGPT están en `TAREAS-IA.md` § 4.0.


## 20-nov-2026 · C-M27 (parcial), dirección visual y catalogación
- Sombras solares proyectadas sobre el suelo en WebGL1 (sin texturas de profundidad), mezcladas antes que los volúmenes, con cache por celda de cámara y posición solar; prueba sintética en `pruebas/prueba.mjs`.
- G-H1: 14 capturas reales auditadas, avisos duplicados corregidos, HUD atenuado más legible, nombres protegidos frente a los botones y cierre real de diálogos por el capturador.
- G-H18: `contenido/nueva-york-lugares.json` generado desde NYC CommonPlace con 50 lugares, coordenadas e IDs; excluye instalaciones municipales internas y marca accesibilidad pendiente de comprobar.
- La tabla de estado vigente, con límites y prioridades, está en `docs/ESTADO-3.1.0.md`.
- **C-M27 requiere CI del nuevo commit y prueba en GPU física**; no se afirma rendimiento móvil ni tilt-shift terminado.


## 20-nov-2026 · 3.1.0 · Persecución optativa en Mandados
- C-M26: clase pública `MC.Persecucion` con patrullas y pilotos que recomputan rutas A* por calles, un seguidor y otro que busca cortar el paso. Motor físico de `MC.Cuerpo`, sin atravesar edificios por «IA» de línea recta.
- Reto voluntario de 90 segundos con botón para iniciar/salir; disponible en moto o carro, con huellas de vehículo en el mismo mundo 3D/2D, cámara de seguimiento sin saltos y captura si el jugador se detiene.
- Los casi choques con tráfico no dan puntos en contacto ni a baja velocidad; bonus de turbo de duración corta y máximo una recompensa por ID de vehículo.
- Comprobaciones deterministas de aparición fuera del jugador, física, bonos y cierre en `pruebas/prueba.mjs`. **Validado** en el commit `ff5977ec4`: CI [#44758766581](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44758766581), con 131 tests Node y 141 en Chromium, incluido E2E de persecución. La evaluación en celular real sigue pendiente.


## 20-nov-2026 · 3.0.1 · Objetos de barrio y persistencia (ChatGPT)
- C-M29 / G-H17 (entrega parcial): 30 tipos de mobiliario urbano en `js/32-objetos.js` y tamaños **aproximados para diseño** en `contenido/objetos-gemini.json`.
- IDs estables por origen de los objetos: restauración de desplazamientos, velocidad, orientación y daño con `MC.GuardadoSectores`.
- Mandados guarda cambios de Guatapé periódicamente y al ocultar/cerrar la pestaña; los mundos aleatorios no heredan esos datos.
- Regresiones agregadas a `pruebas/prueba.mjs`. Comprobación aislada del código realizada; **batería Node/Chromium pendiente** en clon completo.
- Falta arte individualizado de cada objeto y medición con hardware móvil.


## 20‑nov‑2026 · 3.0.0 · Los tres juegos actualizados y Nueva York preparado (Claude Code)
- **EnCicla** (`src/js/97-motor30.js`):
  - la calidad automática del 3.0;
  - artilugios físicos a escala de sprite: conos de obra en las ciclorrutas y balones en las plazas, con su prueba.
- **El Metro** (`src/js/69-tutorial.js`): tutorial opcional «❓ Cómo se juega», que nunca sale solo y se puede saltar o apagar.
- **Run Scooter:** el tutorial ya no se impone en la primera partida; se pide en Ajustes.
- **Lo que sigue:** `docs/PROXIMO-NUEVA-YORK.md`, con «Getaway Nueva York» (Manhattan, el mundo de alrededor, el planeta redondo y la persecución) y las 10 reglas del feedback para todas las IA. Pedidos G‑H18, G‑H19, C‑A15, C‑M30 y C‑M31.

## 20‑nov‑2026 · 3.0.0 · Un solo mundo 3D y varias cámaras (Claude Code)
**Pedido:** el autor probó y lo sintió básico:
- las dimensiones mal ideadas;
- cosas en 2D que debían ser 3D;
- vistas como menús separados;
- casas sin fachada;
- cámara muy aérea y sin tope;
- todo el mundo cargado a la vez.

Pidió investigar #DRIVE, Pako Forever, Getaway, Reckless Getaway 2 y la distancia de GTA San Andreas. La investigación está en `docs/INVESTIGACION-CAMARA.md`.

**Lo que se hizo:**
1. **Mundo único 3D** (`js/45-gl3d.js`):
   - edificios con fachada: zócalo, ventanas con marco y vidrio encendidas de noche, puerta, balcones, cornisa, alero, pretil y tanque;
   - árboles low-poly que son los MISMOS de las vistas 2D (`MC.Arboleda`);
   - carros, busetas, motos y personas con detalle;
   - el suelo en 3D ya no trae árboles ni techos pintados.
2. **Cámaras aéreas sobre ese mundo** (`MC.Camara` perfiles `cenital`, `oblicua` y `maqueta`):
   - el mismo encuadre que la 2D;
   - más oblicua de cerca;
   - mirada adelante;
   - `persecucion` (se aleja, se inclina y se mece) y trauma.
   Sin GPU caen a su respaldo 2D.
3. **Periferia definida:** radio de carga y niebla según la cámara. Lo que se carga no se ve llegar.
4. **Topes de zoom, cámara continua y mapa grande:**
   - el zoom va de 2,6 a 22 px por metro;
   - al tope de cerca pasa a la vista detrás del jugador;
   - para ver todo, el mapa al tocar el minimapa.
5. **Rayos X del jugador** en las cámaras aéreas.
6. **Artilugios físicos** (`js/32-objetos.js`, `MC.Objetos`): conos, balones, canecas, cajas y vallas, con su prueba.
7. **Jerarquía:** una cámara de juego y la de detrás del jugador. Lo demás va en «Más vistas y filtros».

**Fluidez** (2.11, incluida aquí):
- `MC.DensidadLienzo`;
- la capa de suelo de la 2D;
- `Estilo.imprimir` medido en cada aparato.

Las vistas quedan entre 16,6 y 18 ms de mediana en un celular simulado sin GPU.

**Pruebas:** 137 en verde. Hay pruebas nuevas de la densidad dinámica y de los objetos físicos.

## 20‑nov‑2026 · 2.10.0 · Todo unido, más liviano y con las skills de los videos (Claude Code)
**Pedido:** «retoma y continúa, revisa los repositorios ya actualizados, une todo, mejora todo y optimiza todo, y añade nuevas peticiones para Gemini y ChatGPT». Llegaron 11 enlaces, y después «añade las skills y plugins de los videos y sigue desarrollando».

**Unir:**
- El Metro recibió el Motor del Valle 1.2.0 desde EnCicla. Su rama `plan-unico-el-metro` ya estaba dentro de la v2.0.0, así que no se fusionó.
- EnCicla recibió de `revolucion-v2` el alto contraste y el metro sin casas debajo (`src/js/96-accesible.js`).

**Optimizar:**
- `Estilo.imprimir` ya no lee la pantalla: usa `grayscale`, un patrón de umbrales al 50 % y `contrast(1000)`, con el respaldo por píxel a media resolución.
- Los atlas sin pérdida pasaron a WebP con calidad 88 y alfa sin pérdida. Mandados bajó de 8,2 a 5,1 MB.

**Mejorar:**
- El tramado del 1 bit y del cómic se ancla al desplazamiento del mundo con celdas de 1 px. Así se acaba el muaré de la maqueta.
- `Red.caminoEntre` (A* con varias salidas y metas) y `rutaA` corregido.
- `legacy-scan` de Modern Web Guidance: `toSorted`, `toReversed`, `replaceChildren` y `Promise.withResolvers`, con respaldo en `00-nucleo.js`.

**Skills:**
- `skills-externas.json` (Hallmark, Modern Web Guidance, find-skills y HyperFrames), con el commit revisado y la licencia de cada una.
- `node motor.mjs skills [--instalar --agente …]` y `.claude/settings.json` con los plugins.
- La skill `motor-city-skills-externas` y la política de navegadores.

**Desarrollar:** `MC.Publico` (`js/92-publico.js`) y `node motor.mjs publico`. Hay 4 perfiles con puntería, reacción, fuerza y paciencia propias, que siguen las calles con `rutaA`; el informe sale en `dist/publico.md`. Primer resultado:
- el abuelo, la gamer y el turista: «bien»;
- la niña: «revisar», atascada el 43 %. De ahí sale el encargo C‑M24.

**Lo que sigue:** G‑H10 a G‑H13, C‑M23 a C‑M25 y C‑A12 (`TAREAS-IA.md`).

## 20 de noviembre de 2026 · 2.9.1 · Persistencia por sectores

Se añadió `MC.GuardadoSectores`, con claves estables, cambios JSON por sector, transición entre sectores activos y dormidos, guardado atómico y migradores versionados. Las pruebas verifican retorno, migración y fallo de almacenamiento. La integración de esos cambios con los objetos y huellas de Mandados sigue pendiente.

La auditoría de los enlaces nuevos y las tareas abiertas está en `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`.


## 20‑nov‑2026 · 2.9.0 · Unión de la 2.8 (Claude) con la 2.7.1 (ChatGPT/Codex) (Claude Code)
Codex entregó la 2.7.1 en paralelo con la 2.8:
- 6 atlas de ChatGPT, con 676 cuadros;
- el agua precalculada en los MC4;
- el gancho `textura` y los charcos;
- el estilo de 1 bit con ruido azul;
- la caché de fachadas en la maqueta;
- los adaptadores de Godot y three.js probados;
- la auditoría C‑M1, con sus arreglos.

Se unió todo en la rama sin perder nada:
- las huellas y las palomas de la 2.8 conviven con los charcos de Codex;
- los faros y las luces de freno funcionan también con el vehículo de la piel de ChatGPT (`vehiculoArriba`);
- la cubierta sobre columnas y las ventanas de las casas de un piso pasan por la caché de fachadas;
- el hitstop se combina con la lluvia en el bucle de Mandados.

Son 12 estilos. Versión 2.9.0.

## 20‑nov‑2026 · 2.8.0 · La entrega maestra de referencias, al motor (Claude Code)
**Pedido:** el autor trajo `MOTOR-CITY-ENTREGA-MAESTRA.md` («prepara todo»). Reúne los 14 reels, los videos y el análisis de ChatGPT y de Gemini:
- 25 fichas;
- el peso y la vida;
- la arquitectura portable;
- el rendimiento en móvil y las fases.

**Lo que se hizo:**
1. La entrega quedó en `docs/referencias/` y como anexo del documento único. Su resumen, ficha por ficha y con lo que ya está en el motor, está en `docs/INSPIRACION-VISUAL.md` §1.
2. **Vida (R12, R19):**
   - palomas que comen en plazas, andenes y parques, y alzan vuelo cuando el jugador se acerca rápido (evento `fauna`);
   - huellas de llantas y pisadas en arena, tierra, nieve y barro (con lluvia, también en el pasto), que duran 4 minutos.
3. **Peso y luz (R13, R19):** faros de noche y luces de freno del jugador. El hitstop también corre en el bucle de Mandados.
4. **Filtros (R17, R22):** los estilos vintage, CRT y visión térmica, para 11 en total.
5. **Accesibilidad (§10.3, §13):** `MC.opciones.sacudida` y `particulas`, en Ajustes.
6. **Medir (§13, §14, R20):** `MC.Telemetria` con fps y tiempos de cuadro en p50, p95 y p99; en Ajustes → Telemetría, con la física del jugador. También calidad automática, baja, media o alta.
7. **Contratos (§12.3, §16):** `schemas/` (escena, puente y entidad, `schema_version: 1`) y `MC.Contratos.validar`. La tabla de los contratos mínimos de la entrega y dónde están en Motor City está en `docs/MOTORES-POTENTES.md`.
8. **Repartido en `TAREAS-IA.md`:**
   - Codex: C‑M20 (API de construcción por código y pincel de mundo), C‑M21 (suspensión, balanceo, cosas que se rompen, IK, tablero y taller con rayos X) y C‑M22 (guardado versionado y sectores);
   - ChatGPT: C‑A10 (tipografía propia) y C‑A11 (interfaz de libreta);
   - Gemini: G‑H7 (verificar las 13 URL y las 7 fichas que solo describe su informe) y G‑H9 (medición en un celular real con la telemetría).

9. **Llegó la entrega de Gemini (G‑H1…G‑H8)** y se unió a la rama. De sus capturas se corrigió:
   - la zona libre deja margen para la columna de botones (80 %): en su máquina, la prueba fallaba por 4 px;
   - `ui.aviso(texto, ms, clave)`: el aviso de la vista reemplaza al anterior y nunca queda desfasado;
   - ventanas encendidas en las casas de un piso;
   - las cubiertas sin muros se dibujan sobre columnas;
   - cebras sin cruzarse en «#»;
   - en Mi casa, el botón «Comprar» completo, la burbuja dentro de la casa y el rótulo de los cuartos pequeños;
   - la sombra horneada de las copas, más pequeña.

   También se sacaron las paletas de las obras colombianas de su lista. Wikimedia limita las descargas, así que algunas quedaron para después.
10. **Rendimiento:** las huellas se dibujan en lote (16 trazos en vez de cientos). En esta máquina nueva, la cenital de Medellín mide 14–16 ms tanto en la 2.7 como en la 2.8: no es una regresión, es el contenedor.

**Probado:** 125 pruebas:
- huellas y palomas;
- partículas apagadas por accesibilidad;
- telemetría en percentiles;
- la escena, el puente y la entidad pasan su esquema y uno roto no;
- los 11 estilos en Mandados.

Además se hizo una revisión visual de noche (faros), de las palomas y de los filtros nuevos.

## 20 de noviembre de 2026 · 2.7.1 · Arte a escala y adaptadores

Mandados incorpora seis atlas de ChatGPT con 676 cuadros. Los 997 cuadros del paquete de Gemini pasan el revisor tras reparar los recortes y márgenes. Guatapé y Medellín cargan su hidrografía desde MC4. Godot 4 y three.js abrieron escenas del motor.

El banco integrado pasó 130 pruebas. La maqueta midió 34,9 ms con CPU 4×, por encima de la meta de 20 ms. El informe enlaza las pruebas de los tres juegos, las capturas y los pendientes. [Entrega del motor compartido](ENTREGA-CHATGPT-MOTOR-CITY-2.6.md)


## 20‑nov‑2026 · 2.7.0 · Estilos gráficos, peso y vida, y motores potentes (Claude Code)
**Pedido:**
- 14 reels de referencia;
- «Necesito peso y vida en el motor, y que se pueda adaptar a motores más potentes.»
- «Estéticas de cómic, manga, anime y novelas gráficas.»
- «Investiga y aprende de las mejores obras visuales e inspírate en ellas. Recopila y adapta arte de verdad.»

**Lo que se hizo:**
1. **Reels:** se leyeron 4 de 14 sin iniciar sesión:
   - un RPG inspirado en Dragon Ball;
   - *Cairn*;
   - un *rover* en la web;
   - carreras cinematográficas tipo Dakar.

   Los otros 10 quedan para Gemini (G‑H7).
2. **`MC.Estilo`** (`js/16-estilos.js`): 8 estilos hechos de datos (mapa de color, tinta, trama, sombra, árboles, cielo y pase final):
   - realista y clásico;
   - **cómic**: tinta, semitono y onomatopeyas;
   - **manga**: grises, tramado y líneas de velocidad;
   - **anime**: *cel* en 6 bandas, línea fina, sombras azul violeta y cielo de Shinkai;
   - **novela gráfica**: tres tonos de papel y tinta, sombras negras, árboles en silueta y el rojo como acento;
   - **ukiyo-e**: paleta de Hokusai;
   - **acuarela**: papel y pigmento en el borde.

   Las losas, los muros, los techos, las sombras, el cielo y los árboles pasan por el estilo. En Mandados: 🗺️ Vista → 🖌️ Estilo.
3. **Arte de verdad:** paletas de 10 obras de dominio público bajadas de Wikimedia Commons (Hokusai, Hiroshige, Van Gogh, Monet, McCay, Mucha, Doré, la Comisión Corográfica y Winslow Homer), en `arte/dominio-publico/`. En el repositorio solo quedan los colores, con fuente y licencia.
4. **`MC.Vida`** (`js/88-vida.js`):
   - al aterrizar, el cuerpo se aplasta, la cámara se sacude según la caída y salta polvo;
   - el vehículo cabecea al acelerar y al frenar;
   - en los choques hay **hitstop** (60 ms; `MC.Bucle`);
   - bandadas de garzas y palomas con su sombra, que aletean a dos cuadros;
   - hojas que caen y salpicaduras;
   - el viento mece las copas de cerca;
   - onomatopeyas en los estilos dibujados.
5. **`MC.Exportar` y `MC.Puente`** (`js/89-exportar.js`) y `node motor.mjs exportar`: el mundo sale en **glTF 2.0** (terreno, edificios, vías y árboles, con colores por vértice), con alturas RAW 16 y escena JSON. El GLB de Guatapé:
   - pasa el **validador de Khronos con 0 errores y 0 avisos**;
   - three.js lo dibuja tal cual.
6. **Investigación:** `docs/INSPIRACION-VISUAL.md` (Spider‑Verse, Arcane, Shinkai, Ghibli, *Sin City*, Moebius y *ligne claire*, *Obra Dinn*, Vlambeer, Disney y ukiyo-e, con fuentes) y `docs/MOTORES-POTENTES.md` (Godot, Unity, Unreal, Blender y three.js).
7. **Tareas nuevas** en `TAREAS-IA.md`:
   - Gemini: G‑H7 (describir los reels) y G‑H8 (40 obras de dominio público, también colombianas);
   - ChatGPT: C‑A8 (láminas guía de los estilos) y C‑A9 (personaje en *cel*);
   - Codex: C‑M18 (Godot, Unity, Unreal y una vista three.js o WebGPU) y C‑M19 (1 bit con trama estable).

**Probado** (123 pruebas):
- estilos (manga en grises, novela con acento, ukiyo-e con la paleta de Hokusai);
- vida (aterrizaje, partículas y bandadas);
- un GLB bien formado;
- los 8 estilos en Mandados, sin errores.

La maqueta de Medellín, con la CPU 4× más lenta, mide 31 ms.

## 20‑nov‑2026 · 2.6.0 · Estilo realista familiar, árboles de pie y tareas de cada IA (Claude Code)
**Pedido:**
- «Haz una revolución para que los gráficos sean más realistas: desde la vista cenital los árboles se ven como tapetes en el suelo.»
- «Deja el estilo *family friendly*, pero dale más realismo, rudeza y crudeza.»
- «Los tutoriales deben ser opcionales.»
- «Copia todos tus pedidos en los repositorios para que cada uno continúe.»
- «Gemini con Antigravity pasa a *hydrogen*: déjale las tareas fáciles. ChatGPT con Codex sigue con *astra*: encárgale mejores pedidos; GPT genera mejores imágenes.»

**Lo que pasaba:** los árboles eran discos pintados en el piso de las losas. Desde una vista inclinada, el piso se aplasta y los discos quedaban como elipses acostadas: «tapetes».

**Lo que se hizo:**
1. **`MC.Arboleda`** (`js/29-arboleda.js`):
   - los mismos árboles (y los mismos con que se choca) se levantan en la maqueta, la oblicua y la lateral: tronco que se afina, ramas, copa de lóbulos con luz de arriba a la izquierda, hojas, y flores en los guayacanes;
   - desde arriba, la copa tiene volumen;
   - 6 especies (guayacán amarillo y rosado, ceiba con raíces tablares, mango, urapán y monte), 3 variantes cada una;
   - sprites horneados una vez, con versiones reducidas y copia nocturna;
   - sombra según el sol de cerca, y la sombra bajo la copa horneada en el piso.
2. **`MC.Rudeza`**, horneada en las losas (no cuesta por cuadro):
   - asfalto con parches, grietas, manchas de aceite y alcantarillas;
   - centro de carril más gastado;
   - andén de baldosa con bordillo;
   - pasto con parches secos y verdes;
   - tejas de barro en hileras y planchas con humedad;
   - grano;
   - paleta 30 % menos saturada.

   Además, los muros tienen la base sucia y sombra bajo el alero.
3. **`MC.estilo`** (`'realista'` por defecto o `'clasico'`) y el selector 🖌️ en Vista.
4. **Tutorial opcional:** ya no se abre solo; está en la portada («❓ Cómo se juega (opcional)») y en ⚙️ Ajustes.
5. **Tareas de cada IA:**
   - **`TAREAS-IA.md`** en los cuatro repositorios;
   - Gemini («hydrogen»): G‑H1…G‑H6, tareas fáciles;
   - ChatGPT («astra»): arte C‑A1…C‑A7 y código C‑M13, C‑M16, C‑M17…;
   - `node motor.mjs capturas` y `revisar-arte` para que las tareas fáciles sean comprobables;
   - el gancho `arbol` para el arte de ChatGPT.
6. **Rendimiento:** la maqueta de Medellín con la CPU 4× más lenta mide 30–38 ms (el límite es 40). Los árboles de pie se ralean parejo si son muchos, y con calidad media salen desde un poco más cerca.

**Probado:** 119 pruebas:
- los árboles que se ven son los que chocan;
- Mandados en un celular táctil: tutorial opcional, árboles de pie y arte cargado;
- la CPU 4× más lenta.

Capturas de día, tarde y noche en la maqueta, la cenital y la lateral.

## 19‑nov‑2026 · 2.5.1 · Mandados jugable de verdad (Claude Code)
**Pedido:** «Traté de probar el minijuego pero es injugable. No hay controles de verdad, no se puede mover nada. No está completamente liberado porque hay que pagar cosas. Mejóralo con lo nuevo. ¿Ya están todos los pedidos en el repositorio?»

**Lo que pasaba:**
- El personaje sí se movía, pero la cámara estaba tan lejos que en un celular medía unos 3 píxeles.
- El joystick era invisible.
- Por eso parecía que nada respondía.
- Además, casi todo costaba plata.

**Lo que se hizo:**
1. **Cámara cerca:** unos 45 m en el lado corto de la pantalla, en celular y en computador. El jugador tiene un **anillo verde con flecha**.
2. **Joystick visible** abajo a la izquierda (`ui.joystick`), con la guía «Arrastra para moverte» (en computador: «Flechas o WASD»).
3. **Botones de acción** redondos abajo a la derecha (`ui.accion`): ⤒ saltar y ⚡ turbo; 🔽 bajar y 🔼 subir aparecen en el agua o en el aire.
4. **Flecha al objetivo** con la distancia (`MC.UI.indicador`), siempre dentro de la zona libre, sin tapar la interfaz.
5. **Modo libre**, prendido por defecto: los 34 vehículos, la lancha, la gasolina, la casa, los lugares y el modo alcalde son gratis. Se apaga en ⚙️ Ajustes.
6. **Tutorial** «Cómo se juega» al empezar, y otra vez desde Ajustes. Los menús quedaron en **Vista** (vistas, pixel y zoom) y **Ajustes** (modo libre, controles y rescate).
7. **El primer mandado empieza cerca**, y la distancia crece con cada entrega.
8. La interfaz:
   - las barras pasaron arriba y la velocidad, abajo al centro;
   - la tarjeta del mandado lleva el título en una línea y, primero, la distancia y el tiempo.
9. **`docs/PEDIDOS.md`:** cada pedido del autor, su estado y dónde quedó. Hay 55 hechos, 2 que dependen de afuera y 3 pendientes con dueño.

10. **Llegó la entrega de Gemini** (`ENTREGA-GEMINI-MOTOR-CITY-2.5.md`, G‑M0…G‑M15) y quedó integrada:
    - el arte, extraído a `arte/gemini/`: 10 atlas WebP, manifiesto, 53 íconos, 30 hitos y paletas;
    - `MC.Pieles` lo instala como piel con respaldo procedural en cada gancho, a la medida del motor y con una copia nocturna;
    - en Mandados se usan los árboles del trópico, los props, las rocas, las fachadas y los muebles, con el selector 🎨 Arte en Vista;
    - el personaje, los vehículos y los animales siguen procedurales, porque los de Gemini no vienen a escala;
    - la revisión está en `arte/gemini/LEEME.md`.
11. **De la auditoría de Gemini** se corrigió:
    - la leyenda de las capas de datos (`ui.leyenda`);
    - las etiquetas de los cuartos, ahora en la esquina;
    - las ventanas de noche en las casas bajas;
    - la maqueta, sin el corte de tierra de la vista lateral;
    - las barras, con fondo.

    También apareció un `//` que desde la 2.2 anulaba `mision.hidden` y el `aria-live` del aviso.
12. **De la auditoría de Codex** (`docs/AUDITORIA-MOTOR-CITY-2026-11-19.md`): las pruebas usan el Chromium del sistema si Playwright no trae el suyo, o el que diga `MC_CHROMIUM`. Quedan anotados, con su dueño:
    - la maqueta, que midió 44,7 ms en su máquina y aquí 27–29 ms;
    - el test de WebRTC de EnCicla.

**Probado** (118 pruebas). La nueva, en un celular táctil emulado (412 × 860), comprueba:
- aparece el tutorial;
- todo es libre y gratis, con 34 vehículos;
- el joystick se ve;
- arrastrarlo mueve al personaje unos 4 m en 2 s;
- la cámara da 9 px por metro;
- el primer mandado está a menos de 900 m;
- el arte de Gemini carga (10 atlas, de día y de noche) sin sprites faltantes.

En computador, las flechas y WASD mueven y giran.

**Falta:** probarlo en un celular real.

## 19‑nov‑2026 · 2.5.0 · Entrar al agua (Claude Code)
**Pedido:** «Añade la capacidad de poder entrar en el agua».

**Lo que pasaba:** en la 2.4 solo se entraba a pie. Mandados empieza en bici, así que el juego frenaba en la orilla.

**Lo que se hizo:**
1. **Bajarse en la orilla:** con un vehículo, al empujar 0,6 s hacia el agua honda (o con «🏊 Al agua»), uno se baja, el vehículo queda **parqueado en la orilla** y se entra al agua. Al volver: «Subirse».
2. **Nadar y bucear:** «🤿 Bucear» (Z o Ctrl) baja hasta medio metro del fondo; «⬆️ Subir» (espacio) sube; quieto, se flota hacia arriba.
3. **El aire:** dura ~35 s bajo el agua y se recupera arriba. Sin aire, la persona sube sola y no vuelve a bajar hasta tomar algo de aire.
4. **Poses** de crol y de buceo, el agua tapando el cuerpo, burbujas y la pantalla azul con rayos de luz bajo el agua.
5. **Lancha:** se alquila en el garaje si hay agua honda a menos de 30 m. Con «⚓ A tierra» uno se baja a la tierra firme más cercana y la lancha queda amarrada.
6. **Ocurrencias:** ya no «arregla» al que bucea como si estuviera bajo el piso.

**Probado** (117 pruebas):
- la bici se queda en la orilla de Guatapé y se entra nadando;
- se bucea con aire limitado y, sin aire, se sube aunque se siga oprimiendo «bajar»;
- se sale del agua y se vuelve a la bici;
- la lancha navega, desembarca y queda amarrada;
- en Mandados, el botón «Al agua» aparece en la orilla y funciona.

## 19‑nov‑2026 · 2.4.0 · Montañas, rocas, agua y límites de paso (Claude Code)
**Pedido del autor:** un sistema de montañas, rocas y tipos de terreno; agua en lagos, ríos, playa y mar; y límites de movimiento que no rompan la verosimilitud («el personaje pasa por encima de cosas que no debería»).

**Lo que se encontró** (por qué se atravesaban cosas):
1. Sobre las casillas de calle no se revisaban los edificios.
2. Los edificios de los sitios y los emblemáticos no chocaban.
3. Los árboles de las losas solo eran dibujo.
4. Postes y bancas no chocaban.
5. El agua era «sí o no», sin profundidad.
6. La pendiente frenaba, pero nunca bloqueaba.

**Lo que se hizo:**
1. **`MC.Terreno`:**
   - análisis del agua: componentes, tipo (mar, lago, río, quebrada) y distancia a la orilla, con la profundidad que sale de ahí;
   - reglas de paso por clase con su motivo: a pie se vadea y luego se nada; bici, moto, carro y camión tienen un límite de agua; la lancha necesita calado;
   - pendiente máxima fuera de las vías (subir y bajar barrancos);
   - roca, monte, arena y nieve según el vehículo;
   - borde del mundo;
   - obstáculos: edificios también sobre la calle si uno se mete más de 1 m, sitios y emblemáticos, los mismos árboles que pintan las losas, mobiliario, naturaleza, y tráfico y gente si el juego los pasa.
2. **`MC.Naturaleza`:** rocas (las grandes chocan), palmas, frailejones en el páramo, arbustos y juncos.
3. **Generador:**
   - lagos por llenado de prioridad (Barnes, 2014), solo los grandes y hondos, de superficie plana y con desagüe;
   - el mar a nivel 0;
   - los pueblos no se construyen sobre los lagos;
   - los charquitos sueltos se limpian.
4. **Dibujo:**
   - el agua toma color por tipo y profundidad, con espuma en la orilla;
   - la roca asoma en las laderas de más de 65 %;
   - brillos que se mueven sobre el agua;
   - vadear y nadar se ven, en lateral y en cenital.
5. **Mandados:** el agua se mide al cargar; dice por qué no se pasa (🌊, ⛰️, 🌳, 🪨) y avisa al nadar; nadar cansa; el tráfico y la gente estorban.

**Probado** (115 pruebas):
- el embalse de Guatapé es lago, de 0,3 m en la orilla y 16,6 m adentro;
- Medellín tiene su río;
- caminando hacia el embalse se termina nadando;
- la bici no entra a lo hondo y la lancha no anda en lo pando;
- el carro no sube una ladera de 68 % fuera de la vía;
- no se atraviesan los emblemáticos, los postes ni los árboles;
- los lagos generados son planos, el mar está a 0 m y nada de naturaleza cae sobre las vías.

## 19‑nov‑2026 · 2.3.0 · La ciudad como SimCity, Los Sims, Cities: Skylines y Townscaper (Claude Code)
**Pedido del autor:**
- estudiar esos juegos y sus motores: cómo crean entornos, ambientes, sombras y detalles de una ciudad;
- añadirlo al motor, porque es crucial para cómo se crea;
- entregar **un solo documento** con todo (contexto, código a usar y plan de cada IA), el minijuego, el HTML y el link.

**Lo que se hizo:**
1. **Sombras del sol** por hora en las vistas 2D y en el raster: casco convexo en caché, recorte de techos en cenital y oclusión de contacto en las losas. Probado: a las 12 h la sombra mide 0,13 m por metro de altura; a las 16:30, 2,4 m y hacia el oriente; de noche, nada.
2. **Mobiliario urbano** por vía, con azar fijo: cerca del Coltejer, 269 postes, 206 árboles, 30 cebras, 45 bancas y 11 paraderos, ninguno dentro de un edificio. **Luces de noche** en charcos cálidos.
3. **Fachadas por reglas** (WFC) en ciudad 3D, maqueta y lateral: locales, vitrinas y puerta abajo, balcones alineados y muros ciegos.
4. **`MC.Urbe`:**
   - campos de 40 m (valor, ruido, contaminación, verde, servicios y transporte);
   - zonas de 8 m junto a las calles;
   - demanda RCI que responde a lo que se construye;
   - lotes que crecen mirando a la calle y suben de nivel;
   - energía y agua con capacidad (GlassBox);
   - predial y mantenimiento en el libro;
   - capas de datos encima de las vistas.

   Un parque sube el valor de 45 a 60.
5. **Los Sims:** objetos que anuncian necesidades, `MC.Habitante` (con hambre va a la nevera o a la estufa) y ambiente de la casa (decorar lo sube). Ninguna casa queda sin cocina ni cama.
6. **Townscaper:** WFC, autotile (4, 8 y esquinas) y rejilla irregular relajada.
7. **Paisaje sonoro:** tráfico, pájaros, grillos, lluvia, truenos, viento, agua y gente.
8. **Mandados:** 🏙️ modo alcalde (capas, zonas, parque, colegio, planta solar y resumen), casa con alguien que vive en ella y menú de sonido.
9. **Ganchos de arte** `prop`, `fachadaModulo` y `mueble`.
10. **Documentos:** `docs/DOCUMENTO-UNICO.md` y `node motor.mjs documento` (→ `dist/MOTOR-CITY-TODO.md`). `PLAN-IAS` y `PETICION-*` ahora apuntan ahí.

**Cifras** (CPU 4× más lenta, con sombras y mobiliario):

| Vista | ms |
|---|---|
| Cenital | 8–10 |
| Ciudad 3D | ~15 |
| Maqueta | ~27 |
| Lateral | 14–20 |

La calidad automática baja el detalle si hace falta. Bajar la maqueta a menos de 20 ms es el encargo C‑M13. 109 pruebas en verde.

## 19‑nov‑2026 · 2.2.0 · GPU virtual, mi casa, lugares, historias y vista lateral (Claude Code)
**Pedido del autor:**
- una solución a la tarjeta gráfica;
- mejor física en puentes y cámara;
- ver las vistas centrales de lado, estudiando FEZ, Little Nightmares y Monument Valley;
- sprites;
- interfaz con psicología, que no estorbe;
- estudiar los mejores motores;
- historia con diversión, reflexión y conciencia;
- ocurrencias;
- manual, optimización y tipos de controles;
- la casa del jugador por su dirección, con interiores únicos y diseñables;
- talleres, tiendas y más lugares;
- historias procedurales, No Man's Sky y tamaños proporcionales.

**Lo que se hizo** (todo con pruebas; 103 en verde, también en Chromium):
1. **GPU virtual** (`05-gpu`, `44-raster`):
   - perfil del aparato;
   - resolución dinámica PI y bucle de paso fijo;
   - **3D por software en Canvas 2D**: 15–25 ms, contra 70–90 ms del WebGL por software.
2. **Física de niveles por superficies:** se sube por la rampa y se pasa por debajo, probado en 5 puentes reales. Tiempo de coyote y memoria del salto.
3. **Cámara** con resortes críticamente amortiguados, brazo con choque (edificios, cerros y tableros), FOV por velocidad, trauma y giros animados.
4. **Vista lateral:** casa de muñecas, giro de a 90° (FEZ) y rayos X. La ciudad 3D también se inclina hasta quedar de lado.
5. **Manejo** (curvas, giro según la velocidad, asistencias y 7 esquemas), **sprites**, **escala real** (los 35 vehículos validados) e **interfaz** por zonas: columna arriba, atenuación, cola de avisos, foco y cine. `MC.UI.verificar` prueba que nada tape el centro.
6. **Interiores** con 8 estilos, cuartos opcionales, decoración, catálogo de 22 muebles y lugares nuevos (taller, tienda, centro comercial, biblioteca y restaurante).
7. **Mi casa** (`49-hogar`):
   - lee la nomenclatura colombiana y la ubica en las calles reales, sin internet;
   - acierta «Calle 50 # 52‑20» en La Candelaria y elige el municipio correcto si se dice;
   - el jugador diseña su casa y la compra cuadra en el libro.
8. **Lugares jugables y desgaste** (`82-lugares`): 195 lugares en Guatapé, con talleres que reparan y mejoran, tiendas con energía y bibliotecas con datos reales.
9. **Historias** (`85-historias`): storylets en tres pilares, director de ritmo, encargos procedurales y **ocurrencias** con corrección y reporte sin datos personales.
10. **Cosmos** (`13-cosmos`): estrellas con abundancias reales, planetas con Kepler, gravedad, temperatura y atmósfera, mundo jugable, criaturas verosímiles y relieve infinito.
11. **Mandados** con todo lo anterior.
12. **Documentos:** `docs/MANUAL.md`, `INVESTIGACION.md`, `OPTIMIZACION.md`, `PLAN-IAS.md` y las peticiones 2.2 a Gemini y ChatGPT.
13. **Web:** portada `index.html` + `.nojekyll` en `main`, porque Pages sirve `main`. La 2.0 se fusionó a `main` con el PR #1 del autor.

**Falta:** las entregas de Gemini y ChatGPT, medir en un celular real, la migración de cada juego a `motor-city/` (sus IAs) y la 2.3 (ver `docs/PLAN-IAS.md`).

## 19‑nov‑2026 · 2.1.0 · Motor City crece (Claude Code)
- Nombre: solo «Motor City»; los juegos lo reciben en `motor-city/`.
- Ciencia, economía, generador de mundos, territorios (`geo/territorio.py` con Guatapé), clima global, seres, taller, IA y población, interiores, música, interfaz y mecánicas.
- Minijuego Mandados; plantillas, `nuevo`, `reporte`, skills `motor-city-*` y `CONTRIBUIR.md`. 80 pruebas.

## 19‑nov‑2026 · 2.0.0 · nace Motor City (Claude Code)
**Pedido del autor:**
- Hacer un solo motor de mundo abierto según el *Plan del Mundo Abierto del Valle*, en el repo nuevo `motorcity`.
- Que quede listo para cualquier ciudad y para los juegos que vienen: *Motor City* (carreras) y *Extremo* (deportes extremos).

**Lo que se hizo:**
1. **Revisión:**
   - se clonaron y probaron los tres juegos en sus ramas más nuevas;
   - EnCicla v2.0.1: 97 ✓;
   - El Metro v2.0.0: 100 partidas, 0 errores;
   - Run Scooter v2.5.0: simulación de 100 partidas, bien;
   - se jugaron y capturaron sus vistas.

   **Hallazgos:**
   - Run Scooter es **WebGL propio**, no Canvas 2D como decía el plan.
   - El Metro ya integró su entrega (v2.0.0), pero su motor 1.2.0 sigue en la rama `motor-valle`.
2. **F1 · Mundo 2.0:**
   - `herramientas/fusionar.mjs` junta en `datos/medellin/mundo.mc4` (6 MB, 16 capas) los datos de EnCicla (10 m) y de El Metro (metros);
   - el cargador `js/10-mundo.js` trae todas las consultas.

   Cifras:
   - 639.457 huellas;
   - 2.193 pasos con nivel (el viaducto sale de los rieles reales);
   - 31 líneas;
   - 133 estaciones EnCicla;
   - 45 lugares y 30 hitos enlazados.
3. **Redes:** grafo de cruces sobre las vías reales (`js/11-red.js`): A\*, recorridos sin fin y la salida que continúa.
   - Ciclorrutas: 123 km.
   - Red conectada: 34.173 nodos.
4. **F5 · Reglas del mundo:**
   - reloj y festivos de Colombia;
   - cielo con el sol y la luna reales;
   - clima por temporadas, igual para todos;
   - transporte con horario real y determinista;
   - tráfico con semáforos reales;
   - huevos de pascua.
5. **F2 · Lo físico:**
   - personaje único con esqueleto de poses;
   - 35 vehículos (con los que vienen para Motor City y Extremo);
   - física con pendiente, choques, puentes por sus extremos, saltos, vuelo y agua;
   - controles de teclado, táctil y gamepad;
   - una cámara para todas las vistas.
6. **F3 · Vistas:**
   - cenital, ciudad 3D y maqueta 2:1 con una sola proyección y las losas en caché;
   - **panorámica de perfil**, que junta la de El Metro y la de EnCicla y suma la fila real de edificios, las siluetas de los emblemáticos, el viaducto con trenes reales, los cruces con nombre, el primer plano y el fondo suavizado;
   - WebGL (tercera y primera persona, dron y cine);
   - pixel en todas;
   - transición y calidad automática.
7. **F4 · Run en la ciclovía:**
   - se importa RunRunZero 5b2f85d casi idéntico, con 12 parches comprobados;
   - lomas y curvas reales;
   - esquinas en los cruces reales, que doblan el mundo;
   - cielo y lluvia del mundo;
   - se sale en el mismo punto.
8. **Banco de pruebas** `dist/motor-city.html` y **54 pruebas** (`node motor.mjs prueba --navegador`). Con la CPU 4× más lenta, la mediana del dibujo es:

   | Vista | Mediana |
   |---|---|
   | Cenital | 4,1 ms |
   | Ciudad 3D | 8,6 ms |
   | Maqueta 2:1 | 17,8 ms |
   | Panorámica | 7,3 ms |
9. **La tubería 1.x se mudó aquí:** `geo/`, `capas/`, `motor.mjs` y `js/valle.js` sin cambios. `build.py` y `fetch.py` ya leen la ventana de cualquier ciudad (`CIUDAD=ciudades/x.json`).
10. **Documentos:**
    - `MOTOR.md` (el contrato 2.0) y `CONTEXTO-IA.md`;
    - migración de EnCicla y de El Metro;
    - receta para otras ciudades y visión de los juegos que vienen;
    - peticiones de arte y auditoría para Gemini y ChatGPT.
11. **Juegos:**
    - se sincronizó el motor 2.0 en `motor-valle/` de EnCicla y de El Metro, sin cambiar su código ni sus datos;
    - en cada repo hay una nota `docs/CONTEXTO-MOTOR-CITY.md` y una entrada en su bitácora;
    - sus pruebas siguen en verde.

**Errores encontrados y corregidos en el camino:**
- La tabla de capas se pisaba con el `n` de los edificios.
- El inflador entraba en un bucle sin fin con datos truncados.
- Había una llave de más en `45-gl.js`.
- `[hidden]` no ocultaba la pantalla de carga.
- La conversión de grados a metros estaba mal.
- Faltaba un nulo en los cruces de la panorámica.
- Un color `rgba` daba negro.
- En el pixel, las etiquetas salían gigantes.

**Lo que sigue:** ver `CONTEXTO-IA.md` §5.

## C-M34 · 20-nov-2026 · Entrega candidata de ChatGPT (NO PUBLICADA EN MAIN)

Rama: ia/chatgpt/cm34-cache-20261120. Motor 4.0.3 base sin incremento de versión.
- MC.Sectores1km: precarga de sectores por cercanía al centro con presupuesto LRU estable, rechazo de coordenadas y configuración inválida.
- Test nuevo: pruebas/sectores-cm34.mjs (5/5 grupos Node locales); paso añadido a motor-city-qa.yml.
- Investigación aplicada a futuras versiones: Build, Quake/PVS, GTA III/LOD, Godot/HLOD; separación entre caché ED1 y streaming MC4 real.
- Informe técnico y evidencias: reportes/2026-11-20-chatgpt-cm34-sectores-y-motores.md.
- Pendiente: CI completa, mediciones GPU reales, streaming MC4 por chunks y revisión por Claude antes de integrar.

## C-M34 · Continuación · paquetes MC4 offline por capas (PR #9, candidato)

- API nueva compatible `MC.Mundo.desdePaquete` / `cargarPaquete`; decodificación de capas comprimidas a pedido.
- Builder opt-in `mundos_capas:true` particiona el contenedor MC4 existente por capas sin alterar el formato ni sus bytes, mantiene HTML único sin internet.
- Turno Cero usa el nuevo formato para Nueva York, Medellín y Guatapé; el cargador monolítico anterior sigue como respaldo.
- Nuevas pruebas Node de equivalencia byte a byte y Chromium de juego real (`pruebas/paquete-capas-*.mjs`), añadidas a CI.
- Guía `docs/MC4-CAPAS-OFFLINE.md`; informe `reportes/2026-11-20-chatgpt-cm34-sectores-y-motores.md`.
- **No se fusionó ni incrementó versión.** Mantener pendiente hasta CI, benchmark JS Heap/CPU y GPU física. Todavía NO son sectores geográficos de 1 km.
