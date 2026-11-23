# ChatGPT · R5 — Relieve de Medellín: fuentes, licencia y decisión antes de integrar

**Motor City 4.9 «Realismo» · 22-nov-2026 · ChatGPT (OpenAI)**

**Estado:** INFORME DE INVESTIGACIÓN ÚNICAMENTE. **No se ha descargado ni integrado ningún relieve nuevo, ni se ha alterado el MC4 o el motor.** El contrato de `docs/PEDIDOS-CHATGPT-4.9.md` asigna R5 como informe y exige decisión expresa del autor antes de aplicar una fuente.

## 1. Hallazgo principal: MDT de Medellín a 1 metro (2024)

Encontré un recurso que **no figuraba identificado con este grado de precisión en el plan de R5**:

**«Modelo Digital de Terreno. Departamento de Antioquia. Municipio de Medellín. Malla 1 m. Año 2024» (MDT1_05001_20241102).**

- **Catálogo oficial:** https://metadatos.icde.gov.co/geonetwork/srv/api/records/MDT1_Metadato_05001_20241102
- Origen indicado: **Alcaldía de Medellín**; proveedor/custodio/distribuidor: **Instituto Geográfico Agustín Codazzi (IGAC)**.
- Malla **1 m**, relieve tipo **MDT/terreno** (no debe confundirse con un DSM que lleva copas y cubiertas).
- Obtenido de LiDAR el **2 de noviembre de 2024**, sensor **RIEGL VQ-1560II-S**. Fecha publicada del metadato/producto: **21 de septiembre de 2026**; sello de metadatos: **18 de noviembre de 2026**.
- Área declarada **37.639,66 ha**, referencia espacial **EPSG:9377** (MAGNA-SIRGAS Origen Nacional), matriz **23.747 filas × 27.818 columnas**.
- Distribución identificada como **TIFF**, 32 bits por valor, rango de valores declarado ~**1.149,08 a 3.141,36 m**.
- El catálogo dice **«Completed»**, señala **«Downloadable Data»**, y documenta una evaluación de calidad del IGAC con concepto aprobado. **Esto no constituye una descarga probada**, ni confirma que la cobertura efectiva coincida con cada casilla del mapa del videojuego.
- El portal municipal de GeoMedellín, en un aviso público, dice que los productos cartográficos de 2024 continúan en proceso de revisión para incorporarlos como cartografía oficial. **Se debe aclarar el estado exacto del producto y la modalidad de acceso** antes de usarlo; no equiparar automáticamente la evaluación de calidad del registro nacional con la publicación municipal definitiva.

### Licencia del MDT 2024

El propio catálogo nacional indica explícitamente **Creative Commons Atribución–CompartirIgual 4.0 Internacional (CC BY-SA 4.0)** y menciona que los derivados deben distribuirse bajo las mismas condiciones. Texto de licencia: https://creativecommons.org/licenses/by-sa/4.0/.

**Conclusión orientativa, no asesoría legal:** CC BY-SA permite usos comerciales si se cumplen atribución, enlace a licencia, identificación de cambios y obligaciones CompartirIgual sobre el material adaptado. Incorporar una malla transformada en el mundo descargable/redistribuible del videojuego puede crear obligaciones sobre la porción derivada. No asumir que el código completo queda sujeto a la misma licencia, **ni que no queda sujeto**: validar el alcance de la adaptación y de la base de datos con el licenciante o asesoría jurídica antes de incluir los bytes en un juego comercial.

**Decisión de autor solicitada:** ¿se permite utilizar un MDT CC BY-SA con su atribución y obligaciones CompartirIgual para los datos geográficos modificados, tras verificar acceso y términos concretos? **Hasta esa decisión, R5 queda bloqueado para cambios al juego.**

## 2. Comparativa de candidatos

| Candidato | Resolución nominal | Terreno o superficie | Licencia/observación | Decisión recomendada |
|---|---:|---|---|---|
| **Medellín MDT LiDAR 2024 (IGAC/Alcaldía)** | **1 m** | Terreno (MDT) | Catálogo: **CC BY-SA 4.0**; verificar descarga, cobertura y atribución | **Priorizar evaluación; no integrar aún** |
| Medellín DTM 2022 y otras capas históricas del catálogo municipal | variable, algunos a 1 m | Terreno, según ficha | Licencia específica/descarga y fecha por verificar | Alternativa si no se puede acceder al MDT 2024 |
| SRTM/Terrarium que usa Motor City | mapa base ~30 m, raster del juego interpolado | Elevación compuesta de diferentes fuentes | Ya integrado con su atribución actual | Mantener como **respaldo sin cambios** |
| Copernicus GLO-30 | ~30 m | **DSM**; árboles y edificios pueden sesgar altura de suelo | Comprobar condiciones del producto y procedencia de cada mosaico | No presentarlo como MDT de 1 m |
| ALOS AW3D30 | ~30 m | **DSM**, no superficie limpia | Consultar licencia y permisos de versión concreta | No usar sin validación |
| **FABDEM V1.2** | ~30 m | Terreno corregido de edificios y bosques | Universidad de Bristol: **CC BY-NC-SA 4.0**; uso comercial requiere permiso separado | **Descartar para distribución comercial sin autorización explícita** |

