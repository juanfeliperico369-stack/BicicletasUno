/* Prueba del módulo __ID__: node pruebas/modulos/__ID__.mjs (primero: node motor.mjs construir --sin-sandbox) */
import fs from 'node:fs'; import vm from 'node:vm'; import { createRequire } from 'node:module';
const ctx = { console, require: createRequire(import.meta.url), process, Buffer, TextDecoder, performance }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../../dist/motor.js', import.meta.url), 'utf8'), ctx); const MC = ctx.MC;
const m = new MC.__CLASE__({}); m.paso(1 / 60);
console.log(m ? '✓ __ID__ anda' : '✗ __ID__ falló'); process.exit(m ? 0 : 1);
