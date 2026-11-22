# Todos los pedidos del autor y dónde quedaron

> **Para qué sirve:** responder «¿ya está todo lo que pedí en el repositorio?».
>
> Cada pedido aparece con su estado y con el archivo donde vive. Se actualiza en cada sesión.
>
> **Estados:**
> - ✅ está en el repositorio y tiene prueba;
> - 🟡 está hecho, pero falta algo que no depende del código (un celular real, otra IA);
> - ⏳ todavía no está, y se dice a quién le toca.

Versión **3.0.0** en `main`; **3.0.1 propuesta en la PR #5** · 20‑nov‑2026 · **138 pruebas en verde en Chromium para el commit f976776** ([ejecución](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44750220010)).

## Resumen
- **Hechos:** 76 pedidos ✅.
- **Hechos, pero falta algo de afuera:** 5 🟡. Los 10 reels que piden iniciar sesión los describe Gemini. La documentación decía que el motor estaba copiado en EnCicla y El Metro, pero la auditoría de las ramas `main` no encontró `motor-city/` en sus raíces (ver `docs/AUDITORIA-ECOSISTEMA-2026-11-20.md`). Y falta probar en un celular real.
- **Pendientes:** 6 ⏳:
  - los juegos *Motor City* (carreras) y *Extremo*;
  - bajar la maqueta de 40 ms en cualquier máquina;
  - el test de WebRTC de EnCicla, que le toca a su IA;
  - el arte y el código de ChatGPT (C‑A y C‑M);
  - las tareas fáciles de Gemini (G‑H1…G‑H6);
  - la licencia.

  Ninguno es un olvido. Cada uno está en el plan (§9 y §12 del documento único).

