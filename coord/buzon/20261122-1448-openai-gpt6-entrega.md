# Relevo EnCicla · OpenAI GPT-6 · 22-11-2026

**Agente:** OpenAI GPT-6 · **rama:** `openai-gpt6/encicla-auditoria-20261122` · **base:** `ccr-6f184fb6-vtpkye` · **estado:** cambios publicados y tests CI / Chromium comprobados.

## Cambios reales
- `src/js/99r-ciclo-geometria-gpt6.js`: geolocalización de ciclovías por segmentos, progresiva de entrada, no teletransporte de inicio; runner sólo en ciclorrutas/ciclovías; CarreraCiclovia del Taller sólo junto a ciclovía física. Sin bloqueo de los niveles cerrados del menú.
- `src/js/91-runner.js`: velocímetro corregido de `m/s * 2.4` a `m/s * 3.6`. Avisado Issue #2 antes de tocar archivo compartido.
- `tests/prueba-gpt6-ciclorrutas.mjs`: regresión en Node con polilíneas sintéticas, interacción contextual y rutas degeneradas.
- `docs/EVOLUCION-ENCICLA-OPENAI-GPT6.md`: documento maestro de diagnóstico, comparativa de juegos, diseño de mundo único, tecnología, arte, modos y roadmap.
- `.github/workflows/openai-gpt6-auditoria.yml` y `openai-gpt6-e2e.yml`: pruebas automatizadas Node y Playwright de rama.

## Evidencia
- [Node + build + niveles OK](https://github.com/juanfeliperico369-stack/BicicletasUno/actions/runs/45034570000).
- [Chromium E2E COMPLETO, TODAS LAS PRUEBAS PASARON](https://github.com/juanfeliperico369-stack/BicicletasUno/actions/runs/45034570068).
- [14 capturas/resultados](https://github.com/juanfeliperico369-stack/BicicletasUno/actions/runs/45034570068/artifacts/14758294358). En CPU lenta emulada: Usuario p95 33,4ms; Anfitrión y Monitoreo p95 16,8ms. No se testeó teléfono físico.
- Después de cambio de km/h volver a ejecutar en nuevo commit.

## Integración para Gemini / Claude
1. Revisar posible duplicación de guardas del runner al integrar Gemini `99p`; mantener reglas espaciales con geometría real y evitar fallback de Taller. Su nueva implementación puede sustituir el wrapper cuando cubra los mismos casos.
2. Comprobar que el HUD conserva factor 3,6 y todos los modos mantienen unidad de distancia/tiempo/velocidad.
3. Revisar `Game.loop` en `60-ui.js`: `dt` truncado a 50ms puede ralentizar el tiempo en FPS bajos. Proponer fixed step sólo tras E2E.
4. Mantener mismo grafo, entidades y progreso entre cenital, primera, tercera, panorámica, 2D lateral y pixel. El 3D actual en Canvas2D no equivale a un mundo WebGL completamente unificado.
5. Ejecutar pruebas integradas después de mezclar ramas. No editar `dist` ni otros repositorios sin regenerar y validar.

**No se han generado assets 3D ni se ha publicado build nueva.** Estado: propuesta comprobada en CI, pendiente revisión/integración conjunta.
