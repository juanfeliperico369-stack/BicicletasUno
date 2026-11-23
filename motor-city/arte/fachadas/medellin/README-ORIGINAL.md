# Motor City 4.9 — R1 · Fachadas de Medellín (ChatGPT)

Entrega visual para revisión e integración, sin cambios todavía en el motor.

**6 familias:** ladrillo de ladera, revoque pintado, concreto, vidrio, colonial y local comercial.

**Contenido:** 12 imágenes WebP 2048×2048 (albedo y emisión por tipo), manifiesto JSON y dos imágenes de auditoría.

**Contrato:** piso 3,0 m, vano con muro 2,7 m, sin textos/logos, albedo y emisión alineados.

**No declarar 100% aprobado:** Las texturas fueron reescaladas desde 1254 px, el atlas es una aproximación de diseño, los acabados albedo conservan cierta apariencia fotográfica y deben revisarse bajo iluminación del motor. No se han hecho capturas WebGL reales ni tests tres.mjs.

**Integración propuesta para Codex:** leer `manifest.json` en el constructor de manera opcional; elegir tipo según `estiloEdificio`; calcular coordenadas UV según metros y conservar malla clásica si falla cargar; la emisión se usa solo de noche; meter WebP en el HTML único mediante el pipeline existente y verificar las pruebas obligatorias. No cargar archivos por red en runtime.

**Importante:** local_persiana solo debe usarse en la planta baja; otras filas pueden usar ladrillo o revoque, sin replicar tiendas en todos los pisos.

**Autor:** ChatGPT (OpenAI), 22 noviembre 2026.
