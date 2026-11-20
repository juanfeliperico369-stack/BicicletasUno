# Resultados verificados de GitHub Actions · Motor City 3.0.1

**Fecha:** 2026-11-20. **Ejecución:** https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44750220010.

## G-H6: validación real (primera ronda)
- **Node 22:** `node motor.mjs construir` correcto. Motor 757 KB, 60 fragmentos. HTML único de Mandados 5.203 KB, mundo Medellín 8.884 KB.
- **Pruebas del núcleo:** `node motor.mjs prueba` → **129 de 129** satisfactorias, 11,7 s.
- **Revisión de atlas:** Gemini **9 atlas / 997 cuadros** y ChatGPT **6 atlas / 676 cuadros**, 0 problemas graves informados.
- **Chromium + Playwright:** `node motor.mjs prueba --navegador` → **138 de 138** satisfactorias en 68,3 s. Consola sin errores en los casos de prueba.
- **Medianas de pintura en prueba CPU 4× más lenta:** cenital 8,3 ms; ciudad 3D 10,4; maqueta 12,8; lateral 11,4; panorámica 6,2; todas bajo 40 ms. **No son mediciones de hardware móvil físico.**

## G-H12: público simulado, 20 s por perfil (primer muestreo)

| Perfil | Veredicto del bot | Llegadas | Distancia | Atascado | Choques | FPS | Errores |
|---|---|---|---:|---:|---:|---:|---|
| Sofía, 8 años | bien | 9,7 s; 10,9 s | 47,53 m | 0,4834 s (2,4 %) | 0 | 59,9 | 0 |
| Don Gilberto, 70 años | mal | ninguna en 20 s | 40,09 m | 0,2 s (1,0 %) | 0 | 59,9 | 0 |
| Valentina, 17 años | bien | 11,6 s; 12,8 s | 91,46 m | 0,2 s (1,0 %) | 0 | 59,9 | 0 |
| Mark, turista | bien | 10 s; 11,2 s | 46,50 m | 0,7666 s (3,8 %) | 1 | 59,9 | 0 |

**Interpretación:** el bot mayor no alcanzó el primer objetivo en una ventana recortada de 20 s; no se atascó, no chocó y avanzó 40 metros, por lo que no se debe declarar falla de accesibilidad sin repetir con la ventana estándar de 45 s. La niña cumple aquí el objetivo G-H24 de tiempo atascado menor de 25 % sin necesidad de modificar las ayudas de manejo; los escenarios deben repetirse en condiciones variadas.

## G-H1: capturas
Se amplió el flujo para que la siguiente ejecución de GitHub Actions corra `node motor.mjs capturas` y publique sus 14 PNG en el artefacto `motor-city-publico`. **Estas capturas aún no estaban en la primera ejecución**, y la auditoría visual G-H1 sigue sujeta a inspección.

## Limitaciones
- No se probó aún un teléfono Android/iOS físico, calor o consumo de batería (G-H9 / G-H14 / G-H16).
- No se probó simultáneamente la integración de EnCicla y El Metro; requieren migraciones en sus repositorios.
- No se corrió `npx modern-web-guidance ... legacy-scan`; tampoco se instaló ninguna skill en Antigravity (G-H12 y G-H13 incompletas).

## Nota de robustez: prueba intermitente de palomas
En la ejecución [#44755627607](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44755627607), el caso de fauna falló una vez tras 138 pruebas correctas: el test inyectó una paloma para comprobar su huida pero también llamó al sistema con delta positivo, permitiendo un nacimiento aleatorio adicional. La evidencia observada (huyen=1, llantas=22, pisadas=6, suelo barro) sugiere el spawn ocasional, no una regresión persistente del motor. Se ejecuta ese evento de huida con delta=0 en el **test**, sin modificar la física/azar de producción. La corrección se considera validada solo cuando las pruebas posteriores terminen.

## Corrección de un error introducido al editar el test
El run de CI [44757480064](https://github.com/juanfeliperico369-stack/motorcity/actions/runs/44757480064) se detuvo con ReferenceError porque el comentario de la corrección de fauna dejó accidentalmente la declaración de huyen a la derecha de // en una única línea. Se restaura su declaración como instrucción ejecutable y se mantiene el comentario al final. El test C-M26 sí alcanzó el estado aprobado antes del fallo. **Se requiere nueva corrida para afirmar el conjunto válido.**
