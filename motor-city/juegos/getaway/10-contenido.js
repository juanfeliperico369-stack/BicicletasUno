/* =====================================================================
   TURNO CERO · contenido (trama, personajes, lugares, artefactos, vehículos y contratos)
   Juego para adultos (18+): espionaje, crimen organizado, armas de fuego, secuestro, amenazas y lenguaje fuerte.
   Canon de Codex (docs/GETAWAY-MANHATTAN-BIBLIA.md y docs/GETAWAY-ESPIONAJE-3D.md: Mara Vega, Nadia Bell,
   Isaac Ward, Noah Kim, Elena Cross, Elías Rook, la Cámara de Rutas, Dirección Argo y El Contador), ampliado por
   el autor a un planeta: Nueva York → Ruta del Atlántico → Medellín y el Valle → Autopista del Embalse → Guatapé.
   Todo es ficción: personas, empresas, bandas, cuerpos de policía y negocios son inventados; las calles y los barrios
   son reales y no se acusa de nada a lugares, instituciones ni personas reales.
   ===================================================================== */
const TC = window.TC = {};

/* ---------- personajes (ficticios) ---------- */
TC.QUIEN = {
  mara: { n: 'Mara Vega', c: '#dba65f', d: '34 años. Mecánica y conductora nocturna. Nació en Medellín, se crió en Queens. Confía en los sistemas que parecen racionales.' },
  nadia: { n: 'Nadia Bell', c: '#7fc8a9', d: 'Archivista del sindicato de conductores. Le entregó a Mara el expediente. Decide sobre sus archivos.' },
  ward: { n: 'Isaac Ward', c: '#c9c2b2', d: 'Intermediario de cargas nocturnas de Argenta Quay. Paga bien y nunca cuenta todo.' },
  noah: { n: 'Noah Kim', c: '#8fb3ff', d: 'Operador de una radio independiente. Puede difundir los documentos; teme quemar a sus fuentes.' },
  cross: { n: 'Elena Cross', c: '#e4d9c5', d: 'Inspectora de la Unidad de Tránsito (ficticia). Sus compañeros no piensan como ella.' },
  rook: { n: 'Elías Rook', c: '#75818a', d: 'Exoperador de seguridad estratégica. Aliado condicional. Sabe pelear y sabe irse.' },
  contador: { n: 'El Contador', c: '#c25542', d: 'El estratega financiero de Argo. Su cara importa menos que los sistemas de control que deja.' },
  camara: { n: 'Cámara de Rutas', c: '#9b59b6', d: 'Red de empresas de logística, política inmobiliaria y contratistas. Cobra con miedo.' },
  argo: { n: 'Dirección Argo', c: '#c25542', d: 'Célula privada de contrainteligencia. Vende vigilancia y desinformación; financia a los dos bandos.' },
  efrain: { n: 'Don Efraín', c: '#f0c27b', d: 'Mecánico de Barrio Colombia. Le enseñó a Mara a desarmar un motor a los once años.' },
  vela: { n: 'VELA', c: '#4b9aab', d: 'El comunicador cifrado (T04). Trae avisos, interferencia y mentiras.' },
  radio: { n: 'Radio', c: '#8a8578', d: '' }
};

