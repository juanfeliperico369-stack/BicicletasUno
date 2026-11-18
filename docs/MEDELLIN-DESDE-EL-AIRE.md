# Medellín desde el aire

**Fecha:** 18‑nov‑2026 · **Versión del juego:** 1.5.0.

**Pedido del autor:** «investiga a Medellín desde contenido audiovisual aéreo, mira las tomas desde arriba para que entiendas su topografía, la forma de los edificios y las casas, el ambiente… y haz los lugares importantes tal cual a las imágenes (las universidades, escuelas, alcaldía y demás)».

## 1. Qué se miró
- **Videos de dron:** se revisaron fotogramas de 12 videos aéreos de Medellín, entre ellos:
  - recorridos 4K por el valle, El Poblado y la Milla de Oro;
  - el centro y la entrada a la ciudad;
  - la Comuna 13, la Biblioteca España y Bello (El Pinar).
- **Imagen satelital:** mosaicos de unos 600 m × 600 m (0,6 m por píxel) de varios lugares:
  - la Ciudad Universitaria de la UdeA, la Nacional y su cerro El Volador, la UPB, EAFIT y la Universidad de Medellín;
  - La Alpujarra con EPM y Plaza Mayor, y el centro (Parque Berrío y el Coltejer);
  - Santo Domingo y El Poblado.

  La imagen se usó solo para mirar; no se copió al juego.
- **Lecturas:** guías y artículos sobre el paisaje del valle, el ladrillo a la vista como identidad de la ciudad y las comunas de ladera (fuentes al final).
- **Datos abiertos** de OpenStreetMap vía Overture: huellas de 693.553 edificios con nombre, clase y pisos, usos del suelo y lugares (alcaldías).

## 2. Lo que se ve desde arriba
1. **Un valle largo de sur a norte.**
   - El río y sus autopistas van por el fondo. A cada lado, las laderas suben llenas de casas hasta los bosques de las cimas.
   - Las quebradas bajan como cintas verdes entre los barrios.
2. **Ladrillo naranja casi en todo:**
   - las torres de El Poblado son de ladrillo a la vista, entre mucho árbol;
   - en las laderas, las casas son de ladrillo sin revocar con planchas grises de concreto (y algo de teja);
   - en lo plano (Laureles, Belén, Envigado) predominan la teja de barro y las terrazas;
   - muchas azoteas de edificios de ladrillo son de baldosa de barro, naranjas y no grises.
3. **El centro es más gris y denso:**
   - manzanas llenas, edificios de patio y torres de concreto y vidrio;
   - el viaducto del metro y las plazas con árboles (Berrío, Botero, San Antonio).
4. **Los campus son islas verdes.**
   - **UdeA:** bloques de teja con patio interior, una plaza central con fuente, la biblioteca cuadrada, el teatro octogonal y la zona deportiva (estadio con pista, piscina olímpica, coliseo y canchas de tenis).
   - **Nacional:** bloques claros entre árboles, al pie del cerro El Volador.
   - **UPB y EAFIT:** ladrillo entre arboledas.
5. **La Alpujarra:** dos torres de concreto con helipuerto en la azotea, junto a la Plaza de la Libertad con sus espejos de agua.
6. **Por todas partes:**
   - canchas sintéticas y placas polideportivas en los barrios;
   - piscinas en El Poblado;
   - tanques negros en las azoteas;
   - mucho verde en retiros, separadores y unidades cerradas.

