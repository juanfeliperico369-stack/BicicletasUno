# Instrucciones para agentes (Codex, Gemini, Claude, Cursor…)

> **Pedido vigente del autor (25‑nov‑2026), manda sobre lo demás: `docs/PEDIDO-DEL-AUTOR-2026-11-25.md`.** Pide el mundo 3D cenital con **una sola cámara**: centrada, se mueve, se acerca hasta casi tercera persona, y las demás cámaras se eliminaron. Pide también que **nada quede pintado en el suelo**, el 2D y el pixel solo en los modos ya establecidos, la carga del mundo sin huecos, la fluidez y los controles a gusto. Está palabra por palabra, con lo hecho y las fases que faltan. Léelo antes de tocar cámaras, vistas o el arte del mundo.

> **Relevo vigente (25‑nov‑2026): `docs/PROMPT-RELEVO.md`.** Lo primero es el **«renacimiento cenital»**: sanear el mapa del Valle, un cenital 2.5D en El Metro y EnCicla, y carreras pseudo‑3D en Turno Cero. Va fase por fase y con el OK del autor. La Fase 0 está en `docs/AUDITORIA-FASE0-CENITAL.md`, y el autor ya tomó las decisiones (§ 3 del prompt). **Las fases 1 (el Valle saneado, Motor del Valle 1.3.0), 2 (el cenital con bandera; Motor City 5.3.2 con los mundos saneados), 3 (la bandera encendida: El Metro 3.9.0 y EnCicla 3.9.0 con las huellas reales; Motor del Valle 1.3.1) 4 (`MC.Pista`, las carreras retro de Turno Cero; Motor City 5.4.0) y 5 (las cápsulas, 🧰 el garaje y 📏 en el celular; Motor City 5.4.1) están hechas** en la rama `ccr-4f6eeea5-yulqk1` (`reportes/2026-11-24-claude-fase1-cenital.md`, `reportes/2026-11-24-claude-fase2-cenital.md`, `reportes/2026-11-25-claude-fase3-cenital.md` `reportes/2026-11-25-claude-fase4-pista.md` y `reportes/2026-11-25-claude-fase5-capsulas.md`); todo quedó publicado el 25‑nov (EnCicla 3.9.0, El Metro 3.10.0 y Motor City 5.4.1, con sus APK; los enlaces están en `docs/PROMPT-RELEVO.md`). La misión y la visión están en `docs/VISION-Y-MISION.md`.

> **5.0 · El plan es `docs/PLAN-5.0.md`.** ChatGPT y Codex (lo fuerte): **`docs/PEDIDOS-CHATGPT-5.0.md`**. Gemini y Antigravity (lo fácil y mediano): **`docs/PEDIDOS-GEMINI-5.0.md`**.
> **Primero lee `CONTEXTO-RELEVO.md`:** el relevo entre IAs (plan, lo hecho, lo que falta y el protocolo `coord/`). Al terminar tu turno, **deja tu entrada en su § 8** y tu ficha en `coord/agentes/`. Pídele lo mismo a la IA que siga.


> **¿Te dijeron «mira el repositorio y haz tu parte»?** Abre **`TAREAS-IA.md`**: la lista corta de tu IA, en orden. Gemini con Antigravity usa ahora «hydrogen» (tareas fáciles); ChatGPT con Codex usa «astra» (arte y código fuertes).

**Lee primero `docs/DOCUMENTO-UNICO.md`** (todo el contexto, el código a usar y el plan de cada IA). Después, si vas a tocar el motor: `CONTEXTO-IA.md` → `MOTOR.md` → `CONTRIBUIR.md`. Todo junto en un archivo: `node motor.mjs documento` → `dist/MOTOR-CITY-TODO.md`.

Las skills del proyecto están en `.agents/skills/` (Codex, Antigravity, Gemini CLI y Cursor las cargan solas) y en `.claude/skills/` (Claude Code). **Síguelas aunque no seas Claude:**

| Skill | Para qué |
|---|---|
| `motor-city-desarrollo` | Desarrollar el motor |
| `motor-city-territorio` | Mapas y mundos |
| `motor-city-juegos` | Hacer juegos |
| `motor-city-ciencia` | Números reales |
| `motor-city-arte` | Arte |
| `motor-city-web-moderna` | Plataforma web moderna y Baseline (basada en Modern Web Guidance) |
| `motor-city-diseno-ui` | Auditoría anti-clichés de IA para HUD y portadas (basada en Hallmark) |
| `motor-city-qa-playwright` | QA táctil `412 × 860`, inspección visual y telemetría con Playwright |
| `motor-city-revision-ia` | Revisión de PRs IA, procedencia de plugins y simulación como hipótesis |

Catálogo de plugins externos verificados y sus comandos de instalación: `docs/SKILLS-Y-PLUGINS.md`.

**Integra las skills con un comando (5.3.1):** `node motor.mjs skills --integrar --agente codex` (o `antigravity`, `gemini-cli`, `cursor`, `claude-code`).
- Deja las propias en las dos carpetas, completa el `.gitignore`, instala las 4 externas con su commit revisado y lo verifica.
- Las externas no se suben.
- Los pasos y las reglas, para pasárselos a otra IA: `docs/PROMPT-SKILLS.md`.

**Comandos:** `node motor.mjs construir` · `node motor.mjs prueba --navegador` (todo en verde) · `node motor.mjs reporte "título" --juego X` (obligatorio si cambias el motor desde otro juego) · `node motor.mjs documento`.
