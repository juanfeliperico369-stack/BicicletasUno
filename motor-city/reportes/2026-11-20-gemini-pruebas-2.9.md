# Pruebas de Motor City 2.9.1 · reporte consolidado (G‑H6)

- **Fecha:** 2026-11-20
- **Autor:** Gemini · Antigravity («hydrogen»)
- **Versión probada:** Motor City **2.9.1** (rama `claude/motor-city-engine-xu7p4y`, commit base `6df29ff`)
- **Entorno:** Linux VM · Node.js 24 LTS · Chromium del sistema (`/usr/bin/chromium`) · Playwright JS en `/tmp/pw` (sin tocar código del motor)

---

## 1. Motor City 2.9.1 (`node motor.mjs prueba --navegador`)

- **Comando:**
  ```bash
  NODE_PATH=/tmp/pw/node_modules MC_CHROMIUM=/usr/bin/chromium node motor.mjs prueba --navegador
  ```
- **Resultado:** **`✓ TODAS LAS PRUEBAS PASARON · 133 bien · 0 fallos · 77.2 s`** (124 pruebas deterministas en Node + 9 pruebas reales en Chromium móvil/escritorio).

### Resultados clave verificados en 2.9.1
| Bloque / prueba | Estado | Métricas exactas observadas |
|---|---|---|
| Bloques 1–15 (MC4, coordenadas, 639.457 huellas, redes, clima, transporte, ciencia, seres, generador, escala, mi casa, lugares, ciudad, agua y límites) | ✅ 100 % verde | `version: "2.9.1"`, `17/17` capas sha1, `195` lugares, `48` árboles con colisión exacta, `embalse: 231 ha` |
| Bloque 17 (Estilos 2.7, vida y exportación GLB/RAW16) | ✅ 100 % verde | `estilos: 12`, `GLB: 312 KB`, `edificios: 197`, `alturas: 38×38`, `aves: 3`, `squash: true` |
| Bloque 18 (Entrega maestra 2.8 + persistencia por sectores 2.9.1) | ✅ 100 % verde | `llantas: 22`, `pisadas: 6`, `llueve: "barro"`, `huyen: 1`, `telemetría (fps: 60, p95: 16.7, p99: 100)`, `sectores: identidad, sueño y retorno, migración, copias y fallo de almacenamiento` ✅ |
| Chromium · 9 vistas + pixel + GPU virtual (`MC.Raster`) | ✅ Verde | `poligonos: 1033`, `nivel: "software"`, `webgl: 2`, `software: true`, `0` errores de consola |
| Chromium · Run en la ciclovía | ✅ Verde | `dentro: true`, `s: 16`, `lejos: 8`, `enCiclo: true`, `clima: "lluvia"` |
| Chromium · **CPU 4× más lenta** (mediana dibujo < 40 ms) | ✅ Verde | `cenital: 24.7 ms` · `ciudad3d: 21.2 ms` · `maqueta: 24.1 ms` · `lateral: 16.8 ms` · `pano: 5.8 ms` |
| Chromium · **Arte ChatGPT**, loseta periódica, fase, trama estable y charcos | ✅ Verde | `metros: 4`, `junta: true`, `estable: true`, `fase: true`, `respaldo: true`, `charcos: 20`, `ms: 0.027` |
| Chromium · **12 estilos gráficos** en Mandados | ✅ Verde | `realista: 1.1` · `clasico: 2.5` · `comic: 31.7` · `unbit: 37.6` · `manga: 8.8` · `anime: 3.2` · `novela: 3.0` · `ukiyoe: 3.8` · `vintage: 4.2` · `crt: 3.5` · `termica: 2.4` · `acuarela: 3.4` (ms) |
| Chromium · **Mandados en celular táctil** (`412 × 860`) | ✅ Verde | `tutorialOpcional: true`, `libre: true`, `vehiculos: 34`, `pxPorMetro: 9.2`, `joystick: true`, `primerMandado: 43 m`, `movio: 4.2 m`, `arte: gemini (10 atlas, faltan: 0)` |
| Chromium · **Mandados flujo completo** (interfaz, agua, mi casa, alcalde) | ✅ Verde | `tapa: []`, `tapaLargo: []`, `tapaDespues: []`, `agua: {vioBoton: true, aPie: true, parqueada: true, vadea: true}`, `ambiente: 76/100`, `lugares: 197`, `zonas: 41`, `crecen: 8` |

> **Observación de rendimiento para Codex/Claude (C‑M13):** con CPU 4× todas las vistas cumplen cómodamente la meta `< 40 ms` (`maqueta: 24.1 ms`), aunque sigue ligeramente por encima del objetivo estricto `< 20 ms` en maqueta y los estilos de pantalla completa (`comic: 31.7 ms`, `unbit: 37.6 ms`) siguen siendo los más costosos.

---

## 2. Estado de los tres juegos hermanos (sin cambios de código)

Claude sincronizó Motor City 2.9 dentro de `motor-city/` en `BicicletasUno` (`aadabfc`) y `MetroZero` (`4057205`); `RunRunZero` se mantiene en `803eff1`. Ningún juego cambió su lógica de juego ni recibió nuevas tareas para Gemini en `TAREAS-IA.md`.

| Repositorio | Estado en esta ronda | Nota de git / pruebas |
|---|---|---|
| `BicicletasUno` | Motor 2.9 en `motor-city/` (`aadabfc`); entrega previa de Gemini (`contenido/datos-gemini.json` + `docs/BITACORA.md`) rebasada localmente sobre `origin/claude/motor-city-engine-xu7p4y` | Pruebas previas en verde salvo la ventana fija de 900 ms del test WebRTC (ya reportada a la IA de EnCicla). Push remoto devuelve HTTP `403` porque solo `motorcity` está montado como recurso del proyecto. |
| `MetroZero` | Motor 2.9 en `motor-city/` (`4057205`); entrega previa de Gemini (`pan_ladera_casas.png` G‑40 + `INVENTARIO.md` + `docs/BITACORA.md`) rebasada localmente sobre `origin/claude/motor-city-engine-xu7p4y` | Pruebas en verde (`0` fallos). Push remoto bloqueado por permisos de proyecto (`403`); rama local lista. |
| `RunRunZero` | Sin cambios remotos (`803eff1`); reporte previo de Gemini (`docs/reporte-gemini-2026-11-20.md`) en rama local `claude/motor-city-engine-xu7p4y` | 15/15 pruebas en verde. Push remoto bloqueado por permisos de proyecto (`403`); rama local lista. |
