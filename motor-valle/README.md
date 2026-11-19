# Motor City · el motor de mundo abierto del Valle

**Un solo motor de videojuego para un mundo abierto real.** Hoy es Medellín y el Valle de Aburrá; mañana, cualquier ciudad.

- Lo comparten **Juega EnCicla**, **El Metro** y los juegos que vienen: Motor City (carreras) y Extremo (deportes extremos).
- Lo usa **Run Scooter** dentro de los otros juegos: el modo «Run en la ciclovía».

| | |
|---|---|
| Versión | **2.0.0** (Motor del Valle 2.0) · `VERSION.json` |
| Contrato | [`MOTOR.md`](MOTOR.md): reglas, formato del mundo, API, vistas, Run y reglas del mundo |
| Para una IA que retome | [`CONTEXTO-IA.md`](CONTEXTO-IA.md) |
| Bitácora | [`BITACORA.md`](BITACORA.md) |
| Banco de pruebas jugable | `dist/motor-city.html`: un solo archivo que funciona sin internet y se abre en cualquier navegador |

## Qué trae
- **El mundo 2.0 en un solo archivo** (`datos/medellin/mundo.mc4`, 6 MB). Junta lo mejor de los dos juegos:
  - las 639.457 casas y edificios reales;
  - 35.746 calles con nombre;
  - 123 km de ciclorrutas;
  - los sitios y emblemáticos modelados;
  - 2.193 puentes, deprimidos y viaducto con su nivel;
  - el relieve real;
  - barrios, comunas y municipios;
  - 31 líneas de transporte con su eje real y las 133 estaciones EnCicla.
- **Un personaje y 35 vehículos:** a pie, bicis, patinetes, skate, patines, motos, carros, el camión de Balance, avionetas, lanchas, metro y cable.
- **Todas las vistas:**
  - cenital y ciudad 3D;
  - maqueta 2:1;
  - **panorámica de perfil**;
  - tercera y primera persona, dron y cine (WebGL);
  - **pixel** en cualquiera de ellas.
- **Las mismas reglas del mundo:**
  - reloj y festivos de Colombia;
  - cielo con el sol y la luna reales;
  - clima por temporadas;
  - tráfico con semáforos;
  - metro, tranvía, cables y Metroplús con su horario real.
- **Run en la ciclovía:** el corredor de Run Scooter sobre la ciclorruta real, con sus curvas, sus lomas y sus esquinas.

## Probarlo
1. Abre `dist/motor-city.html`.
2. Muévete con el dedo o con las flechas.

| Tecla | Qué hace |
|---|---|
| **V** o **1–8** | Vista |
| **P** | Pixel |
| **B** | Vehículo |
| **H** | Hora |
| **C** | Clima |
| **Y** | Personaje |
| **G** o 📍 | Ir a un lugar |
| **R** | Run (solo en la ciclovía) |
| **Q / E** | Doblar en el próximo cruce, en la panorámica |

## Trabajar en el motor
```bash
node motor.mjs mundo          # (F1) junta los datos de ../BicicletasUno y ../MetroZero en datos/medellin/mundo.mc4
node motor.mjs run            # importa Run Scooter de ../RunRunZero con sus parches
node motor.mjs construir      # dist/motor.js, dist/mundo-medellin.js y dist/motor-city.html
node motor.mjs prueba --navegador   # 54 pruebas: datos, redes, tiempo, transporte, tráfico, física, vistas, Run y rendimiento
node motor.mjs sincronizar ../BicicletasUno   # copia el motor a motor-valle/ del juego (con --verificar solo compara)
```

## Estructura
| Carpeta o archivo | Qué hay |
|---|---|
| `js/` | El motor: los fragmentos numerados `00-` a `50-` → `dist/motor.js`. Además `valle.js`, el lector 1.x de compatibilidad. |
| `run/` | Run Scooter importado (generado) y su origen. |
| `ciudades/` | Las reglas de cada ciudad: ventana, zonas de estilo, horarios y clima. |
| `datos/<ciudad>/` | El mundo MC4 y su resumen. |
| `geo/` | La tubería de datos abiertos: Overture/OSM, capas oficiales y SRTM. |
| `herramientas/` | `fusionar`, `construir`, `importar-run` y `sincronizar`. |
| `sandbox/` | El banco de pruebas: un ejemplo completo de un juego sobre el motor. |
| `pruebas/` | Las pruebas del motor. |
| `docs/` | Migración de cada juego, receta para otras ciudades, la visión de los juegos que vienen y las peticiones de arte y auditoría (Gemini y ChatGPT). |

## Atribución
- © colaboradores de OpenStreetMap (ODbL), vía Overture Maps Foundation.
- Huellas de edificios de Overture (OSM, Microsoft ML Buildings y Google Open Buildings).
- Capas oficiales de Medellín: Subsecretaría de Catastro, malla vial y barrios (GeoMedellín), y barrios de Itagüí, Envigado y Sabaneta.
- Relieve SRTM (NASA), vía AWS Terrain Tiles.
- Run Scooter, Juega EnCicla y El Metro son del mismo autor (OneZero).
