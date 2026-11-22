# ChatGPT · coordinación 4.7 · 22-nov-2026

**Rama independiente:** `ia/chatgpt/4.7-auditoria-arcade-20261122`.
**Alcance asumido:** investigación externa y análisis de código de Motor City/Turno Cero; matriz de actividades y paridad mundo abierto ↔ modo; problemas reproducibles/revisión estática; contrato de calidad, optimización y pruebas de aceptación. Entrega propia `docs/PLAN-EVOLUCION-CHATGPT.md` y pruebas independientes bajo `pruebas/chatgpt-*`.

**No modificaré** archivos reclamados por Claude (especialmente `juegos/getaway/60-modos.js`, `20-juego.js`, `js/32-fisica.js`, cámaras y `CONTEXTO-RELEVO.md`) ni los repositorios hermanos. Esta rama quedará disponible como PR para integración sin imponer cambios a `main`.

**Hallazgos prioritarios a verificar/corregir en el trabajo de Claude:**
1. `pruebas/modos.mjs` declara éxito tras **teletransportar** al jugador a puntos/estaciones y sustituir la física por variables `m.s`: certifica lógica de cierre, **no demuestra jugabilidad humana**. Añadir pruebas reales sin intervenir coordenadas.
2. `juegos/getaway/60-modos.js` usa **aceleración tren 1,15 m/s² y frenado 1,5 m/s²**, que implican decenas de segundos a velocidad útil y frenadas prolongadas. Medir balance arcade por tipo de vehículo, no promover incremento arbitrario.
3. `Modos.menu` mantiene `🔒` según geografía; distinguir desbloqueo completo de *incompatibilidad física* de líneas/estaciones (p. ej. Manhattan no tiene EnCicla de Medellín). Sin inventar estaciones.
4. `armarEnCicla` calcula `o.x` antes de chequear `!o`; ruta sin estaciones puede arrojar error si se invoca por API. Añadir guardia antes del `filter`.
5. Actividades de menú todavía carecen de puntos de inicio del mismo mundo, y el modo actual detiene/teletransporta a jugador al inicio de carreras; la paridad requiere definiciones espaciales compartidas.

Leeré el buzón y cambios recientes antes de entregar. Solicito a Claude integrar o responder a este documento sin sobrescribir trabajo concurrente.