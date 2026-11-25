# Investigación Técnica a Fondo: Motores Cenitales Híbridos, Saneamiento GIS del Valle de Aburrá y Carreras Pseudo-3D

**Proyectos objetivo:** `MetroZero` (*El Metro · La última vuelta*), `BicicletasUno` (*Juega EnCicla*) y el proyecto modular `Turno Cero`.  
**Módulos intervenidos:** `motor-valle`, `motor-city`, pipeline de datos cartográficos (`valle.js`, `ciudad.js`, `rutas.js`, `red.js`) y el nuevo módulo de carreras pseudo-3D.  
**Restricción de arquitectura:** Ejecución offline en un solo archivo HTML compilado (Web y WebView Android), preservando intactos los modos ya funcionales de cada juego.

---

## 1. Diagnóstico Forense del Ecosistema Actual

### 1.1 El conflicto estructural entre cartografía real y diseño de videojuegos
Tanto *Juega EnCicla* como *El Metro* comparten una ventaja competitiva extraordinaria: utilizan geografía real del Valle de Aburrá (OpenStreetMap + datos de elevación satelital SRTM + cálculo de rutas $A^*$). Sin embargo, esa misma fortaleza explica exactamente por qué el mapa se "craquea" visualmente al intentar llevarlo a una vista cenital 3D o híbrida:

1. **Discrepancia topológica en OpenStreetMap (OSM):** En un archivo GIS, una vía se almacena como una polilínea de grosor $0\text{ m}$ (eje central) y los predios o edificaciones como polígonos independientes. Cuando un motor gráfico expande la vía a un ancho jugable (entre $9\text{ m}$ y $22\text{ m}$) sin recortar geométricamente los polígonos vecinos, los muros y techos invaden la calzada.
2. **Resolución vertical del SRTM frente a la escala urbana:** Los datos SRTM libres tienen una resolución aproximada de $30\text{ m}$ por píxel. En el fondo plano del Valle de Aburrá el error pasa desapercibido, pero en laderas pronunciadas (Comuna 13, Santo Domingo, Manrique, El Poblado, vías hacia Arví o Santa Elena) la malla del terreno forma escalones bruscos. Al colocar prismas 3D simples sobre esa malla sin cimentación negativa ni nivelación vial, las casas flotan por un extremo y se hunden por el otro.
3. **El "valle inquietante geométrico" del 3D básico:** El cerebro humano acepta la abstracción en un 2D cenital con paleta coherente y buen pixel art. En cambio, en cuanto aparece una proyección 3D con cajas sin dirección lumínica, sin sombras de contacto y con texturas genéricas, la percepción evalúa la escena bajo estándares de realismo espacial y amplifica cada error de escala, intersección o vacío.
4. **Sobrecarga de dibujado en un HTML único:** Procesar todo el Valle de Aburrá sin partición espacial (*chunking*) ni descarte por frustum (*frustum culling*) obliga al navegador o WebView a recorrer miles de polígonos fuera de pantalla en cada fotograma, degradando la fluidez y obligando a sacrificar detalle visual.

### 1.2 Principio de aislamiento por modos
La solución **no** consiste en reconstruir los juegos completos. Cada título ya tiene modos con identidad propia que deben permanecer aislados e intactos:
* **En *Juega EnCicla*:** Se conservan los 9 oficios, los 27 turnos, la interfaz editorial tipo revista y los minijuegos locales. Solo evoluciona el núcleo de exploración libre por el Valle.
* **En *El Metro*:** Se conservan la vista panorámica 2D del tren, la cabina en primera persona, el modo Metrocable, la guía didáctica y la narrativa de Rosalba. Solo se refactoriza el núcleo de **Ciudad Libre** y **Bus**.
* **En *Turno Cero*:** Se adopta una arquitectura de **cápsulas de modo** (*Game Mode Capsules*) desacopladas de los datos de vehículos y pistas, evitando mezclar lógicas de mundo abierto cenital, carreras pseudo-3D y futuros modos aéreos dentro del mismo bucle de renderizado.

---

## 2. Anatomía Técnica de los 5 Videojuegos de Referencia

### 2.1 Matriz comparativa consolidada

