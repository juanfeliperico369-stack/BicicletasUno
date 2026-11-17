#!/usr/bin/env python3
"""Juega EnCicla · arma y desarma las entregas de arte e historia de las IA.

ARMAR (cada IA al terminar, y la consolidación final C-99):
    python armar_entrega.py armar <carpeta> <ia> [carpeta_salida]
  Lee <carpeta>: imágenes (.png .jpg .webp) con su .txt de prompt al lado, textos (.md .txt .json)
  y el documento de entrega (entrega.md). Crea en carpeta_salida (por defecto listo_<ia>, junto a <carpeta>):
    1. encicla_maestro_<ia>_<fecha>.pdf   PDF maestro con todo el trabajo
    2. encicla_imagenes_<ia>_<fecha>.md    MD con el código (base64) de cada imagen y su manifiesto
    3. encicla_entrega_<ia>_<fecha>.zip    ZIP con las imágenes originales, los textos y el PDF maestro
DESARMAR (reconstruye las imágenes exactas desde el MD y verifica el SHA-256):
    python armar_entrega.py desarmar <archivo.md> [más partes .md] <carpeta_destino>
Requiere Python 3.8+ y Pillow. Con reportlab el PDF queda con mejor texto (si no está, usa Pillow).
"""
import base64, datetime, hashlib, io, json, os, re, sys, zipfile

IMG = ('.png', '.jpg', '.jpeg', '.webp')
TXT = ('.md', '.txt', '.json')
LIM = 45 * 1024 * 1024          # tamaño máximo de cada parte del MD
FUENTES = ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf',
           '/Library/Fonts/Arial Unicode.ttf', 'C:/Windows/Fonts/arial.ttf']
PAT = re.compile(r'<!-- img:inicio (\S+) sha256=([0-9a-f]{64}) -->\s*```base64\s*\n(.*?)```\s*<!-- img:fin -->', re.S)


def ident(nombre):
    """g01_per_santi_hoja.png -> G-01 · c10_... -> C-10 · h20_... -> H-20"""
    m = re.match(r'([gch])(\d{2,3})_', os.path.basename(nombre).lower())
    return '%s-%s' % (m.group(1).upper(), m.group(2)) if m else '-'


def fuente_ttf():
    for p in FUENTES:
        if os.path.isfile(p):
            return p
    try:
        import matplotlib
        p = os.path.join(matplotlib.get_data_path(), 'fonts', 'ttf', 'DejaVuSans.ttf')
        return p if os.path.isfile(p) else None
    except Exception:
        return None


def leer(ruta):
    with open(ruta, encoding='utf-8', errors='replace') as f:
        return f.read()


def recoger(carpeta, excluir):
    """Devuelve (imágenes, textos, documentos de entrega) como rutas relativas, en orden."""
    rutas = []
    for raiz, dirs, archivos in os.walk(carpeta):
        dirs[:] = sorted(d for d in dirs if not d.startswith('.') and os.path.abspath(os.path.join(raiz, d)) != excluir)
        rutas += [os.path.relpath(os.path.join(raiz, a), carpeta).replace(os.sep, '/') for a in sorted(archivos)]
    imgs = [r for r in rutas if r.lower().endswith(IMG)]
    tallos = {os.path.splitext(r)[0] for r in imgs}
    docs = [r for r in rutas if os.path.basename(r).lower() == 'entrega.md']
    textos = [r for r in rutas if r.lower().endswith(TXT) and r not in docs and os.path.splitext(r)[0] not in tallos]
    return imgs, textos, docs


def manifiesto(carpeta, imgs):
    from PIL import Image
    M = []
    for r in imgs:
        p = os.path.join(carpeta, r)
        with open(p, 'rb') as f:
            b = f.read()
        try:
            with Image.open(p) as im:
                w, h = im.size
        except Exception:
            w = h = 0
        sc = os.path.splitext(p)[0] + '.txt'
        M.append({'id': ident(r), 'ruta': r, 'ancho': w, 'alto': h, 'bytes': len(b),
                  'sha256': hashlib.sha256(b).hexdigest(), 'prompt': leer(sc).strip() if os.path.isfile(sc) else ''})
    return sorted(M, key=orden)


def orden(it):
    """G antes que C, luego por número de encargo y por ruta."""
    i = it['id']
    return ('GCH'.find(i[0]) % 9 if i != '-' else 9, int(i[2:]) if i != '-' else 0, it['ruta'])


