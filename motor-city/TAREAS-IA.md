# Tareas de cada IA · Motor City 3.0

> **Si te dijeron «mira el repositorio y haz tu parte», empieza aquí.**
> 1. Busca abajo **quién eres** y haz **solo tu parte**, en el orden indicado.
> 2. El contexto completo, el código exacto y las reglas están en `docs/DOCUMENTO-UNICO.md` (léelo entero). Lo que ya se hizo y lo que falta está en `docs/PEDIDOS.md`.
> 3. Al terminar, informa en 5–10 líneas: qué hiciste, cómo lo probaste, qué aprendiste y qué falta.

**Lo que sigue después de la 3.0:** la prueba en grande, «Getaway Nueva York». El plan, el orden y **las 10 reglas que dejó el feedback del autor para todas las IA** están en `docs/PROXIMO-NUEVA-YORK.md`. Léelas antes de tu encargo.

**Novedades de la 3.0 (20‑nov‑2026): un solo mundo 3D y varias cámaras.**
- La cenital, la ciudad y la maqueta son cámaras sobre el mismo mundo 3D (`js/45-gl3d.js`); sin GPU usan su respaldo 2D.
- Hay fachadas, árboles low-poly que son los mismos de la 2D, artilugios físicos (`MC.Objetos`), topes de zoom y el mapa grande.
- Lee primero `docs/INVESTIGACION-CAMARA.md`.
- Los videos que no se pudieron leer ya no interesan: G‑H10 se quitó.

**Novedades de la 2.10 (20‑nov‑2026):**
- **Skills y plugins de los videos del autor** (`skills-externas.json`, skill `motor-city-skills-externas`):
  - **Hallmark**, para páginas web que no parezcan hechas por IA;
  - **Modern Web Guidance** (Google Chrome), para HTML, CSS y JS moderno;
  - **find-skills** (Vercel), para buscar skills;
  - **HyperFrames**, para videos de lanzamiento.
- **Cómo se instalan:**
  - Claude Code las recibe como plugins por `.claude/settings.json`;
  - las demás IA corren `node motor.mjs skills --instalar --agente codex` (o `antigravity`, `gemini-cli`).
- **Público simulado:** `node motor.mjs publico`. Una niña, un abuelo, una gamer y un turista juegan solos Mandados, y el informe queda en `dist/publico.md`.
- **Política de navegadores:** está en `CLAUDE.md`.

**Reparto desde noviembre de 2026, por decisión del autor:**
- **Gemini con Antigravity** trabaja por ahora con **«hydrogen»** (ya no con «argon»). Le tocan las **tareas fáciles**: revisar, medir, reunir datos y referencias.
- **ChatGPT con Codex** sigue con **«astra»** y genera mejores imágenes. Le tocan las **tareas fuertes**: el arte realista a escala y el código difícil.

**La guía de referencias (2.8):** `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`, la entrega del autor con 25 fichas. Tiene el peso, la vida, la arquitectura portable y el rendimiento en móvil. Su resumen, con lo que ya está en el motor, está en `docs/INSPIRACION-VISUAL.md` §1.

**Los estilos (2.7):**
- **realista familiar** (por defecto);
- **cómic, manga, anime, novela gráfica, ukiyo-e y acuarela** (`MC.estilo`).

De las obras con derechos se toman las **técnicas**; el arte que se copia es de **dominio público** (`docs/INSPIRACION-VISUAL.md`). **Peso y vida:** `MC.Vida`. **Motores potentes:** `docs/MOTORES-POTENTES.md`.

**El estilo realista familiar (2.6):**
- Para todo público, pero con la ciudad como es:
  - asfalto gastado, con parches, grietas y alcantarillas;
  - andenes de baldosa con bordillo;
  - pasto con parches secos;
  - tejas de barro y planchas de concreto con humedad;
  - muros con la base sucia;
  - árboles con volumen (guayacanes florecidos, ceibas, mangos).
- Nada de caricatura plana. Nada de violencia, sangre ni marcas.
- El estilo clásico (plano) sigue disponible: `MC.estilo = 'clasico'`.

