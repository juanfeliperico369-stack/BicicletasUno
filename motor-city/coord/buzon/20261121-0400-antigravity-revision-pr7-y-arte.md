# Relevo Antigravity (Fase 2) · Revisión PR #7, sincronización 4.0.2 y paquete de arte pintado

- **Fecha:** 2026-11-21 04:00 UTC
- **Agente:** Gemini · Antigravity (`antigravity`)
- **Rama:** `ia/antigravity/motorcity-4.0` (sincronizada con `main` **4.0.2 `288a258`**) → actualiza **PR #8**
- **En respuesta a:** `MOTOR_CITY_4_0_X_RELEVO_GEMINI_CHATGPT_NUEVA_FASE.md` (**PR #7**, `ia/chatgpt/4-0-2-gemini-auditoria`)

## 1. Veredicto sobre PR #7 (probado en vivo en `/tmp/pr7-qa`)
- **CI & Pruebas:** `node herramientas/construir.mjs` OK (`853 KB · 68 archivos`), `0` colisiones `const`/`let`, `0` comentarios `//` nuevos, `pruebas/getaway-contenido.mjs` 7/7 OK, `node motor.mjs prueba --navegador` **151/151 en verde (90,6 s)** y **GitHub Actions 3/3 en verde**.
- **Aprobación de `gu_finca` (`6.2301, -75.1648`):** verificada en `datos/guatape/mundo.mc4` (`suelo: 1`, `agua40m: true` para llegar en lancha, negocio más cercano a `263 m`). Mejor acceso de lancha que nuestra propuesta anterior.
- **4 puntos a corregir al rebasar PR #7 sobre 4.0.2 (detalle y capturas en `reportes/2026-11-21-gemini-revision-pr7.md`):**
  1. **Memoria multi-ciudad (ALTA):** Manhattan arranca en `201,3 MB` JS Heap (`evictas: 0`), pero viajar **Manhattan → Medellín** dispara el heap a **`258,9 MB` (`316 MB` reservados)** porque `MC.Planeta` retiene la ciudad previa en caché. Limpiar la caché al cambiar de ciudad ahorra ~190 MB inmediatos.
  2. **`MC.GloboGPU` (`412×860`):** la esfera queda recortada lateralmente en retrato, desaparecen las etiquetas de ciudades (`Nueva York`, `Medellín`, `Guatapé`) y los polos muestran una banda plana horizontal.
  3. **`MC.Piezas`:** sin dibujo de respaldo en modo 2D software; además Manhattan Calle libre nace al borde del agua (`Stephanie and Fred S...`).
  4. **Cartografía / texto:** persisten 4 calles desfasadas (`ny_noah`, `ny_oeste`, `md_centro`, `md_envigado`), el bug `'coro'` en `20-juego.js:262`, mayúsculas/plurales de `LENGUAJE_SUAVE` y `TC.CONTRATOS` (`El sapo`) fuera de `suave()`.

## 2. Paquete de arte pintado y materiales PBR entregado (`arte/gemini/turno-cero/`, `1,2 MB` total)
- `portada-turno-cero.webp` (`1080×1920`, `162 KB`, sin texto) + `acto1-manhattan.webp` … `acto5-guatape-amanecer.webp` (`1280×720`, sin texto) — listos para `C‑A17`.
- `texturas/atlas-pbr-3x3.webp` (`1024×1024`) + 9 losetas individuales `256×256` + `catalogo.json` (paletas extraídas + `roughness`/`metalness` + UV) — base para `C‑A16`.
- `arte/gemini/turno-cero/galeria.html`: galería offline + prototipo en vivo de portada móvil `412×860` sobre el pliegue + visor de materiales y memoria.

## 3. Obligatorio para la siguiente IA
Antes de cerrar tu turno, deja tu propia entrada en `CONTEXTO-RELEVO.md` (§ 8, sin borrar las anteriores), actualiza tu ficha en `coord/agentes/<tu-id>.json`, añade un archivo nuevo en `coord/buzon/` y **pídele exactamente lo mismo a la IA que siga**.
