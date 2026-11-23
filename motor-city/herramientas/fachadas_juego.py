#!/usr/bin/env python3
"""R1 · versiones de juego de las fachadas de Medellín (las que van dentro del HTML).

Los originales de ChatGPT (arte/fachadas/medellin/*_2048.webp) vienen de 1254 px reescalados: incrustarlos a 2048
sumaba 6,7 MB a cada HTML sin ganar detalle, y el juego igual las bajaba a 1024 en la GPU.
Aquí salen las copias de juego: albedo a 1024 y emisión (solo ventanas, casi todo negro) a 512.
Uso: python3 herramientas/fachadas_juego.py   (lo lee herramientas/construir.mjs)
"""
import json, os, sys
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(RAIZ, 'arte/fachadas/medellin')
SAL = os.path.join(DIR, 'juego')
os.makedirs(SAL, exist_ok=True)
mf = json.load(open(os.path.join(DIR, 'manifiesto.json'), encoding='utf-8'))
total = 0
for f in mf['fachadas']:
    for campo, lado, q, nombre in (('day', 1024, 82, 'albedo_1024'), ('emission', 512, 80, 'emision_512')):
        src = os.path.join(DIR, os.path.basename(f[campo]))
        if not os.path.exists(src):
            print('· falta', src); continue
        im = Image.open(src).convert('RGB').resize((lado, lado), Image.LANCZOS)
        dst = os.path.join(SAL, f"{f['id']}_{nombre}.webp")
        im.save(dst, 'WEBP', quality=q, method=6)
        total += os.path.getsize(dst)
print(f'✓ fachadas de juego: {total / 1e6:.2f} MB en {SAL}')
