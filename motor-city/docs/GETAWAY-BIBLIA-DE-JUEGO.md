# Motor City · NOCHE DE COBRO: MANHATTAN
## Biblia de juego 0.1 · Relevo para la siguiente IA

**Estado:** preproducción jugable. **Género:** thriller criminal de conducción, persecución y mundo persistente. **Público interno objetivo:** adultos (18+), clasificación comercial por determinar en la revisión de contenido. **Plataformas:** Android, iOS, PC, web offline. **Base:** Motor City 3.1.0; sin licencia del juego definida todavía por el titular.

> **Promesa:** Manhattan no es un fondo de pantalla; las calles, la hora, la reputación, las relaciones y las consecuencias alteran realmente tus oportunidades. El protagonista no “gana” por destruir la ciudad: gana o pierde porque sus decisiones dejan huella.

## 0. Límites honestos de esta entrega

El mundo Manhattan **todavía no ha sido compilado y medido como MC4**. La ciudad base deberá venir de datos geográficos reales, nunca de una cuadrícula dibujada a ojo. El proyecto cuenta con `geo/territorio.py` y 50 puntos oficiales de NYC en `contenido/nueva-york-lugares.json`; no cuenta con toda la red transitable ya probada. Esta biblia y el paquete de arte son originales y no contienen texturas de los 13 juegos de referencia.

La referencia anterior `docs/PROXIMO-NUEVA-YORK.md` contemplaba un Getaway para todo público. **El autor cambió la intención: este spinoff es adulto.** Se mantiene Motor City como plataforma genérica, adaptable a edades; la violencia, el lenguaje y los temas criminales pertenecen a este juego aislado, no se habilitan en Mandados, EnCicla o MetroZero.

## 1. Identidad

- **Título de trabajo:** *Noche de Cobro: Manhattan* (provisional; verificar registro comercial).
- **Gancho:** Cada cobro es una deuda moral: una cifra, una persona y un barrio distinto.
- **Año:** contemporáneo ficticio, sin afirmar reconstrucción histórica. Entorno urbano moderno; la dirección artística emplea ecos de imprenta criminal y fotografía nocturna sin reproducir carteles de épocas exactas.
- **Tono:** noir social, dramático, tenso, urbano; violencia con peso narrativo, no celebración permanente de la brutalidad.
- **Ángulo de cámara:** perspectiva oblicua isométrica manipulable, cámara trasera al acelerar, minimapa limpio en 2D; mundo 3D único MC4.
- **Escala emocional:** bajo los rascacielos también viven gente común, comercios, repartidores, trabajadores y barrios sensibles a las consecuencias.

### Lo que NO es
No es un port de GTA, ni de PAKO ni de un juego policial; no es multiplayer P2W; no es un simulador preciso de organizaciones delictivas reales; no es una recreación certificada de Manhattan en 2000; no es una prueba de destrucción total. Los grupos, marcas, personajes y operaciones de la ficción serán **inventados**.

## 2. Trama: «el libro que nadie quería pagar»

La protagonista **Mara Vélez**, ex conductora de una cooperativa de mensajería, regresa a Manhattan después de que su hermano aparezca vinculado a una red de desvío de fondos de una empresa logística ficticia, **North Quay Freight**. Una entrega de rutina le deja un libro contable cifrado —**el Libro Gris**— que compromete a ejecutivos, intermediarios y una organización de cobro clandestina. La trama es de suspenso y decisiones morales, no un manual de delito.

El jugador comienza endeudado, con un sedán deteriorado y un taller prestado. Los encargos de escape y transporte ofrecen dinero y favores, pero cada trabajo modifica confianza, riesgo y acceso a zonas. La meta final no es solo escapar de la policía: elegir qué hacer con pruebas capaces de salvar o destruir a otras personas.

