/* =====================================================================
   99z · LAS HUELLAS REALES EN EL MODO LIBRE (renacimiento cenital, Fase 3 · Claude, 25‑nov‑2026)
   Con la bandera del cenital (99y-cenital.js) y solo en el paseo libre, los lotes inventados (CityMap.lotesEtapas: casas
   repartidas a lo largo de las calles con medidas de catastro) se cambian por las huellas reales saneadas del Motor del Valle
   1.3: 626.140 edificios de OpenStreetMap, Microsoft y Google, sin ninguna casa sobre la calle ni sobre el agua.
   - Los datos: src/data/edificios-ligero.bin (Motor del Valle 1.3.1, geo/huellas.py), que tools/build.js mete en el HTML tal cual
     (EDIF_META y EDIF_BIN, v2: índice, posiciones y medias medidas cada 0,25 m, ángulo, pisos, tipo y marca; sin polígonos ni
     zócalo, porque el piso 3D de EnCicla es plano). Las huellas con polígono (recortadas o irregulares) traen el rectángulo más
     grande que cabe adentro y, si queda otra parte que valga la pena (el otro brazo de una L), un segundo rectángulo que «sigue» al
     primero (bit 16 del tipo: el mismo edificio, con el mismo aspecto). Ningún rectángulo pisa la calle.
   - Los trozos son los mismos de 160 m (256 px) del mapa y de la caché de lotes: la región r = cy · nx + cx del archivo. Cada
     trozo dibuja en 2D también las huellas de sus vecinos que entran en él (sin costuras en los bordes).
   - Cada huella sale con la misma forma que un lote (sus 4 esquinas, su altura z, si es edificio B y sus colores), así que el
     2D de los trozos y el 3D (99d-mundo3d.js) las dibujan sin cambiar: 1 a 2 pisos son casas con techo; 3 o más, edificios.
   - Los oficios, los turnos y los minijuegos siguen con los lotes de siempre. Al entrar o salir del modo libre se vacían las
     cachés de lotes, de trozos 2D y de mallas 3D, para que no se mezclen.
   - JE.cenital.huellas.forzar (pruebas): true o false cambia esto sin la bandera; null, lo decide la bandera.
   ===================================================================== */
