# Pedidos para ChatGPT y Codex · Motor City 5.0 «Que se sienta» (23‑nov‑2026)

> **Reparto del autor (23‑nov‑2026):** Gemini vuelve.
> - **ChatGPT y Codex** hacen lo **fuerte**: datos, render, física, IA y modelos.
> - **Gemini y Antigravity** hacen lo **fácil y mediano**; su lista está en `docs/PEDIDOS-GEMINI-5.0.md`.
> - El arte (imágenes) lo hace ChatGPT; el código y los commits, Codex, en `juanfeliperico369-stack/motorcity`.
>
> Este documento reemplaza a `docs/PEDIDOS-CHATGPT-4.9.md`, que queda como historial.

## 0. Antes de empezar (obligatorio)
1. **Lee, en orden:**
   - `CONTEXTO-RELEVO.md`;
   - **`docs/PLAN-5.0.md`** (el plan, los motores de los que se toman ideas y quién hace qué);
   - `docs/PLAN-REALISMO.md`;
   - `docs/TURNO-CERO.md`;
   - `BITACORA.md` (entradas 4.8 a 5.0);
   - `CLAUDE.md`;
   - las skills de `.claude/skills/` que toquen tu tarea.
2. **Rama propia:** `ia/chatgpt/<tema>`, una por tema, partiendo de `main`. Nunca `push --force`, ni push a `main` o `gh-pages`. Claude une y publica.
3. **Reglas que no se negocian:**
   - un solo HTML que anda sin internet;
   - español de Colombia;
   - no romper los guardados (`motorcity.turnocero-v1` y los de cada juego);
   - Turno Cero es 18+; EnCicla, El Metro y Run, de familia y sin violencia;
   - sala limpia: ideas de otros motores sí, su código no;
   - nada de llaves ni secretos.
4. **Imágenes:**
   - las fotos de la ciudad solo se usan para mirar y adaptar; nunca se montan en el motor ni se calcan con programas;
   - todo arte que entra lo dibujas tú, sin texto, sin logos y sin marcas.
5. **Peso:**
   - lo que se incrusta en el HTML va en su tamaño de juego (ejemplo: `herramientas/fachadas_juego.py`);
   - los originales grandes quedan en el repositorio;
   - **di cuántos KB suma tu entrega al HTML de Turno Cero.**
6. **Pruebas en verde antes de cada push:**
   - `node herramientas/construir.mjs`;
   - `node pruebas/prueba.mjs --navegador`;
   - `node pruebas/tres.mjs`;
   - `node pruebas/dinamica.mjs`;
   - `node pruebas/humano.mjs`;
   - `node pruebas/modos.mjs`;
   - las de tu tarea.
7. **Al terminar cada pedido:**
   - deja tu entrada en `CONTEXTO-RELEVO.md` § 8;
   - deja un mensaje en `coord/buzon/AAAAMMDD-HHMM-chatgpt-<tema>.md`;
   - actualiza `coord/agentes/chatgpt.json`.

## 1. Lo que se recibió de ti y ya está en `main`
- **R1 · Atlas de fachadas de Medellín:** las 6 familias, con día y noche, en el 3D realista. Claude solo cambió el peso:
  - en el HTML van copias de 1024 (albedo) y 512 (emisión), que suman 1,4 MB en vez de 6,7;
  - la prueba `pruebas/r1-fachadas.mjs` abre el HTML como archivo y ya está en la QA.
- **R3 y R4 · Investigación inicial:**
  - `3DConstruccciones` solo cubre Popular, El Poblado y Robledo;
  - `Lotes_Febrero_2026` no trae pisos;
  - Overpass falló.
  Siguen abiertos (abajo).

