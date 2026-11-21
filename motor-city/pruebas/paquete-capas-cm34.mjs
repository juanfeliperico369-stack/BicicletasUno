#!/usr/bin/env node
/* C-M34: comprueba empaquetado real offline de MC4 por capa y equivalencia binaria.
   Ejecutar DESPUÉS de: node motor.mjs construir */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const html = fs.readFileSync(path.join(root, 'dist/juegos/getaway.html'), 'utf8');
const bloques = new Map();
const re = /<script type="text\/plain" id="(mc4(?:meta)?-[^"]+)">([\s\S]*?)<\/script>/g;
for (let m; (m = re.exec(html)); ) {
  assert(!bloques.has(m[1]), 'ID de paquete duplicado: ' + m[1]);
  bloques.set(m[1], m[2]);
}
assert(!bloques.has('mc4-nueva_york'), 'Manhattan no debe tener un MC4 monolítico codificado');
const ctx = { console, require, process, Buffer, TextDecoder, TextEncoder, performance, setTimeout };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'dist/motor.js'), 'utf8'), ctx);
const MC = ctx.MC;
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const ciudades = ['nueva_york', 'medellin', 'guatape'];
for (const id of ciudades) {
  const bin = fs.readFileSync(path.join(root, 'datos', id, 'mundo.mc4'));
  const mlen = bin.readUInt32LE(4), base = 8 + mlen;
  const meta = JSON.parse(bloques.get('mc4meta-' + id));
  assert.equal(meta.formato, 'MC4');
  assert.deepEqual(meta, JSON.parse(bin.subarray(8, base).toString('utf8')));
  for (const [nombre, c] of Object.entries(meta.capas)) {
    const texto = bloques.get('mc4-' + id + '-' + nombre);
    assert(texto, 'falta ' + id + '/' + nombre);
    const bytes = Buffer.from(texto, 'base64');
    assert.equal(bytes.length, c.n);
    assert.equal(sha(bytes), sha(bin.subarray(base + c.o, base + c.o + c.n)));
  }
  console.log('✓', id, 'paquete offline byte a byte,', Object.keys(meta.capas).length, 'capas');
}
const id = 'guatape', bin = fs.readFileSync(path.join(root, 'datos', id, 'mundo.mc4'));
const meta = JSON.parse(bloques.get('mc4meta-' + id));
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'ciudades', id + '.json'), 'utf8'));
let leidas = [];
const fuente = nombre => { leidas.push(nombre); return bloques.get('mc4-' + id + '-' + nombre) ?? null; };
const monolito = new MC.Mundo(new Uint8Array(bin), cfg);
const porCapas = MC.Mundo.desdePaquete(meta, fuente, cfg);
assert.equal(porCapas.u8, null);
assert.equal(porCapas._c.size, 0);
assert.equal(leidas.length, 0, 'no debe decodificar antes de una petición');
for (const nombre of ['municipio', 'relieve', 'info', 'suelo', 'edificios']) {
  const a = monolito.capa(nombre), b = porCapas.capa(nombre);
  if (ArrayBuffer.isView(a)) {
    assert.equal(sha(Buffer.from(a.buffer, a.byteOffset, a.byteLength)),
      sha(Buffer.from(b.buffer, b.byteOffset, b.byteLength)), nombre + ' difiere');
  } else {
    assert.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(a)), nombre + ' difiere');
  }
}
assert.equal(leidas.length, 5);
porCapas.capa('suelo');
assert.equal(leidas.length, 5, 'una capa descomprimida se mantiene en caché');
assert.equal(monolito.suelo(20, 20), porCapas.suelo(20, 20));
assert.equal(monolito.cota(40, 40), porCapas.cota(40, 40));
assert.throws(() => porCapas.capa('no-existe'), /capa/);
assert.throws(() => MC.Mundo.desdePaquete({}, fuente, cfg), /inválido/);
const mal = MC.Mundo.desdePaquete(meta, () => 'AAAA', cfg);
assert.throws(() => mal.capa('suelo'), /inválida/);
const precargado = await MC.Mundo.cargarPaquete(meta, fuente, cfg);
assert(precargado._c.has('suelo') && precargado._c.has('relieve'));
assert.equal(precargado.u8, null);
console.log('✓ carga diferida, cache, base64 corrupto, compatibilidad suelo/relieve: OK');
console.log('✓ C-M34 paquete por capas: pruebas Node completadas (no prueba hardware físico).');
