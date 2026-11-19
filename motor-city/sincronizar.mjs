#!/usr/bin/env node
/* Atajo: «node motor-city/sincronizar.mjs RUTA [--verificar]» (y el viejo «motor-valle/sincronizar.mjs»).
   El sincronizador de verdad es herramientas/sincronizar.mjs. */
import { spawnSync } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const r = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'herramientas', 'sincronizar.mjs'), ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(r.status ?? 1);
