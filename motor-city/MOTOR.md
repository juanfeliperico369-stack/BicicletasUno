# Motor City · el contrato

**Versión 3.0.0 · 20‑nov‑2026.** Documento único con todo: `docs/DOCUMENTO-UNICO.md`. Fuente de verdad: `juanfeliperico369-stack/motorcity`. Copias: `motor-city/` de Juega EnCicla y de El Metro, con `herramientas/sincronizar.mjs`. Cómo se usa: `docs/MANUAL.md`.

**Qué es.** El motor de mundo abierto que convierte cualquier lugar real (Medellín, Guatapé, cualquier ciudad) o inventado (un valle, una isla, un planeta) en un mundo jugable con leyes reales:

- **un solo mundo**, en un solo archivo de datos (MC4);
- **un solo personaje** y **un registro de vehículos**;
- **todas las vistas**: cenital, pixel, ciudad 3D, maqueta 2:1, panorámica de perfil, tercera y primera persona, dron y cine;
- **las mismas reglas del mundo**: reloj, calendario, cielo, clima, tráfico, semáforos y transporte con horario;
- **Run en la ciclovía**.

Cada juego conserva lo suyo y solo pone su piel: formas de juego, apartados, arte, trama y huevos de pascua.

## 1. Reglas
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

## 2. Comandos
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

## 9b. Física de niveles (2.2)
- **Superficies:** el terreno y los tableros (con su rampa) en cada punto.
- **Apoyo:** el cuerpo se apoya en la más alta que quede a un escalón (0,5 m a pie, 0,35 m con ruedas, más lo que avanza en el cuadro).
- **Pared:** lo que queda entre los pies y la cabeza no se atraviesa.
- **Por debajo:** lo que queda arriba de la cabeza se pasa por debajo.
- **Caída:** sin apoyo, cae con gravedad.
- **Barandas:** no dejan salir del tablero.
- **Deprimidos:** solo se entra por sus extremos.
- **Salto:** tiempo de coyote (0,12 s) y memoria del botón (0,14 s).

## 9c. El planeta, la búsqueda y los modelos (4.0)
- **`MC.Planeta`:**
  - `new MC.Planeta({ anillo, cargar: id => MC.Mundo.cargar(b64, cfg) })` arma el anillo de ciudades y carreteras;
  - `await P.mundo(id)` carga perezosa, con dos mundos en memoria como máximo;
  - `P.puertas(id).siguiente` da `{ x, y, a, nombre }`;
  - `P.cruce(id, x, y, dt)` da `{ a: idVecino }`;
  - `P.llegada(id, desde)` dice dónde aparece quien llega;
  - `P.restante(id, x, y)` sirve para el letrero;
  - `P.globo(g, W, H, { lon0, inclinacion, t, yo })` dibuja el planeta;
  - `Generador.carretera({ largo, biomas, semilla })` crea un tramo de la nada.
  - En la vista 3D, `E.curvatura = 1/(2R)` curva el horizonte.
- **`MC.Busqueda`:**
  - `new MC.Busqueda(M)`;
  - `B.alerta(gravedad, { testigos, visible, causa })` y `B.ponerNivel(n)`;
  - `B.banda(n)`, `B.esconder()`, `B.senuelo(x, y, s)`, `B.pulso(J)` y `B.disparar(J)`;
  - cada cuadro, `B.actualizar(dt, cuerpo, trafico)`, más `B.vehiculos()` (con `sirena` y `roto`) y `B.obstaculos()`;
  - `B.sacar()` entrega los eventos `nivel`, `embestida`, `disparo`, `herido`, `fuera`, `pinchado`, `bloqueo`, `puas`, `atrapado` y `perdidos`.
- **`MC.Modelos`:**
  - `MC.Modelos.registrar(id, glb | base64)` y `MC.Modelos.paquete(MC_MODELOS)`;
  - `malla.modelo(Mo, x, y, z, a, { largo | k, tinte, oscuro, dano: { f, b, l, r } })`, con las abolladuras por zona; de noche se encienden los faros y hay luz propia (`MC.Modelos.brillo`);
  - `MC.Modelos.vehiculo(v)` elige el modelo de un vehículo del tráfico;
  - `E.modelos3d = [{ id, x, y, a, k, clip }]` pone modelos en el mundo;
  - `MC.Modelos.posar(Mo, clip, t)` anima modelos con piel glTF, y `E.jugador.modelo` anima al jugador a pie.
- **Juegos con varios mundos:** en `juego.json`, `"mundos": ["nueva_york", "medellin", "guatape"]` y `"modelos": "arte/modelos/turno-cero"`. El juego lee `document.getElementById('mc4-' + id).textContent` y `MC_CIUDADES[id]`.

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
| **3.0.0** | 20‑nov‑2026 | **Un solo mundo 3D, varias cámaras:**<ul><li>`js/45-gl3d.js`: `Malla.triF/quadF/esfera/cil/cajaF/arbol3d/edificio3d/carro3d/persona3d`;</li><li>`CAM_PERFIL` `cenital`, `oblicua` y `maqueta` (`fijo`, `pitchCerca`, `yaw45`) y `Camara._aereo`, `persecucion`, `pantalla`, evento `zoomTope`;</li><li>`VISTAS` aéreas `tipo:'gl'` con `respaldo` 2D; `Vistas.gl3d()`, `efectiva()` y `aPantalla(E, x, y, z)`;</li><li>radio y niebla por cámara y rayos X del jugador en `VistaGL`;</li><li>`ui.abrirMapa(vistas, M, puntos, yo)`;</li><li>`js/32-objetos.js`: `MC.Objetos` (`poner`, `sembrar`, `actualizar`, `malla`, `dibujar2D`) y evento `golpe`.</li></ul>2.11: `MC.DensidadLienzo`, capa de suelo de `Vista2D` y `Estilo._imprimirGPU/_imprimirCPU` medidos. |
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
