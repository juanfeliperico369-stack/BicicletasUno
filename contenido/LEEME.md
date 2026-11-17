# Contenido del juego

`guion/*.json` es el texto del juego que se edita sin tocar el código. `tools/build.js` lo incrusta en el HTML como el objeto `GUION` (la clave es el nombre del archivo), y `src/js/83-guion.js` lo usa.

| Archivo | Qué es |
|---|---|
| `dia_del_valle.json` | campaña **Un día del valle**: `id`, `hora`, `lugar`, `rol`, `turno` (`null` en el epílogo), `titulo`, `antes`, `despues`, `fallo`, `consejo` |
| `ciudad.json` | frases de los peatones por contexto: `manana`, `hora_pico`, `mediodia`, `lluvia`, `noche`, `ciclovia`, `fiesta`, `estacion` |
| `tutor.json` | consejos por oficio (y `libre` para el modo libre) |
| `fiestas.json` | saludo por fiesta (`id` de `FIESTAS`): `rol`, `frase`, `mision` |
| `metro.json` | huevos de pascua de *El Metro*: quién habla y qué dice, enlace del juego hermano |

Reglas:
- Frases cortas: se leen en un celular, sobre el juego.
- Datos reales solo de la parte 9 de `docs/IA-ENCICLA.md`.
- `node tests/run.js` revisa que cada capítulo apunte a un oficio y a un turno que existan.
