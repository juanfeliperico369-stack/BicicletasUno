/* =====================================================================
   VERSIÓN PILOTO: colores para daltonismo, retos con código QR,
   escenas de la historia y Bluetooth (solo en la app de Android).
   ===================================================================== */

/* ---------- colores para daltonismo ----------
   Paleta Okabe-Ito en los juegos de emparejar colores, rojo de alerta cambiado a magenta
   y, además del color, una etiqueta (nombre o número) en cada pareja. */
const CB = () => !!(Save.data && Save.data.settings.cb);
const OKABE = ['#e69f00', '#56b4e9', '#f0e442', '#cc79a7', '#0072b2', '#d55e00'];
const CB_BASE = { cor: PAL.cor, W: WCOL.slice(), K: KCOL.slice(), T: TULA_COL.slice(), F: Object.keys(FAULTS).map(k => FAULTS[k].col) };
function applyCB() {
  const on = CB();
  PAL.cor = on ? '#d6409f' : CB_BASE.cor;
  WCOL.forEach((_, i) => { WCOL[i] = on ? OKABE[i % 6] : CB_BASE.W[i]; });
  KCOL.forEach((_, i) => { KCOL[i] = on ? ['#009e73', '#56b4e9', '#f0e442', '#d55e00'][i] : CB_BASE.K[i]; });
  TULA_COL.forEach((_, i) => { TULA_COL[i] = on ? OKABE[i % 6] : CB_BASE.T[i]; });
  Object.keys(FAULTS).forEach((k, i) => { FAULTS[k].col = on ? OKABE[i % 6] : CB_BASE.F[i]; });
  document.documentElement.style.setProperty('--cor', PAL.cor); document.body.classList.toggle('cb', on); Art.cache.clear();
}
const _mecHud77 = MGMecanico.prototype.hud;
MGMecanico.prototype.hud = function (V) { _mecHud77.call(this, V); const B = this.bike; if (!CB() || !B) return; for (const f of B.faults) if (!f.ok && f.seen) { const h = this.hot(f); V.text(FAULTS[f.k].name, h.x * V.s, h.y * V.s - 16, { size: 11, align: 'center', color: '#0a2342', bg: FAULTS[f.k].col, pad: 3 }); } };
const _cabHud77 = MGCables.prototype.hud;
MGCables.prototype.hud = function (V) { _cabHud77.call(this, V); if (!CB()) return; for (let i = 0; i < this.n; i++) { const l = this.pos(0, i), r = this.pos(1, i); V.text(String(i + 1), (l.x - 16) * V.s, l.y * V.s + 5, { size: 14, align: 'center', color: '#fff' }); V.text(String(this.right[i] + 1), (r.x + 16) * V.s, r.y * V.s + 5, { size: 14, align: 'center', color: '#fff' }); } };

