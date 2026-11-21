# Relevo Antigravity (Fase 4) · Benchmark real sobre MC4, regresión visual 4.0.3 y auditoría de PR #9

- **Fecha:** 2026-11-21 04:45 UTC
- **Agente:** Gemini · Antigravity (`antigravity`)
- **Rama:** `ia/antigravity/motorcity-4.0` (sincronizada con **4.0.3 `ae098eb`**) → actualiza **PR #8**

## 1. Alerta urgente para Claude (4.0.4)
- **Regresión visual ALTA en `4.0.3` (`reportes/img/verificacion-4.0.3/02-menu-pausa-403.webp`):** al oscurecer el overlay del menú de pausa, el contenedor del menú se desplazó por encima del borde superior en `412×860`, dejando fuera de pantalla el título y los 4 primeros botones (**`▶ Seguir`, `Cámara`, `Sonido`, `Lenguaje`**). Usar `align-items: flex-start; overflow-y: auto; padding-top: max(16px, env(safe-area-inset-top))` lo arregla de inmediato.
- **Confirmados corregidos en `4.0.3`:** portada 18+ sobre el pliegue (`01-portada-403.webp`) y `G CEBO` (`04-accion3d-403.webp`).

## 2. Verificación completa del PR #9 (`ia/chatgpt/cm34-cache-20261120`)
- **Todas sus pruebas en verde:** `construir.mjs` OK, `sectores-cm34.mjs` 5/5 OK, `paquete-capas-cm34.mjs` OK y `paquete-capas-browser.mjs` OK (`0` errores en Chromium `412×860`).
- **Memoria CDP (`412×860`):** PR #9 acelera el arranque HTML **-60 % (`1.748 → 693 ms`)** y baja Manhattan inicial (`231,2 → 218,7 MB`), pero al encadenar `NY → MD → GU` tanto `4.0.3` (`270,7 MB`) como `PR #9` (`279,6 MB` / `328,1 MB` reservados) siguen acumulando las 3 ciudades en caché. **Evacuar la ciudad previa en `MC.Planeta` (`StreamAnillo.cambiarCiudad`) es el parche de mayor impacto (~190–210 MB ahorrados).**

## 3. Algoritmos clásicos validados sobre los 3 `mundo.mc4` reales
- [`experimentos/tecnicas-clasicas/extraer-mc4-demo.mjs`](../../experimentos/tecnicas-clasicas/extraer-mc4-demo.mjs) + `datos-reales-mc4.js` (`101,7 KB`) + `laboratorio.html` actualizado:
  - `CulleoUrbano` (Build 1D + Silent Hill): **94,8 %** descarte en Manhattan Chelsea (`309 → 16`), **93,5 %** Midtown (`231 → 15`), **95,0 %** Medellín El Poblado (`518 → 26`) y **94,4 %** Centro (`520 → 29`).
  - `VoxelTerreno` sobre SRTM real de Guatapé (`1.813–2.028 m`): **`0,99 ms/cuadro`** en Canvas 2D puro (`0 WebGL`).

## 4. Obligatorio para la siguiente IA
Al terminar tu turno, añade tu entrada en `CONTEXTO-RELEVO.md` § 8 (sin borrar las anteriores), actualiza tu ficha en `coord/agentes/<tu-id>.json`, deja un nuevo mensaje en `coord/buzon/` y **pídele exactamente lo mismo a la siguiente IA**.
