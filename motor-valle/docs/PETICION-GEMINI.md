# Petición para Gemini (Antigravity) · arte del motor y auditoría visual

**De:** Claude, la IA del motor Motor City · **Para:** Gemini, en Antigravity (agente de código) y Nano Banana (imágenes).
**Entrega:** **un solo documento**, `ENTREGA-GEMINI-MOTOR-CITY.md`, con absolutamente todo: texto, código e imágenes en base64. El autor (OneZero) me lo pasa y yo lo uno, lo pruebo y lo mejoro.

## 0. Antes de empezar (obligatorio)
1. Lee, en `juanfeliperico369-stack/motorcity` (rama `claude/motor-city-engine-xu7p4y`), en este orden: `README.md`, `CONTEXTO-IA.md`, `MOTOR.md` (sobre todo §5 a §7) y este documento.
2. Abre `dist/motor-city.html` en Chrome y **juega**:
   - las 8 vistas (teclas 1–8) y el pixel (P);
   - la panorámica (4) de día y de noche (H);
   - Run en una ciclovía (R);
   - varios vehículos (B).
3. Mira los dibujos actuales del motor: `js/30-personaje.js` (personaje de lado y cenital), `js/42-vehiculos-lado.js` (vehículos de perfil), `js/40-dibujo.js` (losas y techos) y `js/43-panoramica.js` (capas de la panorámica).
4. Mira cómo son los juegos que usarán tu arte:
   - Juega EnCicla (`BicicletasUno`): pixel y ciudad 3D, verde EnCicla `#7ab800`;
   - El Metro (`MetroZero`): su `arte/00-biblia-de-estilo.md`, sus paletas y su skill `el-metro-arte`;
   - Run Scooter (`RunRunZero`): EMSAY, low‑poly.

## 1. Tu rol
**Arte del motor** (la piel por defecto, «Motor City») y **auditoría visual** de la fidelidad de Medellín.

**No es tu rol:**
- la física, el formato de datos, las pruebas de código ni la interfaz del banco de pruebas: eso es de ChatGPT;
- el arte propio de cada juego: eso lo hacen sus IAs.

## 2. Reglas de todo el arte
- **Sin texto, sin logos y sin marcas reales** dentro de las imágenes.
- Para todo público.
- **Arte por código cuando se pueda:** funciones de Canvas 2D listas para `MC.arte.registrar('motor', {...})`. Pesa poco, escala y sirve en pixel y en alta resolución.
- **Imágenes solo para lo que el código no logra:**
  - WebP con transparencia, en base64 dentro del documento;
  - nombre `id` en minúsculas con guiones bajos;
  - tamaño exacto pedido;
  - **de perfil, mirando a la derecha**; **cenital, mirando al oriente (+x)**;
  - escala: **16 px por metro** en el arte fuente (el motor escala);
  - la luz viene de arriba a la izquierda;
  - sin sombra proyectada (el motor la pone).
- Paletas por zona: las de `ciudades/medellin.json` (`zonas`). Si propones cambios, que salgan de mirar Medellín desde arriba (dron y satélite) y **di de dónde** (lugar y tipo de fuente). Nunca copies imágenes al juego.

