#!/usr/bin/env node
/* Motor City R6: valida archivos LOD de un mundo real sin modificar MC4. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
function validar(dir){
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifiesto.json'),'utf8'));
  assert.equal(manifest.version,2,'Formato R6 desconocido');
  assert.equal(manifest.sector_m,1000);
  assert(Array.isArray(manifest.niveles)&&manifest.niveles.length>0);
  assert(Number.isSafeInteger(manifest.celda_lod2_m)&&manifest.celda_lod2_m>=20&&manifest.celda_lod2_m<=200);
  const totales=[0,0,0],bytesLOD=[0,0,0];
  let sectores=0,grupos=0,cuantizados=0,flotantes=0;
  for(const [key,sector] of Object.entries(manifest.sectores)){
    sectores++;
    const ids=key.split(',').map(Number);
    assert(ids.length===2&&ids.every(Number.isInteger),'ID sector inválido');
    assert(Array.isArray(sector.origen)&&sector.origen.length===3&&sector.origen.every(Number.isFinite));
    assert.equal(sector.origen[0],ids[0]*1000);
    assert.equal(sector.origen[2],ids[1]*1000);
    for(const lod of manifest.niveles){
      const meta=sector.lod?.[lod];
      assert(meta&&typeof meta.archivo==='string','Falta LOD '+lod+' en '+key);
      assert(/^sector_-?\d+_-?\d+_lod[012]\.bin$/.test(meta.archivo),'Ruta insegura');
      assert.equal(meta.archivo,'sector_'+ids[0]+'_'+ids[1]+'_lod'+lod+'.bin');
      const blob=fs.readFileSync(path.join(dir,meta.archivo));
      assert.equal(blob.length,meta.bytes,'Longitud de bloque');
      assert.equal(sha256(blob),meta.sha256,'SHA-256 no coincide');
      const raw=zlib.inflateRawSync(blob);
      let cursor=0;
      for(const g of meta.grupos){
        grupos++;
        assert(Number.isInteger(g.clase)&&g.clase>=0,'Clase inválida');
        assert.equal(g.offset,cursor,'Offsets no contiguos');
        assert(Number.isInteger(g.triangulos)&&g.triangulos>=0,'Triángulos inválidos');
        assert(g.codificacion==='i16q20'||g.codificacion==='f32','Codificación desconocida');
        const paso=g.codificacion==='i16q20'?2:4;
        assert.equal(g.bytes,g.triangulos*9*paso,'Triángulos y tamaño inconsistentes');
        assert.equal(g.escala_m,g.codificacion==='i16q20'?0.05:1);
        cursor+=g.bytes;assert(cursor<=raw.length,'Rango fuera de bloque');
        if(g.codificacion==='i16q20')cuantizados++;else flotantes++;
        for(let p=g.offset;p<cursor;p+=paso*3){
          const read=idx=>g.codificacion==='i16q20'?raw.readInt16LE(idx)*0.05:raw.readFloatLE(idx);
          const x=read(p),y=read(p+paso),z=read(p+paso*2);
          assert(Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(z),'Coordenada NaN');
          assert(Math.abs(x)<5000&&Math.abs(y)<5000&&Math.abs(z)<5000,'Fuera de rango local');
        }
        totales[lod]+=g.triangulos;
      }
      assert.equal(cursor,raw.length,'Datos no indexados');
      bytesLOD[lod]+=blob.length;
    }
  }
  assert.deepEqual(totales,manifest.triangulos,'Suma de triángulos incorrecta');
  assert.deepEqual(bytesLOD,manifest.bytes_por_lod,'Suma de bytes por LOD incorrecta');
  assert.equal(bytesLOD.reduce((x,y)=>x+y,0),manifest.bytes_compresos,'Total de bytes incorrecto');
  return {sectores,grupos,cuantizados,flotantes,triangulos:totales,bytes:manifest.bytes_compresos,bytes_por_lod:bytesLOD,celda_lod2_m:manifest.celda_lod2_m};
}
const i=process.argv.indexOf('--directorio');
if(i<0||!process.argv[i+1]){
 console.error('Uso: node herramientas/validar-sectores.mjs --directorio /tmp/r6-medellin');
 process.exit(2);
}
console.log('✓ Motor City R6: bloques, SHA-256, offsets, triángulos y coordenadas:',JSON.stringify(validar(process.argv[i+1])));