/* ---------- lugares: calles y barrios reales; los negocios son inventados ---------- */
TC.LUGARES = {
  ny_taller: { mundo: 'nueva_york', n: 'Taller Vega (sur de Chelsea)', lat: 40.7432, lon: -74.0055, taller: true },
  ny_argenta: { mundo: 'nueva_york', n: 'Depósito de Argenta Quay (Gansevoort Street)', lat: 40.73939, lon: -74.00792 },
  ny_nadia: { mundo: 'nueva_york', n: 'Water Street con Old Slip (Lower Manhattan)', lat: 40.7040, lon: -74.0085 },
  ny_noah: { mundo: 'nueva_york', n: 'Azotea de la radio de Noah (Eldridge Street)', lat: 40.71767, lon: -73.99222 },
  ny_muelle4: { mundo: 'nueva_york', n: 'Muelle 4 de Argenta Quay (Cherry Street, East River)', lat: 40.71171, lon: -73.9849 },
  ny_harlem: { mundo: 'nueva_york', n: 'Garaje de la 145 (Harlem)', lat: 40.8240, lon: -73.9440, escondite: true },
  ny_oeste: { mundo: 'nueva_york', n: 'Parqueadero de la 30 Oeste', lat: 40.75225, lon: -74.00086, escondite: true },
  ny_les: { mundo: 'nueva_york', n: 'Garaje de Delancey (Lower East Side)', lat: 40.7185, lon: -73.9870, escondite: true },
  md_efrain: { mundo: 'medellin', n: 'Taller de Don Efraín (Barrio Colombia)', lat: 6.2265, lon: -75.5745, taller: true },
  md_lleras: { mundo: 'medellin', n: 'Parque Lleras (El Poblado)', lat: 6.2087, lon: -75.5677 },
  md_bodega: { mundo: 'medellin', n: 'Bodega 9 de Argenta Andina (Itagüí)', lat: 6.1745, lon: -75.6050 },
  md_torre: { mundo: 'medellin', n: 'Torre de Argenta Andina (El Poblado)', lat: 6.2010, lon: -75.5735 },
  md_centro: { mundo: 'medellin', n: 'Parqueadero La Playa (Centro)', lat: 6.24921, lon: -75.56502, escondite: true },
  md_bello: { mundo: 'medellin', n: 'Lavadero El Último Brillo (Bello)', lat: 6.33368, lon: -75.55846, escondite: true },
  md_envigado: { mundo: 'medellin', n: 'Garaje de la 40 Sur (Envigado)', lat: 6.16694, lon: -75.58799, escondite: true },
  gu_taller: { mundo: 'guatape', n: 'Taller Sin Nombre (Guatapé)', lat: 6.2328, lon: -75.1590, taller: true },
  gu_malecon: { mundo: 'guatape', n: 'Malecón de Guatapé', lugar: 'Malecon De Guatape' },
  gu_finca: { mundo: 'guatape', n: 'Refugio La Esperanza (escenario ficticio)', lat: 6.2301, lon: -75.1648, ficcion: true },
  gu_piedra: { mundo: 'guatape', n: 'Pie de la Piedra del Peñol', lugar: 'Guatapé Represa, Piedra Mirador' }
};

/* ---------- artefactos tácticos de 2026 (ficción de juego; cifras de balance de Codex, no aparatos reales) ---------- */
TC.ARTEFACTOS = {
  dron: { cod: 'T02', n: 'Dron Cuervo', icon: '🛸', dur: 50, alcance: 70, recarga: 18, d: 'Cámara aérea de 70 m de radio y 50 s de batería. Marca a los rivales que ve. Tu carro se queda quieto mientras vuela.' },
  cebo: { cod: 'T05', n: 'Cebo acústico', icon: '📢', cargas: 2, dur: 9, d: 'Lleva a la policía que no te ve a revisar otro punto. Dos cargas por capítulo.' },
  pulso: { cod: 'T08', n: 'Pulso de interferencia', icon: '📡', recarga: 45, d: 'Apaga 4 s al rival más cercano o al helicóptero. Sube la alerta.' },
  lente: { cod: 'T01', n: 'Lente espectral', icon: '👁️', dur: 8, recarga: 35, d: 'Filtro térmico: resalta calor y electrónica visibles durante 8 s; no atraviesa muros. Con lluvia pierde detalle.' },
  rastreador: { cod: 'T03', n: 'Rastreador Cerbero', icon: '📍', d: 'Tocas un vehículo con el tuyo y queda marcado en el mapa.' },
  acceso: { cod: 'T06', n: 'Módulo de acceso', icon: '🔓', d: 'Abre una cerradura con un ejercicio de sincronización. Consume tiempo.' },
  camara: { cod: 'T11', n: 'Cámara de bolsillo', icon: '📷', d: 'Fotos con metadatos: pruebas válidas si el ángulo se puede verificar.' },
  custodia: { cod: 'T09', n: 'Caja de custodia', icon: '🧳', d: 'Las pruebas no se pierden aunque te atrapen.' },
  vela: { cod: 'T04', n: 'Comunicador VELA', icon: '🎧', d: 'Diálogo cifrado y avisos de misión.' }
};

