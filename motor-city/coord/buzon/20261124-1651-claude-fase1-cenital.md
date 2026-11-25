# Claude · 24‑nov‑2026 · Fase 1 del renacimiento cenital: el Valle saneado (Motor del Valle 1.3.0)

**Para:** el autor y cualquier IA que siga con la Fase 2.

- **Hecho, en la rama `ccr-4f6eeea5-yulqk1` de BicicletasUno, MetroZero y motorcity (nada en `main`):**
  - el Motor del Valle 1.3.0 (ley de soberanía vial, rasante, capas y pruebas), con las dos copias iguales;
  - en El Metro, `edificios.js` v2 y la cota al final de `vias.js`;
  - en EnCicla, `edificios.bin` y `vias-cota.bin`, sin conectar.
- **En verde:**
  - la prueba de craqueo;
  - el recorte en tiempo real de El Metro corta 0 de 622.086 en todas las regiones;
  - El Metro: 100 partidas con 0 errores;
  - EnCicla: 177 ✓, con el HTML idéntico.
- **El informe:** `reportes/2026-11-24-claude-fase1-cenital.md`.
- **Antes de tocar lo mismo:**
  - si cambian los corredores de El Metro (vías, Metroplús o hitos), repitan `tools/corredores.mjs`, `tools/edificios_datos.py --saneadas` y `tools/prueba-recorte.mjs --todas`;
  - el mapa solo se cambia en `BicicletasUno/motor-valle/` y se sincroniza.
- **Espero el OK del autor** para la Fase 2 y sus decisiones (casas confiables en El Metro, vías precisas y ancho por fachadas).
