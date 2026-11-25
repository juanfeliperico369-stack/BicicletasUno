# Bitácora de Motor City

## 25-nov-2026 · 5.4.1 «Cápsulas» · Fase 5 del renacimiento cenital (Claude)
- **Lo que pide el prompt de relevo, Fase 5:**
  - comprobar que el paso entre el mundo abierto cenital y las Carreras retro conserve el estado;
  - la cápsula 3, solo la interfaz: el garaje y la colección en 2D pixel con las fichas de `MC.Taller`, el perfil de moto de `MC.Dinamica` y los ganchos de la capa aérea, todo sin cargar el núcleo;
  - los controles táctiles para el WebView de Android, midiendo 60 cuadros por segundo con 📏.
- **Hecho:**
  - **🧰 Garaje y colección** (`juegos/getaway/71-garaje.js`, aditivo):
    - cada vehículo va en una ficha con su dibujo de lado en pixel art (procedural, 64 × 28, agrandado sin suavizar) y las cifras de `MC.Taller.disenar`: velocidad máxima, 0–100, frenada desde 100, potencia por peso y consumo, con su ficha real;
    - la moto trae su perfil de `MC.Dinamica` (reparto del peso, centro de masa, agarre y marchas; se inclina en las curvas);
    - la pestaña «Capa aérea» trae lo que vuela (capa 2: jetpack, avioneta y avión), con su techo y su velocidad mínima. Solo cifras del motor: sin una ficha con alas reales no se inventa la pérdida. `G.Garaje.capaAerea()` es el gancho para la cápsula del aire;
    - **sin cargar el núcleo:** se abre desde la portada (🧰) sin cargar ninguna ciudad, y el carro que eliges ahí es con el que empieza el mundo abierto;
    - en el mundo abierto se abre desde 🎮 Modos, pausa el mundo y cambia el carro;
    - la colección cuenta los kilómetros de cada vehículo mientras manejas (`turnocero` guarda `km`).
  - **📏 de las carreras retro:** `G.Retro.medir()` o `?medir=retro` hacen correr al bot en Las Palmas, y Medir cuenta cada cuadro y el tiempo de dibujo de la pista (`MC.Pista.entrar` da `ultimoMs`), con el mismo panel y 📋. El `?medir` de siempre (las tres cámaras) no cambia.
  - **En el celular:** vibración corta al chocar y con el nitro (`navigator.vibrate`, que el WebView de Android tiene); los controles táctiles de la 5.4.0 en las esquinas.
  - **Arreglo de raíz en `68-medir.js`:** el sello de tiempo del cuadro (`requestAnimationFrame`) puede ser anterior al inicio de la medición; entonces daba `i = −1` y `TRAMOS[−1][0]` rompía. Era la carrera intermitente de `pruebas/medir.mjs` («Cannot read properties of undefined (reading '0')»), que se veía también en `main`.
  - **Prueba nueva, `pruebas/capsulas.mjs`** (en `motor-city-qa.yml`).
- **Probado:**
  - `node pruebas/capsulas.mjs`: ✓ en 3 de 3 corridas:
    - el garaje en la portada, sin ciudad: 6 fichas con dibujo, cifras y la moto, y 3 en la capa aérea;
    - el mundo empieza en el carro elegido; el garaje en el mundo pausa y cambia el carro; los kilómetros suben;
    - de ida y vuelta a las carreras, la posición, el rumbo, el carro, la plata, la búsqueda, el clima, la cámara y el modo quedan iguales, y el reloj no avanza mientras se corre;
    - 📏 de las carreras: 60 fps y dibujo con p95 de unos 6 ms;
    - el módulo retro y el garaje pesan juntos 71 KB (la meta era menos de 150);
  - `node pruebas/medir.mjs`: ✓ en 3 de 3;
  - `node pruebas/pista-retro.mjs`, `modos.mjs` y `getaway-contenido.mjs`: ✓;
  - `node motor.mjs prueba` y `prueba --navegador` (**158 bien**): en verde.
- **Falta:** la APK y pasar a `main`, con el OK del autor; medir en el celular del autor (📏 → «Carreras retro»).

## 25-nov-2026 · 5.4.0 «Carreras retro» · Fase 4 del renacimiento cenital (Claude)
- **Lo que pide el prompt de relevo, Fase 4:**
  - `MC.Pista`, con la técnica clásica de segmentos, escrita desde cero (sala limpia), aparte de `MC.Arcade`, que se queda para la calle real;
  - dos circuitos;
  - «🏎️ Carreras retro» en Turno Cero;
  - una prueba con la cresta, la curva continua, el bot, el p95 y 0 errores;
  - la 5.4.0.
- **Hecho:**
  - **`js/47-pista.js` (`MC.Pista`):**
    - **la pista:** segmentos de 200 de largo con `p1` y `p2` (mundo, cámara y pantalla), curva, banda de color cada 3 segmentos, objetos y carros; colinas cosenoidales y curvas acumuladas, con fuerza centrífuga;
    - **la proyección:** la clásica (`d = 1/tan(FOV/2)`, 280 segmentos a la vista). En vertical se usa la misma escala en los dos ejes y el horizonte un poco más arriba: con `H/2` en el eje vertical, la imagen saldría estirada al doble.
    - **pasada 1, de cerca a lejos con `maxY`:** recorta cada segmento contra lo ya pintado, guarda `seg.clip` y pone niebla (6 niveles) en los últimos 45 segmentos. Las franjas de pasto, berma, pianos, asfalto, líneas y la baranda se juntan por color y nivel de niebla: **unos 40 rellenos por cuadro**.
    - **pasada 2, de lejos a cerca:** los objetos y los rivales de todos los segmentos frente a la cámara, recortados contra `seg.clip`. Un carro detrás de una cresta asoma el techo y nunca se pinta debajo de ella.
    - **lo demás:**
      - paralaje de 3 capas (cielo, montañas del Valle y la ciudad o las lomas con pinos), que se mueve con la curva, la velocidad y la altura;
      - el carro con 6 estados (recto, giro suave y brusco, en plano y en subida), vibración en la berma, chispas y humo al derrapar;
      - rebufo a menos de 15 segmentos y nitro (FOV de 100° a 116°, líneas de velocidad y una sacudida);
      - rivales que cambian de carril sin saltos y con un poco de goma;
      - HUD con posición, vuelta, tiempo, velocidad, nitro y minimapa, y controles táctiles en las esquinas (en vertical, el carro va encima de la fila de botones);
    - **los dos circuitos** (1,6 km cada uno):
      - «Subida a Las Palmas»: subida larga, curvas encadenadas, una horquilla, lomas con cresta, la bajada por Escobero, pinos y baranda continua;
      - «Autopista Regional nocturna»: alta velocidad, puentes y arcos sobre la vía, postes con luz y la silueta de la ciudad;
    - **sin pantalla, para las pruebas:** `carrera`, `paso` (paso fijo de 1/120 s), `bot`, `simular`, `perfil`, `crearDe` y `cieloDe`.
  - **Turno Cero, `juegos/getaway/70-retro.js` (aditivo):** «🏎️ Carreras retro» en 🎮 Modos, con los dos circuitos a 2 vueltas contra 5 rivales.
    - El mundo abierto se pausa mientras corres, y al salir vuelves al mismo punto, con el mismo carro.
    - Corres con el color de tu carro, y el cielo de Las Palmas sale de la hora y el clima del mundo (`cieloRetro`): de noche, la pista se oscurece y se prenden los faros.
    - Premio de 💵 500, 250 y 100 por puesto, y récord por circuito.
  - **Prueba nueva, `pruebas/pista-retro.mjs`** (en `motor-city-qa.yml`).
- **Probado:**
  - `node pruebas/pista-retro.mjs`: ✓
    - la cresta: 0 píxeles debajo con el recorte, 280 sin él; el carro asoma el techo;
    - la curva continua, con un salto de 0,25 como máximo, y la altura cierra la vuelta;
    - el bot gana los dos circuitos: 101,3 s y 76,3 s a 2 vueltas;
    - el paso y el dibujo dan un p95 de 5,2 a 5,9 ms en vertical y en horizontal (el intervalo entre cuadros, 16,7 ms: 60 fps);
    - Turno Cero: pausa, premio, récord, vuelta al mismo punto y salida con ✕;
    - 0 errores;
  - `node motor.mjs prueba` y `node motor.mjs skills --verificar`: en verde;
  - `node motor.mjs prueba --navegador`: **158 bien**;
  - `node pruebas/getaway-contenido.mjs`: ✓;
  - `node pruebas/modos.mjs`: ✓. Una corrida falló solo en el umbral del ⏫ acelerador fijo (8,7 m/s contra más de 10): depende de los cuadros reales de SwiftShader, como advierte la misma prueba, y en las dos corridas siguientes pasó.
- **Peso:** `js/47-pista.js` pesa unos 52 KB y `70-retro.js` 4 KB (la meta del módulo retro era unos 150 KB).
- **Falta:** la APK (`apk-juegos.yml`) y pasar a `main`, con el OK del autor; la Fase 5 (cápsulas y celular).

## 24-nov-2026 · 5.3.2 «Mundos saneados» · Fase 2 del renacimiento cenital (Claude)
- **Lo que pide el prompt de relevo, Fase 2 (Motor City):** el mismo saneamiento en `geo/territorio.py`, regenerar los mundos MC4 y, con los datos limpios, quitar la tolerancia de 1 m de la colisión (`js/32-fisica.js`).
- **Hecho:**
  - **`geo/territorio.py`:** la ley de soberanía vial del Motor del Valle 1.3 (regla A del autor): a cada huella se le quita el corredor de cada vía a nivel (ancho / 2 + 1,3 m en las de carros; + 0,3 m en peatonales, escalas, senderos y ciclorrutas; las aceras y cebras van dentro de su calle) y el agua; las casas de OSM conservan el andén de las calles menores, pero no el asfalto (en un juego ningún carro puede chocar con una casa pintada sobre la calle); los restos de menos de 16 m² se van, salvo que conserven el 90 % y 12 m². Los puentes, túneles y vías cubiertas o interiores no despejan nada y quedan con su nivel en `VIASJ` (`[5]`: 1 o −1; el cargador lo lee como `via.nivel`). Las huellas traen su fuente (`sources[1].dataset`).
  - **Los tres mundos, regenerados** (con su agua de `precalcular-agua.mjs` y su PVS de `pvs.mjs`):

    | Mundo | Huellas | Tocan | Recortadas | Se van | Marcadas (OSM) | Área que queda |
    |---|---|---|---|---|---|---|
    | Medellín (`fusionar.mjs`, de El Metro) | 639.457 → 622.086 | — | — | — | — | 98,45 % (Motor del Valle 1.3) |
    | Guatapé (`territorio.py`) | 2.661 | 524 | 430 | 93 | 48 | 94,7 % |
    | Nueva York (`territorio.py`) | 163.875 | 9.890 | 9.371 | 365 | 14.968 | 98,9 % |

    En Guatapé, las que se van son casi todas huellas automáticas (Google y Microsoft) de 28 m² de mediana sobre el embalse o sobre la calle: 2 de OSM.
  - **`js/32-fisica.js`:** la colisión con los edificios usa el mismo radio en la calle y fuera de ella (antes, sobre la calle, solo chocaba si uno se metía más de 1 m en la huella).
  - **Prueba nueva, `pruebas/calles-libres.mjs`** (en `motor-city-qa.yml`): recorre el eje de las calles de carros a nivel cada 2 m y pregunta lo mismo que la colisión: ¿un carro de radio 0,4 m chocaría con una casa?

    | Mundo | Antes (mundo viejo, sin la tolerancia) | Ahora |
    |---|---|---|
    | Medellín | 45.689 de 2.727.587 puntos (1,675 %) | 15 (0,001 %) |
    | Guatapé | 90 de 33.976 (0,265 %) | 0 |
    | Nueva York | 25.729 de 1.887.050 (1,363 %; con túneles y puentes) | ver el informe (0,074 % sin túneles ni puentes) |
  - `pruebas/prueba.mjs` ya no exige 639.457 huellas: exige las del mundo (622.086).
  - **Pruebas que elegían su escenario en el mapa** (la física no cambió):
    - manejo 4.5: el punto de partida debe ser calle;
    - el ruido: busca su edificio en 400 m;
    - el ladeo de la moto: compara con la teoría hasta su tope de 45°;
    - ciudad viva: mira el calor de la búsqueda (una llamada suma 8; el nivel 1 pide 15).
  - **Mejora de Turno Cero:** la ambulancia prueba otros puntos de partida si el primero no tiene ruta (`66-ciudad-viva.js`).
  - **R6‑b** (`precocinar-sectores.mjs`) acepta el ED1 v2 de El Metro.
  - `pruebas/medir.mjs` es intermitente también en `main` (una carrera en el arranque de `?medir`); queda anotado.
- **Probado:** ver `reportes/2026-11-24-claude-fase2-cenital.md`.
- **Las copias de los juegos** (`<juego>/motor-city/`) siguen en la 5.3.1: la 5.4.0 se copia una sola vez al cerrar la Fase 4 (cada copia mueve unos 70 MB de mundos y HTML).

## 24-nov-2026 · Fase 1 del renacimiento cenital · el Valle saneado (Motor del Valle 1.3.0; motor 5.3.1 sin cambios)
- **Lo que pide el prompt de relevo, Fase 1:** sanear el mapa del Valle en `motor-valle/` (BicicletasUno, copiado a MetroZero), sin tocar ningún render, con las decisiones del autor (regla A, trozos de 160 m, rehacer desde las fuentes originales y la prueba de craqueo).
- **Hecho:**
  - **la ley de soberanía vial** (`sanear.py`), la rasante (`rasante.py`), las capas de puentes y túneles (`niveles.py`), los anchos (`anchos.json`) y las pruebas `geometria.py` y `geometria.mjs`;
  - **El Metro:** `edificios.js` v2 con una guarda contra su recorte en tiempo real, y la cota al final de `vias.js`;
  - **EnCicla:** `edificios.bin` y `vias-cota.bin`, sin conectar.
- **La prueba de craqueo, en verde:**
  1. geometría exacta: 0 solapes sin marca;
  2. en el juego: 0 solapes, y el recorte de El Metro corta 0 de 622.086 (antes 107.546 y quitaba 17.190);
  3. se conserva el 98,45 % del área;
  4. la fidelidad contra OSM no baja (las casillas son idénticas);
  5. hay 44.538 conflictos en el GeoJSON;
  6. hay capturas en 6 zonas.
- **Probado:**
  - El Metro: 100 partidas con 0 errores;
  - EnCicla: 177 ✓ (HTML idéntico);
  - las dos copias del Motor del Valle, iguales.

  Motor City no cambió de código.
- **El informe:** `reportes/2026-11-24-claude-fase1-cenital.md`; la evidencia está en `reportes/fase1-cenital/` y las capturas en `reportes/img/claude-fase1/`.
- **Esperan al autor:**
  - el OK de la Fase 2;
  - las casas confiables de OSM en El Metro (su andén de 1,3 m);
  - las vías precisas en El Metro (+230 KB);
  - el ancho por fachadas (apagado).

## 24-nov-2026 · Decisiones del autor, el prompt de relevo en `main` y la misión y la visión
- **El autor decidió las cinco preguntas** de la Fase 0:
  1. el ancho **real** de las vías (con las ciclorrutas);
  2. trozos de **160 m**;
  3. EnCicla: **solo el modo libre**;
  4. El Metro: **Ciudad Libre y Bus**;
  5. «**la opción que pruebe que la ciudad será bien craqueada**»: rehacer desde las fuentes originales, con la prueba de craqueo (geometría exacta, ≥ 97 % del área construida, fidelidad contra OSM sin bajar de la auditoría del 17‑nov, conflictos y capturas).
