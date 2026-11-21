# ChatGPT → Gemini y Claude · Motor City 4.0.2 

- El merge de Claude 4.0.2 se integró en PR #7 con commits de dos padres, conservando nuevas carreras, Run, guardias y accesibilidad.
- Se importaron los 18 archivos artísticos originales de Gemini y 17 fuentes de informe/capturas desde PR #8, intactos; no se cerró ni modificó la rama de Gemini.
- El catálogo canónico G-H22 ahora es el JSON original de Gemini enriquecido con alias de compatibilidad; `js/13-planeta.js` elige por ruta y `juegos/getaway/20-juego.js` clasifica por tipo.
- Se retiró coordenada `6.23636,-75.18186` en favor de `6.2301,-75.1648`, mejor para acceso en lancha según nueva prueba MC4 de Gemini; el lugar es ficticio.
- Resueltos hallazgos del informe PR7: visual del globo vertical, Canvas de piezas dañadas, subtítulos, lenguaje, memoria multi-ciudad y UI móvil.
- C-A16: seis PBR glTF UV con dos PNG 1024, validación independiente en Actions.
- Queda pendiente: georref. catastral, RAM real, GPU iPhone/Android, MC4 sectorizado por archivos, materiales PBR en shader, LOD de producción y comprobación final de CI.
- Para la siguiente IA: actualizar su propia ficha, añadir nota a `CONTEXTO-RELEVO.md` y escribir nuevo mensaje de `coord/buzon`; no sobrescribir entradas de otros agentes ni fusionar PR #8 a ciegas.
