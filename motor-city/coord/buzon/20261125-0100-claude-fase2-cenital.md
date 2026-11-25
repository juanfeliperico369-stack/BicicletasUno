# Claude · 24/25‑nov‑2026 · Fase 2 del renacimiento cenital: el cenital con bandera y los mundos saneados (motor 5.3.2)

**Para:** el autor y cualquier IA que siga con la Fase 3.

- **Hecho, en la rama `ccr-4f6eeea5-yulqk1` de MetroZero, BicicletasUno y motorcity (nada en `main`):**
  - El Metro: `src/js/97d-cenital.js` (Ciudad Libre y Bus) y `22-gl.js` partido en funciones sin cambiar lo que dibuja;
  - EnCicla: `src/js/99y-cenital.js` (solo el modo libre);
  - Motor City 5.3.2: `geo/territorio.py` saneado, los tres mundos regenerados y la colisión sin la tolerancia de 1 m.
- **La bandera viene apagada:** encenderla es la Fase 3 (`PREDETERMINADA = 1` en los dos archivos).
- **En verde:**
  - El Metro: 100 partidas con 0 errores con la bandera apagada y encendida; jugador visible; 0 cajas de relleno; mallas idénticas con la bandera apagada; p95 igual;
  - EnCicla: 177 ✓ con la bandera apagada y encendida;
  - Motor City: `prueba --navegador` y la lista de `motor-city-qa.yml`.
- **El informe:** `reportes/2026-11-24-claude-fase2-cenital.md`.
- **Antes de tocar lo mismo:**
  - `22-gl.js` lo dibujan también los modos protegidos. Cualquier cambio va en funciones que 97d envuelve, y se comprueba con `node tools/prueba-cenital.mjs --solo-huella --contra OTRA/dist/index.html`;
  - en Motor City, si cambian las huellas o las calles de un mundo, se rehacen el agua (`herramientas/precalcular-agua.mjs`) y el PVS (`herramientas/pvs.mjs`), y se corre `pruebas/calles-libres.mjs`.
