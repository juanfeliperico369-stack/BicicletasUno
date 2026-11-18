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

## 2026-11-12 · v0.8.0 · Ciudad con espacio, gente, equilibrio y música interactiva

**Qué cambió**
1. **Calles con más espacio y redondeadas:** el mundo se dibuja al doble (16 px por casilla de 20 m). Hay andenes, sardineles y esquinas curvas, y el ciclista ya cabe en proporción.
2. **Ciudad viva:** motos, camiones, buses, taxis, ciclistas en las ciclorrutas y peatones.
3. **Modo libre a pie:** te bajas de la bici, caminas por donde quieras y vuelves a subirte.
4. **Bajar y organizar bicis con equilibrio:** el carro parquea lejos de la estación; se llevan 1 o 2 bicis sin dejarlas caer (Balance y Anfitrión).
5. **Pantalla ordenada:** nada se tapa; las metas y los avisos duran poco, y los controles van a la derecha.
6. **Música interactiva:** cambia con la velocidad, la racha, las subidas, la noche y el apuro; las hojas y el timbre suenan en el tono.

**Qué se probó**
- 100 partidas del bot y humo de interfaz.
- Prueba nueva sin encimados en 5 pantallas, caminar, descarga con equilibrio y música que reacciona.
- CPU 4x lenta y la sala de 3 dispositivos.

**Qué falta:** la lista oficial de estaciones, la confirmación de horarios y de la ubicación de bodega y taller, y la trama de los personajes.

## 2026-11-12 · v0.9.0 · El juego sabe qué día es y el modo libre tiene vida propia

**Qué cambió**
1. **Fecha real:** festivos de Colombia, horario de EnCicla según el día y ciclovía los domingos y festivos.
2. **Fiestas automáticas:** Navidad, Velitas, Halloween, Flores, Fiesta del Libro, Independencia y más. Cada una trae colores, decoración del mapa, música, misión y regalo.
3. **Creador:** pestaña Tú (edad, municipio, colegio, universidad, trabajo), contextura y estatura, y bici a la medida.
4. **Modo libre:** misiones del día según tu vida, con animación de clase, trabajo o colegio; carrera de la ciclovía; energía y bancas; fotos para el álbum; mentores con habilidades; el timbre saluda.
5. **Colores:** uniforme y bicis de EnCicla en verde, azul oscuro y blanco; en el modo libre te vistes como quieras y tu bici propia es del color que elijas.

**Qué se probó:** 100 partidas del bot, humo de interfaz, sin encimados, la prueba nueva 3c (calendario, misiones, carrera, colores y creador), rendimiento y la sala de 3 dispositivos.

**Qué falta:** confirmar con EnCicla los horarios por día, la lista oficial de estaciones y la ubicación de bodega y taller.

## 2026-11-12 · v0.10.0 · Oficios nuevos, gráficos, vistas, música por estilos y mundo libre en red

**Qué cambió**
1. **Oficios nuevos:** Pausas Activas, con un minijuego de ejercicios al ritmo de la música, y Rescate, donde se lleva una bici con una mano manteniendo el equilibrio. El técnico tiene tres minijuegos nuevos.
2. **Tutorial opcional:** un compañero de cada oficio te acompaña en el turno. Los mentores se retiraron.
3. **Corredores eléctricos reales:** son tres, con servicio hasta las 7 p. m. Las estaciones solo eléctricas cierran a las 8 p. m.
4. **Gráficos:** modos pixel, híbrido y dibujado 2D, más la vista panorámica de plataformas.
5. **Música:** cuatro estilos (jazz, lo-fi, soft rock y electrónica), en modo automático o a elección.
6. **Modo libre:** dura 24 horas y se puede jugar en red, por LAN o zona Wi-Fi sin internet, o por internet con el celular como servidor. Incluye competencias personalizadas.
7. **Presentación profesional:** sin secciones de revista, con créditos de OneZero y sin datos sin fuente.

