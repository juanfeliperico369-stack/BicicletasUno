# Informe de desarrollo de ChatGPT · Motor City 4.1.0 · MC.Planeta

**Responsable:** ChatGPT. **Encargo:** continuar desarrollando el motor, probar y dejar constancia.
**Rama aislada:** `ia/chatgpt/planeta-cache-410-20261121` desde `main` 4.1.0.
**Integración:** pendiente de PR/revisión; no se ha modificado `main` directamente.

## Auditoría y causa

- En `js/13-planeta.js`, `mundo(id)` lanzaba una nueva carga cuando había una ciudad en proceso de inicialización; la caché sólo recibía el mundo después del `await`. Las solicitudes concurrentes duplicaban trabajo pesado.
- Un `Map` mantenía dos mundos por orden de inserción, pero las lecturas no renovaban recencia; no era realmente LRU.
- La expulsión no distinguía el mapa donde seguía el jugador del mapa que otro subsistema estaba precargando.

## Cambios de código

- Single-flight por ID con limpieza de tareas tanto al resolver como al fallar.
- LRU real, protección preferente de mundo activo, presupuesto configurable `maxMundos`.
- Diagnóstico `diagnosticoCache()` con contadores de aciertos, promesas compartidas, intentos, expulsiones y errores.
- Turno Cero avisa al motor del mundo activo después de entrar, sin alterar su narrativa ni físicas.

## QA preparado

- `pruebas/planeta-cache-cm34.mjs`: 7 pruebas sobre el módulo real aislado en Node.
- `pruebas/planeta-cache-browser.mjs`: el HTML real, 412×860, sin Internet; entra en Guatapé, precarga Medellín en paralelo y Manhattan y realiza una transición real a Medellín.
- CI `.github/workflows/motor-city-qa.yml`: añade ambos pasos sin eliminar pruebas de 4.1.0.
- Guía de API y límites: `docs/PLANETA-CACHE-CONCURRENCIA.md`.

**Veredicto todavía pendiente en este informe inicial:** CI de la PR. No se han medido milisegundos de carga, ahorro de heap ni FPS de GPU física. No se ha implementado streaming por zonas de 1 km.

## Coordinación con otras IA

- No se edita la rama de la PR #9 (paquetes MC4 por capas). Esta mejora utiliza `main` 4.1.0 y es compatible con aquel contrato de carga a nivel de interfaces.
- Claude: revisión e integración por PR si CI está verde; no incrementar versión sin comparar cambios con la PR #9 y los desarrollos recientes.
- Gemini: perfil de memoria, tiempos y FPS antes/después, preferentemente dos móviles representativos.
- ChatGPT siguiente: instrumentación de precarga por velocidad y streaming espacial real; mantener los docs de relevo y no fusionar sin resultados verificables.
