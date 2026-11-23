# ChatGPT · Motor City 5.2 — R6-b: sectores LOD2 con Worker Blob

**23 de noviembre de 2026 · Firma: ChatGPT (OpenAI).** Rama `ia/chatgpt/r6b-worker-lod-20261123`, [PR #25](https://github.com/juanfeliperico369-stack/motorcity/pull/25), sin cambios en main.

## Por qué es el relevo pendiente de Codex

El prehorneador `herramientas/precocinar-sectores.mjs` de R6 quedó unido en `main`, y ya había demostrado que **2.086 sectores de Medellín** equivalían a **101.492.868 B** si se guardaban los tres LOD; LOD2 de 80 m pesaba **5.302.620 B** con **1.159.190 triángulos**. Sin embargo, `VistaTres` todavía generaba los edificios proceduralmente en cada región y no consumía esos bloques. La orden 5.2 prioriza R6-b con Workers Blob, presupuesto de memoria y respaldo.

## Lo que hice

1. Refactor de `herramientas/precocinar-sectores.mjs`: exporta lector MC4 ED1/EDJ y geometrías como módulo reutilizable sin perder su función CLI ni el self-test previo.
2. Herramienta `herramientas/r6b-compacto.mjs`: solo conserva **cajas lejanas LOD2**, agrupadas en celdas de **80 m** y regiones de **160 m**, clasificadas por sector de **1 km**. Cada caja ocupa **14 B** brutos, atributos cuantizados a **0,125 m**, y cada sector se comprime mediante `deflate`. El empaquetador incluye validación exhaustiva de longitudes, dimensiones y recuentos.
3. Integración **opt-in** para `juegos/getaway/juego.json` (Guatapé y Medellín). `herramientas/construir.mjs` incrusta paquetes comprimidos en etiquetas `script type="text/plain"`, sin URL externa ni formato nuevo de guardado. Límite de **2,5 MB de datos comprimidos por ciudad**: si se excede, omite el paquete y conserva el procedimiento original.
4. Módulo `js/45-z-r6b.js`: `MC.R6B` ofrece un Worker creado desde Blob embebido, decodificación nativa `DecompressionStream('deflate')`, envío mediante `postMessage` de buffers transferibles, caché de hasta **6 sectores**, cola de máximo dos solicitudes en paralelo, manejo de errores y liberación al cambiar de mundo.
5. `VistaTres` utiliza exclusivamente mallas LOD2 para regiones de bajo detalle (0/1); **fachadas R1 y edificios cercanos siguen con el material y geometría anterior**, y cualquier fallo activa el fallback. No reemplaza `posRender` (Historieta) ni cambia cámaras, física, rutas o mallas de otros juegos.
6. `pruebas/r6b-datos.mjs` y `pruebas/r6b-browser.mjs`: validan Guatapé/Medellín reales, límites de tamaño, arranque del Worker en el HTML sin internet, caché y fallback a VistaTres clásico. El browser QA incluye muestra de 12 construcciones de una misma región a CPU **4×** para obtener mediana y p95 de **coste de construir región**, no FPS.
7. Workflow `.github/workflows/r6b-qa.yml` ejecuta pruebas de Node/Chromium + regresiones 3D/modos en rama aislada.

## Medidas, riesgos y condiciones de aceptación

- Las métricas de los archivos **de este nuevo formato compacto** deben leerse de `node pruebas/r6b-datos.mjs` y del log del build en la ejecución de GitHub Actions; no confundir con el formato R6 original. No declarar p95 mejorado si no supera al procedural en las mismas condiciones.
- Un paquete entero entra en el **HTML offline**, pero los búferes de las regiones y la geometría de GPU solo se instancian por demanda. Cargar todo el paquete del mundo sin conexión aún cuesta memoria JS y tamaño del HTML. El Worker mantiene máximos de seis sectores.
- Las cajas LOD2 unen siluetas próximas y **no representan edificios 1:1**. Son solo un sustituto aceptable cuando están lo bastante lejos; se debe verificar que su perfil visual no introduzca edificios falsos a distancias medias.
- La geometría es todavía un piloto: se construyen normales de tres en el hilo de representación al recibir los buffers del Worker; convendría generar normales fuera del hilo si una prueba de carga demuestra latencia.
- La descompresión utiliza características relativamente modernas; si falta Worker, Blob URL o `DecompressionStream`, el render procedural original debe seguir funcionando.
- La prueba CPU 4× mide construcción de regiones en el Chromium Linux de GitHub, **no p95 total de cuadros ni uso de batería en Android/iOS real**. Se requiere test de GPU físico para validar un beneficio en el dispositivo del usuario.
- No tocamos mapas MC4, licencias catastrales/relieve, guardados `motorcity.turnocero-v1`, mundos hermanos, ni subimos arte ajeno.

## QA para integrador Claude

```bash
node herramientas/precocinar-sectores.mjs --self-test
node pruebas/r6b-datos.mjs
node motor.mjs construir
node pruebas/r6b-browser.mjs
node pruebas/tres.mjs
node pruebas/modos.mjs
node motor.mjs prueba --navegador
```

La prueba dedicada y general debe finalizar **en verde** antes de fusionar el PR; la disponibilidad de otras ramas concurrentes puede crear conflictos en `CONTEXTO-RELEVO.md` y fichas, que deberán reconciliarse sin perder entradas.

**Siguiente paso para Codex:** validar calidad visual con capturas bajo cámara aérea, medir p95 de cuadros reales y consumo de GPU en Android (autor), decidir si R6-b debe activarse por defecto. Después, R4-b para techos de OSM con correspondencia por geometría, R8 SSAO/faroles/agua y la IA policial C5-05.

**Relevo obligatorio:** quien continúe debe registrar su trabajo y las métricas en `CONTEXTO-RELEVO.md` §8, actualizar ficha en `coord/agentes/` y dejar un buzón con los fallos pendientes.
