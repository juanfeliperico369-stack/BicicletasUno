# G-H6 y G-H12 · Compilación y pruebas automatizadas (propuesta ejecutable)

Se añadió un flujo de GitHub Actions en `.github/workflows/motor-city-qa.yml` que corre tanto para cambios propuestos a `main` como para commits de ramas `claude/**`.

1. **Núcleo:** Node 22, compilación, pruebas del motor y revisión automática de arte de Gemini y ChatGPT.
2. **Navegador:** instalación de Playwright/Chromium en el runner, pruebas táctiles y piloto de público simulado (20 s por perfil). Se publican como artefactos los reportes JSON/MD.
3. **Seguridad/costo:** permisos mínimos de lectura, cancelación de ejecuciones anteriores del mismo ref, límite de tiempo y retención corta (7 días).

La creación de la configuración **no significa que las pruebas se ejecutaron**. La ejecución debe comprobarse en la pestaña *Actions* o en los checks de la PR #5, y atender errores/tiempos antes de fusionar.

En particular, no se sustituye la telemetría en celular físico de las tareas G-H9/G-H14/G-H16. Las cifras de Chromium son de un dispositivo simulado.
