# Revisión visual con capturas · Motor City 2.7.0 (G‑H1)

- **Fecha:** 2026-11-20
- **Autor:** Gemini · Antigravity («hydrogen»)
- **Comandos ejecutados:** `node motor.mjs construir` y `node motor.mjs capturas` (Playwright + Chromium del sistema, GPU software, viewport móvil 412 × 860, estilo `realista`, arte `gemini`).
- **Resumen automático (`dist/capturas/LEEME.md`):** `14 capturas · errores de consola: 0 · sprites que faltan: 0 · La interfaz tapa el centro: botones p 342,10, p 342,172, p 342,226, p 342,280, p 342,334`.
- **Nota de alcance:** Revisión visual y reporte únicamente; no se modificó código del motor ni de Mandados.

---

## 1. Tabla de hallazgos (foto → hallazgo → gravedad)

| Foto | Hallazgo | Gravedad |
|---|---|---|
| `cenital-10h.png` | La columna derecha de botones invade el borde derecho de `zonaLibre` (`x = 342 < 346,08`) y toca la etiqueta «Mixtura Gourmet»; el ciclista se reduce a una barra verde mínima dentro del aro cian sobre la cebra blanca (difícil de leer sin el aro). En el cruce izquierdo se superponen dos cebras en cuadrícula `#`. | **alta** |
| `cenital-17h.png` | Persiste la invasión de la columna derecha en `zonaLibre` (`x = 342`) y el cruce de cebras en `#`. La luz de las 17 h aporta tono cálido suave, pero las cubiertas de las casas siguen leyéndose casi planas, sin teja ni alero distinguible. | **alta** |
| `cenital-20h30.png` | Los halos cálidos de los postes iluminan bien la calzada, pero los techos rojizos y muros de las casas de 1 piso carecen de ventanas encendidas y contraste de zócalo; persiste la invasión de los botones derechos en `zonaLibre`. | **media** |
| `maqueta-10h.png` | Árboles en pie confirmados (`MC.Arboleda`: copas con volumen, troncos y guayacanes amarillos/rosados), pero los botones derechos tapan el rótulo «Hotel San Juan» e invaden `zonaLibre`. Halos oscuros semitransparentes tenues alrededor de las copas. | **alta** |
| `maqueta-17h.png` | El aviso superior (`ui.aviso`) muestra texto desfasado de la vista anterior («🏙️ Ciudad 3D» estando en Maqueta 2:1). Persiste la invasión derecha de botones sobre «Hotel San Juan» y `zonaLibre`. | **media** |
| `maqueta-20h30.png` | El aviso superior queda pegado en «↔️ Lateral» estando en Maqueta 2:1. De noche, las casas de 1 piso se ven como techos naranjas planos flotando sobre muros sin ventanas iluminadas ni detalle de fachada; los postes sí lucen bien. | **alta** |
| `lateral-10h.png` | Árboles en pie confirmados en la vista lateral. Sin embargo: 1) la columna derecha invade `zonaLibre` y el aviso de objetivo («62 m») choca con el botón «Ajustes»; 2) el aviso superior dice «📦 Maqueta 2:1» estando en Lateral; 3) la gran cubierta bajo «Restaurante Tolú» se ve como un techo plano flotante sin muros claros; 4) árboles en primer plano tapan parcialmente el joystick izquierdo. | **alta** |
| `lateral-17h.png` | Mismos choques de interfaz (`62 m` sobre «Ajustes», botones invadiendo `zonaLibre`, aviso superior desfasado en «🗺️ Cenital») y cubierta flotante bajo «Restaurante Tolú». | **alta** |
| `lateral-20h30.png` | Mismos choques de interfaz (`62 m` sobre «Ajustes», `zonaLibre` invadida) y casas nocturnas sin ventanas encendidas ni lectura de fachada; los halos de alumbrado público sí se leen bien. | **alta** |
| `ciudad3d-10h.png` | Árboles en pie visibles con volumen, pero los botones derechos tapan «Casa Hotel Guatapé» e invaden `zonaLibre`; el aviso superior queda desfasado en «↔️ Lateral». Dos cebras se cruzan en `#` en la esquina izquierda. | **alta** |
| `ciudad3d-17h.png` | Tinte cálido de atardecer limpio, pero persisten la invasión derecha en `zonaLibre` (solapando «Casa Hotel Guatapé») y los discos de sombra tenues alrededor de copas de árboles. | **alta** |
| `ciudad3d-20h30.png` | El aviso superior queda pegado en «🗺️ Cenital». Buena iluminación de postes en las calles, pero las casas nocturnas carecen de ventanas cálidas encendidas y persiste la invasión de botones en `zonaLibre`. | **media** |
| `capa-valor.png` | La leyenda inferior «Valor del suelo» (bajo → alto) se lee nítida y sin chocar con el joystick. Sin embargo: la columna derecha sigue invadiendo `zonaLibre`, el aviso superior queda pegado en «📦 Maqueta 2:1», el chip `FREE $ 10.000` se ve apagado (baja opacidad) y no hay conmutador rápido para paleta apta para daltonismo. | **media** |
| `mi-casa.png` | El botón `#bcComprar` («Comprar») sigue recortado en el borde derecho (`Compra|r`). Falta el rótulo de la `cocina`; los rótulos de cuartos (`sala`, `alcoba`, `baño`, `patio`, `ropas`) rozan muebles; la burbuja de necesidad `🚻` del habitante se monta sobre el muro exterior norte; y la figura del habitante se ve de caricatura abstracta (círculo morado con bloques grises). | **alta** |

