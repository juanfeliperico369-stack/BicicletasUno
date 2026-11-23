# Pedidos para Gemini y Antigravity · Motor City 5.0 «Que se sienta» (23‑nov‑2026)

> **Reparto del autor (23‑nov‑2026):** Gemini vuelve a estar disponible.
> - **Gemini y Antigravity** hacen las tareas **fáciles y medianas**: interfaz, cámara, textos, arte con Nano Banana y modos sueltos.
> - **ChatGPT y Codex** hacen las fuertes; su lista está en `docs/PEDIDOS-CHATGPT-5.0.md`.
> - El arte lo hace Gemini (Nano Banana); el código y los commits, Antigravity o Gemini CLI, en `juanfeliperico369-stack/motorcity`.

## 0. Antes de empezar (obligatorio)
1. **Lee, en orden:**
   - `CONTEXTO-RELEVO.md`;
   - **`docs/PLAN-5.0.md`**;
   - `docs/TURNO-CERO.md`;
   - `BITACORA.md` (entradas 4.8 a 5.0);
   - `CLAUDE.md`;
   - las skills de `.claude/skills/` que toquen tu tarea (arte, juegos, diseño de interfaz, qa‑playwright).
2. **Rama propia:** `ia/gemini/<tema>`, una por tema, partiendo de `main`. Nunca `push --force`, ni push a `main` o `gh-pages`. Claude une y publica.
3. **Archivos:**
   - prefiere **módulos nuevos** (aditivos) a reescribir los grandes;
   - si tocas uno grande, cambia lo mínimo y explícalo;
   - no toques `js/37-dinamica.js` (la física nueva) ni `js/45-tres.js` (es de ChatGPT); si necesitas algo de ellos, pídelo en `coord/buzon/`.
4. **Reglas que no se negocian:**
   - un solo HTML sin internet ni librerías nuevas;
   - español de Colombia;
   - no romper los guardados;
   - Turno Cero es 18+; EnCicla, El Metro y Run son de familia y van sin violencia;
   - sala limpia;
   - nada de llaves.
5. **Arte:**
   - todo lo dibujas tú, sin texto, sin logos y sin marcas;
   - las fotos de la ciudad solo sirven para mirar;
   - entrega en WebP o PNG con su manifiesto y la versión de juego liviana;
   - **di cuántos KB suma al HTML.**
6. **Pruebas en verde antes de cada push:**
   - `node herramientas/construir.mjs`;
   - `node pruebas/prueba.mjs --navegador`;
   - `node pruebas/dinamica.mjs`;
   - `node pruebas/humano.mjs`;
   - `node pruebas/modos.mjs`;
   - las de tu tarea (haz una nueva en `pruebas/` por pedido).
7. **Al terminar cada pedido:**
   - deja tu entrada en `CONTEXTO-RELEVO.md` § 8;
   - deja un mensaje en `coord/buzon/AAAAMMDD-HHMM-gemini-<tema>.md`;
   - actualiza `coord/agentes/antigravity.json`.

