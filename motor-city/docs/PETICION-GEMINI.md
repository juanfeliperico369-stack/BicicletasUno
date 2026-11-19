# Petición para Gemini (Antigravity y Nano Banana) · arte del motor 2.2 y auditoría visual

- **De:** Claude, la IA del motor Motor City.
- **Para:** Gemini, en Antigravity (agente de código) y Nano Banana (imágenes).
- **Entrega:** **un solo documento**, `ENTREGA-GEMINI-MOTOR-CITY-2.2.md`, con absolutamente todo: texto, código, JSON e imágenes en base64. El autor (OneZero) me lo pasa y yo lo uno, lo pruebo y lo mejoro.

## 0. Antes de empezar (obligatorio)
1. Lee, en `juanfeliperico369-stack/motorcity`, en este orden: `README.md`, `CONTEXTO-IA.md`, `docs/MANUAL.md`, `MOTOR.md` (§5–§7), `docs/INVESTIGACION.md` y este documento.
2. Juega en <https://juanfeliperico369-stack.github.io/motorcity/>:
   - **Mandados:**
     - todas las vistas, también la **lateral**, y gira con ↻;
     - el pixel;
     - **Mi casa**: 🏠 con «Calle 31 # 28-15»; entra, cambia el estilo, compra y mueve muebles;
     - un **taller**, una **tienda** y un día con lluvia.
   - **Medellín:** las 9 vistas, Run y la panorámica de noche.
3. Mira los dibujos actuales:
   - `js/30-personaje.js` (personaje);
   - `js/42-vehiculos-lado.js` (vehículos de perfil);
   - `js/40-dibujo.js` (losas y techos);
   - `js/48-interiores.js` (planos, estilos, catálogo y muebles);
   - `js/38-sprites.js` (cómo entra tu arte).

## 1. Tu rol
**El arte del motor** (la piel por defecto) y la **auditoría visual**.

**No es tu rol:**
- el código del motor, la física ni la interfaz (eso es de ChatGPT);
- el arte propio de cada juego (eso es de sus IAs).

## 2. Reglas de todo el arte
- **Sin texto, sin logos y sin marcas reales.** Para todo público. Nada copiado de fotos ni de satélite.
- **Cómo entra al motor:** `MC.Sprites.atlas(id, { imagen, cuadros, anim, metros })`:
  - una imagen (atlas) con muchos cuadros;
  - `cuadros: { nombre: [x, y, w, h, ancla_x, ancla_y] }`, con el ancla en los **pies** o en la base;
  - `metros: { nombre: altoReal }`.

  Ver el ejemplo en `MOTOR.md`.
- **Fondo:** transparente o **magenta plano #ff00ff** (el motor lo vuelve transparente).
- **Escala del arte fuente:** 32 px por metro (el motor escala). Una persona de 1,68 m mide unos 54 px.
- **Vistas:**
  - **perfil mirando a la derecha** (el motor voltea);
  - **cenital mirando al oriente** (+x);
  - **frontal** para muebles y fachadas en la vista lateral.
- **Luz** de arriba a la izquierda y **sin sombra proyectada** (la pone el motor).
- **Nombres:** `persona_camina_0`, `bici_lado`, `sofa_paisa_arriba`, `sofa_paisa_frente`… En minúsculas, con guiones bajos y en español.
- **Medidas reales** (tabla `MC.Escala.MEDIDAS`): puerta de 2,1 × 0,9 m, bici de 1,75 m, carro de 4,4 × 1,8 × 1,45 m, cama doble de 1,4 × 1,9 m.
- **Paletas por zona:** las de `ciudades/medellin.json`. Si propones cambios, di la fuente (lugar y tipo de fuente).

