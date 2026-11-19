# Motor City 2.0 en Juega EnCicla · qué cambió y qué sigue

**19‑nov‑2026 · lo hizo Claude (la IA del motor, Claude Code), a pedido del autor.** Esta nota es para la IA de Juega EnCicla.

## Qué cambió en este repositorio
**Solo la carpeta `motor-valle/`.** Ahí se copió el motor 2.0, sincronizado desde `juanfeliperico369-stack/motorcity`, que desde ahora es la **fuente de verdad** del motor.

- **El juego no cambió:**
  - `tools/build.js` sigue incluyendo `motor-valle/js/valle.js`, que es **idéntico** al de antes (el lector 1.2.0);
  - el HTML compilado tiene la misma huella (`juega-encicla-v2.0.1-1896efed`);
  - `node tests/run.js` sigue en verde.
- **Archivos de `motor-valle/` que cambiaron:**

  | Archivo | Cambio |
  |---|---|
  | `MOTOR.md` | Ahora es el contrato 2.0. |
  | `VERSION.json` | 2.0.0; fuente de verdad: motorcity. |
  | `motor.mjs` | Comandos nuevos: `mundo`, `construir`, `run`, `prueba` y `sincronizar`. Los de siempre siguen igual. |
  | `sincronizar.mjs` | Ahora es un atajo a `herramientas/sincronizar.mjs`. |
  | `geo/build.py`, `geo/fetch.py` | Aceptan `CIUDAD=ciudades/x.json` para otra ciudad. Sin esa variable hacen lo mismo de siempre. |
- **Lo nuevo en `motor-valle/`:**

  | Ruta | Qué es |
  |---|---|
  | `js/00-…` a `js/50-…` | El motor en fuente. |
  | `dist/motor.js` | El motor listo para incluir. |
  | `datos/medellin/mundo.mc4` | El mundo 2.0, que ya trae tus datos. |
  | `ciudades/` | Las reglas de cada ciudad. |
  | `run/` | Run Scooter importado. |
  | `herramientas/`, `pruebas/`, `sandbox/` | Las herramientas, las pruebas y el banco de pruebas. |
  | `docs/` | Incluye **`docs/MIGRACION-ENCICLA.md`**. |
  | `README.md`, `CONTEXTO-IA.md`, `BITACORA.md` | Los documentos del motor. |

## Qué sigue para ti (decídelo tú, paso a paso)
Lee **`motor-valle/docs/MIGRACION-ENCICLA.md`**. En corto:
1. Incluir `motor-valle/dist/motor.js` y el mundo 2.0. El MC4 puede reemplazar `valle.bin`, `vias.bin`, `sitios.*` y `alturas.json` para que el HTML no crezca.
2. **Recuperar y mejorar tu panorámica de perfil** con `MC.Panoramica` y `MC.SeguirRuta`. Es lo que pidió el autor.
   - Trae lo de El Metro: capas, laderas con luces, viaducto con trenes y Metrocable.
   - Y lo nuevo: fila real de edificios, siluetas de los emblemáticos y cruces con nombre.
   - Con tu piel: la bici verde con canasta.
3. **Run en la ciclovía** con `MC.Run`: une o reemplaza tus dos carreras.
4. Probar en un celular real y publicar la v3.0. Al publicar en `gh-pages`, conserva `/metro/`, y el APK debe usar `versionCode` > 20003.

Para ver el motor andando, abre `motor-valle/dist/…` o el banco de pruebas de `motorcity`: `dist/motor-city.html`.

**Si algo del mapa está mal, no lo corrijas aquí:** pídelo en `motorcity`. Se sube la versión y se sincroniza con `node herramientas/sincronizar.mjs ../BicicletasUno`.
