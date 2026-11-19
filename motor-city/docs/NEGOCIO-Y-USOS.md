# Qué se puede hacer con Motor City (además de juegos), cómo se distribuye y a quién proponérselo

> No es asesoría legal ni financiera: son ideas para explorar. Antes de vender o firmar, consúltalo con un abogado de propiedad intelectual y con un contador.

## 1. Lo que tienes en la mano
Un **motor que convierte cualquier lugar real en un mundo jugable y simulable**:
- con calles, edificios, relieve, clima, tráfico, transporte y gente;
- en un solo HTML que corre en cualquier celular;
- con ciencia verificable (física, química, biología y economía);
- y con herramientas para que **una IA arme un juego nuevo en minutos**.

Pocos proyectos juntan todo eso, y menos en español y con datos de Colombia.

## 2. Otros usos (más allá del entretenimiento)
| Uso | Para qué | Pieza del motor |
|---|---|---|
| **Educación vial y cultura ciudadana** | Simuladores de bici, peatón y conducción en la ciudad real (semáforos, clima, frenada real) | Física, tráfico, clima |
| **Turismo** | Recorridos interactivos de pueblos (Guatapé, Jardín, Santa Fe de Antioquia) y guías jugables | Craqueo de territorios, panorámica, interiores |
| **Movilidad y urbanismo** | Ver un proyecto (una ciclorruta, una línea de cable, un cambio de semáforos) antes de construirlo, con gente y tráfico simulados | Mundo MC4, redes, población, transporte |
| **Gestión del riesgo** | Escenarios de lluvia fuerte, inundación de quebradas, rutas de evacuación con la gente real del barrio | Relieve, clima, IA de rutinas, A\* |
| **Colegios y universidades** | Física, química, biología y economía «jugables»: el mismo carro con otra masa, una criatura en otro planeta, el mercado de un pueblo | Ciencia, taller, seres, economía |
| **Capacitación laboral** | Repartidores, conductores, guías y personal de estaciones: recorridos reales, tiempos y horarios | Misiones, transporte, interiores |
| **Inmobiliario y comercio** | Ver una zona con su relieve, sus edificios y su vida a cualquier hora | Vistas, día y noche |
| **Publicidad y marcas** | Minijuegos de marca en una ciudad real (sin usar marcas ajenas sin permiso) | Plantillas de juego |
| **Investigación** | Simular comportamiento de multitudes, tráfico o economía de un barrio | Población, tráfico, mercados |

## 3. Cómo se puede distribuir o vender
- **Juegos propios:**
  - los cuatro que vienen: EnCicla, El Metro, Run Scooter y Motor City/Extremo;
  - como web gratis con anuncios o patrocinio, como APK en Play Store (como ya hacen EnCicla y El Metro), o con pagos dentro del juego (vehículos, pieles, mundos).
- **Licenciar el motor:**
  - **dual**: gratis para educación y uso personal, y de pago para empresas;
  - o una **licencia comercial** por proyecto.

  Hoy el repositorio no tiene licencia declarada (por defecto, «todos los derechos reservados»). Elige una antes de abrirlo al público.
- **Mundos a la medida:** «craqueamos tu pueblo o tu ciudad». Se cobra por mundo y por juego para alcaldías, gobernaciones, oficinas de turismo, cajas de compensación y empresas.
- **Servicio de juegos con IA:** usar el motor y las plantillas para entregar juegos educativos o de marca en días, no en meses.
- **Contenido:** pieles, mundos y paquetes de música y misiones para los juegos.

**Cuidado con las licencias de los datos:**
- OpenStreetMap usa la licencia **ODbL**: se puede usar comercialmente, pero hay que **atribuir** siempre. Si redistribuyes la base de datos modificada, debe quedar con la misma licencia (los juegos como «obra producida» tienen reglas más simples).
- Overture tiene licencias por tema (ODbL y CDLA). SRTM es libre.
- La música clásica usada es de dominio público, con transcripción propia.
- **Nada de marcas ni personas reales sin permiso.** Ojo con logos como el del Metro o el de EnCicla: para usarlos comercialmente hace falta autorización de esas entidades.

## 4. A quién proponérselo (Colombia primero)
| A quién | Qué proponer |
|---|---|
| **Metro de Medellín, Área Metropolitana (EnCicla), Secretaría de Movilidad** | Juegos de cultura ciudadana. Ya tienes dos juegos sobre ellos: es la puerta natural, pero con su permiso. |
| **Alcaldías y gobernación (turismo, educación, TIC)** | Pueblos patrimonio jugables; simuladores para colegios. |
| **Ruta N, Parque Explora, Planetario, museos** | Ciencia jugable (la física, la química y la biología del motor). |
| **Universidades** (EAFIT, UdeA, UPB, Nacional, ITM) | Proyectos de investigación en movilidad, simulación y videojuegos; semilleros. |
| **MinCiencias, MinTIC, iNNpulsa** y convocatorias de **industrias creativas y economía naranja** | Fondos y becas para desarrollo de videojuegos y contenidos educativos. |
| **Cajas de compensación** (Comfama, Comfenalco) | Contenidos educativos y recreativos. |
| **Empresas de movilidad, seguros y logística** (aseguradoras, apps de reparto) | Capacitación y seguridad vial. |
| **Estudios de videojuegos** (Colombia y Latinoamérica) | Licencia del motor o coproducción. |
| **Festivales y mercados** (Colombia 4.0, BOGOTÁ Game Week u otros eventos de la industria) | Para mostrar los juegos y el motor. |

**Cómo presentarlo (en 3 minutos):**
1. Abre Mandados en el celular.
2. Craquea en vivo un pueblo que les importe (20 segundos).
3. Muéstralo en cenital, 3D y panorámica, de día y de noche, con lluvia.
4. Cierra con el modelo: lo que cuesta un juego o un mundo a la medida.

## 5. Cómo se integra a distintas propuestas
- **Un juego o una experiencia por proyecto:** plantilla, mundo del lugar, piel de la marca o la entidad, y las mecánicas que pida. Sale un HTML único: en la web de ellos, en un QR o en un APK.
- **Educación:** módulos del motor como laboratorios (por ejemplo, «diseña tu carro y mide su frenada en lluvia»), con guías para el docente.
- **Datos de ciudad:** el MC4 se puede alimentar con capas oficiales (catastro, malla vial, transporte GTFS) para estudios. La tubería ya acepta capas oficiales (`geo/oficial.py`).
- **Con otras IAs:** el repositorio trae skills, plantillas y reportes. Una IA nueva entiende el motor y aporta sin romperlo (`CONTRIBUIR.md`).
