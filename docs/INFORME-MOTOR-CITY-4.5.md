# Informe de Motor City 4.5 para Juega EnCicla

> **Para la IA que siga con Juega EnCicla (Codex, Gemini, Claude o cualquier otra).** Lo escribió Claude el 21‑nov‑2026 por pedido del autor: «compártele a cada repositorio un documento detallado con lo que has cambiado, lo que has mejorado, lo que queda por auditar y lo que falta que ellos hagan, para que luego hagan bien su trabajo; que sigan manteniendo su propia versión del Valle; solo compárteles el motor y en el documento especifica cómo usarlo para terminar de desarrollar y mejorar su propio videojuego».
>
> **Léelo entero antes de tocar nada.** Después: `TAREAS-IA.md`, `docs/BITACORA.md` y, si vas a usar el motor, `motor-city/docs/DOCUMENTO-UNICO.md` y `motor-city/docs/INVESTIGACION-MANEJO.md`.

## 1. La decisión del autor (lo que cambia para ti)
- **Juega EnCicla sigue con su propio Motor del Valle** (`motor-valle/js/valle.js` + `src/js/`). **No migres a Motor City.** La tarea vieja «Migrar a `motor-city/`» (`TAREAS-IA.md`, punto 1, y `motor-city/docs/MIGRACION-ENCICLA.md`) queda **anulada**.
- **Motor City 4.5.0 está en `motor-city/`** como referencia y caja de herramientas: se lee, se copia lo que sirva a archivos aditivos tuyos, o se usa entero como librería si un modo nuevo lo necesita (§ 6).
- **El mapa es tuyo.** Las calles, el relieve, los edificios y las estaciones del Valle de tu juego los mejora tu IA. Motor City no los toca.
- **Todo público:** del motor 4.5 no entra la violencia de *Turno Cero* (armas, explosiones de guerra, lenguaje fuerte).

## 2. Lo que Claude cambió en este repositorio (rama `claude/motor-city-engine-xu7p4y`, publicada en `main` y `gh-pages` el 21‑nov‑2026)
| Qué | Dónde | Notas |
|---|---|---|
| **Mundo abierto primero:** ▶ Jugar entra directo al modo libre; la bienvenida y el personaje quedan opcionales en «🏆 Oficios y modos» | `src/js/98n-abierto.js` | Regla del autor: el tutorial y la historia nunca bloquean. |
| **Los 5 arreglos que Codex describió y no subió:** bici prestada que queda en la vía (y solo se monta de cerca), «Ir a la bici» sin bici parqueada ya no rompe, la eléctrica gasta menos, subirse a pie avisa el evento «montar», las hojas de la trama pasan a la tienda (con migración del guardado) | `src/js/98o-arreglos.js`, `src/js/69-libre.js`, `src/js/93-trama.js` | Prueba: `tests/regresion-encicla.js` (5 de 5). |
| **La prueba de WebRTC sin esperas fijas** | `tests/run.js` (carrera en red) | Espera a que el invitado 2 vea a los otros dos y luego a que vea sus nuevas posiciones (antes: 3,6 s y 0,9 s fijos). |
| Motor City de la 2.0 a la **4.5.0** en `motor-city/` (el juego no cambió por esto) | `motor-city/` | Más el `docs/CONTEXTO-MOTOR-CITY.md` y las notas del buzón. |
| Motor City 3.0 adaptado: calidad automática que solo baja si sirve y artilugios físicos | `src/js/97-motor30.js` | |
| Alto contraste y metro sin casas debajo (de la rama `revolucion-v2`) | `src/js/96-accesible.js` | |
| Protocolo entre IAs sin mediador y fichas | `coord/` | |
| Skills y plugins de los videos del autor (Hallmark, Modern Web Guidance, find-skills, HyperFrames) | `.claude/settings.json`, `CLAUDE.md` | Las demás IA: `node motor-city/motor.mjs skills --instalar --agente codex`. |

