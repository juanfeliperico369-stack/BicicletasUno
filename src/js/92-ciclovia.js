/* Contrato MG del juego. La posición longitudinal se mide en metros del vector de ciclorruta. */
class TramoCiclista {
  constructor(via) {
    this.p=via.p; this.nombre=NOMB(via.n)||NOMB(via.nom)||'Ciclorruta del valle';
    this.s=[0];
    for(let i=2;i<this.p.length;i+=2)this.s.push(this.s.at(-1)+Math.hypot(this.p[i]-this.p[i-2],this.p[i+1]-this.p[i-1])*M_PER_PX);
    this.largo=this.s.at(-1);
  }
  punto(s) {
    // Al terminar el tramo se regresa sobre la misma vía. Evita saltar a una calle desconectada.
    const vuelta=s%(this.largo*2),d=Math.min(vuelta,2*this.largo-vuelta);
    let a=0,b=this.s.length-1;
    while(b-a>1){const m=(a+b)>>1;if(this.s[m]<=d)a=m;else b=m;}
    const f=(d-this.s[a])/(this.s[b]-this.s[a]||1),p=this.p,dx=p[2*b]-p[2*a],dy=p[2*b+1]-p[2*a+1];
    return {x:p[2*a]+dx*f,y:p[2*a+1]+dy*f,ang:Math.atan2(dy,dx)+(vuelta>=this.largo?Math.PI:0)};
  }
  static cercana(mapa,pos) {
    let mejor=null,distancia=Infinity;
    for(const via of mapa.vias||[]){
      if(via.k!==5||via.p.length<4)continue;
      const mi=(via.p.length>>2)*2;
      const d=Math.min(Math.hypot(via.p[0]-pos.x,via.p[1]-pos.y),Math.hypot(via.p[mi]-pos.x,via.p[mi+1]-pos.y),Math.hypot(via.p[via.p.length-2]-pos.x,via.p[via.p.length-1]-pos.y));
      if(d>=distancia)continue;
      const t=new TramoCiclista(via); if(t.largo>=100){mejor=t;distancia=d;}
    }
    return mejor;
  }
}
class CarreraCiclovia extends MG {
  constructor(m,tramo,vehiculo='bici') {
    super(m);this.tramo=tramo;this.vehiculo=vehiculo;
    this.metros=0;this.carril=0;this.lateral=0;this.altura=0;this.vertical=0;this.vidas=3;
    this.proxima=24;this.filas=0;this.objetos=[];this.hojas=0;this.regalos=0;
    this.camara='atras';this.coach='Desliza o usa flechas/WASD para cambiar de carril; arriba o Espacio salta.';
  }
  mover(d){this.carril=clamp(this.carril+d,-1,1);}
  saltar(){if(this.altura===0){this.vertical=4.9;Snd.sfx('tap');}}
  vista(){this.camara=this.camara==='atras'?'primera':'atras';Snd.sfx('tap');}
  key(e){if(e.repeat||Game.paused)return;const fn={ArrowLeft:()=>this.mover(-1),KeyA:()=>this.mover(-1),ArrowRight:()=>this.mover(1),KeyD:()=>this.mover(1),ArrowUp:()=>this.saltar(),KeyW:()=>this.saltar(),Space:()=>this.saltar(),KeyV:()=>this.vista(),KeyC:()=>this.vista()}[e.code];if(fn){e.preventDefault();fn();}}
  pointer(type,vx,vy,cx,cy){
    if(super.pointer(type,vx,vy,cx,cy))return true;
    if(type==='down'){this._sw={x:cx,y:cy};return true;}
    if(type==='up'&&this._sw){const dx=cx-this._sw.x,dy=cy-this._sw.y;this._sw=null;if(Math.hypot(dx,dy)>20){if(Math.abs(dx)>Math.abs(dy))this.mover(dx>0?1:-1);else if(dy<0)this.saltar();return true;}}
    return false;
  }
  fila() {
    const fila=this.filas++,z=this.proxima,libre=this.rng.i(-1,1);
    const riesgos=['cono','hueco','charco','chaza','perro','moto','rampa'];
    this.objetos.push({z,c:libre,k:fila%9===8?'regalo':'hoja'});
    const ocupados=[-1,0,1].filter(c=>c!==libre);
    this.objetos.push({z,c:ocupados[this.rng.i(0,1)],k:riesgos[fila%riesgos.length]});
    this.proxima+=Math.max(13,this.rapidez()*1.3);
  }
  rapidez(){return Math.min(15,6.2+this.metros/145);}
  update(dt) {
    this.tick(dt);this.metros+=this.rapidez()*dt;
    const diferencia=this.carril-this.lateral;
    this.lateral+=Math.sign(diferencia)*Math.min(Math.abs(diferencia),dt*7.5);
    this.altura=Math.max(0,this.altura+this.vertical*dt-5.6*dt*dt);
    this.vertical=this.altura>0?this.vertical-11.2*dt:0;
    while(this.proxima<this.metros+80)this.fila();
    for(const o of this.objetos){
      if(o.resuelto||o.z>this.metros)continue;
      o.resuelto=true;if(Math.abs(o.c-this.lateral)>.48)continue;
      if(o.k==='hoja'){this.hojas++;Snd.sfx('leaf');}
      else if(o.k==='regalo'){this.regalos++;Snd.sfx('coin');}
      else if(o.k==='rampa'){this.vertical=6.2;this.altura=Math.max(.05,this.altura);Snd.sfx('coin');}
      else if(this.altura<.46||['moto','chaza','perro'].includes(o.k)){
        this.vidas--;this.errors++;this.flash=.22;Snd.sfx('bad');
      }
    }
    this.objetos=this.objetos.filter(o=>o.z>this.metros-3);
    this.score=Math.floor(this.metros/10)+this.hojas*5+this.regalos*20;
    if(this.vidas<=0)this.done=true;
  }
  render(V) {
    const c=V.b,w=V.vw,h=V.vh,A=TallerValle,hora=Math.floor(this.p.clock/60)%24;
    const noche=hora<6||hora>=19,frente=this.camara==='primera',horiz=h*.40;
    A.horizonte(c,w,horiz,hora,this.p.mods.rain?'lluvia':'seco',this.t);
    c.fillStyle=noche?'#314843':'#739275';c.fillRect(0,horiz,w,h-horiz);
    const pos=this.tramo.punto(this.metros),ca=Math.cos(pos.ang),sa=Math.sin(pos.ang),foco=Math.min(w*.78,h*.64);
    const zOff=frente?1.9:3.3,yFac=frente?1.48+this.altura:2.0,latK=(frente?1:.35)*this.lateral*1.35;
    /* Precalcular la curva una sola vez por paso Z (en vez de ~640 búsquedas binarias por cuadro) */
    const desvAt=z=>{const q=this.tramo.punto(this.metros+z);return clamp(((q.y-pos.y)*ca-(q.x-pos.x)*sa)*M_PER_PX,-z*.40,z*.40);};
    const cache=new Float32Array(42); for(let zi=0;zi<=40;zi++)cache[zi]=desvAt(zi*2);
    const proyC=(zi,l)=>{const z=zi*2,k=foco/(z+zOff);return {x:w/2+(cache[zi]+l*1.35-latK)*k,y:horiz+yFac*k,k};};
    const proyecta=(z,l=0)=>{const k=foco/(z+zOff),d=desvAt(z);return {x:w/2+(d+l*1.35-latK)*k,y:horiz+yFac*k,k};};
    const banda=(z1,z2,i,j,color)=>{
      const a=proyC(z1,i),b2=proyC(z2,i),d2=proyC(z2,j),e2=proyC(z1,j);
      c.fillStyle=color;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b2.x,b2.y);c.lineTo(d2.x,d2.y);c.lineTo(e2.x,e2.y);c.closePath();c.fill();
    };
    const asfalto=noche?'#46545a':'#728384';
    for(let zi=39;zi>=0;zi--){
      banda(zi,zi+1,-1.65,1.65,asfalto);
      banda(zi,zi+1,-1.64,-1.51,'#a3cb76');banda(zi,zi+1,1.51,1.64,'#a3cb76');
      if(Math.floor((zi*2+this.metros)/4)%2===0){banda(zi,zi+1,-.525,-.475,'#dce5cc');banda(zi,zi+1,.475,.525,'#dce5cc');}
    }
    for(const [i,j,color] of [[-1.65,1.65,asfalto],[-1.64,-1.51,'#a3cb76'],[1.51,1.64,'#a3cb76']]){
      const a=proyC(0,i),b2=proyC(0,j),f=(h-horiz)/(a.y-horiz);
      c.fillStyle=color;c.beginPath();c.moveTo(a.x,a.y-.5);c.lineTo(b2.x,b2.y-.5);
      c.lineTo(w/2+(b2.x-w/2)*f,h);c.lineTo(w/2+(a.x-w/2)*f,h);c.closePath();c.fill();
    }
    const dibujos=[];
    for(let s=Math.ceil((this.metros+3)/12)*12;s<this.metros+76;s+=12){
      const i=s/12;dibujos.push({z:s-this.metros,c:i%2?2.8:-2.8,k:['casa','arbol','poste','guadua','parque'][i%5]});
    }
    for(const o of this.objetos)if(!o.resuelto)dibujos.push({z:o.z-this.metros,c:o.c,k:o.k});
    for(const o of dibujos.sort((a,b)=>b.z-a.z)){const q=proyecta(o.z,o.c);A.pieza(c,o.k,q.x,q.y,q.k,noche);}
    const pie=proyC(0,this.lateral);
    A.vehiculo(c,this.vehiculo,this.camara,frente?w/2:pie.x,frente?h*.92:pie.y-this.altura*pie.k,
      frente?Math.min(w*.63,h*.44):pie.k,{noche,fase:this.t*8});
    if(this.rapidez()>8){c.strokeStyle='#d8e5df';for(let i=0;i<3;i++)for(const s of [-1,1]){
      const y=h*(.54+i*.10+(this.t*.7%1)*.03),x=s<0?w*.08:w*.92;c.beginPath();c.moveTo(x,y);c.lineTo(x+s*w*.04,y+h*.025);c.stroke();}}
  }
  hud(V){
    this.btns=[]; const margen=8,ancho=Math.min(88,(V.w-6*margen)/5),y=V.h-60;
    ['Izq.','Salta','Der.','Vista','Salir'].forEach((t,i)=>this.button(V,margen+i*(ancho+margen),y,ancho,46,t,
      [()=>this.mover(-1),()=>this.saltar(),()=>this.mover(1),()=>this.vista(),()=>{this.done=true;}][i],{size:14}));
    V.text(Math.floor(this.metros)+' m · '+this.score+' pts · '+this.vidas+' vidas',V.w/2,y-14,{align:'center',size:16,color:'#fff',bg:'#15334a',pad:4});
    this.drawPops(V);
  }
  bot(){
    const peligro=this.objetos.find(o=>!o.resuelto&&o.z>this.metros&&o.z<this.metros+14&&o.c===this.carril&&!['hoja','regalo','rampa'].includes(o.k));
    if(peligro){
      if(['hueco','charco','cono'].includes(peligro.k)&&peligro.z-this.metros<7)this.saltar();
      else this.carril=this.carril===0?(this.rng.f()<.5?-1:1):0;
      return;
    }
    const meta=this.objetos.find(o=>!o.resuelto&&o.z>this.metros&&(o.k==='hoja'||o.k==='regalo'));
    if(meta)this.carril=meta.c;
  }
}
