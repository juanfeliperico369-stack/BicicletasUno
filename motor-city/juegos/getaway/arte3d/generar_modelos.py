#!/usr/bin/env python3
"""TURNO CERO: MANHATTAN — original low-poly 3D blockout kit.

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
    def __init__(self): self.p=[]; self.n=[]; self.c=[]; self.i=[]
    def tri(self,a,b,c,color):
        n=normal(a,b,c); start=len(self.p)
        self.p.extend((a,b,c)); self.n.extend((n,n,n)); self.c.extend((rgb(color),)*3)
        self.i.extend((start,start+1,start+2))
    def quad(self,a,b,c,d,color): self.tri(a,b,c,color);self.tri(a,c,d,color)
    def box(self,x,y,z,sx,sy,sz,color):
        X=[x-sx/2,x+sx/2];Y=[y-sy/2,y+sy/2];Z=[z-sz/2,z+sz/2]
        P=lambda a,b,c:(X[a],Y[b],Z[c]); d=[P(0,0,0),P(1,0,0),P(1,1,0),P(0,1,0),P(0,0,1),P(1,0,1),P(1,1,1),P(0,1,1)]
        for a,b,c,e in [(1,0,3,2),(4,5,6,7),(0,4,7,3),(5,1,2,6),(3,7,6,2),(0,1,5,4)]:
            self.quad(d[a],d[b],d[c],d[e],color)
    def disc(self,x,y,z,r,color,axis='y',segments=12):
        cc=(x,y,z)
        def pt(t):
            a=t*math.tau/segments
            return (x+r*math.cos(a),y,z+r*math.sin(a)) if axis=='y' else (x+r*math.cos(a),y+r*math.sin(a),z)
        for j in range(segments): self.tri(cc,pt(j),pt(j+1),color)
    def cyl(self,x,y,z,r,h,color,axis='y',segments=12):
        def pt(t,k):
            a=t*math.tau/segments
            return (x+r*math.cos(a), y+k*h/2, z+r*math.sin(a)) if axis=='y' else (x+r*math.cos(a),y+r*math.sin(a),z+k*h/2)
        for j in range(segments):
            u=pt(j,-1);v=pt(j+1,-1);w=pt(j+1,1);q=pt(j,1)
            self.quad(u,v,w,q,color)
            base=(x,y-h/2,z) if axis=='y' else (x,y,z-h/2)
            top=(x,y+h/2,z) if axis=='y' else (x,y,z+h/2)
            self.tri(base,v,u,color);self.tri(top,q,w,color)
    def cone(self,x,y,z,r,h,color,segments=12):
        for k in range(segments):
            a=k*math.tau/segments;b=(k+1)*math.tau/segments
            p=(x+r*math.cos(a),y,z+r*math.sin(a)); q=(x+r*math.cos(b),y,z+r*math.sin(b))
            self.tri(p,q,(x,y+h,z),color);self.tri((x,y,z),q,p,color)
    def ball(self,x,y,z,rx,ry,rz,color,rings=6,segs=10):
        def point(t,p):return (x+rx*math.sin(p)*math.cos(t),y+ry*math.cos(p),z+rz*math.sin(p)*math.sin(t))
        for j in range(rings):
            p0=j*math.pi/rings; p1=(j+1)*math.pi/rings
            for k in range(segs):
                t0=k*math.tau/segs;t1=(k+1)*math.tau/segs
                a=point(t0,p0);b=point(t1,p0);c=point(t1,p1);d=point(t0,p1)
                if j>0:self.tri(a,b,c,color)
                if j<rings-1:self.tri(a,c,d,color)
    def export(self,path):
        # One mesh with vertex colors (normalized u8), PBR material, no external data.
        buffers=[]; views=[]; access=[]
        def data(blob,target):
            offset=sum(len(v) for v in buffers)
            pad=(-offset)%4
            if pad:buffers.append(b'\0'*pad);offset+=pad
            buffers.append(blob);views.append({'buffer':0,'byteOffset':offset,'byteLength':len(blob),'target':target});return len(views)-1
        def attr(pts,fmt,ctype,typ,normalize=False,bounds=False):
            blob=b''.join(struct.pack(fmt,*p) if isinstance(p,tuple) else struct.pack(fmt,p) for p in pts)
            v=data(blob,34962 if typ!='SCALAR' else 34963)
            acc={'bufferView':v,'componentType':ctype,'count':len(pts),'type':typ}
            if normalize:acc['normalized']=True
            if bounds:
                acc['min']=[min(v[j] for v in pts) for j in range(3)]
                acc['max']=[max(v[j] for v in pts) for j in range(3)]
            access.append(acc);return len(access)-1
        a=attr(self.p,'<3f',5126,'VEC3',bounds=True)
        b=attr(self.n,'<3f',5126,'VEC3')
        c=attr(self.c,'<4B',5121,'VEC4',normalize=True)
        d=attr(self.i,'<I',5125,'SCALAR')
        binary=b''.join(buffers)
        doc={'asset':{'version':'2.0','generator':'Turno Cero — original procedural blockout 3D'},'scene':0,
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


def car(m,kind):
    widths={'sedan':1.82,'suv':2.0,'van':2.08,'taxi':1.82,'police':1.88,'coupe':1.8}
    lengths={'sedan':4.65,'suv':4.9,'van':5.6,'taxi':4.65,'police':4.65,'coupe':4.35}
    w=widths[kind]; l=lengths[kind]; top={'suv':1.95,'van':2.45,'sedan':1.42,'taxi':1.43,'police':1.45,'coupe':1.29}[kind]
    body={'sedan':INK,'suv':COAL,'van':SLATE,'taxi':GOLD,'police':BLUE,'coupe':RUST}[kind]
    m.box(0,.76,0,l,.66,w,body)
    m.box(-.25,(top+.96)/2,0,l*.54,top-.96,w*.88,body)
    m.box(-.28,top-.24,w*.441,1.30,.35,.025,GLASS)
    m.box(-.28,top-.24,-w*.441,1.30,.35,.025,GLASS)
    m.box(.85,top-.38,0,.035,.50,w*.7,GLASS)
    m.box(-1.32,top-.38,0,.035,.50,w*.72,GLASS)
    for x in (-l*.31,l*.31):
        for z in (-w*.49,w*.49):
            m.cyl(x,.39,z,.39,.22,RUBBER,axis='z',segments=14)
            m.cyl(x,.39,z+(0.12 if z>0 else -0.12),.21,.025,STEEL,axis='z',segments=10)
    for z in (-w*.35,w*.35):
        m.box(l/2+.012,.90,z,.045,.13,.26,PAPER)
        m.box(-l/2-.012,.88,z,.045,.14,.29,RED)
    m.box(l/2+.03,.65,0,.05,.28,w*.67,BLACK)
    for z in (-w*.54,w*.54): m.box(.3,1.1,z,.26,.11,.14,body)
    if kind=='taxi':m.box(-.35,top+.09,0,.65,.17,.31,PAPER)
    if kind=='police':m.box(-.35,top+.10,0,.65,.12,.20,RED)
    if kind=='van':
        for z in (-w*.42,w*.42):m.box(-1.85,1.70,z,.65,.8,.04,GLASS)
        m.cyl(-.5,top+.13,0,.18,.3,BLACK)
    if kind=='suv':m.box(-1.55,top+.05,0,2.3,.09,1.2,BLACK)
    if kind=='coupe':m.box(-l/2-.12,1.10,0,.20,.09,w*.87,INK)


def motorcycle(m):
    for x in (-.87,.87):
        m.cyl(x,.45,0,.44,.22,RUBBER,axis='z',segments=16)
        m.cyl(x,.45,.116,.2,.015,STEEL,axis='z',segments=12)
    m.box(0,.96,0,1.9,.29,.45,INK)
    m.box(-.25,1.23,0,.76,.25,.5,COAL)
    m.box(.49,1.19,0,.62,.26,.58,RED_DARK)
    m.box(-.25,1.48,0,.63,.09,.41,RUBBER)
    m.box(.92,1.48,0,.08,.66,.83,STEEL)
    m.box(.95,1.61,0,.24,.24,.51,GLASS)
    m.box(-.91,1.01,0,.05,.6,.40,SLATE)


def person(m,role):
    outfit={'mara':COAL,'nadia':SLATE,'guard':BLUE,'courier':OLIVE,'operative':INK,'informant':RUST}[role]
    hair={'mara':BLACK,'nadia':INK,'guard':BLACK,'courier':COAL,'operative':BLACK,'informant':SAND}[role]
    m.box(0,1.28,0,.53,.69,.31,outfit)
    m.box(0,1.13,.166,.28,.28,.03,RUBBER)
    m.box(0,1.80,0,.14,.15,.16,SAND)
    m.ball(0,1.96,0,.165,.195,.145,SAND)
    m.ball(0,2.085,-.03,.17,.082,.15,hair)
    for s in (-1,1):
        m.box(s*.35,1.34,0,.17,.58,.19,outfit)
        m.ball(s*.35,.98,0,.084,.09,.075,SAND)
        m.box(s*.145,.57,0,.20,.78,.22,INK)
        m.box(s*.145,.12,.045,.255,.18,.37,RUBBER)
        m.box(s*.28,1.58,.12,.065,.1,.055,CYAN if role in ('mara','operative') else STEEL)
    m.box(0,1.02,0,.50,.21,.34,RUBBER)
    m.box(.0,1.53,-.165,.22,.24,.085,RED_DARK if role=='mara' else BLACK)
    if role in ('mara','operative'):
        m.box(.21,.96,.13,.14,.25,.16,BLACK)
        m.box(-.22,1.0,.18,.16,.28,.16,BLACK)
        m.box(.1,1.87,.147,.07,.04,.03,CYAN)
    if role=='nadia':m.box(0,1.44,-.21,.46,.48,.15,BLACK)
    if role=='guard':m.box(0,1.58,.18,.25,.21,.07,PAPER)
    if role=='courier':m.box(0,1.4,-.25,.42,.53,.24,RUST)


def drone(m):
    m.box(0,.65,0,.62,.22,.48,COAL)
    m.box(0,.52,.17,.17,.11,.18,GLASS)
    for x in (-.58,.58):
        for z in (-.58,.58):
            m.box(x/2,.65,z/2,abs(x)+.22,.065,.065,STEEL) if z==-.58 else m.box(x/2,.65,z/2,.08,.065,abs(z)+.22,STEEL)
            m.cyl(x,.70,z,.21,.065,BLACK)
            m.disc(x,.741,z,.24,CYAN)
            m.box(x*.60,.36,z*.60,.035,.33,.035,STEEL)


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


def building(m,kind):
    if kind=='office':
        w,d,h=6,5,14; wall=SLATE; floors=9
    elif kind=='residential':
        w,d,h=5,4,11;wall=RUST;floors=7
    elif kind=='hotel':
        w,d,h=8,5,16;wall=COAL;floors=10
    elif kind=='depot':
        w,d,h=9,7,4;wall=SAND;floors=1
    m.box(0,h/2,0,w,h,d,wall)
    m.box(0,h+.10,0,w+.15,.20,d+.16,RUBBER)
    for floor in range(floors):
        y=.95+floor*(h-.95)/floors
        for col in range(4 if w>=8 else 3):
            x=(col-((4 if w>=8 else 3)-1)/2)*(w-1)/((4 if w>=8 else 3)-1)
            m.box(x,y,d/2+.015,.61,.79,.025,GLASS if kind=='office' else INK)
            if kind=='residential':m.box(x,y-.40,d/2+.045,.69,.08,.1,STEEL)
        if floor%2==0 and kind!='depot':m.box(0,y+.48,d/2+.038,w*.88,.035,.03,INK)
    m.box(0,.76,d/2+.038,1.0,1.5,.042,BLACK)
    if kind=='depot':
        m.box(-2,1.75,d/2+.045,3.6,3.2,.07,INK)
        m.box(2.2,2.8,d/2+.04,1.5,.75,.06,GLASS)
    if kind=='hotel':m.box(0,h+.4,0,.35,.58,.35,GOLD)


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
        recipes.append((f'escenario_{kind}','escenarios',lambda m,k=kind:environment(m,k),'módulo de escena','A modularizar y conectar con GIS/MC4'))
    for name,category,fn,kind,use in recipes:
        mesh=Mesh();fn(mesh);pts,tris,size=mesh.export(OUT/(name+'.glb'))
        bounds=[round(min(p[i] for p in mesh.p),3) for i in range(3)],[round(max(p[i] for p in mesh.p),3) for i in range(3)]
        manifest.append({'id':name,'categoria':category,'archivo':name+'.glb','vertices':pts,'triangulos':tris,'bytes':size,'bounds_metros':bounds,'estado':'proxy_3d_no_final','uso':use})
    (OUT.parent/'manifest.json').write_text(json.dumps({'proyecto':'TURNO CERO: MANHATTAN','version':'0.2.0-preproduccion','licencia':'CC0-1.0 - geometria procedural original','escala':'1 unidad = 1 metro; glTF Y-up','nota':'Modelos GLB para bloqueo de escenas y adaptación; NO assets de lanzamiento ni modelos detallados / animados. Sin datos GIS oficiales.','total':len(manifest),'assets':manifest},ensure_ascii=False,indent=2),encoding='utf8')
    print(f'{len(manifest)} GLB 2.0 assets creados: {sum(x["bytes"] for x in manifest)/1024:.0f} KiB')
    print(f'Geometría: {sum(x["triangulos"] for x in manifest):,} triángulos; {sum(x["vertices"] for x in manifest):,} vértices')
    return manifest

if __name__=='__main__':make_models()