# El Metro → Motor City 2.0 · guía para su IA

> Antes de nada, sigue tu `CLAUDE.md`: el protocolo de 7 pasos, el cuestionario y la bitácora.

**Lo que ya está hecho:**
- `motor-valle/` de MetroZero trae el motor 2.0 (sincronizado desde `motorcity`, la nueva fuente de verdad).
- Reemplaza a tu copia 1.1.0.
- **El juego no cambió:** tu `tools/build.mjs` no incluye nada de `motor-valle/`, y `tools/test.mjs 100` sigue en 0 errores.

## Qué te trae el motor
- **El mismo mundo en metros** (tu unidad). Tu `valle.js` es de 20 m; el mundo 2.0 es de 10 m y además trae:
  - **tus 639.457 huellas** (`edificios`, el mismo formato ED1 de tu `edificios.js`);
  - tus 2.176 puentes con ancho y alto (`pasos`);
  - tus rieles, el Metroplús, los andenes y las rutas por calles (`transporte`);
  - tus hitos con huella (`lugares.hitos`);
  - las 133 estaciones EnCicla;
  - los sitios y emblemáticos modelados de EnCicla, que no tenías;
  - los túneles y deprimidos;
  - la capa de nivel firmado.
- **Transporte con horario real y determinista** (`MC.Transporte`): tu horario de 4:30 a 23:00 y de 5:00 a 22:00, con frecuencias de hora pico y de valle. Tus trenes y los de EnCicla coinciden a la misma hora.
- **La panorámica de perfil del motor** (`MC.Panoramica`). Parte de tu `23-lado.js` (la cita y el crédito están en el archivo) y suma:
  - la fila de edificios reales;
  - las siluetas de los emblemáticos;
  - el viaducto con sus trenes;
  - el fondo por un eje suavizado.

  **Tu `23-lado.js` se queda:** usa el del motor para la Ciudad Libre o para comparar.
- WebGL (tercera y primera persona, dron y cine), maqueta 2:1, pixel, clima, cielo con sol y luna, tráfico con semáforos y Run en la ciclovía.

## Pasos sugeridos
1. **Incluir** `motor-valle/dist/motor.js` en `tools/build.mjs` (va en su cierre; solo publica `MC`). Mide el tamaño: tu HTML ya pesa 8,5 MB.
2. **Leer el mundo 2.0** en vez de `valle.js` (20 m), `edificios.js`, `puentes.js` y `rieles.js`. Son los mismos datos, de una sola fuente. Así baja el tamaño del HTML.
   - `MAP.tileM(x, y)` → `mundo.suelo(x, y)`
   - `MAP.elevM` → `mundo.cota`
   - `VC.edifDe(rx, ry)` → `mundo.edificiosRegion(rx, ry)` (las mismas regiones de 640 m)
3. **Run Scooter:** si quieres Run sobre la ciclorruta real, usa `MC.Run`. Lleva la piel de El Metro (`RUNV.cielo` y la paleta) y el mismo corredor que tu «🛴 Run Scooter».
4. **Tus vistas se quedan:** la cabina, la maqueta, el Metrocable y la vista Cine. El motor solo suma.
5. **Huevos:** `MC.huevos.poner({ id: 'rosalba_primer_tren', x, y, hora: [270, 300] })`, entre otros.

**Si algo del mundo está mal, pídelo en `motorcity`.** Tus herramientas `tools/*_datos.*` siguen siendo la referencia de cómo se hicieron tus capas. Al mudarlas al motor (`geo/` o `herramientas/`), cítalas.
