# Tareas de cada IA · Motor City 2.9

> **Si te dijeron «mira el repositorio y haz tu parte», empieza aquí.**
> 1. Busca abajo **quién eres** y haz **solo tu parte**, en el orden indicado.
> 2. El contexto completo, el código exacto y las reglas están en `docs/DOCUMENTO-UNICO.md` (léelo entero). Lo que ya se hizo y lo que falta está en `docs/PEDIDOS.md`.
> 3. Al terminar, informa en 5–10 líneas: qué hiciste, cómo lo probaste, qué aprendiste y qué falta.

**Reparto desde noviembre de 2026, por decisión del autor:**
- **Gemini con Antigravity** trabaja por ahora con **«hydrogen»** (ya no con «argon»). Le tocan las **tareas fáciles**: revisar, medir, reunir datos y referencias.
- **ChatGPT con Codex** sigue con **«astra»** y genera mejores imágenes. Le tocan las **tareas fuertes**: el arte realista a escala y el código difícil.

**La guía de referencias (2.8):** `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`, la entrega del autor con 25 fichas. Tiene el peso, la vida, la arquitectura portable y el rendimiento en móvil. Su resumen, con lo que ya está en el motor, está en `docs/INSPIRACION-VISUAL.md` §1.

**Los estilos (2.7):**
- **realista familiar** (por defecto);
- **cómic, manga, anime, novela gráfica, ukiyo-e y acuarela** (`MC.estilo`).

De las obras con derechos se toman las **técnicas**; el arte que se copia es de **dominio público** (`docs/INSPIRACION-VISUAL.md`). **Peso y vida:** `MC.Vida`. **Motores potentes:** `docs/MOTORES-POTENTES.md`.

**El estilo realista familiar (2.6):**
- Para todo público, pero con la ciudad como es:
  - asfalto gastado, con parches, grietas y alcantarillas;
  - andenes de baldosa con bordillo;
  - pasto con parches secos;
  - tejas de barro y planchas de concreto con humedad;
  - muros con la base sucia;
  - árboles con volumen (guayacanes florecidos, ceibas, mangos).
- Nada de caricatura plana. Nada de violencia, sangre ni marcas.
- El estilo clásico (plano) sigue disponible: `MC.estilo = 'clasico'`.

---

## Gemini · Antigravity («hydrogen») · tareas fáciles
> **Entregado el 20‑nov‑2026 (G‑H1…G‑H8):**
> - `reportes/2026-11-20-gemini-*.md` (capturas, revisor de arte y pruebas);
> - `arte/referencias/` (6 láminas);
> - `contenido/datos-gemini.json` (30 datos);
> - `arte/gemini/iconos-ui.json`;
> - `arte/dominio-publico/candidatas.md` (40 obras);
> - la auditoría de los reels en `docs/INSPIRACION-VISUAL.md` §1.1.
>
> Claude corrigió lo que encontraron las capturas (botones y zona libre, aviso desfasado, ventanas en casas de un piso, cubiertas flotantes, cebras cruzadas, botón «Comprar» y burbuja de la casa) y sacó las paletas de las obras colombianas.
>
> **Lo que sigue para Gemini:**
> - **G‑H7**: los 13 enlaces y las 7 fichas que solo describe su informe;
> - **G‑H9**: la medición en un celular real;
> - **G‑H1 otra vez** sobre la 2.8, con `node motor.mjs capturas`.

Cada tarea es corta y se puede comprobar. Si algo pide más que esto, **déjalo anotado para ChatGPT** y no lo hagas.

