"""Fase 1 · lámina «antes y después» de los DATOS de El Metro en las 6 zonas piloto: las huellas como las lee el juego
   (src/data/edificios.js, decodificado igual que 11-edificios.js · edifDe) sobre los corredores de la regla A (src/data/vias.js),
   con en rojo lo que pisa la calle. No cambia nada.
   Uso: python3 reportes/fase1-cenital/datos-antes-despues.py EDIFICIOS_ANTES.js EDIFICIOS_DESPUES.js VIAS.js SALIDA.webp"""
import sys, re, json, math, zlib, base64
import numpy as np, shapely
from PIL import Image, ImageDraw, ImageFont
A_JS, D_JS, V_JS, OUT = sys.argv[1:5]
LON0, LATN = -75.70, 6.46; KXM = 111320 * math.cos(math.radians((6.46 + 6.015) / 2)); KYM = 110574.0
ZONAS = [('Centro · La Candelaria', 6.2503, -75.5675), ('Laureles', 6.2445, -75.5925), ('El Poblado', 6.2087, -75.5677), ('Ladera · Santo Domingo', 6.2925, -75.5420), ('Río y viaducto · Industriales', 6.2302, -75.5760), ('Rural · Santa Elena', 6.2094, -75.4995)]
def edificios(path, cajas):
    s = open(path, encoding='utf8').read(); E = json.loads(re.search(r'const EDIFICIOS = (\{.*?\});', s).group(1)); b = zlib.decompress(base64.b64decode(re.search(r'EDIFICIOS.data = "([^"]+)"', s).group(1)), -15)
    o = 0
    def rv():
        nonlocal o
        v = sh = 0
        while True:
            c = b[o]; o += 1; v += (c & 127) << sh; sh += 7
            if not c & 128: return v
    nR = E['nx'] * E['ny']; cnt, p0, q0 = [], [], []; cp = cq = 0
    for r in range(nR): n = rv(); pb = rv(); qb = rv(); cnt.append(n); p0.append(cp); q0.append(cq); cp += pb; cq += qb
    L = E['len']; oPos = L[0]; oDim = oPos + L[1]; oAng = oDim + L[2]; oPis = oAng + L[3]; oKin = oPis + L[4]; oPol = oKin + L[5]; R, Q = E['R'], E['Q']
    uz = lambda v: -(v + 1) // 2 if v % 2 else v // 2; out = []; i0 = np.concatenate([[0], np.cumsum(cnt)])
    for r in range(nR):
        rx, ry = r % E['nx'], r // E['nx']; X0, Y0 = rx * R, ry * R
        if not any(x0 - 700 < X0 < x1 + 60 and y0 - 700 < Y0 < y1 + 60 for x0, y0, x1, y1 in cajas): continue
        o = oPos + p0[r]; q = oPol + q0[r]; px = py = pa = 0
        def rq():
            nonlocal q
            v = sh = 0
            while True:
                c = b[q]; q += 1; v += (c & 127) << sh; sh += 7
                if not c & 128: return v
        for j in range(cnt[r]):
            i = i0[r] + j; px += uz(rv()); py += uz(rv()); hw = max(.5, b[oDim + 2 * i] / Q); hd = max(.5, b[oDim + 2 * i + 1] / Q); pa = (pa + b[oAng + i]) % 128
            an = (pa + .5) * math.pi / 128; ux, uy = math.cos(an), math.sin(an); kf = b[oKin + i]; x = X0 + px / Q; y = Y0 + py / Q
            if kf & 16:
                nv = rq(); qx, qy = px, py; P = []
                for _ in range(nv): qx += uz(rq()); qy += uz(rq()); P.append((X0 + qx / Q, Y0 + qy / Q))
            else: P = [(x - ux * hw + uy * hd, y - uy * hw - ux * hd), (x + ux * hw + uy * hd, y + uy * hw - ux * hd), (x + ux * hw - uy * hd, y + uy * hw + ux * hd), (x - ux * hw - uy * hd, y - uy * hw + ux * hd)]
            out.append((P, bool(kf & 128)))
    return out
