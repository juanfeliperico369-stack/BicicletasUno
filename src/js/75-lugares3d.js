/* =====================================================================
   LUGARES EMBLEMÁTICOS EN 3D (ciudad suave, sin cubos)
   - Cuerpos con volumen y techo propio: iglesias a dos aguas con torre y aguja, la catedral de
     ladrillo, el Coltejer con su aguja, las tres rocas de la Biblioteca España, el teatro a cuatro
     aguas, el orquideorama con sus flores de madera, el coliseo con cúpula…
   - Suelo vectorial con curvas: el estadio en tazón con su cancha, los cerros con curvas de nivel
     y bosque, parques con prados y fuente, la pista del Olaya Herrera, la montaña rusa.
   - Casas de ladera (Comuna 13, Santo Domingo) y el Pueblito Paisa: casas con volumen.
   En modo pixel (y en las postales) siguen los dibujos de 21-map-art.js.
   ===================================================================== */
const LMC = {
  igl: ['#b5542f', '#f1ebdd', '#d9cdb7'], tor: ['#c25f37', '#f6f1e6', '#ded4c1'], lad: ['#9a4a2c', '#b8673f', '#93502f'],
  ter: ['#dfe3e8', '#c3c9d1', '#a9b1bc'], orq: ['#c99556', '#a8743c', '#8e6230'], exp: ['#d8432f', '#c0342c', '#9f2a22'], exp2: ['#e05a3a', '#c94a2e', '#a83b25'],
  mus: ['#c9ae74', '#ecdcb4', '#d3c194'], col: ['#e8ecf0', '#d3dae2', '#aeb9c6'], pod: ['#cfc8b8', '#d9d2c2', '#bab3a3'], tea: ['#a34e2c', '#c46a44', '#8a3f22'],
  pal: ['#3a3c41', '#ece8de', '#cfcac0'], mem: ['#b9b5ad', '#a8a49b', '#8f8b83'], dep: ['#f2f5f8', '#e2e8ee', '#c4ced9'], roc: ['#2b2f38', '#3a3f4a', '#22262e'],
  esc: ['#f0a030', '#c9ccd1', '#a9b0ba'], coli: ['#c9cfd8', '#aeb6c1', '#929ba7'], aer: ['#e9eef3', '#d5dce4', '#b8c2cd'], vid: ['#9fb8cf', '#8aa3bb', '#728ba3'],
  cam: [['#b4552f', '#d8cfbf', '#bdb3a2'], ['#c9c5bd', '#e2ddd2', '#c6c0b4']]
};
const ARB = ['#3f8a3f', '#4a9444', '#357a38', '#5a9e48', '#3f8a3f', '#468f40', '#4a9444', '#3a8240', '#f2c230', '#e88ab8'];
const MURAL = [['#ff6b5a', '#e0503f'], ['#56c7ff', '#3aa5dc'], ['#ffd84a', '#e5b92a'], ['#b07cff', '#8f5ee0'], ['#9bd341', '#7db52a'], ['#ff8fc7', '#e46fa8']];
const BUSES = ['#e9eef3', '#2e9d55', '#e7b531', '#d8432f', '#3a7bd5'];

/* un cuerpo rectangular en casillas relativas al lugar, girado a radianes alrededor de su centro */
function lmQuad(L, tx, ty, tw, th, a) {
  const w = tw * TS, d = th * TS, x = (L.x + tx + tw / 2) * TS, y = (L.y + ty + th / 2) * TS, ux = Math.cos(a || 0), uy = Math.sin(a || 0), nx = -uy, ny = ux, hw = w / 2, hd = d / 2;
  return { x, y, ux, uy, nx, ny, w, d, pts: [x - ux * hw - nx * hd, y - uy * hw - ny * hd, x + ux * hw - nx * hd, y + uy * hw - ny * hd, x + ux * hw + nx * hd, y + uy * hw + ny * hd, x - ux * hw + nx * hd, y - uy * hw + ny * hd] };
}
/* árbol redondo con sombra y luz (el mismo de las calles) */
function arbol(c, X, Y, R, col) {
  c.fillStyle = 'rgba(8,14,30,.28)'; c.beginPath(); c.arc(X + R * .35, Y + R * .4, R, 0, TAU); c.fill();
  c.fillStyle = shade(col, -.18); c.beginPath(); c.arc(X, Y, R, 0, TAU); c.fill();
  c.fillStyle = col; c.beginPath(); c.arc(X - R * .15, Y - R * .15, R * .78, 0, TAU); c.fill();
  c.fillStyle = '#ffffff2e'; c.beginPath(); c.arc(X - R * .35, Y - R * .35, R * .38, 0, TAU); c.fill();
}
/* cancha de fútbol en píxeles del mundo: franjas de corte y líneas blancas */
function canchaP(c, x, y, w, h) {
  c.fillStyle = '#4f9a3a'; c.beginPath(); c.roundRect(x, y, w, h, 1.5); c.fill();
  c.fillStyle = '#5aa845'; for (let k = 1; k < 8; k += 2) c.fillRect(x + k * w / 8, y, w / 8, h);
  const m = Math.min(w, h) * .05, cw = w - 2 * m, chh = h - 2 * m, ax = Math.min(cw * .16, 16), ay = chh * .5, gx = ax * .38, gy = chh * .24;
  c.strokeStyle = '#f4f4f4'; c.lineWidth = .7; c.beginPath();
  c.rect(x + m, y + m, cw, chh); c.moveTo(x + w / 2, y + m); c.lineTo(x + w / 2, y + h - m);
  c.moveTo(x + w / 2 + chh * .14, y + h / 2); c.arc(x + w / 2, y + h / 2, chh * .14, 0, TAU);
  c.rect(x + m, y + h / 2 - ay / 2, ax, ay); c.rect(x + w - m - ax, y + h / 2 - ay / 2, ax, ay);
  c.rect(x + m, y + h / 2 - gy / 2, gx, gy); c.rect(x + w - m - gx, y + h / 2 - gy / 2, gx, gy);
  c.stroke();
  c.fillStyle = '#f4f4f4'; c.fillRect(x + m - 1.6, y + h / 2 - gy * .3, 1.6, gy * .6); c.fillRect(x + w - m, y + h / 2 - gy * .3, 1.6, gy * .6);
}

