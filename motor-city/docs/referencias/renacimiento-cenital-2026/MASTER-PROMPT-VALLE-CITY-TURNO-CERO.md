# MASTER PROMPT DE INGENIERÍA: REFACTORIZACIÓN MOTOR VALLE/CITY, SANEAMIENTO GIS Y TURNO CERO

> **Instrucciones de uso:** Copia todo el contenido de este bloque (desde `## ROL Y MISIÓN` hasta el final) y entrégalo a tu IA de desarrollo (Claude Code, Cursor, Gemini CLI, Codex, etc.) con acceso a los repositorios `MetroZero` y `BicicletasUno`. Adjunta o guarda el archivo `investigacion_tecnica_motor_valle.md` en `docs/` para que la IA lo use como especificación de referencia.

---

## ROL Y MISIÓN

Actúa como un **Arquitecto Principal de Motores de Videojuegos Web/Móvil e Ingeniero GIS Senior**. Tu misión es auditar, corregir, refactorizar y evolucionar el motor compartido (`motor-valle` y `motor-city`) y el pipeline de datos cartográficos de los repositorios:
1. **`MetroZero`** (*El Metro · La última vuelta* + laboratorio de *Turno Cero*)
2. **`BicicletasUno`** (*Juega EnCicla*)

Tu objetivo es resolver de raíz el colapso visual y geométrico del mapa del Valle de Aburrá en la **vista libre cenital**, lograr una dirección artística híbrida 2D/3D coherente, realista en sus proporciones y fluida a $60\text{ FPS}$ en navegadores y WebView Android, e implementar de forma profesional el **modo de carreras retro pseudo-3D** (estilo *Free Gear* / *Sprint Club Nitro* mejorado) para *Turno Cero*.

---

## REGLAS INQUEBRANTABLES (RESTRICCIONES CRÍTICAS)

1. **CERO REGRESIONES EN MODOS EXISTENTES:**
   * En *Juega EnCicla* (`BicicletasUno`), **NO alteres ni rompas** los 9 oficios, los 27 turnos, los minijuegos específicos ni la estética editorial de revista. Intervén únicamente la vista libre cenital del Valle y su motor compartido.
   * En *El Metro* (`MetroZero`), **NO alteres ni rompas** la vista panorámica 2D del Metro, la cabina en primera persona, el modo Metrocable, la guía didáctica ni la historia de Rosalba. Intervén únicamente los modos **Ciudad Libre**, **Bus** y el motor compartido.
2. **COMPATIBILIDAD OFFLINE SINGLE-HTML:** Ambos proyectos se compilan a un solo archivo HTML offline (con empaquetado Android WebView). **Prohibido** introducir dependencias externas que requieran internet en tiempo de ejecución, servidores backend o frameworks pesados que inflen el bundle innecesariamente.
3. **SANEAMIENTO EN DATOS, NO PARCHES EN TIEMPO REAL:** No intentes ocultar edificios encima de calles con trucos frágiles durante el renderizado; corrige la geometría en el pipeline de generación de datos (`tools/`) antes de exportar `ciudad.js` y `valle.js`.
4. **EJECUCIÓN INCREMENTAL Y VERIFICABLE:** Nunca reescribas todo el repositorio de golpe. Primero audita el código existente, presenta el diagnóstico de archivos reales y ejecuta estrictamente **fase por fase**, validando que la compilación funcione al terminar cada fase.

---

## DIAGNÓSTICO DE PROBLEMAS RAÍZ A RESOLVER

1. **Edificios y casas invadiendo calles:** OpenStreetMap entrega ejes viales sin espesor; al ensanchar las calles para hacerlas jugables, los polígonos de lotes y edificaciones quedan superpuestos sobre el asfalto.
2. **Relieve SRTM roto en laderas:** La malla satelital ($\approx 30\text{ m/px}$) crea escalones en las montañas del Valle de Aburrá, dejando casas flotando por un borde o enterradas por el otro, y generando vías con dientes de sierra.
3. **Desbalance gráfico híbrido (2D/3D):** El paso desde un 2D cenital sin profundidad hacia un 3D básico produjo polígonos pobres sin dirección artística, sin sombras de contacto y con pérdida total de verosimilitud urbana.
4. **Falta de partición espacial y oclusión:** Renderizar geometría sin cuadrantes (*chunks*) ni desvanecimiento de edificios altos mata el rendimiento y tapa al jugador en zonas densas.
5. **Modo carreras 2D/pseudo-3D incompleto en *Turno Cero*:** El intento previo no implementó correctamente la proyección por segmentos con acumulación de curvas y recorte vertical de colinas (`maxY`), perdiendo la sensación de velocidad y profundidad de *Free Gear* / *Sprint Club Nitro*.

