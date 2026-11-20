# Auditoría de integración de los cuatro repositorios · 20-nov-2026

Este informe distingue hechos observados en las ramas `main` de los repositorios y afirmaciones históricas de la documentación. No presume que otras ramas sean iguales.

| Repositorio | Situación comprobada | Riesgo |
|---|---|---|
| `motorcity` | Fuente 3.0.0 en `main`, PR #5 propone 3.0.1; `TAREAS-IA.md` y módulos numerados | la web de Pages no incorpora cambios sin fusionar y reconstruir `dist` |
| `BicicletasUno` | `dist/build.json` indica 1.7.1; `tools/build.js` incluye `motor-valle/js/valle.js`, pero no integra `motor-city` moderno | mundo duplicado y migración documentada pero no aplicada a `main` |
| `MetroZero` | `tools/build.mjs` agrupa `src/data/*.js` y `src/js`; no hay carpeta `motor-city/` en raíz de `main` | mundo y mecánicas duplicadas, compatibilidad no comprobada |
| `RunRunZero` | solo `README.md` con contenido mínimo en `main` | el origen reproducible del código Run no aparece en ese repositorio |

## Inconsistencias
1. `docs/MIGRACION-ENCICLA.md` y `docs/MIGRACION-ELMETRO.md` describen una copia `motor-city/` ya presente en los juegos; en las raíces actuales de las ramas principales esa carpeta no figura.
2. `TAREAS-IA.md` del motor afirma que cada juego trae un `TAREAS-IA.md` en raíz, pero no se encuentra en `main` de los tres juegos.
3. `RunRunZero` no contiene los archivos que permiten verificar la procedencia de `motorcity/run/run-scooter.js` desde el repositorio enlazado.

## Ruta de compatibilidad recomendada
1. Crear un contrato de versión, identificación del mundo MC4 y API pública por juego.
2. Copiar el motor sin activarlo a los juegos y comprobar SHA y pruebas existentes.
3. Migrar datos duplicados por capas, preservando el formato de guardado legacy y `js/valle.js`.
4. Instrumentar las pruebas offline y visuales en el pipeline de cada juego.
5. Sincronizar únicamente después de validar peso, RAM, FPS y rollback.

El asunto de seguimiento se publicó en https://github.com/juanfeliperico369-stack/motorcity/issues/6.
