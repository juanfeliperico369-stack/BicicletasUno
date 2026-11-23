#!/usr/bin/env node
/* C5-01 · Vuelcos en dinámica real: pruebas deterministas sin navegador.
   Ejecutar después de node motor.mjs construir. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ctx={console,Buffer,TextEncoder,TextDecoder,performance,setTimeout,process};
ctx.globalThis=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'dist/motor.js'),'utf8'),ctx);
const MC=ctx.MC,V=MC.Vuelcos;
assert(V && typeof V.paso==='function','El motor debe publicar MC.Vuelcos');
const coche={clase:'auto',masa:1450,largo:4.65,ancho:1.82,vmax:32,acc:4},camion={clase:'pesado',masa:6500,largo:7,ancho:2.4,vmax:25,acc:2.2};
const H=MC.Dinamica.hoja(coche),Hp=MC.Dinamica.hoja(camion);
assert(V.umbral(H,'auto')>8&&V.umbral(H,'auto')<25,'Umbral de vuelco de automóvil fuera de rango');
assert(Number.isFinite(V.umbral(Hp,'pesado')),'Umbral de pesado inválido');
function cuerpo(veh=coche){return {veh,v:20,a:0,ia:false,eventos:[],_din:{u:20,w:0,r:0,ay:0},vuelco:0,normalChoque:[0,1],impacto:0};}
MC.opciones.manejo='real';
const normal=cuerpo();for(let i=0;i<60;i++){normal._din.ay=Math.sin(i*.08)*2;V.paso(normal,1/60);}
assert(!normal.eventos.includes('vuelco')&&normal.vuelco===0,'El manejo normal no debe producir vuelcos');
const curva=cuerpo();
for(let i=0;i<10;i++) {curva._din.ay=30;V.paso(curva,1/60);}
assert.equal(curva.eventos.filter(x=>x==='vuelco').length,1,'Vuelco debe activarse una sola vez en lateral extrema');
assert(curva._vuelco.t>=0,'El vuelco debe iniciar estado temporal');
curva.eventos.length=0;curva._din.ay=0;
let max=0,fin=0,frames=0;
for(let i=0;i<200;i++){const esta=V.paso(curva,1/60);max=Math.max(max,Math.abs(curva.vuelco));if(!esta&&curva.eventos.includes('enderezado')){fin++;frames=i;break;}}
assert(max>=Math.PI*.97,'La carrocería debe completar la caída lateral');
assert(fin===1&&frames>100&&frames<180,'Debe auto-enderezarse aproximadamente a los 2.65 s');
assert.equal(curva.vuelco,0,'Debe terminar nivelado');
assert(Math.abs(curva.v)<20,'Durante el vuelco debe frenar');
const golpe=cuerpo();golpe._din.ay=0;golpe.impacto=13;golpe.eventos.push('choque');
assert(V.paso(golpe,1/60)&&golpe.eventos.includes('vuelco'),'Choque lateral fuerte debe volcar');
const frontal=cuerpo();frontal.normalChoque=[1,0];frontal.impacto=16;frontal.eventos.push('choque');V.paso(frontal,1/60);
assert.equal(frontal.vuelco,0,'Choque frontal no debe volcar por defecto');
const quieto=cuerpo();quieto.v=1;quieto._din.ay=35;for(let i=0;i<20;i++)V.paso(quieto,1/60);
assert.equal(quieto.vuelco,0,'Coche lento no debe volcar solo por aceleración');
const familiar=cuerpo();MC.opciones.manejo='arcade';familiar._din.ay=30;for(let i=0;i<20;i++)V.paso(familiar,1/60);
assert.equal(familiar.vuelco,0,'La física de familia arcade debe quedar sin cambios');
MC.opciones.manejo='real';const ia=cuerpo();ia.ia=true;ia._din.ay=30;for(let i=0;i<20;i++)V.paso(ia,1/60);
assert.equal(ia.vuelco,0,'No forzar vuelcos en IA sin simulación de tráfico');
const moto=cuerpo({...coche,clase:'moto'});moto._din.ay=30;for(let i=0;i<20;i++)V.paso(moto,1/60);
assert.equal(moto.vuelco,0,'El sistema lateral de motos existente debe prevalecer');
console.log('✓ C5-01: 11 verificaciones de vuelco, choque, umbrales, enderezado y compatibilidad');
