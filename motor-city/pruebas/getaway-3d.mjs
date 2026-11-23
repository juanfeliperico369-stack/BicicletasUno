#!/usr/bin/env node
/* E2E real WebGL2 under Xvfb: all four viewport sizes + complete mission flow.
   Does not assert real Manhattan geography or mobile hardware FPS. */
import {readFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(path.join(root,'juegos/getaway/turno-cero-accion-3d.html'),'utf8');
const output=path.join(root,'dist/getaway-3d');mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:!process.env.DISPLAY,args:['--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
try{
 for(const [w,h] of [[360,740],[412,860],[900,440],[1440,900]]){
  const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<600});
  const p=await context.newPage(),errors=[],requests=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.on('request',r=>requests.push(r.url()));
  await p.evaluate(()=>{window.__qa=true});
  await p.setContent(html,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>window.TC3D?.estado().drawCalls>20,{timeout:15000});
  const pre=await p.evaluate(()=>({s:TC3D.estado(),overflow:document.documentElement.scrollWidth-innerWidth,touch:Array.from(document.querySelectorAll('[data-hold],[data-action]')).every(e=>e.getBoundingClientRect().height>=44),assets:TC3D.assets, botonesDesbordan:[...document.querySelectorAll('.actions button')].some(x=>x.scrollWidth>x.clientWidth+1)}));
  if(!pre.s.webgl||pre.s.stage!==0||pre.overflow>1||!pre.touch||pre.botonesDesbordan||pre.assets.length!==4)throw Error(`Inicio 3D ${w}: ${JSON.stringify(pre)}`);
  await p.click('#startGame');
  const before=await p.evaluate(()=>TC3D.estado().player.z);
  await p.keyboard.down('w');await p.waitForTimeout(450);await p.keyboard.up('w');
  const after=await p.evaluate(()=>TC3D.estado().player.z);
  if(!(after<before-.35))throw Error(`Movimiento a pie falló ${w}: ${before}=>${after}`);
  await p.screenshot({path:path.join(output,`juego-${w}x${h}.png`)});
  await p.evaluate(()=>{TC3D.qa.teleport(-28,-32);TC3D.accion('interact')});
  if(await p.evaluate(()=>TC3D.estado().stage)!==1)throw Error('Recogida falló');
  await p.evaluate(()=>{TC3D.qa.teleport(0,-3);TC3D.accion('interact')});
  await p.waitForFunction(()=>TC3D.estado().stage===2,null,{timeout:13000});
  await p.evaluate(()=>TC3D.accion('scan'));
  if(await p.evaluate(()=>TC3D.estado().vision)<=0)throw Error('Escáner falló');
  await p.evaluate(()=>TC3D.accion('drone'));
  if(await p.evaluate(()=>TC3D.estado().mode)!=='drone')throw Error('Dron falló');
  await p.keyboard.down('w');await p.waitForTimeout(280);await p.keyboard.up('w');
  await p.evaluate(()=>{TC3D.accion('drone');TC3D.accion('decoy')});
  if(await p.evaluate(()=>TC3D.estado().decoys)!==1)throw Error('Señuelo falló');
  await p.evaluate(()=>{TC3D.qa.teleport(-28,28);TC3D.accion('car')});
  if(await p.evaluate(()=>TC3D.estado().stage)!==3)throw Error('Cambio a conducción falló');
  const carBefore=await p.evaluate(()=>TC3D.estado().car.z);
  await p.keyboard.down('w');await p.waitForTimeout(540);await p.keyboard.up('w');
  if(Math.abs((await p.evaluate(()=>TC3D.estado().car.z))-carBefore)<.7)throw Error('Conducción no mueve');
  await p.evaluate(()=>TC3D.qa.moveCar(56,56));
  await p.waitForFunction(()=>TC3D.estado().stage===4,null,{timeout:5000});
  await p.click('#protect');
  if(await p.evaluate(()=>TC3D.estado().finished)!=='protect')throw Error('Decisión final falló');
  if(errors.length||requests.length)throw Error(`Errores ${w}: ${JSON.stringify({errors,requests})}`);
  await context.close();
  console.log(`✓ Turno Cero WebGL2 ${w}×${h}: 3D + misión completa + offline`);
 }
 console.log('✓ TURNO CERO 3D: 4 formatos, 4 mallas, gadgets, coche, finales');
}finally{await browser.close()}
