# C-M25 · Rediseño editorial de la portada de Motor City

**Fecha:** 20 de noviembre de 2026 · **Rama:** `claude/motor-city-engine-xu7p4y`

## Hallazgo
La portada previa tenía dos fondos radiales púrpura/cian, titular con degradado neón, fichas con «pill» y tres tarjetas elevadas. Chocaba con la propia regla `motor-city-diseno-ui` de evitar una apariencia genérica de IA.

## Cambio realizado
- Portada con identidad editorial y referencias cromáticas sobrias a la pintura y arquitectura de Antioquia: papel cálido, verde oscuro, ladrillo, azul gris y una única franja geométrica; sin fotos fingidas ni ilustraciones generadas que aparenten ser capturas.
- Una sola acción principal, **Jugar Mandados**, con enlace a la construcción real; el banco de pruebas queda secundario.
- Fuente de sistema y Georgia (instaladas en dispositivos comunes), sin solicitudes externas.
- Declaración honesta de prototipo; datos de atribución conservados.
- Diseño semántico, enlace «Saltar al contenido», foco visible, blancos táctiles amplios, soporte para movimiento reducido, versión móvil estrecha y escritorio.
- No se inventaron FPS, testimonios, premios ni características aún no publicadas.

## Verificación incorporada
`node pruebas/portada.mjs` usa Chromium real con cuatro tamaños (320×640, 412×860, 860×412, 1440×900) y comprueba:
1. No hay desplazamiento horizontal;
2. «Jugar Mandados» es visible y táctil de 44 px como mínimo;
3. No hay errores JS, solicitudes externas ni enlaces sin destino;
4. El foco de teclado empieza en «Saltar al contenido»;
5. Contraste del botón: blanco sobre verde oscuro.
6. Las capturas PNG de 412 y 1440 quedan en `dist/capturas/`, dentro del artefacto de CI.

**Estado:** no se declara «sloplint --render» aprobado porque no se ejecutó esa herramienta. La prueba de navegador integrada ofrece comprobaciones propias; se recomienda además la revisión humana de ambas capturas antes de fusionar.

## Regresión encontrada y corrección
La primera ejecución de GitHub Actions de la portada (`44752235751`) falló en 860×412: el botón estaba bajo el primer pliegue. Se añadió una composición compacta horizontal con alto menor de 520 px y se redujo el encabezado a 320 px de ancho. El test pasó de verificar solo que `top < innerHeight` a exigir que `bottom <= innerHeight`. **No se afirma que la corrección pasó CI hasta comprobar la nueva ejecución.**
