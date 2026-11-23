/* =====================================================================
   R6-b · proveedor opt-in de mallas de sectores para VistaTres.
   Un único mundo MC4, un solo HTML sin red. El trabajador Blob infla
   cajas LOD2 de 1 km y genera triángulos solo para las regiones visibles.
   Si no hay Worker/DecompressionStream o un sector falla, VistaTres original.
   ===================================================================== */
/* 5.3 (Claude, al unir): APAGADO POR DEFECTO. En Chromium con la ciudad de Medellín no mejoró nada medible y, al llegar cada
   sector, borraba regiones ya armadas: tras 30 s había 65 regiones y 81 pendientes, contra 128 y 0 sin él. Además las cajas
   juntan los edificios de cada celda de 80 m (no son 1:1). Queda listo para medirlo en un celular: ?r6b en la dirección lo prende
   (y en el HTML solo va el paquete de Guatapé; para Medellín, "r6b_ciudades" en juegos/getaway/juego.json). */
const R6B = {
  activo: typeof location !== 'undefined' && /[?&]r6b\b/.test(location.search), maxSectores: 6,
  estadisticas(vista) {
    const s=vista&&vista._r6b;
    return s ? { activo:!s.fallo, worker:!!s.worker, esperando:s.pendientes.size,
      regiones:s.ready.size, sectores:s.orden.length, subidos:s.subidos, fallos:s.fallos,
      bytes:s.paquete.stats&&s.paquete.stats.bytes } :
      { activo:false, worker:false, esperando:0, regiones:0, sectores:0, subidos:0, fallos:0 };
  },
  /* El código que ejecuta Blob Worker no toca el DOM, WebGL ni los guardados. */
  _codigoTrabajador() {
    function trabajador() {
      self.onmessage=async e=>{
        const { key,d,o }=e.data;
        try {
          const bytes=Uint8Array.from(atob(d),ch=>ch.charCodeAt(0));
          const ds=new DecompressionStream('deflate');
          const flujo=new Blob([bytes]).stream().pipeThrough(ds);
          const a=await new Response(flujo).arrayBuffer(),b=new DataView(a);
          if(b.byteLength<2)throw Error('R6-b: bloque vacío');
          const pal=[[.61,.53,.44],[.7,.61,.49],[.48,.5,.52],[.48,.61,.7],[.55,.57,.52],[.67,.62,.56],[.57,.52,.46],[.68,.66,.6],
            [.52,.58,.57],[.59,.6,.61],[.65,.54,.4],[.47,.46,.4],[.57,.6,.5],[.6,.56,.53],[.6,.63,.59],[.64,.57,.51]];
          let p=0;const n=b.getUint16(p,true);p+=2;
          if(n>100)throw Error('R6-b: demasiadas regiones');
          const resultado=[],transfer=[];
          for(let j=0;j<n;j++){
            if(p+6>b.byteLength)throw Error('R6-b: cabecera truncada');
            const gx=b.getInt16(p,true),gy=b.getInt16(p+2,true),nc=b.getUint16(p+4,true);p+=6;
            if(nc>1500)throw Error('R6-b: demasiadas cajas');
            const posiciones=[],colores=[];
            const emitir=(A,B,C,col)=>{
              for(const P of [A,B,C]){posiciones.push(P[0],P[1],P[2]);colores.push(col[0],col[1],col[2]);}
            };
            for(let k=0;k<nc;k++){
              if(p+14>b.byteLength)throw Error('R6-b: caja truncada');
              const x0=o[0]+b.getInt16(p,true)/8,z0=o[2]+b.getInt16(p+2,true)/8,
                x1=o[0]+b.getInt16(p+4,true)/8,z1=o[2]+b.getInt16(p+6,true)/8,
                bajo=o[1]+b.getInt16(p+8,true)/8,alto=b.getInt16(p+10,true)/8,
                clase=b.getInt16(p+12,true);p+=14;
              if(!(x1>x0&&z1>z0&&alto>0))throw Error('R6-b: caja degenerada');
              const co=pal[((clase%pal.length)+pal.length)%pal.length];
              const A=[x0,bajo,z0],B=[x1,bajo,z0],C=[x1,bajo,z1],D=[x0,bajo,z1],
                E=[x0,bajo+alto,z0],F=[x1,bajo+alto,z0],G=[x1,bajo+alto,z1],H=[x0,bajo+alto,z1];
              const pared=(a,b,c,d)=>{emitir(a,b,c,co);emitir(a,c,d,co);};
              pared(A,B,F,E);pared(B,C,G,F);pared(C,D,H,G);pared(D,A,E,H);
              emitir(E,G,F,co);emitir(E,H,G,co);
            }
            const pos=new Float32Array(posiciones),color=new Float32Array(colores);
            resultado.push({id:gx+','+gy,p:pos.buffer,c:color.buffer});
            transfer.push(pos.buffer,color.buffer);
          }
          if(p!==b.byteLength)throw Error('R6-b: bytes sobrantes');
          self.postMessage({key,regiones:resultado},transfer);
        }catch(ex){self.postMessage({key,error:String(ex&&ex.message||ex)});}
      };
    }
    return '('+trabajador.toString()+')();';
  },
  asegurar(vista) {
    /* R6-b solo para GPU media/alta. En SwiftShader y gama baja el trabajo
       de rearmado de cajas es más caro que la geometría tradicional. */
    const perfil=typeof GPU!=='undefined'&&GPU.perfil?GPU.perfil():null;
    if(!this.forzarPrueba&&perfil&&(perfil.nivel==='software'||perfil.nivel==='baja'))return null;
    if(!this.activo || vista._r6b && vista._r6b.fallo)return vista._r6b||null;
    if(vista._r6b)return vista._r6b;
    const id=vista.mundo&&vista.mundo.cfg&&vista.mundo.cfg.id;
    const el=typeof document!=='undefined'&&id&&document.getElementById('mc-r6b-'+id);
    if(!el)return null;
    try{
      if(typeof Worker==='undefined'||typeof DecompressionStream==='undefined')return null;
      const paquete=JSON.parse(el.textContent);
      if(paquete.version!==1||paquete.sector_m!==1000||paquete.region_m!==160||!paquete.sectores)return null;
      const fuente=this._codigoTrabajador(),url=URL.createObjectURL(new Blob([fuente],{type:'text/javascript'}));
      let worker;
      try{worker=new Worker(url);}finally{URL.revokeObjectURL(url);}
      const s=vista._r6b={paquete,worker,ready:new Map(),pendientes:new Set(),orden:[],enviados:new Set(),subidos:0,fallos:0,fallo:false};
      worker.onmessage=ev=>{
        const m=ev.data; if(!s.worker||!s.pendientes.has(m.key))return;
        s.pendientes.delete(m.key);
        if(m.error){s.fallos++;if(s.fallos>=3)s.fallo=true;return;}
        const keys=[];
        for(const r of m.regiones||[]){
          const info={p:new Float32Array(r.p),c:new Float32Array(r.c)};
          s.ready.set(r.id,info);keys.push(r.id);
          /* 5.3: ya no se borra la región armada (eso rearmaba la ciudad sin parar); las cajas se usan la próxima vez que se arme */
        }
        s.enviados.add(m.key);s.orden.push({key:m.key,keys});
        while(s.orden.length>R6B.maxSectores){
          const viejo=s.orden.shift();s.enviados.delete(viejo.key);
          for(const k of viejo.keys)s.ready.delete(k);
        }
      };
      worker.onerror=()=>{s.fallos++;s.fallo=true;s.pendientes.clear();};
      return s;
    }catch(e){MC.falla('r6b-worker',e);return null;}
  },
  pedir(vista,E){
    const s=this.asegurar(vista);
    if(!s||s.fallo||!s.worker||!E||!E.camara)return;
    const cam=E.camara, x=(cam.d&&cam.d.fijo?cam.blanco:cam.ojo)[0],
      y=(cam.d&&cam.d.fijo?cam.blanco:cam.ojo)[1];
    const candidatos=[];
    for(let gy=Math.floor((y-950)/1000);gy<=Math.floor((y+950)/1000);gy++)
      for(let gx=Math.floor((x-950)/1000);gx<=Math.floor((x+950)/1000);gx++){
        const k=gx+','+gy;
        if(!s.paquete.sectores[k]||s.enviados.has(k)||s.pendientes.has(k))continue;
        candidatos.push([k,Math.hypot((gx+.5)*1000-x,(gy+.5)*1000-y)]);
      }
    candidatos.sort((a,b)=>a[1]-b[1]);
    for(const [key] of candidatos.slice(0,Math.max(0,2-s.pendientes.size))){
      const sector=s.paquete.sectores[key];
      s.pendientes.add(key);
      try{s.worker.postMessage({key,d:sector.d,o:sector.o});}
      catch(err){s.pendientes.delete(key);s.fallos++;if(s.fallos>=3)s.fallo=true;}
    }
  },
  limpiar(vista) {
    const s=vista&&vista._r6b;
    if(!s)return;
    if(s.worker)s.worker.terminate();
    s.worker=null;s.ready.clear();s.pendientes.clear();s.orden.length=0;
    vista._r6b=null;
  }
};
if(typeof VistaTres!=='undefined'){
  const origEd=VistaTres.prototype._edificio;
  VistaTres.prototype._edificio=function(...args){
    if(this._r6bOmitirEdificio)return;
    return origEd.apply(this,args);
  };
  const origRegion=VistaTres.prototype._region;
  VistaTres.prototype._region=function(gx,gy,detalle){
    const key=gx+','+gy,s=this._r6b,datos=R6B.activo&&s&&!s.fallo&&detalle<=1?s.ready.get(key):null;
    this._r6bOmitirEdificio=!!datos;
    let region;
    try{region=origRegion.call(this,gx,gy,detalle);}
    finally{this._r6bOmitirEdificio=false;}
    if(datos&&datos.p.length&&datos.p.length===datos.c.length){
      const T=THREE,g=new T.BufferGeometry();
      g.setAttribute('position',new T.BufferAttribute(datos.p.slice(),3));
      g.setAttribute('color',new T.BufferAttribute(datos.c.slice(),3));
      g.computeVertexNormals();g.computeBoundingSphere();
      const m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));
      m.castShadow=false;m.receiveShadow=true;
      m.position.set(-this.O[0],-this.O[2],-this.O[1]);
      region.grupo.add(m);s.subidos++;
      region.r6b=true;
    }
    return region;
  };
  const origDraw=VistaTres.prototype.dibujar;
  VistaTres.prototype.dibujar=function(W,H,E,op){
    const r=origDraw.call(this,W,H,E,op);
    if(this.ok&&E&&E.calidad>=.5)R6B.pedir(this,E);
    return r;
  };
  const origLiberar=VistaTres.prototype.liberar;
  VistaTres.prototype.liberar=function(){
    R6B.limpiar(this);
    return origLiberar.call(this);
  };
}
MC.R6B=R6B;
