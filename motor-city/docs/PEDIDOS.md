# Todos los pedidos del autor y dónde quedaron

> **Para qué sirve:** responder «¿ya está todo lo que pedí en el repositorio?».
>
> Cada pedido aparece con su estado y con el archivo donde vive. Se actualiza en cada sesión.
>
> **Estados:**
> - ✅ está en el repositorio y tiene prueba;
> - 🟡 está hecho, pero falta algo que no depende del código (un celular real, otra IA);
> - ⏳ todavía no está, y se dice a quién le toca.

Versión **2.5.1** · 19‑nov‑2026 · **118 pruebas en verde** (`node motor.mjs prueba --navegador`).

## Resumen
- **Hechos:** 58 pedidos ✅.
- **Hechos, pero falta algo de afuera:** 2 🟡. El motor ya está copiado en EnCicla y El Metro, pero sus IAs todavía no lo usan. Y falta probar en un celular real.
- **Pendientes:** 6 ⏳:
  - los juegos *Motor City* (carreras) y *Extremo*;
  - bajar la maqueta de 40 ms en cualquier máquina;
  - el test de WebRTC de EnCicla, que le toca a su IA;
  - la entrega de ChatGPT (la de Gemini ya llegó y está integrada);
  - la segunda vuelta del arte de Gemini (personaje y vehículos a escala);
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

## 6. Lo que falta, y a quién le toca
| Qué | Estado | A quién le toca |
|---|---|---|
| Probar en un **celular real** de gama media | 🟡 | Al autor. Anota el modelo y lo que se siente lento o confuso. |
| Código de ChatGPT (C‑M1…C‑M15) | ⏳ | Al autor, que le pasa el documento único (§9.2 y §10.2), y a ChatGPT. |
| Arte de Gemini, segunda vuelta: personaje y vehículos a escala | ⏳ | A Gemini (lista en `arte/gemini/LEEME.md`). |
| Licencia del motor | ⏳ | Al autor (`docs/NEGOCIO-Y-USOS.md`). |
| Maqueta por debajo de 40 ms en cualquier máquina (Codex midió 44,7 ms en la suya; aquí da 27–29 ms) | ⏳ | A Claude: caché por región y fachadas horneadas (§9.7). |
| El test de WebRTC de EnCicla (ventana fija de 900 ms) | ⏳ | A la IA de EnCicla (lo señalaron Gemini y Codex). |
