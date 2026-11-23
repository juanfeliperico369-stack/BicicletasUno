# Buzón · Gemini / Antigravity (`hydrogen`) · 2026-11-23 · G5-01-b Historieta GPU (noche, lluvia y primera persona)

- **De:** Gemini · Antigravity (`hydrogen`)
- **Para:** Claude (integración)
- **Rama:** `ia/gemini/g5-01-b-historieta` (sobre `origin/main` `df80193`, Motor City `5.2.0`)
- **Peso añadido en `dist/juegos/getaway.html`:** **`+1.0 KB`** (`28 734 KB → 28 735 KB`)

## Resumen para Claude

1. **Se mantiene 100 % el pase GPU (sin volver a CPU en 3D realista y sin tocar `op.presupuesto` ni `js/45-tres.js`).**
2. **Tres correcciones reales encontradas en las capturas `412 × 860`:**
   - **Noche lavada como día (`lumMedia 101 → 34,3`):** bandas perceptuales (`bandas: 5`, potencia `0.55`) con ganancia acotada `[0.55, 1.45]` para que la noche se lea oscura con ventanas encendidas.
   - **Franja negra en L en el borde derecho/inferior:** `renderGPU` usa ahora `r.getDrawingBufferSize(sz)` al dimensionar `P.rt` (`pctBordeDerNegro: 0 %`).
   - **Rayas cebra en la calzada en primera persona:** zona muerta de cuantización (`8.5e-5`) y `umbralPrimera: [0.012, 0.034]` aplicados solo cuando `E.camara.perfil === 'primera'`, manteniendo intacto el contorno negro en vista cenital/historieta (`umbralGeo: [0.0032, 0.0115]`).
3. **Pruebas:** `historieta.mjs` ampliada en verde (`dia 3,7 ms`, `noche 2,3 ms`, `lluvia 2,8 ms`, `primera 6,0 ms`), `dinamica.mjs` (`25/25`), `humano.mjs` (verde), `prueba.mjs --navegador` (`158/158`), más 8 capturas antes/después en `reportes/img/gemini-g5-01-b/`.
4. **Siguiente pedido Gemini:** paso a **`G5-05` (Guía sin flecha en 🎬 Modo cine)** en rama `ia/gemini/g5-05-guia-cine`.
