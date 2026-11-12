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

## 2026-11-04 · v0.2.0 · Ciudad viva y multijugador

**Qué cambió**
1. Semáforos en los cruces de avenida con avenida: los carros paran y pasar en rojo resta puntos. Nueva meta en Usuario T2: "0 en rojo".
2. Racha de ciclorruta con bonos y líneas de velocidad, sello grande de revista al ganar una postal y confeti al aprobar.
3. Mano guía animada en los 9 oficios y la carrera: muestra qué tocar o hacia dónde arrastrar en los primeros turnos. Se puede apagar.
4. **Carrera de postales:** contra el bot (tranquilo, veloz, turbo) o contra un amigo en otro celular por WebRTC, con código compartible y sin servidor.
5. Los carros frenan detrás del jugador. El bot respeta los semáforos y cede a los carros que van en su mismo sentido.

**Qué se probó**
- 100 partidas del bot (ahora con Carrera) sin fallas.
- Humo de interfaz y rendimiento con CPU 4x lenta (mediana de 16,7 ms por cuadro).
- Sala WebRTC real entre dos páginas: códigos generados, ambas inician la carrera con la misma semilla y el invitado ve al anfitrión en tiempo real.

**Errores encontrados por el bot y corregidos**
- Bloqueo en cruces donde la ruta gira: el bot revisaba dos ejes del semáforo a la vez.
- El camión pasaba ~40 % del tiempo en semáforos: se dejaron solo en los cruces de avenida con avenida.
- Choques en cadena porque los carros se arrastraban hasta el camión, y bloqueo frente a frente entre carro y camión.

**Qué falta:** probar en celulares reales (en especial la sala entre redes distintas), código QR, salas de más de 2 jugadores y feedback de EnCicla.

## 2026-11-04 · v0.3.0 · Medellín viva, logros y accesibilidad

**Qué cambió**
1. Tranvía de Ayacucho (calle exclusiva, 6 estaciones, se mueve y puede chocarte) y Metrocable K, P, J y H con cabinas animadas sobre las comunas.
2. Peatones en aceras y plazas: si los atropellas pierdes puntos, y el timbre los aparta ("¡Gracias!").
3. Noche: faroles, estaciones iluminadas y luces de los carros.
4. 16 logros que se ven en la pestaña Partidas y aparecen en los resultados.
5. Introducción "¿Qué es EnCicla?" (4 páginas) al primer Jugar, y sección "Apoya la bici pública" con el sitio oficial.
6. Opción de letra grande, imagen de resultado para compartir (1080×1350, estilo revista) y mejoras en horizontal.

**Qué se probó**
- 100 partidas del bot, humo de interfaz (introducción, logros, tarjeta, letra grande y modales), multijugador entre dos páginas y CPU 4x lenta.
- Capturas en horizontal (844×390) de 6 modos.

**Qué falta:** probar en celulares reales, feedback de EnCicla y sonido ambiente diferente por zona.

## 2026-11-04 · v0.4.0 · De Caldas a Barbosa, Easter eggs y nuevos minijuegos

**Qué cambió**
1. **Mapa de Caldas a Barbosa** (según las capturas de la app oficial): 150×432 baldosas.
   - Al norte de Bello, corredor que gira al noreste con Copacabana, Girardota, Barbosa y campo entre pueblos.
   - Al sur: Envigado, Itagüí, Sabaneta, La Estrella y Caldas.
   - 106 estaciones con nombres de barrio en 10 municipios.
   - 12 lugares nuevos, entre ellos el Alto de San Miguel (nacimiento del río), Quitasol, Fabricato, Ditaires y Otraparte.
   - La línea A del metro termina en Niquía.
2. **Minijuegos nuevos inspirados en tus referencias:**
   - Circuito (Infinity Loop) y Señal láser (Laser) en Técnico.
   - Semaforero (Traffix) en los avisos del Supervisor.
   - Desvíos (Package Inc) en Bodega T3.
   - Maquinista (Railways/Tiny Rails), como Easter egg.
   - Laberinto de Moravia, como Easter egg.
