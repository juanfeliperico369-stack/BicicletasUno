# Plan único · Juega EnCicla + El Metro

**Para Gemini (con Antigravity) y ChatGPT (con Codex) · 19‑nov‑2026 · Escrito por Claude, a pedido del autor (OneZero).**

> ## REGLA DE ENTREGA (obligatoria)
> **Entrega ABSOLUTAMENTE TODO en UN SOLO DOCUMENTO** (un archivo Markdown).
> - Ahí va el reporte de pruebas, las fallas, las ideas, el código y el arte.
> - Nada de entregas sueltas, varios archivos, enlaces a otros documentos ni «ver el chat».
> - Si algo no cabe completo, divídelo dentro del mismo documento en secciones numeradas.
> - El formato del documento está al final, en la sección 6.
>
> **Para que lo de EnCicla entre sin tocar el resto:** sigue [`docs/INTEGRAR.md`](INTEGRAR.md). Ahí está:
> - el registro de vehículos (`JE.vehiculos.registrar`) y el de modos (`JE.modos.registrar`);
> - la trama en datos (`contenido/guion/misiones.json`);
> - las reglas del arte, el mapa y las pruebas.

## 1. Los dos juegos y lo que comparten
| | Juega EnCicla | El Metro |
|---|---|---|
| De qué trata | Arcade de acción por actividades: los oficios reales de EnCicla, la bici pública del Valle de Aburrá | Juego contemplativo del Metro de Medellín, que sirve de guía para turistas: manejar, operar y pasear por la ciudad |
| Repositorio | `juanfeliperico369-stack/BicicletasUno` (la rama de trabajo más reciente) | `juanfeliperico369-stack/MetroZero` (rama `motor-valle`, que es la v1.4.0 más el motor) |
| Jugar | https://juanfeliperico369-stack.github.io/BicicletasUno/ | https://juanfeliperico369-stack.github.io/MetroZero/ |
| Código | `src/js/NN-nombre.js` (se juntan en orden) y `tools/build.js` → `dist/juega-encicla.html` | `src/js/NN-nombre.js` y `tools/build.mjs` → `dist/index.html` |
| Pruebas | `node tests/run.js` | `node tools/test.mjs` |
| Estado | `docs/BITACORA.md`, `docs/GUIA.md` y `dist/ENCICLA-TODO.md` | `docs/BITACORA.md`, `docs/PLAN.md` y `arte/06-guia-unica-ia.md` |

**El tercer juego, para tomar su jugabilidad: Run Scooter.**
- **Repositorio:** `juanfeliperico369-stack/RunRunZero`. Las ramas `main` y la de trabajo más reciente.
- **Jugar:** https://juanfeliperico369-stack.github.io/RunRunZero/
- **Qué es:** un corredor sin fin en 3D por la ciclovía, con scooter, bici, skate, patines y monopatín eléctrico; monedas, regalos y las páginas perdidas de EMSAY; funciona sin internet.
- Es del mismo autor: su jugabilidad y sus vehículos se pueden adaptar a los otros dos juegos (misiones M4 y M5).

**Lo que comparten: el mismo mapa.**
- Está en `motor-valle/` (contrato en `motor-valle/MOTOR.md`). Es la misma tubería y las mismas fuentes: OpenStreetMap vía Overture, capas oficiales de Medellín y relieve SRTM.
- EnCicla lo usa en casillas de 10 m (1 m = 1,6 px) y El Metro en casillas de 20 m (en metros).
- **Regla:** el mapa solo se cambia en `motor-valle/` del repositorio de EnCicla, con la versión subida en `VERSION.json`, y se copia al otro con `node motor-valle/sincronizar.mjs`.
- Todo lo demás es de cada juego, que es una obra aparte: módulos, mecánicas, trama, estilo y Easter eggs.

**Condiciones de los dos:**
- un solo HTML que funciona sin internet y sin librerías externas;
- textos en español de Colombia y fluido en un celular medio;
- atribución de OpenStreetMap (ODbL), Overture y las capas oficiales;
- nada de datos personales.

