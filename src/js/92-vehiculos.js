/* =====================================================================
   VEHÍCULOS DEL MUNDO LIBRE Y MEJORAS GRÁFICAS (v1.8 · M3 + M5)
   1) M5 · Siete medios de transporte jugables en el valle:
      - bike:        Bicicleta EnCicla / propia (2,90 m × 1,00 m · 4,6 × 1,6 px)
      - ebike:       Bicicleta eléctrica EnCicla (2,95 m × 1,05 m · batería #2fa8dc · sin castigo en subida)
      - scooter:     Patinete clásico de impulso (2,20 m × 0,85 m · tabla aluminio #c9d1db)
      - emonopatin:  Monopatín eléctrico (2,35 m × 0,90 m · chasis grafito #1f242e · pantalla LED #9bd341)
      - skate:       Tabla de skate (2,00 m × 0,80 m · madera de arce #d9a066 · salto ollie con timbre/espacio)
      - patines:     Patines en línea (1,75 m × 0,95 m · botas #1b4d89 y ruedas coral #ff5a36)
      - truck:       Camión de Balance EnCicla (5,60 m × 2,40 m)
      - walk:        A pie (1,70 m × 1,70 m)
   2) M3 · Mejoras gráficas del valle (2D y 3D):
      - Casas de ladera mejoradas: zócalo escalonado de ladrillo en pendiente, escalera exterior con pasamanos,
        voladizo del segundo piso, terraza de plancha con tanque negro Rotoplas y ropa tendida.
      - Interiores detallados de estaciones EnCicla: caseta manual (escritorio, pantalla/planilla, silla,
        chaleco reflectivo colgado, tablero de llaves por colores, tula verde EnCicla, cargador de celular con LED
        y pocillo de tinto) y tótem automático (pantalla Cívica retroiluminada, lector sin contacto con halo verde,
        panel solar superior y anclajes con luces LED de estado).
      - Atmósfera del valle: niebla andina matinal y en aguacero, reflejos especulares en pavimento mojado
        y halos cálidos de alumbrado público + cono de farola delantera de noche.
   ===================================================================== */

const VEH_CATALOGO = [   // la ficha del selector; la física y el dibujo van al registro (25-vehiculos.js), más abajo
  { id: 'bike', name: 'Bici EnCicla', icon: '🚲', mL: 2.9, mW: 1.0, col: '#7ab800', sub: 'Ágil en ciclorrutas · timbre 🔔', free: true },
  { id: 'ebike', name: 'Bici eléctrica', icon: '⚡', mL: 2.95, mW: 1.05, col: '#2fa8dc', sub: 'Motor asistido: sube lomas sin cansarse', free: true },
  { id: 'scooter', name: 'Patinete clásico', icon: '🛴', mL: 2.2, mW: 0.85, col: '#c9d1db', sub: 'Liviano de impulso · entra a plazas y parques', free: true },
  { id: 'emonopatin', name: 'Monopatín eléctrico', icon: '🔋', mL: 2.35, mW: 0.9, col: '#1f242e', sub: 'Rápido en asfalto y ciclorruta · sufre en pasto', free: true },
  { id: 'skate', name: 'Tabla de skate', icon: '🛹', mL: 2.0, mW: 0.8, col: '#d9a066', sub: 'Giros cerrados · botón 🔔 hace salto ollie', free: true },
  { id: 'patines', name: 'Patines en línea', icon: '🛼', mL: 1.75, mW: 0.95, col: '#ff5a36', sub: 'Paso fluido por andenes, parques y ciclovías', free: true },
  { id: 'walk', name: 'A pie', icon: '🚶', mL: 1.7, mW: 1.7, col: '#56c7ff', sub: 'Camina por cualquier andén, puente o sendero', free: true }
];

/* Física de cada vehículo (escalada por WK y VEL en stats_):
   max = velocidad punta, acc = aceleración, brk = frenada, coast = desaceleración libre,
   w0 = giro quieto (rad/s), w1 = giro a tope (rad/s), tw = inercia de giro (s), r = radio de colisión (px),
   up = sensibilidad a las subidas, drain = gasto base de energía en modo libre */
const VSTATS = {
  bike:       { max: 60, acc: 30, brk: 72,  coast: 40,  w0: 5.0, w1: 2.7, tw: .09, r: 2.5,  up: 2.2, drain: 1.0 },
  ebike:      { max: 67, acc: 42, brk: 76,  coast: 38,  w0: 4.8, w1: 2.6, tw: .09, r: 2.55, up: 0.1, drain: 0.35 },
  scooter:    { max: 51, acc: 38, brk: 78,  coast: 46,  w0: 5.8, w1: 3.3, tw: .07, r: 2.2,  up: 2.5, drain: 1.1 },
  emonopatin: { max: 71, acc: 54, brk: 82,  coast: 44,  w0: 5.2, w1: 2.5, tw: .08, r: 2.3,  up: 0.5, drain: 0.3 },
  skate:      { max: 54, acc: 40, brk: 64,  coast: 34,  w0: 6.5, w1: 3.8, tw: .06, r: 2.1,  up: 2.6, drain: 1.05 },
  patines:    { max: 56, acc: 44, brk: 68,  coast: 36,  w0: 6.2, w1: 3.6, tw: .06, r: 2.0,  up: 2.3, drain: 1.0 },
  truck:      { max: 50, acc: 24, brk: 62,  coast: 22,  w0: 2.4, w1: 1.2, tw: .20, r: 4.76, up: 0.9, drain: 0.2 },
  walk:       { max: 26, acc: 90, brk: 170, coast: 120, w0: 7.5, w1: 6.0, tw: .05, r: 2.0,  up: 1.1, drain: 0.34 }
};

