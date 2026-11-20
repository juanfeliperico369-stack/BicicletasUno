/* node herramientas/precalcular-agua.mjs datos/guatape/mundo.mc4 */
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const motor = {TextDecoder, TextEncoder, performance, console};
vm.runInNewContext(fs.readFileSync(new URL('../dist/motor.js', import.meta.url),'utf8'),motor);
for (const archivo of process.argv.slice(2)) {
  const original = fs.readFileSync(archivo);
  const M = new motor.MC.Mundo(original), capas = M.meta.capas;
  const segmentos = [], nombres = Object.keys(capas).filter(k => k !== 'agua');
  delete capas.agua;
  let o=0;
  for (const k of nombres) {
    const c=capas[k], bytes=M._bytes(c);
    segmentos.push(bytes);
  }
  const {w,h,paso,C,D,comp,tipo} = motor.MC.Terreno.agua(M);
  for (const [i,k] of nombres.entries()) { capas[k].o=o; o+=segmentos[i].length; }
  const raw=Buffer.alloc(tipo.reduce((s,t) => s+(t?13:0),0));
  for (let i=0,j=0; i<tipo.length; i++) if (tipo[i]) {
    raw.writeUInt32LE(i,j); raw.writeInt32LE(comp[i],j+4); raw.writeFloatLE(D[i],j+8); raw[j+12]=tipo[i]; j+=13;
  }
  const bytes=zlib.deflateRawSync(raw,{level:9});
  capas.agua={o,n:bytes.length,raw:raw.length,sha1:crypto.createHash('sha1').update(raw).digest('hex').slice(0,12),tipo:'u8',formato:'AGUA1',w,h,paso,cuerpos:C};
  const cabecera=Buffer.from(JSON.stringify(M.meta)), inicio=Buffer.from(original.subarray(0,8));
  inicio.writeUInt32LE(cabecera.length,4);
  const nuevo=Buffer.concat([inicio,cabecera,...segmentos,bytes]);
  const prueba=motor.MC.Terreno.agua(new motor.MC.Mundo(nuevo));
  if (!D.every((n,i)=>n===prueba.D[i] && tipo[i]===prueba.tipo[i] && comp[i]===prueba.comp[i])) throw Error('La capa de agua difiere del cálculo');
  fs.writeFileSync(archivo+'.tmp',nuevo);
  fs.renameSync(archivo+'.tmp',archivo);
  console.log(archivo,w+'×'+h,C.length+' cuerpos',bytes.length+' bytes');
}
