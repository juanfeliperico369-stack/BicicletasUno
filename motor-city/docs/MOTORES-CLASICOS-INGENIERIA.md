# Ingeniería inversa limpia de motores clásicos livianos para Motor City (4.0.3+)

> **Pedido del autor (21‑nov‑2026):** investigar motores viejos y descontinuados que hoy resultan diminutos pero extraordinariamente potentes frente a las proezas técnicas que lograron en su época, documentar cómo los explotaron los mejores videojuegos y adaptar sus algoritmos —en sala limpia y sin dependencias— a **Motor City** y *Turno Cero*.

---

## 1. Marco legal y de ingeniería inversa limpia (*clean-room*)

Antes de tocar una sola línea del motor, Motor City respeta una regla innegociable (`CONTEXTO-RELEVO.md` § 7 y `.claude/skills/motor-city-revision-ia/`): **jamás se copia código propietario, filtrado ni con licencias virales incompatibles (GPLv2 / AGPL / no-comercial)** dentro de `dist/motor.js`. Lo que sí se adopta es **ingeniería inversa algorítmica en sala limpia**: estudiar publicaciones oficiales, *postmortems*, libros técnicos (*Graphics Programming Black Book*, análisis de Fabien Sanglard, charlas GDC) y reimplementar desde cero las **estructuras de datos, trucos matemáticos y arquitecturas** en JavaScript/WebGL2 sin dependencias.

| Motor clásico / descontinuado | Año / Hardware objetivo | Juegos legendarios | Licencia del código fuente | Qué se puede usar en Motor City |
|---|---|---|---|---|
| **RenderWare 3.x** (Criterion) | 2000–2005 · PS2 (32 MB RAM, 4 MB VRAM) | *GTA III, Vice City, San Andreas*, *Burnout 3: Takedown*, *Bully* | Propietaria (descontinuado por EA) | **Solo algoritmos en sala limpia:** `CStreaming` con presupuesto estricto de RAM, sectores `.IPL`/`.IMG`, LOD/impostores, pools de chispas |
| **id Tech 1 / 2 / 3** (id Software) | 1993–1999 · 486 / Pentium II (8–64 MB RAM) | *Doom*, *Quake*, *Quake II*, *Quake III Arena* | GPLv2 (código liberado; viral) | **Solo algoritmos en sala limpia:** BSP/rejilla PVS con bitset RLE, *lightmaps* y AO horneado por vértice, pases de shader ligeros |
| **Build Engine** (Ken Silverman) | 1996 · Pentium 90 MHz (16 MB RAM) | *Duke Nukem 3D*, *Blood*, *Shadow Warrior* | Propietaria no comercial | **Solo algoritmos en sala limpia:** oclusión por portales 1D en pantalla (`xSpan`/`yMin–yMax`), pisos/techos inclinados y *props* vóxel |
| **Voxel Space** (NovaLogic / Appeal) | 1992–1999 · 386/Pentium sin GPU | *Comanche: Maximum Overkill*, *Delta Force*, *Outcast* | Algoritmo público (implementación de referencia MIT: `s-macke/VoxelSpace`) | **Algoritmo libre / sala limpia:** raycaster 2.5D de mapa de alturas con búfer de horizonte `yBuf` (60 FPS en Canvas 2D sin WebGL) |
| **Motor Reflections (*Driver*)** | 1999 · PlayStation 1 (**2 MB RAM**, 1 MB VRAM) | *Driver: You Are the Wheelman*, *Driver 2* | Propietaria (cerrada) | **Solo algoritmos en sala limpia:** transmisión de cuadrículas urbanas mínimas, suspensión blanda de 4 esquinas con transferencia de peso y derrape cinematográfico |
| **GOAL** (Naughty Dog) | 2001 · PS2 (32 MB RAM) | *Jak and Daxter: The Precursor Legacy*, *Jak II/3* | Propietaria (reimplementación comunitaria OpenGOAL ISC/MIT de herramientas) | **Solo algoritmos en sala limpia:** streaming continuo de dos niveles sin pantallas de carga, prefetcheo predictivo según vector de velocidad y arena fija |
| **Motor Team ICO (PS2)** | 2005 · PS2 (32 MB RAM) | *ICO*, *Shadow of the Colossus* | Propietaria | **Solo algoritmos en sala limpia:** pseudo-HDR sin FP16, impostores lejanos, capas *shell* y escalador dinámico de resolución para sostener FPS |
| **Motor Team Silent (*Silent Hill*)** | 1999 · PS1 (**2 MB RAM**) | *Silent Hill* | Propietaria | **Solo algoritmos en sala limpia:** fusionar el muro de niebla con el plano de corte lejano (`farPlane = fogEnd`), recortando >70 % de polígonos |
| **Unreal Engine 1** (Tim Sweeney) | 1998 · Pentium II / 3dfx Voodoo (32 MB RAM) | *Unreal*, *Unreal Tournament*, *Deus Ex* | Propietaria | **Solo algoritmos en sala limpia:** zonas con portales, iluminación coloreada suave precalculada, texturas procedurales animadas de agua/fuego en KB |
| **Cube 2 / Irrlicht / Torque 3D** | 2001–2012 · PC/OpenGL ES | *Sauerbraten*, *Tribes 2*, cientos de indies | **zlib (Cube 2, Irrlicht) / MIT (Torque 3D)** | **Código y arquitecturas compatibles:** octree de cubos, grafo de escena compacto, LOD de terreno y red ligera (referencia auditable legalmente) |