3. **Easter eggs:**
   - El Metro secreto ("Próximamente: Juega Metro").
   - El laberinto de Moravia.
   - La bici dorada (7 toques al título o código Konami).
   - La postal secreta de las Tres Cruces.
   - 5 logros nuevos, 3 de ellos secretos.
4. **Multijugador:** salas de hasta 4 jugadores (estrella con reenvío), invitación con **código QR** y escáner con la cámara (cuando el equipo lo permite).
5. Monitoreo por zona con vista recortada, minimapa tipo radar y sub-zonas para que el mapa grande no alargue los turnos.
6. **Ciclovía** con avenidas cerradas y conos, y **Feria de las Flores** con silleteros.
7. **Play Store y página oficial:**
   - `landing/pagina.html` y `privacidad.html`, con APK descargable en `descargas/`.
   - Guía `docs/PLAY_STORE.md`, imágenes de tienda (`tools/store.js`) y firma de release.
   - Permiso de cámara (QR) y versionCode 400.

**Qué se probó**
- Integridad del mapa: 106 estaciones y 38 lugares alcanzables en bici; todas las estaciones al alcance del camión.
- Los 6 minijuegos nuevos completos con el bot.
- 100 partidas del bot.
- Sala de 3 dispositivos (anfitrión y 2 invitados) en la que el invitado 2 ve al anfitrión y al invitado 1.
- QR verificado en las versiones 1 a 40 (idéntico a la referencia Nayuki, leído por zxing y OpenCV).

**Errores encontrados y corregidos**
- La plaza de Girardota cortaba la avenida y el camión no llegaba.
- El camión se atascaba en pasos de 1 baldosa: se redujo su radio de colisión.
- Todos los invitados quedaban con id 0 y el reenvío fallaba.
- La línea A del metro llegaba hasta Barbosa.

**Qué falta:**
- La lista oficial de estaciones por zona (el usuario la ofreció) para reemplazar los nombres aproximados.
- La leyenda de colores de los pines de la app oficial.
- Pruebas en celulares reales y el permiso escrito de EnCicla para publicar.

## 2026-11-04 · v0.4.1 · Mapa ampliado ×1.35

**Qué cambió**
- El mapa pasó de 150×432 a 203×583 baldosas: más cuadras, más laderas y comunas más anchas, y una avenida nueva (Carrera 30).
  Ahora hay 68 cruces con semáforo.
- Escala parametrizada (`SC`, `X()`, `Y()`, `snapRow`, `snapCol`, `fitLM`): el mapa se puede agrandar o achicar cambiando un solo número.
- Las distancias y tiempos de los oficios se ajustaron a la escala.
  - Metas de Balance (4/5/6 órdenes) y Supervisor (4/6/7 avisos).
  - Servicio de Monitoreo 70/80/85 %.

**Qué se probó**
- 106 estaciones y 38 lugares alcanzables, y el camión llega a todas.
- 100 partidas del bot, sala de 3 dispositivos y CPU 4x lenta (mediana de 16,7 ms).

**Errores encontrados y corregidos**
- Madera quedó dentro del río y Barbosa Norte en el borde del mapa: se reubicaron.

## 2026-11-05 · v0.5.0 · Más valle, ropa por logros, sonido ambiente y carnet

**Qué cambió**
1. Siete lugares nuevos con postal (45 en total): Comuna 13, Biblioteca España, Palacio de la Cultura, Catedral, Parque Norte,
   Unidad Deportiva de Belén y Casa de la Memoria.
2. Siete prendas que se ganan con logros (uniforme EnCicla, camiseta dorada y silletera, y cascos dorado, del Metro, cono y todero).
   Salen con candado en Mi ciclista y los resultados avisan cuando ganas una.
3. Sonido ambiente según la zona: pájaros en parques de día, grillos de noche, campana del tranvía, paso del metro y el río.
4. Carnet EnCicla en Partidas: tu cargo más alto, nivel, km, logros y el récord y estrellas de cada oficio.

**Qué se probó**
- 106 estaciones y 45 lugares alcanzables, y el camión llega a todas las estaciones.
- 100 partidas del bot, humo de interfaz, CPU 4x lenta (mediana de 16,7 ms) y sala de 3 dispositivos.
- Las prendas bloqueadas no se pueden elegir y avisan qué logro falta.

