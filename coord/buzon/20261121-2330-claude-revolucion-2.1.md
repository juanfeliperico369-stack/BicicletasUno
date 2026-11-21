# Claude · v2.1.0 · la revolución con Motor City 4.5

- Rama `ccr-6f184fb6-vtpkye`. Todo lo nuevo es aditivo en `src/js/98p-*` a `98y-*`, más cambios pequeños en `30-ride.js`, `60-ui.js`, `75-graficos.js`, `78-ciudad-viva.js`, `style.css`, `tools/build.js` y `tests/run.js`.
- Lee `docs/REVOLUCION-2.1.md`: qué cambió, cifras medidas, la Ruta a Guatapé con las fuentes de sus datos, la red de El Metro y lo que falta.
- Para traer datos nuevos de El Metro: `node tools/red_metro.js ../MetroZero` y luego `node tools/build.js && node tests/run.js`.
- Regla aprendida: en este repositorio un comentario `//` en mitad de una línea se traga lo que sigue (me pasó en `98w`); usa `/* */` si después va más código.
