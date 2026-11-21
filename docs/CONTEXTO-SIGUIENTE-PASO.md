# Contexto para la IA que sigue · Juega EnCicla, El Metro, Run Scooter y el Motor del Valle

**21‑nov‑2026 · lo escribió Claude, la IA de Juega EnCicla, para la IA que continúe.** Lee primero esto; luego, en este orden:
1. `docs/PLAN-MUNDO-ABIERTO.md`: la misión y el plan por fases.
2. `motor-valle/MOTOR.md`: el contrato del motor.
3. `docs/BITACORA.md`: el historial.
4. `docs/INTEGRAR.md`: cómo se mete código nuevo.

El autor (OneZero) tiene aparte un documento privado con su visión de negocio y de eventos (`VISION-ENCICLA-ONEZERO.md`). Si te lo pasa, úsalo como guía de por qué y para qué. No lo subas a un repositorio.

## 1. Estado exacto hoy
| | Dónde | Versión | Último commit |
|---|---|---|---|
| **Juega EnCicla** | `juanfeliperico369-stack/BicicletasUno`, rama `ccr-bed2d98a-uho2kr` | **v2.0.1** (APK con versionCode 20003) | Documentos del plan, sobre `bf91569` |
| **En línea** | https://juanfeliperico369-stack.github.io/BicicletasUno/ (rama `gh-pages`). Ahí también va El Metro, en `/metro/`: **no lo borres al publicar** | v2.0.1, caché `juega-encicla-v2.0.1-1896efed` | `72bdaa5` |
| **El Metro** | `juanfeliperico369-stack/MetroZero`: su IA trabaja en `ccr-2a67f935-oat714` (v1.4.0); el motor nuevo está en `motor-valle` | v1.4.0 + Motor 1.2.0 | `de55357` (rama `motor-valle`, todavía sin unir a la línea de su IA) |
| **Run Scooter** | `juanfeliperico369-stack/RunRunZero` · https://juanfeliperico369-stack.github.io/RunRunZero/ | Un solo HTML de unos 474 KB, Canvas 2D, sin librerías | No se ha tocado |
| **Motor del Valle** | `motor-valle/` de BicicletasUno (la fuente de verdad), copiado a MetroZero | **1.2.0** | `sincronizar --verificar`: iguales |

**Ramas que hay que ignorar:**
- `revolucion-v2`, en BicicletasUno: es vieja, de la v1.3.1, de otra sesión.
- `main`, en BicicletasUno: va atrás.

## 2. Qué se hizo en las últimas versiones
- **v1.7.2:**
  - fallas arregladas jugando, sobre todo encimados con el celular acostado;
  - registro de vehículos `JE.vehiculos` (`src/js/25-vehiculos.js`);
  - registro de modos `JE.modos` (`91-modos.js`);
  - la trama en datos (`contenido/guion/misiones.json`).
- **Se unió la entrega de Gemini:**
  - Run EnCicla 3D (`91-runner.js`);
  - 7 vehículos (`92-vehiculos.js`), que ya entran al registro;
  - la trama «Ruedas y Rieles» (`93-trama.js`);
  - túneles y GPS de dos niveles;
  - el Motor 1.1.0.
- **v2.0.0, la unión con la entrega de ChatGPT:**
  - TallerValle (`91-taller-arte.js`);
  - la Carrera de la ciclorruta de 3 carriles (`92-ciclovia.js`);
  - el boleto de Rosalba (`fragmentos.json`);
  - `94-revolucion.js`, que pone las dos carreras en el menú y un solo **Taller** en el modo libre;
  - la flecha del giro, ahora dibujada (`Ride.chipGiro`);
  - el botón de velocidad, que ahora muestra su valor (×0,8 a ×1,5).
- **v2.0.1:** el Motor del Valle 1.2.0 une las dos versiones «1.1.0», la de Gemini y la de la entrega de El Metro.
  - La fuente de verdad volvió a BicicletasUno.
  - `js/valle.js` expone `Valle` y `MotorValle`.
  - `sincronizar --verificar`.
  - Los datos del mapa no cambiaron.

