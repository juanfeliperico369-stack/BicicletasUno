# GUÍA DEL PROYECTO · Juega EnCicla

> Documento de traspaso: con esto otra persona o IA puede continuar el proyecto sin perder contexto.
> Mantener actualizado junto con `docs/BITACORA.md` en cada cambio.

## 1. Qué es

Videojuego arcade **offline** (HTML único, sin librerías) sobre el trabajo diario de **EnCicla**, el sistema
de bicicletas públicas gratuito del Área Metropolitana del Valle de Aburrá (Medellín). Es una demo propuesta
por Juan Felipe Rico a EnCicla. Su objetivo es generar conciencia y diversión, y atraer donaciones para el sistema.
Público: todas las edades (niños y abuelos), por eso todo es intuitivo y la dificultad sube por niveles.

- **Nombre:** Juega EnCicla (repo `juanfeliperico369-stack/BicicletasUno`).
- **Colores de marca:** verde claro `#9bd341`, azul oscuro `#0a2342`, blanco. Acentos: ámbar `#ffc93c` (tiempo y estrellas),
  coral `#ff6b5a` (errores), cielo `#56c7ff` (información), crema `#f4efd8` (papel de revista).
- **Estilo:** "revista pixel". Es una evolución de la revista EMSAY (PDF "Evolución musical": titulares condensados,
  cajas con borde grueso, letras espaciadas, franjas, garabatos, etiquetas "PAG · SESIÓN") y del juego Doc Element
  (HTML de referencia del usuario). Tipografías embebidas de ese HTML: **TeX Gyre Heros Condensed Bold** ("Titulos", licencia GUST)
  e **Inter** ("Cuerpo", licencia OFL). Pixel art 100 % generado por código.

## 2. Estructura

```
src/index.html        plantilla (marcadores <!--HEAD--> /*FONTS*/ /*CSS*/ /*JS*/)
src/style.css         estilos de revista (tokens en :root)
src/assets/           fuentes woff/woff2 (se incrustan en base64)
src/js/00-core.js     utilidades, RNG con semilla, Save (localStorage + exportar/importar), Snd (WebAudio 8 bits), Input, View
src/js/10-art.js      arte pixel: personas, bicis (cenital, lateral, frontal), camión, carros, panorámica, íconos 16x16, portada
src/js/19-lugares.js  estaciones (lat/lon), lugares con postal, zonas del Apoyo, puntos de la operación y Metrocable
src/js/20-map.js      mapa REAL del valle (carga valle.bin, relieve, carriles, semáforos, metro, rutas en ventana, dibujo con relieve), metro, ruta (Dial), dibujo por bloques
src/js/30-ride.js     StationSim (demanda de préstamos) + Ride (bici/camión, tráfico, metro, GPS, minimapa) + drawOverview
src/js/35-life.js     vida urbana: Tranvía de Ayacucho (calle sin carros), Metrocable K/P/J/H, peatones, luces de noche
src/js/40-mg.js       minijuegos: MGAnfitrion, MGMecanico, MGBodega, MGApertura(cierre), MGCables, MGSimon, MGInspeccion
src/js/45-mg2.js      minijuegos v0.4 inspirados en Infinity Games y Railways: MGLoop (Circuito), MGLaser (Señal), MGTraffix (Semaforero),
                      MGRutas (Desvíos de Bodega T3 y «Maquinista» secreto) y MGLaberinto (Moravia secreto)
src/js/50-modes.js    ROLES (9 oficios), PERKS, NOVEDADES, Mode/MapMode/ModeSub y las 9 clases de modo
src/js/55-carrera.js  Carrera de postales (multijugador): contra un bot (3 niveles) o en red
src/js/21-map-art.js  dibujos pixel de los lugares con postal
src/js/46-mg3.js      minijuegos de la operación real: Conteo, Tulas, Bodega en 4 pasos, Ensamble, Llamadas
src/js/52-oficios.js  turnos reales por fases (ShiftMode) y los 9 oficios reales (reemplazan a los de 50-modes.js en MODE_CLASS)
src/js/57-equipo.js   Turno en equipo (cooperativo en red): ModeCoopMon (anfitrión, Monitoreo) y ModeCoopDriver (invitados, camión)
src/js/66-historia.js historia (un capítulo por turno real, 19) (CAST, HISTORIA), retratos pixel y logros cronista/estreno/equipo
src/js/65-extra.js    logros (16), introducción «¿Qué es EnCicla?», «Apoya la bici pública», tarjeta de resultado 1080x1350
src/js/70-net.js      Net: salas WebRTC de hasta 4 jugadores en estrella (el anfitrión reenvía), sin servidor
src/js/72-qr.js       QR: generador propio (v1–40, idéntico a la referencia Nayuki) + escáner con BarcodeDetector y cámara
landing/              página oficial (pagina.html), privacidad.html, capturas y arte; build.js la copia a dist/web
tools/store.js        capturas 1080x1920 y gráfico 1024x500 para Play Store (dist/store/) y la página oficial
docs/PLAY_STORE.md    ficha de Play Store, clasificación, seguridad de datos y pasos de firma (keystore.properties fuera de git)
src/js/60-ui.js       UI (portada, escalafón, briefing, resultados, álbum, partidas, ajustes), Game (bucle), Progress
src/js/90-bot.js      bot de pruebas (JE.bot.run): juega partidas y valida invariantes
src/js/95-promo.js    íconos de la app e imagen OG 1200x630
src/js/67-personaje.js creador de personaje, rankings, personajes y tipos de control
src/js/68-ciudad.js   motos, camiones, ciclistas de las ciclorrutas, caminar en el modo libre y MGDescarga (bajar bicis con equilibrio)
src/js/69-calendario.js fecha real: festivos, horarios por día, ciclovía y festividades (decoración, colores, música, regalos)
src/js/69-libre.js    modo libre con vida propia: perfil, misiones del día, MGRutina, carrera de ciclovía, energía, fotos y regla de colores
src/js/71-tutor.js    tutorial opcional con un compañero del oficio
src/js/72-oficios2.js Pausas Activas, Rescate y los minijuegos nuevos del técnico
src/js/73-musica.js   música por estilos (jazz, lo-fi, soft rock, electrónica)
src/js/75-graficos.js gráficos pixel, híbrido y 2D; vista panorámica de plataformas
src/js/76-red-libre.js mundo libre en red y competencias personalizadas
src/js/77-piloto.js   daltonismo, retos con QR, escenas de la historia y Bluetooth
src/js/78-ciudad-viva.js NPC con rutas por toda la ciudad y mapa grande interactivo con destino
src/js/79-interfaz.js avisos al frente y breves; carga del mapa grande por partes
src/js/80-limpieza.js brigada de limpieza, accesos rápidos del inicio, creador al empezar y horario del sábado
src/js/81-controles.js panel de controles: tipo, lado, tamaño e inclinar el celular
src/js/99-boot.js     arranque (carga el mapa de forma asíncrona) y registro del service worker
src/data/             valle.bin + valle.json (mapa real; se regeneran con tools/geo/build.py)
tools/geo/            fetch.py (datos abiertos) y build.py (cuadrícula del mapa)
tools/build.js        construye dist/juega-encicla.html (archivo único) y dist/web/ (PWA)
tools/assets.js       genera los PNG (íconos, apple-touch-icon, favicon, compartir.png) con Playwright
tests/run.js          pruebas: sintaxis, N partidas con el bot, humo de interfaz, rendimiento con CPU 4x lenta
app/                  proyecto Capacitor (Android); ver sección 8
```

