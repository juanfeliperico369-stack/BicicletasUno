# Terreno fértil: lo que el motor deja listo para *Motor City* y *Extremo*

**Lo que pidió el autor para después de los tres juegos:**
- ***Motor City***: un juego de carreras en mundo abierto, al estilo GTA, Forza Horizon y Need for Speed.
  - Ciudades, pueblos y lugares llenos de vida, con música electrónica de festival.
  - Trama ruda y cruda, con crimen y filosofía, pero simpática y con estilo EnCicla.
  - Carros de lujo y de colección, *underground* y tuneo, carreras callejeras, NASCAR y Fórmula 1.
  - Motos, aviones, bicis y los vehículos de Run Scooter.
  - Personaje y vehículos personalizables.
  - 3D con estilo 2D y pixel, vista cenital y cámaras cambiantes.
- ***Extremo***: deportes extremos (downhill, BMX, Tour, carreras callejeras en bici, skate, patinaje, snowboard, parkour, lanchas, surf…) con estética más realista.

## Lo que ya está sembrado en el motor 2.0
| Necesidad del juego | Ya existe | Dónde |
|---|---|---|
| Mundo abierto real | Una ciudad entera en un solo archivo: calles, edificios, relieve, puentes, transporte y vida | `MC.Mundo`, MC4 |
| Varias ciudades y pueblos | Una ventana y unas reglas de estilo por ciudad; la tubería lee cualquier ventana | `ciudades/*.json`, `geo/` |
| Vehículos de todo tipo | 35 en el registro: deportivo, fórmula, óvalo, drift, todoterreno, avioneta, avión, lancha, surf, BMX, montaña, ruta, jetpack… | `MC.Vehiculos` |
| Personaje personalizable | Aspecto único con su esqueleto de poses; cada juego lo viste | `MC.Personaje`, `MC.arte` |
| Cámaras y vistas cambiantes | Cenital, ciudad 3D, maqueta 2:1, panorámica, tercera y primera persona, dron, cine y pixel en todas | `MC.Vistas`, `MC.Camara` |
| Rutas de carrera | Rutas por calles reales (A\*), recorridos sin fin y cruces con opciones | `MC.Red`, `MC.Recorrido`, `MC.SeguirRuta` |
| Ciudad viva | Tráfico, semáforos, peatones, transporte con horario, clima y día y noche | `MC.Trafico`, `MC.Transporte`, `MC.Clima` |
| Corredor sin fin | Run Scooter dentro, sobre vías reales | `MC.Run` |
| Huevos y trama | Puntos de enganche por lugar, hora, vehículo y condición; eventos | `MC.huevos`, `MC.on/emit` |
| Modos de juego | Registro de módulos | `MC.modulos` |

## Ideas y sugerencias (de la IA del motor)
1. **Física de carro de verdad (2.3).** Hoy la física es de arcade simple. Para *Motor City* falta un modelo de bicicleta cinemática (dos ejes):
   - derrape por agarre lateral (curvas de Pacejka simplificadas);
   - transferencia de peso, frenada con ABS, turbo y nitro;
   - tuneo que cambie las cifras del registro: motor, llantas, suspensión y peso.

   El registro ya tiene `deriva: 1` para el drift.
2. **Pistas sobre la ciudad real:**
   - carreras callejeras que salen de `red.camino()` entre dos lugares, con puntos de control en los cruces reales;
   - NASCAR y F1 como circuitos cerrados dibujados sobre el relieve (un MC4 «pista»);
   - **la Avenida Las Palmas y la Vía al Túnel de Occidente** como clásicos de montaña.
3. **Festival estilo Forza Horizon en el valle:**
   - el **Festival de las Flores** (agosto) y los **Alumbrados** (diciembre) ya están en el calendario;
   - el escenario del festival en el Parque Norte o en Plaza Mayor;
   - música electrónica generada (como el audio sintetizado de Run Scooter) que cambia con la zona.
4. **Aire:**
   - avionetas desde el Olaya Herrera;
   - vuelos sobre el valle con el relieve real (la malla lejana ya cubre las montañas);
   - carreras de anillos sobre el río;
   - para combate tipo *1945 Air Force*, una vista cenital desplazable sobre el mapa real.
5. ***Extremo* sobre el relieve real:**
   - downhill por las laderas: los senderos (`VIA.SENDERO`) y las escalas (`VIA.ESCALAS`) ya están en el mapa, y la pendiente es real;
   - BMX y skate en los parques y canchas reales (`sitios.C`);
   - parkour por los techos (las huellas tienen altura);
   - surf y lanchas: hace falta una ciudad con mar, y el motor ya lo admite (`clase: 'agua'`).
6. **Estética más realista para *Extremo* (WebGL 2.x):** sombras, luz ambiental por zona, materiales por zona tomados de las reglas de estilo y vegetación por especie. El piso ya es la losa en alta resolución.
7. **Lanzamiento escalonado y mismas plataformas:** un solo HTML más un APK (como EnCicla y El Metro). El motor ya es un archivo de 240 KB y el mundo va aparte; varios mundos se cargan bajo demanda.
8. **La trama ruda pero simpática:** usa `MC.huevos` y los personajes ya creados de los otros juegos como cameos (Rosalba, don Efraín, Cata, los mentores de Run Scooter). Así los cuatro juegos son un solo universo.
