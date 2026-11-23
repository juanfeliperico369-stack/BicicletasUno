# Entrega EnCicla 3.6 · ChatGPT + Codex (K‑1/K‑2/K‑3 y C‑130/C‑133)
**Firma:** OpenAI GPT-6 (Eón), trabajo del 23‑nov‑2026.  
**Repositorio:** `juanfeliperico369-stack/BicicletasUno`  
**Rama de integración:** `openai-gpt6/encicla-3.6-chatgpt-codex`  
**Base:** `ccr-6f184fb6-vtpkye`, trabajo 3.5 de Claude.  
**Referencia canónica:** `docs/PEDIDOS-Y-PLAN-3.5-Claude.md` § 3.  
**Archivo de prompts recuperado:** `PROMPTS-3.5-Claude.md`.

## 1. Resumen ejecutivo
Se entregan cuatro encargos de arte (14 PNG), tres módulos/herramientas de ingeniería para **render progresivo**, **capas opcionales** y **publicación protegida**, y pruebas y documentación de coordinación.

La calidad del resultado tiene dos niveles: los cambios de **lógica y canalización** están integrados en una rama y tienen pruebas automáticas; las **imágenes** son prototipos originales reproducibles de pixel art para evaluación visual. No son una garantía de fidelidad urbanística ni sustituyen la revisión del autor.

No se han fusionado cambios a `main` ni se ha actualizado la página pública de `gh-pages`. La rama `gh-pages-ensayo` es el lugar de prueba. No se modificaron `motorcity`, `MetroZero` o `RunRunZero`.

## 2. C‑130 a C‑133 · arte
**Destino:** `arte/entregas/2026-11-23-gpt6-c130-c133/`.
`manifiesto.json` registra los 14 archivos, anchura, altura y SHA‑256. El generador reproducible es `tools/generar-arte-lateral-gpt6.py` (Pillow solo en la herramienta, **no en el juego**).

| Pedido | Resultado | Piezas |
|---|---|---:|
| C‑130 | Comuna 13: cielo, ladera, murales sin letras y escaleras eléctricas | 4 × 1008×432 PNG |
| C‑131 | Línea A: montaña, ciudad, río/ciclorruta, viaducto y tren de perfil | 4 × 1008×432 + 1 × 896×504 |
| C‑132 | Las Palmas: atardecer, luces del valle, bosque, barandas y carretera | 4 × 1008×432 |
| C‑133 | Corredor ficticio lateral, 4 × 4 cuadros con ropa de colores exactos | 1 × 1024×1024 |

**Validación ejecutada:** `.github/workflows/crear-arte-lateral-gpt6.yml` construye las imágenes, verifica 21:9 exacto, concordancia de columna izquierda con derecha, magenta exacto para las capas recortables, sprite de 1024² y manifiesto; publica los PNG bajo firma OpenAI GPT‑6.

**Decisión de diseño:** Las generaciones visuales exploratorias de esta ronda no respetaron la división en capas, el magenta ni la ausencia de rótulos. Fueron descartadas. Los 14 PNG del repositorio se generaron de manera procedimental, con geometría simple y medidas correctas. **Son un primer conjunto técnico jugable, no la versión artística definitiva.** No se deben reemplazar por arte más complejo hasta cotejar ancla G‑131 y estilo aprobado.

## 3. K‑1 · sector de suelo que se construye progresivamente
### Diagnóstico
En el código 3.5, `CityMap.chunkG()` construía cada Canvas mediante `Art.mk(... => this.drawGround3(...))` **en un único turno del hilo principal**. Claude documentó de **24 a 89 ms** por trozo con CPU simulada 4× lenta. La precarga redujo la mediana de algunos recorridos, pero no elimina el tirón de un trozo nuevo.

### Implementación
1. `src/js/75-graficos.js`: el `drawGround3` público se conserva para llamadas síncronas heredadas; su cuerpo real pasa al generador `*drawGround3Etapas`, con `yield` después de 7 máscaras y de 16 grupos de elementos.
2. `src/js/99w-chunks-progresivos.js`: reemplaza `CityMap.chunkG` **solo en modo no-pixel**, entrega de inmediato un Canvas color tierra `#cfc9bc`, genera sin bloquear la llamada y sigue fases con `requestAnimationFrame`. Presupuesto objetivo **6 ms por ejecución**; evita pintar un trozo expulsado de caché; conserva el LRU adaptativo y la ruta pixel original.
3. `JE.chunksGPT6` registra creados, terminados, cancelados, errores, p95 de duración por fase y máximos.

**Limitación física importante:** ninguna suspensión puede interrumpir una operación indivisible que ya empezó, en particular `lotes()` y `contorno()`. Una fase aislada puede superar 6 ms. El cambio distribuye trabajo; **todavía no demuestra** p95 de cuadro menor a 50 ms ni máximo menor a 120 ms bajo CPU 4×. Para demostrarlo se necesita `node tests/auditoria-modos.js --cpu=4` sobre el commit final y un recorrido de 2 km, además de medidas de 📏 en móvil real.

### Pruebas
- `tests/prueba-gpt6-chunks.mjs`: canvas inicial, no ejecución síncrona de etapas, memoización, cancelación de expulsados, límite de solicitudes de rAF, modo pixel y ausencia de error.
- `tests/revolucion-encicla.js` V8: comprueba en Chromium caché, color inicial, progreso sin errores y API de capas.
- `tests/run.js` llama V8. Sin pruebas verdes, no se autoriza producción.

