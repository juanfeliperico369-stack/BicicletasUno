/* C-M34 · Primer paso hacia streaming MC4 por sectores de 1 km.
   Reduce la memoria de regiones ED1 de edificios DECODIFICADOS cerca de la cámara;
   el MC4 y las capas de suelo todavía permanecen completos en la memoria de la partida.
   No intercambia ficheros ni descarga datos: funciona offline y no borra mundos. */
class Sectores1km {
  constructor(mundo,op={}){
    this.mundo=mundo;this.lado=Math.max(250,op.lado||1000);
    this.maxSectores=Math.max(1,Math.floor(op.maxSectores||9));
    this.maxRegiones=Math.max(4,Math.floor(op.maxRegiones||36));
    this.radio=Math.max(0,Math.min(3,op.radio??1));
    this.cache=new Map();this.ultimo={sx:0,sy:0,antes:0,despues:0,evictas:0};
  }
  zona(x,y){return {sx:Math.floor(x/this.lado),sy:Math.floor(y/this.lado)};}
  pedir(sx,sy){
    if(!Number.isFinite(sx)||!Number.isFinite(sy))return null;
    sx=Math.floor(sx);sy=Math.floor(sy);
    const clave=sx+','+sy;
    if(this.cache.has(clave)){
      const c=this.cache.get(clave);this.cache.delete(clave);this.cache.set(clave,c);return c;
    }
    const x0=sx*this.lado,y0=sy*this.lado,x1=x0+this.lado,y1=y0+this.lado,m=this.mundo;
    const sector={
      id:clave,sx,sy,x0,y0,x1,y1,
      /* Devuelve geometría de edificios a petición, no mantiene otra copia por sector. */
      edificios:()=> typeof m?.edificiosEn==='function'?m.edificiosEn(x0,y0,x1,y1,[]):[]
    };
    this.cache.set(clave,sector);
    while(this.cache.size>this.maxSectores)this.cache.delete(this.cache.keys().next().value);
    return sector;
  }
  actualizar(x,y){
    const {sx,sy}=this.zona(x,y);
    for(let dy=-this.radio;dy<=this.radio;dy++)for(let dx=-this.radio;dx<=this.radio;dx++)this.pedir(sx+dx,sy+dy);
    const E=this.mundo?._ED;
    if(!E||!E.cache||!Number.isFinite(E.R)||!E.nx)return (this.ultimo={sx,sy,antes:0,despues:0,evictas:0,sectores:this.cache.size});
    const ids=[...E.cache.keys()],antes=ids.length,max=this.maxRegiones;
    ids.sort((a,b)=>{
      const ra=Math.floor(a/E.nx),rb=Math.floor(b/E.nx),
        ax=(a%E.nx+.5)*E.R-x,ay=(ra+.5)*E.R-y,
        bx=(b%E.nx+.5)*E.R-x,by=(rb+.5)*E.R-y;
      return ax*ax+ay*ay-(bx*bx+by*by);
    });
    const distanciaMax=Math.pow((this.radio+1.4)*this.lado,2),conservar=new Set();
    for(const k of ids){
      const rx=k%E.nx,ry=Math.floor(k/E.nx),dx=(rx+.5)*E.R-x,dy=(ry+.5)*E.R-y;
      if(conservar.size<max&&dx*dx+dy*dy<=distanciaMax)conservar.add(k);
    }
    for(const k of ids)if(!conservar.has(k))E.cache.delete(k);
    return (this.ultimo={sx,sy,antes,despues:E.cache.size,evictas:antes-E.cache.size,sectores:this.cache.size});
  }
  limpiar(){this.cache.clear();}
}
MC.Sectores1km=Sectores1km;