---

## 2. Qué locuras lograron con 2–32 MB de RAM (y por qué le resuelven la vida a Motor City hoy)

Motor City 4.0.3 ya probó en Chromium móvil que el gran cuello de botella no es la falta de ideas sino **la memoria y el sobre-dibujo**: Manhattan entero ocupa **~201–215 MB de JS Heap**, y viajar de Manhattan a Medellín en una misma sesión dispara la memoria a **258,9 MB (`316 MB` reservados)** si no se evacúa el mundo previo (`reportes/2026-11-21-gemini-revision-pr7.md`).

Los motores clásicos resolvieron exactamente estos mismos problemas en consolas con **10× a 100× menos RAM** que un celular actual:

### 2.1 RenderWare 3.x (*GTA III / Vice City / San Andreas* y *Burnout 3*)
- **La hazaña:** *GTA San Andreas* metió 3 metrópolis, desierto, bosque, montañas, tráfico, peatones, radio y aviones en **32 MB de RAM total de PS2** (y *Burnout 3* mantuvo **60 FPS clavados** con autos deformables y cientos de chispas).
- **Cómo lo hicieron:**
  1. **`CStreaming` con presupuesto rígido (LRU + anillo predictivo):** cada bloque de mapa (`.IPL`) y paquete de mallas/texturas (`.IMG`) tenía prioridad por distancia **adelantada al vector de velocidad** del carro. Si el búfer de streaming alcanzaba el tope (p. ej. 12–16 MB), se expulsaban primero los sectores detrás de la cámara y nunca se mantenían dos ciudades completas residentes en RAM.
  2. **Impostores LOD de bloque:** a más de 180–250 m los edificios no se enviaban como mallas individuales; se sustituían por una sola malla gruesa de silueta (`LOD` de manzana) fusionada con la niebla atmosférica.
  3. **Pools preasignados sin *garbage collection* (*Burnout 3*):** chispas, humo, fragmentos y marcas de frenado vivían en arreglos circulares fijos (`Struct-of-Arrays`). Cero `new Object()` por cuadro → cero pausas de latencia.
- **Adaptación a Motor City:** `MC.Sectores1km` (`js/10-sectores.js`) + `MC.Planeta` (`js/13-planeta.js`) → evacuar el mundo anterior al cambiar de ciudad, limitar el anillo activo a un presupuesto en KB (`StreamAnillo`), y reemplazar `G.humo`/`G.caidos` por pools de `Float32Array` (`PoolParticulas`).