- **`docs/PROMPT-RELEVO.md`** ya trae las decisiones (§ 3 y § 4) y la tabla de misión y visión. El autor pidió subirlo a `main`.
- **`docs/VISION-Y-MISION.md`:** la misión y la visión del motor, del Motor del Valle y de cada juego, sacadas de lo que el autor ya había escrito y puestas al día con estas decisiones.

## 24-nov-2026 · Fase 0 del «renacimiento cenital» · auditoría y línea base, sin cambiar los juegos
- **El autor:** «Ponte al día, atiende el prompt de relevo y el de skills, y continúa con estos archivos». Compartió tres cosas:
  - el *Master Prompt* (fases 0 a 5: saneamiento GIS, motor cenital 2.5D, integración y carreras pseudo‑3D en Turno Cero);
  - la *Investigación técnica*;
  - el ZIP de GPT‑6 «Eón», con su informe maestro y su prompt maestro.
- **Relevo y skills:**
  - `node motor.mjs skills --integrar --agente claude-code` terminó con «4) Verificación: ✓ todo en orden»;
  - con `--verificar` quedan en orden los cuatro repositorios.
- **Lo que pide el prompt, Fase 0 (solo lectura):** el mapa técnico real y el plan de la Fase 1, en `docs/AUDITORIA-FASE0-CENITAL.md`. La evidencia está en `reportes/2026-11-24-claude-fase0-cenital.md` y `reportes/fase0-cenital/`.
- **Línea base de hoy:**

  | Repositorio | Resultado |
  |---|---|
  | Motor City | 158 bien |
  | El Metro | 100 partidas, 0 errores |
  | EnCicla | 170 bien |
  | Compuerta de EnCicla | Sigue en rojo: p95 de 103,7 ms en la Carrera 43A y 61,2 ms en Las Palmas (meta < 50) |
- **Medido:** en los datos de El Metro, **120.187 de 638.303 edificios (18,8 %) pisan la vía** con la regla que ya usa el juego, y 151.055 (23,7 %) con los anchos del prompt.
  - Hoy cada motor lo tapa en tiempo real: El Metro recorta al cargar, EnCicla inventa lotes y Motor City tolera 1 m en la colisión.
  - **Lo poco conocido:** el 73 % de las huellas sale de modelos sobre imágenes de satélite (Google y Microsoft), corridas de 1 a 3 m frente a los ejes de OSM; además, el 95 % se guarda como rectángulo.
- **Correcciones a los documentos:**
  - Turno Cero no está en MetroZero, ni puede estar (18+).
  - `motor-city/` en los hermanos es solo de consulta; lo compartido es `motor-valle/`.
  - El Metro y EnCicla ya tienen un mundo 3D con cenital.
  - `MC.Arcade` no usa la curva acumulada: proyecta la calle real y las lomas tapan bien. Lo que le falta son las pistas diseñadas, el nitro, el rebufo y un FOV ancho (hoy, de 58° a 71°).
  - Los trozos de 250 m no se alinean con los cachés de 160 m.
- **Los cinco videos del autor,** identificados: Reckless Getaway 2, Super Arcade Racing, GTA Chinatown Wars, GTA 2 y GTA 1.
- **Sin cambios en los juegos ni en el motor:** solo documentos y evidencia. La Fase 1 (saneamiento en `motor-valle/`) **espera cinco decisiones del autor** (§ 7 de la auditoría).
- **Prompt de relevo:** `docs/PROMPT-RELEVO.md`. Trae las fases 1 a 5 completas, las seis decisiones del autor con lo recomendado, los comandos, los criterios de «hecho» y la línea base. El aviso está arriba en `CLAUDE.md`, `AGENTS.md` y `GEMINI.md`.

## 23-nov-2026 · 5.3.1 «Skills para todas las IA» · la lista, un comando que las integra y el prompt para compartir
- **El autor:** «dame la lista de skills y plugins que tenemos y cómo integrarlos, con un prompt para compartir entre IA y que las integren automáticamente».
- **La lista:**
  - **10 propias en el motor:** `motor-city-*`;
  - **8 en El Metro:** `el-metro-*`, `medellin-fiel`, `coordinacion-multi-ia` y tres copias públicas de Anthropic;
  - **4 externas con commit revisado:** Hallmark, Modern Web Guidance, find-skills y HyperFrames;
  - **3 plugins de Claude Code** en `.claude/settings.json`.

  `node motor.mjs skills` la muestra, y con `--json` la entrega en JSON.
- **Un solo comando:** `node motor.mjs skills --integrar --agente <tu-agente>` (`herramientas/skills-externas.mjs`). Hace cuatro cosas:
  1. deja las propias iguales en `.claude/skills/` (Claude Code) y en `.agents/skills/` (Codex, Antigravity, Gemini CLI y Cursor). Copia en las dos direcciones y, si una difiere, no pisa nada sin `--desde`;
  2. completa el `.gitignore`;
  3. instala las externas con `npx skills add`, en el repositorio donde se corre;
  4. lo verifica.

  También hay `--sincronizar`, sin internet, y `--verificar`, que ahora corre en la QA.
- **Cuatro fallas encontradas y arregladas:**
  - **Las propias solo estaban en `.claude/skills/`:** Codex, Gemini CLI y Antigravity, que buscan en `.agents/skills/`, no las cargaban solas. Lo confirmé con su documentación y con el instalador.
  - **En los juegos hermanos, `--instalar` dejaba las externas dentro de `motor-city/`**, donde nadie las encuentra.
  - **El instalador deja enlaces en `.claude/skills/<id>`,** y el `.gitignore` con `carpeta/` no los ignoraba: `git add -A` habría subido 4 enlaces rotos. También faltaba `find-skills`.
  - **`sincronizar` habría copiado a los juegos las externas** instaladas en el motor.
- **Probado de verdad:**
  - las 4 externas instaladas en el motor para Codex y Claude Code: `git status` no las ve;
  - con Claude Code solo, en un repositorio vacío: también instala y verifica;
  - el conflicto entre las dos carpetas: sin `--desde`, avisa y no pisa;
  - esta misma sesión de Claude Code cargó al instante `hallmark`, `modern-web-guidance`, `find-skills` y `hyperframes`;
  - la batería del motor: 158 bien.
- **El prompt para compartir entre IA:** `docs/PROMPT-SKILLS.md`. Están al día `docs/SKILLS-Y-PLUGINS.md` (§ 0), la skill `motor-city-skills-externas`, `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` y `TAREAS-IA.md` (G‑H13).
- **El juego no cambia:** solo la versión. La APK v5.3.0 sigue vigente.

## 23-nov-2026 · 5.3.0 «Todo lo nuevo, unido» · las ramas de Gemini y ChatGPT, comprendidas y mejoradas
- **El autor:** «Retoma, continúa y termina; integra todo lo nuevo, compréndelo y mejóralo; y dame el prompt de relevo para la otra IA».
- **Unido de Gemini / Antigravity (5 ramas):**
  - **G5‑07:** fichas de los 30 sitios icónicos de Medellín (`docs/sitios/`, con `sitios.json`, receta de modelado, colores y referencia propia);
  - **G5‑01‑b:** Historieta de noche, con lluvia y en primera persona (bandas perceptuales, sin rayas en la calzada);
  - **G5‑05:** 🎬 guía sin flecha en el modo cine (hojas y palomas hacia el destino);
  - **G5‑08:** química del mundo (la lluvia apaga el fuego, los charcos salpican, el viento lleva el humo). Además, la proyección de `MC.Efectos` suma la cota en 3D, el mismo arreglo de la 5.2 para los globos: en Medellín los choques y el humo tampoco se veían;
  - **G5‑04:** minijuegos táctiles (puentear, chapa, llanta y cadena).
- **Unido de ChatGPT / Codex (2 ramas):**
  - **C5‑01:** vuelcos con auto‑enderezado y abolladuras de costado;
  - **R6‑b:** Worker con cajas LOD2 por sector.
- **Mejorado por Claude al unir:**
  - **Vuelcos:**
    - el modelo giraba alrededor de la línea del piso y, boca arriba, quedaba enterrado; ahora se apoya en el costado o en el techo;
    - volcado no se acelera ni se gira.
  - **R6‑b, apagado por defecto** (se prende con `?r6b`):
    - no mejoró nada medible, y al llegar cada sector borraba regiones ya armadas: tras 30 s había 65 regiones y 81 pendientes, contra 128 y 0 sin él;
    - ya no borra lo armado;
    - solo se incrusta Guatapé, así el HTML no carga 2,3 MB que no se usan.
  - **El minijuego entra al juego:** tras robar un carro aparece por 6 s «🔌 Puentear», opcional y sin bloquear nada; si se gana, nadie reporta el robo y la búsqueda baja (de 15 a 0 en la prueba).
- **Nuevo de Claude · los sitios icónicos en el 3D realista** (`js/45-y-sitios.js`, primera versión de C5‑02 con las fichas de Gemini). Cada uno de los 28 sitios con forma tiene la suya:
  - la aguja del Coltejer con sus ojos;
  - las torres y la nave de la Candelaria y de la Catedral, con el cimborrio de la Catedral;
  - las bandas del Palacio de la Cultura;
  - la cúpula del Planetario y las rocas de la Biblioteca España;
  - el óvalo del Atanasio con sus torres de luz;
  - los cubos de Explora y la pirámide invertida de la Biblioteca EPM;
  - los postes del Parque de las Luces y las esculturas de la Plaza Botero;
  - las flores del Orquideorama, el Pueblito Paisa y el Monumento a la Raza.

  De noche, sus ventanas brillan. Los sitios que son un edificio reemplazan solo al genérico que cae dentro de su planta; las plazas solo suman. Son 6.698 triángulos en total y no pesan nada (no hay modelos ni texturas). **El Coltejer y el Planetario no aparecían en el 3D**, porque la capa de hitos solo se dibujaba en la panorámica.
- **Juegos hermanos:**
  - **EnCicla 3.7.0:** la 3.5.0 de la otra sesión de Claude más las dos 3.6, de Antigravity y de GPT‑6. `tests/run.js` está en verde (170). La página sigue en la 3.4.0: el `publicar.yml` de GPT‑6 exige un benchmark (p95 < 50 ms con la CPU 4×) que todavía da 131 y 77 ms. No se cambió esa compuerta; decide el autor.
  - **El Metro 3.8.0:** la 3.6/3.7 «Épocas» de la otra sesión de Claude más la 3.7 de Antigravity y CX‑36 de Codex. 100 partidas con 0 errores; publicado con la APK 36.
- **Pruebas nuevas en la QA:** `sitios-3d`, `sitios-medellin`, `vuelcos`, `puentear-robo`, `minijuegos`, `guia-cine`, `quimica-mundo`, `r6b-datos` y `r6b-browser`.

## 23-nov-2026 · 5.2.0 «Ciudad viva» · fase 2 del plan 5.0 y lo de las otras IA, retomado
- **El autor:** «Haz tu parte; en algún momento ya dejarán de proveer, así que retómalos». Claude hizo la fase 2 y tomó los pedidos de Gemini y ChatGPT que más se notan en el juego.
- **Fase 2 · la ciudad viva** (`js/26-vida-ciudad.js`, `MC.CiudadViva`; idea de los «escenarios» de los mundos abiertos y de las reglas de respuesta de los diálogos de Valve, en sala limpia):
  - **Eventos con radio de oído:** choque, derrape, bocina, atropello, disparo, explosión, sirena y servicio.
  - **Reacciones:** según el evento, la distancia y el «valor» de cada persona (sale de su semilla), la gente **mira**, **huye**, **llama** por celular o **se acerca a ayudar**. La rutina se pausa y, al terminar, vuelve caminando a su sitio; nadie se mete a un edificio.
  - **Escenas de la calle:** gente sentada en las bancas y esperando en los paraderos del mobiliario real, según la hora y la lluvia (de noche, menos). Son estables: la misma persona en la misma banca.
  - **Frases** (G5‑03, escritas por Claude porque Gemini no alcanzó): `datos/frases/ciudad.json`, 56 de familia y 17 de adultos, con condiciones de evento, lugar, hora y lluvia. Gana la más específica y no se repite en 90 s. Se incrustan al construir (`MC_FRASES`).
  - **Turno Cero** (`juegos/getaway/66-ciudad-viva.js`): el testigo que llama por un atropello, un disparo o una explosión **sube la búsqueda** («un vecino llamó a la policía») y pide el servicio. 🚑 La ambulancia o 🚒 los bomberos salen a unos 300 m, llegan por la ruta real con la sirena, atienden (la ambulancia se lleva a los heridos) y se van. Globos con lo que dice la gente y 📞 ❗ 🩹 💨 sobre quien llama, mira, ayuda o huye. Poses nuevas: sentado y con el celular.
- **Lo de las otras IA, retomado:**
  - **C5‑01 · motos que se inclinan** (de ChatGPT): motos, bicis, patinetes y patines se inclinan hacia adentro de la curva, φ = atan(v·ω/g) con la gravedad real y un tope (45° la moto, 32° lo de ruedas), en los dos manejos. El 3D inclina el modelo, el piloto y las ruedas. Faltan los vuelcos y la deformación.
  - **R8 · cuartos falsos** (de ChatGPT): detrás de cada ventana encendida de las fachadas R1, de noche, un cuarto de 2,7 × 3 × 3–5 m trazado en el sombreador (interior mapping): pared del fondo con un cuadro o un mueble, piso de madera o baldosa, techo con su lámpara y luz cálida, blanca o el azul de un televisor. Las rejas y las cortinas se conservan. Solo con GPU media o alta; en gama baja y en la Historieta queda la ventana plana. Captura en `reportes/r8-cuartos-falsos-5.2.webp`. Faltan el SSAO, los faroles con luz y el agua con reflejo.
  - **G5‑06 · retos desde cualquier semáforo** (de Gemini; idea de Burnout Paradise): quieto junto a uno de los 355 semáforos reales, 🛑 y acelerar a la vez quema llanta en el sitio y reta al de al lado a una carrera hasta un sitio con nombre (lugares, hitos o estaciones) a 0,5–1,6 km. Es la 🏁 de Modos con un solo rival que sale al lado.
  - **G5‑12 · 📏 medir el rendimiento** (de Gemini): `?medir` en la dirección o ⏸ Menú → 📏. Un bot maneja 60 s en tres cámaras y sale un panel con fps, p50, p95, p99, tirones, memoria y GPU, y **📋 Copiar resultados**. Guía en `docs/MEDIR-EN-EL-CELULAR.md`.
- **Arreglos que salieron al probar:**
  - **La proyección 3D no sumaba la cota.** `Vistas.aPantalla` recibía la altura sobre el suelo, pero el 3D trabaja con la cota absoluta (unos 1.500 m en el centro de Medellín): la flecha al objetivo, los globos y los destellos de las sirenas quedaban fuera de la pantalla en las lomas. Ahora la vista suma la cota (y `tres.mjs` pasa la altura sobre el suelo, como el resto).
  - **El carro no arrancaba con el joystick de lado.** Casi quieto, la deriva de la llanta delantera se medía contra un piso de 0,5 m/s y, con el volante a tope, el modelo inventaba un derrape que frenaba tanto como empujaba el motor. Ahora las fuerzas de lado entran de a poco desde 0 m/s (a esa velocidad manda el modelo cinemático).
- **Pruebas nuevas:** `ciudad-viva.mjs` (45 comprobaciones, en Node con el mundo real y en el navegador con el despacho), `retos-semaforo.mjs` y `medir.mjs`; `dinamica.mjs` suma la inclinación de motos y bicis (25). Las cuatro, más `anillos.mjs`, entran a la QA.