| Dimensión técnica | Reckless Getaway 2 | Super Arcade Racing | GTA: Chinatown Wars | Grand Theft Auto 2 | Grand Theft Auto 1 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Motor real** | **BITE Engine** (C++ propietario, Pixelbite; OpenGL ES 3.0) | Motor 2D propietario (OutOfTheBit) | Motor 3D propietario (Rockstar Leeds; DS, PSP, móvil) | Motor 2.5D v2 propietario (DMA Design) | Motor 2.5D v1 propietario (DMA Design) |
| **Proyección cenital** | Perspectiva inclinada ($50^\circ\text{--}60^\circ$) con *tilt-shift* | Ortográfica pura ($90^\circ$ exactos) | Perspectiva inclinada ($45^\circ\text{--}60^\circ$), rotatoria | Perspectiva vertical ($85^\circ\text{--}90^\circ$) con extrusión | Perspectiva vertical casi cenital con zoom por velocidad |
| **Naturaleza gráfica** | $100\%$ 3D *low-poly* con *flat shading* y partículas | $100\%$ 2D pixel art (16-bit) con capas $Z$ | Híbrido: ciudad/autos 3D *low-poly* + *cel-shading* + UI 2D | Híbrido: bloques 3D texturizados + entidades en sprites 2D | Híbrido: cubos 3D texturizados + sprites 2D rotados |
| **Relieve y topografía** | Acantilados facetados, terrazas, rampas y puentes en arco | Ilusión por capas $Z$, escalado de sprite y desplazamiento de sombra | Elevaciones 3D reales, autopistas dobles, puentes y muelles | Grilla cúbica ($256 \times 256 \times 8$), pendientes y diagonales | Bloques escalonados por niveles discretos y rampas básicas |
| **Agua, ríos y playas** | Plano cian saturado, espuma animada y hundimiento letal | Bordes visuales y charcos con alteración de agarre | Plano texturizado con contraste limpio y navegación en bote | Nivel $Z = 0$ con textura animada; caída mortal | Plano $Z = 0$ con baldosas modulares de arena y agua |
| **Escala urbana y rural** | Calles muy anchas ($3\text{--}4$ autos), edificios bajos ($1\text{--}3$ pisos) | Pistas estrechas con alta densidad de detalle en bordes | Calles desproporcionadamente anchas + transparencia de torres | Zonas diferenciadas por paleta, neones y tren elevado | Bloques repetitivos diferenciados por texturas de $64 \times 64$ |
| **Física y colisiones** | Cuerpo rígido arcade con derrape y props destructibles | Física 2D vectorial con fricción variable (barro, hielo, asfalto) | Arcade pesado con asistencia sutil de alineación de carril | Inercia elástica, diferencias claras de masa y derrape | Colisiones secas (detención brusca al impactar muros) |

---

### 2.2 Análisis profundo por título

#### A. *Reckless Getaway 2* (Pixelbite — BITE Engine)
* **Cómo usan el motor:** BITE Engine empaqueta geometría ligera, sombreado plano y física de cuerpos rígidos orientada a GPU móvil (OpenGL ES 3.0). Su rendimiento es altísimo porque sustituye mapas de texturas pesados por **colores por vértice/cara** (*flat shading*) y una luz direccional fuerte que define volúmenes al instante.
* **Vista cenital y profundidad:** Combina un ángulo de cámara de $55^\circ$ con un filtro de desenfoque **tilt-shift** en el borde superior de la pantalla. Esto convierte el mapa en una "maqueta viva" y simultáneamente oculta el límite de dibujado (*far clipping plane*), reduciendo la cantidad de geometría que debe procesarse a lo lejos.
* **Relieves, montañas y costas:** Nunca intenta simular montañas realistas de malla suave. Usa **bloques rocosos facetados y escalonados** con caras geométricas limpias, lo cual armoniza visualmente con los edificios y vehículos. Las diferencias de elevación se resuelven con rampas anchas señalizadas, escalinatas transitables y puentes arqueados.
* **Props y sensación táctil:** La ciudad "se siente viva" porque todo el mobiliario secundario (cercas, señales, mesas, farolas, carpas, cajas) es **destructible o desplazable** con física liviana. El jugador percibe peso y velocidad al atravesar un entorno reactivo, no estático.
* **Lección directa para tu motor:** Sus laderas facetadas y su *tilt-shift* son el antídoto perfecto para las montañas del Valle de Aburrá y los bordes del mapa.

#### B. *Super Arcade Racing* (OutOfTheBit — Motor 2D Propietario)
* **Cómo usan el motor:** Motor 2D en proyección ortográfica estricta diseñado para estética de 16 bits. No calcula perspectiva 3D; todo el volumen proviene de sombreado pintado a mano en el pixel art y del orden de renderizado por capas.
* **Ilusión de relieve y puentes:** Cuando el auto cruza un puente o salta una rampa, el motor cambia el índice de capa $Z$, incrementa el factor de escala del *sprite* (entre $1.0$ y $1.25$) y desplaza la sombra proyectada hacia la diagonal inferior derecha proporcionalmente a la altura simulada.
* **Superficies y lectura del terreno:** El atractivo de sus zonas rurales, heladas y urbanas reside en la **lectura inmediata de la fricción**: asfalto limpio, grietas, barro, charcos y hielo alteran el coeficiente de agarre lateral y generan partículas distintas tras las llantas.
* **Error que debes evitar:** La cámara demasiado cerrada y la falta de anticipación (*look-ahead*) obligan a memorizar curvas a fuerza de choques. Tu motor debe desplazar siempre la cámara hacia adelante del vector de velocidad.

