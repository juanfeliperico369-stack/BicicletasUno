# Revisión técnica, gráfica y de memoria del PR #7 (`ia/chatgpt/4-0-2-gemini-auditoria`)

- **Fecha:** 21‑nov‑2026 (sobre `origin/pr-7` y comparado contra `main` **4.0.1 `c898a0a`** y **4.0.2 `288a258`**)
- **Autora:** Gemini · Antigravity («hydrogen») — siguiendo `.claude/skills/motor-city-revision-ia/` y respondiendo al relevo `MOTOR_CITY_4_0_X_RELEVO_GEMINI_CHATGPT_NUEVA_FASE.md`
- **PR evaluado:** https://github.com/juanfeliperico369-stack/motorcity/pull/7 (`DRAFT`)
- **Veredicto:** **APROBABLE CON AJUSTES PUNTUALES + REBASE A 4.0.2** — la arquitectura de los 6 módulos nuevos compila limpia, pasa el **100 % de las pruebas automáticas (151/151 navegador local + 3/3 GitHub Actions)** y no introduce colisiones de ámbito, pero la inspección real en Chromium móvil (`412×860`) destapó **4 fallos concretos** que conviene corregir antes de fusionar en `main`.

---

## 1. Lista de revisión `motor-city-revision-ia` (verificación en vivo)

| Criterio | Resultado | Evidencia medida |
|---|---|---|
| Compilación (`node herramientas/construir.mjs`) | **PASS** | `motor.js 853 KB (68 archivos)` · `getaway.html 25.505 KB` · `mandados.html 5.299 KB` |
| Colisiones top-level `const`/`let` en `js/*.js` | **PASS** | `0` identificadores duplicados en el IIFE |
| Comentarios `//` en archivos nuevos (`js/*.js`) | **PASS** | `0` comentarios `//` añadidos por PR #7 (los 7 existentes eran previos en `13-planeta.js` y `45-gl.js`) |
| Pruebas unitarias nuevas (`pruebas/getaway-contenido.mjs`) | **PASS** | 7/7 bloques OK (`G-H21/22/23`, `C-M31`, `C-M32`, `C-M33`, `C-M34`, `C-M35`, `C-M36`) |
| Suite completa navegador local (`node motor.mjs prueba --navegador`) | **PASS** | **151/151 en verde (`90,6 s`)**, medianas CPU 4×: `cenital 5,6`, `ciudad3d 11,5`, `maqueta 15,8`, `lateral 13,1`, `pano 6,6 ms`; globo GPU `{"gpu":true,"error":"","ancho":412}` |
| GitHub Actions CI (`gh pr checks 7`) | **PASS** | **3/3 en verde:** `Núcleo, atlas y construcción` (17 s), `gltf` (12 s), `Chromium móvil y público simulado` (6 m 16 s) |
| Compatibilidad con `main` actual (`4.0.2`, `288a258`) | **REQUIERE REBASE** | `main` avanzó a **4.0.2** tocando `js/28-busqueda.js`, `js/32-fisica.js`, `js/37-manejo.js`, `juegos/getaway/{20,30,40,90}*.js`, `index.html`, `pruebas/prueba.mjs` y `CONTEXTO-RELEVO.md` |

---

## 2. Hallazgos reales tras perfilado de memoria y revisión visual (`412×860`)

### Hallazgo 1 (ALTA) — Fuga de memoria entre ciudades (`+57,6 MB` al viajar) y efecto real de `C‑M34`

Medición en Chromium móvil (`412×860`, DPR 2, CDP `Performance.getMetrics`) comparando **4.0.1** vs **PR #7**:

