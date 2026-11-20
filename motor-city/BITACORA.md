# Bitácora de Motor City

## 20‑nov‑2026 · 2.6.0 · Estilo realista familiar, árboles de pie y tareas de cada IA (Claude Code)
**Pedido:**
- «Haz una revolución para que los gráficos sean más realistas: desde la vista cenital los árboles se ven como tapetes en el suelo.»
- «Deja el estilo *family friendly*, pero dale más realismo, rudeza y crudeza.»
- «Los tutoriales deben ser opcionales.»
- «Copia todos tus pedidos en los repositorios para que cada uno continúe.»
- «Gemini con Antigravity pasa a *hydrogen*: déjale las tareas fáciles. ChatGPT con Codex sigue con *astra*: encárgale mejores pedidos; GPT genera mejores imágenes.»

**Lo que pasaba:** los árboles eran discos pintados en el piso de las losas. Desde una vista inclinada, el piso se aplasta y los discos quedaban como elipses acostadas: «tapetes».

**Lo que se hizo:**
1. **`MC.Arboleda`** (`js/29-arboleda.js`):
   - los mismos árboles (y los mismos con que se choca) se levantan en la maqueta, la oblicua y la lateral: tronco que se afina, ramas, copa de lóbulos con luz de arriba a la izquierda, hojas, y flores en los guayacanes;
   - desde arriba, la copa tiene volumen;
   - 6 especies (guayacán amarillo y rosado, ceiba con raíces tablares, mango, urapán y monte), 3 variantes cada una;
   - sprites horneados una vez, con versiones reducidas y copia nocturna;
   - sombra según el sol de cerca, y la sombra bajo la copa horneada en el piso.
2. **`MC.Rudeza`**, horneada en las losas (no cuesta por cuadro):
   - asfalto con parches, grietas, manchas de aceite y alcantarillas;
   - centro de carril más gastado;
   - andén de baldosa con bordillo;
   - pasto con parches secos y verdes;
   - tejas de barro en hileras y planchas con humedad;
   - grano;
   - paleta 30 % menos saturada.

   Además, los muros tienen la base sucia y sombra bajo el alero.
3. **`MC.estilo`** (`'realista'` por defecto o `'clasico'`) y el selector 🖌️ en Vista.
4. **Tutorial opcional:** ya no se abre solo; está en la portada («❓ Cómo se juega (opcional)») y en ⚙️ Ajustes.
5. **Tareas de cada IA:**
   - **`TAREAS-IA.md`** en los cuatro repositorios;
   - Gemini («hydrogen»): G‑H1…G‑H6, tareas fáciles;
   - ChatGPT («astra»): arte C‑A1…C‑A7 y código C‑M13, C‑M16, C‑M17…;
   - `node motor.mjs capturas` y `revisar-arte` para que las tareas fáciles sean comprobables;
   - el gancho `arbol` para el arte de ChatGPT.
6. **Rendimiento:** la maqueta de Medellín con la CPU 4× más lenta mide 30–38 ms (el límite es 40). Los árboles de pie se ralean parejo si son muchos, y con calidad media salen desde un poco más cerca.

**Probado:** 119 pruebas:
- los árboles que se ven son los que chocan;
- Mandados en un celular táctil: tutorial opcional, árboles de pie y arte cargado;
- la CPU 4× más lenta.

Capturas de día, tarde y noche en la maqueta, la cenital y la lateral.

## 19‑nov‑2026 · 2.5.1 · Mandados jugable de verdad (Claude Code)
**Pedido:** «Traté de probar el minijuego pero es injugable. No hay controles de verdad, no se puede mover nada. No está completamente liberado porque hay que pagar cosas. Mejóralo con lo nuevo. ¿Ya están todos los pedidos en el repositorio?»

**Lo que pasaba:**
- El personaje sí se movía, pero la cámara estaba tan lejos que en un celular medía unos 3 píxeles.
- El joystick era invisible.
- Por eso parecía que nada respondía.
- Además, casi todo costaba plata.