## 3. Pendientes conocidos
1. **La entrega de El Metro** (`ENTREGA-EL-METRO.md`) **no está integrada.** Trae Run Scooter, 6 vehículos, personajes de EnCicla y el capítulo 6. Le corresponde a su IA, y debe usar el Motor 1.2.0 de la rama `motor-valle`, no su 1.1.0.
2. **Faltan las capas de El Metro** `vias_datos.mjs`, `rutas_calles.mjs` e `hitos.js`: no llegaron completas. Hay que pedirlas para pasarlas a `motor-valle/capas/` (fase F2 del motor).
3. **El Metro no incluye `motor-valle/js/valle.js`** en su compilación. EnCicla sí lo incluye.
4. **Dos detalles de orden en el motor:**
   - en `VERSION.json`, «alturas» y «túneles» aparecen como capas comunes, pero hoy solo EnCicla las usa;
   - el catálogo `capas/index.mjs` no tiene fichas para `puentes`, `metroplus`, `ajustes` y `valle` de El Metro.
5. **La propuesta de niveles** (`geo/pasos.py` y `js/red-niveles.mjs`) no está conectada al GPS.
6. **Falta probar en un celular real:** gestos, rendimiento y el APK instalado.

## 4. El siguiente paso
Es la **misión del motor de mundo abierto** (`docs/PLAN-MUNDO-ABIERTO.md`, sección 5). El orden recomendado:
1. **F4 · Run en la ciclovía**, primero en EnCicla, porque no depende de lo demás. Se copia casi idéntico el motor de dibujo de RunRunZero (Canvas 2D) en `motor-valle/js/run.js`.
   - El botón «Run» solo aparece sobre una casilla `TT.CICLO`.
   - El trazado es la ciclorruta real, a partir de `JE.map.lanes`, `JE.map.at` y `JE.map.project` (o de `TramoCiclista` en `92-ciclovia.js`).
   - Las esquinas son sus curvas reales.
   - Se puede parar, caminar, correr y cambiar de vehículo (`JE.vehiculos`).
   - Al salir, el jugador queda en el mismo punto, a la misma hora y con el mismo clima, y las metas siguen activas.
   - Debe reemplazar o unir las dos carreras actuales.
2. **F1 · El mundo construido en un solo archivo**, a 10 m: lo mejor de los dos juegos.
3. **F2 · Un personaje, unos vehículos y una cámara únicos.**
4. **F3 · Las vistas dentro del motor.** La **panorámica 2D con pixel lleva cuidado especial**:
   - la de El Metro está en `src/js/23-lado.js`;
   - la de EnCicla, en `renderPano` de `75-graficos.js`. Se activa en Más → Vista del mapa → Panorámica, o con la tecla V.
5. **F5 · Las mismas reglas del mundo en los dos juegos.**

Antes de empezar F1, valida con el autor el formato del mundo.

## 5. Reglas y comandos
- **Las reglas de siempre:**
  - un solo HTML, sin internet ni librerías;
  - español de Colombia, para todo público;
  - fluido en un celular medio (con la CPU 4× más lenta, mediana menor a 40 ms; hoy da 16,7 ms);
  - no romper los guardados `juegaencicla.v1` ni `elmetro.v1`;
  - atribución de OSM (ODbL), Overture, Catastro y SRTM;
  - nada de datos personales.
- **EnCicla:**
  - `node tools/build.js` y `node tests/run.js`: deben dar 96 de 96 y terminar en «✓ TODAS LAS PRUEBAS PASARON».
  - Cada sección nueva lleva su prueba en `tests/run.js`, como la 3m o la 3n.
  - El APK se compila con `cd app && ANDROID_HOME=/opt/android-sdk npm run build:debug`. Antes, borra `app-debug.apk`. Usa un versionCode mayor que 20003.
- **El Metro:** `node tools/build.mjs` y `node tools/test.mjs 100`, con 0 errores. Sigue el protocolo de su `CLAUDE.md`.
- **El motor:** solo se cambia en `motor-valle/` de BicicletasUno. Cada cambio sube la versión y se copia con `node motor-valle/sincronizar.mjs ../MetroZero`; comprueba con `--verificar`.
- **Al publicar:**
  - actualiza la BITÁCORA y la GUIA;
  - sube la versión en `src/js/00-core.js` y en `app/android/app/build.gradle`;
  - en `gh-pages`, copia `dist/web/` **conservando `/metro/`**;
  - verifica en línea la caché de `sw.js`, `/metro/` y la descarga del APK;
  - entrega al autor el HTML, el APK y el enlace.
- **Git:** trabaja en la rama que te dé tu sesión y no hagas PR si no te lo piden. Si la rama remota tiene commits nuevos (las otras IA pueden subir entregas ahí), únelos con merge, sin forzar. Revísalos antes: la última entrega pisaba la API de vehículos y usaba tipos de casilla que no existen.
- **Cómo trabaja el autor:** respuestas cortas en español y, en cada versión, HTML, APK y enlace. Prefiere documentos `.md` para pasar contexto entre IA.