| Id | Tarea | Cómo | Entrega |
|---|---|---|---|
| **G‑H1** | **Revisión visual con capturas** | `node motor.mjs construir` y `node motor.mjs capturas`. Saca 14 fotos de Mandados: 4 vistas × 3 horas, más la capa de valor y Mi casa. Para cada foto responde: ¿se lee el personaje? ¿algo tapa el centro? ¿los árboles están de pie en la maqueta y la lateral? ¿la noche se ve bien? ¿hay algo que se vea de caricatura o fuera de escala? | `reportes/AAAA-MM-DD-gemini-capturas.md`, con una tabla foto → hallazgo → gravedad (alta, media o baja). |
| **G‑H2** | **Revisor de arte** | `node motor.mjs revisar-arte arte/<paquete>` sobre cada paquete que llegue (empieza por `arte/gemini`, que hoy tiene 21 cuadros fuera de la imagen). | La salida pegada en un reporte y una lista de qué debe corregir quien lo hizo. |
| **G‑H3** | **Láminas de referencia** (Nano Banana) del estilo realista familiar | 6 escenas, sin texto ni logos, vistas como la maqueta 2:1:<br>1. una calle de Guatapé con zócalos de colores;<br>2. una ladera de Medellín con escaleras;<br>3. la orilla del embalse;<br>4. una noche con lluvia y charcos;<br>5. una plaza con guayacanes florecidos;<br>6. un taller de barrio. | `arte/referencias/` (PNG). Son **solo referencia** para ChatGPT y no van al juego. |
| **G‑H4** | **30 datos verificables** de Guatapé y Medellín (geografía, naturaleza, historia, movilidad) | Una frase corta cada uno, **con su fuente** (enlace). | `contenido/datos-gemini.json`: `[{ "texto", "fuente", "lugar", "tema" }]` |
| **G‑H5** | **Íconos a botones** | Elige qué ícono de `arte/gemini/iconos.json` va en cada botón de Mandados (Vista, Vehículo, Sonido, Agua, Mi casa, Ciudad, Ajustes, saltar y turbo). | `arte/gemini/iconos-ui.json`: `{ "boton": "icono" }` |
| **G‑H7** | **Verifica las referencias que faltan**: los 13 enlaces de Instagram que siguen sin verificar y las 7 fichas que solo describe tu informe (R02, R03, R04, R08, R09, R13 y R18 en `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md` §4) | Para cada uno: qué se ve, qué estilo es (cómic, manga, anime, realista…), qué da sensación de peso o de vida y qué técnica parece usar. | Una tabla en `docs/INSPIRACION-VISUAL.md` §1, una fila por reel. |
| **G‑H8** | **40 obras de dominio público** para paletas, al menos 10 colombianas (Comisión Corográfica, Epifanio Garay, Ricardo Acevedo Bernal, grabados del *Papel Periódico Ilustrado*…) | Para cada una: el enlace en Wikimedia Commons y su licencia. Solo dominio público. | Una lista en `arte/dominio-publico/candidatas.md`. Claude saca las paletas. |
| **G‑H9** | **Medición en un celular real**, con el autor | En Mandados, ⚙️ Ajustes → 📈 Telemetría. 5 minutos por vista (cenital, maqueta, lateral) y por calidad (baja, media, alta). Anota el modelo del celular, los fps, el p95 y si se calienta. | Una tabla en `reportes/AAAA-MM-DD-gemini-celular.md`. |
| **G‑H6** | **Pruebas y reporte** | `node motor.mjs prueba --navegador`, y en cada juego sus pruebas (ver su `TAREAS-IA.md`). | Un reporte con lo que pasó y lo que falló, sin corregir código. |

**No es tu rol:** cambiar el código del motor, hacer atlas grandes o arreglar fallas. Eso es de ChatGPT y de Claude.

---

## ChatGPT · Codex («astra») · tareas fuertes
> **Entregado el 20‑nov‑2026 (2.7.1, unido en la 2.9):**
> - el arte C‑A1…C‑A9 (`arte/chatgpt/`);
> - el código C‑M1, C‑M13 (la maqueta va en 22 ms; la meta de 20 sigue abierta), C‑M15, C‑M16, C‑M17, C‑M18 y C‑M19.
>
> **Lo que sigue, en orden:**
> 1. **C‑M13**: bajar de 20 ms, también en los estilos cómic y 1 bit (hoy 28 y 37 ms en Mandados);
> 2. **C‑M21**, **C‑M20** y **C‑M22**;
> 3. **C‑A10** y **C‑A11**;
> 4. después, C‑M2…C‑M12 y C‑M14.
>
> Mandados pesa 8,2 MB con los atlas adentro: conviene un atlas más liviano para celulares, por ejemplo WebP a menor calidad o cargar los atlas por partes.

