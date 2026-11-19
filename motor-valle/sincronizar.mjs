#!/usr/bin/env node
/* Compatibilidad con el Motor del Valle 1.x: «node motor-valle/sincronizar.mjs RUTA [--verificar]» sigue andando.
   El sincronizador de verdad es herramientas/sincronizar.mjs (Motor City 2.0). */
import { spawnSync } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const r = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'herramientas', 'sincronizar.mjs'), ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(r.status ?? 1);
