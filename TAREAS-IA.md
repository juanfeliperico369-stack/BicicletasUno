# Tareas de cada IA · Juega EnCicla

> **v2.1.0 (21‑nov‑2026, Claude) · LEE PRIMERO `docs/REVOLUCION-2.1.md`.** La revolución con Motor City 4.5 está hecha: manejo que desliza y se desatasca con asistencia, HUD según el contexto, cuatro tamaños e iconos vectoriales, lectura cenital, efectos para todo público, rostros, árboles con lógica, registro de claves del guardado, la **Ruta a Guatapé en bici** (C‑E40) y la **red completa de El Metro** (15 alimentadores y líneas futuras). Abajo, lo hecho va tachado; lo que queda está en el § 6 del documento.

> **Motor City 4.5 (21‑nov‑2026) · LEE PRIMERO `docs/INFORME-MOTOR-CITY-4.5.md`.** El autor decidió que este juego **sigue con su propio motor**: no se migra a Motor City (si abajo dice «Migrar a `motor-city/`», queda anulado). El motor 4.5 viaja en `motor-city/` como referencia y caja de herramientas; el informe dice qué cambió Claude, qué mejoró, qué falta auditar, qué te toca (manejo y controles, modelos, rostros, árboles con lógica, Guatapé, la forma cenital, efectos para todo público, interfaz) y **cómo usar el motor sin dejar el tuyo**.


> **Motor City 4.0 (20‑nov‑2026): el planeta y *Turno Cero*.**
> - El motor une Manhattan, Medellín y el Valle y Guatapé en un planeta (`MC.Planeta`), con carreteras de la nada entre ellas.
> - Trae la búsqueda 0–5 (`MC.Busqueda`) y lee modelos GLB (`MC.Modelos`).
> - *Turno Cero* es el juego adulto de Motor City y vive aislado en `motor-city/juegos/getaway/`: **su violencia y su lenguaje no entran a este juego**.
> - Lee `motor-city/docs/TURNO-CERO.md` y `motor-city/TAREAS-IA.md` § 4.0.
>
> **Para Juega EnCicla (Codex, C‑E40):** «Ruta a Guatapé en bici». Es un reto de cicloturismo opcional por la Autopista del Embalse de `MC.Planeta`: 12 km de montaña, bosque y lagos (`Generador.carretera`). Debe tener paradas para hidratarse, el letrero con los km y llegada al malecón de Guatapé. Es para todo público, sin búsqueda ni disparos.


> **Motor City 3.0 (20‑nov‑2026):** antes de tu encargo, lee **las 10 reglas que dejó el feedback del autor** en `motor-city/docs/PROXIMO-NUEVA-YORK.md` §3:
> - un solo mundo con varias cámaras;
> - volumen en lo que se levanta;
> - fachadas con detalle;
> - cámara con topes y un mapa para ver todo;
> - tutoriales opcionales;
> - fluidez medida;
> - probar en un celular real con GPU.
>
> Lo que sigue después de los encargos de Gemini y ChatGPT es «Getaway Nueva York».

> **Si te dijeron «mira el repositorio y haz tu parte», empieza aquí.** Haz solo tu parte, en orden.
> - El contexto del motor está en `motor-city/docs/DOCUMENTO-UNICO.md`, y lo que cambió en `docs/CONTEXTO-MOTOR-CITY.md`.
> - Al terminar: actualiza `docs/BITACORA.md` e informa en 5–10 líneas: qué hiciste, cómo lo probaste, qué aprendiste y qué falta.

**Reparto (nov‑2026, del autor):**
- **Gemini con Antigravity** trabaja ahora con «hydrogen»: le tocan las **tareas fáciles**.
- **ChatGPT con Codex** sigue con «astra»: le tocan las **fuertes**.
- La IA que trabaje como «IA de EnCicla» hace la lista de abajo según su nivel.

## La IA de Juega EnCicla (Codex «astra» o Claude): lo fuerte
1. ~~**Migrar a `motor-city/`**~~ (anulado por el autor en la 4.5: el juego sigue con su motor; ver `docs/INFORME-MOTOR-CITY-4.5.md`) sin perder sus pruebas. La guía paso a paso está en `motor-city/docs/MIGRACION-ENCICLA.md`: hoy `tools/build.js` sigue usando `motor-valle/js/valle.js`.
2. **Estilo realista familiar (motor 2.6):**
   - `MC.Vistas` ya trae los árboles de pie, el asfalto gastado, los andenes de baldosa y los techos con textura;
   - usa `MC.estilo = 'realista'`, con la piel EnCicla encima (`MC.arte`).
3. ~~**El test de WebRTC**~~ (hecho por Claude en la 4.5: espera a que lleguen los estados) «el invitado 2 ve al anfitrión y al invitado 1» (`tests/run.js:446`) espera una ventana fija de 900 ms. Espera a recibir un estado nuevo de cada participante (número de secuencia o ACK) antes de comprobar. Lo señalaron Gemini y Codex.
4. ~~`MC.Manejo` (perfil bici) y `MC.UI` (tema `encicla`) con `verificar`~~ (hecho en la 2.1 sin meter el motor: el manejo 4.5 en `30-ride.js` y `98q-manejo.js`, y el HUD según el contexto en `98r-hud.js`; el joystick visible ya estaba).
5. **Lugares jugables:** estaciones EnCicla y talleres de bici.
6. **Mi casa** con soporte para la bici.
7. **Capa de movilidad** (`urbe.capa('transporte')` y `ruido`). **Conciencia:** por qué la bici baja el ruido.
8. **Tutoriales siempre opcionales:** un botón, nunca una ventana que salga sola.
9. **Publicar** en `gh-pages` conservando `/metro/`, con APK de `versionCode` > 20003. Nunca subas llaves.

10. ~~**(2.10) Registro de claves del guardado:**~~ (hecho en la 2.1: `src/js/98v-claves.js` y su prueba al final de `tests/run.js`) traer `Save.CLAVES` y `Save.revisarClaves()` de la rama `revolucion-v2` (commit 82b242d), con su prueba. Cada clave nueva del guardado se declara con su tipo y su dueño, y la prueba falla si aparece una clave sin registrar. Antes, registra las claves de hoy (corre el juego y mira `Object.keys(Save.data)`).
   - El alto contraste y el metro sin casas debajo de esa rama ya están en `src/js/96-accesible.js`.
11. **(2.10) Modern Web Guidance:** antes de tocar la interfaz (`src/js/60-ui.js`, `src/style.css`), busca la guía (`npx -y modern-web-guidance@latest search "…"`). Corre también `legacy-scan src/js --json` y aplica solo lo verificado, respetando la política de navegadores del motor.

## Gemini con Antigravity («hydrogen»): lo fácil
1. `node tools/build.js` y `node tests/run.js`: pega el resultado en `docs/BITACORA.md` (qué pasó y qué falló), sin cambiar código.
2. Capturas del juego en 412 × 860 (portada, carrera, mundo libre y minijuegos) y una tabla foto → hallazgo → gravedad.
3. 20 datos verificables de movilidad en bici en Medellín, con fuente: `contenido/datos-gemini.json`.
4. **(2.10)** Prueba el **alto contraste** (Más → Alto contraste) en 412 × 860 y anota qué no se lee bien todavía, con su captura.

## ChatGPT (imágenes): el arte
Lo de arte se pide en el motor: `motorcity/TAREAS-IA.md`, C‑A1…C‑A7 (personaje, bicis y vehículos a escala, y árboles y texturas realistas). Si haces una piel solo para EnCicla, usa las mismas reglas (§10 del documento único) y ponla en `arte/` con su `manifiesto.json`.
