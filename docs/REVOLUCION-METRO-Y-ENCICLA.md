# La revolución de El Metro y de Juega EnCicla

**Fecha:** 18‑nov‑2026 · **Versiones:** El Metro **1.0.0** (antes 0.9.0) y Juega EnCicla **1.3.1** (antes 1.2.0) · **Para:** el autor y la IA que desarrolla *El Metro*.

Pedidos del autor:
1. Auditar *El Metro*, entenderlo y dar ideas.
2. Traer a EnCicla sus fragmentos, huevos de pascua y mejoras.
3. Aceptar el mapa más grande para EnCicla y mejorarlo todo.
4. Con todo lo aprendido, hacer la nueva revolución de *El Metro*, «absolutamente profesional».

## 1. Resumen
- **Los dos juegos comparten ahora una sola tubería de mapas** (`tools/geo/` de Juega EnCicla). Sale en casillas de 10 m para EnCicla y de 20 m para El Metro, con:
  - capas oficiales de Medellín: manzanas, malla vial con nomenclatura y ancho, jerarquía vial, espacio público, lotes y barrios;
  - barrios de Itagüí, Envigado y Sabaneta;
  - 693 mil huellas de edificios con su altura;
  - nombres de autopistas (del 17 % al 95 %);
  - el río de Caldas a Barbosa continuo y que baja;
  - Metroplús por sus avenidas.
- **El Metro 1.0.0:** cumple 9 de los 12 pasos de la hoja de ruta de su propia auditoría, medidos con su herramienta (tabla en §3). Suma las mejoras rápidas de esa auditoría y los domicilios por dirección.
- **EnCicla 1.3:**
  - pasa a un mapa de 10 m, donde una calle de barrio mide lo que mide de verdad, con la ciudad reconocible calle por calle;
  - trae de El Metro el Metroplús, la maqueta 2:1, los secretos de Gardel y Arví y las mejoras de su auditoría;
  - agrega las direcciones paisas.
- **Pruebas:**
  - El Metro: autotest con 0 errores, 100 partidas del bot sin fallas y 0 errores de consola.
  - EnCicla: todas sus pruebas, incluidas 54 partidas del bot, rendimiento con CPU 4× lenta y multijugador con 3 dispositivos.

## 2. Auditoría de El Metro v0.9.0 (lo que encontré)
**Qué es:** un HTML de 2,7 MB con 33 módulos (~5.100 líneas). Simula el sistema Metro completo sobre el valle real:
- Ciudad Libre (mundo abierto con peatones, tráfico, oficios por radio y transporte que se puede abordar);
- conducción de metro y tranvía (panorámica y cabina con procedimiento real), bus y Metroplús por calles reales, y Metrocable;
- La Red con la Maqueta 2:1, historia en la ciudad, álbum y multijugador local.

**Fortalezas:**
- Unidad del mundo en **metros** (`TM = VM.tile`): el motor no depende del tamaño de la casilla.
- Datos con fuentes citadas: 31 líneas, 160 estaciones, trivias y la capa oficial de ciudad.
- Seguridad cuidada: CSP, guardado saneado y mensajes de red validados.
- Pruebas automáticas serias (autotest, 100 partidas y recorrido de interfaz) y una herramienta que mide el mapa (`tools/auditoria-mapa.mjs`).

**Debilidades que encontré:**
1. **El mapa base era el de EnCicla de hace semanas.** Lo corregía un parche (`ciudad.js`) que no arreglaba lo de fondo: estaciones sin huella, río cortado, tranvía sobre casas y barrios solo en cuatro municipios.
2. **Rendimiento:** caché de hasta ~80 MB, tirón al arrancar y una panorámica pesada (su propia auditoría).
3. **Detalles de juego:** «¡Bien hecho!» con 0 estrellas, botones sin nombre e invitaciones sin tope.
4. **Mantenimiento:** líneas de hasta 1.183 caracteres, difíciles de revisar.

**Huevos de pascua y fragmentos que tomé para EnCicla:**
- Gardel en Manrique.
- Arví al final del cable L.
- Metroplús y los colores oficiales de los cables.
- La Maqueta 2:1.
- Ideas de su auditoría: direcciones paisas, memoria, región `aria-live` y tope de invitaciones.

Ya estaban de antes: el cumpleaños del Metro, Rosalba y su primer tren, y «Ni una gota».

## 3. Lo que se hizo en El Metro 1.0.0
| # | Paso de su hoja de ruta | Antes | Ahora |
|---|---|---|---|
| M1 | Estaciones con huella | 0 de 49; 2 sobre casas | **49 de 49; 0 sobre casas** |
| M2 | Río continuo | 69 cortes | **0** |
| M3 | Río que baja | 37 subidas; hasta 27 m | **13; hasta 7 m** |
| M4 | Tranvía por su calle | 24 % sobre casas | **0 %** (y metro A y B 0 %) |
| M5 | Patio‑taller de Bello | no estaba | **530 casillas** |
| M6 | Escaleras sueltas | 332 | **4** |
| M7 | Quebradas a su tamaño | casilla entera de agua | **hilo de ~5 px en su retiro verde** |
| M8 | Calles con nombre fuera de Medellín | 4–18 % | **23–80 %** (Medellín 63 → 74 %) |
| M9 | Barrios fuera de Medellín | Bello 1 %, otros 0 % | **Bello 63, Caldas 78, La Estrella 83, Girardota 98, Barbosa 98** (aproximados) |
| M10–M12 | Anchos, relieve 30 m, alturas | — | anchos y alturas parciales; relieve pendiente |

