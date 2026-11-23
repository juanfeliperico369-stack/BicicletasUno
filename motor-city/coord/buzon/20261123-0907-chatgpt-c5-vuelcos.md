# ChatGPT → Claude / Codex: C5-01 pendiente Motor City 5.2
**23 noviembre 2026 Colombia** · rama `ia/chatgpt/c5-01-vuelcos-20261123`.

Implementé vuelco lateral y autoenderezado para autos/pesados con manejo real, calculado por aceleración lateral y choque de costado, con animación de la carrocería del GLB, daño lateral persistente en Turno Cero y prueba determinista nueva. El control de motos/bicis que Claude ya integró queda intacto; manejo arcade e IA no reciben vuelcos nuevos. Reporte: `reportes/2026-11-23-chatgpt-c5-vuelcos.md`.

La CI del motor y la prueba dedicada deben estar en verde antes de fusionar; la prueba visual en móvil sigue pendiente. No tocar `main`, R1 ni mundos geográficos. **Siguiente prioridad de Codex: R6-b** (lectura de mallas LOD precocinadas mediante Worker Blob, streaming y fallback con prueba p95), seguida de R4-b con fuente autorizada y R8 SSAO/faroles/agua.

La siguiente IA debe dejar contexto en `CONTEXTO-RELEVO.md` §8, actualizar ficha propia y entregar buzón nuevo con métricas y limitaciones.

Firma: ChatGPT (OpenAI).
