# PLAN DE EVOLUCIÓN CHATGPT · MOTOR CITY / TURNO CERO 4.7
## Auditoría de jugabilidad, investigación comparativa, ingeniería de mundo único y criterios de aceptación
**Autor de esta entrega:** ChatGPT (OpenAI) · 22 de noviembre de 2026 · **Rama:** ia/chatgpt/4.7-auditoria-arcade-20261122

> **Estado honesto:** investigación externa, revisión estática verificable del código y diseño de pruebas automatizadas independientes. No es una certificación de que el juego sea ya completamente jugable. No se han ejecutado partidas físicas propias ni los juegos comerciales de referencia; los materiales públicos describen mecánicas pero no sustituyen jugarlos. La batería de Chromium preexistente fue ejecutada por otros colaboradores; en esta entrega **sí** se ejecutaron los diagnósticos independientes ChatGPT mediante GitHub Actions (PR #13, run 45034216286), con resultados que no demuestran completabilidad humana ni equivalen a una prueba en teléfono físico. Los números de balance que se proponen son hipótesis iniciales que deben validarse jugando.
>
> **Coordinación:** Claude trabaja simultáneamente en los archivos centrales de movimiento, modos, cámaras y Run (coord/agentes/claude.json, coord/buzon/2026-11-22-claude-4.7-en-curso.md). Por ello esta entrega no sobrescribe esos archivos. Se publica un conjunto de contratos de diseño, priorización y herramientas de QA independiente para integración por el propietario de esos módulos. No se tocan MetroZero, BicicletasUno ni RunRunZero: conservan sus motores y actúan como referencia de experiencia y datos.

---

## 0. Decisiones de producto: innegociables

1. **Primero jugar, luego admirar.** Una partida debe responder en los primeros segundos; animación, física, giro, frenada y colisiones tienen prioridad frente a cinemáticas o materiales más costosos.
2. **Un mundo 3D autoritativo** con una sola posición lógica, altitud, topología, colisiones, clima, economía, NPC, objetos y tiempo. Cámaras diferentes y renderizadores 2D/pixel son *presentaciones* o modos de interacción de esa misma escena; jamás otros mapas incompatibles.
3. **Mundo abierto desde el arranque**, tutorial optativo y actividades libres. La historia adulta de espionaje es un eje narrativo al que se entra voluntariamente; no bloquea carreras, transporte, recorridos, talleres ni minijuegos.
4. **Menú y mundo son dos puertas al mismo objeto de actividad.** Entrar por el icono en la calle o por el catálogo invoca el mismo ID, mismos rivales/estaciones, misma ruta física y reglas. El menú puede guiar al inicio físico o ofrecer traslado explícito; debe mostrarlo, nunca simular que son experiencias iguales cuando no lo son.
5. **Ritmo arcade verosímil, no realismo inercial absoluto.** Preservar amplitud del mapa, curvatura, masas relativas, distancias y temporizadores transparentes. La fricción y las ayudas son calibrables, no trampas invisibles.
6. **Run exclusivamente sobre la red continua de ciclorrutas/ciclovías permitidas**, con salidas válidas, bifurcaciones, cambios de carriles según ancho real, obstáculos contextuales y plazas/skateparks adyacentes. No abandonar el grafo ciclista silenciosamente.
7. **Tres fines por actividad:** diversión (acción/decisión/resultado), aprendizaje (consecuencia comprobable) y curiosidad/contemplación (un detalle nuevo del mundo; opcional, sin lección obligatoria).
8. **Objetivos pequeños pero densos.** Mejor diez actividades plenamente jugables en cinco barrios que cien marcadores sin controles acabados.
9. **Sin copiar código, arte ni mapas de videojuegos comerciales**. Se transfieren principios de diseño. Geografía pública requiere atribución y auditoría de licencia.
10. **Los hitos se obtienen con pruebas**, no por nombres de versiones o informes: prueba sin teletransporte, prueba táctil, continuidad de escena y medición GPU real.

## 1. Inventario comprobado del repositorio

- Motor City es un motor web/offline estructurado en fragmentos numéricos de **js/** que compila **dist/motor.js**. Las ciudades se describen en datos MC4; existen **MC.Planeta**, **MC.Manejo**, **MC.Camara**, **MC.Run**, **MC.Vistas** y sistemas de tráfico, población, objetos e interiores.
- **juegos/getaway/** concentra Turno Cero, juego adulto 18+ de conducción, espionaje y mundo abierto en Manhattan, Medellín y Guatapé. Su configuración referencia un mundo múltiple, 3D GLB y modos Run.
- **juegos/getaway/60-modos.js** declara carrera, extremo, mandados, EnCicla, tren/tranvía/Metroplús y laboratorio; la elegibilidad de algunas depende de la infraestructura de la ciudad.
- **juegos/getaway/56-abierto.js** coloca el marcador de historia optativa. No equivale todavía a un registro espacial exhaustivo de todas las actividades.
- **juegos/getaway/90-inicio.js** ofrece entrada al mundo abierto y al catálogo de modos desde la portada. La historia no debe forzarse.
- **js/34-camara.js** expresa cámaras sobre el estado de escena; **js/45-gl3d.js** dibuja fachadas, árboles, personajes y vehículos 3D procedurales; **js/41-vista2d.js**, **43-panoramica.js** y **47-clasicos.js** atienden otras vistas.
- **js/50-run.js** enlaza Run Scooter con **SeguirRuta**; **js/47-seguir.js** admite un filtro de aristas por medio del constructor **op.filtro**.
- **pruebas/modos.mjs** es un banco automatizado útil para progreso interno y resultados, pero realiza desplazamiento artificial de la entidad del jugador y asigna manualmente progreso del tren. **No acredita que los usuarios puedan recorrer las pruebas con controles reales**.
- **CONTEXTO-RELEVO.md**, **CONTEXTO-CODEX-TURNO-CERO.md** y las fichas **coord/agentes/** demuestran progreso previo; varias pruebas reportadas por Claude/Gemini/Codex son antecedentes a reproducir, no nuevos resultados propios.

### 1.1 Hallazgos con localización precisa

| ID | Severidad | Código y hallazgo | Cambio exacto propuesto | Evidencia de cierre |
|---|---|---|---|---|
| TC-P0-01 | P0 | **pruebas/modos.mjs** modifica x/y del jugador para que termine circuitos/mandados/EnCicla, y m.s para llegar al tren | Separar banco *lógico* (puede teletransportar) de E2E *humano* (no puede alterar estado físico); manejar con flechas y gestos reales | Tres actividades completadas sin escrituras de estado desde el test |
| TC-P0-02 | P0 | **js/50-run.js** permite entrada por ciclovía, pero crea **new SeguirRuta(..., red:'rueda')** sin filtro; la red rueda contiene calles y vías peatonales | Usar un filtro obligatorio **e.k === VIA.CICLO** en **SeguirRuta** y comprobar grafo conectado y fin de ciclovía; no caer a calle al terminar | 100% de tramos de cada carrera Run etiquetados CICLO; si termina grafo, el corredor termina o cambia a plaza permitida |
| TC-P0-03 | P0 | **js/50-run.js** filtra opciones de giro por ángulo, no por categoría **VIA.CICLO**; **SeguirRuta.girar** puede elegir rama general | Filtrar antes de publicar los cruces y persistir el ID de arista elegida; probar cruces mixtos y vías con ancho variable | En cruces con 1 ruta CICLO y 2 calles, jamás elegir calle; mostrar “sin salida ciclista” si procede |
| TC-P0-04 | P0 | **juegos/getaway/60-modos.js** traslada en carrera el cuerpo a q0, mientras que el catálogo no conserva una instancia de actividad del barrio | Definir **ActivityDefinition** estable con ancla, espacio de inicio, objetivo, checkpoints y trigger compartido; traslado solo al aceptar “ir al punto de partida” | Inicio desde menú y desde mundo referencia mismo activity_id/route_hash/seed, iguales física y resultados |
| TC-P1-05 | P1 | **armarEnCicla()** ejecuta cálculo **o.x/o.y** antes de verificar origen nulo cuando se llama sin estaciones | Comprobar **Array.isArray(S), S.length >= 2 y o válido antes de S.filter/map**; devolver resultado explícito tipado | Caso ciudad sin estaciones no lanza excepción, informa motivo |
| TC-P1-06 | P1 | **manejarTren()** usa aceleración 1,15 m/s² y frenada 1,5 m/s², muy poco ágiles para el ritmo solicitado | Perfil arcade ferroviario configurable + indicador distancia de frenado; no cambiar la geometría de estaciones | Llega a velocidad útil en intervalo objetivo medido; al frenar en el andén el jugador dispone de feedback claro |
| TC-P1-07 | P1 | **Modos.menu()** representa con 🔒 falta de infraestructura local; el jugador la percibe como bloqueo por avance | Diferenciar “disponible desde el inicio” de “no existe físicamente en esta ciudad”; ofrecer cambio de ciudad, alternativa local o visita libre sin historia | Nunca mostrar candado de progresión si la limitación es geográfica |
| TC-P1-08 | P1 | **60-modos.js** usa selección aleatoria de pistas e itinerarios en cada inicio | Semilla por ciudad + activity_id + día/reto + versión de datos; guardar y mostrar hash de ruta | Repetir reto idéntico produce mismo trazado y récord comparable |
| TC-P1-09 | P1 | **pruebas/modos.mjs** automatiza acelerador fijo (positivo), pero no compara input de cámara/vehículo/ciclovía con percepción humana | Tres mapas de calor de control, 0 a velocidad útil, parada, giros en estrecho, 30 minutos dispositivo real | Informe por modo, dispositivo, viewport, p50/p95/p99 y vídeo de recorrido |
| TC-P2-10 | P2 | **45-gl3d.js** ofrece geometría volumétrica procedural, predominantemente colores y detalles generados; las fuentes existentes no acreditan materiales PBR de todos los activos | Jerarquía de mallas/trim sheets/normal y roughness selectivas, instancias y distancia | Mejorar la lectura de primer plano sin subir p95 ni causar artefactos entre cámaras |
| TC-P2-11 | P2 | **Run** integra pantalla/canvas propio mientras mundo 3D se pausa | Conservar tiempo, posición, segmento, estado de calle, meteorología y retorno; separar representación runner de lógica y comprobar identidad al salir | Test entrar, girar, trucos, salir y volver al mismo punto con coordenadas tolerancia medida |

**Importante:** TC-P0-02 y 03 son distintos: el primero controla *todos los tramos del camino* y el segundo controla las *opciones que se ofrecen en una intersección*. Solo filtrar botones visuales no basta. El filtro existente de Recorrido permite un arreglo limpio; no requiere reconstruir el mundo.

### 1.2 Parche de referencia para Claude: Run

La arquitectura actual ya ofrece el lugar correcto: **SeguirRuta(…, { filtro })** aplica filtro a la arista de entrada y a las salidas de Recorrido. Concretar:
~~~js
const esCiclo = arista => arista && arista.k === VIA.CICLO;
// validar primero que exista una arista CICLO dentro de un radio razonable
const seguir = new SeguirRuta(M, C, {
  red: 'rueda', filtro: esCiclo,
  atras: 120, adelante: 700
});
// V.esquina solo presenta opciones cuyo k sea VIA.CICLO;
// si quedan 0 opciones, fin de segmento / transición explícita.
// Nunca reusar una salida general de la red rueda.
~~~
Esto es una **propuesta, no un parche ya aplicado**. Hay que comprobar el tratamiento de ciclos desconectados, carriles compartidos legales y zonas peatonales autorizadas por diseño. Si una ciclovía de la fuente no tiene etiqueta CICLO, corregir **datos/categorización auditada**, no dejar pasar cualquier calle como excepción silenciosa.

## 2. Referencias estudiadas: principios transferibles, no clones

Se revisaron fichas oficiales, descripciones del editor y documentación pública. “Aplicable” significa relación concreta con sistemas existentes. “No copiar” impide introducir rasgos sin su gameplay subyacente.

| Referencia | Aprendizaje verificable | Aplicación delimitada a Turno Cero | No aplicar |
|---|---|---|---|
| **Super Arcade Racing** (prioridad 1) | Circuitos legibles, progresión por tiempos, fantasmas personales, personalización de carro, pista 16-bit | Carreras 500–2500 m sobre calles del atlas, récord reproducible, ghost con ruta+inputs, vuelta de 1–4 minutos, salida/reinicio veloz | Copiar coches, pistas, arte o simplificar todo el mapa a otro universo |
| **GTA 1/2/London/Chinatown** | Orientación cenital y libertad urbana; un icono en la calle invita a actividad | 3D cenital con cámara que anticipa velocidad, símbolos de servicio en intersecciones reales, mundo de actividad persistente | Crimen por defecto para toda actividad, copiar misiones |
| **PAKO Forever, 2 y 3** | Persecución breve con reglas inmediatas, leer rutas, casi choque, tensión/recompensa | Huida express de 45–180 s iniciada desde zonas urbanas; rutas de riesgo, atajos, taller de salida; reinicio en un toque | Dinámica policial constante incluso al contemplar o gestionar la ciudad |
| **#DRIVE / Getaway / Reckless Getaway** | Carretera y riesgo fáciles de entender, retroalimentación visible | Impulso con riesgo, cámara coherente y protección de obstáculos, distancia de frenado arcade | Carriles infinitos desconectados de calles, a menos que sea modo visual sobre ruta real |
| **Forza Horizon / Need for Speed / FR Legends / APEX Racer** | Variedad de pruebas de conducción con identidad propia: grip, derrape, mejora | Tres perfiles de conducción (urbano, competición, drift) sobre el mismo motor; calibración independiente para cada vehículo | Simular motor, neumáticos y temperaturas a fidelidad absoluta en móvil |
| **Traffix / Traffix 3D** | Una decisión de toque controla semáforo y atasco | Modo cruce: puesto de gestión que usa el semáforo y tráfico **ya existentes**, corto 60–120 s | Otro mapa de tráfico con reglas nuevas |
| **Package Inc** | Diseñar flujo y capacidad de red para mover pedidos | Centro logístico: elegir depósitos y rutas con calles reales; consumo y beneficios persistentes | Rompecabezas abstracto sin conexión con mandados |
| **Railways** | Manipular vías y evitar conflictos, tiempos legibles | Despacho de tranvías/metro: decidir vía y prioridad de convoyes ya existentes | Inventar cambios de vía donde no hay desvíos |
| **Tiny Rails** | Contemplar el trayecto desde vista lateral y gestionar recursos | Vista panorámica de tren y eventos de pasajeros, duración abreviada por tramos; economía simple | Gestión idle obligatoria que reemplace conducir |
| **911 Operator** | Un mapa es escenario para decisiones limitadas por tiempo y recursos | Despacho de incidentes ficticios con rutas/tiempos de ambulancia/bomberos/bus; entrenamiento de priorización | Simular instrucciones médicas reales o llamadas de emergencia como juego de azar |
| **Vector / Shadow Fight / Hunter Assassin** | Animaciones legibles, anticipación, parkour/sigilo con señales claras | Parque con saltos, rampas, barandas; ruta lateral según geometría 3D; enemigos con cono de visión y oído visualizado | Redefinir física de pie al cambiar de perspectiva |
| **Alto’s Odyssey** | Un gesto para saltar/trucar y paisaje contemplativo | Runner ciclorruta: mantener 2 controles primarios, trucos encadenados y opcional modo paseo; clima que altera lectura | Sistema de 10 botones para hacer una pirueta |
| **Little Nightmares** | Composición atmosférica y tensión espacial | Almacenes y callejones en primera/lateral 3D, con audio situado y cámara guiada | Reconstruir un segundo escenario lateral |
| **Monument Valley / Infinity Loop / Laser / Maze** | Puzzles visuales con pocos estados | En interiores: circuitos eléctricos, paneles de estaciones, rutas de cables, señalización; manipular objetos 3D existentes con UI 2D | Trucos de perspectiva que contradicen las colisiones persistentes sin justificarse como instalación artística |
| **Townscaper / TheoTown / Cities: Skylines / The Sims** | La ciudad gana sentido al editar/ver consecuencias y rutinas | Microgestión de un negocio/taller/cuadra, peatones con necesidades y alquileres contextualizados | Motor completo de urbanismo separado del mundo |
| **WorldBox / Solar Smash / Spaceflight Simulator** | Experimentos sandbox y feedback sistémico | Laboratorio aislado con variables físicas y efectos reversibles, explicaciones de resultados | Destrucción planetaria casual en modo historia o simulación global cara |
| **The Bonfire / Idle Supermarket Tycoon** | Cadencia: producir, invertir, esperar, observar cambio | Taller, pequeño comercio, mantenimiento de bicis y rutas: 3 recursos claros y crecimiento visible | Idle que obliga a esperar horas para desbloquear modos |
| **Bullet Echo / 1945 Air Force / Missiles** | Visión/lectura instantánea bajo presión y esquemas de disparo | Desafío arcade opcional de reacción y evasión en secciones del mundo; distinguir coberturas/alerta | Shooters sin justificación dentro del thriller o sin accesibilidad |
| **Sky: Children of the Light** | Descubrir lugares por curiosidad y contemplación | Vistas memorables, eventos ambientales raros y rutas exploratorias sin marcador intrusivo | Progresión MMO en línea de millones de jugadores |
| **GTA San Andreas** | Ciudad con oficios, vehículos, actividades y narrativa opcional | Personajes con favores, tiendas, conducción, visitas, microhistoria por barrio | Hacer obligatoria la campaña para acceder al mapa |

### Fuentes primarias revisadas
- Super Arcade Racing: https://store.steampowered.com/app/1103770/ y https://store.steampowered.com/developer/OutOfTheBit/
- PAKO Forever/2: https://play.google.com/store/apps/details?id=com.treemengames.pakoforever y https://play.google.com/store/apps/details?id=com.treemengames.pako2
- Traffix: https://play.google.com/store/apps/details?id=com.infinity.traffix
- Railways: https://play.google.com/store/apps/details?id=com.infinity.railways
- Package Inc: https://play.google.com/store/apps/details?id=com.infinitygames.packageinc
- Vector: https://vector.game/es/ ; Alto’s Odyssey: https://altosodyssey.com/press/
- Monument Valley: https://ustwo.com/work/monument-valley/
- The Bonfire: https://store.steampowered.com/app/788210/The_Bonfire_Forsaken_Lands/
- 911 Operator: https://store.steampowered.com/app/503560/911_Operator/
- Tiny Rails: https://play.google.com/store/apps/details?id=com.tinytitanstudios.TrainChu
- Little Nightmares: https://playdigious.com/games/little-nightmares

**Calificación epistemológica:** se verificaron descripciones y principios públicos; NO se han ejecutado ni jugado personalmente esas aplicaciones en esta sesión. Sus sensaciones exactas de control deberán contrastarse por un tester con juegos adquiridos legítimamente y vídeo/frame-by-frame o controles observados, nunca adivinar velocidades de rivales.

## 3. Arquitectura: una ciudad, un estado, diez perspectivas

**Modelo de autoridad**
~~~text
MC.Planeta / MC4 (grafo de calles, nivel, edificios, ciclovías, transporte)
  ├─ WorldState{ mundo_id, sector_id, jugador{x,y,z,rumbo,v},
  │              vehículo, tiempo_mundo, clima, inventario, npc,
  │              tráfico, objetos, economía, actividades, eventos }
  ├─ SimulationClock (dt fijo; libre de cámara y resolución)
  ├─ ActivityRuntime (una máquina de estados por actividad activa)
  │   ├─ Ruleset (score, checkpoints, limites, rewards, consecuencias)
  │   └─ InputMap (conducción, pie, rail, puzzle, runner)
  ├─ SpatialScene (mismas meshes/colisiones/alturas)
  └─ ProjectionAdapters
      ├─ 3D cenital / diagonal / tercera / primera / panorámica
      ├─ 2D lateral/vertical (proyección y plano de juego permitido)
      └─ pixel (render a baja resolución del mismo estado)
~~~
- **2D no significa otro mundo:** edificios y pasos de peatón siguen en x,y,z; un sprite/atlas representa superficies y elementos semiplanos en su lugar real. Un modo lateral usa un **plano de interacción embebido** en el mundo con profundidad/colliders reales; al salir cambia la cámara y conserva el estado.
- **Pixel no significa otro grafo:** reducir resolución de framebuffer y cuantizar colores/sombras o usar impostores. Mismo vehículo y semáforo; la cámara no puede saltar a otra coordenada salvo viaje explícito.
- **Primer/tercer persona:** requieren geometría frontal/altura interior y clipping. Si falta interior, impedir la entrada física o usar transición legítima al mismo recinto (no fabricar mapa paralelo).
- **Cámara consistente:** pose base común (posición, orientación, objetivo), easing/colisión contra paredes/zoom y matrices de proyección por perfil. Mantener objeto seleccionado al alternar vistas.
- **Invariante de prueba:** cambiar 20 veces entre cenital, primera, tercera, lateral y pixel no cambia coordenadas, horario, ID de sector, colisión ni rivales. Tolerancia de posición tras transición sin avance: ≤0,1 m.

### 3.1 Contrato único de actividad (API propuesta)
~~~ts
ActivityDefinition {
  id: string;                  // estable y versionado, p.ej. carrera:med:santo-domingo:01
  mundo_id: string;
  clase: "carrera" | "transporte" | "entrega" | "runner" | "gestion" |
         "puzzle" | "sigilo" | "exploracion";
  anchor: { x:number, y:number, z:number, orientacion:number };
  trigger: { radio:number, categoria:string };
  ruta: { red_id:string, aristas:string[], hash:string } | null;
  disponibilidad: { infraestructura:string[], historia_requerida:false };
  controles: string;           // referencia al perfil, no motor de movimiento duplicado
  camera_profile: string;      // presentación preferida, jugador puede cambiar cuando tenga sentido
  reglas: { seed:string, limite_s?:number, objetivos:unknown[] };
  riesgos_y_recompensas: { costo:boolean, premio:string, consecuencias:string[] };
  aprendizaje: { tema:string, fuente:string } | null;
}
ActivityRuntime {
  actividad_id: string;
  estado: "inactiva"|"preparada"|"jugando"|"pausa"|"completada"|"abortada";
  mundo_id: string;
  inicio_real: { x:number, y:number, z:number };
  progreso: unknown;
  resultados: unknown;
}
~~~
**Entradas equivalentes:**
- Desde calle: acercarse al ancla física → “Jugar / Ver reglas / Ignorar”. Nada se activa automáticamente.
- Desde menú: elegir la misma actividad existente → “Marcar ruta” / “Ir al punto de inicio” / “Empezar aquí” si la actividad permite un origen flexible. No esconder teletransporte en el botón de jugar.
- Desde marcador en mapa: guiar por la red, señalar estación o lugar; si no existe infraestructura en la ciudad, mostrar “esta actividad está en Medellín; viajar” sin candado.
- Mismo id+semilla+grafo+vehículo base+recompensa en los tres casos. Distinción permitida: tiempo de traslado previo **no** consume contador de carrera.
- Cancelar o morir debe restaurar **control y cámara**, cerrar HUD específico, persistir consecuencias ya confirmadas, y no perder el estado de mundo si la actividad no destruyó algo.
- La capa de actividad no monopoliza el input: recibe comandos mapeados y aplica su regla a la **misma entidad MC.Cuerpo**.

## 4. Catálogo de actividades que sí tienen cabida

| Actividad / bucle | Lugar real del mundo | Decisión divertida | Aprendizaje/curiosidad | Vista óptima | Tiempo meta |
|---|---|---|---|---|---|
| Carrera urbana circuito/sprint | tramo urbano con 2+ conectores; marcador en taller/punto de salida | elegir trazada, derrapar y adelantar | cómo varía agarre por suelo | 3D cenital/tercera, pixel opcional | 1–4 min |
| Contrarreloj con fantasma | ruta estable por semilla | mejorar récord sin tráfico injusto | lectura del mapa y frenada | 3D cenital/2D arcade opcional | 45–150 s |
| Huida PAKO | zona con cruces y garajes | decidir ruta mientras aumenta presión | relación entre riesgo, daño y recompensa | 3D cenital | 1–3 min |
| Mandados/paquetería | mercado, tienda, domicilio de destino | priorizar rapidez vs integridad del paquete | logística urbana | 3D tercera/cenital | 2–5 min |
| EnCicla/rebalanceo | estaciones existentes, Medellín | llegar seguro y mover bicicletas | oferta y demanda; civismo vial | cenital/tercera | 3–5 min |
| Bus/Metroplús | terminal, parada de bus y carril de transporte | frenar cerca del andén, horarios, prioridad | movilidad pública y accesibilidad | cenital/primera conductor | 2–5 min |
| Metro/tranvía | estación y vía real | velocidad y precisión de parada | red ferroviaria y señalización | panorámica 2D / cabina 3D | 3–5 min |
| Traffix intersección | cruce con semáforos reales | tocar secuencia de semáforos sin choque | capacidad/espera y prioridad peatón | cenital, UI de 1 toque | 60–120 s |
| Railways despacho | intercambiador con vías reales | coordinar convoyes sin conflicto | distancia de seguridad y capacidad | cenital 3D/isométrica | 2–4 min |
| Run ciclovía | ciclovía conectada, acceso desde borde | cambiar carril, salto, desvío legal, combo | diseño urbano y riesgo | corredor pseudo3D / lateral si parkour | 45–180 s |
| Skate/parkour libre | parque/skatepark conectado físicamente | rampa, grindeo, aterrizaje, combo | equilibrio, geometría, resistencia | lateral 2D sobre malla 3D/tercera | 1–3 min |
| Sigilo/logística nocturna | almacenes, muelles, garajes del thriller | observar, distractor, cruzar sin ser visto | planificación y consecuencias | cenital/primera | 2–5 min |
| Taller/casa/tienda | interiores en edificios existentes | reparar/gestionar, reinvertir | costos y demanda local | 3D cercana/maqueta | 2–4 min |
| Puzzles urbanos | estación, subestación, taller | trazar conexión de señales/cables | sistemas/energía, causas y efectos | 2D interactivo sobre objeto 3D | 30–120 s |
| Exploración contemplativa | miradores, museo, orilla del embalse | buscar un punto sin cronómetro | patrimonio, biomas, geografía | panorámica/tercera/primera | libre |

**Secuencia recomendada:** terminar las seis actividades ya existentes antes de añadir las demás. Después incorporar **Traffix** y **Run skatepark**, porque reutilizan **MC.Trafico/MC.Run**; luego despacho ferroviario y puzles en los edificios existentes. El siguiente paso no es implementar un MMORPG de red: primero **RPG sistémico offline** con NPC, memoria, encargos y consecuencias.

### 4.1 Consecuencias, no marcadores vacíos

Modelo pequeño de “vida de barrio” que reutiliza sistemas: 
- Un mecánico reconoce que trajiste vehículos averiados, y recomienda una carrera o una reparación (reputación oficio, 0–100).
- Una estación EnCicla agotada genera demanda que un traslado puede mejorar temporalmente; al regresar ves el cambio, sin alterar datos oficiales como si fueran tiempo real.
- Un conductor de bus recuerda si respetaste un cruce; ofrece un desafío de tiempos de parada. Es ficción, no representación de personas reales.
- Un comerciante al que entregas paquetes abre una conversación opcional sobre el barrio, sin obligar a completar la historia de espionaje.
- Un mirador desbloquea *conocimiento de lugares*, no poder físico. La recompensa puede ser una postal, ruta sugerida, audio ambiental o ficha local verificada.

**Reputación multieje, no karma moralista:** movilidad, oficios, conocimiento, relaciones. Las decisiones generan microhistoria y nuevos diálogos; las actividades básicas permanecen siempre accesibles.

## 5. Controles y balance: el vehículo se siente rápido porque responde, no porque atraviesa edificios

### 5.1 Contrato de comandos independientes de dispositivo
- Todos los dispositivos producen **acelerar ∈ [0..1], frenar ∈ [0..1], girar ∈ [-1..1], impulso [0..1], acción, salto, interactuar, cámara, pausar**.
- Joystick táctil: zona muerta regulable (propuesta inicial 0,08–0,15), curvas suaves; joystick izquierda para girar, aceleración fija independiente en vehículo si el usuario la elige. Un solo pulgar viable.
- Teclado: WASD/flechas, espacio freno/acción según modo (HUD indica), V alterna ⏫, tecla para cámara con transición; soporte de gamepad con perfil explícito y reconexión segura.
- No sobrecargar con botones: **un botón de acelerar/freno, uno de acción contextual y uno de impulso/salto** según actividad. Los comandos ocultos no pueden ser imprescindibles.
- Mantener un “segundo chance” controlado: pequeño **input buffer** para saltos/trucos (80–130 ms propuestos), **coyote time** para aterrizaje (80–120 ms), ligera corrección de rumbo si obstáculo es menor. No permitir que atraviese edificios.
- Ajustar cámara: *look-ahead* 2–5 m urbano y mayor a velocidad; filtros de giro no deben ocultar una curva o cruce crítico. Si el jugador gira la cámara, física y sentido del joystick no deben invertirse inesperadamente.
- Configuración de accesibilidad: tamaño de controles, izquierda/derecha invertibles, sacudida off, efectos visuales reducidos, sensibilidad de giro, texto ampliado, paleta con contraste, vibración optativa.

### 5.2 Tabla de objetivos de sensación (PARÁMETROS EXPERIMENTALES, no medidas del juego)
| Clase | Ventana útil | Meta de respuesta | Restricción verosímil |
|---|---|---|---|
| Coche arcade urbano | 0–40 km/h en ~1,5–2,5 s | viraje claro a baja velocidad, recuperación tras rozar pared | limitar los virajes imposibles a >70 km/h |
| Coche competición | 0–70 km/h en ~3–5 s | aceleración y frenada progresivas | evita salir disparado al tocar una esquina |
| Bicicleta normal | crucero aprox. 14–25 km/h | al entrar a ciclorruta, feedback de manejo inmediato | pendiente y frenada visible |
| MTB/BMX/skate | impulso corto controlable | salto y aterrizaje en <1 s en obstáculos pequeños | combo pierde calidad si choca o cae |
| Tren arcade | 0–15 m/s en ~4–7 s | barra anticipatoria de parada; frenada 2,5–4 m/s² evaluable | tren solo sobre eje real y señalización coherente |
| Bus / Metroplús | movimiento útil en 3–6 s | frenada potente a baja velocidad para precisión en parada | respetar carril/curva, no girar como moto |
| A pie | movimiento perceptible en <150 ms | correr/caminar/arrastrarse accesibles en móvil | colisión, salto y pasos coherentes |

**Ingeniería del tren:** hoy 1,15 m/s² tarda ~13 segundos para llegar a 15 m/s; 1,5 m/s² tarda ~10 segundos en frenar desde esa velocidad y precisa ~75 m (sin reacción). Para un arcade, ensayo con 2,8–3,4 m/s² al acelerar y 3–4 m/s² al frenar. A 15 m/s y 3,5 m/s² se requieren ~32 m de frenado ideal, más latencia de reacción; HUD debe anticiparlo. Es **propuesta de balance**, no reproducir automáticamente en líneas que requieren otras velocidades. 

**Regla para modo contrarreloj:** duración del reloj = margen de decisión + longitud de **ruta transitable** / velocidad efectiva (no distancia euclidiana) + tiempos explícitos de semáforos y parada. El reloj de misión usa tiempo de simulación activo pero la interfaz distingue claramente “tiempo de actividad” del reloj día/noche; no penalizar cargas o pausas.
- Evitar factor fijo de “acelerar el mundo” mientras el jugador sigue a 1x: rompe distancias y NPC. Se acelera **sensación de control** y se comprimen decisiones aburridas, no metros.
- Cualquier modo que sólo resulte completado por teletransporte es **no aprobado**.
- Al chocar en ángulo menor, deslizar con pérdida pequeña; al choque frontal, detener / daño según masa y velocidad. No usar el mismo coeficiente para patinete y camión.

## 6. Endless runner correcto: una red ciclista viva

**Topología:** cada sector tiene grafo de aristas etiquetadas con tipo, anchura útil, sentido permitido, pendiente, material, obstáculos y conectividad. *Carril runner* es partición longitudinal de la ciclovía, NO un carril de automóvil. Número de carriles renderizados depende del ancho efectivo y zona segura:
- Ciclovía estrecha: 1 línea jugable, obstáculos alternados y saltos; nunca ofrecer tres carriles si físicamente sólo cabe una bicicleta.
- Ciclovía media: 2 líneas con cruce permitido cuando no hay obstáculo.
- Ciclovía ancha/parque lineal: 3 líneas; oportunidades de adelantamiento.
- Tramo de parque/skate: transición al *arena* adyacente sin cambiar mapa ni jugador; física de rampas y bordillos se calcula contra geometría del entorno.
- Intersecciones: señal ~2 s antes o una distancia dependiente de v; si sólo existe continuidad válida se sigue solo; si hay dos ramas válidas se elige izquierda/derecha, sin inventar salida.
- Si la red ciclista termina: señal “fin de ciclovía”, rampa a paseo o salida a 3D libre; **nunca** continuar runner por una avenida normal.
- Entrar desde el mundo: señal y radio sólo si hay acceso legal/seguro, guardia de vehículos compatibles; salir: identidad de mundo/cuerpo/tiempo real conservada y cambios del recorrido registrados.

**Colisiones y obstáculos** (generación contextual, sin pistas imposibles):
- Sello de anchura: cada obstáculo ocupa una fracción de ancho y siempre deja al menos una respuesta razonable según v y buffer de input.
- Zona residencial: caneca, bici mal parqueada, reparaciones pequeñas y grietas.
- Zona con obras: arenilla, balizas, desniveles y andamio de esquivar/agachar.
- Parque: bordillos, rampas, barandas, skate bowls, molinos de viento si hay lógica visual; evitar patrullas aleatorias que atenten contra modo descanso.
- Clima: mojado disminuye grip en giros fuertes, nunca altera gravedad sin indicarlo. Hielo solo donde bioma/nieve tenga sentido.
- **No copiar disposición exacta** de obstáculos de PAKO/Vector/Alto: usar gramática procedural propia condicionada por grafo real.

**Semilla y repetición:** seed = hash(mundo_id, aristas_de_ruta, actividad_id, día_reto). Mantener ruta y obstáculos deterministas; el modo infinito puede extender ruta hasta fin conectado y ofrecer reinicio en mismo ancla con nueva semilla voluntaria.

**Test mínimo:** corredor entra en arista CICLO A, avanza, en cruce válido gira a CICLO B, en cruce inválido ve final, ejecuta salto y aterriza en parque conectado, retorna a mundo abierto. Verificar 100% aristas autorizadas, x/y finales coinciden, no teletransporte, no duplicación de inventario.

## 7. Render de gran escala con recursos escasos

**No confundir “realismo gráfico” con millones de polígonos.** Lo que más se ve es proporción, sombra de contacto, material, color calibrado, animación e iluminación coherente. La fidelidad de primer plano es prioritaria.

### 7.1 Anillos de detalle por distancia y tipo de cámara (valores iniciales adaptables)
| Zona | Distancia aproximada | Representación |
|---|---:|---|
| Acción cerca | 0–35 m | GLB calidad controlada, iluminación material, textura de asfalto/charcos, sombras de contacto y animación |
| Ciudad media | 35–150 m | mallas de fachada simplificadas, materiales compartidos, árboles instanciados, coches con 1–2 animaciones |
| Silueta lejana | 150–500 m | LOD bajo / fachadas agrupadas, impostores de árboles/rascacielos, niebla atmosférica ligera |
| Horizonte >500 m | condicionado por altura/bioma | HLOD/skyline de la misma ciudad, no generar cada ventana |

Para cenital, la prioridad es leer el trazado de suelo, cruce y colisión; en primera persona sube la prioridad de fachada y acera cercana. Un **LOD siempre deriva del mismo objeto** y conserva colisión lógica. La transición visual no puede cambiar el radio de colisión.

### 7.2 Propuestas técnicas concretas

1. **Frustum culling + sector visible** basado en la cámara; no renderizar ciudad completa. Aprovechar los trabajos de streaming MC4 ya presentes; medir costo de decodificación al cruzar límites.
2. **HLOD y oclusión conservadora:** edificio/árbol/auto agrupado por sector; PVS para interiores con portales. Verificar coste CPU de culling; en cenital con muchos tejados puede rendir menos.
3. **Instancing** de árboles, postes, semáforos y mobiliario que comparte geometría y material; actualizar matrices sin crear objetos JS por cuadro. Renderizar lotes de capas.
4. **Atlas y trim sheets** urbanos (asfalto, zócalos, ventanas, metal, hormigón, pintura desgastada); UV reproducibles. Quince fachadas convincentes reutilizables ganan a miles de materiales únicos.
5. **Texturas comprimidas KTX2/Basis cuando plataforma/decodificador lo soporten**, con respaldo PNG/JPEG/WebP offline; medir tiempo de carga y coste de tener decodificador embebido en HTML único.
6. **Normal y roughness muy seleccionadas** cerca del jugador; muchas superficies de mundo medio obtienen detalle procedural en shader simple y ambient occlusion aproximada. PBR completo sólo si GPU lo tolera.
7. **Sombras presupuestadas:** sol único + sombras de contacto y siluetas de vehículos. No proyectar una cascada costosa para cada ventana o peatón.
8. **Resolución dinámica con histéresis** según tiempo GPU si está disponible, no sólo tiempo de JS; 60 FPS objetivo y adaptación a 30 sostenidos donde 60 sea inviable, conservando tasa de física.
9. **Carga sectorial acotada** y descarga explícita de buffers GPU, atlas, modelos y vistas al viajar; memoria JS post-GC y memoria GPU por separado.
10. **LOD semántico por actividad:** durante carrera se priorizan calle/bordillos/obstáculos 100 m delante; en paseo se priorizan fachadas e hitos; en tren, línea/horizonte y andén; en parkour, superficie de contacto y lectura de animación.

### 7.3 Cómo conviven 3D, 2D y pixel sin engañarse

- **Sprite de árbol / anuncio / farola** puede ser impostor en distancias grandes: su posición, base y collider son 3D; rotar billboard hacia cámara o muestrear un atlas direccional. En primer plano se elige malla volumétrica.
- **Tramo lateral ferroviario** = cámara paralela a la ruta del tren que proyecta exactamente sus x,y,z; el jugador puede elegirla sin duplicar topología. Para interacción tipo plataformas, aplicar constricción sobre un plano 3D con geometría de apoyo/collider reales.
- **Vista cenital pixel** = imagen del mismo render con resolución baja predefinida, nearest neighbor y paleta cuidadosamente legible; no pixelejar el HUD a costa de contraste.
- **Panorámica** = lente/colocación real del observador. No estirar 2D con alturas inventadas; el relieve se consulta en el atlas.
- **Primera persona** = cámara a altura del ojo del personaje/vehículo, colisión contra paredes y cerca, FOV adaptado; al girar, el mismo edificio sigue en coordenadas idénticas.
- **No duplicar el suelo:** capas 2D pueden dar pavimento, rayas, suciedad y reflejos al 3D mediante materiales/decals. Prohibir una calle 2D por encima de otra calzada 3D mal alineada.

### 7.4 Presupuesto de rendimiento propuesto (medir antes de adoptar)

| Métrica | Objetivo de diseño de partida, no resultado actual |
|---|---|
| 60 FPS | cuadro ≤16,7 ms en p95 en móviles capaces; sin caídas largas al entrar sector |
| Modo ahorro | ≥30 FPS estable; cuadro ≤33,3 ms en p95 en móvil modesto objetivo |
| JS CPU/game loop | investigar p50/p95/p99, y objetivo inicial bajo ~8–10 ms en 60 FPS; no sumar directamente sin conocer solape GPU |
| GPU | p95 bajo presupuesto del dispositivo, inspección con herramientas GPU/CDP y pruebas visuales |
| Entrada | respuesta al primer gesto perceptible dentro del siguiente cuadro disponible; p95 input-to-effect instrumentado |
| RAM | medir memoria JS post-GC y asignaciones por sector; no fijar MB mágico igual para todos |
| Descarga | medir tiempo entre activar cambio de ciudad y recuperar FPS; prohibidos congelamientos largos |
| Draw calls / triángulos | registrar por cámara y por distancia; objetivo empírico según GPU |
| HTML único offline | verificación “modo avión” e integridad de assets, compresión y licencias |
| 3D móvil | 412×860 y 860×412, gama baja/media/alta; pantalla, temperatura y batería |

Fuentes técnicas y límites:
- Godot 3D performance: https://docs.godotengine.org/en/stable/tutorials/performance/optimizing_3d_performance.html
- Godot HLOD: https://docs.godotengine.org/en/stable/tutorials/3d/visibility_ranges.html
- MDN WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- Khronos instancing: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Vendor/EXT_mesh_gpu_instancing/README.md
- ARM WebGL optimization: https://developer.arm.com/-/media/Files/pdf/graphics-and-multimedia/10.30amWebGL.pdf
- Optimización de draw calls y asignaciones: https://github.com/playcanvas/developer-site/blob/main/docs/user-manual/optimization/guidelines.md
- Geodatos y ODbL: https://osmfoundation.org/wiki/Licence/Attribution_Guidelines

## 8. Plan de implementación: primero desbloquear experiencia real

| Fase | Entrega | Responsable sugerido | Hecho cuando |
|---|---|---|---|
| **P0-A · Baseline** | Perfil físico por modo con teclado/táctil, y E2E que no manipula coordenadas; inventario de bugs por reproducibilidad | ChatGPT QA + Claude integración | Hay vídeo/recorrido, seeds y cifras por dispositivo |
| **P0-B · Conducción** | Rebalanceo contextual coches, motos, bici, tren; giro/acelerador fijo, freno a punto, asistencia configurable, colisiones | Claude (archivos reclamados) | Recorridos largos y estrechos completados en teléfono sin quedarse atascado |
| **P0-C · Paridad** | Registro espacial de actividades en el mundo abierto, mismo motor de modos; transiciones y disponibilidad explícita | Claude | Cada modo del catálogo tiene punto de entrada real o razón geográfica comprobable; no hay candados de historia |
| **P0-D · Run** | Filtro CICLO de Recorrido, bifurcaciones válidas, término de ruta, skatepark, obstáculos adaptados a ancho y salida idéntica | Claude | Runner nunca usa una calle sin permiso y vuelve al mismo mundo |
| **P1-A · Contenido** | Microhistorias de barrio con tres fines y sistema de reputación no bloqueante | Equipo narrativo + Claude | Cinco actividades con consecuencias visibles a pie, en transporte y gestionando |
| **P1-B · Calidad** | Cámara única en perfiles, límites de giro y visión, entradas adaptadas, sin saltos espaciales | Claude | 20 alternancias de vista y 0 cambios de estado/collider |
| **P2-A · Arte** | Biblioteca original de fachada, suelos y vehículos con LOD y materiales; documentación de licencia | ChatGPT/arte + Codex/3D | Mejora visual comparada en captura A/B y presupuesto p95 preservado |
| **P2-B · Rendimiento** | HLOD, atlas, instancing, GPU/resolución, memoria sectorial | Codex motor/Claude integración | Perf real con p95/p99 y memoria por ciudad sin congelamientos |
| **P3 · Regresión** | 3 ciudades, 2 orientaciones, offline, cambio de cámara, 10 actividades, input real | 3 IA revisando PR + QA humano | Pruebas verdes + checklist de persona física firmado |

### 8.1 Definition of Done de cada actividad

- Acceso: desde inicio sin progreso de historia; el mundo libre está disponible en 1 acción principal.
- Ruta: identificador estable, punto de salida real, colisión coherente con cámara.
- Controles: teclado, táctil y control si aplica, HUD básico autoexplicativo, tutorial opcional.
- Movimiento: puede iniciarse, avanzar, girar, frenar y completar en el plazo; no requiere truco ni editar posición.
- Resultado: victoria/fracaso/puntos, reiniciar, salir, registrar récord por seed/reglas.
- Integración: abierto/menú dan la misma actividad; salida conserva mundo, hora, inventario y recompensas.
- Robustez: faltan datos → mensaje comprensible, no excepción; pausas, reanudar, cambiar cámara no corrompen.
- Rendimiento: prueba p95 FPS/input, sin pico de memoria recurrente al reintentar.
- Aprendizaje: retroalimentación breve y una ficha opcional; no sermón.
- Accesibilidad: contraste, botones y foco; 412×860 y 860×412.

## 9. Pruebas propuestas que no hacen trampa

Separar la suite actual (lógica interna) de esta segunda batería:
1. **Arranque frío offline:** iniciar partida sin red, entrar a mundo, registrar tiempo; tutorial no forzado.
2. **PC conducción real:** al comenzar un circuito, mantener acelerar con teclado por 5 s sin tocar coordenadas; medir distancia neta, velocidad y colisiones, realizar al menos dos giros auténticos.
3. **Táctil conducción real:** usar pointerdown/tap en controles a resolución 412×860; medir respuesta igual que teclado.
4. **Tren real:** acelerar hasta >10 m/s, calcular distancia a andén, frenar antes del borde y registrar parada dentro de tolerancia sin asignar m.s.
5. **EnCicla sin estaciones:** invocar API con ciudad sin estaciones y comprobar error tipado, no TypeError.
6. **Runner ciclovía:** caminar/rodar hacia acceso legítimo, entrar, girar izquierda y derecha en intersecciones mixtas; inspeccionar tipo de cada arista recorrida; al salir comparar cuerpo.
7. **Paridad de actividad:** mismo activity_id desde menú y desde marcador, mismo seed, misma física; nunca spawn duplicado.
8. **Cámaras:** comparar mundo_id, x,y,z, hora y colisión antes/después de cambiar 3D cenital, primera, tercera, lateral, pixel.
9. **Tiempos de carga:** atravesar borde de sector 40 veces (ida/vuelta), guardar p95/p99 de duración del cuadro y heap post-GC; ni el usuario ni el input se congelan.
10. **Densidad de tráfico:** carreras en día/noche/lluvia, calle estrecha de Medellín y recta Manhattan; rendimiento y desatascador.
11. **Regresión de vida de barrio:** NPC, transporte, negocios y objetos tienen el mismo estado antes/después de actividad o viaje.
12. **No falsos aprobados:** ninguna prueba etiquetada “E2E conducción” puede escribir coordenadas, velocidad, progreso de carrera o avance de tren desde el bot.

**Artefacto acompañante:** **pruebas/chatgpt-auditoria-contratos.mjs** revisa firmas de riesgos por lectura estática y entrega observaciones; no sustituye Chromium/Playwright ni físico. La suite actual **pruebas/modos.mjs** permanece sin editar para respetar la zona de Claude.

## 10. Riesgos de integración e instrucciones para otras IA

- Claude tiene prioridad sobre **60-modos.js**, **20-juego.js**, **js/32-fisica.js**, **37-manejo.js**, **50-run.js**, **34-camara.js** y pruebas principales. Antes de integrar código ajeno debe revisar diff y guardias específicos de esta entrega.
- El motor debe seguir produciendo HTML offline. No crear dependencia de servidores de autenticación ni CDN para assets críticos.
- Los cambios a MetroZero, BicicletasUno o RunRunZero son **fuera de alcance** en este turno. Su código y los informes de sus motores propios se pueden leer y comparar.
- Respetar canon de Turno Cero 18+; no importar violencia a juegos familiares. No confundir datos de OSM con estadísticas de movilidad en tiempo real.
- Ninguna sugerencia es obligación si rompe la simulación o introduce carga excesiva. Cada propuesta exige *beneficio perceptible* y costo medido.
- No fusionar PR con dos agentes tocando el mismo archivo sin rebase/revisión.
- Actualizar este documento con “APLICADO + commit + test” por fila; no marcar “listo” por una propuesta.

## 11. Entrega y relevo (firmado ChatGPT)

**En esta rama:**
- Documento investigativo/propuesta **docs/PLAN-EVOLUCION-CHATGPT.md**;
- Guardias de auditoría independientes bajo **pruebas/chatgpt-auditoria-contratos.mjs**;
- Estado de la IA **coord/agentes/chatgpt-arcade-47.json** y buzón exclusivo;
- PR hacia main para revisión no destructiva.

**No hecho ni afirmado:** arreglo integral de modos, prueba real de todos los títulos comerciales, ejecución propia en GPU Android/iOS, optimización 3D medida o arte GLB definitivo. Eso requiere pruebas/fusiones ulteriores del código del propietario de cada archivo. La prioridad de integración sugerida es **TC-P0-01, 02, 03, 04 → TC-P1-05, 06, 07 → experimentos 3D**.

**A quien siga:** primero leer docs/PLAN-EVOLUCION-CHATGPT.md, coord/ y el estado actual de Claude/Codex; ejecutar pruebas sin trampa, implementar los guardias de ciclovía y nulidad con tests; actualizar su propio documento y buzón sin borrar aportes previos; dejar exactamente este mismo requisito de relevo a la siguiente IA.


## 12. Adenda técnica tras contrastar controles ferroviarios y fallo de WebGL

**TC-OK-04: comprobado, el freno del Metro SÍ funciona con teclado.** En **js/33-controles.js**, **Controles.leer()** traduce WASD/flechas a **stick.x/stick.y/stick.m**; **juegos/getaway/60-modos.js · manejarTren(dt, ent)** lee **ent.stick.y** para acelerar o frenar. La señal puede llegar por ambos dispositivos sin consultar directamente **ent.acel**. En ejecución propia de GitHub Actions de **pruebas/chatgpt-input-real.mjs**, tras mantener Shift 6 s el tren llegó a 6,9 m/s; con ArrowDown 4 s bajó a 0,9 m/s. Por tanto, la denuncia de 'tecla de freno rota' fue un **falso positivo descartado**. Se mantiene el ajuste de sensación arcade y un caso comparativo futuro sin pulsar freno para valorar frenada pasiva.

**TC-P1-13: Run requiere WebGL propio y su inicialización puede mover al jugador antes de estar listo.** En **js/50-run.js**, al comenzar Run se alinea C.x/C.y con el tramo ciclista antes de ejecutar **RS.R.init(cv)**; si ese contexto falla, se lanza error y **juegos/getaway/50-extras.js** restaura el estado de pausa pero no garantiza revertir la posición original. **Cambio recomendado:** transacción *preparar → verificar GPU/assets/ruta → confirmar entrada*. Guardar snapshot de estado, inicializar contexto y rutas sin mutarlo, confirmar tras éxito y rollback en cualquier excepción; ofrecer un modo 2D compatible sólo si realmente existe un renderer de respaldo, de lo contrario salida clara sin desplazamiento. Test forzando WebGL ausente y comprobando que x,y,vehículo,pausa y HUD no cambian.

**TC-P1-14: solo una salida *visual* del grafo no garantiza continuidad espacial.** **SeguirRuta.girar()** llama **Recorrido.alargar()**, que filtra aristas si se pasó **op.filtro**. El arreglo correcto debe filtrar desde **constructor** y mantener validación al **girar**. El destino conectado debe tener identificadores de aristas y sentido físico. En skateparks y zonas mixtas la inclusión debe basarse en tipos ciclistas permitidos **explícitamente en datos**, no tratar cualquier asfalto como ciclorruta.

### QA nueva que acompaña esta adenda

**pruebas/chatgpt-input-real.mjs** abre Turno Cero en Chromium, entra al mundo libre, inicia una carrera real sin teletransportar el jugador desde el test, mantiene la tecla de acelerar/girar/frenar y mide desplazamiento y velocidad. En segunda escena pulsa de verdad ⏫ en interfaz táctil emulada y comprueba movimiento/frenada. Finalmente abre una línea de metro y usa Shift y ArrowDown para verificar respuesta ferroviaria sin escribir jamás m.s ni C.x/y. Su salida JSON es **diagnóstica** y su opción **MC_DIAG_ESTRICTO=1** permite fallar por las observaciones pertinentes. Es un complemento a la suite lógica existente, **no demuestra por sí solo que los cinco modos sean completables por humano**. No está ejecutada sobre dispositivo físico en esta entrega.

**Estado de esta rama:** el único código escrito en esta sesión es instrumentación de QA; **no se cambió física/cámara ni la lógica de los módulos bajo propiedad concurrente de Claude**. Las tareas TC-P0/TC-P1 son instrucciones de integración con pruebas, no correcciones ya fusionadas.


## 13. Corrección funcional integrada en rama ChatGPT: guardia EnCicla

**TC-P1-05 aplicado en rama, pendiente de integración a main.** Se añadió **juegos/getaway/61-chatgpt-guardia-encicla.js**, una extensión que se ejecuta automáticamente después de 60-modos.js porque **herramientas/construir.mjs** concatena en orden alfabético todos los archivos .js del juego. El cambio envuelve solamente **Modos.armarEnCicla**, valida que haya dos o más estaciones y que el origen recibido sea una estación de la lista con coordenadas finitas, y devuelve **false** si no hay infraestructura, sin acceder al objeto nulo. Cuando hay infraestructura correcta se delega a la implementación original sin alterar su física, objetivos, recompensas ni velocidades. No se modifica el archivo propiedad de Claude.

Se amplió **pruebas/chatgpt-input-real.mjs** con un caso real en Chromium que sustituye temporalmente el array de estaciones por un array vacío durante la llamada (y lo restaura de inmediato en finally), además de comprobar un origen inválido y que el modo no quedó activo. Este escenario es una *prueba de excepción/guardia*, no una simulación de partida completa y no altera datos persistentes de ciudad. La auditoría estática reconoce la guardia integrada. **Solo marcar como verificado cuando GitHub Actions ejecutó la nueva versión y subió evidencias**.

Instrucción de fusión para Claude: si tras revisar acepta la guardia, puede trasladar esas tres condiciones al comienzo de **armarEnCicla** y luego borrar **61-chatgpt-guardia-encicla.js** con el test guardia pasando. No dejar dos validadores permanentes si la lógica de estaciones evoluciona. El modo sin infraestructura continuará comunicando indisponibilidad geográfica al usuario, sin candado falso de historia.

**Actualización de alcance:** esta entrega sí contiene **una corrección funcional aislada**, además de documentación y pruebas; el resto de arreglos centrales de física, Run, cámaras y paridad espacial continúa sin aplicar en esta rama por coordinación con Claude.


## 14. Evidencia real de CI en GitHub Actions

**Verificación fechada 22-nov-2026:** https://github.com/juanfeliperico369-stack/motorcity/actions/runs/45034976738

- Compilación de la versión del juego que incluye **61-chatgpt-guardia-encicla.js**; test **encicla-sin-estaciones-guardia-real** completó **paso: true**, **errores: []**.
- En esa ejecución se partió de una ciudad con **133** estaciones y se sustituyó temporalmente la referencia por una lista vacía: el modo devolvió **false** sin excepción; un origen no válido devolvió **false**; **restaurado: true** y **sinModoActivo: true**.
- La auditoría de los contratos publicada al comienzo del pipeline registró **5 detectados / 11, 6 por revisar, 4 P0**; el contrato **TC-P1-05** aparece **detectado** porque la guardia está instalada (cambiar este dato solo si cambia el código y se comprueba de nuevo).
- En la primera ejecución de teclado/touch, en el mismo PR, la carrera avanzó 43,51 m en 4,2 s y cambió su rumbo; el acelerador fijo móvil recorrió 32,09 m y se detuvo; el tren pasó de 0 a 6,9 m/s al acelerar y a 0,9 m/s tras mantener freno. Son diagnósticos de *respuesta*, no pruebas de completabilidad.
- **Estado de arreglo funcional:** **verificado en Chromium, pendiente de merge al repositorio principal**, de ensayo Android/iOS real y de consolidación por Claude si reemplaza la extensión.
- **No se verificaron** los otros seis contratos pendientes, el runner por ciclovías ni modos completos terminados con teclado humano; están asignados para integración y prueba, sin presentarse como resueltos.

La prueba de compilación/núcleo general de Motor City ya había pasado en el CI de la rama; la batería Chromium integral del repositorio tiene su propio workflow y puede tardar más. Ambos son controles diferentes.
