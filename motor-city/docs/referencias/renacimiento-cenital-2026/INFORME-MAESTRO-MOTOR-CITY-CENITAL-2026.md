# MOTOR CITY, EL METRO, JUEGA ENCICLA Y TURNO CERO
## Investigación técnica de motores, representación geográfica, vista cenital híbrida, físicas, escenarios y carreras pseudo-3D

**Versión del informe:** 1.0 · **Fecha de corte:** 23 de noviembre de 2026  
**Alcance:** diagnóstico de código y documentación de los repositorios; investigación pública de referentes; diseño de arquitectura y plan de implementación.  
**Firma editorial:** Eón / OpenAI GPT-6 · Investigación y propuesta técnica.  
**Estado de verificación:** lectura de archivos y documentación de GitHub; investigación web. **No se ejecutaron los juegos, pruebas automáticas ni benchmarks reales en este informe.** El contenido de los cinco vídeos facilitados no se pudo reproducir directamente; se identifica con respaldo externo lo que fue posible.

> **Tesis principal.** El problema de los tres juegos no se resuelve escogiendo 2D *o* 3D. Se resuelve separando **la verdad geográfica (qué existe y dónde)**, **la verdad física (qué se puede atravesar, tocar o conducir)** y **la representación visual (cómo lo ve cada cámara)**. El mundo libre debe ser una ciudad tridimensional híbrida de aspecto cenital legible; cada actividad puede conservar su renderizador actual si consulta el mismo estado espacial.

---

## 0. Resumen ejecutivo y decisiones

**Diagnóstico prioritario:** MetroZero mezcla huellas reales de edificios con generación de volúmenes aproximados por casillas en su render WebGL cercano, y ya contiene tolerancias de colisión para datos solapados. Esta combinación puede originar edificios sobre calles, distorsión de manzanas y diferencias entre cámara y física. La falta de relieve urbano de detalle, las alturas estimadas, materiales repetitivos y sistemas de escena parcialmente paralelos agravan la sensación de una ciudad irreconocible. Una cantidad mayor de polígonos no arregla errores topológicos.

**Decisiones recomendadas:**
1. **Congelar los sistemas jugables existentes.** Intervenir primero solo en el mundo libre de El Metro y EnCicla y en la exploración de Turno Cero. Conservar las otras actividades y sus cámaras salvo arreglos de compatibilidad.
2. Crear un **contrato espacial común** con identidades persistentes de objeto, coordenadas en metros, terreno, capas verticales, geometrías navegables, render y colisiones derivadas de los mismos registros.
3. Sustituir el relleno de edificios sobre la cuadrícula por un **procedimiento de reconciliación cartográfica previo al build**, no por parches de ocultación mientras se conduce. Mantener edificios conocidos, verificar conflictos con vías y marcar las incertidumbres.
4. Usar la **cámara 3D cenital como modo principal del mundo libre**: inclinación casi vertical con leve vista de fachadas; cámara estable, zoom con tope, adelanto proporcional a velocidad, objetos que no tapen al personaje y sombras legibles. Ofrecer estilo pixel/2D como filtro o respaldo, no como otro mapa.
5. Separar **geometría, materiales e identidad local**: calles con ancho y pendiente correctos, fachadas por barrio, tejados coherentes, naturaleza por hábitat y edificios emblemáticos individualizados.
6. Adquirir el **mejor terreno base legalmente utilizable**; distinguir modelo de terreno sin objetos (DTM) y de superficie (DSM). El relieve de una carretera o terraza urbana no se obtiene simplemente aumentando la resolución gráfica de SRTM.
7. Conservar y mejorar el módulo **MC.Arcade** de carretera pseudo-3D; compartir trayectos y lógica de carreras con el mundo 3D cuando tenga sentido, pero usar otro renderer para carreras de corte retro como Freegear.
8. Construir una **escena piloto** pequeña y auditable antes de regenerar cientos de kilómetros cuadrados.

### Clasificación de evidencia

| Etiqueta | Qué significa | Ejemplo |
|---|---|---|
| V - Verificado en código/documentos | Se localizó una implementación o declaración identificable. No significa que haya sido probada en ejecución. | `MetroZero/src/js/22-gl.js` genera volúmenes por casilla y huellas reales. |
| P - Publicado por fuente externa | Existe referencia rastreable de autor, empresa, documentación o crítica. | Pixelbite declara que usa su motor interno BITE. |
| I - Inferencia técnica | Explicación compatible con el código; debe verificarse con medición, capturas y casos reales. | El doble origen de edificios favorece solapes. |
| R - Recomendación | Diseño propuesto, sin afirmar que ya exista. | Pipeline de conflictos edificio/vía con reporte de severidad. |

---

## 1. Inventario de los tres repositorios

### 1.1 ¿Cuál es el motor y cuál es el juego?

**`juanfeliperico369-stack/MetroZero`** es el videojuego *El Metro · La última vuelta* y conserva su propio núcleo, construido como un HTML autónomo con módulos `src/js/`, datos del Valle y sistema WebGL/Canvas. Su README describe Ciudad Libre, Bus, Metro, Metrocable, historia y actividades arcade. En el documento `TAREAS-IA.md` se especifica que **no debe migrarse completamente** a Motor City: la copia del motor viaja como referencia y conjunto de herramientas.

**`juanfeliperico369-stack/BicicletasUno`** es *Juega EnCicla*, un juego offline con nueve oficios, turnos, mapa real estilizado, simulación de bici, mundo libre, pixel art, gráficos 3D y múltiples minijuegos. Su código concatena módulos JS en una página única. En sus documentos se describe cartografía de casillas de 10 m, vías vectoriales y relieve. El juego conserva su propia lógica.

**`juanfeliperico369-stack/motorcity`** es la **fuente de verdad pretendida del motor compartido**. La versión declarada en `VERSION.json` durante esta lectura es **5.3.1**, con código JavaScript, Canvas 2D, WebGL, renderer Three.js integrado, mundo MC4, físicas y juego de prueba *Turno Cero* en `juegos/getaway/`. No debe confundirse el número de versión del motor con el de cada juego ni asumir que las copias incrustadas se mantienen siempre sincronizadas.

**Turno Cero** tiene documentación parcialmente orientada a una historia de espionaje/mafia y un prototipo autónomo con Manhattan ficticio. La nueva visión del autor prioriza colección de vehículos, mundo libre y diversas disciplinas de carreras. **Es una ampliación de producto y debe formalizarse como nueva biblia antes de modificar su canon anterior.**

### 1.2 Componentes detectados y puntos de entrada

| Función | Motor City | El Metro | EnCicla |
|---|---|---|---|
| Cámara | `js/34-camara.js` | `src/js/27-camara.js`, `36-libre.js` | `src/js/88-camara.js`, `99o-mundo3d-camaras.js` |
| Núcleo geográfico | `js/10-mundo.js`, `10-raster-sector.js`, `10-sectores.js`, `ciudades/`, `geo/` | `src/js/10-map.js`, `11-ciudad2.js`, `11-edificios.js`, `src/data/` | `src/js/20-map.js`, `22-sitios.js`, `src/data/` |
| Render 2D | `js/40-dibujo.js`, `41-vista2d.js`, `44-raster.js` | `src/js/11-ciudad2.js`, `35-ciudad.js` | `src/js/75-graficos.js`, `86-maqueta.js` |
| Render 3D | `js/45-gl.js`, `45-gl3d.js`, `45-tres.js` | `src/js/22-gl.js` | `src/js/75-lugares3d.js`, `99d-mundo3d.js`, `99o-mundo3d-camaras.js` |
| Física | `js/32-fisica.js`, `37-manejo.js` | `src/js/36-libre.js`, `30-conduce.js` | `src/js/30-ride.js`, `98q-manejo.js` |
| Modo retro | `js/47-clasicos.js` (`MC.Arcade`) | Actividades actuales, sin sustituirlas | Actividades actuales, sin sustituirlas |
| Mundo libre | `juegos/getaway/20-juego.js`, `60-modos.js` | `src/js/36-libre.js` | `src/js/69-libre.js` y módulos 99* |

**Nota sobre la arquitectura:** la proliferación de archivos que modifican o amplían el mismo sistema —sobre todo los módulos con prefijos altos— exige un inventario de hooks y orden de carga. No basta con decir que una funcionalidad existe: hay que identificar qué implementación termina siendo la activa.

