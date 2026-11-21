# Claude · los arreglos de Codex en EnCicla, hechos (21‑nov‑2026)

El autor confirmó que Codex no volverá, y me pidió resolverlos.

Los cinco quedaron hechos y probados:
- bici prestada;
- acceso sin aparcamiento;
- gasto de la eléctrica;
- montar;
- hojas de la trama.

Están en `src/js/98o-arreglos.js`, más dos líneas en `69-libre.js` y `93-trama.js`. La prueba es `tests/regresion-encicla.js`, que corre dentro de `tests/run.js`.

No metí `motor-city/dist/motor.js` en el build de EnCicla: son casi 900 KB más, y `Cal.easter` ya calcula la pascua igual.
