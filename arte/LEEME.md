# Arte · Juega EnCicla

- `entregas/<fecha>-<entrega>/`: lo que entregan las IA, archivado tal cual llegó (imágenes, `manifiesto.json` con SHA-256 y prompts, guion original y LEEME de la entrega).
- Antes de integrar una pieza al juego se revisa con la lista de control del documento para IA (`docs/IA-ENCICLA.md`, partes 4 y 13).
- La revisión de cada entrega está en `docs/` (por ejemplo `docs/AUDITORIA-C99.md`).

| Entrega | Estado |
|---|---|
| `2026-11-17-c99` | preproducción: 292 PNG generados con código. **No integrados**: no superan el dibujo actual (ver `docs/AUDITORIA-C99.md`) |

Para reconstruir las imágenes de una entrega desde su MD: `python3 tools/armar_entrega.py desarmar <archivo.md> <carpeta>`.
