# Juega EnCicla 2.1.0 · la revolución con Motor City 4.5

**21‑nov‑2026 · Claude (Claude Code), a pedido del autor.** Para el autor y para la IA que siga con Juega EnCicla.

Pedidos del autor, en orden:
1. «Continúa el desarrollo; comprende toda la información nueva, el motor, las ideas y sugerencias, y ahora sí revoluciona el videojuego; desarróllalo a la perfección, mejóralo y púlelo. Solo EnCicla, y adapta el motor nuevo a lo que necesites.»
2. «Mejora los iconos y la información que se muestra en pantalla: a veces hay tantas cosas y tan grandes que tapan todo el juego. Además el tamaño solo tiene dos opciones, o grande o enorme.»
3. «Usa El Metro para terminar de adaptar las estaciones del metro, del metrocable, el tranvía, el tren, el Metroplús y las líneas alternativas, más las líneas de los alimentadores.»
4. «Retoma, continúa, actualiza y termina. Me entregas todo.»

**La decisión que se respetó:** el juego **sigue con su Motor del Valle** (`docs/INFORME-MOTOR-CITY-4.5.md` § 1). De Motor City 4.5 se tomó lo que sirve: se leyó y se portó (manera A) o se copió un módulo suelto (manera B, los rostros). El HTML sigue siendo uno solo, sin internet ni librerías: 5,2 MB (+0,2 MB).

## 1. Lo que cambió, archivo por archivo
| Qué | Dónde | De dónde viene |
|---|---|---|
| **Choque que desliza:** la normal de la pared se estima con 8 puntos; la bici se desliza a lo largo de ella; el primer golpe quita según impacto² y, pegada, solo un roce suave; el rumbo se alinea | `src/js/30-ride.js` (`Ride.mover`) | `motor-city/js/32-fisica.js` `_mover` |
| **Asistencia** que mira adelante (0,08 s) y corre el rumbo hacia el lado libre; recoge el acelerador ante la pared; interruptor 🛞 en Más y en la pausa; el bot, el paseo y la panorámica no la usan | `src/js/98q-manejo.js` | `_asistencia` |
| **Desatascar:** si empuja y no se aleja 2 px en 0,85 s, busca el hueco en anillos de 3 a 12 px y sale con un empujón | `98q-manejo.js` | `_despues`, `_desatascar` |
| **Qué se pisa:** bordillo con tumbo, polvo en pasto y tierra, gotas con lluvia, marca de la llanta al frenar fuerte, golpe sordo y roce | `98q-manejo.js`, `98p-efectos.js` | `VEH_SUELO_*`, `MC.Efectos` |
| **Giro amortiguado** (no zigzaguea a toda marcha) | `30-ride.js` | 4.5 |
| **Efectos para todo público:** polvo, chispas, pedazos, hojas, gotas, aros y marcas (sin explosiones; con «reducir movimiento», la mitad) | `98p-efectos.js` | `js/88-efectos.js` |
| **HUD según el contexto:** la acción del momento (con pulso), el timbre y «⋯ Más» con la bandeja; el consejo arriba a la izquierda | `98r-hud.js`, `60-ui.js` (`Game.barra`) | `MC.UI.verificar` (nada en el centro) |
| **Cuatro tamaños** (×0,8 · ×0,9 · ×1 · ×1,18) e **iconos vectoriales**; avisos compactos; lo que dice un personaje va a su tarjeta | `98y-tamano.js`, `style.css` (`--u`) | pedido 2 |
| **Lectura cenital:** halo, cono de luz que se corta en los edificios, farol de noche, estaciones que respiran, bici parqueada que late | `98s-lectura.js` | *Hunter Assassin* (solo la idea), *Shadow Tactics* |
| **Rostros** y una cara por persona (mentores, vecinos de la trama, gente de El Metro y de las fondas) | `98t-rostros.js` (el módulo del motor tal cual), `98u-caras.js` | `js/71-rostros.js` |
| **Árboles con lógica:** ninguno de avenida sobre canchas, pistas o piscinas (eran 70 de 23.404) | `75-graficos.js` | `js/29-arboleda.js` `sembrable` |
| **Registro de claves del guardado** (`Save.CLAVES`, `registrar`, `revisarClaves`) | `98v-claves.js` | rama `revolucion-v2` (82b242d), TAREAS 10 |
| **Ruta a Guatapé en bici** | `98w-guatape.js` | C‑E40; la carretera de `MC.Arcade` (OutRun) escrita otra vez |
| **La red completa de El Metro:** 15 alimentadores, líneas futuras, escaleras de la Comuna 13, datos de 91 estaciones | `tools/red_metro.js` → `src/data/red_metro.json` → `98x-red.js`; gancho en `78-ciudad-viva.js` (`MapView.extra`) | MetroZero `src/data/red.js` y `rutas_calles.js` |

## 2. Cifras medidas
- **Manejo contra la versión anterior** (misma prueba sobre `main`, `ab.js`): avance en 1 s contra una pared a 5°: 108 → 108 px; a 15°: 92 → 106; a 30°: 71 → 99; a 45°: 61 → 88; por una pared diagonal: 79 → 109. De frente: frena (5 % de la velocidad).
- **Ruta a Guatapé** (180 W, 85 kg, Crr 0,006, CdA 0,4 m²): plano 30 km/h; subida del 6 %: 11,3 km/h; bajada del 6 %: 55,4 km/h. El bot hace el tramo 1 con 3 estrellas, 2 paradas y 0 pitos.
- **Red de El Metro:** 15 alimentadores, 84 paraderos, 30 buses que andan; 3 líneas futuras; 91 estaciones con nombre y 58 datos.
- **Tamaños:** el botón de acción mide 48 px en Pequeño y 71 px en Grande; el minimapa, 66 → 97 px.

