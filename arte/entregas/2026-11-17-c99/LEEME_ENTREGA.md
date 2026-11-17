# Juega EnCicla · Paquete Claude Code / OneZero

**Versión de entrega:** C-99 / 2026-11-17  
**Carácter:** preproducción de arte y guion, integrable tras validación. **No se modificó el juego ni la APK.**

## Orden de lectura recomendado a Claude

1. `01_DOCUMENTOS/01_Informe_Auditoria_Integracion.pdf` (4 páginas) y `01_DOCUMENTOS/ENTREGA_MAESTRA.md`.
2. `01_DOCUMENTOS/02_Personajes_Estaciones_Metro.pdf` (12 páginas).
3. `01_DOCUMENTOS/03_Valle_Postales_Panoramicas.pdf` (25 páginas).
4. `01_DOCUMENTOS/04_Iconos_Sprites_Interfaz.pdf` (15 páginas).
5. `01_DOCUMENTOS/05_Guion_Completo_H.pdf` (27 páginas).
6. `01_DOCUMENTOS/00_MASTER_CLAUDE_IMAGENES_Y_CODIGO.md` (todo texto + Base64 de imágenes), e `INTEGRACION.md`.
7. `07_REFERENCIAS/ENCICLA-TODO.md` y `07_REFERENCIAS/Entrega_Maestra_Gemini.md` para las reglas originales.

**Todos los PDFs creados en esta entrega cumplen estrictamente 100 páginas y 30 MB como máximos.** El histórico V3 tiene 78 páginas y menos de 3 MB, pero es de referencia, no versión más reciente.

## Carpetas de arte

- `02_ARTE/gemini_propuestas`: **220 PNG** generados por ChatGPT/Python como borradores, identificados por códigos G; no contienen las 17 imágenes originales producidas por Gemini, cuyos prompts se entregaron por separado.
- `02_ARTE/chatgpt`: **72 PNG** de nombre C; incluye sprite sheets 4x4, 20 texturas C-20 y 12 fachadas C-22.
- En cada imagen: `*.txt` con descripción, rol, origen y estado de revisión.
- `04_INTEGRACION/sprites_rgba`: PNG transparentes derivados del magenta exacto de algunos activos, listos para inspección.

## Código y test

En una máquina de desarrollo con Python 3, Pillow, PyMuPDF y ReportLab:

```bash
python tools/validar_entrega.py
python tools/preparar_integracion.py
python tools/construir_pdf_y_md.py
```

El MD guarda bloques `<!-- img:inicio ruta sha256=... -->` seguidos de Base64; `tools/armar_entrega_original.py` puede reconstruir imágenes usando su comando `desarmar` a una carpeta destino, sin pérdida y con SHA-256 verificado.

`04_INTEGRACION/visor_arte_offline.html` es una **galería offline**, NO el juego. Su JavaScript pasó la verificación sintáctica; la captura visual automática con Chromium no pudo completarse en este entorno.

## Handoff al repositorio

1. Crear rama en `juanfeliperico369-stack/BicicletasUno`, no publicar directamente.
2. Hacer `npm ci`, `node tools/build.js`, `node tests/run.js --n=100` en el checkout real.
3. Revisar uno por uno C-10/C-11/C-12/C-21; comprobar integración en 360px y teléfonos reales.
4. Aplicar el script opcional de horarios solo después de comprobar la versión del archivo y fuentes oficiales.
5. Integrar H y arte G únicamente con aprobación del autor; mantener fallback procedural y exportaciones de partida.
6. Probar PWA sin conexión, Android y multijugador antes de un release.

## Estado de validación

Consulta `06_PRUEBAS/RESULTADOS.md` y `06_PRUEBAS/verificacion_final.json` para evidencia exacta. **Los tests de calidad e integración con el juego real no están aprobados.**
