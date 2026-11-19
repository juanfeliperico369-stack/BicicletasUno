# Guía de Motor City: cómo funciona, cómo se usa y qué se hizo

> **Para el autor y para cualquier IA o persona que llegue.** Está escrita para leerse de corrido.
> Lo técnico al detalle está en `MOTOR.md` (el contrato) y el estado y las trampas en `CONTEXTO-IA.md`.

## 1. Qué es, en una frase
**Motor City es un motor de videojuegos de mundo abierto, en JavaScript puro, que convierte cualquier territorio real (o uno inventado) en un mundo jugable con leyes reales.** Encima de ese mundo, cada juego pone su piel, su trama y sus mecánicas.

Las leyes reales son de física, química, biología, clima, economía, tráfico y transporte.

Funciona en **un solo archivo HTML, sin internet ni librerías**: en el celular, en el computador, como app (APK) o en una página web.

## 2. Cómo está hecho (las capas)
```
        ┌───────────────────────── JUEGOS ─────────────────────────┐
        │ Juega EnCicla · El Metro · Run Scooter · Mandados · Motor City · Extremo │  ← su piel, su trama, sus modos
        └──────────────────────────────────────────────────────────────┘
   PIEZAS DE JUEGO   misiones · inventario · carreras · logros · diálogos · interfaz (MC.UI) · música (MC.Musica)
   MUNDO VIVO        reloj y calendario · cielo · clima global y estaciones · tráfico y semáforos · transporte con
                     horario · población con rutinas (IA) · animales · huevos de pascua
   SERES Y MÁQUINAS  personaje único (pose) · biología (persona, genética, animales, criaturas) · vehículos
                     (registro + taller de ingeniería) · física del cuerpo y del carro · controles · cámara
   VISTAS            cenital · ciudad 3D · maqueta 2:1 · panorámica de perfil · 3.ª y 1.ª persona · dron · cine
                     · pixel en todas · interiores · minimapa · calidad automática
   MUNDO (MC4)       suelo · relieve · divisiones · niveles · vías · edificios · sitios · pasos · transporte ·
                     lugares · tráfico  ←  craqueado de datos abiertos  o  generado por semilla
   CIENCIA           unidades SI · geometría · ruido · integradores · estadística · física · termodinámica ·
                     química · economía y finanzas
```
**Cada capa solo usa las de abajo.** Por eso un juego nuevo arranca con todo lo de abajo ya hecho.

## 3. El mundo: real o inventado, en un solo archivo
- **El formato MC4** es una cabecera más capas comprimidas que se abren cuando se piden:
  - el **suelo** por casilla (pasto, monte, calle, ciclorruta, agua, arena, nieve, roca…);
  - el **relieve**;
  - el municipio, la comuna y el barrio;
  - el **nivel firmado** de puentes, viaducto y deprimidos;
  - las **vías** con nombre;
  - las **edificaciones**, con su huella, pisos y uso;
  - los **sitios y emblemáticos**;
  - el **transporte** y los **lugares**.
- **Craquear un territorio real:** `geo/territorio.py`.
  - Le das un rectángulo de longitud y latitud. Baja de **Overture Maps** (OpenStreetMap, más las huellas de edificios de Microsoft y Google) las calles, el agua, los usos del suelo, los edificios y los lugares, y de **SRTM** el relieve.
  - Arma el mundo en segundos. **Guatapé** (4,8 × 3,6 km, 2.661 edificios, el embalse y el Peñol) salió en unos 20 s y pesa 0,19 MB.
- **Medellín** (43 × 49 km, 639.457 edificios, metro, cables y Metroplús) salió de juntar lo que ya tenían EnCicla y El Metro (`herramientas/fusionar.mjs`). Pesa 6 MB.
- **Inventar un mundo:** `MC.Generador.mundo({ semilla, tipo })`. Sus pasos:
  1. relieve con ruido y una forma: isla, valle, costa, montaña o llanura;
  2. ríos que bajan por la pendiente;
  3. biomas por temperatura y humedad;
  4. pueblos en lo plano junto al agua, con cuadrícula, plaza, iglesia y casas;
  5. carreteras con A\* que evitan las pendientes, con puentes;
  6. nombres, un mirador y un cable al cerro más alto.

  **La misma semilla da el mismo mundo.**
- **Las reglas de estilo** de cada lugar (colores de muros y techos, plancha, tanques, árboles, densidad, pisos, clima y horarios) están en `ciudades/<id>.json`, y salen de **mirar el lugar desde arriba**.

