/* Grafo disperso. Una celda sirve para buscar candidatos; la conectividad procede de la vía.
   Cada vértice de entrada tiene x,y en casillas, nivel firmado y, opcionalmente, conector oficial. */
export class RedNiveles {
  celdas = new Map();
  vecinos = new Map();
  agregar(id, vertices) {
    let previo;
    for(const [i,p] of vertices.entries()){
      const celda=Math.floor(p.x)+','+Math.floor(p.y)+','+p.nivel;
      const clave=p.conector?'n:'+p.conector+':'+p.nivel:'v:'+id+':'+i;
      if(!this.celdas.has(celda))this.celdas.set(celda,new Set());
      this.celdas.get(celda).add(clave);
      if(!this.vecinos.has(clave))this.vecinos.set(clave,new Set());
      if(previo){this.vecinos.get(previo).add(clave);this.vecinos.get(clave).add(previo);}
      previo=clave;
    }
  }
  ruta(inicio,fin) {
    if(!this.vecinos.has(inicio)||!this.vecinos.has(fin))return [];
    const cola=[inicio],padre=new Map([[inicio,null]]);
    for(let i=0;i<cola.length;i++){const u=cola[i];if(u===fin)break;
      for(const v of this.vecinos.get(u))if(!padre.has(v)){padre.set(v,u);cola.push(v);}}
    if(!padre.has(fin))return [];
    const camino=[];for(let p=fin;p!==null;p=padre.get(p))camino.push(p);
    return camino.reverse();
  }
}