### 1.3 Sistemas ya presentes que conviene conservar

- Mundo MC4 con `suelo`, `relieve`, `nivel`, vías, edificaciones y transporte; coordenadas basadas en metros y conversión geográfica.
- Cámara cenital/oblicua/maqueta; resortes de seguimiento, zona muerta, gesto de zoom e inclinación, adelanto por velocidad.
- Física con pendiente, salto, agua, pasos elevados, huellas de edificios, objetos y vehículos.
- 2D en Canvas y 3D en WebGL, con alternativa de Three.js integrada y respaldo para equipos de menor potencia.
- Render por regiones/losas, varias bandas de detalle y búsqueda local de elementos.
- Modo pseudo-3D de carretera por segmentos; vista de vuelo inspirada en Voxel Space.
- Múltiples oficios, modos y reglas educativas que NO deben desaparecer al corregir el mundo libre.

### 1.4 Problemas de ingeniería detectados o plausibles

| Riesgo | Evidencia | Gravedad | Tratamiento |
|---|---|---|---|
| Edificio sobre asfalto | `22-gl.js/buildNear`: huellas reales + relleno por casillas; tolerancias de colisión documentadas. | Crítica | Reconciliar mapas antes de generar mallas y fijar prioridad semántica por nivel. |
| Inconsistencia 2D/3D | Varios renderizadores y caches producen formas desde fuentes diferentes. | Alta | Contrato único de escena y tests de paridad por ID. |
| Relieve «liso» o intersecciones deformadas | Documentación `PLAN-REALISMO.md`: SRTM y detalle urbano insuficiente. | Alta | Terreno por niveles, breaklines, muros, cortes, rampas y calzada 3D. |
| Edificios genéricos / alturas estimadas | `PLAN-REALISMO.md`: atributos incompletos y estilos procedurales. | Alta | Catastro + fuentes abiertas + grado de confianza. |
| Lectura visual débil | Poca diferenciación tipológica entre barrios y materiales; inferencia artística. | Alta | Gramáticas de barrio, atlas y puntos de referencia. |
| Rendimiento desigual | Muchos edificios, atlas, datos Base64 y cachés; sin benchmark nuevo en equipo real. | Alta | Presupuesto por distancia y carga con medición p50/p95. |
| Estado de funciones mezcladas | Módulos paralelos y overrides de última fase. | Media-alta | Registro de dueño de función, API, test de integración. |
| Ruptura de actividades | Reemplazar cámara global afectaría Metro, oficios, minijuegos y carreras. | Crítica | Feature flags y aislamiento de mundo libre. |

---

## 2. Investigación de los cinco enlaces de gameplay

Se limpiaron los enlaces con redirección de Google y se obtuvo la siguiente lista **sin parámetros de seguimiento**:

1. https://www.youtube.com/watch?v=EH3h5B9TiyQ
2. https://www.youtube.com/watch?v=0skAS5QIYrE
3. https://www.youtube.com/watch?v=cRaZkqIRA3A
4. https://www.youtube.com/watch?v=NH9dXqeyBfU
5. https://www.youtube.com/watch?v=SqGbFtBU4Fs

**Limitación verificable:** la consulta directa de YouTube falló o fue limitada por el servicio. Los buscadores no ofrecieron metadatos suficientemente fiables para los vídeos 1, 2 y 4. El vídeo 3 aparece identificado en una página de recopilación como *GTA Chinatown Wars*; el vídeo 5 como un *Grand Theft Auto (GTA 1) – Full Game Longplay Walkthrough* de NeoGamer. Estas son **identificaciones externas**, no una reproducción ni análisis fotograma a fotograma. **No se atribuye un motor a los vídeos 1, 2 o 4 sin evidencia.**

| Enlace | Identificación alcanzada | Certeza | Siguiente evidencia requerida |
|---|---|---|---|
| `EH3h5B9TiyQ` | No verificable | Baja | Título/capturas/archivo MP4 |
| `0skAS5QIYrE` | No verificable | Baja | Título/capturas/archivo MP4 |
| `cRaZkqIRA3A` | *GTA: Chinatown Wars*, por fuente secundaria | Media | Confirmación directa del vídeo y escenas clave |
| `NH9dXqeyBfU` | No verificable | Baja | Título/capturas/archivo MP4 |
| `SqGbFtBU4Fs` | *GTA 1*, recorrido completo, por índice secundario | Media | Confirmación directa del vídeo y momentos de cámara |

**No se debe presentar esta matriz como cinco gameplays analizados.** Las comparaciones posteriores investigan títulos reconocidos y referencias expresamente nombradas por el autor, con fuentes independientes verificables.

---

## 3. Estudios de videojuegos y motores utilizados

### 3.1 Grand Theft Auto (1997) — el principio de la ciudad vertical legible

**Tecnología:** motor de DMA Design / Race'n'Chase y rasterización propia de época. La investigación técnica de OpenGTA documenta un mapa de columnas de bloques, con tipos de superficie, pendiente, capas verticales y texturas por cara. No es «un JPG visto desde arriba»: es una ciudad ordenada verticalmente y dibujada mediante capas. El proyecto OpenGTA documenta un mapa de 256×256 columnas, hasta seis bloques por columna y caras con tipos/texturas, además de una cámara cenital que sube o baja según la velocidad del vehículo.

**Aprendizajes:** conservar verticalidad semántica incluso en 2D; separar techo, pared, calle y agua; disponer de una jerarquía de capas; ampliar campo visual cuando aumenta la velocidad; controlar qué sprites se intercalan con muros. Una celda puede describir **suelo**, **paso superior** y **ocupante**, pero eso no implica que todos compartan altura.

**Aplicación:** el Valle debería almacenar `z_base`, `z_superficie`, `nivel` y `altura_edificio`, no solo `tipo_tile`. El Metro necesita continuidad en viaductos, la bicicleta en puentes y el automóvil en pasos a desnivel.

**Fuente:** https://opengta.emdzej.pl/guide/theory (documentación de una reimplementación/ingeniería inversa, no manual oficial original).

### 3.2 Grand Theft Auto 2 (1999) — profundidad y luz sin destruir la vista cenital

**Tecnología:** evolución del motor clásico con bloques de ciudad y elementos 2D/2.5D; giro fluido de sprites, efectos nocturnos y zoom. Fuentes históricas describen la preparación de autos desde modelos 3D hasta representaciones 2D. El valor no es copiar los píxeles sino entender la compresión visual: **mucha identidad visual con geometría contenida**.

**Aprendizajes:** variaciones cromáticas económicas, fachadas de pocos trazos, luces de ambulancias/patrullas que informan jugabilidad, techos que se distinguen del asfalto, trazas de frenado y reflejos controlados.

**Aplicación:** ofrecer un filtro «cenital clásica» alimentado por el mismo mundo 3D, con materiales de paleta limitada, líneas nítidas, sombra ligera e iconografía precisa.

**Fuentes:** https://gta.wiki/w/Grand_Theft_Auto_2 ; https://www.gamesradar.com/games/grand-theft-auto/i-think-one-of-the-reasons-gta-was-so-well-received-was-the-amount-of-detail-reflects-an-original-dev-no-one-ever-said-no-or-that-something-couldnt-be-done/

### 3.3 GTA: Chinatown Wars (2009) — referencia principal para el nuevo mundo libre

**Estudio:** Rockstar Leeds. **Motor:** tecnología 3D propia del juego; el nombre comercial exacto del motor no queda identificado por las fuentes consultadas y no debe inventarse. Gordon Hall, responsable del estudio, confirmó que se pretendía reconstruir en 3D la gran topografía de Liberty City. Las reseñas verifican cámara aérea inclinada y giratoria, edificios y vehículos 3D, zoom adaptativo y estética de cómic.

**Decisiones visibles:** el automóvil se lee en el centro del cuadro; las fachadas se perciben sin exigir una cámara al nivel de la calle; las esquinas y cruces conservan forma; el contorno de vehículos, aceras y obstáculos es claro. La imagen depende del **detalle local** y de reglas de sombreado coherentes, no de simulación fotográfica.

**Aplicación al Valle:** crear una «cenital viva» por defecto, estable y rotación opcional; convertir la arquitectura del Valle en lenguaje de materiales propios; destacar estaciones, paraderos y pasajes. No replicar el cel-shading exacto ni los assets de Rockstar.

