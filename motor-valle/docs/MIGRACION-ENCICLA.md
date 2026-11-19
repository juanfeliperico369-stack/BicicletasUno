# Juega EnCicla → Motor City 2.0 · guía para su IA

**Lo que ya está hecho:**
- `motor-valle/` de BicicletasUno trae el motor 2.0 completo (sincronizado desde `motorcity`).
- **El juego no cambió:** su `tools/build.js` sigue incluyendo `motor-valle/js/valle.js` (el lector 1.2.0) y sus pruebas siguen en verde.

Lo que sigue lo decide la IA de EnCicla, paso a paso. Cada paso debe dejar el juego andando.

## Paso 1 · Incluir el motor (sin cambiar nada más)
1. En `tools/build.js`, pega `motor-valle/dist/motor.js` **antes** de los `src/js/NN-*.js`. Va en su propio cierre y solo publica `MC`; no choca con `JE`, `TT`, `clamp`…
2. Pega también el mundo. Hay dos opciones:
   - generar `dist/mundo-medellin.js` con `node motor-valle/motor.mjs construir --sin-sandbox`;
   - incrustar `motor-valle/datos/medellin/mundo.mc4` en base64 en el HTML.
3. Mide: `node tests/run.js`, el tamaño del HTML (hoy 5 MB; el mundo suma unos 8 MB en base64) y la mediana con la CPU 4× más lenta.

> **Para no crecer de más**, el mundo 2.0 puede **reemplazar** a `valle.bin`, `vias.bin`, `sitios.*` y `alturas.json`, porque los trae todos. Así el HTML queda casi igual que hoy.
>
> Para eso, `CityMap.load()` debe leer las capas del MC4: `mundo.capa('suelo')`, `'relieve'`, `'vias'` (el mismo formato VIAS3) y `'sitios'` (el mismo SIT4). Las líneas de `valle.json` salen de `mundo.info` (en metros: × 1,6 para px).

## Paso 2 · La panorámica de perfil (lo que pidió el autor)
- Recupera la vista **a la vista**: Más → Vista del mapa → Panorámica, la tecla V y la pausa. Dibújala con `MC.Vistas`/`MC.Panoramica` del motor; trae todo lo de El Metro y lo de EnCicla, y más (`MOTOR.md` §7).
- Conecta el viaje: `new MC.SeguirRuta(mundo, cuerpo)`.
  - La bici sigue la ruta sola: → pedalea, ← frena, ↑ salta.
  - Q/E (o botones) eligen la calle en el próximo cruce.
  - Con destino, usa `red.camino()` y elige con `girar()`.
- **Tu piel:**
  ```js
  MC.arte.registrar('encicla', { vehiculoLado: (g, V, x, y, k, dir, C) => { /* tu bici verde con canasta */ }, personajeLado: … }).usar('encicla');
  ```
- Mantén los obstáculos para saltar (`hueco`, `cono`, `charco`) con `op.extras` de `Panoramica.dibujar` y la física de `SeguirRuta.paso`.

## Paso 3 · Run en la ciclovía (une o reemplaza las dos carreras)
- El botón «Run» sale solo si `MC.Run.puede(mundo, cuerpo).ok`.
- `MC.Run.entrar({ mundo, cuerpo, reloj, clima, aspecto, lienzo, capa, hud, alSalir })` necesita un `<canvas>` propio y una capa encima del juego.
- Al salir:
  - el cuerpo queda en el punto real;
  - suma `r.metros` al oficio o a la meta del día;
  - guarda `r.puntos` en tus logros.
- **Tu piel en Run:**
  - `RUNV.cielo` y la paleta de la vía (ver `js/50-run.js`);
  - verde EnCicla en la vía;
  - la canasta en el modelo (`MOD.rider`, en `run/run-scooter.js`; pide el cambio en motorcity).

## Paso 4 · Vistas y cámara del motor (opcional, por partes)
- La **ciudad 3D** del motor (`Vista2D`, modo `oblicua`) usa las 639.457 huellas reales. Puede convivir con la tuya (`75-graficos.js`) como opción «Ciudad real».
- **Tercera persona en WebGL** (`VistaGL`): un modo nuevo para el modo libre.
- **Maqueta 2:1** del motor: compárala con `86-maqueta.js`.

## Paso 5 · Reglas del mundo
- Usa `MC.Transporte` para los trenes y cables. Así son los mismos que ve El Metro a la misma hora.
- Usa `MC.Clima` y `MC.Cielo` para el día, la noche y la lluvia, y `MC.Calendario` para los festivos (ya los tienes; compara y une).
- Pon tus huevos con `MC.huevos.poner(...)`:
  - el boleto de Rosalba;
  - los tres timbrazos bajo una estación;
  - «Ni una gota».

## Reglas que no cambian
- Un solo HTML, sin internet ni librerías.
- No romper el guardado `juegaencicla.v1`.
- Las pruebas en verde.
- Al publicar en `gh-pages`, conservar `/metro/`.
- El APK con `versionCode` > 20003.

**Si algo del mundo está mal** (una calle, un edificio, un puente), **no lo corrijas en el juego**: pídelo en `motorcity` (fuente de verdad), se sube la versión y se sincroniza.