---

## Gemini · Antigravity («hydrogen») · tareas fáciles
> **Entregado el 20‑nov‑2026 (G‑H1…G‑H8):**
> - `reportes/2026-11-20-gemini-*.md` (capturas, revisor de arte y pruebas);
> - `arte/referencias/` (6 láminas);
> - `contenido/datos-gemini.json` (30 datos);
> - `arte/gemini/iconos-ui.json`;
> - `arte/dominio-publico/candidatas.md` (40 obras);
> - la auditoría de los reels en `docs/INSPIRACION-VISUAL.md` §1.1.
>
> Claude corrigió lo que encontraron las capturas (botones y zona libre, aviso desfasado, ventanas en casas de un piso, cubiertas flotantes, cebras cruzadas, botón «Comprar» y burbuja de la casa) y sacó las paletas de las obras colombianas.
>
> **Lo que sigue para Gemini:**
> - **G‑H7**: los 13 enlaces y las 7 fichas que solo describe su informe;
> - **G‑H9**: la medición en un celular real;
> - **G‑H1 otra vez** sobre la 2.8, con `node motor.mjs capturas`.

Cada tarea es corta y se puede comprobar. Si algo pide más que esto, **déjalo anotado para ChatGPT** y no lo hagas.

| Id | Tarea | Cómo | Entrega |
|---|---|---|---|
| **G‑H1** | **Revisión visual con capturas** | `node motor.mjs construir` y `node motor.mjs capturas`. Saca 14 fotos de Mandados: 4 vistas × 3 horas, más la capa de valor y Mi casa. Para cada foto responde: ¿se lee el personaje? ¿algo tapa el centro? ¿los árboles están de pie en la maqueta y la lateral? ¿la noche se ve bien? ¿hay algo que se vea de caricatura o fuera de escala? | `reportes/AAAA-MM-DD-gemini-capturas.md`, con una tabla foto → hallazgo → gravedad (alta, media o baja). |
| **G‑H2** | **Revisor de arte** | `node motor.mjs revisar-arte arte/<paquete>` sobre cada paquete que llegue (empieza por `arte/gemini`, que hoy tiene 21 cuadros fuera de la imagen). | La salida pegada en un reporte y una lista de qué debe corregir quien lo hizo. |
| **G‑H3** | **Láminas de referencia** (Nano Banana) del estilo realista familiar | 6 escenas, sin texto ni logos, vistas como la maqueta 2:1:<br>1. una calle de Guatapé con zócalos de colores;<br>2. una ladera de Medellín con escaleras;<br>3. la orilla del embalse;<br>4. una noche con lluvia y charcos;<br>5. una plaza con guayacanes florecidos;<br>6. un taller de barrio. | `arte/referencias/` (PNG). Son **solo referencia** para ChatGPT y no van al juego. |
| **G‑H4** | **30 datos verificables** de Guatapé y Medellín (geografía, naturaleza, historia, movilidad) | Una frase corta cada uno, **con su fuente** (enlace). | `contenido/datos-gemini.json`: `[{ "texto", "fuente", "lugar", "tema" }]` |
| **G‑H5** | **Íconos a botones** | Elige qué ícono de `arte/gemini/iconos.json` va en cada botón de Mandados (Vista, Vehículo, Sonido, Agua, Mi casa, Ciudad, Ajustes, saltar y turbo). | `arte/gemini/iconos-ui.json`: `{ "boton": "icono" }` |
| **G‑H7** | **Verifica las referencias que faltan**: los 13 enlaces de Instagram que siguen sin verificar y las 7 fichas que solo describe tu informe (R02, R03, R04, R08, R09, R13 y R18 en `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md` §4) | Para cada uno: qué se ve, qué estilo es (cómic, manga, anime, realista…), qué da sensación de peso o de vida y qué técnica parece usar. | Una tabla en `docs/INSPIRACION-VISUAL.md` §1, una fila por reel. |
| **G‑H8** | **40 obras de dominio público** para paletas, al menos 10 colombianas (Comisión Corográfica, Epifanio Garay, Ricardo Acevedo Bernal, grabados del *Papel Periódico Ilustrado*…) | Para cada una: el enlace en Wikimedia Commons y su licencia. Solo dominio público. | Una lista en `arte/dominio-publico/candidatas.md`. Claude saca las paletas. |
| **G‑H9** | **Medición en un celular real**, con el autor | En Mandados, ⚙️ Ajustes → 📈 Telemetría. 5 minutos por vista (cenital, maqueta, lateral) y por calidad (baja, media, alta). Anota el modelo del celular, los fps, el p95 y si se calienta. | Una tabla en `reportes/AAAA-MM-DD-gemini-celular.md`. |
| **G‑H11** (2.10) | **Las 4 paletas colombianas que faltan** (Wikimedia bloqueó la descarga) | Para cada obra de `arte/dominio-publico/candidatas.md` marcada «falta», da el enlace directo a una **miniatura de 250 px** en `upload.wikimedia.org` y confirma que es de dominio público. | Los enlaces en `candidatas.md`. Claude saca las paletas. |
| **G‑H12** (2.10) | **Corre las herramientas nuevas y reporta** | `node motor.mjs publico` (anota el veredicto de cada perfil), `node motor.mjs skills` y `npx -y modern-web-guidance@latest legacy-scan js --json`. | `reportes/<fecha>-gemini-herramientas.md`, sin cambiar código. Para cada hallazgo de `legacy-scan`: archivo, línea y si aplica según su `keepWhen` y su `dropWhen`. |
| **G‑H13** (2.10) | **Instala las skills en Antigravity** | `node motor.mjs skills --instalar --agente antigravity` y confirma que aparecen en `.agents/skills/`. Úsalas desde ahí en tus tareas. | Una línea en tu reporte, con lo que se instaló y lo que falló. |
| **G‑H14** (3.0) | **Capturas de las 3 cámaras en un celular real con GPU** (allí sí se ve el 3D) | En Mandados, prueba la cámara de juego de cerca y de lejos, la maqueta y la vista detrás del jugador, de día y de noche. Para cada una, ¿se lee el jugador? ¿Algo lo tapa? ¿Las fachadas se ven? ¿Se nota cuando carga lo lejano? | `reportes/<fecha>-gemini-camaras-3d.md` con fotos y una tabla de foto, hallazgo y gravedad, sin cambiar código. |
| **G‑H15** (3.0) | **Los colores reales de los zócalos de Guatapé** | De 10 a 15 colores de zócalos y fachadas reales, con su fuente (foto de dominio público o con licencia libre, o una fuente oficial). | `arte/dominio-publico/zocalos-guatape.json`: `[{ "hex", "dónde", "fuente" }]`. Claude los pone en `PAL_ZOCALO`. |
| **G‑H16** (3.0) | **Fluidez del 3D contra el 2D en tu celular** | ⚙️ Ajustes → 📈 Telemetría. 3 minutos con la cámara de juego (3D) y 3 con «Calidad: baja» (2D). Anota el modelo, la mediana y el percentil 95, y la densidad del lienzo. | Una tabla en tu reporte. |
| **G‑H17** (3.0) | **30 objetos del mobiliario real** de Guatapé y Medellín para los artilugios físicos: bancas, materas, bolardos, postes, rejas, motos parqueadas… | Para cada uno: tamaño aproximado en metros, material, color y si se mueve o se rompe al chocar. | `contenido/objetos-gemini.json`. Codex los convierte en tipos de `MC.Objetos`. |
| **G‑H18** (Nueva York) | **50 lugares de Manhattan** para el juego: museos, puentes, parques, garajes y miradores. | Para cada uno: nombre, latitud y longitud, tipo y una fuente. | `contenido/nueva-york-lugares.json` |
| **G‑H19** (Nueva York) | **Análisis de persecuciones** en videos de *Reckless Getaway 2*, *Pako Forever* y *#DRIVE*. | Qué hace la cámara, cuántos perseguidores hay, cómo sube la dificultad y qué premia. Una tabla por juego, con minuto y segundo. | `reportes/<fecha>-gemini-persecuciones.md` |
| **G‑H6** | **Pruebas y reporte** | `node motor.mjs prueba --navegador`, y en cada juego sus pruebas (ver su `TAREAS-IA.md`). | Un reporte con lo que pasó y lo que falló, sin corregir código. |

