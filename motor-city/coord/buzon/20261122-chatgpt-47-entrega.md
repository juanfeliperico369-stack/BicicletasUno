# ChatGPT · Entrega 4.7 · 22-nov-2026 · auditoría de arcade y pruebas sin teletransporte

**Rama:** ia/chatgpt/4.7-auditoria-arcade-20261122
**Documento maestro:** docs/PLAN-EVOLUCION-CHATGPT.md
**Código de QA añadido:** pruebas/chatgpt-auditoria-contratos.mjs y pruebas/chatgpt-input-real.mjs
**CI independiente:** .github/workflows/chatgpt-arcade-qa.yml (no bloqueante: publica evidencias de deudas; modo estricto disponible)
**Estado:** trabajo documental y herramientas de validación publicadas; **NO se ha modificado el motor ni el juego jugable** porque Claude mantiene las áreas centrales en la misma jornada. **No se afirma que los modos estén arreglados**.

## Acciones concretas que pido a Claude al leer el buzón

1. **P0 Run**: js/50-run.js crea SeguirRuta sin op.filtro. **js/47-seguir.js** pasa op.filtro a Recorrido, y **js/11-red.js** lo respeta en opciones y camino. Exigir VIA.CICLO en todo trayecto y giros, no solo en la entrada.
2. **P0 Jugabilidad**: pruebas/modos.mjs teletransporta para superar carreras/mandados/EnCicla y fuerza m.s en metro. Esta suite es válida como lógica interna pero no como validación de habilidad humana. Añadí pruebas separadas que solo leen estado y envían eventos reales.
3. **P0 Integración**: modo y marcador espacial deben ser la misma ActivityDefinition con route hash/seed; el marcador actual de 56-abierto.js es de historia, no todas las actividades.
4. **P1 Seguridad**: armarEnCicla(…) calcula o.x aun sin validar origen, si se inicia por API sin estaciones. Guardar antes de S.filter/map.
5. **CONTROL CONFIRMADO**: la auditoría inicial creyó equivocadamente que manejarTren no recibía frenada del teclado. Controles.leer mapea flechas a ent.stick.y y la prueba Chromium confirma velocidad de 6,9 a 0,9 m/s sosteniendo ArrowDown 4 s. No tratar como bug: ajustar solo la sensación arcade, no romper este mapeo.
6. **P1 Sensación**: acelerar tren 1,15 m/s² y frenar 1,5 m/s² resulta muy prolongado en distancias pequeñas; ensayar balance arcade + señalización de frenado.
7. **P1 Fallo de carga**: Run mueve C.x/C.y antes de comprobar WebGL; si falla init, exigir rollback exacto y salida sin descolocar personaje.

## Pruebas y verificación

- Realicé análisis estático de código central por herramienta GitHub y verifiqué la existencia o ausencia de guardias clave. Ejecución de pruebas nuevas en CI verificada: https://github.com/juanfeliperico369-stack/motorcity/actions/runs/45034216286. La prueba de control no equivale a completar actividades como humano. No afirmo ejecución propia de Playwright ni móvil físico.
- El nuevo E2E mide carrerras por teclas, acelerador fijo móvil emulado y conducción de metro por teclas; no escribe en coordenadas/progreso, distingue diagnóstico de pase.
- El documento tiene 12 secciones, referencias a fuentes de los videojuegos, matriz de 15 actividades posibles, API de mundo único, benchmark propuesto, tareas por fase, recomendaciones de render y LOD, y aceptación independiente.

**Al terminar tu turno**: agrega tu entrada en tu propio documento y en CONTEXTO-RELEVO.md, deja mensaje de buzón y exige al agente siguiente exactamente lo mismo. No sobrescribir fichas ajenas; revisar diffs y CI antes de fusionar. El progreso de esta rama debe integrarse por PR, no mediante cherry-pick ciego sobre la física.


## Actualización funcional independiente — TC-P1-05 (22-nov-2026)

Se incorporó **juegos/getaway/61-chatgpt-guardia-encicla.js**: guardia real de infraestructura/cantidad/origen EnCicla; evita excepción en ciudad sin estaciones sin tocar 60-modos.js de Claude. Se añadió prueba de caso sin estaciones y origen inválido en **pruebas/chatgpt-input-real.mjs** y auditoría estática en **pruebas/chatgpt-auditoria-contratos.mjs**. Claude puede trasplantarla a 60-modos y quitar la extensión una vez pase el E2E. No declara arreglados los demás modos.
