# Auditoría integral de *Turno Cero* 4.0.1 (`G‑H20`, `G‑H21`, `G‑H23`, `G‑H24`)

- **Fecha:** 21‑nov‑2026 (base `c898a0a`, Motor City `4.0.1`)
- **Autora:** Gemini · Antigravity («hydrogen») — rama `ia/antigravity/motorcity-4.0`
- **Tareas cubiertas (`TAREAS-IA.md` § 4.0):**
  - **`G‑H20`**: 12 capturas móviles (`412×860`) revisadas a ojo + telemetría base + plantilla lista para celular real con GPU
  - **`G‑H21`**: verificación de los **19 lugares** de `TC.LUGARES` (`juegos/getaway/10-contenido.js`) contra mapas MC4 y negocios reales
  - **`G‑H23`**: auditoría exhaustiva del filtro **«🗣️ Lenguaje: suave»** (`juegos/getaway/40-dibujo.js`) sobre las 445 cadenas de `10-contenido.js`
  - **`G‑H24`**: medición real de **tiempos de carga y memoria JS Heap por ciudad** (`nueva_york`, `medellin`, `guatape`) en Chromium móvil
- **Restricción de zona:** solo reporte y pruebas; **cero ediciones** en `js/`, `herramientas/`, `pruebas/` ni `juegos/getaway/`.

---

## Resumen ejecutivo (lo más urgente para Claude y Codex)

| Prioridad | Área | Hallazgo concreto | Destinatario |
|---|---|---|---|
| **ALTA** | **Memoria (`G‑H24`)** | Cargar **Manhattan** (`nueva_york`) consume **215,3 MB de JS Heap** (`262,4 MB` reservados, `2.850 ms` de carga) sobre el HTML de 26 MB; en un celular de 2–3 GB de RAM puede cerrar la pestaña. Confirma la urgencia de `C‑M34` (sectores de 1 km). | Codex (`C‑M34`) / Claude |
| **ALTA** | **Lugares reales (`G‑H21`)** | `gu_finca` usa el negocio real **`La valentina finca hotel`** como «refugio de El Contador» (escondite del antagonista criminal). Rompe la regla de ficción (`CONTEXTO-RELEVO.md` § 7). Propuesta verificada: coordenada neutra en vía del embalse (`6.23636, -75.18186`, a **495 m** del hotel más cercano). | Claude (`juegos/getaway/10-contenido.js`) |
| **ALTA** | **Bug de código (`G‑H23`)** | En `juegos/getaway/20-juego.js:256`, `Subt.decir([['coro', TC.INSULTOS_BANDA[...]]])` usa la clave `'coro'`, que **no existe en `TC.QUIEN`** (la clave definida en `10-contenido.js:13–26` es `'camara'`). En pantalla sale `coro:` en minúscula y blanco. | Claude (`juegos/getaway/20-juego.js`) |
| **MEDIA-ALTA** | **HUD / Menú (`G‑H20`)** | 1) En `412×860`, la portada empuja todos los botones (`Historia nueva`, `Calle libre`, `Acción 3D`) debajo del pliegue inicial. 2) El menú de pausa no opaca el fondo ni oculta `#viaje`/fichas, así que el HUD sangra a través del menú. 3) Si hay un diálogo abierto (`G.ui.dialogo`), no se cierra al abrir `Menú` o cambiar a `Calle libre`, y `#subt` (`bottom +226px`) se dibuja detrás del diálogo creando doble texto. | Claude (`juegos/getaway/index.html`, `40-dibujo.js`, `90-inicio.js`) |
| **MEDIA** | **Calles desfasadas (`G‑H21`)** | 4 lugares caen en otra calle o dentro de un centro comercial: `ny_noah` (cae en Grand St en vez de Eldridge St), `ny_oeste` (cae dentro de Hudson Yards junto a locales reales en vez de West 30th St), `md_centro` (cae en Calle 49 Ayacucho en vez de Calle 52 Av. La Playa) y `md_envigado` (cae en Transv. 34 Sur, a 550 m de Calle 40 Sur). Todos llevan coordenadas corregidas y verificadas en MC4 abajo. | Claude (`juegos/getaway/10-contenido.js`) |
| **MEDIA** | **Filtro de lenguaje (`G‑H23`)** | `LENGUAJE_SUAVE` pierde mayúscula inicial (`Hijueputas.` → `desgraciados.`), pluraliza insulto singular femenino (`malparida!` → `miserables!`), omite `tombo` singular y `güevones`/`huevón`, y `TC.CONTRATOS` (`El sapo`) nunca pasa por `suave()`. | Claude (`juegos/getaway/40-dibujo.js`, `30-historia.js`) |
| **BAJA** | **Escena 3D Codex (`G‑H20`)** | `dist/juegos/turno-cero-accion-3d.html` rinde WebGL real (`87` draw calls, `19.842` triángulos, `0` errores) incluso en software; en `412×860`, la palabra `SEÑUELO` en el botón `G` roza/rebasa el borde derecho de la caja. | Codex (`juegos/getaway/turno-cero-accion-3d.html`) |

