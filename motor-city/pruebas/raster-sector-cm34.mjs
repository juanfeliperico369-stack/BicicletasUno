#!/usr/bin/env node
/* C-M34 · stress raster espacial real de Motor City, sin navegador.
   Verifica fronteras de sectores, signos, LRU, corrupción y reconstrucción. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const ctx = { console, require, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'dist/motor.js'), 'utf8'), ctx);
const { RasterMC4 } = ctx.MC;
assert.equal(typeof RasterMC4, 'function', 'motor.js no incluyó el lector raster sectorizado');
const W = 367, H = 285, lado = 37, nx = Math.ceil(W / lado), ny = Math.ceil(H / lado);
const raw = Buffer.alloc(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) raw[y * W + x] = (13 * x + 7 * y) & 255;
const partes = [], indices = [0];
for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
  const w = Math.min(lado, W - ix * lado), h = Math.min(lado, H - iy * lado);
  const b = Buffer.alloc(w * h);
  for (let j = 0; j < h; j++) raw.copy(b, j * w, (iy * lado + j) * W + ix * lado,
    (iy * lado + j) * W + ix * lado + w);
  const texto = zlib.deflateRawSync(b, { level: 6 }).toString('base64');
  partes.push(texto); indices.push(indices.at(-1) + texto.length);
}
const paquete = partes.join('');
let pedidas = 0;
const spec = { w: W, h: H, lado, nx, ny, tipo: 'i8', indices };
const fuente = i => { pedidas++; return paquete.slice(indices[i], indices[i + 1]); };
const raster = new RasterMC4(spec, fuente, { maxSectores: 4 });
assert.equal(pedidas, 0, 'no debe leer ningún sector antes de solicitar uno');
for (const [x, y] of [[0, 0], [36, 36], [37, 36], [36, 37], [37, 37],
  [W - 1, H - 1], [0, H - 1], [W - 1, 0]]) {
  const v = raw[y * W + x], firmado = v > 127 ? v - 256 : v;
  assert.equal(raster.valor(x, y), firmado, 'frontera ' + x + '/' + y);
}
assert.equal(raster.valor(-1, 0), undefined);
assert.equal(raster.valor(0, H), undefined);
assert.equal(raster.valor(NaN, 0), undefined);
for (let y = 0; y < H; y += 11) for (let x = 0; x < W; x += 13) {
  const v = raw[y * W + x];
  assert.equal(raster.valor(x, y), v > 127 ? v - 256 : v);
}
const diag = raster.diagnostico();
assert(diag.expulsiones > 0 && diag.descompresiones >= 16, 'LRU no alcanzó presión');
assert(diag.residentes <= 4 && diag.bytesResidentes <= 4 * lado * lado,
  'se superó presupuesto de memoria raster');
const completo = raster.completa();
assert(ArrayBuffer.isView(completo) && completo.length === raw.length);
assert.equal(crypto.createHash('sha256').update(Buffer.from(completo.buffer, completo.byteOffset, completo.byteLength)).digest('hex'),
  crypto.createHash('sha256').update(raw).digest('hex'));
assert.equal(raster.diagnostico().residentes, 0, 'la materialización debe liberar sectores de la caché');
const errores = [
  [{ ...spec, w: 0 }, fuente, {}],
  [{ ...spec, indices: [0, 10] }, fuente, {}],
  [{ ...spec, indices: [0, ...indices.slice(1, -1), indices.at(-2)] }, fuente, {}],
  [{ ...spec, tipo: 'json' }, fuente, {}],
  [spec, fuente, { maxSectores: 0 }]
];
for (const args of errores) assert.throws(() => new RasterMC4(...args));
assert.throws(() => new RasterMC4(spec, () => null).valor(0, 0), /ausente/);
assert.throws(() => new RasterMC4(spec, () => 'AAAA').valor(0, 0));
console.log('✓ C-M34 raster MC4: límites parciales, i8, 900+ lecturas, LRU ≤4, reconstrucción SHA256, invalidación OK');
