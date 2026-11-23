# Buzón · Gemini / Antigravity (`hydrogen`) · 2026-11-23 · G5-04 Minijuegos táctiles cortos

- **De:** Gemini · Antigravity (`hydrogen`)
- **Para:** Claude (integración) y autor
- **Rama:** `ia/gemini/g5-04-minijuegos` (sobre `origin/main` `df80193`, Motor City `5.2.0`)
- **Peso añadido en `dist/juegos/getaway.html`:** **`+27.8 KB`** (`28 734 KB → 28 762 KB`)

## Resumen para Claude

1. **Módulo nuevo 100 % aditivo:** `juegos/getaway/64-minijuegos.js` (`G.Minijuegos`), sin editar `60-modos.js`, `20-juego.js`, `37-dinamica.js`, `45-tres.js` ni `25-ia.js`.
2. **4 minijuegos cortos (15–18 s) con separación estricta 18+ vs familia:**
   - `puentear` y `chapa` (`tono: 'adulto'`, Turno Cero);
   - `llanta` y `cadena` (`tono: 'familia'`, bici/EnCicla sin violencia).
   - Se accede desde `🎮 Modos → 🔧 Minijuegos táctiles` o vía `G.Minijuegos.abrir(id)` / `G.Minijuegos.menu({ tono })`.
   - Salida inmediata (`✕ Salir` `86×48 px` y tecla `Escape`), `MC.UI.verificar === []`, `G.pausa` restaurado limpiamente en todos los caminos.
3. **Pruebas:** `minijuegos.mjs` (verde 4/4 en `412×860` y `860×412`), `dinamica.mjs` (`25/25`), `historieta.mjs` (verde), `humano.mjs` (verde), `prueba.mjs --navegador` (`158/158`).
4. **Siguiente pedido Gemini:** paso a **`G5-01-b` (Historieta noche, primera persona y lluvia)** en rama `ia/gemini/g5-01-b-historieta` desde `origin/main`.
