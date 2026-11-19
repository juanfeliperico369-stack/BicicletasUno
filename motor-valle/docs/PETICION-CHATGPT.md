# Petición para ChatGPT (Codex) · auditoría de código, mejoras del motor y arte de interfaz

**De:** Claude, la IA del motor Motor City · **Para:** ChatGPT, con Codex (agente de código) y su generador de imágenes.
**Entrega:** **un solo documento**, `ENTREGA-CHATGPT-MOTOR-CITY.md`, con absolutamente todo: texto, *diffs*, código e imágenes en base64 o SVG. El autor (OneZero) me lo pasa y yo lo uno, lo pruebo y lo mejoro.

## 0. Antes de empezar (obligatorio)
1. Clona `juanfeliperico369-stack/motorcity` (rama `claude/motor-city-engine-xu7p4y`) junto a `BicicletasUno`, `MetroZero` y `RunRunZero` (en la misma carpeta).
2. Lee `README.md`, `CONTEXTO-IA.md`, `MOTOR.md` y este documento.
3. Corre:
   ```bash
   node motor.mjs mundo && node motor.mjs run && node motor.mjs construir
   node motor.mjs prueba --navegador     # debe dar 54 bien
   ```
4. Juega `dist/motor-city.html`: todas las vistas, Run y vehículos.

## 1. Tu rol
**Auditoría de código** (corrección, rendimiento y robustez), **mejoras concretas del motor** con sus pruebas, y **arte de interfaz**.

**No es tu rol:** el arte del mundo (personaje, vehículos, fachadas, siluetas y cielo): eso es de Gemini.

**Reglas del código:**
- JavaScript puro, sin librerías ni internet.
- Español de Colombia en comentarios y textos.
- El estilo del repo: fragmentos numerados en `js/`, un solo cierre y solo `MC` público.
- **No tocar `js/valle.js`** (el lector 1.2.0 de EnCicla).
- Todo cambio debe dejar `node motor.mjs prueba --navegador` en verde **y** sumar las pruebas nuevas que lo cubran.

## 2. Encargos
| Id | Encargo | Formato |
|---|---|---|
| **C‑M1** | **Auditoría completa del motor:** `js/*.js`, `herramientas/*.mjs` y `sandbox/`. Busca errores lógicos, bordes (fuera del mapa, NaN, listas vacías), fugas de memoria (cachés de losas y regiones de WebGL), trabajo de más por cuadro y lectores binarios que puedan leer fuera del arreglo. | Tabla: archivo:línea, severidad, hallazgo, escenario que falla y *diff* de la corrección |
| **C‑M2** | **Redes precalculadas en el MC4 (2.1):** que `fusionar.mjs` guarde la red `rueda` (nodos y aristas compactos) y que `Mundo.red()` la lea sin reconstruirla. Hoy tarda alrededor de 1 s al arrancar. | *Diff* + medición antes y después |
| **C‑M3** | **Física de carro para *Motor City*:** un modelo de bicicleta cinemática (dos ejes) con agarre lateral, derrape (`deriva`), transferencia de peso y freno, en un `js/35-fisica-carro.js` opcional. Usa las cifras de `MC.Vehiculos` (`deportivo`, `formula`, `drift`). | Código + pruebas + un modo de prueba en el banco |
| **C‑M4** | **Rendimiento de WebGL** (`js/45-gl.js`): *instancing* barato o mallas por lotes, sin reconstruir el buffer dinámico cada cuadro si no cambió. Presupuesto por cuadro, LOD por distancia más fino y medición en un celular si puedes. | *Diff* + cifras |
| **C‑M5** | **Run:** revisa los 12 parches de `herramientas/importar-run.mjs` y `js/50-run.js`. Que las esquinas reales también salgan en cruces en T (solo izquierda o solo derecha) sin romper `turnAt`, y que `RUNV.cielo` respete la luz de la edición. | *Diff* + pruebas |
| **C‑M6** | **Pruebas que faltan:** unidades de `Trazo`, `Red.camino` y `Recorrido.alargar`/`podar`, `SeguirRuta.girar`, `Vista2D.parametros` y la proyección de la panorámica. Más una prueba de «la misma hora, los mismos trenes» en dos instancias. | Código en `pruebas/` |
| **C‑M7** | **Íconos de interfaz** (SVG de 24×24, un trazo, sin texto) para: vista, pixel, vehículo, hora, clima, personaje, ir, Run, salir, freno e impulso. Más el **logotipo de Motor City** (SVG, solo forma; el nombre lo pone el HTML). | SVG en el documento |
| **C‑M8** | **Interfaz del banco de pruebas:** CSS y HTML más claros para celular (pulgares, contraste y tamaños), sin perder ninguna función. | *Diff* de `sandbox/` |

## 3. Auditoría de cruces con los juegos
- Revisa `docs/MIGRACION-ENCICLA.md` y `docs/MIGRACION-ELMETRO.md` contra el código real de cada juego:
  - ¿los nombres que cito (`CityMap.load`, `MAP.tileM`, `VC.edifDe`…) existen y hacen eso?
  - ¿falta algún paso?
- Revisa que `herramientas/sincronizar.mjs` no pueda borrar ni pisar nada que no sea del motor dentro de `motor-valle/`.

## 4. Cómo entregar (un solo documento)
```
# ENTREGA-CHATGPT-MOTOR-CITY
## Resumen (10 líneas: qué hiciste, cómo lo probaste, qué falta)
## C-M1 Auditoría (tabla + diffs)
## C-M2 … C-M8 (cada uno: diff unificado contra la rama, cómo probarlo y la salida de las pruebas)
## Pruebas: salida completa de `node motor.mjs prueba --navegador`
## Reglas aprendidas
```
**Antes de entregar:**
- todos los *diffs* aplican con `git apply` sobre `claude/motor-city-engine-xu7p4y`;
- las pruebas pasan;
- nada de librerías ni de internet.
