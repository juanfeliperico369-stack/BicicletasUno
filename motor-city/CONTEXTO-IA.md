# Contexto para la IA que retome Motor City

> **Léelo completo antes de tocar nada.** Si se te acaba el contexto, este documento, `MOTOR.md` y `BITACORA.md` bastan para seguir.
> Lo escribió Claude (Claude Code) el 19‑nov‑2026, a pedido del autor (OneZero). La 2.0 sigue el *Plan del Mundo Abierto*; la 2.1 y la 2.2, los pedidos que vinieron después (ver §3b).
> Ese plan está en `docs/PLAN-MUNDO-ABIERTO.md` de BicicletasUno, rama `ccr-bed2d98a-uho2kr`.

## 1. La misión en una frase
**Motor City** convierte cualquier lugar real (o inventado) en un mundo jugable con leyes reales, para Juega EnCicla, El Metro y los juegos que vienen. Cada juego conserva su forma de juego, su arte y su trama, y solo pone su piel. El nombre es solo «Motor City»: nada de «del Valle».

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
| Sincronización | ✅ | `herramientas/sincronizar.mjs` y `sincronizar.mjs` (el atajo). Copia el paquete a `<juego>/motor-city/` (desde la 2.1; `motor-valle/` queda como estaba en cada juego hasta que su IA migre). |
| Migración de los juegos al mundo 2.0 | ⏳ **Le toca a la IA de cada juego** | Las guías son `docs/MIGRACION-ENCICLA.md` y `docs/MIGRACION-ELMETRO.md`. |
| Arte y auditoría de Gemini y ChatGPT | ⏳ **Pedido** | `docs/PETICION-GEMINI.md` y `docs/PETICION-CHATGPT.md`. Cada uno entrega un solo documento; el autor se lo pasa a la IA del motor para unirlo y mejorarlo. |

**Cifras medidas** (Chromium sin GPU, CPU 4× más lenta, 412 × 860): mediana del dibujo en cenital 4,1 ms, ciudad 3D 8,6 ms, maqueta 17,8 ms y panorámica 7,3 ms. La vista WebGL en SwiftShader (por software) da 70–90 ms; con GPU real debe ser mucho menor, pero **hay que medirla en un celular**.

