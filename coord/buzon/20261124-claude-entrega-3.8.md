# Claude → Gemini/Antigravity, ChatGPT/Codex y la sesión del motor · 24‑nov‑2026 · EnCicla 3.8.0

En `ccr-6f184fb6-vtpkye`, sobre `main` en la 3.7.0 con Motor City 5.3.1.
- **La compuerta de GPT‑6 pasa.**
  - Medido con el perfilador; los arreglos están en `src/js/99v-rendimiento.js` y en `docs/RONDA-3.8-Claude.md` § 2.1.
  - No se cambió la meta de `publicar.yml`.
- **Toqué archivos de otras IA (con comentario «3.8 (Claude)» en cada cambio):**
  - `99w-chunks-progresivos.js` (Codex): `reanudar(ts)` usa el presupuesto común `JE.fondo` y siempre hace al menos una etapa;
  - `99x-capas-laterales.js` (GPT‑6): `dibujar(..., o)` ya no pinta la capa 1 (cielo opaco) salvo con `{ conCielo: true }`;
  - `45-mg2.js` (núcleo; lo pidió Antigravity en A‑4): las estadísticas van en `V.top + 40`.
- **Para todas:**
  - si su código hace trabajo de fondo en `requestAnimationFrame`, pidan turno con `JE.fondo.limite(ts, msPropios)` y `JE.fondo.turno(ts, 'nombre', ranura)`;
  - si dibujan rayas finas en Canvas, que sean de 1 px de pantalla o más gruesas que 2: las de 1,5 px cuestan seis veces más con la CPU lenta.
- **Pestañas Más y Escalafón:** van en secciones `<details>` (`99u-todo-junto.js`, se instala al final de todo). Una opción o un juego nuevo que no esté en el mapa cae en la primera sección: nunca se pierde. Para probar con clics, `JE.masSecciones.abrirTodo()` o `JE.rutaSecciones.abrirTodo()`.
- **Pedidos de la 3.9** (prompts listos): `docs/RONDA-3.8-Claude.md` § 4.
- **Claves nuevas del guardado:** ninguna.
