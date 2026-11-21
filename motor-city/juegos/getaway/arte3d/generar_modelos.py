#!/usr/bin/env python3
"""TURNO CERO: MANHATTAN — original low-poly 3D blockout kit (0.3.0: Claude pulió vehículos, personas, dron, edificios y calle;
malla indexada y oclusión ambiental horneada en el color).

Genera GLB 2.0 sin dependencias, con materiales vertex-color y escala métrica.
Los modelos son *proxies* para adaptar/retrabajar, no assets 3D finales.
Uso: python3 generar_modelos.py [directorio_de_salida]
"""
import json, math, struct, sys
from pathlib import Path
from datetime import date

OUT=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).parent/'modelos')
OUT.mkdir(parents=True,exist_ok=True)
INK='#1D2833'; COAL='#2B343D'; SLATE='#475563'; STEEL='#75818A'
GLASS='#607F8E'; CYAN='#4B9AAB'; RED='#C25542'; RED_DARK='#71382F'
SAND='#B0A69B'; PAPER='#D3C7B5'; RUST='#976A54'; GOLD='#DBA65F'
BLACK='#111820'; RUBBER='#20242A'; BLUE='#476E8A'; OLIVE='#586458'


def rgb(h):
    h=h.lstrip('#')
    return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)


def vec(a,b): return (a[0]-b[0],a[1]-b[1],a[2]-b[2])
def cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def normal(a,b,c):
    v=cross(vec(b,a),vec(c,a)); length=math.sqrt(sum(t*t for t in v)) or 1
    return tuple(t/length for t in v)

