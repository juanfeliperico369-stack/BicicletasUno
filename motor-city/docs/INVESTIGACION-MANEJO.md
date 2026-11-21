# Manejo, controles y movimiento · investigación y lo que se hizo (Motor City 4.5)

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
| **Sensibilidad** | El joystick que apunta en el mundo pedía el giro con un control proporcional sin amortiguar: a alta velocidad zigzagueaba. | Giro amortiguado con la velocidad de giro; el acelerador se recoge en las curvas cerradas (`1,15 − 0,55·|Δ|`) para poder darlas. Siguen la zona muerta, la curva exponencial y el giro según la velocidad de `MC.Manejo`. |
| **Derrape** | Solo en piso suelto. | Freno de mano: con velocidad y girando, el rumbo de las llantas se queda atrás de la trompa (agarre 1,6 en vez de 16), gira un 45 % más y pierde algo de velocidad; avisa `derrape` para las marcas y el humo. Quieto o derecho, el mismo botón frena. |
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
