/* =====================================================================
   LA RED COMPLETA DEL METRO, TRAÍDA DE EL METRO (v2.1) · pedido del autor: «usa El Metro para terminar de adaptar las
   estaciones del metro, del metrocable, el tranvía, el tren, el Metroplús y las líneas alternativas, más los alimentadores».
   EnCicla ya tenía el metro A y B, el tranvía T, los 6 metrocables (H, J, K, L, M, P) y el Metroplús 1, 2 y O con el dibujo
   de El Metro (74-sistema.js). Aquí llega lo que faltaba, con los datos de MetroZero (tools/red_metro.js → RED_M):
   - LOS 15 ALIMENTADORES (buses integrados del Metro, rutas C6 y C3): su recorrido por las calles, sus paraderos con el
     código de la ruta y buses que van y vienen parando en cada uno (esperan si el ciclista va delante).
   - LAS LÍNEAS QUE VIENEN: el Metro de la 80 (en obra: vallas y conos en sus estaciones), el Tren del Río a Barbosa y el
     Metrocable a San Antonio de Prado (proyectos), punteadas en el mapa grande con su estado.
   - LAS ESCALERAS ELÉCTRICAS de la Comuna 13, con su señal.
   - LO QUE SE SABE DE CADA ESTACIÓN: al detenerte junto a una estación (metro, tranvía, cable o Metroplús) te cuentan su
     dato una vez (Don Libardo, jefe de estación), sin llenar la pantalla: uno cada 30 s como mucho.
   - EL MAPA GRANDE: todas las líneas con su color; los alimentadores, delgados; las futuras, punteadas.
   ===================================================================== */