/* ---------- vehículos ficticios (masas de la biblia; sin marcas reales). modelo = GLB de Codex ---------- */
TC.VEHICULOS = [
  { id: 'tc_vega', largo: 4.65, ancho: 1.82, n: 'Sedán Vega S4', icon: '🚗', modelo: 'vehiculo_sedan', tipo: 'carro', masa: 1450, potenciaKW: 105, parNm: 190, cd: .31, area: 2.1, vmax: 32, color: '#1d2833', salud: 1, precio: 0, d: 'Equilibrio, pasajeros, discreción. Frenado progresivo.' },
  { id: 'tc_mercury', largo: 4.65, ancho: 1.82, n: 'Taxi Mercury Cab', icon: '🚕', modelo: 'vehiculo_taxi', tipo: 'carro', masa: 1650, potenciaKW: 95, parNm: 185, cd: .34, area: 2.2, vmax: 29, color: '#dba65f', salud: 1.15, precio: 350, d: 'Se mimetiza con el tráfico: en Nueva York te baja un nivel de búsqueda al subirte.' },
  { id: 'tc_noir', largo: 4.35, ancho: 1.8, n: 'Coupé Noir 77', icon: '🏎️', modelo: 'vehiculo_coupe', tipo: 'carro', masa: 1200, potenciaKW: 230, parNm: 360, cd: .29, area: 1.9, vmax: 43, color: '#976a54', salud: .75, precio: 1400, d: 'Huida corta. Pierde agarre en la lluvia; las reparaciones duelen.' },
  { id: 'tc_dockline', largo: 5.6, ancho: 2.08, n: 'Furgón Dockline', icon: '🚐', modelo: 'vehiculo_van', tipo: 'camion', masa: 2200, potenciaKW: 120, parNm: 320, cd: .4, area: 3.4, vmax: 27, color: '#475563', salud: 1.6, precio: 900, d: 'Carga y resistencia. Embiste como un camión; acelera lento.' },
  { id: 'tc_arrow', largo: 2.6, ancho: .8, n: 'Moto Arrow', icon: '🏍️', modelo: 'vehiculo_motocicleta', tipo: 'moto', masa: 260, potenciaKW: 45, parNm: 55, cd: .6, area: .8, vmax: 40, color: '#1d2833', salud: .45, precio: 600, d: 'Cruces estrechos. Muy vulnerable: los tiros te llegan a ti.' },
  { id: 'tc_trocha', largo: 4.9, ancho: 2.0, n: 'Camioneta de trocha', icon: '🚙', modelo: 'vehiculo_suv', tipo: 'carro', masa: 2100, potenciaKW: 160, parNm: 390, cd: .42, area: 2.8, vmax: 34, color: '#586458', salud: 1.35, precio: 1100, d: 'Para las carreteras de la nada: barro, nieve y arena.' }
];

