# Entrega integrada ChatGPT y tareas Gemini · Motor City 3.0.1

**Fecha:** 20 de noviembre de 2026. **Rama:** `claude/motor-city-engine-xu7p4y`.

## Trabajo publicado
- G-H17: `contenido/objetos-gemini.json` contiene 30 tipos de mobiliario de Guatapé y Medellín con medidas aproximadas en metros, masa, color, material y tratamiento en física. **Parámetros de diseño**, no fichas oficiales ni medidas tomadas en terreno.
- C-M29 (parcial): `MC.Objetos` integra los tipos, las roturas simples de postes deformables, IDs deterministas y persistencia de posición y estado por sector **de origen**, con `MC.GuardadoSectores`.
- Mandados carga y guarda los cambios de Guatapé; los mundos aleatorios no reutilizan el guardado.
- Regresiones añadidas al conjunto general para guardado/restauración, catálogo e IDs duplicados.

## Verificación
- **Realizada:** simulación aislada de contacto con objeto, cambio de sector, restauración y rotura; análisis sintáctico de los fragmentos JS.
- **No ejecutada:** `node motor.mjs construir`, `node motor.mjs prueba --navegador`, `node motor.mjs publico`, `node motor.mjs revisar-arte`, capturas de Playwright y pruebas reales en teléfono. No había clon integral accesible mediante git en este entorno.
- **No integrada:** salida compilada `dist/`. Antes de fusionar a `main`, reconstruirla, correr las pruebas y confirmar tamaño y calidad visual.

## Otros pedidos Gemini
- G-H7: las 7 fichas R02, R03, R04, R08, R09, R13 y R18 tienen contrastes documentales en `docs/INSPIRACION-VISUAL.md`, pero los enlaces bloqueados de Instagram requieren vídeo o fotogramas verificables.
- G-H9, G-H14 y G-H16: la telemetría de GPU, p95 y calentamiento exige un móvil físico; no se simulan lecturas.
- G-H11: los enlaces directos de las cuatro obras pendientes deben cotejarse contra Wikimedia Commons y su licencia individual.
- G-H12 y G-H13: ejecutar el perfil de público y las skills externas desde Node/Antigravity y adjuntar sus salidas literales, no resultados imaginados.

## Próxima integración
1. Reconstruir el motor: `node motor.mjs construir`.
2. Probar motor y navegador: `node motor.mjs prueba --navegador`.
3. Correr `node motor.mjs publico --perfiles nina` y `node motor.mjs revisar-arte arte/gemini`.
4. Revisar cambios en una versión de GitHub Pages y medirlos en el teléfono.
5. Sincronizar con BicicletasUno y MetroZero solo tras pasar la prueba de compatibilidad.

**Arquitectura:** las reglas reutilizables viven en Motor City; Mandados solo decide el momento del guardado. No se cambió `js/valle.js` ni MC4.