class Mesh:
    """Malla indexada con color por cara y oclusión ambiental horneada (0.3.0).
    Cada primitiva (tri, quad, polígono) comparte sus vértices; la sombra de contacto y la de las caras que miran
    hacia abajo se hornean en el color (tres niveles: así el atlas PBR sigue con menos de 64 colores)."""
    def __init__(self): self.p=[]; self.n=[]; self.c=[]; self.i=[]; self.caras=[]
    def _cara(self,pts,color,tris):
        start=len(self.p); n=normal(*pts[:3]) if len(pts)>=3 else (0,1,0)
        if len(pts)>3:
            # normal de Newell (robusta para polígonos de más de 3 puntos)
            nx=ny=nz=0.0
            for k in range(len(pts)):
                a=pts[k];b=pts[(k+1)%len(pts)]
                nx+=(a[1]-b[1])*(a[2]+b[2]); ny+=(a[2]-b[2])*(a[0]+b[0]); nz+=(a[0]-b[0])*(a[1]+b[1])
            L=math.sqrt(nx*nx+ny*ny+nz*nz) or 1; n=(nx/L,ny/L,nz/L)
        self.p.extend(pts); self.n.extend((n,)*len(pts)); self.c.extend((rgb(color),)*len(pts))
        self.i.extend(start+t for t in tris)
        cy=sum(q[1] for q in pts)/len(pts); self.caras.append((start,len(pts),cy,n))
    def tri(self,a,b,c,color): self._cara([a,b,c],color,(0,1,2))
    def quad(self,a,b,c,d,color): self._cara([a,b,c,d],color,(0,1,2,0,2,3))
    def poly(self,pts,color):
        # abanico: sirve para polígonos convexos (perfiles de carrocería, tapas)
        self._cara(list(pts),color,tuple(x for k in range(1,len(pts)-1) for x in (0,k,k+1)))
    def box(self,x,y,z,sx,sy,sz,color):
        X=[x-sx/2,x+sx/2];Y=[y-sy/2,y+sy/2];Z=[z-sz/2,z+sz/2]
        P=lambda a,b,c:(X[a],Y[b],Z[c]); d=[P(0,0,0),P(1,0,0),P(1,1,0),P(0,1,0),P(0,0,1),P(1,0,1),P(1,1,1),P(0,1,1)]
        for a,b,c,e in [(1,0,3,2),(4,5,6,7),(0,4,7,3),(5,1,2,6),(3,7,6,2),(0,1,5,4)]:
            self.quad(d[a],d[b],d[c],d[e],color)
    def bevel(self,x,y,z,sx,sy,sz,color,b=.05,top=None):
        """caja con aristas biseladas (chaflán): 6 caras, 12 franjas y 8 esquinas. top: color de la cara de arriba."""
        b=min(b,sx/2.2,sy/2.2,sz/2.2); hx,hy,hz=sx/2,sy/2,sz/2
        def v(i,j,k,dx,dy,dz): return (x+i*(hx-(b if dx else 0)),y+j*(hy-(b if dy else 0)),z+k*(hz-(b if dz else 0)))
        for s in (-1,1):
            # caras principales (encogidas por el bisel)
            self.quad(*([v(s,-1,-1,0,1,1),v(s,1,-1,0,1,1),v(s,1,1,0,1,1),v(s,-1,1,0,1,1)][::s]),color)
            self.quad(*([v(-1,s,-1,1,0,1),v(-1,s,1,1,0,1),v(1,s,1,1,0,1),v(1,s,-1,1,0,1)][::s]),top if (top and s>0) else color)
            self.quad(*([v(-1,-1,s,1,1,0),v(1,-1,s,1,1,0),v(1,1,s,1,1,0),v(-1,1,s,1,1,0)][::s]),color)
        for i in (-1,1):
            for j in (-1,1):
                self.quad(v(i,j,-1,0,1,1),v(i,j,-1,1,0,1),v(i,j,1,1,0,1),v(i,j,1,0,1,1),color)   # aristas a lo largo de z
                self.quad(v(i,-1,j,0,1,1),v(i,-1,j,1,1,0),v(i,1,j,1,1,0),v(i,1,j,0,1,1),color)   # a lo largo de y
                self.quad(v(-1,i,j,1,0,1),v(-1,i,j,1,1,0),v(1,i,j,1,1,0),v(1,i,j,1,0,1),color)   # a lo largo de x
                for k in (-1,1): self.tri(v(i,j,k,0,1,1),v(i,j,k,1,0,1),v(i,j,k,1,1,0),color)
    def disc(self,x,y,z,r,color,axis='y',segments=12):
        def pt(t):
            a=t*math.tau/segments
            return (x+r*math.cos(a),y,z+r*math.sin(a)) if axis=='y' else (x+r*math.cos(a),y+r*math.sin(a),z)
        self.poly([pt(j) for j in range(segments)],color)
    def cyl(self,x,y,z,r,h,color,axis='y',segments=12,cap=None):
        def pt(t,k):
            a=t*math.tau/segments
            return (x+r*math.cos(a), y+k*h/2, z+r*math.sin(a)) if axis=='y' else (x+r*math.cos(a),y+r*math.sin(a),z+k*h/2)
        for j in range(segments): self.quad(pt(j,-1),pt(j+1,-1),pt(j+1,1),pt(j,1),color)
        self.poly([pt(j,-1) for j in range(segments)][::-1],color); self.poly([pt(j,1) for j in range(segments)],cap or color)
    def cone(self,x,y,z,r,h,color,segments=12):
        for k in range(segments):
            a=k*math.tau/segments;b=(k+1)*math.tau/segments
            p=(x+r*math.cos(a),y,z+r*math.sin(a)); q=(x+r*math.cos(b),y,z+r*math.sin(b))
            self.tri(p,q,(x,y+h,z),color)
        self.poly([(x+r*math.cos(k*math.tau/segments),y,z+r*math.sin(k*math.tau/segments)) for k in range(segments)][::-1],color)
    def ball(self,x,y,z,rx,ry,rz,color,rings=6,segs=10):
        """esfera con vértices compartidos (una sola cara: se sombrea como un todo)"""
        start=len(self.p); pts=[]
        for j in range(rings+1):
            p=j*math.pi/rings
            for k in range(segs+1):
                t=k*math.tau/segs; pts.append((x+rx*math.sin(p)*math.cos(t),y+ry*math.cos(p),z+rz*math.sin(p)*math.sin(t)))
        idx=[]
        for j in range(rings):
            for k in range(segs):
                a=j*(segs+1)+k;b=a+1;c=a+segs+2;d=a+segs+1
                if j>0: idx+= [a,b,c]
                if j<rings-1: idx+= [a,c,d]
        self.p.extend(pts); self.c.extend((rgb(color),)*len(pts))
        for q in pts:
            v=(q[0]-x,q[1]-y,q[2]-z); L=math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]) or 1; self.n.append((v[0]/L,v[1]/L,v[2]/L))
        self.i.extend(start+t for t in idx); self.caras.append((start,len(pts),y,(0,1,0),'bola'))
    def prisma(self,perfil,hw,color,lados=None,hwTop=None,yQuiebre=None):
        """perfil convexo en el plano XY (x adelante, y arriba), extruido a lo ancho (±hw en z).
        hwTop/yQuiebre: más angosto arriba (la carrocería se mete hacia el techo). lados: color de las tapas."""
        def w(y): return hw if hwTop is None or yQuiebre is None or y<=yQuiebre else hw+(hwTop-hw)*min(1,(y-yQuiebre)/max(.01,max(q[1] for q in perfil)-yQuiebre))
        n=len(perfil)
        izq=[(px,py,-w(py)) for px,py in perfil]; der=[(px,py,w(py)) for px,py in perfil]
        self.poly(izq,lados or color); self.poly(der[::-1],lados or color)
        for k in range(n):
            a=k;b=(k+1)%n
            self.quad(izq[a],der[a],der[b],izq[b],color if not callable(color) else color(k))
    def arco(self,x,y,z,r,color,segs=8):
        """el pasarrueda: medio disco oscuro pegado al costado (z fijo)"""
        self.poly([(x,y,z)]+[(x+r*math.cos(math.pi*k/segs),y+r*math.sin(math.pi*k/segs),z) for k in range(segs+1)],color)
    def hornear(self):
        """oclusión ambiental: las caras que miran abajo y las de la base (contacto con el piso) se oscurecen.
        Antes, las normales se orientan hacia afuera del centro (como las corrige el motor) para cualquier visor glTF."""
        if not self.p: return
        N=len(self.p); cx=sum(q[0] for q in self.p)/N; cy0=sum(q[1] for q in self.p)/N; cz=sum(q[2] for q in self.p)/N
        ymin=min(q[1] for q in self.p); ymax=max(q[1] for q in self.p); alto=max(.05,ymax-ymin)
        for cara in self.caras:
            start,n,cy,nn=cara[:4]
            if len(cara)>4: continue
            g=[sum(self.p[q][j] for q in range(start,start+n))/n for j in range(3)]
            if (g[0]-cx)*nn[0]+(g[1]-cy0)*nn[1]+(g[2]-cz)*nn[2]<0:
                nn=(-nn[0],-nn[1],-nn[2])
                for q in range(start,start+n): self.n[q]=nn
            if nn[1]<-.55: k=.70
            elif (cy-ymin)/alto<.22 and abs(nn[1])<.6: k=.84
            else: k=1.0
            if k<1:
                for q in range(start,start+n):
                    r,gg,b,a=self.c[q]; self.c[q]=(int(r*k),int(gg*k),int(b*k),a)
    def export(self,path):
        self.hornear()
        # Una malla indexada (u16 si alcanza) con color de vértice (u8 normalizado), material PBR, sin datos externos.
        buffers=[]; views=[]; access=[]
        def data(blob,target):
            offset=sum(len(v) for v in buffers)
            pad=(-offset)%4
            if pad:buffers.append(b'\0'*pad);offset+=pad
            buffers.append(blob);views.append({'buffer':0,'byteOffset':offset,'byteLength':len(blob),'target':target});return len(views)-1
        def attr(pts,fmt,ctype,typ,normalize=False,bounds=False,target=34962):
            blob=b''.join(struct.pack(fmt,*p) if isinstance(p,tuple) else struct.pack(fmt,p) for p in pts)
            v=data(blob,target)
            acc={'bufferView':v,'componentType':ctype,'count':len(pts),'type':typ}
            if normalize:acc['normalized']=True
            if bounds:
                acc['min']=[min(v[j] for v in pts) for j in range(3)]
                acc['max']=[max(v[j] for v in pts) for j in range(3)]
            access.append(acc);return len(access)-1
        self.c=[tuple(int(t) for t in q) for q in self.c]
        a=attr(self.p,'<3f',5126,'VEC3',bounds=True)
        b=attr(self.n,'<3f',5126,'VEC3')
        c=attr(self.c,'<4B',5121,'VEC4',normalize=True)
        corto=len(self.p)<65536
        d=attr(self.i,'<H' if corto else '<I',5123 if corto else 5125,'SCALAR',target=34963)
        binary=b''.join(buffers)
        doc={'asset':{'version':'2.0','generator':'Turno Cero — original procedural blockout 3D 0.3.0 (Claude, indexado + AO horneada)'},'scene':0,
             'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0}],
             'meshes':[{'primitives':[{'attributes':{'POSITION':a,'NORMAL':b,'COLOR_0':c},'indices':d,'material':0,'mode':4}]}],
             'materials':[{'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1], 'metallicFactor':0.1,'roughnessFactor':0.79}}],
             'accessors':access,'bufferViews':views,'buffers':[{'byteLength':len(binary)}]}
        js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4)
        binary+=b'\0'*((-len(binary))%4)
        total=12+8+len(js)+8+len(binary)
        glb=b'glTF'+struct.pack('<II',2,total)+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(binary),b'BIN\x00')+binary
        path.write_bytes(glb)
        return len(self.p),len(self.i)//3,len(glb)


