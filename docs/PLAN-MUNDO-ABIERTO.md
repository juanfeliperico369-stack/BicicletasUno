# Plan del Mundo Abierto del Valle · el motor definitivo de Medellín y el Valle de Aburrá

**Para una IA de Claude nueva que recibe los 3 repositorios · 19‑nov‑2026 · lo escribió Claude, la IA de Juega EnCicla, a pedido del autor (OneZero).**

> **Tu misión.** Crea el **motor de mundo abierto único** de Medellín y el Valle de Aburrá: el **Motor del Valle 2.0**.
> - Los tres juegos comparten **el mismo mundo**, con las mismas condiciones y posibilidades.
> - Cada juego conserva lo suyo: sus formas de juego, sus apartados, su arte y su trama.
> - Cuando termines, cada IA de juego (EnCicla, El Metro y Run Scooter) adapta, dibuja y mejora su juego sobre ese mundo (sección 6).

## 1. Los tres juegos
| | Juega EnCicla | El Metro | Run Scooter |
|---|---|---|---|
| **Qué es** | Arcade de acción con los oficios reales de EnCicla, la bici pública | Juego contemplativo del Metro de Medellín y guía para turistas | Corredor sin fin (*endless runner*) por la ciclovía |
| **Repositorio** | `juanfeliperico369-stack/BicicletasUno` | `juanfeliperico369-stack/MetroZero` | `juanfeliperico369-stack/RunRunZero` |
| **Rama más nueva** | `ccr-bed2d98a-uho2kr` (v2.0.1). `main` va atrás. **Ignora** `revolucion-v2`: es vieja, de la v1.3.1. | `ccr-2a67f935-oat714` (v1.4.0, la de su IA) y `motor-valle` (v1.4.0 + motor 1.2.0) | `main` y su rama de trabajo |
| **Jugar** | https://juanfeliperico369-stack.github.io/BicicletasUno/ | https://juanfeliperico369-stack.github.io/MetroZero/ (también en `/BicicletasUno/metro/`) | https://juanfeliperico369-stack.github.io/RunRunZero/ |
| **Código** | `src/js/NN-*.js` → `node tools/build.js` → `dist/juega-encicla.html` | `src/js/NN-*.js` → `node tools/build.mjs` → `dist/index.html` | `src/game.js` y otros → un HTML de unos 474 KB |
| **Dibujo** | Canvas 2D | Canvas 2D + WebGL (`22-gl.js`, `G3`) | Canvas 2D (sin librerías) |
| **Pruebas** | `node tests/run.js` (96 comprobaciones) | `node tools/test.mjs 100` (0 errores) | las suyas |
| **Guardado** | `juegaencicla.v1` | `elmetro.v1` | el suyo |
| **Leer primero** | `docs/BITACORA.md`, `GUIA.md`, `INTEGRAR.md`, `PLAN-UNICO-IA.md`, `ENTREGA-PLAN-UNICO-ENCICLA.md` | `CLAUDE.md` (protocolo de 7 pasos), `docs/BITACORA.md`, `docs/PLAN.md`, `arte/06-guia-unica-ia.md` | su README |

**El motor que hoy comparten EnCicla y El Metro:** `motor-valle/`, el **Motor del Valle 1.2.0**.
- **Contrato:** `motor-valle/MOTOR.md`.
- **Fuente de verdad:** BicicletasUno. La copia de MetroZero está en su rama `motor-valle`.
- **Comandos:** `node motor-valle/motor.mjs fuentes | encicla | elmetro RUTA | version` y `node motor-valle/sincronizar.mjs RUTA [--verificar]`.
- **Lo que comparten hoy** es solo la tubería de datos: la cuadrícula base, el relieve, los barrios, la red de transporte y el Metroplús. Cada juego construye y dibuja la ciudad a su manera. Por eso, al jugar, no se siente el mismo mapa.

## 2. La visión del autor (literal en lo esencial)
- **Un solo mundo abierto** para los tres, con las mismas condiciones, jugabilidades y posibilidades. Debe guardar **lo mejor de cada versión**:
  - la ciudad construida por zonas y barrios;
  - los edificios;
  - los lugares emblemáticos.
- **Todas las dimensiones de vista, en el motor:**
  - 2D, 3D y pixel;
  - primera y tercera persona;
  - cenital;
  - movimiento variado;
  - la panorámica 2D híbrida con el pixel;
  - los ángulos de cámara.
