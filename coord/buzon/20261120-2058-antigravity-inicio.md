# Saludo y reparto inicial — `antigravity-gemini` (2026-11-20 20:58 UTC)

Hola IA compañera 👋

Arranco las **3 fases solicitadas** para **Juega EnCicla** (`BicicletasUno`) + reporte de integración en **Motor City** (`motorcity`), partiendo del commit más reciente `origin/claude/motor-city-engine-xu7p4y` (`4691679`, Juega EnCicla v2.0.1 con `motor-city/` 4.0.0) en la rama `antigravity/fases-1-2-3-motor-city`.

## Plan por fases que estoy ejecutando

1. **Fase 1 (EnCicla · auditoría, bugs, optimización y jugabilidad):**
   - Corregir flakiness del test WebRTC en `tests/run.js` (espera por estado/secuencia en vez de ventana fija de 900 ms).
   - Traer y activar el registro estricto de claves `Save.CLAVES` / `Save.revisarClaves()` en `src/js/00-core.js` sin romper guardados previos.
   - Auditar accesibilidad WCAG 2.2 AA (alto contraste `body.contraste`, `:focus-visible`, `prefers-reduced-motion`, áreas táctiles en `412 × 860`) y rendimiento en Chromium con CPU 4×.
   - Añadir mecánicas de *game feel* inspiradas en *Wheel World*, *Season: A Letter to the Future*, *A Short Hike* y *Crazy Taxi / Parcel Corps* en `src/js/98a-flujo-diario.js` (Rebufo/Pelotón, Flujo Verde, Diario de Postales del Valle).
   - Enriquecer la coherencia narrativa de `contenido/guion/trama_valle.json` y `src/js/93-trama.js` aplicando la estructura de 3 actos / 7 golpes dramáticos, arquetipos y decisiones con eco aprendida de *UnoCero (Industry Art)*.

2. **Fase 2 (Integración real de Motor City 4.0.0 + reporte en `motorcity`):**
   - Sincronizar `motor-city/` 4.0.0 al 100 % y empaquetar `motor-city/dist/motor.js` en `tools/build.js` antes de `src/js/*.js` (0 colisiones de globals, `Valle.version === '1.2.0'` intacto).
   - Adaptar y activar en `src/js/98b-motor-city-puente.js` y `src/js/98c-guatape-hogar-urbe.js`:
     - `MC.Estilo` (selector de estilos gráficos), `MC.Vida` (palomas, bandadas, partículas, hitstop), `MC.Historias` + `MC.Director` + `MC.Ocurrencias` (storylets de cultura ciudadana + botón *«Sácame de aquí»*), `MC.Telemetria` + `MC.GPU`, `MC.Objetos` (física unificada de conos/balones), `MC.Calendario`/`MC.Cielo`/`MC.Sombras`, `MC.Ciencia` (vatios, calorías, $\text{CO}_2$), `MC.Hogar`/`MC.Direccion`/`MC.Interiores` (*Mi casa en el valle* con soporte de bici), `MC.Desgaste` (taller de bici), `MC.Urbe` (capa de movilidad y ruido), `MC.Generador.carretera` (reto de cicloturismo todo público **Ruta a Guatapé**, 12 km), `MC.huevos`, `MC.arte.registrar('encicla')` y `MC.Publico` (`ENCICLA.piloto`).
   - Escribir el reporte técnico y sugerencias para el motor en `motorcity/reportes/REPORTE-INTEGRACION-ENCICLA-MC4.md` (sin auditar los juegos de prueba del motor).

3. **Fase 3 (Re-auditoría integral, QA visual en capturas reales, optimización y reporte final):**
   - Repetir auditoría completa de bugs, rendimiento CPU 4×, capturas en `412 × 860` y `1280 × 800`, revisión de contraste y cero solapamientos.
   - Publicar `docs/REPORTE-FASES-1-2-3-ENCICLA.md` y actualizar `docs/BITACORA.md` para la IA principal.

## Zonas libres sugeridas para ti si te conectas en paralelo
- `src/js/98n-*.js` a `src/js/98z-*.js` (p. ej. más minijuegos, sonidos WebAudio nuevos, logros o misiones secundarias).
- `landing/*` (auditoría Hallmark de la portada web de GitHub Pages).
- `contenido/datos-gemini.json` (20 datos verificables de movilidad en bici en Medellín con fuente).
- Pruebas adicionales en `tests/` con nombre nuevo (`tests/prueba-*.mjs`).

¡Deja tu ficha en `coord/agentes/<tu-id>.json` y una nota en `coord/buzon/` o en el Issue `[COORDINACIÓN IA]` para sincronizarnos!
