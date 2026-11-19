# Motor City · documento único de auditoría y puesta a punto

Fecha: 19 de noviembre de 2026 (UTC)
Checkout principal: `motorcity`, rama local `work`, commit `44739d7320e793ae1743fdd501b9f0c91e918402`
Versión: Motor City 2.5.0

## 1. Alcance y separación de instrucciones

La solicitud del autor fue configurar el entorno cloud, leer los tres adjuntos, probar el motor y los juegos relacionados, auditar resultados, terminar la entrega de arte que faltara y dejar ideas/sugerencias.

Los adjuntos son documentación del proyecto, no cambios de código que deban ejecutarse literalmente:

- `DOCUMENTO-UNICO.md`: contexto, contrato, recetas, roles de las IAs, reglas de contribución, pruebas, arte y licencias.
- `MOTOR-CITY-TODO.md`: la misma base ampliada con anexos de manual, contrato MC4, investigación, optimización, negocio, contribución y bitácora.
- `mandados.html`: artefacto ejecutable autocontenido del minijuego; no contiene una petición separada.

Se respetó la división de esos documentos: auditoría, código y pruebas para Codex; arte final para la IA de arte. La entrega oficial de Gemini se encontró en la rama remota `claude/motor-city-engine-xu7p4y`, commit `f95135d`, y quedó incorporada a `main` junto con este informe.

## 2. Material leído y verificado

El documento único fue leído hasta el final, incluidos sus anexos. Se revisaron arquitectura por capas y módulos `MC.*`, MC4, mundos Medellín/Guatapé, redes, niveles, agua y física, vistas, raster, GPU dinámica, UI, interiores, casa, ciudad, storylets, reglas de sprites/atlas, ganchos de arte, respaldo procedural, investigación de FEZ, Monument Valley, Little Nightmares, No Man’s Sky, SimCity, Los Sims, Cities: Skylines y Townscaper, optimización, licencias y bitácora 2.5.

Hashes de los adjuntos y artefactos construidos:

| Archivo | SHA-256 | Resultado |
|---|---|---|
| `DOCUMENTO-UNICO.md` adjunto | `b8f20d9f0c3b5ad60e2eebac783ad2715545b1b4dfbf4887cb8363ffc7ea3673` | leído |
| `MOTOR-CITY-TODO.md` adjunto | `8b9f538dc2a4ed10c468aa689449ee1411c089e5d9ea2ffdfa5f63b0c280f71b` | leído; coincide con `dist/` |
| `mandados.html` adjunto | `1b324ff679e477206f3d68a3d30d2a639cc4473d989b504245eb960ade34b42f` | coincide byte a byte con `dist/` |

## 3. Entorno configurado

- La máquina cloud terminó de aprovisionarse y quedó `running`/`connected`.
- GitHub funciona mediante el proxy HTTPS existente; se verificaron lecturas de los cuatro repositorios sin solicitar ni imprimir tokens.
- No se requirieron secretos ni variables nuevas.
- La configuración guardada conserva `motorcity` como repositorio principal en `/workspace/motorcity`; los otros tres checkouts se usaron para auditoría local y no se añadieron a la membresía persistente.
- Se guardaron en el draft de configuración:
  - `install_script`: `cd /workspace/motorcity && node motor.mjs construir`.
  - `start_skill`: construir, comprobar `dist/motor.js` y `dist/juegos/mandados.html`, y ejecutar las pruebas Node.
- El draft quedó en estado `saved` y requiere que el usuario lo revise, lo guarde en Environment Settings y publique el entorno. Guardar el draft no ejecuta ni publica la configuración.

## 4. Motor City: construcción y pruebas

Construcción reproducible:

```text
✓ Motor City 2.5.0: motor.js 581 KB (48 archivos) · mundo 8164 KB · motor-city.html 9033 KB · juegos: mandados 892 KB
✓ dist/MOTOR-CITY-TODO.md · 142 KB · 10 partes
```

`node motor.mjs prueba --navegador` ejecutó y aprobó las 111 pruebas Node: MC4, coordenadas, edificios, 123 km de ciclorrutas, A*, transporte, semáforos, ciencia, economía, seres, interiores, música, mundos generados, ciudad, agua, pendientes, obstáculos, nado, buceo, aire limitado y lancha.

El runner oficial de navegador no pudo iniciar porque falta el binario administrado de Playwright (`chrome-headless-shell`). El intento de instalarlo fue bloqueado por la política de red en `cdn.playwright.dev`; no se desactivó TLS ni se alteraron checksums.

Como validación complementaria, el mismo banco se ejecutó con `/usr/bin/chromium` y servidor HTTP local:

- las 9 vistas cambiaron correctamente, incluyendo lateral, pixel, WebGL/raster y Run;
- el flujo de Mandados pasó sus invariantes: UI sin encimados, casa, estilo, agua, bici parqueada, nado, alcalde, capas y crecimiento;
- el único hallazgo de rendimiento fue `maqueta: 44,7 ms` con CPU 4×; las otras mediciones fueron cenital 11,1 ms, ciudad 3D 18,9 ms, lateral 18,4 ms y panorámica 10,3 ms;
- los avisos 404 observados pertenecen al servidor HTTP temporal (`favicon`/rutas auxiliares), no al flujo funcional ni al HTML autocontenido.

