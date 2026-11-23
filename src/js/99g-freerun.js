/* =====================================================================
   FREERUN EN LA COMUNA 13 Y TRUCOS CON GESTO (ronda 3.2, Claude) · el autor: «lugares tipo skating para hacer paradas o trucos,
   hasta parkour», «el 2D para los modos laterales (carreras, side-scrolling)», y el plan (§ 6.3): «trucos con gesto y más zonas:
   las escaleras de la Comuna 13 con freerun lateral».
   A) FREERUN (2D de lado, en pixel): subes por las escaleras eléctricas, las de cemento, los techos y los callejones de la
      Comuna 13 hasta el mirador. Corres solo; tú saltas, te deslizas y, en el aire, haces trucos con gestos:
      tocar o deslizar ↑ salta · deslizar ↓ te desliza (bajo las cuerdas de ropa) · en el aire: ← giro 180, → kong,
      ↑ salto de gato, ↓ rodada (para caer de alto sin tropezar) y un CÍRCULO: mortal 360. Encadenados suben el combo; frente a
      un mural, el truco sale en la foto (+15). En las escaleras eléctricas subes más rápido; si caes a un hueco, vuelves al borde.
      En el menú (tres niveles) y en el valle: en la zona de la Comuna 13, la acción «🧗 Freerun».
   B) GESTOS en la carrera de la ciclorruta: deslizar ◀ ▶ cambia de carril, ↑ salta y, en el aire, cada gesto es un truco con
      nombre (← Tailwhip, → Barspin, ↓ Superman, ↑ X-up y el círculo: 360).
   Dato real: las escaleras eléctricas de la Comuna 13 abrieron en diciembre de 2011: seis tramos que suman 384 m (Alcaldía de
   Medellín; AP). Según la prensa, la subida equivalía a un edificio de unos 28 pisos.
   ===================================================================== */
const Gesto = JE.gesto = {
  /* clasifica un trazo [[x, y]…] en px de pantalla: 'izq', 'der', 'arriba', 'abajo', 'giro' (un círculo) o null (un toque) */
  leer(T) {
    if (!T || T.length < 2) return null; const a = T[0], z = T[T.length - 1], dx = z[0] - a[0], dy = z[1] - a[1]; let giro = 0, largo = 0;
    for (let i = 1; i < T.length; i++) largo += Math.hypot(T[i][0] - T[i - 1][0], T[i][1] - T[i - 1][1]);
    for (let i = 2; i < T.length; i++) { const ax = T[i - 1][0] - T[i - 2][0], ay = T[i - 1][1] - T[i - 2][1], bx = T[i][0] - T[i - 1][0], by = T[i][1] - T[i - 1][1]; if (Math.hypot(ax, ay) < 1.5 || Math.hypot(bx, by) < 1.5) continue; giro += Math.atan2(ax * by - ay * bx, ax * bx + ay * by); }
    if (Math.abs(giro) > 4.4 && largo > 80) return 'giro';
    if (Math.hypot(dx, dy) < 24) return null;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'der' : 'izq') : (dy < 0 ? 'arriba' : 'abajo');
  },
  /* el lienzo no le pasa el movimiento del dedo a los minijuegos: aquí se anota el trazo del que lo pida (a._traz) */
  instalar() {
    if (this._ok) return; const cv = $('#cv'); if (!cv) return; this._ok = 1;
    cv.addEventListener('pointermove', e => { const M = Game.mode, a = M && (M.sub || M); if (!a || !a._traz) return; const r = cv.getBoundingClientRect(); a._traz.push([e.clientX - r.left, e.clientY - r.top]); if (a._traz.length > 90) a._traz.splice(1, 1); if (a.alMover) a.alMover(); }, { passive: true });
  }
};

