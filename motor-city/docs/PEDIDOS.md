# Todos los pedidos del autor y dónde quedaron

> **Para qué sirve:** responder «¿ya está todo lo que pedí en el repositorio?».
>
> Cada pedido aparece con su estado y con el archivo donde vive. Se actualiza en cada sesión.
>
> **Estados:**
> - ✅ está en el repositorio y tiene prueba;
> - 🟡 está hecho, pero falta algo que no depende del código (un celular real, otra IA);
> - ⏳ todavía no está, y se dice a quién le toca.

Versión **2.10.0** · 20‑nov‑2026 · **134 pruebas en verde** (`node motor.mjs prueba --navegador`).

## Resumen
- **Hechos:** 76 pedidos ✅.
- **Hechos, pero falta algo de afuera:** 5 🟡. Los 10 reels que piden iniciar sesión los describe Gemini. El motor ya está copiado en EnCicla y El Metro, pero sus IAs todavía no lo usan. Y falta probar en un celular real.
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

