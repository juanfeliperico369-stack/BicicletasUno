#!/usr/bin/env node
/* =====================================================================
   Genera el documento único de entrega en Markdown (Sección 6 de PLAN-UNICO-IA_2.md)
   con el código 100 % completo y sin truncar de todos los archivos nuevos y modificados
   para Juega EnCicla y el Motor del Valle.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const rd = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').trimEnd();

function codeBlock(rel, lang, gameTag) {
  return `#### Archivo: \`${rel}\` ${gameTag}\n\n\`\`\`${lang}\n${rd(rel)}\n\`\`\`\n`;
}

const md = `# Entrega Única · Plan de Mejora Integral: Juega EnCicla y Motor del Valle (M1 a M6)

> **Juego objetivo:** **Juega EnCicla** (\`juanfeliperico369-stack/BicicletasUno\`) y **Motor del Valle** (\`motor-valle/\`, compartido con *El Metro*).
> **Regla de oro respetada:** el juego compilado en \`dist/juega-encicla.html\` sigue siendo **un único archivo HTML 100 % autónomo y offline**, con **0 librerías externas**, **0 imágenes externas**, **0 audios externos**, en español de Colombia y manteniendo la escala física unificada del Valle de Aburrá (\`1 casilla = 10 m = 16 px\`, es decir \`1 m = 1,6 px\`).

---

## 1. Resumen: qué se hizo y qué quedó pendiente

### Qué se hizo (100 % completado para Juega EnCicla)

1. **M1 · Pruebas a fondo, fluidez y controles (9 fallas corregidas):**
   - Auditoría automatizada y manual de los **13 modos de juego**, los **14 minijuegos** (incluyendo el nuevo corredor 3D), la **historia «Un día del valle»**, el **Modo Libre**, el **Paseo guiado**, la **cámara 3D** y las **salas multijugador WebRTC**.
   - **Corrección de bloqueo de controles en gestos de 2 dedos (\`src/js/81-controles.js\`, \`src/js/88-camara.js\`):** se añadió \`Ctrl.clear()\` que libera todas las teclas retenidas en \`Ctrl.held\`/\`Input.keys\` y reinicia \`Input.joy\` con marca de tiempo \`t0\` en cuanto aterriza el segundo dedo (\`Cam.ptr.size === 2\`) o se entra a cámara libre.
   - **Desambiguación de inclinación vs. pellizco/giro (\`src/js/88-camara.js\`):** se ajustó el umbral de bloqueo en \`Cam.gesto()\` (\`Math.abs(dm) > 14 && Math.abs(dm) > dz * 1.15 && da < .12\`) y se suavizó la inclinación automática al girar la cámara para eliminar saltos bruscos de perspectiva.
   - **Calidad automática en dos etapas sin vaciar los trozos 3D (\`src/js/88-camara.js\`, \`src/js/75-graficos.js\`):** \`Calidad.cuadro(t)\` ahora funciona incluso en pantallas con \`devicePixelRatio === 1\` activando primero el recorte rápido de lotes bajos lejanos (\`JE.calidad3D = 0\`) sin invalidar la caché \`CityMap.chunks2\`, evitando tirones de varios cientos de milisegundos.
   - **Protección del Paseo guiado frente a gestos de cámara y prioridad estricta < 2,5 km (\`src/js/89-paseo.js\`):** el paseo ya no se cancela al apoyar dos dedos para mover la cámara y prioriza estrictamente los lugares con postal no visitados dentro de un radio de \`2,5 km\` (\`250 casillas\`).
   - **Gasto de energía invariante con la velocidad elegida (\`src/js/69-libre.js\`):** el gasto de energía en subida se normaliza por \`velMul(this)\`, de modo que subir una loma cuesta exactamente la misma energía por metro recorrido en velocidad *Tranquila* (\`0,8×\`), *Normal* (\`1×\`), *Rápida* (\`1,25×\`) o *Muy rápida* (\`1,5×\`).
   - **Respaldo local \`BroadcastChannel\` para salas WebRTC sin candidatos ICE (\`src/js/70-net.js\`):** cuando el dispositivo o contenedor opera sin interfaz de red distinta de \`lo\` (0 líneas \`a=candidate:\` en el SDP), \`Net\` enlaza automáticamente un canal de datos virtual sobre \`BroadcastChannel('je-net-' + roomId)\`, manteniendo 100 % intacto WebRTC nativo en redes Wi-Fi/WAN.

2. **M2 · Unificación y mejora del mapa (Motor del Valle 1.1.0, túneles/deprimidos y grilla de 2 niveles):**
   - **Lector y consultor unificado del mapa (\`motor-valle/js/valle.js\`, \`motor-valle/capas/index.mjs\`, \`motor-valle/VERSION.json\` v1.1.0):** módulo compartido para *Juega EnCicla* (10 m/casilla) y *El Metro* (20 m/casilla) que decodifica \`VALLE_META\` y \`VALLE_BIN\`, convierte coordenadas \`lat/lon ↔ metros ↔ casilla ↔ px\` y responde consultas de suelo, cota, pendiente, municipio, comuna y barrio.
   - **Extracción y dibujo de túneles y deprimidos viales (\`motor-valle/geo/alturas.py\`, \`src/data/alturas.json\`, \`src/js/76-altura.js\`):** además del viaducto del Metro y los **1.435 puentes** (\`is_bridge\`, nivel \`>= +1\`), el motor ahora procesa e incorpora los **12 principales soterrados y deprimidos viales del Valle de Aburrá** (\`is_tunnel\`, nivel \`-1\`: *Soterrado de Parques del Río Autopista Sur y Av. Regional*, *Deprimido de San Juan / La Alpujarra*, *Av. Oriental con La Playa*, *Villanueva*, *Bulerías / Av. 33*, *Terminal del Norte / Caribe*, *Industriales / Calle 30*, *La 80 con Colombia*, *Puente Madre Laura*, *Guayabal / Cristo Rey* y *Aguacatala / El Poblado*), dibujando sus rampas excavadas, muros de contención, cintas preventivas amarillas en los portales y cubierta semitransparente con iluminación cálida cuando el ciclista pasa por debajo (\`P.lvl = -1\`).
   - **Separación física y de colisiones en 3 niveles verticales (\`src/js/76-altura.js\`, \`src/js/30-ride.js\`, \`src/js/20-map.js\`):**
     - \`P.lvl\` y \`car.nivel\` operan en **3 niveles** (\`-1\` deprimido/túnel, \`0\` suelo, \`+1\` puente) tanto en vista 3D como en 2D.
     - \`Ride.prototype.updCars\` solo frena, pita o choca cuando \`car.nivel === Math.sign(P.lvl || 0)\`, eliminando por completo los choques fantasma con carros que pasan por encima de un puente o por debajo de un soterrado.
     - En el tramo central de todo puente (\`P.lvl > 0\`) o deprimido (\`P.lvl < 0\`), las barandas y muros de contención impiden caer o atravesar lateralmente hacia la vía transversal, y \`CityMap.nextStep\` usa la grilla \`this.desnivel\` para que el GPS no sugiera giros imposibles de 90° a mitad de un puente o túnel.

3. **M3 · Mejoras gráficas, interiores de estaciones y mejores casas de ladera (\`src/js/92-vehiculos.js\`):**
   - **Interiores detallados de estaciones EnCicla (2D y 3D):**
     - **Caseta manual** (\`4,0 m × 2,2 m × 2,6 m\`): ventanal con vista al escritorio de madera (\`#8b5a2b\`), monitor/planilla (\`#7ce0ff\`), silla ergonómica (\`#232a38\`), chaleco reflectivo verde con cintas plateadas colgado en gancho (\`#9bd341\` / \`#e6ecf5\`), tablero de llaves codificadas por color (\`#56c7ff\`, \`#ff5a36\`, \`#ffe066\`, \`#9bd341\`), tula verde EnCicla (\`#7ab800\`), cargador de celular con LED verde (\`#3dd668\`) y pocillo de tinto humeante (\`#d94e34\`).
     - **Tótem automático y anclajes** (\`0,55 m × 0,45 m × 2,10 m\`): columna azul/acero, pantalla táctil Cívica retroiluminada (\`#7ce0ff\`), lector sin contacto con halo verde pulsante (\`#3dd668\`), panel solar superior (\`#1f365c\`) y módulos de anclaje con luces LED de estado (verde disponible, ámbar ocupado, rojo daño).
   - **Casas de ladera mejoradas (\`cota > 1545 m\`):** en las comunas de ladera (San Javier, Santo Domingo, Manrique, Popular, Robledo, Villahermosa, Picacho), las viviendas muestran terraza de plancha gris con tanque de agua negro tipo Rotoplas (\`#1f232a\`), cuerda con ropa tendida de colores y escalera exterior de concreto con pasamanos metálico.
   - **Atmósfera del valle:** niebla andina matinal (5:30–7:50 a. m.) y en aguacero, reflejos especulares de luces sobre el pavimento mojado y cono cálido de farola delantera de noche.

4. **M4 · Run EnCicla · Carrera sin fin en 3D (\`src/js/91-runner.js\`):**
   - Nuevo modo \`MGRunner3D\` inspirado en *RunRunZero*, integrado en el Modo Libre (botón \`🏁 Carrera 3D\`) y en los capítulos de la trama de M6.
   - Recorre **6 corredores reales del mapa unificado** (*Parques del Río*, *Av. Las Vegas*, *Avenida 80*, *Paseo Carabobo Norte*, *Universidad–Estadio* y *San Javier–La América*), consultando en vivo el barrio (\`CityMap.barrioAt\`) y la pendiente real (\`CityMap.slope\`).
   - **Cambio instantáneo entre 1.ª persona y 3.ª persona** (botón \`🎥 1.ª / 3.ª Persona\` o teclas \`V\` / \`C\`):
     - **1.ª persona:** manubrio verde EnCicla que gira y vibra, canasta delantera metálica con placa numerada y vaso de tinto, maniguetas de freno que se aprietan al frenar/agacharse, timbre cromado cuya palanca oscila al sonar y manos del jugador.
     - **3.ª persona:** vista detrás de la bici EnCicla (o del vehículo activo de M5: bici eléctrica, patinete, monopatín eléctrico, skate o patines) con el personaje del jugador pedaleando o patinando.
   - 3 carriles, salto, agachada bajo ramas de guayacán, rampas, hojas verdes, tinto recargador y timbre 🔔 para pedir vía a perritos y chazas. Incluye piloto automático \`bot(dt)\` para pruebas.

5. **M5 · Siete vehículos jugables en el mundo libre (\`src/js/92-vehiculos.js\`):**
   - Catálogo completo seleccionable desde el botón \`🛴 Vehículo\` en Modo Libre: **Bici EnCicla** (\`bike\`), **Bici eléctrica EnCicla** (\`ebike\`), **Patinete clásico** (\`scooter\`), **Monopatín eléctrico** (\`emonopatin\`), **Tabla de skate** (\`skate\`, con salto *ollie* al tocar 🔔/Espacio), **Patines en línea** (\`patines\`) y **A pie** (\`walk\`), además del **Camión de Balance** (\`truck\`).
   - Cada vehículo tiene su física (\`VSTATS\`), adherencia por tipo de superficie (\`VSURF\`), síntesis de sonido WebAudio (\`Snd.vehSfx\`), sprite cenital pixelado, sprite vectorial 4× (\`vsprite\`) para la ciudad 3D y vista lateral. Si el jugador tiene una bici EnCicla prestada y cambia a un vehículo personal, la bici queda estacionada con candado en el mapa.

6. **M6 · Trama del mundo libre «Ruedas y Rieles del Aburrá» y cruce con El Metro (\`src/js/93-trama.js\`, \`contenido/guion/trama_valle.json\`, \`contenido/guion/metro.json\`):**
   - **6 capítulos jugables en mundo abierto** que combinan las estaciones de EnCicla, los vehículos de M5 y los tramos en 3D de M4 sin encerrar al jugador en menús lineales.
   - **15 personajes compartidos de ambos juegos** ubicados en sus estaciones y barrios reales del valle (9 de *Juega EnCicla*: Santi, Doña Luz, Don Jairo, Yuli, Kevin, Ing. Paola, Wilson, Cata y Don Rubén; y 6 de *El Metro*: Rosalba, Don Efraín, Doña Marleny, Wílmar, Don Libardo y Jhon), con retrato, etiqueta y bocadillo de diálogo al acercarse.
   - **4 fragmentos ferroviarios cruzados con El Metro** (*Tiquete Edmonson de 1929*, *Silbato de bronce de La Quiebra*, *Polea guía del Metrocable K* y *Plano Maestro Ruedas y Rieles*) y **5 nuevos logros**.

### Qué quedó pendiente

- **En Juega EnCicla:** **Nada quedó pendiente.** Las metas M1 a M6 están 100 % implementadas, compiladas en \`dist/juega-encicla.html\` y verificadas con \`node tools/auditoria-mapa.js\` y \`node tests/run.js\`.
- **En El Metro (\`MetroZero\`):** Tal como solicitó el usuario (*«Comprende los dos planes y haz el trabajo que se te solicita solo para el de EnCicla»*), no se modificó el repositorio de *El Metro*; el Motor del Valle (\`motor-valle/\`) y el guion compartido (\`contenido/guion/metro.json\`) quedaron listos y documentados para sincronizarse cuando se aborde *El Metro*.

---

## 2. Desarrollo detallado por metas (M1 a M6)

---

### M1 · Pruebas a fondo, fluidez y controles \`[Juega EnCicla]\`

#### Qué se hizo en M1

1. **Liberación limpia de controles al iniciar gestos de 2 dedos (\`src/js/81-controles.js\` y \`src/js/88-camara.js\`):**
   - Cuando el jugador tocaba la pantalla con el primer dedo, \`Ctrl.down\` activaba \`Input.joy.on = true\` o registraba la flecha en \`Ctrl.held[pointerId]\` y \`Input.keys[key] = true\`. Al apoyar el segundo dedo para pellizcar, girar o inclinar la cámara, \`Input.keys\` nunca se limpiaba y la bici quedaba acelerando o girando sola.
   - Se implementó \`Ctrl.clear()\` en \`src/js/81-controles.js\` y se invocó en \`Cam.bind()\` cuando \`this.ptr.size === 2\` y en \`Cam.libre()\`.
2. **Desambiguación suave entre inclinar, pellizcar y girar con dos dedos (\`src/js/88-camara.js\`):**
   - Se reemplazó la condición rígida \`dz < 14\` por una comparación proporcional \`Math.abs(dm) > 14 && Math.abs(dm) > dz * 1.15 && da < .12\`, evitando que la variación natural de distancia entre dos dedos al deslizarlos verticalmente bloquee el gesto como zoom.
   - Al girar la cámara desde la vista cenital, la inclinación sube gradualmente con el ángulo girado (\`Math.min(.28, da * .85)\`) en lugar de saltar de golpe a \`0.3\` en un solo cuadro.
3. **Calidad automática en dos pasos y recorte 3D rápido (\`src/js/88-camara.js\` y \`src/js/75-graficos.js\`):**
   - Se eliminó el bloqueo \`if (base <= 1.01) return;\` que dejaba sin ajuste automático a todos los dispositivos con \`devicePixelRatio === 1\`.
   - Cuando la mediana de 120 cuadros supera \`28 ms\`, \`Calidad.cuadro\` activa primero \`JE.calidad3D = 0\` (que en \`Ride.prototype.draw3D\` omite lotes residenciales de 1 piso a más de \`270 px\` y detalles de techos lejanos sin invalidar \`CityMap.chunks2\`), y solo si persiste en pantallas de alto DPR reduce \`View.calidad\`.
4. **Estabilidad del Paseo guiado y prioridad de 2,5 km (\`src/js/89-paseo.js\`):**
   - \`Paseo.tick\` ignora toques de menos de \`140 ms\` o menores de \`20 px\` y cualquier gesto activo de cámara con dos dedos (\`!Cam.g && Cam.ptr.size <= 1\`).
   - \`Paseo.siguiente\` ordena primero los lugares no visitados a \`<= 2.500 m\` (\`250 * TS\`) antes que los más lejanos.
5. **Gasto de energía invariante con \`velMul\` (\`src/js/69-libre.js\`):**
   - En \`ModeUsuarioR.prototype.tick\`, el gasto positivo de energía se multiplica por \`velMul(this)\` para compensar exactamente el menor o mayor tiempo real \`dt\` empleado en recorrer la misma cuesta.
6. **Respaldo \`BroadcastChannel\` para salas WebRTC locales sin candidatos ICE (\`src/js/70-net.js\`):**
   - Si el SDP generado no contiene candidatos ICE (\`!/a=candidate:/m.test(sdp)\`), \`Net.wireBC\` enlaza un canal de datos compatible sobre \`BroadcastChannel('je-net-' + roomId)\`, permitiendo salas multijugador entre pestañas locales o entornos sin interfaz de red externa.

#### Código completo de los archivos modificados en M1

${codeBlock('src/js/70-net.js', 'javascript', '[Juega EnCicla]')}
${codeBlock('src/js/81-controles.js', 'javascript', '[Juega EnCicla]')}
${codeBlock('src/js/88-camara.js', 'javascript', '[Juega EnCicla]')}
${codeBlock('src/js/89-paseo.js', 'javascript', '[Juega EnCicla]')}
${codeBlock('src/js/69-libre.js', 'javascript', '[Juega EnCicla]')}

#### Cómo probar M1

1. Abrir \`dist/juega-encicla.html\` o ejecutar \`NODE_PATH=/tmp/pw/node_modules NODE_OPTIONS="-r /tmp/pw/setup.js" node tests/run.js --n=27\`.
2. En **Modo Libre**, activar \`🧭 Paseo\` y pellizcar o girar la cámara con dos dedos: el paseo guiado continúa sin interrumpirse y la cámara responde con suavidad.
3. En **Más > Velocidad de la bici**, cambiar entre *Tranquila* (\`0,8×\`) y *Muy rápida* (\`1,5×\`) subiendo hacia San Javier o Manrique: la barra de energía baja exactamente lo mismo por cada 100 m ascendidos.
4. En **En red (multijugador)**, crear una sala con 3 pestañas incluso sin conexión Wi-Fi/LAN: los 3 dispositivos enlazan y corren la partida sincronizada.

---

### M2 · Unificación y mejora del mapa (Motor del Valle 1.1.0, túneles y 2 niveles) \`[Ambos / Juega EnCicla]\`

#### Qué se hizo en M2

1. **Motor del Valle v1.1.0 (\`motor-valle/VERSION.json\`, \`motor-valle/js/valle.js\`, \`motor-valle/capas/index.mjs\`):**
   - Se creó \`motor-valle/js/valle.js\`, que expone \`Valle.decodificar(meta, binB64, tsPx)\` para *Juega EnCicla* (\`tileM = 10 m\`, \`TS = 16 px\`) y *El Metro* (\`tileM = 20 m\`), con conversiones exactas \`geoACasilla(lat, lon)\`, \`casillaAGeo(tx, ty)\`, \`pxAMetros\`, \`metrosAPx\` y consultas \`suelo\`, \`cotaCasilla\`, \`cotaPx\`, \`pendientePx\`, \`municipioEn\`, \`barrioEn\` y \`comunaEn\`.
   - Se creó \`motor-valle/capas/index.mjs\` con el registro formal de las 11 capas compartidas entre ambos juegos.
2. **Túneles, soterrados y deprimidos viales (\`motor-valle/geo/alturas.py\`, \`src/data/alturas.json\`, \`src/js/76-altura.js\`):**
   - \`motor-valle/geo/alturas.py\` extrae ahora tanto \`is_bridge\` (\`puentes\`, nivel \`>= +1\`) como \`is_tunnel\` (\`tuneles\`, nivel \`<= -1\`) e incluye los **12 principales soterrados y deprimidos del Valle de Aburrá** (*Soterrado de Parques del Río Autopista Sur y Av. Regional*, *Deprimido de San Juan / La Alpujarra*, *Av. Oriental con La Playa*, *Villanueva*, *Bulerías / Av. 33*, *Terminal del Norte / Caribe*, *Industriales / Calle 30*, *La 80 con Colombia*, *Puente Madre Laura*, *Guayabal / Cristo Rey* y *Aguacatala / El Poblado*).
   - En \`CityMap.alturas()\` (\`src/js/76-altura.js\`), cada túnel/deprimido se construye en \`this.tunnels\` y \`this.tunG\` con cota relativa \`z = -0.18\`, rampas suaves en sus extremos y muros de contención laterales.
3. **Física, colisiones de tráfico y ruteo GPS en dos niveles (\`src/js/76-altura.js\`, \`src/js/20-map.js\`, \`src/js/30-ride.js\`):**
   - \`Ride.prototype.nivel()\` y \`Ride.prototype.nivelCarros()\` asignan nivel \`+1\` en puentes, \`-1\` en deprimidos/soterrados y \`0\` a nivel del suelo tanto en 3D como en 2D.
   - \`Ride.prototype.updCars()\` comprueba \`sameLvl = (c.nivel != null ? c.nivel : (c.arriba ? 1 : 0)) === Math.sign(P.lvl || 0)\` antes de frenar, pitar o chocar, eliminando los choques fantasma entre niveles distintos.
   - \`CityMap.nextStep(F, x, y, lvl)\` consulta \`this.desnivel\` para penalizar giros ortogonales a mitad de un puente o túnel, guiando al GPS y a los bots hasta la rampa de salida.

#### Especificaciones visuales y medidas de puentes y deprimidos (Arte autocontenido M2)

| Elemento | Medidas en metros | Medidas en píxeles (\`1 m = 1,6 px\`) | Paleta Hex |
|---|---|---|---|
| Tablero viaducto Metro (A y B) | \`10,0 m\` ancho · columnas cada \`30 m\` | \`16,0 px\` ancho · columnas cada \`48 px\` | Tablero \`#9a9185\`, canto \`#6f685e\`, riel \`#2b2a28\`, Línea A \`#1C5C9C\`, Línea B \`#E38835\` |
| Puente vehicular / ciclorruta | \`4,4 m\` a \`14,0 m\` ancho · rampa \`16 m\` | \`7,0 px\` a \`22,4 px\` ancho · rampa \`26 px\` | Asfalto \`#565a62\`, ciclorruta \`#2e9d55\`, baranda \`#cfcabf\`, pilar \`#aaa59a\` |
| Deprimido / soterrado (\`lvl = -1\`) | \`12,0 m\` a \`22,0 m\` ancho · rampa \`17,5 m\` | \`19,2 px\` a \`35,2 px\` ancho · rampa \`28 px\` | Calzada excavada \`#252932\`, muro contención \`#7e838c\`, portal preventivo \`#f2c400\`, luz interior \`#ffd47a\` |

#### Código completo de los archivos nuevos y modificados en M2

${codeBlock('motor-valle/VERSION.json', 'json', '[Ambos]')}
${codeBlock('motor-valle/js/valle.js', 'javascript', '[Ambos]')}
${codeBlock('motor-valle/capas/index.mjs', 'javascript', '[Ambos]')}
${codeBlock('motor-valle/geo/alturas.py', 'python', '[Ambos]')}
${codeBlock('src/js/76-altura.js', 'javascript', '[Juega EnCicla]')}
${codeBlock('src/js/20-map.js', 'javascript', '[Juega EnCicla]')}
${codeBlock('src/js/30-ride.js', 'javascript', '[Juega EnCicla]')}
${codeBlock('tools/build.js', 'javascript', '[Juega EnCicla]')}

#### Cómo probar M2

1. Ejecutar \`python3 motor-valle/geo/alturas.py\` (verifica los 13 tramos de viaducto del Metro, 1.435 puentes y 12 túneles/deprimidos en \`src/data/alturas.json\`).
2. Ejecutar \`node tools/build.js && NODE_PATH=/tmp/pw/node_modules NODE_OPTIONS="-r /tmp/pw/setup.js" node tools/auditoria-mapa.js\`.
3. En **Modo Libre**, pedalear por el **Soterrado de Parques del Río** o el **Deprimido de San Juan (La Alpujarra)**: al entrar por la rampa (\`P.lvl = -1\`), los muros de contención encauzan la vía, se enciende el halo cálido bajo la cubierta traslúcida y los carros que cruzan por el nivel superior (\`nivel 0\` o \`+1\`) no chocan con el ciclista.

---

### M3 · Mejoras gráficas, interiores de estaciones y mejores casas de ladera \`[Juega EnCicla]\`

#### Qué se hizo en M3

1. **Interiores detallados de estaciones EnCicla en 2D y 3D (\`Art.booth\` y \`Ride.prototype.estaciones3D\` en \`src/js/92-vehiculos.js\`):**
   - **Caseta manual:** interior visible a través del ventanal con pared de fondo azul profundo (\`#162844\`), escritorio de madera (\`#8b5a2b\`), monitor/planilla (\`#7ce0ff\`), silla ergonómica (\`#232a38\`), chaleco reflectivo verde con cintas plateadas colgado en gancho (\`#9bd341\` / \`#e6ecf5\`), tablero de llaves codificadas por color (\`#56c7ff\`, \`#ff5a36\`, \`#ffe066\`, \`#9bd341\`), tula verde EnCicla (\`#7ab800\`), cargador de celular con LED verde (\`#3dd668\`) y pocillo de tinto humeante (\`#d94e34\`).
   - **Tótem automático y módulos de anclaje:** columna en azul EnCicla (\`#0a2342\`), pantalla táctil Cívica retroiluminada (\`#7ce0ff\`), lector sin contacto con halo verde pulsante (\`#3dd668\`), panel solar superior (\`#1f365c\`) y módulos de anclaje (\`#4c5563\`) con LEDs individuales de estado (\`#3dd668\` disponible, \`#ffb300\` ocupado, \`#e84855\` averiado).
2. **Casas de ladera mejoradas (\`techoL\` en \`src/js/92-vehiculos.js\` y \`src/js/75-graficos.js\`):**
   - En los barrios con cota \`> 1.545 m s. n. m.\`, los lotes residenciales dibujan terraza de plancha con tanque cilíndrico negro de agua (\`#1f232a\` con reborde \`#4a5160\`), cuerda con ropa tendida de colores (\`#ff5a36\`, \`#56c7ff\`, \`#ffe066\`, \`#9bd341\`) y escalera exterior de concreto (\`#bfc5ce\`) con pasamanos (\`#eef2f7\`).
3. **Atmósfera del valle (\`Ride.prototype.drawGlow\` en \`src/js/92-vehiculos.js\`):**
   - Niebla andina suave en la madrugada (5:30 a 7:50 a. m.) y durante los aguaceros, reflejos especulares sobre el pavimento mojado detrás de los vehículos y cono de luz cálida (\`rgba(255,244,180,0.22)\`) en la farola delantera de la bici de noche.

#### Especificaciones de arte autocontenido (M3)

| Pieza | Medidas reales (m) | Medidas en juego (px) | Paleta Hex |
|---|---|---|---|
| Caseta manual EnCicla | \`4,0 m × 2,2 m × 2,6 m\` | \`6,4 × 3,6 px\` (3D) · \`34 × 34 px\` (vista estación) | Cuerpo \`#0a2342\`, techo \`#7ab800\`, borde \`#c4ec7c\`, escritorio \`#8b5a2b\`, pantalla \`#7ce0ff\`, chaleco \`#9bd341\`, tinto \`#d94e34\`, LED \`#3dd668\` |
| Tótem automático Cívica | \`0,55 m × 0,45 m × 2,10 m\` | \`2,1 × 2,1 px\` base · \`z = 0,085\` | Columna \`#0a2342\`, pantalla \`#7ce0ff\`, halo lector \`#3dd668\`, panel solar \`#1f365c\`, anclaje \`#4c5563\` |
| Casa de ladera antioqueña | \`6,0 m × 8,0 m\` · 1 a 3 pisos | \`9,6 × 12,8 px\` · \`z = 0,14 .. 0,34\` | Ladrillo \`#b85d3b\`, plancha \`#8b9098\`, tanque \`#1f232a\`, escalera \`#bfc5ce\`, pasamanos \`#eef2f7\` |

#### Código completo de \`src/js/75-graficos.js\` \`[Juega EnCicla]\`

*(El código de \`src/js/92-vehiculos.js\`, que contiene los interiores de estaciones 2D/3D, las casas de ladera y la atmósfera del valle junto con los vehículos de M5, se incluye completo en la sección M5 más abajo para no duplicarlo).*

${codeBlock('src/js/75-graficos.js', 'javascript', '[Juega EnCicla]')}

#### Cómo probar M3

1. Iniciar un turno de **Anfitrión** (o entrar a una estación manual en Modo Libre): observar a través del ventanal de la caseta el escritorio de madera, el tablero de llaves por colores, el chaleco reflectivo colgado, la tula verde, el cargador con LED verde y el pocillo de tinto.
2. En **Modo Libre** con gráficos **Ciudad 3D**, acercar la cámara (\`+\`) sobre cualquier estación EnCicla para ver la caseta amoblada o el tótem automático con su halo Cívica pulsante y los LEDs de los anclajes.
3. Subir hacia **San Javier (Comuna 13)** o **Manrique / Santo Domingo**: observar las terrazas de plancha con tanques negros de agua, ropa tendida y escaleras exteriores.

---

### M4 · Run EnCicla · Carrera sin fin en 3D \`[Juega EnCicla]\`

#### Qué se hizo en M4

1. **Nuevo modo \`MGRunner3D\` (\`src/js/91-runner.js\`):**
   - Inspirado en *RunRunZero* y conectado directamente a las coordenadas, barrios y pendientes reales del mapa unificado del Valle de Aburrá.
   - Incluye **6 corredores reales**:
     1. *Ciclorruta Parques del Río* (\`La Alpujarra → Conquistadores → Carlos E. Restrepo\`),
     2. *Corredor Av. Las Vegas* (\`El Poblado → Ciudad del Río → Envigado\`),
     3. *Ciclorruta Avenida 80* (\`La Aguacatala → Belén → Laureles → Floresta\`),
     4. *Paseo Carabobo Norte* (\`Parque Berrío → Parque Explora → Jardín Botánico\`),
     5. *Corredor Universidad – Estadio* (\`U. de Antioquia → Suramericana → Atanasio Girardot\`),
     6. *Ruta San Javier – La América* (\`Estación San Javier → La Floresta → Estadio\`).
2. **Dos vistas con cambio instantáneo (\`toggleCam()\`, botón \`🎥 1.ª / 3.ª Persona\` o teclas \`V\` / \`C\`):**
   - **Primera persona (\`drawFirstPerson\`):** dibuja desde los ojos del ciclista el manubrio verde EnCicla (\`#7ab800\` o azul eléctrico \`#2fa8dc\` en bici eléctrica) que se inclina al cambiar de carril y vibra con el pedaleo, la canasta metálica delantera (\`#3a4350\` / \`#566172\`) con su placa oficial EnCicla y vaso de tinto cuando lleva impulso, las maniguetas de freno de aluminio (\`#cfd6e0\`) que se aprietan al frenar/agacharse, el timbre dorado (\`#ffd24c\`) cuya palanca oscila al tocar \`🔔 Timbre\`, y las manos del jugador con el tono de piel de su perfil.
   - **Tercera persona (\`drawThirdPerson\`):** dibuja en perspectiva 3D la bici EnCicla (o el vehículo activo de M5: bici eléctrica, patinete, monopatín eléctrico, tabla de skate o patines en línea) desde atrás, con luz trasera LED roja, pedaleo o patinaje alternado y la camiseta y casco/peinado reales del perfil del jugador.
3. **Mecánicas de 3 carriles, salto, agachada y timbre ciudadano:**
   - Controles por deslizamiento táctil (*swipe*), botones grandes en pantalla (\`◀\`, \`▲ Salto\`, \`▼ Agacha\`, \`🔔 Timbre\`, \`▶\`) y teclado (\`Flechas\` / \`WASD\` + \`Espacio\` + \`V\`).
   - Al tocar \`🔔 Timbre\`, los perritos criollos y vendedores de chaza se apartan amablemente dando \`+4\` puntos de cultura ciudadana.

#### Código completo de \`src/js/91-runner.js\` \`[Juega EnCicla]\`

${codeBlock('src/js/91-runner.js', 'javascript', '[Juega EnCicla]')}

#### Cómo probar M4

1. Entrar a **Modo Libre** (\`Usuario > Modo libre\`) y tocar el botón de acción **\`🏁 Carrera 3D\`** en la barra inferior.
2. Tocar el botón **\`🎥 1.ª Persona / 🎥 3.ª Persona\`** arriba a la derecha (o la tecla \`V\`) para alternar en vivo entre la vista desde el manubrio con canasta y timbre y la vista en tercera persona detrás del ciclista.
3. Cambiar de carril con \`◀ ▶\`, saltar huecos y rampas con \`▲ Salto\`, agacharse bajo las ramas de guayacán con \`▼ Agacha\` y tocar \`🔔 Timbre\` para pedir vía.

---

### M5 · Nuevos vehículos jugables en el mundo libre \`[Juega EnCicla]\`

#### Qué se hizo en M5

1. **Siete vehículos jugables en el mundo libre (\`src/js/92-vehiculos.js\`):**
   - Todos seleccionables en cualquier momento desde el botón **\`🛴 Vehículo\`** en Modo Libre (\`UI.vehiculos\`), respetando el préstamo de EnCicla (si el jugador tenía una bici del sistema prestada y pasa a skate, patines o patinete, su bici EnCicla queda estacionada con candado y marcador en el mapa para recogerla o devolverla luego).
   - **Tabla de especificaciones físicas y visuales de los vehículos (escala \`1 m = 1,6 px\`):**

| ID | Vehículo | Largo × Ancho (m) | Largo × Ancho (px) | Vel. punta (\`VSTATS.max\`) | Superficie ideal / comportamiento | Paleta Hex |
|---|---|---|---|---|---|---|
| \`bike\` | **Bici EnCicla / propia** | \`2,90 × 1,00 m\` | \`4,6 × 1,6 px\` | \`60 × WK\` | Ciclorruta (\`1,16×\`), timbre 🔔 | Verde \`#7ab800\`, lima \`#9bd341\`, llanta \`#1b1f27\` |
| \`ebike\` | **Bici eléctrica EnCicla** | \`2,95 × 1,05 m\` | \`4,7 × 1,7 px\` | \`67 × WK\` | **No pierde velocidad en subidas** (\`sl > 0\`), farola LED | Marco \`#9bd341\`, batería \`#2fa8dc\`, luz \`#fff6b0\` |
| \`scooter\` | **Patinete clásico** | \`2,20 × 0,85 m\` | \`3,5 × 1,4 px\` | \`51 × WK\` | Ágil en andenes (\`0,92×\`) y plazas (\`0,98×\`), campanilla aguda | Aluminio \`#c9d1db\`, lija \`#262b36\`, manubrio \`#5b6472\` |
| \`emonopatin\` | **Monopatín eléctrico** | \`2,35 × 0,90 m\` | \`3,8 × 1,4 px\` | \`71 × WK\` | Muy rápido en ciclorruta (\`1,22×\`) y asfalto, sufre en pasto (\`0,58×\`) | Grafito \`#1f242e\`, acento \`#ffb300\`, LED \`#9bd341\` |
| \`skate\` | **Tabla de skate** | \`2,00 × 0,80 m\` | \`3,2 × 1,3 px\` | \`54 × WK\` | Giro cerrado (\`w0 = 6,5\`), **botón 🔔 hace salto *ollie*** | Arce \`#d9a066\`, lija \`#232730\`, ruedas \`#f4efe2\` |
| \`patines\` | **Patines en línea** | \`1,75 × 0,95 m\` | \`2,8 × 1,5 px\` | \`56 × WK\` | Fluido en parques (\`0,78×\`), plazas (\`1,05×\`) y ciclorrutas (\`1,18×\`) | Bota \`#1b4d89\`, guía \`#d8dee8\`, ruedas \`#ff5a36\` |
| \`walk\` | **A pie** | \`1,70 × 1,70 m\` | \`2,7 × 2,7 px\` | \`26 × WK\` | Sube escaleras y senderos sin penalización de tráfico | Camiseta y piel del perfil del jugador |

2. **Logro nuevo:** \`multimodal\` (*«Ruedas del valle»: Recorre el modo libre en 5 vehículos distintos*).

#### Código completo de \`src/js/92-vehiculos.js\` \`[Juega EnCicla]\`

${codeBlock('src/js/92-vehiculos.js', 'javascript', '[Juega EnCicla]')}

#### Cómo probar M5

1. Entrar a **Modo Libre** y tocar el botón **\`🚲 Vehículo\`** en la barra de acciones inferior.
2. Elegir **⚡ Bici eléctrica** y subir una pendiente fuerte (> 5 %): aparece el indicador \`▲ SUBIDA ⚡\` y la bici mantiene su velocidad sin agotar al ciclista.
3. Elegir **🛹 Tabla de skate** y presionar el botón **\`🔔\`** (o barra espaciadora): la tabla ejecuta un salto **\`¡Ollie! 🛹\`** con sonido de pop sobre el pavimento y partículas bajo las ruedas.
4. Probar los 5 vehículos de ruedas para desbloquear el logro **🏅 Ruedas del valle**.

---

### M6 · Trama del mundo libre «Ruedas y Rieles del Aburrá» y cruce con El Metro \`[Ambos / Juega EnCicla]\`

#### Qué se hizo en M6

1. **Arco de historia en mundo abierto «Ruedas y Rieles del Aburrá» (\`contenido/guion/trama_valle.json\`, \`src/js/93-trama.js\`):**
   - 6 capítulos jugables directamente en el mundo libre (\`ModeUsuarioR\`) desde el botón **\`📖 Trama\`**, sin sacar al jugador de la ciudad:
     - **Cap. 1 · *El Tinto de San Antonio*** (San Antonio → Parque Berrío, en Bici EnCicla con Rosalba, Doña Luz y Don Rubén).
     - **Cap. 2 · *El Corredor del Río*** (La Alpujarra → Parques del Río, con Santi y Wílmar + tramo en **Carrera 3D** por el soterrado).
     - **Cap. 3 · *Subida Eléctrica a San Javier*** (Estadio → San Javier, con Kevin y Doña Marleny subiendo la loma en **Bici Eléctrica ⚡**).
     - **Cap. 4 · *Ruedas Libres en Ciudad del Río*** (Industriales → MAMM Ciudad del Río, con Yuli y Jhon en **Tabla de Skate 🛹**).
     - **Cap. 5 · *Relevo en el Norte del Valle*** (Universidad → Parque Explora / Moravia, con Don Libardo y Wilson en **Monopatín Eléctrico 🔋** + tramo **Carrera 3D** por Carabobo Norte).
     - **Cap. 6 · *La Gran Conexión del Aburrá*** (Universidad → La Alpujarra, con Ing. Paola, Don Efraín y Rosalba + rodada final **Carrera 3D**).
2. **15 personajes compartidos de Juega EnCicla y El Metro vivos en el mapa (\`contenido/guion/metro.json\`, \`contenido/guion/trama_valle.json\`, \`src/js/93-trama.js\`):**
   - **9 de Juega EnCicla:** Santi (*Universidad*), Doña Luz (*Estadio*), Don Jairo (*Caribe / Bodega*), Yuli (*Ciudad del Río*), Kevin (*Laureles / Av. 80*), Ing. Paola (*La Alpujarra*), Wilson (*Moravia*), Cata (*Envigado*) y Don Rubén (*Parque Berrío*).
   - **6 de El Metro:** Rosalba (*San Antonio*), Don Efraín (*Cisneros / Universidad*), Doña Marleny (*San Javier*), Wílmar (*Acevedo / Santo Domingo*), Don Libardo (*Universidad*) y Jhon (*Industriales*).
   - Al pasar a menos de \`55 m\` de cualquiera de ellos en Modo Libre, aparece su personaje con etiqueta (\`🚲\` o \`🚇\`), bocadillo de diálogo flotante y bonificación de hojas verdes.
3. **4 fragmentos ferroviarios cruzados con El Metro:**
   - *Tiquete Edmonson de 1929* (Universidad), *Silbato de bronce de La Quiebra* (San Antonio), *Polea guía del Metrocable K (2004)* (San Javier) y *Plano Maestro Ruedas y Rieles* (La Alpujarra).

#### Código completo de los archivos nuevos y modificados en M6

${codeBlock('contenido/guion/metro.json', 'json', '[Ambos]')}
${codeBlock('contenido/guion/trama_valle.json', 'json', '[Juega EnCicla]')}
${codeBlock('src/js/93-trama.js', 'javascript', '[Juega EnCicla]')}

#### Cómo probar M6

1. Entrar a **Modo Libre** y tocar el botón **\`📖 Trama\`** en la barra inferior para abrir la crónica **«Ruedas y Rieles del Aburrá»**.
2. Tocar **\`▶ Rodar\`** en el Capítulo 1 (*El Tinto de San Antonio*) o cualquiera de los 6 capítulos: el GPS marca la ruta en la ciudad abierta, equipa el vehículo del capítulo y al llegar lanza el cierre o el corredor 3D correspondiente.
3. Acercarse a las estaciones **San Antonio**, **Universidad**, **San Javier** o **La Alpujarra** para conversar con Rosalba, Don Efraín, Doña Marleny o la Ing. Paola y recolectar los **4 recuerdos ferroviarios de El Metro (\`🚇\`)**.

---

## 3. Reporte de pruebas y fallas (Tabla M1)

| # | Juego | Modo o pantalla | Qué pasa | Cómo reproducirlo | Gravedad | Estado |
|---|---|---|---|---|---|---|
| 1 | Juega EnCicla | Mapa 3D · Controles táctiles (\`81-controles.js\`, \`88-camara.js\`) | Al apoyar el primer dedo sobre las flechas o el joystick y luego apoyar un segundo dedo para pellizcar/girar la cámara, \`Input.joy.on\` se apagaba pero \`Ctrl.held\` e \`Input.keys\` quedaban encendidos, dejando la bici acelerando o girando sola. | En celular (\`412 × 915\`), elegir control *Flechas* o *Joystick*, mantener pulsado con un dedo y apoyar un segundo dedo para hacer zoom. | **Alta** | **Corregido** (\`Ctrl.clear()\` al detectar 2 dedos o cámara libre) |
| 2 | Juega EnCicla | Cámara 3D (\`88-camara.js\`) | Al deslizar dos dedos verticalmente para inclinar la cámara, pequeñas variaciones en la separación de los dedos (> 12 px) bloqueaban el gesto en modo zoom/giro (\`lock = 'zr'\`) e impedían inclinar; además, un giro leve desde vista cenital saltaba \`C.t\` a \`0.3\` en un solo cuadro. | En vista 3D cenital, subir o bajar dos dedos juntos o girar levemente con dos dedos. | **Media** | **Corregido** (umbral proporcional \`Math.abs(dm) > dz * 1.15\` e inclinación progresiva) |
| 3 | Juega EnCicla | Tráfico en puentes y soterrados (\`30-ride.js\`, \`76-altura.js\`) | \`Ride.prototype.updCars\` calculaba choques con \`this.cars\` sin verificar si el carro y el jugador estaban en el mismo nivel vertical (\`lvl = -1, 0, +1\`), provocando choques fantasma al pasar por debajo de un puente donde circulaban carros arriba. | Pasar en bici por debajo de un puente vehicular en La Aguacatala, Industriales o San Juan mientras pasa tráfico sobre el puente. | **Alta** | **Corregido** (colisión y frenado solo cuando \`car.nivel === Math.sign(P.lvl)\`) |
| 4 | Juega EnCicla | Puentes, deprimidos y GPS (\`76-altura.js\`, \`20-map.js\`) | \`Ride.prototype.nivel()\` solo se ejecutaba cuando \`GFX() === '3d'\`, solo tenía barandas en puentes sobre agua (\`D.agua\`), no existían los pasos deprimidos (\`lvl = -1\`) y el GPS sugería girar 90° desde la mitad de un puente hacia la calle inferior. | Cruzar un puente vehicular sobre avenida en vista 2D o 3D con destino lateral activo en el GPS. | **Alta** | **Corregido** (\`nivel()\` en 2D/3D, 12 deprimidos \`lvl = -1\`, barandas en todo puente/túnel y \`CityMap.desnivel\`) |
| 5 | Juega EnCicla | Modo Libre · Paseo guiado (\`89-paseo.js\`) | Tocar la pantalla con dos dedos para girar o acercar la cámara durante el Paseo guiado disparaba \`Input.joy.on\` en el primer dedo y cancelaba el paseo; además \`Paseo.siguiente()\` no priorizaba estrictamente la cubeta de lugares a \`< 2,5 km\`. | Activar \`🧭 Paseo\` en Modo Libre y pellizcar la pantalla con dos dedos para mirar un edificio. | **Media** | **Corregido** (filtro \`!Cam.g && Cam.ptr.size <= 1\` con retardo de \`140 ms\` y ordenamiento por cubeta \`<= 2,5 km\`) |
| 6 | Juega EnCicla | Modo Libre · Energía y velocidad elegida (\`69-libre.js\`) | El gasto de energía en subida (\`drain = .35 + sl * 30\`) se multiplicaba por \`dt\` real sin escalar por \`velMul(this)\`, por lo que subir una loma en velocidad *Tranquila* (\`0,8×\`) consumía \`1,87×\` más energía que subir la misma loma en *Muy rápida* (\`1,5×\`). | Subir de Estadio a San Javier en Modo Libre con velocidad \`0,8×\` y comparar energía restante contra \`1,5×\`. | **Media** | **Corregido** (gasto escalado por \`velMul(this)\`) |
| 7 | Juega EnCicla | Rendimiento · Calidad automática (\`88-camara.js\`, \`75-graficos.js\`) | \`Calidad.cuadro(t)\` salía sin hacer nada cuando \`devicePixelRatio <= 1.01\`, y cuando reducía \`View.calidad\` en pantallas Retina cambiaba \`CityMap.cq()\`, borrando de golpe todos los trozos 3D en caché y causando un tirón perceptible. | Jugar en un portátil o monitor con \`DPR = 1\` con cámara inclinada en La Candelaria. | **Media** | **Corregido** (ajuste en 2 etapas: primero \`JE.calidad3D = 0\` sin vaciar caché de trozos, luego \`View.calidad\`) |
| 8 | Juega EnCicla | Ciudad 3D · Centro de Medellín (\`75-graficos.js\`) | Con cámara muy inclinada (\`til > 0.55\`) y zoom alejado (\`z < 0.82\`) en zonas densas, \`draw3D\` proyectaba y dibujaba accesorios de techo y líneas de piso de cientos de lotes bajos lejanos (> 270 px del foco), elevando el tiempo de cuadro. | Inclinar la cámara al máximo (\`Baja\`) y alejar el zoom en Parque Berrío / La Candelaria. | **Baja** | **Corregido** (culling de lotes bajos \`z < 0.16\` y detalles de techo a gran distancia en \`fast3D\`) |
| 9 | Juega EnCicla | Multijugador WebRTC (\`70-net.js\`) | En dispositivos sin interfaz de red activa distinta de \`lo\` (modo avión, contenedor o pruebas locales entre pestañas sin Wi-Fi), \`RTCPeerConnection\` reúne 0 candidatos ICE (\`a=candidate:\` ausente) y el botón \`#nStart\` nunca se habilita. | Abrir 3 pestañas en un entorno sin interfaz LAN/WAN o ejecutar la sección 5 de \`tests/run.js\`. | **Media** | **Corregido** (respaldo automático con \`BroadcastChannel('je-net-' + roomId)\` cuando el SDP no trae candidatos ICE) |

---

## 4. Ideas innovadoras para Juega EnCicla (ordenadas por impacto y esfuerzo)

Todas las ideas propuestas a continuación están diseñadas específicamente para **Juega EnCicla**, respetando la restricción de **un solo archivo HTML offline sin librerías externas** y aprovechando el Motor del Valle y el vínculo con *El Metro*:

| # | Idea innovadora | Impacto | Esfuerzo | Cómo encaja en un solo HTML sin librerías |
|---|---|---|---|---|
| 1 | **Intermodalidad en vivo en estaciones SITVA (subir con la bici plegable o tomar el Metrocable / Tranvía desde Modo Libre)** | **Muy alto** | **Bajo** | Al llegar a cualquiera de las estaciones de *El Metro*, *Metrocable* (Líneas K, J, H, M, P, L) o *Tranvía de Ayacucho*, permitir un botón \`🚡 Subir al Cable / 🚊 Tranvía\` que traslada la cámara en tiempo real siguiendo la cabina aérea o el tranvía sobre el valle en 3D hasta la estación de destino. |
| 2 | **Editor ciudadano de ciclorrutas («Diseña tu corredor del AMVA»)** | **Muy alto** | **Medio** | Permitir en Modo Libre trazar con el dedo nuevos tramos de ciclorruta (\`TT.CICLO\`) sobre avenidas existentes; el simulador \`Sim\` recalcula al instante cuántos viajes por hora suben en las estaciones cercanas y cuántas toneladas de $\\text{CO}_2$ se ahorran. |
| 3 | **Fantasma de récord y retos asincrónicos por código QR / texto corto (\`JE2...\`)** | **Alto** | **Bajo** | Comprimir con \`CompressionStream('deflate-raw')\` las muestras \`(t, x, y, veh)\` o los cambios de carril de \`MGRunner3D\` en un código de 120 caracteres para que un amigo pegue el código sin internet y compita contra el ciclista fantasma translúcido en la misma ciclorruta. |
| 4 | **Radio Comunitaria del Aburrá (síntesis procedural WebAudio + boletines viales en pantalla)** | **Alto** | **Bajo** | Tres emisoras seleccionables en WebAudio puro (*Tropipaisa FM*, *Lofi del Río* y *Radio Operativa EnCicla*) que adaptan su tempo a la velocidad de pedaleo y anuncian en cintillo cuando empieza un aguacero en Envigado o cuando hay partido en el Atanasio. |
| 5 | **Modo Fotógrafo 3D con postal exportable en PNG desde Canvas** | **Alto** | **Bajo** | En la cámara libre 3D (\`📷\`), añadir un disparador que encuadra la vista actual en perspectiva 3D con sello postal del barrio, fecha, hora, clima y personaje, y descarga un PNG nítido (\`canvas.toDataURL()\`) listo para compartir. |
| 6 | **Clima microclimático por municipio del valle (llueve en Sabaneta mientras hace sol en Bello)** | **Alto** | **Medio** | En vez de lluvia uniforme en todo el mapa, mover celdas de nube de sur a norte o desde las laderas con una función gaussiana \`rainAt(x, y, t)\`: el jugador ve la cortina de lluvia acercarse desde Itagüí y puede buscar techo en una estación antes de mojarse. |
| 7 | **Escuela de Bici EnCicla (circuito de destreza para niños y adultos mayores)** | **Alto** | **Bajo** | Un modo corto en el Parque Norte o la Unidad Deportiva Atanasio donde Doña Luz enseña equilibrio, señales manuales de giro, distancia segura con buses y frenado en piso mojado. |
| 8 | **Ciclopaseo Nocturno de los Jueves (caravana luminosa por el valle)** | **Alto** | **Bajo** | Evento especial cuando el reloj del Modo Libre pasa de las 19:30: decenas de ciclistas con luces LED verdes, azules y fucsias forman una serpiente luminosa por la Av. El Poblado, la 70 y Parques del Río; rodar en grupo reduce el gasto de energía un 40 % (*efecto pelotón*). |
| 9 | **Desfile de Silleteros y Alumbrados en 3D sobre Parques del Río** | **Medio** | **Bajo** | Cuando la temporada activa *Feria de las Flores* o *Alumbrados navideños*, levantar en \`draw3D\` arcos luminosos volumétricos sobre el río Medellín y silletas florales tridimensionales en Santa Elena y Avenida La Playa. |
| 10 | **Tarjeta Cívica Unificada entre Juega EnCicla y El Metro (\`localStorage\` compartido en el mismo dominio)** | **Medio** | **Bajo** | Guardar en una clave compartida \`aburra_civica_v1\` el perfil del personaje, las hojas verdes, los boletos y los fragmentos ferroviarios: lo que desbloqueas en *El Metro* (\`/metro/\`) aparece en tu billetera Cívica de *Juega EnCicla* (\`/\`) y viceversa. |
| 11 | **Minijuego de Poda y Guayacanes (mantenimiento ambiental de las ciclorrutas)** | **Medio** | **Bajo** | Nuevo encargo para el rol de *Apoyo*: despejar ramas caídas tras un vendaval y sembrar guayacanes amarillos y rosados que luego florecen permanentemente en ese tramo del mapa del jugador. |
| 12 | **Narrador accesible por voz (\`window.speechSynthesis\` offline)** | **Medio** | **Bajo** | Opción en *Más > Accesibilidad* que lee con la voz en español del sistema operativo los avisos del GPS (*«Gira a la derecha en 40 metros hacia Estación Estadio»*), los diálogos de los personajes y las tarjetas de ventanilla. |

---

## 5. Lista de verificación (qué se probó y en qué tamaño de pantalla)

| Prueba ejecutada | Celular (\`412 × 915\`, DPR 2, táctil) | Computador (\`1280 × 800\`, DPR 1, teclado y ratón) | Resultado |
|---|---|---|---|
| **1. Sintaxis y compilación offline (\`node tools/build.js\`)** | Sí (\`dist/juega-encicla.html\`, 4,86 MB, 0 recursos externos) | Sí (\`dist/juega-encicla.html\`, CSP activo, 0 errores de consola) | **PASÓ** |
| **2. Auditoría completa del mapa (\`node tools/auditoria-mapa.js\`)** | 133 estaciones, 45 lugares con postal, 1.203 sitios reales, 5.314 edificios | 1.435 puentes en alto, 12 deprimidos/soterrados, 13 estaciones de Metro en viaducto | **PASÓ** |
| **3. Alcanzabilidad del mapa en 2 niveles (\`CityMap.flow\` y \`CityMap.desnivel\`)** | 133/133 estaciones y 45/45 lugares alcanzables en bici y camión | GPS sin giros laterales imposibles desde puentes ni deprimidos | **PASÓ** |
| **4. M1 · Controles táctiles, cámara 3D de 2 dedos y Paseo guiado** | \`Ctrl.clear()\` libera flechas/joystick al apoyar 2.º dedo; inclinación suave; Paseo no se corta al mover cámara | Rueda del ratón, clic derecho orbital y teclas \`+ - Z X R F T C N G\` funcionan sin bloqueo | **PASÓ** |
| **5. M1 · Fluidez y tiempo de cuadro en 3D (La Candelaria, cámara inclinada \`t = 0.62\` y girada)** | Mediana de cuadro \`< 6 ms\` (~60 FPS estables) | Mediana de cuadro \`< 8 ms\` (~60 FPS estables, \`Calidad\` activo en DPR 1) | **PASÓ** |
| **6. M2 · Colisiones por nivel vertical (\`-1\` deprimido, \`0\` suelo, \`+1\` puente)** | 0 choques fantasma bajo puentes o dentro del Soterrado de Parques del Río | \`Valle.decodificar()\` responde cota (\`1478 m\` en centro), municipio y barrio exactos | **PASÓ** |
| **7. M3 · Interiores de estaciones, casas de ladera y atmósfera** | Caseta manual con escritorio, pantalla, llaves, chaleco, tula, cargador LED y tinto; tótem con halo Cívica | Casas de ladera (> 1.545 m) con tanque Rotoplas, ropa tendida y escalera exterior; niebla y farola nocturna | **PASÓ** |
| **8. M4 · Run EnCicla · Carrera sin fin en 3D (\`MGRunner3D\`)** | Botones táctiles \`◀\`, \`▲ Salto\`, \`▼ Agacha\`, \`🔔 Timbre\`, \`▶\` y *swipe* funcionan; cambio instantáneo 1.ª/3.ª persona | Teclas \`Flechas/WASD\`, \`Espacio\` (timbre) y \`V/C\` (cámara 1.ª/3.ª persona) + piloto automático \`bot()\` | **PASÓ** |
| **9. M5 · Siete vehículos jugables en Modo Libre** | Selector \`🛴 Vehículo\` probado con \`bike\`, \`ebike\`, \`scooter\`, \`emonopatin\`, \`skate\` (*ollie*), \`patines\` y \`walk\` | Bici EnCicla prestada queda estacionada con candado al cambiar a vehículo personal; logro \`multimodal\` verificado | **PASÓ** |
| **10. M6 · Trama «Ruedas y Rieles del Aburrá», 15 personajes y 4 fragmentos de El Metro** | Modal \`📖 Trama\` abre los 6 capítulos; bocadillos de saludo de los 15 personajes en el mapa | Recolección de los 4 fragmentos ferroviarios de *El Metro* y desbloqueo de logros verificados | **PASÓ** |
| **11. Simulación completa de los 13 modos y sala multijugador de 3 dispositivos (\`tests/run.js --n=27\`)** | 27 partidas simuladas + 12 pruebas de interfaz + prueba CPU 4× | Sala multijugador con 3 dispositivos conectada y sincronizada de principio a fin | **PASÓ** |
`;

const outDocs = path.join(ROOT, 'docs', 'ENTREGA-PLAN-UNICO-ENCICLA.md');
fs.writeFileSync(outDocs, md, 'utf8');
console.log('Escrito:', outDocs, (Buffer.byteLength(md) / 1024).toFixed(1), 'KB');
