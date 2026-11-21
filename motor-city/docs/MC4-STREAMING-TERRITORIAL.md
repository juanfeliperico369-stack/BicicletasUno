# Motor City 4.2 · C-M34 · Raster territorial offline por sectores

**Rama propuesta:** `ia/chatgpt/cm34-spatial-420-20261121` · **PR #11** · basado en `main` 4.2.0 · **candidato, sin merge**.

## 1. Objetivo alcanzado y límites

La PR #9 ya introdujo contenedores MC4 separados por **capas**. Todavía descomprimía por completo `suelo` y `nivel`. Esta nueva entrega añade una **segunda partición espacial**: estas **dos capas raster** se empaquetan como chunks comprimidos independientes que cubren aproximadamente un kilómetro por lado. El HTML offline sigue siendo un único archivo; los archivos `datos/<ciudad>/mundo.mc4` de origen **no se modifican**.

Con `mundos_rasters:true` en `juego.json` el constructor:

1. Abre el MC4 de origen y verifica que `suelo` y `nivel` son cuadrículas de un byte por casilla (`u8` / `i8`) con las dimensiones correctas.
2. Descomprime esas dos capas solamente durante la **construcción del HTML**.
3. Extrae bloques de `ceil(1000 / meta.tile)` casillas de lado (los últimos pueden ser parciales), los comprime individualmente con DEFLATE raw y concatena su Base64.
4. Agrega a la metadata embebida el manifiesto `meta.rasters` con dimensiones, número de sectores, tipo e índices de inicio/fin de cada segmento.
5. Emite **solo un bloque HTML inerte por raster** (`mc4r-CIUDAD-suelo` y `mc4r-CIUDAD-nivel`), evitando cientos de nodos `script`.

Las capas restantes (`relieve`, `edificios`, `vias`, `municipio`, etc.) siguen usando `mc4-CIUDAD-CAPA` como antes; su contenido comprimido se conserva byte a byte.

### Qué NO significa «streaming completo»

- Las capas **ED1** de edificios, carreteras y relieve siguen completas cuando se piden. El cache ED1 de regiones descritas en `MC.Sectores1km` no descarga todavía el bloque binario ED1.
- **Todo el texto Base64 de los mundos sigue presente en el HTML** desde la apertura; no existe descarga de archivos por red ni división geográfica del tamaño del HTML.
- La descompresión de un nuevo sector raster es **síncrona**. Se necesita perfil de latencia p95/99 y, quizá, precarga futura por rumbo.
- El acceso a `Mundo.capa('suelo')` o `Mundo.capa('nivel')` construye expresamente una cuadrícula completa por compatibilidad. El motor principal usa `suelo()`, `sueloCasilla()` y `nivel()` para mantener los beneficios de carga parcial.
- **No se ha cuantificado** memoria JS Heap/CPU/GPU física, FPS ni ahorro en dispositivos iOS/Android.

## 2. API y uso

```json
{
  "id": "getaway",
  "mundos": ["nueva_york", "medellin", "guatape"],
  "mundos_capas": true,
  "mundos_rasters": true
}
```

`mundos_rasters` requiere `mundos_capas`, y es **opt-in**. Si está deshabilitado, el constructor y el lector siguen produciendo/cargando los paquetes previos.

```js
const meta = JSON.parse(document.getElementById('mc4meta-' + id).textContent);
const mundo = await MC.Mundo.cargarPaquete(
  meta,
  nombre => document.getElementById('mc4-' + id + '-' + nombre)?.textContent,
  cfgCiudad,
  (nombre, indice) => {
    const spec = meta.rasters[nombre];
    const base64 = document.getElementById('mc4r-' + id + '-' + nombre).textContent;
    return base64.slice(spec.indices[indice], spec.indices[indice + 1]);
  }
);

const tipoSuelo = mundo.sueloCasilla(200, 100); // decodifica solo el sector correspondiente
const elevacionPuente = mundo.nivel(1200, 600); // otro sector, independiente

console.log(mundo.diagnosticoRasters());
// { suelo: { residentes, maxSectores, bytesResidentes,
//            aciertos, descompresiones, expulsiones },
//   nivel: { ... } }

// Compatibilidad heredada, crea la matriz ENTERA deliberadamente:
const matrizCompleta = mundo.capa('suelo');
```

