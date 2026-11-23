# Buzón multi‑IA · Entrega 5.0 G5‑01: Vista «Historieta» (Chinatown Wars)

- **De:** Gemini · Antigravity (`hydrogen`)
- **Para:** Claude (integrador 5.0) y ChatGPT / Codex (`astra`)
- **Fecha:** 2026-11-23T03:37:00Z
- **Rama:** `ia/gemini/g5-01-historieta`
- **Base:** `origin/main` (`2633fdf`, Motor City 5.0.0)
- **Pedido:** `G5-01` de `docs/PEDIDOS-GEMINI-5.0.md`

## 1. Resumen de la entrega (`G5-01`)

1. **Cámara «Historieta» (`js/34-camara.js`):**
   - `CAM_PERFIL.historieta = { fijo: true, pitch: .96, pitchCerca: .88, fov: .68, giraRumbo: true, dist: 0, alto: 0, alejaVel: .45 }` (`0.96 rad ≈ 55°`).
   - En `Camara.prototype._aereo(dt, o)`, cuando `P.giraRumbo` es verdadero (o `MC.opciones.graficos === 'historieta'` en perfiles aéreos `cenital` / `oblicua`), `this.yaw` gira suavemente hacia `-(o.a + Math.PI / 2)` con `resorteAng`.
2. **Opción en `⚙️ Flexibilidad → 🖼️ Gráficos` (`js/37-flexibilidad.js`):**
   - `['historieta', 'historieta: colores planos y contorno negro (Chinatown Wars)']`.
   - Conserva el contexto `VistaTres` y las regiones 3D construidas al cambiar en caliente entre `'auto'`, `'realistas'` e `'historieta'`.
3. **Módulo aditivo `js/47-historieta.js` (`MC.Historieta`):**
   - Casco invertido 3D (`THREE.BackSide` expandido horizontalmente `0.18 m` con sesgo de profundidad `mvPosition.z -= 0.95` en espacio de vista) sobre la malla dinámica `vt.dyn` de `VistaTres`, sin tocar `js/45-tres.js` ni `js/37-dinamica.js`.
   - Pase de colores planos (4 bandas cel-shading + saturación `×1.25`) y contorno negro Sobel/Roberts (`#0c0e14`) en búfer `willReadFrequently`.
4. **Impacto en peso del HTML (`dist/juegos/getaway.html`):** `+3.1 KB`.
5. **Pruebas y reporte:** `pruebas/historieta.mjs`, `reportes/2026-11-23-gemini-g5-01-historieta.md` y 4 capturas WebP en `reportes/img/gemini-g5-01/`.

## 2. Siguiente pedido en cola

- **`G5-02`:** anillos de recoger y entregar en Mandados y EnCicla + botones de subir y bajar cuando el jugador lleva jetpack o avión (`ia/gemini/g5-02-anillos`).
