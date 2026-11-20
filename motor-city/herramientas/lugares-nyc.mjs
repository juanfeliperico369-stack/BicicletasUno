#!/usr/bin/env node
/* G-H18 · Manhattan desde CommonPlace (NYC Open Data); sin red en tiempo de juego. */
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const BASE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FUENTE='https://data.cityofnewyork.us/City-Government/CommonPlace/t95h-5fsr';
const API='https://data.cityofnewyork.us/resource/t95h-5fsr.json';
const CUOTAS={museo:14,parque:17,puente:8,garaje:3,mirador:3,muelle:3,monumento:2};
function clase(r) {
 const t=String(r.facility_type),d=String(r.facility_domains),n=String(r.feature_name||'').toUpperCase();
 if(/OBSERVATION|OBSERVATORY|LOOKOUT|VIEWPOINT|OVERLOOK/.test(n))return 'mirador';
 if(/PARKING GARAGE|PARKING LOT|GARAGE/.test(n))return 'garaje';
 if(t==='3'&&d==='4')return 'museo';if(t==='4'&&d==='1')return 'parque';
 if(t==='6'&&d==='8')return 'puente';if(t==='6'&&['2','7'].includes(d))return 'muelle';
 if(t==='13'&&d==='1')return 'monumento';return null;
}
const CLAVES=/CENTRAL PARK|BRYANT PARK|BATTERY PARK|RIVERSIDE PARK|WASHINGTON SQUARE|FORT TRYON|HIGH LINE|BROOKLYN BRIDGE|MANHATTAN BRIDGE|WILLIAMSBURG BRIDGE|METROPOLITAN|GUGGENHEIM|WHITNEY|NATURAL HISTORY|MADISON SQUARE/;
/* El tipo oficial identifica instalaciones, no siempre destinos visitables: filtrar accesos privados,
   rampas como puentes y subservicios que distorsionaban el catálogo de lugares. */
const NO_DESTINO=/MAINTENANCE|STORAGE|DEPOT|SERVICE BUILDING|UTILITY|COMFORT STATION|RESTROOM|OPERATIONS CENTER|ELECTRICAL|PUMP HOUSE|FIELD HOUSE|TOILET/;
function visitable(tipo,nombre) {
 const n=nombre.toUpperCase();
 if(NO_DESTINO.test(n))return false;
 if(tipo==='museo')return /MUSEUM|GALLERY|CULTURAL CENTER|ART CENTER|ANNE FRANK CENTER|HISTORICAL SOCIETY|INSTITUTE OF ART/.test(n);
 if(tipo==='parque')return !/STATUE|CAROUSEL|MAINTENANCE|BUILDING|STORAGE|RESTROOM/.test(n) && /(?:PARK|GARDEN|PLAYGROUND|GREENWAY|SQUARE|ESPLANADE|PROMENADE|RECREATION AREA)$/.test(n);
 if(tipo==='puente')return /BRIDGE/.test(n) && !/\b(?:RB|RP|RAMP|APPROACH|ENTRANCE|EXIT|EB|WB|EASTBOUND|WESTBOUND|SERVICE ROAD)\b/.test(n);
 if(tipo==='garaje')return /PARKING GARAGE|PUBLIC PARKING|COMMERCIAL GARAGE/.test(n) && !/DSNY|DPR|FDNY|NYPD|POLICE|SANITATION|FIRE DEPT|RAMBLE|NYC DOT|CITY SERVICE|MUNICIPAL|OPERATIONS/.test(n);
 if(tipo==='mirador')return /OBSERVATION|OBSERVATORY|LOOKOUT|VIEWPOINT|OVERLOOK/.test(n);
 if(tipo==='muelle')return !/BROOKLYN BRIDGE PARK|STATEN ISLAND|JERSEY CITY|HOBOKEN/.test(n);
 if(tipo==='monumento')return /MONUMENT|MEMORIAL|STATUE|LANDMARK|HISTORIC SITE/.test(n);
 return false;
}
function lugarUnico(item) {
 const n=item.nombre.toUpperCase();
 if(item.tipo==='puente') {
   const q=n.match(/^(.+? BRIDGE)\b/);
   return item.tipo+':' +(q?q[1]:n);
 }
 if(item.tipo==='parque')return item.tipo+':'+n.replace(/\b(?:NORTH|SOUTH|EAST|WEST)\s+(?:ENTRANCE|EXIT|SIDE)$/,'').trim();
 return item.tipo+':'+n;
}