## 3. La Ruta a Guatapé: cómo se juega
- 3 tramos de 4 km (12 km en total): **El Peñol → Mirador** (mañana), **Mirador → La Piedra** (mediodía: más sed) y **La Piedra → Guatapé** (tarde, con más carros). En el menú (pestaña Escalafón) y en el Taller del modo libre (al volver sigues donde estabas).
- Arrastra el dedo: a los lados giras, arriba pedaleas más fuerte, abajo frenas. Sin tocar nada pedalea suave sola.
- El agua se gasta pedaleando, más en subida y al mediodía; en cada fonda (💧) se para con un botón y se aprende algo.
- Los carros deben dejar 1,5 m al adelantar (Ley 1811 de 2016): por la berma pasan; por la mitad del carril esperan, pitan y adelantan por el otro carril.
- Metas: llegar (★), parar en las 2 fondas, 2 pitos o menos. Logros: «Cicloturista del embalse» y «Lo poco conocido del embalse».

### Los datos de las fondas y sus fuentes
| Dato | Fuente |
|---|---|
| El pueblo viejo de El Peñol quedó bajo el agua; la inundación empezó en 1978; miles de personas se mudaron; hay una réplica en el pueblo nuevo; con sequía fuerte reaparecen restos | [El Colombiano](https://www.elcolombiano.com/antioquia/el-penol-antiguo-el-pueblo-que-desaparecio-por-una-hidroelectrica-FC25500588) |
| La Piedra: un solo bloque de granito de unos 200 m; más de 700 escalones (las fuentes dan 702 o 740) | [Wikipedia](https://en.wikipedia.org/wiki/El_Pe%C3%B1%C3%B3n_de_Guatap%C3%A9), [El Colombiano](https://www.elcolombiano.com/antioquia/hace-70-anos-luis-villegas-escalo-la-piedra-del-penol-por-primera-vez-BH25001110) |
| Primera subida conocida: julio de 1954, Luis Eduardo Villegas, Pedro Nel Ramírez y Ramón Díaz, cinco días, con palos en una grieta | [El Colombiano](https://www.elcolombiano.com/antioquia/hace-70-anos-luis-villegas-escalo-la-piedra-del-penol-por-primera-vez-BH25001110) |
| La G y la I: «lo que más se cuenta» (una sola fuente; el juego lo dice así, sin afirmarlo) | [Exoticca](https://www.exoticca.com/es/blog/piedra-del-penol/) |
| Guatapé, «pueblo de zócalos y colores»; al principio protegían la pared («se dice»); cada uno cuenta algo de la familia | [El País](https://www.elpais.com.co/turismo/cual-es-el-pueblo-mas-colorido-de-antioquia-sus-fachadas-son-una-joya-de-la-arquitectura-2608.html), [Wikipedia](https://en.wikipedia.org/wiki/Guatap%C3%A9) |
| 1,5 m al adelantar a un ciclista (Ley 1811 de 2016, art. 17) | [Función Pública](https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=259596) |

## 4. La red de El Metro en EnCicla
- Ya estaban, con el dibujo de El Metro (v1.7.1): metro A y B (viaducto y estaciones elevadas), tranvía T, los 6 metrocables (H, J, K, L, M, P) y el Metroplús 1, 2 y O con sus buses.
- **Llega ahora:** los **15 alimentadores** (C6‑001 a C6‑025 y C3‑001, 005 y 008) por sus calles, con paraderos (el código y el color de la ruta) y buses que paran 3 s y esperan si el ciclista va delante; el **Metro de la 80** «en obra» (vallas y conos en sus 17 estaciones, punteado en el mapa); el **Tren del Río** a Barbosa y el **Metrocable a San Antonio de Prado** «proyecto» (punteados); las escaleras eléctricas de la Comuna 13.
- **El dato de cada estación:** al detenerte junto a una estación, Don Libardo (jefe de estación) te cuenta su dato, una vez y como mucho uno cada 30 s.
- Para traer una versión nueva de los datos: `node tools/red_metro.js ../MetroZero` (las coordenadas: metros de El Metro × 1,6 = px de EnCicla; se comprobó con Niquía y La Estrella).

## 5. Pruebas
- `node tools/build.js` y `node tests/run.js`: todo en verde. Lo nuevo está en `tests/revolucion-encicla.js` (secciones V, V2 y V3) y la revisión de las claves del guardado, al final de `tests/run.js`.
- La prueba de los árboles dibuja de verdad los trozos donde caían y cuenta las copas encima de canchas, pistas o piscinas (0).
- Capturas revisadas en 412 × 860: modo libre (los cuatro tamaños, la bandeja, de día y de noche), la charla, Personajes, la ruta (los tres tramos, la parada, el malecón) y el mapa grande.

## 6. Lo que falta (en orden)
1. **Probar en un celular real** (autor): la sensación del manejo nuevo (números juntos en `30-ride.js` `mover` y `98q-manejo.js`), la ruta a Guatapé y los cuatro tamaños.
2. **Incoherencia de la historia:** los 9 mentores (`CAST`, `66-historia.js`) y los vecinos de la trama de Gemini (`contenido/guion/trama_valle.json`) tienen los mismos nombres con oficios distintos (Santi es anfitrión en uno y estudiante en otro). No se cambió la historia: decide el autor. La cara ya es la misma en los dos.
3. **Publicar** en `gh-pages` conservando `/metro/` y la APK (`versionCode` 20100): necesita el visto bueno del autor para subir a `main` y `gh-pages`.
4. La ruta: más tramos (Marinilla, el pueblo nuevo de El Peñol), subir la Piedra a pie (sus escalones) y la bici eléctrica.
5. Los alimentadores en la vista pixel (hoy sus buses salen en la ciudad 3D, como los del Metroplús).