## 2. Orden de trabajo
| # | Id | Pedido | Contrato técnico | Entrega |
|---|---|---|---|---|
| 1 | **R8 + Spider-Man** | **Ventanas con cuartos falsos** (interior mapping) de noche, SSAO solo en GPU buenas, faroles con luz de verdad y agua con reflejo | En `js/45-tres.js`, en el material de las fachadas R1: un cuarto falso por vano, según el modulo de 2,7 × 3 m. Todo depende de la calidad y de `GPU.perfil()`; en gama baja, nada | Código + capturas antes y después + `pruebas/tres.mjs` en verde |
| 2 | **R4** | **Techos de OSM** (`roof:shape`, `roof:levels`, `building:colour`, `roof:colour`) | Fuente sugerida: un extracto `.osm.pbf` de Colombia (Geofabrik) procesado fuera de línea en `geo/`. Cruza por id o por geometría sin asignar etiquetas al edificio equivocado. Son campos opcionales en ED1 y los MC4 viejos siguen sirviendo | MC4 + informe de cobertura + prueba |
| 3 | **R3** | **Pisos del catastro en todas las comunas** | Busca la capa oficial que cubra todas las comunas (o la combinación de varias) y mide la cobertura antes de cambiar nada. Si no existe, propón la estimación por tipo de lote y estrato y márcala como estimada | Informe + MC4 si la cobertura pasa del 60 % |
| 4 | **C5‑01** | **Motos que se inclinan** (con el piloto), **carros que se vuelcan** y **deformación** en los choques fuertes | Sobre `MC.Dinamica` (`js/37-dinamica.js`): ya existen `alabeo` y `cabeceo`. En la moto, el ángulo de inclinación es atan(v·r/g) hacia adentro de la curva, y el piloto del GL (`45-gl.js`, `_dinamico`) se inclina igual. El vuelco va con aceleración lateral alta o con rampas, con el auto-enderezado de los juegos. La deformación por zonas ya existe (`op.dano`) | Código + prueba en `pruebas/dinamica.mjs` |
| 5 | **C5‑02** | **Los ~30 sitios icónicos de Medellín modelados** | Con las fichas de Gemini (G5‑07): modelos GLB de bajo polígono propios (en `juegos/getaway/arte3d/` o `arte/sitios/`) o mallas por código. Se ponen en el lugar real y reemplazan la huella genérica. Peso total por debajo de 1,5 MB comprimido | Modelos + manifiesto + capturas |
| 6 | **R6 + C5‑04** | **Mundo grande sin tirones:** mallas pre-cocinadas por sector de 1 km en 3 niveles de detalle, y **hilos aparte** (Web Workers creados con Blob desde el mismo HTML, sin internet) para descomprimir y armar mallas | Medir arranque, memoria y p95 del cuadro antes y después, con la CPU 4× más lenta | Herramienta + prueba de memoria + informe |
| 7 | **C5‑05** | **Policía con tácticas** (planificación por objetivos, idea de F.E.A.R.): cerrar la calle de adelante, rodear, retenes y helicóptero con reflector. La zona de búsqueda se ve en el mapa | `js/28-busqueda.js` y `28-persecucion.js`; sin violencia gráfica | Código + prueba de persecución |
| 8 | **C5‑06** | **Multitudes y tráfico en arreglos de números** (idea de *The Matrix Awakens* y de Hitman): miles de agentes, los cercanos piensan mucho y los lejanos casi nada | `js/21-trafico.js` y `25-ia.js`; el formato de `agentes` se mantiene para quien los lee | Medida: agentes por cuadro con p95 de 33 ms o menos |
| 9 | **C‑M33** | **Animación con pocas poses, resortes y física** (idea de Overgrowth): caminar, correr, subirse y bajarse del carro, y pies sobre el terreno | `MC.Modelos.posar` y `js/30-personaje.js` | Código + capturas |
| 10 | **R2** (arte) | Texturas de bajo polígono para 6 vehículos y 6 personajes de Turno Cero | Un atlas de 1024 por familia, sin marcas | `arte/modelos/turno-cero/texturas/` |
| 11 | **R7** | El globo dentro de la misma escena 3D | `MC.GloboGPU` y el anillo de `MC.Planeta`, sin corte al alejar | Módulo + prueba |
| 12 | **V6** | Plano histórico de Medellín, como «Buenos Aires, de 1867 a 1950» | Un plano escaneado de dominio público, con su licencia en `docs/` | `geo/` + informe |
| 13 | **C5‑08** | Peatones que trastabillan si los rozas (tropiezo cómico en los juegos de familia) | Muñeco simple de física (idea de GTA IV; Euphoria es un producto pagado, se toma solo la idea) | Código |
| 14 | **C5‑09** | Trepar fachadas a pie en Turno Cero (idea de Assassin's Creed) | La altura de cada edificio se conoce (ED1) | Código + prueba |
| 15 | **C‑M35, C‑M36, C‑M38** | Piezas que se sueltan y humo y fuego en 3D; pasar el motor y la sirena a `js/61-sonido.js` para todos los juegos (el tono por rpm ya está en `MC.PersecucionAudio.motor`); interiores con sectores y portales | Ver `docs/PEDIDOS-CHATGPT-4.9.md` § 3 | — |
| 16 | **C5‑07 y C5‑10** | Rivales que aprenden de grabaciones (idea de Forza) y **misiones en serie** | **Esperan** a que Claude publique el lenguaje de misiones y las repeticiones exactas (fase 4) | — |
| — | **R5** | Relieve: propuesta con licencias | Sigue esperando la decisión del autor | Informe en `reportes/` |

## 3. Lo que no es tuyo
- Medir en un celular real con GPU (es del autor).
- Las tareas de Gemini (`docs/PEDIDOS-GEMINI-5.0.md`).
- Lo que solo toca a un juego hermano (EnCicla, El Metro, Run).

## 4. Cómo informar
Por cada pedido, en 5–10 líneas:
- qué hiciste;
- cómo lo probaste (comandos y números);
- cuántos KB suma al HTML;
- qué aprendiste;
- qué falta.

Pon las capturas de antes y después en `reportes/` cuando el cambio sea visual.
