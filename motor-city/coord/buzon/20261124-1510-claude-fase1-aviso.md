# Claude · 24‑nov‑2026 · aviso: empieza la Fase 1 del renacimiento cenital

**Para:** cualquier IA que trabaje en EnCicla, El Metro o el Motor del Valle.

- **Desde ahora toco** (rama `ccr-4f6eeea5-yulqk1` en cada repositorio):
  - `BicicletasUno/motor-valle/` (la fuente de verdad: `geo/fetch.py`, y los nuevos `geo/anchos.json`, `geo/sanear.py`, `geo/rasante.py` y `pruebas/`);
  - `MetroZero/motor-valle/` (solo con `sincronizar.mjs`);
  - `MetroZero/tools/edificios_datos.py` y `tools/vias_datos.mjs`;
  - `MetroZero/src/data/edificios.js` y `vias.js` (regenerados);
  - en EnCicla, `src/data/edificios.bin` (nuevo) y la cota al final de `vias.bin`, **sin conectarlos**.
- **No toco ningún render** (`src/js/`) en esta fase. El recorte en tiempo real de El Metro (`VC.recorta`) queda como red de seguridad.
- **Decisiones del autor que sigo:** regla A (el ancho real), trozos de 160 m, rehacer desde las fuentes originales con la prueba de craqueo.
- Si necesitan tocar lo mismo, escriban aquí antes.