## 4. Las vistas: el mismo mapa en todas las dimensiones gráficas
- **Las losas:** pedazos de 160 m del mapa que se pintan una vez, con el suelo suave, el sombreado del relieve, las calles con su ancho real, el agua, las canchas, los árboles y los techos. Las usan todas las vistas. Por eso **se siente el mismo mapa** en cenital, en 3D o en la maqueta. También son el piso de la 3D.
- **Las vistas 2D** (cenital, ciudad 3D y maqueta 2:1) son una sola proyección con tres ajustes: giro, inclinación y altura.
- **La panorámica de perfil** es la vista con «cuidado especial»:
  - cielo con el sol y la luna reales;
  - montañas en capas con barrios que se encienden de noche;
  - la fila real de edificios;
  - emblemáticos en silueta;
  - viaducto y trenes reales;
  - cruces con su nombre;
  - tráfico y gente de perfil.
- **La 3D en WebGL** (tercera y primera persona, dron y cine) lleva el relieve real, los edificios levantados, la luz del sol por hora y niebla por clima. Si el aparato no tiene WebGL, cae a la ciudad 3D en Canvas.
- **Pixel:** cualquier vista dibujada pequeña y agrandada sin suavizado. Una tecla y todo es pixel art.
- **Interiores:** cualquier edificio se abre por dentro, con un plano según su uso (la casa paisa con su patio, el apartamento, el local, la oficina, la iglesia, el colegio, la bodega), puertas que conectan todo, ventanas y muebles con medidas reales.
- **Calidad automática:** mide cuánto tarda cada cuadro y sube o baja el detalle. Con la CPU 4× más lenta las vistas 2D quedan entre 4 y 18 ms.

## 5. Los seres y las máquinas (con ciencia de verdad)
- **Personaje único:** un esqueleto con poses (quieto, caminar, correr, pedalear, impulsarse, patinar, ir en tabla, sentado, saltar). Cada juego lo viste a su manera y se ve igual en todas las vistas.
- **Persona con biología:**

  | Aspecto | Cómo se calcula |
  |---|---|
  | Proporciones | Antropometría según la edad |
  | Paso y carrera | Número de Froude |
  | Metabolismo | Mifflin‑St Jeor |
  | Gasto | METs por actividad |
  | Pulso | Tanaka |
  | Potencia al pedalear | W/kg según el estado físico |
  | Estado del cuerpo | Energía, hidratación y temperatura según el clima |

  Su **genética mendeliana** (piel poligénica, ojos, pelo, rizo, estatura) le da hijos con los genes de los padres.
- **Animales con alometría real:** metabolismo (Kleiber), velocidad máxima (Hirt 2017), pulso, longevidad y marcha (paso, trote o galope). Hay especies del valle: perro criollo, gallinazo, colibrí, iguana, zarigüeya, ardilla…
- **Criaturas inventadas:** patas, segmentos, alas y ojos, con una prueba de **verosimilitud** por la ley cuadrado‑cubo con la gravedad del planeta.
- **Vehículos:**
  - un registro con 35 (bicis, patinetes, motos, carros, avionetas, lanchas, metro, cable…);
  - un **taller de ingeniería**: con masa, potencia, aerodinámica, llantas y combustible calcula la velocidad máxima, el 0–100, la frenada, el consumo, la autonomía, el CO₂, la velocidad de pérdida de un avión y la velocidad de casco de una lancha;
  - el carro se maneja con un **modelo de bicicleta de dos ejes**: derrapa cuando las llantas se rinden y la lluvia o la nieve le quitan agarre.

## 6. El mundo vivo
| Sistema | Qué hace |
|---|---|
| **Reloj y calendario** | Festivos de Colombia (Ley Emiliani) y fiestas de la ciudad. |
| **Cielo** | Colores por hora; sol y luna astronómicos. |
| **Clima global** | Para cualquier latitud y altura: estaciones por hemisferio, lluvia, tormenta eléctrica, granizo, **nieve que se acumula y se derrite**, **niebla cuando el aire llega al punto de rocío**, **olas de calor**, viento, índice de calor y sensación térmica. Es **el mismo para todos a la misma hora**. |
| **Tráfico** | Carros, taxis amarillos, motos, busetas y ciclistas con semáforos reales. |
| **Transporte** | Metro, tranvía, cables y Metroplús con **horario real** (deterministas). |
| **Población con rutinas** (IA de utilidad) | Cada persona tiene casa y trabajo en edificios reales y necesidades (energía, hambre, ganas de salir). Madruga, va a trabajar por las calles, almuerza, sale a la plaza y vuelve a casa. Lo lejano se simula «en grueso». |
| **IA** | Utilidad, árboles de comportamiento, dirección (buscar, huir, llegar, deambular, separarse) y **pilotos con física**, que frenan antes de cada curva a la velocidad segura √(μg/κ). |

## 7. Economía, mecánicas, interfaz y música
- **Economía exacta:**
  - dinero en centavos (enteros) y **libro de partida doble**: siempre cuadra y nadie crea plata de la nada;
  - mercados con oferta y demanda (equilibrio y ajuste en el tiempo), interés, inflación, préstamos, VPN y TIR;
  - salarios con recargo nocturno.
