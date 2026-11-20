---
name: motor-city-revision-ia
description: Revisión disciplinada de cambios hechos por IA, redacción de instrucciones verificables para agentes, evaluación de skills/plugins externos antes de adoptarlos y uso responsable de simuladores de audiencia como hipótesis. Úsala al revisar PRs, validar entregas entre IAs (Claude, Codex, Gemini) o evaluar nuevas herramientas para Motor City.
---
# Motor City · revisión de código IA, gobernanza de skills e hipótesis

Sintetiza las buenas prácticas de revisión de código generado por IA, instrucciones claras de agentes, directorios de skills y simulación de escenarios (como [`666ghj/MiroFish`](https://github.com/666ghj/MiroFish), AGPL-3.0).

## 1. Lista de revisión para cambios generados por IA
Antes de aprobar o integrar un PR/commit en Motor City o sus juegos:
1. **Alcance y rol:** verifica `TAREAS-IA.md`. Ningún agente debe tocar archivos fuera de su rol ni romper `js/valle.js`.
2. **Un solo cierre IIFE:** revisa que no haya `const`/`let` repetidos en el nivel superior entre `js/*.js` (`grep -n "^const " js/*.js`).
3. **Cero dependencias en el juego:** `dist/motor.js` y `dist/juegos/*.html` deben seguir corriendo sin internet ni paquetes externos.
4. **Comportamiento verificado, no solo sintaxis:** exige ejecución real de `node motor.mjs construir` y `node motor.mjs prueba --navegador` (100 % en verde) + revisión de regresiones en CPU 4× (`< 40 ms`, meta `< 20 ms` en maqueta).
5. **Honestidad epistémica:** separa siempre **hecho comprobado** (probado en Node/Chromium o visto en fotograma/fuente primaria) de **hipótesis** o **contenido bloqueado por login**. Nunca inventes métricas de celular real ni descripciones de videos inaccesibles.
6. **Contratos y persistencia:** valida que los campos nuevos tengan valor por defecto, `schema_version` y migrador explícito (como `MC.GuardadoSectores` y `schemas/`).

## 2. Cómo evaluar una skill o plugin externo antes de adoptarlo
Antes de agregar una herramienta descubierta en directorios (`skills.sh`, `agentskills.io`, marketplaces):
- **Procedencia y licencia:** comprueba repositorio oficial, actividad y licencia SPDX. Herramientas **AGPL-3.0** (como MiroFish) o con servidores/LLMs externos **nunca se empaquetan en el motor ni en los juegos**; solo pueden usarse por fuera como apoyo opcional de diseño o pruebas.
- **Utilidad concreta:** pregunta qué problema real del motor resuelve y si puede incorporarse como una guía ligera en `.claude/skills/` sin añadir dependencias al repositorio.
- **Seguridad:** no ejecutes scripts remotos sin revisar su código ni expongas llaves/tokens del proyecto.

## 3. Simulación sintética de usuarios (p. ej. MiroFish)
Si se usa un simulador multi-agente para anticipar reacciones a una portada, mecánica o lanzamiento de Motor City:
- Trátalo estrictamente como **generador de hipótesis** (qué objeciones o dudas podrían surgir), **nunca como prueba de usabilidad**.
- Toda hipótesis importante debe contrastarse con **jugadores reales** y mediciones reales (`reportes/*-celular.md`).
