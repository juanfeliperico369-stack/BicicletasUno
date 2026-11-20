# TURNO CERO: MANHATTAN · Acción y espionaje 3D

**Versión:** 0.3.0 / vertical slice aislada / 20 noviembre 2026.

**Para jugar**: abre `turno-cero-accion-3d.html` en un navegador con WebGL2, sin internet. No usa CDN, servicios remotos, anuncios ni dependencias JS de terceros. Los cuatro modelos GLB base (sedán, patrulla, dron y Mara) están integrados en el HTML. Los 42 modelos separados del paquete anterior continúan disponibles como biblioteca de preproducción, no todos visibles a la vez en la escena.

## Lo implementado

- **Mundo 3D de prueba**, urbanismo ficticio 140×140 metros con 16 edificios y red vial de 25 cruces, colisiones contra edificios, sistema de cámara y minimapa del mismo estado del mundo.
- **Mara jugable a pie**, caminar/correr/sigilo (Ctrl) con animación procedural; guardias que patrullan, investigan señuelos y detectan al jugador **solo en línea de visión**; neutralización no letal cercana y pulsador ficticio de cargas limitadas.
- **Conducción de sedán 3D** con aceleración, inercia, frenado, colisiones y daño; coche policial que sigue rutas por grafo conectado y replanifica hacia la última zona observada. La persecución no representa táctica operativa real.
- **Tecnología ficticia**: visor espectral con recarga, dron de reconocimiento con batería y radio limitado, señuelos acústicos (dos cargas), sincronización abstracta de terminal, VELA/radio.
- **Misión completa**: terminal → repetidor → sedán → extracción → publicar/proteger fuentes; los cambios se guardan en `localStorage`.
- **Controles**: WASD y flechas; Shift correr; Ctrl caminar sigilosamente; Espacio esquivar a pie / freno de mano al volante; E interactuar; F combate contextual; V subir/bajar; Q visor; R dron; G señuelo; C cámara; M minimapa. Hay botones táctiles ≥44 px para las seis acciones principales y direcciones.
- **Depuración**: `window.TC3D.estado()` devuelve coordenadas, integridad, modo, alertas, draw calls y triángulos. Un modo QA aislado permite verificar etapas sin desplazamientos manuales. Sin solicitaciones de red.

## Animación 3D exportable

`juegos/getaway/arte3d/generar_actores_rig.py` crea tres **GLB rigged originales** (Mara, Rook, guardia), cada uno con esqueleto humanoide de 12 articulaciones, pesos de piel y ocho clips glTF: reposo, caminar, sprint, sigilo, golpe no letal, interacción, esquiva y reacción a impacto. Es posible importarlos en Blender o Godot y retocarlos. Los huesos se exportan como glTF `skin` y los clips como glTF `animations`.

**Diferencia técnica importante**: el juego web emplea por ahora **animación procedural por partes** para los actores visibles y cuatro GLB del paquete anterior; los tres GLB rigged exportables **todavía no se reproducen dentro del render WebGL propio**. Son activos independientes para la siguiente integración del sistema de animación. No son personajes de alta fidelidad, carecen de UV y texturas PBR finales.

## Pruebas

```sh
python3 generar_actores_rig.py
python3 validar_actores_rig.py
# En el repositorio, tras instalar Playwright y Chromium:
xvfb-run -a node pruebas/getaway-3d.mjs
```

**QA local realizado**: Chromium con WebGL2 real bajo Xvfb; cuatro tamaños 360×740, 412×860, 900×440 y 1440×900; recorrido completo, HUD, controles, visibilidad, ausencia de errores JavaScript/peticiones externas. Las capturas se guardan en `dist/getaway-3d`. Sin medición de FPS sobre teléfonos reales.

## Pendiente, sin presentar como concluido

- Manhattan geográfico construido con datos OSM/Overture licenciados, navegación multimodal y streaming de sectores.
- Integración de esta escena con `MC.Cuerpo`, `MC.Persecucion`, `MC.GuardadoSectores` y `MC.Objetos`; **la escena funciona actualmente como módulo autónomo**, no como sustitución de Mandados.
- Personajes de 15–30k tri LOD0, retopología, UV/PBR, iluminación y sombras de alta calidad, vehículos con daño modelado, animación facial, reproducción de rig glTF en el juego web, coberturas, combate avanzado y niveles adicionales.
- Accesibilidad con remapeo completo, audio, batería térmica/móvil real y pruebas de 30 FPS en dispositivos físicos.

Los diseños son originales. Influencias del cine de agentes secretos se limitan al género, no a identidades, guiones o iconografía protegida. Los personajes y gadgets son ficción; las acciones de acceso informático son puzles abstractos.