**No es tu rol:** cambiar el código del motor, hacer atlas grandes o arreglar fallas. Eso es de ChatGPT y de Claude.

---

## ChatGPT · Codex («astra») · tareas fuertes
> **Entregado el 20‑nov‑2026 (2.7.1, unido en la 2.9):**
> - el arte C‑A1…C‑A9 (`arte/chatgpt/`);
> - el código C‑M1, C‑M13 (la maqueta va en 22 ms; la meta de 20 sigue abierta), C‑M15, C‑M16, C‑M17, C‑M18 y C‑M19.
>
> **2.10:**
> - el cómic y el 1 bit ya no leen la pantalla (filtros del lienzo y media resolución): cenital 21 y 18 ms, maqueta 31 y 28 ms (antes 26/25 y 43/42) en Chromium sin GPU;
> - el 1 bit ya no hace muaré en la maqueta;
> - Mandados pasó de 8,2 a 5,1 MB (`herramientas/aligerar_arte.py`).
>
> **Lo que sigue, en orden:**
> 1. **C‑M13**: la maqueta por debajo de 20 ms;
> 2. **C‑M21**, **C‑M20** y **C‑M22**;
> 3. **C‑A10** y **C‑A11**;
> 4. después, C‑M2…C‑M12 y C‑M14.
>
> **Nuevos de la 3.0 (mundo único 3D):** **C‑M26**, **C‑M27**, **C‑M28**, **C‑M29**, **C‑A13** y **C‑A14**, antes que todo lo demás. La maqueta ya va por debajo de 20 ms con la densidad dinámica y la capa de suelo (C‑M13 queda hecho).
>
> **Nuevos de la 2.10, con las skills de los videos:** **C‑M23**, **C‑M24**, **C‑M25** y **C‑A12**, justo después de C‑M13.
>
> Cuando entregues un atlas nuevo, corre `python3 herramientas/aligerar_arte.py`. Así queda WebP con pérdida, calidad 88 y alfa sin pérdida.

