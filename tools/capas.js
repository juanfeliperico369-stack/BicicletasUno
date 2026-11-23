#!/usr/bin/env node
/* K-2 · OpenAI GPT-6/Codex. Empaquetador de fondos de 4 capas.
 * Dependencias: Node builtin; si está cwebp, WebP sin pérdidas; PNG como respaldo.
 * Modo CLI: node tools/capas.js
 * La compilación no depende de estas imágenes: faltantes -> dibujo por código.
 */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'arte', 'entregas');
const LIMITE = 1500000; /* crecimiento máximo por material artístico */
const ESCENAS = {
  comuna13: ['c130_comuna13_capa1.png', 'c130_comuna13_capa2.png', 'c130_comuna13_capa3.png', 'c130_comuna13_capa4.png'],
  lineaA: ['c131_lineaA_capa1.png', 'c131_lineaA_capa2.png', 'c131_lineaA_capa3.png', 'c131_lineaA_capa4.png'],
  palmas: ['c132_palmas_capa1.png', 'c132_palmas_capa2.png', 'c132_palmas_capa3.png', 'c132_palmas_capa4.png']
};
const EXTRA = ['c131_tren_perfil.png', 'c133_corredor_lado.png'];
const PALETA = '#0e2d55 #0a2342 #143a6b #9bd341 #c4ec7c #5e9a1e #4a9a2c #ffffff #f4efd8 #ffc93c #ff6b5a #56c7ff #c0623b #9aa7b8 #d6dde6';
function localizar(n, dirs) {
  for (const dir of dirs) {
    const p = path.join(dir, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
}
function entradas() {
  if (!fs.existsSync(DIR)) return [];
  /* Las entregas recientes tienen prioridad; no se recorre ningún repositorio ajeno. */
  const d = fs.readdirSync(DIR).filter(n => fs.statSync(path.join(DIR, n)).isDirectory()).sort().reverse();
  return d.map(n => path.join(DIR, n)).concat([DIR]);
}
function dimensiones(buf) {
  if (buf.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))
    return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  return null;
}
function convertirWebp(ruta) {
  const tmp = path.join(os.tmpdir(), 'encicla-' + process.pid + '-' + path.basename(ruta) + '.webp');
  try {
    const r = cp.spawnSync('cwebp', ['-lossless', '-exact', '-quiet', ruta, '-o', tmp], { stdio: 'ignore', timeout: 10000 });
    if (r.status === 0 && fs.existsSync(tmp)) {
      const b = fs.readFileSync(tmp);
      if (b.length < fs.statSync(ruta).size) return { data: b, mime: 'image/webp' };
    }
  } catch (e) { /* cwebp es opcional en máquinas sin acceso a herramientas */ }
  finally { try { fs.rmSync(tmp, { force: true }); } catch (e) { /* no queda temporal */ } }
  return { data: fs.readFileSync(ruta), mime: 'image/png' };
}
function obtener() {
  const dirs = entradas(), data = {}, omitidos = [], incluidos = []; let bytes = 0;
  const pack = (n, requerido = true) => {
    const f = localizar(n, dirs);
    if (!f) { if (requerido) omitidos.push(n + ': falta'); return null; }
    const png = fs.readFileSync(f), size = dimensiones(png);
    if (!size) { omitidos.push(n + ': PNG inválido'); return null; }
    const [w, h] = size, esHoja = n.includes('corredor');
    if (w < 256 || h < 100 || (esHoja && w !== h) ||
        (!esHoja && !n.includes('tren') && Math.abs(w / h - 21 / 9) > .07)) {
      omitidos.push(n + ': dimensión incorrecta ' + w + 'x' + h);
      return null;
    }
    const o = convertirWebp(f), b64 = o.data.toString('base64'), aumento = b64.length + 64;
    if (bytes + aumento > LIMITE) { omitidos.push(n + ': supera techo de 1,5 MB'); return null; }
    bytes += aumento; incluidos.push({ nombre: n, bytes: o.data.length, formato: o.mime, w, h });
    return 'data:' + o.mime + ';base64,' + b64;
  };
  for (const [id, nombres] of Object.entries(ESCENAS)) {
    /* Atomicidad: las cuatro capas deben existir antes de dibujar una nueva escena. */
    const faltan = nombres.filter(n => !localizar(n, dirs));
    if (faltan.length) { omitidos.push(...faltan.map(n => n + ': falta')); continue; }
    const tmp = nombres.map(n => pack(n));
    if (tmp.every(Boolean)) data[id] = tmp;
  }
  const tren = pack(EXTRA[0], false), corredor = pack(EXTRA[1], false);
  if (tren) data.tren = tren;
  if (corredor) data.corredor = corredor;
  return { data, bytes, incluidos, omitidos, presupuesto: LIMITE, paleta: PALETA };
}
if (require.main === module) {
  const o = obtener();
  console.log(JSON.stringify({ incluidos: o.incluidos, omitidos: o.omitidos, bytes: o.bytes, maxBytes: LIMITE }, null, 2));
}
module.exports = { obtener, ESCENAS, LIMITE };