#### C. *Grand Theft Auto: Chinatown Wars* (Rockstar Leeds — Motor 3D Propietario)
* **Cómo usan el motor:** Diseñado originalmente para Nintendo DS (con hardware muy limitado en memoria de texturas y polígonos) y portado luego a PSP y móviles. Es el caso de estudio más cercano a las limitaciones de un HTML ligero en WebView Android.
* **El equilibrio híbrido ideal:** Toda la arquitectura y los vehículos son 3D *low-poly* muy angular, pero tratados con **contornos oscuros (*cel-shading*)** y texturas pequeñas de alto contraste. Los retratos, menús y arte narrativo permanecen en 2D puro, logrando un lenguaje visual cohesivo sin parecer un 3D "barato".
* **Resolución del problema de rascacielos en cenital:** En una ciudad real con edificios altos (como el Centro de Medellín o El Poblado), las torres tapan al jugador. Rockstar Leeds resolvió esto mediante tres técnicas simultáneas:
  1. Ángulo de cámara inclinado entre $45^\circ$ y $60^\circ$ (nunca $90^\circ$ puro) para exponer fachadas y profundidad.
  2. Exageración deliberada del ancho de las avenidas respecto al tamaño del vehículo.
  3. **Desvanecimiento de oclusores (*occluder fade*):** cualquier volumen arquitectónico que intersecta el rayo entre la cámara y el jugador reduce su opacidad o recorta su techo automáticamente.
* **Asistencia invisible de conducción:** Al conducir en perspectiva cenital con teclado o controles táctiles, mantener el vehículo recto por un carril es difícil. *Chinatown Wars* aplica una corrección angular muy sutil hacia la dirección dominante de la vía cuando el jugador deja de girar.

#### D. *Grand Theft Auto 2* (DMA Design — Motor 2.5D v2)
* **Cómo usan el motor:** El formato de mapa `.gmp` almacena el mundo en una matriz volumétrica de $256 \times 256$ columnas con hasta $8$ niveles de altura ($Z \in [0, 7]$), donde cada cubo mide $64 \times 64 \times 64$ unidades. Cada bloque puede ser sólido, vacío, diagonal o con pendiente (en varios grados de inclinación), permitiendo pasos elevados y túneles reales.
* **La magia del 2.5D verdadero:** Los edificios se proyectan en perspectiva real desde arriba (mostrando sus muros laterales hacia los márgenes de la pantalla), mientras que peatones, carros y trenes elevados son **sprites 2D** dibujados exactamente en la altura $Z$ correspondiente.
* **Identidad urbana mediante luz y paleta:** Aunque los tres distritos comparten la misma arquitectura cúbica, se sienten completamente distintos gracias a la paleta cromática, letreros, viaductos ferroviarios y un sistema de **iluminación dinámica por puntos** (faros de vehículos, sirenas policiales, neones y farolas sobre superficies oscurecidas).
* **Física vehicular:** Mucho más disfrutable que la de *GTA 1* porque separa masa, aceleración y agarre lateral, permitiendo derrapes controlados y colisiones elásticas donde el mobiliario menor no detiene el auto en seco.

#### E. *Grand Theft Auto 1* (DMA Design — Motor 2.5D v1)
* **Cómo usan el motor:** El precursor directo del 2.5D cenital: cubos extruidos verticalmente con baldosas texturizadas de $64 \times 64\text{ px}$ en techos y fachadas, y una cámara cuyo zoom responde en tiempo real a la velocidad del jugador.
* **Qué conservar:** El **zoom dinámico por velocidad**. Ir a pie o en bicicleta requiere cercanía para leer andenes, puertas y señales; ir en carro rápido por la Autopista Sur requiere alejar la cámara para anticipar cruces.
* **Qué descartar:** Colisiones inelásticas contra obstáculos (frenado total frustrante) y ausencia de pendientes suaves o visibilidad anticipada de curvas.

---

## 3. Referentes Complementarios para *Turno Cero* (Extracto Modular)

Dado que *Turno Cero* aspira a integrar autos de lujo/colección, competencias (NASCAR/F1), carreras callejeras, mundo abierto a pie, motos y eventualmente aviones, el riesgo principal es la **dispersión técnica**. La siguiente tabla define exactamente qué extraer de cada referente mencionado y en qué cápsula debe vivir:

| Referente | Mecánica o solución visual a extraer | Cápsula de *Turno Cero* |
| :--- | :--- | :--- |
| **#DRIVE** | Generación procedural de carreteras panorámicas por biomas y lectura limpia de tráfico/paradas de servicio. | Modo Carretera Infinita / Travesía |
| **PAKO Forever** | Espacios abiertos con cámara cenital muy elástica, micro-derrapes ágiles y alta densidad de obstáculos destructibles. | Persecuciones en Mundo Abierto |
| **FR Legends** | Modelo físico enfocado en ángulo de derrape (*drift*), transferencia de peso y estética estilizada de autos. | Física de derrape callejero |
| **APEX Racer** | Estética pixel art de alta nitidez para personalización de carrocerías, rines, motores y garaje 2D. | Garaje, colección y tuning 2D |
| **Forza Horizon** | Estructura de festival en mundo abierto que conecta eventos discretos (circuito, callejera, velocidad) mediante portales en el mapa. | Progresión y selector de eventos |
| **1945 Air Force / Missiles / Simulador de Vuelo 3D** | Capa aérea independiente (`Z-Layer = 2`) con cámara alta, proyectiles/esquive arcade y controles simplificados sin colisionar con calles base. | **Fase posterior (Fase 5):** Cápsula Aérea desacoplada |

