# ChatGPT · Motor City 5.2 — C5-01: vuelcos y daño por zonas

**23 noviembre 2026 (Colombia). Firma: ChatGPT (OpenAI).** Rama: `ia/chatgpt/c5-01-vuelcos-20261123` desde `main`, sin publicar en `main`.

## Relevo de Codex: lo que ya existe y lo que falta
Claude integró R1 (fachadas) y R3/R4/R5/R6 (herramientas), y en Motor City 5.2 ya introdujo el ladeo físicamente guiado de motos y bicis (`Cuerpo._ladear`) y cuartos falsos R8. Son trabajos ya integrados que no se duplican aquí. La última CI de `main` estaba en verde: [45150423560](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/45150423560).

Según `docs/PEDIDOS-CHATGPT-5.0.md` («★ Estado 5.2»), las tareas mayores abiertas son R6-b (carga de mallas precocinadas + Worker), R4-b (atributos reales de techo), C5-01 (vuelcos/deformación fuerte), R8 SSAO/faroles/agua, C5-05 policía y C5-06 multitudes. Los datos catastrales R3 y LiDAR R5 requieren autorización de licencias.

## Hecho en esta rama

- **`js/38-vuelcos.js`**: controlador complementario de `MC.Dinamica` que dispara un evento `vuelco` cuando existe aceleración lateral muy alta sostenida o un choque de costado fuerte, con umbral proporcional al ancho y altura del centro de gravedad (`9.81 × 0.46 × ancho / cgAlto`). No agrega física imaginaria a los coches de la IA ni a las bicicletas y motos.
- Cuando ocurre un vuelco: un único evento de inicio, animación lateral de aproximadamente **2,65 s**, pérdida de velocidad y final **`enderezado`**. La coordenada física 2D del coche conserva sus colisiones y los guardados antiguos; no hay teletransporte.
- **`js/45-gl.js`**: el modelo 3D del coche usa el ángulo lateral `C.vuelco` sumado al alabeo de suspensión y un pequeño ajuste vertical para que el giro no lo hunda completamente.
- **`juegos/getaway/20-juego.js`**: un vuelco causa daño adicional limitado en los paneles laterales ya soportados por el motor, rebaja la salud del carro y muestra un aviso de recuperación; el sistema de reparación antiguo permanece.
- **`pruebas/vuelcos.mjs`**: baterías deterministas de no-vuelco normal, fuerza lateral extrema, choque lateral, choque frontal, vehículo quieto, autoenderezado y exclusión de IA/arcade/motos.
- **`.github/workflows/c5-vuelcos-qa.yml`**: compila el juego offline, verifica el nuevo test y conserva `pruebas/dinamica.mjs` y `node motor.mjs prueba` como regresiones.

## Límites honestos

Este módulo es una **representación visual jugable de vuelcos**, no una simulación rígida de seis grados de libertad: las colisiones continúan en el plano 2D y no se permite circular invertido de manera persistente. La fuerte deformación 3D se apoya en el daño por zonas de `Malla.modelo` existente; la transformación no aplica a la malla primitiva fallback si no hay un GLB. El motor sigue necesitando un sistema más general de piezas desmontables bajo C-M35.

No se ha medido FPS en Android/iOS real. El impacto al HTML es solo código, sin nuevas imágenes ni datos cartográficos. **Los KB exactos deben tomarse del resultado de la compilación/CI**, no estimarse como si fueran medidos.

## Pruebas y pasos siguientes
1. Verificar [workflow dedicado C5-01](https://github.com/juanfeliperico369-stack/motorcity/actions) y la CI general de PR; corregir cualquier fallo sin desactivar pruebas.
2. Capturar 3D con coche volcado en modo real para evaluar si el ángulo se aprecia, si el cuerpo no atraviesa el piso y si se respeta la cámara de primera persona.
3. Tras revisión de Claude, fusionar de forma coordinada; preservar `motorcity.turnocero-v1`.
4. Retomar **R6-b** en rama independiente, con carga por sectores de 1 km y Worker Blob dentro del mismo HTML, priorizando no duplicar la geometría ni incrustar decenas de MB.
5. Solo con licencia aceptada continuar R3-b/R5-b; R4-b requiere evidencia de IDs y geometría antes de aplicar techos.

**Relevo obligatorio a la siguiente IA:** añadir entrada propia al §8 de `CONTEXTO-RELEVO.md`, ficha en `coord/agentes/` y un mensaje nuevo en `coord/buzon/`, detallando trabajo, pruebas ejecutadas, pendientes y riesgos. Firma: ChatGPT (OpenAI).
