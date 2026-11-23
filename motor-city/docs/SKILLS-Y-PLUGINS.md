# Skills y plugins de agentes para Motor City

> **Regla del proyecto:** el motor (`dist/motor.js`) y los juegos (`dist/juegos/*.html`) siguen siendo **JavaScript puro sin librerías ni dependencias externas en ejecución**. Todas las skills y plugins listados aquí viven únicamente en la **capa de herramientas de desarrollo e IA** (`.claude/skills/` o instalación local en el entorno del desarrollador/agente).

---

## 0. 5.3.1 · Integración automática para todas las IA (Claude, 23‑nov‑2026)
**Un solo comando**, desde la raíz del repositorio: `node motor.mjs skills --integrar --agente <tu-agente>`.
- `<tu-agente>` es `claude-code`, `codex`, `antigravity`, `gemini-cli` o `cursor`.
- En EnCicla, El Metro o Run se usa la copia del motor: `node motor-city/motor.mjs skills --integrar …`.
- El prompt para pasárselo a otra IA: **`docs/PROMPT-SKILLS.md`**.

| Paso | Qué hace |
|---|---|
| 1 | Las skills propias quedan iguales en `.claude/skills/` y en `.agents/skills/` (se suben las dos) |
| 2 | Completa el `.gitignore` para que las externas no se suban |
| 3 | Instala las 4 externas (Hallmark, Modern Web Guidance, find-skills y HyperFrames) con su commit revisado, en el repositorio donde se corre |
| 4 | Verifica. La QA corre `node motor.mjs skills --verificar` |

**Dónde busca cada IA.** Lo comprobé con el instalador oficial en esta máquina y con la documentación de cada una, el 23‑nov‑2026:

