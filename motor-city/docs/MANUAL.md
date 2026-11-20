# Manual de Motor City 2.9

> **Para todas las IAs:** el documento único `docs/DOCUMENTO-UNICO.md` tiene el contexto, el código exacto y el plan de cada una.

Este manual explica para qué sirve el motor, qué contiene, cómo se usa, cómo sacarle el máximo provecho y qué hacer si falta algo.

> **Para quién:** el autor, las IAs de cada juego y cualquier persona que llegue.
> **Lo técnico al detalle:** `MOTOR.md`.

## 1. Para qué sirve
Motor City convierte **cualquier lugar real** (un país, una ciudad, un pueblo o una cuadra) o **uno inventado** (un valle, una isla o un planeta entero) en un **mundo jugable con leyes reales**. Encima, cada juego pone su piel, su trama y sus mecánicas.

Sirve para:
- **juegos**: los cuatro que vienen y los que se le ocurran;
- **simuladores**: movilidad, educación vial, riesgo y urbanismo;
- **experiencias educativas**: física, química, biología y economía jugables;
- **turismo**: pueblos jugables.

Funciona en **un solo HTML**, sin internet y en cualquier celular.

## 2. Qué contiene (el mapa del motor)
| Para… | Módulo | Lo principal |
|---|---|---|
| **Números reales** | `MC.Ciencia`, `MC.Fis`, `MC.Quim`, `MC.Termo` | Unidades SI, ruido, integradores, atmósfera, arrastre, química con balanceo exacto, calor. |
| **Plata que cuadra** | `MC.Dinero`, `MC.Libro`, `MC.Mercado`, `MC.Finanzas` | Centavos enteros, partida doble, oferta y demanda, préstamos, VPN y TIR. |
| **Tamaños proporcionados** | `MC.Escala` | Medidas reales de gente, puertas, calles y vehículos; `validar()`. |
| **Fluidez en cualquier aparato** | `MC.GPU`, `MC.ResDinamica`, `MC.Bucle`, `MC.resorte` | Nivel del aparato, resolución dinámica, paso fijo y resortes. |
| **El mundo** | `MC.Mundo`, `MC.Generador`, `MC.Cosmos` | Mundos reales (MC4), inventados por semilla o planetas enteros. |
| **Caminos** | `mundo.red()`, `MC.Trazo`, `MC.Recorrido`, `MC.SeguirRuta` | A*, recorridos y seguir la vía. |
| **Mundo vivo** | `MC.Reloj`, `MC.Calendario`, `MC.Cielo`, `MC.Clima`, `MC.ClimaGlobal`, `MC.Ambiente`, `MC.Trafico`, `MC.Transporte`, `MC.IA`, `MC.Poblacion` | Hora, festivos, sol y luna, clima con estaciones y nieve, tráfico, metro con horario, gente con rutinas. |
| **Cuerpos y máquinas** | `MC.Personaje`, `MC.Vehiculos`, `MC.Cuerpo`, `MC.Taller`, `MC.Seres` | Personaje único, 35 vehículos, física con puentes, taller de ingeniería, biología. |
| **Controles** | `MC.Controles`, `MC.Manejo` | Teclado, dedo y mando; curvas, esquemas y asistencias. |
| **Cámara y vistas** | `MC.Camara`, `MC.Vistas`, `MC.Vista2D`, `MC.Raster`, `MC.Losas` | 9 vistas más pixel, 3D por software y resortes. |
| **Estilos gráficos (2.7)** | `MC.Estilo` | Cómic, manga, anime, novela gráfica, ukiyo-e y acuarela, con tinta, tramas y paletas de obras de dominio público. |
| **Peso y vida (2.7–2.8)** | `MC.Vida`, `MC.opciones` | Aterrizajes con aplastamiento, hitstop, bandadas, hojas, polvo, salpicaduras y viento; palomas que alzan vuelo y huellas en el suelo blando; faros y luces de freno. La sacudida y las partículas se pueden bajar (accesibilidad). |
| **Medir y contratos (2.8)** | `MC.Telemetria`, `MC.Contratos` | Fps y tiempos de cuadro en percentiles; datos versionados con sus esquemas (`schemas/`). |
| **Motores potentes (2.7)** | `MC.Exportar`, `MC.Puente` | El mundo en glTF y el estado vivo para Godot, Unity, Unreal, Blender o three.js (`docs/MOTORES-POTENTES.md`). |
| **Estilo realista (2.6)** | `MC.estilo`, `MC.Arboleda`, `MC.Rudeza` | Árboles de pie con volumen; asfalto, andenes, pasto, techos y muros con desgaste. Familiar, pero sin caricatura. `MC.estilo = 'clasico'` para el plano. |
| **Arte** | `MC.arte`, `MC.Sprites`, `MC.Pincel`, `MC.Pieles` | Pieles por juego, atlas, animaciones y respaldo procedural. **Paquetes de arte** de las IAs (`arte/gemini/`) instalados en una línea (2.5.1). |
| **Adentro** | `MC.Interiores`, `MC.Hogar`, `MC.Direccion` | Interiores con estilos, **tu casa desde tu dirección** y diseño. |
| **A dónde ir** | `MC.Lugares`, `MC.Desgaste` | Talleres, tiendas, restaurantes, bibliotecas y parques; reparar y mejorar. |
| **Qué pasa** | `MC.Mision`, `MC.Inventario`, `MC.Carrera`, `MC.Logros`, `MC.Dialogo`, `MC.Historias`, `MC.Director`, `MC.Ocurrencias` | Misiones, carreras, historias con pilares, ritmo y lo imprevisto. |
| **Pantalla y sonido** | `MC.UI`, `MC.Musica`, `MC.Paisaje` | Interfaz con zonas y atenuación; **joystick visible**, **botones de acción** y **flecha al objetivo** (2.5.1); música procedural y clásicos; sonido ambiente del lugar. |
| **Terreno y agua (2.4–2.5)** | `MC.Terreno`, `MC.Naturaleza`, `cuerpo.bajarse`, `montar`, `embarcar` y `desembarcar` | Agua por tipo y profundidad; entrar al agua dejando el vehículo en la orilla; nadar y bucear con aire; lancha. Pendientes, roca, monte, arena y nieve; quién pasa por dónde y por qué. |
| **Ciudad (2.3)** | `MC.Urbe`, `MC.Sombras`, `MC.Mobiliario`, `MC.Ondas`, `MC.Autotile`, `MC.RejillaIrregular`, `MC.Necesidades`, `MC.Habitante` | Zonas, demanda, valor del suelo y capas de datos; sombras del sol; postes, árboles y cebras; fachadas por reglas; casas habitadas. |