- **Cuidado especial con la panorámica 2D con pixel (de perfil).** Se quedan, se juntan y se mejoran las dos:
  - la de **El Metro**: el tren por el viaducto de noche con la ciudad encendida, y el Metrocable con su viento y su balanceo;
  - la de **EnCicla**: la bici que recorre la ciudad de perfil, estilo plataformas.

  En EnCicla debe volver a estar a la vista.
- **Un solo tipo de personaje jugable**, el mismo para todos. Cada juego lo viste a su estilo.
- **Lo único distinto en cada juego:** sus formas de juego, apartados y artes únicos, y su trama. EnCicla y El Metro van por aparte.
- **Run en la ciclovía.** Si vas por una **ciclovía o ciclorruta** y tocas **«Run»**, todo cambia al estilo Run Scooter (copiado y adaptado casi idéntico, con el arte de EnCicla o de El Metro).
  - Sigues la ciclorruta real como *endless runner*: tomas sus esquinas reales y saltas obstáculos.
  - Puedes parar, caminar, correr o cambiar de vehículo, y sigues cumpliendo metas y retos.
  - Al salir, vuelves al mundo abierto en el mismo punto, a la misma hora y con el mismo clima.
  - Solo se puede en la ciclovía, porque así el cambio es verosímil.

## 3. Reglas que no se negocian
- **Un solo HTML por juego, sin internet ni librerías externas.** Run Scooter ya es Canvas 2D: se puede copiar.
- **Español de Colombia, para todo público, sin datos personales.**
- **Fluido en un celular medio:**
  - EnCicla mide con la CPU 4× más lenta y debe dar una mediana menor a 40 ms (hoy da 16,7 ms);
  - usa niveles de detalle y calidad automática;
  - el HTML puede crecer, pero hay que medirlo.
- **No romper ningún guardado:** los campos nuevos llevan un valor por defecto.
- **Atribución siempre:** © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; capas oficiales de Medellín (Catastro, malla vial, barrios); relieve SRTM/NASA.
- **El motor solo se cambia en `motor-valle/` de BicicletasUno.** Cada cambio sube la versión en `VERSION.json` y se copia a los otros repositorios con `sincronizar.mjs` (comprueba con `--verificar`).
- **Pruebas de cada juego en verde y su bitácora al día.** En El Metro hay que seguir su `CLAUDE.md`.
- **Git:**
  - Trabaja en la rama que te dé tu sesión y no hagas PR si no te lo piden.
  - No subas llaves (*keystores*).
  - Al publicar EnCicla en `gh-pages`, **conserva `/metro/`**.
  - El APK de EnCicla debe usar un `versionCode` mayor que 20003.

## 4. Lo mejor de cada uno: qué hay y dónde está
| Pieza | Juega EnCicla | El Metro |
|---|---|---|
| **Cuadrícula** | 10 m (1 m = 1,6 px; 16 px por casilla); `src/data/valle.json/.bin` | 20 m, en metros; `src/data/valle.js` |
| **Calles con nombre y nomenclatura** | `vias.bin`, `85-direcciones.js` (direcciones paisas) | `vias.js`, `rutas_calles.js` (rutas de buses) |
| **Edificios** | Casas en fila por lotes, extruidas (`75-graficos.js`); 1.203 sitios reales y 5.314 huellas (`sitios.*`) | **Todas** las huellas (`edificios.js`), con su ciudad oficial (`ciudad.js`) |
| **Emblemáticos** | Modelados tal cual: Coltejer, Alpujarra, Biblioteca España, 150+ iglesias… (`75-lugares3d.js`); `19-lugares.js` | `hitos.js`, `lugares.js` |
| **Alturas** | Puentes, viaducto, estaciones en alto y túneles con nivel (`76-altura.js`, `alturas.json`); GPS de dos niveles | `puentes.js`, deprimidos `z = -1` (`11-puentes.js`) |
| **Transporte** | Metro A/B, tranvía, cables y Metroplús con andenes reales; dibujado con `SisSpr` (`74-sistema.js`), que es el diseño de El Metro | Su red completa (`red.js`), cabina, horarios reales y Metrocable |
| **Vistas** | Pixel clásico, ciudad 3D con cámara libre (pellizco, giro, inclinación y zoom: `88-camara.js`), panorámica 2D, mapa grande y maqueta 2:1 (`86-maqueta.js`) | Cabina (primera persona), Ciudad Libre, vista 3D en WebGL (`G3`), vista Cine, maqueta isométrica 2:1 y Metrocable |
| **Personaje y vehículos** | Creador de ciclista. Registro `JE.vehiculos` (`25-vehiculos.js`): bici, a pie, camión y 7 de Gemini (`92-vehiculos.js`) | `Spr.veh` (`21-sprites.js`); 6 vehículos nuevos en su entrega |
| **Carreras sin fin** | Run EnCicla 3D (`91-runner.js`) y Carrera de la ciclorruta de 3 carriles (`92-ciclovia.js`), en el menú con `JE.modos` (`91-modos.js`) | «🛴 Run Scooter» (`34-carrera.js`, en su entrega sin integrar) |
| **Arte procedural** | TallerValle (`91-taller-arte.js`): ladera, quebradas, mobiliario, vehículos en 4 vistas y escenas | `arte/` y sus skills |
| **Trama y huevos** | `contenido/guion/*.json`: Un día del valle, `metro.json` (Rosalba, su nieta, don Efraín), `misiones.json`, `fragmentos.json` (el boleto de Rosalba) y `trama_valle.json` (Ruedas y Rieles, 15 personajes) | `37-trama.js`, `39-gente.js` (6 personajes de EnCicla en su entrega), `70-historia.js` |

