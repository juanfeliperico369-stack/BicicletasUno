/* =====================================================================
   OBJETOS FÍSICOS (3.0) · los artilugios del mundo: conos, balones, canecas, cajas y vallas
   Todo en 3 dimensiones (x, y y la altura z): se empujan con impulso según la masa de quien choca, saltan un poco
   con el golpe, caen por gravedad, rebotan, ruedan con roce, chocan con los muros y se duermen quietos (no cuestan).
   Los mismos objetos en todas las cámaras: la 3D los pone en su malla y las vistas 2D los dibujan encima del suelo.
   Uso:
     const O = new MC.Objetos(mundo); O.poner('cono', x, y); O.sembrar(x, y, 260, 40);   // conos en vías, balones en plazas…
     cada cuadro: O.actualizar(dt, [{ x, y, z, r, masa, vx, vy }]); E.objetos = O;
     evento: MC.on('golpe', { o, fuerza }) para sonido, partículas y peso.
   ===================================================================== */
const TIPOS_OBJ = {
  cono: { r: .22, h: .7, masa: 2, rebote: .35, roce: 2.4, col: '#ff6a13', col2: '#f4f4f4' },
  balon: { r: .12, h: .24, masa: .45, rebote: .72, roce: 1.4, col: '#f5f5f5', col2: '#1b1b1b', rueda: true },
  caneca: { r: .32, h: .9, masa: 7, rebote: .2, roce: 3.2, col: '#2e7d32', col2: '#1b4d20' },
  caja: { r: .33, h: .6, masa: 4, rebote: .25, roce: 3.6, col: '#b07a43', col2: '#7a5129' },
  valla: { r: .55, h: 1, masa: 14, rebote: .15, roce: 4.5, col: '#e8e8e8', col2: '#d62828' }
};
class Objetos {
  constructor(mundo) { this.M = mundo; this.L = []; }
  poner(tipo, x, y, op = {}) { const T = TIPOS_OBJ[tipo] || TIPOS_OBJ.cono, o = Object.assign({ tipo, x, y, z: 0, vx: 0, vy: 0, vz: 0, a: op.a ?? h2(x | 0, y | 0, 91) * TAU, va: 0, vuelco: 0, dormido: true }, T, op); this.L.push(o); return o; }
  /* siembra objetos que tengan sentido donde caen: conos y vallas en las vías, balones en plazas, canecas y cajas en andenes */
  sembrar(cx, cy, radio = 260, n = 40, sem = 7) {
    const M = this.M, VIAS = new Set([TT.ROAD, TT.AVE]); let k = 0;
    for (let i = 0; i < n * 8 && k < n; i++) {
      const a = h2(i, sem, 92) * TAU, d = Math.sqrt(h2(i, sem, 93)) * radio, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, t = M.suelo(x, y);
      if (M.edificioEn && M.edificioEn(x, y, .6)) continue; const s = h2(i, sem, 94);
      if (t === TT.PLAZA) { this.poner(s < .6 ? 'balon' : 'caneca', x, y); k++; }
      else if (t === TT.WALK) { this.poner(s < .55 ? 'caneca' : 'caja', x, y); k++; }
      else if (VIAS.has(t) && s < .35) { for (let j = 0; j < 3; j++) this.poner('cono', x + j * 1.2, y + j * .4); this.poner('valla', x - 1.6, y - .5); k += 4; }
    }
    return k;
  }
  en(x0, y0, x1, y1) { return this.L.filter(o => o.x >= x0 && o.x <= x1 && o.y >= y0 && o.y <= y1); }
  /* cuerpos: [{ x, y, z, r, masa, vx, vy }] (el jugador, el tráfico): los que chocan empujan */
  actualizar(dt, cuerpos = []) {
    dt = Math.min(dt, .05); const M = this.M, G = 9.81;
    for (const o of this.L) {
      for (const c of cuerpos) {
        const dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy), R = o.r + (c.r || .4); if (d >= R || d < 1e-4 || Math.abs((c.z || 0) - o.z) > o.h + 1.5) continue;
        const nx = dx / d, ny = dy / d, rel = ((c.vx || 0) - o.vx) * nx + ((c.vy || 0) - o.vy) * ny;
        o.x += nx * (R - d); o.y += ny * (R - d);   // que no se metan
        if (rel > .2) { const mc = c.masa || 70, J = rel * (1 + o.rebote) * mc / (mc + o.masa); o.vx += nx * J; o.vy += ny * J; o.vz = Math.max(o.vz, Math.min(4.5, J * (o.tipo === 'balon' ? .3 : .18))); o.va += (h2(o.x | 0, o.y | 0, 95) - .5) * J * 2; if (o.tipo === 'cono' || o.tipo === 'valla' || o.tipo === 'caneca') o.vuelco = Math.min(1, o.vuelco + J * .15); o.dormido = false; if (J > 2) MC.emit('golpe', { o, fuerza: J }); }
      }
      if (o.dormido) continue;
      o.vz -= G * dt; o.z += o.vz * dt;
      if (o.z <= 0) { o.z = 0; o.vz = Math.abs(o.vz) > 1 ? -o.vz * o.rebote : 0; const f = Math.max(0, 1 - o.roce * dt); o.vx *= f; o.vy *= f; o.va *= f; }
      const nx = o.x + o.vx * dt, ny = o.y + o.vy * dt;
      if (M.edificioEn && M.edificioEn(nx, ny, o.r * .5)) { o.vx *= -o.rebote; o.vy *= -o.rebote; } else { o.x = nx; o.y = ny; }
      o.a += o.va * dt;
      if (o.z === 0 && Math.hypot(o.vx, o.vy) < .05 && Math.abs(o.va) < .05) { o.vx = o.vy = o.va = 0; o.dormido = true; }
    }
  }
  /* 3D: la malla de cada objeto (rel: metros del mundo → GL) */
  malla(m, rel, cerca = null, rango = 160) {
    for (const o of this.L) {
      if (cerca && Math.hypot(o.x - cerca.x, o.y - cerca.y) > rango) continue;
      const p = rel(o.x, o.y, this.M.cota(o.x, o.y) + o.z), c = hex3(o.col), c2 = hex3(o.col2), tumb = o.vuelco > .6;
      if (o.tipo === 'balon') m.esfera(p[0], p[1] + o.r, p[2], o.r, o.r, o.r, c, c2, 9, 0);
      else if (o.tipo === 'cono') { if (tumb) m.cajaF(p[0], p[1], p[2], o.a, o.h, o.r * 1.6, o.r * 1.4, c); else { m.cajaF(p[0], p[1], p[2], o.a, o.r * 2.2, o.r * 2.2, .05, hex3('#222')); m.cil(p[0], p[1] + .05, p[2], o.r, o.h, 6, c, 0); m.cil(p[0], p[1] + o.h * .45, p[2], o.r * .55, o.h * .14, 6, c2, o.r * .45); } }
      else if (o.tipo === 'caneca') { if (tumb) m.cajaF(p[0], p[1], p[2], o.a, o.h, o.r * 2, o.r * 2, c); else { m.cil(p[0], p[1], p[2], o.r, o.h, 7, c, o.r * 1.06, c2); } }
      else if (o.tipo === 'valla') { const h = tumb ? .25 : o.h; m.cajaF(p[0], p[1] + (tumb ? 0 : h * .55), p[2], o.a, o.r * 2, .08, h * .4, c2); m.cajaF(p[0], p[1], p[2], o.a, o.r * 2.1, .5, .08, c); }
      else m.cajaF(p[0], p[1], p[2], o.a, o.r * 2, o.r * 2, o.h, c, 0, c2);
    }
  }
  /* 2D: encima del suelo con la proyección de la vista (aPantalla) y su escala en px por metro */
  dibujar2D(g, aP, z, cerca = null, rango = 120) {
    for (const o of this.L) {
      if (cerca && Math.hypot(o.x - cerca.x, o.y - cerca.y) > rango) continue; const p = aP(o.x, o.y, o.z); if (!p) continue; const r = Math.max(2, o.r * z), [sx, sy] = p;
      g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(sx + r * .3, sy + r * .4 + o.z * z * .3, r * 1.1, r * .7, 0, 0, TAU); g.fill();
      g.fillStyle = o.col; g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = Math.max(1, z * .04);
      if (o.tipo === 'balon') { g.beginPath(); g.arc(sx, sy - r, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = o.col2; g.beginPath(); g.arc(sx, sy - r, r * .35, 0, TAU); g.fill(); }
      else if (o.tipo === 'cono' && o.vuelco < .6) { g.beginPath(); g.moveTo(sx - r, sy); g.lineTo(sx, sy - o.h * z); g.lineTo(sx + r, sy); g.closePath(); g.fill(); g.stroke(); g.fillStyle = o.col2; g.fillRect(sx - r * .45, sy - o.h * z * .55, r * .9, Math.max(1, o.h * z * .12)); }
      else { g.save(); g.translate(sx, sy - r * .6); g.rotate(o.a); g.fillRect(-r, -r * .7, r * 2, r * 1.4); g.strokeRect(-r, -r * .7, r * 2, r * 1.4); g.restore(); }
    }
  }
}
Object.assign(MC, { Objetos, TIPOS_OBJ });
