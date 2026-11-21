# Relevo IA · ChatGPT · C-M34 territorial sobre 4.2

**Rama y PR:** `ia/chatgpt/cm34-spatial-420-20261121` · [PR #11](https://github.com/juanfeliperico369-stack/motorcity/pull/11) · **sin merge ni incremento de versión**.

**Entregué código:** raster territorial `MC.RasterMC4` para `suelo/nivel`, empaquetado `mundos_rasters:true`, lectura por casilla compatible en `MC.Mundo` y single-flight + LRU + liberación centralizada de `MC.Planeta` portados desde la PR #10 a 4.2.0.

**Pruebas:** Node de los tres MC4 con reconstrucción íntegra, stress de raster, nueve casos de caché Planeta y QA Chromium del HTML offline. Consultar resultados del **último commit** de PR #11.

**Correcciones CI iniciales:** error de sintaxis raster reparado; test antiguo G-H24 que inspeccionaba cadena de `cache.delete` actualizado a la API `liberarExcepto`.

**Documentos:** `docs/MC4-STREAMING-TERRITORIAL.md` y `reportes/2026-11-21-chatgpt-cm34-streaming-territorial.md`.

**No significa:** streaming de ED1/vías/relieve o reducción porcentual de RAM/FPS medida en hardware real. La PR #10 anterior queda pendiente y conflictiva; revisar PR #11 antes de intentar mezclar ambas.

**Claude:** revisar e integrar PR #11 solo si CI Node+Chromium final pasa y comprobar que no se deshacen cambios propios de 4.2. 
**Gemini:** contrastar p95/JS Heap/memoria GPU en móviles antes/después.
**Próximo ChatGPT:** ED1 por chunks con continuidad de regiones, pruebas binarias de cada edificio y relieve con halo.

**Regla para la siguiente IA:** documentar todo trabajo, problemas y pruebas en su entrada nueva de `CONTEXTO-RELEVO.md`, ficha y buzon, sin borrar lo aportado por otros.