**Primero el arte** (lo genera ChatGPT) y **después el código** (lo hace Codex). Detalle y reglas en el documento único, §10.

### Arte (imágenes de ChatGPT), en orden
**Reglas comunes:**
- 32 px por metro;
- que la figura **llene su cuadro**;
- ancla en los pies o la base;
- **2 px de margen** entre cuadros;
- fondo transparente o magenta #ff00ff;
- **sin sombra horneada**: la pone el motor según el sol;
- luz de arriba a la izquierda;
- sin texto, logos ni marcas.

Cada atlas va con su `manifiesto.json` y pasa `node motor.mjs revisar-arte` sin problemas graves.

| Id | Encargo | Para qué gancho |
|---|---|---|
| **C‑A1** | **Ancla de estilo realista familiar**: una cuadra de Guatapé en maqueta 2:1, de día y de noche con lluvia. Es la referencia de todo lo demás. | — |
| **C‑A2** | **Personaje a escala**: 10 estados × 4 cuadros de perfil (quieto, camina, corre, pedalea, impulsa, patina, sentado, salta, nada, bucea) y desde arriba en 4 direcciones. 6 personas distintas (piel, pelo, ropa de diario y de trabajo, casco de ciclista). 1,70 m = 54 px. | `personajeLado`, `personajeArriba` |
| **C‑A3** | **Vehículos a escala**: los 35 de `MC.Vehiculos` más la moto y el carro de mandados, de perfil y desde arriba, con un poco de uso (polvo, rayones). Buseta, chiva, taxi y bus colombianos, sin marcas. Ruedas aparte. | `vehiculoLado` |
| **C‑A4** | **Árboles realistas**: guayacán amarillo y rosado (florecidos), ceiba, mango, urapán y árbol de monte, más palma de cera y de coco. 3 variantes de cada uno, de lado (128 px de alto) y desde arriba (128 px). Nombres: `arbol_<especie>_lado`, `arbol_<especie>_arriba`, `_v1`, `_v2`. | `arbol` (nuevo) |
| **C‑A5** | **Texturas de suelo sin costuras** (128 × 128 px = 4 m): asfalto gastado, asfalto parcheado, andén de baldosa, adoquín, pasto, tierra con barro, grava, teja de barro, plancha de concreto y zinc oxidado. | `textura` (lo hace C‑M16) |
| **C‑A6** | **Módulos de fachada con desgaste**: 6 zonas × 6 tipos × 3 variantes, de día y de noche (reemplaza G‑M12). | `fachadaModulo` |
| **C‑A7** | **Animales a escala**: perro criollo, gato, gallinazo, caballo, vaca, iguana, zarigüeya y ardilla. | `animalLado` |
| **C‑A8** | **Láminas guía de los estilos 2.7**: la misma cuadra de Guatapé en cómic (*Spider‑Verse* y Lichtenstein), manga (tramado y líneas), anime (Shinkai y Ghibli), novela gráfica (noir con un rojo), ukiyo-e (Hokusai) y acuarela (Comisión Corográfica). Solo la técnica, nunca personajes ni marcas. | guía de `MC.Estilo` |
| **C‑A10** | **Tipografía propia** (R25) para letreros, placas, grafitis y menús: una fuente a partir de letra a mano, con 3 variantes por letra, libre para usar. | interfaz y letreros |
| **C‑A11** | **Interfaz de libreta** (R23): el mapa de mandados, la lista de misiones y los botones como una libreta dibujada, con *squash and stretch* al tocar. | `MC.UI` (tema) |
| **C‑A12** (2.10) | **Tráiler de Mandados con HyperFrames** (skill `hyperframes`): 30 s en vertical 9:16 y en horizontal 16:9:<ul><li>con capturas reales (`node motor.mjs capturas`) de las vistas y de los estilos (realista, cómic, 1 bit, acuarela);</li><li>con subtítulos en español y música libre de derechos;</li><li>sin cifras ni frases inventadas.</li></ul> | `videos/` (MP4 de menos de 15 MB) y el HTML de la composición |
| **C‑A13** (3.0) | **Láminas de fachadas de Guatapé por módulos**: ventana, puerta, balcón, zócalo y cornisa, en 6 combinaciones de color reales (frente, lado y detalle). Son la guía para el atlas de fachadas del mundo 3D. | `edificio3d` (C‑M28) |
| **C‑A14** (3.0) | **Vehículos colombianos low-poly en vistas ortográficas** (frente, lado y arriba, con medidas): buseta, chiva, taxi, moto con parrillero, camión de estacas y bici EnCicla. Codex los modela en código a partir de las láminas. | `carro3d` |
| **C‑A15** (Nueva York) | **Arte de Nueva York**, todo público: taxi amarillo, patrulla, carros de «la mafia» (sedanes negros de los 70), módulos de fachada de *brownstone* con escalera de incendios, rascacielos (3 estilos), puentes, el muelle y el *skyline* para los impostores. Sin marcas ni logos. | `carro3d`, `edificio3d` e impostores |
| **C‑A9** | **El personaje en *cel***, con contorno y 3 tonos, para los estilos dibujados: los mismos estados que C‑A2. | `personajeLado` en los estilos `comic`, `manga` y `anime` |

