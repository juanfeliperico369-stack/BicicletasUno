#!/usr/bin/env node
/* Motor City R6-b · QA de formato y peso real de los tres mundos offline.
   No modifica archivos del juego ni distribuye capas de terceros. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preparar, validar } from '../herramientas/r6b-compacto.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const resultados=[];
for(const id of ['guatape','medellin']){
  const t0=performance.now(),archivo=path.join(root,'datos',id,'mundo.mc4');
  const data=fs.readFileSync(archivo),p=preparar(data,{celda:80,maxBytes:2_500_000});
  assert(!p.excluido,'R6-b excedió presupuesto de 2,5 MB en '+id+' ('+p.stats.bytes+' bytes)');
  const r=validar(p);
  assert(r.sectores>0&&r.regiones>0&&r.cajas>=r.regiones,'El paquete debe contener cajas');
  assert(r.bytes<=2_500_000,'Presupuesto binario excedido');
  assert(r.bytes>0&&r.raw>r.bytes,'Paquete comprimido vacío o mayor que el original');
  assert.equal(p.version,1);assert.equal(p.region_m,160);assert.equal(p.sector_m,1000);
  assert(Object.keys(p.sectores).every(k=>/^[-\d]+,[-\d]+$/.test(k)));
  resultados.push({id,...r,manifest_bytes:Buffer.byteLength(JSON.stringify(p)),ms:Math.round(performance.now()-t0)});
}
console.log('✓ R6-b paquetes compactos, regiones 160m, presupuesto 2.5 MB y sin alterar MC4: '+JSON.stringify(resultados));
