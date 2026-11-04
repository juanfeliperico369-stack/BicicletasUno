# BITÁCORA · Juega EnCicla

Formato: fecha · versión · qué cambió · qué se probó · qué falta.

## 2026-11-04 · v0.1.0 · Primera versión jugable

**Qué cambió**
1. Estructura del proyecto (`src/`, `tools/`, `tests/`, `docs/`) y construcción a un único HTML offline y a una PWA.
2. Estilo "revista pixel" (EMSAY + Doc Element) con la paleta EnCicla y las fuentes embebidas del HTML de referencia.
3. Mapa estilizado del Valle de Aburrá: río, autopistas, metro A y B, ciclorrutas, comunas, 33 estaciones y 26 lugares con postal.
4. Los 9 oficios jugables con 3 turnos cada uno, metas, estrellas, escalafón, mejoras roguelite, novedades del día, ritmo tranquilo,
   reto del día y código de reto.
5. Guardado local, exportar/importar partidas (JSON), álbum de postales, historial, avatar, sonido y música 8 bits por código.
6. Bot de pruebas (dentro del juego en Ajustes > Diagnóstico y por línea de comandos).

**Qué se probó**
- Sintaxis OK. 54 y luego 100 partidas del bot sin fallas (conservación de bicis, sin NaN, todas terminan).
- Humo de interfaz completo y rendimiento con CPU 4x lenta (mediana de 16,7 ms por cuadro).

**Errores encontrados por el bot y corregidos**
- La ruta del camión partía de una casilla de estación no transitable.
- Inicios dentro de edificios.
- Bucle de choques (un carro detenido encima del camión).
- Atascos en esquinas (se añadió asistencia de esquinas).

**Qué falta:** feedback del equipo EnCicla, multijugador por red, APK firmado para Play Store.

## 2026-11-04 · v0.1.0 · Publicación y pulido

**Qué cambió**
- Publicado en GitHub Pages (rama `gh-pages`, solo `dist/web/`).
- Portada sin textos encimados, zoom del mapa adaptado a escritorio, ruta GPS más visible, flecha al objetivo fuera de la lista de metas,
  el primer usuario del Anfitrión llega enseguida.
- Ayuda contextual que no tapa los botones de los minijuegos y metas ocultas mientras hay tarjetas abiertas.

**Qué se probó**
- 100 partidas del bot y humo de interfaz.
- En el enlace publicado (`tests/verify-live.js`): carga sin errores, service worker activado, abre y se juega sin conexión,
  Chrome reporta 0 errores de instalabilidad y og:image, apple-touch-icon y manifest responden 200.

**Qué falta:** APK (en proceso con Capacitor), feedback del equipo EnCicla.

## 2026-11-04 · v0.1.0 · APK Android

**Qué cambió**
- Proyecto Capacitor 7 (`app/`) con íconos pixel, pantalla de inicio azul y pantalla completa.
- Flujo de GitHub Actions para compilar el APK.
- En la app, exportar abre un cuadro para copiar el respaldo y compartir abre WhatsApp.

**Qué se probó**
- `aapt2 badging`: paquete, etiqueta, versión y actividad correctos.
- El HTML dentro del APK es idéntico a `dist/juega-encicla.html`.
- 27 partidas del bot y humo de interfaz después del cambio.

**Qué falta:** probarlo en un celular real, firmar el APK de release para Play Store y recibir feedback de EnCicla.