**Lo que se hizo:**
1. **Cámara cerca:** unos 45 m en el lado corto de la pantalla, en celular y en computador. El jugador tiene un **anillo verde con flecha**.
2. **Joystick visible** abajo a la izquierda (`ui.joystick`), con la guía «Arrastra para moverte» (en computador: «Flechas o WASD»).
3. **Botones de acción** redondos abajo a la derecha (`ui.accion`): ⤒ saltar y ⚡ turbo; 🔽 bajar y 🔼 subir aparecen en el agua o en el aire.
4. **Flecha al objetivo** con la distancia (`MC.UI.indicador`), siempre dentro de la zona libre, sin tapar la interfaz.
5. **Modo libre**, prendido por defecto: los 34 vehículos, la lancha, la gasolina, la casa, los lugares y el modo alcalde son gratis. Se apaga en ⚙️ Ajustes.
6. **Tutorial** «Cómo se juega» al empezar, y otra vez desde Ajustes. Los menús quedaron en **Vista** (vistas, pixel y zoom) y **Ajustes** (modo libre, controles y rescate).
7. **El primer mandado empieza cerca**, y la distancia crece con cada entrega.
8. La interfaz:
   - las barras pasaron arriba y la velocidad, abajo al centro;
   - la tarjeta del mandado lleva el título en una línea y, primero, la distancia y el tiempo.
9. **`docs/PEDIDOS.md`:** cada pedido del autor, su estado y dónde quedó. Hay 55 hechos, 2 que dependen de afuera y 3 pendientes con dueño.

10. **Llegó la entrega de Gemini** (`ENTREGA-GEMINI-MOTOR-CITY-2.5.md`, G‑M0…G‑M15) y quedó integrada:
    - el arte, extraído a `arte/gemini/`: 10 atlas WebP, manifiesto, 53 íconos, 30 hitos y paletas;
    - `MC.Pieles` lo instala como piel con respaldo procedural en cada gancho, a la medida del motor y con una copia nocturna;
    - en Mandados se usan los árboles del trópico, los props, las rocas, las fachadas y los muebles, con el selector 🎨 Arte en Vista;
    - el personaje, los vehículos y los animales siguen procedurales, porque los de Gemini no vienen a escala;
    - la revisión está en `arte/gemini/LEEME.md`.
11. **De la auditoría de Gemini** se corrigió:
    - la leyenda de las capas de datos (`ui.leyenda`);
    - las etiquetas de los cuartos, ahora en la esquina;
    - las ventanas de noche en las casas bajas;
    - la maqueta, sin el corte de tierra de la vista lateral;
    - las barras, con fondo.

    También apareció un `//` que desde la 2.2 anulaba `mision.hidden` y el `aria-live` del aviso.
12. **De la auditoría de Codex** (`docs/AUDITORIA-MOTOR-CITY-2026-11-19.md`): las pruebas usan el Chromium del sistema si Playwright no trae el suyo, o el que diga `MC_CHROMIUM`. Quedan anotados, con su dueño:
    - la maqueta, que midió 44,7 ms en su máquina y aquí 27–29 ms;
    - el test de WebRTC de EnCicla.

**Probado** (118 pruebas). La nueva, en un celular táctil emulado (412 × 860), comprueba:
- aparece el tutorial;
- todo es libre y gratis, con 34 vehículos;
- el joystick se ve;
- arrastrarlo mueve al personaje unos 4 m en 2 s;
- la cámara da 9 px por metro;
- el primer mandado está a menos de 900 m;
- el arte de Gemini carga (10 atlas, de día y de noche) sin sprites faltantes.

En computador, las flechas y WASD mueven y giran.

**Falta:** probarlo en un celular real.

## 19‑nov‑2026 · 2.5.0 · Entrar al agua (Claude Code)
**Pedido:** «Añade la capacidad de poder entrar en el agua».

**Lo que pasaba:** en la 2.4 solo se entraba a pie. Mandados empieza en bici, así que el juego frenaba en la orilla.

