# Contexto y entrega de Codex · Motor City y Turno Cero

Actualización del 22 de noviembre de 2026. Base de integración Motor City 4.6.1, commit 546229d. Prioridad del autor: arte y tecnología del motor, juego arcade de mundo abierto, tutorial opcional y acceso temprano a las actividades. El juego está en juegos/getaway/.

## Plan y estado

1. Mejorar el motor, auditar, corregir y optimizar. La base 4.6.1 incorpora controles arcade, acelerador fijo, mapa y cámaras. Las pruebas y límites figuran abajo.
2. Usar el mismo motor en Turno Cero. El acceso al mundo libre y el menú reúnen carreras, extremo, mandados, EnCicla y tren. Las actividades tienen condiciones de ciudad y estado que requieren revisión para cumplir el acceso deseado por el autor.
3. Volver a auditar motor y juego tras integrar cambios. El ritmo y los controles aún necesitan pruebas humanas en dispositivos físicos.

El encargo exige un mundo compartido en 3D, vistas cenital, panorámica, primera, tercera, lateral y pixel, con 2D en los modos adecuados. También pide actividades con consecuencias, aprendizaje y curiosidad, y un endless runner en ciclovías con cambios de dirección, obstáculos y zonas de trucos. Estos puntos siguen en el plan.

## Entrega

- Cinco ilustraciones originales pintadas se integraron en las transiciones de los actos I a V. Se incluyen en el HTML autocontenido. La portada existente de Gemini sigue activa. Hay una portada alternativa en arte/chatgpt/turno-cero/.
- El menú compartido de MC.UI limpia su manejador Escape al cerrarse y al desmontar la interfaz. Al abrir otro menú cierra el anterior y devuelve el foco al control que lo abrió.
- pruebas/modos.mjs acepta MC_PRUEBAS_URL para ejecutar la batería por HTTP local.
- Se conservó el trabajo simultáneo publicado hasta 4.6.1. El trabajo anterior sobre 4.2 quedó en los stashes locales y necesita revisión antes de integrarse. Incluye una API experimental MC.Ciudad, modelos y una guía de direccionales incompleta. La prueba anterior registró errores GuiaCine is not defined.

## Comparación para la próxima evolución

Las fuentes siguientes son descripciones oficiales consultadas en línea. Son investigación de diseño y no prueban una partida directa en cada título.

- **Super Arcade Racing**, referente prioritario. Sus carreras cenitales, pistas por bioma, rivales, personalización y clasificación sugieren circuitos de entrada inmediata, reinicio rápido, curvas legibles y tiempos comparables. Se propone usar el mismo recorrido en mundo abierto y en el selector, con reglas y resultados idénticos. https://store.steampowered.com/app/1103770/
- **Traffix** centra la decisión en semáforos y flujo. Un desafío corto podría medir esperas y cruces seguros en una intersección del mismo mapa, con controles de un toque y salida inmediata. https://store.steampowered.com/app/1102580/
- **Night Call** relaciona conversaciones con conducción. Un pasajero o una entrega podrían revelar una pieza opcional del expediente sin condicionar la exploración. https://store.steampowered.com/app/680380/
- **112 Operator** combina ubicación, incidentes, tráfico y clima. Una actividad de despacho con incidentes ficticios podría compartir calles y estado del tránsito. https://store.steampowered.com/app/793460/
- **Railway Empire** presenta decisiones de red y estaciones. Puede orientar una actividad de planificación ferroviaria a la escala del tren actual. https://store.steampowered.com/app/503940/
- Los enlaces del autor a PAKO, #DRIVE, Package Inc, Railways, Tiny Rails, Vector, Monument Valley y los demás quedan en la petición adjunta. Hace falta estudiar sus controles y experiencias directamente.

Medir tiempo hasta alcanzar velocidad útil, radio de giro, frenado, carga, p50/p95 y fallos en calles estrechas. Comparar cada actividad cerrada con su entrada desde el mundo abierto usando posición, reglas, físicas y cámara equivalentes. Ajustar distancias y reloj para evitar esperas excesivas. Mantener una simulación espacial única y comprobar que cámaras, colisiones, tráfico y objetos coincidan entre las representaciones.

## Pruebas de esta entrega

- node motor.mjs prueba --navegador, con Chromium por HTTP local: 158 comprobaciones aprobadas, con WebGL por software y emulación móvil.
- node pruebas/modos.mjs: los cinco modos concluyen en la simulación, los rivales avanzan, el acelerador fijo arranca y frena, y el mapa abre y cierra. El bot adelanta la posición en carreras y entregas.
- Prueba adicional en Chromium: acto I muestra su ilustración y el menú se abre y se cierra dos veces con Escape en 412 × 860 y 860 × 412, sin errores de página.
- En la revisión anterior de repositorios hermanos, Metro completó 100 partidas con cero errores y Run completó 100 simulaciones con cero errores. EnCicla tuvo dos fallos en la adaptación local del banco de pruebas, uno en niveles y otro en reenvío multijugador. Repetir con las versiones actuales antes de atribuir la causa.

## Pendientes

- Probar manualmente actividades y entradas desde el mundo abierto en móvil vertical, horizontal y escritorio. La prueba automatizada usa intervenciones del bot y no acredita la experiencia completa a mano.
- Ajustar disponibilidad y transiciones de los modos para cumplir la intención de acceso desde el comienzo. Resolver la dependencia de redes presentes solo en determinadas ciudades.
- Diseñar y probar ciclovías continuas, cambios de dirección, obstáculos, zonas de trucos y regreso al mismo punto del mundo libre.
- Revisar C-M31 y el estado de C-M37, C-M38, C-M39, C-M40 y C-A18 contra las implementaciones y pruebas actuales.
- Verificar GPU real, tiempos, memoria, accesibilidad de menús y rendimiento. Recorrer historia y finales a mano.
- Consultar fichas, buzones y ramas remotas de las otras IAs antes de integrar cambios. Revisar el trabajo respaldado en los stashes de esta sesión.
- Modern Web Guidance y otras skills se instalaron durante la sesión. La revisión automática rechazó la instalación de Claude-Mem por la captura persistente de actividad y sus posibles destinos externos.

## Handoff para la siguiente IA

Lee este documento, CONTEXTO-RELEVO.md, TAREAS-IA.md y coord/. Al terminar tu turno, **escribe tu propio documento de contexto con el plan completo, lo realizado, las pruebas y lo pendiente**, actualiza el relevo compartido y deja la misma instrucción a la siguiente IA. Incluye enlaces de ejecución y distingue pruebas reales, simulaciones y trabajo pendiente.
