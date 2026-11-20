# TURNO CERO: MANHATTAN
## Biblia maestra de narrativa, diseño y producción — expediente de preproducción

**Estado:** propuesta creativa original y especificación técnica; **no es el juego completo**. Género: conducción, sigilo vehicular, mundo abierto compacto, thriller criminal para adultos. Plataforma objetivo: HTML único offline en PC/Android/iOS con el mismo mundo en 2D/3D. Título provisional, sujeto a comprobación de disponibilidad comercial.

### Tesis
*No hace falta poseer la ciudad para decidir quién la pierde.* Manhattan respira de noche: recorridos de reparto, contratos invisibles, trabajadores, taxis, puertos, gentrificación y vigilancia. Una conductora descubre que las rutas aparentemente inocentes de su empresa sirven para desviar pagos y borrar pruebas. El mundo responde a sus decisiones. El enfoque adulto nace de la ambigüedad moral y de las consecuencias, no de glorificar ataques a civiles.

**Logline.** Mara Vega (34), mecánica y conductora nocturna de una flota de mensajería, encuentra un libro de rutas que vincula a varios inversores con desaparición de salarios, corrupción y coacción. Para proteger a quien se lo entregó debe circular por Manhattan con las personas que más desconfía, mientras decide qué publicar, qué ocultar y a quién abandonar.

### Los personajes y sus tensiones
- **Mara Vega**, protagonista. Habilidad en conducción y diagnóstico de vehículos; su defecto no es la temeridad, sino confiar en sistemas que considera racionales.
- **Nadia Bell**, archivista sindical y primera fuente del expediente; protege a conductores subcontratados. No es una víctima ornamental; toma decisiones propias.
- **Isaac Ward**, intermediario de cargas nocturnas de Argenta Quay; paga bien, nunca da un relato completo y puede ayudar o traicionar según su exposición pública.
- **Noah Kim**, operador de radio independiente; puede difundir documentos, pero teme comprometer fuentes.
- **Elena Cross**, inspectora ficticia de la Unidad de Tránsito del relato. Sus compañeros discrepan; nunca se representa a la policía real de Nueva York.
- **La Cámara de Rutas**, red ficticia de empresas de logística, política inmobiliaria y contratistas. No representa a una comunidad real ni tiene iconografía de grupos delictivos existentes.

### Cinco actos y siete misiones de 30–50 min
| # | Escena / barrio real de referencia | Inicio | Mecánica | Giro o decisión | Estado a persistir |
|---|---|---|---|---|---|
| 0 | **Papel de ruta**, taller al sur de Chelsea | Recibir encargo aparentemente normal | Tutorial opcional de conducción y transferencia de paquete | Aceptar entrega tarde o leer la hoja de rutas | Tutorial mostrado, condición de coche |
| 1 | **Kilómetro cero**, Lower Manhattan | Recoger a Nadia antes del cierre de un muelle ficticio | Llegar en tiempo, semáforos y tráfico de noche | Tomar ruta corta visible o larga discreta | Confianza Nadia, calor |
| 2 | **La lista**, Chinatown/LES | Encontrar al operador de radio | Sigilo con patrullas y señales sonoras direccionales | Difundir una muestra o mantener silencio | Evidencia publicada, reputación |
| 3 | **Muelle 4**, fachada industrial genérica junto al East River | Recuperar recibos de despacho | Maniobras en recinto delimitado y persecución que se activa con testigos | Rescatar a un conductor o asegurar todos los documentos | Salud de aliados, estado de barrera |
| 4 | **Cruce de cuentas**, Midtown | Hallar a dos intermediarios en ubicaciones diferentes | Tráfico denso y elección de ruta/tiempo | Entregar copia a inspectora o al periodista | Dos alianzas, ramificación |
| 5 | **Después de las tres**, acceso a puente (sin cruzar en MVP Manhattan) | Salir del radio de búsqueda | Interceptores y gestión de daño realista | Sacrificar el coche o arriesgar la fuente | Daño del vehículo, protección de Nadia |
| 6 | **Saldo**, regreso a Chelsea | Reunión nocturna sin combate obligatorio | Diálogo y consecuencias sistémicas | Publicar entero, filtrar nombres, negociar protección | Final A, B o C; periódicos y radio del epílogo |

**Final A (exposición completa):** prueba publicada, escándalo, fuentes en riesgo; no todo se soluciona. **Final B (proteger a los vivos):** se protege a testigos pero parte del sistema sobrevive. **Final C (negociación):** red se fragmenta, protagonista gana dinero a costa de su nombre. Los finales deben poder explicarse por elecciones observables, no por una barra secreta de moralidad.