---

## 2. Respuestas punto por punto para las 14 fotos

### Vistas cenitales (`cenital-10h.png`, `cenital-17h.png`, `cenital-20h30.png`)
1. **¿Se lee el personaje?** Parcialmente: el aro cian y la sombra indican dónde está, pero a esa escala cenital el ciclista se ve como una pequeña barra verde sobre la cebra blanca, difícil de reconocer como persona en bici sin el marcador.
2. **¿Algo tapa el centro?** Sí: la columna derecha de botones toca el borde de la zona libre central (`x = 342` frente al límite `346,08`) y se superpone a etiquetas de lugares cercanos al borde derecho.
3. **¿Árboles de pie en maqueta y lateral?** N/A en cenital (en cenital las copas se ven orgánicas y con textura, no como círculos planos).
4. **¿La noche se ve bien (`20h30`)?** A medias: los postes con halo cálido dan buena atmósfera en la calzada, pero las edificaciones de 1 piso no tienen ventanas encendidas ni textura de teja/alero.
5. **¿Algo de caricatura o fuera de escala?** El cruce de dos cebras peatonales en forma de `#` a la izquierda; las cubiertas de casas aún se ven demasiado lisas en comparación con el asfalto texturizado.

### Vistas de maqueta 2:1 (`maqueta-10h.png`, `maqueta-17h.png`, `maqueta-20h30.png`)
1. **¿Se lee el personaje?** Sí, razonablemente bien junto al perro café, aunque ambos son pequeños (~14–18 px) y ganarán mucho con los sprites a escala de ChatGPT (`C‑A2`, `C‑A7`).
2. **¿Algo tapa el centro?** Sí: los botones derechos entran en `zonaLibre` (`x = 342`) y pisan «Hotel San Juan». Además, en `17h` y `20h30` el aviso superior muestra la vista anterior («Ciudad 3D» y «Lateral») porque no se reemplaza/limpia al cambiar rápido de vista.
3. **¿Los árboles están de pie?** **Sí.** En las 3 horas los árboles están de pie con tronco visible, copa volumétrica y variedad de especie (incluidos guayacanes amarillos y rosados).
4. **¿La noche se ve bien (`20h30`)?** Parcialmente: el alumbrado público se ve cálido y agradable, pero las casas de 1 piso parecen techos naranjas flotando sobre muros sin ventanas iluminadas ni zócalos visibles.
5. **¿Algo de caricatura o fuera de escala?** Los discos semitransparentes alrededor de las copas y los techos naranjas lisos sin teja de barro contrastan con el asfalto y los árboles más realistas.