const RedM = JE.redM = {
  ok() { return typeof RED_M !== 'undefined' && RED_M && JE.map; },
  armar() {
    if (this.listo || !this.ok()) return; const M = JE.map; this.listo = true;
    const pts = a => { const r = []; for (let i = 0; i < a.length; i += 2) r.push({ x: a[i], y: a[i + 1] }); return r; };
    M.alim = RED_M.alim.map(l => { const P = M.poly(pts(l.p)); P.id = l.id; P.name = l.n; P.col = l.c; P.st = l.st.map(([name, la, lo]) => { const g = geoP(la, lo), pr = M.project(P, g.x, g.y); return { name, px: g.x, py: g.y, s: pr.s }; }).sort((a, b) => a.s - b.s); return P; });
    M.futuras = RED_M.fut.map(l => { const st = l.st.map(([name, la, lo]) => { const g = geoP(la, lo); return { name, px: g.x, py: g.y }; }); const P = M.poly(l.p ? pts(l.p) : st.map(s => ({ x: s.px, y: s.py }))); P.id = l.id; P.name = l.n; P.col = l.c; P.estado = l.estado; P.st = st; return P; });
    M.escaleras = RED_M.esc ? RED_M.esc.st.map(([name, la, lo]) => { const g = geoP(la, lo); return { name, px: g.x, py: g.y }; }) : [];
    /* todas las estaciones con nombre (para los datos): metro, tranvía, cables, Metroplús y escaleras */
    const E = this.est = [], add = (name, x, y, linea) => { if (name && isFinite(x) && isFinite(y) && !E.some(e => e.name === name && Math.abs(e.x - x) < 80)) E.push({ name, x, y, linea }); };
    for (const s of M.metroA || []) add(s.name, s.px, s.py, 'A'); for (const s of M.metroB || []) add(s.name, s.px, s.py, 'B');
    for (const s of (M.tram && M.tram.st) || []) add(s.name, s.px, s.py, 'T');
    for (const c of M.cables || []) { if (c.sn) { add(c.sn[0], c.ax, c.ay, 'cable'); add(c.sn[1], c.bx, c.by, 'cable'); } }
    for (const L of M.mp || []) for (const s of L.st) add(s.name, s.px, s.py, L.id);
    for (const s of M.escaleras) add(s.name, s.px, s.py, 'ESC13');
  },
  dato(name) { const D = RED_M && RED_M.datos; if (!D) return null; if (D[name]) return D[name]; const k = Object.keys(D).find(n => n.toLowerCase() === String(name).toLowerCase()); return k ? D[k] : null; }
};
(function () {
  if (typeof RED_M === 'undefined' || !RED_M) return;
  const _start = Game.start; Game.start = function () { RedM.armar(); return _start.apply(this, arguments); };
  /* ---------- los buses alimentadores: van por su recorrido y paran en cada paradero ---------- */
  Ride.prototype.updAlim = function (dt) {
    const M = this.map; if (!M.alim || !M.alim.length) return; const P = this.p, LB = 12 * PXM, v0 = 34 * WK;
    if (!this.alims) { this.alims = []; for (const L of M.alim) for (let i = 0; i < 2; i++) this.alims.push({ L, s: L.len * (i ? .62 : .12), dir: i ? -1 : 1, wait: this.rng.f() * 3 }); }
    for (const b of this.alims) {
      if (b.wait > 0) { b.wait -= dt; continue; }
      const lejos = Math.abs(this.cam.x - b.L.pts[0].x) + Math.abs(this.cam.y - b.L.pts[0].y) > 9000 && Math.abs(this.cam.x - b.L.pts[b.L.pts.length - 1].x) + Math.abs(this.cam.y - b.L.pts[b.L.pts.length - 1].y) > 9000;
      if (!lejos) { const q = M.at(b.L, b.s, b.dir * 1.8 * PXM), fx = Math.cos(q.a) * b.dir, fy = Math.sin(q.a) * b.dir, dx = P.x - q.x, dy = P.y - q.y, al = dx * fx + dy * fy, lat = Math.abs(-dx * fy + dy * fx); if (al > 0 && al < LB / 2 + 20 && lat < 5) continue; }   // el ciclista va delante: el bus espera
      const prev = b.s; b.s += v0 * b.dir * dt;
      for (const st of b.L.st) if ((prev - st.s) * (b.s - st.s) < 0) { b.wait = 3; b.s = st.s; }
      if (b.s > b.L.len - LB / 2) { b.s = b.L.len - LB / 2; b.dir = -1; b.wait = 5; } if (b.s < LB / 2) { b.s = LB / 2; b.dir = 1; b.wait = 5; }
    }
  };
  const _tr = Ride.prototype.updTrains; Ride.prototype.updTrains = function (dt) { _tr.call(this, dt); if (GFX() === '3d') this.updAlim(dt); };
  /* ---------- en la calle: paraderos, buses, la obra del Metro de la 80 y las escaleras ---------- */
  const _dg = Ride.prototype.drawGround;
  Ride.prototype.drawGround = function (b, ox, oy, inV) {
    _dg.call(this, b, ox, oy, inV); const M = this.map; if (!M.alim) return; const nt = Art.night(this.min || 600) > .5;
    try {
      for (const L of M.alim) for (const st of L.st) { if (!inV(st.px, st.py, 20)) continue; const q = M.at(L, st.s, 4.2 * PXM), x = q.x - ox, y = q.y - oy;
        b.save(); b.translate(x, y); b.rotate(q.a); b.fillStyle = 'rgba(0,0,0,.25)'; b.fillRect(-2.6 * PXM + .8, -.7 * PXM + .8, 5.2 * PXM, 1.6 * PXM); b.fillStyle = '#d9dde2'; b.fillRect(-2.6 * PXM, -.7 * PXM, 5.2 * PXM, 1.6 * PXM); b.fillStyle = L.col; b.fillRect(-2.6 * PXM, -.7 * PXM, 5.2 * PXM, .45 * PXM); b.restore();
        b.fillStyle = L.col; b.beginPath(); b.arc(x + Math.cos(q.a) * 3.2 * PXM, y + Math.sin(q.a) * 3.2 * PXM, .9 * PXM, 0, TAU); b.fill(); b.strokeStyle = '#fff'; b.lineWidth = .5; b.stroke(); }
      if (GFX() === '3d' && this.alims) for (const v of this.alims) { const q = M.at(v.L, v.s, v.dir * 1.8 * PXM); if (!inV(q.x, q.y, 30)) continue; SisSpr.dib(b, 'brt', v.L.col, 12 * PXM, 2.5 * PXM, q.x - ox, q.y - oy, q.a + (v.dir < 0 ? Math.PI : 0), 1, null, nt); }
      for (const F of M.futuras || []) { if (F.estado !== 'en obra') continue; for (const st of F.st) { if (!inV(st.px, st.py, 30)) continue; const x = st.px - ox, y = st.py - oy;   /* valla de obra con franjas y conos */
        b.save(); b.translate(x, y); for (let i = 0; i < 6; i++) { b.fillStyle = i % 2 ? '#ffffff' : '#ff8a3d'; b.fillRect(-9 * PXM + i * 3 * PXM, -1.2 * PXM, 3 * PXM, .8 * PXM); } b.fillStyle = F.col; b.fillRect(-9 * PXM, -.4 * PXM, 18 * PXM, .3 * PXM);
        for (const cx of [-10.5, 10.5]) { b.fillStyle = '#ff6a13'; b.beginPath(); b.moveTo(cx * PXM - 1.1, 1.2); b.lineTo(cx * PXM + 1.1, 1.2); b.lineTo(cx * PXM, -1.8); b.closePath(); b.fill(); } b.restore(); } }
      for (const s of M.escaleras || []) { if (!inV(s.px, s.py, 20)) continue; const x = s.px - ox, y = s.py - oy; b.fillStyle = '#5D6D7E'; b.fillRect(x - 1.6 * PXM, y - 4 * PXM, 3.2 * PXM, 8 * PXM); b.strokeStyle = '#ffffff'; b.lineWidth = .4; for (let k = -3; k <= 3; k++) { b.beginPath(); b.moveTo(x - 1.4 * PXM, y + k * PXM); b.lineTo(x + 1.4 * PXM, y + k * PXM); b.stroke(); } }
    } catch (e) { JE.errors.push('red: ' + e.message); }
  };
  /* ---------- nombres: el paradero con su ruta, la obra y las escaleras (solo los 3 más cercanos, sin encimarse) ---------- */
  const _hud = Ride.prototype.hud;
  Ride.prototype.hud = function (V, opts) {
    _hud.call(this, V, opts); const M = this.map, room = this.lblRoom, P = this.p; if (!M.alim || !room || this.big || (typeof panoOn === 'function' && panoOn(this))) return;
    const L = [], cerca = (x, y) => Math.abs(x - P.x) < 220 && Math.abs(y - P.y) < 320;
    for (const A of M.alim) for (const st of A.st) if (cerca(st.px, st.py)) L.push({ t: '🚌 ' + A.id + ' · ' + st.name, x: st.px, y: st.py, col: A.col });
    for (const F of M.futuras || []) if (F.estado === 'en obra') for (const st of F.st) if (cerca(st.px, st.py)) L.push({ t: '🚧 ' + F.name.replace(/^Línea E – /, '') + ' · ' + st.name + ' (en obra)', x: st.px, y: st.py, col: F.col });
    for (const s of M.escaleras || []) if (cerca(s.px, s.py)) L.push({ t: '↗ ' + s.name, x: s.px, y: s.py, col: '#5D6D7E' });
    L.sort((a, b) => dist(a.x, a.y, P.x, P.y) - dist(b.x, b.y, P.x, P.y));
    for (const l of L.slice(0, 3)) { const q = this.w2s(l.x, l.y), w = l.t.length * 5.6 + 10, y = q.y - 14; if (room(q.x, y, w, 15)) V.text(l.t, q.x, y, { size: 10.5, align: 'center', bg: '#0a2342dd', color: '#fff', pad: 3, border: l.col }); }
  };
  /* ---------- el dato de la estación: al detenerse junto a ella, una vez, sin llenar la pantalla ---------- */
  const _upd = Ride.prototype.update;
  Ride.prototype.update = function (dt, dir) {
    const r = _upd.call(this, dt, dir); if (JE.headless || !RedM.est || !(this.mode && this.mode.free)) return r;
    if ((this._tDato = (this._tDato || 0) - dt) > 0) return r; this._tDato = .6; const P = this.p, S = this.stats_();
    if (P.v > S.max * .2 || Date.now() - (RedM._ult || 0) < 30000) return r;
    let best = null, bd = 30 * PXM; for (const e of RedM.est) { const d = dist(e.x, e.y, P.x, P.y); if (d < bd) { bd = d; best = e; } }
    const vistos = RedM._vistos || (RedM._vistos = new Set()); if (!best || vistos.has(best.name)) return r; const t = RedM.dato(best.name); if (!t) return r;
    vistos.add(best.name); RedM._ult = Date.now(); if (typeof Caras !== 'undefined') Caras.charla('Don Libardo', 'Jefe de estación · ' + best.name, t); else UI.toast('🚉 ' + best.name + ': ' + t);
    return r;
  };
  /* ---------- el mapa grande: alimentadores delgados y líneas futuras punteadas, con su estado ---------- */
  MapView.extra = function (V, c, X, Y, z, zr, vis, line) {
    const M = JE.map; if (!M.alim) return;
    if (zr > .12) for (const L of M.alim) { line(L.pts, Math.max(1, 2.6 * z), L.col + 'cc'); if (zr > .4) for (const st of L.st) { const sx = X(st.px), sy = Y(st.py); if (sx < 0 || sy < 0 || sx > V.w || sy > V.h) continue; c.fillStyle = '#fff'; c.fillRect(sx - 2, sy - 2, 4, 4); c.strokeStyle = L.col; c.lineWidth = 1; c.strokeRect(sx - 2, sy - 2, 4, 4); } }
    c.setLineDash([7, 6]); for (const F of M.futuras || []) { line(F.pts, Math.max(1.5, 5 * z), F.col); } c.setLineDash([]);
    for (const F of M.futuras || []) { const m = F.st[Math.floor(F.st.length / 2)], sx = X(m.px), sy = Y(m.py); if (sx > 10 && sy > 60 && sx < V.w - 10 && sy < V.h - 60) V.text(F.name.replace(/^Línea E – /, '') + ' · ' + F.estado, sx, sy - 8, { size: 10, align: 'center', color: '#fff', bg: F.col + 'dd', pad: 3 }); }
  };
  /* la leyenda del mapa grande dice qué es cada cosa (una vez, al abrirlo) */
  const _abrir = MapView.open; if (typeof _abrir === 'function') MapView.open = function () { const r = _abrir.apply(this, arguments); if (!RedM._ley) { RedM._ley = 1; UI.toast('🗺️ Metro, cables, tranvía, Metroplús y 15 alimentadores; punteadas, las líneas que vienen'); } return r; };
})();
