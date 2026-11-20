# Tareas de cada IA · Juega EnCicla

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
1. **Migrar a `motor-city/`** sin perder sus pruebas. La guía paso a paso está en `motor-city/docs/MIGRACION-ENCICLA.md`: hoy `tools/build.js` sigue usando `motor-valle/js/valle.js`.
2. **Estilo realista familiar (motor 2.6):**
   - `MC.Vistas` ya trae los árboles de pie, el asfalto gastado, los andenes de baldosa y los techos con textura;
   - usa `MC.estilo = 'realista'`, con la piel EnCicla encima (`MC.arte`).
3. **El test de WebRTC** «el invitado 2 ve al anfitrión y al invitado 1» (`tests/run.js:446`) espera una ventana fija de 900 ms. Espera a recibir un estado nuevo de cada participante (número de secuencia o ACK) antes de comprobar. Lo señalaron Gemini y Codex.
4. `MC.Manejo` (perfil bici) y `MC.UI` (tema `encicla`) con `verificar`, más el joystick visible y los botones de acción (`ui.joystick`, `ui.accion`).
5. **Lugares jugables:** estaciones EnCicla y talleres de bici.
6. **Mi casa** con soporte para la bici.
7. **Capa de movilidad** (`urbe.capa('transporte')` y `ruido`). **Conciencia:** por qué la bici baja el ruido.
8. **Tutoriales siempre opcionales:** un botón, nunca una ventana que salga sola.
9. **Publicar** en `gh-pages` conservando `/metro/`, con APK de `versionCode` > 20003. Nunca subas llaves.

10. **(2.10) Registro de claves del guardado:** traer `Save.CLAVES` y `Save.revisarClaves()` de la rama `revolucion-v2` (commit 82b242d), con su prueba. Cada clave nueva del guardado se declara con su tipo y su dueño, y la prueba falla si aparece una clave sin registrar. Antes, registra las claves de hoy (corre el juego y mira `Object.keys(Save.data)`).
   - El alto contraste y el metro sin casas debajo de esa rama ya están en `src/js/96-accesible.js`.
11. **(2.10) Modern Web Guidance:** antes de tocar la interfaz (`src/js/60-ui.js`, `src/style.css`), busca la guía (`npx -y modern-web-guidance@latest search "…"`). Corre también `legacy-scan src/js --json` y aplica solo lo verificado, respetando la política de navegadores del motor.

## Gemini con Antigravity («hydrogen»): lo fácil
1. `node tools/build.js` y `node tests/run.js`: pega el resultado en `docs/BITACORA.md` (qué pasó y qué falló), sin cambiar código.
2. Capturas del juego en 412 × 860 (portada, carrera, mundo libre y minijuegos) y una tabla foto → hallazgo → gravedad.
3. 20 datos verificables de movilidad en bici en Medellín, con fuente: `contenido/datos-gemini.json`.
4. **(2.10)** Prueba el **alto contraste** (Más → Alto contraste) en 412 × 860 y anota qué no se lee bien todavía, con su captura.

## ChatGPT (imágenes): el arte
Lo de arte se pide en el motor: `motorcity/TAREAS-IA.md`, C‑A1…C‑A7 (personaje, bicis y vehículos a escala, y árboles y texturas realistas). Si haces una piel solo para EnCicla, usa las mismas reglas (§10 del documento único) y ponla en `arte/` con su `manifiesto.json`.
