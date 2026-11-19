<!-- Generado por node motor.mjs documento · Motor City 2.3.0 · no se edita a mano: edita los documentos de origen -->

# MOTOR CITY · Documento único

> **Para el autor (OneZero) y para todas las IAs:** Gemini (Antigravity y Nano Banana), ChatGPT (Codex), Claude y las IAs de Juega EnCicla, El Metro y Run Scooter.
>
> **Cada IA lee TODO este documento** para tener el contexto completo. Después hace **solo su parte** (§9) y entrega **un solo documento** (§11).
>
> | | |
> |---|---|
> | Versión | **Motor City 2.3.0** · 19‑nov‑2026 |
> | Repositorio | `juanfeliperico369-stack/motorcity` (rama `claude/motor-city-engine-xu7p4y`; la web sale de `main`) |
> | Web | <https://juanfeliperico369-stack.github.io/motorcity/> |
> | Minijuego | <https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html> |

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
| **2.3** (esta) | Estudiar **SimCity, Los Sims, Cities: Skylines y Townscaper**: cómo crean entornos, ambientes, sombras y detalles de ciudad. Un **documento único** con todo y el código a usar | **Sombras del sol** por hora en todas las vistas. **Mobiliario urbano** y luces de noche. **Fachadas por reglas** (WFC). **`MC.Urbe`**: zonas, demanda RCI, valor del suelo, servicios, contaminación, crecimiento, niveles, recursos, presupuesto y **capas de datos**. **Objetos inteligentes** y necesidades (`MC.Habitante`). **`MC.Ondas`**, `MC.Autotile` y `MC.RejillaIrregular`. **`MC.Paisaje`** (sonido ambiente). Mandados con **modo alcalde** y casa habitada. 109 pruebas. Este documento. |

## 3. Estado actual
| | |
|---|---|
| **Pruebas** | **109 en verde** (`node motor.mjs prueba --navegador`): 103 en Node y 6 en Chromium. |
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
```

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

### 5.9 Probar y medir
```bash
node motor.mjs construir && node motor.mjs prueba --navegador     # 109 en verde
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
14. **NUEVO G‑M13** · paletas por hora y por capa de datos.
15. **NUEVO G‑M14** · guía de luz y sombra.
16. **Auditoría visual.**

**El código que usarás para probar:** pega tu atlas en la consola de Mandados y registra los ganchos (§5.4):
```js
MC.Sprites.atlas('gemini', { imagen: 'data:image/webp;base64,…', cuadros: { poste: [0, 0, 16, 64, 8, 64], arbol_guayacan: [16, 0, 64, 96, 32, 96] }, metros: { poste: 9, arbol_guayacan: 8 } });
MC.arte.registrar('motor', { prop: (g, p, x, y, pxm) => MC.Sprites.dibujar(g, 'gemini/' + (p.t === 'arbol' ? 'arbol_guayacan' : p.t), x, y, pxm) });
```

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
1. Unir las entregas: 2.4.
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
| **C‑M14 (nuevo)** | **Distritos y políticas** en `MC.Urbe`, como Cities: Skylines: nombre, impuestos por distrito y políticas (prohibir industria pesada, bici prioritaria, parques gratis), con efecto en los campos y en la demanda. |

## 11. Cómo entregar
- **Gemini:** `ENTREGA-GEMINI-MOTOR-CITY-2.3.md`:
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
1. **Probar en un celular real** de gama media: qué se siente lento o confuso.
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

**Las anteriores** (FEZ, Monument Valley, Little Nightmares, No Man's Sky, storylets, Left 4 Dead, cámaras y diseño de interfaz) están en `docs/INVESTIGACION.md`.


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
| **Arte** | `MC.arte`, `MC.Sprites`, `MC.Pincel` | Pieles por juego, atlas, animaciones y respaldo procedural. |
| **Adentro** | `MC.Interiores`, `MC.Hogar`, `MC.Direccion` | Interiores con estilos, **tu casa desde tu dirección** y diseño. |
| **A dónde ir** | `MC.Lugares`, `MC.Desgaste` | Talleres, tiendas, restaurantes, bibliotecas y parques; reparar y mejorar. |
| **Qué pasa** | `MC.Mision`, `MC.Inventario`, `MC.Carrera`, `MC.Logros`, `MC.Dialogo`, `MC.Historias`, `MC.Director`, `MC.Ocurrencias` | Misiones, carreras, historias con pilares, ritmo y lo imprevisto. |
| **Pantalla y sonido** | `MC.UI`, `MC.Musica`, `MC.Paisaje` | Interfaz con zonas y atenuación; música procedural y clásicos; sonido ambiente del lugar. |
| **Ciudad (2.3)** | `MC.Urbe`, `MC.Sombras`, `MC.Mobiliario`, `MC.Ondas`, `MC.Autotile`, `MC.RejillaIrregular`, `MC.Necesidades`, `MC.Habitante` | Zonas, demanda, valor del suelo y capas de datos; sombras del sol; postes, árboles y cebras; fachadas por reglas; casas habitadas. |

### 3. Cómo se usa (cinco recetas)
**a) Jugar o mostrar.** Abre <https://juanfeliperico369-stack.github.io/motorcity/> en el celular.

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
4. **Si es arte**, pídelo a Gemini o ChatGPT con las reglas de `docs/PETICION-*.md`: un solo documento, sprites en atlas con fondo magenta o transparente, y medidas en metros.
5. **Si es un dato real** (un precio, una cifra científica), va con su **fuente** en el código y su **prueba** con el valor conocido (skill `motor-city-ciencia`).
6. **Si algo falla en el celular**, anota el modelo y lo que pasó. Con `MC.Ocurrencias.exportar()` y `MC.GPU.perfil()` la IA del motor lo reproduce.

### 6. Comandos
| Comando | Qué hace |
|---|---|
| `node motor.mjs construir` | Arma el motor, los mundos y los juegos (`dist/`). |
| `node motor.mjs prueba --navegador` | Corre las 109 pruebas, también en Chromium. |
| `node motor.mjs documento` | Arma `dist/MOTOR-CITY-TODO.md` (el documento único con anexos). |
| `node motor.mjs nuevo juego\|modulo nombre` | Crea un juego o un módulo desde su plantilla. |
| `node motor.mjs reporte "título" --juego X` | Deja el reporte de un cambio hecho desde otro juego. |
| `node motor.mjs sincronizar ../Juego` | Copia el motor a `Juego/motor-city/`. |
| `python3 geo/territorio.py …` | Craquea un lugar real. |


---

# ANEXO B. Contrato técnico (`MOTOR.md`)


**Versión 2.3.0 · 19‑nov‑2026.** Documento único con todo: `docs/DOCUMENTO-UNICO.md`. Fuente de verdad: `juanfeliperico369-stack/motorcity`. Copias: `motor-city/` de Juega EnCicla y de El Metro, con `herramientas/sincronizar.mjs`. Cómo se usa: `docs/MANUAL.md`.

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
node motor.mjs prueba --navegador                 # debe decir «✓ TODAS LAS PRUEBAS PASARON · 109 bien»
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

