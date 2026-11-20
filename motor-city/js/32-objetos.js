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
/* 30 piezas de barrio: medidas aproximadas para jugabilidad, no medidas catastrales. */
const TIPOS_OBJ_BARRIO = {
  banca_parque: { r: 0.85, h: 0.85, masa: 75, rebote: 0.12, roce: 5, col: '#6e7f58', col2: '#3b3c38', fijo: true, rompible: false, resistencia: 25 },
  matera_cemento: { r: 0.325, h: 0.65, masa: 90, rebote: 0.18, roce: 2.8, col: '#b6a68c', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 11 },
  bolardo: { r: 0.1, h: 0.78, masa: 55, rebote: 0.18, roce: 5, col: '#737c83', col2: '#3b3c38', fijo: true, rompible: true, resistencia: 14 },
  poste_alumbrado: { r: 0.125, h: 6.5, masa: 210, rebote: 0.18, roce: 5, col: '#b0b7b9', col2: '#3b3c38', fijo: true, rompible: true, resistencia: 16 },
  poste_electrico: { r: 0.16, h: 8, masa: 700, rebote: 0.12, roce: 5, col: '#9a9690', col2: '#3b3c38', fijo: true, rompible: false, resistencia: 90 },
  reja_anden: { r: 1, h: 1.1, masa: 90, rebote: 0.18, roce: 5, col: '#616e74', col2: '#3b3c38', fijo: true, rompible: true, resistencia: 14 },
  moto_parqueada: { r: 1, h: 1.15, masa: 130, rebote: 0.12, roce: 5, col: '#8b6f57', col2: '#3b3c38', fijo: true, rompible: false, resistencia: 75 },
  bici_parqueada: { r: 0.875, h: 1.1, masa: 17, rebote: 0.12, roce: 2.8, col: '#2a7c94', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 50 },
  papelera: { r: 0.2, h: 0.8, masa: 9, rebote: 0.18, roce: 2.8, col: '#38635c', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 6 },
  mesa_cafe: { r: 0.4, h: 0.75, masa: 18, rebote: 0.18, roce: 2.8, col: '#94775e', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 6 },
  silla_plastica: { r: 0.275, h: 0.85, masa: 4, rebote: 0.18, roce: 2.8, col: '#ccbd9c', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 4 },
  sombrilla_comercio: { r: 1.1, h: 2.5, masa: 14, rebote: 0.18, roce: 2.8, col: '#c0a85d', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 5 },
  senal_obra: { r: 0.3, h: 1.1, masa: 5, rebote: 0.18, roce: 2.8, col: '#d78c33', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 4 },
  senal_transito: { r: 0.14, h: 2.2, masa: 35, rebote: 0.18, roce: 5, col: '#b6b6b2', col2: '#3b3c38', fijo: true, rompible: true, resistencia: 12 },
  hidrante: { r: 0.175, h: 0.7, masa: 80, rebote: 0.12, roce: 5, col: '#b64337', col2: '#3b3c38', fijo: true, rompible: false, resistencia: 80 },
  cajon_mercado: { r: 0.3, h: 0.35, masa: 7, rebote: 0.18, roce: 2.8, col: '#91704f', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 5 },
  carrito_ventas: { r: 0.75, h: 1.8, masa: 65, rebote: 0.18, roce: 2.8, col: '#b08551', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 7 },
  barril: { r: 0.3, h: 0.9, masa: 16, rebote: 0.18, roce: 2.8, col: '#626c6f', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 8 },
  llanta: { r: 0.35, h: 0.7, masa: 9, rebote: 0.12, roce: 2.8, col: '#292c2b', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 25 },
  paleta_obra: { r: 0.175, h: 1.6, masa: 3, rebote: 0.18, roce: 2.8, col: '#bc594c', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 3 },
  caja_herramientas: { r: 0.25, h: 0.27, masa: 12, rebote: 0.12, roce: 2.8, col: '#556c70', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 20 },
  tarima: { r: 1, h: 0.35, masa: 65, rebote: 0.18, roce: 2.8, col: '#aa835d', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 12 },
  saco_arena: { r: 0.325, h: 0.25, masa: 25, rebote: 0.12, roce: 2.8, col: '#b4a079', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 35 },
  maleta: { r: 0.21, h: 0.68, masa: 9, rebote: 0.18, roce: 2.8, col: '#3e677f', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 7 },
  maceta_barro: { r: 0.19, h: 0.48, masa: 8, rebote: 0.18, roce: 2.8, col: '#b56e4d', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 4 },
  coche_bebe: { r: 0.45, h: 1.1, masa: 11, rebote: 0.12, roce: 2.8, col: '#5b8086', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 30 },
  canasto: { r: 0.275, h: 0.35, masa: 3, rebote: 0.18, roce: 2.8, col: '#a28859', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 4 },
  escombro: { r: 0.175, h: 0.2, masa: 9, rebote: 0.12, roce: 2.8, col: '#9d9a8e', col2: '#3b3c38', fijo: false, rompible: false, resistencia: 45 },
  escalera_mano: { r: 0.325, h: 1.8, masa: 13, rebote: 0.18, roce: 2.8, col: '#a9afb1', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 7 },
  maceta_colgante: { r: 0.175, h: 1.3, masa: 10, rebote: 0.18, roce: 2.8, col: '#60805a', col2: '#3b3c38', fijo: false, rompible: true, resistencia: 5 }
};
Object.assign(TIPOS_OBJ, TIPOS_OBJ_BARRIO);
class Objetos {
  constructor(mundo, op = {}) {
    this.M = mundo; this.L = []; this.guardado = op.guardado || null;
    this.mundoId = String(op.mundoId || (mundo.meta && (mundo.meta.id || mundo.meta.nombre)) || 'mundo');
    this._repetidos = new Map(); this._ids = new Set();
  }
  /* Coordenadas originales = sector de pertenencia: mover el objeto NO cambia su identidad. */
  poner(tipo, x, y, op = {}) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Coordenadas de objeto inválidas');
    const T = TIPOS_OBJ[tipo] || TIPOS_OBJ.cono, base = tipo + '@' + x.toFixed(2) + ',' + y.toFixed(2);
    const repetido = this._repetidos.get(base) || 0; this._repetidos.set(base, repetido + 1);
    const clave = op.clave == null ? base + '#' + repetido : String(op.clave);
    const id = op.id || (MC.GuardadoSectores ? MC.GuardadoSectores.id(this.mundoId, 'objeto', clave) : this.mundoId + '/objeto/' + encodeURIComponent(clave));
    if (this._ids.has(id)) throw new Error('Objeto duplicado: ' + id);
    const o = Object.assign({ tipo, x, y, z: 0, vx: 0, vy: 0, vz: 0,
      a: op.a ?? h2(x | 0, y | 0, 91) * TAU, va: 0, vuelco: 0, dormido: true,
      roto: false, alterado: false }, T, op);
    o.id = id; o.origenX = x; o.origenY = y;
    const guardado = this.guardado && this.guardado.obtener(x, y, id);
    if (guardado && guardado.tipo === tipo) {
      for (const k of ['x', 'y', 'z', 'vx', 'vy', 'vz', 'a', 'va', 'vuelco']) {
        if (Number.isFinite(guardado[k])) o[k] = guardado[k];
      }
      for (const k of ['dormido', 'roto', 'fijo']) if (typeof guardado[k] === 'boolean') o[k] = guardado[k];
    }
    this.L.push(o); this._ids.add(id); return o;
  }
  /* Se guarda solo lo que se ha movido/roto, nunca todas las piezas del mapa. */
  guardarCambios() {
    if (!this.guardado) return 0;
    let n = 0;
    for (const o of this.L) {
      if (!o.alterado) continue;
      const cambio = { tipo: o.tipo, x: o.x, y: o.y, z: o.z, vx: o.vx, vy: o.vy,
        vz: o.vz, a: o.a, va: o.va, vuelco: o.vuelco, dormido: o.dormido,
        roto: !!o.roto, fijo: !!o.fijo };
      this.guardado.cambiar(o.origenX, o.origenY, o.id, cambio);
      o.alterado = false; n++;
    }
    return n;
  }
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
    if (!Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, .05); const M = this.M, G = 9.81;
    for (const o of this.L) {
      for (const c of cuerpos) {
        const dx = o.x - c.x, dy = o.y - c.y, d = Math.hypot(dx, dy), R = o.r + (c.r || .4); if (d >= R || d < 1e-4 || Math.abs((c.z || 0) - o.z) > o.h + 1.5) continue;
        const nx = dx / d, ny = dy / d, rel = ((c.vx || 0) - o.vx) * nx + ((c.vy || 0) - o.vy) * ny;
        if (o.fijo) {
          /* Barreras ancladas: solo ceden con una colisión fuerte si son deformables. */
          if (rel > (o.resistencia || 12) && o.rompible) {
            o.fijo = false; o.roto = true; o.vuelco = 1; o.dormido = false;
            o.vx = nx * Math.min(3, rel * .15); o.vy = ny * Math.min(3, rel * .15);
            o.alterado = true; MC.emit('golpe', { o, fuerza: rel });
          }
          continue;
        }
        o.x += nx * (R - d); o.y += ny * (R - d); o.alterado = true;  // que no se metan
        if (rel > .2) { const mc = c.masa || 70, J = rel * (1 + o.rebote) * mc / (mc + o.masa); o.vx += nx * J; o.vy += ny * J; o.vz = Math.max(o.vz, Math.min(4.5, J * (o.tipo === 'balon' ? .3 : .18))); o.va += (h2(o.x | 0, o.y | 0, 95) - .5) * J * 2; if (o.tipo === 'cono' || o.tipo === 'valla' || o.tipo === 'caneca') o.vuelco = Math.min(1, o.vuelco + J * .15); o.dormido = false; if (J > 2) MC.emit('golpe', { o, fuerza: J }); }
      }
      if (o.dormido || o.fijo) continue;
      o.alterado = true;
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
      else m.cajaF(p[0], p[1], p[2], o.a, o.r * 2, o.r * 2, o.roto ? o.h * .35 : o.h, c, 0, c2);
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
