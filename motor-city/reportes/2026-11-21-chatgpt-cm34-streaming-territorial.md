# Informe técnico · Motor City 4.2 · C-M34 territorio + memoria

**Autor de cambios:** ChatGPT · **21 de noviembre de 2026** · rama `ia/chatgpt/cm34-spatial-420-20261121` · PR #11 borrador.
**Contexto:** `main` avanzó a 4.2.0 y absorbió la PR #9 (carga MC4 por capas). La PR #10 (gestión de caché Planeta sobre 4.1) pasó Node+Chromium pero quedó con conflictos por cambios posteriores. Esta entrega retoma su corrección sobre 4.2 y añade **streaming territorial real de suelo/nivel**.

## Auditoría (problemas verificables antes del cambio)

1. `MC.Mundo.cargarPaquete` descomprimía toda la cuadrícula `suelo` y toda `nivel` desde el inicio. La mayor parte del mapa no se consulta a la vez.
2. El paquete HTML por capas omitía segmentación geográfica; `MC.Sectores1km` solo controlaba caché de objetos y decodificaciones ED1, no los bytes de las capas de suelo.
3. `MC.Planeta.mundo` podía iniciar dos cargas iguales en paralelo. Su recorte por inserción no era LRU real.
4. Turno Cero liberaba residentes con `planeta.cache.delete` directo, sin invalidación de `_puertas` ni protección ante descargas concurrentes que terminaran después.

## Trabajo de código realizado

- **`js/10-raster-sector.js` (nuevo):** `MC.RasterMC4`. Descompresión DEFLATE bajo demanda por bloques geográficos de aproximadamente 1 km, valor por casilla, LRU 16 bloques, borde parcial, `u8/i8`, diagnóstico y reconstrucción explícita.
- **`herramientas/construir.mjs`:** índice de offsets en Base64 dentro de dos bloques inertes `mc4r-ciudad-suelo/nivel`. Conserva el MC4 fuente y las demás capas comprimidas; no recurre a Internet.
- **`js/10-mundo.js`:** `Mundo.desdePaquete/cargarPaquete` acepta proveedor de sectores como cuarto parámetro. `suelo/sueloCasilla/nivel` consultan el bloque espacial y `precargar` no materializa las dos capas. `Mundo.capa` sigue disponible para compatibilidad.
- **`juegos/getaway/juego.json` + `20-juego.js`:** opt-in `mundos_rasters:true` para las tres ciudades y proveedor de chunks desde HTML. Cambio puntual del código de transición a `planeta.liberarExcepto(id)`.
- **`js/13-planeta.js`:** portado de PR #10 a 4.2, conservando el `id` de ruta añadido por Claude; deduplicación de cargas, LRU, presupuesto, fijación de destino, liberación centralizada y epoch de precargas antiguas.
- **QA:** pruebas de integridad de los tres MC4 originales, stress de bordes/firmados/LRU, nueve casos de Planet, dos pruebas reales Chromium, y adaptación de aserción G-H24 para la nueva API.

## Evidencia y correcciones del primer CI

- Ejecución inicial [44894154180](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44894154180): falló antes de compilar por un paréntesis extra en la validación de `RasterMC4.indices`; corregido en `69f167e`.
- Ejecución siguiente [44894197465](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44894197465): **pasó** compilación, regresión ED1, stress RasterMC4, validación completa por ciudad byte a byte, caché Planeta y suite Node histórica (141 afirmaciones). **Falló** un test de integración antiguo que buscaba literalmente el borrado directo `planeta.cache.delete(key)`; actualizada su aserción para verificar `planeta.liberarExcepto(id)` y el método del motor en `pruebas/getaway-contenido.mjs`.
- **CI del último commit:** verificar en la PR #11 y en GitHub Actions antes de afirmar aceptación completa; en este documento inicial, las validaciones Chromium con el nuevo raster aún no están certificadas.

## Riesgos y trabajo pendiente

- El mapa Base64 completo sigue incrustado en HTML. Cada sector se descomprime individualmente, pero no existe transferencia física por red/archivo.
- `edificios` ED1, `vias` y `relieve` se siguen descomprimiendo completos. El próximo hito C-M34 exige su fragmentación con índice propio, continuidad de colisión y geometría.
- Los rasters se inflan de forma síncrona en el primer acceso a cada sector. Falta probar entradas rápidas a sectores y medir tirones.
- `Mundo.capa('suelo')` o `capa('nivel')` reconstruyen toda la cuadrícula deliberadamente; revisar consumidores externos que llamen esas APIs directamente.
- No existe benchmark de reducción porcentual de RAM ni de FPS físico medido en esta rama. Testear **en el mismo dispositivo** antes/después, con hardware real y CI por separado.
- No se actualizó `VERSION.json` ni se fusionó `main`; esa decisión corresponde al integrador tras QA y revisión.

## Instrucciones para el siguiente agente

1. Lee `docs/MC4-STREAMING-TERRITORIAL.md` y este informe, después inspecciona la PR #11 y sus GitHub Actions.
2. Si CI falla, corregir **primero** los casos reales; nunca desactivar tests ni atribuir aprobaciones de commits viejos al nuevo.
3. Prioridad: chunking ED1 por región + relieve con halo de interpolación + streaming de grafo vial conectado.
4. Comparar coste de descompresión/HTML/heap en Manhattan real. Si p95 empeora, añadir precarga predecible antes de seguir agregando contenido.
5. Registrar su propia entrada en `CONTEXTO-RELEVO.md`, ficha en `coord/agentes/` y mensaje `coord/buzon/` sin modificar registros ajenos. Las decisiones de merge deben coordinarse con Claude/Gemini.
