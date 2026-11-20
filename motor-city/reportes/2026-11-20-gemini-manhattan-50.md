# G-H18 · Manhattan desde datos oficiales de NYC

**Fuente:** [CommonPlace de City of New York](https://data.cityofnewyork.us/City-Government/CommonPlace/t95h-5fsr), con [esquema GIS oficial](https://github.com/CityOfNewYork/nyc-geo-metadata/blob/main/Metadata/Metadata_PointsOfInterest.md).

El programa `herramientas/lugares-nyc.mjs` consulta una fuente municipal, verifica `boroughcode=1`, coordenadas dentro de Manhattan y categorías de POI, y selecciona **exactamente 50 registros** o falla. Conserva nombre, `placeid`, latitud, longitud, tipo y fuente. Los tipos de garaje o mirador se infieren **solo cuando el nombre registrado lo indica**; no se presume acceso público. La prueba `--probar` no usa red.

El flujo `.github/workflows/nueva-york-lugares.yml` genera `contenido/nueva-york-lugares.json` y lo publica en **la rama de trabajo**, nunca en `main`, solo si la API y las comprobaciones pasan. El juego final carga el archivo local sin consultar la red.

**Pendiente de verificación:** comprobar la ejecución en GitHub Actions y la existencia del archivo generado antes de declarar G-H18 completado; después contrastar estos POI con la malla MC4 y las rutas transitables.

## Segunda pasada: calidad de destinos (G-H18)
La primera ejecución del importador obtuvo exactamente 50 puntos oficiales, pero el control humano detectó **9 registros con señales de baja calidad como destino de juego**, entre ellos el depósito «AMSTERDAM DEPOT», garajes de mantenimiento y múltiples rampas del puente de Brooklyn. La cardinalidad del JSON no garantiza que el lugar sea interesante ni visitable.

Se añadieron filtros de nombres incompatibles con destinos públicos (mantenimiento, instalaciones técnicas, rampas), criterios de museo/parque/monumento y claves de unicidad de puente. La selección reparte los tipos por bandas geográficas para no concentrarse solo en Central Park o Battery Park. **Aun así, la etiqueta de categoría y la accesibilidad física requieren una verificación de campo o fuente adicional.**

La versión nueva de `herramientas/lugares-nyc.mjs` se ejecuta desde GitHub Actions para regenerar el JSON; este informe no declara el nuevo resultado aprobado hasta observar su ejecución y revisar el fichero.

## Tercera pasada: restricción de acceso (G-H18)
La segunda generación cumplió **50/50** registros oficiales distribuidos territorialmente y sin duplicados evidentes de rampas. Sin embargo, conservaba **tres garajes del Departamento de Sanidad (DSNY)**. Su localización municipal no autoriza convertirlos en misiones ni garajes públicos. Se filtran dependencias de DSNY/DPR/FDNY/NYPD y solo se admiten nombres explícitos de estacionamientos comerciales o públicos, sin afirmar acceso real; si no hay suficientes, el catálogo completa 50 con otras categorías verificadas. Cada registro incorpora ahora `acceso: "por_verificar"` para no confundir geolocalización con permiso de entrada.

Se descartan también las estatuas y edificios de servicio clasificados dentro de parques; se preserva la fuente oficial. Verificar el nuevo JSON publicado antes de declarar el trabajo concluido.
