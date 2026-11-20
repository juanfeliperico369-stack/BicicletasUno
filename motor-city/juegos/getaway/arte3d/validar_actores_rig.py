#!/usr/bin/env python3
"""GLB glTF 2.0 validator for Turno Cero rigged preproduction characters. No pip deps."""
import json,struct,sys
from pathlib import Path
root=Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).with_name('rigged'))
expected={'idle_breath','walk_loop','sprint_loop','sneak_loop','nonlethal_strike','interact_device','dodge_step','hit_reaction'}
for who in ('mara','rook','guard'):
 p=root/f'personaje_{who}_rig.glb'
 data=p.read_bytes()
 assert data[:4]==b'glTF' and struct.unpack_from('<I',data,4)[0]==2
 assert struct.unpack_from('<I',data,8)[0]==len(data)
 jlen,tag=struct.unpack_from('<I4s',data,12)
 assert tag==b'JSON'
 doc=json.loads(data[20:20+jlen])
 off=20+jlen
 blen,btag=struct.unpack_from('<I4s',data,off)
 assert btag==b'BIN\0'
 assert off+8+blen==len(data)
 assert doc['asset']['version']=='2.0'
 assert len(doc['skins'])==1 and len(doc['skins'][0]['joints'])==12
 assert set(a['name'] for a in doc['animations'])==expected
 assert len(doc['animations'])==8
 assert all(a['samplers'] and a['channels'] for a in doc['animations'])
 for i,v in enumerate(doc['bufferViews']):
  assert 0<=v.get('byteOffset',0)<=blen
  assert v.get('byteOffset',0)+v['byteLength']<=blen, (p.name,i)
 for a in doc['accessors']:
  assert 0<=a['bufferView']<len(doc['bufferViews'])
 for a in doc['animations']:
  for c in a['channels']:
   assert c['target']['path'] in ('rotation','translation','scale')
   assert 0<=c['target']['node']<len(doc['nodes'])
   assert 0<=c['sampler']<len(a['samplers'])
 prim=doc['meshes'][0]['primitives'][0]
 assert {'POSITION','NORMAL','COLOR_0','JOINTS_0','WEIGHTS_0'}<=prim['attributes'].keys()
 js=doc['accessors'][prim['attributes']['JOINTS_0']]
 ws=doc['accessors'][prim['attributes']['WEIGHTS_0']]
 assert js['type']=='VEC4' and ws['type']=='VEC4' and ws['normalized']
 assert js['count']==ws['count']>=600
 print(f'✓ {p.name}: {len(doc["skins"][0]["joints"])} huesos, 8 animaciones, {js["count"]} vértices, GLB correcto')
print('✓ 3/3 modelos articulados validados')