| Escenario | Carga (ms) | JS Heap antes (MB) | JS Heap después (MB) | JS Heap reservado (MB) | `sectorStats` en PR #7 |
|---|---:|---:|---:|---:|---|
| `nueva_york` (4.0.1 `c898a0a`) | 2.850 | 5,7 | **215,3** | 262,4 | — |
| `nueva_york` (**PR #7**) | 2.695 | 5,7 | **201,3** | 266,4 | `{"sx":5,"sy":10,"antes":0,"despues":0,"evictas":0,"sectores":9}` |
| `nueva_york` → `medellin` (**PR #7**, misma sesión) | 2.059 | 201,3 | **258,9** | **316,0** | `antes:0, despues:0, evictas:0` |

**Diagnóstico:**
1. En el arranque de Manhattan, `MC.Sectores1km` reporta `antes: 0, despues: 0, evictas: 0` (la mayoría de los `201 MB` vienen del MC4 descomprimido y arreglos base antes de decodificar regiones ED1, exactamente como PR #7 documentó con honestidad).
2. **Problema aún más crítico encontrado al cambiar de ciudad:** al viajar de **Manhattan → Medellín** en la misma sesión, el JS Heap **sube de `201,3 MB` a `258,9 MB` (`316,0 MB` reservados)** porque `planeta.mundo()` mantiene en caché el mundo completo de la ciudad anterior. **Arreglo inmediato (~3 líneas):** limpiar o limitar a 1 ciudad activa la caché de `MC.Planeta` al entrar en otra ciudad ahorraría ~`180–195 MB` de RAM de golpe antes incluso de terminar el streaming MC4 por sectores (`C‑M34` fase 2).

### Hallazgo 2 (MEDIA) — Revisión visual de `MC.GloboGPU` (`C‑M31`) en `412×860`

Captura real: [pr7-01-globo-webgl2.webp](./img/pr7-revision/pr7-01-globo-webgl2.webp)

- **Lo bueno:** el globo WebGL2 corre sin errores en Chromium móvil con atmósfera azul, biomas y el punto brillante de la posición del jugador.
- **3 defectos visuales observados a ojo:**
  1. **Esfera recortada lateralmente en retrato (`412×860`):** el radio proyectado excede el ancho de `412 px`, cortando los bordes izquierdo y derecho del planeta.
  2. **Etiquetas de ciudades desaparecidas:** al mostrarse el lienzo `#ggl` WebGL2, las etiquetas `Nueva York`, `Medellín` y `Guatapé` no aparecen sobre el globo (solo el punto cian del jugador).
  3. **Banda polar plana y costura vertical:** los polos norte/sur muestran una franja horizontal recta grisácea y hay una línea vertical tenue en el meridiano central del continente verde.

### Hallazgo 3 (MEDIA) — `MC.Piezas` (`C‑M35`) sin respaldo visual en modo 2D software + spawn de Manhattan junto al muelle

Captura real: [pr7-02-piezas-ny.webp](./img/pr7-revision/pr7-02-piezas-ny.webp)

- Al invocar `TURNO.piezasFisicas.soltar('capo' | 'puerta_izq' | 'rueda', TURNO.cuerpo)` (`piezasCount: 3`, `0` errores), las piezas se simulan correctamente en física y WebGL 3D, pero **no tienen dibujo de respaldo en la vista 2D** (cuando el dispositivo cae a respaldo 2D, no se ven ni las piezas sueltas ni el humo/fuego 3D). Añadir 8 líneas de proyección `V.aPantalla()` en `capas()` de `40-dibujo.js` las haría visibles en cualquier cámara.
- En Manhattan Calle libre, el punto de aparición (`📍 Stephanie and Fred S...`) nace junto al borde de agua/parque (activando inmediatamente el botón `🚤 Lancha`), en lugar de una avenida principal como `West 17th St`.

### Hallazgo 4 (MEDIA-ALTA) — Detalles de `G‑H21` y `G‑H23` que PR #7 dejó pendientes

1. **`gu_finca` de PR #7 (`6.2301, -75.1648`) — VERIFICADO APROBADO:** comprobado directamente en `datos/guatape/mundo.mc4` (`M.geoAMetros`, `M.lugares`, `MC.Terreno.aguaHonda`): cae en terreno libre (`suelo: 1`), tiene **acceso directo a agua honda a `< 40 m` (`agua40m: true`)** para llegar en lancha como pide la historia, y el comercio más cercano está a **`263 m`** (`Licorera el último y nos vamos` / `Finca Hotel Los Embrujos` a `284 m`). Es incluso más fiel al guion que nuestra coordenada alternativa anterior (`6.23636, -75.18186`, donde `agua40m` daba `false`). **Recomendación: adoptar `6.2301, -75.1648` de PR #7.**
2. **4 calles aún desfasadas en PR #7 (`juegos/getaway/10-contenido.js`):** PR #7 corrigió `gu_finca`, pero mantuvo las coordenadas originales de `ny_noah` (cae en Grand St), `ny_oeste` (interior de Hudson Yards junto a locales reales), `md_centro` (Calle 49 Ayacucho en vez de Calle 52 La Playa) y `md_envigado` (Transv. 34 Sur a 550 m de Calle 40 Sur). Aplicar las coordenadas exactas verificadas en [`2026-11-21-gemini-turno-cero.md`](./2026-11-21-gemini-turno-cero.md) § 2.
3. **Bug `'coro'` persiste en PR #7 (`juegos/getaway/20-juego.js:262`):** sigue llamando `Subt.decir([['coro', ...]])` cuando `'coro'` no existe en `TC.QUIEN` (cambiar a `'camara'`).
4. **Filtro `LENGUAJE_SUAVE` en PR #7 (`juegos/getaway/40-dibujo.js:8–15`):** amplió muy bien el vocabulario (`mierdas`, `jodido`, `cabrón`, `putas`, `carajo`, `coño`), pero sigue perdiendo la mayúscula inicial (`Hijueputas.` → `desgraciados.`), pluralizando `malparida!` → `miserables!` y dejando `TC.CONTRATOS` (`El sapo`) fuera de `suave()`.
5. **Unión de `contenido/paradas-carretera.json` (PR #7 vs PR #8):** PR #7 usa esquema agrupado por clave de bioma (`{ version, nota, biomas: { costa: [...] } }`) ya conectado a `js/13-planeta.js`; nuestro PR #8 incluye metadatos de ruta (`rutas`, `tipo` exacto de `PARADAS_RUTA`). **Recomendación de fusión:** conservar el esquema `biomas` de PR #7 para no romper `js/13-planeta.js` y enriquecerlo con los campos `tipo` y `rutas` de PR #8.

---

## 3. Avance directo de arte (`C‑A17` y base `C‑A16`) entregado en respuesta al relevo

Para atacar directamente el punto **#6** del relevo de ChatGPT (*«PBR UV y portada/editorial de cinco actos»*) sin chocar con `arte/chatgpt/turno-cero/`, se creó el paquete pintado completo y verificado visualmente (cero texto, cero marcas) en **`arte/gemini/turno-cero/`** (`1,2 MB` total en WebP):

- **Portada vertical (`1080×1920`, `162 KB`):** [`arte/gemini/turno-cero/portada-turno-cero.webp`](../arte/gemini/turno-cero/portada-turno-cero.webp)
- **5 láminas cinematográficas de acto (`1280×720`, sin texto):** `acto1-manhattan.webp`, `acto2-ruta-atlantico.webp`, `acto3-medellin-metro.webp`, `acto4-autopista-embalse.webp`, `acto5-guatape-amanecer.webp`
- **Atlas PBR 3×3 (`1024×1024`) + 9 losetas individuales (`256×256`) + catálogo con paletas extraídas y parámetros roughness/metalness:** [`arte/gemini/turno-cero/catalogo.json`](../arte/gemini/turno-cero/catalogo.json)
- **Prototipo interactivo offline (portada `412×860` sobre el pliegue + galería de actos + visor PBR + comparativa 4.0.1 vs PR #7):** [`arte/gemini/turno-cero/galeria.html`](../arte/gemini/turno-cero/galeria.html)
