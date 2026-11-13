/* =====================================================================
   LUGARES REALES DEL VALLE DE ABURRÁ (latitud, longitud)
   Estaciones EnCicla: posiciones aproximadas por barrio mientras llega la lista oficial del equipo.
   Para corregir una estación basta con cambiar su lat/lon aquí: el juego la ubica en la acera más cercana.
   tipo: 'm' = física con anfitrión, 'a' = automática (tótem y anclajes). az = zona del Apoyo que la abre.
   ===================================================================== */
/* lugares con postal: [id, nombre, municipio, lat, lon, ancho, alto (casillas de 20 m), dibujo, dato] */
const LUGARES = [
  ['bello', 'Parque de Bello', 'Bello', 6.3376, -75.5583, 10, 9, 'iglesia', 'Bello, al norte del valle, es la tierra natal del presidente Marco Fidel Suárez.'],
  ['terminalN', 'Terminal del Norte', 'Medellín', 6.2786, -75.5710, 10, 7, 'terminal', 'Desde aquí salen buses hacia el norte y la costa. En su parqueadero duermen los camiones de Balance.'],
  ['volador', 'Cerro El Volador', 'Medellín', 6.2668, -75.5795, 14, 14, 'volador', 'Parque natural en medio de la ciudad y sitio arqueológico de los antiguos pobladores del valle.'],
  ['unal', 'Universidad Nacional', 'Medellín', 6.2610, -75.5770, 11, 8, 'campus', 'La sede Medellín de la Nacional queda al pie del Cerro El Volador.'],
  ['moravia', 'Moravia', 'Medellín', 6.2770, -75.5640, 10, 7, 'moravia', 'Antiguo basurero que la comunidad convirtió en jardines, huertas y cultura.'],
  ['botanico', 'Jardín Botánico', 'Medellín', 6.2712, -75.5640, 12, 9, 'botanico', 'Su Orquideorama es un gran techo de madera con forma de flores gigantes.'],
  ['udea', 'Ciudad Universitaria UdeA', 'Medellín', 6.2668, -75.5690, 12, 11, 'campus', 'La Universidad de Antioquia, fundada en 1803, es una de las más antiguas del país.'],
  ['explora', 'Parque Explora', 'Medellín', 6.2702, -75.5662, 9, 7, 'explora', 'Museo interactivo de ciencia con acuario; al lado está el Planetario.'],
  ['estadio', 'Estadio Atanasio Girardot', 'Medellín', 6.2566, -75.5903, 14, 12, 'estadio', 'Casa del fútbol paisa, rodeado por la Unidad Deportiva Atanasio Girardot.'],
  ['botero', 'Plaza Botero', 'Medellín', 6.2524, -75.5688, 8, 7, 'botero', '23 esculturas gigantes de Fernando Botero frente al Museo de Antioquia.'],
  ['coltejer', 'Edificio Coltejer', 'Medellín', 6.2489, -75.5672, 4, 6, 'coltejer', 'Su punta recuerda una aguja de máquina de coser: homenaje a la industria textil.'],
  ['teatro', 'Teatro Metropolitano', 'Medellín', 6.2425, -75.5752, 8, 6, 'teatro', 'Hogar de la Orquesta Filarmónica de Medellín, junto a Plaza Mayor.'],
  ['laureles', 'Primer Parque de Laureles', 'Medellín', 6.2465, -75.5923, 8, 7, 'lleras', 'Laureles tiene calles circulares y muchos árboles: ¡ideal para pedalear!'],
  ['pies', 'Parque de los Pies Descalzos', 'Medellín', 6.2447, -75.5785, 9, 7, 'pies', 'Quítate los zapatos y camina sobre arena, agua y piedras.'],
  ['luces', 'Parque de las Luces', 'Medellín', 6.2457, -75.5716, 8, 7, 'luces', 'Cientos de postes de luz que de noche iluminan la plaza.'],
  ['depot', 'Casa EnCicla', 'Medellín', 6.2314, -75.5995, 10, 7, 'depot', 'Junto al Parque de Malibú, en Belén: aquí se arman las tulas, se cargan los celulares y arranca el día.'],
  ['cerro', 'Cerro Nutibara · Pueblito Paisa', 'Medellín', 6.2372, -75.5800, 14, 14, 'cerro', 'En su cima está el Pueblito Paisa, réplica de un pueblo antioqueño.'],
  ['mamm', 'MAMM · Ciudad del Río', 'Medellín', 6.2232, -75.5735, 9, 7, 'mamm', 'El Museo de Arte Moderno ocupa una antigua siderúrgica.'],
  ['poblado', 'Parque del Poblado', 'Medellín', 6.2102, -75.5707, 9, 8, 'iglesia', 'Aquí, según la historia, comenzó el poblamiento de Medellín en 1616.'],
  ['aeropuerto', 'Aeropuerto Olaya Herrera', 'Medellín', 6.2198, -75.5905, 11, 34, 'aeropuerto', 'Aeropuerto en plena ciudad, con vuelos regionales desde 1932.'],
  ['lleras', 'Parque Lleras', 'Medellín', 6.2088, -75.5671, 7, 6, 'lleras', 'Corazón de la Zona Rosa de El Poblado.'],
  ['terminalS', 'Terminal del Sur', 'Medellín', 6.2160, -75.5862, 8, 6, 'terminal', 'Buses hacia el sur y el occidente, junto al Olaya Herrera.'],
  ['eafit', 'Universidad EAFIT', 'Medellín', 6.2003, -75.5786, 12, 10, 'campus', 'EnCicla nació en 2011 como piloto que conectaba universidades y el metro.'],
  ['envigado', 'Parque de Envigado', 'Envigado', 6.1712, -75.5869, 10, 9, 'iglesia', 'Envigado tiene su propio parque principal y estaciones EnCicla.'],
  ['itagui', 'Parque de Itagüí', 'Itagüí', 6.1719, -75.6120, 10, 9, 'iglesia', 'Itagüí es una ciudad industrial y comercial del sur del valle.'],
  ['sabaneta', 'Parque de Sabaneta', 'Sabaneta', 6.1515, -75.6164, 9, 8, 'iglesia', 'Sabaneta es el municipio más pequeño de Colombia en extensión.'],
  ['estrella', 'Parque de La Estrella', 'La Estrella', 6.1577, -75.6434, 9, 8, 'iglesia', 'La Estrella mira al valle desde el suroccidente.'],
  ['barbosa', 'Parque de Barbosa', 'Barbosa', 6.4387, -75.3330, 10, 9, 'iglesia', 'Barbosa es el municipio más al norte del Valle de Aburrá: allí llega EnCicla.'],
  ['girardota', 'Parque de Girardota', 'Girardota', 6.3778, -75.4459, 10, 9, 'iglesia', 'Girardota es famosa por la catedral del Señor Caído, destino de peregrinos.'],
  ['copacabana', 'Parque de Copacabana', 'Copacabana', 6.3487, -75.5093, 10, 9, 'iglesia', 'Copacabana, al norte del valle, es uno de los municipios más antiguos de Antioquia.'],
  ['quitasol', 'Cerro Quitasol', 'Bello', 6.3650, -75.5790, 14, 14, 'volador', 'El cerro tutelar de Bello: su silueta se ve desde casi todo el norte del valle.'],
  ['fabricato', 'Fabricato', 'Bello', 6.3262, -75.5560, 11, 8, 'mamm', 'Fábrica textil histórica de Bello: el valle fue la cuna de la industria textil del país.'],
  ['hospbello', 'Hospital Marco Fidel Suárez', 'Bello', 6.3418, -75.5630, 9, 7, 'campus', 'Edificio histórico de Bello, con patios y corredores de estilo republicano.'],
  ['otraparte', 'Casa Museo Otraparte', 'Envigado', 6.1702, -75.5812, 8, 6, 'lleras', 'Casa del escritor Fernando González, "el filósofo de Otraparte", hoy museo y café.'],
  ['ditaires', 'Parque Ditaires', 'Itagüí', 6.1803, -75.6235, 12, 9, 'botanico', 'Gran parque de Itagüí con zonas verdes, piscinas y lago.'],
  ['caldas', 'Parque de Caldas', 'Caldas', 6.0911, -75.6357, 10, 9, 'iglesia', 'Caldas es el municipio más al sur del Valle de Aburrá.'],
  ['nacimiento', 'Alto de San Miguel', 'Caldas', 6.0418, -75.6302, 14, 14, 'volador', 'Aquí, en Caldas, nace el río Medellín, que recorre todo el valle hacia el norte hasta Barbosa.'],
  ['comuna13', 'Comuna 13 · Escaleras eléctricas', 'Medellín', 6.2563, -75.6187, 11, 9, 'comuna13', 'Escaleras eléctricas al aire libre y murales de grafiti convirtieron la Comuna 13 en símbolo de transformación.'],
  ['bibespana', 'Parque Biblioteca España', 'Medellín', 6.2944, -75.5440, 11, 9, 'bibespana', 'Tres grandes "rocas" oscuras en Santo Domingo, junto al Metrocable: una biblioteca en la montaña.'],
  ['palacio', 'Palacio de la Cultura', 'Medellín', 6.2519, -75.5702, 7, 6, 'palacio', 'Edificio de estilo gótico con fachada ajedrezada en blanco y negro, junto a la Plaza Botero.'],
  ['catedral', 'Catedral Metropolitana', 'Medellín', 6.2541, -75.5636, 9, 8, 'catedral', 'Frente al Parque de Bolívar: es una de las iglesias de ladrillo más grandes del mundo.'],
  ['parquenorte', 'Parque Norte', 'Medellín', 6.2735, -75.5676, 10, 8, 'parquenorte', 'Parque de diversiones tradicional de la ciudad, con rueda de Chicago y montaña rusa.'],
  ['unidadbelen', 'Unidad Deportiva de Belén', 'Medellín', 6.2297, -75.6035, 11, 8, 'deporte', 'Canchas, coliseo y piscinas para hacer deporte en el suroccidente de Medellín.'],
  ['memoria', 'Museo Casa de la Memoria', 'Medellín', 6.2466, -75.5576, 8, 6, 'memoria', 'Museo dedicado a la memoria y la reconciliación, en el Parque Bicentenario.'],
  ['trescruces', 'Cerro de las Tres Cruces', 'Medellín', 6.2368, -75.6155, 11, 11, 'cruces', '¡Postal secreta! Desde sus tres cruces se ve todo el valle. Muchos suben a pie a hacer ejercicio.', 1]
];
/* zonas del Apoyo: [id, nombre, cuántas estaciones automáticas abre] */
const APOYO_ZONAS = [['poblado', 'Poblado', 7], ['vegas', 'Vegas', 5], ['amva', 'AMVA', 7], ['laureles', 'Laureles', 4], ['aeropuerto', 'Aeropuerto', 2],
  ['carabobo', 'Carabobo', 2], ['sabaneta', 'Sabaneta', 10], ['itagui', 'Itagüí', 10], ['envigado', 'Envigado', 13], ['bello', 'Bello', 5]];
