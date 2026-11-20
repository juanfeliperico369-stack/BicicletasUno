# Medición de telemetría móvil · Motor City 2.9.1 (G‑H9)

- **Fecha:** 2026-11-20
- **Autor del protocolo y línea base:** Gemini · Antigravity («hydrogen»)
- **Módulo medido:** `MC.Telemetria` (`js/90-telemetria.js`) en `dist/juegos/mandados.html` (Motor City **2.9.1**)

> **Nota de honestidad:** este agente corre en una máquina virtual Linux sin teléfono físico ni GPU móvil real. **No se fabrican mediciones de celular.** La §1 entrega la plantilla lista para que el autor complete los 5 minutos por vista/calidad en su celular real; la §2 documenta una **línea base simulada en Chromium móvil (`412 × 860`, CPU 4×, GPU software)** claramente separada como referencia técnica.

---

## 1. Protocolo y plantilla para el celular real (con el autor)

### Pasos exactos en Mandados
1. Abre [`dist/juegos/mandados.html`](https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html) en el navegador del celular (con batería > 30 %, sin modo ahorro extremo y cerrando apps pesadas).
2. Pulsa **Jugar** (Guatapé) y entra a **⚙️ Ajustes**:
   - Activa **📈 Telemetría (fps y física): sí** (aparece la pastilla `📈 <fps> fps · p95 <ms> · dibujo <ms>`).
   - Selecciona **🎚️ Calidad**: `baja` (`0.45`), `media` (`0.75`) o `alta` (`1.0`).
3. En **🗺️ Vista**, elige `Cenital`, `Maqueta 2:1` o `Lateral`.
4. Juega **5 minutos continuos** por cada combinación (moviéndote por calles, cruzando intersecciones y cambiando de vehículo al menos una vez) y anota los valores estables al minuto 5.

### Datos del equipo real (completar por el autor)
- **Modelo del celular:** _(pendiente — ej. Samsung Galaxy A54 / Redmi Note 13 / Moto G84)_
- **Sistema y navegador:** _(pendiente — ej. Android 14 · Chrome 130 / iOS 18 · Safari)_
- **Piel y estilo probados:** `arte: gemini` / `arte: chatgpt` · `estilo: realista`

| Vista | Calidad | FPS (p50) | Cuadro p95 (ms) | Dibujo p95 (ms) | ¿Se calienta? (nada / tibio / caliente) | Sensación / tirones observados |
|---|---|---:|---:|---:|---|---|
| Cenital | Baja (`0.45`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| Cenital | Media (`0.75`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| Cenital | Alta (`1.00`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| Maqueta 2:1 | Baja (`0.45`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| Maqueta 2:1 | Media (`0.75`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| Maqueta 2:1 | Alta (`1.00`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| Lateral | Baja (`0.45`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| Lateral | Media (`0.75`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| Lateral | Alta (`1.00`) | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |

### Criterios objetivo de aceptación en celular real
- **Fluido (meta verde):** `≥ 50 fps` estables y `cuadro_p95 ≤ 22 ms` (sin tirones perceptibles al girar cámara).
- **Jugable (meta amarilla):** `≥ 30 fps` y `cuadro_p95 ≤ 36 ms`, con calentamiento máximo *tibio* tras 5 minutos.
- **Requiere ajuste (rojo):** `< 25 fps`, `cuadro_p95 > 45 ms` o sobrecalentamiento rápido.

---

## 2. Línea base simulada en VM (Chromium `412 × 860`, DPR 2, CPU 4×, GPU software)

> **Advertencia metodológica:** esta tabla **NO** sustituye al celular físico. En Chromium sin GPU física (`gpu: "software"`) con `Emulation.setCPUThrottlingRate({ rate: 4 })`, el compositor por software satura el ritmo de `requestAnimationFrame` y hace tope en el clamp `dt = 0.1 s` (`100 ms`) de `juegos/mandados/juego.js`, incluso cuando el tiempo puro de `vistas.dibujar()` (`dibujo_p50`) es de apenas **6–21 ms**.

Lectura directa de `MC.Telemetria.resumen()` tras calentamiento (1 s) y ventana de muestreo (4,5 s por celda, 10:00 a. m., `estilo: realista`, `arte: gemini`):

| Vista | Calidad | Escala | Muestras (`n`) | FPS (p50) | Cuadro p50 (ms) | Cuadro p95 (ms) | Cuadro p99 (ms) | Dibujo p50 (ms) | Dibujo p95 (ms) | GPU |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Cenital | Baja | `0.45` | 68 | 15 | 66,6 | 100,0 | 100,0 | 12,8 | 23,0 | `software` |
| Cenital | Media | `0.75` | 87 | 20 | 50,0 | 100,0 | 100,0 | 10,1 | 26,6 | `software` |
| Cenital | Alta | `1.00` | 105 | 20 | 49,9 | 50,1 | 66,7 | 6,3 | 16,5 | `software` |
| Maqueta 2:1 | Baja | `0.45` | 37 | 10 | 100,0 | 100,0 | 100,0 | 20,2 | 31,3 | `software` |
| Maqueta 2:1 | Media | `0.75` | 35 | 10 | 100,0 | 100,0 | 100,0 | 21,3 | 29,4 | `software` |
| Maqueta 2:1 | Alta | `1.00` | 37 | 10 | 100,0 | 100,0 | 100,0 | 18,4 | 28,4 | `software` |
| Lateral | Baja | `0.45` | 49 | 10 | 99,9 | 100,0 | 100,0 | 9,1 | 16,3 | `software` |
| Lateral | Media | `0.75` | 51 | 12 | 83,4 | 100,0 | 100,0 | 8,1 | 13,7 | `software` |
| Lateral | Alta | `1.00` | 47 | 10 | 100,0 | 100,0 | 100,0 | 9,8 | 13,3 | `software` |

### Qué nos dice ya esta línea base (antes del celular real)
1. **El cuello de botella en VM es el compositor software, no el JS de dibujo:** en **Lateral** `dibujo_p50` es apenas **8,1–9,8 ms** (`dibujo_p95: 13,3–16,3 ms`) y en **Cenital** baja hasta **6,3 ms**; en un celular con GPU de hardware real el costo de `vistas.dibujar()` debería permitir tasas muy superiores.
2. **Maqueta 2:1 sigue siendo la vista más pesada en JS:** `dibujo_p50` ronda **18,4–21,3 ms** (`dibujo_p95: 28,4–31,3 ms`), casi el doble que Lateral y Cenital. Además, bajar `vistas.calidad` de `1.0` a `0.45` reduce el costo de píxeles pero casi no reduce `dibujo_p50` en Maqueta (porque el costo principal en Maqueta está en la iteración/ordenación de fachadas y árboles en CPU, no solo en el tamaño del lienzo).
3. **Siguiente paso:** cuando el autor complete la tabla de la §1 en su celular real, se compararán los `p95` reales y la temperatura contra esta línea base para calibrar la calidad automática (`vistas.auto`) en 2.9.x.
