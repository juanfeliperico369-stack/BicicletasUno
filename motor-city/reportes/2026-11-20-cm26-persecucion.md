# C-M26 · Persecución jugable · Motor City 3.1.0

## Diseño
Reto optativo de 90 segundos, sin contenido gráfico violento, integrado en Mandados. Dos patrullas nacen inicialmente a distancia por detrás o de costado, nunca delante en la vista inmediata. Un piloto persigue por calles y otro intenta adelantarse (intercepción corta); ambos replanifican con MC.Manejo.rutaA y usan el cuerpo físico y los obstáculos del motor. Se renderizan con la misma lista de tráfico tanto en 2D como en 3D.

Los casi choques dan puntos y turbo breve una sola vez por vehículo, únicamente al pasar cerca y con velocidad, sin colisión. Un leve impacto temporal usa la pausa ya existente en el motor. La cámara toma la intensidad máxima de la persecución y la presión temporal de las entregas.

## Código
- Motor: `js/28-persecucion.js` (`MC.Persecucion`).
- Juego: `juegos/mandados/juego.js` (botón, tráfico, cámara, HUD, turbo).
- Pruebas: `pruebas/prueba.mjs`, test de lógica determinista.
- Contrato de versión: `js/00-nucleo.js` y `VERSION.json` → 3.1.0.

## Calidad y limitaciones
Esta es una primera versión funcional del modo, no un juego de policía completo. Faltan: persecución con cinco niveles de búsqueda reales, comportamiento de escondite, daño persistente, ajustes de dificultad accesible y pruebas visuales táctiles específicas. El rendimiento de la replanificación A* requiere medición en CPU×4 antes de ajustar número de agentes. No se toca el guardado existente del mundo ni los repositorios consumidores.

## Validación
Las comprobaciones automáticas nuevas cubren apertura, aparición fuera de 20 m, visualización, casi choque sin duplicado y cancelación; deben pasar junto con las 138 pruebas de navegador antes de fusionar la rama.

## QA E2E añadida
Se integra un escenario Chromium real con viewport móvil 412×860: entrar en Mandados, seleccionar carro, pulsar el botón «Persecución», comprobar patrullas visibles y que la interfaz no invada el área libre, cancelar con el mismo botón y verificar estado inactivo. **Este escenario debe pasar en el CI final antes de declarar el reto probado de punta a punta**.

## Corrección de accesibilidad y zona libre
La ejecución de Chromium #44758066009 mostró que el botón «Persecución», por su etiqueta larga, estiró toda la columna flotante hasta x=322 px (viewport 412), invadiendo 7–8 px la zona libre. El reto y las patrullas funcionaron, pero fallaron dos validaciones de UI. Se fija la columna con ancho responsive 48–66 px según el viewport y el texto visual se recorta con puntos suspensivos; su etiqueta ARIA completa sigue disponible. Se requiere volver a ejecutar el E2E para confirmar que los controles ya no invaden la escena.

## Corrección adicional: ruta A* desconectada
El planificador `MC.Manejo.rutaA` puede devolver solo las coordenadas de destino cuando no encuentra conexión. Una patrulla no debe usar esa línea recta a través de edificios: ahora rechaza rutas con menos de dos puntos (4 componentes), frena y reintenta en el siguiente ciclo. Se añadió una regresión con planificador que devuelve una ruta imposible. Esto es importante en Guatapé, donde se han detectado componentes viales desconectados (C-M23).
