# Publicar Juega EnCicla en Google Play

> Guía práctica para la ficha de Play, los formularios de la Consola y la firma del AAB.
> Paquete: `com.juanfeliperico.juegaencicla` · Proyecto Android: `app/` (Capacitor 7) · Fecha: 4 de noviembre de 2026.
> Las reglas de Play cambian seguido: si la Consola dice algo distinto a esta guía, manda la Consola.

## 0. Lista rápida

| Paso | Dónde | Listo cuando |
|---|---|---|
| Llave de subida creada y respaldada | fuera del repo (`~/llaves/`) | existen 2 copias del `.jks` y las contraseñas están en un gestor |
| `app/keystore.properties` | local, **nunca en git** | `git check-ignore -v app/keystore.properties` lo muestra ignorado |
| Versión subida | `src/js/00-core.js` + `app/android/app/build.gradle` | `versionName` = versión del juego y `versionCode` mayor que el anterior |
| AAB firmado | `app/android/app/build/outputs/bundle/release/app-release.aab` | `jarsigner -verify` dice `jar verified` |
| Imágenes de la ficha | `dist/store/` (`node tools/store.js`) | ícono, gráfico de funciones y 6 capturas |
| Política de privacidad publicada | `https://juanfeliperico369-stack.github.io/BicicletasUno/privacidad.html` | abre en el navegador (ver nota del service worker en la sección 9) |
| Formularios de «Contenido de la app» | Play Console → Política → Contenido de la app | todo en verde |
| Prueba interna | Play Console → Pruebas → Prueba interna | los testers instalan desde Play |

## 1. Ficha de Play Store (español, `es-419`)

Idioma predeterminado sugerido: **Español (Latinoamérica) – es-419**.

### Nombre de la app (máx. 30 caracteres)

```text
Juega EnCicla
```
13 caracteres. Play no permite en el nombre emojis, mayúsculas sostenidas ni frases como «gratis», «#1» o «mejor».

### Descripción breve (máx. 80 caracteres)

```text
Vive los 9 oficios de la bici pública del Valle de Aburrá, incluso sin internet.
```
80 caracteres.

### Descripción completa (máx. 4000 caracteres)

```text
¿Sabes cuántas bicis mueve tu ciudad? Juega EnCicla es un videojuego arcade en pixel art sobre el sistema de bicicletas públicas del Valle de Aburrá. Empiezas pedaleando como usuario y descubres todo lo que pasa detrás de cada préstamo, hasta llegar a supervisor.

DEL USUARIO AL SUPERVISOR: 9 OFICIOS, 27 TURNOS
• Usuario: recorre el valle por las ciclorrutas y devuelve la bici a tiempo.
• Anfitrión: atiende la ventanilla, revisa tarjetas y presta bicis en buen estado.
• Mecánico: repara cada falla con la herramienta correcta, contra el reloj.
• Bodega: clasifica repuestos y carga bicis nuevas al camión.
• Apoyo: abre estaciones automáticas, haz relevos y verifica estaciones.
• Técnico: llega rápido a las estaciones dañadas y repáralas.
• Balance: maneja el camión y equilibra estaciones vacías y llenas.
• Monitoreo: desde la sala de control, decide a dónde van los camiones.
• Supervisor: abre y cierra el sistema y resuelve todo lo que pase en el día.

CARRERA DE POSTALES
Pasa por 4 lugares del valle y llega primero a la meta. Juega contra un bot (3 niveles) o contra un amigo en otro celular: los dos dispositivos se conectan directo, sin servidor del juego.

UN VALLE LLENO DE VIDA
Ciclorrutas, metro, tranvía, Metrocable, semáforos, peatones y noches con luces. Cada turno trae una novedad: aguacero, día sin carro, hora pico, partido en el estadio, Feria de las Flores o ciclovía.

PARA TODA LA FAMILIA
• Se juega con un dedo y la dificultad sube poco a poco.
• Mano guía, letra grande y ritmo tranquilo para quien lo necesite.
• Logros, álbum de postales y reto del día.
• Funciona sin internet.
• Sin anuncios, sin compras y sin cuentas.

TU PRIVACIDAD
El juego no recopila datos personales. Tu progreso se guarda solo en tu dispositivo y puedes exportarlo como respaldo.

AVISO
Juega EnCicla es una demo no oficial creada por Juan Felipe Rico y propuesta a EnCicla. No está afiliada, patrocinada ni avalada por EnCicla ni por el Área Metropolitana del Valle de Aburrá. El mapa es estilizado y los datos son aproximados, con fines didácticos.

Usa casco, respeta los semáforos y cuida la bici pública: ¡es de todos!
```
Unos 2.100 caracteres (cabe con holgura en el límite de 4.000).