## 3. Encargos (en este orden; el **G‑M0** primero, como ancla de estilo)
| Id | Encargo | Formato |
|---|---|---|
| **G‑M0** | **Ancla de estilo**: una lámina con el personaje en bici EnCicla de perfil, un carro, una casa de ladera y una torre de El Poblado. Debe verse bien a la vez en pixel (×3) y en suave, para fijar trazo, sombreado y paleta. | 1 imagen 1024×512 + 1 párrafo de reglas |
| **G‑M1** | **Personaje de perfil**: `personajeLado(g, J, A, x, y, esc, dir)`, que mejore la del motor. Usa la pose `J` (articulaciones en metros), el aspecto `A` (piel, pelo y peinado 0–5, camisa, pantalón, zapatos, casco, gafas, barba, morral, chaleco) y los estados de `MC.Personaje.pose`. | Código JS |
| **G‑M2** | **Personaje cenital**: `personajeArriba(...)`, legible a 2–4 px por metro (caminar con piernas alternas). | Código JS |
| **G‑M3** | **Vehículos de perfil**: `vehiculoLado(g, V, x, y, esc, dir, C)` para **los 35** de `MC.Vehiculos`. Las ruedas giran con `C.fase`. El jetpack lleva llama. Avioneta y lancha deben verse bien en el aire y en el agua. | Código JS (puede reemplazar todo `42-vehiculos-lado.js`) |
| **G‑M4** | **Vehículos cenitales** para el tráfico (`Pincel.vehiculoArriba`): carro, taxi amarillo de Medellín, moto, buseta, camión, bici y Metroplús. | Código JS |
| **G‑M5** | **Fachadas por zona** para la panorámica y la ciudad 3D: ventanas, balcones, rejas, tanques, toldos de locales y ladrillo a la vista, en ladera, centro, Laureles, El Poblado, mixto, pueblo e industria. Debe ser una función `fachada(g, x, y, w, h, zona, semilla, noche)`. | Código JS |
| **G‑M6** | **Siluetas de los 30 hitos** (`mundo.hitos`): Coltejer, Basílica, Palacio de la Cultura, Biblioteca España, Teatro Metropolitano, Orquideorama, EPM, Plaza Mayor… Como *paths* normalizados (0–1) por `id`, para la panorámica de lejos. | JSON de *paths* |
| **G‑M7** | **Cielo y nubes** de la panorámica: tres tipos de nube (cúmulo, estrato, tormenta) y el atardecer paisa (naranja y rosado sobre las laderas). Debe ser una función `nubes(g, W, H, t, tipo, cielo)`. | Código JS |
| **G‑M8** | **Run con piel de EnCicla y de El Metro**: paleta de la vía, del cielo y del escenario para `RUNV.cielo` y la vía (ver `js/50-run.js` y `zoneEnv` en `run/run-scooter.js`). Verde EnCicla para EnCicla y los colores de línea para El Metro. | JSON de paletas + código |
| **G‑M9** | **Íconos de las 8 vistas** y del pixel, para los botones: SVG de 48×48, de un solo trazo y sin texto. | SVG en el documento |

## 4. Auditoría visual (Antigravity: juega y compara)
Recorre estos lugares con el menú 📍 (Ir) y las vistas cenital, ciudad 3D, panorámica y dron. Compáralos con lo que sabes de Medellín:
- Parque Berrío y Coltejer;
- La Alpujarra;
- Pueblito Paisa (Nutibara);
- Santo Domingo y Biblioteca España;
- El Poblado (Parque Lleras);
- Laureles (La 70);
- Estación Universidad y Parque Explora;
- Comuna 13;
- Envigado;
- Bello.

Para cada hallazgo:
- **dónde** (lugar y vista);
- **qué está mal** (color de zona, altura, forma de un emblemático, vegetación, densidad, techos);
- **cómo debería ser** (la regla, con su fuente);
- **qué cambiar:** archivo y línea, o el valor en `ciudades/medellin.json`.

Mide también en un **celular real** (Android medio):
- cuadros por segundo de cada vista, en tercera persona sobre todo;
- tiempo de carga;
- si se calienta.

## 5. Cómo entregar (un solo documento)
```
# ENTREGA-GEMINI-MOTOR-CITY
## Resumen (10 líneas: qué hiciste, cómo lo probaste, qué falta)
## G-M0 … G-M9 (cada uno: código listo para pegar, o imagen en base64 con su id y tamaño, y una nota de uso)
## Auditoría visual (tabla: lugar | vista | hallazgo | regla y fuente | cambio propuesto | prioridad)
## Rendimiento en celular (modelo, navegador, FPS por vista, carga)
## Reglas aprendidas (para la próxima vez)
```
**Comprueba antes de entregar:**
- el código corre en `dist/motor-city.html`: pégalo en la consola con `MC.arte.registrar('motor', {...})` y míralo;
- nada de texto en las imágenes;
- vista y escala correctas.
