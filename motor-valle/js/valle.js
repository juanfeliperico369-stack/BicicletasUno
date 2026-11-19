/* =====================================================================
   MOTOR DEL VALLE (motor-valle/js/valle.js · v1.1.0)
   Lector y consultor unificado del mapa del Valle de Aburrá para Juega EnCicla (10 m/casilla)
   y El Metro (20 m/casilla). Decodifica VALLE_META y VALLE_BIN, convierte coordenadas
   (lat/lon ↔ metros ↔ casilla ↔ píxel) y responde consultas de suelo, cota, pendiente,
   barrio, comuna, municipio, vía más cercana, estación y desnivel (puente/túnel/suelo).
   ===================================================================== */
(function (root) {
  'use strict';
  const b64 = s => { const a = atob(s), u = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) u[i] = a.charCodeAt(i); return u; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  const Valle = {
    version: '1.1.0',
    /* decodifica o enlaza el mapa del Valle de Aburrá en un consultor unificado */
    decodificar(meta, binB64, tsPx) {
      const jm = root.JE && root.JE.map;
      const M = meta || (typeof VALLE_META !== 'undefined' ? VALLE_META : root.VALLE_META) || (jm && jm.meta);
      const B = binB64 || (typeof VALLE_BIN !== 'undefined' ? VALLE_BIN : root.VALLE_BIN);
      if (!M) return null;
      const W = M.W || M.w, H = M.H || M.h, tileM = M.tile || 10, TS = tsPx || 16, PXM = TS / tileM;
      const ew = M.eW || M.ew || 0, eh = M.eH || M.eh || 0, es = M.es || 8;
      let t = jm && jm.t, el = jm && jm.E;
      if ((!t || !el) && B) {
        const raw = b64(B);
        if (typeof inflateRaw === 'function' && M.eW) {
          const nT = W * H, nE = ew * eh, u = inflateRaw(raw, nT + nE * 2);
          t = u.slice(0, nT);
          const ed = new Int16Array(u.slice(nT, nT + nE * 2).buffer); el = new Int16Array(nE);
          for (let j = 0; j < eh; j++) { let a = 0; for (let i = 0; i < ew; i++) { a += ed[j * ew + i]; el[j * ew + i] = a; } }
        }
      }
      return {
        meta: M, w: W, h: H, tileM, ts: TS, pxm: PXM, t, el, ew, eh, es,
        /* conversiones de coordenadas */
        geoACasilla(lat, lon) {
          return M.kx ? { x: (lon - M.lon0) * M.kx, y: (M.latN - lat) * M.ky } : {
            x: (lon - M.lon0) / (M.lon1 - M.lon0) * W,
            y: (M.latN - lat) / (M.latN - M.latS) * H
          };
        },
        casillaAGeo(tx, ty) {
          return M.kx ? { lat: M.latN - ty / M.ky, lon: M.lon0 + tx / M.kx } : {
            lat: M.latN - (ty / H) * (M.latN - M.latS),
            lon: M.lon0 + (tx / W) * (M.lon1 - M.lon0)
          };
        },
        pxAMetros(px) { return px / PXM; },
        metrosAPx(m) { return m * PXM; },
        /* consultas de terreno y relieve */
        suelo(tx, ty) { tx |= 0; ty |= 0; return (!t || tx < 0 || ty < 0 || tx >= W || ty >= H) ? 1 : t[ty * W + tx]; },
        cotaCasilla(tx, ty) {
          if (jm && typeof jm.elev === 'function') return jm.elev(tx * TS, ty * TS);
          if (!el || !ew || !eh) return 1500;
          const gx = clamp(tx / es, 0, ew - 1.001), gy = clamp(ty / es, 0, eh - 1.001), x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0, i = y0 * ew + x0;
          return (el[i] * (1 - fx) + el[i + 1] * fx) * (1 - fy) + (el[i + ew] * (1 - fx) + el[i + ew + 1] * fx) * fy;
        },
        cotaPx(x, y) { return this.cotaCasilla(x / TS, y / TS); },
        pendientePx(x, y, ang) {
          const d = 2 * TS;
          return (this.cotaPx(x + Math.cos(ang) * d, y + Math.sin(ang) * d) - this.cotaPx(x - Math.cos(ang) * d, y - Math.sin(ang) * d)) / (4 * tileM);
        },
        /* consultas geográficas del valle (barrio, comuna, municipio) */
        municipioEn(tx, ty) {
          if (jm && typeof jm.muniAt === 'function') return jm.muniAt(tx, ty);
          const L = (typeof MUNIS !== 'undefined' ? MUNIS : root.MUNIS) || []; let best = null, bd = 1e18;
          for (const m of L) { const d = (m.x - tx) * (m.x - tx) + (m.y - ty) * (m.y - ty); if (d < bd) { bd = d; best = m; } }
          return best ? best.name : 'Medellín';
        },
        barrioEn(tx, ty) {
          if (jm && typeof jm.barrioAt === 'function') return jm.barrioAt(tx, ty);
          const L = (typeof BARRIOS !== 'undefined' ? BARRIOS : root.BARRIOS) || []; let best = null, bd = 72 * 72;
          for (const b of L) { const bx = b[1], by = b[2], d = (bx - tx) * (bx - tx) + (by - ty) * (by - ty); if (d < bd) { bd = d; best = b[0]; } }
          return best;
        },
        comunaEn(tx, ty) {
          if (jm && typeof jm.comunaAt === 'function') return jm.comunaAt(tx, ty);
          const L = (typeof COMUNAS !== 'undefined' ? COMUNAS : root.COMUNAS) || []; let best = null, bd = 160 * 160;
          for (const c of L) { const cx = c[2], cy = c[3], d = (cx - tx) * (cx - tx) + (cy - ty) * (cy - ty); if (d < bd) { bd = d; best = { code: c[0], name: c[1] }; } }
          return best;
        },
        nivelEn(tx, ty) {
          if (jm && jm.desnivel) return jm.desnivel.get((ty | 0) * W + (tx | 0)) || 0;
          return 0;
        }
      };
    }
  };

  root.Valle = Valle;
  if (typeof root.JE === 'object' && root.JE) root.JE.valle = Valle;
})(typeof window !== 'undefined' ? window : globalThis);