**Pendientes que heredas:**
- La entrega de El Metro (`ENTREGA-EL-METRO.md`) **no está integrada** en su repositorio.
- Su motor «1.1.0» quedó reemplazado por la 1.2.0, pero sus capas `vias_datos.mjs`, `rutas_calles.mjs` e `hitos.js` no llegaron completas.
- El Metro aún no incluye `motor-valle/js/valle.js` en su compilación. EnCicla sí lo incluye, como `Valle` y `MotorValle`.
- La propuesta de niveles `motor-valle/geo/pasos.py` + `js/red-niveles.mjs` (con su prueba en `tests/prueba-niveles.mjs`) no está conectada al GPS.

## 5. La misión: el Motor del Valle 2.0, mundo abierto
Trabaja por fases. Cada fase deja **los dos juegos andando** y sus pruebas en verde.

1. **F1 · El mundo construido, en un solo archivo de datos.**
   - Lo genera el motor, a **10 m**. El Metro lo lee en metros.
   - Trae: zonas, barrios, manzanas y lotes; edificios con huella y altura; emblemáticos modelados; mobiliario y vegetación por zona; calles con nombre; ciclorrutas; los niveles (puentes, viaducto y túneles, con un nivel firmado por casilla); y el transporte (líneas, estaciones, andenes y rutas de buses).
   - Se junta lo mejor de cada juego:
     - las huellas de El Metro con los lotes y los modelos de EnCicla;
     - sus hitos con nuestros lugares;
     - su `ciudad.js` con nuestras capas oficiales.
   - Formato: el binario v4 y su meta, con el cargador `motor-valle/js/mundo.js`, que crece a partir de `valle.js`.
2. **F2 · Un personaje y unos vehículos únicos**, en `motor-valle/js/`:
   - `personaje.js`: el cuerpo, caminar y correr, montar, y los datos del creador (piel, ropa y casco);
   - `vehiculos.js`: el registro `JE.vehiculos` llevado al motor, con las cifras de Gemini y los vehículos de El Metro;
   - `camara.js`: zoom, giro, inclinación y cámara libre, juntando lo de EnCicla y `VC.camaraLibre` de El Metro;
   - la física y los controles.
   - Cada juego solo pone su **piel**.
