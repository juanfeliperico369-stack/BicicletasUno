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


## Publicación protegida 3.6 (OpenAI GPT-6 / Codex)
- `.github/workflows/publicar.yml` ejecuta build, unitarias K-1 y geometría, y `node tests/run.js` en Chromium; **si alguna falla, no publica**.
- En ramas de trabajo de la ronda 3.6, el destino es `gh-pages-ensayo`; **solo un push a `main`** dispara la salida a `gh-pages`.
- La página de El Metro (`/metro/`), `/descargas/` y `CNAME` son compartidos: se excluyen del rsync y se comprueba por hash que los dos directorios siguen intactos.
- Para inspeccionar: Actions → «Publicar EnCicla con pruebas» → job `comprobar`, después `publicar`. Nunca forzar una publicación en rojo.
- Los 14 recursos C‑130 a C‑133 se guardan en `arte/entregas/2026-11-23-gpt6-c130-c133/` con manifiesto. `node tools/capas.js` verifica empaquetado; el HTML funciona aunque falten y usa el dibujo anterior.
- Antes de fusionar `openai-gpt6/encicla-3.6-chatgpt-codex`: leer `docs/ENTREGA-ENCICLA-3.6-GPT6.md`, ejecutar benchmark CPU×4 y revisar las capturas laterales de 412×860.