### Personajes (todos ficticios)
| Personaje | Papel | Deseo / contradicción | Evolución |
|---|---|---|---|
| Mara Vélez | Protagonista, conductora | Encontrar a su hermano; se niega a abandonar a quienes la ayudaron | Puede exponer, negociar o destruir el libro |
| Odessa King | Mecánica del taller | Proteger a su equipo y evitar que el barrio se convierta en campo de batalla | Se abre o se distancia según el daño civil |
| Noor Sayegh | Auditora / informante | Publicar hechos comprobables; teme que los inocentes paguen por ello | Recompensa a quien evita daños |
| Elias Ward | Investigador de seguros | Reconstruir los hechos, mantener su carrera | Puede hacer de aliado incómodo |
| Gabriel Vale | Jefe de North Quay Freight | Mantener su imperio logístico y apariencia legal | Antagonista corporativo, sin vínculo con empresas reales |
| «El Coro» | Sindicato clandestino ficticio | Cobrar lo que les prometieron | Facción cambiante; no romantizar violencia |

### Cinco capítulos
1. **La entrega:** un paquete equivocado, huida corta por calles locales, presentación del taller. Un objetivo y tres rutas; no tiroteos.
2. **El peaje:** cadena de favores por barrios; primeras consecuencias de reputación; la policía ya recuerda el vehículo.
3. **Los nombres:** el Libro Gris conecta a un contacto con un aliado. El jugador debe rescatar pruebas o salvar una relación.
4. **La ciudad cercada:** persecución multizonal y bloqueo de accesos, pero las patrullas actúan sobre la red vial y no se teletransportan.
5. **La cuenta final:** entregar pruebas a investigación, pactar silencio con un alto costo o quemar vínculos y marcharse. Tres finales determinados por estados comprobables, no por elecciones arbitrarias en una pantalla final.

### Escena tipo de 30 segundos
05 s: llamada breve al entrar al vehículo, sin bloquear el volante. 10 s: el jugador toma una decisión de ruta. 10 s: aparece un testigo o una patrulla que conoce el coche. 05 s: nueva información altera el objetivo; la interfaz comunica la consecuencia y vuelve al silencio. Una misión bien editada no necesita que hablen cinco personajes a la vez.

## 3. Mundo y distritos

**Fase vertical inicial:** área jugable limitada a Lower Manhattan / Chinatown / Two Bridges, delimitada por un polígono GIS verificable, no un rectángulo inventado. Se modelan primero corredores, semáforos, puentes/ramales importantes y 8–12 hitos contrastados.

**Despliegue posterior:** Financial District; Lower East Side y East Village; SoHo/Tribeca; Chelsea/Flatiron; Midtown; Upper West y Upper East; Harlem/Washington Heights. Los límites narrativos pueden usar polígonos de trabajo propios, pero se etiquetan como distritos **del juego**, no límites administrativos de NYC.

**Zonas difíciles:** islas, autopistas elevadas, entradas a túneles, puentes de uno o varios niveles, vías de servicio y Manhattan aislada del resto del sistema. Se requiere `nivel_z`, dirección y conectividad. Un puente no puede conectarse a una calle 15 m más abajo.

**Hitos:** el catálogo `contenido/nueva-york-lugares.json` aporta 50 registros con coordenadas y `acceso: por_verificar`; son referencia para reconocimiento urbano, no misiones ni garajes utilizables sin revisar. **No asignar asaltos o daño a memoriales reales ni lugares sensibles.** Garajes y safehouses narrativos serán locales ficticios sin direcciones de establecimientos reales.

### Fuentes y construcción
- `geo/territorio.py` puede producir MC4 desde Overture/SRTM, aunque **el bbox es sólo un filtro, no el polígono de Manhattan**.
- Complementar con NYC CSCL/LION para nodos de tráfico, sentido vial, semáforos y puentes; NYC Building Footprints/height_roof para alturas cuando estén disponibles y de licencia aceptable.
- Validar la integridad del cruce Overture/NYC, proyección de coordenadas, ID de calles, direcciones y alturas.
- No descargar datasets completos durante el juego. Todo queda empaquetado en `datos/nueva_york/sectores/` con manifest y checksums, por fragmentos de 512–1024 m.
- `MC.GuardadoSectores` sólo almacena cambios del mundo (guardias, señales, coches, eventos), no duplica cada edificio y calle originales.
- Fuera del radio de cámara: simulación de facciones a 1 Hz; vehículos/civiles cercanos a 20–60 Hz.
- Región fuera de Manhattan: **enlace de carreteras no jugable** en la vertical inicial; sin prometer planeta redondo ni cuatro estados vecinos todavía.