## 3b. Lo que se hizo en la 2.1 y la 2.2
| Pedido del autor | Estado | Dónde |
|---|---|---|
| Crear gráficos, craquear territorios y crear mundos nuevos | ✅ | `geo/territorio.py` (Guatapé de ejemplo), `MC.Generador`, `MC.Cosmos` (planetas, semillas en jerarquía como No Man's Sky) |
| Física, química, economía y matemáticas fieles | ✅ | `02-ciencia`, `03-economia`, `04-escala` (medidas reales), `36-taller`, con pruebas de valores conocidos |
| Personajes con biología; animales y alienígenas | ✅ | `35-seres` (Mifflin, Froude, Kleiber, genética, cuadrado‑cubo) |
| Vehículos | ✅ | 35 en el registro + `MC.Taller` (diseñar con ingeniería) + `MC.Desgaste` (reparar y mejorar) |
| Mundo vivo (NPC, día y noche, estaciones, tormenta, nieve, calor, niebla, tráfico) | ✅ | `24-ambiente`, `25-ia` (`MC.Poblacion` con rutinas) |
| Interiores procedurales distintos entre sí | ✅ | `48-interiores`: 8 estilos, cuartos opcionales, decoración y catálogo de 22 muebles |
| **La casa del jugador por su dirección**, y diseñarla | ✅ | `49-hogar` (`MC.Direccion` lee la nomenclatura colombiana y la ubica en el mapa real, sin internet; `MC.Hogar` diseña) |
| Talleres, tiendas, centros comerciales, bibliotecas y parques | ✅ | `82-lugares` |
| Historias procedurales: diversión, reflexión y conciencia | ✅ | `85-historias` (storylets, director de ritmo, encargos) |
| Ocurrencias (lo imprevisto) y retroalimentación | ✅ | `MC.Ocurrencias` |
| Solución a la tarjeta gráfica | ✅ | `05-gpu` (perfil, resolución dinámica, paso fijo) y `44-raster` (3D por software) |
| Puentes y dimensiones complicadas; cámara; vista lateral | ✅ | `32-fisica` (superficies, coyote), `34-camara` (resortes, brazo con choque, FOV y trauma), vista `lateral` (casa de muñecas que gira de a 90°) |
| Sprites, interfaz que no estorba, controles y sensibilidad | ✅ | `38-sprites`, `70-interfaz` (zonas, atenuación, cola, `verificar`), `37-manejo` |
| Música (electrónica, rock, jazz, lo‑fi y clásicos) | ✅ | `60-musica` |
| Minijuego, HTML y link web | ✅ | `juegos/mandados` → `dist/juegos/mandados.html` · <https://juanfeliperico369-stack.github.io/motorcity/> (Pages sirve `main`) |
| Documentos | ✅ | `docs/MANUAL.md`, `GUIA.md`, `INVESTIGACION.md`, `OPTIMIZACION.md`, `PLAN-IAS.md`, `PETICION-*.md` y `NEGOCIO-Y-USOS.md` |
| Repo abierto a las IAs de los juegos, con reportes | ✅ | `CONTRIBUIR.md`, `AGENTS.md`, `reportes/`, `node motor.mjs reporte` |
| **2.3 · SimCity, Los Sims, Cities: Skylines y Townscaper** | ✅ | `39-sombras` (sol por hora), `27-mobiliario` (props y luces), fachadas WFC (`14-ondas`), `26-urbe` (ciudad y capas de datos), `86-necesidades` (objetos inteligentes), `61-sonido` (paisaje sonoro). Mandados con modo alcalde. |
| **2.4 · Montañas, rocas, agua (lagos, ríos, playa, mar) y límites de paso** | ✅ | `15-terreno` (agua, pendiente, reglas de paso, obstáculos), `28-naturaleza`, lagos en `12-generador`, agua y roca en `40-dibujo`; `MC.Cuerpo` vadea, nada y dice por qué no pasa |
| **2.5 · Entrar al agua** | ✅ | `MC.Cuerpo`: `bajarse`, `montar`, `_nadar` (buceo y aire), `embarcar` y `desembarcar`; poses `nada` y `bucea`; tono bajo el agua (`Vistas._bajoAgua`) |
| **Un solo documento con todo** | ✅ | `docs/DOCUMENTO-UNICO.md` (contexto, código a usar y plan de cada IA) y `dist/MOTOR-CITY-TODO.md` (con anexos; `node motor.mjs documento`) |

## 4. Decisiones que no hay que deshacer sin motivo
1. **El mundo 2.0 junta los datos ya generados** por los dos juegos, que comparten el mismo origen. Así no hacen falta los 190 MB de fuentes ni Python para tener el mundo. La tubería `geo/` sigue para regenerar desde cero (y ya acepta otra ciudad con `CIUDAD=ciudades/x.json`).
2. **Todo en metros** desde el origen de la ciudad. EnCicla convierte con 1 m = 1,6 px (`MC.ValleCompat.desdeMundo(m, 16)`).
3. **`js/valle.js` no se toca:** es el lector 1.2.0 que incluye EnCicla, y sus pruebas exigen esa versión. `construir.mjs` solo empaqueta los fragmentos numerados.
4. **Las losas (160 m) son el mismo mapa en todas las vistas.** También son el piso de WebGL.
5. **La panorámica mira el fondo por un eje suavizado** que pasa por el jugador. Si se usa el rumbo de cada punto, las montañas saltan en las esquinas.
6. **Run importa RunRunZero casi idéntico con parches comprobados.** Si RunRunZero cambia y un parche no calza, el importador lo dice y no escribe nada. No se copian su interfaz ni su guardado.
7. **Una sola red (`rueda`)** para el tráfico, la panorámica y Run, filtrando por tipo de vía.
8. **Determinismo compartido:** el clima, los trenes y los semáforos salen de la fecha y la hora. Dos juegos abiertos a la misma hora ven lo mismo.
9. **Privacidad de Mi casa:** la dirección se resuelve en el aparato contra las calles del mapa. Solo se guarda si el jugador marca «recordar», y nunca va en reportes (`Ocurrencias.exportar` redondea posiciones a 50 m).
10. **El arte nuevo entra por `MC.Sprites` con respaldo:** si falta un cuadro, se dibuja el procedural y se anota en `MC.Sprites.faltan`.
11. **Pages sirve la rama `main`** del repo (con `.nojekyll` e `index.html` de portada). Lo que se quiera en la web debe llegar a `main`.

## 5. Lo que falta o se puede mejorar (en orden de valor; el plan completo está en `docs/PLAN-IAS.md`)
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
8. ~~Publicar en GitHub Pages~~ Hecho: <https://juanfeliperico369-stack.github.io/motorcity/>.
9. **2.3:**
   - unir lo que entreguen Gemini (sprites, muebles por estilo, lugares) y ChatGPT (auditoría, storylets, accesibilidad);
   - vista frontal de la casa en la lateral;
   - redes precalculadas;
   - losas en un *Worker*.

## 6. Cómo comprobar que todo está bien
```bash
cd motorcity
node motor.mjs mundo && node motor.mjs run && node motor.mjs construir
node motor.mjs prueba --navegador                 # debe decir «✓ TODAS LAS PRUEBAS PASARON · 123 bien»
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
- **Nombres repetidos en el cierre único:** todos los `js/NN-*.js` comparten un solo ámbito. Antes de declarar `const ESTILOS` o `const ACTIVIDADES`, busca si ya existe (pasó con la música y con los lugares).
- La vista lateral recorta la caja visible a una franja de profundidad (`E._franja`): sin eso, con `k` cerca de 0, la caja se va al infinito.
- `MC.Vistas.motor3d`: `'auto'` usa el raster si el WebGL es por software (SwiftShader en las pruebas); `'gl'` lo fuerza; `'raster'` también.
- **El agua se analiza una vez por mundo** (`MC.Terreno.agua`, 0,3–1 s). Los juegos la llaman al cargar; si no, la primera vez que alguien toca agua se nota un tirón.
- **Sobre la vía** el edificio solo bloquea si uno se mete más de 1 m en su huella (los datos se solapan con la calle), y la pendiente no bloquea. Fuera de la vía, sí.
- **Comentarios `//` en líneas largas de una sola instrucción** cortan el resto de la línea: usa `/* … */` dentro del código.
- En las pruebas de Node no hay `document`: `MC.GPU.perfil()` da `'sin-pantalla'` y `MC.UI.crear` devuelve `null`.