**Qué se probó:** 100 partidas del bot con los 11 oficios, la interfaz, que no haya elementos encimados, el calendario, gráficos y vistas, la música, los corredores, el tutorial, el rendimiento y la red con 3 dispositivos, incluida «La lleva».

**Qué falta:** la lista oficial de estaciones con su dificultad por turno, el organigrama y los horarios por oficio, las zonas y el personal, las festividades de EnCicla y las cantidades del sistema.

## 2026-11-13 · v1.0.0 · Versión piloto

**Qué cambió**
1. **Calles rectas y continuas:** la red real se convierte en tramos rectos al cargar, sin escalones. Se unen las calles y las ciclorrutas sueltas.
2. **Ciudad 3D:** edificios con volumen y perspectiva, andenes, cebras, árboles y sombras; cámara más cercana y calles anchas.
3. **NPC con rutas:** ciclistas y peatones recorren toda la ciudad hacia un destino y respetan los semáforos.
4. **Mapa grande interactivo:** se mueve y se acerca, muestra referencias (municipios, metro, lugares y estaciones) y permite marcar un destino.
5. **Interfaz limpia:** letra nueva, poco texto, avisos breves al frente y nada encimado.
6. **Piloto:** modo daltonismo, retos con QR, escenas de la historia y Bluetooth en la app de Android.

**Qué falta:** los datos oficiales que llegarán del equipo de EnCicla.

## 2026-11-13 · v1.0.1 · Controles y horario

1. **Controles siempre disponibles:** si salías del juego con el mapa grande abierto, la siguiente partida quedaba sin controles. Ya no pasa, y el joystick se ve siempre abajo a la derecha.
2. **Horario real:** de lunes a viernes se presta hasta las 8:59 p. m. y se reciben bicis hasta las 10 p. m.
3. **Pruebas nuevas:** controles después de salir con el mapa abierto, y hora límite de préstamo.

## 2026-11-13 · v1.0.2 · Limpieza, accesos rápidos, creador y sábado

1. **Modo Limpieza:** la brigada mensual (dos supervisores y el anfitrión) limpia el habitáculo con escoba, trapero, paño y bolsa.
2. **Accesos rápidos en el inicio:** Mi ciclista, Historia, Personajes, Ranking, Amigos y Retos.
3. **Creador obligatorio:** sin personaje se abre al empezar. El APK ya no restaura datos viejos al reinstalar.
4. **Sábado:** se presta de 6:30 a. m. a 6:59 p. m. y se recibe hasta las 8 p. m.
   - Anfitriones de 6:00 a. m. a 1:30 p. m. y de 1:00 a 8:30 p. m.
   - Supervisores, una hora antes y media hora después.

## 2026-11-14 · v1.0.3 · Domingos y festivos

1. **Horario:** de 8 a. m. a 4 p. m., solo con estaciones automáticas, porque los anfitriones descansan.
2. **En el juego:** el Usuario y el modo libre prestan y devuelven solo en automáticas, y las manuales se ven cerradas en el mapa.
3. **Ficha del anfitrión:** ese día avisa que el turno se juega con el horario de entre semana.

## 2026-11-14 · v1.0.4 · Panel de controles

1. **Panel de controles en la pausa y en Más:**
   - Tipo: joystick fijo, arrastrar, flechas o inclinar el celular, con recalibración.
   - Lado: izquierdo o derecho.
   - Tamaño: pequeño, normal o grande.
   - Vibración.
2. **Control a la izquierda:** la lista de tareas se corre para no quedar tapada.

## 2026-11-14 · v1.0.5 · Préstamo EnCicla en el modo libre

1. **Bici de EnCicla:** el reloj va más lento, hay que renovar cada hora en una estación y se respeta el horario. Con bici propia, el modo libre es de 24 horas.
2. **Tolerancia:** 10 strikes para renovar tarde. Sin strikes, suspensiones de 3 a 60 días.
3. **Bici abandonada:** la pueden reportar, y el reporte negativo no se quita.

## 2026-11-14 · v1.0.6 · Cuarto corredor eléctrico