### Otros campos de la ficha

| Campo | Valor |
|---|---|
| Tipo | Juego · Gratis |
| Categoría | **Juegos › Simulación** (recomendada, ver abajo) |
| Etiquetas (hasta 5) | Simulación, Arcade, Pixel art, Un jugador, Casual (elige las que la Consola ofrezca) |
| Sitio web | `https://juanfeliperico369-stack.github.io/BicicletasUno/pagina.html` |
| Correo de contacto (obligatorio y público) | un correo creado para el proyecto; **no** uses el personal |
| Política de privacidad | `https://juanfeliperico369-stack.github.io/BicicletasUno/privacidad.html` |

**Categoría recomendada: Simulación.** El juego es, en esencia, un simulador de oficios (atender, reparar, conducir, despachar),
como otros «simuladores de trabajo» de la tienda, y ahí lo encuentra quien busca ese tipo de juego.
*Educativo* también es válido, pero en Play suele asociarse a contenido curricular (matemáticas, lectura) y a público infantil,
lo que genera expectativas y revisiones de la política de Familias. Si EnCicla adopta el juego como herramienta pedagógica,
se puede cambiar a Educativo después sin volver a publicar.

## 2. Recursos gráficos

Se regeneran con `node tools/build.js && node tools/assets.js && node tools/store.js` (necesita Playwright).

| Recurso | Requisito de Play | Archivo |
|---|---|---|
| Ícono de la app | 512×512 PNG 32 bits, ≤1 MB | `dist/store/icon-512.png` |
| Gráfico de funciones | 1024×500 PNG/JPG 24 bits, sin transparencia | `dist/store/feature.png` |
| Capturas de teléfono | 2 a 8; PNG/JPG 24 bits; 320–3840 px; proporción máx. 2:1. Para recomendaciones, ≥4 capturas de ≥1080 px | `dist/store/phone-1.png` … `phone-6.png` (1080×1920) |
| Capturas de tablet 7" y 10" | opcionales (necesarias para destacar en tablets) | no generadas aún |
| Video promocional | opcional, enlace de YouTube | — |

Orden de las capturas: 1 portada · 2 escalafón · 3 Usuario · 4 Anfitrión · 5 Monitoreo · 6 Carrera.
Las mismas capturas, más livianas (540×960), quedan en `landing/capturas/` para la página web.

## 3. Clasificación de contenido (cuestionario IARC)

Play Console → Política → Contenido de la app → Clasificación del contenido. Categoría: **Juego**.
Responde con la verdad; estas son las respuestas que corresponden al juego actual:

| Pregunta (resumida) | Respuesta | Nota |
|---|---|---|
| Violencia (de cualquier tipo, incluida caricaturesca o fantástica) | **No** | Los «choques» con carros solo frenan la bici unos instantes; no hay heridos, sangre ni armas |
| Miedo / contenido aterrador | **No** | |
| Sexualidad, desnudez | **No** | |
| Lenguaje soez u ofensivo, humor grosero | **No** | |
| Sustancias controladas, alcohol, tabaco | **No** | La mejora «Tinto bien cargado» es café |
| Apuestas, juegos de azar simulados, cajas de botín | **No** | No hay compras ni recompensas aleatorias pagas |
| ¿Los usuarios pueden interactuar o intercambiar contenido? | **Sí** | En la Carrera en red, el otro jugador ve tu apodo (texto libre) y tu posición. Solo con quien compartes el código; no hay chat |
| ¿Comparte la ubicación física del usuario? | **No** | La posición es la del mapa del juego, no GPS |
| ¿Permite compras digitales? | **No** | |
| ¿Es un navegador web o buscador? | **No** | Solo abre el sitio oficial de EnCicla si el usuario lo toca |

