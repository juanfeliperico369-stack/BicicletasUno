# Lo que sigue: «Getaway Nueva York», la prueba en grande del motor

> **Actualización de alcance (20-nov-2026, posterior al pedido original):** el autor cambió explícitamente el concepto de **todo público** a **thriller criminal para adultos**. Esta página conserva el plan geográfico histórico, pero el contrato vigente de historia y arte es `docs/GETAWAY-MANHATTAN-BIBLIA.md`, y el juego de trabajo se llama provisionalmente **TURNO CERO: MANHATTAN**. No copiar un juego comercial ni representar como exacta una cuadrícula inventada. Se agregó un prototipo independiente en `juegos/getaway/prototipo.html`, que **no usa Manhattan MC4**.

> **Pedido del autor (20‑nov‑2026)**, para después de las mejoras de Gemini y ChatGPT:
> - craquear Nueva York, en especial Manhattan;
> - alrededor, llanuras, montañas, lagos, playas y todos los tipos de terreno, para exprimir el motor;
> - un juego como *Getaway*: persecuciones en carro con una trama breve de mafia, que funcione en grande;
> - todo en un mundo que se pueda ver redondo, con la atmósfera y el espacio.
>
> Este documento lo deja listo. **Nadie empieza el juego antes de cerrar los encargos 3.0** (`TAREAS-IA.md`).

## 1. El mundo
| Parte | Cómo | Quién |
|---|---|---|
| **Manhattan real** | `python3 geo/territorio.py --id nueva_york --bbox=-74.03,40.68,-73.90,40.88`, de Overture/OSM más el relieve SRTM. Se cuentan unos 45.000 edificios con su altura, la cuadrícula, Central Park, los muelles y los puentes de Brooklyn, Manhattan, Williamsburg y Queensboro. La atribución es ODbL. | Codex (C‑M30) |
| **El resto del mundo** | `MC.Generador` alrededor de la isla, a escala real. Hay llanuras con pueblos, montañas con nieve, lagos, playas con mar, desierto y bosque, con las carreteras que los unen. | Claude |
| **Carga por sectores** | El MC4 de Manhattan no puede ir entero en memoria en un celular. Hay que partirlo en sectores de 1 km que se cargan alrededor del jugador, con la niebla y el radio de vista de la 3.0, y guardar los cambios con `MC.GuardadoSectores`. | Claude, y Codex (C‑M22) |
| **Rascacielos que se ven a lo lejos** | Impostores (siluetas horneadas) para lo que está a más de 600 m, como el LOD de GTA San Andreas. En el borde, la niebla. | Codex (C‑M28) |
| **Mundo redondo, atmósfera y espacio** | Se hace en tres pasos:<ol><li>**Curvatura en el sombreador:** la altura baja con d²/2R, así que el horizonte se curva al subir.</li><li>**Vista de planeta:** al alejarse más allá del mapa, el mundo pasa a ser una esfera con la textura de `losasLejos`, con un halo de atmósfera (dispersión de Rayleigh simple) y estrellas.</li><li>**El espacio:** con `MC.Cosmos` (ya existe) pone el Sol y la Luna en su lugar y las estrellas de la hora.</li></ol> | Claude (C‑M31 para el sombreador de atmósfera, si Codex llega antes) |

## 2. Concepto histórico para todo público (SUPERADO por la versión adulta)
- **Trama breve, cinco capítulos:**
  - un conductor novato hereda el taxi de su tío y descubre que una familia de «la mafia» le debe al barrio;
  - escapes, rescates de mercancía robada (cuadros de un museo) y una última persecución por el puente de Brooklyn.
  - Sin sangre ni armas a la vista: los «golpes» son choques de carros y la policía persigue, como en Reckless Getaway.
- **Persecución:**
  - nivel de búsqueda de 1 a 5;
  - pilotos de `MC.IA` que cortan el paso;
  - casi choques que dan turbo;
  - daño del carro (`MC.Desgaste`);
  - rampas y destrucción ligera (`MC.Objetos`);
  - escondites (garajes) para perderlos.
  La cámara ya tiene `camara.persecucion`: se aleja, se inclina y se mece.
- **Cámaras:** la cámara de juego (cenital 3D, que se inclina al acercarse), la de detrás del carro y la maqueta para las repeticiones. El mapa grande sirve para planear la ruta.
- **Mapa:** las calles reales con su nombre, las avenidas con semáforos, el tráfico denso de Midtown y los taxis amarillos.

## 3. Lo que aprendió el motor del feedback del autor (reglas para TODAS las IA)
1. **Un solo mundo, varias cámaras.** Nunca se hace un contenido distinto para 2D y otro para 3D: el 2D es el respaldo del mismo mundo.
2. **Lo que se levanta es volumen:** árboles, casas, carros y gente. El suelo puede ser losa 2D, sin nada pintado encima que también exista en 3D.
3. **Fachadas con detalle:** zócalo, ventanas, puerta, balcones y techo, con detalle por distancia.
4. **Cámara:**
   - ni tan cerca ni tan lejos, con topes;
   - para ver todo, el mapa, no alejar el mundo vivo;
   - una cámara continua, no un menú de vistas.
5. **Jerarquía:** lo principal a la vista. Las demás vistas y los filtros de estilo van en un submenú.
6. **Periferia definida:** cada cámara carga solo su radio, con niebla en el borde, y la carga no se nota.
7. **Tutoriales opcionales:** un botón, nunca una ventana que salga sola.
8. **Fluidez antes que peso:** medir el tiempo real entre cuadros (lo que cuesta pintar no lo ve el reloj de JS) y bajar la densidad solo si sirve.
9. **Probar en un celular real con GPU**, no solo en el navegador de pruebas sin GPU.
10. **Física con peso:** el que choca empuja según su masa; nada atraviesa nada.

## 4. Orden de trabajo
1. Cerrar los encargos 3.0: G‑H14…G‑H17, C‑M26…C‑M29, C‑A13 y C‑A14.
2. Gemini: G‑H18 y G‑H19. ChatGPT: C‑A15. Codex: C‑M30. Claude: los sectores, el mundo de alrededor y el planeta.
3. Claude arma el juego «Getaway Nueva York» (`juegos/getaway/`), con sus pruebas y el público simulado (`node motor.mjs publico`).
4. Se prueba en grande con un celular medio y uno alto: la telemetría de Gemini y el público simulado.