---

## 1. `G‑H20` — 12 capturas de *Turno Cero* 4.0.1 (`412×860`) + telemetría

> **Nota de honestidad técnica:** Las capturas y tiempos de esta sección se tomaron en **Chromium headless móvil sobre VM Linux sin GPU física (`gpu: "software"`)**, por lo que `MC.Vistas` cae al respaldo 2D en *Turno Cero* principal (y en la escena 3D de Codex corre WebGL2 por SwiftShader a ~19 fps). **No sustituyen la medición en un celular Android/iOS real con GPU** (ver tabla vacía lista para llenar en § 1.3).
>
> Asimismo, durante el recorrido automatizado del guion de capturas, el diálogo inicial del Acto I (`Manhattan, 2026...`) permaneció abierto al saltar entre mundos (`03`–`10`) porque el arnés invocó `TURNO.planeta.viajar` / `TURNO.libre` sin pulsar `▶`; precisamente eso destapó un fallo real de interfaz: abrir `Menú` o cambiar de modo no cierra ni oculta el diálogo activo y los subtítulos (`#subt`) se pintan detrás de él.

### 1.1 Tabla visual (`foto → hallazgo → gravedad`)

Las 12 capturas convertidas a WebP ligero (~907 KB en total) viven en [`reportes/img/turno-cero-4.0/`](./img/turno-cero-4.0/):

