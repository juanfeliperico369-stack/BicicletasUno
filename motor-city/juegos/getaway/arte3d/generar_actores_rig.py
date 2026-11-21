#!/usr/bin/env python3
"""Generate ORIGINAL game-ready *rigged prototype* GLB 2.0 characters, offline.

12 articulated bones, eight named animation clips, metric units (Y-up), vertex
colors, PBR, four-joint skin attributes. These are NOT finished cinematic art.
Requires only the Python standard library. No web, no external assets.
"""
import math, json, struct, sys
from pathlib import Path

OUT=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).with_name('rigged'))
OUT.mkdir(parents=True, exist_ok=True)

# joint index != glTF node index. Parent ties in local space.
SKELETON=[
 ('hips',-1,[0,.96,0]),
 ('spine',0,[0,.46,0]),
 ('head',1,[0,.39,0]),
 ('upperArm_L',1,[-.39,.24,0]),
 ('lowerArm_L',3,[0,-.39,0]),
 ('upperArm_R',1,[.39,.24,0]),
 ('lowerArm_R',5,[0,-.39,0]),
 ('upperLeg_L',0,[-.18,-.1,0]),
 ('lowerLeg_L',7,[0,-.41,0]),
 ('upperLeg_R',0,[.18,-.1,0]),
 ('lowerLeg_R',9,[0,-.41,0]),
 ('spineGear',1,[0,-.11,.22]),
]
WORLD=[]
for name,parent,translation in SKELETON:
 pos=translation[:]
 if parent>=0:pos=[pos[i]+WORLD[parent][i] for i in range(3)]
 WORLD.append(pos)

def c(hexstr):
 s=hexstr.lstrip('#');return tuple(int(s[i:i+2],16) for i in (0,2,4))+(255,)
def rot(axis,deg):
 a=deg*.5*math.pi/180;s=math.sin(a);co=math.cos(a)
 return ([s,0,0,co] if axis=='x' else [0,s,0,co] if axis=='y' else [0,0,s,co])