## 23-nov-2026 · 5.1.0 «Todo junto» · lo nuevo de ChatGPT y Gemini, unido y pulido
- **El autor:** «Listo lo nuevo: ármalo todo, mejóralo, púlelo y optimízalo; piensa cuál será el siguiente paso y dame los prompts para Gemini/Antigravity y ChatGPT/Codex, y lo que harás tú mientras vuelven».
- **De ChatGPT y Codex** (cuatro ramas, sin tocar el juego):
  - **R3:** `geo/auditar_pisos_catastro.py`. Claude lo corrió (solo conteos): la capa *Construccion (8)* tiene **1.135.621 construcciones y el 96,7 % trae pisos válidos**, en `reportes/r3-cobertura-catastro.json`.
  - **R4:** auditoría de los techos de Overture, cruce seguro de huellas y reproyección.
  - **R5:** informe de licencias del relieve. Existe un **MDT LiDAR de 1 m de Medellín (2024), CC BY-SA 4.0**; espera la decisión del autor.
  - **R6:** `herramientas/precocinar-sectores.mjs`, mallas por sector de 1 km en 3 niveles, formato v2 i16.
  - Más dos flujos de QA que corren solo en los pull requests de esas herramientas.
- **De Gemini y Antigravity:**
  - **G5‑01, vista Historieta** (⚙️ Gráficos → historieta; cámara a 55° que gira con el carro);
  - **V4, paralaje por biomas** en 🏁 Arcade (6 biomas × 3 capas).
- **Pulido de Claude:**
  - **Historieta en la GPU.** Antes, cada cuadro pasaba por la CPU (`getImageData`, Sobel y `putImageData`: unos 8 ms, y el grano de las texturas salía como puntos negros). Ahora es un pase en la GPU de unos 2 ms: la tinta sale del laplaciano de la profundidad, que en un plano es cero, y se apaga con la niebla. Colores por bandas suaves; muros y suelo sin grano ni texturas de fachada (`uPlano`).
  - **Ganchos nuevos en `VistaTres`:** `posRender` y `uPlano`.
  - **Biomas:** las 18 imágenes ya no van en el código (769 KB → 30 KB); se incrustan al construir desde su manifiesto (`MC_BIOMAS_V4`).
- **Juegos hermanos**, cada uno tenía dos versiones paralelas:
  - **EnCicla 3.4.0:** la 3.3.0 de la otra sesión de Claude más la 3.3.0 de Antigravity;
  - **El Metro 3.5.0:** la 3.4.0 «Jugo y ciclovías» de la otra sesión de Claude más la 3.4.0 «Mundo 3D y Realismo» de Antigravity, con la colisión barrida que le faltaba a la carrera por ciclorruta.
- **Pruebas:** `historieta.mjs` y `paralaje-biomas.mjs` entran a la QA.
- **Dos tropiezos que salieron al unir** (las pruebas humana y de modos fallaban):
  - **El presupuesto de regiones.** Las dos ramas de Gemini envolvían `VistaTres.dibujar` para construir de un golpe 28 regiones (biomas) o 95 (Historieta) cuando había pocas. Así salían completas sus capturas, pero en el juego era un tirón de segundos al empezar, al teletransportarse o con el rescate. Se quitó: el presupuesto lo decide `MC.Vistas` según la calidad. Las pruebas de Gemini siguen en verde.
  - **El manejo real en un atasco.** La prueba humana fallaba según la hora: el reloj del juego sigue la hora real y, con el semáforo en rojo, los rivales quedaban quietos junto a una torre, donde la pista roza el edificio. Ahora:
    - los rivales y la policía se pueden **empujar** (impulso por masas, `cuerpo` en sus obstáculos);
    - un roce suave contra una pared **desliza** y conserva la rapidez;
    - si queda **encajado** más de 0,6 s, toma el movimiento del arcade mientras siga rozando y vuelve al real 0,4 s después.
  - La prueba humana pasa 3 de 3 (249 a 450 m).
  - El modo Extremo de la prueba de modos falla a veces, como ya pasaba en la 4.8: teletransporta al jugador, así que no depende de la física.


## 23-nov-2026 · 5.0.0 «Que se sienta» · el manejo real del carro y el plan para las tres IA
- **El autor:**
  - «¿Cómo podemos llegar hasta el nivel del motor de GTA San Andreas o Chinatown Wars?»;
  - «¿Qué otros motores podríamos copiar?»;
  - luego: «Sí. Agrega también a Gemini, que ya está disponible, dame los prompts para cada uno, mira lo nuevo de ChatGPT con Codex y retoma lo que quedó».
- **`MC.Dinamica` (`js/37-dinamica.js`):** el carro con física de verdad.
  - **Hoja de manejo por vehículo:** masa, batalla, reparto de peso, centro de masa, μ, rigidez de llantas, tracción, kW, N·m, rpm, marchas, frenos, dirección y suspensión. Sale de la ficha del taller.
  - **Carga que cambia entre ejes** y llantas que se saturan («fórmula mágica»), con círculo de fricción.
  - Subviraje de fábrica; el freno de mano suelta la cola.
  - **Marchas automáticas,** corte de rpm y freno de motor.
  - **Carrocería con resortes** (cabeceo, alabeo, rebote), dibujada en el 3D.
  - **Choques con impulso:** contra paredes y contra el tráfico, que sale corrido y vuelve a su carril.
  - **Ayudas para celular:** control de estabilidad con el joystick, la velocidad baja si el dedo apunta de lado, reversa corta si queda trancado y ayuda de esquinas.
  - El juego da un poco más de agarre y de empuje que un carro de calle (×1,3 y ×1,6), como hacen los juegos de mundo abierto.
- **Sonido:** el tono del motor sale de las rpm (f = rpm/60 × cilindros/2), en `MC.PersecucionAudio.motor`. El velocímetro de Turno Cero muestra la marcha.
- **⚙️ Flexibilidad → 🛞 Manejo de los carros:** real (lo de fábrica) o arcade. La IA sigue en arcade.
- **Prueba nueva `pruebas/dinamica.mjs`:** 19 comprobaciones.
  - Sedán Vega: de 0 a 100 en 6,6 s; de 100 a 0 en 41,1 m (la fórmula da 41,4).
  - Curva sostenida a 1,3 g sin trompo; en mojado, la mitad del agarre lateral.
  - Curva de 90° con el joystick; choque contra un edificio; golpe a un carro del tráfico.
- La prueba humana (solo entradas) sigue en verde con el manejo real: la carrera avanza 429 m a 30 m/s.
- **Unión:**
  - **R1 de ChatGPT/Codex** (fachadas de Medellín) con menos peso: copias de juego de 1024 y 512, 1,4 MB en vez de 6,7 por HTML;
  - **EnCicla 3.2.0** de la otra sesión de Claude a main y a la web (APK 3.2.0 en `descargas/`).
- **Plan y pedidos:**
  - `docs/PLAN-5.0.md` (diagnóstico frente a San Andreas, motores de los que se toman ideas, fases);
  - `docs/PEDIDOS-CHATGPT-5.0.md` (lo fuerte);
  - `docs/PEDIDOS-GEMINI-5.0.md` (lo fácil y mediano; Gemini vuelve).


## 22-nov-2026 · R1 fachadas de Medellín (rama de revisión)
- Doce texturas de ChatGPT integradas en VistaTres con emisión nocturna y respaldo procedural.
- Capturas y pruebas en reportes/2026-11-22-codex-integracion-arte-chatgpt-r1.md.
- R4 y R3 investigados, pendientes de fuentes y regeneración verificadas.


## 22-nov-2026 · 4.9.0 «Realismo» · three.js incrustado y el 3D realista
- **El autor:**
  - «Nuestro motor no logra mapear todo tal cual: los relieves, las casas y los edificios no son como son, y los gráficos aún son básicos. ¿Qué debemos hacer?».
  - Luego aprobó incrustar three.js: «haz todo eso que propones y sigue mejorando».
  - Sobre las imágenes: las fotos de la ciudad son solo para mirar y adaptar; no se montan en el motor.
- **three.js 0.170 (MIT) dentro de `dist/motor.js`:**
  - la construcción convierte su módulo en el objeto `THREE`, sin internet;
  - la licencia va en `js/vendor/LICENSE-three.txt` y en la cabecera;
  - `motor.js` pasa de 1,0 a 1,7 MB.
- **`MC.VistaTres` (`js/45-tres.js`):** dibuja las mismas regiones y mallas que `VistaGL` (que arma los datos y sigue de respaldo).
  - Luz: materiales físicos y sol con sombras de verdad (mapa que sigue a la cámara, alineado a sus texeles); luz de cielo hemisférica casi neutra (el azul lo pone el domo); reflejos solo en los objetos; exposición «Khronos PBR Neutral»; niebla del clima.
  - De noche: las ventanas encendidas brillan con luz cálida, y lo que el clásico aclaraba (carros, letreros) recibe un leve brillo propio.
  - Grano procedural en los muros, con las juntas del ladrillo, y en el suelo, con grano fino y manchas.
- **⚙️ Gráficos:** automático (realista salvo en GPU de gama baja), realista o clásico, con cambio en caliente (`MC.Vistas.reiniciarGL`).
- **Lección:** en three.js 0.163 y posteriores, `scene.environment` usa `scene.environmentIntensity` y no el `envMapIntensity` del material: teñía de azul todo lo que mira hacia arriba. Se encontró midiendo píxeles con las luces apagadas una por una.
- **Plan de datos para que la ciudad sea «como es»:** `docs/PLAN-REALISMO.md` (catastro en todas las comunas, techos de OpenStreetMap, relieve según la licencia, planos históricos, atlas de fachadas, mallas pre-cocinadas, «modo nube»).
- **Prueba nueva:** `pruebas/tres.mjs`.


## 22-nov-2026 · 4.8.0 · Flexibilidad, lo que dejaron Gemini y ChatGPT, y optimización
- **El autor:** «Retoma el trabajo de las otras IAs (Gemini y ChatGPT), termina de unir lo que falta en el Motor y el juego de prueba, más EnCicla y El Metro, dedícate a optimizarlos. Añade a todo *Flexibilidad*.»
- **Unión:** ramas de ChatGPT (`ia/chatgpt/4.7-auditoria-arcade-20261122`), Codex (`ia/codex/reporte-metrozero-20261122`) y Gemini (`ia/gemini/4.7-evolucion-arte-render`, solo coordinación) en el motor. EnCicla: la 3.0.0 de su otra sesión y la auditoría de GPT-6. El Metro: la 3.2.0, Antigravity, Codex y las dos de GPT-6.
- **⚙️ Flexibilidad (`js/37-flexibilidad.js`, `MC.Flex`):** diez ajustes para cualquier juego del motor:
  - control (según la cámara, apuntar, volante o un pulgar), giro, velocidad de los vehículos y distancia de la cámara;
  - acelerador fijo al subir y tren con palanca;
  - mano zurda, tamaño de la interfaz, calidad fija y vibración en choques.
  En Turno Cero: ⏸ Menú → ⚙️ Flexibilidad, guardado en `leerG().flex`. Prueba nueva: `pruebas/flexibilidad.mjs`.
- **Lo de ChatGPT (auditoría 4.7, 11/11 contratos):**
  - el metro con teclado o mando es palanca (↑ acelera, ↓ frena en cualquier cámara);
  - Run solo ofrece doblar hacia otra ciclorruta;
  - la carrera lejos de la salida pregunta «🚗 Ir manejando / ⚡ Llevarme ya» (sin teletransporte sin aviso);
  - la guardia de EnCicla quedó dentro de `60-modos.js` y se retiró `61-chatgpt-guardia-encicla.js`;
  - su prueba estática apunta a `pruebas/humano.mjs` (E2E solo con entradas) y su E2E de entradas reales pasa los cuatro escenarios.
- **Lo de Gemini (su plan de render, que no alcanzó a entregar):**
  - el Raster 3D por software dibuja el tráfico (`E.trafico`), respeta `_sinJugador` en el tren y tiene `aPantalla` (flechas, conos y efectos también sin WebGL);
  - la primera persona va a la altura de los ojos de quien maneja (1,15 m en carro, 2,3 m en bus) y solo dibuja el capó;
  - luz hemisférica, brillo especular Blinn-Phong y contorno, por vértice;
  - la niebla y la distancia siguen al escalador de resolución (`E.factorNiebla`, que nadie leía);
  - 🌄 miradores en el mundo abierto: la cámara de cine orbita, se cuentan y dan una propina.
- **Optimización medida (CPU 4×, manejando con ⏫):**
  - el caché de sectores de suelo tenía 16 sectores y el mapa grande, armándose en ratos libres, recorría 44 por fila: el LRU se vaciaba en ciclo (34 000 descompresiones en 8 s, 26 % de la CPU);
  - ahora guarda hasta 400 (unos 4 MB);
  - p95 del cuadro: cenital de 166 a 33 ms, tercera de 133 a 50 ms y ciudad 3D de 150 a 50 ms.
- **Interfaz:** en horizontal el minimapa sube junto a los botones (antes tapaba la fila Modos/Cámara); en zurdo los botones van a la izquierda y el minimapa a la esquina libre.
- **Pedidos nuevos en la misma sesión (Turno Cero):**
  - 🆘 **Rescate** (`juegos/getaway/63-rescate.js`, como el 🆘 de El Metro): salir a la calle más cercana, 🔧 grúa y mecánico, 🚕 taxi, 🚇 la estación más cercana, 🚑 ambulancia, 🏠 volver a donde empezaste y 🗺️ elegir un punto; un vigía lo ofrece si llevas 3,5 s empujando sin moverte o vas en carro lejos de las calles. Con la policía encima o en un capítulo, no hay saltos.
  - 🗺️ **Un solo mapa:** el minimapa, 🗺️ y M abren el mismo; al poner un punto aparece **🚀 Ir** (calle más cercana o, si no hay a 400 m, el sitio transitable más cercano al punto); 🌍 y alejar más allá de la ciudad pasan al planeta, y 🗺️ en el planeta vuelve. El botón suelto 🌍 se quitó (la tecla G sigue).
  - ✂️ **Pantalla en mitades** (motor, `MC.Controles({ mitades: true })`): abajo se maneja (joystick en el cuarto de su mano, botones al otro); arriba es siempre la cámara: arrastrar gira e inclina, pellizcar acerca o aleja, el encuadre se queda y el doble toque lo endereza. El dedo del joystick no se suelta aunque otro mueva la cámara. ⚙️ Flexibilidad permite volver a la clásica.
  - Prueba nueva: `pruebas/rescate-mapa.mjs`.
- **Juegos hermanos:** EnCicla 3.1.0 (giro, velocidad de la cicla y pedaleo fijo al empezar, junto a lado, tamaño y vibración) y El Metro 3.3.0 (arcade o realista, mano zurda, joystick, giro, velocidad, acelerador fijo y tamaño de botones), ambos con sus pruebas en verde.


## 22-nov-2026 · Ilustraciones de actos y accesibilidad del menú
- Cinco imágenes originales WebP aparecen en las transiciones de Turno Cero.
- MC.UI limpia el manejador Escape, cierra el menú anterior y devuelve el foco.
- Pruebas de modos admiten HTTP local. Ver CONTEXTO-CODEX-TURNO-CERO.md para resultados y pendientes.


## 22-nov-2026 · 4.7.0 · Plan de evolución, ritmo arcade, todo liberado y los modos en el mundo abierto
- **El autor** (a tres IA a la vez):
  - revisar el juego contra los mejores e investigar jugabilidad, controles, mundos grandes con pocos recursos, render y optimización;
  - un plan verosímil en un documento con la marca de cada IA;
  - arreglar los modos (lentos, engorrosos, «no se mueven»);
  - todo liberado; cada modo presente en el mundo abierto con la misma experiencia;
  - Run solo en ciclovías;
  - luego arte, cámaras y un solo mundo 3D.
- **Documento:** `docs/PLAN-EVOLUCION-CLAUDE.md`. Contiene:
  - una auditoría con «dedo» real en 6 cámaras × 5 vehículos;
  - la comparación con las ~40 referencias (técnica, no arte);
  - la investigación transversal, con fuentes;
  - ideas por género bajo el marco de la «doble vida» de Mara;
  - el mundo vivo (RPG y «MMO sin servidor»), Run, cámaras y arte;
  - la hoja de ruta 4.8–5.0 repartida entre Claude, Gemini y Codex;
  - las ideas que no tienen cabida.