Todos los `.js` se concatenan en orden alfabético dentro de **un solo `<script>`**, así que las constantes de nivel superior se comparten entre archivos.
Objeto global de depuración: `window.JE` (`JE.map`, `JE.game`, `JE.ui`, `JE.bot`, `JE.save`, `JE.errors`).

## 3. Comandos

```bash
node tools/build.js            # construye dist/
node tools/assets.js           # íconos + compartir.png (necesita dist/juega-encicla.html)
node tests/run.js --n=100      # pruebas; --shots guarda capturas en tests/out/
```
Para depurar en el navegador: `?unlock=1` desbloquea todos los oficios. En consola: `JE.bot.run({n:27}).then(r=>console.log(JE.bot.format(r)))`.

## 4. Diseño del juego

**Escalafón (orden pedagógico, de una sola habilidad a combinadas):**

| # | Oficio | Turnos reales (SHIFTS en 52-oficios.js) | Se desbloquea con |
|---|--------|------------------------------------------|-------------------|
| 1 | Usuario | 3 niveles: primer préstamo, dos viajes, día de ciclista | 0 ★ |
| 2 | Anfitrión | T1 Apertura 5:00–13:30 · T3 Cierre 13:30–22:30 | 1 ★ |
| 3 | Mecánico | Equipo de reparación · Equipo de ensamble (8:00–17:00) | 3 ★ |
| 4 | Bodega | Turno intermedio 8:00–17:00 (recibir, verificar, organizar, cargar y llevar al taller) | 5 ★ |
| 5 | Apoyo | T1 apertura de zona + relevos 8–12 · T3 relevos 16–20:30 + cierre de zona | 7 ★ |
| 6 | Técnico | Turno intermedio 8:00–17:00 (tótems, LED, celulares, power banks) | 10 ★ |
| 7 | Balance | Apertura 4:00–13:00 (tulas) · Camión especial de 40 · Cierre (tulas, parqueadero) | 12 ★ |
| 8 | Monitoreo | Sala de control (inventario cada hora) · Atención al cliente | 16 ★ |
| 9 | Supervisor | Apertura 4:00–12:00 · Intermedio 9:00–18:00 · Cierre 14:00–23:00 | 20 ★ |

- Cada turno tiene **3 metas** (la primera obligatoria). Máximo de estrellas = 3 × turnos (`MAX_STARS()`, hoy 57).
  El turno N+1 se abre con ≥1 ★ en el turno N. Hay modo "Libre" (práctica).
- **Roguelite:** al aprobar un turno eliges 1 de 3 mejoras (`PERKS`, máximo 3). Si fallas pierdes todas y la racha vuelve a 0.
- **Novedad del día** (`NOVEDADES` + `NOV_EXTRA`): tráfico, demanda, lluvia, ciclovía, partido, Flores, Alumbrados. El primer turno siempre es "Día normal".

**v0.7 · EnCicla real (lo más importante para continuar):**

*Mapa real del Valle de Aburrá* (`tools/geo/`, `src/data/`, `19-lugares.js`, `20-map.js`, `21-map-art.js`):
- `tools/geo/fetch.py` baja datos abiertos: calles, ciclorrutas, Metro, tranvía, ríos, quebradas, parques y municipios de **Overture Maps**
  (datos de OpenStreetMap, licencia ODbL) con DuckDB, y el relieve de **Terrain Tiles** (AWS Open Data, SRTM). Caché en `tools/geo/cache/` (no se sube).
  Para el bucket público hay que correrlo sin credenciales AWS: `env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY python3 tools/geo/fetch.py`.
- `tools/geo/build.py` hace la cuadrícula: **1 casilla = 20 m**, 2158×2461 casillas (lon −75,70…−75,31, lat 6,46…6,015), fila 0 = norte.
  - Rasteriza vías por clase y ancho (autopista, avenida, calle, ciclorruta al lado de la vía, andén, escaleras), agua con puentes, parques, zonas urbanas,
    potreros y monte; adelgaza las calles (número de Yokoi, 4 subcampos) para que no queden bloques de asfalto; fuera de los 10 municipios todo es montaña.
  - Saca líneas en JSON: carriles de carros (troncales, primarias y secundarias encadenadas), 758 semáforos (cruces de vías principales),
    Metro A y B y Tranvía de Ayacucho siguiendo la vía real, y el río Medellín.
  - Salida: `src/data/valle.bin` (casillas + relieve cada 80 m + municipio y comuna cada 8 casillas, deflate) y `src/data/valle.json`. ~700 KB + 110 KB.
  - `tools/build.js` los incrusta en el HTML (`VALLE_BIN` en base64 y `VALLE_META`). El juego descomprime con `DecompressionStream` o con `inflateRaw` propio (≈0,2 s).
- `19-lugares.js`: **estaciones con lat/lon** (`ESTACIONES`: id, nombre, municipio, lat, lon, tipo m/a, demanda, zona del Apoyo), `LUGARES` (45 postales),
  `APOYO_ZONAS` (Poblado 7, Vegas 5, AMVA 7, Laureles 4, Aeropuerto 2, Carabobo 2, Sabaneta 10, Itagüí 10, Envigado 13, Bello 5),
  `CORREDOR_E` (estaciones del corredor eléctrico), `PUNTOS` (Casa EnCicla en el Parque de Malibú, parqueadero de la Terminal del Norte,
  Puente Pandequeso, Suramericana, Campus Nacional, taller) y `CABLES` (Metrocable con posiciones aproximadas).
  **Las posiciones de las estaciones son aproximadas por barrio: cuando llegue la lista oficial, solo hay que cambiar lat/lon aquí** (`carveStation` las acomoda en 4×2 casillas junto a una vía).
- `20-map.js`: carga (`load()` asíncrono en el arranque), relieve (`elevT`, `elev`, `slope`), `muniAt`/`comunaAt`, semáforos (`lightIdx`), carriles (`lanes`, `lanesNear`, polilíneas con `at`/`project`),
  rutas Dial **en ventana** (`flow(tx,ty,truck,fx,fy)` mira solo el rectángulo destino+origen ±90 casillas; `fv(F,x,y)` lee el campo; `fx=-1` = todo el mapa, solo para pruebas).
