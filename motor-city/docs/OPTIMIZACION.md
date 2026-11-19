# Optimización: que todo se sienta fluido en cualquier aparato

**Regla de oro:** **mide, luego cambia, luego vuelve a medir.**

- **Presupuesto de un cuadro:** 16,7 ms a 60 Hz y 33,3 ms a 30 Hz. El navegador también necesita su parte: deja un 15 %.
- **Dónde medir:**
  - `vistas.ms` (ms de dibujo);
  - `MC.GPU.perfil()` (qué aparato es);
  - `node motor.mjs prueba --navegador` (CPU 4× más lenta).

## 1. Lo que el motor ya hace solo
| Técnica | Dónde | Qué logra |
|---|---|---|
| **Nivel del aparato** | `MC.GPU.perfil()` y `ajustes()` | Elige escala, cuadros por segundo, calidad y si usar WebGL o el raster. |
| **Resolución dinámica** | `MC.ResDinamica` (en la 3D) | Baja píxeles antes que cuadros, con un controlador PI que no oscila. |
| **Calidad automática** | `Vistas.calidad` | Menos edificios, tráfico y detalle si el cuadro tarda. |
| **3D por software** | `MC.Raster` | Sin WebGL, o con WebGL por software, la 3D sigue andando. En Chromium sin GPU: 15–25 ms, contra 70–90 ms del WebGL por software. |
| **Losas en caché** | `MC.Losas` | El suelo se pinta una vez por pedazo de 160 m. Mientras llega la nítida, se muestra una borrosa (carga progresiva). |
| **Capas perezosas** | `MC.Mundo.capa()` | Las capas del MC4 se inflan solo cuando alguien las pide. |
| **Rejillas espaciales** | Edificios por regiones, vías por celdas, lugares por celdas de 320 m | Las consultas no recorren todo el mapa. |
| **Simulación «en grueso»** | `MC.Poblacion` | Lo lejano se simula barato. |
| **Paso fijo y tope** | `MC.Bucle` | La física no depende de los FPS; un aparato lento no entra en espiral. |
| **Pausa en segundo plano** | `MC.Bucle` | Sin pestaña visible no hay cuadros: ahorra batería. |
| **Pixel** | `Vistas.pixel` | Dibuja en un tercio de la resolución: rapidísimo y con estilo. |
| **Etiquetas limitadas** | `Vista2D.etiquetas` | Pocas, sin montarse y sin tapar el centro. |

**Cifras medidas** (Chromium, CPU 4× más lenta, 412 × 860; mediana del dibujo):

| Vista | ms |
|---|---|
| Cenital | 4,8 |
| Ciudad 3D | 10,9 |
| Maqueta | 17 |
| Lateral | 10,6 |
| Panorámica | 10,8 |

## 2. Reglas para escribir código rápido (motor y juegos)
1. **Nada de basura por cuadro.** Reutiliza arreglos y objetos; evita `map`, `filter` y `slice` en el ciclo caliente si se puede.
2. **Una sola lectura de entrada por cuadro** (`controles.leer()`) y una sola actualización de cámara.
3. **Cachea lo que no cambia:** dibujos procedurales a lienzos (`MC.Sprites.hornear`) y texto medido.
4. **Nunca `getImageData` por cuadro**, ni cambiar el tamaño del lienzo por cuadro.
5. **Recorta lo que no se ve:** cajas visibles y conos de visión (`Raster.visible`).
6. **Detalle por distancia (LOD):** lejos, cajas; cerca, ventanas. Lejos, menos gente.
7. **Un atlas en vez de cien imágenes.** Menos cambios de estado; en WebGL, menos *draw calls*.
8. **El trabajo pesado, en pedazos.** Las losas se pintan unas pocas por cuadro (`losas.trabajar(n)`). Lo que tarde se hace al cargar, con una pantalla de «armando las calles…».
9. **Limita el `devicePixelRatio` a 2** (o 1,5 en gama media): pantallas de 3× gastan 9 veces los píxeles.
10. **Prueba en un celular real de gama media.** Es el aparato que importa.

## 3. Tiempos y sensibilidades (que se sienta bien)
- **Tiempo cambiante sin romper nada:**
  - `MC.Reloj.vel` acelera el día;
  - una cámara lenta es multiplicar `dt` en la simulación, no en la entrada;
  - la física siempre en pasos fijos.
- **Sensibilidad por vehículo** (`MC.Manejo.PERFIL`):

  | Vehículo | Respuesta |
  |---|---|
  | A pie | Directa (expo 1,15) |
  | Bici | 1,35 |
  | Moto | 1,55 |
  | Carro | 1,75, con giro que baja con la velocidad |
  | Camión | 1,9 |

  Ajusta por juego: un arcade puede bajar la respuesta y uno de simulación, subirla.
- **Asistencias:** frenar en curvas, imán de calle y acelerar solo. Encendidas para empezar y apagables para expertos.
- **Cámara:**
  - resortes de 0,12–0,2 s (más rápidos se marean y más lentos se sienten «borrachos»);
  - zona muerta de 18 px;
  - FOV +16 % a alta velocidad;
  - sacudida por trauma², no por azar.
- **Respuesta inmediata:** lo que el jugador toca responde en el mismo cuadro. Las animaciones de interfaz duran 0,2–0,6 s y respetan «reducir movimiento».

## 4. Cuando algo va lento
1. `MC.GPU.perfil()`: ¿es «software» o «baja»? Entonces el raster y la escala dinámica deberían estar activos.
2. `vistas.ms` por vista: ¿cuál vista se pasa?
3. En Chrome, Rendimiento → grabar 5 s: ¿qué función domina?
4. Prueba el pixel (`vistas.pixel = true`): si mejora mucho, el cuello es de píxeles; baja la escala.
5. Si es la simulación (tráfico, gente), baja `n` o el radio.
6. Anota el caso en un reporte (`node motor.mjs reporte`) con el aparato y las cifras.

## 5. Lo que sigue (para las IAs de código)
- Redes precalculadas en el MC4 (hoy `red('rueda')` tarda ~1 s en Medellín).
- Losas en un *Worker* con `OffscreenCanvas` (sin trabar el hilo principal).
- WebGL con lotes estáticos e *instancing* para árboles y ventanas.
- Atlas único de arte por juego.
- Audio: programar notas con anticipación (ya lo hace `MC.Musica`) y bajar voces en celulares lentos.
