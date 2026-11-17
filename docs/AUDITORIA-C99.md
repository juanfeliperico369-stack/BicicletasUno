# Auditoría de la entrega C-99 (arte y guion de las IA)

**Fecha:** 17 de noviembre de 2026 · **Versión del juego:** v1.1.0 · **Entrega:** paquete C-99 consolidado por ChatGPT (incluye lo de Gemini).

## 1. Qué llegó y cómo se verificó
| Bloque | Cantidad | Verificación |
|---|---|---|
| Arte G (propuestas en lugar de Gemini) | 220 PNG | reconstruidos desde el MD maestro; SHA-256 idéntico al manifiesto |
| Arte C (ChatGPT) | 72 PNG | ídem |
| Guion H | 10 JSON + 2 MD | los 10 JSON son válidos; límites de caracteres revisados |
| Informe de Gemini | solo texto (17 imágenes descritas, sin los PNG) | no se pudo usar como arte |
| Parche de calendario | script, sin aplicar | contrastado con la página oficial (ver 4) |

Todo quedó archivado sin cambios en `arte/entregas/2026-11-17-c99/` (imágenes, `manifiesto.json`, guion original y `LEEME_ENTREGA.md`).

## 2. Arte: revisión visual
- Las 220 piezas **G** son dibujos generados con código, no ilustraciones. Las postales comparten el mismo fondo; las escenas de historia repiten la ciudad con un personaje; las hojas de personaje muestran cuatro veces la misma vista frontal.
- En las hojas **C**, los ciclistas y peatones no tienen animación (los 4 cuadros son iguales) y no están en vista cenital. Las bicis de C-10 no se leen como bicis. Algunos íconos y la vegetación C-21 sirven como referencia.
- **Decisión:** no se integraron al juego, porque no superan el dibujo actual. Quedan archivadas como preproducción. Sirven para encargar el arte final, con la biblia de estilo del documento para IA.

## 3. Guion: qué entró al juego (curado en `contenido/guion/`)
| Archivo | Origen | Uso en el juego |
|---|---|---|
| `dia_del_valle.json` | H-10, reescrito y reordenado por hora | campaña **Un día del valle**: 15 capítulos jugables y el epílogo de los 15 años |
| `ciudad.json` | H-30 (96 frases, 8 contextos) | peatones que hablan según la hora, la lluvia, la fiesta, la ciclovía y la cercanía a una estación |
| `tutor.json` | H-50 | un consejo en la ficha de cada turno |
| `fiestas.json` | H-60 | saludo de un personaje al entrar al modo libre en día de fiesta |
| `metro.json` | H-70 y las frases guardadas | Rosalba en Niquía, en el Maquinista secreto, cumpleaños del Metro y enlace en los créditos |
| logros | H-40, ajustado a lo que el juego mide | 8 logros por oficio, además de *Un día del valle* y *Antes del primer tren* |

No entraron:
- Los 24 “turnos nuevos” de H-20: son plantillas sin contenido.
- La minihistoria de la nieta de H-70: repite los mismos textos en las 5 escenas.
- Los 22 textos de H-20 que copian los del juego tal cual.

## 4. Horario: página oficial (encicla.metropol.gov.co, consultada el 17-11-2026)
| Día | Oficial | En el juego |
|---|---|---|
| Lunes a viernes | 5:30 a. m. – 10:00 p. m., último préstamo 9:00 p. m. | se presta hasta las 8:59 p. m. y se recibe hasta las 10 (regla del autor) |
| Sábados | 6:30 a. m. – 8:00 p. m., último préstamo 7:00 p. m. | hasta las 6:59 p. m.; se recibe hasta las 8 |
| Domingos | 8:00 a. m. – 4:00 p. m., último préstamo 3:00 p. m., sin estaciones manuales | **corregido:** se presta hasta las 2:59 p. m. y se recibe hasta las 4 |
| Festivos | “No hay servicio” | **igual al domingo** (regla del autor); queda pendiente que el autor lo confirme |
| Horario especial | Museo de Antioquia 5:30 a. m. – 5:30 p. m.; I.U. ColMayor 5:30 a. m. – 7:00 p. m.; Área Metropolitana 5:30 a. m. – 7:00 p. m. (temporalmente fuera de servicio) | Museo de Antioquia (`botero`) y Área Metropolitana (`amva`) cierran a su hora; ColMayor no está entre las estaciones del juego |

## 5. Observaciones de la auditoría C-99
| Observación | Decisión |
|---|---|
| Strikes y suspensiones del préstamo | se mantienen: son reglas que dio el autor |
| `user-scalable=no` | se mantiene: el zoom del navegador rompe los controles táctiles |
| `?unlock=1` | se mantiene: solo sirve para probar |
| Internet sin servidor TURN | sigue igual; red local y Bluetooth no lo necesitan |

## 6. Mapa (pedido del autor durante la integración)
- **Adelgazamiento de Zhang-Suen:** las zonas anchas de calle se reducen a su eje antes de vectorizar. Los tramos pasan de 183.683 a 74.376, sin planchas de asfalto con decenas de tramitos encimados, y la carga no se demora más.
- **Modo pixel:**
  - El asfalto solo se dibuja donde pasa una calle; el resto de esas casillas se ve como plaza.
  - Las rayas siguen el eje de cada calle, no los carriles de tráfico.
- **Cebras:** en cada semáforo, una por calle que llega, atravesada y perpendicular a ella. Ya no van a distancias fijas que caían en medio del asfalto.