1. **Pascual Bravo – Hospital Pablo Tobón Uribe:** Pascual Bravo es estación mixta y el Hospital Pablo Tobón Uribe solo presta eléctricas. Las ubicaciones son aproximadas.

## 2026-11-17 · v1.0.6 · Documento único para las IA de arte e historia

1. **`docs/IA-ENCICLA.md`:** encargos de arte e historia para la próxima gran versión, con el formato del documento de *El Metro*.
   - Protocolo de 7 pasos, cuestionario y lista de control.
   - Roles: Gemini (G), ChatGPT (C) y Guionista (H). Biblia de estilo, reparto con descripciones para los prompts y prompts listos.
   - Historia “Un día del valle” (16 capítulos) y los 15 años de EnCicla.
   - Datos reales: horarios, préstamo, corredores eléctricos, los 22 turnos, fiestas e historia con fuentes.
2. **Entregas:** cada IA entrega un documento con todo su trabajo en tres versiones: PDF maestro, MD con el código de las imágenes y ZIP con las imágenes y el PDF. ChatGPT consolida todo al final (C-99).
3. **`tools/armar_entrega.py`:** arma las tres versiones y reconstruye las imágenes desde el MD, verificando el SHA-256. Probado con reportlab y con Pillow, y con el MD dividido en partes.
4. **Huevos de pascua de *El Metro*:** personajes, frases, capítulos, logros, colores de líneas y fechas guardados, más 16 ideas y el objeto `METRO_EGG`.
5. **`tools/todo-ia.js`:** `build.js` compila `dist/ENCICLA-TODO.md` con los anexos (historia actual, guía y bitácora).
6. Descripción para compartir y gráfico de la tienda: “12 oficios”, en vez de “9 oficios, 27 turnos”.

## 2026-11-17 · v1.1.0 · Guion de las IA, Un día del valle y mapa pulido

1. **Entrega C-99 revisada** (`docs/AUDITORIA-C99.md`):
   - 292 PNG reconstruidos con SHA-256 idéntico y archivados en `arte/entregas/2026-11-17-c99/`.
   - Son bocetos generados con código y no superan el dibujo actual: no entran al juego.
   - El guion sí entra, curado en `contenido/guion/`.
2. **Un día del valle:** historia principal de 16 capítulos, de las tulas de las 4 a. m. al cierre de las 10 p. m., con turnos reales y el epílogo de los 15 años de EnCicla.
3. **La ciudad habla:** los peatones dicen frases según la hora, la lluvia, la fiesta, la ciclovía y las estaciones.
4. **Tutor y fiestas:** consejo en la ficha de cada turno y saludo de fiesta en el modo libre.
5. **El Metro:**
   - Rosalba en Niquía antes de las 4:30 a. m. (logro secreto) y sus frases en el Maquinista secreto.
   - Cumpleaños del Metro el 30 de noviembre y enlace a *El Metro* en los créditos.
6. **Logros nuevos:** 8 por oficio, más *Un día del valle* y *Antes del primer tren*.
7. **Horario oficial:**
   - Los domingos se presta hasta las 2:59 p. m. y se recibe hasta las 4.
   - El Museo de Antioquia cierra a las 5:30 p. m. y el Área Metropolitana a las 7 p. m.
   - Festivos siguen como domingo (regla del autor), aunque la página oficial dice que no hay servicio.
8. **Mapa pulido:**
   - Las calles anchas se adelgazan a su eje (60 % menos tramos); se acaban las planchas de asfalto con rayas sueltas.
   - Las rayas siguen el eje de cada calle y las cebras atraviesan cada calle que llega al semáforo.
   - En el modo pixel, el asfalto solo va donde pasa una calle.

## 2026-11-17 · v1.2.0 · Mapa reconocible: cada calle, cada barrio

1. **Calles exactas:** cada vía sale de los datos de OpenStreetMap como vector (32.785 vías, 2.607 nombres), no de la cuadrícula. Se reconocen Laureles, sus circulares y diagonales, la Avenida San Juan y los nombres de las calles.
2. **Peatonales limpios:**
   - Los andenes y cruces trazados como líneas no se pintan.
   - Los senderos solo van en parques, plazas y monte.
   - Las vías de servicio sin nombre no se dibujan como calles.