- **Dibujo:** las calles se "autoajustan" (asfalto de ~10 m en el centro de la casilla, andenes a los lados); cada bloque de 32×32 casillas se dibuja una vez y se le aplican
  **sombras del relieve** (luz del noroeste) y curvas de nivel en el campo (`relief()`), que es la parte de "dibujo 2D" sobre el pixel. El minimapa va a mitad de resolución (`miniK = 2`).
- **Sin temblor:** la cámara es continua. El búfer pixelado del suelo mide vw+1 × vh+1 y `View.present` lo corre por la fracción de pixel (`subX/subY`).
  Todo lo que se mueve (jugador, carros, trenes, tranvía, cables, partículas, lluvia, noche, luces) se dibuja en `Ride.renderTop` directamente en el canvas de pantalla,
  con posiciones decimales y giro suave. **No volver a dibujar objetos que se mueven en el búfer pixelado.**
- **Pendientes** (como Run Scooter): `Ride.update` mide la pendiente en la dirección de avance (±40 m). Bici: velocidad × clamp(1 − 2,2·pendiente, 0,5, 1,32);
  camión: × clamp(1 − 0,9·pendiente, 0,7, 1,12); bici eléctrica (`ride.ebike`, estaciones de `CORREDOR_E`) no pierde velocidad en subida.
  En bajadas de más de 7 % a más de 112 % de la velocidad máxima hay que soltar el dedo: a los 3,2 s la bici "se desboca" (aturdida 0,5 s). Aviso ▲ SUBIDA / ▼ BAJADA sobre el ciclista.

*Oficios reales* (`52-oficios.js`, minijuegos nuevos en `46-mg3.js`):
- `ShiftMode` juega un turno por **fases**: `{name, from, to, tasks}` (tareas en el mapa con hora límite, opcionales `opt`, en orden `ordered`, con condición `can`)
  o `{mg, secs}` (un minijuego a pantalla completa). Entre fases el reloj salta (sello ⏩). `timed` = la fase dura un tiempo fijo y en ella aparecen avisos (`spawn`, `every`, `maxDyn`).
  El reloj de cada fase se calcula con el recorrido estimado (`calRate`). Red de seguridad: ninguna fase dura más de 240 s reales.
- Anfitrión T1: tula a las 5:00, abre 2–5 automáticas cercanas + la suya (apertura con inventario) antes de las 5:30; ventanilla (MGAnfitrion: saca la bici, la entrega y
  **ajusta el sillín** a la estatura, `seatMove`/`seatOk`). T3: ventanilla, a las 21:00 solo devoluciones hasta las 22:00 (`returnsOnly`), inventario y cierre de su estación, y cierre de 2–5 automáticas antes de las 22:30.
- Apoyo: zona elegida en el briefing (`o.zona`). T1 abre todas las automáticas de la zona antes de las 5:30, relevos (2–5) de 8 a 12 e inventarios de control opcionales (`MGConteo`).
  T3 relevos de 16:00 a 20:30 + inventarios, y cierre de la zona a las 22:00.
- Supervisor: T1 arma tulas (`MGTulas` modo armar: llave del color + celular con batería) en Casa EnCicla a las 4:00, las entrega en carro a las 5:00 y luego atiende avisos
  (relevo, bicis con falla, usuario inconforme, semáforo dañado, celular descargado, visita al anfitrión). T2 avisos + inventarios. T3 avisos, recoge tulas a las 22:30 y carga celulares (`MGTulas` modo cargar).
- Técnico: fallas de tótem (Laser/Simon), LED de anclajes (Loop/Simon) y celular (Cables); los celulares de las estaciones físicas pierden batería (los "medio malos" el doble):
  se lleva un power bank (máx. 3, se recargan en Casa EnCicla). Meta: ningún celular apagado.
- Bodega: `MGBodega2` en 4 pasos (descargar, verificar etiqueta/golpes, organizar en estantes, cargar el pedido exacto) y luego manejar el camión al taller.
- Mecánico: reparación (MGMecanico con diagnóstico) y ensamble (`MGEnsamble`: marco, ruedas, manubrio, cadena, sillín, frenos, luces; las tuercas se aprietan en la zona verde).
- Balance: capacidad 14 (40 en el camión especial). T1 sale del parqueadero de la Terminal del Norte con una de 4 rutas de tulas (supervisor jefe a Suramericana, universidades,
  Puente Pandequeso, Sabaneta/La Estrella) y luego balancea; recoge **bicis dañadas** que van al taller (`sim.shop`). T2 corredor Campus Nacional–Suramericana–Estadio + tanteo del sur.
  T3 balanceo nocturno, recoge tulas, las entrega en Casa EnCicla y guarda el camión en la Terminal del Norte.
- Monitoreo: sala de control (`ModeMonitoreoR`: cada hora aparece la verificación de inventario, hay que encontrar la estación que no cuadra) y atención al cliente
  (`MGLlamadas`: sanciones, errores de préstamo, inscripciones; casos en `CASOS`).
- **Supuestos que hay que confirmar con el usuario:** ubicación de la bodega (`PUNTO_BODEGA`, Guayabal) y del taller (junto a Casa EnCicla), horarios de Monitoreo y de los turnos 2 y 3 de Balance,
  y cuántos relevos/inventarios se exigen. El usuario dijo que luego confirma horarios, la lista oficial de estaciones, más puestos y la historia de los personajes.

*v1.0.2 · Limpieza, accesos rápidos y creador al empezar* (`80-limpieza.js`):
- **Limpieza** (oficio 7, brigada mensual 9 a. m.–5 p. m., SUPUESTO): dos supervisores y el anfitrión limpian el habitáculo de 3 estaciones con anfitrión. `MGLimpieza`: elegir herramienta
  (escoba: polvo y hojas; trapero: manchas del piso; paño: vidrio y mostrador; bolsa: basura) y tocar lo sucio; la brigada limpia también. Metas: los 3 habitáculos, impecables, máximo 2 errores.
- **Accesos rápidos** en el inicio: Mi ciclista, Historia, Personajes, Ranking, Amigos y Retos.
- **Creador al empezar:** si no hay personaje, se abre al entrar al inicio o a una ficha. La app de Android ya no restaura datos viejos al reinstalar (`allowBackup=false`).
  En Mi ciclista: «Empezar con un personaje nuevo» (borra el progreso).

*v1.0 · Piloto: ciudad 3D, calles rectas, mapa interactivo, interfaz limpia* (archivos 75, 77, 78 y 79):
- **Calles rectas** (`CityMap.vectorize`, al cargar): la red de vías y de ciclorrutas se rastrea casilla por casilla, se simplifica a tramos rectos (Ramer-Douglas-Peucker, tolerancia 0,95 casillas)
  y se guarda en `CityMap.chains` con un índice por celdas (`chainsNear`). Las casillas bajo cada tramo pasan a ser vía, para que la física siga la misma línea que se dibuja.
  Antes, `CityMap.bridge` une puntas sueltas de calles (hasta 3 casillas) y de ciclorrutas (hasta 5), y vuelve andén los retazos de ciclorruta de 1 o 2 casillas.
