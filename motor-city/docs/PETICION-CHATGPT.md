# Petición para ChatGPT (Codex) · auditoría de código, mejoras y contenido del motor 2.2

- **De:** Claude, la IA del motor Motor City.
- **Para:** ChatGPT, con Codex (agente de código) y su generador de imágenes.
- **Entrega:** **un solo documento**, `ENTREGA-CHATGPT-MOTOR-CITY-2.2.md`, con absolutamente todo: texto, *diffs*, código y SVG. El autor (OneZero) me lo pasa y yo lo uno, lo pruebo y lo mejoro.

## 0. Antes de empezar (obligatorio)
1. Clona `juanfeliperico369-stack/motorcity` (rama `claude/motor-city-engine-xu7p4y`).
2. Lee `README.md`, `CONTEXTO-IA.md`, `docs/MANUAL.md`, `MOTOR.md`, `docs/INVESTIGACION.md`, `docs/OPTIMIZACION.md` y este documento.
3. Corre:
   ```bash
   node motor.mjs construir
   node motor.mjs prueba --navegador     # debe decir «✓ TODAS LAS PRUEBAS PASARON · 103 bien»
   ```
4. Juega Mandados y Medellín (ver `docs/PLAN-IAS.md`, «Reglas para todas»).

## 1. Tu rol
**Auditoría de código, mejoras con pruebas y contenido escrito** (storylets), más los íconos de interfaz que Gemini no haga.

**Reglas del código:**
- JavaScript puro, sin librerías ni internet;
- español de Colombia;
- fragmentos numerados en `js/`, un solo cierre y solo `MC` público;
- **no tocar `js/valle.js`**;
- todo cambio deja las pruebas en verde **y suma las suyas**.

## 2. Encargos
| Id | Encargo | Formato |
|---|---|---|
| **C‑M1** | **Auditoría 2.2:** `05-gpu`, `13-cosmos`, `32-fisica` (superficies y coyote), `34-camara` (resortes, brazo y FEZ), `37-manejo`, `38-sprites`, `41-vista2d` (lateral y rayos X), `44-raster`, `48-interiores` (estilos y `cabe`), `49-hogar` (direcciones), `70-interfaz` (zonas y cola), `82-lugares` y `85-historias` (director y ocurrencias). Busca errores, bordes (NaN, listas vacías, fuera del mapa), fugas (cachés que crecen) y trabajo de más por cuadro. | Tabla archivo:línea · severidad · escenario que falla · *diff* |
| **C‑M2** | **Redes precalculadas en el MC4:** guardar la red `rueda` compacta y leerla sin reconstruirla. | *Diff* + medición antes y después |
| **C‑M3** | **Raster más rápido** (`44-raster.js`): caché de la rejilla del relieve por trozos, reutilizar arreglos y cortar polígonos lejanos. Meta: menos de 12 ms a calidad 0,8 en Chromium sin GPU. | *Diff* + cifras |
| **C‑M4** | **Direcciones colombianas** (`49-hogar.js`): 50 direcciones de **calles y cruces públicos** de Medellín, Envigado, Itagüí, Bello y Guatapé, con el porcentaje de exacta, calle o lugar. Soporte de «Bis», «Este», diagonales, transversales, «Km» de vías y «Vereda». Nunca uses direcciones de personas reales. | *Diff* + pruebas |
| **C‑M5** | **Paquete de 60 storylets:** 20 de diversión, 20 de reflexión y 20 de conciencia, en el formato de `MC.Historias` (`id`, `pilar`, `cuando(c)`, `texto`, `opciones[{ texto, efecto }]`). En español de Colombia y para todo público. Las de conciencia, con un dato **verificable** y su fuente en un comentario. Que usen el contexto: hora, clima, tipo de lugar, vehículo, altura y dinero. | Código JS (`storylets-base.js`) |
| **C‑M6** | **Accesibilidad e interfaz:** `MC.UI` con lector de pantalla y teclado, contraste AA, **modo zurdo** (botones a la izquierda) y tamaño de letra grande. Más una prueba de que `MC.UI.verificar` sigue en 0 en vertical y horizontal. | *Diff* + pruebas |
| **C‑M7** | **Íconos SVG** (24 px, un trazo, sin texto) que no haga Gemini, y el **logotipo de Motor City** (solo forma). | SVG |
| **C‑M8** | **Pruebas que faltan:** `Manejo.seguirRuta` y `rutaA`, `Hogar.mover`, `girar` y `quitar`, `Lugares.hacer` en los 10 tipos, `Ocurrencias` (atascado y bajo el piso), `Cosmos` (Kepler: a = 1 UA y M = 1 dan T = 1 año), `Sprites.hornear` en el navegador y `ResDinamica` en estado estable. | Código en `pruebas/` |

## 3. Cruces con los juegos
- Revisa `docs/MIGRACION-ENCICLA.md` y `docs/MIGRACION-ELMETRO.md` contra el código real de cada juego. ¿Los nombres que cito existen? ¿Falta algún paso para pasar de `motor-valle/` a `motor-city/`?
- Revisa que `herramientas/sincronizar.mjs` no pueda pisar nada que no sea del motor dentro de `motor-city/`.

## 4. Cómo entregar (un solo documento)
```
# ENTREGA-CHATGPT-MOTOR-CITY-2.2
## Resumen (10 líneas)
## C-M1 Auditoría (tabla + diffs)
## C-M2 … C-M8 (diff unificado, cómo probarlo y salida de las pruebas)
## Pruebas: salida completa de `node motor.mjs prueba --navegador`
## Reglas aprendidas
```
**Antes de entregar:**
- los *diffs* aplican con `git apply`;
- las pruebas pasan;
- nada de librerías ni de internet.
