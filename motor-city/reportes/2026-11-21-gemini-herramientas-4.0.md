# Herramientas nuevas, skills de Antigravity y pruebas · Motor City 4.0.1 (G‑H12, G‑H13 y G‑H6)

- **Fecha:** 2026-11-21
- **Autor:** Gemini · Antigravity («hydrogen»)
- **Versión auditada:** Motor City **4.0.1** (base `c898a0a`, rama `ia/antigravity/motorcity-4.0`)
- **Regla respetada:** cero cambios en código del motor ni de los juegos (`0` archivos `.js`/`.mjs` tocados).

---

## 1. G‑H13 · Instalación de skills externas en Antigravity

- **Comando ejecutado:**
  ```bash
  node motor.mjs skills --instalar --agente antigravity
  ```
- **Resultado:** **`✓ 4 skills externas instaladas para antigravity`** (código de salida `0`), verificadas en `.agents/skills/` (ignoradas por `.gitignore`, sin ensuciar el repositorio):
  1. `.agents/skills/hallmark/` (`Nutlope/hallmark`, MIT)
  2. `.agents/skills/modern-web-guidance/` (`GoogleChrome/modern-web-guidance`, Apache-2.0)
  3. `.agents/skills/find-skills/` (`vercel-labs/skills`, MIT)
  4. `.agents/skills/hyperframes/` (`heygen-com/hyperframes`, Apache-2.0 — nota del verificador `skills.sh`: Gen *Safe*, Socket *0 alerts*, Snyk *Med Risk*; revisar antes de ejecutar comandos automáticos).
- **Fallos:** ninguno (`0`). Además, las 4 skills nativas de Motor City (`motor-city-web-moderna`, `motor-city-diseno-ui`, `motor-city-qa-playwright`, `motor-city-revision-ia`) están activas en `.claude/skills/` y en la biblioteca local de Antigravity.

---

## 2. G‑H12 · Público simulado (`node motor.mjs publico`)

- **Comando:** `NODE_PATH=/tmp/pw/node_modules MC_CHROMIUM=/usr/bin/chromium node motor.mjs publico` (sobre `dist/juegos/mandados.html`, 45 s por perfil).
- **Veredicto por perfil** (copiado de `dist/publico.md`):

| Perfil | Veredicto | Llegadas (s) | Metros | Atascado | Choques | FPS | Lo que «diría» |
|---|---|---|---:|---:|---:|---:|---|
| 🧒 Sofía, 8 años | **mal** | — | 32 | 5 s | 0 | 59,9 | No logró llegar al primer punto en 45 s: el camino no se entiende o algo lo bloquea. |
| 👴 Don Gilberto, 70 años | **bien** | 16,7 · 17,9 | 85 | 0 s | 0 | 59,9 | Llegó al primer punto en 16,7 s. Lo disfrutó: llegó, casi no se atascó y el juego fue fluido. |
| 🎮 Valentina, 17 años | **bien** | 7,6 · 8,8 | 278 | 0 s | 0 | 59,9 | Llegó al primer punto en 7,6 s. Lo disfrutó: llegó, casi no se atascó y el juego fue fluido. |
| 🧳 Mark, turista | **revisar** | 8,8 · 10,0 | 64 | 16 s | 0 | 59,9 | Llegó al primer punto en 8,8 s. Pasó el 35 % del tiempo quieto o atascado contra algo. |

- **Lectura accionable (para C‑M23 / C‑M24):** la fluidez en simulación es excelente (`59,9 fps`), pero **Sofía (8 años)** aún no alcanza el primer objetivo y **Mark (turista)** pasa 35 % del tiempo frenado/atascado — confirma que las tareas abiertas `C‑M23` (red vial de Guatapé) y `C‑M24` (ayuda de manejo infantil) siguen vigentes. *(Hipótesis de prueba de humo: validar siempre con personas reales.)*

---

## 3. G‑H12 · Auditoría `modern-web-guidance legacy-scan js --json`

- **Comando:** `npx -y modern-web-guidance@latest legacy-scan js --json`
- **Resumen:** 38 guías / 52 reglas deterministas ejecutadas → **6 hallazgos totales**, todos bajo la misma regla **`js/structured-clone`** (`JSON.parse(JSON.stringify(x))` → `structuredClone(x)`).

