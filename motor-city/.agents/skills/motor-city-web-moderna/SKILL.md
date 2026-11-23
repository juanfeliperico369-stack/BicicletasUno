---
name: motor-city-web-moderna
description: Buenas prácticas de la plataforma web moderna y compatibilidad Baseline para Motor City (Canvas 2D, WebGL2, Web Audio, Pointer Events, almacenamiento, accesibilidad y respaldos ligeros sin librerías). Basada en GoogleChrome/modern-web-guidance (Apache-2.0). Úsala al tocar HTML, CSS, Canvas, WebGL o APIs del navegador.
---
# Motor City · plataforma web moderna

Inspirada en [`GoogleChrome/modern-web-guidance`](https://github.com/GoogleChrome/modern-web-guidance) (Apache-2.0, equipos de Chrome, Edge, Firefox y MDN). En Motor City el motor corre en **JavaScript puro sin librerías ni internet en tiempo de juego**, por lo que la plataforma web nativa es toda nuestra caja de herramientas.

## 1. Reglas de compatibilidad (Android Chrome, iOS Safari y Chromium)
- **Prioriza APIs Baseline Widely Available:** antes de usar una API nueva (CSS, Canvas, WebGL, Audio o DOM), comprueba que exista en Chrome Android y Safari iOS o protege la llamada con detección de capacidades (`if ('OffscreenCanvas' in globalThis)`).
- **Respaldo ligero en vez de polyfills:** si falla WebGL2 → `MC.Raster` (CPU); si falla `localStorage` (modo privado / cuota llena) → devolver `false` sin romper la partida (patrón de `MC.GuardadoSectores`); si falla `AudioContext` sin gesto del usuario → desbloquear en el primer `pointerdown`.
- **Unidades de viewport móvil:** usa `dvh` / `svh` con respaldo `100vh` y `env(safe-area-inset-*)` para pantallas con muesca o barra de gestos; evita que el navegador haga *pull-to-refresh* o zoom accidental sobre el canvas (`touch-action: none; user-select: none;`).
- **Entrada unificada:** usa **Pointer Events** (`pointerdown/move/up/cancel`) con `setPointerCapture` en controles táctiles y maneja `pointercancel` para no dejar el joystick trabado.

## 2. Rendimiento y accesibilidad nativos
- **Canvas y DPR:** limita `devicePixelRatio` (`Math.min(2, devicePixelRatio || 1)`), usa `{ alpha: false }` en el lienzo opaco principal y evita crear objetos/gradientes pesados dentro de `requestAnimationFrame`.
- **Lecturas sin reflujo:** no mezcles escrituras de estilo DOM con lecturas de `getBoundingClientRect()` dentro del bucle de juego; cachea tamaños en `resize`.
- **Accesibilidad desde la plataforma:** respeta `prefers-reduced-motion: reduce` (apagando o suavizando sacudida y partículas en `MC.opciones`), usa botones nativos `<button>` con `aria-label` claro y permite navegación por teclado (WASD/flechas + Esc para cerrar diálogos).
- **Guardado seguro:** serializa en una sola escritura atómica, versiona con `schema_version` y captura `QuotaExceededError` / `SecurityError`.

## 3. Plugin oficial opcional (para sesiones de desarrollo)
Si necesitas consultar guías actualizadas de la plataforma web o escanear patrones obsoletos sin tocar el runtime del juego:
- **Claude Code:** `claude plugin marketplace add GoogleChrome/modern-web-guidance` y `claude plugin install modern-web-guidance@googlechrome`
- **Antigravity / Gemini CLI / Codex:** `npx modern-web-guidance@latest install`
- **Sin instalar (consulta puntual):** `npx modern-web-guidance@latest search "<tema>"` o `npx modern-web-guidance@latest legacy-scan .`