def gadget(m,kind):
    if kind=='smartwatch':
        m.box(0,.16,0,.45,.24,.46,BLACK);m.box(0,.30,0,.32,.035,.33,GLASS)
        m.box(0,.07,-.43,.28,.08,.46,RUBBER);m.box(0,.07,.43,.28,.08,.46,RUBBER)
        m.disc(0,.321,0,.08,RED)
    elif kind=='tracker':
        m.cyl(0,.11,0,.29,.20,BLACK);m.cyl(0,.216,0,.16,.016,SLATE);m.disc(0,.226,0,.035,RED)
    elif kind=='phone':
        m.box(0,.08,0,.37,.15,.74,BLACK);m.box(0,.16,0,.32,.02,.65,GLASS)
        m.box(0,.175,-.20,.16,.01,.10,CYAN);m.box(0,.177,.16,.20,.01,.12,INK)
    elif kind=='scanner':
        m.box(0,.15,0,.68,.25,.35,SLATE);m.box(0,.30,-.02,.39,.02,.24,GLASS)
        m.box(.4,.10,0,.18,.17,.18,BLACK);m.cyl(-.25,.34,0,.05,.11,RED)
    elif kind=='camera':
        m.box(0,.18,0,.43,.27,.27,BLACK);m.cyl(0,.18,.17,.10,.20,GLASS,axis='z');m.box(0,.04,0,.12,.08,.17,SLATE)
    elif kind=='breaker':
        m.box(0,.10,0,.78,.15,.24,INK);m.box(.32,.17,0,.24,.035,.18,RED_DARK)
        for i in range(4):m.box(-.27+i*.13,.20,0,.035,.05,.1,STEEL)
    elif kind=='earpiece':
        m.ball(0,.08,0,.16,.12,.13,BLACK);m.cyl(.06,.12,.10,.055,.12,STEEL,axis='z');m.box(-.11,.10,0,.05,.15,.13,CYAN)
    elif kind=='case':
        m.box(0,.34,0,.83,.56,.27,INK);m.box(0,.67,0,.24,.15,.10,STEEL)
        for x in (-.25,.25):m.box(x,.3,.145,.06,.28,.024,STEEL)
        m.box(0,.32,.148,.10,.08,.034,RED)
    elif kind=='router':
        m.box(0,.08,0,.59,.16,.35,COAL)
        for x in (-.22,.22):m.cyl(x,.27,-.09,.02,.45,BLACK)
        m.box(.18,.16,.18,.09,.02,.02,CYAN)
    elif kind=='drone':drone(m)


