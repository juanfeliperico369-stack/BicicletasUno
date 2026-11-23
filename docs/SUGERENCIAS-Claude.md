# Sugerencias para el repositorio · Claude

**23‑nov‑2026.** Lo que aprendí en las rondas 2.1 a 3.5 de Juega EnCicla, trabajando a la vez con OpenAI GPT‑6, Gemini con Antigravity y otra sesión de Claude. Cada sugerencia viene de algo que pasó de verdad aquí.

## 1. Trabajar varias IA a la vez sin pisarse
- **Cada IA con su prefijo de archivos** y su ficha en `coord/agentes/<ia>.json`. Hoy: Claude `99a`–`99m` y `99s`–`99v`; Gemini y Antigravity `99n`–`99q` (y `99y`); GPT‑6 `99r`; Codex `99w`–`99x`. Los módulos se cargan por orden alfabético: el que va después puede envolver al de antes.
- **Antes de crear un sistema, busca si ya existe.** En la 3.4 quedaron dos sistemas de habilidades (con dos «Resistencia») y dos de encargos con los mismos vecinos, porque dos IA los hicieron el mismo día. Busca primero (`grep -rn "habilidad\|encargo\|Resistencia" src/js`) y **súmale al que hay**: `Hoy.fuentes`, `Save.registrar`, `contenido/guion/*.json`.
- **Una sola tabla de personajes.** El reparto está en `docs/IA-ENCICLA.md` § 5 y en `contenido/guion/trama_valle.json` (con doble rol desde la 3.5). Léela antes de escribir una historia.
- **Unir seguido.** Quien publica en `main` une las ramas de las demás con las pruebas en verde y deja una nota en `coord/buzon/`. Las uniones de esta ronda fueron limpias porque cada IA tocó sus propios archivos.

## 2. Errores que ya pasaron (y cómo no repetirlos)
- **Un comentario `//` a mitad de una línea larga apaga el resto de la línea.** Pasó dos veces: en la Ruta a Guatapé (2.1) y en Controles (3.1.0, que llegó a la página: tocar una opción no guardaba). En líneas largas usa `/* … */`.
- **Puntos que se perdían sin que nadie lo notara.** Run 3D sumaba las hojas donde el modo las borraba en cada cuadro, y en los turnos de varias fases el minijuego de la fase no sumaba. Las pruebas pasaban porque miraban el código, no lo que ve el jugador. Desde la 3.3, `tests/revolucion-encicla.js` (V6) revisa en **cada modo** que la ★ y el resultado en pantalla coincidan con lo guardado; cubre solos los modos nuevos (pasó de 17 a 29 sin tocarla).
- **Avisos encima de avisos.** El coach, el aviso de la cámara y una tarjeta salían al mismo tiempo al entrar al valle. Regla: **una cosa a la vez**; lo que no es urgente sale cuando el jugador se pregunta «¿y ahora qué?» (al llegar a un destino) o con un botón.
- **Una función que espera algo y recibe otra cosa.** Las teclas de Run 3D llegaban como evento y el corredor esperaba el nombre de la tecla: no funcionaban en computador. Prueba también el teclado.

## 3. Pruebas y publicación
- `node tools/build.js && node tests/run.js` antes de cada push. **No se publica en rojo** (regla en `CLAUDE.md`; lo corre `.github/workflows/pruebas.yml` en cada push).
- Cada función nueva, con su sección de pruebas en `tests/revolucion-encicla.js` (V, V2 … V7). Prueba lo que se ve: la burbuja, la tarjeta, el número en pantalla.
- **Mide el p95, no el promedio.** Se nota más un tirón de vez en cuando que ir siempre un poco más lento. `node tests/auditoria-modos.js --cpu=4` y, en el celular del autor, 📏 Medir este celular.
- Para publicar: subir la versión en `src/js/00-core.js` y en `app/android/app/build.gradle`; la APK sale del flujo `android.yml` (a mano) con su release `v<versión>`; en `gh-pages` **conserva `/metro/`**.

## 4. Rendimiento en celulares modestos
- **Nunca dos trozos de ciudad en el mismo cuadro.** Un trozo cuesta de 24 a 89 ms con la CPU 4× lenta. Precalienta en el menú (`99j-primer-minuto.js`) y deja que el adelanto espere si ya se dibujó otro hace menos de 80 ms. Eso solo bajó la mediana del modo libre de 33,3 a 16,8 ms.
- Lo que más falta: dibujar cada trozo por partes o en un Worker (pedido K‑1 a Codex).
- En el 3D: un trozo de textura nuevo por cuadro, caché de 40 texturas y 60 mallas, y la niebla esconde el borde.

## 5. Diseño para todo público
- **Arcade antes que realismo:** la velocidad del juego es la del mundo comprimido; cuando hay que mostrar una cifra, se usa la equivalente a la real (los radares dicen 24 km/h para una bici a fondo, no 270).
- **Enseñar sin regañar:** las frases de la ciudad y los datos («¿Sabías que?») van donde pasan las cosas: el peatón va primero, en rojo también para la bici, luz de noche.
- **Perdonar al jugador** (Celeste): el salto que se toca un instante antes de caer se guarda; el que cae a un hueco vuelve al borde sin perder lo ganado.
- **Todo liberado, pero guiado:** no se esconde nada; «🧭 Hoy en el valle» sugiere tres cosas a quien no sabe por dónde empezar.

## 6. Contenido como datos
- Las historias y las frases van en `contenido/guion/*.json` (`encargos.json`, `frases.json`, `trama_valle.json`…). Así el autor u otra IA agregan contenido sin programar, y el código no cambia.
- El guardado solo crece: las claves nuevas se registran con `Save.registrar('clave', 'tipo', 'dueño')` y la prueba final de `tests/run.js` falla si aparece una sin registrar.

## 7. Arte
- **Pedir arte solo donde el dibujo por código llegó a su techo** (hoy: las escenas laterales). La entrega c99 (292 imágenes) no entró porque no superaba lo que ya había.
- Siempre con **respaldo por código** (si falta la imagen, se ve lo de hoy), **fondo magenta** `#FF00FF` y archivada en `arte/entregas/<fecha>-<entrega>/` con su manifiesto.
- Una **imagen ancla** primero (G‑00, G‑131) y, cuando el autor la apruebe, el resto.

## 8. Privacidad
- El 🧪 modo prueba y el 📏 medir **no mandan nada a ninguna parte**: el informe solo sale si alguien lo copia. Nada de nombres ni del correo del autor en el repositorio.
