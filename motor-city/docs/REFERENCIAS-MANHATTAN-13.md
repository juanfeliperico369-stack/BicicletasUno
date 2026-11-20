# TURNO CERO: MANHATTAN · Análisis de 13 referencias
**Motor City · Entrega conjunta para Codex, Gemini, Claude y cualquier IA sucesora.** 20 de noviembre de 2026.

## Método y honestidad de fuente
Las 13 direcciones de Google Play fueron consultadas en esta ronda. Este informe se fundamenta en las descripciones de sus fichas oficiales, **no** en sesiones jugadas, telemetría privada, ingeniería inversa, capturas de gameplay ni análisis de secuencias con cronómetro. Los traslados a Motor City son **propuestas nuestras**, no prestaciones confirmadas de los títulos. Referencias repetidas de anteriores informes se consolidan, no se contabilizan dos veces.

La puntuación de prioridad A/B/C es *utilidad para nuestro proyecto*, no calidad crítica ni ranking de ventas. **No extraer ni redistribuir capturas, música, modelos o códigos de estos juegos.**

| # | Obra / ficha original | Evidencia de diseño en la tienda | Abstracción útil para Motor City | Evitar | Pri. |
|---|---|---|---|---|---|
| 1 | [Reckless Getaway 2](https://play.google.com/store/apps/details?id=com.pixelbite.ga2) | Persecución vehicular con policías, vehículos pesados y escalada | Escalada 1–5 basada en evidencia visible, no aparición infinita de policías | Escalar solo si hay contacto y testigos; IA legible | A |
| 2 | [Getaway](https://play.google.com/store/apps/details?id=com.MoonLightGames.Getaway) | Evasión de coches y obstáculos en áreas cerradas, distintos manejos | Microarena portuaria para tutorial de conducción y evasión | No copiar arenas ni diseños de niveles | A |
| 3 | [#DRIVE](https://play.google.com/store/apps/details?id=com.pixelperfectdude.htdrive) | Conducción infinita y estética de cine de carretera setentero | Iluminación cálida, imperfección editorial, autos reconocibles por silueta | Evitar nostalgia kitsch e interfaces de neón | A |
| 4 | [Solar Smash](https://play.google.com/store/apps/details?id=com.paradyme.solarsmash) | Simulación interactiva y retroalimentación visible de cambios | Inspección de daños locales persistentes: señales, vitrinas, mobiliario | No incorporar destrucción planetaria o física no viable en móvil | C |
| 5 | [Space Frontier 2](https://play.google.com/store/apps/details?id=com.ketchapp.spacefrontier2) | Progresión por sistemas, tecnologías y exploración | Desbloqueos de barrios y taller por hitos narrativos | No trasladar literalmente colonización espacial a la ciudad | C |
| 6 | [WorldBox](https://play.google.com/store/apps/details?id=com.mkarpenko.worldbox) | Agentes y civilizaciones con evolución emergente y simulación offline | Barrios con rutinas y tráfico local, memoria de eventos y reputación | No simular decenas de miles de agentes al mismo tiempo | B |
| 7 | [Bullet Echo](https://play.google.com/store/apps/details?id=com.zeptolab.bulletecho.google) | Sigilo táctico desde arriba con visión reducida y señales sonoras | Señales auditivas de patrullas, visión restringida por calle y lluvia | No duplicar el cono de linterna ni héroes y armas reconocibles | B |
| 8 | [Idle Drift: JDM Race](https://play.google.com/store/apps/details?id=com.idle.drift) | Drift, progresión de vehículo y mejoras de componentes | Taller basado en agarre, frenado, masa, durabilidad y pintura | Evitar progresión clicker/grind y recompensas por anuncios | B |
| 9 | [PAKO 2](https://play.google.com/store/apps/details?id=com.treemengames.pako2) | Conductor de fuga recoge equipo y sale por rutas bajo persecución | Misiones con recogida/entrega, pasajeros y escapes alternativos | No copiar formas de misión, vehículos ni recorridos existentes | A |
| 10 | [PAKO Forever](https://play.google.com/store/apps/details?id=com.treemengames.pakoforever) | Mapas regenerados, power-ups, conducción táctica simplificada | Semillas reproducibles para desvíos/tráfico, no para alterar Manhattan real | Realidad urbana fija; aleatorizar eventos, no trazado base | A |
| 11 | [PAKO 3](https://play.google.com/store/apps/details?id=com.treemengames.pako3) | Modos diferenciados, coches personalizables, niveles y jefes | Tres arquetipos de persecución y misiones especiales con salida | No convertir historia adulta en puro arcade de desbloqueos | B |
| 12 | [PAKO Highway](https://play.google.com/store/apps/details?id=com.treemengames.pakohighway) | Adelantamientos cercanos que llenan el boost, mejoras de coche | Casi choque medido sin colisión y turbo controlado, ya existe MC.Persecucion | Evitar que el turbo haga invulnerable o atraviese el tráfico | A |
| 13 | [GTA: Chinatown Wars](https://play.google.com/store/apps/details?id=com.rockstargames.gtactw) | Narrativa criminal urbana, traición familiar, desplazamiento y minijuegos móviles | Poder/reputación, decisiones con consecuencias, microactividades contextuales | No usar personajes, triadas, diálogos, misiones ni marcas GTA | A |

## Síntesis: cinco sistemas que se complementan
1. **Ciudad de autor, tráfico emergente.** La malla vial de Manhattan debe provenir de datos geográficos con licencia y atribución verificadas. Solo el comportamiento del tráfico, eventos, patrullas, horarios y bloqueos se puede modular proceduralmente. En *PAKO Forever* la regeneración afecta al escenario, pero aquí no debe cambiar las calles reales.
2. **Peligro legible.** Una persecución no es solo mayor cantidad de agentes: señalización clara de testigos, visión de patrullas, radio de búsqueda, bloqueo de cruces, pérdida del contacto y coste social por conducir peligrosamente. Una patrulla nunca reaparece delante de la cámara.
3. **Vehículo como personaje.** Masa, suspensión, motor, calentamiento, agarre de neumáticos sobre mojado, peso de pasajeros y desgaste. El audio y el tacto cambian más la sensación que una lluvia de partículas.
4. **Crimen con consecuencia.** La historia debe hablar de corrupción, deuda, explotación y poder; el jugador no es premiado por dañar a peatones. La elección central es qué intereses revelar o proteger.
5. **Simulación con presupuestos.** La inspiración de WorldBox sirve para diseñar eventos causales persistentes sin simular todo Manhattan a 60 Hz. Dividir sistemas en **activo 80–150 m**, **simulación agregada hasta 600 m** y **estado diferido por sector**.

## 13 referencias, una identidad original
- **Cámara:** 3D elevada oblicua, perspectiva estable y posibilidad de cámara trasera. El 2D es respaldo del mismo estado, no otro juego.
- **Tono:** crimen neo-noir adulto, silencios, arquitectura y lluvia. El miedo surge de reconocer a un perseguidor en el espejo, no de saturar la pantalla.
- **Narrativa:** protagonista adulta, no heredera de un imperio; se encuentra con una cadena de contratos ilegales y debe decidir a quién exponer.
- **UI:** instrumentos sobrios de vehículo, mapa plegado, tipografía técnica con textura editorial. No tarjetas glassmorphism, degradados violetas, estrellas decorativas ni luces neón indiscriminadas.
- **Aptitud:** recomendado para mayores de edad por temas, lenguaje y violencia narrativa (clasificación final pendiente de evaluación formal). El modo de prueba de conducción puede ser no gráfico.

## Escenas para crear arte **original** (no capturas falsas)
1. Entrada nocturna al Lower East Side; sedán borgoña, señales de calle desgastadas, asfalto húmedo, 3/4 elevado.
2. Taller pequeño con herramientas ordenadas, iluminación ámbar y vista de perfil ortográfica del sedán.
3. Dársena junto al East River; montacargas y contenedores genéricos sin logos, luces bajas reflejadas.
4. Huida bajo paso elevado: contraste entre el vidrio de edificios altos y ladrillo antiguo; un puente en la distancia.
5. Tarjeta de misión tipo expediente de oficina de transporte: papel marfil, tinta, líneas de registro y un sello rojo discreto.
6. Wireframe de interfaz en 412×860, con un único objetivo destacado, minimapa sin invadir carretera y estado de persecución accesible.
7. Hoja UV ortográfica de un taxi genérico y un sedán de cuatro puertas, sin emblemas de fabricante ni matrículas reales.
8. Diagrama de 1 km² por sector que distingue geometría real, simulación activa e impostores distantes.

## Licencias y controles
Obras comerciales = **referencias**, nunca fuentes reutilizables de assets. NYC CommonPlace aporta POI, no calles ni textura ni licencia sobre fotografías. Para calles y edificios se requiere el pipeline GIS de Motor City y atribución OSM/Overture correspondiente. La música debe ser original o con licencia explícita.

## Handoff mínimo para la IA que implementa
Leer en orden: `docs/ESTADO-3.1.0.md`, `docs/PROXIMO-NUEVA-YORK.md`, **este informe**, `docs/GETAWAY-MANHATTAN-BIBLIA.md`, `juegos/getaway/README.md`, `contenido/nueva-york-lugares.json` y los assets `arte/chatgpt/guias/manhattan-*.svg`. La rama de preproducción no reemplaza el motor de Medellín y Guatapé.