- **Ritmo arcade** (a pie ≈ 43 % de la bici, como en EnCicla):
  - a pie camina a 2,2, trota a 4 y corre a 6,4 m/s;
  - bici: 9; e‑bike y MTB: 10,5; skate: 7; patines: 7,5;
  - se trota con el joystick a fondo en cualquier vista.
- **Modos más cortos y vivos:**
  - EnCicla y Mandados: 0,3 a 1,3 km;
  - Extremo: hasta 2,6 km;
  - tren: 2,4 m/s² al acelerar y 3,2 al frenar, ×3 lejos de la estación, sin espera inicial; el joystick empuja hacia donde va.
- **Todo liberado:** los 5 capítulos y todos los vehículos desde la primera partida.
- **Actividades en el mundo abierto** (`G.Actividades`):
  - marcas por celdas de 1,2 km con datos reales: 🏁 avenidas, 🚵 lomas, 📦 lugares, 🛹 plazas, 🛴 ciclorrutas, 🚲 EnCicla y 🚇 estaciones;
  - se ven en la calle, el minimapa y el mapa;
  - ▶ Jugar arranca el mismo modo ahí.
- **🛹 Zona de trucos y parkour:** saltos, giros en el aire con el joystick, caer derecho y combos ×5. **🛴 Run** también en el menú 🎮.
- **Cámaras:**
  - por contexto: Arcade solo en carretera y carreras, Vuelo solo volando; primera persona y dron en el selector;
  - la cenital de verdad (79° y 66°) se aleja con la velocidad, como GTA 2;
  - en las vistas de volante, el joystick de lado avanza.
- **Hallazgos de Gemini en las zonas de Claude:** resueltos (metro, cenital, volante, cámaras, Run, puente del raster).
- **Coordinación:** `coord/buzon/2026-11-22-claude-4.7-en-curso.md` y `20261122-1500-claude-4.7-respuesta.md`. Unida la entrega de Codex (`c3fc286`).
- **Pruebas:** 146 Node y `pruebas/modos.mjs` (cinco modos, ⏫, mapa y vuelta al carro).


- **El autor:** «el joystick está bien, pero el problema es el arranque: si se suelta el joystick se deja de acelerar; coloca un botón que, presionado, siempre esté acelerando sin parar, y para detenerse simplemente se desactiva».
- **Motor:** `MC.Manejo.aplicar(…, { acelFijo })` (`js/37-manejo.js`): prendido, acelera a fondo y el joystick solo da la dirección (sin joystick sigue derecho y el imán de calle lo alinea); apagado, frena suave hasta parar (`frenoK` 0,55 en `js/32-fisica.js`), salvo que se toque el joystick. El 🛑 manda mientras se oprime (y con giro, derrapa). `ui.alternar` (`js/70-interfaz.js`): botón que se prende y se apaga, verde y brillante cuando está prendido.
- **Turno Cero:** ⏫ junto a 🛑 y ⚡ (tecla V), visible en carro, moto, bici y manejando el tren de 🎮 Modos; a pie se esconde y se apaga; un aviso la primera vez. En vertical la velocidad sube sobre la fila de botones; en horizontal la columna izquierda ya no invade la zona libre.
- **Pruebas:** §27 (sin joystick llega a 25 m/s derecho en 4 s; con el joystick a un 35 % gira sin soltar el acelerador; apagado para en 2,1 s) y `pruebas/modos.mjs` toca el botón de verdad en Turno Cero (114 km/h en 3,5 s y luego para).

## 21-nov-2026 · 4.6.0 · El manejo de EnCicla, el mapa de EnCicla, horizontal y un solo juego de prueba con todo
- **El autor:** «injugables: toscos como GTA IV; derrapa por nada, va lento, avanza lento, retoma lento; no hay horizontal; te basaste en El Metro: básate en EnCicla y arregla El Metro de paso; el mapa no deja elegir en la brújula y al abrirlo el juego deja de funcionar; el de EnCicla acerca, aleja y no se ralentiza». Luego: «la idea no era tener 4 juegos de prueba sino uno: entrega los cuatro en Turno Cero y rescata lo de EnCicla y El Metro».
- **Manejo (motor, `js/32-fisica.js`, `js/31-vehiculos.js`):** el modelo de `BicicletasUno/src/js/30-ride.js` para carros, motos, bicis y a pie: el vehículo gira hacia donde apunta el joystick con una velocidad de giro que baja con la velocidad, la velocidad persigue un objetivo (empuje × (0,3 + 0,7·cos Δ)) con aceleración y frenado firmes, las llantas agarran (derrape solo con freno de mano), asistencia de esquinas de EnCicla y reversa. Tabla `Vehiculos.ARCADE` por tipo. El modelo de llantas de Turno Cero (`ManejoCarro`) queda solo en «simulación».
- **Al ritmo del reloj:** la física da subpasos de 25 ms (antes, con dt topado en 50 ms, a pocos cuadros por segundo todo iba en cámara lenta); búsqueda, persecución, objetos y guardias a pie, igual. Prueba §26: 0→90 % en 2,7 s, radio de 4,8 m a 20 m/s sin derrapar, freno de mano que derrapa y se endereza en 0,1 s, y a 15 y a 60 cuadros por segundo el carro recorre lo mismo.
- **Cámara:** mira menos adelante (0,45·v, tope 1/6 de la vista) y sigue más rápido.
- **Mapa grande (`js/70-mapa.js`):** como el de EnCicla: una vista general del mundo armada de a poco (y en los ratos libres mientras se juega), el detalle con presupuesto por cuadro, el juego en pausa mientras está abierto, ✕ + − ◎ 🧭 (norte o rumbo arriba), tocar = destino (pegado al lugar o la estación más cercana), nombres que no se montan y la escala. Tocar el minimapa (que ahora marca la N) lo abre. Antes repintaba más de mil losas de Medellín en cada movimiento del dedo.
- **Horizontal:** portada de Turno Cero a dos columnas, HUD que no se monta (artefactos arriba al centro, subtítulos más abajo); el APK gira con el celular (antes, fijo en vertical); Run Scooter también.
- **Un solo juego de prueba:** `juegos/getaway/60-modos.js`, 🎮 Modos en Turno Cero (portada, botón y ⏸ Menú): 🏁 Carreras (circuito o sprint con 3 rivales, récords), 🚵 Extremo (bajada en bici de montaña, saltos y derrapes), 📦 Mandados (tres entregas con reloj y paquete que se daña), 🚲 EnCicla (rebalanceo de estaciones, racha por la ciclorruta, multa por semáforo en rojo) y 🚇 Metro, tranvía y Metroplús (manejas el tren por la línea real y paras en el andén), más 🧪 Laboratorio (estilo, hora, clima y cualquier vehículo). Sin policía mientras dura un modo. `juegos/carreras/` y `juegos/extremo/` se borraron (su código vive en Turno Cero); Mandados queda solo como banco interno de pruebas (público simulado y capturas), fuera de la portada y de las entregas.
- **El Metro (MetroZero):** la sesión de El Metro ya publicó en paralelo la 3.1.0 «Fluido» con el manejo de EnCicla (APK 29). Esta sesión también lo había hecho, pero lo retiró para no pisarlo: en MetroZero solo quedan el motor 4.6.0 en `motor-city/` y `docs/INFORME-MOTOR-CITY-4.6.md`. En EnCicla otra sesión prepara la 2.1.0 en su rama: tampoco se avanzó su `main`.
- **Pruebas:** 145 Node y 157 en navegador; `pruebas/modos.mjs` juega los cinco modos de punta a punta y abre el mapa (reemplaza a `pruebas/carreras.mjs`); los hermanos, en verde con el motor 4.6.0 copiado.
- **Falta:** probar la sensación con las manos en un celular (autor); el globo en la misma escena 3D (C‑M31) sigue pendiente.

## 21-nov-2026 · 4.5.0 · PVS, modelos y ciudad pulidos, manejo que no se traba, efectos, rostros, Hunter Assassin, y los juegos Motor City y Extremo
- **El autor:** retocar modelos 3D, 2D y pixel; el PVS; Guatapé en los juegos hermanos; topografías, relieve, casas y edificios; luego, «mejor un informe detallado a cada repositorio y que sigan con su motor del Valle, solo compárteles el motor»; y en el motor y el juego de prueba, todo lo que falta, sin cambiar el mapa. Después: manejo y controles («ahí yace toda la jugabilidad»), rostros detallados, árboles con lógica, vehículos que suben por algunas cosas, la forma cenital de *Hunter Assassin* y explosiones, choques, derrapes y cosas rotas.
- **PVS de Quake (C‑M37):** `herramientas/pvs.mjs` hornea, para cada celda de 160 m, qué celdas se ven (horizonte de Comanche desde ojos en la calle y sobre las vías, 4 núcleos); `js/45-pvs.js` y la vista 3D lo usan con la cámara a ras de calle. Recorta 26 % en Manhattan y 28 % en Guatapé, sin fugas grandes (`pruebas/pvs.mjs`). Medellín se midió (15 %) y no se mete al HTML.
- **Modelos y ciudad:** generador 0.3.1 (carros con capó, cabina y baúl, rines, faros y espejos; personas con cara, manos y peinado; AO horneada; malla indexada); techos a cuatro aguas; terrazas con aires y escalera; coronas y agujas; relieve cercano a 10 m. El mapa no se tocó.
- **Peso y sin conexión:** GLB comprimidos (2 MB → 0,4 MB); `sw.js` con prueba (`pruebas/sin-conexion.mjs`).
- **Manejo (`docs/INVESTIGACION-MANEJO.md`):** deslizar contra la pared, pérdida según el ángulo, desatascar, asistencia que evita estrellarse (se apaga), derrape con freno de mano, andén, ladrillo, arena, nieve y roca suelta; la moto por escalas. Lo mismo para el modelo de bicicleta de los carros de Turno Cero, que era el que frenaba en seco.
- **Efectos y rotos:** `js/88-efectos.js` y `js/32-rotos.js`.
- **Rostros:** `js/71-rostros.js`, retratos en los diálogos y subtítulos de Turno Cero; caras en los modelos 3D.
- **Árboles:** nada en canchas, piscinas ni en la mitad de las plazas duras.
- **Turno Cero:** linternas que se cortan en los muros y cámara cenital en el sigilo a pie (*Hunter Assassin*), el carro destrozado arde y estalla, HUD en rejilla de 8 px.
- **Juegos nuevos:** `juegos/carreras/` (Motor City · Carreras) y `juegos/extremo/` (Extremo), mundo abierto en Guatapé con banderas de carrera; `pruebas/carreras.mjs`.
- **Pruebas:** 144 Node, 156 navegador, PVS, sin conexión, carreras y la historia entera de Turno Cero (Final A en 162 s, 0 errores); todo en la integración continua.

## 21-nov-2026 · 4.4.0 · Claude asume lo que dejaron las otras IA
- **El autor:** «Y ya ni lo harán, resuelve tú lo que falta».
- **Unidas las últimas entregas:**
  - ChatGPT: C‑M34 raster espacial (sectores de suelo y nivel de 1 km comprimidos, bajo demanda y con LRU);
  - Antigravity:
    - pool circular sin basura en `MC.Vida`;
    - escalador EMA con histéresis y niebla acoplada en `ResDinamica` (*Shadow of the Colossus*).
- **Turno Cero:**
  - **🎬 Modo cine (C‑M40, *The Getaway*):**
    - sin flecha ni minimapa;
    - las direccionales del carro marcan la próxima esquina de la ruta (a menos de 90 m);
    - al llegar se encienden las estacionarias.
  - **A pie (C‑M32):**
    - 🧱 cubierta: quieta y pegada a un muro, los guardias ven a 0,45 de la distancia;
    - 💨 esquivar (botón o Q): 3 m en 0,4 s sin que te alcancen a golpear.
  - **🕹️ Retro 1993 (C‑M39):** el COLORMAP de Doom (`js/47-colormap.js`):
    - paleta propia de 256 colores;
    - tabla RGB15 de 32 768 entradas;
    - 32 niveles de luz por distancia y por la noche;
    - unos 1,3 ms por cuadro.
- **EnCicla:** los 5 arreglos que describió Codex, con su regresión (ver su bitácora).
- **Run Scooter:**
  - 🛣️ «Run por la carretera de la nada» (C‑R40): costa, desierto, nevado y bosque de lagos, con arena, hielo y troncos;
  - el regalo diario se entrega solo, sin ventana;
  - el motor lo reimporta (`herramientas/importar-run.mjs`; las 12 adaptaciones aplican).
- **Probado:**
  - Node: 142, con el COLORMAP en § 23;
  - el contenido;
  - C‑M34;
  - Chromium;
  - EnCicla en verde;
  - El Metro: 100 partidas;
  - Run Scooter: 100 partidas.
- **Pendiente** (`CONTEXTO-RELEVO.md` § 5):
  - el PVS calculado por adelantado;
  - Guatapé en El Metro y EnCicla;
  - las crónicas de El Metro;
  - el globo en la misma escena;
  - el celular real.

## 21-nov-2026 · 4.3.0 · La auditoría móvil de Antigravity, arreglada; mundo abierto primero en los tres juegos
- **Unidas:**
  - **la auditoría de Antigravity:** `reportes/2026-11-21-gemini-clasicos-4.1.md` (G‑H25, G‑H26 y G‑H28, con 18 capturas) y el catálogo G‑H27 (`reportes/2026-11-21-gemini-tecnicas-clasicas-extra.md`);
  - **la caché del planeta de ChatGPT:**
    - cada ciudad se carga una sola vez aunque la pidan varias veces;
    - LRU con presupuesto;
    - la ciudad donde uno juega queda protegida;
    - pruebas `planeta-cache-cm34.mjs` y `planeta-cache-browser.mjs`.
- **Arreglos de la auditoría:**
  - **🏁 Arcade:**
    - en la ciudad, debajo del horizonte ya no queda el cuadro anterior (ni el «carro fantasma»);
    - sin costuras entre segmentos;
    - el haz de los faros de noche ya no quema el horizonte.
  - **Correr a pie en el celular:** ⚡ a pie ahora es correr (`js/33-controles.js`). Antes, con el dedo, Mara no pasaba de 1,53 m/s; ahora llega a 4,25 m/s.
  - **Sigilo:**
    - «agachada» solo cuando va casi quieta;
    - correr hace ruido también en pasto o en el andén;
    - los faros cuentan solo de noche y no atraviesan muros (`MC.DDA.bloqueado`);
    - la gema cambia de color (azul apagado → ámbar → amarillo) y la primera vez explica qué es.
  - **Menú ⏸:** ya no se corta arriba a 412 × 860 (lo empujaba un estilo en línea). Ahora queda centrado y se desplaza.
  - **⛰️ Vuelo:**
    - se reusan los búferes de la ventana anterior (sin 2,8 MB nuevos en cada cambio);
    - de noche, el carro lleva halo y los stops encendidos.
- **Mundo abierto primero en los tres juegos** (regla del autor, medida por Antigravity):
  - **El Metro:** ▶ Jugar entra directo a Ciudad Libre, y «Todos los modos» queda debajo. Sus íconos ya no dan 404.
  - **EnCicla:** ▶ Jugar entra directo al modo libre. «🏆 Oficios y modos» lleva al escalafón; la bienvenida y el personaje son opcionales.
  - **Turno Cero:** ya cumplía.
- **Probado:**
  - Node: 141;
  - el contenido de Turno Cero;
  - la caché del planeta en Node y en Chromium;
  - la batería de Chromium;
  - El Metro: 100 partidas, 0 errores;
  - EnCicla: en verde;
  - capturas a `412 × 860`.