**Lo que se hizo:**
1. **Bajarse en la orilla:** con un vehículo, al empujar 0,6 s hacia el agua honda (o con «🏊 Al agua»), uno se baja, el vehículo queda **parqueado en la orilla** y se entra al agua. Al volver: «Subirse».
2. **Nadar y bucear:** «🤿 Bucear» (Z o Ctrl) baja hasta medio metro del fondo; «⬆️ Subir» (espacio) sube; quieto, se flota hacia arriba.
3. **El aire:** dura ~35 s bajo el agua y se recupera arriba. Sin aire, la persona sube sola y no vuelve a bajar hasta tomar algo de aire.
4. **Poses** de crol y de buceo, el agua tapando el cuerpo, burbujas y la pantalla azul con rayos de luz bajo el agua.
5. **Lancha:** se alquila en el garaje si hay agua honda a menos de 30 m. Con «⚓ A tierra» uno se baja a la tierra firme más cercana y la lancha queda amarrada.
6. **Ocurrencias:** ya no «arregla» al que bucea como si estuviera bajo el piso.

**Probado** (117 pruebas):
- la bici se queda en la orilla de Guatapé y se entra nadando;
- se bucea con aire limitado y, sin aire, se sube aunque se siga oprimiendo «bajar»;
- se sale del agua y se vuelve a la bici;
- la lancha navega, desembarca y queda amarrada;
- en Mandados, el botón «Al agua» aparece en la orilla y funciona.

## 19‑nov‑2026 · 2.4.0 · Montañas, rocas, agua y límites de paso (Claude Code)
**Pedido del autor:** un sistema de montañas, rocas y tipos de terreno; agua en lagos, ríos, playa y mar; y límites de movimiento que no rompan la verosimilitud («el personaje pasa por encima de cosas que no debería»).

**Lo que se encontró** (por qué se atravesaban cosas):
1. Sobre las casillas de calle no se revisaban los edificios.
2. Los edificios de los sitios y los emblemáticos no chocaban.
3. Los árboles de las losas solo eran dibujo.
4. Postes y bancas no chocaban.
5. El agua era «sí o no», sin profundidad.
6. La pendiente frenaba, pero nunca bloqueaba.

**Lo que se hizo:**
1. **`MC.Terreno`:**
   - análisis del agua: componentes, tipo (mar, lago, río, quebrada) y distancia a la orilla, con la profundidad que sale de ahí;
   - reglas de paso por clase con su motivo: a pie se vadea y luego se nada; bici, moto, carro y camión tienen un límite de agua; la lancha necesita calado;
   - pendiente máxima fuera de las vías (subir y bajar barrancos);
   - roca, monte, arena y nieve según el vehículo;
   - borde del mundo;
   - obstáculos: edificios también sobre la calle si uno se mete más de 1 m, sitios y emblemáticos, los mismos árboles que pintan las losas, mobiliario, naturaleza, y tráfico y gente si el juego los pasa.
2. **`MC.Naturaleza`:** rocas (las grandes chocan), palmas, frailejones en el páramo, arbustos y juncos.
3. **Generador:**
   - lagos por llenado de prioridad (Barnes, 2014), solo los grandes y hondos, de superficie plana y con desagüe;
   - el mar a nivel 0;
   - los pueblos no se construyen sobre los lagos;
   - los charquitos sueltos se limpian.
4. **Dibujo:**
   - el agua toma color por tipo y profundidad, con espuma en la orilla;
   - la roca asoma en las laderas de más de 65 %;
   - brillos que se mueven sobre el agua;
   - vadear y nadar se ven, en lateral y en cenital.
5. **Mandados:** el agua se mide al cargar; dice por qué no se pasa (🌊, ⛰️, 🌳, 🪨) y avisa al nadar; nadar cansa; el tráfico y la gente estorban.

**Probado** (115 pruebas):
- el embalse de Guatapé es lago, de 0,3 m en la orilla y 16,6 m adentro;
- Medellín tiene su río;
- caminando hacia el embalse se termina nadando;
- la bici no entra a lo hondo y la lancha no anda en lo pando;
- el carro no sube una ladera de 68 % fuera de la vía;
- no se atraviesan los emblemáticos, los postes ni los árboles;
- los lagos generados son planos, el mar está a 0 m y nada de naturaleza cae sobre las vías.

