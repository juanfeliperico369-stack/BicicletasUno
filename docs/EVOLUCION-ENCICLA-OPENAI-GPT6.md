# EVOLUCIÓN INTEGRAL DE JUEGA ENCICLA — OPENAI GPT-6
**Auditoría independiente, investigación comparativa, ingeniería de jugabilidad y plan de lanzamiento**  
**22 de noviembre de 2026 · Agente: OpenAI GPT-6 · Repositorio único de intervención: BicicletasUno**

> **Estado real:** análisis del código de la rama `ccr-6f184fb6-vtpkye` (EnCicla 2.1.0, anterior a las nuevas propuestas de Gemini), revisión de instrucciones y coordinación entre IAs, consulta de documentación oficial y cambios en `openai-gpt6/encicla-auditoria-20261122`. **Se ejecutaron pruebas automatizadas en Chromium/Playwright mediante GitHub Actions, además de tests aislados y compilación offline, todas exitosas.** No se ha probado manualmente en un teléfono Android/iOS físico ni se verificó un APK nuevo.

## 0. Decisiones irrevocables del producto

1. **EnCicla es un juego arcade, familiar, de exploración, movilidad y pequeñas historias**, no un simulador estricto ni una adaptación de violencia vehicular de GTA/PAKO.
2. **Mundo abierto accesible con un toque; absolutamente todas las actividades disponibles sin progresión obligatoria.** La narrativa, el aprendizaje, los oficios y la mejora de habilidades deben invitar, nunca bloquear.
3. **Una identidad geográfica y un estado de mundo.** Suelo, calles, edificios, alturas, estaciones, ciclista, vehículos, clima, hora, economía y NPC deben tener coordenadas y estados canónicos. La vista es una proyección; no crea otro mundo.
4. **Modos cerrados = experiencias del mundo:** mismas entradas, reglas, resultados y tiempo. Un cambio de vista 3D/cenital/primera persona/lateral/pixel debe conservar posición, velocidad, rumbo, personajes, actividad, hora y clima salvo que se active deliberadamente una prueba aislada del menú.
5. **La diversión antecede a la simulación:** aceleración pronta, freno confiable, steering legible, radios de giro cómodos, recuperación del choque, objetivos alcanzables y reintento inmediato. El modelo físico se inspira en la realidad; no reproduce sus inconvenientes.
6. **Endless runner sólo en ciclorrutas y ciclovías operativas**, siguiendo intersecciones y cambios reales de alineación, con ancho variable, rampas, obstáculos y plazas especiales para skate/BMX/parkour conectadas espacialmente.
7. **Sin internet para jugar y sin librerías externas de ejecución.** Se conserva el Motor del Valle propio de EnCicla; Motor City 4.5/4.6 es una referencia técnica, no una migración obligatoria.
8. **No se modifica motorcity, MetroZero ni RunRunZero.** Se pueden estudiar sus técnicas y copiar ideas implementables sin romper la separación entre juegos.
9. **Esencial:** diversión, educación en movilidad sostenible, curiosidad por el territorio y momentos contemplativos; cuatro objetivos que pueden convivir sin sobrecargar cada misión.

## 1. Inventario real y límites de la investigación

| Subsistema | Dónde está | Diagnóstico desde lectura estática |
|---|---|---|
| Construcción/offline | `tools/build.js`, `src/index.html`, `dist/juega-encicla.html` | Concatena archivos JS por orden alfabético y embebe cartografía/guiones. El standalone ronda 5,2 MB según informe v2.1, no medido de nuevo aquí. |
| Mundo y vías | `src/js/20-map.js`, `src/data/{valle,vias,sitios}.*`, `motor-valle/` | Cuadrícula, topografía, vías y lugares; el runner debe leer la geometría real y no una copia simplificada. |
| Vehículos | `25-vehiculos.js`, `30-ride.js`, `92-vehiculos.js`, `98q-manejo.js` | Existen bici, eléctrica, a pie, camión, scooter, monopatín, skate y patines. Ya se añadieron choque deslizante, asistencia y desatasco en v2.1. Falta matriz E2E de todos los vehículos y superficies. |
| Controles | `00-core.js`, `81-controles.js`, `88-camara.js`, `60-ui.js` | Hay joystick, flechas, sensor, cámara gestual, control de velocidad. No son evidencia de que funcionen en todos los modos. |
| Carrera 3D | `91-runner.js` | Minijuego con corredores predefinidos entre pares de puntos; entrada original posible desde cualquier lugar del modo libre. |
| Carrera de ciclorruta | `92-ciclovia.js`, `94-revolucion.js` | Usa polilíneas reales, pero el cálculo original de cercanía sólo comparaba el primer vértice; el Taller podía iniciar desde lejos. |
| Actividades/oficios | `50-modes.js`, `52-oficios.js`, `72-oficios2.js`, `91-modos.js`, `94-revolucion.js` | Muchos oficios y submodos ya existen. Necesitan catálogo trazable: entrada abierta, entrada cerrada, control, finalización, errores y persistencia. |
| Ciudad y vistas | `75-graficos.js`, `75-lugares3d.js`, `86-maqueta.js`, `88-camara.js` | El “3D” principal inspeccionado dibuja suelo/volúmenes y perspectiva en **Canvas 2D**, además de panorámica y pixel: es una representación 2.5D/proyectada, no todavía un pipeline 3D de geometría compartida plenamente navegable en primera persona. |
| Interfaz y accesibilidad | `60-ui.js`, `98r-hud.js`, `98y-tamano.js`, `96-accesible.js` | HUD contextual, tamaños y alto contraste ya tratados. Su diseño debe verificarse en 412×860, 860×412 y pantallas pequeñas. |
| Contenido RPG | `69-libre.js`, `83-guion.js`, `93-trama.js`, `contenido/guion/` | Misiones diarias, postales y personajes. Una historia con avance no debe condicionar la disponibilidad del mundo ni de los módulos. |
| Pruebas | `tests/run.js`, `tests/regresion-encicla.js`, `tests/revolucion-encicla.js` | Existen baterías históricas, pero sus reportes previos no prueban que la versión nueva sea fluida en teléfonos actuales. |