Resultado esperado: **PEGI 3 / ESRB Everyone / «Todos»**, con el elemento interactivo «Los usuarios interactúan».

## 4. Público objetivo y Familias

Play Console → Contenido de la app → Público objetivo y contenido.

El juego está pensado para todas las edades, pero **incluir menores de 13 años activa la Política de Familias** (antes
«Diseñado para familias»), con requisitos y revisión adicionales.

**Recomendación para la primera publicación: Opción A.**

- **Opción A (recomendada ahora): 13 a 15, 16 a 17 y 18 o más.**
  Publicación más rápida. Si la Consola pregunta si la ficha «podría atraer a niños sin querer», responde con la verdad (el pixel art
  puede atraerlos): Play puede pedir una revisión adicional, pero el juego ya cumple lo esencial (sin anuncios, sin datos, con política).
- **Opción B (más adelante): agregar 6 a 8 y 9 a 12 (público mixto) y cumplir Familias.**
  Antes de elegirla:
  - Sin anuncios ni SDK de terceros: ✔ (no hay).
  - No recopilar datos de menores ni identificadores (Android ID, ID de publicidad, etc.): ✔. El manifiesto solo pide `INTERNET`.
  - Política de privacidad pública que hable de menores: ✔ (`privacidad.html`, sección 7).
  - **Pendiente:** la Carrera en red permite intercambiar un apodo de texto libre con otra persona. Para menores, Play pide una acción
    de un adulto (por ejemplo, «Pídele a un adulto que escriba el resultado de 7 × 8») antes de crear o unirse a una sala, o bien limitar
    el apodo a opciones predefinidas.
  - Revisa también que el contenido sea apropiado y que los enlaces externos (WhatsApp, sitio de EnCicla) no salgan sin que el usuario toque.
  - Después se puede solicitar la insignia «Aprobada por profesores» (Teacher Approved), que es opcional.

## 5. Seguridad de los datos (Data safety)

Play Console → Contenido de la app → Seguridad de los datos.

| Pregunta | Respuesta |
|---|---|
| ¿Tu app recopila o comparte alguno de los tipos de datos del usuario requeridos? | **No** |

Por qué es correcto:

- **Progreso, ajustes y apodo** se guardan solo en el dispositivo (`localStorage`). Lo que no sale del dispositivo no cuenta como «recopilado».
- **Respaldo (Exportar partidas)**: lo crea y lo comparte el propio usuario; es un traslado iniciado por el usuario, no una recopilación.
- **Carrera en red (WebRTC)**: la conexión es directa entre los dos dispositivos, cifrada (DTLS); el desarrollador no recibe nada y no hay
  servidor del juego. Los códigos de sala los comparte el usuario por decisión propia.
- **STUN (`stun.l.google.com`)**: solo sirve para que el dispositivo descubra su dirección pública; no se envía ningún dato del usuario.
- **Cámara** (si se agrega «Escanear» el QR): se procesa en el dispositivo y no se guarda ni se envía.
- Sin analítica, sin informes de fallos, sin anuncios, sin cuentas.

Al responder «No», la Consola no pide las preguntas de cifrado ni de eliminación de datos. Si en el futuro se agrega analítica,
informes de errores o un servidor, **hay que actualizar este formulario y `privacidad.html` antes de publicar esa versión.**

### Otras declaraciones de «Contenido de la app»

