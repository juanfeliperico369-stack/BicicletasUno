# Motor City 4.1 · Memoria y concurrencia de `MC.Planeta` (C-M34)

**Entrega candidata de ChatGPT** · rama `ia/chatgpt/planeta-cache-410-20261121` · base: `main` 4.1.0 del 21-nov-2026 (UTC) · **sin fusión**.

## Problema y causa

Antes de esta entrega, `Planeta.mundo(id)` comprobaba si el mundo ya estaba en `cache` y, si no estaba, invocaba un cargador asíncrono. El mapa se incorporaba a `cache` **solo después de terminar**. Por tanto, dos solicitudes de la misma ciudad antes de finalizar la primera duplicaban carga, inflado, inicialización y picos de memoria; un fallo de red o bytes podía quedar sin una política de reintento coordinada. Además, las lecturas a un mundo ya cargado **no actualizaban** el orden de una caché que se presentaba como LRU. Las precargas podían expulsar la ciudad que el jugador seguía utilizando; `Planeta.cruce` y `Planeta.puertas` consultan `cache` para calcular transiciones.

El problema es del **motor reutilizable** (no de la historia de Turno Cero) y afecta a cualquier juego multicidad.

## Cambios implementados

| Archivo | Cambio |
| --- | --- |
| `js/13-planeta.js` | `_cargando: Map` con una sola promesa por ID: 8 solicitudes concurrentes comparten el mismo trabajo |
| `js/13-planeta.js` | LRU real: `_tocar` renueva la recencia en cada acceso y al cambiar de ciudad |
| `js/13-planeta.js` | `fijar(id)` reserva la ciudad que está en juego; `_recortar` expulsa primero las otras, con capacidad configurable |
| `js/13-planeta.js` | Limpieza en `finally` incluso si el cargador falla; una carga fallida puede reintentarse sin reiniciar |
| `js/13-planeta.js` | `diagnosticoCache()` ofrece contadores simples para el QA |
| `juegos/getaway/20-juego.js` | Una sola llamada a `planeta.fijar(id)` al terminar de cargar el destino de una transición |
| `pruebas/planeta-cache-cm34.mjs` | Siete casos Node con el módulo real; ciudades sintéticas para estabilidad |
| `pruebas/planeta-cache-browser.mjs` | Chromium 412 × 860, HTML offline, inicio en Guatapé, ocho solicitudes de Medellín, precarga de Manhattan, transición real a Medellín |
| `.github/workflows/motor-city-qa.yml` | Ambos conjuntos de pruebas forman parte de CI junto a todas las pruebas anteriores |

## API y contrato

```js
const planeta = new MC.Planeta({
  cargar: id => MC.Mundo.cargar(base64[id], ciudades[id]),
  maxMundos: 2 // presupuesto de mundos residentes; valor por defecto
});

// Todas estas solicitudes usan UNA carga compartida:
const [m1, m2] = await Promise.all([
  planeta.mundo('medellin'),
  planeta.mundo('medellin')
]);

// Cuando ya se transicionó al destino, fijarlo:
planeta.fijar('medellin');

// Diagnóstico sin leer privados internos:
console.log(planeta.diagnosticoCache());
// { residentes: ['medellin'], cargando: [], activo: 'medellin',
//   maxMundos: 2, aciertos: 0, compartidas: 1, cargas: 1,
//   expulsiones: 0, errores: 0 }
```

**Compatibilidad:** el constructor anterior sin `maxMundos` conserva exactamente el presupuesto de **dos mundos**. `cache` sigue siendo un `Map`, `mundo(id)` sigue siendo asíncrono y devuelve una instancia `Mundo` idéntica, y las ciudades generadas sincrónicamente siguen funcionando. No cambia el formato MC4, el guardado ni la red.

### Reglas específicas de presión

- Al cargar una nueva ciudad, su referencia nunca se expulsa en ese mismo paso.
- Si caben dos mundos, se conserva preferentemente el mundo `activo` y el destino solicitado.
- Una solicitud a un mundo residente lo vuelve a marcar como reciente.
- Con `maxMundos = 1` no caben simultáneamente origen y destino; al solicitar el destino, se mantiene este y se podrá fijar al completar la transición.
- Si un cargador falla, no se conserva una entrada de caché incompleta ni queda una promesa pendiente perpetua.
- `diagnosticoCache().cargas` cuenta intentos, **no** bytes descargados ni memoria física consumida.

## Validación y evidencia

```bash
node pruebas/planeta-cache-cm34.mjs
node motor.mjs construir
node motor.mjs prueba
node pruebas/planeta-cache-browser.mjs
```

Los tests Node prueban deduplicación, fracaso/reintento, LRU, fijación del mapa activo, presupuesto de un mundo, generador sincrónico y varias ciudades paralelas. La prueba Chromium usa el HTML compilado, no un prototipo aislado, y observa errores JavaScript y tráfico HTTP.

**La CI define el resultado confirmado.** No afirmar que una prueba está en verde hasta que su run termine correctamente. Una prueba en una VM con SwiftShader no equivale a GPU física, y reducir cargas redundantes no cuantifica por sí mismo el ahorro real de RAM ni FPS.

## Límites y relación con C-M34 por capas

Esta PR se basa en `main` 4.1.0 y es **independiente** de la [PR #9](https://github.com/juanfeliperico369-stack/motorcity/pull/9), que introdujo un lector alternativo MC4 offline por capas en su rama. Las dos mejoras son compatibles a nivel de API: `MC.Planeta` controla *cuántos* mundos hay, mientras `MC.Mundo.cargarPaquete` controla *cómo* se cargan las capas de un mundo. No copiar código de la PR #9 en esta rama; Claude debe planear la integración y revisar conflictos.

**Siguientes prioridades técnicas:**

1. Perfilar `usedJSHeapSize`, p95/p99 y memoria del proceso del navegador con las tres ciudades en hardware real y en VM, separando resultados.
2. Extender paquetes MC4 al **espacio**: sectores geográficos de relieve, suelo, edificios y colisiones con índice y checksums, más precarga orientada por velocidad. Sin esto, C-M34 no es streaming real de Manhattan.
3. Introducir un protocolo de cancelación/liberación solo si la prueba demuestra que la carga de un mundo abandonado sigue consumiendo recursos; no cancelar cargas necesarias para reanudación.
4. Revisar si se deberían invalidar las rutas cacheadas `_puertas` cuando se modifica físicamente un mundo (ya se invalidan al expulsar su objeto).