def escribir_md(carpeta, salida, base, ia, fecha, M):
    cab = ('# Juega EnCicla · Código de las imágenes · %s · %s\n\n'
           '> Cada imagen va en base64 entre `<!-- img:inicio ruta sha256=... -->` y `<!-- img:fin -->`.\n'
           '> Para reconstruirlas: `python armar_entrega.py desarmar <este .md> <carpeta>` (verifica el SHA-256).\n\n') % (ia, fecha)
    bloques = []
    for it in M:
        with open(os.path.join(carpeta, it['ruta']), 'rb') as f:
            s = base64.b64encode(f.read()).decode('ascii')
        cuerpo = '\n'.join(s[i:i + 76] for i in range(0, len(s), 76))
        bloques.append('### %s · %s\n%d×%d px · %.1f KB · sha256 `%s`\n\n**Prompt:** %s\n\n<!-- img:inicio %s sha256=%s -->\n```base64\n%s\n```\n<!-- img:fin -->\n\n'
                       % (it['id'], it['ruta'], it['ancho'], it['alto'], it['bytes'] / 1024, it['sha256'],
                          ' '.join(it['prompt'].split()) or '(sin prompt)', it['ruta'], it['sha256'], cuerpo))
    partes, actual, tam = [], [], 0
    for b in bloques:
        if actual and tam + len(b) > LIM:
            partes.append(actual); actual, tam = [], 0
        actual.append(b); tam += len(b)
    partes.append(actual)
    sal = []
    for i, p in enumerate(partes, 1):
        nom = base + ('.md' if len(partes) == 1 else '_parte%d.md' % i)
        with open(os.path.join(salida, nom), 'w', encoding='utf-8') as f:
            f.write(cab + ('> Parte %d de %d.\n\n' % (i, len(partes)) if len(partes) > 1 else ''))
            if i == 1:
                f.write('## Manifiesto\n```json\n' + json.dumps(M, ensure_ascii=False, indent=1) + '\n```\n\n')
            f.write('## Imágenes\n\n' + ''.join(p))
        sal.append(nom)
    return sal


