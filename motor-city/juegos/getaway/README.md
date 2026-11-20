# TURNO CERO · Manhattan — preproducción

**No confundir con el juego final ni con un Manhattan MC4 real.** La visión nueva es un juego **3D de acción y espionaje contemporáneo (2026)** con mafia, gadgets, combate a pie y persecuciones; la conducción 2D existente queda como una prueba de mecánicas. Esta carpeta recopila los contratos de historia/arte/sistemas del nuevo juego de mafia adulto. El motor mantiene Mandados y sus archivos sin cambios.

## Abrir primero
- `../../docs/REFERENCIAS-MANHATTAN-13.md`: 13 videojuegos comerciales, diferencias y no-copias.
- `../../docs/GETAWAY-MANHATTAN-BIBLIA.md`: trama de siete misiones y cinco actos, economía, control y arquitectura técnica.
- `preproduccion/biblia.json`: síntesis estructurada para agentes de IA.
- `../../contenido/nueva-york-lugares.json`: 50 puntos oficiales con acceso aún por verificar.
- `../../arte/chatgpt/guias/manhattan-*.svg`: arte conceptual vectorial propio (sin parecer capturas reales).

## No alterar accidentalmente
- `js/valle.js`, `ciudades/medellin.mc4`, Guatapé, MC4, los guardados y las construcciones de EnCicla/Metro.
- El render 2D y 3D usan una única simulación; toda mecánica común se añade a MC, no al juego.
- No publicar nueva arquitectura como «integrada en main» mientras solo exista una PR.

## Prototipo jugable offline
Abrir directamente [`prototipo.html`](prototipo.html): es un **minijuego preliminar con ciudad ficticia**, vehículo, persecución simple y dos decisiones. No es un duplicado comercial ni integra todavía MC4; la misión real de Manhattan sigue condicionada al pipeline geográfico.

## Primera prueba de aceptación
Un jugador adulto entra a una misión opcional de entrega nocturna, maneja por una cuadrícula *de demostración* (NO la real), acepta o rechaza la difusión de un recibo, evita una patrulla, encuentra un taller y puede reiniciar. La verdadera ciudad sigue pendiente de datos GIS + licencias + streamer.

## Propuesta de orden de implementación
1. Registrar contrato de escena y mapas con test determinista.
2. Hacer prototipo en un HTML offline, con entradas PC/táctil y HUD legible.
3. Generar atlas real de Manhattan y verificar su cobertura; pasar a MC4 sectorial.
4. Integrar `MC.Persecucion`, `MC.Cuerpo`, `MC.Objetos` y `MC.GuardadoSectores` sin forks.
5. Añadir cinco capítulos, decisiones y tres finales.
6. Probar Chromium + teléfonos reales antes de proponer fusión y captura comercial.

## Adenda 3D: espionaje contemporáneo
- [Biblia revisada: acción, dispositivos especiales, 3D, misiones y calidad](../../docs/GETAWAY-ESPIONAJE-3D.md).
- Los modelos GLB generados en un paquete externo son **proxies de preproducción**, todavía sin rigging, PBR o animación; no confundir con assets finales ni con la escena jugable integrada.
- La prioridad pasa a ser **una única ciudad 3D** con cámaras de acción, vehículos y gadgets, no un juego de sprites.


## Vertical slice 3D de acción (v0.3.0, 20-nov-2026)
- [Juego 3D offline](turno-cero-accion-3d.html) con una misión original de espionaje, combate ficticio, dron, visor, señuelos y persecución vehicular.
- [Guía](arte3d/README-ACCION-3D.md), [generador de 3 actores con rig y 8 clips](arte3d/generar_actores_rig.py), [validador](arte3d/validar_actores_rig.py) y [E2E Playwright](../../pruebas/getaway-3d.mjs).
- **45 GLB generables** incluyendo los 42 anteriores; los 3 actores nuevos están articulados y son editables. Es un **distrito ficticio**: GIS Manhattan, integración MC4, modelos PBR de alta fidelidad y reproducción de skin glTF en el juego web siguen pendientes.