### Vistas laterales (`lateral-10h.png`, `lateral-17h.png`, `lateral-20h30.png`)
1. **¿Se lee el personaje?** Sí, se distingue el ciclista y el perro sobre la vía, aunque el follaje en primer plano oscurece la zona inferior izquierda cerca del joystick.
2. **¿Algo tapa el centro?** Sí: además de los botones derechos en `x = 342`, el indicador flotante de distancia del objetivo (`62 m`) choca con el botón «Ajustes», y el aviso superior muestra vistas previas desfasadas (`Maqueta 2:1` en `10h`, `Cenital` en `17h`).
3. **¿Los árboles están de pie?** **Sí.** Se ven claramente verticales con tronco y copa en profundidad; algunos en primer plano rozan el joystick.
4. **¿La noche se ve bien (`20h30`)?** Los postes y halos nocturnos lucen bien, pero las fachadas y cubiertas carecen de ventanas encendidas y profundidad de muro.
5. **¿Algo de caricatura o fuera de escala?** La cubierta grande bajo «Restaurante Tolú» parece una marquesina plana suspendida en el aire sin muros bien anclados al piso.

### Vistas Ciudad 3D (`ciudad3d-10h.png`, `ciudad3d-17h.png`, `ciudad3d-20h30.png`)
1. **¿Se lee el personaje?** Sí, en el centro de la calzada con su perro, aunque sigue pequeño frente a los edificios.
2. **¿Algo tapa el centro?** Sí: la columna derecha entra en `zonaLibre` (`x = 342`) y tapa «Casa Hotel Guatapé». El aviso superior aparece desfasado (`Lateral` en `10h`, `Cenital` en `20h30`).
3. **¿Los árboles están de pie?** Sí, con volumen y variación cromática (guayacanes amarillos y rosados), con un ligero halo circular alrededor de algunas copas.
4. **¿La noche se ve bien (`20h30`)?** Buena atmósfera de alumbrado en la calle, pero faltan ventanas encendidas en las viviendas y detalle en las cubiertas.
5. **¿Algo de caricatura o fuera de escala?** Doble cebra cruzada en `#` en el cruce izquierdo y cubiertas de casas con relleno muy plano.

### Capa de valor (`capa-valor.png`)
1. **¿Se lee el personaje?** Sí, visible en el centro sobre el mapa de calor.
2. **¿Algo tapa el centro?** Sí: misma invasión de la columna derecha en `zonaLibre` (`x = 342`) y aviso superior desfasado («Maqueta 2:1»). La leyenda inferior «Valor del suelo» no tapa el centro y se lee bien.
3. **¿Árboles de pie?** N/A (vista cenital de mapa de calor).
4. **¿La noche se ve bien?** N/A (captura diurna).
5. **¿Algo de caricatura o fuera de escala?** No hay elementos de caricatura, pero el chip `FREE $ 10.000` se ve atenuado y conviene ofrecer conmutador rápido de paleta accesible para daltonismo.

### Interior · Mi casa (`mi-casa.png`)
1. **¿Se lee el personaje?** Se distingue dónde está el habitante dentro del cuarto, pero visualmente se lee como una ficha abstracta (círculo morado sobre bloques grises), no como una persona realista familiar.
2. **¿Algo tapa el centro?** El centro del plano se ve despejado, pero la burbuja `🚻` del habitante se monta sobre el muro exterior superior y el botón `#bcComprar` («Comprar») se recorta contra el borde derecho de la pantalla (`Compra|r`).
3. **¿Árboles de pie?** N/A (interior).
4. **¿La noche se ve bien?** N/A (interior iluminado).
5. **¿Algo de caricatura o fuera de escala?** Sí: el habitante tiene trazo de caricatura/ficha plana; además falta la etiqueta de `cocina` y los rótulos de `sala`, `alcoba`, `baño`, `patio` y `ropas` tocan bordes de muebles.

---

## 3. Prioridades sugeridas (para Claude y ChatGPT/Codex)
1. **[Alta · Código UI]** Ajustar el ancho/margen de `.botones` en 412 px (para que `x >= 347` y no entre en `zonaLibre` ni choque con `62 m` / etiquetas) y corregir el desborde de `#bcComprar` en Mi casa.
2. **[Media · Código UI]** Limpiar o reemplazar inmediatamente `ui.aviso` al cambiar de vista (o al abrir capas), para evitar avisos desfasados.
3. **[Alta · Arte C‑A1/C‑A2/C‑A5/C‑A6 + Motor]** Sumar ventanas encendidas de noche en viviendas de 1 piso, textura de teja de barro/aleros/zócalos reales, personaje a escala legible (y habitante realista en Mi casa), y revisar las cebras duplicadas en cruces.
