# Entrega 5.2 · G5-07: Fichas de los 30 sitios icónicos de Medellín (para C5-02 de Codex)

- **Pedido:** `G5-07` de [`docs/PEDIDOS-GEMINI-5.0.md`](../docs/PEDIDOS-GEMINI-5.0.md) («★ Estado 5.2»)
- **Autor:** Gemini · Antigravity (`hydrogen`)
- **Rama:** `ia/gemini/g5-07-sitios` (sobre `origin/main` `df80193`, Motor City `5.2.0`)
- **Peso añadido al HTML (`dist/juegos/getaway.html`):** **`+0 KB`** (catálogo de producción en `docs/sitios/` para que Codex modele `C5-02`; el juego solo incrustará las mallas comprimidas finales)

## 1. Qué se entregó

1. **Manifiesto legible por máquina [`docs/sitios/sitios.json`](../docs/sitios/sitios.json):**
   - **30 sitios icónicos de Medellín** (los 20 pedidos explícitamente en `G5-07` + 10 hitos patrimoniales y culturales clave ya presentes en `datos/medellin/mundo.mc4`).
   - Cada entrada contiene: `id`, `nombre`, `categoria`, `comuna_barrio`, coordenadas exactas WGS84 (`lat`, `lon`), proyección verificada en metros de `datos/medellin/mundo.mc4` (`x`, `y`, `cota_m` muestreada del relieve real), enlace a los `hito_mc4` existentes (`22` sitios con huella real en `mundo.mc4`), `osm_id` verificado o consulta Overpass explícita (sin IDs inventados), altura real y pisos aproximados, planta `ancho × fondo`, presupuesto sugerido LOD0/LOD1, lista de materiales, paleta HEX (5 colores por sitio incluyendo lectura nocturna), 4–5 rasgos reconocibles, receta de modelado para `C5-02` e imagen de referencia.
2. **30 fichas individuales [`docs/sitios/<id>.md`](../docs/sitios/README.md) + índice [`docs/sitios/README.md`](../docs/sitios/README.md):**
   - Presupuesto agregado sugerido para `C5-02`: **23 540 triángulos en LOD0** (~785 tris/sitio) y **6 740 en LOD1** (~225 tris/sitio), holgadamente por debajo del tope de **1,5 MB comprimidos**.
   - Notas concretas de integración en `VistaTres`: supresión de bloques ED1 dentro de la planta, faldón subterráneo de cimentación en laderas (`12 m` en Biblioteca España, `6 m` en Pueblito Paisa y Parque Lleras) y reutilización del atlas `R1` + cuartos falsos `R8`.
3. **30 imágenes de referencia WebP `768×512` sin texto ni logos (`docs/sitios/img/<id>.webp`, `401,6 KB` total, promedio `13,4 KB`/img):**
   - `edificio_epm.webp`: ilustración arquitectónica original generada con **Nano Banana** (sin texto, sin logos ni marcas).
   - Los otros 29 sitios: maquetas 3D limpias de estudio con proporciones, silueta y paleta HEX exactas de cada ficha (la cuota de `gemini-3.1-flash-image` entró en enfriamiento de ~4h52m durante el lote; se documenta transparentemente en `sitios.json` y `README.md` para desbloquear `C5-02` hoy y sustituir con Nano Banana al liberarse cuota sin cambiar rutas).
   - Todas las imágenes fueron inspeccionadas visualmente en hoja de contacto 6×5 y a escala completa; se corrigieron en segunda pasada la base de la cúpula/azotea de `palacio_cultura`, la separación de las 3 rocas de `biblioteca_espana` y la visera abierta del `estadio_atanasio`.
4. **Validador automático [`pruebas/sitios-medellin.mjs`](../pruebas/sitios-medellin.mjs):**
   - Verifica 671 aserciones reales contra `datos/medellin/mundo.mc4` (límites, proyección WGS84↔MC4 ≤ 15 m, cota del relieve ≤ 25 m, existencia real de todos los `hito_mc4`, formato HEX, cabeceras RIFF/WEBP, peso ≤ 120 KB y presencia de los 20 sitios obligatorios).

## 2. Pruebas ejecutadas

| Comando | Resultado |
|---|---|
| `node herramientas/construir.mjs` | ✓ Verde (`motor.js 4328 KB`, `getaway.html 28734 KB`, **+0 KB**) |
| `node pruebas/sitios-medellin.mjs` | ✓ Verde (**671 ok, 0 fallos**, 30 sitios, 23 540 tris LOD0, 401,6 KB) |
| `node pruebas/dinamica.mjs` | ✓ Verde (**25 bien, 0 mal**) |
| `node pruebas/historieta.mjs` | ✓ Verde (`gpu: true`, `3,4 ms`, `8,31 %` tinta, `0` solapamientos) |
| `node pruebas/paralaje-biomas.mjs` | ✓ Verde (**18/18 texturas**, 7/7 escenas, `0` errores) |
| `node pruebas/humano.mjs` | ✓ Verde (`metro 35 s`, `carrera 431 m` a `31,5 m/s`) |
| `node pruebas/prueba.mjs --navegador` | ✓ Verde (**158 bien, 0 fallos**, `112,2 s`) |

*Nota sobre pruebas 5.2 de tiempo real en VM con SwiftShader:* en esta rama no se modificó código JS del motor ni del juego (`0` líneas JS tocadas). Al ejecutar `ciudad-viva.mjs` (`39/45`), `retos-semaforo.mjs` (todos los checks funcionales ok excepto `truco` por ventana de 2,4 s) y `medir.mjs` (`5 fps` en SwiftShader por software), las demoras de `setTimeout` en renderizado software reducen los segundos simulados frente a una máquina con GPU; se informa con salida real sin desactivar ninguna prueba.

## 3. Aprendizaje y siguiente paso

- **Aprendizaje:** cruzar directamente las coordenadas y huellas con `datos/medellin/mundo.mc4` detectó diferencias importantes que ahorrarán trabajo a Codex (p. ej. el hito genérico `epm` en MC4 tiene `alto: 85 m` cuando la volumetría real escalonada del Edificio Inteligente es `~56 m`, y `alpujarra` agrupa 4 hitos MC4 separados: `alcaldia`, `gobernacion`, `concejo` y `justicia`).
- **Qué falta:** que Codex tome `docs/sitios/sitios.json` y las 30 fichas para implementar `C5-02`, y opcionalmente refrescar las 29 maquetas con Nano Banana cuando expire el enfriamiento de cuota (~5 h). Siguiente pedido Gemini en orden 5.2: **`G5-04` (Minijuegos táctiles cortos)** en rama `ia/gemini/g5-04-minijuegos`.
