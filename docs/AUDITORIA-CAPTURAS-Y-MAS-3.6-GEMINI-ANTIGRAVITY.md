# Auditoría visual 412 × 860, pruebas 3.6 y propuesta para la pestaña Más · Gemini (Antigravity)

**Fecha:** 23 de noviembre de 2026 · **Rama:** `antigravity/encicla-3.6` (base `v3.5.0` @ `55bf5d7`) · **Autoría:** Gemini (Antigravity).  
**Alcance:** Entregas **A-1, A-2, A-3 y A-4** del plan `docs/PEDIDOS-Y-PLAN-3.5-Claude.md` § 3.4, más reporte de estado de los encargos de imagen **G-130 y G-131** (§ 3.3).

---

## 1. Perfil y alcance de la auditoría visual (`412 × 860`)

- **Dispositivo simulado:** Chromium vía Playwright con `viewport: { width: 412, height: 860 }`, `deviceScaleFactor: 2`, `isMobile: true`, `hasTouch: true`.
- **Artefacto probado:** `dist/juega-encicla.html` (HTML único offline, sin internet ni librerías).
- **Errores en consola / `pageerror`:** **0** en todas las pantallas capturadas.
- **Capturas revisadas manualmente (21 pantallas + 6 verificaciones tras corrección):** los 12 modos de Gemini (`copa`, `domicilio`, `monitoreo911`, `planeador`, `metro2d`, `palmas`, `traffix`, `despacho`, `maquinista`, `circuito`, `moravia`, `roguelite` + selección de mejoras `roguelite-perks`), las 4 pestañas del hub **🗺️ Valle Vivo** (`act`, `arcos`, `spots`, `rpg`) y el recorrido completo de la pestaña **Más** (4 tramos de scroll).

---

## 2. Tabla `Captura → Hallazgo → Gravedad`

Escala de gravedad: **Alta** (tapa interfaz o impide cumplir metas), **Media** (solapamiento parcial, desborde o fricción notable), **Leve** (detalle estético o menor), **OK** (sin defectos visibles).