**Qué falta:** la lista oficial de estaciones por zona, la leyenda de colores de los pines y las pruebas en celulares reales.

## 2026-11-10 · v0.6.0 · Tienda, temporadas, historia y turno en equipo

**Qué cambió**
1. **Tienda con hojas verdes:** colores de bici, timbres (corneta, campanita, pato), camisetas y cascos. Cada estrella da 2 hojas.
2. **Clima por temporada** según el mes real: más aguaceros en las dos épocas de lluvias, chubascos que llegan en pleno turno,
   Feria de las Flores en agosto y Alumbrados con luces en el río en diciembre.
3. **Historia de 27 capítulos:** un mentor por oficio te habla antes y después de cada turno, de Doña Luz a la Gran Rodada. Se relee en Más.
4. **Turno en equipo (cooperativo en red):** quien crea la sala dirige desde Monitoreo y hasta 3 amigos manejan los camiones.
5. Tres logros nuevos (24 en total) y cinco datos nuevos en «¿Sabías que?».
6. **El cartel de ayuda ya no tapa el juego** (pedido del usuario): en el mapa es una franja pequeña abajo a la izquierda,
   se quita solo tras el tiempo de lectura, vuelve si te equivocas y también se lee en el menú de pausa.

**Qué se probó**
- 100 partidas del bot (con Alumbrados y chubascos), humo de interfaz y CPU 4x lenta.
- Sala de 3 dispositivos: carrera y turno en equipo. La orden llega solo al conductor elegido, el camión entrega y recarga
  sin perder bicis, el otro conductor ve el estado y el turno termina en los 3.

**Errores encontrados y corregidos**
- Los silleteros de la Feria de las Flores no aparecían.
- El briefing mostraba un aviso del turno antes de empezar.
- Un invitado que seguía en carrera no recibía el inicio de la partida siguiente.

**Qué falta:** la lista oficial de estaciones por zona, la leyenda de colores de los pines y las pruebas en celulares reales.

## 2026-11-12 · v0.7.0 · EnCicla real: mapa del valle, oficios reales y tu personaje

**Qué cambió**
1. **Mapa real del Valle de Aburrá** de Caldas a Barbosa con datos abiertos (OpenStreetMap vía Overture, relieve SRTM): calles reales, 71 km de ciclorrutas,
   río y quebradas, parques, los 10 municipios, Metro A y B y Tranvía siguiendo su trazado, 758 semáforos y 128 estaciones con coordenadas reales.
2. **Relieve:** sombras y curvas de nivel; las subidas frenan, las bajadas aceleran (y hay que frenar), y el corredor eléctrico ayuda a subir.
3. **Gráficos sin temblor:** cámara continua y objetos en movimiento dibujados a resolución de pantalla (giran suave en diagonal).
4. **Oficios con los turnos reales:** anfitrión (apertura/cierre, sillín a la medida), apoyo con las 10 zonas, supervisor con tulas, técnico con power banks,
   bodega en 4 pasos y entrega al taller, mecánico (reparación y ensamble), balance (tulas, camión de 40, parqueadero) y monitoreo (inventario cada hora y atención al cliente).
5. **Crea tu personaje** al empezar (peinados, pelo, barba, gafas, ropa, zapatos), **ranking** con rangos, **personajes** y **3 tipos de control** (joystick flotante, fijo o flechas).

**Qué se probó**
- 128 estaciones y 45 lugares alcanzables en bici y en camión; zonas del Apoyo con sus cantidades exactas; mapa cargado en ~0,2 s.
- 100 partidas del bot con los turnos reales, humo de interfaz (creador, ranking, personajes), CPU 4x lenta y la sala de 3 dispositivos (carrera y equipo).

**Errores encontrados y corregidos**
- Las calles quedaban demasiado anchas (casilla de 20 m): se adelgazó la red y el asfalto se dibuja de 10 m.
- La primera fase de cada turno arrancaba a las 6:00 y todo salía tarde; un turno de supervisor no terminaba; dos minijuegos no cerraban con el bot.

**Qué falta:** la lista oficial de estaciones, horarios por confirmar (Monitoreo, Balance T2/T3), ubicación real de la bodega y el taller, y la trama de los personajes.
