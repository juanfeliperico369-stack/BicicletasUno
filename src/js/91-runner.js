/* =====================================================================
   RUN ENCICLA · CARRERA SIN FIN EN 3D (v1.8 · M4)
   Modo de carrera 3D sobre las ciclorrutas reales del Valle de Aburrá
   (inspirado en RunRunZero y conectado al mapa unificado de Juega EnCicla).
   - Dos cámaras con cambio instantáneo:
     * 1.ª persona: manubrio verde EnCicla que gira y vibra, canasta delantera con placa,
       maniguetas de freno, timbre que se mueve al sonar y manos del jugador.
     * 3.ª persona: detrás de la bici EnCicla (o del vehículo activo de M5) con el jugador
       pedaleando/patinando en perspectiva 3D.
   - 3 carriles, salto, agacharse/frenar bajo ramas de guayacán, timbre 🔔 para pedir vía
     a peatones y perritos criollos, rampas, hojas verdes y tinto recargador.
   ===================================================================== */

const pcirc = typeof pdisc !== 'undefined' ? pdisc : (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };

const CORREDORES_3D = [
  { id: 'parques', name: 'Ciclorruta Parques del Río', sub: 'La Alpujarra → Conquistadores → Carlos E. Restrepo', x0: 1218, y0: 2375, x1: 1185, y1: 2310, tree: '#f2c12e' },
  { id: 'vegas', name: 'Corredor Av. Las Vegas', sub: 'El Poblado → Ciudad del Río → Envigado', x0: 1245, y0: 2580, x1: 1210, y1: 2890, tree: '#ff77a8' },
  { id: 'av80', name: 'Ciclorruta Avenida 80', sub: 'La Aguacatala → Belén → Laureles → Floresta', x0: 1095, y0: 2560, x1: 1068, y1: 2210, tree: '#f2c12e' },
  { id: 'carabobo', name: 'Paseo Carabobo Norte', sub: 'Parque Berrío → Parque Explora → Jardín Botánico', x0: 1292, y0: 2315, x1: 1318, y1: 2085, tree: '#49a844' },
  { id: 'estadio', name: 'Corredor Universidad – Estadio', sub: 'U. de Antioquia → Suramericana → Atanasio Girardot', x0: 1285, y0: 2145, x1: 1125, y1: 2205, tree: '#ff8a3d' },
  { id: 'comuna13', name: 'Ruta San Javier – La América', sub: 'Estación San Javier → La Floresta → Estadio', x0: 952, y0: 2262, x1: 1110, y1: 2225, tree: '#49a844' }
];

class MGRunner3D extends MG {
  constructor(parent, opt = {}) {
    super(parent, opt);
    this.view = { kind: 'pixel', w: 320, h: 200 };
    const idx = opt.corredor != null ? opt.corredor : this.rng.i(0, CORREDORES_3D.length - 1);
    this.corr = CORREDORES_3D[idx % CORREDORES_3D.length];
    this.fp = opt.fp != null ? !!opt.fp : (Save.data && Save.data.settings && Save.data.settings.runCam === '1p');
    this.veh = opt.veh || (parent && parent.ride && parent.ride.p && parent.ride.p.veh) || 'bike';
    if (this.veh === 'bike' && parent && parent.ebike) this.veh = 'ebike';
    if (this.veh === 'walk' || this.veh === 'truck') this.veh = 'bike';
    this.dur = opt.dur || 45;
    this.metaM = opt.metaM || 650;
    this.distM = 0;
    this.spd = 11.5; /* m/s (~41 km/h punta arcade) */
    this.lane = 0;   /* -1 izquierda, 0 centro, +1 derecha */
    this.lx = 0;     /* posición lateral interpolada */
    this.z = 0;      /* altura de salto en metros */
    this.vz = 0;
    this.duckT = 0;  /* agachado / frenando */
    this.bellT = 0;  /* animación de timbre */
    this.boostT = 0; /* poder de tinto cargado */
    this.hitT = 0;
    this.combo = 0;
    this.hojas = 0;
    this.hits = 0;
    this.nextD = 26;
    this.items = [];
    this.barrio = 'Medellín';
    this.sl = 0;
    for (let i = 0; i < 8; i++) this.spawnRow();
  }

