/* =====================================================================
   PRÉSTAMO ENCICLA EN EL MODO LIBRE
   Con bici de EnCicla: el reloj va más lento, el préstamo se renueva cada hora en una estación y se respeta
   el horario (al cierre hay que haberla devuelto). Con bici propia: modo libre de 24 horas.
   Cuenta del usuario: 10 strikes de tolerancia para renovar tarde; sin strikes, suspensiones de 3 a 60 días.
   Una bici abandonada puede ser reportada: el reporte negativo no se quita.
   ===================================================================== */
const SUSP = [3, 7, 15, 30, 60];
const Cuenta = JE.cuenta = {
  get() { const S = Save.data; return S.encicla || (S.encicla = { strikes: 10, rep: 0, susp: null, susN: 0 }); },
  suspHasta() { const A = this.get(); return A.susp && A.susp > Cal.key(Cal.now()) ? A.susp : null; },
  fecha(k) { const [y, m, d] = k.split('-').map(Number); return d + ' de ' + MESES[m - 1]; },
  resumen() { const A = this.get(), s = this.suspHasta(); return '⚠️ ' + A.strikes + ' de 10 strikes · 🚨 ' + A.rep + (A.rep === 1 ? ' reporte' : ' reportes') + (s ? ' · ⛔ suspendido hasta el ' + this.fecha(s) : ''); },
  /* renovar o devolver tarde: primero se gastan strikes; sin strikes, suspensión cada vez más larga */
  tarde(min, M) {
    const A = this.get(); min = Math.ceil(min);
    if (A.strikes > 0) { A.strikes--; Save.save(); M.ride.stamp = { t: 2.2, title: 'RENOVASTE TARDE', sub: '+' + min + ' min · te quedan ' + A.strikes + ' de 10 strikes', bg: PAL.amb }; Snd.sfx('bad'); return; }
    const d = SUSP[Math.min(A.susN, SUSP.length - 1)]; A.susN++; A.susp = Cal.key(addD(M.fecha || Cal.now(), d)); Save.save();
    M.ride.stamp = { t: 3, title: 'SUSPENSIÓN DE ' + d + ' DÍAS', sub: 'Sin strikes y otra vez tarde · hasta el ' + this.fecha(A.susp), bg: PAL.cor }; Snd.sfx('lose'); vib(120);
  },
  reporte(M, quien) { const A = this.get(); A.rep++; Save.save(); M.ride.stamp = { t: 3, title: 'REPORTE NEGATIVO', sub: quien + ' reportó tu bici abandonada', bg: PAL.cor }; Snd.sfx('lose'); vib(120); JE.ui && JE.ui.toast('🚨 El reporte queda en tu cuenta para siempre. Nunca dejes sola la bici de EnCicla.'); }
};
const enPrestamo = M => M.free && !M.ownBike && !M.sinBici;
const _init82 = ModeUsuarioR.prototype.libreInit;
ModeUsuarioR.prototype.libreInit = function (now) {
  const s = Cuenta.suspHasta(); if (s && this.opt.bici !== 'propia') { this.opt.bici = 'propia'; this.suspTold = s; }
  _init82.call(this, now);
  if (!this.ownBike) { this.rate = .55; this.loan0 = this.clock; this.svc = Cal.service(now); }   // con EnCicla el reloj va más lento: una hora ≈ 2 minutos
  if (this.suspTold && JE.ui) JE.ui.toast('⛔ Estás suspendido de EnCicla hasta el ' + Cuenta.fecha(this.suspTold) + ': sales en tu bici');
};
ModeUsuarioR.prototype.renovar = function () {
  const lm = this.loanMin(), sv = this.svc; if (this.clock >= sv.lend) return JE.ui && JE.ui.toast('Ya no se prestan bicis: devuélvela en una estación');
  if (lm > 60) Cuenta.tarde(lm - 60, this); else { Snd.sfx('ok'); this.ride.float('¡Renovado!', PAL.vd1); }
  this.loan0 = this.clock; this.told50 = this.told60 = false; Save.data.stats.trips++; JE.ui && JE.ui.toast('✅ Préstamo renovado: tienes otra hora');
};
const _tick82 = ModeUsuarioR.prototype.tick;
ModeUsuarioR.prototype.tick = function (dt) {
  _tick82.call(this, dt); if (!enPrestamo(this) || this.done || this.endT != null) return; const lm = this.loanMin(), sv = this.svc, R = this.ride, P = R.p;
  if (lm >= 50 && !this.told50) { this.told50 = 1; JE.ui && JE.ui.toast('⏰ Te quedan 10 minutos: renueva en una estación'); }
  if (lm > 60 && !this.told60) { this.told60 = 1; JE.ui && JE.ui.toast('⚠️ Se pasó la hora: renueva ya o gastas un strike'); }
  // al cierre la bici ya debía estar devuelta
  if (this.clock >= sv.close) { Cuenta.tarde(Math.max(1, lm - 60), this); JE.ui && JE.ui.toast('🕙 EnCicla cerró y no devolviste la bici'); this.endT = 3.2; return; }
  // bici abandonada: si te alejas, alguien puede reportarla
  const pk = R.parked;
  if (pk && P.veh === 'walk' && dist(pk.x, pk.y, P.x, P.y) > 30 * WK) {
    this.abT = (this.abT || 0) + dt; if (this.abT > 6 && !this.abTold) { this.abTold = 1; JE.ui && JE.ui.toast('👀 Dejaste sola la bici de EnCicla: alguien puede reportarla'); }
    if (this.abT > 14 && this.rng.f() < dt * .12) { Cuenta.reporte(this, this.rng.pick(['Un anfitrión de EnCicla', 'Un funcionario del Área Metropolitana', 'Un usuario'])); R.parked = null; this.sinBici = true; this.abT = 0; }
  } else { this.abT = 0; this.abTold = 0; }
};
const _act82 = ModeUsuarioR.prototype.actions;
ModeUsuarioR.prototype.actions = function () {
  const a = _act82.call(this); if (!enPrestamo(this) || this.sub) return a; const d = a.find(x => x.id === 'dock');
  if (d) { const f = d.fn; d.fn = () => { const lm = this.loanMin(); if (lm > 60) Cuenta.tarde(lm - 60, this); f(); }; if (this.clock < this.svc.lend && this.ride.p.veh === 'bike') a.splice(a.indexOf(d), 0, { id: 'renovar', icon: 'estacion', label: 'Renovar', fn: () => this.renovar() }); }
  return a;
};
const _info82 = ModeUsuarioR.prototype.info;
ModeUsuarioR.prototype.info = function () {
  const i = _info82.call(this); if (!enPrestamo(this)) return i; const lm = this.loanMin();
  i.chips = [{ t: '⏱ ' + lm + '/60 min', c: lm > 60 ? 'bad' : lm >= 45 ? 'warn' : '' }].concat(i.chips.filter(c => c.t !== 'EnCicla')); return i;
};
/* ficha del modo libre: estado de la cuenta y bici de EnCicla bloqueada si hay suspensión */
const _brief82 = UI.brief;
UI.brief = function (roleId, turno, o = {}) {
  const s = roleId === 'usuario' && o.free && Cuenta.suspHasta(); if (s && o.bici !== 'propia') o = Object.assign({}, o, { bici: 'propia' });
  _brief82.call(this, roleId, turno, o); if (roleId !== 'usuario' || !o.free) return; const box = $('#briefBody .paper.libre'); if (!box) return;
  if (s) { const b = box.querySelector('[data-bici="encicla"]'); if (b) { b.disabled = true; b.textContent = '🟢 EnCicla (suspendido)'; } }
  const d = document.createElement('p'); d.className = 'm'; d.style.cssText = 'font-size:13px;margin:8px 0 0'; d.textContent = 'Tu cuenta EnCicla: ' + Cuenta.resumen() + '. Con bici de EnCicla renueva cada hora en una estación; con tu bici, el día es libre las 24 horas.'; box.appendChild(d);
};
