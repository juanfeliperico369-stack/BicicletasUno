# Sitios icónicos de Medellín · Fichas arquitectónicas (G5-07 → C5-02)

Catálogo de **30 sitios icónicos reales de Medellín** preparado por **Gemini / Antigravity (G5-07)** para que **ChatGPT / Codex (C5-02)** modele sus volúmenes reconocibles en `VistaTres` con dos niveles de detalle (LOD0 cerca, LOD1 lejos), sustituyendo las cajas genéricas ED1 sin superar el presupuesto de **1,5 MB comprimidos** en el HTML de un solo archivo.

- **Manifiesto legible por máquina:** [`sitios.json`](sitios.json)
- **Imágenes de referencia (30 WebP de 768×512, sin texto ni logos):** `docs/sitios/img/<id>.webp`
  - `edificio_epm.webp`: dibujo arquitectónico original de **Nano Banana**.
  - Los otros 29 sitios: maquetas 3D limpias de estudio con proporciones, silueta y paleta HEX exactas de cada ficha (la cuota del generador Nano Banana entró en enfriamiento de ~5 h durante el lote; las maquetas desbloquean `C5-02` de inmediato y pueden refrescarse con Nano Banana en una pasada posterior sin cambiar rutas ni contratos).
- **Peso añadido al HTML compilado (`dist/juegos/getaway.html`):** **0 KB** (las fichas e imágenes viven en `docs/sitios/` como referencia de producción; el juego solo incrustará las mallas comprimidas de `C5-02`).
- **Validador automático:** `node pruebas/sitios-medellin.mjs`

## Presupuesto agregado para `C5-02`

| Métrica | Valor |
|---|---|
| Total de sitios documentados | **30** |
| Triángulos totales sugeridos (LOD0) | **23.540 tris** (~785 tris/sitio) |
| Triángulos totales sugeridos (LOD1) | **6.740 tris** (~225 tris/sitio) |
| Tamaño estimado de geometría cuantizada + deflate | **~320–550 KB** (muy por debajo del tope de **1 536 KB**) |

## Notas de integración para Codex (`C5-02`)

1. **Coordenadas exactas:** cada entrada de `sitios.json` trae tanto WGS84 (`lat`, `lon`) como las coordenadas exactas en metros del archivo `datos/medellin/mundo.mc4` (`x`, `y`, `cota_m`).
2. **Sustitución de ED1 y `hitos`:** 22 sitios enlazan directamente con `id`s existentes en `lugares.hitos` de `mundo.mc4` (`mc4.hito_mc4`); los 8 restantes (`pueblito_paisa`, `orquideorama`, `parque_deseos`, `plaza_mayor`, `ruta_n`, `parque_lleras`, `plaza_libertad`, más los sub-bloques agrupados de `alpujarra`) deben suprimir los polígonos genéricos ED1 dentro de su caja de planta `planta_m`.
3. **Anclaje en ladera:** colocar cada modelo en `z = M.altura(x, y)` y proyectar un faldón de cimentación bajo `z = 0` (2–4 m en el fondo del valle; 12 m en `biblioteca_espana` y 6 m en `pueblito_paisa` y `parque_lleras`) para que nunca floten en pendiente.
4. **Materiales compartidos:** reutilizar el atlas de fachadas (`R1`) y el shader de cuartos falsos nocturnos (`R8`) combinados con colores de vértice tomados de `colores_hex` para mantener los *draw calls* mínimos en celular.

## Índice de los 30 sitios