## 19‑nov‑2026 · 2.3.0 · La ciudad como SimCity, Los Sims, Cities: Skylines y Townscaper (Claude Code)
**Pedido del autor:**
- estudiar esos juegos y sus motores: cómo crean entornos, ambientes, sombras y detalles de una ciudad;
- añadirlo al motor, porque es crucial para cómo se crea;
- entregar **un solo documento** con todo (contexto, código a usar y plan de cada IA), el minijuego, el HTML y el link.

**Lo que se hizo:**
1. **Sombras del sol** por hora en las vistas 2D y en el raster: casco convexo en caché, recorte de techos en cenital y oclusión de contacto en las losas. Probado: a las 12 h la sombra mide 0,13 m por metro de altura; a las 16:30, 2,4 m y hacia el oriente; de noche, nada.
2. **Mobiliario urbano** por vía, con azar fijo: cerca del Coltejer, 269 postes, 206 árboles, 30 cebras, 45 bancas y 11 paraderos, ninguno dentro de un edificio. **Luces de noche** en charcos cálidos.
3. **Fachadas por reglas** (WFC) en ciudad 3D, maqueta y lateral: locales, vitrinas y puerta abajo, balcones alineados y muros ciegos.
4. **`MC.Urbe`:**
   - campos de 40 m (valor, ruido, contaminación, verde, servicios y transporte);
   - zonas de 8 m junto a las calles;
   - demanda RCI que responde a lo que se construye;
   - lotes que crecen mirando a la calle y suben de nivel;
   - energía y agua con capacidad (GlassBox);
   - predial y mantenimiento en el libro;
   - capas de datos encima de las vistas.

   Un parque sube el valor de 45 a 60.
5. **Los Sims:** objetos que anuncian necesidades, `MC.Habitante` (con hambre va a la nevera o a la estufa) y ambiente de la casa (decorar lo sube). Ninguna casa queda sin cocina ni cama.
6. **Townscaper:** WFC, autotile (4, 8 y esquinas) y rejilla irregular relajada.
7. **Paisaje sonoro:** tráfico, pájaros, grillos, lluvia, truenos, viento, agua y gente.
8. **Mandados:** 🏙️ modo alcalde (capas, zonas, parque, colegio, planta solar y resumen), casa con alguien que vive en ella y menú de sonido.
9. **Ganchos de arte** `prop`, `fachadaModulo` y `mueble`.
10. **Documentos:** `docs/DOCUMENTO-UNICO.md` y `node motor.mjs documento` (→ `dist/MOTOR-CITY-TODO.md`). `PLAN-IAS` y `PETICION-*` ahora apuntan ahí.

**Cifras** (CPU 4× más lenta, con sombras y mobiliario):

| Vista | ms |
|---|---|
| Cenital | 8–10 |
| Ciudad 3D | ~15 |
| Maqueta | ~27 |
| Lateral | 14–20 |

La calidad automática baja el detalle si hace falta. Bajar la maqueta a menos de 20 ms es el encargo C‑M13. 109 pruebas en verde.

## 19‑nov‑2026 · 2.2.0 · GPU virtual, mi casa, lugares, historias y vista lateral (Claude Code)
**Pedido del autor:**
- una solución a la tarjeta gráfica;
- mejor física en puentes y cámara;
- ver las vistas centrales de lado, estudiando FEZ, Little Nightmares y Monument Valley;
- sprites;
- interfaz con psicología, que no estorbe;
- estudiar los mejores motores;
- historia con diversión, reflexión y conciencia;
- ocurrencias;
- manual, optimización y tipos de controles;
- la casa del jugador por su dirección, con interiores únicos y diseñables;
- talleres, tiendas y más lugares;
- historias procedurales, No Man's Sky y tamaños proporcionales.

**Lo que se hizo** (todo con pruebas; 103 en verde, también en Chromium):
1. **GPU virtual** (`05-gpu`, `44-raster`):
   - perfil del aparato;
   - resolución dinámica PI y bucle de paso fijo;
   - **3D por software en Canvas 2D**: 15–25 ms, contra 70–90 ms del WebGL por software.