Object.assign(CityMap, {
  /* cuerpos con volumen de cada lugar (se levantan en draw3D, como los edificios) y casas con volumen fijo (van con el suelo) */
  lmPartes() {
    if (this._lmP) return this._lmP;
    this._lmP = LANDMARKS.map((L, i) => {
      const W = L.w, H = L.h, S = (L.solids || []).map(([x, y, w, h]) => [x - L.x, y - L.y, w, h]), ed = [], casas = [], gx = (L.x + W / 2) * TS, gy = (L.y + H / 2) * TS;
      const E = (tx, ty, tw, th, z, col, t, o) => { const b = Object.assign(lmQuad(L, tx, ty, tw, th, o && o.a), { B: true, lm: i, z, roof: col[0], wa: col[1], wb: col[2], k: .7, t, pal: [], gx, gy }, o || {}); ed.push(b); return b; };
      const C = (tx, ty, tw, th, a, z, roof, wa, wb, k) => casas.push(Object.assign(lmQuad(L, tx, ty, tw, th, a), { B: false, lm: i, z, roof, wa, wb, k }));
      // casas de ladera en una rejilla con algo de desorden, sin pisar lo que se evita; algunas con murales o de cal y teja
      const casitas = (x0, y0, x1, y1, evita, murales) => {
        let fila = 0;
        for (let ty = y0 + .5; ty < y1 - .4; ty += 1.08, fila++) for (let tx = x0 + .5 + (fila % 2) * .45; tx < x1 - .4; tx += 1.1) {
          const s = Math.round(tx * 10) * 131 + Math.round(ty * 10), r = h2(i, s, 81); if (r < .1) continue;
          const X = tx + (h2(i, s, 82) - .5) * .3, Y = ty + (h2(i, s, 83) - .5) * .3;
          if (evita.some(([ax, ay, aw, ah]) => X > ax - .55 && X < ax + aw + .55 && Y > ay - .55 && Y < ay + ah + .55)) continue;
          const w = .74 + h2(i, s, 84) * .22, d = .68 + h2(i, s, 85) * .2, k = h2(i, s, 86), z = .045 + ((h2(i, s, 87) * 3) | 0) * .025;
          const wl = murales && k > .62 ? MURAL[(k * 97 | 0) % MURAL.length] : WALLS[(k * 31 | 0) % 3];
          C(X - w / 2, Y - d / 2, w, d, (h2(i, s, 88) - .5) * .45, z, k < .6 ? TEJA[(k * 9 | 0) % TEJA.length] : LOSA[(k * 13 | 0) % LOSA.length], wl[0], wl[1], k);
        }
      };
      const [sx, sy, sw, sh] = S[0] || [1, 1, W - 2, H - 2];
      switch (L.k) {
        case 'iglesia':   // nave y crucero a dos aguas, torre con aguja al frente (mira al parque)
          E(sx + 1.15, sy + .15, 1.7, 3.05, .3, LMC.igl, 'dos', { nf: 1 });
          E(sx + .2, sy + .95, 3.6, 1.1, .29, LMC.igl, 'dos', { nf: 1 });
          E(sx + 1.45, sy + 2.95, 1.1, 1, .64, LMC.tor, 'aguja', { nf: 1, zA: .3, tip: '#f2c230' });
          break;
        case 'catedral':
          E(sx + 2, sy + .15, 2, 4.1, .44, LMC.lad, 'dos', { nf: 1 });
          E(sx + .15, sy + 1, 5.7, 1.5, .42, LMC.lad, 'dos', { nf: 1 });
          E(sx + 2.4, sy + 3.9, 1.2, 1, .9, LMC.lad, 'aguja', { nf: 1, zA: .38, tip: '#f2c230' });
          break;
        case 'terminal': E(sx + .1, sy + .1, sw - .2, 1.55, .2, LMC.ter, 'claraboya', { nf: 1 }); break;
        case 'campus': S.forEach(([x, y, w, h], k) => E(x + .2, y + .2, w - .4, h - .4, .24 + .12 * h2(i, k, 61), LMC.cam[i % 2], 'claustro', { nf: 3 })); break;
        case 'botanico': E(sx + .15, sy + .15, sw - .3, sh - .3, .2, LMC.orq, 'flores', { nf: 1 }); break;
        case 'explora': S.forEach(([x, y, w, h], k) => E(x + .1, y + .1, w - .2, h - .2, k ? .27 : .36, k === 1 ? LMC.exp2 : LMC.exp, 'plano', { nf: 1 })); break;
        case 'botero': E(sx + .2, sy + .15, sw - .4, sh - .3, .3, LMC.mus, 'claustro', { nf: 2, patio: '#d8ccb0' }); break;   // Museo de Antioquia, con su patio
        case 'coltejer': E(.25, .6, W - .5, H - 1.2, .12, LMC.pod, 'plano', { nf: 1 }); E(W / 2 - 1.25, 1.4, 2.5, H - 2.8, 1.55, LMC.col, 'aguja', { zA: .5 }); break;
        case 'teatro': E(sx + .15, sy + .15, sw - .3, sh - .3, .3, LMC.tea, 'cuatro', { nf: 1 }); break;
        case 'mamm': E(sx + .1, sy + .15, sw * .64, sh - .3, .26, LMC.lad, 'dientes', { nf: 1 }); E(sx + sw * .7, sy + .3, sw * .28, sh - .6, .42, LMC.vid, 'plano', { nf: 3 }); break;
        case 'palacio': E(sx + .1, sy + .1, sw - .2, sh - .2, .36, LMC.pal, 'ajedrez', { nf: 3, lnc: '#1d1d1d' }); break;
        case 'memoria': E(sx + .15, sy + .15, sw - .3, sh - .3, .24, LMC.mem, 'jardin', { nf: 2 }); break;
        case 'depot': E(sx + .15, sy + .15, sw - .3, sh - .3, .22, LMC.dep, 'encicla', { nf: 1 }); break;
        case 'deporte': E(sx + .15, sy + .15, sw - .3, sh - .3, .2, LMC.coli, 'cupula', { nf: 1 }); break;
        case 'aeropuerto': E(W - 1.3, 7.5, 1.05, 6.5, .2, LMC.aer, 'plano', { nf: 1 }); E(W - 1.2, 14.6, .8, .8, .55, LMC.aer, 'focos', { nf: 1 }); break;
        case 'bibespana': {   // las tres rocas oscuras, un poco giradas, sobre la ladera de casas de Santo Domingo
          const R = [[1.1, 2.4, 3.2, 2.7, -.17, .34], [4.9, 1.4, 3.2, 3.2, .1, .42], [8.2, 2.9, 2.5, 2.4, -.08, .3]];
          R.forEach(([x, y, w, h, a, z]) => E(x, y, w, h, z, LMC.roc, 'roca', { a, nf: 1 }));
          casitas(0, 0, W, H, R.map(([x, y, w, h]) => [x, y, w, h]).concat([[.8, 5.9, W - 1.6, 1.3]]), false);
          break;
        }
        case 'comuna13': {   // escaleras eléctricas techadas en naranja, en zigzag ladera arriba, entre casas con murales
          const esc = []; for (let s = 0; s < 4; s++) { const x = .7 + s * 2.45, y = H - 1.7 - s * 2.05; esc.push([x, y, 2.3, .62]); E(x, y, 2.3, .62, .08, LMC.esc, 'escalera', { a: -.3, nf: 1 }); }
          casitas(0, 0, W, H, esc, true);
          break;
        }
        case 'cerro': {   // el Pueblito Paisa en la cima: capilla con torre y casas de cal y teja alrededor de la plaza
          E(W / 2 - .55, H / 2 - 2.55, 1.1, 1.5, .3, LMC.igl, 'dos', { nf: 1 }); E(W / 2 - .45, H / 2 - 1.2, .9, .75, .52, LMC.tor, 'aguja', { nf: 1, zA: .22, tip: '#f2c230' });
          for (let k = 0; k < 8; k++) { const a = (-.15 + k * .19) * Math.PI, x = W / 2 + Math.cos(a) * 2.2, y = H / 2 + .3 + Math.sin(a) * 2; C(x - .45, y - .4, .9, .8, a + Math.PI / 2, .07, TEJA[k % TEJA.length], '#f4efe4', '#ddd5c5', .3 + (k % 3) * .2); }
          break;
        }
      }
      return { x0: L.x * TS - 40, y0: L.y * TS - 40, x1: (L.x + W) * TS + 40, y1: (L.y + H) * TS + 40, ed, casas };
    });
    return this._lmP;
  },
  /* suelo vectorial de cada lugar: fase 0 va bajo las casas (prados, caminos, agua, canchas, estadio, cerros);
     fase 1 va encima (árboles, esculturas, postes, buses, aviones, la rueda de Chicago, las cruces) */
  lugar3(c, L, i, fase) {
    const T = TS, W = L.w, H = L.h, X = t => (L.x + t) * T, Y = t => (L.y + t) * T, S = (L.solids || []).map(([x, y, w, h]) => [x - L.x, y - L.y, w, h]), cx = W / 2, cy = H / 2;
    const [sx, sy, sw, sh] = S[0] || [1, 1, W - 2, H - 2];
    const rr = (tx, ty, tw, th, r, col) => { if (tw <= 0 || th <= 0) return; c.fillStyle = col; c.beginPath(); c.roundRect(X(tx), Y(ty), tw * T, th * T, Math.min(r, tw / 2, th / 2) * T); c.fill(); };
    const el = (tx, ty, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(X(tx), Y(ty), rx * T, ry * T, 0, 0, TAU); c.fill(); };
    const trazo = (P, w, col, dash) => { c.strokeStyle = col; c.lineWidth = w * T; c.setLineDash(dash || []); c.beginPath(); P.forEach(([x, y], k) => k ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y))); c.stroke(); c.setLineDash([]); };
    const bosque = (n, seed, pos, r0, r1, cols) => { for (let k = 0; k < n; k++) { const p = pos(h2(i, k, seed), h2(i, k, seed + 1), k); if (p) arbol(c, X(p[0]), Y(p[1]), ((r0 || .28) + h2(i, k, seed + 2) * (r1 || .2)) * T, (cols || ARB)[(h2(i, k, seed + 3) * (cols || ARB).length) | 0]); } };
    const libre = (tx, ty, ex) => !S.concat(ex || []).some(([x, y, w, h]) => tx > x - .45 && tx < x + w + .45 && ty > y - .45 && ty < y + h + .45);
    const arboleda = (n, seed, x0, y0, x1, y1, ex) => bosque(n, seed, (a, b) => { const tx = x0 + a * (x1 - x0), ty = y0 + b * (y1 - y0); return libre(tx, ty, ex) ? [tx, ty] : null; });
    const fuente = (tx, ty, r) => { el(tx, ty, r, r, '#cfc6b0'); el(tx, ty, r * .82, r * .82, '#b9ae95'); el(tx, ty, r * .66, r * .66, '#4f9bd4'); el(tx - r * .18, ty - r * .2, r * .26, r * .2, '#9fd0f0'); };
    const enlosado = (tx, ty, tw, th, paso) => { c.save(); c.beginPath(); c.rect(X(tx), Y(ty), tw * T, th * T); c.clip(); c.strokeStyle = 'rgba(150,135,105,.3)'; c.lineWidth = .5; c.beginPath(); for (let k = -th; k < tw + th; k += paso) { c.moveTo(X(tx + k), Y(ty)); c.lineTo(X(tx + k + th), Y(ty + th)); c.moveTo(X(tx + k + th), Y(ty)); c.lineTo(X(tx + k), Y(ty + th)); } c.stroke(); c.restore(); };
    // parque de pueblo: cuatro prados con caminos en cruz y fuente al centro; los árboles van en la fase 1
    const parque = (x, y, w, h, seed, n) => {
      if (w < 1.5 || h < 1.2) return; const g = .3, mx = x + w / 2, my = y + h / 2;
      if (fase === 0) {
        for (const [ax, ay] of [[x, y], [mx + g, y], [x, my + g], [mx + g, my + g]]) { rr(ax, ay, w / 2 - g, h / 2 - g, .5, '#5f9e46'); rr(ax + .07, ay + .07, w / 2 - g - .14, h / 2 - g - .14, .45, '#78b65c'); }
        fuente(mx, my, Math.min(.75, h * .2));
      } else bosque(n, seed, (a, b) => { const tx = x + .3 + a * (w - .6), ty = y + .3 + b * (h - .6); return Math.abs(tx - mx) < g + .3 || Math.abs(ty - my) < g + .3 ? null : [tx, ty]; });
    };
    // cerro: círculo con luz del noroeste y curvas de nivel; árboles en anillo; camino en espiral hasta la cima
    const R = Math.min(W, H) / 2 - .2;
    const colina = (c0, c1) => {
      const ox = X(cx), oy = Y(cy), r = R * T, g = c.createRadialGradient(ox - r * .3, oy - r * .35, r * .05, ox, oy, r);
      g.addColorStop(0, c0); g.addColorStop(1, c1); c.fillStyle = g; c.beginPath(); c.arc(ox, oy, r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(20,50,20,.16)'; c.lineWidth = .7; for (const f of [.84, .64, .45, .27]) { c.beginPath(); c.ellipse(ox - r * (1 - f) * .14, oy - r * (1 - f) * .18, r * f, r * f * .95, 0, 0, TAU); c.stroke(); }
    };
    const enCerro = (rmin, n, seed) => bosque(n, seed, (a, b) => { const an = a * TAU, rd = R * (rmin + (1 - rmin) * Math.sqrt(b)) * .94; return [cx + Math.cos(an) * rd, cy + Math.sin(an) * rd]; });
    const espiral = (vueltas, r0) => { const P = []; for (let t = 0; t <= 1.0001; t += .02) { const a = t * TAU * vueltas + 1.1, r = R * (.97 - t * (.97 - r0)); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } trazo(P, .3, '#d9c9a0'); };
    switch (L.k) {
      case 'iglesia':
        if (fase === 0) rr(sx + .85, sy + sh - .15, 2.3, .75, .25, '#cfc6b0');
        parque(.35, sy + sh + .7, W - .7, H - sy - sh - 1, 11, 10);
        if (fase === 1) arboleda(4, 13, .3, .3, W - .3, sy + sh + .4);
        break;
      case 'catedral':
        if (fase === 0) { rr(sx + 1.6, sy + sh - .15, 2.8, .7, .25, '#cfc6b0'); fuente(cx, H - .95, .55); enlosado(0, sy + sh + .55, W, H - sy - sh - .55, 1); }
        else arboleda(12, 21, .3, .3, W - .3, H - .3, [[cx - .8, H - 1.8, 1.6, 1.6]]);
        break;
      case 'terminal':
        if (fase === 0) { c.strokeStyle = '#eceae2'; c.lineWidth = .6; c.beginPath(); for (let x = sx + .4; x < sx + sw - .4; x += .95) { c.moveTo(X(x), Y(sy + 1.8)); c.lineTo(X(x + .5), Y(sy + 2.9)); } c.stroke(); }
        else for (let x = sx + .4, k = 0; x + .95 < sx + sw - .3; x += .95, k++) { if (h2(i, k, 23) < .25) continue; const bx = X(x + .72), by = Y(sy + 2.35), a = Math.atan2(1.1, .5), l = 1.15 * T, w = .42 * T; c.save(); c.translate(bx, by); c.rotate(a); c.fillStyle = 'rgba(8,14,30,.25)'; c.beginPath(); c.roundRect(-l / 2 + 2, -w / 2 + 1, l, w, 1.5); c.fill(); const col = BUSES[(h2(i, k, 24) * BUSES.length) | 0]; c.fillStyle = col; c.beginPath(); c.roundRect(-l / 2, -w / 2, l, w, 1.5); c.fill(); c.fillStyle = shade(col, .16); c.fillRect(-l / 2 + 2.2, -w / 2 + 1.1, l - 5.5, w - 2.2); c.fillStyle = '#1f2f45'; c.fillRect(l / 2 - 2.4, -w / 2 + .8, 1.5, w - 1.6); c.restore(); }
        break;
      case 'campus':
        if (fase === 0) { trazo([[.6, .6], [cx, cy], [W - .6, H - .6]], .32, '#e6dfcd'); trazo([[W - .6, .6], [cx, cy], [.6, H - .6]], .32, '#e6dfcd'); el(cx, cy, 1.15, 1.1, '#ddd3b8'); fuente(cx, cy, .6); }
        else arboleda(14, 31, .3, .3, W - .3, H - .3, [[cx - 1.3, cy - 1.3, 2.6, 2.6]]);
        break;
      case 'botanico':
        if (fase === 0) {
          el(W - 2.3, H - 2, 1.85, 1.3, '#87a872'); el(W - 2.3, H - 2, 1.65, 1.1, '#3f86c8'); el(W - 2.65, H - 2.35, .7, .3, '#6fb0e0');
          c.strokeStyle = '#e6dfcd'; c.lineWidth = .32 * T; c.beginPath(); c.moveTo(X(.4), Y(H - .6)); c.bezierCurveTo(X(2.5), Y(H - 3.2), X(1.6), Y(sy + sh + .9), X(sx + sw / 2), Y(sy + sh + .2));
          c.moveTo(X(sx + sw / 2), Y(sy + sh + .2)); c.bezierCurveTo(X(sx + sw + 1), Y(sy + sh + 1.4), X(W - 4.6), Y(H - .7), X(W - .5), Y(H - .4)); c.stroke();
          for (let k = 0; k < 9; k++) el(.7 + h2(i, k, 71) * Math.max(.5, sx - .6), sy + h2(i, k, 72) * (H - sy - 1.2), .24, .17, ['#ff8fc7', '#ffd84a', '#ff6b5a', '#b07cff', '#ffffff'][k % 5]);
        } else arboleda(16, 41, .3, .3, W - .3, H - .3, [[W - 4.3, H - 3.4, 4, 2.8]]);
        break;
      case 'explora':
        if (fase === 0) { enlosado(0, 0, W, H, .8); el(2.5, 5.75, 1, 1, '#9aa7b8'); el(2.5, 5.75, .88, .88, '#f1f3f6'); el(2.5, 5.75, .42, .42, '#7fc3ea'); }
        break;
      case 'estadio':
        if (fase === 0) {   // tazón: muro exterior visto desde el sur, gradería hasta la cancha (más abajo) y la cubierta curva de occidental
          const ox = X(cx), oy = Y(cy), RX = (W / 2 - .35) * T, RY = (H / 2 - .35) * T, hz = 12, top = oy - hz, rxi = RX * .7, ryi = RY * .64, iy = oy - hz * .25;
          c.fillStyle = 'rgba(8,14,30,.22)'; c.beginPath(); c.ellipse(ox + 6, oy + 5, RX, RY, 0, 0, TAU); c.fill();
          c.fillStyle = '#8b95a3'; c.beginPath(); c.ellipse(ox, oy, RX, RY, 0, 0, TAU); c.rect(ox - RX, top, RX * 2, hz); c.fill();
          c.strokeStyle = '#a7b0bc'; c.lineWidth = 1; c.beginPath(); for (let k = 1; k < 24; k++) { const a = k / 24 * Math.PI, x = ox + Math.cos(a) * RX, y = oy + Math.sin(a) * RY; c.moveTo(x, y); c.lineTo(x, y - hz); } c.stroke();
          c.fillStyle = '#bcc3cc'; c.beginPath(); c.ellipse(ox, top, RX, RY, 0, 0, TAU); c.ellipse(ox, iy, rxi, ryi, 0, 0, TAU); c.fill('evenodd');
          c.strokeStyle = '#a2abb6'; c.lineWidth = .6; for (const t of [.2, .4, .6, .8]) { c.beginPath(); c.ellipse(ox, top + (iy - top) * t, RX + (rxi - RX) * t, RY + (ryi - RY) * t, 0, 0, TAU); c.stroke(); }
          c.strokeStyle = '#e8ebef'; c.lineWidth = .7; c.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; c.moveTo(ox + Math.cos(a) * RX, top + Math.sin(a) * RY); c.lineTo(ox + Math.cos(a) * rxi, iy + Math.sin(a) * ryi); } c.stroke();
          c.fillStyle = '#4e9a3c'; c.beginPath(); c.ellipse(ox, iy, rxi, ryi, 0, 0, TAU); c.fill();
          canchaP(c, ox - rxi * .68, iy - ryi * .67, rxi * 1.36, ryi * 1.34);
          const banda = (x, y) => { c.beginPath(); c.ellipse(x, y, RX * 1.01, RY * 1.01, 0, Math.PI * .72, Math.PI * 1.28); c.ellipse(x, y, RX * .84, RY * .8, 0, Math.PI * 1.28, Math.PI * .72, true); c.closePath(); c.fill(); };
          c.fillStyle = 'rgba(8,14,30,.18)'; banda(ox + 3, top + 3); c.fillStyle = '#eef1f4'; banda(ox, top - 3);
          c.strokeStyle = '#d5dae1'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(ox, top, RX, RY, 0, 0, TAU); c.stroke();
        }
        break;
      case 'botero':
        if (fase === 0) enlosado(0, sy + sh, W, H - sy - sh, 1);
        else {
          for (let k = 0; k < 9; k++) {   // esculturas de bronce, gorditas, sobre su pedestal
            const x = X(1 + (k % 5) * 1.45 + (k > 4 ? .72 : 0)), y = Y(sy + sh + 1.25 + (k > 4 ? 1.75 : 0)), ac = k % 3 === 1;
            c.fillStyle = 'rgba(8,14,30,.25)'; c.beginPath(); c.ellipse(x + 3, y + 1.5, ac ? 6 : 4, 2, 0, 0, TAU); c.fill();
            c.fillStyle = '#cbbf9f'; c.beginPath(); c.roundRect(x - (ac ? 5 : 3.5), y - 1.5, ac ? 10 : 7, 3, 1); c.fill();
            const by = y - (ac ? 3.4 : 5.4); c.fillStyle = '#4a3a2a'; c.beginPath(); c.ellipse(x, by, ac ? 5 : 3.2, ac ? 2.5 : 4, 0, 0, TAU); c.fill();
            c.beginPath(); c.arc(ac ? x - 4.6 : x, ac ? by - 1.4 : by - 5, 1.7, 0, TAU); c.fill();
            c.fillStyle = '#7a6248'; c.beginPath(); c.ellipse(x - 1, by - 1.2, ac ? 2.2 : 1.4, ac ? 1 : 1.8, 0, 0, TAU); c.fill();
          }
          arboleda(3, 51, .4, H - 1, W - .4, H - .3);
        }
        break;
      case 'coltejer':
        if (fase === 0) { rr(.1, .1, W - .2, H - .2, .45, '#ddd3bd'); enlosado(.1, .1, W - .2, H - .2, .6); }
        break;
      case 'teatro':
        if (fase === 0) rr(.4, sy + sh + .2, W - .8, H - sy - sh - .4, .4, '#78b65c'); else arboleda(5, 61, .3, .3, W - .3, H - .3);
        break;
      case 'mamm':
        if (fase === 0) rr(.4, sy + sh + .35, W - .8, H - sy - sh - .7, .55, '#78b65c'); else arboleda(8, 71, .3, .3, W - .3, H - .3);
        break;
      case 'palacio':
        if (fase === 0) enlosado(0, 0, W, H, .7); else arboleda(3, 81, .3, sy + sh + .2, W - .3, H - .3);
        break;
      case 'memoria':
        if (fase === 0) { rr(.3, sy + sh + .3, W - .6, H - sy - sh - .55, .55, '#78b65c'); rr(sx + sw + .3, .4, W - sx - sw - .6, H - .8, .3, '#ddd3b8'); }
        else arboleda(8, 91, .3, sy + sh + .3, W - .3, H - .3);
        break;
      case 'depot':
        if (fase === 0) { rr(.3, sy + sh + .3, W - .6, H - sy - sh - .55, .3, '#bdb8ae'); c.strokeStyle = '#eceae2'; c.lineWidth = .6; c.beginPath(); for (let x = 1; x < W - .5; x += 1.6) { c.moveTo(X(x), Y(sy + sh + .5)); c.lineTo(X(x), Y(Math.min(H - .4, sy + sh + 2.2))); } c.stroke(); }
        break;
      case 'deporte':
        if (fase === 0) {
          canchaP(c, X(.75), Y(.75), 5 * T, 3.25 * T);
          rr(1.1, 5, 4.5, 2.7, .3, '#dfe7ec'); rr(1.3, 5.2, 4.1, 2.3, .2, '#45a8dc'); for (let k = 1; k < 6; k++) trazo([[1.45, 5.2 + k * .38], [5.25, 5.2 + k * .38]], .04, '#ffffff', [3, 3]);
          rr(6.7, 4.8, 4.5, 3, .35, '#c9573f'); c.strokeStyle = '#f4f4f4'; c.lineWidth = .6; c.strokeRect(X(7.1), Y(5.2), 3.7 * T, 2.2 * T); trazo([[8.95, 5.2], [8.95, 7.4]], .04, '#f4f4f4');
        } else arboleda(9, 111, .2, .2, W - .2, H - .2, [[.6, .6, 5.3, 3.5], [1.1, 4.9, 4.6, 3], [6.6, 4.7, 4.7, 3.4]]);
        break;
      case 'parquenorte': {
        const P = []; for (let k = 0; k <= 72; k++) { const a = k / 72 * TAU; P.push([7.5 + Math.cos(a) * 1.85 + Math.sin(a * 3) * .28, 4 + Math.sin(a) * 3 + Math.cos(a * 2) * .3]); }
        if (fase === 0) {   // montaña rusa en alto: sombra, soportes y rieles amarillos
          c.strokeStyle = 'rgba(8,14,30,.2)'; c.lineWidth = 2.6; c.beginPath(); P.forEach(([x, y], k) => k ? c.lineTo(X(x) + 4, Y(y) + 2) : c.moveTo(X(x) + 4, Y(y) + 2)); c.stroke();
          c.strokeStyle = '#8a95a3'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < P.length; k += 3) { c.moveTo(X(P[k][0]), Y(P[k][1])); c.lineTo(X(P[k][0]), Y(P[k][1]) - 5); } c.stroke();
          c.strokeStyle = '#d39c1e'; c.lineWidth = 2.4; c.beginPath(); P.forEach(([x, y], k) => k ? c.lineTo(X(x), Y(y) - 5) : c.moveTo(X(x), Y(y) - 5)); c.stroke();
          c.strokeStyle = '#ffc93c'; c.lineWidth = 1.2; c.stroke();
          c.fillStyle = '#ff6b5a'; for (let k = 0; k < 4; k++) { const [x, y] = P[10 + k * 2]; c.beginPath(); c.arc(X(x), Y(y) - 5, 1.7, 0, TAU); c.fill(); }
        } else {   // rueda de Chicago de pie, con sus cabinas de colores
          const hx = X(sx + sw / 2), base = Y(sy + sh - .3), r = Math.min(sw, sh) * .42 * T, hy = base - r - 4;
          c.fillStyle = 'rgba(8,14,30,.18)'; c.beginPath(); c.ellipse(hx + r * .5, base + 2, r * .9, r * .25, 0, 0, TAU); c.fill();
          c.strokeStyle = '#8a95a3'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx - r * .55, base); c.lineTo(hx, hy); c.lineTo(hx + r * .55, base); c.stroke();
          c.strokeStyle = '#ffffff'; c.lineWidth = 1.4; c.beginPath(); c.arc(hx, hy, r, 0, TAU); c.stroke(); c.strokeStyle = '#ff6b5a'; c.lineWidth = .8; c.beginPath(); c.arc(hx, hy, r - 1.3, 0, TAU); c.stroke();
          c.strokeStyle = '#d6dde6'; c.lineWidth = .5; c.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; c.moveTo(hx, hy); c.lineTo(hx + Math.cos(a) * r, hy + Math.sin(a) * r); } c.stroke();
          for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; c.fillStyle = ['#ffd84a', '#56c7ff', '#9bd341', '#ff8fc7'][k % 4]; c.beginPath(); c.roundRect(hx + Math.cos(a) * r - 1.6, hy + Math.sin(a) * r, 3.2, 3, .8); c.fill(); }
          c.fillStyle = '#5a6472'; c.beginPath(); c.arc(hx, hy, 1.6, 0, TAU); c.fill();
          arboleda(8, 101, .3, .3, W - .3, H - .3, [[5, .4, W - 5.2, H - .8]]);
        }
        break;
      }
      case 'lleras': {   // parque redondo: prado, sendero en anillo con radios y fuente; árboles alrededor
        const rx = W / 2 - .35, ry = H / 2 - .35;
        if (fase === 0) {
          el(cx, cy, rx, ry, '#5f9e46'); el(cx, cy, rx - .08, ry - .08, '#78b65c');
          c.strokeStyle = '#e6dfcd'; c.lineWidth = .34 * T; c.beginPath(); c.ellipse(X(cx), Y(cy), rx * .62 * T, ry * .62 * T, 0, 0, TAU);
          for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .785; c.moveTo(X(cx + Math.cos(a) * rx * .62), Y(cy + Math.sin(a) * ry * .62)); c.lineTo(X(cx + Math.cos(a) * rx), Y(cy + Math.sin(a) * ry)); } c.stroke();
          el(cx, cy, 1, .9, '#ddd3b8'); fuente(cx, cy, .55);
        } else bosque(L.id === 'lleras' ? 14 : 11, 131, a => { const an = a * TAU, f = .8 + h2(i, (a * 1e4) | 0, 132) * .14; return [cx + Math.cos(an) * rx * f, cy + Math.sin(an) * ry * f]; });
        break;
      }
      case 'pies':   // jardín zen de arena rastrillada, espejos de agua y bosque de bambú
        if (fase === 0) {
          rr(.6, .6, 4, 3, .7, '#e6d29a'); c.strokeStyle = '#d2bc84'; c.lineWidth = .5; for (let k = 1; k < 5; k++) { c.beginPath(); c.ellipse(X(2.6), Y(2.1), k * .45 * T, k * .32 * T, 0, 0, TAU); c.stroke(); } el(2.6, 2.1, .32, .24, '#9a9284');
          for (const y of [.7, 2]) { rr(5, y, 3.4, .8, .4, '#3f86c8'); c.strokeStyle = '#9fd0f0'; c.lineWidth = .5; c.beginPath(); for (let x = 5.3; x < 8.2; x += .5) { c.moveTo(X(x), Y(y + .32)); c.quadraticCurveTo(X(x + .12), Y(y + .22), X(x + .25), Y(y + .32)); } c.stroke(); }
          rr(.8, 4.1, W - 1.6, H - 4.5, .8, '#5f9e46');
        } else bosque(46, 141, (a, b) => [1 + a * (W - 2), 4.35 + b * (H - 5)], .14, .1, ['#6fae45', '#5a9a3a', '#7fbf52', '#4e8f36']);
        break;
      case 'luces':   // los postes de luz: sombra, poste blanco y luminaria (de pie, como las fachadas)
        if (fase === 0) enlosado(0, 0, W, H, .85);
        else {
          const P = []; for (let ty = .55; ty < H - .2; ty += .85) for (let tx = .55; tx < W - .2; tx += .85) P.push([X(tx), Y(ty)]);
          c.strokeStyle = 'rgba(8,14,30,.22)'; c.lineWidth = 1; c.beginPath(); for (const [x, y] of P) { c.moveTo(x, y); c.lineTo(x + 5, y + 2.2); } c.stroke();
          c.strokeStyle = '#eef1f4'; c.lineWidth = 1.1; c.beginPath(); for (const [x, y] of P) { c.moveTo(x, y); c.lineTo(x, y - 9); } c.stroke();
          c.fillStyle = '#ffffff'; c.beginPath(); for (const [x, y] of P) { c.moveTo(x + 1.2, y - 9); c.arc(x, y - 9, 1.2, 0, TAU); } c.fill();
        }
        break;
      case 'aeropuerto':
        if (fase === 0) {
          rr(cx - 1.65, .35, 3.3, H - .7, 1.65, '#474c56');
          c.strokeStyle = '#f4f4f4'; c.lineWidth = .6; c.beginPath(); c.roundRect(X(cx - 1.4), Y(.6), 2.8 * T, (H - 1.2) * T, 1.4 * T); c.stroke();
          trazo([[cx, 2.6], [cx, H - 2.6]], .07, '#f4f4f4', [7, 7]);
          for (let k = 0; k < 6; k++) { rr(cx - 1.18 + k * .42, 1, .22, 1.1, .05, '#f4f4f4'); rr(cx - 1.18 + k * .42, H - 2.1, .22, 1.1, .05, '#f4f4f4'); }
          rr(cx + 1.95, 3.4, 1.1, H - 6.8, .55, '#5a606c'); for (const y of [3.4, 10.6, H - 4.3]) rr(cx + 1.3, y, 1.2, .9, .3, '#5a606c');
          trazo([[cx + 2.5, 3.8], [cx + 2.5, H - 3.8]], .06, '#e8c64a');
          rr(cx + 2.9, 6.6, W - cx - 3.05, 8.8, .3, '#8e929a');
        } else {
          const avion = (tx, ty, a, s) => {
            const forma = () => { c.beginPath(); c.roundRect(-1.4, -9, 2.8, 18, 1.4); c.moveTo(-9, 1); c.lineTo(9, 1); c.lineTo(1.4, -3); c.lineTo(-1.4, -3); c.closePath(); c.moveTo(-3.6, 8.6); c.lineTo(3.6, 8.6); c.lineTo(1, 6.2); c.lineTo(-1, 6.2); c.closePath(); };
            c.save(); c.translate(X(tx) + 3, Y(ty) + 4); c.rotate(a); c.scale(s, s); c.fillStyle = 'rgba(8,14,30,.22)'; forma(); c.fill(); c.restore();
            c.save(); c.translate(X(tx), Y(ty)); c.rotate(a); c.scale(s, s); c.fillStyle = '#f4f7fa'; forma(); c.fill(); c.fillStyle = '#2e9d55'; c.fillRect(-1.4, 6.4, 2.8, 2.2); c.fillStyle = '#1f2f45'; c.fillRect(-1, -8, 2, 1.4); c.restore();
          };
          avion(cx + 3.6, 9.2, Math.PI / 2, .95); avion(cx + 3.6, 12.6, Math.PI / 2, .85); avion(cx, H * .62, 0, 1.15);
        }
        break;
      case 'comuna13':
        if (fase === 0) {
          rr(.15, .15, W - .3, H - .3, .6, '#c4b39a');
          const P = []; for (let s = 0; s < 4; s++) { const x = .7 + s * 2.45 + 1.15, y = H - 1.7 - s * 2.05 + .31, ux = Math.cos(-.3) * 1.15, uy = Math.sin(-.3) * 1.15; P.push([x - ux, y - uy], [x + ux, y + uy]); }
          trazo(P, .3, '#e6dfcd'); trazo(P, .06, '#b9ae95', [2, 2]);
        } else arboleda(6, 151, .3, .3, W - .3, H - .3);
        break;
      case 'bibespana':
        if (fase === 0) { rr(.15, .15, W - .3, H - .3, .6, '#c4b39a'); rr(.8, 5.9, W - 1.6, 1.3, .4, '#ddd3bd'); }
        else arboleda(5, 161, .3, H - 1.6, W - .3, H - .3, [[.8, 5.9, W - 1.6, 1.3]]);
        break;
      case 'volador': case 'cerro': case 'cruces': case 'moravia': {
        const top = L.k === 'cerro' ? .32 : L.k === 'cruces' ? .22 : .14, mor = L.k === 'moravia';
        if (fase === 0) {
          colina(mor ? '#86c466' : '#5aa04c', mor ? '#4e8f3e' : '#2f6b3a');
          if (!mor) espiral(L.k === 'cerro' ? 1.2 : 1.6, top + .06);
          if (L.k === 'cerro') { el(cx, cy + .3, 1.35, 1.25, '#ddd3bd'); fuente(cx, cy + .45, .42); }
          else if (L.id === 'nacimiento') { el(cx, cy, 1.2, .85, '#87a872'); el(cx, cy, 1.02, .68, '#3f86c8'); trazo([[cx + .4, cy + .6], [cx + .9, cy + 2.4], [cx + .4, cy + 4.2], [cx + 1.1, H - .3]], .16, '#4f9bd4'); }
          else if (!mor) el(cx, cy, 1.05, .95, '#d9c9a0');
          if (mor) for (let k = 0; k < 6; k++) { c.strokeStyle = ['#ff8fc7', '#ffd84a', '#ff6b5a', '#b07cff', '#ffffff', '#ffb347'][k]; c.lineWidth = .32 * T; c.beginPath(); c.ellipse(X(cx), Y(cy + .5), (1 + k * .45) * T, (.8 + k * .4) * T, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
        } else {
          enCerro(top + .1, mor ? 10 : 46, 121);
          if (L.k === 'cruces') for (const [dx, dy, s] of [[-1.1, .35, .85], [0, -.25, 1], [1.1, .35, .85]]) {   // las tres cruces blancas, de pie
            const x = X(cx + dx), y = Y(cy + dy), h = 13 * s;
            c.strokeStyle = 'rgba(8,14,30,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + h * .55, y + h * .25); c.stroke();
            c.fillStyle = '#d9d5ca'; c.fillRect(x - 1.1, y - h, 2.2, h); c.fillRect(x - 4.2 * s, y - h * .78, 8.4 * s, 2);
            c.fillStyle = '#ffffff'; c.fillRect(x - 1.1, y - h, 1.1, h); c.fillRect(x - 4.2 * s, y - h * .78, 8.4 * s, 1);
          }
        }
        break;
      }
    }
  }
});