---

## ESPECIFICACIÓN TÉCNICA OBLIGATORIA

### Subsistema A: Pipeline de Saneamiento GIS (`tools/` $\to$ `valle.js`, `ciudad.js`, `rutas.js`)
Actualiza o crea el script de procesamiento cartográfico (Python con `shapely`/`numpy` o Node equivalente según el toolchain actual del repo) para cumplir estrictamente:
1. **Ley de Soberanía Vial (Diferencia Booleana):**
   * Genera polígonos viales con anchos jugables por jerarquía (`motorway`/`trunk`: $22\text{ m}$ + $3\text{ m}$ andén; `primary`: $15\text{ m}$ + $2.5\text{ m}$; `secondary`/`tertiary`: $11\text{ m}$ + $2\text{ m}$; `residential`: $8.5\text{ m}$ + $1.5\text{ m}$; `cycleway`: $3.5\text{ m}$ + $0.8\text{ m}$; viaducto Metro: $10\text{ m}$ + $2\text{ m}$).
   * Recorta **todos** los polígonos de edificios y lotes restando la unión vial y la máscara del Río Medellín / quebradas:
     $$B_i^{\text{limpio}} = B_i \setminus (M_{vial} \cup M_{agua})$$
   * Elimina remanentes con área menor a $16\text{ m}^2$ y simplifica vértices con tolerancia $\epsilon = 0.6\text{ m}$.
2. **Suavizado de Relieve SRTM y Zócalos:**
   * Suaviza longitudinalmente las cotas $z$ a lo largo de cada calle y unifica la cota exacta en cada intersección.
   * Precalcula la pendiente $g$ de cada segmento vial para que afecte la física real (esfuerzo en bicicleta, aceleración/frenado en autos y buses).
   * Calcula para cada edificio `zMin`, `zMax` y `height`, exportando una base con cimentación negativa (`zBase = zMin - 6m`) para que ninguna casa flote en las laderas.
3. **Capas Topológicas (`layer`):**
   * Etiqueta cada elemento con `layer`: `-1` (Río Medellín, quebradas, deprimidos), `0` (vías urbanas, ciclorrutas, edificios), `1` (viaducto Metro, puentes elevados), `2` (Metrocables, capa aérea). Marca explícitamente los nodos de transición (`ramp`).
4. **Biomas del Valle de Aburrá y Partición Espacial (*Chunking*):**
   * Clasifica los bloques por bioma (`centro`, `ladera_ladrillo`, `residencial_verde`, `industrial_rio`, `rural_montana`, y soporte para `costa` en *Turno Cero*).
   * Indexa toda la geometría exportada en cuadrantes espaciales de $250\text{ m} \times 250\text{ m}$ con clave `"cx,cy"`.

### Subsistema B: Motor Cenital Híbrido 2.5D (`motor-valle` y `motor-city`)
Refactoriza el renderizador cenital tomando como pilares combinados **GTA: Chinatown Wars** (claridad urbana, *cel-shading*, desvanecimiento de rascacielos), **Reckless Getaway 2** (terreno montañoso facetado, *tilt-shift* superior, props destructibles ligeros) y **GTA 2** (arquitectura 2.5D extruida en perspectiva real con entidades nítidas y luces nocturnas):
1. **Extrusión 2.5D en perspectiva sobre Canvas 2D puro (alto rendimiento):**
   * Proyecta los techos alejándolos del centro de cámara $(c_x, c_y)$ proporcionalmente a la altura $h$ y factor de perspectiva $k$:
     $$x_t = x_b + (x_b - c_x) \cdot h \cdot k, \qquad y_t = y_b + (y_b - c_y) \cdot h \cdot k$$
   * Implementa descarte de caras traseras (*back-face culling*) por producto cruzado 2D para dibujar solo fachadas visibles.
   * Aplica sombreado direccional constante en fachadas según normal de muro vs. dirección solar, más contornos oscuros sutiles (*cel-shading* limpio) y patrones pre-renderizados en `OffscreenCanvas` (ventanas, ladrillo, techos, asfalto, marcas viales) con `imageSmoothingEnabled = false` donde corresponda a estilo pixel.
