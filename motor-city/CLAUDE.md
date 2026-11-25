# Instrucciones para agentes (Codex, Gemini, Claude, Cursor…)

> **Relevo vigente (25‑nov‑2026): `docs/PROMPT-RELEVO.md`.** Lo primero es el **«renacimiento cenital»**: sanear el mapa del Valle, un cenital 2.5D en El Metro y EnCicla, y carreras pseudo‑3D en Turno Cero. Va fase por fase y con el OK del autor. La Fase 0 está en `docs/AUDITORIA-FASE0-CENITAL.md`, y el autor ya tomó las decisiones (§ 3 del prompt). **Las fases 1 (el Valle saneado, Motor del Valle 1.3.0), 2 (el cenital con bandera; Motor City 5.3.2 con los mundos saneados), 3 (la bandera encendida: El Metro 3.9.0 y EnCicla 3.9.0 con las huellas reales; Motor del Valle 1.3.1) y 4 (`MC.Pista`, las carreras retro de Turno Cero; Motor City 5.4.0) están hechas** en la rama `ccr-4f6eeea5-yulqk1` (`reportes/2026-11-24-claude-fase1-cenital.md`, `reportes/2026-11-24-claude-fase2-cenital.md`, `reportes/2026-11-25-claude-fase3-cenital.md` y `reportes/2026-11-25-claude-fase4-pista.md`); sigue la Fase 5 (Turno Cero en cápsulas y en el celular). La misión y la visión están en `docs/VISION-Y-MISION.md`.

> **¿Te dijeron «mira el repositorio y haz tu parte»?**
> - **Si eres ChatGPT o Codex:** abre **`docs/PEDIDOS-CHATGPT-5.0.md`** (lo fuerte: datos, render, física, IA y modelos).
> - **Si eres Gemini o Antigravity:** abre **`docs/PEDIDOS-GEMINI-5.0.md`** (lo fácil y mediano: interfaz, cámara, textos, arte y modos).
> - **El plan de la 5.0** (los motores de los que se toman ideas y quién hace qué): `docs/PLAN-5.0.md`.
> - **Cualquier otra IA:** `TAREAS-IA.md`.

**Lee primero `CONTEXTO-RELEVO.md`** (el relevo entre IAs: plan, hecho, falta; al terminar, deja tu entrada) y luego **`docs/DOCUMENTO-UNICO.md`** (todo el contexto, el código a usar y el plan de cada IA). Después, si vas a tocar el motor: `CONTEXTO-IA.md` → `MOTOR.md` → `CONTRIBUIR.md`. Todo junto en un archivo: `node motor.mjs documento` → `dist/MOTOR-CITY-TODO.md`.

Las skills del proyecto están en `.claude/skills/` y su copia en `.agents/skills/`, que Codex, Antigravity, Gemini CLI y Cursor cargan solas. **Síguelas aunque no seas Claude:**

| Skill | Para qué |
|---|---|
| `motor-city-desarrollo` | Desarrollar el motor |
| `motor-city-territorio` | Mapas y mundos |
| `motor-city-juegos` | Hacer juegos |
| `motor-city-ciencia` | Números reales |
| `motor-city-arte` | Arte |
| `motor-city-skills-externas` | Skills y plugins de terceros: Hallmark (páginas web), Modern Web Guidance (HTML/CSS/JS moderno), find-skills, HyperFrames (videos) y el público simulado |
| `motor-city-web-moderna` | Plataforma web moderna y Baseline (basada en Modern Web Guidance) |
| `motor-city-diseno-ui` | Auditoría anti-clichés de IA para HUD y portadas (basada en Hallmark) |
| `motor-city-qa-playwright` | QA táctil `412 × 860`, inspección visual y telemetría con Playwright |
| `motor-city-revision-ia` | Revisión de PRs IA, procedencia de plugins y simulación como hipótesis |

Catálogo de plugins externos verificados y sus comandos de instalación:
- `docs/SKILLS-Y-PLUGINS.md`, de Gemini;
- `skills-externas.json`, la lista que lee `node motor.mjs skills`.

**Skills externas e integración (5.3.1):**
- Cualquier IA deja todo listo con un comando: `node motor.mjs skills --integrar --agente <tu-agente>` (`claude-code`, `codex`, `antigravity`, `gemini-cli` o `cursor`).
- El prompt para pasárselo a otra IA está en `docs/PROMPT-SKILLS.md`.
- Claude Code también las recibe como plugins por `.claude/settings.json`.
- Una skill propia se edita en `.claude/skills/` y se copia con `node motor.mjs skills --sincronizar`.

**Navegadores:**
- Baseline ampliamente disponible (incluye ES2023).
- Lo más nuevo solo con detección y un respaldo de 20 líneas o menos, sin dependencias.
- Celulares de referencia: Android 7 (WebView 119 o más) e iPhone 8/X (iOS 16).

**Comandos:** `node motor.mjs construir` · `node motor.mjs prueba --navegador` (todo en verde) · `node motor.mjs publico` (el público simulado juega Mandados) · `python3 herramientas/aligerar_arte.py` (atlas más livianos) · `node motor.mjs reporte "título" --juego X` (obligatorio si cambias el motor desde otro juego) · `node motor.mjs documento`.
