# Ronda 3.8 · Claude · la compuerta en verde, todo junto y ordenado

**Fecha:** 24‑nov‑2026 · **Versión:** 3.8.0 (código 30800) · **Base:** `main` en la 3.7.0 con Motor City 5.3.1.
**Pedido del autor:** «Retoma, continúa y termina; integra todo lo nuevo, compréndelo y mejóralo» y «Hazlo» (publicar).

## 1. Lo que se entendió de lo nuevo

- **GPT‑6 / Codex (3.6):** K‑1 (el suelo por etapas), K‑2 (arte lateral opcional) y K‑3 (`publicar.yml` publica solo con todo en verde, incluido un recorrido de 2 km con la CPU 4× más lenta: p95 < 50 ms y ningún cuadro > 120 ms).
  - La compuerta nunca había pasado: en GitHub la 3.7.0 dio p95 51,4 ms y peores cuadros de 137 y 145 ms. Por eso la página seguía sin la 3.5–3.7.
- **Gemini / Antigravity (3.6):** 15 encargos, 88 frases, el bot en sus 12 modos y una auditoría a 412 × 860 que dejaba tres arreglos para Claude.
- **Motor City 5.3:** fichas de 30 sitios icónicos (Gemini), vuelcos, puentear (solo para el juego adulto), skills para todas las IA.

## 2. Lo que se mejoró

### 2.1 La compuerta de rendimiento, en verde (sin bajar la meta)
Medido con el perfilador de Chromium sobre el mismo recorrido de GPT‑6:

| Causa | Antes (CPU 4×) | Arreglo |
|---|---|---|
| «¿Estoy en una ciclorruta?» en cada cuadro | >4 % de la CPU: proyectaba sobre todas las ciclorrutas del valle | índice espacial de celdas de 256 px; el mismo resultado (`99v`) |
| GPS (algoritmo de Dial) | 68–84 ms al recalcular | por partes, 4 ms por cuadro; se ve la ruta anterior mientras tanto (`99v`) |
| Lotes de edificios de un trozo nuevo | 12–58 ms de una vez | `lotesEtapas`: el mismo cálculo, en pasos de ~2 ms y en una cola fuera del dibujo (`75`, `99v`) |
| Rasterizado del suelo | 28–52 ms en el primer `drawImage` del trozo | se rasteriza dentro del presupuesto de cada etapa (`99v`) |
| Rayas finas (pisos, bordes, centro de las calles) | 12 ms por cuadro solo en trazos | «hairline» de 1 px cuando la raya mide menos de 1,6 px (`75`) |
| Tres tareas de fondo a la vez | se apilaban en el mismo cuadro | un solo presupuesto por cuadro (`JE.fondo`), con turnos (`99v`, `99w`) |

**Resultado local** (este contenedor es ~2× más lento que el servidor de GitHub): Carrera 43A con p95 de 43 a 49 ms y peor cuadro de 56 a 74 ms; Las Palmas con p95 de 36 a 41 ms y peor de 44 a 74. Antes: p95 de 82 a 131 ms y peor de 135 a 179.
La prueba V10 comprueba que los lotes por partes y el GPS por partes dan **exactamente** el mismo resultado que de una vez.

### 2.2 La auditoría A‑4 de Gemini, resuelta
- Despacho, Maquinista, Circuito y Moravia: la línea de estadísticas ya no queda debajo de las metas (`45-mg2.js`).
- **Pestaña Más en 6 secciones plegables** (`<details>` nativo; `99u`):
  - Manejo;
  - Tu viaje;
  - Cámaras y vista;
  - Sonido;
  - Lectura y accesibilidad;
  - Todo abierto y pruebas.
  - Pasa de 3.085 px a 1.530 px al abrirla. No se quitó ninguna opción: «Controles» y «⚙️ Flexibilidad», que abrían lo mismo, quedaron en una sola fila. Además, interruptores que no se salen y botones de 40 px.
- **Valle Vivo:** una ✕ arriba para cerrar, sin bajar 1.900 px.

### 2.3 El Escalafón, ordenado
- Medía 6.231 px y los 12 oficios (el corazón del juego) estaban al fondo. Ahora mide 3.213 px.
- Arriba van tres secciones de juegos («Carreras y acción», «Juegos para pensar» y «Paseos tranquilos»), cada una con los nombres de lo que trae. Debajo, abiertos, los oficios.

### 2.4 El arte lateral de GPT‑6, integrado mejor
- Revisé las capturas de 412 × 860, como pide `CLAUDE.md`. La capa 1 es un cielo opaco de franjas planas: estirada al alto del celular, tapaba el cielo degradado de cada modo y dejaba un borde duro a media pantalla.
- Ahora se dibujan las capas 2 a 4 (edificios, árboles, viaducto o barandas) sobre el cielo del modo. La capa 1 sigue disponible con `{ conCielo: true }`.