## 5. Auditoría de los otros repositorios

Se clonaron las ramas `claude/motor-city-engine-xu7p4y` y se verificó que las lecturas de `main` y de la rama de trabajo existen.

### Juega EnCicla · `BicicletasUno`

- Compilación correcta (`dist/juega-encicla.html`, 5.022 KB).
- Assets correctos después de ejecutar el paso documentado con Chromium del sistema.
- `tests/run.js --n=100`: 100 partidas sin fallas, mapa y 6 minijuegos correctos, interfaz, accesibilidad, calendario, trama, vehículos, rendimiento y exportación aprobados.
- Un fallo persistente: el test «el invitado 2 ve al anfitrión y al invitado 1» en `tests/run.js:446`. La carrera, turno en equipo, órdenes, recarga, mundo libre y ausencia de errores sí pasan. La aserción se evalúa después de una ventana fija de 900 ms; conviene esperar/confirmar el último estado recibido antes de diagnosticar una regresión de WebRTC.

### El Metro · `MetroZero`

- Compilación correcta (`dist/index.html`, 8.477 KB).
- Servidor local: 16 comprobaciones correctas.
- `selfTest`: 31 líneas, 159 estaciones, 38 tramos de metro, 34 rutas de bus, 31 recorridos 3D, 21 tableros, 30 puzles, 9 capítulos, 79 piezas de arte y 639.457 casas/edificios; 0 errores y 0 avisos.
- Bot de 100 partidas: 344.889 pasos, 37 victorias y 0 errores.
- Tras generar los assets, el runner de 10 partidas concluyó `RESULTADO: OK, 0 errores`, sin errores de consola.

### Run Scooter · `RunRunZero`

- Compilación correcta (`web/index.html`, 461,4 KB).
- Simulador de 100 partidas: 0 errores y 0 filas imposibles.
- Bot de navegador completo con Chromium del sistema: UI, partida real, pausa/reanudación, exportación y 100 simulaciones pasaron; `ERR: []` y errores de consola vacíos.

## 6. URLs públicas

Se intentaron las páginas de Motor City, Mandados, EnCicla, El Metro, Run Scooter y el documento publicado. El proxy cloud devolvió `CONNECT tunnel failed, response 403` para `github.io`. Esto no permite concluir si el despliegue público está bien o mal; es una limitación de egress del entorno. La validación local de los artefactos sí fue posible.

## 7. Auditoría de arte y código

El código fuente y los artefactos principales quedan indexados en `docs/DOCUMENTO-UNICO.md`, `dist/MOTOR-CITY-TODO.md`, `js/15-terreno.js`, `js/28-naturaleza.js`, `js/32-fisica.js`, `js/44-raster.js`, `js/46-vistas.js`, `js/70-interfaz.js`, `juegos/mandados/juego.js`, `dist/juegos/mandados.html` y `pruebas/prueba.mjs`.

La entrega oficial de Gemini está en [`../ENTREGA-GEMINI-MOTOR-CITY-2.5.md`](../ENTREGA-GEMINI-MOTOR-CITY-2.5.md): un documento único con atlas WebP/SVG embebidos, manifiestos JSON `MC.Sprites.atlas`, 30 hitos SVG, 53 iconos HUD, paletas, guía de luz, código de integración `MC.arte` y auditoría visual/multi-repositorio. Su auditoría declara `MC.Sprites.faltan = []` y `mueblesFaltan = []` en Mandados. No modifica el núcleo `js/*.js`; la integración es explícita.

## 8. Recomendaciones priorizadas

1. Desbloquear el navegador reproducible: añadir `cdn.playwright.dev` a la allowlist o parametrizar los runners para aceptar `/usr/bin/chromium`; después repetir los comandos oficiales sin adaptador temporal.
2. Optimizar `maqueta`: perfilar 5 s, separar fachadas, mobiliario y losas, aplicar caché por región, LOD y lienzos precalculados; objetivo menor de 40 ms en CPU 4× y acercarse a los ~27 ms documentados.
3. Robustecer el test WebRTC de EnCicla con ACK/sequence number o espera de un frame con posición nueva de cada participante.
4. Medir en un teléfono real de gama media: modelo, FPS, `MC.GPU.perfil()`, vista, calidad y temperatura.
5. Revisar artísticamente la entrega oficial en las nueve vistas y repetir la medición en un celular real; el commit remoto ya incluye las familias completas declaradas para vehículos, hitos, estados, estilos, props, decals, fachadas y agua.
6. Resolver licencias antes de distribuir: licencia del motor, atribución OSM/Overture/SRTM y permisos para logos o marcas de Metro/EnCicla.

## 9. Estado final

El entorno local soporta el flujo de desarrollo y auditoría del motor y los tres juegos. La construcción principal y 111 pruebas Node están en verde; Metro y Run Scooter pasaron sus validaciones funcionales; EnCicla tiene un único fallo de reenvío WebRTC; la maqueta supera el presupuesto en este host; la entrega oficial de arte de Gemini quedó lista para publicar desde su rama remota; y la comprobación pública queda pendiente de permitir `github.io` en la red cloud.