- **Ciudad 3D** (`GFX() === '3d'`, por defecto; Más > Gráficos: Ciudad 3D o Pixel clásico): suelo dibujado con andenes en losas, sardinel, asfalto, bordes y línea de centro
  (amarilla en avenidas, blanca en autopistas), cebras en los semáforos, ciclorrutas verdes, árboles con sombra, sombras de edificios y metro elevado.
  Los edificios (`CityMap.blocks`: rectángulos por manzana de 4×4 casillas y casas de 2×2) se dibujan en cada cuadro con **perspectiva desde el jugador** (`Ride.draw3D`):
  muros con pisos, techos con tanques, aires y helipuertos; más altos en el Centro, El Poblado y los centros municipales (`TALL`). De noche las ventanas se encienden.
  La cámara se acerca más (`View.apply`: divisor 128) y los vehículos se dibujan al 74 % (`SPRK`), para que las calles se sientan anchas.
- **NPC con rutas** (`78-ciudad-viva.js`): ciclistas y peatones eligen un destino (una estación) y avanzan casilla a casilla por toda la red (`npcNext`/`npcMove`):
  ciclistas por ciclorrutas y calles (por la derecha), frenan en rojo, ante el jugador y ante otros; peatones por andenes, plazas y parques, y cruzan la calle.
- **Mapa grande** (`MapView`): se abre tocando el minimapa; se arrastra, se acerca con dos dedos, rueda o botones + y −, ◎ vuelve a tu posición y ✕ lo cierra.
  Muestra municipios, metro con sus estaciones, lugares, estaciones EnCicla, tareas y la ruta. **Tocar el mapa marca un destino** (`ride.way`, como en los juegos de mundo abierto):
  la flecha, la línea punteada y el mapa lo siguen hasta que llegas o lo quitas. De cerca se ve la ciudad real; los bloques se cargan de a dos por cuadro.
- **Controles** (`81-controles.js`, `UI.controles`, botón en la pausa y en Más): joystick fijo (por defecto, también se puede arrastrar en cualquier parte), arrastrar, flechas grandes
  o **inclinar el celular** (`Tilt`: sensor de orientación; la posición al empezar es la neutra, botón Recalibrar). Lado (`settings.cside`) y tamaño (`settings.csize` 0-2);
  si el control va a la izquierda, la lista de tareas se corre (`Ctrl.leftGap`) y los botones de acción no suben (`ctrlR` solo a la derecha). El mapa grande se cierra solo al empezar, salir o terminar un turno (`MapView.reset`, `MapView.live`).
- **Interfaz** (`79-interfaz.js` y el bloque «tema limpio» de `style.css`): letras Fredoka (títulos, con eje de ancho) y Nunito (texto), ambas OFL; tarjetas y botones redondeados,
  sin trama, sin franjas ni etiquetas de revista. Inicio, ficha y portada con poco texto. Los avisos (`#coach`) salen al frente, debajo de las metas y del minimapa,
  y duran de 2 a 3,4 s; los mensajes (`UI.toast`) de 1,5 a 2,8 s; el aviso se oculta mientras hay un mensaje o el mapa grande abierto.
- **Piloto** (`77-piloto.js`): colores para daltonismo (Okabe-Ito, magenta en vez de rojo y etiquetas en los juegos de colores), retos con código y QR (`Reto`: `RC<postales><zona><rival>-<semilla>`
  o `RH<minutos>-<semilla>`, también como enlace `?reto=`), escenas de la historia (`Cine`) al aprobar un turno por primera vez, y **Bluetooth en la app de Android**
  (`BluetoothPlugin.java`, RFCOMM entre celulares emparejados, hasta 3 invitados; en JS cada conexión se comporta como un canal de datos de `Net`).
- Corredores eléctricos: San Cayetano está en los bajos de la estación Estrella del metro; Hospital Infantil en la calle 72A con carrera 48 (aproximados).

*v0.10 · Oficios nuevos, gráficos, vistas, música por estilos y mundo libre en red* (archivos 71 a 76):
- **Tutorial opcional con compañero** (`71-tutor.js`, `Tutor`): en la ficha de cada turno, botón «Con <compañero> (tutorial)». El juego se detiene mientras el compañero habla
  (burbuja con su retrato, «Entendido» o «Saltar tutorial») y en el mapa pedalea a tu lado. Pasos: saludo y oficio, moverse, la ruta, un consejo del oficio (`TUT_EXTRA`),
  la primera tarea (minijuego) y el cierre. Los mentores de la v0.9 se retiraron.
- **Pausas Activas** (`72-oficios2.js`, `ModePausas`, oficio 6, turno intermedio 9 a. m.–6 p. m.): como el Apoyo, recorre 4 estaciones con anfitrión; en cada una,
  `MGPausa` (inspirado en los juegos de baile): tarjetas de ejercicios llegan al círculo al ritmo; se responde deslizando o con las flechas ◀ ▲ ● ▼ ▶ y se mantiene oprimido en «Respira».
  Perfecto/Bien/Fallo, combo, ánimo del grupo y tres compañeros que imitan los movimientos. La música se sincroniza con la coreografía (`Snd.lock`).
- **Rescate** (`ModeRescate`, oficio 8, turno 8 a. m.–5 p. m., SUPUESTO): bicis reportadas fuera de las estaciones; se revisan (`MGHallazgo`) y se llevan
  **pedaleando con una mano y la otra bici en la otra mano**: equilibrio con inercia (curvas bruscas, terreno, bajadas) y ◀ ▶ a los lados para corregir; si pasa la raya, se cae y se daña.
  Las buenas van a la estación más cercana; las dañadas, a una estación con anfitrión para que Balance las lleve al taller.
- **Minijuegos nuevos del técnico:** tótem (`MGTotem`: medir con multímetro, cambiar la pieza y reiniciar en la zona verde), luces de los anclajes (`MGLeds`: prueba, marcar y soldar)
  y celular de la estación (`MGCelular`: power bank, reinicio, PIN de la tula y sincronizar).
- **Corredores eléctricos** (`CORREDOR_E`, `CORREDORES`): Floresta (mixta) – C4TA (solo eléctricas); Universidad de Antioquia (mixta) – Hospital Infantil (solo eléctricas);
  San Cayetano (mixta) – La Estrella (solo eléctricas). Servicio eléctrico hasta las 7 p. m. (`E_HASTA`); las estaciones solo eléctricas cierran a las 8 p. m. (`E_CIERRE`).
  C4TA está en San Javier (antigua cárcel El Buen Pastor); Hospital Infantil y San Cayetano tienen posición APROXIMADA.
- **Día y noche de 24 horas** en el modo libre: el reloj sigue la hora real, cambia de día a medianoche, el tráfico depende de la hora y avisa antes del cierre de EnCicla.
- **Música por estilos** (`73-musica.js`): jazz (walking bass, ride con swing, acordes de 7.ª), lo-fi (crujido de vinilo, teclado suave, filtro), soft rock (rasgueo, bajo en corcheas)
  y electrónica (bombo a negras, bajo filtrado, pad con compresión lateral, arpegios). Automático: lo-fi en menús y paseos de día, jazz de noche, soft rock en los turnos,
  electrónica en carreras, ciclovía, competencias y pausas activas. Se elige en Más > Estilo musical. Siguen el mood y las notas interactivas; las capas de temporada van encima.
