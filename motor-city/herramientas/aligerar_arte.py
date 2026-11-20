#!/usr/bin/env python3
"""MOTOR CITY · aligerar el arte (atlas WebP de arte/<paquete>/).
   python3 herramientas/aligerar_arte.py [arte/chatgpt arte/gemini …] [--calidad 88] [--prueba]
   Los atlas que llegan sin pérdida (WebP «VP8L» o más de 4 bits por píxel) se vuelven a guardar como WebP con pérdida, calidad 88,
   con el canal alfa sin pérdida (los bordes suaves no cambian). Solo se reemplaza si ahorra más del 25 %.
   Las losetas que se repiten (texturas de suelo) quedan SIN pérdida: sus bordes deben coincidir píxel a píxel.
   Se marcan en el manifiesto con "sin_perdida": true (o llevan «suelo» o «textura» en el nombre).
   Los originales quedan en el historial de git. Mandados pasó de 8,2 MB a ~5,1 MB con esto (nov-2026).
   Requiere Pillow con WebP (pip install pillow)."""
import sys, os, glob, json
from PIL import Image
args = [a for a in sys.argv[1:] if not a.startswith('--')]
cal = int(sys.argv[sys.argv.index('--calidad') + 1]) if '--calidad' in sys.argv else 88
if '--calidad' in sys.argv: args = [a for a in args if a != str(cal)]
prueba = '--prueba' in sys.argv
raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
paquetes = args or sorted(d for d in glob.glob(os.path.join(raiz, 'arte', '*')) if os.path.exists(os.path.join(d, 'manifiesto.json')))
antes = despues = 0
for d in paquetes:
    man = json.load(open(os.path.join(d, 'manifiesto.json'), encoding='utf8'))
    for aid in man:
        f = os.path.join(d, aid + '.webp')
        if not os.path.exists(f): continue
        if man[aid].get('sin_perdida') or 'suelo' in aid or 'textura' in aid: antes += os.path.getsize(f); despues += os.path.getsize(f); print('· sin pérdida (loseta que se repite): %s/%s.webp' % (os.path.basename(d), aid)); continue
        im = Image.open(f); im.load(); n = os.path.getsize(f); bpp = n * 8 / (im.size[0] * im.size[1])
        antes += n
        cab = open(f, 'rb').read(4096); sin_perdida = b'VP8L' in cab and b'VP8 ' not in cab
        if bpp <= 4 and not sin_perdida: despues += n; continue
        tmp = f + '.tmp.webp'; im.save(tmp, 'WEBP', quality=cal, alpha_quality=100, method=6); m = os.path.getsize(tmp)
        if m < n * .75 and not prueba: os.replace(tmp, f); despues += m; print('✓ %s/%s.webp: %d KB → %d KB (%.1f → %.1f bits por píxel)' % (os.path.basename(d), aid, n // 1024, m // 1024, bpp, m * 8 / (im.size[0] * im.size[1])))
        else:
            os.remove(tmp); despues += n if not prueba else m; print(('· prueba ' if prueba else '· se deja ') + '%s/%s.webp (%d KB → %d KB)' % (os.path.basename(d), aid, n // 1024, m // 1024))
print('Total: %.2f MB → %.2f MB' % (antes / 1048576, despues / 1048576))
