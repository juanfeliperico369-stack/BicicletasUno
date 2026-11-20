# Paquete de arte de Gemini (G‑M0…G‑M15)

**Origen:** `ENTREGA-GEMINI-MOTOR-CITY-2.5.md` (raíz del repositorio), del 19‑nov‑2026. Claude lo extrajo e integró en la 2.5.1.

## Qué hay aquí
| Archivo | Qué es |
|---|---|
| `gemini_p.webp` | Personaje: 10 estados × 4 cuadros de lado, 40 cenitales y 12 variantes |
| `gemini_v.webp` | 37 vehículos de lado y desde arriba, y 5 ruedas |
| `gemini_a.webp` | 9 animales del valle y 4 criaturas |
| `gemini_m.webp` | 54 muebles × 8 estilos (desde arriba) y 48 frontales |
| `gemini_t_interiores.webp` | 10 baldosas de pisos y muros (64 × 64) |
| `gemini_l.webp` | 7 frentes de lugares, 14 muebles de comercio y 12 fachadas de zona |
| `gemini_u.webp` | 5 árboles del trópico, 10 props urbanos, rocas, palmas, páramo y 10 tiles de agua |
| `gemini_d.webp` | 8 marcas del piso |
| `gemini_w.webp` | 216 módulos de fachada: 6 zonas × 6 tipos × 3 variantes × día y noche |
| `manifiesto.json` | Para cada atlas: `cuadros` (`[x, y, w, h, ancla_x, ancla_y]`), `anim` y `metros` |
| `iconos.json` | 53 íconos SVG del HUD (G‑M9) |
| `hitos.json` | Las siluetas de 30 hitos de Medellín (G‑M8) |
| `paletas.json` | Paletas por hora, capas (estándar y para daltónicos) y estilos interiores (G‑M13) |

## Cómo se usa
- **Compilarlo:** `node motor.mjs construir` lo compila:
  - dentro del HTML de cada juego que tenga `"arte": ["gemini"]` en su `juego.json`;
  - suelto, en `dist/arte/gemini.js`, para incluirlo en cualquier otro juego.
- **Instalarlo:**
  ```js
  MC.Pieles.instalar('gemini', MC_ARTE.gemini, { partes: ['prop', 'naturaleza', 'fachada', 'mueble'], pixel: () => vistas.pixel, usar: true });
  MC.arte.usar('motor');   // volver al arte procedural
  MC.Pieles.icono('vista_cenital', 20);   // un ícono SVG
  ```

## La revisión (Claude, 2.5.1)
Cada atlas se miró a ojo, y en el juego se comparó con el arte del motor en las vistas cenital, maqueta, lateral y Mi casa, de día y de noche.

| Parte | Veredicto | Por qué |
|---|---|---|
| Postes, bancas, paraderos | ✅ **Se usa** | Se dibujan a la medida del motor, y de noche con una copia oscurecida del atlas. |
| Árboles del trópico | ❌ **No se usa desde la 2.6** | Se ven como chupetas de caricatura; los reemplazan los árboles procedurales con volumen (`MC.Arboleda`). Los realistas los hará ChatGPT (C‑A4). |
| Rocas y palmas (naturaleza) | ❌ **No se usa desde la 2.6** | Planas para el estilo realista; las procedurales del motor encajan mejor. |
| Muebles × 8 estilos | ✅ **Se usa** | Un poco más de detalle que los procedurales (estufa con fogones, cama con almohada). |
| Módulos de fachada (WFC) | ✅ **Se usa** | Se recorta solo el vano (ventana, puerta o vitrina) para no pintar un muro de otro color sobre el edificio. |
| Personaje | ❌ **No se usa por defecto** | Queda más pequeño que el mundo y no respeta el aspecto que el jugador elige. El procedural va alineado con la bici. |
| Vehículos de lado | ❌ **No se usa por defecto** | La bici queda más pequeña que la persona. La vista desde arriba del avión y del metro sale cortada al borde del atlas. |
| Animales | ❌ **No se usa por defecto** | La escala no coincide con el perro del motor. |
| Íconos, hitos, paletas | 📦 **Guardados** | Listos para la siguiente versión de la interfaz y de la capa para daltónicos. |

## Lo que se pedía para la segunda vuelta
Desde la 2.6 esto pasa a **ChatGPT** (C‑A2 y C‑A3): Gemini trabaja con «hydrogen» y le tocan tareas fáciles (`TAREAS-IA.md`). Además, `node motor.mjs revisar-arte arte/gemini` encuentra 21 cuadros que se salen de la imagen. La lista:
1. **Personaje y vehículos a escala:**
   - que la figura llene el cuadro: el alto en `metros` es el del cuadro entero;
   - la bici de lado con la rueda de 0,68 m;
   - sin cortes en el borde del atlas.
2. **Sin sombra horneada** en los vehículos vistos desde arriba: el motor la calcula según el sol.
3. **Atlas con 2 px de margen** entre cuadros, para que no sangren al escalar.
4. **Árboles a 128 px de alto**, para que no se vean borrosos al acercar la cámara.
