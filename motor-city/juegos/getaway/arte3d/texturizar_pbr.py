#!/usr/bin/env python3
"""C-A16 · UV, atlas PBR de 1024 y GLB autosuficientes para 4 vehículos + 2 actores.
Sólo stdlib; conserva piel, clips y geometría de los GLB de origen. Arte provisional CC0."""
import json, math, struct, zlib
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'pbr'
ASSETS=['vehiculo_sedan','vehiculo_suv','vehiculo_taxi','vehiculo_police',
        'personaje_mara_rig','personaje_guard_rig']
TAM=1024
CELDA=128

def png_chunk(tipo,datos):
    return struct.pack('>I',len(datos))+tipo+datos+struct.pack('>I',zlib.crc32(tipo+datos)&0xffffffff)

def crear_png(paleta,es_metal=False):
    filas=[]
    for y in range(TAM):
        fila=bytearray([0])
        ty=y//CELDA
        for x in range(TAM):
            i=ty*8+x//CELDA
            color=paleta[i] if i<len(paleta) else (128,128,128)
            ruido=((x//8*17)^(y//8*29)^(i*13))&15
            if es_metal:
                r,g,b=color
                if max(r,g,b)<70: rug,metal=.92,.02
                elif b>r*1.12 and g>r*1.07: rug,metal=.38,.22
                elif max(r,g,b)>180: rug,metal=.66,.18
                else: rug,metal=.52,.32
                fila.extend((0,max(16,min(255,int((rug+ruido/320)*255))),
                             int(metal*255),255))
            else:
                tono=236+ruido
                fila.extend((tono,tono,tono,255))
        filas.append(bytes(fila))
    cuerpo=zlib.compress(b''.join(filas),level=9)
    return (b'\x89PNG\r\n\x1a\n'+png_chunk(b'IHDR',struct.pack('>IIBBBBB',TAM,TAM,8,6,0,0,0))
            +png_chunk(b'IDAT',cuerpo)+png_chunk(b'IEND',b''))

def leer_glb(ruta):
    buf=ruta.read_bytes()
    assert buf[:4]==b'glTF' and struct.unpack_from('<I',buf,4)[0]==2
    assert struct.unpack_from('<I',buf,8)[0]==len(buf)
    n,tipo=struct.unpack_from('<I4s',buf,12)
    assert tipo==b'JSON'
    doc=json.loads(buf[20:20+n])
    k=20+n
    nb,bt=struct.unpack_from('<I4s',buf,k)
    assert bt==b'BIN\x00'
    binary=bytearray(buf[k+8:k+8+nb])
    return doc,binary

def accessor(doc,buf,idx):
    a=doc['accessors'][idx]
    v=doc['bufferViews'][a['bufferView']]
    offset=v.get('byteOffset',0)+a.get('byteOffset',0)
    tipos={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
    formatos={5121:('B',1),5123:('H',2),5125:('I',4),5126:('f',4)}
    fmt,size=formatos[a['componentType']]
    n=a['count']*tipos[a['type']]
    return struct.unpack_from('<'+fmt*n,buf,offset)

def añadir(doc,buf,data,target=None):
    buf.extend(b'\0'*((-len(buf))%4))
    start=len(buf);buf.extend(data)
    v={'buffer':0,'byteOffset':start,'byteLength':len(data)}
    if target is not None:v['target']=target
    doc['bufferViews'].append(v)
    return len(doc['bufferViews'])-1

def texturizar(nombre):
    origen=(ROOT/('rigged' if nombre.endswith('_rig') else 'modelos')/(nombre+'.glb'))
    doc,buf=leer_glb(origen)
    prim=doc['meshes'][0]['primitives'][0]
    p=accessor(doc,buf,prim['attributes']['POSITION'])
    c=accessor(doc,buf,prim['attributes']['COLOR_0'])
    total=len(p)//3
    assert len(c)==total*4
    paleta=sorted({tuple(c[i*4:i*4+3]) for i in range(total)})
    assert 0<len(paleta)<=64,(nombre,len(paleta))
    colores={col:i for i,col in enumerate(paleta)}
    uv=bytearray()
    for i in range(total):
        idx=colores[tuple(c[i*4:i*4+3])]
        col=idx%8;row=idx//8
        x,y,z=p[3*i:3*i+3]
        U=(col+.13+.74*(.5+.5*math.sin(x*4.13+z*1.73)))/8
        V=(row+.13+.74*(.5+.5*math.sin(y*4.61-x*.87)))/8
        uv.extend(struct.pack('<2f',U,V))
    bv=añadir(doc,buf,uv,34962)
    doc['accessors'].append({'bufferView':bv,'componentType':5126,'count':total,
                             'type':'VEC2','min':[0.,0.],'max':[1.,1.]})
    prim['attributes']['TEXCOORD_0']=len(doc['accessors'])-1
    btex=crear_png(paleta)
    mtex=crear_png(paleta,True)
    doc.setdefault('images',[])
    for nombre_img,img in [('basecolor',btex),('metalrough',mtex)]:
        doc['images'].append({'bufferView':añadir(doc,buf,img),'mimeType':'image/png',
                               'name':nombre+'_'+nombre_img+'_1024'})
        (OUT/(nombre+'_'+nombre_img+'_1024.png')).write_bytes(img)
    doc['samplers']=[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}]
    doc['textures']=[{'sampler':0,'source':i} for i in range(2)]
    for mat in doc['materials']:
        pr=mat.setdefault('pbrMetallicRoughness',{})
        pr.update({'baseColorFactor':[1,1,1,1], 'baseColorTexture':{'index':0},
                   'metallicFactor':1.0,'roughnessFactor':1.0,'metallicRoughnessTexture':{'index':1}})
        mat['doubleSided']=True
    doc['buffers'][0]['byteLength']=len(buf)+((-len(buf))%4)  # la sección BIN se alinea a 4 bytes
    doc.setdefault('extras',{})['pbr_preproduccion']=True
    doc['asset']['generator']='Turno Cero · C-A16 glTF PBR 1024 atlas + rig preserving'
    J=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode('utf-8')
    J+=b' '*((-len(J))%4)
    buf.extend(b'\0'*((-len(buf))%4))
    longitud=12+8+len(J)+8+len(buf)
    output=(b'glTF'+struct.pack('<II',2,longitud)+struct.pack('<I4s',len(J),b'JSON')+J
            +struct.pack('<I4s',len(buf),b'BIN\x00')+buf)
    ruta=OUT/(nombre+'_pbr.glb');ruta.write_bytes(output)
    return {'original':origen.name,'glb':ruta.name,'material':'PBR baked UV + vertex-color',
            'atlas_px':TAM,'paleta':len(paleta),'vertices':total,
            'bytes_glb':len(output),'animaciones':len(doc.get('animations',[])),
            'textures':[nombre+'_basecolor_1024.png',nombre+'_metalrough_1024.png']}

if __name__=='__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    resultados=[texturizar(n) for n in ASSETS]
    (OUT/'manifest-pbr.json').write_text(json.dumps({'formato':'glTF 2.0','licencia':'CC0-1.0',
      'estado':'textura procedural PBR de desarrollo, no acabado cinematografico',
      'atlas_px':TAM,'total':len(resultados),'assets':resultados},ensure_ascii=False,indent=2),encoding='utf-8')
    for a in resultados: print('PBR',a['glb'],a['bytes_glb'],'bytes',a['paleta'],'materiales')