/* Multiplicador de velocidad por tipo de suelo (TT) para los nuevos vehículos */
const VSURF = {
  ebike:      { [TT.CICLO]: 1.18, [TT.ROAD]: 1, [TT.AVE]: 1, [TT.AUTO]: .96, [TT.BRIDGE]: 1.05, [TT.WALK]: .76, [TT.GRASS]: .72, [TT.PLAZA]: .88, [TT.LAND]: .62, [TT.STEPS]: .38, [TT.STATION]: .92, [TT.DEPOT]: .95 },
  scooter:    { [TT.CICLO]: 1.15, [TT.ROAD]: .96, [TT.AVE]: .94, [TT.AUTO]: .82, [TT.BRIDGE]: 1.02, [TT.WALK]: .92, [TT.GRASS]: .74, [TT.PLAZA]: .98, [TT.LAND]: .45, [TT.STEPS]: .32, [TT.STATION]: .95, [TT.DEPOT]: .95 },
  emonopatin: { [TT.CICLO]: 1.22, [TT.ROAD]: 1.04, [TT.AVE]: 1.02, [TT.AUTO]: .92, [TT.BRIDGE]: 1.06, [TT.WALK]: .82, [TT.GRASS]: .58, [TT.PLAZA]: .92, [TT.LAND]: .38, [TT.STEPS]: .25, [TT.STATION]: .92, [TT.DEPOT]: .95 },
  skate:      { [TT.CICLO]: 1.16, [TT.ROAD]: .95, [TT.AVE]: .92, [TT.AUTO]: .78, [TT.BRIDGE]: 1.02, [TT.WALK]: .94, [TT.GRASS]: .62, [TT.PLAZA]: 1.06, [TT.LAND]: .34, [TT.STEPS]: .28, [TT.STATION]: .96, [TT.DEPOT]: .96 },
  patines:    { [TT.CICLO]: 1.18, [TT.ROAD]: .96, [TT.AVE]: .94, [TT.AUTO]: .8, [TT.BRIDGE]: 1.04, [TT.WALK]: .96, [TT.GRASS]: .78, [TT.PLAZA]: 1.05, [TT.LAND]: .36, [TT.STEPS]: .3, [TT.STATION]: .96, [TT.DEPOT]: .96 }
};

/* al registro de vehículos (25-vehiculos.js): sus cifras, su suelo, su sensibilidad a las lomas (up), su gasto y su dibujo */
for (const v of VEH_CATALOGO) {
  if (VEHICULOS[v.id]) { Object.assign(VEHICULOS[v.id], { sub: v.sub, mL: v.mL, mW: v.mW }); continue; }   // los de siempre: solo su ficha
  const S = VSTATS[v.id], su = VSURF[v.id], d = { n: v.name, corto: v.name.toLowerCase(), icon: v.icon, sub: v.sub, mL: v.mL, mW: v.mW, timbre: 1, bajar: 1, libre: 0,
    fis: { max: S.max, acc: S.acc, brk: S.brk, coast: S.coast, w0: S.w0, w1: S.w1, tw: S.tw, r: S.r }, loma: [S.up, .5, 1.32], spr: R => Art.vehTop(v.id, R.mode.shirt) };
  if (su) d.suelo = t => su[t] != null ? su[t] : .75;
  if (v.id === 'ebike' || v.id === 'emonopatin') { d.asist = 1; d.gasto = .35 * S.drain; }
  JE.vehiculos.registrar(v.id, d);
}
/* la lista del selector: el catálogo y lo que se registre después con libre: 1 */
const vehLista = () => VEH_CATALOGO.concat(JE.vehiculos.libres().filter(v => !VEH_CATALOGO.some(c => c.id === v.id)).map(v => ({ id: v.id, name: v.n, icon: v.icon, sub: v.sub || '', mL: v.mL || '?', mW: v.mW || '?' })));