## 3. Cómo se usa (cinco recetas)
**a) Jugar o mostrar.** Abre <https://juanfeliperico369-stack.github.io/motorcity/> en el celular. El minijuego **Mandados** se juega así:
- **moverse:** arrastra en cualquier parte de la mitad izquierda; el joystick aparece donde pongas el dedo. En computador, flechas o WASD;
- **acciones:** ⤒ saltar y ⚡ turbo, abajo a la derecha. En el agua o en el aire aparecen 🔽 bajar y 🔼 subir;
- **a dónde ir:** la flecha amarilla con los metros. El mapa pequeño muestra el punto;
- **todo es gratis** en el **modo libre**, que viene prendido. Se cambia en ⚙️ Ajustes, donde también están «Cómo se juega» (opcional; también en la portada), la sacudida de cámara, las partículas, la calidad, la telemetría, los controles y el rescate;
- **🗺️ Vista** cambia la cámara (cenital, 3D, maqueta, lateral…), el pixel y el estilo (realista, clásico, cómic, manga, anime, novela gráfica, ukiyo-e, acuarela, vintage, CRT o térmico); **🚲 Vehículo** abre el garaje con los 34 vehículos.

**b) Un juego nuevo con una IA.** Dile a la IA:
> «Lee `AGENTS.md` del repositorio motorcity y haz un juego de [idea] sobre el mundo [guatape|medellin|generado]».

La IA corre `node motor.mjs nuevo juego nombre --mundo guatape` y usa la skill `motor-city-juegos`. El juego queda en `juegos/nombre/` y se compila a `dist/juegos/nombre.html`.

**c) Un lugar real nuevo:**
1. Busca en cualquier mapa el rectángulo de longitud y latitud del lugar.
2. Corre:
   ```bash
   python3 geo/territorio.py --id mi-pueblo --nombre "Mi pueblo" --bbox=lon0,latS,lon1,latN
   ```
3. Cambia `"mundo": "mi-pueblo"` en el `juego.json` y vuelve a construir.

**d) Un mundo inventado o un planeta:**
```js
const mundo = MC.Generador.mundo({ semilla: 42, tipo: 'isla' });   // isla, valle, costa, montaña, llanura
const estrella = MC.Cosmos.estrella(1, 0, 7), planeta = MC.Cosmos.planeta(estrella, 2);
const mundo2 = MC.Generador.mundo(MC.Cosmos.mundoDe(planeta));          // el planeta, jugable
```

