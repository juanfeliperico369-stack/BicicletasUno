# Instrucciones para agentes (Codex, Gemini, Claude, Cursor…)

> **Primero lee `CONTEXTO-RELEVO.md`:** el relevo entre IAs (plan, lo hecho, lo que falta y el protocolo `coord/`). Al terminar tu turno, **deja tu entrada en su § 8** y tu ficha en `coord/agentes/`. Pídele lo mismo a la IA que siga.


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
| `motor-city-web-moderna` | Plataforma web moderna y Baseline (basada en Modern Web Guidance) |
| `motor-city-diseno-ui` | Auditoría anti-clichés de IA para HUD y portadas (basada en Hallmark) |
| `motor-city-qa-playwright` | QA táctil `412 × 860`, inspección visual y telemetría con Playwright |
| `motor-city-revision-ia` | Revisión de PRs IA, procedencia de plugins y simulación como hipótesis |

Catálogo de plugins externos verificados y sus comandos de instalación: `docs/SKILLS-Y-PLUGINS.md`.

**Comandos:** `node motor.mjs construir` · `node motor.mjs prueba --navegador` (todo en verde) · `node motor.mjs reporte "título" --juego X` (obligatorio si cambias el motor desde otro juego) · `node motor.mjs documento`.
