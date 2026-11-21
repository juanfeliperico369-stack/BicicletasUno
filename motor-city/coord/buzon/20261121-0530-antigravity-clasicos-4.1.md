# Relevo Gemini · Antigravity → Claude / Codex · 4.1.0 (`G‑H25`, `G‑H26`, `G‑H27`, `G‑H28`)

- **Fecha:** 2026-11-21 05:30 UTC
- **Rama / PR:** `ia/antigravity/motorcity-4.0` (PR #8 → `main`, sincronizada con **4.1.0** `2d4118f`)
- **Archivos nuevos/actualizados (100 % aditivos, 0 cambios en `js/`, `herramientas/`, `pruebas/`, `juegos/`):**
  - `reportes/2026-11-21-gemini-clasicos-4.1.md` + `reportes/img/clasicos-4.1/` (18 capturas WebP, `455,5 KB`)
  - `reportes/2026-11-21-gemini-tecnicas-clasicas-extra.md` (`G‑H27`: *Driver*, *Midtown Madness*, *Hard Drivin'*, *Stunt Car Racer*, *Crazy Taxi* + 6 clásicos + 3 motores permisivos `zlib`/`MIT`)
  - `reportes/README.md`, `CONTEXTO-RELEVO.md`, `coord/agentes/antigravity.json`, `dist/MOTOR-CITY-TODO.md`

## Hallazgos críticos para 4.1.1 (con capturas y reproducción exacta)

1. **`MC.Arcade` (`js/47-clasicos.js:152`) — BUG ALTA:** en giros/pendientes de ciudad (p. ej. Calle 9 en El Poblado), no limpia `hor..H`, dejando el **32–35 % inferior congelado con el mapa cenital o cuadro previo fantasma** (`03-arcade-poblado-dia.webp`, `04-arcade-poblado-noche.webp`). Parche de 1 línea: pintar fondo `fillRect(0, hor, W, H - hor)` antes de los segmentos. Además en noche (`07-arcade-horizonte-noche.webp`), `lighter` sobreexpone el horizonte a blanco.
2. **Sigilo Thief en móvil (`juegos/getaway/20-juego.js:200` y `55-clasicos.js:24,27`) — BUG ALTA:** en celular táctil `412×860`, mantener `⚡` a pie no activa `e.correr` (`js/33-controles.js:50` solo mira `B.has('correr')`). Medido: **`1,53 m/s` en móvil** vs `4,52 m/s` con `Shift` en teclado. Consecuencia doble: es **imposible disparar `👂 Un guardia oyó tus pasos` (`v > 4.2`) en celular** y Mara queda **siempre `agachado: true`** (`1,53 < 1,6`). Además los faros del tráfico suman luz incluso de día y a través de muros.
3. **Menú de pausa `⏸` (`412×860`) — BUG ALTA persistente de 4.0.3:** `primerBotonTop: -259 px` con las 11 opciones de 4.1.0, cortando `▶ Seguir` y los primeros 4–5 botones arriba.
4. **«Mundo abierto primero» (`G‑H28`):** Turno Cero 4.1.0 **cumple al 100 %** (1 toque → Medellín en `1,99 s`, `📖 Historia` visible, `Entrar directo` y `?portada` verificados). En cambio, **El Metro** (`v0.2.0`) exige 3 toques y bloquea 14/15 estaciones en Ciudad Libre (+ 3 errores `404` de favicon) y **Juega EnCicla** (`v1.7.1`) bloquea `▶ Jugar` con 2 modales seguidos (`BIENVENIDA 1/4` + `Crea tu personaje`).
5. **`MC.VoxelSpace` (`G‑H25`):** excelente fluidez en VM (`vistasMs p50 = 1,49–2,79 ms`, `cuadroMs p50 = 33,3 ms`) y reconstrucción por franjas validada avanzando `626–782 m` sin congelar; conviene reutilizar doble buffer en `_iniciar` para evitar asignaciones de `2,8 MB` por recarga de ventana.

## Regla obligatoria para la siguiente IA
Al terminar tu turno, **debes dejar tu propio documento de contexto y relevo**: suma tu entrada en `CONTEXTO-RELEVO.md` § 8 (sin borrar las anteriores), actualiza § 5, actualiza tu ficha en `coord/agentes/<tu-id>.json`, deja un mensaje nuevo en `coord/buzon/` y pásale esta misma regla a la siguiente IA.
