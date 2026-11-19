---
name: motor-city-desarrollo
description: Cómo trabajar en el código del motor Motor City (repositorio motorcity). Estructura de js/ en fragmentos numerados, construcción a dist/motor.js, pruebas (node motor.mjs prueba --navegador), reglas (un solo HTML, sin librerías, español de Colombia, no romper guardados), versión, sincronización a los juegos y reportes de cambios. Úsala siempre antes de leer, modificar, probar o publicar el motor.
---
# Motor City · desarrollo

1. **Lee primero:** `README.md`, `CONTEXTO-IA.md`, `MOTOR.md` (el contrato) y `docs/GUIA.md`. Revisa también `reportes/README.md` (los cambios pendientes de pulir).
2. **El motor son fragmentos numerados** en `js/NN-nombre.js`. Van en un solo cierre y solo publican `MC`.
   - Orden: núcleo, ciencia, economía, escala y GPU (00–05); mundo, generador y cosmos (10–13); tiempo, tráfico, transporte, ambiente e IA (20–25); cuerpo, vehículos, seres, taller, manejo y sprites (30–38); vistas, raster, interiores y mi casa (40–49); Run (50); música (60); interfaz (70); mecánicas, lugares e historias (80–85).
   - **Un solo cierre:** antes de declarar un `const` de nivel superior, busca que el nombre no exista en otro fragmento (`grep -n "const NOMBRE" js/*.js`).
   - `js/valle.js` es el lector 1.x de Juega EnCicla: **no se toca**.
3. **Construir y probar** (debe quedar todo en verde):
   ```bash
   node motor.mjs construir            # dist/motor.js, el banco de pruebas y dist/juegos/*.html
   node motor.mjs prueba --navegador   # datos, ciencia, redes, transporte, IA, vistas, Run, juegos y rendimiento
   ```
4. **Reglas:**
   - JavaScript puro, sin librerías ni internet en el juego.
   - Unidades del SI y fórmulas con su fuente en el comentario.
   - Lo determinista se prueba en Node.
   - Español de Colombia.
   - Los campos nuevos del guardado llevan su valor por defecto (`MC.guardado.completar`).
   - Fluido con la CPU 4× más lenta (mediana < 40 ms).
5. **Cada cambio:**
   - sube `VERSION.json` (semver) y escribe en `BITACORA.md`;
   - si eres una IA de un juego, abre un reporte: `node motor.mjs reporte "título" --juego X`;
   - copia el motor a los juegos: `node motor.mjs sincronizar ../BicicletasUno` (verifica con `--verificar`).
6. **Git:** trabaja en tu rama, no hagas PR si no te lo piden y no subas llaves.
