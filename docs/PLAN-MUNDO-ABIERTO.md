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
  - Probar en un celular real y publicar la versión 3.0.
- **IA de El Metro:**
  - Integrar su entrega pendiente: Run Scooter, 6 vehículos, los personajes de EnCicla y el capítulo 6.
  - Usar el motor 2.0 en lugar de su 1.1.0 y pasar al mundo 2.0.
  - Conservar la cabina, la maqueta, el Metrocable y su trama contemplativa.
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