| # | Sitio | ID | WGS84 | MC4 `x, y` (cota) | Altura | Planta | OSM | Tris LOD0 / LOD1 |
|---|---|---|---|---|---|---|---|---|
| 01 | [Edificio Coltejer](coltejer.md) | `coltejer` | `6.25014, -75.56606` | `14822, 23206` (1497 m) | 175 m | 52×45 m | `way/31973359` | 780 / 220 |
| 02 | [Basílica de Nuestra Señora de la Candelaria y Parque Berrío](candelaria.md) | `candelaria` | `6.24996, -75.56739` | `14675, 23225` (1494 m) | 28 m | 67×50 m | consulta OSM | 820 / 240 |
| 03 | [Palacio de la Cultura Rafael Uribe Uribe](palacio_cultura.md) | `palacio_cultura` | `6.25171, -75.56821` | `14584, 23032` (1487 m) | 34 m | 68×72 m | consulta OSM | 920 / 280 |
| 04 | [Plaza Botero](plaza_botero.md) | `plaza_botero` | `6.25183, -75.56820` | `14585, 23018` (1487 m) | 12 m | 110×70 m | `way/130423476` | 880 / 240 |
| 05 | [Edificio Inteligente de EPM](edificio_epm.md) | `edificio_epm` | `6.24528, -75.57785` | `13517, 23742` (1480 m) | 56 m | 100×134 m | consulta OSM | 760 / 220 |
| 06 | [Centro Administrativo La Alpujarra](alpujarra.md) | `alpujarra` | `6.24466, -75.57373` | `13973, 23811` (1478 m) | 48 m | 180×145 m | `way/32470917` | 940 / 280 |
| 07 | [Pueblito Paisa · Cerro Nutibara](pueblito_paisa.md) | `pueblito_paisa` | `6.23615, -75.57988` | `13293, 24752` (1547 m) | 14 m | 70×55 m | `way/765380123` | 840 / 240 |
| 08 | [Parque Explora](parque_explora.md) | `parque_explora` | `6.27088, -75.56571` | `14861, 20911` (1461 m) | 16 m | 83×256 m | `way/141166140` | 760 / 220 |
| 09 | [Orquideorama del Jardín Botánico](orquideorama.md) | `orquideorama` | `6.27065, -75.56372` | `15081, 20937` (1471 m) | 16 m | 75×56 m | `way/174369253` | 880 / 240 |
| 10 | [Planetario de Medellín Jesús Emilio Ramírez](planetario.md) | `planetario` | `6.26900, -75.56612` | `14816, 21120` (1466 m) | 16 m | 28×59 m | `way/93329440` | 640 / 180 |
| 11 | [Parque de los Deseos y Casa de la Música](parque_deseos.md) | `parque_deseos` | `6.26836, -75.56585` | `14845, 21190` (1469 m) | 12 m | 110×95 m | consulta OSM | 760 / 220 |
| 12 | [Parque Biblioteca España](biblioteca_espana.md) | `biblioteca_espana` | `6.29472, -75.54410` | `17252, 18276` (1827 m) | 26 m | 53×70 m | consulta OSM | 720 / 200 |
| 13 | [Estadio Atanasio Girardot](estadio_atanasio.md) | `estadio_atanasio` | `6.25680, -75.59015` | `12157, 22469` (1484 m) | 44 m | 197×213 m | consulta OSM | 980 / 300 |
| 14 | [Catedral Basílica Metropolitana de Medellín](catedral_metropolitana.md) | `catedral_metropolitana` | `6.25403, -75.56393` | `15058, 22775` (1495 m) | 52 m | 101×113 m | `way/366050226` | 960 / 280 |
| 15 | [Museo de Antioquia](museo_antioquia.md) | `museo_antioquia` | `6.25240, -75.56914` | `14481, 22955` (1481 m) | 20 m | 90×101 m | consulta OSM | 780 / 220 |
| 16 | [Plaza Mayor Medellín (Centro de Convenciones)](plaza_mayor.md) | `plaza_mayor` | `6.24322, -75.57618` | `13702, 23970` (1476 m) | 18 m | 140×115 m | `way/786282461` | 760 / 220 |
| 17 | [Teatro Pablo Tobón Uribe](teatro_pablo_tobon.md) | `teatro_pablo_tobon` | `6.24746, -75.55911` | `15591, 23502` (1511 m) | 16 m | 65×48 m | `way/109028606` | 660 / 190 |
| 18 | [Complejo Ruta N](ruta_n.md) | `ruta_n` | `6.26515, -75.56681` | `14739, 21545` (1468 m) | 28 m | 130×65 m | `way/572983883` | 780 / 220 |
| 19 | [Parque Lleras](parque_lleras.md) | `parque_lleras` | `6.20878, -75.56774` | `14636, 27778` (1550 m) | 14 m | 85×75 m | consulta OSM | 760 / 210 |
| 20 | [Plaza de la Libertad](plaza_libertad.md) | `plaza_libertad` | `6.24421, -75.57545` | `13783, 23861` (1472 m) | 54 m | 125×90 m | `way/218895104` | 780 / 220 |
| 21 | [Teatro Metropolitano José Gutiérrez Gómez](teatro_metropolitano.md) | `teatro_metropolitano` | `6.24318, -75.57758` | `13547, 23975` (1477 m) | 24 m | 92×68 m | `way/32473064` | 720 / 210 |
| 22 | [Parque de los Pies Descalzos](pies_descalzos.md) | `pies_descalzos` | `6.24468, -75.57688` | `13625, 23809` (1476 m) | 10 m | 130×120 m | `way/32473520` | 760 / 210 |
| 23 | [Parque de las Luces · Plaza Cisneros](parque_luces.md) | `parque_luces` | `6.24605, -75.57230` | `14131, 23658` (1473 m) | 24 m | 160×120 m | `way/32474547` | 840 / 240 |
| 24 | [Edificio Vásquez](edificio_vasquez.md) | `edificio_vasquez` | `6.24556, -75.57152` | `14218, 23712` (1475 m) | 16 m | 46×45 m | `way/32474590` | 680 / 190 |
| 25 | [Edificio Carré](edificio_carre.md) | `edificio_carre` | `6.24597, -75.57139` | `14232, 23667` (1475 m) | 16 m | 43×42 m | `way/32474597` | 680 / 190 |
| 26 | [Biblioteca EPM](biblioteca_epm.md) | `biblioteca_epm` | `6.24641, -75.57313` | `14039, 23618` (1473 m) | 22 m | 62×90 m | `way/32474558` | 660 / 190 |
| 27 | [Antigua Estación del Ferrocarril de Antioquia](estacion_ferrocarril.md) | `estacion_ferrocarril` | `6.24471, -75.57209` | `14154, 23805` (1475 m) | 14 m | 96×83 m | `node/14261984136` | 760 / 220 |
| 28 | [Palacio Nacional](palacio_nacional.md) | `palacio_nacional` | `6.24901, -75.57040` | `14342, 23330` (1484 m) | 24 m | 62×90 m | `way/31973366` | 840 / 240 |
| 29 | [Museo Casa de la Memoria](casa_memoria.md) | `casa_memoria` | `6.24590, -75.55650` | `15880, 23674` (1517 m) | 12 m | 49×60 m | consulta OSM | 620 / 180 |
| 30 | [Museo de Arte Moderno de Medellín — MAMM](mamm.md) | `mamm` | `6.22367, -75.57404` | `13938, 26132` (1488 m) | 22 m | 94×59 m | consulta OSM | 820 / 230 |