| # | Captura (`412×860`) | Escena | Hallazgo visual observado | Gravedad |
|---|---|---|---|---|
| 01 | [01-portada-18plus.webp](./img/turno-cero-4.0/01-portada-18plus.webp) | Portada 18+ | Ilustración SVG nueva (Manhattan + Metrocable + Piedra del Peñol + luna + sirenas) y tipografía editorial con muy buena identidad. **Fallo:** el bloque SVG + sinopsis de 5 líneas + caja roja `#aviso18` empujan **todos los botones de entrada** (`Historia nueva`, `Calle libre`, `Acción 3D`) debajo del pliegue en `412×860`; el jugador tiene que hacer scroll solo para empezar. | **Media** |
| 02 | [02-ny-acto1-inicio.webp](./img/turno-cero-4.0/02-ny-acto1-inicio.webp) | Acto I · tarjeta de capítulo | Tarjeta limpia (`ACTO I · CAPÍTULO 1 / PAPEL DE RUTA / Mara Vega`) sobre West 17th St con lluvia y faros. Contraste alto y cero solapes. | **OK** |
| 03 | [03-ny-camara-3d-glb.webp](./img/turno-cero-4.0/03-ny-camara-3d-glb.webp) | Nueva York · cámara `tercera` (noche) | Sin GPU física, el respaldo 2D dibuja el sedán de perfil con un pequeño rectángulo oscuro vertical sobre el techo/conductor. El cuadro de diálogo inicial tapa el joystick y el minimapa. | **Media** *(revisar con GPU real)* |
| 04 | [04-ny-sigilo-muelle4.webp](./img/turno-cero-4.0/04-ny-sigilo-muelle4.webp) | Nueva York · sigilo en Muelle 4 | Conos de visión de guardias y edificios nocturnos legibles. **Fallo:** el subtítulo `Nadia Bell: En el Muelle 4...` (`#subt`, `z-index: 20`) se renderiza **directamente detrás** del cuadro de diálogo, produciendo texto doble ilegible. | **Media-Alta** |
| 05 | [05-ruta-atlantico.webp](./img/turno-cero-4.0/05-ruta-atlantico.webp) | Ruta del Atlántico (carretera tarde) | **Mejora confirmada de 4.0.1:** el letrero verde de autopista (`➡ Medellín y el Valle de Aburrá · 7.5 km`) ya **no solapa** las barras de carro/vida/turbo. **Fallo leve:** el aviso gris (`👓 Consejo...`) roza el borde superior del botón `T02` y la flecha amarilla `8506 m` pisa el borde inferior del aviso. | **Baja-Media** |
| 06 | [06-planeta-globo.webp](./img/turno-cero-4.0/06-planeta-globo.webp) | Globo `MC.Planeta.globo` | Estética espacial excelente (atmósfera, biomas, anillo dorado, pin verde del jugador, barra inferior legible). **Fallo leve:** la etiqueta `Medellín y el V...` se recorta contra el borde derecho de `412 px`. | **Baja** |
| 07 | [07-medellin-llegada.webp](./img/turno-cero-4.0/07-medellin-llegada.webp) | Medellín · llegada en Calle libre | Edificios, guayacanes y letrero verde (`⬅ Ruta del Atlántico · 78 m`) nítidos. **Fallo:** la punta de la flecha amarilla (`20371 m`) muerde el borde del aviso `📞 Toca Contratos...`, y el diálogo abierto no se cierra al pasar a `Calle libre` (solapando de nuevo a `#subt`). | **Media** |
| 08 | [08-medellin-nivel5.webp](./img/turno-cero-4.0/08-medellin-nivel5.webp) | Medellín · búsqueda nivel 5 (noche) | Cinta `🚨🚨🚨🚨🚨 · 🔫 banda · 👁` y aviso `🔫 La banda: 2 camionetas` claros. **Fallo:** la extrusión del edificio tapa el carro del jugador (solo asoma el halo cian detrás del tejado) y el texto `20383 m` toca el botón `T02`. | **Media** |
| 09 | [09-medellin-termico.webp](./img/turno-cero-4.0/09-medellin-termico.webp) | Medellín · nivel 5 + Lente T01 térmica | Paleta térmica (violeta/ámbar/rojo) + contador `8s` en `T01` + minimapa térmico + aviso `⚠ Retén adelante` lucen muy potentes y legibles. Persiste el solape inferior de `#subt` con diálogo abierto. | **OK (visual T01)** |
| 10 | [10-guatape-amanecer.webp](./img/turno-cero-4.0/10-guatape-amanecer.webp) | Guatapé · amanecer con guayacanes | Paleta de amanecer, guayacanes rosados/amarillos, letrero `➡ Carretera del Norte` y aparición dinámica del botón `🚤 Lancha` impecables. **Detalle leve:** la etiqueta `1206 m` queda muy pegada al botón `×2` del riel izquierdo. | **Baja** |
| 11 | [11-menu-lenguaje-suave.webp](./img/turno-cero-4.0/11-menu-lenguaje-suave.webp) | Menú de pausa (`Lenguaje: suave`) | **Fallo claro de UI:** el menú de pausa no oscurece ni oculta el HUD subyacente; las fichas (`Calle libre`, `$380`, `🚨🚨`), el letrero verde de autopista y el aviso rojo **sangran por detrás del panel del menú**, y el menú pisa parcialmente la columna de artefactos (`T02`, `×2`, `T08`) mientras el diálogo inferior permanece abierto. | **Media-Alta** |
| 12 | [12-accion-3d-codex.webp](./img/turno-cero-4.0/12-accion-3d-codex.webp) | `turno-cero-accion-3d.html` (Codex) | **WebGL2 real en vivo** (`19 fps` en software, `87` draw calls, `19.842` triángulos, `0` errores). HUD editorial limpio, minimapa de cuadrícula nítido, rig de Mara y guardia/terminal legibles. **Fallo leve:** en `412×860`, la palabra `SEÑUELO` del botón inferior derecho `G` roza/rebasa el borde derecho de su botón. | **Baja** |