  spawnRow() {
    const d = this.nextD;
    this.nextD += this.rng.range(16, 26);
    const lane = this.rng.i(-1, 1);
    const r = this.rng.f();
    const kind = r < .18 ? 'hueco' : r < .33 ? 'cono' : r < .46 ? 'rama' : r < .59 ? 'perro' : r < .70 ? 'chaza' : r < .80 ? 'charco' : r < .90 ? 'moto' : 'rampa';
    this.items.push({ d, lane, kind, done: false, moved: false });
    /* Hojas verdes en el carril libre o sobre la rampa */
    const freeLane = kind === 'rampa' ? lane : ((lane + 2) % 3) - 1;
    const nH = this.rng.i(2, 4);
    for (let k = 0; k < nH; k++) {
      this.items.push({ d: d + k * 3.2, lane: freeLane, kind: (k === 1 && this.rng.f() < .14) ? 'tinto' : 'hoja', z: kind === 'rampa' ? .9 : .2, done: false });
    }
  }

  moveLane(dl) {
    const nl = clamp(this.lane + dl, -1, 1);
    if (nl !== this.lane) { this.lane = nl; Snd.sfx('tap'); }
  }

  jump() {
    if (this.z > .05) return;
    this.vz = 6.2; this.z = .06; this.duckT = 0;
    if (this.veh === 'skate') Snd.vehSfx('skate', 'ollie'); else Snd.sfx('tap');
  }

  duck() {
    this.duckT = .65;
    if (this.z > .05) this.vz = Math.min(this.vz, -5);
    Snd.sfx('tap');
  }

  toggleCam() {
    this.fp = !this.fp;
    if (Save.data && Save.data.settings) { Save.data.settings.runCam = this.fp ? '1p' : '3p'; Save.save(); }
    Snd.sfx('tap');
    this.pop(this.fp ? '🎥 1.ª persona (manubrio)' : '🎥 3.ª persona (detrás)', 160, 44, PAL.cie);
  }

  ringBell() {
    if (this.bellT > .15) return;
    this.bellT = .55;
    Snd.vehSfx(this.veh, 'bell');
    let cleared = 0;
    for (const it of this.items) {
      const rel = it.d - this.distM;
      if (!it.done && !it.moved && rel > 2 && rel < 36 && (it.kind === 'perro' || it.kind === 'chaza')) {
        it.moved = true;
        it.lane = it.lane <= 0 ? 1.55 : -1.55;
        cleared++;
      }
    }
    if (cleared) {
      this.good(4 * cleared, 160, 62, '🔔 +' + (4 * cleared) + ' ¡Vía libre!');
    }
  }

  /* Punto geográfico real sobre el corredor para consultar cota, pendiente y barrio */
  posMapa() {
    const C = this.corr, u = clamp((this.distM / Math.max(200, this.metaM)) % 1, 0, 1);
    const tx = C.x0 + (C.x1 - C.x0) * u, ty = C.y0 + (C.y1 - C.y0) * u;
    return { tx, ty, px: tx * TS, py: ty * TS, a: Math.atan2(C.y1 - C.y0, C.x1 - C.x0) };
  }

