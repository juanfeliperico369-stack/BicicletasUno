# Pedidos para ChatGPT · Motor City 4.9 «Realismo» (22‑nov‑2026)

> **Decisión del autor:** todo lo que estaba pendiente para Gemini (Antigravity) y para ChatGPT (Codex) pasa a **ChatGPT**. Gemini queda en pausa.
> - El arte (imágenes) lo hace ChatGPT.
> - El código y los commits los hace Codex, en el repositorio `juanfeliperico369-stack/motorcity`.
> - Este documento reemplaza las listas de Gemini y de ChatGPT en `TAREAS-IA.md`; esas quedan como historial.

## 0. Antes de empezar (obligatorio)
1. **Lee, en orden:**
   - `CONTEXTO-RELEVO.md`;
   - `docs/PLAN-REALISMO.md`;
   - `docs/TURNO-CERO.md`;
   - `BITACORA.md` (las entradas 4.7 a 4.9);
   - `CLAUDE.md`, con las reglas y los comandos;
   - las skills de `.claude/skills/` que toquen tu tarea: arte, desarrollo, territorio, qa‑playwright.
2. **Rama propia:** `ia/chatgpt/<tema>`, una por tema. Nunca `push --force`, ni push a `main` o `gh-pages`. Claude une y publica.
3. **Reglas que no se negocian:**
   - un solo HTML que anda sin internet;
   - español de Colombia;
   - no romper los guardados (`motorcity.turnocero-v1` y los de cada juego);
   - Turno Cero es 18+;
   - los juegos de familia (EnCicla, El Metro, Run) van sin violencia;
   - sala limpia: ideas de otros motores sí, su código no;
   - nada de llaves ni secretos en el repositorio.
4. **Imágenes:** las fotos de la ciudad (satélite o calle) se usan solo para mirar y adaptar.
   - Nunca se monta una foto ajena en el motor.
   - Google y Esri prohíben calcar con programas.
   - Todo arte que entre al juego lo dibujas tú, sin texto, sin logos y sin marcas.
5. **Pruebas en verde antes de cada push:**
   - `node herramientas/construir.mjs`;
   - `node pruebas/prueba.mjs --navegador`;
   - `node pruebas/tres.mjs`;
   - `node pruebas/modos.mjs`;
   - las que toquen tu tarea.
6. **Al terminar cada pedido:**
   - deja tu entrada en `CONTEXTO-RELEVO.md` § 8;
   - deja un mensaje en `coord/buzon/AAAAMMDD-HHMM-chatgpt-<tema>.md`;
   - actualiza tu ficha `coord/agentes/chatgpt.json`.

## 1. Lo más urgente: que la ciudad se vea real
El 3D realista ya existe: three.js 0.170 incrustado y `MC.VistaTres` en `js/45-tres.js`, con luz física, sombras del sol, cielo y ventanas de noche. Lo que falta son **texturas y datos**.

| Id | Pedido | Contrato técnico | Entrega |
|---|---|---|---|
| **R1** (arte + código) | **Atlas de fachadas de Medellín**: ladrillo a la vista sin revocar (el de las laderas), revoque pintado de colores, concreto, vidrio de torre, colonial del centro y local comercial con persiana. | Atlas repetible de 2048 × 2048 WebP, con un módulo por piso (3 m) y por vano (2,7 m), y un mapa de ventanas encendidas para la noche. Codex lo conecta en `VistaTres._edificio` (el gancho ya existe en `js/45-gl.js`): coordenadas de textura por muro y el tipo según `estiloEdificio` y la altura. El respaldo es la malla de siempre. | `arte/fachadas/medellin/` + manifiesto + código + capturas antes y después (`pruebas/tres.mjs` en verde) |
| **R2** (arte, antes C‑A16) | **Texturas PBR de bajo polígono** para 6 vehículos y 6 personajes de Turno Cero. | Un atlas de 1024 px por familia, sin marcas, con la paleta de la biblia. Con luz física se nota. | `arte/modelos/turno-cero/texturas/` |
| **R3** (datos) | **Pisos del catastro en todas las comunas de Medellín.** Hoy solo están Popular, El Poblado y Robledo. | En `geo/territorio.py`, cruzar las huellas con los lotes de GeoMedellín (la misma fuente ya citada). Regenerar el MC4 de Medellín sin cambiar el formato. | MC4 + informe de cobertura (porcentaje con altura oficial) |
| **R4** (datos) | **Techos de OpenStreetMap**: `roof:shape`, `roof:levels`, `building:colour` y `roof:colour`, donde existan. | Campos nuevos opcionales en la capa de edificios. El motor ya hace techos a dos y cuatro aguas y planos. | MC4 + prueba |
| **R5** (datos) | **Relieve:** propuesta con licencias, sin aplicarla. | Copernicus GLO‑30 y ALOS son modelos de superficie (incluyen edificios). FABDEM es no comercial. ¿Hay un modelo de terreno de la Alcaldía? Mientras tanto, cortes de vía y muros de contención procedurales en las laderas. | Informe en `reportes/` para que el autor decida |
| **R6** (código) | **Mallas pre-cocinadas por sector con niveles de detalle**, al estilo de las 3D Tiles. | En la construcción, generar por sector de 1 km la malla de edificios en 3 niveles; el juego solo carga. Medir peso y arranque. | Herramienta + prueba de memoria |
| **R7** (código, antes C‑M31) | **El globo dentro de la misma escena 3D**, ahora con three.js. | Al alejar la cámara aérea, la ciudad se vuelve esfera sin corte (`MC.GloboGPU` y el anillo de `MC.Planeta`). | Módulo + prueba |
| **R8** (código) | **Luz de gama alta**: oclusión ambiental (SSAO) solo en GPU buenas, faroles con luz real de noche y agua con reflejo. | En `js/45-tres.js`, condicionado a la calidad y al nivel de `GPU.perfil()`. Que `pruebas/tres.mjs` siga en verde. | Código + capturas |

