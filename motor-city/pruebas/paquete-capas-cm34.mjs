#!/usr/bin/env node
/* C-M34: compara TODOS los bytes originales MC4 con el HTML por capas y
   por SECTORES; prueba lectura diferida, bordes y materialización explícita.
   Ejecutar después de node motor.mjs construir. */
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
const html = fs.readFileSync(path.join(root, 'dist/juegos/getaway.html'), 'utf8');
const bloques = new Map();
const re = /<script type="text\/plain" id="(mc4(?:meta|r)?-[^"]+)">([\s\S]*?)<\/script>/g;
for (let m; (m = re.exec(html)); ) {
  assert(!bloques.has(m[1]), 'ID de bloque duplicado: ' + m[1]);
  bloques.set(m[1], m[2]);
}
assert(!bloques.has('mc4-nueva_york'), 'No incrustar MC4 monolítico de Manhattan');

const ctx = { console, require, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'dist/motor.js'), 'utf8'), ctx);
const MC = ctx.MC;
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const ciudades = ['nueva_york', 'medellin', 'guatape'];
const paquete = new Map();
for (const id of ciudades) {
  const bin = fs.readFileSync(path.join(root, 'datos', id, 'mundo.mc4'));
  const mlen = bin.readUInt32LE(4), base = 8 + mlen;
  const meta = JSON.parse(bloques.get('mc4meta-' + id));
  const { rasters, ...datosOriginales } = meta;
  assert.equal(meta.formato, 'MC4');
  assert.deepEqual(datosOriginales, JSON.parse(bin.subarray(8, base).toString('utf8')));
  assert(rasters?.suelo && rasters?.nivel, 'falta índice geográfico de ' + id);
  for (const [nombre, c] of Object.entries(meta.capas)) {
    if (!rasters[nombre]) {
      const texto = bloques.get('mc4-' + id + '-' + nombre);
      assert(texto, 'falta ' + id + '/' + nombre);
      const bytes = Buffer.from(texto, 'base64');
      assert.equal(bytes.length, c.n);
      assert.equal(sha(bytes), sha(bin.subarray(base + c.o, base + c.o + c.n)));
      continue;
    }
    assert(!bloques.has('mc4-' + id + '-' + nombre), 'el raster no debe tener capa duplicada');
    const spec = rasters[nombre], texto = bloques.get('mc4r-' + id + '-' + nombre);
    assert.equal(typeof texto, 'string', 'falta bloque sectorizado: ' + id + '/' + nombre);
    assert.equal(spec.nx, Math.ceil(spec.w / spec.lado));
    assert.equal(spec.ny, Math.ceil(spec.h / spec.lado));
    assert.equal(spec.indices.length, spec.nx * spec.ny + 1);
    assert.equal(spec.indices.at(-1), texto.length);
    const referencia = zlib.inflateRawSync(bin.subarray(base + c.o, base + c.o + c.n));
    assert.equal(referencia.length, c.raw);
    const recuperado = Buffer.alloc(referencia.length);
    for (let iy = 0; iy < spec.ny; iy++) for (let ix = 0; ix < spec.nx; ix++) {
      const i = iy * spec.nx + ix, w = Math.min(spec.lado, spec.w - ix * spec.lado);
      const h = Math.min(spec.lado, spec.h - iy * spec.lado);
      const comprimido = Buffer.from(texto.slice(spec.indices[i], spec.indices[i + 1]), 'base64');
      const chunk = zlib.inflateRawSync(comprimido);
      assert.equal(chunk.length, w * h, 'tamaño sector ' + id + '/' + nombre + '/' + i);
      for (let fila = 0; fila < h; fila++) {
        chunk.copy(recuperado, (iy * spec.lado + fila) * spec.w + ix * spec.lado,
          fila * w, (fila + 1) * w);
      }
    }
    assert.equal(sha(recuperado), sha(referencia), 'diferencia byte a byte: ' + id + '/' + nombre);
  }
  paquete.set(id, { meta, bin });
  console.log('✓', id, 'MC4 original idéntico:', Object.keys(meta.capas).length, 'capas, raster 1 km');
}

