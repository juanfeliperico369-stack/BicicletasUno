#!/usr/bin/env node
/* Auditoría automática G-H21/22/23, Node 22, sin dependencias. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const f=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const q=JSON.parse(f('contenido/paradas-carretera.json'));
assert(q.autor?.includes('Gemini'),'se conserva autoría del catálogo original');
for(const registros of Object.values(q.biomas))for(const item of registros){
 assert(item.id && item.nombre_es && item.nombre===item.nombre_es && item.nombre_en,'id/ES/EN');
 assert(Array.isArray(item.rutas) && item.rutas.length,'rutas específicas');
}
const biomas=['costa','llanura','desierto','bosque','montana','nieve','lagos'];
/* G-H22 unido: 4 de Antigravity + 4 de ChatGPT por bioma */
for(const b of biomas){assert.equal(q.biomas[b]?.length,8,'8 paradas '+b);for(const x of q.biomas[b]) assert(x.nombre&&x.nombre_en&&x.ambiente&&x.tipo);}
assert.equal(new Set(biomas.flatMap(b=>q.biomas[b].map(x=>x.nombre))).size,56);
const fuente=f('js/13-planeta.js'),match=fuente.match(/^const PARADAS_RUTA = (\{.*\});$/m);
assert(match,'dataset embebido en generador de carretera');
assert.equal(JSON.stringify(JSON.parse(match[1])),JSON.stringify(q.biomas),'el generador usa el catálogo tal cual');
assert(fuente.includes('biomaP = biomas[bioma(y)]'),'la selección debe obedecer al bioma');
const historia=f('juegos/getaway/10-contenido.js');
assert(!/La valentina finca hotel/i.test(historia),'un negocio real no puede ser guarida ficticia');
assert(/gu_finca: .*ficcion: true/.test(historia),'la finca debe identificarse como ficticia');
assert(!/a través de los muros por 8 s/i.test(historia),'el visor no atraviesa paredes');
const n=[...historia.matchAll(/^\s*(\w+): \{ mundo: '[^']+', n: /gm)];
assert.equal(n.length,19,'19 referencias narrativas');
const dib=f('juegos/getaway/40-dibujo.js');
const mat=dib.match(/const LENGUAJE_SUAVE = \[[\s\S]*?\];\s*const suave = [^\n]+;/);
assert(mat,'filtro de lenguaje');
const fn=vm.runInNewContext(mat[0]+'\n suave',{leerG:()=>({suave:true})});
for(const s of ['¡Quítense, hijueputas!','Hoy no, malparidos.','¡Párese, gonorrea!','Tombos, mierda y cabrón']){
 const k=fn(s);assert(!/(hijueput|malparid|gonorrea|tombos|mierda|cabr[oó]n)/i.test(k),'se escapó: '+k);
}
const fuerte=vm.runInNewContext(mat[0]+'\n suave',{leerG:()=>({suave:false})});
assert.equal(fuerte('¡Párese, gonorrea!'),'¡Párese, gonorrea!');
console.log('G-H21/22/23: 19 lugares inventariados, 56 paradas, lenguaje suave y fuerte OK');


/* C-M36: el audio espacial es una función pura y sus límites se prueban sin navegador. */
const auCtx={MC:{},clamp:(v,a,b)=>Math.max(a,Math.min(b,v))};
vm.runInNewContext(f('js/61-sonido.js'),auCtx);
const audio=auCtx.MC.PersecucionAudio;
assert(audio && typeof audio.plan==='function');
const cerca=audio.plan({distancia:10,velocidadRadial:-25}),lejos=audio.plan({distancia:130,velocidadRadial:25,ocluido:true});
assert(cerca.volumen>lejos.volumen && cerca.doppler>1 && lejos.doppler<1);
assert(audio.plan({distancia:20,ocluido:true}).corte < audio.plan({distancia:20}).corte);
assert(audio.motor({velocidad:22,aceleracion:1,activo:true}).volumen>0);
assert.equal(audio.motor({velocidad:22,aceleracion:1,activo:false}).volumen,0);
const muro={edificioEn:(x,y)=>x>=4&&x<=6&&Math.abs(y)<1};
assert.equal(audio.ocluido(muro,{x:0,y:0},{x:10,y:0}),true);
assert.equal(audio.ocluido(muro,{x:0,y:3},{x:10,y:3}),false);
console.log('C-M36: atenuación, Doppler, filtro y oclusión OK');

/* C-M32: IA terrestre determinista con memoria limitada y geometría de cobertura. */
const pieCtx={MC:{}};
vm.runInNewContext(f('js/28-accion-pie.js'),pieCtx);
const pie=pieCtx.MC.AccionPie;
const libre={edificioEn:()=>false};
const pared={edificioEn:(x,y)=>x>4&&x<6&&y>-2&&y<2};
assert.equal(pie.ver({x:0,y:0,a:0,vista:24,cono:1.05},{x:8,y:0},libre),true);
assert.equal(pie.ver({x:0,y:0,a:0,vista:24,cono:1.05},{x:8,y:0},pared),false);
assert.equal(pie.ver({x:0,y:0,a:0,vista:24,cono:1.05},{x:-8,y:0},libre),false);
const guard={x:0,y:0,a:0,a0:0,origen:{x:0,y:0},fase:0,vista:24,cono:1.05};
const j={x:8,y:0};let observado=pie.paso(guard,.04,{jugador:j,mundo:libre,alarma:true});
assert(observado.ve && guard.ultima.x===8);
j.x=180;j.y=100;
for(let i=0;i<40;i++)pie.paso(guard,.05,{jugador:j,mundo:libre,alarma:true});
assert(guard.ultima.x===8 && guard.estado==='busqueda','no conoce el nuevo lugar del jugador oculto');
assert(guard.x<8,'avanza a ultima vista sin teleport');
const cubierto={x:0,y:0,a:0,a0:0,origen:{x:0,y:0},fase:0,ultima:{x:10,y:0},busquedaT:3,vista:24,cono:1.05};
for(let i=0;i<25;i++)pie.paso(cubierto,.05,{jugador:{x:100,y:30},mundo:pared,alarma:true});
assert(cubierto.x < 4.1,'no atraviesa edificios al buscar');
console.log('C-M32: detección, cobertura, memoria y persecución a pie OK');


/* C-M33 · LOD de geometría GLB: dos niveles con triángulos estables y sin alterar el modelo. */
const modeloCtx={MC:{},Malla:class {constructor(){this.d=[];}},clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),hex3:()=>[1,1,1]};
vm.runInNewContext(f('js/45-glb.js'),modeloCtx);
const mdl=modeloCtx.MC.Modelos, tri=new Float32Array(120*21);
for(let i=0;i<120;i++){
 const o=i*21,sz=1+i/120;
 tri[o]=i%8;tri[o+1]=0;tri[o+2]=0;
 tri[o+3]=i%8+sz;tri[o+4]=0;tri[o+5]=0;
 tri[o+6]=i%8;tri[o+7]=sz;tri[o+8]=0;
 tri[o+9]=0;tri[o+10]=0;tri[o+11]=1;
 tri[o+12]=.5;tri[o+13]=.5;tri[o+14]=.5;
}
const mo={id:'vehiculo_test',tris:tri,n:120,frente:'x',largo:4,ancho:2,alto:1.7};
const lod0=mdl.indicesLOD(mo,0),lod1=mdl.indicesLOD(mo,1),lod2=mdl.indicesLOD(mo,2);
assert(lod0===null && lod1.length===77 && lod2.length===36);
assert(lod2.every(i=>lod1.includes(i)),'LOD2 es subconjunto de LOD1');
assert.equal(mdl.nivelLOD(0),0);assert.equal(mdl.nivelLOD(70),1);assert.equal(mdl.nivelLOD(140),2);
assert.equal(mdl.nivelLOD(1,{forzarLOD:2}),2);
assert.strictEqual(mdl.indicesLOD(mo,1),lod1,'caché por modelo');
const mL=new modeloCtx.Malla();
mL.modelo(mo,0,0,0,0,{distancia:150});
assert.equal(mL.d.length,36*30,'la malla dinámica dibuja el número de triángulos LOD2');
const full=new modeloCtx.Malla();full.modelo(mo,0,0,0,0,{distancia:0});
assert.equal(full.d.length,120*30,'distancia cero conserva 100 % de geometría');
console.log('C-M33 · LOD0/LOD1/LOD2: 120, 77, 36 triángulos, caché y render OK');


/* C-M35: piezas desprendibles, gravedad, restitución, cota del suelo y limpieza. */
const piezCtx={MC:{},hex3:()=>[.3,.3,.3]};
vm.runInNewContext(f('js/32-piezas.js'),piezCtx);
const piezas=new piezCtx.MC.Piezas({cota:()=>0},{max:2});
assert.equal(piezas.soltar('invalida',{x:0,y:0,a:0}),null);
const carro={x:5,y:5,a:0,v:8};
const capa=piezas.soltar('capo',carro), puerta=piezas.soltar('puerta_izq',carro);
assert(capa && puerta && capa.z>0);
const inicial=capa.z;
piezas.paso(.05);assert(capa.z>inicial,'la pieza despega del vehículo');
for(let i=0;i<500;i++)piezas.paso(.05);
assert(capa.z>=.08,'no atraviesa el suelo');assert(piezas.lista.length<=2);
const antes=piezas.lista.length;
piezas.soltar('rueda',carro);
assert(piezas.lista.length<=2,'límite de debris');
const mock={n:0,cajaF(){this.n++},esfera(){this.n++},cil(){this.n++}};
piezas.malla(mock,(x,y,z)=>[x,z,y],carro,150);
assert(mock.n>0,'se dibuja geometría de las piezas');
piezCtx.MC.Piezas.motorDano(mock,[0,0,0],0,{f:.95},1);
assert(mock.n>1,'humo/fuego son primitivas 3D');
piezas.limpiar();assert.equal(piezas.lista.length,0);
console.log('C-M35 · capó, puertas y llanta: gravedad, rebote, geometría 3D y limpieza OK');


/* C-M31: el módulo WebGL2 no inicia WebGL si no hay GPU; deja el mundo 2D operativo. */
const glSrc=f('js/13-globo-gpu.js');
assert(glSrc.includes('#version 300 es'),'shader WebGL2');
assert(glSrc.includes('uniform float uStops[11]'),'11 bandas de biomas');
assert(glSrc.includes('uJugador'),'indicador del jugador');
assert(glSrc.includes('MC.GloboGPU=GloboGPU'),'la API es pública');
const glCtx={MC:{},Math};
vm.runInNewContext(glSrc,glCtx);
const falso=new glCtx.MC.GloboGPU({getContext:()=>null},[]);
assert.equal(falso.ok,false);
assert.equal(falso.dibujar(360,740,{}),false);
const pantalla=f('juegos/getaway/index.html');
assert(pantalla.includes('id="ggl"')&&pantalla.includes('id="gcv"'),'2 lienzos: GPU y 2D, conservan fallback');
assert(f('juegos/getaway/40-dibujo.js').includes('planeta.globo(c.getContext'),'fallback 2D intacto');
console.log('C-M31: shader WebGL2 y fallback 2D disponibles');


/* C-M34 parcial: sectores de 1 km y presupuesto de caché de edificios ED1. */
const scCtx={MC:{}};
vm.runInNewContext(f('js/10-sectores.js'),scCtx);
const bldCache=new Map();
for(let i=0;i<90;i++)bldCache.set(i+(i%6)*60,[{id:i}]);
const fakeWorld={_ED:{cache:bldCache,R:640,nx:60},edificiosEn:(x0,y0,x1,y1)=>[{x0,y0,x1,y1}]};
const cacheSector=new scCtx.MC.Sectores1km(fakeWorld,{lado:1000,maxRegiones:20,maxSectores:9});
assert.deepEqual(JSON.parse(JSON.stringify(cacheSector.zona(2505,3999))),{sx:2,sy:3});
const previo=cacheSector.pedir(2,3);assert.equal(previo.edificios().length,1);
assert.strictEqual(cacheSector.pedir(2,3),previo);
const infoSector=cacheSector.actualizar(2505,3999);
assert(infoSector.antes>=80&&infoSector.despues<=20&&infoSector.sectores===9);
assert(infoSector.evictas===infoSector.antes-infoSector.despues);
assert([...fakeWorld._ED.cache.keys()].every(k=>k>=0),'cache consistente');
cacheSector.limpiar();assert.equal(cacheSector.cache.size,0);
console.log('C-M34 parcial: sectores 1 km con LRU, ED1 decodificado acotado a 20 regiones');


/* G-H23: gramática y capitalización correctas, contratos también suavizados. */
for (const [frase, esperado] of [
 ['¡Hijueputas!','¡Desgraciados!'],
 ['Malparida','Miserable'],
 ['malparidos','miserables'],
 ['¡Tombo!','¡Agente!'],
 ['¡Güevones!','¡Bobos!'],
 ['El sapo','El informante']
]) assert.equal(fn(frase),esperado,'lenguaje suave: '+frase);
const histSrc=f('juegos/getaway/30-historia.js');
assert(histSrc.includes('suave(c.n)') && histSrc.includes('suave(c.texto)'),'filtrar título y descripción de contratos');
console.log('G-H23 Gemini · capitalización, singular/plural, insultos y contratos OK');


/* C-M32 + Claude 4.0.2: persecución sólo con visión, nunca teletransporta tras pared. */
const sensor={x:0,y:0,a:0,a0:0,vista:24,cono:1.05,origen:{x:0,y:0}};
const presa={x:12,y:0};
const bloqueo=pie.perseguir(sensor,presa,pared,.05);
assert.equal(bloqueo.visible,false);
assert.equal(sensor.x,0,'no persigue al jugador invisible');
const okVista=pie.perseguir(sensor,presa,libre,.05);
assert(okVista.visible&&okVista.movio&&sensor.x>0);
const ultimaVista=sensor.ultima.x;
presa.x=200;presa.y=100;
const ciega=pie.perseguir(sensor,presa,libre,.05);
assert(!ciega.movio&&!ciega.golpe&&sensor.ultima.x===ultimaVista);
const cercaGuard={x:0,y:0,a:0,vista:24,cono:1.05};
assert(pie.perseguir(cercaGuard,{x:1,y:0},libre,.05).golpe,'sólo golpea visible y próximo');
const bloqueada={x:0,y:0,a:0,vista:24,cono:1.05};
assert(!pie.perseguir(bloqueada,{x:5,y:0},pared,.05).golpe,'no golpea tras un muro');
console.log('C-M32 · persecución tras alarma respeta línea de visión, obstáculos y último avistamiento');


/* G-H20: cambio de modo invalida diálogos/narración previos sin resolverlos en segundo plano. */
const inicio=f('juegos/getaway/20-juego.js');
const historiaE=f('juegos/getaway/30-historia.js');
assert(inicio.includes('const token = G.narrativaEpoch || 0') && inicio.includes('if (token !== (G.narrativaEpoch || 0)) return;'));
assert(historiaE.includes('G.narrativaEpoch = (G.narrativaEpoch || 0) + 1'));
assert(historiaE.includes("querySelectorAll('.dialogo')") && historiaE.includes('Subt.limpiar()'));
console.log('G-H20 · diálogos inválidos cancelados y subtítulos limpios al entrar Calle libre');


/* G-H22: catálogo Gemini por rutas; G-H24: sólo ciudad activa en caché MC4. */
assert(fuente.includes("q.rutas.includes(op.id)"),'sólo elegir paradas compatibles con carretera');
assert(fuente.includes("id: d.id"),'pasar id de ruta al generador');
assert(f('juegos/getaway/20-juego.js').includes('if (key !== id) planeta.cache.delete(key)'), 'liberar anteriores sólo al cambiar de ciudad');
assert(f('juegos/getaway/20-juego.js').includes("tipo === 'car_repair'"),'reparación por tipo estructurado, no sólo nombre');
console.log('Gemini G-H22/G-H24: metadatos de ruta y una sola ciudad en caché OK');


/* Gemini C-M31: planeta WebGL2 debe caber en modo vertical y mantener etiquetas en Canvas. */
const shaderG=f('js/13-globo-gpu.js');
const etiquetasG=f('juegos/getaway/40-dibujo.js');
assert(shaderG.includes("R=min(.68,(uSize.x/uSize.y)*.80)"),'radio acorde a formato vertical');
assert(etiquetasG.includes("c.style.opacity = '1'"),'Canvas encima de WebGL lleva etiquetas de ciudades');
assert(etiquetasG.includes("g.fillText(C.nombre"),'las ciudades tienen nombre sobre el globo WebGL');
console.log('C-M31 Gemini: radio de globo móvil y etiquetas en overlay OK');


/* Gemini C-M35: fragmentos y humo visibles también al caer en Raster/Canvas 2D. */
const dib2D=f('juegos/getaway/40-dibujo.js');
assert(dib2D.includes("(V.usaRaster && V.usaRaster())"),'piezas se ven en Raster software');
assert(dib2D.includes("G.piezasFisicas && G.piezasFisicas.lista"),'proyección de piezas físicas');
assert(dib2D.includes("g.strokeRect(-k*.4"),'malla 2D visible y sombreada');
console.log('C-M35 Gemini: piezas y humo en Canvas/Raster sin WebGL');
