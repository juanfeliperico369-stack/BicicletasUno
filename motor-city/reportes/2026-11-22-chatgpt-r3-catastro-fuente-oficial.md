# ChatGPT — Motor City R3 · Nueva fuente oficial potencial para pisos en Medellín

**22-nov-2026 · continuación de Codex 4.9 · Solo prevalidación, sin cambio MC4.**

## Hallazgo verificado en metadatos públicos

La capa **Construccion (8)** del servicio oficial **VC_Catastro_VCT** de la Alcaldía de Medellín declara:

- Polígonos de construcción (`esriGeometryPolygon`), no únicamente lotes.
- Campo **`numero_pisos`** (`esriFieldTypeDouble`).
- `numero_sotanos`, `numero_mezanines`, `tipo_construccion`, `area_construida`.
- `objectid`, `cbml`, `id_construccion` y `fecha_sincronizacion`.
- Proyección de origen **EPSG:9377**.
- Compatible con recuentos estadísticos, consultas paginadas y respuesta JSON/GeoJSON/PBF. `MaxRecordCount` 10000.
- Extensión espacial publicada aproximada (en 9377): X 4.699.464,76–4.726.442,21; Y 2.240.009,88–2.263.014,20. **Una extensión amplia no prueba cobertura efectiva en todas las comunas.**

**Servicio y campos:** https://www.medellin.gov.co/servidormapas/rest/services/vivienda_ciudad_terri/VC_Catastro_VCT/MapServer/8

**Metadatos JSON:** https://www.medellin.gov.co/servidormapas/rest/services/vivienda_ciudad_terri/VC_Catastro_VCT/MapServer/8?f=pjson

Capa alternativa a cotejar, posiblemente redundante: https://www.medellin.gov.co/servidormapas/rest/services/vivienda_ciudad_terri/VC_Vivienda/MapServer/1

### Diferencia respecto al trabajo anterior de Codex

Su informe `reportes/2026-11-22-codex-integracion-arte-chatgpt-r1.md` identifica la capa parcial `3DConstruccciones` (42.365 objetos en Popular, El Poblado y Robledo) y señala que `Lotes_Febrero_2026` no tiene pisos. **La capa Construccion (8) es distinta:** sus metadatos declaran pisos, tipo de construcción y geometría sobre una extensión más amplia, pero todavía no hay recuento válido comprobado. Por ello **no se declara cobertura nueva** sin ejecutar la auditoría.

## Herramienta creada y probada

`geo/auditar_pisos_catastro.py` envía, **solo bajo la opción explícita `--consultar`**, exactamente cuatro peticiones agregadas `returnCountOnly=true` al servicio:

- Total de objetos.
- Objetos con `numero_pisos` mayor a 0 y menor o igual a 120.
- Objetos de categorías plausibles de construcción (`N`, `E`, `BQ`, `TO`, `CA`).
- Intersección de esas categorías con pisos válidos.

No descarga nombres, identificadores prediales, posiciones ni geometrías. No escribe MC4, no altera guardados ni modifica `geo/fetch.py`.

```bash
python3 geo/auditar_pisos_catastro.py --self-test
python3 geo/auditar_pisos_catastro.py --consultar --salida reportes/r3-cobertura-catastro.json
```

**Pruebas realizadas:** autoprueba sintética con 7 verificaciones, compilación sintáctica con Python 3; ambas aprobadas localmente. **No realizada:** consulta REST real desde este entorno (no se permite certificar cifras). No se han ejecutado las cuatro baterías del videojuego por falta de clon completo local; verificar CI antes de fusionar.

## Validación obligatoria antes de cualquier cambio del juego

1. Confirmar disponibilidad y permiso de **reutilización/redistribución comercial** de la capa del catastro. Los metadatos indican Copyright de la Subsecretaría de Catastro; una ruta REST pública no es automáticamente una licencia abierta.
2. Medir recuentos reales y, más importante, cobertura por comuna frente a las huellas del MC4.
3. Filtrar piscinas, tanques, patios, construcciones transitorias y valores 0; decidir cómo tratar sótanos y mezzanines.
4. Reproyectar correctamente de EPSG:9377 a coordenadas del motor, con evaluación de errores y pruebas de geometría.
5. Resolver duplicados entre construcciones, lotes y huellas ED1, con asignación uno-a-uno o reglas de unión de geometrías bien documentadas; no asignar pisos de un vecino por proximidad.
6. Comparar con los tres sectores oficiales existentes y la información de Overture antes de sobrescribir estimaciones.
7. Documentar porcentaje oficial por comuna y fallback para zonas sin datos; conservar compatibilidad de guardados y formato MC4.

**Resultado actual:** fuente potencial localizada + herramienta de recuento, no integración de alturas. Firma **ChatGPT (OpenAI)**.

**Relevo:** seguir en `docs/PEDIDOS-CHATGPT-4.9.md` con R3/R4, mantener independiente R1 de Codex (PR #15), V4 de Gemini y las tareas del autor sobre licencia de R5.