**Fuentes:** https://www.gamespot.com/articles/grand-theft-auto-chinatown-wars-qanda/1100-6205684/ ; https://www.gamespot.com/articles/grand-theft-auto-chinatown-wars-hands-on/1100-6203423/

### 3.4 PAKO Forever — cámara estable, control inmediato y bajo costo visual

**Estudio:** Tree Men Games. Los créditos en MobyGames atribuyen **Unity** a *PAKO Forever*. El juego apuesta por una arena compacta, coches de silueta instantáneamente reconocible, geometrías low-poly, objetos fáciles de interpretar y tensión de persecución. El aprendizaje transferible es que una ciudad no requiere que cada accesorio sea sofisticado: requiere que el jugador interprete su velocidad, su rumbo, los espacios y el riesgo.

**Aplicación:** Turno Cero puede usar variantes de persecución corta; Metro y EnCicla pueden tomar la lectura de obstáculos para actividades seguras, manteniendo contenidos familiares. Una cámara suave con avance moderado suele ayudar más que una rotación excesiva.

**Fuentes:** https://www.mobygames.com/game/161122/pako-forever/releases/android/ ; https://apps.apple.com/co/app/pako-forever/id1352933197

### 3.5 Reckless Getaway 2 — caos físico claramente representado

**Estudio y motor:** Pixelbite indica en su web que sus juegos están desarrollados con **BITE**, motor interno. Esta afirmación es del propio estudio y no es una suposición basada en estética. El juego sirve para estudiar reacción visual al impacto, diversidad de vehículos, objetos destruibles, aumento de tensión y perseguidores que cierran rutas.

**Aplicación:** Turno Cero: choque arcade con impulso, deformación visual moderada, reglas de vuelco, partículas y daños. Metro/EnCicla: obstáculos y golpes sin convertir la experiencia familiar en un juego de destrucción. Evitar que la física del choque impida llegar a cualquier actividad.

**Fuente:** https://www.pixelbite.se/more-games/reckless-getaway-2/

### 3.6 #DRIVE — mirar por delante y construir identidad a bajo presupuesto

**Desarrollador:** Pixel Perfect Dude. La cámara elevada desde atrás, el paisaje que avanza, la sensación de ruta interminable y la variedad de vehículos y biomas son comparativamente más relevantes que copiar su acabado low-poly. **El motor exacto de producción no fue establecido de manera suficiente para atribuirlo aquí.**

**Aplicación:** carretera abierta de Turno Cero; biomas y ciclos meteorológicos; línea de horizonte; cambio de campo visual con velocidad; adelantamientos; señalización. Para el Valle, que sea un modo específico de conducción y no la cámara de mundo libre por defecto.

**Referencia de producto:** https://apps.apple.com/us/app/drive/id1366180154

### 3.7 Super Arcade Racing y Pixel Wheels — competición cenital precisa

*Super Arcade Racing* se comercializa como una experiencia de carreras 2D top-down con estética de 16 bits, contenido de carreras y juego local. *Pixel Wheels* ofrece un ejemplo de proyecto libre de carreras cenitales para PC y Android. Ambos ayudan a separar dos problemas: la precisión de trayectoria/colisión y la legibilidad del circuito.

**Aplicación:** circuitos cortos, cronómetros exactos, fantasmas reproducibles, límites de pista, IA que respeta la línea de carrera y rápida recuperación tras un error. Aprovechar pruebas abiertas y repositorios con licencia compatible; no copiar assets.

**Fuentes:** https://store.steampowered.com/app/1103770/ ; https://github.com/SwitchGDX/pixelwheels-switchgdx

### 3.8 Freegear (2010) — la referencia fuerte de carretera pseudo-3D

**Autor:** DieJay (según el propio comentario del creador en Newgrounds). Describe explícitamente *Freegear* como corredor **pseudo-3D**, inspirado en *Top Gear* y *Lotus Challenge*. Declara veinte carreras, cinco torneos, siete rivales, clima, mejoras del coche y nitro; también reconoce limitaciones de IA, choques e interfaz de su propio trabajo.

**Método visual:** la carretera se compone de segmentos sucesivos proyectados como trapecios hacia un horizonte; bermas, franjas, líneas y sprites se escalan por distancia; curvas y colinas modifican lateralmente el trazado y la posición vertical de las tiras. No exige una malla urbana 3D completa ni un motor de ray tracing.

**Aplicación:** Turno Cero debe conservar la fuerza de *Freegear* —sensación de velocidad, rivales, tráfico y rutas reconocibles— y superar sus limitaciones con geometría de carreteras reales y trazados propios, mejor adelantamiento de IA, mejores colisiones, cámara y presentación. La compatibilidad geométrica con MC4 puede aportar cerros y curvas reales sin forzar a que el renderer pseudo-3D dibuje toda la ciudad.

**Fuente primaria:** https://www.newgrounds.com/portal/view/545022

### 3.9 Pole Position, OutRun, Lotus, Top Gear y Mode 7 — el linaje técnico

**Pole Position / OutRun / Lotus / Top Gear:** carretera por rebanadas, sprites de vehículos, scroll por profundidad, skyline desplazado y bandas de color. No confundirse: las distintas obras usan implementaciones diferentes; el principio común de proyección por segmentos no autoriza afirmar un motor compartido.

**Mode 7 de SNES:** transforma un plano 2D mediante una operación afín por fila; fue valioso en su época, pero carece por sí mismo de las colinas y oclusiones complejas que una ruta tipo *Freegear* exige. Puede servir como opción de hardware bajo o suelo de minimapa, no como sustituto general del renderer por segmentos.

**Fuente de ingeniería accesible:** https://codeincomplete.com/posts/2012/6/23/javascript_racer_v1_straight/ y https://github.com/jakesgordon/javascript-racer

### 3.10 FR Legends, APEX Racer, Forza Horizon y grandes simuladores

Son referencias de **sistemas y sensaciones**, no plantillas gráficas que puedan trasladarse de forma literal al motor web ligero. Recomiendan: jerarquía de coleccionables y rarezas, progresión del garaje, tuneo con efectos reales, personalización, física adaptable por vehículo, feedback de volante, clases de carrera, progreso abierto y prueba de coches. Fórmula y NASCAR exigen reglamentos, IA y circuitos especializados; no es suficiente cambiar un sprite de carro.

**Advertencia de alcance:** un simulador de vuelo 3D auténtico implica aerodinámica, viento, superficies de control, instrumentación, altura y cámara diferentes de una carrera de carros. Puede compartirse mundo y reloj, pero requiere controlador y físicas propios.

---

## 4. Modelo visual correcto: «3D cenital híbrido»

### 4.1 Definición operativa

- **Terreno y volumen 3D real:** altitud, muros, casas, coches, árboles, viaductos, taludes, rampas, peatones y equipamientos.
- **Arte y HUD 2D:** iconos, rostros, señalización de accesibilidad, interfaces, ciertos sprites de detalle, minimapa y efectos de ambiente.
- **Materiales estilizados:** atlas de suelo, techos y fachadas de acabado original; pixelización opcional como postproceso coherente.
- **Física independiente del render:** no cambia el suelo ni las colisiones cuando se pasa a otra cámara.
- **Profundidad real:** oclusión por Z-buffer en WebGL; capa de transparencia o contorno cuando un objeto oculta al jugador.

La cámara casi vertical permite reconocer intersecciones y orientación, mientras la ligera inclinación permite ver las fachadas. Si se usa ortográfica estricta, el tamaño aparente no cambia con profundidad; si se usa perspectiva con campo visual estrecho, hay compresión similar pero pueden aparecer fachadas más naturales.

### 4.2 Parámetros actualmente implementados

En `motorcity/js/34-camara.js` se localizan perfiles definidos como: **cenital `pitch=1.38 rad` (aprox. 79° desde el horizonte), cerca `1.16 rad` (66°), FOV `0.62 rad` (aprox. 35.5°)**; oblicua con pitch cercano a 49° y maqueta con campo visual estrecho. La implementación estima la distancia de cámara a partir de zoom en píxeles por metro y alto del lienzo, y la modifica con velocidad/persecución. Esta es una buena base y no debería reescribirse por preferencia estética sin medirla.

### 4.3 Configuración inicial propuesta — **hipótesis para playtesting**