/* techos propios de los lugares, en el sentido del cuerpo y con la cumbrera más alta que el alero:
   dos aguas, cuatro aguas, aguja, cúpula, claustro, claraboyas, flores de madera, dientes de sierra, ajedrez… */
function techoLM(c, b, rx, ry, p, nb, px, py, f, K) {
  const N = col => p[col] || (p[col] = nb ? mixHex(col, '#0b1430', nb * .17) : col), SH = (col, k) => N(shade(col, k));
  const ux = rx[1] - rx[0], uy = ry[1] - ry[0], vx = rx[3] - rx[0], vy = ry[3] - ry[0], w = Math.hypot(ux, uy), h = Math.hypot(vx, vy);
  const at = (a, d) => [rx[0] + ux * a + vx * d, ry[0] + uy * a + vy * d];
  const up = (P, dz) => { const g = (1 + K * (b.z + dz)) / f; return [px + (P[0] - px) * g, py + (P[1] - py) * g]; };   // el mismo punto, más alto
  const poly = (P, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(P[0][0], P[0][1]); for (let k = 1; k < P.length; k++) c.lineTo(P[k][0], P[k][1]); c.closePath(); c.fill(); };
  const lejos = F => F.map(([P, col]) => { let x = 0, y = 0; for (const q of P) { x += q[0]; y += q[1]; } return [P, col, Math.hypot(x / P.length - px, y / P.length - py)]; }).sort((a, q) => q[2] - a[2]).forEach(([P, col]) => poly(P, col));   // de la cara más lejana a la más cercana
  const mx = (rx[0] + rx[2]) / 2, my = (ry[0] + ry[2]) / 2;
  const cupula = (r, col, tip) => { const A = up([mx, my], .14), hx = (mx + A[0]) / 2, hy = (my + A[1]) / 2; c.fillStyle = SH(col, -.18); c.beginPath(); c.arc(mx, my, r, 0, TAU); c.fill(); c.fillStyle = N(col); c.beginPath(); c.arc(hx, hy, r * .86, 0, TAU); c.fill(); c.fillStyle = SH(col, .25); c.beginPath(); c.arc(hx - r * .25, hy - r * .28, r * .38, 0, TAU); c.fill(); c.fillStyle = N(tip); c.beginPath(); c.arc(A[0], A[1], 1.2, 0, TAU); c.fill(); };
  switch (b.t) {
    case 'dos': {   // a dos aguas: hastiales, la vertiente del norte con luz y la otra en sombra
      const lg = w >= h, R0 = up(lg ? at(0, .5) : at(.5, 0), .1), R1 = up(lg ? at(1, .5) : at(.5, 1), .1);
      lejos(lg ? [[[at(0, 0), at(0, 1), R0], N(b.wa)], [[at(1, 0), at(1, 1), R1], N(b.wa)]] : [[[at(0, 0), at(1, 0), R0], N(b.wa)], [[at(0, 1), at(1, 1), R1], N(b.wa)]]);
      lejos(lg ? [[[at(0, 0), at(1, 0), R1, R0], SH(b.roof, .1)], [[at(0, 1), at(1, 1), R1, R0], SH(b.roof, -.16)]] : [[[at(0, 0), at(0, 1), R1, R0], SH(b.roof, .06)], [[at(1, 0), at(1, 1), R1, R0], SH(b.roof, -.14)]]);
      c.strokeStyle = SH(b.roof, .3); c.lineWidth = .8; c.beginPath(); c.moveTo(R0[0], R0[1]); c.lineTo(R1[0], R1[1]); c.stroke();
      break;
    }
    case 'cuatro': {   // a cuatro aguas: cumbrera corta y cuatro faldones con su luz
      const lg = w >= h, t = Math.min(.45, (lg ? h / w : w / h) / 2), R0 = up(lg ? at(t, .5) : at(.5, t), .12), R1 = up(lg ? at(1 - t, .5) : at(.5, 1 - t), .12), C = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
      const F = lg ? [[C[0], C[1], R1, R0], [C[1], C[2], R1], [C[2], C[3], R0, R1], [C[3], C[0], R0]] : [[C[0], C[1], R0], [C[1], C[2], R1, R0], [C[2], C[3], R1], [C[3], C[0], R0, R1]];
      lejos(F.map((P, k) => [P, SH(b.roof, [.1, -.08, -.18, .04][k])]));
      c.strokeStyle = SH(b.roof, .28); c.lineWidth = .7; c.beginPath(); c.moveTo(R0[0], R0[1]); c.lineTo(R1[0], R1[1]); for (let k = 0; k < 4; k++) { const R = (lg ? k === 0 || k === 3 : k < 2) ? R0 : R1; c.moveTo(C[k][0], C[k][1]); c.lineTo(R[0], R[1]); } c.stroke();
      break;
    }
    case 'aguja': {   // pirámide hasta la punta (torres de iglesia y el Coltejer)
      const A = up([mx, my], b.zA || .3), C = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
      lejos([0, 1, 2, 3].map(k => [[C[k], C[(k + 1) & 3], A], SH(b.roof, [.08, -.1, -.22, .02][k])]));
      if (b.tip) { c.fillStyle = N(b.tip); c.beginPath(); c.arc(A[0], A[1], 1.1, 0, TAU); c.fill(); }
      break;
    }
    case 'cupula': cupula(Math.min(w, h) * .36, b.roof, '#e8e6de'); break;
    case 'claustro': poly([at(.3, .3), at(.7, .3), at(.7, .7), at(.3, .7)], N(b.patio || '#6aa94f')); poly([at(.3, .3), at(.7, .3), at(.7, .37), at(.3, .37)], 'rgba(8,14,30,.22)'); break;
    case 'claraboya': for (let a = .08; a < .9; a += .14) poly([at(a, .18), at(a + .07, .18), at(a + .07, .82), at(a, .82)], N('#b8d4e6')); break;
    case 'flores': {   // orquideorama: flores hexagonales de madera
      const r = Math.min(w, h) * .17; c.lineWidth = .6; c.strokeStyle = N('#8e6230');
      for (const [a, d] of [[.18, .3], [.5, .3], [.82, .3], [.34, .72], [.66, .72]]) { const [x, y] = at(a, d); c.fillStyle = N('#e2b57c'); c.beginPath(); for (let k = 0; k < 6; k++) { const an = k / 6 * TAU + .52; k ? c.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r) : c.moveTo(x + Math.cos(an) * r, y + Math.sin(an) * r); } c.closePath(); c.fill(); c.stroke(); c.fillStyle = N('#a8743c'); c.beginPath(); c.arc(x, y, r * .3, 0, TAU); c.fill(); }
      break;
    }
    case 'dientes': { const n = Math.max(3, Math.round(w / 8)); for (let k = 0; k < n; k++) poly([at(k / n, 0), at((k + .45) / n, 0), at((k + .45) / n, 1), at(k / n, 1)], SH(b.roof, -.18)); break; }
    case 'ajedrez': { const n = 12; for (let k = 0; k < n; k++) for (const [d0, d1, s] of [[0, .12, 0], [.88, 1, 1]]) poly([at(k / n, d0), at((k + 1) / n, d0), at((k + 1) / n, d1), at(k / n, d1)], N((k + s) % 2 ? '#1d1d1d' : '#f1f1f1')); cupula(Math.min(w, h) * .2, '#2a2c30', '#f2c230'); break; }
    case 'encicla': for (let a = .06; a < .92; a += .12) poly([at(a, .16), at(a + .06, .16), at(a + .06, .76), at(a, .76)], N('#7cc142')); poly([at(0, .86), at(1, .86), at(1, 1), at(0, 1)], N('#1f6fb2')); break;
    case 'roca': poly([at(.06, .08), at(.94, .08), at(.94, .2), at(.06, .2)], N('#4a505c')); poly([at(.15, .5), at(.85, .5), at(.85, .56), at(.15, .56)], N('#151a22')); break;
    case 'focos': poly([at(.12, .12), at(.88, .12), at(.88, .88), at(.12, .88)], nb >= 2 ? '#ffe9a0' : N('#7fc3ea')); break;
    case 'escalera': { c.strokeStyle = SH(b.roof, -.25); c.lineWidth = .6; c.beginPath(); for (let a = .1; a < 1; a += .1) { const A = at(a, 0), B = at(a, 1); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); } c.stroke(); break; }
    case 'jardin': poly([at(.1, .14), at(.9, .14), at(.9, .86), at(.1, .86)], N('#6aa94f')); poly([at(.1, .5), at(.9, .5), at(.9, .56), at(.1, .56)], N('#d9d2c2')); break;
  }
  c.lineWidth = .5;
}