## 3. Lo que mejoró para quien juega
- Abre jugando: sin pantallas obligatorias.
- Cinco errores menos en el modo libre (la bici prestada, la eléctrica, los boletos de Rosalba, las hojas y un cierre del juego).
- La prueba de la carrera en red ya no falla al azar por tiempos.

## 4. Lo que queda por auditar (y cómo)
| # | Qué | Cómo |
|---|---|---|
| A1 | **En un celular real** (Android 7 con WebView 119 o más, iPhone 8/X con iOS 16): fluidez del modo libre, de la carrera y de la panorámica | Telemetría del juego y la plantilla de `motor-city/reportes/2026-11-21-gemini-clasicos-4.1.md` § 1.4. |
| A2 | Que la bici prestada quede bien dibujada parqueada en la vía y que el aviso de «ve hasta ella» se entienda | Jugar: tomar una EnCicla, cambiar a monopatín, alejarse 300 m, volver. |
| A3 | Que la migración de las hojas no duplique nada en partidas viejas | Importar un guardado de antes de la 2.0.1 con `leaves > 0`. |
| A4 | La carrera en red con dos celulares reales (no solo Chromium) | Dos teléfonos en la misma red. |
| A5 | Alto contraste en 412 × 860 | Más → Alto contraste; anotar lo que no se lea. |
| A6 | Árboles que caigan en canchas, piscinas o en la mitad de las plazas | Recorrer los campus y unidades deportivas (Atanasio Girardot, UdeA, Unal). |

## 5. Lo que les toca hacer (en orden de valor)
1. **El manejo de la bici y los vehículos (lo más importante: ahí está la jugabilidad).** Porta del motor 4.5 (manera A del § 6):
   - **choque que desliza** a lo largo de la pared en vez de trabarse (la normal se estima tanteando 8 puntos; la pérdida es impacto²; el rumbo se alinea), `motor-city/js/32-fisica.js` `_mover`;
   - **desatascar** si se empuja y no se avanza 0,85 s (`_despues`, `_desatascar`);
   - **asistencia** que mira adelante y evita la pared (con interruptor), `_asistencia`;
   - joystick que apunta en el mundo **amortiguado**, y acelerador que se recoge en las curvas cerradas;
   - **qué se pisa:** andén y ladrillo a menor velocidad, bordillo con un tumbo; la bici de montaña por el pasto;
   - medirlo en Chromium con una prueba como la § 25 de `motor-city/pruebas/prueba.mjs` (rasante desliza, de frente frena, se desatasca).
2. **Modelos 3D, 2D y pixel:** la bici EnCicla, la eléctrica, los ciclistas y la gente. Si haces 3D, el generador `motor-city/juegos/getaway/arte3d/generar_modelos.py` (sin dependencias) muestra cómo dar silueta, AO horneada y malla indexada. En 2D/pixel, las pieles de `MC.arte` y el § 10 del documento único.
3. **Rostros detallados** en el personaje, Rosalba y la gente con la que se habla: `MC.Rostro` (manera B), con `MC.Rostro.azar(semilla)` para los transeúntes.
4. **Árboles con lógica:** nada en canchas, piscinas ni en la mitad de una plaza dura; los árboles en los bordes. Las reglas: `motor-city/js/29-arboleda.js` `sembrable()`.
5. **Topografía, relieve, casas, edificios y el mapa del mundo abierto** (tuyos): techos a cuatro aguas para las casas de teja, terrazas con tanque y aires, relieve más fino cerca. Ideas en `motor-city/js/45-gl3d.js` (`edificio3d`) y `js/45-gl.js` (`prisma` con `cuatro`).
6. **Guatapé en EnCicla** («Ruta a Guatapé en bici», C‑E40): un modo aparte con el mundo `motor-city/datos/guatape/mundo.mc4` (0,4 MB) y la Autopista del Embalse de `MC.Planeta` (12 km). Manera C del § 6. Con paradas para hidratarse y el letrero de los kilómetros. Sin violencia.
7. **La forma cenital** que el autor admira (*Hunter Assassin*, de Ruby Games): vista desde arriba limpia y legible, con lo importante (estaciones, bicis libres, rutas) resaltado como las linternas de ese juego. Ver `motor-city/juegos/getaway/40-dibujo.js` (conos que se cortan en los muros).
8. **Efectos para todo público:** marcas de frenada, polvo, chispas de un roce, conos y canecas que se caen, y sus restos (`MC.Efectos`, `MC.Rotos`), **sin explosiones**.
9. **Interfaz y espaciados:** rejilla de 8 px y área segura (ver `motor-city/juegos/getaway/index.html`, bloque «4.5 · espaciado del HUD»), y que nada tape el centro (`MC.UI.verificar`).
10. Del `TAREAS-IA.md`: `Save.CLAVES` (registro de claves del guardado), Modern Web Guidance antes de tocar la interfaz, lugares jugables (estaciones y talleres), Mi casa con la bici, capa de movilidad.
11. **Publicar** cada versión en `gh-pages` **conservando `/metro/`**, con APK (`.github/workflows/android.yml`, etiqueta `v*`). Nunca subas llaves.
## 6. Cómo usar Motor City sin dejar tu motor
El autor decidió que **cada juego sigue con su propio motor** (el Motor del Valle en EnCicla y El Metro; el motor WebGL propio en Run Scooter). Motor City viaja en `motor-city/` como **referencia y caja de herramientas**: no se compila dentro del juego a menos que tú lo decidas.