**e) El ciclo de un juego** (lo mínimo):
```js
const M = await MC.Mundo.cargar(MC_MUNDO, MC_CIUDAD), vistas = new MC.Vistas(M), camara = new MC.Camara({ mundo: M });
const cuerpo = new MC.Cuerpo(M, { x, y, veh: 'bici' }), ctl = new MC.Controles(lienzo), ui = MC.UI.crear(document.body);
new MC.Bucle({
  actualizar: dt => { cuerpo.actualizar(dt, MC.Manejo.aplicar(ctl.leer(), cuerpo, { camara })); camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v, zPaso: cuerpo.zPaso }); },
  dibujar: () => vistas.dibujar(g, W, H, { mundo: M, camara, jugador: { cuerpo, aspecto }, t: performance.now() / 1000 })
}).iniciar();
```

## 4. Cómo sacarle el máximo provecho
- **Usa lo real.** Un juego en el lugar donde vive el jugador engancha más que cualquier mundo genérico. Con `MC.Hogar.desdeDireccion` el jugador juega desde **su casa**. Esto pasa sin internet y sin que la dirección salga del celular.
- **Arma, no programes.** Combina piezas: misión + lugares + historias + clima. Ejemplo: «en temporada de lluvias, una tienda pide un domicilio urgente y la lección es la frenada mojada».
- **Deja que el mundo cuente.** Hora, clima, gente con rutinas, atardeceres y storylets de reflexión: la trama sale del mundo, no de textos largos.
- **Tres pilares en cada juego:** algo **divertido** cada minuto, algo para **pensar** de vez en cuando y algo **real que se aprende** cuando sirve. `MC.Historias` los equilibra solo.
- **Que nunca estorbe:**
  - el centro de la pantalla es del juego;
  - un aviso a la vez;
  - botones donde llega el pulgar.

  `MC.UI.verificar` lo comprueba.
- **Que se sienta bien en las manos:**
  - curvas de respuesta por vehículo;
  - giro según la velocidad;
  - tiempo de coyote;
  - cámara con resortes.

  Todo viene puesto; ajústalo con `MC.Manejo.PERFIL`.
- **Mide antes de optimizar:** `vistas.ms`, `MC.GPU.perfil()` y `node motor.mjs prueba --navegador`. Ver `docs/OPTIMIZACION.md`.
- **Aprende de los jugadores.** `MC.Ocurrencias.exportar()` dice dónde se atascan y qué hacen que nadie esperaba. Sin datos personales.

## 5. Qué hacer si falta algo
1. **Mira si ya existe:** busca en este manual, en `MOTOR.md` y en `js/` (cada archivo empieza con lo que hace).
2. **Si es de un solo juego**, va en el juego (su `juego.js`), no en el motor.
3. **Si otros juegos lo pueden usar**, pídeselo a una IA así:
   > «Lee `CONTRIBUIR.md` y la skill `motor-city-desarrollo`, crea el módulo con `node motor.mjs nuevo modulo nombre`, con sus pruebas, y deja un reporte con `node motor.mjs reporte`».
4. **Si es arte**, pídelo a Gemini o ChatGPT con las reglas del documento único (§10): un solo documento, sprites en atlas con fondo magenta o transparente, y medidas en metros. Cuando llega, va a `arte/<ia>/` y se instala con `MC.Pieles.instalar`.
5. **Si es un dato real** (un precio, una cifra científica), va con su **fuente** en el código y su **prueba** con el valor conocido (skill `motor-city-ciencia`).
6. **Si algo falla en el celular**, anota el modelo y lo que pasó. Con `MC.Ocurrencias.exportar()` y `MC.GPU.perfil()` la IA del motor lo reproduce.

## 6. Comandos
| Comando | Qué hace |
|---|---|
| `node motor.mjs construir` | Arma el motor, los mundos y los juegos (`dist/`). |
| `node motor.mjs prueba --navegador` | Corre las 134 pruebas, también en Chromium. |
| `node motor.mjs exportar ID [--centro x,y --lado m]` | El mundo en glTF 2.0, alturas RAW 16 y escena JSON (Godot, Unity, Unreal, Blender, three.js). |
| `node motor.mjs capturas [--web]` | 14 fotos estándar de Mandados en `dist/capturas/` (revisión visual). |
| `node motor.mjs revisar-arte arte/ID` | Revisa un paquete de arte contra las reglas. |
| `node motor.mjs documento` | Arma `dist/MOTOR-CITY-TODO.md` (el documento único con anexos). |
| `node motor.mjs nuevo juego\|modulo nombre` | Crea un juego o un módulo desde su plantilla. |
| `node motor.mjs reporte "título" --juego X` | Deja el reporte de un cambio hecho desde otro juego. |
| `node motor.mjs sincronizar ../Juego` | Copia el motor a `Juego/motor-city/`. |
| `python3 geo/territorio.py …` | Craquea un lugar real. |
