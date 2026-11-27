# Plan de reconstrucción del mundo 3D de Medellín

**Codex · 27 de noviembre de 2026 · propuesta en desarrollo**

## Intención del autor

Reconstruir el mundo 3D con un único territorio continuo y reconocible. Algunas zonas de interés se investigan y modelan con mucho detalle. El resto de la ciudad conserva su extensión, calles, alturas disponibles, edificios genéricos y conexiones. La cámara cenital gira gradualmente hacia el desplazamiento o la mirada y permite control manual. Las personas y vehículos mantienen proporciones coherentes. Los skateparks y el parkour deben ser actividades jugables del mundo.

Este plan inicia una arquitectura nueva sobre los datos existentes. Cada decisión de fidelidad se acompaña de fuente, fecha, licencia y nivel de confianza. El mapa existente contiene relieve SRTM y huellas, pero esto no demuestra que sus cotas, rasantes o alturas sean exactas.

## Primeros resultados de este encargo

- Zona piloto propuesta: corredor Universidad, Jardín Botánico, Parque Explora, Parque de los Deseos y Planetario. La concentración de transporte, turismo, plazas y calles facilita comprobar cuatro juegos en un sector conectado. La ficha existente del Parque de los Deseos sitúa un punto de referencia en 6.268360, -75.565850. Las dimensiones de esa ficha son aproximadas y deben contrastarse.
- Manifiesto de propuesta en contenido/zonas-detalladas.json, con límites provisionales y ancla aproximada. La herramienta herramientas/validar-zonas-detalladas.mjs comprueba que estén dentro del MC4, no comprueba medidas arquitectónicas.
- Arte conceptual original en [la lámina de dirección artística](img/nuevo-mundo-3d/concepto-norte-cultural-skate.png). Es una composición ilustrada: la geometría y el skatepark representados requieren levantamiento y no constituyen una medición de la ciudad.
- Existe una base optativa de seguimiento de rumbo en MC.Camara. Permite giro amortiguado, pausa después de un gesto y cámara libre. Se mantiene desactivada en los juegos hasta resolver la relación con el joystick y completar pruebas táctiles. Activar un giro de cámara que modifica a la vez el marco de referencia de un joystick sostenido puede producir giros continuos.
- EnCicla ya contiene cinco registros de skateparks y lógica de actividades en src/js/99p-ciclovia-skate-runner.js. Sus posiciones, objetos, colisiones y fidelidad 3D aún requieren verificación en la versión actual.

## Zonas candidatas

| Sector | Motivo jugable | Estado de investigación |
|---|---|---|
| Universidad–Planetario–Jardín Botánico | Metro, parque, hitos, EnCicla y paseo turístico | Piloto propuesto. Fichas y coordenadas existentes, sin inventario medido completo. |
| Centro, San Antonio–Plaza Botero–Parque de las Luces | Transporte, recorridos a pie y arquitectura | Segunda candidata. Verificar geometría y permisos de datos. |
| Ciudad del Río | Espacio público y actividad de skate | Existe un registro de skatepark en EnCicla. Confirmar ubicación, dimensiones, elementos y acceso real. |
| La Floresta–Estadio | Actividad deportiva y corredores | Candidata por investigar. |
| Poblado–Aguacatala | Diferencias de altura, edificios y estaciones | Candidata por investigar. |
| Guatapé y Manhattan | Ya disponibles en el proyecto | Fases posteriores con su propia investigación. |

No se promete fidelidad centimétrica sin datos verificables. El piloto tendrá un límite geográfico concreto una vez levantados calle, alturas, pendientes, puntos de acceso y esquinas relevantes.

## Fase 0 · Datos, licencias y aceptación

1. Congelar la versión de cada juego y sus métricas de partida, capturas y guardados. Reproducir los bloqueos P0 del informe forense antes de añadir contenido.
2. Hacer una ficha por zona con polígono WGS84, fecha, fuentes, nombres, cotas, rasantes y trazas. Registrar identificador por objeto, valor, unidad, origen, licencia, margen de error y método. Clasificar cada medida como verificada, aproximada o desconocida.
3. Consultar OpenStreetMap y Overture para calles y huellas, GeoMedellín y Catastro para su inventario, y servicios oficiales de elevación. Verificar condiciones y cobertura antes de incorporar derivados. No inferir medidas de una imagen artística ni de una fachada procedural.
4. Comparar varios puntos de altura y pendiente con datos de referencia. El terreno, puentes, escalas, túneles y vías deben compartir un datum y unidades en metros. Registrar las discontinuidades en vez de inventar correcciones.
5. Mantener en pausa la integración de los datos catastrales y el LiDAR mientras el autor no resuelva sus condiciones. La lámina de apertura y cierre de estaciones permanece solo como plan.

