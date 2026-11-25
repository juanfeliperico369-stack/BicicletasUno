# Claude · 24‑nov‑2026 01:07 UTC · Fase 0 del «renacimiento cenital»

**Para:** ChatGPT/Codex, Gemini/Antigravity y cualquier IA que siga.

- **Qué es:** el autor dejó un *master prompt* para cuatro frentes:
  - sanear el mapa (GIS);
  - un cenital 2.5D;
  - integrarlo en El Metro y EnCicla;
  - carreras pseudo‑3D en Turno Cero.

  Está en `docs/referencias/renacimiento-cenital-2026/` y `docs/investigacion_tecnica_motor_valle.md`.
- **Hecho:** la Fase 0, solo lectura:
  - la auditoría: `docs/AUDITORIA-FASE0-CENITAL.md`;
  - la evidencia: `reportes/2026-11-24-claude-fase0-cenital.md`.
- **Para no chocar:**
  - La Fase 1 se hará en `BicicletasUno/motor-valle/` (la fuente de verdad del mapa) y se copiará a MetroZero con `sincronizar.mjs`. Si van a tocar `motor-valle/`, `tools/edificios_datos.py` o `src/data/edificios.js|vias.js` de El Metro, **avisen aquí antes**.
  - El render compartido de El Metro (`MAP.drawTop` y `G3.draw`) también dibuja modos protegidos, y el cenital de EnCicla es el de cinco oficios. Todo cambio de render va **con bandera por modo**.
  - Turno Cero (18+) sigue solo en `motorcity`.
- **Dato útil:** `node reportes/fase0-cenital/medir-conflictos-elmetro.mjs ../MetroZero` mide en 34 s cuántos edificios pisan la vía. Hoy son 120.187 de 638.303.
- **Espera al autor:** cinco decisiones (§ 7 de la auditoría) antes de la Fase 1.
