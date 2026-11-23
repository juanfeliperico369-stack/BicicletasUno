# Plan 5.0 · «Que se sienta» (23‑nov‑2026)

> **Pedido del autor:** llegar al nivel de los grandes juegos de mundo abierto (GTA San Andreas, Chinatown Wars), tomando de otros motores las ideas y no el código. Gemini vuelve a estar disponible: el trabajo se reparte entre **Claude**, **ChatGPT (Codex)** y **Gemini (Antigravity)**.
>
> **Listas de pedidos:**
> - ChatGPT y Codex: `docs/PEDIDOS-CHATGPT-5.0.md`;
> - Gemini y Antigravity: `docs/PEDIDOS-GEMINI-5.0.md`.

## 1. Diagnóstico: qué separa a Motor City de San Andreas

San Andreas no tenía un motor gráfico superior. Usaba RenderWare, un motor comercial. Lo que lo hizo grande fue lo que se construyó encima:
- sistemas que mantienen viva la ciudad;
- herramientas para producir contenido en serie;
- un equipo grande durante unos dos años.

El PS2 tenía 32 MB de memoria y un procesador de 300 MHz; el Nintendo DS de Chinatown Wars, 4 MB. **El límite de Motor City no es la máquina: es el contenido, la sensación al jugar y las herramientas.**

| Sistema | San Andreas / Chinatown Wars | Motor City 5.0 | Falta |
|---|---|---|---|
| Luz, cielo y clima | Una tabla de colores por hora y clima | ✅ Con luz física y sombras desde la 4.9 | — |
| **Física de vehículos** | Cuerpo rígido, 4 ruedas, hoja de manejo de unos 30 números | ✅ **5.0: `MC.Dinamica`** (ver § 3) | Motos inclinadas, carros que se vuelcan y deformación |
| Gente y tráfico | Por zona y hora, y reaccionan | Tráfico en calles reales con semáforos y rutinas. ✅ 5.0: el tráfico recibe el golpe | Eventos y reacciones, escenas de la calle, frases, despacho de servicios |
| Misiones | Un lenguaje de guion con hilos | Pasos lineales e historias cortas | Lenguaje de misiones, editor y bot que las gane |
| Policía | Estrellas, retenes, helicóptero | Calor de 0 a 100 y persecución | Tácticas: rodear, retenes, helicóptero con reflector y zona de búsqueda |
| Mundo grande | Carga por distancia desde el disco | Todo en memoria (HTML de 28 MB) | Carga por sector en hilos aparte y mallas pre-cocinadas |
| Animación | Esqueletos con mezcla | Poses | Mezcla, subirse al carro, pies en el terreno |
| Sonido | Emisoras, voces, motor por carro | ✅ 5.0: el motor según las rpm | Emisoras propias, voces cortas |

## 2. Los motores e ideas que se toman (sala limpia: la idea sí, el código no)

| De dónde | La idea | Dónde entra | A quién le toca |
|---|---|---|---|
| Juegos de mundo abierto de los 2000 | Hoja de manejo por vehículo | `js/37-dinamica.js` | ✅ Claude, 5.0 |
| Burnout Paradise | Arrancar retos desde cualquier semáforo real | `juegos/getaway/` | Gemini (G5‑06) |
| Forza Horizon | Rivales que manejan como la gente (grabaciones) | `js/92-publico.js` y Modos | ChatGPT (C5‑07) |
| Trackmania | Repeticiones exactas (se graban las entradas) y fantasmas | Motor | Claude (fase 4) |
| GTA V | Escenas de la calle: gente sentada en bancas, esperando el bus o en la tienda | `js/25-ia.js` y `27-mobiliario` | Claude (fase 2) |
| Left 4 Dead 2 | Frases con condiciones (reglas de respuesta) | Motor (Claude) y textos (Gemini) | Claude + Gemini (G5‑03) |
| F.E.A.R. | Policía que planea: rodear, cerrar el paso y retenes | `js/28-persecucion.js` | ChatGPT (C5‑05) |
| Hitman | Multitudes: las cercanas piensan y las lejanas casi no | `js/25-ia.js` | ChatGPT (C5‑06) |
| Unreal 5, *The Matrix Awakens* | Miles de agentes en arreglos de números | Tráfico y gente | ChatGPT (C5‑06) |
| Spider-Man (Insomniac) | Cuartos falsos detrás de las ventanas de noche | `js/45-tres.js` | ChatGPT (R8) |
| Microsoft Flight Simulator 2020 | Edificios desde huellas con estilo por región | `ciudades/*.json` y fachadas | ChatGPT (R1+) |
| Euro Truck Simulator 2 | Encoger las carreteras y no las ciudades | `MC.Planeta` | Gemini (G5‑09, informe) |
| Overgrowth | Animación con pocas poses, resortes y física | `js/30-personaje.js` y `45-glb` | ChatGPT (C‑M33) |
| GTA IV | Muñecos que intentan no caerse (tropiezo cómico) | Peatones | ChatGPT (C5‑08) |
| Zelda: Breath of the Wild | Química del mundo: lluvia, fuego, viento | `js/02-ciencia.js` (MC.Quim) | Gemini (G5‑08) |
| Assassin's Creed | Trepar fachadas (la altura de cada edificio se conoce) | Turno Cero a pie | ChatGPT (C5‑09) |
| Ghost of Tsushima | Una guía sin flecha (hojas, palomas) | 🎬 Modo cine | Gemini (G5‑05) |
| Chinatown Wars | Cámara inclinada que gira con el carro, contorno negro y minijuegos táctiles | Vista «Historieta» y minijuegos | Gemini (G5‑01 y G5‑04) |