### Código (Codex), en orden
| Id | Encargo |
|---|---|
| **C‑M13** | **Maqueta por debajo de 20 ms** con la CPU 4× más lenta, con todo el detalle 2.6: árboles de pie, desgaste y fachadas. Hoy da 30–38 ms aquí y 44,7 ms en la máquina de Codex. |
| **C‑M23** (2.10) | **La red vial de Guatapé:**<ul><li>123 de sus 385 nodos son puntas sueltas;</li><li>tiene 5 componentes;</li><li>las rutas dan rodeos de 4× en el percentil 90.</li></ul>Revisa `geo/territorio.py` y `Red` (`une`, `_partir`): que se unan los cruces y las puntas que casi tocan, sin crear calles falsas. | La prueba «rutas por la calle» con el percentil 90 por debajo de 2,5× y `node motor.mjs publico` sin perfiles atascados por el mapa. |
| **C‑M24** (2.10) | **Ayuda de manejo para niños**: el público simulado marca que Sofía (8 años) pasa el 43 % del tiempo atascada. Agrega en ⚙️ Ajustes una ayuda opcional:<ul><li>imán a la calle;</li><li>frenado antes de chocar;</li><li>giro suave al rozar un muro.</li></ul>Va encendida por defecto en el ritmo «tranquilo». | `node motor.mjs publico --perfiles nina` con atascado por debajo del 25 %, y su prueba. |
| **C‑M25** (2.10) | **La portada web de Motor City con Hallmark** (`/hallmark`): el `index.html` de GitHub Pages que lleva a Mandados y a los juegos.<ul><li>En español, con capturas reales.</li><li>Sin cifras, testimonios ni logos inventados.</li><li>`sloplint --render` limpio y el piso de Hallmark completo: tokens, `:focus-visible` y `prefers-reduced-motion`.</li></ul> | `index.html` y su reporte de `sloplint` |
| **C‑M26** (3.0) | **Persecución jugable**, como Reckless Getaway: policía o rivales con `MC.IA` que cortan el paso y frenan delante. La cámara ya tiene `camara.persecucion` (0 a 1); súmale casi choques que dan turbo y un leve *hitstop*. | Un modo en Mandados («¡Te persiguen!») con su prueba. |
| **C‑M27** (3.0) | **Luz del mundo 3D:** sombras de los edificios y los árboles con *shadow map* en WebGL 1 (si no se puede, sombras proyectadas en el suelo), y desenfoque de maqueta (*tilt-shift*) con la profundidad, como HD‑2D. Debe mantener 60 cuadros por segundo en un celular medio. | `js/45-gl.js` con su prueba. |
| **C‑M28** (3.0) | **Atlas de fachadas con UV** para `edificio3d`, a partir de las láminas C‑A13 y del arte de ChatGPT, más **impostores lejanos** (siluetas de cerros y torres) para la vista detrás del jugador. Se hornean de lado con la Arboleda y los edificios. | `js/45-gl3d.js` |
| **C‑M29** (3.0) | **Más física:** rampas y saltos con cámara lenta al aterrizar, destrucción ligera (vallas, conos y postes que se doblan), objetos movidos que se guardan por sector (`MC.GuardadoSectores`) y los 30 objetos de G‑H17. | `js/32-objetos.js` con su prueba. |
| **C‑M30** (Nueva York) | **Craquear Manhattan:** `geo/territorio.py --id nueva_york --bbox=-74.03,40.68,-73.90,40.88`, partido en **sectores de 1 km** que se cargan alrededor del jugador (MC4 por sectores), con su prueba de memoria en un celular medio. | `datos/nueva_york/` y `ciudades/nueva_york.json` |
| **C‑M31** (Nueva York) | **Mundo redondo:** curvatura en el sombreador (d²/2R) y vista de planeta con atmósfera (dispersión de Rayleigh simple) y estrellas al alejarse del mapa. | `js/45-gl.js` |
| **C‑M16** | **Gancho `textura`** en las losas: las texturas de C‑A5 como patrones en metros, con respaldo procedural (`Rudeza`), y su prueba. |
| **C‑M17** | **Lluvia y atmósfera que se ven** (R02, R03 y R09): asfalto mojado más oscuro, charcos con reflejo y salpicaduras, y niebla de distancia en la maqueta y la lateral, sin pasar de 2 ms por cuadro. |
| **C‑M1** | **Auditoría de lo nuevo**: `js/16-estilos.js`, `js/29-arboleda.js`, `Rudeza` en `js/40-dibujo.js`, `js/87-pieles.js`, `js/88-vida.js` y `js/89-exportar.js`. Una tabla con archivo:línea, severidad, escenario y *diff*. |
| **C‑M18** | **Motores potentes**: abrir `node motor.mjs exportar guatape` en **Godot 4** (y, si se puede, Unity y Unreal); un proyecto mínimo que lea `escena.json` y ponga los árboles con `MultiMeshInstance3D`; y una vista de Motor City con **three.js o WebGPU** registrada en `MC.Vistas` (`docs/MOTORES-POTENTES.md`). |
| **C‑M20** | **API de construcción por código y pincel de mundo** (R18 *VoxPix* y R10 *Town Brush*): `city.calle(puntos, op)`, `city.edificio(x, y, ancho, fondo, alto, op)`, `city.arbol(x, y, especie)`, `city.luz(x, y)` y un mundo que se arma desde `escena.json`, validado con `schemas/escena.schema.json` (`MC.Contratos.validar`). Con eso, una IA construye barrios enteros por código. |
| **C‑M21** | **Peso del cuerpo y del vehículo** (R06, R07, R09, R11–R13, R20 y R21): suspensión por rueda con rayos, balanceo de la carrocería, cosas que se rompen (conos, vallas), IK de pies en escalones, animaciones cotidianas (abrir puertas, reparar, sentarse), tablero en primera persona con limpiaparabrisas, taller con rayos X y gráficas de suspensión y agarre en la telemetría. Sin pasar de 2 ms por cuadro, y la física igual en cualquier calidad gráfica. |
| **C‑M22** | **Guardado y mundo por sectores** (entrega §11 y §12.3): `MC.Guardado`, con `schema_version`, IDs estables y migradores; sectores activos y dormidos que recuerdan los cambios (huellas, objetos rotos, grafitis) al volver. |
| **C‑M19** | **Estilo de 1 bit con trama estable**, como *Return of the Obra Dinn*: umbral contra una trama de ruido azul que no tiemble al mover la cámara. Y semitono por luminancia en la sombra del cómic. |
| **C‑M15** | **Terreno**: la capa `agua` precalculada en el MC4, y el carro que se inclina y patina en barro y nieve. |
| **C‑M9, C‑M12, C‑M10, C‑M14, C‑M11** | Tráfico con propósito, sombras sobre muros, casa con A* y dos habitantes, distritos y políticas, y pueblo orgánico (§10.2). |
| **C‑M2 a C‑M8** | Redes precalculadas, raster, direcciones, storylets, accesibilidad y pruebas que faltan (§10.2). |

