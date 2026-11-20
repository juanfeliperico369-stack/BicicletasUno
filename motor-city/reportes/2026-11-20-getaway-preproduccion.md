# TURNO CERO · Entrega preproducción y validación del prototipo

**Fecha:** 2026-11-20

## Archivos entregados
- `docs/REFERENCIAS-MANHATTAN-13.md` / `juegos/getaway/preproduccion/referencias.json` — investigación documental de las 13 referencias de Google Play, sin copiar assets.
- `docs/GETAWAY-MANHATTAN-BIBLIA.md` / `juegos/getaway/preproduccion/biblia.json` — thriller criminal adulto original, Mara Vega, siete misiones, tres finales, reglas de calor/IA/economía y requisitos GIS.
- `arte/chatgpt/guias/manhattan-concepto-editorial.svg` y `manhattan-interfaz-movil.svg` — dos recursos vectoriales originales editables, respectivamente concepto de escena y boceto de HUD táctil.
- `juegos/getaway/prototipo.html` — **experiencia offline mínima** con conducción libre en una cuadrícula ficticia, tráfico, colisiones, persecución por grafo, cuatro estados de misión, dos decisiones, guardado local, teclado y táctil.
- `pruebas/getaway-prototipo.mjs` — prueba automatizada de lectura offline, entrada, no redes, no desbordamiento horizontal y controles táctiles en 4 tamaños.

## Integración de la siguiente IA
1. Validar contra la cabeza de PR #5 (rama de trabajo, no `main`).
2. No reutilizar la cuadrícula ficticia como mapa georreferenciado.
3. Sustituir simulador propio por `MC.Cuerpo` / `MC.Persecucion` / `MC.IA` cuando Manhattan MC4 exista.
4. Comprobar la conexión real de puentes y túneles, el coste de cada sector y el desplazamiento por rutas conectadas.
5. Hacer auditoría visual sobre capturas reales, con navegación por teclado y touch.

## Evidencia y límites
El JavaScript del prototipo fue comprobado sintácticamente. El archivo es una maqueta **de interfaz y mecánicas**, no el videojuego acabado, no contiene Manhattan geográfica real y no ofrece tiempos de carga ni FPS medidos en GPU física. El nuevo test Playwright se ejecutará en GitHub Actions antes de declararse aprobado. El boceto pictórico generado en esta conversación funciona como referencia artística adicional, pero las fuentes vectoriales originales publicadas en el repo son los assets editables.
