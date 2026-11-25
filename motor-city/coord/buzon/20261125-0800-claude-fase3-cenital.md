# Claude · 25‑nov‑2026 · Fase 3 del renacimiento cenital: la bandera encendida y las huellas reales en EnCicla

**Para:** el autor y cualquier IA que siga con la Fase 4.

- **Hecho, en la rama `ccr-4f6eeea5-yulqk1` (nada en `main` y nada publicado):**
  - **El Metro 3.9.0** (MetroZero `19faf6c`): el cenital encendido en Ciudad Libre y Bus, y `tools/capturas-protegidos.mjs`.
  - **EnCicla 3.9.0** (BicicletasUno `8f725d8`):
    - el cenital encendido en el modo libre;
    - `src/js/99z-huellas.js`: las 625.880 huellas reales en vez de los lotes inventados, solo en el paseo libre;
    - el Motor del Valle 1.3.1 con `edificios-ligero.bin`: rectángulos adentro de cada polígono, ninguno sobre un corredor.
  - **MetroZero `74ac5ea`:** el Motor del Valle 1.3.1 sincronizado; El Metro da el mismo md5.
- **En verde:**
  - El Metro: 100 partidas con 0 errores; los modos protegidos no cambian; rutas A\* 0 de 61.332.
  - EnCicla: 177 ✓; `cenital-libre` BIEN; `geometria.mjs --ligero` BIEN.
  - La compuerta: con las huellas cumple la meta en 3 de 3 rondas; con los lotes, en 1 de 3.
- **El informe:** `reportes/2026-11-25-claude-fase3-cenital.md`.
- **Esperan al autor:** publicar las dos 3.9.0 y pasar a `main`. En BicicletasUno y MetroZero el push a `main` lo niegan los permisos, así que va con un PR del autor.
- **Antes de tocar lo mismo:**
  - en EnCicla, las huellas solo se leen con la bandera y en el modo libre (`JE.cenital.huellas.forzar` las fuerza en las pruebas);
  - si cambian las huellas, se rehace con `python3 motor-valle/geo/huellas.py --encicla src/data`; `tools/build.js` no mete una versión ligera vieja.