2. **Física de niveles por superficies:** se sube por la rampa y se pasa por debajo, probado en 5 puentes reales. Tiempo de coyote y memoria del salto.
3. **Cámara** con resortes críticamente amortiguados, brazo con choque (edificios, cerros y tableros), FOV por velocidad, trauma y giros animados.
4. **Vista lateral:** casa de muñecas, giro de a 90° (FEZ) y rayos X. La ciudad 3D también se inclina hasta quedar de lado.
5. **Manejo** (curvas, giro según la velocidad, asistencias y 7 esquemas), **sprites**, **escala real** (los 35 vehículos validados) e **interfaz** por zonas: columna arriba, atenuación, cola de avisos, foco y cine. `MC.UI.verificar` prueba que nada tape el centro.
6. **Interiores** con 8 estilos, cuartos opcionales, decoración, catálogo de 22 muebles y lugares nuevos (taller, tienda, centro comercial, biblioteca y restaurante).
7. **Mi casa** (`49-hogar`):
   - lee la nomenclatura colombiana y la ubica en las calles reales, sin internet;
   - acierta «Calle 50 # 52‑20» en La Candelaria y elige el municipio correcto si se dice;
   - el jugador diseña su casa y la compra cuadra en el libro.
8. **Lugares jugables y desgaste** (`82-lugares`): 195 lugares en Guatapé, con talleres que reparan y mejoran, tiendas con energía y bibliotecas con datos reales.
9. **Historias** (`85-historias`): storylets en tres pilares, director de ritmo, encargos procedurales y **ocurrencias** con corrección y reporte sin datos personales.
10. **Cosmos** (`13-cosmos`): estrellas con abundancias reales, planetas con Kepler, gravedad, temperatura y atmósfera, mundo jugable, criaturas verosímiles y relieve infinito.
11. **Mandados** con todo lo anterior.
12. **Documentos:** `docs/MANUAL.md`, `INVESTIGACION.md`, `OPTIMIZACION.md`, `PLAN-IAS.md` y las peticiones 2.2 a Gemini y ChatGPT.
13. **Web:** portada `index.html` + `.nojekyll` en `main`, porque Pages sirve `main`. La 2.0 se fusionó a `main` con el PR #1 del autor.

**Falta:** las entregas de Gemini y ChatGPT, medir en un celular real, la migración de cada juego a `motor-city/` (sus IAs) y la 2.3 (ver `docs/PLAN-IAS.md`).

## 19‑nov‑2026 · 2.1.0 · Motor City crece (Claude Code)
- Nombre: solo «Motor City»; los juegos lo reciben en `motor-city/`.
- Ciencia, economía, generador de mundos, territorios (`geo/territorio.py` con Guatapé), clima global, seres, taller, IA y población, interiores, música, interfaz y mecánicas.
- Minijuego Mandados; plantillas, `nuevo`, `reporte`, skills `motor-city-*` y `CONTRIBUIR.md`. 80 pruebas.

## 19‑nov‑2026 · 2.0.0 · nace Motor City (Claude Code)
**Pedido del autor:**
- Hacer un solo motor de mundo abierto según el *Plan del Mundo Abierto del Valle*, en el repo nuevo `motorcity`.
- Que quede listo para cualquier ciudad y para los juegos que vienen: *Motor City* (carreras) y *Extremo* (deportes extremos).

**Lo que se hizo:**
1. **Revisión:**
   - se clonaron y probaron los tres juegos en sus ramas más nuevas;
   - EnCicla v2.0.1: 97 ✓;
   - El Metro v2.0.0: 100 partidas, 0 errores;
   - Run Scooter v2.5.0: simulación de 100 partidas, bien;
   - se jugaron y capturaron sus vistas.

   **Hallazgos:**
   - Run Scooter es **WebGL propio**, no Canvas 2D como decía el plan.
   - El Metro ya integró su entrega (v2.0.0), pero su motor 1.2.0 sigue en la rama `motor-valle`.
