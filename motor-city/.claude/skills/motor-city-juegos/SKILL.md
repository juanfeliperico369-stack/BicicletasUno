---
name: motor-city-juegos
description: Armar rápido un juego o un modo nuevo sobre Motor City (plantillas, piezas del motor, patrones del ciclo de juego, misiones, economía, vehículos, música, interfaz) y compilarlo a un solo HTML. Úsala cuando vayas a crear un juego, un minijuego o una mecánica para EnCicla, El Metro, Run Scooter, Motor City (carreras) o Extremo.
---
# Motor City · hacer juegos rápido

1. `node motor.mjs nuevo juego mi-juego --mundo guatape` arma `juegos/mi-juego/`. Luego `node motor.mjs construir` da `dist/juegos/mi-juego.html`.
2. **El ciclo de siempre** (ver `juegos/mandados/juego.js`, un ejemplo completo):
   - `reloj.avanzar` → `clima.actualizar` → `E.cielo = MC.Cielo.en(...)`;
   - `controles.leer()` → `MC.Manejo.aplicar(entrada, cuerpo, { camara, esquema })` → `cuerpo.actualizar(dt, …)` (o `SeguirRuta` en la panorámica);
   - `camara.actualizar`, la gente y el tráfico, y por último `vistas.dibujar(g, W, H, E, dt)`.
3. **Piezas listas:**

   | Pieza | Qué es |
   |---|---|
   | `MC.Mision` | Pasos con tiempo y premio |
   | `MC.Inventario` | Con masa real |
   | `MC.Libro` y `MC.Dinero` | Plata en centavos, partida doble |
   | `MC.Mercado` y `MC.Finanzas` | Economía y finanzas |
   | `MC.Carrera` | Puntos de control por calles reales y rivales con física de curva |
   | `MC.Logros` y `MC.Dialogo` | Logros y diálogos |
   | `MC.Seres.Persona` | Energía, agua y pulso |
   | `MC.Seres.Animal` | Animales y criaturas |
   | `MC.Taller.disenar/registrar` | Vehículos con ingeniería real |
   | `MC.Poblacion` | Gente con rutinas |
   | `MC.Trafico` y `MC.Transporte` | Tráfico y transporte |
   | `MC.Interiores` | Interiores |
   | `MC.Musica` | Componer, tocar y adaptar |
   | `MC.UI` | Fichas, barras, botones, menú, diálogo y minimapa |
   | `MC.huevos` | Huevos de pascua |
   | `MC.Manejo` | Curvas de respuesta, giro según la velocidad, asistencias, 7 esquemas (tocar para ir, un pulgar, inclinar…) |
   | `MC.Hogar` y `MC.Direccion` | La casa del jugador desde su dirección real, y diseñarla |
   | `MC.Lugares` y `MC.Desgaste` | Talleres, tiendas, restaurantes, bibliotecas y parques; reparar y mejorar |
   | `MC.Historias`, `MC.Director` y `MC.Ocurrencias` | Storylets de diversión, reflexión y conciencia; ritmo; lo imprevisto |
   | `MC.Sprites` | Arte en atlas con respaldo procedural |
   | `MC.Cosmos` y `MC.Generador` | Planetas y mundos por semilla |
4. **La piel del juego:** `MC.arte.registrar('mi-juego', { personajeLado, vehiculoLado, suelo, via, … }).usar('mi-juego')`, y el tema de la interfaz con `MC.UI.crear(raiz, { tema })`.
5. **Tres pilares en cada juego:** diversión cada minuto, reflexión de vez en cuando y conciencia cuando sirve (`MC.Historias` los equilibra).
6. **Que no estorbe:** el centro de la pantalla es del juego. Comprueba `MC.UI.verificar(ui).length === 0` en vertical y horizontal.
7. **Prueba:** juega con Playwright (como `pruebas/prueba.mjs`). Revisa la consola sin errores y mide los ms por cuadro con la CPU 4× más lenta. Mira también `MC.Ocurrencias` (dónde se atasca el jugador).
