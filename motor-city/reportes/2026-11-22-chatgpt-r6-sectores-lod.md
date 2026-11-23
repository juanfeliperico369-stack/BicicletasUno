# ChatGPT — Motor City 4.9 · R6: mallas por sector y tres niveles LOD

**22 de noviembre de 2026 · ChatGPT (OpenAI) · rama `ia/chatgpt/r6-sectores-lod-20261122`.**

## Lo implementado

- Herramienta autónoma **`herramientas/precocinar-sectores.mjs`** escrita en Node nativo y sin dependencias adicionales.
- Abre el contenedor MC4 y valida encabezados, longitudes y bytes descomprimidos antes de leer las capas.
- Lee los edificios del formato **EDJ** de ciudades nuevas y del **ED1** binario de Medellín, con comprobación de índices y varints.
- Usa la malla de relieve MC4 existente, muestreo bilineal y alturas aproximadas **iguales a las reglas de `Mundo.altoEdificio`**. No cambia la topografía.
- **Sectores de 1 km**, por centro de edificio, con geometrías de 3 niveles:
  - LOD 0: paredes y cubierta triangulada de huellas disponibles; conserva polígonos cóncavos mediante recorte de orejas.
  - LOD 1: prisma rectangular orientado por edificio.
  - LOD 2: agrupación de siluetas por cuadros de 40 m (solo para vista lejana).
- Exporta archivos **.bin** por sector y nivel, con triángulos de posiciones Float32, empaquetado `deflateRaw`, clasificación por tipo, sumas SHA-256 y un `manifiesto.json` rastreable. No realiza ninguna petición de red.
- Precocina las mallas **sector por sector** a partir de huellas agrupadas, para no conservar los tres niveles de triángulos completos de toda la ciudad a la vez.

## Comandos y pruebas

```bash
node --check herramientas/precocinar-sectores.mjs
node herramientas/precocinar-sectores.mjs --self-test
node herramientas/precocinar-sectores.mjs --entrada datos/guatape/mundo.mc4 --salida /tmp/r6-guatape
node herramientas/precocinar-sectores.mjs --entrada datos/medellin/mundo.mc4 --salida /tmp/r6-medellin
```

**Verificado localmente antes del commit:** sintaxis Node 22 y self-test. La prueba de referencia produjo 2 sectores, 3 LOD, **46/40/30 triángulos**, **873 bytes** comprimidos; validó también lectura de un contenedor MC4 EDJ y lectura de un **ED1 sintético con huella poligonal y varints**.

**GitHub Actions:** `.github/workflows/r6-sectores-qa.yml` ejecuta el self-test y prehornea Guatapé usando un archivo MC4 verdadero, dejando el JSON de medidas como artefacto. La ejecución debe revisarse antes de aprobar.

## Límites y decisión de arquitectura

**Esto es un prehorneador funcional de datos, no una integración completa del render 3D.** El juego por ahora sigue usando sus mallas en tiempo real. La salida NO está incluida automáticamente en el HTML; hacerlo sin medir el peso duplicaría la geometría y rompería el presupuesto móvil. No se modifica `js/45-tres.js`, `js/45-gl.js` ni el constructor: son zonas de integración compartidas con Codex/Claude.

Para completar R6 se necesita:

1. Medir peso total de Guatapé, Medellín y Nueva York, memoria pico y tiempo de primer cuadro; comprobar porcentaje de reducción de triángulos a distancias reales.
2. Decidir cómo empaquetar por niveles en el HTML único sin obligar al juego a decodificar todos los sectores al inicio.
3. Implementar un proveedor opcional de sectores en `MC.VistaTres` con liberación de GPU/caché, LOD por distancia y fallback automático a la malla actual, especialmente en regiones modificadas por el jugador.
4. Probar edificios cóncavos reales, cubiertas y geometría a distinta cota de cada esquina; el prehorneado actual usa cota en el centro y no se presenta como reconstrucción topográfica exacta.
5. Ejecutar los comandos obligatorios del proyecto (construcción + navegador + tres + modos) antes del merge; la CI habitual debe quedar en verde.
6. Verificar uso de memoria de GPU en Android físico (responsabilidad del autor, no de este agente).

**No se alteró el MC4, los guardados, las fuentes con licencias pendientes, el HTML ni los juegos hermanos.** Los archivos generados solo se escriben en el directorio indicado por `--salida`.

**Coordinación:** R1 de Codex PR #15; R3 PR #17, R4 PR #16, R5 PR #19 y V4 de Gemini PR #18 siguen en revisión independiente. La siguiente IA debe terminar el lector de runtime, medir y mantener el relevo.

**Firma: ChatGPT (OpenAI).**


## 23-nov-2026 UTC · Datos reales y evolución de compactación (CI comprobada)

La herramienta pasó de `floats-xyz-yup` a **formato de manifiesto versión 2**, con vértices `i16q20` (paso de **5 cm**) cuando todas las coordenadas relativas del sector caben en int16, y **fallback f32** cuando se saldrían del rango. Los offsets, tamaños, cantidad de triángulos y la codificación real están en cada grupo del manifiesto; las sumas SHA-256 comprueban los bloques. La cuantización afecta a las mallas precocinadas; **el MC4 y la física conservan su precisión previa**.

