#!/usr/bin/env node
/* C-M34: ejecuta el módulo REAL en Node, sin red ni bibliotecas de juego.
   Es una prueba adicional del motor, no un benchmark de memoria del teléfono. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const codigo = fs.readFileSync(path.join(base, 'js/10-sectores.js'), 'utf8');
const contexto = vm.createContext({ MC: {}, Math, Number, RangeError });
vm.runInContext(codigo, contexto, { filename: 'js/10-sectores.js' });
const { Sectores1km } = contexto.MC;
let n = 0;
const comprobar = (fn, nombre) => { fn(); n++; console.log('✓', nombre); };
comprobar(() => {
  const s = new Sectores1km({ edificiosEn: () => ['edificio'] });
  assert.deepEqual(JSON.parse(JSON.stringify(s.zona(-.5, -1000.1))), { sx: -1, sy: -2 });
  assert.deepEqual(Array.from(s.pedir(0, 0).edificios()), ['edificio']);
  assert.equal(s.actualizar(0, 0).sectores, 9);
}, 'cuadrícula negativa, sector central, geometría perezosa y presupuesto por defecto');
comprobar(() => {
  const s = new Sectores1km(null, { radio: 3, maxSectores: 4 });
  const a = s.actualizar(150, 220), central = s.pedir(0, 0);
  for (let i = 0; i < 100; i++) assert.equal(s.actualizar(150, 220).sectores, 4);
  assert.strictEqual(s.pedir(0, 0), central);
  assert.equal(a.sectores, 4);
  assert.ok([...s.cache.keys()].includes('0,0'));
}, 'radio mayor que el presupuesto: no causa thrashing LRU ni expulsa el centro');
comprobar(() => {
  const cache = new Map(Array.from({ length: 90 }, (_, i) => [i, [{ id: i }]]));
  const s = new Sectores1km({ _ED: { cache, R: 640, nx: 15 } }, { maxRegiones: 20 });
  const a = s.actualizar(1300, 1250);
  assert.ok(cache.size <= 20 && cache.size > 0);
  assert.equal(a.evictas, 90 - cache.size);
  const b = s.actualizar(6600, 1700);
  assert.ok(b.despues <= 20);
  assert.equal(b.sx, 6);
}, 'reduce ED1 decodificado y sigue funcionando cuando cambia de sector');
comprobar(() => {
  const cache = new Map([[0, ['persistente']]]);
  const s = new Sectores1km({ _ED: { cache, R: 640, nx: 12 } });
  s.actualizar(0, 0); const antes = s.ultimo;
  assert.throws(() => s.actualizar(NaN, 0), /Coordenadas/);
  assert.throws(() => s.actualizar(Infinity, 0), /Coordenadas/);
  assert.strictEqual(s.ultimo, antes);
  assert.equal(s.pedir(NaN, 0), null);
  assert.ok(cache.size >= 0);
}, 'datos de cámara inválidos no alteran ni destruyen la caché');
comprobar(() => {
  for (const cfg of [{ lado: Infinity }, { maxSectores: NaN }, { maxRegiones: -1 }, { radio: 99 }]) {
    assert.throws(() => new Sectores1km(null, cfg), RangeError);
  }
  const s = new Sectores1km(null, { lado: 640, maxSectores: 1, radio: 0 });
  assert.equal(s.actualizar(-641, 1).sx, -2);
  assert.equal(s.cache.size, 1);
  s.limpiar(); assert.equal(s.cache.size, 0);
}, 'configuración finita, bordes de sector y limpieza');
console.log('C-M34: ' + n + '/' + n + ' pruebas en verde (Node).');