## 1. Orden de trabajo
| # | Id | Pedido | Dónde y cómo | Entrega |
|---|---|---|---|---|
| 1 | **G5‑01** | **Vista «Historieta»** (idea de Chinatown Wars): cámara desde arriba a unos 55°, que gira suave con el rumbo del carro; colores planos y contorno negro | Un perfil nuevo de cámara en `js/34-camara.js` y una opción de ⚙️ Gráficos (`historieta`). El contorno con casco invertido o con detección de bordes en three.js, sin tocar el material de ChatGPT (pide un gancho si hace falta). Debe leerse bien a 412 px | Código + prueba + capturas |
| 2 | **G5‑02** (antes V2) | **Anillos de recoger y entregar** en Mandados y EnCicla, y controles de vuelo del jetpack y la avioneta | `juegos/getaway/60-modos.js` (con cuidado) o un módulo nuevo | Código + prueba |
| 3 | **G5‑03** | **Textos de la ciudad viva:** 200 frases de peatones con condiciones, y las escenas de la calle por tipo de lugar | JSON en `datos/frases/`, dos juegos de frases: familia y 18+. Cada frase lleva `{ texto, cuando: { evento, lugar, hora, clima }, quien }`. Las escenas son `{ lugar: 'banca'\|'paradero'\|'tienda'\|…, actividad, duración }`. Claude escribe el motor que las elige (fase 2) | `datos/frases/*.json` + validador |
| 4 | **G5‑04** | **Minijuegos táctiles cortos** (idea de Chinatown Wars): en Turno Cero, puentear el carro (unir los cables con el dedo) y forzar la chapa; en los de familia, inflar la llanta de la bici o ajustar la cadena | Un módulo nuevo (`juegos/getaway/64-minijuegos.js`) sobre `G.ui`, de 10 a 20 s, con salida y sin bloquear | Código + prueba |
| 5 | **G5‑05** | **Guía sin flecha** en 🎬 Modo cine (idea de Ghost of Tsushima): hojas o palomas que vuelan hacia el destino | `MC.Vida` ya tiene partículas y pájaros | Código + captura |
| 6 | **G5‑06** | **Retos desde cualquier semáforo** (idea de Burnout Paradise): detenido en un semáforo, frenar y acelerar a la vez ofrece una carrera corta hasta un punto real | Con la 🏁 Carrera de Modos que ya existe | Código + prueba |
| 7 | **G5‑07** | **Fichas de los ~30 sitios icónicos de Medellín** (para que Codex los modele): Coltejer, Basílica de la Candelaria y Parque Berrío, Palacio de la Cultura, Plaza Botero, Edificio Inteligente de EPM, La Alpujarra, Pueblito Paisa, Parque Explora, Orquideorama del Jardín Botánico, Planetario, Parque de los Deseos, Parque Biblioteca España, Estadio Atanasio Girardot, Catedral Metropolitana, Museo de Antioquia, Plaza Mayor, Teatro Pablo Tobón Uribe, Ruta N, Parque Lleras, Plaza de la Libertad… | Por sitio: coordenadas, id de OSM, altura aproximada, planta, materiales y colores HEX, de 3 a 5 rasgos que lo hacen reconocible y un dibujo de referencia propio de Nano Banana (sin texto ni logos) | `docs/sitios/<id>.md` + imágenes |
| 8 | **G5‑08** | **Química del mundo** (idea de Zelda: Breath of the Wild): la lluvia apaga el fuego de los carros, los charcos salpican al pasar y el viento lleva el humo | Conectar `MC.Quim` y `MC.Clima` a `MC.Vida` y a los efectos | Código + prueba |
| 9 | **G5‑09** (antes V1) | **Subtramas tipo RPG y crónicas** en el mundo abierto de Turno Cero: encargos cortos que se encadenan, con personajes que recuerdan | `juegos/getaway/62-mundo-vivo.js` (ya lo tenías reservado), con `EXTRAS.*` y `G.Actividades` | Código + prueba |
| 10 | **G5‑10** (antes V3 y V4) | **Mejora visual de 2D, Arcade y Pixel**, y **cielos y montañas por bioma** para 🏁 Arcade (costa, desierto, bosque, montaña, nieve y lagos; 3 capas de paralaje de 1024 × 256) | `js/41-vista2d.js`, `js/47-clasicos.js` y `arte/arcade/` | Código + arte + capturas |
| 11 | **G5‑11** (antes V5) | **Run por la ciclorruta:** el ancho según el tipo de vía y zonas de trucos | `js/50-run.js` y `herramientas/importar-run.mjs` | Código + prueba |
| 12 | **G5‑12** | **Página de medición** para el celular del autor: abre Turno Cero, maneja 60 s con el bot y muestra p50, p95, p99, memoria y GPU, con un botón «Copiar resultados» | `herramientas/medir.html` o `?medir` en Turno Cero, usando `MC.Telemetria` | Página + instrucciones para el autor |
| 13 | **G5‑13** | **Informe:** ¿encoger las carreteras largas del 🌍 planeta y no las ciudades? (idea de Euro Truck Simulator 2) | Propuesta con números; no se aplica sin el autor | `reportes/` |

## 2. Lo que no es tuyo
- La física del carro (`MC.Dinamica`).
- El render realista (`VistaTres`).
- Los datos del catastro y de OSM.
- Las tareas de ChatGPT (`docs/PEDIDOS-CHATGPT-5.0.md`).
- Medir en el celular real: es del autor; tú le preparas la página (G5‑12).

## 3. Cómo informar
Por cada pedido, en 5–10 líneas:
- qué hiciste;
- cómo lo probaste (comandos y números);
- cuántos KB suma al HTML;
- qué aprendiste;
- qué falta.

Pon las capturas de antes y después en `reportes/` cuando el cambio sea visual.
