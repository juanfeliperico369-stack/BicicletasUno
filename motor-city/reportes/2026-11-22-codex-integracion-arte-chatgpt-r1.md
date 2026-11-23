# Codex — Integración del arte ChatGPT R1

Fecha local: 22 de noviembre de 2026. Rama: ia/chatgpt/r1-fachadas-medellin. Base: f1510e1.

## Integración

Los siete ZIP recibidos son idénticos (SHA-256 eebd62164bbf537b882b3285d451a3c8970a70032a01c9e1de06e91e19f5c4ab). Se incorporaron las seis familias y los doce WebP originales de 2048 × 2048, junto con el manifiesto y su atribución a ChatGPT. Las 12 sumas SHA-256 coinciden con el manifiesto.

El constructor incluye los datos en motor.js y en los HTML autocontenidos. VistaTres añade superficies de fachada agrupadas por región y familia, conservando cuerpo y cubierta. Los vanos procedurales se omiten cuando el par de texturas está listo para evitar duplicarlos. Si falta el par se mantiene la geometría previa. Se selecciona el material según clase, altura y zona, solo en el mundo Medellín. La planta baja comercial usa la franja inferior de la persiana y los pisos superiores usan ladrillo. Las coordenadas repiten el atlas horizontalmente por módulos de 2,7 m y verticalmente por pisos de 3 m según los conteos del manifiesto. La intensidad del mapa de emisión varía con la noche; la emisión no se pinta sobre el albedo.

Para limitar memoria GPU, los originales de 2048 se remuestrean en ejecución a 1024 por capa con el mismo procedimiento para ambos mapas. Los archivos de origen conservan 2048. Se verificaron imágenes y tamaños de salida, pero no se ha medido consumo real en un celular físico. Los seis pares pueden ocupar hasta unos 64 MiB de texturas GPU con mipmaps, sin contar los lienzos y la geometría.

## Revisión visual y técnica

- Las seis familias se inspeccionaron en las láminas originales y en WebGL. La emisión corresponde a las ventanas de las imágenes de referencia, aunque la revisión humana se hizo sobre capturas representativas, no sobre cada ventana y cada edificio del mapa.
- Los bordes diurnos WebP no son matemáticamente idénticos: la diferencia media entre bordes opuestos va aproximadamente de 1,80 a 2,62 niveles por canal. Los bordes de emisión son negros. La repetición no presenta una banda evidente en las láminas revisadas, pero debe comprobarse en más escalas.
- La primera integración superponía balcones y ventanas procedurales. Se corrigió conservando cubierta y cuerpo y suprimiendo esos detalles solo con el atlas disponible.
- Las capturas en reportes/r1-dia-antes.png, r1-dia.png, r1-noche-antes.png y r1-noche.png muestran la misma zona de Medellín con el respaldo y con R1. Se obtuvieron con Chromium y WebGL por software.
- La escala se calcula a partir de los conteos del manifiesto. Las imágenes son aproximaciones generadas y reescaladas desde 1254 px, no un levantamiento exacto de las fachadas reales. La variedad sigue siendo limitada y algunas texturas pueden repetirse de forma visible.

## Pruebas

- node herramientas/construir.mjs: aprobado. HTML de Turno Cero 33.440.062 bytes, Mandados 13.039.808 bytes y motor.js 8.485.382 bytes.
- node pruebas/prueba.mjs --navegador: 158 pruebas aprobadas en el reintento aislado. Una primera ejecución con tres navegadores simultáneos falló el tiempo del paso de Run; se registra como fallo inicial y se repitió sin esa carga.
- node pruebas/tres.mjs: aprobado, incluye día, noche, sombras, cambio de render y cero solicitudes externas a los recursos.
- node pruebas/modos.mjs: aprobado, con cinco modos, acelerador y mapa. El bot modifica posiciones durante algunas pruebas.
- node pruebas/r1-fachadas.mjs: aprobados los doce hashes, selección, UV, carga local, emisión y respaldo cuando una imagen no está disponible.
- Las pruebas de navegador usaron Chromium en WebGL por software y un servidor HTTP local, mediante MC_PRUEBAS_URL. Las capturas no sustituyen la medición en GPU de teléfono.

## R4 y R3 · primera investigación

R4: geo/territorio.py consulta Overture y conserva clase, altura, pisos, nombre y geometría, pero su consulta actual no trae roof:shape, roof:levels, building:colour ni roof:colour. El formato binario ED1 de Medellín tampoco expone esos atributos. Es necesario obtener una fuente OSM con identificadores y geometrías, cruzarla sin atribuir etiquetas a edificios incorrectos y mantener compatibles los MC4 anteriores. Una consulta pequeña a overpass-api.de recibió HTTP 406, kumi agotó el plazo y private.coffee respondió sin resultados para el área elegida. Esto no determina la cobertura de OSM en toda la ciudad. Una consulta más amplia y cuatro consultas por fragmentos también agotaron el plazo. La descarga probada del extracto de Colombia desde Geofabrik siguió redirecciones hasta un HTTP 404. No se atribuyeron etiquetas de prueba a huellas sin correspondencia comprobada. R4 no está implementado.

R3: el servicio oficial Lotes_Febrero_2026 tiene geometría de polígonos y campos de identificación y área, pero no tiene un campo de pisos. La capa oficial 3DConstruccciones sí proporciona numero_pis y altura. Su consulta agregada devuelve 42.365 objetos, exclusivamente en Popular (22.896), El Poblado (13.659) y Robledo (5.810). Por tanto no aporta por sí sola los pisos del resto de comunas. Hay que localizar una fuente oficial más amplia y medir cobertura antes de sustituir el MC4. La inspección del catálogo encontró además capas de construcciones parciales con campo n_pisos: Construcciones317 (302 objetos), Construcciones_Sinencuesta (22), Z2_MI_21_Construcciones_240326 (226), Z2_MI_22_Construcciones_100326 (55), Z2_MI_22_Construcciones_300326 (61) y Z3_CN3_5_CONSTRUCCIONESV (190). Sus alcances, duplicados, vigencia y licencias todavía requieren cotejo antes de cruzarlos con las huellas. En una muestra de Z2_MI_22_Construcciones_100326, numero_pis indica 2 y n_pisos indica 3 para la misma construcción. Hay que resolver el significado y precedencia de los campos con la fuente antes de usar los datos. R3 no está implementado.

Fuentes consultadas:
- https://services1.arcgis.com/FZVaYraI7sEGQ6rF/arcgis/rest/services/Lotes_Febrero_2026/FeatureServer/0
- https://services1.arcgis.com/FZVaYraI7sEGQ6rF/arcgis/rest/services/3DConstruccciones/FeatureServer/0
- https://overpass-api.de/

## Para la siguiente IA

Leer CONTEXTO-RELEVO.md, docs/PEDIDOS-CHATGPT-4.9.md y este informe. Continuar R4 y R3 con datos verificables y pruebas de compatibilidad. Antes de cerrar, escribir su propio documento de contexto con plan completo, trabajo, pruebas y pendientes, actualizar el relevo y pedir lo mismo a quien siga. La rama R1 es para revisión y no debe fusionarse sin autorización.

Seguimiento de CI. La ejecución 45093739302 aprobó el núcleo y las pruebas de la vista realista. En la prueba posterior de los tres mundos, la expectativa de 16 sectores correspondía a la caché anterior a 4.8. La prueba ahora comprueba el máximo configurado y un presupuesto independiente de 4.000.000 bytes por capa. Pasó en Chromium a 412 × 860 para Guatapé, Medellín y Nueva York.
