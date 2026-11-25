"""RASANTE DE LAS VÍAS (Motor del Valle 1.3.0): la cota y la pendiente de cada vía, suaves y con una sola cota en cada cruce.
   1. muestrea el relieve cada 5 m a lo largo de cada eje (SRTM de AWS Terrain Tiles z13, ~19 m, bilineal);
   2. lo suaviza a lo largo de la vía (gaussiano, σ = 25 m);
   3. en un puente o un túnel (road_flags y level_rules de Overture, geo/niveles.py), la cota va en línea recta de estribo a
      estribo (o de boca a boca); sus extremos son rampas;
   4. pone una sola cota en cada nodo (el promedio de las vías que llegan) y vuelve a suavizar con los nodos fijos;
   5. calcula la pendiente g de cada tramo, con un tope por clase (el limitador no mueve los nodos);
   6. guarda la capa (-1, 0, 1 o 2) y las rampas.
   Entrada: salida/sanear/vias_m.bin (los ejes precisos de geo/build.py, en el orden de vias.bin), geo/cache/dem y puentes.parquet.
   Salida: salida/sanear/rasante.bin: por vía, sus nudos (x, y, z, s, capa, rampa) en metros; los exportadores los proyectan
           sobre su propia geometría (tools/vias_datos.mjs de El Metro, y --encicla aquí). También rasante.json (cifras).
   Uso: python3 motor-valle/geo/rasante.py [--encicla CARPETA_SRC_DATA | --elmetro RUTA_ELMETRO]
        --encicla escribe la cota de las vías de Juega EnCicla en vias-cota.bin (en el orden de vias.bin, sin conectar: no entra al HTML);
                  con --pegar la agrega al final de vias.bin, después de las vías (el lector de hoy no la lee), para cuando se conecte;
        --elmetro escribe salida/sanear/cota-elmetro.bin para las vías de El Metro (tools/vias_datos.mjs --cota la pega en vias.js).
"""
import json, math, os, struct, sys, time, zlib
import numpy as np
import shapely
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); MOTOR = os.path.dirname(HERE); CACHE = os.path.join(HERE, 'cache'); sys.path.insert(0, HERE)
OUT = os.environ.get('OUT') or os.path.join(MOTOR, 'salida', 'sanear')
LON0, LON1, LATN, LATS = -75.70, -75.31, 6.46, 6.015
KXM = 111320 * math.cos(math.radians((LATN + LATS) / 2)); KYM = 110574.0
PASO, SIGMA, SIGMA2, TOL = 5.0, 25.0, 10.0, .2
TOPE = {1: .35, 2: .15, 3: .10, 4: .20, 5: .20, 6: .40, 7: 1.0, 8: .60, 9: 1.0}   # pendiente máxima por clase (escalas y quebradas sin tope real)
T0 = time.time()
def log(*a): print(f'[{time.time() - T0:6.1f} s]', *a, flush=True)
def proy(xy): return np.column_stack([(xy[:, 0] - LON0) * KXM, (LATN - xy[:, 1]) * KYM])


# ---------------- relieve: mosaico de AWS Terrain Tiles (terrarium, z13), como geo/build.py ----------------
Z = 13; tiles = {}
for f in os.listdir(os.path.join(CACHE, 'dem')):
    z, x, y = map(int, f[:-4].split('_')); a = np.asarray(Image.open(os.path.join(CACHE, 'dem', f)).convert('RGB')).astype(np.float64)
    tiles[(x, y)] = a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768
xs, ys = [k[0] for k in tiles], [k[1] for k in tiles]; X0, Y0 = min(xs), min(ys)
MOS = np.zeros(((max(ys) - Y0 + 1) * 256, (max(xs) - X0 + 1) * 256))
for (x, y), a in tiles.items(): MOS[(y - Y0) * 256:(y - Y0 + 1) * 256, (x - X0) * 256:(x - X0 + 1) * 256] = a
def dem_m(x, y):
    """relieve (m) en el punto (x, y) en metros del mapa: bilineal sobre el mosaico de ~19 m"""
    lon = LON0 + np.asarray(x) / KXM; lat = LATN - np.asarray(y) / KYM; n = 2 ** Z * 256
    px = (lon + 180) / 360 * n - X0 * 256; r = np.radians(lat); py = (1 - np.log(np.tan(r) + 1 / np.cos(r)) / math.pi) / 2 * n - Y0 * 256
    i = np.clip(np.floor(px).astype(int), 0, MOS.shape[1] - 2); j = np.clip(np.floor(py).astype(int), 0, MOS.shape[0] - 2); fx = px - i; fy = py - j
    return MOS[j, i] * (1 - fx) * (1 - fy) + MOS[j, i + 1] * fx * (1 - fy) + MOS[j + 1, i] * (1 - fx) * fy + MOS[j + 1, i + 1] * fx * fy