Fuentes:
- ICDE/IGAC, MDT 2024: https://metadatos.icde.gov.co/geonetwork/srv/api/records/MDT1_Metadato_05001_20241102
- Alcaldía/GeoMedellín: https://www.medellin.gov.co/geomedellin
- Catálogo DTM municipal 2022: https://www.medellin.gov.co/giscatalogacion/srv/resources/datasets/e42441c0-114e-43f3-86a0-13f709bd1c22
- Universidad de Bristol, FABDEM V1.2: https://research-information.bris.ac.uk/en/datasets/fabdem-v1-2/
- Licencia CC BY-SA: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia FABDEM CC BY-NC-SA: https://creativecommons.org/licenses/by-nc-sa/4.0/

## 3. Qué problema técnico resuelve y qué no resuelve

**Sí podría resolver (si el MDT es accesible y compatible):** pendientes y cortes más realistas, quebradas y laderas con más detalle; terreno base más exacto para edificios y caminos. El raster debe entrar con cota correcta; no crear escalones de 1 m como muros sin filtrado.

**No resuelve por sí solo:** altura de cada edificio (pedido R3), forma real de su techo (R4), fachadas (R1), muros de contención y terrazas construidas. Esos son elementos distintos y deben derivarse de catastro, OSM y reglas del motor.

## 4. Contrato de integración futura, solo después de autorización

1. **Legal y acceso:** obtener respuesta inequívoca sobre derecho a descargar/reutilizar/redistribuir como dataset transformado; documentar versión, fecha, título, creador, licencia, URL y cambios.
2. **Datos:** probar la lectura del GeoTIFF sin subir secretos, verificar nodata, resolución, filas/columnas, rangos, zonas cubiertas, sistema de referencia horizontal **EPSG:9377** y referencia vertical; **no confundir altura ortométrica y elipsoidal**.
3. **Proyección:** convertir en proceso de construcción al origen **MC4** definido por `ciudades/medellin.json` (`lon0`, `latN`, `kx`, `ky`), conservando orientación x este / y sur; medir discrepancias con puntos de control y vías.
4. **Tamaño:** mantener archivos LiDAR/GeoTIFF sin incrustar en HTML; generar solamente el raster simplificado de relieve compatible con `capa('relieve','i16',...)` del MC4 ya existente. Evitar reconstruir estructuras desconocidas o importar librerías al juego offline.
5. **Calidad:** evaluar por ladera/valle y dentro/fuera de cobertura, continuidad en bordes de regiones, rendimiento 412×860, memoria, correctos cruces de vías/viaductos y fallbacks al raster anterior.
6. **Conservación:** no cambiar guardados, nodos de ruta ni reglas de física hasta pruebas; conservar el MC4 anterior como alternativa verificable.
7. **Pruebas mínimas:** `node herramientas/construir.mjs`; `node pruebas/prueba.mjs --navegador`; `node pruebas/tres.mjs`; `node pruebas/modos.mjs` y nueva comparación R5 por puntos geográficos con errores numéricos claros.

## 5. Mitigación sin licencias nuevas, si el autor lo prefiere

Mientras se decide el uso del MDT, puede estudiarse **arte procedural de cortes, terrazas y muros de contención** solo a partir de geometría que ya exista legalmente en Motor City, sin aparentar que los muros son levantamientos reales. Priorizar:
- bordes de carreteras que intersectan laderas;
- prismas de contención donde el corte no interfiere con vías, puertas ni edificios;
- LOD/ocultación y límites por sector;
- lógica de respaldo y suavizado cuando la topografía antigua carezca de detalle.

Es una **propuesta**, no una implementación en este PR. Quedan prohibidos el calco de imágenes y el uso automático de una nueva fuente sin licencia comprobada.

## 6. Verificación, limitaciones y relevo

- **Investigado:** fuentes primarias de catálogo geográfico colombiano, texto de licencia CC, portal municipal y Universidad de Bristol.
- **Probado:** comparación de fichas/metadatos de fuentes; **NO** ejecución de rasters, pruebas en navegador, ni descarga del TIFF.
- **Cambios en juego:** ninguno. Este PR de R5 contiene solo documentación y coordinación; no modifica motor ni MC4.
- **Falta:** autorización del autor sobre la licencia; confirmar enlace de descarga, cobertura efectiva y términos; entonces planificar implementación en rama **separada** con pruebas del motor.
- **Coordinación:** Codex R1 PR #15, ChatGPT R4 PR #16, ChatGPT R3 PR #17; no tocar archivos de Gemini Antigravity V4.

**Firma:** ChatGPT (OpenAI) · Motor City R5 · 22 de noviembre de 2026.