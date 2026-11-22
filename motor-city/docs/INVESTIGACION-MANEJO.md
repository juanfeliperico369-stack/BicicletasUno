# Manejo, controles y movimiento · investigación y lo que se hizo (Motor City 4.5 y 4.6)

## 0. 4.6 · El modelo de Juega EnCicla reemplaza al de la 4.5
> **El autor (21‑nov‑2026), después de probar la 4.5:** «injugables, demasiado toscos; la sensibilidad sufre de lo que sufrió GTA IV; por nada derrapa, va lento, avanza lento, retoma lento… te basaste en El Metro: deja de basarte en él, arréglalo de paso, y básate en EnCicla, que es fluido y va al ritmo del tiempo real».

**Por qué se sentía pesado (lo que se encontró):**
1. Los carros de Turno Cero usaban un modelo de llantas (fuerzas, potencia y agarre) con el paso de tiempo topado en 50 ms: a pocos cuadros por segundo, el juego entero iba en cámara lenta.
2. Arranque y giro lentos por diseño: el acelerador tardaba en entrar y el giro lo limitaba la aceleración lateral (a 70 km/h el radio pasaba de 50 m).
3. El deslizamiento de la 4.5: las llantas siempre «se quedaban atrás» de la trompa, aun sin freno de mano.
4. La cámara miraba muy adelante (hasta 1,1·v) y seguía despacio.

**El modelo de EnCicla (`BicicletasUno/src/js/30-ride.js`), ahora en el motor (`js/32-fisica.js` · `_arcade`); El Metro lo tiene desde su 3.1.0 «Fluido», hecha por su propia sesión:**
| Pieza | Fórmula |
|---|---|
| Giro | `w ← w + (clamp(6,5·Δ, ±wm) − w)·(1 − e^(−dt/tw))`, con `wm = w1 + (w0 − w1)·(1 − v/vmáx)`; en los de motor, casi nada quieto (`×min(1, 0,3 + v/4)`). |
| Velocidad objetivo | `tv = vmáx·empuje·(0,3 + 0,7·max(0, cos Δ))`: se frena solo para dar la curva. |
| Aceleración y frenado | `min(acc, (tv − v)·2)` y `min(brk, (v − tv)·3,5 + 6)`; sin pedir nada, `coast + v·arrastre`. |
| Agarre | El rumbo de las llantas sigue a la trompa a 40/s (no hay derrape); con freno de mano y más de 7 m/s, a 3/s (derrape) con 60 % más de giro; en nieve o pasto mojado, 6/s. |
| Esquinas | Si el paso está bloqueado prueba ±0,35, ±0,7 y ±1,1 rad (primero hacia donde ya gira) antes de deslizar por un eje o golpear. |
| Reversa | Con el joystick hacia atrás y casi quieto, reversa a 8 m/s como mucho. |
| Reloj | Subpasos de 25 ms (hasta 8): a 15 cuadros por segundo se recorre lo mismo que a 60. Búsqueda, persecución y objetos, igual. |
| Cámara | Adelanto `0,45·v` con tope de 1/6 de la vista y resortes más firmes. |

**Números por tipo** (`Vehiculos.ARCADE`): `acc = max(accMín, accK·vmáx)`, `brk = max(brkMín, brkK·vmáx)`, `coast = coastK·vmáx`.
| Tipo | accK | brkK | coastK | arrastre | w0 | w1 | tw | accMín | brkMín |
|---|---|---|---|---|---|---|---|---|---|
| a pie | 3,5 | 6,5 | 4 | 0,35 | 7,5 | 6 | 0,05 | 6 | 10 |
| bici y ruedas | 0,5 | 1,2 | 0,67 | 0,35 | 5 | 2,7 | 0,09 | 2,5 | 6 |
| moto | 0,42 | 0,9 | 0,18 | 0,12 | 4,2 | 2,3 | 0,08 | 7 | 14 |
| carro | 0,34 | 0,85 | 0,14 | 0,1 | 3,4 | 1,75 | 0,11 | 7,5 | 18 |
| pesado | 0,32 | 0,9 | 0,3 | 0,1 | 2,4 | 1,2 | 0,2 | 3,5 | 10 |

**Medido** (`node pruebas/prueba.mjs` § 26): carro de 0 al 90 % en 2,7 s; radio de 4,8 m a 20 m/s sin derrapar; con freno de mano derrapa y se endereza en 0,1 s al soltar; a 15 y a 60 cuadros por segundo recorre lo mismo (17,1 y 17,2 m). Una versión de prueba en El Metro (retirada para no pisar la 3.1.0 de su sesión) daba con estos números: taxi de 0 al 90 % en 2,7 s (antes más de 10) y giro de 16 m a 72 km/h.

