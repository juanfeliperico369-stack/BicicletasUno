#!/usr/bin/env node
/* Motor City R6 — precompilador offline de mallas por sectores (ED1 / EDJ). */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

const SHA = x => crypto.createHash('sha256').update(x).digest('hex');
const limite = (x,a,b) => Math.max(a,Math.min(b,x));
const error = msg => {throw new Error('R6: '+msg);};
const arg = (s,def=null) => {const i=process.argv.indexOf(s);return i>=0?process.argv[i+1]:def;};

function mc4(buffer){
  if(buffer.length<8||buffer.toString('ascii',0,4)!=='MC4\0') error('cabecera MC4 inválida');
  const n=buffer.readUInt32LE(4);
  if(!n||n>4e6||8+n>buffer.length)error('metadatos MC4 inválidos');
  const meta=JSON.parse(buffer.subarray(8,8+n).toString('utf8'));
  if(meta.formato!=='MC4'||!meta.capas)error('falta índice MC4');
  const base=8+n;
  const capa=id=>{
    const c=meta.capas[id];
    if(!c||!Number.isSafeInteger(c.o)||!Number.isSafeInteger(c.n)||c.o<0||c.n<0||base+c.o+c.n>buffer.length)error('capa inválida: '+id);
    const raw=zlib.inflateRawSync(buffer.subarray(base+c.o,base+c.o+c.n));
    if(raw.length!==c.raw)error('longitud de capa incorrecta: '+id);
    return raw;
  };
  return {meta,capa};
}
function altura(k,pis){
  if(k===3)return 4.5+pis*2.6;
  if(k===9)return 7+pis*2.2;
  if(k===10)return 3.2;
  if(k===11)return 3;
  if(k===6)return Math.max(8,pis*3.4);
  if(k===0||k===15)return pis*2.7+.5;
  return pis*3.05+.6;
}
function edificiosDe(c){
  const E=c.meta.capas.edificios;if(!E)error('sin edificios');
  const b=c.capa('edificios');
  if(E.formato==='EDJ'){
    const J=JSON.parse(b.toString('utf8'));
    return J.lista.map(q=>{
      const [x,y,hw,hd,a,pis,k,P]=q;
      return {x,y,hw,hd,ux:Math.cos(a),uy:Math.sin(a),pis,k,h:altura(k,pis),P:P&&P.length>=6?P:null};
    });
  }
  if(E.formato!=='ED1'&&E.tipo!=='bin')error('formato edificios no admitido');
  if(!(E.nx>0&&E.ny>0&&E.R>0&&E.Q>0&&E.cuantos>=0&&Array.isArray(E.len)&&E.len.length>=7))error('cabecera ED1 incompleta');
  const L=E.len,oPos=L[0],oDim=oPos+L[1],oAng=oDim+L[2],oPis=oAng+L[3],oKin=oPis+L[4],oPol=oKin+L[5];
  if(oPol+L[6]!==b.length)error('ED1: secciones fuera de límites');
  const readVar=(end,ref)=>{
    let v=0,shift=0;
    for(let i=0;i<8;i++){
      if(ref.i>=end)error('varint truncado');
      const byte=b[ref.i++];v+=(byte&127)*2**shift;
      if(!(byte&128))return v;
      shift+=7;
    }
    error('varint excesivo');
  };
  const ix={i:0},pq={i:oPol},out=[],uz=v=>v%2?-(v+1)/2:v/2;
  let cp=0,cq=0,ci=0;
  for(let ry=0;ry<E.ny;ry++)for(let rx=0;rx<E.nx;rx++){
    const n=readVar(oPos,ix),pLen=readVar(oPos,ix),qLen=readVar(oPos,ix);
    let px=0,py=0,pa=0;const pos={i:oPos+cp};
    for(let j=0;j<n;j++){
      px+=uz(readVar(oDim,pos));py+=uz(readVar(oDim,pos));
      const i=ci+j,hw=Math.max(.5,b[oDim+i*2]/E.Q),hd=Math.max(.5,b[oDim+i*2+1]/E.Q);
      pa=(pa+b[oAng+i])%128;
      const a=(pa+.5)*Math.PI/128,pis=b[oPis+i]||1,flag=b[oKin+i],k=flag&15;
      const x=rx*E.R+px/E.Q,y=ry*E.R+py/E.Q;
      let P=null;
      if(flag&16){
        const np=readVar(oPol+L[6],pq);if(np<3||np>4096)error('vértices ED1 inválidos');
        P=[];let qx=px,qy=py;
        for(let v=0;v<np;v++){
          qx+=uz(readVar(oPol+L[6],pq));qy+=uz(readVar(oPol+L[6],pq));
          P.push(rx*E.R+qx/E.Q,ry*E.R+qy/E.Q);
        }
      }
      out.push({x,y,hw,hd,ux:Math.cos(a),uy:Math.sin(a),pis,k,h:altura(k,pis),P});
    }
    if(pos.i!==oPos+cp+pLen||pq.i!==oPol+cq+qLen)error('sección ED1 regional inconsistente');
    cp+=pLen;cq+=qLen;ci+=n;
  }
  if(ci!==E.cuantos||ix.i!==oPos||cp!==L[1]||cq!==L[6])error('longitudes ED1 incongruentes');
  return out;
}
function esquinas(e){
  if(e.P?.length>=6&&e.P.length%2===0)return e.P;
  const {x,y,hw,hd,ux,uy}=e;
  return [x-ux*hw+uy*hd,y-uy*hw-ux*hd,x+ux*hw+uy*hd,y+uy*hw-ux*hd,x+ux*hw-uy*hd,y+uy*hw+ux*hd,x-ux*hw-uy*hd,y-uy*hw+ux*hd];
}
const poligono=(e,lod)=>lod===0?esquinas(e):lod===1?esquinas({...e,P:null}):
  [e.x-Math.sqrt(Math.max(1,e.hw*e.hd)),e.y-Math.sqrt(Math.max(1,e.hw*e.hd)),
   e.x+Math.sqrt(Math.max(1,e.hw*e.hd)),e.y-Math.sqrt(Math.max(1,e.hw*e.hd)),
   e.x+Math.sqrt(Math.max(1,e.hw*e.hd)),e.y+Math.sqrt(Math.max(1,e.hw*e.hd)),
   e.x-Math.sqrt(Math.max(1,e.hw*e.hd)),e.y+Math.sqrt(Math.max(1,e.hw*e.hd))];

