#!/usr/bin/env python3
"""C-A16 · comprobar glTF 2.0 PBR, UV, 2 PNG empotrados y rig de actores."""
import json,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parent/'pbr'
M=json.loads((ROOT/'manifest-pbr.json').read_text(encoding='utf-8'))
assert M['total']==6
for A in M['assets']:
    p=ROOT/A['glb'];b=p.read_bytes()
    assert b[:4]==b'glTF' and struct.unpack_from('<I',b,4)[0]==2
    assert struct.unpack_from('<I',b,8)[0]==len(b)
    n,tag=struct.unpack_from('<I4s',b,12)
    assert tag==b'JSON'
    J=json.loads(b[20:20+n])
    size,bt=struct.unpack_from('<I4s',b,20+n)
    assert bt==b'BIN\x00'
    raw=b[28+n:28+n+size]
    assert len(raw)==J['buffers'][0]['byteLength']
    prim=J['meshes'][0]['primitives'][0]
    assert {'POSITION','NORMAL','COLOR_0','TEXCOORD_0'}<=prim['attributes'].keys()
    ua=J['accessors'][prim['attributes']['TEXCOORD_0']]
    assert ua['type']=='VEC2' and ua['componentType']==5126
    assert ua['count']==J['accessors'][prim['attributes']['POSITION']]['count']
    uv=J['bufferViews'][ua['bufferView']]
    off=uv.get('byteOffset',0)+ua.get('byteOffset',0)
    vals=struct.unpack_from('<'+'f'*(2*ua['count']),raw,off)
    assert all(0<=v<=1 for v in vals),(p,'UV fuera de rango')
    assert len(J['images'])==len(J['textures'])==2
    mat=J['materials'][0]['pbrMetallicRoughness']
    assert 'baseColorTexture' in mat and 'metallicRoughnessTexture' in mat
    for im in J['images']:
        v=J['bufferViews'][im['bufferView']]
        png=raw[v['byteOffset']:v['byteOffset']+v['byteLength']]
        assert png.startswith(b'\x89PNG\r\n\x1a\n')
        assert struct.unpack_from('>II',png,16)==(1024,1024)
        assert im['mimeType']=='image/png'
    if A['glb'].endswith('_rig_pbr.glb'):
        assert len(J['skins'])==1 and len(J['skins'][0]['joints'])==12
        assert len(J['animations'])==8
    print('OK',p.name,'UV',ua['count'],'PNG 1024x1024 x2',len(J.get('animations',[])),'clips')
print('C-A16: 6/6 GLB 2.0 PBR, UV, PNG y rigs validados')