**4.6.1 · ⏫ Acelerador fijo** (pedido del autor: «si se suelta el joystick se deja de acelerar; quiero un botón que acelere sin parar y que para detenerse simplemente se desactive»): `MC.Manejo.aplicar(…, { acelFijo: true })` pone el empuje a fondo y deja al joystick solo la dirección; sin joystick, `acel = 1` y el vehículo sigue derecho. Al apagarlo, `acel = −1` con `frenoK = 0,55` (de 90 km/h para en unos 2 s) hasta que se toque el joystick o se detenga. Prueba § 27.

El modelo de llantas de la 4.5 (`ManejoCarro`, `js/36-taller.js`) no se borró: queda para quien elija `MC.opciones.manejo = 'simulacion'`. Lo que sigue de este documento (§ 1 a 5) es la investigación y el trabajo de la 4.5: los choques que deslizan, desatascar, las cosas que se rompen, los efectos y el sigilo siguen igual.


> **Pedido del autor (21‑nov‑2026):** «pulir y mejorar muy bien el manejo y los controles, que ahí yace toda la jugabilidad: balancear bien, que no se quede estancado en algo ni se choque con facilidad por exceso de sensibilidad, que se sienta fluido; investigar cómo los mejores juegos de carreras y de vehículos tratan la conducción y el movimiento de los personajes». También: «que los vehículos puedan subir por algunas cosas, no todo debe ser bloqueos», «animaciones de explosiones, choques, derrapes y cosas rotas», y «la forma cenital de Hunter Assassin es perfecta: aprende de ella y adáptala».

