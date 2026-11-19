---
name: motor-city-arte
description: El arte en Motor City - pieles por juego con funciones de dibujo (hooks MC.arte), paletas por zona, estilos y dimensiones (cenital, 3D, maqueta 2:1, panorámica, pixel, WebGL), arte procedural primero y cómo pedir arte a Gemini y ChatGPT (un solo documento de entrega). Úsala al crear, revisar o integrar arte del motor o de un juego.
---
# Motor City · arte

- **Primero, arte por código.** Las funciones de Canvas 2D se registran con `MC.arte.registrar(juego, {...})`:
  - `personajeLado(g, pose, aspecto, x, y, esc, dir)` y `personajeArriba(...)`;
  - `vehiculoLado(g, V, x, y, esc, dir, cuerpo)` y `animalLado(g, a, x, y, esc, dir, t, v)`;
  - `suelo` (paleta por TT) y `via`.

  Un mismo personaje (la pose del esqueleto) se ve en todas las vistas.
- **Pixel** = cualquier vista en un búfer de 1/3, agrandada sin suavizado (`vistas.pixel = true`). Sirve en 2D, en 3D y en la panorámica.
- **Las zonas de estilo** de cada ciudad están en `ciudades/<id>.json` y salen de mirarla desde arriba. Nunca se copian imágenes al juego.
- **Imágenes** (solo lo que el código no logra): sin texto ni logos; de perfil mirando a la derecha; cenital mirando al oriente; 16 px por metro; luz de arriba a la izquierda; sin sombra proyectada; WebP con transparencia y en base64.
- **Pedir a Gemini y ChatGPT:** `docs/PETICION-GEMINI.md` y `docs/PETICION-CHATGPT.md`. Cada uno entrega **un solo documento**, y la IA del motor lo integra y lo prueba.