def cargar_vias(path):
    b = zlib.decompress(open(path, 'rb').read()); mag, ver, n = struct.unpack_from('<4sII', b, 0); o = 12; L = []
    for i in range(n):
        k, nm, nom, w2, np_ = struct.unpack_from('<BHHBI', b, o); o += 10
        P = np.frombuffer(b[o:o + np_ * 8], '<f4').reshape(-1, 2).astype(np.float64); o += np_ * 8; L.append((k, nm, nom, w2, P))
    return L


def gauss(z, sigma_m, paso):
    if len(z) < 3: return z.copy()
    s = sigma_m / paso; r = int(math.ceil(3 * s)); k = np.exp(-.5 * (np.arange(-r, r + 1) / s) ** 2); k /= k.sum()
    return np.convolve(np.pad(z, r, mode='edge'), k, 'valid')


def calcular():
    from niveles import tramos_otro_nivel, intervalos
    V = cargar_vias(os.path.join(OUT, 'vias_m.bin'))
    LS = [shapely.LineString(P) if len(P) > 1 else None for (_, _, _, _, P) in V]
    IV = intervalos(LS, tramos_otro_nivel(proy))
    log('vías', len(V), '· con tramos en otro nivel', len(IV))
    # nodos: vértices que comparten dos o más vías (o una vía consigo misma), con la misma clave al centímetro
    occ = {}
    cum = []
    for j, (k, _, _, _, P) in enumerate(V):
        if len(P) < 2: cum.append(None); continue
        c = np.concatenate([[0], np.cumsum(np.hypot(*np.diff(P, axis=0).T))]); cum.append(c)
        for vi, (x, y) in enumerate(P): occ.setdefault((round(x * 20), round(y * 20)), []).append((j, c[vi]))
    nodos = {key: v for key, v in occ.items() if len(v) >= 2}
    # dos nodos seguidos a menos de 1 m sobre una misma vía son, para esa vía, el mismo punto: comparten una sola cota
    padre = {k: k for k in nodos}
    def raiz(k):
        while padre[k] != k: padre[k] = padre[padre[k]]; k = padre[k]
        return k
    porVia = {}
    for key, lst in nodos.items():
        for j, s in lst: porVia.setdefault(j, []).append((s, key))
    for j, L_ in porVia.items():
        L_.sort()
        for (s1, k1), (s2, k2) in zip(L_, L_[1:]):
            if s2 - s1 < 1.0: padre[raiz(k1)] = raiz(k2)
    grupos = {}
    for k in nodos: grupos.setdefault(raiz(k), []).extend(nodos[k])
    log('nodos', len(nodos), '· grupos de nodos (los de menos de 1 m sobre una vía se funden)', len(grupos))
    # 1-3: muestras cada 5 m (más los nodos y los extremos de puentes y túneles), relieve, suavizado y tableros rectos
    S, ZS = [None] * len(V), [None] * len(V)
    nodo_s = [[] for _ in V]
    for key, lst in nodos.items():
        for j, s in lst: nodo_s[j].append(s)
    for j, (k, _, _, _, P) in enumerate(V):
        if LS[j] is None: continue
        L = LS[j].length; s = np.linspace(0, L, max(2, int(math.ceil(L / PASO)) + 1))
        extra = list(nodo_s[j]) + [v for a, b, _ in IV.get(j, []) for v in (a, b)]
        s = np.unique(np.round(np.concatenate([s, extra]) / .05) * .05); s = s[(s >= 0) & (s <= L)]; S[j] = s
        p = shapely.get_coordinates(shapely.line_interpolate_point(LS[j], s)); z = dem_m(p[:, 0], p[:, 1])
        # suavizado en distancia (las muestras no son parejas cuando se suman nodos): se remuestrea a paso fijo y se vuelve
        sr = np.linspace(0, L, max(2, int(math.ceil(L / 1.0)) + 1)); zr = gauss(np.interp(sr, s, z), SIGMA, sr[1] - sr[0] if len(sr) > 1 else 1)
        z = np.interp(s, sr, zr)
        for a, b, _ in IV.get(j, []):
            m = (s >= a) & (s <= b); za, zb = np.interp(a, s, z), np.interp(b, s, z); z[m] = za + (zb - za) * (s[m] - a) / max(b - a, 1e-6)
        ZS[j] = z
    log('relieve muestreado y suavizado')
    # 4: una sola cota por nodo y otro suavizado con los nodos fijos (dos pasadas)
    for pasada in range(2):
        zg = {g: float(np.mean([np.interp(s, S[j], ZS[j]) for j, s in lst])) for g, lst in grupos.items()}
        corr = [[] for _ in V]
        for key, lst in nodos.items():
            zk = zg[raiz(key)]
            for j, s in lst: corr[j].append((s, zk - np.interp(s, S[j], ZS[j])))
        for j in range(len(V)):
            if S[j] is None or not corr[j]: continue
            cs = sorted(corr[j]); sx = np.array([a for a, _ in cs]); cx = np.array([b for _, b in cs])
            z = ZS[j] + np.interp(S[j], sx, cx)
            if pasada == 0:
                L = S[j][-1]; sr = np.linspace(0, L, max(2, int(math.ceil(L / 1.0)) + 1)); z = np.interp(S[j], sr, gauss(np.interp(sr, S[j], z), SIGMA2, sr[1] - sr[0] if len(sr) > 1 else 1))
                for a, b, _ in IV.get(j, []):
                    m = (S[j] >= a) & (S[j] <= b); za, zb = np.interp(a, S[j], z), np.interp(b, S[j], z); z[m] = za + (zb - za) * (S[j][m] - a) / max(b - a, 1e-6)
            ZS[j] = z
    log('cota única en los nodos')
    # 5: tope de pendiente por clase, sin mover los nodos (limitador hacia adelante y hacia atrás)
    topadas = 0
    for j, (k, _, _, _, P) in enumerate(V):
        if S[j] is None: continue
        s, z = S[j], ZS[j]; ds = np.diff(s); cap = TOPE.get(k, .35)
        if not len(ds) or np.max(np.abs(np.diff(z)) / np.maximum(ds, 1e-6)) <= cap + 1e-9: continue
        fijo = np.isin(np.round(s / .05), np.round(np.array(nodo_s[j]) / .05)) if nodo_s[j] else np.zeros(len(s), bool)
        z = z.copy(); topadas += 1
        # por tramos entre nodos fijos: el tope efectivo es el de la clase o, si los dos nodos piden más, la pendiente entre ellos
        # (así el perfil nunca salta junto a un nodo); los extremos de la vía sin nodo quedan libres
        fx = np.flatnonzero(fijo); cortes = [0] + [int(i) for i in fx] + [len(z) - 1]
        for a, b in zip(cortes[:-1], cortes[1:]):
            if b <= a: continue
            capi = cap
            if fijo[a] and fijo[b]: capi = max(cap, abs(z[b] - z[a]) / max(s[b] - s[a], 1e-6) + 1e-9)
            for _ in range(4):
                for i in range(a + 1, b + 1):
                    if not fijo[i]: z[i] = min(max(z[i], z[i - 1] - capi * ds[i - 1]), z[i - 1] + capi * ds[i - 1])
                for i in range(b - 1, a - 1, -1):
                    if not fijo[i]: z[i] = min(max(z[i], z[i + 1] - capi * ds[i]), z[i + 1] + capi * ds[i])
        ZS[j] = z
    log('vías con algún tramo por encima del tope de su clase (se limitaron):', topadas)
    # 6: nudos (Douglas-Peucker vertical a 0,2 m), con los nodos, los extremos y las rampas
    def rdp(s, z, tol):
        keep = np.zeros(len(s), bool); keep[0] = keep[-1] = True; st = [(0, len(s) - 1)]
        while st:
            a, b = st.pop()
            if b <= a + 1: continue
            t = (s[a + 1:b] - s[a]) / max(s[b] - s[a], 1e-9); d = np.abs(z[a + 1:b] - (z[a] + (z[b] - z[a]) * t)); i = int(np.argmax(d))
            if d[i] > tol: keep[a + 1 + i] = True; st += [(a, a + 1 + i), (a + 1 + i, b)]
        return keep
    salida = bytearray(struct.pack('<4sII', b'RAS1', 1, len(V))); nk = 0; dif80 = []; gtot = []
    for j, (k, _, _, _, P) in enumerate(V):
        if S[j] is None: salida += struct.pack('<I', 0); continue
        s, z = S[j], ZS[j]; keep = rdp(s, z, TOL)
        if nodo_s[j]: keep |= np.isin(np.round(s / .05), np.round(np.array(nodo_s[j]) / .05))
        ramp = np.zeros(len(s), bool); capa = np.zeros(len(s), np.int8)
        for a, b, nv in IV.get(j, []):
            keep |= np.isclose(s, a) | np.isclose(s, b); ramp |= np.isclose(s, a) | np.isclose(s, b)
            capa[(s >= a - 1e-6) & (s < b - 1e-6)] = max(-1, min(2, nv))
        idx = np.flatnonzero(keep); p = shapely.get_coordinates(shapely.line_interpolate_point(LS[j], s[idx]))
        salida += struct.pack('<I', len(idx)); nk += len(idx)
        for q, i in enumerate(idx): salida += struct.pack('<ffffbB', p[q, 0], p[q, 1], z[i], s[i], capa[i], int(ramp[i]))
        if k <= 7: gtot.append(np.abs(np.diff(z)) / np.maximum(np.diff(s), 1e-6))
        if k <= 7 and j % 7 == 0: dif80.append(z[::10])
    open(os.path.join(OUT, 'rasante.bin'), 'wb').write(zlib.compress(bytes(salida), 6))
    g = np.concatenate(gtot) if gtot else np.zeros(1)
    info = {'vias': len(V), 'nodos': len(nodos), 'nudos': nk, 'vias_topadas': topadas, 'paso_m': PASO, 'sigma_m': SIGMA, 'tolerancia_nudos_m': TOL, 'tope_por_clase': TOPE,
            'pendiente_vias_1a7': {'p50': round(float(np.median(g)), 4), 'p90': round(float(np.percentile(g, 90)), 4), 'p99': round(float(np.percentile(g, 99)), 4), 'max': round(float(g.max()), 3)},
            'vias_con_otro_nivel': len(IV), 'segundos': round(time.time() - T0, 1)}
    json.dump(info, open(os.path.join(OUT, 'rasante.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    log('rasante.bin:', nk, 'nudos ·', info['pendiente_vias_1a7'])


def leer_rasante(path):
    b = zlib.decompress(open(path, 'rb').read()); mag, ver, n = struct.unpack_from('<4sII', b, 0); o = 12; R = []
    for j in range(n):
        m, = struct.unpack_from('<I', b, o); o += 4
        a = np.frombuffer(b[o:o + m * 18], dtype=np.dtype([('x', '<f4'), ('y', '<f4'), ('z', '<f4'), ('s', '<f4'), ('capa', 'i1'), ('rampa', 'u1')])); o += m * 18; R.append(a)
    return R


TOLV = float(os.environ.get('TOLV', .75))   # tolerancia vertical de los nudos que van al juego (m)
SIN_COTA = {9}   # las quebradas no son vías: van sin cota


def nudos_sobre(P, cand, tol=3.5):
    """los nudos de la rasante (de las vías del mismo tipo) que caen a menos de tol de la cadena P, proyectados sobre ella:
       (s, z, capa, rampa) ordenados por s, simplificados en vertical a TOLV (sin quitar cambios de capa ni rampas)"""
    L = shapely.LineString(P); xy = np.column_stack([cand['x'], cand['y']]); pt = shapely.points(xy)
    d = shapely.distance(L, pt); m = d <= tol
    if not m.any(): return None
    c = cand[m]; s = shapely.line_locate_point(L, pt[m]); o = np.argsort(s, kind='stable'); s, c = s[o], c[o]
    keep = np.ones(len(s), bool); keep[1:] = np.diff(s) > .5; s, c = s[keep], c[keep]
    if not len(s): return None
    z = c['z'].astype(float); capa = c['capa']; ramp = c['rampa']
    if s[0] > .5: s, z, capa, ramp = np.r_[0, s], np.r_[z[0], z], np.r_[capa[0], capa], np.r_[0, ramp]
    if s[-1] < L.length - .5: s, z, capa, ramp = np.r_[s, L.length], np.r_[z, z[-1]], np.r_[capa, capa[-1]], np.r_[ramp, 0]
    fijo = (ramp > 0) | np.r_[True, capa[1:] != capa[:-1]]
    kk = fijo.copy(); kk[0] = kk[-1] = True; st = [(0, len(s) - 1)]
    while st:
        a, b = st.pop()
        if b <= a + 1: continue
        t = (s[a + 1:b] - s[a]) / max(s[b] - s[a], 1e-9); dd = np.abs(z[a + 1:b] - (z[a] + (z[b] - z[a]) * t)); i = int(np.argmax(dd))
        if dd[i] > TOLV: kk[a + 1 + i] = True; st += [(a, a + 1 + i), (a + 1 + i, b)]
    return s[kk], z[kk], capa[kk], ramp[kk]


def flujo_cota(cadenas, tipos, R, VK):
    """el flujo «COTA» (v1) para las cadenas de un juego (puntos en metros) y su tipo:
       'COTA' · u8 versión · uvarint n · por cadena: uvarint nudos · por nudo: uvarint ds (m) y zigzag dz (cuartos de metro; el primero absoluto) ·
       uvarint eventos · por evento: uvarint nudo y u8 (capa + 1) | rampa << 2 (solo donde la capa cambia o hay rampa).
       La pendiente de cada tramo entre nudos es g = Δz / Δs (con el tope por clase ya aplicado en la rasante)."""
    out = bytearray(b'COTA') + bytes([1]); nz = 0; sin = 0
    def uv(v):
        while v > 127: out.append((v & 127) | 128); v >>= 7
        out.append(v)
    def zz(v): uv((v << 1) if v >= 0 else (-v << 1) - 1)
    # nudos de todas las vías, por tipo, en una rejilla de 200 m
    porK = {}
    for j, r in enumerate(R):
        if len(r): porK.setdefault(VK[j], []).append(r)
    porK = {k: np.concatenate(v) for k, v in porK.items()}
    rej = {k: {} for k in porK}
    for k, a in porK.items():
        gx = (a['x'] // 200).astype(int); gy = (a['y'] // 200).astype(int)
        o = np.lexsort((gx, gy)); a2 = a[o]; kx = gx[o] * 100000 + gy[o]; u, ini, cnt = np.unique(kx, return_index=True, return_counts=True)
        rej[k] = {int(q): a2[i:i + c] for q, i, c in zip(u, ini, cnt)}
    uv(len(cadenas))
    for P, k in zip(cadenas, tipos):
        if len(P) < 2 or k not in rej or k in SIN_COTA: uv(0); uv(0); sin += 1; continue
        x0, y0 = P.min(0) - 4; x1, y1 = P.max(0) + 4; cs = [rej[k][gx * 100000 + gy] for gx in range(int(x0 // 200), int(x1 // 200) + 1) for gy in range(int(y0 // 200), int(y1 // 200) + 1) if gx * 100000 + gy in rej[k]]
        res = nudos_sobre(P, np.concatenate(cs)) if cs else None
        if res is None: uv(0); uv(0); sin += 1; continue
        s, z, capa, ramp = res; uv(len(s)); ps = 0; pz = 0
        for i in range(len(s)):
            q = int(round(s[i])); uv(max(0, q - ps)); ps = max(ps, q); zd = int(round(z[i] * 4)); zz(zd - pz); pz = zd
        ev = [i for i in range(len(s)) if ramp[i] or capa[i] != 0 and (i == 0 or capa[i] != capa[i - 1]) or (i > 0 and capa[i] == 0 and capa[i - 1] != 0)]
        uv(len(ev))
        for i in ev: uv(i); out.append(((int(capa[i]) + 1) & 3) | (4 if ramp[i] else 0))
        nz += len(s)
    return bytes(out), nz, sin


def encicla(dst):
    """agrega el flujo de cota al final de vias.bin de EnCicla (las vías no cambian; viasB de valle.json tampoco)"""
    M = json.load(open(os.path.join(dst, 'valle.json'), encoding='utf-8')); raw = zlib.decompress(open(os.path.join(dst, 'vias.bin'), 'rb').read(), -15)
    n = struct.unpack_from('<I', raw, 0)[0]; o = 4; U = M['tile'] / M['vq']; cad = []; claves = []
    for i in range(n):
        k, nm, nom, w2, np_ = struct.unpack_from('<BHHBH', raw, o); o += 8; q = np.frombuffer(raw[o:o + np_ * 4], '<i2').reshape(-1, 2).astype(np.int64).cumsum(0); o += np_ * 4
        cad.append(q * U); claves.append((k, M['calles'][nm - 1] if nm else '', M['calles'][nom - 1] if nom else '', w2, tuple(q[0]), tuple(q[-1]), np_))
    if o != M['viasB']: raise SystemExit(f'vias.bin no cuadra con valle.json (viasB {M["viasB"]}, leído {o})')
    base = raw[:o]   # si ya tenía cota, se reemplaza
    R = leer_rasante(os.path.join(OUT, 'rasante.bin')); VK = [k for (k, _, _, _, _) in cargar_vias(os.path.join(OUT, 'vias_m.bin'))]
    fl, nz, sin = flujo_cota(cad, [c[0] for c in claves], R, VK)
    if '--pegar' in sys.argv:   # (Fase 3, al conectarla) al final de vias.bin, después de las vías: el lector de hoy no la lee
        comp = zlib.compressobj(9, zlib.DEFLATED, -15); data = comp.compress(base + fl) + comp.flush()
        open(os.path.join(dst, 'vias.bin'), 'wb').write(data)
        log('EnCicla: vias.bin', len(base), '+', len(fl), 'bytes de cota (', nz, 'nudos; cadenas sin rasante:', sin, ') →', len(data) // 1024, 'KB comprimido')
    else:   # (Fase 1) aparte, sin conectar: vias-cota.bin, en el mismo orden de vias.bin; tools/build.js no lo mete al HTML
        comp = zlib.compressobj(9, zlib.DEFLATED, -15); data = comp.compress(fl) + comp.flush()
        open(os.path.join(dst, 'vias-cota.bin'), 'wb').write(data)
        log('EnCicla: vias-cota.bin', len(fl), 'bytes de cota para las', n, 'vías de vias.bin (', nz, 'nudos; sin rasante:', sin, ') →', len(data) // 1024, 'KB comprimido · sin conectar')


def elmetro(ruta):
    """el flujo COTA para las vías de El Metro (RUTA/src/data/vias.js, tal como las lee el juego) → salida/sanear/cota-elmetro.bin;
       tools/vias_datos.mjs --cota lo pega al final de vias.js, después de las vías, sin cambiarlas"""
    import re, base64
    s = open(os.path.join(ruta, 'src', 'data', 'vias.js'), encoding='utf-8').read(); V = json.loads(re.search(r'const VIAS = (\{.*\});', s, re.S).group(1))
    b = zlib.decompress(base64.b64decode(V['d']), -15); o = 0; px = py = 0; U = V['u']; cad, tipos = [], []
    def rv():
        nonlocal o
        v = sh = 0
        while True:
            c = b[o]; o += 1; v += (c & 127) << sh; sh += 7
            if not c & 128: return v
    for _ in range(V['n']):
        k = rv(); nm = rv(); w2 = rv(); n = rv(); P = np.zeros((n, 2))
        for j in range(n):
            d = rv(); px += -(d + 1) // 2 if d % 2 else d // 2; d = rv(); py += -(d + 1) // 2 if d % 2 else d // 2; P[j] = (px * U, py * U)
        cad.append(P); tipos.append(k)
    if o != V['bytes']: raise SystemExit(f'vias.js no cuadra (bytes {V["bytes"]}, leído {o})')
    R = leer_rasante(os.path.join(OUT, 'rasante.bin')); VK = [k for (k, _, _, _, _) in cargar_vias(os.path.join(OUT, 'vias_m.bin'))]
    fl, nz, sin = flujo_cota(cad, tipos, R, VK)
    open(os.path.join(OUT, 'cota-elmetro.bin'), 'wb').write(fl)
    log('El Metro: cota de', len(cad), 'vías ·', nz, 'nudos ·', len(fl), 'bytes (sin rasante:', sin, ') →', os.path.join(OUT, 'cota-elmetro.bin'))


if __name__ == '__main__':
    if '--encicla' in sys.argv: encicla(sys.argv[sys.argv.index('--encicla') + 1])
    elif '--elmetro' in sys.argv: elmetro(sys.argv[sys.argv.index('--elmetro') + 1])
    else: calcular()