2. **Lectura visual y profundidad:**
   * **Terreno y montañas:** Triangulación ligera facetada con *flat shading* y tonos escalonados por elevación en laderas altas.
   * **Sombras de contacto:** Dibuja siempre una sombra proyectada suave y una sombra de contacto oscura directamente bajo ruedas y pies.
   * **Desvanecimiento de oclusores (*Occluder Fade*):** Si el techo proyectado de un edificio alto cubre al jugador, reduce suavemente su opacidad a `0.30`.
   * **Orden estricto de capas:** Terreno/río (`-1`) $\to$ Vías base + marcas de frenado (`0`) $\to$ Sombras $\to$ Entidades (`0`) $\to$ Edificios ordenados radialmente (algoritmo del pintor) $\to$ Viaductos/puentes (`1`) $\to$ Cables/partículas/luces aditivas/`tilt-shift` superior (`2`).
3. **Cámara cenital elástica:**
   * Implementa seguimiento amortiguado (*spring-damped*), anticipación vectorial (*look-ahead* proporcional a velocidad) y **zoom dinámico por velocidad** (cercano a pie/bici lenta, amplio a alta velocidad).
4. **Física vehicular y de bicicletas mejorada:**
   * Descompón velocidad en eje longitudinal y lateral con coeficiente de agarre $\mu_{\text{lateral}}$ dependiente de superficie (asfalto, ciclorruta, adoquín, tierra, lluvia) y estado de derrape.
   * Integra la pendiente vial $g$ en la aceleración.
   * Implementa colisiones elásticas con deslizamiento contra edificios (nunca detención seca frustrante) y props urbanos destructibles ligeros (conos, señales, cercas).
   * Añade una asistencia angular muy sutil de alineación en carriles cuando el jugador conduce en cenital con controles táctiles/teclado.

### Subsistema C: Adaptación Limpia a los 3 Juegos
* **`BicicletasUno` (*Juega EnCicla*):** Conecta el nuevo `motor-valle` al recorrido libre, haciendo palpables las subidas/bajadas en la cadencia/energía, resaltando las ciclorrutas y manteniendo la paleta cálida y los 9 oficios intactos.
* **`MetroZero` (*El Metro*):** Conecta el nuevo `motor-city`/`motor-valle` a **Ciudad Libre** y **Bus**, garantizando que los viaductos del Metro (capa `1`) permitan circular libremente por debajo en capa `0`, que el Río Medellín (capa `-1`) se vea encajonado y limpio, y que las rutas $A^*$ jamás atraviesen edificios.
* **`Turno Cero`:** Estructura el juego en **cápsulas modulares** compartiendo un registro de vehículos/física:
  * Cápsula 1: Mundo Abierto Cenital (autos, derrape, persecuciones/retos, personaje a pie).
  * Cápsula 2: Carreras Retro Pseudo-3D (especificada en Subsistema D).
  * Cápsula 3 (interfaz preparada, sin saturar el núcleo): Garaje/colección 2D pixel, perfil físico de motos y capa aérea (`layer = 2`) para expansión futura.

### Subsistema D: Módulo de Carreras Retro Pseudo-3D (*Free Gear* / *Sprint Club Nitro* Mejorado)
Crea un módulo autocontenido (por ejemplo, `src/js/turno_cero_pseudo3d.js`) para *Turno Cero* con la arquitectura clásica de proyección por segmentos perfeccionada:
1. **Estructura de pista por segmentos (`segments[]`):** Segmentos de longitud fija (`segmentLength = 200`) con `p1`, `p2` (`{x, y, z}`), `curve`, `color` alternado por bandas (asfalto, pianos, berma, líneas), `sprites[]`, `cars[]` y `clip`.
2. **Colinas cosenoidales suaves y curvas acumuladas:** Implementa acumulación cuadrática (`x += dx; dx += seg.curve`) y fuerza centrífuga física proporcional a `(speed / maxSpeed) * seg.curve`.
3. **Renderizado obligatorio en Dos Pasadas con recorte `maxY`:**
   * **Pasada 1 (cerca $\to$ lejos):** Proyecta con $s = d / (p.z - camZ)$, descarta segmentos detrás de crestas (`p2.screen.y >= maxY`), registra `seg.clip = maxY`, dibuja trapezoides de terreno/pianos/asfalto/carriles + niebla de distancia en los últimos 45 segmentos, y actualiza `maxY`.
   * **Pasada 2 (lejos $\to$ cerca):** Dibuja rivales y sprites laterales recortando su parte inferior contra `seg.clip` para que emerjan realísticamente sobre las colinas.
