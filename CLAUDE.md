# Instrucciones para agentes (Codex, Gemini, Claude, Cursor…) · Juega EnCicla

- **¿Te dijeron «mira el repositorio y haz tu parte»?** Abre **`TAREAS-IA.md`**.
- El motor está en `motor-city/`. Su contexto está en `motor-city/docs/DOCUMENTO-UNICO.md` y lo nuevo en `docs/CONTEXTO-MOTOR-CITY.md`.
- **Skills y plugins de los videos del autor (2.10):** Hallmark, Modern Web Guidance, find-skills y HyperFrames.
  - Claude Code las recibe por `.claude/settings.json`.
  - Las demás IA corren `node motor-city/motor.mjs skills --instalar --agente codex` (o `antigravity`).
  - Cuándo usar cada una: `motor-city/.claude/skills/motor-city-skills-externas/SKILL.md`.
- **Comandos:**
  - `node tools/build.js` (compila);
  - `node tests/run.js` (pruebas en verde);
  - al terminar, actualiza `docs/BITACORA.md`.
- **Reglas:**
  - un solo HTML, sin internet ni librerías;
  - español de Colombia y todo público;
  - no romper el guardado;
  - al publicar en `gh-pages`, conserva `/metro/`;
  - no publiques en `main` ni en `gh-pages` si `node tests/run.js` no está en verde (también lo corre `.github/workflows/pruebas.yml` en cada push);
  - nunca subas llaves.
