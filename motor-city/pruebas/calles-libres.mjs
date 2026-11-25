#!/usr/bin/env node
/* =====================================================================
   CALLES LIBRES (5.4 · renacimiento cenital, Fase 2): ninguna huella sobre el asfalto
   Recorre el eje de cada calle de carros (calle, avenida, autopista y carrera) de cada mundo cada 2 m y pregunta lo mismo que la
   colisión de js/32-fisica.js sin la tolerancia de 1 m: ¿un carro de radio 0,4 m chocaría aquí con una casa? Con los mundos
   saneados (Motor del Valle 1.3 para Medellín, geo/territorio.py para los demás) la respuesta debe ser casi siempre no; los
   pocos puntos que quedan se cuentan y se listan (cruces de calles sin nombre, casas de OSM pegadas al asfalto).
   Uso: node motor.mjs construir && node pruebas/calles-libres.mjs [medellin guatape nueva_york] [--max 0.002] [--datos OTRA/datos] [--json]
   ===================================================================== */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), A = process.argv.slice(2);
const ctx = { console, require: createRequire(import.meta.url), process, Buffer, TextDecoder, TextEncoder, performance, setTimeout }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(RAIZ, 'dist/motor.js'), 'utf8'), ctx); const MC = ctx.MC;
const ids = A.filter((a, i) => /^[a-z_]+$/.test(a) && A[i - 1] !== '--datos'), MUNDOS = ids.length ? ids : ['medellin', 'guatape', 'nueva_york'];
const MAX = A.includes('--max') ? +A[A.indexOf('--max') + 1] : .002, JSONOUT = A.includes('--json'), PASO = 2, R = .4;
const CARROS = new Set([1, 2, 3, 4]), out = [];
for (const id of MUNDOS) {
  const f = path.join(A.includes('--datos') ? path.resolve(A[A.indexOf('--datos') + 1]) : path.join(RAIZ, 'datos'), id, 'mundo.mc4'); if (!fs.existsSync(f)) { out.push({ mundo: id, falta: true }); continue; }
  const cfgF = path.join(RAIZ, 'ciudades', id + '.json'), cfg = fs.existsSync(cfgF) ? JSON.parse(fs.readFileSync(cfgF, 'utf8')) : undefined, t0 = Date.now();
  const M = new MC.Mundo(new Uint8Array(fs.readFileSync(f)), cfg); let pts = 0, choca = 0; const ej = [];
  /* las mismas huellas que lee la colisión (M.edificiosRegion), en una rejilla de 20 m para no recorrer regiones enteras por punto */
  const E = M._ed(), G = new Map(), C = 20; let nEd = 0;
  for (let ry = 0; ry < E.ny; ry++) for (let rx = 0; rx < E.nx; rx++) for (const e of M.edificiosRegion(rx, ry)) {
    nEd++; const rr = e.hw + e.hd + R + 1;
    for (let gy = Math.floor((e.y - rr) / C); gy <= Math.floor((e.y + rr) / C); gy++) for (let gx = Math.floor((e.x - rr) / C); gx <= Math.floor((e.x + rr) / C); gx++) { const k = gx * 65536 + gy; (G.get(k) || G.set(k, []).get(k)).push(e); }
  }
  /* idéntico a MC.Mundo.edificioEn(x, y, r ≥ 0): polígono → punto dentro; rectángulo → dentro del rectángulo agrandado r */
  const dentroPol = (P, x, y) => { let d = false; const n = P.length / 2; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d; } return d; };
  const edificioEn = (x, y, r) => { for (const e of G.get(Math.floor(x / C) * 65536 + Math.floor(y / C)) || []) { if (Math.abs(e.x - x) > e.hw + e.hd + r + 1 || Math.abs(e.y - y) > e.hw + e.hd + r + 1) continue; if (e.P) { if (dentroPol(e.P, x, y)) return e; } else { const lx = (x - e.x) * e.ux + (y - e.y) * e.uy, ly = -(x - e.x) * e.uy + (y - e.y) * e.ux; if (Math.abs(lx) < e.hw + r && Math.abs(ly) < e.hd + r) return e; } } return null; };
  for (const v of M.vias()) {
    if (!CARROS.has(v.k) || v.nivel) continue; const p = v.p;   // los puentes, túneles y vías cubiertas van por encima o por debajo de las casas
    for (let i = 2; i < p.length; i += 2) {
      const ax = p[i - 2], ay = p[i - 1], bx = p[i], by = p[i + 1], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / PASO));
      for (let j = 0; j < n; j++) { const t = j / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t; pts++; if (edificioEn(x, y, R)) { choca++; if (ej.length < 8) ej.push([Math.round(x), Math.round(y), v.nombre || v.nom || '(sin nombre)']); } }
    }
  }
  if (A.includes('--comprobar')) { let dif = 0; for (let i = 0; i < 4000; i++) { const v = M.vias()[(i * 7919) % M.vias().length], q = (v.p.length / 2 | 0) * 2 - 2, x = v.p[Math.max(0, q)], y = v.p[Math.max(0, q) + 1]; if (!!M.edificioEn(x, y, R) !== !!edificioEn(x, y, R)) dif++; } console.log('  la rejilla y MC.Mundo.edificioEn difieren en', dif, 'de 4000 puntos'); }
  out.push({ mundo: id, huellas: nEd, puntos: pts, chocan: choca, fraccion: +(choca / Math.max(1, pts)).toFixed(5), ejemplos: ej, s: +((Date.now() - t0) / 1000).toFixed(1) });
}
const mal = out.filter(o => !o.falta && o.fraccion > MAX);
if (JSONOUT) console.log(JSON.stringify({ max: MAX, mundos: out }, null, 1));
else { for (const o of out) console.log(o.falta ? `· ${o.mundo}: no hay mundo` : `· ${o.mundo}: ${o.puntos} puntos del eje de las calles de carros, ${o.chocan} chocarían con una casa (${(o.fraccion * 100).toFixed(3)} %) · ${o.s} s` + (o.ejemplos.length ? ' · p. ej. ' + o.ejemplos.slice(0, 3).map(e => e.join(' ')).join('; ') : '')); console.log(mal.length ? `✗ más del ${(MAX * 100).toFixed(1)} % en ${mal.map(o => o.mundo).join(', ')}` : `✓ calles libres en los ${out.filter(o => !o.falta).length} mundos (tope ${(MAX * 100).toFixed(1)} %)`); }
process.exit(mal.length ? 1 : 0);