| Parámetro | EnCicla (mundo libre) | El Metro (Ciudad Libre) | Turno Cero |
|---|---:|---:|---:|
| Inclinación desde horizonte, base | 75°–82° | 74°–80° | 66°–79° |
| Inclinación cerca | 67°–75° | 65°–74° | 60°–72° |
| Zoom visual (control independiente de resolución) | ancho visible aprox. 80–150 m | 110–220 m | 140–300 m, dinámico |
| Seguimiento | suave, baja anticipación | suave, baja-media | anticipación según velocidad |
| Rotación | norte arriba por defecto | norte arriba por defecto | norte arriba o rumbo, ajustable |
| Cámara libre | sí, con reciente centrado | sí | sí, más controles cinemáticos |
| Ocultación por edificios | opacidad contextual | opacidad contextual | opacidad + silueta jugador |

**No son valores demostrados como óptimos**: deben ajustarse para móvil 412×860, horizontal 860×412 y escritorio; un coche rápido necesita ver más metros que una bicicleta.

### 4.4 Fórmulas y movimiento

Usar un mismo estado mundial `p = (x, y, z)` y proyección de cámara definida por `viewMatrix`, `projectionMatrix`. Para cámara centrada en vehículo:

`objetivoXY = posicion + direccion * min(k_adelanto * velocidad, ancho_visible / 6)`.

`zoom_dinamico = clamp(zoom_base / (1 + k_v * abs(velocidad)), zoom_min, zoom_max)`.

La altura debe entrar tanto en proyección como en colisiones. El flujo recomendable es actualizar simulación a paso fijo, interpolar para dibujo, actualizar cámara, seleccionar sectores visibles, dibujar opacos, luego transparentes y por último HUD.

**Principio de accesibilidad:** no hacer vibrar la cámara por aceleración normal. Sacudida solo para impactos, con opción de apagarla. Evitar giros bruscos por curvas: si la cámara gira con rumbo, debe ser un modo independiente configurable.

### 4.5 Resolución de objetos que ocultan al jugador

Al evaluar las cajas y polígonos entre cámara y actor:
1. Dibujo normal cuando nada oculta al jugador.
2. Si techo/árbol lo tapa, usar transparencia únicamente en el objeto o un recorte circular de visibilidad; no transparentar toda la ciudad.
3. Añadir contorno del personaje y posición en suelo cuando la obstrucción persiste.
4. Bajo puente, preservar **el tablero y sus sombras** sin forzar al jugador a aparecer sobre él.
5. Verificar que el algoritmo funcione al caminar, pedalear, subir un metro y pilotar un auto grande.

### 4.6 Qué no hacer

No desplazar techos en 2D sin conocer su altura real y además dibujar un prisma 3D del mismo edificio: aparecerá geometría duplicada. No duplicar superficies transitables para esconder errores. No usar generación aleatoria de casas como sustituto de huellas disponibles. No cambiar colisión por estado de cámara. No hacer del zoom del minimapa el zoom de los modelos 3D.

---

## 5. Cartografía del Valle de Aburrá: volver a sentir que es Medellín

### 5.1 La distinción crítica: tres clases de verdad

**Geométrica:** coordenadas de bordes, vías, lotes, edificios, ríos, estaciones y relieve.  
**Semántica:** andén, carril, plataforma, vivienda, taller, parque, puente, túnel, canal, escaleras.  
**Física:** dónde puede circular cada tipo de agente y a qué altura.

Para cada objeto importante definir `id`, `tipo`, `origen`, `confianza`, `geomXY`, `zMin`, `zMax`, `nivel`, `colision`, `material`, `estilo`, `LOD`, `timestampOrigen`. No debe haber dos entidades activas con la misma identidad importada desde fuentes diferentes.

### 5.2 Causa raíz: resolución raster vs geometría vectorial

Una casilla de 10 m es útil para cobertura de suelo y búsquedas aproximadas. No es suficiente para decidir dónde empieza una fachada, qué ancho tiene un andén, o si una vivienda invade un carril. Las **calles** deben conservar sus polilíneas y ancho; las **casas** sus polígonos; los **puentes** sus niveles, rampas y áreas; el raster funciona como clasificación/LOD o respaldo.

**Reconciliación previa al render:**
1. Proyectar todas las fuentes a un mismo sistema local métrico, validando ejes y origen.
2. Corregir polígonos inválidos, anillos, agujeros y duplicados por IoU e ID.
3. Construir geometría vial diferenciando eje, carriles, andenes y bermas. No confundir eje de calle con borde de asfalto.
4. Comparar por nivel vertical: un edificio sobre túnel puede ser válido; uno ocupando un carril de calzada a nivel igual requiere auditoría.
5. Resolver conflictos con jerarquía de fuente y confianza. No eliminar automáticamente toda casa que se cruza con un vector de vía; la vía también puede estar desplazada.
6. Generar un informe JSON/GeoJSON de cada conflicto antes y después y una galería de capturas deterministas de puntos conflictivos.
7. Exportar mallas 3D, colisión y topología del mismo resultado reconciliado.

### 5.3 Un detector de errores obligatorio

Para cada pareja `edificio B`, `área_vial R`, si sus intervalos verticales son compatibles, calcular `interseccion(B,R)`. Registrar `area_interseccion`, `ratio`, fuente de cada objeto y posición.

**Propuesta de umbrales para clasificación (calibración, no tolerancia universal):**
- < 0,3 m²: posible error numérico o lindero, inspeccionar por lotes.
- 0,3–2 m²: borde o voladizo; corroborar con fuentes.
- > 2 m² o intrusión significativa dentro del carril: error severo por revisar.
- Cualquier bloqueo de una vía crítica o entrada de estación: severidad crítica aunque el área sea pequeña.

El umbral final depende de resolución, ancho vial, precisión de origen y tipo de edificio. El algoritmo debe preservar excepciones reales como balcones sobre andenes y puentes sobre otras vías, representando su **altura**.

### 5.4 Precisión geográfica ≠ verosimilitud visual

Un mapa puede tener 600.000 huellas y seguir sin parecerse a Medellín si las cubiertas, colores, laderas y monumentos son genéricos. El orden de inversión recomendable es:

1. Trazados viales/agua/transporte sin fallos de topología.
2. Terreno, taludes, cotas de calles y viaductos.
3. Silueta real de manzanas y edificios.
4. Altura y tipología urbana por barrio.
5. Materiales y detalle de fachadas.
6. Vida y microdetalles.

**Zonas piloto:** centro/La Candelaria (densidad y referentes); Laureles (trazados residenciales y arbolado); El Poblado (desnivel y torres); ladera nororiental (terrazas y escaleras); corredor del río/Metro (puentes y niveles); Guatapé como entorno rural y lacustre. Son una selección propuesta, no zonas ya certificadas.

### 5.5 No usar material sin autorización

La documentación de Overture Maps advierte que hay huellas de menor precisión originadas en detección automática y un proceso de conflación entre fuentes. Importar huellas no garantiza altura, fachada ni exactitud. Registrar licencia y fuente por feature; cumplir las condiciones de OpenStreetMap/ODbL y las de cada dataset. No convertir capturas de Google Street View o imagery protegido en texturas/geometry si no existe autorización.

**Fuentes:** https://docs.overturemaps.org/guides/buildings/ ; https://docs.overturemaps.org/schema/v1.18.0/reference/buildings/building/

---

## 6. Topografía y entorno: cerros, laderas, subidas, bajadas, ríos y mares

### 6.1 DTM, DSM y problema de las elevaciones

Un **DTM** intenta representar la superficie desnuda del terreno. Un **DSM** incluye árboles, edificios y elementos expuestos. El DEM de Copernicus GLO-30 se publica como DSM; no debe intercambiarse automáticamente con un DTM. Un raster relativamente grueso puede describir la montaña general, pero no los muros de contención, accesos a viviendas, cunetas o rampas de calle.

**Modelo multicapa recomendado:**
- `terrain_z(x,y)` de fuente de elevación con procedencia.
- `road_z(s)` de rasante de vía continua por progresiva.
- `structure_z` y `levels` para viaductos, puentes, túneles y estaciones.
- `water_z(x,y,t)` para agua y caudal ficticio o datos abiertos si están disponibles.
- `cut_fill` para terraplén, corte, terraza, muro, talud y cunetas.

No retocar en pantalla el terreno debajo de cada rueda; la carretera debe haber sido reconciliada con la topografía antes del render.

**Fuentes:** https://doi.org/10.5270/ESA-c5d3d65 ; https://www.caa.cz/wp-content/uploads/2022/01/eurocontrol-tod-manual-ed-3-0.pdf