3. **Nombres de calles y barrios:**
   - Calles: sobre la vía, en el juego y en el mapa grande.
   - Barrios y veredas (672): al entrar a cada uno y en el mapa grande; las comunas también aparecen en el mapa grande.
4. **Casas en fila:** los barrios son casas angostas frente a la calle, con teja, losa, tanques y ropa tendida. Los edificios quedan en el centro, El Poblado, el comercio, la industria y las avenidas.
5. **Estaciones en su punto:** típicamente a 46 m de su coordenada (antes 73 m), y la más lejana a 195 m (antes 441 m). Floresta e Industriales tienen coordenadas de Overture.
6. **Vida:** parqueaderos con carros, postes, árboles de avenida y guayacanes, bancas, palomas, nubes y brillos en el río.
7. **Ni una gota:** misión del modo libre con logro secreto (de *El Metro*).
8. **Corrección:** *Un día del valle* y las misiones diarias del modo libre usaban la misma clave de guardado. Ahora están separadas y el avance se migra solo.

## 2026-11-18 · v1.3.0 · La revolución del mapa: Medellín a 10 m con datos oficiales

Pedido del autor: «acepto el mapa más grande, mejóralo todo», y traer a EnCicla lo mejor de *El Metro* (fragmentos, huevos de pascua y mejoras de su auditoría).

1. **Mapa de 10 m** (antes 20 m): 4.316 × 4.921 casillas. Una calle de barrio mide una casilla, como en la realidad, y las manzanas ya no se las comen las vías.
   - **Huellas de edificios reales** (693 mil de Overture: OSM, Microsoft y Google): casas de ladrillo y edificios donde están; las torres de El Poblado y del centro con la altura de su zona.
   - **Datos oficiales de Medellín** (Catastro, datos abiertos): manzanas (lo que queda fuera de ellas es andén o espacio público), malla vial con nomenclatura y ancho, jerarquía vial, espacio público y lotes.
   - **Barrios oficiales** de Medellín, Itagüí, Envigado y Sabaneta (504 polígonos); en el resto del valle, el barrio más cercano.
   - **Autopistas y avenidas con nombre:** del 17 % al 95 %. Un tramo sin nombre hereda el del vecino que sigue en la misma dirección.
   - **Río:** continuo de Caldas a Barbosa y siempre bajando. El cauce se «quema» en el relieve con una regresión isotónica (33 tramos subían).
   - **Escaleras sueltas** quitadas, quebradas de una casilla (la mitad de agua pintada que antes) y **Metroplús** (líneas 1, 2 y O) por sus avenidas reales.
2. **Motor:**
   - Formato v3: cada vía trae su nomenclatura oficial y su ancho.
   - Las estaciones se buscan en espiral desde su punto real, con memoria de conectividad. La carga bajó de 26 s (primer intento) a 1,6 s.
   - Estaciones a 16 m de su coordenada (mediana; antes 46 m), p90 41 m y máximo 148 m. Todas alcanzables en bici y en camión.
3. **Dibujo:** cada calle con su ancho real, separador con pasto en las avenidas anchas, casas divididas por el área de los lotes catastrales, estaciones del metro de ~130 m y parques y plazas con su nombre.
4. **De *El Metro*:**
   - Metroplús y los colores oficiales de los cables.
   - **Maqueta 2:1** en el mapa grande (botón ⬢): el valle en 3D isométrico con relieve, edificios con su altura, giro de 90° y pellizco.
   - **Direcciones paisas:** la calle por la que vas siempre a la vista, y la misión «¿Dónde queda?» del modo libre (un domicilio a «Calle X con Carrera Y» sin marca: las calles crecen hacia el norte y las carreras hacia el occidente).
   - Secretos de **Gardel** (estación de Metroplús en Manrique) y **Arví** (subir en bici hasta el cable L), con 4 logros nuevos.
   - **Avisos anunciados** a lectores de pantalla (región `aria-live`), **tope de 64 KB** al leer invitaciones y caché de trozos menor en celulares con poca memoria.