function transformar(filas) {
 const a=[],nombres=new Set();
 for(const x of filas){
  const t=clase(x),p=x.the_geom?.coordinates,n=String(x.feature_name||'').trim().replace(/\s+/g,' ');
  if(String(x.boroughcode)!=='1'||!t||!p||!x.placeid||n.length<4||!visitable(t,n))continue;
  const [lon,lat]=p.map(Number);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<40.68||lat>40.88||lon< -74.03||lon> -73.90)continue;
  const k=n.toLowerCase();if(nombres.has(k))continue;nombres.add(k);
  a.push({nombre:n,lat:+lat.toFixed(7),lon:+lon.toFixed(7),tipo:t,id:String(x.placeid),fuente:FUENTE,acceso:'por_verificar'});
 }
 a.sort((x,y)=>Number(CLAVES.test(y.nombre.toUpperCase()))-Number(CLAVES.test(x.nombre.toUpperCase()))||x.nombre.localeCompare(y.nombre,'en'));
 const seleccion=[],ids=new Set(),claves=new Set();
 const incluir=x=>{
  const clave=lugarUnico(x);
  if(!ids.has(x.id)&&!claves.has(clave)){ids.add(x.id);claves.add(clave);seleccion.push(x)}
 };
 /* Priorizar hitos reconocibles y elegir municipios/latitudes diferentes cuando hay oferta. */
 for(const [tipo,max] of Object.entries(CUOTAS)) {
   const opciones=a.filter(x=>x.tipo===tipo), grupos=[[],[],[],[],[]];
   for(const p of opciones)grupos[Math.max(0,Math.min(4,Math.floor((p.lat-40.68)/.04)))].push(p);
   const antes=seleccion.length;
   for(let i=0;i<opciones.length && seleccion.length-antes<max;i++){
     const g=grupos[i%5]; if(g.length)incluir(g.shift());
   }
   for(const p of opciones){if(seleccion.length-antes>=max)break;incluir(p);}
 }
 for(const x of a){if(seleccion.length>=50)break;incluir(x);}
 if(seleccion.length!==50)throw Error('CommonPlace no devolvió 50: '+seleccion.length);
 return seleccion.sort((a,b)=>a.tipo.localeCompare(b.tipo,'es')||a.nombre.localeCompare(b.nombre,'en'));
}
if(process.argv.includes('--probar')) {
 const tip=[['3','4','Museum'],['4','1','Park'],['6','8','Bridge'],['6','7','Ferry Landing'],['13','1','Memorial'],['7','4','Garage'],['4','1','Observation Deck']];
 const d=Array.from({length:140},(_,i)=>{const [facility_type,facility_domains,n]=tip[i%tip.length];return {facility_type,facility_domains,feature_name:n+' '+i,boroughcode:'1',placeid:String(i+1),the_geom:{coordinates:[-73.97,40.75]}}});
 const v=transformar(d);if(v.length!==50||new Set(v.map(x=>x.id)).size!==50||v.some(x=>/MAINTENANCE|DEPOT|STORAGE|\bDSNY\b/.test(x.nombre)))throw Error('Selección incorrecta');console.log('✓ 50 puntos válidos (autoprueba sin internet)');
}else {
 const where=new URL(API);where.searchParams.set('$select','the_geom,feature_name,placeid,facility_type,facility_domains,boroughcode');where.searchParams.set('$where',"boroughcode='1'");where.searchParams.set('$limit','50000');
 let res=await fetch(where,{signal:AbortSignal.timeout(60000)});
 if(!res.ok){where.searchParams.delete('$where');res=await fetch(where,{signal:AbortSignal.timeout(60000)});}
 if(!res.ok)throw Error('NYC API HTTP '+res.status);
 const v=transformar(await res.json()),dest=path.join(BASE,'contenido','nueva-york-lugares.json');
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,JSON.stringify({version:1,cantidad:50,fecha_consulta:new Date().toISOString().slice(0,10),fuente:FUENTE,nota:'Puntos oficiales aproximados a lugares, no garantía de acceso público.',lugares:v},null,2)+'\n');
 console.log('✓ Manhattan: 50 sitios reales desde CommonPlace '+JSON.stringify(Object.fromEntries(Object.keys(CUOTAS).map(k=>[k,v.filter(x=>x.tipo===k).length]))));
}