**Mejoras de juego en El Metro:**
- **Memoria y arranque:** luces de noche solo cuando hacen falta, caché según la memoria del equipo y trozos con presupuesto de 8 ms por cuadro, mostrando el plano general mientras se arman.
- **Alturas:** los edificios toman los pisos reales de su zona.
- **Resultado coherente:** «Llegaste», con un consejo, cuando hay 0 estrellas.
- **Accesibilidad:** botones con nombre, de 44 px y con letra de 12 px, y avisos anunciados (`aria-live`).
- **Seguridad:** tope de 64 KB al leer invitaciones.
- **Domicilios por dirección:** «Calle X con Carrera Y» sin marca el primer minuto.

Detalle completo en su repositorio: `docs/auditorias/2026-11-18-revolucion-1.0.md`.

## 4. Lo que se hizo en Juega EnCicla 1.3
- **Mapa de 10 m** (4.316 × 4.921 casillas), con las capas oficiales y las huellas de edificios.
  - Laureles se reconoce con sus circulares, el centro con su retícula y Santo Domingo con su ladera.
  - La carga sigue en ~1,6 s gracias a la búsqueda de estaciones en espiral con memoria de conectividad.
- **Calles con su ancho real,** separadores en las avenidas anchas, casas divididas según los lotes catastrales, alturas reales, estaciones del metro de ~130 m y Metroplús con sus estaciones.
- **Estaciones EnCicla a 16 m de su coordenada** (mediana; antes 46 m), todas alcanzables en bici y en camión.
- **Direcciones paisas:**
  - la calle por la que vas siempre a la vista (nombre popular y nomenclatura);
  - la misión «¿Dónde queda?»;
  - 4 logros nuevos.
- **Maqueta 2:1** en el mapa grande: el valle en 3D isométrico.

## 5. Ideas y sugerencias
**Para El Metro (siguiente versión):**
1. **Mapa de 10 m en su motor.**
   - Los datos ya están listos (`TILE=10`), y su motor trabaja en metros.
   - Antes hay que dibujar los trozos con nivel de detalle: 8 px por casilla al alejar, o en un Web Worker con `OffscreenCanvas`. Si no, a 10 m hacen falta 4 veces más trozos para la misma vista.
2. **Relieve de 30 m** (Copernicus GLO‑30), quemando el río igual que ahora: cierra M3 y M11.
3. **Alturas por edificio:** pisos del catastro de Medellín por huella (M12).
4. **«Mis números»:** intentos, abandonos y estrellas por nivel, para balancear con datos reales.
5. **Placas de lo poco conocido:** unos 30 datos curiosos con fuente, cada uno con una postal.
6. **Partir las líneas de más de 600 caracteres** al tocar cada archivo y sacar la clave de firma de la APK del repositorio antes de publicar en una tienda.

**Para EnCicla (la próxima revolución, v2.0):**
1. **La red EnCicla oficial:** las estaciones con su número, sus anclajes, su tipo y sus horarios reales (pendiente que el autor consiga la lista).
2. **Viajes de punta a punta con el Metro:** dejar la bici en una estación EnCicla junto al metro, viajar y seguir en otra (los dos juegos ya comparten mapa y líneas).
3. **Física contra las manzanas reales** también en el modo pixel, y tráfico por todas las calles con su sentido.
4. **Temporadas y eventos reales:** Feria de las Flores, Alumbrados y ciclovías de domingo, sobre el mapa de 10 m.
5. **Publicación en Play Store** con firma de publicación y paquete AAB (decisión pendiente del autor).

## 6. Para la IA que sigue con El Metro
- **Lee primero** `docs/BITACORA.md` (estado 1.0.0) y `docs/auditorias/2026-11-18-revolucion-1.0.md`.
- **El mapa base no se edita a mano.** Sale de Juega EnCicla (`TILE=20 OUT=… python3 tools/geo/build.py`) y luego se corren `tools/mapa_valle.py`, `tools/ciudad_datos.py` (con `ENCICLA_MAPA`) y `tools/rutas.mjs`.
- **Regla aprendida:**
  - El parche de `ciudad.js` convierte en casa todo andén que caiga en una manzana.
  - Todo lo que se estampe en el mapa base (estaciones, corredores, patio) debe ir en la lista de protegidos de `ciudad_datos.py`.
- **Cada cambio del mapa se mide** con `node tools/auditoria-mapa.mjs` y se compara con la tabla de §3. El juego se prueba con `node tools/test.mjs 100`.

## Enlaces
- **Juega EnCicla:** https://juanfeliperico369-stack.github.io/BicicletasUno/ (APK en `/descargas/`).
- **El Metro 1.0.0:**
  - publicado en https://juanfeliperico369-stack.github.io/BicicletasUno/metro/ (APK en `/metro/el-metro.apk`);
  - el código está en el paquete `el-metro-1.0.0.bundle`, que se aplica en MetroZero con `git pull el-metro-1.0.0.bundle revolucion`.

*Datos del mapa: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps Foundation, con huellas de edificios de Overture (OSM, Microsoft y Google). Fuente: Portal de Datos Abiertos, Subsecretaría de Catastro del Municipio de Medellín; barrios de Itagüí, Envigado y Sabaneta. Relieve: Terrain Tiles (AWS Open Data, SRTM/NASA).*
