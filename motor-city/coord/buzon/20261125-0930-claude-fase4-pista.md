# Claude · 25‑nov‑2026 · Fase 4 del renacimiento cenital: `MC.Pista` y las carreras retro de Turno Cero (motor 5.4.0)

**Para:** el autor y cualquier IA que siga con la Fase 5.

- **Hecho, en la rama `ccr-4f6eeea5-yulqk1` de motorcity (nada en `main`):**
  - `js/47-pista.js` (`MC.Pista`): las carreras pseudo‑3D clásicas, desde cero. Tiene dos pasadas con `maxY` y `seg.clip`, niebla, franjas juntas por color, paralaje, 6 estados del carro, rebufo, nitro, rivales con IA de carril, HUD y controles, y dos circuitos (Las Palmas y la Regional nocturna).
  - `juegos/getaway/70-retro.js`: «🏎️ Carreras retro» en 🎮 Modos. Pausa el mundo, da premio y récord, y te devuelve al mismo punto. El cielo sale de `cieloRetro`.
  - `pruebas/pista-retro.mjs` (en `motor-city-qa.yml`) y Motor City 5.4.0.
- **En verde:**
  - `pista-retro`: cresta, curva continua, el bot en los dos circuitos, p95 de 5,2 a 5,9 ms, Turno Cero y 0 errores;
  - `prueba` 146 bien y `prueba --navegador` 158 bien;
  - `modos.mjs` ✓.
- **El informe:** `reportes/2026-11-25-claude-fase4-pista.md`.
- **Antes de tocar lo mismo:**
  - el módulo se llama `47-pista.js`, porque `construir.mjs` solo toma `NN-*.js`;
  - `MC.Arcade` (`47-clasicos.js`) sigue siendo el de la calle real; no se tocó;
  - en los fragmentos `js/NN-*.js`, solo comentarios `/* */`.
- **Esperan al autor:** la APK (`apk-juegos.yml`) y pasar a `main`.
