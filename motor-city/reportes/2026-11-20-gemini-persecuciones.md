# G-H19 · Persecuciones: Reckless Getaway 2, PAKO Forever y #DRIVE

**Fecha:** 20 de noviembre de 2026 · **Estado:** investigación documental verificable; el análisis fotograma a fotograma y los minutos/segundos siguen pendientes de los vídeos.

## Qué está confirmado y qué es hipótesis

| Juego | Confirmación por fuente primaria | Cámara y número de perseguidores | Escalada y recompensa | Grado de evidencia |
|---|---|---|---|---|
| [Reckless Getaway 2](https://play.google.com/store/apps/details?id=com.pixelbite.ga2) (Pixelbite) | Persecución policial y escape en vehículos. La ficha de App Store también documenta vehículos desbloqueables y mejoras, incluidos *power-ups* durante la partida. | La cámara elevada y la acción con vehículos son referencias de diseño; **no se midió** su altura, zoom, frecuencia ni el número simultáneo de perseguidores. | El objetivo de evadir la policía está confirmado; niveles precisos de búsqueda y multiplicadores no se cuantificaron. | Ficha oficial de Google Play + [App Store](https://apps.apple.com/us/app/reckless-getaway-2-car-chase/id1190553787); sin inspección del metraje. |
| [PAKO Forever](https://play.google.com/store/apps/details?id=com.treemengames.pakoforever) (Tree Men Games) | Juego de persecución con **mapa generado**, secretos, potenciadores y vehículos desbloqueables. La ficha oficial también indica formatos vertical y horizontal. | La perspectiva cenital / isométrica es característica visual documentada en la investigación previa de cámaras, no se calibraron los ángulos; cantidad de policías **sin verificar**. | El mapa cambia entre partidas; los potenciadores y la supervivencia favorecen ciclos cortos y repetibles. No se afirmó su tasa de aparición. | Fichas oficiales de [Google Play](https://play.google.com/store/apps/details?id=com.treemengames.pakoforever) y [App Store](https://apps.apple.com/us/app/pako-forever/id1352933197). |
| [#DRIVE](https://play.google.com/store/apps/details?id=com.pixelperfectdude.htdrive) (Pixel Perfect Dude) | Conducción sin fin, estilo visual inspirado en películas de carretera y acción de los años setenta. | La persecución policial **no es su mecánica central según la ficha oficial**; no se asignan número de perseguidores ni cámara medida. | El incentivo confirmado es recorrer distancias y dominar la conducción; una reseña secundaria menciona policías ocasionales, pero no permite afirmar reglas internas. | Ficha oficial de Google Play, [reseña histórica de Moorland Games](https://moorlandgames.com/drive-simple-driving-game-with-the-feel-from-the-1970s/). |

**Marcas de tiempo:** no se aportan `mm:ss` porque no se pudo acceder ni inspeccionar el metraje objetivo en esta revisión. Inventar marcas temporales daría una falsa trazabilidad.

## Decisiones recomendadas para C-M26 (originales, no copias de otros juegos)

1. **Lectura primero:** cámara alta de juego 3D con zona libre delante del vehículo. La intensidad modifica distancia y pitch de forma amortiguada; no gira con cada movimiento brusco.
2. **Persecución legible:** dos comportamientos claros del rival: seguir por el carril y adelantarse para bloquear una salida; evitar aparición instantánea delante del jugador.
3. **Escalada transparente:** construir el nivel 0–5 a partir de eventos comprobables, con desaceleración cuando se pierde el contacto; sin penalización oculta que frustre.
4. **Casi choques:** recompensar pasar cerca sin contacto con pequeñas unidades de turbo, una sola vez por vehículo y con enfriamiento; los golpes reales no cuentan.
5. **Sensación de masa:** `MC.Objetos` para conos y postes, `MC.Desgaste` para el daño y `MC.Camara.sacudir`/impacto para dramatizar. Evitar detener tiempo real de misión durante un efecto.
6. **Accesibilidad:** dificultad graduada y sacudida/partículas reducibles; botón de salida, reinicio y explicación opcional.
7. **Rendimiento:** rivales como entidades lógicas con distancia máxima a cámara y LOD; nunca crear policías sin límite; objetivos menores de 2 ms/cuadro para IA de persecución en móvil medio (meta, no medición).

## Pruebas que deben acompañar la implementación
- Tres ejecuciones con semilla idéntica producen igual orden y conducta de rivales.
- Un «casi choque» puntúa una sola vez sin colisión y no funciona si el vehículo está quieto.
- No aparecen rivales delante dentro del campo de visión.
- La persecución puede comenzar, escalar, terminar y reiniciarse sin quedar en un estado intermedio.
- El respaldo 2D y 3D usan las **mismas posiciones y físicas**.

## Seguimiento
- G-H19: **parcial**; conseguir vídeos accesibles para el muestreo por fotogramas, marcar `mm:ss` y confirmar cámara, niveles y número de perseguidores con evidencia.
- C-M26: implementar el modo «¡Te persiguen!» sobre `MC.IA` y `MC.Camara`, con pruebas de regresión. No se declara implementado por este informe.