**Diferenciar de forma estricta:** *existente por código* ≠ *probado en ejecución* ≠ *jugable y pulido*. Es un principio de aceptación, no una cuestión de etiquetas.

## 2. Hallazgos concretos de la auditoría

### H-01 · Distancia equivocada a la ciclorruta — CORREGIDO EN ESTA RAMA / PENDIENTE EJECUTAR PRUEBAS
`TramoCiclista.cercana` comparaba `hypot(via.p[0]-pos.x, via.p[1]-pos.y)`, es decir, **el primer vértice** y no la línea de segmentos. Una ciclovía que atraviesa la posición del jugador puede perder frente a otra cuyo origen está más cerca pero el recorrido queda más lejos. Además un tramo seleccionado empezaba en su kilómetro cero, aunque el jugador estuviera incorporándose en la mitad.

**Corrección aditiva:** `src/js/99r-ciclo-geometria-gpt6.js` proyecta sobre cada segmento, filtra polilíneas degeneradas/cortas, devuelve progresiva en metros y usa ese desplazamiento al iniciar `TramoCiclista.punto(0)`. Sólo consulta la red en operaciones de inicio, no por fotograma. **Prueba redactada:** `tests/prueba-gpt6-ciclorrutas.mjs`.

### H-02 · Carrera Run 3D abierta desde cualquier carretera — MITIGADO / PENDIENTE INTEGRACIÓN DE GEMINI
`ModeUsuarioR.iniciarRunner3D()` selecciona un corredor por **distancia al punto medio de un segmento fijo**; no comprueba que se esté sobre ciclorruta. Desde el Taller, `CarreraCiclovia` también puede abrirse con `tramoCerca()`, cuyo respaldo elige una ruta en el centro del mapa si no hay otra.

**Corrección aditiva:** el runner clásico en mundo libre comprueba cercanía a un trazado de bici (12 m) o `TT.CICLO`/ciclovía dominical habilitada; el Taller sólo abre la carrera de ciclorruta si se está junto a una geometría de ciclorruta real; los niveles independientes del menú siguen abiertos. El camión no puede entrar en la carrera para bici/skate. **Pendiente:** reemplazar los corredores de `MGRunner3D.posMapa()` por una ruta y cámara realmente ancladas a la malla vial y respetar continuidad al salir.

### H-03 · Velocímetro de Run 3D subestima la velocidad — CORREGIDO EN ESTA RAMA
En `src/js/91-runner.js`, el motor usa `this.spd` en **m/s** para sumar `this.distM += this.spd * dt`. Pero en el HUD convierte a km/h usando `this.spd * 2.4`. La conversión correcta de m/s a km/h es **×3,6**; a 12 m/s el HUD anterior mostraba ~29 km/h cuando deberían ser 43,2. Se corrigió el factor en **una línea** de `src/js/91-runner.js`, sin cambiar física ni distancia. Revisar en la integración Gemini si esa rama también modifica el HUD.

### H-04 · El tiempo de juego puede desacelerarse bajo caídas de FPS — RIESGO FUNDADO EN CÓDIGO
`src/js/60-ui.js` usa `dt = min(0.05, (t-last)/1000)` y sólo un `mode.update(dt)` por cuadro. Si el navegador tarda 90 ms en presentar uno, la simulación sólo avanza 50 ms. Eso protege de saltos bruscos, pero dilata reloj, desplazamiento y temporizadores en dispositivos lentos. **No conviene cambiar esta función a ciegas**: requiere pruebas sobre los modos existentes, pausa, submodo y WebRTC. Plan: acumulador a paso fijo (1/60 s, máximo 4 pasos, descarte explícito tras pausa), separación entre reloj simulado y tiempo real, y pruebas contra caídas artificiales de 16/33/66/100 ms.

### H-05 · Geometría de perspectiva no equivale al mundo 3D — BRECHA ARQUITECTÓNICA
`src/js/75-graficos.js` hace extrusión/proyección sobre Canvas 2D; `86-maqueta.js` genera otra representación dimétrica; `91-runner.js` emplea corredores/proyección propia; `92-ciclovia.js` dibuja su propia vía. La superficie no siempre procede del mismo `Transform` y `WorldGraph`. **No se arregla simplemente cambiando `vista='primera'`**: se necesita un grafo geográfico único que sirva a simulación y renderizadores, y, si se desea 3D libre real, una ruta gradual hacia mallas 3D/WebGL nativo sin añadir motores en paralelo.

