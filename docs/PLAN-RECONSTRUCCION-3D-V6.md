# Plan de Reconstrucción 3D v6 · Juega EnCicla («Efecto GTA · Valle de Aburrá»)

> **Plan maestro del ecosistema y bases de código ya iniciadas:** [`motorcity/docs/PLAN-RECONSTRUCCION-3D-V6.md`](https://github.com/juanfeliperico369-stack/motorcity/blob/main/docs/PLAN-RECONSTRUCCION-3D-V6.md) y [`motorcity/motor-v6/`](https://github.com/juanfeliperico369-stack/motorcity/tree/main/motor-v6).
> **Auditoría base que origina este plan:** [`docs/AUDITORIA-CRITICA-2026-11-27.md`](./AUDITORIA-CRITICA-2026-11-27.md).

---

## 1. Por qué Juega EnCicla se reconstruye desde cero sobre Motor 3D v6

La auditoría forense demostró que seguir apilando parches en `src/js/` no puede cumplir el pedido del autor:
- El juego actual tiene **100 archivos concatenados** (28 ejecutándose *después* de `99-boot.js`) y `Ride.prototype.update` envuelto **16 veces**.
- El mundo sigue siendo un **mapa 2D plano** con bloques borrosos `8 × 8` (donde la estación «Parque Explora» aparece encima de una cancha de fútbol) y **cero topografía 3D real** en las subidas y bajadas de Medellín.
- La carpeta `motor-city/` pesa **50 MB muertos** dentro de este repositorio y el juego jamás ejecuta una sola línea suya.
- El menú `Más` mantiene **13 botones zombis de cámaras** y `60-ui.js` dispara **4+ reflujos DOM por cuadro**.

Con **Motor 3D v6**, Juega EnCicla deja de ser un canvas 2D parcheado y se convierte en el **primer juego ciudadano en 3D real** montado sobre el nuevo núcleo modular compartido.

---

## 2. Qué hereda Juega EnCicla de Motor 3D v6 (desde el día 1)

| Pilar pedido por el autor | Cómo se resuelve en `motor-v6` para Juega EnCicla |
|---|---|
| **Mundo 100 % 3D con texturas detalladas** | 9 materiales PBR reales de Medellín (`asfalto`, `ladrillo_paisa`, `anden_medellin`, `concreto_skatepark`, `teja_barro`, `pasto_valle`, `fachada_vidrio`, `fachada_residencial`, `adoquin_plaza` — **114 KB total**). Nada pintado en el suelo: árboles guayacán, bancas, postes, estaciones EnCicla y ciclorrutas son geometría 3D real. |
| **Topografía y relieve real** | Malla 3D continua sobre DEM SRTM: pedalear por el valle del río (0–2 % pendiente) se siente rápido; subir hacia Provenza (+11,1 %), Cerro Nutibara (+26,8 %) o Comuna 13 (+22,4 %) exige cadencia, cambio de asistencia eléctrica y premia el descenso con velocidad real. |
| **Cámara cenital única inteligente** | Movimiento relativo a la cámara + giro **gradual automático** detrás de hacia dónde pedalea o camina el jugador + acercamiento continuo `72° → 34°` (hasta casi tercera persona) + órbita libre + *spring-arm*. Se eliminan para siempre Maqueta 2:1, Panorámica 2D y los 13 botones zombis. |
| **Arquitectura «Efecto GTA»** | **12 Zonas Hero** medidas con exactitud de Catastro/OSM (5.407 edificios reales, anchos reales de ciclorrutas de 2,5 m y avenidas de 10–24 m) + todo el resto del Valle de Aburrá navegable en edificios y barrios **genéricos procedurales** (`InstancedMesh` GPU, 0 bytes de huella). |
| **5 Skateparks 3D + Paradas de Trucos + Parkour** | Los **5 skateparks reales de Medellín** (Puente 4 Sur, Ciudad del Río, Parques del Río, Estadio y Distrito Norte) integrados en el mapa libre para bajarse de la bici, hacer **parkour** (bóvedas, trepados, *wall-runs* cortos) o cambiar a **skate/BMX** y completar las **Paradas de Trucos** que hoy estaban rotas. |
| **Escala SI estricta (`1 u = 1 m`)** | Ciclista de **1,72 m** sobre EnCicla real (**1,78 m** largo, ruedas Ø **0,66 m**) frente a motos (2,05 m), taxis amarillos (4,35 m), buses alimentadores (10,8 m), viaducto del Metro (+6,8 m) y estaciones EnCicla reales (**12 × 3,4 × 2,65 m**). |

---

## 3. Diseño de jugabilidad limpia (podando relleno, puliendo lo divertido)

En lugar de 13 oficios planos y 5 minijuegos con bugs de teclado, Juega EnCicla v6 concentra todo su diseño en **4 experiencias de alta calidad**:

1. **Paseo Libre y Turismo por el Valle (12 Zonas Hero):**
   - Cada uno de los 12 sitios turísticos del catálogo (`zonas-hero-medellin.json`) tiene su **estación EnCicla 3D real**, ruta guiada con flecha 3D en el mundo (no solo *spawn* ciego), ficha cultural breve y álbum fotográfico al llegar.
   - Bájate de la bici en cualquier momento con un botón para caminar, hacer parkour en plazoletas o entrar a los skateparks.
2. **Circuito de 5 Skateparks y Paradas de Trucos (BMX / Skate / Parkour):**
   - Ya funcional en el slice vertical [`motorcity/motor-v6/demo.html`](https://github.com/juanfeliperico369-stack/motorcity/blob/main/motor-v6/demo.html): *quarter-pipes* curvos con lanzamiento físico, *funbox*, barandas rojas de *grind*, escalas con filo amarillo y 3 paradas con combos por parque.
3. **3 Oficios Ciclistas con Física Real (en vez de 13 genéricos):**
   - **Domiciliario de Ladera:** entregas en pendientes reales (El Poblado / Ayacucho) gestionando batería eléctrica y frenada en bajada.
   - **Bici-Guía Turístico:** llevar visitantes entre 3 Zonas Hero evitando semáforos en rojo y usando la ciclorruta verde.
   - **Técnico de Estaciones EnCicla:** balancear bicis entre estaciones llenas y vacías (integrando en Fase final la **Fase F — apertura y cierre de estaciones**, solo cuando el autor dé luz verde).
4. **Modo Clásico 2D/Pixel opcional en su caja:**
   - Conserva el minijuego 2D/pixel únicamente como arcade retro en menú dedicado (cumpliendo el pedido del 25‑nov), sin contaminar jamás el mundo 3D principal ni añadir parches a `Ride`.

---

## 4. Hoja de ruta de migración (Fases en `BicicletasUno`)

| Fase | Entregable concreto en `BicicletasUno` | Criterio verificable (sin pruebas complacientes) |
|---|---|---|
| **Fase 0 (Completada)** | Diagnóstico forense, Biblia SI, 9 texturas Medellín (114 KB), catálogo de 12 Zonas Hero + 5 Skateparks y slice vertical jugable en `motorcity/motor-v6/`. | `node motor-v6/tests/verificar.mjs` en verde + `0` errores en Chrome desktop y móvil `412 × 860`. |
| **Fase 1 · Limpieza y Empaquetado Offline** | Eliminar los 50 MB muertos de `motor-city/` duplicado; consumir `motor-v6` como paquete versionado y PWA offline con *assets* binarios en caché (adiós HTML gigante de 14–30 MB). | Peso inicial descargado `< 2,5 MB`; arranque en frío `< 2,5 s` con CPU 4×. |
| **Fase 2 · Estaciones EnCicla + 4 Primeras Zonas Hero** | Montar **Puente 4 Sur**, **Ciudad del Río (MAMM)**, **Parques del Río** y **Distrito Norte (Explora/Botánico)** con todas sus estaciones EnCicla 3D reales y préstamo/devolución físico (sin estacionar encima de canchas). | Préstamo y devolución en las 4 zonas probado por navegación real (sin teletransporte); `0` edificios sobre vías o plazas. |
| **Fase 3 · 8 Zonas Hero Restantes + Relieve Completo** | Sumar Centro/Botero, Alpujarra/Luces, Estadio, Lleras/Provenza, Cerro Nutibara, Comuna 13, Ayacucho y Santo Domingo + red continua genérica del valle (`InstancedMesh`). | Recorrido continuo de 3 km a ≥ 45 FPS estables en móvil `412 × 860` sin huecos ni cuadros > 50 ms. |
| **Fase 4 · 5 Skateparks, Parkour y 3 Oficios** | Habilitar los 5 skateparks 3D con 15 Paradas de Trucos, parkour fluido y los 3 oficios pulidos; portar guardado v3 → v4 sin perder monedas ni progreso del jugador. | Bot jugable sin teletransporte completa 1 ruta turística, 1 oficio y 3 paradas de trucos; `0` solapamientos de HUD en vertical y horizontal (P10). |
| **Fase 5 · Fase F (Condicional al autor)** | Lámina interactiva de apertura y cierre de estaciones EnCicla, solo cuando el autor confirme. | Aprobación explícita del autor. |

---

## 5. Reglas de no regresión para `BicicletasUno` v6
- **Máximo 6 controles visibles en HUD** durante el pedaleo (palanca, freno/truco, salto/desmontar, timbre, acercar cámara, menú).
- **Cero reflujos DOM en el bucle 3D:** el HUD se actualiza a 6 Hz diferencialmente, nunca leyendo `offsetWidth` ni mutando estilos cada cuadro.
- **Compatibilidad de guardado:** migrador automático desde `juega_encicla_*` v3 al formato limpio v6.
- **Idioma y tono:** español de Colombia, todo público, sin logos oficiales de terceros ni nombres internos de IAs en pantalla.