## 4. Bucle de 90 segundos (primera experiencia)

1. Recibes una llamada de Odessa en el taller. Elige aceptar ahora o revisar el mapa.
2. Conduce al punto de recogida —con tres trayectos de longitud similar—, en un mundo con tráfico y luces.
3. Una decisión genera un cambio (arriesgar tiempo para salvar a un peatón, o evitar el conflicto).
4. Persecución de 20–50 s: los rivales toman la misma red de calles, se comunican y buscan cortar el paso.
5. Entrega, posible captura, huida o aborto. La deuda, el daño del vehículo y la confianza quedan persistidos.
6. En el taller cambias una pieza física; vuelve a la calle. Ningún anuncio, captcha ni login.

## 5. Sistemas esenciales

### 5.1 Conducción semiarcade con peso
`MC.Cuerpo` sigue siendo el origen físico. El jugador sólo manda dirección, aceleración, freno y freno de mano; la masa, agarre, par motor y daño se transforman en fuerzas/respuesta. Parámetros iniciales **de balance, no mediciones**:
- Sedán común: masa 1.450 kg, 0–100 km/h en 11 s (objetivo de diseño), frenada 6.2 m/s², agarre alto, radio de giro medio.
- Taxi ficticio: masa 1.650 kg, centro de masa alto, velocidad menor, resistencia al daño buena.
- Furgón de carga: masa 2.500 kg, aceleración lenta, carga alta, giro amplio.
- Moto: masa 230 kg con conductor, vulnerable, maniobrable, muy poco equipaje.
- Coupé ligero: masa 1.150 kg, motor fuerte, derrapes posibles, reparaciones caras.
Sin marcas reales ni usar nombres de fabricantes protegidos. No prometer simulación automotriz de ingeniería: debe sentirse consistente, divertido y predecible.

### 5.2 Intensidad de búsqueda, 0–5
La variable `heat` no es el número de enemigos. Se calcula de forma interpretable: `heat = clamp(heat + evento.gravedad * testigos * visibilidad - (tiempoSinContacto * disipacion), 0, 100)`.
| Nivel | Umbral sugerido | Comportamiento |
|---|---:|---|
| 0 | 0–9 | Nadie busca activamente al jugador |
| 1 | 10–24 | Alerta de una patrulla en zona |
| 2 | 25–44 | Dos patrullas, colaboración local |
| 3 | 45–64 | Bloqueos de accesos externos visibles con antelación |
| 4 | 65–84 | Varios distritos coordinados; rutas de salida vigiladas |
| 5 | 85–100 | Cierre estratégico de vías y helicóptero simbólico lejano, LOD bajo |

**Invariantes:** ningún perseguidor nace en el campo visual a menos de distancia segura; si no hay ruta A*, frena y replantea; patrullas no se cuentan si están más allá del presupuesto; perder línea de visión y testigos permite bajar intensidad. Los cambios de heat se muestran con microtexto («+alerta: testigo»), sin lluvia de notificaciones.

### 5.3 Facciones, economía y elecciones
Facciones ficticias: Taller del Muelle (red de ayuda), North Quay Freight (poder logístico), El Coro (cobro clandestino), Oficina de Garantías (investigación) y Vecindarios (confianza social). Cada una posee `relacion∈[-100,100]`, `influencia∈[0,100]` y `rumor∈[0,1]`; el progreso nunca necesita simular millones de personas.

**Economía de la vertical:** inicio $380 ficticios; reparación ligera $60–130; combustible abstracto $8–25/misión; recompensa corta $180–420; reparación grave $300–800; taller mejora de agarre $620. Todas son cantidades **en moneda del juego, no valores reales de NYC**.

`pagoNeto = recompensa + bonoObjetivo - reparaciones - multasFicticias - costoOperativo`.
Antes de aceptar contrato, mostrar rango probable del pago; el jugador nunca debe acabar en deuda permanente por una misión obligatoria. Si quiebra, el taller ofrece un encargo legal de rescate financiero. Los daños a civiles reducen confianza, no multiplican puntos.