**Regla de alcance:** *Turno Cero* debe consolidar primero **el Mundo Abierto Cenital (autos + personaje a pie)** y **el Modo Carreras Retro Pseudo-3D**. Motos se suman como un perfil físico dentro de los mismos motores; aviones y F1/NASCAR entran como cápsulas separadas una vez validado el núcleo base.

---

## 4. Ingeniería de Datos GIS: Saneamiento Definitivo del Valle de Aburrá

El error fundamental en `motor-valle` y `motor-city` ocurre **antes de abrir el navegador**: los datos crudos de OpenStreetMap y SRTM deben pasar por un **pipeline determinista de saneamiento geométrico** (en Python con `shapely` y `numpy`, dentro de `tools/`) antes de generar `ciudad.js` y `valle.js`.

### 4.1 Ley de Soberanía Vial (cero edificios sobre calles)
Para garantizar que ningún lote ni edificio vuelva a pisar una calle, el preprocesador debe construir primero la máscara vial $M_{vial}$ con anchos normalizados según jerarquía:

| Jerarquía OSM (`highway`) | Ejemplo en Valle de Aburrá | Ancho jugable $w$ | Margen de andén $m$ |
| :--- | :--- | :--- | :--- |
| `motorway` / `trunk` | Autopista Sur, Av. Regional | $22\text{ m}$ | $3.0\text{ m}$ |
| `primary` | Av. Oriental, San Juan, La 80, El Poblado | $15\text{ m}$ | $2.5\text{ m}$ |
| `secondary` / `tertiary` | Calles colectoras de barrios | $11\text{ m}$ | $2.0\text{ m}$ |
| `residential` | Vías barriales internas | $8.5\text{ m}$ | $1.5\text{ m}$ |
| `cycleway` | Ciclorrutas EnCicla | $3.5\text{ m}$ | $0.8\text{ m}$ |
| `railway` (Metro) | Viaducto Línea A / Línea B | $10\text{ m}$ | $2.0\text{ m}$ |

Para cada polígono de edificio o lote $B_i$ proveniente de OSM, se aplica la diferencia booleana contra la unión de corredores viales y sus márgenes de andén:

$$M_{vial} = \bigcup_{j} \text{Buffer}\left(V_j, \frac{w_j}{2} + m_j\right)$$

$$B_i^{\text{limpio}} = B_i \setminus M_{vial}$$

Posteriormente se aplican tres filtros de higiene geométrica:
1. Si $B_i^{\text{limpio}}$ se fragmenta en multipolígonos, se descartan los fragmentos con área $A < 16\text{ m}^2$.
2. Se simplifican vértices redundantes mediante el algoritmo Douglas-Peucker con tolerancia $\epsilon = 0.6\text{ m}$ para reducir el peso del archivo JS.
3. Si el edificio intersecta el cauce del Río Medellín o quebradas principales (quebrada Santa Elena, La Iguaná, Doña María), también se recorta contra la máscara hídrica $M_{agua}$.

### 4.2 Suavizado del relieve SRTM y zócalos de cimentación en laderas
Para que Medellín conserve sus montañas y pendientes reales sin edificios flotantes ni vías quebradas:

1. **Suavizado longitudinal de ejes viales:** Al muestrear alturas $z(s)$ desde el DEM SRTM a lo largo de una calle parametrizada por distancia $s$, se aplica un filtro gaussiano o de Savitzky-Golay para eliminar los escalones de $30\text{ m}$. En cada intersección, todos los segmentos convergentes comparten exactamente el mismo valor de elevación $z_{nodo}$.
2. **Cálculo precompilado de pendiente:** Cada tramo vial almacena su pendiente longitudinal:
   $$g = \frac{z_2 - z_1}{\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}}$$
   Este dato alimenta directamente la física: en *Juega EnCicla* aumenta el consumo de estamina subiendo hacia Santa Elena o El Poblado y regala impulso al bajar; en *El Metro* y *Turno Cero* modifica la aceleración y distancia de frenado.
3. **Extrusión negativa (zócalos de ladera):** Para cada edificio situado sobre una pendiente, se calculan la altura mínima $z_{\min}$ y máxima $z_{\max}$ del terreno bajo sus vértices. El techo se fija en $z_{\text{techo}} = z_{\max} + h_{\text{edificio}}$, mientras la base de sus muros se prolonga por debajo de la cota mínima:
   $$z_{\text{base}} = z_{\min} - 6\text{ m}$$
   El tramo comprendido entre $z_{\text{base}}$ y $z_{\max}$ se texturiza como **zócalo de concreto o ladrillo estructural**, logrando que las casas en laderas de Manrique o Comuna 13 se anclen naturalmente a la montaña.
4. **Terrazas facetadas para montañas altas:** Fuera de la mancha urbana densa (Cerro Nutibara, Cerro El Volador, laderas orientales y occidentales), el terreno SRTM se triangula en una malla gruesa de baja densidad con *flat shading* direccional y tonos verdes/oliva escalonados por cota (estilo *Reckless Getaway 2*), evitando mallas pesadas y texturas borrosas.

### 4.3 Capas topológicas independientes (`Z-Layers`)
El Valle de Aburrá posee infraestructura en múltiples niveles superpuestos. Cada entidad vial, hídrica o móvil debe portar una propiedad entera `layer`:

| Capa (`layer`) | Elementos del Valle de Aburrá | Regla física y visual |
| :--- | :--- | :--- |
| **`-1`** | Río Medellín, quebradas canalizadas, deprimidos (Parques del Río, Bulerías) | Se dibuja primero; las calles en capa `0` cruzan por encima sin colisionar. |
| **`0`** | Red vial urbana estándar, ciclorrutas, parques, edificios base, estaciones a nivel | Nivel de circulación principal para peatones, bicicletas, carros y buses. |
| **`1`** | Viaducto elevado del Metro (Línea A), puentes vehiculares sobre el río y la Regional | Proyecta sombra sobre la capa `0`; las entidades en `0` pasan por debajo libremente. |
| **`2`** | Metrocables, helicópteros, aviones (*Turno Cero*) | Capa aérea independiente; nunca colisiona con tráfico terrestre. |

La transición entre capas (por ejemplo, subir a un puente o bajar a Parques del Río) se gestiona mediante nodos marcados como `ramp` que interpolan $z$ y actualizan `entity.layer` al cruzar el umbral.

### 4.4 Zonificación arquitectónica, rural e hídrica (identidad del Valle)
Para que los barrios se reconozcan sin depender de texturas pesadas, el preprocesador asigna a cada cuadrante un `biomeId` derivado de etiquetas OSM (`landuse`, `natural`, `building:levels`) y elevación:
* **Centro / La Candelaria:** Alta densidad, torres medianas/altas ($6\text{--}20$ pisos), fachadas concreto/vidrio, plazas, viaducto Metro protagonista.
* **Laderas populares (Nororiental / Comuna 13):** Casas compactas ($1\text{--}4$ pisos), paleta cálida de ladrillo rojo sin revocar y techos de zinc/teja, calles estrechas y empinadas.
* **El Poblado / Laureles / Envigado residencial:** Mezcla de torres claras y zonas verdes densas, árboles estilizados en separadores, avenidas amplias.
* **Corredor Río / Industrial (Guayabal / Bello / Itagüí):** Bodegas amplias de baja altura ($1\text{--}2$ pisos) con techos metálicos acanalados, canales de agua rectilíneos y puentes frecuentes.
* **Zonas rurales (Arví, Santa Elena, San Cristóbal, Caldas):** Baja densidad constructiva, fincas aisladas con teja de barro, carreteras sinuosas de dos carriles sin andenes, bermas de tierra y grupos de pinos/árboles facetados.
* **Agua y costas/orillas:** El Río Medellín se renderiza como un canal encajonado en concreto gris inclinado con franja de agua animada (ondas direccionales de sur a norte). Para eventuales circuitos costeros o playas en *Turno Cero*, se añade un bioma `coast` con transición de arena clara, espuma animada en la orilla y plano de agua azul turquesa saturado (inspirado en *Reckless Getaway 2*).

---

## 5. Arquitectura del Motor Cenital Híbrido (`motor-valle` + `motor-city`)

### 5.1 Decisión de renderizado: Proyección 2.5D en Canvas 2D vs. WebGL Low-Poly
Para un motor que compila a un **solo archivo HTML offline** y corre en **WebView Android**, existen dos caminos viables. La elección óptima es el **Motor 2.5D Extruido en Canvas 2D con Aceleración Espacial** (evolución directa de *GTA 2* + dirección artística de *Chinatown Wars* y *Reckless Getaway 2*), con una interfaz de dibujo abstraída que permita migrar a WebGL ligero si algún día se requiere:

#### Fórmula matemática de extrusión en perspectiva (estilo *GTA 2* en Canvas 2D puro)
Dado un punto base $(x_b, y_b)$ ya transformado a coordenadas de pantalla, el centro de proyección de la cámara $(c_x, c_y)$, la altura del edificio $h$ y el factor de perspectiva $k$ (típico $k \in [0.008, 0.016]$):

$$x_t = x_b + (x_b - c_x) \cdot h \cdot k$$
$$y_t = y_b + (y_b - c_y) \cdot h \cdot k$$

Con esta ecuación **no hace falta motor 3D pesado**:
1. **Descarte trivial de caras ocultas (*back-face culling*):** Para cada arista del polígono base $(P_a \to P_b)$, se calcula el producto cruzado 2D entre el vector de la arista y el vector hacia el centro de cámara. Solo se dibujan las paredes orientadas hacia la cámara (como máximo 2 paredes en un edificio rectangular), reduciendo a la mitad el costo de pintado.
2. **Sombreado direccional automático:** Cada pared visible recibe un tono calculado según el producto punto entre su normal 2D $\vec{n}$ y el vector solar fijo $\vec{L} = (\cos 45^\circ, \sin 45^\circ)$, generando luz cálida en fachadas iluminadas y sombra azulada en fachadas opuestas sin usar shaders complejos.
3. **Texturas proceduales o pixel art nítido:** Desactivando el suavizado (`ctx.imageSmoothingEnabled = false`) y pre-renderizando pequeños patrones en `OffscreenCanvas` (ventanas iluminadas, ladrillo, tejas, asfalto con líneas viales), se logra una estética pixel/híbrida cristalina a $60\text{ FPS}$.
4. **Oclusión dinámica (*Chinatown Wars*):** Si el polígono del techo proyectado $(x_t, y_t)$ contiene la posición en pantalla del jugador y el edificio supera los $10\text{ m}$ de altura, su opacidad (`globalAlpha`) interpola suavemente hacia $0.30$ para que el jugador jamás pierda de vista su vehículo.

