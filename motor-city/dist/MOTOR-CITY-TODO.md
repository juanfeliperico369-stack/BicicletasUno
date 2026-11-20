<!-- Generado por node motor.mjs documento · Motor City 2.10.0 · no se edita a mano: edita los documentos de origen -->

# MOTOR CITY · Documento único

> **Para el autor (OneZero) y para todas las IAs:** Gemini (Antigravity y Nano Banana), ChatGPT (Codex), Claude y las IAs de Juega EnCicla, El Metro y Run Scooter.
>
> **Cada IA lee TODO este documento** para tener el contexto completo. Después hace **solo su parte** (§9) y entrega **un solo documento** (§11).
>
> | | |
> |---|---|
> | Versión | **Motor City 2.10.0** · 20‑nov‑2026 |
> | Repositorio | `juanfeliperico369-stack/motorcity` (rama `claude/motor-city-engine-xu7p4y`; la web sale de `main`) |
> | Web | <https://juanfeliperico369-stack.github.io/motorcity/> |
> | Minijuego | <https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html> |
> | **¿Está todo lo pedido?** | `docs/PEDIDOS.md`: cada pedido del autor, su estado y el archivo donde quedó |
> | **«Mira el repositorio y haz tu parte»** | `TAREAS-IA.md`: la lista corta de cada IA, en orden |

## Índice
1. Qué es Motor City
2. Lo que pasó (todas las sesiones)
3. Estado actual
4. Cómo está hecho (capas y módulos)
5. **El código a usar** (recetas exactas)
6. Lo aprendido de las referencias y dónde quedó
7. Reglas para todas las IAs
8. Cómo probar y publicar
9. **Plan de cada IA** (con las peticiones nuevas)
10. Peticiones de arte y de código, en detalle
11. Cómo entregar
12. Lo que necesita el autor
13. Fuentes

## 1. Qué es Motor City
**Un motor de videojuegos de mundo abierto que convierte cualquier lugar real (o inventado) en un mundo jugable con leyes reales.**
- Las leyes son de física, química, biología, clima, economía, tráfico, transporte y ciudad.
- Funciona en **un solo HTML**, sin internet ni librerías, en cualquier celular.

**Lo usan:**
- **Juega EnCicla** (`BicicletasUno`) y **El Metro** (`MetroZero`);
- **Run Scooter** (`RunRunZero`) corre dentro de ellos como «Run en la ciclovía»;
- los juegos que vienen: ***Motor City*** (carreras de mundo abierto, al estilo GTA, Forza y Need for Speed) y ***Extremo*** (deportes extremos).

**La visión del autor:** que el motor sirva para:
- crear gráficos;
- **craquear territorios** (países, ciudades, pueblos y lugares) y crear mundos nuevos;
- guardar funciones, mecánicas y jugabilidad;
- tener física, química, economía y matemáticas **fieles a la realidad**;
- personajes con biología real;
- vehículos, animales y criaturas;
- un mundo vivo;
- interiores únicos;
- música e interfaces que **no estorban**;
- historias con **diversión, reflexión y conciencia**;
- y ahora, **cómo crean ciudades SimCity, Los Sims, Cities: Skylines y Townscaper**.

## 2. Lo que pasó
| Sesión | Pedido del autor | Lo que se hizo |
|---|---|---|
| **2.0** | Un solo motor de mundo abierto según el *Plan del Mundo Abierto*, en el repo nuevo `motorcity` | El mundo de Medellín en un solo archivo MC4: 639.457 edificios, 35.746 calles, metro, cables, Metroplús y EnCicla. Personaje, 35 vehículos, física, controles y cámara. 8 vistas más pixel, panorámica de perfil y WebGL. Reloj, festivos, cielo, clima, tráfico y transporte con horario. Run en la ciclovía. Banco de pruebas y 54 pruebas. Sincronización a los juegos. |
| **2.1** | Craquear territorios; física, química y economía reales; mundos nuevos; biología; vehículos y animales; interfaz; música; mundo vivo; interiores; nombre solo «Motor City»; repo abierto a las IAs | `geo/territorio.py` (Guatapé en 20 s). `MC.Generador`. Ciencia, química y economía con pruebas. Clima global con estaciones y nieve. Seres (persona, genética, animales y criaturas). Taller de vehículos. IA y población con rutinas. Interiores. Música procedural y clásicos de dominio público. Interfaz y mecánicas. Minijuego **Mandados**. Plantillas, skills, `CONTRIBUIR.md` y reportes. 80 pruebas. |
| **2.2** | Solución a la tarjeta gráfica; puentes y cámara; vistas de lado (FEZ, Little Nightmares, Monument Valley); sprites; interfaz con psicología; los mejores motores; historia con 3 pilares; ocurrencias; manual; optimización; controles; **casa del jugador por su dirección**; talleres y tiendas; No Man's Sky; proporciones | GPU virtual y 3D por software (`MC.Raster`). Física por superficies. Cámara con resortes. **Vista lateral.** `MC.Manejo` con 7 esquemas. `MC.Sprites`. `MC.Escala`. Interfaz por zonas. **Mi casa** (`MC.Direccion` + `MC.Hogar`, 8 estilos y 22 muebles). `MC.Lugares` y `MC.Desgaste`. `MC.Historias` con director. `MC.Ocurrencias`. `MC.Cosmos`. Web en GitHub Pages. 103 pruebas. |
| **2.3** | Estudiar **SimCity, Los Sims, Cities: Skylines y Townscaper**: cómo crean entornos, ambientes, sombras y detalles de ciudad. Un **documento único** con todo y el código a usar | **Sombras del sol** por hora en todas las vistas. **Mobiliario urbano** y luces de noche. **Fachadas por reglas** (WFC). **`MC.Urbe`**: zonas, demanda RCI, valor del suelo, servicios, contaminación, crecimiento, niveles, recursos, presupuesto y **capas de datos**. **Objetos inteligentes** y necesidades (`MC.Habitante`). **`MC.Ondas`**, `MC.Autotile` y `MC.RejillaIrregular`. **`MC.Paisaje`** (sonido ambiente). Mandados con **modo alcalde** y casa habitada. 109 pruebas. Este documento. |
| **2.4** | Montañas, rocas y tipos de terreno; agua en **lagos, ríos, playa y mar**; **límites de paso verosímiles** («el personaje pasa por encima de cosas que no debería») | **`MC.Terreno`**: agua por tipo y profundidad; material y pendiente; **reglas de paso** por vehículo con su motivo (vadear, nadar, barrancos, roca, monte, arena, nieve, borde del mundo); **obstáculos reales** (emblemáticos, árboles de las losas, postes, bancas, rocas, tráfico y gente). **`MC.Naturaleza`**: rocas, palmas, frailejones, arbustos y juncos. **Lagos** en los mundos generados (llenado por prioridad) y mar a nivel 0. **Agua y roca en las losas**: color por profundidad, espuma en la orilla y roca en las laderas empinadas. Brillos del agua. El personaje se ve vadeando o nadando. 115 pruebas. |
| **2.5** | «Añade la capacidad de poder entrar en el agua» | **Entrar al agua de verdad:**<ul><li>con un vehículo, al empujar hacia el agua honda (o con «🏊 Al agua») uno se baja, el vehículo queda **parqueado en la orilla** y se entra nadando;</li><li>se **bucea** («🤿», o Z/Ctrl) con **aire limitado** (~35 s); sin aire se sube sola;</li><li>el cuerpo tiene pose de **nado** (crol) y de **buceo** (rana);</li><li>bajo el agua todo se tiñe de azul, con rayos de luz y burbujas;</li><li>se sale por la orilla y se **vuelve a subir** al vehículo;</li><li>**lancha**: embarcar en el agua honda más cercana y «⚓ A tierra» (queda amarrada).</li></ul>117 pruebas. |
| **2.5.1** | «El minijuego es injugable: no hay controles de verdad, no se puede mover nada; hay que pagar cosas. Mejóralo con lo nuevo. ¿Ya están todos los pedidos?» | **Lo que pasaba:** el personaje sí se movía, pero la cámara estaba tan lejos que medía 3 píxeles y el joystick no se veía. **Lo que se hizo:**<ul><li>**cámara cerca**: unos 45 m en el lado corto de la pantalla;</li><li>**marca del jugador** (anillo y flecha);</li><li>**joystick visible** con guía, y **botones de acción** para el pulgar: ⤒ saltar, ⚡ turbo, y 🔽 🔼 en el agua o en el aire;</li><li>**flecha al objetivo** con la distancia, siempre en la zona libre;</li><li>**tutorial** al empezar;</li><li>**modo libre** por defecto: todo gratis, con los 34 vehículos (pie, bici, moto, carro, bus, avión y lancha);</li><li>menús **Vista** y **Ajustes**;</li><li>el **primer mandado cerca**;</li><li>en computador, flechas o WASD;</li><li>la lista **`docs/PEDIDOS.md`**.</li></ul>**Llegó la entrega de Gemini** (G‑M0…G‑M15) y quedó integrada:<ul><li>`arte/gemini/` y **`MC.Pieles`**, con respaldo procedural en cada gancho;</li><li>en Mandados se usan árboles del trópico, props, rocas, fachadas y muebles, y el selector 🎨 Arte;</li><li>también se corrigió lo válido de su auditoría.</li></ul>118 pruebas, con una nueva que juega en un celular táctil. |
| **2.6** | «Haz una revolución para que los gráficos sean más realistas: desde la vista cenital los árboles se ven como tapetes en el suelo. Deja el estilo *family friendly*, pero con más realismo, rudeza y crudeza. Los tutoriales deben ser opcionales. Copia todos los pedidos en los repositorios. Gemini con Antigravity pasa a *hydrogen*: déjale lo fácil. ChatGPT con Codex sigue con *astra*: encárgale lo mejor; GPT genera mejores imágenes.» | **Estilo realista familiar** (`MC.estilo = 'realista'`; el clásico sigue disponible):<ul><li>**`MC.Arboleda`**: los árboles se levantan en la maqueta, la oblicua y la lateral (tronco, ramas, copa con luz y sombra según el sol). Desde arriba tienen volumen. Hay 6 especies del trópico: guayacanes florecidos, ceiba, mango, urapán y monte. Son los mismos con que se choca;</li><li>**`Rudeza`**, horneada en las losas:<ul><li>asfalto con parches, grietas, manchas de aceite y alcantarillas;</li><li>andén de baldosa con bordillo;</li><li>pasto con parches secos;</li><li>tejas de barro en hileras y planchas con humedad;</li><li>grano;</li><li>paleta menos saturada;</li></ul></li><li>los muros con la base sucia y sombra bajo el alero;</li><li>el **tutorial es opcional** (en la portada y en Ajustes);</li><li>el gancho de arte `arbol`;</li><li>`node motor.mjs capturas` y `node motor.mjs revisar-arte`;</li><li>**`TAREAS-IA.md`** en los cuatro repositorios, con el reparto nuevo.</li></ul>119 pruebas. La maqueta de Medellín queda por debajo de 40 ms con la CPU 4× más lenta. |
| **2.7** | «Necesito peso y vida en el motor, y que se pueda adaptar a motores más potentes. Estéticas de cómic, manga, anime y novela gráfica. Investiga y aprende de las mejores obras visuales, inspírate en ellas, y recopila y adapta arte de verdad.» Y 14 reels de referencia. | **Estilos gráficos** (`MC.Estilo`, `js/16-estilos.js`). Son 8: realista, clásico, **cómic** (tinta, semitono y onomatopeyas), **manga** (grises, tramado y líneas de velocidad), **anime** (*cel* y cielos de Shinkai), **novela gráfica** (noir: tres tonos y un rojo de acento), **ukiyo-e** y **acuarela**. Cada uno tiene su mapa de color, su tinta, su trama, su sombra, sus árboles y su cielo. Las paletas salen de **obras de dominio público** (Hokusai, Hiroshige, Doré, Winslow Homer, la Comisión Corográfica…; `arte/dominio-publico/`).<br>**Peso y vida** (`MC.Vida`):<ul><li>aterrizaje con aplastamiento, sacudida y polvo;</li><li>cabeceo del vehículo al acelerar y al frenar;</li><li>**hitstop** en los choques;</li><li>bandadas con su sombra, hojas que caen y salpicaduras;</li><li>el viento mece las copas.</li></ul>**Motores potentes** (`MC.Exportar`, `MC.Puente`): el mundo en **glTF 2.0** (validador de Khronos: 0 errores; abierto en three.js), alturas RAW 16 y escena JSON para Godot, Unity, Unreal y Blender; y el estado vivo para otro motor.<br>**Investigación:** `docs/INSPIRACION-VISUAL.md` y `docs/MOTORES-POTENTES.md`.<br>123 pruebas. |
| **2.8** | La **entrega maestra de referencias** (los 14 reels, videos y el análisis de ChatGPT y de Gemini: 25 fichas, peso, vida, arquitectura y rendimiento) y «prepara todo». | La entrega quedó en `docs/referencias/` y su resumen en `docs/INSPIRACION-VISUAL.md` §1. Al motor se sumó:<ul><li>**palomas que alzan vuelo** cuando el jugador se acerca (R12);</li><li>**huellas** de llantas y pisadas en arena, tierra, nieve y barro, que con lluvia salen en el pasto (R12 y R19);</li><li>**faros y luces de freno** del jugador (R13 y R19);</li><li>los estilos **vintage**, **CRT** y **visión térmica** (R17 y R22), para 11 en total;</li><li>**accesibilidad**: sacudida y partículas ajustables (§10.3);</li><li>**telemetría en percentiles** (p95 y p99) y **calidad baja, media o alta** en Ajustes (§13 y §14);</li><li>**contratos versionados** (`schemas/` y `MC.Contratos`, §12.3);</li><li>el hitstop también en Mandados.</li></ul>Lo demás quedó repartido: C‑M20, C‑M21, C‑M22, C‑A10, C‑A11, G‑H7 y G‑H9. 125 pruebas. |
| **2.9** | Llegaron, en paralelo, las entregas de **Gemini** (G‑H1…G‑H8) y de **ChatGPT y Codex** (2.7.1: arte C‑A, C‑M1, C‑M13, C‑M15…C‑M19). | Todo quedó unido en la rama:<ul><li>los **6 atlas de ChatGPT** (676 cuadros; Vista → Arte → ChatGPT);</li><li>el agua precalculada en los MC4;</li><li>el gancho `textura` y los charcos con lluvia;</li><li>el estilo de **1 bit**;</li><li>la caché de fachadas (la maqueta de Medellín baja a **22 ms** con la CPU 4×);</li><li>los adaptadores de **Godot y three.js** probados;</li><li>los hallazgos de Gemini, corregidos;</li><li>las paletas de las obras colombianas.</li></ul>Son 12 estilos. 132 pruebas. |
| **2.10** (esta) | «Retoma y continúa: une todo, mejora y optimiza todo, y añade peticiones para Gemini y ChatGPT». Llegaron 11 enlaces, y después «añade las skills y plugins de los videos y sigue desarrollando». | <ul><li>Se unieron las ramas de El Metro (Motor del Valle 1.2.0) y de EnCicla (alto contraste y metro sin casas debajo).</li><li>El cómic y el 1 bit ya no leen la pantalla y no hacen muaré.</li><li>Mandados bajó de 8,2 a 5,1 MB.</li><li>Las rutas van por la calle (`rutaA`).</li><li>Skills de los videos: **Hallmark, Modern Web Guidance, find-skills y HyperFrames** (`skills-externas.json`, `node motor.mjs skills`, plugins en `.claude/settings.json`).</li><li>El **público simulado** (`MC.Publico`, `node motor.mjs publico`).</li><li>Pedidos G‑H10…G‑H13, C‑M23…C‑M25 y C‑A12.</li></ul> |

## 3. Estado actual
| | |
|---|---|
| **Pruebas** | **134 en verde** (`node motor.mjs prueba --navegador`), en Node y en Chromium. Incluyen el público simulado y las rutas por la calle (2.10). Una juega Mandados en un celular táctil y otra recorre los 11 estilos. |
| **Medido**<br>(Chromium, CPU 4× más lenta, 412 × 860; mediana del dibujo con sombras y mobiliario) | cenital 8–10 ms · ciudad 3D ~15 ms · maqueta ~27 ms · lateral 14–20 ms · panorámica ~9–12 ms. La 3D por software va en 15–25 ms, contra 70–90 ms del WebGL por software. |
| **Mundos** | Medellín (MC4, 6 MB); Guatapé craqueado (0,2 MB, 195 lugares jugables); mundos generados por semilla; planetas. |
| **Juegos** | EnCicla y El Metro tienen el motor en `motor-city/`; su `motor-valle/` quedó como estaba y siguen en verde. Run Scooter, sin cambios. |
| **Lo que falta medir** | Un **celular real** de gama media. |

## 4. Cómo está hecho
```
JUEGOS          Juega EnCicla · El Metro · Run Scooter · Mandados · Motor City (carreras) · Extremo
PIEZAS          MC.Mision · Carrera · Inventario · Logros · Dialogo · Historias + Director · Ocurrencias · UI · Musica · Paisaje
CIUDAD          MC.Urbe (zonas, demanda, valor, servicios, crecimiento, presupuesto) · Lugares · Desgaste · Hogar · Habitante
MUNDO VIVO      Reloj · Calendario · Cielo · Clima/ClimaGlobal · Trafico · Transporte · IA · Poblacion · Mobiliario
SERES/MÁQUINAS  Personaje · Seres · Vehiculos · Taller · Cuerpo (superficies) · Controles · Manejo · Camara
VISTAS          Vistas (cenital, ciudad 3D, maqueta, lateral, panorámica, 3.ª y 1.ª persona, dron, cine, pixel) · Raster · Sombras · Sprites · arte
MUNDO           Mundo (MC4 real) · Generador · Cosmos · Ondas · RejillaIrregular · Autotile · Direccion
CIENCIA         Ciencia · Fis · Quim · Termo · Escala · Dinero · Libro · Mercado · Finanzas · GPU · Bucle · resorte
```
**Archivos:** `js/NN-nombre.js`, en orden y en **un solo cierre**. Solo se publica `MC`. Se arma en `dist/motor.js` con `node motor.mjs construir`.

| Archivo | Módulo | Archivo | Módulo |
|---|---|---|---|
| 00 | núcleo, eventos, `arte` | 38 | `Sprites` |
| 02 | ciencia | 39 | `Sombras` (2.3) |
| 03 | economía | 40 | losas (`Losas.invalidar`) |
| 04 | `Escala` | 41 | `Vista2D` (sombras, mobiliario, capas, fachadas WFC) |
| 05 | `GPU` | 42–43 | perfil y panorámica |
| 10 | `Mundo` (`agregarEdificio`) | 44 | `Raster` |
| 11 | redes | 45 | GL |
| 12 | `Generador` | 46 | `Vistas` |
| 13 | `Cosmos` | 47 | seguir la ruta |
| 14 | `Ondas`, `Autotile`, `RejillaIrregular` (2.3) | 48 | `Interiores` |
| 15 | **`Terreno`** (2.4): agua, material, pendiente, reglas de paso y obstáculos | 28 | **`Naturaleza`** (2.4): rocas, palmas, frailejones, arbustos y juncos |
| 20–22 | tiempo, tráfico, transporte | 49 | `Hogar` y `Direccion` |
| 24 | ambiente | 50 | Run |
| 25 | IA | 60 | música |
| 26 | `Urbe` (2.3) | 61 | `Paisaje` (2.3) |
| 27 | `Mobiliario` (2.3) | 70 | `UI` |
| 30–37 | personaje, vehículos, física, controles, cámara, seres, taller, manejo | 80 | mecánicas |
| | | 82 | `Lugares` |
| | | 85 | `Historias` |
| | | 86 | `Necesidades` y `Habitante` (2.3) |

## 5. El código a usar
> Todo lo de aquí está probado en `pruebas/prueba.mjs` o en `juegos/mandados/juego.js`, el ejemplo completo. Copia y adapta.

### 5.1 Incluir el motor y el mundo (un solo HTML)
- Un juego nuevo: `node motor.mjs nuevo juego mi-juego --mundo guatape`.
- `node motor.mjs construir` pega en `dist/juegos/mi-juego.html` el mundo (`MC_MUNDO`), la ciudad (`MC_CIUDAD`), el motor y tu `juego.js`.
- En un juego que ya existe, incluye `motor-city/dist/motor.js` antes de tu código. El mundo va en base64: `dist/mundo-<id>.js`.
```js
const cfg = Object.assign({}, MC_CIUDAD, { zonas: Object.assign({}, MC.ZONAS_BASE, MC_CIUDAD.zonas || {}) });
const M = await MC.Mundo.cargar(MC_MUNDO, cfg);            // real (MC4)
// o: const M = MC.Generador.mundo({ semilla: 42, tipo: 'isla', ancho: 448, alto: 448, pueblos: 3, lat: 6.2 });
// o un planeta: const P = MC.Cosmos.planeta(MC.Cosmos.estrella(1, 0, 7), 2); const M = MC.Generador.mundo(MC.Cosmos.mundoDe(P));
M.red('rueda');                                              // arma la red de calles una vez (tarda ~1 s en Medellín)
```

### 5.2 El ciclo de juego
```js
const vistas = new MC.Vistas(M), camara = new MC.Camara({ zoom: 3.4, mundo: M }), reloj = new MC.Reloj({ vel: 1.5 });
const clima = new MC.ClimaGlobal({ lat: 6.23, alt: M.cota(x, y) }), cuerpo = new MC.Cuerpo(M, { x, y, a: 0, veh: 'bici' });
const ctl = new MC.Controles(lienzo, { alGesto: q => camara.gesto(q) }), ui = MC.UI.crear(document.body, { tema: 'motorcity' });
const E = { mundo: M, camara, reloj, clima, jugador: { cuerpo, aspecto: MC.Personaje.aspecto() }, vehiculos: [], peatones: [], extras: [], t: 0 };
new MC.Bucle({
  actualizar: dt => {
    reloj.avanzar(dt); clima.actualizar(reloj, dt); E.cielo = MC.Cielo.en(reloj.fecha, reloj.hora, clima); E.t += dt;
    const entrada = MC.Manejo.aplicar(ctl.leer(), cuerpo, { camara, esquema: 'joystick', vista: vistas.actual.tipo === 'gl' ? 'volante' : 'mundo' });
    cuerpo.actualizar(dt, entrada);
    camara.actualizar(dt, { x: cuerpo.x, y: cuerpo.y, z: cuerpo.alturaSuelo, a: cuerpo.a, v: cuerpo.v, zCuerpo: cuerpo.z, zPaso: cuerpo.zPaso });
  },
  dibujar: () => vistas.dibujar(g, W, H, E, 1 / 60)            // con sombras, mobiliario, luces y fachadas por reglas
}).iniciar();
vistas.usar('lateral', E); camara.girar90(1); vistas.pixel = true;   // vista de lado que gira de a 90°, y pixel
```

### 5.3 La interfaz que no estorba
```js
ui.ficha('hora', '🕐 ' + reloj.texto()); ui.mision('<b>📦 Lleva el paquete</b>'); ui.aviso('¡Listo!');
ui.boton({ id: 'casa', icono: '🏠', texto: 'Mi casa', al: () => abrirCasa() });
ui.menu('Garaje', [{ id: 'bici', texto: '🚲 Bici' }], id => cuerpo.setVeh(id));
const i = await ui.dialogo('Título', 'Texto', ['Sí', 'No']);
ui.foco(Math.abs(cuerpo.v) > 11);                       // al ir rápido, solo lo vital
console.assert(MC.UI.verificar(ui).length === 0);       // nada tapa el centro

// 2.5.1 · controles que se ven (abajo a la izquierda el pulgar izquierdo; abajo a la derecha el derecho)
ui.joystick(ctl, { texto: 'Arrastra para moverte' });  // en cada cuadro: ui.pintarJoystick()
ui.accion({ id: 'salto', icono: '⤒', texto: 'Saltar', mantener: true, ctl });   // mantener → ctl.boton('salto', true|false)
ui.accion({ id: 'turbo', icono: '⚡', texto: 'Turbo', mantener: true, ctl });
// el objetivo: pin si se ve, flecha en el borde de la zona libre si no
const [sx, sy] = E._pr(meta.x, meta.y, 0), Z = ui.zonaLibre(), k = W / innerWidth;
MC.UI.indicador(g, W, H, sx, sy, { texto: '120 m', escala: k, t, rect: [Z.x0 * k, Z.y0 * k, Z.x1 * k, Z.y1 * k] });
// la cámara: ~45 m en el lado corto, para que el jugador mida más de 10 px
const camara = new MC.Camara({ zoom: Math.max(9, Math.min(18, Math.min(innerWidth, innerHeight) / 45)) * devicePixelRatio, mundo: M });
```
> **Lección de la 2.5.1:** un juego de prueba se juega **sin pagar** (modo libre) y con **controles que se ven**. Si el jugador no ve su personaje ni el joystick, cree que no se mueve, aunque se mueva.

### 5.4 Arte: sprites y ganchos de dibujo
```js
MC.Sprites.atlas('encicla', { imagen: 'data:image/webp;base64,…', cuadros: { bici_lado: [0, 0, 64, 40, 32, 40] }, metros: { bici_lado: 1.05 } });
MC.Sprites.dibujar(g, 'encicla/bici_lado', x, y, pxPorMetro, { dir: 1, fase: cuerpo.fase, pixel: vistas.pixel });
MC.arte.registrar('encicla', {
  personajeLado(g, J, A, x, y, pxm, dir) { /* … */ },        // personaje de perfil (pose J del esqueleto único)
  vehiculoLado(g, V, x, y, pxm, dir, C) { /* … */ },
  prop(g, p, x, y, pxm, D) { return MC.Sprites.dibujar(g, 'encicla/' + p.t, x, y, pxm); },          // 2.3: postes, árboles, bancas…
  fachadaModulo(g, tipo, x, y, w, h, encendida, D) { /* ventana|balcon|local|vitrina|puerta */ return true; },  // 2.3
  mueble(g, m, estilo, P) { return MC.Sprites.dibujar(g, 'muebles/' + m.tipo + '_' + estilo, m.x + m.w / 2, m.y + m.h, 1); }  // 2.3, en metros
}).usar('encicla');
```
**Regla:**
- si un gancho devuelve `true`, el motor no dibuja lo suyo;
- si no, dibuja el respaldo procedural;
- lo que falte queda en `MC.Sprites.faltan`.

**2.5.1 · un paquete entero de arte, en una línea** (`js/87-pieles.js`):
```js
// arte/<ia>/ = atlas .webp + manifiesto.json (cuadros, anim, metros) + iconos.json + hitos.json + paletas.json
// juego.json: "arte": ["gemini"] → el HTML trae MC_ARTE.gemini (o se incluye dist/arte/gemini.js)
MC.Pieles.instalar('gemini', MC_ARTE.gemini, { partes: ['prop', 'naturaleza', 'fachada', 'mueble'], pixel: () => vistas.pixel, usar: true });
MC.arte.usar('motor');                    // volver al procedural
MC.Pieles.icono('vista_cenital', 20);     // <svg> de G‑M9
```
- Cada gancho cae al dibujo del motor si el sprite no está.
- Los árboles y las rocas se dibujan **a la medida del motor**, para que la sombra calculada coincida con el dibujo.
- De noche se usa una **copia oscurecida** del atlas, hecha una sola vez.
- Las partes son: `prop`, `naturaleza`, `fachada`, `personaje`, `vehiculo`, `animal`, `mueble` y `arbol` (2.6).

**2.6 · estilo realista familiar:**
```js
MC.estilo = 'realista';        // por defecto; 'clasico' = plano y limpio (las losas se rehacen solas)
MC.Arboleda.en(mundo, x0, y0, x1, y1)   // los árboles: { x, y, r, h, e (especie), v (variante) }, los mismos que chocan
// gancho de arte para reemplazar los árboles procedurales (C‑A4): vista 'lado' (ancla en el pie) o 'arriba' (ancla en el centro)
MC.arte.registrar('mijuego', { arbol(g, t, vista, x, y, pxPorMetro, D) { return MC.Sprites.dibujar(g, 'mijuego/arbol_' + t.e + '_' + vista, x, y, pxPorMetro, { metros: vista === 'lado' ? t.h : t.r * 2 }); } });
```
- Los árboles van de pie desde un zoom de 3,2 px por metro (4,2 con calidad media), y antes se hornean desde arriba en las losas.

**2.7 · estilos gráficos, peso y vida, y motores potentes:**
```js
MC.estilo = 'comic';            // realista, clasico, comic, manga, anime, novela, ukiyoe, acuarela (MC.Estilo.lista())
MC.Estilo.col('#c25f37')        // un color pasado por el estilo activo; MC.Estilo.rgb([r, g, b]) en 0..1
// un estilo nuevo es un objeto de datos en MC.ESTILOS_GRAF: { n, icono, saturar, brillo, contraste, gris, niveles,
//   paleta, mezcla, umbral, tonos, acento, tinta, tintaColor, trama: 'puntos'|'tono'|'rayado'|'papel', arbol: 'real'|'cel'|'tono'|'silueta'|'acuarela',
//   sombra: [r, g, b, a], cielo: [[arriba], [horizonte]], lineas: color, onomatopeyas: true, final: 'gris' }
MC.Vida.emitir('polvo', x, y, 8, { vel: 2 }); MC.Vida.onomatopeya(x, y, '¡ZAS!'); MC.Vida.impacto(.06);   // peso y vida
const glb = MC.Exportar.glb(mundo, [x0, y0, x1, y1]);   // glTF 2.0 binario; MC.Exportar.escena(...), .alturas(...), .r16(...)
socket.send(JSON.stringify(MC.Puente.instantanea(E)));  // el estado vivo para otro motor
```

**2.8 · de la entrega maestra:**
```js
MC.opciones.sacudida = .4; MC.opciones.particulas = 0;   // accesibilidad: de 0 a 1
MC.Telemetria.registro(vistas.ms, dt); MC.Telemetria.resumen();   // { fps, cuadro_p50, cuadro_p95, cuadro_p99, dibujo_p95, gpu }
MC.Contratos.validar(MC.Exportar.escena(M, caja), esquemaEscena);   // [] si cumple schemas/escena.schema.json
MC.on('fauna', e => …); MC.on('aterriza', e => …);   // las palomas alzaron vuelo; el jugador aterrizó (fuerza 0–1)
```
- Las huellas (`MC.Vida.marcas`) duran 4 minutos.
- Las palomas aparecen en plazas, andenes y parques.
- Los faros salen solos de noche en el carro y la moto del jugador.
- `Rudeza` (asfalto, andén, techos y grano) se hornea una vez por losa: no cuesta por cuadro.

### 5.5 Mi casa y quien vive en ella (Los Sims)
```js
const R = MC.Hogar.desdeDireccion(M, 'Calle 31 # 28-15', { guardaDireccion: false });   // sin internet; la dirección no sale del aparato
const hogar = R.hogar, plano = hogar.plano();          // interior propio del edificio real
hogar.estilo('bohemio'); hogar.comprar('sofa', libro, 'jugador'); hogar.poner('sofa', 1.2, 0.8);
const hab = new MC.Habitante(plano, { semilla: 5 });   // elige por anuncios de los objetos y la distancia
hab.paso(dt, 6);                                       // 6 min de juego por segundo; hab.accion.texto = «duerme», «cocina»…
hogar.ambiente();                                      // 0–100: decorar sube el ánimo
```

### 5.6 La ciudad (SimCity y Cities: Skylines)
```js
const urbe = new MC.Urbe(M, { libro, centro: { x, y }, alCambiar: (a, b, c, d) => vistas.losas.invalidar(a, b, c, d) });
urbe.zonificar('R', x, y, 150);          // celdas de 8 m junto a las calles (R, C, I, O; 'baja' o 'alta')
urbe.servicio('parque', x, y);           // parque, policia, bomberos, salud, colegio, biblioteca, estacion, energia, agua
urbe.avanzar(1);                         // un mes: demanda RCI, crecimiento, niveles, recursos y presupuesto
E.capaInfo = urbe.capa('valor');         // capas de datos: valor, ruido, contaminacion, verde, servicios, transporte, zonas
urbe.demanda(); urbe.valorEn(x, y); urbe.resumen(); urbe.guardar();
```

### 5.7 Lugares, historias, ocurrencias y sonido
```js
const L = MC.Lugares.cerca(M, x, y, 30)[0];
MC.Lugares.hacer(L, 'reparar', { libro, cuenta: 'jugador', desgaste, vehiculo: cuerpo.veh, hora: reloj.hora });
const hist = new MC.Historias({ semilla: 11 }); hist.paso(dt);
const s = hist.elegir({ hora: reloj.hora, clima, vehiculo: cuerpo.veh, altura: cuerpo.altura, lugarTipo: L && L.tipo, banderas: {} });
if (s) ui.dialogo('🌅', s.texto, s.opciones.map(o => o.texto)).then(i => s.opciones[i].elegir());
const ocu = new MC.Ocurrencias({ juego: 'mi-juego' }); ocu.vigilar(dt, { cuerpo, mundo: M, libro, entrada, ms: vistas.ms });
MC.Paisaje.tocar({ hora: reloj.hora, clima, ruido: .5, verde: .4 });   // después de un toque del jugador
MC.Musica.tocar({ estilo: 'lofi', tema: 'gimnopedia', energia: .4, compases: 16 });
```

### 5.8 Generar con reglas (Townscaper)
```js
const R = MC.Ondas.resolver({ ancho: 10, alto: 10, fichas: { casa: { peso: 3, lados: ['c', 'c', 'c', 'c'] }, plaza: { peso: 1, lados: ['p', 'p', 'p', 'p'] } }, compat: (a, b, d) => true, semilla: 7 });
const fachada = MC.Ondas.fachada(5, 4, 12);              // [['ventana', 'balcon', …], …, ['local', 'puerta', 'vitrina', 'local']]
const rejilla = MC.RejillaIrregular.crear({ anillos: 4, lado: 6, semilla: 3 });   // { puntos, quads }: pueblos orgánicos
MC.Autotile.mascara8((x, y) => agua(x, y), i, j);        // 47 casos de borde (agua, pasto, andén…)
```

### 5.9 Terreno, agua y límites (2.4)
```js
MC.Terreno.agua(M);                                    // al cargar (una vez, ~0,3–1 s): lagos, ríos, mar, quebradas y su profundidad
MC.Terreno.aguaEn(M, x, y);                            // { tipo: 'mar'|'lago'|'rio'|'quebrada', prof (m), orilla (m) } o null
MC.Terreno.en(M, x, y);                                // { material, via, pendiente, agua, cota }
MC.Terreno.paso(cuerpo, x, y);                         // { ok, f, vadea, nada, motivo }: lo usa MC.Cuerpo solo
cuerpo.nadando; cuerpo.vadeando; cuerpo.bloqueo;       // 'el agua está muy honda (2.3 m)', 'está muy empinado', 'un árbol'…
cuerpo.obstaculos = () => trafico.map(v => ({ x: v.x, y: v.y, r: 1.1, motivo: 'un vehículo' }));   // lo que el juego quiera que estorbe
MC.Naturaleza.en(M, x0, y0, x1, y1);                   // rocas, palmas, frailejones, arbustos y juncos (se dibujan y chocan solos)
/* ENTRAR AL AGUA (2.5) */
cuerpo.bajarse('agua');                                // se baja y deja el vehículo parqueado (cuerpo.estacionado); también solo al empujar 0,6 s hacia lo hondo
cuerpo.actualizar(dt, { baja: true });                 // nadando: bucea (sube con { sube: true } o { salto: true }); quieto, flota hacia arriba
cuerpo.buceando; cuerpo.aire;                          // aire 0–1 (cuerpo.pulmones = 35 s); sin aire sube sola (evento MC.on('sinAire'))
cuerpo.puedeMontar(3) && cuerpo.montar(3);             // vuelve al vehículo parqueado
cuerpo.embarcar('lancha', 30); cuerpo.desembarcar(16); // lancha en el agua honda más cercana / a la tierra firme más cercana
MC.Terreno.aguaHonda(M, x, y, r, min); MC.Terreno.tierraFirme(M, x, y, r);
```
- **Lo que pinta el motor solo:**
  - el vehículo parqueado;
  - las poses `nada` y `bucea`;
  - el agua tapando el cuerpo;
  - las burbujas;
  - el tono bajo el agua en todas las vistas.
**Reglas de paso:**

| Clase | Pendiente máxima fuera de vía | Agua que cruza |
|---|---|---|
| A pie | ~45° | Vadea hasta ~1,15 m; después nada |
| Bici | ~19° | 0,25 m |
| Moto | ~27° | 0,3 m |
| Carro | ~24° | 0,4 m |
| Camión | ~17° | 0,7 m |
| Lancha | — | Necesita 0,6 m |

- La bici de montaña y el todoterreno toleran 40 % más pendiente, y el todoterreno entra al monte.
- Sobre las vías la pendiente no bloquea, porque las calles reales existen ahí.

### 5.10 Probar y medir
```bash
node motor.mjs construir && node motor.mjs prueba --navegador     # 134 en verde
node motor.mjs exportar guatape                                   # el mundo en glTF, alturas RAW 16 y escena JSON (dist/exportar/)
node motor.mjs capturas                                           # 14 fotos estándar de Mandados en dist/capturas/
node motor.mjs revisar-arte arte/chatgpt                          # revisa un paquete de arte contra las reglas
MC_CHROMIUM=/usr/bin/chromium node motor.mjs prueba --navegador   # si Playwright no pudo bajar su navegador (red cerrada)
node motor.mjs reporte "Lo que cambié" --juego encicla --autor "IA de EnCicla"
node motor.mjs documento                                          # arma dist/MOTOR-CITY-TODO.md (este documento + anexos)
```

## 6. Lo aprendido de las referencias y dónde quedó
| Referencia | Lo que enseña | En el motor | Lo que falta (petición) |
|---|---|---|---|
| **SimCity** (2000, 4, 2013 con GlassBox) | Ciudad por **capas de datos** (valor del suelo, deseabilidad, contaminación, crimen y tráfico). Parques y agua valorizan; la contaminación desvaloriza. Desde 2013, **recursos en recipientes llevados por agentes** (GlassBox). | `MC.Urbe`: campos de 40 m (valor, ruido, contaminación, verde, servicios, transporte), demanda RCI, energía y agua con capacidad, y capas de datos encima de las vistas. | Agentes que lleven los recursos (agua, energía, basura) por la red; viajes casa → trabajo (C‑M9). |
| **Cities: Skylines** (1 y 2) | **Zonas pegadas a las calles**; lotes que crecen mirando a la calle; demanda RCI; **niveles** de edificio por valor del suelo y servicios; distritos y políticas; **props y decals** (el detalle); LOD. Lección de la 2: sin LOD y con sombras caras el rendimiento se cae. | Zonas de 8 m hasta 4 de fondo; lotes alineados con la vía; niveles 1–5; `MC.Mobiliario` (postes, árboles, bancas, paraderos, cebras e hidrantes). Sombras baratas (un trazo y en caché). | Distritos y políticas; decals (manchas, huecos, charcos); kits de props de Gemini (G‑M10 y G‑M11). |
| **Los Sims** | «Personas simples, **objetos inteligentes**». Los objetos **anuncian** qué necesidad satisfacen. 8 motivos (hambre, higiene, diversión, energía, vejiga, social, comodidad y ambiente). **Ambiente del cuarto** por decoración. Modos de construir y de comprar. | `MC.Necesidades` (anuncios, urgencia cuadrática y atenuación por distancia) y `MC.Habitante` (vive en la casa); `Hogar.ambiente()`. Comprar y poner ya estaban (`MC.Hogar`). | Paredes editables (modo construir), dos o más habitantes que conversan, A* dentro de la casa (C‑M10). |
| **Townscaper** (Oskar Stålberg) | **Rejilla irregular** (hexágono → triángulos → cuadriláteros relajados). **Reglas locales** (WFC) que eligen el módulo según los vecinos. Las casas se arman en las **esquinas** (rejilla dual). Paleta suave, sombras de contacto y detalles automáticos (arcos, escaleras, jardines). | `MC.RejillaIrregular`, `MC.Ondas.resolver` (WFC) y `fachada`, `MC.Autotile` (máscaras 4/8 y esquinas). Fachadas por reglas en ciudad 3D, maqueta y lateral. Oclusión de contacto en losas, árboles y gente. | Pueblos generados sobre la rejilla irregular; módulos 3D de casas por esquina (G‑M12 y C‑M11). |
| **Sombras** (todas) | La sombra **sienta** las cosas y cuenta la hora. Un buen sistema es barato: una sombra por objeto, en caché y por calidad. | `MC.Sombras`: sombra proyectada según el sol real (larga y cálida al atardecer, ninguna de noche); casco convexo en caché; recorte de techos en cenital; también en el raster. Luz de noche: charcos cálidos en los postes. | Sombras sobre los muros de los vecinos y de los árboles (C‑M12). |
| **Terreno y agua** (motores de mundo abierto; Barnes, 2014) | Controlador de personaje con **pendiente máxima** y escalón; agua con profundidad (vadear o nadar); llenado de depresiones por prioridad para tener lagos con salida; la naturaleza sigue al material y a la pendiente. | `MC.Terreno`, `MC.Naturaleza`, lagos del generador, agua y roca en las losas. | Texturas de agua y orillas, olas y animación de la espuma (G‑M15); capa de agua precalculada en el MC4 (C‑M15). |
| **FEZ, Monument Valley, Little Nightmares** | Vistas ortográficas, giros de a 90° y casa de muñecas. | Vista lateral, maqueta 2:1 y rayos X. | — |
| **GTA, Forza, Need for Speed** | Cámara de persecución, FOV con la velocidad y asistencias. | `MC.Camara`, `MC.Manejo`. | Carreras (*Motor City*, 2.4). |
| **No Man's Sky** | Todo desde una semilla y ruido continuo. | `MC.Cosmos`. | — |
| **Left 4 Dead, storylets** | Director de ritmo y historias por saliencia. | `MC.Historias`. | 60 storylets (C‑M5). |

**Lo crucial para cómo se crea en el motor (2.3):** una ciudad no se dibuja, **se cultiva**.
1. Calles reales o generadas.
2. Zonas a sus lados.
3. Lotes que crecen por demanda y valor.
4. Fachadas armadas por reglas.
5. Mobiliario a lo largo de las vías.
6. Sombras y luz según la hora.
7. Gente con necesidades.
8. Capas de datos para entender y decidir.
9. **Terreno con reglas (2.4):** el agua tiene tipo y profundidad, la montaña tiene pendiente y roca, y nada se atraviesa sin sentido.

## 7. Reglas para todas las IAs
1. **Lee todo este documento.** Antes de cambiar el motor, sigue la skill `motor-city-desarrollo` (en `.claude/skills/`).
2. **Las reglas del autor:**
   - un solo HTML, sin internet ni librerías;
   - español de Colombia, para todo público y sin datos personales;
   - no romper guardados ni la API (deja alias);
   - las pruebas en verde;
   - el arte con respaldo procedural;
   - nada de marcas, logos ni personas reales sin permiso.
3. **Tres pilares** en todo: **diversión** (que quiera seguir), **reflexión** (que el mundo pese, sin sermones) y **conciencia** (que aprenda algo real, rápido y jugando).
4. **La pantalla es del juego:**
   - el centro no se tapa;
   - información arriba y acciones donde llega el pulgar;
   - un aviso a la vez;
   - lo que no cambia se atenúa.
5. **Fluido:** presupuesto de 16,7 ms (o 33,3 ms) por cuadro. Si agregas detalle, agrégalo con **LOD y caché** (la lección de Cities: Skylines 2).
6. **Ciencia con fuente** y prueba con valores conocidos (skill `motor-city-ciencia`).
7. **Un solo cierre:** antes de declarar un `const` de nivel superior, busca que no exista (`grep -n "const NOMBRE" js/*.js`).
8. **Reporte obligatorio** si tocas el motor desde un juego.
9. **Solo lo tuyo.** Si te piden algo de otra IA, dilo y no lo hagas.

## 8. Cómo probar y publicar
```bash
git clone https://github.com/juanfeliperico369-stack/motorcity && cd motorcity && git checkout claude/motor-city-engine-xu7p4y
node motor.mjs construir && node motor.mjs prueba --navegador
```
- **La web** (GitHub Pages) sirve la rama `main`. Lo que llega a `main` queda en <https://juanfeliperico369-stack.github.io/motorcity/>.
- **Los juegos:** `node motor.mjs sincronizar ../BicicletasUno` copia el motor a `BicicletasUno/motor-city/`.

## 9. Plan de cada IA
### 9.1 Gemini (Antigravity «hydrogen» y Nano Banana) · TAREAS FÁCILES: revisar, medir, datos y referencias
**Cambio del autor (nov‑2026):** Antigravity trabaja por ahora con **«hydrogen»** (ya no con «argon»), así que a Gemini le tocan tareas cortas y comprobables. **La lista exacta está en `TAREAS-IA.md`.**

| Id | Tarea |
|---|---|
| **G‑H1** | Revisión visual con `node motor.mjs capturas` (14 fotos estándar de Mandados) y una tabla de hallazgos. |
| **G‑H2** | Revisor de arte: `node motor.mjs revisar-arte arte/<paquete>` sobre cada entrega. |
| **G‑H3** | 6 láminas de referencia del estilo realista familiar (Nano Banana), solo como guía para ChatGPT. |
| **G‑H4** | 30 datos verificables de Guatapé y Medellín, con fuente. |
| **G‑H5** | Qué ícono de G‑M9 va en cada botón. |
| **G‑H6** | Correr las pruebas del motor y de los juegos, y reportar. |

**Lo que ya entregó (2.5.1):**
- G‑M0…G‑M15 está en `arte/gemini/`; la revisión de Claude, en `arte/gemini/LEEME.md`;
- se usan los props, las fachadas y los muebles. En 2.6 los árboles son los procedurales con volumen.

**Lo que ya no le toca:** los atlas grandes, el personaje y los vehículos a escala pasan a ChatGPT (C‑A2 y C‑A3).

**No es tu rol:** el código del motor (eso es de ChatGPT y de Claude).

**Nuevo en la 2.10:**
- **G‑H10**: los enlaces que no se pudieron leer;
- **G‑H11**: las 4 paletas colombianas;
- **G‑H12**: correr `node motor.mjs publico`, `node motor.mjs skills` y `legacy-scan`, y reportar;
- **G‑H13**: instalar las skills en Antigravity.

### 9.2 ChatGPT (imágenes) y Codex («astra») · TAREAS FUERTES: arte realista a escala y código difícil
**Cambio del autor (nov‑2026):** Codex sigue con **«astra»** y ChatGPT genera mejores imágenes, así que le tocan el arte importante y el código difícil. **La lista exacta está en `TAREAS-IA.md`.**

**Arte, en orden** (detalle en §10.2):
1. **C‑A1** · ancla de estilo realista familiar.
2. **C‑A2** · personaje a escala.
3. **C‑A3** · vehículos a escala.
4. **C‑A4** · árboles realistas (gancho nuevo `arbol`).
5. **C‑A5** · texturas de suelo.
6. **C‑A6** · fachadas con desgaste.
7. **C‑A7** · animales a escala.

**Código, en orden:**
1. **C‑M13** · maqueta por debajo de 20 ms.
2. **C‑M16** · gancho `textura`.
3. **C‑M17** · lluvia que se ve.
4. **C‑M1** · auditoría de lo nuevo.
5. **C‑M15** · terreno.
6. **C‑M9, C‑M12, C‑M10, C‑M14 y C‑M11.**
7. **C‑M2 a C‑M8.**

**El código que usarás:**
- **arte:** en `arte/chatgpt/`, con atlas y `manifiesto.json`. Debe pasar `node motor.mjs revisar-arte arte/chatgpt`. Se prueba con `MC.Pieles.instalar('chatgpt', MC_ARTE.chatgpt, { partes: [...] })` (§5.4);
- **código:** commits en la rama con `node motor.mjs prueba --navegador` en verde, y cada mejora con su prueba `ok(condición, 'qué se prueba', datos)`.

**Nuevo en la 2.10, con las skills de los videos:**
- **C‑M23**: la red vial de Guatapé, sin puntas sueltas;
- **C‑M24**: la ayuda de manejo para niños, que pidió el público simulado;
- **C‑M25**: la portada web con **Hallmark**;
- **C‑A12**: el tráiler de Mandados con **HyperFrames**.

Antes de escribir HTML, CSS o JS, consulta **Modern Web Guidance**. Las skills se instalan con `node motor.mjs skills --instalar --agente codex`.

### 9.3 IA de Juega EnCicla (`BicicletasUno`)
1. Migrar a `motor-city/` (`motor-city/docs/MIGRACION-ENCICLA.md`) sin perder sus 97 pruebas.
2. Usar `MC.Vistas`, que ya trae sombras, mobiliario, lateral y panorámica, con la piel EnCicla.
3. Usar `MC.Manejo` (perfil bici) y `MC.UI` (tema `encicla`) con `verificar`.
4. **Estaciones EnCicla como lugares jugables**, y talleres de bici.
5. **Mi casa** con soporte para la bici.
6. **Capa de datos de movilidad:** `urbe.capa('transporte')` y `ruido` para ver dónde conviene la ciclorruta. **Conciencia:** por qué la bici baja el ruido.
7. Historias de cultura ciudadana.
8. Publicar en `gh-pages` **conservando `/metro/`**, con APK de `versionCode` > 20003. No subas llaves.

### 9.4 IA de El Metro (`MetroZero`)
1. Seguir su protocolo de 7 pasos y migrar a `motor-city/`.
2. **Lección de ciudad:**
   - las estaciones suben el valor del suelo: `urbe.capa('transporte')` y `urbe.capa('valor')`;
   - un modo «¿dónde va la próxima estación?» con `MC.Urbe`.
3. `MC.Raster` como respaldo de su G3. Estaciones como lugares, con interiores. Cultura metro. Rosalba y la gente con rutinas.
4. `node tools/test.mjs 100` con 0 errores.

### 9.5 IA de Run Scooter (`RunRunZero`)
- Sigue independiente. Avisa si cambias el juego (el importador dice qué parche no calza).
- Opcional: `MC.Manejo` y `MC.Sprites`.

### 9.6 Codex y Antigravity como agentes de un juego
Son «la IA de ese juego» (9.3 a 9.5): misma rama, mismas pruebas y reporte.

### 9.7 Claude (la IA del motor) · lo que sigue
1. Unir la entrega de ChatGPT (la de Gemini quedó en la 2.5.1): 2.6.
   - De la auditoría de Codex: bajar la **maqueta** de 40 ms en cualquier máquina, con caché por región y fachadas horneadas.
   - Del informe de Gemini queda pendiente:
     - la cola única de avisos y anuncios;
     - el minimapa suavizado;
     - el modo para daltónicos con sus paletas;
     - los íconos SVG en la interfaz.
2. Carreras de *Motor City* sobre la red real (`MC.Carrera`), con repeticiones.
3. *Extremo*: física de tabla, de bici de montaña y de surf.
4. Agentes con propósito en `MC.Urbe`.
5. Losas en un *Worker*.
6. Otra ciudad completa con transporte.

## 10. Peticiones en detalle
### 10.1 Para Gemini
> **Desde la 2.6, lo de Gemini son las tareas fáciles G‑H1…G‑H6 de `TAREAS-IA.md`.** La tabla de abajo (G‑M0…G‑M15) ya se entregó en la 2.5.1 y queda como referencia de las reglas y los nombres.

**Reglas del arte:**
- sin texto, logos ni marcas;
- fondo transparente o **magenta #ff00ff**;
- **32 px por metro** en la fuente;
- perfil mirando a la derecha; cenital mirando al oriente (+x); frontal para fachadas y muebles en lateral;
- luz de arriba a la izquierda y **sin sombra proyectada** (la pone el motor);
- nombres en minúsculas, en español y con guiones bajos;
- medidas de `MC.Escala.MEDIDAS`.

**Cada atlas trae su JSON:** `cuadros: { nombre: [x, y, w, h, ancla_x, ancla_y] }`, con el ancla en los pies o en la base, y `metros: { nombre: altoReal }`.

| Id | Encargo |
|---|---|
| **G‑M0** | **Ancla de estilo:** una lámina con personaje en bici, carro, casa de ladera, torre, **una calle con su mobiliario** y una sala desde arriba. En suave y en pixel ×3. 1024×512. |
| **G‑M1** | **Personaje:** 8 estados (quieto, camina, corre, pedalea, impulsa, patina, sentado y salta; 3–4 cuadros cada uno). Perfil y cenital de 4 direcciones. 3 tonos de piel, 2 peinados y 2 cuerpos. |
| **G‑M2** | **Vehículos:** los 35 de `MC.Vehiculos`, de perfil y cenital, con las ruedas aparte. Taxi amarillo y buseta, sin marcas. |
| **G‑M3** | **Animales:** perro criollo, gato, gallinazo, colibrí, iguana, zarigüeya, ardilla, caballo y vaca. Más 4 criaturas verosímiles por la ley cuadrado‑cubo. |
| **G‑M4** | **Muebles por estilo:** los 22 de `MC.Interiores.CATALOGO`, más los del plano (nevera, estufa, inodoro, ducha y lavamanos), en los 8 estilos (paisa, moderno, minimalista, bohemio, campestre, industrial, juvenil y clásico). Cenital (gancho `mueble`) y frontal. **Prioridad:** sala, alcoba y cocina en paisa, moderno y juvenil. |
| **G‑M5** | **Pisos y muros:** madera, 3 baldosas hidráulicas paisas, porcelanato y cemento. *Tiles* de 64×64 sin costuras. |
| **G‑M6** | **Lugares jugables:** taller de bicis y de carros, tienda de barrio, tienda de ropa, centro comercial, biblioteca y restaurante, con sus muebles propios. |
| **G‑M7** | **Fachadas por zona** (ladera, centro, Laureles, El Poblado, pueblo e industria), de día y de noche. |
| **G‑M8** | **Siluetas de los 30 hitos**, como *paths* normalizados. |
| **G‑M9** | **Íconos SVG:** 9 vistas, 7 controles, 10 lugares, Mi casa, Ciudad, capas de datos, zonas (R, C, I, O) y servicios. |
| **G‑M10 (nuevo)** | **Kit de props urbanos**, como los de Cities: Skylines: poste (día y noche), **5 árboles del trópico** (guayacán amarillo, guayacán rosado, ceiba, palma y mango), banca, caneca, paradero, hidrante, señal de pare, semáforo, kiosco, fuente, bolardo y matera de andén. Cenital y frontal, para el gancho `prop(g, p, x, y, pxm, D)` (`p.t` es el tipo y `p.v` una variante de 0 a 1). |
| **G‑M11 (nuevo)** | ***Decals* del piso:** manchas de aceite, grietas, alcantarillas, huecos, hojas caídas, charcos para la lluvia, rayas gastadas y cebras viejas. Transparentes, de 64–128 px. |
| **G‑M12 (nuevo)** | **Módulos de fachada para las reglas** (WFC, como Townscaper): `ventana`, `balcon`, `local`, `vitrina`, `puerta` y `muro`, cada uno en 3 variantes por zona, de día y con la ventana encendida. Para el gancho `fachadaModulo(g, tipo, x, y, w, h, encendida, D)`. Que encajen entre sí: lado con lado y piso con piso. |
| **G‑M13 (nuevo)** | **Paletas:** 6 por hora (amanecer, mañana, mediodía, tarde, atardecer y noche) para el tono de la ciudad, al estilo de la paleta suave de Townscaper. Y paletas para las **capas de datos** (valor, ruido, contaminación, verde, servicios y transporte), con versión para **daltónicos**. JSON con colores HEX. |
| **G‑M15 (2.4)** | **Naturaleza y agua:** rocas de 5 tamaños (de 0,4 a 3 m, grises andinas), palma de coco y palma de cera (la del Quindío), frailejón (páramo), arbustos de monte y juncos de orilla. Cenital y frontal, para el gancho `naturaleza(g, p, x, y, pxPorMetro, D)` (`p.t`, `p.s` es el tamaño). Más *tiles* de agua de 64×64 por tipo (mar turquesa, lago verdoso, río pardo, quebrada clara), en somera y honda, la espuma de la orilla y la arena mojada. |
| **G‑M14 (nuevo)** | **Guía de luz y sombra:** color y opacidad de las sombras por hora y por zona, contacto suave en las bases y charcos de luz de noche (cálido o frío). Ejemplos pintados de una cuadra a las 7, 12, 17 y 20 h. |

**Auditoría visual:**
- La ciudad de día, en la tarde (sombras largas) y de noche (luces): ¿se lee bien a cada zoom?
- ¿El mobiliario estorba o ayuda?
- Las capas de datos: ¿se entienden?
- 10 casas: ¿se sienten distintas?
- Compara con SimCity, Cities: Skylines y Townscaper (sin copiar arte).
- Mide en un celular real (FPS por vista) y anota `MC.GPU.perfil()`.

### 10.2 Para ChatGPT (arte y código)
| Id | Encargo |
|---|---|
| **C‑M1** | **Auditoría** de todos los módulos 2.2 y 2.3 (§4). Busca errores, bordes, fugas (cachés que crecen) y trabajo de más por cuadro. Entrega una tabla con archivo:línea, severidad, escenario y *diff*. |
| **C‑M2** | **Redes precalculadas** en el MC4 (~1 s menos al arrancar en Medellín). |
| **C‑M3** | **Raster** a menos de 12 ms a calidad 0,8 sin GPU. |
| **C‑M4** | **50 direcciones públicas** (calles y cruces) de Medellín, Envigado, Itagüí, Bello y Guatapé. Soporte de «Bis», «Este», diagonales y transversales. Nunca direcciones de personas. |
| **C‑M5** | **60 storylets** (20 por pilar) + **15 de alcalde** (fiestas del pueblo, mercado campesino, apagón, aguacero que tapa una quebrada, nuevo parque…), con datos verificables y su fuente. |
| **C‑M6** | **Accesibilidad:** lector de pantalla, teclado, contraste AA, modo zurdo, letra grande y **capas de datos para daltónicos**. |
| **C‑M7** | **Íconos SVG** que no haga Gemini, y el logotipo de Motor City (solo forma). |
| **C‑M8** | **Pruebas que faltan:** `Manejo.seguirRuta`, `Hogar.mover` y `girar`, `Lugares.hacer` en los 10 tipos, `Ocurrencias`, Kepler en `Cosmos` y `Sprites.hornear`. |
| **C‑M9 (nuevo)** | **Tráfico con propósito** (Cities: Skylines y GlassBox): los habitantes de los lotes de `MC.Urbe` viajan de la casa al trabajo por la red (A*). La carga de cada arista da la **congestión** y una capa `trafico`. Sin pasar de 2 ms por cuadro. |
| **C‑M10 (nuevo)** | **Casa:** A* en una rejilla de 0,25 m dentro del plano, dos o más `MC.Habitante` que conversan (necesidad social), y **modo construir** (mover paredes y puertas) que siga pasando `Interiores.cabe`. |
| **C‑M11 (nuevo)** | **Pueblo orgánico:** `MC.Generador` arma la plaza y las manzanas de un pueblo sobre `MC.RejillaIrregular`, con `MC.Ondas` para decidir casa, patio, calle o plaza. |
| **C‑M12 (nuevo)** | **Sombras:** también sobre los muros de los edificios vecinos y de los árboles del mobiliario, en caché por hora y sin pasar de 3 ms. |
| **C‑M13 (nuevo)** | **Maqueta por debajo de 20 ms** con la CPU 4× más lenta, con todo el detalle: lotes por región, fachadas en caché y mobiliario en lienzos. |
| **C‑M15 (2.4)** | **Terreno:** (1) guardar en el MC4 una capa `agua` precalculada (tipo y distancia a la orilla), porque hoy se calcula al cargar en 0,3–1 s; (2) física en terreno irregular: el carro se inclina y patina en barro y nieve, y la moto y la bici de montaña saltan rocas pequeñas; (3) pruebas de los motivos de `Terreno.paso` en los 7 tipos de vehículo; (4) en el raster, agua y rocas. |
| **C‑M14 (nuevo)** | **Distritos y políticas** en `MC.Urbe`, como Cities: Skylines: nombre, impuestos por distrito y políticas (prohibir industria pesada, bici prioritaria, parques gratis), con efecto en los campos y en la demanda. |
| **C‑A1 (2.6)** | **Ancla de estilo realista familiar:** una cuadra de Guatapé en maqueta 2:1, de día y de noche con lluvia. Asfalto gastado, andenes de baldosa, tejas, zócalos de colores y guayacanes. Sin caricatura, sin texto ni marcas. |
| **C‑A2 (2.6)** | **Personaje a escala** (reemplaza G‑M1): 10 estados × 4 cuadros de perfil y 4 direcciones desde arriba. 6 personas distintas. 1,70 m = 54 px. La figura llena el cuadro. |
| **C‑A3 (2.6)** | **Vehículos a escala** (reemplaza G‑M2): los 35 más los 2 de mandados, de perfil y desde arriba, sin sombra horneada, con algo de uso. Ruedas aparte. |
| **C‑A4 (2.6)** | **Árboles realistas** para el gancho `arbol`: 6 especies × 3 variantes más 2 palmas, de lado y desde arriba, de 128 px. |
| **C‑A5 (2.6)** | **Texturas de suelo sin costuras**, de 128 px = 4 m: asfalto gastado y parcheado, baldosa, adoquín, pasto, barro, grava, teja, plancha y zinc. |
| **C‑A6 (2.6)** | **Fachadas con desgaste** para `fachadaModulo` (reemplaza G‑M12). |
| **C‑A7 (2.6)** | **Animales a escala** para `animalLado` (reemplaza G‑M3). |
| **C‑M16 (2.6)** | **Gancho `textura`** en `Losas.pintar`: patrones en metros con las texturas de C‑A5, y `Rudeza` como respaldo. Con su prueba. |
| **C‑M17 (2.6)** | **Lluvia que se ve:** asfalto mojado, charcos con reflejo y salpicaduras, sin pasar de 2 ms por cuadro. |

## 11. Cómo entregar
- **Gemini:** `ENTREGA-GEMINI-MOTOR-CITY-<versión>.md` (Claude extrae el arte a `arte/gemini/`):
  - resumen de 10 líneas;
  - cada G‑M, con su imagen en base64 o SVG, su JSON y una nota de uso;
  - auditoría (tabla);
  - rendimiento en el celular;
  - reglas aprendidas.
- **ChatGPT:** `ENTREGA-CHATGPT-MOTOR-CITY-2.3.md`:
  - resumen;
  - auditoría;
  - cada C‑M, con su *diff* unificado, cómo probarlo y la salida de las pruebas;
  - reglas aprendidas.
- **IAs de los juegos:** commits en su rama, su bitácora y un reporte en el motor (`node motor.mjs reporte`) si lo tocan.
- **Todas:** informen en 5–10 líneas: qué hicieron, cómo lo probaron, qué aprendieron y qué falta.

## 12. Lo que necesita el autor
1. **Probar en un celular real** de gama media, con Mandados: qué se siente lento o confuso.
   - Lo pedido y su estado: `docs/PEDIDOS.md`.
2. **Pasar este documento** a cada IA y traer sus entregas.
3. **Elegir la licencia** del motor antes de mostrarlo a empresas (ver `docs/NEGOCIO-Y-USOS.md`).
4. **Permisos de marca** si un juego usará logos del Metro o de EnCicla comercialmente.

No hace falta conectar ninguna aplicación.

## 13. Fuentes
**SimCity:**
- Game Developer, «GDC 2012: Breaking down SimCity's GlassBox engine».
- Andrew Willmott, «Inside GlassBox».
- PC Gamer, «SimCity: Inside the GlassBox engine».
- Análisis de la comunidad sobre el valor del suelo en SimCity 4.

**Cities: Skylines:**
- Paradox Interactive y Colossal Order, *dev diaries* de zonificación y economía.
- Análisis técnicos del rendimiento de Cities: Skylines II: PC Gamer, Tom's Hardware y Windows Central.

**Los Sims:**
- Forbus y Wright, «Programming Objects in The Sims» (Northwestern).
- Game Maker's Toolkit, «The Genius AI Behind The Sims».
- PC Gamer, sobre la autonomía de Los Sims.

**Townscaper:**
- Boris the Brave, «Editable WFC» y «WFC tips and tricks».
- Maxim Gumin, *WaveFunctionCollapse* (GitHub).
- Charlas de Oskar Stålberg (por ejemplo, «Beyond Townscaper», 2021).
- Los detalles exactos de su rejilla no están documentados oficialmente.

**Terreno:** Barnes, Lehman y Mulla, «Priority-Flood: An Optimal Depression-Filling and Watershed-Labeling Algorithm» (2014), para los lagos.

**Las anteriores** (FEZ, Monument Valley, Little Nightmares, No Man's Sky, storylets, Left 4 Dead, cámaras y diseño de interfaz) están en `docs/INVESTIGACION.md`.


---

# ANEXO 0. Tareas de cada IA (`TAREAS-IA.md`)


> **Si te dijeron «mira el repositorio y haz tu parte», empieza aquí.**
> 1. Busca abajo **quién eres** y haz **solo tu parte**, en el orden indicado.
> 2. El contexto completo, el código exacto y las reglas están en `docs/DOCUMENTO-UNICO.md` (léelo entero). Lo que ya se hizo y lo que falta está en `docs/PEDIDOS.md`.
> 3. Al terminar, informa en 5–10 líneas: qué hiciste, cómo lo probaste, qué aprendiste y qué falta.

**Novedades de la 2.10 (20‑nov‑2026):**
- **Skills y plugins de los videos del autor** (`skills-externas.json`, skill `motor-city-skills-externas`):
  - **Hallmark**, para páginas web que no parezcan hechas por IA;
  - **Modern Web Guidance** (Google Chrome), para HTML, CSS y JS moderno;
  - **find-skills** (Vercel), para buscar skills;
  - **HyperFrames**, para videos de lanzamiento.
- **Cómo se instalan:**
  - Claude Code las recibe como plugins por `.claude/settings.json`;
  - las demás IA corren `node motor.mjs skills --instalar --agente codex` (o `antigravity`, `gemini-cli`).
- **Público simulado:** `node motor.mjs publico`. Una niña, un abuelo, una gamer y un turista juegan solos Mandados, y el informe queda en `dist/publico.md`.
- **Política de navegadores:** está en `CLAUDE.md`.

**Reparto desde noviembre de 2026, por decisión del autor:**
- **Gemini con Antigravity** trabaja por ahora con **«hydrogen»** (ya no con «argon»). Le tocan las **tareas fáciles**: revisar, medir, reunir datos y referencias.
- **ChatGPT con Codex** sigue con **«astra»** y genera mejores imágenes. Le tocan las **tareas fuertes**: el arte realista a escala y el código difícil.

**La guía de referencias (2.8):** `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`, la entrega del autor con 25 fichas. Tiene el peso, la vida, la arquitectura portable y el rendimiento en móvil. Su resumen, con lo que ya está en el motor, está en `docs/INSPIRACION-VISUAL.md` §1.

**Los estilos (2.7):**
- **realista familiar** (por defecto);
- **cómic, manga, anime, novela gráfica, ukiyo-e y acuarela** (`MC.estilo`).

De las obras con derechos se toman las **técnicas**; el arte que se copia es de **dominio público** (`docs/INSPIRACION-VISUAL.md`). **Peso y vida:** `MC.Vida`. **Motores potentes:** `docs/MOTORES-POTENTES.md`.

**El estilo realista familiar (2.6):**
- Para todo público, pero con la ciudad como es:
  - asfalto gastado, con parches, grietas y alcantarillas;
  - andenes de baldosa con bordillo;
  - pasto con parches secos;
  - tejas de barro y planchas de concreto con humedad;
  - muros con la base sucia;
  - árboles con volumen (guayacanes florecidos, ceibas, mangos).
- Nada de caricatura plana. Nada de violencia, sangre ni marcas.
- El estilo clásico (plano) sigue disponible: `MC.estilo = 'clasico'`.

---

### Gemini · Antigravity («hydrogen») · tareas fáciles
> **Entregado el 20‑nov‑2026 (G‑H1…G‑H8):**
> - `reportes/2026-11-20-gemini-*.md` (capturas, revisor de arte y pruebas);
> - `arte/referencias/` (6 láminas);
> - `contenido/datos-gemini.json` (30 datos);
> - `arte/gemini/iconos-ui.json`;
> - `arte/dominio-publico/candidatas.md` (40 obras);
> - la auditoría de los reels en `docs/INSPIRACION-VISUAL.md` §1.1.
>
> Claude corrigió lo que encontraron las capturas (botones y zona libre, aviso desfasado, ventanas en casas de un piso, cubiertas flotantes, cebras cruzadas, botón «Comprar» y burbuja de la casa) y sacó las paletas de las obras colombianas.
>
> **Lo que sigue para Gemini:**
> - **G‑H7**: los 13 enlaces y las 7 fichas que solo describe su informe;
> - **G‑H9**: la medición en un celular real;
> - **G‑H1 otra vez** sobre la 2.8, con `node motor.mjs capturas`.

Cada tarea es corta y se puede comprobar. Si algo pide más que esto, **déjalo anotado para ChatGPT** y no lo hagas.

| Id | Tarea | Cómo | Entrega |
|---|---|---|---|
| **G‑H1** | **Revisión visual con capturas** | `node motor.mjs construir` y `node motor.mjs capturas`. Saca 14 fotos de Mandados: 4 vistas × 3 horas, más la capa de valor y Mi casa. Para cada foto responde: ¿se lee el personaje? ¿algo tapa el centro? ¿los árboles están de pie en la maqueta y la lateral? ¿la noche se ve bien? ¿hay algo que se vea de caricatura o fuera de escala? | `reportes/AAAA-MM-DD-gemini-capturas.md`, con una tabla foto → hallazgo → gravedad (alta, media o baja). |
| **G‑H2** | **Revisor de arte** | `node motor.mjs revisar-arte arte/<paquete>` sobre cada paquete que llegue (empieza por `arte/gemini`, que hoy tiene 21 cuadros fuera de la imagen). | La salida pegada en un reporte y una lista de qué debe corregir quien lo hizo. |
| **G‑H3** | **Láminas de referencia** (Nano Banana) del estilo realista familiar | 6 escenas, sin texto ni logos, vistas como la maqueta 2:1:<br>1. una calle de Guatapé con zócalos de colores;<br>2. una ladera de Medellín con escaleras;<br>3. la orilla del embalse;<br>4. una noche con lluvia y charcos;<br>5. una plaza con guayacanes florecidos;<br>6. un taller de barrio. | `arte/referencias/` (PNG). Son **solo referencia** para ChatGPT y no van al juego. |
| **G‑H4** | **30 datos verificables** de Guatapé y Medellín (geografía, naturaleza, historia, movilidad) | Una frase corta cada uno, **con su fuente** (enlace). | `contenido/datos-gemini.json`: `[{ "texto", "fuente", "lugar", "tema" }]` |
| **G‑H5** | **Íconos a botones** | Elige qué ícono de `arte/gemini/iconos.json` va en cada botón de Mandados (Vista, Vehículo, Sonido, Agua, Mi casa, Ciudad, Ajustes, saltar y turbo). | `arte/gemini/iconos-ui.json`: `{ "boton": "icono" }` |
| **G‑H7** | **Verifica las referencias que faltan**: los 13 enlaces de Instagram que siguen sin verificar y las 7 fichas que solo describe tu informe (R02, R03, R04, R08, R09, R13 y R18 en `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md` §4) | Para cada uno: qué se ve, qué estilo es (cómic, manga, anime, realista…), qué da sensación de peso o de vida y qué técnica parece usar. | Una tabla en `docs/INSPIRACION-VISUAL.md` §1, una fila por reel. |
| **G‑H8** | **40 obras de dominio público** para paletas, al menos 10 colombianas (Comisión Corográfica, Epifanio Garay, Ricardo Acevedo Bernal, grabados del *Papel Periódico Ilustrado*…) | Para cada una: el enlace en Wikimedia Commons y su licencia. Solo dominio público. | Una lista en `arte/dominio-publico/candidatas.md`. Claude saca las paletas. |
| **G‑H9** | **Medición en un celular real**, con el autor | En Mandados, ⚙️ Ajustes → 📈 Telemetría. 5 minutos por vista (cenital, maqueta, lateral) y por calidad (baja, media, alta). Anota el modelo del celular, los fps, el p95 y si se calienta. | Una tabla en `reportes/AAAA-MM-DD-gemini-celular.md`. |
| **G‑H10** (2.10) | **Lo que no se pudo leer de los videos nuevos**:<ul><li>los 2 Instagram (`DfVDgmclLPi`, que el autor mandó dos veces, y `DexJDYnNQ0X`; piden iniciar sesión);</li><li>el TikTok de @soyenriquerocha «Claude ahora construye bien sin basura» (`vt.tiktok.com/ZSpw3u8dH`).</li></ul>Para cada uno: qué herramienta, skill o plugin muestra, su repositorio y su licencia. | `docs/INSPIRACION-VISUAL.md` §1.2: una línea por enlace. Si es una skill útil, propónla para `skills-externas.json` sin instalarla. |
| **G‑H11** (2.10) | **Las 4 paletas colombianas que faltan** (Wikimedia bloqueó la descarga) | Para cada obra de `arte/dominio-publico/candidatas.md` marcada «falta», da el enlace directo a una **miniatura de 250 px** en `upload.wikimedia.org` y confirma que es de dominio público. | Los enlaces en `candidatas.md`. Claude saca las paletas. |
| **G‑H12** (2.10) | **Corre las herramientas nuevas y reporta** | `node motor.mjs publico` (anota el veredicto de cada perfil), `node motor.mjs skills` y `npx -y modern-web-guidance@latest legacy-scan js --json`. | `reportes/<fecha>-gemini-herramientas.md`, sin cambiar código. Para cada hallazgo de `legacy-scan`: archivo, línea y si aplica según su `keepWhen` y su `dropWhen`. |
| **G‑H13** (2.10) | **Instala las skills en Antigravity** | `node motor.mjs skills --instalar --agente antigravity` y confirma que aparecen en `.agents/skills/`. Úsalas desde ahí en tus tareas. | Una línea en tu reporte, con lo que se instaló y lo que falló. |
| **G‑H6** | **Pruebas y reporte** | `node motor.mjs prueba --navegador`, y en cada juego sus pruebas (ver su `TAREAS-IA.md`). | Un reporte con lo que pasó y lo que falló, sin corregir código. |

**No es tu rol:** cambiar el código del motor, hacer atlas grandes o arreglar fallas. Eso es de ChatGPT y de Claude.

---

### ChatGPT · Codex («astra») · tareas fuertes
> **Entregado el 20‑nov‑2026 (2.7.1, unido en la 2.9):**
> - el arte C‑A1…C‑A9 (`arte/chatgpt/`);
> - el código C‑M1, C‑M13 (la maqueta va en 22 ms; la meta de 20 sigue abierta), C‑M15, C‑M16, C‑M17, C‑M18 y C‑M19.
>
> **2.10:**
> - el cómic y el 1 bit ya no leen la pantalla (filtros del lienzo y media resolución): cenital 21 y 18 ms, maqueta 31 y 28 ms (antes 26/25 y 43/42) en Chromium sin GPU;
> - el 1 bit ya no hace muaré en la maqueta;
> - Mandados pasó de 8,2 a 5,1 MB (`herramientas/aligerar_arte.py`).
>
> **Lo que sigue, en orden:**
> 1. **C‑M13**: la maqueta por debajo de 20 ms;
> 2. **C‑M21**, **C‑M20** y **C‑M22**;
> 3. **C‑A10** y **C‑A11**;
> 4. después, C‑M2…C‑M12 y C‑M14.
>
> **Nuevos de la 2.10, con las skills de los videos:** **C‑M23**, **C‑M24**, **C‑M25** y **C‑A12**, justo después de C‑M13.
>
> Cuando entregues un atlas nuevo, corre `python3 herramientas/aligerar_arte.py`. Así queda WebP con pérdida, calidad 88 y alfa sin pérdida.

**Primero el arte** (lo genera ChatGPT) y **después el código** (lo hace Codex). Detalle y reglas en el documento único, §10.

#### Arte (imágenes de ChatGPT), en orden
**Reglas comunes:**
- 32 px por metro;
- que la figura **llene su cuadro**;
- ancla en los pies o la base;
- **2 px de margen** entre cuadros;
- fondo transparente o magenta #ff00ff;
- **sin sombra horneada**: la pone el motor según el sol;
- luz de arriba a la izquierda;
- sin texto, logos ni marcas.

Cada atlas va con su `manifiesto.json` y pasa `node motor.mjs revisar-arte` sin problemas graves.

| Id | Encargo | Para qué gancho |
|---|---|---|
| **C‑A1** | **Ancla de estilo realista familiar**: una cuadra de Guatapé en maqueta 2:1, de día y de noche con lluvia. Es la referencia de todo lo demás. | — |
| **C‑A2** | **Personaje a escala**: 10 estados × 4 cuadros de perfil (quieto, camina, corre, pedalea, impulsa, patina, sentado, salta, nada, bucea) y desde arriba en 4 direcciones. 6 personas distintas (piel, pelo, ropa de diario y de trabajo, casco de ciclista). 1,70 m = 54 px. | `personajeLado`, `personajeArriba` |
| **C‑A3** | **Vehículos a escala**: los 35 de `MC.Vehiculos` más la moto y el carro de mandados, de perfil y desde arriba, con un poco de uso (polvo, rayones). Buseta, chiva, taxi y bus colombianos, sin marcas. Ruedas aparte. | `vehiculoLado` |
| **C‑A4** | **Árboles realistas**: guayacán amarillo y rosado (florecidos), ceiba, mango, urapán y árbol de monte, más palma de cera y de coco. 3 variantes de cada uno, de lado (128 px de alto) y desde arriba (128 px). Nombres: `arbol_<especie>_lado`, `arbol_<especie>_arriba`, `_v1`, `_v2`. | `arbol` (nuevo) |
| **C‑A5** | **Texturas de suelo sin costuras** (128 × 128 px = 4 m): asfalto gastado, asfalto parcheado, andén de baldosa, adoquín, pasto, tierra con barro, grava, teja de barro, plancha de concreto y zinc oxidado. | `textura` (lo hace C‑M16) |
| **C‑A6** | **Módulos de fachada con desgaste**: 6 zonas × 6 tipos × 3 variantes, de día y de noche (reemplaza G‑M12). | `fachadaModulo` |
| **C‑A7** | **Animales a escala**: perro criollo, gato, gallinazo, caballo, vaca, iguana, zarigüeya y ardilla. | `animalLado` |
| **C‑A8** | **Láminas guía de los estilos 2.7**: la misma cuadra de Guatapé en cómic (*Spider‑Verse* y Lichtenstein), manga (tramado y líneas), anime (Shinkai y Ghibli), novela gráfica (noir con un rojo), ukiyo-e (Hokusai) y acuarela (Comisión Corográfica). Solo la técnica, nunca personajes ni marcas. | guía de `MC.Estilo` |
| **C‑A10** | **Tipografía propia** (R25) para letreros, placas, grafitis y menús: una fuente a partir de letra a mano, con 3 variantes por letra, libre para usar. | interfaz y letreros |
| **C‑A11** | **Interfaz de libreta** (R23): el mapa de mandados, la lista de misiones y los botones como una libreta dibujada, con *squash and stretch* al tocar. | `MC.UI` (tema) |
| **C‑A12** (2.10) | **Tráiler de Mandados con HyperFrames** (skill `hyperframes`): 30 s en vertical 9:16 y en horizontal 16:9:<ul><li>con capturas reales (`node motor.mjs capturas`) de las vistas y de los estilos (realista, cómic, 1 bit, acuarela);</li><li>con subtítulos en español y música libre de derechos;</li><li>sin cifras ni frases inventadas.</li></ul> | `videos/` (MP4 de menos de 15 MB) y el HTML de la composición |
| **C‑A9** | **El personaje en *cel***, con contorno y 3 tonos, para los estilos dibujados: los mismos estados que C‑A2. | `personajeLado` en los estilos `comic`, `manga` y `anime` |

#### Código (Codex), en orden
| Id | Encargo |
|---|---|
| **C‑M13** | **Maqueta por debajo de 20 ms** con la CPU 4× más lenta, con todo el detalle 2.6: árboles de pie, desgaste y fachadas. Hoy da 30–38 ms aquí y 44,7 ms en la máquina de Codex. |
| **C‑M23** (2.10) | **La red vial de Guatapé:**<ul><li>123 de sus 385 nodos son puntas sueltas;</li><li>tiene 5 componentes;</li><li>las rutas dan rodeos de 4× en el percentil 90.</li></ul>Revisa `geo/territorio.py` y `Red` (`une`, `_partir`): que se unan los cruces y las puntas que casi tocan, sin crear calles falsas. | La prueba «rutas por la calle» con el percentil 90 por debajo de 2,5× y `node motor.mjs publico` sin perfiles atascados por el mapa. |
| **C‑M24** (2.10) | **Ayuda de manejo para niños**: el público simulado marca que Sofía (8 años) pasa el 43 % del tiempo atascada. Agrega en ⚙️ Ajustes una ayuda opcional:<ul><li>imán a la calle;</li><li>frenado antes de chocar;</li><li>giro suave al rozar un muro.</li></ul>Va encendida por defecto en el ritmo «tranquilo». | `node motor.mjs publico --perfiles nina` con atascado por debajo del 25 %, y su prueba. |
| **C‑M25** (2.10) | **La portada web de Motor City con Hallmark** (`/hallmark`): el `index.html` de GitHub Pages que lleva a Mandados y a los juegos.<ul><li>En español, con capturas reales.</li><li>Sin cifras, testimonios ni logos inventados.</li><li>`sloplint --render` limpio y el piso de Hallmark completo: tokens, `:focus-visible` y `prefers-reduced-motion`.</li></ul> | `index.html` y su reporte de `sloplint` |
| **C‑M16** | **Gancho `textura`** en las losas: las texturas de C‑A5 como patrones en metros, con respaldo procedural (`Rudeza`), y su prueba. |
| **C‑M17** | **Lluvia y atmósfera que se ven** (R02, R03 y R09): asfalto mojado más oscuro, charcos con reflejo y salpicaduras, y niebla de distancia en la maqueta y la lateral, sin pasar de 2 ms por cuadro. |
| **C‑M1** | **Auditoría de lo nuevo**: `js/16-estilos.js`, `js/29-arboleda.js`, `Rudeza` en `js/40-dibujo.js`, `js/87-pieles.js`, `js/88-vida.js` y `js/89-exportar.js`. Una tabla con archivo:línea, severidad, escenario y *diff*. |
| **C‑M18** | **Motores potentes**: abrir `node motor.mjs exportar guatape` en **Godot 4** (y, si se puede, Unity y Unreal); un proyecto mínimo que lea `escena.json` y ponga los árboles con `MultiMeshInstance3D`; y una vista de Motor City con **three.js o WebGPU** registrada en `MC.Vistas` (`docs/MOTORES-POTENTES.md`). |
| **C‑M20** | **API de construcción por código y pincel de mundo** (R18 *VoxPix* y R10 *Town Brush*): `city.calle(puntos, op)`, `city.edificio(x, y, ancho, fondo, alto, op)`, `city.arbol(x, y, especie)`, `city.luz(x, y)` y un mundo que se arma desde `escena.json`, validado con `schemas/escena.schema.json` (`MC.Contratos.validar`). Con eso, una IA construye barrios enteros por código. |
| **C‑M21** | **Peso del cuerpo y del vehículo** (R06, R07, R09, R11–R13, R20 y R21): suspensión por rueda con rayos, balanceo de la carrocería, cosas que se rompen (conos, vallas), IK de pies en escalones, animaciones cotidianas (abrir puertas, reparar, sentarse), tablero en primera persona con limpiaparabrisas, taller con rayos X y gráficas de suspensión y agarre en la telemetría. Sin pasar de 2 ms por cuadro, y la física igual en cualquier calidad gráfica. |
| **C‑M22** | **Guardado y mundo por sectores** (entrega §11 y §12.3): `MC.Guardado`, con `schema_version`, IDs estables y migradores; sectores activos y dormidos que recuerdan los cambios (huellas, objetos rotos, grafitis) al volver. |
| **C‑M19** | **Estilo de 1 bit con trama estable**, como *Return of the Obra Dinn*: umbral contra una trama de ruido azul que no tiemble al mover la cámara. Y semitono por luminancia en la sombra del cómic. |
| **C‑M15** | **Terreno**: la capa `agua` precalculada en el MC4, y el carro que se inclina y patina en barro y nieve. |
| **C‑M9, C‑M12, C‑M10, C‑M14, C‑M11** | Tráfico con propósito, sombras sobre muros, casa con A* y dos habitantes, distritos y políticas, y pueblo orgánico (§10.2). |
| **C‑M2 a C‑M8** | Redes precalculadas, raster, direcciones, storylets, accesibilidad y pruebas que faltan (§10.2). |

**Cómo entregas:**
- **El arte:** en `arte/chatgpt/`, con el mismo formato de `arte/gemini/` (atlas `.webp` o `.png` más `manifiesto.json`).
- **El código:** commits en la rama `claude/motor-city-engine-xu7p4y`, con `node motor.mjs prueba --navegador` en verde y cada mejora con su prueba.
- **El resumen:** `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`.

---

### Las IAs de los juegos
Cada juego tiene su propio `TAREAS-IA.md` en la raíz de su repositorio:
- **Juega EnCicla** (`BicicletasUno`): migrar a `motor-city/` y el estilo 2.6.
- **El Metro** (`MetroZero`): su protocolo de 7 pasos y la migración.
- **Run Scooter** (`RunRunZero`): sigue independiente.

### Claude · la IA del motor
- **2.10:**
  - unió las ramas viejas de los juegos;
  - instaló las skills de los videos;
  - quitó el leer la pantalla en el cómic y el 1 bit;
  - aligeró los atlas;
  - arregló `rutaA`;
  - creó el público simulado.
- Une las entregas (arte de ChatGPT en `MC.Pieles` y código de Codex).
- Mantiene `docs/PEDIDOS.md`.
- Sigue con *Motor City* (carreras) y *Extremo* (§9.7).


---

# ANEXO 0c. Skills y plugins externos (Hallmark, Modern Web Guidance, find-skills, HyperFrames) y público simulado (`.claude/skills/motor-city-skills-externas/SKILL.md`)

---
name: motor-city-skills-externas
description: Cuándo y cómo usar en Motor City las skills y plugins de terceros que pidió el autor (Hallmark para páginas web, Modern Web Guidance para HTML/CSS/JS moderno, find-skills para buscar skills, HyperFrames para videos de lanzamiento) y el público simulado (MC.Publico, idea de MiroFish). Úsala antes de hacer una página web de un juego, un tráiler, al escribir código del navegador o al buscar una skill nueva.
---

## Skills externas en Motor City

El catálogo está en `skills-externas.json` (repositorio, commit revisado, licencia, para qué sí y para qué no). `node motor.mjs skills` lo muestra.

### Instalarlas
- **Claude Code:** vienen como plugins en `.claude/settings.json`. Al abrir el proyecto se aceptan una vez: Hallmark, Modern Web Guidance y HyperFrames.
- **Codex, Antigravity, Gemini CLI y Claude (find-skills):** `node motor.mjs skills --instalar --agente codex`. También sirve con `antigravity`, `gemini-cli` o `claude-code`. Usa el instalador oficial (`npx skills add …`) y deja las skills en `.agents/skills/` o `.claude/skills/`, que **no se suben** (están en `.gitignore`).
- Necesitan internet y Node 22. Se instalan **en la máquina de la IA**. Nunca van dentro del HTML de un juego.

### Las skills propias del proyecto que salieron de los mismos videos (entrega de Gemini 2.9.1)
Úsalas primero, porque no necesitan instalar nada:
- `motor-city-web-moderna`: Baseline y Modern Web Guidance;
- `motor-city-diseno-ui`: el piso anti-clichés de Hallmark para el HUD y las portadas;
- `motor-city-qa-playwright`: pruebas táctiles en 412 × 860;
- `motor-city-revision-ia`: revisión de cambios hechos por IA, procedencia de los plugins y la simulación como hipótesis.

El catálogo completo, con la trazabilidad de los enlaces, está en `docs/SKILLS-Y-PLUGINS.md`.

### Cuál usar
| Tarea | Skill | Regla de Motor City encima |
|---|---|---|
| Portada web de un juego, prensa o landing (GitHub Pages) | **Hallmark** (`/hallmark`, `/hallmark audit <archivo>`) | Español de Colombia y todo público. Nada inventado: ni cifras, ni testimonios, ni logos. Las capturas son reales (`node motor.mjs capturas`). |
| Cualquier HTML, CSS o JS del navegador (menús, diálogos, accesibilidad, rendimiento) | **Modern Web Guidance** (`npx -y modern-web-guidance@latest search "…"`, `retrieve`, `legacy-scan`) | La **política de navegadores** de abajo. Un solo HTML, sin librerías. |
| Tráiler o video de lanzamiento | **HyperFrames** | Se hace con capturas reales del juego. El video es aparte; el juego no cambia. |
| «¿Hay una skill para…?» | **find-skills** (`npx skills find …`) | Solo de fuentes conocidas y con más de 1.000 instalaciones. Se revisa y se anota en `skills-externas.json` antes de usarla. |
| Probar con gente antes de publicar | **MC.Publico** (`node motor.mjs publico`) | Es una prueba de humo, no reemplaza a la gente de verdad. Mira el informe `dist/publico.md`. |
| Probar la web en un navegador | `webapp-testing` (Playwright) | Ya está en las pruebas: `node motor.mjs prueba --navegador`. |

### Política de navegadores (pedida por Modern Web Guidance)
- **Baseline ampliamente disponible.** Eso incluye ES2023: `toSorted`, `toReversed`, `structuredClone` y `replaceChildren`.
- **Lo más nuevo** (Baseline 2024 en adelante, `Promise.withResolvers`, `ctx.filter` en Safari menor a 18…) solo con detección y un respaldo de **20 líneas o menos, sin dependencias**. Ejemplo: el respaldo de `js/00-nucleo.js` y `Estilo._filtros()` en `js/16-estilos.js`.
- Celulares de referencia:
  - Android 7 con WebView 119 o más;
  - iPhone 8 o X con iOS 16 (Safari 16).
- El guardado se copia con JSON a propósito: así cada valor por defecto es serializable igual que un guardado. No lo cambies por `structuredClone`.

### Lo que no se usa
- **MiroFish** (AGPL, aplicación aparte con servidor y llaves). Solo se tomó la idea: `MC.Publico`.
- Material filtrado de terceros, por ejemplo «system prompts» filtrados. No se copia ni se usa.
- Una skill que no esté en el catálogo. Primero se revisa (lee su SKILL.md y sus scripts) y se anota.

### Reglas aprendidas
- `legacy-scan` revisa solo ~20 % de las guías. Verifica cada hallazgo con su `keepWhen` y su `dropWhen` antes de cambiar código.
- La salida de Hallmark se revisa con `sloplint`. En Motor City aplica a páginas web, no al lienzo del juego.


---

# ANEXO 0b. Todos los pedidos y su estado (`docs/PEDIDOS.md`)


> **Para qué sirve:** responder «¿ya está todo lo que pedí en el repositorio?».
>
> Cada pedido aparece con su estado y con el archivo donde vive. Se actualiza en cada sesión.
>
> **Estados:**
> - ✅ está en el repositorio y tiene prueba;
> - 🟡 está hecho, pero falta algo que no depende del código (un celular real, otra IA);
> - ⏳ todavía no está, y se dice a quién le toca.

Versión **2.10.0** · 20‑nov‑2026 · **134 pruebas en verde** (`node motor.mjs prueba --navegador`).

### Resumen
- **Hechos:** 76 pedidos ✅.
- **Hechos, pero falta algo de afuera:** 5 🟡. Los 10 reels que piden iniciar sesión los describe Gemini. El motor ya está copiado en EnCicla y El Metro, pero sus IAs todavía no lo usan. Y falta probar en un celular real.
- **Pendientes:** 6 ⏳:
  - los juegos *Motor City* (carreras) y *Extremo*;
  - bajar la maqueta de 40 ms en cualquier máquina;
  - el test de WebRTC de EnCicla, que le toca a su IA;
  - el arte y el código de ChatGPT (C‑A y C‑M);
  - las tareas fáciles de Gemini (G‑H1…G‑H6);
  - la licencia.

  Ninguno es un olvido. Cada uno está en el plan (§9 y §12 del documento único).

### 1. El motor y el repositorio (2.0–2.1)
| Pedido | Estado | Dónde |
|---|---|---|
| Un solo motor para todos los juegos, según el plan del mundo abierto | ✅ | `js/` → `dist/motor.js` · `docs/VISION-MOTOR-CITY.md` |
| Repositorio nuevo y llamarlo solo «Motor City» | ✅ | `juanfeliperico369-stack/motorcity` |
| Craquear territorios reales (país, ciudad, pueblo o lugar) | ✅ | `geo/territorio.py` · Guatapé en `datos/guatape` · skill `motor-city-territorio` |
| Crear mundos nuevos | ✅ | `js/12-generador.js` (isla, valle, costa, montaña, llanura) |
| Física fiel a la realidad | ✅ | `js/02-ciencia.js` (`MC.Fis`), `js/32-fisica.js` |
| Química fiel | ✅ | `js/02-ciencia.js` (`MC.Quim`, balanceo exacto) |
| Economía fiel | ✅ | `js/03-economia.js` (partida doble, mercado, finanzas) |
| Matemáticas | ✅ | `js/02-ciencia.js` (ruido, integradores, unidades SI) |
| Biología y personajes | ✅ | `js/35-seres.js`, `js/30-personaje.js` |
| Vehículos | ✅ | `js/31-vehiculos.js` (35), `js/36-taller.js` |
| Animales y alienígenas | ✅ | `js/35-seres.js`, `js/13-cosmos.js` |
| Interfaces | ✅ | `js/70-interfaz.js` |
| Música | ✅ | `js/60-musica.js` (procedural y clásicos de dominio público) |
| Mundo vivo | ✅ | `js/20-tiempo.js`, `21-trafico`, `22-transporte`, `24-ambiente`, `25-ia` |
| Interiores procedurales únicos | ✅ | `js/48-interiores.js` |
| Skills para las IAs | ✅ | `.claude/skills/` (desarrollo, territorio, juegos, ciencia, arte) |
| Usos y cómo venderlo | ✅ | `docs/NEGOCIO-Y-USOS.md` |
| Plan para Gemini y para GPT | ✅ | `docs/DOCUMENTO-UNICO.md` §9 y §10 |
| Contexto para las IAs de cada juego | ✅ | `CONTEXTO-IA.md`, `AGENTS.md`, `CLAUDE.md` y `docs/CONTEXTO-MOTOR-CITY.md` en cada juego |
| Repositorio abierto a las IAs, con reportes | ✅ | `reportes/`, `CONTRIBUIR.md`, `node motor.mjs reporte` |
| Minijuego en un HTML y su link | ✅ | `juegos/mandados` → [mandados.html](https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html) |
| Que EnCicla y El Metro usen el motor | 🟡 | El motor ya está copiado en `motor-city/` de cada juego, y la guía paso a paso está en `docs/MIGRACION-*.md`. **Falta:** la migración, que la hace la IA de cada juego (§9.3 y §9.4). |
| Run Scooter dentro de los juegos | ✅ | `js/50-run.js` («Run en la ciclovía») |
| Los juegos *Motor City* (carreras) y *Extremo* | ⏳ | Son juegos futuros. Las piezas ya existen (`MC.Carrera`, física y tráfico). **Le toca:** a Claude, que lo tiene en su plan (§9.7). |

### 2. Gráficos, controles y lugares (2.2)
| Pedido | Estado | Dónde |
|---|---|---|
| Solución a la tarjeta gráfica («crea una si es posible») | ✅ | `js/05-gpu.js` (nivel y resolución dinámica), `js/44-raster.js` (3D por software) |
| Física de puentes | ✅ | `js/32-fisica.js` (superficies y niveles), `js/red-niveles.mjs` |
| Mejor cámara | ✅ | `js/34-camara.js` (resortes y sacudida) |
| Vista lateral (FEZ, Little Nightmares, Monument Valley) | ✅ | `js/41-vista2d.js` (lateral), `js/42-vehiculos-lado.js` · `docs/INVESTIGACION.md` |
| Sprites | ✅ | `js/38-sprites.js` (atlas, 8 direcciones, 9‑slice, fondo magenta) |
| Psicología de la interfaz | ✅ | `js/70-interfaz.js` (zonas, atenuación, un aviso a la vez, `MC.UI.verificar`) |
| Los mejores motores, estudiados | ✅ | `docs/INVESTIGACION.md` |
| Historia con diversión, reflexión y conciencia | ✅ | `js/85-historias.js` (`MC.Historias` y director de ritmo) |
| Ocurrencias (lo imprevisto) | ✅ | `js/85-historias.js` (`MC.Ocurrencias`) |
| Manual de uso | ✅ | `docs/MANUAL.md` |
| Optimización | ✅ | `docs/OPTIMIZACION.md` |
| Tipos de controles | ✅ | `js/33-controles.js`, `js/37-manejo.js` (7 esquemas) |
| Información en pantalla que no estorbe | ✅ | `js/70-interfaz.js` |
| La casa del jugador desde su dirección, con diseño de interiores | ✅ | `js/49-hogar.js` (`MC.Direccion` y `MC.Hogar`). La dirección no sale del celular. |
| Más lugares: talleres, compras, restaurantes… | ✅ | `js/82-lugares.js`, `js/36-taller.js` |
| Historias procedurales | ✅ | `js/85-historias.js` |
| Generación como No Man's Sky | ✅ | `js/13-cosmos.js` (estrellas, planetas y relieve infinito) |
| Tamaños proporcionados | ✅ | `js/04-escala.js` (`MC.Escala.validar`) |

### 3. La ciudad (2.3)
| Pedido | Estado | Dónde |
|---|---|---|
| Cómo hacen SimCity y Cities: Skylines las ciudades | ✅ | `js/26-urbe.js` (zonas, demanda RCI, valor del suelo, servicios, presupuesto, capas de datos) |
| Sombras | ✅ | `js/39-sombras.js` (sol según la hora, en todas las vistas) |
| Detalles de ciudad | ✅ | `js/27-mobiliario.js` (postes, árboles, bancas, paraderos, cebras) |
| Los Sims | ✅ | `js/86-necesidades.js` (objetos inteligentes y necesidades) |
| Townscaper | ✅ | `js/14-ondas.js` (WFC, autotile, rejilla irregular) |
| Ambiente sonoro | ✅ | `js/61-sonido.js` (`MC.Paisaje`) |
| Un solo documento con todo: contexto, código a usar y plan de cada IA | ✅ | `docs/DOCUMENTO-UNICO.md` → `dist/MOTOR-CITY-TODO.md` |

### 4. Terreno y agua (2.4–2.5)
| Pedido | Estado | Dónde |
|---|---|---|
| Montañas, rocas y tipos de terreno | ✅ | `js/15-terreno.js`, `js/28-naturaleza.js` |
| Agua en lagos, ríos, playa y mar | ✅ | `js/15-terreno.js`, `js/12-generador.js` (lagos), `js/40-dibujo.js` (color por profundidad) |
| Límites verosímiles («el personaje pasa por encima de cosas») | ✅ | `MC.Terreno.paso` y los obstáculos en `js/32-fisica.js` |
| Poder entrar al agua | ✅ | `js/32-fisica.js` (bajarse, nadar, bucear con aire, montar, lancha) |

### 5. El minijuego jugable (2.5.1, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «No hay controles de verdad, no se puede mover nada» | ✅ | El problema no era el movimiento: la cámara estaba muy lejos y el joystick no se veía. Ahora hay **joystick visible** (`ui.joystick`), **botones de acción** (`ui.accion`), **cámara cerca** (unos 45 m en el lado corto), **marca del jugador**, **flecha al objetivo** (`MC.UI.indicador`) y **tutorial**. En computador funcionan las flechas y WASD. |
| «No está completamente liberado porque hay que pagar» | ✅ | **Modo libre**, prendido por defecto: los 34 vehículos (bici, moto, carro, bus, avión, lancha…), la casa, los lugares y la ciudad son gratis. Se apaga en ⚙️ Ajustes. |
| «Mejóralo con lo nuevo» | ✅ | Agua (al agua, bucear, lancha), terreno, sombras, ciudad (modo alcalde), mi casa, lugares, historias y paisaje sonoro. El primer mandado empieza cerca. |
| Que no se rompa otra vez | ✅ | Prueba nueva en `pruebas/prueba.mjs`: un celular táctil abre el juego, arrastra el joystick y se mueve. |
| La entrega de Gemini, integrada | ✅ | `arte/gemini/` (10 atlas, íconos, hitos, paletas), `js/87-pieles.js` (`MC.Pieles`) y el selector 🎨 Arte en Mandados. La revisión está en `arte/gemini/LEEME.md`: se usan árboles, props, rocas, fachadas y muebles; el personaje, los vehículos y los animales quedan procedurales hasta que vengan a escala. |
| La auditoría de Codex (`docs/AUDITORIA-MOTOR-CITY-2026-11-19.md`), atendida | ✅ | Las pruebas usan el Chromium del sistema si Playwright no trae el suyo, o el que diga `MC_CHROMIUM`. El arte de Gemini ya se revisó en las vistas. Lo que no es del motor quedó con su dueño (abajo). |
| La auditoría de Gemini, corregida | ✅ | Leyenda en las capas de datos; etiquetas de los cuartos en la esquina; ventanas encendidas en las casas bajas; la maqueta sin el corte de tierra; barras con fondo. Además, un comentario que desde la 2.2 anulaba dos líneas de la interfaz. |

### 6. Realismo y reparto de tareas (2.6, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «Desde la cenital los árboles se ven como tapetes en el suelo» | ✅ | `js/29-arboleda.js`: de pie en la maqueta, la oblicua y la lateral, con volumen desde arriba y sombra según el sol. |
| «Más realismo, rudeza y crudeza, pero *family friendly*» | ✅ | `MC.Rudeza` en `js/40-dibujo.js` (asfalto, andenes, pasto, techos y grano), muros con la base sucia y `MC.estilo` (realista o clásico). |
| «Los tutoriales deben ser opcionales» | ✅ | Mandados: «❓ Cómo se juega (opcional)» en la portada y en ⚙️ Ajustes; ya no se abre solo. |
| «Copia todos tus pedidos en los repositorios» | ✅ | `TAREAS-IA.md` en motorcity, BicicletasUno, MetroZero y RunRunZero, y `AGENTS.md`, `CLAUDE.md` y `GEMINI.md` apuntando ahí. |
| «Gemini (Antigravity) pasa a *hydrogen*: lo fácil» | ✅ | G‑H1…G‑H6 en `TAREAS-IA.md`, con `node motor.mjs capturas` y `revisar-arte` para que sean comprobables. |
| «ChatGPT (Codex) sigue con *astra*: mejores pedidos; mejores imágenes» | ✅ | Arte C‑A1…C‑A7 y código C‑M13, C‑M16 y C‑M17 (más los C‑M de antes) en `TAREAS-IA.md` y §10.2. |

### 7. Estilos, peso y vida, y motores potentes (2.7, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «Peso y vida en el motor» | ✅ | `js/88-vida.js` (`MC.Vida`): aterrizaje con aplastamiento, sacudida y polvo; hitstop; cabeceo del vehículo; bandadas; hojas; salpicaduras; viento en las copas. |
| «Que se pueda adaptar a motores más potentes» | ✅ | `js/89-exportar.js` (`MC.Exportar`, `MC.Puente`), `node motor.mjs exportar` y `docs/MOTORES-POTENTES.md`. El GLB pasa el validador de Khronos y three.js lo dibuja. |
| «Estéticas de cómic, manga, anime y novela gráfica» | ✅ | `js/16-estilos.js`: cómic, manga, anime, novela gráfica, ukiyo-e y acuarela, más realista y clásico. |
| «Investiga y aprende de las mejores obras visuales» | ✅ | `docs/INSPIRACION-VISUAL.md`, con fuentes. |
| «Recopila y adapta arte de verdad» | ✅ | Paletas de 10 obras de dominio público en `arte/dominio-publico/` (sin copiar arte con derechos). |
| Las referencias (14 reels) | 🟡 | Se leyeron 4; los otros 10 piden iniciar sesión. Los describe Gemini (G‑H7). |

### 8. La entrega maestra de referencias (2.8, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Sumar la entrega maestra (25 fichas, peso, vida y arquitectura) | ✅ | `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`, el resumen ficha por ficha en `docs/INSPIRACION-VISUAL.md` §1 y anexo E4 del documento único |
| «Prepara todo»: lo que se pudo hacer ya en el motor | ✅ | Palomas que huyen, huellas, faros, luces de freno, vintage, CRT, térmico, accesibilidad, telemetría, calidad y contratos (`js/88-vida.js`, `js/90-telemetria.js`, `js/91-contratos.js`, `schemas/`) |
| «Prepara todo»: lo demás, repartido | ✅ | `TAREAS-IA.md`: C‑M20, C‑M21, C‑M22, C‑A10, C‑A11, G‑H7 y G‑H9 |

### 9. La entrega de Gemini (G‑H1…G‑H8) y sus hallazgos (2.8)
| Pedido | Estado | Dónde |
|---|---|---|
| Tareas fáciles de Gemini | ✅ | `reportes/2026-11-20-gemini-*.md`, `arte/referencias/`, `contenido/datos-gemini.json`, `arte/gemini/iconos-ui.json`, `arte/dominio-publico/candidatas.md` y `docs/INSPIRACION-VISUAL.md` §1.1 |
| Corregir lo que vio Gemini en las capturas | ✅ | Zona libre con margen para los botones (80 %); avisos con clave (la vista nunca queda desfasada); ventanas en las casas de un piso; cubiertas sobre columnas; cebras sin cruzarse; botón «Comprar» y burbuja dentro de la casa; sombra de las copas más pequeña |
| Paletas de las obras colombianas | 🟡 | 12 de 16 en `arte/dominio-publico/paletas.json` (`col_*`): Comisión Corográfica, Torres Méndez, Garay, Acevedo Bernal y el *Papel Periódico Ilustrado*. Wikimedia frenó las otras 4; se completan en la próxima sesión. |

### 10. La entrega de ChatGPT y Codex (2.7.1), unida en la 2.9
| Pedido | Estado | Dónde |
|---|---|---|
| Arte a escala de ChatGPT (C‑A1…C‑A9) | ✅ | `arte/chatgpt/` (6 atlas, 676 cuadros) y `arte/chatgpt/guias/`; en Mandados: Vista → Arte → ChatGPT |
| Código de Codex (C‑M1, C‑M13, C‑M15…C‑M19) | ✅ | La auditoría y sus arreglos; caché de fachadas (maqueta a 22 ms); agua en el MC4; `textura` y charcos; adaptadores de Godot y three.js; 1 bit (`ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`) |
| Maqueta por debajo de 20 ms (C‑M13) | 🟡 | Va en 22 ms con la CPU 4×. Los estilos cómic (28 ms) y 1 bit (37 ms) de Codex cuestan más porque procesan toda la pantalla. |

### 11. Lo que falta, y a quién le toca
| Qué | Estado | A quién le toca |
|---|---|---|
| Probar en un **celular real** de gama media | 🟡 | Al autor. Anota el modelo y lo que se siente lento o confuso. |
| Lo que sigue de ChatGPT y Codex (C‑A10, C‑A11, C‑M2…C‑M12, C‑M14, C‑M20…C‑M22) | ⏳ | A ChatGPT y Codex («astra»): `TAREAS-IA.md`. |
| Revisión visual, revisor de arte, referencias y datos (G‑H1…G‑H6) | ⏳ | A Gemini («hydrogen»): `TAREAS-IA.md`. |
| Licencia del motor | ⏳ | Al autor (`docs/NEGOCIO-Y-USOS.md`). |
| Maqueta por debajo de 40 ms en cualquier máquina (Codex midió 44,7 ms en la suya; aquí da 27–29 ms) | ⏳ | A Claude: caché por región y fachadas horneadas (§9.7). |
| El test de WebRTC de EnCicla (ventana fija de 900 ms) | ⏳ | A la IA de EnCicla (lo señalaron Gemini y Codex). |

### 12. «Retoma, une todo, mejora y optimiza todo; añade las skills y plugins de los videos y sigue desarrollando» (2.10, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Revisar los repositorios ya actualizados y **unir todo** | Hecho | <ul><li>El Metro: Motor del Valle 1.2.0 desde EnCicla.</li><li>`plan-unico-el-metro` ya estaba dentro de la v2.0.0, así que no se fusionó: habría devuelto 14 archivos a su estado anterior.</li><li>EnCicla: de `revolucion-v2` (2.0.1) se trajo el **alto contraste** y el **metro sin casas debajo** (`src/js/96-accesible.js`, con 2 pruebas). El registro de claves del guardado queda para su IA.</li></ul> |
| **Optimizar todo** | Hecho | <ul><li>El cómic y el 1 bit sin leer la pantalla (`Estilo._imprimirGPU`), a media resolución en pantallas densas.</li><li>Cuadro real en la cenital: el cómic pasó de 25,5 a 20,8 ms y el 1 bit de 25,1 a 17,9 ms. En la maqueta: el cómic pasó de 42,9 a 30,9 ms y el 1 bit de 42,4 a 27,7 ms.</li><li>Atlas más livianos: Mandados pasó de 8,2 a 5,1 MB y se ve igual (`herramientas/aligerar_arte.py`).</li></ul> |
| **Mejorar todo** | Hecho | <ul><li>El 1 bit ya no hace muaré en la maqueta.</li><li>`rutaA` sale por el extremo de la calle que conviene: mediana de 1,29× la línea recta, y a veces mucho más corta. Arregla también «tocar para ir».</li><li>Modern Web Guidance sobre el motor, con respaldo para celulares viejos.</li></ul> |
| **Skills y plugins de los videos** | Hecho | <ul><li>`skills-externas.json`, `node motor.mjs skills`, `.claude/settings.json` en los 4 repositorios y la skill `motor-city-skills-externas`.</li><li>El detalle de los 11 enlaces está en `docs/INSPIRACION-VISUAL.md` §1.2.</li></ul> |
| **Seguir desarrollando** | Hecho | **`MC.Publico`**, el público simulado (idea de MiroFish), con `node motor.mjs publico` y su prueba. |
| **Nuevas peticiones para Gemini y ChatGPT** | Hecho | <ul><li>Gemini: G‑H10 a G‑H13.</li><li>ChatGPT y Codex: C‑M23 (red vial), C‑M24 (ayuda para niños), C‑M25 (portada con Hallmark) y C‑A12 (tráiler con HyperFrames).</li><li>Todo en `TAREAS-IA.md`.</li></ul> |



---

# ANEXO A. Manual (`docs/MANUAL.md`)


> **Para todas las IAs:** el documento único `docs/DOCUMENTO-UNICO.md` tiene el contexto, el código exacto y el plan de cada una.

Este manual explica para qué sirve el motor, qué contiene, cómo se usa, cómo sacarle el máximo provecho y qué hacer si falta algo.

> **Para quién:** el autor, las IAs de cada juego y cualquier persona que llegue.
> **Lo técnico al detalle:** `MOTOR.md`.

### 1. Para qué sirve
Motor City convierte **cualquier lugar real** (un país, una ciudad, un pueblo o una cuadra) o **uno inventado** (un valle, una isla o un planeta entero) en un **mundo jugable con leyes reales**. Encima, cada juego pone su piel, su trama y sus mecánicas.

Sirve para:
- **juegos**: los cuatro que vienen y los que se le ocurran;
- **simuladores**: movilidad, educación vial, riesgo y urbanismo;
- **experiencias educativas**: física, química, biología y economía jugables;
- **turismo**: pueblos jugables.

Funciona en **un solo HTML**, sin internet y en cualquier celular.

### 2. Qué contiene (el mapa del motor)
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

### 3. Cómo se usa (cinco recetas)
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

### 4. Cómo sacarle el máximo provecho
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

### 5. Qué hacer si falta algo
1. **Mira si ya existe:** busca en este manual, en `MOTOR.md` y en `js/` (cada archivo empieza con lo que hace).
2. **Si es de un solo juego**, va en el juego (su `juego.js`), no en el motor.
3. **Si otros juegos lo pueden usar**, pídeselo a una IA así:
   > «Lee `CONTRIBUIR.md` y la skill `motor-city-desarrollo`, crea el módulo con `node motor.mjs nuevo modulo nombre`, con sus pruebas, y deja un reporte con `node motor.mjs reporte`».
4. **Si es arte**, pídelo a Gemini o ChatGPT con las reglas del documento único (§10): un solo documento, sprites en atlas con fondo magenta o transparente, y medidas en metros. Cuando llega, va a `arte/<ia>/` y se instala con `MC.Pieles.instalar`.
5. **Si es un dato real** (un precio, una cifra científica), va con su **fuente** en el código y su **prueba** con el valor conocido (skill `motor-city-ciencia`).
6. **Si algo falla en el celular**, anota el modelo y lo que pasó. Con `MC.Ocurrencias.exportar()` y `MC.GPU.perfil()` la IA del motor lo reproduce.

### 6. Comandos
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

### Guardado por sectores

`MC.GuardadoSectores` guarda cambios JSON asociados a IDs estables y a sectores del mundo. La aplicación decide qué objetos crear o retirar cuando `actualizar` informa las claves que despiertan y duermen. Cada instantánea tiene `schema_version`, identificador del mundo y lado del sector en metros.

```js
const sectores = new MC.GuardadoSectores({ mundo: 'guatape', lado: 128 });
const id = MC.GuardadoSectores.id('guatape', 'valla', 'calle-27-valla-1');
sectores.cambiar(70, 20, id, { rota: true });
const actividad = sectores.actualizar(70, 20, 1);
sectores.guardar('mi-juego.sectores');
const vuelta = MC.GuardadoSectores.leer('mi-juego.sectores');
console.log(vuelta.obtener(70, 20, id));
```

`guardar` devuelve `false` si el almacenamiento falla. `leer` devuelve `null` si no existe el dato y lanza un error para datos inválidos o versiones futuras. Para migrar una versión previa se pasa a `leer` o `restaurar` un objeto de funciones por número de versión. Cada función recibe una copia y debe aumentar `schema_version` exactamente en uno. El administrador conserva cambios, mientras el juego debe conectar los eventos y aplicar los datos al despertar cada sector.


---

# ANEXO B. Contrato técnico (`MOTOR.md`)


**Versión 2.10.0 · 20‑nov‑2026.** Documento único con todo: `docs/DOCUMENTO-UNICO.md`. Fuente de verdad: `juanfeliperico369-stack/motorcity`. Copias: `motor-city/` de Juega EnCicla y de El Metro, con `herramientas/sincronizar.mjs`. Cómo se usa: `docs/MANUAL.md`.

**Qué es.** El motor de mundo abierto que convierte cualquier lugar real (Medellín, Guatapé, cualquier ciudad) o inventado (un valle, una isla, un planeta) en un mundo jugable con leyes reales:

- **un solo mundo**, en un solo archivo de datos (MC4);
- **un solo personaje** y **un registro de vehículos**;
- **todas las vistas**: cenital, pixel, ciudad 3D, maqueta 2:1, panorámica de perfil, tercera y primera persona, dron y cine;
- **las mismas reglas del mundo**: reloj, calendario, cielo, clima, tráfico, semáforos y transporte con horario;
- **Run en la ciclovía**.

Cada juego conserva lo suyo y solo pone su piel: formas de juego, apartados, arte, trama y huevos de pascua.

### 1. Reglas
1. **El mundo solo se cambia aquí.** Una corrección del mapa (una calle, un puente, un edificio o una estación) va en `motorcity`: en `geo/`, en `herramientas/fusionar.mjs` o en `ciudades/<id>.json`. Luego se sube la versión y se sincroniza.
2. **Cada cambio sube la versión** en `VERSION.json` (*semver*). Se copia a los juegos con `node herramientas/sincronizar.mjs ../BicicletasUno` (o `../MetroZero`), que lo deja en `motor-city/`. Con `--verificar` debe decir «los archivos son iguales».
3. **Lo de cada juego no entra al motor:** su trama, sus modos, sus menús y su arte final. El motor ofrece *hooks* (sección 6) y datos. Si un dato sale de las mismas fuentes, puede vivir en el motor para que todos lo usen.
4. **Un solo HTML por juego, sin internet ni librerías.** El motor es JavaScript puro con Canvas 2D y WebGL 1. Si falta WebGL, Canvas 2D es el respaldo.
5. **No romper guardados:** con `MC.guardado.completar(guardado, porDefecto)`, los campos nuevos llevan su valor por defecto.
6. **Fluido en un celular medio:** con la CPU 4× más lenta, la mediana del dibujo debe quedar por debajo de 40 ms (ver `node pruebas/prueba.mjs --navegador`). La calidad automática baja o sube el detalle.
7. **Español de Colombia, para todo público, sin datos personales.**
8. **Atribución siempre:**
   - © colaboradores de OpenStreetMap (ODbL), vía Overture Maps;
   - huellas de edificios de Overture (OSM, Microsoft y Google);
   - capas oficiales de Medellín: Catastro, malla vial y barrios;
   - relieve SRTM (NASA, AWS Terrain Tiles).
9. **Compatibilidad 1.x:** `js/valle.js` sigue siendo el lector 1.2.0 que incluye Juega EnCicla (sus pruebas exigen `Valle.version === '1.2.0'`). **No se edita.** Lo nuevo va en los fragmentos numerados.

### 2. Comandos
| Comando | Qué hace |
|---|---|
| `node motor.mjs mundo` | **F1**: junta los datos de EnCicla (`../BicicletasUno`) y de El Metro (`../MetroZero`) en `datos/<ciudad>/mundo.mc4` y `resumen.json`. |
| `node motor.mjs construir` | `dist/motor.js` (el motor), `dist/mundo-<ciudad>.js` (el mundo en base64) y `dist/motor-city.html` (el banco de pruebas jugable). |
| `node motor.mjs run` | Vuelve a importar Run Scooter de `../RunRunZero` a `run/run-scooter.js`, con sus parches comprobados. |
| `node motor.mjs prueba [--navegador]` | Las pruebas del motor: datos, consultas, redes, tiempo, transporte, tráfico, física y vehículos. Con `--navegador`, también las 8 vistas, Run y el rendimiento. |
| `node motor.mjs sincronizar RUTA [--verificar]` | Copia el motor a `RUTA/motor-city/`, o solo compara. |
| `node motor.mjs nuevo juego\|modulo nombre` | Crea un juego o un módulo desde su plantilla. |
| `node motor.mjs reporte "título" --juego X` | Reporte obligatorio de un cambio hecho desde otro juego. |
| `python3 geo/territorio.py --id x --bbox=…` | Craquea un lugar real (Overture + SRTM) a `datos/x/mundo.mc4` y `ciudades/x.json`. |
| `node motor.mjs fuentes \| encicla \| elmetro RUTA \| version` | La tubería 1.x de siempre (`geo/*.py`), que genera los datos que hoy leen los juegos. |

### 3. Coordenadas
- **Unidad:** metros del mapa, desde el origen de la ciudad (`lon0`, `latN`). `x` va hacia el oriente y `y` hacia el sur. La altura es la cota (m s. n. m.) más lo que se levanta.
- **Casilla:** `tile` m (10 en el valle). Casilla de un punto: `x / tile`. Las capas de celda van cada 8 casillas (80 m).
- **Grados:** `x = (lon − lon0) · kx` y `y = (latN − lat) · ky`, con `kx = 111320 · cos(lat_ref)` y `ky = 110574` m por grado.
- **Juega EnCicla dibuja en px:** 1 m = 1,6 px. `MC.ValleCompat.desdeMundo(mundo, 16)` le da las consultas 1.x en px.
- **El Metro dibuja en metros:** usa el mundo tal cual.

### 4. El mundo 2.0 (contenedor MC4)
```
'MC4\0' · u32 largo de la cabecera · cabecera JSON · capas (cada una en deflate crudo)
```
La cabecera trae `W`, `H`, `tile`, `lon0`, `latN`, `kx`, `ky`, `atribucion` y `capas: { nombre: { o, n, raw, tipo, sha1, … } }`. El cargador las infla **cuando alguien las pide**.

| Capa | Tipo | Qué es | Origen |
|---|---|---|---|
| `suelo` | u8 W×H | Tipo de casilla `TT` (pasto, monte, ladrillo, edificio, calle, avenida, andén, ciclorruta, agua, quebrada, plaza, puente, estación, pista, autopista, patio, escalas) | EnCicla `valle.bin` |
| `relieve` | i16 cada 80 m | Cota en metros (SRTM) | EnCicla |
| `municipio`, `comuna`, `barrio`, `pisos`, `lotes` | por celda de 80 m | Divisiones oficiales, pisos del edificio más alto y lote mediano | EnCicla + capas oficiales |
| `nivel` | i8 W×H | **Nivel firmado por casilla**: lo que pasa por encima (puente 1–2, viaducto 2–3) o por debajo (deprimido −1). 1 nivel = 4,5 m. | Puentes de El Metro + viaducto de EnCicla sobre los rieles reales |
| `vias` | VIAS3 | 35.746 vías con su curva, su clase, su nombre, su nomenclatura y su ancho | EnCicla `vias.bin` |
| `sitios` | SIT4 | 1.203 sitios y 5.314 edificios con su forma real (también con patio), y las partes de los emblemáticos (el Coltejer, la Biblioteca España…) | EnCicla `sitios.bin` |
| `edificios` | ED1 (regiones de 640 m) | **Las 639.457 huellas**, con su forma, orientación, pisos y uso | El Metro `edificios.js` |
| `pasos` | JSON | 2.193 puentes, deprimidos y tramos de viaducto como vectores: tipo, nivel, ancho, alto y si es peatonal | El Metro + EnCicla |
| `transporte` | JSON | 31 líneas (metro, tranvía, cables, Metroplús, alimentadores y futuras) con estaciones, eje real (rieles y corredores), andenes y datos; 133 estaciones EnCicla | El Metro `red.js`, `rieles.js`, `metroplus*.js`, `rutas_calles.js` + EnCicla |
| `lugares` | JSON | 45 lugares con postal (EnCicla) y 30 hitos con su huella y su altura (El Metro), enlazados | Los dos |
| `trafico` | JSON | 754 carriles con su sentido y 649 semáforos | EnCicla |
| `info` | JSON | Nombres (barrios, comunas, municipios, calles y sitios), el río, los parques y las líneas del dibujo de EnCicla | EnCicla |

**Las reglas de estilo de la ciudad** van aparte, en `ciudades/<id>.json`:

- la ventana, la casilla y la atribución;
- las **zonas de estilo** (ladera, centro, Laureles, El Poblado, mixto, pueblo, industria, campus y rural), con muros, techos, plancha, tanques, teja, árboles, densidad y pisos;
- la zona de cada comuna y de cada municipio;
- el horario del transporte y el clima del lugar.

### 5. El motor en el navegador (`dist/motor.js` → `MC`)
Se incluye con un `<script>` (o pegado en el HTML único) **antes** del código del juego. Solo publica `MC`, y `Valle`/`MotorValle` si no existían.

| Módulo | Archivo | Lo principal |
|---|---|---|
| Núcleo | `00-nucleo.js` | Utilidades (`clamp`, `h2`, `Azar`, colores); `MC.on/emit`; `MC.arte` (pieles); `MC.modulos`; `MC.huevos`; `MC.guardado` |
| Mundo | `10-mundo.js` | `await MC.Mundo.cargar(b64, ciudad)`: `suelo`, `cota`, `pendiente`, `normal`, `nivel`, `solido`, `superficie`, `esCiclovia`, `municipio`, `comuna`, `barrio`, `zona`, `estilo`, `lugarTexto`, `vias`, `viaCercana`, `calle`, `edificiosRegion`, `edificiosEn`, `edificioEn`, `sitios`, `pasos`, `pasosEn`, `transporte`, `lugares`, `hitos`, `lugarCercano`, `estacionCercana`, `enciclaCercana`, `buscar`, `geoAMetros`, `metrosAGeo` |
| Redes | `11-red.js` | `mundo.red('ciclo'\|'calles'\|'rueda'\|'peaton')`: grafo con nodos en los cruces; `cercana`, `opciones`, `continua`, `camino` (A\*), `componentes`. `MC.Trazo` (polilínea con `at`, `rumbo`, `curva` y `proyectar`). `MC.Recorrido` (camino sin fin que en cada cruce sigue la que continúa o la elegida). |
| Tiempo | `20-tiempo.js` | `MC.Reloj` (minutos del día y velocidad), `MC.Calendario` (festivos de Colombia, Ley Emiliani y fiestas), `MC.Cielo.en(fecha, hora, clima)` (colores, sol, luna, día y noche), `MC.Clima` (el mismo para todos a la misma hora; `forzar`) |
| Tráfico | `21-trafico.js` | `MC.Trafico`: carros, taxis amarillos, motos, busetas, camiones y ciclistas, con semáforos reales que nunca dan verde a las dos calles; peatones en los andenes |
| Transporte | `22-transporte.js` | `MC.Transporte`: metro, tranvía, Metroplús, alimentadores y cables, con **horario real**, deterministas (`vehiculos(fecha, seg, caja)`, `proximo(línea, estación, …)`) |
| Personaje | `30-personaje.js` | `MC.Personaje.aspecto()` y `azar()`; `pose(estado, fase, op)` (articulaciones en metros); dibujos de lado y cenital de la piel del motor |
| Vehículos | `31-vehiculos.js` | `MC.Vehiculos.registrar(def)` (hereda de `de`), `get`, `de(juego)`, `suelo`, `loma`. 35 vehículos: a pie, bici EnCicla, eléctrica, BMX, montaña, ruta, patinete, scooter, monopatín, monociclo, skate, longboard, patines, quad, triciclo, jetpack, moto, carro, taxi, camión, buseta, deportivo, fórmula, óvalo, drift, todoterreno, avioneta, avión, lancha, surf, metro, tranvía, cable y Metroplús |
| Física | `32-fisica.js` | `MC.Cuerpo`: suelo, pendiente real (las eléctricas no sufren), choques con lo sólido y con las huellas reales, puentes que se suben por sus extremos con baranda, deprimidos, saltos, vuelo y agua |
| Controles | `33-controles.js` | `MC.Controles(elemento, { alGesto })`: teclado, joystick virtual, gestos (pellizco, giro e inclinación) y gamepad; `leer()` una vez por cuadro |
| Cámara | `34-camara.js` | `MC.Camara`: la misma para todas las vistas; perfiles `primera`, `tercera`, `dron`, `cine` y `aerea`; `gesto`, `actualizar`, `aPantalla`, `aMundo` |
| Dibujo | `40-dibujo.js` | `MC.Losas`: losas de 160 m en caché. Llevan suelo suave con el sombreado del relieve, vías en vectores, canchas, piscinas, árboles por zona y techos reales. Son **el mismo mapa en todas las vistas**. |
| Vistas | `41`–`46` | `MC.Vistas(mundo)`: `usar(id)`, `siguiente()`, `pixel`, `dibujar(g, W, H, escena, dt)`, `calidad` (automática). Vistas: `cenital`, `ciudad3d`, `maqueta`, `pano`, `tercera`, `primera`, `dron` y `cine`. |
| Seguir la ruta | `47-seguir.js` | `MC.SeguirRuta(mundo, cuerpo)`: el cuerpo va solo por la vía real (panorámica, Run y paseo). Tiene `paso`, `avanzar`, `girar(±1)` y `cruceProximo()`. |
| Run | `50-run.js` | `MC.Run.puede(mundo, cuerpo)` y `MC.Run.entrar({ mundo, cuerpo, reloj, clima, aspecto, lienzo, capa, hud, alSalir })` |

**Módulos de la 2.1 y la 2.2:**

| Módulo | Archivo | Lo principal |
|---|---|---|
| Ciencia | `02-ciencia.js` | `MC.Ciencia`, `MC.Fis` (ISA, arrastre, sustentación, rodadura, choques, proyectiles), `MC.Termo` (rocío, índice de calor, sensación térmica), `MC.Quim` (masa molar, balanceo exacto, gases, pH, combustibles) |
| Economía | `03-economia.js` | `MC.Dinero` (centavos), `MC.Libro` (partida doble: `mover`, `saldo`, `cuadra`), `MC.Mercado`, `MC.Finanzas` |
| Escala | `04-escala.js` | `MC.Escala.MEDIDAS` (medidas reales), `validar()`, `pxPorMetro`, `escalaSprite`, `proporcion` |
| GPU virtual | `05-gpu.js` | `MC.GPU.perfil()` y `ajustes()`, `MC.ResDinamica`, `MC.Bucle` (paso fijo con interpolación), `MC.resorte` y `resorteAng` |
| Generador | `12-generador.js` | `MC.Generador.mundo({ semilla, tipo, ancho, alto, pueblos, lat })` |
| Cosmos | `13-cosmos.js` | `MC.Cosmos.estrella(u, g, n)`, `planeta(E, i)`, `mundoDe(P)`, `criaturaDe(P)`, `altura(semilla, x, y)` (relieve infinito) |
| Ambiente | `24-ambiente.js` | `MC.ClimaGlobal({ lat, alt })` (estaciones, nieve, niebla, calor), `MC.Ambiente.agarre`, `estacion`, `horasLuz` |
| IA | `25-ia.js` | `MC.IA` (utilidad, árboles de comportamiento, dirección de Reynolds, `vSegura`), `MC.Poblacion` (gente con rutinas) |
| Seres | `35-seres.js` | `MC.Seres.Persona` (biología y genética), `MC.Seres.Animal` (alometría, `criatura` con verosimilitud) |
| Taller | `36-taller.js` | `MC.Taller.disenar(ficha)` → desempeño real; `registrar`; carro con derrape |
| Manejo | `37-manejo.js` | `MC.Manejo.aplicar(entrada, cuerpo, { camara, esquema, vista, rumboVia, curvaAdelante })`, `curva`, `giroPorVelocidad`, `ESQUEMAS`, `rutaA` y `seguirRuta` (tocar para ir), `activarInclinacion` |
| Sprites | `38-sprites.js` | `MC.Sprites.atlas(id, { imagen, cuadros, anim, metros })`, `dibujar(g, 'atlas/nombre', x, y, pxm, { t, fase, rumbo, dir, pixel, respaldo })`, `nueve`, `hornear`, `comoArte` |
| Raster | `44-raster.js` | `new MC.Raster(mundo).dibujar(g, W, H, escena)`: la 3D por software |
| Interiores | `48-interiores.js` | `MC.Interiores.generar(edificio, { programa, estilo, semilla })`, `ESTILOS` (8), `CATALOGO` (22), `cabe`, `dibujar`; programas de casa, apartamento, comercio, oficina, iglesia, colegio, bodega, taller, tienda, centro comercial, biblioteca y restaurante |
| Mi casa | `49-hogar.js` | `MC.Direccion.leer(texto)` y `ubicar(mundo, texto)` (nomenclatura colombiana → edificio real); `MC.Hogar.desdeDireccion`, `plano`, `estilo`, `comprar`, `poner`, `mover`, `girar`, `quitar`, `guardar` |
| Música | `60-musica.js` | `MC.Musica.componer`, `tocar`, `adaptar`, `CLASICOS` |
| Interfaz | `70-interfaz.js` | `MC.UI.crear(raiz, { tema })`: `ficha`, `boton`, `barra`, `aviso` (en cola), `mision`, `dialogo`, `menu`, `minimapa`, `foco`, `cine`, `zonaLibre`; `MC.UI.verificar(ui)` |
| Mecánicas | `80-mecanicas.js` | `MC.Mision`, `MC.Inventario`, `MC.Carrera`, `MC.Logros`, `MC.Dialogo` |
| Lugares | `82-lugares.js` | `MC.Lugares.en`, `cerca`, `hacer(lugar, actividad, ctx)`, `interior`, `TIPOS`; `MC.Desgaste` (usar, reparar, mejorar, aplicar) |
| Ondas | `14-ondas.js` | `MC.Ondas.resolver({ ancho, alto, fichas, compat, fijos, semilla })` (WFC), `fachada(pisos, cols, semilla)`, `fachadaCache`; `MC.Autotile.mascara4`, `mascara8`, `esquinas`; `MC.RejillaIrregular.crear({ anillos, lado, semilla })` |
| Terreno | `15-terreno.js` | `MC.Terreno.agua(M)` (cuerpos de agua: mar, lago, río, quebrada; distancia a la orilla), `aguaEn(M, x, y)` (tipo y profundidad), `pendiente`, `en`, `paso(cuerpo, x, y)` (reglas por clase con motivo: vadear, nadar, barrancos, roca, monte, arena, nieve, borde), `sitioEn`, `arbolLosaEn`, `obstaculo`; `PEND_MAX`, `AGUA_MAX` |
| Naturaleza | `28-naturaleza.js` | `MC.Naturaleza.en(M, x0, y0, x1, y1)`: rocas, palmas, frailejones, arbustos y juncos con azar fijo por material, pendiente, altura y agua; `objeto(D, p)` (gancho de arte `naturaleza`) |
| Urbe | `26-urbe.js` | `new MC.Urbe(mundo, { libro, centro, caja, alCambiar })`: `zonificar(tipo, x, y, r, dens)`, `quitarZonas`, `servicio(tipo, x, y)`, `avanzar(meses)`, `demanda()`, `valorEn`, `campoEn`, `capa(nombre)` (→ `E.capaInfo`), `resumen`, `guardar`; `MC.ZONAS_URBE`, `MC.SERVICIOS_URBE` |
| Mobiliario | `27-mobiliario.js` | `MC.Mobiliario.en(mundo, x0, y0, x1, y1)`: postes, árboles, bancas, canecas, paraderos, hidrantes y cebras por vía (las vistas 2D lo dibujan solo; gancho de arte `prop`) |
| Sombras | `39-sombras.js` | `MC.Sombras.vector(cielo)`, `poligono`, `dibujar2D`, `contacto` y `luces` (las vistas 2D y el raster las usan solas) |
| Paisaje | `61-sonido.js` | `MC.Paisaje.plan(ctx)` (puro), `tocar`, `actualizar` y `parar` |
| Necesidades | `86-necesidades.js` | `MC.Necesidades` (`ANUNCIOS`, `urgencia`, `puntaje`, `ambiente(plano)`), `new MC.Habitante(plano, { semilla })` con `paso(dt, minPorSeg)`; `MC.Hogar.ambiente()` |
| Mundo (2.3) | `10-mundo.js` | `mundo.agregarEdificio({ x, y, hw, hd, ang, pis, clase })` y `quitarEdificio`; `vistas.losas.invalidar(x0, y0, x1, y1)` |
| Historias | `85-historias.js` | `MC.Historias` (storylets con pilares, `elegir`, `encargo`), `MC.Director` (ritmo y dificultad), `MC.Ocurrencias` (vigilar, rescatar, exportar) |

**La escena** que reciben las vistas: `{ mundo, camara, reloj, clima, cielo, transporte, jugador: { cuerpo, aspecto }, vehiculos, trafico, peatones, cables, pano: { trazo, s, id }, extras: [{ x, y, dibujar }], t }`. El banco de pruebas (`sandbox/10-juego.js`) es el ejemplo completo de un juego sobre el motor, en unas 150 líneas.

### 6. La piel de cada juego (hooks de arte)
```js
MC.arte.registrar('encicla', {
  suelo: [...17 colores por TT], via: { asfalto, anden, ciclo, … },
  personajeLado(g, pose, aspecto, x, y, pxPorMetro, dir) { … },   // panorámica, 3D oblicua y maqueta
  personajeArriba(g, pose, aspecto, x, y, pxPorMetro, rumbo) { … }, // cenital
  vehiculoLado(g, vehiculo, x, y, pxPorMetro, dir, cuerpo) { … },
  jugador(g, j, x, y, z, P, D) { … return true },                  // reemplaza todo el dibujo del jugador en 2D
  jugadorLado(g, j, x, y, esc, dir) { … return true }               // ídem en la panorámica
}).usar('encicla');
```
- Lo que el juego no traiga lo dibuja el motor.
- Los dibujos de lado reciben la **pose** del esqueleto único: un mismo personaje en todas las vistas, vestido por cada juego.
- Las zonas de estilo (`ciudades/<id>.json`) mandan en los colores de muros y techos. Un juego puede sobrescribirlas al cargar la ciudad.

### 7. Las vistas, una por una
- **Cenital:** losas, objetos encima y techos con sombra. Se gira con dos dedos.
- **Lateral (2.2):** la misma proyección inclinada de 1,2 a 1,47 rad. Muestra cielo arriba, el corte de la tierra abajo y una franja de calle con profundidad: una casa de muñecas, como *Little Nightmares*. Gira de a 90° con animación (`camara.girar90`), como *FEZ*. La ciudad 3D también se inclina con dos dedos hasta quedar de lado. Lo que tapa al jugador se vuelve transparente (rayos X).
- **Ciudad 3D:** la misma proyección inclinada. Los edificios se levantan con su huella y su altura reales, y tienen ventanas que se encienden de noche. Lleva puentes y viaducto con pilas, y vehículos con volumen.
- **Maqueta 2:1:** dimétrica (giro de 45° más múltiplos de 90°, aplastado 0,5 y altura 0,82), como la maqueta de El Metro.
- **Panorámica de perfil (cuidado especial).** Junta la de El Metro y la de EnCicla:
  - cielo por hora, con el sol y la luna donde de verdad están;
  - nubes, gallinazos, lluvia, niebla y rayos;
  - cordillera, cerros y laderas con barrios que se encienden de noche (densidad tomada de lo construido de verdad);
  - ciudad media y emblemáticos con su silueta (el Coltejer con su aguja);
  - viaducto y trenes reales, y cables con sus cabinas balanceándose;
  - fila de edificios del frente real, con su huella, su altura, su zona y sus ventanas;
  - cruces con su nombre, árboles, faroles, estaciones EnCicla y del metro;
  - tráfico y gente de perfil;
  - el jugador en cualquier vehículo y un primer plano real.

  El fondo se mira por un eje suavizado, así que las esquinas no hacen saltar las montañas. Funciona con el celular vertical y acostado.
- **Tercera y primera persona, dron y cine (WebGL):**
  - relieve real, con malla de 20 m cerca y de 240 m para las montañas del valle;
  - el suelo es la losa (texturas potencia de 2 con mipmaps y filtro anisótropo);
  - edificios, sitios, emblemáticos por partes, puentes, viaducto y árboles;
  - personaje con la misma pose, trenes, cabinas, tráfico y gente;
  - luz del sol por hora, niebla por clima y detalle por distancia.
- **Pixel:** cualquiera de las vistas, dibujada en un búfer de un tercio y agrandada sin suavizado.
- **Transición:** fundido de 0,55 s en el mismo punto.

### 8. Run en la ciclovía
- `run/run-scooter.js` es RunRunZero casi idéntico: motor WebGL, modelos, escena, reglas y audio. Lo arma `herramientas/importar-run.mjs`, con **12 parches con nombre y comprobados**:
  - relieve real en el sombreador (64 alturas);
  - curvas reales;
  - esquinas en los cruces reales: al doblar, se dobla en el mundo;
  - cielo y lluvia del mundo.
- `MC.Run.entrar(...)`:
  - solo en la ciclovía y con un vehículo que corra Run;
  - sigue la ciclorruta real y, en cada cruce, la que continúa (si se acaba, la calle);
  - las curvas fuertes giran la cámara;
  - se puede parar, ir a pie o correr, y cambiar de vehículo;
  - un metro del corredor son 0,5 m reales;
  - al salir, el cuerpo queda en el punto real donde iba, a la misma hora y con el mismo clima.
- Las metas y los retos de Run Scooter siguen andando: monedas, trucos, entregas, rivales y poderes.

### 9. Reglas del mundo (F5)
| Regla | Cómo funciona |
|---|---|
| **Reloj** | Un minuto de juego por segundo real (configurable). |
| **Calendario** | Festivos de Colombia con la Ley Emiliani (Pascua calculada) y fiestas de la ciudad. |
| **Cielo** | Colores por hora; sol y luna astronómicos para la latitud. |
| **Clima** | Bloques de 3 h con azar fijo por fecha, según la probabilidad del mes y la hora (temporadas de lluvia y aguaceros de la tarde). Es igual para todos a la misma hora. |
| **Transporte** | Lunes a sábado, de 4:30 a. m. a 11 p. m.; domingos y festivos, de 5 a. m. a 10 p. m. Frecuencias de hora pico y de valle; parada en cada estación. Las cabinas van cada 12 s. |
| **Tráfico** | Agentes alrededor del jugador. Semáforos de 60 s con fase fija por cruce; frenan en amarillo y en rojo, y guardan distancia. |
| **Huevos** | `MC.huevos.poner({ id, x, y, radio, hora, vehiculo, cond, juegos })`. El motor avisa con `MC.on('huevo')` una sola vez. |

### 9b. Física de niveles (2.2)
- **Superficies:** el terreno y los tableros (con su rampa) en cada punto.
- **Apoyo:** el cuerpo se apoya en la más alta que quede a un escalón (0,5 m a pie, 0,35 m con ruedas, más lo que avanza en el cuadro).
- **Pared:** lo que queda entre los pies y la cabeza no se atraviesa.
- **Por debajo:** lo que queda arriba de la cabeza se pasa por debajo.
- **Caída:** sin apoyo, cae con gravedad.
- **Barandas:** no dejan salir del tablero.
- **Deprimidos:** solo se entra por sus extremos.
- **Salto:** tiempo de coyote (0,12 s) y memoria del botón (0,14 s).

### 10. Hoja de ruta (lo que sigue)
- **2.1:** precalcular las redes en el MC4 (hoy `red('rueda')` tarda alrededor de 1 s al arrancar). Guardar el ancho y la nomenclatura de las ciclorrutas. Sumar `geo/pasos.py` (niveles firmados de Overture) y conectarlo al GPS de dos niveles.
- **2.2:** sombras del sol en WebGL. Agua animada del río. Ventanas con textura. Árboles por especie. Atlas del arte que entreguen Gemini y ChatGPT (`MC.arte`).
- **2.3:** Motor City (carreras), con la física de carro con derrape, motos, aviones y lanchas ya registrados (sección 5). Pistas de carrera sobre la red real y repeticiones.
- **3.0:** otra ciudad completa con la receta de `docs/CIUDADES.md`.

### Historial
| Versión | Fecha | Qué cambió |
|---|---|---|
| 1.0.0 | 18‑nov‑2026 | Una tubería con dos resoluciones, el exportador a El Metro, el sincronizador y el contrato (BicicletasUno). |
| 1.1.0 | 18/19‑nov‑2026 | Túneles y deprimidos; el lector `valle.js`; la fachada de El Metro. |
| 1.2.0 | 19‑nov‑2026 | Une las dos 1.1.0 con la fuente de verdad en BicicletasUno. |
| **2.10.0** | 20‑nov‑2026 | <ul><li>`MC.Publico` (`js/92-publico.js`: `piloto(perfil, op)`, `informe(medidas)`, `lista()`, `PERFILES`) y `herramientas/publico.mjs`.</li><li>`Red.caminoEntre(inicios, metas)`; `Manejo.rutaA` sale por el extremo que conviene.</li><li>`Estilo._imprimirGPU`, `_filtros()` y `_umbral()`: cómic y 1 bit sin leer la pantalla, con tramado anclado al desplazamiento del mundo.</li><li>Respaldo de `toSorted`, `toReversed` y `Promise.withResolvers` en `00-nucleo.js`.</li><li>`herramientas/aligerar_arte.py` y `herramientas/skills-externas.mjs` (`node motor.mjs skills`).</li><li>Mandados: `MANDADOS.piloto`.</li></ul> |
| **2.9.0** | 20‑nov‑2026 | Unión de la 2.8 (Claude) con la 2.7.1 de Codex:<ul><li>`arte/chatgpt/` y `vehiculoArriba` en las pieles;</li><li>`textura` en las losas y `Vista2D.charcos`;</li><li>la capa `agua` en el MC4 (`herramientas/precalcular-agua.mjs`);</li><li>el estilo `unbit` (`Estilo.imprimir`, `ruidoAzul`);</li><li>la caché de fachadas en la maqueta;</li><li>`js/90-three.js` y `adaptadores/godot` y `adaptadores/three`.</li></ul>Los faros también salen con el vehículo de piel, y la cubierta sobre columnas pasa por la caché. 132 pruebas. |
| **2.8.0** | 20‑nov‑2026 | **De la entrega maestra de referencias** (`docs/referencias/`):<ul><li>`MC.Vida`: `palomas` y evento `fauna`, `marcas` (huellas por superficie), `suelo(E, x, y)`, `piso(D)` y `emitir` escalado por `MC.opciones.particulas`;</li><li>`MC.opciones` (`sacudida` y `particulas`; `Camara.sacudir` lo respeta);</li><li>`Vista2D.faros` y las luces de freno del jugador;</li><li>los estilos `vintage` (`tinte`, `final: 'vineta'`), `crt` (`final: 'crt'`) y `termica` (`gradiente`);</li><li>`js/90-telemetria.js` (`MC.Telemetria`: `registro`, `percentil`, `resumen`, `linea`);</li><li>`js/91-contratos.js` (`MC.Contratos.validar`) y `schemas/` (escena, puente y entidad, `schema_version: 1`);</li><li>`schema_version` en `Exportar.escena` y `Puente.instantanea`.</li></ul>125 pruebas. |
| **2.7.0** | 20‑nov‑2026 | **Estilos gráficos:** `js/16-estilos.js` (`MC.Estilo`: `p`, `rgb`, `col`, `luz`, `trama`, `final`, `lineas`, `lista`; `MC.ESTILOS_GRAF` con 8 estilos de datos; paletas de dominio público en `PAL_DP`). Las losas, los muros, los techos, las sombras (`MC.Sombras` usa `estilo.sombra`), el cielo lateral y los árboles (`Arboleda._copaEstilo`, un horneado por estilo) pasan por el estilo. **Vida:** `js/88-vida.js` (`MC.Vida.emitir`, `onomatopeya`, `impacto`, `dibujar`; bandadas, aterrizaje con `_squash` y evento `aterriza`, frenazos y agua) y `MC.Bucle` con `MC._pausaImpacto` (hitstop). El vehículo cabecea con `C._acel` y las copas se mecen de cerca (`E.viento`). **Exportar:** `js/89-exportar.js` (`MC.Exportar.glb`, `escena`, `alturas`, `r16`; `MC.Puente.instantanea`, `aGltf`) y `node motor.mjs exportar`. 123 pruebas. |
| **2.6.0** | 20‑nov‑2026 | **Estilo realista familiar:** `MC.estilo` (`'realista'` o `'clasico'`, en la clave de las losas). `js/29-arboleda.js` (`MC.Arboleda.en`, `dePie`, `arriba`, `sombras`, `mip`, `precalentar`; 6 especies, sprites horneados con mipmaps y copia nocturna; los mismos árboles que `Terreno.arbolLosaEn`). Las losas llevan una bandera `2` (sin árboles: van de pie desde z ≥ 3,2, o 4,2 con calidad < 0,9) y la sombra bajo la copa horneada. `MC.Rudeza` (grano, baldosa, `asfalto(g, v, res)`, `techo`, paleta). Humedad en la base de los muros desde z > 3,5. Gancho de arte `arbol(g, t, vista, x, y, pxm, D)` y parte `arbol` en `MC.Pieles` (`arboles: false` deja fuera los árboles del paquete). `node motor.mjs capturas` y `revisar-arte`. 119 pruebas. |
| **2.5.1** | 19‑nov‑2026 | **Arte de Gemini integrado:** `js/87-pieles.js` (`MC.Pieles.instalar(id, paquete, { partes, pixel, usar })`, `MC.Pieles.icono`, `MC.Pieles.faltan`). La construcción compila `arte/<id>/` dentro del HTML con `"arte": ["<id>"]` en `juego.json`, y suelto en `dist/arte/<id>.js`. Las capas de `MC.Urbe` traen `titulo` y `leyenda`, y hay `ui.leyenda`. **Jugable en el celular:**<ul><li>`ui.joystick(ctl, op)` y `ui.pintarJoystick()`: joystick visible que sigue al dedo, con guía «Arrastra para moverte»;</li><li>`ui.accion({ id, icono, texto, mantener, ctl, al })`: botones redondos para el pulgar, que al mantenerse alimentan `ctl.boton`;</li><li>`ui.barraVisible`;</li><li>`MC.UI.indicador(g, W, H, sx, sy, op)`: el pin o la flecha al objetivo, con `op.rect` para no tapar la interfaz;</li><li>`ui.mision` con el título en una línea y el detalle en dos;</li><li>marca del jugador en las vistas 2D (`E.marcaJugador`);</li><li>`Losas`: resolución hasta 6 y presupuesto de píxeles.</li></ul>Mandados: cámara de unos 45 m en el lado corto, modo libre (todo gratis, 34 vehículos), menú Vista y menú Ajustes, tutorial, y el primer mandado cerca. 118 pruebas. |
| **2.5.0** | 19‑nov‑2026 | **Entrar al agua:** `cuerpo.bajarse`, `montar` y `puedeMontar` (vehículo parqueado en la orilla, también solo al empujar hacia lo hondo), nado con **buceo** y **aire** (`buceando`, `aire`, `pulmones`, evento `sinAire`), poses `nada` y `bucea`, `embarcar` y `desembarcar` (lancha), `Terreno.aguaHonda` y `tierraFirme`. Tono bajo el agua, burbujas y vehículo parqueado en las vistas. 117 pruebas. |
| **2.4.0** | 19‑nov‑2026 | Terreno y límites verosímiles: agua por tipo y profundidad (vadear, nadar; lancha con calado), pendiente máxima fuera de las vías, roca, monte, arena y nieve por vehículo, obstáculos reales (emblemáticos, árboles de las losas, mobiliario, rocas, tráfico y gente) y edificios también sobre la calle si uno se mete de verdad. Naturaleza. Lagos por llenado de prioridad en el generador y mar a nivel 0. Agua por profundidad, espuma y roca de acantilado en las losas; brillos del agua; vadear y nadar visibles. 115 pruebas. |
| **2.3.0** | 19‑nov‑2026 | Lo aprendido de SimCity, Los Sims, Cities: Skylines y Townscaper: sombras del sol por hora (2D y raster), mobiliario urbano y luces de noche, fachadas por reglas (WFC), `MC.Urbe` (zonas, demanda RCI, valor del suelo, servicios, contaminación, crecimiento, niveles, recursos, presupuesto y capas de datos), objetos inteligentes y `MC.Habitante`, `MC.Ondas`, `MC.Autotile`, `MC.RejillaIrregular` y `MC.Paisaje`. Ganchos de arte `prop`, `fachadaModulo` y `mueble`. Documento único. 109 pruebas. |
| **2.2.0** | 19‑nov‑2026 | GPU virtual (perfil, resolución dinámica, bucle de paso fijo y raster 3D por software). Física de niveles por superficies. Cámara con resortes, brazo con choque, FOV por velocidad y trauma. **Vista lateral.** Manejo (curvas, esquemas y asistencias), sprites, escala real, interfaz por zonas, interiores con 8 estilos y catálogo, **Mi casa** desde la dirección, lugares jugables y desgaste, historias con director, ocurrencias y cosmos. 103 pruebas. |
| **2.1.0** | 19‑nov‑2026 | Nombre: solo «Motor City» (carpeta `motor-city/`). Ciencia, economía, generador de mundos, territorios (`geo/territorio.py`), clima global, seres, taller, IA y población, interiores, música, interfaz y mecánicas. Minijuego Mandados, plantillas, reportes y skills. 80 pruebas. |
| **2.0.0** | 19‑nov‑2026 | **Motor City.** La fuente de verdad pasa a `motorcity`.<br>• Mundo 2.0 en un solo archivo (MC4), con todas las huellas, sitios, pasos con nivel, transporte, lugares y tráfico.<br>• El motor en el navegador: personaje, vehículos, física, controles, cámara, 8 vistas más pixel, panorámica de perfil, WebGL, reglas del mundo y Run en la ciclovía.<br>• Banco de pruebas jugable y 54 pruebas.<br>• La tubería 1.x sigue igual (y ya lee cualquier ventana de ciudad). |


---

# ANEXO C. Contexto para la IA que retome (`CONTEXTO-IA.md`)


> **Léelo completo antes de tocar nada.** Si se te acaba el contexto, este documento, `MOTOR.md` y `BITACORA.md` bastan para seguir.
> Lo escribió Claude (Claude Code) el 19‑nov‑2026, a pedido del autor (OneZero). La 2.0 sigue el *Plan del Mundo Abierto*; la 2.1 y la 2.2, los pedidos que vinieron después (ver §3b).
> Ese plan está en `docs/PLAN-MUNDO-ABIERTO.md` de BicicletasUno, rama `ccr-bed2d98a-uho2kr`.

### 1. La misión en una frase
**Motor City** convierte cualquier lugar real (o inventado) en un mundo jugable con leyes reales, para Juega EnCicla, El Metro y los juegos que vienen. Cada juego conserva su forma de juego, su arte y su trama, y solo pone su piel. El nombre es solo «Motor City»: nada de «del Valle».

**La visión del autor, a largo plazo:**
- ***Motor City***: un juego de carreras en mundo abierto, al estilo GTA, Forza Horizon y Need for Speed. Carros, motos, aviones, tuneo, carreras callejeras, NASCAR y F1, con una trama ruda pero simpática y estilo EnCicla. Gráficos 2D y pixel con vista cenital 3D y cámaras cambiantes.
- ***Extremo***: deportes extremos (downhill, BMX, skate, parkour, surf, lanchas…), con estética más realista.

El motor debe quedar como **terreno fértil** para esas semillas. Ver `docs/VISION-MOTOR-CITY.md`.

### 2. Los cuatro repositorios
| Repo | Qué es | Rama de trabajo de esta sesión | Notas |
|---|---|---|---|
| `juanfeliperico369-stack/motorcity` | **El motor (fuente de verdad desde la 2.0)** | `claude/motor-city-engine-xu7p4y` | Este repo. |
| `juanfeliperico369-stack/BicicletasUno` | Juega EnCicla v2.0.1 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-bed2d98a-uho2kr`) | Ignorar `revolucion-v2`. Al publicar en `gh-pages`, **conservar `/metro/`**. APK con `versionCode` > 20003. Sus pruebas: `node tests/run.js` (97 ✓). |
| `juanfeliperico369-stack/MetroZero` | El Metro v2.0.0 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-2a67f935-oat714` + `main`) | **Seguir su `CLAUDE.md`** (protocolo de 7 pasos). Sus pruebas: `node tools/test.mjs 100` (0 errores). |
| `juanfeliperico369-stack/RunRunZero` | Run Scooter v2.5.0 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-cbc7f0af-0306uo`) | Juego propio. **No depende del motor**: el motor lo importa (`node motor.mjs run`). Es WebGL propio, no Canvas 2D como decía el plan. |

**Cada juego tiene su propia IA.** Si tocas un juego, deja escrito qué cambiaste en su bitácora y en `docs/CONTEXTO-MOTOR-CITY.md` de ese repo. No hagas PR si no te lo piden y no subas llaves (*keystores*).

### 3. Lo que quedó hecho (2.0.0)
| Fase del plan | Estado | Dónde |
|---|---|---|
| **F1 · Mundo construido en un solo archivo** | ✅ | `herramientas/fusionar.mjs` → `datos/medellin/mundo.mc4` (16 capas, 6 MB; ver `MOTOR.md` §4). Cargador `js/10-mundo.js`. |
| **F2 · Personaje, vehículos, cámara, física y controles** | ✅ | `js/30` a `js/34`. |
| **F3 · Vistas** | ✅ | `js/40` a `js/46`:<br>• cenital, ciudad 3D y maqueta 2:1 (una sola proyección);<br>• **panorámica de perfil** (`43-panoramica.js`);<br>• WebGL de tercera y primera persona, dron y cine (`45-gl.js`);<br>• gestor con pixel, transición y calidad automática (`46-vistas.js`). |
| **F4 · Run en la ciclovía** | ✅ | `herramientas/importar-run.mjs` (12 parches) → `run/run-scooter.js`. El envoltorio es `js/50-run.js` y la ruta real la da `js/47-seguir.js`. |
| **F5 · Mismas reglas del mundo** | ✅ | `js/20-tiempo.js`, `21-trafico.js`, `22-transporte.js`, y los huevos en `00-nucleo.js`. |
| Banco de pruebas | ✅ | `sandbox/` → `dist/motor-city.html`. |
| Pruebas del motor | ✅ | `node pruebas/prueba.mjs --navegador`: 54 pruebas. |
| Sincronización | ✅ | `herramientas/sincronizar.mjs` y `sincronizar.mjs` (el atajo). Copia el paquete a `<juego>/motor-city/` (desde la 2.1; `motor-valle/` queda como estaba en cada juego hasta que su IA migre). |
| Migración de los juegos al mundo 2.0 | ⏳ **Le toca a la IA de cada juego** | Las guías son `docs/MIGRACION-ENCICLA.md` y `docs/MIGRACION-ELMETRO.md`. |
| Arte y auditoría de Gemini y ChatGPT | ⏳ **Pedido** | `docs/PETICION-GEMINI.md` y `docs/PETICION-CHATGPT.md`. Cada uno entrega un solo documento; el autor se lo pasa a la IA del motor para unirlo y mejorarlo. |

**Cifras medidas** (Chromium sin GPU, CPU 4× más lenta, 412 × 860): mediana del dibujo en cenital 4,1 ms, ciudad 3D 8,6 ms, maqueta 17,8 ms y panorámica 7,3 ms. La vista WebGL en SwiftShader (por software) da 70–90 ms; con GPU real debe ser mucho menor, pero **hay que medirla en un celular**.

### 3b. Lo que se hizo en la 2.1 y la 2.2
| Pedido del autor | Estado | Dónde |
|---|---|---|
| Crear gráficos, craquear territorios y crear mundos nuevos | ✅ | `geo/territorio.py` (Guatapé de ejemplo), `MC.Generador`, `MC.Cosmos` (planetas, semillas en jerarquía como No Man's Sky) |
| Física, química, economía y matemáticas fieles | ✅ | `02-ciencia`, `03-economia`, `04-escala` (medidas reales), `36-taller`, con pruebas de valores conocidos |
| Personajes con biología; animales y alienígenas | ✅ | `35-seres` (Mifflin, Froude, Kleiber, genética, cuadrado‑cubo) |
| Vehículos | ✅ | 35 en el registro + `MC.Taller` (diseñar con ingeniería) + `MC.Desgaste` (reparar y mejorar) |
| Mundo vivo (NPC, día y noche, estaciones, tormenta, nieve, calor, niebla, tráfico) | ✅ | `24-ambiente`, `25-ia` (`MC.Poblacion` con rutinas) |
| Interiores procedurales distintos entre sí | ✅ | `48-interiores`: 8 estilos, cuartos opcionales, decoración y catálogo de 22 muebles |
| **La casa del jugador por su dirección**, y diseñarla | ✅ | `49-hogar` (`MC.Direccion` lee la nomenclatura colombiana y la ubica en el mapa real, sin internet; `MC.Hogar` diseña) |
| Talleres, tiendas, centros comerciales, bibliotecas y parques | ✅ | `82-lugares` |
| Historias procedurales: diversión, reflexión y conciencia | ✅ | `85-historias` (storylets, director de ritmo, encargos) |
| Ocurrencias (lo imprevisto) y retroalimentación | ✅ | `MC.Ocurrencias` |
| Solución a la tarjeta gráfica | ✅ | `05-gpu` (perfil, resolución dinámica, paso fijo) y `44-raster` (3D por software) |
| Puentes y dimensiones complicadas; cámara; vista lateral | ✅ | `32-fisica` (superficies, coyote), `34-camara` (resortes, brazo con choque, FOV y trauma), vista `lateral` (casa de muñecas que gira de a 90°) |
| Sprites, interfaz que no estorba, controles y sensibilidad | ✅ | `38-sprites`, `70-interfaz` (zonas, atenuación, cola, `verificar`), `37-manejo` |
| Música (electrónica, rock, jazz, lo‑fi y clásicos) | ✅ | `60-musica` |
| Minijuego, HTML y link web | ✅ | `juegos/mandados` → `dist/juegos/mandados.html` · <https://juanfeliperico369-stack.github.io/motorcity/> (Pages sirve `main`) |
| Documentos | ✅ | `docs/MANUAL.md`, `GUIA.md`, `INVESTIGACION.md`, `OPTIMIZACION.md`, `PLAN-IAS.md`, `PETICION-*.md` y `NEGOCIO-Y-USOS.md` |
| Repo abierto a las IAs de los juegos, con reportes | ✅ | `CONTRIBUIR.md`, `AGENTS.md`, `reportes/`, `node motor.mjs reporte` |
| **2.3 · SimCity, Los Sims, Cities: Skylines y Townscaper** | ✅ | `39-sombras` (sol por hora), `27-mobiliario` (props y luces), fachadas WFC (`14-ondas`), `26-urbe` (ciudad y capas de datos), `86-necesidades` (objetos inteligentes), `61-sonido` (paisaje sonoro). Mandados con modo alcalde. |
| **2.4 · Montañas, rocas, agua (lagos, ríos, playa, mar) y límites de paso** | ✅ | `15-terreno` (agua, pendiente, reglas de paso, obstáculos), `28-naturaleza`, lagos en `12-generador`, agua y roca en `40-dibujo`; `MC.Cuerpo` vadea, nada y dice por qué no pasa |
| **2.5 · Entrar al agua** | ✅ | `MC.Cuerpo`: `bajarse`, `montar`, `_nadar` (buceo y aire), `embarcar` y `desembarcar`; poses `nada` y `bucea`; tono bajo el agua (`Vistas._bajoAgua`) |
| **Un solo documento con todo** | ✅ | `docs/DOCUMENTO-UNICO.md` (contexto, código a usar y plan de cada IA) y `dist/MOTOR-CITY-TODO.md` (con anexos; `node motor.mjs documento`) |

### 4. Decisiones que no hay que deshacer sin motivo
1. **El mundo 2.0 junta los datos ya generados** por los dos juegos, que comparten el mismo origen. Así no hacen falta los 190 MB de fuentes ni Python para tener el mundo. La tubería `geo/` sigue para regenerar desde cero (y ya acepta otra ciudad con `CIUDAD=ciudades/x.json`).
2. **Todo en metros** desde el origen de la ciudad. EnCicla convierte con 1 m = 1,6 px (`MC.ValleCompat.desdeMundo(m, 16)`).
3. **`js/valle.js` no se toca:** es el lector 1.2.0 que incluye EnCicla, y sus pruebas exigen esa versión. `construir.mjs` solo empaqueta los fragmentos numerados.
4. **Las losas (160 m) son el mismo mapa en todas las vistas.** También son el piso de WebGL.
5. **La panorámica mira el fondo por un eje suavizado** que pasa por el jugador. Si se usa el rumbo de cada punto, las montañas saltan en las esquinas.
6. **Run importa RunRunZero casi idéntico con parches comprobados.** Si RunRunZero cambia y un parche no calza, el importador lo dice y no escribe nada. No se copian su interfaz ni su guardado.
7. **Una sola red (`rueda`)** para el tráfico, la panorámica y Run, filtrando por tipo de vía.
8. **Determinismo compartido:** el clima, los trenes y los semáforos salen de la fecha y la hora. Dos juegos abiertos a la misma hora ven lo mismo.
9. **Privacidad de Mi casa:** la dirección se resuelve en el aparato contra las calles del mapa. Solo se guarda si el jugador marca «recordar», y nunca va en reportes (`Ocurrencias.exportar` redondea posiciones a 50 m).
10. **El arte nuevo entra por `MC.Sprites` con respaldo:** si falta un cuadro, se dibuja el procedural y se anota en `MC.Sprites.faltan`.
11. **Pages sirve la rama `main`** del repo (con `.nojekyll` e `index.html` de portada). Lo que se quiera en la web debe llegar a `main`.

### 5. Lo que falta o se puede mejorar (en orden de valor; el plan completo está en `docs/PLAN-IAS.md`)
1. **Que cada juego use el motor 2.0** (sus IAs, con las guías de migración). EnCicla debe recuperar y mejorar su panorámica con la de este motor; El Metro conserva su `23-lado.js` y puede pasarse a esta.
2. **Medir en un celular real** la vista 3D en WebGL y el arranque. Hoy `red('rueda')` tarda alrededor de 1 s (45.000 aristas), así que conviene precalcularla en el MC4 (2.1).
3. **Run con el arte de cada juego.** Hoy las zonas y los letreros son los de Orbe, la ciudad de Run Scooter (los temas `THEMES`/`ZONES`). Hay que mapearlos a las zonas reales (`mundo.zona`) y darle a `RUNV.cielo` y a la paleta de la vía la piel de EnCicla o de El Metro. Las esquinas ya muestran los nombres reales en el HUD.
4. **Panorámica:**
   - estaciones del metro con su dibujo de El Metro (`SisSpr`/`Art`) en vez de las bandas actuales;
   - deprimidos (el camino que baja con sus muros);
   - más mobiliario por zona.
5. **WebGL:** sombras, agua, texturas de fachada, árboles por especie y la cabina del metro como vista (de El Metro).
6. **Otra ciudad** de prueba con `docs/CIUDADES.md`, para demostrar que el motor «craquea» cualquier ciudad.
7. **Integrar lo que entreguen Gemini y ChatGPT** (sprites, paletas, auditoría).
8. ~~Publicar en GitHub Pages~~ Hecho: <https://juanfeliperico369-stack.github.io/motorcity/>.
9. **2.3:**
   - unir lo que entreguen Gemini (sprites, muebles por estilo, lugares) y ChatGPT (auditoría, storylets, accesibilidad);
   - vista frontal de la casa en la lateral;
   - redes precalculadas;
   - losas en un *Worker*.

### 6. Cómo comprobar que todo está bien
```bash
cd motorcity
node motor.mjs mundo && node motor.mjs run && node motor.mjs construir
node motor.mjs prueba --navegador                 # debe decir «✓ TODAS LAS PRUEBAS PASARON · 134 bien»
node motor.mjs sincronizar ../BicicletasUno --verificar   # «los archivos son iguales»
node motor.mjs sincronizar ../MetroZero --verificar
cd ../BicicletasUno && node tools/build.js && node tests/run.js      # «✓ TODAS LAS PRUEBAS PASARON»
cd ../MetroZero && node tools/build.mjs && node tools/test.mjs 100   # «RESULTADO: OK, 0 errores»
```
Capturas: `dist/motor-city.html` en Chromium con `--use-gl=swiftshader` (ver `pruebas/prueba.mjs`).

### 7. Trampas conocidas
- Los atributos `hidden` necesitan `[hidden]{display:none!important}` si el CSS pone `display`.
- `hex3()` acepta `#rgb`, `#rrggbb` y `rgba(...)`; `tono()` depende de él.
- Las capas de `valle.json` van en cuartos de casilla (×2,5 m); las de `alturas.json` y `sitios.bin`, en octavos (×1,25 m); `vias.bin`, en `tile / vq`. El Metro va en metros. **Todo eso ya está convertido en el MC4.**
- En `Mundo`, `meta.kx` está en **casillas** por grado; `mundo.kx`, en **metros** por grado.
- Run Scooter: un metro del corredor son `MC.Run.ESC` = 0,5 m reales. `RUNV.ponHill` reemplaza `HILL`, y el sombreador lee `uHR[64]`.
- La panorámica con pixel ajusta su escala; las etiquetas no se dibujan en el búfer del pixel.
- **Nombres repetidos en el cierre único:** todos los `js/NN-*.js` comparten un solo ámbito. Antes de declarar `const ESTILOS` o `const ACTIVIDADES`, busca si ya existe (pasó con la música y con los lugares).
- La vista lateral recorta la caja visible a una franja de profundidad (`E._franja`): sin eso, con `k` cerca de 0, la caja se va al infinito.
- `MC.Vistas.motor3d`: `'auto'` usa el raster si el WebGL es por software (SwiftShader en las pruebas); `'gl'` lo fuerza; `'raster'` también.
- **El agua se analiza una vez por mundo** (`MC.Terreno.agua`, 0,3–1 s). Los juegos la llaman al cargar; si no, la primera vez que alguien toca agua se nota un tirón.
- **Sobre la vía** el edificio solo bloquea si uno se mete más de 1 m en su huella (los datos se solapan con la calle), y la pendiente no bloquea. Fuera de la vía, sí.
- **Comentarios `//` en líneas largas de una sola instrucción** cortan el resto de la línea: usa `/* … */` dentro del código.
- En las pruebas de Node no hay `document`: `MC.GPU.perfil()` da `'sin-pantalla'` y `MC.UI.crear` devuelve `null`.


---

# ANEXO D. Guía (`docs/GUIA.md`)


> **Para el autor y para cualquier IA o persona que llegue.** Está escrita para leerse de corrido.
> Lo técnico al detalle está en `MOTOR.md` (el contrato) y el estado y las trampas en `CONTEXTO-IA.md`.

### 1. Qué es, en una frase
**Motor City es un motor de videojuegos de mundo abierto, en JavaScript puro, que convierte cualquier territorio real (o uno inventado) en un mundo jugable con leyes reales.** Encima de ese mundo, cada juego pone su piel, su trama y sus mecánicas.

Las leyes reales son de física, química, biología, clima, economía, tráfico y transporte.

Funciona en **un solo archivo HTML, sin internet ni librerías**: en el celular, en el computador, como app (APK) o en una página web.

### 2. Cómo está hecho (las capas)
```
        ┌───────────────────────── JUEGOS ─────────────────────────┐
        │ Juega EnCicla · El Metro · Run Scooter · Mandados · Motor City · Extremo │  ← su piel, su trama, sus modos
        └──────────────────────────────────────────────────────────────┘
   PIEZAS DE JUEGO   misiones · inventario · carreras · logros · diálogos · interfaz (MC.UI) · música (MC.Musica)
   MUNDO VIVO        reloj y calendario · cielo · clima global y estaciones · tráfico y semáforos · transporte con
                     horario · población con rutinas (IA) · animales · huevos de pascua
   SERES Y MÁQUINAS  personaje único (pose) · biología (persona, genética, animales, criaturas) · vehículos
                     (registro + taller de ingeniería) · física del cuerpo y del carro · controles · cámara
   VISTAS            cenital · ciudad 3D · maqueta 2:1 · panorámica de perfil · 3.ª y 1.ª persona · dron · cine
                     · pixel en todas · interiores · minimapa · calidad automática
   MUNDO (MC4)       suelo · relieve · divisiones · niveles · vías · edificios · sitios · pasos · transporte ·
                     lugares · tráfico  ←  craqueado de datos abiertos  o  generado por semilla
   CIENCIA           unidades SI · geometría · ruido · integradores · estadística · física · termodinámica ·
                     química · economía y finanzas
```
**Cada capa solo usa las de abajo.** Por eso un juego nuevo arranca con todo lo de abajo ya hecho.

### 3. El mundo: real o inventado, en un solo archivo
- **El formato MC4** es una cabecera más capas comprimidas que se abren cuando se piden:
  - el **suelo** por casilla (pasto, monte, calle, ciclorruta, agua, arena, nieve, roca…);
  - el **relieve**;
  - el municipio, la comuna y el barrio;
  - el **nivel firmado** de puentes, viaducto y deprimidos;
  - las **vías** con nombre;
  - las **edificaciones**, con su huella, pisos y uso;
  - los **sitios y emblemáticos**;
  - el **transporte** y los **lugares**.
- **Craquear un territorio real:** `geo/territorio.py`.
  - Le das un rectángulo de longitud y latitud. Baja de **Overture Maps** (OpenStreetMap, más las huellas de edificios de Microsoft y Google) las calles, el agua, los usos del suelo, los edificios y los lugares, y de **SRTM** el relieve.
  - Arma el mundo en segundos. **Guatapé** (4,8 × 3,6 km, 2.661 edificios, el embalse y el Peñol) salió en unos 20 s y pesa 0,19 MB.
- **Medellín** (43 × 49 km, 639.457 edificios, metro, cables y Metroplús) salió de juntar lo que ya tenían EnCicla y El Metro (`herramientas/fusionar.mjs`). Pesa 6 MB.
- **Inventar un mundo:** `MC.Generador.mundo({ semilla, tipo })`. Sus pasos:
  1. relieve con ruido y una forma: isla, valle, costa, montaña o llanura;
  2. ríos que bajan por la pendiente;
  3. biomas por temperatura y humedad;
  4. pueblos en lo plano junto al agua, con cuadrícula, plaza, iglesia y casas;
  5. carreteras con A\* que evitan las pendientes, con puentes;
  6. nombres, un mirador y un cable al cerro más alto.

  **La misma semilla da el mismo mundo.**
- **Las reglas de estilo** de cada lugar (colores de muros y techos, plancha, tanques, árboles, densidad, pisos, clima y horarios) están en `ciudades/<id>.json`, y salen de **mirar el lugar desde arriba**.

### 4. Las vistas: el mismo mapa en todas las dimensiones gráficas
- **Las losas:** pedazos de 160 m del mapa que se pintan una vez, con el suelo suave, el sombreado del relieve, las calles con su ancho real, el agua, las canchas, los árboles y los techos. Las usan todas las vistas. Por eso **se siente el mismo mapa** en cenital, en 3D o en la maqueta. También son el piso de la 3D.
- **Las vistas 2D** (cenital, ciudad 3D y maqueta 2:1) son una sola proyección con tres ajustes: giro, inclinación y altura.
- **La panorámica de perfil** es la vista con «cuidado especial»:
  - cielo con el sol y la luna reales;
  - montañas en capas con barrios que se encienden de noche;
  - la fila real de edificios;
  - emblemáticos en silueta;
  - viaducto y trenes reales;
  - cruces con su nombre;
  - tráfico y gente de perfil.
- **La 3D en WebGL** (tercera y primera persona, dron y cine) lleva el relieve real, los edificios levantados, la luz del sol por hora y niebla por clima. Si el aparato no tiene WebGL, cae a la ciudad 3D en Canvas.
- **Pixel:** cualquier vista dibujada pequeña y agrandada sin suavizado. Una tecla y todo es pixel art.
- **Interiores:** cualquier edificio se abre por dentro, con un plano según su uso (la casa paisa con su patio, el apartamento, el local, la oficina, la iglesia, el colegio, la bodega), puertas que conectan todo, ventanas y muebles con medidas reales.
- **Calidad automática:** mide cuánto tarda cada cuadro y sube o baja el detalle. Con la CPU 4× más lenta las vistas 2D quedan entre 4 y 18 ms.

### 5. Los seres y las máquinas (con ciencia de verdad)
- **Personaje único:** un esqueleto con poses (quieto, caminar, correr, pedalear, impulsarse, patinar, ir en tabla, sentado, saltar). Cada juego lo viste a su manera y se ve igual en todas las vistas.
- **Persona con biología:**

  | Aspecto | Cómo se calcula |
  |---|---|
  | Proporciones | Antropometría según la edad |
  | Paso y carrera | Número de Froude |
  | Metabolismo | Mifflin‑St Jeor |
  | Gasto | METs por actividad |
  | Pulso | Tanaka |
  | Potencia al pedalear | W/kg según el estado físico |
  | Estado del cuerpo | Energía, hidratación y temperatura según el clima |

  Su **genética mendeliana** (piel poligénica, ojos, pelo, rizo, estatura) le da hijos con los genes de los padres.
- **Animales con alometría real:** metabolismo (Kleiber), velocidad máxima (Hirt 2017), pulso, longevidad y marcha (paso, trote o galope). Hay especies del valle: perro criollo, gallinazo, colibrí, iguana, zarigüeya, ardilla…
- **Criaturas inventadas:** patas, segmentos, alas y ojos, con una prueba de **verosimilitud** por la ley cuadrado‑cubo con la gravedad del planeta.
- **Vehículos:**
  - un registro con 35 (bicis, patinetes, motos, carros, avionetas, lanchas, metro, cable…);
  - un **taller de ingeniería**: con masa, potencia, aerodinámica, llantas y combustible calcula la velocidad máxima, el 0–100, la frenada, el consumo, la autonomía, el CO₂, la velocidad de pérdida de un avión y la velocidad de casco de una lancha;
  - el carro se maneja con un **modelo de bicicleta de dos ejes**: derrapa cuando las llantas se rinden y la lluvia o la nieve le quitan agarre.

### 6. El mundo vivo
| Sistema | Qué hace |
|---|---|
| **Reloj y calendario** | Festivos de Colombia (Ley Emiliani) y fiestas de la ciudad. |
| **Cielo** | Colores por hora; sol y luna astronómicos. |
| **Clima global** | Para cualquier latitud y altura: estaciones por hemisferio, lluvia, tormenta eléctrica, granizo, **nieve que se acumula y se derrite**, **niebla cuando el aire llega al punto de rocío**, **olas de calor**, viento, índice de calor y sensación térmica. Es **el mismo para todos a la misma hora**. |
| **Tráfico** | Carros, taxis amarillos, motos, busetas y ciclistas con semáforos reales. |
| **Transporte** | Metro, tranvía, cables y Metroplús con **horario real** (deterministas). |
| **Población con rutinas** (IA de utilidad) | Cada persona tiene casa y trabajo en edificios reales y necesidades (energía, hambre, ganas de salir). Madruga, va a trabajar por las calles, almuerza, sale a la plaza y vuelve a casa. Lo lejano se simula «en grueso». |
| **IA** | Utilidad, árboles de comportamiento, dirección (buscar, huir, llegar, deambular, separarse) y **pilotos con física**, que frenan antes de cada curva a la velocidad segura √(μg/κ). |

### 7. Economía, mecánicas, interfaz y música
- **Economía exacta:**
  - dinero en centavos (enteros) y **libro de partida doble**: siempre cuadra y nadie crea plata de la nada;
  - mercados con oferta y demanda (equilibrio y ajuste en el tiempo), interés, inflación, préstamos, VPN y TIR;
  - salarios con recargo nocturno.
- **Mecánicas listas:** misiones con pasos, tiempo y premio; inventario con masa real (lo que cargas te frena); carreras por calles reales con rivales; logros; diálogos.
- **Interfaz integrada** (`MC.UI`):
  - temas por juego (Motor City, EnCicla, El Metro, Run Scooter);
  - fichas, barras, botones grandes y accesibles;
  - menús, diálogos, avisos, panel de misión y minimapa.
- **Música procedural** (`MC.Musica`), sin un solo archivo de audio:
  - estilos: electrónica, techno, synthwave, rock, jazz, lo‑fi y clásica;
  - **siete clásicos de dominio público** reharmonizados en cada estilo: Beethoven, Petzold/Bach, Pachelbel, Satie, Grieg y Vivaldi;
  - se **adapta** a la velocidad, la hora, el clima y la tensión del juego.

### 8. Cómo lo usas tú (el autor)
- **Para jugar y mostrar:** abre `dist/juegos/mandados.html` (el minijuego) o `dist/motor-city.html` (Medellín completo). También están en la web: ver el README.
- **Para pedir un juego nuevo a una IA:** dile que lea `AGENTS.md` y corra `node motor.mjs nuevo juego nombre`. Con las skills y la plantilla, en minutos tiene un juego andando sobre el mundo que elija.
- **Para tener un lugar nuevo:**
  1. Dale a una IA (o corre tú) `python3 geo/territorio.py --id mi-pueblo --bbox=…` con el rectángulo de longitud y latitud. Se sacan de cualquier mapa.
  2. Cambia `"mundo"` en `juego.json` y vuelve a construir.
- **Para inventar mundos:** `MC.Generador.mundo({ semilla, tipo })` dentro del juego. En Mandados es el botón «Mundo nuevo».

### 9. Qué se hizo para crearlo (resumen honesto)
1. **Revisión de los tres juegos:** se compilaron, se probaron y se jugaron. De ahí se tomó lo mejor de cada uno:
   - de EnCicla, sus datos a 10 m, los sitios y la panorámica de plataformas;
   - de El Metro, todas las huellas, los puentes, los rieles, la vista lateral y el WebGL;
   - de Run Scooter, el corredor completo.
2. **2.0:**
   - el mundo en un solo archivo y las redes de calles;
   - el tiempo, el clima, el transporte y el tráfico;
   - el personaje, los vehículos, la física, los controles y la cámara;
   - 8 vistas más pixel, la panorámica y la 3D;
   - Run en la ciclovía, el banco de pruebas y 54 pruebas;
   - la sincronización a los juegos.
3. **2.1:**
   - nombre: solo «Motor City»;
   - nuevos módulos: ciencia (física, química con balanceo exacto, termodinámica), economía, generador de mundos, craqueo de territorios, clima global con estaciones y nieve, biología (personas, genética, animales y criaturas), taller de vehículos con manejo de carro, IA y población con rutinas, interiores, música, interfaz y mecánicas;
   - el **minijuego Mandados**;
   - las herramientas para hacer juegos y módulos con plantillas;
   - los reportes de cambios, las skills del proyecto y 80 pruebas.

### 10. Lo que no es (todavía)
- La 3D es «low‑poly» (cajas y prismas), no realista. Para *Extremo* hacen falta sombras, materiales y animación de personaje más fina (ver `docs/SIGUIENTES-PASOS.md`).
- El craqueo de territorios deja la ciudad muy bien de calles, edificios y agua, pero **sin transporte ni emblemáticos modelados**. Eso se agrega a mano o con más fuentes (GTFS, modelos de los edificios famosos).
- La música es de sintetizador (chiptune elegante, no orquesta). Se puede mejorar con instrumentos muestreados si se acepta que el HTML pese más.

### 11. Lo nuevo de la 2.2
- **GPU virtual:** el motor mide el aparato, baja la resolución antes que los cuadros y, si no hay WebGL o es lento, dibuja la 3D por software (`MC.Raster`).
- **Vista lateral:** la ciudad de lado, como una casa de muñecas, que gira de a 90° como FEZ. Lo que tapa al jugador se vuelve transparente.
- **Puentes y niveles bien resueltos:** superficies, rampas, pasar por debajo y tiempo de coyote. **Cámara con resortes** que no atraviesa edificios.
- **Mi casa:** tu dirección real → tu casa en el juego, que diseñas con muebles reales (sin internet; la dirección no sale del celular).
- **Lugares jugables:** talleres, tiendas, restaurantes, centros comerciales, bibliotecas y parques. **Historias** con diversión, reflexión y conciencia, y un **director de ritmo**.
- **Ocurrencias:** lo imprevisto se corrige solo y se anota. **Cosmos:** planetas con leyes reales.
- **Manejo** con curvas y asistencias, **sprites**, **escala real** e **interfaz** que no tapa el centro.
- **Más documentos:** el manual (`docs/MANUAL.md`), la investigación (`docs/INVESTIGACION.md`), la optimización (`docs/OPTIMIZACION.md`) y el plan de cada IA (`docs/PLAN-IAS.md`).


---

# ANEXO E. Investigación (`docs/INVESTIGACION.md`)


> Cada idea dice **de dónde viene**, **qué enseña** y **dónde quedó en el motor** (módulo `MC.*`).
> Las fuentes están al final. Donde una fuente no confirma un detalle técnico, se dice.

### 1. Vistas y dimensiones: un mismo mundo, muchas formas de mirarlo
| Juego | Qué hace | Qué se tomó para Motor City |
|---|---|---|
| **FEZ** (Polytron, 2012) | El mundo es 3D, pero el jugador lo ve desde 4 lados en 2D y gira de a 90°. Lo que parece lejos en un lado queda pegado en otro. Primero se juega en 2D puro y después se presenta el giro. | Vista **lateral** (`lateral`): la ciudad real vista de lado, con giros animados de a 90° (`camara.girar90`). La maqueta 2:1 también gira de a 90°. |
| **Monument Valley** (ustwo, 2014) | Proyección **ortográfica** (sin perspectiva): las ilusiones de geometría imposible solo funcionan así y desde ciertos ángulos. Diseño de «menos juego, más experiencia». | Las vistas 2D del motor son ortográficas (una sola proyección con giro, aplastamiento y altura: `Vista2D.parametros`). La maqueta 2:1 (dimétrica) sirve para puzles de perspectiva. |
| **Little Nightmares** (Tarsier) | Mundo 3D con cámara de lado y fija que se desplaza: efecto de **casa de muñecas**. Movimiento completo en profundidad, aunque juzgar la profundidad cuesta. | La vista lateral corta la ciudad como una casa de muñecas: cielo arriba, **corte de la tierra** abajo y una franja de calle con profundidad. Para el problema de la profundidad: **rayos X**, porque lo que tapa al jugador se vuelve transparente. |
| **GTA, Forza Horizon, Need for Speed** | Cámara de persecución con resorte, campo visual que se abre con la velocidad, cámara que esquiva paredes y vistas que se cambian con un botón. | `MC.Camara`: **resortes críticamente amortiguados**, **brazo con choque** (no atraviesa edificios ni cerros, ni se mete en el tablero de un puente), **FOV según la velocidad** y **sacudida por trauma** en los choques. |
| **Juegos de pixel art y cenitales** | Píxeles enteros, sin suavizado y con escala fija por metro. | Pixel en todas las vistas (búfer pequeño agrandado) y `MC.Escala.pxPorMetro(…, entero)`. |

**Regla del motor:** el mundo es uno solo, en metros. Las vistas son maneras de proyectarlo; ninguna tiene datos propios. Por eso un juego puede pasar de cenital a lateral, a 3D o a pixel sin perder nada.

### 2. Física y lógica: que se sienta justo
- **Controlador de personaje por superficies** (la técnica de los motores grandes):
  - en cada punto hay varias superficies: el terreno y los tableros de puentes con sus rampas;
  - el cuerpo se apoya en la más alta que quede a un **escalón** de los pies;
  - lo que queda **entre los pies y la cabeza es pared**, y lo que queda arriba de la cabeza **se pasa por debajo**;
  - si el apoyo desaparece, el cuerpo **cae**.

  Así se resuelven puentes, viaducto, deprimidos y cualquier «dimensión complicada» (`MC.Cuerpo.superficies`). Se probó en 5 puentes reales de Medellín: el carro sube a 4,5 m por la rampa y el peatón pasa por debajo.
- **Tiempo de coyote y memoria del salto** (los plataformeros modernos, como *Celeste*):
  - se puede saltar un instante después de dejar el borde;
  - si se oprime un poco antes de caer, el salto sale al tocar el piso.

  El jugador siente que el juego «le entiende».
- **Paso fijo con interpolación** («Fix Your Timestep!», Glenn Fiedler; *Game Programming Patterns*):
  - la física avanza siempre en pasos de 1/60 s, igual en cualquier aparato;
  - el dibujo interpola;
  - hay un tope para no entrar en la «espiral de la muerte».

  Está en `MC.Bucle`.
- **Física con números reales** donde importa:
  - velocidad segura en curva v = √(μg/κ);
  - frenada con agarre según el clima;
  - ley cuadrado‑cubo para criaturas;
  - gravedad g = GM/R² en otros planetas.

### 3. Mundos procedurales: la lección de No Man's Sky
- **Una semilla define un planeta entero.** Lo que no se guarda se vuelve a calcular igual. La generación es continua y por etapas: forma del terreno, superficie, texturas, población y simulación (charla de Hello Games en la GDC 2017, «Continuous World Generation in No Man's Sky»).
- **Jerarquía de semillas** (universo → galaxia → sistema → planeta → región → objeto) y **ruido continuo sin bordes**: cualquier región se genera en cualquier orden y empata con sus vecinas.
- **En Motor City:**
  - `MC.Cosmos` crea estrellas con abundancias reales (muchas enanas rojas) y luminosidad L ≈ M^3,5;
  - crea planetas con órbitas de Kepler, gravedad, temperatura de equilibrio con invernadero y atmósfera retenida o perdida;
  - del planeta salen el mundo jugable (`MC.Generador`) y criaturas verosímiles a esa gravedad;
  - `Cosmos.altura(semilla, x, y)` es un relieve **infinito y continuo** (fractal con crestas y deformación de dominio).

  Nota: los detalles internos del «uber noise» de No Man's Sky no están confirmados en las fuentes revisadas; el motor usa la técnica conocida equivalente.

### 4. Historia y trama: diversión, reflexión y conciencia
- **Storylets** (Failbetter Games; Emily Short, «Storylets: You Want Them»): piezas de historia con **condición, contenido y efecto**. Un gestor elige la más **saliente** para el momento («salience-based narrative»). Se combinan sin escribir un árbol gigante.
- **Director de ritmo** («AI Director» de *Left 4 Dead*, Valve): mide la intensidad y alterna **tensión y respiro**. Después de un pico siempre hay calma.
- **Flujo** (Csikszentmihalyi): reto ajustado a la habilidad; ni aburrido ni frustrado. Se logra con **dificultad dinámica**.
- **En Motor City** (`MC.Historias`):
  - storylets con tres pilares:
    - **diversión**: retos, un perro que te adopta, tesoros;
    - **reflexión**: la señora que recuerda la quebrada, el atardecer, la lluvia bajo un alero, un dilema con una billetera;
    - **conciencia**: frenar con lluvia, el agua con calor, la altura, la cultura metro;
  - un director que pide respiro después de los picos y propone retos si todo está quieto mucho rato;
  - **encargos procedurales**: personaje + necesidad + lugar real + obstáculo + recompensa + dilema + lección real (`DATOS_REALES`, verificables).
- **Reglas de escritura** (para que haya peso real sin sermones):
  - **Mostrar, no explicar.** El mundo cuenta: el tronco con un año grabado, la ciudad que se enciende.
  - **Elecciones con consecuencias pequeñas pero visibles:** el perro te sigue, la reputación sube.
  - **Aprender jugando:** la lección llega en el momento en que sirve (lluvia + bici = frenada), en una línea.
  - **Silencio y contemplación:** momentos sin misión, con música baja (el atardecer). *Monument Valley* y *Journey* lo enseñan: la atmósfera es narrativa.

### 5. Ocurrencias: lo que nadie previó
- Los mundos abiertos fallan en los bordes:
  - quedar atascado o caer bajo el piso;
  - salir del mapa o números rotos (NaN);
  - plata que aparece de la nada.
- Los grandes estudios usan **invariantes** (cosas que siempre deben ser ciertas), **recuperación automática** (volver al último punto seguro), un botón de **«sácame de aquí»** y **telemetría** para saber dónde pasa.
- **Emergencia buena:** *Zelda: Breath of the Wild* (su «motor químico»), los *immersive sims* y *Dwarf Fortress* dejan que reglas simples produzcan historias que nadie escribió. Hay que **verlas** para aprender de ellas.
- **En Motor City** (`MC.Ocurrencias`):
  - vigila números inválidos, fuera del mundo, bajo el piso, velocidad imposible, atrapado, atascado, libro descuadrado, cuadros lentos y errores;
  - **corrige solo** y **anota**;
  - anota también los **«momentos»**: récords de velocidad y saltos enormes;
  - `exportar()` da un reporte sin datos personales (posiciones redondeadas a 50 m) para mejorar el motor.

### 6. Interfaz, psicología y neurociencia
| Principio | De dónde viene | Cómo quedó |
|---|---|---|
| **El centro es del juego** | Diseño de HUD en juegos de acción; *The Gamer's Brain* (Celia Hodent): la atención es limitada. | `ui.zonaLibre()`; `MC.UI.verificar` prueba que nada la tape (en las pruebas del navegador). Las etiquetas no se montan ni tapan el centro. |
| **Arriba se informa, abajo se actúa** | Ley de Fitts: lo que se toca debe estar grande y cerca del pulgar. | Información arriba a la izquierda, en columna. Movimiento abajo a la izquierda. Acciones a la derecha. Botones de 48 px o más. |
| **Lo que no cambia se atenúa** | Interfaz mínima de *Zelda BotW* y *Destiny*. | Las fichas se atenúan a los 5 s y vuelven al cambiar. **Foco** al ir rápido; **cine** sin nada. |
| **Pocas opciones a la vez** | Ley de Hick: más opciones = más tiempo para decidir. | Menús cortos y botones contextuales (Taller, Tienda y Entrar solo aparecen cuando sirven). |
| **Un aviso a la vez** | Carga cognitiva. | Avisos en cola, cortos, sin robar el control. |
| **Competencia, autonomía y relación** | Teoría de la autodeterminación (Ryan, Rigby y Przybylski, 2006): lo que hace que un juego enganche sanamente. | Competencia: retos con flujo. Autonomía: mundo abierto, casa propia y estilos. Relación: gente con rutinas, perro y historias. |
| **Recompensa que sorprende** | Error de predicción de recompensa y dopamina (Schultz, 1997). | Momentos y storylets inesperados, tesoros y huevos de pascua. **Sin trampas** (nada de cajas de botín ni presión de compra): los juegos son para todo público. |
| **Tareas abiertas** | Efecto Zeigarnik: lo inconcluso se recuerda. | Misión visible arriba con tiempo y distancia. |
| **Buen final** | Regla pico‑final (Kahneman): se recuerda el mejor momento y el último. | Cada entrega cierra con un premio claro. El atardecer cierra el día. |
| **Se aprende jugando** | Tutoriales integrados (*Portal*, *Mario*); la primera parte de FEZ es 2D puro. | Ayuda de una línea al cambiar de control (`ESQUEMAS.ayuda`). Las lecciones llegan cuando sirven. |
| **Accesible** | Pautas de accesibilidad en juegos. | Etiquetas aria, contraste alto, «reducir movimiento», teclado, dedo y mando. |

### 7. Controles y sensibilidad
- **Zona muerta radial** (que el dedo o el mando no «derive») y **respuesta exponencial** (lo pequeño es preciso y lo grande es rápido): el estándar de los juegos de mando.
- **Giro según la velocidad** (como la dirección asistida y los juegos de carreras): a 100 km/h el mismo gesto gira menos.
- **Asistencias** que se apagan:
  - frenar antes de la curva;
  - «imán de calle»;
  - acelerar solo.
- **Esquemas:** joystick flotante o fijo, volante y pedales, **tocar para ir** (camino A* por las calles), **inclinar el celular**, **un pulgar** y **carriles**.
- Todo está en `MC.Manejo`.

### 8. Sprites y arte
- **Atlas** (una imagen con muchos cuadros): menos cambios de textura y dibujo más rápido. Es el estándar desde los juegos de 8 bits hasta Unity y Godot.
- **Animación por fase:** los pies del sprite van al ritmo del paso real.
- **4 u 8 direcciones** para cenital e isométrico.
- **9‑slice** para marcos de interfaz.
- **Fondo magenta** que se vuelve transparente (la regla de las IAs de arte de El Metro).
- **Hornear** lo procedural a un atlas al arrancar.
- **Respaldo:** si el arte no está, el motor dibuja el suyo y anota qué falta.
- Todo está en `MC.Sprites`.

### 9. Los motores más grandes y qué juegos hicieron con ellos
| Motor | Juegos conocidos | Lección para Motor City |
|---|---|---|
| **id Tech** (id Software) | *Doom*, *Quake* | Rendimiento ante todo y herramientas para la comunidad (mods). |
| **Unreal Engine** (Epic) | *Unreal*, *Gears of War*, *Fortnite*; *Little Nightmares II* (según la entrevista de Epic) | Editor visual y *blueprints*: hacer juegos sin ser experto. Aquí: plantillas, skills y `node motor.mjs nuevo`. |
| **Unity** | *Monument Valley*, *Hollow Knight*, *Cuphead*, *Genshin Impact* | Un núcleo pequeño, componentes y una tienda de piezas. Aquí: módulos `MC.*` registrables y pieles de arte. |
| **Source** (Valve) | *Half‑Life 2*, *Portal*, *Left 4 Dead* | Física como jugabilidad e IA director. |
| **RAGE** (Rockstar) | *GTA IV*, *GTA V*, *Red Dead Redemption* | Ciudad viva: gente con rutinas, tráfico y clima. |
| **ForzaTech** (Playground y Turn 10) | *Forza Horizon*, *Forza Motorsport* | Manejo con física real y asistencias graduables. |
| **Frostbite** (EA DICE) | *Battlefield*, *Need for Speed* recientes | Destrucción y luz. |
| **Motor propio de Hello Games** | *No Man's Sky* | Todo desde una semilla. |
| **Godot** (código abierto) | Muchos juegos independientes | Libre, liviano y comunidad. Modelo de licencia a estudiar. |
| **XNA/FNA y motores propios pequeños** | *FEZ* (Trixel), *Celeste* | Un motor pequeño y hecho a la medida del juego puede ser mejor que uno enorme. |
| **Motores web** (Phaser, PixiJS, Three.js) | Juegos de navegador | Un solo HTML que anda en todo: la apuesta de Motor City. |

**La conclusión:** los motores que ganan no son los que más hacen, sino los que **dejan crear rápido sin romper nada**: buenas herramientas, piezas que se conectan, pruebas y una comunidad que aporta. Por eso Motor City tiene:
- plantillas y skills;
- reportes de cambios de las IAs de cada juego;
- más de 100 pruebas;
- reglas de no romper guardados ni la API.

### 10. Ciudades: SimCity, Los Sims, Cities: Skylines y Townscaper (2.3)
| Juego | Qué enseña | Dónde quedó |
|---|---|---|
| **SimCity** (y su motor GlassBox de 2013) | Capas de datos (valor del suelo, contaminación, deseabilidad). Desde 2013, recursos llevados por agentes. | `MC.Urbe` (campos y recursos con capacidad) y capas de datos encima de las vistas. |
| **Cities: Skylines** | Zonas junto a las calles, lotes mirando a la vía, demanda RCI, niveles por valor del suelo y servicios, *props* y *decals*. La 2 enseña que sin LOD y con sombras caras el rendimiento se cae. | `MC.Urbe`, `MC.Mobiliario` y sombras baratas en caché. |
| **Los Sims** | Personas simples y objetos inteligentes que anuncian qué necesidad satisfacen; ambiente del cuarto. | `MC.Necesidades`, `MC.Habitante` y `Hogar.ambiente()`. |
| **Townscaper** | Rejilla irregular, reglas locales (WFC), módulos por esquina, paleta suave y sombras de contacto. | `MC.Ondas`, `MC.Autotile`, `MC.RejillaIrregular`, fachadas por reglas y oclusión de contacto. |

El detalle, el código y lo que falta están en `docs/DOCUMENTO-UNICO.md`, §6.

### Fuentes
- *Fez (video game)*, Wikipedia. Game Developer, «The dimensions of Fez».
- Hello Games, «Continuous World Generation in No Man's Sky» (Innes McKendrick, GDC 2017), GDC Vault. Sean Murray, «Building Worlds Using Math(s)» (GDC 2017).
- ustwo, Ken Wong: «Designing Monument Valley: Less Game, More Experience» (GDC Europe 2014) y «The Art of Monument Valley» (GDC 2015). Cobertura de Pocket Gamer de la GDC 2014.
- Game Developer, «Crafting the bizarre, off-kilter gameworld of *Little Nightmares*». Unreal Engine, entrevista «How *Little Nightmares II* plumbs the depths of adolescent angst».
- Emily Short, «Storylets: You Want Them» (2019) y «Beyond Branching: Quality-Based, Salience-Based, and Waypoint Narrative Structures» (2016).
- Michael Booth (Valve), «The AI Systems of Left 4 Dead» (AIIDE 2009).
- Glenn Fiedler, «Fix Your Timestep!». Robert Nystrom, *Game Programming Patterns* (capítulo «Game Loop»).
- Itay Keren, «Scroll Back: The Theory and Practice of Cameras in Side-Scrollers» (GDC 2015). Squirrel Eiserloh, «Math for Game Programmers: Juicing Your Cameras With Math» (GDC 2016).
- Celia Hodent, *The Gamer's Brain* (2017). Ryan, Rigby y Przybylski, «The Motivational Pull of Video Games» (2006). Schultz, Dayan y Montague, «A Neural Substrate of Prediction and Reward» (1997). Csikszentmihalyi, *Flow* (1990).
- Nintendo, «Breaking Conventions with *The Legend of Zelda: Breath of the Wild*» (GDC 2017).
- **SimCity:**
  - Game Developer, «GDC 2012: Breaking down SimCity's GlassBox engine»;
  - Andrew Willmott, «Inside GlassBox».
- **Cities: Skylines:**
  - Paradox y Colossal Order, *dev diaries* de zonificación y economía;
  - análisis técnicos de Cities: Skylines II (PC Gamer, Tom's Hardware).
- **Los Sims:**
  - Forbus y Wright, «Programming Objects in The Sims»;
  - Game Maker's Toolkit, «The Genius AI Behind The Sims».
- **Townscaper:**
  - Boris the Brave, «Editable WFC» y «WFC tips and tricks»;
  - Maxim Gumin, *WaveFunctionCollapse*;
  - charlas de Oskar Stålberg.


---

# ANEXO E2. Inspiración visual (`docs/INSPIRACION-VISUAL.md`)


> **La regla:** de las obras con derechos se toman las **técnicas**, nunca imágenes, personajes ni logos. El arte «de verdad» que se recopila y adapta es de **dominio público**: sus paletas están en `arte/dominio-publico/`, con fuente y licencia.

### 1. Las referencias del autor: la entrega maestra (nov‑2026)
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

#### Las 25 fichas y dónde quedaron en Motor City
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

#### 1.1 Auditoría G‑H7 de Gemini (20‑nov‑2026)
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

##### Técnicas verificadas directamente en los 17 clips MP4 analizados (`MOTOR-CITY-ENTREGA-MAESTRA.md`, sin asignación 1:1 a los 9 shortcodes bloqueados)
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

#### 1.2 Verificación en fuentes públicas primarias de las 7 fichas «Solo Gemini» (G‑H7 · 20‑nov‑2026)
En `MOTOR-CITY-ENTREGA-MAESTRA.md` §4 había **7 fichas sin clip MP4** (`R02`, `R03`, `R04`, `R08`, `R09`, `R13` y `R18`). Se contrastaron de forma independiente contra sus **repositorios, páginas oficiales de Steam y artículos técnicos primarios**, separando hechos verificados de hipótesis no probadas:

| Ficha | Proyecto / autor | Nivel actualizado | Fuente primaria verificada | Qué se confirmó (y qué sigue sin comprobarse) |
|---|---|---|---|---|
| **R02** | **Josh White** (`@joshwhite_artist`) | **Verificado en portafolio** (sin vídeo del reel) | [ArtStation (`jdwatx`)](https://www.artstation.com/jdwatx) · [Reddit `u/Joshwhite_art`](https://www.reddit.com/user/Joshwhite_art/) · [FreeYork (sep‑2026)](https://freeyork.org/art/josh-white-digital-3d-sculpts/) | Confirmado el autor, el handle `@joshwhite_artist` y sus megaestructuras sci-fi (*Sector 8*, *M.E.C.*). **Corrección técnica:** FreeYork documenta un flujo de **esculpido 3D en Nomad Sculpt (iPad) + sobrepintado en Procreate**, no un *shader* volumétrico en tiempo real. El movimiento/paralaje del reel no se inspeccionó. |
| **R03** | **Maciej Drabik** (`@maciejdrabik_art`) | **Verificado en prensa técnica** (sin vídeo del reel) | [80.lv · *Rainy Autumn Nights* (sep‑2024)](https://80.lv/articles/digital-artist-achieves-pixelated-perfection-with-this-3d-rainy-scene) · [80.lv · animación cyberpunk (oct‑2024)](https://80.lv/articles/relax-your-mind-with-maciej-drabik-s-cyberpunk-style-3d-animation) | Confirmado su estilo 3D pixelado/pictórico con calles urbanas lluviosas, iluminación neón y paralaje (*Rainy Autumn Nights* y secuencia cyberpunk). **Distinción clave:** son piezas **prerrenderizadas en Blender + DaVinci Resolve**, no un filtro móvil en tiempo real (en Motor City la versión ligera son `vistas.pixel` + charcos `C‑M17`). |
| **R04** | ***KnoxMap*** (OSM → *Project Zomboid* Build 42) | **Verificado directamente en GitHub** | [`github.com/spytheeuclidean-a11y/knoxmap`](https://github.com/spytheeuclidean-a11y/knoxmap) (v1.8.6.3, MIT/GPL) · [Steam Workshop 3806764280](https://steamcommunity.com/sharedfiles/filedetails/?id=3806764280) | Confirmado: escrito en Python/Rust/JS por `euclid80tr` sobre *Knoxify*. Lee calles, huellas de edificios, agua, parques, vías férreas y alturas (hasta 31 pisos) de OpenStreetMap (y opcionalmente Overture Maps / ESA WorldCover), genera interiores amoblados según tipo de local y estima población. **Aclaración:** es un **compilador de escritorio fuera de línea** que tarda minutos por bloque de 600 × 600 m, no *streaming* en móvil. |
| **R08** | ***MythicTale*** (STUDIO GENKI) | **Verificado en tienda oficial** (sin vídeo del reel) | [Steam · *MythicTale* (App 4451310)](https://store.steampowered.com/app/4451310/MythicTale/) | Confirmado: Action RPG cenital estilizado en un mundo **2.5D vibrante** inspirado en clásicos portátiles, con combate rápido de artes marciales, técnicas de energía, exploración y plataformas (Windows/macOS). Los detalles concretos de *hitstop* y torneo del reel no se inspeccionaron en vídeo. |
| **R09** | ***Motor Town: Behind The Wheel*** (P3 Games) | **Verificado en tienda oficial** | [Steam · *Motor Town* (App 1369670)](https://store.steampowered.com/app/1369670/Motor_Town_Behind_The_Wheel/) · [Noticias Steam](https://steamcommunity.com/app/1369670/allnews/) | Confirmado: mundo abierto (24 × 16 km) en Acceso Anticipado para PC con ciclo día/noche, nubes volumétricas y clima dinámico, más de 50 vehículos, física realista de llantas/derrape, peso y sujeción de carga, trabajos (taxi, bus, camión, entregas) y compra/amoblado de propiedades. Es un título de escritorio (no móvil). |
| **R13** | ***Holstin*** (Sonka / Team17) — *coincidencia probable* | **Identificación probable verificada** (pendiente confirmar 1:1 con el MP4) | [Steam Demo *Holstin* (App 2443020)](https://store.steampowered.com/app/2443020) · [Rely on Horror (abr‑2025)](https://www.relyonhorror.com/latest-news/psychological-survival-horror-game-holstin-shows-off-arsenal-of-weapons-and-new-gameplay-footage/) · [WindowsForum (dic‑2025)](https://windowsforum.com/news/holstin-polish-survival-horror-with-a-dynamic-camera-now-published-by-team17.393101/) | La descripción de `R13` (urbano oscuro de Europa del Este en pixel 3D con cambio sin cortes entre vista isométrica, plano lateral, disparos sobre el hombro y conducción en primera persona) coincide punto por punto con ***Holstin*** (Polonia años 90, tecnología *2XD Rendering* de Sonka). Al no haberse visto el reel original de `@indie.gamesdaily`, se marca como **atribución probable pendiente de confirmación con el MP4**. |
| **R18** | ***VoxPix*** (Andres Wong) | **Verificado directamente en GitHub** | [`github.com/andyeswong/voxpix`](https://github.com/andyeswong/voxpix) · [`docs/api-agentes.md`](https://github.com/andyeswong/voxpix/blob/main/docs/api-agentes.md) | Confirmado vía API de GitHub: repositorio público **MIT** en TypeScript + Vue 3 + WebGL2, motor de vóxeles a pixel art 2.5D con luz dinámica y agua, expuesto sin ratón en `window.voxpix` (`box`, `water`, `foliage`, `voxels`, `batch`, `save/load`). La cifra «paisaje de 128 × 128 en 0,08 s de ediciones» aparece textualmente en el README del autor (marca declarada por el proyecto, no perfilada en nuestro móvil). |

#### 1.3 Enlaces de skills, plugins y herramientas de agentes (20‑nov‑2026)
Los 10 enlaces nuevos compartidos por el autor (8 de TikTok y 2 de Instagram) sobre skills y plugins de IA se auditaron combinando los fotogramas revisados por Codex en `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md` (2.9.1) con la verificación directa de repositorios y licencias en GitHub. Sus principios quedaron incorporados en **4 skills nuevas** en `.claude/skills/` (`motor-city-web-moderna`, `motor-city-diseno-ui`, `motor-city-qa-playwright` y `motor-city-revision-ia`) y el catálogo completo con comandos de instalación opcionales vive en **`docs/SKILLS-Y-PLUGINS.md`**. Las 2 publicaciones de Instagram (`DfVDgmclLPi/?img_index=6` y `DexJDYnNQ0X`) siguen bloqueadas detrás de inicio de sesión y permanecen abiertas hasta recibir capturas o nombres.



#### 1.2 Los 11 enlaces del 20‑nov‑2026: skills y plugins para las IA (2.10)
El autor mandó 2 Instagram (uno dos veces) y 8 TikTok, y pidió «añade las skills y plugins de los videos y sigue desarrollando». Los TikTok se leyeron por su descripción pública. Los Instagram piden iniciar sesión, y quedan para Gemini (G‑H10).

| Enlace | Qué muestra | Qué se hizo |
|---|---|---|
| TikTok @midudev (`ZSpw3MBBy`) | **Modern Web Guidance**, de Google Chrome (Apache‑2.0): una skill que evita que la IA escriba HTML, CSS o JS viejo | Plugin de Claude Code. Se corrió `legacy-scan` sobre el motor: 11 hallazgos, se aplicaron 9 con su respaldo y se dejaron 2 a propósito (la copia JSON del guardado). Se fijó la **política de navegadores** en `CLAUDE.md`. |
| TikTok @xabatzz (`ZSpw3DhsN`) | **Hallmark** (`Nutlope/hallmark`, MIT): una skill de diseño web «que no parezca hecho por IA», con 50 temas y revisión en 8 tamaños | Plugin de Claude Code. Encargo **C‑M25**: la portada de GitHub Pages. |
| TikTok @morenazogutierrez (`ZSpw3ESfu`) | Tres herramientas: skills de diseño y de animación, y **Playwright** para que la IA pruebe la web | El diseño y la animación son Hallmark y HyperFrames. Playwright ya está (`webapp-testing` y `prueba --navegador`). |
| TikTok @revolutia.ai (`ZSpw3hjS4`) | **find-skills** (`vercel-labs/skills`, MIT): busca e instala la skill justa para cada tarea | En el catálogo. Se instala con `node motor.mjs skills --instalar`. |
| TikTok @revolutia.ai (`ZSpw3yj9x`) | Una skill que convierte una web en un **video de lanzamiento** con música y subtítulos | Es **HyperFrames** (`heygen-com/hyperframes`, Apache‑2.0, skills `website-to-video` y `product-launch-video`). Plugin de Claude Code y encargo **C‑A12** (tráiler de Mandados). |
| TikTok @revolutia.ai (`ZSpw3ah5Q`) | **MiroFish** (`666ghj/MiroFish`, AGPL‑3.0): miles de clientes simulados que opinan antes del lanzamiento | Es una aplicación aparte, con servidor y llaves, así que no se instala. Se tomó la idea: **`MC.Publico`** y `node motor.mjs publico` (niña, abuelo, gamer y turista juegan solos y dan su veredicto). |
| TikTok @migue.baena (`ZSpw36ySn`) | Un supuesto «system prompt» filtrado de otra empresa | **Descartado.** Es material filtrado y confidencial de un tercero, así que no se copia ni se usa. |
| TikTok @soyenriquerocha (`ZSpw3u8dH`) | «Claude ahora construye bien sin basura» (la descripción no dice más) | Para Gemini (G‑H10): averiguar qué herramienta es. |
| Instagram `DfVDgmclLPi` (enviado dos veces) | No se pudo leer: pide iniciar sesión | Para Gemini (G‑H10). |
| Instagram `DexJDYnNQ0X` | No se pudo leer: pide iniciar sesión | Para Gemini (G‑H10). |

### 2. Peso y vida («game feel»)
| Fuente | La técnica | En el motor |
|---|---|---|
| Jan Willem Nijman (Vlambeer), «The Art of Screenshake» (2013) | El mismo juego con y sin «jugo»: sacudida, retroceso, pausa de impacto y partículas. Sin eso, todo se siente plano. | `MC.Vida` (88): sacudida según la caída, **hitstop** de 60 ms en los choques (`MC.Bucle` respeta `MC._pausaImpacto`), polvo, salpicaduras y hojas. |
| Disney, los 12 principios de la animación | *Squash and stretch*, anticipación y acción complementaria | El cuerpo se aplasta al aterrizar y vuelve (`_squash`); el vehículo cabecea con la aceleración. |
| *Spider‑Man: Into the Spider‑Verse* | Animación «a dos cuadros» (*on twos*) para un movimiento con carácter | Las alas de los pájaros aletean a 12 cuadros por segundo. |
| *Cairn*, carreras tipo Dakar (reels) | El peso del cuerpo y del vehículo | Lo mismo, más el viento que mece las copas de cerca. |

### 3. Cómic, manga, anime y novela gráfica
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

### 4. Arte de verdad, de dominio público (recopilado y adaptado)
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

### 5. Lo que sigue
- **ChatGPT** (imágenes) dibuja las láminas guía de cada estilo (C‑A8) y el personaje en *cel* (C‑A9).
- **Codex** hace el estilo de 1 bit con trama estable (C‑M19) y una vista con three.js o WebGPU (C‑M18).
- **Gemini** describe los 10 reels que faltan (G‑H7) y busca 40 obras de dominio público, también colombianas (G‑H8).

### Fuentes
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


---

# ANEXO E3. Motores potentes (`docs/MOTORES-POTENTES.md`)


> **La idea:** Motor City nació para correr en un HTML, en cualquier celular y sin internet. Eso no lo encierra:
> - sus **mundos** salen en formatos estándar;
> - su **simulación** (física, terreno, ciudad, historias, economía) es JavaScript puro, que también corre sin pantalla;
> - su **estado vivo** se puede mandar a otro motor que solo dibuje.
>
> Así, un mismo juego puede tener una versión liviana (Motor City) y una de consola o PC (Unreal o Godot) **sin rehacer el mundo**.

![Guatapé exportado de Motor City y abierto en three.js](img/exportar-guatape-threejs.jpg)

*Guatapé exportado con `node motor.mjs exportar guatape` y abierto en three.js, sin tocar nada. El validador oficial de Khronos da 0 errores y 0 avisos.*

### Tres niveles para sacarle el máximo provecho
| Nivel | Qué se lleva | Cómo | Para qué |
|---|---|---|---|
| **1. El mundo** | Terreno, edificios, vías, árboles y lugares | `node motor.mjs exportar <mundo>` → `mundo.glb`, `alturas.r16` y `escena.json` | Hacer el juego en Godot, Unity o Unreal con el pueblo o la ciudad real ya armados. |
| **2. La simulación en vivo** | Jugador, vehículos, gente, hora y clima | `MC.Puente.instantanea(E)` cada cuadro, enviado por WebSocket (o `postMessage`) | Que Motor City siga simulando y otro motor dibuje con más detalle (luz global, sombras suaves y más polígonos). |
| **3. Otro dibujante en la web** | La vista | Una vista registrada que use three.js, Babylon o WebGPU con el mismo `E` | Gráficos de PC en el navegador, con el mismo juego (C‑M18). |

### Nivel 1 · Exportar el mundo
```bash
node motor.mjs exportar guatape                              # 600 × 600 m alrededor del centro del pueblo
node motor.mjs exportar medellin --centro 15680,13534 --lado 800 --paso 4
```
Sale en `dist/exportar/<mundo>/`:
- `mundo.glb` (glTF 2.0 binario):
  - mallas `terreno` (relieve real; color por suelo y el agua por profundidad), `edificios` (extruidos con el color de su zona), `vias` (cintas sobre el terreno) y `arboles` (tronco y copa por especie);
  - un solo material con colores por vértice;
  - +Y arriba, en metros, y el origen en el centro de la caja (en `extras.origen_mundo` quedan las coordenadas originales).
- `alturas.r16` y `alturas.json`: el relieve en RAW de 16 bits *little endian*, con su mínimo y máximo.
- `escena.json`: edificios (huella, altura, clase y colores), vías (polilínea, ancho y tipo), árboles (especie, alto y copa) y lugares jugables. El motor de destino pone **su** lógica y **su** arte sobre esto.
- `LEEME.md`: cómo abrirlo en cada motor.

| Motor | El mundo | El terreno de alta calidad | La lógica |
|---|---|---|---|
| **Godot 4** | Arrastrar `mundo.glb` al proyecto | `HTerrain` o *Terrain3D* con `alturas.r16` | GDScript lee `escena.json` y pone `MultiMeshInstance3D` para los árboles. |
| **Unity** | Paquete *glTFast* | *Terrain* → Import Raw (16 bits, Windows, ancho × alto de `alturas.json`) | C# lee `escena.json`. |
| **Unreal 5** | Import (Interchange) de `mundo.glb` | *Landscape* desde `.r16`, con escala Z = (max − min) / 512 × 100 | Blueprint o C++ con el JSON; *PCG* para poblar con los árboles. |
| **Blender** | Archivo → Importar → glTF 2.0 | — | Python lee el JSON (render de cine). |
| **three.js y Babylon** | `GLTFLoader` y `SceneLoader` | `PlaneGeometry` desplazada con las alturas | El mismo JavaScript de Motor City. |

**Comprobado:**
- `mundo.glb` de Guatapé (300 edificios, 66 vías, 1.396 árboles, 86 mil vértices) pasa el **glTF Validator de Khronos con 0 errores**;
- three.js lo dibuja (la imagen de arriba).

En Godot, Unity y Unreal no se pudo abrir desde aquí; esa prueba le toca a Codex (C‑M18).

### Nivel 2 · El puente en vivo
```js
// en Motor City (navegador o Node), en cada cuadro:
const estado = MC.Puente.instantanea(E);   // { t, hora, clima, estilo, jugador: { x, y, z, a, v, vehiculo, estado }, vehiculos: [...], peatones: [...] }
socket.send(JSON.stringify(estado));       // al motor que dibuja
// del lado del otro motor: posición glTF = [x, z, y] (MC.Puente.aGltf)
```
- La simulación sigue siendo la de Motor City (Terreno, Cuerpo, Urbe, Historias…). El otro motor solo dibuja.
- Es la arquitectura de los juegos en red: un servidor autoritativo y clientes que dibujan.

### Nivel 3 · Lo que conviene hacer para otro motor
1. **Primero el juego en Motor City**, liviano, para validar que es divertido en un celular.
2. **Después exportar el mundo** y llevar el arte final (los atlas de ChatGPT valen en cualquier motor).
3. **El peso y la vida** (`MC.Vida`) y los **estilos** (`MC.Estilo`) son ideas fáciles de rehacer en un *shader*:
   - el cómic, con semitono por luminancia y contorno por normales;
   - el manga, con umbral y trama;
   - el anime, con *cel shading* en bandas;
   - la novela, con umbral y un color de acento.

   Están descritos con sus fuentes en `docs/INSPIRACION-VISUAL.md`.
4. **Lo que no se lleva:** el guardado de cada juego y su interfaz, que se hacen en el motor de destino.

### Los contratos mínimos de la entrega maestra, y dónde están en Motor City
La entrega maestra (§12.3) pide separar la simulación del dibujo con contratos estables. Así se corresponden hoy:

| Contrato | En Motor City | Estado |
|---|---|---|
| `IInput` | `MC.Controles` y `MC.Manejo` (acciones: mover, saltar, turbo, bajar, subir) | ✅ |
| `IWorldClock` | `MC.Reloj` y `MC.Bucle` (paso fijo de 1/60 s; hitstop con `MC._pausaImpacto`) | ✅ |
| `IPhysicsWorld` | `MC.Cuerpo`, `MC.Terreno` (suelo, pendiente, agua, obstáculos) | ✅ · suspensión por rueda en C‑M21 |
| `IRenderBridge` | `MC.Vistas`, `MC.arte`, `MC.Pieles`, `MC.Estilo` | ✅ · vista three.js o WebGPU en C‑M18 |
| `IAudioBridge` | `MC.Sonido`, `MC.Paisaje`, `MC.Musica` | ✅ |
| `IWorldStreamer` | Mundo MC4 por celdas, `MC.Losas` con presupuesto | 🟡 · sectores dormidos en C‑M22 |
| `IAgentWorld` | `MC.Poblacion`, `MC.Trafico`, `MC.Transporte`, `MC.Urbe` | ✅ |
| `ISaveSystem` | Cada juego guarda lo suyo | ⏳ `MC.Guardado` versionado en C‑M22 |
| `IQualityProfile` | `MC.GPU`, `MC.ResDinamica`, `E.calidad`, y en Mandados Ajustes → Calidad (automática, baja, media o alta) | ✅ |

**Esquemas versionados** (`schemas/`, `schema_version: 1`), que comprueba `MC.Contratos.validar(dato, esquema)`:
- `escena.schema.json`, lo que sale de `MC.Exportar.escena`;
- `puente.schema.json`, lo que sale de `MC.Puente.instantanea`;
- `entidad.schema.json`, la entidad persistente que propone la entrega (§16.3).

**La regla de la entrega que el motor cumple:** la calidad gráfica cambia el aspecto, nunca la física. Una frenada mide lo mismo en un celular bajo y en uno alto.


---

# ANEXO E4. Entrega maestra de referencias (del autor) (`docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`)


**Versión:** 1.0 de unificación · **Fecha:** 19 de noviembre de 2026  
**Fuentes fusionadas:** `ENTREGA-REELS.md` (análisis anterior) + `Referencias y Arquitectura para Motor City.md` (reporte de Gemini) + videos MP4 adjuntos en ambas entregas.  
**Producto objetivo:** motor/sistema de videojuego de mundo abierto orientado primero a teléfonos móviles, con arquitectura reutilizable en PC y adaptadores para otros motores.  
**Naturaleza del archivo:** documento de diseño, investigación visual, especificación preliminar y plan de implementación; no es código ni certificación de rendimiento.

### Índice

1. Resumen ejecutivo y decisiones principales
2. Método, alcance, fiabilidad y reconciliación
3. **25 fichas principales de referencia**, tablas completas del reporte de Gemini
4. Estado de comprobación de las 25 fichas y archivos fuente
5. **14 enlaces de Instagram**, una fila por enlace y siete columnas solicitadas
6. Observaciones independientes de los primeros nueve videos
7. Inspección directa de los 17 clips de referencia identificados
8. Cinco técnicas prioritarias consolidadas
9. Identidad artística, paletas y mecánicas transferibles
10. Sensación de peso: locomoción, vehículos y cámara
11. Sensación de vida: NPC, tráfico, clima y persistencia
12. Arquitectura portable y contratos de interfaces
13. Rendimiento y calidad adaptativa en móvil
14. Fases de construcción y pruebas de aceptación
15. Decisiones finales, límites y riesgos
16. Recomendaciones operativas y protocolo para agentes IA
17. Fuentes externas y trazabilidad

---

### 1. Resumen ejecutivo

**Tesis:** la percepción de peso surge de contactos, aceleraciones, desaceleraciones, anticipaciones, cambios de apoyo, deformación aparente, sonido y cámara; la percepción de vida surge de cambios autónomos y respuestas del entorno. No se requieren gráficos hiperrealistas, pero sí reglas coherentes, reacciones visibles y controles precisos.

**Directrices fusionadas:**

- **Motor City debe ser primero un simulador de estados y relaciones**, no un renderizador con una ciudad decorativa. Física, horarios, clima, tráfico y persistencia tienen identidad propia.
- **Primero interacción tangible, luego fidelidad gráfica.** La ciudad reacciona a frenadas, lluvia, peatones, obras, cambios de horario y colisiones; el jugador recibe confirmación visual y sonora.
- **Compatibilidad por contratos, no promesas de exportación mágica.** Los modelos, datos y reglas de simulación pueden tener formatos portables; cada motor requiere integración, ajuste de física y reimplementación de partes gráficas.
- **Ciudad de detalle variable:** el entorno cercano se simula; el lejano se resume y se representa; lo descargado conserva cambios persistentes relevantes.
- **Tres niveles de calidad** para mantener el mismo gameplay en móviles diferentes, con presupuesto de CPU/GPU/RAM/temperatura.
- **Herramientas para IA:** un editor declarativo validado permite que Claude u otro asistente genere barrios y misiones mediante comandos y esquemas, pero la salida debe pasar pruebas antes de ingresar al proyecto.

**Alcance real de la evidencia:** hay **25 fichas temáticas recopiladas por Gemini**, **14 URLs originales**, **17 fichas con un MP4 observable** y **una ficha adicional (*Town Brush*) identificada de forma indirecta**. Las siete fichas restantes dependen solamente de la descripción del informe de Gemini. Esto **no significa 25 obras o videojuegos distintos**: *Still The Game* figura dos veces por mostrar aspectos diferentes y el material del carrusel incluye un resumen y seis demostraciones individuales. Las 14 URLs **no pueden vincularse automáticamente con las fichas** salvo la relación indirecta documentada para *Town Brush*.

---

### 2. Método, alcance y fiabilidad

**Niveles usados para las afirmaciones:**

- **Directa:** se inspeccionaron fotogramas del MP4 adjunto; permite describir lo visible, **no** verificar motor, código, shaders, físicas o cifras de rendimiento.
- **Indirecta:** se dispone de una descripción externa que vincula un identificador de Instagram con un proyecto; no sustituye el metraje.
- **Solo Gemini:** descripción proporcionada por el segundo informe, útil para hipótesis de diseño pero sin video verificable en los adjuntos disponibles.
- **Propuesta Motor City:** decisión o técnica sugerida por los análisis, que **no afirma** ser exactamente la usada en la referencia.

**Reconciliación:** El reporte de Gemini contiene interpretaciones más específicas (p. ej., *Wave Function Collapse*, ECS de 1000 NPC, sombreado concreto, simuladores en WebGL, formato MIT y generación en 0,08 s) que la inspección visual no puede demostrar. Se conservan en las fichas para no perder sus ideas, pero quedan clasificadas como **hipótesis o afirmaciones del reporte, no como hechos verificados**. El análisis anterior, más conservador, se conserva para describir qué sí se ve y qué no se sabe.

**Por qué hay varias tablas:** las **25 fichas** agrupan temáticamente los materiales de Gemini; las **14 URLs** conservan exactamente el alcance del encargo original; el **registro de clips** documenta el respaldo audiovisual. No sumar tablas como si representaran proyectos distintos.

---

### 3. Referencias de Gemini: 25 fichas completas

> **Procedencia de todas las filas de este apartado:** texto del documento de Gemini, reproducido en detalle y reorganizado en tres grupos. La columna “técnica” describe **lo que Gemini interpreta que parece utilizar**; por sí sola no verifica una implementación. La columna final representa **ideas para Motor City**, no una orden de copiar arte ajeno.

#### Bloque A — Fichas R01–R10

| Enlace o referencia | Qué se ve (1–2 frases) | Estilo visual | Sensación de peso | Sensación de vida | Técnica aparente / hipótesis | Qué copiaríamos como principio para mundo abierto móvil |
|---|---|---|---|---|---|---|
| **#1** — *The Sound of Fury* (`@donindies`) | Un pianista desciende a un infierno surrealista peleando con una batuta de director de orquesta y combos musicales que invocan instrumentos y trazos de tinta. Combina exploración en tercera persona con combates rápidos llenos de efectos gráficos. | Cómic / novela gráfica oscura con *cel-shading* y trazos de tinta pintados a mano. | Pausas en el golpe (*hitstop*), sacudida de cámara, enemigos lanzados por el aire, explosiones de tinta negra y estelas pesadas al golpear. | Cabello y gabardina ondeando al viento, bandadas de cuervos negros, flores meciéndose y partículas brillantes flotando. | Sombreado plano (*cel-shading*), contornos negros (*outlines*), VFX 2D integrados en 3D (pentagramas, tinta) e iluminación dramática. | Contornos ligeros en personajes + VFX 2D tipo cómic (baratos en GPU) y *hitstop* de pocos milisegundos para que cualquier impacto se sienta contundente. |
| **#2** — Arte Sci-Fi (`@joshwhite_artist`) | Secuencia de escenarios monumentales de ciencia ficción: megaestructuras colosales, un explorador frente a un acantilado con nubes iluminadas y combates de naves espaciales. Destaca por su escala épica y texturas impresas. | Novela gráfica / ilustración sci-fi estilizada con tramas de impresión (*halftone*). | Escala masiva lograda por movimiento lento y paralaje entre naves diminutas y estructuras gigantes; estelas densas y destellos de disparo. | Tráfico lejano de naves, neblina atmosférica, nubes iluminadas y partículas/luces parpadeantes en la distancia. | Iluminación atmosférica/volumétrica, filtros de trama (*halftone* / *dithering*), alto contraste y composición por siluetas. | Niebla de distancia con gradiente de color y tramas sutiles en sombras para disimular el recorte de distancia (*draw distance*) en móvil y dar sensación de ciudad gigante. |
| **#3** — Calle Cyberpunk (`@maciejdrabik_art`) | Una calle urbana nocturna bajo un tren elevado con tráfico constante, multitudes caminando, vapor saliendo del suelo y neones reflejados en el asfalto mojado. Todo está renderizado con una textura pictórica pixelada. | Pictórico impresionista / pixel art 3D cyberpunk (pinceladas cuadradas). | Paso lento, continuo y masivo del tren elevado por encima de la calle; vehículos avanzando con faros que barren el asfalto. | Multitud densa de peatones, tráfico fluido, vapor ascendente, neones vibrantes y reflejos cambiantes en el suelo húmedo. | Post-procesado pictórico/pixelado sobre escena 3D, iluminación nocturna multicolor, partículas de vapor y reflejos planos/SSR en el piso. | Usar baja resolución estilizada (filtro pictórico/pixel) con luces de neón y reflejos simples en charcos: ahorra muchísima batería/GPU y hace que la ciudad se vea viva y densa. |
| **#4** — *KnoxMap* para *Project Zomboid* (`@luis.gamingg`) | Tutorial de una herramienta que toma cualquier zona real de OpenStreetMap (ej. La Serena, Chile) y genera automáticamente un mapa jugable con calles, edificios, muebles, botín y población de zombis proporcional al mundo real. | Isométrico 2.5D / *low poly* retro. | Escala urbana realista de manzanas, avenidas y edificios densos que obligan a recorrer distancias creíbles. | Generación procedural de interiores, mobiliario y densidad de NPCs/entidades basada en la densidad real de cada edificio. | Ingesta de datos geoespaciales (OpenStreetMap), generación procedural de edificios/interiores y carga modular por zonas (*streaming*). | Un generador procedural de manzanas y calles basado en plantillas o datos reales (OSM) + *chunk streaming* para crear ciudades enormes sin ocupar gigabytes en el teléfono. |
| **#5** — *Brad Pitt Top 4 Movies* (estilo PS2/GTA) | Recreación de escenas icónicas de 4 películas (*Se7en*, *Once Upon a Time in Hollywood*, *Inglourious Basterds*, *Fight Club*) usando estética de videojuegos clásicos de PS2/GTA con personajes expresivos. | *Mid-poly* retro 3D (estilo PS2 / GTA clásico) con texturas pintadas a mano. | Puñetazo en *Fight Club* con retroceso inmediato del torso y cabeza, conducción estable del auto clásico y lenguaje corporal marcado. | Flashes de cámaras de paparazzi, multitud en el fondo, luz cálida del atardecer con *lens flare* al conducir y expresiones faciales claras. | Modelado de bajos/medios polígonos con texturas difusas pintadas (*hand-painted*), iluminación cinematográfica y animación facial por *blendshapes* o texturas. | Estética *mid-poly* estilo PS2 con texturas bien pintadas: corre a 60 FPS en cualquier celular y permite personajes expresivos sin necesitar shaders hiperrealistas. |
| **#6** — *Project Zomboid* en 3ª persona 3D | Demostración de un mod que transforma un juego isométrico en una experiencia inmersiva en tercera persona 3D: el personaje camina por casas, repara circuitos sentado en la cama, pelea con zombis, lee libros y mira campos abiertos. | *Low poly* 3D retro con iluminación suave. | Golpes lentos y pesados con armas cuerpo a cuerpo que derriban al enemigo con salpicadura y caída; caminar pausado y deliberado. | Nubes moviéndose, vegetación en el horizonte, ciclo día/noche con luz cálida de atardecer, sombras largas y animaciones cotidianas (leer, atornillar). | Cámara dinámica en tercera persona sobre el hombro, sombras proyectadas en tiempo real y animaciones contextuales de interacción con objetos. | Animaciones cotidianas y táctiles (abrir puertas, reparar, sentarse) + iluminación cálida de hora dorada: elevan enormemente la inmersión incluso con modelos *low poly*. |
| **#7** — *Fable Rover ER-6* (`@patricio.incoders`) | Aplicación interactiva 3D que simula un rover de exploración de 6 ruedas con paneles solares desplegables, pruebas sobre dunas, rocas y hielo, y un panel lateral con telemetría física en tiempo real. | *Low poly* técnico / estilizado tipo maqueta CAD / LEGO moderno con UI limpia. | Suspensión articulada independiente en las 6 ruedas que se comprime y adapta a cada roca o duna; inclinación realista del chasis. | Despliegue animado de paneles solares y sensores, interacción directa con distintos tipos de suelo y gráficas vivas de telemetría. | Física vehicular por rueda (*raycast* / restricciones de suspensión cinemática), UI técnica en tiempo real y sombreado suave limpio. | Suspensión independiente basada en *raycast* (muy ligera en CPU) para que los autos en Motor City reaccionen a baches, aceras y rampas con peso creíble. |
| **#8** — *Mythictale* (`@vandal`) | RPG de acción indie inspirado en *Dragon Ball* clásico, mostrando combates rápidos en un torneo con sprites pixel art sobre una arena 3D y exploración en un mapa abierto con bosques y agua. | Pixel art / HD-2D (sprites 2D con contorno negro sobre escenarios 3D). | Pausas de impacto (*hitstop*), destellos al chocar golpes, rebote al ser lanzado contra el suelo, ondas de choque y choque de rayos de energía. | Público animado saltando en las gradas, auras de energía chispeantes, polvo al correr y caer, agua con brillo animado y vegetación. | Animación por cuadros (*frame-by-frame*), técnica HD-2D (sprites en mundo 3D con sombras proyectadas) y partículas de energía. | Usar *billboards* o sprites 2D animados para multitudes lejanas, vegetación o efectos de impacto (polvo, chispas) para llenar la ciudad de vida a costo casi cero. |
| **#9** — *Motor Town: Behind The Wheel* (`@apknoo.es`) | Simulador de mundo abierto de conducción con gráficos minimalistas pero físicas profundas: taxis, buses, camiones con carga, policía, grúas, bajar del vehículo para empujarlo o cargar gasolina, clima y daños. | *Low poly* minimalista y colorido con sombreado plano/suave. | Balanceo de carrocería (*body roll*), suspensión visible en derrapes y baches, humo de llantas, polvo en tierra, empuje manual del auto y peso físico de la carga. | Tráfico IA, peatones/pasajeros, ciclo día/noche, lluvia con reflejos en el asfalto mojado, nubes estilizadas y misiones dinámicas en la ciudad. | Física vehicular avanzada (curvas de agarre de neumáticos, centro de gravedad, peso de carga), shader de asfalto mojado y mallas *low poly* optimizadas. | **Referencia núcleo para Motor City:** sacrificar polígonos en favor de física de conducción profunda (suspensión, derrape, peso de carga) + ciclo día/noche y lluvia con reflejos. |
| **#10** — *Townbrush* (`@townbrush`) *(también en Parte 2)* | Constructor de paisajes mediterráneos/toscanos para iPhone y PC donde el usuario "pinta" pueblos, ríos, puentes y árboles que aparecen de forma orgánica con estética acogedora. | Pixel art 3D / acuarela digital pixelada (paleta cálida mediterránea). | Efecto de rebote elástico (*squash & stretch* / *pop*) al colocar o pintar edificios, árboles y caminos sobre el terreno. | Agua brillante con barquitos y patos nadando, humo de chimeneas, cipreses meciéndose al viento, gente y ovejas caminando, lluvia suave y luz dorada. | Renderizado 3D con shader *pixel-perfect*, generación procedural por adyacencia (estilo *Wave Function Collapse*) y animaciones ambientales por *vertex shader*. | Animación de viento en árboles y agua por *vertex shader* (casi gratis en GPU móvil) + detalles ambientales diminutos (humo, pájaros, reflejos de agua) que dan alma al mapa. |

#### Bloque B — Fichas R11–R18

| Enlace o referencia | Qué se ve (1–2 frases) | Estilo visual | Sensación de peso | Sensación de vida | Técnica aparente / hipótesis | Qué copiaríamos como principio para mundo abierto móvil |
|---|---|---|---|---|---|---|
| **#11** — *Cairn* (`@elreagamingok`) | Simulador de escalada y supervivencia en montaña donde armas tu propia ruta en paredes verticales, vendando tus dedos, gestionando agua/comida, armando campamento y resistiendo tormentas. | Cómic / novela gráfica 3D estilizada (*cel-shading* suave con contornos tipo *ligne claire*). | Tensión muscular y temblor en las extremidades al sostenerse, mochila cargada, cuerdas tensándose y caídas con física dura de impacto. | Nubes envolviendo picos, tormentas de nieve iluminadas con linterna frontal, arcoíris, viento en cintas y tela, y gestos cotidianos íntimos. | Cinemática inversa (IK) procedural para manos y pies, *cel-shading* con iluminación atmosférica y micro-animaciones táctiles. | IK ligero para que el personaje pise escalones o se apoye en vehículos de forma natural + gestos táctiles breves (cargar combustible, reparar) que humanizan el mundo. |
| **#12** — Conducción en Desierto/Playa (`@mamon.xx` — Godot) | Un todoterreno 4x4 en cámara cenital atraviesa un desierto rompiendo vallas de madera y derrapa por la arena de una playa junto a olas turquesas mientras ahuyenta gaviotas. | *Low/mid-poly* estilizado con iluminación solar limpia y cálida (diorama *top-down* en Godot). | Destrucción física de cercas de madera al chocar, densas columnas de arena levantadas por las llantas, derrapes con inercia y surcos profundos permanentes en la arena. | Gaviotas que levantan vuelo al acercarse el auto (proyectando sombras), olas con espuma animada en la orilla, pastizales y luz cálida. | Motor Godot 3D, física vehicular con derrape, deformación/huellas en terreno (*render target*), partículas de polvo, shader de agua costera e IA reactiva de aves. | **Imprescindible para Motor City:** fauna reactiva barata (aves/palomas que huyen al pasar el auto), *props* urbanos rompibles (vallas, conos) y surcos persistentes en arena/tierra. |
| **#13** — Acción/Supervivencia Pixel 3D (`@indie.gamesdaily`) | Tráiler de un juego urbano oscuro post-soviético que alterna sin cortes entre vista isométrica, plano lateral, disparos sobre el hombro y conducción nocturna en primera persona bajo lluvia. | Pixel art 3D / HD-2D oscuro y cinematográfico (baja resolución con iluminación dinámica). | Paso retumbante de un tren por las vías, retroceso seco al disparar, parabrisas que se agrieta al atropellar un enemigo y caídas pesadas al saltar del tren. | Limpiaparabrisas barriendo gotas de lluvia, faros iluminando árboles nocturnos, farolas con halos de luz y partículas, y neblina espesa. | Renderizado 3D con shader de pixelación, iluminación dinámica por píxel, transiciones fluidas entre cámaras (isométrica ↔ 3ª ↔ 1ª persona) y cabina interactiva. | Modo de conducción en primera persona con tablero estilizado, limpiaparabrisas y faros nocturnos + transición suave entre cámara aérea/ciudad y cámara cercana. |
| **#14** — *Still The Game* — 4 Estaciones y 1000 NPCs (`@still.the.game`) | Avance del juego isométrico mostrando un ciclo rápido de 24 horas (09:33 a 22:59), cambio de invierno nevado a verano soleado, 1000 ciudadanos simulados con memoria/emociones y apagón nocturno con farolas. | Diorama isométrico 3D realista estilizado (arquitectura de Europa del Este). | Autos abriéndose paso con tracción pesada por la nieve, arquitectura masiva y sombras largas que giran de forma continua sobre los bloques de edificios. | Reloj de 24h con luz cambiante, transición de estaciones, rutinas de 1000 ciudadanos, ventanas encendiéndose de noche y conos de luz de farolas entre árboles. | Ciclo solar dinámico con sombras direccionales, simulación masiva de agentes (ECS ligero para 1000 NPCs) y materiales intercambiables por estación. | Simulación de población con ECS ligero (rutinas simples de tráfico/peatones) + ciclo día/noche donde las ventanas y farolas se encienden progresivamente al anochecer. |
| **#15** — Ciudades Reales en Pixel Art (65 ciudades con IA) | Mapa web interactivo de 65 ciudades reales (Madrid, Barcelona, Valencia, CDMX, Buenos Aires) dibujadas edificio a edificio en pixel art isométrico con IA, con minijuegos de carreras, vuelo y construcción colaborativa. | Pixel art isométrico detallado (estética *SimCity 2000* / ilustración arquitectónica). | Densidad arquitectónica real que da escala tangible a las avenidas, derrapes simples en curvas y sensación de altura al sobrevolar edificios con sombra proyectada. | Construcción colaborativa en vivo (jugadores levantando la Sagrada Familia piedra a piedra), carreras con rivales y nubes deslizándose sobre el mapa. | Generación asistida por IA de *tilesets* isométricos desde datos geográficos reales, motor web 2D de zoom fluido y capas multijugador ligeras. | Minijuegos rápidos integrados sobre el mismo mapa abierto (carreras por avenidas, vuelos de reconocimiento, retos de ubicación o eventos comunitarios). |
| **#16** — *CityRT* (`cityrt.com/play/`) | Constructor y simulador de ciudades 3D que corre directo en el navegador: trazas calles, levantas edificios con andamios, gestionas asesores con personalidad y desatas desastres (tornados, zombis). | Cómic / *cel-shading* 3D con contornos negros (*outlines*) y paleta europea cálida. | Edificios en obra con andamios y polvo, ruinas y calles destrozadas tras desastres, y humo denso saliendo de fábricas. | Tráfico continuo de autos/trenes, peatones, asesores con diálogos reactivos, sombras de nubes, botones para "caminar" a pie de calle y emergencias dinámicas. | WebGL / Three.js optimizado para navegador, *cel-shading* con detección de bordes, interfaz de tarjetas limpia y cámara orbital + peatonal. | Estética *cel-shading* con contornos finos corriendo fluida en web/móvil + botón para bajar a caminar por las calles que creaste + eventos de desastre/emergencia. |
| **#17** — *Miniopolis* (Edificios Modulares + Filtros) | Herramienta de construcción arquitectónica donde levantas un edificio piso por piso con bloques brillantes, añades balcones, ascensores y antenas, y alternas filtros visuales en vivo (*Comic, CRT, Vintage, Vibrant*). | Realista estilizado / maqueta arquitectónica con filtros de post-procesado intercambiables. | Golpe seco con nube de polvo, chispas y micro-vibración cada vez que encaja una planta o módulo; sombras arquitectónicas sólidas. | Peatones diminutos caminando por la acera, agua del puerto con reflejos, árboles y transformación total de la atmósfera al cambiar de filtro. | Construcción modular por grilla/extrusión (*snapping* inteligente), partículas de impacto al construir y **pipeline de post-procesado intercambiable** (LUTs, *outlines*, CRT). | **Oro para el editor de Motor City:** construcción modular rápida de edificios + **selector de filtros visuales en tiempo real** (*Comic, Vintage, CRT, Vibrant*) para cambiar el estilo del motor con un clic. |
| **#18** — *VoxPix* (`github.com/andyeswong/voxpix`) | Herramienta *open-source* (MIT) "hecha por agentes para agentes" donde una IA genera un paisaje completo (río, lago, castillo, casas, árboles, 11 antorchas) en 0.08 s vía código (`vp.box`, `vp.water`, `vp.light`), convirtiendo vóxeles en pixel art. | Vóxel 3D renderizado a pixel art isométrico con iluminación dinámica. | Bloques volumétricos con relieve sólido y sombras proyectadas nítidas que definen el terreno. | Transición suave de día a noche donde se encienden 11 luces cálidas (antorchas y ventanas) iluminando dinámicamente el mapa pixelado. | API programática de vóxeles controlada por agentes IA (sin ratón), proyección ortográfica a pixel art e iluminación dinámica por vóxel. | **Pieza clave para desarrollar con Claude:** exponer una API en código limpio (`city.road()`, `city.building()`, `city.light()`) para que **Claude genere y modifique barrios enteros en milisegundos**. |

#### Bloque C — Fichas R19–R25

| Enlace o referencia | Qué se ve (1–2 frases) | Estilo visual | Sensación de peso | Sensación de vida | Técnica aparente / hipótesis | Qué copiaríamos como principio para mundo abierto móvil |
|---|---|---|---|---|---|---|
| **#19** — *Still The Game* — Evolución Nieve (`@still.the.game`) | Comparativa "cómo empezó vs. cómo está ahora": pasa de un todoterreno *low-poly* probando suspensión sobre una rampa de madera a una ciudad invernal nevada con faros, derrapes y huellas profundas. | Realista estilizado / diorama isométrico 3D atmosférico. | Suspensión muy visible al cruzar listones de madera, derrape con inercia en la nieve, frenado pesado y surcos/huellas permanentes hundidos por las llantas. | Copos de nieve cayendo en 3D, faros del auto proyectando sombras largas a través de árboles secos y nubes de nieve levantadas al acelerar. | Física de suspensión, deformación/huellas en nieve (*render texture* dinámico), iluminación direccional de faros y partículas de nieve. | Huellas dinámicas en barro/nieve/arena mediante *render target* ligero + faros con sombras dinámicas de noche para conducción táctil. |
| **#20** — *Induction Bench* — Campo Magnético 3D (`@sebaslopezinnova`) | Simulador científico 3D hecho con Claude Opus 5.5 donde el usuario mueve un imán por una bobina, cambia materiales y ve en vivo las líneas de campo magnético, un osciloscopio y un galvanómetro. | Técnico / científico 3D oscuro (estética de laboratorio de precisión con UI clara). | Inercia y amortiguación (*damping*) al arrastrar/soltar el imán; deformación elástica continua de las líneas de flujo. | Líneas de campo 3D que se reacomodan al instante, agujas analógicas vibrando, gráficas del osciloscopio en vivo y brillo reactivo. | Simulación física en tiempo real (WebGL/Three.js), renderizado de líneas/vectores 3D, shaders por intensidad y telemetría sincronizada. | Un **laboratorio/depurador de físicas en vivo** integrado en Motor City (gráficas de suspensión, agarre y torque) para calibrar el peso de los vehículos con Claude. |
| **#21** — *AngioSim* — Corazón 3D (`@sebaslopezinnova`) | Herramienta médica 3D hecha con Claude que muestra un corazón translúcido con arterias coloreadas junto a una vista simulada de rayos X (angiograma) sincronizada con un brazo robótico virtual. | Visualización médica 3D translúcida + monocromo de rayos X (UI oscura profesional). | Rotación suave y precisa de la cámara y del brazo mecánico sincronizado; contraste de densidad en la proyección radiográfica. | Profundidad anatómica por transparencias y capas iluminadas; respuesta simultánea de múltiples vistas (3D + 2D proyectado). | Renderizado *multi-viewport* sincronizado, shaders de transparencia/Fresnel (*X-ray*) y proyección ortográfica en tiempo real. | Vista de "rayos X" o corte transparente en el taller mecánico de Motor City para inspeccionar motor, chasis, suspensión y daños internos en 3D. |
| **#22** — *FireTrace* — Mapa de Incendios 3D (`@sebaslopezinnova`) | Plataforma 3D hecha con Claude Opus 5.5 que simula la propagación de incendios forestales sobre terreno topográfico real, con línea de tiempo, cámara de drones en vivo y visión térmica/infrarroja. | Cartografía 3D realista / táctico satelital con capas de datos y visión térmica (FLIR). | Relieve topográfico real con escala masiva, avance implacable del frente de fuego y movimiento aéreo estable de los drones. | Propagación dinámica del incendio por el terreno, columnas de humo, íconos de unidades, telemetría climática y cambio entre cámara óptica y térmica. | Terreno 3D con mapas de elevación (DEM), simulación de propagación por grilla/celdas, *picture-in-picture* (dron) y shader térmico. | Un **mapa táctico 3D / modo dron** para explorar la ciudad, monitorear eventos dinámicos (incendios, tráfico, clima) y activar visión térmica o nocturna. |
| **#23** — *Ballpoint Gambit* — Ajedrez en Cuaderno (`@sebaslopezinnova`) | Juego de ajedrez hecho con Claude Sonnet 5.5 dibujado a mano con lápices de colores y bolígrafo sobre papel de cuaderno, donde cada pieza es una criatura con personalidad y los márgenes tienen garabatos animados. | Ilustración a mano / cuaderno escolar (lápiz de color, bolígrafo y textura de papel). | Saltos con arco y pequeño impacto al caer la pieza; empujones cómicos y micro-pausas cuando una criatura captura a otra. | Criaturas que parpadean, se asustan o celebran; garabatos vivos en los márgenes (ballena, sol, luna, notas) y trazos que se dibujan solos. | Animación 2D procedural y por cuadros (*spritesheets*), *squash & stretch* por código y textura de papel superpuesta (*multiply*). | Aplicar una **UI diegética tipo libreta/mapa de papel** (libreta de misiones, planos dibujados a mano, *squash & stretch* en botones) para dar personalidad propia. |
| **#24** — 20 Haikus Animados en Código (`@sebaslopezinnova`) | Colección de 20 poemas cortos (haikus) generados con Claude Haiku 5.5, cada uno acompañado por una micro-animación artística minimalista dibujada 100% con código JavaScript (lluvia, ondas, nieve, tranvía, brasas). | Minimalista / arte generativo 2D (tinta, papel, grabado y diagramas poéticos). | Ritmo pausado de las ondas en el agua, pliegue del papel y tensión de las cuerdas vibrantes. | Gotas formando círculos concéntricos, copos cayendo, líneas de tranvía avanzando, brasas parpadeando y vegetación creciendo proceduralmente. | Arte generativo puro en **HTML5 Canvas / JavaScript** (sin assets pesados), ruido procedural y física ligera de ondas/partículas. | Usar **Canvas / shaders procedurales ligeros** para efectos atmosféricos de pantalla (gotas en el parabrisas, ondas en charcos, pantallas de carga) con peso casi nulo en MB. |
| **#25** — Apuntes a Mano → Fuente Tipográfica (`@sebaslopezinnova`) | Flujo automatizado con Claude Opus 5.5 que toma 120 fotos de apuntes a mano, limpia el papel, vectoriza los trazos conservando imperfecciones y genera una fuente real (`.TTF`/`.WOFF2`) con 3 variantes por letra. | Tipografía artesanal / diseño editorial limpio sobre papel rayado. | Trazos vectoriales limpios con grosor orgánico consistente y variaciones sutiles al escribir. | Animación de escritura letra por letra y alternancia automática de variantes (*OpenType alternates*) para que el texto parezca vivo. | Visión por computadora + vectorización de esqueletos de trazo (*stroke path*) + compilación automática de fuentes con *kerning* y glifos múltiples. | Crear una **tipografía propia** para carteles de la ciudad, matrículas, grafitis y menús de Motor City usando pipelines con Claude, evitando fuentes genéricas. |

---

### 4. Trazabilidad y grado de comprobación de las 25 fichas

Los nombres de los MP4 se abrevian por legibilidad; se refieren a archivos aportados por el usuario, no a URLs de Instagram confirmadas. Los muestreos visuales de los **nueve archivos nuevos** se realizaron alrededor del 20 %, 50 % y 80 % de su duración; los anteriores ya se habían muestreado en el informe inicial.

| Ficha | Nivel de evidencia | Archivo/indicio asociado | Límite de la comprobación |
|---|---|---|---|
| R01 | **Directa** | `La batuta de un director de orquesta…(.mp4` | Secuencias artísticas del juego; origen y algoritmos por confirmar |
| R02 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R03 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R04 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R05 | **Directa** | `Brad Pitt_s 4 best movies…mp4` | Recreaciones estilizadas; no se infiere el pipeline exacto |
| R06 | **Directa** | `Project Zomboid nunca había sido tan inmersivo…mp4` | Personaje e interiores 3D; naturaleza exacta del mod por confirmar |
| R07 | **Directa** | `VID_20261119_162639_381.mp4` | Rover 3D y controles; técnica vehicular interna no comprobada |
| R08 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R09 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R10 | **Indirecta** | `Instagram DfvyT1QIFIQ; descripción independiente en informe original` | Contenido atribuido a Town Brush; no se inspeccionó el reel original |
| R11 | **Directa** | `VID_20261119_162235_462.mp4` | Escalada y montaña, inspección en entrega anterior |
| R12 | **Directa** | `VID_20261119_162206_705.mp4` | Todoterreno sobre arena y costa; agua y huellas visibles |
| R13 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R14 | **Directa** | `VID_20261119_162228_194.mp4` | Barrio, estaciones y horario; número/memoria de NPC no auditados |
| R15 | **Directa** | `¿Sabrías decir en qué esquina de tu ciudad estás…mp4` | Mapas urbanos estilizados y elementos de interfaz |
| R16 | **Directa** | `Now u can build your own city(MP4).mp4` | Constructor de ciudad y ajustes; tecnología web concreta por confirmar |
| R17 | **Directa** | `Using a variety of block types… Miniopolis…mp4` | Edificios modulares y comparación de filtros en pantalla |
| R18 | **Solo Gemini** | `No se aportó un clip identificable` | Descripción de Gemini no contrastada con video accesible |
| R19 | **Directa** | `VID_20261119_162439_208.mp4` | Comparativa del prototipo con escena nevada |
| R20 | **Directa** | `Claude compartió…_4.mp4` | Líneas de campo magnético 3D y controles |
| R21 | **Directa** | `Claude compartió…_5.mp4` | Visualización de corazón y paneles médicos |
| R22 | **Directa** | `Claude compartió…_1.mp4` | Mapa de incendio sobre relieve y vistas de datos |
| R23 | **Directa** | `Claude compartió…_2.mp4` | Ajedrez ilustrado y movimientos por cuadros |
| R24 | **Directa** | `Claude compartió…_6.mp4` | Animaciones de haikus y composiciones gráficas |
| R25 | **Directa** | `Claude compartió…_3.mp4` | Ejemplos de fuente manuscrita y proceso visual |

**Resultado del cruce:** 17 fichas con clips directos, 1 ficha sustentada indirectamente, 7 fichas descritas solo por Gemini. **No** se han verificado cifras como “1000 NPC con memoria”, “en 0,08 segundos” o “60 FPS en cualquier celular”.

---

### 5. Registro íntegro de los 14 enlaces originales de Instagram

> Esta tabla conserva las **siete columnas solicitadas**. Por el bloqueo/limitación de acceso directo a los reels, trece entradas se registran honestamente como no verificadas. El único vínculo atribuible de forma secundaria es R10 / *Town Brush* con el enlace 03. **No se asignan los demás archivos MP4 a las URLs por coincidencias temáticas solamente.**

| Enlace | Qué se ve (1–2 frases) | Estilo visual | Qué da peso | Qué da vida | Técnica que parece usar | Qué copiaríamos para móvil |
|---|---|---|---|---|---|---|
| [01 — De64QQuCsyG](https://www.instagram.com/reel/De64QQuCsyG/) | **No verificable:** el contenido visual del reel no pudo inspeccionarse. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** documentar un efecto concreto después de ver el reel. |
| [02 — Dfaux2QFsay](https://www.instagram.com/reel/Dfaux2QFsay/) | **No verificable:** no hay imágenes accesibles del contenido. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** extraer una mecánica o recurso visual comprobado. |
| [03 — DfvyT1QIFIQ](https://www.instagram.com/reel/DfvyT1QIFIQ/) | **Confirmación indirecta:** muestra *Town Brush*, un juego de pixel art donde, al pintar con el dedo, el paisaje de un pueblo cobra vida. La fuente secundaria lo describe como un proyecto del autor del reel; no se vio el metraje original. | **Pixel art** (según fuente secundaria) | No hay prueba suficiente de inercia, colisiones o rebotes; el gesto de pintar se asocia a una transformación del entorno. | El escenario responde a la acción del usuario: elementos del pueblo se activan o se transforman. | **Hipótesis:** pincel como entrada, cambios de estado y animaciones ligadas a zonas pintadas; los algoritmos exactos no se conocen. | «Toque que despierta el mundo»: al tocar, limpiar, regar o reparar una superficie, activar animación, luz, sonido y cambios persistentes sin exigir gráficos costosos. |
| [04 — De9tpl3yakv](https://www.instagram.com/reel/De9tpl3yakv/) | **No verificable:** Instagram no permitió ver la escena. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** seleccionar una técnica solo tras revisar imágenes. |
| [05 — DfJFFGQRG2N](https://www.instagram.com/reel/DfJFFGQRG2N/) | **No verificable:** no se recuperaron fotogramas ni una descripción independiente identificable. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** registrar interacción y coste potencial en móvil. |
| [06 — DfpsKcEKZNx](https://www.instagram.com/reel/DfpsKcEKZNx/) | **No verificable:** contenido audiovisual inaccesible. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** decidir después si aporta física, vida ambiental o lenguaje visual. |
| [07 — Dfkim-zvyVB](https://www.instagram.com/reel/Dfkim-zvyVB/) | **No verificable:** no se pudo observar el reel. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** evaluar una sola aportación reutilizable al motor. |
| [08 — De7qMG8iZdh](https://www.instagram.com/reel/De7qMG8iZdh/) | **No verificable:** no existe material visual comprobable en esta revisión. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** verificar antes de proponer un efecto. |
| [09 — Dfpb3_vHFPb](https://www.instagram.com/reel/Dfpb3_vHFPb/) | **No verificable:** sin acceso al video original. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** aislar técnica y adaptar su calidad por dispositivo. |
| [10 — Dc_s5CPsstT](https://www.instagram.com/reel/Dc_s5CPsstT/) | **No verificable:** no hay evidencia directa de su escena. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** registrar controles, cámara y respuesta si aparecen. |
| [11 — De9ZhRAIOhJ](https://www.instagram.com/reel/De9ZhRAIOhJ/) | **No verificable:** imágenes no accesibles para inspección. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** evaluar iluminación, animación o simulación según lo que muestre. |
| [12 — DdwLGJmjjvQ](https://www.instagram.com/reel/DdwLGJmjjvQ/) | **No verificable:** no pudo establecerse qué ocurre en pantalla. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** observar primero y después asignar prioridad técnica. |
| [13 — DfRe6pQzWzS](https://www.instagram.com/reel/DfRe6pQzWzS/) | **No verificable:** faltan fotogramas verificables. | No determinable | No evaluable | No evaluable | No inferible sin fotogramas | **Pendiente:** elegir una solución reproducible a partir de evidencia. |
| [14 — DfDkDxQiQS7, imagen 2](https://www.instagram.com/p/DfDkDxQiQS7/?img_index=2) | **No verificable:** se trata de una publicación con parámetro de imagen 2; ese fotograma no fue accesible. | No determinable | No evaluable | No evaluable | No inferible sin la imagen | **Pendiente:** extraer principios de composición o dirección artística cuando se aporte la diapositiva. |

**URL n.º 3 — fuente de identificación indirecta:** [reseña/revisión externa del proyecto Town Brush](https://develog.develrocket.com/@wnqudgus1234/쇼츠-뜯어보기-공유가-좋아요의-66배-어제-오늘-뜬-쇼츠-10개), mencionada en el primer análisis. Vincula el identificador `DfvyT1QIFIQ` al proyecto; **no** evidencia su física o código.

---

### 6. Análisis audiovisual anterior: nueve MP4 (seis proyectos, dos juegos y un collage)

> Se mantiene el análisis independiente original. Los clips A1–A6 corresponden a los proyectos R20–R25; B1 equivale a R11, B2 a R19. El montaje A0 no es un noveno proyecto. **No se vinculan aquí a ninguna URL de Instagram.**

| Archivo anterior | Qué se ve | Estilo | Peso observado | Vida observada | Técnica aparente | Aplicación sugerida |
|---|---|---|---|---|---|---|
| **A0.** Compilado `…¿Cu(M.mp4` (13,6 s) | Montaje de seis proyectos: incendio sobre mapa, ajedrez dibujado, fuente manuscrita, campos magnéticos, corazón 3D y poesía animada. | Mixto: visualización 3D, dibujo manual, interfaz y gráfico generativo. | No permite medir física de personajes; es un montaje promocional. | Variedad de escenarios que responden a datos o interacción. | Montaje con capturas, animación de interfaces y contenidos 2D/3D. | Referencia de **amplitud de sistemas**, no de física o «peso». |
| **A1.** Compilado `…¿Cu_1.mp4` (60 s) | Visor de terreno montañoso con frente de incendio, rutas y vistas superpuestas. | Terreno 3D de apariencia satelital, interfaz técnica. | Escala y relieve sugieren volumen; no se muestran golpes ni inercia del jugador. | El incendio cambia de posición/estado sobre el mapa. | Cámara sobre terreno, capas de datos, color para representar calor e interfaz temporal. | Mundo por **sectores y capas**; propagación local de eventos (fuego, humo, alertas) según reglas y presupuesto. |
| **A2.** Compilado `…¿Cu_2.mp4` (60 s) | Ajedrez con tablero cuadriculado y figuras ilustradas como recortes dibujados a mano, cambiando de posición. | Ilustración de cuaderno; cómic infantil/dibujo manual. | Movimientos discretos; no se observan impactos de fuerza relevantes. | Personajes/piezas cambian de posición; escenario reconocible y expresivo. | Sprites 2D, composición por capas, estados de turno y transición de posiciones. | **Siluetas legibles, identidad gráfica** y animaciones económicas para mapas, interiores y minijuegos. |
| **A3.** Compilado `…¿Cu_3.mp4` (60 s) | Conversión de páginas manuscritas en caracteres tipográficos, con etapas de segmentación y comparación. | Interfaz editorial, papel y tinta. | No aplica física corporal. | Una intervención humana se vuelve un sistema reutilizable. | Análisis y trazado de glifos; esta es una descripción visual, no una verificación del método. | Herramienta de autoría para **grafitis, letreros y diarios del mundo**, separada del motor de juego. |
| **A4.** Compilado `…¿Cu_4.mp4` (60 s) | Visualizador 3D de imanes y líneas de campo que se reorganizan al cambiar su configuración, con paneles de controles y gráficas. | Científico/abstracto 3D, neón sobre fondo oscuro. | El cambio de trayectoria sugiere fuerzas, pero no demuestra un motor de cuerpos rígidos. | El sistema reacciona continuamente a parámetros. | Trazado de líneas/curvas, integración de parámetros en tiempo real y cámara orbital. | **Campos de influencia** para viento, corrientes, tráfico y partículas; usar aproximaciones, no resolver campos físicos completos en cada móvil. |
| **A5.** Compilado `…¿Cu_5.mp4` (12,4 s) | Anatomía del corazón en 3D y vasos coloreados, junto con imagen angiográfica, curvas e interfaz de inspección. | Visualización médica 3D y paneles de diagnóstico. | Volumen y estratificación; sin interacción de choque observable. | Exploración de estructuras interrelacionadas. | Modelo 3D, transparencia/capas de color y vistas sincronizadas. | **Inspección por capas y resaltado contextual** de vehículos, edificios u objetos interactivos. |
| **A6.** Compilado `…¿Cu_6.mp4` (40 s) | Poemas breves sobre fondos cambiantes con patrones de líneas, círculos, nieve, textura y composición ilustrada. | Gráfico generativo, acuarela aparente en algunas escenas, trazos y collage. | No hay física de locomoción. | Movimiento de líneas y texturas; cada composición produce ambiente. | Animación procedural 2D por líneas, fondos con textura y transiciones. | **Vida ambiental barata**: hojas, reflejos, letreros, polvo y viento representados con pocas capas procedurales. |
| **B1.** `VID_20261119_162235_462.mp4` (39,6 s) | Montañismo en paredes rocosas, pasos elevados y acantilados; se ven escaladas, cuerdas y un personaje que se sujeta a la pared. | 3D estilizado con aspecto de ilustración/novela gráfica ligera. | Riesgo de caída, agarres, suspensión, distancia vertical y reajustes del cuerpo frente a la pared. **No** puede inferirse el algoritmo exacto de física del video. | Nubes, bruma, relieve y cambios de encuadre aportan atmósfera. | Animación de escalada, detección de superficies, cámara en tercera persona y uso visible de cuerda. | **Contactos confiables, esfuerzo legible y cámara con tensión controlada**; aplicarlo a correr, trepar, aterrizar y colisionar. |
| **B2.** `VID_20261119_162439_208.mp4` (14,8 s) | Comparación «How it started vs how it's now»: vehículo y rampa de un prototipo sencillo frente a una calle isométrica nevada con automóviles, árboles, edificios y huellas. | 3D estilizado, cámara isométrica; rasgos low poly, iluminación más atmosférica en la versión posterior. | Vehículo y rampa dan contexto de apoyo y desplazamiento; **no** bastan para certificar suspensión ni masas simuladas. | Nieve en movimiento, ambiente urbano, sombras, huellas/marcas y paleta de invierno. | Cámara elevada fija/isométrica, composición modular, partículas y materiales o texturas de nieve. | **Progresión de fidelidad** sin rehacer la simulación: mismo mundo lógico, distinta densidad de clima, iluminación, detalle y efectos. |

**Conclusiones de los adjuntos anteriores:** (1) «peso» depende del cuerpo apoyándose y resistiendo a su entorno, no del detalle poligonal; (2) «vida» se percibe cuando el mundo cambia y responde; (3) un mismo diseño puede aspirar a distintas capas visuales, aunque las imágenes no prueban que sus versiones compartan código.

---

### 7. Inspección directa: mapa de 17 fichas con evidencia en videos

Esta tabla resume **lo observado** de los videos identificados de ambas tandas; cumple una función diferente a las fichas interpretativas de Gemini. No pretende certificar que la técnica inferida esté implementada en el proyecto original.

| Ficha / proyecto | Imagen observada | Estilo aproximado | Peso o vida que comunica | Técnica reutilizable propuesta |
|---|---|---|---|---|
| R01 · The Sound of Fury | Combates estilizados, trazos gráficos, coreografía | 3D | Recuperación tras impacto y diseño sonoro sincronizados | Contornos y VFX, sin asumir shaders concretos |
| R05 · Brad Pitt PS2/GTA recreado | Escenas de películas reproducidas con estética retro | 2D/3D estilizado | Gestos, conducción y movimiento de personajes | Geometría moderada + texturas expresivas |
| R06 · Project Zomboid — 3ª persona | Interiores domésticos, interacción y personaje en 3ª persona | 3D | Animaciones cotidianas, pausas y presencia corporal | Interacciones contextuales y cámara cercana |
| R07 · Rover interactivo 3D | Rover simulado y vista de ingeniería interactiva | 3D | Movimiento relativo de ruedas/chasis si se valida temporalmente | Panel de telemetría con parámetros ajustables |
| R11 · Cairn / escalada | Persona trepando montaña con cuerdas y agarres | 3D | Apoyos y exposición de altura | Contactos/IK y esfuerzo legible |
| R12 · 4x4 en playa/desierto | Vehículo recorriendo arena y franja de agua | 3D | Estelas y huellas; no comprueba deformación de geometría | Material de suelo + decals y partículas |
| R14 · Still The Game — ciclo diario | Edificios, peatones y cambios de hora/luz | 3D | Tiempo urbano y ritmos de la ciudad | Ciclo de día y horarios agregados para NPC |
| R15 · Ciudades en pixel art | Calles reconocibles representadas con pixel art | 3D | Escala de barrios y minijuegos | Capas cartográficas y tiles isométricos |
| R16 · Constructor de ciudad | Interfaz de creación de ciudad y objetos | 3D | Colocación y evolución visible de sectores | Generación modular, APIs de edición |
| R17 · Miniopolis — editor y filtros | Construcción de edificio y filtros comparados | 3D | Respuesta al colocar piezas y cambio de aspecto | Piezas modulares y perfiles visuales |
| R19 · Still The Game — nieve | Rampa de prototipo frente a entorno invernal | 3D | Ruedas apoyadas y huellas aparentes; no prueba motor físico | Efectos de contacto + ajuste por perfil gráfico |
| R20 · Induction Bench | Campos magnéticos y gráficas variables | 3D | Respuesta continua de sistema a parámetros | Depurador visual de estados y fuerzas |
| R21 · AngioSim | Corazón, vasos y paneles diagnósticos | 3D | Sin impactos, pero lectura volumétrica | Inspector de vehículo por capas |
| R22 · FireTrace | Terreno, incendios y controles técnicos | 3D | Propagación visible sobre mapa | Simulación por sectores, minimapa táctico |
| R23 · Ballpoint Gambit | Tablero y criaturas dibujadas | 2D/ilustración | Movimiento y reacción de piezas | UI diegética y sprites animados |
| R24 · Haikus animados | Poemas con movimiento de líneas y partículas | 2D/ilustración | Ritmo ambiental suave | Efectos atmosféricos 2D de bajo costo |
| R25 · Tipografía manuscrita | Carácteres de escritura creados desde apuntes | 2D/ilustración | Variación de trazos, no interacción física | Identidad tipográfica original para UI y letreros |

**Auditoría del material nuevo:** se confirmaron visualmente las fichas R01, R05, R06, R07, R12, R14, R15, R16 y R17 con los nueve MP4 añadidos en la segunda entrega. La observación directa **mejora la identificación de escenas**; no confirma los algoritmos específicos sugeridos por Gemini. Si se desean mediciones de aceleración, huellas o rebotes, se requeriría examen cuadro a cuadro con secuencias dedicadas y acceso al juego o su código.

---

### 8. Las cinco técnicas más útiles: convergencia de ambas evaluaciones

La priorización combina **frecuencia cualitativa de rasgos visibles**, relevancia para el objetivo «peso + vida» y viabilidad móvil. No es un conteo estadístico de mecanismos ocultos.

| Orden | Técnica unificada | Peso que añade | Vida que añade | Implementación mínima móvil | Escalado futuro |
|---|---|---|---|---|---|
| **1** | **Física perceptual y feedback táctil**: inercia, contactos, suspensión, hitstop, recuperación, sonido, polvo | Aceleraciones, apoyo de ruedas/pies, retroceso y choques legibles | Objetos y personajes reaccionan al jugador | Actualización fija, 1 vehículo + 1 personaje + perfiles de materiales, desaceleración coherente, cámaras suaves | Simulaciones de neumáticos avanzadas, destrucción controlada, ragdoll cuando proceda |
| **2** | **Ambiente dinámico coherente**: día/noche, clima, viento, materiales mojados, luces reactivas | Faros y sombras comunican escala y velocidad | Peatones, luz, vegetación, clima y audio cambian juntos | Reloj global, estados de clima, viento simple, luces selectivas, 3–5 eventos locales | Estaciones, microclimas, iluminación y audio espacial más completos |
| **3** | **Animaciones contextuales y estados reactivos**: IK, gestos cotidianos, sprites, objetos funcionales | Agarrar, subir, frenar, caer, reparar y activar tienen peso | NPC no parecen estatuas; señales e interfaces responden | Máquina de estados y pequeñas transiciones con pooling | IK completo, animación procedural y comportamiento más rico |
| **4** | **Estilo artístico escalable**: low/mid-poly, cel-shading selectivo, pixel 3D, niebla, filtros | Lectura de masas, escala y profundidad | Densidad aparente de ciudad y atmósfera | Siluetas claras, sombras baratas y filtros opcionales | Materiales y reflejos superiores con el mismo estado lógico |
| **5** | **Simulación desacoplada y streaming**: agentes por niveles, sectores, APIs declarativas | El soporte y el contacto siguen reglas pese a cambios de cámara/calidad | Persistencia, tráfico, población y eventos fuera de pantalla | Sectores + estado resumido + entradas/salidas versionadas | Motor externo, ECS o técnicas de mayor escala según perfiles |

**Referencias cruzadas:** R01/R11/R12/R19 enfatizan contacto y sensación de masa; R14/R19/R22 enfatizan vida ambiental; R17/R23/R24/R25 muestran filtros o lenguajes gráficos; R15/R16/R18 aportan ideas para edición y mundo modular; R20/R21 aportan visualización y depuración. En R18 las afirmaciones técnicas dependen de Gemini, no de un video inspeccionado.

#### 8.1. Priorización original del análisis anterior (conservada)

> **Muestra efectiva:** seis demostraciones del compilado + los dos clips de juegos = **ocho propuestas visuales diferentes**, con observación por fotogramas; los recuentos orientativos no equivalen a auditoría de código ni a frecuencias de los 14 enlaces de Instagram. **Más repetida** y **más importante para el juego** son criterios distintos.

| Prioridad | Técnica / patrón visual | Presencia cualitativa en la muestra | Por qué importa en móvil | Implementación propuesta |
|---|---|---|---|---|
| **1** | **Estados visibles que evolucionan en el tiempo** | Muy frecuente: incendio, ajedrez, campos, corazón, poesía, escalada, calle nevada. | Genera sensación de mundo activo sin exigir más polígonos. | Máquina de estados, transiciones y eventos programados; diferenciar simulación cerca del jugador y decorado lejano. |
| **2** | **Respuesta visual inmediata a una acción o cambio de parámetro** | Frecuente: trazos que transforman el pueblo (*Town Brush*, fuente externa), posiciones, capas médicas, campos y acciones del personaje. | El jugador interpreta que sus decisiones tienen efecto. | Entrada → cambio de estado → animación → sonido → persistencia opcional. Presupuesto de reacción perceptual bajo. |
| **3** | **Cámara y lectura de profundidad/escala** | Frecuente: terreno 3D, imanes, corazón 3D, escalada y escena urbana isométrica. | Permite sentir distancias y alturas sin gráficos hiperrealistas. | Cámara con límites, seguimiento amortiguado, horizonte legible, parallax y controles consistentes. |
| **4** | **Capas ambientales animadas y efectos de atmósfera** | Presente en varios: fuego, poemas, nieve, cielo/bruma de montaña. | La vida ambiental puede costar menos que añadir más NPC con IA completa. | Partículas por zonas, shader simple de viento, niebla por distancia, audio ambiental y variación temporal. |
| **5** | **Contacto, suspensión y movimiento dependiente de la superficie** | Evidencia concentrada en la escalada; indicios de interacción vehículo–suelo en el clip urbano. No es el patrón más frecuente, **pero sí el más importante para lograr «peso»**. | Una caída o un aterrizaje creíbles afectan más que duplicar calidad de texturas. | Controlador cinemático robusto o cuerpo rígido calibrado, reacción de cámara, animación por contactos y audio/materiales. |

**Importante:** no hay base para afirmar que «sacudida de cámara», «ragdoll», «física de suspensión real», «sombras en tiempo real» o «animación cuadro a cuadro» estén implementadas en determinados videos. Son técnicas **propuestas**, no observadas de manera concluyente.

#### 8.2. Priorización original de Gemini (conservada como comparación)

> Términos como “raycast”, “render targets”, “ECS” y “vertex shaders” son técnicas **propuestas o atribuidas por Gemini**. No se confirmaron por inspección de metraje.

1. **Estética Estilizada de Bajo Costo Poligonal + Filtros Intercambiables (*Low/Mid-Poly*, *Cel-Shading*, Pixel 3D):**
   * *Dónde aparece:* *Motor Town*, *CityRT*, *Miniopolis*, *Townbrush*, *Indie Pixel 3D*, *Cairn*, *The Sound of Fury*, *VoxPix*.
   * *Por qué es clave:* Libera GPU en celulares para mantener 60 FPS estables y permite lograr looks memorables (cómic, diorama, pixel 3D, vintage) mediante *shaders* ligeros de post-procesado.
2. **Física de Suspensión, Inercia, Destrucción Ligera y Deformación de Suelo (*Raycast* + *Body Roll* + Huellas):**
   * *Dónde aparece:* *Motor Town*, *Fable Rover*, *Still The Game*, *Godot Desierto/Playa*.
   * *Por qué es clave:* Nada comunica mejor el **peso** que ver la carrocería inclinarse, las ruedas absorber baches, los props romperse al impacto y las llantas dejar surcos reales en nieve o arena.
3. **Micro-Feedback Táctil y Animación Reactiva (*Hitstop*, *Squash & Stretch*, Polvo, IK y Animaciones Cotidianas):**
   * *Dónde aparece:* *Miniopolis*, *Cairn*, *The Sound of Fury*, *Mythictale*, *Townbrush*, *Ballpoint Gambit*, *PZ 3D*.
   * *Por qué es clave:* Polvo al encajar un bloque, nieve levantada al acelerar, micro-pausas de golpe y gestos pequeños (vendarse, atornillar, empujar) hacen que cada acción se sienta física y viva.
4. **Iluminación Dinámica Atmosférica y Vida Ambiental Barata (Ciclo 24h, Faros, Fauna Reactiva y *Vertex Shaders*):**
   * *Dónde aparece:* *Still The Game*, *Godot Playa*, *Indie Pixel 3D*, *Maciej Drabik*, *Townbrush*, *VoxPix*, *Haikus JS*.
   * *Por qué es clave:* Sombras largas girando con el sol, faros cortando la niebla nocturna, ventanas que se encienden, aves que huyen y viento moviendo árboles por *vertex shader* llenan la ciudad de **vida** a muy bajo costo.
5. **Simulación Desacoplada, Generación Procedural y Control por API/Datos (ECS + *Chunk Streaming* + Agentes):**
   * *Dónde aparece:* *VoxPix*, *KnoxMap*, *Still The Game* (1000 NPCs), *FireTrace*, *Induction Bench*, *Ciudades Pixel*.
   * *Por qué es clave:* Separar los datos y la simulación del renderizador permite cargar ciudades enormes por *chunks* en móvil, simular cientos de agentes en segundo plano y dejar que **Claude construya y ajuste el mundo por código**.

---

### 9. Lenguaje visual, paletas y mecánicas del informe de Gemini

La siguiente selección conserva las cinco paletas y los seis grupos de mecánicas del informe original. Son **opciones de dirección artística y diseño**, no requisitos simultáneos: aplicar todos los filtros o sistemas a la vez sobrecargaría una primera versión.

#### A. Paletas de Color Recomendadas por Atmósfera
* **Día Urbano / Simulación Limpia** *(Motor Town, Fable Rover, CityRT)*:
  * Asfalto cálido `#3D4046` · Cielo claro `#6BB5E8` · Vegetación viva `#5C9E4F` · Acentos vehiculares `#F2B705` y `#E85D2A`.
* **Costa / Desierto Solar** *(Godot Arena/Playa, Townbrush)*:
  * Arena dorada `#E6B86A` · Agua turquesa `#38A3A5` · Espuma `#F7F9F9` · Sombra cálida `#8C6A43`.
* **Invierno Urbano / Nieve Nocturna** *(Still The Game, Cairn)*:
  * Nieve en sombra `#5A657A` · Azul invernal profundo `#1D2433` · Luz cálida de faros `#FFF3D1` · Silueta de árboles/chasis `#14171F`.
* **Noche Urbana / Post-Soviético / Cyberpunk** *(Maciej Drabik, Indie Pixel 3D)*:
  * Fondo nocturno `#11151C` · Niebla de vapor `#2A3B4C` · Neón cian `#00E5FF` · Luz de freno/peligro `#FF2E63` · Farola ámbar `#FFAE42`.
* **Editorial / Táctico / Laboratorio** *(FireTrace, Induction Bench, Ballpoint Gambit)*:
  * Papel crema `#F4EFE6` · Tinta azul bolígrafo `#24489B` · Alerta térmica `#FF5722` · Visión infrarroja `#2B0B57` → `#FFEA00`.

#### B. Mecánicas, Sistemas y Herramientas Clave a Integrar
1. **Conducción con Física Tangible, Superficies Reactivas y Props Rompibles (*Motor Town* + *Fable Rover* + *Still The Game* + *Godot Playa*):**
   * Suspensión independiente por rueda (*raycast*), inclinación de chasis (*body roll*), tracción diferenciada por terreno (asfalto seco/mojado, arena, barro, nieve), **huellas persistentes** en el piso y destrucción física de cercas, conos y señales.
2. **Cambio Fluido de Cámaras + Modo "Bajar del Auto" (*Indie Pixel 3D* + *CityRT* + *PZ 3D* + *Cairn*):**
   * Alternar sin cortes entre vista aérea/isométrica de ciudad, tercera persona, primera persona al volante (con tablero y limpiaparabrisas) y caminar a pie con micro-animaciones táctiles (empujar auto, cargar gasolina, reparar).
3. **Ciudad Viva: Estaciones, Ciclo 24h, Fauna y Eventos Dinámicos (*Still The Game* + *Godot Playa* + *FireTrace* + *CityRT*):**
   * Ciclo solar de 24 horas con encendido progresivo de ventanas y farolas, cambio de clima/estaciones, aves que huyen al acercarse un vehículo y emergencias urbanas (incendios propagables, tormentas) monitoreables en un **mapa táctico 3D / modo dron**.
4. **Construcción Modular + Filtros Visuales Intercambiables (*Miniopolis* + *KnoxMap* + *Townbrush*):**
   * Generador modular de edificios y manzanas (con *feedback* de polvo e impacto al colocar piezas) + un **selector de filtros de post-procesado en tiempo real** (*Default, Comic, Vintage, CRT, Pixel 3D*) para cambiar la identidad visual del motor sin rehacer los modelos.
5. **Taller "Rayos X" + Laboratorio de Telemetría (*AngioSim* + *Induction Bench*):**
   * Modo translúcido/rayos X en el taller para inspeccionar piezas internas y daños del auto, más un panel de depuración en vivo (gráficas de suspensión, agarre y torque) para afinar físicas junto a Claude.
6. **API "Hecha para Agentes" + Identidad Artesanal (*VoxPix* + *Ballpoint Gambit* + *Handwriting Font*):**
   * Exponer comandos declarativos en código para que **Claude pueda construir barrios, carreteras, luces y misiones directamente por script**, combinando UI diegética tipo libreta y tipografía propia generada a medida.

#### 9.1. Identidad propia recomendada

- **Base visual coherente:** proporciones estilizadas realistas, materiales claros, iluminación horaria creíble, siluetas de vehículo legibles, señales de tráfico y UI funcional. Esta base puede adoptar un filtro cómic/pixel/retro sin sustituir toda la dirección artística.
- **Color al servicio de información:** luces de freno, intermitentes, semáforos y alertas se distinguen incluso si un filtro estilístico cambia la paleta; ofrecer ajustes de accesibilidad.
- **Evitar la copia literal:** los videos son referencias de principios técnicos, no licencias para reproducir personajes, diseños, escenas o nombres de otros creadores.
- **Paquetes y filtros:** los estilos “Default / Comic / Vintage / CRT / Pixel” son un **sistema configurable**, no la promesa de que todos mantendrán idéntico rendimiento; medir su coste real.

---

### 10. Sistema central: cómo lograr «peso» real y perceptible

**Principio:** el peso percibido es una combinación de **dinámica de movimiento + contactos + animación + cámara + sonido**. Aumentar la gravedad por sí solo puede hacer que los controles sean desagradables.

#### 10.1. Movimiento de personajes

- **Aceleración y desaceleración graduales:** distinguir caminar, correr, frenar y girar; curva ajustable por tipo de personaje, superficie y habilidad.
- **Velocidad angular y giro del cuerpo:** pies y torso no rotan instantáneamente en cambios bruscos; anticipación moderada, sin sacrificar respuesta al toque.
- **Contacto con el suelo:** comprobación de pendiente, adherencia, límite de escalón, deslizamiento y sonido por superficie.
- **Saltos/caídas:** altura y duración calculadas; al aterrizar, absorber el impacto con rodillas, desplazamiento leve de cámara y sonido proporcional a la velocidad vertical.
- **Agarres y trepada (si son mecánicas del juego):** definir puntos válidos, alcance, estados de cansancio opcionales y transición clara al suelo. Evitar movimientos que atraviesen paredes.
- **Golpes:** animación de anticipación, contacto definido, impulso/cambio de velocidad razonable y reacción proporcional. Pausa de impacto muy breve **solo cuando encaje**; en móviles no debe bloquear la entrada ni repetirse excesivamente.

#### 10.2. Vehículos y objetos

- Parámetros por tipo: masa, aceleración, frenado, fricción, agarre lateral, velocidad de giro y recuperación después de choque.
- Para vehículos: modelo simplificado de suspensión/rueda y balanceo visual; **física real completa solo si la jugabilidad la exige**.
- Objetos: evitar que todos reboten igual; usar materiales con coeficientes distintos, umbrales de reposo y deformación visual controlada.
- Audio: frenada, impacto, roce, pasos, arrastre y reverberación por tipo de entorno. El sonido informa de la fuerza del contacto.

#### 10.3. Cámara que comunica masa sin marear

- **Seguimiento amortiguado** en vez de «pegar» la cámara al personaje.
- Reacción a aterrizajes e impactos mediante *impulsos cortos*, con intensidad limitada y opción de reducir/desactivar sacudidas.
- Ajustar distancia/altura según velocidad, obstáculo, interiores y conducción.
- Evitar vibración constante, desenfoque agresivo y cambios abruptos de FOV. Dar prioridad a accesibilidad y legibilidad en pantallas pequeñas.

#### 10.4. Regla de calibración

> Si el movimiento parece pesado pero los controles se sienten lentos, Motor City está fallando. La meta es **respuesta inmediata del control, acompañada de inercia y recuperación convincentes**.

### 11. Sistema de «vida» para un mundo abierto móvil

#### 11.1. Capas de simulación

| Capa | Comportamiento cercano al jugador | Comportamiento lejano / fuera de pantalla | Ejemplo visible |
|---|---|---|---|
| **Ambiental** | Hojas, polvo, viento, lluvia y charcos activos | Estado climático y semillas de efectos, sin partículas individuales | El viento mueve vegetación próxima y un letrero oscila. |
| **Población** | NPC con percepción local, navegación y animación | Horarios y ubicaciones agregadas, sin simular cada paso | Gente cambia de ruta, reacciona al clima y retoma rutinas. |
| **Tránsito** | Vehículos con evitación de colisiones y comportamiento vial | Flujo abstracto por vías/sectores | Semáforos, frenadas y rutas coherentes. |
| **Audio** | Emisores 3D en función de distancia y obstáculos, según soporte | Ambientes mezclados por zona, sin cientos de emisores | Rumor de avenida, pájaros en parque, lluvia bajo techo. |
| **Estado de mundo** | Objetos rotos, reparados, recogidos o activados | Registro resumido de cambios persistentes | Un grafiti o vehículo permanece cambiado después de volver. |
| **Tiempo y luz** | Transiciones coherentes de sombra/luz en puntos prioritarios | Parámetros globales de ciclo diario | Cambio progresivo de tonalidad, farolas al anochecer. |

#### 11.2. Sistema de eventos de vida

Formato conceptual: `Estímulo → regla → cambio lógico → representación audiovisual`.

- `VientoFuerte` → el sistema asigna intensidad por distrito → vegetación y telas próximas se inclinan → partículas/audios se ajustan.
- `VehiculoFrena` → se desacelera su estado físico → balanceo visual y luces de freno → sonido según velocidad y pavimento.
- `PersonaSaluda` → IA cambia a interacción → animación breve, mirada hacia jugador → respuesta si el jugador se acerca.
- `EmpiezaLluvia` → humedad por zona → reflejos y salpicaduras cercanos → los NPC modifican rutas o velocidad.
- `ChoqueLeve` → impacto materializado → pequeña deformación/ruido/reacción de peatones cercanos → estado persistente solo si la mecánica lo requiere.

**Economía de simulación:** *el mundo debe recordar más de lo que necesita calcular*. Un NPC lejano puede ser una posición estimada y una agenda; se convierte en un agente completo al entrar en una región activa.

### 12. Arquitectura del Motor City: crecer sin quedar atrapado en un único motor

#### 12.1. Recomendación estructural

**Diseñar Motor City como núcleo de simulación + contrato de datos + adaptadores de representación.** El núcleo no debe depender de las clases particulares de Unity, Godot, Unreal o de un navegador.

```text
                   PROYECTO MOTOR CITY
                           │
                  Reglas y contratos de datos
              (mundo, objetos, acciones, guardado)
                           │
       ┌───────────────────┴───────────────────┐
       │       Núcleo de simulación            │
       │ IA / tráfico / clima / estados /      │
       │ economía del mundo / eventos          │
       └───────────────────┬───────────────────┘
                           │
           Interfaces estables y versionadas
          (Input, Time, Physics, Render, Audio,
           Navigation, Storage, AssetLoader)
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
  Adaptador web       Adaptador Godot      Adaptador Unity
  WebGL/WebGPU*       GDExtension/etc.     Native plug-in/etc.
       │                   │                    │
    Móvil web          Android/iOS            Android/iOS
                           │
                    Adaptador Unreal
                  C++ plug-in / integración
                           │
                      PC / móvil**

* WebGPU solo donde el dispositivo/navegador lo soporte;
  mantener vía compatible o degradación de funciones.
** Según las capacidades y restricciones de la plataforma objetivo.
```

**Advertencia crítica:** no existe un botón para «convertir un juego web en Unreal». Los contratos, datos, modelos y parte del código de simulación **pueden ser portables**; el renderizador, shaders, físicas específicas, UI, controles, compilación y herramientas del editor normalmente requieren adaptaciones o reimplementación.

#### 12.2. Dos rutas factibles

| Ruta | Cuándo elegirla | Ventaja | Coste/riesgo |
|---|---|---|---|
| **A. Prototipo rápido con TypeScript y APIs web** | Si la prioridad es probar jugabilidad en PC/Android/iOS mediante navegador, con distribución offline que lo permita. | Iteración visual rápida; primera *vertical slice* barata. | La lógica dependiente de librerías web **no** se puede portar automáticamente a Unity/Unreal. Exigir datos y reglas independientes desde el día uno. |
| **B. Núcleo portable en C++ o Rust + interfaces C y compilación WASM donde proceda** | Si desde el inicio es requisito reutilizar simulación en web, PC y motores externos. | Mayor control y potencial reutilización de la lógica de juego. | Integración considerablemente más compleja; cada motor requiere adaptadores, pruebas ABI y empaquetado específico. |

**Decisión sugerida:** primero **contratos y un prototipo funcional**; escoger B si la portabilidad del código de simulación está realmente en la ruta de producto y existe capacidad para mantener varias integraciones. Si no, comenzar con A y asegurar *portabilidad de datos*, que es más realista que prometer portabilidad completa de código.

#### 12.3. Contratos mínimos obligatorios

```text
IInput          -> acciones abstractas: mover, mirar, saltar, conducir, interactuar
IWorldClock     -> hora simulada, delta fijo, velocidad del tiempo
IPhysicsWorld   -> consultas de suelo, raycasts, contactos, aplicación de fuerzas
IRenderBridge   -> representar entidad, LOD, materiales, luces, partículas
IAudioBridge    -> eventos espaciales, mezclas ambientales, efectos por material
IWorldStreamer  -> sectores, distancias, carga/descarga, estado persistente
IAgentWorld     -> población, tránsito, navegación y decisiones agregadas
ISaveSystem     -> guardado versionado y restauración de sectores
IQualityProfile -> efectos compatibles, presupuesto térmico, CPU, GPU y memoria
```

**Separar por datos:** `Transform`, `Velocity`, `Collider`, `Locomotion`, `Vehicle`, `AgentSchedule`, `WeatherResponse`, `RenderProxy`, `AudioEmitter`, `PersistentState`. Los identificadores de entidades deben ser estables y no depender de IDs nativos de un editor.

**Persistencia versionada:** JSON o formato binario documentado con `schema_version`, IDs permanentes, migradores de versión y pruebas de restauración. Los parámetros de física y materiales se guardan como datos; no como referencias implícitas a objetos de una escena de una sola herramienta.

**Recursos abiertos:**

- **glTF 2.0 / GLB** para intercambiar modelos, jerarquías, materiales PBR y ciertas animaciones entre herramientas, sujeto a las capacidades del importador. Es un estándar de Khronos: <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html>.
- **OpenUSD** como opción de *pipeline* de escenas complejas en producción, no necesariamente el formato de ejecución móvil: <https://www.pixar.com/openusd>.
- **Tablas JSON/CSV versionadas** para eventos, NPC, tipos de superficies, clima, vehículos, economía y reglas, con validación automatizada.
- **Pruebas del núcleo** independientes de imágenes: mismo escenario de entrada → resultado esperado dentro de tolerancia; las físicas de distintos motores pueden divergir.

#### 12.4. Principio de renderizado adaptable

La misma entidad lógica `car_023` puede representarse así:

- **Calidad baja:** malla sencilla, textura pequeña, sombra falsa, sin reflejo dinámico, menos partículas, iluminación mayormente estática.
- **Calidad media:** mejores materiales, animación extra de ruedas/suspensión, sombras selectivas, lluvia local y reflejos aproximados.
- **Calidad alta:** geometría/vegetación adicional, sombras de más calidad, densidad de población decorativa y mejores materiales, siempre sujeto a mediciones.

**No** introducir diferencias de reglas físicas por calidad gráfica: cambiar el *aspecto* del vehículo, no el resultado de su frenada, solo por tener otro celular.

**Compatibilidad con motores conocidos:** Godot dispone de caminos Forward+, Mobile y Compatibility (véase [documentación de renderizadores](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html)); Unity documenta escalado según estado térmico y potencia en [Adaptive Performance](https://docs.unity.com/en-us/engine/6000.3/manual/analysis/runtime-performance-scaling/adaptive-performance/introduction); Unreal dispone de una [ruta de renderizado móvil](https://dev.epicgames.com/documentation/unreal-engine/mobile-rendering-and-shading-modes-for-unreal-engine) diferenciada de la de escritorio. **Tener varias rutas disponibles no garantiza paridad de efectos ni de rendimiento.**

### 13. Rendimiento: reglas de un mundo abierto que sí corre en teléfonos

**Objetivos de referencia, no resultados de pruebas:**

| Perfil | Objetivo inicial | Presupuesto de cuadro | Enfoque |
|---|---|---|---|
| **Bajo** | 30 FPS estables | ~33,3 ms total | Menos NPC cercanos, sombras simuladas, partículas limitadas, distancia reducida. |
| **Medio** | 30 FPS de mayor calidad o 60 FPS cuando sea sostenible | ~33,3 / 16,7 ms | LOD más generoso y respuesta ambiental completa en zona próxima. |
| **Alto** | 60 FPS cuando CPU/GPU/temperatura lo permitan | ~16,7 ms total | Más detalle, mejores sombras y efectos, sin comprometer controles. |

- **Simulación con paso fijo:** por ejemplo 60 Hz donde sea viable; la representación puede ir a 30 o 60 FPS mediante interpolación. No asumir que todas las físicas mantendrán determinismo idéntico entre motores.
- **Streaming espacial:** partir la ciudad en sectores (probar tamaños, no fijarlos sin medición); mantener activo el vecindario del jugador, prefetched el próximo y descargar recursos distantes conservando un resumen de estado.
- **Niveles de simulación (Simulation LOD):** física completa y NPC detallados cerca; estados resumidos más lejos; estadística/horarios fuera de pantalla.
- **Object pooling:** reutilizar emisores de polvo, gotas, sonidos y objetos temporales para evitar asignaciones frecuentes.
- **LOD visual, oclusión, texturas adecuadas e instancing:** reducir cargas gráficas antes de sacrificar las reglas centrales.
- **Clima y temperatura del dispositivo:** escalado adaptativo de resolución y efectos si hay caída de FPS o limitación térmica; no esconder caídas severas con sacudidas de cámara.
- **Uso sin conexión:** si es requisito, empaquetar contenido base, guardar localmente y no depender de API remotas para la simulación principal.
- **Accesibilidad:** opciones de sacudida de cámara, intensidad de partículas, contraste, controles táctiles escalables y tamaño de interfaz.

### 14. Orden de implementación recomendado

| Fase | Construir | Prueba de aceptación concreta |
|---|---|---|
| **0. Contratos y telemetría** | Modelo de entidades, eventos, guardado, reloj fijo, monitor de FPS/tiempos de CPU-GPU y perfiles de calidad. | Cambiar de escena y recuperar guardado sin perder identificadores ni romper eventos. |
| **1. Sensación de peso** | Personaje, superficies, aceleración/frenado, salto, caída, sonidos y cámara amortiguada. | El usuario distingue caminar, correr, frenar, saltar y aterrizar con cámara reducida o desactivada. |
| **2. Vehículo y contacto** | Un vehículo, fricción, frenada, curva, rampa, colisión controlada y reacción visual de suspensión. | Distancias de frenado reproducibles en la misma configuración y sin atravesar obstáculos. |
| **3. Vida local** | Un pequeño distrito: viento, dos climas, ciclo temporal, sonidos, transeúntes y tránsito sencillo. | El barrio muestra cambios observables aun cuando el jugador no interactúa y reacciona al clima. |
| **4. Persistencia y streaming** | Sectores activos, estados dormidos, horarios, objetos persistentes y carga progresiva. | Salir del barrio y regresar conserva los cambios elegidos sin saltos graves de FPS. |
| **5. Fidelidad escalable** | Tres perfiles gráficos, partículas por presupuesto, LOD, sombras selectivas y adaptación térmica. | La jugabilidad permanece equivalente al cambiar calidad gráfica en dispositivos diferentes. |
| **6. Prueba de portabilidad** | Implementar **un único sistema pequeño** (por ejemplo, clima + objetos reactivos) en un segundo adaptador/motor. | Misma escena lógica, datos y eventos; renderizado distinto pero comportamiento compatible dentro de tolerancias. |

#### Medidas que deben recogerse en dispositivo real

- FPS promedio **y** percentiles de tiempo de cuadro, no solo un promedio favorable.
- CPU, GPU, memoria ocupada, consumo/temperatura y rendimiento después de una sesión prolongada.
- Latencia desde toque hasta respuesta visual; frenadas, aterrizajes y colisiones en distintos perfiles.
- Picos durante carga de sector y guardado; estabilidad tras cambios de orientación o retorno desde segundo plano.
- Comparación de misma semilla/escena con distintos renderizadores; investigar diferencias antes de publicar.

### 15. Decisiones de diseño finales

1. **Primero credibilidad física, después complejidad visual.** Una silueta simple que frena, tropieza o cae con coherencia tiene más «peso» que un modelo detallado que se desliza como si no tocara el suelo.
2. **La vida nace de las relaciones.** No basta un árbol que se mueve: el viento debe afectar también ropa, polvo, sonido o conducta, incluso con simulación aproximada.
3. **Optimizar no es vaciar el mundo.** El mundo cercano debe ser rico en reacciones; el lejano, rico en apariencia y estado resumido.
4. **No atar las reglas a los gráficos.** Una entidad lógica puede migrar entre web, Godot, Unity o Unreal mediante datos, contratos y adaptadores, con trabajo real de integración.
5. **Usar las referencias como inspiración, no como instrucciones de copia literal.** Reconstruir principios mecánicos y artísticos con recursos propios evita una identidad visual genérica o derivativa.

### 16. Manual operativo de implementación y delegación a agentes IA

#### 16.1. Mapa de módulos y repositorio recomendado

```text
motor-city/
  docs/
    MOTOR-CITY-ENTREGA-MAESTRA.md
    decisiones-arquitectura.md
    criterios-de-aceptacion.md
  schemas/
    world.schema.json
    vehicle.schema.json
    agent.schema.json
    save.schema.json
  data/
    surfaces.json
    vehicle-presets.json
    weather.json
    districts.json
  core/
    time/
    entities/
    events/
    movement/
    vehicles/
    agents/
    world-state/
    persistence/
  adapters/
    web/
    godot/
    unity/
    unreal/
  tools/
    world-builder/
    profiler/
    replay/
  tests/
    unit/
    integration/
    benchmark/
    visual/
  assets/
    common/
    mobile/
    high/
```

Los directorios de adaptadores son **destinos de arquitectura**, no afirmaciones de que esos adaptadores ya existan. No conviene construir los cuatro simultáneamente: implementar y probar **uno** primero, y portar **un módulo pequeño** a un segundo como prueba real de independencia.

#### 16.2. Protocolo para Claude, Gemini u otros asistentes

1. **Leer especificación y contratos actuales.** No reescribir interfaces sin una decisión de arquitectura versionada.
2. **Proponer cambios en forma de diffs atómicos.** Cada cambio debe citar el sistema afectado, el comportamiento esperado y la prueba.
3. **Usar JSON validable o funciones declarativas para generar escenas.** Los archivos producidos por IA deben pasar validación de esquema, referencias y límites de presupuesto.
4. **Separar física/estado de VFX.** Un vehículo no debe cambiar su frenada porque se desactive la nieve gráfica; un edificio no debe perder su identidad al variar el LOD.
5. **Probar en navegador y dispositivo real.** Tests unitarios y automatizados son necesarios, pero no sustituyen pruebas E2E de botones, gestos, errores de consola, carga de distrito y reanudación de partida.
6. **Registrar evidencia.** Capturas, replays con semilla, perfil de FPS/RAM, errores reproducibles y versiones de hardware.
7. **No prometer portabilidad automática.** En cada adaptación, hacer mapa explícito de equivalencias: unidades, ejes, coordenadas, físicas, entradas, assets, audio, UI y recursos gráficos.

#### 16.3. Ejemplo de contrato de entidad (propuesta, no código del juego existente)

```json
{
  "schema_version": 1,
  "entity_id": "vehicle_0001",
  "archetype": "compact_car",
  "transform": { "position_m": [0.0, 0.0, 0.0], "rotation_xyzw": [0.0, 0.0, 0.0, 1.0] },
  "vehicle": { "mass_kg": 1100, "drive": "FWD", "profile": "city_base_v1" },
  "surface_contact": "dry_asphalt",
  "visual": { "asset_id": "car_compact_a", "quality_policy": "adaptive" },
  "persistent": true
}
```

**Precaución:** los valores del ejemplo son ilustrativos; no se ha calibrado ni probado su comportamiento. La semántica de coordenadas, unidades, límites y presets debe fijarse formalmente en un esquema.

#### 16.4. Hitos mínimos no negociables antes de expandir el mapa

| Entregable | Condición comprobable |
|---|---|
| Un vehículo con física plausible | Acelera, frena, gira, rebota levemente sobre obstáculo y muestra telemetría sin atravesar el terreno |
| Un peatón convincente | Camina, corre, frena, usa escalones y reacciona a un vehículo próximo sin deslizamiento flagrante |
| Distrito activo | Cambia entre día/noche y clima sin perder tráfico y rutinas; conserva modificaciones persistentes |
| Rendimiento móvil | Se mide en dispositivo objetivo con configuración fija y sesión prolongada; no se certifica a partir del PC del desarrollador |
| Compatibilidad inicial | Una escena lógica produce resultados equivalentes en perfiles gráficos bajo/alto |
| Portabilidad piloto | Un subsistema aislado puede exportarse mediante esquema y ejecutarse en otro adaptador con tests comparativos |

#### 16.5. Riesgos y correcciones de afirmaciones demasiado fuertes

- **“60 FPS en cualquier celular”:** no garantizable sin hardware de referencia, presupuesto de frame y telemetría. Un perfil móvil debe priorizar **30 FPS consistentes** cuando 60 no sea sostenible.
- **“Vertex shaders o sprites casi gratis”:** los costes dependen de overdraw, cantidad de objetos, resolución y batería; pueden ser eficientes **si se miden**.
- **“Huellas permanentes en terreno”:** una marca visual con decal/texture no implica una malla físicamente deformada. Elegir según la interacción requerida.
- **“1000 NPC con emociones y memoria”:** el texto de un reel no certifica su arquitectura; simular muchos agentes **en segundo plano** requiere distintos grados de detalle, tests y medidas.
- **“Física determinista a 60 Hz en todos los motores”:** un paso fijo ayuda a reproducibilidad local pero **no garantiza igualdad bit a bit** entre bibliotecas o plataformas. Repetir escenarios con tolerancias.
- **“Migración sin esfuerzo a Unreal/Unity”:** los sistemas de datos pueden transferirse; integración de físicas, shaders, UI, input y empaquetado puede exigir trabajo considerable.
- **“ECS, WFC, WebGL, MIT, 0,08 s”:** son atribuciones incluidas en la descripción de Gemini para ciertos proyectos; revisar código/licencia y reproducir benchmarks antes de convertirlas en decisiones cerradas.
- **“Un filtro estilizado acelera por sí solo”:** pixelación y outlines pueden agregar pasadas de pantalla; reducir resolución interna o complejidad material es distinto de añadir un filtro.

---

### 17. Fuentes, material y pendientes documentados

**Documentos de base (fusionados íntegramente por contenido útil):**

1. `ENTREGA-REELS.md`, entrega inicial con observaciones independientes, tabla de 14 enlaces, técnica de peso/vida, arquitectura y plan de pruebas.
2. `Referencias y Arquitectura para Motor City.md`, informe de Gemini con fichas R01–R25, paletas, mecánicas, ranking y propuestas de escalado.
3. MP4 adjuntos en ambos mensajes: 9 iniciales (incluido el collage) y 9 añadidos, con 17 referentes distintos identificables en conjunto.

**Pendiente visual:** verificar 13 URLs de Instagram sin evidencia directamente atribuible; comprobar 7 fichas que por ahora dependen de Gemini; inspeccionar código o manuales originales si se necesita afirmar tecnologías específicas. No confundir “no verificado” con “falso”.

**Pendiente de ingeniería:** no se ha desarrollado ni ejecutado aquí el motor Motor City; los tests, integración de motores, prestaciones, memoria y física son **objetivos de proyecto**, no resultados medidos.

**Fuentes externas consultadas para la investigación técnica y la identificación del reel accesible:**

1. [Análisis independiente del reel *Town Brush*](https://develog.develrocket.com/@wnqudgus1234/쇼츠-뜯어보기-공유가-좋아요의-66배-어제-오늘-뜬-쇼츠-10개).
2. [Khronos — Especificación glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html).
3. [Pixar — OpenUSD](https://www.pixar.com/openusd).
4. [Godot — Renderizadores](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html).
5. [Unity — Adaptive Performance](https://docs.unity.com/en-us/engine/6000.3/manual/analysis/runtime-performance-scaling/adaptive-performance/introduction).
6. [Epic — Renderizado móvil en Unreal Engine](https://dev.epicgames.com/documentation/unreal-engine/mobile-rendering-and-shading-modes-for-unreal-engine).

**Límite metodológico:** las páginas de documentación respaldan compatibilidad general y opciones de implementación. No prueban que una técnica específica se haya usado en un reel.

---

**Cierre de unificación.** Ambas investigaciones apuntan a la misma decisión central: el mejor resultado móvil no consiste en simularlo absolutamente todo ni en maximizar los efectos, sino en **hacer que todo lo próximo al jugador tenga consecuencias comprensibles**, mientras el resto del mundo evoluciona mediante estados compactos, datos persistentes y representación escalable. Este documento es la fuente de referencia única para convertir esa idea en pruebas y código posteriores.


---

# ANEXO F. Optimización (`docs/OPTIMIZACION.md`)


**Regla de oro:** **mide, luego cambia, luego vuelve a medir.**

- **Presupuesto de un cuadro:** 16,7 ms a 60 Hz y 33,3 ms a 30 Hz. El navegador también necesita su parte: deja un 15 %.
- **Dónde medir:**
  - `vistas.ms` (ms de dibujo);
  - `MC.GPU.perfil()` (qué aparato es);
  - `node motor.mjs prueba --navegador` (CPU 4× más lenta).

### 1. Lo que el motor ya hace solo
| Técnica | Dónde | Qué logra |
|---|---|---|
| **Nivel del aparato** | `MC.GPU.perfil()` y `ajustes()` | Elige escala, cuadros por segundo, calidad y si usar WebGL o el raster. |
| **Resolución dinámica** | `MC.ResDinamica` (en la 3D) | Baja píxeles antes que cuadros, con un controlador PI que no oscila. |
| **Calidad automática** | `Vistas.calidad` | Menos edificios, tráfico y detalle si el cuadro tarda. |
| **3D por software** | `MC.Raster` | Sin WebGL, o con WebGL por software, la 3D sigue andando. En Chromium sin GPU: 15–25 ms, contra 70–90 ms del WebGL por software. |
| **Losas en caché** | `MC.Losas` | El suelo se pinta una vez por pedazo de 160 m. Mientras llega la nítida, se muestra una borrosa (carga progresiva). |
| **Capas perezosas** | `MC.Mundo.capa()` | Las capas del MC4 se inflan solo cuando alguien las pide. |
| **Rejillas espaciales** | Edificios por regiones, vías por celdas, lugares por celdas de 320 m | Las consultas no recorren todo el mapa. |
| **Simulación «en grueso»** | `MC.Poblacion` | Lo lejano se simula barato. |
| **Paso fijo y tope** | `MC.Bucle` | La física no depende de los FPS; un aparato lento no entra en espiral. |
| **Pausa en segundo plano** | `MC.Bucle` | Sin pestaña visible no hay cuadros: ahorra batería. |
| **Pixel** | `Vistas.pixel` | Dibuja en un tercio de la resolución: rapidísimo y con estilo. |
| **Etiquetas limitadas** | `Vista2D.etiquetas` | Pocas, sin montarse y sin tapar el centro. |

**Cifras medidas** (Chromium, CPU 4× más lenta, 412 × 860; mediana del dibujo):

| Vista | ms |
|---|---|
| Cenital | 4,8 |
| Ciudad 3D | 10,9 |
| Maqueta | 17 |
| Lateral | 10,6 |
| Panorámica | 10,8 |

### 2. Reglas para escribir código rápido (motor y juegos)
1. **Nada de basura por cuadro.** Reutiliza arreglos y objetos; evita `map`, `filter` y `slice` en el ciclo caliente si se puede.
2. **Una sola lectura de entrada por cuadro** (`controles.leer()`) y una sola actualización de cámara.
3. **Cachea lo que no cambia:** dibujos procedurales a lienzos (`MC.Sprites.hornear`) y texto medido.
4. **Nunca `getImageData` por cuadro**, ni cambiar el tamaño del lienzo por cuadro.
5. **Recorta lo que no se ve:** cajas visibles y conos de visión (`Raster.visible`).
6. **Detalle por distancia (LOD):** lejos, cajas; cerca, ventanas. Lejos, menos gente.
7. **Un atlas en vez de cien imágenes.** Menos cambios de estado; en WebGL, menos *draw calls*.
8. **El trabajo pesado, en pedazos.** Las losas se pintan unas pocas por cuadro (`losas.trabajar(n)`). Lo que tarde se hace al cargar, con una pantalla de «armando las calles…».
9. **Limita el `devicePixelRatio` a 2** (o 1,5 en gama media): pantallas de 3× gastan 9 veces los píxeles.
10. **Prueba en un celular real de gama media.** Es el aparato que importa.

### 3. Tiempos y sensibilidades (que se sienta bien)
- **Tiempo cambiante sin romper nada:**
  - `MC.Reloj.vel` acelera el día;
  - una cámara lenta es multiplicar `dt` en la simulación, no en la entrada;
  - la física siempre en pasos fijos.
- **Sensibilidad por vehículo** (`MC.Manejo.PERFIL`):

  | Vehículo | Respuesta |
  |---|---|
  | A pie | Directa (expo 1,15) |
  | Bici | 1,35 |
  | Moto | 1,55 |
  | Carro | 1,75, con giro que baja con la velocidad |
  | Camión | 1,9 |

  Ajusta por juego: un arcade puede bajar la respuesta y uno de simulación, subirla.
- **Asistencias:** frenar en curvas, imán de calle y acelerar solo. Encendidas para empezar y apagables para expertos.
- **Cámara:**
  - resortes de 0,12–0,2 s (más rápidos se marean y más lentos se sienten «borrachos»);
  - zona muerta de 18 px;
  - FOV +16 % a alta velocidad;
  - sacudida por trauma², no por azar.
- **Respuesta inmediata:** lo que el jugador toca responde en el mismo cuadro. Las animaciones de interfaz duran 0,2–0,6 s y respetan «reducir movimiento».

### 4. Cuando algo va lento
1. `MC.GPU.perfil()`: ¿es «software» o «baja»? Entonces el raster y la escala dinámica deberían estar activos.
2. `vistas.ms` por vista: ¿cuál vista se pasa?
3. En Chrome, Rendimiento → grabar 5 s: ¿qué función domina?
4. Prueba el pixel (`vistas.pixel = true`): si mejora mucho, el cuello es de píxeles; baja la escala.
5. Si es la simulación (tráfico, gente), baja `n` o el radio.
6. Anota el caso en un reporte (`node motor.mjs reporte`) con el aparato y las cifras.

### 5. Lo que sigue (para las IAs de código)
- Redes precalculadas en el MC4 (hoy `red('rueda')` tarda ~1 s en Medellín).
- Losas en un *Worker* con `OffscreenCanvas` (sin trabar el hilo principal).
- WebGL con lotes estáticos e *instancing* para árboles y ventanas.
- Atlas único de arte por juego.
- Audio: programar notas con anticipación (ya lo hace `MC.Musica`) y bajar voces en celulares lentos.


---

# ANEXO G. Usos y negocio (`docs/NEGOCIO-Y-USOS.md`)


> No es asesoría legal ni financiera: son ideas para explorar. Antes de vender o firmar, consúltalo con un abogado de propiedad intelectual y con un contador.

### 1. Lo que tienes en la mano
Un **motor que convierte cualquier lugar real en un mundo jugable y simulable**:
- con calles, edificios, relieve, clima, tráfico, transporte y gente;
- en un solo HTML que corre en cualquier celular;
- con ciencia verificable (física, química, biología y economía);
- y con herramientas para que **una IA arme un juego nuevo en minutos**.

Pocos proyectos juntan todo eso, y menos en español y con datos de Colombia.

### 2. Otros usos (más allá del entretenimiento)
| Uso | Para qué | Pieza del motor |
|---|---|---|
| **Educación vial y cultura ciudadana** | Simuladores de bici, peatón y conducción en la ciudad real (semáforos, clima, frenada real) | Física, tráfico, clima |
| **Turismo** | Recorridos interactivos de pueblos (Guatapé, Jardín, Santa Fe de Antioquia) y guías jugables | Craqueo de territorios, panorámica, interiores |
| **Movilidad y urbanismo** | Ver un proyecto (una ciclorruta, una línea de cable, un cambio de semáforos) antes de construirlo, con gente y tráfico simulados | Mundo MC4, redes, población, transporte |
| **Gestión del riesgo** | Escenarios de lluvia fuerte, inundación de quebradas, rutas de evacuación con la gente real del barrio | Relieve, clima, IA de rutinas, A\* |
| **Colegios y universidades** | Física, química, biología y economía «jugables»: el mismo carro con otra masa, una criatura en otro planeta, el mercado de un pueblo | Ciencia, taller, seres, economía |
| **Capacitación laboral** | Repartidores, conductores, guías y personal de estaciones: recorridos reales, tiempos y horarios | Misiones, transporte, interiores |
| **Inmobiliario y comercio** | Ver una zona con su relieve, sus edificios y su vida a cualquier hora | Vistas, día y noche |
| **Publicidad y marcas** | Minijuegos de marca en una ciudad real (sin usar marcas ajenas sin permiso) | Plantillas de juego |
| **Investigación** | Simular comportamiento de multitudes, tráfico o economía de un barrio | Población, tráfico, mercados |

### 3. Cómo se puede distribuir o vender
- **Juegos propios:**
  - los cuatro que vienen: EnCicla, El Metro, Run Scooter y Motor City/Extremo;
  - como web gratis con anuncios o patrocinio, como APK en Play Store (como ya hacen EnCicla y El Metro), o con pagos dentro del juego (vehículos, pieles, mundos).
- **Licenciar el motor:**
  - **dual**: gratis para educación y uso personal, y de pago para empresas;
  - o una **licencia comercial** por proyecto.

  Hoy el repositorio no tiene licencia declarada (por defecto, «todos los derechos reservados»). Elige una antes de abrirlo al público.
- **Mundos a la medida:** «craqueamos tu pueblo o tu ciudad». Se cobra por mundo y por juego para alcaldías, gobernaciones, oficinas de turismo, cajas de compensación y empresas.
- **Servicio de juegos con IA:** usar el motor y las plantillas para entregar juegos educativos o de marca en días, no en meses.
- **Contenido:** pieles, mundos y paquetes de música y misiones para los juegos.

**Cuidado con las licencias de los datos:**
- OpenStreetMap usa la licencia **ODbL**: se puede usar comercialmente, pero hay que **atribuir** siempre. Si redistribuyes la base de datos modificada, debe quedar con la misma licencia (los juegos como «obra producida» tienen reglas más simples).
- Overture tiene licencias por tema (ODbL y CDLA). SRTM es libre.
- La música clásica usada es de dominio público, con transcripción propia.
- **Nada de marcas ni personas reales sin permiso.** Ojo con logos como el del Metro o el de EnCicla: para usarlos comercialmente hace falta autorización de esas entidades.

### 4. A quién proponérselo (Colombia primero)
| A quién | Qué proponer |
|---|---|
| **Metro de Medellín, Área Metropolitana (EnCicla), Secretaría de Movilidad** | Juegos de cultura ciudadana. Ya tienes dos juegos sobre ellos: es la puerta natural, pero con su permiso. |
| **Alcaldías y gobernación (turismo, educación, TIC)** | Pueblos patrimonio jugables; simuladores para colegios. |
| **Ruta N, Parque Explora, Planetario, museos** | Ciencia jugable (la física, la química y la biología del motor). |
| **Universidades** (EAFIT, UdeA, UPB, Nacional, ITM) | Proyectos de investigación en movilidad, simulación y videojuegos; semilleros. |
| **MinCiencias, MinTIC, iNNpulsa** y convocatorias de **industrias creativas y economía naranja** | Fondos y becas para desarrollo de videojuegos y contenidos educativos. |
| **Cajas de compensación** (Comfama, Comfenalco) | Contenidos educativos y recreativos. |
| **Empresas de movilidad, seguros y logística** (aseguradoras, apps de reparto) | Capacitación y seguridad vial. |
| **Estudios de videojuegos** (Colombia y Latinoamérica) | Licencia del motor o coproducción. |
| **Festivales y mercados** (Colombia 4.0, BOGOTÁ Game Week u otros eventos de la industria) | Para mostrar los juegos y el motor. |

**Cómo presentarlo (en 3 minutos):**
1. Abre Mandados en el celular.
2. Craquea en vivo un pueblo que les importe (20 segundos).
3. Muéstralo en cenital, 3D y panorámica, de día y de noche, con lluvia.
4. Cierra con el modelo: lo que cuesta un juego o un mundo a la medida.

### 5. Cómo se integra a distintas propuestas
- **Un juego o una experiencia por proyecto:** plantilla, mundo del lugar, piel de la marca o la entidad, y las mecánicas que pida. Sale un HTML único: en la web de ellos, en un QR o en un APK.
- **Educación:** módulos del motor como laboratorios (por ejemplo, «diseña tu carro y mide su frenada en lluvia»), con guías para el docente.
- **Datos de ciudad:** el MC4 se puede alimentar con capas oficiales (catastro, malla vial, transporte GTFS) para estudios. La tubería ya acepta capas oficiales (`geo/oficial.py`).
- **Con otras IAs:** el repositorio trae skills, plantillas y reportes. Una IA nueva entiende el motor y aporta sin romperlo (`CONTRIBUIR.md`).


---

# ANEXO H. Cómo contribuir (`CONTRIBUIR.md`)


El repositorio queda **abierto para las IAs que desarrollan cada juego**: Juega EnCicla, El Metro, Run Scooter y los que vengan. Si un juego necesita algo del motor, se agrega aquí, para todos.

### Reglas
1. **Tu rama.** Trabaja en una rama tuya (`ia-elmetro/…`, `ia-encicla/…`). No hagas PR ni toques `main` si el autor no lo pide.
2. **Antes de cambiar:** lee `CONTEXTO-IA.md`, `MOTOR.md` y la skill `motor-city-desarrollo` (en `.claude/skills/`).
3. **No rompas a los otros:**
   - si cambias la API de `MC`, deja la vieja funcionando (alias) y dilo en el reporte;
   - si cambias el formato del mundo (MC4), sube la versión mayor y explica la migración;
   - **no toques `js/valle.js`**: lo incluye Juega EnCicla.
4. **Lo propio de tu juego no entra al motor:** trama, menús, arte final y huevos. Entra lo que **otro juego también podría usar**: una mecánica, una capa de datos, una vista, una regla del mundo o un dibujo base.
5. **Pruebas en verde:** `node motor.mjs prueba --navegador`. Si agregas algo, agrega su prueba con valores conocidos. Si es ciencia, cita la fuente.
6. **Reporte obligatorio:** `node motor.mjs reporte "Título" --juego elmetro --autor "IA de El Metro"`. Llénalo: qué necesitabas, qué cambiaste, cómo lo probaste y qué falta.
   - La **IA del motor** (Claude) revisa los reportes, pule los detalles, sube la versión y sincroniza a todos.
7. **Sincronizar:** después de que la IA del motor integre tu cambio, `node motor.mjs sincronizar ../TuJuego` lo copia a `TuJuego/motor-city/`.
8. **Atribución y licencias:**
   - Datos abiertos: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; relieve SRTM/NASA.
   - Música clásica: solo obras de dominio público, con transcripción propia.
   - Imágenes: nunca copiadas de fotos ni de satélite.

### Atajos
| Para | Comando |
|---|---|
| Un juego o modo nuevo | `node motor.mjs nuevo juego nombre --mundo guatape` |
| Una mecánica o módulo nuevo | `node motor.mjs nuevo modulo nombre` (con su prueba en `pruebas/modulos/`) |
| Un territorio real nuevo | `python3 geo/territorio.py --id x --bbox=lon0,latS,lon1,latN` |
| Un mundo inventado | `MC.Generador.mundo({ semilla, tipo })` |


---

# ANEXO I. Bitácora (`BITACORA.md`)


### 20‑nov‑2026 · 2.10.0 · Todo unido, más liviano y con las skills de los videos (Claude Code)
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

### 20 de noviembre de 2026 · 2.9.1 · Persistencia por sectores

Se añadió `MC.GuardadoSectores`, con claves estables, cambios JSON por sector, transición entre sectores activos y dormidos, guardado atómico y migradores versionados. Las pruebas verifican retorno, migración y fallo de almacenamiento. La integración de esos cambios con los objetos y huellas de Mandados sigue pendiente.

La auditoría de los enlaces nuevos y las tareas abiertas está en `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`.


### 20‑nov‑2026 · 2.9.0 · Unión de la 2.8 (Claude) con la 2.7.1 (ChatGPT/Codex) (Claude Code)
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

### 20‑nov‑2026 · 2.8.0 · La entrega maestra de referencias, al motor (Claude Code)
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

### 20 de noviembre de 2026 · 2.7.1 · Arte a escala y adaptadores

Mandados incorpora seis atlas de ChatGPT con 676 cuadros. Los 997 cuadros del paquete de Gemini pasan el revisor tras reparar los recortes y márgenes. Guatapé y Medellín cargan su hidrografía desde MC4. Godot 4 y three.js abrieron escenas del motor.

El banco integrado pasó 130 pruebas. La maqueta midió 34,9 ms con CPU 4×, por encima de la meta de 20 ms. El informe enlaza las pruebas de los tres juegos, las capturas y los pendientes. [Entrega del motor compartido](ENTREGA-CHATGPT-MOTOR-CITY-2.6.md)


### 20‑nov‑2026 · 2.7.0 · Estilos gráficos, peso y vida, y motores potentes (Claude Code)
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

### 20‑nov‑2026 · 2.6.0 · Estilo realista familiar, árboles de pie y tareas de cada IA (Claude Code)
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

### 19‑nov‑2026 · 2.5.1 · Mandados jugable de verdad (Claude Code)
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

### 19‑nov‑2026 · 2.5.0 · Entrar al agua (Claude Code)
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

### 19‑nov‑2026 · 2.4.0 · Montañas, rocas, agua y límites de paso (Claude Code)
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

### 19‑nov‑2026 · 2.3.0 · La ciudad como SimCity, Los Sims, Cities: Skylines y Townscaper (Claude Code)
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

### 19‑nov‑2026 · 2.2.0 · GPU virtual, mi casa, lugares, historias y vista lateral (Claude Code)
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

### 19‑nov‑2026 · 2.1.0 · Motor City crece (Claude Code)
- Nombre: solo «Motor City»; los juegos lo reciben en `motor-city/`.
- Ciencia, economía, generador de mundos, territorios (`geo/territorio.py` con Guatapé), clima global, seres, taller, IA y población, interiores, música, interfaz y mecánicas.
- Minijuego Mandados; plantillas, `nuevo`, `reporte`, skills `motor-city-*` y `CONTRIBUIR.md`. 80 pruebas.

### 19‑nov‑2026 · 2.0.0 · nace Motor City (Claude Code)
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