### 5.4 Misión de sigilo adulto
Los sistemas narrativos admiten amenazas, chantaje, traición, lenguaje fuerte y decisiones éticas. El combate físico a pie es **opcional y posterior**; la primera vertical no requiere armas. Si se incluye en una versión posterior, se diseña con límites de violencia visual y opciones de escape, nunca como recompensa automática por víctimas civiles.

### 5.5 Ritmo e información
- El volante/juego usa máx. 20–25 % del ancho de pantalla para botones; punteros HUD no deben tapar calle.
- Un único objetivo principal en pantalla; secundaria en mapa/diario.
- Cámara aproxima al detenerse, aleja al correr, evita sacudidas nauseabundas; reducción de movimiento y flashing opcional.
- Dificultad ajustable para conducción asistida; la nota de contenido adulto se gestiona en el **juego**, no global al motor.
- Mapa táctico congelable para accesibilidad; no pausa injusta de IA si el diseño la necesita.

## 6. Arquitectura de motor (contratos)

```text
geo/territorio.py              → datos/nueva_york/mundo.mc4 (¡aún por construir!)
contenido/nueva-york-lugares   → POIs reales; solo reconocimiento
juegos/getaway/contenido/      → misiones/facciones/vehículos 100 % ficticios
MC.Mundo                        → geometría, relieve, calles, sentido de vía
MC.GuardadoSectores              → cambios y persistencia de sectores
MC.Cuerpo                        → todos los vehículos y actores físicos
MC.Manejo                        → enrutamiento y dirección A* por carretera
MC.Persecucion                   → base de las patrullas, expandir sin duplicar
MC.Camara / VistaGL / Vista2D     → el MISMO mundo, diferentes cámaras
Juego.getaway                    → narrativa, contratos, economía, HUD y guardado
```

**Nunca importar Guatapé como una textura que se parezca a Manhattan.** Los productos compartidos deben consumir la API MC, no copiar módulos locales sin test. Mantener `MC.version`, no alterar `js/valle.js` legado, etiquetar cada nuevo serializador con `schema_version`.

Ejemplo de evento:
```json
{"type":"wanted.event","schema":1,"world":"nueva_york","t":1125.2,"actor":"player",
 "payload":{"cause":"witness","severity":12,"district":"lower-manhattan","visible":true}}
```
El JSON de evento es un **contrato propuesto**, no una API ya implementada.

## 7. Arte original: Manhattan de materia, no de neón genérico

### Materiales
Ladrillo marrón envejecido, piedra caliza clara, barandas de hierro, asfaltos fríos, luces ámbar de tienda, reflejo de lluvia con baja saturación, bruma de río y azoteas con tanques de agua. La noche puede ser oscura y legible a la vez. Se toma de la arquitectura urbana real (no de capturas de videojuegos).

### Sistema gráfico
- Paleta estrecha de 10–12 colores base y dos de peligro. Luces de policía azul/rojo sólo como señal contextual.
- Rejilla de 8 px en interfaz; tipografía de sistema (mecánica moderna), números tabulares y serif para capítulos, sin estampas neón ni brillos de interface “generada por IA”.
- Edificios modulares: 3 alturas básicas, 6 fachadas, 4 remates, 2 azoteas, 2 toldos, 3 accesos, 2 tamaños de ventana.
- Vehículos: 5 familias, sprites ortográficos de arriba y piezas independientes (chasis, cristales, luces, sombras), escalados de acuerdo con `MC.Cuerpo`.
- Proporción: 1 m = 32 unidades de atlas **para referencia**, no proporción física de pantalla; cada colisión se define en metros y no por el dibujo.

### Escenas que un artista debe dibujar primero
1. Cruce de dos calles bajo la lluvia, taxi, señal de paso y tráfico (interfaz sin clutter).
2. Frente de bodega ficticia y taller de Odessa junto al río (sin dirección real).
3. Vista cenital realista de un cruce con semáforo y paso de cebra.
4. Una persecución nocturna controlable: un coche negro, una patrulla, un peatón que debe permanecer seguro.
5. Una captura del modo mapa con altura, pasos elevados y sentidos de vía visibles.