### 1.2 Telemetría base medida en VM (`gpu: "software"`, `412×860`, DPR 2)

| Escena | Cámara | `dibujo_p50` (ms) | `dibujo_p95` (ms) | `cuadro_p50/p95` (ms) | `tapa` (solapes DOM `MC.UI`) | Errores consola |
|---|---|---:|---:|---:|---|---:|
| Manhattan (noche, Acto I) | `tercera` *(respaldo 2D)* | **7,5** | **8,0** | 100 *(tope software VM)* | `[]` | 0 |
| Ruta del Atlántico (tarde) | `ciudad3d` *(respaldo 2D)* | **17,8** | **21,9** | 100 *(tope software VM)* | `[]` | 0 |
| Medellín nivel 5 (5 rivales, noche) | `ciudad3d` *(respaldo 2D)* | **5,0** | **7,5** | 100 *(tope software VM)* | `[]` | 0 |
| Escena 3D Codex (`turno-cero-accion-3d.html`) | WebGL2 (`87` calls, `19.842` tris) | — | — | ~52 ms (`19 fps` SwiftShader) | n/a | 0 |

### 1.3 Plantilla pendiente — Celular real con GPU (para llenar por el autor o QA con dispositivo físico)

> Abrir `https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/getaway.html` en un celular real (Android Chrome / iOS Safari), jugar ~20 s por escena y leer `TURNO.tele()` o `MC.Telemetria.resumen()` desde inspección remota (`chrome://inspect`):

| Dispositivo real | Escena | Cámara 3D WebGL activa | `dibujo_p50` (ms) | `dibujo_p95` (ms) | `fps_p50` | `fps_p5` | Carga ciudad (ms) | ¿GLB + faros + abolladuras ok? |
|---|---|---|---:|---:|---:|---:|---:|---|
| *(pendiente)* | Nueva York (noche, lluvia) | `tercera` (WebGL) | — | — | — | — | — | — |
| *(pendiente)* | Ruta del Atlántico | `tercera` (WebGL) | — | — | — | — | — | — |
| *(pendiente)* | Medellín nivel 5 + helicóptero | `ciudad3d` / `tercera` | — | — | — | — | — | — |
| *(pendiente)* | Guatapé (amanecer + lancha) | `tercera` (WebGL) | — | — | — | — | — | — |

---

## 2. `G‑H21` — Auditoría de los 19 lugares de `TC.LUGARES`

Todos los 19 registros de `TC.LUGARES` (`juegos/getaway/10-contenido.js`) se validaron directamente contra los mundos compilados `datos/{nueva_york,medellin,guatape}/mundo.mc4` (`M.geoAXy`, `M.calle`, `M.sitios()`, `M.enVia`, `M.suelo`) más comprobación externa de comercios y puntos sensibles (hospitales, colegios, iglesias, memoriales).

- **Sitios sensibles dentro de 200 m:** **0** hospitales, escuelas, iglesias o memoriales encontrados en los `sitios()` de los 19 puntos.
- **Resultado global:** **11 OK**, **3 ajustes menores de distancia a vía**, **4 calles desfasadas**, y **1 hallazgo ALTO por uso de un hotel real como guarida del villano (`gu_finca`)**.

