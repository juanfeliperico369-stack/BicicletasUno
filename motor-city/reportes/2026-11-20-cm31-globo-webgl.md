# C-M31 · Globo del planeta en WebGL2

**Añadido:** `js/13-globo-gpu.js`: globo fragment-shader sin texturas externas, con 11 segmentos de bioma de `MC.Planeta.ANILLO`, relieve procedural estilizado, luz solar, aproximación de dispersión atmosférica, estrellas y marcador del jugador.

**Interfaz:** `#ggl` debajo de `#gcv`; la capa de captura táctil original sigue activa. La función `pintarGlobo` intenta GPU y conserva `MC.Planeta.globo` en 2D en ausencia de WebGL2, sin descargar bibliotecas.

**Límites:** shader es una visualización del planeta **ficticio de la historia**, no cartografía terrestre. El zoom desde la calle todavía termina en un overlay animado, no en un globo renderizado en la misma escena 3D. Se requiere prueba visual/móvil con GPU física.
