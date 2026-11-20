# Revisión visual con capturas · Motor City 2.9.1 (G‑H1)

- **Fecha:** 2026-11-20
- **Autor:** Gemini · Antigravity («hydrogen»)
- **Versión auditada:** Motor City **2.9.1** (`dist/juegos/mandados.html`)
- **Comando ejecutado:** `NODE_PATH=/tmp/pw/node_modules MC_CHROMIUM=/usr/bin/chromium node motor.mjs capturas`
- **Resultado técnico:** `14 capturas en dist/capturas/` · viewport `412 × 860` (`×2`, táctil) · `estilo realista` · `arte gemini` (por defecto) · `GPU software` · `La interfaz tapa el centro: no` · `sprites que faltan: 0` · `errores: ninguno`.
- **Verificación adicional (piel ChatGPT):** se capturaron también 4 vistas de control con `MC.arte.usar('chatgpt')` (`cenital 10h`, `maqueta 10h`, `lateral 10h` y `lateral 20h30`, sin errores ni sprites faltantes).

---

## 1. Verificación de correcciones 2.8 / 2.9 sobre el reporte anterior (2.7)

| Hallazgo previo (reporte 2.7) | Estado en Motor City 2.9.1 | Evidencia visual |
|---|---|---|
| Botones derechos vs `zonaLibre` / flecha de misión | ✅ **Corregido** | La flecha `43 m` / `57 m` queda dentro de la zona libre, sin tocar la columna de botones (`Ajustes`). |
| Aviso `ui.aviso` desfasado al cambiar vista | ✅ **Corregido** | Cada vista muestra su etiqueta correcta (`Maqueta 2:1`, `Lateral`, `Ciudad 3D`, `Cenital`) sin arrastrar avisos previos. |
| Casas de 1 piso sin ventanas iluminadas de noche | ✅ **Corregido (parcial)** | En `lateral-20h30.png` ya se encienden ventanas cálidas ámbar y halos de farolas; solo quedan algunos vanos azul claro diurno en fachadas apagadas (ver hallazgo nuevo abajo). |
| Columnas desplazadas en cubierta gris (`maqueta`) | ✅ **Corregido** | En `maqueta-10h/17h/20h30.png` los postes de la cubierta inferior izquierda calzan bajo el techo gris. |
| Botón `#bcComprar` recortado en `mi-casa.png` | ✅ **Corregido** | Ahora parte limpiamente en dos líneas (`🛋️` / `Comprar`) dentro del borde redondeado. |
| Burbuja `🚻` recortada contra el muro superior en `mi-casa.png` | ✅ **Corregido** | Queda contenida dentro de la `sala`, sin salirse del muro. |
| Etiqueta `cocina` cortada por puerta en `mi-casa.png` | ✅ **Corregido** | Totalmente legible dentro de la cocina. |
| Cebras cruzadas en `#` en intersecciones | 🟡 **Persiste (leve)** | Sigue viéndose el cruce en rejilla `#` en la esquina izquierda (`cenital-*`, `ciudad3d-*`, `capa-valor`) y borde inferior (`maqueta-*`). |
| Sombra ovalada vertical de copas en `maqueta` | 🟡 **Mejoró, pero persiste leve** | Más tenue que en 2.7, pero en `maqueta-10h.png` y `maqueta-17h.png` aún se notan óvalos grises altos detrás de varios troncos. |

---

## 2. Tabla resumen: `foto → hallazgo → gravedad`