Fuentes iniciales para verificar:
- [OpenStreetMap y atribución ODbL](https://www.openstreetmap.org/copyright).
- [Overture Maps y sus datos](https://docs.overturemaps.org/).
- [GeoMedellín](https://www.medellin.gov.co/geomedellin/).
- [Datos oficiales de elevación de Colombia](https://www.colombiaenmapas.gov.co/).

## Fase 1 · Territorio y carga

Definir una representación versionada por sectores en coordenadas métricas y con identificadores estables. Cada sector conoce terreno, red vial, pasos, huellas, hitos y cobertura de los datos. Cargar primero el suelo y el corredor próximos y anticipar el desplazamiento. Mantener un respaldo visual y de colisión hasta que el reemplazo esté completo. Descartar trabajos obsoletos y liberar tanto CPU como recursos GPU. Un solo origen compartido debe alimentar física, navegación, interacción y render.

Diseñar la transición entre sector detallado y ciudad genérica sobre los mismos bordes y alturas. Evitar agujeros, edificios duplicados, saltos de cota y carreteras cortadas. Al salir del piloto se sigue recorriendo el mapa completo. No convertir la distancia en una barrera artificial.

La geometría y texturas se empaquetarán en el HTML offline con presupuesto por sector y por dispositivo. Las mallas se procesarán fuera del hilo principal cuando sea posible y tendrán respaldo. Se medirá el coste antes y después en arranque, memoria, cuadros p50/p95/p99, peor cuadro, descarga de recursos, coste de cambio de sector y tamaño del HTML. Usar el presupuesto de cuadros vigente de 20 ms p95 en celular como objetivo del proyecto, no como resultado medido.

## Fase 2 · Cámara, controles y escala

Construir una sola cámara del mundo que interpole entre cenital y acercamiento con sensación de tercera persona. Seguir la dirección de movimiento o mirada con amortiguación, una zona muerta y pausa de autoajuste tras mover la cámara manualmente. El usuario puede recenterar, acercar y alejar. La cámara evita entrar en terreno y edificios, con movimiento suave y tratamiento bajo puentes.

El control de dirección y la cámara se diseñan juntos. Probar varias formas de mantener estable el marco del joystick durante un gesto y documentar si resulta comprensible. El movimiento debe seguir la intención visual del jugador en giros de 90° y 180°, marcha atrás, parado, bajando de vehículo y con cámara manipulada. Medir con dedo real en ambas orientaciones antes de activar por defecto.

Usar metros y fichas de escala verificables para persona, bici, moto, auto, bus, tren, carril, puerta y altura de piso. Validar mediante una escena con todos los tamaños juntos, colisiones y cámaras a tres distancias. Las cotas de ejemplo no sustituyen mediciones de modelos reales.

## Fase 3 · Piloto 3D y arte

Levantar en el piloto calzada, andenes, senderos, cruces, estaciones, elementos con altura y vegetación 3D. Reutilizar los 12 mapas originales de fachada cuando encajen y elaborar materiales originales adicionales para muros, asfalto, concreto, árboles y mobiliario. Las fotografías se usan como referencia, con sus condiciones, y no se incorporan como texturas.

Modelar hitos a escala con LOD, colisión y anclaje en el terreno. Eliminar solo la geometría genérica que coincida espacialmente con un reemplazo. Mantener fachadas diurnas y emisión nocturna alineadas. Adaptar materiales y densidad a GPU, sombras y textura disponibles. Las alturas y edificios sin fuente se señalan como genéricos.

Aceptación del piloto: recorrido continuo a pie, bici, carro y transporte, de día y noche, con fotografías de comparación autorizadas, coordenadas y cotas verificadas, colisiones visibles y sin bloqueos, cámara usable y comparación de rendimiento. Una captura generada nunca certifica fidelidad.

## Fase 4 · Skateparks y parkour

Verificar cada parque existente, su ubicación real, dimensiones, entradas, rampas, bordes y restricciones de uso. Modelar rampas, bowls, cajones y barandas como geometría y colisión 3D, con superficie compartida por los cuatro juegos. Conservar pruebas de ruta y ofrecer un parque genérico solo donde se indique como ficción.

Crear interacciones de aproximación, salto, giro, aterrizaje, equilibrio y reinicio, con objetivos opcionales y puntuación explicada. Diferenciar a pie, bicicleta, patines y monopatín. Probar trucos en modo libre y en el modo dedicado con el mismo estado y reglas. En parkour a pie, añadir subir bordes, saltar, aterrizar y pasar obstáculos con animaciones, límites de altura, accesibilidad y recuperación, evitando atravesar muros o aparecer dentro de ellos.

## Fase 5 · Integración por juego

- **Motor City:** contrato de territorio y cámara, construcción de sectores, datos, validadores y pruebas. Compartir versiones identificadas, sin modificar el motor propio de otro juego por sorpresa.
- **Turno Cero:** primer contrato conectado al piloto, conducción y desplazamiento a pie, cámara coherente y métricas. Mantener historia adulta, guardados y actividades.
- **EnCicla:** adaptar el mundo 2.5D y sus cinco registros de skatepark a la representación 3D compartida. Comprobar estaciones, turismo, bicicleta y progresión.
- **El Metro:** integrar estación, peatón, vehículo y líneas sobre los mismos niveles. Reparar y verificar pausa, movimiento y lectura del entorno con los hallazgos de su auditoría.
- **Run Scooter:** reutilizar el parque y corredor para trucos, con cámara y colisiones adaptadas al corredor. Mantener su identidad familiar y comprobar que las maniobras responden igual en el mundo y en la actividad.

Las migraciones avanzan con adaptadores, versiones y pruebas propias. Una zona solo se declara compartida al comprobar coordenadas, límites, colisiones y resultados de la actividad en cada juego.

## Entregas y coordinación

Cada fase deja código, procedencia de datos y arte, pruebas reproducibles, capturas, medidas, presupuesto y un documento de relevo. Mantener una rama por tema y PR para Claude en cada repositorio. Evitar modificar zonas que otra IA haya reclamado sin avisar por el buzón.

La siguiente IA debe escribir su propio documento de contexto, actualizar el relevo y transmitir esa misma obligación a quien continúe. Debe enumerar las tareas pendientes, los riesgos y las pruebas que realmente ejecutó.
