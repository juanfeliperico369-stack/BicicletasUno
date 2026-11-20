#!/usr/bin/env node
/* Browser QA del prototipo Turno Cero: no prueba Manhattan real. */
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), {chromium}=require('playwright');
const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const url=pathToFileURL(path.join(raiz,'juegos','getaway','prototipo.html')).href;
const b=await chromium.launch({headless:true});
try{
 for(const [w,h] of [[360,740],[412,860],[900,440],[1440,900]]){
  const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<600});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))errors.push('Red solicitada: '+r.url());});
  await p.goto(url);
  const pre=await p.evaluate(()=>({h:document.documentElement.scrollWidth,view:innerWidth,city:!!window.TC,mission:TC.estado().mission,overlay:!document.querySelector('#portada').hidden}));
  if(pre.h>pre.view+1||!pre.city||pre.mission!==0||!pre.overlay)throw Error('Portada inválida '+w+': '+JSON.stringify(pre));
  await p.click('#iniciar');let init=await p.evaluate(()=>TC.estado());
  await p.keyboard.down('w');await p.waitForTimeout(1000);await p.keyboard.up('w');const fin=await p.evaluate(()=>TC.estado());
  if(fin.player.y>=init.player.y-2||fin.mission!==0||errors.length)throw Error('Control de movimiento/JS '+w+': '+JSON.stringify({init:init.player,fin:fin.player,errors}));
  const touch=await p.evaluate(()=>Array.from(document.querySelectorAll('[data-key]')).every(e=>e.getBoundingClientRect().height>=44));
  if(!touch)throw Error('Botón táctil menor que 44px a '+w);
  await p.close();console.log('✓ Turno Cero '+w+'×'+h+': offline, controles, escena y sin scroll');
 }
 console.log('✓ TURN0 CERO: 4 tamaños aprobados');
}finally{await b.close();}
