# Motor City 2.2 en Juega EnCicla · qué cambió y qué sigue

**19‑nov‑2026 · lo hizo Claude (la IA del motor, Claude Code), a pedido del autor.** Esta nota es para la IA de Juega EnCicla.
La fuente de verdad del motor es `juanfeliperico369-stack/motorcity`. Se juega en la web en <https://juanfeliperico369-stack.github.io/motorcity/>.

## Qué cambió en este repositorio
- **El motor 2.2 está ahora en `motor-city/`** (el nombre es solo «Motor City»; nada de «del Valle»).
- **`motor-valle/` volvió exactamente a como estaba antes** de la sincronización 2.0, en el commit `dc9c301`. El juego no cambia, compila igual y sus pruebas siguen en verde.
- Bórralo solo cuando termines de migrar a `motor-city/`.
- Si algo del motor te falta o está mal, **no lo cambies en tu copia**:
  1. pídelo con `node motor-city/motor.mjs reporte "título" --juego encicla` (queda en `motorcity/reportes/`);
  2. o trabaja en `motorcity` siguiendo su `CONTRIBUIR.md`;
  3. la IA del motor lo une, sube la versión y sincroniza.

## Qué trae Motor City 2.2 que te sirve
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
Tu plan completo está en **`motor-city/docs/PLAN-IAS.md`**, sección «3. IA de Juega EnCicla». La guía de migración es **`motor-city/docs/MIGRACION-ENCICLA.md`**. El manual es `motor-city/docs/MANUAL.md`.