/* ---------- retos con código y QR: la ruta y las reglas viajan en el código ---------- */
const RETO_URL = 'https://juanfeliperico369-stack.github.io/BicicletasUno/';
const Reto = JE.reto = {
  make(c) { const s = (c.seed >>> 0).toString(36).toUpperCase(); return c.k === 'carrera' ? 'RC' + c.n + c.zona[0].toUpperCase() + c.lvl + '-' + s : 'RH' + c.min + '-' + s; },
  parse(txt) {
    let t = String(txt || '').trim(); const u = t.match(/[?&]reto=([0-9A-Za-z-]+)/); if (u) t = u[1]; t = t.toUpperCase();
    let m = t.match(/^RC([1-5])([NCS])([1-3])-([0-9A-Z]{1,7})$/); if (m) return { k: 'carrera', n: +m[1], zona: { N: 'norte', C: 'centro', S: 'sur' }[m[2]], lvl: +m[3], seed: parseInt(m[4], 36) >>> 0 };
    m = t.match(/^RH([1-9])-([0-9A-Z]{1,7})$/); if (m) return { k: 'hojas', min: +m[1], seed: parseInt(m[2], 36) >>> 0 };
    return null;
  },
  url(code) { const own = /^https?:$/.test(location.protocol) && location.hostname !== 'localhost' && !window.Capacitor; return (own ? location.origin + location.pathname : RETO_URL) + '?reto=' + code; },
  desc(c) { return c.k === 'carrera' ? 'Carrera de ' + c.n + (c.n === 1 ? ' postal' : ' postales') + ' en la zona ' + c.zona + ' contra el ' + ['', 'Bot Tranquilo', 'Bot Veloz', 'Bot Turbo'][c.lvl] : 'Cazadores de hojas: ' + c.min + ' minutos'; },
  marca(meta) { const m = meta.marca; if (!m) return 'sin terminar'; if (m.h != null) return m.h + (m.h === 1 ? ' hoja' : ' hojas'); const s = m.t; return Math.floor(s / 60) + ':' + (s % 60).toFixed(1).padStart(4, '0') + (m.won ? ' (le gané al bot)' : ''); },
  play(c) {
    UI.closeModal(); if (Game.mode) Game.stop(); const code = this.make(c);
    if (c.k === 'carrera') Game.start('carrera', c.lvl, { seed: c.seed, nov: NOVEDADES[0], n: c.n, zona: c.zona });
    else Game.start('libre', 1, { seed: c.seed, nov: NOVEDADES[0], comp: { k: 'hojas', min: c.min } });
    Game.meta.desafio = code; Game.meta.dcfg = c;
  }
};
UI.retoVer = function (c, nuevo) {
  const code = Reto.make(c), url = Reto.url(code);
  this.modal(`<h2>${nuevo ? 'Reto creado' : 'Te retaron'}</h2><div class="paper" style="margin:8px 0"><div class="t">${esc(Reto.desc(c))}</div><p style="margin:6px 0 0;font-size:13px">Todos juegan la misma ruta y las mismas reglas. Gana la mejor marca.</p></div>
    <div class="qrbox" id="rQR"></div><p class="pag" style="text-align:center">Código: <b style="font-size:18px;letter-spacing:1px">${esc(code)}</b></p>
    <div class="col"><button class="btn pri" id="rPlay">▶ Jugar el reto</button><div class="row"><button class="btn sm" id="rCopy" style="flex:1">Copiar enlace</button><button class="btn sm" id="rShare" style="flex:1">Compartir</button></div><button class="btn gh" id="mClose">Cerrar</button></div>`, () => {
    try { $('#rQR').appendChild(QR.canvas(url, 3, 3)); } catch (e) { }
    $('#rPlay').onclick = () => Reto.play(c);
    $('#rCopy').onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => this.toast('Enlace copiado ✓')).catch(() => this.toast('Código: ' + code)); };
    $('#rShare').onclick = () => this.share('🚲 Juega EnCicla · Te reto: ' + Reto.desc(c) + '. Código ' + code + ' · ' + url);
  });
};
UI.retoCrear = function () {
  const C = this._retoCfg || (this._retoCfg = { k: 'carrera', n: 3, zona: 'centro', lvl: 2, min: 3 }), seg = (key, opts) => `<div class="seg wrap">${opts.map(([v, n]) => `<button data-rk="${key}" data-rv="${v}" class="${String(C[key]) === String(v) ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  this.modal(`<h2>Crear un reto</h2><p class="m">Elige las reglas. Se genera un código y un QR para que tus amigos jueguen lo mismo, cada uno en su celular y cuando quiera.</p>
    <p class="pag">Tipo de reto</p>${seg('k', [['carrera', 'Carrera de postales'], ['hojas', 'Cazadores de hojas']])}
    ${C.k === 'carrera' ? `<p class="pag">Postales</p>${seg('n', [[1, '1'], [3, '3'], [5, '5']])}<p class="pag">Zona</p>${seg('zona', [['norte', 'Norte'], ['centro', 'Centro'], ['sur', 'Sur']])}<p class="pag">Rival</p>${seg('lvl', [[1, 'Tranquilo'], [2, 'Veloz'], [3, 'Turbo']])}` : `<p class="pag">Duración</p>${seg('min', [[2, '2 min'], [3, '3 min'], [5, '5 min']])}`}
    <div class="col" style="margin-top:12px"><button class="btn pri" id="rGen">Generar código y QR</button><button class="btn gh" id="mClose">Cerrar</button></div>`, () => {
    $$('[data-rk]').forEach(b => b.onclick = () => { const k = b.dataset.rk; C[k] = k === 'k' || k === 'zona' ? b.dataset.rv : +b.dataset.rv; Snd.sfx('tap'); this.retoCrear(); });
    $('#rGen').onclick = () => this.retoVer(Object.assign({}, C, { seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0 }), true);
  });
};
const _multi77 = UI.multi;
UI.multi = function () {
  _multi77.call(this); const b = $('#bCode'); if (!b) return; const old = b.onclick, inp = $('#codeIn'); inp.maxLength = 120; inp.placeholder = 'Ej: RC3C2-K3F9QZ o 2-1-K3F9QZ';
  b.onclick = () => { const c = Reto.parse(inp.value); if (c) return this.retoVer(c); old(); };
  const d = document.createElement('div'); d.className = 'row'; d.style.margin = '8px 0'; d.innerHTML = '<button class="btn sm amb" id="rNew" style="flex:1">＋ Crear reto con QR</button>' + (QR.canScan() ? '<button class="btn sm" id="rScan" style="flex:1">📷 Escanear reto</button>' : '');
  inp.parentNode.insertBefore(d, inp);
  $('#rNew').onclick = () => this.retoCrear(); const sc = $('#rScan'); if (sc) sc.onclick = () => QR.startScan(t => { const c = Reto.parse(t); if (c) this.retoVer(c); else this.toast('Ese QR no es un reto de Juega EnCicla'); }, e => this.toast(e));
  this.btLobby();
};
const _fin77 = Game.finish;
Game.finish = function () { const M = this.mode, meta = this.meta; if (M && meta && meta.desafio) meta.marca = M.id === 'carrera' ? (M.myT != null ? { t: M.myT, won: !!M.won } : null) : { h: M.sc | 0 }; return _fin77.apply(this, arguments); };
const _res77 = UI.result;
UI.result = function (res, meta, prog) {
  _res77.call(this, res, meta, prog);
  if (meta.desafio) {
    const c = meta.dcfg, st = $('#resBody .stat'), d = document.createElement('div'); d.className = 'paper'; d.style.margin = '10px 0';
    d.innerHTML = `<div class="t">Reto ${esc(meta.desafio)}</div><p style="margin:6px 0">${esc(Reto.desc(c))}</p><p style="margin:0 0 8px;font-size:18px"><b>Tu marca: ${esc(Reto.marca(meta))}</b></p><div class="row"><button class="btn sm amb" id="rShareM" style="flex:1">Compartir mi marca</button><button class="btn sm" id="rAgain" style="flex:1">Repetir reto</button></div>`;
    if (st) st.parentNode.insertBefore(d, st); else $('#resBody').appendChild(d);
    $('#rShareM').onclick = () => this.share('🚲 Juega EnCicla · ' + Reto.desc(c) + '. Mi marca: ' + Reto.marca(meta) + '. ¿Me ganas? ' + Reto.url(meta.desafio));
    $('#rAgain').onclick = () => Reto.play(c);
  }
  if (prog && prog.cine) Cine.play(meta.roleId, meta.turno, prog);
};

/* ---------- escenas de la historia: al aprobar un turno por primera vez ---------- */
const _papply77 = Progress.apply;
Progress.apply = function (res, meta, M) {
  const story = !meta.free && !meta.reto && !isMulti(meta.roleId) && !!HISTORIA[meta.roleId], was = story && Historia.done(meta.roleId, meta.turno), out = _papply77.call(this, res, meta, M);
  out.cine = story && !was && Historia.done(meta.roleId, meta.turno); return out;
};
const Cine = JE.cine = {
  el: null,
  actor(roleId) { const C = CAST[roleId], w = roleId !== 'usuario'; return { skin: C[2], hair: C[3], cap: w ? '#ffffff' : C[4] || null, hairStyle: w || C[4] ? 2 : 1, shirt: w ? '#0e2d55' : C[5], vest: w, pants: '#1f2a3a', shoes: '#111', glasses: roleId === 'usuario' ? 1 : 0, cane: false }; },
  next(roleId, turno) { let hit = false; for (const r of ROLES) for (let t = 1; t <= nShifts(r.id); t++) { if (hit && HISTORIA[r.id] && HISTORIA[r.id][t - 1]) return { r, t, H: HISTORIA[r.id][t - 1] }; if (r.id === roleId && t === turno) hit = true; } return null; },
  play(roleId, turno, prog, done) {
    const C = CAST[roleId], H = (HISTORIA[roleId] || [])[turno - 1]; done = done || (() => { });
    if (!C || !H || Save.data.settings.cine === false || JE.headless) return done();
    this.stop(); const nx = this.next(roleId, turno), W = 160, Hh = 90, min = [420, 780, 1110][(turno - 1) % 3], npc = this.actor(roleId), me = Art.me(roleId === 'usuario' ? undefined : { uniforme: true });
    const shots = [
      { who: '', text: 'Capítulo ' + Historia.n(roleId, turno) + ' de ' + Historia.total + ' · ' + H.t, big: true, auto: 3.2, draw: (c, t) => { c.drawImage(Art.panorama(W, Hh, min, 62), 0, 0); prect(c, 0, 62, W, Hh - 62, '#3b4250'); prect(c, 0, 62, W, 2, '#b7b3a6'); prect(c, 0, 64, W, 5, '#5e9a1e'); const x = Math.round(-20 + t * 34); Art.bikeSide(c, x, 71, { r: 5, face: 1, col: PAL.vd }); c.save(); c.translate(x, 66); Art.person(c, 0, 0, me, t * 3, 1); c.restore(); } },
      { who: C[0] + ', ' + C[1], text: H.d, draw: (c, t) => {
        const gy = 66; c.drawImage(Art.panorama(W, Hh, min, gy - 14), 0, 0); prect(c, 0, gy - 14, W, Hh, '#bdb9ab'); for (let x = 0; x < W; x += 8) prect(c, x, gy - 14, 1, Hh, '#b0ac9d');
        prect(c, 96, gy - 44, 60, 4, PAL.vd); prect(c, 100, gy - 40, 2, 40, '#9aa7b8'); prect(c, 150, gy - 40, 2, 40, '#9aa7b8'); for (let i = 0; i < 4; i++) { prect(c, 110 + i * 10, gy - 12, 1, 12, '#59606c'); Art.bikeSide(c, 112 + i * 10, gy - 3, { r: 3, face: 1, col: PAL.vd }); }
        const nxp = Math.round(Math.max(92, 170 - t * 60)), talk = nxp === 92, bob = talk && Math.floor(t * 5) % 2 ? -1 : 0;
        c.save(); c.translate(52, gy + 16); c.scale(2, 2); Art.person(c, 0, 0, me, 0, 1); c.restore();
        c.save(); c.translate(nxp, gy + 16 + bob); c.scale(2, 2); Art.person(c, 0, 0, npc, talk ? 0 : t * 4, -1); c.restore();
      } },
      { who: '', text: prog && prog.unlocks && prog.unlocks.length ? 'Nuevo oficio: ' + prog.unlocks.join(', ') + (nx ? ' · Próximo capítulo: «' + nx.H.t + '»' : '') : nx ? 'Próximo capítulo: «' + nx.H.t + '» · ' + nx.r.name : '¡Completaste la historia! La Gran Rodada te espera.', big: true, auto: 4, draw: (c, t) => Art.cover(c, W, Hh, t + 2) }
    ];
    const el = this.el = document.createElement('div'); el.id = 'cine';
    el.innerHTML = '<canvas width="' + W + '" height="' + Hh + '"></canvas><div class="ctext"><b></b><p></p></div><div class="cbtn"><button class="btn sm pri" id="cineNext">Siguiente ▶</button><button class="btn sm gh" id="cineSkip">Saltar escena</button></div>';
    document.body.appendChild(el); const cv = el.querySelector('canvas'), c = cv.getContext('2d'), wb = el.querySelector('b'), tp = el.querySelector('p'); c.imageSmoothingEnabled = false;
    let i = -1, t0 = 0, shown = 0; const self = this;
    const go = () => { i++; if (i >= shots.length) return fin(); t0 = performance.now(); shown = 0; const s = shots[i]; wb.textContent = s.who; tp.className = s.big ? 'big' : ''; tp.textContent = s.big ? s.text : ''; if (i === 0) Snd.fanfare(); else Snd.sfx('tap'); };
    const fin = () => { self.stop(); Snd.sfx('ok'); done(); };
    const frame = () => {
      if (self.el !== el) return; const s = shots[i], t = (performance.now() - t0) / 1000; c.clearRect(0, 0, W, Hh); try { s.draw(c, t); } catch (e) { JE.errors.push('cine: ' + e.message); return fin(); }
      if (!s.big) { const n = Math.min(s.text.length, Math.floor(t * 38)); if (n !== shown) { shown = n; tp.textContent = '«' + s.text.slice(0, n) + (n >= s.text.length ? '»' : ''); } }
      if (s.auto && t > s.auto) go(); self.raf = requestAnimationFrame(frame);
    };
    el.querySelector('#cineNext').onclick = () => { const s = shots[i]; if (!s.big && shown < s.text.length) { t0 = performance.now() - 60000; return; } go(); };
    el.querySelector('#cineSkip').onclick = fin; cv.onclick = () => el.querySelector('#cineNext').onclick();
    go(); this.raf = requestAnimationFrame(frame);
  },
  stop() { cancelAnimationFrame(this.raf); if (this.el) { this.el.remove(); this.el = null; } }
};
const _hist77 = UI.historia;
UI.historia = function () {
  _hist77.call(this); const D = $$('#mBody details'); let k = 0;
  for (const r of ROLES) for (let t = 1; t <= nShifts(r.id); t++) { if (!HISTORIA[r.id] || !Historia.done(r.id, t)) continue; const d = D[k++]; if (!d) return; const b = document.createElement('button'); b.className = 'btn sm'; b.style.margin = '6px 0'; b.textContent = '🎬 Ver la escena'; b.onclick = () => { const was = Save.data.settings.cine; Save.data.settings.cine = true; Cine.play(r.id, t, null); Save.data.settings.cine = was; }; d.appendChild(b); }
};

/* ---------- Bluetooth entre celulares emparejados (app de Android) ----------
   El anfitrión abre la sala y cada invitado lo elige en su lista de dispositivos emparejados.
   Usa la misma red en estrella de Net: cada conexión se comporta como un canal de datos. */
const BT = JE.bt = {
  chs: {},
  ok() { const C = window.Capacitor; return !!(C && C.nativePromise && C.isNativePlatform && C.isNativePlatform()); },
  call(m, o) { return window.Capacitor.nativePromise('JEBluetooth', m, o || {}); },
  init() { if (this._on) return; this._on = true; window.addEventListener('jeBt', e => { if (e.k === 'open') this.onOpen(e.id | 0, e.name); else if (e.k === 'data') this.onData(e.id | 0, e.d); else if (e.k === 'close') this.onClose(e.id | 0); }); },
  attach(peer, id) {
    const ch = { readyState: 'open', send: s => { this.call('send', { id, data: s }).catch(() => { }); }, close: () => { this.call('close', { id }).catch(() => { }); } };
    this.chs[id] = ch; Net.wire(peer, ch); ch.onopen();
  },
  onOpen(id, name) {
    if (!Net.viaBt) return;
    if (Net.role === 'host') { if (Net.peers.length >= Net.MAX) { this.call('close', { id }).catch(() => { }); return; } const peer = { id: Net.peers.length + 1, open: false, bt: id, btName: name }; Net.peers.push(peer); this.attach(peer, id); }
    else { const peer = { id: 0, open: false, bt: id }; Net.peers = [peer]; this.attach(peer, id); }
  },
  onData(id, d) { const ch = this.chs[id]; if (ch && ch.onmessage) ch.onmessage({ data: d }); },
  onClose(id) { const ch = this.chs[id]; if (!ch) return; ch.readyState = 'closed'; delete this.chs[id]; if (ch.onclose) ch.onclose(); }
};
const _reset77 = Net.reset;
Net.reset = function () { if (this.viaBt) { this.viaBt = false; BT.chs = {}; if (BT.ok()) BT.call('stop').catch(() => { }); } return _reset77.apply(this, arguments); };
UI.btLobby = function () {
  const seg = $('#nLan'), host = $('#nHost'), join = $('#nJoin'); if (!seg || !host) return; this._bt = false;
  const b = document.createElement('button'); b.id = 'nBt'; b.textContent = '🔵 Bluetooth'; seg.appendChild(b);
  $$('[data-lan]', seg).forEach(x => x.addEventListener('click', () => { this._bt = false; b.classList.remove('on'); }));
  b.onclick = () => { if (!BT.ok()) return this.toast('Bluetooth funciona en la app de Android. En la web, usen la misma Wi-Fi o la zona Wi-Fi de un celular.'); this._bt = true; $$('[data-lan]', seg).forEach(x => x.classList.remove('on')); b.classList.add('on'); Snd.sfx('tap'); };
  const h0 = host.onclick, j0 = join.onclick, box = $('#nBox'), fail = e => { box.innerHTML = '<p class="m">' + esc((e && e.message) || 'No se pudo usar el Bluetooth') + '</p>'; };
  host.onclick = () => {
    if (!this._bt) return h0(); BT.init(); Net.reset(); Net.role = 'host'; Net.viaBt = true; this.netPlayers = {}; box.innerHTML = '<p class="m">Abriendo la sala por Bluetooth…</p>';
    BT.call('host').then(r => { this.btName = (r && r.name) || 'este celular'; this.renderLobby(); }).catch(fail);
  };
  join.onclick = () => {
    if (!this._bt) return j0(); BT.init(); box.innerHTML = '<p class="m">Buscando celulares emparejados…</p>';
    BT.call('devices').then(r => {
      const L = (r && r.devices) || []; if (!L.length) return fail({ message: 'No hay celulares emparejados. Emparéjalos primero en Ajustes › Bluetooth del teléfono.' });
      box.innerHTML = '<p class="pag">Elige el celular que creó la sala</p><div class="col">' + L.map((d, i) => `<button class="btn sm" data-bta="${i}">📱 ${esc(d.name || d.address)}</button>`).join('') + '</div>';
      $$('[data-bta]', box).forEach(x => x.onclick = () => {
        const d = L[+x.dataset.bta]; Net.reset(); Net.role = 'guest'; Net.viaBt = true; box.innerHTML = '<p class="m" id="nStat">Conectando con ' + esc(d.name || '') + '…</p><div id="nRoster"></div>';
        BT.call('connect', { address: d.address }).catch(fail);
      });
    }).catch(fail);
  };
};
const _lobby77 = UI.renderLobby;
UI.renderLobby = function () {
  _lobby77.call(this); if (!Net.viaBt || Net.role !== 'host') return; const inv = $('#nInvite'); if (inv) inv.remove();
  const box = $('#nInv'); if (box) box.innerHTML = '<p class="m">🔵 Sala abierta por Bluetooth. Cada amigo toca <b>Unirme</b> con Bluetooth elegido y selecciona <b>' + esc(this.btName || 'este celular') + '</b>. Los celulares deben estar emparejados en Ajustes › Bluetooth.</p>';
};

/* ---------- ajustes del piloto y enlace de reto al abrir ---------- */
const _mas77 = UI.renderMas;
UI.renderMas = function () {
  _mas77.call(this); const z = $('#tab-mas [data-zoom]'); if (!z) return; const row = z.closest('.opt'), S = Save.data.settings, d = document.createElement('div');
  d.innerHTML = `<div class="opt"><span>Colores para daltonismo<br><small class="m">Paleta segura y etiquetas en los juegos de colores</small></span><button class="sw ${S.cb ? 'on' : ''}" data-p77="cb" aria-label="Colores para daltonismo"></button></div>
    <div class="opt"><span>Escenas de la historia<br><small class="m">Una escena corta al aprobar cada turno por primera vez</small></span><button class="sw ${S.cine !== false ? 'on' : ''}" data-p77="cine" aria-label="Escenas de la historia"></button></div>`;
  while (d.firstChild) row.parentNode.insertBefore(d.lastChild, row.nextSibling);
  $$('[data-p77]').forEach(b => b.onclick = () => { const k = b.dataset.p77; S[k] = k === 'cine' ? S.cine === false : !S.cb; Save.save(); b.classList.toggle('on', k === 'cine' ? S.cine !== false : !!S.cb); if (k === 'cb') applyCB(); Snd.sfx('tap'); });
};
const _init77 = UI.init;
UI.init = function () {
  _init77.call(this); if (CB()) applyCB();
  const q = new URLSearchParams(location.search).get('reto'), c = q && Reto.parse(q); if (c) setTimeout(() => this.retoVer(c), 500);
};