def vias(path):
    s = open(path, encoding='utf8').read(); V = json.loads(re.search(r'const VIAS = (\{.*\});', s, re.S).group(1)); b = zlib.decompress(base64.b64decode(V['d']), -15); o = 0; px = py = 0; out = []
    def rv():
        nonlocal o
        v = sh = 0
        while True:
            c = b[o]; o += 1; v += (c & 127) << sh; sh += 7
            if not c & 128: return v
    DEFW = {1: 7, 2: 15, 3: 12, 4: 10, 5: 2.5, 6: 5, 7: 3}
    for _ in range(V['n']):
        k = rv(); nm = rv(); w2 = rv(); n = rv(); P = []
        for j in range(n): d = rv(); px += -(d + 1) // 2 if d % 2 else d // 2; d = rv(); py += -(d + 1) // 2 if d % 2 else d // 2; P.append((px * V['u'], py * V['u']))
        out.append((k, w2 / 2 or DEFW.get(k, 6), P))
    return out
TAM = 230; S = 2.0; cajas = []
for _, la, lo in ZONAS: cx, cy = (lo - LON0) * KXM, (LATN - la) * KYM; cajas.append((cx - TAM / 2, cy - TAM / 2, cx + TAM / 2, cy + TAM / 2))
EA, ED, VV = edificios(A_JS, cajas), edificios(D_JS, cajas), vias(V_JS)
W = int(TAM * S); lam = Image.new('RGB', (W * 2 + 30, (W + 34) * len(ZONAS) + 40), (247, 246, 242)); dl = ImageDraw.Draw(lam)
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15); F2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
except Exception: F = F2 = ImageFont.load_default()
dl.text((10, 10), 'Antes (El Metro 3.8.0)', fill=(40, 40, 40), font=F2); dl.text((W + 25, 10), 'Después (Motor del Valle 1.3, saneado)', fill=(40, 40, 40), font=F2)
cifras = []
for zi, ((nom, _, _), (x0, y0, x1, y1)) in enumerate(zip(ZONAS, cajas)):
    caja = shapely.box(x0, y0, x1, y1); corr = []
    for k, w, P in VV:
        if len(P) < 2 or not 1 <= k <= 7: continue
        L = shapely.LineString(P)
        if L.intersects(caja.buffer(15)): corr.append((L.buffer(max(1, w / 2 + (1.3 if k <= 4 else .3))), L.buffer(w / 2)))
    M = shapely.union_all([c for c, _ in corr]) if corr else shapely.Polygon()
    fila = []
    for ci, E in enumerate((EA, ED)):
        im = Image.new('RGB', (W, W), (236, 241, 230)); d = ImageDraw.Draw(im); tr = lambda pts: [((x - x0) * S, (y - y0) * S) for x, y in pts]
        for c, a in corr:
            for g in getattr(c, 'geoms', [c]): d.polygon(tr(g.exterior.coords), fill=(214, 214, 214))
        for c, a in corr:
            for g in getattr(a, 'geoms', [a]): d.polygon(tr(g.exterior.coords), fill=(160, 160, 166))
        nb = npisa = 0; area_rojo = 0.0
        for P, cut in E:
            g = shapely.Polygon(P)
            if not g.is_valid: g = g.buffer(0)
            if g.is_empty or not g.intersects(caja): continue
            nb += 1; d.polygon(tr(P), fill=(196, 120, 86) if not cut else (214, 150, 96), outline=(90, 60, 50))
            inter = g.intersection(M)
            if inter.area > .05:
                npisa += 1; area_rojo += inter.area
                for q in getattr(inter, 'geoms', [inter]):
                    if q.geom_type == 'Polygon': d.polygon(tr(q.exterior.coords), fill=(225, 30, 30))
        fila.append((nb, npisa, area_rojo)); lam.paste(im, (10 + ci * (W + 10), 40 + zi * (W + 34)))
    dl.text((10, 40 + zi * (W + 34) + W + 4), f'{nom}: {fila[0][0]} casas, {fila[0][1]} pisan la calle ({fila[0][2]:.0f} m²)', fill=(60, 60, 60), font=F)
    dl.text((W + 20, 40 + zi * (W + 34) + W + 4), f'{fila[1][0]} casas, {fila[1][1]} pisan la calle ({fila[1][2]:.0f} m²)', fill=(60, 60, 60), font=F)
    cifras.append({'zona': nom, 'antes': {'casas': fila[0][0], 'pisan': fila[0][1], 'm2': round(fila[0][2], 1)}, 'despues': {'casas': fila[1][0], 'pisan': fila[1][1], 'm2': round(fila[1][2], 1)}})
lam.save(OUT, quality=82); print(json.dumps(cifras, ensure_ascii=False))
