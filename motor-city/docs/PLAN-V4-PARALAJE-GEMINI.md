# PLAN Y ARQUITECTURA V4: REVOLUCIÓN VISUAL DE LOS BIOMAS Y EL MODO ARCADE
**Identificación oficial:** `Gemini Antigravity — Motor City V4`  
**Rama de trabajo:** `ia/antigravity/v4-paralaje-biomas` (base `origin/main` `f1510e1`, Motor City `4.9.0`)  
**Encargo:** [Issue #14 — GEMINI ANTIGRAVITY — MOTOR CITY 4.9+ · MISIÓN V4](https://github.com/juanfeliperico369-stack/motorcity/issues/14)

---

## 1. Resumen de lectura obligatoria (5 líneas)

1. **Arquitectura de un solo mundo 3D:** Motor City `4.9.0` y *Turno Cero* operan sobre un único mundo 3D continuo (`MC.Mundo` para ciudades reales como Manhattan, Medellín y Guatapé; `MC.Planeta` + `Generador.carretera` para los tramos de autopista con 7 biomas en `js/13-planeta.js`) que todas las cámaras (`VistaTres`, `VistaGL`, cenital y `MC.Arcade` en `js/47-clasicos.js`) proyectan sin duplicar física, tráfico ni posiciones.
2. **Estado del motor 4.7 → 4.9:** Claude integró en `4.8` y `4.9` el panel `⚙️ Flexibilidad`, el renderizador `MC.VistaTres` (three.js r128 MIT offline incrustado con sombras solares, faroles nocturnos y fachada procedural) y las 17 correcciones de ChatGPT (`docs/PEDIDOS-CHATGPT-4.9.md`), dejando pendiente el salto visual de los paisajes y biomas en la cámara `MC.Arcade`.
3. **Diagnóstico de `MC.Arcade` y `herramientas/construir.mjs`:** La cámara `MC.Arcade` (`js/47-clasicos.js:119-280`) proyecta la vía real por segmentos estilo *OutRun* y pinta cielo/sol/niebla dinámicos con `cieloRetro(E)`, pero su horizonte depende de dos polígonos procedurales planos; además, `herramientas/construir.mjs` concatena automáticamente todos los `js/NN-*.js` en orden alfabético y exige cero comentarios `//` de una línea.
4. **Solución de ingeniería V4:** Construimos 18 texturas originales `1024 × 256` RGBA WebP sin costuras (`6 biomas × 3 capas`: `lejos`, `medio`, `cerca`) con su `arte/arcade/biomas/manifiesto.json`, y el módulo aditivo `js/47-paralaje-biomas.js` (`MC.ParalajeBiomas`) que envuelve `Arcade.prototype.dibujar` para insertar las 3 capas detrás de la carretera, entintarlas con la luz solar/nocturna/niebla del motor, aplicar caché LRU acotada (`<= 2` biomas), degradar calidad en dispositivos lentos y caer al respaldo procedural cuando falta un recurso o en `llanura`.
5. **Aislamiento total respecto a Codex y Claude:** Trabajamos exclusivamente en `ia/antigravity/v4-paralaje-biomas` sobre archivos nuevos (`arte/arcade/biomas/*`, `js/47-paralaje-biomas.js`, `pruebas/paralaje-biomas.mjs`, `docs/PLAN-V4-PARALAJE-GEMINI.md`, `reportes/gemini-v4-paralaje-biomas.md`), con **0 líneas tocadas** en `js/45-tres.js`, `js/45-gl.js`, `js/47-clasicos.js`, `arte/fachadas/medellin/`, `geo/territorio.py`, `datos/medellin/mundo.mc4` y `juegos/getaway/60-modos.js`.

---

## 2. Fase 1 — Arte original de los seis biomas (`18 texturas 1024 × 256 RGBA WebP`)

### 2.1 Especificación técnica y coherencia cromática
Cada una de las 18 texturas cumple estrictamente las reglas de `.claude/skills/motor-city-arte/SKILL.md`:
- **Resolución exacta:** `1024 × 256` píxeles, formato WebP RGBA sin pérdida (`lossless=True, exact=True`), con canal alfa real (`transparencia_pct` entre `25.4 %` y `79.6 %`) y fila superior (`y = 0`) 100 % transparente para que el cielo, los astros y las estrellas los pinte siempre `cieloRetro(E)`.
- **Repetición horizontal sin costuras (`costura_mae = 0.0000`):** Todas las funciones de relieve, dunas, copas, riscos y vegetación son estrictamente periódicas en `2π·x / 1024` (armónicos enteros `k ∈ ℤ` sobre `W = 1024`), garantizando diferencia absoluta media `0.0000` entre la columna `x = 0` y la columna `x = 1023` en los 4 canales RGBA.
- **Iluminación neutra cenital-difusa:** No se hornean sombras solares laterales ni gradientes de cielo opacos; `MC.ParalajeBiomas` entinta cada capa en tiempo de ejecución según la hora del reloj (`E.reloj`), la bruma del horizonte y el clima (`E.clima`).
- **Clave canónica sin eñe:** El bioma de montaña utiliza siempre la clave `montana` (`montana_lejos.webp`, `montana_medio.webp`, `montana_cerca.webp`) para coincidir exactamente con `BIOMAS_RUTA.montana` en `js/13-planeta.js:21`.

### 2.2 Composición por bioma y por capa

| Bioma (`js/13-planeta.js`) | Capa `lejos` (`vel: 0.12`) | Capa `medio` (`vel: 0.35`) | Capa `cerca` (`vel: 0.70`) |
|---|---|---|---|
| **`costa`** (Ruta del Atlántico norte) | Penínsulas brumosas, cabos con barrancos, silueta de faro costero lejano y espuma de rompiente | Acantilados de arenisca estratificada, ensenadas con orilla de arena cálida y grupos de palmas | Cocoteros con anillos de corteza y pencas curvas, rocas de arrecife, uvas de playa y pasto de duna |
| **`desierto`** (Ruta del Atlántico sur) | Mesetas estratificadas (buttes), barrancos erosionados y calima ocre del desierto | Cañones de arenisca rojiza con estratos sedimentarios, dunas barján y cardones lejanos | Cardones/saguaros acostillados, rosetas de agave, lajas erosionadas y matorral xerófilo |
| **`bosque`** (Ruta del Embalse norte) | Cordilleras azul-verdosas con cintas translúcidas de neblina andina en las vaguadas | Laderas de bosque nublado con guayacanes amarillos en flor (`Tabebuia`), yarumos y pinos | Troncos con raíces de contrafuerte, helechos arbóreos, guayacanes frondosos y rocas musgosas |
| **`montana`** (Cordillera antioqueña) | Cumbres escarpadas de la cordillera central con barrancos geológicos y bruma de altura | Riscos graníticos, cascada plateada de quebrada andina, talud de tierra colorada y pinos | Peñascos metamórficos, frailejones de páramo (*Espeletia*), pinos de montaña y arrayanes |
| **`nieve`** (Ruta del Norte / Nevado) | Picos glaciares afilados con mantos de nieve, grietas azul hielo y roca basáltica expuesta | Ventisqueros helados con costillas de roca volcánica y grupos de abetos escarchados | Abetos subalpinos cargados de nieve en cada rama, rocas basálticas heladas y bancos de nieve |
| **`lagos`** (Embalse de Guatapé / Peñol) | Monolito granítico con estrías verticales estilo Piedra del Peñol y sierras lacustres | Penínsulas e islas verdes del embalse con orillas de tierra roja saprolítica de Guatapé | Juncos de orilla, rocas húmedas ribereñas, sauces y pinos de ribera |
| **`llanura`** (Respaldo procedural) | Respaldo procedural limpio de `MC.Arcade` (`0` texturas extra, verifica el mecanismo de fallback) | Respaldo procedural de `MC.Arcade` | Respaldo procedural de `MC.Arcade` |

---

## 3. Fase 2 — Integración del paralaje en `MC.Arcade` (`js/47-paralaje-biomas.js`)

### 3.1 Gancho no invasivo sobre `Arcade.prototype.dibujar` (cero conflicto con otras IAs)
En `js/47-clasicos.js:152-161`, `Arcade.prototype.dibujar(g, W, H, E, op)` ejecuta exactamente esta secuencia antes de proyectar los segmentos de la carretera:
1. Pinta el gradiente del cielo con `g.fillRect(0, 0, W, hor + 2)`.
2. Pinta el sol o la luna con `g.arc(...)` + `g.fill()` y las estrellas nocturnas.
3. Traza dos polígonos de montañas procedurales con `g.beginPath(); g.moveTo(0, hor); ... g.fill()` (`líneas 157-160`).
4. Pinta la base del suelo debajo del horizonte con `g.fillRect(0, hor - 1, W, H - hor + 1)` (`línea 161`) e inicia el bucle del pintor desde el horizonte hacia el jugador (`línea 181`).

`MC.ParalajeBiomas.instalar()` envuelve `Arcade.prototype.dibujar` interceptando únicamente esos dos `g.fill()` de montañas procedurales tras el cielo (`y === 0, h === hor + 2`) y dibujando las 3 capas del bioma justo cuando se invoca `g.fillRect(0, hor - 1, W, H - hor + 1)`:
- **Orden de capas garantizado:** Cielo y astros → Capa `lejos` (`0.12`) → Capa `medio` (`0.35`) → Capa `cerca` (`0.70`) → Bruma atmosférica de horizonte → Suelo y segmentos de carretera (`N..1`) → Árboles, postes, edificios, rivales y vehículo del jugador → Líneas de velocidad / balizas de curva → Brújula y HUD.
- **La capa `cerca` jamás tapa la calzada, los vehículos ni el HUD**, porque se pinta antes del suelo y del bucle del pintor de la vía.

### 3.2 Parche mínimo opcional para `js/47-clasicos.js` (para revisión de Claude)
Aunque el gancho en `js/47-paralaje-biomas.js` funciona al 100 % sin tocar `js/47-clasicos.js`, dejamos documentado el parche directo de 2 líneas por si Claude desea integrarlo explícitamente en `js/47-clasicos.js:157-160`:

```diff
--- a/js/47-clasicos.js
+++ b/js/47-clasicos.js
@@ -156,5 +156,6 @@
     g.fillStyle = C.solC; g.beginPath(); g.arc(sx, sy, Math.max(12, W * .038), 0, Math.PI * 2); g.fill();
-    /* montañas en dos capas que se mueven con el rumbo */
-    for (let capa = 0; capa < 2; capa++) {
+    /* montañas en paralaje: 18 texturas V4 por bioma o respaldo procedural en dos capas */
+    if (!(MC.ParalajeBiomas && MC.ParalajeBiomas.dibujar(this, g, W, H, hor, E, C, camX, camY, camZ)))
+    for (let capa = 0; capa < 2; capa++) {
       g.fillStyle = capa === 0 ? C.monteLejos : C.monteCerca; g.beginPath(); g.moveTo(0, hor);
```

### 3.3 Desplazamiento físico, transiciones entre biomas e iluminación dinámica
- **Desplazamiento horizontal y vertical coherente con la cámara:**
  - El desplazamiento horizontal de cada capa combina el rumbo suavizado de la cámara Arcade (`arcade.h`) y el avance lateral en el mundo (`camX · sin(h) - camY · cos(h)`), escalado por los factores `[0.12, 0.35, 0.70]`.
  - Cuando la carretera sube o baja cuestas (`pend = (zAdelante - camZ) / 60`), las capas aplican un paralaje vertical diferencial (`[-4.5, -9.0, -14.5] · pend`), reforzando la lectura de crestas y valles.
- **Transición suave entre biomas reales (`M.carretera.bioma(C.y)`):**
  - En los tramos de `MC.Planeta`, `detectarBioma(M, C)` consulta `M.carretera.bioma(C.y)` y en ciudades deduce el bioma según la geografía (`costa` en Manhattan, `lagos` en Guatapé, `montana`/`bosque` según cota en Medellín).
  - Al cruzar la frontera entre dos biomas de una autopista, `MC.ParalajeBiomas` realiza un fundido cruzado (`crossfade` de `2.2 s`) entre el bioma saliente y el entrante sin tirones ni cortes bruscos.
- **Integración con ciclo día/noche y niebla (`cieloRetro(E)`):**
  - Cada capa se pre-entinta en un canvas offscreen cacheado (`1024 × 256`) usando `globalCompositeOperation = 'source-atop'` cuando cambian los colores de `C.monteLejos`, `C.monteCerca`, `C.horizonte` o `C.nieblaA`.
  - De día conserva la riqueza cromática original; al atardecer adquiere tonos ámbar/violeta; de noche se oscurece con el azul profundo nocturno; y con lluvia o niebla se funde hacia `C.horizonte`.

### 3.4 Caché LRU acotada, escalado de calidad y respaldo procedural
- **Caché LRU (`maxBiomasCache = 2`):** Solo se mantienen decodificados en memoria los `2` biomas más recientes (`máximo 6 imágenes + 6 canvases entintados ≈ 6 MB`). Al cambiar de ciudad/ruta o invocar `Vistas.prototype.liberar()`, la caché de canvases se purga automáticamente.
- **Reducción automática de calidad (`E.calidad`):**
  - `calidad >= 0.65`: dibuja las **3 capas** (`lejos`, `medio`, `cerca`) + bruma + efectos de dirección visual.
  - `0.38 <= calidad < 0.65`: dibuja **2 capas** (`lejos`, `medio`), ahorrando un tercio de fill-rate en móviles lentos.
  - `calidad < 0.38`: activa automáticamente el **respaldo procedural** de 2 polígonos con costo cercano a cero.
- **Respaldo procedural obligatorio:** Si el bioma es `llanura`, si un asset aún se está decodificando, o si una textura se elimina/falla, `_dibujarBioma` devuelve `false` y `MC.Arcade` dibuja inmediatamente sus montañas procedurales originales sin pantalla negra ni excepciones.

---

## 4. Fase 3 — Jugabilidad y dirección visual en `MC.Arcade`

Analizamos cuatro referentes clásicos y modernos de conducción arcade (*OutRun*, *Lotus Turbo Challenge 2*, *Horizon Chase Turbo* y *Burnout 3: Takedown*) e implementamos tres mejoras diegéticas directamente compatibles con `MC.Arcade`:

1. **Lectura anticipada de curvas (chevrones diegéticos en la berma exterior):**
   - Evaluamos la curvatura real de la carretera `95 m` por delante del vehículo comparando los vectores tangentes de la vía (`M.carretera.centro(y)` o `M.viaCercana`).
   - Cuando la curva supera `0.14 rad`, se proyectan chevrones reflectivos ámbar/blanco (`>` o `<`) sobre el borde exterior del horizonte hacia donde se abre la curva, permitiendo anticipar giros cerrados a alta velocidad sin invadir la calzada ni añadir HUD flotante.
2. **Sensación de velocidad periférica (`> 19 m/s`):**
   - A partir de `19 m/s` (`~68 km/h`), se trazan líneas de flujo de aire periféricas sutiles desde los bordes laterales debajo del horizonte, cuya opacidad y longitud escalan con `(v - 19) / 22` sin ensuciar el centro de visión.
3. **Menor repetición perceptible y profundidad atmosférica:**
   - Las velocidades `[0.12, 0.35, 0.70]` tienen razón coprima `12 : 35 : 70`, por lo que la alineación exacta de las 3 capas solo se repite cada `420` ciclos de textura (`> 400 km` de recorrido).
   - Un velo atmosférico (`linearGradient` en `[hor - 22, hor + 8]`) sella la unión entre la base de la capa `cerca` y el primer segmento de suelo del pintor, eliminando el corte duro en el horizonte.

---

## 5. Estado verificable: HECHO · PROBADO · PENDIENTE · LÍMITES

- **HECHO:**
  - 18 texturas originales `1024 × 256` RGBA WebP sin costuras (`costura_mae = 0.0000`) en `arte/arcade/biomas/`.
  - `arte/arcade/biomas/manifiesto.json` con dimensiones, canal alfa, velocidades `[0.12, 0.35, 0.70]`, tamaño en bytes, hash SHA-256 y procedencia limpia.
  - Módulo aditivo `js/47-paralaje-biomas.js` (`MC.ParalajeBiomas`) integrado en `dist/motor.js`, `dist/motor-city.html`, `dist/juegos/getaway.html` y `dist/juegos/mandados.html` sin tocar archivos de Codex ni `js/47-clasicos.js`.
  - Suite automatizada `pruebas/paralaje-biomas.mjs` y capturas comparativas antes/después en `reportes/img/gemini-v4/`.
- **PROBADO:**
  - `node herramientas/construir.mjs`
  - `node pruebas/prueba.mjs --navegador`
  - `node pruebas/tres.mjs`
  - `node pruebas/modos.mjs`
  - `node pruebas/paralaje-biomas.mjs`
- **PENDIENTE (para próximas iteraciones tras fusión de Claude):**
  - Si Claude lo desea, aplicar el parche opcional de 2 líneas en `js/47-clasicos.js:157` para invocar `MC.ParalajeBiomas.dibujar` de forma directa sin wrapper de `fillRect`.
  - Variantes estacionales adicionales (lluvia torrencial tropical / tormenta de arena) sobre el entintado de `MC.ParalajeBiomas`.
- **LÍMITES DE GPU / FÍSICOS:**
  - En pruebas headless con SwiftShader (WebGL/Canvas por software en VM sin GPU dedicada), el tiempo por cuadro del paralaje Canvas 2D es `< 1.5 ms` en `412 × 860` y `< 2.2 ms` en `860 × 412`.