  update(dt) {
    this.tick(dt);
    const q = this.posMapa();
    if (JE.map && JE.map.barrioAt) {
      this.barrio = JE.map.barrioAt(q.tx, q.ty) || 'Medellín';
      this.sl = clamp(JE.map.slope(q.px, q.py, q.a), -.08, .08);
    }
    this.bellT = Math.max(0, this.bellT - dt);
    this.duckT = Math.max(0, this.duckT - dt);
    this.boostT = Math.max(0, this.boostT - dt);
    this.hitT = Math.max(0, this.hitT - dt);
    /* Velocidad progresiva con efecto de pendiente y tinto */
    const targetSpd = (12.5 + Math.min(5.5, this.distM * .007)) * (this.boostT > 0 ? 1.25 : 1) * (this.duckT > 0 ? .78 : 1) * (this.veh === 'ebike' && this.sl > 0 ? 1 : (1 - this.sl * 2.2));
    this.spd += ( clamp(targetSpd, 7.5, 21) - this.spd ) * Math.min(1, dt * 3.5);
    if (this.hitT > .25) this.spd = Math.min(this.spd, 6.5);
    this.distM += this.spd * dt;
    this.lx += (this.lane - this.lx) * Math.min(1, dt * 11);
    if (this.z > 0 || this.vz !== 0) {
      this.z += this.vz * dt;
      this.vz -= 16.5 * dt;
      if (this.z <= 0) { this.z = 0; this.vz = 0; }
    }
    while (this.nextD < this.distM + 115) this.spawnRow();

    /* Colisiones y recolección */
    for (const it of this.items) {
      if (it.done) continue;
      const rel = it.d - this.distM;
      if (rel > 1.4 || rel < -1.4) continue;
      const dLane = Math.abs(this.lx - it.lane);
      if (it.kind === 'hoja') {
        if (dLane < .55 && Math.abs(this.z - (it.z || .2)) < .95) {
          it.done = true; this.hojas++; this.combo++;
          this.p.score += 2 + Math.min(4, this.combo >> 2);
          Snd.sfx('coin');
        }
        continue;
      }
      if (it.kind === 'tinto') {
        if (dLane < .58) {
          it.done = true; this.boostT = 5.5;
          this.good(6, 160, 56, '☕ ¡Tinto bien cargado! +6');
        }
        continue;
      }
      if (dLane >= .46) continue;
      if (it.kind === 'rampa') {
        it.done = true; this.vz = 8.4; this.z = .15;
        this.good(5, 160, 58, '🚀 ¡Salto en rampa! +5');
        continue;
      }
      if (it.kind === 'rama') {
        if (this.duckT > 0) {
          it.done = true; this.good(3, 160, 66, '✓ ¡Pasaste agachado! +3');
        } else {
          this.chocar(it, '🌿 ¡Rama baja! Agáchate con ▼');
        }
        continue;
      }
      if ((it.kind === 'hueco' || it.kind === 'cono' || it.kind === 'charco') && this.z > .42) {
        it.done = true; this.good(3, 160, 62, '🦘 ¡Buen salto! +3');
        continue;
      }
      if (this.boostT > 0) {
        it.done = true; this.pop('⚡ ¡Con impulso!', 160, 68, PAL.amb);
        continue;
      }
      const msg = { hueco: '🕳️ ¡Hueco!', cono: '🚧 ¡Cono de obra!', charco: '💦 ¡Charco!', perro: '🐕 ¡Usa el timbre 🔔!', chaza: '☂️ ¡Chaza en la vía!', moto: '🛵 ¡Moto en ciclorruta!' }[it.kind] || '¡Cuidado!';
      this.chocar(it, msg);
    }
    this.items = this.items.filter(it => it.d > this.distM - 8);
    this.coach = this.fp
      ? '1.ª persona: ◀ ▶ cambia de carril · ▲ salta · ▼ agáchate · 🔔 timbre para pedir vía · 🎥 cambia a 3.ª persona.'
      : '3.ª persona: ◀ ▶ cambia de carril · ▲ salta huecos y rampas · ▼ esquiva ramas · 🔔 timbre · 🎥 cambia a 1.ª persona.';
    if (this.distM >= this.metaM || this.t >= this.dur) {
      this.won = this.distM >= this.metaM * .75;
      if (Save.data) {
        Save.data.stats.runnerM = Math.max(Save.data.stats.runnerM | 0, Math.round(this.distM));
        Save.data.flags = Save.data.flags || {};
        if (this.distM >= 500) Save.data.flags.runner500 = 1;
        Logros.check(); Save.save();
      }
      this.done = true;
    }
  }

  chocar(it, txt) {
    it.done = true; this.hits++; this.combo = 0; this.hitT = .65; this.spd *= .45;
    this.bad(txt, 160, 74); vib(45);
  }

