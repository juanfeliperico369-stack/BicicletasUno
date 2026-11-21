/* C-M31 · Globo WebGL2 ligero de Motor City: usa la misma semilla y anillo de MC.Planeta.
   El mundo jugable permanece en su renderizador; esto acelera el planeta en una capa propia.
   Sin WebGL2 se mantiene el respaldo 2D de Planeta.globo. No usa redes ni bibliotecas. */
class GloboGPU {
  constructor(canvas,anillo){
    this.canvas=canvas;this.ok=false;this.error='';
    try{
      const gl=canvas?.getContext('webgl2',{alpha:false,antialias:true,depth:false,preserveDrawingBuffer:false});
      if(!gl)throw new Error('WebGL2 no disponible');
      const vs=String.raw`#version 300 es
      void main(){
        vec2 p=vec2(float((gl_VertexID << 1)&2),float(gl_VertexID&2));
        gl_Position=vec4(p*2.0-1.0,0.0,1.0);
      }`;
      const fs=String.raw`#version 300 es
      precision highp float;
      out vec4 color;
      uniform vec2 uSize;
      uniform float uLon;
      uniform float uInc;
      uniform float uTiempo;
      uniform float uStops[11];
      uniform vec3 uPal[11];
      uniform vec2 uJugador;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 a=floor(p),f=fract(p);
        f=f*f*(3.0-2.0*f);
        return mix(mix(hash(a),hash(a+vec2(1,0)),f.x),mix(hash(a+vec2(0,1)),hash(a+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){float s=0.0,k=.52;for(int i=0;i<4;i++){s+=k*noise(p);p=p*2.03+vec2(5.3,1.7);k*=.5;}return s;}
      void main(){
        vec2 p=(gl_FragCoord.xy*2.0-uSize)/uSize.y;
        float r=length(p),R=min(.68,(uSize.x/uSize.y)*.80);
        float st=hash(floor(gl_FragCoord.xy/2.0));
        vec3 fondo=vec3(.012,.016,.025)+vec3(.6,.69,.78)*step(.9978,st)*(.22+.7*hash(floor(gl_FragCoord.xy/7.0)));
        if(r>R){
          float a=exp(-pow((r-R)/.095,2.0))* .19;
          color=vec4(fondo+vec3(.16,.29,.49)*a,1.0);return;
        }
        vec2 d=p/R;
        float z=sqrt(max(0.0,1.0-dot(d,d)));
        float y=d.y*cos(uInc)+z*sin(uInc),zz=z*cos(uInc)-d.y*sin(uInc);
        float lat=asin(clamp(y,-1.0,1.0)),lon=atan(d.x,zz)+uLon;
        float deg=mod(degrees(lon)+3600.0,360.0),latD=degrees(lat);
        float ruta=14.0*sin(lon*2.0);
        float tierra=fbm(vec2(cos(lon)*2.5+4.0,sin(lon)*2.5+latD/45.0))+.23-abs(latD-ruta)/70.0;
        vec3 b=vec3(.12,.3,.21);
        for(int i=0;i<11;i++){if(deg<=uStops[i]){b=uPal[i];break;}}
        vec3 mar=vec3(.045,.105,.22);
        vec3 base=tierra>.48?b:mar;
        if(tierra>.74)base=mix(base,vec3(.48,.46,.41),.65);
        base=mix(base,vec3(.84,.87,.89),smoothstep(61.0,79.0,abs(latD))*(.91+.09*noise(vec2(lon*7.0,lat*4.0))));
        if(abs(latD-ruta)<1.2&&abs(latD)<67.0)base=mix(base,vec3(.75,.61,.34),.8);
        vec3 n=normalize(vec3(d.x,d.y,z));
        vec3 sol=normalize(vec3(cos(uTiempo*.035)*.7,-.25,.5+sin(uTiempo*.035)*.6));
        float luz=clamp(dot(n,sol)*.8+.21,.085,1.0);
        base*=luz;
        float borde=pow(1.0-z,3.2);
        base+=vec3(.14,.28,.51)*borde;
        /* Ciudades ubicadas en el planeta narrativo, no en una Tierra geodésica. */
        float ciudad=0.0;
        vec2 c0=vec2(0.0,22.0),c1=vec2(120.0,6.0),c2=vec2(220.0,4.0);
        for(int i=0;i<3;i++){
          vec2 c=i==0?c0:(i==1?c1:c2);
          float dl=abs(mod(deg-c.x+540.0,360.0)-180.0);
          ciudad=max(ciudad,1.0-smoothstep(.5,2.8,length(vec2(dl*cos(lat),latD-c.y))));
        }
        base+=vec3(.9,.63,.35)*ciudad*(.55+.45*(1.0-luz));
        float jLon=abs(mod(lon-uJugador.x+9.424778,6.283185)-3.141593);
        float dj=length(vec2(jLon*cos(lat),lat-uJugador.y));
        base=mix(base,vec3(.15,.86,.7),1.0-smoothstep(.008,.025,dj));
        color=vec4(clamp(base,0.0,1.0),1.0);
      }`;
      const shader=(type,source)=>{const q=gl.createShader(type);gl.shaderSource(q,source);gl.compileShader(q);if(!gl.getShaderParameter(q,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(q)||'Shader no compiló');return q;};
      const v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs),program=gl.createProgram();
      gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'Programa no enlazó');
      gl.deleteShader(v);gl.deleteShader(f);
      this.gl=gl;this.program=program;this.vao=gl.createVertexArray();
      this.u={size:gl.getUniformLocation(program,'uSize'),lon:gl.getUniformLocation(program,'uLon'),
        inc:gl.getUniformLocation(program,'uInc'),time:gl.getUniformLocation(program,'uTiempo'),
        stops:gl.getUniformLocation(program,'uStops[0]'),colors:gl.getUniformLocation(program,'uPal[0]'),
        player:gl.getUniformLocation(program,'uJugador')};
      const pal={costa:[.43,.58,.36],llanura:[.35,.48,.28],desierto:[.69,.53,.31],bosque:[.2,.42,.27],
        montana:[.42,.42,.4],nieve:[.82,.86,.89],lagos:[.34,.48,.35]};
      const stops=[],colors=[];
      const R=anillo||[];
      for(let i=0;i<R.length;i++){
        const q=R[i];if(q.tipo!=='tramo')continue;
        const ant=R[(i-1+R.length)%R.length],sig=R[(i+1)%R.length],inicio=ant.lon||0,fin=sig.lon<=inicio?sig.lon+360:sig.lon;
        for(let j=0;j<q.biomas.length;j++){stops.push(inicio+(fin-inicio)*(j+1)/q.biomas.length);colors.push(...(pal[q.biomas[j]]||pal.llanura));}
      }
      if(stops.length!==11)throw new Error('Planeta debe tener 11 segmentos de bioma');
      this.stops=new Float32Array(stops);this.colors=new Float32Array(colors);this.ok=true;
    }catch(e){this.error=String(e.message||e);this.ok=false;}
  }
  dibujar(W,H,op={}){
    if(!this.ok)return false;
    const gl=this.gl;
    try{
      if(this.canvas.width!==W||this.canvas.height!==H){this.canvas.width=W;this.canvas.height=H;}
      gl.viewport(0,0,W,H);gl.useProgram(this.program);gl.bindVertexArray(this.vao);
      gl.uniform2f(this.u.size,W,H);gl.uniform1f(this.u.lon,(op.lon0||0)*Math.PI/180);
      gl.uniform1f(this.u.inc,(op.inc||0)*Math.PI/180);gl.uniform1f(this.u.time,op.t||0);
      gl.uniform1fv(this.u.stops,this.stops);gl.uniform3fv(this.u.colors,this.colors);
      gl.uniform2f(this.u.player,(op.jugador?.lon||0)*Math.PI/180,(op.jugador?.lat||0)*Math.PI/180);
      gl.drawArrays(gl.TRIANGLES,0,3);
      const err=gl.getError();if(err!==gl.NO_ERROR)throw new Error('WebGL '+err);
      return true;
    }catch(e){this.error=String(e.message||e);this.ok=false;return false;}
  }
}
MC.GloboGPU=GloboGPU;