# Motor City en El Metro · informe de integración

Fecha: 20 de noviembre de 2026. Motor City 4.0.0, commit base `414eab371676943cf664d8a57141ae3d6a623925`. El Metro, commit base `4b1eac2fbf19e3068c5ea99ae0b0f4422a1d1fff`, rama local `codex/metro-motorcity-pulido`.

## Uso y resultado

El Metro incluye `motor-city/dist/motor.js` antes de sus propios módulos al construir el HTML único. El bundle usado coincide en SHA-256 con el de este repositorio: `cf5dc1c2048b9086fc0fa78755f213240ebc6cb2ff4d8c452567da0609b9b8d0`. Se usa `MC.Manejo.curva` con `MC.Manejo.PERFIL.pie` para ajustar la respuesta de caminar en Ciudad Libre. Se conserva la zona muerta previa del juego y la velocidad máxima. La prueba en navegador verificó los extremos 0 y 1, un valor intermedio de 0,39354 para entrada 0,5, y la carga con el navegador desconectado después de abrir el HTML.

El HTML pasó de 8.481 a 9.310 KiB al incluir el motor completo, antes de nuevas funciones. El mapa y las vistas originales de El Metro siguen siendo las fuentes activas. Tener el bundle incluido no implica migración de mapas, física o cámaras.

## Lecciones y propuestas

1. Ofrecer una compilación modular de las partes utilizadas para reducir el coste inicial de juegos móviles. La curva de manejo necesita una fracción del bundle completo.
2. Publicar contratos y pruebas de compatibilidad entre distintas escalas y orígenes de coordenadas antes de cambiar el mapa de 20 m del juego por el de 10 m del motor. Las capas de edificios y sus índices espaciales también necesitan pruebas de equivalencia.
3. Exponer un generador de carretera familiar con lugares y nombres configurables. El tramo `ruta_embalse` es generado y no representa el recorrido real ni las paradas reales Medellín–Guatapé. No debe describirse como una reproducción cartográfica.
4. Hacer explícitos en el contrato de `Planeta` los cambios asíncronos de mundo, el punto de aparición y el tiempo de gracia. Añadir pruebas de ida, regreso y pérdida o fallo de carga, incluyendo la restauración de partida.
5. Documentar el presupuesto de memoria y tiempo de generación en móviles, además de versiones de API y políticas de compatibilidad.

Este informe describe la integración comprobada y no constituye una auditoría del juego de prueba del motor.
