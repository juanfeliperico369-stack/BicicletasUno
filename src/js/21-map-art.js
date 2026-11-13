/* =====================================================================
   DIBUJOS PIXEL DE LOS LUGARES CON POSTAL (se pintan sobre el mapa real)
   ===================================================================== */
CityMap.landmarkCanvas = function (i) {
    if (this.lmCanvas[i]) return this.lmCanvas[i];
    const L = LANDMARKS[i], W = L.w * 8, H = L.h * 8;   // el dibujo es de 8 px por casilla y se escala al pintarlo
    const cv = Art.mk(W, H, c => {
      const R = (a, b, w, h, col) => prect(c, a, b, w, h, col), cx = W >> 1, cy = H >> 1;
      const trees = (n, seed, area) => { for (let k = 0; k < n; k++) { const tx = area[0] + h2(k, seed) * area[2], ty = area[1] + h2(k, seed + 1) * area[3], g = h2(k, seed + 2); pdisc(c, tx + 1, ty + 1, 3, '#0003'); pdisc(c, tx, ty, 3, g < .15 ? '#f2c230' : g < .25 ? '#e88ab8' : '#3f8a3f'); pdisc(c, tx - 1, ty - 1, 1, '#5fae4f'); } };
      const roofHouse = (x, y, w, h, col) => { R(x, y, w, h, col); R(x, y + h - 1, w, 1, shade(col, -.3)); R(x + w - 1, y, 1, h, shade(col, -.25)); R(x, y, w, 1, shade(col, .2)); };
      switch (L.k) {
        case 'iglesia': case 'lleras': {
          if (L.k === 'iglesia') { const ix = cx - 16, iy = 8; roofHouse(ix, iy, 32, 32, '#b85a36'); R(ix + 12, iy - 2, 8, 36, '#c9683f'); R(ix, iy + 10, 32, 8, '#c9683f'); roofHouse(ix + 10, iy + 30, 12, 8, '#efe9dc'); R(ix + 14, iy + 32, 4, 4, '#9aa7b8'); }
          trees(L.k === 'lleras' ? 14 : 10, i * 7, [4, L.k === 'iglesia' ? 44 : 6, W - 8, H - (L.k === 'iglesia' ? 48 : 12)]);
          if (L.k === 'lleras') { pdisc(c, cx, cy, 6, '#cfc4a6'); pdisc(c, cx, cy, 3, PAL.cie); }
          break;
        }
        case 'terminal': roofHouse(8, 8, W - 16, 24, '#d9dde3'); for (let x = 12; x < W - 16; x += 12) R(x, 10, 6, 20, '#bfc6cf'); for (let k = 0; k < 4; k++) c.drawImage(Art.carTop(k % 2 ? PAL.vd2 : '#e9eef3', 'bus'), 10 + k * 14, 34); break;
        case 'volador': case 'cerro': case 'moravia': case 'cruces': {
          const rr = Math.min(W, H) / 2 - 1;
          pdisc(c, cx, cy, rr, L.k === 'moravia' ? '#4e8f3e' : '#2f6b3a'); pdisc(c, cx - 2, cy - 2, rr * .72, L.k === 'moravia' ? '#62a350' : '#3a7d44'); pdisc(c, cx - 3, cy - 3, rr * .42, L.k === 'moravia' ? '#78b862' : '#4a8f4f');
          for (let k = 0; k < 18; k++) { const a = k / 18 * TAU, d = rr * (.5 + .45 * h2(k, i)); pdisc(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, h2(k, 3) < .2 ? '#f2c230' : '#275a31'); }
          if (L.k === 'cerro') { R(cx - 12, cy - 10, 24, 18, '#d8cfb6'); roofHouse(cx - 10, cy - 8, 8, 6, '#b85a36'); roofHouse(cx + 2, cy - 8, 8, 6, '#c9683f'); roofHouse(cx - 10, cy + 1, 8, 6, '#c9683f'); roofHouse(cx + 1, cy, 10, 7, '#f1ece0'); R(cx + 4, cy - 3, 4, 4, '#f1ece0'); R(cx + 5, cy - 4, 2, 1, '#b85a36'); }
          if (L.k === 'moravia') for (let k = 0; k < 5; k++) R(cx - 16, cy - 12 + k * 6, 32, 2, ['#ff8fc7', '#ffd84a', '#ff6b5a', '#b07cff', '#fff'][k]);
          if (L.k === 'cruces') for (let k = 0; k < 3; k++) { const x0 = cx - 12 + k * 12, y0 = cy - 6 + (k === 1 ? -4 : 0); R(x0 + 1, y0 + 1, 2, 12, '#0005'); R(x0, y0, 2, 12, '#ffffff'); R(x0 - 3, y0 + 3, 8, 2, '#ffffff'); }
          if (L.k === 'volador') { for (let k = 0; k < 40; k++) { const a = k / 40 * TAU * 2, d = rr * k / 44; R(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1, 1, '#c8b88a'); } }
          break;
        }
        case 'campus': {
          for (const [x, y] of [[8, 8], [W - 32, 8], [8, H - 32], [W - 32, H - 32]]) roofHouse(x, y, 24, 24, i % 2 ? '#b4552f' : '#c9c5bd');
          R(cx - 10, cy - 6, 20, 12, '#ddd3b8'); pdisc(c, cx, cy, 4, PAL.cie); trees(10, i * 5, [30, 6, W - 60, H - 12]);
          break;
        }
        case 'botanico': {
          for (let k = 0; k < 7; k++) { const hx = 26 + (k % 3) * 10 + (k > 2 ? 5 : 0) - (k > 5 ? 10 : 0), hy = 18 + Math.floor(k / 3) * 9; pdisc(c, hx, hy, 5, '#a8743c'); pdisc(c, hx, hy, 3, '#c89552'); R(hx, hy, 1, 1, '#6a4420'); }
          trees(16, 77, [4, 52, W - 8, H - 56]); trees(6, 78, [70, 4, 28, 40]); pdisc(c, W - 18, H - 16, 6, PAL.cie);
          break;
        }
        case 'explora': roofHouse(8, 8, 24, 24, '#d8432f'); roofHouse(40, 8, 24, 16, '#e05a3a'); roofHouse(40, 32, 24, 16, '#c43a26'); pdisc(c, 20, 46, 7, '#f1f3f6'); pring(c, 20, 46, 7, '#9aa7b8'); break;
        case 'estadio': {
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const ex = (x - cx) / (cx - 1), ey = (y - cy) / (cy - 1), e = ex * ex + ey * ey;
            if (e <= 1) { let col; if (e > .55) col = (Math.floor(Math.sqrt(e) * 14) % 2) ? '#c9cfd8' : '#8e98a6'; else col = (Math.floor(x / 6) % 2) ? '#4f9a3a' : '#5aa845'; c.fillStyle = col; c.fillRect(x, y, 1, 1); }
            else { c.fillStyle = '#62a350'; c.fillRect(x, y, 1, 1); }
          }
          R(cx, cy - 22, 1, 44, '#f4f4f4'); pring(c, cx, cy, 6, '#f4f4f4'); R(cx - 30, cy - 10, 1, 20, '#f4f4f4'); R(cx + 30, cy - 10, 1, 20, '#f4f4f4');
          break;
        }
        case 'botero': roofHouse(0, 0, W, 16, '#cdb27a'); R(4, 4, W - 8, 2, '#a8894f'); for (let k = 0; k < 9; k++) { const sx = 8 + (k % 5) * 14 + (k > 4 ? 7 : 0), sy = 26 + (k > 4 ? 14 : 0); pdisc(c, sx + 1, sy + 1, 4, '#0003'); pdisc(c, sx, sy, 4, '#5a4632'); pdisc(c, sx - 1, sy - 1, 2, '#7a6248'); } break;
        case 'coltejer': R(0, 0, W, H, '#ddd3b8'); R(4, 6, 24, 36, '#cfd5dc'); for (let y = 8; y < 40; y += 3) R(6, y, 20, 1, '#9fb0c4'); pline(c, 4, 6, 16, 0, '#eef1f4'); pline(c, 28, 6, 16, 0, '#eef1f4'); R(28, 10, 4, 34, '#0003'); break;
        case 'teatro': roofHouse(8, 8, 40, 32, '#a34e2c'); pline(c, 8, 8, 48, 40, '#c46a44'); pline(c, 8, 40, 48, 8, '#8a3f22'); R(26, 22, 4, 4, '#c46a44'); break;
        case 'pies': R(6, 6, 30, 22, '#e6d29a'); R(40, 6, 26, 6, PAL.cie); R(40, 16, 26, 6, PAL.cie); for (let k = 0; k < 14; k++) pdisc(c, 10 + h2(k, 9) * 50, 34 + h2(k, 8) * 16, 2, '#3d7d3a'); break;
        case 'luces': for (let y = 4; y < H; y += 7) for (let x = 4; x < W; x += 7) { R(x + 1, y + 1, 2, 2, '#0002'); R(x, y, 2, 2, '#ffffff'); R(x, y, 1, 1, PAL.vd1); } break;
        case 'mamm': roofHouse(8, 8, 40, 24, '#8e4a2a'); for (let x = 10; x < 46; x += 6) R(x, 10, 2, 20, '#a85b3c'); roofHouse(50, 10, 16, 16, '#9fb8cf'); trees(6, 33, [6, 38, W - 12, H - 42]); break;
        case 'depot': roofHouse(0, 0, W, 16, '#f2f5f8'); for (let x = 2; x < W - 2; x += 10) R(x, 3, 6, 10, PAL.vd); R(0, 15, W, 1, PAL.az2); for (let k = 0; k < 2; k++) { c.save(); c.translate(14 + k * 18, 22); c.drawImage(Art.truckTop(10, 20), 0, 0); c.restore(); } for (let x = 52; x < W - 6; x += 5) c.drawImage(Art.bikeTop(), x, 24); break;
        case 'comuna13': { // ladera de ladrillo, escaleras eléctricas techadas y murales
          R(0, 0, W, H, '#9c5a3c'); for (let k = 0; k < 40; k++) R((h2(k, 1) * (W - 6)) | 0, (h2(k, 2) * (H - 6)) | 0, 5, 4, ['#b45a36', '#c9683f', '#d8d2c4', '#8e959c'][k % 4]);
          for (let s = 0; s < 4; s++) { const x0 = 10 + s * 20, y0 = H - 12 - s * 16; R(x0, y0, 22, 6, '#c9ccd1'); for (let i = 0; i < 22; i += 3) R(x0 + i, y0 + 1, 1, 4, '#8d97a5'); R(x0 - 1, y0 - 3, 24, 3, PAL.amb); }
          ['#ff6b5a', '#56c7ff', '#ffd84a', '#b07cff', '#9bd341', '#ff8fc7'].forEach((col, k) => R(4 + k * 15, 6 + (k % 2) * 4, 12, 5, col));
          break;
        }
        case 'bibespana': { // tres "rocas" oscuras en la montaña
          R(0, 0, W, H, '#3a7d44'); for (let k = 0; k < 30; k++) R((h2(k, 5) * W) | 0, (h2(k, 6) * H) | 0, 4, 3, '#b45a36');
          [[10, 20, 26, 22], [40, 12, 26, 26], [70, 24, 22, 20]].forEach(([x, y, w, h]) => { R(x + 3, y + 3, w, h, '#0005'); R(x, y, w, h, '#2b2f38'); R(x + 2, y + 2, w - 6, 3, '#4a505c'); R(x, y + h - 2, w, 2, '#151a22'); });
          break;
        }
        case 'palacio': { // fachada ajedrezada en blanco y negro
          R(0, 0, W, H, '#ddd3b8'); for (let y = 8; y < 40; y += 4) for (let x = 8; x < W - 8; x += 4) R(x, y, 4, 4, ((x + y) / 4) % 2 ? '#1d1d1d' : '#f1f1f1');
          R(W / 2 - 3, 2, 6, 8, '#1d1d1d'); R(W / 2 - 1, 0, 2, 3, '#1d1d1d');
          break;
        }
        case 'catedral': { // gran iglesia de ladrillo frente al Parque de Bolívar
          R(0, 0, W, H, '#ddd3b8'); R(18, 8, 44, 38, '#a34e2c'); R(30, 4, 20, 46, '#b85a36'); R(18, 22, 44, 10, '#b85a36'); R(36, 0, 8, 10, '#8a3f22'); R(39, -1, 2, 3, '#f2c230');
          trees(10, 91, [4, 52, W - 8, H - 56]);
          break;
        }
        case 'parquenorte': { // rueda de Chicago y montaña rusa
          R(0, 0, W, H, '#62a350'); pring(c, 20, 20, 14, '#ffffff'); pring(c, 20, 20, 13, '#ff6b5a'); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; pline(c, 20, 20, 20 + Math.cos(a) * 13, 20 + Math.sin(a) * 13, '#d6dde6'); R(20 + Math.cos(a) * 13 - 1, 20 + Math.sin(a) * 13 - 1, 3, 3, ['#ffd84a', '#56c7ff', '#9bd341', '#ff8fc7'][k % 4]); }
          for (let x = 40; x < W - 4; x++) R(x, 40 + Math.round(Math.sin(x / 6) * 14), 1, 2, '#ffc93c');
          for (let k = 0; k < 8; k++) pdisc(c, 6 + h2(k, 77) * (W - 12), H - 8 - h2(k, 78) * 10, 3, '#3f8a3f');
          break;
        }
        case 'deporte': { // canchas, coliseo y piscina
          R(0, 0, W, H, '#62a350'); R(6, 6, 40, 26, '#4f9a3a'); R(6, 6, 40, 1, '#fff'); R(6, 31, 40, 1, '#fff'); R(6, 6, 1, 26, '#fff'); R(45, 6, 1, 26, '#fff'); R(25, 6, 1, 26, '#fff'); pring(c, 26, 19, 5, '#fff');
          R(54, 8, 36, 22, '#c9cfd8'); R(56, 10, 32, 18, '#8e98a6'); R(10, 42, 34, 22, PAL.cie); for (let x = 12; x < 44; x += 6) R(x, 42, 1, 22, '#ffffff88'); R(54, 40, 36, 26, '#d8432f');
          break;
        }
        case 'memoria': { // museo y Parque Bicentenario
          R(0, 0, W, H, '#62a350'); roofHouse(8, 8, 40, 24, '#c9c5bd'); R(10, 30, 36, 2, '#59606c'); R(52, 10, 14, 40, '#ddd3b8'); trees(6, 55, [6, 36, W - 12, H - 40]);
          break;
        }
        case 'aeropuerto': {
          R(0, 0, W, H, '#6aa356'); R(cx - 12, 4, 24, H - 8, '#4a505c'); for (let y = 16; y < H - 16; y += 14) R(cx - 1, y, 2, 7, '#f4f4f4');
          for (let k = 0; k < 6; k++) { R(cx - 10 + k * 4, 8, 2, 8, '#f4f4f4'); R(cx - 10 + k * 4, H - 16, 2, 8, '#f4f4f4'); }
          R(cx + 14, 40, 8, H - 80, '#5a606c'); roofHouse(W - 12, 60, 10, 50, '#e9eef3');
          const p = (x, y) => { R(x - 1, y - 8, 3, 16, '#f4f7fa'); R(x - 8, y - 2, 17, 3, '#f4f7fa'); R(x - 3, y + 5, 7, 2, '#f4f7fa'); R(x, y - 8, 1, 2, PAL.vd); };
          p(cx + 18, 130); p(cx, 60);
          break;
        }
      }
    });
    this.lmCanvas[i] = cv; return cv;
  };