function geoTriangulos(arr,e,origen){
  const P=Array.from({length:arr.length/2},(_,i)=>[arr[i*2],arr[i*2+1]]);
  if(P.length>3&&Math.hypot(P[0][0]-P.at(-1)[0],P[0][1]-P.at(-1)[1])<1e-5)P.pop();
  if(P.length<3||P.length>128)return [];
  const signed=P.reduce((a,p,i)=>a+p[0]*P[(i+1)%P.length][1]-P[(i+1)%P.length][0]*p[1],0);
  if(Math.abs(signed)<1e-3)return [];
  if(signed<0)P.reverse();
  const O=[origen.sx*1000,origen.base,origen.sy*1000],verts=[];
  const emit=(a,b,c)=>{for(const v of [a,b,c])verts.push(v[0]-O[0],v[2]-O[1],v[1]-O[2]);};
  const abajo=origen.cota(e.x,e.y),arriba=abajo+e.h;
  for(let i=0;i<P.length;i++){
    const a=P[i],b=P[(i+1)%P.length];
    emit([a[0],a[1],abajo],[b[0],b[1],abajo],[b[0],b[1],arriba]);
    emit([a[0],a[1],abajo],[b[0],b[1],arriba],[a[0],a[1],arriba]);
  }
  let ids=P.map((_,i)=>i),guard=0;
  const cruz=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const dentro=(p,a,b,c)=>cruz(a,b,p)>=-1e-6&&cruz(b,c,p)>=-1e-6&&cruz(c,a,p)>=-1e-6;
  while(ids.length>3&&guard++<P.length*P.length){
    let oreja=false;
    for(let i=0;i<ids.length;i++){
      const a=P[ids[(i-1+ids.length)%ids.length]],b=P[ids[i]],c=P[ids[(i+1)%ids.length]];
      if(cruz(a,b,c)<1e-7||ids.some((j,t)=>t!==(i-1+ids.length)%ids.length&&t!==i&&t!==(i+1)%ids.length&&dentro(P[j],a,b,c)))continue;
      emit([a[0],a[1],arriba],[b[0],b[1],arriba],[c[0],c[1],arriba]);
      ids.splice(i,1);oreja=true;break;
    }
    if(!oreja)return [];
  }
  if(ids.length===3){const [a,b,c]=ids.map(i=>P[i]);emit([a[0],a[1],arriba],[b[0],b[1],arriba],[c[0],c[1],arriba]);}
  return verts;
}
function construir(c){
  const src=c.capa('relieve'),inf=c.meta.capas.relieve;
  if(!inf||inf.tipo!=='i16'||inf.w<2||inf.h<2||!inf.paso||src.byteLength!==inf.w*inf.h*2)error('relieve incompatible');
  const z=new Int16Array(src.byteLength/2);for(let i=0;i<z.length;i++)z[i]=src.readInt16LE(i*2);
  const es=c.meta.tile*inf.paso,w=inf.w,h=inf.h;
  const cota=(x,y)=>{
    let fx=limite(x/es,0,w-1.001),fy=limite(y/es,0,h-1.001);
    let i=Math.floor(fx),j=Math.floor(fy);fx-=i;fy-=j;const t=j*w+i;
    return z[t]*(1-fx)*(1-fy)+z[t+1]*fx*(1-fy)+z[t+w]*(1-fx)*fy+z[t+w+1]*fx*fy;
  };
  const sets=new Map();
  for(const e of edificiosDe(c)){
    if(!Number.isFinite(e.x)||!Number.isFinite(e.y)||e.h<=0)continue;
    const sx=Math.floor(e.x/1000),sy=Math.floor(e.y/1000),key=sx+','+sy;
    let s=sets.get(key);
    if(!s){s={sx,sy,base:cota(sx*1000+500,sy*1000+500),edificios:[]};sets.set(key,s);}
    s.edificios.push(e);
  }
  return {sets,cota};
}
function mallasSector(s,cota,niveles,celdaLejana=40){
  const grupos=[new Map(),new Map(),new Map()],clusters=new Map(),{sx,sy,base}=s;
  for(const e of s.edificios){
    for(let lod=0;lod<2;lod++){if(!niveles.includes(lod))continue;
      const v=geoTriangulos(poligono(e,lod),e,{sx,sy,base,cota});
      if(!v.length)continue;
      const k=String(e.k),m=grupos[lod],arr=m.get(k)||[];
      arr.push(...v);m.set(k,arr);
    }
    if(!niveles.includes(2))continue;
    const cx=Math.floor((e.x-sx*1000)/celdaLejana),cy=Math.floor((e.y-sy*1000)/celdaLejana),ck=cx+','+cy,R=clusters.get(ck),p=poligono(e,1);
    const xs=p.filter((_,i)=>i%2===0),ys=p.filter((_,i)=>i%2===1);
    const bb={x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys),h:e.h};
    if(!R)clusters.set(ck,bb);else{R.x0=Math.min(R.x0,bb.x0);R.x1=Math.max(R.x1,bb.x1);R.y0=Math.min(R.y0,bb.y0);R.y1=Math.max(R.y1,bb.y1);R.h=Math.max(R.h,bb.h);}
  }
  for(const a of clusters.values()){
    const e={x:(a.x0+a.x1)/2,y:(a.y0+a.y1)/2,hw:(a.x1-a.x0)/2,hd:(a.y1-a.y0)/2,ux:1,uy:0,h:a.h,k:0};
    const v=geoTriangulos(poligono(e,1),e,{sx,sy,base,cota});
    const arr=grupos[2].get('0')||[];arr.push(...v);grupos[2].set('0',arr);
  }
  return grupos;
}
function escribir(datos,salida,hashOrigen,niveles=[0,1,2],celdaLejana=40){
  if(!Number.isSafeInteger(celdaLejana)||celdaLejana<20||celdaLejana>200)error('celda LOD2 fuera de [20,200] m');
  if(!Array.isArray(niveles)||!niveles.length||new Set(niveles).size!==niveles.length||niveles.some(n=>![0,1,2].includes(n)))error('niveles inválidos');
  const {sets,cota}=datos;fs.mkdirSync(salida,{recursive:true});
  const manifest={version:2,origen_sha256:hashOrigen,sector_m:1000,celda_lod2_m:celdaLejana,formato:'posiciones-i16-q20-o-f32-xyz-yup-deflateraw',niveles,sectores:{},bytes_compresos:0,bytes_por_lod:[0,0,0],triangulos:[0,0,0]};
  for(const [key,s] of [...sets].sort((a,b)=>a[0].localeCompare(b[0]))){
    const salidaSector={origen:[s.sx*1000,s.base,s.sy*1000],edificios:s.edificios.length,lod:{}};
    const grupos=mallasSector(s,cota,niveles,celdaLejana);
    for(const lod of niveles){
      const info=[],bytes=[];let ofs=0;
      for(const [k,arr] of [...grupos[lod]].sort((a,b)=>Number(a[0])-Number(b[0]))){
        if(!arr.every(Number.isFinite))error('coordenadas NaN en sector '+key);
        const q=arr.map(x=>Math.round(x*20));
        const compacto=q.every(x=>x>=-32768&&x<=32767);
        const f=compacto?Int16Array.from(q):Float32Array.from(arr);
        const buffer=Buffer.from(f.buffer,f.byteOffset,f.byteLength);
        info.push({clase:Number(k),offset:ofs,bytes:buffer.byteLength,triangulos:arr.length/9,codificacion:compacto?'i16q20':'f32',escala_m:compacto?0.05:1});
        bytes.push(buffer);ofs+=buffer.byteLength;manifest.triangulos[lod]+=arr.length/9;
      }
      const bin=zlib.deflateRawSync(Buffer.concat(bytes),{level:6});
      const filename='sector_'+s.sx+'_'+s.sy+'_lod'+lod+'.bin';
      fs.writeFileSync(path.join(salida,filename),bin);manifest.bytes_compresos+=bin.length;manifest.bytes_por_lod[lod]+=bin.length;
      salidaSector.lod[lod]={archivo:filename,bytes:bin.length,sha256:SHA(bin),grupos:info};
    }
    manifest.sectores[key]=salidaSector;
    s.edificios.length=0;
  }
  fs.writeFileSync(path.join(salida,'manifiesto.json'),JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}
function selfTest(){
  const J={kinds:['casa'],lista:[
    [10,10,5,4,0,2,0,null],[22,10,6,4,.4,3,0,null],
    [80,80,8,6,0,1,0,[70,75,90,75,90,90,84,90,84,83,70,83]],
    [1100,60,6,6,0,4,0,null]
  ]};
  const z=Buffer.alloc(120*120*2);for(let i=0;i<120*120;i++)z.writeInt16LE(1450+i%120,i*2);
  const fake={meta:{formato:'MC4',tile:10,capas:{}},capa(n){return n==='edificios'?Buffer.from(JSON.stringify(J)):z;}};
  fake.meta.capas.edificios={formato:'EDJ'};fake.meta.capas.relieve={tipo:'i16',w:120,h:120,paso:1};
  const S=construir(fake),outdir=fs.mkdtempSync(path.join(os.tmpdir(),'mc-r6-'));
  try{
    const m=escribir(S,outdir,'sintetico');
    assert.equal(S.sets.size,2);assert.equal(Object.keys(m.sectores).length,2);
    assert.equal(m.sectores['0,0'].edificios,3);assert.deepEqual(m.niveles,[0,1,2]);
    for(const t of Object.values(m.sectores))for(const o of Object.values(t.lod)){
      const b=fs.readFileSync(path.join(outdir,o.archivo));assert.equal(SHA(b),o.sha256);
      const inflated=zlib.inflateRawSync(b),total=o.grupos.reduce((s,g)=>s+g.bytes,0);
      assert.equal(inflated.length,total);assert(o.grupos.every(g=>g.codificacion==='i16q20'?g.bytes%18===0:g.bytes%36===0));
    }
    assert(m.triangulos[0]>0&&m.triangulos[1]>0&&m.triangulos[2]>0);
    const cz=zlib.deflateRawSync(z),cj=zlib.deflateRawSync(Buffer.from(JSON.stringify(J)));
    const mcmeta={formato:'MC4',capas:{relieve:{o:0,n:cz.length,raw:z.length},edificios:{o:cz.length,n:cj.length,raw:Buffer.byteLength(JSON.stringify(J)),formato:'EDJ'}}};
    const head=Buffer.from(JSON.stringify(mcmeta)),buf=Buffer.concat([Buffer.from('MC4\0'),Buffer.alloc(4),head,cz,cj]);buf.writeUInt32LE(head.length,4);
    assert.equal(edificiosDe(mc4(buf)).length,4);
    const vv=n=>{const out=[];do{let b=n&127;n=Math.floor(n/128);out.push(n?b|128:b);}while(n);return out;};
    const zz=n=>n<0?-2*n-1:2*n;
    const pos=Buffer.from([40,40,20,0].flatMap(x=>vv(zz(x))));
    const pol=Buffer.from([4,-4,-4,8,0,0,8,-8,0].flatMap((x,i)=>vv(i===0?x:zz(x))));
    const idx=Buffer.from([2,pos.length,pol.length].flatMap(vv));
    const dims=Buffer.from([20,16,24,16]),ang=Buffer.from([0,0]),piso=Buffer.from([2,3]),kin=Buffer.from([0,16]);
    const raw=Buffer.concat([idx,pos,dims,ang,piso,kin,pol]);
    const fakeED1={meta:{formato:'MC4',tile:10,capas:{edificios:{formato:'ED1',nx:1,ny:1,R:640,Q:4,cuantos:2,len:[idx.length,pos.length,dims.length,ang.length,piso.length,kin.length,pol.length]},relieve:{tipo:'i16',w:120,h:120,paso:1}}},capa(n){return n==='edificios'?raw:z;}};
    const leidos=edificiosDe(fakeED1);assert.equal(leidos.length,2);
    assert.equal(leidos[0].x,10);assert.equal(leidos[1].x,15);assert.equal(leidos[1].P.length,8);
    assert.equal(construir(fakeED1).sets.get('0,0').edificios.length,2);
    console.log('✓ R6: MC4 EDJ+ED1, 2 sectores, 3 LOD, '+m.triangulos.join('/')+' triángulos, '+m.bytes_compresos+' bytes comprimidos y checksums OK');
  }finally{fs.rmSync(outdir,{recursive:true,force:true});}
}
function exportarHuellas(c,salida,hashOrigen){
  // Solo preparación local para la auditoría R3/R4; NUNCA se empaqueta por defecto.
  const ec=c.meta.capas.comuna, raw=ec&&ec.tipo==='u8'?c.capa('comuna'):null;
  let nombres=[];
  try{nombres=JSON.parse(c.capa('info').toString('utf8')).comunas||[];}catch{};
  const ms=ec?ec.paso*c.meta.tile:0,w=ec?.w||0,h=ec?.h||0;
  const nombre=e=>{
    if(!raw||!ms||!w||!h)return 'sin_comuna';
    const i=limite(Math.floor(e.x/ms),0,w-1),j=limite(Math.floor(e.y/ms),0,h-1),code=raw[j*w+i];
    return code>0&&code<=nombres.length?nombres[code-1]:'sin_comuna';
  };
  fs.mkdirSync(path.dirname(salida),{recursive:true});
  const fd=fs.openSync(salida,'w');let n=0;
  try{
    fs.writeSync(fd,JSON.stringify({type:'FeatureCollection',crs:'MC4-LOCAL-METROS',origen_sha256:hashOrigen}).slice(0,-1)+',"features":[');
    for(const e of edificiosDe(c)){
      const P=esquinas(e),anillo=[];
      for(let k=0;k<P.length;k+=2)anillo.push([P[k],P[k+1]]);
      anillo.push(anillo[0]);
      const feature={type:'Feature',id:'edificio-'+n,properties:{comuna:nombre(e),pisos_estimados:e.pis},
        geometry:{type:'Polygon',coordinates:[anillo]}};
      fs.writeSync(fd,(n?',':'')+JSON.stringify(feature));n++;
    }
    fs.writeSync(fd,']}');
  }finally{fs.closeSync(fd);}
  return n;
}

if(process.argv.includes('--self-test'))selfTest();
else if(process.argv.includes('--exportar-huellas')){
  const entrada=arg('--entrada'),salida=arg('--exportar-huellas');
  if(!entrada||!salida)error('faltan --entrada y --exportar-huellas');
  const bytes=fs.readFileSync(entrada),c=mc4(bytes),t=performance.now();
  const edificios=exportarHuellas(c,salida,SHA(bytes));
  console.log(JSON.stringify({ciudad:c.meta.ciudad,edificios,archivo:salida,bytes:fs.statSync(salida).size,elapsed_ms:Math.round(performance.now()-t)},null,2));
}
else{
  const entrada=arg('--entrada'),salida=arg('--salida');
  if(!entrada||!salida)error('uso: node herramientas/precocinar-sectores.mjs --entrada datos/medellin/mundo.mc4 --salida <directorio>');
  const bytes=fs.readFileSync(entrada),c=mc4(bytes),t=performance.now();
  const niveles=arg('--niveles','0,1,2').split(',').map(Number);
  const celdaLejana=Number(arg('--celda-lod2','40'));
  const m=escribir(construir(c),salida,SHA(bytes),niveles,celdaLejana);
  console.log(JSON.stringify({ciudad:c.meta.ciudad,sectores:Object.keys(m.sectores).length,triangulos:m.triangulos,bytes:m.bytes_compresos,bytes_por_lod:m.bytes_por_lod,celda_lod2_m:celdaLejana,elapsed_ms:Math.round(performance.now()-t),rss_mb:Math.round(process.memoryUsage().rss/1048576)},null,2));
}
