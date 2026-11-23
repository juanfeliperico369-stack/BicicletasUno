---
name: motor-city-qa-playwright
description: Pruebas automatizadas en navegador móvil, revisión visual de capturas, medición de telemetría con CPU 4× y captura limpia de demos con Playwright para Motor City y sus juegos. Basada en lackeyjb/playwright-skill (MIT) y el banco de pruebas del motor. Úsala en auditorías visuales (G-H1), pruebas E2E (G-H6), telemetría base (G-H9) y material de demostración.
---
# Motor City · QA visual y automatización con Playwright

Inspirada en [`lackeyjb/playwright-skill`](https://github.com/lackeyjb/playwright-skill) (MIT) y el plugin oficial de Playwright para agentes (`@playwright/mcp`), adaptada al entorno real del proyecto.

## 1. Entorno sin descargar navegadores extra
Si el sistema ya tiene Chromium (`/usr/bin/chromium`) y falta solo el paquete JS de Playwright:
```bash
mkdir -p /tmp/pw && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --prefix /tmp/pw playwright --no-audit --no-fund
NODE_PATH=/tmp/pw/node_modules MC_CHROMIUM=/usr/bin/chromium node motor.mjs prueba --navegador
NODE_PATH=/tmp/pw/node_modules MC_CHROMIUM=/usr/bin/chromium node motor.mjs capturas
```
*(Nunca instales `playwright` dentro del `package.json` del juego ni metas dependencias externas en `dist/`.)*

## 2. Perfil móvil obligatorio
Todas las pruebas visuales y táctiles se corren con:
- `viewport: { width: 412, height: 860 }`, `deviceScaleFactor: 2`, `isMobile: true`, `hasTouch: true`.
- Registro estricto de `pageerror` y `console.error` (deben quedar en **0**).
- Verificación automática de `MC.UI.verificar(ui).length === 0` y `MC.Sprites.faltan.size === 0` tanto en piel `gemini` como en piel `chatgpt`.

## 3. Regla de inspección visual (nunca solo «pasó el test»)
Después de `node motor.mjs capturas`, **abre y mira cada PNG** (`cenital`, `maqueta`, `lateral`, `ciudad3d` a 10 h / 17 h / 20:30 h + `capa-valor` + `mi-casa`):
1. ¿Se distingue qué es cada cosa en 2 segundos?
2. ¿La interfaz tapa algo del centro o alguna etiqueta sangra debajo de botones?
3. ¿Las proporciones cuadran (persona, bici, carro, puerta, árbol)?
4. ¿Hay recortes, píxeles sueltos, cebras cruzadas, ventanas diurnas de noche o diálogos inesperados?
5. ¿Qué se ve bonito y qué se ve raro? Reporta siempre `foto → hallazgo → gravedad` en `reportes/`.

## 4. Telemetría y capturas de demostración
- **Línea base en VM (CPU 4×):** activa `Emulation.setCPUThrottlingRate({ rate: 4 })` y lee `MC.Telemetria.resumen()` (`fps`, `cuadro_p50/p95/p99`, `dibujo_p50/p95`, `gpu`). **Aclara siempre** que la GPU software de una VM no reemplaza la prueba de 5 min en un celular físico real.
- **Vídeos / clips de lanzamiento:** graba secuencias reales de `mandados.html` (manejo con joystick, cambio de vistas, día→noche, estilos y pieles) usando `recordVideo` de Playwright en una carpeta temporal fuera de git, sin inventar mecánicas que no existan en el motor.

## 5. Plugins externos opcionales
- **Skill de código Playwright:** `npx skills add lackeyjb/playwright-skill`
- **Plugin MCP de Playwright (Claude Code):** `claude plugin install playwright`
