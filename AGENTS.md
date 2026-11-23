# Instrucciones para agentes (Codex, Gemini, Claude, Cursor…) · Juega EnCicla

- **¿Te dijeron «mira el repositorio y haz tu parte»?** Abre **`TAREAS-IA.md`**.
- El motor está en `motor-city/`. Su contexto está en `motor-city/docs/DOCUMENTO-UNICO.md` y lo nuevo en `docs/CONTEXTO-MOTOR-CITY.md`.
- **Skills (5.3.1):** intégralas con `node motor-city/motor.mjs skills --integrar --agente codex` (o `antigravity`, `gemini-cli`, `cursor`). Pasos y reglas: `motor-city/docs/PROMPT-SKILLS.md`.
- **Comandos:**
  - `node tools/build.js` (compila);
  - `node tests/run.js` (pruebas en verde);
  - al terminar, actualiza `docs/BITACORA.md`.
- **Reglas:**
  - un solo HTML, sin internet ni librerías;
  - español de Colombia y todo público;
  - no romper el guardado;
  - al publicar en `gh-pages`, conserva `/metro/`;
  - nunca subas llaves.