Se añadió `--niveles 0,1,2` o `--niveles 2` para no generar datos no solicitados, y `--exportar-huellas /tmp/huellas.geojson` para preparar un GeoJSON de polígonos **ya presentes en el MC4**, con comuna y pisos **estimados** (no confundir con catastro oficial). Esta exportación solo se ejecuta por elección explícita, nunca al construir el juego.

**Evidencia directa en [GitHub Actions run 45099935194](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/45099935194), exitosa:**

| Mundo/operación | Sectores de 1 km | Triángulos LOD 0 / 1 / 2 | Bytes comprimidos | Duración de generación | RSS del proceso |
|---|---:|---:|---:|---:|---:|
| Guatapé, 3 niveles | 21 | 29.793 / 26.610 / 12.680 | 440.925 | ~0,1 s | ~81 MB |
| Medellín, 3 niveles | 2.086 | 6.853.547 / 6.394.570 / 2.339.000 | 101.492.868 | 13,17 s | 295 MB |
| Medellín, **solo LOD 2** | 2.086 | 0 / 0 / 2.339.000 | **10.646.954** | **2,29 s** | 281 MB |

Desglose de bytes de Medellín con 3 niveles: LOD 0 **46.943.067**; LOD 1 **43.902.847**; LOD 2 **10.646.954**. Elegir solo LOD 2 representa un **ahorro medido del 89,5 %** frente al total comprimido; la cuantización de todos los niveles redujo además el tamaño inicial de 120.018.749 a 101.492.868 bytes (15,4 %). No se ha demostrado todavía una mejora de FPS, porque estos datos no han reemplazado las mallas del render.

**Limitación de calidad y rendimiento:** incluso LOD 2 contiene **2,339 millones de triángulos** en todo Medellín. El candidato debe **cargarse por sectores visibles**, no entero al abrir el juego. El tamaño reportado corresponde a los **bloques binarios** sin contar manifiesto, envoltorio base64, HTML ni geometría existente; los modelos de CPU y memoria reflejan el ejecutor Linux de GitHub, **no teléfonos**. La herramienta no se ha conectado todavía a VistaTres y por eso no existe captura de antes/después in-game.

**Validación:** `node --check`, `node herramientas/precocinar-sectores.mjs --self-test`, ejecución real de Guatapé y Medellín, comprobación de hashes y proporciones, y comparación `--niveles 2` completadas en CI dedicada. La prueba general `Motor City · compilación y calidad` se verifica por separado, y en ramas derivadas de main puede fallar una aserción obsoleta de **16 sectores residentes** en `pruebas/paquete-capas-browser.mjs`; Codex ya documentó y corrigió esa prueba en PR #15. No silenciar ni desactivar ningún test.

**Decisión técnica:** proponer **LOD 2 por demanda** como primer camino a evaluar en navegador, conservando LOD 0/1 procedurales, con fallback a VistaGL y sin cambiar los guardados. Las mallas binarizadas no deben añadirse al HTML hasta que un presupuesto real de megabytes, memoria y primeros cuadros haya sido comprobado.

## Segundo ajuste verificado · LOD lejano de 80 m y extracción de polígonos

En el prehorneador añadí la opción --celda-lod2 80 (válida entre 20 y 200 m; la opción por defecto conserva 40 m) y un validador separado herramientas/validar-sectores.mjs. El validador comprueba el SHA256 de cada bloque, las sumas de triángulos, offsets, codificaciones i16/f32, escala métrica y que ninguna coordenada tenga NaN o supere los límites razonables del sector. Se ejecuta sobre los bloques reales en la CI específica.

GitHub Actions run 45100331203 (success), con Medellín real y solamente LOD 2:

| Parámetro | Celdas 40 m | Celdas 80 m |
|---|---:|---:|
| Sectores | 2.086 | 2.086 |
| Triángulos LOD 2 | 2.339.000 | 1.159.190 |
| Bytes comprimidos | 10.646.954 | 5.302.620 |
| Tiempo prehorneado | ~2,76 s | ~2,04 s |
| RSS del prehorneador | ~283 MB | ~279 MB |

Reducción medida: 50,2 % del tamaño de solo LOD 2 de 40 m, y 94,8 % respecto al paquete con los tres niveles 40 m (101.492.868 bytes). 80 m es una propuesta para **distancias mayores**, no sustituto obligado del LOD de proximidad: puede mezclar edificios distintos y empeorar el perfil de la ciudad; faltan capturas del render y evaluación de fidelidad.

En el mismo run, la exportación GeoJSON de huellas MC4 de Guatapé generó 2.661 polígonos con CRS MC4-LOCAL-METROS, cada uno marcado con pisos_estimados. No agrega alturas oficiales ni datos nuevos al juego.

Comandos de validación nuevos:

    node herramientas/precocinar-sectores.mjs --entrada datos/medellin/mundo.mc4 --salida /tmp/r6-lod2-80 --niveles 2 --celda-lod2 80
    node herramientas/validar-sectores.mjs --directorio /tmp/r6-lod2-80
    node herramientas/precocinar-sectores.mjs --entrada datos/guatape/mundo.mc4 --exportar-huellas /tmp/r6-guatape.json

La ejecución específica nueva que incluye el validador es 45100415846. Verificar su resultado final y cualquier fallo; no afirmar que está en verde antes de que termine.
