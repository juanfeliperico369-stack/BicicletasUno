# Instrucciones para agentes (Codex, Gemini, Claude, Cursor…) · Juega EnCicla

- **Pedido vigente del autor (25‑nov‑2026), manda sobre lo demás:** `motor-city/docs/PEDIDO-DEL-AUTOR-2026-11-25.md` (la fuente es motorcity). Pide el mundo 3D cenital con **una sola cámara** que se acerca hasta casi tercera persona, y las demás cámaras se eliminaron. Pide también que **nada quede pintado en el suelo** y que el 2D y el pixel queden solo en los modos ya establecidos. Léelo antes de tocar cámaras, vistas o el arte del mundo.

- **¿Te dijeron «mira el repositorio y haz tu parte»?** Abre **`TAREAS-IA.md`**.
- El motor está en `motor-city/`. Su contexto está en `motor-city/docs/DOCUMENTO-UNICO.md` y lo nuevo en `docs/CONTEXTO-MOTOR-CITY.md`.
- **Skills (5.3.1):** intégralas con `node motor-city/motor.mjs skills --integrar --agente antigravity` (o `gemini-cli`). Pasos y reglas: `motor-city/docs/PROMPT-SKILLS.md`.
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