| Declaración | Respuesta |
|---|---|
| Política de privacidad | URL de `privacidad.html` |
| Anuncios | **No contiene anuncios** |
| Acceso a la app | Toda la funcionalidad está disponible sin acceso especial (no hay inicio de sesión) |
| ID de publicidad | **No** usa el ID de publicidad (el manifiesto combinado no incluye `AD_ID`) |
| App gubernamental | **No** (no la desarrolla ni la publica una entidad pública) |
| Funciones financieras / salud / noticias | Ninguna |

### Aviso importante: marca «EnCicla»

«EnCicla» es el sistema del Área Metropolitana del Valle de Aburrá. Play prohíbe las apps que sugieran falsamente una afiliación
(política de **suplantación de identidad**) y el uso de marcas ajenas sin permiso (**propiedad intelectual**). Por eso:

- Mantén el aviso «demo no oficial…» en la descripción, en la página y dentro del juego.
- No uses el logo oficial de EnCicla ni del Área Metropolitana en el ícono o en las capturas (el juego usa arte propio: ✔).
- **Antes de pasar a producción, consigue una autorización escrita de EnCicla / AMVA.** Si Play rechaza la app por suplantación o
  propiedad intelectual, se apela adjuntando ese permiso. Mientras tanto, la prueba interna sirve para mostrar la demo.

## 6. Firma: crear la llave de subida (una sola vez)

Play usa **Firma de apps de Play**: Google guarda la llave con la que se firma la app que reciben los usuarios, y tú firmas
cada AAB con tu **llave de subida**. Si pierdes la llave de subida, se puede pedir a Google que la restablezca; aun así, respáldala.

```bash
mkdir -p ~/llaves
keytool -genkeypair -v \
  -keystore ~/llaves/juegaencicla-upload.jks \
  -alias upload -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Juan Felipe Rico, O=Juega EnCicla, L=Medellin, C=CO"
# keytool pide la contraseña del almacén (y la de la llave). Usa contraseñas largas y guárdalas en un gestor.
```

- Guarda el `.jks` **fuera del repositorio** y haz al menos una copia en otro lugar (USB cifrada o nube privada).
- `.gitignore` ya ignora `keystore.properties`, `*.jks`, `*.keystore` y `*.aab`.

## 7. `app/keystore.properties` (NO se sube a git)

Crea `app/keystore.properties` con:

```properties
storeFile=/home/TU_USUARIO/llaves/juegaencicla-upload.jks
storePassword=la-contraseña-del-almacen
keyAlias=upload
keyPassword=la-contraseña-de-la-llave
```

- `storeFile` puede ser ruta absoluta o relativa a la carpeta `app/`.
- `app/android/app/build.gradle` lee este archivo **solo si existe**: sin él, `npm run build:debug` funciona igual y la release sale sin firmar.
  Si falta alguna de las 4 claves, Gradle se detiene con un mensaje claro.
- Comprueba que está ignorado: `git check-ignore -v app/keystore.properties` (debe imprimir la regla de `.gitignore`).

## 8. Versión, compilación y subida

### Política de `versionCode` / `versionName`

- `versionName` = la versión del juego en `src/js/00-core.js` (por ejemplo `0.4.0`).
- `versionCode` = `MAYOR × 10000 + MENOR × 100 + PARCHE` → `0.4.0` = **400**, `0.4.1` = 401, `1.0.0` = 10000.
- Play exige que `versionCode` **siempre aumente** y no deja reutilizar uno ya subido (aunque la versión se haya descartado).
  Si hay que volver a subir, sube el PARCHE (`0.4.1`).
- La versión 0.3.0 usaba `versionCode 3`; como nunca se subió a Play, saltar a 400 no causa problemas.
- Se edita a mano en `app/android/app/build.gradle` (`defaultConfig { versionCode … versionName … }`) en cada versión.

### Compilar el AAB firmado

```bash
node tools/build.js && node tools/assets.js        # dist/juega-encicla.html con la versión nueva
cd app
ANDROID_HOME=/opt/android-sdk npm run build:release  # sync + bundleRelease + assembleRelease
```

