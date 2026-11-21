# Relevo Antigravity (Gemini) · Motor City 4.0.1 y *Turno Cero*

- **Fecha:** 2026-11-21 03:20 UTC
- **Agente:** Gemini · Antigravity (`antigravity`, rol «hydrogen»)
- **Rama:** `ia/antigravity/motorcity-4.0` (base `c898a0a`, Motor City `4.0.1`)
- **Estado:** Entregado y listo para PR hacia `main` — **0 archivos `.js`/`.mjs` modificados** (cero invasión a las zonas de Claude ni Codex).

## 1. Qué se entregó en esta rama

1. **`contenido/paradas-carretera.json` (`G‑H22`):** 28 paradas inventadas y creíbles para las carreteras largas del planeta (4 por cada uno de los 7 biomas de `MC.Planeta.BIOMAS`: `costa`, `llanura`, `desierto`, `bosque`, `montana`, `nieve`, `lagos`), con `nombre_es`, `nombre_en`, `tipo` compatible con `PARADAS_RUTA`, `rutas` y frase de `ambiente`.
2. **`reportes/2026-11-21-gemini-herramientas-4.0.md` (`G‑H12`, `G‑H13`, `G‑H6`):**
   - `node motor.mjs skills --instalar --agente antigravity` → 4 skills externas instaladas y verificadas (`hallmark`, `modern-web-guidance`, `find-skills`, `hyperframes`).
   - `node motor.mjs publico` → 4 perfiles auditados (Sofía 8 años atascada 5 s; Mark turista 35 % quieto/atascado; Don Gilberto y Valentina bien).
   - `npx -y modern-web-guidance@latest legacy-scan js --json` → 6 hallazgos (`js/structured-clone`), **todos `dropWhen`** por compatibilidad con `node:vm` en `pruebas/prueba.mjs` y normalización JSON.
   - `node motor.mjs prueba --navegador` → **151/151 en verde (89,8 s)** + `node pruebas/portada.mjs` → **4/4 en verde**.
   - Nota para pruebas de Codex: `pruebas/getaway-3d.mjs` usa `headless: false` (requiere `xvfb-run` en Linux sin X11) y `juegos/getaway/arte3d/pruebas-modelos.py` aún apunta a `juegos/getaway/arte3d/modelos/` en lugar de `arte/modelos/turno-cero/`.
3. **`reportes/2026-11-21-gemini-turno-cero.md` + 12 capturas WebP (`reportes/img/turno-cero-4.0/`, 907 KB total) (`G‑H20`, `G‑H21`, `G‑H23`, `G‑H24`):**
   - **Memoria crítica (`G‑H24`):** Manhattan sube el JS Heap a **215,3 MB** (`262,4 MB` reservados, `2.850 ms`), frente a Medellín (`66,3 MB`, `1.746 ms`) y Guatapé (`13,6 MB`, `985 ms`).
   - **Lugares reales (`G‑H21`):** `gu_finca` usa el hotel real **`La valentina finca hotel`** como guarida criminal; se entregan coordenadas neutras verificadas en MC4 (`6.23636, -75.18186`, a 495 m del negocio más cercano) + corrección de 4 calles (`ny_noah`, `ny_oeste`, `md_centro`, `md_envigado`) y 3 ajustes finos.
   - **Filtro de lenguaje + bug real (`G‑H23`):** `juegos/getaway/20-juego.js:256` emite hablante `'coro'` inexistente en `TC.QUIEN` (debe ser `'camara'`); `LENGUAJE_SUAVE` pierde mayúsculas, pluraliza `malparida`, omite `tombo`/`güevones` y no cubre `TC.CONTRATOS` (`El sapo`).
   - **UI móvil (`G‑H20`):** portada 18+ empuja botones debajo del pliegue en `412×860`; menú de pausa deja sangrar el HUD subyacente; diálogo activo no se cierra al abrir Menú/Calle libre y solapa `#subt`; etiqueta `Medellín` recortada en el globo; texto `SEÑUELO` roza borde en `turno-cero-accion-3d.html`.

## 2. Para la siguiente IA (Claude / Codex / ChatGPT)

- **Claude:** empezar por los 4 parches rápidos detectados en `reportes/2026-11-21-gemini-turno-cero.md` (`gu_finca` + 4 calles en `10-contenido.js`, `'coro'` en `20-juego.js:256`, `suave()` en `40-dibujo.js` y `30-historia.js`, portada/menú/diálogos en `index.html`/`90-inicio.js`, y conectar `contenido/paradas-carretera.json`).
- **Codex:** priorizar **`C‑M34` (Manhattan por sectores de 1 km)** por el pico de 215,3 MB JS Heap, arreglar `SEÑUELO` en `turno-cero-accion-3d.html` y la ruta de `pruebas-modelos.py`, y seguir con `C‑M31..C‑M35`.
- **Autor / QA con celular físico:** falta completar la tabla § 1.3 de `reportes/2026-11-21-gemini-turno-cero.md` con mediciones de GPU real (en VM solo corre respaldo software).
- **REGLA OBLIGATORIA DE RELEVO:** al terminar tu turno, **debes** añadir tu propia entrada en `CONTEXTO-RELEVO.md` (§ 8, sin borrar las anteriores), actualizar tu ficha en `coord/agentes/<tu-id>.json`, dejar un nuevo mensaje en `coord/buzon/` y **pasarle esta misma obligación a la siguiente IA**.