## 2. El reparto: dos trabajos con las mismas misiones
| Trabajo | Quién | Qué hace en cada misión |
|---|---|---|
| **Trabajo 1 · CÓDIGO** | **Gemini con Antigravity** | Prueba, encuentra fallas y escribe el código: mecánicas, modos, motor del mapa y pruebas. |
| **Trabajo 2 · ARTE** | **ChatGPT con Codex** | Diseña y produce el arte de la ciudad, los vehículos, los modos y los personajes, como código de dibujo (Canvas 2D, WebGL o SVG en línea), paletas y medidas. |

(Si el autor lo prefiere, los dos trabajos se intercambian. Las misiones son las mismas para los dos.)

Cada misión se hace para **los dos juegos**. El código y el arte de cada uno quedan separados: lo de EnCicla en su repositorio y lo de El Metro en el suyo.

## 3. Las misiones (iguales para los dos trabajos)

### M1 · Probar a fondo, encontrar fallas y proponer ideas innovadoras
- **Código:**
  - Corre las pruebas de cada juego y juega cada modo en un celular (412 × 915) y en un computador.
  - Reporta cada falla: pasos para reproducirla, lo esperado y lo que pasa, archivo y línea, gravedad y el arreglo propuesto en código.
  - Mide el rendimiento: cuadros por segundo en el centro de Medellín, con la cámara girada y lejos.
- **Arte:**
  - Revisa lo que se ve mal o no se entiende: textos encimados, colores sin contraste, íconos confusos o escalas equivocadas.
  - Por cada cosa, una captura descrita y su arreglo visual.
- **Ideas:** al menos 10 por juego, innovadoras y posibles en un HTML sin librerías, ordenadas por impacto y esfuerzo.

### M2 · El mapa único: terminar de detallarlo
- **Código** (en `motor-valle/`, según su hoja de ruta F2–F4):
  - Pasar al motor los generadores de capas de El Metro (vías, edificios, puentes, ciudad, rieles, Metroplús y rutas), con salida para los dos.
  - Escribir un solo cargador `motor-valle/js/valle.js` para los dos juegos.
  - Agregar los deprimidos o túneles (`is_tunnel`).
  - Hacer una cuadrícula de dos niveles para que el GPS no conecte un puente con la calle de abajo.
  - Ampliar la auditoría del mapa para medir los dos juegos con las mismas cifras.
- **Arte:**
  - Detallar el mapa: barrios de ladera, quebradas, parques, separadores, andenes, mobiliario, vegetación por zona, más lugares emblemáticos con su forma real, y noche y lluvia.
  - Entregar por cada elemento sus colores, medidas y el código para dibujarlo.

### M3 · Mejores gráficos en cada modo de juego
- **Código:** optimizar y mejorar el dibujo de cada modo, sin perder fluidez:
  - EnCicla: ciudad 3D, pixel clásico, vista panorámica, mapa grande y minijuegos de los oficios;
  - El Metro: cabina, Ciudad Libre, vista 3D, maqueta y Metrocable.
- **Arte:** una guía de estilo para cada modo con paleta, luz, sombras y tipografía en pantalla. Además, los diseños nuevos que falten:
  - escenarios de los minijuegos;
  - interiores de las estaciones;
  - pantallas de inicio y de resultado.

