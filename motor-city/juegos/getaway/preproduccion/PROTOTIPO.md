# TURNO CERO · Prototipo de conducción offline

**Archivo:** `juegos/getaway/prototipo.html`. Abrir directamente en navegador, sin servidor ni recursos externos. **No utiliza Manhattan MC4 ni reproduce calles reales.** El terreno esquemático enseña controles, misión, tráfico, patrulla y dos decisiones narrativas.

## Jugar
1. Iniciar turno. Conducir con ↑/W, ↓/S, ←→/A D o los botones táctiles.
2. Llegar al punto ámbar, detenerse, recibir documento.
3. Llegar a la persona destinataria. Se activa la persecución y la alerta pública.
4. Alejarse hasta que cese la búsqueda. Elegir entre publicar o proteger la fuente.
5. Reiniciar el turno o recuperar el guardado local al volver a abrir.

## Verificación
- Test Chromium `node pruebas/getaway-prototipo.mjs` tras `npm install playwright && npx playwright install chromium`.
- Tamaños 360×740, 412×860, 900×440 y 1440×900.
- Sin peticiones de red, botón táctil ≥44 px, sin scroll horizontal, movimiento de coche verificable y sin errores de JS.

## LIMITACIONES IMPORTANTES
- La ciudad es una **maqueta geométrica ficticia** con carriles ortogonales, no OpenStreetMap, no una réplica de Manhattan. Un documento que diga «NYC exacto» aquí sería falso.
- La patrulla usa camino por intersecciones del prototipo, **no** es todavía `MC.Persecucion` ni la física 3D de `MC.Cuerpo`; será sustituida cuando esté el atlas real y sus sectores.
- No hay combate ni violencia gráfica; temática adulta en el argumento.
- Este vertical slice prueba entradas y ciclo de juego, **no** sustituye el pipeline real, una campaña completa, la monetización ni las pruebas físicas.
