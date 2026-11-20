# Instrucciones para agentes (Codex, Gemini, Claude, Cursor…)

> **¿Te dijeron «mira el repositorio y haz tu parte»?** Abre **`TAREAS-IA.md`**: la lista corta de tu IA, en orden. Gemini con Antigravity usa ahora «hydrogen» (tareas fáciles); ChatGPT con Codex usa «astra» (arte y código fuertes).

**Lee primero `docs/DOCUMENTO-UNICO.md`** (todo el contexto, el código a usar y el plan de cada IA). Después, si vas a tocar el motor: `CONTEXTO-IA.md` → `MOTOR.md` → `CONTRIBUIR.md`. Todo junto en un archivo: `node motor.mjs documento` → `dist/MOTOR-CITY-TODO.md`.

Las skills del proyecto están en `.claude/skills/`. **Síguelas aunque no seas Claude:**

| Skill | Para qué |
|---|---|
| `motor-city-desarrollo` | Desarrollar el motor |
| `motor-city-territorio` | Mapas y mundos |
| `motor-city-juegos` | Hacer juegos |
| `motor-city-ciencia` | Números reales |
| `motor-city-arte` | Arte |
| `motor-city-skills-externas` | Skills y plugins de terceros: Hallmark (páginas web), Modern Web Guidance (HTML/CSS/JS moderno), find-skills, HyperFrames (videos) y el público simulado |

**Skills externas:**
- Claude Code las recibe como plugins por `.claude/settings.json`.
- Las demás IA las instalan con `node motor.mjs skills --instalar --agente codex` (o `antigravity`, `gemini-cli`).

**Navegadores:**
- Baseline ampliamente disponible (incluye ES2023).
- Lo más nuevo solo con detección y un respaldo de 20 líneas o menos, sin dependencias.
- Celulares de referencia: Android 7 (WebView 119 o más) e iPhone 8/X (iOS 16).

**Comandos:** `node motor.mjs construir` · `node motor.mjs prueba --navegador` (todo en verde) · `node motor.mjs publico` (el público simulado juega Mandados) · `python3 herramientas/aligerar_arte.py` (atlas más livianos) · `node motor.mjs reporte "título" --juego X` (obligatorio si cambias el motor desde otro juego) · `node motor.mjs documento`.