### 5.2 Partición espacial (*Chunking*) y orden de dibujado
El archivo `ciudad.js` no debe ser una lista plana de polígonos. El preprocesador agrupa toda la geometría en una tabla hash de cuadrantes de $250\text{ m} \times 250\text{ m}$ indexados por clave `"cx,cy"`:

$$c_x = \left\lfloor \frac{x}{250} \right\rfloor, \qquad c_y = \left\lfloor \frac{y}{250} \right\rfloor$$

En cada fotograma:
1. Solo se consultan los $3 \times 3$ cuadrantes centrados en la cámara (o $5 \times 5$ a máxima velocidad).
2. El orden estricto de capas garantiza coherencia sin parpadeos:
   * **Capa 0 (Terreno y relieve):** Malla facetada del Valle + sombreado de ladera + parques y agua en `layer = -1`.
   * **Capa 1 (Red vial base):** Asfalto, carriles, pasos peatonales, ciclorrutas y marcas persistentes de frenado (*skidmarks*).
   * **Capa 2 (Sombras proyectadas):** Sombra direccional de edificios y **sombras de contacto** oscuras bajo vehículos, bicicletas y peatones.
   * **Capa 3 (Entidades en `layer = 0`):** Vehículos, bicicletas, peatones y props destructibles.
   * **Capa 4 (Arquitectura 2.5D ordenada por distancia al centro de cámara):** Se ordenan los edificios visibles de mayor a menor distancia euclidiana respecto a $(c_x, c_y)$ (algoritmo del pintor radial) y se dibujan paredes visibles + techo + detalles (aires acondicionados, antenas, tanques de agua).
   * **Capa 5 (Infraestructura elevada `layer = 1`):** Viaducto del Metro, puentes elevados, trenes y vehículos sobre puente.
   * **Capa 6 (Capa aérea y atmósfera `layer = 2`):** Metrocables, partículas (lluvia, polvo, humo), luces nocturnas aditivas (`globalCompositeOperation = 'lighter'`) y gradiente sutil *tilt-shift* / bruma en el $12\%$ superior de la pantalla.

### 5.3 Cámara cenital elástica
La cámara sigue una dinámica amortiguada por resorte (*spring-damped*), nunca pegada rígidamente al jugador:

1. **Anticipación vectorial (*Look-Ahead*):**
   $$\vec{P}_{\text{objetivo}} = \vec{P}_{\text{jugador}} + \alpha \cdot \vec{v}_{\text{jugador}}$$
   donde $\alpha \in [0.45, 0.75]\text{ s}$ desplaza el encuadre hacia donde se dirige el vehículo para revelar curvas y cruces con tiempo suficiente.
2. **Zoom dinámico por velocidad:**
   $$Z_{\text{objetivo}} = Z_{\max} - (Z_{\max} - Z_{\min}) \cdot \text{clamp}\left(\frac{\|\vec{v}\|}{v_{\text{ref}}}, 0, 1\right)$$
   con interpolación exponencial independiente de la tasa de fotogramas:
   $$Z_{t+\Delta t} = Z_t + (Z_{\text{objetivo}} - Z_t)\left(1 - e^{-\lambda \Delta t}\right)$$
3. **Rotación opcional configurada por modo:**
   * Norte fijo arriba (ideal para *Juega EnCicla* y *El Metro* por claridad geográfica del Valle de Aburrá).
   * Cámara rotatoria suave o inclinada siguiendo el vehículo (opcional en *Turno Cero* estilo *Chinatown Wars*).

### 5.4 Modelo físico unificado de vehículos y bicicletas
Para superar las colisiones secas de *GTA 1* y ganar la sensación viva de *GTA 2* y *Reckless Getaway 2*, la física 2D en plano horizontal descompone la velocidad del vehículo en su vector delantero $\vec{F}$ y su vector lateral $\vec{R}$:

$$v_{\text{adelante}} = \vec{v} \cdot \vec{F}, \qquad v_{\text{lateral}} = \vec{v} \cdot \vec{R}$$

El agarre lateral (*grip*) amortigua $v_{\text{lateral}}$ según la superficie y el estado de derrape:

$$\vec{v}_{\text{nueva}} = v_{\text{adelante}} \vec{F} + \left(v_{\text{lateral}} \cdot \mu_{\text{lateral}}\right) \vec{R}$$

* Si $\mu_{\text{lateral}} \approx 0.82$: conducción firme (bus del Metro, auto en asfalto seco).
* Si $\mu_{\text{lateral}} \approx 0.94$: derrape controlado (freno de mano en *Turno Cero*, lluvia o grava).
* **Efecto de la pendiente topográfica:** Se suma la componente gravitacional tangencial al eje del vehículo:
  $$a_{\text{pendiente}} = -g_{\text{grav}} \cdot \sin(\theta_{\text{pendiente}})$$