### 6.2 Montañas y pendientes

- Generar mallas con LOD jerárquico, bordes compartidos y *skirts* discretos contra grietas. Mantener una **malla de colisión suficientemente continua**.
- Establecer perfiles de ladera: terraza con fachada hacia pendiente; muro de contención; escaleras; vías que suben con secciones y no una cinta suspendida.
- Preferir texturas por pendiente, altitud y humedad: vegetación, roca expuesta, erosión, pastizal; nunca sembrar árboles aleatorios en una calzada o placa deportiva.
- Incorporar hitos de relieve como la silueta urbana de montañas; el realismo del valle depende de ver el valle alrededor del jugador.
- Medir gradientes con `pendiente = delta_z / distancia_horizontal`; validar límites por clase de vía y no allanar todas las montañas para facilitar la conducción.

### 6.3 Calles que ascienden

Una vía 3D necesita una **curva central con z** y dos bordes con pendientes coherentes; las intersecciones requieren una superficie de empalme, no simplemente cuatro segmentos que se cruzan. Construir `roadSurface(s,u)` —progresiva `s` y posición transversal `u`— con ancho variable, peralte suave y continuidad de normales.

Para una bicicleta, el controlador debe usar inclinación local y asistencia razonable; un coche tiene agarre longitudinal y lateral; un bus requiere radio de giro y frenado distintos. Evitar que el error de elevación de unos metros aparezca como un escalón infranqueable.

### 6.4 Ríos y quebradas del Valle

- Mantener el cauce como polígono o corredor de superficie, con cotas y dirección, no una simple etiqueta de raster azul.
- Puentes = tablero, pretil, espacio bajo tablero, accesos/ramplas y colisión de distinto nivel.
- El río Medellín no debe compartir shader con una laguna tranquila: corriente, espuma local y bordes de canal se representan con reglas distintas.
- Para quebradas pequeñas o zonas cubiertas, los datos incompletos deben producir **ausencia explícita de precisión**, no geometría inventada tapando una vía.

### 6.5 Lagos, embalses, playas y mares: escalabilidad del motor

No forman parte habitual del centro del Valle, pero sí son pertinentes a la visión de Turno Cero, Guatapé y futuros territorios.

**Embalse:** contorno de agua al nivel correcto, orillas según pendiente, islas, muelles, vegetación y limitaciones de navegación. **Playa:** zona húmeda y seca, transiciones de material, oleaje simple y colisiones de costa. **Mar abierto:** plano de agua por sectores, olas de vértice o normales animadas, niebla/horizonte, LOD y flotación; evitar simular millones de partículas. **Río:** flujo guiado por cauce y velocidad local. **Aviones:** altitud y detección de superficie deben consultar el mundo 3D; un avión no se posa automáticamente sobre una «casilla agua».

**Niveles de calidad sugeridos:**
- Bajo: color y espuma procedural por orilla, normal simple, sin reflexión en tiempo real.
- Medio: normales animadas/reflectancia simplificada y espuma en áreas cercanas.
- Alto: reflexión selectiva/SSR o plano, detalle de olas, mejores sombras.

---

## 7. Arquitectura urbana: casas, edificios, vías, andenes, zonas rurales

### 7.1 Edificios

**Nivel geométrico:** polígono real de planta, agujeros/patios, `min_height`, pisos, secciones, cubiertas y usos. **Nivel de lectura:** diferenciar centro, ladera, residencial, comercial, industria, pueblos; no asumir que toda torre es de vidrio ni que toda casa de ladera es ladrillo expuesto.

**Generación recomendada por capas:**
- LOD3/cerca: paredes, puertas, ventanas, zócalos, barandas y volúmenes significativos de techo.
- LOD2/media: volumen por huella + grandes huecos y techo simplificado.
- LOD1/lejos: prisma o silueta con atlas baked y altura correcta.
- LOD0/horizonte: impostores/silueta por sector, no miles de prismas individuales.

**Alturas:** priorizar campo de altura medido; después número de pisos contrastado; después estimación con intervalo `hMin/hMax`; cada material/fachada procedural debe ser reproducible por semilla estable. Un color aleatorio por frame es un bug visual.

### 7.2 Dimensiones orientativas para evaluación, no datos medidos del Valle

| Elemento | Rango de modelado inicial | Advertencia |
|---|---:|---|
| Carril de automóvil | ~2,8–3,6 m | Validar vía real, tipología y normas locales. |
| Andén urbano | ~1,2–3+ m | Gran variación real; no reservar automáticamente 2,6 m a toda vía. |
| Altura de piso residencial | ~2,6–3,2 m | No reemplaza catastro ni fichas de edificio. |
| Altura de bus | ~3–4 m | Depende de modelo; revisar galibo bajo puentes. |
| Puente: gálibo libre | Según infraestructura | No utilizar un valor único como verdad legal. |
| Textura fachada | 128–512 px por módulo reutilizable | Elegir por distancia en pantalla y memoria. |
| Atlas de materiales | 512–2048 px, perfil de dispositivo | Los tamaños son presupuestos, no obligación universal. |

### 7.3 Texturas y estilo

**Paleta controlada, variaciones basadas en material:** ladrillo, concreto, teja cerámica, pintura, asfalto, baldosa, vidrio, piedra y vegetación. Una textura repetitiva necesita suciedad procedural y bordes para evitar efecto «maqueta plástica». Usar atlas reutilizables, mipmaps, anisotropía moderada y compresión si el pipeline lo permite; evitar un PNG por edificio.

**Regla de credibilidad:** si un techo no puede demostrarse, generarlo conforme a tipología y marcarlo como estimado. No inventar la forma exacta en informes ni mapas de precisión.

### 7.4 Calles

Trazado vectorial con secciones: calzada, carril, línea divisoria, berma, sardinel, andén, ciclorruta, separador, cruces, resaltos. El espacio ocupado por vivienda se deriva de polígonos, no de invadir una casilla «tipo calle» porque ambos datasets tienen resolución diferente.

**Cruces:** triangulación especial con esquinas, cebras, pendientes y semáforos ligados a nodos; generar intersecciones después de segmentar viales, antes de texturizar. **Puentes:** rompen conexión vertical pero pueden cruzar visualmente. **Túneles/deprimidos:** admiten cubierta por encima y pasos interiores sin teletransporte.

### 7.5 Rural, montaña y pueblo

Reglas diferenciadas: parcelación menos densa, caminos de anchura variable, fincas, cultivos, potreros, bosque y caminos de tierra. Las construcciones no deben surgir con la frecuencia de una zona centro. Contextualizar vegetación por altitud/humedad y espacio libre; evitar el «bosque de árboles uniformes».

### 7.6 Hitos que fijan identidad

Edificios/emblemas y estaciones no pueden ser solo cubos con nombre: requieren silueta, acceso, posición y material correctos. Priorizar 20–40 hitos por escena piloto. Un edificio excepcional necesita modelo/procedural curado; una fachada normal puede ser modular.

---

## 8. Física y controles: un único mundo, varias experiencias

### 8.1 Tiempos de simulación

Usar `fixedDeltaTime` de referencia (p. ej., 1/60 s o un subpaso estable diseñado) con acumulador limitado y render interpolado. La documentación actual de `MC.Cuerpo.actualizar` ya descompone tiempos largos en subpasos de hasta 25 ms; debe probarse el comportamiento equivalente a 15, 30 y 60 FPS. Evitar ajustar velocidad de juego directamente a FPS.

### 8.2 Bicicletas

Arcade sensible a control, peso creíble al virar, velocidad afectada por pendiente sin volverse inmanejable, frenada dosificable, superficies diferenciadas, no atravesar sardineles altos, capacidad de transportar al jugador de forma intuitiva. El objetivo principal es recorrer la red real sin atascarse ni derrapar sin motivo.

### 8.3 Metro, tranvía y bus

Los vehículos guiados por carril o vía férrea usan curva y topología propias; el modo cabina, lateral o panorámico puede seguir intacto. La vista cenital del mundo libre debe representar su ruta a la altitud correcta, pero no imponer el controlador de automóvil sobre un tren.

### 8.4 Carros y motos de Turno Cero

Dos perfiles de conducción **con reglas comunes del mundo**: Arcade (respuesta rápida, asistencia de giro, recuperación predecible), y Simulación ligera (deslizamiento, curva de par, tracción, frenado, diferencias de masa). El botón de acelerar continuamente debe seguir siendo opcional. Para motos, inclinación, transferencia de peso y choque suave; para coches de fórmula, agarre y ancho diferentes, aerodinámica simplificada y carrera en circuito.