## 3. Cómo se llevó al juego
| Lo que se ve | En el juego (v1.5.0) |
|---|---|
| Cada lugar importante con su forma | **Sitios reales** (`tools/geo/sitios.py` → `src/data/sitios.bin`):<br>• 1.195 sitios y 5.188 edificios con su forma real, también con patio, y su altura;<br>• 579 áreas: 101 universidades e institutos, 378 colegios, 67 hospitales y clínicas, 17 templos y 16 estadios;<br>• edificios sueltos con nombre: alcaldías, Gobernación, iglesias, bibliotecas, coliseos y terminales. |
| Techos de teja con faldones; torres con helipuerto | Techos según el lugar:<br>• teja a cuatro aguas con cumbreras precalculadas, también alrededor de los patios;<br>• dos aguas en las iglesias;<br>• helipuerto en La Alpujarra y los hospitales grandes;<br>• la aguja del Coltejer, cúpula en el Planetario y ajedrez en el Palacio de la Cultura. |
| Colores de cada campus | Estilos elegidos mirando las fotos:<br>• UdeA: teja con patio;<br>• Nacional, ITM y Pascual Bravo: claro;<br>• UPB, EAFIT y U. de Medellín: ladrillo;<br>• La Alpujarra: concreto;<br>• EPM: vidrio;<br>• Explora: rojo;<br>• Biblioteca España: oscuro;<br>• colegios: muros claros;<br>• iglesias: cal y teja. |
| Canchas, pistas y piscinas | 1.346 canchas con sus líneas (fútbol, sintética o placa polideportiva), 34 pistas atléticas y 882 piscinas. |
| Campus verdes | Dentro de cada campus, lo construido de relleno pasa a prado, con andén alrededor de cada bloque, las plazas reales y el doble de árboles. Los edificios reales son sólidos: la física coincide con el dibujo. |
| Los lugares con postal en su sitio | Cada lugar se busca por el nombre de su edificio o sitio real y se ubica sobre él; 19 pasaron a su forma real, por ejemplo:<br>• el Coltejer estaba a unos 180 m de su sitio y el Palacio de la Cultura a unos 220 m;<br>• los demás: UdeA, Nacional, EAFIT, Catedral, Terminal del Norte, Biblioteca España, Explora, MAMM, Casa de la Memoria y las iglesias de Bello, Envigado, Sabaneta, La Estrella, Barbosa, Girardota, Caldas y El Poblado.<br>Lo que sigue dibujado a mano (estadio, cerros, parques) esconde los edificios reales que caen debajo. |
| Laderas | Más plancha gris, muros de ladrillo a la vista y casas de hasta 4 pisos. |
| El Poblado, Laureles y Envigado | Torres de ladrillo (72 %), jardines entre las torres y arboledas sobre las entradas de las unidades. |
| Azoteas | Las de los edificios de ladrillo, de baldosa naranja. |
| Nombres | Las universidades, alcaldías, hospitales, coliseos, bibliotecas y terminales grandes llevan su nombre en el mapa. |

## 4. Lo que no trae el dato (y queda para después)
- **Sin forma real todavía:**
  - lugares que no aparecen con su nombre en los datos: Teatro Metropolitano, Museo de Antioquia, Hospital Marco Fidel Suárez y Terminal del Sur;
  - lugares sin templo real cerca: las iglesias de Itagüí y Copacabana.

  Por eso siguen dibujados a mano.
- **Colores:** los datos casi no traen colores de techo ni de fachada (12 de 693.553), así que se eligieron por lugar mirando las fotos.
- **Alturas:** salen de los pisos cuando el dato los trae; si no, de la clase y el tamaño del edificio.
- **El resto de la ciudad** sigue con los lotes ordenados a lo largo de cada calle (v1.4.0). Pasar todo el valle a huellas reales costaría unos 6 MB más de descarga.

## Fuentes
- [Unsplash: casas en la ladera de Medellín](https://unsplash.com/photos/buildings-and-houses-on-the-slope-of-a-hill-in-medellin-colombia-TdpGsj0A8Yg) y [paisaje urbano rodeado de montañas](https://unsplash.com/photos/medellin-cityscape-surrounded-by-mountains-2e9K5mANfWg)
- [Medellín Guru: las mejores vistas panorámicas](https://medellinguru.com/?p=8835)
- [Next City: la primavera eterna de Medellín](https://nextcity.org/features/view/medellins-eternal-spring-social-urbanism-transforms-latin-america)
- [URBAM EAFIT: Rehabitar la ladera](https://spapps-f1b6662863758a.spapps.eafit.edu.co/centros/urbam/articulos-publicaciones/Documents/urbam_eafit_rehabitar_la_ladera.pdf)
- [El Colombiano: Medellín es una ciudad anaranjada](https://www.elcolombiano.com/tendencias/medellin-es-una-ciudad-anaranjada-DE6107140)
- [Alcaldía de Medellín: fichas de valoración patrimonial](https://www.medellin.gov.co/es/wp-content/uploads/2026/09/Anexo-22_FichasValoracionC2-1.pdf)
- [ArchDaily: guía de arquitectura de Medellín](https://www.archdaily.com/882556/architecture-guide-to-medellin-20-places-that-every-architect-should-visit)
- [Noticias Caracol: el centro de Medellín con un dron de carreras](https://www.noticiascaracol.com/colombia/realizan-sorprendente-video-del-centro-de-medellin-con-un-dron-de-carreras)
- Videos de dron en YouTube, por su título:
  - «Medellin, Colombia in 4K ULTRA HD 60FPS Video by Drone» y «Medellin, Colombia 4K drone view»;
  - «Medellín Poblado / Milla de oro - 4K Dron» y «Medellin Colombia | Drone Aerial View City Center»;
  - «MEDELLÍN DESDE EL AIRE | Biblioteca España en 4K» y «VOLANDO EN DRONE 4K - COMUNA 13»;
  - «Descubre El Pinar En Bello Desde El Aire».
- Imagen satelital Esri World Imagery (solo para mirar, no se usa en el juego).

*Datos del juego: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps Foundation.*