3. **F3 · Las vistas dentro del motor**, en `motor-valle/js/vistas/`:
   - cenital pixel, 2D, ciudad 3D, panorámica híbrida, maqueta 2:1, primera y tercera persona;
   - con los ángulos de cámara y la calidad automática;
   - **Canvas 2D como base**, que anda en todo, y **WebGL como mejora**, a partir de `G3` de El Metro, con su respaldo;
   - cada vista recibe el arte de cada juego por funciones de dibujo (*hooks*).
   - **La panorámica 2D con pixel lleva cuidado especial:** la pidió el autor.
     - **La base de El Metro** es `src/js/23-lado.js`, una vista lateral en capas, «estilo odisea»:
       - el recorrido de perfil sobre el relieve real;
       - montañas en capas con perspectiva atmosférica;
       - el cielo por hora, el sol y la luna, nubes, gallinazos, lluvia, niebla y relámpagos;
       - las luces de los barrios, que se encienden de noche;
       - el tren en el viaducto y sus estaciones;
       - el Metrocable, con sus torres y su cable, y las cabinas que se balancean con el viento.
     - **La base de EnCicla** es `renderPano`, en `src/js/75-graficos.js`: la vista panorámica de plataformas.
       - La bici sigue la ruta sola: → pedalea, ← frena y ↑ salta.
       - El suelo sigue el relieve real, con estaciones y obstáculos.
       - Se activa en Más → Vista del mapa → Panorámica, con la tecla V o desde la pausa.
     - **El motor la ofrece a todos los vehículos y al personaje:** la bici, a pie, el scooter y los demás; en El Metro, también el tren, el tranvía y el cable. Debe verse bien con el celular vertical y acostado.
     - **Las mejoras:**
       - la fila de edificios del frente sale del mundo real a lo largo de la ruta: su huella, su altura, el color de su zona y las ventanas encendidas de noche;
       - los emblemáticos aparecen con su silueta al pasar;
       - capas con paralaje: la cordillera, las laderas con sus barrios, la ciudad media y la calle;
       - las subidas y bajadas reales;
       - los puentes, el viaducto y los túneles a su altura;
       - tráfico y gente de perfil;
       - un paso suave entre la vista cenital y la panorámica, en el mismo punto.
4. **F4 · Run en la ciclovía**, en `motor-valle/js/run.js`:
   - **Copia casi idéntico el motor de dibujo de RunRunZero.**
   - El trazado es la ciclorruta real desde donde vas. Las esquinas son sus curvas reales, y en los cruces se sigue por la que continúe.
   - El botón «Run» solo sale sobre la ciclovía (casilla `CICLO`).
   - Puedes parar, caminar, correr y cambiar de vehículo.
   - Sales en el mismo punto, a la misma hora y con el mismo clima.
   - Las metas siguen activas, y la piel es la de cada juego.
   - **Esta fase se puede adelantar:** no depende de F3.
5. **F5 · Las mismas reglas del mundo en los juegos:**
   - el tráfico y los semáforos;
   - metro, tranvía y cables con su horario real;
   - el clima, el día y la noche;
   - puntos de enganche para los huevos de pascua de cada juego.

**Cómo se entrega:**
- **En BicicletasUno:** `motor-valle` 2.0.0, con el contrato `MOTOR.md` 2.0, sus pruebas propias y una guía de migración para cada juego.
- **En los otros dos repositorios:** la copia con `sincronizar.mjs`.
- **Puentes de compatibilidad:** cada juego arranca sobre el motor nuevo sin perder sus modos.
- **Las pruebas:** las de los dos juegos, más una del motor, en `node motor-valle/prueba.mjs`.

## 6. Después: el plan de cada IA
- **IA de EnCicla (Claude):**
  - Pasar el juego al mundo 2.0 y conservar los oficios, la campaña, el modo libre, el Taller, las dos carreras y las tramas.
  - Dibujar con su arte: TallerValle y el verde EnCicla.
  - Poner Run en la ciclovía con la piel de EnCicla, que reemplaza o une sus dos carreras.
  - Recuperar y mejorar su **panorámica de perfil**.
  - Probar en un celular real y publicar la versión 3.0.
- **IA de El Metro:**
  - Integrar su entrega pendiente: Run Scooter, 6 vehículos, los personajes de EnCicla y el capítulo 6.
  - Usar el motor 2.0 en lugar de su 1.1.0 y pasar al mundo 2.0.
  - Conservar la cabina, la maqueta, el Metrocable, su **vista lateral** (`23-lado.js`) y su trama contemplativa.
  - Dibujar con su arte y seguir su `CLAUDE.md`.
- **IA de Run Scooter:** sigue siendo su propio juego y no depende del motor. Solo toma referencias, ideas y **huevos de pascua**:
  - Rosalba y el primer tren, su nieta y don Efraín;
  - Cata y el boleto de Rosalba;
  - las estaciones EnCicla y la canasta verde;
  - la aguja del Coltejer y el Orquideorama;
  - los tres timbrazos bajo una estación del Metro;
  - el tinto sin regar («Ni una gota»).

  A cambio, sus páginas perdidas de EMSAY pueden esconderse en los otros dos juegos. Opcional: un nivel «Valle» con una ciclorruta real exportada por el motor.