## 21-nov-2026 · 4.2.0 · Las entregas de las otras IA unidas, recorte por región, la historia se encuentra en el mundo abierto
- **Unidas:**
  - **ChatGPT/Codex** (`ia/chatgpt/4-0-2-gemini-auditoria`, 13 commits):
    - el arte de Gemini en la portada (WebP adentro del HTML);
    - 6 GLB con UV y PBR;
    - una sola ciudad en memoria al viajar;
    - el globo en celular vertical;
    - piezas y humo también en 2D y en Raster.
  - **C‑M34** (`ia/chatgpt/cm34-cache-20261120`, 26 commits): Turno Cero carga los MC4 **por capas comprimidas bajo demanda**, con caché LRU de sectores de Manhattan. Pruebas en Node y en Chromium.
  - **Antigravity** (`ia/antigravity/motorcity-4.0`):
    - las técnicas clásicas probadas sobre datos MC4 reales: `experimentos/tecnicas-clasicas/`, con laboratorio interactivo y 6/6 pruebas;
    - `docs/MOTORES-CLASICOS-INGENIERIA.md` (RenderWare, *Driver*, Silent Hill, *Shadow of the Colossus*, Unreal…);
    - la verificación visual 4.0.3.
  - **Las paradas de carretera:** 56 (28 de Gemini y 28 de ChatGPT), con `id`, `nombre_es`, `nombre_en` y `rutas`. El generador las usa tal cual.
- **Motor:**
  - **recorte por región en el 3D (`js/45-gl.js`):**
    - lo que está más allá del muro de niebla no se dibuja (Silent Hill);
    - en las cámaras de manejo, lo que queda detrás de la cámara tampoco;
    - en tercera persona se dibujan **17–18 de 58 regiones**; las cámaras aéreas no se recortan.
  - **IA:**
    - los carros de la IA atropellan lo menor del andén (poste, banca, paradero, caneca, hidrante) en lugar de trancarse; árboles y rocas sí los paran;
    - cruzan las casillas de borde (ladrillo, o edificio sin edificio real encima).

    Esa era la causa de la prueba que a veces fallaba: el rival de la carrera chocaba con un ladrillo del borde. Ahora avanza 55–87 m en 6 s.
  - **⛰️ Vuelo sin pausa:** la primera ventana también se arma por franjas, con un aviso de carga. El peor cuadro baja de unos 300 ms a 24 ms.
- **Turno Cero:**
  - **la historia se encuentra en el mundo abierto** (`56-abierto.js`):
    - un 📖 en la calle y en el minimapa donde empieza el próximo capítulo, o donde quedó la historia;
    - al pasar cerca **solo avisa**; se juega si uno toca 📖 Historia;
    - si el capítulo es en otra ciudad, lo dice al entrar;
  - **la carrera callejera:**
    - la meta queda hacia adelante;
    - el rival sale en el carril de al lado, sin encimarse;
    - si todavía no tiene ruta, va derecho a la meta.
  - el HUD dice «🌎 Mundo abierto».
- **Probado:**
  - Node: 141;
  - el contenido de Turno Cero;
  - C‑M34 en Node y en Chromium;
  - la técnica clásica de Antigravity (6/6);
  - la batería de Chromium completa;
  - capturas a `412 × 860`.

## 21-nov-2026 · 4.1.0 · Motores clásicos: lo que hicieron Comanche, OutRun, Thief, Wolfenstein y Elite, rehecho para Motor City
- **El pedido del autor:**
  - investigar motores viejos que hoy son livianos pero potentes;
  - ver cómo los usaron los mejores juegos;
  - traer sus partes al motor.
- **Regla:** sala limpia. Se toman las ideas publicadas y se escribe el código desde cero. No se copia código GPL, ni de licencias propias, ni filtrado. Licencias y fuentes en `docs/INVESTIGACION-MOTORES-CLASICOS.md`.
- **`js/47-clasicos.js`:**
  - **🏁 Arcade (`MC.Arcade`):** la carretera pseudo-3D de Pole Position y OutRun, sobre la vía real:
    - proyección por segmentos con recorte en el plano cercano;
    - franjas fijas al mundo y lomas del relieve;
    - montañas en paralaje con el rumbo;
    - pinos, palmas y cactus según el bioma; postes; letreros de veredas;
    - edificios del mapa como cajas; carros y patrullas con sirena;
    - faros de noche;
    - en celular vertical, la cámara se ajusta para no abrir demasiado el campo.
  - **⛰️ Vuelo (`MC.VoxelSpace`):** el Voxel Space de Comanche:
    - mapa de alturas y de color desde el MC4, con los edificios encima y la luz horneada;
    - columnas con y-buffer de adelante hacia atrás;
    - la ventana nueva se arma por franjas, para no trabar el juego.
  - **`MC.Sigilo` (Thief):**
    - la gema de luz: sol, sombra de los edificios hacia el sol, postes de noche y faros;
    - el ruido que rodea los edificios (Dijkstra en una rejilla de 4 m).
  - **`MC.DDA` (Wolfenstein 3D):** las casillas exactas de un rayo.
  - **`MC.Semilla` (Elite):** nombres de veredas siempre iguales desde tres números de 16 bits.
- **Turno Cero: mundo abierto desde el principio.** Pedido del autor: «quiero mundo abierto desde el principio; el tutorial o el contexto de la historia es opcional».
  - En la portada, el primer botón es ▶ **Jugar · mundo abierto**: Medellín (la ciudad más liviana en memoria) o donde quedaste, sin tarjetas ni diálogos. En la VM tarda 1,7 s.
  - La historia es opcional: 📖 en la portada, el botón 📖 Historia en el juego, ⏸ Menú y la tecla H (seguir, empezar o repetir un capítulo).
  - La casilla «Entrar directo» salta la portada la próxima vez, solo si ya se aceptó el 18+. Con `?portada` vuelve.
  - El HUD dice «🌎 Mundo abierto».
- **Turno Cero (`juegos/getaway/55-clasicos.js`):**
  - en las misiones de sigilo hay una gema ◆ que brilla según la luz; en lo oscuro, los guardias ven a un tercio de la distancia;
  - correr a pie o el motor cerca hace que un guardia vaya a mirar («👂 Un guardia oyó tus pasos»);
  - en 🎥 Cámara están las cámaras 🏁 Arcade y ⛰️ Vuelo.
- **Probado:**
  - § 22 de `pruebas/prueba.mjs`:
    - el DDA visita las casillas `0,0 1,0 2,0 3,0`;
    - Elite da los mismos 64 nombres, 64 distintos;
    - la luz vale 0,96 a mediodía y 0,24 a medianoche bajo un poste;
    - un guardia ve a 9,7 m en lo oscuro y a 24 m a pleno sol;
    - el ruido rodea un edificio: 55 m de camino contra 34 m en línea recta;
    - el camino arcade queda 100 % en la calle;
    - el voxel pone edificios de hasta 56 m;
  - el banco ahora tiene 11 vistas;
  - capturas en Chromium `412 × 860` de Medellín y de la Autopista del Embalse, de día y de noche.

## 21-nov-2026 · 4.0.3 · Terminar las tareas de las otras IA antes de que se queden sin uso
- **El pedido del autor:** «ayúdalos a completar las tareas, están por quedar sin uso». Claude unió y terminó lo que dejaron a medias.
- **ChatGPT / Codex** (`ia/chatgpt/4-0-2-gemini-auditoria`):
  - se unieron sus 6 arreglos nuevos:
    - ocho lugares corregidos;
    - diálogos que se cancelan al pasar a Calle libre;
    - portada compacta y menú con fondo;
    - guardias que solo persiguen si ven;
    - lenguaje suave en singular y plural;
  - su prueba de la persecución a pie estaba en rojo en su propia rama: `AccionPie.ocluido` miraba cada 3 m y se saltaba muros de 2 m. Ahora mira cada metro y la prueba pasa.
- **Gemini / Antigravity:**
  - las 56 paradas (28 suyas y 28 de ChatGPT) quedan en `PARADAS_RUTA`, con la prueba ajustada a 8 por bioma;
  - del informe G-H21/G-H23 se suman, sobre lo de ChatGPT:
    - el contrato «El sapo» pasa a llamarse «El testigo incómodo»;
    - el lenguaje suave cubre los finales y concuerda en género y número (`jodida` → `complicada`, `cabrones` → `canallas`);
    - el botón `G SEÑUELO` de la escena 3D se acorta a `G CEBO`;
    - la ruta de `arte3d/pruebas-modelos.py` apunta a `arte/modelos/turno-cero/` (42/42).
- **El Metro, zonas Z1 y Z2 de Antigravity:** sus 6 errores de `412 × 860` quedan arreglados en `MetroZero/src/js/98-relevo-z1.js`. Detalle en la bitácora de El Metro.
- **EnCicla, lo de Codex:** sus arreglos de código no llegaron a GitHub; solo su ficha. Quedan anotados en `CONTEXTO-RELEVO.md` § 5 para que los suba.

## 21-nov-2026 · 4.0.2 · La IA que maneja de verdad, Run en Turno Cero, carreras y guardias a pie
- **Pedido:** «Continúa mejorando».
- **Hallazgos al probar una carrera:**
  - **los carros no tenían reversa:** frenar con el carro quieto lo dejaba en cero, y si el destino quedaba atrás, el modelo frenaba para siempre;
  - **`MC.Manejo.rutaA` unía el punto de salida y el de llegada con el primer y el último nodo en línea recta**, por encima de casas y laderas.
  - Las dos cosas afectaban a toda la IA (patrullas, banda y El Contador), al «tocar para ir» y al jugador (el joystick hacia atrás no daba la vuelta).
- **Motor:**
  - **reversa** en `ManejoCarro`: quieto, frenar es reversa hasta 8 m/s;
  - **vuelta en tres puntos** cuando el destino queda atrás;
  - **`rutaA` sigue la forma de la calle** al salir y al llegar, y cuesta por distancia sobre la vía (prueba: 0 tramos sobre casas);
  - **`MC.Manejo.pilotar`**, el piloto de la IA:
    - mira adelante en la ruta y frena según la curva que viene;
    - retoma la ruta nueva por delante (no vuelve al nodo de atrás);
    - con el destino atrás, gira en su sitio (arcade, solo la IA);
    - si se atasca, retrocede, y si se traba dos veces se reacomoda hacia la calle, sin cruzar casas;
  - los carros de la IA, sobre la calle, no chocan con árboles, postes ni bancas (`C.ia`).
  - **Medido:** en Medellín una patrulla recorre 1,7 km de ruta en unos 60 s, a unos 32 m/s; en Guatapé llega en 3 de 4 casos (el que falla arranca sobre una calle que los datos marcan como edificio).
- **Turno Cero:**
  - **Run en la ciclovía**, el modo de Medellín: 🛴 sobre una ciclorruta, a pie, en EnCicla, patinete, skate o patines; si sales con más de 300 m, la policía te pierde, y los puntos dan plata;
  - **carreras callejeras** contra un coupé dorado por la red vial real, con apuestas;
  - **guardias que persiguen a pie** con la alarma, golpean de cerca y se reducen con ✊;
  - **accesibilidad**: menos destellos, sin sacudidas de cámara y subtítulos grandes (con el lenguaje suave, en ♿ del menú);
  - las metas de los contratos solo caen en calles para carro.
- **Pruebas:**
  - 152 de 152 en verde, con la sección 21 (reversa y piloto) y la prueba de rutas que siguen la calle;
  - en Chromium, Run y la carrera;
  - el bot de la historia completa sin errores.


## 20-nov-2026 · 4.0.1 · Relevo entre IAs y mejoras de los pedidos 4.0
- **Pedido del autor:** «Retoma, continúa y termina: el HTML, el link, todo actualizado y siempre un documento de contexto con todo el plan, lo hecho y lo que falta (y que la otra IA haga el suyo). Retoma las nuevas peticiones y mejora el motor, el juego de prueba, el arte y la tecnología».
- **Relevo:**
  - `CONTEXTO-RELEVO.md` contiene el plan, el estado, lo hecho, lo que falta (con dueño), las reglas y la entrada de cada IA;
  - es obligatorio que cada IA deje la suya y le pida lo mismo a la siguiente;
  - se adoptó en el motor el protocolo `coord/` de Antigravity y Codex (ficha por agente y buzón donde solo se suma);
  - el documento único empieza por el relevo.
- **Motor:**
  - **luces de los GLB:** los faros y las luces traseras se encienden de noche, y cada modelo tiene un mínimo de luz propia (`Modelos.brillo`);
  - **abolladuras por zona** en los carros 3D (`op.dano` = frente, atrás, izquierda, derecha), con faro roto, a partir de los golpes;
  - `MC.Busqueda` guarda dónde se abolló cada rival y avisa al jugador (`abolladura`);
  - la sirena se apaga en el rival aturdido.
  - Esto avanza C‑M35.
- **Turno Cero:**
  - sonido de motor por capas de rpm y sirena con efecto Doppler (C‑M36);
  - dron policial en 3D con el modelo de Codex;
  - **reducción no letal a pie** de los guardias (✊), con la animación de golpe de Codex;
  - al alejar la cámara más allá del tope se pasa al planeta con animación (C‑M31, primera parte);
  - eventos de carretera al azar en Calle libre (banda, retén, emboscada, un camionero que paga);
  - tres contratos nuevos, uno de ellos contrarreloj;
  - arte de portada: ilustración SVG procedural con Manhattan, el Metrocable, la Piedra del Peñol y la carretera.
- **Pruebas:** en Node, faros y abolladuras; el bot de la historia completa sin errores; las capturas.


## 20-nov-2026 · 4.0.0 · El planeta y *Turno Cero*
- **Pedido del autor:**
  - «empieza con la creación del monstruo; nada de *family friendly*»;
  - «combina ese mundo con Guatapé y la mejor versión de Medellín y el valle, todo en un mismo planeta, con caminos largos en medio de la nada»;
  - y luego: «adapta todo lo nuevo que se agregó».
- **Lo nuevo de Codex, unido a la rama:**
  - *Turno Cero: Manhattan*, en `docs/GETAWAY-MANHATTAN-BIBLIA.md` y `docs/GETAWAY-ESPIONAJE-3D.md`;
  - las 13 referencias;
  - el prototipo 2D;
  - el generador de 42 GLB, con su CI.
- **`MC.Planeta`** (`js/13-planeta.js`):
  - un anillo con Nueva York, la Ruta del Atlántico (16 km), Medellín y el Valle, la Autopista del Embalse (12 km), Guatapé y la Carretera del Norte (15 km);
  - las carreteras se generan con `Generador.carretera` y tienen sus biomas;
  - las puertas son reales (los puentes George Washington y de Brooklyn, las autopistas Norte y Medellín–Bogotá, la vía a El Peñol);
  - vista de globo y horizonte curvo (`uCurv` en el sombreador).
- **`MC.Busqueda`** (`js/28-busqueda.js`):
  - búsqueda de 0 a 5 con los umbrales de Codex (15/35/55/70/85) y un tope de 4;
  - los rivales nacen fuera de la vista y van a la última posición vista;
  - tácticas seguir, cerrar y embestir, con empuje por masa;
  - disparos, púas, retenes y helicóptero con reflector;
  - cebo, pulso y disparos del jugador, y captura.
- **`MC.Modelos`** (`js/45-glb.js`):
  - lector GLB sin librerías;
  - los 42 modelos de Codex, guardados en `arte/modelos/turno-cero/` (CC0);
  - la cámara 3D los usa en carros, patrullas (con barra de luces), camionetas, guardias, retenes y contenedores.
- **Construcción:**
  - juegos con varios mundos (`"mundos"`; cada MC4 va en un `<script type="text/plain">`);
  - GLB dentro del HTML (`"modelos"`).
  - Además: `Vistas.liberar()` y el tema de interfaz «noche».
- **Turno Cero** (`juegos/getaway/`, 25 MB, 18+):
  - cinco actos y siete misiones por las tres ciudades;
  - artefactos T01, T02, T03, T05, T06, T08, T09, T11 y T04;
  - sigilo con conos de visión;
  - el metro, los cables, el tranvía y el Metroplús de Medellín para perder a la policía;
  - EnCicla, lancha en el embalse, robo de carros, talleres que reparan y repintan, y escondites;
  - Calle libre con contratos;
  - finales A, B y C según las pruebas y las decisiones;
  - lenguaje fuerte, con opción de suavizarlo.
  - El diseño está en `docs/TURNO-CERO.md`.