/* Sonidos propios por vehículo en WebAudio (sin archivos externos) */
Snd.vehSfx = function (veh, kind) {
  if (!this.on || !this.init()) return;
  if (kind === 'ollie') {
    this.tone(155, .07, 'triangle', .11, 92);
    this.noise(.05, .07);
    setTimeout(() => this.tone(240, .06, 'sine', .08, 130), 65);
    return;
  }
  if (veh === 'ebike' || veh === 'emonopatin') {
    this.tone(veh === 'ebike' ? 520 : 640, .09, 'sine', .08, veh === 'ebike' ? 880 : 980);
    setTimeout(() => this.tone(veh === 'ebike' ? 880 : 980, .11, 'triangle', .07, 1180), 55);
  } else if (veh === 'scooter') {
    this.tone(1480, .14, 'sine', .09);
    setTimeout(() => this.tone(1960, .16, 'sine', .08), 45);
  } else if (veh === 'skate') {
    this.vehSfx('skate', 'ollie');
  } else if (veh === 'patines') {
    this.tone(740, .08, 'triangle', .08, 990);
    setTimeout(() => this.tone(990, .1, 'sine', .07), 50);
  } else {
    this.sfx('bell');
  }
};

/* ---------- Sprites 2D pixelados y vectoriales 4× (ciudad 3D) para cada vehículo ---------- */
Object.assign(Art, {
  vehTop(veh, shirt, helmet, skin) {
    if (veh === 'truck') return this.truckTop(0, 14);
    if (veh === 'walk') return this.walker(0);
    if (veh === 'bike') return this.riderTop(shirt, helmet, skin, PAL.vd);
    const P = Save.data ? Save.data.profile : {};
    shirt = shirt || SHIRTS[P.shirt] || PAL.cor;
    helmet = helmet || (P.helmet === 0 ? (PELO[P.hairCol | 0] || '#2a1a10') : (HELMETS[P.helmet] || '#ffffff'));
    skin = skin || SKINS[P.skin] || '#f0c090';
    const key = 'vtop:' + veh + ':' + shirt + ':' + helmet + ':' + skin + ':' + GFX();
    if (this.cache.has(key)) return this.cache.get(key);
    /* Base pixel art 11×14 px */
    const base = this.mk(11, 14, c => {
      if (veh === 'ebike') {
        prect(c, 5, 0, 1, 3, '#1d1f24'); prect(c, 5, 11, 1, 3, '#1d1f24');
        prect(c, 5, 2, 1, 9, '#9bd341'); prect(c, 4, 4, 3, 4, '#2fa8dc'); /* batería azul cielo */
        prect(c, 5, 0, 1, 1, '#fff6b0'); /* farola LED */
        prect(c, 2, 3, 7, 1, '#2a2d34');
      } else if (veh === 'scooter' || veh === 'emonopatin') {
        const el = veh === 'emonopatin';
        prect(c, 5, 1, 1, 2, '#1d1f24'); prect(c, 5, 11, 1, 2, '#1d1f24');
        prect(c, 4, 3, 3, 8, el ? '#1f242e' : '#c9d1db');
        prect(c, 5, 4, 1, 6, el ? '#ffb300' : '#262b36');
        prect(c, 2, 3, 7, 1, el ? '#1f242e' : '#5b6472');
        if (el) prect(c, 5, 2, 1, 1, '#9bd341'); /* pantalla LED */
      } else if (veh === 'skate') {
        prect(c, 3, 2, 5, 1, '#f4efe2'); prect(c, 3, 11, 5, 1, '#f4efe2'); /* ruedas de uretano */
        prect(c, 4, 1, 3, 12, '#d9a066'); prect(c, 5, 2, 1, 10, '#232730'); /* tabla de arce y lija */
      } else if (veh === 'patines') {
        prect(c, 3, 3, 2, 7, '#1b4d89'); prect(c, 6, 4, 2, 7, '#1b4d89');
        prect(c, 3, 2, 1, 9, '#ff5a36'); prect(c, 7, 3, 1, 9, '#ff5a36');
      }
      /* brazos, hombros y cabeza del jugador */
      if (veh !== 'skate' && veh !== 'patines') {
        prect(c, 2, 4, 2, 2, skin); prect(c, 7, 4, 2, 2, skin);
      } else {
        prect(c, 1, 6, 2, 2, skin); prect(c, 8, 5, 2, 2, skin);
      }
      prect(c, 3, 5, 5, 4, shirt); prect(c, 4, 4, 3, 5, shirt);
      prect(c, 4, 5, 3, 3, helmet); prect(c, 5, 4, 1, 3, '#ffffff');
    });
    if (GFX() !== '3d') { this.cache.set(key, base); return base; }
    /* Versión vectorial 4× para la ciudad 3D */
    const v3 = vsprite(key, base, (x, w, h) => {
      if (veh === 'ebike') {
        ell(x, w / 2, 1.3, .75, 1.3, '#1b1f27'); ell(x, w / 2, h - 1.4, .75, 1.4, '#1b1f27');
        line(x, w / 2, 2.5, w / 2, h - 2.5, 1.1, '#9bd341');
        rrect(x, w / 2 - .85, 4.1, 1.7, 3.6, .6, '#2fa8dc');
        ell(x, w / 2, 1.1, .55, .45, '#fff6b0');
        line(x, 1.6, 3.4, w - 1.6, 3.4, .75, '#30343c');
      } else if (veh === 'scooter' || veh === 'emonopatin') {
        const el = veh === 'emonopatin';
        ell(x, w / 2, 1.3, .65, 1.2, '#1b1f27'); ell(x, w / 2, h - 1.4, .65, 1.2, '#1b1f27');
        rrect(x, w / 2 - 1.35, 2.4, 2.7, h - 4.8, 1.1, el ? '#1f242e' : '#c9d1db');
        rrect(x, w / 2 - .85, 3.3, 1.7, h - 6.6, .6, el ? '#2c3342' : '#262b36');
        if (el) { line(x, w / 2 - 1.1, 3.8, w / 2 - 1.1, h - 3.8, .35, '#ffb300'); line(x, w / 2 + 1.1, 3.8, w / 2 + 1.1, h - 3.8, .35, '#ffb300'); ell(x, w / 2, 2.6, .55, .45, '#9bd341'); }
        line(x, 1.9, 3.1, w - 1.9, 3.1, .75, el ? '#1f242e' : '#5b6472');
      } else if (veh === 'skate') {
        rrect(x, w / 2 - 1.9, 2.4, 3.8, 1.1, .4, '#f4efe2');
        rrect(x, w / 2 - 1.9, h - 3.5, 3.8, 1.1, .4, '#f4efe2');
        rrect(x, w / 2 - 1.65, 1.2, 3.3, h - 2.4, 1.5, '#d9a066');
        rrect(x, w / 2 - 1.25, 2.0, 2.5, h - 4.0, 1.1, '#232730');
      } else if (veh === 'patines') {
        for (const [dx, dy] of [[-1.25, -.6], [1.25, .6]]) {
          rrect(x, w / 2 + dx - .7, h / 2 + dy - 2.8, 1.4, 5.6, .6, '#ff5a36');
          rrect(x, w / 2 + dx - .85, h / 2 + dy - 1.8, 1.7, 3.6, .7, '#1b4d89');
        }
      }
      if (veh === 'skate' || veh === 'patines') {
        line(x, 1.5, 6.8, 3.3, 6.2, .9, skin); line(x, w - 1.5, 5.4, w - 3.3, 6.0, .9, skin);
      } else {
        line(x, 2.1, 5.5, 2.0, 3.3, .9, skin); line(x, w - 2.1, 5.5, w - 2.0, 3.3, .9, skin);
      }
      ell(x, w / 2, 6.4, 2.35, 1.85, shirt);
      ell(x, w / 2, 6.2, 1.48, 1.65, helmet);
      x.fillStyle = '#ffffff55'; x.fillRect(w / 2 - .25, 4.8, .5, 2.8);
    });
    this.cache.set(key, v3);
    return v3;
  },
  /* Dibujo lateral de cada vehículo para la vista panorámica, las postales y la tarjeta de selección */
  vehSide(b, x, y, veh, opts = {}) {
    if (veh === 'bike' || veh === 'ebike') {
      this.bikeSide(b, x, y, Object.assign({ col: veh === 'ebike' ? '#9bd341' : PAL.vd, ebike: veh === 'ebike' }, opts));
      if (veh === 'ebike') { prect(b, x - 2, y - 8, 5, 2, '#2fa8dc'); prect(b, x + 7, y - 13, 2, 2, '#fff6b0'); }
      return;
    }
    if (veh === 'scooter' || veh === 'emonopatin') {
      const el = veh === 'emonopatin';
      pcirc(b, x - 6, y - 2, 2, '#1d1f24'); pcirc(b, x + 6, y - 2, 2, '#1d1f24');
      prect(b, x - 5, y - 3, 10, 2, el ? '#1f242e' : '#c9d1db');
      if (el) prect(b, x - 4, y - 2, 8, 1, '#ffb300');
      pline(b, x + 5, y - 3, x + 4, y - 15, el ? '#1f242e' : '#5b6472');
      prect(b, x + 2, y - 16, 4, 1, '#262b36');
      if (el) prect(b, x + 5, y - 15, 2, 2, '#fff6b0');
      return;
    }
    if (veh === 'skate') {
      pcirc(b, x - 4, y - 1, 1, '#f4efe2'); pcirc(b, x + 4, y - 1, 1, '#f4efe2');
      prect(b, x - 6, y - 3, 12, 1, '#d9a066'); prect(b, x - 7, y - 4, 2, 1, '#d9a066'); prect(b, x + 5, y - 4, 2, 1, '#d9a066');
      return;
    }
    if (veh === 'patines') {
      for (const dx of [-3, 2]) {
        prect(b, x + dx, y - 5, 3, 3, '#1b4d89');
        prect(b, x + dx - 1, y - 2, 5, 1, '#d8dee8');
        prect(b, x + dx - 1, y - 1, 5, 1, '#ff5a36');
      }
    }
  }
});

