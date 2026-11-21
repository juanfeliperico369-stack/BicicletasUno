#!/usr/bin/env node
/* =====================================================================
   PVS de Quake (C‑M37), horneado por adelantado sobre el campo de alturas de la ciudad (suelo + edificios).
   Uso:  node herramientas/pvs.mjs nueva_york [--celda 160] [--ojos 16] [--rayos 720] [--alcance 1200] [--res 4]
         node herramientas/pvs.mjs todos
   Sale: datos/<mundo>/pvs.bin (lo lee MC.PVS; construir.mjs lo mete en el HTML de los juegos que usan ese mundo).
   Es un dato DERIVADO del mapa: no cambia el mapa. Si el mapa cambia, se vuelve a hornear.
   Método (sala limpia, desde la idea): por cada celda de P metros se reparten «ojos» en la calle (uno por cada
   cuadro de P/4) a una altura he; desde cada ojo se lanzan N rayos y, como en el horizonte de Comanche, se marca
   cada columna cuya cima queda por encima de la pendiente más alta que el rayo ya cruzó. Varios núcleos (worker_threads).
   ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- el trabajo de un núcleo: barrer las celdas que le tocan ---------- */
function barrer(D) {
  const { H, gw, gh, c, P, r, nx, ny, he, Hmax, ojos, rayos, alcance, celdas, bits, porCelda, lado } = D;
  const cos = new Float32Array(rayos), sin = new Float32Array(rayos);
  for (let a = 0; a < rayos; a++) { cos[a] = Math.cos(a / rayos * Math.PI * 2); sin[a] = Math.sin(a / rayos * Math.PI * 2); }
  const ventana = new Uint8Array(lado * lado), paso = c * .85, lpc = Math.round(Math.sqrt(ojos)), sub = P / lpc;
  let pasos = 0;
  for (const ci of celdas) {
    const cx = ci % nx, cy = (ci / nx) | 0; ventana.fill(0); let nOjos = 0;
    const ojo = (ex, ey, ez) => { for (let a = 0; a < rayos; a++) {
        const dx = cos[a], dy = sin[a]; let maxS = -Infinity, ult = -1;
        for (let d = paso; d <= alcance; d += paso) {
          const x = ex + dx * d, y = ey + dy * d; if (x < 0 || y < 0) break; const ix = (x / c) | 0, iy = (y / c) | 0; if (ix >= gw || iy >= gh) break;
          pasos++; const s = (H[iy * gw + ix] - ez) / d;
          if (s > maxS) { maxS = s; const ox = ((x / P) | 0) - cx + r, oy = ((y / P) | 0) - cy + r; if (ox >= 0 && oy >= 0 && ox < lado && oy < lado) { const b = oy * lado + ox; if (b !== ult) { ventana[b] = 1; ult = b; } } }
          if (maxS * d > Hmax - ez) break;   /* nada más lejos puede asomar por encima del horizonte */
        } } };
    for (let sy = 0; sy < lpc; sy++) for (let sx = 0; sx < lpc; sx++) {
      /* el ojo: la casilla sin edificio más cercana al centro del cuadro */
      const mx = cx * P + (sx + .5) * sub, my = cy * P + (sy + .5) * sub; let best = -1, bd = 1e9;
      const rr = Math.ceil(sub / 2 / c);
      for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) {
        const ix = Math.floor(mx / c) + i, iy = Math.floor(my / c) + j; if (ix < 0 || iy < 0 || ix >= gw || iy >= gh) continue;
        const k = iy * gw + ix; if (D.ed[k]) continue; const d = i * i + j * j; if (d < bd) { bd = d; best = k; }
      }
      if (best < 0) continue; nOjos++;
      ojo((best % gw + .5) * c, ((best / gw | 0) + .5) * c, H[best] + he);
    }
    /* y los ojos sobre las vías de la celda (la cámara anda por la calle: así no se pierden las avenidas largas) */
    for (let q = D.viaI[ci]; q < D.viaI[ci + 1]; q++) { const ex = D.viaP[2 * q], ey = D.viaP[2 * q + 1], ix = (ex / c) | 0, iy = (ey / c) | 0; if (ix < 0 || iy < 0 || ix >= gw || iy >= gh) continue; nOjos++; ojo(ex, ey, H[iy * gw + ix] + he); }
    const o = ci * porCelda;
    if (!nOjos) { for (let b = 0; b < porCelda; b++) bits[o + b] = 255; continue; }
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) ventana[(r + j) * lado + r + i] = 1;   /* las vecinas siempre */
    for (let b = 0; b < lado * lado; b++) if (ventana[b]) bits[o + (b >> 3)] |= 1 << (b & 7);
  }
  return pasos;
}

