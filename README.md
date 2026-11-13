# Juega EnCicla

Videojuego arcade **offline** sobre el sistema de bicicletas públicas **EnCicla** (Valle de Aburrá).
Recorre el camino del Usuario al Supervisor: 9 oficios y 27 turnos, en pixel art con estilo de revista.

- **Jugar en la web:** https://juanfeliperico369-stack.github.io/BicicletasUno/
- **Archivo único sin internet:** `dist/juega-encicla.html` (ábrelo en cualquier navegador)
- **Guía para continuar el proyecto:** `docs/GUIA.md` · **Bitácora:** `docs/BITACORA.md`

```bash
node tools/build.js && node tools/assets.js   # construir
node tests/run.js --n=100                     # probar (100 partidas con el bot)
```

Demo no oficial presentada a EnCicla. Mapa estilizado y datos aproximados con fines didácticos.