**Lo que no se copia:**
- el sistema Némesis de *Sombras de Mordor*, que está patentado (Warner Bros., 2021);
- nombres, personajes, mapas o el aspecto de cualquier juego;
- código de otros motores.

## 3. Lo hecho en la 5.0 (Claude): fase 1, «que se sienta»

`js/37-dinamica.js` · `MC.Dinamica` · prueba `pruebas/dinamica.mjs`, con 19 comprobaciones contra números conocidos.
- **Hoja de manejo** por vehículo: masa, batalla, reparto de peso, altura del centro de masa, μ, rigidez de las llantas, tracción, kW, N·m, rpm, marchas, frenos, dirección y suspensión. Sale de la ficha del taller; los carros de Turno Cero ya traen kW, N·m, Cd y área reales.
- **Ejes con carga que cambia:** al frenar, la trompa se hunde y la cola se aligera.
- **Llantas que se saturan:** curva tipo «fórmula mágica» y círculo de fricción.
  - Subviraje de fábrica: en una curva muy rápida se va de largo de trompa, no hace trompo.
  - El freno de mano suelta la cola.
  - La potencia de sobra hace patinar las ruedas al arrancar.
- **Motor y marchas automáticas** con corte de rpm y freno de motor. El tono del motor sale de las rpm: f = rpm/60 × cilindros/2.
- **Carrocería con resortes:** cabeceo, alabeo y rebote, dibujados en el 3D clásico y en el realista.
- **Choques con impulso:**
  - contra las paredes rebota según el ángulo y gira si el golpe es de lado;
  - contra el tráfico reparte el golpe por masas: el otro carro sale corrido y girando, se detiene y vuelve despacio a su carril.
- **Ayudas para celular:**
  - con el joystick que apunta en el mundo, un control de estabilidad pide el giro que el agarre permite;
  - la velocidad baja si el dedo apunta de lado, como en el arcade;
  - reversa corta si queda trancado de trompa;
  - ayuda de esquinas al rozar.
- **⚙️ Flexibilidad → 🛞 Manejo de los carros:** real (lo de fábrica en Turno Cero) o arcade. La IA sigue en arcade.
- **Medidas de la prueba con el sedán Vega S4:**
  - de 0 a 100 km/h en 6,6 s;
  - de 100 a 0 en 41,1 m, contra 41,4 m que da la fórmula;
  - curva sostenida a 1,3 g;
  - en piso mojado, la mitad del agarre lateral;
  - la carrera de la prueba humana avanza 425 m a 30 m/s sin salirse.

## 4. Las fases que siguen

| Fase | Qué | Quién |
|---|---|---|
| **1 · Que se sienta** | ✅ Dinámica real y sonido por rpm; ✅ motos y bicis que se inclinan (Claude, 5.2); ✅ vuelcos con auto‑enderezado (ChatGPT, 5.3; Claude los corrigió). Falta: deformación fuerte | Claude y ChatGPT |
| **2 · Ciudad viva** | ✅ 5.2 (`MC.CiudadViva`): eventos que la gente oye y a los que reacciona (mira, huye, llama, ayuda); escenas en las bancas y paraderos reales; frases con condiciones (G5‑03, las escribió Claude); en Turno Cero, el testigo sube la búsqueda y llegan la ambulancia o los bomberos por la ruta real. Falta: escenas en tiendas, densidad por comuna y hora, y multitudes | Claude (hecho); ChatGPT (multitudes, C5‑06) |
| **3 · Mundo grande sin tirones** | R6‑b (ChatGPT, 5.3): Worker con cajas LOD2, **apagado** (`?r6b`) porque no mejoró y rearmaba regiones. Falta: medir en el celular real y, si sirve, LOD sin juntar edificios (1:1) y normales en el Worker | ChatGPT (R6 y C5‑04) |
| **4 · Contenido en serie** | Lenguaje de misiones con hilos, fallas y reintentos; modo creador para poner retos en el mapa y compartirlos por enlace o QR; repeticiones exactas y un bot que gana cada misión | Claude (lenguaje y repeticiones); Gemini (interfaz del creador); ChatGPT (misiones en serie) |
| **5 · Estilo Chinatown Wars** | ✅ Historieta (Gemini, 5.0–5.3) y ✅ minijuegos táctiles (Gemini, 5.3), con el de puentear dentro del robo de carros (Claude) | Gemini |
| **Barrio a nivel GTA** | ✅ 5.3: fichas de 30 sitios (Gemini, G5‑07) y su primera versión en el 3D realista (Claude, `MC.Sitios`). Falta: modelos más finos (C5‑02 de ChatGPT), gente con escenas en cada sitio y cinco misiones pulidas en el Centro | Todos |

## 5. Reglas (las de siempre)
- Un solo HTML sin internet ni librerías nuevas; three.js ya está aprobado.
- Español de Colombia. Turno Cero es 18+; EnCicla, El Metro y Run son de familia y van sin violencia.
- No romper los guardados.
- Sala limpia.
- Las fotos de la ciudad son solo para mirar; nunca se montan en el juego ni se calcan con programas.
- Pruebas en verde antes de subir.
- Cada IA trabaja en su rama `ia/<ia>/<tema>`. Claude une y publica.