5. **Créditos de datos:** el mapa cita a OpenStreetMap (ODbL), Overture y la Subsecretaría de Catastro de Medellín, como piden sus licencias.

**Qué se probó:** todas las pruebas (`tests/run.js`), 54 partidas del bot sin errores, rendimiento con CPU 4× lenta (mediana de 16,7 ms por cuadro), multijugador con 3 dispositivos, maqueta en 41 ms y alcanzabilidad de las 133 estaciones con radios a escala del mapa nuevo.

**Qué falta:** física contra las manzanas reales en el modo pixel, alturas por edificio (no por zona) y las placas de «lo poco conocido».

## 2026-11-18 · v1.3.1 · Un mapa para los dos juegos

Pedido del autor: «toma todo lo que aprendiste, compleméntalo y crea la nueva revolución del videojuego del Metro».

1. **La tubería de mapas sirve a los dos juegos:**
   - `TILE=20 OUT=carpeta python3 tools/geo/build.py` hace el mismo mapa en casillas de 20 m para *El Metro*;
   - allá lo convierten `tools/mapa_valle.py` y `tools/ciudad_datos.py`.
   - Así, *El Metro 1.0.0* cumple 9 de los 12 pasos de su hoja de ruta del mapa (ver `docs/REVOLUCION-METRO-Y-ENCICLA.md`).
2. **Río completo:** el curso del río se traza de Caldas a Barbosa con A* (como lo mide la auditoría de El Metro). Lo que el curso cruza pasa a puente o agua, y el relieve se quema a lo largo de todo el cauce. En 20 m: 0 cortes (antes 69) y subidas de 7 m como máximo (antes 27).
3. **Escaleras:** una escalera de una sola casilla pasa a paso peatonal (en 20 m: 4 sueltas, antes 332).
4. **Barrios:** los polígonos oficiales mandan donde existen, y el barrio con nombre más cercano llena los huecos (Envigado y Sabaneta ya no quedan con zonas vacías).
5. **Tranvía:** sigue cada curva de Ayacucho (la línea pasa de 17 a 40 puntos en 20 m).
6. **Equilibrio del mapa de 10 m:**
   - Como la ciudad mide el doble en px, el bot de las pruebas aprobaba la mitad en los oficios de recorrer el valle (Apoyo 1/4, Balance 1/4, Técnico 1/4).
   - Ahora se anda √2 más rápido y el reloj de los oficios corre √2 más lento (`TRAVEL = √MS`), así cada viaje cuesta los mismos minutos de juego que antes.
   - Con eso el bot vuelve a lo de v1.2.0: Balance 4/4, Técnico 4/4, Rescate 4/4, Supervisor 4/4 y Apoyo 3/4.

**Qué se probó:** todas las pruebas de EnCicla. Estaciones a 16 m de su punto (mediana) y todas alcanzables.

## 2026-11-18 · v1.4.0 · Ciudad suave: curvas, no cubos

Pedido del autor: «organiza bien las estructuras, suaviza los diseños… los rieles se salen de la estación… nada de escalones, debe ser una ciudad jugable, estilo GTA Chinatown Wars, deben haber curvas, no cubos, todo debe estar perfecto».

1. **Suelo sin casillas a la vista:**
   - pasto, monte, plazas, parqueaderos, manzanas y agua salen de contornos vectoriales suavizados: bordes curvos, nítidos a cualquier zoom y sin costuras entre trozos;
   - andenes y sardineles siguen cada calle y las esquinas quedan redondas;
   - las quebradas son un hilo de agua por su trazo real, dentro de su retiro verde.
2. **Estructuras ordenadas con su calle:**
   - casas y edificios en lotes a lo largo de cada calle, girados con ella (también en las curvas), en hasta 3 filas; el frente sale de los lotes catastrales de la zona;
   - sin traslapes y con el mismo resultado en cada trozo; las casas del interior de la manzana miran a la calle más cercana;
   - ninguna casa pisa los corredores del metro, del tranvía ni del Metroplús;
   - casas con volumen (techo según sus pisos y fachadas) y edificios en perspectiva con aires, tanques, helipuertos, jardines o paneles en el techo.
