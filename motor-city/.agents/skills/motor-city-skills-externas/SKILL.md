---
name: motor-city-skills-externas
description: Cuándo y cómo usar en Motor City las skills y plugins de terceros que pidió el autor (Hallmark para páginas web, Modern Web Guidance para HTML/CSS/JS moderno, find-skills para buscar skills, HyperFrames para videos de lanzamiento) y el público simulado (MC.Publico, idea de MiroFish). Úsala antes de hacer una página web de un juego, un tráiler, al escribir código del navegador o al buscar una skill nueva.
---

# Skills externas en Motor City

El catálogo está en `skills-externas.json` (repositorio, commit revisado, licencia, para qué sí y para qué no). `node motor.mjs skills` muestra todo: las propias, las externas y los plugins (`--json` para otras herramientas).

## Integrarlas (5.3.1: un solo comando)
- **Cualquier IA con terminal**, desde la raíz del repositorio: `node motor.mjs skills --integrar --agente <tu-agente>`.
  - `<tu-agente>` es `claude-code`, `codex`, `antigravity`, `gemini-cli` o `cursor`.
  - En un juego hermano se usa la copia del motor: `node motor-city/motor.mjs skills --integrar …`.
- **Qué hace:**
  1. deja las propias iguales en `.claude/skills/` (Claude Code) y en `.agents/skills/` (Codex, Antigravity, Gemini CLI y Cursor);
  2. completa el `.gitignore`;
  3. instala las 4 externas con el instalador oficial (`npx skills add`) y su commit revisado, en el repositorio donde se corre;
  4. lo verifica.
- **Claude Code** también las recibe como plugins por `.claude/settings.json`, que se aceptan al abrir el proyecto. En una sesión en la nube no se ofrecen: ahí se usa `--agente claude-code`.
- **Las externas no se suben** (están en `.gitignore`).
  - Necesitan internet y Node 22, y se instalan **en la máquina de la IA**.
  - Nunca van dentro del HTML de un juego.
- **Una skill propia** se edita en `.claude/skills/<nombre>/` y se copia con `node motor.mjs skills --sincronizar`. La QA corre `node motor.mjs skills --verificar`.
- **El prompt para pasárselo a otra IA:** `docs/PROMPT-SKILLS.md`.

## Las skills propias del proyecto que salieron de los mismos videos (entrega de Gemini 2.9.1)
Úsalas primero, porque no necesitan instalar nada:
- `motor-city-web-moderna`: Baseline y Modern Web Guidance;
- `motor-city-diseno-ui`: el piso anti-clichés de Hallmark para el HUD y las portadas;
- `motor-city-qa-playwright`: pruebas táctiles en 412 × 860;
- `motor-city-revision-ia`: revisión de cambios hechos por IA, procedencia de los plugins y la simulación como hipótesis.

El catálogo completo, con la trazabilidad de los enlaces, está en `docs/SKILLS-Y-PLUGINS.md`.

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
- **5.3.1 · El instalador** (`npx skills add`, probado el 23-nov-2026) se comporta así:
  - con Codex, Antigravity, Gemini CLI o Cursor deja la carpeta en `.agents/skills/<id>` y, si también va Claude Code, un **enlace** en `.claude/skills/<id>`;
  - con Claude Code solo, deja una copia en `.claude/skills/<id>`;
  - siempre escribe `skills-lock.json`.
- **En `.gitignore`, `carpeta/` no ignora un enlace.** Por eso las entradas de las externas van sin barra final. Con la barra, `git add -A` subía los 4 enlaces rotos.
- **En un juego hermano, el destino es la raíz git de donde se corre.** Antes se instalaba dentro de `motor-city/`, donde ninguna IA las encuentra.