## 7. Para empezar (lista de la IA nueva)
1. Conecta los 3 repositorios y lee la sección 1, «Leer primero». En El Metro, sigue su protocolo.
2. Compila y corre las pruebas de cada juego, y **juega los tres**: vista 3D, pixel y panorámica en EnCicla; cabina, 3D y maqueta en El Metro; y Run Scooter.
3. Escribe la propuesta del formato del mundo 2.0 (F1) y valídala con el autor. Luego avanza fase por fase: publica, verifica en vivo y anota en las bitácoras.
4. Cada vez que el motor cambie, `node motor-valle/sincronizar.mjs ../MetroZero --verificar` debe dar «los archivos son iguales».

## 8. Cómo se construyó la ciudad desde cero (la receta para hacer lo mismo con otras ciudades)
La ciudad no se dibujó a mano. Se **construyó con datos abiertos** y se **vistió con reglas** que salieron de mirarla desde arriba: video de dron, satélite y fotos de lugares. Así se hizo, en orden.

1. **La ventana y las coordenadas.**
   - Un rectángulo que cubre el área metropolitana, de Caldas a Barbosa: longitud −75,70 a −75,31 y latitud 6,46 a 6,015.
   - Casillas de 10 m (EnCicla) y de 20 m (El Metro), con el mismo origen.
   - La casilla de un punto es `x = (lon − lon0)·kx` e `y = (latN − lat)·ky`, con `kx = 111320·cos(6,2375°)/casilla` y `ky = 110574/casilla`.
2. **Las fuentes, todas abiertas:**
   - **OpenStreetMap vía Overture Maps**, con consultas DuckDB sobre sus archivos Parquet. Trae:
     - calles con su clase y su nombre, ciclorrutas, ríos y quebradas;
     - parques, usos del suelo y lugares;
     - **693.553 huellas de edificios**, con nombre, clase y pisos.

     Overture suma huellas de Microsoft y Google, **detectadas con IA sobre imágenes satelitales**: así llegó «el satélite» a cada casa del valle.
   - **Capas oficiales de Medellín:** Catastro (manzanas y lotes), la malla vial y los barrios (GeoMedellín), comunas y corregimientos.
   - **Relieve SRTM:** el radar de la NASA, vía AWS Terrain Tiles.
   - **Transporte:**
     - las líneas y estaciones de El Metro (de `red.js` a `motor-valle/geo/lineas.json`);
     - el Metroplús y sus andenes reales, desde OSM;
     - las 133 estaciones EnCicla, en su punto real.
   - **Puentes, viaducto y túneles:** los campos `is_bridge`, `is_tunnel` y `level` de Overture y OSM.
3. **Descargar.** `node motor-valle/motor.mjs fuentes` corre `geo/fetch.py` y `geo/oficial.py`. Son unos 190 MB en `motor-valle/geo/cache/`, fuera de git.
4. **Pasar a casillas** (`geo/build.py`).
   - Cada casilla recibe un tipo (`TT`): pasto, monte, edificio, calle, avenida, autopista, andén, ciclorruta, agua, canal, plaza, puente, estación, escaleras…
   - Lo que va encima se decide por prioridad (el agua y las vías van sobre los lotes). El ancho de cada vía depende de su clase.
   - Por celdas de 8 casillas se guardan el municipio, la comuna, el barrio, los **pisos del edificio más alto** y el **tamaño de los lotes**.
   - Las calles con nombre van aparte, como vectores (`vias.bin`).
5. **Sitios y emblemáticos** (`geo/sitios.py`).
   - 1.203 sitios y 5.314 edificios con su forma real (también con patio) y su altura.
   - Campus, 1.346 canchas, pistas y 882 piscinas.
   - Cada lugar con postal se busca por el nombre de su edificio real y se pone encima. El Coltejer, por ejemplo, estaba a unos 180 m de su sitio.
6. **Alturas** (`geo/alturas.py`).
   - El viaducto y sus estaciones en alto, 1.435 puentes, y los túneles y deprimidos, cada uno con su nivel.
   - En el juego dan el arriba y el abajo de la física, del tráfico y del GPS de dos niveles.
