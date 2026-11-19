# Contexto para la IA que retome Motor City

> **Léelo completo antes de tocar nada.** Si se te acaba el contexto, este documento, `MOTOR.md` y `BITACORA.md` bastan para seguir.
> Lo escribió Claude (Claude Code) el 19‑nov‑2026, a pedido del autor (OneZero), sobre el *Plan del Mundo Abierto del Valle*.
> Ese plan está en `docs/PLAN-MUNDO-ABIERTO.md` de BicicletasUno, rama `ccr-bed2d98a-uho2kr`.

## 1. La misión en una frase
Un solo motor de mundo abierto (Medellín y el Valle de Aburrá, y cualquier ciudad) para Juega EnCicla, El Metro y los juegos que vienen. Cada juego conserva su forma de juego, su arte y su trama, y solo pone su piel.

**La visión del autor, a largo plazo:**
- ***Motor City***: un juego de carreras en mundo abierto, al estilo GTA, Forza Horizon y Need for Speed. Carros, motos, aviones, tuneo, carreras callejeras, NASCAR y F1, con una trama ruda pero simpática y estilo EnCicla. Gráficos 2D y pixel con vista cenital 3D y cámaras cambiantes.
- ***Extremo***: deportes extremos (downhill, BMX, skate, parkour, surf, lanchas…), con estética más realista.

El motor debe quedar como **terreno fértil** para esas semillas. Ver `docs/VISION-MOTOR-CITY.md`.

## 2. Los cuatro repositorios
| Repo | Qué es | Rama de trabajo de esta sesión | Notas |
|---|---|---|---|
| `juanfeliperico369-stack/motorcity` | **El motor (fuente de verdad desde la 2.0)** | `claude/motor-city-engine-xu7p4y` | Este repo. |
| `juanfeliperico369-stack/BicicletasUno` | Juega EnCicla v2.0.1 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-bed2d98a-uho2kr`) | Ignorar `revolucion-v2`. Al publicar en `gh-pages`, **conservar `/metro/`**. APK con `versionCode` > 20003. Sus pruebas: `node tests/run.js` (97 ✓). |
| `juanfeliperico369-stack/MetroZero` | El Metro v2.0.0 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-2a67f935-oat714` + `main`) | **Seguir su `CLAUDE.md`** (protocolo de 7 pasos). Sus pruebas: `node tools/test.mjs 100` (0 errores). |
| `juanfeliperico369-stack/RunRunZero` | Run Scooter v2.5.0 | `claude/motor-city-engine-xu7p4y` (sale de `ccr-cbc7f0af-0306uo`) | Juego propio. **No depende del motor**: el motor lo importa (`node motor.mjs run`). Es WebGL propio, no Canvas 2D como decía el plan. |

**Cada juego tiene su propia IA.** Si tocas un juego, deja escrito qué cambiaste en su bitácora y en `docs/CONTEXTO-MOTOR-CITY.md` de ese repo. No hagas PR si no te lo piden y no subas llaves (*keystores*).

## 3. Lo que quedó hecho (2.0.0)
| Fase del plan | Estado | Dónde |
|---|---|---|
| **F1 · Mundo construido en un solo archivo** | ✅ | `herramientas/fusionar.mjs` → `datos/medellin/mundo.mc4` (16 capas, 6 MB; ver `MOTOR.md` §4). Cargador `js/10-mundo.js`. |
| **F2 · Personaje, vehículos, cámara, física y controles** | ✅ | `js/30` a `js/34`. |
| **F3 · Vistas** | ✅ | `js/40` a `js/46`:<br>• cenital, ciudad 3D y maqueta 2:1 (una sola proyección);<br>• **panorámica de perfil** (`43-panoramica.js`);<br>• WebGL de tercera y primera persona, dron y cine (`45-gl.js`);<br>• gestor con pixel, transición y calidad automática (`46-vistas.js`). |
| **F4 · Run en la ciclovía** | ✅ | `herramientas/importar-run.mjs` (12 parches) → `run/run-scooter.js`. El envoltorio es `js/50-run.js` y la ruta real la da `js/47-seguir.js`. |
| **F5 · Mismas reglas del mundo** | ✅ | `js/20-tiempo.js`, `21-trafico.js`, `22-transporte.js`, y los huevos en `00-nucleo.js`. |
| Banco de pruebas | ✅ | `sandbox/` → `dist/motor-city.html`. |
| Pruebas del motor | ✅ | `node pruebas/prueba.mjs --navegador`: 54 pruebas. |
| Sincronización | ✅ | `herramientas/sincronizar.mjs` y `sincronizar.mjs` (el atajo 1.x). Copia el paquete a `<juego>/motor-valle/`. |
| Migración de los juegos al mundo 2.0 | ⏳ **Le toca a la IA de cada juego** | Las guías son `docs/MIGRACION-ENCICLA.md` y `docs/MIGRACION-ELMETRO.md`. |
| Arte y auditoría de Gemini y ChatGPT | ⏳ **Pedido** | `docs/PETICION-GEMINI.md` y `docs/PETICION-CHATGPT.md`. Cada uno entrega un solo documento; el autor se lo pasa a la IA del motor para unirlo y mejorarlo. |