| # | Clave (`TC.LUGARES`) | Nombre en historia | Coordenada actual / `lugar` | Calle real en MC4 (dist. vía) | POIs reales cercanos | Veredicto | Coordenada sugerida (verificada en MC4) |
|---|---|---|---|---|---|---|---|
| 1 | `ny_taller` | Taller Vega · West 17th St | `40.7432, -74.0055` | `West 17th Street` (3 m) | Ninguno en conflicto | **OK** | Sin cambio |
| 2 | `ny_argenta` | Depósito Argenta · Gansevoort St | `40.7395, -74.0080` | `Washington Street` (4 m) | `Warby Parker` (19 m), clínica dental (89 m) | **Ajuste leve** | **`40.73939, -74.00792`** (0 m sobre `Gansevoort Street`) |
| 3 | `ny_nadia` | Esquina de Old Slip · Water St | `40.7040, -74.0085` | `Old Slip` (3 m) | Ninguno sensible | **OK** | Sin cambio |
| 4 | `ny_noah` | Imprenta de Noah · Eldridge St | `40.7175, -73.9915` | **`Grand Street`** (0 m) | — | **Corregir calle** | **`40.71767, -73.99222`** (0 m sobre `Eldridge Street`, 0 POIs) |
| 5 | `ny_muelle4` | Muelle 4 · Argenta Quay · Cherry St | `40.7112, -73.9855` | `Cherry Street` a **41 m** (`BRICK`) | Ninguno (`Muelle 4` es ficticio; reales son Pier 35/36/42) | **Ajuste leve** | **`40.71171, -73.98490`** (0 m sobre `Cherry Street`, 0 POIs) |
| 6 | `ny_harlem` | Subida de West 145th · Harlem | `40.8240, -73.9440` | `West 145th Street` (14 m) | Ninguno sensible | **OK** | Sin cambio |
| 7 | `ny_oeste` | Garaje del Oeste · West 30th St | `40.7530, -74.0010` | **`10th Avenue`** (37 m, interior Hudson Yards) | `Aesop`, `JOE & THE JUICE`, `Kiehl's`, `H&M` | **Corregir calle/POIs** | **`40.75225, -74.00086`** (0 m sobre `West 30th Street`, 0 POIs) |
| 8 | `ny_les` | Taller del Lower East Side · Delancey | `40.7185, -73.9870` | `Delancey Street` (12 m) | Ninguno | **OK** | Sin cambio |
| 9 | `md_efrain` | Taller de Efraín · Barrio Colombia | `6.2265, -75.5745` | `Carrera 45` · Barrio Colombia (15 m) | Ninguno | **OK** | Sin cambio |
| 10 | `md_lleras` | Calle 9 · El Poblado | `6.2087, -75.5677` | `Calle 9` · El Poblado (0 m) | `Parque Lleras` (67 m, espacio público) | **OK (público)** | Sin cambio |
| 11 | `md_bodega` | Bodega Argo · Zona Industrial Sur | `6.1745, -75.6050` | `Carrera 52` · Villa Paula, Itagüí (18 m) | Ninguno | **OK** | Sin cambio |
| 12 | `md_torre` | Torre Argo · El Poblado | `6.2010, -75.5735` | `Calle 4 Sur` · Patio Bonito / El Poblado (11 m) | Ninguno | **OK** | Sin cambio |
| 13 | `md_centro` | Parqueadero La Playa · Centro | `6.2470, -75.5650` | **`Calle 49` (Ayacucho)** (0 m) | — | **Corregir calle** | **`6.24921, -75.56502`** (0 m sobre `Calle 52` Av. La Playa, La Candelaria, 0 POIs) |
| 14 | `md_bello` | Taller de Bello · Carrera 50 | `6.3330, -75.5580` | `Carrera 50` · Central, Bello a **44 m** | Ninguno | **Ajuste leve** | **`6.33368, -75.55846`** (0 m sobre `Carrera 50`, 0 POIs) |
| 15 | `md_envigado` | Garaje de la 40 Sur · Envigado | `6.1720, -75.5850` | **`Transversal 34 Sur`** · Obrero (~550 m al norte de la 40 Sur) | Ninguno | **Corregir calle** | **`6.16694, -75.58799`** (0 m sobre `Calle 40 Sur`, Centro · Envigado, 0 POIs) |
| 16 | `gu_taller` | Mecánico de la 26 · Guatapé | `6.2328, -75.1590` | `Carrera 26` (22 m) | `Alcaldía Guatapé` (54 m), hospedaje `Templo de piedra` (54 m) | **OK (observación leve)** | Opcional: desplazar ~60 m al este por Carrera 26 para alejar de Alcaldía |
| 17 | `gu_malecon` | Malecón de Guatapé | `lugar: 'Malecon De Guatape'` | `Calle 32` (9 m, `6.23480, -75.16094`) | Espacio público | **OK** | Sin cambio |
| 18 | `gu_finca` | **Finca del embalse · refugio de El Contador** | `lugar: 'La valentina finca hotel'` | `6.22623, -75.18053` | **Hotel real en operación (`La valentina finca hotel`)**, `Junto al Cielo` (23 m), `Hotel Los Recuerdos` (78 m) | **ALTA — CORREGIR** | Quitar `lugar` y usar **`lat: 6.23636, lon: -75.18186`** (orilla neutra del embalse, **495 m** del hotel/negocio más cercano, con acceso de lancha) |
| 19 | `gu_piedra` | Mirador de la Piedra del Peñol | `lugar: 'Guatapé Represa, Piedra Mirador'` | Acceso mirador (7 m, `6.22120, -75.17917`) | Espacio público | **OK** | Sin cambio |