def environment(m,kind):
    if kind=='asphalt':
        m.box(0,-.12,0,11,.24,11,COAL)
        for x in (-3.9,0,3.9):m.box(x,.004,0,.10,.009,.65,PAPER)
        for z in (-5.32,5.32):m.box(0,.01,z,10,.03,.16,STEEL)
    elif kind=='sidewalk':
        m.box(0,.17,0,8,.34,3,SAND)
        for x in (-3,-1,1,3):m.box(x,.346,0,.015,.01,2.97,STEEL)
        m.box(0,.35,-1.45,8,.04,.12,SLATE)
    elif kind=='traffic_light':
        m.cyl(0,2.7,0,.095,5.4,STEEL)
        m.box(.38,4.9,0,.84,.21,.13,STEEL)
        m.box(.78,4.5,0,.23,.75,.28,BLACK)
        for i,c in enumerate((RED,GOLD,OLIVE)):m.cyl(.78,4.72-i*.22,.157,.063,.05,c,axis='z')
    elif kind=='street_lamp':
        m.cyl(0,3.4,0,.10,6.8,STEEL)
        m.box(.75,6.6,0,1.5,.10,.11,STEEL)
        m.box(1.45,6.53,0,.65,.1,.32,PAPER)
    elif kind=='barrier':
        for x in (-1.6,1.6):m.box(x,.47,0,.30,.95,.29,STEEL)
        m.box(0,.79,0,3.6,.27,.20,PAPER)
        for x in (-1.2,-.6,0,.6,1.2):m.box(x,.79,.118,.22,.25,.035,RED)
    elif kind=='bollards':
        for x in (-1.5,-.5,.5,1.5):
            m.cyl(x,.42,0,.14,.8,STEEL);m.cyl(x,.8,0,.16,.09,COAL)
    elif kind=='container':
        m.box(0,1.25,0,6.05,2.50,2.45,RED_DARK)
        for x in range(-5,6):m.box(x*.5,1.25,1.246,.032,2.36,.025,STEEL)
        for x in (-2.85,2.85):m.box(x,1.27,1.255,.11,2.35,.06,RUST)
    elif kind=='checkpoint':
        m.box(0,.035,0,9,.07,6,COAL)
        for x in (-3.2,3.2):m.box(x,1.2,0,.28,2.4,.30,STEEL)
        m.box(0,2.35,0,7.2,.18,.3,INK)
        m.box(0,.58,-2.4,2.3,1.15,.66,RUBBER)
        m.box(0,1.2,-2.4,1.1,.10,.1,RED)
    elif kind=='safehouse':
        m.box(0,-.13,0,9,.26,7,COAL)
        m.box(0,2.1,-3.5,9,4.2,.20,RUST)
        m.box(-4.5,2.1,0,.20,4.2,7,SLATE)
        m.box(4.5,2.1,0,.20,4.2,7,SLATE)
        for x in (-2.5,0,2.5):m.box(x,2.45,-3.37,1.7,2.5,.06,GLASS)
        m.box(-.35,.78,0,3.5,.16,1.9,INK)
        for x in (-1.7,1.0):m.box(x,.36,-.6,.22,.72,.22,STEEL)
        for x in (-1.7,1.0):m.box(x,.36,.6,.22,.72,.22,STEEL)
        m.box(2.6,1.22,2.8,2.8,2.4,.30,BLACK)
        for x in (1.8,2.7,3.5):m.box(x,1.55,2.62,.65,.58,.05,GLASS)
        m.box(-2.8,.55,2.2,1.6,1.0,.66,RUBBER)
    elif kind=='rooftop':
        m.box(0,.17,0,9,.34,8,COAL)
        for x in (-4.3,4.3):m.box(x,.55,0,.18,.78,7.9,STEEL)
        for z in (-3.9,3.9):m.box(0,.55,z,8.9,.78,.18,STEEL)
        m.box(2.6,.75,-2.3,1.7,.85,1.5,SLATE)
        m.cyl(-2.5,.7,-2.2,.55,.85,BLACK)
        m.cyl(-2.5,1.27,-2.2,.73,.05,GLASS)
        m.box(0,.37,0,2.1,.01,.12,RED)
        m.box(0,.38,0,.12,.01,2.1,RED)
    elif kind=='subway':
        m.box(0,.0,0,5,.20,4,SAND)
        for z in (-.9,.9):m.box(0,-.1,z,3.4,.35,.12,STEEL)
        for y in (.35,.85,1.35):
            m.box(-1.80,y,-.92,.10,.10,2.0,INK)
            m.box(1.80,y,.92,.10,.10,2.0,INK)
        for x in (-1.8,1.8):m.box(x,.78,0,.11,1.6,2.1,STEEL)
        m.box(0,1.53,0,3.75,.16,2.15,BLACK)
    elif kind=='dock':
        m.box(0,.16,0,9,.32,7,COAL)
        for z in (-3.4,3.4):
            for x in (-3,0,3):
                m.cyl(x,.51,z,.12,.72,GOLD)
        m.box(2.2,1.30,1.2,3.7,2.1,2.5,RED_DARK)
        m.box(-2.2,1.65,-.1,2.1,3.1,2.0,SLATE)
        m.box(-2.2,3.4,-.1,2.45,.19,2.38,RUBBER)
    elif kind=='server_room':
        m.box(0,-.1,0,7,.20,6,STEEL)
        m.box(0,2.5,-3,7,5,.16,COAL)
        for x in (-2.5,-.85,.85,2.5):
            m.box(x,1.45,-1.8,1.08,2.8,1.1,BLACK)
            for j in range(5):m.box(x, .4+j*.45,-1.19,.68,.13,.02,GLASS)
        m.box(0,1.1,1.6,2.4,1.9,.3,SLATE)
    elif kind=='stairwell':
        m.box(0,-.12,0,5,.24,5,COAL)
        for j in range(9):m.box(j*.41-1.7,j*.18+.09,0,.41,.17,2.5,STEEL)
        m.box(0,1.10,-1.50,4.1,.10,.1,GOLD)
    elif kind=='news_kiosk':
        m.box(0,1.1,0,2.2,2.2,1.6,RUST)
        m.box(0,2.35,0,2.6,.25,1.95,INK)
        m.box(0,1.35,.84,1.72,1.15,.042,GLASS)
        m.box(0,.32,.85,1.9,.20,.45,PAPER)