| Captura (412 × 860) | Hallazgo visual y funcional | Gravedad | Estado en `antigravity/encicla-3.6` |
|---|---|---|---|
| `01-copa` · Copa del Valle | HUD superior, minimapa, columna izquierda, pill inferior y joystick legibles sin choques. El aviso inicial (`coach`) roza brevemente la etiqueta `Mateo (Sprint)` y `MAPA` cruza el nombre de calle detrás. | Leve | Observado (temporal al inicio; no bloquea manejo). |
| `02-domicilio` · Domicilio Sostenible | Flecha naranja centrada bajo `#goalsMini`, minimapa y contador claros. El botón `3D` pasa sobre nombres de calles que se desplazan en el mapa. | Leve | Observado (comportamiento normal del riel fijo). |
| `03-monitoreo911` · Monitoreo 911 | El anillo rojo de incidentes (`r = 18 px`) tapaba las letras de los sectores (`Bello`, `Centro`, `Poblado`, dibujados en `sy + 20`), y la fila inicial de unidades (`y = 0.52`) rozaba el incidente de `Centro`. | **Media** | **Arreglado y verificado** en `src/js/99p-ciclovia-skate-runner.js` (`sy + 29`, unidades en `y = 0.61`). |
| `04-planeador` · El Planeador | 8 nodos, barra superior y 4 obras inferiores con contraste alto y cero solapamientos. Fondo azul liso sin silueta del río Medellín. | Leve | OK funcional; sugerencia visual menor (dibujar cauce sutil). |
| `05-metro2d` · Metro 2D Lateral | HUD y botones (`🛑 FRENAR`, `▶ ACELERAR`, 48 px) limpios. Debajo del viaducto (`H * 0.68`) quedaba el cielo crema `#fde0a6` detrás de las columnas en lugar de suelo/río; pendiente además el arte lateral `C-131`/`99w-capas.js`. | **Media** | **Respaldo arreglado y verificado** en `src/js/99p-ciclovia-skate-runner.js` (orilla verde, ciclorruta `#4a9a2c` y río azul bajo el viaducto + `bot()` reforzado). |
| `06-palmas` · Bajada por Las Palmas | Cero solapamientos; botones inferiores grandes y claros, barra `Ley 1811 (1,5 m)` legible. Silueta ciclista y montañas minimalistas a la espera de capas `C-132`. | Leve | OK funcional (esperando capas `C-132` / `K-2`). |
| `07-traffix` · Semaforero del Valle | `Pasaron 0/8 · choques 0` bien separado debajo de `#goalsMini`; botones `SIGA`/`PARE` claros. El aviso inicial (`coach`) cubre parcialmente `PARE` los primeros segundos. | Leve | Observado (aviso inicial desaparece al tocar). |
| `08-despacho` · Despacho del Valle | 1) `#goalsMini` (`y = 86–103`) se solapa sobre el subtítulo `Bien 0 · combo 0 · precisión 100%` (`y = 92` en `45-mg2.js`). 2) **Fallo lógico:** las metas leían `okN`/`badN` en vez de `ok`/`wrong` (`MGRutas`), por lo que la meta obligatoria nunca avanzaba de `0/12`. | **Alta** (lógica) / **Media** (HUD) | **Lógica arreglada** en `src/js/99n-controles-liberado.js` (`sub.ok` / `sub.wrong`). Solape de `y = 92` en `45-mg2.js` reportado a Claude (archivo núcleo fuera de prefijo `99n–99q`). |
| `09-maquinista` · Maquinista Línea A | Mismos dos hallazgos que Despacho: `#goalsMini` pisa `Bien 0 · combo 0 · precisión 100%` (`45-mg2.js`) y metas usaban `okN`/`badN` en lugar de `ok`/`wrong`. | **Alta** (lógica) / **Media** (HUD) | **Lógica arreglada** en `src/js/99n-controles-liberado.js`. Solape de `45-mg2.js` reportado a Claude. |
| `10-circuito` · Circuito LED EnCicla | 1) `#goalsMini` pisa `Giros: 0` (`y = 92` en `45-mg2.js`). 2) **Fallo lógico:** la meta principal evaluaba `!!this.sub.solved`, que en `MGLoop` es una función (siempre `true`), mostrando `✓ listo` desde 0 giros. | **Alta** (lógica) / **Media** (HUD) | **Lógica arreglada y verificada** en `src/js/99n-controles-liberado.js` (`this.sub.solved()`). Solape de `45-mg2.js` reportado a Claude. |
| `11-moravia` · Laberinto de Moravia | 1) `#goalsMini` pisa `Movidas: 0` (`y = 92` en `45-mg2.js`). 2) **Fallo lógico:** las metas leían `sub.solved` y `sub.got` (inexistentes en `MGLaberinto`), impidiendo aprobar la meta principal aunque se llegara a la flor. | **Alta** (lógica) / **Media** (HUD) | **Lógica arreglada** en `src/js/99n-controles-liberado.js` (`bx === gx && by === gy` y `moves <= n * 3`). Solape de `45-mg2.js` reportado a Claude. |
| `12-roguelite` · Turno Roguelite (en ronda) | La píldora `🎲 ROGUELITE · Ronda 1/3 · 🔦 Tótem Óptico` (`y = 132`) caía **encima del título** `SEÑAL DE LA ESTACIÓN` del minijuego hijo. | **Alta** | **Arreglado y verificado** en `src/js/99n-controles-liberado.js` (píldora reubicada al pie `V.h - 22`, cero colisión). |
| `12b-roguelite-perks` · Turno Roguelite (mejoras) | Las 3 tarjetas de mejora (`Reloj Serena`, `Escudo Cívico`, `Cadena Dorada`) lucen nítidas, centradas, ≥ 68 px de alto y con contraste excelente. | OK | Sin cambios necesarios. |
| `13-hub-act` · Hub Valle Vivo (24 Actividades) | Rejilla 2×N muy legible y botón ámbar claro. Los 4 botones de pestaña `.seg.wrap` miden `30 px` de alto (< 44 px WCAG táctil), y `▶ Seguir rodando` queda al final de `1.900 px` de scroll (sin `✕` arriba). | Leve | Documentado para pase de accesibilidad de Claude (§ 4.5). |
| `14-hub-arcos` · Hub Valle Vivo (Encargos) | El contenedor interno `max-height: 50vh; overflow: auto` creaba **doble scroll** dentro del modal y ocultaba la sección `💬 Encargos de los vecinos` (15 historias) en el borde inferior. | **Media** | **Arreglado y verificado** en `src/js/99q-mundo-vivo-rpg.js` (eliminado el scroll anidado; ahora fluyen los 6 arcos y los 15 encargos en un solo scroll limpio). |
| `15-hub-spots` · Hub Valle Vivo (Skate & Copa) | Tarjetas legibles con botones `🏁 Correr`, `📍 Ir ahora` y `🧭 GPS` (42 px). Los 3 circuitos de Copa dejan un hueco vacío en la segunda fila de la rejilla de 2 columnas. | Leve | OK funcional; ajuste cosmético opcional. |
| `16-hub-rpg` · Hub Valle Vivo (Comunas y RPG) | Tarjetas de 4 habilidades y 6 comunas limpias y contrastadas. Pestañas superiores `.seg.wrap` en 30 px. | Leve | OK funcional. |
| `17-mas-top` · Pestaña Más (tramo 1) | Mezcla ajustes de sonido con `🔓 Todo liberado`, `📏 Medir este celular` y `🧪 Modo prueba` arriba del todo. En `🔓 Todo liberado` el interruptor `.sw.on` sobresale ~2 px por la derecha cuando el texto ocupa 3 líneas (`flex-shrink` en `.sw`). | **Media** | Reportado en tabla + propuesta § 3 (archivo `99a-fluidez.js` / `style.css`, fuera de prefijo). |
| `18-mas-mid1` · Pestaña Más (tramo 2) | `Controles` y `⚙️ Flexibilidad` aparecen seguidos y **ambos abren el mismo modal** (`UI.controles(false)`). Las filas `Velocidad de la bici` (`229 px`) y `Cámara` (`195 px`) se estiran verticalmente en 2 columnas estrechas con botones `.seg` de `30 px`. | **Media** | Incluido en propuesta de agrupación § 3. |
| `19-mas-mid2` · Pestaña Más (tramo 3) | **Desborde horizontal:** en `Cámaras del mundo 3D y estilo` (`99o-mundo3d-camaras.js`), el botón `👁️ 3D Primera Persona` se salía del borde derecho de su marco (altura de fila `297 px`). Además `Estilo musical` aparece 2.000 px debajo de `Música`. | **Media** | **Desborde arreglado y verificado** en `src/js/99o-mundo3d-camaras.js` (fila apilada en columna; `👁️ 3D Primera Persona` cabe sobrado). Reorden de `Estilo musical` incluido en § 3. |
| `20-mas-bot` · Pestaña Más (tramo 4) | 11 botones de 52 px apilados al final + tarjeta `¿Sabías que?`. El scroll total de la pestaña llega a **`3.154 px`** (~3,7 pantallas móviles). | **Media** | Resuelto en la propuesta de agrupación § 3. |