4. **Acabado superior a *Free Gear* y *Sprint Club Nitro*:**
   * Parallax multicapa de 3 niveles (cielo, montañas del Valle de Aburrá, horizonte urbano) reactivo a `curve * speed` y elevación `camY`.
   * Sprites multi-estado del auto jugador (recto, giro suave, giro brusco $\times$ plano/subida), vibración de suspensión en bermas, partículas y minimapa del circuito.
   * Mecánica de rebufo (*slipstream*) detrás de rivales y Nitro con expansión dinámica de $FOV$ ($100^\circ \to 116^\circ$), líneas de velocidad y sacudón breve de cámara.
   * Incluye al menos 2 circuitos jugables completos de demostración (ej. *Subida a Las Palmas* con colinas y curvas enlazadas, y *Autopista Regional Nocturna* con alta velocidad y arcos/puentes).

---

## PROTOCOLO DE EJECUCIÓN POR FASES

Debes trabajar estrictamente en este orden y **detenerte al final de cada fase** para mostrar resumen de cambios, resultados de pruebas y pedir confirmación antes de pasar a la siguiente:

1. **FASE 0 — Auditoría Real del Repositorio (Solo lectura):**
   * Inspecciona la estructura real de carpetas y archivos en `MetroZero` y `BicicletasUno` (`motor-valle/`, `motor-city/`, `src/js/`, `src/data/`, `tools/`, scripts de build).
   * Reporta exactamente: qué archivos renderizan el mapa actual, cómo se generan `ciudad.js` y `valle.js`, cómo se compila el HTML único, qué partes son compartidas entre ambos repos y qué archivos pertenecen a los modos protegidos que **no** se tocarán.
2. **FASE 1 — Pipeline de Saneamiento GIS y Validación Geométrica:**
   * Implementa el script de limpieza booleana, suavizado SRTM, zócalos, capas `Z`, biomas y chunking de $250\text{ m}$.
   * Ejecuta una prueba automatizada que verifique: $0$ intersecciones entre polígonos de edificios y corredores viales, y tamaño del archivo JS dentro de presupuesto móvil.
3. **FASE 2 — Refactorización del Motor Cenital Híbrido 2.5D (`motor-valle` + `motor-city`):**
   * Implementa el nuevo renderizador 2.5D con extrusión, *back-face culling*, sombreado direccional, *occluder fade*, sombras de contacto, cámara elástica, física con pendiente/derrape y partición por chunks.
4. **FASE 3 — Integración y Pruebas de Regresión en *El Metro* y *Juega EnCicla*:**
   * Conecta el motor refactorizado a los modos libres de ambos juegos y compila los HTML finales.
   * Verifica que cabina, vista panorámica, Metrocable, oficios de EnCicla y rutas $A^*$ sigan operando sin errores de consola.
5. **FASE 4 — Implementación del Motor Pseudo-3D (*Free Gear* Mejorado) en *Turno Cero*:**
   * Construye el módulo de carreras por segmentos con doble pasada, recorte `maxY`, parallax del Valle, IA de rivales, nitro/rebufo y los 2 circuitos base.
6. **FASE 5 — Integración Modular de *Turno Cero* y Optimización Móvil:**
   * Conecta el selector de cápsulas (Mundo Abierto Cenital $\leftrightarrow$ Carreras Pseudo-3D), agrega controles táctiles responsivos para Android WebView y verifica estabilidad a $60\text{ FPS}$.

---

## CRITERIOS DE ACEPTACIÓN (DEFINITION OF DONE)

- [ ] **0 edificios o lotes superpuestos sobre calles, avenidas, ciclorrutas o el Río Medellín** (verificado por script geométrico).
- [ ] **0 casas flotantes en laderas** gracias a zócalos de cimentación negativa y suavizado longitudinal de vías SRTM.
- [ ] **Capas $Z$ funcionales:** los vehículos y bicicletas circulan bajo el viaducto del Metro y sobre puentes del río sin colisiones falsas.
- [ ] **Estética híbrida coherente:** sombras de contacto, iluminación direccional consistente, desvanecimiento de rascacielos oclusores y bruma/*tilt-shift* superior.
- [ ] **Modos existentes 100% intactos** y compilación exitosa a HTML único offline en ambos repositorios.
- [ ] **Modo Pseudo-3D en *Turno Cero*** con curvas fluidas, colinas con recorte vertical exacto (`maxY`), rivales que asoman correctamente tras las crestas, parallax, nitro y rebufo a $60\text{ FPS}$.

---

## PRIMERA ACCIÓN REQUERIDA AHORA MISMO

Comienza ejecutando únicamente la **FASE 0 (Auditoría Real del Repositorio)**. No modifiques ningún archivo todavía. Lee los directorios, scripts de build y archivos de `motor-valle`, `motor-city` y `tools/`, y preséntame el mapa técnico exacto del código actual junto con tu plan detallado de archivos a crear/modificar para la Fase 1.