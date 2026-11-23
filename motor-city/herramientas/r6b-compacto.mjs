#!/usr/bin/env node
/* Motor City R6-b · empaquetador de cajas precocinadas por sector y región.
   IMPORTANTE: no inserta los 3 niveles de triángulos (101 MB); guarda solo
   cajas LOD2 cuantizadas a 12,5 cm y comprimidas con zlib/deflate. */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { mc4, construir, poligono } from './precocinar-sectores.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const q=x=>Math.round(x*8);
const checked=n=>{
  if(!Number.isSafeInteger(n)||n<-32768||n>32767)throw new Error('R6-b: coordenada fuera de int16: '+n);
  return n;
};
function preparar(bin,{celda=80,maxBytes=2_000_000}={}){
  if(celda<40||celda>160||celda%20!==0)throw Error('R6-b: celda fuera de rango');
  const data=construir(mc4(bin)),sectores={},stats={sector_m:1000,region_m:160,celda_m:celda,regiones:0,cajas:0,bytes:0,raw:0};
  for(const [clave,s] of data.sets){
    const grupos=new Map();
    for(const e of s.edificios){
      const gx=Math.floor(e.x/160),gy=Math.floor(e.y/160),gKey=gx+','+gy;
      let rg=grupos.get(gKey);if(!rg){rg=new Map();grupos.set(gKey,rg);}
      const ck=Math.floor(e.x/celda)+','+Math.floor(e.y/celda),P=poligono(e,1);
      const xs=P.filter((_,i)=>!(i%2)),ys=P.filter((_,i)=>(i%2));
      const a={minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys),
        z0:data.cota(e.x,e.y),z1:data.cota(e.x,e.y)+e.h,k:e.k};
      const viejo=rg.get(ck);
      if(viejo){
        viejo.minX=Math.min(viejo.minX,a.minX);viejo.maxX=Math.max(viejo.maxX,a.maxX);
        viejo.minY=Math.min(viejo.minY,a.minY);viejo.maxY=Math.max(viejo.maxY,a.maxY);
        viejo.z0=Math.min(viejo.z0,a.z0);viejo.z1=Math.max(viejo.z1,a.z1);
      }else rg.set(ck,a);
    }
    if(!grupos.size)continue;
    const chunks=[Buffer.alloc(2)];chunks[0].writeUInt16LE(grupos.size,0);
    for(const [key,cl] of [...grupos].sort((a,b)=>a[0].localeCompare(b[0]))){
      const [gx,gy]=key.split(',').map(Number);
      if(cl.size>65535)throw Error('R6-b: demasiadas cajas por región');
      const head=Buffer.alloc(6);head.writeInt16LE(checked(gx),0);head.writeInt16LE(checked(gy),2);head.writeUInt16LE(cl.size,4);chunks.push(head);
      for(const a of cl.values()){
        const v=[a.minX-s.sx*1000,a.minY-s.sy*1000,a.maxX-s.sx*1000,a.maxY-s.sy*1000,
          a.z0-s.base,a.z1-a.z0,a.k].map((v,i)=>checked(i===6?Math.round(v):q(v)));
        const b=Buffer.alloc(14);v.forEach((x,i)=>b.writeInt16LE(x,i*2));chunks.push(b);stats.cajas++;
      }
      stats.regiones++;
    }
    const bruto=Buffer.concat(chunks),comprimido=zlib.deflateSync(bruto,{level:7});
    stats.raw+=bruto.length;stats.bytes+=comprimido.length;
    sectores[clave]={o:[s.sx*1000,s.base,s.sy*1000],d:comprimido.toString('base64'),r:grupos.size};
    s.edificios.length=0;
  }
  if(stats.bytes>maxBytes)return {excluido:true,stats,razon:'excede el presupuesto comprimido'};
  return {version:1,sector_m:1000,region_m:160,celda_m:celda,sectores,stats};
}
function validar(paquete){
  let regiones=0,cajas=0,raw=0,bytes=0;
  for(const [key,s] of Object.entries(paquete.sectores)){
    if(!/^-?\d+,-?\d+$/.test(key))throw Error('R6-b sector inseguro');
    const z=Buffer.from(s.d,'base64'),b=zlib.inflateSync(z);bytes+=z.length;raw+=b.length;
    if(b.length<2)throw Error('R6-b bloque corto');
    const n=b.readUInt16LE(0);let p=2;regiones+=n;
    for(let j=0;j<n;j++){
      if(p+6>b.length)throw Error('R6-b región truncada');
      const gx=b.readInt16LE(p),gy=b.readInt16LE(p+2),nc=b.readUInt16LE(p+4);p+=6;
      if(!Number.isFinite(gx)||!Number.isFinite(gy))throw Error('R6-b índice');
      for(let k=0;k<nc;k++){
        if(p+14>b.length)throw Error('R6-b caja truncada');
        const minX=b.readInt16LE(p),minY=b.readInt16LE(p+2),maxX=b.readInt16LE(p+4),maxY=b.readInt16LE(p+6);
        const h=b.readInt16LE(p+10);if(minX>=maxX||minY>=maxY||h<=0)throw Error('R6-b dimensiones inválidas');
        cajas++;p+=14;
      }
    }
    if(p!==b.length)throw Error('R6-b bytes adicionales');
  }
  if(regiones!==paquete.stats.regiones||cajas!==paquete.stats.cajas||bytes!==paquete.stats.bytes||raw!==paquete.stats.raw)
    throw Error('R6-b estadísticas no coinciden');
  return {sectores:Object.keys(paquete.sectores).length,regiones,cajas,bytes,raw};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const id=process.argv.includes('--ciudad')?process.argv[process.argv.indexOf('--ciudad')+1]:'guatape';
  if(!/^[a-z_]+$/.test(id))throw Error('Ciudad no admitida');
  const b=fs.readFileSync(path.join(root,'datos',id,'mundo.mc4'));
  const p=preparar(b,{celda:Number(process.argv.includes('--celda')?process.argv[process.argv.indexOf('--celda')+1]:80),maxBytes:20000000});
  console.log(JSON.stringify({...validar(p),ciudad:id,bytes_manifest:Buffer.byteLength(JSON.stringify(p))}));
}
export { preparar,validar };