* **Colisiones elásticas con deslizamiento:** Al chocar contra un edificio, no se hace $\vec{v} = \vec{0}$; se proyecta la velocidad sobre la tangente del muro con una pérdida de energía proporcional al ángulo de impacto, permitiendo rozar paredes sin quedarse atascado. Los props ligeros (conos, canecas, avisos, cercas) tienen masa mínima y salen volando con rotación angular al ser golpeados.

---

## 6. Arquitectura Completa del Modo Carreras Pseudo-3D (*Free Gear* / *Sprint Club Nitro*)

### 6.1 Por qué *Free Gear* y *Sprint Club Nitro* se ven tan rápidos y por qué difieren de *The Need for Speed (1994)*
* **Escuela *OutRun* / *Top Gear* / *Free Gear* / *Sprint Club Nitro*:** La pista es una lista unidimensional de **segmentos horizontales** proyectados mediante división perspectiva. No existe malla 3D libre; las curvas son un desplazamiento horizontal cuadrático acumulado y las colinas son un desplazamiento vertical de los trapezoides con recorte contra el horizonte. Es extremadamente veloz en Canvas 2D (corre a $60\text{ FPS}$ en cualquier teléfono) y genera una sensación vertiginosa de velocidad gracias a las franjas alternadas del asfalto y los bordes.
* **Escuela *The Need for Speed* (1994, 3DO/DOS):** Utiliza una **cinta de polígonos 3D en corte transversal** donde cada sección define calzada, bermas y paredes de montaña/acantilados reales. Permite túneles cerrados y peraltes pronunciados, pero exige mucho mayor esfuerzo de modelado y ordenamiento 3D.

Para *Turno Cero* en un solo archivo HTML, el estándar ganador es el **motor pseudo-3D de segmentos proyectados (escuela *Free Gear*) enriquecido con físicas modernas, parallax del Valle de Aburrá y efectos dinámicos**.

### 6.2 Estructura de datos de la pista
Cada circuito se divide en $N$ segmentos uniformes de longitud $L_{\text{seg}} = 200$ unidades:

```text
Segmento[i] = {
  index: i,
  p1: { world: { x: 0, y: y_i,   z: i * L_seg     }, camera: {}, screen: {} },
  p2: { world: { x: 0, y: y_i+1, z: (i+1) * L_seg }, camera: {}, screen: {} },
  curve: float,        // 0 = recta, < 0 = curva izquierda, > 0 = curva derecha
  color: { road, grass, rumble, lane },
  sprites: [ { source, offset, scale } ], // árboles, vallas, postes, edificios laterales
  cars:    [ { offset, z, sprite, speed } ],
  clip: screenHeight   // cota máxima de recorte vertical calculada en Pasada 1
}
```

Las colinas se generan con interpolación cosenoidal (*ease-in-out*) para evitar quiebres bruscos:

$$y(t) = y_{\text{inicio}} + (y_{\text{fin}} - y_{\text{inicio}}) \cdot \left(\frac{1 - \cos(\pi t)}{2}\right), \qquad t \in [0, 1]$$

### 6.3 Matemáticas exactas de proyección
Con un campo de visión vertical $FOV$ (típico $100^\circ$, ampliable dinámicamente hasta $118^\circ$ al activar nitro), la profundidad de cámara $d$ es:

$$d = \frac{1}{\tan\left(\frac{FOV}{2}\right)}$$

Para proyectar cada punto $p$ en coordenadas de pantalla $(W \times H)$ desde una cámara situada en $(camX, camY, camZ)$:

$$z_{\text{cam}} = p.z - camZ$$

$$s = \frac{d}{z_{\text{cam}}}$$

$$X_{\text{pant}} = \frac{W}{2} + \frac{W}{2} \cdot s \cdot (p.x - camX)$$

$$Y_{\text{pant}} = \frac{H}{2} - \frac{H}{2} \cdot s \cdot (p.y - camY)$$

$$W_{\text{pant}} = \frac{W}{2} \cdot s \cdot W_{\text{pista}}$$

### 6.4 Acumulación de curvas y fuerza centrífuga
Al iterar los segmentos visibles desde el segmento actual del jugador (`baseIndex`) hasta `drawDistance` (aproximadamente $250\text{--}300$ segmentos):

1. Se inicializan los acumuladores $x_{\text{curva}} = 0$ y $dx = -(\text{baseSegment.curve} \cdot \text{basePercent})$.
2. En cada segmento $n$:
   * Al proyectar `p1`, se usa `camX - x_curva`.
   * Al proyectar `p2`, se usa `camX - (x_curva + dx)`.
   * Se actualizan:
     $$x_{\text{curva}} \leftarrow x_{\text{curva}} + dx, \qquad dx \leftarrow dx + \text{seg.curve}$$
3. En la física del jugador, la fuerza centrífuga empuja el auto hacia el exterior de la curva:
   $$playerX \leftarrow playerX - \left(\Delta t \cdot \frac{v}{v_{\max}} \cdot \text{baseSegment.curve} \cdot C_{\text{centrifuga}}\right)$$