def export(kind,path):
 pal={'mara':['#333f4a','#28343f','#c8ab93','#1b2733','#9c695c'],
 'rook':['#38414a','#202b37','#c3a48b','#252e39','#5e6d74'],
 'guard':['#53606a','#303943','#a58c78','#26353e','#737e85'],
 'nadia':['#586e68','#263b3c','#bda390','#26323a','#758c75'],
 'noah':['#5c6170','#2d3442','#b88b72','#272c35','#7d858a'],
 'cross':['#3d4d5e','#293544','#d1ac96','#171f2d','#647483'],
 'contador':['#48444c','#292b33','#a18d80','#1c2027','#8c6d5f'],
 'peaton_a':['#95785d','#3e4851','#bf9c81','#424347','#c1a76e'],
 'peaton_b':['#527184','#394650','#81685b','#171c21','#a4a09a']}[kind]
 pos=[];norm=[];cols=[];joints=[];weights=[];indices=[]
 def tri(a,b,d,color,joint):
  u=[b[k]-a[k] for k in range(3)];v=[d[k]-a[k] for k in range(3)]
  n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
  length=math.hypot(*n) or 1;n=[t/length for t in n]
  i=len(pos)
  for p in [a,b,d]:
   # C-M33: peso compartido cerca de codos y rodillas, sin quiebres rígidos.
   pares={3:(4,1.13),4:(3,1.13),5:(6,1.13),6:(5,1.13),7:(8,.42),8:(7,.42),9:(10,.42),10:(9,.42)}
   if joint in pares:
    otro,altura=pares[joint]
    mezcla=round(max(0,1-abs(p[1]-altura)/.28)*68)
    joints.append((joint,otro,0,0));weights.append((255-mezcla,mezcla,0,0))
   else:
    joints.append((joint,0,0,0));weights.append((255,0,0,0))
   pos.append(p);norm.append(n);cols.append(c(color))
  indices.extend([i,i+1,i+2])
 def box(x,y,z,sx,sy,sz,col,joint):
  X=[x-sx/2,x+sx/2];Y=[y-sy/2,y+sy/2];Z=[z-sz/2,z+sz/2]
  p=lambda a,b,c:[X[a],Y[b],Z[c]]
  q=[p(0,0,0),p(1,0,0),p(1,1,0),p(0,1,0),p(0,0,1),p(1,0,1),p(1,1,1),p(0,1,1)]
  for a,b,d,e in [(1,0,3,2),(4,5,6,7),(0,4,7,3),(5,1,2,6),(3,7,6,2),(0,1,5,4)]:
   tri(q[a],q[b],q[d],col,joint);tri(q[a],q[d],q[e],col,joint)
 def scalp(x,y,z,sx,sy,sz,col,joint):
  box(x,y,z,sx,sy,sz,col,joint)
 # centered bind-space geometry. The characters are original, with no brand likeness.
 box(0,1.24,0,.67,.72,.42,pal[0],1)      # chest on spine
 box(0,.95,0,.57,.30,.40,pal[0],0)       # belt
 box(0,1.71,0,.43,.37,.42,pal[2],2)    # head
 scalp(0,1.91,.01,.47,.14,.43,pal[3],2)
 box(0,1.65,-.217,.31,.07,.014,'#77665d',2)
 for side,j1,j2 in [(-1,3,4),(1,5,6)]:
  box(side*.42,1.30,0,.24,.73,.30,pal[0],j1)
  box(side*.42,.95,0,.20,.39,.27,pal[0],j2)
  box(side*.42,.73,0,.20,.18,.24,pal[2],j2)
 for side,j1,j2 in [(-1,7,8),(1,9,10)]:
  box(side*.18,.63,0,.26,.52,.30,pal[1],j1)
  box(side*.18,.25,0,.25,.48,.26,pal[1],j2)
  box(side*.18,.075,-.09,.27,.15,.44,pal[3],j2)
 box(0,1.32,.24,.36,.42,.17,pal[3],11)
 box(-.24,1.01,.24,.17,.25,.17,pal[4],11)
 # Each mesh uses one material, color baked per vertex; no external URI.
 binary=bytearray();views=[];access=[]
 def data(seq,fmt,target=None,alignment=4):
  while len(binary)%alignment:binary.append(0)
  start=len(binary)
  for row in seq:
   binary.extend(struct.pack(fmt,*row) if isinstance(row,(list,tuple)) else struct.pack(fmt,row))
  o={'buffer':0,'byteOffset':start,'byteLength':len(binary)-start}
  if target:o['target']=target
  views.append(o);return len(views)-1
 def acc(seq,fmt,component,typ,target=None,normalize=False,bound=False):
  idx=data(seq,fmt,target);a={'bufferView':idx,'componentType':component,'count':len(seq),'type':typ}
  if normalize:a['normalized']=True
  if bound and seq:
   if isinstance(seq[0],(int,float)):
    a['min']=[min(seq)];a['max']=[max(seq)]
   else:
    a['min']=[min(row[i] for row in seq) for i in range(len(seq[0]))]
    a['max']=[max(row[i] for row in seq) for i in range(len(seq[0]))]
  access.append(a);return len(access)-1
 p=acc(pos,'<3f',5126,'VEC3',34962,bound=True)
 n=acc(norm,'<3f',5126,'VEC3',34962)
 co=acc(cols,'<4B',5121,'VEC4',34962,normalize=True)
 j=acc(joints,'<4B',5121,'VEC4',34962)
 w=acc(weights,'<4B',5121,'VEC4',34962,normalize=True)
 ix=acc(indices,'<I',5125,'SCALAR',34963)
 # Inverse bind matrices: for translation-only bind pose, inverse is -joint WORLD pos.
 inv=[]
 for x,y,z in WORLD:
  inv.append([1,0,0,0,0,1,0,0,0,0,1,0,-x,-y,-z,1])
 ibm=acc(inv,'<16f',5126,'MAT4')
 nodes=[{'name':'actor_root','children':[1,len(SKELETON)+1]}]
 for i,(name,parent,t) in enumerate(SKELETON):
  node={'name':name,'translation':t}
  nodes.append(node)
 for i,(_,parent,t) in enumerate(SKELETON):
  if parent>=0:nodes[parent+1].setdefault('children',[]).append(i+1)
 nodes.append({'name':'skinned_body','mesh':0,'skin':0})
 anim=[]
 def clip(name,seconds,frames):
  times=sorted(set(t for t,_ in frames));timeacc=acc(times,'<f',5126,'SCALAR',bound=True)
  tracks={}
  for ftime,moves in frames:
   for j,op in moves.items():tracks.setdefault(j,{})[ftime]=op
  samplers=[];channels=[]
  for joint,values in tracks.items():
   rotations=[]
   for t in times:rotations.append(values.get(t,[0,0,0,1]))
   out=acc(rotations,'<4f',5126,'VEC4')
   samplers.append({'input':timeacc,'output':out,'interpolation':'LINEAR'})
   channels.append({'sampler':len(samplers)-1,'target':{'node':joint+1,'path':'rotation'}})
  anim.append({'name':name,'samplers':samplers,'channels':channels,'extras':{'duration_s':seconds,'description':'Original stylized action animation'}})
 # Use keyed quaternions, all identities at starts and ends for seamless loops.
 z=[0,0,0,1]
 clip('idle_breath',2,[(0,{1:rot('x',-1),2:rot('y',0)}),(1,{1:rot('x',2),2:rot('y',3)}),(2,{1:rot('x',-1),2:rot('y',0)})])
 clip('walk_loop',1,[(0,{3:rot('x',-25),5:rot('x',25),7:rot('x',25),9:rot('x',-25)}),(.25,{3:z,5:z,7:z,9:z}),(.5,{3:rot('x',25),5:rot('x',-25),7:rot('x',-25),9:rot('x',25)}),(.75,{3:z,5:z,7:z,9:z}),(1,{3:rot('x',-25),5:rot('x',25),7:rot('x',25),9:rot('x',-25)})])
 clip('sprint_loop',.7,[(0,{3:rot('x',-49),5:rot('x',49),7:rot('x',49),9:rot('x',-49)}),(.35,{3:rot('x',49),5:rot('x',-49),7:rot('x',-49),9:rot('x',49)}),(.7,{3:rot('x',-49),5:rot('x',49),7:rot('x',49),9:rot('x',-49)})])
 clip('sneak_loop',1.2,[(0,{1:rot('x',14),7:rot('x',15),9:rot('x',-15)}),(.6,{1:rot('x',17),7:rot('x',-15),9:rot('x',15)}),(1.2,{1:rot('x',14),7:rot('x',15),9:rot('x',-15)})])
 clip('nonlethal_strike',.8,[(0,{5:z,6:z}),(.2,{5:rot('x',-50),6:rot('x',-40)}),(.4,{5:rot('x',-100),6:rot('x',-20)}),(.6,{5:rot('x',-65),6:z}),(.8,{5:z,6:z})])
 clip('interact_device',1.25,[(0,{3:z,4:z,5:z,6:z}),(.32,{3:rot('x',-46),4:rot('x',-24),5:rot('x',-46),6:rot('x',-24)}),(.92,{3:rot('x',-46),4:rot('x',-24),5:rot('x',-46),6:rot('x',-24)}),(1.25,{3:z,4:z,5:z,6:z})])
 clip('dodge_step',.85,[(0,{1:z,7:z,9:z}),(.2,{1:rot('z',-18),7:rot('x',-35),9:rot('x',20)}),(.4,{1:rot('z',-32),7:rot('x',20),9:rot('x',-35)}),(.85,{1:z,7:z,9:z})])
 clip('hit_reaction',.6,[(0,{1:z,2:z}),(.17,{1:rot('x',24),2:rot('x',-15)}),(.4,{1:rot('x',-8),2:rot('x',10)}),(.6,{1:z,2:z})])
 doc={'asset':{'version':'2.0','generator':'Turno Cero · original rig and eight clips'},
 'scene':0,'scenes':[{'nodes':[0]}],'nodes':nodes,
 'skins':[{'name':'humanoid_12_bones','joints':list(range(1,len(SKELETON)+1)),'skeleton':1,'inverseBindMatrices':ibm}],
 'meshes':[{'name':kind+'_skinned','primitives':[{'attributes':{'POSITION':p,'NORMAL':n,'COLOR_0':co,'JOINTS_0':j,'WEIGHTS_0':w},'indices':ix,'material':0,'mode':4}]}],
 'materials':[{'name':'VertexColorPBR','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':.09,'roughnessFactor':.75}}],
 'animations':anim,'accessors':access,'bufferViews':views,'buffers':[{'byteLength':len(binary)}],
 'extras':{'status':'rigged_lowpoly_prototype','geography':'none','license':'CC0-1.0'}}
 js=json.dumps(doc,separators=(',',':')).encode('utf-8');js+=b' '*((-len(js))%4)
 while len(binary)%4:binary.append(0)
 total=12+8+len(js)+8+len(binary)
 glb=b'glTF'+struct.pack('<II',2,total)+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(binary),b'BIN\0')+binary
 path.write_bytes(glb)
 return {'file':path.name,'bones':len(SKELETON),'animations':[a['name'] for a in anim],'vertices':len(pos),'triangles':len(indices)//3,'bytes':len(glb)}

if __name__=='__main__':
 results=[export(k,OUT/('personaje_'+k+'_rig.glb')) for k in ['mara','rook','guard','nadia','noah','cross','contador','peaton_a','peaton_b']]
 (OUT/'manifest-rig.json').write_text(json.dumps({'schema_version':1,'license':'CC0-1.0','unit':'m','axis':'Y-up','result':results},ensure_ascii=False,indent=2),encoding='utf-8')
 for result in results: print(result)