### 6.1 Tres maneras, de la más liviana a la más completa
| Manera | Qué haces | Peso que suma | Cuándo conviene |
|---|---|---|---|
| **A. Leer y portar** | Lees la función en `motor-city/js/NN-*.js` y escribes la tuya en un archivo **aditivo** de tu juego (rango libre de tu `src/js`). | 0 | Lo pequeño: el choque que desliza, el desatascador, la asistencia de manejo, las reglas de los árboles. |
| **B. Un módulo suelto** | Copias un archivo del motor que no depende de nada (o de muy poco) y lo llamas con tu propia proyección. | 10–30 KB | `MC.Rostro` (`js/71-rostros.js`), `MC.Efectos` (`js/88-efectos.js`), `MC.Colormap` (`js/47-colormap.js`), `MC.Semilla` y `MC.DDA` (`js/47-clasicos.js`). |
| **C. El motor entero como librería** | Metes `motor-city/dist/motor.js` en tu HTML **antes** de tu código. Todo queda bajo el objeto global `MC`, que no choca con tus nombres. | ≈ 1 MB (≈ 250 KB comprimido) | Un modo nuevo que use mundos MC4 (por ejemplo **Guatapé**: `motor-city/datos/guatape/mundo.mc4`, 0,4 MB), `MC.Planeta`, `MC.Vistas`, `MC.Trafico`. |

### 6.2 Ejemplos
**Retratos (manera B):** copia `motor-city/js/71-rostros.js` y lo que usa (`hex3`, `css3`, `mez3`, `mulberry32`, `TAU`, de `motor-city/js/00-nucleo.js`), o usa la manera C. Luego:
```js
const R = { piel: '#c68a5e', pelo: '#16110d', ojos: '#3b2414', peinado: 'cola', fem: true, edad: .2, ropa: '#2b343d', acc: ['gafas'] };
img.src = MC.Rostro.url(R, 128, { expresion: 'sonrisa' });          /* o MC.Rostro.dibujar(ctx, R, x, y, tam) */
const cualquiera = MC.Rostro.azar(semilla);                         /* una persona de la calle */
```
**Efectos (manera B o C):** solo necesitan una función que pase del mundo a la pantalla.
```js
MC.Efectos.chispas(x, y, 14, rumbo); MC.Efectos.humo(x, y, 3); MC.Efectos.marca(x1, y1, x2, y2);
/* en tu dibujo, al final de cada cuadro: */
MC.Efectos.dibujar(ctx, (x, y, z) => [pantallaX(x, y), pantallaY(x, y) - z * escala], { t: tiempoEnSegundos });
```
**El motor entero (manera C) en tu compilación:** en tu script de compilación, antes de tu código:
```js
const motorCity = fs.readFileSync('motor-city/dist/motor.js', 'utf8');   /* node motor-city/motor.mjs construir lo rehace */
html = html.replace('/*TU_CODIGO*/', () => motorCity + '\n' + tuCodigo);
```
y para un mundo MC4 sin internet: guarda el archivo en base64 dentro de un `<script type="text/plain" id="mc4-guatape">` y ábrelo con `await MC.Mundo.cargar(texto)`.

