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
src/js/20-map.js      mapa del Valle de Aburrá de Caldas a Barbosa (203x583 baldosas de 8 px, escala SC=1.35), 106 estaciones, 38 lugares, carriles, metro, ruta (Dial), dibujo por bloques
src/js/30-ride.js     StationSim (demanda de préstamos) + Ride (bici/camión, tráfico, metro, GPS, minimapa) + drawOverview
src/js/35-life.js     vida urbana: Tranvía de Ayacucho (calle sin carros), Metrocable K/P/J/H, peatones, luces de noche
src/js/40-mg.js       minijuegos: MGAnfitrion, MGMecanico, MGBodega, MGApertura(cierre), MGCables, MGSimon, MGInspeccion
src/js/45-mg2.js      minijuegos v0.4 inspirados en Infinity Games y Railways: MGLoop (Circuito), MGLaser (Señal), MGTraffix (Semaforero),
                      MGRutas (Desvíos de Bodega T3 y «Maquinista» secreto) y MGLaberinto (Moravia secreto)
src/js/50-modes.js    ROLES (9 oficios), PERKS, NOVEDADES, Mode/MapMode/ModeSub y las 9 clases de modo
src/js/55-carrera.js  Carrera de postales (multijugador): contra un bot (3 niveles) o en red
src/js/65-extra.js    logros (16), introducción «¿Qué es EnCicla?», «Apoya la bici pública», tarjeta de resultado 1080x1350
src/js/70-net.js      Net: salas WebRTC de hasta 4 jugadores en estrella (el anfitrión reenvía), sin servidor
src/js/72-qr.js       QR: generador propio (v1–40, idéntico a la referencia Nayuki) + escáner con BarcodeDetector y cámara
landing/              página oficial (pagina.html), privacidad.html, capturas y arte; build.js la copia a dist/web
tools/store.js        capturas 1080x1920 y gráfico 1024x500 para Play Store (dist/store/) y la página oficial
docs/PLAY_STORE.md    ficha de Play Store, clasificación, seguridad de datos y pasos de firma (keystore.properties fuera de git)
src/js/60-ui.js       UI (portada, escalafón, briefing, resultados, álbum, partidas, ajustes), Game (bucle), Progress
src/js/90-bot.js      bot de pruebas (JE.bot.run): juega partidas y valida invariantes
src/js/95-promo.js    íconos de la app e imagen OG 1200x630
src/js/99-boot.js     arranque y registro del service worker
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

| # | Oficio | Vista | Habilidad | Se desbloquea con |
|---|--------|-------|-----------|-------------------|
| 1 | Usuario | cenital, mundo libre | moverse y orientarse | 0 ★ |
| 2 | Anfitrión | panorámica | atender, decidir | 1 ★ |
| 3 | Mecánico | lateral | emparejar herramienta y falla (colores) | 3 ★ |
| 4 | Bodega | lateral | clasificar rápido | 5 ★ |
| 5 | Apoyo | cenital | planear rutas y tareas con hora límite | 8 ★ |
| 6 | Técnico | cenital | llegar rápido y reparar (cables, memoria) | 11 ★ |
| 7 | Balance | cenital, camión | conducir y gestionar carga | 14 ★ |
| 8 | Monitoreo | general (911 Operator) | estrategia de flota | 17 ★ |
| 9 | Supervisor | todas | coordinar: personal, avisos, cierre | 21 ★ |

- Cada oficio tiene **3 turnos** con **3 metas**. La primera es obligatoria. Estrellas = metas cumplidas si se cumple la obligatoria.
  El turno N+1 se abre con ≥1 ★ en el turno N. Hay además un modo "Libre" (práctica; en Usuario es el Paseo libre).
- **Roguelite:** al aprobar un turno eliges 1 de 3 mejoras (`PERKS`, máximo 3 activas). Si fallas un turno pierdes todas y la racha vuelve a 0.
- **Novedad del día** (`NOVEDADES`): modifica tráfico, demanda, lluvia, ciclovía, partido en el Atanasio, Feria de las Flores…
  El turno 1 siempre es "Día normal".
  - Ciclovía: El Poblado, la 80 y Las Vegas quedan cerradas a los carros y con conos.
  - Flores: aparecen silleteros en las aceras.

**Mapa v0.4 (Caldas → Barbosa):** sigue las capturas de la app oficial que compartió el usuario.
- **Escala v0.4.1:** `SC = 1.35`. Todo se diseña en coordenadas de diseño (x 0..150, yy -120..312) y se convierte con `X(x)` y `Y(yy)`.
  - El mapa real mide 203×583 baldosas.
  - Las avenidas se ajustan a la cuadrícula con `snapRow`/`snapCol`, y `fitLM` mueve cada lugar para no tapar avenidas ni el río.
  - Las distancias de los oficios (sub-zonas, órdenes, tiempos límite) se multiplican por `SC`.
  - Para cambiar el tamaño del mapa basta con cambiar `SC` y correr las pruebas (verifican que todo sea alcanzable).
- Al norte de Bello el río gira al noreste (`bendN`) y el valle se vuelve un corredor (`mW`/`mE`) con pueblos (`TOWNS_N`: Copacabana, Girardota y Barbosa).
  Entre pueblos el terreno es rural: potreros, sin calles menores.
- 106 estaciones con nombres de barrio (`STATIONS_DEF`, 10 municipios). Son aproximados: **pedirle al usuario la lista oficial por zonas**.
- Por el tamaño, cada oficio trabaja en una **sub-zona** (`subZone`).
  - Monitoreo ve solo su zona (T1 centro, T2 sur, T3 norte), con la vista recortada y una base local.
  - Supervisor atiende estaciones a menos de 100 baldosas de la bodega.
  - Las órdenes de Balance quedan a menos de 900 px.
- El minimapa es un radar alrededor del jugador; al tocarlo se ve el valle completo.

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

**Escalas del mundo:** 1 baldosa = 20 m. Bici 60 px/s (×1,3 en ciclorruta, ×0,62 en acera, ×0,55 en pasto). Camión 50 px/s, solo por vías.
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
- Ideas siguientes: misiones de historia por oficio, modo cooperativo en red (Monitoreo + Balance), clima por temporada y tienda de ropa con hojas verdes.
- Página oficial con donaciones. Tiendas: Play Store primero; después iOS/Mac, Steam, Microsoft Store, Epic y Amazon (con Capacitor o Electron).
