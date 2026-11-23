#!/usr/bin/env python3
"""Arte lateral original C-130..C-133 · prototipo 16-bit · OpenAI GPT-6, 23-11-2026.
Sin logos, texto ni personas reales. Genera 14 PNG y manifiesto reproducibles.
Requiere Pillow (solo herramienta de autoría, nunca en el juego).
"""
from pathlib import Path
from PIL import Image, ImageDraw
import random, math, json, hashlib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'arte' / 'entregas' / '2026-11-23-gpt6-c130-c133'
OUT.mkdir(parents=True, exist_ok=True)
W, H, ESC = 504, 216, 2
M = '#ff00ff'
INK = '#0a1424'
NAVY = '#0e2d55'
NIGHT = '#0a2342'
BLUE = '#143a6b'
SKY = '#56c7ff'
GREEN = '#9bd341'
GREEN2 = '#c4ec7c'
LEAF = '#5e9a1e'
ROAD = '#4a9a2c'
CREAM = '#f4efd8'
WHITE = '#ffffff'
GOLD = '#ffc93c'
CORAL = '#ff6b5a'
BRICK = '#c0623b'
SILVER = '#d6dde6'
GRAY = '#9aa7b8'
COLS = [BRICK, CORAL, GOLD, NAVY, BLUE, CREAM, GRAY, WHITE, GREEN]
lista = []

def guardar(nombre, im, tile=False):
    if tile:
        # El primer y último píxel de cada fila casan exactamente.
        for y in range(im.height):
            im.putpixel((im.width - 1, y), im.getpixel((0, y)))
    factor = 4 if nombre == 'c133_corredor_lado.png' else ESC
    im = im.resize((im.width * factor, im.height * factor), Image.Resampling.NEAREST)
    ruta = OUT / nombre
    im.save(ruta, optimize=True)
    sha = hashlib.sha256(ruta.read_bytes()).hexdigest()
    lista.append({'archivo': nombre, 'anchura': im.width, 'altura': im.height,
                  'sha256': sha, 'seam': bool(tile), 'fondo': M if 'capa1' not in nombre else 'escena'})
    return ruta

def lienzo(color=M):
    im = Image.new('RGB', (W, H), color)
    return im, ImageDraw.Draw(im)

def colina(d, base, amp, color, phase=0, period=2):
    pts = [(0, H), (0, base)]
    for x in range(W + 1):
        y = int(base + amp * math.sin(x * 2 * math.pi * period / W + phase) +
                amp * .33 * math.sin(x * 2 * math.pi * 3 / W))
        pts.append((x, y))
    pts.append((W, H))
    d.polygon(pts, fill=color)

def nube(d, x, y, col=WHITE):
    for dx, dy, r in [(-9, 0, 8), (0, -4, 10), (12, 0, 8)]:
        d.ellipse((x + dx - r, y + dy - r, x + dx + r, y + dy + r), fill=col)

