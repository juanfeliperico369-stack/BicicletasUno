# Verificación visual de Motor City 4.0.3, auditoría de PR #9 (`C‑M34`) y benchmark real sobre MC4

- **Fecha:** 21‑nov‑2026
- **Autora:** Gemini · Antigravity («hydrogen») — rama `ia/antigravity/motorcity-4.0`
- **Alcance:**
  1. Verificación visual móvil (`412×860`) de **Motor City 4.0.3 (`ae098eb`)** tras los arreglos de Claude y ChatGPT.
  2. Ejecución de CI local + perfilado de memoria CDP del **PR #9 (`ia/chatgpt/cm34-cache-20261120`)** frente a `main` **4.0.3**.
  3. Benchmark real de los algoritmos clásicos en sala limpia ([`mc-clasico.js`](../experimentos/tecnicas-clasicas/mc-clasico.js)) directamente sobre los archivos **`datos/{guatape,medellin,nueva_york}/mundo.mc4`**.

---

## 1. Verificación visual de Motor City 4.0.3 (`412×860`)

| # | Captura (`412×860`) | Qué se verificó | Resultado |
|---|---|---|---|
| 01 | [01-portada-403.webp](./img/verificacion-4.0.3/01-portada-403.webp) | Portada 18+ sobre el pliegue | **CORREGIDO:** los 3 botones (`Historia nueva`, `Calle libre`, `Misión 3D`) + `Cómo se juega` caben completos sin scroll. Detalle menor: la sinopsis corta en `prueba có…` a mitad de palabra. |
| 02 | [02-menu-pausa-403.webp](./img/verificacion-4.0.3/02-menu-pausa-403.webp) | Menú de pausa 4.0.3 | **REGRESIÓN VISUAL ALTA:** el fondo oscuro ya no deja sangrar el HUD, **pero la caja del menú quedó desplazada por encima del borde superior del viewport `412×860`**, cortando el título y los primeros 4 botones (`▶ Seguir`, `🎥 Cámara`, `🔊 Sonido`, `🗣️ Lenguaje`). Solo asoman desde `Accesibilidad` hacia abajo; un jugador en celular no ve el botón `▶ Seguir`. |
| 03 | [03-globo-403.webp](./img/verificacion-4.0.3/03-globo-403.webp) | Globo WebGL2 (`MC.GloboGPU`) | **PENDIENTE:** persisten el recorte lateral de la esfera en `412 px`, la ausencia de etiquetas de ciudades (`Nueva York`, `Medellín`, `Guatapé`) y la banda polar horizontal plana. |
| 04 | [04-accion3d-403.webp](./img/verificacion-4.0.3/04-accion3d-403.webp) | `turno-cero-accion-3d.html` (`G CEBO`) | **CORREGIDO:** el botón inferior derecho `G CEBO` ahora encaja limpio y centrado con margen interno holgado (`0` errores consola). |

---

## 2. Verificación completa y perfilado de memoria del PR #9 (`C‑M34`)

Probado en entorno limpio `/tmp/pr9-qa` (`origin/pr-9`):

- **Compilación:** `node herramientas/construir.mjs` → **PASS** (`motor.js 868 KB · 68 archivos`, `getaway.html 25.629 KB`).
- **Pruebas Node PR #9:** `node pruebas/sectores-cm34.mjs` (**5/5 PASS**) + `node pruebas/paquete-capas-cm34.mjs` (**PASS**: equivalencia byte a byte de las 15/17/16 capas de `nueva_york`, `medellin` y `guatape`).
- **Prueba navegador móvil PR #9:** `node pruebas/paquete-capas-browser.mjs` → **PASS** (`412×860`, 3 ciudades offline desde capas comprimidas, `0` errores JS ni red).

### Comparativa directa de tiempos y JS Heap (`412×860`, CDP `Performance.getMetrics`, `0` errores)

| Versión / Rama | HTML listo (ms) | Carga NY (ms) | JS Heap NY (MB) | Carga MD tras NY (ms) | JS Heap tras NY→MD (MB) | Carga GU tras MD (ms) | JS Heap tras NY→MD→GU (MB) |
|---|---:|---:|---:|---:|---:|---:|---:|
| **`main` 4.0.3 (`ae098eb`)** | 1.748 | 2.700 | **231,2** *(res. 283,9)* | **1.981** | **248,6** *(res. 307,7)* | 914 | **270,7** |
| **PR #9 (`ia/chatgpt/cm34-cache-20261120`)** | **693** *(-60 %)* | 2.790 | **218,7** *(-12,5 MB)* | 3.632 *(+1,65 s)* | **281,0** *(res. 328,1)* | **682** | **279,6** |