### 6.3 Lo nuevo del motor 4.5 que más te sirve
| Qué | Archivo | Para qué en tu juego |
|---|---|---|
| Choque que desliza, desatascar, asistencia, derrape | `js/32-fisica.js` (`_mover`, `_despues`, `_asistencia`, `_desatascar`) y `js/36-taller.js` | Que el vehículo no se trabe en las paredes ni se quede pegado; que no se estrelle por un dedo nervioso. Documento: `motor-city/docs/INVESTIGACION-MANEJO.md`. |
| Qué pisa cada vehículo | `js/31-vehiculos.js` (`VEH_SUELO_*`) | Andén, ladrillo, pasto, arena, nieve y roca suelta, despacio; la moto por escalas. |
| Cosas que se rompen | `js/32-rotos.js` | Conos, canecas, vallas y bancas que se tumban según la velocidad y la masa. |
| Efectos | `js/88-efectos.js` | Chispas, humo, marcas de llanta, pedazos y restos. (La explosión es para juegos 18+.) |
| Rostros | `js/71-rostros.js` | Retratos en diálogos, tarjetas y perfiles. |
| Árboles con lógica | `js/29-arboleda.js` (`sembrable`, `despejada`) | Nada de árboles en canchas, piscinas o en la mitad de una plaza dura. |
| PVS horneado | `herramientas/pvs.mjs`, `js/45-pvs.js` | Si tu 3D dibuja una ciudad densa: no dibujar lo que tapan los edificios. |
| Sin conexión | `sw.js` y `pruebas/sin-conexion.mjs` | Abrir sin internet lo que ya se abrió, consultando solo un archivo de versión. |
| Modelos 3D con cara y AO | `juegos/getaway/arte3d/generar_modelos.py` | Un generador de GLB en Python sin dependencias para tus propios modelos. |

### 6.4 Comandos del motor (desde tu repositorio)
```bash
node motor-city/motor.mjs construir          # rehace dist/motor.js y los juegos del motor
node motor-city/motor.mjs prueba             # 144 pruebas de Node del motor
node motor-city/motor.mjs documento          # todo el contexto del motor en un archivo
node motor-city/motor.mjs skills --instalar --agente codex   # (o antigravity, gemini-cli) las skills externas
```
Para traer una versión nueva del motor, desde el repositorio `motorcity`: `node motor.mjs sincronizar ../<tu repositorio>`.

## 7. Reglas que no cambian
- Un solo HTML, sin internet ni librerías en el juego; celulares modestos (Android 7 con WebView 119, iPhone 8/X con iOS 16).
- Español de Colombia; **todo público** (sin armas, sangre ni explosiones de violencia: un choque suave, chispas y humo sí).
- **No romper el guardado** (la clave de guardado de tu juego no cambia sin migración).
- Las pruebas de tu repositorio en verde antes de subir. Nunca subir llaves.
- **El mapa es tuyo:** las calles, el relieve y los edificios de tu juego los decide y los mejora tu IA. Motor City no los cambia.
- Coordinación: tu ficha en `coord/agentes/<tu-id>.json` (o `.ai-coord/`) y un mensaje nuevo en el buzón por cada entrega.

## 8. Comandos de este repositorio
```bash
node tools/build.js          # dist/juega-encicla.html (un solo HTML)
node tests/run.js            # todas las pruebas, en verde
node tests/verify-live.js    # verifica la página publicada
```
Al terminar: `docs/BITACORA.md`, tu ficha en `coord/agentes/` y un mensaje en `coord/buzon/`.
