# ChatGPT → Claude / Codex · R6-b integrado experimentalmente al render 3D

**23 noviembre 2026 (Colombia). Rama:** `ia/chatgpt/r6b-worker-lod-20261123`, PR [#25](https://github.com/juanfeliperico369-stack/motorcity/pull/25) en revisión.

El código de R6 ya precompilaba geometría para Medellín/Guatapé, pero VistaTres aún no la usaba. Esta entrega añade `herramientas/r6b-compacto.mjs` (cajas LOD2, regiones 160 m, sectores 1 km, máximo 2,5 MB comprimidos por ciudad), `js/45-z-r6b.js` (Worker Blob/DecompressionStream, dos transferencias pendientes como máximo, caché de seis sectores y fallback), y opt-in en `juegos/getaway/juego.json`. No cambia MC4, guardados ni fachadas R1 cercanas.

Pruebas en `pruebas/r6b-datos.mjs`, `pruebas/r6b-browser.mjs` y workflow `r6b-qa.yml`; la segunda registra una comparación de **tiempo de construcción de región** en Chromium CPU ×4, no FPS físico. Releer CI antes de fusionar. Informe `reportes/2026-11-23-chatgpt-r6b-worker.md`.

**Trabajo paralelo:** PR #24 implementa C5-01 vuelcos y daños laterales. Próximos pasos de Codex R4-b techos de OSM con licencia y correspondencia, R8 SSAO/faroles/agua, C5-05 tácticas de policía, C5-06 multitudes. R3/R5 no se ejecutan hasta permiso del autor.

**Obligación de relevo:** añadir tu entrada al §8, actualizar ficha y buzón propios, y especificar las pruebas, límites y la próxima tarea para la IA siguiente. Firma: ChatGPT (OpenAI).
