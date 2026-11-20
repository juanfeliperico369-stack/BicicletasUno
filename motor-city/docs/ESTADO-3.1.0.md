# Estado verificable de entregas · Motor City 3.1.0

Fecha: 2026-11-20. Fuente: repositorio `juanfeliperico369-stack/motorcity`, rama `claude/motor-city-engine-xu7p4y`. Integración: [PR #5](https://github.com/juanfeliperico369-stack/motorcity/pull/5).

## Entregas confirmadas

| Bloque | Qué existe | Verificación real | Qué NO está cubierto |
|---|---|---|---|
| C-M26 | `MC.Persecucion`, modo optativo y patrullas con `MC.Cuerpo`, rutas, casi choques y salida | [CI #44758766581](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44758766581): 131 Node + 141 Chromium; E2E móvil de persecución | Ajustes de dificultad 1–5, captura real en Android y juego *Getaway* |
| C-M25 | Portada editorial sobria y accesible | Chromium en cuatro tamaños (320×640, 412×860, 860×412, 1440×900) | `sloplint --render` externa no ejecutada |
| G-H1 | 14 capturas de juego + 2 de portada; revisión visual detallada | Capturas reales de Chromium en `dist/capturas/` y reporte G-H1 | Algunos problemas visuales siguen anotados; no cubre GPU móvil |
| G-H2 / G-H6 | Revisor de arte y CI con Node, Chromium y público simulado | Gemini 9 atlas/997 cuadros, ChatGPT 6 atlas/676 cuadros, 0 errores graves en revisor | Revisor no certifica dirección de arte ni compatibilidad real de cada sprite |
| G-H18 | 50 lugares geográficos de NYC con IDs, coordenadas, fuentes y campo `acceso: por_verificar` | Generador, prueba sintética y GitHub Actions que publicó el JSON; controles de duplicados y accesos de servicios municipales | Los datos NO son un mapa MC4, ni 50 destinos accesibles verificados |
| G-H19 | Informe documental de tres persecuciones con enlaces de fuentes | Se distinguen datos de fichas oficiales y supuestos | Sin videos observados no hay minutajes falsos |
| C-M29 | 30 objetos físicos, IDs estables, restauración por sectores en Mandados | Prueba de Node y navegador en CI #44758766581 | Falta streaming masivo y modelos individuales |
| C-M27 (parcial) | Sombras solares planas en WebGL1, con mezcla alfa y caché | Prueba sintética añadida en rama; **CI del commit c64cc341 pendiente al redactar** | No es shadow map ni tilt-shift con profundidad; no hay 60 FPS confirmados en móvil real |
| C-A13 (parcial) | Guía SVG original de seis fachadas | Revisor automático de la rama para atlas existentes | Falta atlas UV final por fachada |
| G-H15 (parcial) | 14 HEX editoriales y referencias de Guatapé | Fuentes enlazadas | HEX no medidos con pipeta ni calibrados |
| G-H12/G-H13 (parcial) | Skills externas fijadas a commit, script para instalaciones y guía de compatibilidad | Revisión de código + CI Node | No se instalaron realmente en Antigravity ni se corrió `legacy-scan` |
| Ecosistema | Auditoría de EnCicla, El Metro y Run Scooter en `docs/AUDITORIA-ECOSISTEMA-2026-11-20.md` | Revisadas las raíces de las ramas `main` | No se aseguró que consuman el motor 3.1.0; versiones de copias documentadas sin presencia en main |

## Trabajo pendiente por prioridad

**P0 · Seguridad de lanzamiento.** Validar el CI más reciente y los PNG de WebGL sobre GPU; probar 5 min por vista/calidad en un Android físico y recoger p50/p95, uso de memoria y temperatura. Mantener la PR en borrador hasta no tener fallos críticos. Registrar regresiones del modo persecución en carro/moto.

**P1 · Cerrar bloque 3.0.** C-M27 (shadow maps solo si la capacidad GPU/rendimiento lo permite, tilt-shift por profundidad opcional), C-M28 (UV real de fachadas e impostores), C-M29 (rampas, saltos y destrucción visible), C-A13 y C-A14 (arte ortográfico, medidas y licencias). Las referencias no se deben confundir con atlas listos para producción.

**P2 · Trabajo creativo.** C-A12 (tráiler capturado desde una build real, sin métricas ficticias), C-A10 y C-A11; después C-M20–C-M22. Diseño original, minimalista, sin neones SaaS ni imágenes falsas de gameplay.

**P3 · Nueva York.** G-H18 es catálogo inicial, NO un territorio MC4. Antes de C-M30 deben verificarse OSM/ODbL, descargas GIS, memoria y sectores de 1 km; después Getaway y mundo redondo C-M31. Evitar empezar un juego enorme mientras el motor está a medio integrar.

## Política de publicación

Las entregas están **publicadas en la rama de la PR**, no equivalen a `main` ni a GitHub Pages en producción. Solo fusionar con pruebas automatizadas verdes y evaluación en móvil real. La licencia del motor requiere decisión del titular. Los cambios en juegos consumidores serán PRs independientes con compatibilidad de guardados demostrada.

## Criterios para decir «terminado»

1. Construcción HTML única funciona offline; tests Node/Chromium en verde.
2. No hay solapamientos de HUD, los nombres no quedan debajo de controles y las capturas pasan inspección humana.
3. Dispositivos reales: sin fallos bloqueantes, percentil 95 aceptable y sin degradación térmica no controlada.
4. EnCicla, El Metro y Run Scooter tienen contratos y pruebas de compatibilidad; no solamente documentación que afirma haberlos sincronizado.
5. Cada asset tiene autoría/licencia y dimensiones verificadas; nada presentado como metraje real si fue una representación conceptual.

## Expansión NUEVA: TURNO CERO / MANHATTAN (preproducción)
**Paquete publicado en esta rama:** análisis de 13 referencias comerciales (`docs/REFERENCIAS-MANHATTAN-13.md`), biblia narrativa adulta y técnica (`docs/GETAWAY-MANHATTAN-BIBLIA.md`), JSON de máquina, dos guías SVG originales y `juegos/getaway/prototipo.html` con controles offline y narrativa experimental. El prototipo **no usa mapa real de Manhattan** y no debe publicarse como tal. La prueba específica `pruebas/getaway-prototipo.mjs` está integrada a CI, cuya ejecución debe verificarse.