- **Gráficos** (`75-graficos.js`, Más > Gráficos): Pixel; Híbrido (mapa dibujado vectorial a mayor resolución con personajes en pixel); Dibujado 2D (también personajes y vehículos dibujados).
  El búfer del mapa usa `View.q` > 1 y los bloques dibujados se guardan en `CityMap.chunks2`. Los sprites se dibujan con `blit()` (respeta `img.sc`). Los lugares emblemáticos siguen en pixel art.
- **Vista panorámica de plataformas** (Más > Vista del mapa, botón en la pausa o tecla V): de lado, con el perfil real de elevación de la vía, ciudad alrededor con paralaje,
  carros y estaciones al pasar. La bici sigue la ruta sola; tú pedaleas (→), frenas (←) y saltas (↑, espacio o botón Saltar) huecos, conos y charcos. El minimapa sigue arriba.
- **Mundo libre en red** (`76-red-libre.js`, `ModeLibreRed`, rol `libre`): en «Jugar con amigos» se elige la conexión (misma red o zona Wi-Fi sin internet, `Net.lan`, o por internet con STUN)
  y el modo: paseo libre, carrera de postales (1, 3 o 5 postales y zona), cazadores de hojas o la lleva (2, 3 o 5 minutos). El que crea la sala es el servidor. Bluetooth no está disponible en web.
- Limpieza: portada sin secciones de revista (misma paleta y estilo), créditos «Creado por OneZero», datos sin fuente retirados de los consejos.
- Prueba nueva **3d** (gráficos, vistas, música, corredores, tutorial y pausa activa) y «La lleva» con 3 dispositivos en la prueba 5.

*v0.9 · El juego sabe qué día es; modo libre con vida propia* (`69-calendario.js`, `69-libre.js`):
- **Fecha real** (`Cal`, `JE.cal`): `Cal.now()` usa el reloj del dispositivo; para probar otra fecha: `?fecha=2026-12-24T19:00` en la URL o `JE.fecha = '...'`.
  Festivos de Colombia calculados (fijos, Ley Emiliani al lunes y Semana Santa con la Pascua), tipo de día (`semana`, `sabado`, `domingo`, `festivo`).
  **Horario según el día** (`Cal.service`: `open` primer préstamo, `lend` desde esa hora ya no se presta, `close` hasta esa hora se reciben bicis): de lunes a viernes se presta de 5:30 a. m. a 8:59 p. m.
  y se recibe hasta las 10 p. m. (dato del equipo). Sábado: se presta de 6:30 a. m. a 6:59 p. m. y se recibe hasta las 8 p. m.; anfitriones T1 6:00 a. m.–1:30 p. m. y T3 1:00–8:30 p. m. (7 h 30 min), supervisores una hora antes y media hora después
  (`80-limpieza.js`: `SAB_H`, `horasDelDia`, y `ModeAnfitrionR.prototype.begin` corre las fases con `SAB_MAP`). Domingos y festivos: de 8 a. m. a 4 p. m., solo estaciones automáticas (los anfitriones descansan; `Cal.soloAuto`, `JE.soloAuto`, `stOk`):
  el Usuario y el modo libre prestan y devuelven solo en automáticas, las manuales se ven cerradas en el mapa y la ficha del anfitrión avisa que se juega con el horario de entre semana.
  **Ciclovía:** domingos y festivos de 7 a. m. a 1 p. m. (`Cal.cicloviaNow`): ese día la novedad del turno pasa a ser Ciclovía sola.
- **Festividades automáticas** (`FIESTAS`): Navidad y Alumbrados (1 dic–7 ene), Velitas (7–8 dic), Semana Santa, Día del Niño, de la Madre y del Padre, Independencia (19–20 jul),
  Feria de las Flores (desde el primer viernes de agosto, 10 días), Independencia de Antioquia (11 ago), Fiesta del Libro (desde el segundo viernes de septiembre),
  Amor y Amistad (tercer sábado de septiembre), Halloween (24–31 oct) y Año Nuevo. Gana la más corta si se cruzan. Cada una trae: franja y colores en portada e inicio (`body.fest-<id>`, `--fest1/2`),
  decoración del mapa (`Ride.drawFest`: pinos y luces, velitas, calabazas, flores, casetas de libros, banderas, corazones, globos), capa musical (`Snd.fest`: jingle o spooky),
  novedad del turno (Alumbrados o Flores), una misión del modo libre y un **regalo de temporada** en Mi ciclista (`FEST_REQ`, solo se reclama durante la fiesta).
- **Tu vida** (creador, pestaña **Tú**, primera al crear el personaje): edad (`edad`; niño o adulto mayor activan ritmo tranquilo, adulto mayor también letra grande),
  municipio donde vives (`casaM` → estación de tu casa), colegio (`colegio`), universidad (`uni`, lista `UNIS` con coordenadas) y trabajo (`trabajo`, lista `TRABAJOS`).
  **Contextura** (`build`) y **estatura** (`tall`) cambian el dibujo de la persona (`Art.person`) y la **talla de la bici** (S/M/L, marco 48/52/56 cm).
- **Regla de colores** (pedido del usuario): el verde claro, el azul oscuro y el blanco son de los **trabajadores de EnCicla** (uniforme: camisa azul oscuro, chaleco verde, casco blanco,
  `Art.me({ uniforme: true })` y `mode.uniform`) y de **las bicis EnCicla** (siempre verdes, `bikeCol()`). En el modo libre (y como usuario) te vistes como quieras,
  y el color elegido de bici es para **tu bici propia** (`JE.ownBike`).
- **Modo libre de Usuario** (`ModeUsuarioR`): empiezas en la estación de tu casa a la hora real; si EnCicla está cerrada sales en tu bici. **Misiones del día** (`genMisiones`, guardadas en `Save.data.dia`):
  según el día de la semana y tu vida: llegar a clase (horario por día), al trabajo, al colegio (con **animación del tiempo pasando**, `MGRutina`), plan de viernes, grupo de estudio o medio turno del sábado,
  **carrera de la ciclovía** contra 3 ciclistas por la avenida cerrada (cuenta regresiva y 3 puntos), km por la ciclovía, saludar con el timbre, misión de la fiesta, foto, banca, mentor y volver a casa.
  Premio: hojas verdes y XP (la mitad si llegas tarde). Logros nuevos: Vida sobre ruedas, Rey de la ciclovía, De fiesta en el valle, Aprendiz de maestros, Fotógrafo del valle.
