# Motor City · MC4 offline por capas (C-M34, versión experimental)

**Rama de trabajo:** `ia/chatgpt/cm34-cache-20261120` · **base:** 4.0.3 · **estado:** candidato para revisión; no fusionar sin CI de Node + Chromium.

## 1. Qué resuelve

Antes, `Mundo.cargar(base64)` decodificaba una copia binaria completa de cada ciudad, incluso si la aplicación solo consultaba algunas capas. El juego ya cargaba ciudades de forma perezosa y `MC.Planeta` retenía un máximo de dos mundos, pero la ciudad activa mantenía el MC4 completo **además** de las capas descomprimidas.

Ahora hay un **segundo mecanismo optativo**:

- La construcción descompone un MC4 existente en su cabecera y sus entradas **ya comprimidas** (deflate raw); **no cambia un solo byte** de cada entrada.
- El HTML final incluye un `<script type="text/plain" id="mc4meta-CIUDAD">` con metadatos JSON y un `<script type="text/plain" id="mc4-CIUDAD-CAPA">` por capa.
- El navegador conserva esos bloques como texto inerte. `MC.Mundo.desdePaquete(meta, obtener, cfg)` pide el texto de una capa cuando se usa, la decodifica, la descomprime y conserva **solo la capa descomprimida** en su caché habitual. No necesita un `Uint8Array` de toda la ciudad.
- `MC.Mundo.cargarPaquete(...)` precarga las mismas ocho capas iniciales que `Mundo.cargar` para no alterar el comportamiento de la simulación.

Este cambio **no implementa streaming geográfico de 1 km**. Las capas como `suelo` todavía se descomprimen completas y el HTML todavía contiene los tres mapas. No se garantiza una mejora porcentual hasta medir en móvil.

## 2. API pública del motor

```js
// Nuevo, sin romper el lector clásico:
const mundo = await MC.Mundo.cargarPaquete(
  metadata, // el mismo objeto JSON que va en la cabecera MC4
  nombre => document.getElementById('mc4-' + id + '-' + nombre)?.textContent,
  configCiudad
);

// Sin precarga:
const m = MC.Mundo.desdePaquete(metadata, obtenerCapa, configCiudad);
m.capa('info'); // pide y descomprime solo info
m.capa('info'); // reutiliza el resultado en caché

// Continúa válido:
const anterior = await MC.Mundo.cargar(base64MC4, configCiudad);
```

El proveedor `obtenerCapa(nombre)` es **síncrono** y devuelve texto Base64 o `Uint8Array`; debe retornar bytes comprimidos cuyo tamaño coincida con `meta.capas[nombre].n`. El sistema valida la longitud y falla con un error explícito si falta una capa o está truncada.

## 3. Uso en construcción

Un juego con `juego.json` así activa el empaquetado:

```json
{
  "id": "juego",
  "mundos": ["nueva_york", "medellin", "guatape"],
  "mundos_capas": true
}
```

`herramientas/construir.mjs` comprueba la cabecera, límites de cada bloque y nombres seguros antes de emitir HTML. Los metadatos se insertan escapando los caracteres `<` en JSON para impedir el cierre accidental de una etiqueta `script`.

Si `mundos_capas` está ausente o es falso, el constructor emite exactamente el esquema anterior con un único bloque MC4 Base64 por ciudad.

La adaptación de `juegos/getaway/20-juego.js` detecta el nuevo esquema, pero también acepta el viejo. Solo afecta la **carga**, no cambia misiones, historia, arte o mecánicas del juego.

## 4. Qué hay que probar

```bash
node motor.mjs construir
node pruebas/sectores-cm34.mjs
node pruebas/paquete-capas-cm34.mjs
node motor.mjs prueba
node pruebas/getaway-contenido.mjs
node pruebas/paquete-capas-browser.mjs
node motor.mjs prueba --navegador
```

El test Node revisa los tres MC4 contra cada capa comprimida emitida, usando SHA-256. También compara tipos y valores de capas cargadas mediante el lector clásico y el nuevo. El test Chromium abre el HTML como archivo local, entra en Calle libre (Guatapé), valida el estado del jugador y carga Medellín y Manhattan sin solicitudes de red.

**Regla de reporte:** anotar por separado el resultado de CI, la memoria JS Heap, memoria total del navegador, memoria GPU y p95 real (móvil). Que el código admita capas diferidas no demuestra por sí solo menor memoria ni más FPS.

## 5. Riesgos conocidos y siguiente hito

1. Las ocho capas mínimas se siguen precargando enteras; `suelo` y `nivel` son muy grandes.
2. La serialización Base64 todavía ocupa texto del DOM; el tamaño comprimido del HTML sigue siendo muy parecido.
3. La caché LRU ED1 mantiene hasta 36 regiones Manhattan y no descarga el archivo binario base.
4. `MC.Planeta` usa caché de dos mundos; confirmar que su eliminación realmente libera las referencias pesadas en DevTools.
5. Para verdadero streaming **espacial**, construir un índice geográfico por chunk con coordenadas, hashes y bytes comprimidos; soportar precarga por velocidad/rumbo y preservar continuidad de colisiones al cruzar sectores. Esto probablemente requiera una extensión de formato/versionado y tests de migración.

## 6. Fuentes de técnica (no copiadas al motor)

- Compresión estándar del navegador: [MDN DecompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/DecompressionStream) (deflate-raw, respaldo inflador JS existente).
- [Godot HLOD / rangos de visibilidad](https://docs.godotengine.org/en/stable/tutorials/3d/visibility_ranges.html) para combinar cambios de calidad lejana con streaming futuro.
- [web.dev · carga de recursos](https://web.dev/learn/performance/optimize-resource-loading/) para evitar trabajo innecesario durante arranque.

**Regla de procedencia:** técnicas y APIs públicas, implementación JavaScript original, sin reproducir código ni recursos de videojuegos comerciales.