  /* Proyección 3D del corredor de ciclorruta con montañas del Valle de Aburrá, árboles de guayacán y obstáculos */
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh, min = this.p.clock || 540, night = Art.night(min);
    const hz = Math.round(vh * (.38 - clamp(this.sl * 1.4, -.08, .08)) + (this.duckT > 0 ? 7 : 0) - this.z * 8);
    /* Cielo del Valle de Aburrá y cordilleras laterales */
    const sky = Art.sky ? Art.sky(min)[0] : '#76c5f0';
    prect(b, 0, 0, vw, hz, sky);
    b.fillStyle = night > .5 ? '#101d35' : '#2d5a4c';
    b.beginPath(); b.moveTo(0, hz);
    for (let x = 0; x <= vw; x += 16) b.lineTo(x, hz - 14 - Math.round(Math.sin(x * .035 + this.corr.x0) * 8 + Math.cos(x * .08) * 4));
    b.lineTo(vw, hz); b.closePath(); b.fill();
    /* Suelo y zonas verdes a los costados de la ciclorruta */
    prect(b, 0, hz, vw, vh - hz, night > .5 ? '#16281e' : '#3d7a3a');

    const cx = Math.round(vw / 2 - this.lx * (this.fp ? 26 : 16) + (this.hitT > 0 ? Math.sin(this.t * 45) * 4 : 0));
    const wTop = 18, wBot = Math.round(vw * .74);
    /* Calzada de ciclorruta verde/terracota con perspectiva trapezoidal */
    b.fillStyle = night > .5 ? '#1e4230' : '#2e8b52';
    b.beginPath();
    b.moveTo(cx - wTop, hz); b.lineTo(cx + wTop, hz);
    b.lineTo(cx + wBot, vh); b.lineTo(cx - wBot, vh);
    b.closePath(); b.fill();
    /* Bordillos blancos y franjas de los 3 carriles */
    b.strokeStyle = '#eef4ea'; b.lineWidth = 1.5;
    b.beginPath();
    b.moveTo(cx - wTop, hz); b.lineTo(cx - wBot, vh);
    b.moveTo(cx + wTop, hz); b.lineTo(cx + wBot, vh);
    b.stroke();

    /* Bandas transversales de perspectiva y guayacanes laterales */
    const phase = (this.distM % 8) / 8;
    for (let i = 1; i <= 12; i++) {
      const u = Math.pow((i - phase) / 12, 1.85);
      if (u <= .02 || u > 1) continue;
      const y = Math.round(hz + (vh - hz) * u), hw = wTop + (wBot - wTop) * u;
      prect(b, Math.round(cx - hw / 3), y, 1, Math.max(1, Math.round(3 * u)), '#d8f0c8');
      prect(b, Math.round(cx + hw / 3), y, 1, Math.max(1, Math.round(3 * u)), '#d8f0c8');
      /* Árboles y postes de luz a ambos lados del corredor */
      if (((i + Math.floor(this.distM / 8)) % 2) === 0) {
        const sc = .3 + u * 1.15;
        for (const sd of [-1, 1]) {
          const tx = Math.round(cx + sd * (hw + 14 * sc)), trH = Math.round(18 * sc), rC = Math.round(9 * sc);
          prect(b, tx - Math.max(1, Math.round(sc)), y - trH, Math.max(2, Math.round(2 * sc)), trH, '#5c3c24');
          pcirc(b, tx, y - trH - rC / 2, rC, this.corr.tree);
          pcirc(b, tx - Math.round(3 * sc), y - trH - rC / 3, Math.max(2, Math.round(rC * .7)), shade(this.corr.tree, .12));
        }
      }
    }

    /* Dibujo de obstáculos, rampas y hojas ordenados de lejos a cerca */
    const vis = this.items.filter(it => !it.done && it.d - this.distM > -.8 && it.d - this.distM < 90).sort((a, b2) => b2.d - a.d);
    for (const it of vis) {
      const rel = it.d - this.distM, t = clamp(1 - rel / 90, .04, 1), u = Math.pow(t, 2.1);
      const y = Math.round(hz + (vh - hz - 12) * u), hw = wTop + (wBot - wTop) * u;
      const x = Math.round(cx + it.lane * (hw * .62)), sc = Math.max(.25, .25 + u * 1.15);
      this.drawItem3D(b, it, x, y, sc, hw);
    }