if (!isMainThread) {
  const D = workerData; D.H = new Float32Array(D.Hsab); D.ed = new Uint8Array(D.edSab); D.bits = new Uint8Array(D.bitsSab); D.viaP = new Float32Array(D.viaPsab); D.viaI = new Int32Array(D.viaIsab);
  parentPort.postMessage({ pasos: barrer(D) });
} else {
  const args = process.argv.slice(2), opt = (k, v) => { const i = args.indexOf('--' + k); return i >= 0 ? Number(args[i + 1]) : v; };
  let mundos = args.filter(a => !a.startsWith('--') && !/^\d/.test(a)); if (!mundos.length || mundos[0] === 'todos') mundos = ['nueva_york', 'medellin', 'guatape'];
  const ctx = { console, require: (await import('node:module')).createRequire(import.meta.url), process, Buffer, TextDecoder, TextEncoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8'), ctx); const MC = ctx.MC;
  for (const id of mundos) {
    const f = path.join(RAIZ, 'datos', id, 'mundo.mc4'); if (!fs.existsSync(f)) { console.warn('⚠ falta ' + f); continue; }
    const t0 = performance.now(), cfg = fs.existsSync(path.join(RAIZ, 'ciudades', id + '.json')) ? JSON.parse(fs.readFileSync(path.join(RAIZ, 'ciudades', id + '.json'), 'utf8')) : null;
    const M = await MC.Mundo.cargar(new Uint8Array(fs.readFileSync(f)), cfg);
    const grande = M.ancho * M.alto > 3e8;
    const P = opt('celda', 160), c = opt('res', grande ? 6 : 4), he = opt('altura', 8), alcance = opt('alcance', grande ? 1000 : 1200), r = Math.ceil(alcance / P) + 0;
    const ojos = opt('ojos', grande ? 9 : 16), rayos = opt('rayos', grande ? 540 : 720);
    const gw = Math.ceil(M.ancho / c), gh = Math.ceil(M.alto / c), Hsab = new SharedArrayBuffer(gw * gh * 4), H = new Float32Array(Hsab), edSab = new SharedArrayBuffer(gw * gh), ed = new Uint8Array(edSab);
    /* el suelo */
    for (let iy = 0; iy < gh; iy++) for (let ix = 0; ix < gw; ix++) H[iy * gw + ix] = M.cota((ix + .5) * c, (iy + .5) * c);
    /* los edificios: una casilla es del edificio si su centro cae adentro (los callejones angostos quedan abiertos) */
    const E = M._ed(); let nEd = 0, Hmax = -1e9; const urbana = new Uint8Array(Math.ceil(M.ancho / P) * Math.ceil(M.alto / P)), nxC = Math.ceil(M.ancho / P);
    for (let ry = 0; ry < E.ny; ry++) for (let rx = 0; rx < E.nx; rx++) for (const e of M.edificiosRegion(rx, ry)) {
      const Q = MC.Mundo.esquinas(e); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let v = 0; v < Q.length; v += 2) { x0 = Math.min(x0, Q[v]); x1 = Math.max(x1, Q[v]); y0 = Math.min(y0, Q[v + 1]); y1 = Math.max(y1, Q[v + 1]); }
      const z = M.cota(e.x, e.y) + e.h; nEd++;
      const u = Math.floor(e.y / P) * nxC + Math.floor(e.x / P); if (u >= 0 && u < urbana.length) urbana[u] = 1;
      for (let iy = Math.max(0, Math.floor(y0 / c)); iy <= Math.min(gh - 1, Math.floor(y1 / c)); iy++) for (let ix = Math.max(0, Math.floor(x0 / c)); ix <= Math.min(gw - 1, Math.floor(x1 / c)); ix++) {
        const px = (ix + .5) * c, py = (iy + .5) * c; if (!MC.dentroPol(Q, px, py)) continue; const k = iy * gw + ix; if (z > H[k]) H[k] = z; ed[k] = 1;
      }
    }
    for (let k = 0; k < H.length; k++) if (H[k] > Hmax) Hmax = H[k];
    const nx = Math.ceil(M.ancho / P), ny = Math.ceil(M.alto / P), lado = 2 * r + 1, porCelda = Math.ceil(lado * lado / 8), bitsSab = new SharedArrayBuffer(nx * ny * porCelda), bits = new Uint8Array(bitsSab);
    /* solo se hornean las celdas con edificios cerca (en el campo o el agua no hay nada que recortar) */
    const todas = []; for (let cy = 0; cy < ny; cy++) for (let cx = 0; cx < nx; cx++) { let u = 0; for (let j = -1; j <= 1 && !u; j++) for (let i = -1; i <= 1 && !u; i++) { const x = cx + i, y = cy + j; if (x >= 0 && y >= 0 && x < nx && y < ny && urbana[y * nx + x]) u = 1; } if (u) todas.push(cy * nx + cx); else bits.fill(255, (cy * nx + cx) * porCelda, (cy * nx + cx + 1) * porCelda); }
    /* puntos de vía por celda: cada 20 m sobre cada vía, sin edificio encima; luego, a lo sumo ojosVia por celda y separados ≥ 28 m */
    const ojosVia = opt('ojosVia', grande ? 8 : 20), porC = new Map();
    for (const v of M.vias()) { const p = v.p; for (let i = 0; i + 3 < p.length; i += 2) { const L = Math.hypot(p[i + 2] - p[i], p[i + 3] - p[i + 1]), n = Math.max(1, Math.ceil(L / 20)); for (let t = 0; t < n; t++) { const x = p[i] + (p[i + 2] - p[i]) * t / n, y = p[i + 1] + (p[i + 3] - p[i + 1]) * t / n; if (x < 0 || y < 0 || x >= M.ancho || y >= M.alto) continue; const k = Math.floor(y / P) * nx + Math.floor(x / P); const ix = (x / c) | 0, iy = (y / c) | 0; if (ed[iy * gw + ix]) continue; (porC.get(k) || porC.set(k, []).get(k)).push(x, y); } } }
    const viaI = new Int32Array(new SharedArrayBuffer((nx * ny + 1) * 4)), lista = [];
    for (let k = 0; k < nx * ny; k++) { viaI[k] = lista.length / 2; const L = porC.get(k); if (!L) continue; const el = [];
      for (let i = 0; i < L.length && el.length < ojosVia * 2; i += 2) { let lejos = true; for (let j = 0; j < el.length; j += 2) if (Math.hypot(el[j] - L[i], el[j + 1] - L[i + 1]) < 28) { lejos = false; break; } if (lejos) el.push(L[i], L[i + 1]); }
      lista.push(...el); }
    viaI[nx * ny] = lista.length / 2; const viaP = new Float32Array(new SharedArrayBuffer(Math.max(4, lista.length * 4))); viaP.set(lista);
    const nW = Math.max(1, Math.min(os.cpus().length, opt('nucleos', 8))), t1 = performance.now();
    const partes = Array.from({ length: nW }, (_, w) => todas.filter((_, i) => i % nW === w));
    const res = await Promise.all(partes.map(celdas => new Promise((ok, mal) => { const w = new Worker(fileURLToPath(import.meta.url), { workerData: { Hsab, edSab, bitsSab, viaPsab: viaP.buffer, viaIsab: viaI.buffer, gw, gh, c, P, r, nx, ny, he, Hmax, ojos, rayos, alcance, celdas, porCelda, lado } }); w.on('message', ok); w.on('error', mal); })));
    const pasos = res.reduce((s, x) => s + x.pasos, 0), comp = zlib.deflateRawSync(Buffer.from(bits), { level: 9 });
    const meta = { formato: 'PVS1', mundo: id, P, r, nx, ny, he, bytes: bits.length, res: c, ojos, ojosVia, rayos, alcance, horneadas: todas.length, edificios: nEd, fecha: new Date().toISOString().slice(0, 10) };
    const pv = new MC.PVS(meta, bits), rs = pv.resumen(); meta.resumen = rs;
    const J = Buffer.from(JSON.stringify(meta)), cab = Buffer.alloc(8); cab.write('PVS1', 0, 'ascii'); cab.writeUInt32LE(J.length, 4);
    fs.writeFileSync(path.join(RAIZ, 'datos', id, 'pvs.bin'), Buffer.concat([cab, J, comp]));
    console.log(`✓ PVS ${id}: ${nx}×${ny} celdas de ${P} m (${todas.length} horneadas), ventana ${lado}×${lado}, ${(pasos / 1e9).toFixed(2)} G pasos en ${((performance.now() - t1) / 1000).toFixed(1)} s con ${nW} núcleos (total ${((performance.now() - t0) / 1000).toFixed(1)} s) · se ven ${rs.vistasMedia} de ${rs.ventana} celdas (recorta ${(rs.recorteMedio * 100).toFixed(1)} %) · ${(comp.length / 1024).toFixed(0)} KB`);
  }
}