### Núcleo de minuto a minuto
1. Leer objetivo / calle → elegir vehículo y ruta.
2. Conducir con física creíble y cámaras intercambiables sin cambiar estado.
3. Leer señales (radio, tráfico, testigos, huellas, sirenas lejanas).
4. Elegir: rapidez, discreción o asistencia a un tercero; cada una altera dinero, confianza y exposición.
5. Alcanzar destino, entrar a una escena de diálogo breve (omitable) y actualizar estado persistente.
6. Abrir el mapa para planear otra misión, no para ocultar el mundo real.

### Calor, persecución y sigilo — contrato reproducible
- `sospecha`: [0, 100], variable continua. `contactoVisual`: true/false, informado desde conos/oclusiones de patrulla, no global omniscience.
- Evento de conducción peligrosa frente a testigo: +6–16 sospecha (balance de juego).
- Choque material con daño: +10–22; daño a terceros = penalidad, **sin puntuación positiva**.
- Sin observadores y lejos del último avistamiento: -2.5/s y búsqueda por última calle conocida; no desaparecer por entrar a un garaje a 5 m del perseguidor.
- Niveles por umbral: 0 (<15), 1 (15–34), 2 (35–54), 3 (55–69), 4 (70–84), 5 (≥85). Son valores iniciales configurables que deben calibrarse contra pruebas reales.
- Las patrullas solo conocen observaciones, llamadas por radio y objetivo previsto. Una red vial desconectada significa freno/replanificación, no atajo a través de edificios.
- Escalada: 1 observación; 2 unidad de apoyo; 3 intercepción; 4 dos calles de cierre; 5 busca bloquear rutas de salida, con **máximo de 4 perseguidores activos** inicialmente para móvil.
- Perder patrulla no borra pruebas materiales; la persecución debe poder terminar sin captura y con consecuencias.
- Casi choque: distancia segura estrictamente mayor a suma de radios/2 + tolerancia, velocidad mínima, una vez por ID de vehículo; mejora boost de corta duración y **nunca elimina daño**.
- Repeticiones deterministas con semilla, registro de eventos por segundo y registro de decisiones para depurar rutas.

### Conducción
| Vehículo ficticio | Masa de diseño | Propósito | Sesgo de control |
|---|---:|---|---|
| Sedan «Vega S4» | 1.450 kg | equilibrio, pasajeros, discreción | frenado progresivo |
| Taxi «Mercury Cab» | 1.650 kg | mimetización con tráfico | radio de giro largo |
| Furgón «Dockline» | 2.200 kg | carga y resistencia | aceleración lenta, alto desgaste al chocar |
| Coupé «Noir 77» | 1.200 kg | huida corta | pierde agarre en lluvia |
| Motocicleta «Arrow» | 260 kg | cruces estrechos | vulnerabilidad elevada; no acceso a todos los objetivos |

Masas y datos son **parámetros narrativos orientativos**, no representaciones homologadas de coches reales. Ajustar coeficientes de tracción a las unidades internas de `MC.Cuerpo`; no cambiar sin regresiones existentes.

### La ciudad: tres escalas sin mentir sobre precisión
1. **Malla real de Manhattan (futura):** `geo/territorio.py` con OSM/Overture, polígonos de Manhattan para excluir costa colindante, topología de puentes y túneles, datos de elevación y atribución. El bbox por sí solo incluye otros condados y agua: **no es un filtro suficiente**.
2. **Sectores activos de 1 km:** disco alrededor del jugador con 1–3 sectores a calidad móvil, persistencia de daño/desvíos, culling y presupuesto de VBO. Descartar geometría distante y conservar cambios separados.
3. **Prototipo ilustrativo temporal:** calles dibujadas de manera esquemática para validar controles, calor, agentes y misiones; no afirmar jamás que reproduce el tráfico o trazado exacto de la ciudad.

POI ya disponibles: `contenido/nueva-york-lugares.json` contiene 50 registros de CommonPlace con coordenadas/IDs. Su campo `acceso: "por_verificar"` impide tratar garajes, muelles o edificios como accesibles sin comprobación. No son red vial ni mapa MC4.

### Dirección de arte — anti-plantilla
**Voz:** editorial negro-carbón de impresión offset, papel crema, rojo óxido, cian de vidrio lluvioso, amarillo de señalización y blanco roto. Luces urbanas plausibles; evitar neón cian-magenta de IA. Grano sutil de celulosa, **sin textura de óxido en todos los objetos**.
- Paleta principal: carbón `#182224`, marfil `#E4D9C5`, acero `#73848A`, óxido `#A84635`, sodio `#D7A15C`, vidrio `#466F79`, señal `#DDBB4B`.
- Arquitectura: ladrillo del Lower East Side, piedra alta en Midtown, docks de East River, rascacielos solo en distancias coherentes. No rascacielos idénticos en cada calle.
- Sombras: masas definidas, reflexión húmeda moderada, ventanas con patrón irregular determinista; luz real de la escena, no adornos aleatorios.
- Cámara: default 3D elevada oblicua con horizonte controlado, distancia elástica acotada; no zoom viral ni desenfoque continuo. Vista detrás opcional, mapa 2D sin distorsión para planear.
- UI: bloc de despacho: objetivo y dinero a la izquierda; calor visible en una cinta estrecha; volante táctil abajo; menú secundario; jamás tapar carriles o cruces principales.
- Logos originales con geometría propia. Nada de emblemas de fabricantes, tipografías propietarias, señas reconocibles de franquicias o copiadas de screenshots.