3. **Los rieles no se salen:** las estaciones del metro, el tranvía y el Metroplús se dibujan a lo largo de su línea (siguen las curvas) y los rieles terminan en los andenes.
4. **Lugares emblemáticos sin cubos** (`75-lugares3d.js`, nuevo):
   - **edificios con techo propio:** iglesias en cruz a dos aguas con torre y aguja, la catedral de ladrillo, el Coltejer con su aguja, el teatro a cuatro aguas, el Palacio de la Cultura ajedrezado con cúpula, las tres rocas de la Biblioteca España, el orquideorama con sus flores de madera, Explora, el MAMM y Fabricato en dientes de sierra, Casa EnCicla con sus franjas, campus con claustro, terminales con claraboyas y buses, el coliseo con cúpula;
   - **suelo con curvas:** el estadio en tazón con su cancha y la cubierta de occidental; cerros con curvas de nivel, bosque y camino en espiral (El Volador, Nutibara con el Pueblito Paisa, Tres Cruces con sus cruces, Quitasol, el nacimiento del río); el jardín de flores de Moravia; parques con prados y fuente; Pies Descalzos con arena, agua y bambú; Plaza Botero con sus esculturas; Parque Norte con rueda de Chicago y montaña rusa; la Unidad Deportiva con cancha, piscina y pista; el Olaya Herrera con pista y aviones; la Comuna 13 con sus escaleras eléctricas naranja y murales;
   - **de noche** brillan los postes del Parque de las Luces, el estadio, los atrios y los parques.
   - En modo pixel y en las postales siguen los dibujos de siempre.
5. **Los lugares ya no tapan calles:** en el mapa de 10 m muchas calles reales cruzan los lugares, y 59 cuerpos quedaban encima de una. Ahora el cuerpo se corre dentro de su lugar o se recortan sus bordes, la iglesia mira hacia su parque y la física sigue al dibujo en los dos modos: quedan 3 con algo de calle debajo (Casa EnCicla no se mueve).
6. **Todo con el mismo trazo suave:**
   - las estaciones EnCicla son una plataforma redondeada con anclajes y bicis a su tamaño (antes salían 4 veces más grandes y caían a la calle);
   - la ruta del GPS es una línea curva y ya no cuadritos en escalera;
   - también los aros de destino, semáforos, conos, peatones, tranvía, metro y Metrocable.
7. **Más liviano:** armar un trozo cuesta mucho menos (lotes con celdas de clave numérica y sin arreglos temporales; contornos en franjas; relieve con `ImageData`). Con CPU 4× lenta: Comuna 13 de ~160 a ~100 ms, Ciudad Universitaria de 55 a 22 ms, aeropuerto de 64 a 15 ms.

**Qué se probó:** todas las pruebas (`tests/run.js`), 54 partidas del bot sin errores, rendimiento con CPU 4× lenta (mediana de 16,7 ms por cuadro), 133 estaciones y 45 lugares alcanzables, capturas de los 45 lugares de día y varios de noche, y modo pixel intacto.

**Qué falta:** la física en 3D sigue la cuadrícula de 10 m (los lotes son dibujo), alturas por edificio y tejados variados por barrio.

## 2026-11-18 · v1.5.0 · Medellín desde el aire: los lugares importantes tal cual

Pedido del autor: «investiga a Medellín desde contenido audiovisual aéreo… y haz los lugares importantes tal cual a las imágenes (las universidades, escuelas, alcaldía y demás)».

1. **Investigación aérea** (`docs/MEDELLIN-DESDE-EL-AIRE.md`): se revisaron fotogramas de 12 videos de dron, imagen satelital de 9 lugares y lecturas sobre el paisaje del valle.
   - **Medellín desde arriba:** ladrillo naranja en casi todo; laderas de ladrillo a la vista y plancha gris; El Poblado como un bosque con torres de ladrillo; un centro gris y denso; campus que son islas verdes.
   - **Detalles del valle:** canchas sintéticas en cada barrio, piscinas y tanques negros en las azoteas.
