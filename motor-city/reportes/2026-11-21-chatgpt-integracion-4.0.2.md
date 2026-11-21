# Motor City 4.0.2 · Integración de Claude, Gemini y ChatGPT — Fase de endurecimiento

**Fecha:** 20–21 de noviembre de 2026 (Bogotá/UTC)  
**Repositorio:** https://github.com/juanfeliperico369-stack/motorcity  
**PR:** https://github.com/juanfeliperico369-stack/motorcity/pull/7  
**Base integrada:** Motor City 4.0.2 de Claude (`288a258`), mediante merge de dos padres (`0cb3087`). `main` NO se modificó durante este trabajo.

## 1. Trabajo ejecutado (código y pruebas)

### Gemini · G-H21/22/23/24
- Ocho coordenadas de historia corregidas según auditoría de cartografía MC4. `gu_finca` volvió a `6.2301,-75.1648` porque la segunda revisión de Gemini verificó terreno libre, acceso a agua cercana y ausencia de un negocio adyacente; identificador `ficcion:true`.
- `coro` inexistente sustituido por el rol `camara` de los subtítulos.
- Idioma suave: mayúsculas, singular/plural, variantes y títulos/descripciones de contratos; idioma fuerte se conserva.
- Catálogo de 28 paradas **originales de Gemini** importado a `contenido/paradas-carretera.json`, con `id`, `nombre_es`, `nombre_en`, `tipo`, `rutas`, `ambiente`; se mantiene alias de compatibilidad `nombre`. Generador `js/13-planeta.js` respeta las rutas y pasa `id` de tramo. Talleres/refugios se detectan según `dibujo/tipo`, no sólo por patrones del nombre.
- **Memoria**: al entrar efectivamente en otro mundo, se libera el anterior de `MC.Planeta.cache`, sin alterar la semántica de precarga `Planeta.mundo()` usada por el motor. La caché de geometría ED1 sigue sectorizada cada 1 km, hasta 36 regiones. Queda medir JS Heap después de GC y RAM real en teléfono.
- Corrigió un bug original de `Generador.carretera`: el campo `EDJ[7]` esperaba vértices de polígono, pero recibía una cadena con el nombre del establecimiento. Ahora usa `null` y los nombres viven en `lugares`. Prueba evita anillos con NaN.

### Acción, conducción y arte 3D
- `MC.AccionPie.perseguir` + `juegos/getaway/50-extras.js`: guardias solo persiguen/golpean al ver realmente a Mara, con comprobación de paredes finas y última posición conocida. No rompen la integración de carreras, rutas A* ni Run de Claude.
- `MC.GloboGPU`: radio sensible a formato vertical, polos más suaves, etiquetas de ciudades dibujadas en Canvas transparente sobre la capa WebGL2; respaldo 2D sigue disponible.
- `MC.Piezas`: capó, puertas, baúl y rueda con gravedad y rebote procedurales; ahora visibles también en modo Canvas 2D / Raster software junto a humo de coche dañado.
- Prototipo independiente 3D: botón de señuelo `CEBO`, sin texto que rebose; prueba de tamaños de controles.
- G-H20: portada optimizada para mostrar `Historia nueva` sin scroll en 412×860, menú de pausa opaco que oculta HUD y subtítulos, limpieza de diálogos al cambiar a Calle libre.
- **C-A16**: 4 vehículos y 2 actores originales convertidos a GLB con `TEXCOORD_0`, mapas de albedo/metal-roughness 1024×1024 empotrados (12 PNG exportados) y validación de skins/8 animaciones. Generables desde `texturizar_pbr.py`. Los PBR no se muestran todavía en el shader del juego, que usa color por vértice.
- **C-A17 Gemini**: 18 archivos de arte (portada, 5 actos, atlas de texturas, 9 losetas, catálogo y galería) copiados **sin modificación ni sustitución de autoría**, junto a sus 17 informes/capturas y 3 entradas de coordinación. El PR #8 de Gemini sigue existiendo de forma independiente; revisar cómo integrarlo para no duplicar su aportación.

## 2. Validación
- CI glTF de PBR corregida tras un fallo de alineación BIN de glTF; los GLB/PBR ya pasaron en GitHub Actions. Véanse las ejecuciones de la PR.
- Pruebas Node y Chromium ampliadas: modo suave, geometría EDJ sin NaN, guardias sin visión a través de paredes, catálogo Gemini, una sola ciudad cacheada tras viaje, globo en móvil y botón táctil sin rebose.
- **No declarar CI integral terminada antes de ver su conclusión para el commit HEAD más reciente.** Las ejecuciones intermedias canceladas al subir nuevos commits no equivalen a fallo de código; una ejecución falló por prueba de cache demasiado agresiva que se corrigió.

## 3. Límites y prioridades siguientes
1. Medir memoria real `heapUsed`, `heapTotal` y recursos de GPU en Android e iOS físicos. La liberación del mapa anterior es lógica verificable, **no ahorro numérico probado**.
2. Streaming MC4 genuino: separar los mapas binarios en sectores y cargar/decodificar por cercanía; el motor actual sigue incrustando 10 MB comprimidos de Manhattan.
3. Renderizar UV/PBR en el shader del juego y mejorar mallas de producción (normal maps, texturas y LOD retopologizados).
4. Integrar globo en una escena 3D continua de ciudad→planeta; ahora usa un overlay WebGL2.
5. IA de combate/cobertura, colisiones complejas, física de piezas reales del GLB.
6. Validar todas las ubicaciones con licencias, acceso real y exclusión de sitios sensibles. Las coordenadas narrativas están **aproximadas y ficcionalizadas**.
7. Revisar la galería/artes de Gemini y los assets 3D en teléfono físico; publicar la PR sólo después de CI en verde.

## 4. Relevo
Mantener abiertas las ramas de otros agentes y **nunca forzar merge de la PR en borrador sin revisar CI**. En caso de integrar PR #8, evitar duplicar los blobs ya incorporados a PR #7 y conservar la atribución.