/* Integración de los 7 vehículos con Ride.prototype.stats_, update, jump/bell y render */
const _rider92 = Art.rider;
Art.rider = function (shirt) {
  const M = Game.mode, R = M && M.ride, v = R && R.p && R.p.veh;
  if (v && v !== 'bike' && v !== 'truck' && v !== 'walk') return this.vehTop(v, shirt);
  if (R && (R.ebike || (M && M.ebike)) && v === 'bike') return this.vehTop('ebike', shirt);
  return _rider92.call(this, shirt);
};

const _stats92 = Ride.prototype.stats_;   // las cifras salen del registro; la bici eléctrica de EnCicla es la bici con el motor encendido
Ride.prototype.stats_ = function () { return this.p.veh === 'bike' && (this.ebike || (this.mode && this.mode.ebike)) ? vehStats('ebike', VEL * velMul(this.mode)) : _stats92.call(this); };

const _upd92 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) {
  const P = this.p, v = P.veh;
  /* Multiplicador específico por superficie y vehículo antes del paso físico */
  _upd92.call(this, dt, dir);   // el suelo de cada vehículo lo da su suelo(t) en el registro
  /* Salto ollie en skate o con rampa */
  if (this.ollieT > 0) {
    this.ollieT = Math.max(0, this.ollieT - dt);
    P.z = Math.max(P.z || 0, Math.sin((this.ollieT / .42) * Math.PI) * .12);
  }
  /* Bici eléctrica y monopatín eléctrico mantienen el ritmo en las subidas */
  if ((v === 'ebike' || v === 'emonopatin') && this.sl > 0 && dir && dir.m > 0 && P.v > 4) {
    const S = this.stats_();
    P.v = Math.min(S.max, P.v + S.acc * this.sl * .9 * dt);
  }
};

