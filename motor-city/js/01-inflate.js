/* =====================================================================
   DESCOMPRESIÓN: deflate crudo sin librerías (el mismo inflador de Juega EnCicla y El Metro)
   y DecompressionStream cuando el navegador lo trae (es varias veces más rápido).
   ===================================================================== */
function inflarCrudo(src, size) {
  let out = new Uint8Array(size || src.length * 4), o = 0, p = 0, bb = 0, bc = 0;
  const crece = n => { if (o + n <= out.length) return; const m = new Uint8Array(Math.max(out.length * 2, o + n)); m.set(out); out = m; };
  const bits = n => { while (bc < n) { if (p > src.length + 8) throw new Error('deflate truncado'); bb |= (src[p++] | 0) << bc; bc += 8; } const v = bb & ((1 << n) - 1); bb >>>= n; bc -= n; return v; };
  const mk = (len, n) => { const cnt = new Int32Array(16), off = new Int32Array(16), sym = new Int32Array(n); for (let i = 0; i < n; i++) cnt[len[i]]++; cnt[0] = 0; for (let i = 1; i < 16; i++) off[i] = off[i - 1] + cnt[i - 1]; for (let i = 0; i < n; i++) if (len[i]) sym[off[len[i]]++] = i; return { cnt, sym }; };
  const dec = h => { let code = 0, first = 0, idx = 0; for (let l = 1; l < 16; l++) { code |= bits(1); const c = h.cnt[l]; if (code - c < first) return h.sym[idx + code - first]; idx += c; first += c; first <<= 1; code <<= 1; } return 256; };
  const LB = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], LE = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DB = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], DE = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  let fl = null, fd = null;
  for (let last = 0; !last;) {
    last = bits(1); const type = bits(2);
    if (type === 0) { bb = 0; bc = 0; const len = src[p] | src[p + 1] << 8; p += 4; crece(len); out.set(src.subarray(p, p + len), o); o += len; p += len; continue; }
    let lh, dh;
    if (type === 1) { if (!fl) { const l = new Uint8Array(288); l.fill(8, 0, 144); l.fill(9, 144, 256); l.fill(7, 256, 280); l.fill(8, 280, 288); fl = mk(l, 288); fd = mk(new Uint8Array(30).fill(5), 30); } lh = fl; dh = fd; }
    else {
      const nl = bits(5) + 257, nd = bits(5) + 1, nc = bits(4) + 4, ord = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], cl = new Uint8Array(19);
      for (let i = 0; i < nc; i++) cl[ord[i]] = bits(3);
      const ch = mk(cl, 19), L = new Uint8Array(nl + nd);
      for (let i = 0; i < nl + nd;) { const s = dec(ch); if (s < 16) L[i++] = s; else { let r, v = 0; if (s === 16) { v = L[i - 1]; r = 3 + bits(2); } else if (s === 17) r = 3 + bits(3); else r = 11 + bits(7); while (r--) L[i++] = v; } }
      lh = mk(L.subarray(0, nl), nl); dh = mk(L.subarray(nl), nd);
    }
    for (;;) { let s = dec(lh); if (s < 256) { crece(1); out[o++] = s; } else if (s === 256) break; else { s -= 257; const len = LB[s] + bits(LE[s]), ds = dec(dh), d = DB[ds] + bits(DE[ds]); crece(len); for (let k = 0; k < len; k++, o++) out[o] = out[o - d]; } }
  }
  return o === out.length ? out : out.subarray(0, o);
}
/* base64 → bytes (atob en el navegador, Buffer en Node) */
function deB64(s) {
  if (typeof Buffer !== 'undefined' && typeof window === 'undefined') { const b = Buffer.from(s, 'base64'); return new Uint8Array(b.buffer, b.byteOffset, b.length); }
  const a = atob(s), u = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) u[i] = a.charCodeAt(i); return u;
}
/* inflado síncrono (Node: zlib; navegador: inflarCrudo) */
function inflarSync(u8, size) {
  if (typeof process !== 'undefined' && process.versions && process.versions.node && typeof require === 'function') { try { const z = require('zlib').inflateRawSync(u8); return new Uint8Array(z.buffer, z.byteOffset, z.length); } catch (e) { /* sigue con el propio */ } }
  return inflarCrudo(u8, size);
}
/* inflado asíncrono: DecompressionStream si existe; si no, el propio */
async function inflar(u8, size) {
  if (typeof DecompressionStream !== 'undefined' && typeof Response !== 'undefined') {
    try { const r = new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); if (!size || r.length === size) return r; } catch (e) { /* respaldo */ }
  }
  return inflarSync(u8, size);
}
Object.assign(MC, { inflarCrudo, inflarSync, inflar, deB64 });