### Clasificación para adultos y opciones
Se propone una clasificación **18+ interna y provisional**, por crimen, explotación laboral, amenazas, lenguaje fuerte y violencia dramática. No declarar clasificación PEGI/ESRB/CERO oficial hasta pasar evaluación. Añadir selector para reducir sacudidas, destellos, audio fuerte y lenguaje; subtítulos permanentes, alto contraste y opciones de dificultad. Puede haber violencia en la narrativa, pero la historia no exige gore ni instrucciones operativas para delitos.

### Sonido
- Motor: rpm en capas, grava/asfalto/lluvia, escapes de aire y suspensión.
- Radio: emisiones originales de ficción; pistas musicales originales con licencias comprobadas. La radio cambia según el avance de la trama.
- Persecución: sirenas con posición y oclusión aproximadas, sin usar samples propietarios.
- Silencio: 3–5 segundos al revelar una traición, reduciendo música y enfatizando lluvia/habitáculo.

### Economía y equilibrio
- Tres monedas legibles: `USD` (pago/reparaciones), `favor` por facción, `exposicion` legal y mediática. Nunca cobrar con tokens opacos.
- Taller: reparaciones de motor, ruedas y carrocería; distinguir coste por tipo, no microtransacciones.
- Los premios de conducción temeraria NO superan el daño esperado. Una ruta de prudencia debe ser viable y interesante.

### Requisitos técnicos para primera versión verificable
- `juegos/getaway/index.html` se compila offline usando `node motor.mjs construir`, condicionado a que exista `ciudades/nueva_york.mc4` validado.
- Mientras no exista MC4, mantener `juegos/getaway/prototipo.html` separado y etiquetado como esquema ficticio, sin importar una ubicación real.
- Persistencia versión JSON `turnocero-v1` con estado de vehículo, misión, elecciones y sectores. Migraciones versionadas y guardado manual/exportable.
- PC: teclado y ratón; móvil: pantalla táctil ≥360 CSS px, dos controles claros y funciones primarias accesibles.
- 60 FPS objetivo sobre móvil medio, calidad dinámica; memoria y p95 medidos en dispositivo físico. **Ninguna promesa de rendimiento antes de la medición.**
- Semilla idéntica → tráfico y patrullas reproducibles bajo timestep fijo; pausa/resume sin teletransporte, acceso a objetivos por red.
- Obligatorio: 2D y 3D muestran los mismos agentes, impactos y progreso; guardados sobreviven recarga y caída del navegador.

### Entregables y propietarios
| Orden | Entrega | Responsable sugerido | Criterio |
|---|---|---|---|
| 0 | Validación final de PR Motor City 3.1.0, sin bugs críticos | mantenimiento motor | CI verde + móviles reales |
| 1 | Atlas de Manhattan + polygon clipping + muelles/puentes + licencia | Codex/Geo | MC4 verificable; coordenadas auditables |
| 2 | Slice de conducción esquemática con interfaz/arte original | ChatGPT | abre offline, reinicio, misión, persecución, PC/táctil |
| 3 | Streaming de sectores, LOD, guardado de daño | Claude + motor | carga proporcional, sin pérdida de datos |
| 4 | Modelos y atlas UV low-poly propios | Gemini/ChatGPT arte | medidas, licencias, ortografías y revisión |
| 5 | 7 misiones, decisiones, radio e IA | equipo de juego | rutas + decisiones + 3 finales reproducibles |
| 6 | Telemetría en Android/iOS real + QA de accesibilidad | Gemini + testers | logs de frame, p95, batería, calor |
| 7 | Trailer corto con metraje 100% del juego real | ChatGPT/Gemini | sin material inventado ni métricas falsas |

### Reglas de aceptación para la otra IA
1. No copiar nombres, personajes, niveles, iconografía, HUD ni assets de las 13 referencias.
2. No representar como Manhattan real la cuadrícula de un prototipo.
3. Si los edificios cargan tarde, ocultar con geometría lejana honesta, no fabricar un skyline de otra ciudad.
4. No publicar métricas de teléfono obtenidas de SwiftShader.
5. No introducir violencia gratuita: la historia respeta a habitantes y trabajadores reales.
6. La palabra **«terminado»** requiere código, build reproducible, pruebas CI, revisión visual y móviles reales.
