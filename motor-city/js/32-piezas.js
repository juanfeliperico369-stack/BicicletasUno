/* Motor City · C-M35: desprendimiento de piezas visuales con gravedad y rebote local.
   Elementos procedurales y originales: no modifica mallas GLB ni simula un taller real.
   Se usa únicamente en el juego que pida daños por piezas (Turno Cero, 18+). */
const TIPOS_PIEZA = {
  capo: {l:1.15,w:1.45,h:.08,color:'#45464a',pos:[1.2,0]},
  baul: {l:.8,w:1.35,h:.09,color:'#45464a',pos:[-1.4,0]},
  puerta_izq:{l:1.1,w:.12,h:.9,color:'#45464a',pos:[0,-.85]},
  puerta_der:{l:1.1,w:.12,h:.9,color:'#45464a',pos:[0,.85]},
  rueda:{l:.52,w:.25,h:.52,color:'#191d23',pos:[-1.1,.75]}
};
class Piezas {
  constructor(mundo,op={}) {this.mundo=mundo;this.lista=[];this.max=op.max||22;this.gravedad=9.81;}
  soltar(tipo,cuerpo,op={}) {
    const cfg=TIPOS_PIEZA[tipo];if(!cfg||!cuerpo||!Number.isFinite(cuerpo.x)||!Number.isFinite(cuerpo.y))return null;
    const a=Number(cuerpo.a)||0,v=Number(cuerpo.v)||0,[u,w]=cfg.pos,ca=Math.cos(a),sa=Math.sin(a),lado=tipo==='puerta_izq'?-1:1;
    const q={tipo,x:cuerpo.x+u*ca-w*sa,y:cuerpo.y+u*sa+w*ca,z:(this.mundo?.cota?.(cuerpo.x,cuerpo.y)||0)+(tipo.includes('puerta')?.65:1.1),
      vx:Math.cos(a)*v*.4-Math.sin(a)*lado*3,vy:Math.sin(a)*v*.4+Math.cos(a)*lado*3,
      vz:2.1+Math.min(4,Math.abs(v)*.16),a,rot:lado*2.3,edad:0,reposo:false};
    this.lista.push(q);if(this.lista.length>this.max)this.lista.shift();
    return q;
  }
  paso(dt) {
    if(!(dt>0)||!Number.isFinite(dt))return;
    dt=Math.min(dt,.05);
    for(const p of this.lista){
      p.edad+=dt;if(p.reposo)continue;
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=this.gravedad*dt;p.a+=p.rot*dt;
      const suelo=this.mundo?.cota?.(p.x,p.y)||0;
      if(p.z<=suelo+.08){p.z=suelo+.08;if(Math.abs(p.vz)<1.2){p.vz=0;p.reposo=true;}else p.vz=-p.vz*.26;p.vx*=.68;p.vy*=.68;p.rot*=.6;}
    }
    this.lista=this.lista.filter(p=>p.edad<14);
  }
  limpiar(){this.lista=[];}
  /* Render real 3D a partir de mallas orientadas; sin sprites. */
  malla(m,rel,centro,radio=170){
    if(!m||typeof m.cajaF!=='function')return;
    for(const p of this.lista){
      if(centro&&Math.hypot(p.x-centro.x,p.y-centro.y)>radio)continue;
      const cfg=TIPOS_PIEZA[p.tipo],t=rel(p.x,p.y,p.z);
      m.cajaF(t[0],t[1],t[2],p.a,cfg.l,cfg.w,cfg.h,hex3(cfg.color),0);
    }
  }
  /* Humo 3D austero sobre un vehículo muy dañado; fuego sólo en daño crítico. */
  static motorDano(m,r,a,D,tiempo=0) {
    if(!m||!D||!m.esfera)return;
    const f=Math.max(0,D.f||0,D.b||0,D.l||0,D.r||0);
    if(f<.62)return;
    const c=Math.cos(a),s=Math.sin(a),h=Math.sin(tiempo*2);
    for(let i=0;i<3;i++){
      const v=(tiempo*.4+i/3)%1, x=r[0]+c*1.25+Math.sin(tiempo+i*2)*v*.35, z=r[2]+s*1.25+Math.cos(tiempo+i)*v*.35,
        y=r[1]+1.1+v*2.8;
      m.esfera(x,y,z,.22+v*.35,.18+v*.4,.2+v*.35,[.24,.25,.27],[.16,.16,.18],i,0);
    }
    if(f>.9&&typeof m.cil==='function')m.cil(r[0]+c*1.35,r[1]+1.0,r[2]+s*1.35,.22,.65+Math.abs(h)*.25,5,[.85,.32,.1],0);
  }
}
MC.Piezas = Piezas;