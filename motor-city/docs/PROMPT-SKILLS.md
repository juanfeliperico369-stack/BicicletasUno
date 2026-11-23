# Prompt de skills · para compartir entre IA (Motor City 5.3.1, 23‑nov‑2026)

> Cópialo entero a la IA que vaya a trabajar en el proyecto: otra sesión de Claude, ChatGPT/Codex, Gemini/Antigravity, Gemini CLI, Cursor o cualquier otra.
> Con él, la IA deja listas sola las skills y los plugins del proyecto, los comprueba y te informa.
> La lista viva la da `node motor.mjs skills`. Si cambia el catálogo (`skills-externas.json`), actualiza también este prompt.

---

Vas a integrar en tu entorno las skills y los plugins del proyecto **Motor City**: el motor y sus juegos (Turno Cero, Juega EnCicla, El Metro y Run Scooter). Hazlo tú sola, de principio a fin, sin pedir permiso para cada paso. Solo pregunta si te falta algo que únicamente puede dar el autor.

## 1. Lo que hay
**Propias.** Vienen en el repositorio y no hay que instalar nada.

| Repositorio | Skills |
|---|---|
| `motorcity` (10) | `motor-city-desarrollo` (el código del motor), `motor-city-territorio` (mapas y mundos), `motor-city-juegos` (juegos y modos), `motor-city-ciencia` (números reales), `motor-city-arte` (arte), `motor-city-skills-externas` (cuándo usar las externas), `motor-city-web-moderna` (Baseline), `motor-city-diseno-ui` (HUD y portadas sin clichés), `motor-city-qa-playwright` (QA táctil en 412 × 860) y `motor-city-revision-ia` (revisar cambios de otras IA) |
| `MetroZero` (8) | `el-metro-desarrollo`, `el-metro-arte`, `el-metro-calidad-movil`, `medellin-fiel` y `coordinacion-multi-ia`, más tres copias de skills públicas de Anthropic (Apache‑2.0): `frontend-design`, `webapp-testing` y `skill-creator` |
| `BicicletasUno` y `RunRunZero` | Ninguna en la raíz. Sus reglas están en `CLAUDE.md`, `AGENTS.md` y `GEMINI.md`, y las skills del motor, en `motor-city/.claude/skills/` |

**Externas.** Están fijadas a un commit revisado en `skills-externas.json`. Cada IA las instala en su máquina y **no se suben**.

| Skill | Repositorio · licencia | Para qué | Para qué no |
|---|---|---|---|
| `hallmark` | `Nutlope/hallmark` · MIT | Páginas web de los juegos (portadas, prensa) que no parezcan hechas por IA | El lienzo y la interfaz dentro del juego |
| `modern-web-guidance` | `GoogleChrome/modern-web-guidance` · Apache‑2.0 | Todo HTML, CSS y JS del navegador | Node, Python, la tubería de mapas y las pruebas |
| `find-skills` | `vercel-labs/skills` · MIT | Buscar una skill que falte | Instalar sin revisar |
| `hyperframes` | `heygen-com/hyperframes` · Apache‑2.0 | Tráileres y videos de lanzamiento con capturas reales | Nada dentro del HTML del juego |

**Plugins de Claude Code** (en `.claude/settings.json` de los cuatro repositorios): `hallmark@hallmark`, `modern-web-guidance@googlechrome` y `hyperframes@hyperframes`.

**Solo la idea:**
- MiroFish (AGPL): se tomó como `MC.Publico` (`node motor.mjs publico`).
- Playwright: ya está en `webapp-testing` y en las pruebas.

**Descartado:** un «system prompt» filtrado de otra empresa.

## 2. Si tienes terminal y el repositorio (Claude Code, Codex, Gemini CLI, Antigravity, Cursor…)
1. Ponte al día: `git pull` en la rama en la que trabajas. Si no tienes el repositorio, clónalo: `git clone https://github.com/juanfeliperico369-stack/motorcity` (los juegos están en `BicicletasUno`, `MetroZero` y `RunRunZero`, de la misma cuenta).
2. Corre **un solo comando** desde la raíz del repositorio:
   - en `motorcity`: `node motor.mjs skills --integrar --agente <tu-agente>`;
   - en `BicicletasUno`, `MetroZero` o `RunRunZero`: `node motor-city/motor.mjs skills --integrar --agente <tu-agente>`.

   `<tu-agente>` es `claude-code`, `codex`, `antigravity`, `gemini-cli` o `cursor`. Si usas varios, sepáralos con comas: `--agente codex,claude-code`.