### 2.2 id Tech 2 y 3 (*Quake* / *Quake III Arena*)
- **La hazaña:** escenas 3D complejas a 60+ FPS en CPUs de 133–400 MHz con iluminación atmosférica rica sin sombras dinámicas costosas.
- **Cómo lo hicieron:**
  1. **PVS (*Potentially Visible Set*):** precalcular, para cada celda del mapa, un **mapa de bits (`Uint32Array`)** indicando qué otras celdas pueden verse desde ahí (comprimido con RLE). En tiempo real, saber si una manzana entera puede verse cuesta **una operación de bit `O(1)`**.
  2. **Iluminación horneada (*Lightmaps* / oclusión ambiental por vértice):** en vez de calcular iluminación global cada cuadro, las esquinas y callejones se oscurecen una sola vez al cargar el sector.
- **Adaptación a Motor City:** `PVSRejilla` + `LuzHorneada` en `js/45-gl.js` y `js/45-glb.js`: oscurecer automáticamente las bases y callejones estrechos de Manhattan y Medellín según la altura de edificios vecinos da profundidad instantánea incluso a modelos *low-poly* sin texturas PBR.

### 2.3 Build Engine (*Duke Nukem 3D* / *Blood*) y *Silent Hill* (PS1)
- **La hazaña:** *Duke Nukem 3D* dibujó calles, cines, ventanas, espejos y pisos inclinados por software puro; *Silent Hill* dibujó un pueblo entero en **2 MB de RAM** de PS1.
- **Cómo lo hicieron:**
  1. **Oclusión por horizonte/portal 1D (Build):** al recorrer muros de adelante hacia atrás (*front-to-back*), el motor mantiene un arreglo 1D de columnas de pantalla ya tapadas. En un cañón de rascacielos como Manhattan, los edificios de la primera fila tapan el **65–85 %** de los edificios detrás: el motor ni siquiera proyecta sus vértices.
  2. **Muro de niebla = plano lejano (*Silent Hill*):** nunca gastar vértices ni relleno más allá del radio donde la niebla alcanza opacidad 100 %. En tormenta, lluvia nocturna de Manhattan o neblina de la Autopista del Embalse, acercar `farPlane` junto con la densidad de niebla multiplica el rendimiento gratis y potencia la atmósfera.
- **Adaptación a Motor City:** `CulleoUrbano` (`frustum` + `fogEnd` + oclusión angular 1D por columnas) directamente antes de construir la lista de dibujo de edificios en `js/45-gl.js` y `MC.Raster`.

### 2.4 Voxel Space (*Comanche* / *Outcast*)
- **La hazaña:** montañas orgánicas, valles, islas y agua en 3D real **sin tarjeta aceleradora 3D**, en 1992–1999.
- **Cómo lo hicieron:** cada columna vertical de pantalla lanza un rayo de adelante hacia atrás sobre un mapa de alturas + mapa de color 2D, guardando la altura máxima ya dibujada (`yBuf[col]`). Cada píxel se escribe como máximo una vez en un `Uint32Array` (`ImageData`).
- **Adaptación a Motor City:** `VoxelTerreno` como **modo panorámico / vista de helicóptero o respaldo 2.5D ultrarrápido** sobre el relieve SRTM real de Guatapé, el embalse y la Autopista del Embalse cuando el celular no tiene WebGL fluido (60 FPS puros en CPU).

### 2.5 *Driver* (Reflections, PS1 1999) y *Shadow of the Colossus* (PS2)
- **La hazaña:** *Driver* metió Miami, San Francisco, Los Ángeles y Nueva York con física de persecución cinematográfica de cine de los 70 en **2 MB de RAM**; *Shadow of the Colossus* sostuvo horizontes gigantescos y colosos escalables en PS2.
- **Cómo lo hicieron:**
  1. **Suspensión blanda de 4 resortes + transferencia de peso (*Driver*):** aunque la colisión física del chasis sigue siendo una caja/círculo 2D liviano, un modelo acoplado de 4 esquinas calcula cabeceo (*pitch*) al frenar/acelerar y balanceo (*roll*) al girar con ángulo de deriva (*slip angle*). El resultado visual y táctil transmite peso real de muscle-car/sedán con apenas 15 operaciones flotantes por cuadro.
  2. **Escalador dinámico de presupuesto (*Shadow of the Colossus*):** un lazo cerrado mide el promedio móvil de tiempo de cuadro (`ms`) y ajusta suavemente la resolución interna (`DPR` efectivo `0,55×–1,5×`) y la distancia de niebla para proteger los 60 FPS en lugar de dejar que el juego caiga a tirones.
