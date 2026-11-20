# Reporte consolidado de pruebas · Motor City 2.7.0 y los 3 juegos (G‑H6)

- **Fecha:** 2026-11-20
- **Autor:** Gemini · Antigravity («hydrogen»)
- **Entorno:** Linux Debian 12, Node.js 24, Playwright + Chromium del sistema (`/usr/bin/chromium`, GPU software SwiftShader).
- **Regla respetada:** Solo ejecución, registro honesto y capturas; **cero líneas de código de motor o juego modificadas**.

---

## 1. Resumen general de los 4 repositorios

| Repositorio | Rama | Comandos ejecutados | Resultado | Fallas / detalle exacto |
|---|---|---|---|---|
| **Motor City** (`motorcity`) | `claude/motor-city-engine-xu7p4y` | `node motor.mjs construir` · `node motor.mjs prueba --navegador` | **122 bien · 1 falló** (exit `1`, `67.3 s`) | `✗ Mandados: la interfaz no tapa el centro` → `tapa: ["botones p 342,10","p 342,172","p 342,226","p 342,280","p 342,334"]` |
| **Juega EnCicla** (`BicicletasUno`) | `claude/motor-city-engine-xu7p4y` | `node tools/build.js` · `node tests/run.js` | **95 bien · 1 falló** (exit `1`) | `✗ el invitado 2 ve al anfitrión y al invitado 1 en tiempo real (reenvío)` (WebRTC, pendiente #3 en `BicicletasUno/TAREAS-IA.md`) |
| **El Metro** (`MetroZero`) | `claude/motor-city-engine-xu7p4y` | `node tools/build.mjs` · `node tools/test.mjs 10` | **OK · 0 errores** (exit `0`) | `servidor local: OK (16)`, `selfTest: 0 errores / 0 avisos`, `monkey: 10 partidas / 31388 pasos / 5 victorias / 0 errores`, `consola: 0` |
| **Run Scooter** (`RunRunZero`) | `claude/motor-city-engine-xu7p4y` | `node tools/build.mjs` · `node tools/sim.mjs 100 240` · `node tools/bot.mjs 10 15` | **OK · 0 errores** (exit `0`) | `sim: 100 partidas / 0 errores / 0 filasImposibles`; `bot: UI 8/8 ✔ / sim 10 / ERR: [] / errores: []` |

---

## 2. Detalle exacto · Motor City (`node motor.mjs prueba --navegador`)

### Lo que pasó (122 comprobaciones en verde)
- **Construcción (`node motor.mjs construir`):** OK, sin errores.
- **Pruebas Node y módulos 2.7:** todas en verde, incluyendo `estilos` (8 estilos gráficos), `vida` (`MC.Vida`: sacudida, hitstop, partículas) y `exportar` (GLB válido de 315 KB).
- **Navegador (Chromium + GPU virtual):**
  - `9 vistas + pixel`: OK.
  - `GPU virtual`: OK (638 polígonos).
  - `Run en la ciclovía`: OK (`s:23, lejos:11`).
  - `CPU 4× más lenta`: **todas por debajo de 40 ms** (`cenital 7.9 ms`, `ciudad3d 15.9 ms`, `maqueta 35.8 ms`, `lateral 13.6 ms`, `pano 7.1 ms`). *(Nota para Codex `C‑M13`: `maqueta` sigue en `35.8 ms`, por encima de la meta `< 20 ms`.)*
  - `sin errores en consola`: OK (0 errores).
  - `Mandados 8 estilos gráficos`: OK.
  - `Mandados en celular táctil`: OK (`tutorialOpcional: true`, `libre: true`, `vehiculos: 34`, `pxPorMetro: 9.2`, `joystick: true`, `primerMandado: 66`, `movio: 4`, `arte: { arboles: 57, piel: 'gemini', atlas: 10, faltan: 0, icono: true }`).

### Lo que falló (1 comprobación)
```text
✗ Mandados: la interfaz no tapa el centro
  tapa: ["botones p 342,10","p 342,172","p 342,226","p 342,280","p 342,334"]
  tapaLargo: ["botones p 342,10","p 342,172","p 342,226","p 342,280","p 342,334","p 342,388"]
  tapaDespues: ["botones p 342,10","p 342,172","p 342,226","p 342,280","p 342,334"]
```
- **Causa observada (sin tocar código):** en viewport `412 × 860`, la columna derecha `.botones` arranca en `x = 342 px`, invadiendo por ~4 px el límite derecho de `zonaLibre` (`x = 346,08 px`). Queda reportado también en [`2026-11-20-gemini-capturas.md`](./2026-11-20-gemini-capturas.md) para ajuste de layout por Claude/Codex.

---

## 3. Detalle exacto de los 3 juegos

### Juega EnCicla (`BicicletasUno`)
- **Build:** `OK v2.0.1 cache juega-encicla-v2.0.1-1896efed | único 5022 KB | js 4845 KB`.
- **Tests (`node tests/run.js`):** 95 en verde, 1 falló, 0 errores de consola.
  - Bot 54 partidas: `✓ SIN ERRORES · 54 partidas en 120.0 s`.
  - Rendimiento (CPU 4× lenta): mediana `16.7 ms` en `usuario`, `anfitrion` y `monitoreo`.
  - Falla única: `✗ el invitado 2 ve al anfitrión y al invitado 1 en tiempo real (reenvío)` (carrera de tiempo en espera fija de 900 ms en WebRTC, ya asignada a Codex/Claude en `BicicletasUno/TAREAS-IA.md` §3).
- **Bitácora actualizada:** `BicicletasUno/docs/BITACORA.md` (incluye tabla de capturas 412 × 860).

### El Metro (`MetroZero`)
- **Build:** `dist/index.html 8477 KB · v2.0.0 · cache b8f24800`.
- **Tests (`node tools/test.mjs 10`):** `RESULTADO: OK, 0 errores` (sin 404; `servidor local: OK, 16 comprobaciones`; `selfTest: 0 errores, 0 avisos`; `monkey: 10 partidas, 31388 pasos, 5 victorias, 0 errores`; `errores de consola: 0`).
- **Bitácora actualizada:** `MetroZero/docs/BITACORA.md` (incluye tabla de capturas 412 × 860 y entrega de lámina `G‑40` `pan_ladera_casas.png`).

### Run Scooter (`RunRunZero`)
- **Build:** `web/index.html 461.4 KB`.
- **Simulador (`node tools/sim.mjs 100 240`):** `partidas: 100, errores: 0, filasImposibles: 0, distProm: 4885, distMax: 7439, puntosProm: 20200, ms: 46276`.
- **Bot navegador (`node tools/bot.mjs 10 15`):** `ui: 8/8 ✔`, `drawsMax: 253`, `sim: { n: 10, err: 0, bad: 0, dist: 3491 }`, `export.ok: true`, `ERR: []`, `errores: []`.
- **Reporte creado:** `RunRunZero/docs/reporte-gemini-2026-11-20.md` (incluye tabla de capturas 412 × 860).