### H-06 · El bucle de entrada tiene modos diversos y requiere QA
El control flotante tiene zona muerta y curva no lineal; el joystick tiene dirección de mundo y el modelo físico suaviza giro. Ya hay `blur` que limpia teclas, y `pointercancel`. Verificar además `lostpointercapture`, cambio de pestaña, rotación de pantalla, control no dominante, teclas simultáneas y botón contextual; no afirmar que están rotos sin reproducción.

### H-07 · Documentos y ejecutables pueden divergir
Hay resultados anteriores reportados en `docs/REVOLUCION-2.1.md` y `docs/INFORME-MOTOR-CITY-4.5.md`, mientras que `main` está detrás de `ccr-6f184fb6-vtpkye`. Un enlace GitHub Pages o APK podría servir una build distinta al código auditado. Publicar sólo con hash de build, manifest de pruebas y política de conservar `/metro/`.

## 3. Investigación comparativa orientada a decisiones, no a copiar mecánicas

Estas referencias se investigaron por documentación oficial, fichas de tienda o diseño conocido; **no se reivindica haberlas jugado personalmente en esta sesión**. Cada fila responde a “¿qué mejora EnCicla realmente?”.

| Referencia | Principio verificable/diseño | Aplicación precisa a EnCicla | Qué NO copiar |
|---|---|---|---|
| **Super Arcade Racing** (prioridad máxima) | Vista cenital 2D, control accesible, agarre y mejoras, vueltas legibles, feedback inmediato | Perfil de bici “Arcade A”: respuesta directa, curvas con radio predecible, trazada anticipada, flechas, reloj y reintento en 1 toque; rutas sobre geometría del Valle | No convertir una bici en auto de carreras con derrape exagerado ni exigir dinero para desbloquear control básico |
| **PAKO / PAKO 2/3/Forever** | Esquivar tráfico, leer obstáculos y sostener la presión | Entregas urgentes y slalom no violento en zona de ciclorruta; colisiones recuperables, persecución del tiempo, rutas alternativas | Atestar la ciclovía de coches policiales o choques letales |
| **#DRIVE** | Flujo continuo, horizonte y curvas intuitivas | Ruta larga de cicloturismo con clima, controles sostenibles y paisaje cambiante | Un solo camino recto o conducción a alta velocidad obligatoria |
| **GTA 1/2/London/Chinatown** | Ciudad entendible desde arriba, distritos y actividades cortas que dan contexto | Mapa legible, misiones de barrios, señales y eventos geográficos; pausas narrativas y microactividades | Violencia, delitos y estructuras ajenas a la misión educativa familiar |
| **Forza Horizon / NFS / FR Legends / APEX Racer** | Contraste entre práctica libre, retos acotados y personalización del tacto | Festivales ciclistas, contrarreloj, fantasmas y tres perfiles de sensibilidad; talleres sin progresión forzosa | Recompensas que obliguen a grindear para poder jugar |
| **Alto’s Odyssey** | Control simple, combos, biomas y disfrute de contemplar | Runner por ciclorrutas, encadenar saltos y maniobras, descansos y modo paseo sin presión | 3 carriles infinitos planos sin curvas o visitas al territorio |
| **Vector / Shadow Fight 2** | Silueta, anticipación y animación legible | Parkour peatonal o skate delimitado a parques y plazas aptas; anticipar salto/aterrizaje | Combate que eclipse el contexto de movilidad |
| **Monument Valley / Infinity Loop / Laser / Maze** | Claridad de interacción, puzzles de geometría y descubrimiento | Desafíos de señalética, rutas accesibles, redes de estaciones y cruces; una solución visual que enseñe | Alterar geografía verosímil del Valle con estructuras imposibles en el mapa principal |
| **Traffix / Railways / Package Inc** | Sistemas pequeños de rutas y prioridad, consecuencias visibles | Microgestión de estaciones EnCicla, despacho de camión, distribución de bicicletas y cruces seguros; mismo inventario real del mundo | Menús abstractos desconectados de la ciudad y de las bicicletas visibles |
| **911 Operator** | Decisiones de recursos ante incidentes simultáneos | Atender llamadas de averías/reubicaciones y priorizar estaciones con escasez; competencia logística pacífica | Emergencias extremas como eje del juego infantil |
| **Idle Supermarket Tycoon / The Bonfire** | Bucles de mantenimiento y mejora con progreso observable | Modo gestor opcional de taller de bicis y sistema público: inventario, repuestos, turnos, satisfacción | Producción “idle” que juegue por el usuario y haga innecesario moverse por el mundo |
| **The Sims / Cities: Skylines / TheoTown / SimCity** | Ciudad como sistema, habitantes con rutinas y necesidades | NPC viajan por estudio/trabajo, ocupación y clima; observatorio de ruido, emisiones y conectividad | Simular todos los hogares/carreteras a resolución máxima |
| **Tiny Rails / TrainChu / CityRT** | Escala de transporte y relato en cada parada | Conexiones metro/bici, retos de intermodalidad, tiempo de trasbordo y paseo guiado | Operar trenes como núcleo de EnCicla (eso corresponde a El Metro) |
| **Sky: Children of the Light / A Short Hike / Season** | Moverse por curiosidad, exploración amable y momentos de pausa | Postales, sitios de observación, conversaciones breves y encuentros opcionales; recompensas narrativas por explorar | Perder el enfoque en el manejo y la bicicleta |
| **Bullet Echo / Hunter Assassin** | Visibilidad clara, radar, lectura angular y conos de visión | Lectura cenital de vehículos, peatones y cruces; luces nocturnas y caminos seguros | Armas, espionaje y violencia |
| **WorldBox / Townscaper / Solar Smash** | Sistemas emergentes y lectura visual de macroescala | Microclima, cambios de actividad por barrio y creación procedural acotada del mobiliario | Destrucción indiscriminada del mundo/civilizaciones |
| **Real Flight Simulator / Spaceflight Simulator / 1945 / Missiles** | Gestión de cámara, instrumentos y trayectorias claras | HUD de rumbo, velocidad, pendiente y altitud en ciclismo; contrarreloj lateral/vertical sólo donde funcione mejor | Incluir aviones o armas sin relación con EnCicla |
| **Little Nightmares** | Detalle espacial y orientación por luces/silueta | Atmósfera en túneles y zonas cubiertas, escenas de exploración ligera y sonido ambiental | Terror incompatible con todo público |