| Archivo | Línea | Fragmento | ¿Aplica? (`keepWhen` vs `dropWhen`) | Motivo técnico exacto |
|---|---:|---|---|---|
| `js/00-nucleo.js` | 98 | `return JSON.parse(JSON.stringify(defecto));` | **NO aplicar (`dropWhen`)** | `pruebas/prueba.mjs` ejecuta `dist/motor.js` dentro de un sandbox `node:vm` (`vm.createContext({ console, require, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout })`) que **no expone `structuredClone`** en el contexto global (criterio literal de `dropWhen`: *"runs inside an isolated VM sandbox or test runner such as a `node:vm createContext` realm"*). Además, `MC.guardado` requiere normalización JSON para persistir en `localStorage`. |
| `js/49-hogar.js` | 116 | `return JSON.parse(JSON.stringify(o));` | **NO aplicar (`dropWhen`)** | Mismo sandbox `node:vm` sin `structuredClone` y se usa en `Hogar.guardar()` para producir un objeto JSON limpio listo para `localStorage` (eliminando claves `undefined`). |
| `js/92-guardado.js` | 23 | `const copia = JSON.parse(JSON.stringify(cambio))` | **NO aplicar (`dropWhen`)** | `GuardadoSectores.cambiar()` exige datos JSON puros (normalización JSON explícita) y corre en el sandbox `node:vm` de `prueba.mjs`. |
| `js/92-guardado.js` | 30 | `return dato === undefined ? null : JSON.parse(JSON.stringify(dato));` | **NO aplicar (`dropWhen`)** | Mismo sandbox `node:vm` sin `structuredClone` en `prueba.mjs`. |
| `js/92-guardado.js` | 51 | `return JSON.parse(JSON.stringify({ schema_version: 1, ... }));` | **NO aplicar (`dropWhen`)** | `instantanea()` normaliza el volcado JSON para `localStorage` y corre en `node:vm`. |
| `js/92-guardado.js` | 54 | `let copia = JSON.parse(JSON.stringify(datos));` | **NO aplicar (`dropWhen`)** | `restaurar()` valida/migra instantáneas JSON y corre en `node:vm`. |

> **Recomendación para Claude:** si en el futuro se quiere adoptar `structuredClone`, primero habría que agregar `structuredClone` al contexto de `pruebas/prueba.mjs` (`ctx`) **y** conservar la normalización JSON en `92-guardado.js` / `00-nucleo.js` (o proteger con `typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x))` solo donde no haga falta limpiar `undefined`). Hoy **0 de los 6 hallazgos** deben cambiarse a ciegas.

---

## 4. G‑H6 · Pruebas consolidadas de Motor City 4.0.1

| Suite / comando | Resultado | Detalle clave |
|---|---|---|
| `node motor.mjs prueba --navegador` *(ejecución aislada)* | ✅ **`151/151` en verde** (`89,8 s`) | `0` errores de consola · **CPU 4×:** `cenital 5,1 ms`, `ciudad3d 11,8 ms`, **`maqueta 13,5 ms`** (< 20 ms), `lateral 11,9 ms`, `pano 5,7 ms` · **12 estilos:** `realista 3,1` … `comic 13,4`, `unbit 11,8` ms · **45 modelos GLB** (42 + 3 con esqueleto), faros y abolladuras en verde · **Turno Cero móvil** (Manhattan → Ruta del Atlántico → Medellín + metro + policía) en verde (`errores: 0`). |
| `node pruebas/portada.mjs` | ✅ **`4/4` perfiles aprobados** | `320×640`, `412×860`, `860×412` y `1440×900` sin desbordes, foco y enlaces correctos. |
| `node pruebas/getaway-3d.mjs` | ⚠️ **Requiere Xvfb / display** | Lanza `headless: false` (`pruebas/getaway-3d.mjs:12`), por lo que falla sin servidor X (`Missing X server or $DISPLAY`). Sin embargo, `dist/juegos/turno-cero-accion-3d.html` sí corre en Chromium headless móvil con WebGL2 SwiftShader (ver captura #12 en `2026-11-21-gemini-turno-cero.md`). |
| `python3 juegos/getaway/arte3d/pruebas-modelos.py` | ⚠️ **Ruta desactualizada** | Busca los `.glb` en `juegos/getaway/arte3d/modelos/`, mientras que los 45 GLB ya viven en `arte/modelos/turno-cero/` (y los valida la sección 20 de `pruebas/prueba.mjs`). Sugerencia para Codex: apuntar el script a `arte/modelos/turno-cero/`. |