7. **Mirar la ciudad desde arriba** (todo está en `docs/MEDELLIN-DESDE-EL-AIRE.md` de EnCicla).
   - Se usaron:
     - fotogramas de **12 videos de dron**: el valle, El Poblado, el centro, la Comuna 13 y Bello;
     - **mosaicos satelitales de 0,6 m por píxel** (600 × 600 m) de los campus, La Alpujarra, el centro, Santo Domingo y El Poblado;
     - lecturas sobre el ladrillo y las laderas.
   - **Las imágenes solo se miraron; no se copiaron.** De ellas salieron **reglas**:
     - ladrillo naranja casi en todo;
     - en las laderas, plancha gris y tanques negros;
     - teja de barro en lo plano;
     - torres de ladrillo entre árboles en El Poblado;
     - el centro, gris y denso;
     - los campus, islas verdes;
     - el helipuerto de La Alpujarra.
8. **Construir el dibujo (procedural).**
   - **En EnCicla:**
     - **Casas:** en fila a lo largo de las calles, orientadas con ellas y levantadas por lote según sus pisos. Los colores y los techos van por zona, con las reglas del paso 7, y las ventanas se encienden de noche.
     - **Sitios reales:** en 3D, con su huella y su altura. Techos a cuatro aguas con cumbrera, a dos aguas en las iglesias y helipuertos.
     - **Emblemáticos modelados** (`75-lugares3d.js`): el Coltejer, La Alpujarra, la Biblioteca España, el Teatro Metropolitano, el Museo de Antioquia y 153 iglesias mirando a su parque. Son prismas con base elevada y muros que se pueden inclinar.
     - **Suelo suave:** andenes y sardineles en vectores, agua y quebradas curvas, separadores y árboles por zona.
     - **El sistema Metro:** con los diseños de El Metro (`SisSpr`).
   - **En El Metro** (sus herramientas están en `tools/`):
     - `ciudad_descarga.py` y `ciudad_datos.py`: la ciudad oficial;
     - `edificios_datos.py`: todas las huellas;
     - `vias_datos.mjs`, `puentes_datos.py`, `rieles_datos.mjs` y `hitos_datos.py`;
     - `metroplus_osm.py` y `metroplus_andenes.py`: el Metroplús;
     - `rutas.mjs` y `rutas_calles.mjs`: los buses sobre la malla vial;
     - `mapa_ajustes.mjs` y `encicla_datos.mjs`: nombres de calles y barrios tomados de EnCicla;
     - el 3D en WebGL (`22-gl.js`) y la **maqueta dimétrica 2:1**. Para la maqueta se arman mosaicos base de las zonas principales con la geometría real; **Gemini los repinta sin mover nada** (encargo G‑100) y el resto queda procedural;
     - para comparar: la skill `medellin-fiel` y las fotos de `arte/galeria.md`.
9. **La topografía.**
   - El relieve SRTM queda en una cuadrícula de 80 m (en metros) que se interpola. De él salen:
     - el sombreado del relieve;
     - la **pendiente real**, que frena en subida y empuja en bajada (las eléctricas no sufren);
     - el perfil de la panorámica y las montañas en capas;
     - las laderas, con más casas de plancha y escaleras;
     - las quebradas que bajan entre los barrios.
   - El **río** se corrige para que su cauce nunca suba (regresión isotónica): los tramos que subían pasaron de 19 a 1.
10. **Medir y corregir.**
    - EnCicla usa `tools/auditoria-mapa.js`. El Metro usa `tools/auditoria-mapa.mjs` y `osm_comparar.py`.
    - Comparan el juego con OSM: calles, estaciones, río, metro, escaleras, nombres y barrios.
    - Los resultados quedan en `docs/AUDITORIA-MAPA.md` y en `docs/auditorias/`.

**Para hacer lo mismo con otra ciudad:**
1. Define su ventana (longitud y latitud) y el tamaño de casilla.
2. Junta las fuentes. Overture (OSM más las huellas satelitales) y SRTM cubren todo el mundo. Agrega sus capas oficiales (catastro, malla vial, barrios) y su transporte (GTFS u OSM).
3. Corre la tubería con la ventana nueva: fuentes, casillas, sitios y alturas.
4. Mírala desde arriba: dron, satélite y fotos de barrios y emblemáticos. Escribe sus **reglas de estilo** (materiales, techos, colores, densidad y vegetación por zona) y elige y modela sus 20 a 30 emblemáticos.
5. Audítala contra OSM y corrige.
6. En el motor 2.0, guarda las reglas de estilo de cada ciudad en un archivo de datos (`motor-valle/ciudades/<nombre>.json`). Si hay ortofotos o imágenes Sentinel‑2, saca de ahí el color de los techos y la vegetación por zona, en vez de hacerlo a ojo. Las imágenes son solo de referencia: nunca se copian al juego.