- **Energía** (⚡ en el HUD): las subidas cansan; con menos de 15 % pedaleas más lento. **Sentarse** en un parque o plaza recupera energía y adelanta el reloj. Gancho general: `mode.speedMul(ride)` en `Ride.update`.
- **Fotos** (botón Foto cerca de un lugar con postal): se guardan en `Save.data.fotos` (fecha y fiesta) y se ven en el Álbum como polaroids.
- **El timbre saluda:** los ciclistas cercanos responden («¡Buenas!») y bajan la velocidad. En la ciclovía la avenida se llena de ciclistas (`kind: 'bici'`); si los rozas, solo frenas.
- Prueba nueva **3c**: festivos 2026, fiestas por fecha, horarios, misiones por perfil y día, rutina con animación, energía, banca, foto, carrera de la ciclovía, colores y creador.

*v0.8 · Ciudad con espacio, gente y música* (`68-ciudad.js` y cambios en 20/30/35/00/60):
- **Escala del mundo ×2:** `TS = 16` px por casilla (antes 8) y `WK = TS / 8` = 2. Toda distancia o velocidad en px que venía del diseño de 8 px se multiplica por `WK`
  (velocidades de bici, camión, carros, trenes, tranvía y peatones; radios de llegada; distancias de órdenes). `Ride.marker` escala solo los radios fijos (≤ 30 px);
  los que se calculan con el tamaño del lugar ya vienen en la escala. Bloques de dibujo de 16×16 casillas (`CH = 16`). Zoom del mapa: `View.apply` divide entre 185 (≈ 12 casillas de ancho en el celular).
- **Dibujo de 16 px por casilla** (`drawTile`): calles con andén y sardinel, asfalto de ~10 m, **esquinas redondeadas**, bordes amarillos en autopistas, puentes con baranda;
  edificios por manzana con tanques de agua, aires y terrazas verdes; casas de ladrillo de las laderas; bosque con copas; ciclorrutas con línea central y bici pintada.
  Los dibujos de los lugares (`21-map-art.js`) siguen siendo de 8 px por casilla y se escalan ×2 al pintarlos. Las estaciones ocupan 64×32 px.
- **Gente y vehículos:** además de carros, taxis y buses hay **motos** (rápidas, ~38 % de los vehículos) y **camiones** en las vías grandes (`Art.carTop` 'moto'/'camion');
  **ciclistas** que recorren las ciclorrutas (`ride.npcB`, si los rozas frenas) y peatones.
- **Caminar (modo libre de Usuario):** botón **Bajarse** deja la bici parqueada (`ride.parked`) y el jugador camina (`veh: 'walk'`, `WSURF`, sprite `Art.walker`);
  **Subirse** vuelve a la bici cuando estás cerca, o **Ir a la bici** marca el camino. A pie no hay multas de semáforo ni choques con peatones.
- **Bajar y organizar bicis con equilibrio** (`MGDescarga`): el carro de balance parquea lejos (15–60 m) porque la estación no lo deja acercarse; se llevan 1 o 2 bicis a la vez
  (2 = el doble de inestable) y con ◀ ▶ se mantiene el equilibrio; si pasa de la raya, se caen. Lo usan las órdenes de **Balance** (cada orden de llevar/recoger)
  y el **Anfitrión** a mitad de turno (T1: llega el carro y hay que bajar bicis a las 9:30; T3: recoger bicis a las 6 p. m.).
- **Pantalla sin encimados** (`Game.layout`): las metas van debajo del HUD y a la izquierda (completas 7 s al empezar y 3,5 s cuando cambian; luego una línea),
  el minimapa a la derecha debajo del HUD, los avisos (`UI.toast`, en cola, 2,2–4,5 s según el largo) debajo de las metas y del minimapa,
  las tareas y la ayuda abajo a la izquierda (recortadas para no llegar a los controles), y el joystick fijo o las flechas abajo a la derecha (los botones de acción suben).
  Los nombres de estaciones y lugares se muestran en cualquier tamaño de pantalla pero solo si caben sin taparse entre sí ni con el HUD (`lblRoom`).
  En los minijuegos, los títulos usan **`V.top`** (debajo del HUD y de las metas): **no volver a poner textos en y fijas (66/70)**.
- **Música interactiva** (`Snd.mood` = energía, tensión, racha, noche, pendiente; `Game.moodOf` la calcula cada cuadro): el tempo va de ~90 a ~130 BPM, entran bombo,
  platillos y melodía con la velocidad, arpegio de fiesta con la racha de ciclorruta, pulso de tensión cuando una tarea está por vencer o la fila crece,
  colchón suave de noche, registro más alto en bajada. **Notas interactivas** en el acorde actual (`Snd.note`): cada hoja verde seguida sube una nota, el timbre suena en el tono
  y cada sello de postal toca un arpegio (`Snd.fanfare`).
- Prueba nueva **3b**: revisa en 5 pantallas que metas, minimapa, avisos, ayuda, botones y flechas no se encimen; caminar; la descarga con equilibrio; y que la música reaccione.

*Tu personaje, rankings, personajes y controles* (`67-personaje.js`):
- Al primer "Jugar", después de la introducción se abre **Crea tu personaje** (`UI.avatar(true)`): piel (7), peinado (9: `PEINADOS`), color de pelo (10), barba, gafas,
  camiseta, estilo (camiseta, manga larga, chaleco EnCicla), pantalón, zapatos, casco, color de bici y timbre (tienda). Perfil: `hair, hairCol, beard, glasses, sleeve, pants, shoes`.
  `Art.me()` arma la persona para los minijuegos; `Art.person` dibuja los peinados nuevos; `Art.rider` agrega la cola de pelo largo en la vista de arriba.
- **Ranking** (`UI.ranking`): rango por experiencia (`RANGOS`, 11 rangos), "El valle" contra rivales ficticios (`RIVALES`), "Mis marcas" (10 mejores partidas) y "Por oficio" (récord por turno).
- **Personajes** (`UI.personajes`): fichas del elenco (`CAST` + `BIOS`). Espacio listo para la trama que va a mandar el usuario.
- **Controles** (Más > Controles, `Save.data.settings.ctrl`): joystick flotante (por defecto), joystick fijo o flechas grandes (para abuelos), los dos abajo a la derecha. `Ctrl` en 67-personaje.js.

**Minijuegos v0.4 (inspirados en las referencias del usuario):**
- Infinity Loop → Circuito (Técnico T2/T3, anclajes).
- Laser → Señal (Técnico, tótem).
- Traffix → Semaforero (aviso "semáforo dañado" del Supervisor).
- Package Inc → Desvíos (Bodega T3, y en los avisos de bodega del Supervisor).
- Railways y Tiny Rails → Maquinista (Easter egg).
- Laberinto → Moravia (Easter egg).

**Easter eggs:**
1. Tres timbrazos seguidos bajo una estación del Metro abren el Maquinista secreto, que anuncia "Próximamente: Juega Metro" (el juego 11).
2. Tres timbrazos en Moravia abren el laberinto.
3. 7 toques al título "EnCicla" de la portada, o el código Konami, activan la bici dorada.
4. Postal secreta en el Cerro de las Tres Cruces (no sale en el álbum hasta encontrarla).