## 2. Turno Cero y el mundo vivo (lo que era de Gemini)
| Id | Pedido | Dónde |
|---|---|---|
| **V1** | **Subtramas tipo RPG y crónicas** al estilo *UnoCero*, en el mundo abierto. Encargos cortos que se encadenan, con personajes que recuerdan. | `juegos/getaway/62-mundo-vivo.js` (número reservado), usando `EXTRAS.*` y `G.Actividades`. |
| **V2** | **Anillos visuales de recoger y entregar** en Mandados y EnCicla, y controles de vuelo del jetpack y la avioneta. | `60-modos.js` (con cuidado) o un módulo nuevo |
| **V3** | **Mejora visual de 2D, Arcade y Pixel**: cenital, maqueta, 🏁 Arcade y 🕹️ Retro. | `js/41-vista2d.js`, `js/47-clasicos.js` |
| **V4** (arte, antes C‑A18) | **Cielos y montañas pintados por bioma** para 🏁 Arcade: costa, desierto, bosque, montaña, nieve y lagos, en 3 capas de paralaje. | `arte/arcade/`, PNG o WebP transparente de 1024 × 256 |
| **V5** | **Run por la ciclorruta:** el ancho según el tipo de vía y zonas de trucos dentro del corredor. | `js/50-run.js`, `herramientas/importar-run.mjs` |
| **V6** | **Plano histórico de Medellín**, como «Buenos Aires, de 1867 a 1950»: buscar un plano escaneado de dominio público, leer sus huellas y armar un modo «Medellín en el tiempo» con su línea de etapas. | `geo/` + modo nuevo; el plano y su licencia en `docs/` |

## 3. Lo que sigue de antes (código)
| Id | Pedido | Estado |
|---|---|---|
| **C‑M33** | LOD1 y LOD2 de vehículos y actores, y más actores con esqueleto (Nadia, Noah, Cross, El Contador…). | `MC.Modelos.posar` ya reproduce los rigs |
| **C‑M35** | Daño: que las piezas se suelten, y humo y fuego en 3D. | Ya hay abolladuras por zona y faro roto (`op.dano`) |
| **C‑M36** | Audio: oclusión aproximada y pasar el motor y la sirena a `js/61-sonido.js` para todos los juegos. | Está en Turno Cero |
| **C‑M38** | Interiores con sectores y portales (*Build*): cuartos como sectores y puertas como portales. | `js/48-interiores.js` |

## 4. Lo que no es tuyo
- **Medir en un celular real con GPU:** es del autor. Puedes preparar la plantilla y la página de medición.
- **Lo que solo toca a un juego hermano** (EnCicla, El Metro, Run): es de la IA de ese juego. Sus informes están en `docs/INFORME-MOTOR-CITY-4.6.md` de cada repositorio.

## 5. Cómo informar
Por cada pedido, en 5–10 líneas: qué hiciste, cómo lo probaste (comandos y números), qué aprendiste y qué falta. Agrega capturas antes y después en `reportes/` cuando sea visual.