**Cifras medidas** (Chromium sin GPU, CPU 4× más lenta, 412 × 860): mediana del dibujo en cenital 4,1 ms, ciudad 3D 8,6 ms, maqueta 17,8 ms y panorámica 7,3 ms. La vista WebGL en SwiftShader (por software) da 70–90 ms; con GPU real debe ser mucho menor, pero **hay que medirla en un celular**.

## 4. Decisiones que no hay que deshacer sin motivo
1. **El mundo 2.0 junta los datos ya generados** por los dos juegos, que comparten el mismo origen. Así no hacen falta los 190 MB de fuentes ni Python para tener el mundo. La tubería `geo/` sigue para regenerar desde cero (y ya acepta otra ciudad con `CIUDAD=ciudades/x.json`).
2. **Todo en metros** desde el origen de la ciudad. EnCicla convierte con 1 m = 1,6 px (`MC.ValleCompat.desdeMundo(m, 16)`).
3. **`js/valle.js` no se toca:** es el lector 1.2.0 que incluye EnCicla, y sus pruebas exigen esa versión. `construir.mjs` solo empaqueta los fragmentos numerados.
4. **Las losas (160 m) son el mismo mapa en todas las vistas.** También son el piso de WebGL.
5. **La panorámica mira el fondo por un eje suavizado** que pasa por el jugador. Si se usa el rumbo de cada punto, las montañas saltan en las esquinas.
6. **Run importa RunRunZero casi idéntico con parches comprobados.** Si RunRunZero cambia y un parche no calza, el importador lo dice y no escribe nada. No se copian su interfaz ni su guardado.
7. **Una sola red (`rueda`)** para el tráfico, la panorámica y Run, filtrando por tipo de vía.
8. **Determinismo compartido:** el clima, los trenes y los semáforos salen de la fecha y la hora. Dos juegos abiertos a la misma hora ven lo mismo.

## 5. Lo que falta o se puede mejorar (en orden de valor)
1. **Que cada juego use el motor 2.0** (sus IAs, con las guías de migración). EnCicla debe recuperar y mejorar su panorámica con la de este motor; El Metro conserva su `23-lado.js` y puede pasarse a esta.
2. **Medir en un celular real** la vista 3D en WebGL y el arranque. Hoy `red('rueda')` tarda alrededor de 1 s (45.000 aristas), así que conviene precalcularla en el MC4 (2.1).
3. **Run con el arte de cada juego.** Hoy las zonas y los letreros son los de Orbe, la ciudad de Run Scooter (los temas `THEMES`/`ZONES`). Hay que mapearlos a las zonas reales (`mundo.zona`) y darle a `RUNV.cielo` y a la paleta de la vía la piel de EnCicla o de El Metro. Las esquinas ya muestran los nombres reales en el HUD.
4. **Panorámica:**
   - estaciones del metro con su dibujo de El Metro (`SisSpr`/`Art`) en vez de las bandas actuales;
   - deprimidos (el camino que baja con sus muros);
   - más mobiliario por zona.
5. **WebGL:** sombras, agua, texturas de fachada, árboles por especie y la cabina del metro como vista (de El Metro).
6. **Otra ciudad** de prueba con `docs/CIUDADES.md`, para demostrar que el motor «craquea» cualquier ciudad.
7. **Integrar lo que entreguen Gemini y ChatGPT** (sprites, paletas, auditoría).
8. Publicar `dist/motor-city.html` en GitHub Pages de `motorcity` (rama `gh-pages`; hay que activar Pages en la configuración del repo).

## 6. Cómo comprobar que todo está bien
```bash
cd motorcity
node motor.mjs mundo && node motor.mjs run && node motor.mjs construir
node motor.mjs prueba --navegador                 # debe decir «✓ TODAS LAS PRUEBAS PASARON · 54 bien»
node motor.mjs sincronizar ../BicicletasUno --verificar   # «los archivos son iguales»
node motor.mjs sincronizar ../MetroZero --verificar
cd ../BicicletasUno && node tools/build.js && node tests/run.js      # «✓ TODAS LAS PRUEBAS PASARON»
cd ../MetroZero && node tools/build.mjs && node tools/test.mjs 100   # «RESULTADO: OK, 0 errores»
```
Capturas: `dist/motor-city.html` en Chromium con `--use-gl=swiftshader` (ver `pruebas/prueba.mjs`).

## 7. Trampas conocidas
- Los atributos `hidden` necesitan `[hidden]{display:none!important}` si el CSS pone `display`.
- `hex3()` acepta `#rgb`, `#rrggbb` y `rgba(...)`; `tono()` depende de él.
- Las capas de `valle.json` van en cuartos de casilla (×2,5 m); las de `alturas.json` y `sitios.bin`, en octavos (×1,25 m); `vias.bin`, en `tile / vq`. El Metro va en metros. **Todo eso ya está convertido en el MC4.**
- En `Mundo`, `meta.kx` está en **casillas** por grado; `mundo.kx`, en **metros** por grado.
- Run Scooter: un metro del corredor son `MC.Run.ESC` = 0,5 m reales. `RUNV.ponHill` reemplaza `HILL`, y el sombreador lee `uHR[64]`.
- La panorámica con pixel ajusta su escala; las etiquetas no se dibujan en el búfer del pixel.