def car(m,kind):
    """0.3.0: silueta real (capó, cabina con vidrios, baúl), pasarruedas, rines, faros, espejos, manijas y parachoques"""
    W={'sedan':1.82,'suv':2.0,'van':2.08,'taxi':1.82,'police':1.88,'coupe':1.8}[kind]
    L={'sedan':4.65,'suv':4.9,'van':5.6,'taxi':4.65,'police':4.65,'coupe':4.35}[kind]
    H={'suv':1.95,'van':2.45,'sedan':1.42,'taxi':1.43,'police':1.45,'coupe':1.29}[kind]
    body={'sedan':INK,'suv':COAL,'van':SLATE,'taxi':GOLD,'police':BLUE,'coupe':RUST}[kind]
    hb={'sedan':.98,'taxi':.98,'police':1.0,'coupe':.90,'suv':1.15,'van':1.12}[kind]   # altura del capó y del baúl
    rr={'suv':.40,'van':.38}.get(kind,.35); base=.20; hw=W/2; eje=L*.31 if kind!='van' else L*.33
    # 1) la parte baja: perfil convexo extruido, un poco más angosta arriba (tumblehome)
    nariz=.55 if kind!='van' else .25; cola=.38 if kind not in ('van','suv') else .12
    perfil=[(-L/2+.08,base),(L/2-.10,base),(L/2,.46),(L/2-.03,hb-.22),(L/2-nariz,hb),(-L/2+cola,hb+.02),(-L/2,hb-.16),(-L/2+.01,.44)]
    m.prisma(perfil,hw,body,hwTop=hw-.07,yQuiebre=.62)
    # 2) la cabina: vidrios a los lados, parabrisas y vidrio trasero inclinados, techo del color del carro
    # x0: base trasera (donde empieza el baúl) · x1: base del parabrisas · x2: techo adelante · x3: techo atrás (x0 < x3 < x2 < x1)
    if kind=='van':
        x0,x1,x2,x3=-L/2+.08,L/2-.95,L/2-1.55,-L/2+.12
    elif kind=='suv':
        x0,x1,x2,x3=-L/2+.20,L*.17,-.10,-L/2+.30
    elif kind=='coupe':
        x0,x1,x2,x3=-L*.36,L*.12,-.30,-L*.17
    else:
        x0,x1,x2,x3=-L*.31,L*.16,-.12,-L*.20
    # base (x0..x1 a la altura hb) y techo (x3..x2 a la altura H); medio ancho abajo y arriba
    wb=hw-.08; wt=hw-.24 if kind not in ('van','suv') else hw-.14
    A=[(x0,hb,-wb),(x1,hb,-wb),(x2,H,-wt),(x3,H,-wt)]; B=[(x0,hb,wb),(x1,hb,wb),(x2,H,wt),(x3,H,wt)]
    m.quad(A[0],A[1],A[2],A[3],GLASS); m.quad(B[3],B[2],B[1],B[0],GLASS)          # costados (vidrios)
    m.quad(A[1],B[1],B[2],A[2],GLASS); m.quad(A[3],B[3],B[0],A[0],GLASS)          # parabrisas y trasero
    m.quad(A[3],A[2],B[2],B[3],body)                                              # techo
    # parales A, B y C (franjas del color del carro sobre el vidrio)
    for s in (-1,1):
        def en(u,y): return (x0+(x1-x0)*u+((x3+(x2-x3)*u)-(x0+(x1-x0)*u))*y, hb+(H-hb)*y, s*(wb+(wt-wb)*y+.006))
        for u0,u1 in ((.0,.07),(.47,.53),(.93,1.0)):
            m.quad(en(u0,0),en(u1,0),en(u1,1),en(u0,1),body)
        m.quad(en(0,0),en(1,0),en(1,.06),en(0,.06),BLACK)        # empaque del vidrio
    # 3) ruedas: llanta, rin con 5 rayos y tapacubo; pasarruedas oscuro
    for x in (-eje,eje):
        for s in (-1,1):
            zc=s*(hw-.13)
            m.cyl(x,rr,zc,rr,.24,RUBBER,axis='z',segments=16)
            m.cyl(x,rr,zc+s*.121,rr*.62,.012,STEEL,axis='z',segments=12,cap=SLATE)
            m.cyl(x,rr,zc+s*.13,rr*.18,.02,PAPER if kind=='taxi' else STEEL,axis='z',segments=8)
            m.arco(x,rr*.9,s*(hw+.004),rr+.08,BLACK)
    # 4) frente: faros, parrilla, parachoques y placa; atrás: pilotos rojos, parachoques, placa y exosto
    for s in (-1,1):
        m.box(L/2-.02,hb-.34,s*(hw-.30),.12,.12,.34,PAPER)
        m.box(-L/2+.02,hb-.30,s*(hw-.22),.08,.12 if kind!='van' else .40,.30,RED)
        m.box(L/2-.06,.36,s*(hw-.26),.08,.07,.20,GOLD if kind!='police' else PAPER)   # exploradoras
    m.box(L/2-.03,hb-.36,0,.06,.16,W*.40,BLACK)
    m.bevel(L/2+.02,.34,0,.14,.20,W*.98,COAL,b=.04)
    m.bevel(-L/2-.02,.36,0,.14,.20,W*.98,COAL,b=.04)
    m.box(L/2+.095,.36,0,.01,.12,.42,SAND); m.box(-L/2-.095,.42,0,.01,.12,.42,SAND)
    m.cyl(-L/2-.04,.24,-hw*.55,.035,.16,STEEL,axis='x',segments=8)
    # 5) espejos, manijas, costuras de las puertas y estribo
    for s in (-1,1):
        m.bevel(x1-.08,hb+.10,s*(hw+.06),.16,.11,.12,body,b=.03)
        for xd in ((x1-.15,(x0+x1)/2-.05) if kind!='van' else (x1-.2,)):
            m.box(xd,hb-.10,s*(hw+.004),.012,.55,.01,BLACK)
            m.box(xd-.28,hb-.18,s*(hw+.012),.16,.035,.02,STEEL)
        m.box(0,.28,s*(hw+.004),L*.55,.05,.012,BLACK)
    # 6) lo propio de cada uno
    if kind=='taxi':
        m.bevel(-.35,H+.10,0,.60,.18,.32,PAPER,b=.03)
        for i in range(-6,7): m.box(i*.24,hb-.06,0*hw,.12,.06,W+.012,BLACK if i%2 else PAPER)
    if kind=='police':
        m.bevel(-.30,H+.07,0,.36,.11,1.15,BLACK,b=.02)
        m.box(-.30,H+.13,-.30,.30,.06,.48,RED); m.box(-.30,H+.13,.30,.30,.06,.48,BLUE)
        for s in (-1,1): m.box(.0,hb-.25,s*(hw+.006),L*.62,.16,.01,PAPER)
        m.bevel(L/2+.10,.42,0,.10,.26,W*.6,BLACK,b=.03)                               # defensa de empuje
    if kind=='van':
        for s in (-1,1): m.box(-.6,hb-.05,s*(hw+.006),.02,1.0,.01,BLACK)               # puerta corrediza
        m.box(-L/2-.005,hb+.05,0,.01,1.3,.02,BLACK)
        m.cyl(-.5,H+.13,0,.18,.3,BLACK)
    if kind=='suv':
        for s in (-1,1): m.box(-.3,H+.06,s*(wt-.05),2.2,.05,.06,STEEL)
        for t in (-.7,.1,.8): m.box(t-.3,H+.04,0,.06,.04,2*wt-.1,STEEL)
        m.cyl(-L/2-.16,hb-.05,0,.34,.22,RUBBER,axis='x',segments=14); m.cyl(-L/2-.27,hb-.05,0,.20,.02,STEEL,axis='x',segments=10)
    if kind=='coupe':
        m.bevel(-L/2+.15,hb+.14,0,.22,.05,W*.86,INK,b=.02)
        for s in (-1,1): m.box(-L/2+.18,hb+.06,s*W*.38,.05,.12,.05,INK)