/* estaciones: [id, nombre, municipio, lat, lon, tipo, demanda, zona del Apoyo] */
const ESTACIONES = [
  // Barbosa, Girardota, Copacabana
  ['barbosa1', 'Parque de Barbosa', 'Barbosa', 6.4380, -75.3340, 'a', 'res'], ['barbosa2', 'Barbosa Norte', 'Barbosa', 6.4430, -75.3300, 'a', 'res'],
  ['girardota1', 'Parque de Girardota', 'Girardota', 6.3770, -75.4470, 'a', 'res'], ['girardota2', 'Girardota Centro', 'Girardota', 6.3800, -75.4430, 'a', 'res'], ['girardota3', 'Girardota Sur', 'Girardota', 6.3720, -75.4490, 'a', 'res'],
  ['copa1', 'Parque de Copacabana', 'Copacabana', 6.3480, -75.5100, 'm', 'res'], ['copa2', 'Copacabana Norte', 'Copacabana', 6.3530, -75.5060, 'a', 'res'], ['copa3', 'Copacabana Calle 50', 'Copacabana', 6.3450, -75.5130, 'a', 'res'],
  // Bello
  ['niquia', 'Ciudad Niquía', 'Bello', 6.3390, -75.5420, 'a', 'res', 'bello'], ['hermosa', 'Hermosa Provincia', 'Bello', 6.3460, -75.5450, 'm', 'res'], ['fabricato', 'Fabricato', 'Bello', 6.3285, -75.5540, 'a', 'work', 'bello'],
  ['hospbello', 'Marco Fidel Suárez', 'Bello', 6.3400, -75.5610, 'm', 'mix'], ['bello', 'Parque de Bello', 'Bello', 6.3365, -75.5570, 'm', 'res'], ['bellocentro', 'Bello Centro', 'Bello', 6.3335, -75.5600, 'a', 'res', 'bello'],
  ['calle44', 'Calle 44 · Bello', 'Bello', 6.3215, -75.5585, 'a', 'mix', 'bello'], ['madera', 'Madera', 'Bello', 6.3165, -75.5535, 'a', 'mix', 'bello'],
  // Medellín norte
  ['juanes', 'Parque Juanes de la Paz', 'Medellín', 6.2960, -75.5700, 'm', 'res'], ['calle80', 'Calle 80', 'Medellín', 6.2830, -75.5735, 'a', 'mix'], ['pilarica', 'Pilarica', 'Medellín', 6.2805, -75.5845, 'm', 'res'],
  ['robledo', 'Robledo', 'Medellín', 6.2780, -75.5950, 'a', 'res'], ['pascualbravo', 'Pascual Bravo', 'Medellín', 6.2775, -75.5880, 'm', 'uni'], ['pablotobon', 'Hospital Pablo Tobón Uribe', 'Medellín', 6.2806, -75.5788, 'a', 'res'], ['unal', 'Universidad Nacional', 'Medellín', 6.2625, -75.5755, 'm', 'uni'], ['terminalN', 'Terminal del Norte', 'Medellín', 6.2795, -75.5695, 'm', 'mix'],
  ['moravia', 'Moravia', 'Medellín', 6.2760, -75.5655, 'm', 'res'], ['aranjuez', 'Aranjuez', 'Medellín', 6.2830, -75.5560, 'm', 'res'], ['botanico', 'Jardín Botánico', 'Medellín', 6.2722, -75.5625, 'a', 'mix'],
  ['universidad', 'Estación Universidad', 'Medellín', 6.2690, -75.5650, 'a', 'mix'], ['campovaldes', 'Campo Valdés', 'Medellín', 6.2790, -75.5530, 'm', 'res'], ['udea', 'Universidad de Antioquia', 'Medellín', 6.2650, -75.5690, 'm', 'uni'],
  ['manrique', 'Manrique', 'Medellín', 6.2730, -75.5500, 'a', 'res'], ['explora', 'Parque Explora', 'Medellín', 6.2712, -75.5675, 'a', 'mix'], ['prado', 'Prado', 'Medellín', 6.2575, -75.5640, 'm', 'res'],
  // Centro · La Candelaria
  ['caracas', 'Avenida Caracas', 'Medellín', 6.2540, -75.5620, 'a', 'work'], ['botero', 'Museo de Antioquia', 'Medellín', 6.2530, -75.5695, 'a', 'work', 'carabobo'], ['berrio', 'Parque Berrío', 'Medellín', 6.2502, -75.5678, 'm', 'work'],
  ['bombona', 'Bomboná', 'Medellín', 6.2478, -75.5600, 'a', 'mix'], ['junin', 'Junín', 'Medellín', 6.2470, -75.5658, 'a', 'work', 'carabobo'], ['sanantonio', 'San Antonio', 'Medellín', 6.2465, -75.5705, 'm', 'work'],
  ['sanignacio', 'San Ignacio', 'Medellín', 6.2450, -75.5640, 'a', 'work'], ['cisneros', 'Plaza Cisneros', 'Medellín', 6.2465, -75.5730, 'a', 'work', 'amva'], ['plazamayor', 'Plaza Mayor', 'Medellín', 6.2433, -75.5768, 'a', 'work', 'amva'],
  ['ayacucho', 'Ayacucho', 'Medellín', 6.2458, -75.5580, 'm', 'res'], ['alpujarra', 'La Alpujarra', 'Medellín', 6.2425, -75.5735, 'a', 'work', 'amva'], ['sandiego', 'San Diego', 'Medellín', 6.2360, -75.5650, 'm', 'mix'],
  ['parquesrio', 'Parques del Río', 'Medellín', 6.2400, -75.5790, 'a', 'mix', 'amva'], ['exposiciones', 'Exposiciones', 'Medellín', 6.2385, -75.5748, 'a', 'work', 'amva'], ['industriales', 'Industriales', 'Medellín', 6.2297, -75.5745, 'a', 'work', 'vegas'],
  ['amva', 'Área Metropolitana', 'Medellín', 6.2405, -75.5705, 'a', 'work', 'amva'], ['sanjuan', 'Avenida San Juan', 'Medellín', 6.2445, -75.5800, 'a', 'mix', 'amva'],
  // Estadio, Laureles, Calasanz, San Javier
  ['carlose', 'Carlos E. Restrepo', 'Medellín', 6.2600, -75.5800, 'm', 'uni'], ['estadio', 'Estadio', 'Medellín', 6.2545, -75.5880, 'm', 'mix'], ['calasanz', 'Calasanz', 'Medellín', 6.2620, -75.6000, 'a', 'res', 'laureles'],
  ['upb', 'UPB', 'Medellín', 6.2440, -75.5895, 'm', 'uni'], ['unidad', 'Unidad Deportiva', 'Medellín', 6.2585, -75.5925, 'a', 'mix'], ['av80', 'Avenida 80', 'Medellín', 6.2470, -75.6000, 'a', 'mix', 'laureles'],
  ['floresta', 'Floresta', 'Medellín', 6.2595, -75.5975, 'a', 'res', 'laureles'], ['sanjavier', 'San Javier', 'Medellín', 6.2555, -75.6125, 'm', 'res'], ['suramericana', 'Suramericana', 'Medellín', 6.2530, -75.5815, 'm', 'work'],
  ['laureles2', 'Segundo Parque de Laureles', 'Medellín', 6.2430, -75.5960, 'a', 'res', 'laureles'], ['laureles', 'Primer Parque de Laureles', 'Medellín', 6.2475, -75.5915, 'm', 'res'], ['av33', 'Avenida 33', 'Medellín', 6.2380, -75.5900, 'a', 'mix'],
  // Belén, Guayabal
  ['rosales', 'Rosales', 'Medellín', 6.2370, -75.6050, 'm', 'res'], ['belen', 'Parque de Belén', 'Medellín', 6.2310, -75.6040, 'a', 'res'], ['belen2', 'Belén Las Playas', 'Medellín', 6.2250, -75.5980, 'm', 'res'],
  ['aeropuerto', 'Olaya Herrera', 'Medellín', 6.2235, -75.5870, 'a', 'mix', 'aeropuerto'], ['terminalS', 'Terminal del Sur', 'Medellín', 6.2150, -75.5875, 'm', 'mix'], ['guayabal', 'Guayabal', 'Medellín', 6.2060, -75.5880, 'a', 'res', 'aeropuerto'],
  ['cristorey', 'Cristo Rey', 'Medellín', 6.1990, -75.5920, 'a', 'res'],
  // El Poblado, Ciudad del Río, Las Vegas
  ['ciudadrio', 'Ciudad del Río', 'Medellín', 6.2220, -75.5750, 'a', 'work', 'poblado'], ['castropol', 'Castropol', 'Medellín', 6.2150, -75.5700, 'a', 'mix', 'poblado'], ['poblado', 'Parque del Poblado', 'Medellín', 6.2093, -75.5717, 'm', 'work'],
  ['calle10', 'Calle 10', 'Medellín', 6.2080, -75.5745, 'a', 'work', 'poblado'], ['lleras', 'Parque Lleras', 'Medellín', 6.2095, -75.5662, 'm', 'mix'], ['manila', 'Manila', 'Medellín', 6.2040, -75.5700, 'a', 'mix', 'poblado'],
  ['provenza', 'Provenza', 'Medellín', 6.2075, -75.5650, 'a', 'mix', 'poblado'], ['oviedo', 'Oviedo', 'Medellín', 6.1990, -75.5730, 'a', 'mix', 'poblado'], ['santafe', 'Santafé', 'Medellín', 6.1965, -75.5745, 'a', 'mix', 'poblado'],
  ['monterrey', 'Monterrey', 'Medellín', 6.2160, -75.5765, 'a', 'work', 'vegas'], ['santamaria', 'Santa María de los Ángeles', 'Medellín', 6.2040, -75.5755, 'a', 'res', 'vegas'],
  ['lasvegas', 'Avenida Las Vegas', 'Medellín', 6.2000, -75.5760, 'a', 'mix', 'vegas'], ['eafit', 'EAFIT', 'Medellín', 6.1995, -75.5795, 'm', 'uni'], ['aguacatala', 'Aguacatala', 'Medellín', 6.1935, -75.5805, 'a', 'mix', 'vegas'],
  // Envigado
  ['ayura', 'Ayurá', 'Envigado', 6.1870, -75.5845, 'a', 'res', 'envigado'], ['jardines', 'Jardines', 'Envigado', 6.1830, -75.5780, 'm', 'res'], ['sanmarcos', 'San Marcos', 'Envigado', 6.1800, -75.5720, 'a', 'res', 'envigado'],
  ['zona2', 'Zona 2', 'Envigado', 6.1770, -75.5760, 'a', 'res', 'envigado'], ['alcala', 'Alcalá', 'Envigado', 6.1740, -75.5860, 'm', 'res'], ['magnolia', 'La Magnolia', 'Envigado', 6.1720, -75.5720, 'a', 'res', 'envigado'],
  ['envigadoM', 'Estación Envigado', 'Envigado', 6.1755, -75.5945, 'a', 'mix', 'envigado'], ['envigado', 'Parque de Envigado', 'Envigado', 6.1720, -75.5880, 'm', 'res'], ['milan', 'Milán-Vallejuelos', 'Envigado', 6.1680, -75.5800, 'a', 'res', 'envigado'],
  ['mesa', 'La Mesa', 'Envigado', 6.1640, -75.5760, 'a', 'res', 'envigado'], ['otraparte', 'Otraparte', 'Envigado', 6.1695, -75.5825, 'm', 'res'],
  ['portal', 'El Portal', 'Envigado', 6.1840, -75.5870, 'a', 'res', 'envigado'], ['lapaz', 'La Paz', 'Envigado', 6.1790, -75.5915, 'a', 'res', 'envigado'], ['zuniga', 'Bosques de Zúñiga', 'Envigado', 6.1890, -75.5760, 'a', 'res', 'envigado'],
  ['villagrande', 'Villagrande', 'Envigado', 6.1640, -75.5920, 'a', 'res', 'envigado'], ['obrero', 'Barrio Obrero', 'Envigado', 6.1665, -75.5850, 'a', 'res', 'envigado'], ['antillas', 'Las Antillas', 'Envigado', 6.1600, -75.5800, 'a', 'res', 'envigado'],
  // Itagüí
  ['artista', 'Parque del Artista', 'Itagüí', 6.1780, -75.6080, 'a', 'res', 'itagui'], ['simonbolivar', 'Parque Simón Bolívar', 'Itagüí', 6.1740, -75.6000, 'a', 'mix', 'itagui'], ['fatima', 'Fátima', 'Itagüí', 6.1800, -75.6150, 'a', 'res', 'itagui'],
  ['itagui', 'Parque Principal de Itagüí', 'Itagüí', 6.1710, -75.6110, 'm', 'res'], ['santacruz', 'Santa Cruz', 'Itagüí', 6.1680, -75.6050, 'm', 'res'], ['naranjos', 'Los Naranjos', 'Itagüí', 6.1640, -75.6100, 'a', 'res', 'itagui'],
  ['villapaula', 'Villa Paula', 'Itagüí', 6.1660, -75.6200, 'a', 'res', 'itagui'], ['sanpio', 'San Pío X', 'Itagüí', 6.1760, -75.6200, 'a', 'res', 'itagui'], ['ditaires', 'Ditaires', 'Itagüí', 6.1790, -75.6250, 'a', 'res', 'itagui'],
  ['pilsen', 'Pilsen', 'Itagüí', 6.1850, -75.6100, 'a', 'res', 'itagui'], ['ferrara', 'Ferrara', 'Itagüí', 6.1840, -75.6000, 'a', 'res', 'itagui'], ['moda', 'Centro de la Moda', 'Itagüí', 6.1600, -75.6030, 'a', 'work', 'itagui'],
  // Sabaneta
  ['callelarga', 'Calle Larga', 'Sabaneta', 6.1500, -75.6200, 'a', 'res', 'sabaneta'], ['sabaneta', 'Parque de Sabaneta', 'Sabaneta', 6.1520, -75.6150, 'm', 'res'], ['sabvegas', 'Sabaneta Las Vegas', 'Sabaneta', 6.1560, -75.6080, 'a', 'mix', 'sabaneta'],
  ['ancon', 'Ancón Sur', 'Sabaneta', 6.1460, -75.6260, 'a', 'res', 'sabaneta'], ['avesmaria', 'Aves María', 'Sabaneta', 6.1470, -75.6120, 'a', 'res', 'sabaneta'], ['mayorca', 'Mayorca', 'Sabaneta', 6.1600, -75.6060, 'a', 'mix', 'sabaneta'],
  ['prados', 'Prados de Sabaneta', 'Sabaneta', 6.1535, -75.6100, 'a', 'res', 'sabaneta'], ['lomitas', 'Las Lomitas', 'Sabaneta', 6.1440, -75.6080, 'a', 'res', 'sabaneta'], ['restrepo', 'Restrepo Naranjo', 'Sabaneta', 6.1490, -75.6230, 'a', 'res', 'sabaneta'],
  ['entreamigos', 'Entreamigos', 'Sabaneta', 6.1545, -75.6225, 'a', 'res', 'sabaneta'], ['doctora', 'La Doctora', 'Sabaneta', 6.1390, -75.6110, 'a', 'res', 'sabaneta'],
  // La Estrella, Caldas
  ['yarumito', 'Yarumito', 'La Estrella', 6.1600, -75.6400, 'a', 'res'], ['estrella', 'Parque de La Estrella', 'La Estrella', 6.1570, -75.6425, 'a', 'res'], ['c4ta', 'C4TA', 'Medellín', 6.2478, -75.6108, 'a', 'uni'], ['hinfantil', 'Hospital Infantil', 'Medellín', 6.2716, -75.5598, 'a', 'res'], ['sancayetano', 'San Cayetano', 'Sabaneta', 6.1529, -75.6268, 'm', 'mix'],
  ['quintas', 'Quintas de la Quinta', 'La Estrella', 6.1520, -75.6420, 'm', 'res'], ['tablaza', 'La Tablaza', 'La Estrella', 6.1300, -75.6350, 'a', 'res'],
  ['caldas', 'Parque de Caldas', 'Caldas', 6.0905, -75.6365, 'm', 'res'], ['caldas2', 'Caldas Centro', 'Caldas', 6.0950, -75.6340, 'a', 'res'], ['caldas3', 'Caldas Sur', 'Caldas', 6.0860, -75.6370, 'a', 'res']
];
/* corredores de bicicletas eléctricas (estaciones con bici asistida: la subida no frena) */
/* corredores de bicis eléctricas: 'mix' presta normales y eléctricas, 'solo' solo eléctricas. Servicio eléctrico hasta las 7 p. m.; las estaciones solo eléctricas cierran a las 8 p. m. */
const CORREDOR_E = { floresta: 'mix', c4ta: 'solo', udea: 'mix', hinfantil: 'solo', sancayetano: 'mix', estrella: 'solo', pascualbravo: 'mix', pablotobon: 'solo' };
const CORREDORES = [['floresta', 'c4ta', 'Floresta – C4TA'], ['udea', 'hinfantil', 'Universidad de Antioquia – Hospital Infantil'], ['sancayetano', 'estrella', 'San Cayetano – La Estrella'], ['pascualbravo', 'pablotobon', 'Pascual Bravo – Hospital Pablo Tobón Uribe']];
const E_HASTA = 19 * 60, E_CIERRE = 20 * 60;
/* puntos de la operación (no son postales) */
const PUNTOS = {
  casa: [6.2314, -75.5995, 'Casa EnCicla · Parque de Malibú (Belén)'], parqueadero: [6.2780, -75.5722, 'Parqueadero de la Terminal del Norte'],
  pandequeso: [6.1748, -75.5960, 'Puente Pandequeso (Estación Envigado)'], suramericana: [6.2532, -75.5826, 'Estación Suramericana'],
  campus: [6.2618, -75.5770, 'Campus de la Universidad Nacional'], taller: [6.2306, -75.6004, 'Taller y bodega EnCicla']
};
/* Metrocables: [nombre, color, [lat, lon, estación]...] (posiciones aproximadas) */
const CABLES = [
  ['Metrocable K', '#f2a900', [[6.3000, -75.5583, 'Acevedo'], [6.2958, -75.5520, 'Andalucía'], [6.2952, -75.5482, 'Popular'], [6.2942, -75.5425, 'Santo Domingo']]],
  ['Metrocable L · Arví', '#7cb342', [[6.2942, -75.5425, 'Santo Domingo'], [6.2826, -75.5030, 'Parque Arví']]],
  ['Metrocable P', '#d14b9a', [[6.3000, -75.5583, 'Acevedo'], [6.3048, -75.5658, 'SENA'], [6.3072, -75.5762, 'Doce de Octubre'], [6.3090, -75.5852, 'El Progreso']]],
  ['Metrocable J', '#e8641f', [[6.2566, -75.6136, 'San Javier'], [6.2655, -75.6152, 'Juan XXIII'], [6.2755, -75.6143, 'Vallejuelos'], [6.2810, -75.6151, 'La Aurora']]],
  ['Metrocable H', '#7a5cc4', [[6.2350, -75.5385, 'Oriente'], [6.2318, -75.5338, 'Las Torres'], [6.2290, -75.5290, 'Villa Sierra']]],
  ['Metrocable M', '#00a3a0', [[6.2400, -75.5520, 'Miraflores'], [6.2445, -75.5455, 'El Pinal'], [6.2485, -75.5390, 'Trece de Noviembre']]]
];