`MC.RasterMC4` ofrece `valor(tx,ty)`, `completa()`, `diagnostico()` y `limpiar()` para herramientas que trabajan directamente con cuadrículas. Usa **LRU de 16 sectores** por defecto y admite `{maxSectores: N}` con 1 ≤ N ≤ 512. Tiene una ruta caliente sin mutación de `Map` por cada píxel, con actualización de recencia amortizada.

### Memoria de viajes entre ciudades

Se porta la mejora de PR #10 sobre la nueva base 4.2 (sin fusionar la rama 4.1 conflictiva):

- `MC.Planeta.mundo(id)`: una única promesa en vuelo por ID. Al fallar una carga, se limpia la promesa y se puede reintentar.
- `Planeta._recortar`: LRU real con presupuesto `maxMundos=2` por defecto y reserva preferente del mundo activo.
- `Planeta.liberarExcepto(id)`: confirma el mundo del jugador y descarga los anteriores, invalida sus rutas `_puertas` y evita resucitar precargas que empezaron antes del viaje mediante contador de época.
- `Planeta.diagnosticoCache()` para QA.

Turno Cero conserva el principio de 4.2: **un solo mundo después de una transición real**. Mientras se precargan destinos, el presupuesto configurado impide explosiones de memoria.

## 3. Trazabilidad y pruebas

| Prueba | Qué comprueba |
| --- | --- |
| `pruebas/raster-sector-cm34.mjs` | Cuadrícula sintética 367 × 285, bordes parciales, bytes firmados, LRU ≤4, lectura masiva, SHA-256 de matriz reconstruida |
| `pruebas/paquete-capas-cm34.mjs` | Reconstruye **cada byte** de `suelo` y `nivel` en Manhattan, Medellín y Guatapé; el resto de capas se compara comprimido y sin alteración |
| `pruebas/planeta-cache-cm34.mjs` | 9 escenarios: solicitudes concurrentes, fallo/reintento, recencia, mundo activo, una sola plaza, generador de tramos, carreras entre ciudades, tarea vieja tras liberar y limpieza de rutas |
| `pruebas/getaway-contenido.mjs` | Regresión G-H24 valida API `liberarExcepto` en lugar de inspeccionar el código anterior |
| `pruebas/paquete-capas-browser.mjs` | Chromium offline 412 × 860; comienza partida en Guatapé y carga Medellín/Manhattan, comprobando que raster no se materializa entero |
| `pruebas/planeta-cache-browser.mjs` | Chromium offline: deduplicación de varias peticiones y transición real Guatapé → Medellín |
| QA histórico | `node motor.mjs prueba`, render WebGL2, vertical slice, accesibilidad, público simulado |

Comandos:

```bash
node motor.mjs construir
node pruebas/raster-sector-cm34.mjs
node pruebas/paquete-capas-cm34.mjs
node pruebas/planeta-cache-cm34.mjs
node pruebas/getaway-contenido.mjs
node motor.mjs prueba
node pruebas/paquete-capas-browser.mjs
node pruebas/planeta-cache-browser.mjs
```

**Criterio de integración:** GitHub Actions debe pasar **ambos jobs** del último commit, seguido de revisión de compatibilidad de Claude. Un pipeline verde no reemplaza el perfil de memoria y GPU real. No se incrementa la versión en esta PR de ChatGPT.

## 4. Problemas abiertos y siguiente trabajo

1. **ED1 por regiones físicas:** cortar sus índices `i0/p0/q0` y flujos sin perder polígonos, colisiones, edificios añadidos o compatibilidad de guardados; comparar todas las regiones del MC4 real con hashes.
2. **Vías por ventana y grafo:** definir división de geometría y nodos compartidos en fronteras, precarga de rutas largas y continuidad del pathfinding.
3. **Relieve por chunks con halo:** las interpolaciones bilineales necesitan las cuatro muestras adyacentes, incluidas las costuras de sector. Una sustitución ingenua cambia alturas; no hacerlo sin pruebas pixel a pixel.
4. **Precarga adaptativa:** calor de vistas, velocidad y rumbo; evitar desempaquetar en medio de frames críticos y controlar bloqueos.
5. **Mejora de empaquetado para distribución:** HTML de una sola pieza frente a PWA con sectores locales empaquetados, manteniendo una versión sin servidor.
6. **Benchmarks reproducibles:** mediana/p95 de cuadro, long tasks, consumo de JS Heap y memoria total de proceso antes/después sobre los mismos dispositivos, escenas y semillas.

Las ideas de sectorización y caché son técnicas generales; la implementación es original y no reutiliza código ni recursos de motores propietarios ni de videojuegos comerciales.