const _bell92 = Ride.prototype.bell;
Ride.prototype.bell = function () {
  const v = this.p.veh;
  if (v === 'skate' && !(this.ollieT > 0)) {
    this.ollieT = .42; this.inv = Math.max(this.inv || 0, .42);
    this.float('¡Ollie! 🛹', PAL.amb); Snd.vehSfx('skate', 'ollie');
    this.burst(this.p.x, this.p.y, '#f4efe2', 5);
  } else if (v && v !== 'bike') {
    Snd.vehSfx(v, 'bell');
  }
  return _bell92.call(this);
};

/* Selector de vehículos en Modo Libre (ModeUsuarioR): respeta la bici prestada de EnCicla (queda estacionada con candado) */
UI.vehiculos = function (M) {
  if (!M || !M.free || !M.ride) return;
  const cur = (M.ride.p.veh === 'bike' && M.ebike) ? 'ebike' : M.ride.p.veh;
  this.modal(`<h2>🛴 Tu vehículo en el valle</h2>
    <p class="m" style="margin:4px 0 10px">Elige cómo recorrer el Valle de Aburrá. Si tienes una bici de EnCicla prestada, queda asegurada con candado donde cambies.</p>
    <div class="col" style="gap:8px">${vehLista().map(v => `<button class="btn ${cur === v.id ? 'pri' : ''}" data-veh="${v.id}" style="display:flex;align-items:center;justify-content:space-between;text-align:left;padding:10px 14px">
      <span><strong>${v.icon} ${v.name}</strong><br><small style="opacity:.85;font-weight:400">${v.sub}</small></span>
      <span style="font-size:12px;opacity:.9">${v.mL}×${v.mW} m</span>
    </button>`).join('')}</div>
    <div class="col" style="margin-top:10px"><button class="btn" id="mClose">▶ Seguir rodando</button></div>`, () => {
    $$('[data-veh]').forEach(b => b.onclick = () => {
      const id = b.dataset.veh;
      M.cambiarVehiculo(id);
      this.closeModal();
      if (Game.paused) Game.resume();
    });
    const cl = $('#mClose'); if (cl) cl.onclick = () => { this.closeModal(); if (Game.paused) Game.resume(); };
  });
};

ModeUsuarioR.prototype.cambiarVehiculo = function (id) {
  const R = this.ride, P = R.p, V = vehLista().find(x => x.id === id) || VEH_CATALOGO[0];
  /* Si tenía una bici de EnCicla en préstamo y cambia a otro vehículo personal, deja la bici estacionada en el mapa */
  if (!this.ownBike && (P.veh === 'bike' || P.veh === 'ebike') && id !== 'bike' && id !== 'ebike' && !this.parked) {
    this.parked = { x: P.x, y: P.y, ebike: !!this.ebike };
    this.parkedM = R.marker({ x: P.x, y: P.y, r: 14, col: PAL.vd, label: '🚲 Tu bici EnCicla' });
  } else if ((id === 'bike' || id === 'ebike') && this.parked) {
    if (this.parkedM) R.removeMarker(this.parkedM);
    this.parked = null; this.parkedM = null;
  }
  if (id === 'ebike') { this.ebike = 1; R.ebike = 1; R.setVeh('bike'); }
  else { if (id === 'bike') { this.ebike = 0; R.ebike = 0; } R.setVeh(id); }
  Save.data.flags = Save.data.flags || {};
  Save.data.flags['veh_' + id] = 1;
  const usedCount = VEH_CATALOGO.filter(v => Save.data.flags['veh_' + v.id]).length;
  if (usedCount >= 5) Save.data.flags.multimodal = 1;
  Logros.check(); Save.save();
  Snd.vehSfx(id, 'bell');
  R.float(V.icon + ' ' + V.name, PAL.vd1);
  if (JE.ui) JE.ui.toast(V.icon + ' Ahora vas en ' + V.name.toLowerCase() + ' (' + V.sub + ')');
};