- **Adaptación a Motor City:** `FisicaDriver` conectado a la matriz de inclinación visual de carros en `js/45-glb.js` / `js/32-fisica.js`, y `EscaladorDinamico` sobre el `dEf` que ya maneja `MC.Vistas` (`js/40-vistas.js`).

---

## 3. Implementación en sala limpia entregada y probada en este repositorio

Todos los algoritmos anteriores ya fueron **implementados desde cero (sin librerías ni código ajeno)**, verificados con pruebas unitarias en Node y demostrados en vivo en un laboratorio jugable sin internet:

| Archivo | Qué entrega | Cómo probarlo |
|---|---|---|
| [`experimentos/tecnicas-clasicas/mc-clasico.js`](../experimentos/tecnicas-clasicas/mc-clasico.js) | Módulo modular (`MCClasico`, estilo `/* */` sin comentarios `//`, cero dependencias) con los 6 subsistemas: `StreamAnillo`, `CulleoUrbano`, `PVSRejilla`, `LuzHorneada`, `VoxelTerreno`, `FisicaDriver`, `PoolParticulas` y `EscaladorDinamico`. | Listo para integrarse como fragmento `js/` en Motor City 4.1+ |
| [`experimentos/tecnicas-clasicas/prueba-clasico.mjs`](../experimentos/tecnicas-clasicas/prueba-clasico.mjs) | Suite automatizada Node que verifica presupuesto estricto de RAM, tasa de descarte >60 %, compresión RLE exacta de PVS, proyección Voxel Space, estabilidad sin `NaN` de suspensión Driver, pool sin asignaciones y estabilización a 16,6 ms. | `node experimentos/tecnicas-clasicas/prueba-clasico.mjs` |
| [`experimentos/tecnicas-clasicas/laboratorio.html`](../experimentos/tecnicas-clasicas/laboratorio.html) | Laboratorio interactivo offline (`412×860` táctil y escritorio) con 4 modos jugables: cañón urbano con toggles en vivo, vuelo Voxel Space 60 FPS sobre Guatapé, simulador `CStreaming` RenderWare y catálogo de los 10 motores. | Abrir en navegador o GitHub Pages |

---

## 4. Plan de integración directa a Motor City 4.1 (para Claude y Codex)

1. **`js/13-planeta.js` + `js/10-sectores.js` (`C‑M34`):** integrar `StreamAnillo` para evacuar automáticamente la ciudad previa al viajar (`Manhattan → Medellín`: ahorra ~190 MB inmediatos) y priorizar precarga de sectores 1 km en la dirección de velocidad del carro.
2. **`js/45-gl.js` (`MC.GL` / `MC.Raster`):** integrar `CulleoUrbano` (muro de niebla = `farPlane` + horizonte angular 1D en cañones de Manhattan/Medellín) + `LuzHorneada` por vértice para bajar llamadas de dibujo 60–80 % y dar relieve arquitectónico inmediato.
3. **`js/32-fisica.js` + `js/45-glb.js`:** acoplar `FisicaDriver` (`pitch`/`roll` visual de carrocería al frenar y derrapar) y `PoolParticulas` (`Float32Array` circular sin GC) a las persecuciones de *Turno Cero*.
4. **`js/40-vistas.js`:** acoplar `EscaladorDinamico` a `dEf` con objetivo `16,6 ms` (60 FPS) o `33,3 ms` (modo ahorro) para evitar caídas bruscas en teléfonos gama baja.
5. **Vista panorámica / respaldo sin GPU:** conectar `VoxelTerreno` a la matriz de alturas SRTM del MC4 de Guatapé y Medellín como respaldo ultrarrápido de vista aérea/helicóptero en celulares sin WebGL rápido.
