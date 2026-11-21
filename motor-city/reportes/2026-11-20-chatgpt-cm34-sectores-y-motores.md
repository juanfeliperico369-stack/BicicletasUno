# Motor City · Informe ChatGPT · C-M34 (caché ED1 y ruta de streaming)

**Fecha del encargo:** 20-nov-2026 (Colombia). **Base:** main / Motor City 4.0.3. **Rama:** ia/chatgpt/cm34-cache-20261120.
**Alcance:** motor común, no demo ni juegos derivados. Los cambios no están integrados en main ni constituyen streaming de bytes. No se modifica la versión de lanzamiento: Claude debe revisarla al integrar.

## 1. Diagnóstico con evidencia del repositorio

- El código de js/10-sectores.js mantiene un caché acotado de regiones de edificios ED1 *ya decodificadas*. El archivo MC4 comprimido, suelo, alturas y vías permanecen completos.
- Turno Cero instala el sectorizador sólo para nueva_york, con lado 1.000 m y maxRegiones 36, y lo actualiza cada dos segundos (juegos/getaway/20-juego.js).
- El relevo existente reporta una medición **hecha por otra IA en VM** para Manhattan: JS Heap 215,3 MB, reservado 262,4 MB, tiempo 2,85 s. No es una medición nuestra ni de un teléfono real.
- **Defecto 1:** actualizar(NaN, y) dejaba pasar coordenadas contaminadas. Podía eliminar erróneamente entradas ED1 por distancias NaN.
- **Defecto 2:** radio 3 con presupuesto maxSectores 4 recorría 49 celdas y expulsaba continuamente las mismas entradas por LRU, aunque no cambiara la posición.

## 2. Trabajo efectuado

- js/10-sectores.js: preselección ordenada de sectores cercanos, priorizando el centro y respetando el presupuesto. Entradas estables con radio mayor que el número de sectores permitidos.
- js/10-sectores.js: comprobación de coordenadas finitas antes de tocar caché y validación de configuración anómala. Se conservan los métodos públicos: zona, pedir, actualizar y limpiar, y las métricas de ultimo.
- pruebas/sectores-cm34.mjs: nuevo archivo que ejecuta el módulo real en un entorno Node VM, con 5 grupos de pruebas sin dependencias.
- .github/workflows/motor-city-qa.yml: incorpora la prueba C-M34 antes de la suite general, sin omitir QA existente.
- Documentos de relevo y coordinación en coord/ y en el historial de contexto.

### Pruebas verificadas aquí

Node 22.16.0, código de la propuesta en un contenedor local:
- node --check js/10-sectores.js: correcto.
- node pruebas/sectores-cm34.mjs: **5/5 grupos aprobados**.
- Casos: cuadrícula negativa y centros; presupuesto de 4 con radio 3 repetido 100 veces; reducción de 90 regiones ED1 ficticias a un máximo de 20; rechazo de NaN/Infinity; validación de parámetros y limpieza.

### Pruebas aún no verificadas

- node motor.mjs construir y node motor.mjs prueba --navegador sobre el repositorio completo.
- WebGL real, memoria de GPU, Android/iOS, comparación de p95 y tiempo de carga en teléfono.
- Resultado de GitHub Actions tras publicar esta rama/PR. No convertir las pruebas aisladas en una afirmación de aprobación general.

## 3. Investigación de técnicas históricas, aplicación de ingeniería limpia

| Referencia | Técnica documentada | Adaptación propia propuesta | Precaución |
| --- | --- | --- | --- |
| Build Engine (Ken Silverman) | Sectorización y paredes/portales; historial del autor: https://advsys.net/Ken/build.htm | Visibilidad por sector urbano/túnel/interior y caché de conexiones por calle | Mundo abierto: no convertir toda la ciudad en salas selladas |
| Quake / BSP y PVS | Precálculo de regiones potencialmente visibles: https://www.fabiensanglard.net/quakeSource/quakeSourceRendition.php | Calcular oclusores estáticos por manzana *en construcción* para reducir dibujo | Los edificios dinámicos requieren invalidación parcial |
| GTA III | Sectores próximos al jugador; impostores distantes; presupuestos estrictos de activos: https://gmtk.substack.com/p/how-rockstar-fit-an-entire-city-into | Dividir MC4 en chunks con precarga por rumbo/velocidad y LOD por manzana | Requiere formato de salida y lector perezoso; NO está hecho |
| Godot HLOD | Remplazo de muchas mallas por una malla lejana o impostor: https://docs.godotengine.org/en/stable/tutorials/3d/visibility_ranges.html | Un grupo de fachadas a LOD1/LOD2, sin alterar colisiones | Deben medirse draw calls y transición visual |
| MDN WebGL | Presupuesto VRAM conservador y liberación explícita de recursos: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices | Contar buffers/texturas y destruir recursos al descargar sectores | El JS Heap no equivale a memoria GPU |

**Derechos:** estas ideas son técnicas generales, desarrolladas desde cero. No se copian assets, sprites, DLL, fuentes o código de juegos/motores históricos ni se asumen sus licencias como permisivas.

## 4. Hoja de ruta para culminar C-M34 (NO IMPLEMENTADA)