**Fuentes principales consultadas:**  
- Super Arcade Racing, desarrollador OutOfTheBit, [Google Play](https://play.google.com/store/apps/details?id=com.outofthebit.superarcaderacing) y [App Store](https://apps.apple.com/us/app/super-arcade-racing/id1475696633) (vista cenital, controles simples, mejoras de agarre).  
- [Alto’s Odyssey, dossier oficial](https://altosodyssey.com/press/) (controles de un toque, combos y objetivos).  
- [ustwo: Monument Valley](https://ustwo.com/work/monument-valley/) (diseño espacial y puzles).  
- [Godot: optimización 3D](https://docs.godotengine.org/en/stable/tutorials/performance/optimizing_3d_performance.html) (LOD, culling, instancias; **referencia conceptual, no dependencia de Godot**).  
- [MDN: Optimizing Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas), [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [imageSmoothingEnabled](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled) y [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas).

## 4. Contrato técnico de un solo mundo (la evolución imprescindible)

**Estado único mínimo de entidad**:

```js
WorldEntity = {
  id, tipo, transform: { x, y, z, yaw }, // coordenadas canónicas y niveles
  movimiento: { vx, vy, vz, velocidad, giro },
  superficie, collider, renderArquetipo, interactuable, persistencia
};
```

**El grafo vial** tiene nodos con `id, x,y,z,nivel`; aristas con polilínea y longitud acumulada, conectores, restricciones, ancho por muestra, pendiente, señalización, sentido, estado de apertura y permiso (a pie/bici/skate/camión). Todas las carreras y rutas usan `RouteCursor { edgeId, sMetros, lateralMetros, heading, velocidad }`; no agregan coordenadas de una pista artificial. En intersecciones se elige entre aristas conectadas, visualmente antes del giro. **Ningún tramo puede saltar a una arista que sólo se acerque en 2D pero esté a otra altura o no esté conectada.**

**Vistas que deben derivarse de ese mismo estado:**
- **Cenital 3D:** cámara ortográfica/oblicua sobre entidades con alturas, sombras, cubiertas y destellos semánticos para leer estaciones.
- **Oblicua/panorámica:** rotación y elevación graduadas, límites de zoom y clip; oclusión de edificios entre cámara y ciclista con transparencia temporal.
- **Tercera persona:** seguimiento del mismo `WorldEntity`, suavizado de cámara (no de la física), obstáculos y tráfico a escala.
- **Primera persona:** ojo a altura de ciclista, manillar/cuerpo de propia bici, colisión y rumbo idénticos. No “generar una nueva ciudad” al pulsar el botón.
- **2D lateral:** una cámara sobre la trayectoria real y una proyección en perfil de suelo/alturas; todo sigue pasando en las coordenadas canónicas aunque cambie la interacción de salto.
- **Pixel world:** un filtro de rasterización, atlas de arte y/o un modo que lo justifique; el pixel art **no** puede modificar la geometría física ni crear tráfico paralelo.
- **Mapa/maqueta:** vistas de inspección del mismo `WorldGraph`; la maqueta puede usar simplificación visual, nunca inventar rutas.
- **Horizontal/vertical:** distribución del HUD según aspecto, nunca reescalar velocidades u objetivos por orientación.

**Transición de submodo sin teletransporte:** snapshot de `entityId, transform, hora, clima, inventario, reputación, vehículos, entorno`; submodo utiliza una `RouteCursor` ligada a aristas reales; salida devuelve progreso a ese mundo (distancia/estado real) y persistencia, no reinicia el barrio ni cambia el reloj arbitrariamente.

**Motor visual:** mientras EnCicla use Canvas 2D, se puede mejorar textura/proyección sin prometer primera persona 3D auténtica. Para la meta 3D completa se recomienda **WebGL2 nativo** en un canvas propio integrado en el mismo HTML offline, con fallback Canvas 2D/LOD, y con objetos que consumen ese `WorldGraph`, *no* un motor con un mapa independiente. Proyecto de arquitectura progresiva, no hotfix.

## 5. Jugabilidad: un “contrato de conducción” por vehículo

Primero crear tabla `vehiculo × suelo × vista × dispositivo × submodo` con pruebas reproducibles. **Una bicicleta de EnCicla tiene que sentirse distinta de skate, eléctrico, patines y camión**, pero todos precisan movimiento válido.

**Rangos de ajuste propuestos para playtesting (NO mediciones de la versión actual):**
- Inicio de marcha perceptible en menos de 0,25 s tras input; primer metro sin sensación de bloqueo.
- En ciudad, bici a ritmo arcade entre 18–35 km/h y “rápida” hacia 40–45 km/h en recorridos de juego apropiados; skate/patines con acceleración y giro más ágil, camión con menor giro y respuesta más lenta **pero no inútil**. Las velocidades excedidas son de *ficción arcade*, no recomendaciones reales.
- Curvas: limitar la velocidad en ángulo cerrado de forma continua; giro anticipado, no invertir rumbo instantáneamente a 40 km/h.
- Colisión lateral: deslizar; frontal: frenar + recuperación visible; sin enganchones en vallas o esquinas.
- Joystick: zona muerta configurable, sensibilidad inicial más alta, opción acelerador sostenido y control de frenado separado para vehículos de ruedas. En PC WASD/flechas; móvil con 2 pulgares si hace falta, pero acción primaria con uno cuando sea viable.
- Tutorial: tres acciones voluntarias — mover, frenar y saltar/usar timbre — sin modal automático.
- Reiniciar reto en 1 toque; no descontar recursos, monedas ni progreso general por fallas de aprendizaje.

La velocidad medida en el mundo debe concordar con el HUD, la distancia, la duración y la economía: **no son cuatro escalas independientes**. Un vehículo puede usar un multiplicador arcade de desplazamiento si el reloj y el cronómetro se mantienen explícitos, no por trucos invisibles.

## 6. Catálogo de modos: todos cerrados y abiertos con paridad

| Experiencia | Acceso desde mundo | Versión cerrada | Requisito de jugabilidad/resultado |
|---|---|---|---|
| Paseo libre y observación | Siempre | Paseo fotográfico | Sin metas obligatorias, puntos de contemplación, clima/hora consistente |
| Carrera de postales / contrarreloj | Arco, señal o evento en ciclovía | Menú directo | Mismo trazado, colisiones, cronómetro y recompensa |
| Run 3D en ciclorruta | Sólo junto a corredor real / ciclovía activa | Tres niveles seleccionables | Curvas y bifurcaciones de la malla, cambios de ancho, saltos, sin teleport |
| Carrera de ciclorruta (3 carriles) | Al incorporarse a vía habilitada | Tres niveles directos | Lado y cámara alternables; predicción de obstáculos; retorno al mismo mundo |
| Skate, patines, BMX, parkour | Parques y spots construidos y señalizados | Entrenamiento y retos | Trucos/cadenas, zonas permitidas, posición compartida, fallos recuperables |
| Estación EnCicla | Cada estación del mapa | Oficio Usuario/Anfitrión | Anclar, prestar, revisar bicicletas reales; sin pantallas fantasma |
| Taller de mantenimiento | Taller existente y señales de avería | Oficio Mecánico | Diagnosticar y reparar componentes; vehículo realmente recuperado |
| Reequilibrio de bicicletas | Depot o camión de Balance | Oficio Balance/Bodega | Carga/descarga y ruta visible, inventario persistente |
| Planificación de rutas | Mapa/centro de control | Oficio Supervisor/Traffix/Package-like | Resolver escasez de bicicletas con prioridades y efectos visibles |
| Ciudad y transporte intermodal | Paradas/estaciones | Reto de conexión bici-metro | Tiempo de trasbordo, itinerario seguro, curiosidad por sistemas de transporte |
| Subtramas y escenas RPG | NPC físico, casa, parque, monumento | Álbum narrativo y retos opcionales | Diálogos breves y consecuencias locales; trama sin puertas bloqueadas |

**Criterio de paridad:** un test automatizado debe tomar cada modo del registro `JE.modos/ROLE`, arrancarlo desde el menú y desde un marcador del mapa, ejecutar 10 s con bot/input sintético, terminar, y comparar campos `worldId, modeId, routeId, seed, resultado, hora` bajo tolerancias. Nada con botón activo y constructor que falla, vehículo quieto, duración nula o salida sin retorno es “terminado”.

## 7. Runner de ciclorrutas con calles reales, no un túnel falso

Diseño recomendado con `RouteCursor`:
1. Cerca de la entrada medir distancia **al segmento** (corregido por GPT-6). Rechazar fuera de ciclorruta, salvo entradas explícitas a menú cerrado.
2. Clasificar ancho real por muestras: 1, 2 o 3 zonas jugables según ancho **sin llamar “carril” a un tramo estrecho de un solo espacio**.
3. Al acercarse a un cruce (20–40 m en la escala de juego), anticipar con flechas y colores las salidas conectadas; si no hay elección, seguir continuidad real.
4. Obstáculos con “fair play”: espacio evitable, visión previa suficiente a la velocidad actual, máximo de obstáculos consecutivos compatibles con el tiempo de reacción y una ruta siempre posible.
5. Skatepark/spot: área georreferenciada dentro del mundo y puerta contextual a su desafío. Entrar/salir no cambia la ciudad ni crea un circuito virtual sin ubicación.
6. Las rampas del runner pueden modificar `z` del mismo `Transform`; aterrizar en plataforma válida o caer con fallo amable y recuperación inmediata.
7. “Infinito” significa contenido repetible sobre un circuito/grafo real o ramificaciones conectadas; se acepta volver por el mismo tramo o variación controlada, **no** teletransporte disfrazado.

**Regla algorítmica de justicia:** antes de generar una fila, construir el espacio de acciones posible durante la ventana de reacción y garantizar al menos una trayectoria viable (cambiar carril, frenar, saltar, timbre). Si no existe, modificar el obstáculo o retrasar la fila.

## 8. Vivir la ciudad: RPG/rol sin duplicar sistemas

**Bucles de 2–8 minutos**, que conectan diversión, aprendizaje y curiosidad:
1. **La bici que faltaba:** una estación vacía reporta demanda; transportar dos bicicletas desde otra, aprender distribución, ganar reputación barrial.
2. **La ruta segura:** un vecino necesita ir a clase; elegir entre rapidez, exposición al tráfico y pendiente; la explicación posterior muestra el intercambio.
3. **Taller ambulante:** NPC avisa un freno duro; inspección con puzzle visual muy corto y retorno visible al vehículo.
4. **Ciudad silenciosa:** elegir ciclovía vs vía concurrida; comparar ruido en franjas y observar usuarios recuperando un parque, sin pretender cifras reales si no hay datos.
5. **Memoria del barrio:** recoger postales del Volador, Jardín Botánico, Estadio, Plaza Botero, etc.; cada lugar ofrece un dato verificable o una pregunta que despierte interés.
6. **Hora de cerrar:** distribuir bicicletas sin contradecir horarios de servicio; la bicicleta propia sigue permitiendo viajar cuando EnCicla esté cerrada.
7. **Guatapé** como excursión opcional, no como tramo mágicamente conectado al centro urbano si la ruta/rendimiento no son capaces de sostenerlo.

**RPG de consecuencias pequeñas**: reputación por trato amable, ayuda, rutas seguras y cuidado del equipo; no barreras. Las “mejoras” pueden modificar confort, feedback y estética; **no** quitar el control base a quien inicia.

**Mundo vivo económico:** estaciones prestan/reciben bicicletas, NPC toman decisiones a intervalos, la demanda cambia con hora/clima, y el jugador puede impactar el sistema. Para ahorrar CPU se simulan agregados por barrio fuera del radio de juego, agentes individuales dentro; resultados reproducibles con semilla.

## 9. Arquitectura visual y de arte: ambición con disciplina

La ambición “gráficos más realistas” significa **densidad de detalle, materiales coherentes, lectura espacial, escala y luces**, no polígonos sin límite:

- **Identidad del Valle:** alturas y pendientes respetadas; ladrillo visto, zócalos, fachadas, rejas, ventanas, balcones, cubiertas, vegetación estratificada, paraderos, señalética y ciclovías. Atlas por material reutilizado, variaciones por semilla; nada de repetir una fachada idéntica cada 10 m.
- **Bicicleta EnCicla:** proporción realista entre manillar, bastidor, canasta, eje de ruedas y pedales; giro visible de rueda, pedalada sincronizada con desplazamiento, sombra AO horneada y luces suaves; silueta reconocible cenital, lateral y en tercera persona.
- **Personajes:** una cabeza/cuerpo canónico y animaciones `idle/walk/ride/brake/turn/jump/fall/recover`. En 2D retratos y sprites desde el mismo diseño, no héroes con caras distintas entre cámara y diálogo.
- **Arte 2D:** carteles ilustrados, hojas, QR ficticios, placas, postales, texto claro y detalle urbano; no colisiones secretas por textura decorativa.
- **Pixel art:** escalado entero o sin suavizado cuando la vista requiera píxel nítido, separando capa HUD de alta resolución y textura/pixel de baja. `imageSmoothingEnabled=false` sólo cuando corresponda, no globalmente para todo 3D.
- **Luces:** diferencia reconocible mañana/tarde/noche; bici legible a contraluz; sombras baratas por distancia, priorizar iluminación del cruce y zonas de interés.
- **3 niveles de detalle:** cerca (modelos/mallas con detalle), medio (lotes con atlas, accesorios agregados), lejos (fachada simplificada/impostor), compatible con cenital y tercera persona. Edificios no visibles por cámara se descartan y colisiones se mantienen.
- **Arte técnico antes que imagen decorativa:** cada asset necesita `assetId, autor, licencia, escala, pivot, variantes, LOD, atlas, collider`. Prohibido material no autorizado y texturas sin manifiesto.

**Criterio de mejora visual:** comparar la misma esquina a la misma hora, ruta y cámara; evaluar legibilidad, tasa de FPS, continuidad entre vistas y memoria. No basta con un render artístico espectacular de una ciudad diferente.

## 10. Rendimiento para un mundo grande con pocos recursos

**Metas técnicas propuestas, por medir (no resultados):**
- Teléfono Android gama media, 412×860 y 860×412: **30 FPS sostenidos como piso jugable**, p95 de presentación `<=33,3 ms` en las rutas típicas, sin bloqueos largos; 60 FPS donde los recursos permitan. Medir FPS/p95/p99 por modo y vista, no promedio global.
- **Respuesta al control**: visible dentro del siguiente fotograma útil; ningún joystick que tarde un segundo en mover bici. Para sensación, medir además distancia recorrida, giro y frenada a 1 s, 3 s y 5 s.
- Arranque de sesión tras `JE.map.load`, importación de partida, entrada a Taller, cambio de cámara y subida/bajada del vehículo con perfil de tiempo y fallos.
- Detener generación de datos secundarios fuera del radio/sector activo; recargar sectores alrededor de la cámara sin renunciar a un solo `WorldGraph`.
- Vector/estación indexados por cuadrícula espacial o `R-tree` simple; **no** recorrer cada vía en cada `update()`; el parche de GPT-6 consulta geometría sólo cuando se selecciona una actividad.
- Canvas 2D: cachear calles estáticas por sector, separar capas de fondo/entidades/UI, evitar `getImageData` continuo; offscreen sólo con fallback medido; no volver a dibujar el atlas completo por frame.
- WebGL2 futuro: atlas de texturas, índices de vértices, agrupación de materiales, instancing para faroles/árboles, frustum/occlusion culling y LOD. Conservar Canvas2D como fallback y para los modos 2D/pixel.
- Tiempo: simulación a paso fijo o semi-fijo y presentación desacoplada. Reanudación tras suspensión con `dt` limitado, pero sin perder arbitrariamente tiempo durante caídas sostenidas de rendimiento.
- Telemetría local para pruebas: exportar JSON sin datos personales con versión/hash, dispositivo genérico, vista, modo, velocidad, tiempos por update/render y excepciones. Por defecto sólo durante QA.

**Presupuesto por sector:** medir triángulos/draw calls si se usa WebGL; en Canvas medir número de lotes, `drawImage`, texto y partículas. Cuando el percentil 95 caiga, retirar primero efectos lejanos/partículas/objetos no interactivos; **nunca** cambiar la geometría o el resultado del reto con la calidad gráfica.

## 11. QA obligado: salir del “se ve pero no se juega”

| Prueba | Casos obligatorios | Aceptación |
|---|---|---|
| Boot offline | `dist/juega-encicla.html` en PC y móvil, sin red | Carga mapa, permite ▶ Jugar en un toque, sin consola roja |
| Movimiento | 8 tipos de vehículo × asfalto/ciclovía/anden/pasto/pendiente × teclado/táctil | Avanza, gira, frena, puede desatascarse y no sale del mapa |
| Geometría de ciclorruta | Primer vértice lejano, segmento cercano, puntos degenerados, retorno de tramo | Selección por segmento, distancia y progresiva correctas; no teleport |
| Modo abierto/cerrado | Cada `JE.modos` y oficio | Entrada de menú, marcador en mundo, pausa, reintento, final y recompensa |
| Runner | Curvas de 90°, bifurcación, estrechamiento, obstáculos, skatepark, salida | Misma arista/nivel; ruta viable y controlable; sin activación fuera de vía |
| Cámara | Cenital, oblicua, 3.ª, 1.ª, lateral, pixel, maqueta; cambiar en marcha | Posición, rumbo, reloj y entidades iguales; sin clipping grave |
| Pantallas | 412×860, 360×740, 860×412, 1280×720 | HUD no tapa meta/ciclista, toca con ambas manos, texto legible |
| Rendimiento | 10 min exploración + 10 min runner + cambios cámara; CPU lenta ×4 | FPS/p95 declarados y trazas sin fugas de memoria |
| Guardado | V1 heredado, v2.1, vacío, corrupto, importado | Migración segura, sin duplicar recompensas ni perder bicicletas |
| Multijugador | 2–3 dispositivos reales y reconexión | Estados sincronizados, no alteraciones de progreso ni reloj |
| Accesibilidad | Alto contraste, reducir movimiento, joystick izq./der., sensores denegados | Alternativa jugable, controles visibles y sin bloqueos |

**Comandos de validación cuando la rama se incorpore al checkout local:**

```bash
node tests/prueba-gpt6-ciclorrutas.mjs
node tools/build.js
node tools/auditoria-mapa.js
node tests/run.js
# Sólo después: Chromium con inputs sintéticos y Android/iOS físicos.
```

**Ejecuciones verificadas en GitHub Actions:** [CI de geometría/build](https://github.com/juanfeliperico369-stack/BicicletasUno/actions/runs/45034570000) (unitaria, `node tools/build.js` y `node tests/prueba-niveles.mjs`, verde) y [Chromium/Playwright](https://github.com/juanfeliperico369-stack/BicicletasUno/actions/runs/45034570068) (`node tests/run.js --n=8 --shots`, **TODAS LAS PRUEBAS PASARON**). Incluye bot de minijuegos, carriles, movimiento táctil, vistas, modos, guardado, rendimiento en CPU emulada lenta y WebRTC tres sesiones. El archivo `tools/auditoria-mapa.js` **no se ejecutó** en estos workflows. La verificación física Android/iOS y el APK siguen pendientes. Tras la corrección final del HUD, repetir los workflows en el nuevo hash.

## 12. Priorización y entregables por etapa

| Etapa | Prioridad | Entregables verificables | Regla para darla por terminada |
|---|---|---|---|
| **E0 — Rescate de control y modos** | P0 inmediata | Matriz de ocho vehículos y todos los modos; arreglar constructor, aceleración, joystick y finalización; selector de ciclorrutas corregido | 100% modos arrancan/finalizan; ningún vehículo inmóvil; tutorial opcional; todos libres |
| **E1 — Contrato espacial** | P0 | `WorldGraph/RouteCursor`, transiciones sin teleport, runner en vías reales, cruces/anchos/obstáculos justos | Mismo transform y hora al cambiar modo/cámara y salir |
| **E2 — Mundo vivo y utilidad** | P1 | Docks/talleres/gestión y microtramas, NPC por barrio, estaciones que modifican inventario | 10 actividades variadas jugables desde lugar real, repetibles sin grind |
| **E3 — Nuevas vistas y arte** | P1/P2 | 3D nativo incremental, LOD, fachadas y vehículos detallados, efectos y versiones 2D/pixel con misma geometría | Capturas comparables y FPS dentro de presupuesto |
| **E4 — Pulido y publicación** | P0 de salida | QA físico Android/iOS, hash/build reproducible, PWA/APK, preservación `/metro/`, rollback | Sin regresiones en guardado; release completa y jugable |

**Orden correcto:** no resolver E3 mediante un “juego 3D nuevo” antes de E0–E1. Se puede mejorar arte 2D ahora, siempre que no se sacrifique la jugabilidad.

## 13. Coordinación de las tres IAs y fronteras

Se consultó el Issue [#2, Coordinación IA](https://github.com/juanfeliperico369-stack/BicicletasUno/issues/2), `coord/agentes/antigravity.json`, `coord/agentes/codex.json`, los buzones y `docs/INFORME-MOTOR-CITY-4.5.md`.

**22-nov-2026, información de Gemini en el Issue:** trabaja en `99n` controles/desbloqueo, `99o` cámaras, `99p` runner/skate y `99q` RPG; reportó además correcciones en vehículos/arte/CSS. Claude tendría el rango `99a–99m`. Estos informes del Issue **no equivalen a integración ni pruebas nuestras**.

**OpenAI GPT-6 reclama:** `src/js/99r-ciclo-geometria-gpt6.js`, `tests/prueba-gpt6-ciclorrutas.mjs`, `docs/EVOLUCION-ENCICLA-OPENAI-GPT6.md`, `coord/agentes/openai-gpt6.json`, buzón propio y workflows `.github/workflows/openai-gpt6-*.yml`. **Cambio compartido adicional, avisado en Issue #2:** una línea de `src/js/91-runner.js` para corregir km/h. No se tocan archivos de Gemini (`99n–99q`), Claude (`99a–99m`), `dist` ni otros repositorios.

**Relevo a Gemini:** incorporar `CicloGeo.cercana/acceso` o adaptar a su propia `99p`; conservar la corrección **ya aplicada** de H-03 (m/s ×3.6); asegurar que el runner tras cruce conserve `RouteCursor`. No duplicar guard de contexto si su módulo ya trae otro; mantener ambos compatibles. **Relevo a Claude:** H-04 (delta de tiempo), catálogo E2E de modos y futura refactorización de geografía/cámara.

**Regla de mezcla:** antes de fusionar, comparar `99n–99q`, nuestros wrappers y `Mode.prototype.runSub`; ejecutar pruebas en branch integrada y **regenerar** `dist`, nunca fusionar HTML compilados a mano. La referencia pública de la build debe apuntar al commit integrado, no a `main` anterior.

## 14. Bitácora de esta intervención OpenAI GPT-6

- **Código añadido:** corrección geométrica de distancia a polilínea, progresiva en metros y entrada anclada; guard contextual de runner 3D y CarreraCiclovia en Taller, permitiendo niveles del menú; conversión m/s→km/h corregida en el HUD de Run 3D.
- **Pruebas escritas y ejecutadas:** dataset sintético con rutas de inicio lejano, paralela y degenerada, acceso próximo/lejos, camión, ciclovía dominical y menú cerrado. CI de compilación HTML offline y prueba de niveles verde. Playwright/Chromium corrió el suite completo: [ejecución verde](https://github.com/juanfeliperico369-stack/BicicletasUno/actions/runs/45034570068), [14 archivos de resultados/capturas](https://github.com/juanfeliperico369-stack/BicicletasUno/actions/runs/45034570068/artifacts/14758294358). En CPU emulada lenta, registró p95 de cuadros: Usuario 33,4 ms, Anfitrión 16,8 ms, Monitoreo 16,8 ms. Son mediciones de CI, **no** de teléfono real.
- **Investigación:** lectura técnica de arquitectura y juego existente; benchmark desde fichas oficiales y MDN/Godot; matriz de implementación realista por valor y coste.
- **No hecho:** no se probó el juego manualmente en teléfonos reales, no se midió FPS en hardware Android/iOS, no se generaron GLB ni assets nuevos, no se comprometió `dist` (el CI sí generó HTML compilado), no se publicó una nueva APK ni se actualizó GitHub Pages.
- **Siguiente paso de integración:** repetir CI tras último cambio de HUD, comparar rama nueva de Gemini/Claude y corregir incompatibilidades si aparecen; ejecutar E2E físico Android/iOS; fusionar sólo tras validación. No desplazar el trabajo de otras IA ni desplegar sin aprobación.

**Conclusión:** la experiencia no se vuelve completa por sumar géneros o más botones. Se vuelve completa cuando **cada interacción mueve algo real del mundo, responde de inmediato y produce una consecuencia clara**. La mejor evolución de EnCicla es una ciudad viva y coherente que se juega con libertad, de forma divertida y con curiosidad; no ocho mundos simulados con ocho cámaras inconexas.