const _act92 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act92.call(this);
  if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
  const cur = (this.ride.p.veh === 'bike' && this.ebike) ? 'ebike' : this.ride.p.veh;
  const V = vehLista().find(x => x.id === cur) || VEH_CATALOGO[0];
  a.push({ id: 'vehiculo', icon: 'llanta', label: V.icon + ' Vehículo', fn: () => UI.vehiculos(this) });
  return a;
};

LOGROS.push({ id: 'multimodal', name: 'Ruedas del valle', desc: 'Recorre el modo libre en 5 vehículos distintos (bici, eléctrica, patinete, skate o patines)', icon: 'llanta', test: S => !!(S.flags && S.flags.multimodal) });

/* =====================================================================
   M3 · MEJORAS GRÁFICAS: CASAS DE LADERA, INTERIORES DE ESTACIONES Y ATMÓSFERA
   ===================================================================== */

/* 1) Interiores detallados de estaciones EnCicla:
      - Caseta manual (4,0 m × 2,2 m × 2,6 m): escritorio (#8b5a2b), pantalla/planilla (#7ce0ff), silla (#232a38),
        chaleco reflectivo colgado (#9bd341 con cintas #e6ecf5), tablero de llaves por colores, tula verde EnCicla (#7ab800),
        cargador de celular con LED verde (#3dd668) y pocillo de tinto (#d94e34).
      - Tótem automático (0,55 m × 0,45 m × 2,10 m): columna azul/acero, pantalla táctil Cívica, lector con halo verde
        y panel solar superior. */
const _booth92 = Art.booth;
Art.booth = function (b, x, y, w, h) {
  _booth92.call(this, b, x, y, w, h);
  /* Interior detallado visible por el ventanal de la caseta del anfitrión */
  const wx = x + 3, wy = y - h + 8, ww = w - 6, wh = h - 18;
  prect(b, wx, wy, ww, wh, '#162844'); /* pared de fondo de la caseta */
  /* Tablero de llaves codificadas por color (azul, coral, amarillo, verde) */
  prect(b, wx + 2, wy + 2, 9, 6, '#243a5e');
  prect(b, wx + 3, wy + 3, 1, 2, '#56c7ff'); prect(b, wx + 5, wy + 3, 1, 2, '#ff5a36');
  prect(b, wx + 7, wy + 3, 1, 2, '#ffe066'); prect(b, wx + 9, wy + 3, 1, 2, '#9bd341');
  /* Chaleco reflectivo verde colgado en gancho */
  prect(b, wx + ww - 7, wy + 2, 5, 7, '#9bd341');
  prect(b, wx + ww - 7, wy + 4, 5, 1, '#e6ecf5'); prect(b, wx + ww - 7, wy + 7, 5, 1, '#e6ecf5');
  /* Silla ergonómica detrás del anfitrión */
  prect(b, wx + Math.floor(ww / 2) - 4, wy + 6, 8, 7, '#232a38');
  /* Tula verde EnCicla arrumada al costado */
  prect(b, wx + 2, wy + wh - 5, 5, 4, '#7ab800'); prect(b, wx + 3, wy + wh - 4, 3, 1, '#ffffff');
  /* Escritorio de madera, pantalla/planilla, cargador con LED verde y pocillo de tinto */
  prect(b, wx, wy + wh - 2, ww, 3, '#8b5a2b');
  prect(b, wx + 3, wy + wh - 6, 6, 4, '#1b2838'); prect(b, wx + 4, wy + wh - 5, 4, 2, '#7ce0ff'); /* monitor/planilla */
  prect(b, wx + ww - 9, wy + wh - 4, 3, 2, '#1f242e'); prect(b, wx + ww - 8, wy + wh - 4, 1, 1, '#3dd668'); /* cargador con LED */
  prect(b, wx + ww - 4, wy + wh - 5, 2, 3, '#d94e34'); prect(b, wx + ww - 4, wy + wh - 7, 1, 1, '#ffffff88'); /* tinto humeante */
};