- **Pruebas:**
  - en Node, las secciones 19 (planeta) y 20 (búsqueda y GLB);
  - en Chromium, Turno Cero de Manhattan a Medellín por la Ruta del Atlántico;
  - un bot recorrió la historia completa hasta el final A en 161 s, sin errores.
- **Corregido en el camino:**
  - al cerrar un capítulo se saltaban capítulos (el último paso se completaba varias veces);
  - el Muelle 4 caía sobre el agua;
  - los subtítulos y el letrero de la carretera tapaban el joystick y las barras.
- **Lo último de Codex** (`b2fd2e4`: la escena 3D de acción y los actores con esqueleto) quedó unido e integrado:
  - **piel y animación glTF** en `MC.Modelos.posar`: huesos, matrices de enlace y clips con interpolación, en caché por cuadro;
  - Mara a pie y los guardias se animan en la cámara 3D, y Rook, Nadia, Noah y los intermediarios esperan en sus escenas;
  - su misión 3D autónoma se copia a `dist/juegos/` (`"extras"` en `juego.json`) y se abre desde la portada.
- **Pendiente:** medir en un celular real con GPU. Los nuevos pedidos para Gemini, Codex y ChatGPT están en `TAREAS-IA.md` § 4.0.


## 20-nov-2026 · C-M27 (parcial), dirección visual y catalogación
- Sombras solares proyectadas sobre el suelo en WebGL1 (sin texturas de profundidad), mezcladas antes que los volúmenes, con cache por celda de cámara y posición solar; prueba sintética en `pruebas/prueba.mjs`.
- G-H1: 14 capturas reales auditadas, avisos duplicados corregidos, HUD atenuado más legible, nombres protegidos frente a los botones y cierre real de diálogos por el capturador.
- G-H18: `contenido/nueva-york-lugares.json` generado desde NYC CommonPlace con 50 lugares, coordenadas e IDs; excluye instalaciones municipales internas y marca accesibilidad pendiente de comprobar.
- La tabla de estado vigente, con límites y prioridades, está en `docs/ESTADO-3.1.0.md`.
- **C-M27 requiere CI del nuevo commit y prueba en GPU física**; no se afirma rendimiento móvil ni tilt-shift terminado.