/* ---------- la trama: cinco actos, siete misiones, un planeta ---------- */
TC.HISTORIA = [
  { cap: 1, titulo: 'Papel de ruta', acto: 'I', mundo: 'nueva_york', inicio: 'ny_taller', hora: 23.2, clima: 'lluvia',
    intro: [['radio', 'Manhattan, 2026. Llueve sobre la Décima Avenida. Los repartidores de turno cero salen cuando la ciudad se acuesta.'],
      ['mara', 'Un turno más. Un paquete, una firma, cien dólares. Y el arriendo del taller al día.'],
      ['vela', '[VELA] Encargo nuevo de Argenta Quay. Remitente: Isaac Ward. Recoger en Gansevoort Street. Pago doble por la hora.']],
    pasos: [
      { tipo: 'ir', a: 'ny_argenta', texto: 'Recoge el encargo de Isaac Ward en el depósito de Argenta Quay',
        alLlegar: { esperar: 2, texto: 'Firmando…', escena: [['ward', 'Vega. Siempre puntual. Esto va al Muelle 4 antes de las dos. No lo abra, no lo moje, no lo pierda.'], ['mara', '¿Y si lo abro?'], ['ward', 'Entonces ya no es una entrega. Es una decisión.']],
          decision: { pregunta: 'Adentro hay una hoja de rutas que no cuadra con el manifiesto. ¿Qué haces?', opciones: [
            { texto: 'Leer la hoja de rutas', rep: { nadia: 6 }, flags: { leyo: true }, evidencia: 1, respuesta: [['mara', 'Turnos que no existen. Conductores que firmaron entregas desde el hospital. Salarios que salen y no llegan…'], ['mara', 'Esto no es una ruta. Es un robo con horario.']] },
            { texto: 'Entregar tarde, sin mirar', rep: { ward: 6 }, dinero: 120, respuesta: [['mara', 'Lo que no se sabe no se puede contar.']] }] } } },
      { tipo: 'ir', a: 'ny_nadia', actor: { id: 'personaje_nadia', clip: 'idle_breath' }, texto: 'Recoge a Nadia Bell en Water Street antes de que cierre el muelle', limite: 330,
        llamada: [['nadia', '¿Mara Vega? Soy Nadia Bell, del sindicato. Usted tiene mi expediente: Ward se lo robó a mi archivo. Recójame en Water Street. Ya. Me están siguiendo.']],
        alLlegar: { escena: [['nadia', 'Gracias. Ese papel es la prueba de que Argenta Quay borra salarios de conductores y los manda a cuentas de la Cámara de Rutas.'], ['nadia', 'Y alguien más lo quiere. No son de la Cámara. Son más callados. Mire el retrovisor.']],
          heat: 2, causa: 'una camioneta sin placas avisó a la policía' } },
      { tipo: 'perder', texto: 'Piérdelos: rompe la línea de visión, usa el cebo 📢 o escóndete 🅿️',
        llamada: [['vela', '[VELA] Te buscan donde te vieron por última vez. El Cebo acústico (T05) los manda a otro lado.']],
        alFin: { decision: { pregunta: 'Nadia pregunta por dónde la llevas.', opciones: [
          { texto: 'Ruta larga y discreta', rep: { nadia: 8 }, respuesta: [['nadia', 'Gracias por no apostarme.']] },
          { texto: 'Ruta corta y visible', rep: { nadia: -4 }, dinero: 80, respuesta: [['nadia', 'Rápido no es lo mismo que seguro, Vega.']] }] } } },
      { tipo: 'ir', a: 'ny_taller', texto: 'Vuelve al Taller Vega con Nadia', maxNivel: 0, avisoNivel: 'Con la policía encima no entres al taller: piérdelos primero.',
        alLlegar: { escena: [['nadia', 'Necesito a Noah Kim. Tiene una radio en una azotea del Lower East Side. Si alguien puede publicar esto sin quemarnos, es él.'], ['mara', 'Mañana.'], ['nadia', 'No hay mañana, Mara. Esto es turno cero: lo que no hagamos hoy, lo borran antes del amanecer.']], dinero: 260, reparar: true } }
    ] },
  { cap: 2, titulo: 'La lista', acto: 'II', mundo: 'nueva_york', inicio: 'ny_taller', hora: 1.0, clima: 'nublado',
    intro: [['camara', 'Señora Vega. Somos la Cámara de Rutas. Usted tiene papeles que no le pertenecen y una pasajera que habla demasiado.'], ['camara', 'Devuelva las dos cosas antes del amanecer. O se las cobramos.'], ['mara', 'Hijueputas. Ni saben con quién se metieron.']],
    pasos: [
      { tipo: 'dron', a: 'ny_noah', texto: 'Encuentra la azotea de Noah: vuela el Dron Cuervo 🛸 sobre Eldridge Street', llamada: [['vela', '[VELA] Dron Cuervo (T02) listo: 70 m de radio, 50 s de batería. Acércate a Eldridge Street y lánzalo.']] },
      { tipo: 'ir', a: 'ny_noah', actor: { id: 'personaje_informant' }, texto: 'Ve a la azotea de Noah Kim',
        alLlegar: { escena: [['noah', 'Si publico esto, salvan los conductores o los matan a todos. Depende de quién lo lea primero.'], ['noah', 'Argenta Quay es solo la vitrina. Detrás está una cosa que se llama Dirección Argo: venden vigilancia a la policía, a la mafia y a los bancos. A todos.']],
          decision: { pregunta: '¿Noah difunde una muestra del expediente esta noche?', opciones: [
            { texto: 'Sí: una muestra, sin nombres', rep: { noah: 10, nadia: 4 }, flags: { muestra: true }, evidencia: 1, respuesta: [['noah', 'Al aire en diez minutos. Ahora sí nos van a buscar.']] },
            { texto: 'No: todavía no', rep: { noah: -3, nadia: 6 }, respuesta: [['noah', 'Entiendo. El silencio también protege. A veces.']] }] } } },
      { tipo: 'sigilo', a: 'ny_muelle4', guardias: 3, texto: 'Entra al Muelle 4 sin que te vean los guardias (o entra a las malas)',
        llamada: [['nadia', 'En el Muelle 4 guardan los recibos de despacho. Los originales. Con eso no lo pueden negar.'], ['vela', '[VELA] Lente espectral (T01): ves a los guardias a través de los contenedores.']] },
      { tipo: 'acceso', texto: 'Abre la caseta de despacho con el módulo de acceso 🔓' },
      { tipo: 'foto', a: 'ny_muelle4', texto: 'Fotografía los recibos 📷', alLlegar: { evidencia: 1,
        decision: { pregunta: 'En el contenedor hay un conductor amarrado. Si lo sacas, pierdes tiempo y la mitad de los recibos.', opciones: [
          { texto: 'Sacar al conductor', rep: { nadia: 12 }, flags: { rescate: true }, respuesta: [['radio', 'Se llama Ramón. Lleva tres días adentro. No dice nada; solo llora y te agarra la mano.']] },
          { texto: 'Asegurar todos los recibos', evidencia: 1, rep: { nadia: -8 }, respuesta: [['mara', 'Perdóname, hermano. Vuelvo por ti.'], ['radio', 'No vuelves.']] }] } } },
      { tipo: 'destruir', banda: 2, n: 2, texto: '¡La Cámara de Rutas! Saca de la vía a dos de sus camionetas', heatInicio: 1,
        llamada: [['camara', 'Le dijimos que devolviera las cosas, señora Vega. Ahora cantamos.'], ['mara', 'Vengan, malparidos. Vengan.']], alLlegar: { dinero: 320 } },
      { tipo: 'ir', a: 'ny_taller', actor: { id: 'personaje_rook_rig', clip: 'idle_breath' }, texto: 'Vuelve al taller: alguien te espera adentro', maxNivel: 0, avisoNivel: 'Piérdelos antes de entrar.',
        alLlegar: { escena: [['rook', 'Tranquila. Si quisiera matarla ya lo habría hecho. Elías Rook. Trabajé para Argo hasta que me quisieron borrar.'], ['rook', 'El dinero de los conductores no se queda aquí. Sale por contenedores hacia Urabá y se lava en Medellín, en una empresa que se llama Argenta Andina. El que firma todo es El Contador.'], ['rook', 'Si quiere a la cabeza, no la va a encontrar en Manhattan. Sáquese de aquí por el puente George Washington.']], reparar: true, dinero: 200 } }
    ] },
  { cap: 3, titulo: 'Cruce de cuentas', acto: 'III', mundo: 'nueva_york', hora: 3.4, clima: 'despejado',
    intro: [['mara', 'Medellín. Hace once años que no vuelvo. Mi mamá decía que uno vuelve a la tierra solo para que lo entierren.'], ['nadia', 'Entonces no se muera, Vega. La necesito manejando.']],
    pasos: [
      { tipo: 'viajar', a: 'medellin', texto: 'Sal de Manhattan por el puente George Washington y maneja hasta Medellín',
        llamada: [['rook', 'Dieciséis kilómetros de nada antes de la costa, luego desierto y montaña. En la nada nadie la ve. Pero Argo no necesita ver: escucha.']],
        ruta: [{ f: .3, banda: 2, aviso: 'Camionetas de la Cámara de Rutas en la carretera' }, { f: .62, heat: 3, aviso: 'Retén en la vía: alguien dio tu placa' }] },
      { tipo: 'ir', a: 'md_efrain', texto: 'Llega al taller de Don Efraín, en Barrio Colombia',
        alLlegar: { escena: [['efrain', '¡Mirá quién volvió! La Marita, toda una gringa. Bienvenida, mija. Aquí el que debe, paga, y el que sabe, calla.'], ['efrain', 'Argenta Andina tiene una torre en El Poblado y una bodega en Itagüí. Los tombos que cuidan la bodega no son tombos: son de Argo con uniforme prestado.'], ['efrain', 'Si la persiguen, métase al metro. Al metro no entran con el carro.']], reparar: true, dinero: 200 } },
      { tipo: 'ir', a: 'md_lleras', actor: { id: 'personaje_courier' }, texto: 'Encuéntrate con el primer intermediario en el Parque Lleras',
        alLlegar: { escena: [['radio', 'Un hombre gordo, de lino blanco, con dos escoltas y una cerveza que no se toma.'], ['radio', '«Yo solo muevo la plata de un lado a otro, mamita. La plata no tiene patria. Pregúntele a la bodega de Itagüí.»']], evidencia: 1, heat: 3, causa: 'uno de los escoltas llamó a la policía' } },
      { tipo: 'perder', texto: 'Piérdelos: métete al metro 🚇 en una estación, toma una EnCicla 🚲 o pinta el carro 🔧',
        llamada: [['efrain', '¡Esos son los de Argo, mija! Bájese en una estación y súbase al metro. En el metro no la siguen.']] },
      { tipo: 'sigilo', a: 'md_bodega', guardias: 4, texto: 'Entra a la Bodega 9 de Argenta Andina, en Itagüí, sin que te vean' },
      { tipo: 'foto', a: 'md_bodega', texto: 'Fotografía los servidores de la bodega 📷', alLlegar: { evidencia: 1,
        escena: [['radio', 'Una sala de servidores escondida detrás de costales de café. Nombres de conductores de Nueva York al lado de cuentas en Panamá.']],
        decision: { pregunta: '¿A quién le mandas la copia por VELA?', opciones: [
          { texto: 'A la inspectora Elena Cross', rep: { cross: 14 }, flags: { copiaCross: true }, respuesta: [['cross', 'Recibido. Si esto es lo que creo, la mitad de mi unidad está comprada. Cuídese, Vega.']] },
          { texto: 'Al periodista Noah Kim', rep: { noah: 14 }, flags: { copiaNoah: true }, respuesta: [['noah', 'Lo tengo. No lo publico hasta que usted me diga. Lo juro por mi radio.']] }] } } },
      { tipo: 'destruir', banda: 3, n: 2, texto: 'Argo te esperaba afuera: saca de la vía a dos interceptores', heatInicio: 2,
        llamada: [['argo', 'Señora Vega. Usted acaba de convertirse en un problema de seguridad nacional. Para tres naciones.']], alLlegar: { dinero: 450 } }
    ] },
  { cap: 4, titulo: 'Después de las tres', acto: 'IV', mundo: 'medellin', inicio: 'md_efrain', hora: 3.1, clima: 'lluvia',
    intro: [['contador', 'Señora Vega, soy El Contador. Le hablo con respeto porque usted tiene algo mío. Acabo de comprar a la policía de un valle entero para que la busque.'], ['contador', 'Me voy a Guatapé a esperarla. Si quiere los nombres completos, sígame. Si no, váyase. Pero váyase lejos.']],
    pasos: [
      { tipo: 'ir', a: 'md_efrain', texto: 'Donde Don Efraín: cambia a la camioneta de trocha', heatInicio: 3,
        alLlegar: { escena: [['efrain', 'Llévese la camioneta de trocha, mija: aguanta lo que le echen en esa carretera. Y tome: la vieja de su papá.'], ['radio', 'Una pistola envuelta en un trapo. Doce tiros. «Pa las llantas, no pa la gente», dice Efraín, y no la mira a los ojos.']], veh: 'tc_trocha', municion: 24, reparar: true } },
      { tipo: 'seguir', desde: 'md_torre', texto: 'El Contador sale de su torre: ponle el rastreador 📍 (tócalo con el carro) y síguelo fuera del valle', heatInicio: 4,
        llamada: [['rook', 'Ese carro negro es él. Tóquelo con el suyo: el Rastreador Cerbero se pega solo. Después, que corra lo que quiera.']] },
      { tipo: 'viajar', a: 'guatape', texto: 'Rompe el cerco por la Autopista Medellín–Bogotá y llega a Guatapé', heatInicio: 5,
        llamada: [['radio', '(Radio de la policía) Todas las unidades: camioneta con mujer sola hacia el oriente. Autorizado el uso de la fuerza.'], ['vela', '[VELA] Helicóptero encima. El Pulso de interferencia (T08) le apaga el reflector unos segundos.']],
        ruta: [{ f: .2, heat: 4, aviso: 'Siguen detrás de ti en la autopista' }, { f: .5, banda: 3, aviso: 'Interceptores de Argo bajan de la montaña' }, { f: .8, heat: 5, aviso: 'Helicóptero encima: no hay dónde esconderse' }] }
    ] },
  { cap: 5, titulo: 'Saldo', acto: 'V', mundo: 'guatape', hora: 5.3, clima: 'niebla',
    intro: [['radio', 'Guatapé al amanecer. Zócalos de colores, el embalse quieto como un espejo y la Piedra mirándolo todo.'], ['mara', 'Aquí veníamos de niñas, mi hermana y yo. Nunca pensé volver así.']],
    pasos: [
      { tipo: 'ir', a: 'gu_finca', actor: { id: 'personaje_operative' }, texto: 'Llega a la Finca La Esperanza, el refugio de El Contador (por el embalse en lancha 🚤 es más rápido)', heatInicio: 0,
        alLlegar: { escena: [['contador', 'Bienvenida. ¿Un tinto? Usted cree que esto es una película, señora Vega. Aquí nadie es bueno. Los conductores robaron horas; yo robé mejor. La diferencia es que yo pago impuestos.'], ['contador', 'Le ofrezco esto: protección para sus testigos, dos millones para usted y que nadie publique nada. O publica todo, y vemos cuántos de sus conductores llegan vivos al juicio.']],
          decision: { pregunta: 'El final empieza aquí. ¿Qué haces con el expediente?', opciones: [
            { texto: 'A · Publicar todo (exposición completa)', flags: { finA: true }, respuesta: [['mara', 'Que lo lea todo el mundo. Al mismo tiempo.'], ['contador', '¡Que no salga de la finca!']] },
            { texto: 'B · Proteger a los vivos', flags: { finB: true }, respuesta: [['mara', 'Los testigos se van conmigo, con papeles nuevos. Los nombres se quedan en una caja. Por ahora.'], ['contador', 'Una mujer práctica… con principios. Qué cosa tan cara.']] },
            { texto: 'C · Negociar (plata a cambio de tu nombre)', flags: { finC: true }, dinero: 2000, respuesta: [['contador', 'Lo sabía. Váyase lejos y no vuelva a abrir la boca.']] }] } } },
      { tipo: 'si', flag: 'finC', pasos: [{ tipo: 'final' }] },
      { tipo: 'destruir', banda: 3, n: 2, texto: 'Los hombres de El Contador te persiguen: sácalos de la vía', heatInicio: 2, llamada: [['nadia', '¡Mara, tres camionetas! ¡Están disparando!'], ['mara', 'Ya sé. Agáchate.']] },
      { tipo: 'ir', a: 'gu_piedra', texto: 'Llega al pie de la Piedra del Peñol: Noah y Elena esperan', alLlegar: { escena: [['noah', 'Llegaron. Están vivos. El carro… mejor no hablemos del carro.']] } },
      { tipo: 'final' }
    ] }
];

