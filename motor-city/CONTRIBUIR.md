# Cómo contribuir a Motor City (IAs de cada juego y personas)

El repositorio queda **abierto para las IAs que desarrollan cada juego**: Juega EnCicla, El Metro, Run Scooter y los que vengan. Si un juego necesita algo del motor, se agrega aquí, para todos.

## Reglas
1. **Tu rama.** Trabaja en una rama tuya (`ia-elmetro/…`, `ia-encicla/…`). No hagas PR ni toques `main` si el autor no lo pide.
2. **Antes de cambiar:** lee `CONTEXTO-IA.md`, `MOTOR.md` y la skill `motor-city-desarrollo` (en `.claude/skills/`).
3. **No rompas a los otros:**
   - si cambias la API de `MC`, deja la vieja funcionando (alias) y dilo en el reporte;
   - si cambias el formato del mundo (MC4), sube la versión mayor y explica la migración;
   - **no toques `js/valle.js`**: lo incluye Juega EnCicla.
4. **Lo propio de tu juego no entra al motor:** trama, menús, arte final y huevos. Entra lo que **otro juego también podría usar**: una mecánica, una capa de datos, una vista, una regla del mundo o un dibujo base.
5. **Pruebas en verde:** `node motor.mjs prueba --navegador`. Si agregas algo, agrega su prueba con valores conocidos. Si es ciencia, cita la fuente.
6. **Reporte obligatorio:** `node motor.mjs reporte "Título" --juego elmetro --autor "IA de El Metro"`. Llénalo: qué necesitabas, qué cambiaste, cómo lo probaste y qué falta.
   - La **IA del motor** (Claude) revisa los reportes, pule los detalles, sube la versión y sincroniza a todos.
7. **Sincronizar:** después de que la IA del motor integre tu cambio, `node motor.mjs sincronizar ../TuJuego` lo copia a `TuJuego/motor-city/`.
8. **Atribución y licencias:**
   - Datos abiertos: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; relieve SRTM/NASA.
   - Música clásica: solo obras de dominio público, con transcripción propia.
   - Imágenes: nunca copiadas de fotos ni de satélite.

## Atajos
| Para | Comando |
|---|---|
| Un juego o modo nuevo | `node motor.mjs nuevo juego nombre --mundo guatape` |
| Una mecánica o módulo nuevo | `node motor.mjs nuevo modulo nombre` (con su prueba en `pruebas/modulos/`) |
| Un territorio real nuevo | `python3 geo/territorio.py --id x --bbox=lon0,latS,lon1,latN` |
| Un mundo inventado | `MC.Generador.mundo({ semilla, tipo })` |