const FR = { K: 10, G: 24, SALTO: 8.4, VEL: 5.6, TRUCOS: { izq: ['Giro 180', Math.PI], der: ['Kong', 0], arriba: ['Salto de gato', 0], abajo: ['Rodada', 0], giro: ['Mortal 360', TAU] } };
class MGFreerun extends MG {
  constructor(parent, o = {}) {
    super(parent, o); this.nivel = clamp(o.nivel || 1, 1, 3); this.metaM = o.metaM || [0, 230, 330, 430][this.nivel]; this.dur = o.dur || [0, 80, 100, 115][this.nivel];
    this.x = 0; this.y = 0; this.vy = 0; this.suelo = true; this.coyote = 0; this.desliza = 0; this.trucoT = 0; this.giro = 0; this.giroV = 0; this.rodada = 0; this.pose = '';
    this.combo = 0; this.trucos = 0; this.estrellas = 0; this.tropiezos = 0; this.caidas = 0; this.yMax = 0; this.v = FR.VEL; this.tropT = 0; this.pasos = 0;
    this.segs = []; this.items = []; this.armar(); this.camY = 0; this.min = parent.clock || 9 * 60; this.fx = [];
    this.coach = 'Toca para saltar · desliza ↓ bajo las cuerdas · en el aire, desliza o haz un círculo: ¡trucos!';
    Gesto.instalar();
  }
  /* ---------- el recorrido: calles, escaleras, escaleras eléctricas y huecos entre techos, hasta el mirador ---------- */
  armar() {
    const R = this.rng, S = this.segs, I = this.items, n = this.nivel; let x = 0, h = 0;
    const add = (tipo, largo, sube = 0) => { S.push({ x0: x, x1: x + largo, h0: h, h1: h + sube, tipo }); x += largo; h += sube; };
    add('calle', 14); for (let k = 0; k < 4; k++) I.push({ x: 6 + k * 1.5, y: .9, k: 'estrella' });   // la salida, con estrellas para empezar sumando
    while (x < this.metaM) {
      const r = R.f();
      if (r < .2) { const l = R.range(9, 15); add('electrica', l, l * .55); for (let k = 0; k < 3; k++) I.push({ x: x - l + 2 + k * 2.6, y: 0, k: 'estrella', sobre: 1 }); }
      else if (r < .36) { const l = R.range(5, 9); add('escalera', l, l * .6); }
      else if (r < .36 + (n > 1 ? .2 : .08)) { const l = R.range(1.5, n > 2 ? 3.1 : 2.5); add('hueco', l); for (let k = 1; k < 4; k++) I.push({ x: x - l + l * k / 4, y: h + 1.4 + Math.sin(Math.PI * k / 4) * .7, k: 'estrella' }); add('calle', R.range(4, 7)); }
      else {
        const l = R.range(10, 17), x0 = x; add('calle', l);
        const ob = R.pick(n === 1 ? ['matera', 'cuerda', 'perro', 'nada'] : ['matera', 'cuerda', 'muro', 'perro', 'chaza', 'cuerda']);
        if (ob !== 'nada') I.push({ x: x0 + l * R.range(.5, .72), y: h, k: ob });
        for (let k = 0; k < 3; k++) I.push({ x: x0 + 1.5 + k * 1.4, y: h + .9, k: 'estrella' });
        if (R.f() < .3) I.push({ x: x0 + l * .3, y: h, k: 'mural', m: R.i(0, 4) });
      }
    }
    add('calle', 18); this.fin = x - 12; this.hFin = h; I.sort((a, b) => a.x - b.x);
    for (const it of I) if (it.sobre) it.y = this.alto(it.x) + .9;   // las estrellas de las escaleras eléctricas, sobre los escalones
  }
  segEn(x) { const S = this.segs; let i = this._si | 0; if (i >= S.length) i = 0; while (i > 0 && x < S[i].x0) i--; while (i < S.length - 1 && x >= S[i].x1) i++; this._si = i; return x >= S[i].x0 && x < S[i].x1 ? S[i] : null; }
  alto(x) { const s = this.segEn(x); if (!s || s.tipo === 'hueco') return null; return s.h0 + (s.h1 - s.h0) * (x - s.x0) / (s.x1 - s.x0); }
  /* ---------- lo que hace quien juega ---------- */
  saltar() {
    if (this.done || this.llego) return; if (this.suelo || this.coyote > 0) { this.suelo = false; this.coyote = 0; this.vy = FR.SALTO; this.yMax = this.y; this.desliza = 0; Snd.sfx('tap'); return; }
    this.truco('arriba');
  }
  deslizar() { if (this.done || this.llego) return; if (this.suelo) { this.desliza = .7; Snd.sfx('tap'); } else { this.vy = Math.min(this.vy, -9); this.truco('abajo'); } }
  truco(g) {
    if (this.suelo || this.trucoT > 0 || !FR.TRUCOS[g]) return; const [nombre, giro] = FR.TRUCOS[g];
    if (g === 'abajo') { this.rodada = .55; this.pose = 'bola'; this.trucoT = .2; this.giroV = 0; return; }   // la rodada se cobra al caer
    this.trucoT = giro ? .46 : .32; this.giroV = giro / this.trucoT; this.pose = g; this.combo++; this.trucos++;
    const mural = this.items.find(it => it.k === 'mural' && Math.abs(it.x + 2 - this.x) < 3.5), p = 10 * this.combo + (giro === TAU ? 10 : 0) + (mural ? 15 : 0);
    this.score += p; this.pop(nombre + (this.combo > 1 ? ' ×' + this.combo : '') + ' +' + p + (mural ? ' 📸' : ''), 100, 120, this.combo > 2 ? PAL.amb : '#fff'); Snd.sfx(this.combo > 2 ? 'star' : 'coin'); vib(12);
  }
  aterrizar(g) {
    const alto = this.yMax - g; this.y = g; this.vy = 0; this.suelo = true; this.coyote = 0;
    if (this.trucoT > .06 && this.giroV) { this.tropezar('¡Caíste girando!'); }
    else if (this.rodada > 0 && alto > 1.2) { this.score += 8; this.pop('Rodada +8', 100, 128, PAL.vd1); Snd.sfx('ok'); }
    else if (alto > 2.6) this.tropezar('¡Caíste de muy alto! ↓ en el aire para rodar');
    else { for (let k = 0; k < 3; k++) this.fx.push({ x: this.x, y: g, vx: (k - 1) * 1.2, vy: 1 + k * .3, t: .4 }); }
    this.trucoT = 0; this.giro = 0; this.giroV = 0; this.rodada = 0; this.pose = ''; this.yMax = g;
  }
  tropezar(txt) { if (this.tropT > 0) return; this.tropT = .9; this.tropiezos++; this.combo = 0; this.bad(txt, 100, 128); }
  caer(s) {   // cayó a un hueco: vuelve al borde de antes, sin perder lo ganado
    this.caidas++; this.combo = 0; this.bad('¡Al hueco! Salta antes del borde', 100, 128); this.x = Math.max(0, s.x0 - 2.5); this.y = this.alto(this.x) || s.h0; this.vy = 0; this.suelo = true; this.tropT = .5; this.trucoT = 0; this.giro = 0; this.pose = '';
  }
  /* ---------- el ciclo ---------- */
  update(dt) {
    this.tick(dt); this.min += dt * 2; if (this.done) return;
    for (const f of this.fx) { f.t -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy -= 6 * dt; } this.fx = this.fx.filter(f => f.t > 0);
    if (this.endT != null) { this.endT -= dt; this.x += 1.5 * dt; if (this.endT <= 0) this.done = true; return; }
    const s = this.segEn(this.x), elec = this.suelo && s && s.tipo === 'electrica', esc = this.suelo && s && s.tipo === 'escalera';
    const meta = (FR.VEL + Math.min(1.4, this.x / 300)) * (this.tropT > 0 ? .45 : 1) * (elec ? 1.35 : esc ? .82 : 1) * (this.desliza > 0 ? 1.08 : 1);
    this.v += (meta - this.v) * Math.min(1, dt * 4); this.x += this.v * dt; if (this.suelo) this.pasos += this.v * dt;
    this.tropT = Math.max(0, this.tropT - dt); this.desliza = Math.max(0, this.desliza - dt); this.rodada = Math.max(0, this.rodada - dt); this.coyote = Math.max(0, this.coyote - dt);
    if (this.trucoT > 0) { this.trucoT = Math.max(0, this.trucoT - dt); this.giro += this.giroV * dt; if (!this.trucoT && this.pose !== 'bola') { this.pose = ''; } }
    const g = this.alto(this.x);
    if (this.suelo) { if (g == null) { this.suelo = false; this.vy = 0; this.coyote = .1; this.yMax = this.y; } else this.y = g; }
    if (!this.suelo) {
      this.vy -= FR.G * dt; this.y += this.vy * dt; this.yMax = Math.max(this.yMax, this.y);
      if (g != null && this.y <= g && this.vy <= 0) this.aterrizar(g);
      else if (g != null && this.y < g - .45) { this.y = g; this.aterrizar(g); }   // contra el escalón de una subida: arriba
      else if (g == null) { const sx = this.segEn(this.x); if (sx && sx.tipo === 'hueco' && this.y < sx.h0 - 3.5) this.caer(sx); }
    }
    /* obstáculos y estrellas */
    const cuerpo = this.desliza > 0 ? .8 : 1.7;
    for (const it of this.items) {
      if (it.hecho || it.k === 'mural') continue; const dx = it.x - this.x; if (dx > .6) break; if (dx < -1.2) continue;
      if (it.k === 'estrella') { if (Math.abs(dx) < .6 && it.y > this.y - .3 && it.y < this.y + cuerpo + .5) { it.hecho = 1; this.estrellas++; this.score += 2; Snd.sfx('coin'); } continue; }
      if (Math.abs(dx) > .45) continue; const alto = { matera: .6, perro: .5, chaza: 1.1, muro: 1 }[it.k];
      if (it.k === 'cuerda') { it.hecho = 1; if (this.desliza > 0) { this.score += 4; this.pop('Por debajo +4', 100, 128, PAL.vd1); } else this.tropezar('👕 ¡La ropa tendida! Desliza ↓'); continue; }
      if (this.y - it.y > alto - .05) { it.hecho = 1; const p = it.k === 'perro' ? 5 : 3; this.score += p; this.pop(it.k === 'perro' ? '🐕 Sin despertarlo +5' : '¡Bien saltado! +' + p, 100, 128, PAL.vd1); continue; }
      it.hecho = 1; this.tropezar({ matera: '🪴 ¡La matera!', perro: '🐕 ¡Uy, lo despertaste!', chaza: '☂️ ¡La chaza!', muro: '🧱 ¡El muro! Salta antes' }[it.k] || '¡Cuidado!');
    }
    if (this.x >= this.fin && !this.llego) {
      this.llego = true; const t = Math.max(0, Math.round(this.dur - this.t)); this.score += 20 + t; this.endT = 1.6; Snd.sfx('win');
      this.pop('🏁 ¡El mirador! +' + (20 + t), 100, 110, PAL.amb); this.coach = '¿Sabías que? Las escaleras eléctricas abrieron en diciembre de 2011: seis tramos y 384 m de subida.';
    }
    if (this.t >= this.dur && !this.llego) this.done = true;
    if (!this.llego) this.coach = this.suelo ? (this.tropT > 0 ? 'Levántate… ¡sigue!' : 'Toca: saltar · ↓ deslizarte · en el aire: ← → ↑ ↓ o un círculo') : 'En el aire: desliza ← → ↑ ↓ o haz un círculo para un truco';
  }
  /* ---------- la entrada: toques, gestos y teclas ---------- */
  pointer(type, vx, vy, cx, cy) {
    if (type === 'down') { for (const b of this.btns) if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) { Snd.sfx('tap'); b.fn(); return true; } this._traz = [[cx, cy]]; this._usado = false; return true; }
    if (type === 'up' && this._traz) { const T = this._traz; this._traz = null; if (this._usado) return true; const g = Gesto.leer(T); this.gesto(g); return true; }
    return false;
  }
  /* en el piso, el gesto ↑ o ↓ se cumple apenas se reconoce (sin esperar a soltar el dedo): se siente inmediato */
  alMover() {
    const T = this._traz; if (!T || this._usado || !this.suelo || T.length < 2) return; const a = T[0], z = T[T.length - 1], dx = z[0] - a[0], dy = z[1] - a[1];
    if (Math.abs(dy) > 28 && Math.abs(dy) > Math.abs(dx) * 1.3) { this._usado = true; dy < 0 ? this.saltar() : this.deslizar(); }
  }
  gesto(g) { if (g == null) return this.saltar(); if (this.suelo) { if (g === 'arriba' || g === 'giro') this.saltar(); else if (g === 'abajo') this.deslizar(); else this.saltar(); return; } this.truco(g); }
  key(e) { if (!e || e.repeat) return; const f = { Space: () => this.saltar(), ArrowUp: () => this.saltar(), KeyW: () => this.saltar(), ArrowDown: () => this.deslizar(), KeyS: () => this.deslizar(), ArrowLeft: () => this.truco('izq'), ArrowRight: () => this.truco('der'), KeyE: () => this.truco('giro') }[e.code]; if (f) { if (e.preventDefault) e.preventDefault(); f(); } }
  bot() {   // para las pruebas: salta huecos y obstáculos, se desliza bajo las cuerdas y hace un truco en el aire
    const s = this.segEn(this.x + 1.3); if (this.suelo && s && s.tipo === 'hueco') return this.saltar();
    const it = this.items.find(i => !i.hecho && i.k !== 'estrella' && i.k !== 'mural' && i.x - this.x > .2 && i.x - this.x < 1.7);
    if (it && this.suelo) return it.k === 'cuerda' ? this.deslizar() : this.saltar();
    if (!this.suelo && this.vy > 2 && !this.trucoT) this.truco(this.rng.f() < .5 ? 'izq' : 'giro');
  }
  /* ---------- el dibujo (pixel, de lado) ---------- */
  render(V) {
    const b = V.b, vw = V.vw, vh = V.vh, K = FR.K, n = Art.night(this.min), y0 = Math.round(vh * (vh > vw * 1.3 ? .68 : .6));
    this.camY += (this.y - this.camY) * .12; const cx = this.x - vw * .24 / K, X = x => Math.round((x - cx) * K), Y = h => Math.round(y0 - (h - this.camY) * K); this.L = { vw, vh };
    /* el valle al fondo (la panorámica de siempre) que baja a medida que subes */
    const hz = Math.round(clamp(vh * .5 + this.camY * K * .35, vh * .42, vh * .9) / 8) * 8;   /* en pasos de 8 px: la panorámica se guarda y no se vuelve a pintar en cada cuadro */ b.drawImage(Art.panorama(vw, vh, this.min, hz), 0, 0);
    if (JE.capas) JE.capas.dibujar(b, 'comuna13', cx * K, vw, vh); /* K-2: capas opcionales */
    /* las casas de ladrillo de la ladera (paralaje), con su color, ventanas y techos */
    const par = .5, base = cx * par, dark = n > .5; prect(b, 0, hz, vw, vh - hz, dark ? '#1c2a22' : '#5f7d45');   /* la ladera bajo el horizonte */
    for (let i = Math.floor(base / 5) - 1; i < Math.floor(base / 5) + vw / (5 * K) + 2; i++) {
      const hx = Math.round((i * 5 - base) * K), hh = 30 + Math.floor(h2(i, 3, 7) * 40), hy = Y(this.camY * .6 + i * 5 * .18 - 2) - hh, col = ['#b5553a', '#c46a4a', '#a24a32', '#d08a5a', '#e0c070', '#6aa3c8', '#d96a8a'][Math.floor(h2(i, 4, 7) * 7)];
      prect(b, hx, hy, 50, vh - hy, shade(col, dark ? -.55 : -.1)); prect(b, hx, hy - 3, 50, 3, shade('#7a3a2a', dark ? -.5 : 0));
      for (let wy = hy + 6; wy < hy + hh - 6; wy += 12) for (let wx = hx + 5; wx < hx + 46; wx += 13) prect(b, wx, wy, 6, 6, dark ? (h2(wx, wy, 2) > .45 ? '#ffd970' : '#1a2233') : '#2b3442');
    }
    /* murales al fondo del camino */
    const MUR = [['#ff5a5a', '#ffd84a', '#3fa3ff'], ['#9bd341', '#ff8fc7', '#2a2a6a'], ['#ffb03a', '#3fd0c9', '#7a3fa0'], ['#e84a5f', '#2a9df4', '#f9d423'], ['#56c7ff', '#ff6b5a', '#ffe066']];
    for (const it of this.items) { if (it.k !== 'mural') continue; const x = X(it.x - 1), y = Y(it.y) - 52; if (x > vw || x < -60) continue; const c = MUR[it.m % MUR.length];
      prect(b, x, y, 48, 40, c[0]); prect(b, x + 4, y + 4, 18, 32, c[1]); pring(b, x + 33, y + 18, 9, c[2]); prect(b, x + 26, y + 30, 18, 6, c[1]); prect(b, x + 8, y + 10, 4, 4, '#141414'); prect(b, x + 30, y + 15, 6, 6, '#fff'); }
    /* el piso: calles, escaleras, escaleras eléctricas (con su techo naranja) y huecos */
    for (const s of this.segs) {
      const a = X(s.x0), z = X(s.x1); if (z < -4 || a > vw + 4) continue;
      if (s.tipo === 'hueco') continue;
      if (s.tipo === 'calle') { const y = Y(s.h0); b.save(); b.fillStyle = this.muro(b, dark); b.translate(-((cx * K) % 16), 0); b.fillRect(a + ((cx * K) % 16), y, z - a + 1, vh - y); b.restore(); prect(b, a, y, z - a + 1, 3, dark ? '#6a6a66' : '#b4b0a6'); continue; }   /* el muro de contención de ladrillo bajo la calle (patrón guardado: barato) */
      const elec = s.tipo === 'electrica', paso = .36, n2 = Math.ceil((s.x1 - s.x0) / paso);
      for (let k = 0; k < n2; k++) { const xa = s.x0 + k * paso, h = s.h0 + (s.h1 - s.h0) * ((k + 1) * paso) / (s.x1 - s.x0), xs = X(xa), ys = Y(Math.min(h, s.h1)), w = Math.max(1, X(xa + paso) - xs);
        prect(b, xs, ys, w + 1, vh - ys, elec ? (dark ? '#4a4e56' : '#8c9096') : (dark ? '#4a4844' : '#9a968c')); prect(b, xs, ys, w + 1, 1, elec ? '#e8c838' : (dark ? '#777' : '#c8c4b8')); }
      prect(b, a, Y(s.h0) - 9, 1, 9, '#555'); /* baranda */ for (let x = a; x < z; x += 2) { const h = s.h0 + (s.h1 - s.h0) * ((x - a) / Math.max(1, z - a)); prect(b, x, Y(h) - 10, 2, 1, elec ? '#cfd3d8' : '#6a6a6a'); }
      if (elec) for (let x = a; x < z; x += 3) { const h = s.h0 + (s.h1 - s.h0) * ((x - a) / Math.max(1, z - a)); prect(b, x, Y(h) - 30, 3, 3, dark ? '#8a4a22' : '#e8772e'); if ((x - a) % 30 < 3) prect(b, x, Y(h) - 27, 1, 27, '#9aa0a8'); }
    }
    /* el mirador */
    { const x = X(this.fin + 2), y = Y(this.hFin); if (x < vw + 40) { prect(b, x, y - 22, 1, 22, '#6a4a2a'); prect(b, x + 1, y - 22, 16, 9, PAL.vd); prect(b, x + 30, y - 9, 40, 1, '#6a6a6a'); for (let k = 0; k < 40; k += 5) prect(b, x + 30 + k, y - 9, 1, 9, '#6a6a6a'); } }
    /* obstáculos y estrellas */
    for (const it of this.items) {
      if (it.hecho || it.k === 'mural') continue; const x = X(it.x), y = Y(it.y); if (x < -12 || x > vw + 12) continue;
      if (it.k === 'estrella') { const p = (this.t * 6 + it.x) % 2 < 1 ? 1 : 0; prect(b, x - 1, y - 3 - p, 3, 7, '#ffd84a'); prect(b, x - 3, y - 1 - p, 7, 3, '#ffd84a'); prect(b, x, y - p, 1, 1, '#fff'); continue; }
      if (it.k === 'matera') { prect(b, x - 3, y - 6, 7, 6, '#c0603a'); prect(b, x - 4, y - 7, 9, 2, '#a04a2a'); prect(b, x - 3, y - 11, 7, 5, '#3f8a3f'); prect(b, x - 1, y - 13, 3, 2, '#e84a8a'); }
      else if (it.k === 'perro') { prect(b, x - 5, y - 4, 10, 4, '#a0703a'); prect(b, x + 4, y - 6, 4, 4, '#a0703a'); prect(b, x + 7, y - 5, 1, 1, '#141414'); }
      else if (it.k === 'chaza') { prect(b, x - 6, y - 7, 12, 6, '#2a6ab0'); prect(b, x - 5, y - 1, 2, 1, '#222'); prect(b, x + 3, y - 1, 2, 1, '#222'); prect(b, x, y - 17, 1, 10, '#555'); prect(b, x - 7, y - 19, 15, 3, '#ff5a5a'); prect(b, x - 3, y - 19, 4, 3, '#ffd84a'); }
      else if (it.k === 'muro') { for (let k = 0; k < 5; k++) prect(b, x - 3, y - 2 - k * 2, 7, 2, k % 2 ? '#b5553a' : '#a24a32'); }
      else if (it.k === 'cuerda') { prect(b, x - 9, y - 20, 1, 20, '#6a4a2a'); prect(b, x + 9, y - 20, 1, 20, '#6a4a2a'); prect(b, x - 9, y - 16, 19, 1, '#ddd'); [['#ff5a5a', -6], ['#56c7ff', -1], ['#ffd84a', 4]].forEach(([c, d]) => prect(b, x + d, y - 15, 4, 5, c)); }
    }
    for (const f of this.fx) prect(b, X(f.x), Y(f.y), 1, 1, '#d9d2c2');
    /* quien corre: la persona de lado con su ropa (Art.person), con la pose del truco */
    const px = X(this.x), py = Y(this.y), me = Art.me();
    b.save(); b.translate(px, py - 9);
    if (this.giro) b.rotate(this.giro);
    if (this.desliza > 0 && this.suelo) b.rotate(-1.2); else if (this.pose === 'bola') b.scale(1, .7); else if (this.pose === 'der') b.rotate(.5); else if (this.pose === 'arriba') b.scale(1.1, .9);
    if (this.tropT > 0 && (this.t * 12 | 0) % 2) b.globalAlpha = .55;
    b.scale(1.3, 1.3); if (!(JE.capas && JE.capas.corredor(b, this, 0, 9, 14, 22))) Art.person(b, 0, 9, me, this.suelo ? this.pasos / 1.4 : .25, 1); b.restore();   /* un poco más grande que la escala del mundo: se lee en el celular */
  }
  /* el patrón de ladrillo (16 × 8 px), uno de día y otro de noche */
  muro(b, dark) {
    const k = dark ? 'n' : 'd'; this._pat = this._pat || {}; if (this._pat[k]) return this._pat[k];
    const c = document.createElement('canvas'); c.width = 16; c.height = 8; const g = c.getContext('2d'), A = dark ? ['#3a3230', '#2e2826'] : ['#8a5a44', '#6e4634'];
    prect(g, 0, 0, 16, 8, A[1]); prect(g, 0, 0, 7, 3, A[0]); prect(g, 8, 0, 7, 3, A[0]); prect(g, 4, 4, 7, 3, A[0]); prect(g, 12, 4, 4, 3, A[0]); prect(g, 0, 4, 3, 3, A[0]);
    return (this._pat[k] = b.createPattern(c, 'repeat'));
  }
  hud(V) {
    this.btns = []; const w = V.w, pct = Math.min(100, Math.round(this.x / this.fin * 100)), top = (View.hudB || 50) + 42;
    V.text('🧗 ' + Math.round(Math.min(this.x, this.fin)) + ' / ' + Math.round(this.fin) + ' m · ⭐ ' + this.estrellas + (this.combo > 1 ? ' · combo ×' + this.combo : '') + ' · ⏱ ' + Math.max(0, Math.ceil(this.dur - this.t)) + ' s', 12, top, { size: 13, color: '#fff', bg: '#0a2342cc', pad: 4 });
    const c = V.ctx; c.fillStyle = '#0a234299'; c.fillRect(12, top + 8, w - 24, 5); c.fillStyle = PAL.vd1; c.fillRect(12, top + 8, (w - 24) * pct / 100, 5);
    const y = V.h - 92, bw = Math.min(110, Math.floor((w - 40) / 3)), x0 = Math.round((w - (bw * 3 + 16)) / 2);
    this.button(V, x0, y, bw, 46, '▲ Salta', () => this.saltar(), { bg: PAL.vd2, size: 15, key: 'u' });
    this.button(V, x0 + bw + 8, y, bw, 46, '▼ Desliza', () => this.deslizar(), { bg: PAL.az2, size: 14, key: 'd' });
    this.button(V, x0 + (bw + 8) * 2, y, bw, 46, '✨ Truco', () => this.suelo ? this.saltar() : this.truco('giro'), { bg: '#b0651a', size: 14, key: 't' });
    this.drawPops(V);
  }
}
JE.MGFreerun = MGFreerun;