/* estación EnCicla en la ciudad 3D: plataforma redondeada con borde verde, anclajes en dos filas con sus bicis
   (dibujo suave, a su tamaño) y tótem o módulo; los avisos (cerrada, dañada, eléctricas) como en pixel */
function estacion3(b, s, x0, y0, bikes, t, ss, off, e) {
  const W = 4 * TS, H = 2 * TS, R = (x, y, w, h, r, col) => { b.fillStyle = col; b.beginPath(); b.roundRect(x, y, w, h, r); b.fill(); };
  R(x0 + 1, y0 + 1.5, W - 2, H - 3, 5, '#e3ded3'); b.strokeStyle = PAL.vd; b.lineWidth = 1; b.beginPath(); b.roundRect(x0 + 1.5, y0 + 2, W - 3, H - 4, 4.5); b.stroke();
  R(x0 + 4, y0 + 14.5, W - 19, 3, 1.5, PAL.vd2); R(x0 + 4, y0 + 14.5, W - 19, 1.1, .6, PAL.vd1);
  const per = Math.ceil(s.cap / 2), sp = Math.min(5, (W - 18) / per), bk = Art.bikeTop(), sc = bk.sc || 1;
  b.imageSmoothingEnabled = true;
  for (let k = 0; k < s.cap; k++) {
    const row = k < per ? 0 : 1, bx = x0 + 5 + (k % per) * sp, by = y0 + (row ? 18.5 : 5);
    R(bx + .9, row ? y0 + 17 : y0 + 12.5, 1.2, 2, .5, '#59606c');
    if (k < bikes) b.drawImage(bk, bx - .4, by - 1, bk.width / sc * 1.3, bk.height / sc * 1.3); else { b.fillStyle = '#9aa7b8'; b.beginPath(); b.arc(bx + 1.5, by + 4, .9, 0, TAU); b.fill(); }
  }
  b.imageSmoothingEnabled = false;
  if (s.type === 'm') { R(x0 + W - 13, y0 + 5, 10, 15, 2, '#1d2c44'); R(x0 + W - 13, y0 + 4, 10, 2.4, 1.2, '#e9eef3'); R(x0 + W - 11, y0 + 9, 6, 3.5, 1, '#9fb8cf'); R(x0 + W - 13, y0 + 19, 10, 2, 1, PAL.vd); }
  else { R(x0 + W - 10.5, y0 + 6, 6, 13, 2, '#2b2f38'); b.fillStyle = (t * 2 | 0) % 2 ? PAL.vd : PAL.vd1; b.beginPath(); b.arc(x0 + W - 7.5, y0 + 9.5, 1.6, 0, TAU); b.fill(); R(x0 + W - 9, y0 + 13.5, 3, 1, .5, '#9aa7b8'); }
  if (off) R(x0 + 1, y0 + 1.5, W - 2, H - 3, 5, '#0a234299');
  if (e) { b.fillStyle = e[0] ? '#ffd84a' : '#8a8a8a'; b.beginPath(); b.moveTo(x0 + W - 12, y0 + 1); b.lineTo(x0 + W - 15, y0 + 5); b.lineTo(x0 + W - 13, y0 + 5); b.lineTo(x0 + W - 14, y0 + 8.5); b.lineTo(x0 + W - 10.5, y0 + 3.6); b.lineTo(x0 + W - 12.5, y0 + 3.6); b.closePath(); b.fill(); if (e[1]) R(x0 + 1, y0 + 1.5, W - 2, 8, 4, '#0a234299'); }
  if (ss && ss.broken && (t * 3 | 0) % 2) { b.strokeStyle = PAL.cor; b.lineWidth = 1.6; b.lineCap = 'round'; b.beginPath(); b.moveTo(x0 + 12, y0 + 5); b.lineTo(x0 + 30, y0 + 27); b.moveTo(x0 + 30, y0 + 5); b.lineTo(x0 + 12, y0 + 27); b.stroke(); }
  if (ss && !ss.open) R(x0 + 1, y0 + 1.5, W - 2, H - 3, 5, '#0a234299');
}