Las pistas están en "¿Sabías que?" y hay 4 logros secretos.
- **Ritmo** (Ajustes): tranquilo (+40 % de tiempo y +35 % de paciencia), normal o arcade.
- **Reto del día:** la semilla es la fecha. **Código de reto** `N-T-SEMILLA36`: multijugador asíncrono sin servidor.

**Escalas del mundo:** 1 casilla = 20 m reales (mapa real). Bici 60 px/s (×1,3 en ciclorruta, ×0,62 en acera, ×0,55 en pasto). Camión 50 px/s, solo por vías.
Cada modo tiene su propia velocidad de reloj (minutos de juego por segundo real), por ejemplo Usuario 1,2 y Monitoreo ~4,5.
El préstamo dura máximo 60 min de juego.

**Simulación de estaciones (`StationSim`):** salidas ~ 0,045 × demanda × perfil(hora, tipo) por estación y minuto.
Los tipos son res, work, uni y mix. En la mañana se va de residencial a trabajo/universidad, y en la tarde al revés.
Las bicis se **conservan** (estaciones + viajes + camiones + bodega + en préstamo): el bot verifica este invariante.
El nivel de servicio es 1 − (minutos de estación vacía o llena / minutos totales).

**Datos reales usados (aproximados, para verosimilitud):** horario L–V 5:30 a.m.–10 p.m., sáb. 6:30 a.m.–9 p.m., dom. 8 a.m.–4 p.m.
Máximo 1 hora por préstamo, más de 130 estaciones (2026), más de 3 millones de préstamos entre 2024 y 2026, inicio en 2011.
Hay estaciones manuales (anfitrión) y automáticas (tótem y anclajes) y meta de operatividad del 94 %.
Las estaciones del metro son las reales (líneas A y B). Los municipios del juego son Bello, Medellín, Itagüí, Envigado, Sabaneta y La Estrella.
El mapa es **estilizado**: río de sur a norte, autopistas, ciclorrutas verdes, comunas de ladrillo en las laderas y 26 lugares con postal.
El "Centro de Operaciones EnCicla" es ficticio.

**Semáforos:** solo en los cruces de avenida con avenida (`map.lights`). Ciclo de 10 s: el este-oeste está 4,2 s en verde
y 0,8 s en amarillo, y luego el norte-sur igual. Los carros paran; pasar en rojo resta 5 puntos y suma a `ride.stats.reds`
(hay 0,7 s de tolerancia por inercia). Usuario T2 exige 0 en rojo. El bot espera el verde y solo cede a carros que van en su mismo sentido.

**Racha de ciclorruta:** 4, 8 y 15 s seguidos en ciclorruta dan bonos (x2, x3, x4) y líneas de velocidad.
**Sello de revista:** cada postal muestra un sello grande en pantalla (`ride.stamp`).
**Mano guía:** cada modo o minijuego tiene `hint(V)`, que devuelve el punto (en px CSS) a tocar o la dirección a arrastrar.
Sale mientras no hayas aprobado el turno 1 de ese oficio y se apaga en Más > Mano guía.
Los botones con `{key}` guardan su centro en `this.rects`.

**Multijugador (Carrera):** el anfitrión crea la oferta (`Net.host()`), el invitado responde (`Net.join(código)`) y el anfitrión la acepta (`Net.accept`).
Los códigos son `JE1o…`/`JE1a…`, es decir, el SDP comprimido con deflate-raw y en base64url (unos 560 caracteres).
Mensajes: `hi` (nombre y camiseta), `start` (semilla) y `p` (posición cada 0,1 s), además de `fin` y `bye`.
En la misma Wi-Fi funciona sin internet. Entre redes distintas usa STUN de Google, pero las redes con NAT simétrico necesitarían un servidor TURN (pendiente).

**Vida urbana (v0.3):**
- **Tranvía:** va y viene por la calle 112 con 6 estaciones y te choca si te atraviesas.
- **Metrocable:** cuatro líneas en diagonal hacia las laderas, con cabinas animadas.
- **Peatones:** caminan por aceras y plazas. Atropellar resta 3 puntos y el timbre los aparta (suma 1 punto).
- **Noche:** faroles junto a las avenidas, estaciones iluminadas y luces de los carros.

**Logros:** `LOGROS` (id, nombre, prueba sobre `Save.data`). Se revisan al final de cada turno con `Logros.check()`. `Save.data.flags` guarda hitos puntuales.

**v0.5 · Más valle y más personalización:**
- **7 lugares nuevos** (45 en total): Comuna 13 y sus escaleras eléctricas, Biblioteca España, Palacio de la Cultura, Catedral Metropolitana,
  Parque Norte, Unidad Deportiva de Belén y Museo Casa de la Memoria. Se agregan en `LANDMARKS` (coordenadas de diseño),
  en `base` (tipo de suelo), en `solid()` y con su dibujo pixel. La prueba 1b exige que todos sean alcanzables.
- **Ropa que se gana con logros:** `SHIRTS`/`HELMETS` crecieron, y `COSMETIC_REQ` (10-art.js) dice qué logro abre cada índice.
  En Mi ciclista salen con 🔒 (al tocarlas, un aviso dice qué logro falta; si es secreto, dice «???») y con ★ cuando ya son tuyas.
  Al ganar el logro, la pantalla de resultados avisa «Nueva ropa».
- **Sonido ambiente por zona:** `Snd.amb(k)` con k = birds, crickets, tram, metro o river. `Ride.updLife` mira cada 2,5–6 s
  el entorno (pasto o agua alrededor, cercanía del tranvía o del metro, y si es de noche) y usa `Math.random`, no la semilla,
  para no cambiar la simulación. Respeta el interruptor de efectos.
- **Carnet EnCicla** (pestaña Partidas, `UI.carnet()`): avatar, nombre, nivel, cargo más alto con estrellas, km, timbrazos, logros
  y el récord y estrellas de cada oficio (de `Save.data.best` y `Save.data.stars`).

**v0.6 · Tienda, temporadas, historia y cooperativo:**
- **Tienda con hojas verdes** (`SHOP` en 10-art.js: clave → índice → [precio, nombre]). El saldo es `hojas()` = `stats.leaves − spent`.
  Lo comprado queda en `Save.data.owned` (`'bike2'`, `'bell3'`…). Categorías: camisetas, cascos, color de bici (`BIKES`, `profile.bike`)
  y timbre (`BELLS`, `profile.bell`, cambia el sonido en `Snd.sfx('bell')`). Se compra con dos toques en «Mi ciclista y tienda».
  Además de las hojas de Usuario, cada turno da 2 hojas por estrella (`Progress.apply` → `out.hojas`).
