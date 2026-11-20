# Revisión automática de arte · `arte/gemini` (G‑H2)

- **Fecha:** 2026-11-20
- **Autor:** Gemini · Antigravity («hydrogen»)
- **Comando ejecutado:** `node motor.mjs revisar-arte arte/gemini`
- **Código de salida:** `1` (falló por 21 problemas graves).
- **Nota de alcance:** Revisión y lista de correcciones únicamente; no se modificaron archivos de `arte/gemini` ni del motor.

---

## 1. Salida exacta del revisor

```text
Paquete gemini: 9 atlas · 997 cuadros

PROBLEMAS GRAVES (21):
  ✗ gemini_p: 10 pares de cuadros se montan
  ✗ gemini_v/avion_arriba: se sale de la imagen (1024×820)
  ✗ gemini_v/surf_arriba: se sale de la imagen (1024×820)
  ✗ gemini_v/metro_lado: se sale de la imagen (1024×820)
  ✗ gemini_v/metro_arriba: se sale de la imagen (1024×820)
  ✗ gemini_v/tranvia_lado: se sale de la imagen (1024×820)
  ✗ gemini_v/tranvia_arriba: se sale de la imagen (1024×820)
  ✗ gemini_v/cable_lado: se sale de la imagen (1024×820)
  ✗ gemini_v/cable_arriba: se sale de la imagen (1024×820)
  ✗ gemini_v/metroplus_lado: se sale de la imagen (1024×820)
  ✗ gemini_v/metroplus_arriba: se sale de la imagen (1024×820)
  ✗ gemini_v/moto_mandados_lado: se sale de la imagen (1024×820)
  ✗ gemini_v/moto_mandados_arriba: se sale de la imagen (1024×820)
  ✗ gemini_v/carro_mandados_lado: se sale de la imagen (1024×820)
  ✗ gemini_v/carro_mandados_arriba: se sale de la imagen (1024×820)
  ✗ gemini_v/rueda_bici: se sale de la imagen (1024×820)
  ✗ gemini_v/rueda_bmx: se sale de la imagen (1024×820)
  ✗ gemini_v/rueda_moto: se sale de la imagen (1024×820)
  ✗ gemini_v/rueda_carro: se sale de la imagen (1024×820)
  ✗ gemini_v/rueda_camion: se sale de la imagen (1024×820)
  ✗ gemini_d/cebra_vieja: se sale de la imagen (576×128)

AVISOS (4):
  ! gemini_p: 252 pares de cuadros sin 2 px de margen
  ! gemini_t_interiores: 9 pares de cuadros sin 2 px de margen
  ! gemini_w: 740 pares de cuadros sin 2 px de margen
  ! gancho arbol: faltan arbol_guayacan_amarillo_lado, arbol_guayacan_rosado_lado, arbol_ceiba_lado, arbol_mango_lado, arbol_urapan_lado, arbol_monte_lado
```

---

## 2. Lista exacta de qué debe corregir quien produzca o regenere el paquete

### Problemas graves (bloqueantes — deben bajar a 0)
1. **Atlas `gemini_v` (19 cuadros fuera del lienzo 1024 × 820):**
   - Los cuadros `avion_arriba`, `surf_arriba`, `metro_lado`, `metro_arriba`, `tranvia_lado`, `tranvia_arriba`, `cable_lado`, `cable_arriba`, `metroplus_lado`, `metroplus_arriba`, `moto_mandados_lado`, `moto_mandados_arriba`, `carro_mandados_lado`, `carro_mandados_arriba`, `rueda_bici`, `rueda_bmx`, `rueda_moto`, `rueda_carro` y `rueda_camion` tienen coordenadas (`x`/`y`/`w`/`h`) en `manifiesto.json` que exceden el tamaño real de la imagen (`1024 × 820`).
   - **Corrección:** Reempacar el atlas de vehículos en un lienzo suficientemente alto (p. ej. `1024 × 1024` o `1024 × 1280`) o dividirlo en 2 atlas, regenerando el `manifiesto.json` desde el empaquetador para que todo cuadro cumpla `x + w <= ancho` y `y + h <= alto`. Al reemplazar vehículos por **ChatGPT (`C‑A3`)**, validar este punto antes de entregar.
2. **Atlas `gemini_p` (10 pares de cuadros superpuestos):**
   - Hay 10 pares de rectángulos en `manifiesto.json` cuyas cajas se solapan dentro del atlas de personaje.
   - **Corrección:** Separar los rectángulos de cada cuadro sin intersección y volver a generar el `manifiesto.json` con rejilla uniforme o empaquetador automático. Al entregar el personaje a escala de **ChatGPT (`C‑A2` y `C‑A9`)**, garantizar 0 solapamientos.
3. **Atlas `gemini_d` (`cebra_vieja` fuera de 576 × 128):**
   - El cuadro `cebra_vieja` excede los límites de `576 × 128`.
   - **Corrección:** Ampliar el lienzo del atlas de marcas viales/decals o corregir la coordenada/tamaño de `cebra_vieja` en `manifiesto.json` para que quede totalmente contenido en la imagen.

### Avisos (calidad visual y cobertura de ganchos)
4. **Márgenes menores a 2 px (`gemini_p`: 252 pares, `gemini_t_interiores`: 9 pares, `gemini_w`: 740 pares):**
   - Sin al menos **2 px de margen transparente** entre cuadros vecinos, el escalado lineal/WebGL sangra bordes de cuadros adyacentes.
   - **Corrección:** Empaquetar todos los nuevos atlas (`arte/chatgpt/` en `C‑A2`–`C‑A7`, y cualquier actualización de `arte/gemini/`) con `padding >= 2 px` obligatorio entre cuadros.
5. **Gancho `arbol` incompleto (6 especies sin vista lateral):**
   - Faltan `arbol_guayacan_amarillo_lado`, `arbol_guayacan_rosado_lado`, `arbol_ceiba_lado`, `arbol_mango_lado`, `arbol_urapan_lado` y `arbol_monte_lado`.
   - **Corrección:** Cubrir exactamente estos 6 nombres (más sus variantes `_v1`, `_v2` y palmas) en el encargo **`C‑A4`** de ChatGPT y volver a correr `node motor.mjs revisar-arte arte/<paquete>` hasta obtener **0 graves y 0 avisos**.
