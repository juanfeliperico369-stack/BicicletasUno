/* =====================================================================
   PASEO GUIADO (v1.7; idea del «modo paseo» de El Metro 1.2.0): en el modo libre, la bici va sola de un
   lugar con postal al siguiente, respetando semáforos y carros; la cámara cambia de plano y en cada lugar
   se detiene, gira alrededor y cuenta su historia. Es para mirar la ciudad: tocar el control devuelve el manejo.
   ===================================================================== */
const PASEO_PLANOS = [{ t: .45, z: 1, dr: 0 }, { t: .72, z: 1.25, dr: .55 }, { t: .3, z: .86, dr: -.45 }, { t: .62, z: 1.1, sigue: 1 }];
const Paseo = JE.paseo = {
  on(M) { return !!(M && M.paseo && M.paseo.on); },
  puede(M) { return !!(M && M.free && M.id === 'usuario' && M.ride && !M.sub && !M.net && !M.sitting && !(M.race && !M.race.done)); },
  iniciar(M) {
    if (!this.puede(M)) return; const C = Cam.cfg();
    M.paseo = { on: true, vis: new Set(), plano: 0, planoT: 0, pausa: 0, cam0: { z: C.z, t: C.t, r: C.r, sigue: C.sigue }, zT: C.z || 1, n: 0 };
    this.siguiente(M); Snd.sfx('ok');
    JE.ui && JE.ui.toast('🧭 Paseo guiado: la bici va sola por los lugares del valle y te cuenta su historia. Toca el control para manejar tú.');
  },
  parar(M, msg) {
    const P = M.paseo; if (!P || !P.on) return; P.on = false; M.botDir = null;
    if (P.m) M.ride.removeMarker(P.m); Object.assign(Cam.cfg(), P.cam0); Save.save();   // la cámara vuelve a como la tenías
    if (msg && JE.ui) JE.ui.toast(msg);
  },
  /* el lugar con postal más cercano que no haya visitado en este paseo (primero los que están a menos de 2,5 km) */
  siguiente(M) {
    const P = M.paseo, R = M.ride, p = R.p, d25 = 2500 / M_PER_PX;
    const L = PUBLIC_LM().filter(l => !P.vis.has(l.id)).map(l => ({ l, d: dist((l.x + l.w / 2) * TS, (l.y + l.h / 2) * TS, p.x, p.y) })).sort((a, b) => (a.d <= d25 ? 0 : 1) - (b.d <= d25 ? 0 : 1) || a.d - b.d);
    if (!L.length) { this.parar(M, '🧭 ¡Recorriste todos los lugares del paseo!'); return; }
    const l = L[0].l; P.lugar = l; if (P.m) R.removeMarker(P.m); P.prog = { d: 1e9, t: 0 };
    const o = JE.map.nearestOpen(Math.floor(l.x + l.w / 2), Math.floor(l.y + l.h) + 1, false);   // la parada, en la calle o el andén frente al lugar (no dentro del edificio)
    P.m = R.marker({ x: o.x * TS + TS / 2, y: o.y * TS + TS / 2, r: 22 * WK, col: PAL.cie, label: '🧭 ' + l.name, enter: () => this.llegar(M, l) });
    R.target = P.m; R.calcGps();
    if (JE.ui && P.n) JE.ui.toast('🧭 Siguiente parada: ' + l.name + ' (' + (L[0].d * M_PER_PX >= 1000 ? (L[0].d * M_PER_PX / 1000).toFixed(1) + ' km' : Math.round(L[0].d * M_PER_PX / 10) * 10 + ' m') + ')');
  },
  llegar(M, l) {
    const P = M.paseo; if (!P || !P.on || P.lugar !== l) return; P.vis.add(l.id); P.n++; P.pausa = 7; M.botDir = { x: 0, y: 0, m: 0 };
    M.ride.stamp = { t: 3, title: l.name.toUpperCase().slice(0, 26), sub: l.muni + ' · parada ' + P.n + ' del paseo', bg: '#bfe3f7' };
    if (JE.ui) JE.ui.toast('📍 ' + l.name + ': ' + (l.fact || 'un lugar del valle para conocer.'));
    if (!Save.data.postales.includes(l.id) && M.collect) M.collect(l);
  },
  tick(M, dt) {
    const P = M.paseo; if (!P || !P.on) return; const C = Cam.cfg();
    const joyDrag = !Cam.g && Cam.ptr.size <= 1 && Input.joy.on && (performance.now() - (Input.joy.t0 || 0) > 140) && Math.hypot(Input.joy.x - Input.joy.ox, Input.joy.y - Input.joy.oy) > 20;
    const d = (Input.keys && Object.keys(Input.keys).some(k => Input.keys[k] && /^(Arrow|Key[WASD]$)/.test(k))) || joyDrag ? 1 : 0;
    if (d || !this.puede(M)) { this.parar(M, d ? '🚲 Manejas tú. Toca 🧭 Paseo para seguir el recorrido.' : null); return; }
    if (P.pausa > 0) {   // en el lugar: quieta, y la cámara le da la vuelta
      P.pausa -= dt; M.botDir = { x: 0, y: 0, m: 0 }; C.sigue = 0; C.r = angDiff(0, (C.r || 0) + dt * .22); C.t = Math.max(C.t || 0, .5); P.zT = 1.15;
      if (P.pausa <= 0) { P.planoT = 0; this.siguiente(M); }
    } else {
      M.botDrive(); if (M.botDir && M.botDir.m) M.botDir.m = Math.min(M.botDir.m, .85);   // a paso de paseo
      const g = P.prog, dd = P.m ? dist(M.ride.p.x, M.ride.p.y, P.m.x, P.m.y) : 0; g.t += dt; if (dd < g.d - 40) { g.d = dd; g.t = 0; } else if (g.t > 25) { P.vis.add(P.lugar.id); this.siguiente(M); return; }   // si no hay cómo llegar, al siguiente
      P.planoT -= dt; if (P.planoT <= 0) { P.planoT = 9; P.plano = (P.plano + 1) % PASEO_PLANOS.length; const Q = PASEO_PLANOS[P.plano]; C.t = Q.t; C.sigue = Q.sigue || 0; if (!Q.sigue) C.r = angDiff(0, (M.ride.rot || 0) + Q.dr); P.zT = Q.z; }
    }
    C.z = (C.z || 1) + (P.zT - (C.z || 1)) * (1 - Math.exp(-dt * 1.2));   // el zoom también cambia despacio
  }
};
/* el paseo va antes del manejo de cada cuadro */
const _upd89 = ModeUsuarioR.prototype.update;
ModeUsuarioR.prototype.update = function (dt) { if (Paseo.on(this)) Paseo.tick(this, dt); return _upd89.call(this, dt); };
const _act89 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act89.call(this); if (!this.free || this.sub || this.sitting) return a;
  if (Paseo.on(this)) return [{ id: 'paseoOff', icon: 'usuario', label: 'Manejar', fn: () => Paseo.parar(this, '🚲 Manejas tú. Toca 🧭 Paseo para seguir el recorrido.') }];
  if (Paseo.puede(this)) a.push({ id: 'paseo', icon: 'pin', label: 'Paseo', fn: () => Paseo.iniciar(this) });
  return a;
};
const _end89 = ModeUsuarioR.prototype.end;
ModeUsuarioR.prototype.end = function () { if (Paseo.on(this)) Paseo.parar(this); return _end89.apply(this, arguments); };
LOGROS.push({ id: 'paseo5', name: 'Guía del valle', desc: 'Haz un paseo guiado de 5 paradas', icon: 'estrella', test: S => (S.stats && S.stats.paseoMax | 0) >= 5 });
const _lleg89 = Paseo.llegar;
Paseo.llegar = function (M, l) { _lleg89.call(this, M, l); const P = M.paseo; if (P && P.vis.has(l.id)) { const S = Save.data; S.stats.paseoMax = Math.max(S.stats.paseoMax | 0, P.n); const nw = Logros.check(); Save.save(); if (nw.length && JE.ui) JE.ui.toast('🏅 Logro: ' + nw.map(x => x.name).join(', ')); } };
