# Plan para cada IA · Motor City 2.2

> **Cómo usar este documento:** cada sección se le entrega completa a una IA (se copia y se pega). Cada IA hace **solo lo suyo** y entrega **un solo documento**, o un reporte en el repo si es una IA de código de un juego.
> El autor (OneZero) junta las entregas y se las pasa a la IA del motor (Claude), que las une, las prueba y sube la versión.
> **Repositorio del motor:** `juanfeliperico369-stack/motorcity` · rama de trabajo `claude/motor-city-engine-xu7p4y`, y `main` para la web.
> **Pruébalo en la web:** <https://juanfeliperico369-stack.github.io/motorcity/>

## Reglas para todas
1. **Lee primero:** `README.md` → `CONTEXTO-IA.md` → `MOTOR.md` → `docs/MANUAL.md` → `CONTRIBUIR.md`. Las skills están en `.claude/skills/motor-city-*`; síguelas aunque no seas Claude.
2. **Juega antes de tocar:** Mandados (`dist/juegos/mandados.html`) y Medellín (`dist/motor-city.html`):
   - todas las vistas, también la **lateral**;
   - el pixel;
   - Mi casa (🏠, con una dirección de prueba como «Calle 31 # 28-15»);
   - un taller y una tienda;
   - un día completo con lluvia.
3. **Las reglas del autor:**
   - un solo HTML por juego, sin internet ni librerías;
   - español de Colombia, para todo público y sin datos personales;
   - no romper guardados;
   - las pruebas en verde;
   - el arte nuevo siempre con respaldo procedural;
   - nada de marcas, logos ni personas reales sin permiso.
4. **Tres pilares** en todo lo que se haga: **diversión** (que quiera seguir jugando), **reflexión** (que el mundo pese, sin sermones) y **conciencia** (que aprenda algo real, rápido y jugando).
5. **La pantalla es del juego:**
   - el centro nunca se tapa;
   - información arriba, acciones donde llega el pulgar;
   - un aviso a la vez.
6. **Entrega e informa** en 5–10 líneas: qué hiciste, cómo lo probaste, qué aprendiste y qué falta.

## 1. Gemini (Antigravity y Nano Banana) · ARTE del motor y auditoría visual
**Documento de entrega:** `ENTREGA-GEMINI-MOTOR-CITY-2.2.md`. Los detalles de cada encargo están en `docs/PETICION-GEMINI.md`.

**Objetivo:** que el motor tenga una piel por defecto hermosa y coherente, y **mucha variedad de interiores**. Cada casa y cada lugar deben ser distintos aunque salgan del mismo generador.

**Encargos, en orden:**
1. **G‑M0 · Ancla de estilo** (una lámina): personaje, bici, carro, casa de ladera, torre e interior de una sala, en suave y en pixel.
2. **Sprites del personaje:**
   - de perfil (8 poses: quieto, caminar, correr, pedalear, impulsarse, patinar, sentado y saltar);
   - cenital (4 direcciones);
   - en atlas, con fondo magenta o transparente;
   - con medidas en metros (persona de 1,68 m) y el mapa de cuadros en JSON (formato de `MC.Sprites.atlas`).
3. **Vehículos:** los 35 de `MC.Vehiculos`, de perfil y cenitales, en atlas, con las ruedas en cuadros aparte para que giren.
4. **Animales y criaturas:**
   - perro criollo, gato, gallinazo, colibrí, iguana, zarigüeya, ardilla, caballo y vaca;
   - 4 criaturas de otros planetas que cumplan la ley cuadrado‑cubo (ver `MC.Seres.Animal.criatura`).
5. **MUEBLES POR ESTILO (nuevo, grande):** el catálogo de `MC.Interiores.CATALOGO` (22 muebles) en los **8 estilos**: paisa, moderno, minimalista, bohemio, campestre, industrial, juvenil y clásico.
   - Vista **cenital** (para el plano) y **frontal** (para la vista lateral de la casa).
   - Medidas reales: el sofá mide 2,1 × 0,9 m; la cama, 1,4 × 1,9 m.
   - **Pisos** por estilo (madera, baldosa hidráulica, porcelanato, cemento) como texturas que se repiten (*tiles*) de 64 × 64.
   - **Decoración:** cuadros (abstractos, sin firmas), tapetes, materas con plantas del trópico, lámparas y cojines.
6. **Lugares jugables:** interiores de **taller de bicis**, **taller de carros y motos**, **tienda de barrio**, **tienda de ropa**, **centro comercial** (pasillo, locales y comidas), **biblioteca** y **restaurante**, con sus muebles propios (banco de trabajo, elevador, perchero, vitrina, estanterías y mesas).
7. **Fachadas por zona** (ladera, centro, Laureles, El Poblado, pueblo e industria) para la vista lateral y la panorámica: ventanas, balcones, rejas, toldos y tanques.
8. **Íconos de las 9 vistas**, de los 7 esquemas de control y de los tipos de lugar (SVG de 24 o 48 px, un trazo, sin texto).
9. **Auditoría visual:**
   - juega la vista lateral, la 3D por software (tercera persona sin GPU) y los interiores;
   - di qué se ve mal, con el lugar, la regla y la fuente;
   - si puedes, **mide en un celular real**: FPS por vista, carga y si se calienta.

**Criterio de aceptación:**
- cada sprite trae su JSON de cuadros y anclas (pies), su altura real en metros y el nombre exacto;
- se ve bien a 2 y a 16 px por metro;
- sin texto, sin logos y sin sombras proyectadas.

**No es tu rol:** el código del motor, la física ni la interfaz; eso es de ChatGPT.

## 2. ChatGPT (Codex y su generador de imágenes) · CÓDIGO: auditoría, mejoras y contenido
**Documento de entrega:** `ENTREGA-CHATGPT-MOTOR-CITY-2.2.md`. Los detalles están en `docs/PETICION-CHATGPT.md`.

**Objetivo:** que el motor sea más rápido, más robusto y más rico en contenido escrito, con pruebas.

**Encargos, en orden:**
1. **C‑M1 · Auditoría 2.2** de los módulos nuevos:
   - `05-gpu`, `13-cosmos`, `32-fisica` (superficies), `34-camara`, `37-manejo`, `38-sprites`, `44-raster`, `48-interiores`, `49-hogar`, `70-interfaz`, `82-lugares` y `85-historias`;
   - busca errores, bordes, fugas y trabajo de más;
   - entrega una tabla y *diffs*.
2. **C‑M2 · Redes precalculadas** en el MC4: ~1 s menos al arrancar en Medellín.
3. **C‑M3 · Raster más rápido:** trozos de relieve en caché y reutilización de arreglos. Meta: menos de 12 ms en Chromium sin GPU a calidad 0,8.
4. **C‑M4 · Direcciones:** pruebas con 50 direcciones reales de Medellín, Envigado, Itagüí, Bello y Guatapé (solo calles y cruces públicos, nunca datos de personas), con el porcentaje de «exacta», «calle» y «lugar». Mejoras al lector para «Bis», «Este», diagonales y transversales.
5. **C‑M5 · Paquete de storylets** (contenido): **60 storylets** (20 por pilar), en español de Colombia, para todo público, con datos **verificables** y su fuente en un comentario. Usa el formato de `MC.Historias` (cuándo, texto, opciones y efecto).
6. **C‑M6 · Accesibilidad e interfaz:**
   - audita `MC.UI` con lector de pantalla y con teclado;
   - revisa el contraste;
   - revisa el modo zurdo (los botones al otro lado);
   - entrega *diffs* con pruebas.
7. **C‑M7 · Íconos de interfaz** en SVG (24 px, un trazo) para lo que Gemini no haga, y el logotipo de Motor City (solo forma).
8. **C‑M8 · Pruebas que faltan:**
   - `Manejo.seguirRuta`, `Hogar.mover` y `girar`;
   - `Lugares.hacer` en todos los tipos;
   - `Ocurrencias` (atascado);
   - `Cosmos` (Kepler: a = 1 UA, M = 1 → T = 1 año).

**Criterio de aceptación:**
- los *diffs* aplican sobre la rama;
- `node motor.mjs prueba --navegador` queda en verde con las pruebas nuevas;
- nada de librerías.

## 3. IA de Juega EnCicla (`BicicletasUno`)
**Entrega:** commits en tu rama y un reporte en el motor (`node motor.mjs reporte "…" --juego encicla`) si tocas el motor.

**Objetivo:** que EnCicla use Motor City 2.2 sin perder nada de lo que ya tiene (sus 97 pruebas).

**Tareas:**
1. **Migración:** el motor queda en `motor-city/`; el viejo `motor-valle/` se conserva hasta terminar. Sigue `docs/MIGRACION-ENCICLA.md`.
2. **La panorámica de EnCicla con la del motor** (`MC.Vistas`, vista `pano`) y la **vista lateral**.
3. **Manejo:** `MC.Manejo` con el perfil de bici. Ofrece «un pulgar» y «tocar para ir» en el menú.
4. **Interfaz:** `MC.UI` con el tema `encicla`. Prueba que nada tape el centro (`MC.UI.verificar`).
5. **Lugares:** las **estaciones EnCicla** como lugares jugables (prestar y devolver la bici); talleres de bici del motor para reparar y mejorar.
6. **Mi casa:** la casa del jugador por dirección y el **soporte para la bici** en el catálogo.
7. **Historias de cultura ciudadana:** ciclorruta, respeto al peatón, casco y luces de noche, con el pilar de conciencia.
8. **Publicar** en `gh-pages` **conservando `/metro/`**. APK con `versionCode` mayor que 20003. No subas llaves.

**No hagas:** cambios al formato del mundo, ni tocar `js/valle.js`.

## 4. IA de El Metro (`MetroZero`)
**Entrega:** commits en tu rama, `docs/BITACORA.md` y un reporte en el motor si lo tocas.

**Sigue su protocolo de 7 pasos** (`CLAUDE.md` de MetroZero): leer, reflexionar, cuestionario, prueba pequeña, auto‑ajuste, solo lo tuyo, entregar.

**Tareas:**
1. **Migración** a `motor-city/` siguiendo `docs/MIGRACION-ELMETRO.md`. El Metro conserva su `23-lado.js` mientras compara con la vista lateral del motor.
2. **La 3D por software** (`MC.Raster`) como respaldo de su G3 en celulares sin GPU. Mide en un celular real.
3. **Lugares:** estaciones y Metrocables como lugares jugables; interiores de estación (taquilla, torniquetes, andén) pedidos a Gemini con la paleta de El Metro.
4. **Historias:** cultura metro, Rosalba y los usuarios con rutinas (`MC.Poblacion`).
5. **Pruebas:** `node tools/test.mjs 100` con 0 errores, y las del motor.

**No hagas:** cambiar los colores de línea ni las reglas de arte del juego sin el autor.

## 5. IA de Run Scooter (`RunRunZero`)
**Run Scooter sigue independiente:** el motor lo importa con 12 parches (`node motor.mjs run`).

**Tareas:**
1. Si cambias el juego, avisa en un reporte: el importador del motor dice qué parche dejó de calzar.
2. Opcional: usa `MC.Manejo` (curvas y giro según la velocidad) y `MC.Sprites` si el juego pasa a sprites.
3. Prueba Run dentro de EnCicla y de El Metro («Run en la ciclovía»).

## 6. Codex y Antigravity como agentes de código de los juegos
Cuando trabajen en un juego, son «la IA de ese juego» (secciones 3 a 5): misma rama, mismas pruebas y el reporte obligatorio si tocan el motor.

## 7. La IA del motor (Claude) · lo que sigue
1. Unir las entregas de Gemini y ChatGPT (2.3).
2. Atlas de arte por juego.
3. Muebles por estilo con sprites.
4. Vista frontal de la casa en la lateral.
5. Redes precalculadas.
6. Losas en un *Worker*.
7. *Motor City* (carreras): pistas sobre la red real, repeticiones y rivales con `MC.Carrera`.
8. *Extremo*: física de tabla, de bici de montaña y de surf.
9. Otra ciudad completa con transporte, para demostrar que se craquea cualquiera.

## 8. Lo que necesita el autor (para seguir mejorando)
- **Probar en un celular real** de gama media y contar qué se siente lento o confuso.
- **Pasar este plan a cada IA** y devolver sus entregas.
- **Elegir la licencia** del motor antes de mostrarlo a empresas (ver `docs/NEGOCIO-Y-USOS.md`).
- **Permisos de marca** si un juego usará logos del Metro o de EnCicla de forma comercial.
- **Opcional:** activar la página de cada juego en GitHub Pages, como ya está la del motor.