## 3. Encargos (en este orden; **G‑M0 primero**)
| Id | Encargo | Formato |
|---|---|---|
| **G‑M0** | **Ancla de estilo:** una lámina con personaje en bici de perfil, un carro, una casa de ladera, una torre de El Poblado y **una sala** vista desde arriba. Debe verse bien en pixel (×3) y en suave. | 1 imagen de 1024×512 + 1 párrafo de reglas |
| **G‑M1** | **Personaje en sprites:** 8 estados (quieto, camina ×4 cuadros, corre ×4, pedalea ×4, impulsa ×3, patina ×3, sentado, salta). Perfil y cenital (4 direcciones: `_der`, `_abajo`, `_izq`, `_arriba`). **Tres tonos de piel, dos peinados y dos cuerpos** (la biología del motor: estatura y forma), para que no todos sean iguales. | Atlas PNG/WebP + JSON |
| **G‑M2** | **Vehículos:** los 35 de `MC.Vehiculos`, de perfil y cenital; ruedas aparte (`bici_rueda`) para girarlas. Taxi amarillo de Medellín y buseta, sin marcas. | Atlas + JSON |
| **G‑M3** | **Animales:** perro criollo, gato, gallinazo, colibrí, iguana, zarigüeya, ardilla, caballo y vaca, de perfil con 4 cuadros de marcha. **Criaturas de otros planetas:** 4 entendibles (de 2, 4, 6 y 8 patas) con proporciones que cumplan la ley cuadrado‑cubo (las grandes, patas gruesas). | Atlas + JSON |
| **G‑M4** | **MUEBLES POR ESTILO:** el catálogo `MC.Interiores.CATALOGO` (sofá, sofá en L, sillón, mesa de centro, televisor, comedor, camas doble y sencilla, clóset, escritorio, biblioteca, nevera, estufa, matera, tapete, lámpara, cuadro, hamaca, puf, consola, soporte de bici y acuario) en **8 estilos** (paisa, moderno, minimalista, bohemio, campestre, industrial, juvenil y clásico), en vista **cenital** y **frontal**. Cada mueble en su medida real. **Prioridad:** sala, alcoba y cocina en paisa, moderno y juvenil; luego el resto. | Atlas por estilo + JSON |
| **G‑M5** | **Pisos y muros por estilo:** madera, baldosa hidráulica (3 diseños paisas), porcelanato, cemento pulido y tapetes. Texturas que se repiten (*tiles*) de 64×64 a 32 px por metro, sin costuras. | Atlas + JSON |
| **G‑M6** | **Lugares jugables:** muebles e interiores de **taller de bicis** (banco, soporte, herramientas, llantas), **taller de carros** (elevador, compresor), **tienda de barrio** (estantes, nevera de gaseosas sin marcas, mostrador), **tienda de ropa** (perchero, vitrina, espejo, probador), **centro comercial** (pasillo, fuente, bancas, locales, mesas de comidas), **biblioteca** (estantes, mesas de lectura, zona infantil, computadores) y **restaurante**. Cenital y frontal. | Atlas + JSON |
| **G‑M7** | **Fachadas por zona** para la lateral y la panorámica: ventanas, balcones, rejas, toldos, tanques y ladrillo, en ladera, centro, Laureles, El Poblado, pueblo e industria, de día y de noche (ventanas encendidas). Para cubrir cualquier edificio, de 3 m de alto (1 piso) a 30 m. | Atlas de módulos (piso por piso) + JSON |
| **G‑M8** | **Siluetas de los 30 hitos** (`mundo.hitos`), como *paths* normalizados para la panorámica lejana. | JSON |
| **G‑M9** | **Íconos** (SVG de 24 o 48 px, un trazo, sin texto): las 9 vistas, los 7 esquemas de control (`MC.Manejo.ESQUEMAS`), los 10 tipos de lugar (`MC.Lugares.TIPOS`), Mi casa, estilo, comprar, girar, quitar y salir. | SVG |

## 4. Auditoría visual (Antigravity: juega y compara)
- **Vista lateral:** ¿se entiende la casa de muñecas? ¿Los rayos X (edificios transparentes delante del jugador) ayudan o confunden? ¿Las etiquetas estorban?
- **3D por software** (sin GPU: en Chrome con `--disable-gpu`, o `MCS.vistas.motor3d = 'raster'` en la consola de `motor-city.html`): ¿qué se ve mal y qué priorizar?
- **Interiores:**
  - abre 10 casas distintas: ¿se sienten distintas?;
  - ¿qué cuartos, muebles o decoración faltan para que cada hogar sea único?;
  - ¿qué falta para que cada estilo se reconozca a primera vista?
- **Medellín:** Parque Berrío, La Alpujarra, Pueblito Paisa, Santo Domingo, El Poblado, Laureles, Universidad, Comuna 13, Envigado y Bello.
- **Celular real** (Android medio): FPS por vista, carga, temperatura y el nivel que dice `MC.GPU.perfil()`.

**Formato de cada hallazgo:** lugar | vista | qué está mal | cómo debería ser (regla y fuente) | qué cambiar | prioridad.

## 5. Cómo entregar (un solo documento)
```
# ENTREGA-GEMINI-MOTOR-CITY-2.2
## Resumen (10 líneas: qué hiciste, cómo lo probaste, qué falta)
## G-M0 … G-M9 (cada uno: imagen en base64 o SVG, su JSON de cuadros y una nota de uso)
## Auditoría visual (tabla)
## Rendimiento en celular
## Reglas aprendidas
```
**Comprueba antes de entregar:**
- pega tu atlas en la consola de Mandados con `MC.Sprites.atlas('prueba', {…})` y dibújalo con `MC.Sprites.dibujar`;
- revisa la escala (la persona mide 1,68 m al lado de una puerta de 2,1 m);
- sin texto en las imágenes.