    /* Cámara elegida: 1.ª persona (manubrio EnCicla) o 3.ª persona (detrás de la bici/vehículo) */
    if (this.fp) this.drawFirstPerson(b, vw, vh);
    else this.drawThirdPerson(b, vw, vh);
  }

  drawItem3D(b, it, x, y, sc, hw) {
    const r = v => Math.max(1, Math.round(v * sc));
    if (it.kind === 'hoja') {
      const hy = y - r(8 + Math.sin(this.t * 6 + it.d) * 2 + (it.z || 0) * 10);
      pcirc(b, x, hy, r(4.2), '#7ab800'); pcirc(b, x - r(1), hy - r(1), r(2.2), '#c4ec7c');
    } else if (it.kind === 'tinto') {
      const hy = y - r(9);
      prect(b, x - r(3), hy - r(4), r(6), r(7), '#d94e34'); prect(b, x - r(2), hy - r(4), r(4), r(2), '#fff');
    } else if (it.kind === 'hueco') {
      b.fillStyle = '#14171d'; b.beginPath(); b.ellipse(x, y, r(9), r(3.5), 0, 0, TAU); b.fill();
      b.strokeStyle = '#5a606b'; b.lineWidth = 1; b.stroke();
    } else if (it.kind === 'charco') {
      b.fillStyle = '#4aa8d8aa'; b.beginPath(); b.ellipse(x, y, r(11), r(4), 0, 0, TAU); b.fill();
    } else if (it.kind === 'cono') {
      prect(b, x - r(5), y - r(2), r(10), r(2), '#d9531e');
      b.fillStyle = '#ff6b2b'; b.beginPath(); b.moveTo(x - r(4), y - r(2)); b.lineTo(x + r(4), y - r(2)); b.lineTo(x, y - r(13)); b.closePath(); b.fill();
      prect(b, x - r(2), y - r(8), r(4), r(2), '#ffffff');
    } else if (it.kind === 'rampa') {
      b.fillStyle = '#e8b931'; b.beginPath(); b.moveTo(x - r(9), y); b.lineTo(x + r(9), y); b.lineTo(x + r(7), y - r(8)); b.lineTo(x - r(7), y - r(8)); b.closePath(); b.fill();
      prect(b, x - r(6), y - r(6), r(12), r(2), '#0a2342');
    } else if (it.kind === 'rama') {
      /* Rama alta que cruza el carril: hay que pasar agachado */
      const by = y - r(18);
      prect(b, Math.round(x - hw * .45), by, Math.round(hw * .9), r(4), '#5c3c24');
      for (let k = -2; k <= 2; k++) pcirc(b, x + k * r(7), by - r(2), r(6), this.corr.tree);
    } else if (it.kind === 'perro') {
      prect(b, x - r(5), y - r(6), r(10), r(4), '#c68642');
      pcirc(b, x - r(5), y - r(8), r(3), '#c68642');
      prect(b, x - r(4), y - r(2), r(2), r(3), '#8d5524'); prect(b, x + r(2), y - r(2), r(2), r(3), '#8d5524');
    } else if (it.kind === 'chaza') {
      prect(b, x - r(8), y - r(10), r(16), r(9), '#2a5a92');
      b.fillStyle = '#ff5a36'; b.beginPath(); b.arc(x, y - r(12), r(11), Math.PI, 0); b.fill();
    } else if (it.kind === 'moto') {
      prect(b, x - r(3), y - r(12), r(6), r(11), '#1d1f24');
      pcirc(b, x, y - r(14), r(3.5), '#e84855');
      pcirc(b, x, y - r(7), r(2), '#fff6b0');
    }
  }

  /* Vista en 1.ª persona: manubrio verde EnCicla, canasta delantera con placa, frenos, timbre animado y manos */
  drawFirstPerson(b, vw, vh) {
    const P = Save.data ? Save.data.profile : {}, skin = SKINS[P.skin] || '#f0c090';
    const steer = (this.lane - this.lx) * .22, bob = Math.sin(this.distM * 1.4) * (this.z > 0 ? 0 : 2.2) + (this.duckT > 0 ? 10 : 0) - this.z * 7;
    const cx = Math.round(vw / 2), cy = Math.round(vh - this.pieUI() - 18 + bob);
    b.save();
    b.translate(cx, cy);
    b.rotate(steer);
    /* Canasta metálica delantera EnCicla con placa numerada y vaso de tinto si lleva boost */
    prect(b, -28, -26, 56, 20, '#3a4350');
    prect(b, -26, -24, 52, 16, '#566172');
    for (let x = -22; x <= 22; x += 6) prect(b, x, -24, 1, 16, '#262d38');
    /* Placa verde EnCicla al frente de la canasta */
    prect(b, -18, -21, 36, 10, '#7ab800');
    prect(b, -16, -19, 32, 6, '#0a2342');
    prect(b, -12, -17, 24, 2, '#c4ec7c');
    if (this.boostT > 0) { prect(b, 14, -29, 7, 9, '#d94e34'); prect(b, 15, -31, 5, 2, '#ffffff'); }
    /* Potencia central y barra del manubrio verde EnCicla */
    prect(b, -5, -8, 10, 26, '#262b34');
    prect(b, -72, -10, 144, 6, this.veh === 'ebike' ? '#2fa8dc' : '#7ab800');
    prect(b, -72, -10, 144, 2, '#c4ec7c');
    /* Maniguetas de freno de aluminio (se aprietan al frenar/agacharse) */
    const brkY = this.duckT > 0 ? -11 : -15;
    prect(b, -66, brkY, 18, 3, '#cfd6e0');
    prect(b, 48, brkY, 18, 3, '#cfd6e0');
    /* Mangos de caucho negro */
    prect(b, -78, -12, 20, 9, '#1b1f26');
    prect(b, 58, -12, 20, 9, '#1b1f26');
    /* Timbre cromado/dorado a la derecha con palanca que oscila al sonar */
    pcirc(b, 40, -13, 5, '#ffd24c'); pcirc(b, 40, -14, 3, '#fff3b8');
    const bellAng = this.bellT > 0 ? Math.sin(this.bellT * 35) * 4 : 0;
    prect(b, Math.round(44 + bellAng), -14, 4, 2, '#c8d0dc');
    /* Pantalla LED si va en bici eléctrica o monopatín eléctrico */
    if (this.veh === 'ebike' || this.veh === 'emonopatin') {
      prect(b, -11, -14, 22, 8, '#0a2342');
      prect(b, -9, -12, 18, 4, '#7ce0ff');
    }
    /* Manos del jugador sujetando los mangos */
    prect(b, -72, -13, 14, 11, skin);
    prect(b, 58, -13, 14, 11, skin);
    b.restore();
  }

  /* Vista en 3.ª persona: detrás del ciclista/patinador con su ropa, casco y vehículo activo */
  drawThirdPerson(b, vw, vh) {
    const P = Save.data ? Save.data.profile : {};
    const shirt = SHIRTS[P.shirt] || PAL.vd, skin = SKINS[P.skin] || '#f0c090';
    const helmet = P.helmet === 0 ? (PELO[P.hairCol | 0] || '#2a1a10') : (HELMETS[P.helmet] || '#ffffff');
    const x = Math.round(vw / 2), y = Math.round(vh - this.pieUI() - 16 - this.z * 20), duck = this.duckT > 0 ? 7 : 0;
    const ped = Math.sin(this.distM * 1.9) * 3;
    /* Sombra en el suelo */
    b.fillStyle = 'rgba(0,0,0,0.28)';
    b.beginPath(); b.ellipse(x, vh - this.pieUI() - 12, 10, 3.5, 0, 0, TAU); b.fill();
    if (this.veh === 'skate' || this.veh === 'patines') {
      if (this.veh === 'skate') {
        prect(b, x - 8, y - 3, 16, 3, '#d9a066');
        prect(b, x - 7, y - 1, 3, 2, '#f4efe2'); prect(b, x + 4, y - 1, 3, 2, '#f4efe2');
      } else {
        prect(b, x - 6, y - 4 + Math.round(ped), 4, 4, '#1b4d89'); prect(b, x + 2, y - 4 - Math.round(ped), 4, 4, '#1b4d89');
        prect(b, x - 5, y, 2, 2, '#ff5a36'); prect(b, x + 3, y, 2, 2, '#ff5a36');
      }
    } else {
      /* Rueda trasera, guardabarros, marco verde EnCicla y luz roja LED */
      prect(b, x - 2, y - 14, 4, 14, '#1b1f27');
      prect(b, x - 3, y - 22, 6, 10, this.veh === 'ebike' ? '#2fa8dc' : '#7ab800');
      prect(b, x - 1, y - 17, 2, 2, '#ff3b30');
      prect(b, x - 13, y - 24 + duck, 26, 2, '#30343c'); /* manubrio */
    }
    /* Piernas con pedaleo alternado */
    prect(b, x - 6, y - 15 + Math.round(ped), 4, 8, '#1f2d46');
    prect(b, x + 2, y - 15 - Math.round(ped), 4, 8, '#1f2d46');
    /* Espalda, brazos y cabeza/casco */
    prect(b, x - 7, y - 27 + duck, 14, 13 - Math.floor(duck / 2), shirt);
    prect(b, x - 12, y - 25 + duck, 5, 4, skin);
    prect(b, x + 7, y - 25 + duck, 5, 4, skin);
    pcirc(b, x, y - 32 + duck, 5, helmet);
  }

  /* espacio (px del búfer) que ocupan los controles de abajo: el ciclista y el manubrio van encima, no tapados por los botones */
  pieUI() { return Math.round(104 / (View.s || 2)); }
  hud(V) {
    this.btns = [];
    const pct = Math.min(100, Math.round(this.distM / this.metaM * 100));
    const kmh = Math.round(this.spd * 3.6); // GPT-6: m/s → km/h, coherente con distM += spd * dt
    V.text('🏁 ' + this.corr.name + ' · ' + this.barrio, 12, Math.max((View.hudB || 50) + 18, (View.top || 0) + 12),   /* debajo de las metas, si las hay */ { size: 13, color: '#c4ec7c', bg: '#0a2342dd', pad: 4 });
    V.text(Math.round(this.distM) + ' / ' + this.metaM + ' m (' + pct + ' %) · ' + kmh + ' km/h · 🍃 ' + this.hojas, 12, Math.max((View.hudB || 50) + 42, (View.top || 0) + 36), { size: 13, color: '#fff', bg: '#0a2342cc', pad: 4 });
    /* Botón de cambio instantáneo entre 1.ª y 3.ª persona */
    this.button(V, V.w - 148, (View.hudB || 50) + 10, 136, 36, this.fp ? '🎥 1.ª Persona' : '🎥 3.ª Persona', () => this.toggleCam(), { bg: PAL.az1, size: 13, key: 'cam' });
    /* Controles táctiles grandes abajo para celular y escritorio */
    const y = V.h - 92, bw = Math.min(76, Math.floor((V.w - 44) / 5));
    const x0 = Math.round((V.w - (bw * 5 + 24)) / 2);
    this.button(V, x0, y, bw, 46, '◀', () => this.moveLane(-1), { bg: PAL.az1, size: 20, key: 'l' });
    this.button(V, x0 + (bw + 6), y, bw, 46, '▲ Salto', () => this.jump(), { bg: PAL.vd2, size: 14, key: 'u' });
    this.button(V, x0 + (bw + 6) * 2, y, bw, 46, '▼ Agacha', () => this.duck(), { bg: PAL.az2, size: 13, key: 'd' });
    this.button(V, x0 + (bw + 6) * 3, y, bw, 46, '🔔 Timbre', () => this.ringBell(), { bg: '#b0651a', size: 13, key: 'b' });
    this.button(V, x0 + (bw + 6) * 4, y, bw, 46, '▶', () => this.moveLane(1), { bg: PAL.az1, size: 20, key: 'r' });
    this.drawPops(V);
  }

  pointer(type, vx, vy, cx, cy) {
    if (super.pointer(type, vx, vy, cx, cy)) return true;
    if (type === 'down') {
      this._sw = { x: cx, y: cy };
      return true;
    }
    if (type === 'up' && this._sw) {
      const dx = cx - this._sw.x, dy = cy - this._sw.y;
      this._sw = null;
      if (Math.hypot(dx, dy) > 22) {
        if (Math.abs(dx) > Math.abs(dy)) this.moveLane(dx > 0 ? 1 : -1);
        else if (dy < 0) this.jump();
        else this.duck();
        return true;
      }
    }
    return false;
  }

  key(k) {
    if (k === 'ArrowLeft' || k === 'KeyA') this.moveLane(-1);
    else if (k === 'ArrowRight' || k === 'KeyD') this.moveLane(1);
    else if (k === 'ArrowUp' || k === 'KeyW') this.jump();
    else if (k === 'ArrowDown' || k === 'KeyS') this.duck();
    else if (k === 'Space') this.ringBell();
    else if (k === 'KeyV' || k === 'KeyC') this.toggleCam();
  }

  /* Piloto automático para pruebas (tests/run.js) */
  bot(dt) {
    let threat = null;
    for (const it of this.items) {
      if (it.done || it.kind === 'hoja' || it.kind === 'tinto') continue;
      const rel = it.d - this.distM;
      if (rel > 1 && rel < 26 && Math.abs(it.lane - this.lane) < .45) { threat = it; break; }
    }
    if (threat) {
      if (threat.kind === 'perro' || threat.kind === 'chaza') this.ringBell();
      else if (threat.kind === 'rama') this.duck();
      else if (threat.kind === 'rampa' || threat.kind === 'hueco' || threat.kind === 'charco') this.jump();
      else this.moveLane(this.lane <= 0 ? 1 : -1);
    }
  }
}

