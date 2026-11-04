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
src/js/20-map.js      mapa del Valle de Aburrá (150x260 baldosas de 8 px), estaciones, lugares, carriles, metro, ruta (Dial), dibujo por bloques
src/js/30-ride.js     StationSim (demanda de préstamos) + Ride (bici/camión, tráfico, metro, GPS, minimapa) + drawOverview
src/js/40-mg.js       minijuegos: MGAnfitrion, MGMecanico, MGBodega, MGApertura(cierre), MGCables, MGSimon, MGInspeccion
src/js/50-modes.js    ROLES (9 oficios), PERKS, NOVEDADES, Mode/MapMode/ModeSub y las 9 clases de modo
src/js/60-ui.js       UI (portada, escalafón, briefing, resultados, álbum, partidas, ajustes), Game (bucle), Progress
src/js/90-bot.js      bot de pruebas (JE.bot.run): juega partidas y valida invariantes
src/js/95-promo.js    íconos de la app e imagen OG 1200x630
src/js/99-boot.js     arranque y registro del service worker
tools/build.js        construye dist/juega-encicla.html (archivo único) y dist/web/ (PWA)
tools/assets.js       genera los PNG (íconos, apple-touch-icon, favicon, compartir.png) con Playwright
tests/run.js          pruebas: sintaxis, N partidas con el bot, humo de interfaz, rendimiento con CPU 4x lenta
android/              proyecto Capacitor (se genera; ver sección 8)
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

## 7. Publicación web (GitHub Pages)

- La rama `gh-pages` contiene **solo** el contenido de `dist/web/`: `index.html`, `.nojekyll`, `manifest.webmanifest`
  (con un ícono maskable), `sw.js` (caché `juega-encicla-v<versión>-<hash>`), `apple-touch-icon.png` (180 px, sin transparencia),
  `icons/` y `compartir.png` (1200×630, usada en og:image).
- Enlace: https://juanfeliperico369-stack.github.io/BicicletasUno/
- iPhone: abrir en Safari → Compartir → "Añadir a pantalla de inicio".

## 8. Android (APK)

Capacitor con `webDir = dist/capacitor` (copia de `juega-encicla.html` como `index.html`).
Se compila con el flujo de GitHub Actions `.github/workflows/android.yml`, que adjunta el APK de depuración a un *release*.

## 9. Pendientes / ideas (feedback del usuario)

- Pulir cada oficio con el conocimiento real del equipo EnCicla (procesos de anfitrión, relevos, balanceo, taller).
- Multijugador por Wi-Fi/LAN: WebRTC con intercambio de oferta por código QR (sin servidor) y, más adelante, servidor externo.
- Bluetooth: solo en la app nativa (plugin de Capacitor); los navegadores no permiten Bluetooth entre celulares.
- Más lugares (Biblioteca España, Metrocable, Tranvía de Ayacucho), peatones y semáforos.
- Página oficial con donaciones. Tiendas: Play Store primero; después iOS/Mac, Steam, Microsoft Store, Epic y Amazon (con Capacitor o Electron).
