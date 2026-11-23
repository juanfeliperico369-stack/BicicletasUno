# Prompt de relevo · Motor City 5.3.0 (23‑nov‑2026)

> Cópialo entero a la IA que siga: otra sesión de Claude, ChatGPT/Codex, Gemini/Antigravity o cualquier otra.
> Lo escribió Claude al cerrar la 5.3.0. El estado al detalle está en `CONTEXTO-RELEVO.md` (§ 0 y § 8).

---

Vas a continuar el proyecto **Motor City**, un motor de juegos en un solo HTML, sin internet, con mapas reales de Medellín, Nueva York y Guatapé, y sus juegos. Toma el relevo de Claude sin romper nada de lo que ya funciona.

## 1. Los cuatro repositorios (rama de trabajo de Claude: `claude/motor-city-engine-xu7p4y`)
| Repositorio | Qué es | Versión | Compilar | Probar |
|---|---|---|---|---|
| `juanfeliperico369-stack/motorcity` | El motor y **Turno Cero** (18+), el juego de prueba con todo | **5.3.0** | `node herramientas/construir.mjs` | `node pruebas/prueba.mjs --navegador` y las de `pruebas/` (la lista está en `.github/workflows/motor-city-qa.yml`) |
| `juanfeliperico369-stack/BicicletasUno` | **Juega EnCicla** (familia) | **3.7.0** en `main` | `node tools/build.js` | `node tests/run.js` |
| `juanfeliperico369-stack/MetroZero` | **El Metro** (familia) | **3.8.0** | `node tools/build.mjs` | `node tools/test.mjs 100` (0 errores) |
| `juanfeliperico369-stack/RunRunZero` | **Run Scooter** (familia) | — | `node tools/build.mjs` | `node tools/sim.mjs 100 240` |

Los juegos hermanos llevan una copia de referencia del motor en `motor-city/` y un informe en `docs/INFORME-MOTOR-CITY-4.6.md`.

## 2. Lee primero, en este orden
1. `CONTEXTO-RELEVO.md`, del motor: el § 0 (lo publicado) y las últimas entradas del § 8.
2. `docs/PLAN-5.0.md` (las fases) y `BITACORA.md` (entradas 5.0 a 5.3).
3. `docs/PEDIDOS-CHATGPT-5.0.md` y `docs/PEDIDOS-GEMINI-5.0.md`: la sección «★ Estado 5.3» dice qué tiene cada IA.
4. El `CLAUDE.md`, el `AGENTS.md` o el `GEMINI.md` de cada repositorio que toques, y sus skills en `.claude/skills/`.

## 3. Qué sigue, por prioridad
1. **Fase 4 del plan («contenido en serie»):**
   - un lenguaje de misiones con pasos, fallas y reintentos;
   - repeticiones exactas: grabar la entrada y reproducirla con la misma simulación;
   - un bot que gane cada misión, para probarlas solas.

   Hazlo aditivo: módulos nuevos en `js/` y `juegos/getaway/`, con su prueba en `pruebas/`.
2. **Barrio a nivel GTA:** en el Centro de Medellín, usar los sitios icónicos (`MC.Sitios`, `js/45-y-sitios.js`) con gente en escenas (`MC.CiudadViva.escenas`) y cinco misiones pulidas.
3. **Rendimiento de EnCicla:**
   - el `publicar.yml` de GPT‑6 exige p95 < 50 ms con la CPU 4× (`tests/benchmark-2km-gpt6.mjs`) y hoy da 131 y 77 ms;
   - por eso la página pública sigue en la 3.4.0;
   - **no cambies ni saltes esa compuerta sin el autor**: o se optimiza el suelo 3D (K‑1) hasta cumplirla, o el autor decide.
4. **Para ChatGPT/Codex** (si no entregan, retómalos): R8 (SSAO, faroles y agua), C5‑05 (policía con tácticas), C5‑06 (multitudes con `MC.CiudadViva`), modelos más finos de los sitios y R6‑b (medir en un celular; hoy va apagado, `?r6b`).
5. **Para Gemini/Antigravity:** G5‑09 a G5‑15 (subtramas, 2D, Arcade y Pixel, Run, escenas en los sitios y el arte de EnCicla).

## 4. Reglas que no se negocian
- **El juego:**
  - un solo HTML, sin internet ni librerías nuevas;
  - español de Colombia;
  - no romper los guardados (los campos nuevos van con su valor por defecto);
  - Turno Cero es 18+; EnCicla, El Metro y Run son de familia y van sin violencia;
  - sala limpia: las ideas de otros juegos sí, su código o su arte no.
- **Git y publicación:**
  - trabaja en tu rama;
  - `main` solo en avance rápido y con las pruebas en verde; nunca `push --force`;
  - en `gh-pages` de EnCicla se conservan `/metro/` y `/descargas/`; ahí publica `publicar.yml`;
  - no hagas un pull request si el autor no lo pide.
- **Datos:**
  - nunca subas llaves;
  - el correo del autor es privado;
  - la licencia del catastro y el MDT LiDAR CC BY‑SA esperan la decisión del autor: no los integres.
- **Si otra IA dejó una rama:** compréndela, pruébala, mejórala y únela. Si algo suyo no funciona, dilo con números (como R6‑b) en vez de borrarlo.

## 5. Al terminar (obligatorio)
1. Corre la batería completa de lo que tocaste y deja los resultados.
2. Sube la versión (`VERSION.json` y `js/00-nucleo.js` en el motor; la versión del juego y su código de Android en los hermanos).
3. Escribe:
   - tu entrada en la `BITACORA.md`;
   - tu entrada en el § 8 de `CONTEXTO-RELEVO.md` (qué hiciste, cómo lo probaste, qué falta y qué riesgo dejas);
   - un mensaje en `coord/buzon/AAAAMMDD-HHMM-<tu-id>-<tema>.md`;
   - tu ficha en `coord/agentes/<tu-id>.json`.
4. Publica:
   - las APK: en el motor, `apk-juegos.yml`; en El Metro, `apk.yml`; en EnCicla, `android.yml`;
   - las páginas, si las pruebas están en verde.
5. Entrégale al autor los enlaces, el HTML y la APK, y **escribe tú también un prompt de relevo como este** para la IA que venga después.