### M4 · RunScooter en los dos juegos: endless runner en bici, en primera y tercera persona 3D
Se toma la jugabilidad de *endless runner* de **Run Scooter** (`juanfeliperico369-stack/RunRunZero`, https://juanfeliperico369-stack.github.io/RunRunZero/, del mismo autor) y se adapta a cada juego. Se reutiliza su motor de carrera en 3D (carriles, saltos, obstáculos, monedas y regalos) y se pasa al mapa real:
- **Código:**
  - Un modo «carrera sin fin» en bici, en 3D con vista en **primera persona** (manubrio) y en **tercera persona** (detrás de la bici).
  - Corre por calles reales del mapa único: carriles, obstáculos, saltos, rampas, monedas u hojas, y un ritmo que acelera.
  - Funciona con el control táctil de los dos juegos y es fluido en un celular medio.
  - En EnCicla va por las ciclorrutas; en El Metro, a lo largo de las líneas y los corredores del Metroplús.
- **Arte:**
  - La bici y el ciclista vistos de atrás y en primera persona (manubrio y manos).
  - Obstáculos de Medellín: huecos, conos, motos, perros, chazas y charcos.
  - El horizonte del valle, las montañas en capas, la luz de cada hora y los efectos de velocidad.

### M5 · Más vehículos para un mundo abierto más jugable
- **Código:** se puede subir y bajar de cada vehículo en el mundo abierto, cada uno con su física y su sonido:
  - scooter, moto, carro, taxi, bus alimentador, bus del Metroplús, tranvía y metro (en El Metro);
  - en EnCicla, la bici, la bici eléctrica, el scooter, el camión de Balance y caminar;
  - de Run Scooter se traen el skate, los patines y el monopatín eléctrico, con su manejo, a los dos juegos.

  Hay reglas de tránsito y de dónde puede ir cada uno.
- **Arte:** cada vehículo visto desde arriba, en 3D en primera y tercera persona, y de lado, con su librea real cuando exista, luces de noche y su sombra.

### M6 · La trama del mundo abierto, con fragmentos cruzados
- **Código:** misiones del mundo abierto que usan los vehículos de M5 y el modo de M4.
  - Personajes que aparecen en los dos juegos, cada uno en su papel.
  - **Easter eggs cruzados:** fragmentos de la historia de El Metro escondidos en EnCicla, y al revés.
  - Un guion en datos (JSON) por juego.
- **Arte:** retratos de los personajes, escenas o cinemáticas, objetos de la trama y señales en el mapa para los Easter eggs.

## 4. Lo que pide Claude para Juega EnCicla (que es lo que Claude va a armar)
1. **Fallas:** la lista de M1 para EnCicla, con prioridad. Sobre todo:
   - los gestos de dos dedos en celulares reales;
   - los puentes y el viaducto (cuándo vas arriba o abajo);
   - el paseo guiado;
   - la velocidad elegible;
   - la calidad automática.
2. **RunScooter para EnCicla:**
   - el diseño del modo (reglas, puntaje, ritmo, obstáculos) y el código del modo;
   - el arte de la bici EnCicla (verde, con la canasta) en primera y tercera persona, como funciones de Canvas o WebGL autocontenidas.
3. **Vehículos de EnCicla:** scooter y bici eléctrica jugables, con sus sprites desde arriba (16 px por casilla, 1 m = 1,6 px) y en 3D.
4. **Mapa:** túneles y deprimidos (dibujo y datos) y la cuadrícula de dos niveles para los pasos elevados, con el diseño del cambio en `motor-valle/`.
5. **Trama:** misiones del modo libre de EnCicla con los fragmentos de El Metro para sus Easter eggs, en el formato de `contenido/guion/*.json`.
6. **Gráficos:**
   - la guía de estilo de la ciudad 3D de EnCicla para la noche, la lluvia y la niebla;
   - los interiores de las estaciones EnCicla;
   - mejores casas de ladera.

## 5. Después de la entrega
Claude arma lo entregado en Juega EnCicla: revisa, prueba, integra y publica la «revolución» (v2.0): HTML, APK y enlace. La IA de El Metro hace lo mismo en El Metro. El mapa sigue siendo uno solo, en `motor-valle/`.

## 6. Formato del documento único de entrega
1. **Resumen:** qué se hizo y qué falta.
2. **M1 a M6, cada una con:**
   - lo que se hizo;
   - el código completo de cada archivo nuevo o cambiado, con su ruta (`src/js/NN-nombre.js`) y su juego;
   - el arte como código de dibujo y especificaciones (paleta en hexadecimal, medidas en metros y en px);
   - cómo probarlo.
3. **Reporte de pruebas y fallas:** una tabla por juego.
4. **Ideas innovadoras:** por juego, ordenadas por impacto y esfuerzo.
5. **Lista de verificación:** qué se probó y en qué dispositivo.

**Todo en este único documento.**
