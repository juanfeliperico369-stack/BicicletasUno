---
name: motor-city-ciencia
description: Mantener la física, la química, la biología, la economía y las matemáticas de Motor City fieles a la realidad (unidades SI, fórmulas con fuente, pruebas con valores conocidos). Úsala al tocar MC.Fis, MC.Quim, MC.Termo, MC.Seres, MC.Taller, MC.ClimaGlobal, MC.Finanzas o MC.Mercado, o al crear mecánicas que dependan de números reales.
---
# Motor City · ciencia verosímil

- **Unidades del SI** en todo (m, kg, s, N, W, J, Pa, K o °C). Las conversiones están en `MC.U`.
- **Cada fórmula lleva su nombre y su fuente en el comentario.** Por ejemplo:

  | Tema | Fórmulas |
  |---|---|
  | Atmósfera y aire | ISA; arrastre ½ρv²CdA |
  | Biología humana | Mifflin‑St Jeor, Tanaka, Froude |
  | Animales | Kleiber, Hirt 2017 |
  | Clima y confort | Magnus, Rothfusz, sensación térmica de Environment Canada |
  | Finanzas | Sistema francés, VPN y TIR |
- **Se prueba con valores conocidos** en `pruebas/prueba.mjs`. Ejemplos:
  - masa molar del agua: 18,015;
  - combustión del octano: 2 25 16 18;
  - densidad del aire a 1.500 m: 1,058;
  - frenada a 100 km/h con μ 0,8: 49,2 m.
- **Dinero en enteros (centavos):** cada transacción va por `MC.Libro` (partida doble: siempre cuadra).
- **Determinismo:** clima, trenes, semáforos, mundos generados y música salen de una semilla o de la fecha. Dos jugadores a la misma hora ven lo mismo.
- **Juego frente a realidad:** si el juego exagera algo (velocidades arcade, precios de juego), dilo en el código y en la interfaz. Los valores de referencia (salario mínimo, precios) son configurables, con su año.