def motorcycle(m):
    for x in (-.80,.82):
        m.cyl(x,.33,0,.33,.14,RUBBER,axis='z',segments=18)
        m.cyl(x,.33,.072,.21,.01,STEEL,axis='z',segments=12,cap=SLATE)
        m.cyl(x,.33,-.072,.21,.01,STEEL,axis='z',segments=12,cap=SLATE)
    # chasis, motor, tanque, sillín y colín
    m.prisma([(-.55,.38),(.35,.36),(.55,.62),(-.25,.72)],.10,STEEL)
    m.bevel(-.02,.48,0,.46,.30,.30,COAL,b=.05)
    m.cyl(.0,.38,0,.10,.34,SLATE,axis='z',segments=10)
    m.prisma([(-.15,.78),(.45,.80),(.55,.98),(.10,1.02),(-.18,.92)],.17,RED_DARK,hwTop=.12,yQuiebre=.85)
    m.prisma([(-.70,.80),(-.15,.82),(-.15,.92),(-.55,.92),(-.80,.88)],.13,RUBBER)
    m.prisma([(-.95,.78),(-.70,.78),(-.70,.90),(-.92,.96)],.10,RED_DARK)
    m.box(-1.0,.84,0,.03,.07,.16,RED)                                                   # piloto
    # tijera, manubrio, farola y escape
    for s in (-1,1): m.box(.72,.66,s*.09,.05,.66,.04,STEEL)
    m.box(.62,1.02,0,.05,.05,.78,BLACK)
    for s in (-1,1): m.box(.62,1.02,s*.36,.10,.05,.07,RUBBER)
    m.bevel(.86,.95,0,.14,.18,.20,BLACK,b=.03); m.box(.935,.95,0,.02,.12,.15,PAPER)
    m.bevel(.70,1.13,0,.08,.16,.28,GLASS,b=.02)
    m.cyl(-.55,.40,.18,.06,.60,STEEL,axis='x',segments=8)
    m.box(-.88,.64,0,.04,.36,.12,SLATE)


def person(m,role):
    """0.3.0: proporciones de 1,75 m, pantalón y zapatos, chaqueta abierta, brazos con codo, manos, cuello, cara y peinado"""
    outfit={'mara':COAL,'nadia':SLATE,'guard':BLUE,'courier':OLIVE,'operative':INK,'informant':RUST}[role]
    pants={'mara':INK,'nadia':BLACK,'guard':INK,'courier':COAL,'operative':BLACK,'informant':SLATE}[role]
    hair={'mara':BLACK,'nadia':INK,'guard':BLACK,'courier':COAL,'operative':BLACK,'informant':SAND}[role]
    skin=SAND; shirt=PAPER if role in ('nadia','informant') else STEEL
    for s in (-1,1):
        m.bevel(s*.11,.48,0,.16,.62,.18,pants,b=.04)                 # pierna
        m.bevel(s*.11,.90,.0,.19,.30,.21,pants,b=.05)                # muslo
        m.bevel(s*.11,.07,.05,.13,.12,.30,RUBBER,b=.04)              # zapato (punta hacia +z)
        m.box(s*.11,.012,.05,.135,.025,.31,BLACK)                    # suela
    m.bevel(0,1.03,0,.40,.14,.24,pants,b=.05)                         # cadera
    m.box(0,1.10,0,.41,.05,.25,BLACK)                                 # correa
    m.bevel(0,1.35,0,.46,.52,.27,outfit,b=.07)                        # torso (chaqueta)
    m.box(0,1.36,.137,.14,.46,.01,shirt)                              # camisa (chaqueta abierta)
    for s in (-1,1): m.box(s*.11,1.52,.14,.07,.14,.012,outfit)        # solapas
    for s in (-1,1):
        m.ball(s*.27,1.56,0,.09,.08,.10,outfit,rings=5,segs=8)       # hombro
        m.bevel(s*.30,1.34,0,.11,.34,.13,outfit,b=.04)               # brazo
        m.bevel(s*.31,1.04,.04,.10,.30,.11,outfit,b=.035)            # antebrazo
        m.ball(s*.31,.86,.06,.05,.07,.045,skin,rings=5,segs=8)       # mano
    m.cyl(0,1.66,0,.06,.10,skin,segments=10)                          # cuello
    m.ball(0,1.80,.0,.10,.125,.11,skin,rings=8,segs=12)              # cabeza
    # 0.3.1 · rostro: blanco del ojo, iris, cejas, orejas, nariz con aletas y labios
    for s in (-1,1):
        m.box(s*.038,1.81,.103,.032,.017,.006,'#EDE6DA')               # blanco del ojo
        m.box(s*.038,1.81,.1065,.014,.015,.004,'#2B1D14')              # iris y pupila
        m.box(s*.040,1.832,.104,.04,.009,.008,hair)                    # ceja
        m.ball(s*.103,1.80,-.005,.016,.03,.022,skin,rings=4,segs=6)    # oreja
    m.box(0,1.778,.112,.022,.034,.018,skin)                            # nariz
    for s in (-1,1): m.box(s*.012,1.763,.112,.012,.008,.012,'#8A5634')  # aletas
    m.box(0,1.744,.101,.05,.008,.008,RED_DARK)                         # labio de arriba
    m.box(0,1.736,.1,.042,.009,.008,'#B5645A')                         # labio de abajo
    # peinado de cada uno
    if role=='nadia':
        m.ball(0,1.86,-.015,.112,.085,.12,hair,rings=6,segs=12); m.ball(0,1.88,-.12,.06,.06,.06,hair,rings=5,segs=8)   # moño
    elif role=='guard':
        m.ball(0,1.885,0,.112,.05,.12,BLUE,rings=6,segs=12); m.box(0,1.86,.11,.20,.02,.09,BLACK)                  # gorra
    elif role=='courier':
        m.ball(0,1.86,-.01,.125,.10,.125,OLIVE,rings=6,segs=12)                                                    # capucha
        m.bevel(0,1.40,-.22,.40,.48,.20,RUST,b=.05); m.box(0,1.28,-.325,.30,.10,.01,PAPER)                       # morral
    elif role=='informant':
        m.ball(0,1.87,0,.115,.07,.12,hair,rings=6,segs=12); m.box(0,1.95,0,.30,.02,.30,RUST); m.cyl(0,1.99,0,.10,.08,RUST,segments=10)  # sombrero
    else:
        m.ball(0,1.87,-.015,.112,.075,.12,hair,rings=6,segs=12)
        if role=='mara': m.ball(0,1.80,-.13,.05,.10,.05,hair,rings=5,segs=8)                                      # cola de caballo
    if role in ('mara','operative'):
        m.box(.075,1.81,.11,.07,.035,.012,CYAN)                       # visor/lente
        m.bevel(.20,.98,.12,.12,.20,.10,BLACK,b=.02); m.bevel(-.21,1.0,.15,.13,.22,.10,BLACK,b=.02)               # estuches
    if role=='nadia': m.bevel(-.27,1.10,.10,.08,.32,.24,BLACK,b=.02)  # carpeta
    if role=='guard': m.box(.13,1.50,.142,.12,.10,.01,PAPER); m.box(-.13,1.50,.142,.06,.06,.01,GOLD)   # placa y escudo
    m.box(.30,.98,.10,.02,.02,.02,CYAN if role in ('mara','operative') else STEEL)                      # reloj