/* ---------- en el menú: tres niveles ---------- */
class ModoFreerun extends ModeSub {
  constructor(role, turno, opt) {
    super(role, turno, opt); this.clock = [9 * 60, 15 * 60, 18 * 60 + 20][turno - 1] || 540;
    const S = this.sub = new MGFreerun(this, { nivel: turno }); S.min = this.clock; this.view = S.view;
    this.goal('Llega al mirador', true, () => !!S.llego, () => Math.round(Math.min(S.x, S.fin)) + ' m');
    this.goal('Junta 15 estrellas', false, () => S.estrellas >= 15, () => S.estrellas + '/15');
    this.goal('5 trucos y máximo 2 tropiezos', false, () => S.trucos >= 5 && S.tropiezos + S.caidas <= 2, () => S.trucos + ' trucos · ' + (S.tropiezos + S.caidas) + ' tropiezos');
  }
}
if (JE.modos && JE.modos.registrar) JE.modos.registrar({ id: 'freerun', name: 'Freerun Comuna 13', cls: ModoFreerun, emoji: '🧗', niveles: ['Las escaleras', 'Los techos', 'A toda'],
  desc: 'Parkour de lado por las escaleras eléctricas, los techos y los callejones de la Comuna 13, hasta el mirador. Trucos con gestos.',
  how: ['Toca para saltar; desliza hacia abajo para pasar bajo las cuerdas de ropa.', 'En el aire, desliza ← → ↑ ↓ o haz un círculo: cada gesto es un truco. Frente a un mural, sale en la foto.', 'Si caes de muy alto, desliza ↓ antes de tocar el piso: una rodada.'] });