## 1. El motor y el repositorio (2.0–2.1)
| Pedido | Estado | Dónde |
|---|---|---|
| Un solo motor para todos los juegos, según el plan del mundo abierto | ✅ | `js/` → `dist/motor.js` · `docs/VISION-MOTOR-CITY.md` |
| Repositorio nuevo y llamarlo solo «Motor City» | ✅ | `juanfeliperico369-stack/motorcity` |
| Craquear territorios reales (país, ciudad, pueblo o lugar) | ✅ | `geo/territorio.py` · Guatapé en `datos/guatape` · skill `motor-city-territorio` |
| Crear mundos nuevos | ✅ | `js/12-generador.js` (isla, valle, costa, montaña, llanura) |
| Física fiel a la realidad | ✅ | `js/02-ciencia.js` (`MC.Fis`), `js/32-fisica.js` |
| Química fiel | ✅ | `js/02-ciencia.js` (`MC.Quim`, balanceo exacto) |
| Economía fiel | ✅ | `js/03-economia.js` (partida doble, mercado, finanzas) |
| Matemáticas | ✅ | `js/02-ciencia.js` (ruido, integradores, unidades SI) |
| Biología y personajes | ✅ | `js/35-seres.js`, `js/30-personaje.js` |
| Vehículos | ✅ | `js/31-vehiculos.js` (35), `js/36-taller.js` |
| Animales y alienígenas | ✅ | `js/35-seres.js`, `js/13-cosmos.js` |
| Interfaces | ✅ | `js/70-interfaz.js` |
| Música | ✅ | `js/60-musica.js` (procedural y clásicos de dominio público) |
| Mundo vivo | ✅ | `js/20-tiempo.js`, `21-trafico`, `22-transporte`, `24-ambiente`, `25-ia` |
| Interiores procedurales únicos | ✅ | `js/48-interiores.js` |
| Skills para las IAs | ✅ | `.claude/skills/` (desarrollo, territorio, juegos, ciencia, arte) |
| Usos y cómo venderlo | ✅ | `docs/NEGOCIO-Y-USOS.md` |
| Plan para Gemini y para GPT | ✅ | `docs/DOCUMENTO-UNICO.md` §9 y §10 |
| Contexto para las IAs de cada juego | ✅ | `CONTEXTO-IA.md`, `AGENTS.md`, `CLAUDE.md` y `docs/CONTEXTO-MOTOR-CITY.md` en cada juego |
| Repositorio abierto a las IAs, con reportes | ✅ | `reportes/`, `CONTRIBUIR.md`, `node motor.mjs reporte` |
| Minijuego en un HTML y su link | ✅ | `juegos/mandados` → [mandados.html](https://juanfeliperico369-stack.github.io/motorcity/dist/juegos/mandados.html) |
| Que EnCicla y El Metro usen el motor | 🟡 | El motor ya está copiado en `motor-city/` de cada juego, y la guía paso a paso está en `docs/MIGRACION-*.md`. **Falta:** la migración, que la hace la IA de cada juego (§9.3 y §9.4). |
| Run Scooter dentro de los juegos | ✅ | `js/50-run.js` («Run en la ciclovía») |
| Los juegos *Motor City* (carreras) y *Extremo* | ⏳ | Son juegos futuros. Las piezas ya existen (`MC.Carrera`, física y tráfico). **Le toca:** a Claude, que lo tiene en su plan (§9.7). |

## 2. Gráficos, controles y lugares (2.2)
| Pedido | Estado | Dónde |
|---|---|---|
| Solución a la tarjeta gráfica («crea una si es posible») | ✅ | `js/05-gpu.js` (nivel y resolución dinámica), `js/44-raster.js` (3D por software) |
| Física de puentes | ✅ | `js/32-fisica.js` (superficies y niveles), `js/red-niveles.mjs` |
| Mejor cámara | ✅ | `js/34-camara.js` (resortes y sacudida) |
| Vista lateral (FEZ, Little Nightmares, Monument Valley) | ✅ | `js/41-vista2d.js` (lateral), `js/42-vehiculos-lado.js` · `docs/INVESTIGACION.md` |
| Sprites | ✅ | `js/38-sprites.js` (atlas, 8 direcciones, 9‑slice, fondo magenta) |
| Psicología de la interfaz | ✅ | `js/70-interfaz.js` (zonas, atenuación, un aviso a la vez, `MC.UI.verificar`) |
| Los mejores motores, estudiados | ✅ | `docs/INVESTIGACION.md` |
| Historia con diversión, reflexión y conciencia | ✅ | `js/85-historias.js` (`MC.Historias` y director de ritmo) |
| Ocurrencias (lo imprevisto) | ✅ | `js/85-historias.js` (`MC.Ocurrencias`) |
| Manual de uso | ✅ | `docs/MANUAL.md` |
| Optimización | ✅ | `docs/OPTIMIZACION.md` |
| Tipos de controles | ✅ | `js/33-controles.js`, `js/37-manejo.js` (7 esquemas) |
| Información en pantalla que no estorbe | ✅ | `js/70-interfaz.js` |
| La casa del jugador desde su dirección, con diseño de interiores | ✅ | `js/49-hogar.js` (`MC.Direccion` y `MC.Hogar`). La dirección no sale del celular. |
| Más lugares: talleres, compras, restaurantes… | ✅ | `js/82-lugares.js`, `js/36-taller.js` |
| Historias procedurales | ✅ | `js/85-historias.js` |
| Generación como No Man's Sky | ✅ | `js/13-cosmos.js` (estrellas, planetas y relieve infinito) |
| Tamaños proporcionados | ✅ | `js/04-escala.js` (`MC.Escala.validar`) |

## 3. La ciudad (2.3)
| Pedido | Estado | Dónde |
|---|---|---|
| Cómo hacen SimCity y Cities: Skylines las ciudades | ✅ | `js/26-urbe.js` (zonas, demanda RCI, valor del suelo, servicios, presupuesto, capas de datos) |
| Sombras | ✅ | `js/39-sombras.js` (sol según la hora, en todas las vistas) |
| Detalles de ciudad | ✅ | `js/27-mobiliario.js` (postes, árboles, bancas, paraderos, cebras) |
| Los Sims | ✅ | `js/86-necesidades.js` (objetos inteligentes y necesidades) |
| Townscaper | ✅ | `js/14-ondas.js` (WFC, autotile, rejilla irregular) |
| Ambiente sonoro | ✅ | `js/61-sonido.js` (`MC.Paisaje`) |
| Un solo documento con todo: contexto, código a usar y plan de cada IA | ✅ | `docs/DOCUMENTO-UNICO.md` → `dist/MOTOR-CITY-TODO.md` |

## 4. Terreno y agua (2.4–2.5)
| Pedido | Estado | Dónde |
|---|---|---|
| Montañas, rocas y tipos de terreno | ✅ | `js/15-terreno.js`, `js/28-naturaleza.js` |
| Agua en lagos, ríos, playa y mar | ✅ | `js/15-terreno.js`, `js/12-generador.js` (lagos), `js/40-dibujo.js` (color por profundidad) |
| Límites verosímiles («el personaje pasa por encima de cosas») | ✅ | `MC.Terreno.paso` y los obstáculos en `js/32-fisica.js` |
| Poder entrar al agua | ✅ | `js/32-fisica.js` (bajarse, nadar, bucear con aire, montar, lancha) |

## 5. El minijuego jugable (2.5.1, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «No hay controles de verdad, no se puede mover nada» | ✅ | El problema no era el movimiento: la cámara estaba muy lejos y el joystick no se veía. Ahora hay **joystick visible** (`ui.joystick`), **botones de acción** (`ui.accion`), **cámara cerca** (unos 45 m en el lado corto), **marca del jugador**, **flecha al objetivo** (`MC.UI.indicador`) y **tutorial**. En computador funcionan las flechas y WASD. |
| «No está completamente liberado porque hay que pagar» | ✅ | **Modo libre**, prendido por defecto: los 34 vehículos (bici, moto, carro, bus, avión, lancha…), la casa, los lugares y la ciudad son gratis. Se apaga en ⚙️ Ajustes. |
| «Mejóralo con lo nuevo» | ✅ | Agua (al agua, bucear, lancha), terreno, sombras, ciudad (modo alcalde), mi casa, lugares, historias y paisaje sonoro. El primer mandado empieza cerca. |
| Que no se rompa otra vez | ✅ | Prueba nueva en `pruebas/prueba.mjs`: un celular táctil abre el juego, arrastra el joystick y se mueve. |
| La entrega de Gemini, integrada | ✅ | `arte/gemini/` (10 atlas, íconos, hitos, paletas), `js/87-pieles.js` (`MC.Pieles`) y el selector 🎨 Arte en Mandados. La revisión está en `arte/gemini/LEEME.md`: se usan árboles, props, rocas, fachadas y muebles; el personaje, los vehículos y los animales quedan procedurales hasta que vengan a escala. |
| La auditoría de Codex (`docs/AUDITORIA-MOTOR-CITY-2026-11-19.md`), atendida | ✅ | Las pruebas usan el Chromium del sistema si Playwright no trae el suyo, o el que diga `MC_CHROMIUM`. El arte de Gemini ya se revisó en las vistas. Lo que no es del motor quedó con su dueño (abajo). |
| La auditoría de Gemini, corregida | ✅ | Leyenda en las capas de datos; etiquetas de los cuartos en la esquina; ventanas encendidas en las casas bajas; la maqueta sin el corte de tierra; barras con fondo. Además, un comentario que desde la 2.2 anulaba dos líneas de la interfaz. |

## 6. Realismo y reparto de tareas (2.6, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «Desde la cenital los árboles se ven como tapetes en el suelo» | ✅ | `js/29-arboleda.js`: de pie en la maqueta, la oblicua y la lateral, con volumen desde arriba y sombra según el sol. |
| «Más realismo, rudeza y crudeza, pero *family friendly*» | ✅ | `MC.Rudeza` en `js/40-dibujo.js` (asfalto, andenes, pasto, techos y grano), muros con la base sucia y `MC.estilo` (realista o clásico). |
| «Los tutoriales deben ser opcionales» | ✅ | Mandados: «❓ Cómo se juega (opcional)» en la portada y en ⚙️ Ajustes; ya no se abre solo. |
| «Copia todos tus pedidos en los repositorios» | ✅ | `TAREAS-IA.md` en motorcity, BicicletasUno, MetroZero y RunRunZero, y `AGENTS.md`, `CLAUDE.md` y `GEMINI.md` apuntando ahí. |
| «Gemini (Antigravity) pasa a *hydrogen*: lo fácil» | ✅ | G‑H1…G‑H6 en `TAREAS-IA.md`, con `node motor.mjs capturas` y `revisar-arte` para que sean comprobables. |
| «ChatGPT (Codex) sigue con *astra*: mejores pedidos; mejores imágenes» | ✅ | Arte C‑A1…C‑A7 y código C‑M13, C‑M16 y C‑M17 (más los C‑M de antes) en `TAREAS-IA.md` y §10.2. |

## 7. Estilos, peso y vida, y motores potentes (2.7, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| «Peso y vida en el motor» | ✅ | `js/88-vida.js` (`MC.Vida`): aterrizaje con aplastamiento, sacudida y polvo; hitstop; cabeceo del vehículo; bandadas; hojas; salpicaduras; viento en las copas. |
| «Que se pueda adaptar a motores más potentes» | ✅ | `js/89-exportar.js` (`MC.Exportar`, `MC.Puente`), `node motor.mjs exportar` y `docs/MOTORES-POTENTES.md`. El GLB pasa el validador de Khronos y three.js lo dibuja. |
| «Estéticas de cómic, manga, anime y novela gráfica» | ✅ | `js/16-estilos.js`: cómic, manga, anime, novela gráfica, ukiyo-e y acuarela, más realista y clásico. |
| «Investiga y aprende de las mejores obras visuales» | ✅ | `docs/INSPIRACION-VISUAL.md`, con fuentes. |
| «Recopila y adapta arte de verdad» | ✅ | Paletas de 10 obras de dominio público en `arte/dominio-publico/` (sin copiar arte con derechos). |
| Las referencias (14 reels) | 🟡 | Se leyeron 4; los otros 10 piden iniciar sesión. Los describe Gemini (G‑H7). |

## 8. La entrega maestra de referencias (2.8, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Sumar la entrega maestra (25 fichas, peso, vida y arquitectura) | ✅ | `docs/referencias/MOTOR-CITY-ENTREGA-MAESTRA.md`, el resumen ficha por ficha en `docs/INSPIRACION-VISUAL.md` §1 y anexo E4 del documento único |
| «Prepara todo»: lo que se pudo hacer ya en el motor | ✅ | Palomas que huyen, huellas, faros, luces de freno, vintage, CRT, térmico, accesibilidad, telemetría, calidad y contratos (`js/88-vida.js`, `js/90-telemetria.js`, `js/91-contratos.js`, `schemas/`) |
| «Prepara todo»: lo demás, repartido | ✅ | `TAREAS-IA.md`: C‑M20, C‑M21, C‑M22, C‑A10, C‑A11, G‑H7 y G‑H9 |

## 9. La entrega de Gemini (G‑H1…G‑H8) y sus hallazgos (2.8)
| Pedido | Estado | Dónde |
|---|---|---|
| Tareas fáciles de Gemini | ✅ | `reportes/2026-11-20-gemini-*.md`, `arte/referencias/`, `contenido/datos-gemini.json`, `arte/gemini/iconos-ui.json`, `arte/dominio-publico/candidatas.md` y `docs/INSPIRACION-VISUAL.md` §1.1 |
| Corregir lo que vio Gemini en las capturas | ✅ | Zona libre con margen para los botones (80 %); avisos con clave (la vista nunca queda desfasada); ventanas en las casas de un piso; cubiertas sobre columnas; cebras sin cruzarse; botón «Comprar» y burbuja dentro de la casa; sombra de las copas más pequeña |
| Paletas de las obras colombianas | 🟡 | 12 de 16 en `arte/dominio-publico/paletas.json` (`col_*`): Comisión Corográfica, Torres Méndez, Garay, Acevedo Bernal y el *Papel Periódico Ilustrado*. Wikimedia frenó las otras 4; se completan en la próxima sesión. |

## 10. La entrega de ChatGPT y Codex (2.7.1), unida en la 2.9
| Pedido | Estado | Dónde |
|---|---|---|
| Arte a escala de ChatGPT (C‑A1…C‑A9) | ✅ | `arte/chatgpt/` (6 atlas, 676 cuadros) y `arte/chatgpt/guias/`; en Mandados: Vista → Arte → ChatGPT |
| Código de Codex (C‑M1, C‑M13, C‑M15…C‑M19) | ✅ | La auditoría y sus arreglos; caché de fachadas (maqueta a 22 ms); agua en el MC4; `textura` y charcos; adaptadores de Godot y three.js; 1 bit (`ENTREGA-CHATGPT-MOTOR-CITY-2.6.md`) |
| Maqueta por debajo de 20 ms (C‑M13) | 🟡 | Va en 22 ms con la CPU 4×. Los estilos cómic (28 ms) y 1 bit (37 ms) de Codex cuestan más porque procesan toda la pantalla. |

## 11. Lo que falta, y a quién le toca
| Qué | Estado | A quién le toca |
|---|---|---|
| Probar en un **celular real** de gama media | 🟡 | Al autor. Anota el modelo y lo que se siente lento o confuso. |
| Lo que sigue de ChatGPT y Codex (C‑A10, C‑A11, C‑M2…C‑M12, C‑M14, C‑M20…C‑M22) | ⏳ | A ChatGPT y Codex («astra»): `TAREAS-IA.md`. |
| Revisión visual, revisor de arte, referencias y datos (G‑H1…G‑H6) | ⏳ | A Gemini («hydrogen»): `TAREAS-IA.md`. |
| Licencia del motor | ⏳ | Al autor (`docs/NEGOCIO-Y-USOS.md`). |
| Maqueta por debajo de 40 ms en cualquier máquina (Codex midió 44,7 ms en la suya; aquí da 27–29 ms) | ⏳ | A Claude: caché por región y fachadas horneadas (§9.7). |
| El test de WebRTC de EnCicla (ventana fija de 900 ms) | ⏳ | A la IA de EnCicla (lo señalaron Gemini y Codex). |

## 12. «Retoma, une todo, mejora y optimiza todo; añade las skills y plugins de los videos y sigue desarrollando» (2.10, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Revisar los repositorios ya actualizados y **unir todo** | Hecho | <ul><li>El Metro: Motor del Valle 1.2.0 desde EnCicla.</li><li>`plan-unico-el-metro` ya estaba dentro de la v2.0.0, así que no se fusionó: habría devuelto 14 archivos a su estado anterior.</li><li>EnCicla: de `revolucion-v2` (2.0.1) se trajo el **alto contraste** y el **metro sin casas debajo** (`src/js/96-accesible.js`, con 2 pruebas). El registro de claves del guardado queda para su IA.</li></ul> |
| **Optimizar todo** | Hecho | <ul><li>El cómic y el 1 bit sin leer la pantalla (`Estilo._imprimirGPU`), a media resolución en pantallas densas.</li><li>Cuadro real en la cenital: el cómic pasó de 25,5 a 20,8 ms y el 1 bit de 25,1 a 17,9 ms. En la maqueta: el cómic pasó de 42,9 a 30,9 ms y el 1 bit de 42,4 a 27,7 ms.</li><li>Atlas más livianos: Mandados pasó de 8,2 a 5,1 MB y se ve igual (`herramientas/aligerar_arte.py`).</li></ul> |
| **Mejorar todo** | Hecho | <ul><li>El 1 bit ya no hace muaré en la maqueta.</li><li>`rutaA` sale por el extremo de la calle que conviene: mediana de 1,29× la línea recta, y a veces mucho más corta. Arregla también «tocar para ir».</li><li>Modern Web Guidance sobre el motor, con respaldo para celulares viejos.</li></ul> |
| **Skills y plugins de los videos** | Hecho | <ul><li>`skills-externas.json`, `node motor.mjs skills`, `.claude/settings.json` en los 4 repositorios y la skill `motor-city-skills-externas`.</li><li>El detalle de los 11 enlaces está en `docs/INSPIRACION-VISUAL.md` §1.2.</li></ul> |
| **Seguir desarrollando** | Hecho | **`MC.Publico`**, el público simulado (idea de MiroFish), con `node motor.mjs publico` y su prueba. |
| **Nuevas peticiones para Gemini y ChatGPT** | Hecho | <ul><li>Gemini: G‑H10 a G‑H13.</li><li>ChatGPT y Codex: C‑M23 (red vial), C‑M24 (ayuda para niños), C‑M25 (portada con Hallmark) y C‑A12 (tráiler con HyperFrames).</li><li>Todo en `TAREAS-IA.md`.</li></ul> |

## 13. «Sigue básico: mundo único híbrido, cámara de #DRIVE y Reckless Getaway, tope de zoom, radio de vista, fachadas y artilugios físicos» (3.0, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Revisar si Gemini y ChatGPT publicaron algo | Hecho | No subieron nada nuevo después de la 2.9.1. |
| Investigar las cámaras de referencia y GTA San Andreas | Hecho | `docs/INVESTIGACION-CAMARA.md` |
| Que la cenital, la maqueta y la 3D sean el mismo mundo | Hecho | Cámaras aéreas sobre el mundo 3D (`js/45-gl3d.js`, perfiles de `MC.Camara`), con respaldo 2D sin GPU. |
| Lo que estaba en 2D y debía ser 3D | Hecho | Árboles low-poly, que son los mismos de la 2D; el suelo 3D sin árboles ni techos pintados; carros y personas con volumen. |
| Moverse en 3 dimensiones y artilugios físicos | Hecho (base) | El cuerpo ya tenía altura, saltos y buceo. Ahora están `MC.Objetos` (conos, balones, canecas, cajas y vallas). Rampas y destrucción quedan para Codex (C‑M29). |
| Ni tan cerca ni tan lejos, con tope; mejorar el ángulo | Hecho | Zoom de 2,6 a 22 px por metro; la cámara se inclina según el zoom; cámara continua hasta la vista detrás del jugador. |
| Un mapa en vez de alejar todo | Hecho | El mapa grande, al tocar el minimapa. |
| Radio de vista y carga que no se note | Hecho | Radio y niebla por cámara; las regiones se cargan por cercanía. |
| Fachadas | Hecho | Zócalo, ventanas, puerta, balcones, cornisa, alero, pretil y tanque. |
| Jerarquía de estilos y vistas | Hecho | Una cámara de juego y «Más vistas y filtros». |
| Fluidez | Hecho | 2.11: la densidad dinámica y la capa de suelo. |
| Pedidos nuevos para Gemini y ChatGPT | Hecho | G‑H14 a G‑H17, y C‑M26 a C‑M29, C‑A13 y C‑A14, en `TAREAS-IA.md`. |


## 14. «Empieza con el monstruo, nada de *family friendly*; todo en un planeta, con caminos largos en medio de la nada»; y luego «adapta todo lo nuevo» (4.0, esta sesión)
| Pedido | Estado |
|---|---|
| El juego grande y adulto | ✅ *Turno Cero* (`juegos/getaway/`), con el canon de Codex. Ver `docs/TURNO-CERO.md`. |
| Guatapé, la mejor versión de Medellín y el Valle, y Nueva York en un solo planeta | ✅ `MC.Planeta`: anillo de 3 ciudades y 3 carreteras, con globo y horizonte curvo |
| Caminos largos en medio de la nada para llegar a cada ciudad | ✅ 16, 12 y 15 km generados, con biomas, paradas, letrero de km y viaje ×3 |
| Los modos, vehículos y transporte de Medellín, adaptados | ✅ Metro, cables, tranvía y Metroplús (subirse y perder a la policía), EnCicla, lancha del embalse y robo de carros |
| Lo nuevo de Codex: espionaje 2026, artefactos y GLB | ✅ Artefactos T01, T02, T03, T05, T06, T08, T09, T11 y T04 en el juego; los 42 GLB en la cámara 3D (`MC.Modelos`) |
| Lo nuevo de Codex: acción a pie, esqueletos y texturas | ⏳ C‑M32, C‑M33 y C‑A16 (`TAREAS-IA.md` § 4.0) |
| Medir en un celular real | ⏳ G‑H20 y G‑H24 |

## 20-nov-2026 · Entrega ChatGPT (rama de integración)
- **C-M29 / G-H17 · Parcial funcional:** 30 objetos con parámetros de juego, guardado por sector original e IDs estables; restauración en Mandados.
- **Pendiente:** arte y modelos detallados, streaming de objetos por sectores, prueba móvil y ejecución integral de Playwright desde un clon.

## 20-nov-2026 · Nueva ronda de IA y diseño
- **C-M25:** portada editorial sin neón ni tarjetas genéricas, con prueba en Chromium `pruebas/portada.mjs`; ejecución CI pendiente de inspección en el commit correspondiente.
- **G-H19, parcial:** investigación documental de persecuciones de tres juegos. No se inventan minutos/segundos ni conteo de policías; `reportes/2026-11-20-gemini-persecuciones.md`.
- **G-H18:** 50 registros de NYC CommonPlace publicados en `contenido/nueva-york-lugares.json` (IDs/coordenadas/fuente); **acceso a cada lugar sin verificar**. Ver `docs/ESTADO-3.1.0.md`.

## Nota de consolidación · 3.1.0
Esta página conserva la historia original de los pedidos, incluso estados de 2.10/3.0 ahora superados. El **estado actualizado y con evidencias** se mantiene en [`docs/ESTADO-3.1.0.md`](ESTADO-3.1.0.md). No leer «Hecho» de versiones anteriores como una certificación de la rama principal ni del rendimiento en teléfonos físicos.

## 15. «Investiga motores viejos y livianos» y «mundo abierto desde el principio» (4.1 a 4.4)
| Pedido | Estado | Dónde |
|---|---|---|
| Investigar motores clásicos (Wolfenstein, Doom, Build, Quake, Elite, Thief, OutRun, Comanche) y adaptar sus técnicas, desde cero | ✅ | `docs/INVESTIGACION-MOTORES-CLASICOS.md`, `js/47-clasicos.js` (DDA, semillas, gema de luz y ruido, carretera arcade, Voxel Space), `js/47-colormap.js` (COLORMAP) |
| Mundo abierto desde el principio; tutorial e historia opcionales | ✅ | Turno Cero (🌎 Mundo abierto), El Metro y EnCicla (Jugar abre la ciudad), Run Scooter (regalo diario sin ventana) |
| Lo que dejaron Codex, ChatGPT y Antigravity | ✅ | Modo cine con direccionales (C‑M40), cubierta y esquivar (C‑M32), COLORMAP (C‑M39), pool de partículas y escalador, arreglos de EnCicla, la carretera de Run |

## 16. «Retoca modelos, haz el PVS, mejora topografías y edificios… comparte el motor con un informe a cada repositorio» y «pule el manejo, los rostros, los árboles, Hunter Assassin, explosiones» (4.5, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| PVS de Quake (C‑M37) | ✅ | `herramientas/pvs.mjs`, `js/45-pvs.js`, `datos/nueva_york/pvs.bin`, `datos/guatape/pvs.bin`; prueba sin fugas `pruebas/pvs.mjs`. Recorta 26 % en Manhattan y 28 % en Guatapé (cámara a ras de calle). Medellín: horneado y medido (15 %), no se mete al HTML porque pesa 1 MB para poco. |
| Modelos 3D pulidos | ✅ | `juegos/getaway/arte3d/generar_modelos.py` 0.3.1: silueta de carro con capó, cabina y baúl, rines, faros, espejos; personas con cara (ojos, cejas, orejas, nariz, labios), manos y peinado; AO horneada; malla indexada. |
| Edificios, casas y relieve (sin cambiar el mapa) | ✅ | Techos a cuatro aguas en casas de teja y en los hitos, terrazas con aires y cuarto de escalera, coronas y agujas en las torres, relieve cercano con malla de 10 m. |
| Peso y uso sin internet | ✅ | GLB comprimidos (2 MB → 0,4 MB en el HTML); `sw.js`: lo abierto una vez abre sin internet, y solo se consulta `VERSION.json` para saber si hay versión nueva (`pruebas/sin-conexion.mjs`). |
| Manejo y controles | ✅ | `docs/INVESTIGACION-MANEJO.md`: deslizar contra la pared, pérdida según el ángulo, desatascar, asistencia que evita estrellarse, derrape con freno de mano, pisar andén, ladrillo, arena, nieve y roca suelta, moto por escalas. |
| Explosiones, choques, derrapes y cosas rotas | ✅ | `js/88-efectos.js` y `js/32-rotos.js`. |
| Rostros detallados | ✅ | `js/71-rostros.js` (retratos en los diálogos y subtítulos de Turno Cero) y caras en los modelos 3D. |
| Árboles con lógica | ✅ | `js/29-arboleda.js`: nada en canchas, piscinas ni en la mitad de una plaza dura; la colisión usa el mismo filtro. |
| La forma cenital de Hunter Assassin | ✅ | Linternas que se cortan en los muros, «?» y «!», cámara cenital sola en el sigilo a pie (`juegos/getaway/58-sigilo.js`). |
| Interfaz y espaciados (juego de prueba) | ✅ | Rejilla de 8 px y área segura en el HUD de Turno Cero. |
| Bot de la historia en las pruebas | ✅ | `pruebas/getaway-historia.mjs` (`node motor.mjs prueba --historia`) y en la integración continua. |
| Documento detallado a cada repositorio; que sigan con su motor del Valle | ✅ | `docs/INFORME-MOTOR-CITY-4.5.md` en BicicletasUno, MetroZero y RunRunZero; el motor va en `motor-city/` como referencia. |
| El mapa | No se tocó | Por pedido del autor: es de las IA que lo desarrollan. El PVS es un dato derivado del mapa, no lo cambia. |
| HTML, APK y enlace de cada juego | ✅ | Ver `CONTEXTO-RELEVO.md` § 1. |

## 17. «Injugables, toscos como GTA IV… básate en EnCicla, arregla El Metro, el mapa congela, no hay horizontal» y «un solo juego de prueba con todo» (4.6, esta sesión)
| Pedido | Estado | Dónde |
|---|---|---|
| Manejo fluido, que arranque, avance y retome rápido, sin derrapes por nada | ✅ | El modelo de EnCicla (`30-ride.js`) en `js/32-fisica.js` (`_arcade`) y `js/31-vehiculos.js` (`ARCADE`); subpasos de 25 ms; prueba §26. |
| Movimiento del personaje como en EnCicla | ✅ | A pie, el mismo modelo: gira al instante y trota con el joystick a fondo. |
| Horizontal | ✅ | Portada y HUD de Turno Cero a 860×412; los APK giran con el celular (Turno Cero y Run Scooter). |
| El mapa: brújula, acercar y alejar, que no congele | ✅ | `js/70-mapa.js`: vista general armada de a poco, detalle con presupuesto, pausa, ✕ + − ◎ 🧭, tocar = destino. Tocar el minimapa lo abre. |
| Arreglar El Metro | ✅ (por la sesión de El Metro) | La 3.1.0 «Fluido» (APK 29) ya trae el manejo de EnCicla; esta sesión retiró el suyo para no pisarlo y dejó el informe 4.6 con cómo comparar los dos. |
| Un solo juego de prueba: los cuatro en Turno Cero | ✅ | `juegos/getaway/60-modos.js`: 🏁 Carreras, 🚵 Extremo, 📦 Mandados, 🚲 EnCicla (racha por la ciclorruta, semáforo en rojo, rebalanceo), 🚇 Metro, tranvía y Metroplús (manejar y parar en el andén), 🧪 Laboratorio. `pruebas/modos.mjs`. |
| Lo que dije que faltaba | Parcial | Hecho: mapa, horizontal, manejo. Pendiente: el globo en la misma escena 3D (C‑M31) y la prueba en un celular real. |
| HTML, APK y enlace de cada juego | ✅ | `CONTEXTO-RELEVO.md` § 0. |

## 18. «Coloca un botón que, presionado, siempre esté acelerando sin parar; para detenerse, se desactiva» (4.6.1)
| Pedido | Estado | Dónde |
|---|---|---|
| Botón de acelerador fijo | ✅ | `js/37-manejo.js` (`acelFijo`), `js/70-interfaz.js` (`ui.alternar`), Turno Cero: ⏫ junto a 🛑 y ⚡, tecla V. |
| Que al desactivarlo se detenga | ✅ | Frena suave hasta parar (`frenoK` 0,55), salvo que se toque el joystick. |
| Adaptarlo bien | ✅ | Vertical (la velocidad sube sobre los botones) y horizontal; también en el tren de 🎮 Modos; a pie se esconde; aviso la primera vez. Pruebas § 27 y `pruebas/modos.mjs`. |

