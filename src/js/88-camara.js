/* =====================================================================
   CÁMARA (v1.7): pellizcar para acercar o alejar, girar con dos dedos, inclinar (dos dedos hacia arriba o abajo),
   cámara libre para mirar a voluntad y ángulos rápidos (arriba, inclinada, baja, detrás de la bici).
   Todo en la ciudad 3D; en pixel clásico el pellizco cambia el zoom por pasos enteros.
   Teclado: + y − acercan, Z y X giran, R y F inclinan, T cambia el ángulo, C cámara libre, N mira al norte.
   ===================================================================== */
const CAM_ANG = [
  { id: 'arriba', n: 'Desde arriba', t: 0, sigue: 0 },
  { id: 'inclinada', n: 'Inclinada', t: .5, sigue: 0 },
  { id: 'baja', n: 'Baja', t: .85, sigue: 0 },
  { id: 'detras', n: 'Detrás de la bici', t: .62, sigue: 1 }
];
const Cam = JE.cam = {
  ZMIN: .62, ZMAX: 1.9,
  cfg() { const S = Save.data.settings; if (!S.cam || typeof S.cam !== 'object') S.cam = { z: 1, t: 0, r: 0, sigue: 0 }; return S.cam; },
  d3() { return GFX() === '3d' && Save.data.settings.vista !== 'pano'; },
  ride() { const M = Game.mode; return M && M.ride && !M.sub && M.view && M.view.kind === 'map' ? M.ride : null; },
  /* zoom: continuo en 3D; en pixel, pasos enteros del zoom de siempre */
  zoom(f) {
    const C = this.cfg();
    if (!this.d3()) { const S = Save.data.settings, z = clamp((S.zoom | 0) + (f > 1 ? 1 : -1), -1, 2); if (z !== (S.zoom | 0)) { S.zoom = z; View.apply(); } return; }
    C.z = clamp(C.z * f, this.ZMIN, this.ZMAX);
  },
  girar(da) { const C = this.cfg(); if (!this.d3()) return; C.sigue = 0; C.r = angDiff(0, C.r + da); if ((C.t || 0) < .28) C.t = Math.min(.28, (C.t || 0) + Math.min(.14, Math.abs(da) * .9)); }   // girar con la cámara cenital no se notaría: se inclina suavemente
  ,
  inclinar(dt) { const C = this.cfg(); if (!this.d3()) return; C.t = clamp((C.t || 0) + dt, 0, 1); },
  angulo() { const C = this.cfg(); let i = CAM_ANG.findIndex(a => Math.abs(a.t - (C.t || 0)) < .04 && a.sigue === (C.sigue | 0)); i = (i + 1) % CAM_ANG.length; const A = CAM_ANG[i]; C.t = A.t; C.sigue = A.sigue; if (!A.sigue && A.id === 'arriba') C.r = 0; Save.save(); return A; },
  norte() { const C = this.cfg(); C.r = 0; C.sigue = 0; Save.save(); },
  /* la velocidad de la bici, siempre a la mano: tranquila, normal, rápida o muy rápida */
  velocidad(M) {
    if (M && (M.net || M.id === 'carrera')) { JE.ui && JE.ui.toast('🏁 En las carreras y en red todos van a la misma velocidad'); return; }
    const S = Save.data.settings, i = VELS.findIndex(v => v[0] === velMul(M)), V = VELS[(i + 1) % VELS.length]; S.vel = V[0]; Save.save();
    JE.ui && JE.ui.toast(V[2] + ' Velocidad ' + V[1].toLowerCase() + (V[0] > 1 ? ': el día también pasa más rápido' : V[0] < 1 ? ': todo con calma' : ''));
  },
  libre(R, on) {
    R = R || this.ride(); if (!R) return; const L = R.libre || (R.libre = { on: false });
    L.on = on == null ? !L.on : !!on; if (Ctrl.clear) Ctrl.clear(); else Input.joy.on = false; Snd.sfx('tap');   // al salir, la cámara vuelve sola a la bici (camara() en 30-ride.js)
    if (L.on && JE.ui) JE.ui.toast('📷 Cámara libre: arrastra para mirar la ciudad · pellizca para acercar · ⌖ para volver');
  },
  /* cada cuadro: suaviza ángulo e inclinación y avisa a la vista */
  tick(R, dt) {
    if (JE.headless) return; const C = this.cfg(), on = this.d3() && !panoOn(R), P = R.p;
    if (on && C.sigue && P.v > 6 * WK) C.r = angDiff(0, P.a + Math.PI / 2);   // detrás de la bici: la cámara gira con el rumbo
    const tr = on ? C.r || 0 : 0, tt = on ? C.t || 0 : 0;
    R.rot = angDiff(0, (R.rot || 0) + angDiff(R.rot || 0, tr) * (1 - Math.exp(-dt * (C.sigue ? 2.6 : 12))));
    R.til = (R.til || 0) + (tt - (R.til || 0)) * (1 - Math.exp(-dt * 8));
    const ron = on && (Math.abs(R.rot) > .002 || Math.abs(tr) > .002), zf = on ? C.z || 1 : 1;
    View.rot = ron ? R.rot : 0;
    if (ron !== View.rotOn || zf !== View.zf) { View.rotOn = ron; View.zf = zf; View.apply(); }
    // cámara libre: con el teclado, las flechas mueven la cámara (la bici se queda quieta)
    const L = R.libre; if (L && L.on) { const k = Input.keys; let x = 0, y = 0; if (k.ArrowLeft || k.KeyA) x--; if (k.ArrowRight || k.KeyD) x++; if (k.ArrowUp || k.KeyW) y--; if (k.ArrowDown || k.KeyS) y++; if (x || y) { const d = R.girarDir({ x, y, m: 1 }), v = 260 / (View.s || 2); R.cam.x += d.x * v * dt; R.cam.y += d.y * v * dt; this.limita(R); } }
  },
  limita(R) { R.cam.x = clamp(R.cam.x, 0, MW * TS); R.cam.y = clamp(R.cam.y, 0, MH * TS); },
  /* ---- gestos sobre el lienzo ---- */
  ptr: new Map(), g: null, pan: null, orb: null,
  bind() {
    const cv = $('#cv'); if (!cv || this.bound) return; this.bound = 1;
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.addEventListener('pointerdown', e => {
      const R = this.ride(); if (!R || Game.paused) return; const p = pos(e); if (e.isPrimary) { this.ptr.clear(); this.g = null; this.pan = null; }   // primer dedo: empieza un gesto nuevo
      if (e.pointerType === 'mouse' && e.button > 0) { this.orb = { id: e.pointerId, x: p.x, y: p.y }; try { cv.setPointerCapture(e.pointerId); } catch (er) { } return; }   // botón derecho o del medio: girar e inclinar
      this.ptr.set(e.pointerId, p);
      if (this.ptr.size === 2) { if (Ctrl.clear) Ctrl.clear(); else Input.joy.on = false; this.pan = null; this.g = this.gesto0(); }
      else if (this.ptr.size === 1 && R.libre && R.libre.on) { this.pan = { id: e.pointerId, x: p.x, y: p.y }; try { cv.setPointerCapture(e.pointerId); } catch (er) { } }
    });
    cv.addEventListener('pointermove', e => {
      const R = this.ride(); if (!R) return; const p = pos(e);
      if (this.orb && e.pointerId === this.orb.id) { this.girar(-(p.x - this.orb.x) / 160); this.inclinar(-(p.y - this.orb.y) / 220); this.orb.x = p.x; this.orb.y = p.y; return; }
      if (!this.ptr.has(e.pointerId)) return; this.ptr.set(e.pointerId, p);
      if (this.g && this.ptr.size >= 2) return this.gesto();
      const P = this.pan; if (P && e.pointerId === P.id && R.libre && R.libre.on) { const d = R.girarDir({ x: p.x - P.x, y: p.y - P.y, m: 1 }), s = View.s || 2; R.cam.x -= d.x / s; R.cam.y -= d.y / s; this.limita(R); P.x = p.x; P.y = p.y; }
    });
    const up = e => { if (this.orb && e.pointerId === this.orb.id) { this.orb = null; Save.save(); } if (!this.ptr.delete(e.pointerId)) return; if (this.g) { this.g = null; Save.save(); } if (this.pan && this.pan.id === e.pointerId) this.pan = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', e => { if (!this.ride()) return; e.preventDefault(); this.zoom(Math.exp(-clamp(e.deltaY, -120, 120) / 600)); this.guardaT(); }, { passive: false });
    window.addEventListener('keydown', e => {
      const R = this.ride(); if (!R || Game.paused || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; const c = e.code;
      if (c === 'Equal' || c === 'NumpadAdd') this.zoom(1.15); else if (c === 'Minus' || c === 'NumpadSubtract') this.zoom(1 / 1.15);
      else if (c === 'KeyZ') this.girar(-Math.PI / 12); else if (c === 'KeyX') this.girar(Math.PI / 12);
      else if (c === 'KeyR') this.inclinar(.12); else if (c === 'KeyF') this.inclinar(-.12);
      else if (c === 'KeyT') { const A = this.angulo(); JE.ui && JE.ui.toast('🎥 ' + A.n); }
      else if (c === 'KeyC') this.libre(R); else if (c === 'KeyN') this.norte(); else if (c === 'KeyG') this.velocidad(Game.mode); else return;
      this.guardaT();
    });
  },
  guardaT() { clearTimeout(this._sv); this._sv = setTimeout(() => Save.save(), 600); },
  gesto0() { const [a, b] = [...this.ptr.values()], C = this.cfg(); return { d0: Math.hypot(b.x - a.x, b.y - a.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), m0: (a.y + b.y) / 2, z0: C.z || 1, r0: C.r || 0, t0: C.t || 0, lock: null, zl: Save.data.settings.zoom | 0 }; },
  /* dos dedos: separar o juntar = zoom; girar = girar la cámara; subir o bajar juntos = inclinar */
  gesto() {
    const G = this.g, [a, b] = [...this.ptr.values()], C = this.cfg(), d = Math.hypot(b.x - a.x, b.y - a.y) || 1, an = Math.atan2(b.y - a.y, b.x - a.x), m = (a.y + b.y) / 2;
    const dz = Math.abs(d - G.d0), da = Math.abs(angDiff(G.a0, an)), dm = m - G.m0;
    if (!G.lock) { if (Math.abs(dm) > 14 && Math.abs(dm) > dz * 1.15 && da < .12) G.lock = 'tilt'; else if (dz > 14 || da > .14) G.lock = 'zr'; }
    if (G.lock === 'tilt') { if (this.d3()) C.t = clamp(G.t0 - dm / 170, 0, 1); return; }
    if (G.lock !== 'zr') return;
    if (this.d3()) { C.z = clamp(G.z0 * d / G.d0, this.ZMIN, this.ZMAX); if (da > .14 || G.rot) { G.rot = 1; C.sigue = 0; C.r = angDiff(0, G.r0 - angDiff(G.a0, an)); if ((C.t || 0) < .28) C.t = clamp(G.t0 + Math.min(.28, da * .85), C.t || 0, .28); } }
    else { const S = Save.data.settings, z = clamp(G.zl + Math.round(Math.log(d / G.d0) / Math.log(1.45)), -1, 2); if (z !== (S.zoom | 0)) { S.zoom = z; View.apply(); } }
  },
  /* ---- botones: ángulo, norte y cámara libre (a la izquierda, a media altura) ---- */
  barra(M) {
    let bar = $('#camBar'); const R = M && M.ride && !M.sub && M.view && M.view.kind === 'map' ? M.ride : null, d3 = this.d3();
    if (!R || R.big || panoOn(R) || M.carry) { if (bar && !bar.hidden) bar.hidden = true; return; }   // con la bici en la mano, los botones de equilibrio van a los lados
    if (!bar) {
      bar = document.createElement('div'); bar.id = 'camBar'; bar.innerHTML = '<button data-cam="vel" aria-label="Velocidad">🚲</button><button data-cam="ang" aria-label="Ángulo de la cámara">🎥</button><button data-cam="norte" aria-label="Mirar al norte" hidden><span>⬆</span></button><button data-cam="libre" aria-label="Cámara libre">📷</button>';
      $('#sGame').appendChild(bar);
      bar.addEventListener('pointerdown', e => e.stopPropagation());
      bar.onclick = e => { const b = e.target.closest('[data-cam]'); if (!b) return; const k = b.dataset.cam, RR = this.ride(); if (!RR) return; Snd.sfx('tap');
        if (k === 'vel') this.velocidad(Game.mode);
        else if (k === 'ang') { const A = this.angulo(); JE.ui && JE.ui.toast('🎥 ' + A.n + (A.sigue ? ': la cámara gira con tu rumbo' : '')); }
        else if (k === 'norte') this.norte(); else if (k === 'libre') this.libre(RR); };
    }
    if (bar.hidden) bar.hidden = false;
    const vb = bar.children[0], fija = !!(M.net || M.id === 'carrera'), V = VELS.find(v => v[0] === velMul(M)) || VELS[1], vt = fija ? '🚲' : '×' + String(V[0]).replace('.', ',');   // el valor a la vista (antes solo un dibujo que se confundía con «Bajarse»)
    if (vb.textContent !== vt) { vb.textContent = vt; vb.setAttribute('aria-label', 'Velocidad: ' + V[1] + ' (' + vt + ')'); vb.classList.toggle('ritmo', !fija); } if (vb.hidden !== fija) vb.hidden = fija;   // en carreras y en red, todos a la misma velocidad
    for (const b of [bar.children[1], bar.children[3]]) if (b.hidden === d3) b.hidden = !d3;   // en pixel clásico no hay ángulos ni cámara libre
    if (!d3) { if (!bar.children[2].hidden) bar.children[2].hidden = true; return; }
    const n = bar.children[2], l = bar.children[3], C = this.cfg(), rot = Math.abs(R.rot || 0) > .05 || C.sigue;
    if (n.hidden === !!rot) n.hidden = !rot; if (rot) { const tr = 'rotate(' + (-(R.rot || 0)).toFixed(3) + 'rad)'; if (n.firstChild.style.transform !== tr) n.firstChild.style.transform = tr; }
    const lb = R.libre && R.libre.on ? '⌖' : '📷'; if (l.textContent !== lb) { l.textContent = lb; l.setAttribute('aria-label', R.libre && R.libre.on ? 'Volver a la bici' : 'Cámara libre'); l.classList.toggle('on', lb === '⌖'); }
  }
};
/* la física primero, la cámara después */
const _upd88 = Ride.prototype.update;
Ride.prototype.update = function (dt, dir) { const L = this.libre; if (L && L.on) dir = { x: 0, y: 0, m: 0 }; _upd88.call(this, dt, dir); Cam.tick(this, dt); };   // en cámara libre la bici se detiene
/* el joystick no arranca en cámara libre (un dedo mueve la cámara) ni con el botón derecho */
const _down88 = Ctrl.down;
Ctrl.down = function (e, cx, cy, cv) { const R = Cam.ride(); if ((R && R.libre && R.libre.on) || (e.pointerType === 'mouse' && e.button > 0) || Cam.ptr.size >= 2) return false; return _down88.call(this, e, cx, cy, cv); };
/* botones en el juego y aviso la primera vez */
const _layout88 = Game.layout;
Game.layout = function (ride) { _layout88.call(this, ride); Cam.barra(this.mode); Cam.lugar(); };
/* dónde van los botones de la cámara: a media altura, pero siempre debajo de los objetivos y encima del control; si no caben en columna (celular acostado), en fila */
Cam.lugar = function () {
  const bar = $('#camBar'); if (!bar || bar.hidden) return;
  const n = [...bar.children].filter(b => !b.hidden).length, bh = n * 42 + (n - 1) * 8, top = (View.top || 60) + 4;
  const bot = Ctrl.pad() && Ctrl.side() === 'izq' ? Ctrl.anchor().y - (40 + 46 * Ctrl.size()) - 8 : View.h - 84, fila = bh > bot - top;
  const ty = Math.round(fila ? top + 21 : clamp(View.h * .46, top + bh / 2, bot - bh / 2)) + 'px', fd = fila ? 'row' : '';
  if (bar.style.top !== ty) bar.style.top = ty; if (bar.style.flexDirection !== fd) bar.style.flexDirection = fd;
};
const _start88 = Game.start;
Game.start = function () {
  const r = _start88.apply(this, arguments); Cam.bind(); View.rotOn = false; View.rot = 0; View.zf = Cam.d3() ? Cam.cfg().z || 1 : 1; View.apply();
  const S = Save.data.settings; if (!JE.headless && Cam.d3() && !(S.seen && S.seen.cam) && this.mode && this.mode.ride) { (S.seen || (S.seen = {})).cam = 1; Save.save(); setTimeout(() => JE.ui && JE.ui.toast('🎥 Nuevo: pellizca para acercar o alejar, gira con dos dedos y súbelos para inclinar la cámara. 📷 mira la ciudad a voluntad.'), 2500); }
  return r;
};
const _stop88 = Game.stop;
Game.stop = function () { const r = _stop88.apply(this, arguments); View.rotOn = false; View.rot = 0; View.zf = 1; const b = $('#camBar'); if (b) b.hidden = true; return r; };
/* Más: la cámara */
const _mas88 = UI.renderMas;
UI.renderMas = function () {
  _mas88.call(this); const z = $('#tab-mas [data-zoom]'); if (!z) return; const row = z.closest('.opt'), C = Cam.cfg();
  const cur = CAM_ANG.find(a => Math.abs(a.t - (C.t || 0)) < .04 && a.sigue === (C.sigue | 0));
  const vc = velMul(null), d = document.createElement('div'); d.innerHTML = `<div class="opt"><span>Velocidad de la bici<br><small class="m">También con el botón 🚲 en el juego (tecla G). El reloj se ajusta: cada viaje cuesta los mismos minutos</small></span><div class="seg wrap">${VELS.map(([v, n2, ic]) => `<button data-vel="${v}" class="${v === vc ? 'on' : ''}">${ic} ${n2}</button>`).join('')}</div></div><div class="opt"><span>Cámara<br><small class="m">Pellizca para acercar, gira con dos dedos y súbelos para inclinar (solo en la ciudad 3D)</small></span><div class="seg wrap">${CAM_ANG.map(a => `<button data-camang="${a.id}" class="${cur && cur.id === a.id ? 'on' : ''}">${a.n}</button>`).join('')}<button data-camang="reset">↺ Normal</button></div></div>`;
  while (d.firstChild) row.parentNode.insertBefore(d.lastChild, row.nextSibling);
  $$('[data-vel]').forEach(b => b.onclick = () => { Save.data.settings.vel = +b.dataset.vel; Save.save(); Snd.sfx('tap'); this.renderMas(); });
  $$('[data-camang]').forEach(b => b.onclick = () => { const k = b.dataset.camang, C = Cam.cfg(); if (k === 'reset') Object.assign(C, { z: 1, t: 0, r: 0, sigue: 0 }); else { const A = CAM_ANG.find(a => a.id === k); C.t = A.t; C.sigue = A.sigue; if (A.id === 'arriba') C.r = 0; } Save.save(); Snd.sfx('tap'); this.renderMas(); });
};
/* pausa: la velocidad también se cambia aquí */
const _pause88 = Game.pause;
Game.pause = function () {
  _pause88.call(this); const go = $('#pGo'), M = this.mode; if (!go || !M || !M.ride || M.net || M.id === 'carrera') return;
  const b = document.createElement('button'); b.className = 'btn'; b.id = 'pVel'; const lbl = () => { const V = VELS.find(v => v[0] === velMul(M)) || VELS[1]; b.textContent = V[2] + ' Velocidad: ' + V[1]; }; lbl(); go.after(b);
  b.onclick = () => { const i = VELS.findIndex(v => v[0] === velMul(M)), V = VELS[(i + 1) % VELS.length]; Save.data.settings.vel = V[0]; Save.save(); Snd.sfx('tap'); lbl(); };
};
/* calidad automática: si en el mapa los cuadros tardan más de 28 ms (mediana de ~2 s), aligera primero el detalle 3D lejano (sin borrar los trozos) y luego la resolución */
const Calidad = JE.calidad = {
  T: [], last: 0, bien: 0, d3: 1,
  cuadro(t) {
    const dt = t - this.last; this.last = t; const M = Game.mode; if (!M || !M.ride || M.sub || Game.paused || JE.headless || !(dt > 0 && dt < 250)) return;
    this.T.push(dt); if (this.T.length < 120) return; const T = this.T.sort((a, b) => a - b), med = T[60]; this.T = [];
    const q = View.calidad || 1, base = Math.min(window.devicePixelRatio || 1, 2);
    if (med > 28) {
      this.bien = 0;
      if (this.d3 > 0) { this.d3 = 0; JE.calidad3D = 0; }
      else if (base > 1.01 && q > .6) { View.calidad = Math.round((q - .2) * 10) / 10; View.resize(); }
    } else if (med < 18) {
      if (++this.bien >= 3) {
        this.bien = 0;
        if (q < 1 && base > 1.01) { View.calidad = Math.round((q + .2) * 10) / 10; View.resize(); }
        else if (this.d3 < 1) { this.d3 = 1; JE.calidad3D = 1; }
      }
    } else this.bien = 0;
  }
};
const _loop88 = Game.loop;
Game.loop = function (t) { Calidad.cuadro(t); return _loop88.call(this, t); };
