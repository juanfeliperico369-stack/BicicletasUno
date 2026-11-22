# JUEGA ENCICLA · DOCUMENTO ÚNICO PARA IA (TODO EN UNO)

> **Versión del juego v3.0.0 · compilado el 2026-11-22.** Este documento reúne todo lo que una IA necesita para crear el **arte** y la **historia** de *Juega EnCicla*, el videojuego del sistema de bicicletas públicas del Valle de Aburrá: protocolo, contexto, roles, biblia de estilo, personajes, encargos con sus prompts, datos reales de EnCicla, huevos de pascua del Metro, correcciones, entregas, integración y galería de referencia. Los anexos traen los textos actuales de la historia, la guía del juego y la bitácora.
>
> **SI ERES UNA IA:**
> 1. Empieza por la **parte 0 (PROTOCOLO)** y síguelo al pie de la letra.
> 2. **Lee TODO**, de principio a fin (si no te cabe de una vez, léelo por partes hasta terminar).
> 3. Reflexiona, responde el **cuestionario** y prueba en pequeño.
> 4. **Auto‑ajústate** guardando tus “Reglas aprendidas”.
> 5. Solo entonces haz **tu** parte, con precisión.
> 6. **Al terminar**, entrega un **documento con todo tu trabajo** en **tres versiones**: **PDF maestro**, **MD con el código de las imágenes** y **ZIP con las imágenes y el PDF maestro** (parte 12).

## Índice
- 0 · Protocolo para toda IA
- 1 · Léeme: qué es y cómo usarlo
- 2 · Contexto: misión, visión, estado y la próxima revolución
- 3 · Roles de las IA
- 4 · Biblia de estilo
- 5 · El reparto: personajes
- 6 · Encargos de Gemini (G)
- 7 · Encargos de ChatGPT (C)
- 8 · Encargos del Guionista (H)
- 9 · EnCicla y el valle: datos para crear
- 10 · Huevos de pascua del Metro (fragmentos guardados)
- 11 · Correcciones frecuentes
- 12 · Entregas: el documento de cada IA y las tres versiones
- 13 · Integración: qué hago con lo que entregas
- 14 · Galería de referencia (créditos)
- 15 · Bitácora de encargos
- Anexo A · Textos actuales de la historia
- Anexo B · Guía del juego
- Anexo C · Bitácora de desarrollo

---

# 0 · Protocolo para toda IA

> Aplica a **cualquier IA** que trabaje en *Juega EnCicla*:
> - Gemini (Nano Banana), **Artista 1**;
> - ChatGPT, **Artista 2** y **ensamblador** de las entregas;
> - el **Guionista** (ChatGPT o Gemini en modo texto);
> - Claude Code y cualquier otro agente de código.
>
> El autor pide **precisión**. Cada IA lee todo, reflexiona, comprueba que entendió, prueba, se auto‑ajusta y hace **solo** su parte.

### Los 7 pasos (en orden, sin saltarse ninguno)
1. **LEE TODO.**
   - El documento completo, de principio a fin, con sus anexos.
   - Si no te cabe de una vez, **léelo por partes hasta terminarlo**. No empieces sin terminar.
2. **REFLEXIONA.**
   - Resume en pocas líneas: misión y visión, estado del juego, **tu rol**, **tus encargos** y **lo que NO debes hacer**.
   - Si hay dudas, vacíos o contradicciones, **pregunta antes de empezar**.
   - Si dos partes chocan, manda la parte 2 (contexto) y después la 4 (biblia de estilo).
3. **COMPRUEBA QUE ENTENDISTE.** Responde el **cuestionario** de abajo. Si fallas o dudas, vuelve a leer esa parte.
4. **PRUEBA EN PEQUEÑO.** Haz tu prueba, evalúala con la **lista de control** y muéstrasela al autor antes de seguir.

   | IA | Prueba |
   |---|---|
   | Gemini | **G-00** (ancla de estilo) |
   | ChatGPT | **C-00** (un ícono: el oficio Anfitrión) |
   | Guionista | **H-00** (tres frases de tres personajes) |
   | Agentes de código | `node tools/build.js` y `node tests/run.js` sin errores, y jugar un turno de cada oficio |

5. **AUTO‑AJÚSTATE.**
   - Corrige tu forma de trabajar con lo que te enseñó la prueba.
   - Guarda tus **Reglas aprendidas**:

     | IA | Dónde las guardas |
     |---|---|
     | Gemini | Instrucciones de tu **Gem** |
     | ChatGPT y Guionista | Instrucciones de tu **Proyecto** |
     | Agentes de código | Skills `encicla-*` y la bitácora |

     ```
     REGLAS APRENDIDAS · <IA> · Juega EnCicla
     1. <regla corta y verificable>
     2. ...
     Última prueba aprobada: <encargo> · <fecha>
     ```
   - Repite la prueba hasta que pase.
   - **Nunca** cambies la misión, la visión ni las reglas del autor: ajusta solo **cómo** trabajas tú.
6. **HAZ SOLO LO TUYO, CON PRECISIÓN.**
   - Un encargo a la vez, en el orden de prioridad (12.1).
   - Respeta exactamente la vista, la paleta, el fondo, la relación de aspecto, el nombre de archivo y el formato.
   - Si te piden algo de otra IA, di a quién le corresponde y no lo hagas.
7. **ENTREGA Y REGISTRA.**
   - Después de **cada imagen o texto**, escribe en el chat su **nombre de archivo** y el **prompt final que funcionó**.
   - **Al terminar tu trabajo** (o una tanda grande), entrega el **documento de entrega** con **todo** lo que hiciste, en **tres versiones**: **PDF maestro**, **MD con el código de las imágenes** y **ZIP con las imágenes y el PDF maestro** (parte 12).
   - Anota tu avance en la bitácora de encargos (parte 15).

### Cuestionario de comprensión
Responde con tus palabras y di en qué parte lo leíste.
1. ¿Qué es *Juega EnCicla*, quién lo crea y para quién es?
2. ¿Cuáles son los tres colores de EnCicla para uniformes y bicis, con su código?
3. ¿Qué fondo lleva un sprite o un ícono? ¿Y la capa lejana de una panorámica?
4. ¿Qué vista lleva un sprite cenital y hacia dónde mira el personaje?
5. Entre semana, ¿hasta qué hora se prestan bicis y hasta qué hora se reciben? ¿Y los domingos y festivos?
6. ¿Cuáles son los cuatro corredores eléctricos y hasta qué hora funcionan las eléctricas?
7. ¿Qué nunca puede aparecer en una imagen o en un texto?
8. ¿Cuáles son tus encargos, en qué orden, y cuáles no son tuyos?
9. ¿Qué entregas al terminar, con qué nombres y en qué tres versiones?
10. ¿Qué haces si un encargo choca con la biblia de estilo o si te falta un dato de EnCicla?

### Lista de control (antes de entregar cada pieza)
- [ ] Es el encargo correcto y tiene el **nombre de archivo** exacto.
- [ ] **Vista** correcta: cenital, perfil, tres cuartos o frontal, según el encargo.
- [ ] **Paleta** de la biblia; uniformes y bicis en **azul oscuro, verde claro y blanco**.
- [ ] **Fondo** pedido: magenta plano `#FF00FF` o escena completa. Nunca blanco ni con degradado.
- [ ] **Sin texto**, letras, números, logos, marcas, firmas ni marca de agua.
- [ ] Las piezas de juego **se entienden en pequeño**: reducidas a 48 px siguen claras.
- [ ] Cada personaje es **igual a su hoja**: cara, peinado, ropa y colores.
- [ ] Parece **Medellín y el Valle de Aburrá**, no una ciudad cualquiera.
- [ ] Nada inseguro ni inapropiado (2.5).
- [ ] Guardaste el **prompt final**, en el chat y en un `.txt` con el mismo nombre de la imagen.

---

# 1 · Léeme: qué es y cómo usarlo

- **Qué es.** El encargo de arte e historia para la próxima gran versión de *Juega EnCicla*. Hoy el juego dibuja todo su arte con código. Con este documento, las IA crean el arte hecho a mano y la historia que lo reemplazan y lo amplían.
- **Cómo usarlo (autor):**
  1. Crea un **Gem** en Gemini (Artista 1), un **Proyecto** en ChatGPT (Artista 2) y otro **Proyecto** para el Guionista. Sube este documento completo como archivo o pégalo en sus instrucciones.
  2. Pídele a cada IA: “Sigue el protocolo de la parte 0 y empieza por tu prueba”.
  3. Aprueba la prueba. Después pide los encargos en el orden de prioridad (12.1), por tandas.
  4. Al terminar cada IA, pide su **documento de entrega en tres versiones** (parte 12).
  5. Cuando todas terminen, pide a ChatGPT la **consolidación final** (C-99) y entrégame las tres versiones finales.
- **Las entregas parciales sirven.** Integro lo que llegue y el resto sigue con el dibujo actual.
- **Una conversación por tanda.** Si la conversación se alarga, abre otra con el mismo Gem o Proyecto y di en qué encargo vas.

---

# 2 · Contexto: misión, visión, estado y la próxima revolución

## 2.1 Misión
Mostrar EnCicla, el sistema público de bicicletas del Valle de Aburrá, y a la gente que lo hace andar: usuarios, anfitriones, mecánicos, bodega, apoyo, técnicos, conductores de balance, sala de control, supervisores, pausas activas, rescate y brigada de limpieza. Que jugar enseñe a usar el sistema, a convivir en la vía y a valorar cada oficio.

## 2.2 Visión
Un arcade **ligero y sin internet** (un solo archivo HTML, página instalable y APK de Android), jugable en cualquier celular, con el **mapa real** del valle, los **horarios reales** y la **cultura paisa**. Ser trabajador de EnCicla debe sentirse como un oficio heroico y cotidiano; ser usuario, como una aventura por la ciudad.

## 2.3 Estado actual (v3.0.0)
- **12 oficios** con turnos y escalafón, más el **modo libre**: mundo abierto de 24 horas con préstamo, renovación y misiones.
- Mapa real del valle: 133 estaciones, ciclorrutas, río, metro y **45 lugares** que se coleccionan como **postales**. Ciudad viva con peatones y tráfico, día y noche, lluvia.
- Calendario real: festivos de Colombia y 13 fiestas (Feria de las Flores, Alumbrados, Velitas…).
- Gráficos pixel, 3D y vista panorámica de plataformas. Música por estilos: jazz, lo-fi, soft rock y electrónica.
- Multijugador (red local, internet y Bluetooth), retos por QR, modo para daltonismo, tutor con compañero y escenas de historia.
- **Todo el arte se dibuja con código.** Cada pieza que entregues cambia mucho el juego.
- Creado por **OneZero**, con permiso de EnCicla para la demostración.

## 2.4 La próxima revolución
1. **Arte hecho a mano:** personajes con hoja de modelo y retratos, sprites, ciudad con identidad paisa, estaciones, postales, panorámicas por capas, íconos, fiestas y arte clave.
2. **Historia “Un día del valle”:** 24 horas de EnCicla contadas por sus oficios, de las tulas de las 4 a. m. al cierre de las 10 p. m., con los **15 años de EnCicla** (2011–2026) de fondo.
3. **Huevos de pascua del Metro:** cruces con *El Metro*, el juego hermano (parte 10).
4. **Datos oficiales en camino:** el autor entregará la información oficial de EnCicla (estaciones y su dificultad por turno, organigrama, horarios por zona, festividades y cantidades). Mientras llega, **no inventes datos**: usa la parte 9 y marca lo que falte como *por confirmar*.

## 2.5 Reglas del autor (no se negocian)
- **Precisión** y **poco texto en pantalla**: es un juego, no un manual.
- **Colores de EnCicla** para uniformes y bicis: **azul oscuro `#0e2d55`**, **verde claro `#9bd341`** y **blanco `#ffffff`**.
- **Sin logos reales** (EnCicla, Metro, Área Metropolitana, alcaldías, marcas comerciales) y **sin texto** en las imágenes. Los logos y textos oficiales los pongo yo en el juego.
- **Personas ficticias:** nadie reconocible (ni empleados reales, ni famosos, ni políticos).
- **Nada de** cigarrillos, alcohol, drogas, armas, violencia ni groserías. Sin estereotipos negativos de barrios o comunas.
- **La seguridad vial como ejemplo:** casco al montar, luces de noche, nada de celular en la mano mientras se pedalea, respeto al peatón y al semáforo. Lo inseguro solo aparece como error que el juego corrige.
- **La diversidad real del valle:** edades, tonos de piel, cuerpos, mujeres y hombres en todos los oficios, personas con discapacidad.
- **Inspiración, no copia:** nada de personajes, escenarios ni estilos idénticos a los de otros juegos.
- Créditos del juego: **Creado por OneZero**. Datos del mapa: © colaboradores de OpenStreetMap (ODbL).

---

# 3 · Roles de las IA

| Rol | IA | Hace | No hace |
|---|---|---|---|
| **Artista 1** | Gemini (Nano Banana) | Encargos **G**: ancla de estilo, hojas de personaje y retratos, estaciones e interiores, postales, panorámicas, fiestas, huevos de pascua, escenas de la historia y arte clave | Íconos, sprites cenitales, texturas, interfaz, textos |
| **Artista 2** | ChatGPT (imágenes y Python) | Encargos **C**: íconos, sprites cenitales (bicis, personajes, peatones, vehículos), texturas, vegetación, fachadas, objetos de minijuegos, interfaz, decoraciones de fiestas y marcadores del mapa. Además, la **consolidación final (C-99)** | Retratos, escenas, postales, textos de historia |
| **Guionista** | ChatGPT o Gemini (texto) | Encargos **H**: biblia narrativa, voces, historia principal, historias por oficio, frases de la ciudad, logros, tutor, fiestas, cameos del Metro y guion visual de las escenas | Imágenes |
| **Integrador** | Claude Code | Revisa, limpia, reduce a pixel art, arma atlas, integra al código, prueba y publica | Generar arte |

**Cómo trabaja cada una**
- **Gemini:** adjunta la ancla **G-00** como referencia de estilo en cada encargo; para un personaje, adjunta también su hoja (G-01 a G-12). Una imagen por mensaje; después de cada una, escribe su nombre de archivo y el prompt final.
- **ChatGPT:** trabaja en hojas con cuadrícula exacta. Usa Python para revisar el fondo, recortar celdas, nombrar archivos y armar la entrega con el script de 12.6.
- **Guionista:** entrega cada texto legible (`.md`) y en JSON válido (`.json`) con los límites de caracteres de cada encargo.

---

# 4 · Biblia de estilo

## 4.1 Dirección de arte
**Pixel art moderno, limpio y cálido**, como un juego independiente de 16 bits: formas grandes y legibles, contorno oscuro de 1 píxel, sombreado plano de 2 o 3 tonos, luz desde arriba a la izquierda, colores alegres sin ser chillones. La ciudad se reconoce por el **ladrillo a la vista**, las **montañas verdes** que encierran el valle, los **guayacanes** florecidos, el **río canalizado**, el **viaducto del metro** y los **cables** que suben las laderas.

| Familia | Qué | Acabado |
|---|---|---|
| **Piezas de juego** | sprites, íconos, texturas, objetos, interfaz, marcadores | pixel art estricto, pocos tonos, fondo magenta |
| **Ilustraciones** | retratos, hojas, estaciones, postales, panorámicas, escenas, fiestas, arte clave | pixel art de alta resolución con luz ambiental, misma paleta |

## 4.2 Paleta
| Nombre | HEX | Uso |
|---|---|---|
| Azul noche | `#0a2342` | noche, interfaz, sombras profundas |
| Azul EnCicla | `#0e2d55` | uniformes, bicis, interfaz |
| Azul medio | `#143a6b` · `#2a5a92` | sombras y luces del azul |
| Verde EnCicla | `#9bd341` | uniformes, bicis, botones, bordes de ciclorruta |
| Verde brillo | `#c4ec7c` | brillos del verde |
| Verde hoja | `#5e9a1e` | vegetación y sombras del verde |
| Verde ciclorruta | `#4a9a2c` | piso de la ciclorruta |
| Blanco | `#ffffff` | uniformes, bicis, pictogramas |
| Crema | `#f4efd8` | papel, fondos claros |
| Ámbar | `#ffc93c` | sol, alertas, guayacán amarillo |
| Coral | `#ff6b5a` | error, peligro, guayacán rosado |
| Cielo | `#56c7ff` | cielo, agua, pantallas |
| Ladrillo | `#c0623b` | fachadas, laderas, techos |
| Tinta | `#0a1424` | contorno de sprites |
| Gris · plata | `#9aa7b8` · `#d6dde6` | concreto, metal, andenes |

- Piezas de juego: **máximo 32 colores** (sin contar el magenta). Ilustraciones: libres dentro de esta gama.
- Pieles: tonos naturales variados; las de cada personaje están en la parte 5.

## 4.3 Vistas
| Vista | Para qué | Regla |
|---|---|---|
| **Cenital** | sprites del mapa, texturas, árboles, vehículos, decoraciones | desde arriba a 90°, como un mapa. El personaje o el vehículo **mira hacia arriba (norte)**; el juego lo rota |
| **Perfil** | estaciones, panorámicas, vehículos de perfil | lateral puro, sin perspectiva, suelo plano abajo |
| **Tres cuartos** | hojas de personaje, postales, escenas | cámara a la altura de los ojos o un poco elevada |
| **Frontal** | retratos e íconos | de frente y centrado |

## 4.4 Formatos y tamaños
Genera a la **mayor resolución posible**: yo reduzco a la escala del juego con vecino más cercano y cuantizo a la paleta.

| Pieza | Relación | Contenido | En el juego |
|---|---|---|---|
| Hoja de personaje | 16:9 | 4 vistas de cuerpo entero en fila: frente, tres cuartos, perfil, espalda | referencia |
| Retrato | 1:1 | busto centrado | 96 px |
| Hoja de sprites | 1:1 | cuadrícula de **4×4** celdas iguales (1024×1024, celdas de 256 px) | 24–40 px |
| Hoja de íconos | 1:1 | cuadrícula de 4×4 | 32–64 px |
| Textura | 1:1 | se repite sin costuras por los cuatro lados | casillas de 16 px |
| Estación o vehículo de perfil | 16:9 | un objeto completo, suelo abajo | 160–320 px de ancho |
| Postal | 4:3 | escena completa | 320×240 |
| Capa de panorámica | 21:9 | se repite en bucle: el borde izquierdo empata con el derecho | ancho de pantalla |
| Escena de historia | 16:9 | escena completa | pantalla completa |
| Arte clave | 9:16 y 16:9 | escena completa | portada |

> Si tu herramienta no logra la cuadrícula exacta, entrega cada celda como imagen aparte, todas del mismo tamaño y encuadre, numeradas `_01`, `_02`, `_03`…

## 4.5 Fondos
- **Magenta plano `#FF00FF`** en todo lo que va recortado: sprites, íconos, objetos, retratos, hojas de personaje, estaciones y vehículos de perfil, y capas 2 a 4 de las panorámicas. Sin sombras, degradados ni brillos en el fondo. El magenta **no** puede aparecer dentro del dibujo.
- **Escena completa** en postales, interiores, escenas, fiestas, arte clave y la capa 1 (cielo) de las panorámicas.
- **Nunca** fondo blanco, ajedrezado falso de transparencia ni degradado.

## 4.6 Personas, uniforme y bicis
- **Proporción:** 4 cabezas de alto en hojas y escenas; 2,5 cabezas en sprites cenitales (cabeza grande y legible). Manos simples. Caras amables y expresivas.
- **Uniforme EnCicla** (todos los trabajadores): polo **azul oscuro `#0e2d55`** con cuello y franja en los hombros **verde claro `#9bd341`** y vivos **blancos**; pantalón azul oscuro; **gorra blanca**; carné colgado; zapatos cerrados. En el pecho, un **círculo blanco liso**: ahí va el logo en el juego.
- **Oficios de calle** (apoyo, pausas activas, limpieza, técnico, rescate y balance): **chaleco reflectivo verde claro** con cintas plateadas.
- **Color personal:** cada trabajador lleva un accesorio de su color (parte 5) para reconocerlo de lejos.
- **Usuarios:** ropa de calle variada y casco al montar.
- **Bici EnCicla mecánica:** urbana, marco **blanco** con detalles **verde claro** y **azul oscuro**, guardabarros, **canasta delantera**, sillín negro con ajuste rápido, luces adelante y atrás, cadena con protector. Plato y cadena al lado **derecho**. Sin texto ni logos.
- **Bici EnCicla eléctrica:** igual, con **batería azul oscuro** en el tubo diagonal y un **rayo verde claro** pequeño.
- **Bici propia:** colores variados, nunca la combinación de EnCicla.

## 4.7 Ciudad y naturaleza
- **Ladrillo a la vista** (`#c0623b`) en laderas y edificios; techos de losa gris, teja de barro y zinc; casas de colores en el centro y en los pueblos; torres de vidrio en El Poblado y Ciudad del Río.
- **Montañas verdes** alrededor del valle; nubes blancas en la tarde; neblina en la madrugada; aguacero corto en la tarde.
- **Árboles:** guayacán amarillo y guayacán rosado florecidos, ceiba, mango, palma, yarumo.
- **Río Medellín:** canalizado, con orillas de concreto, zonas verdes y puentes.
- **Metro:** viaducto de concreto gris y trenes por encima de la ciudad; cables de colores subiendo las laderas.
- **Ciclorruta:** franja exclusiva **verde `#4a9a2c`** con bordes **verde claro `#9bd341`**, línea central clara y pictograma blanco de bici en el piso (el pictograma no cuenta como texto).
- **Estaciones EnCicla:** fila de anclajes con bicis. Las **con anfitrión** tienen un pequeño **habitáculo** con mostrador; las **automáticas**, un **tótem** de autoservicio; las **eléctricas**, anclajes con carga. Usa las fotos de la galería (parte 14) como referencia de formas, sin copiar logos.

## 4.8 Referencias de videojuegos (inspiración, no copia)
| Juego | Qué tomar |
|---|---|
| *Stardew Valley* | calidez del pixel art, retratos expresivos, vida de pueblo |
| *Celeste*, *Owlboy* | panorámicas por capas y luz ambiental en pixel art |
| *Mini Motorways* | un mapa de ciudad que se lee de un vistazo |
| *Overcooked* | oficios caóticos y cooperativos |
| Juegos de bolsillo de 16 bits | íconos y objetos legibles en pequeño |
| Juegos de ciudad cenitales de los 90 | ciudad vista desde arriba con tráfico vivo |

## 4.9 Prohibido
Texto, letras y números (salvo los símbolos universales ✓ ✗ + ! ? en íconos); logos y marcas; marcas de agua y firmas; personas reales; estilo fotográfico; 3D con brillos plásticos; desenfoque; degradados de fondo; magenta dentro del dibujo; cigarrillos, alcohol, armas o violencia; conductas inseguras presentadas como buenas.

---

# 5 · El reparto: personajes

Edades propuestas para el arte. Colores de piel y cabello tomados del juego.

| # | Personaje | Oficio | Barrio | Edad | Lema |
|---|---|---|---|---|---|
| 1 | **Doña Luz** | usuaria desde 2011 | Belén | 63 | “Del afán no queda sino el cansancio.” |
| 2 | **Santi** | anfitrión de estación | Floresta | 24 | “Una sonrisa también se presta.” |
| 3 | **Don Jairo** | mecánico del taller | Aranjuez | 58 | “Toda bici avisa lo que le duele.” |
| 4 | **Yuli** | jefa de bodega | Guayabal | 34 | “Cada cosa en su sitio.” |
| 5 | **Kevin** | apoyo en ruta | Manrique | 21 | “El que sirve para todo, sirve para mucho.” |
| 6 | **Maryi** | pausas activas | Laureles | 29 | “Un cuerpo que se mueve trabaja mejor.” |
| 7 | **Doña Marta** | brigada de limpieza | Belén | 52 | “Un habitáculo limpio también presta mejor servicio.” |
| 8 | **Ing. Paola** | técnica de estaciones | Envigado | 31 | “Luz verde o nada.” |
| 9 | **Jhon** | rescate de bicis | Manrique | 26 | “Ninguna bici se queda atrás.” |
| 10 | **Wilson** | conductor de balance | Bello | 45 | “Por las vías, nunca por la ciclorruta.” |
| 11 | **Cata** | sala de control | Robledo | 27 | “El mapa habla.” |
| 12 | **Don Rubén** | supervisor | Belén · Malibú | 55 | “Se manda como quien ha pasado por todos los puestos.” |

**Historias cortas (del juego)**
- **Doña Luz:** pedalea desde que EnCicla era un piloto entre universidades en 2011. Conoce cada ciclorruta del valle y no perdona a quien pasa en rojo.
- **Santi:** madruga a las 4:30 para recibir la tula a las 5 en punto. Ajusta los sillines sin que se lo pidan y se sabe el nombre de cada usuario de su estación.
- **Don Jairo:** treinta años en talleres de bicicletas. Reconoce una cadena seca por el ruido desde la esquina.
- **Yuli:** nada entra a la bodega sin verificar y nada sale sin estar completo. Su lema está pegado en la puerta.
- **Kevin:** anfitrión de apoyo de la zona Envigado: trece estaciones que abrir, relevos de almuerzo e inventario en cada rato libre.
- **Maryi:** recorre las estaciones a mitad de turno con su parlante y pone a estirar a todo el que encuentre, del anfitrión al supervisor.
- **Doña Marta:** cada mes sale con otro supervisor a recorrer las estaciones con anfitrión: vidrio, mostrador, piso y basura, sin dejar nada.
- **Ing. Paola:** ingeniera electrónica. Tiene un plan para cada power bank y sabe qué celulares de estación están medio malos.
- **Jhon:** encuentra bicis abandonadas en parques y esquinas y las devuelve pedaleando con una mano y llevando la otra bici con la otra.
- **Wilson:** sale a las 4 de la mañana del parqueadero de la Terminal del Norte y vuelve de noche, cuando el camión ya no cabe más bicis.
- **Cata:** desde la sala de control ve el valle entero: rojo es vacía, azul es llena. Cada hora revisa que los inventarios cuadren.
- **Don Rubén:** empezó de usuario; luego fue anfitrión, mecánico y conductor. Hoy arma las tulas a las 4 a. m. en Casa EnCicla y las recoge al cierre.

**Descripción para los prompts** (cópiala donde diga `[PERSONAJE]`)

| # | Archivo | Descripción |
|---|---|---|
| 1 | `dona_luz` | Doña Luz, usuaria de EnCicla de 63 años: piel #e0ac7e, canas #d9d9d9 recogidas en un moño, gafas redondas, blusa lila #b07cff, pantalón gris cómodo, tenis blancos, mochila de tela y casco lila; mirada pícara y cariñosa |
| 2 | `santi` | Santi, anfitrión de estación de 24 años: piel #c68a5c, pelo negro #2b1d14 corto, delgado, sonrisa grande; uniforme EnCicla con gorra blanca; carné con cordón verde claro y reloj verde claro |
| 3 | `don_jairo` | Don Jairo, mecánico de 58 años: piel #a86a3d, canas #8a8a8a, bigote gris, brazos fuertes; uniforme EnCicla con delantal de taller azul #143a6b manchado de grasa, gafas de seguridad en la frente, trapo en el bolsillo y llave en la mano |
| 4 | `yuli` | Yuli, jefa de bodega de 34 años: piel #e0ac7e, pelo castaño #5a2d0c en cola de caballo, segura y ordenada; uniforme EnCicla, tabla de inventario amarilla #ffc93c bajo el brazo, lápiz en la oreja y guantes de trabajo |
| 5 | `kevin` | Kevin, apoyo en ruta de 21 años: afrocolombiano, piel #8d5524, pelo negro #141414 muy corto con diseño rapado, atlético y alegre; uniforme EnCicla con chaleco reflectivo verde claro, gorra blanca y morral verde claro #9bd341 con llaves colgando |
| 6 | `maryi` | Maryi, instructora de pausas activas de 29 años: piel #c68a5c, pelo negro #2b1d14 en trenza larga, llena de energía; uniforme EnCicla deportivo (camiseta azul oscuro con hombros verde claro, licra azul oscuro, tenis), chaleco reflectivo, banda coral #ff6b5a en la cabeza y parlante portátil al hombro |
| 7 | `dona_marta` | Doña Marta, supervisora de la brigada de limpieza, 52 años: piel #c68a5c, pelo castaño #5a2d0c recogido con pañoleta blanca, exigente pero cálida; uniforme EnCicla con chaleco reflectivo, guantes de caucho amarillos #ffc93c y rociador en la mano |
| 8 | `paola` | Ingeniera Paola, técnica de estaciones de 31 años: piel clara #f1c9a5, pelo negro #141414 corto tipo bob, gafas rectangulares, concentrada; uniforme EnCicla con chaleco reflectivo, casco de seguridad amarillo #ffc93c, multímetro y destornillador en el cinturón |
| 9 | `jhon` | Jhon, rescatista de bicis de 26 años: piel #a86a3d, pelo negro #141414 y barba corta, fuerte y tranquilo; uniforme EnCicla con chaleco reflectivo, casco y guantes de ciclismo blancos y rodilleras |
| 10 | `wilson` | Wilson, conductor del camión de balance, 45 años: piel #c68a5c, pelo negro #2b1d14 con entradas, bigote, robusto y bonachón; uniforme EnCicla con chaleco reflectivo, gorra blanca, gafas de sol colgadas y termo coral #ff6b5a |
| 11 | `cata` | Cata, operadora de la sala de control, 27 años: piel #a86a3d, pelo negro #2b1d14 rizado y voluminoso, atenta; uniforme EnCicla, diadema con micrófono azul cielo #56c7ff y taza de tinto |
| 12 | `don_ruben` | Don Rubén, supervisor de 55 años: piel #e0ac7e, canas #bbbbbb peinadas hacia atrás, porte sereno de líder; uniforme EnCicla con chaqueta azul noche #0a2342, radio en el cinturón, linterna y un llavero grande con las llaves de las estaciones |

> El jugador crea su propio personaje al empezar el juego. Para él no hay hoja: lo cubren los cuerpos base de **C-11** y **C-12**.

---

# 6 · Encargos de Gemini (G)

### 6.0 Prompt base de Gemini (pégalo al inicio de cada encargo)
```
Estilo "Juega EnCicla": pixel art moderno, limpio y cálido, de videojuego independiente de 16 bits. Formas grandes y legibles, contorno oscuro de 1 píxel (#0a1424), sombreado plano de 2 o 3 tonos, luz desde arriba a la izquierda. Paleta: azul oscuro #0e2d55, azul noche #0a2342, verde claro #9bd341, verde hoja #5e9a1e, blanco, crema #f4efd8, ámbar #ffc93c, coral #ff6b5a, cielo #56c7ff, ladrillo #c0623b, gris #9aa7b8. Lugar: Medellín y el Valle de Aburrá, Colombia. Uniforme EnCicla: polo azul oscuro #0e2d55 con cuello y franja de hombros verde claro #9bd341, vivos blancos, gorra blanca y un círculo blanco liso en el pecho. Bici EnCicla: urbana, marco blanco con detalles verde claro y azul oscuro, canasta delantera. Sin texto, letras, números, logos, marcas, firmas ni marca de agua. Personas ficticias.
```
> Adjunta siempre **G-00** como referencia de estilo y, para un personaje, su hoja.

### G-00 · Ancla de estilo (prueba)
- 16:9 · escena completa · `g00_ancla_estilo.png`
```
[PROMPT BASE]
Escena de mañana en una estación EnCicla con anfitrión, junto a una ciclorruta arborizada de Medellín. Santi, anfitrión de 24 años (piel #c68a5c, pelo negro corto, uniforme EnCicla, gorra blanca, carné con cordón verde claro), le entrega una bici EnCicla a Doña Luz, usuaria de 63 años (piel #e0ac7e, canas recogidas en un moño, gafas redondas, blusa lila #b07cff, casco lila). Al lado, un habitáculo pequeño con mostrador y una fila de anclajes con bicis. Al fondo, edificios de ladrillo a la vista, un guayacán amarillo florecido, el viaducto gris del metro y montañas verdes. Vista tres cuartos, luz cálida de las 8 de la mañana.
```
> Esta imagen fija el estilo de todo. Guárdala y adjúntala en cada encargo siguiente.

### G-01 a G-12 · Hojas de personaje y retratos
Por personaje, **4 imágenes** (la descripción `[PERSONAJE]` está en la parte 5):

| Encargo | Personaje | Archivos |
|---|---|---|
| G-01 | Doña Luz | `g01_per_dona_luz_hoja.png` · `g01_ret_dona_luz_neutra.png` · `_alegre.png` · `_preocupada.png` |
| G-02 | Santi | `g02_per_santi_hoja.png` · `g02_ret_santi_<neutra│alegre│preocupada>.png` |
| G-03 | Don Jairo | `g03_per_don_jairo_hoja.png` · `g03_ret_don_jairo_…` |
| G-04 | Yuli | `g04_per_yuli_hoja.png` · `g04_ret_yuli_…` |
| G-05 | Kevin | `g05_per_kevin_hoja.png` · `g05_ret_kevin_…` |
| G-06 | Maryi | `g06_per_maryi_hoja.png` · `g06_ret_maryi_…` |
| G-07 | Doña Marta | `g07_per_dona_marta_hoja.png` · `g07_ret_dona_marta_…` |
| G-08 | Ing. Paola | `g08_per_paola_hoja.png` · `g08_ret_paola_…` |
| G-09 | Jhon | `g09_per_jhon_hoja.png` · `g09_ret_jhon_…` |
| G-10 | Wilson | `g10_per_wilson_hoja.png` · `g10_ret_wilson_…` |
| G-11 | Cata | `g11_per_cata_hoja.png` · `g11_ret_cata_…` |
| G-12 | Don Rubén | `g12_per_don_ruben_hoja.png` · `g12_ret_don_ruben_…` |

**Hoja** (16:9):
```
[PROMPT BASE]
Hoja de modelo de personaje: [PERSONAJE]. Cuatro vistas de cuerpo entero en una sola fila, del mismo tamaño y alineadas por los pies: de frente, tres cuartos, de perfil mirando a la derecha y de espaldas. Proporción de 4 cabezas de alto, pose neutra, brazos relajados. Fondo magenta plano #FF00FF, sin sombras en el piso.
```
**Retrato** (1:1, uno por expresión):
```
[PROMPT BASE]
Retrato de busto de [PERSONAJE], de frente y centrado, con los hombros visibles. Expresión: [neutra y amable | alegre, sonriendo | preocupada, con las cejas levantadas]. Idéntico a su hoja de modelo adjunta. Fondo magenta plano #FF00FF.
```

### G-20 a G-28 · Estaciones, vehículo e interiores
Para las piezas de **perfil** agrega: `Vista de perfil pura (lateral, sin perspectiva), suelo plano en la parte de abajo, objeto completo y centrado. Fondo magenta plano #FF00FF.`
Para los **interiores** agrega: `Interior visto de perfil, como un escenario de juego de plataformas. Escena completa.`

| Encargo | Archivo | Tipo | Qué dibujar |
|---|---|---|---|
| G-20 | `g20_est_anfitrion.png` | perfil | Estación con anfitrión: habitáculo pequeño de metal blanco y azul oscuro con ventanilla y mostrador, alero verde claro, y a su lado una fila de 8 anclajes con bicis EnCicla. Sin letreros |
| G-21 | `g21_est_automatica.png` | perfil | Estación automática: tótem de autoservicio (columna blanca con pantalla y lector de tarjeta, franja verde claro) y 8 anclajes con luces LED verdes, con bicis |
| G-22 | `g22_est_electrica.png` | perfil | Estación solo eléctrica: tótem con un rayo verde claro y anclajes con cargador; bicis eléctricas EnCicla (batería azul oscuro) cargando |
| G-23 | `g23_est_mixta.png` | perfil | Estación mixta: mitad anclajes normales y mitad con cargador; bicis mecánicas y eléctricas mezcladas |
| G-24 | `g24_casa_encicla.png` | perfil | Casa EnCicla, la sede operativa: bodega de ladrillo con un gran portón abierto; adentro, estantes con tulas (maletines azul oscuro) y bicis en fila; afuera, un camión de balance; luces encendidas |
| G-25 | `g25_int_taller.png` | interior | Taller de mecánica: bancos de trabajo, bicis en soportes, tablero con herramientas colgadas, llantas, lámparas cálidas |
| G-26 | `g26_int_bodega.png` | interior | Bodega de repuestos: estanterías con cajas de colores por tipo de pieza (llantas, cadenas, frenos, sillines, luces, herramientas), carretilla, tabla de inventario |
| G-27 | `g27_int_control.png` | interior | Sala de control: pared de pantallas con el mapa del valle lleno de puntos rojos (vacías), azules (llenas) y verdes; escritorios, operadores con diadema y una ventana a la ciudad de noche |
| G-28 | `g28_camion_balance.png` | perfil | Camión de balance: camión mediano blanco con franja verde claro y azul oscuro, plataforma trasera de dos pisos con bicis EnCicla amarradas y rampa plegable |

### G-30 a G-74 · Postales del valle (45)
- 4:3 · escena completa · `gNN_pos_<lugar>.png`. Primero las 15 marcadas con ★.
```
[PROMPT BASE]
Postal ilustrada de [LUGAR] ([MUNICIPIO]), Valle de Aburrá: [QUÉ MOSTRAR]. En primer plano, una ciclorruta o un andén con una bici EnCicla parqueada. Vista tres cuartos, de día, cielo con nubes de tarde, colores cálidos. Escena completa, sin marco ni texto.
```

| Encargo | Archivo | Lugar · municipio | Qué mostrar |
|---|---|---|---|
| G-30 | `g30_pos_bello` | Parque de Bello · Bello | parque principal con su iglesia de torres altas, árboles y bancas |
| G-31 | `g31_pos_terminaln` | Terminal del Norte · Medellín | la terminal de buses con su gran techo y, en el parqueadero, los camiones de balance |
| G-32 | `g32_pos_volador` | Cerro El Volador · Medellín | cerro verde en medio de la ciudad, senderos y caminantes, el valle abajo |
| G-33 | `g33_pos_unal` | Universidad Nacional · Medellín | campus arborizado con edificios de ladrillo y estudiantes en bici |
| G-34 | `g34_pos_moravia` | Moravia · Medellín | la ladera convertida en jardín comunitario lleno de flores, casas de colores alrededor |
| G-35 ★ | `g35_pos_botanico` | Jardín Botánico · Medellín | el orquideorama (techo de madera en forma de flores hexagonales), el lago y orquídeas |
| G-36 ★ | `g36_pos_udea` | Ciudad Universitaria UdeA · Medellín | plazoleta central, edificios de ladrillo y estudiantes en los prados |
| G-37 ★ | `g37_pos_explora` | Parque Explora · Medellín | los edificios en forma de cubos rojos del museo de ciencia y niños entrando |
| G-38 ★ | `g38_pos_estadio` | Estadio Atanasio Girardot · Medellín | el estadio y su unidad deportiva, hinchas de verde y de rojo, sin escudos |
| G-39 ★ | `g39_pos_botero` | Plaza Botero · Medellín | plaza con esculturas de bronce redondas y voluminosas (sin copiar obras concretas) y el palacio a cuadros al fondo |
| G-40 ★ | `g40_pos_coltejer` | Edificio Coltejer · Medellín | el rascacielos del centro con su punta de aguja, entre edificios más bajos |
| G-41 | `g41_pos_teatro` | Teatro Metropolitano · Medellín | edificio escalonado de ladrillo junto al río |
| G-42 | `g42_pos_laureles` | Primer Parque de Laureles · Medellín | glorieta redonda arborizada, casas bajas con antejardín y ciclistas |
| G-43 ★ | `g43_pos_pies` | Parque de los Pies Descalzos · Medellín | fuentes, arena y bambú, gente descalza, un edificio moderno de vidrio al fondo |
| G-44 ★ | `g44_pos_luces` | Parque de las Luces · Medellín | cientos de postes altos de luz en una plaza, junto a un edificio en forma de pirámide invertida y edificios antiguos restaurados |
| G-45 | `g45_pos_depot` | Casa EnCicla · Medellín | la sede operativa: portón, bicis en fila, tulas y el camión de balance (lugar del juego) |
| G-46 ★ | `g46_pos_cerro` | Cerro Nutibara · Pueblito Paisa · Medellín | réplica de un pueblo antioqueño con iglesia blanca, plaza y balcones de colores en la cima, la ciudad abajo |
| G-47 | `g47_pos_mamm` | MAMM · Ciudad del Río · Medellín | museo en una antigua bodega de ladrillo con un volumen de acero oxidado, parque y patinadores |
| G-48 | `g48_pos_poblado` | Parque del Poblado · Medellín | parque fundacional con su iglesia blanca y árboles grandes |
| G-49 | `g49_pos_aeropuerto` | Aeropuerto Olaya Herrera · Medellín | terminal blanca de estilo art déco con su torre y avionetas en la pista |
| G-50 | `g50_pos_lleras` | Parque Lleras · Medellín | parque arborizado rodeado de cafés y restaurantes, de tarde |
| G-51 | `g51_pos_terminals` | Terminal del Sur · Medellín | terminal de buses del sur, buses intermunicipales, montañas al fondo |
| G-52 ★ | `g52_pos_eafit` | Universidad EAFIT · Medellín | campus con lago y árboles, edificios de ladrillo y una iguana tomando el sol |
| G-53 ★ | `g53_pos_envigado` | Parque de Envigado · Envigado | parque principal con su iglesia de dos torres, árboles y bancas |
| G-54 | `g54_pos_itagui` | Parque de Itagüí · Itagüí | parque principal con su iglesia y vida de pueblo |
| G-55 | `g55_pos_sabaneta` | Parque de Sabaneta · Sabaneta | parque principal con su iglesia y fondas alrededor, sin letreros |
| G-56 | `g56_pos_estrella` | Parque de La Estrella · La Estrella | parque principal con su basílica y montañas cercanas |
| G-57 | `g57_pos_barbosa` | Parque de Barbosa · Barbosa | parque de pueblo cálido con su iglesia, palmas y un puesto de piñas |
| G-58 | `g58_pos_girardota` | Parque de Girardota · Girardota | parque con su gran catedral de ladrillo y peregrinos |
| G-59 | `g59_pos_copacabana` | Parque de Copacabana · Copacabana | parque principal con su iglesia y montañas verdes |
| G-60 | `g60_pos_quitasol` | Cerro Quitasol · Bello | gran cerro verde sobre Bello y senderistas |
| G-61 | `g61_pos_fabricato` | Fabricato · Bello | fábrica textil histórica de ladrillo con chimeneas altas |
| G-62 | `g62_pos_hospbello` | Hospital Marco Fidel Suárez · Bello | hospital de fachada sencilla, ambulancia y jardín al frente |
| G-63 | `g63_pos_otraparte` | Casa Museo Otraparte · Envigado | casa blanca de estilo campestre con jardín y café al aire libre |
| G-64 | `g64_pos_ditaires` | Parque Ditaires · Itagüí | parque ecológico con árboles grandes, lago y familias |
| G-65 | `g65_pos_caldas` | Parque de Caldas · Caldas | parque principal con su iglesia, en el sur frío del valle, gente con ruana |
| G-66 | `g66_pos_nacimiento` | Alto de San Miguel · Caldas | bosque de niebla donde nace el río Medellín, una quebrada cristalina entre helechos |
| G-67 ★ | `g67_pos_comuna13` | Comuna 13 · Escaleras eléctricas · Medellín | escaleras eléctricas al aire libre con techos naranjas subiendo la ladera, grafitis coloridos de figuras (sin letras) y casas de ladrillo |
| G-68 ★ | `g68_pos_bibespana` | Parque Biblioteca España · Medellín | tres edificios oscuros con forma de rocas en lo alto de la ladera, junto al metrocable |
| G-69 ★ | `g69_pos_palacio` | Palacio de la Cultura · Medellín | palacio de estilo gótico con fachada a cuadros blancos y negros |
| G-70 ★ | `g70_pos_catedral` | Catedral Metropolitana · Medellín | gran catedral de ladrillo frente a un parque con palomas |
| G-71 | `g71_pos_parquenorte` | Parque Norte · Medellín | parque de diversiones con rueda de Chicago y montaña rusa |
| G-72 | `g72_pos_unidadbelen` | Unidad Deportiva de Belén · Medellín | canchas, pista atlética y coliseo, gente haciendo deporte |
| G-73 | `g73_pos_memoria` | Museo Casa de la Memoria · Medellín | edificio contemporáneo de concreto en un parque, con un jardín sereno |
| G-74 | `g74_pos_trescruces` | Cerro de las Tres Cruces · Medellín | cerro con tres cruces blancas en la cima y gente subiendo al amanecer |

### G-80 a G-83 · Panorámicas por capas
- 21:9 · 4 capas por zona y momento · `gNN_pan_<zona>_<momento>_<capa>.png`, con capa `1` lejana, `2` laderas, `3` ciudad y `4` frente.
- Prioridad: centro de día y de noche → occidente de día → sur de día → norte de tarde → lo demás.
```
[PROMPT BASE]
Capa [N] de 4 de una panorámica lateral (vista de perfil, para desplazamiento horizontal como en un juego de plataformas) de [ZONA], Medellín, [MOMENTO]. Contenido de la capa: [CAPA]. Relación 21:9. El borde izquierdo debe continuar exactamente el borde derecho, porque la imagen se repite en bucle. [Capas 2 a 4: por encima de la silueta, fondo magenta plano #FF00FF.]
```

| Capa | Contenido |
|---|---|
| 1 · lejana | cielo del momento con nubes y las montañas más lejanas del valle en tonos azulados (escena completa) |
| 2 · laderas | cerros y laderas con barrios de casas de ladrillo, techos de zinc y teja y, donde aplique, cables del metrocable subiendo |
| 3 · ciudad | edificios de ladrillo y de vidrio, los lugares de la zona y el viaducto gris del metro con un tren |
| 4 · frente | ciclorruta con bordes verdes, andén, guayacanes, postes de luz, bancas y una estación EnCicla pequeña |

| Encargo | Zona | Lugares de la capa 3 |
|---|---|---|
| G-80 | `centro` | rascacielos con punta de aguja, palacio a cuadros blancos y negros, catedral de ladrillo, viaducto sobre la ciudad |
| G-81 | `norte` (Bello) | chimeneas de fábrica textil, Cerro Quitasol, terminal de buses, casas de ladrillo |
| G-82 | `sur` (Envigado, Sabaneta, Itagüí, La Estrella) | torres de las iglesias de los parques, fábricas bajas, montañas cercanas, más verde |
| G-83 | `occidente` (Laureles, Floresta, Belén) | casas bajas con antejardín, glorietas arborizadas, estadio, Cerro Nutibara |

| Momento | Archivo | Luz |
|---|---|---|
| Día | `dia` | cielo azul `#56c7ff`, sol alto |
| Tarde | `tarde` | cielo naranja y rosado, sombras largas |
| Noche | `noche` | azul noche, ventanas encendidas, faroles amarillos |
| Alumbrados | `alumbrados` | noche de diciembre con luces de colores en árboles, río y puentes (solo centro y occidente) |

### G-84 a G-89 · Fiestas (ambiente)
- 16:9 · escena completa · `gNN_fie_<fiesta>.png`
```
[PROMPT BASE]
Escena de fiesta en Medellín: [FIESTA]. Bicis EnCicla y ciclistas con casco en la escena. Vista tres cuartos, ambiente alegre y familiar. Escena completa.
```

| Encargo | Archivo | Fiesta |
|---|---|---|
| G-84 | `g84_fie_flores` | Feria de las Flores (agosto): desfile de silleteros con grandes silletas de flores a la espalda, gente aplaudiendo, bicis adornadas con flores |
| G-85 | `g85_fie_alumbrados` | Navidad y Alumbrados (diciembre y enero): el río y sus puentes llenos de luces de colores de noche, familias paseando, bicis con luces |
| G-86 | `g86_fie_velitas` | Noche de las Velitas (7 de diciembre): andenes y balcones con velitas y faroles de papel de colores, familias, una estación cerrando |
| G-87 | `g87_fie_halloween` | Halloween (31 de octubre): niños con disfraces tiernos recorren una ciclorruta con sus familias; calabazas y dulces, sin nada de terror |
| G-88 | `g88_fie_libro` | Fiesta del Libro y la Cultura (septiembre, Jardín Botánico): carpas de libros bajo el orquideorama, lectores, bicis parqueadas |
| G-89 | `g89_fie_ciclovia` | Ciclovía de los domingos: avenida cerrada a los carros, familias en bici y en patines, gente trotando, conos naranjas y guías con chaleco |

### G-90 a G-96 · Huevos de pascua del Metro (parte 10)
- Si en *El Metro* ya existe la hoja de un personaje, úsala como referencia y no la repitas: solo adáptala al estilo de este documento.

| Encargo | Archivo | Qué dibujar | Formato |
|---|---|---|---|
| G-90 | `g90_per_rosalba_hoja` + 3 retratos | Rosalba, conductora del Metro de unos 60 años que manejó el primer tren de 1995: canas #dcd8d0, uniforme azul #12446c con franja #1C5C9C, pañoleta y termo de tinto | como G-01 |
| G-91 | `g91_per_nieta_hoja` + 3 retratos | La nieta de Rosalba, 16 años: chaqueta azul, morral y tenis blancos; con casco, aprendiendo a montar en bici EnCicla | como G-01 |
| G-92 | `g92_per_efrain_hoja` | Don Efraín, de unos 65 años, del Puesto de Control del Metro: chaqueta gris #5a6470 y audífonos de radio | hoja 16:9 |
| G-93 | `g93_obj_arepas_marleny` | Doña Marleny, de unos 55 años, con ruana roja #c8201f, en su puesto de arepas con parrilla de carbón | perfil, magenta |
| G-94 | `g94_veh_alimentador` | Bus alimentador del metro, blanco con franja azul #1C5C9C y sin texto, con Wílmar al volante (unos 40 años, piel #8a5a3b, camisa blanca, gorra azul) | perfil, magenta |
| G-95 | `g95_esc_primer_tren` | 4:20 a. m. frente a la estación Niquía del metro: neblina, faroles amarillos, cielo azul oscuro que empieza a aclarar; Rosalba, con su termo, saluda a Wilson que pasa en el camión de balance | 16:9, escena |
| G-96 | `g96_esc_ultima_vuelta` | 10 p. m.: el último tren pasa por el viaducto; abajo, Santi recibe la última bici del día y saluda a Rosalba, que se asoma desde la cabina; luces de la ciudad | 16:9, escena |

### G-100 a G-115 · Escenas de la historia “Un día del valle”
- 16:9 · escena completa · `gNN_esc_dia<NN>.png` (por ejemplo `g100_esc_dia01.png`).
- La descripción de cada escena la escribe el Guionista en **H-80**. Sin ella, usa la línea de la tabla.
```
[PROMPT BASE]
Escena de historia, viñeta a pantalla completa: [DESCRIPCIÓN DE H-80]. Personajes idénticos a sus hojas adjuntas. Vista tres cuartos, luz según la hora. Escena completa.
```

| Encargo | Hora · lugar | Momento |
|---|---|---|
| G-100 | 4:00 a. m. · Casa EnCicla | Don Rubén arma las tulas a la luz de una lámpara |
| G-101 | 4:45 a. m. · Floresta | Santi espera la tula frente a su estación todavía cerrada |
| G-102 | 4:50 a. m. · Terminal del Norte | Wilson enciende el camión de balance |
| G-103 | 5:30 a. m. · Sala de control | Cata abre el mapa: el valle amanece en rojo y azul |
| G-104 | 6:30 a. m. · Taller, Aranjuez | Don Jairo escucha una cadena seca |
| G-105 | 7:15 a. m. · Belén | Doña Luz frena en el semáforo en rojo en plena hora pico |
| G-106 | 9:00 a. m. · Bodega, Guayabal | Yuli revisa que el pedido salga completo |
| G-107 | 10:30 a. m. · Envigado | Ing. Paola revive un tótem apagado |
| G-108 | 11:30 a. m. · Zona Envigado | Kevin llega al relevo de almuerzo |
| G-109 | 12:30 p. m. · Laureles | Maryi pone a bailar a toda una estación |
| G-110 | 2:00 p. m. · Un parque de Manrique | Jhon rescata una bici abandonada |
| G-111 | 3:00 p. m. · Belén | Doña Marta y la brigada del mes dejan brillando el habitáculo |
| G-112 | 6:15 p. m. · Corredor UdeA–Hospital Infantil | carrera contra las 7 p. m., cuando terminan las eléctricas |
| G-113 | 8:59 p. m. · Floresta | el último préstamo del día |
| G-114 | 10:00 p. m. · Cierre | todas las bicis en su anclaje; Don Rubén recoge las tulas |
| G-115 | Domingo · Ciclovía | epílogo: los 15 años de EnCicla, todo el reparto pedaleando junto |

### G-120 a G-124 · Arte clave
| Encargo | Archivo | Relación | Qué dibujar |
|---|---|---|---|
| G-120 | `g120_clave_portada_vertical.png` | 9:16 | Los 12 personajes en una ciclorruta del valle al atardecer, Santi y Doña Luz al frente con bicis EnCicla, el viaducto del metro y las montañas detrás, guayacanes. Tercio superior más limpio: ahí va el título |
| G-121 | `g121_clave_portada_horizontal.png` | 16:9 | La misma composición en horizontal; tercio izquierdo más limpio para el título |
| G-122 | `g122_clave_compartir.png` | 16:9 | Doña Luz y Santi pedalean juntos hacia la cámara por una ciclorruta con el valle detrás y mucho cielo (la recorto a 1200×630) |
| G-123 | `g123_clave_icono.png` | 1:1 | Ícono de la app: una bici EnCicla de tres cuartos sobre un círculo verde claro, fondo azul oscuro liso, formas muy simples; debe entenderse a 48 px |
| G-124 | `g124_clave_carga.png` | 9:16 | Pantalla de carga: amanecer sobre el valle visto desde una ladera, la ciudad encendiéndose y un ciclista subiendo |

---

# 7 · Encargos de ChatGPT (C)

### 7.0 Prompt base de ChatGPT (pégalo al inicio de cada encargo)
```
Estilo "Juega EnCicla": pixel art estricto de videojuego de 16 bits. Contorno de 1 píxel #0a1424, 2 o 3 tonos por color, luz desde arriba a la izquierda, máximo 32 colores de esta paleta: #0e2d55, #0a2342, #143a6b, #9bd341, #c4ec7c, #5e9a1e, #4a9a2c, #ffffff, #f4efd8, #ffc93c, #ff6b5a, #56c7ff, #c0623b, #9aa7b8, #d6dde6 y tonos de piel naturales. Fondo magenta plano #FF00FF, sin sombras ni degradados; el magenta no aparece dentro del dibujo. Sin texto, letras, números, logos ni marcas. Hoja de 1024×1024 en una cuadrícula de 4×4 celdas iguales de 256 px: cada elemento centrado en su celda, ocupando cerca del 80 % y sin tocar los bordes. Todo a la misma escala dentro de la hoja.
```
- **Sprites cenitales:** agrega `Vista cenital exacta a 90°, como un mapa. Cada personaje o vehículo mira hacia arriba (norte).`
- **Animaciones:** cada fila es un personaje y sus 4 celdas son los 4 cuadros del ciclo, en orden.
- Con Python, revisa que el fondo sea `#FF00FF` exacto, recorta las celdas si hace falta y nombra los archivos.

### C-00 · Prueba
- `c00_ico_prueba.png` · 1:1 · un solo ícono: **el oficio Anfitrión** (un habitáculo pequeño con mostrador y una bici EnCicla al lado), fondo magenta.

### C-01 a C-03 · Íconos y logros
| Encargo | Archivo | Celdas (en orden, de izquierda a derecha y de arriba abajo) |
|---|---|---|
| C-01 | `c01_ico_oficios.png` | usuario (bici EnCicla de perfil) · anfitrión (habitáculo con bici) · mecánico (llave cruzada con un rin) · bodega (caja con una llanta) · apoyo (morral con llaves) · pausas activas (persona estirando los brazos con notas musicales) · limpieza (escoba y rociador con destellos) · técnico (tótem con un rayo) · rescate (bici con una flecha curva de regreso) · balance (camión con bicis) · monitoreo (pantalla con mapa y puntos) · supervisor (radio y tabla con ✓) · modo libre (pin sobre montañas) · multijugador (dos bicis lado a lado) · reto QR (cuadro QR estilizado) · historia (libro abierto con una bici) |
| C-02 | `c02_ico_acciones.png` | prestar (bici saliendo del anclaje con flecha) · devolver (bici entrando con flecha) · renovar (reloj con flecha circular) · timbre (campana de bici) · mapa (mapa plegado) · destino (pin de GPS) · foto (cámara) · pausa (dos barras) · controles (joystick) · música (nota) · gráficos (cubo de píxeles) · tutor (globo de diálogo con un bombillo) · compartir (tres nodos unidos) · energía (batería con rayo) · postal (sello postal con montañas) · alerta (triángulo con !) |
| C-03 | `c03_ico_logros_1.png` · `c03_ico_logros_2.png` | una **medalla redonda** por logro, con un símbolo grande en el centro: los 21 logros de 9.8, más *Saludo de alimentador* y *Frenada al centímetro* (10.10). Borde verde claro sobre azul oscuro; las secretas, borde ámbar |

### C-10 a C-16 · Sprites cenitales
| Encargo | Archivo | Contenido |
|---|---|---|
| C-10 | `c10_spr_bicis.png` | bicis solas, estacionadas: EnCicla mecánica · EnCicla eléctrica · propia roja · propia amarilla · propia negra · propia azul cielo · EnCicla con llanta pinchada · sin cadena · sin sillín · tirada en el piso, de lado · con un tinto en la canasta · adornada con flores · con luces de navidad · bici de niño · triciclo de carga · bici de carreras |
| C-11 | `c11_spr_ciclistas_1.png` a `_4.png` | personajes **en bici EnCicla**, 4 cuadros de pedaleo por fila. Hoja 1: Doña Luz, Santi, Don Jairo, Yuli · hoja 2: Kevin, Maryi, Doña Marta, Paola · hoja 3: Jhon, Wilson, Cata, Don Rubén · hoja 4: cuerpos base del jugador (mujer joven, hombre joven, niño o niña, persona mayor) con ropa neutra |
| C-12 | `c12_spr_caminando_1.png` a `_4.png` | los mismos personajes **a pie**, 4 cuadros de caminar por fila, en el mismo orden de hojas |
| C-13 | `c13_spr_acciones.png` | fila 1: Jhon pedalea con una mano y lleva otra bici de la otra · fila 2: Doña Marta barre · fila 3: Maryi baila (brazos arriba, a la izquierda, a la derecha, abajo) · fila 4: Santi entrega una bici |
| C-14 | `c14_spr_peatones_1.png` a `_4.png` | 16 peatones, 4 cuadros de caminar cada uno: estudiante con morral · oficinista con maletín · señora con bolsas de mercado · abuelo con bastón · niña con casco y patines · vendedor de frutas con carrito · turista con cámara · persona trotando · mamá con coche de bebé · persona en silla de ruedas · vendedor de tintos con termo · agente de tránsito con chaleco #c7e000 · perro · gato · palomas · pareja caminando |
| C-15 | `c15_spr_vehiculos.png` | carro rojo · carro blanco · carro gris · carro azul · taxi amarillo · moto con conductor y casco · moto con parrillero y cascos · buseta urbana · alimentador del metro (blanco con franja azul #1C5C9C) · bus articulado verde azulado #0E6F76 · camión de balance EnCicla con bicis en la plataforma · camión de reparto · patrulla de tránsito · ambulancia · volqueta · chiva de colores (fiestas). Escala común: una bici mide un cuarto de un carro |
| C-16 | `c16_veh_perfil.png` | de **perfil**, para la panorámica: carro · taxi amarillo · moto · buseta · alimentador · bus articulado · tren del metro de 2 vagones (azul #1C5C9C) · cabina de metrocable (verde lima #B8CF40) |

### C-20 a C-22 · Ciudad: texturas, vegetación y fachadas
| Encargo | Archivo | Contenido |
|---|---|---|
| C-20 | `c20_tex_<material>.png` (una imagen de 512×512 por material) | Texturas que **se repiten sin costuras** por los cuatro lados: `asfalto` · `asfalto_linea` (línea blanca discontinua) · `cebra` · `ciclorruta` (verde #4a9a2c, bordes #9bd341) · `anden_baldosa` · `anden_ladrillo` · `adoquin` · `pasto` · `pasto_flores` · `tierra` · `rio` (agua del río canalizado) · `quebrada` · `viaducto` (vista superior con rieles) · `techo_losa` · `techo_teja` · `techo_zinc` · `arena` · `cancha` · `madera` · `piso_estacion` |
| C-21 | `c21_spr_vegetacion.png` | vista cenital con sombra suave hacia abajo a la derecha, dentro de la celda: guayacán amarillo florecido · guayacán rosado florecido · ceiba · mango · palma · yarumo · bambú · arbusto · jardín de flores · matera · árbol pequeño de andén · seto · flores de Moravia · árbol de navidad iluminado · árbol con alumbrados · tronco cortado |
| C-22 | `c22_fac_<tipo>.png` (512×512 cada una) | Fachadas para los edificios 3D y la panorámica, repetibles en horizontal y vertical: `ladrillo_ventanas` · `apartamentos_blancos` · `torre_vidrio` · `casa_colores_balcon` · `local_persiana` (sin letreros) · `fabrica_ladrillo` · `iglesia_ladrillo` · `casa_ladera` (ladrillo, zinc y rejas) · `institucional_gris` · `muro_grafiti` (figuras, sin letras) · `muro_enredadera` · `garaje` |

### C-30 a C-38 · Objetos de minijuegos (una hoja de 4×4 por oficio)
| Encargo | Archivo | Objetos |
|---|---|---|
| C-30 | `c30_obj_mecanico.png` | llanta pinchada · parche · bomba de aire · llave inglesa · destornillador · cadena · aceitera · pastilla de freno · sillín · pedal · rin con radios · neumático (cámara de aire) · guaya de freno · manubrio · luz delantera · luz trasera |
| C-31 | `c31_obj_bodega.png` | 6 cajas de repuestos con pictograma y color propio (llantas azul, cadenas verde, frenos ámbar, sillines coral, luces cielo, herramientas gris) · estantería vacía · estantería llena · carretilla · estiba · cinta de embalar · tabla de inventario · caja abierta · caja dañada · marco de bici nuevo · rueda nueva |
| C-32 | `c32_obj_tecnico.png` | tótem cerrado · tótem abierto por dentro · anclaje con LED verde · rojo · ámbar · apagado · celular de estación sano · con la pantalla rota · power bank lleno · vacío · cable USB · tarjeta electrónica · fusible · tablero eléctrico · multímetro · cinta aislante |
| C-33 | `c33_obj_anfitrion.png` | tula (maletín azul oscuro) · llavero de la estación · celular de préstamo · tarjeta de transporte azul sin logo ni texto · carné · sello · planilla · radio · linterna · sombrilla · botiquín · vaso de tinto · reloj de pared · candado · cono · campana de mostrador |
| C-34 | `c34_obj_limpieza.png` | escoba · trapero · paño · bolsa de basura · balde con agua · rociador · guantes · recogedor · mancha de barro · polvo · telaraña · chicle · hojas secas · vaso desechable · papel arrugado · destello de limpio |
| C-35 | `c35_obj_pausas.png` | parlante portátil · flecha de baile arriba · abajo · izquierda · derecha (verde claro) · botella de agua · toalla · estrella de “perfecto” · nota musical · colchoneta · banda elástica · reloj · corazón · confeti · brillo · tenis |
| C-36 | `c36_obj_rescate_balance.png` | bici abandonada en el pasto · amarrada a un poste · con hojas encima · en un charco · volteada · eslinga · rampa del camión · plataforma con 6 bicis · plataforma vacía · anclaje rápido · conos · cinta de seguridad · chaleco · guantes · linterna · mapa doblado |
| C-37 | `c37_obj_monitoreo.png` | marcador de estación vacía (rojo) · normal (verde) · llena (azul) · cerrada (gris) · eléctrica (con rayo) · con anfitrión · automática · pantalla pequeña · alerta · flecha de ruta · camioncito · reloj · gráfico de barras sin números · audífonos · taza de tinto · teclado |
| C-38 | `c38_obj_ciudad.png` | tinto en taza · termo · arepa · mango biche en vaso · empanada · salpicón · botella de agua · cámara de fotos · casco · guantes · hoja verde (coleccionable) · postal · candado de la bici propia · mapa · gafas de sol · paraguas |

### C-40 y C-41 · Interfaz y mapa
| Encargo | Archivo | Contenido |
|---|---|---|
| C-40 | `c40_ui_botones.png` · `c40_ui_marcos.png` | botón principal verde (normal, presionado, apagado) · botón secundario azul · botón redondo · marco de diálogo con espacio para retrato (esquinas y bordes por separado, para estirarlo) · globo de diálogo · pastilla de información · barra de progreso vacía y llena · interruptor · casilla con ✓ · estrella vacía y llena · corazón · reloj de préstamo · dedo de toque · flecha de navegación |
| C-41 | `c41_ui_mapa.png` | pin de destino tipo GPS verde · flecha del jugador · marcadores de estación por tipo (con anfitrión, automática, eléctrica, mixta) y por estado (vacía, normal, llena, cerrada) · marcador de lugar con postal · marcador de misión · marcador de amigo · marco redondo del minimapa · rosa de los vientos sin letras |

### C-50 · Decoraciones de fiestas (cenitales)
- `c50_dec_fiestas_1.png` y `_2.png`: silleta de flores · macetas de flores · guirnalda de luces · árbol con alumbrados · farol de papel · velita encendida · banderín de Colombia (amarillo, azul y rojo) · banderín de Antioquia (blanco y verde) · calabaza · telaraña de adorno · globos · corazones · libros apilados · carpa de feria · fuegos artificiales · cono de ciclovía · confeti · estrella de navidad · pesebre pequeño · ramo de palma · ramo de flores · caja de regalo · serpentinas · bandera de cuadros de llegada.

### C-60 · Marcadores de lugares para el mapa
- `c60_ico_lugares_1.png` y `_2.png`: un marcador redondo por tipo de lugar, en este orden: iglesia · terminal · cerro con antena · campus · jardín de Moravia · orquideorama · cubos rojos (Explora) · estadio · escultura redonda · rascacielos de aguja · teatro escalonado · parque con árboles · pie descalzo · postes de luz · Casa EnCicla · pueblito en el cerro · fábrica de acero oxidado · avión · escalera eléctrica · rocas oscuras (biblioteca) · palacio a cuadros · catedral de ladrillo · rueda de Chicago · coliseo · casa de la memoria · tres cruces · chimeneas · hospital · casa blanca con jardín · lago con árboles · nacimiento del río · aeropuerto.

### C-70 y C-71 · Huevos de pascua del Metro
| Encargo | Archivo | Contenido |
|---|---|---|
| C-70 | `c70_obj_metro.png` | termo de tinto de Rosalba · taza de tinto humeante · pañoleta · gorra azul de Wílmar · arepa en la parrilla · radio con audífonos · tren del metro cenital, 2 vagones azul #1C5C9C · cabina de metrocable cenital #B8CF40 · tranvía cenital #59AB42 · alimentador cenital · medalla “La última vuelta” (taza de tinto) · “Antes del primer tren” (luna y tren) · “Ni una gota” (taza en equilibrio) · “Punta a punta” (dos pines) · “Ciudad colgante” (cabina de cable) · “Turno de noche” (luna y bici) |
| C-71 | `c71_spr_metro.png` | 4 cuadros por fila: Rosalba caminando con su termo · la nieta en bici EnCicla con casco · Wílmar caminando · Doña Marleny volteando arepas |

### C-99 · Consolidación final
Cuando todas las IA terminen, ChatGPT junta todas las entregas y arma las **tres versiones finales** (12.5).

---

# 8 · Encargos del Guionista (H)

**Reglas de escritura**
- Español de Colombia con sabor paisa, cálido y con humor. Frases cortas. Una idea por frase.
- Respeta los límites de caracteres (incluyen espacios). Los textos se leen en un celular, sobre el juego.
- Usa solo los datos de la parte 9. Lo que no esté, márcalo *por confirmar*; no lo inventes.
- Cada encargo se entrega legible (`.md`) y en JSON válido (`.json`), en UTF-8.

| Encargo | Archivo | Qué escribir |
|---|---|---|
| **H-00** | `h00_prueba.md` | Prueba: una frase (máx. 120) de Doña Luz, Santi y Don Rubén ante un usuario que devuelve la bici diez minutos tarde |
| **H-01** | `h01_biblia.md` | Biblia narrativa (1 página): tono, temas (cuidado, puntualidad, convivencia vial, orgullo del oficio, la ciudad), glosario paisa permitido (mijo, mija, parce, ¿sí o qué?, bacano, de una, pues, ome, ¡Ave María!, listo pues, a la orden, camellar, tinto) y palabras prohibidas (groserías, insultos, burlas a barrios) |
| **H-02** | `h02_voces.json` | Ficha de voz de los 12 personajes: saludo, muletilla, cómo celebra, cómo regaña, cómo consuela y una frase típica (máx. 80 cada una) |
| **H-10** | `h10_dia_del_valle.json` | Historia principal **“Un día del valle”**: 16 capítulos (los de G-100 a G-115, mismo orden y horas) con este formato ↓ |
| **H-20** | `h20_oficios.json` | Un texto por cada uno de los **22 turnos** (9.5), con el formato del juego `{ "t", "a", "d" }`: título (máx. 28), antes del turno (máx. 220) y después de aprobarlo (máx. 160). Mejora los textos actuales (Anexo A) sin cambiar sus datos. Además, propón **2 turnos nuevos por oficio** (nombre, horario y texto), marcados como *propuesta* |
| **H-30** | `h30_ciudad.json` | 96 frases de la ciudad viva (máx. 60): 12 por contexto: mañana, hora pico, mediodía, lluvia, noche, ciclovía del domingo, fiesta y cerca de una estación. Hablan peatones, usuarios, vendedores y conductores amables |
| **H-40** | `h40_logros.json` | 12 logros nuevos para el contenido nuevo: nombre (máx. 24) y descripción (máx. 60); revisa también los nombres actuales (9.8) |
| **H-50** | `h50_tutor.json` | Compañero del tutorial: 3 consejos por oficio y 3 del modo libre (máx. 80) |
| **H-60** | `h60_fiestas.json` | Por cada fiesta de 9.6: título, frase de un personaje (máx. 140) y misión sugerida (máx. 90) |
| **H-70** | `h70_metro.json` | Cameos del Metro (parte 10): diálogos (máx. 160) de Rosalba, la nieta, Don Efraín, Doña Marleny y Wílmar para cada idea de 10.10, usando las frases guardadas donde encajen; y la minihistoria **“La nieta aprende a pedalear”** en 5 escenas con el formato de H-10 |
| **H-80** | `h80_guion_visual.json` | Para cada capítulo de H-10, la descripción de su escena para Gemini (máx. 400): encuadre, personajes, acción, hora, luz y detalles del lugar |

**Formato de H-10** (y de la minihistoria de H-70):
```json
{
  "id": "dia-01",
  "hora": "4:00 a. m.",
  "lugar": "Casa EnCicla",
  "oficio": "supervisor",
  "titulo": "Las tulas de las cuatro",
  "escena": "Qué pasa, para el guion visual (máx. 300)",
  "antes": "Lo que dice el personaje antes de jugar (máx. 220)",
  "despues": "Al aprobar (máx. 160)",
  "fallo": "Si no aprueba (máx. 120)",
  "npc": ["Frase de la ciudad (máx. 60)", "…", "…"],
  "consejo": "Seguridad vial o cultura ciudadana (máx. 90)"
}
```
Los valores de `oficio` son: `usuario`, `anfitrion`, `mecanico`, `bodega`, `apoyo`, `pausas`, `limpieza`, `tecnico`, `rescate`, `balance`, `monitoreo` y `supervisor`.

---

# 9 · EnCicla y el valle: datos para crear

## 9.1 Horarios (como están en el juego)
| Día | Préstamo | Devolución | Personal |
|---|---|---|---|
| Lunes a viernes | 5:30 a. m. – 8:59 p. m. | hasta las 10:00 p. m. | el supervisor arma las tulas a las 4 a. m.; el anfitrión recibe la tula a las 5 a. m. |
| Sábado | 6:30 a. m. – 6:59 p. m. | hasta las 8:00 p. m. | anfitriones en dos turnos: 6:00 a. m. – 1:30 p. m. y 1:00 p. m. – 8:30 p. m.; supervisores desde 1 hora antes hasta 30 minutos después |
| Domingos y festivos | 8:00 a. m. – 4:00 p. m. | hasta las 4:00 p. m. | **solo estaciones automáticas**; los anfitriones descansan |
| Bicis eléctricas | hasta las 7:00 p. m. | — | las estaciones solo eléctricas cierran a las 8:00 p. m. |

## 9.2 Préstamo en el modo libre
- Con bici de EnCicla: **una hora** por préstamo; se **renueva** en cualquier estación. El reloj del juego corre más despacio.
- Renovar o devolver tarde gasta un **strike**: la cuenta empieza con **10**. Sin strikes, cada retraso trae una **suspensión** de 3, 7, 15, 30 y 60 días.
- Si cierra el sistema y no devolviste la bici, también cuenta como retraso.
- **Bici abandonada:** si la dejas sola, un anfitrión, un funcionario o un usuario puede reportarla. El **reporte negativo** queda para siempre.
- Con **bici propia** el modo libre dura las 24 horas.

## 9.3 Estaciones y corredores eléctricos
- **133 estaciones** en el juego: con anfitrión (manuales), automáticas, eléctricas y mixtas.
- Corredores de bici eléctrica (salen de una estación mixta y llegan a una solo eléctrica):

| Corredor | Desde (mixta) | Hasta (solo eléctricas) |
|---|---|---|
| 1 | Floresta | C4TA |
| 2 | UdeA | Hospital Infantil |
| 3 | San Cayetano (Sabaneta) | La Estrella |
| 4 | Pascual Bravo | Hospital Pablo Tobón Uribe |

## 9.4 El valle
Diez territorios, de norte a sur: **Barbosa, Girardota, Copacabana, Bello, Medellín, Itagüí, Envigado, Sabaneta, La Estrella y Caldas**. El río Medellín nace en el Alto de San Miguel (Caldas) y atraviesa el valle de sur a norte.

## 9.5 Oficios
| Oficio | Personaje | Qué hace en el juego | Turnos en el juego (entre semana) |
|---|---|---|---|
| Usuario | Doña Luz | presta, viaja y devuelve antes de la hora; en el modo libre recorre el valle | Primer préstamo · Dos viajes · Día de ciclista |
| Anfitrión | Santi | recibe la tula, abre la estación, presta y recibe bicis, ajusta sillines y cierra | Turno 1 · Apertura (5:00 a. m. – 1:30 p. m.) · Turno 3 · Cierre (1:30 p. m. – 10:30 p. m.) |
| Mecánico | Don Jairo | repara bicis contra el reloj en el taller | Equipo de reparación · Equipo de ensamble (8:00 a. m. – 5:00 p. m.) |
| Bodega | Yuli | clasifica repuestos y despacha pedidos completos | Turno intermedio (8:00 a. m. – 5:00 p. m.) |
| Apoyo | Kevin | recorre su zona: abre estaciones, cubre relevos y hace inventarios | Turno 1 · Apertura y relevos (5:00 a. m. – 1:30 p. m.) · Turno 3 · Relevos y cierre (1:30 p. m. – 10:30 p. m.) |
| Pausas activas | Maryi | visita estaciones a mitad de turno y pone a todos a moverse con un juego de ritmo | Turno intermedio (9:00 a. m. – 6:00 p. m.) |
| Limpieza | Doña Marta | una vez al mes, dos supervisores y el anfitrión limpian el habitáculo | Brigada mensual (9:00 a. m. – 5:00 p. m.) |
| Técnico | Ing. Paola | arregla tótems, luces de los anclajes, celulares y power banks | Turno intermedio (8:00 a. m. – 5:00 p. m.) |
| Rescate | Jhon | encuentra bicis abandonadas y las devuelve llevándolas a mano | Turno de rescate (8:00 a. m. – 5:00 p. m.) |
| Balance | Wilson | mueve bicis en camión de las estaciones llenas a las vacías, por las vías | Turno de apertura (4:00 a. m. – 1:00 p. m.) · Camión especial de 40 bicis (9:00 a. m. – 6:00 p. m.) · Turno de cierre (2:00 p. m. – 11:00 p. m.) |
| Monitoreo | Cata | vigila el mapa desde la sala de control (rojo vacía, azul llena) y despacha | Sala de control (inventario cada hora) · Atención al cliente (llamadas e inscripciones) |
| Supervisor | Don Rubén | arma y entrega las tulas, abre y cierra el sistema y coordina | Turno de apertura (4:00 a. m. – 12:00 m.) · Turno intermedio (9:00 a. m. – 6:00 p. m.) · Turno de cierre (2:00 p. m. – 11:00 p. m.) |

Los sábados, anfitriones y apoyo trabajan de 6:00 a. m. a 1:30 p. m. y de 1:00 p. m. a 8:30 p. m.; los supervisores, de 5:00 a. m. a 1:00 p. m., de 9:00 a. m. a 6:00 p. m. y de 1:00 p. m. a 9:00 p. m. En total hay **22 turnos**, uno por cada texto de historia del Anexo A.

## 9.6 Fiestas del calendario
| Fiesta | Fecha en el juego |
|---|---|
| Año Nuevo | 1 de enero |
| Semana Santa | del Domingo de Ramos al Domingo de Pascua |
| Día del Niño | último sábado de abril |
| Día de la Madre | segundo domingo de mayo |
| Día del Padre | tercer domingo de junio |
| Independencia de Colombia | 19 y 20 de julio |
| Feria de las Flores | 10 días desde el primer viernes de agosto |
| Independencia de Antioquia | 11 de agosto |
| Fiesta del Libro y la Cultura | 10 días desde el segundo viernes de septiembre |
| Amor y Amistad | tercer sábado de septiembre |
| Halloween | 24 al 31 de octubre |
| Noche de las Velitas | 7 y 8 de diciembre |
| Navidad y Alumbrados | 1 de diciembre al 7 de enero |

## 9.7 Lugares
Los 45 lugares con postal están en la tabla de G-30 a G-74. Hay además una **postal secreta** que no aparece en el álbum hasta encontrarla pedaleando.

## 9.8 Logros actuales
Primer pedalazo · ¡Aprobado! · Turno perfecto · En racha · Turista paisa · Conocedor del valle · Álbum completo · Explorador secreto · Ciclorrutero · Pulmón verde · 10 km pedaleados · Buena convivencia · Todero EnCicla · Supervisor de corazón · Más rápido que el bot · Pedalear en compañía · Retador · Maquinista secreto · Jardinero de Moravia · Bici dorada · De Caldas a Copacabana.

## 9.9 Historia de EnCicla (lo que sabemos)
> Datos de prensa y fuentes públicas. **Por confirmar** con la información oficial que entregará el autor.

- **2011 · El piloto.** La idea nació entre estudiantes de EAFIT. El piloto conectó estaciones del metro con universidades por los corredores de las carreras 65 y 70; sus primeros usuarios fueron estudiantes de la Universidad Nacional y de la UPB, y visitantes del Parque Arví. Un registro fecha el inicio el **10 de octubre de 2011**, con seis estaciones manuales; las fuentes hablan de entre 105 y 145 bicis.
- **Quiénes lo hacen posible.** El Área Metropolitana del Valle de Aburrá lo impulsa y lo opera; EAFIT apoyó el piloto.
- **Crecimiento.** Pasó de Medellín a los diez territorios del valle.
- **Bicis eléctricas.** Llegaron con un piloto posterior (fecha por confirmar) y hoy tienen corredores propios (9.3).
- **Cifras.** Cambian según la fecha y la fuente: una fuente anterior habla de 101 estaciones, 2.000 bicis y 112.363 usuarios activos; una publicación reciente, de 156 estaciones y más de 150.000 usuarios registrados.
- **2026 · 15 años.** El aniversario es el telón de fondo de “Un día del valle”.

Fuentes: [EnCicla en Wikipedia](https://en.wikipedia.org/wiki/EnCicla) · [Portafolio: de piloto a referente, 15 años](https://www.portafolio.co/contenido-patrocinado/de-piloto-a-referente-encicla-cumple-15-anos-en-el-valle-de-aburra-505236) · [Alcaldía de Medellín: diez años de EnCicla](https://www.medellin.gov.co/es/sala-de-prensa/noticias/con-los-recorridos-turisticos-encicla-en-el-centro-de-medellin-es-un-parche-se-celebran-diez-anos-del-sistema-de-bicicletas/) · [Telemedellín](https://telemedellin.tv/?p=200223) · [El Colombiano: universitarios estrenarán bicis públicas](https://www.elcolombiano.com/historico/universitarios_estrenaran_145_bicis_publicas-IYEC_153029)

## 9.10 Datos que llegarán
Estaciones con su dificultad por turno, organigrama, horarios por zona, festividades propias de EnCicla y cantidades (bicis, estaciones, personal). Hasta entonces, el juego usa los datos de esta parte.

---

# 10 · Huevos de pascua del Metro (fragmentos guardados)

## 10.1 El juego hermano
*El Metro* es el videojuego del Metro de Medellín del mismo autor. Usa el mismo mapa real del valle. Su historia se llama **“La última vuelta”**.
- Web: https://juanfeliperico369-stack.github.io/MetroZero/
- Repositorio: `juanfeliperico369-stack/MetroZero`

## 10.2 Personajes
| Personaje | Quién es | Colores |
|---|---|---|
| **Rosalba** (~60) | conductora del primer tren, en 1995 | uniforme azul `#12446c` con franja `#1C5C9C`, pañoleta, termo de tinto, canas `#dcd8d0` |
| **La nieta** (16) | nieta de Rosalba | chaqueta azul, morral, tenis blancos |
| **Don Efraín** (~65) | Puesto de Control | chaqueta gris `#5a6470`, audífonos de radio |
| **Doña Marleny** (~55) | vende arepas en Santo Domingo | ruana roja `#c8201f` |
| **Wílmar** (~40) | conductor de alimentador | piel `#8a5a3b`, camisa blanca, gorra azul |
| Agente de tránsito | — | chaleco `#c7e000` |

## 10.3 “La última vuelta”: capítulos
Niquía, 4:30 a. m. · El Puesto de Control · Santo Domingo mira al cielo · Los que alimentan la red · Wílmar presta el timón · Belén – Aranjuez · El articulado · Ayacucho sobre llantas · La hora pico · La última vuelta · Epílogo.

## 10.4 Frases guardadas
- “Mija, despierte. El primer tren sale a las cuatro y media y la ciudad no espera a nadie.”
- “Nadie aplaude al conductor, pero todos llegan.”
- “Los trenes son como los nietos: hay que mandarlos para donde es.”
- “Usted tiene mano.”
- “El valle se ve como un pesebre encendido.”
- “Wílmar pitó dos veces al despedirse.”
- “Y ojo con las motos, mija. Esas se cuelan hasta por el ojo de una aguja.”
- “Sobrevivir a la hora pico es el diploma no oficial…”
- “…sin regar ni una gota.”
- “La red no es de hierro, mija. Es de la gente que la cuida. Cultura Metro, ¿sí o qué?”
- “Tranquila, mija. Nadie nace aprendido. Otra vez.”

## 10.5 Logros de *El Metro*
Frenada al centímetro · Punta a punta · Ciudad colgante · Ni una gota (tinto en equilibrio) · La última vuelta (taza de tinto) · Turno de noche · Antes del primer tren.

## 10.6 Colores de las líneas
| Línea | HEX | Línea | HEX |
|---|---|---|---|
| A | `#1C5C9C` | H | `#EB318E` |
| B | `#E38835` | L | `#8E612A` |
| T (tranvía) | `#59AB42` | M | `#743D90` |
| K | `#B8CF40` | P | `#EC343A` |
| J | `#F6C538` | Metroplús 1 · 2 | `#0E6F76` · `#65A9AC` |

## 10.7 Cultura Metro → Cultura EnCicla
| Cultura Metro | Versión EnCicla |
|---|---|
| Respeta la línea amarilla | Respeta la ciclorruta y la cebra |
| Deja salir antes de entrar | Cede el paso al peatón |
| Cede la silla | Ayuda al que está aprendiendo |
| Mantén limpio | Devuelve la bici limpia y a tiempo |

## 10.8 Fechas
| Fecha | Hito |
|---|---|
| 30 de noviembre de 1995 | inauguración del Metro |
| 28 de febrero de 1996 | Línea B |
| 7 de agosto de 2004 | Metrocable K |
| 3 de marzo de 2008 | Línea J |
| Febrero de 2010 | Línea L (Arví) |
| 22 de diciembre de 2011 | Metroplús |
| 2015–2016 | Tranvía de Ayacucho |
| 2016 | Línea H |
| Febrero de 2019 | Línea M |
| 10 de junio de 2021 | Línea P |
| 30 de noviembre de 2025 | 30 años del Metro |
| Futuro | Metro de la 80 |

## 10.9 Lo que ya existe en *Juega EnCicla*
**Maquinista secreto:** tres timbrazos seguidos debajo de una estación del metro abren el minijuego “¡Maquinista del Metro!” y el logro *Maquinista secreto*.

## 10.10 Ideas de huevos de pascua
| # | Idea | Dónde y cómo se activa | Piezas |
|---|---|---|---|
| 1 | **Antes del primer tren** | modo libre, de 4:00 a 4:29 a. m., cerca de la estación Niquía: Rosalba con su termo dice la frase del primer tren. Logro *Antes del primer tren* | G-90, G-95, C-71, H-70 |
| 2 | **Rosalba en la cabina** | en el Maquinista secreto, Rosalba acompaña: “Usted tiene mano” al ganar y “Tranquila, mija. Nadie nace aprendido. Otra vez.” al perder | G-90, H-70 |
| 3 | **Ni una gota** | modo libre: llevar un tinto en la canasta de una estación a otra sin chocar ni frenar en seco. Logro *Ni una gota* | C-10, C-70 |
| 4 | **Wílmar pita dos veces** | a veces un alimentador pasa y pita dos veces; si le respondes con el timbre, logro *Saludo de alimentador* | G-94, C-15, C-03 |
| 5 | **Las arepas de Doña Marleny** | en las mañanas, cerca de Santo Domingo: comprar una arepa recupera energía | G-93, C-70 |
| 6 | **La red no es de hierro** | en Monitoreo, Don Efraín habla a veces por la radio (“Puesto de Control, ¿me copia?”); al terminar un turno perfecto aparece su frase | G-92, H-70 |
| 7 | **Cumpleaños del Metro** | cada 30 de noviembre, banderines en el viaducto y un aviso: “El Metro cumple N años” | C-50 |
| 8 | **Frenada al centímetro** | devolver la bici exacta en el centro del anclaje y a buena velocidad | C-03 |
| 9 | **Punta a punta** | recorrer el valle de Niquía a La Estrella en una sola salida del modo libre | C-70 |
| 10 | **Ciudad colgante** | visitar las tres zonas de cables (Santo Domingo, San Javier y Arví) | C-70 |
| 11 | **Turno de noche** | pedalear con bici propia y luces entre las 11 p. m. y las 4 a. m. | C-70 |
| 12 | **La última vuelta** | al terminar toda la historia: “Nadie aplaude al anfitrión, pero todos llegan.” y la medalla de la taza de tinto | G-96, C-70 |
| 13 | **La nieta aprende a pedalear** | compañera opcional del tutorial del usuario y minihistoria de 5 escenas | G-91, C-71, H-70 |
| 14 | **Metro de la 80** | vallas de obra por la carrera 80 y un trabajador que dice: “Algún día pasará por aquí” | C-14, H-70 |
| 15 | **Código MetroZero** | escribir *MetroZero* como nombre en el creador desbloquea la pañoleta de Rosalba y el termo de tinto | C-70 |
| 16 | **Juega El Metro** | en los créditos: “¿Te gustan los trenes? Juega El Metro”, con el enlace | — |

## 10.11 Fragmento de código listo para integrar
```js
/* Huevos de pascua de El Metro, el juego hermano. */
const METRO_EGG = {
  web: 'https://juanfeliperico369-stack.github.io/MetroZero/',
  lineas: { A: '#1C5C9C', B: '#E38835', T: '#59AB42', K: '#B8CF40', J: '#F6C538', H: '#EB318E', L: '#8E612A', M: '#743D90', P: '#EC343A', MP1: '#0E6F76', MP2: '#65A9AC' },
  gente: {
    rosalba: { n: 'Rosalba', d: 'conductora del primer tren de 1995', uniforme: '#12446c', franja: '#1C5C9C', pelo: '#dcd8d0' },
    nieta: { n: 'La nieta', d: '16 años, chaqueta azul, morral y tenis blancos' },
    efrain: { n: 'Don Efraín', d: 'Puesto de Control', chaqueta: '#5a6470' },
    marleny: { n: 'Doña Marleny', d: 'arepas en Santo Domingo', ruana: '#c8201f' },
    wilmar: { n: 'Wílmar', d: 'conductor de alimentador', piel: '#8a5a3b' },
    transito: { n: 'Agente de tránsito', chaleco: '#c7e000' }
  },
  frases: {
    primerTren: 'Mija, despierte. El primer tren sale a las cuatro y media y la ciudad no espera a nadie.',
    aplauso: 'Nadie aplaude al conductor, pero todos llegan.',
    aplausoEnCicla: 'Nadie aplaude al anfitrión, pero todos llegan.',
    nietos: 'Los trenes son como los nietos: hay que mandarlos para donde es.',
    mano: 'Usted tiene mano.',
    pesebre: 'El valle se ve como un pesebre encendido.',
    motos: 'Y ojo con las motos, mija. Esas se cuelan hasta por el ojo de una aguja.',
    red: 'La red no es de hierro, mija. Es de la gente que la cuida. Cultura Metro, ¿sí o qué?',
    otraVez: 'Tranquila, mija. Nadie nace aprendido. Otra vez.',
    control: 'Puesto de Control, ¿me copia?',
    la80: 'Algún día pasará por aquí.'
  },
  capitulos: ['Niquía, 4:30 a. m.', 'El Puesto de Control', 'Santo Domingo mira al cielo', 'Los que alimentan la red', 'Wílmar presta el timón', 'Belén – Aranjuez', 'El articulado', 'Ayacucho sobre llantas', 'La hora pico', 'La última vuelta', 'Epílogo'],
  logros: ['Antes del primer tren', 'Ni una gota', 'Saludo de alimentador', 'Frenada al centímetro', 'Punta a punta', 'Ciudad colgante', 'Turno de noche', 'La última vuelta'],
  fechas: [['1995-11-30', 'Inauguración del Metro'], ['1996-02-28', 'Línea B'], ['2004-08-07', 'Metrocable K'], ['2008-03-03', 'Línea J'], ['2011-12-22', 'Metroplús'], ['2021-06-10', 'Línea P']],
  cumple: d => d.getMonth() === 10 && d.getDate() === 30 ? d.getFullYear() - 1995 : 0,   // años del Metro el 30 de noviembre
  codigo: 'metrozero'                                                                     // nombre secreto en el creador
};
```

---

# 11 · Correcciones frecuentes

| Problema | Pide así |
|---|---|
| Salió texto, letras o un logo | “Repite exactamente igual, pero sin ningún texto, letra, número, letrero ni logo.” |
| Fondo blanco, ajedrezado o con degradado | “Fondo magenta plano #FF00FF, uniforme, sin sombras ni degradados.” |
| Magenta dentro del dibujo | “Cambia los tonos rosados y morados del dibujo: el magenta solo va en el fondo.” |
| Perspectiva equivocada en un sprite | “Vista cenital exacta a 90°, como un mapa visto desde arriba; el personaje mira hacia arriba.” |
| No respeta la cuadrícula | “Cuadrícula exacta de 4×4 celdas iguales; cada elemento centrado en su celda, sin tocar los bordes.” O entrega las celdas sueltas |
| El personaje no es igual a su hoja | “Usa la hoja adjunta: misma cara, peinado, ropa y colores.” |
| Demasiado detalle | “Simplifica: formas grandes, máximo 16 colores, que se entienda a 48 píxeles.” |
| Colores de EnCicla equivocados | “Uniforme y bici solo en azul oscuro #0e2d55, verde claro #9bd341 y blanco.” |
| Bici mal dibujada | “Bici urbana con ruedas redondas iguales, cadena y plato a la derecha, canasta adelante, sillín y manubrio alineados.” |
| Manos o caras raras | “Manos simples y cara sencilla, con ojos pequeños y claros.” |
| No parece Medellín | “Agrega ladrillo a la vista, laderas con casas de ladrillo, montañas verdes alrededor, guayacanes y el viaducto del metro.” |
| Luz incoherente | “Luz desde arriba a la izquierda; sombras hacia abajo a la derecha.” |
| Parece foto o 3D | “Pixel art plano, sin brillos plásticos, sin desenfoque ni texturas de foto.” |
| La panorámica no empata | “El borde izquierdo debe continuar exactamente el borde derecho: la imagen se repite en bucle.” |
| Texto largo (Guionista) | “Recorta al límite de caracteres; una idea por frase.” |
| Dato inventado (Guionista) | “Usa solo los datos de la parte 9; lo demás, márcalo por confirmar.” |

---

# 12 · Entregas: el documento de cada IA y las tres versiones

## 12.1 Orden recomendado (de más a menos impacto)
1. Pruebas: **G-00**, **C-00** y **H-00**.
2. Personajes: **G-01 a G-12**, con **H-01** y **H-02**.
3. Sprites de personajes y bicis: **C-11**, **C-12**, **C-10**.
4. Ciudad: **C-20**, **C-21** y **C-22**.
5. Peatones y vehículos: **C-14**, **C-15**.
6. Estaciones e interiores: **G-20 a G-28**.
7. Íconos, logros, interfaz y mapa: **C-01 a C-03**, **C-40**, **C-41** y **C-60**.
8. Objetos de minijuegos: **C-30 a C-38**, y **C-13**.
9. Panorámicas: **G-80 a G-83** (centro primero) y **C-16**.
10. Historia: **H-10**, **H-20** y **H-80**; después las escenas **G-100 a G-115**.
11. Postales: **G-30 a G-74**, primero las 15 con ★.
12. Fiestas: **G-84 a G-89**, **C-50** y **H-60**.
13. Huevos de pascua: **G-90 a G-96**, **C-70**, **C-71** y **H-70**; además **H-30**, **H-40** y **H-50**.
14. Arte clave: **G-120 a G-124**.
15. Consolidación final: **C-99**.

## 12.2 Carpetas y nombres
```
entrega/                 una carpeta por IA (gemini, chatgpt, guionista)
  entrega.md             documento de entrega (obligatorio)
  00_pruebas/            g00_ancla_estilo.png · c00_ico_prueba.png · h00_prueba.md
  personajes/            g01_per_dona_luz_hoja.png · g01_ret_dona_luz_alegre.png …
  estaciones/            g20_est_anfitrion.png … g28_camion_balance.png
  postales/              g30_pos_bello.png … g74_pos_trescruces.png
  panoramicas/           g80_pan_centro_dia_1.png … (1 lejana, 2 laderas, 3 ciudad, 4 frente)
  fiestas/               g84_fie_flores.png …
  metro/                 g90… g96 · c70_obj_metro.png · c71_spr_metro.png
  escenas/               g100_esc_dia01.png … g115_esc_dia16.png
  clave/                 g120_clave_portada_vertical.png …
  iconos/                c01_ico_oficios.png · c02 · c03 · c60
  sprites/               c10_spr_bicis.png · c11_spr_ciclistas_1.png … c16_veh_perfil.png
  ciudad/                c20_tex_asfalto.png … c21 · c22_fac_…
  objetos/               c30_obj_mecanico.png … c38_obj_ciudad.png
  interfaz/              c40_ui_botones.png · c41_ui_mapa.png · c50_dec_fiestas_1.png
  textos/                h01_biblia.md · h10_dia_del_valle.json …
```
- **Nombre:** `<encargo>_<tipo>_<nombre>[_<variante>].<ext>`. El encargo va primero (`g01`, `c10`, `h20`). Todo en minúsculas, sin tildes ni espacios, con guion bajo.
- **PNG** para todo; JPG de buena calidad solo en escenas, postales, fiestas y arte clave.
- Cada imagen lleva al lado un **`.txt` con el mismo nombre** y el **prompt final**.
- Los textos del Guionista van en `.md` y en `.json`, en UTF-8.
- Gemini en la app no crea carpetas: después de cada imagen dice su nombre de archivo y el autor la guarda con ese nombre.

## 12.3 Al terminar: el documento de entrega (obligatorio)
Cuando termines tu trabajo (o una tanda grande), escribe **`entrega.md`** con **todo** lo que hiciste. **Sin este documento, la entrega no está completa.**

```markdown
# Entrega de <IA> · Juega EnCicla · <aaaa-mm-dd>

## Resumen
Qué hiciste, cuántas piezas, qué quedó pendiente.

## Encargos
| Encargo | Archivos | Estado | Notas |
|---|---|---|---|
| G-00 | 00_pruebas/g00_ancla_estilo.png | ✅ listo | aprobado por el autor |

## Detalle por encargo
### G-00 · Ancla de estilo
- Prompt final: …
- Correcciones que hicieron falta: …
- Para integrar: cuadrícula, número de cuadros, punto de apoyo (pies o ruedas), escala.

## Reglas aprendidas
1. …

## Pendientes y dudas
- …
```
Estados: ✅ listo · 🔁 para corregir · ⏳ pendiente · ❌ descartado.

## 12.4 Las tres versiones
El documento de entrega se da, al final, en **tres versiones**:

| # | Versión | Archivo | Contiene |
|---|---|---|---|
| 1 | **PDF maestro** | `encicla_maestro_<ia>_<fecha>.pdf` | todo el trabajo: portada, documento de entrega, cada imagen visible con su encargo, archivo y prompt, y todos los textos |
| 2 | **MD con el código de las imágenes** | `encicla_imagenes_<ia>_<fecha>.md` | cada imagen codificada en base64 entre marcas, con su manifiesto (encargo, ruta, tamaño, SHA-256 y prompt). Con él reconstruyo cada imagen idéntica y la ensamblo en el juego. Si pasa de 45 MB, se divide en partes |
| 3 | **ZIP** | `encicla_entrega_<ia>_<fecha>.zip` | las imágenes originales en sus carpetas, los `.txt` de prompts, los textos, el documento de entrega, el manifiesto y el **PDF maestro** |

- **Cómo se arman:** con el script de 12.6 (Python). ChatGPT lo corre directamente.
- **Si tu herramienta no puede crear archivos** (por ejemplo, Gemini en la app): entrega las imágenes descargables con sus nombres y el texto de `entrega.md` en el chat. El autor se los pasa a ChatGPT (C-99) o a Claude Code, que arman las tres versiones.

## 12.5 Consolidación final (C-99 · ChatGPT)
1. El autor sube a ChatGPT los ZIP de cada IA.
2. ChatGPT los descomprime en `consolidado/gemini/`, `consolidado/chatgpt/` y `consolidado/guionista/`; revisa los nombres y que cada imagen tenga su `.txt`.
3. Corre `python armar_entrega.py armar consolidado final`.
4. Entrega las **tres versiones finales**: `encicla_maestro_final_<fecha>.pdf`, `encicla_imagenes_final_<fecha>.md` y `encicla_entrega_final_<fecha>.zip`, con un resumen en el chat: piezas por IA y lo que falta.

## 12.6 Script `armar_entrega.py`
Cópialo en un archivo `armar_entrega.py` y córrelo con Python 3 (necesita Pillow; con reportlab el PDF queda mejor).
```
python armar_entrega.py armar entrega gemini
python armar_entrega.py desarmar encicla_imagenes_gemini_2026-11-20.md reconstruidas
```
```python
#!/usr/bin/env python3
"""Juega EnCicla · arma y desarma las entregas de arte e historia de las IA.

ARMAR (cada IA al terminar, y la consolidación final C-99):
    python armar_entrega.py armar <carpeta> <ia> [carpeta_salida]
  Lee <carpeta>: imágenes (.png .jpg .webp) con su .txt de prompt al lado, textos (.md .txt .json)
  y el documento de entrega (entrega.md). Crea en carpeta_salida (por defecto listo_<ia>, junto a <carpeta>):
    1. encicla_maestro_<ia>_<fecha>.pdf   PDF maestro con todo el trabajo
    2. encicla_imagenes_<ia>_<fecha>.md    MD con el código (base64) de cada imagen y su manifiesto
    3. encicla_entrega_<ia>_<fecha>.zip    ZIP con las imágenes originales, los textos y el PDF maestro
DESARMAR (reconstruye las imágenes exactas desde el MD y verifica el SHA-256):
    python armar_entrega.py desarmar <archivo.md> [más partes .md] <carpeta_destino>
Requiere Python 3.8+ y Pillow. Con reportlab el PDF queda con mejor texto (si no está, usa Pillow).
"""
import base64, datetime, hashlib, io, json, os, re, sys, zipfile

IMG = ('.png', '.jpg', '.jpeg', '.webp')
TXT = ('.md', '.txt', '.json')
LIM = 45 * 1024 * 1024          # tamaño máximo de cada parte del MD
FUENTES = ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf',
           '/Library/Fonts/Arial Unicode.ttf', 'C:/Windows/Fonts/arial.ttf']
PAT = re.compile(r'<!-- img:inicio (\S+) sha256=([0-9a-f]{64}) -->\s*```base64\s*\n(.*?)```\s*<!-- img:fin -->', re.S)


def ident(nombre):
    """g01_per_santi_hoja.png -> G-01 · c10_... -> C-10 · h20_... -> H-20"""
    m = re.match(r'([gch])(\d{2,3})_', os.path.basename(nombre).lower())
    return '%s-%s' % (m.group(1).upper(), m.group(2)) if m else '-'


def fuente_ttf():
    for p in FUENTES:
        if os.path.isfile(p):
            return p
    try:
        import matplotlib
        p = os.path.join(matplotlib.get_data_path(), 'fonts', 'ttf', 'DejaVuSans.ttf')
        return p if os.path.isfile(p) else None
    except Exception:
        return None


def leer(ruta):
    with open(ruta, encoding='utf-8', errors='replace') as f:
        return f.read()


def recoger(carpeta, excluir):
    """Devuelve (imágenes, textos, documentos de entrega) como rutas relativas, en orden."""
    rutas = []
    for raiz, dirs, archivos in os.walk(carpeta):
        dirs[:] = sorted(d for d in dirs if not d.startswith('.') and os.path.abspath(os.path.join(raiz, d)) != excluir)
        rutas += [os.path.relpath(os.path.join(raiz, a), carpeta).replace(os.sep, '/') for a in sorted(archivos)]
    imgs = [r for r in rutas if r.lower().endswith(IMG)]
    tallos = {os.path.splitext(r)[0] for r in imgs}
    docs = [r for r in rutas if os.path.basename(r).lower() == 'entrega.md']
    textos = [r for r in rutas if r.lower().endswith(TXT) and r not in docs and os.path.splitext(r)[0] not in tallos]
    return imgs, textos, docs


def manifiesto(carpeta, imgs):
    from PIL import Image
    M = []
    for r in imgs:
        p = os.path.join(carpeta, r)
        with open(p, 'rb') as f:
            b = f.read()
        try:
            with Image.open(p) as im:
                w, h = im.size
        except Exception:
            w = h = 0
        sc = os.path.splitext(p)[0] + '.txt'
        M.append({'id': ident(r), 'ruta': r, 'ancho': w, 'alto': h, 'bytes': len(b),
                  'sha256': hashlib.sha256(b).hexdigest(), 'prompt': leer(sc).strip() if os.path.isfile(sc) else ''})
    return sorted(M, key=orden)


def orden(it):
    """G antes que C, luego por número de encargo y por ruta."""
    i = it['id']
    return ('GCH'.find(i[0]) % 9 if i != '-' else 9, int(i[2:]) if i != '-' else 0, it['ruta'])


def escribir_md(carpeta, salida, base, ia, fecha, M):
    cab = ('# Juega EnCicla · Código de las imágenes · %s · %s\n\n'
           '> Cada imagen va en base64 entre `<!-- img:inicio ruta sha256=... -->` y `<!-- img:fin -->`.\n'
           '> Para reconstruirlas: `python armar_entrega.py desarmar <este .md> <carpeta>` (verifica el SHA-256).\n\n') % (ia, fecha)
    bloques = []
    for it in M:
        with open(os.path.join(carpeta, it['ruta']), 'rb') as f:
            s = base64.b64encode(f.read()).decode('ascii')
        cuerpo = '\n'.join(s[i:i + 76] for i in range(0, len(s), 76))
        bloques.append('### %s · %s\n%d×%d px · %.1f KB · sha256 `%s`\n\n**Prompt:** %s\n\n<!-- img:inicio %s sha256=%s -->\n```base64\n%s\n```\n<!-- img:fin -->\n\n'
                       % (it['id'], it['ruta'], it['ancho'], it['alto'], it['bytes'] / 1024, it['sha256'],
                          ' '.join(it['prompt'].split()) or '(sin prompt)', it['ruta'], it['sha256'], cuerpo))
    partes, actual, tam = [], [], 0
    for b in bloques:
        if actual and tam + len(b) > LIM:
            partes.append(actual); actual, tam = [], 0
        actual.append(b); tam += len(b)
    partes.append(actual)
    sal = []
    for i, p in enumerate(partes, 1):
        nom = base + ('.md' if len(partes) == 1 else '_parte%d.md' % i)
        with open(os.path.join(salida, nom), 'w', encoding='utf-8') as f:
            f.write(cab + ('> Parte %d de %d.\n\n' % (i, len(partes)) if len(partes) > 1 else ''))
            if i == 1:
                f.write('## Manifiesto\n```json\n' + json.dumps(M, ensure_ascii=False, indent=1) + '\n```\n\n')
            f.write('## Imágenes\n\n' + ''.join(p))
        sal.append(nom)
    return sal


def plano(im):
    """Imagen lista para el PDF: el pixel art pequeño se amplía sin suavizar y se aplana sobre gris claro."""
    from PIL import Image
    im = im.convert('RGBA')
    k = max(1, 512 // max(im.size))
    if k > 1:
        im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    fondo = Image.new('RGB', im.size, (238, 238, 238))
    fondo.paste(im, (0, 0), im)
    return fondo


def lineas_doc(carpeta, docs, textos, M, ia, fecha):
    """Contenido del PDF como lista de (tipo, dato): ('h1'|'h2'|'p'|'small', texto) o ('img', item) o ('pag', None)."""
    L = [('h1', 'Juega EnCicla · Entrega de arte e historia'), ('p', 'IA: %s · Fecha: %s' % (ia, fecha)),
         ('p', '%d imágenes · %d textos · %d documentos de entrega' % (len(M), len(textos), len(docs))), ('h2', 'Contenido')]
    L += [('small', '%s · %s' % (it['id'], it['ruta'])) for it in M] + [('small', '%s · %s' % (ident(t), t)) for t in textos]
    for d in docs:
        L += [('pag', None), ('h1', 'Documento de entrega · ' + (os.path.dirname(d) or ia))]
        for l in leer(os.path.join(carpeta, d)).splitlines():
            L.append(('h2', l.lstrip('#').strip()) if l.startswith('#') else ('p', l.replace('**', '')))
    for it in M:
        L += [('pag', None), ('h2', '%s · %s' % (it['id'], it['ruta'])),
              ('small', '%d×%d px · %.1f KB · sha256 %s' % (it['ancho'], it['alto'], it['bytes'] / 1024, it['sha256'])),
              ('img', it), ('small', 'Prompt: ' + (' '.join(it['prompt'].split()) or '(sin prompt)'))]
    for t in textos:
        L += [('pag', None), ('h2', '%s · %s' % (ident(t), t))] + [('code', l) for l in leer(os.path.join(carpeta, t)).splitlines()]
    return L


def pdf_reportlab(ruta, carpeta, L, ttf):
    from PIL import Image
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.utils import ImageReader, simpleSplit
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfgen import canvas
    fn, fb = 'Helvetica', 'Helvetica-Bold'
    if ttf:
        try:
            from reportlab.pdfbase.ttfonts import TTFont
            pdfmetrics.registerFont(TTFont('F', ttf)); fn = fb = 'F'
            neg = ttf.replace('.ttf', '-Bold.ttf')
            if os.path.isfile(neg):
                pdfmetrics.registerFont(TTFont('FB', neg)); fb = 'FB'
        except Exception:
            fn, fb = 'Helvetica', 'Helvetica-Bold'
    W, H = A4; m = 40; c = canvas.Canvas(ruta, pagesize=A4); c.setTitle('Juega EnCicla · Entrega'); y = [H - m]
    limpio = (lambda s: s) if fn == 'F' else (lambda s: s.encode('cp1252', 'replace').decode('cp1252'))
    TAM = {'h1': (fb, 18, 1.6), 'h2': (fb, 12.5, 1.5), 'p': (fn, 10, 1.4), 'small': (fn, 8, 1.35), 'code': (fn, 9, 1.35)}

    def nueva():
        c.showPage(); y[0] = H - m

    for tipo, dato in L:
        if tipo == 'pag':
            if y[0] < H - m: nueva()
        elif tipo == 'img':
            with Image.open(os.path.join(carpeta, dato['ruta'])) as im:
                im = plano(im)
            bw, bh = W - 2 * m, y[0] - m - 90
            if bh < 120: nueva(); bh = y[0] - m - 90
            s = min(bw / im.width, bh / im.height)
            buf = io.BytesIO(); im.save(buf, 'JPEG', quality=88); buf.seek(0)
            c.drawImage(ImageReader(buf), m + (bw - im.width * s) / 2, y[0] - im.height * s, im.width * s, im.height * s)
            y[0] -= im.height * s + 12
        else:
            f, t, g = TAM[tipo]
            ind = pdfmetrics.stringWidth(' ', f, t) * (len(dato) - len(dato.lstrip(' '))) if tipo == 'code' else 0
            for l in simpleSplit(limpio(dato.strip() if ind else dato), f, t, W - 2 * m - ind) or ['']:
                if y[0] < m + t: nueva()
                c.setFont(f, t); c.drawString(m + ind, y[0] - t, l); y[0] -= t * g
    c.save()


def pdf_pillow(ruta, carpeta, L, ttf):
    from PIL import Image, ImageDraw, ImageFont
    W, H, m = 1240, 1754, 80          # A4 a 150 ppp; cada página se agrega al archivo al terminarla

    def fuente(t):
        try:
            return ImageFont.truetype(ttf or 'DejaVuSans.ttf', t)
        except Exception:
            try:
                return ImageFont.load_default(size=t)
            except TypeError:
                return ImageFont.load_default()
    TAM = {'h1': (fuente(38), 1.5), 'h2': (fuente(26), 1.45), 'p': (fuente(21), 1.4), 'small': (fuente(17), 1.35), 'code': (fuente(19), 1.35)}
    st = {'pag': None, 'd': None, 'y': m, 'n': 0}

    def cerrar():
        if st['pag'] is not None:
            st['pag'].save(ruta, 'PDF', resolution=150, append=st['n'] > 0); st['n'] += 1

    def nueva():
        cerrar(); st['pag'] = Image.new('RGB', (W, H), 'white'); st['d'] = ImageDraw.Draw(st['pag']); st['y'] = m

    def partir(t, f, ancho):
        out = []
        for par in t.split('\n'):
            l = ''
            for w in par.split(' '):
                k = (l + ' ' + w).strip()
                if st['d'].textlength(k, font=f) <= ancho or not l: l = k
                else: out.append(l); l = w
            out.append(l)
        return out
    nueva()
    for tipo, dato in L:
        if tipo == 'pag':
            if st['y'] > m: nueva()
        elif tipo == 'img':
            with Image.open(os.path.join(carpeta, dato['ruta'])) as im:
                im = plano(im)
            bw, bh = W - 2 * m, H - st['y'] - m - 200
            if bh < 250: nueva(); bh = H - st['y'] - m - 200
            s = min(bw / im.width, bh / im.height)
            im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.NEAREST if s >= 1 else Image.LANCZOS)
            st['pag'].paste(im, (m + (bw - im.width) // 2, st['y'])); st['y'] += im.height + 24
        else:
            f, g = TAM[tipo]
            ind = int(st['d'].textlength(' ', font=f) * (len(dato) - len(dato.lstrip(' ')))) if tipo == 'code' else 0
            for l in partir(dato.strip() if ind else dato, f, W - 2 * m - ind):
                if st['y'] > H - m - f.size: nueva()
                st['d'].text((m + ind, st['y']), l, fill='black', font=f); st['y'] += int(f.size * g)
    cerrar()


def armar(carpeta, ia, salida=None):
    ia = re.sub(r'[^a-z0-9]+', '', ia.lower()) or 'ia'
    fecha = datetime.date.today().isoformat()
    carpeta = os.path.abspath(carpeta)
    salida = os.path.abspath(salida or os.path.join(os.path.dirname(carpeta), 'listo_' + ia))
    os.makedirs(salida, exist_ok=True)
    imgs, textos, docs = recoger(carpeta, salida)
    M = manifiesto(carpeta, imgs)
    with open(os.path.join(salida, 'manifiesto.json'), 'w', encoding='utf-8') as f:
        json.dump(M, f, ensure_ascii=False, indent=1)
    mds = escribir_md(carpeta, salida, 'encicla_imagenes_%s_%s' % (ia, fecha), ia, fecha, M)
    pdf = 'encicla_maestro_%s_%s.pdf' % (ia, fecha)
    L = lineas_doc(carpeta, docs, textos, M, ia, fecha)
    try:
        import reportlab  # noqa: F401
        if os.environ.get('ENCICLA_SIN_REPORTLAB'): raise ImportError
        pdf_reportlab(os.path.join(salida, pdf), carpeta, L, fuente_ttf())
    except ImportError:
        pdf_pillow(os.path.join(salida, pdf), carpeta, L, fuente_ttf())
    zp, raiz = 'encicla_entrega_%s_%s.zip' % (ia, fecha), 'encicla_entrega_%s_%s/' % (ia, fecha)
    with zipfile.ZipFile(os.path.join(salida, zp), 'w', zipfile.ZIP_DEFLATED) as z:
        for r in imgs + [os.path.splitext(i)[0] + '.txt' for i in imgs] + textos + docs:
            if os.path.isfile(os.path.join(carpeta, r)): z.write(os.path.join(carpeta, r), raiz + r)
        z.write(os.path.join(salida, pdf), raiz + pdf); z.write(os.path.join(salida, 'manifiesto.json'), raiz + 'manifiesto.json')
    print('Listo en %s:\n  1. %s\n  2. %s\n  3. %s\n%d imágenes · %d textos · %d documentos de entrega'
          % (salida, pdf, ' + '.join(mds), zp, len(M), len(textos), len(docs)))


def desarmar(mds, destino):
    base = os.path.abspath(destino); n = mal = 0; man = None
    for md in mds:
        txt = leer(md)
        mm = re.search(r'## Manifiesto\s*```json\s*\n(.*?)```', txt, re.S)
        if mm and man is None: man = mm.group(1)
        for ruta, sha, datos in PAT.findall(txt):
            final = os.path.abspath(os.path.join(base, ruta))
            if not final.startswith(base + os.sep):
                print('Ruta no válida:', ruta); mal += 1; continue
            b = base64.b64decode(''.join(datos.split()))
            if hashlib.sha256(b).hexdigest() != sha:
                print('El SHA-256 no coincide:', ruta); mal += 1; continue
            os.makedirs(os.path.dirname(final), exist_ok=True)
            with open(final, 'wb') as f:
                f.write(b)
            n += 1
    if man:
        os.makedirs(base, exist_ok=True)
        with open(os.path.join(base, 'manifiesto.json'), 'w', encoding='utf-8') as f:
            f.write(man)
    print('%d imágenes reconstruidas en %s%s' % (n, destino, ' · %d con problemas' % mal if mal else ''))
    return mal == 0 and n > 0


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) >= 3 and a[0] == 'armar':
        armar(a[1], a[2], a[3] if len(a) > 3 else None)
    elif len(a) >= 3 and a[0] == 'desarmar':
        sys.exit(0 if desarmar(a[1:-1], a[-1]) else 1)
    else:
        print(__doc__); sys.exit(2)
```

## 12.7 Cómo me lo entregas (elige una)
1. **Aquí mismo:** adjunta el PDF maestro, el MD y el ZIP en la conversación con Claude Code y di “ya está la entrega de …”.
2. **GitHub:** en `juanfeliperico369-stack/BicicletasUno`, rama `ccr-bed2d98a-uho2kr`, carpeta `arte/entregas/<ia>/` → *Add file* → *Upload files* (la web acepta archivos de hasta 25 MB; si el ZIP es más grande, usa la opción 3).
3. **Google Drive:** una carpeta “Juega EnCicla · Arte” con una subcarpeta por IA; comparte el enlace.

## 12.8 Créditos y licencias
- Lo que generes con Gemini o ChatGPT en la cuenta del autor es del autor, según los términos de cada servicio. Lo registro en `arte/CREDITOS.md`.
- Las fotos de la galería son **solo referencia**. Si alguna se usa tal cual, se cita con su licencia; las de licencia NC no se usan en el juego.

---

# 13 · Integración: qué hago con lo que entregas

1. **Recibo:** desarmo el MD (verifica el SHA-256) o abro el ZIP.
2. **Reviso** cada pieza con la lista de control. Lo que no cumpla vuelve con una corrección concreta (parte 11).
3. **Limpio:** magenta a transparencia, recorte y alineación a la cuadrícula.
4. **Reduzco a pixel art:** vecino más cercano a la escala del juego (casillas de 16 px, sprites de 24 a 40 px, retratos de 96 px) y cuantizo a la paleta.
5. **Armo atlas** comprimidos (`src/art/*.png` + `*.json`). Meta: **menos de 4 MB** de arte, para que el juego siga liviano y sin internet.
6. **Código con respaldo:** si falta una pieza, el juego sigue con el dibujo actual.
7. **Variantes por hora y fiesta:** el juego elige la capa según la hora y la fecha reales.
8. **Pruebas:** `node tests/run.js` (100 partidas sin errores) y capturas en vertical y horizontal, de día y de noche.
9. **Publicación:** nueva versión en GitHub Pages, APK y bitácora.

| Pieza | Dónde entra |
|---|---|
| Retratos | `66-historia.js` (caras), `67-personaje.js` (personajes), `71-tutor.js` (compañero), `77-piloto.js` (escenas) |
| Sprites de personajes y bicis | `75-graficos.js`, `30-ride.js` |
| Peatones y vehículos | `35-life.js`, `68-ciudad.js`, `78-ciudad-viva.js` |
| Texturas, vegetación y fachadas | `20-map.js`, `75-graficos.js` (suelo y edificios 3D) |
| Estaciones de perfil y panorámicas | `75-graficos.js` (vista panorámica) |
| Postales y marcadores de lugares | `21-map-art.js` (mapa), `60-ui.js` (álbum) |
| Íconos y logros | `10-art.js`, `65-extra.js` |
| Objetos de minijuegos | `40-mg.js`, `45-mg2.js`, `46-mg3.js`, `72-oficios2.js`, `80-limpieza.js` |
| Interfaz y mapa grande | `style.css`, `60-ui.js`, `79-interfaz.js`, `78-ciudad-viva.js` |
| Fiestas | `69-calendario.js` |
| Arte clave | `95-promo.js` y `tools/assets.js` (ícono de la app e imagen para compartir) |
| Textos | `66-historia.js` (historia), `71-tutor.js` (tutor), `69-libre.js` (misiones), `65-extra.js` (logros) |

---

# 14 · Galería de referencia (créditos)

Fotos con licencia libre encontradas con [Openverse](https://openverse.org) (Wikimedia Commons y Flickr). **No se copiaron al repositorio:** se enlazan a su fuente con autor y licencia. Úsalas como referencia de formas, materiales, colores y ambiente, **sin copiar logos ni personas**.

### EnCicla: estaciones, bicis y eventos (17)

- [EnCicla Bicicletas Públicas](https://www.flickr.com/photos/59505201@N07/6224413289) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Recorridos miércoles EnCicla](https://www.flickr.com/photos/59505201@N07/10043175106) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [EnCicla Bicicletas Públicas](https://www.flickr.com/photos/59505201@N07/6224934420) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [EnCicla Bicicletas Públicas](https://www.flickr.com/photos/59505201@N07/6220379291) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [EnCicla Bicicletas Públicas](https://www.flickr.com/photos/59505201@N07/6224939262) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [EnCicla Bicicletas Públicas](https://www.flickr.com/photos/59505201@N07/6220376711) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [EnCicla Bicicletas Públicas](https://www.flickr.com/photos/59505201@N07/6224420913) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [EnCicla - Estación Ruta N](https://commons.wikimedia.org/w/index.php?curid=64019042) — Bertahan Luxing · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Lanzamiento de los nuevos tramos y estaciones EnCiCla](https://www.flickr.com/photos/59505201@N07/9725263989) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Lanzamiento de los nuevos tramos y estaciones EnCiCla](https://www.flickr.com/photos/59505201@N07/9728492890) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [EnCicla en la Feria](https://www.flickr.com/photos/90132199@N07/14879533082) — EnCicla · [CC BY-NC 2.0](https://creativecommons.org/licenses/by-nc/2.0/) · solo referencia
- [EnCicla en la Feria](https://www.flickr.com/photos/90132199@N07/14693309678) — EnCicla · [CC BY-NC 2.0](https://creativecommons.org/licenses/by-nc/2.0/) · solo referencia
- [EnCicla en la Feria](https://www.flickr.com/photos/90132199@N07/14856957016) — EnCicla · [CC BY-NC 2.0](https://creativecommons.org/licenses/by-nc/2.0/) · solo referencia
- [EnCicla Pura Vida](https://www.flickr.com/photos/59505201@N07/16439324487) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Lanzamiento de los nuevos tramos y estaciones EnCiCla](https://www.flickr.com/photos/59505201@N07/9728508622) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Lanzamiento de los nuevos tramos y estaciones EnCiCla](https://www.flickr.com/photos/59505201@N07/9725266101) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [EnCicla en la #F2Ruedas](https://www.flickr.com/photos/90132199@N07/13936514310) — EnCicla · [CC BY-NC 2.0](https://creativecommons.org/licenses/by-nc/2.0/) · solo referencia

### Ciudad, fiestas y transporte (de la galería de *El Metro*)

#### Metro (líneas A y B): trenes y estaciones (12)

- [Metro de Medellín - Tren MAN en estación San Antonio](https://commons.wikimedia.org/w/index.php?curid=149715874) — AXF02 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Nuevos trenes del Metro de Medellín](https://www.flickr.com/photos/59505201@N07/5726674779) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Ayacucho Tram's San Antonio terminus, with 2 Translohr cars underneath metro station (2016)](https://commons.wikimedia.org/w/index.php?curid=67254775) — J Daoss · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Estación Bello Metro de Medellín (08-25)](https://commons.wikimedia.org/w/index.php?curid=174260177) — Minoh09 · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Estación Envigado (Metro de Medellín)](https://commons.wikimedia.org/w/index.php?curid=54053732) — Jdapenao Di · [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/)
- [Estación Alpujarra (Metro de Medellín)](https://commons.wikimedia.org/w/index.php?curid=51651121) — Jdapenao Di · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Imaginario estación Parque Berrío Metro de Medellín](https://commons.wikimedia.org/w/index.php?curid=48420073) — Jdapenao Di · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Estación Parque Berrío - metro de Medellín](https://commons.wikimedia.org/w/index.php?curid=35826419) — Yimicorrea · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- [Tren CAF del Metro de Medellín en la estación Hospital](https://commons.wikimedia.org/w/index.php?curid=154001126) — Daniel Angulo Ibarbo · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Tren CAF del Metro de Medellín saliendo de la estación Exposiciones](https://commons.wikimedia.org/w/index.php?curid=154000807) — Daniel Angulo Ibarbo · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Metro de Medellín - Tren MAN Modernizado](https://commons.wikimedia.org/w/index.php?curid=141587939) — AXF02 · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Medellín: metro station](https://www.flickr.com/photos/27035950@N00/6432088363) — Daniel-Latorre · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)

#### Metrocable (10)

- [Metrocable Arví](https://www.flickr.com/photos/46785962@N03/7543321676) — Saluda UdeA · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Estación Metrocable Arví](https://www.flickr.com/photos/18618970@N00/4480800604) — medea_material · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Estación metrocable Arví](https://www.flickr.com/photos/18618970@N00/4480150765) — medea_material · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Metro cable Santo domingo y Metro Cable Arví](https://www.flickr.com/photos/18618970@N00/4480152131) — medea_material · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [2018 Línea H del Metrocable Medellín - estación Villa Sierra](https://commons.wikimedia.org/w/index.php?curid=69379966) — Felipe Restrepo Acosta · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Sobrevolando Arví](https://www.flickr.com/photos/18618970@N00/4480845032) — medea_material · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Metrocable Medellín](https://www.flickr.com/photos/59505201@N07/8067331943) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Metrocable Medellín](https://www.flickr.com/photos/59505201@N07/8067325861) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Metrocable - Reaching the least developed suburban areas of Medellín (5083096780)](https://commons.wikimedia.org/w/index.php?curid=31949822) — Jorge Láscar from Australia · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Línea H (Metrocable Medellín)](https://commons.wikimedia.org/w/index.php?curid=44252575) — Andinodecorazón · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

#### Tranvía de Ayacucho (4)

- [Presentación de la primera unidad del Tranvía de Ayacucho](https://www.flickr.com/photos/59505201@N07/14433527190) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Presentación de la primera unidad del Tranvía de Ayacucho](https://www.flickr.com/photos/59505201@N07/14433528230) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Tranvía de Ayacucho](https://www.flickr.com/photos/63488671@N00/49850407138) — chilangoco · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Medellin Tram](https://commons.wikimedia.org/w/index.php?curid=47852637) — FoxerMG · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

#### Metroplús, alimentadores y busetas (8)

- [Metro Medellin](https://www.flickr.com/photos/11121717@N02/4148901975) — Omar Uran · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [2018 Medellín - buseta en la calle 45 con carrera 53 A](https://commons.wikimedia.org/w/index.php?curid=69393596) — Felipe Restrepo Acosta · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [2018 Medellín calle 41 con carrera 51, buseta bajo la vía del metro](https://commons.wikimedia.org/w/index.php?curid=69393616) — Felipe Restrepo Acosta · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Buseta en Medellín](https://commons.wikimedia.org/w/index.php?curid=169989884) — Xemenendura · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Alimentador Metro Medellin](https://commons.wikimedia.org/w/index.php?curid=44342629) — Petruss · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Estación Universidad de Medellín (Metroplús)](https://commons.wikimedia.org/w/index.php?curid=54158668) — Jdapenao Di · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Intervención a peatones en la Estación de Metroplús Los Alpes](https://www.flickr.com/photos/59505201@N07/27976747553) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Estación Fátima (Metroplús)](https://commons.wikimedia.org/w/index.php?curid=54508580) — Jdapenao Di · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)

#### Ciudad: barrios, río, plazas y vistas (20)

- [Medellín](https://www.flickr.com/photos/100759833@N05/52473316749) — santiagolopezpastor · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Medellin Skyline](https://www.flickr.com/photos/7942389@N04/504021074) — sergejf · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Medellin... que chimba parce!!!!](https://www.flickr.com/photos/72494726@N00/280693114) — jduquetr · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Una vista de Medellín](https://www.flickr.com/photos/44124369279@N01/10968329364) — morrissey · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [el poblado, medellin](https://www.flickr.com/photos/37083012@N00/1354729251) — willy gil · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Medellin, Comuna 13](https://www.flickr.com/photos/11121717@N02/4148916737) — Omar Uran · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Medellín](https://www.flickr.com/photos/92529460@N00/5919196715) — Hugo Quintero · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Iglesia San José (Medellín)](https://www.flickr.com/photos/92529460@N00/4842401044) — Hugo Quintero · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Graffiti in Comuna 13, Medellín 10](https://commons.wikimedia.org/w/index.php?curid=99422890) — Bernard Gagnon · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Graffiti in Comuna 13, Medellín 11](https://commons.wikimedia.org/w/index.php?curid=99422914) — Bernard Gagnon · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Gato by Fernando Botero - Plaza Botero - Medellín - Colombia 2024](https://commons.wikimedia.org/w/index.php?curid=148836121) — José Luiz · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Hombre a Caballo by Fernando Botero - Plaza Botero - Medellín - Colombia 2024](https://commons.wikimedia.org/w/index.php?curid=148835816) — José Luiz · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- [Parque de los pies descalzos](https://www.flickr.com/photos/63488671@N00/321377268) — chilangoco · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Parque de los pies descalzos](https://www.flickr.com/photos/63488671@N00/321377264) — chilangoco · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Pueblito Paisa](https://www.flickr.com/photos/63488671@N00/321345952) — chilangoco · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Pueblito Paisa](https://www.flickr.com/photos/63488671@N00/321353707) — chilangoco · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Esa noche en el Pueblito Paisa](https://www.flickr.com/photos/123844098@N03/21065460872) — dgorrz · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Río Medellín](https://www.flickr.com/photos/15072398@N00/45869123621) — *Iván Erre Jota* · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Río Medellín](https://www.flickr.com/photos/15072398@N00/45705409781) — *Iván Erre Jota* · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [2018 Río Medellín y estación de metro Poblado](https://commons.wikimedia.org/w/index.php?curid=69377388) — Felipe Restrepo Acosta · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

#### Fiestas: Feria de las Flores y Alumbrados (12)

- [Río Medellín en navidad 2007](https://www.flickr.com/photos/63488671@N00/2168714421) — chilangoco · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Alumbrado en el Río Medellín](https://www.flickr.com/photos/63488671@N00/347034965) — chilangoco · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [DESFILE DE SILLETEROS - 2014](https://www.flickr.com/photos/15072398@N00/14719290768) — *Iván Erre Jota* · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Desfile de Silleteros](https://www.flickr.com/photos/54818270@N05/5278143814) — Guía de Viajes Oficial de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [De Flores y Silletas.... #silleteros #medellíncity #medellín #instamedellín #ig_colombia_ #feriadelasflores #IgersColombia #orquídea #igers](https://www.flickr.com/photos/15072398@N00/20405838375) — *Iván Erre Jota* · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [MEDELLÍN - FERIA DE LAS FLORES](https://www.flickr.com/photos/15072398@N00/14895383753) — *Iván Erre Jota* · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Bazar de las Flores](https://www.flickr.com/photos/59505201@N07/20094775915) — Secretaría de Movilidad de Medellín · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [MEDELLÍN - NAVIDAD 2014](https://www.flickr.com/photos/15072398@N00/15356148703) — *Iván Erre Jota* · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [MEDELLÍN - NAVIDAD 2014](https://www.flickr.com/photos/15072398@N00/15975111382) — *Iván Erre Jota* · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [ALUMBRADOS 2010](https://www.flickr.com/photos/15072398@N00/5263449320) — *Iván Erre Jota* · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Desfile de Autos Clasicos y Antiguos(57)](https://commons.wikimedia.org/w/index.php?curid=2518840) — SajoR · [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/)
- [Desfile de Autos Clasicos y Antiguos(56)](https://commons.wikimedia.org/w/index.php?curid=2518836) — SajoR · [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/)

#### Cultura: chivas y comida (5)

- [Chiva Colombiana - bus escalera - FORD 600 1965 SYJ 097](https://www.flickr.com/photos/59102567@N02/7919623836) — @ferchos04 - F04 °°II YES · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Locombia Colombia PANACA Quindío Bus Chiva](https://www.flickr.com/photos/36283871@N03/4093177918) — 15Adar2 [340 cu.in.] Mamá ha muerto · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Dodge 600 bus escalera chiva Colombiana en Piendamó](https://www.flickr.com/photos/41979499@N03/15550435167) — N Fernando Sotelo Castro@Ferchos04 - V.2.0 · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- [Bandeja Paisa](https://www.flickr.com/photos/25834786@N03/4346303841) — secretlondon123 · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)
- [Bandeja paisa 30062011](https://commons.wikimedia.org/w/index.php?curid=15705199) — Dtarazona · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)

---

# 15 · Bitácora de encargos

| Fecha | IA | Encargos | Estado | Notas |
|---|---|---|---|---|
| 2026-11-22 | Claude Code | documento creado (v3.0.0) | ✅ | primera versión de los encargos de arte e historia |

---

# Anexo A · Textos actuales de la historia

> Lo que hoy dice cada personaje en sus turnos. *Antes*: al empezar el turno · *Después*: al aprobarlo. El Guionista los continúa y mejora (H-20).

## Doña Luz · usuaria desde 2011 (`usuario`)

1. **El primer pedalazo**
   - Antes: ¡Bienvenido, mijo! Yo monto en EnCicla desde 2011. Presta tu primera bici y llévala a la otra estación antes de una hora. Suave, que nadie nace aprendido.
   - Después: ¿Viste? Gratis, sin humo y sin trancón. Mañana te enseño a respetar los semáforos.
2. **Semáforo en rojo**
   - Antes: Hoy son dos viajes. Ojo con los semáforos: en bici también se frena en rojo, y en las bajadas suelta un poquito, que del afán no queda sino el cansancio.
   - Después: Así da gusto: pedaleas como todo un ciudadano. Dicen que EnCicla anda buscando anfitriones…
3. **Tres viajes y una decisión**
   - Antes: Tres viajes seguidos, como cualquier día de trabajo. Si los logras, pasa por la estación: Santi, el anfitrión, quiere conocerte.
   - Después: ¡Te lo dije! Santi dice que tienes madera. Ponte el chaleco: mañana madrugas a las 5.

## Santi · anfitrión de estación (`anfitrion`)

1. **Las 5 de la mañana**
   - Antes: A las 5 en punto el supervisor te entrega la tula: llaves y celular. Tienes media hora para abrir las automáticas del sector y la tuya, con su inventario. A las 5:30 arranca el sistema.
   - Después: ¡Abriste a tiempo! Y en la ventanilla: sacar la bici, entregarla y ajustar el sillín a la medida. Así se atiende.
2. **La estación es tuya**
   - Antes: Hoy te toca el cierre. A las 9 p. m. el sistema cierra, pero sigues recibiendo bicis hasta las 10. Después el inventario y a cerrar las automáticas antes de las 10:30.
   - Después: Estación impecable. Don Jairo, el mecánico, preguntó quién dejaba las bicis tan ordenadas.

## Don Jairo · mecánico del taller (`mecanico`)

1. **El oído del mecánico**
   - Antes: Toda bici avisa lo que le duele. Las que llegan malas del camión de balance se diagnostican primero: el que adivina, daña.
   - Después: Eso. Bici que sale de aquí, sale como nueva. Mañana te paso al equipo de ensamble.
2. **Bicis nuevas**
   - Antes: Llegaron las piezas de bodega. Marco, ruedas, manubrio, cadena, sillín, frenos y luces: en ese orden y con las tuercas en su punto.
   - Después: ¡Qué berraquera! Bicis nuevas para el valle. Yuli, la de bodega, necesita a alguien juicioso.

## Yuli · jefa de bodega (`bodega`)

1. **Cada cosa en su sitio**
   - Antes: La bodega es el corazón: aquí llega todo. Descarga, verifica que nada venga golpeado ni con cantidades raras, organiza y carga el pedido del taller. Después lo llevas tú mismo.
   - Después: Pedido exacto y a tiempo. Kevin, el de apoyo, anda pidiendo ayuda con los relevos.

## Kevin · apoyo en ruta (`apoyo`)

1. **La zona entera**
   - Antes: El de apoyo abre todas las automáticas de su zona: Envigado tiene trece, Aeropuerto dos. Después, entre las 8 y las 12, los relevos. Y nunca pares de hacer inventarios de control.
   - Después: Llegaste a tiempo a cada relevo. Eso también es servicio.
2. **De relevo en relevo**
   - Antes: Turno 3: relevos de 4 a 8:30 de la noche, inventarios en cada rato libre y, a las 10, el cierre de toda la zona.
   - Después: Ni un relevo tarde. La ingeniera Paola pregunta si sabes de cables.

## Ing. Paola · técnica de estaciones (`tecnico`)

1. **Luz verde**
   - Antes: Tótems, luces LED de los anclajes, celulares de las estaciones… y los power banks. Los celulares que están medio malos se descargan rápido: arma tu plan para que ninguno se apague.
   - Después: Todo encendido y ningún celular apagado. Wilson, el del carro de balance, te guarda puesto.

## Wilson · conductor de balance (`balance`)

1. **Las tulas de las 4 a. m.**
   - Antes: El camión duerme en la Terminal del Norte. A las 4 sales: unos llevan al supervisor jefe a Suramericana, otros las tulas de la universidad, de Envigado e Itagüí (en el Puente Pandequeso) o de Sabaneta y La Estrella.
   - Después: Ruta cumplida. Y de paso, las bicis malas al taller.
2. **El camión de 40**
   - Antes: Hoy manejas el camión especial: 40 bicis entre el Campus de la Nacional, Suramericana y el Estadio, y tanteas las estaciones del sur.
   - Después: Corredor balanceado. Cata, la de la sala de control, quiere conocerte.
3. **Turno de noche**
   - Antes: Balanceo hasta las 10, también en los corredores eléctricos. Luego recoges las tulas, las entregas en Casa EnCicla y guardas el camión en la Terminal del Norte.
   - Después: Camión guardado y sin un rayón. Sube a la sala de control: Cata te espera.

## Cata · sala de control (`monitoreo`)

1. **La sala de control**
   - Antes: Desde aquí se ve todo. Rojo es estación vacía; azul, llena. Manda las misiones a los carros y, cada hora, revisa que los inventarios cuadren.
   - Después: Buen ojo. El mapa te habla y tú ya lo entiendes.
2. **Atención al cliente**
   - Antes: Suena el teléfono: sanciones, bicis que no se sueltan, gente que se quiere inscribir. Lee el sistema antes de contestar.
   - Después: Nadie colgó bravo. Don Rubén anda preguntando por ti.

## Don Rubén · supervisor (`supervisor`)

1. **Las tulas**
   - Antes: A las 4 llegas a Casa EnCicla, por el Parque de Malibú. Arma cada tula con su llave y un celular cargado, súbete al carro de balance y, a las 5, entrega cada una a su anfitrión.
   - Después: Sistema abierto sin novedad. Mandas como quien ha pasado por todos los puestos.
2. **Un día cualquiera**
   - Antes: No hay días cualquiera: relevos, bicis con falla, semáforos dañados y usuarios inconformes. Cuida las estaciones y cuida a tu gente.
   - Después: Todo resuelto. Falta una sola cosa: el cierre.
3. **La Gran Rodada**
   - Antes: Hoy el cierre es especial: miles pedalean de Caldas a Barbosa. A las 10:30 recoges todas las tulas y pones a cargar los celulares en Casa EnCicla.
   - Después: ¡Lo lograste! Empezaste prestando una bici y hoy cuidas las de todo el valle. Gracias por rodar con EnCicla.

## Maryi · pausas activas (`pausas`)

1. **A mover el cuerpo**
   - Antes: Hoy recorres las estaciones haciendo pausas activas. Llega, pon la música y que todos estiren: nadie aguanta un turno entero quieto.
   - Después: ¡Así se cuida al equipo! Los anfitriones quedaron como nuevos.

## Jhon · rescate de bicis (`rescate`)

1. **Ninguna bici atrás**
   - Antes: Nos reportaron bicis fuera de las estaciones. Ve por ellas y llévalas con una mano: despacio y derecho, que el equilibrio es todo.
   - Después: Todas de vuelta en su anclaje. Buen pulso, compañero.

## Doña Marta · brigada de limpieza (`limpieza`)

1. **Brigada del mes**
   - Antes: Hoy toca brigada: vamos dos supervisores y en cada estación nos ayuda el anfitrión. Escoge bien la herramienta y que brille el habitáculo.
   - Después: ¡Quedaron impecables! Los usuarios lo notan apenas llegan.

---

# Anexo B · Guía del juego

## GUÍA DEL PROYECTO · Juega EnCicla

> Documento de traspaso: con esto otra persona o IA puede continuar el proyecto sin perder contexto.
> Mantener actualizado junto con `docs/BITACORA.md` en cada cambio.

### 1. Qué es

Videojuego arcade **offline** (HTML único, sin librerías) sobre el trabajo diario de **EnCicla**, el sistema
de bicicletas públicas gratuito del Área Metropolitana del Valle de Aburrá (Medellín). Es una demo propuesta
por Juan Felipe Rico a EnCicla. Su objetivo es generar conciencia y diversión, y atraer donaciones para el sistema.
Público: todas las edades (niños y abuelos), por eso todo es intuitivo y la dificultad sube por niveles.

- **Nombre:** Juega EnCicla (repo `juanfeliperico369-stack/BicicletasUno`).
- **Colores de marca:** verde claro `#9bd341`, azul oscuro `#0a2342`, blanco. Acentos: ámbar `#ffc93c` (tiempo y estrellas),
  coral `#ff6b5a` (errores), cielo `#56c7ff` (información), crema `#f4efd8` (papel de revista).
- **Estilo:** "revista pixel". Es una evolución de la revista EMSAY (PDF "Evolución musical": titulares condensados,
  cajas con borde grueso, letras espaciadas, franjas, garabatos, etiquetas "PAG · SESIÓN") y del juego Doc Element
  (HTML de referencia del usuario). Tipografías embebidas de ese HTML: **TeX Gyre Heros Condensed Bold** ("Titulos", licencia GUST)
  e **Inter** ("Cuerpo", licencia OFL). Pixel art 100 % generado por código.

### 2. Estructura

```
src/index.html        plantilla (marcadores <!--HEAD--> /*FONTS*/ /*CSS*/ /*JS*/)
src/style.css         estilos de revista (tokens en :root)
src/assets/           fuentes woff/woff2 (se incrustan en base64)
src/js/00-core.js     utilidades, RNG con semilla, Save (localStorage + exportar/importar), Snd (WebAudio 8 bits), Input, View
src/js/10-art.js      arte pixel: personas, bicis (cenital, lateral, frontal), camión, carros, panorámica, íconos 16x16, portada
src/js/19-lugares.js  estaciones (lat/lon), lugares con postal, zonas del Apoyo, puntos de la operación y Metrocable
src/js/20-map.js      mapa REAL del valle (carga valle.bin, relieve, carriles, semáforos, metro, rutas en ventana, dibujo con relieve), metro, ruta (Dial), dibujo por bloques
src/js/30-ride.js     StationSim (demanda de préstamos) + Ride (bici/camión, tráfico, metro, GPS, minimapa) + drawOverview
src/js/35-life.js     vida urbana: Tranvía de Ayacucho (calle sin carros), Metrocable K/P/J/H, peatones, luces de noche
src/js/40-mg.js       minijuegos: MGAnfitrion, MGMecanico, MGBodega, MGApertura(cierre), MGCables, MGSimon, MGInspeccion
src/js/45-mg2.js      minijuegos v0.4 inspirados en Infinity Games y Railways: MGLoop (Circuito), MGLaser (Señal), MGTraffix (Semaforero),
                      MGRutas (Desvíos de Bodega T3 y «Maquinista» secreto) y MGLaberinto (Moravia secreto)
src/js/50-modes.js    ROLES (9 oficios), PERKS, NOVEDADES, Mode/MapMode/ModeSub y las 9 clases de modo
src/js/55-carrera.js  Carrera de postales (multijugador): contra un bot (3 niveles) o en red
src/js/21-map-art.js  dibujos pixel de los lugares con postal
src/js/22-sitios.js   sitios reales (universidades, colegios, alcaldías, hospitales, iglesias…): carga, cuadrícula, canchas, piscinas, edificios con su forma real y partes de los emblemáticos
src/js/87-placas.js   placas de lo poco conocido (16 datos en su lugar real, álbum y logros)
src/js/74-sistema.js  el sistema metro con los diseños de El Metro (trenes, tranvía, Metroplús con sus buses, Metrocable y estaciones) y los andenes reales del Metroplús
src/js/76-altura.js   lo que va en alto: metro en viaducto, estaciones elevadas, puentes (cortados del suelo), nivel del jugador y Metroplús sobre sus avenidas
src/js/88-camara.js   cámara (pellizco, giro, inclinación, ángulos, cámara libre), velocidad elegible y calidad automática
src/js/89-paseo.js    paseo guiado del modo libre: la bici va sola por los lugares con postal y la cámara cambia de plano
motor-valle/geo/metroplus_elmetro.py corredores y andenes reales del Metroplús tomados de El Metro (metrozero) -> src/data/metroplus.json
motor-valle/geo/alturas.py  tramos del metro en viaducto y puentes con su nivel (Overture) -> src/data/alturas.json
tools/auditoria-mapa.js mide el mapa que se juega (río, agua, escaleras, estaciones, sitios, CSP): docs/AUDITORIA-MAPA.md
src/js/46-mg3.js      minijuegos de la operación real: Conteo, Tulas, Bodega en 4 pasos, Ensamble, Llamadas
src/js/52-oficios.js  turnos reales por fases (ShiftMode) y los 9 oficios reales (reemplazan a los de 50-modes.js en MODE_CLASS)
src/js/57-equipo.js   Turno en equipo (cooperativo en red): ModeCoopMon (anfitrión, Monitoreo) y ModeCoopDriver (invitados, camión)
src/js/66-historia.js historia (un capítulo por turno real, 19) (CAST, HISTORIA), retratos pixel y logros cronista/estreno/equipo
src/js/65-extra.js    logros (16), introducción «¿Qué es EnCicla?», «Apoya la bici pública», tarjeta de resultado 1080x1350
src/js/70-net.js      Net: salas WebRTC de hasta 4 jugadores en estrella (el anfitrión reenvía), sin servidor
src/js/72-qr.js       QR: generador propio (v1–40, idéntico a la referencia Nayuki) + escáner con BarcodeDetector y cámara
landing/              página oficial (pagina.html), privacidad.html, capturas y arte; build.js la copia a dist/web
tools/store.js        capturas 1080x1920 y gráfico 1024x500 para Play Store (dist/store/) y la página oficial
docs/PLAY_STORE.md    ficha de Play Store, clasificación, seguridad de datos y pasos de firma (keystore.properties fuera de git)
src/js/60-ui.js       UI (portada, escalafón, briefing, resultados, álbum, partidas, ajustes), Game (bucle), Progress
src/js/90-bot.js      bot de pruebas (JE.bot.run): juega partidas y valida invariantes
src/js/95-promo.js    íconos de la app e imagen OG 1200x630
src/js/67-personaje.js creador de personaje, rankings, personajes y tipos de control
src/js/68-ciudad.js   motos, camiones, ciclistas de las ciclorrutas, caminar en el modo libre y MGDescarga (bajar bicis con equilibrio)
src/js/69-calendario.js fecha real: festivos, horarios por día, ciclovía y festividades (decoración, colores, música, regalos)
src/js/69-libre.js    modo libre con vida propia: perfil, misiones del día, MGRutina, carrera de ciclovía, energía, fotos y regla de colores
src/js/71-tutor.js    tutorial opcional con un compañero del oficio
src/js/72-oficios2.js Pausas Activas, Rescate y los minijuegos nuevos del técnico
src/js/73-musica.js   música por estilos (jazz, lo-fi, soft rock, electrónica)
src/js/75-graficos.js gráficos pixel y ciudad 3D suave (suelo vectorial, lotes con su calle, edificios con volumen); vista panorámica de plataformas
src/js/75-lugares3d.js lugares emblemáticos en 3D (cuerpos con techo propio y suelo vectorial), estación EnCicla suave
src/js/76-red-libre.js mundo libre en red y competencias personalizadas
src/js/77-piloto.js   daltonismo, retos con QR, escenas de la historia y Bluetooth
src/js/78-ciudad-viva.js NPC con rutas por toda la ciudad y mapa grande interactivo con destino
src/js/79-interfaz.js avisos al frente y breves; carga del mapa grande por partes
src/js/80-limpieza.js brigada de limpieza, accesos rápidos del inicio, creador al empezar y horario del sábado
src/js/81-controles.js panel de controles: tipo, lado, tamaño e inclinar el celular
src/js/82-prestamo.js préstamo EnCicla en el modo libre: renovar cada hora, strikes, suspensiones y reportes
src/js/84-mapa-vivo.js barrio/comuna al entrar, palomas, nubes y brillos del agua; centros de comunas y barrios para el mapa grande
src/js/83-guion.js    guion: Un día del valle, frases de la ciudad, consejos del tutor, saludos de fiesta, huevos del Metro y logros
src/js/99-boot.js     arranque (carga el mapa de forma asíncrona) y registro del service worker
src/data/             valle.bin + valle.json (casillas de 10 m, relieve, municipios, comunas, barrios, alturas y lotes) y vias.bin (cada vía como vector, con su nombre, nomenclatura y ancho); se regeneran con motor-valle/geo/build.py
motor-valle/geo/            fetch.py (OpenStreetMap vía Overture, huellas de edificios y relieve), oficial.py (capas oficiales de Medellín, Itagüí, Envigado y Sabaneta), lineas.json (Metroplús y cables, de El Metro) y build.py (cuadrícula del mapa)
tools/build.js        construye dist/juega-encicla.html (archivo único) y dist/web/ (PWA)
tools/assets.js       genera los PNG (íconos, apple-touch-icon, favicon, compartir.png) con Playwright
contenido/guion/      textos del juego en JSON; tools/build.js los incrusta como GUION (ver contenido/LEEME.md)
arte/entregas/        entregas de arte de las IA archivadas tal cual (ver arte/LEEME.md y docs/AUDITORIA-C99.md)
tools/todo-ia.js      compila dist/ENCICLA-TODO.md: docs/IA-ENCICLA.md + script de entregas + historia actual, guía y bitácora
tools/armar_entrega.py arma las entregas de las IA (PDF maestro, MD con el código de las imágenes, ZIP) y las desarma
docs/IA-ENCICLA.md    documento único para las IA de arte e historia (fuente; lo compila tools/todo-ia.js)
tests/run.js          pruebas: sintaxis, N partidas con el bot, humo de interfaz, rendimiento con CPU 4x lenta
app/                  proyecto Capacitor (Android); ver sección 8
```

Todos los `.js` se concatenan en orden alfabético dentro de **un solo `<script>`**, así que las constantes de nivel superior se comparten entre archivos.
Objeto global de depuración: `window.JE` (`JE.map`, `JE.game`, `JE.ui`, `JE.bot`, `JE.save`, `JE.errors`).

### 3. Comandos

```bash
node tools/build.js            # construye dist/
node tools/assets.js           # íconos + compartir.png (necesita dist/juega-encicla.html)
python3 motor-valle/geo/fetch.py && python3 motor-valle/geo/oficial.py && python3 motor-valle/geo/build.py   # rehace el mapa de 10 m (duckdb, numpy, pillow, shapely; ~1 min)
TILE=20 OUT=carpeta python3 motor-valle/geo/build.py   # el mismo mapa en casillas de 20 m (el que usa El Metro)
# El Metro: python3 tools/mapa_valle.py carpeta landuse.parquet && ENCICLA_MAPA=carpeta python3 tools/ciudad_datos.py motor-valle/geo/cache/oficial (en su repositorio)
node tools/todo-ia.js          # solo el documento para IA (build.js ya lo genera)
python3 tools/armar_entrega.py desarmar <entrega.md> <carpeta>   # reconstruye las imágenes de una entrega
node tests/run.js --n=100      # pruebas; --shots guarda capturas en tests/out/
```
Para depurar en el navegador: `?unlock=1` desbloquea todos los oficios. En consola: `JE.bot.run({n:27}).then(r=>console.log(JE.bot.format(r)))`.

### 4. Diseño del juego

**Escalafón (orden pedagógico, de una sola habilidad a combinadas):**

| # | Oficio | Turnos reales (SHIFTS en 52-oficios.js) | Se desbloquea con |
|---|--------|------------------------------------------|-------------------|
| 1 | Usuario | 3 niveles: primer préstamo, dos viajes, día de ciclista | 0 ★ |
| 2 | Anfitrión | T1 Apertura 5:00–13:30 · T3 Cierre 13:30–22:30 | 1 ★ |
| 3 | Mecánico | Equipo de reparación · Equipo de ensamble (8:00–17:00) | 3 ★ |
| 4 | Bodega | Turno intermedio 8:00–17:00 (recibir, verificar, organizar, cargar y llevar al taller) | 5 ★ |
| 5 | Apoyo | T1 apertura de zona + relevos 8–12 · T3 relevos 16–20:30 + cierre de zona | 7 ★ |
| 6 | Técnico | Turno intermedio 8:00–17:00 (tótems, LED, celulares, power banks) | 10 ★ |
| 7 | Balance | Apertura 4:00–13:00 (tulas) · Camión especial de 40 · Cierre (tulas, parqueadero) | 12 ★ |
| 8 | Monitoreo | Sala de control (inventario cada hora) · Atención al cliente | 16 ★ |
| 9 | Supervisor | Apertura 4:00–12:00 · Intermedio 9:00–18:00 · Cierre 14:00–23:00 | 20 ★ |

- Cada turno tiene **3 metas** (la primera obligatoria). Máximo de estrellas = 3 × turnos (`MAX_STARS()`, hoy 57).
  El turno N+1 se abre con ≥1 ★ en el turno N. Hay modo "Libre" (práctica).
- **Roguelite:** al aprobar un turno eliges 1 de 3 mejoras (`PERKS`, máximo 3). Si fallas pierdes todas y la racha vuelve a 0.
- **Novedad del día** (`NOVEDADES` + `NOV_EXTRA`): tráfico, demanda, lluvia, ciclovía, partido, Flores, Alumbrados. El primer turno siempre es "Día normal".

**v0.7 · EnCicla real (lo más importante para continuar):**

*Mapa real del Valle de Aburrá* (`motor-valle/geo/`, `src/data/`, `19-lugares.js`, `20-map.js`, `21-map-art.js`):
- `motor-valle/geo/fetch.py` baja datos abiertos: calles, ciclorrutas, Metro, tranvía, ríos, quebradas, parques y municipios de **Overture Maps**
  (datos de OpenStreetMap, licencia ODbL) con DuckDB, y el relieve de **Terrain Tiles** (AWS Open Data, SRTM). Caché en `motor-valle/geo/cache/` (no se sube).
  Para el bucket público hay que correrlo sin credenciales AWS: `env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY python3 motor-valle/geo/fetch.py`.
- `motor-valle/geo/build.py` hace la cuadrícula: **1 casilla = 10 m** desde v1.3.0 (antes 20 m), 4316×4921 casillas (lon −75,70…−75,31, lat 6,46…6,015), fila 0 = norte. Ver *v1.3.0* más abajo.
  - Rasteriza vías por clase y ancho (autopista, avenida, calle, ciclorruta al lado de la vía, andén, escaleras), agua con puentes, parques, zonas urbanas,
    potreros y monte; adelgaza las calles (número de Yokoi, 4 subcampos) para que no queden bloques de asfalto; fuera de los 10 municipios todo es montaña.
  - Saca líneas en JSON: carriles de carros (troncales, primarias y secundarias encadenadas), 758 semáforos (cruces de vías principales),
    Metro A y B y Tranvía de Ayacucho siguiendo la vía real, y el río Medellín.
  - Salida: `src/data/valle.bin` (casillas + relieve cada 80 m + municipio y comuna cada 8 casillas, deflate) y `src/data/valle.json`. ~700 KB + 110 KB.
  - `tools/build.js` los incrusta en el HTML (`VALLE_BIN` en base64 y `VALLE_META`). El juego descomprime con `DecompressionStream` o con `inflateRaw` propio (≈0,2 s).
- `19-lugares.js`: **estaciones con lat/lon** (`ESTACIONES`: id, nombre, municipio, lat, lon, tipo m/a, demanda, zona del Apoyo), `LUGARES` (45 postales),
  `APOYO_ZONAS` (Poblado 7, Vegas 5, AMVA 7, Laureles 4, Aeropuerto 2, Carabobo 2, Sabaneta 10, Itagüí 10, Envigado 13, Bello 5),
  `CORREDOR_E` (estaciones del corredor eléctrico), `PUNTOS` (Casa EnCicla en el Parque de Malibú, parqueadero de la Terminal del Norte,
  Puente Pandequeso, Suramericana, Campus Nacional, taller) y `CABLES` (Metrocable con posiciones aproximadas).
  **Las posiciones de las estaciones son aproximadas por barrio: cuando llegue la lista oficial, solo hay que cambiar lat/lon aquí** (`carveStation` las acomoda en 4×2 casillas junto a una vía).
- `20-map.js`: carga (`load()` asíncrono en el arranque), relieve (`elevT`, `elev`, `slope`), `muniAt`/`comunaAt`, semáforos (`lightIdx`), carriles (`lanes`, `lanesNear`, polilíneas con `at`/`project`),
  rutas Dial **en ventana** (`flow(tx,ty,truck,fx,fy)` mira solo el rectángulo destino+origen ±90 casillas; `fv(F,x,y)` lee el campo; `fx=-1` = todo el mapa, solo para pruebas).
- **Dibujo:** las calles se "autoajustan" (asfalto de ~10 m en el centro de la casilla, andenes a los lados); cada bloque de 32×32 casillas se dibuja una vez y se le aplican
  **sombras del relieve** (luz del noroeste) y curvas de nivel en el campo (`relief()`), que es la parte de "dibujo 2D" sobre el pixel. El minimapa va a mitad de resolución (`miniK = 2`).
- **Sin temblor:** la cámara es continua. El búfer pixelado del suelo mide vw+1 × vh+1 y `View.present` lo corre por la fracción de pixel (`subX/subY`).
  Todo lo que se mueve (jugador, carros, trenes, tranvía, cables, partículas, lluvia, noche, luces) se dibuja en `Ride.renderTop` directamente en el canvas de pantalla,
  con posiciones decimales y giro suave. **No volver a dibujar objetos que se mueven en el búfer pixelado.**
- **Pendientes** (como Run Scooter): `Ride.update` mide la pendiente en la dirección de avance (±40 m). Bici: velocidad × clamp(1 − 2,2·pendiente, 0,5, 1,32);
  camión: × clamp(1 − 0,9·pendiente, 0,7, 1,12); bici eléctrica (`ride.ebike`, estaciones de `CORREDOR_E`) no pierde velocidad en subida.
  En bajadas de más de 7 % a más de 112 % de la velocidad máxima hay que soltar el dedo: a los 3,2 s la bici "se desboca" (aturdida 0,5 s). Aviso ▲ SUBIDA / ▼ BAJADA sobre el ciclista.

*Oficios reales* (`52-oficios.js`, minijuegos nuevos en `46-mg3.js`):
- `ShiftMode` juega un turno por **fases**: `{name, from, to, tasks}` (tareas en el mapa con hora límite, opcionales `opt`, en orden `ordered`, con condición `can`)
  o `{mg, secs}` (un minijuego a pantalla completa). Entre fases el reloj salta (sello ⏩). `timed` = la fase dura un tiempo fijo y en ella aparecen avisos (`spawn`, `every`, `maxDyn`).
  El reloj de cada fase se calcula con el recorrido estimado (`calRate`). Red de seguridad: ninguna fase dura más de 240 s reales.
- Anfitrión T1: tula a las 5:00, abre 2–5 automáticas cercanas + la suya (apertura con inventario) antes de las 5:30; ventanilla (MGAnfitrion: saca la bici, la entrega y
  **ajusta el sillín** a la estatura, `seatMove`/`seatOk`). T3: ventanilla, a las 21:00 solo devoluciones hasta las 22:00 (`returnsOnly`), inventario y cierre de su estación, y cierre de 2–5 automáticas antes de las 22:30.
- Apoyo: zona elegida en el briefing (`o.zona`). T1 abre todas las automáticas de la zona antes de las 5:30, relevos (2–5) de 8 a 12 e inventarios de control opcionales (`MGConteo`).
  T3 relevos de 16:00 a 20:30 + inventarios, y cierre de la zona a las 22:00.
- Supervisor: T1 arma tulas (`MGTulas` modo armar: llave del color + celular con batería) en Casa EnCicla a las 4:00, las entrega en carro a las 5:00 y luego atiende avisos
  (relevo, bicis con falla, usuario inconforme, semáforo dañado, celular descargado, visita al anfitrión). T2 avisos + inventarios. T3 avisos, recoge tulas a las 22:30 y carga celulares (`MGTulas` modo cargar).
- Técnico: fallas de tótem (Laser/Simon), LED de anclajes (Loop/Simon) y celular (Cables); los celulares de las estaciones físicas pierden batería (los "medio malos" el doble):
  se lleva un power bank (máx. 3, se recargan en Casa EnCicla). Meta: ningún celular apagado.
- Bodega: `MGBodega2` en 4 pasos (descargar, verificar etiqueta/golpes, organizar en estantes, cargar el pedido exacto) y luego manejar el camión al taller.
- Mecánico: reparación (MGMecanico con diagnóstico) y ensamble (`MGEnsamble`: marco, ruedas, manubrio, cadena, sillín, frenos, luces; las tuercas se aprietan en la zona verde).
- Balance: capacidad 14 (40 en el camión especial). T1 sale del parqueadero de la Terminal del Norte con una de 4 rutas de tulas (supervisor jefe a Suramericana, universidades,
  Puente Pandequeso, Sabaneta/La Estrella) y luego balancea; recoge **bicis dañadas** que van al taller (`sim.shop`). T2 corredor Campus Nacional–Suramericana–Estadio + tanteo del sur.
  T3 balanceo nocturno, recoge tulas, las entrega en Casa EnCicla y guarda el camión en la Terminal del Norte.
- Monitoreo: sala de control (`ModeMonitoreoR`: cada hora aparece la verificación de inventario, hay que encontrar la estación que no cuadra) y atención al cliente
  (`MGLlamadas`: sanciones, errores de préstamo, inscripciones; casos en `CASOS`).
- **Supuestos que hay que confirmar con el usuario:** ubicación de la bodega (`PUNTO_BODEGA`, Guayabal) y del taller (junto a Casa EnCicla), horarios de Monitoreo y de los turnos 2 y 3 de Balance,
  y cuántos relevos/inventarios se exigen. El usuario dijo que luego confirma horarios, la lista oficial de estaciones, más puestos y la historia de los personajes.

*v2.0.1 · Motor del Valle 1.2.0*: `motor-valle/js/valle.js` va dentro del HTML (lo agrega `tools/build.js`) y expone `Valle` (y `JE.valle`, `MotorValle`), con `Valle.version === '1.2.0'` y `Valle.elmetro`. Las dos copias del motor se comparan con `node motor-valle/sincronizar.mjs RUTA --verificar`.

*v2.0.0 · La revolución* (`94-revolucion.js`, `91-runner.js`, `91-taller-arte.js`, `92-ciclovia.js`, `92-vehiculos.js`, `93-trama.js`, `contenido/guion/fragmentos.json`):
- **Carreras en el menú:**
  - `ModoRun3D` y `ModoCiclovia` (`extends ModeSub`) se registran con `JE.modos.registrar`, con 3 niveles cada una.
  - `ModoRun3D` envuelve a `MGRunner3D`, con el corredor, la meta y la duración de cada nivel.
  - `ModoCiclovia` envuelve a `CarreraCiclovia` sobre `TramoCiclista.cercana`, la ciclorruta de 100 m o más más cercana al hito del nivel. Termina sola al llegar a 2,5 veces su meta.
- **`JE.taller`:**
  - `abrir(M, resultado)` pinta en un modal la escena de TallerValle y los vehículos de `vehLista()`, con su dibujo de lado.
  - `ARTE_VEH` traduce los ids del registro a los de TallerValle.
  - Las acciones `vehiculo` y `runner3d` se quitan y en su lugar queda una sola: `taller`.
- **`JE.boleto`:**
  - Lleva los pasos de `GUION.fragmentos`, con eventos `montar`, `carrera` y `visitar`, en `Save.data.flags.fragmentosCiclovia`.
  - `marca(M)` pone la señal y el marcador.
  - Todo `runSub` de `MGRunner3D` o de `CarreraCiclovia` cuenta sus hojas para el boleto.
- **`Ride.chipGiro(c, x, y, k, texto)`:** el aviso del giro, con la flecha dibujada.
- **Botón de velocidad:** muestra `×valor`, con la clase `ritmo`.
- **`MGRunner3D.pieUI()`:** el espacio de los controles en px del búfer.

*v1.7.2 · Terreno para lo nuevo* (`25-vehiculos.js`, `91-modos.js`, `83-guion.js`, `contenido/guion/misiones.json`, `docs/INTEGRAR.md`):
- **`VEHICULOS` y `JE.vehiculos`:**
  - `registrar(id, def)` hereda de su base (`bike`, `walk` o `truck`). Lee `fis`, `suelo(t)`, `loma`, `asist`, `solido(t)`, `via`, `spr(R)`, `lado(...)`, `timbre`, `bajar`, `libre` y `gasto`.
  - `mejorar(id, partes)` cambia el arte de uno de siempre, sin su física.
  - `usar(id)` sube al jugador; `libres()` lista los que se eligen en el modo libre.
  - El código consulta el registro con `vehStats`, `vehDef` y `vehVia` en `stats_`, `solidAt`, `update` (suelo y loma), el GPS, el bot, `renderTop0`, la vista panorámica, `getOff`/`getOn` y la energía del modo libre.
- **`JE.modos`:**
  - `registrar({ id, name, cls, niveles, how, desc, emoji })` crea `ROLE[id]`, con `juego: 1` y los niveles como `shifts`, y `MODE_CLASS[id]`.
  - El panel va en Ruta, debajo de la carrera de postales.
  - `isJuego(id)` deja fuera del escalafón la racha, las mejoras y los logros «Aprobado» y «Turno perfecto».
  - `quitar(id)` lo retira.
- **`guionMisiones(now)`:**
  - Toma de `GUION.misiones` una o dos misiones por día, con la semilla de la fecha, según `dias`, `desde`, `hasta` y `req`.
  - Son de tipo `visita` hacia un id de `LUGARES` o `[lat, lon]`.
  - Al cumplirlas se guardan en `Save.data.tramaHechas` (la v1.7.2 usaba `Save.data.trama`, que ahora es de «Ruedas y Rieles»; se pasa sola) y `Save.data.huevos` y se ven las frases de `despues`.
- **Interfaz:**
  - `Cam.lugar()` pone los botones de la cámara entre las metas y el control, en fila si no caben.
  - `#actBar` pasa a la izquierda del minimapa cuando no cabe debajo.

*v1.7.1 · El sistema metro como en El Metro y la guía discreta* (`74-sistema.js`, `76-altura.js`, `35-life.js`, `75-graficos.js`, `30-ride.js`, `motor-valle/geo/metroplus_elmetro.py`, `src/data/metroplus.json`):
- **`SisSpr`:**
  - `veh(g, kind, L, W, col, o)` es el `Spr.veh` de El Metro (metro, tranvía, `brt` y cable), en px, mirando a +x;
  - `img()` lo guarda en caché a 4× y `dib()` lo dibuja girado y escalado (la altura en perspectiva).
- **Medidas (`SIS`)**, en metros y con `PXM = 1,6` px por metro:
  - metro: vagón de 22 × 3, 3 vagones y andén de 110;
  - tranvía: 19,5 × 3, 2 coches y andén de 50;
  - Metroplús: bus de 18 × 2,5 y andén de 30;
  - cable: a 14 m, torres cada 260 m y cabinas cada 60 m.
- **Dibujo:**
  - `altMetro` hace el viaducto y las estaciones;
  - `altHall` arma el edificio de acceso sin las calles que pasan por debajo;
  - `sisBanda`/`sisMuro` son franjas y muros a lo largo de una polilínea, con altura;
  - `altVagones`/`altTrenes` ponen los trenes por su vía, recortados a cada pieza del viaducto;
  - en el suelo (sección 7 de `drawGround3`) van el tranvía y el Metroplús;
  - `drawSky` dibuja el Metrocable;
  - `updBrt` y `drawGround` mueven y dibujan los buses articulados.
- **Metroplús real (`CityMap.mpReal`, antes de `mpAjusta`):**
  - corredores de las Líneas 1 y 2 y andenes de El Metro (metros del mapa del valle × 1,6);
  - el corredor de OSM (`P.osm`) no se ajusta a la vía del dibujo;
  - la estación se corre a lo sumo 12 px de su andén real.
- **Guía (`render` y `hud` en 30-ride.js):**
  - flechitas cada 13 px sobre la ruta suavizada (`chaikin`), con opacidad que baja con la distancia (hasta 230 px);
  - baliza tenue en los marcadores;
  - flecha fuera de pantalla al 85 %;
  - `Ride.giro()` da el próximo giro de más de 40° a menos de 200 m, o la llegada a menos de 60 m.

*v1.7.0 · Alturas, cámara, manejo con peso, velocidad y paseo* (`motor-valle/geo/alturas.py`, `src/data/alturas.json`, `76-altura.js`, `88-camara.js`, `89-paseo.js`, `30-ride.js`, `00-core.js`):
- **Datos:**
  - `fetch.py` baja `puentes.parquet` (vías con `road_flags`/`level_rules`) y `rail_niveles.parquet` (rieles con `rail_flags`);
  - `alturas.py` escribe en `alturas.json` los tramos del metro en viaducto (puntas, en casillas ×8) y los puentes (tipo de vía, nivel, largo y trazo);
  - `build.js` lo mete como `ALTURAS`.
- **En el juego (`CityMap.alturas`):**
  - Los tramos del metro se proyectan sobre `lineA`/`lineB` (`L.alto`, `L.zAt(s)`, con rampas salvo donde la línea termina en el viaducto).
  - Las estaciones de un tramo alto llevan `st.alto` y `st.z`.
  - Cada puente se empareja con la vía del dibujo (`chProj`) y se corta de ella (`chCorta`/`chNueva`), así el suelo ya no lo pinta.
  - Lo elevado se parte en piezas de 36 px (`altPieza`) que entran en `draw3D` ordenadas con los edificios y se dibujan con `altoPieza`: pilares, costados que miran a la cámara, losa, rieles o barandas, trenes recortados a la losa y la caja de la estación.
  - En el suelo (`altSuelo`) quedan las sombras y las bases de los pilares.
  - El agua de la capa del río incluye las casillas de puente.
- **Nivel del jugador (`Ride.nivel`):**
  - `P.lvl = 1` si entró por un extremo del puente, alineado con él, o si va sobre el río; si no, va por debajo;
  - el jugador de abajo se dibuja antes que `draw3D`, con su silueta encima;
  - el de arriba, y los carros del puente (`nivelCarros`), se dibujan en `drawArriba` con su altura;
  - la cuadrícula no cambia: el bot, el GPS y la física siguen igual.
- **Metroplús (`CityMap.mpAjusta`):**
  - el trazado se lleva al eje de su vía (en doble calzada, al punto medio entre las dos, si van en el mismo sentido);
  - cada estación busca, a ±42 px de su punto real, el tramo más recto y con más calzada (`st.x`, `st.y`);
  - las cifras quedan en `JE.map.mpInfo`.
- **Cámara (`Cam`):**
  - `Save.data.settings.cam = {z, t, r, sigue}`;
  - `View.zf` es el zoom continuo (solo en 3D);
  - `View.rotOn`/`View.rot` giran la vista:
    - el búfer del suelo es un cuadrado de lado `gw` (la diagonal) y `present` lo gira;
    - `Ride.mundo(c)` pone la transformación del mundo en la capa nítida;
    - `w2s`/`s2w` convierten entre mundo y pantalla;
    - `girarDir` gira el joystick al mundo.
  - **Inclinación (`Ride.ojo`):**
    - corre el punto de vista de la perspectiva `D = 43,2·tan(t·0,96)/K` hacia abajo de la pantalla, con `K = 0,36·(1 − 0,3t)`;
    - las paredes que miran a la cámara y el orden de dibujo salen de ese punto.
  - **Gestos:**
    - dos dedos: zoom y giro juntos, o inclinación si suben o bajan juntos;
    - en cámara libre, un dedo mueve la cámara;
    - ratón: rueda y botón derecho.
  - **Calidad automática (`Calidad`):** baja `View.calidad` de 1 a 0,8 o 0,6 si la mediana de 2 s pasa de 30 ms, y la sube tras tres ventanas bajo 18 ms.
- **Manejo (`stats_`):**
  - `max`, `acc`, `brk`, `coast` en px/s²; `w0`/`w1` son la velocidad de giro parado y a toda marcha, y `tw` la inercia del giro;
  - `VEL = 1` y `RELOJ = MS / VEL`;
  - la velocidad elegida (`settings.vel`, `velMul(M)`) multiplica la punta y divide el reloj; en carrera y en red, 1.
- **Paseo (`Paseo`):**
  - usa `botDrive()` con una parada frente a cada lugar (`nearestOpen`) y salta al siguiente si en 25 s no se acerca;
  - cambia de plano cada 9 s y devuelve la cámara del jugador al terminar.

*v1.6.0 · Emblemáticos y auditoría de El Metro* (`motor-valle/geo/sitios.py`, `22-sitios.js`, `20-map.js`, `87-placas.js`, `tools/auditoria-mapa.js`):
- **Partes (`SIT3`/`SIT4`):** prismas entre los pisos `z0` y `z1`, con su anillo de abajo `B` y, si los muros se inclinan, el de arriba `T` (mismos vértices; no se quitan puntos repetidos, para que una aguja pueda converger en un punto).
  - Se calculan con shapely: `ejes()` (rectángulo mínimo), `escala()`, `caja()` y `adentro()` (*buffer* negativo).
  - Las recetas van por nombre (`emb(rx, fn)`); `torres()` pone una o dos torres en el extremo que mira al parque más grande y cercano (`frente()`).
  - Los suelos (plaza de ladrillo y patio de rieles con su ángulo) van en su propia sección.
- **Dibujo (`sitEdif3D`):** el cuerpo (si `fl > 0`), y luego las partes de abajo hacia arriba (`sitParte3D`).
  - Un muro se ve si la cámara, a la altura `1/K`, queda del lado de su normal 3D.
  - Techos: `jardin`, `cupula` y borde.
  - Ajedrezado de muros con `sitCuadros` (interpolación bilineal).
- **Lugares:**
  - `PUNTOS` en `sitios.py` nombra las huellas que no tienen nombre en los datos (por su coordenada mirada en el satélite);
  - `SIT_NOMBRE` ubica cada lugar sobre su edificio real;
  - `paintLandmark` respeta las casillas de un edificio real cuyo centro queda fuera del lugar (`sitBE`).
- **Río y agua (`rioCorrido`, `limpiaManchones`):**
  - regresión isotónica decreciente sobre el perfil del cauce, quemada en las cuatro esquinas del relieve de cada punto;
  - los huecos junto al agua pasan a agua o puente;
  - los manchones de 1 a 4 casillas en plena ciudad pasan a lo que los rodea.
- **Otros:**
  - `Cal.metro(d)` da el horario del Metro y `Ride.metroOn()` detiene los trenes fuera de servicio;
  - CSP y `referrer` en `src/index.html`;
  - `sinProto` en todo `JSON.parse` de datos externos.

*v1.5.0 · Medellín desde el aire: sitios reales* (`motor-valle/geo/sitios.py`, `src/data/sitios.bin` y `sitios.json`, `22-sitios.js`, `docs/MEDELLIN-DESDE-EL-AIRE.md`):
- **Datos:**
  - `fetch.py` baja `edificios.parquet` (nombre, clase, pisos y forma de techo de Overture) y `lugares_poi.parquet` (lugares; de ahí salen las alcaldías).
  - `sitios.py` arma:
    - las áreas (land_use: universidad, colegio, hospital, templo y estadio) con los edificios cuyo centro cae adentro;
    - los edificios sueltos importantes (por nombre o clase);
    - todas las canchas (rectángulo mínimo y tipo por tamaño), pistas, piscinas y plazas.
  - Escribe `sitios.bin` (deflate) en unidades de 1/8 de casilla; cada anillo es `n, x0, y0` y luego `dx, dy` (i16).
  - Los techos de teja y de dos aguas llevan su polígono de cumbreras, precalculado con un `buffer` negativo (con patios).
  - Los estilos se curan por nombre en `CURADO`, mirando las fotos aéreas.
- **Carga y física (`CityMap.parseSitios`, `rasterSitios`), antes de colocar estaciones y lugares:**
  - dentro de un área, lo construido de relleno (ladrillo, edificio y, en campus, plaza o andén) pasa a prado (campus y estadios) o a plaza (los demás);
  - las plazas reales vuelven a plaza;
  - cada edificio real es `BLDG` (`sitB`) y lleva un andén alrededor en los campus;
  - `sitT` (casilla → sitio) evita que los lotes de relleno y las casas del interior se monten encima, y duplica los árboles;
  - `sitG` indexa por trozo los sitios, edificios, canchas, pistas y piscinas;
  - `carveStation` no pone estaciones sobre `sitB`.
- **Lugares con postal (`sitLugares`, `SIT_NOMBRE`):**
  - si el edificio o sitio real con ese nombre está a menos de 600 m, el lugar se ubica sobre él y pasa a `L.real`, sin dibujo a mano ni sólidos;
  - las iglesias de pueblo pasan a reales si hay un templo real a menos de 250 m;
  - `sitOcultar` esconde lo real bajo los lugares que siguen dibujados a mano.
- **Dibujo:**
  - `sitSuelo` pinta las canchas, pistas y piscinas, bajo las calles;
  - los edificios de 1 o 2 pisos van con el suelo (`sitEdifSuelo`, como las casas);
  - los de 3 o más van en `draw3D` (`sitEdif3D`): paredes que miran a la cámara (de la más lejana a la más cercana), techo par-impar con patios y faldones de teja con su luz;
  - techos especiales: helipuerto, aguja, cúpula y ajedrez;
  - `sitNombres` pone el nombre de los sitios grandes.
- **Ambiente:**
  - en ladera (pendiente del trozo > 10 %), más plancha y ladrillo, y hasta 4 pisos;
  - en El Poblado, Envigado, Sabaneta e Itagüí, torres de ladrillo;
  - en El Poblado, Laureles y Envigado (`verdeZ`), jardines entre las torres y más árboles.

*v1.4.0 · Ciudad suave: curvas, no cubos* (`75-graficos.js`, `75-lugares3d.js`, `20-map.js`, `30-ride.js`, `35-life.js`, `motor-valle/geo/build.py`):
- **Suelo:** `CityMap.contorno` saca cada capa (monte, pasto, plaza, parqueadero, manzana, edificio, orilla, agua) como contorno vectorial: cuadrícula con 2 casillas de margen → suavizado [1 2 1] dos veces → media casilla (bilineal) → marching squares en una sola ruta; las celdas llenas seguidas salen como un rectángulo. El relieve va en `ImageData`, una muestra por casilla.
- **Calles (`drawGround3`):** andén y sardinel como trazos a lo largo de cada cadena (`SWK` por tipo), asfalto por grupos de ancho, bordes, separadores, líneas y cebras. Las quebradas (tipo 9 de `vias.bin`) son un hilo de agua en su retiro verde.
- **Lotes (`CityMap.lotes`, caché `lotC` de 64 trozos):** frente según los lotes catastrales (`LT`), hasta 3 filas por lado, prioridad fija `[fila, tipo de calle, calle, lado, número]` y descarte por traslape (SAT en celdas de 32 px con clave numérica): todos los trozos llegan al mismo resultado. Ningún lote pisa los corredores del metro, del tranvía ni del Metroplús (`_trG`); `build.py` también los despeja de casas. Las casas del interior toman la dirección del tramo de calle más cercano (`rumbo`, tramos por celda de 32 px, a menos de 48 px).
- **Volumen:** casas con techo levantado según sus pisos y fachadas al sur, dibujadas en el suelo (sin costo por cuadro); edificios extruidos por cuadro en `draw3D` (pared solo si mira a la cámara, líneas de piso, techos de `techoL`).
- **Lugares (`75-lugares3d.js`):** `lmPartes()` arma, una vez, los cuerpos de cada lugar (`ed`, con techo propio `t`: `dos`, `cuatro`, `aguja`, `cupula`, `claustro`, `claraboya`, `flores`, `dientes`, `ajedrez`, `encicla`, `roca`, `focos`, `escalera`, `jardin`) y sus casas (`casas`); `lugar3(c, L, i, fase)` dibuja el suelo (fase 0, bajo las calles) y lo de encima (fase 1: árboles, esculturas, postes, buses, aviones, rueda de Chicago, cruces). `draw3D` ordena las partes de un lugar juntas y de las bajas a las altas. En modo pixel siguen los dibujos de `21-map-art.js`.
- **Cuerpos que no tapan calles (`paintLandmark`):** el grupo de cuerpos sólidos se corre dentro del lugar (10 por casilla de calle tapada, 1 por casilla corrida) y, si aún tapa, se recortan los bordes que caen en la calle (mínimo 2 casillas); `L.sdx`, `L.sdy` corren también el dibujo pixel. En los lugares de tierra (`LM_TIERRA`) cada cuerpo se corre hasta 16 px o no va, y las casas sobre una calle no van.
- **Todo suave en 3D:** estación EnCicla (`estacion3`: plataforma, anclajes y bicis a su tamaño; antes salían ×4), ruta GPS (línea con Chaikin y hormigas), aros de destino, semáforos, conos de ciclovía, peatones, tranvía, metro (`Art.trainCar` dibujado) y Metrocable. De noche brillan los postes del Parque de las Luces, el estadio, los atrios y los parques.
- **Regla aprendida:** en código compacto de una línea nunca va un comentario `//` en la mitad (se come el resto de la línea); se usa `/* */`.

*v1.3.0 · Mapa de 10 m con datos oficiales* (`motor-valle/geo/oficial.py`, `motor-valle/geo/build.py`, `20-map.js`, `75-graficos.js`, `85-direcciones.js`, `86-maqueta.js`):
- **Casillas de 10 m.** `TILE` y `S = 20 / TILE` escalan radios y ventanas en `build.py`; en el juego, `MS = 20 / VM.tile` escala las búsquedas en casillas (estaciones, lugares, rutas, minimapa, etiquetas del mapa grande). Lo que se mide en px (velocidades, radios de marcas) no cambia: la ciudad mide el doble en px y las cuadras se recorren como cuadras.
- **Relleno de manzanas:** huella de edificio → casa (ladrillo) o edificio según pisos, área y zona; dentro de la manzana oficial, el hueco es la casa vecina o patio; fuera, andén o espacio público. Si una zona no tiene huellas, se usa la regla antigua.
- **Formato v3:** `valle.bin` = casillas + relieve + municipios + comunas + barrios (u16) + pisos (u8) + área de lotes (u8, ×4 m²), en celdas de 8 casillas. `vias.bin` por vía: tipo, nombre, nomenclatura oficial, ancho (medios metros) y puntos en cuartos de casilla (`VM.vq`).
- **Estaciones:** búsqueda en espiral desde el punto real y BFS con memoria (`_cn`: 1 conectado, 2 encerrado).
- **Dirección y misión «¿Dónde queda?»:** `CityMap.calleAt` y `CityMap.esquina` (cruce de una «Calle» y una «Carrera» con nomenclatura oficial). La marca aparece a los 75 s.
- **Maqueta 2:1** (de El Metro): `JE.maqueta.render` dibuja por columnas con búfer de altura; el mapa grande la guarda en caché y baja la resolución si un dibujo pasa de 70 ms.

*v1.2.0 · Mapa reconocible, como en un mapa real* (`motor-valle/geo/build.py`, `src/data/vias.bin`, `75-graficos.js`, `84-mapa-vivo.js`):
- **Calles exactas.** `build.py` exporta cada vía de OpenStreetMap como vector (`vias.bin`), y el juego las dibuja desde ahí en vez de rastrearlas en la cuadrícula.
  - Formato de cada vía: tipo, nombre y puntos cada 2,5 m. Las vías del mismo nombre se unen.
  - Tipos: 1 calle, 4 carrera, 2 avenida, 3 autopista, 6 peatonal, 7 escalas, 8 sendero. Hay 32.785 vías y 2.607 nombres.
  - La física solo toma el eje de calles y carreras (`rp`), así las manzanas no se comen.
- **Peatonales limpios.** Los andenes y cruces trazados como líneas no se pintan. Los senderos solo van en parques, plazas y monte, y las vías de servicio sin nombre (parqueaderos, entradas) no son calles.
- **Nombres.**
  - Calles: sobre la calzada y en el sentido de la vía, cada ~1 km; se ven en el juego y en el mapa grande de cerca.
  - Barrios y veredas: 672 nombres, a partir de los puntos de Overture asignados a celdas de 8 casillas (`ba`). Aparecen al entrar (barrio · comuna · municipio) y en el mapa grande.
- **Casas en fila.** Los barrios residenciales son casas (ladrillo), salvo el centro, El Poblado, el comercio, la industria y los corredores de avenida (`nearAve`), con un 8 % de edificios sueltos.
  - Cada casilla son dos lotes de ~10 m con el frente hacia la calle, con teja, losa, tanques o ropa tendida.
  - Se dibujan en el suelo, sin costo por cuadro; las cajas 3D quedan para los edificios.
- **Estaciones en su punto.** Se colocan antes que los lugares, acostadas (4×2) o de pie (2×4). Pueden montarse sobre hasta 2 casillas de calle menor, con castigo. Quedan típicamente a 46 m, el 90 % a menos de 101 m.
- **Vida:** parqueaderos con carros, postes, árboles de avenida con guayacanes, bancas, palomas que vuelan al pasar, sombras de nubes y brillos en el río.
- **Ni una gota:** misión diaria del modo libre: llevar un tinto a otra estación sin chocar. Si chocas, se riega y se recarga en cualquier estación; la entrega da un logro secreto.
- **Corrección:** el avance de *Un día del valle* se guarda en `Save.data.diaValle`. `Save.data.dia` es de las misiones del modo libre; antes chocaban, y la migración es automática.

*v1.1.0 · Guion C-99 y mapa pulido* (`83-guion.js`, `contenido/guion/`, `docs/AUDITORIA-C99.md`):
- **Un día del valle** (`Dia`, `DIA`, `Save.data.dia`): 16 capítulos en orden, de las 4 a. m. al cierre.
  - Cada capítulo juega un turno real con sus diálogos (`antes`, `despues`, `fallo`, `consejo`). El capítulo viaja en `Game.meta.dia`, también al repetir.
  - El 16 es el epílogo de los 15 años: una escena y el logro *Un día del valle*.
  - No depende del escalafón y aparece primero en la pantalla de Historia.
- **La ciudad habla:** cada 7 a 14 segundos, un peatón cercano dice una frase del contexto (`Ciudad.ctx`): lluvia, fiesta, ciclovía, estación o la hora. Usa `Math.random` y no el azar de la partida, para no romper retos ni multijugador.
- **Tutor y fiestas:** consejo del oficio en la ficha del turno; saludo de un personaje al entrar al modo libre en día de fiesta.
- **El Metro:**
  - Rosalba en Niquía de 4:00 a 4:29 a. m. (logro secreto *Antes del primer tren*) y sus frases al terminar el Maquinista secreto.
  - Cumpleaños del Metro el 30 de noviembre y enlace a *El Metro* en los créditos.
- **Horario especial** (`HORARIO_ESP` en `80-limpieza.js`): el Museo de Antioquia cierra a las 5:30 p. m. y el Área Metropolitana a las 7 p. m. `stOk` las cierra y el mapa las oscurece.
- **Escenas** (`Cine.show`, `Cine.paseo`, `Cine.charla`): las tomas se arman con piezas reutilizables.
- **Mapa:**
  - `CityMap.vectorize` adelgaza las zonas anchas de calle (Zhang-Suen) antes de rastrear: 60 % menos tramos y sin planchas de asfalto.
  - `CityMap.cov` es la huella de las calles: en pixel, el asfalto solo va bajo una calle y lo demás se ve como plaza.
  - Las rayas siguen el eje de cada tramo.
  - `CityMap.zebras`: una cebra por calle que llega a cada semáforo, perpendicular a ella.

*v1.0.5 · Préstamo EnCicla en el modo libre* (`82-prestamo.js`, `Cuenta`, `Save.data.encicla`):
- Con bici de EnCicla el reloj va más lento (`rate` 0,55: una hora ≈ 2 minutos), el préstamo se renueva cada hora con el botón **Renovar** cerca de una estación
  (solo mientras se presta) y se respeta el horario: al cierre la bici debía estar devuelta (sanción y fin de la sesión). Con bici propia el modo libre es de 24 horas (`rate` 0,9).
- Renovar o devolver tarde gasta uno de los **10 strikes**; sin strikes, **suspensión** de 3, 7, 15, 30 y 60 días (fechas reales): mientras dura, el modo libre es con bici propia.
- **Bici abandonada:** si te bajas y te alejas más de 30 m, alguien (anfitrión, funcionario del Área o usuario) puede reportarla: el reporte negativo queda para siempre
  y te quedas sin bici. La ficha del modo libre muestra el estado de la cuenta.

*v1.0.2 · Limpieza, accesos rápidos y creador al empezar* (`80-limpieza.js`):
- **Limpieza** (oficio 7, brigada mensual 9 a. m.–5 p. m., SUPUESTO): dos supervisores y el anfitrión limpian el habitáculo de 3 estaciones con anfitrión. `MGLimpieza`: elegir herramienta
  (escoba: polvo y hojas; trapero: manchas del piso; paño: vidrio y mostrador; bolsa: basura) y tocar lo sucio; la brigada limpia también. Metas: los 3 habitáculos, impecables, máximo 2 errores.
- **Accesos rápidos** en el inicio: Mi ciclista, Historia, Personajes, Ranking, Amigos y Retos.
- **Creador al empezar:** si no hay personaje, se abre al entrar al inicio o a una ficha. La app de Android ya no restaura datos viejos al reinstalar (`allowBackup=false`).
  En Mi ciclista: «Empezar con un personaje nuevo» (borra el progreso).

*v1.0 · Piloto: ciudad 3D, calles rectas, mapa interactivo, interfaz limpia* (archivos 75, 77, 78 y 79):
- **Calles rectas** (`CityMap.vectorize`, al cargar): la red de vías y de ciclorrutas se rastrea casilla por casilla, se simplifica a tramos rectos (Ramer-Douglas-Peucker, tolerancia 0,95 casillas)
  y se guarda en `CityMap.chains` con un índice por celdas (`chainsNear`). Las casillas bajo cada tramo pasan a ser vía, para que la física siga la misma línea que se dibuja.
  Antes, `CityMap.bridge` une puntas sueltas de calles (hasta 3 casillas) y de ciclorrutas (hasta 5), y vuelve andén los retazos de ciclorruta de 1 o 2 casillas.
- **Ciudad 3D** (`GFX() === '3d'`, por defecto; Más > Gráficos: Ciudad 3D o Pixel clásico): suelo dibujado con andenes en losas, sardinel, asfalto, bordes y línea de centro
  (amarilla en avenidas, blanca en autopistas), cebras en los semáforos, ciclorrutas verdes, árboles con sombra, sombras de edificios y metro elevado.
  Los edificios (`CityMap.blocks`: rectángulos por manzana de 4×4 casillas y casas de 2×2) se dibujan en cada cuadro con **perspectiva desde el jugador** (`Ride.draw3D`):
  muros con pisos, techos con tanques, aires y helipuertos; más altos en el Centro, El Poblado y los centros municipales (`TALL`). De noche las ventanas se encienden.
  La cámara se acerca más (`View.apply`: divisor 128) y los vehículos se dibujan al 74 % (`SPRK`), para que las calles se sientan anchas.
- **NPC con rutas** (`78-ciudad-viva.js`): ciclistas y peatones eligen un destino (una estación) y avanzan casilla a casilla por toda la red (`npcNext`/`npcMove`):
  ciclistas por ciclorrutas y calles (por la derecha), frenan en rojo, ante el jugador y ante otros; peatones por andenes, plazas y parques, y cruzan la calle.
- **Mapa grande** (`MapView`): se abre tocando el minimapa; se arrastra, se acerca con dos dedos, rueda o botones + y −, ◎ vuelve a tu posición y ✕ lo cierra.
  Muestra municipios, metro con sus estaciones, lugares, estaciones EnCicla, tareas y la ruta. **Tocar el mapa marca un destino** (`ride.way`, como en los juegos de mundo abierto):
  la flecha, la línea punteada y el mapa lo siguen hasta que llegas o lo quitas. De cerca se ve la ciudad real; los bloques se cargan de a dos por cuadro.
- **Controles** (`81-controles.js`, `UI.controles`, botón en la pausa y en Más): joystick fijo (por defecto, también se puede arrastrar en cualquier parte), arrastrar, flechas grandes
  o **inclinar el celular** (`Tilt`: sensor de orientación; la posición al empezar es la neutra, botón Recalibrar). Lado (`settings.cside`) y tamaño (`settings.csize` 0-2);
  si el control va a la izquierda, la lista de tareas se corre (`Ctrl.leftGap`) y los botones de acción no suben (`ctrlR` solo a la derecha). El mapa grande se cierra solo al empezar, salir o terminar un turno (`MapView.reset`, `MapView.live`).
- **Interfaz** (`79-interfaz.js` y el bloque «tema limpio» de `style.css`): letras Fredoka (títulos, con eje de ancho) y Nunito (texto), ambas OFL; tarjetas y botones redondeados,
  sin trama, sin franjas ni etiquetas de revista. Inicio, ficha y portada con poco texto. Los avisos (`#coach`) salen al frente, debajo de las metas y del minimapa,
  y duran de 2 a 3,4 s; los mensajes (`UI.toast`) de 1,5 a 2,8 s; el aviso se oculta mientras hay un mensaje o el mapa grande abierto.
- **Piloto** (`77-piloto.js`): colores para daltonismo (Okabe-Ito, magenta en vez de rojo y etiquetas en los juegos de colores), retos con código y QR (`Reto`: `RC<postales><zona><rival>-<semilla>`
  o `RH<minutos>-<semilla>`, también como enlace `?reto=`), escenas de la historia (`Cine`) al aprobar un turno por primera vez, y **Bluetooth en la app de Android**
  (`BluetoothPlugin.java`, RFCOMM entre celulares emparejados, hasta 3 invitados; en JS cada conexión se comporta como un canal de datos de `Net`).
- Corredores eléctricos: San Cayetano está en los bajos de la estación Estrella del metro; Hospital Infantil en la calle 72A con carrera 48 (aproximados).

*v0.10 · Oficios nuevos, gráficos, vistas, música por estilos y mundo libre en red* (archivos 71 a 76):
- **Tutorial opcional con compañero** (`71-tutor.js`, `Tutor`): en la ficha de cada turno, botón «Con <compañero> (tutorial)». El juego se detiene mientras el compañero habla
  (burbuja con su retrato, «Entendido» o «Saltar tutorial») y en el mapa pedalea a tu lado. Pasos: saludo y oficio, moverse, la ruta, un consejo del oficio (`TUT_EXTRA`),
  la primera tarea (minijuego) y el cierre. Los mentores de la v0.9 se retiraron.
- **Pausas Activas** (`72-oficios2.js`, `ModePausas`, oficio 6, turno intermedio 9 a. m.–6 p. m.): como el Apoyo, recorre 4 estaciones con anfitrión; en cada una,
  `MGPausa` (inspirado en los juegos de baile): tarjetas de ejercicios llegan al círculo al ritmo; se responde deslizando o con las flechas ◀ ▲ ● ▼ ▶ y se mantiene oprimido en «Respira».
  Perfecto/Bien/Fallo, combo, ánimo del grupo y tres compañeros que imitan los movimientos. La música se sincroniza con la coreografía (`Snd.lock`).
- **Rescate** (`ModeRescate`, oficio 8, turno 8 a. m.–5 p. m., SUPUESTO): bicis reportadas fuera de las estaciones; se revisan (`MGHallazgo`) y se llevan
  **pedaleando con una mano y la otra bici en la otra mano**: equilibrio con inercia (curvas bruscas, terreno, bajadas) y ◀ ▶ a los lados para corregir; si pasa la raya, se cae y se daña.
  Las buenas van a la estación más cercana; las dañadas, a una estación con anfitrión para que Balance las lleve al taller.
- **Minijuegos nuevos del técnico:** tótem (`MGTotem`: medir con multímetro, cambiar la pieza y reiniciar en la zona verde), luces de los anclajes (`MGLeds`: prueba, marcar y soldar)
  y celular de la estación (`MGCelular`: power bank, reinicio, PIN de la tula y sincronizar).
- **Corredores eléctricos** (`CORREDOR_E`, `CORREDORES`): Floresta (mixta) – C4TA (solo eléctricas); Universidad de Antioquia (mixta) – Hospital Infantil (solo eléctricas);
  San Cayetano (mixta) – La Estrella (solo eléctricas); Pascual Bravo (mixta) – Hospital Pablo Tobón Uribe (solo eléctricas, ubicaciones aproximadas). Servicio eléctrico hasta las 7 p. m. (`E_HASTA`); las estaciones solo eléctricas cierran a las 8 p. m. (`E_CIERRE`).
  C4TA está en San Javier (antigua cárcel El Buen Pastor); Hospital Infantil y San Cayetano tienen posición APROXIMADA.
- **Día y noche de 24 horas** en el modo libre: el reloj sigue la hora real, cambia de día a medianoche, el tráfico depende de la hora y avisa antes del cierre de EnCicla.
- **Música por estilos** (`73-musica.js`): jazz (walking bass, ride con swing, acordes de 7.ª), lo-fi (crujido de vinilo, teclado suave, filtro), soft rock (rasgueo, bajo en corcheas)
  y electrónica (bombo a negras, bajo filtrado, pad con compresión lateral, arpegios). Automático: lo-fi en menús y paseos de día, jazz de noche, soft rock en los turnos,
  electrónica en carreras, ciclovía, competencias y pausas activas. Se elige en Más > Estilo musical. Siguen el mood y las notas interactivas; las capas de temporada van encima.
- **Gráficos** (`75-graficos.js`, Más > Gráficos): Pixel; Híbrido (mapa dibujado vectorial a mayor resolución con personajes en pixel); Dibujado 2D (también personajes y vehículos dibujados).
  El búfer del mapa usa `View.q` > 1 y los bloques dibujados se guardan en `CityMap.chunks2`. Los sprites se dibujan con `blit()` (respeta `img.sc`). Desde v1.4.0 la ciudad 3D es toda vectorial, también los lugares emblemáticos (ver *v1.4.0*); el modo pixel conserva su arte.
- **Vista panorámica de plataformas** (Más > Vista del mapa, botón en la pausa o tecla V): de lado, con el perfil real de elevación de la vía, ciudad alrededor con paralaje,
  carros y estaciones al pasar. La bici sigue la ruta sola; tú pedaleas (→), frenas (←) y saltas (↑, espacio o botón Saltar) huecos, conos y charcos. El minimapa sigue arriba.
- **Mundo libre en red** (`76-red-libre.js`, `ModeLibreRed`, rol `libre`): en «Jugar con amigos» se elige la conexión (misma red o zona Wi-Fi sin internet, `Net.lan`, o por internet con STUN)
  y el modo: paseo libre, carrera de postales (1, 3 o 5 postales y zona), cazadores de hojas o la lleva (2, 3 o 5 minutos). El que crea la sala es el servidor. Bluetooth no está disponible en web.
- Limpieza: portada sin secciones de revista (misma paleta y estilo), créditos «Creado por OneZero», datos sin fuente retirados de los consejos.
- Prueba nueva **3d** (gráficos, vistas, música, corredores, tutorial y pausa activa) y «La lleva» con 3 dispositivos en la prueba 5.

*v0.9 · El juego sabe qué día es; modo libre con vida propia* (`69-calendario.js`, `69-libre.js`):
- **Fecha real** (`Cal`, `JE.cal`): `Cal.now()` usa el reloj del dispositivo; para probar otra fecha: `?fecha=2026-12-24T19:00` en la URL o `JE.fecha = '...'`.
  Festivos de Colombia calculados (fijos, Ley Emiliani al lunes y Semana Santa con la Pascua), tipo de día (`semana`, `sabado`, `domingo`, `festivo`).
  **Horario según el día** (`Cal.service`: `open` primer préstamo, `lend` desde esa hora ya no se presta, `close` hasta esa hora se reciben bicis): de lunes a viernes se presta de 5:30 a. m. a 8:59 p. m.
  y se recibe hasta las 10 p. m. (dato del equipo). Sábado: se presta de 6:30 a. m. a 6:59 p. m. y se recibe hasta las 8 p. m.; anfitriones T1 6:00 a. m.–1:30 p. m. y T3 1:00–8:30 p. m. (7 h 30 min), supervisores una hora antes y media hora después
  (`80-limpieza.js`: `SAB_H`, `horasDelDia`, y `ModeAnfitrionR.prototype.begin` corre las fases con `SAB_MAP`). Domingos y festivos: se presta de 8 a. m. a 2:59 p. m. y se recibe hasta las 4 p. m. (página oficial: último préstamo 3 p. m.), solo estaciones automáticas (los anfitriones descansan; `Cal.soloAuto`, `JE.soloAuto`, `stOk`):
  el Usuario y el modo libre prestan y devuelven solo en automáticas, las manuales se ven cerradas en el mapa y la ficha del anfitrión avisa que se juega con el horario de entre semana.
  **Ciclovía:** domingos y festivos de 7 a. m. a 1 p. m. (`Cal.cicloviaNow`): ese día la novedad del turno pasa a ser Ciclovía sola.
- **Festividades automáticas** (`FIESTAS`): Navidad y Alumbrados (1 dic–7 ene), Velitas (7–8 dic), Semana Santa, Día del Niño, de la Madre y del Padre, Independencia (19–20 jul),
  Feria de las Flores (desde el primer viernes de agosto, 10 días), Independencia de Antioquia (11 ago), Fiesta del Libro (desde el segundo viernes de septiembre),
  Amor y Amistad (tercer sábado de septiembre), Halloween (24–31 oct) y Año Nuevo. Gana la más corta si se cruzan. Cada una trae: franja y colores en portada e inicio (`body.fest-<id>`, `--fest1/2`),
  decoración del mapa (`Ride.drawFest`: pinos y luces, velitas, calabazas, flores, casetas de libros, banderas, corazones, globos), capa musical (`Snd.fest`: jingle o spooky),
  novedad del turno (Alumbrados o Flores), una misión del modo libre y un **regalo de temporada** en Mi ciclista (`FEST_REQ`, solo se reclama durante la fiesta).
- **Tu vida** (creador, pestaña **Tú**, primera al crear el personaje): edad (`edad`; niño o adulto mayor activan ritmo tranquilo, adulto mayor también letra grande),
  municipio donde vives (`casaM` → estación de tu casa), colegio (`colegio`), universidad (`uni`, lista `UNIS` con coordenadas) y trabajo (`trabajo`, lista `TRABAJOS`).
  **Contextura** (`build`) y **estatura** (`tall`) cambian el dibujo de la persona (`Art.person`) y la **talla de la bici** (S/M/L, marco 48/52/56 cm).
- **Regla de colores** (pedido del usuario): el verde claro, el azul oscuro y el blanco son de los **trabajadores de EnCicla** (uniforme: camisa azul oscuro, chaleco verde, casco blanco,
  `Art.me({ uniforme: true })` y `mode.uniform`) y de **las bicis EnCicla** (siempre verdes, `bikeCol()`). En el modo libre (y como usuario) te vistes como quieras,
  y el color elegido de bici es para **tu bici propia** (`JE.ownBike`).
- **Modo libre de Usuario** (`ModeUsuarioR`): empiezas en la estación de tu casa a la hora real; si EnCicla está cerrada sales en tu bici. **Misiones del día** (`genMisiones`, guardadas en `Save.data.dia`):
  según el día de la semana y tu vida: llegar a clase (horario por día), al trabajo, al colegio (con **animación del tiempo pasando**, `MGRutina`), plan de viernes, grupo de estudio o medio turno del sábado,
  **carrera de la ciclovía** contra 3 ciclistas por la avenida cerrada (cuenta regresiva y 3 puntos), km por la ciclovía, saludar con el timbre, misión de la fiesta, foto, banca, mentor y volver a casa.
  Premio: hojas verdes y XP (la mitad si llegas tarde). Logros nuevos: Vida sobre ruedas, Rey de la ciclovía, De fiesta en el valle, Aprendiz de maestros, Fotógrafo del valle.
- **Energía** (⚡ en el HUD): las subidas cansan; con menos de 15 % pedaleas más lento. **Sentarse** en un parque o plaza recupera energía y adelanta el reloj. Gancho general: `mode.speedMul(ride)` en `Ride.update`.
- **Fotos** (botón Foto cerca de un lugar con postal): se guardan en `Save.data.fotos` (fecha y fiesta) y se ven en el Álbum como polaroids.
- **El timbre saluda:** los ciclistas cercanos responden («¡Buenas!») y bajan la velocidad. En la ciclovía la avenida se llena de ciclistas (`kind: 'bici'`); si los rozas, solo frenas.
- Prueba nueva **3c**: festivos 2026, fiestas por fecha, horarios, misiones por perfil y día, rutina con animación, energía, banca, foto, carrera de la ciclovía, colores y creador.

*v0.8 · Ciudad con espacio, gente y música* (`68-ciudad.js` y cambios en 20/30/35/00/60):
- **Escala del mundo ×2:** `TS = 16` px por casilla (antes 8) y `WK = TS / 8` = 2. Toda distancia o velocidad en px que venía del diseño de 8 px se multiplica por `WK`
  (velocidades de bici, camión, carros, trenes, tranvía y peatones; radios de llegada; distancias de órdenes). `Ride.marker` escala solo los radios fijos (≤ 30 px);
  los que se calculan con el tamaño del lugar ya vienen en la escala. Bloques de dibujo de 16×16 casillas (`CH = 16`). Zoom del mapa: `View.apply` divide entre 185 (≈ 12 casillas de ancho en el celular).
- **Dibujo de 16 px por casilla** (`drawTile`): calles con andén y sardinel, asfalto de ~10 m, **esquinas redondeadas**, bordes amarillos en autopistas, puentes con baranda;
  edificios por manzana con tanques de agua, aires y terrazas verdes; casas de ladrillo de las laderas; bosque con copas; ciclorrutas con línea central y bici pintada.
  Los dibujos de los lugares (`21-map-art.js`) siguen siendo de 8 px por casilla y se escalan ×2 al pintarlos. Las estaciones ocupan 64×32 px.
- **Gente y vehículos:** además de carros, taxis y buses hay **motos** (rápidas, ~38 % de los vehículos) y **camiones** en las vías grandes (`Art.carTop` 'moto'/'camion');
  **ciclistas** que recorren las ciclorrutas (`ride.npcB`, si los rozas frenas) y peatones.
- **Caminar (modo libre de Usuario):** botón **Bajarse** deja la bici parqueada (`ride.parked`) y el jugador camina (`veh: 'walk'`, `WSURF`, sprite `Art.walker`);
  **Subirse** vuelve a la bici cuando estás cerca, o **Ir a la bici** marca el camino. A pie no hay multas de semáforo ni choques con peatones.
- **Bajar y organizar bicis con equilibrio** (`MGDescarga`): el carro de balance parquea lejos (15–60 m) porque la estación no lo deja acercarse; se llevan 1 o 2 bicis a la vez
  (2 = el doble de inestable) y con ◀ ▶ se mantiene el equilibrio; si pasa de la raya, se caen. Lo usan las órdenes de **Balance** (cada orden de llevar/recoger)
  y el **Anfitrión** a mitad de turno (T1: llega el carro y hay que bajar bicis a las 9:30; T3: recoger bicis a las 6 p. m.).
- **Pantalla sin encimados** (`Game.layout`): las metas van debajo del HUD y a la izquierda (completas 7 s al empezar y 3,5 s cuando cambian; luego una línea),
  el minimapa a la derecha debajo del HUD, los avisos (`UI.toast`, en cola, 2,2–4,5 s según el largo) debajo de las metas y del minimapa,
  las tareas y la ayuda abajo a la izquierda (recortadas para no llegar a los controles), y el joystick fijo o las flechas abajo a la derecha (los botones de acción suben).
  Los nombres de estaciones y lugares se muestran en cualquier tamaño de pantalla pero solo si caben sin taparse entre sí ni con el HUD (`lblRoom`).
  En los minijuegos, los títulos usan **`V.top`** (debajo del HUD y de las metas): **no volver a poner textos en y fijas (66/70)**.
- **Música interactiva** (`Snd.mood` = energía, tensión, racha, noche, pendiente; `Game.moodOf` la calcula cada cuadro): el tempo va de ~90 a ~130 BPM, entran bombo,
  platillos y melodía con la velocidad, arpegio de fiesta con la racha de ciclorruta, pulso de tensión cuando una tarea está por vencer o la fila crece,
  colchón suave de noche, registro más alto en bajada. **Notas interactivas** en el acorde actual (`Snd.note`): cada hoja verde seguida sube una nota, el timbre suena en el tono
  y cada sello de postal toca un arpegio (`Snd.fanfare`).
- Prueba nueva **3b**: revisa en 5 pantallas que metas, minimapa, avisos, ayuda, botones y flechas no se encimen; caminar; la descarga con equilibrio; y que la música reaccione.

*Tu personaje, rankings, personajes y controles* (`67-personaje.js`):
- Al primer "Jugar", después de la introducción se abre **Crea tu personaje** (`UI.avatar(true)`): piel (7), peinado (9: `PEINADOS`), color de pelo (10), barba, gafas,
  camiseta, estilo (camiseta, manga larga, chaleco EnCicla), pantalón, zapatos, casco, color de bici y timbre (tienda). Perfil: `hair, hairCol, beard, glasses, sleeve, pants, shoes`.
  `Art.me()` arma la persona para los minijuegos; `Art.person` dibuja los peinados nuevos; `Art.rider` agrega la cola de pelo largo en la vista de arriba.
- **Ranking** (`UI.ranking`): rango por experiencia (`RANGOS`, 11 rangos), "El valle" contra rivales ficticios (`RIVALES`), "Mis marcas" (10 mejores partidas) y "Por oficio" (récord por turno).
- **Personajes** (`UI.personajes`): fichas del elenco (`CAST` + `BIOS`). Espacio listo para la trama que va a mandar el usuario.
- **Controles** (Más > Controles, `Save.data.settings.ctrl`): joystick flotante (por defecto), joystick fijo o flechas grandes (para abuelos), los dos abajo a la derecha. `Ctrl` en 67-personaje.js.

**Minijuegos v0.4 (inspirados en las referencias del usuario):**
- Infinity Loop → Circuito (Técnico T2/T3, anclajes).
- Laser → Señal (Técnico, tótem).
- Traffix → Semaforero (aviso "semáforo dañado" del Supervisor).
- Package Inc → Desvíos (Bodega T3, y en los avisos de bodega del Supervisor).
- Railways y Tiny Rails → Maquinista (Easter egg).
- Laberinto → Moravia (Easter egg).

**Easter eggs:**
1. Tres timbrazos seguidos bajo una estación del Metro abren el Maquinista secreto, que anuncia "Próximamente: Juega Metro" (el juego 11).
2. Tres timbrazos en Moravia abren el laberinto.
3. 7 toques al título "EnCicla" de la portada, o el código Konami, activan la bici dorada.
4. Postal secreta en el Cerro de las Tres Cruces (no sale en el álbum hasta encontrarla).

Las pistas están en "¿Sabías que?" y hay 4 logros secretos.
- **Ritmo** (Ajustes): tranquilo (+40 % de tiempo y +35 % de paciencia), normal o arcade.
- **Reto del día:** la semilla es la fecha. **Código de reto** `N-T-SEMILLA36`: multijugador asíncrono sin servidor.

**Escalas del mundo:** 1 casilla = 10 m reales desde v1.3.0 (antes 20 m; `MS = 20 / VM.tile` escala las búsquedas que miden distancias reales). Desde v1.3.1 las velocidades se multiplican por `TRAVEL = √MS` y el reloj de los oficios en el mapa se divide por lo mismo (`Mode.tm()`), para que un viaje cueste los mismos minutos de juego que en el mapa de 20 m. Bici 60 px/s (×1,3 en ciclorruta, ×0,62 en acera, ×0,55 en pasto). Camión 50 px/s, solo por vías.
Cada modo tiene su propia velocidad de reloj (minutos de juego por segundo real), por ejemplo Usuario 1,2 y Monitoreo ~4,5.
El préstamo dura máximo 60 min de juego.

**Simulación de estaciones (`StationSim`):** salidas ~ 0,045 × demanda × perfil(hora, tipo) por estación y minuto.
Los tipos son res, work, uni y mix. En la mañana se va de residencial a trabajo/universidad, y en la tarde al revés.
Las bicis se **conservan** (estaciones + viajes + camiones + bodega + en préstamo): el bot verifica este invariante.
El nivel de servicio es 1 − (minutos de estación vacía o llena / minutos totales).

**Datos reales usados (aproximados, para verosimilitud):** horario L–V 5:30 a.m.–10 p.m., sáb. 6:30 a.m.–9 p.m., dom. 8 a.m.–4 p.m.
Máximo 1 hora por préstamo, más de 130 estaciones (2026), más de 3 millones de préstamos entre 2024 y 2026, inicio en 2011.
Hay estaciones manuales (anfitrión) y automáticas (tótem y anclajes) y meta de operatividad del 94 %.
Las estaciones del metro son las reales (líneas A y B). Los municipios del juego son Bello, Medellín, Itagüí, Envigado, Sabaneta y La Estrella.
El mapa es **estilizado**: río de sur a norte, autopistas, ciclorrutas verdes, comunas de ladrillo en las laderas y 26 lugares con postal.
El "Centro de Operaciones EnCicla" es ficticio.

**Semáforos:** solo en los cruces de avenida con avenida (`map.lights`). Ciclo de 10 s: el este-oeste está 4,2 s en verde
y 0,8 s en amarillo, y luego el norte-sur igual. Los carros paran; pasar en rojo resta 5 puntos y suma a `ride.stats.reds`
(hay 0,7 s de tolerancia por inercia). Usuario T2 exige 0 en rojo. El bot espera el verde y solo cede a carros que van en su mismo sentido.

**Racha de ciclorruta:** 4, 8 y 15 s seguidos en ciclorruta dan bonos (x2, x3, x4) y líneas de velocidad.
**Sello de revista:** cada postal muestra un sello grande en pantalla (`ride.stamp`).
**Mano guía:** cada modo o minijuego tiene `hint(V)`, que devuelve el punto (en px CSS) a tocar o la dirección a arrastrar.
Sale mientras no hayas aprobado el turno 1 de ese oficio y se apaga en Más > Mano guía.
Los botones con `{key}` guardan su centro en `this.rects`.

**Multijugador (Carrera):** el anfitrión crea la oferta (`Net.host()`), el invitado responde (`Net.join(código)`) y el anfitrión la acepta (`Net.accept`).
Los códigos son `JE1o…`/`JE1a…`, es decir, el SDP comprimido con deflate-raw y en base64url (unos 560 caracteres).
Mensajes: `hi` (nombre y camiseta), `start` (semilla) y `p` (posición cada 0,1 s), además de `fin` y `bye`.
En la misma Wi-Fi funciona sin internet. Entre redes distintas usa STUN de Google, pero las redes con NAT simétrico necesitarían un servidor TURN (pendiente).

**Vida urbana (v0.3):**
- **Tranvía:** va y viene por la calle 112 con 6 estaciones y te choca si te atraviesas.
- **Metrocable:** cuatro líneas en diagonal hacia las laderas, con cabinas animadas.
- **Peatones:** caminan por aceras y plazas. Atropellar resta 3 puntos y el timbre los aparta (suma 1 punto).
- **Noche:** faroles junto a las avenidas, estaciones iluminadas y luces de los carros.

**Logros:** `LOGROS` (id, nombre, prueba sobre `Save.data`). Se revisan al final de cada turno con `Logros.check()`. `Save.data.flags` guarda hitos puntuales.

**v0.5 · Más valle y más personalización:**
- **7 lugares nuevos** (45 en total): Comuna 13 y sus escaleras eléctricas, Biblioteca España, Palacio de la Cultura, Catedral Metropolitana,
  Parque Norte, Unidad Deportiva de Belén y Museo Casa de la Memoria. Se agregan en `LANDMARKS` (coordenadas de diseño),
  en `base` (tipo de suelo), en `solid()` y con su dibujo pixel. La prueba 1b exige que todos sean alcanzables.
- **Ropa que se gana con logros:** `SHIRTS`/`HELMETS` crecieron, y `COSMETIC_REQ` (10-art.js) dice qué logro abre cada índice.
  En Mi ciclista salen con 🔒 (al tocarlas, un aviso dice qué logro falta; si es secreto, dice «???») y con ★ cuando ya son tuyas.
  Al ganar el logro, la pantalla de resultados avisa «Nueva ropa».
- **Sonido ambiente por zona:** `Snd.amb(k)` con k = birds, crickets, tram, metro o river. `Ride.updLife` mira cada 2,5–6 s
  el entorno (pasto o agua alrededor, cercanía del tranvía o del metro, y si es de noche) y usa `Math.random`, no la semilla,
  para no cambiar la simulación. Respeta el interruptor de efectos.
- **Carnet EnCicla** (pestaña Partidas, `UI.carnet()`): avatar, nombre, nivel, cargo más alto con estrellas, km, timbrazos, logros
  y el récord y estrellas de cada oficio (de `Save.data.best` y `Save.data.stars`).

**v0.6 · Tienda, temporadas, historia y cooperativo:**
- **Tienda con hojas verdes** (`SHOP` en 10-art.js: clave → índice → [precio, nombre]). El saldo es `hojas()` = `stats.leaves − spent`.
  Lo comprado queda en `Save.data.owned` (`'bike2'`, `'bell3'`…). Categorías: camisetas, cascos, color de bici (`BIKES`, `profile.bike`)
  y timbre (`BELLS`, `profile.bell`, cambia el sonido en `Snd.sfx('bell')`). Se compra con dos toques en «Mi ciclista y tienda».
  Además de las hojas de Usuario, cada turno da 2 hojas por estrella (`Progress.apply` → `out.hojas`).
- **Clima por temporada** (`SEASONS`, `Season.now()` según el mes real): dos épocas secas y dos de lluvias.
  `Season.pick(rng)` elige la novedad con pesos (más aguaceros en lluvias, Feria de las Flores en agosto, Alumbrados en diciembre).
  En temporada de lluvias el briefing pasa `wet` y el modo puede tener un **chubasco pasajero** (`mode.shower`, semilla aparte).
  Los retos con código y la carrera no usan temporada, para que todos jueguen lo mismo.
  `NOV_EXTRA` guarda las novedades de temporada (Alumbrados: luces en el río con `Ride.drawAlum`); el bot las prueba todas.
- **Historia** (66-historia.js): un mentor por oficio (`CAST`) y 3 capítulos por oficio (`HISTORIA`: título, antes, después).
  Sale como globo en el briefing y en los resultados de los turnos del escalafón. Un capítulo queda completo cuando el turno tiene estrellas,
  así que no usa datos de guardado nuevos. «Más > La historia» permite releerlos.
- **Turno en equipo** (57-equipo.js, rol `equipo`): el anfitrión de la sala juega `ModeCoopMon` (Monitoreo T1 con un camión automático y uno por invitado)
  y cada invitado juega `ModeCoopDriver` (camión). El anfitrión es la autoridad: simulación, carga de camiones y bodega.
  - Anfitrión → invitados: `ord` (orden, con `to`), `s` (estado cada 0,5 s: reloj, bicis de la zona, servicio), `mv`/`ld` (respuestas), `say`, `end`.
  - Invitado → anfitrión: `p` (posición), `at` (llegué a la estación de la orden), `dep` (llegué a la base).
  - Si un invitado se va, su camión sigue en automático. Si se pierde el anfitrión, el invitado termina el turno a los 10 s.
  - `isMulti(id)` agrupa `carrera` y `equipo`: sin mejoras, sin estrellas de escalafón y sin botón Reiniciar. En red la pausa no detiene el juego.
- Corrección: los silleteros de la Feria de las Flores no salían porque faltaba `flores: true` en la novedad.
- **Cartel de ayuda (`#coach`, `Game.dom`)**: el usuario pidió que no tape el juego. Reglas: en modos de mapa lleva la clase `mini`
  (franja pequeña abajo a la izquierda, lejos del timbre); en todos los modos se oculta tras el tiempo de lectura (3,5–9 s según el largo,
  ×1,4 en ritmo tranquilo); reaparece si cambia el texto o si sube `errors`; el texto también sale en el menú de pausa.
  Los modos con lista abajo (Apoyo, Balance, Carrera, conductor en equipo) definen `get coachB()` para que la ayuda quede encima de la lista.
  **No volver a poner carteles grandes o permanentes sobre el mapa.**

**Accesibilidad:** «Letra grande» pone la clase `body.big` y multiplica por 1,15 el texto del canvas. «Mano guía» se puede apagar.
En pantallas bajas (horizontal) la ayuda de los minijuegos va arriba a la derecha.

### 5. Convenciones de código

- La lógica está separada del dibujo. Cada modo o minijuego tiene `update(dt)`, `render(V)` (búfer pixelado), `hud(V)` (texto nítido),
  `pointer(type, vx, vy, cx, cy)` y `bot(err)`. El bot llama a las acciones directamente, sin clics.
- `View`: búfer de baja resolución escalado ×s (pixel perfecto) más una capa nítida para textos (`View.text`).
  En el mapa la escala depende del lado menor de la pantalla y del zoom. En los minijuegos el diseño base es de 200×150.
- El mapa se dibuja en bloques de 16×16 casillas (`CH`); en 3D la caché `chunks2` guarda 10–14 bloques según la memoria del equipo. Se arma a lo sumo un bloque nuevo por cuadro y se precalienta uno vecino en la dirección de avance.
- En código compacto de una línea no se usa `//` en la mitad de la línea: se usa `/* */`.
- Para añadir un modo: clase en `50-modes.js`, entrada en `ROLES` y `MODE_CLASS`, metas con `this.goal(texto, obligatoria, ok(), progreso())`
  y un método `bot()`.
- Todo texto del jugador va en español. Usa símbolos simples (★ ✓ ✗ ⏱ 🚚 📻) que se ven en todos los equipos.

### 6. Pruebas (HECHO CUANDO)

`node tests/run.js --n=100` debe terminar con "✓ TODAS LAS PRUEBAS PASARON":
- El JS compila (vm.Script).
- 100 partidas del bot (los 9 oficios × 3 turnos × novedades × mejoras) sin excepciones, sin NaN, sin bicis perdidas y todas terminan.
- Prueba de humo de la interfaz: portada, escalafón, briefing, juego, dedo, resultados, mejora, pestañas, modales, bot desde Ajustes y código de reto.
- Rendimiento con CPU 4x lenta: mediana del cuadro < 40 ms.
- Multijugador: dos páginas crean la sala, se conectan, arrancan la misma carrera y cada una ve al rival en tiempo real.
- Mapa (3j): vías exactas con nombre, barrio en Floresta, casas en el suelo, historia y misiones guardadas aparte, Ni una gota.
- Guion (3i): capítulos válidos, ficha y resultado con diálogos, siguiente capítulo al aprobar, epílogo con logro, peatones que hablan, consejo, fiesta, Metro y horario especial.

### 7. Publicación web (GitHub Pages)

- La rama `gh-pages` contiene **solo** el contenido de `dist/web/`: `index.html`, `.nojekyll`, `manifest.webmanifest`
  (con un ícono maskable), `sw.js` (caché `juega-encicla-v<versión>-<hash>`), `apple-touch-icon.png` (180 px, sin transparencia),
  `icons/` y `compartir.png` (1200×630, usada en og:image).
- Enlace: https://juanfeliperico369-stack.github.io/BicicletasUno/
- iPhone: abrir en Safari → Compartir → "Añadir a pantalla de inicio".

### 8. Android (APK)

- Proyecto Capacitor 7 en `app/`. `app/www/index.html` es una copia de `dist/juega-encicla.html`. El id del paquete es `com.juanfeliperico.juegaencicla`, con minSdk 23 y targetSdk 35.
- Compilar en local: `cd app && ANDROID_HOME=/opt/android-sdk npm run build:debug`. El APK sale en `app/android/app/build/outputs/apk/debug/`.
- En CI: `.github/workflows/android.yml` (ejecución manual o etiquetas `v*`). Sube el APK como artefacto y lo adjunta al *release*.
- Dentro de la app, exportar abre un cuadro para copiar el respaldo (el WebView no descarga blobs) y compartir abre WhatsApp.
- Pendiente para Play Store: firmar un AAB de release con keystore propio, versión 1.0, ficha y política de privacidad.

- Antes de compilar una versión, borra `app/android/app/build/outputs/apk/debug/app-debug.apk`. El empaquetado incremental de Gradle reutiliza el archivo y deja huecos: en la v1.6.0 la APK pasó de 7,1 a 10,3 MB con el mismo contenido.

### 9. Pendientes / ideas (feedback del usuario)

- **Arte e historia hechos por IA:** `docs/IA-ENCICLA.md` reparte los encargos (G: Gemini, C: ChatGPT, H: Guionista). Cada IA entrega un documento con todo su trabajo en tres versiones (PDF maestro, MD con el código de las imágenes y ZIP). Al llegar: desarmar, revisar, reducir a pixel art, atlas de menos de 4 MB e integración con respaldo al dibujo actual (parte 13 del documento).
- **Huevos de pascua de *El Metro*:** fragmentos e ideas guardados en la parte 10 de `docs/IA-ENCICLA.md`, con el objeto `METRO_EGG` listo para integrar.
- Pulir cada oficio con el conocimiento real del equipo EnCicla (procesos de anfitrión, relevos, balanceo, taller).
- Multijugador: ya hay carrera 1 contra 1 por código. Faltan salas de más de 2 jugadores, código QR, TURN y modos cooperativos (por ejemplo, Monitoreo con Balance).
- Bluetooth: solo en la app nativa (plugin de Capacitor); los navegadores no permiten Bluetooth entre celulares.
- Lista oficial de estaciones por zona y leyenda de colores de los pines (el usuario la ofreció): reemplazar `STATIONS_DEF`.
- Ideas siguientes: ver a los otros camiones en el turno en equipo, cooperativo con Técnico y Apoyo, eventos de temporada con postales exclusivas, ranking local de récords y más prendas en la tienda.
- Página oficial con donaciones. Tiendas: Play Store primero; después iOS/Mac, Steam, Microsoft Store, Epic y Amazon (con Capacitor o Electron).

---

# Anexo C · Bitácora de desarrollo

## BITÁCORA · Juega EnCicla

Formato: fecha · versión · qué cambió · qué se probó · qué falta.

### 22-nov-2026 · v3.0.0 · Ronda 3.0 de Claude: arreglar lo roto, todo liberado, módulos en el valle y un solo mundo 3D
Pedido del autor a tres IA a la vez (cada una con su documento): revisar, compararlo con los mejores juegos, investigar y planear; arreglar los modos rotos, lentos o engorrosos; liberar todo; llevar cada módulo al mundo abierto; carrera sin fin en ciclovías con giros, angostos y trucos; un solo mundo 3D. Documento: **`docs/INVESTIGACION-Y-PLAN-3.0-Claude.md`**.
1. **Auditoría medida** (`tests/auditoria-modos.js`, CPU 4×): la bici iba a 14 cuadros por segundo con picos de 165 ms y perdía hasta el 30 % del tiempo por el tope de 50 ms del paso.
2. **Fluidez** (`99a-fluidez.js`): subpasos de hasta 50 ms (el juego no va en cámara lenta en celulares lentos); trozos de ciudad por adelantado en el tiempo libre.
3. **⏫ Acelerador fijo** (tecla Q), como el de Motor City 4.6.1.
4. **Todo liberado** (oficios, turnos y tienda; interruptor 🔓 en Más).
5. **Carrera de la ciclorruta** a 34–65 km/h (antes 20 km/h al arrancar).
6. **Los oficios en el valle** (`99b-actividades.js`): en las estaciones y en Casa EnCicla, el mismo módulo del menú y «🚲 Volver al valle».
7. **Carrera con giros, tramos estrechos y zonas de trucos**; **zonas de trucos y parkour** en 7 plazas (`99c-trucos.js`).
8. **Un solo mundo 3D** (`99d-mundo3d.js`): tercera y primera persona sobre el mismo mapa (el piso es el arte 2D de los trozos; los edificios, los mismos lotes en volumen; árboles, carros y el ciclista), cámara que no se mete en los edificios y joystick según la cámara. Botón «3D» o tecla Y.
9. Unido Motor City 4.6.1 (rama de la IA del motor) a esta rama.
**Probado:** `node tools/build.js` y `node tests/run.js` (sección V4 nueva, todo en verde); capturas en 412 × 860 del 3D, la carrera y los trucos.
**Falta:** el documento, § 6.

### 21-nov-2026 · v2.1.0 · La revolución con Motor City 4.5 (Claude)
Pedido del autor: «comprende todo, el motor, las ideas y sugerencias, y ahora sí revoluciona el videojuego»; luego: «mejora los iconos y la información en pantalla (tapan el juego; el tamaño solo es grande o enorme)» y «usa El Metro para terminar las estaciones del metro, metrocable, tranvía, tren, Metroplús, las líneas alternativas y los alimentadores». El juego sigue con su Motor del Valle; del motor 4.5 se portó lo que sirve (manera A y B del informe). Detalle: **`docs/REVOLUCION-2.1.md`**.
1. **Manejo (lo más importante):** choque que **desliza** a lo largo de la pared (normal por 8 puntos; el golpe quita según impacto² y el roce sigue suave), **se desatasca** sola, **asistencia** que mira adelante y evita la pared (interruptor 🛞 en Más y en la pausa; el bot no la usa), giro amortiguado, **bordillo** con tumbo, polvo en pasto y tierra, salpicaduras con lluvia y **marca de frenada**. Contra el manejo de antes (`ab.js`): a 15° +15 %, a 30° +39 %, a 45° +44 % y en pared diagonal +38 % de avance; de frente sigue frenando (`30-ride.js` `mover`, `98q-manejo.js`).
2. **HUD según el contexto:** de 8 botones de 68 px a 3 (la acción del momento con pulso, el timbre y «⋯ Más» con la bandeja); el consejo del modo libre va arriba a la izquierda (`98r-hud.js`).
3. **Cuatro tamaños** de textos y botones (Pequeño, Mediano —el nuevo de siempre—, Normal y Grande), en Más y en la pausa; escalan HUD, botones, avisos, minimapa, sello y tarjetas. **Iconos vectoriales** nítidos en las acciones. Los avisos son compactos (3 líneas) y lo que dice un personaje va a su tarjeta con cara (`98y-tamano.js`).
4. **Lectura cenital (a la manera de *Hunter Assassin*):** halo del ciclista, cono de luz que se corta en los edificios (de noche, el farol), estaciones cercanas que respiran y la bici parqueada que late (`98s-lectura.js`).
5. **Efectos para todo público:** polvo, chispas (el camión), pedazos, hojas, gotas, aros y marcas, sin explosiones (`98p-efectos.js`).
6. **Rostros de Motor City** (`98t-rostros.js`, manera B) y **una cara por persona** en historias, tutor, «Un día del valle», Personajes (ahora con los 15 vecinos de la trama) y la tarjeta de charla (`98u-caras.js`). Rosalba y la gente de El Metro, como en su biblia de estilo.
7. **Árboles con lógica:** 70 de 23.404 árboles de avenida caían en canchas, pistas o piscinas; ahora 0 (`75-graficos.js`).
8. **Registro de claves del guardado** (`Save.CLAVES`, `Save.registrar`, `Save.revisarClaves`; TAREAS 10) con prueba al final de la batería (`98v-claves.js`). El guardado sigue siendo `juegaencicla.v1`.
9. **Ruta a Guatapé en bici** (C‑E40): 3 tramos de 4 km por el embalse (El Peñol → Mirador, Mirador → La Piedra, La Piedra → Guatapé) en carretera pseudo‑3D, física con unidades reales (30 km/h en plano, 11 en subida del 6 %, 55 bajando), agua que se gasta, 6 fondas con «lo que todos saben» y «lo poco conocido» (datos con fuente), letreros de km, la Piedra que crece, la orilla de 1,5 m (Ley 1811), chivas, vacas, lanchas y el malecón con zócalos. En el menú y en el Taller del modo libre; 2 logros (`98w-guatape.js`).
10. **La red completa de El Metro:** los **15 alimentadores** con su recorrido por las calles, 84 paraderos con su código y buses que paran; el **Metro de la 80** (en obra: vallas y conos en sus estaciones), el **Tren del Río** y el **cable a San Antonio de Prado** (proyectos) punteados en el mapa grande; las escaleras de la Comuna 13; y el dato de cada estación al detenerse junto a ella (`tools/red_metro.js` → `src/data/red_metro.json`, `98x-red.js`). Metro, tranvía, 6 cables y Metroplús 1, 2 y O ya estaban.
11. **Arreglos:** los botones de la bandeja apuntaban a una acción inexistente (`data-i = -1`); ahora tienen prueba que los toca.
**Probado:** `node tools/build.js` y `node tests/run.js` (nuevas secciones V, V2 y V3 en `tests/revolucion-encicla.js` y las claves del guardado al final); capturas en 412 × 860.
**Falta:** ver `docs/REVOLUCION-2.1.md` § 6 (probar en un celular real, la incoherencia de oficios entre mentores y trama, publicar).


### 21-nov-2026 · Motor City 4.6.0 en `motor-city/` e informe (Claude)
- El motor y El Metro copiaron el manejo y el mapa de EnCicla (pedido del autor: «básate en EnCicla, que es fluido»). `motor-city/` pasó a 4.6.0; el juego no cambió (sigue con su Motor del Valle; APK 2.0.1).
- Informe para la IA que siga: `docs/INFORME-MOTOR-CITY-4.6.md`.

### 21-nov-2026 · Motor City 4.5.0 en `motor-city/` e informe para la IA que siga (Claude)
- **El autor decidió:** el juego **sigue con su Motor del Valle**; Motor City se comparte como referencia. Todo lo que cambió, mejoró, falta auditar y les toca, y cómo usar el motor sin dejar el propio: **`docs/INFORME-MOTOR-CITY-4.5.md`**.
- **La prueba de WebRTC** ya no espera tiempos fijos: espera a que el invitado 2 vea a los otros dos y sus posiciones nuevas.
- **Publicado:** `main` al día con la rama de Claude y `gh-pages` con el `dist/web/` nuevo, **conservando `/metro/` y `descargas/`**.
- **Probado:** `node tools/build.js` y `node tests/run.js` en verde.
- **Falta:** ver el informe, § 4 y § 5.



### 21-nov-2026 · Los arreglos de Codex, hechos por Claude
- Codex describió estos arreglos y nunca los subió. El autor pidió resolverlos. Cada uno se reprodujo y quedó con su prueba en `tests/regresion-encicla.js`, que se llama desde `tests/run.js`.
  1. **Bici prestada:**
     - antes, al cambiar de la bici de EnCicla a otro vehículo, la bici quedaba guardada aparte; no contaba como abandonada y se podía volver a montar desde cualquier lugar;
     - ahora queda parqueada en la vía y para montarla hay que volver hasta ella.
  2. **Acceso sin aparcamiento:** a pie y sin bici parqueada, «Ir a la bici» rompía el juego. Ahora ese botón no sale.
  3. **Gasto de la eléctrica:** la eléctrica es `bike` con `R.ebike` y gastaba como una bici normal. Ahora gasta 0,12 contra 1,85 en la misma subida (`69-libre.js`).
  4. **Montar:** subirse a la bici a pie ahora avisa el evento «montar» de los boletos de Rosalba.
  5. **Hojas de la trama:**
     - los premios iban a `Save.data.leaves` y la tienda lee `stats.leaves` (`93-trama.js`);
     - las hojas viejas se migran al cargar o importar la partida.
- **Archivos:** `src/js/98o-arreglos.js` (aditivo) y los cambios de una línea en `69-libre.js` y `93-trama.js`.
- **`MC.Calendario.pascua`:** no se cambió. `Cal.easter` es el mismo algoritmo y meter todo el motor en este juego sumaría casi 900 KB.
- **Probado:** `node tools/build.js` y `node tests/run.js`, todas en verde.

### 21-nov-2026 · Mundo abierto primero (Claude, a partir de la auditoría G‑H28 de Antigravity)
- **Regla del autor:** mundo abierto desde el principio; el tutorial y la historia son opcionales.
- **`src/js/98n-abierto.js`**, aditivo (envuelve `UI.init`):
  - **▶ Jugar entra directo al modo libre**, pedaleando por el valle: 1 toque y 0,3 s. Antes había 4 toques o más: «BIENVENIDA 1 DE 4» y luego «Crea tu personaje»;
  - sale con bici de EnCicla si el sistema está abierto; si no, o si hay suspensión, con la bici propia;
  - el botón nuevo **«🏆 Oficios y modos»** lleva al escalafón (los 11 oficios), y ahí siguen la bienvenida y el personaje. Todo es opcional.
- **`tests/run.js`:** comprueba el toque directo; el flujo bienvenida → personaje → escalafón ahora se prueba desde «🏆 Oficios y modos». `tests/verify-live.js` usa ese botón si existe.
- **Probado:** `node tools/build.js` y `node tests/run.js`, todas en verde.

### 21-nov-2026 · Motor City 4.2.0 en `motor-city/` (Claude)
- Llegó el motor 4.2:
  - recorte por región en el 3D (niebla y cono de visión);
  - carros de la IA que no se trancan en el borde de la calle;
  - el vuelo Voxel Space sin pausa;
  - las entregas de ChatGPT (MC4 por capas) y de Antigravity unidas.
- Probado: `node tools/build.js` y `node tests/run.js`.

### 21-nov-2026 · Motor City 4.1.0 en `motor-city/` (Claude)
- Llegó el motor 4.1. Trae técnicas de motores clásicos, rehechas desde cero:
  - 🏁 Arcade (la carretera de OutRun);
  - ⛰️ Vuelo (el Voxel Space de Comanche);
  - la gema y el ruido de Thief;
  - el DDA de Wolfenstein;
  - las semillas de Elite.

  Ver `motor-city/docs/INVESTIGACION-MOTORES-CLASICOS.md`. Las vistas nuevas están en `MC.VISTAS` por si este juego las quiere usar.
- **Regla nueva del autor:** mundo abierto desde el principio; el tutorial y la historia son opcionales y nunca bloquean (`motor-city/CONTEXTO-RELEVO.md` § 7). Gemini lo revisa en este juego (G‑H28).
- Probado: `node tools/build.js` y `node tests/run.js`.

### 21-nov-2026 · Motor City 4.0.3 en `motor-city/` y relevo de Codex (Claude)
- Llegó el motor 4.0.3, con las entregas de ChatGPT/Codex y de Gemini/Antigravity unidas. *Turno Cero* sigue aislado y no entra en este juego.
- Se unieron las fichas de coordinación de Codex y de Antigravity:
  - `coord/agentes/codex.json` y `coord/agentes/antigravity.json`;
  - los mensajes en `coord/buzon/`;
  - `docs/COORDINACION-IA.md`.
- **Ojo, Codex:** tus arreglos de código no están en GitHub; en `codex/encicla-motorcity` solo quedó tu ficha. Son estos:
  - bici prestada;
  - acceso sin aparcamiento;
  - gasto de la eléctrica;
  - montar rechazado;
  - migración de hojas de trama;
  - `MC.Calendario.pascua`;
  - `tests/regresion-encicla.js`.

  Vuelve a subirlos a tu rama. La lista exacta está en `motor-city/CONTEXTO-RELEVO.md` § 5, fila 11.
- Probado: `node tools/build.js` y `node tests/run.js`.

### 20-nov-2026 · Motor City 4.0.0 en `motor-city/`
- Llegó el motor 4.0. Trae:
  - el planeta (`MC.Planeta`);
  - la búsqueda 0–5 (`MC.Busqueda`);
  - el lector GLB (`MC.Modelos`);
  - los juegos con varios mundos.
- *Turno Cero*, el juego adulto de Motor City, queda aislado en `motor-city/juegos/getaway/` y no se mezcla con este juego. Manhattan no se copia aquí.
- `TAREAS-IA.md` tiene la nota de la 4.0 y un pedido adaptado a este juego.
- Pruebas en verde.

### 2026-11-04 · v0.1.0 · Primera versión jugable

**Qué cambió**
1. Estructura del proyecto (`src/`, `tools/`, `tests/`, `docs/`) y construcción a un único HTML offline y a una PWA.
2. Estilo "revista pixel" (EMSAY + Doc Element) con la paleta EnCicla y las fuentes embebidas del HTML de referencia.
3. Mapa estilizado del Valle de Aburrá: río, autopistas, metro A y B, ciclorrutas, comunas, 33 estaciones y 26 lugares con postal.
4. Los 9 oficios jugables con 3 turnos cada uno, metas, estrellas, escalafón, mejoras roguelite, novedades del día, ritmo tranquilo,
   reto del día y código de reto.
5. Guardado local, exportar/importar partidas (JSON), álbum de postales, historial, avatar, sonido y música 8 bits por código.
6. Bot de pruebas (dentro del juego en Ajustes > Diagnóstico y por línea de comandos).

**Qué se probó**
- Sintaxis OK. 54 y luego 100 partidas del bot sin fallas (conservación de bicis, sin NaN, todas terminan).
- Humo de interfaz completo y rendimiento con CPU 4x lenta (mediana de 16,7 ms por cuadro).

**Errores encontrados por el bot y corregidos**
- La ruta del camión partía de una casilla de estación no transitable.
- Inicios dentro de edificios.
- Bucle de choques (un carro detenido encima del camión).
- Atascos en esquinas (se añadió asistencia de esquinas).

**Qué falta:** feedback del equipo EnCicla, multijugador por red, APK firmado para Play Store.

### 2026-11-04 · v0.1.0 · Publicación y pulido

**Qué cambió**
- Publicado en GitHub Pages (rama `gh-pages`, solo `dist/web/`).
- Portada sin textos encimados, zoom del mapa adaptado a escritorio, ruta GPS más visible, flecha al objetivo fuera de la lista de metas,
  el primer usuario del Anfitrión llega enseguida.
- Ayuda contextual que no tapa los botones de los minijuegos y metas ocultas mientras hay tarjetas abiertas.

**Qué se probó**
- 100 partidas del bot y humo de interfaz.
- En el enlace publicado (`tests/verify-live.js`): carga sin errores, service worker activado, abre y se juega sin conexión,
  Chrome reporta 0 errores de instalabilidad y og:image, apple-touch-icon y manifest responden 200.

**Qué falta:** APK (en proceso con Capacitor), feedback del equipo EnCicla.

### 2026-11-04 · v0.1.0 · APK Android

**Qué cambió**
- Proyecto Capacitor 7 (`app/`) con íconos pixel, pantalla de inicio azul y pantalla completa.
- Flujo de GitHub Actions para compilar el APK.
- En la app, exportar abre un cuadro para copiar el respaldo y compartir abre WhatsApp.

**Qué se probó**
- `aapt2 badging`: paquete, etiqueta, versión y actividad correctos.
- El HTML dentro del APK es idéntico a `dist/juega-encicla.html`.
- 27 partidas del bot y humo de interfaz después del cambio.

**Qué falta:** probarlo en un celular real, firmar el APK de release para Play Store y recibir feedback de EnCicla.

### 2026-11-04 · v0.2.0 · Ciudad viva y multijugador

**Qué cambió**
1. Semáforos en los cruces de avenida con avenida: los carros paran y pasar en rojo resta puntos. Nueva meta en Usuario T2: "0 en rojo".
2. Racha de ciclorruta con bonos y líneas de velocidad, sello grande de revista al ganar una postal y confeti al aprobar.
3. Mano guía animada en los 9 oficios y la carrera: muestra qué tocar o hacia dónde arrastrar en los primeros turnos. Se puede apagar.
4. **Carrera de postales:** contra el bot (tranquilo, veloz, turbo) o contra un amigo en otro celular por WebRTC, con código compartible y sin servidor.
5. Los carros frenan detrás del jugador. El bot respeta los semáforos y cede a los carros que van en su mismo sentido.

**Qué se probó**
- 100 partidas del bot (ahora con Carrera) sin fallas.
- Humo de interfaz y rendimiento con CPU 4x lenta (mediana de 16,7 ms por cuadro).
- Sala WebRTC real entre dos páginas: códigos generados, ambas inician la carrera con la misma semilla y el invitado ve al anfitrión en tiempo real.

**Errores encontrados por el bot y corregidos**
- Bloqueo en cruces donde la ruta gira: el bot revisaba dos ejes del semáforo a la vez.
- El camión pasaba ~40 % del tiempo en semáforos: se dejaron solo en los cruces de avenida con avenida.
- Choques en cadena porque los carros se arrastraban hasta el camión, y bloqueo frente a frente entre carro y camión.

**Qué falta:** probar en celulares reales (en especial la sala entre redes distintas), código QR, salas de más de 2 jugadores y feedback de EnCicla.

### 2026-11-04 · v0.3.0 · Medellín viva, logros y accesibilidad

**Qué cambió**
1. Tranvía de Ayacucho (calle exclusiva, 6 estaciones, se mueve y puede chocarte) y Metrocable K, P, J y H con cabinas animadas sobre las comunas.
2. Peatones en aceras y plazas: si los atropellas pierdes puntos, y el timbre los aparta ("¡Gracias!").
3. Noche: faroles, estaciones iluminadas y luces de los carros.
4. 16 logros que se ven en la pestaña Partidas y aparecen en los resultados.
5. Introducción "¿Qué es EnCicla?" (4 páginas) al primer Jugar, y sección "Apoya la bici pública" con el sitio oficial.
6. Opción de letra grande, imagen de resultado para compartir (1080×1350, estilo revista) y mejoras en horizontal.

**Qué se probó**
- 100 partidas del bot, humo de interfaz (introducción, logros, tarjeta, letra grande y modales), multijugador entre dos páginas y CPU 4x lenta.
- Capturas en horizontal (844×390) de 6 modos.

**Qué falta:** probar en celulares reales, feedback de EnCicla y sonido ambiente diferente por zona.

### 2026-11-04 · v0.4.0 · De Caldas a Barbosa, Easter eggs y nuevos minijuegos

**Qué cambió**
1. **Mapa de Caldas a Barbosa** (según las capturas de la app oficial): 150×432 baldosas.
   - Al norte de Bello, corredor que gira al noreste con Copacabana, Girardota, Barbosa y campo entre pueblos.
   - Al sur: Envigado, Itagüí, Sabaneta, La Estrella y Caldas.
   - 106 estaciones con nombres de barrio en 10 municipios.
   - 12 lugares nuevos, entre ellos el Alto de San Miguel (nacimiento del río), Quitasol, Fabricato, Ditaires y Otraparte.
   - La línea A del metro termina en Niquía.
2. **Minijuegos nuevos inspirados en tus referencias:**
   - Circuito (Infinity Loop) y Señal láser (Laser) en Técnico.
   - Semaforero (Traffix) en los avisos del Supervisor.
   - Desvíos (Package Inc) en Bodega T3.
   - Maquinista (Railways/Tiny Rails), como Easter egg.
   - Laberinto de Moravia, como Easter egg.
3. **Easter eggs:**
   - El Metro secreto ("Próximamente: Juega Metro").
   - El laberinto de Moravia.
   - La bici dorada (7 toques al título o código Konami).
   - La postal secreta de las Tres Cruces.
   - 5 logros nuevos, 3 de ellos secretos.
4. **Multijugador:** salas de hasta 4 jugadores (estrella con reenvío), invitación con **código QR** y escáner con la cámara (cuando el equipo lo permite).
5. Monitoreo por zona con vista recortada, minimapa tipo radar y sub-zonas para que el mapa grande no alargue los turnos.
6. **Ciclovía** con avenidas cerradas y conos, y **Feria de las Flores** con silleteros.
7. **Play Store y página oficial:**
   - `landing/pagina.html` y `privacidad.html`, con APK descargable en `descargas/`.
   - Guía `docs/PLAY_STORE.md`, imágenes de tienda (`tools/store.js`) y firma de release.
   - Permiso de cámara (QR) y versionCode 400.

**Qué se probó**
- Integridad del mapa: 106 estaciones y 38 lugares alcanzables en bici; todas las estaciones al alcance del camión.
- Los 6 minijuegos nuevos completos con el bot.
- 100 partidas del bot.
- Sala de 3 dispositivos (anfitrión y 2 invitados) en la que el invitado 2 ve al anfitrión y al invitado 1.
- QR verificado en las versiones 1 a 40 (idéntico a la referencia Nayuki, leído por zxing y OpenCV).

**Errores encontrados y corregidos**
- La plaza de Girardota cortaba la avenida y el camión no llegaba.
- El camión se atascaba en pasos de 1 baldosa: se redujo su radio de colisión.
- Todos los invitados quedaban con id 0 y el reenvío fallaba.
- La línea A del metro llegaba hasta Barbosa.

**Qué falta:**
- La lista oficial de estaciones por zona (el usuario la ofreció) para reemplazar los nombres aproximados.
- La leyenda de colores de los pines de la app oficial.
- Pruebas en celulares reales y el permiso escrito de EnCicla para publicar.

### 2026-11-04 · v0.4.1 · Mapa ampliado ×1.35

**Qué cambió**
- El mapa pasó de 150×432 a 203×583 baldosas: más cuadras, más laderas y comunas más anchas, y una avenida nueva (Carrera 30).
  Ahora hay 68 cruces con semáforo.
- Escala parametrizada (`SC`, `X()`, `Y()`, `snapRow`, `snapCol`, `fitLM`): el mapa se puede agrandar o achicar cambiando un solo número.
- Las distancias y tiempos de los oficios se ajustaron a la escala.
  - Metas de Balance (4/5/6 órdenes) y Supervisor (4/6/7 avisos).
  - Servicio de Monitoreo 70/80/85 %.

**Qué se probó**
- 106 estaciones y 38 lugares alcanzables, y el camión llega a todas.
- 100 partidas del bot, sala de 3 dispositivos y CPU 4x lenta (mediana de 16,7 ms).

**Errores encontrados y corregidos**
- Madera quedó dentro del río y Barbosa Norte en el borde del mapa: se reubicaron.

### 2026-11-05 · v0.5.0 · Más valle, ropa por logros, sonido ambiente y carnet

**Qué cambió**
1. Siete lugares nuevos con postal (45 en total): Comuna 13, Biblioteca España, Palacio de la Cultura, Catedral, Parque Norte,
   Unidad Deportiva de Belén y Casa de la Memoria.
2. Siete prendas que se ganan con logros (uniforme EnCicla, camiseta dorada y silletera, y cascos dorado, del Metro, cono y todero).
   Salen con candado en Mi ciclista y los resultados avisan cuando ganas una.
3. Sonido ambiente según la zona: pájaros en parques de día, grillos de noche, campana del tranvía, paso del metro y el río.
4. Carnet EnCicla en Partidas: tu cargo más alto, nivel, km, logros y el récord y estrellas de cada oficio.

**Qué se probó**
- 106 estaciones y 45 lugares alcanzables, y el camión llega a todas las estaciones.
- 100 partidas del bot, humo de interfaz, CPU 4x lenta (mediana de 16,7 ms) y sala de 3 dispositivos.
- Las prendas bloqueadas no se pueden elegir y avisan qué logro falta.

**Qué falta:** la lista oficial de estaciones por zona, la leyenda de colores de los pines y las pruebas en celulares reales.

### 2026-11-10 · v0.6.0 · Tienda, temporadas, historia y turno en equipo

**Qué cambió**
1. **Tienda con hojas verdes:** colores de bici, timbres (corneta, campanita, pato), camisetas y cascos. Cada estrella da 2 hojas.
2. **Clima por temporada** según el mes real: más aguaceros en las dos épocas de lluvias, chubascos que llegan en pleno turno,
   Feria de las Flores en agosto y Alumbrados con luces en el río en diciembre.
3. **Historia de 27 capítulos:** un mentor por oficio te habla antes y después de cada turno, de Doña Luz a la Gran Rodada. Se relee en Más.
4. **Turno en equipo (cooperativo en red):** quien crea la sala dirige desde Monitoreo y hasta 3 amigos manejan los camiones.
5. Tres logros nuevos (24 en total) y cinco datos nuevos en «¿Sabías que?».
6. **El cartel de ayuda ya no tapa el juego** (pedido del usuario): en el mapa es una franja pequeña abajo a la izquierda,
   se quita solo tras el tiempo de lectura, vuelve si te equivocas y también se lee en el menú de pausa.

**Qué se probó**
- 100 partidas del bot (con Alumbrados y chubascos), humo de interfaz y CPU 4x lenta.
- Sala de 3 dispositivos: carrera y turno en equipo. La orden llega solo al conductor elegido, el camión entrega y recarga
  sin perder bicis, el otro conductor ve el estado y el turno termina en los 3.

**Errores encontrados y corregidos**
- Los silleteros de la Feria de las Flores no aparecían.
- El briefing mostraba un aviso del turno antes de empezar.
- Un invitado que seguía en carrera no recibía el inicio de la partida siguiente.

**Qué falta:** la lista oficial de estaciones por zona, la leyenda de colores de los pines y las pruebas en celulares reales.

### 2026-11-12 · v0.7.0 · EnCicla real: mapa del valle, oficios reales y tu personaje

**Qué cambió**
1. **Mapa real del Valle de Aburrá** de Caldas a Barbosa con datos abiertos (OpenStreetMap vía Overture, relieve SRTM): calles reales, 71 km de ciclorrutas,
   río y quebradas, parques, los 10 municipios, Metro A y B y Tranvía siguiendo su trazado, 758 semáforos y 128 estaciones con coordenadas reales.
2. **Relieve:** sombras y curvas de nivel; las subidas frenan, las bajadas aceleran (y hay que frenar), y el corredor eléctrico ayuda a subir.
3. **Gráficos sin temblor:** cámara continua y objetos en movimiento dibujados a resolución de pantalla (giran suave en diagonal).
4. **Oficios con los turnos reales:** anfitrión (apertura/cierre, sillín a la medida), apoyo con las 10 zonas, supervisor con tulas, técnico con power banks,
   bodega en 4 pasos y entrega al taller, mecánico (reparación y ensamble), balance (tulas, camión de 40, parqueadero) y monitoreo (inventario cada hora y atención al cliente).
5. **Crea tu personaje** al empezar (peinados, pelo, barba, gafas, ropa, zapatos), **ranking** con rangos, **personajes** y **3 tipos de control** (joystick flotante, fijo o flechas).

**Qué se probó**
- 128 estaciones y 45 lugares alcanzables en bici y en camión; zonas del Apoyo con sus cantidades exactas; mapa cargado en ~0,2 s.
- 100 partidas del bot con los turnos reales, humo de interfaz (creador, ranking, personajes), CPU 4x lenta y la sala de 3 dispositivos (carrera y equipo).

**Errores encontrados y corregidos**
- Las calles quedaban demasiado anchas (casilla de 20 m): se adelgazó la red y el asfalto se dibuja de 10 m.
- La primera fase de cada turno arrancaba a las 6:00 y todo salía tarde; un turno de supervisor no terminaba; dos minijuegos no cerraban con el bot.

**Qué falta:** la lista oficial de estaciones, horarios por confirmar (Monitoreo, Balance T2/T3), ubicación real de la bodega y el taller, y la trama de los personajes.

### 2026-11-12 · v0.8.0 · Ciudad con espacio, gente, equilibrio y música interactiva

**Qué cambió**
1. **Calles con más espacio y redondeadas:** el mundo se dibuja al doble (16 px por casilla de 20 m). Hay andenes, sardineles y esquinas curvas, y el ciclista ya cabe en proporción.
2. **Ciudad viva:** motos, camiones, buses, taxis, ciclistas en las ciclorrutas y peatones.
3. **Modo libre a pie:** te bajas de la bici, caminas por donde quieras y vuelves a subirte.
4. **Bajar y organizar bicis con equilibrio:** el carro parquea lejos de la estación; se llevan 1 o 2 bicis sin dejarlas caer (Balance y Anfitrión).
5. **Pantalla ordenada:** nada se tapa; las metas y los avisos duran poco, y los controles van a la derecha.
6. **Música interactiva:** cambia con la velocidad, la racha, las subidas, la noche y el apuro; las hojas y el timbre suenan en el tono.

**Qué se probó**
- 100 partidas del bot y humo de interfaz.
- Prueba nueva sin encimados en 5 pantallas, caminar, descarga con equilibrio y música que reacciona.
- CPU 4x lenta y la sala de 3 dispositivos.

**Qué falta:** la lista oficial de estaciones, la confirmación de horarios y de la ubicación de bodega y taller, y la trama de los personajes.

### 2026-11-12 · v0.9.0 · El juego sabe qué día es y el modo libre tiene vida propia

**Qué cambió**
1. **Fecha real:** festivos de Colombia, horario de EnCicla según el día y ciclovía los domingos y festivos.
2. **Fiestas automáticas:** Navidad, Velitas, Halloween, Flores, Fiesta del Libro, Independencia y más. Cada una trae colores, decoración del mapa, música, misión y regalo.
3. **Creador:** pestaña Tú (edad, municipio, colegio, universidad, trabajo), contextura y estatura, y bici a la medida.
4. **Modo libre:** misiones del día según tu vida, con animación de clase, trabajo o colegio; carrera de la ciclovía; energía y bancas; fotos para el álbum; mentores con habilidades; el timbre saluda.
5. **Colores:** uniforme y bicis de EnCicla en verde, azul oscuro y blanco; en el modo libre te vistes como quieras y tu bici propia es del color que elijas.

**Qué se probó:** 100 partidas del bot, humo de interfaz, sin encimados, la prueba nueva 3c (calendario, misiones, carrera, colores y creador), rendimiento y la sala de 3 dispositivos.

**Qué falta:** confirmar con EnCicla los horarios por día, la lista oficial de estaciones y la ubicación de bodega y taller.

### 2026-11-12 · v0.10.0 · Oficios nuevos, gráficos, vistas, música por estilos y mundo libre en red

**Qué cambió**
1. **Oficios nuevos:** Pausas Activas, con un minijuego de ejercicios al ritmo de la música, y Rescate, donde se lleva una bici con una mano manteniendo el equilibrio. El técnico tiene tres minijuegos nuevos.
2. **Tutorial opcional:** un compañero de cada oficio te acompaña en el turno. Los mentores se retiraron.
3. **Corredores eléctricos reales:** son tres, con servicio hasta las 7 p. m. Las estaciones solo eléctricas cierran a las 8 p. m.
4. **Gráficos:** modos pixel, híbrido y dibujado 2D, más la vista panorámica de plataformas.
5. **Música:** cuatro estilos (jazz, lo-fi, soft rock y electrónica), en modo automático o a elección.
6. **Modo libre:** dura 24 horas y se puede jugar en red, por LAN o zona Wi-Fi sin internet, o por internet con el celular como servidor. Incluye competencias personalizadas.
7. **Presentación profesional:** sin secciones de revista, con créditos de OneZero y sin datos sin fuente.

**Qué se probó:** 100 partidas del bot con los 11 oficios, la interfaz, que no haya elementos encimados, el calendario, gráficos y vistas, la música, los corredores, el tutorial, el rendimiento y la red con 3 dispositivos, incluida «La lleva».

**Qué falta:** la lista oficial de estaciones con su dificultad por turno, el organigrama y los horarios por oficio, las zonas y el personal, las festividades de EnCicla y las cantidades del sistema.

### 2026-11-13 · v1.0.0 · Versión piloto

**Qué cambió**
1. **Calles rectas y continuas:** la red real se convierte en tramos rectos al cargar, sin escalones. Se unen las calles y las ciclorrutas sueltas.
2. **Ciudad 3D:** edificios con volumen y perspectiva, andenes, cebras, árboles y sombras; cámara más cercana y calles anchas.
3. **NPC con rutas:** ciclistas y peatones recorren toda la ciudad hacia un destino y respetan los semáforos.
4. **Mapa grande interactivo:** se mueve y se acerca, muestra referencias (municipios, metro, lugares y estaciones) y permite marcar un destino.
5. **Interfaz limpia:** letra nueva, poco texto, avisos breves al frente y nada encimado.
6. **Piloto:** modo daltonismo, retos con QR, escenas de la historia y Bluetooth en la app de Android.

**Qué falta:** los datos oficiales que llegarán del equipo de EnCicla.

### 2026-11-13 · v1.0.1 · Controles y horario

1. **Controles siempre disponibles:** si salías del juego con el mapa grande abierto, la siguiente partida quedaba sin controles. Ya no pasa, y el joystick se ve siempre abajo a la derecha.
2. **Horario real:** de lunes a viernes se presta hasta las 8:59 p. m. y se reciben bicis hasta las 10 p. m.
3. **Pruebas nuevas:** controles después de salir con el mapa abierto, y hora límite de préstamo.

### 2026-11-13 · v1.0.2 · Limpieza, accesos rápidos, creador y sábado

1. **Modo Limpieza:** la brigada mensual (dos supervisores y el anfitrión) limpia el habitáculo con escoba, trapero, paño y bolsa.
2. **Accesos rápidos en el inicio:** Mi ciclista, Historia, Personajes, Ranking, Amigos y Retos.
3. **Creador obligatorio:** sin personaje se abre al empezar. El APK ya no restaura datos viejos al reinstalar.
4. **Sábado:** se presta de 6:30 a. m. a 6:59 p. m. y se recibe hasta las 8 p. m.
   - Anfitriones de 6:00 a. m. a 1:30 p. m. y de 1:00 a 8:30 p. m.
   - Supervisores, una hora antes y media hora después.

### 2026-11-14 · v1.0.3 · Domingos y festivos

1. **Horario:** de 8 a. m. a 4 p. m., solo con estaciones automáticas, porque los anfitriones descansan.
2. **En el juego:** el Usuario y el modo libre prestan y devuelven solo en automáticas, y las manuales se ven cerradas en el mapa.
3. **Ficha del anfitrión:** ese día avisa que el turno se juega con el horario de entre semana.

### 2026-11-14 · v1.0.4 · Panel de controles

1. **Panel de controles en la pausa y en Más:**
   - Tipo: joystick fijo, arrastrar, flechas o inclinar el celular, con recalibración.
   - Lado: izquierdo o derecho.
   - Tamaño: pequeño, normal o grande.
   - Vibración.
2. **Control a la izquierda:** la lista de tareas se corre para no quedar tapada.

### 2026-11-14 · v1.0.5 · Préstamo EnCicla en el modo libre

1. **Bici de EnCicla:** el reloj va más lento, hay que renovar cada hora en una estación y se respeta el horario. Con bici propia, el modo libre es de 24 horas.
2. **Tolerancia:** 10 strikes para renovar tarde. Sin strikes, suspensiones de 3 a 60 días.
3. **Bici abandonada:** la pueden reportar, y el reporte negativo no se quita.

### 2026-11-14 · v1.0.6 · Cuarto corredor eléctrico

1. **Pascual Bravo – Hospital Pablo Tobón Uribe:** Pascual Bravo es estación mixta y el Hospital Pablo Tobón Uribe solo presta eléctricas. Las ubicaciones son aproximadas.

### 2026-11-17 · v1.0.6 · Documento único para las IA de arte e historia

1. **`docs/IA-ENCICLA.md`:** encargos de arte e historia para la próxima gran versión, con el formato del documento de *El Metro*.
   - Protocolo de 7 pasos, cuestionario y lista de control.
   - Roles: Gemini (G), ChatGPT (C) y Guionista (H). Biblia de estilo, reparto con descripciones para los prompts y prompts listos.
   - Historia “Un día del valle” (16 capítulos) y los 15 años de EnCicla.
   - Datos reales: horarios, préstamo, corredores eléctricos, los 22 turnos, fiestas e historia con fuentes.
2. **Entregas:** cada IA entrega un documento con todo su trabajo en tres versiones: PDF maestro, MD con el código de las imágenes y ZIP con las imágenes y el PDF. ChatGPT consolida todo al final (C-99).
3. **`tools/armar_entrega.py`:** arma las tres versiones y reconstruye las imágenes desde el MD, verificando el SHA-256. Probado con reportlab y con Pillow, y con el MD dividido en partes.
4. **Huevos de pascua de *El Metro*:** personajes, frases, capítulos, logros, colores de líneas y fechas guardados, más 16 ideas y el objeto `METRO_EGG`.
5. **`tools/todo-ia.js`:** `build.js` compila `dist/ENCICLA-TODO.md` con los anexos (historia actual, guía y bitácora).
6. Descripción para compartir y gráfico de la tienda: “12 oficios”, en vez de “9 oficios, 27 turnos”.

### 2026-11-17 · v1.1.0 · Guion de las IA, Un día del valle y mapa pulido

1. **Entrega C-99 revisada** (`docs/AUDITORIA-C99.md`):
   - 292 PNG reconstruidos con SHA-256 idéntico y archivados en `arte/entregas/2026-11-17-c99/`.
   - Son bocetos generados con código y no superan el dibujo actual: no entran al juego.
   - El guion sí entra, curado en `contenido/guion/`.
2. **Un día del valle:** historia principal de 16 capítulos, de las tulas de las 4 a. m. al cierre de las 10 p. m., con turnos reales y el epílogo de los 15 años de EnCicla.
3. **La ciudad habla:** los peatones dicen frases según la hora, la lluvia, la fiesta, la ciclovía y las estaciones.
4. **Tutor y fiestas:** consejo en la ficha de cada turno y saludo de fiesta en el modo libre.
5. **El Metro:**
   - Rosalba en Niquía antes de las 4:30 a. m. (logro secreto) y sus frases en el Maquinista secreto.
   - Cumpleaños del Metro el 30 de noviembre y enlace a *El Metro* en los créditos.
6. **Logros nuevos:** 8 por oficio, más *Un día del valle* y *Antes del primer tren*.
7. **Horario oficial:**
   - Los domingos se presta hasta las 2:59 p. m. y se recibe hasta las 4.
   - El Museo de Antioquia cierra a las 5:30 p. m. y el Área Metropolitana a las 7 p. m.
   - Festivos siguen como domingo (regla del autor), aunque la página oficial dice que no hay servicio.
8. **Mapa pulido:**
   - Las calles anchas se adelgazan a su eje (60 % menos tramos); se acaban las planchas de asfalto con rayas sueltas.
   - Las rayas siguen el eje de cada calle y las cebras atraviesan cada calle que llega al semáforo.
   - En el modo pixel, el asfalto solo va donde pasa una calle.

### 2026-11-17 · v1.2.0 · Mapa reconocible: cada calle, cada barrio

1. **Calles exactas:** cada vía sale de los datos de OpenStreetMap como vector (32.785 vías, 2.607 nombres), no de la cuadrícula. Se reconocen Laureles, sus circulares y diagonales, la Avenida San Juan y los nombres de las calles.
2. **Peatonales limpios:**
   - Los andenes y cruces trazados como líneas no se pintan.
   - Los senderos solo van en parques, plazas y monte.
   - Las vías de servicio sin nombre no se dibujan como calles.
3. **Nombres de calles y barrios:**
   - Calles: sobre la vía, en el juego y en el mapa grande.
   - Barrios y veredas (672): al entrar a cada uno y en el mapa grande; las comunas también aparecen en el mapa grande.
4. **Casas en fila:** los barrios son casas angostas frente a la calle, con teja, losa, tanques y ropa tendida. Los edificios quedan en el centro, El Poblado, el comercio, la industria y las avenidas.
5. **Estaciones en su punto:** típicamente a 46 m de su coordenada (antes 73 m), y la más lejana a 195 m (antes 441 m). Floresta e Industriales tienen coordenadas de Overture.
6. **Vida:** parqueaderos con carros, postes, árboles de avenida y guayacanes, bancas, palomas, nubes y brillos en el río.
7. **Ni una gota:** misión del modo libre con logro secreto (de *El Metro*).
8. **Corrección:** *Un día del valle* y las misiones diarias del modo libre usaban la misma clave de guardado. Ahora están separadas y el avance se migra solo.

### 2026-11-18 · v1.3.0 · La revolución del mapa: Medellín a 10 m con datos oficiales

Pedido del autor: «acepto el mapa más grande, mejóralo todo», y traer a EnCicla lo mejor de *El Metro* (fragmentos, huevos de pascua y mejoras de su auditoría).

1. **Mapa de 10 m** (antes 20 m): 4.316 × 4.921 casillas. Una calle de barrio mide una casilla, como en la realidad, y las manzanas ya no se las comen las vías.
   - **Huellas de edificios reales** (693 mil de Overture: OSM, Microsoft y Google): casas de ladrillo y edificios donde están; las torres de El Poblado y del centro con la altura de su zona.
   - **Datos oficiales de Medellín** (Catastro, datos abiertos): manzanas (lo que queda fuera de ellas es andén o espacio público), malla vial con nomenclatura y ancho, jerarquía vial, espacio público y lotes.
   - **Barrios oficiales** de Medellín, Itagüí, Envigado y Sabaneta (504 polígonos); en el resto del valle, el barrio más cercano.
   - **Autopistas y avenidas con nombre:** del 17 % al 95 %. Un tramo sin nombre hereda el del vecino que sigue en la misma dirección.
   - **Río:** continuo de Caldas a Barbosa y siempre bajando. El cauce se «quema» en el relieve con una regresión isotónica (33 tramos subían).
   - **Escaleras sueltas** quitadas, quebradas de una casilla (la mitad de agua pintada que antes) y **Metroplús** (líneas 1, 2 y O) por sus avenidas reales.
2. **Motor:**
   - Formato v3: cada vía trae su nomenclatura oficial y su ancho.
   - Las estaciones se buscan en espiral desde su punto real, con memoria de conectividad. La carga bajó de 26 s (primer intento) a 1,6 s.
   - Estaciones a 16 m de su coordenada (mediana; antes 46 m), p90 41 m y máximo 148 m. Todas alcanzables en bici y en camión.
3. **Dibujo:** cada calle con su ancho real, separador con pasto en las avenidas anchas, casas divididas por el área de los lotes catastrales, estaciones del metro de ~130 m y parques y plazas con su nombre.
4. **De *El Metro*:**
   - Metroplús y los colores oficiales de los cables.
   - **Maqueta 2:1** en el mapa grande (botón ⬢): el valle en 3D isométrico con relieve, edificios con su altura, giro de 90° y pellizco.
   - **Direcciones paisas:** la calle por la que vas siempre a la vista, y la misión «¿Dónde queda?» del modo libre (un domicilio a «Calle X con Carrera Y» sin marca: las calles crecen hacia el norte y las carreras hacia el occidente).
   - Secretos de **Gardel** (estación de Metroplús en Manrique) y **Arví** (subir en bici hasta el cable L), con 4 logros nuevos.
   - **Avisos anunciados** a lectores de pantalla (región `aria-live`), **tope de 64 KB** al leer invitaciones y caché de trozos menor en celulares con poca memoria.
5. **Créditos de datos:** el mapa cita a OpenStreetMap (ODbL), Overture y la Subsecretaría de Catastro de Medellín, como piden sus licencias.

**Qué se probó:** todas las pruebas (`tests/run.js`), 54 partidas del bot sin errores, rendimiento con CPU 4× lenta (mediana de 16,7 ms por cuadro), multijugador con 3 dispositivos, maqueta en 41 ms y alcanzabilidad de las 133 estaciones con radios a escala del mapa nuevo.

**Qué falta:** física contra las manzanas reales en el modo pixel, alturas por edificio (no por zona) y las placas de «lo poco conocido».

### 2026-11-18 · v1.3.1 · Un mapa para los dos juegos

Pedido del autor: «toma todo lo que aprendiste, compleméntalo y crea la nueva revolución del videojuego del Metro».

1. **La tubería de mapas sirve a los dos juegos:**
   - `TILE=20 OUT=carpeta python3 tools/geo/build.py` hace el mismo mapa en casillas de 20 m para *El Metro*;
   - allá lo convierten `tools/mapa_valle.py` y `tools/ciudad_datos.py`.
   - Así, *El Metro 1.0.0* cumple 9 de los 12 pasos de su hoja de ruta del mapa (ver `docs/REVOLUCION-METRO-Y-ENCICLA.md`).
2. **Río completo:** el curso del río se traza de Caldas a Barbosa con A* (como lo mide la auditoría de El Metro). Lo que el curso cruza pasa a puente o agua, y el relieve se quema a lo largo de todo el cauce. En 20 m: 0 cortes (antes 69) y subidas de 7 m como máximo (antes 27).
3. **Escaleras:** una escalera de una sola casilla pasa a paso peatonal (en 20 m: 4 sueltas, antes 332).
4. **Barrios:** los polígonos oficiales mandan donde existen, y el barrio con nombre más cercano llena los huecos (Envigado y Sabaneta ya no quedan con zonas vacías).
5. **Tranvía:** sigue cada curva de Ayacucho (la línea pasa de 17 a 40 puntos en 20 m).
6. **Equilibrio del mapa de 10 m:**
   - Como la ciudad mide el doble en px, el bot de las pruebas aprobaba la mitad en los oficios de recorrer el valle (Apoyo 1/4, Balance 1/4, Técnico 1/4).
   - Ahora se anda √2 más rápido y el reloj de los oficios corre √2 más lento (`TRAVEL = √MS`), así cada viaje cuesta los mismos minutos de juego que antes.
   - Con eso el bot vuelve a lo de v1.2.0: Balance 4/4, Técnico 4/4, Rescate 4/4, Supervisor 4/4 y Apoyo 3/4.

**Qué se probó:** todas las pruebas de EnCicla. Estaciones a 16 m de su punto (mediana) y todas alcanzables.

### 2026-11-18 · v1.4.0 · Ciudad suave: curvas, no cubos

Pedido del autor: «organiza bien las estructuras, suaviza los diseños… los rieles se salen de la estación… nada de escalones, debe ser una ciudad jugable, estilo GTA Chinatown Wars, deben haber curvas, no cubos, todo debe estar perfecto».

1. **Suelo sin casillas a la vista:**
   - pasto, monte, plazas, parqueaderos, manzanas y agua salen de contornos vectoriales suavizados: bordes curvos, nítidos a cualquier zoom y sin costuras entre trozos;
   - andenes y sardineles siguen cada calle y las esquinas quedan redondas;
   - las quebradas son un hilo de agua por su trazo real, dentro de su retiro verde.
2. **Estructuras ordenadas con su calle:**
   - casas y edificios en lotes a lo largo de cada calle, girados con ella (también en las curvas), en hasta 3 filas; el frente sale de los lotes catastrales de la zona;
   - sin traslapes y con el mismo resultado en cada trozo; las casas del interior de la manzana miran a la calle más cercana;
   - ninguna casa pisa los corredores del metro, del tranvía ni del Metroplús;
   - casas con volumen (techo según sus pisos y fachadas) y edificios en perspectiva con aires, tanques, helipuertos, jardines o paneles en el techo.
3. **Los rieles no se salen:** las estaciones del metro, el tranvía y el Metroplús se dibujan a lo largo de su línea (siguen las curvas) y los rieles terminan en los andenes.
4. **Lugares emblemáticos sin cubos** (`75-lugares3d.js`, nuevo):
   - **edificios con techo propio:** iglesias en cruz a dos aguas con torre y aguja, la catedral de ladrillo, el Coltejer con su aguja, el teatro a cuatro aguas, el Palacio de la Cultura ajedrezado con cúpula, las tres rocas de la Biblioteca España, el orquideorama con sus flores de madera, Explora, el MAMM y Fabricato en dientes de sierra, Casa EnCicla con sus franjas, campus con claustro, terminales con claraboyas y buses, el coliseo con cúpula;
   - **suelo con curvas:** el estadio en tazón con su cancha y la cubierta de occidental; cerros con curvas de nivel, bosque y camino en espiral (El Volador, Nutibara con el Pueblito Paisa, Tres Cruces con sus cruces, Quitasol, el nacimiento del río); el jardín de flores de Moravia; parques con prados y fuente; Pies Descalzos con arena, agua y bambú; Plaza Botero con sus esculturas; Parque Norte con rueda de Chicago y montaña rusa; la Unidad Deportiva con cancha, piscina y pista; el Olaya Herrera con pista y aviones; la Comuna 13 con sus escaleras eléctricas naranja y murales;
   - **de noche** brillan los postes del Parque de las Luces, el estadio, los atrios y los parques.
   - En modo pixel y en las postales siguen los dibujos de siempre.
5. **Los lugares ya no tapan calles:** en el mapa de 10 m muchas calles reales cruzan los lugares, y 59 cuerpos quedaban encima de una. Ahora el cuerpo se corre dentro de su lugar o se recortan sus bordes, la iglesia mira hacia su parque y la física sigue al dibujo en los dos modos: quedan 3 con algo de calle debajo (Casa EnCicla no se mueve).
6. **Todo con el mismo trazo suave:**
   - las estaciones EnCicla son una plataforma redondeada con anclajes y bicis a su tamaño (antes salían 4 veces más grandes y caían a la calle);
   - la ruta del GPS es una línea curva y ya no cuadritos en escalera;
   - también los aros de destino, semáforos, conos, peatones, tranvía, metro y Metrocable.
7. **Más liviano:** armar un trozo cuesta mucho menos (lotes con celdas de clave numérica y sin arreglos temporales; contornos en franjas; relieve con `ImageData`). Con CPU 4× lenta: Comuna 13 de ~160 a ~100 ms, Ciudad Universitaria de 55 a 22 ms, aeropuerto de 64 a 15 ms.

**Qué se probó:** todas las pruebas (`tests/run.js`), 54 partidas del bot sin errores, rendimiento con CPU 4× lenta (mediana de 16,7 ms por cuadro), 133 estaciones y 45 lugares alcanzables, capturas de los 45 lugares de día y varios de noche, y modo pixel intacto.

**Qué falta:** la física en 3D sigue la cuadrícula de 10 m (los lotes son dibujo), alturas por edificio y tejados variados por barrio.

### 2026-11-18 · v1.5.0 · Medellín desde el aire: los lugares importantes tal cual

Pedido del autor: «investiga a Medellín desde contenido audiovisual aéreo… y haz los lugares importantes tal cual a las imágenes (las universidades, escuelas, alcaldía y demás)».

1. **Investigación aérea** (`docs/MEDELLIN-DESDE-EL-AIRE.md`): se revisaron fotogramas de 12 videos de dron, imagen satelital de 9 lugares y lecturas sobre el paisaje del valle.
   - **Medellín desde arriba:** ladrillo naranja en casi todo; laderas de ladrillo a la vista y plancha gris; El Poblado como un bosque con torres de ladrillo; un centro gris y denso; campus que son islas verdes.
   - **Detalles del valle:** canchas sintéticas en cada barrio, piscinas y tanques negros en las azoteas.
2. **Sitios reales** (`tools/geo/sitios.py` → `src/data/sitios.bin`, 166 KB; en el juego, `22-sitios.js`):
   - **Qué entra:** 1.195 sitios con 5.188 edificios con su forma real (también con patio) y su altura. Son universidades, colegios, hospitales, templos, estadios, alcaldías (por los lugares de Overture), Gobernación, iglesias, bibliotecas, coliseos y terminales.
   - **Suelo:** todas las canchas del valle con sus líneas (1.346), 34 pistas atléticas y 882 piscinas.
   - **Techos según el lugar:**
     - teja a cuatro aguas con faldones y cumbreras, también alrededor de los patios;
     - dos aguas en las iglesias;
     - helipuerto en las torres de La Alpujarra y en los hospitales grandes;
     - la aguja del Coltejer, cúpula en el Planetario y ajedrez en el Palacio de la Cultura.
   - **Colores de cada campus**, elegidos mirando las fotos:
     - UdeA: teja con patio;
     - Nacional: claro;
     - UPB, EAFIT y U. de Medellín: ladrillo;
     - La Alpujarra: concreto;
     - EPM: vidrio;
     - Explora: rojo;
     - Biblioteca España: oscuro.
   - **Física:** dentro de cada campus, lo construido de relleno pasa a prado, con andén alrededor de cada bloque y las plazas reales. Los edificios reales son sólidos en los dos modos, y ninguna estación se monta sobre ellos.
   - **Nombres en el mapa** para universidades, alcaldías, hospitales, coliseos, bibliotecas y terminales grandes.
3. **Lugares con postal en su sitio:** cada uno se busca por el nombre de su edificio o sitio real y se ubica sobre él.
   - El Coltejer estaba a unos 180 m y el Palacio de la Cultura a unos 220 m.
   - 19 pasan a su forma real (UdeA, Nacional, EAFIT, Catedral, Coltejer, Palacio de la Cultura, Terminal del Norte, Biblioteca España, Explora, MAMM, Casa de la Memoria y 8 iglesias de pueblo).
   - Los que siguen dibujados a mano (estadio, cerros, parques) esconden lo real que cae debajo, para que nada salga dos veces.
4. **Ambiente según la vista aérea:**
   - azoteas de baldosa naranja en los edificios de ladrillo;
   - laderas con más plancha gris, ladrillo a la vista y casas de hasta 4 pisos;
   - torres de ladrillo en El Poblado, Envigado, Sabaneta e Itagüí;
   - jardines y arboledas entre las torres de El Poblado, Laureles y Envigado, y el doble de árboles en los campus.
5. **Pantallas grandes:** la caché de trozos crece con lo que cabe en pantalla (antes, con el zoom alejado se quedaban trozos sin suelo).

**Qué se probó:**
- todas las pruebas (`tests/run.js`) y 54 partidas del bot sin errores;
- rendimiento con CPU 4× lenta: mediana de 16,7 ms por cuadro;
- 133 estaciones y 45 lugares alcanzables;
- comparación lado a lado con la imagen satelital de la UdeA, la UPB, EAFIT, la U. de Medellín, La Alpujarra, el centro, Santo Domingo y El Poblado.

**Qué falta:** la forma real de los lugares que no aparecen con su nombre en los datos (Teatro Metropolitano, Museo de Antioquia, Hospital Marco Fidel Suárez y Terminal del Sur), y huellas reales para toda la ciudad (unos 6 MB más).

### 20‑nov‑2026 · Motor City 2.9 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.9:
  - la entrega maestra de referencias;
  - la entrega de Gemini;
  - la de ChatGPT y Codex (arte a escala, lluvia, 1 bit, agua precalculada y adaptadores).
- **El juego no cambia** y sus pruebas siguen en verde.

### 20‑nov‑2026 · Motor City 2.8 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.8, con lo que se pudo hacer ya de la entrega maestra de referencias del autor:
  - fauna que reacciona, huellas, faros y luces de freno;
  - los estilos vintage, CRT y térmico;
  - accesibilidad, telemetría en percentiles y contratos de datos.
- **El juego no cambia** y sus pruebas siguen en verde.

### 20‑nov‑2026 · Motor City 2.7 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.7:
  - estilos gráficos (cómic, manga, anime, novela gráfica, ukiyo-e y acuarela);
  - peso y vida;
  - la exportación del mundo a glTF para motores más potentes.
- **El juego no cambia** y sus pruebas siguen en verde.

### 20‑nov‑2026 · Motor City 2.6 en `motor-city/` y `TAREAS-IA.md` (Claude, la IA del motor)
- Se sincronizó el motor 2.6:
  - estilo realista familiar (árboles de pie, asfalto gastado, andenes de baldosa, techos con textura);
  - tutorial opcional.
- **`TAREAS-IA.md`** en la raíz: la lista de cada IA en orden. Gemini con Antigravity («hydrogen») hace lo fácil; ChatGPT y Codex («astra») hacen lo fuerte.
- Se agregaron `AGENTS.md`, `CLAUDE.md` y `GEMINI.md`, que apuntan a `TAREAS-IA.md`.
- **El juego no cambia** y sus pruebas siguen en verde.

### 19‑nov‑2026 · Motor City 2.5.1 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.5.1:
  - controles que se ven (joystick, botones de acción y flecha al objetivo);
  - modo libre en Mandados;
  - el arte de Gemini integrado con `MC.Pieles` (`motor-city/dist/arte/gemini.js`);
  - leyenda en las capas de datos;
  - la lista de pedidos.
- **El juego no cambia** y sus pruebas siguen en verde.

### 19‑nov‑2026 · Motor City 2.5 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.5: entrar al agua (dejar el vehículo en la orilla, nadar, bucear con aire, volver a subirse, lancha).
- **El juego no cambia** y sus pruebas siguen en verde.

### 19‑nov‑2026 · Motor City 2.4 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.4: terreno y límites verosímiles (agua con profundidad, pendientes, obstáculos reales), naturaleza y lagos generados.
- **El juego no cambia** y sus pruebas siguen en verde.
- Qué sigue: `motor-city/docs/DOCUMENTO-UNICO.md`, §9.

### 19‑nov‑2026 · Motor City 2.3 en `motor-city/` (Claude, la IA del motor)
- **Qué cambió:** el motor subió a la 2.3, con lo aprendido de SimCity, Los Sims, Cities: Skylines y Townscaper: sombras del sol, mobiliario urbano, fachadas por reglas, ciudad con zonas y capas de datos, casas habitadas y sonido ambiente.
- **El juego no cambia:** misma huella y pruebas en verde.
- **Qué sigue:** leer `motor-city/docs/DOCUMENTO-UNICO.md`, §9.3.

### 19‑nov‑2026 · Motor City 2.2 en `motor-city/` (Claude, la IA del motor)
- El motor pasó a llamarse solo «Motor City». La 2.2 quedó en `motor-city/`, sincronizada desde `juanfeliperico369-stack/motorcity`.
- `motor-valle/` volvió a como estaba en `dc9c301`, el lector 1.2.0 que usa el juego. **El juego no cambia** y sus pruebas siguen en verde.
- Qué sigue: `docs/CONTEXTO-MOTOR-CITY.md` y `motor-city/docs/PLAN-IAS.md`, sección 3.

### 2026-11-19 · Motor City 2.0 llega a `motor-valle/` (el juego no cambia)
**Qué cambió** (lo hizo la IA del motor, Claude Code, a pedido del autor; detalle en `docs/CONTEXTO-MOTOR-CITY.md`):
1. **`motor-valle/` ahora es Motor City 2.0.0**, copiado desde `juanfeliperico369-stack/motorcity`, que es la nueva fuente de verdad del motor. Trae:
   - el mundo 2.0 en un solo archivo (`datos/medellin/mundo.mc4`);
   - el motor (`dist/motor.js`): personaje, 35 vehículos, física, 8 vistas más pixel, la panorámica de perfil, WebGL, reloj, clima, tráfico, transporte con horario y Run en la ciclovía;
   - las guías: `motor-valle/docs/MIGRACION-ENCICLA.md` y las demás.
2. **`motor-valle/js/valle.js` no cambió** (el lector 1.2.0): el juego compilado es idéntico (`juega-encicla-v2.0.1-1896efed`).
3. `motor-valle/geo/build.py` y `fetch.py` aceptan `CIUDAD=ciudades/x.json`. Sin esa variable hacen lo mismo de siempre.

**Qué se probó:**
- `node tools/build.js`: la misma huella;
- `node tests/run.js`: verde;
- en `motorcity`, `node motor.mjs prueba --navegador`: 54 bien;
- `node motor-valle/sincronizar.mjs ../MetroZero --verificar`: «los archivos son iguales».

**Qué falta (para la IA de EnCicla):** pasar el juego al mundo 2.0 y recuperar la panorámica con la del motor (`MIGRACION-ENCICLA.md`).

### 2026-11-19 · v2.0.1 · Motor del Valle 1.2.0: un solo motor otra vez

**Qué cambió**
- **Había dos «1.1.0» del motor:** la de Gemini (en EnCicla) y la de la entrega de El Metro. La de El Metro ponía a MetroZero como fuente de verdad, al revés de lo acordado. Las dos quedaron unidas en la **1.2.0**, con la fuente de verdad en BicicletasUno:
  - `VERSION.json`: las capas comunes y las propias de cada juego, la propuesta de pasos y el historial.
  - `js/valle.js`: el lector de EnCicla (`Valle`, también como `JE.valle`) más la interfaz de El Metro (`MotorValle` y `Valle.elmetro`, con MAP, VC y G3).
  - `motor.mjs version`: mide los datos de los dos juegos.
  - `capas/index.mjs`: suma las capas de El Metro y la propuesta de pasos.
  - `sincronizar.mjs --verificar`: compara las dos copias sin copiar, y avisa si alguna dice otra fuente de verdad.
- Los datos del mapa no cambian: es la misma salida, en los dos juegos.
- El motor 1.2.0 se copió a El Metro en la rama `motor-valle` de MetroZero, con su compilación y sus 100 partidas.

**Qué se probó**
- Toda la suite, con la comprobación nueva del motor 1.2.0 en el juego.
- `motor.mjs version`.
- `sincronizar --verificar`, antes y después de copiar.

**Qué falta:** las capas propias de El Metro (`vias_datos.mjs`, `rutas_calles.mjs` e `hitos.js`) siguen en su repositorio hasta mudarse a `motor-valle/capas/` (F2).

### 2026-11-19 · v2.0.0 · La revolución: las dos entregas del plan único en un solo juego

**Qué cambió**
1. **Las dos entregas, unidas.** Gemini con Antigravity entregó el código y ChatGPT con Codex el arte. Lo que llegó en `docs/ENTREGA-PLAN-UNICO-ENCICLA.md` y en «La vuelta del boleto» quedó en un solo juego (`94-revolucion.js`):
   - **Dos carreras sin fin en el menú** (`JE.modos`), con 3 niveles cada una:
     - **Run EnCicla 3D** (Gemini): corredores reales (Carabobo, Parques del Río y Las Vegas), con la cámara en primera o en tercera persona.
     - **Carrera de la ciclorruta** (ChatGPT): 3 carriles sobre una ciclorruta real (Jardín Botánico, Pies Descalzos y Estadio), vista desde la canasta o desde atrás del ciclista.
   - **Un solo Taller en el modo libre.** Reemplaza los botones «Vehículo» y «Carrera 3D» y trae:
     - la escena del taller de TallerValle, de día o de noche;
     - los 7 vehículos de Gemini, dibujados con el arte de ChatGPT;
     - las dos carreras y el boleto.
   - **El boleto de Rosalba** (`contenido/guion/fragmentos.json`), con los vehículos del registro:
     - primero la bici eléctrica, luego 3 hojas en una sola carrera y por último el scooter hasta Parque Berrío;
     - su señal en el mapa y el logro «El boleto de Rosalba».
   - **TallerValle** (`91-taller-arte.js`): casas de ladera, quebradas, mobiliario, hitos, vehículos en 4 vistas y escenas.
   - **La propuesta de niveles del motor** (`motor-valle/geo/pasos.py`, `motor-valle/js/red-niveles.mjs`) entra con su prueba (`tests/prueba-niveles.mjs`). Todavía no cambia la salida del motor.
2. **Los arreglos que encontró la revisión de ChatGPT (M1):**
   - la flecha del giro ahora se dibuja: en algunos celulares ↰, ↱ y ◎ salían como un cuadro vacío (`Ride.chipGiro`);
   - el botón de velocidad muestra su valor: ×0,8, ×1, ×1,25 o ×1,5.
3. **Lo que se arregló al unir:**
   - En Run EnCicla 3D, los botones tapaban al ciclista y al manubrio. Ahora van encima (`pieUI`).
   - El nombre del corredor quedaba debajo de las metas.
   - En el Taller, los patines se salían de su cuadro.

**Qué se probó**
- Toda la suite, con la nueva sección 3n.
- Las dos carreras, desde el Taller y desde el menú, en el celular vertical y acostado.
- El boleto completo y los 7 vehículos.
- La prueba de niveles del motor.

**Qué falta**
- **Dos «Motor del Valle 1.1.0»:** la entrega de El Metro trae el suyo, distinto del de Gemini, y en su `VERSION.json` pone a MetroZero como fuente de verdad, al revés de lo acordado. Hay que reconciliar los dos en una 1.2.0 desde `motor-valle/` de EnCicla y luego sincronizarla.
- Probar en un celular real: los gestos, la GPU móvil y el APK instalado.
- **La rama `revolucion-v2`** es de otra sesión: tiene una v2.0.0 y una v2.0.1 basadas en la 1.3.1. No se usa. Por eso el APK sube al versionCode 20002, para quedar por encima de ella.

### 2026-11-19 · Llega la entrega del plan único (M1–M6) y se une a la v1.7.2

**Qué pasó:**
- Mientras se cerraba la v1.7.2, la entrega de código del plan único llegó a esta misma rama, en el commit 9dfe005. La trae `docs/ENTREGA-PLAN-UNICO-ENCICLA.md`:
  - Run EnCicla 3D (`91-runner.js`);
  - 7 vehículos e interiores de estaciones (`92-vehiculos.js`);
  - la trama «Ruedas y Rieles» (`93-trama.js`, `contenido/guion/trama_valle.json`);
  - Motor del Valle 1.1.0, con `motor-valle/js/valle.js`, túneles y deprimidos;
  - el GPS en dos niveles y ajustes a los gestos y a la calidad automática.
- Se unió con la v1.7.2 sin reescribir la historia, porque la rama ya la tenía.

**Lo que se arregló al unir:**
- **`JE.vehiculos`:** el catálogo de la entrega reemplazaba la API del registro (`registrar`, `usar` y `libres`), y el modo libre habría fallado en cada cuadro.
  - Ahora `VEH_CATALOGO` es solo la ficha del selector.
  - Los vehículos nuevos (bici eléctrica, patinete, monopatín eléctrico, skate y patines) entran al registro con:
    - sus cifras (`VSTATS`);
    - su suelo (`VSURF`);
    - su sensibilidad a las lomas (`up`);
    - su gasto y su dibujo (`Art.vehTop`).
- **Tipos de casilla que no existen:** la tabla de suelos usaba `TT.SIDE`, `TT.PARK`, `TT.EARTH`, `TT.STAIRS`, `TT.EST` y `TT.BODEGA`, y todos caían en la misma clave (`undefined`). Ahora usa `WALK`, `GRASS`, `LAND`, `STEPS`, `STATION` y `DEPOT`.
- **`stats_`:** ya no reemplaza al registro. Solo la bici eléctrica de EnCicla (la bici con el motor encendido) usa las cifras de `ebike`.
- **El suelo:** se quitó el truco que cambiaba la tabla global `SURF` en cada cuadro.
- **El selector «Vehículo»** lista el catálogo y lo que se registre después con `libre: 1`.
- **El guardado:**
  - las dos tramas usaban `Save.data.trama`: la de la entrega, como objeto, y `misiones.json`, como lista;
  - las misiones hechas pasan a `Save.data.tramaHechas`, y una partida de la v1.7.2 se pasa sola, sin perder nada.
- **Los dos choques de código:**
  - en el GPS se juntan las rutas por vehículo y los dos niveles;
  - en la energía del modo libre se juntan el gasto por vehículo y el ajuste por la velocidad elegida.

**Qué se probó:**
- la suite completa sobre la unión;
- los 7 vehículos uno por uno: cifras, suelo, dibujo y manejo, sin errores.

**Qué falta (la «revolución» v2.0):**
- revisar la entrega completa contra el plan y jugar cada parte;
- pasar Run EnCicla 3D al registro de modos (`JE.modos`), para que también salga en el menú;
- juntar la trama «Ruedas y Rieles» con `misiones.json`;
- sincronizar el Motor del Valle 1.1.0 con El Metro;
- esperar la entrega de arte y publicar.

La rama tiene esta unión, pero **lo publicado sigue siendo la v1.7.2**.

### 2026-11-19 · v1.7.2 · Jugar, pulir y preparar el terreno para lo nuevo

**Qué cambió**
1. **Fallas encontradas jugando.** Se jugó cada oficio con el bot:
   - en el celular vertical (412 × 915) y acostado (915 × 412);
   - en 3D, en pixel y en la vista panorámica;
   - de día, de noche y con lluvia.

   Lo que se arregló:
   - **Monitoreo:** la línea de estado (zona, base y camiones) quedaba debajo de «Regresar camiones». Ahora va encima, con fondo.
   - **Celular acostado:**
     - el Timbre y los demás botones de acción quedaban sobre el minimapa. Si no caben debajo de él, ahora van a su izquierda;
     - los botones de la cámara tapaban la lista de metas (en Bodega y en Técnico). Ahora van siempre debajo de las metas y encima del control, y en fila si no caben.
   - **El nombre de la calle (📍)** quedaba debajo de las metas. Ahora va después de ellas.
   - **`retarget()` del modo Usuario** fallaba en los turnos, que no tienen misiones. Ahora no hace nada.
2. **Registro de vehículos** (`25-vehiculos.js`):
   - La bici, a pie y el camión, con sus cifras exactas de siempre.
   - `JE.vehiculos.registrar(id, def)` suma uno nuevo (scooter, bici eléctrica, skate, patines o monopatín) con:
     - su física, el suelo y las lomas;
     - su choque y sus rutas (solo por la vía, si se pide);
     - su dibujo desde arriba y de lado;
     - el timbre, parquearlo y elegirlo en el modo libre, con el botón «Vehículo».
   - El GPS, el bot, el choque y el dibujo leen el registro.
3. **Registro de modos** (`91-modos.js`):
   - `JE.modos.registrar({ id, name, cls, niveles, how, desc })` pone un juego nuevo en la pestaña Ruta, con un botón por nivel.
   - Antes de empezar se ven sus metas.
   - Gana estrellas por nivel, pero no toca la racha, las mejoras ni los logros del escalafón. Antes de este cambio, perder un juego así habría borrado las mejoras del jugador.
4. **La trama en datos** (`contenido/guion/misiones.json`, que lee `83-guion.js`):
   - Son misiones del modo libre según el día, la hora y las que ya se hicieron.
   - Cada una guarda su fragmento escondido en `Save.data.huevos`, y lo hecho queda en `Save.data.trama`.
   - Las tres primeras traen a Rosalba, don Efraín y la nieta de Rosalba, de El Metro.
5. **Guía para integrar:** `docs/INTEGRAR.md`. Dice dónde va cada archivo y cómo entran un vehículo, un modo (la carrera sin fin), una misión, el arte, un cambio del mapa y sus pruebas.
   - Va enlazada desde el plan único.
   - `dist/ENCICLA-TODO.md` suma los anexos D (plan único) y E (integrar).

**Qué se probó**
- `tests/run.js` completo, con la nueva sección 3m (vehículos, modos y trama), y 54 partidas del bot sin fallas.
- Rendimiento con la CPU 4× más lenta: mediana de 16,7 ms por cuadro.
- El bot jugó los 14 modos en el celular vertical y acostado, sin errores ni encimados.
- 12 combinaciones de vista y pantalla, a 58–60 cuadros por segundo.
- La noche también oscurece con la cámara girada (el brillo baja de 154 a 113).

**Qué falta:** lo que entreguen Gemini y ChatGPT según `docs/PLAN-UNICO-IA.md`:
- la carrera sin fin;
- los vehículos;
- la trama completa;
- los túneles y la cuadrícula de dos niveles.

### 2026-11-19 · Motor del Valle 1.0.0 · Un solo motor para el mapa de los dos juegos

Pedido del autor: «que tengan un mapa igual para ambos: el motor que crea el mapa, unificado en un motor único; los módulos, mecánicas y trama van por aparte».

- **`motor-valle/`** es la tubería de mapas que antes estaba en `tools/geo/`. Es la fuente de verdad del mapa para Juega EnCicla y El Metro.
- **`motor.mjs`:**
  - `encicla` genera casillas de 10 m;
  - `elmetro RUTA` genera casillas de 20 m y escribe `src/data/valle.js` en el formato v3 de El Metro;
  - `fuentes` descarga o actualiza las fuentes;
  - `version` muestra la versión.
- **`sincronizar.mjs`** copia el motor al otro repositorio, comparando versiones.
- **`MOTOR.md`** es el contrato: coordenadas, formato binario, catálogo de capas, reglas y hoja de ruta F1–F4.
- **Probado:** el mapa de 20 m que sale del motor coincide con el de El Metro 1.4: mismas 2.158 × 2.461 casillas y 99,99 % iguales.
- En MetroZero quedó en la rama `motor-valle`, con su `valle.js` hecho por el motor.

### 2026-11-18 · v1.7.1 · El sistema metro como en El Metro y una guía discreta

Pedido del autor: «cambia el diseño del guiador, o el indicador de ubicación o camino: hazlo menos visible y más intuitivo; y haz los diseños de todo el sistema metro iguales al videojuego que se está haciendo (El Metro), del que tienes el repositorio y el HTML».

1. **El sistema metro con el dibujo de El Metro** (`74-sistema.js`, tomado de `21-sprites.js`, `35-ciudad.js` y `11-puentes.js` de metrozero, rama de su v1.3). Las medidas van en metros, como allá, a la escala de Juega EnCicla (1 m = 1,6 px):
   - **Trenes:**
     - 3 vagones de 22 m, blancos con la franja del color de su línea, ventanas, techo con equipos y luces adelante y atrás;
     - cada sentido va por su vía;
     - paran centrados en el andén y al dar la vuelta no saltan.
   - **Viaducto:**
     - tablero de concreto cálido de 10 m con su canto oscuro, durmientes y cuatro rieles;
     - columnas cada 30 m.
   - **Estaciones elevadas:**
     - dos andenes laterales con su línea amarilla;
     - la cubierta metálica a 4,2 m con nervios, postes y el borde del color de la línea;
     - abajo, el edificio de acceso, que se corta donde una calle pasa por debajo.
   - **Tranvía de Ayacucho:**
     - lecho con cuatro rieles y el riel guía al centro;
     - dos coches de 19,5 m con su pantógrafo y la franja verde;
     - paradas con andén a cada lado.
   - **Metroplús:**
     - carril exclusivo con sardinel, asfalto, el color de la línea y la línea blanca;
     - andén con la franja de la línea;
     - **buses articulados nuevos** (12) que van por su carril, paran en cada andén y esperan si el ciclista está delante;
     - las Líneas 1 y 2 van por su corredor real (relaciones de OpenStreetMap), con cada estación en su andén real (`tools/geo/metroplus_elmetro.py`, datos de metrozero).
   - **Metrocable:**
     - cable doble a 14 m;
     - torres cada ~260 m con su brazo y sombra;
     - cabinas del color de la línea cada 60 m;
     - estaciones de 28 × 18 m giradas con su cable, con la polea y las franjas de la línea.
   - **Nombres de las estaciones:** como en El Metro, un punto con el color de la línea y el nombre con halo (metro, Metroplús, tranvía y cable).
2. **La guía del camino, discreta e intuitiva:**
   - la línea gruesa amarilla se cambió por flechitas blancas en el piso que señalan hacia dónde seguir, avanzan despacio y se desvanecen a unos 140 m;
   - el destino es una baliza tenue (zona apenas sombreada, un aro fino y una onda);
   - la flecha del destino fuera de la pantalla es más pequeña y translúcida;
   - un aviso pequeño abajo al centro anuncia el próximo giro (↰ / ↱ y los metros) o la llegada (◎) cuando están cerca.

**Qué se probó:**
- todas las pruebas, con una sección nueva (3l) para los diseños de El Metro y la guía;
- 54 partidas del bot sin errores;
- capturas de la estación Prado con su tren, de San Antonio, del viaducto, del tranvía, del Metrocable K, de los buses del Metroplús y de la guía.

### 2026-11-18 · v1.7.0 · Un mundo con alturas, una cámara libre y un manejo con peso

Pedido del autor: «dimensiona más el mapa y el mundo, para hacer bien los puentes y las estaciones del metro (el personaje cruza por encima); recoloca las estaciones del Metroplús; agrega mover la cámara a voluntad, pellizcar para acercar y alejar y cambiar el ángulo; optimiza; y mejora los controles: hay una sensibilidad abismal, debe ser más centrado, con peso de realismo». Después: «que siempre se pueda elegir la velocidad» y «complementa con El Metro 1.2.0».

1. **Lo que va en alto** (`tools/geo/alturas.py` → `src/data/alturas.json`; en el juego, `76-altura.js`). Se toman de Overture/OpenStreetMap los tramos marcados como puente (`is_bridge`) y su nivel (`level`):
   - **Metro en viaducto:**
     - la línea A va elevada de Universidad a Exposiciones (6,9 km con el tramo de Niquía y los puentes del sur);
     - la línea B, de San Antonio a Floresta (4,4 km), y en San Antonio pasa por encima de la A;
     - 13 estaciones elevadas, con su caja de vidrio, el techo con las franjas del color de la línea y sus columnas;
     - el viaducto tiene losa, costados, rieles, pilares y su sombra en el suelo;
     - los trenes van por encima y se meten bajo el techo de las estaciones.
   - **1.435 puentes de las vías**: 43 sobre el agua, 450 peatonales y ciclopuentes, y pasos elevados (44 en segundo nivel y uno en tercero).
     - Cada puente se corta del dibujo del suelo y se levanta con el mismo trazo de su calle; el río y las quebradas siguen por debajo.
     - Llevan barandas, pilares y sombra, y una rampa en cada extremo.
   - **La bici pasa por debajo**, con su silueta visible, y los carros de abajo también. A un puente se sube por uno de sus extremos (o yendo sobre el río); los carros del puente van por encima. Sobre el río, la baranda no deja caer.
   - **El Metrocable**, a unos 25 m, con cables, torres y cabinas en perspectiva y su sombra.
2. **Metroplús sobre sus avenidas:**
   - cada punto del trazado se lleva al eje de su vía, y en las avenidas de doble calzada al separador;
   - cada estación se corre lo justo para quedar en un tramo recto y alineada con su carril;
   - el trazado sobre la calzada pasó del 91–93 % al 98–100 %, y las estaciones sobre la calzada de 43 a 48 de 55.
3. **Cámara (88-camara.js):**
   - pellizcar acerca y aleja, en continuo en la ciudad 3D y por pasos en pixel;
   - girar con dos dedos gira la ciudad, y los textos siguen derechos;
   - subir o bajar los dos dedos inclina la cámara;
   - ángulos rápidos con 🎥: desde arriba, inclinada, baja y detrás de la bici, que gira con el rumbo;
   - 🧭 vuelve al norte; 📷 es la cámara libre: un dedo mueve la cámara por la ciudad y ⌖ vuelve a la bici;
   - en computador: rueda del ratón, botón derecho y las teclas + − Z X R F T C N;
   - **cómo se dibuja:**
     - la inclinación corre el punto de fuga de la perspectiva hacia abajo de la pantalla, así los edificios se ven de lado;
     - con la cámara girada, el suelo se dibuja en un cuadrado que la cubre en cualquier ángulo;
     - el joystick va según la pantalla.
4. **Manejo con peso (30-ride.js):**
   - la punta de la bici bajó un 29 %: llega al 90 % en unos 2 s y frena en menos de un segundo;
   - al soltar, rueda y se detiene en 1,2 s;
   - el giro se limita según la velocidad (a toda marcha se abre la curva) y tiene inercia;
   - el joystick tiene zona muerta y una curva suave, así poco dedo es poca velocidad;
   - la cámara va casi centrada: anticipa a lo sumo un sexto de la vista;
   - el reloj de los oficios se ajusta, así cada viaje cuesta los mismos minutos de juego.
5. **Velocidad elegible siempre:**
   - tranquila, normal, rápida o muy rápida (×0,8 a ×1,5), con el botón 🚲 del juego, en la pausa, en Más o con la tecla G;
   - el reloj se ajusta a la velocidad elegida;
   - en las carreras y en red todos van a la normal.
6. **Paseo guiado** (89-paseo.js), tomado del «modo paseo» de El Metro 1.2.0. En el modo libre, «🧭 Paseo» lleva la bici sola de un lugar con postal al siguiente:
   - respeta semáforos y carros;
   - la cámara cambia de plano;
   - en cada parada la cámara le da la vuelta al lugar y se cuenta su historia;
   - tocar el control devuelve el manejo;
   - logro «Guía del valle».

   Va con la idea del autor: jugable, contemplativo y divertido, y que sirva de guía para quien visita la ciudad.
7. **Optimización:**
   - calidad automática: si los cuadros pasan de 30 ms, la resolución baja un paso, y sube cuando sobra;
   - con CPU 4× lenta y pantalla de doble densidad, en el centro (lo más denso del mapa) se pasó de 50 a 33 ms por cuadro;
   - con la cámara girada, de 83 a 33 ms.

**Qué se probó:**
- todas las pruebas (`tests/run.js`), con una sección nueva para la v1.7:
  - el manejo;
  - la velocidad;
  - el pellizco, el giro, la inclinación y la cámara libre, con eventos de dedo reales;
  - el viaducto y la bici sobre el puente del río;
  - el Metroplús y el paseo;
- 54 partidas del bot sin errores (el límite de tiempo por partida subió de 600 a 900 s porque el reloj ahora corre más lento en el mapa);
- la auditoría del mapa (`node tools/auditoria-mapa.js`) con las cifras nuevas;
- capturas del viaducto, de las estaciones elevadas, de los puentes y de la cámara en sus ángulos.

**Qué falta:**
- Los pasos elevados siguen conectados con la vía de abajo en la cuadrícula: el GPS podría indicar un giro que en la realidad no existe. Arreglarlo pide una cuadrícula de dos niveles.
- Los deprimidos (túneles) todavía no se dibujan.

### 2026-11-18 · v1.6.0 · Los emblemáticos tal cual y la auditoría de El Metro

Pedido del autor: «continúa lo que falta y las sugerencias, por ahora haz los edificios más emblemáticos… y te dejo la auditoría de la otra IA».

1. **Edificios emblemáticos con su forma** (`tools/geo/sitios.py` → partes en `src/data/sitios.bin`, SIT4; en el juego, `22-sitios.js`). Cada uno se miró en el satélite a 30 cm por píxel y se contrastó con fuentes:
   - **Coltejer:** 36 pisos, con su remate que se angosta como una aguja.
   - **Edificio EPM:** 14 pisos en terrazas de vidrio con techos verdes.
   - **Biblioteca EPM:** volumen de piedra que se abre hacia arriba, sobre la Plaza de Cisneros.
   - **Catedral Metropolitana:** ladrillo, con sus dos torres de 51,8 m en la fachada sobre el Parque de Bolívar.
   - **La Candelaria:** dos torres con cúpulas de teja, mirando al Parque Berrío.
   - **San Ignacio:** dos torres, y su claustro de teja.
   - **Sagrado Corazón:** una torre con aguja alta.
   - **Palacio de la Cultura:** muros ajedrezados en negro y verde grisáceo, con su cúpula de hierro.
   - **Teatro Metropolitano:** planos de ladrillo inclinados, la torre del escenario y su plaza de ladrillo.
   - **Museo de Antioquia, Palacio Nacional, edificios Carré y Vásquez y la estación del Ferrocarril:** muros art decó.
   - **La Alpujarra:** 13 pisos con helipuerto.
   - **Biblioteca España:** las tres «rocas» de pizarra, inclinadas.
   - **153 iglesias más** con su torre en la fachada que mira a su parque.
   - Las partes son prismas con base elevada y muros que se pueden inclinar. Cada muro se ve solo si la cámara queda de su lado.
2. **Lugares que faltaban, en su sitio real:**
   - el Teatro Metropolitano, a unos 270 m de donde estaba;
   - el Museo de Antioquia;
   - el Hospital Marco Fidel Suárez, a 1,4 km;
   - la Terminal del Sur;
   - las iglesias principales de Itagüí, a 300 m, y Copacabana, a 400 m.

   Ahora hay 24 lugares con postal con su forma real. Plaza Botero sigue dibujada, con sus esculturas, junto al museo real. Un lugar dibujado a mano ya no le abre huecos a un edificio real que se sigue viendo.
3. **La auditoría de El Metro** (detalle en `docs/AUDITORIA-MAPA.md`):
   - **Río:** su perfil se quema al cargar el mapa (regresión isotónica) y se cierran sus huecos junto al agua: de 19 tramos que subían (hasta 22 m) a 1 (3 m), y de 5 cortes a 1.
   - **Quebradas cubiertas:** se ven como una línea tenue sobre la calzada (la Santa Elena bajo La Playa).
   - **Patios de trenes:** el patio‑taller del Metro en Bello, los talleres del Ferrocarril de Antioquia, el patio del Metro de la 80 y el del tranvía, con sus naves y su patio de rieles.
   - **Seguridad:** Content‑Security‑Policy, sin *referrer* y guardado y mensajes de red sin `__proto__`.
   - **Interfaz a 412 px:** los botones no tapan el minimapa, los textos caben en el círculo y la mano de ayuda se cierra con el primer movimiento.
   - **Horario real del Metro:** fuera de servicio los trenes no corren, y «Antes del primer tren» usa las 5:00 los domingos y festivos.
   - **Placas de lo poco conocido:** 16 datos en su lugar real, en el álbum, con 2 logros.
   - **Medir siempre igual:** `node tools/auditoria-mapa.js`.

**Qué se probó:**
- todas las pruebas (`tests/run.js`), con la CSP puesta, y 54 partidas del bot sin errores;
- rendimiento con CPU 4× lenta: mediana de 16,7 ms por cuadro;
- 133 estaciones y 45 lugares alcanzables;
- la herramienta de auditoría antes y después;
- capturas de los emblemáticos y de la interfaz a 412 × 915 y 412 × 640.

**Qué falta:** huellas reales para toda la ciudad. Antes hay que ajustar el ancho de las calles de ladera a las casas reales; si no, las casas quedarían sobre la calle.

### 2026-11-20 · v2.0.1 · Ramas unidas y Motor City 2.10

**Qué cambió:**
1. De la rama `revolucion-v2` (82b242d), que corría en paralelo, se trajo lo que faltaba (`src/js/96-accesible.js`):
   - **Alto contraste:** está en Más, junto a «Letra grande», y se aplica al arrancar;
   - **el metro y el tranvía sin casas debajo:** 536 casillas bajo A, B y T pasan a andén.

   Los trenes de noche ya estaban guardados con `Ride.metroOn()`. El **registro de claves del guardado** queda como tarea de la IA de EnCicla (`TAREAS-IA.md` §10). La rama no se fusionó entera porque es una línea vieja: habría revertido el Motor del Valle 1.2.0 y otros cambios.
2. **Motor City 2.10** en `motor-city/`:
   - las skills de los videos (`.claude/settings.json`);
   - el público simulado;
   - rutas por la calle;
   - atlas más livianos.

   El juego todavía no usa `motor-city/`, así que no cambia.

**Qué se probó:** `node tools/build.js` y `node tests/run.js`, con 2 pruebas nuevas (metro sin casas debajo y alto contraste).

**Qué falta:**
- el registro de claves del guardado;
- migrar a `motor-city/`.

### 2026-11-20 · v2.0.1 · Motor City 3.0 en `motor-city/`

**Qué cambió:** el motor 3.0 trae un solo mundo 3D con varias cámaras, fachadas, árboles low-poly, artilugios físicos y el mapa grande. El juego todavía no usa `motor-city/`, así que no cambia.

**Qué se probó:** `node tools/build.js` y `node tests/run.js`.

**Qué falta:** migrar a `motor-city/` para que EnCicla use la cámara 3D y los objetos físicos.


### 2026-11-20 · v2.0.1 · Lo del motor 3.0, adaptado a EnCicla (`src/js/97-motor30.js`)

**Qué cambió:**
1. **Calidad automática del 3.0:** mide el tiempo real entre cuadros (media móvil), reacciona en ~1 s y solo deja la resolución más baja si de verdad mejoró. Si no mejoró, vuelve atrás y no insiste por 60 s (la pantalla puede ir a 30 Hz).
2. **Artilugios físicos** (`MC.Objetos` del motor, a la escala de los sprites):
   - conos de obra en grupos de 3 en las ciclorrutas y balones en las plazas;
   - la bici los tumba y los hace rodar: saltan, caen, ruedan, rebotan contra las casas y se quedan quietos;
   - no frenan la bici.

**Qué se probó:** `node tools/build.js` y `node tests/run.js`, todas en verde, con una prueba nueva (3h3). También una captura en el mundo libre.

**Qué falta:** migrar a `motor-city/` para tener el mundo 3D único con sus cámaras.

---

# Anexo D · Plan único (Gemini con Antigravity y ChatGPT con Codex)

## Plan único · Juega EnCicla + El Metro

**Para Gemini (con Antigravity) y ChatGPT (con Codex) · 19‑nov‑2026 · Escrito por Claude, a pedido del autor (OneZero).**

> ## REGLA DE ENTREGA (obligatoria)
> **Entrega ABSOLUTAMENTE TODO en UN SOLO DOCUMENTO** (un archivo Markdown).
> - Ahí va el reporte de pruebas, las fallas, las ideas, el código y el arte.
> - Nada de entregas sueltas, varios archivos, enlaces a otros documentos ni «ver el chat».
> - Si algo no cabe completo, divídelo dentro del mismo documento en secciones numeradas.
> - El formato del documento está al final, en la sección 6.
>
> **Para que lo de EnCicla entre sin tocar el resto:** sigue [`docs/INTEGRAR.md`](INTEGRAR.md). Ahí está:
> - el registro de vehículos (`JE.vehiculos.registrar`) y el de modos (`JE.modos.registrar`);
> - la trama en datos (`contenido/guion/misiones.json`);
> - las reglas del arte, el mapa y las pruebas.

### 1. Los dos juegos y lo que comparten
| | Juega EnCicla | El Metro |
|---|---|---|
| De qué trata | Arcade de acción por actividades: los oficios reales de EnCicla, la bici pública del Valle de Aburrá | Juego contemplativo del Metro de Medellín, que sirve de guía para turistas: manejar, operar y pasear por la ciudad |
| Repositorio | `juanfeliperico369-stack/BicicletasUno` (la rama de trabajo más reciente) | `juanfeliperico369-stack/MetroZero` (rama `motor-valle`, que es la v1.4.0 más el motor) |
| Jugar | https://juanfeliperico369-stack.github.io/BicicletasUno/ | https://juanfeliperico369-stack.github.io/MetroZero/ |
| Código | `src/js/NN-nombre.js` (se juntan en orden) y `tools/build.js` → `dist/juega-encicla.html` | `src/js/NN-nombre.js` y `tools/build.mjs` → `dist/index.html` |
| Pruebas | `node tests/run.js` | `node tools/test.mjs` |
| Estado | `docs/BITACORA.md`, `docs/GUIA.md` y `dist/ENCICLA-TODO.md` | `docs/BITACORA.md`, `docs/PLAN.md` y `arte/06-guia-unica-ia.md` |

**El tercer juego, para tomar su jugabilidad: Run Scooter.**
- **Repositorio:** `juanfeliperico369-stack/RunRunZero`. Las ramas `main` y la de trabajo más reciente.
- **Jugar:** https://juanfeliperico369-stack.github.io/RunRunZero/
- **Qué es:** un corredor sin fin en 3D por la ciclovía, con scooter, bici, skate, patines y monopatín eléctrico; monedas, regalos y las páginas perdidas de EMSAY; funciona sin internet.
- Es del mismo autor: su jugabilidad y sus vehículos se pueden adaptar a los otros dos juegos (misiones M4 y M5).

**Lo que comparten: el mismo mapa.**
- Está en `motor-valle/` (contrato en `motor-valle/MOTOR.md`). Es la misma tubería y las mismas fuentes: OpenStreetMap vía Overture, capas oficiales de Medellín y relieve SRTM.
- EnCicla lo usa en casillas de 10 m (1 m = 1,6 px) y El Metro en casillas de 20 m (en metros).
- **Regla:** el mapa solo se cambia en `motor-valle/` del repositorio de EnCicla, con la versión subida en `VERSION.json`, y se copia al otro con `node motor-valle/sincronizar.mjs`.
- Todo lo demás es de cada juego, que es una obra aparte: módulos, mecánicas, trama, estilo y Easter eggs.

**Condiciones de los dos:**
- un solo HTML que funciona sin internet y sin librerías externas;
- textos en español de Colombia y fluido en un celular medio;
- atribución de OpenStreetMap (ODbL), Overture y las capas oficiales;
- nada de datos personales.

### 2. El reparto: dos trabajos con las mismas misiones
| Trabajo | Quién | Qué hace en cada misión |
|---|---|---|
| **Trabajo 1 · CÓDIGO** | **Gemini con Antigravity** | Prueba, encuentra fallas y escribe el código: mecánicas, modos, motor del mapa y pruebas. |
| **Trabajo 2 · ARTE** | **ChatGPT con Codex** | Diseña y produce el arte de la ciudad, los vehículos, los modos y los personajes, como código de dibujo (Canvas 2D, WebGL o SVG en línea), paletas y medidas. |

(Si el autor lo prefiere, los dos trabajos se intercambian. Las misiones son las mismas para los dos.)

Cada misión se hace para **los dos juegos**. El código y el arte de cada uno quedan separados: lo de EnCicla en su repositorio y lo de El Metro en el suyo.

### 3. Las misiones (iguales para los dos trabajos)

#### M1 · Probar a fondo, encontrar fallas y proponer ideas innovadoras
- **Código:**
  - Corre las pruebas de cada juego y juega cada modo en un celular (412 × 915) y en un computador.
  - Reporta cada falla: pasos para reproducirla, lo esperado y lo que pasa, archivo y línea, gravedad y el arreglo propuesto en código.
  - Mide el rendimiento: cuadros por segundo en el centro de Medellín, con la cámara girada y lejos.
- **Arte:**
  - Revisa lo que se ve mal o no se entiende: textos encimados, colores sin contraste, íconos confusos o escalas equivocadas.
  - Por cada cosa, una captura descrita y su arreglo visual.
- **Ideas:** al menos 10 por juego, innovadoras y posibles en un HTML sin librerías, ordenadas por impacto y esfuerzo.

#### M2 · El mapa único: terminar de detallarlo
- **Código** (en `motor-valle/`, según su hoja de ruta F2–F4):
  - Pasar al motor los generadores de capas de El Metro (vías, edificios, puentes, ciudad, rieles, Metroplús y rutas), con salida para los dos.
  - Escribir un solo cargador `motor-valle/js/valle.js` para los dos juegos.
  - Agregar los deprimidos o túneles (`is_tunnel`).
  - Hacer una cuadrícula de dos niveles para que el GPS no conecte un puente con la calle de abajo.
  - Ampliar la auditoría del mapa para medir los dos juegos con las mismas cifras.
- **Arte:**
  - Detallar el mapa: barrios de ladera, quebradas, parques, separadores, andenes, mobiliario, vegetación por zona, más lugares emblemáticos con su forma real, y noche y lluvia.
  - Entregar por cada elemento sus colores, medidas y el código para dibujarlo.

#### M3 · Mejores gráficos en cada modo de juego
- **Código:** optimizar y mejorar el dibujo de cada modo, sin perder fluidez:
  - EnCicla: ciudad 3D, pixel clásico, vista panorámica, mapa grande y minijuegos de los oficios;
  - El Metro: cabina, Ciudad Libre, vista 3D, maqueta y Metrocable.
- **Arte:** una guía de estilo para cada modo con paleta, luz, sombras y tipografía en pantalla. Además, los diseños nuevos que falten:
  - escenarios de los minijuegos;
  - interiores de las estaciones;
  - pantallas de inicio y de resultado.

#### M4 · RunScooter en los dos juegos: endless runner en bici, en primera y tercera persona 3D
Se toma la jugabilidad de *endless runner* de **Run Scooter** (`juanfeliperico369-stack/RunRunZero`, https://juanfeliperico369-stack.github.io/RunRunZero/, del mismo autor) y se adapta a cada juego. Se reutiliza su motor de carrera en 3D (carriles, saltos, obstáculos, monedas y regalos) y se pasa al mapa real:
- **Código:**
  - Un modo «carrera sin fin» en bici, en 3D con vista en **primera persona** (manubrio) y en **tercera persona** (detrás de la bici).
  - Corre por calles reales del mapa único: carriles, obstáculos, saltos, rampas, monedas u hojas, y un ritmo que acelera.
  - Funciona con el control táctil de los dos juegos y es fluido en un celular medio.
  - En EnCicla va por las ciclorrutas; en El Metro, a lo largo de las líneas y los corredores del Metroplús.
- **Arte:**
  - La bici y el ciclista vistos de atrás y en primera persona (manubrio y manos).
  - Obstáculos de Medellín: huecos, conos, motos, perros, chazas y charcos.
  - El horizonte del valle, las montañas en capas, la luz de cada hora y los efectos de velocidad.

#### M5 · Más vehículos para un mundo abierto más jugable
- **Código:** se puede subir y bajar de cada vehículo en el mundo abierto, cada uno con su física y su sonido:
  - scooter, moto, carro, taxi, bus alimentador, bus del Metroplús, tranvía y metro (en El Metro);
  - en EnCicla, la bici, la bici eléctrica, el scooter, el camión de Balance y caminar;
  - de Run Scooter se traen el skate, los patines y el monopatín eléctrico, con su manejo, a los dos juegos.

  Hay reglas de tránsito y de dónde puede ir cada uno.
- **Arte:** cada vehículo visto desde arriba, en 3D en primera y tercera persona, y de lado, con su librea real cuando exista, luces de noche y su sombra.

#### M6 · La trama del mundo abierto, con fragmentos cruzados
- **Código:** misiones del mundo abierto que usan los vehículos de M5 y el modo de M4.
  - Personajes que aparecen en los dos juegos, cada uno en su papel.
  - **Easter eggs cruzados:** fragmentos de la historia de El Metro escondidos en EnCicla, y al revés.
  - Un guion en datos (JSON) por juego.
- **Arte:** retratos de los personajes, escenas o cinemáticas, objetos de la trama y señales en el mapa para los Easter eggs.

### 4. Lo que pide Claude para Juega EnCicla (que es lo que Claude va a armar)
1. **Fallas:** la lista de M1 para EnCicla, con prioridad. Sobre todo:
   - los gestos de dos dedos en celulares reales;
   - los puentes y el viaducto (cuándo vas arriba o abajo);
   - el paseo guiado;
   - la velocidad elegible;
   - la calidad automática.
2. **RunScooter para EnCicla:**
   - el diseño del modo (reglas, puntaje, ritmo, obstáculos) y el código del modo;
   - el arte de la bici EnCicla (verde, con la canasta) en primera y tercera persona, como funciones de Canvas o WebGL autocontenidas.
3. **Vehículos de EnCicla:** scooter y bici eléctrica jugables, con sus sprites desde arriba (16 px por casilla, 1 m = 1,6 px) y en 3D.
4. **Mapa:** túneles y deprimidos (dibujo y datos) y la cuadrícula de dos niveles para los pasos elevados, con el diseño del cambio en `motor-valle/`.
5. **Trama:** misiones del modo libre de EnCicla con los fragmentos de El Metro para sus Easter eggs, en el formato de `contenido/guion/*.json`.
6. **Gráficos:**
   - la guía de estilo de la ciudad 3D de EnCicla para la noche, la lluvia y la niebla;
   - los interiores de las estaciones EnCicla;
   - mejores casas de ladera.

### 5. Después de la entrega
Claude arma lo entregado en Juega EnCicla: revisa, prueba, integra y publica la «revolución» (v2.0): HTML, APK y enlace. La IA de El Metro hace lo mismo en El Metro. El mapa sigue siendo uno solo, en `motor-valle/`.

### 6. Formato del documento único de entrega
1. **Resumen:** qué se hizo y qué falta.
2. **M1 a M6, cada una con:**
   - lo que se hizo;
   - el código completo de cada archivo nuevo o cambiado, con su ruta (`src/js/NN-nombre.js`) y su juego;
   - el arte como código de dibujo y especificaciones (paleta en hexadecimal, medidas en metros y en px);
   - cómo probarlo.
3. **Reporte de pruebas y fallas:** una tabla por juego.
4. **Ideas innovadoras:** por juego, ordenadas por impacto y esfuerzo.
5. **Lista de verificación:** qué se probó y en qué dispositivo.

**Todo en este único documento.**

---

# Anexo E · Cómo integrar lo nuevo (vehículos, modos, trama, arte, mapa y pruebas)

## Integrar lo nuevo en Juega EnCicla

**Para Gemini con Antigravity, ChatGPT con Codex y cualquier agente que entregue código o arte para EnCicla · v1.7.2 · 19‑nov‑2026.**

Esta guía dice **dónde y cómo** entra cada cosa del [plan único](PLAN-UNICO-IA.md):
- un vehículo;
- un modo de juego (la carrera sin fin de Run Scooter);
- una misión de la trama;
- el arte;
- un cambio del mapa;
- sus pruebas.

Si lo entregado sigue esta guía, entra sin tocar el resto del juego.

### 0. Reglas que no se negocian
- **Un solo HTML**, sin librerías externas (nada de Three.js, Phaser ni CDN) y sin internet. WebGL o Canvas 2D a mano.
- **Español de Colombia, todo público.** Sin datos personales.
- **Fluido en un celular modesto.** En la prueba con la CPU 4 veces más lenta, la mediana debe quedar por debajo de 40 ms por cuadro.
- **No romper el guardado** (`localStorage` `juegaencicla.v1`, objeto `Save.data`):
  - campos nuevos con valor por defecto (`S.x || (S.x = …)`);
  - nunca renombrar ni borrar los que ya existen.
- **El arte va como código de dibujo**, con respaldo procedural: si falta un dibujo nuevo, el juego usa el de siempre.
- **El mapa solo se cambia en `motor-valle/`** (ver [MOTOR.md](../motor-valle/MOTOR.md)).
- **Pruebas en verde:** `node tools/build.js` y `node tests/run.js` deben terminar en `✓ TODAS LAS PRUEBAS PASARON`.

### 1. Dónde va cada archivo
Los archivos de `src/js/` se juntan **en orden alfabético** en `dist/juega-encicla.html`. El número del nombre decide el orden.

| Qué | Archivo nuevo | Por qué ahí |
|---|---|---|
| Arte (funciones de dibujo) | `src/js/11-arte-<tema>.js` | Después de `10-art.js` (`Art`, `PAL`, `prect`…) |
| Vehículos | `src/js/26-veh-<id>.js` | Después del registro `25-vehiculos.js` |
| Modos y juegos | `src/js/94-<id>.js` (ya están `91-runner.js`, `92-vehiculos.js` y `93-trama.js`) | Después del registro `91-modos.js` y antes de `95-promo.js` y `99-boot.js` |
| Trama y textos | `contenido/guion/<nombre>.json` | `tools/build.js` lo embebe como `GUION.<nombre>` |
| Datos del mapa | `motor-valle/` | Nunca a mano en `src/data/` |
| Pruebas | una sección `3x)` en `tests/run.js` | Antes de `4) Rendimiento` |

**En la v2.0 ya están:**

| Archivo | Qué es |
|---|---|
| `91-runner.js` | Run EnCicla 3D |
| `91-taller-arte.js` | TallerValle: el arte de ChatGPT |
| `92-ciclovia.js` | La carrera de 3 carriles |
| `92-vehiculos.js` | Los 7 vehículos de Gemini |
| `93-trama.js` | «Ruedas y Rieles» |
| `94-revolucion.js` | Las une: las carreras en el menú, el Taller y el boleto |

Un vehículo nuevo con `libre: 1` sale solo en el Taller. Su dibujo de lado sale de TallerValle si se agrega a `ARTE_VEH`.

### 2. Un vehículo nuevo (M5: scooter, bici eléctrica, skate, patines, monopatín)
**Registro:** `src/js/25-vehiculos.js`. Ahí también están las cifras exactas de los tres de siempre: la bici EnCicla, a pie y el camión de Balance.

```js
/* src/js/26-veh-scooter.js */
const _scooterCache = {};
function scooterTop(col) {   // visto desde arriba, mirando al norte y centrado · 16 px por casilla (1 m = 1,6 px)
  if (_scooterCache[col]) return _scooterCache[col];
  const c = document.createElement('canvas'); c.width = 8; c.height = 16; const b = c.getContext('2d');
  prect(b, 3, 1, 2, 14, '#23272f');      // tabla (1,0 m × 0,15 m)
  prect(b, 1, 2, 6, 1, '#d6dde6');       // manubrio
  prect(b, 2, 6, 4, 5, col);             // conductor (hombros)
  pdisc(b, 4, 8, 2, SKINS[1]);           // cabeza
  return (_scooterCache[col] = c);
}
JE.vehiculos.registrar('scooter', {
  n: 'Scooter eléctrico', corto: 'scooter', icon: '🛴',
  fis: { max: 70, acc: 45, brk: 80, coast: 30, w0: 4.2, w1: 2.2, tw: .08, r: 2.2 },   // px/s del diseño de 8 px (la bici: 60/30/72/40)
  asist: 1,                                   // motor: no se frena en las subidas
  suelo: t => t === TT.STEPS ? 0 : t === TT.GRASS ? .35 : (SURF[t] || .5),   // no sube escaleras, en el pasto casi no anda
  timbre: 1, bajar: 1, libre: 1,              // con timbre, se parquea y sale en el selector «Vehículo» del modo libre
  gasto: .05,                                 // energía por segundo en el modo libre (la bici gasta 0,35)
  spr: R => scooterTop(R.mode.shirt || PAL.vd),
  lado: (b, x, y, R, yo, fase) => { prect(b, x - 6, y - 3, 12, 2, '#23272f'); prect(b, x + 4, y - 14, 2, 11, '#d6dde6'); Art.person(b, x - 1, y - 3, yo, 0, 1); }   // vista panorámica
});
```

**Campos:**

| Campo | Qué es | Si falta |
|---|---|---|
| `n`, `corto`, `icon` | Nombre, nombre corto y emoji para avisos y botones | `n` = id |
| `base` | De quién hereda: `'bike'`, `'walk'` o `'truck'` | `'bike'` |
| `fis` | `max`, `acc`, `brk` y `coast` en px/s del diseño de 8 px (×`WK` y ×la velocidad elegida); `w0` y `w1` giro en rad/s parado y a toda marcha; `tw` inercia del giro en s; `r` radio de choque en px | Los de la base |
| `suelo(t)` | Multiplicador de la velocidad por tipo de casilla (`TT`) | El de la base |
| `loma` | `[k, mín, máx]`: en la pendiente `p`, la velocidad se multiplica por `clamp(1 − k·p, mín, máx)` | El de la base (bici `[2.2, .5, 1.32]`) |
| `asist` | `1`: no se frena en subida | No |
| `solido(t)` | `true` si no puede entrar a la casilla `t` | El de la base (`SOLID`) |
| `via` | `1`: solo por calles; el GPS y las salidas van por la vía | No |
| `spr(R)` | Lienzo visto desde arriba, mirando al norte | El de la base |
| `lado(b, x, y, R, yo, fase)` | Dibujo de lado en la vista panorámica | El de la bici |
| `timbre`, `bajar`, `libre`, `gasto` | Timbre, parquear, salir en el selector «Vehículo» del modo libre (`92-vehiculos.js`) y energía | `0`, `1`, `0`, la de la bici |

**API:**
- `JE.vehiculos.usar('scooter')`: súbete ya, en la partida actual.
- `JE.vehiculos.libres()`: los que se eligen en el modo libre.
- `JE.vehiculos.mejorar('bike', { spr, lado })`: arte nuevo para uno de siempre. Su física no se cambia: está probada.

### 3. Un modo nuevo (M4: la carrera sin fin)
**Registro:** `src/js/91-modos.js`. El modo sale solo en la pestaña **Ruta**, debajo de la carrera de postales, con un botón por nivel. Antes de empezar se ven sus metas y sus reglas. Gana estrellas por nivel, pero no toca la racha, las mejoras ni los logros del escalafón.

```js
/* src/js/92-sinfin.js */
class ModoSinFin extends Mode {
  constructor(role, turno, opt) {
    super(role, turno, opt);                        // this.t, this.score, this.rng (semilla), this.mods, this.goals…
    this.view = { kind: 'px', dw: 320, dh: 180 };   // búfer de 320×180 px que se escala a la pantalla ('fit': sin pixelar)
    this.vel = [9, 12, 15][turno - 1];              // m/s según el nivel; turno = nivel (1, 2, 3)
    this.dist = 0; this.carril = 1;
    this.goal('Recorre 800 m', true, () => this.dist >= 800, () => Math.round(this.dist) + ' m');
    this.goal('Recoge 20 hojas', false, () => this.hojas >= 20, () => (this.hojas | 0) + '/20');
  }
  update(dt) {                                      // dt en segundos (máx. 0,05)
    this.t += dt; const d = Input.dir();            // joystick o teclado: { x, y, m } (m de 0 a 1)
    if (d && d.m > .5 && !this.giro) { this.carril = clamp(this.carril + Math.sign(d.x), 0, 2); this.giro = 1; } else if (!d || d.m < .3) this.giro = 0;
    this.dist += this.vel * dt; this.score = Math.round(this.dist / 10);
    if (this.choco) this.end();                     // end(): termina y muestra el resultado
  }
  render(V) { const b = V.b; b.fillStyle = '#7ec8ff'; b.fillRect(0, 0, 320, 180); /* … el camino en 3D … */ }
  hud(V) { this.btns = []; V.text(Math.round(this.dist) + ' m', 12, 40, { size: 18, color: '#fff', bg: '#0a2342cc', pad: 4 }); }
  pointer(type, vx, vy, cx, cy) { if (type === 'down') { this.carril = clamp(this.carril + (cx < V_W() / 2 ? -1 : 1), 0, 2); return true; } return super.pointer(type, vx, vy, cx, cy); }
  bot() { /* lo que haría un jugador: para las pruebas */ }
}
const V_W = () => View.w;
JE.modos.registrar({
  id: 'sinfin', name: 'Carrera sin fin', cls: ModoSinFin, emoji: '🛴',
  niveles: ['Fácil', 'Rápida', 'Turbo'],
  desc: 'Por la ciclorruta: esquiva huecos y conos, salta y recoge hojas.',
  how: ['Desliza a los lados para cambiar de carril.', 'Arriba para saltar los huecos.', 'Cada 200 m va más rápido.']
});
```

**Lo que el juego llama en el modo:**

| Método | Cuándo |
|---|---|
| `update(dt)` | Cada cuadro, sin pausa |
| `render(V)` | Dibujar en `V.b` (Canvas 2D del búfer, en px de `view`) |
| `renderTop(V)` (opcional) | Capa nítida en `V.ctx`, la pantalla |
| `hud(V)` | Textos y botones del lienzo: `V.text(t, x, y, { size, color, bg, pad, align, body })` y `this.button(…)` |
| `info()` | Lo de arriba: `{ clock, score, chips: [{ t, c }] }` |
| `actions()` | Botones redondos de la derecha: `[{ id, icon, label, fn }]` |
| `pointer(type, vx, vy, cx, cy)` y `key(e)` | Toque y teclado |
| `result()` | Por defecto sale de las metas: las obligatorias (`main`) aprueban y cada meta cumplida es una estrella |

**Vistas (`this.view.kind`):**
- `'px'`: búfer pixelado de `dw × dh`;
- `'fit'`: el mismo búfer, suave;
- `'map'`: la ciudad, con `MapMode` y `this.setupRide({ start: { x, y } })`, como los oficios.

Para **WebGL**, crea tu propio `<canvas>` encima de `#cv` en el constructor y quítalo cuando termine el modo.

**El mapa real para la carrera:**

| Llamada | Devuelve |
|---|---|
| `JE.map.lanes` | Ciclorrutas: polilíneas con `len` en px; `cv` es la ciclovía |
| `JE.map.at(L, s)` | `{ x, y, a }` a `s` px del inicio |
| `JE.map.project(L, x, y)` | `{ s, d }` |
| `JE.map.slope(x, y, a)` | La pendiente real |
| `JE.map.get(tx, ty)` | El tipo de casilla (`TT`) |
| `JE.map.lanesNear` | Las ciclorrutas cercanas |
| `JE.map.district` | El barrio |

Unidades: `TS = 16` px por casilla de 10 m (1 m = 1,6 px).

**Utilidades:**
- **Sonido:** `Snd.sfx('tap' | 'coin' | 'ok' | 'bad' | 'win' | 'star' | 'bell')` y `Snd.note(n, { type, v })`.
- **Avisos:** `JE.ui.toast(texto)`.
- **Guardar lo propio:** `const J = Save.data.juegos || (Save.data.juegos = {});` y luego `Save.save()`.
- **Para probar sin el menú:** `Game.start('sinfin', 1, { seed: 1, nov: NOVEDADES[0] })`.

### 4. Una misión de la trama (M6)
**Archivo:** `contenido/guion/misiones.json`. Son misiones del modo libre. Salen una o dos por día, las mismas todo el día, antes de las misiones menores. El lector está en `src/js/83-guion.js` (`guionMisiones`).

```json
{
  "id": "efrain-1",
  "txt": "Saluda a don Efraín, que cuida la red del Metro, en el Parque Norte",
  "lugar": "parquenorte",
  "nombre": "Don Efraín",
  "dias": "sabado|domingo|festivo",
  "desde": "8:00 a. m.",
  "hasta": "5:00 p. m.",
  "req": ["rosalba-1"],
  "h": 10,
  "xp": 25,
  "despues": "🔧 Don Efraín: «La red no es de hierro: es de la gente que la cuida.»",
  "huevo": "metro-efrain"
}
```

**Campos:**

| Campo | Qué es |
|---|---|
| `lugar` | Un id de `LUGARES` (`src/js/19-lugares.js`: `botero`, `pies`, `parquenorte`, `comuna13`…) o `[lat, lon]` |
| `dias` | `semana`, `sabado`, `domingo` y `festivo`, separados con `|`, o `todos` |
| `desde` y `hasta` | La hora, con el formato `7:00 a. m.` |
| `req` | Misiones de la trama que ya se deben haber hecho |
| `repite` | `true`: se puede repetir |
| `h` y `xp` | Hojas y experiencia |
| `despues` | Una frase o una lista, al cumplirla |
| `huevo` | El fragmento escondido (Easter egg) que queda en `Save.data.huevos` |

Lo hecho queda en `Save.data.tramaHechas`. (`Save.data.trama` es el estado de la trama «Ruedas y Rieles» de `93-trama.js`.)

**Los otros guiones** son JSON en la misma carpeta:
- `dia_del_valle.json`: la campaña, con un capítulo por turno;
- `ciudad.json`: lo que dice la ciudad por momento;
- `tutor.json`: los consejos por oficio;
- `fiestas.json`: los saludos de fiesta;
- `metro.json`: los huevos de pascua de El Metro, con Rosalba, su nieta y don Efraín.

### 5. El arte (M2, M3, M4 y M5)
- **Siempre código de dibujo:** Canvas 2D (o WebGL) que pinta en un lienzo propio, guardado en caché por clave (`color`, `fase`). Nada de imágenes externas.
- **Escala:** 16 px por casilla de 10 m, es decir 1 m = 1,6 px. Las vistas desde arriba miran al norte y van centradas. En la ciudad 3D, la altura se da en pisos (1 piso ≈ 3 m).
- **Paleta base** (`PAL` en `10-art.js`):

  | Nombre | Color |
  |---|---|
  | azul | `#0a2342` |
  | verde EnCicla | `#9bd341` |
  | crema | `#f4efd8` |
  | ámbar | `#ffc93c` |
  | coral | `#ff6b5a` |
  | cielo | `#56c7ff` |

  También están `SKINS`, `SHIRTS`, `HELMETS` y `BIKES`.
- **Ayudas:**
  - `prect(b, x, y, w, h, col)`, `pdisc(b, x, y, r, col)` y `pline(b, x0, y0, x1, y1, col)`;
  - `shade(col, k)` aclara u oscurece;
  - `Art.night(min)`: de 0 (día) a 1 (noche), para las luces y las ventanas encendidas.
- **El sistema Metro** se dibuja con `SisSpr` (`74-sistema.js`), que es el diseño de El Metro: no se duplica.
- **Arte nuevo para algo que ya existe:** se cambia la función y se deja la anterior como respaldo. En los vehículos se usa `JE.vehiculos.mejorar`.

### 6. Un cambio del mapa (M2: túneles, deprimidos, cuadrícula de dos niveles)
- Va en `motor-valle/`: `geo/build.py` y `geo/alturas.py`, o una capa nueva en `motor-valle/capas/`. Hay que subir la versión en `VERSION.json`.
- Se genera con `node motor-valle/motor.mjs encicla` y se copia a El Metro con `node motor-valle/sincronizar.mjs ../MetroZero`.
- **Cómo lo lee el juego:** los puentes y el viaducto llegan por `alturas.json` y `76-altura.js`. Un túnel puede seguir el mismo camino, con un nivel `-1`: va debajo de la calle, sin dibujarse encima.

### 7. Pruebas
1. `node tools/build.js`: compila `dist/juega-encicla.html` y `dist/ENCICLA-TODO.md`.
2. `node tests/run.js`: autotest, minijuegos, 54 partidas del bot, interfaz sin encimados, cada versión (3k, 3l, 3m…) y rendimiento.
3. **Una sección nueva** por cada cosa entregada, como la `3m` (registro de vehículos, modos y trama):
   - registra lo nuevo;
   - juégalo unos segundos;
   - comprueba que no deja errores (`JE.errors`);
   - limpia lo que creó.
4. **Juégalo de verdad:**
   - en un celular de 412 × 915 y acostado (915 × 412);
   - en un computador;
   - de día y de noche, con lluvia;
   - en 3D, en pixel y en la vista panorámica.

### 8. La entrega
Según el plan único, **todo en un solo documento**:
- el código completo de cada archivo nuevo o cambiado, con su ruta;
- el arte como código;
- cómo se probó.

Claude lo arma en el juego, corre las pruebas y lo publica.

---

# FIN DEL DOCUMENTO