**Primero el arte** (lo genera ChatGPT) y **después el código** (lo hace Codex). Detalle y reglas en el documento único, §10.

### Arte (imágenes de ChatGPT), en orden
**Reglas comunes:**
- 32 px por metro;
- que la figura **llene su cuadro**;
- ancla en los pies o la base;
- **2 px de margen** entre cuadros;
- fondo transparente o magenta #ff00ff;
- **sin sombra horneada**: la pone el motor según el sol;
- luz de arriba a la izquierda;
- sin texto, logos ni marcas.

Cada atlas va con su `manifiesto.json` y pasa `node motor.mjs revisar-arte` sin problemas graves.

| Id | Encargo | Para qué gancho |
|---|---|---|
| **C‑A1** | **Ancla de estilo realista familiar**: una cuadra de Guatapé en maqueta 2:1, de día y de noche con lluvia. Es la referencia de todo lo demás. | — |
| **C‑A2** | **Personaje a escala**: 10 estados × 4 cuadros de perfil (quieto, camina, corre, pedalea, impulsa, patina, sentado, salta, nada, bucea) y desde arriba en 4 direcciones. 6 personas distintas (piel, pelo, ropa de diario y de trabajo, casco de ciclista). 1,70 m = 54 px. | `personajeLado`, `personajeArriba` |
| **C‑A3** | **Vehículos a escala**: los 35 de `MC.Vehiculos` más la moto y el carro de mandados, de perfil y desde arriba, con un poco de uso (polvo, rayones). Buseta, chiva, taxi y bus colombianos, sin marcas. Ruedas aparte. | `vehiculoLado` |
| **C‑A4** | **Árboles realistas**: guayacán amarillo y rosado (florecidos), ceiba, mango, urapán y árbol de monte, más palma de cera y de coco. 3 variantes de cada uno, de lado (128 px de alto) y desde arriba (128 px). Nombres: `arbol_<especie>_lado`, `arbol_<especie>_arriba`, `_v1`, `_v2`. | `arbol` (nuevo) |
| **C‑A5** | **Texturas de suelo sin costuras** (128 × 128 px = 4 m): asfalto gastado, asfalto parcheado, andén de baldosa, adoquín, pasto, tierra con barro, grava, teja de barro, plancha de concreto y zinc oxidado. | `textura` (lo hace C‑M16) |
| **C‑A6** | **Módulos de fachada con desgaste**: 6 zonas × 6 tipos × 3 variantes, de día y de noche (reemplaza G‑M12). | `fachadaModulo` |
| **C‑A7** | **Animales a escala**: perro criollo, gato, gallinazo, caballo, vaca, iguana, zarigüeya y ardilla. | `animalLado` |
| **C‑A8** | **Láminas guía de los estilos 2.7**: la misma cuadra de Guatapé en cómic (*Spider‑Verse* y Lichtenstein), manga (tramado y líneas), anime (Shinkai y Ghibli), novela gráfica (noir con un rojo), ukiyo-e (Hokusai) y acuarela (Comisión Corográfica). Solo la técnica, nunca personajes ni marcas. | guía de `MC.Estilo` |
| **C‑A10** | **Tipografía propia** (R25) para letreros, placas, grafitis y menús: una fuente a partir de letra a mano, con 3 variantes por letra, libre para usar. | interfaz y letreros |
| **C‑A11** | **Interfaz de libreta** (R23): el mapa de mandados, la lista de misiones y los botones como una libreta dibujada, con *squash and stretch* al tocar. | `MC.UI` (tema) |
| **C‑A9** | **El personaje en *cel***, con contorno y 3 tonos, para los estilos dibujados: los mismos estados que C‑A2. | `personajeLado` en los estilos `comic`, `manga` y `anime` |