2. **F1 · Mundo 2.0:**
   - `herramientas/fusionar.mjs` junta en `datos/medellin/mundo.mc4` (6 MB, 16 capas) los datos de EnCicla (10 m) y de El Metro (metros);
   - el cargador `js/10-mundo.js` trae todas las consultas.

   Cifras:
   - 639.457 huellas;
   - 2.193 pasos con nivel (el viaducto sale de los rieles reales);
   - 31 líneas;
   - 133 estaciones EnCicla;
   - 45 lugares y 30 hitos enlazados.
3. **Redes:** grafo de cruces sobre las vías reales (`js/11-red.js`): A\*, recorridos sin fin y la salida que continúa.
   - Ciclorrutas: 123 km.
   - Red conectada: 34.173 nodos.
4. **F5 · Reglas del mundo:**
   - reloj y festivos de Colombia;
   - cielo con el sol y la luna reales;
   - clima por temporadas, igual para todos;
   - transporte con horario real y determinista;
   - tráfico con semáforos reales;
   - huevos de pascua.
5. **F2 · Lo físico:**
   - personaje único con esqueleto de poses;
   - 35 vehículos (con los que vienen para Motor City y Extremo);
   - física con pendiente, choques, puentes por sus extremos, saltos, vuelo y agua;
   - controles de teclado, táctil y gamepad;
   - una cámara para todas las vistas.
6. **F3 · Vistas:**
   - cenital, ciudad 3D y maqueta 2:1 con una sola proyección y las losas en caché;
   - **panorámica de perfil**, que junta la de El Metro y la de EnCicla y suma la fila real de edificios, las siluetas de los emblemáticos, el viaducto con trenes reales, los cruces con nombre, el primer plano y el fondo suavizado;
   - WebGL (tercera y primera persona, dron y cine);
   - pixel en todas;
   - transición y calidad automática.
7. **F4 · Run en la ciclovía:**
   - se importa RunRunZero 5b2f85d casi idéntico, con 12 parches comprobados;
   - lomas y curvas reales;
   - esquinas en los cruces reales, que doblan el mundo;
   - cielo y lluvia del mundo;
   - se sale en el mismo punto.
8. **Banco de pruebas** `dist/motor-city.html` y **54 pruebas** (`node motor.mjs prueba --navegador`). Con la CPU 4× más lenta, la mediana del dibujo es:

   | Vista | Mediana |
   |---|---|
   | Cenital | 4,1 ms |
   | Ciudad 3D | 8,6 ms |
   | Maqueta 2:1 | 17,8 ms |
   | Panorámica | 7,3 ms |
9. **La tubería 1.x se mudó aquí:** `geo/`, `capas/`, `motor.mjs` y `js/valle.js` sin cambios. `build.py` y `fetch.py` ya leen la ventana de cualquier ciudad (`CIUDAD=ciudades/x.json`).
10. **Documentos:**
    - `MOTOR.md` (el contrato 2.0) y `CONTEXTO-IA.md`;
    - migración de EnCicla y de El Metro;
    - receta para otras ciudades y visión de los juegos que vienen;
    - peticiones de arte y auditoría para Gemini y ChatGPT.
11. **Juegos:**
    - se sincronizó el motor 2.0 en `motor-valle/` de EnCicla y de El Metro, sin cambiar su código ni sus datos;
    - en cada repo hay una nota `docs/CONTEXTO-MOTOR-CITY.md` y una entrada en su bitácora;
    - sus pruebas siguen en verde.

**Errores encontrados y corregidos en el camino:**
- La tabla de capas se pisaba con el `n` de los edificios.
- El inflador entraba en un bucle sin fin con datos truncados.
- Había una llave de más en `45-gl.js`.
- `[hidden]` no ocultaba la pantalla de carga.
- La conversión de grados a metros estaba mal.
- Faltaba un nulo en los cruces de la panorámica.
- Un color `rgba` daba negro.
- En el pixel, las etiquetas salían gigantes.

**Lo que sigue:** ver `CONTEXTO-IA.md` §5.
