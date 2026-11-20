#!/usr/bin/env node
/* =====================================================================
   MOTOR CITY · REVISAR ARTE · revisa un paquete de arte (arte/<id>/) contra las reglas del documento único (§10)
     node motor.mjs revisar-arte arte/gemini        → la lista de problemas y un resumen (sale con código 1 si hay graves)
   Revisa: que cada atlas tenga imagen (.webp o .png) y manifiesto; que cada cuadro quepa en la imagen; que tenga ancla y alto en
   metros; nombres en minúsculas con guiones bajos; cuadros que se montan (o pegados sin 2 px de margen); y los nombres que
   espera cada gancho del motor (árboles, personaje, vehículos, muebles…). Lo usa Gemini (G‑H2) para revisar lo que entrega ChatGPT.
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path';
const dir = path.resolve(process.argv[2] || 'arte/gemini'), mf = path.join(dir, 'manifiesto.json');
if (!fs.existsSync(mf)) { console.error('✗ No hay ' + path.relative(process.cwd(), mf)); process.exit(1); }
const tam = f => { const b = fs.readFileSync(f); if (b.slice(0, 8).toString('hex') === '89504e470d0a1a0a') return [b.readUInt32BE(16), b.readUInt32BE(20)]; if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') { const t = b.slice(12, 16).toString(); if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)]; if (t === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; } if (t === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff]; } return null; };
const man = JSON.parse(fs.readFileSync(mf, 'utf8')), graves = [], avisos = [], todos = new Set();
for (const [aid, A] of Object.entries(man)) {
  const img = ['webp', 'png'].map(e => path.join(dir, aid + '.' + e)).find(f => fs.existsSync(f)); if (!img) { graves.push(aid + ': falta la imagen ' + aid + '.webp o .png'); continue; }
  const [W, H] = tam(img) || [0, 0]; if (!W) { graves.push(aid + ': no se pudo leer el tamaño de la imagen'); continue; }
  const C = Object.entries(A.cuadros || {}); if (!C.length) graves.push(aid + ': el manifiesto no trae cuadros');
  for (const [n, c] of C) { todos.add(n);
    if (!/^[a-z0-9_]+$/.test(n)) avisos.push(aid + '/' + n + ': el nombre debe ir en minúsculas, sin tildes y con guiones bajos');
    if (!Array.isArray(c) || c.length < 4) { graves.push(aid + '/' + n + ': el cuadro debe ser [x, y, w, h, ancla_x, ancla_y]'); continue; }
    const [x, y, w, h, ax, ay] = c; if (x < 0 || y < 0 || x + w > W || y + h > H) graves.push(aid + '/' + n + ': se sale de la imagen (' + W + '×' + H + ')');
    if (ax == null || ay == null) avisos.push(aid + '/' + n + ': sin ancla (se usará el centro de abajo)');
    if (!(A.metros && (A.metros[n] || A.metros[n.replace(/_\d+$/, '')]))) avisos.push(aid + '/' + n + ': sin alto en metros');
  }
  /* cuadros que se montan o que no dejan 2 px de margen (al escalar, un cuadro «sangra» en el vecino) */
  let pegados = 0, montados = 0; for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) { const a = C[i][1], b = C[j][1]; if (!a || !b) continue; const sx = Math.max(a[0], b[0]) - Math.min(a[0] + a[2], b[0] + b[2]), sy = Math.max(a[1], b[1]) - Math.min(a[1] + a[3], b[1] + b[3]); if (sx < 0 && sy < 0) montados++; else if (Math.max(sx, sy) < 2) pegados++; }
  if (montados) graves.push(aid + ': ' + montados + ' pares de cuadros se montan'); if (pegados) avisos.push(aid + ': ' + pegados + ' pares de cuadros sin 2 px de margen');
}
/* lo que esperan los ganchos del motor (si el paquete dice traerlo) */
const ESPERA = { arbol: ['arbol_guayacan_amarillo_lado', 'arbol_guayacan_rosado_lado', 'arbol_ceiba_lado', 'arbol_mango_lado', 'arbol_urapan_lado', 'arbol_monte_lado'], persona: ['persona_quieto_0', 'persona_camina_0', 'persona_pedalea_0', 'persona_nada_0'], vehiculo: ['bici_lado', 'moto_lado', 'carro_lado', 'buseta_lado', 'lancha_lado'] };
for (const [k, L] of Object.entries(ESPERA)) { const tiene = [...todos].some(n => n.startsWith(k)); if (!tiene) continue; const falta = L.filter(n => !todos.has(n)); if (falta.length) avisos.push('gancho ' + k + ': faltan ' + falta.join(', ')); }
console.log('Paquete ' + path.basename(dir) + ': ' + Object.keys(man).length + ' atlas · ' + todos.size + ' cuadros');
for (const g of graves) console.log('  ✗ ' + g); for (const a of avisos.slice(0, 60)) console.log('  ⚠ ' + a); if (avisos.length > 60) console.log('  … y ' + (avisos.length - 60) + ' avisos más');
console.log(graves.length ? '✗ ' + graves.length + ' problemas graves' : '✓ sin problemas graves' + (avisos.length ? ' (' + avisos.length + ' avisos)' : '')); process.exit(graves.length ? 1 : 0);