def drone(m):
    m.bevel(0,.65,0,.62,.20,.48,COAL,b=.06,top=SLATE)
    m.ball(0,.52,.16,.09,.08,.09,GLASS,rings=5,segs=8)
    m.box(0,.73,-.20,.18,.04,.06,CYAN)
    for x in (-.58,.58):
        for z in (-.58,.58):
            m.bevel(x/2,.66,z/2,abs(x)*1.25,.05,.07,STEEL,b=.02) if z==-.58 else m.bevel(x/2,.66,z/2,.07,.05,abs(z)*1.25,STEEL,b=.02)
            m.cyl(x,.70,z,.06,.10,BLACK,segments=10)
            m.cyl(x,.765,z,.24,.008,CYAN,segments=16)
            m.box(x*.60,.40,z*.60,.035,.30,.035,STEEL)
            m.box(x*.60,.25,z*.60,.18,.02,.04,BLACK)


def building(m,kind):
    """0.3.0: zócalo, ventanas con marco y alféizar, bandas por piso, cornisa, local con toldo, máquinas y tanque en la terraza"""
    if kind=='office':  w,d,h,wall,floors,col=6,5,14,SLATE,9,3
    elif kind=='residential': w,d,h,wall,floors,col=5,4,11,RUST,7,3
    elif kind=='hotel': w,d,h,wall,floors,col=8,5,16,COAL,10,4
    else: w,d,h,wall,floors,col=9,7,4,SAND,1,3
    m.box(0,h/2,0,w,h,d,wall)
    m.box(0,.45,0,w+.08,.9,d+.08,INK if kind!='depot' else COAL)                       # zócalo
    m.bevel(0,h+.12,0,w+.35,.24,d+.35,PAPER if kind in ('hotel','residential') else STEEL,b=.06)   # cornisa
    m.box(0,h+.45,0,w+.05,.5,d+.05,wall)                                              # pretil
    piso=(h-1.6)/max(1,floors)
    for f in range(floors if kind!='depot' else 0):
        y=1.6+piso*(f+.5)
        for c in range(col):
            x=(c-(col-1)/2)*(w-1.2)/max(1,col-1)
            for zf,sgn in ((d/2,1),(-d/2,-1)):
                # marco y vidrio como láminas sobre la fachada (dos caras por ventana); el alféizar sí sobresale
                fz=lambda dz,wx,hy,yc=y:[(x-wx/2,yc-hy/2,zf+sgn*dz),(x+wx/2,yc-hy/2,zf+sgn*dz),(x+wx/2,yc+hy/2,zf+sgn*dz),(x-wx/2,yc+hy/2,zf+sgn*dz)]
                m.quad(*fz(.012,.80,1.02),PAPER if kind!='office' else STEEL); m.quad(*fz(.02,.62,.84),GLASS if kind=='office' else INK)
                m.box(x,y-.50,zf+sgn*.05,.86,.05,.10,STEEL)
                if kind=='residential' and f%2==1: m.box(x,y-.45,zf+sgn*.25,.90,.05,.45,BLACK); m.box(x,y-.10,zf+sgn*.46,.90,.04,.03,BLACK)   # balcón
        for xf,sgn in ((w/2,1),(-w/2,-1)):
            for c in range(max(1,col-1)):
                z=(c-(max(1,col-1)-1)/2)*(d-1.4)/max(1,col-2) if col>2 else 0
                m.quad((xf+sgn*.015,y-.46,z-.31),(xf+sgn*.015,y-.46,z+.31),(xf+sgn*.015,y+.46,z+.31),(xf+sgn*.015,y+.46,z-.31),INK if kind!='office' else GLASS)
        m.box(0,1.6+piso*(f+1),d/2+.03,w,.08,.05,STEEL if f%2 else INK)              # banda de piso
    # primer piso: local con vitrina, puerta y toldo
    m.box(0,.95,d/2+.04,w*.62,1.4,.04,GLASS); m.box(w*.36,.95,d/2+.05,.9,1.75,.05,BLACK)
    m.prisma([(d/2,1.85),(d/2+.9,1.55),(d/2+.9,1.45),(d/2,1.75)],w*.34,RED_DARK if kind!='office' else CYAN) if False else None
    m.quad((-w*.33,1.95,d/2),(w*.33,1.95,d/2),(w*.33,1.55,d/2+.85),(-w*.33,1.55,d/2+.85),RED_DARK if kind!='office' else CYAN)
    if kind=='depot':
        m.box(-2,1.75,d/2+.045,3.6,3.2,.07,INK)
        for k in range(8): m.box(-2,.35+k*.4,d/2+.085,3.5,.03,.02,STEEL)                 # cortina metálica
        m.box(2.2,2.8,d/2+.04,1.5,.75,.06,GLASS)
        m.box(0,h+.75,0,w*.9,.06,d*.9,STEEL)
    else:
        m.bevel(w*.25,h+.95,-d*.2,1.1,.8,.8,STEEL,b=.06)                               # máquina del aire
        m.cyl(-w*.25,h+1.6,d*.15,.55,1.4,RUST,segments=12); m.cone(-w*.25,h+2.3,d*.15,.58,.35,INK,segments=12)   # tanque de agua
        for k in range(4): m.box(-w*.25+(.3 if k%2 else -.3),h+.95,d*.15+(.3 if k<2 else -.3),.06,1.0,.06,STEEL)
    if kind=='hotel': m.bevel(0,h+1.0,d/2-.2,2.4,.7,.2,GOLD,b=.05)