/* Dibujo en 3D del interior de las estaciones EnCicla (manuales con caseta amoblada y automáticas con tótem Cívica y LEDs) */
Ride.prototype.estaciones3D = function (c, ox, oy, vw, vh) {
  if (GFX() !== '3d') return;
  const E = this.ojo(), px = E.x - ox, py = E.y - oy, K = E.K, nb = Math.round(Art.night(this.min) * 3);
  const PX = (x, y, z) => px + (x - px) * (1 + K * z), PY = (x, y, z) => py + (y - py) * (1 + K * z);
  const pulse = .55 + .45 * Math.sin((this.mode.t || 0) * 4.5);
  for (const st of this.map.stations) {
    const sx = st.x - ox, sy = st.y - oy;
    if (sx < -40 || sy < -40 || sx > vw + 40 || sy > vh + 40) continue;
    const d2 = (sx - px) * (sx - px) + (sy - py) * (sy - py);
    if (d2 > 210 * 210) continue;
    const manual = st.manual !== false && (st.id % 2 === 0);
    if (manual) {
      /* Caseta manual 3D: 4,0 m × 2,2 m × 2,6 m (6,4 × 3,5 px, z = 0.095) con ventanal e interior iluminado */
      const bx = sx - 7, by = sy - 5, bw = 6.4, bh = 3.6, z = .095;
      c.fillStyle = nb >= 2 ? '#132c52' : '#0a2342';
      c.fillRect(bx, by, bw, bh);
      /* Ventana e interior: escritorio, pantalla, chaleco reflectivo y LED */
      c.fillStyle = nb >= 2 ? '#ffe596' : '#d8eefc';
      c.fillRect(bx + .8, by + .8, bw - 1.6, bh - 1.4);
      c.fillStyle = '#8b5a2b'; c.fillRect(bx + .9, by + bh - 1.3, bw - 1.8, .7); /* escritorio */
      c.fillStyle = '#9bd341'; c.fillRect(bx + bw - 2.1, by + 1.0, 1.0, 1.3); /* chaleco reflectivo */
      c.fillStyle = '#56c7ff'; c.fillRect(bx + 1.2, by + 1.1, 1.3, .9); /* pantalla/tablero */
      c.fillStyle = '#3dd668'; c.fillRect(bx + 2.8, by + bh - 1.4, .55, .55); /* LED cargador */
      /* Cubierta verde EnCicla proyectada en 3D */
      const rx0 = PX(bx - .4, by - .4, z), ry0 = PY(bx - .4, by - .4, z), rx1 = PX(bx + bw + .4, by + bh + .4, z), ry1 = PY(bx + bw + .4, by + bh + .4, z);
      c.fillStyle = '#7ab800'; c.fillRect(rx0, ry0, rx1 - rx0, ry1 - ry0);
      c.strokeStyle = '#c4ec7c'; c.lineWidth = .45; c.strokeRect(rx0, ry0, rx1 - rx0, ry1 - ry0);
    } else {
      /* Tótem automático 3D: columna #0a2342, pantalla Cívica #7ce0ff, halo verde sin contacto #3dd668 y panel solar */
      const tx = sx - 5.5, ty = sy - 3.5, z = .085, txTop = PX(tx, ty, z), tyTop = PY(tx, ty, z);
      c.strokeStyle = '#0a2342'; c.lineWidth = 2.1; c.beginPath(); c.moveTo(tx, ty); c.lineTo(txTop, tyTop); c.stroke();
      c.fillStyle = '#7ce0ff'; c.fillRect(txTop - .7, tyTop - .5, 1.4, 1.0); /* pantalla Cívica */
      c.fillStyle = `rgba(61,214,104,${(0.45 + 0.45 * pulse).toFixed(2)})`;
      c.beginPath(); c.arc(txTop, tyTop + .8, 1.1, 0, TAU); c.fill(); /* halo lector tarjeta Cívica */
      c.fillStyle = '#1f365c'; c.fillRect(txTop - 1.1, tyTop - 1.1, 2.2, .7); /* panel solar */
    }
    /* Módulos de anclaje con LEDs de estado (verde disponible, ámbar ocupado, rojo taller) */
    const nMod = 5;
    for (let i = 0; i < nMod; i++) {
      const mx = sx - 2 + i * 2.2, my = sy + 1.5;
      c.fillStyle = '#4c5563'; c.fillRect(mx - .4, my - .4, .8, 1.2);
      c.fillStyle = (i === 4 && st.broken) ? '#e84855' : (i % 2 === 0 ? '#3dd668' : '#ffb300');
      c.fillRect(mx - .25, my - .3, .5, .5);
    }
  }
};

/* 2) Casas de ladera mejoradas (ladera3D):
      En los barrios altos del valle (cota > 1545 m: Comuna 13, Santo Domingo, Manrique, Popular, Robledo, Villahermosa, Picacho),
      las casas sobre pendiente muestran su zócalo/barranco escalonado de ladrillo, escalera exterior con pasamanos,
      terraza de plancha gris con tanque de agua negro y cuerda de ropa tendida. */