## 1. Lo que dicen las fuentes
| Fuente | Qué se toma |
|---|---|
| Matthew Harris (Criterion Games), *Vehicle Feel Masterclass: Balancing Arcade Accessibility with Simulation Depth*, GDC 2018 ([GDC Vault](https://gdcvault.com/play/1025383/Vehicle-Feel-Masterclass-Balancing-Arcade)) | La sensación del vehículo es un equilibrio deliberado entre lo accesible (arcade) y la profundidad (simulación). |
| *Implementing racing games: an intro to different approaches and their game design trade-offs* ([Game Developer](https://gamedeveloper.com/design/implementing-racing-games-an-intro-to-different-approaches-and-their-game-design-trade-offs)) | Casi todos los juegos de carreras limitan el ángulo máximo de las ruedas según la velocidad. *Rocket League* (Psyonix) usa una sola caja de choque por carro: el choque preciso se sentía más azaroso. |
| Tesis de Chalmers sobre guías de asistencia al conductor en juegos de carreras ([PDF](https://odr.chalmers.se/bitstream/20.500.12380/300507/1/CSE%2019-64%20Orell%20Uddeborg.pdf)) | Las asistencias se diseñan, se prueban con jugadores y se dejan apagar. |
| Comentario de un desarrollador independiente sobre las paredes ([itch.io](https://itch.io/post/2615900)) | El riesgo contrario: si deslizar contra la pared rinde más que tomar bien la curva, el juego premia lo que no debe. |
| *Hunter Assassin 2* (Ruby Game Studio), descripción oficial ([GamePix](https://www.gamepix.com/play/hunter-assassin-2)) | Vista desde arriba y control por toques; «usa el entorno y las sombras para no quedar en la luz de las linternas». |
| *Shadow Tactics* (Mimimi), diseño de la detección ([Game Developer](https://gamedeveloper.com/design/game-design-deep-dive-dynamic-detection-in-i-shadow-tactics-i-)) | El cono de visión es información: se muestra claro, y se corta donde la vista se corta. |

No se encontró un análisis serio del arte de *Hunter Assassin*. Lo de ese juego que se adapta aquí es solo la idea de lectura (arriba, cerca, linternas y sombras); no su arte ni sus niveles.

## 2. Lo que se hizo en el motor (`js/32-fisica.js`, `js/36-taller.js`, `js/32-rotos.js`, `js/88-efectos.js`)
| Problema | Antes | Ahora (4.5) |
|---|---|---|
| **Choques que traban** | Los dos modelos de carro chocaban «por ejes»: si el paso estaba bloqueado, probaban solo X o solo Y. En una pared diagonal (casi todas en Medellín) se quedaban pegados, y el modelo de bicicleta de Turno Cero frenaba en seco y rebotaba (`vx *= -.2`). | `_mover`: la normal de la pared se estima tanteando 8 puntos alrededor del choque; el carro **desliza a lo largo** de la pared, pierde velocidad según **impacto²** (rasante: casi nada; de frente: casi toda) y la trompa **se alinea** con la pared, como en los arcade. |
| **Estancado** | Si empujaba contra algo, se quedaba ahí. | `_despues`: si empuja y no avanza durante 0,85 s, busca el hueco libre más cercano hacia donde se quiere ir (anillos de 0,8 a 3,2 m) y sale con un empujón suave. Si quedó metido en algo, sale derecho. |
| **Se estrella con facilidad** | Nada lo evitaba. | `_asistencia`: mira adelante (3 a 12 m, según la velocidad) cada 0,08 s; si viene pared y el jugador no está girando fuerte, corrige hacia el lado libre que más se parece a lo que pide y no deja ir a fondo hacia ella. Se apaga en ⏸ Menú → 🛞 Asistencia de manejo. |
| **Sensibilidad** (reemplazado en 4.6 por el giro de EnCicla, § 0) | El joystick que apunta en el mundo pedía el giro con un control proporcional sin amortiguar: a alta velocidad zigzagueaba. | Giro amortiguado con la velocidad de giro; el acelerador se recoge en las curvas cerradas (`1,15 − 0,55·|Δ|`) para poder darlas. Siguen la zona muerta, la curva exponencial y el giro según la velocidad de `MC.Manejo`. |
| **Derrape** (en 4.6, el agarre de EnCicla, § 0) | Solo en piso suelto. | Freno de mano: con velocidad y girando, el rumbo de las llantas se queda atrás de la trompa (agarre 1,6 en vez de 16), gira un 45 % más y pierde algo de velocidad; avisa `derrape` para las marcas y el humo. Quieto o derecho, el mismo botón frena. |
| **Todo es pared** | El carro no entraba al ladrillo del borde de la calle, ni a arena, nieve o roca; las rocas pequeñas lo paraban. | Puede, despacio y con lógica: andén 0,45, ladrillo 0,45, pasto 0,32, arena 0,28, nieve 0,3, roca suelta 0,22. La moto, además, sube y baja **escalas** (0,3). El todoterreno anda por casi todo. Las rocas pequeñas se pasan con un tumbo. Edificios, escalas (en carro), agua honda y barrancos siguen siendo límites. |
| **Cosas que se rompen** | Una caneca frenaba un carro en seco. | `MC.Rotos`: caneca, cono, valla, banca, hidrante, paradero, poste y arbusto se tumban si el carro va lo bastante rápido (de 1 m/s un cono a 8,5 m/s un poste; el camión con menos); el carro pierde según la masa. A pie y en bici no se rompe nada; la moto solo tumba lo liviano. |
| **Bordillo** | Nada. | Al pasar de la calzada al andén o a un patio: un tumbo (`tumbo`) para la cámara y el evento `bordillo`. |
| **Efectos** | Polvo y una onomatopeya. | `MC.Efectos`: chispas en abanico desde el punto del golpe, vidrio, pedazos de lata, marcas de llanta (se borran a los 40 s), humo, fuego, explosión (destello, bola de fuego, onda, pedazos, humo negro que sale después, mancha quemada), restos de lo roto (el poste tendido, la caneca regada, el hidrante con su chorro). |

## 3. En Turno Cero
- Freno de mano para derrapar; el carro destrozado **arde y estalla** (hay que bajarse); las patrullas y camionetas destrozadas **estallan**.
- **Sigilo a pie con la forma de Hunter Assassin:** linternas amarillas que se cortan en los muros, naranja si buscan, rojas si te vieron, «?» y «!»; la cámara pasa sola a 🗺️ cenital y se acerca en las misiones de sigilo, y vuelve a la tuya al salir (⏸ Menú → 🔦 Sigilo desde arriba).
- Rostros detallados en los diálogos y los subtítulos (`MC.Rostro`), y cara con ojos, cejas, orejas y labios en los modelos 3D.
- HUD con una rejilla de 8 px y el área segura del celular.

## 4. Cómo se prueba
`node pruebas/prueba.mjs` § 25: rasante desliza y conserva velocidad, de frente frena, se desatasca si quedó metido en un edificio, tumba la caneca y sigue, y no hay árboles en 400 canchas de Medellín.

## 5. Lo que falta (y quién)
- **Probarlo con las manos en un celular** (autor): la sensación se ajusta jugando. Los números a tocar están juntos: el agarre (16, 1,6), la pérdida por impacto (0,9·impacto²), la mirada de la asistencia (0,45 s) y el recogido del acelerador (0,55).
- Los carros de la IA siguen con su propio desatascador (`MC.Manejo.pilotar`).