def environment2(m,kind):
    """las piezas de calle que más se ven, con más detalle; el resto sigue igual"""
    if kind=='traffic_light':
        m.cyl(0,2.7,0,.09,5.4,STEEL,segments=10); m.cyl(0,.12,0,.18,.24,COAL,segments=10)
        m.box(1.6,5.2,0,3.2,.12,.12,STEEL)
        for xs in (1.3,2.9):
            m.bevel(xs,4.75,0,.30,.86,.30,BLACK,b=.04)
            for i,c in enumerate((RED,GOLD,OLIVE)):
                m.cyl(xs,5.0-i*.26,.16,.08,.03,c,axis='z',segments=10); m.box(xs,5.08-i*.26,.21,.20,.03,.10,BLACK)
        m.bevel(.18,2.4,0,.22,.40,.16,BLACK,b=.03); m.box(.18,2.45,.085,.12,.12,.01,PAPER)   # peatonal
    elif kind=='street_lamp':
        m.cyl(0,3.4,0,.09,6.8,STEEL,segments=10); m.cyl(0,.15,0,.17,.30,COAL,segments=10)
        m.prisma([(0,6.55),(1.5,6.70),(1.5,6.78),(0,6.66)],.05,STEEL)
        m.bevel(1.45,6.62,0,.70,.14,.34,COAL,b=.04); m.box(1.45,6.54,0,.55,.02,.24,PAPER)
    elif kind=='container':
        m.box(0,1.25,0,6.05,2.50,2.45,RED_DARK)
        for x in range(-11,12): m.box(x*.26,1.25,1.232,.09,2.34,.03,RED_DARK if x%2 else RUST)
        for x in range(-11,12): m.box(x*.26,1.25,-1.232,.09,2.34,.03,RED_DARK if x%2 else RUST)
        for x in (-2.97,2.97): m.bevel(x,1.25,0,.12,2.55,2.5,STEEL,b=.03)
        for z in (-.5,.5): m.box(3.04,1.25,z,.03,2.1,.05,STEEL)
        for y in (.05,2.45): m.box(0,y,0,6.1,.1,2.5,STEEL)
    elif kind=='news_kiosk':
        m.bevel(0,1.1,0,2.2,2.2,1.6,RUST,b=.06)
        m.bevel(0,2.35,0,2.7,.22,2.0,INK,b=.05)
        m.box(0,1.35,.81,1.72,1.15,.04,GLASS)
        for k in range(4): m.box(-.65+k*.43,1.35,.84,.34,.46,.02,(PAPER,GOLD,CYAN,RED)[k])   # revistas
        m.box(0,.32,.85,1.9,.20,.45,PAPER)
        m.quad((-1.3,2.24,.9),(1.3,2.24,.9),(1.3,1.95,1.45),(-1.3,1.95,1.45),RED_DARK)
    elif kind=='barrier':
        for x in (-1.6,1.6): m.bevel(x,.47,0,.30,.95,.40,STEEL,b=.04); m.box(x,.04,0,.50,.08,.70,COAL)
        m.bevel(0,.79,0,3.6,.27,.20,PAPER,b=.04)
        for x in (-1.2,-.6,0,.6,1.2): m.box(x,.79,.105,.22,.25,.02,RED); m.box(x,.79,-.105,.22,.25,.02,RED)
        for x in (-1.6,1.6): m.cyl(x,1.02,0,.07,.08,GOLD,segments=8)
    else:
        environment(m,kind)


def make_models():
    manifest=[]
    recipes=[]
    for kind in ('sedan','suv','van','taxi','police','coupe'):
        recipes.append((f'vehiculo_{kind}','vehiculos',lambda m,k=kind:car(m,k),'vehiculo de flota', 'Conducción, persecución e identidad encubierta'))
    recipes.append(('vehiculo_motocicleta','vehiculos',motorcycle,'moto de intercepción','Movilidad ágil en corredores urbanos'))
    for role in ('mara','nadia','guard','courier','operative','informant'):
        recipes.append((f'personaje_{role}','personajes',lambda m,k=role:person(m,k),'proxy humanoide','Bloqueo de escala y silueta, requiere rigging'))
    for kind in ('smartwatch','tracker','phone','scanner','camera','breaker','earpiece','case','router','drone'):
        recipes.append((f'tecnologia_{kind}','tecnologia',lambda m,k=kind:gadget(m,k),'dispositivo ficticio','Atrezzo 3D y lectura de estados; sin funcionalidad real'))
    for kind in ('office','residential','hotel','depot'):
        recipes.append((f'edificio_{kind}','arquitectura',lambda m,k=kind:building(m,k),'módulo urbano','Geometría genérica, sin coordenadas NYC'))
    for kind in ('asphalt','sidewalk','traffic_light','street_lamp','barrier','bollards','container','checkpoint','safehouse','rooftop','subway','dock','server_room','stairwell','news_kiosk'):
        recipes.append((f'escenario_{kind}','escenarios',lambda m,k=kind:environment2(m,k),'módulo de escena','A modularizar y conectar con GIS/MC4'))
    for name,category,fn,kind,use in recipes:
        mesh=Mesh();fn(mesh);pts,tris,size=mesh.export(OUT/(name+'.glb'))
        bounds=[round(min(p[i] for p in mesh.p),3) for i in range(3)],[round(max(p[i] for p in mesh.p),3) for i in range(3)]
        manifest.append({'id':name,'categoria':category,'archivo':name+'.glb','vertices':pts,'triangulos':tris,'bytes':size,'bounds_metros':bounds,'estado':'proxy_3d_no_final','uso':use})
    (Path(__file__).parent/'manifest.json').write_text(json.dumps({'proyecto':'TURNO CERO: MANHATTAN','version':'0.3.1-preproduccion','licencia':'CC0-1.0 - geometria procedural original','escala':'1 unidad = 1 metro; glTF Y-up','nota':'Modelos GLB para bloqueo de escenas y adaptación; NO assets de lanzamiento ni modelos detallados / animados. Sin datos GIS oficiales.','total':len(manifest),'assets':manifest},ensure_ascii=False,indent=2),encoding='utf8')
    print(f'{len(manifest)} GLB 2.0 assets creados: {sum(x["bytes"] for x in manifest)/1024:.0f} KiB')
    print(f'Geometría: {sum(x["triangulos"] for x in manifest):,} triángulos; {sum(x["vertices"] for x in manifest):,} vértices')
    return manifest

if __name__=='__main__':make_models()