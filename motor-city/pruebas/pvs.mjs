#!/usr/bin/env node
/* Prueba del PVS horneado (C‑M37): cámaras al azar que NO son los ojos del horneado (otra posición, otra altura,
   el triple de rayos y paso más fino) y se mira si algo que esa cámara ve quedó por fuera del conjunto.
   «Fuga» = una celda vista que el PVS habría recortado. Se mide también cuánto se ve de ella (columnas vistas):
   una celda que asoma por una sola columna lejana casi no se nota; una fuga grande sí sería un error.
   Uso: node pruebas/pvs.mjs [nueva_york|medellin|guatape] [muestras] */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console, require: createRequire(import.meta.url), process, Buffer, TextDecoder, TextEncoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8'), ctx); const MC = ctx.MC;
const ids = process.argv[2] && !/^\d/.test(process.argv[2]) ? [process.argv[2]] : ['guatape', 'nueva_york'], N = Number(process.argv.find(a => /^\d+$/.test(a)) || 40);
let fallo = false;
for (const id of ids) {
  const fp = path.join(RAIZ, 'datos', id, 'pvs.bin'); if (!fs.existsSync(fp)) { console.log('· sin PVS para ' + id + ' (node herramientas/pvs.mjs ' + id + ')'); continue; }
  const pv = MC.PVS.leer(new Uint8Array(fs.readFileSync(fp))), M = await MC.Mundo.cargar(new Uint8Array(fs.readFileSync(path.join(RAIZ, 'datos', id, 'mundo.mc4'))));
  const P = pv.P, rnd = MC.mulberry32(7), alcance = pv.meta.alcance;
  /* campo de alturas local, a 2 m (el horneado usa 4 o 6 m): suelo + los edificios, solo alrededor de la cámara */
  const c = 2, A = Math.ceil(alcance / c) * 2 + 2, Hl = new Float32Array(A * A); let ox = 0, oy = 0;
  const local = (x, y) => { ox = x - A * c / 2; oy = y - A * c / 2;
    for (let j = 0; j < A; j++) for (let i = 0; i < A; i++) Hl[j * A + i] = M.cota(ox + (i + .5) * c, oy + (j + .5) * c);
    for (const e of M.edificiosEn(ox, oy, ox + A * c, oy + A * c)) { const Q = MC.Mundo.esquinas(e), z = M.cota(e.x, e.y) + e.h; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let v = 0; v < Q.length; v += 2) { x0 = Math.min(x0, Q[v]); x1 = Math.max(x1, Q[v]); y0 = Math.min(y0, Q[v + 1]); y1 = Math.max(y1, Q[v + 1]); }
      for (let j = Math.max(0, Math.floor((y0 - oy) / c)); j <= Math.min(A - 1, Math.floor((y1 - oy) / c)); j++) for (let i = Math.max(0, Math.floor((x0 - ox) / c)); i <= Math.min(A - 1, Math.floor((x1 - ox) / c)); i++) if (MC.dentroPol(Q, ox + (i + .5) * c, oy + (j + .5) * c) && z > Hl[j * A + i]) Hl[j * A + i] = z; } };
  const alto = (x, y) => { const i = Math.floor((x - ox) / c), j = Math.floor((y - oy) / c); return i < 0 || j < 0 || i >= A || j >= A ? -1e9 : Hl[j * A + i]; };
  let vistas = 0, fugas = 0, fugasGrandes = 0, columnas = 0, colFuga = 0, recortadas = 0, ventana = 0, hechas = 0, intentos = 0;
  while (hechas < N && intentos < N * 40) {
    intentos++; const cx = Math.floor(rnd() * pv.nx), cy = Math.floor(rnd() * pv.ny), x = (cx + rnd()) * P, y = (cy + rnd()) * P;
    if (!M.dentro(x, y) || M.edificioEn(x, y, 0) || M.suelo(x, y) === MC.TT.WATER) continue;
    const V = pv.desde(x, y); if (V.celdas.every(([a, b]) => { const o = (b * pv.nx + a) * pv.porCelda; return a < 0 || b < 0 || a >= pv.nx || b >= pv.ny || pv.bits.subarray(o, o + pv.porCelda).every(v => v === 255); })) continue;
    hechas++; local(x, y); const ez = M.cota(x, y) + 1.5 + rnd() * (pv.he - 1.5), cuenta = new Map(), rayos = 2160, paso = 2.5;
    for (let a = 0; a < rayos; a++) { const dx = Math.cos(a / rayos * MC.TAU), dy = Math.sin(a / rayos * MC.TAU); let maxS = -Infinity;
      for (let d = paso; d <= alcance; d += paso) { const px = x + dx * d, py = y + dy * d; if (!M.dentro(px, py)) break; const s = (alto(px, py) - ez) / d; if (s > maxS) { maxS = s; const k = Math.floor(px / P) + ',' + Math.floor(py / P); cuenta.set(k, (cuenta.get(k) || 0) + 1); } if (maxS * d > 600) break; } }
    for (const [k, n] of cuenta) { const [tx, ty] = k.split(',').map(Number); vistas++; columnas += n; if (!V.ve((tx + .5) * P, (ty + .5) * P)) { fugas++; colFuga += n; if (n > 12) fugasGrandes++; } }
    /* cuánto recorta el PVS en el círculo que dibuja la vista 3D (radio ≈ 900 m) */
    for (let j = -pv.r; j <= pv.r; j++) for (let i = -pv.r; i <= pv.r; i++) { const qx = (Math.floor(x / P) + i + .5) * P, qy = (Math.floor(y / P) + j + .5) * P; if (Math.hypot(qx - x, qy - y) > 900) continue; ventana++; if (!V.ve(qx, qy)) recortadas++; }
  }
  const pc = (a, b) => (b ? a / b * 100 : 0).toFixed(2) + ' %', okFuga = colFuga / Math.max(1, columnas) < .005 && fugasGrandes <= Math.max(1, hechas * .05);
  console.log(`${okFuga ? '✓' : '✗'} PVS ${id}: ${hechas} cámaras al azar · ${vistas} celdas vistas · fugas ${fugas} (${pc(colFuga, columnas)} de lo visible, ${fugasGrandes} grandes) · recorta ${pc(recortadas, ventana)} de las celdas a menos de 900 m`);
  console.log('  ' + JSON.stringify(pv.resumen()));
  if (!okFuga) fallo = true;
}
process.exit(fallo ? 1 : 0);
