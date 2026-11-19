# Bitácora de Motor City

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
