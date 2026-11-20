---
name: motor-city-skills-externas
description: Cuándo y cómo usar en Motor City las skills y plugins de terceros que pidió el autor (Hallmark para páginas web, Modern Web Guidance para HTML/CSS/JS moderno, find-skills para buscar skills, HyperFrames para videos de lanzamiento) y el público simulado (MC.Publico, idea de MiroFish). Úsala antes de hacer una página web de un juego, un tráiler, al escribir código del navegador o al buscar una skill nueva.
---

# Skills externas en Motor City

El catálogo está en `skills-externas.json` (repositorio, commit revisado, licencia, para qué sí y para qué no). `node motor.mjs skills` lo muestra.

## Instalarlas
- **Claude Code:** vienen como plugins en `.claude/settings.json`. Al abrir el proyecto se aceptan una vez: Hallmark, Modern Web Guidance y HyperFrames.
- **Codex, Antigravity, Gemini CLI y Claude (find-skills):** `node motor.mjs skills --instalar --agente codex`. También sirve con `antigravity`, `gemini-cli` o `claude-code`. Usa el instalador oficial (`npx skills add …`) y deja las skills en `.agents/skills/` o `.claude/skills/`, que **no se suben** (están en `.gitignore`).
- Necesitan internet y Node 22. Se instalan **en la máquina de la IA**. Nunca van dentro del HTML de un juego.

## Cuál usar
| Tarea | Skill | Regla de Motor City encima |
|---|---|---|
| Portada web de un juego, prensa o landing (GitHub Pages) | **Hallmark** (`/hallmark`, `/hallmark audit <archivo>`) | Español de Colombia y todo público. Nada inventado: ni cifras, ni testimonios, ni logos. Las capturas son reales (`node motor.mjs capturas`). |
| Cualquier HTML, CSS o JS del navegador (menús, diálogos, accesibilidad, rendimiento) | **Modern Web Guidance** (`npx -y modern-web-guidance@latest search "…"`, `retrieve`, `legacy-scan`) | La **política de navegadores** de abajo. Un solo HTML, sin librerías. |
| Tráiler o video de lanzamiento | **HyperFrames** | Se hace con capturas reales del juego. El video es aparte; el juego no cambia. |
| «¿Hay una skill para…?» | **find-skills** (`npx skills find …`) | Solo de fuentes conocidas y con más de 1.000 instalaciones. Se revisa y se anota en `skills-externas.json` antes de usarla. |
| Probar con gente antes de publicar | **MC.Publico** (`node motor.mjs publico`) | Es una prueba de humo, no reemplaza a la gente de verdad. Mira el informe `dist/publico.md`. |
| Probar la web en un navegador | `webapp-testing` (Playwright) | Ya está en las pruebas: `node motor.mjs prueba --navegador`. |

## Política de navegadores (pedida por Modern Web Guidance)
- **Baseline ampliamente disponible.** Eso incluye ES2023: `toSorted`, `toReversed`, `structuredClone` y `replaceChildren`.
- **Lo más nuevo** (Baseline 2024 en adelante, `Promise.withResolvers`, `ctx.filter` en Safari menor a 18…) solo con detección y un respaldo de **20 líneas o menos, sin dependencias**. Ejemplo: el respaldo de `js/00-nucleo.js` y `Estilo._filtros()` en `js/16-estilos.js`.
- Celulares de referencia:
  - Android 7 con WebView 119 o más;
  - iPhone 8 o X con iOS 16 (Safari 16).
- El guardado se copia con JSON a propósito: así cada valor por defecto es serializable igual que un guardado. No lo cambies por `structuredClone`.

## Lo que no se usa
- **MiroFish** (AGPL, aplicación aparte con servidor y llaves). Solo se tomó la idea: `MC.Publico`.
- Material filtrado de terceros, por ejemplo «system prompts» filtrados. No se copia ni se usa.
- Una skill que no esté en el catálogo. Primero se revisa (lee su SKILL.md y sus scripts) y se anota.

## Reglas aprendidas
- `legacy-scan` revisa solo ~20 % de las guías. Verifica cada hallazgo con su `keepWhen` y su `dropWhen` antes de cambiar código.
- La salida de Hallmark se revisa con `sloplint`. En Motor City aplica a páginas web, no al lienzo del juego.
