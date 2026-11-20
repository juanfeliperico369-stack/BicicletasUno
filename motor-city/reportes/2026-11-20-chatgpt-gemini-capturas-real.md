# G-H1 · Revisión visual real de Mandados y portada (20-nov-2026)

**Evidencia:** PNG auténticos de Chromium 412×860 (DPR 2), generados por `node motor.mjs capturas` en [GitHub Actions #44752235751](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44752235751). Las imágenes no son recreaciones ni arte generado.

| Fotografía inspeccionada | Hallazgo | Gravedad | Intervención |
|---|---|---|---|
| `capturas/cenital-10h.png` | Dos bloques en el HUD muestran la misma misión («De Hecho Con Amor Deli…») y el aviso inicial ocupa gran parte del centro; distrae del punto de inicio. | Media | Se suprime el aviso redundante del **primer** mandado; vuelve a mostrarse cuando se han completado entregas. |
| `capturas/cenital-10h.png` | Algunos rótulos amarillos del mundo se leen detrás de la columna fija de botones; no son elementos CSS, se dibujan en Canvas. | Media | `MC.Vista2D.etiquetas` admite rectángulos de exclusión; Mandados reserva 84 px CSS a la derecha y se añade prueba. |
| `capturas/lateral-20h30.png` | Zócalos, árboles, iluminación nocturna y la relación de escalas son legibles; el paisaje mantiene la profundidad. Los rótulos también llegan bajo los botones. | Baja-media | Misma exclusión de etiquetas. |
| `capturas/portada-412.png` | La nueva portada editorial muestra una acción principal clara, tipografía contenida y ausencia de clichés neón/gradientes genéricos; el diseño no aparenta ser una captura del juego. | Sin hallazgos graves | Se conserva el diseño y se amplía la prueba responsiva. |

**Alcance:** aquí se examinaron **tres capturas del juego/portada**, no la totalidad de las 14 capturas del juego. La auditoría de las otras 12 capturas existentes en el artefacto, además de la revisión física en Android/iOS, permanece pendiente.

**Regla estructural:** los rótulos excluidos siguen teniendo datos; solo se omite dibujarlos cuando quedarían detrás de un control, sin afectar el mundo, su física ni su guardado.

## Auditoría completa de las 14 capturas G-H1 (segunda pasada)

Se inspeccionaron los PNG auténticos de Chromium (412×860) de la ejecución 44752235751 mediante dos planchas comparativas y ampliaciones. Las observaciones se refieren a la revisión anterior a la nueva corrección; la comparación no sustituye ensayos en un Android o iPhone real.

| Fotografía | Hallazgo | Gravedad |
|---|---|---|
| cenital-10h.png | La flecha es clara; aviso inicial duplicado y nombres bajo botones | Media |
| cenital-17h.png | Atardecer visible; fichas secundarias demasiado atenuadas | Media |
| cenital-20h30.png | Noche legible y faroles distinguibles; avisos de cámara prescindibles | Baja |
| ciudad3d-10h.png | Ciudad reconocible, pero techos naranjas homogéneos dominan fachadas | Baja-media |
| ciudad3d-17h.png | Composición estable; el contraste del HUD secundario es bajo | Media |
| ciudad3d-20h30.png | Diálogo narrativo inesperado durante la captura tapa la mitad inferior | Media |
| maqueta-10h.png | Árboles en volumen; el jugador se distingue poco a esa distancia | Media |
| maqueta-17h.png | Edificios estables; fichas de dinero y calle difíciles de leer | Media |
| maqueta-20h30.png | Luz puntual y bruma nocturna; nombres cercanos a botones | Media |
| lateral-10h.png | Árboles y capas correctos; variedad de techos limitada y jugador pequeño | Media |
| lateral-17h.png | Transición de luz plausible; fachada con escaso relieve visual | Baja-media |
| lateral-20h30.png | Horizonte oscuro con luces; no se detectaron errores graves de capas | Baja |
| capa-valor.png | Leyenda y colores presentes; diálogo narrativo invade el mapa | Media |
| mi-casa.png | Plano y acciones caben; rótulos pequeños y gran espacio oscuro libre | Media |

**Cambios de esta pasada:** fichas secundarias con opacidad aumentada de 0,38 a 0,75; el capturador cierra diálogos narrativos mediante clic real antes de cada foto para permitir comparaciones reproducibles. La supresión del aviso inicial redundante y la exclusión de nombres debajo de los botones ya se publicaron en la entrega anterior. **Pendiente:** más variedad de techos y fachadas, localización clara del jugador en la lateral y textos del editor de casa. No se considera que estas observaciones visuales hayan pasado pruebas en GPU física.