2. **Sitios reales** (`tools/geo/sitios.py` → `src/data/sitios.bin`, 166 KB; en el juego, `22-sitios.js`):
   - **Qué entra:** 1.195 sitios con 5.188 edificios con su forma real (también con patio) y su altura. Son universidades, colegios, hospitales, templos, estadios, alcaldías (por los lugares de Overture), Gobernación, iglesias, bibliotecas, coliseos y terminales.
   - **Suelo:** todas las canchas del valle con sus líneas (1.346), 34 pistas atléticas y 882 piscinas.
   - **Techos según el lugar:**
     - teja a cuatro aguas con faldones y cumbreras, también alrededor de los patios;
     - dos aguas en las iglesias;
     - helipuerto en las torres de La Alpujarra y en los hospitales grandes;
     - la aguja del Coltejer, cúpula en el Planetario y ajedrez en el Palacio de la Cultura.
   - **Colores de cada campus**, elegidos mirando las fotos:
     - UdeA: teja con patio;
     - Nacional: claro;
     - UPB, EAFIT y U. de Medellín: ladrillo;
     - La Alpujarra: concreto;
     - EPM: vidrio;
     - Explora: rojo;
     - Biblioteca España: oscuro.
   - **Física:** dentro de cada campus, lo construido de relleno pasa a prado, con andén alrededor de cada bloque y las plazas reales. Los edificios reales son sólidos en los dos modos, y ninguna estación se monta sobre ellos.
   - **Nombres en el mapa** para universidades, alcaldías, hospitales, coliseos, bibliotecas y terminales grandes.
3. **Lugares con postal en su sitio:** cada uno se busca por el nombre de su edificio o sitio real y se ubica sobre él.
   - El Coltejer estaba a unos 180 m y el Palacio de la Cultura a unos 220 m.
   - 19 pasan a su forma real (UdeA, Nacional, EAFIT, Catedral, Coltejer, Palacio de la Cultura, Terminal del Norte, Biblioteca España, Explora, MAMM, Casa de la Memoria y 8 iglesias de pueblo).
   - Los que siguen dibujados a mano (estadio, cerros, parques) esconden lo real que cae debajo, para que nada salga dos veces.
4. **Ambiente según la vista aérea:**
   - azoteas de baldosa naranja en los edificios de ladrillo;
   - laderas con más plancha gris, ladrillo a la vista y casas de hasta 4 pisos;
   - torres de ladrillo en El Poblado, Envigado, Sabaneta e Itagüí;
   - jardines y arboledas entre las torres de El Poblado, Laureles y Envigado, y el doble de árboles en los campus.
5. **Pantallas grandes:** la caché de trozos crece con lo que cabe en pantalla (antes, con el zoom alejado se quedaban trozos sin suelo).

**Qué se probó:**
- todas las pruebas (`tests/run.js`) y 54 partidas del bot sin errores;
- rendimiento con CPU 4× lenta: mediana de 16,7 ms por cuadro;
- 133 estaciones y 45 lugares alcanzables;
- comparación lado a lado con la imagen satelital de la UdeA, la UPB, EAFIT, la U. de Medellín, La Alpujarra, el centro, Santo Domingo y El Poblado.

**Qué falta:** la forma real de los lugares que no aparecen con su nombre en los datos (Teatro Metropolitano, Museo de Antioquia, Hospital Marco Fidel Suárez y Terminal del Sur), y huellas reales para toda la ciudad (unos 6 MB más).

## 2026-11-18 · v1.6.0 · Los emblemáticos tal cual y la auditoría de El Metro

Pedido del autor: «continúa lo que falta y las sugerencias, por ahora haz los edificios más emblemáticos… y te dejo la auditoría de la otra IA».