### 8.5 Vuelcos, saltos, deformación y obstáculos

Un coche puede rebotar y recuperar estabilidad, pero debe existir una condición clara de «volcado» y reinicio. Los objetos destruibles no deben ser paredes infinitas ni permitir un atajo físicamente absurdo. Separar colisión estática de escena (edificios, taludes) de objetos dinámicos (conos, vallas, vehículos). Identificar impactos por velocidad relativa y masa efectiva; limitar efectos visuales para no saturar móvil.

### 8.6 Aviones

En modo arcade usar control de guiñada/cabeceo/altura y velocidad mínima de sustentación; en modo avanzado usar `L = 0.5*rho*V²*S*Cl` y arrastre `D = 0.5*rho*V²*S*Cd`, con integración estable. Necesita pista y reglas de terreno. No usar la física de coche con `z += velocidad`.

### 8.7 Pruebas de físicas

- Cruzar una calle, bordillo, puente y rampa sin saltos absurdos.
- Un túnel permite un vehículo abajo y otro arriba simultáneamente.
- Una bici y un auto comparten mapa pero tienen huellas de colisión distintas.
- El volante no gira más rápido por tener 120 FPS.
- La IA respeta vías y carriles, no ataja a través de edificios.

---

## 9. Carreras 2D retro: reconstrucción disciplinada del modo Freegear

### 9.1 El error de enfoque más común

Un corredor pseudo-3D no es una cámara 3D que mira un mapa plano; tampoco una cinta asfalto girada con `transform`. Es un renderer específico cuya geometría se define por un eje de ruta y segmentos con curvatura, anchura, altura y materiales.

Motor City ya implementa `MC.Arcade` en `js/47-clasicos.js` y lo expone en Turno Cero con `juegos/getaway/55-clasicos.js`. Antes de crear otro renderer debe auditarse la función `dibujar`, el modelo de carretera, el orden de proyectado de sprites, la extracción de `M.carretera` y el acoplamiento a `MC.Cuerpo`.

### 9.2 Contrato de pista

```text
Track {
  id, nombre, longitud, vueltas, bioma, clima,
  centro: [ {s, x, y, z, rumbo, curvatura, ancho, peralte, superficie} ],
  objetos: [ {id, s, lateral, altura, tipo, colision, atlas} ],
  sectores: [ {s0, s1, entorno, densidad, regla} ],
  checkpoints, parrilla, boxes, trazadaReferencia
}
```

`Track` puede salir de una vía MC4 o de un circuito diseñado a mano. **Para mundos reales:** la ruta 3D enlaza calles; la carrera pseudo-3D usa una parametrización de esa ruta. Las geometrías pueden compartir datos, pero no es obligatorio que una carrera histórica o fantástica ocurra sobre una calle real.

### 9.3 Proyección de segmentos

Para punto mundial en coordenadas locales de cámara `(X,Y,Z)`, profundidad `Z > near`, proyectar:

`screenX = W/2 + focal * X/Z`  
`screenY = H/2 - focal * Y/Z`  
`screenHalfRoadWidth = focal * roadHalfWidth / Z`.

Cada segmento lleva curva, ancho, altura, peralte y variación de sección; pintar de lejos hacia cerca con clipping de horizonte. La intersección entre dos rebanadas produce un trapecio de asfalto, separadores, bordes y vegetación. No trazar la curva del futuro como si fuera una textura 2D deformada arbitrariamente: acumular desplazamiento local en la base de segmentos y suavizar transiciones.

### 9.4 Subidas y bajadas

La elevación del eje de pista controla `Y` en perspectiva. Una cresta puede ocultar segmentos: mantener el límite vertical de visibilidad por columna o por tramo para no dibujar asfalto detrás de la colina. Una bajada no debe mostrar el reverso de la carretera. El motor 3D usa geometría real; el pseudo-3D representa **esa elevación** con proyección de segmentos, no con la simulación completa de un vehículo suspendido sobre polígonos.

### 9.5 Sprites y entorno

- Auto jugador: sprite de vista trasera o modelo 3D prerenderizado por dirección/inclinación; variar estado de frenado, daño, luces y nitro.
- Rivales: `s` longitudinal + `u` lateral y velocidad; escalar por profundidad, ocluir detrás de colinas y objetos cercanos.
- Arcén: postes, setos, árboles, casas, cerros lejanos en distintas capas de paralaje.
- Pistas urbanas: skyline por sector y siluetas de edificios del mapa; **no dibujar miles de ventanas en cada cuadro**.
- Pista húmeda: specular simplificado y salpicaduras; nube/niebla de distancia; nieve/arena si hay biomas de carretera.

### 9.6 IA de rivales y carreras

Ruta de carrera y planificación de adelantamiento: distancia longitudinal, carril preferido, espacio libre, velocidad relativa, línea interior/exterior y zona segura. La IA no debe cambiar de carril con movimientos instantáneos ni atravesar coches. Añadir estrategias de riesgo parametrizadas por dificultad y masa/agarre.

### 9.7 Lo que faltaría para superar Freegear

1. Curvatura continua con peralte y colinas creíbles.
2. Sprites o vehículos 3D coherentes con el tamaño de cada tramo.
3. Oclusión correcta de rivales y objetos por cresta/curva.
4. Controles intuitivos, asistencia configurada y retroalimentación temprana.
5. Eventos y campeonatos con identidad; cronometraje y reglas reproducibles.
6. Tráfico y adelantamiento con IA competente.
7. Paisajes de fondo por bioma y clima; calles reales en modos compatibles.
8. Modo pantalla completa, móvil y ordenador, con controles táctiles no invasivos.
9. Minimap de carrera, posición, vueltas, récord, combustible/nitro solo si aporta diseño.
10. Pruebas con túneles, bifurcaciones y carreteras de montaña.

---

## 10. Renderizado y rendimiento para el Valle completo

### 10.1 Los sectores ya existen, pero no equivale a streaming perfecto

La documentación `MC4-STREAMING-TERRITORIAL.md` explica que una propuesta sectoriza `suelo` y `nivel` por bloques cercanos a 1 km, pero que otros datos pueden permanecer completos y la carga Base64 todavía reside en el HTML. Debe verificarse qué partes fueron integradas en `main` antes de hacer afirmaciones sobre memoria. Un cache de mallas no soluciona una descompresión completa de datos ni el costo de construir millones de triángulos.

### 10.2 Propuesta de jerarquía

**Nivel 0:** región kilométrica, metadatos e índice.  
**Nivel 1:** cuadrantes 160–250 m, suelo, masas de edificios, carreteras.  
**Nivel 2:** 40–80 m, detalle cercano de fachadas, andenes, objetos y tráfico.  
**Nivel 3:** objetos interactivos por radio de jugabilidad, animaciones y colisiones precisas.

Estas dimensiones se ajustan a medidas existentes (Motor City dispone de losas 160 m; Metro usa distintos tamaños por LOD). No es obligatorio reexportar todo a una nueva malla si se puede conservar las regiones y reforzar sus límites.

### 10.3 Presupuestos de cuadro y GPU

- Definir presupuestos por dispositivo **después de medir**: p50, p95 y p99 del tiempo de frame; tiempos de CPU de preparación, render y streaming; draw calls; polígonos; texturas; bytes en memoria; fallos de contexto WebGL.
- Perfilar tres escenas: centro urbano denso, ladera con montaña, viaductos con transporte; medir día y noche.
- Precalcular materiales/atlases y agrupar mallas estáticas por sector/material.
- Instanciar objetos repetidos (`InstancedMesh`/equivalente) para árboles, postes, lámparas y vehículos lejanos; reservar individuales para entidades interactivas.
- Hacer culling por frustum y oclusión donde tenga sentido; niebla no debe ocultar solamente que el motor está trabado.
- Poner límites explícitos a sector-cache, generación de geometría por frame y modelo de objetos de física.
- Reusar buffers, evitar asignaciones en la ruta caliente y verificar ausencia de fugas al cambiar de ciudad/mode.
- Usar fallback Canvas 2D si el dispositivo carece de GPU compatible; el mapa debe seguir siendo correcto.