---

## 3. `G‑H23` — Auditoría del filtro «🗣️ Lenguaje: suave»

Se inspeccionaron automáticamente **las 445 cadenas de texto** de `juegos/getaway/10-contenido.js` y todos los puntos de llamada de `suave()` en `juegos/getaway/*.js`.

### 3.1 Fallos en las 5 expresiones regulares actuales (`juegos/getaway/40-dibujo.js:8–9`)

Código actual:
```js
const LENGUAJE_SUAVE = [
  [/hijueputas?/gi, 'desgraciados'],
  [/malparid[oa]s?/gi, 'miserables'],
  [/gonorreas?/gi, 'basura'],
  [/güevón/gi, 'bobo'],
  [/tombos/gi, 'policías']
];
```

1. **Pérdida de mayúscula inicial:** en el Capítulo 2 (`intro`), `«Hijueputas. Ni saben a quién le acaban de tirar encima.»` se convierte en `«desgraciados. Ni saben…»` (minúscula tras inicio de oración).
2. **Error de concordancia de número/género:** en `TC.INSULTOS_BANDA[3]`, `«¡Deme los papeles, malparida!»` se transforma en `«¡Deme los papeles, miserables!»` (de singular femenino a plural).
3. **Flexiones sin cubrir:**
   - `/tombos/gi` solo captura el plural; si entra `tombo` en singular no se filtra.
   - `/güevón/gi` no captura plural (`güevones`) ni variantes sin diéresis/con h (`guevón`, `huevón`).
   - `/hijueputas?/gi` reemplaza también el singular `hijueputa` por el plural `desgraciados`.

### 3.2 Textos que no pasan por `suave()` y expresiones coloquiales/fuertes que se escapan

