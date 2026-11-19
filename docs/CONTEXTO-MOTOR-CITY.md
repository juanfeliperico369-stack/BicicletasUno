# Motor City 2.4 en Juega EnCicla · qué cambió y qué sigue

**19‑nov‑2026 · lo hizo Claude (la IA del motor, Claude Code), a pedido del autor.** Esta nota es para la IA de Juega EnCicla.
La fuente de verdad del motor es `juanfeliperico369-stack/motorcity`. Se juega en la web en <https://juanfeliperico369-stack.github.io/motorcity/>.

## Qué cambió en este repositorio
- **El motor 2.4 está en `motor-city/`** (el nombre es solo «Motor City»; nada de «del Valle»).
- **`motor-valle/` volvió exactamente a como estaba antes** de la sincronización 2.0, en el commit `dc9c301`. El juego no cambia, compila igual y sus pruebas siguen en verde.
- Bórralo solo cuando termines de migrar a `motor-city/`.
- Si algo del motor te falta o está mal, **no lo cambies en tu copia**:
  1. pídelo con `node motor-city/motor.mjs reporte "título" --juego encicla` (queda en `motorcity/reportes/`);
  2. o trabaja en `motorcity` siguiendo su `CONTRIBUIR.md`;
  3. la IA del motor lo une, sube la versión y sincroniza.

## Lo nuevo de la 2.4 (terreno y límites)
- Ya no se atraviesan edificios, emblemáticos, árboles, postes, rocas ni tráfico.
- El agua tiene tipo y profundidad: se vadea la orilla, se nada en lo hondo y la bici no entra a lo hondo.
- Las laderas muy empinadas no se suben fuera de la vía.
- Llama a `MC.Terreno.agua(mundo)` al cargar. Usa `cuerpo.bloqueo` para decirle al jugador por qué no pasa.

## Lo nuevo de la 2.3 (aprendido de SimCity, Los Sims, Cities: Skylines y Townscaper)
- **Sombras del sol** según la hora, **mobiliario urbano** (postes, árboles, bancas, paraderos y cebras), luces de noche y **fachadas por reglas**. Salen solas en `MC.Vistas`.
- **`MC.Urbe`:** zonas, demanda, valor del suelo, servicios, crecimiento y **capas de datos** (`E.capaInfo = urbe.capa('valor')`).
- **`MC.Habitante`:** alguien vive en la casa y usa los objetos según sus necesidades. **`MC.Paisaje`:** sonido ambiente.
- **Lee primero `motor-city/docs/DOCUMENTO-UNICO.md`**: el contexto completo, el código exacto a usar y tu plan.

## Qué trae Motor City que te sirve
| Pieza | Para qué en Juega EnCicla |
|---|---|
| `MC.Vistas`, con la vista **lateral** (casa de muñecas que gira de a 90°) y la **panorámica** | La panorámica de EnCicla y la vista lateral para recorrer la ciclorruta. |
| **GPU virtual:** `MC.GPU`, `MC.ResDinamica` y `MC.Raster` (3D por software) | Que la 3D ande en celulares sin GPU buena. |
| **Física de niveles por superficies** y cámara con resortes | Puentes, viaducto y deprimidos sin trampas; la cámara no atraviesa edificios. |
| `MC.Manejo` | Curvas de respuesta, giro según la velocidad, asistencias y esquemas (un pulgar, tocar para ir, inclinar…). |
| `MC.UI` | El centro libre, lo que no cambia se atenúa y un aviso a la vez. `MC.UI.verificar(ui)` lo prueba. |
| `MC.Lugares` y `MC.Desgaste` | Talleres de bici para reparar y mejorar; las estaciones EnCicla como lugares jugables. |
| `MC.Hogar` y `MC.Direccion` | La casa del jugador desde su dirección real, sin internet; se diseña con muebles. |
| `MC.Historias`, `MC.Director` y `MC.Ocurrencias` | Cultura ciudadana (ciclorruta, peatón, casco y luces) con el pilar de conciencia. |
| `MC.Sprites` | El arte del juego en atlas, con respaldo procedural. |

## Qué sigue para ti
Tu plan completo está en **`motor-city/docs/DOCUMENTO-UNICO.md`**, §9.3 («IA de Juega EnCicla»). La guía de migración es **`motor-city/docs/MIGRACION-ENCICLA.md`**. El manual es `motor-city/docs/MANUAL.md`.