| IA | Carpeta del proyecto | Fuente |
|---|---|---|
| Claude Code | `.claude/skills/` (y plugins por `.claude/settings.json`) | — |
| Codex | `.agents/skills/` | [developers.openai.com/codex/skills](https://developers.openai.com/codex/skills) |
| Gemini CLI | `.gemini/skills/` o su alias `.agents/skills/` | [geminicli.com/docs/cli/skills](https://geminicli.com/docs/cli/skills/) |
| Antigravity | `.agents/skills/` (antes `.agent/skills/`) | [antigravity.google/docs/skills](https://antigravity.google/docs/skills) |
| Cursor | `.agents/skills/` (según el instalador) | [vercel-labs/skills](https://github.com/vercel-labs/skills) |

**Lo que se arregló al hacerlo:**
- Las 10 skills del motor solo estaban en `.claude/skills/`, así que Codex, Gemini CLI y Antigravity no las cargaban solas. Ahora tienen su copia en `.agents/skills/`.
- En los juegos hermanos, `--instalar` dejaba las externas dentro de `motor-city/`, donde ninguna IA las encuentra. Ahora van a la raíz git de donde se corre.
- El instalador deja **enlaces** en `.claude/skills/<id>`, y la regla `carpeta/` del `.gitignore` no los ignoraba: un `git add -A` subía 4 enlaces rotos. Ahora van sin barra final, y faltaba `find-skills`.
- `sincronizar` copiaba a los juegos las externas instaladas en el motor. Ya no.

**Claude Code en la nube:** los plugins de `.claude/settings.json` no se ofrecieron en la sesión. Con `--agente claude-code`, las cuatro externas aparecieron al instante en la lista de skills.

## 0b. Desde la 2.10 (Claude, al unir esta entrega)
- **Claude Code** activa solo los plugins Hallmark, Modern Web Guidance y HyperFrames por `.claude/settings.json`, que está en los 4 repositorios. Se aceptan una vez al abrir el proyecto.
- **Codex, Antigravity y Gemini CLI** los instalan con `node motor.mjs skills --instalar --agente codex` (o `antigravity`, `gemini-cli`). La lista está en `skills-externas.json`, con el commit revisado y la licencia de cada uno.
- **El enlace 1 (`ZSpw3yj9x`) es HyperFrames** (`heygen-com/hyperframes`, Apache‑2.0), con sus skills `website-to-video` y `product-launch-video`. Encargo **C‑A12**: el tráiler de Mandados.
- **El enlace 3 (`ZSpw36ySn`)** presenta un «system prompt» filtrado de otra empresa. No se copia ni se usa; de ahí solo quedan las buenas prácticas generales de `CLAUDE.md` y `AGENTS.md` que ya están en `motor-city-revision-ia`.
- **De MiroFish se tomó la idea** como `MC.Publico` y `node motor.mjs publico`: una niña, un abuelo, una gamer y un turista juegan solos y dan su veredicto, como hipótesis y no como verdad.
- **Cuándo usar cada cosa:** la skill `motor-city-skills-externas`.

## 1. Skills integradas en el repositorio (`.claude/skills/`)

Funcionan directamente en **Claude Code, Codex, Gemini (Antigravity / Gemini CLI) y Cursor** sin instalar paquetes extra:

### Skills base del motor (ya existentes)
| Skill | Archivo | Para qué sirve |
|---|---|---|
| `motor-city-desarrollo` | [`.claude/skills/motor-city-desarrollo/SKILL.md`](../.claude/skills/motor-city-desarrollo/SKILL.md) | Orden de módulos `js/`, reglas de cierre único, build, pruebas y sincronización |
| `motor-city-territorio` | [`.claude/skills/motor-city-territorio/SKILL.md`](../.claude/skills/motor-city-territorio/SKILL.md) | Craquear territorios reales (OSM/Overture + SRTM) y generar mundos `MC.Generador` |
| `motor-city-juegos` | [`.claude/skills/motor-city-juegos/SKILL.md`](../.claude/skills/motor-city-juegos/SKILL.md) | Armar juegos/modos sobre Motor City, ciclo principal y piezas listas |
| `motor-city-ciencia` | [`.claude/skills/motor-city-ciencia/SKILL.md`](../.claude/skills/motor-city-ciencia/SKILL.md) | Fórmulas reales en SI con fuente, partida doble, biología e ingeniería |
| `motor-city-arte` | [`.claude/skills/motor-city-arte/SKILL.md`](../.claude/skills/motor-city-arte/SKILL.md) | Ganchos `MC.arte`, pieles, escala 16 px/m, sombras y revisión de atlas |

### Skills nuevas derivadas de los vídeos de herramientas IA (20‑nov‑2026)
| Skill | Archivo | Inspiración verificada | Para qué sirve en Motor City |
|---|---|---|---|
| `motor-city-web-moderna` | [`.claude/skills/motor-city-web-moderna/SKILL.md`](../.claude/skills/motor-city-web-moderna/SKILL.md) | `GoogleChrome/modern-web-guidance` (Apache-2.0) · vídeo `ZSpw3MBBy` | Compatibilidad Baseline móvil (Chrome Android / iOS Safari), Canvas 2D, Pointer Events y respaldos ligeros sin polyfills |
| `motor-city-diseno-ui` | [`.claude/skills/motor-city-diseno-ui/SKILL.md`](../.claude/skills/motor-city-diseno-ui/SKILL.md) | `Nutlope/hallmark` (MIT) · vídeo `ZSpw3DhsN` | Auditoría anti-clichés de IA (*Piso / Reflejo / Acabado*) para HUD, portadas y `412 × 860` sin tapar el centro |
| `motor-city-qa-playwright` | [`.claude/skills/motor-city-qa-playwright/SKILL.md`](../.claude/skills/motor-city-qa-playwright/SKILL.md) | `lackeyjb/playwright-skill` (MIT) y `@playwright/mcp` · vídeos `ZSpw3ESfu` y `ZSpw3yj9x` | Pruebas táctiles `412 × 860`, inspección visual foto a foto, telemetría CPU 4× y captura limpia de demos |
| `motor-city-revision-ia` | [`.claude/skills/motor-city-revision-ia/SKILL.md`](../.claude/skills/motor-city-revision-ia/SKILL.md) | Revisión de código IA, directorios de skills y `666ghj/MiroFish` · vídeos `ZSpw3u8dH`, `ZSpw36ySn`, `ZSpw3hjS4`, `ZSpw3ah5Q` | Lista de revisión de PRs entre IAs, filtro de procedencia/licencia antes de instalar plugins y manejo de simulaciones como hipótesis |

---

## 2. Plugins y repositorios externos verificados (instalación opcional por agente)

Cada herramienta fue verificada en su repositorio oficial (20‑nov‑2026) mediante la API pública de GitHub antes de recomendarla:

| Herramienta / plugin | Repositorio oficial | Licencia | Instalación en Claude Code | Instalación en Antigravity / Gemini / Codex | Política en Motor City |
|---|---|---|---|---|---|
| **Modern Web Guidance** | [`GoogleChrome/modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance) | Apache-2.0 | `claude plugin marketplace add GoogleChrome/modern-web-guidance` → `claude plugin install modern-web-guidance@googlechrome` | `npx modern-web-guidance@latest install` (soporta Antigravity, Gemini CLI y Codex) | **Recomendado** como plugin de desarrollo; su resumen nativo ya está en `motor-city-web-moderna`. |
| **Hallmark** | [`Nutlope/hallmark`](https://github.com/Nutlope/hallmark) | MIT | `npx skills add nutlope/hallmark -g` | `npx skills add nutlope/hallmark -g` | **Recomendado** para auditar portadas y páginas (`/hallmark audit`); sus criterios clave ya están en `motor-city-diseno-ui`. |
| **Playwright Skill / MCP** | [`lackeyjb/playwright-skill`](https://github.com/lackeyjb/playwright-skill) · [Playwright Plugin](https://claude.com/marketplace/plugins/playwright) | MIT / Apache-2.0 | `claude plugin install playwright` o `npx skills add lackeyjb/playwright-skill` | `npx skills add lackeyjb/playwright-skill` + Chromium local (`MC_CHROMIUM=/usr/bin/chromium`) | **Recomendado** para QA táctil y capturas; el flujo del proyecto ya está en `motor-city-qa-playwright`. |
| **MiroFish** | [`666ghj/MiroFish`](https://github.com/666ghj/MiroFish) | **AGPL-3.0** | No es plugin de Claude Code (app externa) | Ejecución externa opcional (Docker/Python) | **Solo herramienta externa de hipótesis.** Por licencia **AGPL-3.0** y dependencia de servidor/LLM, **nunca** se integra ni empaqueta en el motor. Sus simulaciones deben contrastarse con jugadores reales. |

---

## 3. Trazabilidad de los 10 enlaces nuevos (20‑nov‑2026)

> **Transparencia:** en el entorno de Gemini (Antigravity) los 8 enlaces cortos de TikTok (`vt.tiktok.com`) y las 2 publicaciones de Instagram devolvieron bloqueo de acceso/inicio de sesión (no se evadió ningún muro). La identificación inicial del contenido visual de los 8 vídeos de TikTok proviene de la auditoría de 3 fotogramas por vídeo registrada por ChatGPT/Codex en [`ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`](../ENTREGA-CHATGPT-MOTOR-CITY-2.6.md) (Motor City 2.9.1), contrastada luego por Gemini contra los repositorios oficiales en GitHub.

| # | Enlace | Qué cubre (según auditoría 2.9.1 + verificación GitHub) | Dónde quedó en Motor City |
|---|---|---|---|
| 1 | `https://vt.tiktok.com/ZSpw3yj9x/` | Herramienta para generar vídeo de lanzamiento a partir de un proyecto web (sin repo único confirmado) | Patrón de captura de demos reales incluido en `motor-city-qa-playwright` |
| 2 | `https://vt.tiktok.com/ZSpw3ah5Q/` | **MiroFish** (`666ghj/MiroFish`, AGPL-3.0): simulación multi-agente de reacciones a productos | Documentado como herramienta externa de hipótesis en §2 y `motor-city-revision-ia` |
| 3 | `https://vt.tiktok.com/ZSpw36ySn/` | Documento de instrucciones de un asistente (buenas prácticas de `CLAUDE.md`/`AGENTS.md`) | Reglas verificables reforzadas en `motor-city-revision-ia` |
| 4 | `https://vt.tiktok.com/ZSpw3u8dH/` | Revisión de código generado por IA | Lista de chequeo formalizada en `motor-city-revision-ia` |
| 5 | `https://vt.tiktok.com/ZSpw3hjS4/` | Buscador/directorio de skills para agentes | Criterios de procedencia y licencia antes de instalar en `motor-city-revision-ia` |
| 6 | `https://vt.tiktok.com/ZSpw3MBBy/` | **Modern Web Guidance** (`GoogleChrome/modern-web-guidance`, Apache-2.0) | Skill nativa `motor-city-web-moderna` + comandos de plugin en §2 |
| 7 | `https://vt.tiktok.com/ZSpw3DhsN/` | **Hallmark** (`Nutlope/hallmark`, MIT): auditoría anti-patrones genéricos de diseño web | Skill nativa `motor-city-diseno-ui` + comandos de instalación en §2 |
| 8 | `https://vt.tiktok.com/ZSpw3ESfu/` | Diseño y pruebas de interfaz con **Playwright** (`lackeyjb/playwright-skill`, MIT / `@playwright/mcp`) | Skill nativa `motor-city-qa-playwright` + comandos de plugin en §2 |
| 9 | `https://www.instagram.com/p/DfVDgmclLPi/?img_index=6` | Carrusel de herramientas para Claude (enlace enviado 2 veces; **imagen 6 no recuperable** detrás de inicio de sesión) | **Pendiente:** si el autor sube la captura de la diapositiva 6 o el nombre de la herramienta, se evalúa e integra aquí |
| 10 | `https://www.instagram.com/p/DexJDYnNQ0X/` | Publicación de Instagram (**contenido visual no recuperable** detrás de inicio de sesión) | **Pendiente:** si el autor comparte la captura o enlace del repositorio, se evalúa e integra aquí |