def casa(d, x, y, w, alto, col, techo=GRAY, ventanas=True):
    d.rectangle((x, y - alto, x + w, y), fill=col, outline=INK, width=1)
    d.polygon([(x - 1, y - alto), (x + w // 2, y - alto - 6),
               (x + w + 1, y - alto)], fill=techo, outline=INK)
    if ventanas:
        for xx in range(x + 5, x + w - 5, 10):
            for yy in range(y - alto + 7, y - 5, 12):
                d.rectangle((xx, yy, xx + 4, yy + 5), fill=CREAM, outline=INK)

def arbol(d, x, y, alto=38, col=LEAF):
    d.rectangle((x - 2, y - alto // 2, x + 2, y), fill=BRICK, outline=INK)
    for dx, dy, rad in [(0, -alto + 12, 15), (-8, -alto + 20, 10), (9, -alto + 19, 11)]:
        d.ellipse((x + dx - rad, y + dy - rad, x + dx + rad, y + dy + rad),
                  fill=col, outline=INK)
    for dx, dy in [(-6, -alto + 13), (7, -alto + 19)]:
        d.rectangle((x + dx, y + dy, x + dx + 2, y + dy + 2), fill=GREEN2)

def mural(d, x, y, tipo):
    d.rectangle((x, y, x + 48, y + 50), fill=BRICK, outline=INK, width=2)
    if tipo % 3 == 0:
        d.ellipse((x + 15, y + 10, x + 35, y + 30), fill=SKY, outline=INK)
        d.polygon([(x + 14, y + 21), (x + 6, y + 15), (x + 12, y + 30),
                   (x + 34, y + 23)], fill=GREEN, outline=INK)
    elif tipo % 3 == 1:
        d.ellipse((x + 16, y + 10, x + 32, y + 27), fill=GOLD, outline=INK)
        for k in range(7):
            a = 2 * math.pi * k / 7
            xx = x + 24 + int(15 * math.cos(a))
            yy = y + 19 + int(15 * math.sin(a))
            d.ellipse((xx - 4, yy - 4, xx + 4, yy + 4), fill=CORAL, outline=INK)
    else:
        d.polygon([(x + 8, y + 32), (x + 21, y + 15), (x + 35, y + 32)],
                  fill=SKY, outline=INK)
        d.polygon([(x + 17, y + 30), (x + 34, y + 8), (x + 44, y + 29)],
                  fill=GREEN, outline=INK)
    d.rectangle((x + 4, y + 41, x + 44, y + 44), fill=GREEN2)

def escena(tema):
    # Capa 1: cielo, luz y valle lejano (sin chroma).
    cielo = SKY if tema == 'lineaA' else '#f4b86b' if tema == 'palmas' else CREAM
    im, d = lienzo(cielo)
    d.rectangle((0, 0, W, 70), fill='#f4efd8' if tema != 'palmas' else '#ff6b5a')
    d.ellipse((355, 19, 397, 61), fill=GOLD)
    if tema != 'palmas':
        for x, y in [(35, 31), (126, 22), (260, 40), (460, 29)]: nube(d, x, y)
    colina(d, 140, 20, BLUE, period=2)
    colina(d, 165, 13, NAVY, phase=.3, period=3)
    if tema == 'palmas':
        for x in range(8, W, 25):
            d.rectangle((x, 181 - x % 15, x + 7, 196), fill=INK)
            d.rectangle((x + 1, 182 - x % 15, x + 6, 183 - x % 15), fill=GOLD)
    guardar('c' + ('130_comuna13' if tema == 'comuna13' else '131_lineaA' if tema == 'lineaA' else '132_palmas') + '_capa1.png', im, tile=True)

    # Capa 2: silueta modular de ciudad / ladera.
    im, d = lienzo()
    if tema == 'palmas':
        colina(d, 145, 22, BLUE, period=2)
        for i, x in enumerate(range(0, W, 13)):
            d.rectangle((x, 150 - i % 4 * 8, x + 8, 183), fill=CREAM if i % 3 else GOLD)
    else:
        for i, x in enumerate(range(0, W, 29)):
            y = 175 + (i % 4) * 5
            casa(d, x, y, 28, 37 + (i * 11 % 55), COLS[i % len(COLS)])
    guardar('c' + ('130_comuna13' if tema == 'comuna13' else '131_lineaA' if tema == 'lineaA' else '132_palmas') + '_capa2.png', im, tile=True)

    # Capa 3: vegetación y cultura local, con árboles, murales y río.
    im, d = lienzo()
    if tema == 'comuna13':
        for i in range(11): mural(d, i * 48, 122 + i % 2 * 3, i)
        for x in [35, 245, 470]: arbol(d, x, 151, 33)
    elif tema == 'lineaA':
        d.polygon([(0, 185), (W, 185), (W, 216), (0, 216)], fill=ROAD, outline=INK)
        d.polygon([(0, 204), (W, 204), (W, 216), (0, 216)], fill=SKY)
        for x in range(0, W, 80): arbol(d, x + 25, 184, 48)
        d.line([(0, 195), (W, 195)], fill=GREEN2, width=2)
    else:
        colina(d, 178, 16, LEAF, period=2)
        for x in range(15, W, 35): arbol(d, x, 181, 55, col=LEAF if x % 2 else ROAD)
        for x in [80, 330]:
            d.line([(x - 18, 159), (x + 30, 159)], fill=BRICK, width=3)
            for xx in range(x - 18, x + 30, 12): d.line([(xx, 159), (xx, 175)], fill=INK, width=2)
    guardar('c' + ('130_comuna13' if tema == 'comuna13' else '131_lineaA' if tema == 'lineaA' else '132_palmas') + '_capa3.png', im, tile=True)

    # Capa 4: elementos de primer plano, repetibles a lo largo de la pantalla.
    im, d = lienzo()
    if tema == 'comuna13':
        for x in range(0, W, 210):
            d.polygon([(x, 175), (x + 170, 110), (x + 170, 132), (x, 200)],
                      fill=GRAY, outline=INK)
            for k in range(14):
                xx = x + 12 * k
                yy = int(174 - 65 * k / 14)
                d.line([(xx, yy), (xx + 11, yy - 4)], fill=SILVER, width=3)
            d.polygon([(x - 4, 161), (x + 162, 93), (x + 176, 93),
                       (x + 13, 169)], fill=BRICK, outline=INK)
            for xx in range(x + 12, x + 174, 32):
                d.line([(xx, 107), (xx, 194)], fill=INK, width=2)
    elif tema == 'lineaA':
        for x in range(0, W + 100, 70):
            d.rectangle((x + 25, 158, x + 39, 216), fill=GRAY, outline=INK)
            d.rectangle((x + 21, 151, x + 43, 166), fill=SILVER, outline=INK)
        d.rectangle((0, 138, W, 156), fill=GRAY, outline=INK)
        d.rectangle((0, 141, W, 145), fill=SILVER)
        for x in range(0, W, 12): d.line([(x, 137), (x + 6, 137)], fill=INK, width=1)
        d.polygon([(205, 130), (222, 107), (312, 107), (330, 130)],
                  fill=WHITE, outline=INK)
        d.rectangle((205, 128, 330, 140), fill=BLUE, outline=INK)
    else:
        d.rectangle((0, 175, W, 216), fill=GRAY, outline=INK)
        d.line([(0, 190), (W, 190)], fill=GOLD, width=3)
        for x in range(0, W, 30):
            d.rectangle((x, 147, x + 3, 190), fill=GRAY, outline=INK)
            d.line([(x, 150), (x + 29, 150)], fill=SILVER, width=3)
            d.ellipse((x + 12, 160, x + 17, 173), fill=LEAF)
    guardar('c' + ('130_comuna13' if tema == 'comuna13' else '131_lineaA' if tema == 'lineaA' else '132_palmas') + '_capa4.png', im, tile=True)

for t in ['comuna13', 'lineaA', 'palmas']: escena(t)

# Tren de tres coches, vista lateral, proporción 16:9.
im = Image.new('RGB', (448, 252), M); d = ImageDraw.Draw(im)
for k in range(3):
    x = 24 + k * 132
    d.rounded_rectangle((x, 105, x + 130, 175), radius=7, fill=WHITE, outline=INK, width=3)
    d.rectangle((x + 2, 151, x + 129, 162), fill='#1c5c9c')
    for j in range(5): d.rectangle((x + 13 + j * 21, 115, x + 29 + j * 21, 140), fill=NAVY, outline=INK)
    for wx in [x + 20, x + 108]: d.ellipse((wx - 6, 168, wx + 7, 181), fill=INK)
guardar('c131_tren_perfil.png', im)

# Corredor lateral: 16 poses distintas, fondo exacto magenta, cuadrícula exacta.
im = Image.new('RGB', (256, 256), M); d = ImageDraw.Draw(im)
def corredor(cx, cy, pose, frame):
    # Celdas 64x64: cabeza, gorra, torso y extremidades sin sombra.
    x = cx * 64 + 32; y = cy * 64 + 52
    salto = pose == 1
    y -= (10 if salto else 0)
    d.ellipse((x - 6, y - 40, x + 6, y - 28), fill=CREAM, outline=INK)
    d.polygon([(x - 8, y - 40), (x + 7, y - 40), (x + 9, y - 36), (x - 9, y - 36)], fill=WHITE, outline=INK)
    d.rectangle((x - 6, y - 28, x + 6, y - 13), fill=GREEN, outline=INK)
    if pose == 2:  # deslizar o tropezar
        d.line([(x - 6, y - 14), (x + 14, y - 16)], fill=NAVY, width=5)
        d.line([(x + 10, y - 16), (x + 19, y - 9)], fill=WHITE, width=4)
        d.line([(x - 4, y - 12), (x - 18, y - 5)], fill=WHITE, width=4)
    else:
        d.line([(x - 5, y - 14), (x - 9 - frame * 2, y - 3)], fill=NAVY, width=5)
        d.line([(x + 5, y - 14), (x + 7 + frame * 2, y - 2)], fill=NAVY, width=5)
        d.line([(x - 9 - frame * 2, y - 2), (x - 14 - frame * 2, y - 2)], fill=WHITE, width=4)
        d.line([(x + 7 + frame * 2, y - 1), (x + 13 + frame * 2, y - 1)], fill=WHITE, width=4)
    d.line([(x - 5, y - 26), (x - 10 - frame, y - 19)], fill=CREAM, width=4)
    d.line([(x + 5, y - 26), (x + 14 + frame, y - 20)], fill=CREAM, width=4)
for row in range(4):
    for frame in range(4): corredor(frame, row, row, frame)
guardar('c133_corredor_lado.png', im)

(OUT / 'manifiesto.json').write_text(json.dumps({
    'autor': 'OpenAI GPT-6 (ChatGPT) · arte procedimental original de prueba',
    'fecha': '2026-11-23', 'ronda': 'C-130-C-133',
    'estado': 'prototipo original con vista lateral; sujeto a aprobación artística',
    'estilo': '16 bits pixel art; sin palabras ni logos',
    'imagenes': lista, 'advertencia': 'El arte se incrusta opcionalmente; siempre queda respaldo por código.'
}, ensure_ascii=False, indent=2), encoding='utf8')
print(f'OK: {len(lista)} PNG y manifiesto en {OUT}')