> **Nota rápida para `45-mg2.js` (Claude):** en los cuatro minijuegos clásicos envueltos como modos (`MGRutas`, `MGLoop`, `MGLaberinto`), la línea de estadísticas (`Bien 0…`, `Giros: 0`, `Movidas: 0`) se dibuja fija en `y = 92`, exactamente donde cae `#goalsMini` (`y = 86..103`) en `412 × 860`. Cambiar ese `92` por `Math.max(114, (View.hudB || 80) + 32)` en `45-mg2.js` elimina los 4 solapamientos de una sola vez.

---

## 3. Inventario real de la pestaña **Más** y propuesta de agrupación (sin quitar ninguna opción)

### 3.1 Diagnóstico del DOM actual (`412 × 860`)
Hoy `#tab-mas` mide **`3.154 px`** de alto y contiene **33 controles** (**22 filas de ajuste `.opt`** —los «21» de la 3.5 más el bloque de 3D— y **11 botones de destino**). Como 11 módulos distintos inyectan su fila enganchándose a `[data-tamopt]` o `[data-zoom]` vía `UI.renderMas`, opciones hermanas quedaron separadas por más de dos pantallas (`Música` en la fila 2 vs. `Estilo musical` en la fila 22; `📏 Medir` y `🧪 Modo prueba` arriba vs. `Diagnóstico (bot)` al final).

### 3.2 Propuesta: 6 secciones claras con `<details>` nativo (0 librerías, 0 opciones eliminadas)

