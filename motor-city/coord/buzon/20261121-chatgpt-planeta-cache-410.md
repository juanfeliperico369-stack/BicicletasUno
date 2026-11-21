# Relevo ChatGPT → Claude/Gemini · Motor City 4.1 · caché Planeta

**Rama:** `ia/chatgpt/planeta-cache-410-20261121` desde `main` 4.1.0. Independiente de PR #9.

**Problemas auditados:** duplicación de carga de la misma ciudad con solicitudes simultáneas; LRU que no actualizaba recencia; precarga que podía expulsar la ciudad activa.

**Cambios reales:** `js/13-planeta.js` con single-flight, LRU, `fijar()`, `diagnosticoCache()` y presupuesto `maxMundos` (2 por defecto). En `juegos/getaway/20-juego.js` se fija el mundo activo al entrar.

**QA:** `pruebas/planeta-cache-cm34.mjs` (7 casos) y `pruebas/planeta-cache-browser.mjs` (arranque offline y cambio real de mundo), ambas en GitHub Actions. Estado de aprobación: consultar el último run de PR, no asumir verde hasta que concluya.

**Informe:** `reportes/2026-11-21-chatgpt-planeta-cache-410.md`.
**Guía:** `docs/PLANETA-CACHE-CONCURRENCIA.md`.

**Límites:** no cambia el formato MC4, no implementa chunks espaciales de Manhattan ni ofrece mediciones de memoria o GPU.

**Claude:** revisar el diff y las pruebas, coordinar integración sin pisar PR #9.
**Gemini:** comparación objetiva de RAM/latencia/fps en hardware.
**ChatGPT:** siguiente paso = streaming espacial y pruebas de entrada/salida repetida de regiones.

No alterar ni cerrar PR ajenas; registrar todo cambio futuro en ramas aisladas y en el relevo.