| Foto | Hallazgo concreto | Gravedad |
|---|---|---|
| `capa-valor.png` | Un *storylet* temporizado (`histT > 25 s`, «Tienda del peluquero candy Angel's») salta justo durante la captura #13 (reproducible en 2.9.0 y 2.9.1) y cubre la mitad inferior del mapa de valor del suelo y el minimapa. | **Media** (afecta la captura automática de `capa-valor.png`) |
| `cenital-10h/17h/20h30.png`, `ciudad3d-10h/17h/20h30.png`, `capa-valor.png` | Las etiquetas flotantes de lugares del mundo (`Mixtura Gourmet`, `Hotel San Juan`, `Casa Hotel Guatapé`) se dibujan debajo de la columna derecha de botones (`Vehículo`, `Sonido`, `Agua`). | **Baja** |
| `cenital-*`, `ciudad3d-*`, `maqueta-*`, `capa-valor.png` | En la intersección del borde izquierdo (y en la parte inferior de `maqueta`), dos pasos de cebra se cruzan formando una cuadrícula `#`. | **Baja** |
| `lateral-20h30.png`, `maqueta-20h30.png`, `ciudad3d-20h30.png` | Varias ventanas «apagadas» a las 8:32 p. m. siguen mostrando relleno celeste brillante diurno junto a las ventanas cálidas encendidas. | **Baja** |
| `cenital-17h/20h30.png`, `maqueta-17h/20h30.png`, `lateral-17h/20h30.png`, `ciudad3d-17h/20h30.png` | Las fichas secundarias superiores (`$ 10.000`, `Carrera 27` y `Nublado · 16 °C` en `ciudad3d-17h`) quedan muy atenuadas (bajo contraste de texto gris sobre pastilla translúcida). | **Baja** |
| `maqueta-10h/17h/20h30.png` | Persisten óvalos de sombra vertical tenues detrás de algunos troncos; en `maqueta-20h30.png` la bandada de aves se ve como trazos curvos oscuros sobre la vía gris nocturna. | **Baja** |
| `lateral-10h/17h/20h30.png` | La franja inferior de corte de tierra detrás de `0 km/h` (~10 % de la altura) se percibe algo plana frente al detalle de los guayacanes; en `lateral-17h` dos aves blancas pasan detrás de la ficha `5:02 p. m.`. | **Baja** |
| `mi-casa.png` | Correcciones principales listas (`Comprar`, `🚻`, `cocina`); solo quedan solapes cosméticos menores de rótulos (`sala`, `alcoba`, `baño`, `patio`) con bordes de sofá, cama, tina y matera. | **Baja** |
| *(Control extra)* `arte/chatgpt` en `lateral-10h` / `lateral-20h30` | Los árboles pictóricos (ceibas, mangos, guayacanes), andenes de ladrillo y zócalos lucen sobresalientes (`0` sprites faltantes), pero aparece una pequeña astilla verde flotante (~10 px) en el cielo a la izquierda del mango superior (junto a `Restaurante Tolú`, posible píxel sobrante en `chatgpt_arboles.webp`), y algunos postigos azules brillan de noche. | **Baja** |

---

## 3. Las 5 preguntas obligatorias por foto (14 capturas de `dist/capturas/`)

### 1) `cenital-10h.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: vías, cebras, techos de teja, guayacanes amarillos/rosados, ciclista y minimapa se leen al instante.
2. **¿La interfaz tapa algo?** El centro está libre; solo las etiquetas del mapa a la derecha quedan detrás de `Vehículo`/`Sonido`/`Agua`.
3. **¿Proporciones cuadran?** Sí: ciclista, carriles, copas y techos guardan escala coherente.
4. **¿Algo roto o recortado?** Dos cebras se superponen en `#` en el borde izquierdo.
5. **Bonito vs raro:** Bonito: las sombras solares limpias y los guayacanes en flor; raro: el cruce `#` de cebras.

### 2) `maqueta-10h.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: perspectiva 2:1 muy clara con ciclista, perro, casas, postes y árboles de pie.
2. **¿La interfaz tapa algo?** Centro libre; aviso `Maqueta 2:1` correcto. Algunas etiquetas del mapa asoman bajo la tarjeta de misión.
3. **¿Proporciones cuadran?** Sí: cubierta gris inferior ya alinea sus columnas; árboles y casas se sienten en escala de maqueta.
4. **¿Algo roto o recortado?** Cruce de cebras en la parte inferior central.
5. **Bonito vs raro:** Bonito: el volumen del pueblo y la cubierta corregida; raro: óvalos de sombra vertical tenues tras varios troncos.

### 3) `lateral-10h.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: perfil urbano con cielo azul degradado, casas paisas con zócalos y árboles densos.
2. **¿La interfaz tapa algo?** No; la flecha `43 m` queda separada de `Ajustes`.
3. **¿Proporciones cuadran?** Sí: relación ciclista–perro–puertas–árboles muy convincente.
4. **¿Algo roto o recortado?** Ningún recorte de texto ni error visual grave.
5. **Bonito vs raro:** Bonito: la postal de Guatapé con guayacanes en flor; raro: la franja inferior marrón sólida bajo el pasto.

### 4) `ciudad3d-10h.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: lectura oblicua 3D muy limpia de calles, casas extruidas y arboleda.
2. **¿La interfaz tapa algo?** Centro libre; etiquetas de comercios a la derecha quedan detrás de los botones.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Cruce `#` de cebras a la izquierda.
5. **Bonito vs raro:** Bonito: el relieve de fachadas y el aviso `Ciudad 3D` ya sincronizado; raro: las etiquetas detrás de la barra derecha.

### 5) `cenital-17h.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: sombras alargadas de las 5:02 p. m. y cielo nublado coherentes.
2. **¿La interfaz tapa algo?** Centro libre; sale el aviso contextual `🚧 Un vehículo` limpio.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Mismo cruce `#` de cebras a la izquierda.
5. **Bonito vs raro:** Bonito: sombras largas hacia el oriente; raro: fichas `$ 10.000` y `Carrera 27` muy atenuadas en contraste.

### 6) `maqueta-17h.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: tono de tarde nublada natural y peatones visibles en las vías.
2. **¿La interfaz tapa algo?** Centro libre.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Cruce de cebras en el borde inferior.
5. **Bonito vs raro:** Bonito: atmósfera nublada coherente con el clima; raro: óvalos de sombra tras los troncos y fichas superiores tenues.

### 7) `lateral-17h.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: silueta urbana contra cielo gris-violáceo de tarde nublada.
2. **¿La interfaz tapa algo?** No.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Sin recortes; solo dos trazos blancos de aves en el cielo coinciden justo detrás de `5:02 p. m.`.
5. **Bonito vs raro:** Bonito: el degradado nublado de las 5 p. m.; raro: contraste bajo en `$ 10.000` y `Carrera 27`.

### 8) `ciudad3d-17h.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: sombras largas suaves y buena lectura de la esquina.
2. **¿La interfaz tapa algo?** Centro libre; etiquetas detrás de los botones derechos.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Cruce `#` de cebras a la izquierda.
5. **Bonito vs raro:** Bonito: suavidad de luz de tarde; raro: la ficha `Nublado · 16 °C` aparece muy atenuada.

### 9) `cenital-20h30.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: noche clara con halos cálidos de farolas sobre el asfalto y cebras legibles.
2. **¿La interfaz tapa algo?** Centro libre; aviso `Cenital` limpio.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Mismo cruce `#` de cebras a la izquierda.
5. **Bonito vs raro:** Bonito: la iluminación cálida de postes de noche; raro: contraste bajo en las pastillas secundarias superiores.

### 10) `maqueta-20h30.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: noche atmosférica con farolas encendidas, peatones y ciclista visibles.
2. **¿La interfaz tapa algo?** Centro libre.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Ventanas apagadas en tono celeste claro diurno en algunas casas; bandada nocturna sobre la calle.
5. **Bonito vs raro:** Bonito: el brillo cálido de los postes sobre la calle; raro: los arcos oscuros de aves volando sobre el asfalto de noche y las ventanas celestes.

### 11) `lateral-20h30.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: noche muy legible con cielo azul profundo, farolas cálidas y ventanas ámbar encendidas en casas bajas.
2. **¿La interfaz tapa algo?** No.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Sin recortes de interfaz.
5. **Bonito vs raro:** Bonito: el salto enorme respecto a 2.7 gracias a las ventanas encendidas y los halos cálidos; raro: las ventanas apagadas que todavía quedan azul claro diurno.

### 12) `ciudad3d-20h30.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: calles nocturnas iluminadas por farolas, perro y ciclista claros.
2. **¿La interfaz tapa algo?** Centro libre; etiquetas derechas tras la columna de botones.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** Cruce `#` de cebras a la izquierda; una ventana celeste brillante en la casita inferior izquierda.
5. **Bonito vs raro:** Bonito: profundidad nocturna y halos; raro: el azul claro de la ventana apagada de noche.

### 13) `capa-valor.png`
1. **¿Se distingue cada cosa en 2 s?** La leyenda (`Valor del suelo 🔴 bajo 🟡 medio 🟢 alto`) y la mitad superior del mapa de calor sí; la mitad inferior queda tapada por un diálogo emergente.
2. **¿La interfaz tapa algo?** Sí (por evento temporizado): el diálogo de *storylet* (`Tienda del peluquero candy Angel's`) aparece justo a los ~25 s y tapa parte del mapa, el joystick y el minimapa.
3. **¿Proporciones cuadran?** Sí.
4. **¿Algo roto o recortado?** El diálogo es funcional, pero conviene pausar o silenciar *storylets* durante `herramientas/capturas.mjs` para tener una captura limpia de la capa.
5. **Bonito vs raro:** Bonito: la leyenda nueva ya integrada sin solaparse con la misión; raro: el diálogo aleatorio colándose en la foto estándar.

### 14) `mi-casa.png`
1. **¿Se distingue cada cosa en 2 s?** Sí: plano arquitectónico claro (`sala`, `comedor`, `cocina`, `patio`, `baño`, `ropas`, 3 `alcoba`), habitante animado con burbuja `🚻` y barra inferior limpia.
2. **¿La interfaz tapa algo?** No; los 5 botones inferiores (`Estilo`, `Comprar`, `Girar`, `Quitar`, `Salir`) y la barra `✨ Ambiente 76/100` dejan todo el plano despejado.
3. **¿Proporciones cuadran?** Sí: muebles, puertas abatibles y personaje están a escala cómoda.
4. **¿Algo roto o recortado?** Todos los recortes de 2.7 quedaron corregidos (`Comprar` ya no se corta, `🚻` queda adentro, `cocina` se lee entera). Solo quedan pequeños roces de los rótulos de cuartos con bordes de muebles (`sala`, `alcoba`, `baño`, `patio`).
5. **Bonito vs raro:** Bonito: el salto de pulido en la barra inferior y el plano; raro: el pequeño solape de algunas etiquetas de cuarto sobre cama/tina/matera.
