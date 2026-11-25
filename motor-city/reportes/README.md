# Reportes de cambios al motor

Toda IA (de EnCicla, El Metro, Run Scooter o de un juego nuevo) o persona que cambie el motor deja aquí su reporte. **La IA del motor (Claude) los lee, pule los detalles y los integra.**

Para abrir uno: `node motor.mjs reporte "Título corto" --juego elmetro --autor "IA de El Metro"`. Las reglas están en [`CONTRIBUIR.md`](../CONTRIBUIR.md).

| Fecha | Reporte | Juego | Autor | Estado |
|---|---|---|---|---|
| 2026-11-20 | [Revisión visual con capturas (G‑H1)](./2026-11-20-gemini-capturas.md) | mandados / motor | Gemini · Antigravity («hydrogen») | Abierto |
| 2026-11-20 | [Revisor de arte sobre `arte/gemini` (G‑H2)](./2026-11-20-gemini-revisar-arte.md) | motor | Gemini · Antigravity («hydrogen») | Abierto |
| 2026-11-20 | [Pruebas consolidadas del motor y los 3 juegos (G‑H6)](./2026-11-20-gemini-pruebas.md) | motor / todos | Gemini · Antigravity («hydrogen») | Integrado en 2.8 |
| 2026-11-20 | [Revisión visual con capturas 2.9.1 + piel ChatGPT (G‑H1)](./2026-11-20-gemini-capturas-2.9.md) | mandados / motor | Gemini · Antigravity («hydrogen») | Abierto |
| 2026-11-20 | [Revisor de arte sobre `arte/chatgpt` y `arte/gemini` 2.9.1 (G‑H2)](./2026-11-20-gemini-revisar-arte-2.9.md) | motor | Gemini · Antigravity («hydrogen») | Abierto |
| 2026-11-20 | [Pruebas de Motor City 2.9.1 — 133/133 en verde (G‑H6)](./2026-11-20-gemini-pruebas-2.9.md) | motor / todos | Gemini · Antigravity («hydrogen») | Abierto |
| 2026-11-20 | [Telemetría móvil: protocolo real + línea base CPU 4× (G‑H9)](./2026-11-20-gemini-celular.md) | mandados / motor | Gemini · Antigravity («hydrogen») | En curso (falta celular real del autor) |
| 2026-11-21 | [Herramientas, skills externas, público simulado, legacy-scan y pruebas 4.0.1 (G‑H12, G‑H13, G‑H6)](./2026-11-21-gemini-herramientas-4.0.md) | motor / todos | Gemini · Antigravity («hydrogen») | Abierto |
| 2026-11-21 | [Auditoría integral de Turno Cero 4.0.1: 12 capturas, 19 lugares, filtro de lenguaje y carga/RAM (G‑H20, G‑H21, G‑H23, G‑H24)](./2026-11-21-gemini-turno-cero.md) | getaway / motor | Gemini · Antigravity («hydrogen») | Abierto (falta GPU en celular real) |
| 2026-11-21 | [Revisión técnica, visual y de memoria del PR #7 + paquete de arte pintado C‑A17/C‑A16](./2026-11-21-gemini-revision-pr7.md) | getaway / motor | Gemini · Antigravity («hydrogen») | Abierto (relevo a Claude/Codex) |
| 2026-11-21 | [Verificación visual 4.0.3, auditoría PR #9 (C‑M34) y benchmark real sobre MC4](./2026-11-21-gemini-verificacion-4.0.3-y-pr9.md) | getaway / motor | Gemini · Antigravity («hydrogen») | Abierto (regresión menú 4.0.3 + fuga multi-ciudad) |
| 2026-11-21 | [Auditoría móvil 4.1.0: Arcade/Vuelo (G‑H25), sigilo Thief (G‑H26) y mundo abierto primero en Turno Cero + El Metro + EnCicla (G‑H28)](./2026-11-21-gemini-clasicos-4.1.md) | getaway / motor / juegos | Gemini · Antigravity («hydrogen») | Abierto (bugs ALTA: Arcade fondo inferior, correr móvil sigilo, menú pausa, El Metro/EnCicla) |
| 2026-11-21 | [Catálogo ampliado de técnicas clásicas en sala limpia (G‑H27: Driver, Midtown Madness, Hard Drivin', Stunt Car Racer, Crazy Taxi + 9 motores)](./2026-11-21-gemini-tecnicas-clasicas-extra.md) | motor / todos | Gemini · Antigravity («hydrogen») | Listo (sala limpia con fuentes y licencias verificadas) |
| 2026-11-21 | [Verificación visual 4.0.3, auditoría PR #9 (C‑M34) y benchmark real sobre MC4](./2026-11-21-gemini-verificacion-4.0.3-y-pr9.md) | getaway / motor | Gemini · Antigravity («hydrogen») | Integrado en 4.2 (fuga RAM resuelta; menú `⏸` pendiente) |
| 2026-11-21 | [Auditoría móvil 4.1.0: Arcade/Vuelo (G‑H25), sigilo Thief (G‑H26) y mundo abierto primero en Turno Cero + El Metro + EnCicla (G‑H28)](./2026-11-21-gemini-clasicos-4.1.md) | getaway / motor / juegos | Gemini · Antigravity («hydrogen») | Abierto (bugs ALTA: Arcade fondo `hor..H`, correr móvil `⚡`, menú `⏸`, El Metro/EnCicla) |
| 2026-11-21 | [Entrega 4.2: Pool sin basura en `MC.Vida` (Burnout 3), Escalador EMA `MC.ResDinamica` (SotC), verificación RAM post-GC 4.2.0 y revisión PR #10](./2026-11-21-gemini-4.2-pool-escalador-y-pr10.md) | motor / getaway | Gemini · Antigravity («hydrogen») | Listo para integrar (`153/153` navegador + `7/7` unitarias en verde) |
| 2026-11-23 | [Entrega 5.0 · G5-01: Vista «Historieta» (Chinatown Wars)](./2026-11-23-gemini-g5-01-historieta.md) | motor / getaway | Gemini · Antigravity («hydrogen») | Listo para integrar (`pruebas/historieta.mjs` en verde, `+3.1 KB`) |
| 2026-11-23 | [Misión V4: Revolución visual de los 6 biomas (18 texturas `1024×256` RGBA WebP sin costuras) e integración de paralaje en `MC.Arcade`](./gemini-v4-paralaje-biomas.md) | motor / getaway | Gemini Antigravity — Motor City V4 | Listo para integrar (`18/18` texturas + `5/5` suites en verde) |
| 2026-11-23 | [Entrega 5.0 · G5-02: Anillos de recoger y entregar (Mandados y EnCicla) y controles de vuelo](./2026-11-23-gemini-g5-02-anillos.md) | getaway / motor | Gemini · Antigravity («hydrogen») | Integrado en 5.2 |
| 2026-11-23 | [Entrega 5.2 · G5-07: Fichas de los 30 sitios icónicos de Medellín (para C5-02)](./2026-11-23-gemini-g5-07-sitios.md) | motor / mapa | Gemini · Antigravity («hydrogen») | Listo para integrar (`671/671` en `sitios-medellin.mjs`, `+0 KB`) |
| 2026-11-23 | [Entrega 5.2 · G5-01-b: Historieta GPU — noche, lluvia y primera persona (412×860)](./2026-11-23-gemini-g5-01-b-historieta.md) | motor / getaway | Gemini · Antigravity («hydrogen») | Listo para integrar (`historieta.mjs` día/noche/lluvia/1P en verde, `+1.0 KB`) |

| 2026-11-23 | [Entrega 5.0 · G5-02: Anillos de recoger y entregar (Mandados y EnCicla) y controles de vuelo](./2026-11-23-gemini-g5-02-anillos.md) | getaway / motor | Gemini · Antigravity («hydrogen») | Listo para integrar (`pruebas/anillos.mjs` en verde, `+9.4 KB`) |
| 2026-11-23 | [Entrega 5.2 · G5-05: Guía sin flecha en 🎬 Modo cine (hojas y palomas hacia el destino)](./2026-11-23-gemini-g5-05-guia-cine.md) | getaway | Gemini · Antigravity («hydrogen») | Listo para integrar (`pruebas/guia-cine.mjs` en verde, `+12.1 KB`) |
| 2026-11-23 | [Entrega 5.0 · G5-02: Anillos de recoger y entregar (Mandados y EnCicla) y controles de vuelo](./2026-11-23-gemini-g5-02-anillos.md) | getaway / motor | Gemini · Antigravity («hydrogen») | Listo para integrar (`pruebas/anillos.mjs` en verde, `+9.4 KB`) |
| 2026-11-23 | [Entrega 5.2 · G5-08: Química del mundo (lluvia apaga fuego, charcos salpican, viento lleva humo + arreglo cota 3D en Efectos)](./2026-11-23-gemini-g5-08-quimica.md) | motor / getaway | Gemini · Antigravity («hydrogen») | Listo para integrar (`pruebas/quimica-mundo.mjs` 7/7 en verde, `+8.8 KB`) |
| 2026-11-23 | [Entrega 5.2 · G5-04: Minijuegos táctiles cortos (Chinatown Wars)](./2026-11-23-gemini-g5-04-minijuegos.md) | getaway / familia | Gemini · Antigravity («hydrogen») | Listo para integrar (`4/4` en `minijuegos.mjs`, `+27.8 KB`) |


| 2026-11-24 | [Fase 0 del renacimiento cenital: línea base de los 3 repositorios, edificios contra vías en El Metro (18,8 %) y capturas «antes»](./2026-11-24-claude-fase0-cenital.md) | motor / El Metro / EnCicla / getaway | Claude | Fase 1 en espera de las decisiones del autor |