Las **33 opciones exactas** se conservan íntegras. Dos secciones prioritarias para quien llega a jugar abren desplegadas (`open`), y las otras cuatro se despliegan con un toque mediante `<details class="mas-sec"><summary>…</summary>…</details>` (HTML5 nativo, accesible por teclado y lector de pantalla, peso ~1 KB de JS/CSS). El scroll inicial baja de **`3.154 px`** a **`~920 px`** (de ~3,7 pantallas a ~1,1 pantallas).

| # | Sección propuesta | Estado inicial | Opciones que agrupa (conservando las 33 íntegras) | Cantidad |
|---|---|---|---|---:|
| **1** | **🎮 Manejo, ritmo y controles** | **Abierta** | 1. Controles (`🎮 Ajustar`) · 2. ⚙️ Flexibilidad (`Ajustar`)* · 3. 🛞 Asistencia de manejo · 4. Ritmo del juego (`tranquilo / normal / arcade`) · 5. Velocidad de la bici (`×0,8..×2`) · 6. Mano guía (ayudas) · 7. Vibración | 7 |
| **2** | **🗺️ Tu viaje, historia y comunidad** | **Abierta** | 8. 📔 Mi diario y habilidades · 9. Mi ciclista y tienda · 10. 📖 La historia · 11. 👥 Personajes · 12. 🏆 Ranking · 13. Jugar con amigos · 14. Escenas de la historia (interruptor) · 15. ¿Qué es EnCicla? · 16. Apoya la bici pública · 17. Cómo jugar · 18. Créditos y aviso | 11 |
| **3** | **🎥 Cámaras, vista y gráficos** | Plegada | 19. Cámaras del mundo 3D y estilo (6 vistas + Pixel World) · 20. Cámara (inclinación/seguimiento 3D) · 21. Zoom del mapa (`lejos / normal / cerca`) · 22. Gráficos (`Ciudad 3D / Pixel clásico`) · 23. Vista del mapa (`Cenital / Panorámica`) | 5 |
| **4** | **🔊 Sonido y música** | Plegada | 24. Efectos de sonido · 25. Música · 26. Estilo musical (`Automático / Jazz / Lo-fi / Soft rock / Electrónica`) | 3 |
| **5** | **♿ Accesibilidad y lectura** | Plegada | 27. Tamaño de textos y botones (`Pequeño / Mediano / Normal / Grande`) · 28. Alto contraste · 29. Colores para daltonismo | 3 |
| **6** | **🧪 Pruebas, diagnóstico y acceso abierto** | Plegada | 30. 🔓 Todo liberado · 31. 📏 Medir este celular (`Medir`) · 32. 🧪 Modo prueba (`Ver` + interruptor) · 33. Diagnóstico (bot de pruebas) | 4 |
| — | *Pie informativo* | Siempre visible | Tarjeta **¿Sabías que?** (dato diario de EnCicla) | — |

\* **Nota de deduplicación opcional (decisión del autor/Claude):** hoy `Controles` (`81-controles.js`) y `⚙️ Flexibilidad` (`60-ui.js`) invocan exactamente `UI.controles(false)`. Se pueden conservar ambas entradas en la sección 1 (cero pérdida) o fundir su texto en una sola fila `🎮 Controles y flexibilidad` sin perder ninguna función.

### 3.3 Cómo implementarlo sin romper los 11 ganchos `UI.renderMas` existentes
En lugar de reescribir los 11 archivos que envuelven `UI.renderMas`, basta un único bloque ligero al final de la carga (por ejemplo en la ronda de orden de entrada de Claude § 4.3):
1. Dejar correr la cadena completa de `UI.renderMas()` tal como hoy (así todos los `onclick`, atributos `data-*` y pruebas existentes como `V6` y `V7` siguen encontrando cada botón en `#tab-mas` sin cambiar selectores).
2. Reubicar los nodos DOM reales (`appendChild`, conservando todos sus *event listeners* intactos!) dentro de los 6 `<details class="mas-sec">` según un mapa de selectores (`[data-sw="sfx"]`, `[data-mstyle]`, `[data-v3m]`, `[data-medir]`, `[data-prueba]`, `[data-act="historia"]`, etc.). Cualquier opción futura no listada cae automáticamente en la sección 1 o 6 (nunca desaparece).
3. Pulido CSS complementario (WCAG 2.2 AA en `412 × 860`):
   - `.opt:has(.seg.wrap) { flex-direction: column; align-items: stretch; gap: 8px; }` — elimina columnas estrechas y desbordes en `Tamaño`, `Velocidad`, `Cámara`, `Estilo musical` y `Cámaras 3D`.
   - `.opt .sw { flex-shrink: 0; }` — corrige el desborde de 2 px visto en `🔓 Todo liberado`.
   - `.seg button { min-height: 40px; padding: 6px 10px; }` (44 px si cabe) — acerca los segmentos a los 44 px táctiles recomendados.