### 2.5 Contenido
- **11 placas nuevas de lo poco conocido** (de 16 a 27), con datos comprobables sacados de las fichas de los sitios del motor 5.3: el bosque de 300 postes del Parque de las Luces, el Edificio Carré (del mismo arquitecto de la Catedral), el Palacio Nacional (otra obra de Goovaerts) y el MAMM en los antiguos Talleres Robledo, entre otras.
- **Textos corregidos:**
  - Sabaneta pasa a ser «uno de los municipios más pequeños de Colombia (unos 15 km²)»;
  - dos frases que no se entendían.

## 3. Lo poco conocido que salió de medir
- **Canvas no dibuja cuando se lo pides.**
  - Graba las órdenes y las rasteriza después, de una vez, cuando ese lienzo se pinta en otro.
  - Por eso el presupuesto de 6 ms de K‑1 medía solo la grabación (unos 11 ms por trozo), mientras el rasterizado real (unos 45 ms) caía entero en el primer cuadro que mostraba el trozo.
  - Pintar el trozo en un lienzo de 1 × 1, sin leer píxeles, obliga a rasterizar en ese momento.
- **Una raya de 1,5 px cuesta seis veces más que una de 1 px.**
  - Skia tiene un camino rápido para las líneas de un píxel o menos («hairline»).
  - Las de 1,5 px pasan por el trazador completo, con antialias.
- **Los cuadros vienen en escalones de 16,7 ms** (60 Hz): un cuadro de 34 ms de trabajo se ve como de 50 ms. Por eso la meta «p95 < 50 ms» exige, en la práctica, que casi todos los cuadros terminen en dos escalones.
- **El servidor de GitHub hace este recorrido unas dos veces más rápido** que este contenedor. Medir aquí deja margen.

## 4. Pedidos para la ronda 3.9 (prompts listos para pegar)

**ChatGPT (imágenes) · C‑140 a C‑143, el arte lateral de verdad.**
> Lee `docs/RONDA-3.8-Claude.md` § 2.4 y `arte/entregas/2026-11-23-gpt6-c130-c133/manifiesto.json`. Las capas C‑130 a C‑133 de la 3.6 son prototipos hechos por código. Pinta las de verdad, con los mismos nombres de archivo, los mismos 1008 × 432 px, pixel art de 16 bits, la paleta de EnCicla, fondo #FF00FF plano y sin texto, logos ni personas reales.
> Regla nueva: **ninguna capa trae cielo**, porque cada modo pinta el suyo. La capa 1 es la lejana (montañas o el perfil de la ciudad), con el cielo en magenta.
> Haz cuatro capas por escena (Comuna 13, Línea A y Las Palmas) que empalmen a la izquierda y a la derecha. Entrégalas en `arte/entregas/<fecha>-chatgpt-c140-c143/`, con `manifiesto.json` (SHA‑256).

**Codex («astra», lo fuerte) · K‑4 y K‑5.**
> Lee `docs/RONDA-3.8-Claude.md` y `src/js/99v-rendimiento.js`.
> - **K‑4:** lleva el presupuesto común (`JE.fondo.limite/turno`) a las mallas del mundo 3D (`99d`, `99o`), que todavía llaman `M.lotes` de una vez.
> - **K‑5:** un juego de lienzos reutilizables para los trozos (crear un lienzo de 512 × 512 cuesta de 3,5 a 4,8 ms con la CPU 4×). Ojo con el estado del contexto al reutilizarlo.
> Mide antes y después con `node tests/benchmark-2km-gpt6.mjs --assert` y entrega con `node tests/run.js` en verde. No cambies la meta de la compuerta.

**Gemini (Nano Banana) · G‑130 y G‑131** siguen pendientes (la cuota se agotó en la 3.6). Los prompts están en `docs/AUDITORIA-CAPTURAS-Y-MAS-3.6-GEMINI-ANTIGRAVITY.md` § 5.

**Gemini con Antigravity («hydrogen», lo fácil) · A‑5 a A‑7.**
> - **A‑5:** audita a 412 × 860 y a 360 × 740 la pestaña Más y el Escalafón en secciones (`99u-todo-junto.js`), con una tabla de captura, hallazgo y gravedad.
> - **A‑6:** 10 placas nuevas de lo poco conocido fuera del centro (Bello, Itagüí, Envigado, Sabaneta, Caldas, Copacabana, Girardota y Barbosa), con su fuente pública y coordenadas reales, en el mismo formato de `src/js/87-placas.js`. Solo datos comprobables.
> - **A‑7:** el hueco de la rejilla de la Copa (3 circuitos en 2 columnas) y el aviso inicial que tapa «PARE» en el Semaforero.
> Prueba con `node tests/run.js` en verde y escribe tu entrada en `docs/BITACORA.md`.

## 5. Lo siguiente para Claude
1. Ver la compuerta en el servidor y, si pasa, la página pública con la 3.8.0 (y `/metro/` intacto).
2. Integrar C‑140 a C‑143, K‑4 y K‑5, y A‑5 a A‑7 cuando lleguen.
3. Pedirle al autor una medida con 📏 en su celular para comparar con este recorrido.