3. El comando hace cuatro cosas:
   1. deja las skills propias iguales en `.claude/skills/` (las lee Claude Code) y en `.agents/skills/` (las leen Codex, Antigravity, Gemini CLI y Cursor);
   2. completa el `.gitignore` para que las externas nunca se suban;
   3. instala las cuatro externas con el instalador oficial (`npx skills add`) y su commit revisado;
   4. lo verifica todo.
4. Necesita Node 22 e internet (npm y GitHub). Sin internet, corre `--integrar --sin-externas`: deja listas las propias, y en tu informe dices qué faltó.

## 3. Comprueba que quedó bien
- El comando debe terminar con **«4) Verificación: ✓ todo en orden»** y salir con 0.
- `git status` no debe mostrar `hallmark`, `modern-web-guidance`, `find-skills`, `hyperframes` ni `skills-lock.json`.
- En tu IA, abre la lista de skills (por ejemplo, `/skills`) y confirma que aparecen las propias y las cuatro externas. Si no aparecen, abre una sesión nueva.
- En Claude Code, los tres plugins de `.claude/settings.json` se aceptan al confiar en el proyecto. Si no aparecen (por ejemplo, en una sesión en la nube), basta con haber corrido el comando con `--agente claude-code`.
- `node motor.mjs skills` muestra la lista completa, y con `--json` la entrega en JSON.

## 4. Úsalas así
| Tarea | Skill |
|---|---|
| Tocar el código del motor | `motor-city-desarrollo`, y la del área: `territorio`, `juegos`, `ciencia` o `arte` |
| Tocar El Metro | `el-metro-desarrollo`, y también `el-metro-arte`, `medellin-fiel` o `el-metro-calidad-movil` |
| Cualquier HTML, CSS o JS del navegador | `modern-web-guidance` + `motor-city-web-moderna` (la política de navegadores) |
| Una portada web o una página de prensa | `hallmark` + `motor-city-diseno-ui` |
| Un tráiler o un video | `hyperframes`, con capturas reales (`node motor.mjs capturas`) |
| Probar en el celular (412 × 860) | `motor-city-qa-playwright` o `webapp-testing` |
| Revisar la rama de otra IA | `motor-city-revision-ia`, y `coordinacion-multi-ia` si trabajan al tiempo |
| Buscar una skill que falta | `find-skills` |

## 5. Reglas
- **Las externas no se suben** ni van dentro del HTML de un juego: el juego sigue sin librerías ni internet.
- **Una skill nueva de terceros** solo entra así:
  1. búscala con `find-skills`: tiene que ser de una fuente conocida y tener más de 1.000 instalaciones;
  2. lee su `SKILL.md` y sus scripts;
  3. anótala en `skills-externas.json`, con el commit de 40 caracteres, la licencia, para qué sirve, para qué no y quién la usa;
  4. corre `--integrar` y sube solo el catálogo.
- **Una skill propia nueva o cambiada:**
  1. escríbela en `.claude/skills/<nombre>/SKILL.md`, con `name` (igual al nombre de la carpeta) y `description`;
  2. corre `node motor.mjs skills --sincronizar`;
  3. sube las dos carpetas.

  Para borrar una, bórrala de las dos.

  **En El Metro es al revés:** la fuente es `.agents/skills/`. Edita ahí y corre `node tools/skills.mjs` (o `--sincronizar --desde agents`).
- Si `--sincronizar` dice que una skill quedó **distinta en las dos carpetas**, no pisa nada. Mira cuál es la buena y repite con `--desde claude` o `--desde agents`.
- Nunca subas llaves. El correo del autor es privado. No hagas un pull request si el autor no lo pide.

## 6. Si eres un chat sin terminal (ChatGPT o Gemini en la web, un Gem o un Proyecto)
No puedes instalar nada. Lee en GitHub `docs/SKILLS-Y-PLUGINS.md` (<https://github.com/juanfeliperico369-stack/motorcity>) y el `SKILL.md` de tu rol: los del motor están en `.claude/skills/`; los de El Metro, en `.agents/skills/` del repositorio `MetroZero`. Copia sus reglas en las instrucciones de tu Gem o de tu Proyecto:
- **artista:** `el-metro-arte` y `motor-city-arte`;
- **mapas:** `medellin-fiel` y `motor-city-territorio`;
- **páginas web:** `motor-city-diseno-ui` y `motor-city-web-moderna`.

Dile al autor qué copiaste.

## 7. Informa en 4 líneas
- qué agente eres;
- el comando que corriste y su resultado (la línea «4) Verificación»);
- qué skills ves en tu lista;
- qué falló y por qué.

Deja ese informe en `coord/buzon/AAAAMMDD-HHMM-<tu-id>-skills.md`, en el repositorio del motor.