---

## 4. Resumen de pruebas A-1, A-2 y A-3 (sección `V8` en `tests/run.js`)

- **A-1 (`contenido/guion/encargos.json`):** +9 historias nuevas de 3 pasos para **Yuli, Kevin, Ing. Paola, Wílson, Don Rubén, Doña Marleny, Don Libardo, Jhon y Rosalba** (historia nueva sobre el mapa del río y la Línea A, distinta a su boleto). Total: **15 historias** (los 15 vecinos de `Trama.personajes()` cubiertos al 100 %, con pasos a pie y de noche, respetando el reparto con doble rol de `trama_valle.json`).
- **A-2 (`contenido/guion/frases.json`):** +40 frases nuevas en español de Colombia para todo público (**+10 `timbre`**, **+8 `peaton`**, **+6 `semaforo`**, **+6 `truco`**, **+10 `ambiente`** en los 5 lugares reales de `99s-ciudad-responde.js`). Total: **88 frases** (longitud máxima 59 caracteres para caber nítido en la burbuja de 2 renglones).
- **A-3 (`tests/revolucion-encicla.js` sección `V8`, llamada desde `tests/run.js`):** ejecuta el bot con `JE.game.paused = true` y `G.update(1 / 30)` hasta el final en los **12 modos de Gemini** (`copa`, `domicilio`, `monitoreo911`, `planeador`, `metro2d`, `palmas`, `traffix`, `despacho`, `maquinista`, `circuito`, `moravia`, `roguelite`) y verifica para cada uno: **termina (`done === true`)**, **suma puntos (`score > 0`)** y **cero errores**, además de validar las 15 historias de A-1 y las 88 frases de A-2.

---

## 5. Estado de los encargos de imagen § 3.3 (`G-130` y `G-131` · Nano Banana)

Al invocar el generador de imágenes (`generate_image` · modelo `gemini-3.1-flash-image`) durante esta sesión, el servidor devolvió:

> `RESOURCE_EXHAUSTED: Quota exceeded for model gemini-3.1-flash-image: retry after 3h47m`

Siguiendo la política estricta de calidad de `docs/AUDITORIA-C99.md` (donde se descartaron los PNG generados con código por no superar el dibujo actual), **no se fabricaron sustitutos procedimentales** haciéndolos pasar por arte de Nano Banana.

Apenas se restablezca la cuota (o si el autor los genera directo en Gemini con Nano Banana), los dos prompts fusionados con el prompt base `docs/IA-ENCICLA.md` § 6.0 quedan listos para pegar y archivar en `arte/entregas/<fecha>-gemini-g130-g131/` con `manifiesto.json` (SHA-256) y `LEEME_ENTREGA.md`:

- **`g130_murales.png` (1:1 · cuadrícula 4×4 · fondo `#FF00FF`):** 16 murales alegres de la Comuna 13 en pixel art 16-bit (6:5 por muro, contorno `#0a1424`, paleta EnCicla `#9bd341, #ffc93c, #ff6b5a, #56c7ff, #c0623b, #f4efd8`; colibríes, guacamayas, guayacanes, caras sonrientes de niños y abuelos, manos amigas, bici, sol sobre montañas, corazón con hojas, notas musicales, cable, peces del río, estrellas; **cero texto, letras, números, logos, firmas, personas reales ni violencia**).
- **`g131_ancla_lateral.png` (16:9 · 640×360 · perfil puro):** persona joven en bici urbana blanca con canasta (camiseta `#9bd341`, pantalón `#0e2d55`, casco blanco) rodando por ciclorruta verde `#4a9a2c` junto al río Medellín en la mañana, con el viaducto del Metro y Cerro Nutibara al fondo (**cero texto ni logos**).

---
*Firmado: **Gemini (Antigravity)** · 23 de noviembre de 2026.*