(function () {
  if (typeof EDIF_META === 'undefined' || !EDIF_META || !EDIF_BIN || typeof CityMap === 'undefined' || !JE.cenital) return;
  const E = EDIF_META, CEN = JE.cenital, R = E.R, QP = E.Q, QD = E.Qd || E.Q, V2 = E.v >= 2, PX = TS / (VM.tile || 10), S = CH * TS;
  const H = CEN.huellas = { forzar: null, activo: false, n: 0, trozos: 0, regiones: 0, ms: 0 };
  let D = null;
  /* se decodifica una sola vez, la primera vez que hace falta (unos 5 MB en memoria) */
  function datos() {
    if (D) return D; const t0 = performance.now(), bin = atob(EDIF_BIN), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const b = inflateRaw(u8, E.raw), nR = E.nx * E.ny, cnt = new Int32Array(nR), i0 = new Int32Array(nR), p0 = new Int32Array(nR), d0 = new Int32Array(nR); let o = 0, ci = 0, cp = 0, cd = 0;
    const uv = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
    for (let r = 0; r < nR; r++) { cnt[r] = uv(); const pb = uv(), db = uv(); i0[r] = ci; p0[r] = cp; d0[r] = cd; ci += cnt[r]; cp += pb; cd += db; }
    const L = E.len, oPos = L[0], oDim = oPos + L[1], oAng = oDim + L[2], oPis = oAng + L[3], oKin = oPis + L[4], oMar = oKin + L[5];
    if (ci !== E.n || o !== L[0]) throw new Error('índice de huellas inconsistente');
    D = { b, cnt, i0, p0, d0, oPos, oDim, oAng, oPis, oKin, oMar }; H.ms = Math.round(performance.now() - t0); return D;
  }
  /* las huellas de una región (el trozo de 160 m), ya con la forma y el aspecto de un lote; se arman una vez y se guardan: así un
     trozo también dibuja las de sus vecinos que entran en él (cada trozo 2D es un lienzo aparte: sin eso, una casa en el borde
     quedaría cortada). El aspecto sale de la región de cada huella, así que es el mismo en todos los trozos que la dibujan. */
  const RC = new Map();
  function region(M, cx, cy) {
    if (cx < 0 || cy < 0 || cx >= E.nx || cy >= E.ny) return null;
    const r = cy * E.nx + cx; let Lr = RC.get(r); if (Lr) { RC.delete(r); RC.set(r, Lr); return Lr; }
    const d = datos(), n = d.cnt[r], b = d.b, X0 = cx * S, Y0 = cy * S; let o = d.oPos + d.p0[r], od = d.oDim + d.d0[r], px = 0, py = 0, pa = 0, prev = null, salta = false;
    const sv = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v % 2 ? -(v + 1) / 2 : v / 2; };
    const ud = () => { let v = 0, sh = 0, c; do { c = b[od++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
    const tc = (cx + .5) * CH, tcy = (cy + .5) * CH, lad = Math.hypot(M.elevT(tc + 4, tcy) - M.elevT(tc - 4, tcy), M.elevT(tc, tcy + 4) - M.elevT(tc, tcy - 4)) / (8 * VM.tile) > .1;
    const ladZ = /Poblado/.test(M.comunaAt(X0 + S / 2, Y0 + S / 2)) || /Envigado|Sabaneta|Itag/.test(M.muniAt(X0 + S / 2, Y0 + S / 2));
    Lr = [];
    for (let j = 0; j < n; j++) {
      const i = d.i0[r] + j; px += sv(); py += sv(); pa = (pa + b[d.oAng + i]) % 128;
      const dA = V2 ? ud() : b[d.oDim + 2 * i], dB = V2 ? ud() : b[d.oDim + 2 * i + 1], kf = b[d.oKin + i], sigue = V2 && (kf & 16);
      const x = (cx * R + px / QP) * PX, y = (cy * R + py / QP) * PX, hw = Math.max(.5, dA / QD) * PX, hd = Math.max(.5, dB / QD) * PX;
      if (sigue) { if (salta || !prev) continue; }   /* el segundo rectángulo de una huella (el otro brazo de una L): el mismo edificio */
      else if ((salta = !!(M.enSitio && M.sitT && M.enSitio(x, y)))) continue;   /* los sitios reales (22-sitios.js) ya tienen su edificio */
      const an = (pa + .5) * Math.PI / 128, ux = Math.cos(an), uy = Math.sin(an), nx = -uy, ny = ux;
      let q;
      if (sigue) q = Object.assign({}, prev, { x, y, ux, uy, nx, ny, w: hw * 2, d: hd * 2, i: j, pal: [], sigue: true });
      else {
        const k = kf & 15, pis = b[d.oPis + i], q0 = h2(x | 0, y | 0, 43), f = pis || (k === 0 || k === 10 || k === 15 ? 1 + (q0 < .45 ? 1 : 0) : 3), B = f >= 3, rr = q0;
        q = { x, y, ux, uy, nx, ny, w: hw * 2, d: hd * 2, B, real: true, k: q0, id: r, i: j, r: 0, sd: 1, pal: [], pis: f, tipo: E.kinds[k] || 'casa', confiable: !!(kf & 64) };
        if (B) {   /* edificio: la misma regla de alturas y colores de los lotes (75-graficos.js), con sus pisos reales */
          q.z = clamp(.05 + Math.max(2, f) * .03, .1, 1.15);
          const wi = q.z > .62 ? (ladZ && rr < .72 ? ((rr * 97) | 0) % 3 : 6 + ((rr * 7) | 0) % 2) : ((rr * 97) | 0) % 6; q.roof = ROOF[((rr * 31) | 0) % ROOF.length]; q.wa = WALLS[wi][0]; q.wb = WALLS[wi][1];
        } else {   /* casa: techo de teja, losa o pintado, como las del lote */
          q.z = .045 + clamp(f - 1, 0, 3) * .025;
          q.roof = lad ? (rr < .3 ? TEJA[(rr * 9 | 0) % TEJA.length] : rr < .9 ? LOSA[(rr * 13 | 0) % LOSA.length] : PINTA[(rr * 17 | 0) % PINTA.length]) : rr < .55 ? TEJA[(rr * 9 | 0) % TEJA.length] : rr < .88 ? LOSA[(rr * 13 | 0) % LOSA.length] : PINTA[(rr * 17 | 0) % PINTA.length];
          const wi = (lad ? rr < .8 : rr < .6) ? (rr * 31 | 0) % 3 : 3 + (rr * 37 | 0) % 3; q.wa = WALLS[wi][0]; q.wb = WALLS[wi][1];
        }
        prev = q;
      }
      q.pts = [x - ux * hw - nx * hd, y - uy * hw - ny * hd, x + ux * hw - nx * hd, y + uy * hw - ny * hd, x + ux * hw + nx * hd, y + uy * hw + ny * hd, x - ux * hw + nx * hd, y - uy * hw + ny * hd];
      Lr.push(q);
    }
    RC.set(r, Lr); if (RC.size > 160) RC.delete(RC.keys().next().value); H.regiones++; return Lr;
  }
  /* las huellas de un trozo, con la forma de un lote: las suyas (en «ed» y «casas», las que dibuja el 3D: cada una en un solo trozo)
     y, en «all» (lo que pinta el 2D del trozo), también las de los vecinos que entran en él, con su sombra */
  function lotesReales(M, cx, cy) {
    const all = [], ed = [], casas = [], X0 = cx * S, Y0 = cy * S, Lr = region(M, cx, cy); if (!Lr) return { all, ed, casas, real: true };
    for (const q of Lr) { all.push(q); (q.B ? ed : casas).push(q); }
    for (let vy = -1; vy <= 1; vy++) for (let vx = -1; vx <= 1; vx++) { if (!vx && !vy) continue; const V = region(M, cx + vx, cy + vy); if (!V) continue;
      for (const q of V) { const rq = (q.w + q.d) / 2 + (q.B ? 4 + q.z * 13 : 3); if (q.x + rq > X0 && q.x - rq < X0 + S && q.y + rq > Y0 && q.y - rq < Y0 + S) all.push(q); } }
    /* los lugares emblemáticos con sus cuerpos y sus casas de ladera, como en los lotes */
    if (M.lmPartes) for (const P of M.lmPartes()) { if (P.x1 < X0 || P.x0 > X0 + S || P.y1 < Y0 || P.y0 > Y0 + S) continue; for (const q of P.ed) { all.push(q); if (q.x >= X0 && q.x < X0 + S && q.y >= Y0 && q.y < Y0 + S) ed.push(q); } for (const q of P.casas) all.push(q); }
    H.n += Lr.length; H.trozos++; return { all, ed, casas, real: true };
  }
  const usar = () => { const R0 = typeof Game !== 'undefined' && Game.mode && Game.mode.ride; if (H.forzar != null) return !!H.forzar; return !!(R0 && CEN.activo(R0)); };
  /* el generador de lotes: con las huellas, el trozo sale de una vez (ya viene calculado; no hace falta ceder) */
  const real = (M, cx, cy) => { const key = cx + ',' + cy, C0 = M.lotC; let Rq = C0.get(key); if (Rq && Rq.real) return Rq; Rq = lotesReales(M, cx, cy); C0.delete(key); C0.set(key, Rq); if (C0.size > 64) C0.delete(C0.keys().next().value); return Rq; };
  const et0 = CityMap.lotesEtapas, lotes0 = CityMap.lotes, pedir0 = CityMap.lotesPedir;
  CityMap.lotesEtapas = function* (cx, cy) { if (!usar()) return yield* et0.call(this, cx, cy); return real(this, cx, cy); };
  CityMap.lotes = function (cx, cy) { return usar() ? real(this, cx, cy) : lotes0.call(this, cx, cy); };
  /* 99v-rendimiento.js arma los lotes en una cola propia con el generador que guardó al cargar: con las huellas no hace falta cola */
  if (pedir0) CityMap.lotesPedir = function (cx, cy) { if (!usar()) return pedir0.apply(this, arguments); real(this, cx, cy); };
  /* al entrar o salir del modo libre con las huellas: se vacían las cachés que guardan lotes (2D y 3D) */
  function vaciar() {
    const M = CityMap; M.lotC.clear(); if (M.chunks2) M.chunks2.clear(); if (M.chunks) M.chunks.clear();
    if (typeof Mundo3D !== 'undefined' && Mundo3D.gl) { for (const m of Mundo3D.mallas.values()) for (const x of [m.cosas, m.piso]) if (x) Mundo3D.gl.deleteBuffer(x.b); Mundo3D.mallas.clear(); for (const t of Mundo3D.tex.values()) Mundo3D.gl.deleteTexture(t); Mundo3D.tex.clear(); }
  }
  const r0 = Ride.prototype.render;
  Ride.prototype.render = function () { const u = usar(); if (u !== H.activo) { H.activo = u; vaciar(); } return r0.apply(this, arguments); };
})();
