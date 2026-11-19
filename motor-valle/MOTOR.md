# Motor City · Motor del Valle 2.0 · el contrato

**Versión 2.0.0 · 19‑nov‑2026.** Fuente de verdad: `juanfeliperico369-stack/motorcity`. Copias: `motor-valle/` de Juega EnCicla y de El Metro, con `herramientas/sincronizar.mjs`.

**Qué es.** El motor de mundo abierto único de Medellín y el Valle de Aburrá, y de cualquier otra ciudad que se le dé:

- **un solo mundo**, en un solo archivo de datos (MC4);
- **un solo personaje** y **un registro de vehículos**;
- **todas las vistas**: cenital, pixel, ciudad 3D, maqueta 2:1, panorámica de perfil, tercera y primera persona, dron y cine;
- **las mismas reglas del mundo**: reloj, calendario, cielo, clima, tráfico, semáforos y transporte con horario;
- **Run en la ciclovía**.

Cada juego conserva lo suyo y solo pone su piel: formas de juego, apartados, arte, trama y huevos de pascua.

## 1. Reglas
1. **El mundo solo se cambia aquí.** Una corrección del mapa (una calle, un puente, un edificio o una estación) va en `motorcity`: en `geo/`, en `herramientas/fusionar.mjs` o en `ciudades/<id>.json`. Luego se sube la versión y se sincroniza.
2. **Cada cambio sube la versión** en `VERSION.json` (*semver*). Se copia a los juegos con `node herramientas/sincronizar.mjs ../BicicletasUno` (o `../MetroZero`). Con `--verificar` debe decir «los archivos son iguales».
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

## 2. Comandos
| Comando | Qué hace |
|---|---|
| `node motor.mjs mundo` | **F1**: junta los datos de EnCicla (`../BicicletasUno`) y de El Metro (`../MetroZero`) en `datos/<ciudad>/mundo.mc4` y `resumen.json`. |
| `node motor.mjs construir` | `dist/motor.js` (el motor), `dist/mundo-<ciudad>.js` (el mundo en base64) y `dist/motor-city.html` (el banco de pruebas jugable). |
| `node motor.mjs run` | Vuelve a importar Run Scooter de `../RunRunZero` a `run/run-scooter.js`, con sus parches comprobados. |
| `node motor.mjs prueba [--navegador]` | Las pruebas del motor: datos, consultas, redes, tiempo, transporte, tráfico, física y vehículos. Con `--navegador`, también las 8 vistas, Run y el rendimiento. |
| `node motor.mjs sincronizar RUTA [--verificar]` | Copia el motor a `RUTA/motor-valle/`, o solo compara. |
| `node motor.mjs fuentes \| encicla \| elmetro RUTA \| version` | La tubería 1.x de siempre (`geo/*.py`), que genera los datos que hoy leen los juegos. |

## 3. Coordenadas
- **Unidad:** metros del mapa, desde el origen de la ciudad (`lon0`, `latN`). `x` va hacia el oriente y `y` hacia el sur. La altura es la cota (m s. n. m.) más lo que se levanta.
- **Casilla:** `tile` m (10 en el valle). Casilla de un punto: `x / tile`. Las capas de celda van cada 8 casillas (80 m).
- **Grados:** `x = (lon − lon0) · kx` y `y = (latN − lat) · ky`, con `kx = 111320 · cos(lat_ref)` y `ky = 110574` m por grado.
- **Juega EnCicla dibuja en px:** 1 m = 1,6 px. `MC.ValleCompat.desdeMundo(mundo, 16)` le da las consultas 1.x en px.
- **El Metro dibuja en metros:** usa el mundo tal cual.

## 4. El mundo 2.0 (contenedor MC4)
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

## 5. El motor en el navegador (`dist/motor.js` → `MC`)
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

**La escena** que reciben las vistas: `{ mundo, camara, reloj, clima, cielo, transporte, jugador: { cuerpo, aspecto }, vehiculos, trafico, peatones, cables, pano: { trazo, s, id }, extras: [{ x, y, dibujar }], t }`. El banco de pruebas (`sandbox/10-juego.js`) es el ejemplo completo de un juego sobre el motor, en unas 150 líneas.

## 6. La piel de cada juego (hooks de arte)
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

## 7. Las vistas, una por una
- **Cenital:** losas, objetos encima y techos con sombra. Se gira con dos dedos.
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

## 8. Run en la ciclovía
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

## 9. Reglas del mundo (F5)
| Regla | Cómo funciona |
|---|---|
| **Reloj** | Un minuto de juego por segundo real (configurable). |
| **Calendario** | Festivos de Colombia con la Ley Emiliani (Pascua calculada) y fiestas de la ciudad. |
| **Cielo** | Colores por hora; sol y luna astronómicos para la latitud. |
| **Clima** | Bloques de 3 h con azar fijo por fecha, según la probabilidad del mes y la hora (temporadas de lluvia y aguaceros de la tarde). Es igual para todos a la misma hora. |
| **Transporte** | Lunes a sábado, de 4:30 a. m. a 11 p. m.; domingos y festivos, de 5 a. m. a 10 p. m. Frecuencias de hora pico y de valle; parada en cada estación. Las cabinas van cada 12 s. |
| **Tráfico** | Agentes alrededor del jugador. Semáforos de 60 s con fase fija por cruce; frenan en amarillo y en rojo, y guardan distancia. |
| **Huevos** | `MC.huevos.poner({ id, x, y, radio, hora, vehiculo, cond, juegos })`. El motor avisa con `MC.on('huevo')` una sola vez. |

## 10. Hoja de ruta (lo que sigue)
- **2.1:** precalcular las redes en el MC4 (hoy `red('rueda')` tarda alrededor de 1 s al arrancar). Guardar el ancho y la nomenclatura de las ciclorrutas. Sumar `geo/pasos.py` (niveles firmados de Overture) y conectarlo al GPS de dos niveles.
- **2.2:** sombras del sol en WebGL. Agua animada del río. Ventanas con textura. Árboles por especie. Atlas del arte que entreguen Gemini y ChatGPT (`MC.arte`).
- **2.3:** Motor City (carreras), con la física de carro con derrape, motos, aviones y lanchas ya registrados (sección 5). Pistas de carrera sobre la red real y repeticiones.
- **3.0:** otra ciudad completa con la receta de `docs/CIUDADES.md`.

## Historial
| Versión | Fecha | Qué cambió |
|---|---|---|
| 1.0.0 | 18‑nov‑2026 | Una tubería con dos resoluciones, el exportador a El Metro, el sincronizador y el contrato (BicicletasUno). |
| 1.1.0 | 18/19‑nov‑2026 | Túneles y deprimidos; el lector `valle.js`; la fachada de El Metro. |
| 1.2.0 | 19‑nov‑2026 | Une las dos 1.1.0 con la fuente de verdad en BicicletasUno. |
| **2.0.0** | 19‑nov‑2026 | **Motor City.** La fuente de verdad pasa a `motorcity`.<br>• Mundo 2.0 en un solo archivo (MC4), con todas las huellas, sitios, pasos con nivel, transporte, lugares y tráfico.<br>• El motor en el navegador: personaje, vehículos, física, controles, cámara, 8 vistas más pixel, panorámica de perfil, WebGL, reglas del mundo y Run en la ciclovía.<br>• Banco de pruebas jugable y 54 pruebas.<br>• La tubería 1.x sigue igual (y ya lee cualquier ventana de ciudad). |