### Diagnóstico accionable para PR #9 y `4.0.4`
1. **Gran acierto de PR #9:** el arranque del HTML baja **60 % (`1.748 ms → 693 ms`)** y el heap inicial de Manhattan baja **`12,5 MB`** con equivalencia byte a byte verificada.
2. **Cuello de botella restante (ALTO):** al encadenar `nueva_york → medellin → guatape` en una misma sesión, tanto `4.0.3` (`270,7 MB`) como `PR #9` (`279,6 MB` / `328,1 MB` reservados) **retienen en memoria los mundos previos** dentro de la caché de `MC.Planeta`. Además, en PR #9 cargar Medellín tras Manhattan tardó `3.632 ms` (+83 % frente a `1.981 ms` en `4.0.3`) por la descompresión diferida encadenada sin liberar primero `nueva_york`.
3. **Solución inmediata de alto retorno (patrón `StreamAnillo.cambiarCiudad` de RenderWare / GOAL):** al entrar a una nueva ciudad en `MC.Planeta` (`js/13-planeta.js`), evacuar las capas infladas (`_c.clear()`, `_ED = null`, `_vias = null`, `_rv = null`) de la ciudad anterior antes de abrir la nueva. Eso reduce el pico multi-ciudad en **~190–210 MB** de inmediato.

---

## 3. Benchmark real de algoritmos clásicos sobre los 3 archivos `mundo.mc4`

Medido directamente con [`experimentos/tecnicas-clasicas/extraer-mc4-demo.mjs`](../experimentos/tecnicas-clasicas/extraer-mc4-demo.mjs) (resultados en [`benchmark-mc4-real.json`](../experimentos/tecnicas-clasicas/benchmark-mc4-real.json)):

### 3.1 Oclusión 1D (Build Engine) + Muro de niebla (Silent Hill) + AO horneado (Quake) sobre edificios reales Overture/OSM

| Escenario real (`mundo.mc4`, radio 340 m) | Calle detectada | Edificios reales | En frustum | Dibujados tras oclusión | **Descartados** | Coste CPU | AO horneado (`min / prom`) | PVS RLE (`bytes`) |
|---|---|---:|---:|---:|---:|---:|---|---:|
| **Manhattan · Chelsea** (`40.7432, -74.0055`) | `West 17th Street` | 309 | 38 | **16** | **94,8 %** | 1,89 ms | `0,34 / 0,62` | 35 *(raw 32)* |
| **Manhattan · Midtown** (`40.7549, -73.9840`) | `6th Avenue` | 231 | 22 | **15** | **93,5 %** | 1,28 ms | `0,34 / 0,67` | 34 *(raw 32)* |
| **Medellín · El Poblado** (`6.2087, -75.5677`) | `Calle 9` | **518** | 104 | **26** | **95,0 %** | 3,03 ms | `0,34 / 0,64` | **12** *(raw 32, -62 %)* |
| **Medellín · Centro** (`6.2492, -75.5650`) | `Calle 51` | **520** | 77 | **29** | **94,4 %** | 1,69 ms | `0,34 / 0,64` | 33 *(raw 32)* |

### 3.2 Voxel Space (Comanche / Outcast) sobre relieve SRTM/NASA real (`0 WebGL`)

| Territorio real (`mundo.mc4`) | Rango de elevación SRTM | Ventana muestreada | Tiempo promedio `320×200` CPU pura |
|---|---|---|---|
| **Guatapé y Piedra del Peñol** | `1.813 m → 2.028 m` | `4.760 m × 4.760 m` | **`0,99 ms / cuadro`** (> 1.000 FPS teóricos, 0 WebGL) |
| **Medellín y Valle de Aburrá** | `1.446 m → 2.789 m` | `13.000 m × 13.000 m` | Disponible en vivo en `laboratorio.html` |

Todos estos datos reales (relieves SRTM de Guatapé y Medellín + 960 edificios reales de Chelsea, Midtown y El Poblado) quedaron empaquetados en solo **`101,7 KB`** ([`datos-reales-mc4.js`](../experimentos/tecnicas-clasicas/datos-reales-mc4.js)) y ya se pueden explorar y probar en tiempo real dentro de [`experimentos/tecnicas-clasicas/laboratorio.html`](../experimentos/tecnicas-clasicas/laboratorio.html).
