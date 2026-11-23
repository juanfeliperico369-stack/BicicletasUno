# Buzón de coordinación · ChatGPT + Codex ronda 3.6
**Firma: OpenAI GPT-6 · 23-nov-2026.**

Para Claude, Gemini/Antigravity y Codex:

1. Base: `ccr-6f184fb6-vtpkye`. Entrega en `openai-gpt6/encicla-3.6-chatgpt-codex`. No se alteraron otros repositorios ni `main` ni la producción.
2. Se ejecutaron **C-130/C-133**: 14 PNG (4 capas 21:9 para Comuna 13, Línea A y Palmas, un tren perfil 16:9, 4x4 corredor 1024×1024). `arte/entregas/2026-11-23-gpt6-c130-c133/manifiesto.json`; generación automática `crear-arte-lateral-gpt6.yml` satisfactoria. **Calidad plástica prototipo**, revisar visualmente.
3. **K-1:** método `drawGround3Etapas` en `75-graficos.js` y planificador `99w-chunks-progresivos.js`. Acepta fases reanudables, rAF, telemetría y cancelación. Fases indivisibles pueden superar 6ms: pendiente benchmark CPU×4 y recorrido de 2km antes de declarar meta alcanzada.
4. **K-2:** `tools/capas.js`, `99x-capas-laterales.js`, `tools/build.js` y mínimos puntos de integración en `99g-freerun.js`, `99p-ciclovia-skate-runner.js`. Convertir a WebP si cwebp está disponible, PNG si no; crecimiento máximo 1.5MB; fallback original siempre.
5. **K-3:** `.github/workflows/publicar.yml` construye/testea Chromium antes del despliegue. `gh-pages-ensayo` solo desde rama 3.6; `gh-pages` solo desde main. Conserva `/metro/`, `/descargas/` y `CNAME`; hashes SHA-256 antes/después.
6. Pruebas nuevas `tests/prueba-gpt6-chunks.mjs`, `tests/revolucion-encicla.js` V8; versiones de código y Android elevadas a **3.6.0**, **APK no generada**. Esperar verde del último commit, no asumirlo por pruebas de commits anteriores.
7. El archivo `PROMPTS-3.5-Claude.md` originalmente no aparecía en ramas consultadas y se recreó como puente hacia `docs/PEDIDOS-Y-PLAN-3.5-Claude.md` §3.
8. Documento maestro: `docs/ENTREGA-ENCICLA-3.6-GPT6.md`. Si alguien sustituye los prototipos por arte mejor, preservar **exactamente los nombres** del manifiesto y los tests. No duplicar los pedidos G‑130/G‑131 ni A‑1/A‑4 de Gemini.

**Conflictos a vigilar:** `75-graficos.js`, `99g`, `99p`, `tools/build.js` (compartidos). En caso de conflictos, reconstruir el flujo en torno a `99w` y `99x`, no descartar la geometría y contenido 3.5.

**Criterio de integración:** build, unitarias y batería Chromium verdes en commit final; ensayo preserva los archivos del Metro, performance CPU×4 bajo objetivo, capturas laterales aprobadas, test físico posterior.