## 20-nov-2026 · 3.1.0 · Persecución optativa en Mandados
- C-M26: clase pública `MC.Persecucion` con patrullas y pilotos que recomputan rutas A* por calles, un seguidor y otro que busca cortar el paso. Motor físico de `MC.Cuerpo`, sin atravesar edificios por «IA» de línea recta.
- Reto voluntario de 90 segundos con botón para iniciar/salir; disponible en moto o carro, con huellas de vehículo en el mismo mundo 3D/2D, cámara de seguimiento sin saltos y captura si el jugador se detiene.
- Los casi choques con tráfico no dan puntos en contacto ni a baja velocidad; bonus de turbo de duración corta y máximo una recompensa por ID de vehículo.
- Comprobaciones deterministas de aparición fuera del jugador, física, bonos y cierre en `pruebas/prueba.mjs`. **Validado** en el commit `ff5977ec4`: CI [#44758766581](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44758766581), con 131 tests Node y 141 en Chromium, incluido E2E de persecución. La evaluación en celular real sigue pendiente.


## 20-nov-2026 · 3.0.1 · Objetos de barrio y persistencia (ChatGPT)
- C-M29 / G-H17 (entrega parcial): 30 tipos de mobiliario urbano en `js/32-objetos.js` y tamaños **aproximados para diseño** en `contenido/objetos-gemini.json`.
- IDs estables por origen de los objetos: restauración de desplazamientos, velocidad, orientación y daño con `MC.GuardadoSectores`.
- Mandados guarda cambios de Guatapé periódicamente y al ocultar/cerrar la pestaña; los mundos aleatorios no heredan esos datos.
- Regresiones agregadas a `pruebas/prueba.mjs`. Comprobación aislada del código realizada; **batería Node/Chromium pendiente** en clon completo.
- Falta arte individualizado de cada objeto y medición con hardware móvil.


## 20‑nov‑2026 · 3.0.0 · Los tres juegos actualizados y Nueva York preparado (Claude Code)
- **EnCicla** (`src/js/97-motor30.js`):
  - la calidad automática del 3.0;
  - artilugios físicos a escala de sprite: conos de obra en las ciclorrutas y balones en las plazas, con su prueba.
- **El Metro** (`src/js/69-tutorial.js`): tutorial opcional «❓ Cómo se juega», que nunca sale solo y se puede saltar o apagar.
- **Run Scooter:** el tutorial ya no se impone en la primera partida; se pide en Ajustes.
- **Lo que sigue:** `docs/PROXIMO-NUEVA-YORK.md`, con «Getaway Nueva York» (Manhattan, el mundo de alrededor, el planeta redondo y la persecución) y las 10 reglas del feedback para todas las IA. Pedidos G‑H18, G‑H19, C‑A15, C‑M30 y C‑M31.

## 20‑nov‑2026 · 3.0.0 · Un solo mundo 3D y varias cámaras (Claude Code)
**Pedido:** el autor probó y lo sintió básico:
- las dimensiones mal ideadas;
- cosas en 2D que debían ser 3D;
- vistas como menús separados;
- casas sin fachada;
- cámara muy aérea y sin tope;
- todo el mundo cargado a la vez.

Pidió investigar #DRIVE, Pako Forever, Getaway, Reckless Getaway 2 y la distancia de GTA San Andreas. La investigación está en `docs/INVESTIGACION-CAMARA.md`.

**Lo que se hizo:**
1. **Mundo único 3D** (`js/45-gl3d.js`):
   - edificios con fachada: zócalo, ventanas con marco y vidrio encendidas de noche, puerta, balcones, cornisa, alero, pretil y tanque;
   - árboles low-poly que son los MISMOS de las vistas 2D (`MC.Arboleda`);
   - carros, busetas, motos y personas con detalle;
   - el suelo en 3D ya no trae árboles ni techos pintados.
2. **Cámaras aéreas sobre ese mundo** (`MC.Camara` perfiles `cenital`, `oblicua` y `maqueta`):
   - el mismo encuadre que la 2D;
   - más oblicua de cerca;
   - mirada adelante;
   - `persecucion` (se aleja, se inclina y se mece) y trauma.
   Sin GPU caen a su respaldo 2D.
3. **Periferia definida:** radio de carga y niebla según la cámara. Lo que se carga no se ve llegar.
4. **Topes de zoom, cámara continua y mapa grande:**
   - el zoom va de 2,6 a 22 px por metro;
   - al tope de cerca pasa a la vista detrás del jugador;
   - para ver todo, el mapa al tocar el minimapa.
5. **Rayos X del jugador** en las cámaras aéreas.
6. **Artilugios físicos** (`js/32-objetos.js`, `MC.Objetos`): conos, balones, canecas, cajas y vallas, con su prueba.
7. **Jerarquía:** una cámara de juego y la de detrás del jugador. Lo demás va en «Más vistas y filtros».

**Fluidez** (2.11, incluida aquí):
- `MC.DensidadLienzo`;
- la capa de suelo de la 2D;
- `Estilo.imprimir` medido en cada aparato.

Las vistas quedan entre 16,6 y 18 ms de mediana en un celular simulado sin GPU.

**Pruebas:** 137 en verde. Hay pruebas nuevas de la densidad dinámica y de los objetos físicos.

## 20‑nov‑2026 · 2.10.0 · Todo unido, más liviano y con las skills de los videos (Claude Code)
**Pedido:** «retoma y continúa, revisa los repositorios ya actualizados, une todo, mejora todo y optimiza todo, y añade nuevas peticiones para Gemini y ChatGPT». Llegaron 11 enlaces, y después «añade las skills y plugins de los videos y sigue desarrollando».

**Unir:**
- El Metro recibió el Motor del Valle 1.2.0 desde EnCicla. Su rama `plan-unico-el-metro` ya estaba dentro de la v2.0.0, así que no se fusionó.
- EnCicla recibió de `revolucion-v2` el alto contraste y el metro sin casas debajo (`src/js/96-accesible.js`).

**Optimizar:**
- `Estilo.imprimir` ya no lee la pantalla: usa `grayscale`, un patrón de umbrales al 50 % y `contrast(1000)`, con el respaldo por píxel a media resolución.
- Los atlas sin pérdida pasaron a WebP con calidad 88 y alfa sin pérdida. Mandados bajó de 8,2 a 5,1 MB.

**Mejorar:**
- El tramado del 1 bit y del cómic se ancla al desplazamiento del mundo con celdas de 1 px. Así se acaba el muaré de la maqueta.
- `Red.caminoEntre` (A* con varias salidas y metas) y `rutaA` corregido.
- `legacy-scan` de Modern Web Guidance: `toSorted`, `toReversed`, `replaceChildren` y `Promise.withResolvers`, con respaldo en `00-nucleo.js`.

**Skills:**
- `skills-externas.json` (Hallmark, Modern Web Guidance, find-skills y HyperFrames), con el commit revisado y la licencia de cada una.
- `node motor.mjs skills [--instalar --agente …]` y `.claude/settings.json` con los plugins.
- La skill `motor-city-skills-externas` y la política de navegadores.

**Desarrollar:** `MC.Publico` (`js/92-publico.js`) y `node motor.mjs publico`. Hay 4 perfiles con puntería, reacción, fuerza y paciencia propias, que siguen las calles con `rutaA`; el informe sale en `dist/publico.md`. Primer resultado:
- el abuelo, la gamer y el turista: «bien»;
- la niña: «revisar», atascada el 43 %. De ahí sale el encargo C‑M24.

**Lo que sigue:** G‑H10 a G‑H13, C‑M23 a C‑M25 y C‑A12 (`TAREAS-IA.md`).

## 20 de noviembre de 2026 · 2.9.1 · Persistencia por sectores

Se añadió `MC.GuardadoSectores`, con claves estables, cambios JSON por sector, transición entre sectores activos y dormidos, guardado atómico y migradores versionados. Las pruebas verifican retorno, migración y fallo de almacenamiento. La integración de esos cambios con los objetos y huellas de Mandados sigue pendiente.

La auditoría de los enlaces nuevos y las tareas abiertas está en `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`.


## 20‑nov‑2026 · 2.9.0 · Unión de la 2.8 (Claude) con la 2.7.1 (ChatGPT/Codex) (Claude Code)
Codex entregó la 2.7.1 en paralelo con la 2.8:
- 6 atlas de ChatGPT, con 676 cuadros;
- el agua precalculada en los MC4;
- el gancho `textura` y los charcos;
- el estilo de 1 bit con ruido azul;
- la caché de fachadas en la maqueta;
- los adaptadores de Godot y three.js probados;
- la auditoría C‑M1, con sus arreglos.

Se unió todo en la rama sin perder nada:
- las huellas y las palomas de la 2.8 conviven con los charcos de Codex;
- los faros y las luces de freno funcionan también con el vehículo de la piel de ChatGPT (`vehiculoArriba`);
- la cubierta sobre columnas y las ventanas de las casas de un piso pasan por la caché de fachadas;
- el hitstop se combina con la lluvia en el bucle de Mandados.

Son 12 estilos. Versión 2.9.0.

## 20‑nov‑2026 · 2.8.0 · La entrega maestra de referencias, al motor (Claude Code)
**Pedido:** el autor trajo `MOTOR-CITY-ENTREGA-MAESTRA.md` («prepara todo»). Reúne los 14 reels, los videos y el análisis de ChatGPT y de Gemini:
- 25 fichas;
- el peso y la vida;
- la arquitectura portable;
- el rendimiento en móvil y las fases.

**Lo que se hizo:**
1. La entrega quedó en `docs/referencias/` y como anexo del documento único. Su resumen, ficha por ficha y con lo que ya está en el motor, está en `docs/INSPIRACION-VISUAL.md` §1.
2. **Vida (R12, R19):**
   - palomas que comen en plazas, andenes y parques, y alzan vuelo cuando el jugador se acerca rápido (evento `fauna`);
   - huellas de llantas y pisadas en arena, tierra, nieve y barro (con lluvia, también en el pasto), que duran 4 minutos.
3. **Peso y luz (R13, R19):** faros de noche y luces de freno del jugador. El hitstop también corre en el bucle de Mandados.
4. **Filtros (R17, R22):** los estilos vintage, CRT y visión térmica, para 11 en total.
5. **Accesibilidad (§10.3, §13):** `MC.opciones.sacudida` y `particulas`, en Ajustes.
6. **Medir (§13, §14, R20):** `MC.Telemetria` con fps y tiempos de cuadro en p50, p95 y p99; en Ajustes → Telemetría, con la física del jugador. También calidad automática, baja, media o alta.
7. **Contratos (§12.3, §16):** `schemas/` (escena, puente y entidad, `schema_version: 1`) y `MC.Contratos.validar`. La tabla de los contratos mínimos de la entrega y dónde están en Motor City está en `docs/MOTORES-POTENTES.md`.
8. **Repartido en `TAREAS-IA.md`:**
   - Codex: C‑M20 (API de construcción por código y pincel de mundo), C‑M21 (suspensión, balanceo, cosas que se rompen, IK, tablero y taller con rayos X) y C‑M22 (guardado versionado y sectores);
   - ChatGPT: C‑A10 (tipografía propia) y C‑A11 (interfaz de libreta);
   - Gemini: G‑H7 (verificar las 13 URL y las 7 fichas que solo describe su informe) y G‑H9 (medición en un celular real con la telemetría).

9. **Llegó la entrega de Gemini (G‑H1…G‑H8)** y se unió a la rama. De sus capturas se corrigió:
   - la zona libre deja margen para la columna de botones (80 %): en su máquina, la prueba fallaba por 4 px;
   - `ui.aviso(texto, ms, clave)`: el aviso de la vista reemplaza al anterior y nunca queda desfasado;
   - ventanas encendidas en las casas de un piso;
   - las cubiertas sin muros se dibujan sobre columnas;
   - cebras sin cruzarse en «#»;
   - en Mi casa, el botón «Comprar» completo, la burbuja dentro de la casa y el rótulo de los cuartos pequeños;
   - la sombra horneada de las copas, más pequeña.

   También se sacaron las paletas de las obras colombianas de su lista. Wikimedia limita las descargas, así que algunas quedaron para después.
10. **Rendimiento:** las huellas se dibujan en lote (16 trazos en vez de cientos). En esta máquina nueva, la cenital de Medellín mide 14–16 ms tanto en la 2.7 como en la 2.8: no es una regresión, es el contenedor.

**Probado:** 125 pruebas:
- huellas y palomas;
- partículas apagadas por accesibilidad;
- telemetría en percentiles;
- la escena, el puente y la entidad pasan su esquema y uno roto no;
- los 11 estilos en Mandados.

Además se hizo una revisión visual de noche (faros), de las palomas y de los filtros nuevos.

## 20 de noviembre de 2026 · 2.7.1 · Arte a escala y adaptadores

Mandados incorpora seis atlas de ChatGPT con 676 cuadros. Los 997 cuadros del paquete de Gemini pasan el revisor tras reparar los recortes y márgenes. Guatapé y Medellín cargan su hidrografía desde MC4. Godot 4 y three.js abrieron escenas del motor.

El banco integrado pasó 130 pruebas. La maqueta midió 34,9 ms con CPU 4×, por encima de la meta de 20 ms. El informe enlaza las pruebas de los tres juegos, las capturas y los pendientes. [Entrega del motor compartido](ENTREGA-CHATGPT-MOTOR-CITY-2.6.md)


## 20‑nov‑2026 · 2.7.0 · Estilos gráficos, peso y vida, y motores potentes (Claude Code)
**Pedido:**
- 14 reels de referencia;
- «Necesito peso y vida en el motor, y que se pueda adaptar a motores más potentes.»
- «Estéticas de cómic, manga, anime y novelas gráficas.»
- «Investiga y aprende de las mejores obras visuales e inspírate en ellas. Recopila y adapta arte de verdad.»

**Lo que se hizo:**
1. **Reels:** se leyeron 4 de 14 sin iniciar sesión:
   - un RPG inspirado en Dragon Ball;
   - *Cairn*;
   - un *rover* en la web;
   - carreras cinematográficas tipo Dakar.

   Los otros 10 quedan para Gemini (G‑H7).
2. **`MC.Estilo`** (`js/16-estilos.js`): 8 estilos hechos de datos (mapa de color, tinta, trama, sombra, árboles, cielo y pase final):
   - realista y clásico;
   - **cómic**: tinta, semitono y onomatopeyas;
   - **manga**: grises, tramado y líneas de velocidad;
   - **anime**: *cel* en 6 bandas, línea fina, sombras azul violeta y cielo de Shinkai;
   - **novela gráfica**: tres tonos de papel y tinta, sombras negras, árboles en silueta y el rojo como acento;
   - **ukiyo-e**: paleta de Hokusai;
   - **acuarela**: papel y pigmento en el borde.

   Las losas, los muros, los techos, las sombras, el cielo y los árboles pasan por el estilo. En Mandados: 🗺️ Vista → 🖌️ Estilo.
3. **Arte de verdad:** paletas de 10 obras de dominio público bajadas de Wikimedia Commons (Hokusai, Hiroshige, Van Gogh, Monet, McCay, Mucha, Doré, la Comisión Corográfica y Winslow Homer), en `arte/dominio-publico/`. En el repositorio solo quedan los colores, con fuente y licencia.
4. **`MC.Vida`** (`js/88-vida.js`):
   - al aterrizar, el cuerpo se aplasta, la cámara se sacude según la caída y salta polvo;
   - el vehículo cabecea al acelerar y al frenar;
   - en los choques hay **hitstop** (60 ms; `MC.Bucle`);
   - bandadas de garzas y palomas con su sombra, que aletean a dos cuadros;
   - hojas que caen y salpicaduras;
   - el viento mece las copas de cerca;
   - onomatopeyas en los estilos dibujados.
5. **`MC.Exportar` y `MC.Puente`** (`js/89-exportar.js`) y `node motor.mjs exportar`: el mundo sale en **glTF 2.0** (terreno, edificios, vías y árboles, con colores por vértice), con alturas RAW 16 y escena JSON. El GLB de Guatapé:
   - pasa el **validador de Khronos con 0 errores y 0 avisos**;
   - three.js lo dibuja tal cual.
6. **Investigación:** `docs/INSPIRACION-VISUAL.md` (Spider‑Verse, Arcane, Shinkai, Ghibli, *Sin City*, Moebius y *ligne claire*, *Obra Dinn*, Vlambeer, Disney y ukiyo-e, con fuentes) y `docs/MOTORES-POTENTES.md` (Godot, Unity, Unreal, Blender y three.js).
7. **Tareas nuevas** en `TAREAS-IA.md`:
   - Gemini: G‑H7 (describir los reels) y G‑H8 (40 obras de dominio público, también colombianas);
   - ChatGPT: C‑A8 (láminas guía de los estilos) y C‑A9 (personaje en *cel*);
   - Codex: C‑M18 (Godot, Unity, Unreal y una vista three.js o WebGPU) y C‑M19 (1 bit con trama estable).

**Probado** (123 pruebas):
- estilos (manga en grises, novela con acento, ukiyo-e con la paleta de Hokusai);
- vida (aterrizaje, partículas y bandadas);
- un GLB bien formado;
- los 8 estilos en Mandados, sin errores.

La maqueta de Medellín, con la CPU 4× más lenta, mide 31 ms.

## 20‑nov‑2026 · 2.6.0 · Estilo realista familiar, árboles de pie y tareas de cada IA (Claude Code)
**Pedido:**
- «Haz una revolución para que los gráficos sean más realistas: desde la vista cenital los árboles se ven como tapetes en el suelo.»
- «Deja el estilo *family friendly*, pero dale más realismo, rudeza y crudeza.»
- «Los tutoriales deben ser opcionales.»
- «Copia todos tus pedidos en los repositorios para que cada uno continúe.»
- «Gemini con Antigravity pasa a *hydrogen*: déjale las tareas fáciles. ChatGPT con Codex sigue con *astra*: encárgale mejores pedidos; GPT genera mejores imágenes.»

**Lo que pasaba:** los árboles eran discos pintados en el piso de las losas. Desde una vista inclinada, el piso se aplasta y los discos quedaban como elipses acostadas: «tapetes».

**Lo que se hizo:**
1. **`MC.Arboleda`** (`js/29-arboleda.js`):
   - los mismos árboles (y los mismos con que se choca) se levantan en la maqueta, la oblicua y la lateral: tronco que se afina, ramas, copa de lóbulos con luz de arriba a la izquierda, hojas, y flores en los guayacanes;
   - desde arriba, la copa tiene volumen;
   - 6 especies (guayacán amarillo y rosado, ceiba con raíces tablares, mango, urapán y monte), 3 variantes cada una;
   - sprites horneados una vez, con versiones reducidas y copia nocturna;
   - sombra según el sol de cerca, y la sombra bajo la copa horneada en el piso.
2. **`MC.Rudeza`**, horneada en las losas (no cuesta por cuadro):
   - asfalto con parches, grietas, manchas de aceite y alcantarillas;
   - centro de carril más gastado;
   - andén de baldosa con bordillo;
   - pasto con parches secos y verdes;
   - tejas de barro en hileras y planchas con humedad;
   - grano;
   - paleta 30 % menos saturada.

   Además, los muros tienen la base sucia y sombra bajo el alero.
3. **`MC.estilo`** (`'realista'` por defecto o `'clasico'`) y el selector 🖌️ en Vista.
4. **Tutorial opcional:** ya no se abre solo; está en la portada («❓ Cómo se juega (opcional)») y en ⚙️ Ajustes.
5. **Tareas de cada IA:**
   - **`TAREAS-IA.md`** en los cuatro repositorios;
   - Gemini («hydrogen»): G‑H1…G‑H6, tareas fáciles;
   - ChatGPT («astra»): arte C‑A1…C‑A7 y código C‑M13, C‑M16, C‑M17…;
   - `node motor.mjs capturas` y `revisar-arte` para que las tareas fáciles sean comprobables;
   - el gancho `arbol` para el arte de ChatGPT.
6. **Rendimiento:** la maqueta de Medellín con la CPU 4× más lenta mide 30–38 ms (el límite es 40). Los árboles de pie se ralean parejo si son muchos, y con calidad media salen desde un poco más cerca.

**Probado:** 119 pruebas:
- los árboles que se ven son los que chocan;
- Mandados en un celular táctil: tutorial opcional, árboles de pie y arte cargado;
- la CPU 4× más lenta.

Capturas de día, tarde y noche en la maqueta, la cenital y la lateral.

## 19‑nov‑2026 · 2.5.1 · Mandados jugable de verdad (Claude Code)
**Pedido:** «Traté de probar el minijuego pero es injugable. No hay controles de verdad, no se puede mover nada. No está completamente liberado porque hay que pagar cosas. Mejóralo con lo nuevo. ¿Ya están todos los pedidos en el repositorio?»

**Lo que pasaba:**
- El personaje sí se movía, pero la cámara estaba tan lejos que en un celular medía unos 3 píxeles.
- El joystick era invisible.
- Por eso parecía que nada respondía.
- Además, casi todo costaba plata.

**Lo que se hizo:**
1. **Cámara cerca:** unos 45 m en el lado corto de la pantalla, en celular y en computador. El jugador tiene un **anillo verde con flecha**.
2. **Joystick visible** abajo a la izquierda (`ui.joystick`), con la guía «Arrastra para moverte» (en computador: «Flechas o WASD»).
3. **Botones de acción** redondos abajo a la derecha (`ui.accion`): ⤒ saltar y ⚡ turbo; 🔽 bajar y 🔼 subir aparecen en el agua o en el aire.
4. **Flecha al objetivo** con la distancia (`MC.UI.indicador`), siempre dentro de la zona libre, sin tapar la interfaz.
5. **Modo libre**, prendido por defecto: los 34 vehículos, la lancha, la gasolina, la casa, los lugares y el modo alcalde son gratis. Se apaga en ⚙️ Ajustes.
6. **Tutorial** «Cómo se juega» al empezar, y otra vez desde Ajustes. Los menús quedaron en **Vista** (vistas, pixel y zoom) y **Ajustes** (modo libre, controles y rescate).
7. **El primer mandado empieza cerca**, y la distancia crece con cada entrega.
8. La interfaz:
   - las barras pasaron arriba y la velocidad, abajo al centro;
   - la tarjeta del mandado lleva el título en una línea y, primero, la distancia y el tiempo.
9. **`docs/PEDIDOS.md`:** cada pedido del autor, su estado y dónde quedó. Hay 55 hechos, 2 que dependen de afuera y 3 pendientes con dueño.

10. **Llegó la entrega de Gemini** (`ENTREGA-GEMINI-MOTOR-CITY-2.5.md`, G‑M0…G‑M15) y quedó integrada:
    - el arte, extraído a `arte/gemini/`: 10 atlas WebP, manifiesto, 53 íconos, 30 hitos y paletas;
    - `MC.Pieles` lo instala como piel con respaldo procedural en cada gancho, a la medida del motor y con una copia nocturna;
    - en Mandados se usan los árboles del trópico, los props, las rocas, las fachadas y los muebles, con el selector 🎨 Arte en Vista;
    - el personaje, los vehículos y los animales siguen procedurales, porque los de Gemini no vienen a escala;
    - la revisión está en `arte/gemini/LEEME.md`.
11. **De la auditoría de Gemini** se corrigió:
    - la leyenda de las capas de datos (`ui.leyenda`);
    - las etiquetas de los cuartos, ahora en la esquina;
    - las ventanas de noche en las casas bajas;
    - la maqueta, sin el corte de tierra de la vista lateral;
    - las barras, con fondo.

    También apareció un `//` que desde la 2.2 anulaba `mision.hidden` y el `aria-live` del aviso.
12. **De la auditoría de Codex** (`docs/AUDITORIA-MOTOR-CITY-2026-11-19.md`): las pruebas usan el Chromium del sistema si Playwright no trae el suyo, o el que diga `MC_CHROMIUM`. Quedan anotados, con su dueño:
    - la maqueta, que midió 44,7 ms en su máquina y aquí 27–29 ms;
    - el test de WebRTC de EnCicla.

**Probado** (118 pruebas). La nueva, en un celular táctil emulado (412 × 860), comprueba:
- aparece el tutorial;
- todo es libre y gratis, con 34 vehículos;
- el joystick se ve;
- arrastrarlo mueve al personaje unos 4 m en 2 s;
- la cámara da 9 px por metro;
- el primer mandado está a menos de 900 m;
- el arte de Gemini carga (10 atlas, de día y de noche) sin sprites faltantes.

En computador, las flechas y WASD mueven y giran.

**Falta:** probarlo en un celular real.

## 19‑nov‑2026 · 2.5.0 · Entrar al agua (Claude Code)
**Pedido:** «Añade la capacidad de poder entrar en el agua».

**Lo que pasaba:** en la 2.4 solo se entraba a pie. Mandados empieza en bici, así que el juego frenaba en la orilla.

**Lo que se hizo:**
1. **Bajarse en la orilla:** con un vehículo, al empujar 0,6 s hacia el agua honda (o con «🏊 Al agua»), uno se baja, el vehículo queda **parqueado en la orilla** y se entra al agua. Al volver: «Subirse».
2. **Nadar y bucear:** «🤿 Bucear» (Z o Ctrl) baja hasta medio metro del fondo; «⬆️ Subir» (espacio) sube; quieto, se flota hacia arriba.
3. **El aire:** dura ~35 s bajo el agua y se recupera arriba. Sin aire, la persona sube sola y no vuelve a bajar hasta tomar algo de aire.
4. **Poses** de crol y de buceo, el agua tapando el cuerpo, burbujas y la pantalla azul con rayos de luz bajo el agua.
5. **Lancha:** se alquila en el garaje si hay agua honda a menos de 30 m. Con «⚓ A tierra» uno se baja a la tierra firme más cercana y la lancha queda amarrada.
6. **Ocurrencias:** ya no «arregla» al que bucea como si estuviera bajo el piso.

**Probado** (117 pruebas):
- la bici se queda en la orilla de Guatapé y se entra nadando;
- se bucea con aire limitado y, sin aire, se sube aunque se siga oprimiendo «bajar»;
- se sale del agua y se vuelve a la bici;
- la lancha navega, desembarca y queda amarrada;
- en Mandados, el botón «Al agua» aparece en la orilla y funciona.

## 19‑nov‑2026 · 2.4.0 · Montañas, rocas, agua y límites de paso (Claude Code)
**Pedido del autor:** un sistema de montañas, rocas y tipos de terreno; agua en lagos, ríos, playa y mar; y límites de movimiento que no rompan la verosimilitud («el personaje pasa por encima de cosas que no debería»).

**Lo que se encontró** (por qué se atravesaban cosas):
1. Sobre las casillas de calle no se revisaban los edificios.
2. Los edificios de los sitios y los emblemáticos no chocaban.
3. Los árboles de las losas solo eran dibujo.
4. Postes y bancas no chocaban.
5. El agua era «sí o no», sin profundidad.
6. La pendiente frenaba, pero nunca bloqueaba.

**Lo que se hizo:**
1. **`MC.Terreno`:**
   - análisis del agua: componentes, tipo (mar, lago, río, quebrada) y distancia a la orilla, con la profundidad que sale de ahí;
   - reglas de paso por clase con su motivo: a pie se vadea y luego se nada; bici, moto, carro y camión tienen un límite de agua; la lancha necesita calado;
   - pendiente máxima fuera de las vías (subir y bajar barrancos);
   - roca, monte, arena y nieve según el vehículo;
   - borde del mundo;
   - obstáculos: edificios también sobre la calle si uno se mete más de 1 m, sitios y emblemáticos, los mismos árboles que pintan las losas, mobiliario, naturaleza, y tráfico y gente si el juego los pasa.
2. **`MC.Naturaleza`:** rocas (las grandes chocan), palmas, frailejones en el páramo, arbustos y juncos.
3. **Generador:**
   - lagos por llenado de prioridad (Barnes, 2014), solo los grandes y hondos, de superficie plana y con desagüe;
   - el mar a nivel 0;
   - los pueblos no se construyen sobre los lagos;
   - los charquitos sueltos se limpian.
4. **Dibujo:**
   - el agua toma color por tipo y profundidad, con espuma en la orilla;
   - la roca asoma en las laderas de más de 65 %;
   - brillos que se mueven sobre el agua;
   - vadear y nadar se ven, en lateral y en cenital.
5. **Mandados:** el agua se mide al cargar; dice por qué no se pasa (🌊, ⛰️, 🌳, 🪨) y avisa al nadar; nadar cansa; el tráfico y la gente estorban.

**Probado** (115 pruebas):
- el embalse de Guatapé es lago, de 0,3 m en la orilla y 16,6 m adentro;
- Medellín tiene su río;
- caminando hacia el embalse se termina nadando;
- la bici no entra a lo hondo y la lancha no anda en lo pando;
- el carro no sube una ladera de 68 % fuera de la vía;
- no se atraviesan los emblemáticos, los postes ni los árboles;
- los lagos generados son planos, el mar está a 0 m y nada de naturaleza cae sobre las vías.

## 19‑nov‑2026 · 2.3.0 · La ciudad como SimCity, Los Sims, Cities: Skylines y Townscaper (Claude Code)
**Pedido del autor:**
- estudiar esos juegos y sus motores: cómo crean entornos, ambientes, sombras y detalles de una ciudad;
- añadirlo al motor, porque es crucial para cómo se crea;
- entregar **un solo documento** con todo (contexto, código a usar y plan de cada IA), el minijuego, el HTML y el link.

**Lo que se hizo:**
1. **Sombras del sol** por hora en las vistas 2D y en el raster: casco convexo en caché, recorte de techos en cenital y oclusión de contacto en las losas. Probado: a las 12 h la sombra mide 0,13 m por metro de altura; a las 16:30, 2,4 m y hacia el oriente; de noche, nada.
2. **Mobiliario urbano** por vía, con azar fijo: cerca del Coltejer, 269 postes, 206 árboles, 30 cebras, 45 bancas y 11 paraderos, ninguno dentro de un edificio. **Luces de noche** en charcos cálidos.
3. **Fachadas por reglas** (WFC) en ciudad 3D, maqueta y lateral: locales, vitrinas y puerta abajo, balcones alineados y muros ciegos.
4. **`MC.Urbe`:**
   - campos de 40 m (valor, ruido, contaminación, verde, servicios y transporte);
   - zonas de 8 m junto a las calles;
   - demanda RCI que responde a lo que se construye;
   - lotes que crecen mirando a la calle y suben de nivel;
   - energía y agua con capacidad (GlassBox);
   - predial y mantenimiento en el libro;
   - capas de datos encima de las vistas.

   Un parque sube el valor de 45 a 60.
5. **Los Sims:** objetos que anuncian necesidades, `MC.Habitante` (con hambre va a la nevera o a la estufa) y ambiente de la casa (decorar lo sube). Ninguna casa queda sin cocina ni cama.
6. **Townscaper:** WFC, autotile (4, 8 y esquinas) y rejilla irregular relajada.
7. **Paisaje sonoro:** tráfico, pájaros, grillos, lluvia, truenos, viento, agua y gente.
8. **Mandados:** 🏙️ modo alcalde (capas, zonas, parque, colegio, planta solar y resumen), casa con alguien que vive en ella y menú de sonido.
9. **Ganchos de arte** `prop`, `fachadaModulo` y `mueble`.
10. **Documentos:** `docs/DOCUMENTO-UNICO.md` y `node motor.mjs documento` (→ `dist/MOTOR-CITY-TODO.md`). `PLAN-IAS` y `PETICION-*` ahora apuntan ahí.

**Cifras** (CPU 4× más lenta, con sombras y mobiliario):

| Vista | ms |
|---|---|
| Cenital | 8–10 |
| Ciudad 3D | ~15 |
| Maqueta | ~27 |
| Lateral | 14–20 |

La calidad automática baja el detalle si hace falta. Bajar la maqueta a menos de 20 ms es el encargo C‑M13. 109 pruebas en verde.

## 19‑nov‑2026 · 2.2.0 · GPU virtual, mi casa, lugares, historias y vista lateral (Claude Code)
**Pedido del autor:**
- una solución a la tarjeta gráfica;
- mejor física en puentes y cámara;
- ver las vistas centrales de lado, estudiando FEZ, Little Nightmares y Monument Valley;
- sprites;
- interfaz con psicología, que no estorbe;
- estudiar los mejores motores;
- historia con diversión, reflexión y conciencia;
- ocurrencias;
- manual, optimización y tipos de controles;
- la casa del jugador por su dirección, con interiores únicos y diseñables;
- talleres, tiendas y más lugares;
- historias procedurales, No Man's Sky y tamaños proporcionales.

**Lo que se hizo** (todo con pruebas; 103 en verde, también en Chromium):
1. **GPU virtual** (`05-gpu`, `44-raster`):
   - perfil del aparato;
   - resolución dinámica PI y bucle de paso fijo;
   - **3D por software en Canvas 2D**: 15–25 ms, contra 70–90 ms del WebGL por software.
2. **Física de niveles por superficies:** se sube por la rampa y se pasa por debajo, probado en 5 puentes reales. Tiempo de coyote y memoria del salto.
3. **Cámara** con resortes críticamente amortiguados, brazo con choque (edificios, cerros y tableros), FOV por velocidad, trauma y giros animados.
4. **Vista lateral:** casa de muñecas, giro de a 90° (FEZ) y rayos X. La ciudad 3D también se inclina hasta quedar de lado.
5. **Manejo** (curvas, giro según la velocidad, asistencias y 7 esquemas), **sprites**, **escala real** (los 35 vehículos validados) e **interfaz** por zonas: columna arriba, atenuación, cola de avisos, foco y cine. `MC.UI.verificar` prueba que nada tape el centro.
6. **Interiores** con 8 estilos, cuartos opcionales, decoración, catálogo de 22 muebles y lugares nuevos (taller, tienda, centro comercial, biblioteca y restaurante).
7. **Mi casa** (`49-hogar`):
   - lee la nomenclatura colombiana y la ubica en las calles reales, sin internet;
   - acierta «Calle 50 # 52‑20» en La Candelaria y elige el municipio correcto si se dice;
   - el jugador diseña su casa y la compra cuadra en el libro.
8. **Lugares jugables y desgaste** (`82-lugares`): 195 lugares en Guatapé, con talleres que reparan y mejoran, tiendas con energía y bibliotecas con datos reales.
9. **Historias** (`85-historias`): storylets en tres pilares, director de ritmo, encargos procedurales y **ocurrencias** con corrección y reporte sin datos personales.
10. **Cosmos** (`13-cosmos`): estrellas con abundancias reales, planetas con Kepler, gravedad, temperatura y atmósfera, mundo jugable, criaturas verosímiles y relieve infinito.
11. **Mandados** con todo lo anterior.
12. **Documentos:** `docs/MANUAL.md`, `INVESTIGACION.md`, `OPTIMIZACION.md`, `PLAN-IAS.md` y las peticiones 2.2 a Gemini y ChatGPT.
13. **Web:** portada `index.html` + `.nojekyll` en `main`, porque Pages sirve `main`. La 2.0 se fusionó a `main` con el PR #1 del autor.

**Falta:** las entregas de Gemini y ChatGPT, medir en un celular real, la migración de cada juego a `motor-city/` (sus IAs) y la 2.3 (ver `docs/PLAN-IAS.md`).

## 19‑nov‑2026 · 2.1.0 · Motor City crece (Claude Code)
- Nombre: solo «Motor City»; los juegos lo reciben en `motor-city/`.
- Ciencia, economía, generador de mundos, territorios (`geo/territorio.py` con Guatapé), clima global, seres, taller, IA y población, interiores, música, interfaz y mecánicas.
- Minijuego Mandados; plantillas, `nuevo`, `reporte`, skills `motor-city-*` y `CONTRIBUIR.md`. 80 pruebas.

## 19‑nov‑2026 · 2.0.0 · nace Motor City (Claude Code)
**Pedido del autor:**
- Hacer un solo motor de mundo abierto según el *Plan del Mundo Abierto del Valle*, en el repo nuevo `motorcity`.
- Que quede listo para cualquier ciudad y para los juegos que vienen: *Motor City* (carreras) y *Extremo* (deportes extremos).

**Lo que se hizo:**
1. **Revisión:**
   - se clonaron y probaron los tres juegos en sus ramas más nuevas;
   - EnCicla v2.0.1: 97 ✓;
   - El Metro v2.0.0: 100 partidas, 0 errores;
   - Run Scooter v2.5.0: simulación de 100 partidas, bien;
   - se jugaron y capturaron sus vistas.

   **Hallazgos:**
   - Run Scooter es **WebGL propio**, no Canvas 2D como decía el plan.
   - El Metro ya integró su entrega (v2.0.0), pero su motor 1.2.0 sigue en la rama `motor-valle`.
2. **F1 · Mundo 2.0:**
   - `herramientas/fusionar.mjs` junta en `datos/medellin/mundo.mc4` (6 MB, 16 capas) los datos de EnCicla (10 m) y de El Metro (metros);
   - el cargador `js/10-mundo.js` trae todas las consultas.

   Cifras:
   - 639.457 huellas;
   - 2.193 pasos con nivel (el viaducto sale de los rieles reales);
   - 31 líneas;
   - 133 estaciones EnCicla;
   - 45 lugares y 30 hitos enlazados.
3. **Redes:** grafo de cruces sobre las vías reales (`js/11-red.js`): A\*, recorridos sin fin y la salida que continúa.
   - Ciclorrutas: 123 km.
   - Red conectada: 34.173 nodos.
4. **F5 · Reglas del mundo:**
   - reloj y festivos de Colombia;
   - cielo con el sol y la luna reales;
   - clima por temporadas, igual para todos;
   - transporte con horario real y determinista;
   - tráfico con semáforos reales;
   - huevos de pascua.
5. **F2 · Lo físico:**
   - personaje único con esqueleto de poses;
   - 35 vehículos (con los que vienen para Motor City y Extremo);
   - física con pendiente, choques, puentes por sus extremos, saltos, vuelo y agua;
   - controles de teclado, táctil y gamepad;
   - una cámara para todas las vistas.
6. **F3 · Vistas:**
   - cenital, ciudad 3D y maqueta 2:1 con una sola proyección y las losas en caché;
   - **panorámica de perfil**, que junta la de El Metro y la de EnCicla y suma la fila real de edificios, las siluetas de los emblemáticos, el viaducto con trenes reales, los cruces con nombre, el primer plano y el fondo suavizado;
   - WebGL (tercera y primera persona, dron y cine);
   - pixel en todas;
   - transición y calidad automática.
7. **F4 · Run en la ciclovía:**
   - se importa RunRunZero 5b2f85d casi idéntico, con 12 parches comprobados;
   - lomas y curvas reales;
   - esquinas en los cruces reales, que doblan el mundo;
   - cielo y lluvia del mundo;
   - se sale en el mismo punto.
8. **Banco de pruebas** `dist/motor-city.html` y **54 pruebas** (`node motor.mjs prueba --navegador`). Con la CPU 4× más lenta, la mediana del dibujo es:

   | Vista | Mediana |
   |---|---|
   | Cenital | 4,1 ms |
   | Ciudad 3D | 8,6 ms |
   | Maqueta 2:1 | 17,8 ms |
   | Panorámica | 7,3 ms |
9. **La tubería 1.x se mudó aquí:** `geo/`, `capas/`, `motor.mjs` y `js/valle.js` sin cambios. `build.py` y `fetch.py` ya leen la ventana de cualquier ciudad (`CIUDAD=ciudades/x.json`).
10. **Documentos:**
    - `MOTOR.md` (el contrato 2.0) y `CONTEXTO-IA.md`;
    - migración de EnCicla y de El Metro;
    - receta para otras ciudades y visión de los juegos que vienen;
    - peticiones de arte y auditoría para Gemini y ChatGPT.
11. **Juegos:**
    - se sincronizó el motor 2.0 en `motor-valle/` de EnCicla y de El Metro, sin cambiar su código ni sus datos;
    - en cada repo hay una nota `docs/CONTEXTO-MOTOR-CITY.md` y una entrada en su bitácora;
    - sus pruebas siguen en verde.

**Errores encontrados y corregidos en el camino:**
- La tabla de capas se pisaba con el `n` de los edificios.
- El inflador entraba en un bucle sin fin con datos truncados.
- Había una llave de más en `45-gl.js`.
- `[hidden]` no ocultaba la pantalla de carga.
- La conversión de grados a metros estaba mal.
- Faltaba un nulo en los cruces de la panorámica.
- Un color `rgba` daba negro.
- En el pixel, las etiquetas salían gigantes.

**Lo que sigue:** ver `CONTEXTO-IA.md` §5.

## C-M34 · 20-nov-2026 · Entrega candidata de ChatGPT (NO PUBLICADA EN MAIN)

Rama: ia/chatgpt/cm34-cache-20261120. Motor 4.0.3 base sin incremento de versión.
- MC.Sectores1km: precarga de sectores por cercanía al centro con presupuesto LRU estable, rechazo de coordenadas y configuración inválida.
- Test nuevo: pruebas/sectores-cm34.mjs (5/5 grupos Node locales); paso añadido a motor-city-qa.yml.
- Investigación aplicada a futuras versiones: Build, Quake/PVS, GTA III/LOD, Godot/HLOD; separación entre caché ED1 y streaming MC4 real.
- Informe técnico y evidencias: reportes/2026-11-20-chatgpt-cm34-sectores-y-motores.md.
- Pendiente: CI completa, mediciones GPU reales, streaming MC4 por chunks y revisión por Claude antes de integrar.

## C-M34 · Continuación · paquetes MC4 offline por capas (PR #9, candidato)

- API nueva compatible `MC.Mundo.desdePaquete` / `cargarPaquete`; decodificación de capas comprimidas a pedido.
- Builder opt-in `mundos_capas:true` particiona el contenedor MC4 existente por capas sin alterar el formato ni sus bytes, mantiene HTML único sin internet.
- Turno Cero usa el nuevo formato para Nueva York, Medellín y Guatapé; el cargador monolítico anterior sigue como respaldo.
- Nuevas pruebas Node de equivalencia byte a byte y Chromium de juego real (`pruebas/paquete-capas-*.mjs`), añadidas a CI.
- Guía `docs/MC4-CAPAS-OFFLINE.md`; informe `reportes/2026-11-20-chatgpt-cm34-sectores-y-motores.md`.
- **No se fusionó ni incrementó versión.** Mantener pendiente hasta CI, benchmark JS Heap/CPU y GPU física. Todavía NO son sectores geográficos de 1 km.
## C-M34 · ChatGPT · Motor City 4.1 · caché multicidad sin cargas duplicadas
Rama `ia/chatgpt/planeta-cache-410-20261121`, basada en `main` 4.1.0: single-flight asíncrono por ciudad, política LRU real, protección de mundo activo, `maxMundos` y métricas `diagnosticoCache()`. Turno Cero llama a `planeta.fijar(id)` al llegar. QA Node (7 casos) y Chromium offline integrado en GitHub Actions. Documentación: `docs/PLANETA-CACHE-CONCURRENCIA.md`, `reportes/2026-11-21-chatgpt-planeta-cache-410.md`. Estado: candidato para revisión, sin mezclar con PR #9 ni fusionar en main antes de pruebas.

## 21-nov-2026 · ChatGPT · C-M34 streaming territorial (PR #11, rama 4.2)

- El MC4 original se mantiene intacto, pero `suelo` y `nivel` se empaquetan por sectores de aproximadamente 1 km y se decodifican bajo demanda. `MC.RasterMC4` contiene LRU de 16 sectores por raster, bordes parciales, `u8/i8` y materialización compatible con `Mundo.capa`.
- `Mundo.desdePaquete/cargarPaquete` recibe proveedor opcional de sectores; el constructor y Turno Cero activan `mundos_rasters:true`; el HTML sigue offline y el resto de capas MC4 conserva sus bytes originales.
- Portada de la PR #10 a `main` 4.2: `Planeta` deduplica cargas, usa LRU, protege el mundo activo y `liberarExcepto` descarga mundo anterior e invalida rutas. Un contador de época impide resucitar cargas antiguas tras cambiar de ciudad.
- QA: `raster-sector-cm34.mjs`, `paquete-capas-cm34.mjs` (equivalencia byte a byte de Manhattan/Medellín/Guatapé), `planeta-cache-cm34.mjs` (9 casos), `getaway-contenido.mjs` actualizado a la nueva API, más Chromium offline. CI del último commit pendiente de confirmación; no mezclar runs anteriores.
- Guía: `docs/MC4-STREAMING-TERRITORIAL.md`; informe: `reportes/2026-11-21-chatgpt-cm34-streaming-territorial.md`; relevo en `coord/buzon/20261121-1015-chatgpt-cm34-spatial.md`.
- **Sin merge ni nueva versión.** ED1/vías/relieve no están fragmentados; falta medir memoria y FPS real.

**Sincronización:** los cambios de Motor City 4.3.0 de Claude/Gemini se incorporaron al historial de esta rama sin reemplazar su código. Validación del commit combinado pendiente de CI.