## 4. K‑2 · arte de laterales con respaldo
- `tools/capas.js` busca archivos PNG con nombres C‑130...C‑133 en `arte/entregas/`, comprueba dimensiones, agrupa por escena de **cuatro capas completas** y prioriza WebP sin pérdidas si `cwebp` existe y mejora el tamaño; de lo contrario incrusta PNG.
- El límite es **1,5 MB adicionales de base64 de arte**, no el tamaño total del juego, que ya era mayor antes del pedido.
- `tools/build.js` agrega `const CAPAS_EMBEBIDAS = {...}` al HTML offline; cuando falta arte, el objeto queda vacío y las escenas no cambian.
- `src/js/99x-capas-laterales.js`: decodifica los recursos embebidos mediante `Image`, vuelve transparentes los píxeles magenta exactos en Canvas, y ofrece `JE.capas.tiene(id)`, `JE.capas.dibujar(b,id,desplazamiento,w,h)` y `JE.capas.corredor(...)`. El desplazamiento es cíclico horizontal con factores de profundidad.
- **Puntos de integración mínima:** `99g-freerun.js` (Comuna y corredor), `99p-ciclovia-skate-runner.js` (Metro 2D y Las Palmas). Se mantiene el dibujo previo cuando faltan archivos o fallan al cargar.

**Pendiente de arte:** el lote es deliberadamente reducido y geométrico. Falta aprobación estética a 412×860 y comparación fotografiada «antes/después». Las cuatro capas pueden cubrir detalles del dibujo antiguo porque se dibujan sobre el fondo antes del primer plano; ajustar composición tras revisión humana.

## 5. K‑3 · publicación con red de seguridad
**Archivo:** `.github/workflows/publicar.yml`.

- En push a **main**, construir `dist/web/`, ejecutar Node+Playwright Chromium y las pruebas nuevas; después y solo después, publicar en **gh-pages**.
- En push a **`openai-gpt6/encicla-3.6-chatgpt-codex`** (o ejecución manual desde la rama), aplicar la misma secuencia pero **solo a `gh-pages-ensayo`**.
- Hacer `rsync --delete` con exclusiones estrictas de `/.git/`, `/metro/`, `/descargas/`, `/CNAME`.
- Comprobar con SHA‑256 que **cada archivo del Metro y de descargas** se mantiene idéntico antes y después del despliegue. Si cambia o faltan los directorios, el despliegue falla.
- Firmar el commit de despliegue como `OpenAI GPT-6 / Codex`; no exponer secretos, APK u otras ramas ajenas.

**Prueba de integración:** `gh-pages-ensayo` existía antes de la activación del flujo. Las verificaciones finales dependen de los estados de GitHub Actions sobre el último commit; un flujo exitoso previo no certifica una modificación posterior.

## 6. Archivos compartidos y coordinación
Los módulos propios se ubican en `99w-*` y `99x-*` para respetar el reparto. Para conectar el arte y descomponer el método original hubo **cambios quirúrgicos** en `75-graficos.js`, `99g-freerun.js`, `99p-ciclovia-skate-runner.js`, `tools/build.js`, `tests/run.js` y `tests/revolucion-encicla.js`. Avisar a Claude y Gemini de estos puntos; no fusionar a ciegas con otra versión de los mismos módulos.

No se altera el esquema de guardado `juegaencicla.v1`, no se añaden claves `Save.registrar` y no se introduce red ni librería externa de runtime.

## 7. Siguientes umbrales para declarar «terminado»
1. **CI en verde sobre el último commit** para build, unitarias, pruebas completas y despliegue de ensayo.
2. **Benchmark CPU×4 antes/después:** p95 modo libre <50 ms y máximo <120 ms en 2 km; si no, dividir internamente `lotes` o moverlo a generación off-thread con compatibilidad.
3. **Capturas reales:** Freerun, Metro 2D y Las Palmas a 412×860, comparar contraste, fondos, ausencia de bandas magenta, cíclico de capas, fotogramas del corredor.
4. **Pruebas en hardware Android/iOS** con 📏 Medir este celular, sin datos personales.
5. **Revisión humana de estilo**, y entonces integrar rama en main. No desplegar la producción antes de todo ello.

## 8. Comandos y páginas
```bash
node tools/build.js
node tests/prueba-gpt6-chunks.mjs
node tests/prueba-gpt6-ciclorrutas.mjs
node tests/run.js
node tests/auditoria-modos.js --cpu=4
node tools/capas.js
python tools/generar-arte-lateral-gpt6.py
```

- Rama de entrega: `https://github.com/juanfeliperico369-stack/BicicletasUno/tree/openai-gpt6/encicla-3.6-chatgpt-codex`
- Ensayo: `https://github.com/juanfeliperico369-stack/BicicletasUno/tree/gh-pages-ensayo`
- Coordinación: `https://github.com/juanfeliperico369-stack/BicicletasUno/issues/2`
- No modificar de manera automática los repositorios de Motor City, MetroZero o RunRunZero.


## 9. Regresión detectada y corregida durante la verificación
La primera batería Chromium sobre el commit `f9ddf0edc` encontró una sola aserción fallida de V7: la inclinación visual de la bicicleta en una curva rápida llegó a **0,13 rad**, por debajo del umbral 0,2 rad. La nueva prueba V8 y el constructor por fases sí pasaron; allí el coste inicial de pedir un chunk fue 0,7 ms y el p95 **por etapa** fue 0,3 ms, con máximo 10,3 ms (estas cifras **no son** el p95 de cuadros con CPU×4).

**Corrección:** `src/js/99d-mundo3d.js` aplica un realce visual controlado de 1,8× al ángulo físico `atan(v·ω/g)`, lo limita a ±0,65 rad y aumenta la adaptación temporal de 8 a 12 s⁻¹. **No cambia dirección, velocidad, choques ni físicas**: solo la legibilidad del ladeo en el render. La revalidación en CI debe realizarse sobre el commit posterior a esta corrección; no se debe ocultar el fallo original.