| Ubicación | Texto original | Situación actual con `Lenguaje: suave` | Recomendación |
|---|---|---|---|
| `TC.CONTRATOS[8]` (`10-contenido.js`) + `30-historia.js:152` + `40-dibujo.js:79` | `n: 'El sapo'` (`id: 'chivato'`) | **No pasa por `suave()`** (se muestra literal `📞 El sapo`) | Pasar `c.n` y avisos de contrato por `suave()`, y mapear `/\bel sapo\b/gi → 'el delator'` o renombrar a `'El informante'`. |
| `TC.FINALES` (`30-historia.js:87`) | Títulos y cuerpos de finales A/B/C | **No pasa por `suave()`** (hoy están limpios) | Envolver preventivamente en `suave()` por consistencia. |
| `TC.INSULTOS_BANDA[2]` | `«¡Usted ya está muerta, Vega!»` | Pasa por `suave()`, pero permanece como amenaza directa de muerte | Opcional en modo suave: `«¡Ya no tiene salida, Vega!»` (o mantener como tensión 18+, documentando que `suave` solo retira groserías). |
| `TC.INSULTOS_MARA[3]` | `«¡Ábranse!»` | Permanece literal (jerga callejera colombiana) | Aceptable en modo suave (no es grosería), o suavizar a `«¡Quítense!»`. |
| Cap. 3 paso 2 | `«…mamita…»` | Permanece literal (coloquialismo despectivo) | Aceptable para villano adulto 18+; dejar constancia explícita. |
| Varios diálogos narrativos | `gringa`, `hombre gordo`, `O se las cobramos`, `matan`/`matarla` | Permanecen literales | Pertenecen al género *thriller* adulto (18+); no son groserías, pero conviene aclarar en la descripción del menú que «Lenguaje: suave» retira groserías fuertes y mantiene el tono policial 18+. |

### 3.3 Bug real de código hallado durante la auditoría (`juegos/getaway/20-juego.js:256`)

```js
// juegos/getaway/20-juego.js:256
Subt.decir([['coro', TC.INSULTOS_BANDA[Math.floor(Math.random() * TC.INSULTOS_BANDA.length)]]]);
```
En `TC.QUIEN` (`juegos/getaway/10-contenido.js:13–26`) las claves válidas son `mara`, `nadia`, `noah`, `efrain`, `cross`, `contador`, `vela`, `camara`, `policia`, `argo` — **no existe `'coro'`**. Cuando la banda grita un insulto, `Subt` muestra literalmente **`coro:`** en minúscula y sin color de facción. Cambiar `'coro'` por `'camara'` (o añadir `coro: { n: 'Sicario', c: '#c25542' }` en `TC.QUIEN`) lo arregla en 1 línea.

### 3.4 Propuesta de `suave()` mejorada (lista para que Claude la adopte en `40-dibujo.js`)

```js
const cap = (ori, rep) => ori[0] === ori[0].toUpperCase() ? rep[0].toUpperCase() + rep.slice(1) : rep;
const LENGUAJE_SUAVE = [
  [/\bhijueputas\b/gi, m => cap(m, 'desgraciados')],
  [/\bhijueputa\b/gi, m => cap(m, 'desgraciado')],
  [/\bmalparid[oa]s\b/gi, m => cap(m, 'miserables')],
  [/\bmalparid[oa]\b/gi, m => cap(m, 'miserable')],
  [/\bgonorreas?\b/gi, m => cap(m, 'basura')],
  [/\b[gh]?[uü]evones\b/gi, m => cap(m, 'bobos')],
  [/\b[gh]?[uü]ev[oó]n\b/gi, m => cap(m, 'bobo')],
  [/\btombos\b/gi, m => cap(m, 'policías')],
  [/\btombo\b/gi, m => cap(m, 'policía')],
  [/\bel sapo\b/gi, m => cap(m, 'el delator')]
];
```

---

## 4. `G‑H24` — Tiempo de carga y memoria por ciudad (`412×860`)