/* ---------- los finales de la biblia (A, B, C), explicados por lo que hiciste ---------- */
TC.FINALES = {
  A: { t: 'Final A · Exposición completa', x: 'Noah lo publicó todo a la vez, con las fotos que tomaste y los recibos que salvaste. Argenta Quay cerró en una semana; la Cámara de Rutas se partió en pedazos; Argo cambió de nombre y siguió vendiendo vigilancia. Dos de tus fuentes tuvieron que esconderse. No todo se arregla: pero ya nadie lo puede negar.' },
  A0: { t: 'Final A · Una verdad sin pruebas', x: 'Quisiste publicarlo todo, pero tenías muy pocas pruebas y nadie que las respaldara. El Contador dijo que eran documentos falsos, y los noticieros le creyeron. Mara volvió al turno cero, con una cicatriz nueva y la misma ciudad.' },
  B: { t: 'Final B · Proteger a los vivos', x: 'Los testigos están a salvo, con nombres nuevos y una casa lejos. Parte del sistema sobrevivió: los que firmaban siguen firmando. Nadia guarda la caja con los nombres; un día la abrirá. Mara maneja de noche y ya no le cobra a nadie la carrera.' },
  C: { t: 'Final C · Negociación', x: 'Dos millones en una maleta y un nombre que ya no vale nada. La red se fragmentó, pero tú también. Nadia no contesta el teléfono. Noah dice en la radio que «alguien se vendió», sin decir quién. No hace falta.' }
};
TC.final = (flags, ev) => flags.finC ? 'C' : flags.finB ? 'B' : (ev >= 3 && (flags.copiaNoah || flags.copiaCross || flags.muestra)) ? 'A' : 'A0';