(function () {
  /* ---------- en el valle: la Comuna 13 es zona de parkour y de freerun ---------- */
  if (typeof Trucos !== 'undefined' && !Trucos.ZONAS.includes('comuna13')) { Trucos.ZONAS.push('comuna13'); Trucos._z = null; }
  if (typeof ModeUsuarioR !== 'undefined') {
    ModeUsuarioR.prototype.iniciarFreerun = function () {
      if (!this.free || this.sub) return; const nivel = 2;
      this.runSub(new MGFreerun(this, { nivel }), mg => {
        this.score += Math.round(mg.score); this.ride.stamp = { t: 2.5, title: mg.llego ? '¡AL MIRADOR!' : '¡BUEN FREERUN!', sub: 'Comuna 13 · ⭐ ' + mg.estrellas + ' · ' + mg.trucos + ' trucos', bg: mg.llego ? PAL.vd : PAL.cie };
        if (JE.ui) JE.ui.toast('🧗 Freerun: +' + Math.round(mg.score) + ' · ¿Sabías que? Las escaleras eléctricas de la Comuna 13 (2011) suman 384 m en seis tramos.');
        if (JE.diario) JE.diario.anotar('Freerun en la Comuna 13: ⭐ ' + mg.estrellas + ' · ' + mg.trucos + ' trucos' + (mg.llego ? ' · llegaste al mirador' : ''), '🧗');
      });
    };
    const _act = ModeUsuarioR.prototype.actions;
    ModeUsuarioR.prototype.actions = function () {
      const a = _act.call(this); if (!this.free || this.sub || this.sitting || !this.ride) return a; const z = typeof Trucos !== 'undefined' && Trucos.en(this.ride);
      if (z && z.id === 'comuna13') a.push({ id: 'freerun', icon: 'estrella', label: '🧗 Freerun', fn: () => this.iniciarFreerun() });
      return a;
    };
    if (typeof HUD21 !== 'undefined' && !HUD21.CTX.includes('freerun')) HUD21.CTX.splice(1, 0, 'freerun');
    if (typeof ICO21 !== 'undefined') ICO21.freerun = 'M13 4a2 2 0 1 0 0 .01 M7 21l3-6 3 2v4 M10 15l1-5 4 2 3-1 M8 10l3-1';
  }
  /* ---------- B) gestos en la carrera de la ciclorruta ---------- */
  if (typeof CarreraCiclovia !== 'undefined') {
    const C = CarreraCiclovia.prototype, NOM = { izq: 'Tailwhip', der: 'Barspin', abajo: 'Superman', arriba: 'X-up', giro: '360' };
    C.trucoGesto = function (g) {
      if (!(this.altura > .25) || this._tTruco > 0) return false; this._tTruco = .35; this.comboT = (this.comboT | 0) + 1;
      const p = 20 * this.comboT + (g === 'giro' ? 15 : 0); this.trucos = (this.trucos | 0) + 1; this.score += p; this.bono = (this.bono | 0) + p; Snd.sfx(g === 'giro' ? 'star' : 'coin'); this.pop((NOM[g] || 'Truco') + ' +' + p, 100, 190, PAL.amb); return true;
    };
    const _p = C.pointer;
    C.pointer = function (type, vx, vy, cx, cy) {
      if (type === 'down') { if (_p.call(this, type, vx, vy, cx, cy)) return true; Gesto.instalar(); this._traz = [[cx, cy]]; return true; }
      if (type === 'up' && this._traz) { const g = Gesto.leer(this._traz); this._traz = null; if (g == null) return false;
        if (this.altura > .25 && this.trucoGesto(g)) return true; if (g === 'izq' || g === 'der') this.mover(g === 'der' ? 1 : -1); else if (g === 'arriba') this.saltar(); return true; }
      return _p.call(this, type, vx, vy, cx, cy);
    };
  }
  /* ---------- Run 3D: las teclas llegaban como evento (Game.key) y el corredor esperaba el nombre de la tecla ---------- */
  if (typeof MGRunner3D !== 'undefined') { const _k = MGRunner3D.prototype.key; MGRunner3D.prototype.key = function (e) { if (e && typeof e === 'object') { if (e.repeat) return; return _k.call(this, e.code); } return _k.call(this, e); }; }
})();