const id = 'guatape', { meta, bin } = paquete.get(id);
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'ciudades', id + '.json'), 'utf8'));
const leidas = [], sectores = [];
const fuente = nombre => { leidas.push(nombre); return bloques.get('mc4-' + id + '-' + nombre) ?? null; };
const fuenteSector = (nombre, indice) => {
  sectores.push(nombre + ':' + indice);
  const spec = meta.rasters[nombre], texto = bloques.get('mc4r-' + id + '-' + nombre);
  return spec && texto ? texto.slice(spec.indices[indice], spec.indices[indice + 1]) : null;
};
const monolito = new MC.Mundo(new Uint8Array(bin), cfg);
const porCapas = MC.Mundo.desdePaquete(meta, fuente, cfg, fuenteSector);
assert.equal(porCapas.u8, null);
assert.equal(porCapas._c.size, 0);
assert.equal(leidas.length, 0, 'sin decodificación adelantada');
for (const nombre of ['municipio', 'relieve', 'info', 'edificios']) {
  const a = monolito.capa(nombre), b = porCapas.capa(nombre);
  if (ArrayBuffer.isView(a)) {
    assert.equal(sha(Buffer.from(a.buffer, a.byteOffset, a.byteLength)),
      sha(Buffer.from(b.buffer, b.byteOffset, b.byteLength)), nombre + ' difiere');
  } else assert.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(a)), nombre + ' difiere');
}
assert(!porCapas._c.has('suelo') && !porCapas._c.has('nivel'));
assert.equal(sectores.length, 0);
assert.equal(leidas.length, 4);
for (const [tx, ty] of [[0, 0], [1, 1], [168, 2], [2, 168], [porCapas.W - 1, porCapas.H - 1],
  [Math.floor(porCapas.W / 2), Math.floor(porCapas.H / 2)]]) {
  if (tx >= porCapas.W || ty >= porCapas.H) continue;
  assert.equal(porCapas.sueloCasilla(tx, ty), monolito.sueloCasilla(tx, ty));
  const x = (tx + 0.5) * porCapas.tile, y = (ty + 0.5) * porCapas.tile;
  assert.equal(porCapas.nivel(x, y), monolito.nivel(x, y));
}
assert(sectores.length > 0 && !porCapas._c.has('suelo'));
const tileBefore = porCapas._rasters.suelo.diagnostico();
porCapas.sueloCasilla(0, 0);
porCapas.sueloCasilla(0, 0);
assert(porCapas._rasters.suelo.diagnostico().aciertos > tileBefore.aciertos, 'cache espacial no reutilizada');
for (const nombre of ['suelo', 'nivel']) {
  const a = monolito.capa(nombre), b = porCapas.capa(nombre);
  assert.equal(sha(Buffer.from(a.buffer, a.byteOffset, a.byteLength)),
    sha(Buffer.from(b.buffer, b.byteOffset, b.byteLength)), 'reconstrucción completa: ' + nombre);
}
assert.equal(porCapas._rasters.suelo.diagnostico().residentes, 0);
assert.throws(() => porCapas.capa('no-existe'), /capa/);
assert.throws(() => MC.Mundo.desdePaquete({}, fuente, cfg), /inválido/);
assert.throws(() => MC.Mundo.desdePaquete(meta, fuente, cfg), /Falta proveedor/);
const mal = MC.Mundo.desdePaquete(meta, () => 'AAAA', cfg, () => null);
assert.throws(() => mal.capa('info'), /inválida/);
const precargado = await MC.Mundo.cargarPaquete(meta, fuente, cfg, fuenteSector);
assert(!precargado._c.has('suelo') && !precargado._c.has('nivel'), 'rasters se inflaron enteros durante precarga');
assert(precargado._c.has('relieve') && precargado._rasters.suelo);
assert.equal(precargado.u8, null);
console.log('✓ geografía de suelo/nivel, lectura diferida, cache, compatibilidad monolítica y corrupción: OK');
console.log('✓ C-M34 paquete territorial offline: Node completado; no mide memoria de hardware físico.');
