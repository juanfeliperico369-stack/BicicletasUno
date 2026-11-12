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

*Tu personaje, rankings, personajes y controles* (`67-personaje.js`):
- Al primer "Jugar", después de la introducción se abre **Crea tu personaje** (`UI.avatar(true)`): piel (7), peinado (9: `PEINADOS`), color de pelo (10), barba, gafas,
  camiseta, estilo (camiseta, manga larga, chaleco EnCicla), pantalón, zapatos, casco, color de bici y timbre (tienda). Perfil: `hair, hairCol, beard, glasses, sleeve, pants, shoes`.
  `Art.me()` arma la persona para los minijuegos; `Art.person` dibuja los peinados nuevos; `Art.rider` agrega la cola de pelo largo en la vista de arriba.
- **Ranking** (`UI.ranking`): rango por experiencia (`RANGOS`, 11 rangos), "El valle" contra rivales ficticios (`RIVALES`), "Mis marcas" (10 mejores partidas) y "Por oficio" (récord por turno).
- **Personajes** (`UI.personajes`): fichas del elenco (`CAST` + `BIOS`). Espacio listo para la trama que va a mandar el usuario.
- **Controles** (Más > Controles, `Save.data.settings.ctrl`): joystick flotante (por defecto), joystick fijo abajo a la izquierda, o flechas grandes (para abuelos). `Ctrl` en 67-personaje.js.

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
