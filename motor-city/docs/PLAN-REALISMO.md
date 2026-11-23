# Plan de realismo · Motor City 4.9 (Claude, 22‑nov‑2026)

El autor: «Nuestro motor no logra mapear todo tal cual: no hace los relieves, las topografías, las casas y los edificios como son; los gráficos aún son básicos. ¿Qué debemos hacer?». Después: «Te apruebo [incrustar three.js]: haz todo eso que propones y sigue mejorando… las imágenes de la ciudad las usamos para mirar, copiar y adaptar, no se montan en el motor».

## 1. El diagnóstico (lo medido, no lo supuesto)

| Parte | Cómo estaba | Por qué se veía básico |
|---|---|---|
| **Luz y materiales** | WebGL propio de 2.x: colores planos, luz por vértice, sombras pintadas en 2D | Era el nivel de los motores de 1996 a 2000. La geometría ya era rica: ventanas con marco, balcones, techos a dos y cuatro aguas, tanques y árboles por especie. |
| **Relieve** | SRTM, unos 30 m por punto, en malla de 10 m | Las lomas salen lisas: sin cortes, muros ni terrazas. |
| **Alturas** | Pisos oficiales en 3 comunas; en el resto, estimados por zona | Las torres y las casas no tienen su altura real. |
| **Fachadas y techos** | Generados por tipo y altura | No son los de cada edificio. |

## 2. Lo que se hizo en 4.9

- **three.js 0.170 (MIT) incrustado** en `dist/motor.js`, sin internet. La licencia va en `js/vendor/LICENSE-three.txt` y en la cabecera.
- **`MC.VistaTres`** (`js/45-tres.js`) dibuja las mismas regiones y mallas del motor, con:
  - luz física y sol con sombras de verdad (mapa de sombras que sigue a la cámara, alineado a sus texeles);
  - luz de cielo hemisférica y reflejos suaves en los objetos;
  - exposición «Khronos PBR Neutral», que respeta la paleta;
  - niebla del clima y domo de cielo;
  - ventanas que brillan de noche;
  - grano procedural en muros, con juntas en el ladrillo, y en el suelo, con manchas.
- **⚙️ Gráficos:** automático (realista si la GPU no es de gama baja), realista o clásico, con cambio en caliente.
- **Prueba:** `pruebas/tres.mjs`.
- **Lección aprendida:** en three.js 0.163 y posteriores, `scene.environment` usa `scene.environmentIntensity` y no el `envMapIntensity` de cada material. Teñía de azul todo lo que mira hacia arriba. Los reflejos van por material.

## 3. Lo que sigue, en orden de valor

### A. Datos: que la ciudad sea «como es» (craqueo, `geo/territorio.py`)
1. **Pisos del catastro en todas las comunas.** Hoy solo están Popular, El Poblado y Robledo. Es el mismo portal de GeoMedellín que ya usamos (lotes de febrero de 2026); se cruzan las huellas con el lote.
2. **Techos de OpenStreetMap** donde estén etiquetados (`roof:shape`, `roof:levels`, `building:colour`, `roof:colour`).
3. **Relieve:** hay que decidir la fuente, por licencia.
   - Copernicus GLO‑30 y ALOS AW3D30 son abiertos, pero son modelos de superficie: incluyen edificios y árboles.
   - FABDEM sí los quita, pero su licencia es CC BY‑NC‑SA (no comercial).
   - Mejor opción: un modelo de terreno de la Alcaldía, si lo publica (por verificar en GeoMedellín).
   - Mientras tanto, se añade detalle procedural: cortes de vía, muros de contención y lotes en terraza en las laderas.
4. **Planos históricos:** como «Buenos Aires, de 1867 a 1950» (three.js, el plano escaneado como suelo, huellas leídas de la trama y 8 etapas). Para Medellín hace falta un plano escaneado de dominio público.

### B. Dibujo
1. **Atlas de fachadas pintado:** ladrillo a la vista, revoque pintado, vidrio, colonial. Encargo para ChatGPT o Gemini, dibujando nosotros con las fotos de la ciudad como referencia.
2. **Mallas pre-cocinadas por sector en el craqueo,** con niveles de detalle, al estilo de las 3D Tiles: el celular solo las carga.
3. **Oclusión ambiental** (SSAO) solo en gama alta; faroles con luz real de noche; agua con reflejo.

### C. «Modo nube» (juegos AAA con GPU alquilada)
El video desde la nube da calidad de consola en el celular, pero necesita internet siempre. Puede ser un modo aparte; el juego base sigue sin conexión.

## 4. Reglas de esta línea de trabajo
- **Imágenes:** las fotos de la ciudad (satélite o calle) se usan solo para mirar y adaptar. En el motor no se monta ninguna foto ajena. Google y Esri prohíben calcar con programas.
- **Lo nuevo del dibujo:** va en `js/45-tres.js` sin romper `VistaGL`, que sigue siendo el respaldo.
- **Cada cambio de luz:** se prueba con `pruebas/tres.mjs`, que mide el tinte y las sombras, y con capturas de día, mañana, noche y dron.
