"""Comprobación de los GLB del catálogo, sin dependencias externas."""
import json,struct
from pathlib import Path
root=Path(__file__).parent
catalog=json.loads((root/'manifest.json').read_text())
assert len(catalog['assets'])==catalog['total']==42
names=set()
for a in catalog['assets']:
 p=root/'modelos'/a['archivo'];buf=p.read_bytes()
 assert a['id'] not in names,names
 names.add(a['id'])
 assert buf[:4]==b'glTF' and struct.unpack_from('<I',buf,4)[0]==2,(p,'not GLB2')
 assert struct.unpack_from('<I',buf,8)[0]==len(buf),(p,'wrong byte length')
 jlen=struct.unpack_from('<I',buf,12)[0]
 assert buf[16:20]==b'JSON'
 doc=json.loads(buf[20:20+jlen]);assert len(doc['meshes'])>=1
 assert a['triangulos']>0 and a['vertices']>0
 assert a['bytes']==len(buf)
print('42/42 GLB: cabeceras, longitudes, JSON glTF y manifiesto coherentes')