Salida:
- `app/android/app/build/outputs/bundle/release/app-release.aab` → **esto se sube a Play**
- `app/android/app/build/outputs/apk/release/app-release.apk` → APK firmado (para probar en un celular)

Verificar la firma:
```bash
jarsigner -verify app/android/app/build/outputs/bundle/release/app-release.aab        # "jar verified."
/opt/android-sdk/build-tools/35.0.0/apksigner verify --print-certs \
  app/android/app/build/outputs/apk/release/app-release.apk                        # muestra tu CN
```

### Subir a prueba interna

1. Play Console → **Crear app**: nombre «Juega EnCicla», idioma Español (Latinoamérica), **Juego**, **Gratis**; acepta las declaraciones.
2. Completa **Contenido de la app** (secciones 3 a 5) y la **ficha de Play Store** (secciones 1 y 2).
3. **Pruebas → Prueba interna → Testers**: crea una lista de correos (hasta 100) y copia el enlace de participación.
4. **Prueba interna → Crear versión**. La primera vez, acepta la **Firma de apps de Play** (llave generada por Google).
5. Sube `app-release.aab`. Nombre de la versión: `0.4.0 (400)`. Notas de la versión en `es-419`, por ejemplo:
   `<es-419>Primera versión de prueba: 9 oficios, Carrera de postales y juego sin internet.</es-419>`
6. **Guardar → Revisar versión → Iniciar lanzamiento en Prueba interna.** Los testers abren el enlace, aceptan y la instalan desde Play
   (suele estar disponible en minutos).

### Hacia producción

- Las **cuentas personales de desarrollador** creadas desde nov. 2023 deben hacer una **prueba cerrada con al menos 12 testers
  durante 14 días seguidos** antes de poder pedir acceso a producción (la Consola muestra el contador).
- Play exige un `targetSdkVersion` mínimo que sube cada año (a finales de agosto). El proyecto usa **35** (`app/android/variables.gradle`).
  Si la Consola rechaza el AAB por nivel de API, sube `compileSdkVersion`/`targetSdkVersion` (instala la plataforma con `sdkmanager`)
  y prueba bien el juego en Android 16 (el modo de pantalla completa de borde a borde es obligatorio ahí).

## 9. Notas para el desarrollador principal

- **Cambio de firma entre el APK web y Play:** el APK que se descarga desde la página está firmado con otra llave, así que quien lo
  instaló tendrá que **desinstalarlo** antes de instalar la versión de Play, y perderá su progreso (el `localStorage` vive en los datos
  de la app). Recomienda «Exportar partidas» antes. Para evitarlo: en Play Console → **Explorador de paquetes de aplicaciones** →
  descarga el **APK universal firmado** (con la llave de Play) y publica ese archivo como `descargas/JuegaEnCicla.apk`.
- **Cámara / «Escanear»:** si la 0.4.0 lee el QR con la cámara dentro de la app Android, agrega en `AndroidManifest.xml`
  `<uses-permission android:name="android.permission.CAMERA" />` y
  `<uses-feature android:name="android.hardware.camera" android:required="false" />` (para que se pueda instalar en equipos sin cámara).
  Capacitor pide el permiso en tiempo de ejecución cuando la página llama a `getUserMedia`.
- **Service worker y páginas extra:** `dist/web/sw.js` responde **toda** navegación con `index.html` en caché. Quien ya abrió el juego verá
  el juego (y no la página) al visitar `pagina.html` o `privacidad.html`. Conviene que el SW solo sirva `index.html` para `./` e `index.html`
  y deje pasar las demás navegaciones a la red (Play revisa la política desde un navegador limpio, pero los usuarios no).
- **CI:** `.github/workflows/android.yml` solo compila el APK debug. Para firmar en GitHub Actions habría que guardar el `.jks` en base64
  y las contraseñas como *secrets*, y escribir `app/keystore.properties` en el job; no es necesario para publicar desde un equipo local.