Medido en contextos limpios e independientes de Chromium móvil (`412×860`, DPR 2, CDP `Performance.getMetrics`) cargando `dist/juegos/getaway.html` (`26,2 MB` en disco) y entrando en cada una de las 3 ciudades de *Turno Cero* 4.0.1:

| Ciudad (`mundo.mc4`) | Peso MC4 en repo | HTML listo (ms) | Carga ciudad (ms) | JS Heap antes (MB) | JS Heap después (MB) | JS Heap total reservado (MB) | Nodos DOM | Errores |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **`nueva_york`** (Manhattan) | 10,0 MB | 740 | **2.850** | 5,7 | **215,3** | **262,4** | 586 | 0 |
| **`medellin`** (Valle de Aburrá) | 6,8 MB | 678 | **1.746** | 5,5 | **66,3** | **107,2** | 564 | 0 |
| **`guatape`** (Embalse) | 0,4 MB | 657 | **985** | 5,4 | **13,6** | **19,6** | 647 | 0 |

### Diagnóstico técnico para `C‑M34` (Codex) y Claude
1. **Manhattan dispara el JS Heap en +209,6 MB** (de `5,7 MB` a `215,3 MB` usados / `262,4 MB` reservados) al descomprimir el MC4 entero en memoria y construir sus índices espaciales. En un celular gama baja/media (Android 3–4 GB RAM o Safari iOS con límite estricto por pestaña de ~250–350 MB sumando texturas WebGL), esto es el riesgo #1 de cierre inesperado (*OOM crash*).
2. **Medellín** se mantiene razonable (**66,3 MB** usados, `1,75 s`, `639.457` edificios indexados) y **Guatapé** es liviano (**13,6 MB** usados, `< 1 s`).
3. **Recomendación concreta:** priorizar `C‑M34` (cargar Manhattan por sectores de `1 × 1 km` bajo demanda y liberar sectores lejanos) y liberar explícitamente las referencias del mundo anterior (`G.M = null`, cachés de edificios/vías) antes de descomprimir la ciudad destino al cambiar de mundo en `entrarMundo()`.

---

## 5. Sugerencias de arte y tecnología para la siguiente iteración (4.1+)

1. **Arte / Portada (`01-portada-18plus.webp`):** conservar la nueva ilustración SVG (está excelente), pero reducir su altura en móvil (`clamp(135px, 22vh, 210px)`) y mover `#aviso18` debajo de los dos botones principales (o a una franja compacta de 2 líneas) para que **`▶ Historia nueva`** y **`🌎 Calle libre`** aparezcan inmediatamente sobre el pliegue en `412×860`.
2. **Arte / Texturas PBR (`C‑A16`) y visibilidad urbana:** en `08-medellin-nivel5.webp`, cuando un edificio alto queda entre la cámara y el carro del jugador, volver semitransparente la extrusión frontal (oclusión suave tipo *GTA2 / Isometric cutout*) evita perder de vista el vehículo en persecuciones nivel 5.
3. **HUD / Menú (`11-menu-lenguaje-suave.webp`):** dar fondo más opaco (`rgba(10,12,16,.94)` + `backdrop-filter: blur(6px)`), ocultar temporalmente `#artefactos`, `#viaje` y `#subt` cuando se abre el menú de pausa, y cerrar cualquier diálogo pendiente de `Historia` al pulsar `Calle libre aquí`.
4. **Globo 3D (`06-planeta-globo.webp`):** acortar etiquetas en vista planeta (`Nueva York`, `Medellín`, `Guatapé`) y limitar su coordenada `x` al margen de pantalla (`clamp(x, 48, W - 48)`) para que no se corten en retratos de `412 px`.
5. **Paradas de carretera (`contenido/paradas-carretera.json`):** ya quedaron entregadas **28 paradas originales** (4 por cada uno de los 7 biomas de `MC.Planeta.BIOMAS`, bilingües `es`/`en` con frase de ambiente) listas para que Claude las conecte al generador de carreteras largas.
