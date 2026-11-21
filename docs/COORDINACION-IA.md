# Protocolo de Coordinación Multi-IA sin Mediador · Juega EnCicla

> **Propósito:** permitir que dos o más IAs trabajen en paralelo sobre `juanfeliperico369-stack/BicicletasUno` (y reporten al motor en `juanfeliperico369-stack/motorcity`) **sin una tercera IA mediadora**, evitando conflictos de fusión, trabajo duplicado o regresiones, y dejando contexto verificable para la **IA principal** del videojuego.

---

## 1. Arquitectura de coordinación (cero conflictos por diseño)

El protocolo combina **tres canales ligeros** que funcionan de forma asíncrona sobre Git y GitHub:

1. **Tablero vivo en GitHub Issues (`[COORDINACIÓN IA]`):**
   - Un único Issue abierto en `BicicletasUno` sirve como punto de encuentro inmediato entre ramas distintas.
   - Al iniciar, cada IA comenta: su identificador (`antigravity`, `codex`, `claude`, etc.), su rama activa, la fase en curso (`Fase 1`, `Fase 2` o `Fase 3`), los archivos que reclama en exclusiva y los módulos libres.
2. **Fichas de estado por agente (`coord/agentes/<agente>.json`):**
   - **Regla de oro:** cada IA **solo crea y actualiza su propia ficha** (`coord/agentes/antigravity.json`, `coord/agentes/codex.json`, etc.). Ninguna IA edita la ficha de otra.
   - Contiene: `agente`, `rama`, `fase`, `estado`, `ultima_actualizacion_utc`, `zonas_reclamadas`, `archivos_nuevos`, `simbolos_exportados`, `pruebas_verificadas` y `pendiente_para_compañera`.
3. **Buzón *append-only* (`coord/buzon/<YYYYMMDD-HHMM>-<agente>-<tema>.md`):**
   - Cada mensaje entre IAs es un archivo nuevo con sello de fecha UTC y nombre del agente. Como nunca se modifica un archivo de otra IA, **los mensajes nunca producen conflictos de Git**.

---

## 2. Partición de zonas y prevención de conflictos en `src/js/`

Como `tools/build.js` concatena `src/js/*.js` en orden alfabético:

| Zona / Rango | Dueño por defecto | Qué cubre | Regla de edición |
|---|---|---|---|
| `src/js/98a-*.js` … `src/js/98m-*.js` | **Agente A (`antigravity`)** | Fase 1 (game feel, flujo/rebufo, diario postal, narrativa coherente), Fase 2 (puente Motor City 4.0, estilos, `MC.Vida`, `MC.Historias`, `MC.Ocurrencias`, `MC.Hogar`, Ruta a Guatapé, capa movilidad/ruido) | Propiedad exclusiva; la IA compañera puede leer/llamar sus hooks `JE.*` sin editar el archivo |
| `src/js/98n-*.js` … `src/js/98z-*.js` | **Agente B (IA compañera)** | Extensiones, modos extra, pulido artístico/sonoro o mecánicas adicionales | Libre para la IA compañera sin riesgo de choque |
| Archivos compartidos (`tools/build.js`, `src/style.css`, `src/js/00-core.js`, `src/js/60-ui.js`, `tests/run.js`) | **Compartido con reclamo previo** | Cambios quirúrgicos y mínimos | Reclamar en el Issue y en `coord/agentes/<id>.json` antes de tocar; hacer `git fetch --all` antes de commitear |
| `docs/REPORTE-FASES-1-2-3-ENCICLA.md` | **Agente A (`antigravity`)** | Reporte de lo agregado, arreglado, auditorías, skills y recomendaciones | La IA compañera puede crear `docs/REPORTE-<AGENTE>-ENCICLA.md` o anexar en `coord/buzon/` |
| `motorcity/reportes/REPORTE-INTEGRACION-ENCICLA-MC4.md` | **Agente A (`antigravity`)** | Reporte técnico del uso de Motor City 4.0 en `BicicletasUno` y sugerencias para el motor | La IA compañera puede aportar en sección separada o en `motorcity/reportes/REPORTE-INTEGRACION-ENCICLA-<AGENTE>.md` |

---

## 3. Ciclo de sincronización obligatorio (Checkpoints)

Cada IA debe ejecutar este ciclo antes de iniciar cada fase y antes de cada `git push`:

```bash
git fetch --all --prune
git branch -r
gh issue list -R juanfeliperico369-stack/BicicletasUno --search "COORDINACIÓN IA"
```

1. **Leer** los comentarios nuevos del Issue y los archivos nuevos en `coord/agentes/` y `coord/buzon/` de cualquier rama remota (`git show origin/<rama>:coord/...`).
2. **Detectar trabajo paralelo:** si la otra IA ya terminó un bloque verificado en verde, integrarlo con `git merge --no-ff` respetando sus archivos y anotar el acuse de recibo en `coord/buzon/`.
3. **Resolver conflictos de forma determinista (sin mediador):**
   - En `coord/` no hay conflictos (archivos separados por agente).
   - En `src/js/*.js` nuevos no hay conflictos (rangos `98a–98m` vs `98n–98z`).
   - En archivos compartidos (`tools/build.js`, `src/style.css`, `src/js/00-core.js`, `tests/run.js`), gana la unión aditiva que pase `node tools/build.js && node tools/auditoria-mapa.js && node tests/run.js`. Nunca se borra un fix verificado de la otra IA.
   - En `dist/*` nunca se fusionan diffs manuales: siempre se regenera con `node tools/build.js` tras unir el código fuente.
4. **Cerrar fase y publicar relevo:** actualizar `coord/agentes/<agente>.json`, crear nota de traspaso en `coord/buzon/`, comentar en el Issue y actualizar `docs/BITACORA.md`.

---

## 4. Contrato para la IA principal

Al terminar las Fases 1, 2 y 3, ambas IAs dejan a la **IA principal** un mapa claro y sin ambigüedades:
- Qué se agregó y en qué archivo exacto vive cada función o gancho (`JE.*`, `MC.*`).
- Qué bugs se encontraron y corrigieron (con prueba automatizada que impide regresión).
- Qué quedó pendiente, qué hipótesis faltan probar en celular físico real y qué sigue en el roadmap.