### Música y sonido
Producir composiciones originales con tensión lenta (percusión seca, bajo sintético, textura de radio AM ficticia y sonidos de motor de propia licencia). No usar samples no autorizados, riffs o logos acústicos de GTA/PAKO. Entre actos, permitir silencio: en una ciudad grande el ambiente también es música.

## 8. Alcance acotado de vertical slice (no «todo Manhattan» de una vez)

**Entregable mínimo comprobable:**
- área geográfica auténtica de ~1–2 km² y calles reales (sin atravesar manzanas);
- un jugador y dos vehículos seleccionables (sedán/taxi);
- control móvil y PC, freno + mano y un HUD legible;
- una misión completa de 3–6 min, con elección y consecuencia;
- 2 niveles de persecución reales que empiecen/terminen;
- entrada al taller, dos reparaciones, saldo y un guardado estable;
- una cámara jugable y un mapa claro; lluvia, noche y tráfico a escala;
- modo sin internet **tras empaquetar**; tests Node/Chromium y capturas reales.

**Fuera de alcance por ahora:** planeta redondo, multiplayer, combate a pie complejo, cincuenta misiones, 8 puentes, decoración de toda la isla, daños de rascacielos, interfaz con 20 botones, mundo completo de 2026 y animaciones cinematográficas de 10 min.

## 9. Entregas por fases con puertas de calidad

| Fase | Código / datos | Aceptación objetiva |
|---|---|---|
| G0 · Validación | descarga real y licencia de fuentes; recorte geográfico | 100 % objetos con fuente, unit CRS y prueba de proyección |
| G1 · Una manzana | MC4 geográfico; colisiones y carriles | no cruza edificios, 20 cruces correctos en mapa real |
| G2 · Conducción | 2 vehículos y control móvil | arranque, frenada, giro y giro cerrado repetibles |
| G3 · Persecución | MC.Persecucion 2–3 rivales + detección | patrulla no aparece ante cámara ni atraviesa manzana |
| G4 · Historia | 1 misión, 3 NPC y una decisión | restaurar guardado reproduce la misma bifurcación |
| G5 · Arte | módulos SVG→atlas bajo licencia | todos los assets a escala, sin copias ni placeholders en vista final |
| G6 · Rendimiento | sectores y LOD | p95 objetivo menor de 33 ms en Android medio (30 FPS); 60 FPS aspiracional |
| G7 · Revisión adulta | seguridad narrativa, ratings, accesibilidad | opciones de reducción de flashes, subtítulos y contenido explicadas |

**Puerta de salida:** sin G1 no se puede afirmar «Nueva York real jugable»; sin G6 no se puede afirmar «fluido en móviles»; sin revisar contenido/ratings no se puede publicar como 18+ certificado.

## 10. Lista para otra IA

- [ ] Lee `docs/GETAWAY-13-REFERENCIAS.md`, `docs/GETAWAY-DATOS-Y-ETAPAS.md`, esta biblia y `docs/PROXIMO-NUEVA-YORK.md`.
- [ ] Mira el contrato de `MC.Mundo`, `MC.Cuerpo`, `MC.Persecucion`, `MC.GuardadoSectores`.
- [ ] Ejecuta `node motor.mjs prueba --navegador` y guarda los resultados **antes** de modificar.
- [ ] Importa una muestra auténtica de NYC con el generador existente; compara geometría contra el GIS municipal.
- [ ] Añade a `juegos/getaway/` sólo el código de misión/vehículo/diálogo. **No dupliques el motor**.
- [ ] Integra el arte SVG original y sus metadatos de tamaño/ancla sin deformar las colisiones.
- [ ] No des como «hecho» la prueba física que no corriste. Publica en rama con PR y reportes verificables.

**Mensaje al equipo:** «Que Manhattan sea adulta por su complejidad, no por la cantidad de sangre. Primero una ciudad que responda; después una historia que duela». 
