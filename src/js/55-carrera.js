/* =====================================================================
   CARRERA DE POSTALES (multijugador): contra un bot o contra un amigo (WebRTC)
   ===================================================================== */
const ROLE_CARRERA = { id: 'carrera', n: 10, name: 'Carrera', tier: 'Multijugador', icon: 'usuario', vista: 'Cenital · competitivo', unlock: 0, desc: 'Carrera de postales: pasa por 4 lugares del valle en orden y llega primero a la estación de meta.', how: ['Pasa por cada postal en el orden indicado.', 'Las ciclorrutas son más rápidas: ¡úsalas!', 'Llega primero a la estación EnCicla de meta.'] };
ROLE.carrera = ROLE_CARRERA;

class ModeCarrera extends MapMode {
  constructor(role, T, opt) {
    super(role, T, opt); const R = this.rng; this.rate = 1.2; this.clock = 480; this.limit = 300;
    this.sim = new StationSim(R, { demand: this.mods.demand });
    const st0 = R.pick(JE.map.stations.filter(s => s.zone === 'centro'));
    this.setupRide({ sim: this.sim, start: { x: st0.x - 5, y: st0.y } });
    const pool = PUBLIC_LM(); let cur = { x: st0.x / TS, y: st0.y / TS }; this.cps = [];
    for (let k = 0; k < 4; k++) {
      const free = pool.filter(l => !this.cps.includes(l)), c = free.filter(l => { const d = Math.hypot(l.x + l.w / 2 - cur.x, l.y + l.h / 2 - cur.y); return d >= 22 * SC && d <= 70 * SC; });
      const pick = R.pick(c.length ? c : free); this.cps.push(pick); cur = { x: pick.x + pick.w / 2, y: pick.y + pick.h / 2 };
    }
    const meta = JE.map.stations.filter(s => s !== st0).sort((a, b) => Math.hypot(a.x / TS - cur.x, a.y / TS - cur.y) - Math.hypot(b.x / TS - cur.x, b.y / TS - cur.y))[0];
    this.pts = this.cps.map(l => ({ x: (l.x + l.w / 2) * TS, y: (l.y + l.h) * TS + 6, r: Math.max(l.w, l.h) * TS / 2 + 10, name: l.name, l })).concat([{ x: meta.x, y: meta.y, r: 18, name: 'Meta: EnCicla ' + meta.name, meta: true }]);
    this.idx = 0; this.place(); this.net = !!opt.net; this.countdown = 3.2; this.netT = 0;
    const mk = (id, name, shirt, k) => ({ id, name, shirt: shirt || PAL.cor, x: st0.x + 5 + k * 3, y: st0.y + k * 2, a: -Math.PI / 2, idx: 0, done: false, ai: !this.net, spd: [0, .72, .84, .95][T], tx: st0.x + 5, ty: st0.y, t: null });
    this.opps = this.net ? (opt.players || [{ id: 0, name: opt.oppName || 'Amigo', shirt: opt.oppShirt }]).map((p, k) => mk(p.id, String(p.name || 'Amigo').slice(0, 16), p.shirt, k)) : [mk(-1, ['', 'Bot Tranquilo', 'Bot Veloz', 'Bot Turbo'][T], opt.oppShirt, 0)];
    this.opp = this.opps[0]; this.ride.opps = this.opps; this.myT = null; this.oppT = null; this.won = false; this.place1 = 0;
    if (this.net) Net.onmsg = m => this.msg(m);
    this.goal('Gana la carrera', true, () => this.won, () => this.won ? '¡1º!' : this.oppT != null ? 'te ganaron' : 'en carrera');
    this.goal('Pasa por las 4 postales', false, () => this.idx >= 4, () => Math.min(this.idx, 4) + '/4');
    this.goal('Máx. 1 choque y 0 en rojo', false, () => this.ride.stats.crashes <= 1 && this.ride.stats.reds === 0, () => this.ride.stats.crashes + ' choques · ' + this.ride.stats.reds + ' rojos');
    this.coach = '¡Prepárate! Sigue la línea hasta la postal 1.';
  }
  place() {
    this.ride.markers = []; const p = this.pts[this.idx]; if (!p) { this.ride.target = null; return; }
    this.ride.target = this.ride.marker({ x: p.x, y: p.y, r: p.r, col: p.meta ? '#ff2fb3' : PAL.amb, label: p.name, num: p.meta ? 0 : this.idx + 1, enter: () => this.reach() });
  }
  reach() {
    const p = this.pts[this.idx]; if (!p || this.myT != null) return; this.idx++;
    if (p.meta) {
      this.myT = this.t; this.won = this.oppT == null; this.place1 = 1 + this.opps.filter(o => o.t != null).length; if (this.won) this.score += 100; else this.score += Math.max(0, 60 - 20 * this.place1);
      this.score += Math.max(0, Math.round(200 - this.t)); this.ride.stamp = { t: 2.2, title: this.won ? '¡GANASTE!' : '¡LLEGASTE!', sub: 'Tiempo: ' + this.t.toFixed(1) + ' s', bg: this.won ? PAL.vd : PAL.amb };
      Snd.sfx(this.won ? 'win' : 'ok'); if (this.net) Net.send({ t: 'fin', time: this.t }); this.endT = 2.4;
    } else { this.score += 25; this.ride.stamp = { t: 1.3, title: 'POSTAL ' + this.idx + ' DE 4', sub: p.name }; Snd.sfx('star'); if (p.l && !Save.data.postales.includes(p.l.id)) Save.data.postales.push(p.l.id); }
    this.place();
  }
  msg(m) {
    const o = this.opps.find(q => q.id === (m.from || 0)); if (!o) return;
    if (m.t === 'p') { o.tx = +m.x || 0; o.ty = +m.y || 0; o.a = +m.a || 0; o.idx = m.i | 0; }
    else if (m.t === 'fin' && o.t == null) this.oppFinish(o);
    else if (m.t === 'bye') { o.gone = true; JE.ui && JE.ui.toast(o.name + ' salió de la carrera'); }
  }
  oppFinish(o) { o.done = true; o.t = this.t; if (this.oppT == null) { this.oppT = this.t; if (this.myT == null) JE.ui && JE.ui.toast('🏁 ' + o.name + ' llegó primero a la meta'); } }
  update(dt) {
    if (this.countdown > 0) { const c0 = Math.ceil(this.countdown); this.countdown -= dt; if (Math.ceil(this.countdown) !== c0 && !JE.headless) Snd.sfx(this.countdown > 0 ? 'tap' : 'win'); this.ride.cam.x = this.ride.p.x; this.ride.cam.y = this.ride.p.y; return; }
    super.update(dt);
  }
  tick(dt) {
    for (const o of this.opps) {
      if (o.ai && !o.done) this.aiStep(o, dt);
      else if (!o.ai) { const k = Math.min(1, dt * 8); o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; }
    }
    if (this.net) { this.netT -= dt; if (this.netT <= 0) { this.netT = .1; const P = this.ride.p; Net.send({ t: 'p', x: Math.round(P.x), y: Math.round(P.y), a: +P.a.toFixed(2), i: this.idx }); } }
    if (this.endT != null) { this.endT -= dt; if (this.endT <= 0) this.end(); }
    else if (this.t > this.limit) { JE.ui && JE.ui.toast('Se acabó el tiempo de la carrera'); this.end(); }
    const p = this.pts[this.idx]; this.coach = p ? (p.meta ? '¡Última! Llega a la ' + p.name : 'Postal ' + (this.idx + 1) + ' de 4: ' + p.name) : '';
  }
  aiStep(o, dt) {
    const p = this.pts[o.idx]; if (!p) return;
    const D = JE.map.flow(Math.floor(p.x / TS), Math.floor(p.y / TS), false); let c = { x: Math.floor(o.x / TS), y: Math.floor(o.y / TS) };
    for (let i = 0; i < 2; i++) { const n = JE.map.nextStep(D, c.x, c.y); if (!n) break; c = n; }
    const tx = c.x * TS + 4, ty = c.y * TS + 4, d0 = Math.hypot(tx - o.x, ty - o.y), ta = d0 > 1 ? Math.atan2(ty - o.y, tx - o.x) : Math.atan2(p.y - o.y, p.x - o.x);
    o.a += clamp(angDiff(o.a, ta), -6 * dt, 6 * dt);
    const v = 60 * o.spd * (SURF[JE.map.get(Math.floor(o.x / TS), Math.floor(o.y / TS))] || .6) * (this.mods.rain ? .93 : 1);
    o.x += Math.cos(o.a) * v * dt; o.y += Math.sin(o.a) * v * dt;
    if (dist(o.x, o.y, p.x, p.y) < p.r) { o.idx++; if (p.meta) this.oppFinish(o); }
  }
  hud2(V) {
    if (this.countdown > 0) { const n = Math.ceil(this.countdown); V.text(n > 0 ? String(n) : '¡YA!', V.w / 2, V.h * .42, { size: 120, align: 'center', color: PAL.amb, stroke: PAL.az, sw: 10 }); V.text('vs ' + this.opps.map(o => o.name).join(', '), V.w / 2, V.h * .42 + 44, { size: 22, align: 'center', color: '#fff', stroke: PAL.az, sw: 5 }); }
    const me = this.idx, op = Math.max(...this.opps.map(o => o.idx)), lead = me > op ? 'Vas ganando' : me < op ? 'Vas detrás' : 'Empatados';
    V.text('Tú ' + Math.min(me, 5) + '/5 · ' + this.opps.map(o => o.name + ' ' + Math.min(o.idx, 5) + '/5').join(' · ') + ' · ' + lead, 10, V.h - 20, { size: 13, color: me >= op ? PAL.vd1 : PAL.amb, bg: '#0a2342dd', pad: 4, body: true });
  }
  info() { return { clock: fmtClock(this.clock), score: Math.round(this.score), chips: [{ t: '🏁 ' + Math.min(this.idx, 5) + '/5' }] }; }
  end() { if (this.net && !this.done) Net.onmsg = m => UI.netLobbyMsg(m); super.end(); }
  bot() { if (this.countdown > 0) return; this.botDrive(); }
}
MODE_CLASS.carrera = ModeCarrera;