/* ---------- contratos sueltos (Calle libre), en cualquier ciudad del planeta ---------- */
TC.CONTRATOS = [
  { id: 'paquete', n: 'Turno cero', tipo: 'entrega', pago: [180, 320], heat: 1, texto: 'Recoge un paquete y entrégalo. No lo abras.' },
  { id: 'sobre', n: 'Una deuda pequeña', tipo: 'entrega', pago: [220, 380], heat: 1, banda: 1, texto: 'Lleva un sobre con plata a un intermediario. Alguien más lo quiere.' },
  { id: 'fuga', n: 'Primera sirena', tipo: 'fuga', pago: [260, 420], heat: 3, texto: 'Recoge a un cliente que sale corriendo de un edificio. No preguntes.' },
  { id: 'carga', n: 'Muelle de humo', tipo: 'entrega', pago: [320, 520], heat: 2, banda: 2, texto: 'Mercancía que no está en ningún manifiesto. La Cámara la quiere de vuelta.' },
  { id: 'testigo', n: 'La fuente', tipo: 'escolta', pago: [380, 560], heat: 2, banda: 2, texto: 'Lleva a un testigo a un lugar seguro. Lo quieren callar.' },
  { id: 'cobro', n: 'No todo se cobra', tipo: 'cobro', pago: [300, 480], heat: 1, banda: 1, texto: 'Saca de la vía a los cobradores que acosan a una familia del barrio.' },
  { id: 'cerco', n: 'Puertas cerradas', tipo: 'fuga', pago: [520, 760], heat: 4, texto: 'Sal de un cerco policial con la carga intacta.' },
  { id: 'contrarreloj', n: 'Contrarreloj', tipo: 'entrega', pago: [420, 640], heat: 0, limite: 150, texto: 'Un sobre que tiene que llegar antes de que cierre un juzgado. Dos minutos y medio.' },
  { id: 'chivato', n: 'El testigo incómodo', tipo: 'escolta', pago: [450, 700], heat: 1, banda: 3, texto: 'Saca de la ciudad a un testigo que habló de más. La Cámara manda tres camionetas.' },
  { id: 'vitrina', n: 'Vitrina rota', tipo: 'fuga', pago: [600, 900], heat: 5, texto: 'Recoge a dos que acaban de romper una vitrina. Cinco sirenas desde el primer segundo.' }
];

/* ---------- la radio y la calle ---------- */
TC.RADIO = ['(Radio de la policía) Unidad 12, sospechosa en vehículo oscuro, va en contravía.', '(Radio de la policía) Solicitamos apoyo aéreo.', '(Radio) …y Argenta Quay anunció utilidades récord este trimestre.', '(Radio) Sigue la lluvia en la ciudad. Maneje con cuidado. O no.', '(Radio de la policía) Púas listas en el siguiente cruce.', '[VELA] Interferencia… …repito: no confíe en la inspectora… …', '(Radio de Noah) Esta es la radio de los que manejan de noche. Si estás oyendo, estás despierto.'];
TC.INSULTOS_BANDA = ['¡Párese, gonorrea!', '¡Le vamos a cobrar con intereses!', '¡Usted ya está muerta, Vega!', '¡Deme los papeles, malparida!', 'Cantemos, señora Vega…'];
TC.INSULTOS_MARA = ['¡Quítense, hijueputas!', 'Vengan, pues.', 'Hoy no, malparidos.', '¡Ábranse!', 'Esto no es nada, Nadia.'];