### 6.5 El algoritmo de Doble Pasada y Recorte por Horizonte (`maxY`)
Aquí es donde suelen fallar las implementaciones caseras. Sin doble pasada y sin registro de `clip`, los autos lejanos aparecen flotando encima de las colinas cercanas.

* **Pasada 1 — De cerca hacia lejos ($n = 0 \to \text{drawDistance}$):**
  1. Se inicializa `maxY = H` (borde inferior de la pantalla).
  2. Se proyectan `p1` y `p2` del segmento.
  3. Se guarda `seg.clip = maxY` (la altura de horizonte actual que bloquea lo que esté detrás).
  4. **Descarte de caras ocultas y oclusión:** Si `p1.camera.z <= cameraDepth` o `p2.screen.y >= p1.screen.y` o `p2.screen.y >= maxY`, el segmento queda oculto tras una loma y se omite su dibujado.
  5. Si es visible, se dibujan los polígonos horizontales: franja de terreno/pasto de ancho completo, pianos/bermas, asfalto, líneas de carriles y niebla progresiva en los últimos 45 segmentos.
  6. Se actualiza `maxY = p2.screen.y`.

* **Pasada 2 — De lejos hacia cerca ($n = \text{drawDistance} \to 0$):**
  1. Se recorren los segmentos en orden inverso (algoritmo del pintor) para que los objetos cercanos tapen a los lejanos.
  2. Para cada rival o sprite decorativo lateral se calcula su posición y tamaño escalado con `scale`.
  3. **Recorte vertical exacto contra colinas:** Si el borde inferior del sprite supera `seg.clip`, se recorta la altura fuente del `drawImage` proporcionalmente al excedente:
     $$h_{\text{recorte}} = y_{\text{sprite\_inf}} - \text{seg.clip}$$
     De este modo, los autos rivales, postes y arcos de meta emergen suavemente por encima de la cresta de cada loma, replicando y superando la calidad visual de *Free Gear* y *Sprint Club Nitro*.

### 6.6 Mejoras sobre *Free Gear* y *Sprint Club Nitro* para *Turno Cero*
1. **Parallax vivo de 3 capas del Valle de Aburrá:** Cielo/nubes (factor $0.001$), cordillera del Valle (factor $0.002$) y silueta de edificios/árboles (factor $0.003$) desplazándose horizontalmente según `curve * speed` y verticalmente según la altura `camY` de las lomas.
2. **Sprites multi-estado y suspensión:** Cada vehículo cuenta con 6 variantes visuales (recto, giro suave, giro brusco $\times$ plano y subida), sacudida vertical de suspensión al pisar pianos o tierra, y chispas/humo de llantas en derrape.
3. **Rebufo (*Slipstream*) y Nitro con FOV dinámico:** Mantenerse a menos de $15$ segmentos detrás de un rival dentro del mismo carril reduce la resistencia aerodinámica y carga la barra de nitro; activar nitro incrementa el $FOV$ de $100^\circ$ a $116^\circ$, añade líneas cinéticas en los bordes y un sacudón corto de cámara.
4. **Tramos icónicos adaptados:** Circuitos inspirados en Las Palmas (subida empinada con curvas encadenadas), Autopista Regional nocturna (alta velocidad y túneles/puentes con arcos superiores) y circuito urbano del Centro/Estadio.

---

## 7. Hoja de Ruta de Implementación sin Regresiones

| Fase | Objetivo técnico | Entregable verificable |
| :--- | :--- | :--- |
| **Fase 0: Auditoría** | Inspeccionar archivos reales de `MetroZero` y `BicicletasUno`, mapear contratos de `motor-valle`, `motor-city` y scripts de compilación. | Informe de inventario sin modificar funcionalidad existente. |
| **Fase 1: Saneamiento GIS** | Actualizar pipeline de `tools/` con Soberanía Vial booleana, suavizado SRTM, zócalos de ladera, capas $Z$ y partición en chunks de $250\text{ m}$. | Nuevos `valle.js` y `ciudad.js` con $0$ edificios invadiendo vías. |
| **Fase 2: Renderizador 2.5D** | Refactorizar `motor-valle` y `motor-city` con extrusión 2.5D, sombreado direccional, *occluder fade*, sombras de contacto, cámara elástica y *tilt-shift*. | Escena cenital estable a $60\text{ FPS}$ en móvil/WebView. |
| **Fase 3: Integración EnCicla y El Metro** | Conectar el nuevo renderizador solo a los modos libres (Valle Libre en EnCicla; Ciudad Libre y Bus en El Metro) preservando el resto intacto. | Pruebas de regresión pasando en cabina, panorámica, Metrocable y los 9 oficios. |
| **Fase 4: Cápsula Pseudo-3D (*Turno Cero*)** | Implementar el módulo independiente de carreras estilo *Free Gear* con segmentos, curvas, colinas con recorte `maxY`, parallax, nitro y rebufo. | Circuito jugable completo a $60\text{ FPS}$ con IA de rivales. |
| **Fase 5: Expansión Modular (*Turno Cero*)** | Conectar mundo abierto cenital con garaje/colección 2D, física de derrape/motos y arquitectura lista para la capa aérea (`layer = 2`). | Prototipo cohesivo de *Turno Cero* sin saturar el peso del HTML único. |