def plano(im):
    """Imagen lista para el PDF: el pixel art pequeño se amplía sin suavizar y se aplana sobre gris claro."""
    from PIL import Image
    im = im.convert('RGBA')
    k = max(1, 512 // max(im.size))
    if k > 1:
        im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    fondo = Image.new('RGB', im.size, (238, 238, 238))
    fondo.paste(im, (0, 0), im)
    return fondo


def lineas_doc(carpeta, docs, textos, M, ia, fecha):
    """Contenido del PDF como lista de (tipo, dato): ('h1'|'h2'|'p'|'small', texto) o ('img', item) o ('pag', None)."""
    L = [('h1', 'Juega EnCicla · Entrega de arte e historia'), ('p', 'IA: %s · Fecha: %s' % (ia, fecha)),
         ('p', '%d imágenes · %d textos · %d documentos de entrega' % (len(M), len(textos), len(docs))), ('h2', 'Contenido')]
    L += [('small', '%s · %s' % (it['id'], it['ruta'])) for it in M] + [('small', '%s · %s' % (ident(t), t)) for t in textos]
    for d in docs:
        L += [('pag', None), ('h1', 'Documento de entrega · ' + (os.path.dirname(d) or ia))]
        for l in leer(os.path.join(carpeta, d)).splitlines():
            L.append(('h2', l.lstrip('#').strip()) if l.startswith('#') else ('p', l.replace('**', '')))
    for it in M:
        L += [('pag', None), ('h2', '%s · %s' % (it['id'], it['ruta'])),
              ('small', '%d×%d px · %.1f KB · sha256 %s' % (it['ancho'], it['alto'], it['bytes'] / 1024, it['sha256'])),
              ('img', it), ('small', 'Prompt: ' + (' '.join(it['prompt'].split()) or '(sin prompt)'))]
    for t in textos:
        L += [('pag', None), ('h2', '%s · %s' % (ident(t), t))] + [('code', l) for l in leer(os.path.join(carpeta, t)).splitlines()]
    return L


def pdf_reportlab(ruta, carpeta, L, ttf):
    from PIL import Image
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.utils import ImageReader, simpleSplit
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfgen import canvas
    fn, fb = 'Helvetica', 'Helvetica-Bold'
    if ttf:
        try:
            from reportlab.pdfbase.ttfonts import TTFont
            pdfmetrics.registerFont(TTFont('F', ttf)); fn = fb = 'F'
            neg = ttf.replace('.ttf', '-Bold.ttf')
            if os.path.isfile(neg):
                pdfmetrics.registerFont(TTFont('FB', neg)); fb = 'FB'
        except Exception:
            fn, fb = 'Helvetica', 'Helvetica-Bold'
    W, H = A4; m = 40; c = canvas.Canvas(ruta, pagesize=A4); c.setTitle('Juega EnCicla · Entrega'); y = [H - m]
    limpio = (lambda s: s) if fn == 'F' else (lambda s: s.encode('cp1252', 'replace').decode('cp1252'))
    TAM = {'h1': (fb, 18, 1.6), 'h2': (fb, 12.5, 1.5), 'p': (fn, 10, 1.4), 'small': (fn, 8, 1.35), 'code': (fn, 9, 1.35)}

    def nueva():
        c.showPage(); y[0] = H - m

    for tipo, dato in L:
        if tipo == 'pag':
            if y[0] < H - m: nueva()
        elif tipo == 'img':
            with Image.open(os.path.join(carpeta, dato['ruta'])) as im:
                im = plano(im)
            bw, bh = W - 2 * m, y[0] - m - 90
            if bh < 120: nueva(); bh = y[0] - m - 90
            s = min(bw / im.width, bh / im.height)
            buf = io.BytesIO(); im.save(buf, 'JPEG', quality=88); buf.seek(0)
            c.drawImage(ImageReader(buf), m + (bw - im.width * s) / 2, y[0] - im.height * s, im.width * s, im.height * s)
            y[0] -= im.height * s + 12
        else:
            f, t, g = TAM[tipo]
            ind = pdfmetrics.stringWidth(' ', f, t) * (len(dato) - len(dato.lstrip(' '))) if tipo == 'code' else 0
            for l in simpleSplit(limpio(dato.strip() if ind else dato), f, t, W - 2 * m - ind) or ['']:
                if y[0] < m + t: nueva()
                c.setFont(f, t); c.drawString(m + ind, y[0] - t, l); y[0] -= t * g
    c.save()


def pdf_pillow(ruta, carpeta, L, ttf):
    from PIL import Image, ImageDraw, ImageFont
    W, H, m = 1240, 1754, 80          # A4 a 150 ppp; cada página se agrega al archivo al terminarla

    def fuente(t):
        try:
            return ImageFont.truetype(ttf or 'DejaVuSans.ttf', t)
        except Exception:
            try:
                return ImageFont.load_default(size=t)
            except TypeError:
                return ImageFont.load_default()
    TAM = {'h1': (fuente(38), 1.5), 'h2': (fuente(26), 1.45), 'p': (fuente(21), 1.4), 'small': (fuente(17), 1.35), 'code': (fuente(19), 1.35)}
    st = {'pag': None, 'd': None, 'y': m, 'n': 0}

    def cerrar():
        if st['pag'] is not None:
            st['pag'].save(ruta, 'PDF', resolution=150, append=st['n'] > 0); st['n'] += 1

    def nueva():
        cerrar(); st['pag'] = Image.new('RGB', (W, H), 'white'); st['d'] = ImageDraw.Draw(st['pag']); st['y'] = m

    def partir(t, f, ancho):
        out = []
        for par in t.split('\n'):
            l = ''
            for w in par.split(' '):
                k = (l + ' ' + w).strip()
                if st['d'].textlength(k, font=f) <= ancho or not l: l = k
                else: out.append(l); l = w
            out.append(l)
        return out
    nueva()
    for tipo, dato in L:
        if tipo == 'pag':
            if st['y'] > m: nueva()
        elif tipo == 'img':
            with Image.open(os.path.join(carpeta, dato['ruta'])) as im:
                im = plano(im)
            bw, bh = W - 2 * m, H - st['y'] - m - 200
            if bh < 250: nueva(); bh = H - st['y'] - m - 200
            s = min(bw / im.width, bh / im.height)
            im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.NEAREST if s >= 1 else Image.LANCZOS)
            st['pag'].paste(im, (m + (bw - im.width) // 2, st['y'])); st['y'] += im.height + 24
        else:
            f, g = TAM[tipo]
            ind = int(st['d'].textlength(' ', font=f) * (len(dato) - len(dato.lstrip(' ')))) if tipo == 'code' else 0
            for l in partir(dato.strip() if ind else dato, f, W - 2 * m - ind):
                if st['y'] > H - m - f.size: nueva()
                st['d'].text((m + ind, st['y']), l, fill='black', font=f); st['y'] += int(f.size * g)
    cerrar()


def armar(carpeta, ia, salida=None):
    ia = re.sub(r'[^a-z0-9]+', '', ia.lower()) or 'ia'
    fecha = datetime.date.today().isoformat()
    carpeta = os.path.abspath(carpeta)
    salida = os.path.abspath(salida or os.path.join(os.path.dirname(carpeta), 'listo_' + ia))
    os.makedirs(salida, exist_ok=True)
    imgs, textos, docs = recoger(carpeta, salida)
    M = manifiesto(carpeta, imgs)
    with open(os.path.join(salida, 'manifiesto.json'), 'w', encoding='utf-8') as f:
        json.dump(M, f, ensure_ascii=False, indent=1)
    mds = escribir_md(carpeta, salida, 'encicla_imagenes_%s_%s' % (ia, fecha), ia, fecha, M)
    pdf = 'encicla_maestro_%s_%s.pdf' % (ia, fecha)
    L = lineas_doc(carpeta, docs, textos, M, ia, fecha)
    try:
        import reportlab  # noqa: F401
        if os.environ.get('ENCICLA_SIN_REPORTLAB'): raise ImportError
        pdf_reportlab(os.path.join(salida, pdf), carpeta, L, fuente_ttf())
    except ImportError:
        pdf_pillow(os.path.join(salida, pdf), carpeta, L, fuente_ttf())
    zp, raiz = 'encicla_entrega_%s_%s.zip' % (ia, fecha), 'encicla_entrega_%s_%s/' % (ia, fecha)
    with zipfile.ZipFile(os.path.join(salida, zp), 'w', zipfile.ZIP_DEFLATED) as z:
        for r in imgs + [os.path.splitext(i)[0] + '.txt' for i in imgs] + textos + docs:
            if os.path.isfile(os.path.join(carpeta, r)): z.write(os.path.join(carpeta, r), raiz + r)
        z.write(os.path.join(salida, pdf), raiz + pdf); z.write(os.path.join(salida, 'manifiesto.json'), raiz + 'manifiesto.json')
    print('Listo en %s:\n  1. %s\n  2. %s\n  3. %s\n%d imágenes · %d textos · %d documentos de entrega'
          % (salida, pdf, ' + '.join(mds), zp, len(M), len(textos), len(docs)))


def desarmar(mds, destino):
    base = os.path.abspath(destino); n = mal = 0; man = None
    for md in mds:
        txt = leer(md)
        mm = re.search(r'## Manifiesto\s*```json\s*\n(.*?)```', txt, re.S)
        if mm and man is None: man = mm.group(1)
        for ruta, sha, datos in PAT.findall(txt):
            final = os.path.abspath(os.path.join(base, ruta))
            if not final.startswith(base + os.sep):
                print('Ruta no válida:', ruta); mal += 1; continue
            b = base64.b64decode(''.join(datos.split()))
            if hashlib.sha256(b).hexdigest() != sha:
                print('El SHA-256 no coincide:', ruta); mal += 1; continue
            os.makedirs(os.path.dirname(final), exist_ok=True)
            with open(final, 'wb') as f:
                f.write(b)
            n += 1
    if man:
        os.makedirs(base, exist_ok=True)
        with open(os.path.join(base, 'manifiesto.json'), 'w', encoding='utf-8') as f:
            f.write(man)
    print('%d imágenes reconstruidas en %s%s' % (n, destino, ' · %d con problemas' % mal if mal else ''))
    return mal == 0 and n > 0


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) >= 3 and a[0] == 'armar':
        armar(a[1], a[2], a[3] if len(a) > 3 else None)
    elif len(a) >= 3 and a[0] == 'desarmar':
        sys.exit(0 if desarmar(a[1:-1], a[-1]) else 1)
    else:
        print(__doc__); sys.exit(2)