### Código (Codex), en orden
| Id | Encargo |
|---|---|
| **C‑M13** | **Maqueta por debajo de 20 ms** con la CPU 4× más lenta, con todo el detalle 2.6: árboles de pie, desgaste y fachadas. Hoy da 30–38 ms aquí y 44,7 ms en la máquina de Codex. |
| **C‑M16** | **Gancho `textura`** en las losas: las texturas de C‑A5 como patrones en metros, con respaldo procedural (`Rudeza`), y su prueba. |
| **C‑M17** | **Lluvia y atmósfera que se ven** (R02, R03 y R09): asfalto mojado más oscuro, charcos con reflejo y salpicaduras, y niebla de distancia en la maqueta y la lateral, sin pasar de 2 ms por cuadro. |
| **C‑M1** | **Auditoría de lo nuevo**: `js/16-estilos.js`, `js/29-arboleda.js`, `Rudeza` en `js/40-dibujo.js`, `js/87-pieles.js`, `js/88-vida.js` y `js/89-exportar.js`. Una tabla con archivo:línea, severidad, escenario y *diff*. |
| **C‑M18** | **Motores potentes**: abrir `node motor.mjs exportar guatape` en **Godot 4** (y, si se puede, Unity y Unreal); un proyecto mínimo que lea `escena.json` y ponga los árboles con `MultiMeshInstance3D`; y una vista de Motor City con **three.js o WebGPU** registrada en `MC.Vistas` (`docs/MOTORES-POTENTES.md`). |
| **C‑M20** | **API de construcción por código y pincel de mundo** (R18 *VoxPix* y R10 *Town Brush*): `city.calle(puntos, op)`, `city.edificio(x, y, ancho, fondo, alto, op)`, `city.arbol(x, y, especie)`, `city.luz(x, y)` y un mundo que se arma desde `escena.json`, validado con `schemas/escena.schema.json` (`MC.Contratos.validar`). Con eso, una IA construye barrios enteros por código. |
| **C‑M21** | **Peso del cuerpo y del vehículo** (R06, R07, R09, R11–R13, R20 y R21): suspensión por rueda con rayos, balanceo de la carrocería, cosas que se rompen (conos, vallas), IK de pies en escalones, animaciones cotidianas (abrir puertas, reparar, sentarse), tablero en primera persona con limpiaparabrisas, taller con rayos X y gráficas de suspensión y agarre en la telemetría. Sin pasar de 2 ms por cuadro, y la física igual en cualquier calidad gráfica. |
| **C‑M22** | **Guardado y mundo por sectores** (entrega §11 y §12.3): `MC.Guardado`, con `schema_version`, IDs estables y migradores; sectores activos y dormidos que recuerdan los cambios (huellas, objetos rotos, grafitis) al volver. |
| **C‑M19** | **Estilo de 1 bit con trama estable**, como *Return of the Obra Dinn*: umbral contra una trama de ruido azul que no tiemble al mover la cámara. Y semitono por luminancia en la sombra del cómic. |
| **C‑M15** | **Terreno**: la capa `agua` precalculada en el MC4, y el carro que se inclina y patina en barro y nieve. |
| **C‑M9, C‑M12, C‑M10, C‑M14, C‑M11** | Tráfico con propósito, sombras sobre muros, casa con A* y dos habitantes, distritos y políticas, y pueblo orgánico (§10.2). |
| **C‑M2 a C‑M8** | Redes precalculadas, raster, direcciones, storylets, accesibilidad y pruebas que faltan (§10.2). |

**Cómo entregas:**
- **El arte:** en `arte/chatgpt/`, con el mismo formato de `arte/gemini/` (atlas `.webp` o `.png` más `manifiesto.json`).
- **El código:** commits en la rama `claude/motor-city-engine-xu7p4y`, con `node motor.mjs prueba --navegador` en verde y cada mejora con su prueba.
- **El resumen:** `ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`.

---

## Las IAs de los juegos
Cada juego tiene su propio `TAREAS-IA.md` en la raíz de su repositorio:
- **Juega EnCicla** (`BicicletasUno`): migrar a `motor-city/` y el estilo 2.6.
- **El Metro** (`MetroZero`): su protocolo de 7 pasos y la migración.
- **Run Scooter** (`RunRunZero`): sigue independiente.

## Claude · la IA del motor
- Une las entregas (arte de ChatGPT en `MC.Pieles` y código de Codex).
- Mantiene `docs/PEDIDOS.md`.
- Sigue con *Motor City* (carreras) y *Extremo* (§9.7).
