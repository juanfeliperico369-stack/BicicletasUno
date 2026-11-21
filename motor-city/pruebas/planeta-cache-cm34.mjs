#!/usr/bin/env node
/* C-M34 · Planeta: regresión de carga concurrente, LRU y protección del mundo.
   Ejercita el módulo REAL del motor con ciudades sintéticas (sin red ni GLB).
   No es un perfil de memoria de un teléfono. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'js/13-planeta.js'), 'utf8');
const ctx = { MC: {}, Generador: {} };
vm.runInNewContext(src, ctx, { filename: 'js/13-planeta.js' });
const { Planeta } = ctx.MC;
const anillo = ['a', 'b', 'c', 'd'].map(id => ({ id, tipo: 'ciudad', nombre: id }));
const tick = () => Promise.resolve();

let hechas = 0;
const prueba = async (nombre, fn) => {
  await fn();
  console.log('✓ ' + nombre);
  hechas++;
};

await prueba('carga única de doce consultas simultáneas y limpieza de promesa', async () => {
  let llamadas = 0, responder;
  const gate = new Promise(resolve => { responder = resolve; });
  const p = new Planeta({ anillo, cargar: async id => { llamadas++; return await gate; } });
  const tareas = Array.from({ length: 12 }, () => p.mundo('a'));
  await tick(); // La carga empieza después de publicar la promesa compartida.
  assert.equal(llamadas, 1);
  assert.deepEqual([...p._cargando.keys()], ['a']);
  responder({ etiqueta: 'unica' });
  const mundos = await Promise.all(tareas);
  assert(mundos.every(m => m === mundos[0]));
  assert.equal(mundos[0].planetaId, 'a');
  assert.equal(p._cargando.size, 0);
  assert.equal(p.diagnosticoCache().compartidas, 11);
  assert.equal(p.diagnosticoCache().cargas, 1);
});

await prueba('una carga fallida no contamina la caché y se puede reintentar', async () => {
  let veces = 0;
  const p = new Planeta({ anillo, cargar: async () => {
    veces++;
    if (veces === 1) throw Error('sin datos');
    return { origen: 'segundo' };
  } });
  const ambos = await Promise.allSettled([p.mundo('a'), p.mundo('a')]);
  assert(ambos.every(r => r.status === 'rejected'));
  assert.equal(p.cache.size, 0);
  assert.equal(p._cargando.size, 0);
  assert.equal(p.diagnosticoCache().errores, 1);
  const r = await p.mundo('a');
  assert.equal(r.origen, 'segundo');
  assert.equal(veces, 2);
});

await prueba('LRU verdadero: una ciudad usada vuelve al final y desplaza la menos reciente', async () => {
  const p = new Planeta({ anillo, cargar: async id => ({ id }) });
  await p.mundo('a');
  await p.mundo('b');
  await p.mundo('a');
  await p.mundo('c');
  assert.deepEqual([...p.cache.keys()], ['a', 'c']);
  assert(!p.cache.has('b'));
  assert.equal(p.diagnosticoCache().aciertos, 1);
  assert.equal(p.diagnosticoCache().expulsiones, 1);
});

await prueba('la ciudad activa no se expulsa durante precargas; cambiar de ciudad actualiza protección', async () => {
  const p = new Planeta({ anillo, cargar: async id => ({ id }) });
  const A = await p.mundo('a'); p.fijar('a');
  await p.mundo('b');
  await p.mundo('c');
  assert.strictEqual(p.cache.get('a'), A);
  assert.deepEqual([...p.cache.keys()], ['a', 'c']);
  p.fijar('c');
  await p.mundo('d');
  assert.deepEqual([...p.cache.keys()], ['c', 'd']);
  assert.equal(p.diagnosticoCache().activo, 'c');
  assert.equal(p.diagnosticoCache().maxMundos, 2);
  assert.equal(p._puertas.size, 0);
});

await prueba('presupuesto de un mundo, validación y mapas inexistentes', async () => {
  for (const maxMundos of [0, NaN, Infinity, -1, 1.5]) {
    assert.throws(() => new Planeta({ anillo, maxMundos }), /maxMundos/);
  }
  const p = new Planeta({ anillo, maxMundos: 1, cargar: async id => ({ id }) });
  await p.mundo('a'); p.fijar('a');
  await p.mundo('b'); p.fijar('b');
  assert.deepEqual([...p.cache.keys()], ['b']);
  await assert.rejects(() => p.mundo('desconocido'), /no tiene/);
  assert.throws(() => p.fijar('desconocido'), /no tiene/);
});

await prueba('tramo generado sin await intermedio: no deja carga perpetua en vuelo', async () => {
  const d = { tipo: 'tramo', id: 'ruta', largo: 100, semilla: 1, biomas: ['bosque'], nombre: 'Ruta' };
  let llamadas = 0;
  ctx.Generador.carretera = () => { llamadas++; return { carretera: true }; };
  const p = new Planeta({ anillo: [d], maxMundos: 1 });
  const [m1, m2] = await Promise.all([p.mundo('ruta'), p.mundo('ruta')]);
  assert.equal(llamadas, 1);
  assert.strictEqual(m1, m2);
  assert.equal(p._cargando.size, 0);
  assert.equal(p.cache.size, 1);
});

await prueba('cargas paralelas de ciudades distintas obedecen presupuesto y permiten volver', async () => {
  const llamadas = new Map();
  const p = new Planeta({ anillo, cargar: async id => {
    llamadas.set(id, (llamadas.get(id) || 0) + 1);
    return { id };
  } });
  await Promise.all(['a', 'b', 'c', 'd'].map(id => p.mundo(id)));
  assert.equal(p.cache.size, 2);
  assert.deepEqual([...p.cache.keys()], ['c', 'd']);
  assert.equal(p._cargando.size, 0);
  await p.mundo('a');
  assert.equal(llamadas.get('a'), 2);
  assert.equal(p.cache.size, 2);
});
console.log('C-M34 Planeta: ' + hechas + '/' + hechas + ' pruebas en verde (Node, mundos sintéticos).');