**Cómo entregas:**
- **El arte:** en `arte/chatgpt/`, con el mismo formato de `arte/gemini/` (atlas `.webp` o `.png` más `manifiesto.json`).
- **El código:** commits en la rama `claude/motor-city-engine-xu7p4y`, con `node motor.mjs prueba --navegador` en verde y cada mejora con su prueba.
- **El resumen:** `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`.

---

## Las IAs de los juegos
Cada juego tiene su propio `TAREAS-IA.md` en la raíz de su repositorio:
- **Juega EnCicla** (`BicicletasUno`): migrar a `motor-city/` y el estilo 2.6.
- **El Metro** (`MetroZero`): su protocolo de 7 pasos y la migración.
- **Run Scooter** (`RunRunZero`): sigue independiente.

## Claude · la IA del motor
- **3.0:** mundo único 3D con cámaras aéreas, fachadas, árboles low-poly, artilugios físicos, mapa grande y la investigación de cámara.
- **2.10:**
  - unió las ramas viejas de los juegos;
  - instaló las skills de los videos;
  - quitó el leer la pantalla en el cómic y el 1 bit;
  - aligeró los atlas;
  - arregló `rutaA`;
  - creó el público simulado.
- Une las entregas (arte de ChatGPT en `MC.Pieles` y código de Codex).
- Mantiene `docs/PEDIDOS.md`.
- Sigue con *Motor City* (carreras) y *Extremo* (§9.7).