- **Mecánicas listas:** misiones con pasos, tiempo y premio; inventario con masa real (lo que cargas te frena); carreras por calles reales con rivales; logros; diálogos.
- **Interfaz integrada** (`MC.UI`):
  - temas por juego (Motor City, EnCicla, El Metro, Run Scooter);
  - fichas, barras, botones grandes y accesibles;
  - menús, diálogos, avisos, panel de misión y minimapa.
- **Música procedural** (`MC.Musica`), sin un solo archivo de audio:
  - estilos: electrónica, techno, synthwave, rock, jazz, lo‑fi y clásica;
  - **siete clásicos de dominio público** reharmonizados en cada estilo: Beethoven, Petzold/Bach, Pachelbel, Satie, Grieg y Vivaldi;
  - se **adapta** a la velocidad, la hora, el clima y la tensión del juego.

## 8. Cómo lo usas tú (el autor)
- **Para jugar y mostrar:** abre `dist/juegos/mandados.html` (el minijuego) o `dist/motor-city.html` (Medellín completo). También están en la web: ver el README.
- **Para pedir un juego nuevo a una IA:** dile que lea `AGENTS.md` y corra `node motor.mjs nuevo juego nombre`. Con las skills y la plantilla, en minutos tiene un juego andando sobre el mundo que elija.
- **Para tener un lugar nuevo:**
  1. Dale a una IA (o corre tú) `python3 geo/territorio.py --id mi-pueblo --bbox=…` con el rectángulo de longitud y latitud. Se sacan de cualquier mapa.
  2. Cambia `"mundo"` en `juego.json` y vuelve a construir.
- **Para inventar mundos:** `MC.Generador.mundo({ semilla, tipo })` dentro del juego. En Mandados es el botón «Mundo nuevo».

## 9. Qué se hizo para crearlo (resumen honesto)
1. **Revisión de los tres juegos:** se compilaron, se probaron y se jugaron. De ahí se tomó lo mejor de cada uno:
   - de EnCicla, sus datos a 10 m, los sitios y la panorámica de plataformas;
   - de El Metro, todas las huellas, los puentes, los rieles, la vista lateral y el WebGL;
   - de Run Scooter, el corredor completo.
2. **2.0:**
   - el mundo en un solo archivo y las redes de calles;
   - el tiempo, el clima, el transporte y el tráfico;
   - el personaje, los vehículos, la física, los controles y la cámara;
   - 8 vistas más pixel, la panorámica y la 3D;
   - Run en la ciclovía, el banco de pruebas y 54 pruebas;
   - la sincronización a los juegos.
3. **2.1:**
   - nombre: solo «Motor City»;
   - nuevos módulos: ciencia (física, química con balanceo exacto, termodinámica), economía, generador de mundos, craqueo de territorios, clima global con estaciones y nieve, biología (personas, genética, animales y criaturas), taller de vehículos con manejo de carro, IA y población con rutinas, interiores, música, interfaz y mecánicas;
   - el **minijuego Mandados**;
   - las herramientas para hacer juegos y módulos con plantillas;
   - los reportes de cambios, las skills del proyecto y 80 pruebas.

## 10. Lo que no es (todavía)
- La 3D es «low‑poly» (cajas y prismas), no realista. Para *Extremo* hacen falta sombras, materiales y animación de personaje más fina (ver `docs/SIGUIENTES-PASOS.md`).
- El craqueo de territorios deja la ciudad muy bien de calles, edificios y agua, pero **sin transporte ni emblemáticos modelados**. Eso se agrega a mano o con más fuentes (GTFS, modelos de los edificios famosos).
- La música es de sintetizador (chiptune elegante, no orquesta). Se puede mejorar con instrumentos muestreados si se acepta que el HTML pese más.

## 11. Lo nuevo de la 2.2
- **GPU virtual:** el motor mide el aparato, baja la resolución antes que los cuadros y, si no hay WebGL o es lento, dibuja la 3D por software (`MC.Raster`).
- **Vista lateral:** la ciudad de lado, como una casa de muñecas, que gira de a 90° como FEZ. Lo que tapa al jugador se vuelve transparente.
- **Puentes y niveles bien resueltos:** superficies, rampas, pasar por debajo y tiempo de coyote. **Cámara con resortes** que no atraviesa edificios.
- **Mi casa:** tu dirección real → tu casa en el juego, que diseñas con muebles reales (sin internet; la dirección no sale del celular).
- **Lugares jugables:** talleres, tiendas, restaurantes, centros comerciales, bibliotecas y parques. **Historias** con diversión, reflexión y conciencia, y un **director de ritmo**.
- **Ocurrencias:** lo imprevisto se corrige solo y se anota. **Cosmos:** planetas con leyes reales.
- **Manejo** con curvas y asistencias, **sprites**, **escala real** e **interfaz** que no tapa el centro.
- **Más documentos:** el manual (`docs/MANUAL.md`), la investigación (`docs/INVESTIGACION.md`), la optimización (`docs/OPTIMIZACION.md`) y el plan de cada IA (`docs/PLAN-IAS.md`).
