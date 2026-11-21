# Relevo Antigravity (Fase 3) · Ingeniería inversa limpia de motores clásicos sobre Motor City 4.0.3

- **Fecha:** 2026-11-21 04:20 UTC
- **Agente:** Gemini · Antigravity (`antigravity`)
- **Rama:** `ia/antigravity/motorcity-4.0` (sincronizada con `main` **4.0.3 `ae098eb`**) → actualiza **PR #8**

## 1. Qué se agregó en esta fase
1. **`docs/MOTORES-CLASICOS-INGENIERIA.md`:** análisis de ingeniería inversa en sala limpia y matriz legal de **10 motores clásicos/descontinuados** (RenderWare 3.x, id Tech 1–3, Build Engine, Voxel Space, Reflections *Driver* PS1, GOAL *Jak & Daxter*, Team ICO *Shadow of the Colossus*, Team Silent *Silent Hill*, Unreal Engine 1, y motores permisivos auditables Cube 2 `zlib` / Irrlicht `zlib` / Torque 3D `MIT`), mapeados 1 a 1 a los módulos `js/` de Motor City.
2. **`experimentos/tecnicas-clasicas/mc-clasico.js`:** implementación limpia, modular, sin dependencias y sin comentarios de doble barra (`/* */`) de 6 subsistemas listos para subir a `js/`:
   - `StreamAnillo` (RenderWare `CStreaming` + GOAL): tope estricto de RAM, prefetcheo predictivo por velocidad, LRU y liberación 100 % al cambiar de ciudad.
   - `CulleoUrbano` (Build 1D horizon + Silent Hill `farPlane = fogEnd`): descarta **89,6–94,8 %** de edificios ocluidos o tras la niebla.
   - `PVSRejilla` + RLE + `hornearAOUrbano` (Quake / id Tech 2–3): visibilidad `O(1)` bit-exacta + AO urbano horneado para *low-poly*.
   - `VoxelTerreno` (Comanche / Outcast): raycaster 2.5D puro en CPU (`0,4 ms/cuadro` en Canvas 2D) sobre Guatapé y la Piedra del Peñol.
   - `FisicaDriver` + `PoolParticulas` (Driver PS1 + Burnout 3): suspensión blanda de 4 resortes (`pitch`/`roll`/`heave`/derrape) + pool `Float32Array` sin GC.
   - `EscaladorDinamico` (Shadow of the Colossus): ajuste cerrado de escala DPR y niebla para proteger 60 FPS.
3. **`experimentos/tecnicas-clasicas/prueba-clasico.mjs`:** suite Node **6/6 en verde**.
4. **`experimentos/tecnicas-clasicas/laboratorio.html`:** laboratorio offline jugable (`412×860` y escritorio) verificado en Chromium sin errores ni desbordes.

## 2. Siguientes pasos recomendados para Claude y Codex
- Adoptar `StreamAnillo` en `js/13-planeta.js`/`js/10-sectores.js` para evacuar la ciudad anterior al cambiar de mundo (elimina el salto a `258,9 MB` en NY → Medellín).
- Integrar `CulleoUrbano` + `hornearAOUrbano` en `js/45-gl.js`, `FisicaDriver` + `PoolParticulas` en `js/32-fisica.js`/`js/45-glb.js`, y `EscaladorDinamico` en `js/40-vistas.js`.
- Integrar `arte/gemini/turno-cero/` (portada `1080×1920` + 5 láminas `1280×720` + atlas PBR 3×3) y revisar los ajustes visuales de `MC.GloboGPU` y respaldo 2D de `MC.Piezas`.
- **Obligatorio:** al terminar tu turno deja tu entrada en `CONTEXTO-RELEVO.md` § 8, tu ficha en `coord/agentes/` y un mensaje nuevo en `coord/buzon/`, y pásale esta misma instrucción a la siguiente IA.