**Fuentes:** https://threejs.org/docs/pages/InstancedMesh.html ; https://github.com/CesiumGS/3d-tiles/blob/main/specification/README.adoc

### 10.4 Indicadores de aceptación inicial (objetivos, NO resultados medidos)

| Indicador | Objetivo exploratorio | Método |
|---|---|---|
| Colisiones edificio-calle de igual nivel | 0 severas en zona piloto | Detector GIS con casos revisados |
| Cámara ↔ mundo 2D/3D | error posicional < 0,5 m para hitos de prueba | Capturas con marcas y consultas de coordenadas |
| Cambio de cámara | 0 teletransportes / 0 cambios de colisión | Test de escena y vehículo |
| Móvil modesto | objetivo de 30 FPS estables en escena piloto | Dispositivo físico, p50/p95 |
| Escritorio | objetivo de 60 FPS en escena piloto | Browser con GPU real |
| Rutas/puentes | 100% de pruebas fijadas en fixture | E2E determinista |
| Carga por sector | 0 pantallas en blanco, sin p95 inaceptable | Instrumentación y recorrido |

**Importante:** estas métricas serán refinadas desde un benchmark inicial. No presentar el cumplimiento de un objetivo como hecho sin logs/capturas de prueba.

---

## 11. Estrategia por videojuego: preservar actividades

### 11.1 Juega EnCicla

**Mundo libre:** cenital 3D de inclinación elevada, bicicleta visible, ciclovías y estaciones geográficamente legibles, andenes y pendientes, calles con tráfico y cruces seguros. **No reemplazar:** los nueve oficios y sus minijuegos, el modo revista pixel, turnos, escenas educativas y sistemas de progresión. **Probar especialmente:** ciclorrutas, zonas de préstamo, laderas con escalones, tráfico en doble nivel, enrutamiento de bici y accesibilidad táctil.

### 11.2 El Metro

**Ciudad Libre:** cenital 3D híbrida con líneas ferroviarias, estaciones, viaductos, tranvía, buses y peatones; interacciones y puntos de acceso integrados sin puertas invisibles. **No reemplazar:** simulador de Metro panorámico/cabina, bus, Metrocable, minijuegos y narrativa. **Probar especialmente:** cruces calle-riel, alturas de estaciones, plataformas sobre ciudad, sombra de viaductos y transiciones de cámara al abordar.

### 11.3 Turno Cero

**Mundo libre:** cenital estilizada 3D con variedad de coches/motos, garajes, tráfico, eventos y colección. **Modos independientes:** carreras de circuito (Fórmula/óvalo), callejeras, derrape, persecución, rutas panorámicas 3D, carreras pseudo-3D retro y aviación arcade; cada uno utiliza controlador, HUD y cámara apropiados.

**Nueva dirección de producto propuesta:**
- Garaje/catálogo: clases, rarezas transparentes, historial, upgrades explicados, pintura y piezas visuales.
- Mundo/actividades: entrada inmediata desde el mapa libre a carreras y pruebas con misma entidad del jugador cuando corresponda.
- Progresión: reputación, campeonatos, patrocinios ficticios, retos, colección; evitar monetización obligatoria.
- Identidad: tono rudo pero simpático; narrativa opcional; decidir clasificación por edades antes de fusionar el producto con el canon adulto de espionaje existente.
- Racing retro: `MC.Arcade` mejorado, no un segundo sistema improvisado paralelo.

### 11.4 Matriz de aislamiento

| Sistema | Compartir entre proyectos | Personalizar por juego |
|---|---|---|
| Coordenadas, elevación, geometría, puente, colisión | Sí, contrato de mundo | Ajuste de precisión local |
| Cámara cenital base | Sí, implementación y pruebas | Perfil, zoom, HUD, estilo |
| Tráfico y física | APIs y modelo base | Masa, dificultad, reglas educativas |
| Edificios/vegetación | Datos y arquetipos | Estética, paleta, densidad, música |
| Historia y progreso | No fusionar | Propios de cada juego |
| Carrera pseudo-3D | Renderer reutilizable | Vehículos, pistas, torneos, contexto |
| Cabina de Metro, minijuegos de EnCicla | No reemplazar | Conservar |

---

## 12. Plan de trabajo — fases y entregas verificables

### Fase 0 — congelar base y medir

- Registrar SHA de `main`, versión, scripts de build, pruebas y tamaño de artefactos de los tres repositorios.
- Crear branch/PR por tarea, revisar agentes concurrentes y evitar edición de los mismos archivos sin coordinación.
- Ejecutar baterías de Node y Chromium disponibles y generar capturas basales de escenas piloto.
- Medir p50/p95/frame, memoria aproximada, draw calls, tiempos de carga y conflictos de mapa antes de modificar.
- Inventariar overrides JS; definir dueño activo de cada render y modo.

**Salida:** `BASELINE.md`, `baseline.json`, capturas con IDs, lista de tests que sí pasaron/fallaron.

### Fase 1 — escena geográfica de referencia

- Elegir 6 distritos de prueba y 20 intersecciones conflictivas.
- Construir detector de solape por nivel con reporte y correcciones rastreables.
- Unificar fuente de elevación y reglas de suelos para esas áreas.
- Introducir capa de colisión alimentada por geometría reconciliada.
- Bloquear la creación de **nuevos** edificios procedurales cuando existan huellas verificadas dentro de la misma región.

**Salida:** `geometry-conflicts.geojson`, `geometry-report.md`, fixtures y pruebas automáticas.

### Fase 2 — cenital 3D principal

- Formalizar `SceneAdapter` que recibe objetos validados y emite mallas 3D, dibujado 2D y consultas de física.
- Ajustar cámara por juego; suavizado, límites, transparencia contextual y control norte/rumbo.
- Crear atlas inicial por tipología urbana; marcar edificios emblemáticos.
- Renderizar el mismo ID de objeto en dos cámaras sin cambiar su colisión.

**Salida:** escenas A/B, tests de proyección, capturas día/noche y vídeo comparativo de recorridos.

### Fase 3 — elevación e infraestructura

- Corregir carretera 3D por secciones y topografía; integrar niveles de puentes y túneles.
- Añadir muros, taludes, rampas, escaleras, río y zonas rurales.
- Implementar transiciones con vehículo, bicicleta, peatón y transporte.

**Salida:** pruebas de pasos desnivelados, montañas, agua y continuidad de vías.

### Fase 4 — carreras retro Turno Cero

- Aislar `MC.Arcade` en renderer/pista/control de carreras; conectar `Track` con rutas MC4.
- Añadir curvas, colinas, sprites con oclusión, rivales, IA, HUD y cronómetro.
- Una ruta urbana y otra de montaña; una competición con reinicio inmediato.

**Salida:** dos carreras completas, deterministas y jugables en móvil/escritorio.

### Fase 5 — optimización y expansión

- Sectorización efectiva de geometría, alturas y vías; precarga adaptativa.
- LOD, instanciado, buffers, compresión y pruebas físicas.
- Revisión de accesibilidad, estilos, calidad gráfica por equipo.
- Ampliar territorio solamente tras superar las pruebas de las zonas piloto.

**Salida:** reportes comparativos antes/después y PRs listos para revisión.

---

## 13. Backlog priorizado de ingeniería

