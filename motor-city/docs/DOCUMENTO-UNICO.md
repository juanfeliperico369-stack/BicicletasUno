# MOTOR CITY · Documento único

> **Para el autor (OneZero) y para todas las IAs:** Gemini (Antigravity y Nano Banana), ChatGPT (Codex), Claude y las IAs de Juega EnCicla, El Metro y Run Scooter.
>
> **Cada IA lee TODO este documento** para tener el contexto completo. Después hace **solo su parte** (§9) y entrega **un solo documento** (§11).
>
> | | |
> |---|---|
> | Versión | **Motor City 2.5.1** · 19‑nov‑2026 |
> | Repositorio | `juanfeliperico369-stack/motorcity` (rama `claude/motor-city-engine-xu7p4y`; la web sale de `main`) |
> | Web | <https://juanfeliperico369-stack.github.io/motorcity/> |
> | Minijuego | <https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html> |
> | **¿Está todo lo pedido?** | `docs/PEDIDOS.md`: cada pedido del autor, su estado y el archivo donde quedó |

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
| **2.5.1** (esta) | «El minijuego es injugable: no hay controles de verdad, no se puede mover nada; hay que pagar cosas. Mejóralo con lo nuevo. ¿Ya están todos los pedidos?» | **Lo que pasaba:** el personaje sí se movía, pero la cámara estaba tan lejos que medía 3 píxeles y el joystick no se veía. **Lo que se hizo:**<ul><li>**cámara cerca**: unos 45 m en el lado corto de la pantalla;</li><li>**marca del jugador** (anillo y flecha);</li><li>**joystick visible** con guía, y **botones de acción** para el pulgar: ⤒ saltar, ⚡ turbo, y 🔽 🔼 en el agua o en el aire;</li><li>**flecha al objetivo** con la distancia, siempre en la zona libre;</li><li>**tutorial** al empezar;</li><li>**modo libre** por defecto: todo gratis, con los 34 vehículos (pie, bici, moto, carro, bus, avión y lancha);</li><li>menús **Vista** y **Ajustes**;</li><li>el **primer mandado cerca**;</li><li>en computador, flechas o WASD;</li><li>la lista **`docs/PEDIDOS.md`**.</li></ul>**Llegó la entrega de Gemini** (G‑M0…G‑M15) y quedó integrada:<ul><li>`arte/gemini/` y **`MC.Pieles`**, con respaldo procedural en cada gancho;</li><li>en Mandados se usan árboles del trópico, props, rocas, fachadas y muebles, y el selector 🎨 Arte;</li><li>también se corrigió lo válido de su auditoría.</li></ul>118 pruebas, con una nueva que juega en un celular táctil. |

## 3. Estado actual
| | |
|---|---|
| **Pruebas** | **118 en verde** (`node motor.mjs prueba --navegador`): 111 en Node y 7 en Chromium. Una de ellas juega Mandados en un celular táctil. |
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
- Las partes son: `prop`, `naturaleza`, `fachada`, `personaje`, `vehiculo`, `animal` y `mueble`.

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
node motor.mjs construir && node motor.mjs prueba --navegador     # 118 en verde
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
### 9.1 Gemini (Antigravity y Nano Banana) · ARTE y auditoría visual
**Objetivo:** la piel por defecto del motor y una **ciudad con detalle** como Cities: Skylines y Townscaper; casas distintas como Los Sims.

**En orden** (detalle en §10.1):
1. **G‑M0** · ancla de estilo.
2. **G‑M1** · personaje.
3. **G‑M2** · vehículos.
4. **G‑M3** · animales y criaturas.
5. **G‑M4** · muebles por estilo.
6. **G‑M5** · pisos y muros.
7. **G‑M6** · lugares jugables.
8. **G‑M7** · fachadas por zona.
9. **G‑M8** · siluetas de hitos.
10. **G‑M9** · íconos.
11. **NUEVO G‑M10** · kit de props urbanos (gancho `prop`).
12. **NUEVO G‑M11** · *decals* del piso.
13. **NUEVO G‑M12** · módulos de fachada para las reglas (gancho `fachadaModulo`).
    - **NUEVO G‑M15 (2.4)** · naturaleza y agua: rocas (5 tamaños), palmas, frailejones, arbustos y juncos para el gancho `naturaleza`; texturas de agua por tipo (mar, lago, río, quebrada), espuma de orilla y arena mojada.
14. **NUEVO G‑M13** · paletas por hora y por capa de datos.
15. **NUEVO G‑M14** · guía de luz y sombra.
16. **Auditoría visual.**

**El código que usarás para probar:** pega tu atlas en la consola de Mandados y registra los ganchos (§5.4):
```js
MC.Sprites.atlas('gemini', { imagen: 'data:image/webp;base64,…', cuadros: { poste: [0, 0, 16, 64, 8, 64], arbol_guayacan: [16, 0, 64, 96, 32, 96] }, metros: { poste: 9, arbol_guayacan: 8 } });
MC.arte.registrar('motor', { prop: (g, p, x, y, pxm) => MC.Sprites.dibujar(g, 'gemini/' + (p.t === 'arbol' ? 'arbol_guayacan' : p.t), x, y, pxm) });
```

**Estado (2.5.1):** la entrega G‑M0…G‑M15 llegó (`ENTREGA-GEMINI-MOTOR-CITY-2.5.md`) y está integrada en `arte/gemini/`. La revisión de Claude está en `arte/gemini/LEEME.md`:
- **se usan** los árboles, los props, las rocas, las fachadas y los muebles;
- **falta, para la segunda vuelta:**
  - el personaje y los vehículos a escala, llenando el cuadro;
  - sin sombra horneada;
  - 2 px de margen entre cuadros;
  - árboles de 128 px.

**No es tu rol:** el código del motor (eso es de ChatGPT).

### 9.2 ChatGPT (Codex) · CÓDIGO: auditoría, mejoras, contenido y pruebas
**Objetivo:** más rápido, más robusto y más contenido, con pruebas.

**En orden** (detalle en §10.2):
1. **C‑M1** · auditoría 2.2 y 2.3.
2. **C‑M2** · redes precalculadas.
3. **C‑M3** · raster más rápido.
4. **C‑M4** · 50 direcciones públicas.
5. **C‑M5** · 60 storylets, más 15 de alcalde.
6. **C‑M6** · accesibilidad, con paletas para daltónicos en las capas.
7. **C‑M7** · íconos.
8. **C‑M8** · pruebas.
9. **NUEVO C‑M9** · tráfico con propósito (casa → trabajo por la red).
10. **NUEVO C‑M10** · casa: A*, paredes y dos habitantes.
11. **NUEVO C‑M11** · pueblo sobre la rejilla irregular.
12. **NUEVO C‑M12** · sombras sobre muros y de árboles, en caché.
13. **NUEVO C‑M13** · maqueta por debajo de 20 ms.
    - **NUEVO C‑M15 (2.4)** · terreno.
14. **NUEVO C‑M14** · distritos y políticas en `MC.Urbe`.

**El código que usarás:**
- `git apply` de tus *diffs* sobre la rama;
- `node motor.mjs prueba --navegador` en verde;
- cada mejora con su prueba en `pruebas/prueba.mjs`, con el estilo `ok(condición, 'qué se prueba', datos)`.

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
### 10.1 Para Gemini (arte)
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

### 10.2 Para ChatGPT (código)
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