JE.MGRunner3D = MGRunner3D;

/* Acceso desde Modo Libre (botón 🏁 Carrera 3D) y desde Más */
ModeUsuarioR.prototype.iniciarRunner3D = function (corredorIdx) {
  if (!this.free || this.sub) return;
  const P = this.ride.p;
  /* Elige el corredor más cercano a la posición actual si no se especifica uno */
  let bestI = corredorIdx != null ? corredorIdx : 0, bestD = 1e18;
  if (corredorIdx == null) {
    CORREDORES_3D.forEach((c, i) => {
      const mx = (c.x0 + c.x1) / 2 * TS, my = (c.y0 + c.y1) / 2 * TS, d = dist(P.x, P.y, mx, my);
      if (d < bestD) { bestD = d; bestI = i; }
    });
  }
  const veh = (P.veh === 'bike' && this.ebike) ? 'ebike' : P.veh;
  this.runSub(new MGRunner3D(this, { corredor: bestI, veh, metaM: 550, dur: 45 }), mg => {
    this.ride.stamp = { t: 2.5, title: mg.won ? '¡CORREDOR COMPLETADO!' : '¡BUENA RODADA 3D!', sub: mg.corr.name + ' · ' + Math.round(mg.distM) + ' m', bg: mg.won ? PAL.vd : PAL.cie };
    if (JE.ui) JE.ui.toast('🏁 Recorriste ' + Math.round(mg.distM) + ' m en ' + mg.corr.name + ' (🍃 +' + mg.hojas + ' hojas)');
  });
};

const _act91 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act91.call(this);
  if (!this.free || this.sub || this.sitting || (typeof Paseo !== 'undefined' && Paseo.on(this))) return a;
  a.push({ id: 'runner3d', icon: 'estrella', label: '🏁 Carrera 3D', fn: () => this.iniciarRunner3D() });
  return a;
};

LOGROS.push({ id: 'runner500', name: 'A toda biela en 3D', desc: 'Recorre 500 m en una carrera sin fin 3D por las ciclorrutas del valle', icon: 'estrella', test: S => !!(S.flags && S.flags.runner500) });