| ID | Prioridad | Trabajo | Archivo(s) de referencia | Aceptación |
|---|---|---|---|---|
| GEO-01 | P0 | Detector de colisiones edificio-vía por nivel | `motorcity/geo/`, `js/10-mundo.js`; Metro `11-ciudad2.js` | Reporte GeoJSON + fixture con 0 severas tras resolver caso piloto. |
| GEO-02 | P0 | Suprimir relleno inválido en zonas reales sin eliminar calles | Metro `22-gl.js`, `11-edificios.js` | A/B visual y física para 20 intersecciones. |
| GEO-03 | P0 | Contrato compartido de altura, rasante, niveles | `js/10-mundo.js`, `32-fisica.js` | Puente/túnel validado en 2D/3D. |
| CAM-01 | P0 | Perfil «cenital libre» único, aislado | `js/34-camara.js`, Metro `36-libre.js`, EnCicla `99o-...` | Misma posición de objeto y controles estables en 3 vistas. |
| REG-01 | P0 | Protección de actividades actuales | builds/tests y hooks de cada repo | Pruebas de 100 partidas y regresión específica. |
| TERR-01 | P1 | Road surface en pendiente, taludes y rampas | `js/15-terreno.js`, `45-tres.js` | Sin vías flotantes/sumergidas en piloto. |
| VIS-01 | P1 | Gramática de barrios y atlas de fachadas | `js/16-estilos.js`, `45-gl3d.js` | 6 escenas distinguibles sin UI. |
| VIS-02 | P1 | Transparencia selectiva/oclusor personaje | `js/45-tres.js`, cámaras | Jugador siempre localizable, sin paredes transparentes globales. |
| RACE-01 | P1 | Pista 3D a segmentos pseudo-3D | `js/47-clasicos.js` | Curvas y colinas, cámara correcta en 2 pistas. |
| RACE-02 | P1 | Rivales con profundidad y adelantamiento | `juegos/getaway/`, IA | 8 rivales sin teletransportes, estadísticas reproducibles. |
| PERF-01 | P1 | Perfil p50/p95 y cachés por sector | tests/bench | Sin deterioro frente a baseline en dispositivo objetivo. |
| WATER-01 | P2 | Río/embalse/playa/mar por materiales | `js/15-terreno.js`, render | Orillas sin costuras, agua al nivel correcto. |
| PLANE-01 | P2 | Control aéreo propio | `js/31-vehiculos.js`, `32-fisica.js` | Despegue, vuelo, colisión/aterrizaje. |
| GARAGE-01 | P2 | Sistema de colección y competición | Turno Cero `juegos/getaway/` | Guardado y progreso compatibles. |

---

## 14. Reglas de implementación, QA y continuidad multi-IA

**Reglas absolutas:**

1. No sobrescribir trabajo paralelo sin comparar `main`, revisar ramas/PRs y comunicar dueño de archivo.
2. No reformar todos los modos a la vez. El ámbito principal es **mundo libre cenital**.
3. El motor compartido es `motorcity`; cada juego mantiene adaptadores, arte, narrativa y controles específicos.
4. Mantener offline, un HTML cuando el juego lo exija, español, Android/PC/iOS y guardados existentes.
5. No afirmar que se ha probado un gameplay o dispositivo si no se ejecutó.
6. No reutilizar archivos, texturas ni código propietario sin licencia compatible.
7. Sin resultados de benchmark no hay «optimización verificada».
8. Cada cambio de datos de mapa debe registrar fuente, licencia y confianza.
9. Cada PR debe incluir problema, hipótesis, casos, cambios, comandos ejecutados, salidas, regresiones y reversión.
10. Una escena debe verse correcta en cenital, 2D y 3D **y** poder recorrerse sin colisiones falsas.

**Plan de validación por categoría:**
- Unitarias: coordenadas, clipping de polígonos, linealización de vía, alturas, proyección, caché, control del tiempo.
- Geoespaciales: topología, solapes por nivel, continuidad de carreteras, cauces y puentes.
- Integración: cámara ↔ personaje ↔ carretera ↔ colisión ↔ modos.
- Visuales: capturas basales, día/noche, ladera, zonas reales, 412×860 y 860×412.
- Rendimiento: CPU/GPU reales, context loss, memoria de viajes, LOD y first-load offline.
- Usuario: primera sesión, orientación, esquinas, aceleración, actividad y regreso al mismo punto.

---

## 15. Fuentes y enlaces de auditoría

### Repositorios, documentos y puntos de entrada
- [Motor City](https://github.com/juanfeliperico369-stack/motorcity) · [versión](https://github.com/juanfeliperico369-stack/motorcity/blob/main/VERSION.json) · [cámara](https://github.com/juanfeliperico369-stack/motorcity/blob/main/js/34-camara.js) · [física](https://github.com/juanfeliperico369-stack/motorcity/blob/main/js/32-fisica.js) · [pseudo-3D](https://github.com/juanfeliperico369-stack/motorcity/blob/main/js/47-clasicos.js).
- [Plan de realismo](https://github.com/juanfeliperico369-stack/motorcity/blob/main/docs/PLAN-REALISMO.md) · [investigación de cámara](https://github.com/juanfeliperico369-stack/motorcity/blob/main/docs/INVESTIGACION-CAMARA.md) · [investigación de conducción](https://github.com/juanfeliperico369-stack/motorcity/blob/main/docs/INVESTIGACION-MANEJO.md) · [streaming territorial](https://github.com/juanfeliperico369-stack/motorcity/blob/main/docs/MC4-STREAMING-TERRITORIAL.md).
- [El Metro](https://github.com/juanfeliperico369-stack/MetroZero) · [render WebGL](https://github.com/juanfeliperico369-stack/MetroZero/blob/main/src/js/22-gl.js) · [ciudad vectorial](https://github.com/juanfeliperico369-stack/MetroZero/blob/main/src/js/11-ciudad2.js) · [modo libre](https://github.com/juanfeliperico369-stack/MetroZero/blob/main/src/js/36-libre.js) · [reglas](https://github.com/juanfeliperico369-stack/MetroZero/blob/main/TAREAS-IA.md).
- [Juega EnCicla](https://github.com/juanfeliperico369-stack/BicicletasUno) · [guía](https://github.com/juanfeliperico369-stack/BicicletasUno/blob/main/docs/GUIA.md) · [vistas 3D](https://github.com/juanfeliperico369-stack/BicicletasUno/blob/main/src/js/99o-mundo3d-camaras.js).
- [Turno Cero](https://github.com/juanfeliperico369-stack/motorcity/tree/main/juegos/getaway) · [documento de diseño](https://github.com/juanfeliperico369-stack/motorcity/blob/main/docs/TURNO-CERO.md).

### Tecnología y referentes externos
- [OpenGTA: teoría del GTA original](https://opengta.emdzej.pl/guide/theory).
- [Gordon Hall / Rockstar Leeds: entrevista técnica de Chinatown Wars](https://www.gamespot.com/articles/grand-theft-auto-chinatown-wars-qanda/1100-6205684/).
- [GameSpot: perspectiva y ciudad 3D Chinatown Wars](https://www.gamespot.com/articles/grand-theft-auto-chinatown-wars-hands-on/1100-6203423/).
- [Pixelbite: motor propio BITE](https://www.pixelbite.se/more-games/reckless-getaway-2/).
- [PAKO Forever: ficha de motor Unity](https://www.mobygames.com/game/161122/pako-forever/releases/android/).
- [Freegear, comentarios del creador](https://www.newgrounds.com/portal/view/545022).
- [Jake Gordon: JavaScript pseudo-3D Racer, fuente](https://github.com/jakesgordon/javascript-racer) y [técnica por segmentos](https://codeincomplete.com/posts/2012/6/23/javascript_racer_v1_straight/).
- [Super Arcade Racing, Steam](https://store.steampowered.com/app/1103770/) · [Pixel Wheels, proyecto abierto](https://github.com/SwitchGDX/pixelwheels-switchgdx).
- [Overture Maps: cobertura, conflación, calidad](https://docs.overturemaps.org/guides/buildings/) · [esquema de edificios](https://docs.overturemaps.org/schema/v1.18.0/reference/buildings/building/).
- [Copernicus DEM, superficie vs terreno](https://doi.org/10.5270/ESA-c5d3d65).
- [Three.js: InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) · [3D Tiles / HLOD](https://github.com/CesiumGS/3d-tiles/blob/main/specification/README.adoc).

---

## 16. Cierre: qué significa que el valle «se sienta» real

No es el número de edificios. Es poder reconocer una esquina por la pendiente de la calle, el perfil del cerro, la silueta de una cubierta, la disposición de un parque, las fachadas de la manzana y la línea de metro que atraviesa el lugar. La cámara debe ayudar a percibir esos elementos y la física debe respetarlos.

El paso correcto no es construir una versión más grande de las mismas cajas 3D. Es **reconciliar el territorio, crear una ciudad coherente y después escoger el lenguaje visual correcto**. *Chinatown Wars* demuestra que un mundo 3D visto desde arriba puede tener identidad profunda. *GTA 1 y 2* recuerdan el poder de una representación compacta. *Freegear* demuestra que las carreras retro pueden conservar una sensación de velocidad que no depende de polígonos costosos. Motor City ya posee piezas de las tres líneas: ahora necesita integrarlas con pruebas, criterios y una dirección artística consistente.

**Documento listo como especificación de investigación y referencia.** La ejecución, la verificación de los cinco vídeos completos y las capturas/benchmarks sobre dispositivos físicos quedan expresamente pendientes para la siguiente IA y los agentes con herramientas de prueba.