1. Tomar línea base reproducible de Manhattan vs Medellín y Guatapé, en 412×860 y escritorio: bytes MC4, ED1, tiempo hasta manejar, GC, frames p50/p95/p99, fallos de carga y memoria de GPU estimada.
2. Añadir a herramientas de construcción un manifiesto versionado por chunk: identificador, bbox en metros, offsets, checksum, tamaño comprimido y tipos (suelo, relieve, red, ED1, hitos). Mantener compatibilidad con MC4 monolítico.
3. Dos empaquetados offline: (a) HTML único con chunks embebidos y **descompresión perezosa** (no streaming de red), (b) PWA con archivo por chunk precacheado para reproducción offline.
4. Cargar primero colisiones y suelo del sector activo; precargar dirección de movimiento 3–5 segundos y un anillo de vecinos. Nunca permitir un vacío físico bajo el jugador.
5. Aplicar LOD2 de silueta de edificios lejanos y histéresis; los datos de juego no se subordinan a si un objeto está dibujado.
6. Pruebas de viajes entre distritos, giros en U, persecuciones, entrada/salida de túnel, juego sin internet y restauración del guardado; comparar p95 y memoria contra la versión anterior.

## 5. Coordinación

La rama propuesta toca un archivo del motor reclamado por Claude: **no fusionar sin su revisión**. Claude conserva el control de versiones y sincronización, Gemini puede medir en VM, y ChatGPT puede continuar diseño/QA de C-M34. Mantener el expediente en esta rama, revisar PR concurrentes #7 y #8 antes de integrar y no sobrescribir cambios de otras IA.

**Siguiente agente:** correr CI completa; inspeccionar cualquier fallo; documentar capturas/heap con hardware real; no afirmar streaming real hasta que exista chunking verificable.

## 6. Diagnóstico real de CI y corrección adicional

El primer run de PR #9 (https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44865948935) confirmó construcción y pruebas Node generales, pero falló en pruebas/getaway-contenido.mjs:150, durante la aserción C-M34. El problema **sí era de esta propuesta**: la comprobación E.cache instanceof Map daba falso al pasar desde el entorno de la prueba vm.runInNewContext (dos realms distintos).

**Arreglo aplicado a la rama:** validar el contrato necesario del caché (métodos keys y delete) en vez de instanceof Map. El test independiente se cambió para correr la clase en otro contexto JavaScript sin inyectar la clase Map del host; los 5 grupos volvieron a pasar localmente. Queda la repetición CI del commit corregido para cerrar esta incidencia.

Esta incidencia muestra por qué pasar sólo pruebas aisladas nunca sustituye comprobar el consumidor real ni la CI completa.

## 7. Continuación C-M34 · carga offline por capas comprimidas

**Pedido del autor:** continuar desarrollando y mejorando el motor. La parte inicial de esta rama únicamente corrigió la caché ED1; esta ampliación crea un cargador real de **capas** comprimidas de MC4 sin necesidad de deserializar primero el contenedor binario completo.

Cambios adicionales en esta misma rama:

- `js/10-mundo.js`: `MC.Mundo.desdePaquete(meta, obtener, cfg)` y `MC.Mundo.cargarPaquete(meta, obtener, cfg)`. `_bytes(c, nombre)` acepta un proveedor sincrónico Base64/bytes y verifica longitud. El lector original sigue intacto.
- `herramientas/construir.mjs`: con `mundos_capas:true` en `juego.json`, separa la cabecera MC4 y sus entradas deflate sin recomprimir; verifica límite del archivo, nombre de capa seguro y escapa metadatos para HTML.
- `juegos/getaway/juego.json`: opt-in en el juego de tres ciudades.
- `juegos/getaway/20-juego.js`: lector dual (capas primero, MC4 monolítico anterior como compatibilidad), sin cambios de historia o mecánicas.
- `pruebas/paquete-capas-cm34.mjs`: prueba real de los tres mundos contra los bytes comprimidos de las fuentes MC4, equivalencia de capas y validación de errores.
- `pruebas/paquete-capas-browser.mjs`: inicia una partida de Guatapé desde la portada en Chromium 412×860, carga Medellín y Manhattan y verifica que no hubo llamadas a red.
- Workflow: ambas pruebas integradas. API, límites y comandos en `docs/MC4-CAPAS-OFFLINE.md`.

**Lo que este cambio no hace:** no divide el suelo, relieve o edificios en sectores de 1 km; no reduce el peso descargado del HTML; no demuestra una tasa de FPS ni una cantidad de memoria ahorrada. Es una mejora de decodificación e infraestructura previa al streaming territorial.

**Estado de validación:** la compilación, regresión C-M34 anterior y suite general Node ya habían pasado CI de GitHub en la etapa precedente de la PR. La ampliación de empaquetado necesita aprobación de la nueva CI, pruebas de partida en Chromium y un perfil físico de memoria. No confundir pasos verdes de un commit anterior con el veredicto del nuevo commit.

**Referencia técnica de APIs:** https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/DecompressionStream y https://docs.godotengine.org/en/stable/tutorials/3d/visibility_ranges.html. `DecompressionStream` usa el respaldo JS existente cuando no está disponible; no se añadió dependencia.

**Siguiente hito prioritario:** índice y formato de chunks espaciales de suelo/relieve/ED1 con precarga por velocidad, preservando colisiones y guardados, antes de declarar C-M34 completado.