- **Clima por temporada** (`SEASONS`, `Season.now()` según el mes real): dos épocas secas y dos de lluvias.
  `Season.pick(rng)` elige la novedad con pesos (más aguaceros en lluvias, Feria de las Flores en agosto, Alumbrados en diciembre).
  En temporada de lluvias el briefing pasa `wet` y el modo puede tener un **chubasco pasajero** (`mode.shower`, semilla aparte).
  Los retos con código y la carrera no usan temporada, para que todos jueguen lo mismo.
  `NOV_EXTRA` guarda las novedades de temporada (Alumbrados: luces en el río con `Ride.drawAlum`); el bot las prueba todas.
- **Historia** (66-historia.js): un mentor por oficio (`CAST`) y 3 capítulos por oficio (`HISTORIA`: título, antes, después).
  Sale como globo en el briefing y en los resultados de los turnos del escalafón. Un capítulo queda completo cuando el turno tiene estrellas,
  así que no usa datos de guardado nuevos. «Más > La historia» permite releerlos.
- **Turno en equipo** (57-equipo.js, rol `equipo`): el anfitrión de la sala juega `ModeCoopMon` (Monitoreo T1 con un camión automático y uno por invitado)
  y cada invitado juega `ModeCoopDriver` (camión). El anfitrión es la autoridad: simulación, carga de camiones y bodega.
  - Anfitrión → invitados: `ord` (orden, con `to`), `s` (estado cada 0,5 s: reloj, bicis de la zona, servicio), `mv`/`ld` (respuestas), `say`, `end`.
  - Invitado → anfitrión: `p` (posición), `at` (llegué a la estación de la orden), `dep` (llegué a la base).
  - Si un invitado se va, su camión sigue en automático. Si se pierde el anfitrión, el invitado termina el turno a los 10 s.
  - `isMulti(id)` agrupa `carrera` y `equipo`: sin mejoras, sin estrellas de escalafón y sin botón Reiniciar. En red la pausa no detiene el juego.
- Corrección: los silleteros de la Feria de las Flores no salían porque faltaba `flores: true` en la novedad.
- **Cartel de ayuda (`#coach`, `Game.dom`)**: el usuario pidió que no tape el juego. Reglas: en modos de mapa lleva la clase `mini`
  (franja pequeña abajo a la izquierda, lejos del timbre); en todos los modos se oculta tras el tiempo de lectura (3,5–9 s según el largo,
  ×1,4 en ritmo tranquilo); reaparece si cambia el texto o si sube `errors`; el texto también sale en el menú de pausa.
  Los modos con lista abajo (Apoyo, Balance, Carrera, conductor en equipo) definen `get coachB()` para que la ayuda quede encima de la lista.
  **No volver a poner carteles grandes o permanentes sobre el mapa.**

**Accesibilidad:** «Letra grande» pone la clase `body.big` y multiplica por 1,15 el texto del canvas. «Mano guía» se puede apagar.
En pantallas bajas (horizontal) la ayuda de los minijuegos va arriba a la derecha.

## 5. Convenciones de código

- La lógica está separada del dibujo. Cada modo o minijuego tiene `update(dt)`, `render(V)` (búfer pixelado), `hud(V)` (texto nítido),
  `pointer(type, vx, vy, cx, cy)` y `bot(err)`. El bot llama a las acciones directamente, sin clics.
- `View`: búfer de baja resolución escalado ×s (pixel perfecto) más una capa nítida para textos (`View.text`).
  En el mapa la escala depende del lado menor de la pantalla y del zoom. En los minijuegos el diseño base es de 200×150.
- El mapa se dibuja en bloques de 32×32 baldosas (caché LRU de 30) y se precalienta un bloque vecino por cuadro.
- Para añadir un modo: clase en `50-modes.js`, entrada en `ROLES` y `MODE_CLASS`, metas con `this.goal(texto, obligatoria, ok(), progreso())`
  y un método `bot()`.
- Todo texto del jugador va en español. Usa símbolos simples (★ ✓ ✗ ⏱ 🚚 📻) que se ven en todos los equipos.

## 6. Pruebas (HECHO CUANDO)

`node tests/run.js --n=100` debe terminar con "✓ TODAS LAS PRUEBAS PASARON":
- El JS compila (vm.Script).
- 100 partidas del bot (los 9 oficios × 3 turnos × novedades × mejoras) sin excepciones, sin NaN, sin bicis perdidas y todas terminan.
- Prueba de humo de la interfaz: portada, escalafón, briefing, juego, dedo, resultados, mejora, pestañas, modales, bot desde Ajustes y código de reto.
- Rendimiento con CPU 4x lenta: mediana del cuadro < 40 ms.
- Multijugador: dos páginas crean la sala, se conectan, arrancan la misma carrera y cada una ve al rival en tiempo real.

## 7. Publicación web (GitHub Pages)

- La rama `gh-pages` contiene **solo** el contenido de `dist/web/`: `index.html`, `.nojekyll`, `manifest.webmanifest`
  (con un ícono maskable), `sw.js` (caché `juega-encicla-v<versión>-<hash>`), `apple-touch-icon.png` (180 px, sin transparencia),
  `icons/` y `compartir.png` (1200×630, usada en og:image).
- Enlace: https://juanfeliperico369-stack.github.io/BicicletasUno/
- iPhone: abrir en Safari → Compartir → "Añadir a pantalla de inicio".

## 8. Android (APK)

- Proyecto Capacitor 7 en `app/`. `app/www/index.html` es una copia de `dist/juega-encicla.html`. El id del paquete es `com.juanfeliperico.juegaencicla`, con minSdk 23 y targetSdk 35.
- Compilar en local: `cd app && ANDROID_HOME=/opt/android-sdk npm run build:debug`. El APK sale en `app/android/app/build/outputs/apk/debug/`.
- En CI: `.github/workflows/android.yml` (ejecución manual o etiquetas `v*`). Sube el APK como artefacto y lo adjunta al *release*.
- Dentro de la app, exportar abre un cuadro para copiar el respaldo (el WebView no descarga blobs) y compartir abre WhatsApp.
- Pendiente para Play Store: firmar un AAB de release con keystore propio, versión 1.0, ficha y política de privacidad.

## 9. Pendientes / ideas (feedback del usuario)

- Pulir cada oficio con el conocimiento real del equipo EnCicla (procesos de anfitrión, relevos, balanceo, taller).
- Multijugador: ya hay carrera 1 contra 1 por código. Faltan salas de más de 2 jugadores, código QR, TURN y modos cooperativos (por ejemplo, Monitoreo con Balance).
- Bluetooth: solo en la app nativa (plugin de Capacitor); los navegadores no permiten Bluetooth entre celulares.
- Lista oficial de estaciones por zona y leyenda de colores de los pines (el usuario la ofreció): reemplazar `STATIONS_DEF`.
- Ideas siguientes: ver a los otros camiones en el turno en equipo, cooperativo con Técnico y Apoyo, eventos de temporada con postales exclusivas, ranking local de récords y más prendas en la tienda.
- Página oficial con donaciones. Tiendas: Play Store primero; después iOS/Mac, Steam, Microsoft Store, Epic y Amazon (con Capacitor o Electron).