const _techoL92 = techoL;
techoL = function (c, b, rx, ry, p) {
  const ux = rx[1] - rx[0], uy = ry[1] - ry[0], vx = rx[3] - rx[0], vy = ry[3] - ry[0], w = Math.hypot(ux, uy), h = Math.hypot(vx, vy);
  if (w >= 9 && h >= 9 && b.z < .36 && JE.map && JE.map.elev(b.x, b.y) > 1545) {
    const at = (a, d) => [rx[0] + ux * a + vx * d, ry[0] + uy * a + vy * d];
    /* Tanque de agua negro tipo Rotoplas sobre la plancha */
    const T = at(.74, .28);
    c.fillStyle = '#1f232a'; c.beginPath(); c.arc(T[0], T[1], 1.7, 0, TAU); c.fill();
    c.strokeStyle = '#4a5160'; c.lineWidth = .35; c.stroke();
    /* Cuerda de ropa tendida con prendas de colores paisas */
    if (b.k < .65) {
      const A = at(.18, .62), B = at(.82, .68);
      c.strokeStyle = '#cfd5df'; c.lineWidth = .3; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
      const cols = ['#ff5a36', '#56c7ff', '#ffe066', '#9bd341'];
      for (let i = 0; i < 3; i++) {
        const t = .22 + i * .26, px = A[0] + (B[0] - A[0]) * t, py = A[1] + (B[1] - A[1]) * t;
        c.fillStyle = cols[(i + (b.x | 0)) & 3]; c.fillRect(px - .6, py - .4, 1.2, 1.1);
      }
    }
    /* Escalera exterior de concreto con pasamanos en el costado de la casa de ladera */
    if (b.k > .32) {
      const E0 = [rx[0] - ux * .12, ry[0] - uy * .12], E1 = [rx[0], ry[0]];
      c.strokeStyle = '#bfc5ce'; c.lineWidth = .9; c.beginPath(); c.moveTo(E0[0], E0[1] + 2.5); c.lineTo(E1[0], E1[1]); c.stroke();
      c.strokeStyle = '#eef2f7'; c.lineWidth = .35; c.beginPath(); c.moveTo(E0[0], E0[1] + 1.7); c.lineTo(E1[0], E1[1] - .8); c.stroke();
    }
    return;
  }
  return _techoL92(c, b, rx, ry, p);
};

/* 3) Atmósfera del valle: niebla andina matinal/lluviosa, reflejos en pavimento mojado y halos nocturnos */
const _draw3D92 = Ride.prototype.draw3D;
Ride.prototype.draw3D = function (c, ox, oy, vw, vh) {
  _draw3D92.call(this, c, ox, oy, vw, vh);
  this.estaciones3D(c, ox, oy, vw, vh);
};

const _drawGlow92 = Ride.prototype.drawGlow;
Ride.prototype.drawGlow = function (c, ox, oy, inV, n) {
  /* Reflejos especulares en el asfalto mojado cuando llueve */
  if (this.mode && this.mode.mods && this.mode.mods.rain) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const cr of this.cars) if (inV(cr.x, cr.y)) {
      const rx = cr.x - ox + Math.cos(cr.ang) * 7, ry = cr.y - oy + Math.sin(cr.ang) * 7;
      c.fillStyle = 'rgba(255,235,160,0.12)';
      c.beginPath(); c.ellipse(rx, ry, 5, 2.2, cr.ang, 0, TAU); c.fill();
    }
    c.restore();
  }
  _drawGlow92.call(this, c, ox, oy, inV, n);
  /* Cono cálido de la farola delantera de la bici / eléctrica / monopatín de noche */
  if (n > .25 && this.p.veh !== 'walk') {
    const P = this.p, px = P.x - ox, py = P.y - oy, L = (P.veh === 'ebike' || P.veh === 'emonopatin' || this.ebike) ? 34 : 24;
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = `rgba(255,244,180,${(n * 0.22).toFixed(3)})`;
    c.beginPath(); c.moveTo(px, py);
    c.lineTo(px + Math.cos(P.a - .28) * L, py + Math.sin(P.a - .28) * L);
    c.lineTo(px + Math.cos(P.a + .28) * L, py + Math.sin(P.a + .28) * L);
    c.closePath(); c.fill(); c.restore();
  }
  /* Niebla andina del Valle de Aburrá en la madrugada (5:30 a 7:50 a. m.) o bajo aguacero */
  const min = ((this.min || 480) % 1440 + 1440) % 1440, rain = !!(this.mode && this.mode.mods && this.mode.mods.rain);
  const fog = Math.max(rain ? .16 : 0, min >= 320 && min <= 475 ? Math.sin(((min - 320) / 155) * Math.PI) * .22 : 0);
  if (fog > .01) {
    const t = (this.mode && this.mode.t) || 0;
    c.save();
    c.fillStyle = `rgba(226,236,248,${(fog * 0.55).toFixed(3)})`;
    for (let i = 0; i < 3; i++) {
      const fx = ((ox * .15 + t * (4 + i * 2) + i * 95) % 260) - 40, fy = 22 + i * 58;
      c.beginPath(); c.ellipse(fx + 110, fy, 115, 22, 0, 0, TAU); c.fill();
    }
    c.restore();
  }
};
