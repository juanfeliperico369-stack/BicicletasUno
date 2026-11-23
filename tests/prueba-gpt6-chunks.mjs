#!/usr/bin/env node
/* Prueba aislada K-1: el planificador nunca genera todo el trozo al pedirlo.
 * Ejecutar: node tests/prueba-gpt6-chunks.mjs
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const script = readFileSync(new URL('../src/js/99w-chunks-progresivos.js', import.meta.url), 'utf8');
const raf = [], pintura = [];
let pixel = false, reloj = 0, etapas = 0, fallback = 0;
const fakeContext = () => ({
  fillStyle: '', imageSmoothingEnabled: true,
  fillRect(...a) { pintura.push(['relleno', ...a]); }
});
const map = {
  chunks2: new Map(), cq: () => 2,
  chunkG: () => { fallback++; return 'pixel-original'; },
  *drawGround3Etapas(ctx, cx, cy) {
    for (let i = 0; i < 3; i++) { etapas++; yield i; }
  }
};
const env = { CityMap: map, JE: {}, CH: 10, TS: 16,
  GFX: () => pixel ? 'pixel' : '3d',
  document: { createElement(tag) { assert.equal(tag, 'canvas'); return { width: 0, height: 0, getContext() { return fakeContext(); } }; } },
  View: { vw: 150, vh: 150 }, navigator: { deviceMemory: 1 },
  requestAnimationFrame: fn => { raf.push(fn); },
  performance: { now: () => (reloj += 2) }, console
};
vm.runInNewContext(script, env);
assert.equal(typeof env.JE.chunksGPT6.percentil95, 'function');
const primero = map.chunkG(2, 4);
assert.equal(primero.width, 320);
assert.equal(pintura.length, 1, 'terreno base inmediato');
assert.equal(etapas, 0, 'el primer cuadro no debe bloquearse');
assert.equal(map.chunkG(2, 4), primero, 'misma imagen reutilizable en caché');
assert.equal(raf.length, 1, 'un solo rAF programado');
let vueltas = 0;
while (raf.length && vueltas++ < 10) raf.shift()();
assert.equal(etapas, 3, 'se ejecutan las tres etapas');
assert.equal(env.JE.chunksGPT6.terminados, 1);
assert.equal(env.JE.chunksGPT6.pendientes, 0);
assert.equal(env.JE.chunksGPT6.errores, 0);
assert.ok(env.JE.chunksGPT6.maxCuadroMs > 0);
pixel = true;
assert.equal(map.chunkG(3, 3), 'pixel-original', 'pixel sigue su ruta tradicional');
assert.equal(fallback, 1);
pixel = false;
const perdido = map.chunkG(5, 5);
assert.ok(perdido);
map.chunks2.delete('5,5:2');
raf.shift()();
assert.equal(env.JE.chunksGPT6.cancelados, 1, 'chunk desalojado no se sigue pintando');
console.log('✓ K-1: caché, pintura progresiva, respaldo, 6 ms, pixel y cancelación');