1. **Edificios emblemáticos con su forma** (`tools/geo/sitios.py` → partes en `src/data/sitios.bin`, SIT4; en el juego, `22-sitios.js`). Cada uno se miró en el satélite a 30 cm por píxel y se contrastó con fuentes:
   - **Coltejer:** 36 pisos, con su remate que se angosta como una aguja.
   - **Edificio EPM:** 14 pisos en terrazas de vidrio con techos verdes.
   - **Biblioteca EPM:** volumen de piedra que se abre hacia arriba, sobre la Plaza de Cisneros.
   - **Catedral Metropolitana:** ladrillo, con sus dos torres de 51,8 m en la fachada sobre el Parque de Bolívar.
   - **La Candelaria:** dos torres con cúpulas de teja, mirando al Parque Berrío.
   - **San Ignacio:** dos torres, y su claustro de teja.
   - **Sagrado Corazón:** una torre con aguja alta.
   - **Palacio de la Cultura:** muros ajedrezados en negro y verde grisáceo, con su cúpula de hierro.
   - **Teatro Metropolitano:** planos de ladrillo inclinados, la torre del escenario y su plaza de ladrillo.
   - **Museo de Antioquia, Palacio Nacional, edificios Carré y Vásquez y la estación del Ferrocarril:** muros art decó.
   - **La Alpujarra:** 13 pisos con helipuerto.
   - **Biblioteca España:** las tres «rocas» de pizarra, inclinadas.
   - **153 iglesias más** con su torre en la fachada que mira a su parque.
   - Las partes son prismas con base elevada y muros que se pueden inclinar. Cada muro se ve solo si la cámara queda de su lado.
2. **Lugares que faltaban, en su sitio real:**
   - el Teatro Metropolitano, a unos 270 m de donde estaba;
   - el Museo de Antioquia;
   - el Hospital Marco Fidel Suárez, a 1,4 km;
   - la Terminal del Sur;
   - las iglesias principales de Itagüí, a 300 m, y Copacabana, a 400 m.

   Ahora hay 24 lugares con postal con su forma real. Plaza Botero sigue dibujada, con sus esculturas, junto al museo real. Un lugar dibujado a mano ya no le abre huecos a un edificio real que se sigue viendo.
3. **La auditoría de El Metro** (detalle en `docs/AUDITORIA-MAPA.md`):
   - **Río:** su perfil se quema al cargar el mapa (regresión isotónica) y se cierran sus huecos junto al agua: de 19 tramos que subían (hasta 22 m) a 1 (3 m), y de 5 cortes a 1.
   - **Quebradas cubiertas:** se ven como una línea tenue sobre la calzada (la Santa Elena bajo La Playa).
   - **Patios de trenes:** el patio‑taller del Metro en Bello, los talleres del Ferrocarril de Antioquia, el patio del Metro de la 80 y el del tranvía, con sus naves y su patio de rieles.
   - **Seguridad:** Content‑Security‑Policy, sin *referrer* y guardado y mensajes de red sin `__proto__`.
   - **Interfaz a 412 px:** los botones no tapan el minimapa, los textos caben en el círculo y la mano de ayuda se cierra con el primer movimiento.
   - **Horario real del Metro:** fuera de servicio los trenes no corren, y «Antes del primer tren» usa las 5:00 los domingos y festivos.
   - **Placas de lo poco conocido:** 16 datos en su lugar real, en el álbum, con 2 logros.
   - **Medir siempre igual:** `node tools/auditoria-mapa.js`.

**Qué se probó:**
- todas las pruebas (`tests/run.js`), con la CSP puesta, y 54 partidas del bot sin errores;
- rendimiento con CPU 4× lenta: mediana de 16,7 ms por cuadro;
- 133 estaciones y 45 lugares alcanzables;
- la herramienta de auditoría antes y después;
- capturas de los emblemáticos y de la interfaz a 412 × 915 y 412 × 640.

**Qué falta:** huellas reales para toda la ciudad. Antes hay que ajustar el ancho de las calles de ladera a las casas reales; si no, las casas quedarían sobre la calle.
